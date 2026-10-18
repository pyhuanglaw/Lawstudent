"""美國交換：法學院（系館）＋校門的部件（SCN-US-02；使用者 2026-10-18 01:0x 給照片：「我剛剛有給你我的美國法學院的建築…可以照他的外觀去改」）。LAWWW2-C。
照片不放進 repo（第三方照片有版權、也會讓人認出是哪一間學校）；照片的文字描述在 docs/art-rebuild/second_ai/HANDOFF.md「★ 使用者 2026-10-18 01:0x」。
- law_school()：淺米色光面石灰岩（石塊大小不一）；轉角一座約六層樓高的方塔（頂上往內收一層、平屋頂女兒牆），塔正面三層樓高的多邊形凸窗（正面四扇、斜面各一扇、
  每層之間一塊浮雕板）、凸窗底下往下一階一階收的托座＋一塊大浮雕板（**不刻校名、校徽**：抽象花紋）；凸窗下面是略扁的圓弧拱門（線腳一圈圈往裡收、門往裡退、
  木框玻璃雙開門＋扇形氣窗、兩側黑色壁燈）、門前七階台階＋兩條不鏽鋼扶手＋兩側石砌矮牆；東翼兩層（一樓方窗、二樓挑高的長窗）＋城垛女兒牆＋緩坡石板瓦屋頂、
  西翼三層＋城垛女兒牆。窗＝成組的方窗（石頭直櫺、深色鋼窗框、一排小氣窗、橫的窗條）。
- campus_gate()：兩座對稱的石灰岩門樓——各是一座方塔（頂上八角形的小亭：小圓拱窗、八角尖頂、石頭尖飾）＋外側一道尖拱側門＋最外面一根矮石柱；
  兩塔之間是車道寬的開口；塔面黑色壁燈、銅牌（**留白**）。
座標：建築局部 u 沿正面（往東）、v 往正面外（往街）、y 往上；群組放在 (cx, cz)、轉 yaw（正面法線＝(sin yaw, cos yaw)）。
  /opt/blenv/bin/python tools/blender/env_second/us_law_kit.py -- --preview <輸出.png> [--what law|gate] [--samples 32] [--res 1280x720]"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy   # noqa: E402
from us_campus_kit import Face, poly, facade_rects, _stone_seg, _stone_bar   # noqa: E402

FL = 1.05            # 一樓地板（門檻）＝七階台階
RISE, TREAD, NSTEP = 0.15, 0.42, 7


def materials(prefix='usl_'):
    return {'lime': L.pbr(prefix + 'limestone', 'sandstone_blocks_08', tile=1.9, target='#b3a991', contrast=1.35, normal=0.8, maps=('diff', 'nor'), rough_value=0.85),   # 光面石灰岩（照片：淺米色、石塊大小不一、接縫細）
            'trim': L.flat(prefix + 'limestone_trim', '#c1b8a3', rough=0.85),                    # 線腳、窗框、壓頂（比牆面淺一點、沒有石縫）
            'shade': L.flat(prefix + 'limestone_reveal', '#a0977f', rough=0.9),                 # 門洞、深的窗洞側面
            'rubble': L.pbr(prefix + 'rubble_wall', 'japanese_stone_wall', tile=2.2, target='#97928a', contrast=0.9, normal=0.9, maps=('diff', 'nor'), rough_value=0.95),   # 人行道邊的亂石矮擋土牆
            'slate': L.pbr(prefix + 'slate', 'grey_roof_tiles', tile=1.0, target='#4c4f54', sat=0.1, normal=0.7, maps=('diff', 'nor'), rough_value=0.75),
            'glass': L.flat(prefix + 'window_glass', '#262c32', rough=0.08, metal=0.2),
            'frame': L.flat(prefix + 'steel_frame', '#2b2d2c', rough=0.5, metal=0.3),          # 深色鋼窗框、窗條
            'door': L.flat(prefix + 'door_bronze', '#5c4128', rough=0.45, metal=0.2),         # 門框（深褐色木頭／古銅色）
            'iron': L.flat(prefix + 'iron', '#1c1e20', rough=0.45, metal=0.5),
            'steel': L.flat(prefix + 'stainless', '#b9bdc0', rough=0.25, metal=0.6),          # 台階扶手
            'bronze': L.flat(prefix + 'plaque', '#6b5532', rough=0.4, metal=0.55),            # 銅牌（留白，D77）
            'lamp': L.flat('GLOW_' + prefix + 'lamp', '#fff1d0', rough=0.3, emit=B.srgb('#ffe2a8')),
            'dark': L.flat(prefix + 'dark_opening', '#1d1f22', rough=0.9)}                    # 八角亭小窗裡面（看不進去）


# ---------------------------------------------------------------- 共用：拱、窗、稜柱
def arch_ellipse(a0, a1, ys, rise, n=14):
    """略扁的圓弧拱（半橢圓）：左起拱點 → 拱頂 → 右起拱點"""
    m, s = (a0 + a1) / 2, (a1 - a0) / 2
    return [(m - s * math.cos(math.pi * k / n), ys + rise * math.sin(math.pi * k / n)) for k in range(n + 1)]


def arch_pointed(a0, a1, ys, rise, n=8):
    """兩心尖拱（拱高 rise > 半跨）：左起拱點 → 拱頂 → 右起拱點"""
    m, s = (a0 + a1) / 2, (a1 - a0) / 2; d = (rise * rise - s * s) / (2 * s); R = s + d
    ta = math.acos(-d / R)                                     # 左半弧（圓心在中線右邊 d）：角度 π → ta
    left = [(m + d + R * math.cos(math.pi - (math.pi - ta) * k / n), ys + R * math.sin(math.pi - (math.pi - ta) * k / n)) for k in range(n + 1)]
    right = [(2 * m - x, y) for (x, y) in reversed(left)]
    return left + right[1:]


def arch_opening(mk, F, a0, a1, y0, pts, depth, wall='lime', reveal='shade'):
    """牆上一個拱形的洞（洞外框＝a0～a1、y0～拱頂的長方形，牆面由 facade_rects 另外留洞）：補兩個拱肩、洞的側面（往裡 depth）；回傳洞的輪廓（給門、玻璃用）"""
    top = max(y for _, y in pts); mid = len(pts) // 2
    for side in (0, 1):
        seg = pts[:mid + 1] if side == 0 else pts[mid:]
        corner = (a0, top) if side == 0 else (a1, top)
        for p, q in zip(seg, seg[1:]): poly(mk[wall], F, [corner, p, q] if side == 0 else [p, q, corner])
    edge = [(a0, y0)] + pts + [(a1, y0)]
    if depth <= 0: return edge
    for p, q in zip(edge, edge[1:]): mk[reveal].quad([F.P(p[0], p[1], 0.0), F.P(q[0], q[1], 0.0), F.P(q[0], q[1], -depth), F.P(p[0], p[1], -depth)])
    return edge


def _bar(m, F, p, q, hw, d):
    """細的窗框、窗條：只做朝外的一片（2 個三角形；_stone_seg 是 12 個——第一版整棟窗框 4.5 萬個三角形）"""
    dx, dy = q[0] - p[0], q[1] - p[1]; ln = math.hypot(dx, dy) or 1e-6; nx, ny = -dy / ln * hw, dx / ln * hw
    poly(m, F, [(p[0] + nx, p[1] + ny), (q[0] + nx, q[1] + ny), (q[0] - nx, q[1] - ny), (p[0] - nx, p[1] - ny)], d)


def group_window(mk, F, a0, a1, y0, y1, n, inset=0.26, transom=0.74, bars=3, sill=True):
    """成組的方窗：石頭窗洞（牆厚 inset）、窗台、n 扇（石頭直櫺分開，和牆面一樣深）、深色鋼窗框、上面一排小氣窗（transom＝窗高的比例）、每扇 bars 條橫窗條"""
    for p, q in zip([(a0, y0), (a0, y1), (a1, y1), (a1, y0)], [(a0, y1), (a1, y1), (a1, y0), (a0, y0)]):
        mk['shade'].quad([F.P(p[0], p[1], 0.0), F.P(q[0], q[1], 0.0), F.P(q[0], q[1], -inset), F.P(p[0], p[1], -inset)])
    if sill:
        mk['trim'].quad([F.P(a0 - 0.05, y0 - 0.1, 0.05), F.P(a1 + 0.05, y0 - 0.1, 0.05), F.P(a1 + 0.05, y0, 0.05), F.P(a0 - 0.05, y0, 0.05)])
        mk['trim'].quad([F.P(a0 - 0.05, y0, 0.05), F.P(a1 + 0.05, y0, 0.05), F.P(a1, y0, 0.0), F.P(a0, y0, 0.0)])
    poly(mk['glass'], F, [(a0, y0), (a1, y0), (a1, y1), (a0, y1)], -inset + 0.02)
    mw = 0.13; w = (a1 - a0 - (n - 1) * mw) / n
    for k in range(1, n):                                                                       # 石頭直櫺（整個牆厚）
        x = a0 + k * w + (k - 1) * mw
        dm_ = -inset * 0.55                                                                     # 直櫺的面比牆面退一點（斜著看窗才不會只剩細縫）
        for (pa, pb, d) in (((x, y0), (x, y1), 0), ((x + mw, y1), (x + mw, y0), 0)):
            mk['shade'].quad([F.P(pa[0], pa[1], -inset), F.P(pb[0], pb[1], -inset), F.P(pb[0], pb[1], dm_), F.P(pa[0], pa[1], dm_)][::(1 if pa[1] < pb[1] else -1)])
        poly(mk['trim'], F, [(x, y0), (x + mw, y0), (x + mw, y1), (x, y1)], dm_)
    yt = y0 + (y1 - y0) * transom
    for k in range(n):                                                                          # 每一扇：鋼框、氣窗的橫檔、窗條
        xa = a0 + k * (w + mw); xb = xa + w; d0, d1 = -inset + 0.025, -inset + 0.06
        for (p, q) in (((xa + 0.035, y0), (xa + 0.035, y1)), ((xb - 0.035, y0), (xb - 0.035, y1)), ((xa, y0 + 0.035), (xb, y0 + 0.035)), ((xa, y1 - 0.035), (xb, y1 - 0.035))): _bar(mk['frame'], F, p, q, 0.035, d1)
        _bar(mk['frame'], F, (xa, yt), (xb, yt), 0.04, d1)
        for j in range(1, bars + 1):
            yy = y0 + j * (yt - y0) / (bars + 1); _bar(mk['frame'], F, (xa, yy), (xb, yy), 0.012, d1 - 0.01)
        if w > 0.75: _bar(mk['frame'], F, ((xa + xb) / 2, y0), ((xa + xb) / 2, yt), 0.014, d1 - 0.01)


def prism(m, pts, y0, y1, top=True, bottom=True, open_last=False):
    """平面多邊形（局部 (u, v)）往上長成稜柱：側面＋上下蓋；open_last＝最後一邊（貼牆的那一邊）不做"""
    edges = list(zip(pts, pts[1:] + pts[:1]))
    for (a, b) in (edges[:-1] if open_last else edges):
        m.quad([(a[0], y0, a[1]), (b[0], y0, b[1]), (b[0], y1, b[1]), (a[0], y1, a[1])])
    if top: m.quad([(u, y1, v) for (u, v) in pts][::-1]) if len(pts) == 4 else m.bm.faces.new([m.bm.verts.new(g2b(u, y1, v)) for (u, v) in pts[::-1]])
    if bottom: m.quad([(u, y0, v) for (u, v) in pts]) if len(pts) == 4 else m.bm.faces.new([m.bm.verts.new(g2b(u, y0, v)) for (u, v) in pts])


def carved_panel(mk, F, a0, a1, y0, y1, big=False):
    """浮雕板（抽象花紋，**不刻字、不刻校徽**）：往裡凹 3 cm 的框，中間一個菱形＋四瓣花（大的那塊在托座上）"""
    for p, q in zip([(a0, y0), (a0, y1), (a1, y1), (a1, y0)], [(a0, y1), (a1, y1), (a1, y0), (a0, y0)]): _stone_seg(mk['trim'], F, p, q, 0.04, 0.0, 0.035)
    cx, cy = (a0 + a1) / 2, (y0 + y1) / 2; rw, rh = (a1 - a0) * 0.36, (y1 - y0) * 0.34
    dia = [(cx - rw, cy), (cx, cy + rh), (cx + rw, cy), (cx, cy - rh), (cx - rw, cy)]
    for p, q in zip(dia, dia[1:]): _stone_seg(mk['trim'], F, p, q, 0.025, 0.0, 0.03)
    r = min(rw, rh) * (0.42 if big else 0.36)
    for k in range(4):
        t0 = k * math.pi / 2
        lobe = [(cx + r * 0.55 * math.cos(t0) + r * 0.5 * math.cos(t0 + math.pi * (j / 8 - 0.5) * 2), cy + r * 0.55 * math.sin(t0) + r * 0.5 * math.sin(t0 + math.pi * (j / 8 - 0.5) * 2)) for j in range(9)]
        for p, q in zip(lobe, lobe[1:]): _stone_seg(mk['trim'], F, p, q, 0.02, 0.0, 0.03)
    if big:
        ring = [(cx + r * 0.25 * math.cos(t * math.pi / 6), cy + r * 0.25 * math.sin(t * math.pi / 6)) for t in range(13)]
        for p, q in zip(ring, ring[1:]): _stone_seg(mk['trim'], F, p, q, 0.02, 0.0, 0.035)


def wall(mk, F, length, y0, y1, holes, mat='lime'):
    for (xa, xb, ya, yb) in facade_rects(length, y1 - y0, [(a, b, c - y0, d - y0) for (a, b, c, d) in holes]):
        poly(mk[mat], F, [(xa, ya + y0), (xb, ya + y0), (xb, yb + y0), (xa, yb + y0)])


def lantern(mk, F, a, y, out=0.42):
    """黑色鐵壁燈：牆上的座、往外的臂、四面玻璃的燈籠（發光）、尖頂"""
    mk['iron'].quad([F.P(a - 0.1, y - 0.25, 0.02), F.P(a + 0.1, y - 0.25, 0.02), F.P(a + 0.1, y + 0.25, 0.02), F.P(a - 0.1, y + 0.25, 0.02)])
    _stone_seg(mk['iron'], F, (a, y + 0.12), (a, y + 0.16), 0.03, 0.0, out)
    p0 = F.P(a, y - 0.3, out)
    u, yy, v = p0; n = F.n; t = F.t
    def Q(du, dy, dv): return (u + t[0] * du + n[0] * dv, yy + dy, v + t[1] * du + n[1] * dv)
    for (du0, du1, dv0, dv1) in ((-0.16, 0.16, -0.16, 0.16),):
        mk['iron'].box(*sorted((Q(du0, 0, dv0)[0], Q(du1, 0, dv1)[0])), yy - 0.05, yy, *sorted((Q(du0, 0, dv0)[2], Q(du1, 0, dv1)[2])))
        mk['lamp'].box(*sorted((Q(-0.13, 0, -0.13)[0], Q(0.13, 0, 0.13)[0])), yy, yy + 0.42, *sorted((Q(-0.13, 0, -0.13)[2], Q(0.13, 0, 0.13)[2])))
        for su in (-1, 1):
            for sv in (-1, 1):
                c = Q(su * 0.15, 0, sv * 0.15); mk['iron'].box(c[0] - 0.02, c[0] + 0.02, yy, yy + 0.44, c[2] - 0.02, c[2] + 0.02)
        mk['iron'].cyl((u, yy + 0.44, v), (u, yy + 0.66, v), 0.21, seg=4, r2=0.03)


# ---------------------------------------------------------------- 法學院
def law_school(root, name, cx, cz, yaw=0.0, M=None, rng=None):
    """回傳 {'group', 'steps_foot_v', 'door_v', 'blocks_local': [(u0,u1,v0,v1,why)]}；局部 v＝0 是塔的正面"""
    M = M or materials(); rng = rng or random.Random(3)
    g = B.group(name, root, {'kind': 'us_law_school'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = {k: Mesh(f'{name}_{k}', M[k]) for k in M}
    blocks = []
    # ---- 尺寸
    TU, TV0, TV1 = 6.0, -14.0, 0.0                       # 方塔（12 × 14 m：背面和兩翼的背面對齊）
    HT, HT2, HT3 = 22.6, 25.2, 26.0                      # 塔身頂、頂層（四邊各收 0.6）、頂層正中間的女兒牆
    FH = 3.8                                              # 塔的樓高
    EU0, EU1, EV0, EV1 = TU, 44.0, -14.0, -2.0           # 東翼（兩層：一樓 4.2、二樓挑高 5.6）
    EH = FL + 4.2 + 5.6; EP = EH + 0.75                  # 簷口、女兒牆頂
    WU0, WU1, WV0, WV1 = -36.0, -TU, -14.0, -5.0         # 西翼（三層、正面往後退 5 m：塔的西面露出來）
    WFH = 3.9; WH = FL + 3 * WFH; WP = WH + 0.75
    # ---- 塔：正面（v＝0）——門、凸窗兩邊的窄窗、凸窗上面一組三扇
    Ff = Face((-TU, TV1), (1, 0), (0, 1)); A = lambda u: u + TU   # noqa: E731  局部 u → 正面的 a
    door_a0, door_a1, door_ys, door_rise = A(-1.6), A(1.6), FL + 2.45, 1.05
    outer = arch_ellipse(door_a0 - 0.45, door_a1 + 0.45, door_ys, door_rise + 0.45)
    otop = door_ys + door_rise + 0.45
    tf_holes = [(door_a0 - 0.45, door_a1 + 0.45, FL, otop)]
    side_w = []
    for f in range(1, 5):
        y0 = FL + f * FH + 0.85
        for uc in (-4.1, 4.1): side_w.append((A(uc) - 0.5, A(uc) + 0.5, y0, y0 + 2.2))
    top3 = (A(-1.7), A(1.7), 18.6, 20.9)
    tf_holes += side_w + [top3]
    wall(mk, Ff, 2 * TU, 0.0, HT, tf_holes)
    for (a0, a1, y0, y1) in side_w: group_window(mk, Ff, a0, a1, y0, y1, 1, inset=0.3)
    group_window(mk, Ff, *top3, 3, inset=0.3)
    # 門：洞外框（一圈喇叭口的石頭線腳，從外框收到門洞）→ 門洞（往裡 0.9）→ 門（木框玻璃雙開門＋扇形氣窗）
    arch_opening(mk, Ff, door_a0 - 0.45, door_a1 + 0.45, FL, outer, 0.0)   # 只補拱肩（側面另外做喇叭口）
    inner = arch_ellipse(door_a0, door_a1, door_ys, door_rise)
    ring_o = [(door_a0 - 0.45, FL)] + outer + [(door_a1 + 0.45, FL)]; ring_i = [(door_a0, FL)] + inner + [(door_a1, FL)]
    for (p, q), (pi, qi) in zip(zip(ring_o, ring_o[1:]), zip(ring_i, ring_i[1:])):     # 喇叭口：外框（牆面）→ 門洞（往裡 0.45）
        mk['trim'].quad([Ff.P(p[0], p[1], 0.0), Ff.P(q[0], q[1], 0.0), Ff.P(qi[0], qi[1], -0.45), Ff.P(pi[0], pi[1], -0.45)])
    for k, gr in enumerate((0.3, 0.15)):                                                 # 兩圈線腳（凸出的圓條）
        rg = [(door_a0 - gr, FL)] + arch_ellipse(door_a0 - gr, door_a1 + gr, door_ys, door_rise + gr) + [(door_a1 + gr, FL)]
        d_ = -(0.45 - gr)                                                                # 線腳貼在喇叭口上
        for p, q in zip(rg, rg[1:]): _stone_seg(mk['trim'], Ff, p, q, 0.05, d_ - 0.02, d_ + 0.06)
    for p, q in zip(ring_i, ring_i[1:]): mk['shade'].quad([Ff.P(p[0], p[1], -0.45), Ff.P(q[0], q[1], -0.45), Ff.P(q[0], q[1], -0.9), Ff.P(p[0], p[1], -0.9)])
    dpts = [(door_a0, FL)] + inner + [(door_a1, FL)]
    dm = mk['door']; dm.bm.faces.new([dm.bm.verts.new(g2b(*Ff.P(x, y, -0.9))) for (x, y) in dpts])
    def gl(a0, a1, y0, y1): poly(mk['glass'], Ff, [(a0, y0), (a1, y0), (a1, y1), (a0, y1)], -0.885)
    for (a0, a1) in ((A(-1.12), A(-0.1)), (A(0.1), A(1.12))): gl(a0 + 0.1, a1 - 0.1, FL + 0.32, FL + 2.18)          # 兩扇門的玻璃
    for (a0, a1) in ((A(-1.5), A(-1.22)), (A(1.22), A(1.5))): gl(a0, a1, FL + 0.3, FL + 2.2)                         # 兩側的窄玻璃
    tr = [(x, max(y, door_ys + 0.08)) for (x, y) in arch_ellipse(door_a0 + 0.1, door_a1 - 0.1, door_ys + 0.08, door_rise - 0.12)]
    tg = mk['glass']; tg.bm.faces.new([tg.bm.verts.new(g2b(*Ff.P(x, y, -0.885))) for (x, y) in tr])                # 扇形氣窗
    for k in range(1, 6):
        t = math.pi * k / 6; _stone_seg(mk['door'], Ff, (A(0), door_ys + 0.08), (A(0) - 1.5 * math.cos(t), door_ys + 0.08 + (door_rise - 0.12) * math.sin(t)), 0.03, -0.885, -0.86)
    _stone_seg(mk['door'], Ff, (door_a0, door_ys), (door_a1, door_ys), 0.07, -0.9, -0.86)
    for s in (-1, 1): _stone_seg(mk['frame'], Ff, (A(s * 0.25), FL + 1.0), (A(s * 0.25), FL + 1.3), 0.02, -0.88, -0.8)   # 門把
    mk['shade'].quad([Ff.P(door_a0, FL, -0.9), Ff.P(door_a1, FL, -0.9), Ff.P(door_a1, FL, -0.02), Ff.P(door_a0, FL, -0.02)][::-1])  # 門洞的地
    for s in (-1, 1): lantern(mk, Ff, A(s * 2.75), FL + 2.9)
    # 凸窗（三層）＋托座＋上面的蓋：平面 正面 u −1.6～1.6（v＝1.0）、斜面到 u ±2.6（v＝0）
    OY0, OF, ON = 6.3, 3.8, 3; OY1 = OY0 + OF * ON
    plan = [(-2.6, 0.0), (-1.6, 1.0), (1.6, 1.0), (2.6, 0.0)]
    faces = [(plan[0], plan[1], 1), (plan[1], plan[2], 4), (plan[2], plan[3], 1)]
    for (p, q, nl) in faces:
        ln = math.hypot(q[0] - p[0], q[1] - p[1]); t = ((q[0] - p[0]) / ln, (q[1] - p[1]) / ln); n = (-t[1], t[0])   # 凸窗從左往右繞（順時針）：外面在左手邊
        F_ = Face(p, t, n); holes = []
        for f in range(ON):
            y0 = OY0 + f * OF + 1.05; y1 = OY0 + (f + 1) * OF - 0.25
            holes.append((0.18, ln - 0.18, y0, y1))
        wall(mk, F_, ln, OY0, OY1, holes)
        for (a0, a1, y0, y1) in holes: group_window(mk, F_, a0, a1, y0, y1, nl, inset=0.16, transom=0.8, bars=2, sill=False)
        for f in range(ON):                                                                      # 每層窗下的浮雕板
            y0 = OY0 + f * OF
            if nl == 4: carved_panel(mk, F_, 0.4, ln - 0.4, y0 + 0.2, y0 + 0.85, big=(f == 0))
            _stone_seg(mk['trim'], F_, (0.0, y0 + 1.0), (ln, y0 + 1.0), 0.05, 0.0, 0.07)            # 窗台那一條線腳
    for (y0, y1, k) in ((OY0 - 0.3, OY0, 1.0), (OY0 - 0.6, OY0 - 0.3, 0.72), (OY0 - 0.9, OY0 - 0.6, 0.45), (OY0 - 1.15, OY0 - 0.9, 0.2)):   # 托座：往下一階一階收
        pl = [(u * (0.62 + 0.38 * k), v * k) for (u, v) in plan]
        prism(mk['trim'], pl[::-1], y0, y1, top=False, open_last=True)
    capp = [(-2.75, 0.0), (-1.68, 1.12), (1.68, 1.12), (2.75, 0.0)]
    prism(mk['trim'], capp[::-1], OY1, OY1 + 0.35, bottom=True, open_last=True)                                 # 凸窗頂的蓋（女兒牆）
    # 塔的兩側（u＝±TU）：西面整面露出來（西翼往後退）、東面被東翼擋住的地方留洞
    Fe = Face((TU, TV1), (0, -1), (1, 0)); Fw = Face((-TU, TV0), (0, 1), (-1, 0)); Fb = Face((TU, TV0), (-1, 0), (0, -1))
    def tower_side(F_, ln, cover, acs):
        holes = [cover] if cover else []; wins = []
        for f in range(0, 5):
            y0 = FL + f * FH + 0.85
            for ac in acs:
                w_ = (ac - 1.0, ac + 1.0, y0, y0 + 2.3)
                if cover and not (w_[1] < cover[0] or w_[0] > cover[1] or w_[3] < cover[2] or w_[2] > cover[3]): continue
                wins.append(w_)
        wall(mk, F_, ln, 0.0, HT, holes + wins)
        for w_ in wins: group_window(mk, F_, *w_, 2, inset=0.3)
    D = TV1 - TV0
    tower_side(Fe, D, (2.0, D, 0.0, EP), (4.0, 10.0))                                             # 東翼接在 v −14～−2（a 2～14）：東翼屋頂以上才有窗
    tower_side(Fw, D, (0.0, 9.0, 0.0, WP), (4.5, 11.5))                                           # 西翼接在 v −14～−5（a 0～9）：靠街的那一段（a 9～14）每層都有窗
    tower_side(Fb, 2 * TU, None, (3.0, 9.0))
    # 塔頂：簷口、往內收的頂層（四面兩扇窄窗）、頂層正中間的女兒牆、平屋頂
    for (a, b, c, d) in ((-TU - 0.12, TU + 0.12, TV0 - 0.12, TV1 + 0.12),):
        mk['trim'].box(a, b, HT - 0.35, HT, c, d); mk['trim'].box(a + 0.1, b - 0.1, HT, HT + 0.12, c + 0.1, d - 0.1)
    i0 = 0.6; U0, U1, V0, V1 = -TU + i0, TU - i0, TV0 + i0, TV1 - i0
    for (F_, ln) in ((Face((U0, V1), (1, 0), (0, 1)), U1 - U0), (Face((U1, V1), (0, -1), (1, 0)), V1 - V0), (Face((U1, V0), (-1, 0), (0, -1)), U1 - U0), (Face((U0, V0), (0, 1), (-1, 0)), V1 - V0)):
        ws = [(ln / 2 - 1.6, ln / 2 - 1.0, HT + 0.6, HT + 2.2), (ln / 2 + 1.0, ln / 2 + 1.6, HT + 0.6, HT + 2.2)]
        wall(mk, F_, ln, HT, HT2, ws)
        for w_ in ws: group_window(mk, F_, *w_, 1, inset=0.25, transom=0.85, bars=2)
        poly(mk['lime'], F_, [(ln / 2 - 2.4, HT2), (ln / 2 + 2.4, HT2), (ln / 2 + 2.4, HT3), (ln / 2 - 2.4, HT3)])   # 正中間高起來的女兒牆
        mk['trim'].quad([F_.P(ln / 2 - 2.45, HT3, 0.06), F_.P(ln / 2 + 2.45, HT3, 0.06), F_.P(ln / 2 + 2.45, HT3 + 0.18, 0.06), F_.P(ln / 2 - 2.45, HT3 + 0.18, 0.06)])
    mk['trim'].box(U0 - 0.1, U1 + 0.1, HT2 - 0.05, HT2 + 0.15, V0 - 0.1, V1 + 0.1)
    for (F_, ln) in ((Face((U0, V1), (1, 0), (0, 1)), U1 - U0), (Face((U1, V0), (-1, 0), (0, -1)), U1 - U0), (Face((U1, V1), (0, -1), (1, 0)), V1 - V0), (Face((U0, V0), (0, 1), (-1, 0)), V1 - V0)):
        mk['lime'].quad([F_.P(ln / 2 + 2.4, HT2, -0.3), F_.P(ln / 2 - 2.4, HT2, -0.3), F_.P(ln / 2 - 2.4, HT3, -0.3), F_.P(ln / 2 + 2.4, HT3, -0.3)])   # 女兒牆背面
        mk['trim'].quad([F_.P(ln / 2 - 2.4, HT3, 0.0), F_.P(ln / 2 + 2.4, HT3, 0.0), F_.P(ln / 2 + 2.4, HT3, -0.3), F_.P(ln / 2 - 2.4, HT3, -0.3)])
    for (a, b) in ((-TU - 0.08, -2.05), (2.05, TU + 0.08)): mk['trim'].box(a, b, 0.0, FL + 0.15, TV1 - 0.2, TV1 + 0.08)   # 塔正面的基座（門口留開）
    mk['trim'].box(-TU - 0.08, TU + 0.08, 0.0, FL + 0.15, TV0 - 0.08, TV1 - 0.2)
    # ---- 台階（七階）＋門前平台＋兩側石砌矮牆＋兩條不鏽鋼扶手
    vL = 0.6; foot = vL + (NSTEP - 1) * TREAD
    SW, CW = 3.6, 4.4                                                                               # 台階半寬、兩側矮牆外緣（第二版：照片的台階幾乎和塔一樣寬；第一版 2.4 太窄）
    mk['trim'].box(-SW, SW, 0.0, FL, -0.02, vL)
    for k in range(1, NSTEP):
        mk['trim'].box(-SW, SW, 0.0, k * RISE, vL + (NSTEP - 1 - k) * TREAD, vL + (NSTEP - k) * TREAD)
    for s in (-1, 1):
        u0, u1 = sorted((s * SW, s * CW))
        mk['lime'].box(u0, u1, 0.0, FL + 0.85, -0.02, 1.8); mk['trim'].box(u0 - 0.05, u1 + 0.05, FL + 0.85, FL + 0.97, -0.02, 1.85)
        mk['lime'].box(u0, u1, 0.0, 1.15, 1.8, foot + 0.25); mk['trim'].box(u0 - 0.05, u1 + 0.05, 1.15, 1.27, 1.8, foot + 0.3)
        x = s * 1.0
        for (v, y) in ((0.35, FL), (foot - 0.15, 0.15)): mk['steel'].cyl((x, y, v), (x, y + 0.92, v), 0.025, seg=8)
        mk['steel'].cyl((x, FL + 0.92, 0.35), (x, 0.15 + 0.92, foot - 0.15), 0.025, seg=8)
        mk['steel'].cyl((x, 1.07, foot - 0.15), (x, 1.07, foot + 0.15), 0.025, seg=8); mk['steel'].cyl((x, 1.07, foot + 0.15), (x, 0.0, foot + 0.15), 0.025, seg=8)
        mk['steel'].cyl((x, FL + 0.92, 0.35), (x, FL + 0.92, 0.05), 0.025, seg=8)
    blocks.append((-TU - 0.2, TU + 0.2, TV0 - 0.2, TV1 + 0.1, 'law tower'))
    blocks.append((-CW - 0.1, CW + 0.1, TV1, foot - 0.35, 'law steps（台階上半；門口互動點在台階下）'))
    # ---- 東翼：兩層（一樓方窗、二樓挑高長窗）、城垛女兒牆、緩坡石板瓦屋頂
    def wing(u0, u1, v0, v1, H, P, rows, bay):
        nb = max(1, int(round((u1 - u0) / bay))); bw = (u1 - u0) / nb
        Fwf = Face((u0, v1), (1, 0), (0, 1)); Fwb = Face((u1, v0), (-1, 0), (0, -1))
        ends = []
        if u1 > TU + 0.1: ends.append((Face((u1, v1), (0, -1), (1, 0)), v1 - v0))
        if u0 < -TU - 0.1: ends.append((Face((u0, v0), (0, 1), (-1, 0)), v1 - v0))
        for (F_, ln, nbays) in [(Fwf, u1 - u0, nb), (Fwb, u1 - u0, nb)] + [(F_, l_, max(1, int(round(l_ / bay)))) for (F_, l_) in ends]:
            bw_ = ln / nbays; ws = []
            for k in range(nbays):
                c = (k + 0.5) * bw_
                for (y0, y1, hw, n) in rows: ws.append((c - hw, c + hw, y0, y1, n))
            wall(mk, F_, ln, 0.0, P, [w_[:4] for w_ in ws])
            for w_ in ws: group_window(mk, F_, *w_[:4], w_[4], transom=0.78 if w_[3] - w_[2] < 3 else 0.62, bars=3 if w_[3] - w_[2] < 3 else 4)
            # 腰線、簷口、城垛（女兒牆上一凸一凹）
            for (y, hh) in ((FL + 0.0, 0.15), (rows[0][1] + 0.55, 0.14), (H, 0.22)):
                mk['trim'].quad([F_.P(0, y, 0.07), F_.P(ln, y, 0.07), F_.P(ln, y + hh, 0.07), F_.P(0, y + hh, 0.07)])
                mk['trim'].quad([F_.P(0, y + hh, 0.07), F_.P(ln, y + hh, 0.07), F_.P(ln, y + hh, 0.0), F_.P(0, y + hh, 0.0)])
            nm_ = int(ln / 1.3)
            for j in range(nm_):
                a = (j + 0.5) * ln / nm_                                                         # 城垛：小小的、密一點（照片）
                mk['trim'].box(*sorted((F_.P(a - 0.32, 0, 0.04)[0], F_.P(a + 0.32, 0, -0.35)[0])), P, P + 0.3, *sorted((F_.P(a - 0.32, 0, 0.04)[2], F_.P(a + 0.32, 0, -0.35)[2])))
            mk['trim'].quad([F_.P(0, P, 0.04), F_.P(ln, P, 0.04), F_.P(ln, P, -0.35), F_.P(0, P, -0.35)][::-1])
        mk['trim'].box(u0, u1, 0.0, FL + 0.15, v0 - 0.08, v1 + 0.08)
        return nb
    wing(EU0, EU1, EV0, EV1, EH, EP, [(FL + 0.9, FL + 3.3, 1.55, 5), (FL + 4.2 + 0.7, FL + 4.2 + 4.9, 1.6, 5)], 4.75)
    rv = (EV1 - EV0) / 2 - 0.4; ridge = EP + 2.6; vc = (EV0 + EV1) / 2                            # 東翼的屋頂（照片：女兒牆後面一片緩坡的深灰石板瓦）
    for s_ in (1, -1): mk['slate'].quad([(EU0, EP - 0.3, vc + s_ * rv), (EU1 - 0.4, EP - 0.3, vc + s_ * rv), (EU1 - 0.4 - rv, ridge, vc), (EU0, ridge, vc)][::(1 if s_ > 0 else -1)])   # 西端頂著塔的牆
    mk['slate'].bm.faces.new([mk['slate'].bm.verts.new(g2b(*p)) for p in ((EU1 - 0.4, EP - 0.3, vc + rv), (EU1 - 0.4, EP - 0.3, vc - rv), (EU1 - 0.4 - rv, ridge, vc))])
    blocks.append((EU0, EU1 + 0.2, EV0 - 0.2, EV1 + 0.2, 'law east wing'))
    wing(WU0, WU1, WV0, WV1, WH, WP, [(FL + f * WFH + 0.85, FL + f * WFH + 3.05, 1.35, 4) for f in range(3)], 4.3)
    mk['lime'].quad([(WU0, WP - 0.6, WV1), (WU1, WP - 0.6, WV1), (WU1, WP - 0.6, WV0), (WU0, WP - 0.6, WV0)][::-1])
    mk['lime'].quad([(EU0, EP - 0.6, EV1), (EU1, EP - 0.6, EV1), (EU1, EP - 0.6, EV0), (EU0, EP - 0.6, EV0)][::-1])
    blocks.append((WU0 - 0.2, WU1, WV0 - 0.2, WV1 + 0.2, 'law west wing'))
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('lime', 'rubble', 'slate')))
    return {'group': g, 'steps_foot_v': foot, 'door_v': -0.9, 'blocks_local': blocks, 'height': HT3}


# ---------------------------------------------------------------- 校門（雙門樓）
def campus_gate(root, name, cx, cz, yaw=0.0, M=None):
    """回傳 {'group', 'blocks_local'}；局部 u＝0 是中間開口的中線、v＝0 是門樓的中線（正面朝 +v＝往街）"""
    M = M or materials()
    g = B.group(name, root, {'kind': 'us_campus_gate'}); g.location = (cx, -cz, 0.0); g.rotation_euler = (0.0, 0.0, yaw)
    mk = {k: Mesh(f'{name}_{k}', M[k]) for k in M}
    blocks = []
    OPEN, TWR, SPAN, PIER = 3.6, 2.2, 3.2, 1.2      # 半開口、塔寬（第二版 2.2：照片的塔比較細）、側門跨距、外側石柱寬
    SH, CH = 8.4, 8.85                               # 塔身頂、簷口頂
    for s in (-1, 1):
        u0, u1 = sorted((s * OPEN, s * (OPEN + TWR))); v0, v1 = -TWR / 2, TWR / 2
        # 塔身：基座、腰線（3.2）、塔身往上收 5 cm、簷口＋下面一排小托石
        mk['trim'].box(u0 - 0.1, u1 + 0.1, 0.0, 0.6, v0 - 0.1, v1 + 0.1)
        mk['lime'].box(u0, u1, 0.0, 3.2, v0, v1); mk['trim'].box(u0 - 0.07, u1 + 0.07, 3.2, 3.4, v0 - 0.07, v1 + 0.07)
        mk['lime'].box(u0, u1, 3.4, SH, v0, v1)
        for (a, b, c, d) in ((u0, u1, v1 - 0.06, v1 + 0.12), (u0, u1, v0 - 0.12, v0 + 0.06), (u0 - 0.12, u0 + 0.06, v0, v1), (u1 - 0.06, u1 + 0.12, v0, v1)):
            n = 6
            for k in range(n):
                if b - a > d - c: x = a + (k + 0.5) * (b - a) / n; mk['trim'].box(x - 0.08, x + 0.08, SH - 0.32, SH, c, d)
                else: z = c + (k + 0.5) * (d - c) / n; mk['trim'].box(a, b, SH - 0.32, SH, z - 0.08, z + 0.08)
        mk['trim'].box(u0 - 0.18, u1 + 0.18, SH, CH, v0 - 0.18, v1 + 0.18)
        # 正面（往街）兩道細長的盲窗（尖拱的淺凹槽）、銅牌（留白）
        Fs = Face((u0, v1), (1, 0), (0, 1))
        for ac in (TWR / 2,):
            pts = [(ac - 0.28, 4.4)] + arch_pointed(ac - 0.28, ac + 0.28, 6.9, 0.4) + [(ac + 0.28, 4.4)]
            for p, q in zip(pts, pts[1:]): _stone_seg(mk['trim'], Fs, p, q, 0.04, 0.0, 0.05)
            mk['dark'].quad([Fs.P(ac - 0.22, 4.45, 0.005), Fs.P(ac + 0.22, 4.45, 0.005), Fs.P(ac + 0.22, 6.85, 0.005), Fs.P(ac - 0.22, 6.85, 0.005)])
        mk['bronze'].box(*sorted((Fs.P(TWR / 2 - 0.35, 0, 0)[0], Fs.P(TWR / 2 + 0.35, 0, 0)[0])), 1.75, 2.25, v1, v1 + 0.03)
        # 往開口那一面的壁燈（照片：黑色燈籠掛在塔面）
        Fi = Face((s * OPEN, -s * TWR / 2), (0, s), (-s, 0))
        lantern(mk, Fi, TWR / 2, 3.9, out=0.38)
        # 八角亭：八角鼓座（每面一個小圓拱窗、角上小圓柱）、簷口、八角尖頂、石頭尖飾
        ucx = (u0 + u1) / 2; R = 0.95; y0, y1 = CH, CH + 2.7                                    # 八角亭（第二版：高一點、窗長一點；第一版矮胖）
        oc = [(ucx + R * math.cos(math.pi / 8 + k * math.pi / 4), R * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)]
        for k in range(8):
            p, q = oc[k], oc[(k + 1) % 8]; ln = math.hypot(q[0] - p[0], q[1] - p[1]); t = ((q[0] - p[0]) / ln, (q[1] - p[1]) / ln); n = (t[1], -t[0])
            F_ = Face(p, t, n); a0, a1 = ln / 2 - 0.2, ln / 2 + 0.2
            ap = arch_ellipse(a0, a1, y0 + 1.85, 0.2, n=6)
            wall(mk, F_, ln, y0, y1, [(a0, a1, y0 + 0.4, y0 + 2.05)])
            arch_opening(mk, F_, a0, a1, y0 + 0.4, ap, 0.22)
            poly(mk['dark'], F_, [(a0, y0 + 0.4), (a1, y0 + 0.4), (a1, y0 + 2.05), (a0, y0 + 2.05)], -0.22)
            mk['trim'].cyl((p[0] + n[0] * 0.04, y0, p[1] + n[1] * 0.04), (p[0] + n[0] * 0.04, y1, p[1] + n[1] * 0.04), 0.07, seg=6)
        prism(mk['trim'], [(ucx + (R + 0.14) * math.cos(math.pi / 8 + k * math.pi / 4), (R + 0.14) * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)], y1, y1 + 0.22)
        rr = R - 0.05; yb = y1 + 0.22                                                               # 八角尖頂：兩段（下段比較緩、上段尖），照片的尖頂細長
        def oct_(r, y): return [(ucx + r * math.cos(math.pi / 8 + k * math.pi / 4), y, r * math.sin(math.pi / 8 + k * math.pi / 4)) for k in range(8)]
        lo, mid = oct_(rr, yb), oct_(0.5, yb + 0.9); apex = (ucx, yb + 2.5, 0.0)
        for k in range(8):
            a1_, b1_, a2_, b2_ = lo[k], lo[(k + 1) % 8], mid[k], mid[(k + 1) % 8]
            mk['lime'].quad([a1_, b1_, b2_, a2_])
            mk['lime'].bm.faces.new([mk['lime'].bm.verts.new(g2b(*v)) for v in (a2_, b2_, apex)])
        mk['trim'].sphere((ucx, yb + 2.55, 0.0), 0.17, seg=8, rings=5); mk['trim'].cyl((ucx, yb + 2.65, 0.0), (ucx, yb + 3.15, 0.0), 0.07, seg=6, r2=0.01)
        blocks.append((u0 - 0.15, u1 + 0.15, v0 - 0.15, v1 + 0.15, 'gate tower'))
        # 側門：尖拱（跨 3.2、起拱 3.3、拱高 1.9）、牆厚 1.1、平的壓頂；最外面的石柱
        a_u0, a_u1 = sorted((s * (OPEN + TWR), s * (OPEN + TWR + SPAN))); wv = 0.55; TOPW = 6.3
        ap = arch_pointed(0.0, SPAN, 3.3, 1.9)
        for (F_, flip) in ((Face((a_u0, wv), (1, 0), (0, 1)), False), (Face((a_u1, -wv), (-1, 0), (0, -1)), True)):
            wall(mk, F_, SPAN, 0.0, TOPW, [(0.0, SPAN, 0.0, 5.2)])
            arch_opening(mk, F_, 0.0, SPAN, 0.0, ap, 0.0)
            rg = [(0.0, 3.3)] + ap + [(SPAN, 3.3)]
            for p, q in zip(ap, ap[1:]): _stone_seg(mk['trim'], F_, (p[0], p[1] + 0.12), (q[0], q[1] + 0.12), 0.09, 0.0, 0.08)   # 拱上的滴水線
            mk['trim'].quad([F_.P(0, 0.0, 0.06), F_.P(SPAN, 0.0, 0.06), F_.P(SPAN, 0.55, 0.06), F_.P(0, 0.55, 0.06)])
        Fa = Face((a_u0, wv), (1, 0), (0, 1)); edge = ap                                    # 拱腹（兩邊直的門框＝塔和石柱的側面，不重複做：疊面會變黑）
        for p, q in zip(edge, edge[1:]): mk['shade'].quad([Fa.P(p[0], p[1], 0.0), Fa.P(q[0], q[1], 0.0), Fa.P(q[0], q[1], -2 * wv), Fa.P(p[0], p[1], -2 * wv)])
        mk['trim'].box(a_u0, a_u1, TOPW, TOPW + 0.25, -wv - 0.12, wv + 0.12)
        p_u0, p_u1 = sorted((s * (OPEN + TWR + SPAN), s * (OPEN + TWR + SPAN + PIER)))
        mk['trim'].box(p_u0 - 0.08, p_u1 + 0.08, 0.0, 0.6, -0.68, 0.68)
        mk['lime'].box(p_u0, p_u1, 0.0, 6.9, -0.6, 0.6); mk['trim'].box(p_u0 - 0.1, p_u1 + 0.1, 6.9, 7.15, -0.7, 0.7)
        pc = ((p_u0 + p_u1) / 2, 0.0)
        for (a, b) in (((-1, -1), (1, -1)), ((1, -1), (1, 1)), ((1, 1), (-1, 1)), ((-1, 1), (-1, -1))):
            mk['trim'].bm.faces.new([mk['trim'].bm.verts.new(g2b(*v)) for v in ((pc[0] + a[0] * 0.55, 7.15, pc[1] + a[1] * 0.55), (pc[0] + b[0] * 0.55, 7.15, pc[1] + b[1] * 0.55), (pc[0], 7.85, pc[1]))][::-1])
        blocks.append((min(a_u0, a_u1) - 0.1, max(p_u0, p_u1) + 0.15, -0.8, 0.8, 'gate side arch + pier（側門的拱下面：門後不能走，見配置）'))
    for nm, m in mk.items():
        if not m.empty(): m.finish(g, uv=(nm in ('lime', 'rubble', 'slate')))
    return {'group': g, 'blocks_local': blocks, 'width': 2 * (OPEN + TWR + SPAN + PIER)}


if __name__ == '__main__':
    A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    def opt(n, d): return A[A.index(n) + 1] if n in A else d
    OUT = opt('--preview', None); WHAT = opt('--what', 'law')
    B.reset(texres=1024)
    root = B.group('us_law_kit_preview')
    if WHAT == 'law': law_school(root, 'law_preview', 0.0, 0.0)
    else: campus_gate(root, 'gate_preview', 0.0, 0.0)
    gm = Mesh('preview_ground', L.flat('pv_ground', '#8f8c84', rough=0.9)); gm.box(-80, 80, -0.05, 0.0, -40, 50); gm.finish(root)
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
        lt = bpy.data.lights.new('sun', 'SUN'); lt.energy = 3.5; lt.angle = math.radians(1.5); o = bpy.data.objects.new('sun', lt); sc.collection.objects.link(o); o.rotation_euler = (math.radians(50), 0, math.radians(float(opt('--sun', '35'))))
        cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = float(opt('--lens', '24'))
        from mathutils import Vector
        eye = tuple(map(float, opt('--eye', '-22,1.7,24' if WHAT == 'law' else '-6,1.7,16').split(','))); look = tuple(map(float, opt('--look', '-1,10,0' if WHAT == 'law' else '0,5,0').split(',')))
        e, l_ = Vector(g2b(*eye)), Vector(g2b(*look)); cam.location = e; cam.rotation_euler = (l_ - e).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.abspath(OUT); bpy.ops.render.render(write_still=True); print('saved', OUT)
