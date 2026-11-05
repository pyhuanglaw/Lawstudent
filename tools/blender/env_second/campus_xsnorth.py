"""校園西北角：望月台（新月台）、體育館的正式外觀 → GLB（校園世界座標）。LAWWW2-C 2026-11-05（XS-NORTH-EXT-1105）
  /opt/blenv/bin/python tools/blender/env_second/campus_xsnorth.py -- --set moon|gym [--out 輸出.glb]

使用者 11-05：「新月台…要很靠新生南路那門…新月台也貼著上方的最左邊」「體育館實際上是在新生南路辛亥路交接口 遊戲中就改到新月台法學院中間」。
位置、佔地照 src/zones3d.js 的 XSG（XS-GATE-NORTH-1105）：
  望月台 XSG.moon (−123.2, −140.4)～(−106.4, −127.2)，CK.modern 轉 π/2（正面朝東、對著側門內的小廣場）；
  體育館 XSG.gym (−90, −140.4)～(−60, −126.4)，CK.modern 不轉（正面朝南）。
  本體範圍和套件一樣 → 導航阻擋、鏡頭碰撞、門口互動點（體育館 (−75, −125)）不用改。
**像但不照抄（D136）**：沒有放學校的照片；照公開資料的特徵做遊戲版——
  望月台：真的新月台是新生南路側門旁的兩層小樓（一樓紀念品店、二樓咖啡）。→ 一樓整面玻璃店面（往內退 0.6 m）、二樓白色量體＋一條長窗、正面深出挑的屋簷（木色簷底）、招牌。
  體育館：真的新體育館很大、有弧形屋頂。→ 一樓玻璃大廳（往內退 1.5 m、方柱）、上面三層白色直鰭＋玻璃、弧形金屬屋頂（沿東西向的筒形）、入口雨遮＋招牌。
材質名稱沿用校園地標的約定（attachWenzhouModel）：ck_glass（夜間窗燈）、匾額 PLATE_FACE_*。"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy   # noqa: E402
from cafe_layout import uv01   # noqa: E402
from campus_pavilion import emit_image, add_emit, GL_TOP, GL_BOT, U_DARK, U_LIT   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
SET = arg('--set', 'moon')
MOON = dict(rect=(-123.2, -140.4, -106.4, -127.2), ry=math.pi / 2, out='assets/models/env/second_ai/campus_moon.glb', name='campus_moon')
GYM = dict(rect=(-90.0, -140.4, -60.0, -126.4), ry=0.0, out='assets/models/env/second_ai/campus_gymext.glb', name='campus_gymext')


class Kit:
    """和 campus_modern.py 同一套小工具：本地座標（正面 +z）→ 校園座標；面的法線照 want 翻"""
    def __init__(self, place, M, prefix):
        self.px, self.pz, ry = place; self.c, self.s = round(math.cos(ry)), round(math.sin(ry)); self.M = M; self.accs = {}; self.prefix = prefix
    def XF(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def acc(self, k):
        if k not in self.accs: self.accs[k] = (CMesh if k == 'glass' else Mesh)(self.prefix + k, self.M[k])
        return self.accs[k]
    @staticmethod
    def newell(pts):
        n = [0.0, 0.0, 0.0]
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1])
        return n
    def face(self, m, pts, want=None, uvs=None, col=None):
        if want is not None:
            n = self.newell(pts)
            if n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0: pts = pts[::-1]; uvs = uvs[::-1] if uvs else uvs; col = col[::-1] if col else col
        f = m.bm.faces.new([m.bm.verts.new(g2b(*self.XF(*p))) for p in pts])
        if uvs:
            lay = m.bm.loops.layers.uv.get('UVMap') or m.bm.loops.layers.uv.new('UVMap')
            for lp, uv in zip(f.loops, uvs): lp[lay].uv = uv
        if col:
            for lp, c in zip(f.loops, col): lp[m.col] = list(c) + [1.0]
        return f
    def box(self, m, x0, x1, y0, y1, z0, z1, skip=()):
        F_ = {'bottom': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)), 'top': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)),
              'back': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'front': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
              'left': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'right': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
        for k, (pts, n) in F_.items():
            if k not in skip: self.face(m, pts, n)
    def glass(self, fr, a, b, va, vb, d, lit):
        u = U_LIT if lit else U_DARK
        self.rect(self.acc('glass'), fr, a, b, va, vb, d, [(u, 0), (u, 0), (u, 1), (u, 1)], [GL_BOT, GL_BOT, GL_TOP, GL_TOP])
    def rect(self, m, fr, ua, ub, va, vb, d=0.0, uvs=None, col=None): self.face(m, [fr.p(ua, va, d), fr.p(ub, va, d), fr.p(ub, vb, d), fr.p(ua, vb, d)], fr.N, uvs, col)
    def strip(self, m, fr, a, b, d0, d1, want): self.face(m, [fr.p(a[0], a[1], d0), fr.p(b[0], b[1], d0), fr.p(b[0], b[1], d1), fr.p(a[0], a[1], d1)], fr.dirv(*want))


class Fr:
    """立面座標：u＝從外面看往右、v＝往上、d＝往外；原點 O"""
    def __init__(self, O, R, N): self.O, self.R, self.N = O, R, N
    def p(self, u, v, d=0.0): return (self.O[0] + u * self.R[0] + d * self.N[0], self.O[1] + v, self.O[2] + u * self.R[2] + d * self.N[2])
    def dirv(self, du, dv, dd): return (du * self.R[0] + dd * self.N[0], dv, du * self.R[2] + dd * self.N[2])


def faces4(W, D):
    return (Fr((0, 0, D / 2), (1, 0, 0), (0, 0, 1)), Fr((0, 0, -D / 2), (-1, 0, 0), (0, 0, -1)),
            Fr((W / 2, 0, 0), (0, 0, -1), (1, 0, 0)), Fr((-W / 2, 0, 0), (0, 0, 1), (-1, 0, 0)))


def lit_hash(*k):
    h = math.sin(sum((i + 1) * 12.9898 * v for i, v in enumerate(k)) + 78.233) * 43758.5453
    return h - math.floor(h) > 0.35


def mats(pref, wall_hex):
    M = {'wall': L.pbr('ck_%s_wall' % pref, 'painted_plaster_wall', tile=2.5, target=wall_hex, sat=0.25, normal=0.35, maps=('diff', 'nor'), rough_value=0.88),
         'metal': L.flat('ck_%s_metal' % pref, '#5f656c', rough=0.42, metal=0.35),
         'glass': L.vc_material('ck_glass', rough=0.12),
         'board': L.flat('ck_board', '#f4f2ec', rough=0.8)}
    add_emit(M['glass'], emit_image('win_lit_grad', True))
    return M


def finish(root, K, plates, out):
    for k, m in K.accs.items(): m.finish(root, uv=(k == 'wall'))
    for plate, props in plates: uv01(plate.finish(root, uv=True, props=props))
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
    info = L.export(out, gpu_instances=False)
    L.write_json(out[:-4] + '.json', info)
    return info


def setup(S):
    r = S['rect']; ry = S['ry']; cx, cz = (r[0] + r[2]) / 2, (r[1] + r[3]) / 2; sx, sz = r[2] - r[0], r[3] - r[1]
    W, D = (sz, sx) if abs(math.sin(ry)) > 0.5 else (sx, sz)   # 本地 x 寬、z 深（轉 90° 時世界 x／z 對調）
    return (cx, cz, ry), W, D


def build_moon(out):
    place, W, D = setup(MOON); GFH, FH = 4.2, 3.6; H = GFH + FH; REC = 0.6
    B.reset(texres=512); root = B.group(MOON['name'], props={'kind': MOON['name']})
    M = mats('moon', '#efece4'); M['wood'] = L.flat('ck_moon_wood', '#8a6a4c', rough=0.75)
    K = Kit(place, M, 'moon_'); wm, mm = K.acc('wall'), K.acc('metal')
    FRONT, BACK, RIGHT, LEFT = faces4(W, D)
    # 一樓：正面＋右側（本地 −x＝世界南邊，對著停車場）往內退 REC 的玻璃店面；背面、左側（貼北牆）實牆
    K.rect(wm, BACK, -W / 2, W / 2, 0, GFH); K.rect(wm, RIGHT, -D / 2, D / 2, 0, GFH)
    zf = D / 2 - REC; xs = -W / 2 + REC
    LF = Fr((0, 0, zf), (1, 0, 0), (0, 0, 1)); SF = Fr((xs, 0, 0), (0, 0, 1), (-1, 0, 0))
    K.box(wm, W / 2 - 0.6, W / 2, 0, GFH, zf, D / 2, skip=('bottom', 'back'))                                         # 正面北端的實牆墩
    K.box(wm, -W / 2, -W / 2 + REC, 0, GFH, -D / 2, -D / 2 + 0.6, skip=('bottom',))                                   # 南面西端的牆墩
    K.face(wm, [(-W / 2, GFH - 0.001, zf), (W / 2 - 0.6, GFH - 0.001, zf), (W / 2 - 0.6, GFH - 0.001, D / 2), (-W / 2, GFH - 0.001, D / 2)], (0, -1, 0))
    K.face(wm, [(-W / 2, GFH - 0.001, -D / 2 + 0.6), (xs, GFH - 0.001, -D / 2 + 0.6), (xs, GFH - 0.001, zf), (-W / 2, GFH - 0.001, zf)], (0, -1, 0))
    gy0, gy1 = 0.12, GFH - 0.35
    lw = (W / 2 - 0.6) - xs; n = round(lw / 1.4); sw = lw / n; door = [k for k in range(n) if abs(xs + sw * (k + 0.5)) < 0.9]
    for k in range(n):
        a, b = xs + sw * k, xs + sw * (k + 1)
        if k not in door: K.glass(LF, a, b, gy0, gy1, 0.02, lit_hash(1, k))
        K.rect(mm, LF, a - 0.04, a + 0.04, 0.06, GFH, 0.06)
    K.rect(mm, LF, xs, W / 2 - 0.6, gy1, GFH, 0.04); K.rect(mm, LF, xs, W / 2 - 0.6, 0.06, gy0, 0.04)
    da, db = xs + sw * door[0], xs + sw * (door[-1] + 1)
    K.glass(LF, da, db, gy0, 2.7, 0.02, True); K.rect(mm, LF, da, db, 2.7, gy1, 0.03); K.rect(mm, LF, (da + db) / 2 - 0.03, (da + db) / 2 + 0.03, gy0, 2.7, 0.05)
    sl = (zf) - (-D / 2 + 0.6); n2 = round(sl / 1.4); sw2 = sl / n2
    for k in range(n2):
        a, b = -D / 2 + 0.6 + sw2 * k, -D / 2 + 0.6 + sw2 * (k + 1)
        K.glass(SF, a, b, gy0, gy1, 0.02, lit_hash(2, k)); K.rect(mm, SF, a - 0.04, a + 0.04, 0.06, GFH, 0.06)
    K.rect(mm, SF, -D / 2 + 0.6, zf, gy1, GFH, 0.04)
    K.face(wm, [(-W / 2, 0.06, -D / 2 + 0.6), (W / 2, 0.06, -D / 2 + 0.6), (W / 2, 0.06, D / 2 + 0.2), (-W / 2, 0.06, D / 2 + 0.2)], (0, 1, 0))   # 騎樓地坪
    # 二樓：白色量體；正面、南面一條長窗（咖啡座）；背面、北面實牆
    v0, v1 = GFH, H
    for fr, half, sid, win in ((FRONT, W / 2, 3, True), (BACK, W / 2, 4, False), (RIGHT, D / 2, 5, False), (LEFT, D / 2, 6, True)):
        if not win: K.rect(wm, fr, -half, half, v0, v1); continue
        wa, wb = v0 + 0.75, v1 - 0.45; ua, ub = -half + 0.7, half - 0.7
        K.rect(wm, fr, -half, half, v0, wa); K.rect(wm, fr, -half, half, wb, v1); K.rect(wm, fr, -half, ua, wa, wb); K.rect(wm, fr, ub, half, wa, wb)
        for a_, b_, want in (((ua, wa), (ub, wa), (0, 1, 0)), ((ua, wb), (ub, wb), (0, -1, 0)), ((ua, wa), (ua, wb), (1, 0, 0)), ((ub, wa), (ub, wb), (-1, 0, 0))): K.strip(wm, fr, a_, b_, 0, -0.22, want)
        nn = max(1, round((ub - ua) / 1.2)); s_ = (ub - ua) / nn
        for k in range(nn):
            a, b = ua + s_ * k, ua + s_ * (k + 1); K.glass(fr, a, b, wa, wb, -0.2, lit_hash(sid, k))
            if k: K.rect(mm, fr, a - 0.03, a + 0.03, wa, wb, -0.18)
        K.rect(mm, fr, ua, ub, wa, wa + 0.05, -0.18); K.rect(mm, fr, ua, ub, wb - 0.05, wb, -0.18)
    K.box(wm, -W / 2 - 0.12, W / 2 + 0.12, GFH - 0.12, GFH + 0.12, -D / 2 - 0.12, D / 2 + 0.12, skip=())             # 一二樓之間的樓板邊
    # 屋頂：正面、南面深出挑（1.6 m）的薄簷，木色簷底；女兒牆
    K.box(wm, -W / 2 - 1.6, W / 2 + 0.3, H, H + 0.35, -D / 2 - 0.3, D / 2 + 1.6, skip=('bottom',))
    K.face(K.acc('wood'), [(-W / 2 - 1.6, H - 0.001, -D / 2 - 0.3), (W / 2 + 0.3, H - 0.001, -D / 2 - 0.3), (W / 2 + 0.3, H - 0.001, D / 2 + 1.6), (-W / 2 - 1.6, H - 0.001, D / 2 + 1.6)], (0, -1, 0))
    K.face(mm, [(-W / 2 - 1.4, H + 0.351, -D / 2 - 0.1), (W / 2 + 0.1, H + 0.351, -D / 2 - 0.1), (W / 2 + 0.1, H + 0.351, D / 2 + 1.4), (-W / 2 - 1.4, H + 0.351, D / 2 + 1.4)], (0, 1, 0))
    # 招牌：正面一二樓之間（樓板邊上方）
    plate = Mesh('PLATE_FACE_MOON', M['board']); sy = GFH + 0.42
    K.box(wm, -2.5, 2.5, sy - 0.32, sy + 0.3, D / 2, D / 2 + 0.1, skip=('back',))
    K.face(plate, [(-2.2, sy - 0.24, D / 2 + 0.105), (2.2, sy - 0.24, D / 2 + 0.105), (2.2, sy + 0.24, D / 2 + 0.105), (-2.2, sy + 0.24, D / 2 + 0.105)], (0, 0, 1))
    return finish(root, K, [(plate, {'text': '望月台', 'bg': '#f4f2ec', 'color': '#3b3b3b', 'serif': 1, 'fs': 0.62})], out)


def build_gym(out):
    place, W, D = setup(GYM); GFH, FH, NF = 5.0, 4.4, 4; H = GFH + (NF - 1) * FH; LOB = 1.5; ARCH = 3.2
    B.reset(texres=512); root = B.group(GYM['name'], props={'kind': GYM['name']})
    M = mats('gym', '#e6e3dc'); M['roof'] = L.flat('ck_gym_roof', '#b9bec2', rough=0.45, metal=0.35)
    K = Kit(place, M, 'gym_'); wm, mm = K.acc('wall'), K.acc('metal')
    FRONT, BACK, RIGHT, LEFT = faces4(W, D)
    # 一樓：背面、兩側實牆；正面玻璃大廳往內退 LOB、方柱
    K.rect(wm, BACK, -W / 2, W / 2, 0, GFH)
    K.rect(wm, RIGHT, -D / 2 + LOB, D / 2, 0, GFH); K.rect(wm, LEFT, -D / 2, D / 2 - LOB, 0, GFH)
    zl = D / 2 - LOB; LF = Fr((0, 0, zl), (1, 0, 0), (0, 0, 1))
    for k in range(7):   # 方柱（5 m 一根）
        x = -W / 2 + 0.35 + k * (W - 0.7) / 6; K.box(wm, x - 0.35, x + 0.35, 0, GFH, D / 2 - 0.7, D / 2, skip=('bottom', 'top'))
    K.face(wm, [(-W / 2, GFH - 0.001, zl), (W / 2, GFH - 0.001, zl), (W / 2, GFH - 0.001, D / 2), (-W / 2, GFH - 0.001, D / 2)], (0, -1, 0))
    K.face(wm, [(-W / 2, 0.06, zl), (W / 2, 0.06, zl), (W / 2, 0.06, D / 2 + 0.3), (-W / 2, 0.06, D / 2 + 0.3)], (0, 1, 0))
    gy0, gy1 = 0.12, GFH - 0.5; lw = W - 0.4; n = round(lw / 1.5); sw = lw / n; door = [k for k in range(n) if abs(-lw / 2 + sw * (k + 0.5)) < 1.6]
    for k in range(n):
        a, b = -lw / 2 + sw * k, -lw / 2 + sw * (k + 1)
        if k not in door: K.glass(LF, a, b, gy0, gy1, 0.02, lit_hash(9, k))
        K.rect(mm, LF, a - 0.045, a + 0.045, 0.06, GFH, 0.06)
    K.rect(mm, LF, -lw / 2, lw / 2, gy1, GFH, 0.04); K.rect(mm, LF, -lw / 2, lw / 2, 0.06, gy0, 0.04)
    da, db = -lw / 2 + sw * door[0], -lw / 2 + sw * (door[-1] + 1)
    K.glass(LF, da, db, gy0, 3.0, 0.02, True); K.rect(mm, LF, da, db, 3.0, gy1, 0.03)
    for xm in (da + (db - da) / 4, (da + db) / 2, db - (db - da) / 4): K.rect(mm, LF, xm - 0.03, xm + 0.03, gy0, 3.0, 0.05)
    # 入口雨遮＋招牌（正面中間 12 m、出挑 3.2 m）
    K.box(wm, -6.0, 6.0, 4.3, 4.65, D / 2 - 0.2, D / 2 + 3.2, skip=())
    plate = Mesh('PLATE_FACE_GYM', M['board'])
    K.face(plate, [(-2.4, 4.33, D / 2 + 3.205), (2.4, 4.33, D / 2 + 3.205), (2.4, 4.62, D / 2 + 3.205), (-2.4, 4.62, D / 2 + 3.205)], (0, 0, 1))
    # 二～四樓：白色直鰭＋玻璃（鰭 0.25 m 寬、往外 0.45 m，1.5 m 一支）；樓板邊
    for fr, half, sid in ((FRONT, W / 2, 1), (BACK, W / 2, 2), (RIGHT, D / 2, 3), (LEFT, D / 2, 4)):
        v0, v1 = GFH, H
        K.rect(wm, fr, -half, -half + 0.8, v0, v1); K.rect(wm, fr, half - 0.8, half, v0, v1)
        ua, ub = -half + 0.8, half - 0.8; nn = max(1, round((ub - ua) / 1.5)); s_ = (ub - ua) / nn
        for fl in range(NF - 1):
            ya, yb = GFH + fl * FH, GFH + (fl + 1) * FH
            K.rect(wm, fr, ua, ub, ya, ya + 0.9); wa, wb = ya + 0.9, yb - 0.25; K.rect(wm, fr, ua, ub, wb, yb)
            for k in range(nn): K.glass(fr, ua + s_ * k, ua + s_ * (k + 1), wa, wb, -0.05, lit_hash(sid, fl, k))
        for k in range(nn + 1):
            u = ua + s_ * k; K.box_fin = None
            p0, p1 = fr.p(u - 0.125, 0, 0), fr.p(u + 0.125, 0, 0.45)
            x0, x1 = sorted((p0[0], p1[0])); z0, z1 = sorted((p0[2], p1[2]))
            K.box(wm, x0, x1, GFH, H, z0, z1, skip=('bottom',))
    for fl in range(1, NF):
        y = GFH + (fl - 1) * FH
        K.box(wm, -W / 2 - 0.1, W / 2 + 0.1, y - 0.12, y + 0.12, -D / 2 - 0.1, D / 2 + 0.1, skip=())
    # 弧形屋頂：東西向的筒形（沿本地 x），斷面是 z 方向的圓弧，比外牆各多出 0.6 m；兩端山牆（實牆）
    R0 = (D / 2 + 0.6); seg = 14; rm = K.acc('roof'); y0 = H + 0.3
    def arcp(t):   # t 0..1：z 從 −R0 到 +R0，高度 ARCH 的拋物線拱
        z = -R0 + 2 * R0 * t; return z, y0 + ARCH * (1 - (z / R0) ** 2)
    for i in range(seg):
        za, ya = arcp(i / seg); zb, yb = arcp((i + 1) / seg)
        K.face(rm, [(-W / 2 - 0.6, ya, za), (W / 2 + 0.6, ya, za), (W / 2 + 0.6, yb, zb), (-W / 2 - 0.6, yb, zb)], (0, 1, 0))
        K.face(rm, [(-W / 2 - 0.6, ya - 0.18, za), (W / 2 + 0.6, ya - 0.18, za), (W / 2 + 0.6, yb - 0.18, zb), (-W / 2 - 0.6, yb - 0.18, zb)], (0, -1, 0))
        for sx in (1, -1):
            K.face(wm, [(sx * (W / 2 - 0.05), H, za * (D / 2) / R0), (sx * (W / 2 - 0.05), H, zb * (D / 2) / R0), (sx * (W / 2 - 0.05), H + (yb - y0) * 0.92 + 0.3, zb * (D / 2) / R0), (sx * (W / 2 - 0.05), H + (ya - y0) * 0.92 + 0.3, za * (D / 2) / R0)], (sx, 0, 0))
    K.box(wm, -W / 2, W / 2, H, H + 0.3, -D / 2, D / 2, skip=('bottom',))                                            # 屋頂底下的圈梁
    return finish(root, K, [(plate, {'text': '體育館', 'bg': '#f4f2ec', 'color': '#3b3b3b', 'serif': 1, 'fs': 0.66})], out)


if __name__ == '__main__':
    if SET == 'moon': info = build_moon(os.path.join(L.ROOT, arg('--out') or MOON['out']))
    else: info = build_gym(os.path.join(L.ROOT, arg('--out') or GYM['out']))
    print('OK', SET, {k: info.get(k) for k in ('tris', 'materials', 'bytes')})
