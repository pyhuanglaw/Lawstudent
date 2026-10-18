"""美國交換：校園（SCN-US-02 第二階段）的共用部件——學院哥德式（Collegiate Gothic）石灰岩系館。LAWWW2-C 2026-10-18。
布魯明頓的校園（AA_144 5-4）：老校區是印第安納石灰岩（淺米灰、方整的石塊）、學院哥德式——尖拱窗（兩扇窄長的尖窗＋中間石條＋上面一個圓的花窗）、
扶壁、樓層之間的石頭腰線、很陡的石板瓦屋頂、正中間一座方塔（城垛）、尖拱的木門。**不照任何一棟真的建築**（沒有照片；D77：不放校名、校徽）；
使用者給照片以後照照片改。
  /opt/blenv/bin/python tools/blender/env_second/us_campus_kit.py -- --preview <輸出.png> [--samples 32] [--res 1280x720]
  （或在別的腳本 import us_campus_kit as UK; UK.gothic_hall(root, ...)）
座標：遊戲座標（x 東、y 上、z 南），lib2.Mesh 自己轉 Blender。建築局部：u 沿正面、v 往正面外（正面朝 +v）、y 往上；群組放在 (cx, cz)、轉 yaw。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402

FLOOR_H = 4.2


def materials(prefix='usu_'):
    return {'lime': L.pbr(prefix + 'limestone', 'sandstone_blocks_08', tile=1.6, target='#a89c84', contrast=1.0, normal=0.9, maps=('diff', 'nor'), rough_value=0.88),   # 印第安納石灰岩（第二版 #bfb49c 在太陽下還是太白）：米灰、看得到一塊一塊（第一版 #d6cdb9 太白、像粉刷牆）
            'lime_dark': L.pbr(prefix + 'limestone_plinth', 'large_sandstone_blocks', tile=1.2, target='#b8ae9a', contrast=0.5, normal=0.6, maps=('diff', 'nor'), rough_value=0.9),
            'trim': L.flat(prefix + 'limestone_trim', '#cfc6b1', rough=0.85),
            'slate': L.pbr(prefix + 'slate', 'grey_roof_tiles', tile=1.0, target='#4a4d52', sat=0.1, normal=0.7, maps=('diff', 'nor'), rough_value=0.75),
            'glass': L.flat(prefix + 'window_glass', '#3a4650', rough=0.08, metal=0.35),
            'lead': L.flat(prefix + 'window_lead', '#2c2e30', rough=0.5, metal=0.3),
            'door': L.pbr(prefix + 'oak_door', 'dark_wood', tile=0.8, target='#5a3c24', normal=0.3, maps=('diff', 'nor'), rough_value=0.6),
            'iron': L.flat(prefix + 'iron', '#1e2022', rough=0.45, metal=0.5),
            'copper': L.flat(prefix + 'copper_green', '#6f9a86', rough=0.55, metal=0.25),
            'lamp': L.flat('GLOW_' + prefix + 'lamp', '#fff1d0', rough=0.3, emit=B.srgb('#ffe2a8'))}


def facade_rects(w, h, holes):
    """立面 0～w × 0～h 扣掉洞（[(x0,x1,y0,y1)]）剩下的長方形（和 us_community 同一個做法）"""
    xs = sorted(set([0.0, w] + [v for (a, b, _, _) in holes for v in (a, b)]))
    out = []
    for xa, xb in zip(xs, xs[1:]):
        if xb - xa < 1e-4: continue
        xm = (xa + xb) / 2; cuts = sorted([(y0, y1) for (a, b, y0, y1) in holes if a <= xm <= b])
        cur = 0.0
        for (y0, y1) in cuts:
            if y0 > cur: out.append((xa, xb, cur, y0))
            cur = max(cur, y1)
        if cur < h: out.append((xa, xb, cur, h))
    return out


def arch_pts(x0, x1, ys, n=10):
    """等邊尖拱（半徑＝寬、圓心在兩邊的起拱點）：從左邊起拱點經過拱頂到右邊起拱點；回傳 [(x, y)]、拱頂高"""
    w = x1 - x0; top = ys + w * math.sin(math.radians(60))
    L_ = [(x1 - w * math.cos(math.radians(t)), ys + w * math.sin(math.radians(t))) for t in [k * 60 / n for k in range(n + 1)]]   # 左半：圓心在右起拱點
    R_ = [(x0 + w * math.cos(math.radians(t)), ys + w * math.sin(math.radians(t))) for t in [60 - k * 60 / n for k in range(n + 1)]]
    return L_ + R_[1:], top


class Face:
    """一面牆（局部 2D：沿牆的 a、往上的 y）→ 世界：P(a, y, d)＝牆面上的點往外 d 公尺"""
    def __init__(self, origin, along, normal):
        self.o, self.t, self.n = origin, along, normal   # (u, v) 局部平面
    def P(self, a, y, d=0.0):
        u = self.o[0] + self.t[0] * a + self.n[0] * d; v = self.o[1] + self.t[1] * a + self.n[1] * d
        return (u, y, v)


def poly(m, F, pts2d, d=0.0, flip=False):
    q = [F.P(a, y, d) for (a, y) in pts2d]
    m.quad(q[::-1] if flip else q)


def lancet_window(mk, F, a0, a1, y0, ys, inset=0.22):
    """一扇尖拱窗（a0～a1、窗台 y0、起拱 ys）：牆洞的兩個拱肩補石頭、石頭窗框（往牆裡 inset）、玻璃＋鉛條、中間一根石條分成兩扇窄尖窗、拱頂下一個圓的花窗"""
    w = a1 - a0; ap, top = arch_pts(a0, a1, ys)
    # 拱肩（洞的長方形上角 → 拱）：扇形三角
    for side in (0, 1):
        pts = ap[:len(ap) // 2 + 1] if side == 0 else ap[len(ap) // 2:]
        corner = (a0, top) if side == 0 else (a1, top)
        for p, q in zip(pts, pts[1:]): poly(mk['lime'], F, [corner, p, q] if side == 0 else [p, q, corner])
    # 窗框（洞的側面＝牆厚）：沿拱、兩邊直的側面
    edge = [(a0, y0), (a0, ys)] + ap[1:-1] + [(a1, ys), (a1, y0)]
    for p, q in zip(edge, edge[1:]): mk['trim'].quad([F.P(p[0], p[1], 0.0), F.P(q[0], q[1], 0.0), F.P(q[0], q[1], -inset), F.P(p[0], p[1], -inset)])
    mk['trim'].quad([F.P(a0 - 0.06, y0 - 0.12, 0.06), F.P(a1 + 0.06, y0 - 0.12, 0.06), F.P(a1 + 0.06, y0, 0.06), F.P(a0 - 0.06, y0, 0.06)])   # 窗台
    mk['trim'].quad([F.P(a0 - 0.06, y0, 0.06), F.P(a1 + 0.06, y0, 0.06), F.P(a1, y0, -inset), F.P(a0, y0, -inset)])
    # 玻璃（尖拱形）
    g = [(a0, y0)] + [(a0, ys)] + ap[1:-1] + [(a1, ys), (a1, y0)]
    gm = mk['glass']; vs = [gm.bm.verts.new(g2b(*F.P(x, y, -inset + 0.03))) for (x, y) in g]; gm.bm.faces.new(vs)
    # 中間的石條（mullion）、上面兩個小尖拱（石條和窗框之間）、圓花窗、橫的鉛條
    am = (a0 + a1) / 2; mw = 0.07
    _stone_bar(mk['trim'], F, am - mw, am + mw, y0, ys + w * 0.18, -inset + 0.02, -inset + 0.09)
    for (b0, b1) in ((a0, am - mw), (am + mw, a1)):   # 兩扇窄尖窗的拱（細石條描出來）
        sub, st = arch_pts(b0, b1, ys + w * 0.02, n=6)
        for p, q in zip(sub, sub[1:]): _stone_seg(mk['trim'], F, p, q, 0.035, -inset + 0.02, -inset + 0.09)
    cx, cy, r = am, top - w * 0.28, w * 0.17                                                 # 圓花窗
    ring = [(cx + r * math.cos(t * math.pi / 8), cy + r * math.sin(t * math.pi / 8)) for t in range(17)]
    for p, q in zip(ring, ring[1:]): _stone_seg(mk['trim'], F, p, q, 0.03, -inset + 0.02, -inset + 0.09)
    for k in range(1, 6):                                                                     # 鉛條（小方格）
        yy = y0 + k * (ys - y0) / 6
        for (b0, b1) in ((a0, am - mw), (am + mw, a1)): _stone_seg(mk['lead'], F, (b0, yy), (b1, yy), 0.008, -inset + 0.035, -inset + 0.045)


def _stone_seg(m, F, p, q, hw, d0, d1):
    """2D 線段 p→q 做成寬 2hw、深 d0～d1 的石條"""
    dx, dy = q[0] - p[0], q[1] - p[1]; ln = math.hypot(dx, dy) or 1e-6; nx, ny = -dy / ln * hw, dx / ln * hw
    c = [(p[0] + nx, p[1] + ny), (q[0] + nx, q[1] + ny), (q[0] - nx, q[1] - ny), (p[0] - nx, p[1] - ny)]
    for d in (d0, d1): poly(m, F, c, d, flip=(d == d0))
    for i in range(4):
        a, b = c[i], c[(i + 1) % 4]; m.quad([F.P(a[0], a[1], d0), F.P(b[0], b[1], d0), F.P(b[0], b[1], d1), F.P(a[0], a[1], d1)])


def _stone_bar(m, F, a0, a1, y0, y1, d0, d1):
    _stone_seg(m, F, ((a0 + a1) / 2, y0), ((a0 + a1) / 2, y1), (a1 - a0) / 2, d0, d1)


def rect_window(mk, F, a0, a1, y0, y1, inset=0.22, lights=3):
    """方窗（學院哥德式的下面幾層）：石頭窗框（牆厚）、窗台、上面的滴水線（hood mould，兩端往下折）、石頭直櫺分成 lights 格＋一條橫檔、玻璃＋鉛條"""
    edge = [(a0, y0), (a0, y1), (a1, y1), (a1, y0)]
    for p, q in zip(edge, edge[1:]): mk['trim'].quad([F.P(p[0], p[1], 0.0), F.P(q[0], q[1], 0.0), F.P(q[0], q[1], -inset), F.P(p[0], p[1], -inset)])
    mk['trim'].quad([F.P(a0 - 0.06, y0 - 0.12, 0.06), F.P(a1 + 0.06, y0 - 0.12, 0.06), F.P(a1 + 0.06, y0, 0.06), F.P(a0 - 0.06, y0, 0.06)])
    mk['trim'].quad([F.P(a0 - 0.06, y0, 0.06), F.P(a1 + 0.06, y0, 0.06), F.P(a1, y0, -inset), F.P(a0, y0, -inset)])
    for (p, q) in (((a0 - 0.14, y1 + 0.12), (a1 + 0.14, y1 + 0.12)), ((a0 - 0.14, y1 + 0.12), (a0 - 0.14, y1 - 0.3)), ((a1 + 0.14, y1 + 0.12), (a1 + 0.14, y1 - 0.3))):
        _stone_seg(mk['trim'], F, p, q, 0.06, 0.0, 0.09)
    poly(mk['glass'], F, [(a0, y0), (a1, y0), (a1, y1), (a0, y1)], -inset + 0.03)
    for k in range(1, lights): _stone_bar(mk['trim'], F, a0 + k * (a1 - a0) / lights - 0.06, a0 + k * (a1 - a0) / lights + 0.06, y0, y1, -inset + 0.02, -inset + 0.09)
    yt = y0 + (y1 - y0) * 0.68; _stone_seg(mk['trim'], F, (a0, yt), (a1, yt), 0.05, -inset + 0.02, -inset + 0.09)
    for k in range(1, 7):
        yy = y0 + k * (yt - y0) / 7; _stone_seg(mk['lead'], F, (a0, yy), (a1, yy), 0.008, -inset + 0.035, -inset + 0.045)


def door_arch(mk, F, a0, a1, y0, ys, depth=0.6):
    """尖拱門洞：拱肩補石頭、門洞的側面（深 depth）"""
    ap, top = arch_pts(a0, a1, ys)
    for side in (0, 1):
        pts = ap[:len(ap) // 2 + 1] if side == 0 else ap[len(ap) // 2:]
        corner = (a0, top) if side == 0 else (a1, top)
        for p, q in zip(pts, pts[1:]): poly(mk['lime'], F, [corner, p, q] if side == 0 else [p, q, corner])
    edge = [(a0, y0), (a0, ys)] + ap[1:-1] + [(a1, ys), (a1, y0)]
    for p, q in zip(edge, edge[1:]): mk['lime_dark'].quad([F.P(p[0], p[1], 0.0), F.P(q[0], q[1], 0.0), F.P(q[0], q[1], -depth), F.P(p[0], p[1], -depth)])


def wall_with_windows(mk, F, length, height, wins, thick=0.45):
    """一面牆：wins＝[(a0, a1, y0, ys[, 種類])]——'arch' 尖拱窗（ys＝起拱）、'rect' 方窗（ys＝窗頂）、'door' 尖拱門洞；牆面（有洞）＋每扇窗"""
    holes = []
    for w in wins:
        a0, a1, y0, ys = w[:4]; kind = w[4] if len(w) > 4 else 'arch'
        top = ys if kind == 'rect' else arch_pts(a0, a1, ys)[1]; holes.append((a0, a1, y0, top))
    for (xa, xb, ya, yb) in facade_rects(length, height, holes):
        poly(mk['lime'], F, [(xa, ya), (xb, ya), (xb, yb), (xa, yb)])
    for w in wins:
        a0, a1, y0, ys = w[:4]; kind = w[4] if len(w) > 4 else 'arch'
        if kind == 'rect': rect_window(mk, F, a0, a1, y0, ys)
        elif kind == 'door': door_arch(mk, F, a0, a1, y0, ys)
        else: lancet_window(mk, F, a0, a1, y0, ys)


def gothic_hall(root, name, cx, cz, length=36.0, depth=14.0, floors=3, yaw=0.0, M=None, rng=None, tower=True, sign=None):
    """一棟學院哥德式石灰岩系館：長方形量體（floors 層、每層 4.2 m）、正面每 3.6 m 一跨（扶壁＋兩層尖拱窗）、樓層腰線、石頭基座、
    陡的石板瓦雙坡屋頂（兩端山牆＋山牆上一扇大尖窗）、正面中央方塔（高一層、城垛、尖拱木門＋台階、門兩邊的鐵燈）"""
    M = M or materials(); rng = rng or random.Random(7)
    g = B.group(name, root, {'kind': 'us_gothic_hall'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = {k: Mesh(f'{name}_{k}', M[k]) for k in ('lime', 'lime_dark', 'trim', 'slate', 'glass', 'lead', 'door', 'iron', 'copper', 'lamp')}
    H = floors * FLOOR_H + 0.6; u0, u1, vF, vB = -length / 2, length / 2, depth / 2, -depth / 2
    bay = 3.6; nb = int(length / bay); bays = [u0 + (k + 0.5) * length / nb for k in range(nb)]
    TW = 7.2 if tower else 0.0
    def wins_for(centers, off, skip_tower):
        out = []
        for c in centers:
            a = c - off
            if skip_tower and abs(c) < TW / 2 + 0.2: continue                              # 正面塔的地方另外做
            for f in range(floors):
                y0 = 0.9 + f * FLOOR_H + 0.7
                if f < floors - 1: out.append((a - 1.0, a + 1.0, y0, y0 + 2.3, 'rect'))      # 下面幾層：方窗（三格直櫺）——第一版全是尖拱，像教堂
                else: out.append((a - 0.75, a + 0.75, y0, y0 + 1.9, 'arch'))                  # 最上一層：尖拱
        return out
    Ff = Face((u0, vF), (1, 0), (0, 1)); Fb = Face((u1, vB), (-1, 0), (0, -1))
    Fl = Face((u0, vB), (0, 1), (-1, 0)); Fr = Face((u1, vF), (0, -1), (1, 0))
    wall_with_windows(mk, Ff, length, H, wins_for(bays, u0, tower))
    wall_with_windows(mk, Fb, length, H, wins_for(bays, u0, False))                       # 背面（沿 −u 走，跨的位置對稱）
    sb = [vB + (k + 0.5) * depth / 3 for k in range(3)]
    wall_with_windows(mk, Fl, depth, H, [(c - vB - 0.75, c - vB + 0.75, 0.9 + f * FLOOR_H + 0.7, 0.9 + f * FLOOR_H + 2.6) for c in sb for f in range(floors)])
    wall_with_windows(mk, Fr, depth, H, [(vF - c - 0.75, vF - c + 0.75, 0.9 + f * FLOOR_H + 0.7, 0.9 + f * FLOOR_H + 2.6) for c in sb for f in range(floors)])
    # 基座（深色石塊、往外 8 cm、高 0.9）、樓層腰線、簷口（往外的石頭線腳）、扶壁（每跨之間，往上兩段收進去）
    mk['lime_dark'].box(u0 - 0.08, u1 + 0.08, 0.0, 0.9, vB - 0.08, vF + 0.08)
    for f in range(1, floors + 1):
        y = 0.9 + f * FLOOR_H - 0.3 if f < floors else H - 0.25
        mk['trim'].box(u0 - 0.1, u1 + 0.1, y, y + 0.22, vF - 0.1, vF + 0.12); mk['trim'].box(u0 - 0.1, u1 + 0.1, y, y + 0.22, vB - 0.12, vB + 0.1)
        mk['trim'].box(u0 - 0.12, u0 + 0.1, y, y + 0.22, vB - 0.1, vF + 0.1); mk['trim'].box(u1 - 0.1, u1 + 0.12, y, y + 0.22, vB - 0.1, vF + 0.1)
    for k in range(nb + 1):
        uu = u0 + k * length / nb
        if tower and abs(uu) < TW / 2 + 0.5: continue
        for (vv, s) in ((vF, 1), (vB, -1)):
            for (y0, y1, dd) in ((0.0, H * 0.45, 0.55), (H * 0.45, H * 0.8, 0.35), (H * 0.8, H - 0.3, 0.18)):
                mk['lime'].box(uu - 0.3, uu + 0.3, y0, y1, min(vv, vv + s * dd), max(vv, vv + s * dd))
            mk['trim'].box(uu - 0.33, uu + 0.33, H * 0.45 - 0.08, H * 0.45, min(vv, vv + s * 0.58), max(vv, vv + s * 0.58))
    # 屋頂：陡的雙坡（50°）、石板瓦；兩端山牆（石頭三角）＋山牆頂的石頭壓頂
    pitch = math.radians(50); ov = 0.35; rv = depth / 2 + ov; ridge = H + (depth / 2) * math.tan(pitch)
    for s_ in (1, -1):
        mk['slate'].quad([(u0 - ov, H - ov * math.tan(pitch), s_ * rv), (u1 + ov, H - ov * math.tan(pitch), s_ * rv), (u1 + ov, ridge, 0.0), (u0 - ov, ridge, 0.0)][::(1 if s_ > 0 else -1)])
    mk['copper'].box(u0 - ov, u1 + ov, ridge - 0.05, ridge + 0.12, -0.12, 0.12)
    for uu, sgn in ((u0, -1), (u1, 1)):
        tri = [(uu, H, vF), (uu, H, vB), (uu, ridge, 0.0)]; t_ = tri if sgn > 0 else tri[::-1]
        mk['lime'].bm.faces.new([mk['lime'].bm.verts.new(g2b(*p)) for p in t_])
        for s_ in (1, -1): mk['trim'].quad([(uu - 0.25, H, s_ * (vF + 0.1)), (uu + 0.25, H, s_ * (vF + 0.1)), (uu + 0.25, ridge + 0.2, 0.0), (uu - 0.25, ridge + 0.2, 0.0)][::(1 if s_ > 0 else -1)])
    # 屋頂上的老虎窗（每兩跨一個、小尖頂）
    for c in bays[1::2]:
        if tower and abs(c) < TW / 2 + 1.0: continue
        vv = vF - 1.2; y0 = H - ov * math.tan(pitch) + (vF + ov - vv) * math.tan(pitch)
        mk['lime'].box(c - 0.7, c + 0.7, y0 - 0.6, y0 + 1.3, vv - 0.4, vv + 0.4)
        mk['glass'].box(c - 0.45, c + 0.45, y0 - 0.2, y0 + 1.0, vv + 0.4, vv + 0.42)
        for s_ in (1, -1): mk['slate'].quad([(c - 0.85 * s_, y0 + 1.3, vv + 0.5), (c, y0 + 2.0, vv + 0.5), (c, y0 + 2.0, vv - 0.8), (c - 0.85 * s_, y0 + 1.3, vv - 0.8)][::(1 if s_ > 0 else -1)])
    # 正面中央的方塔：比屋簷高一層、四面石牆、城垛、尖拱木門＋三階台階＋兩盞鐵燈
    if tower:
        tu0, tu1, tv0, tv1 = -TW / 2, TW / 2, vF - 1.0, vF + 1.6; TH = ridge + 3.2   # 塔頂比屋脊高（第一版比屋脊矮）
        Ft = Face((tu0, tv1), (1, 0), (0, 1))
        wall_with_windows(mk, Ft, TW, TH, [(TW / 2 - 1.0, TW / 2 + 1.0, 0.3, 2.5, 'door')] + [(TW / 2 - 1.0, TW / 2 + 1.0, 0.9 + f * FLOOR_H + 0.9, 0.9 + f * FLOOR_H + 2.9) for f in range(1, floors)] + [(TW / 2 - 1.2, TW / 2 + 1.2, H + 1.2, H + 3.6)])   # 門洞（第一版沒開洞，只看得到門框的線）、上面幾層尖窗、塔頂一扇大的
        for (F_, ln) in ((Face((tu0, tv0), (0, 1), (-1, 0)), tv1 - tv0), (Face((tu1, tv1), (0, -1), (1, 0)), tv1 - tv0)):
            poly(mk['lime'], F_, [(0, 0), (ln, 0), (ln, TH), (0, TH)])
        mk['lime'].quad([(tu0, TH, tv0), (tu1, TH, tv0), (tu1, TH, tv1), (tu0, TH, tv1)][::-1])
        mk['lime'].quad([(tu1, H, tv0), (tu0, H, tv0), (tu0, TH, tv0), (tu1, TH, tv0)])
        for (a, b, c, d) in ((tu0, tu1, tv1 - 0.4, tv1), (tu0, tu1, tv0, tv0 + 0.4), (tu0, tu0 + 0.4, tv0, tv1), (tu1 - 0.4, tu1, tv0, tv1)):   # 城垛（一凸一凹）
            n = max(2, int(round(max(b - a, d - c) / 0.9)))
            for k in range(n):
                if k % 2: continue
                if b - a > d - c: mk['trim'].box(a + k * (b - a) / n, a + (k + 1) * (b - a) / n, TH, TH + 0.7, c, d)
                else: mk['trim'].box(a, b, TH, TH + 0.7, c + k * (d - c) / n, c + (k + 1) * (d - c) / n)
        mk['trim'].box(tu0 - 0.08, tu1 + 0.08, TH - 0.2, TH, tv0 - 0.08, tv1 + 0.08)
        # 門：尖拱的深門洞（往裡 0.6 m）、木門兩扇、鐵門環、石頭門框一圈一圈往裡收
        da0, da1, dys = -1.0, 1.0, 2.5; ap, dtop = arch_pts(da0, da1, dys)
        poly(mk['lime_dark'], Ft, [(TW / 2 - 1.6, 0), (TW / 2 + 1.6, 0), (TW / 2 + 1.6, 0.9), (TW / 2 - 1.6, 0.9)], 0.02)
        for k, (inset, grow) in enumerate(((0.0, 0.36), (0.2, 0.24), (0.4, 0.12))):
            ring, _ = arch_pts(da0 - grow, da1 + grow, dys)
            path = [(da0 - grow, 0.3)] + ring + [(da1 + grow, 0.3)]
            for p, q in zip(path, path[1:]): _stone_seg(mk['trim'], Ft, (p[0] + TW / 2, p[1]), (q[0] + TW / 2, q[1]), 0.09, -inset - 0.2, -inset)
        dp = [(da0 + TW / 2, 0.3), (da0 + TW / 2, dys)] + [(x + TW / 2, y) for (x, y) in ap[1:-1]] + [(da1 + TW / 2, dys), (da1 + TW / 2, 0.3)]
        dm = mk['door']; vs = [dm.bm.verts.new(g2b(*Ft.P(x, y, -0.6))) for (x, y) in dp]; dm.bm.faces.new(vs)
        _stone_bar(mk['iron'], Ft, TW / 2 - 0.02, TW / 2 + 0.02, 0.3, dtop - 0.1, -0.58, -0.55)
        for s in (-1, 1): mk['iron'].box(s * 0.25 - 0.06, s * 0.25 + 0.06, 1.3, 1.42, tv1 - 0.55, tv1 - 0.5)
        for k in range(3): mk['lime_dark'].box(-1.8, 1.8, k * 0.1, (k + 1) * 0.1, tv1 + (2 - k) * 0.35 - 0.05, tv1 + (3 - k) * 0.35)   # 台階（往外三階）
        for s in (-1, 1):
            x = s * 1.9; mk['iron'].box(x - 0.04, x + 0.04, 2.0, 2.5, tv1 + 0.02, tv1 + 0.3); mk['iron'].box(x - 0.14, x + 0.14, 2.5, 2.92, tv1 + 0.2, tv1 + 0.48); mk['lamp'].box(x - 0.1, x + 0.1, 2.55, 2.87, tv1 + 0.24, tv1 + 0.44)
        if sign:   # 門上的石刻字牌（空白或一般字：例 'HALL'；D77 不刻真的系館名、校名）
            mk['trim'].box(-1.6, 1.6, dtop + 0.4, dtop + 0.85, tv1, tv1 + 0.06)
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('lime', 'lime_dark', 'slate', 'door')))
    return {'group': g, 'height': H, 'tower_front': vF + 1.6 + 1.05 if tower else vF, 'door_u': 0.0}


if __name__ == '__main__':
    A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    def opt(n, d): return A[A.index(n) + 1] if n in A else d
    OUT = opt('--preview', None)
    B.reset(texres=1024)
    root = B.group('us_campus_kit_preview')
    gothic_hall(root, 'hall_preview', 0.0, 0.0, length=36, depth=14, floors=3)
    gm = Mesh('preview_ground', L.pbr('usu_brick_walk', 'brick_pavement_04', tile=1.5, target='#9a5a44', normal=0.4, maps=('diff', 'nor'), rough_value=0.85), tile=1.5)
    gm.box(-60, 60, -0.05, 0.0, -30, 40); gm.finish(root)
    if OUT:
        sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(opt('--samples', '32'))
        try: sc.cycles.use_denoising = True
        except Exception: pass
        rw, rh = map(int, opt('--res', '1280x720').split('x')); sc.render.resolution_x, sc.render.resolution_y = rw, rh; sc.view_settings.view_transform = 'AgX'
        w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; nt = w.node_tree; bg = nt.nodes['Background']
        sky = nt.nodes.new('ShaderNodeTexSky')
        try: sky.sky_type = 'NISHITA'; sky.sun_elevation = math.radians(38); sky.sun_rotation = math.radians(210)
        except Exception: pass
        nt.links.new(sky.outputs['Color'], bg.inputs['Color']); bg.inputs['Strength'].default_value = 0.3
        lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 3.5; lt.angle = math.radians(1.5); o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(52), 0, math.radians(30))
        cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 28
        from mathutils import Vector
        eye = Vector(g2b(18.0, 1.7, 30.0)); look = Vector(g2b(-2.0, 8.0, 0.0)); cam.location = eye; cam.rotation_euler = (look - eye).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.abspath(OUT); bpy.ops.render.render(write_still=True); print('saved', OUT)
