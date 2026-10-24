"""舊路書房（遊戲 bookstore 區域，公館南側店面）室內 → GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/bookstore_interior.py [-- --out assets/models/env/second_ai/bookstore_interior.glb]

座標＝遊戲 bookstore 區域的座標（room() 12×10×3.4 m，店面在 z=+5，窗在 x=±3.5，門在中間）。
只換畫面：導航、「看看法律書與文具」(0,4.05)、離開 (0,4.6)、出生點在 src/zones3d.js 的 bookstore 區塊，不變；
書架的位置和大小照套件（shelfWall：後牆 11 m、左右牆各 8 m、中間兩排各 5 m，2.4 m 高、0.4 m 深）、櫃台桌 2.4×1.2 在 (0,3)，沒有加新的障礙物。
套件右牆和右邊那排書架的書朝錯邊（看不到）——這裡兩側牆的書都朝店內，中間兩排做成雙面。

台北的二手書店：深色木書架塞滿書（書背是一片片四邊形，顏色、高矮、厚薄都不同，顏色放在頂點色：所有書一次 draw call；
偶爾一本斜靠、一疊平放）、木地板、牆上的老海報與「二手書・法律・人文」手寫牌、櫃台桌（舊收銀機、一疊疊書、檯燈、紙袋）、
吊燈（暖色燈罩）、店面玻璃窗與門。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）。手寫牌的字用 canvas：SIGN_FACE_*。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/bookstore_interior.glb'))

W, D, H = 12.0, 10.0, 3.4
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
random.seed(1984)
B.reset(texres=512)
root = B.group('bookstore_interior', props={'kind': 'bookstore_interior', 'w': W, 'd': D, 'h': H})
M = {
    'floor': L.pbr('bk_floor', 'laminate_floor_02', tile=1.3, target='#cbb390', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.6),   # 地板改淺色（使用者 10-23：不要深色木地板，整個遊戲都不要；ART-NO-DARK-WOOD-1023）
    'wall': L.pbr('bk_wall', 'white_plaster_02', tile=1.4, target='#e6dcc8', maps=('diff',), res=256, rough_value=0.9),
    'ceil': L.flat('bk_ceiling', '#efe7d8', rough=0.9, cull=True), 'beam': L.flat('bk_beam', '#5a4130', rough=0.7, cull=True),
    'shelf': L.pbr('bk_shelf', 'black_walnut_veneer_01', tile=1.0, target='#4e3624', maps=('diff',), res=256, rough_value=0.7),
    'books': L.vc_material('bk_books', rough=0.75), 'paper': L.flat('bk_paper', '#e8e0cc', rough=0.9),
    'table': L.pbr('bk_table', 'walnut_veneer', tile=1.0, target='#6e4b30', maps=('diff',), res=256, rough_value=0.6),
    'brass': L.flat('bk_brass', '#9a7840', rough=0.35, metal=0.45), 'shade': L.flat('bk_lampshade', '#e9c98f', rough=0.5, emit=B.srgb('#ffcf8a')),
    'black': L.flat('bk_black', '#222222', rough=0.4), 'glass': L.flat('bk_glass', '#dfe9ec', rough=0.05, alpha=0.18), 'frame': L.flat('bk_frame', '#3b2a1e', rough=0.55),
    'board': L.flat('bk_sign_face', '#ffffff', rough=0.7), 'poster': L.vc_material('bk_poster', rough=0.8), 'kraft': L.flat('bk_kraft', '#b88a5a', rough=0.9),
}
SPINES = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#6b4a7a', '#2b2b2b', '#b8462e', '#4a6c8c', '#a39a86', '#e4d4b4', '#7a6a5a']
walls = {'front': [], 'back': [], 'left': [], 'right': []}
def wm(side, key):
    for m in walls[side]:
        if m.mat == M[key]: return m
    m = Mesh(f'{side}_{key}', M[key]); walls[side].append(m); return m


def wall_box(side, key, a0, a1, y0, y1, t0=0.0, t1=0.12):
    m = wm(side, key)
    if side == 'back': m.box(a0, a1, y0, y1, Z0 + t0, Z0 + t1)
    elif side == 'front': m.box(a0, a1, y0, y1, Z1 - t1, Z1 - t0)
    elif side == 'left': m.box(X0 + t0, X0 + t1, y0, y1, a0, a1)
    else: m.box(X1 - t1, X1 - t0, y0, y1, a0, a1)


books = L.CMesh('bk_books', M['books'])


class Frame:
    """書架的座標：沿著書架 u（0→len）、往書架正面 v（0＝背板，D＝前緣）、高 y → 世界 (x, y, z)"""
    def __init__(self, cx, cz, ang, ln): self.cx, self.cz, self.c, self.s, self.ln = cx, cz, math.cos(ang), math.sin(ang), ln
    def p(self, u, y, v):
        lu = u - self.ln / 2; lv = v - 0.2                      # 書架中心為原點（套件 shelfWall 的群組座標：x 沿書架、z＝正面）
        return (self.cx + lu * self.c + lv * self.s, y, self.cz - lu * self.s + lv * self.c)


def spine(fr, u0, u1, y0, y1, v, col, k=1.0):
    """一本書的書背（朝書架正面的四邊形）＋書頂（窄條）"""
    p = fr.p
    books.poly([p(u0, y0, v), p(u1, y0, v), p(u1, y1, v), p(u0, y1, v)], col, k)
    books.poly([p(u0, y1, v), p(u1, y1, v), p(u1, y1, v - 0.16), p(u0, y1, v - 0.16)], col, k * 0.55)


def shelf_unit(cx, cz, ang, ln, levels=(0.1, 0.66, 1.22, 1.78), Hs=2.4, Ds=0.4, back=True, double=False):
    """一座書架（照套件 shelfWall 的尺寸）：側板、約 1 m 一片直隔板、底座、層板、頂板、背板；每層塞滿書"""
    fr = Frame(cx, cz, ang, ln); sh = shelf
    def boxw(u0, u1, y0, y1, v0, v1):
        pts = [fr.p(u, y, v) for u in (u0, u1) for y in (y0, y1) for v in (v0, v1)]
        xs, zs = [q[0] for q in pts], [q[2] for q in pts]; sh.box(min(xs), max(xs), y0, y1, min(zs), max(zs))
    if back: boxw(0, ln, 0, Hs, 0.0, 0.02)
    nb = max(1, round(ln / 1.0))
    for i in range(nb + 1): u = ln * i / nb; boxw(max(0, u - 0.015), min(ln, u + 0.015), 0, Hs, 0.0 if not double else -0.38, Ds)
    boxw(0, ln, 0, 0.1, 0.0 if not double else -0.38, Ds); boxw(0, ln, Hs - 0.04, Hs, -0.0 if not double else -0.39, Ds + 0.02)
    sides = (1,) if not double else (1, -1)
    for y in levels:
        boxw(0, ln, y, y + 0.03, 0.0 if not double else -0.38, Ds)
        for sd in sides:
            u = 0.03
            while u < ln - 0.05:
                if random.random() < 0.035:                                    # 一疊平放的書
                    w_ = 0.22; n = random.randint(3, 6); vv = Ds - 0.02 if sd > 0 else -0.36
                    for j in range(n):
                        col = random.choice(SPINES); yy = y + 0.03 + j * 0.035
                        p = fr.p; books.poly([p(u, yy, vv), p(u + w_, yy, vv), p(u + w_, yy + 0.03, vv), p(u, yy + 0.03, vv)] if sd > 0 else [p(u + w_, yy, vv), p(u, yy, vv), p(u, yy + 0.03, vv), p(u + w_, yy + 0.03, vv)], col)
                    u += w_ + 0.03; continue
                if random.random() < 0.02: u += random.uniform(0.05, 0.12); continue   # 空隙
                t = random.uniform(0.018, 0.05); hgt = random.uniform(0.2, 0.42); col = random.choice(SPINES); k = random.uniform(0.85, 1.08)
                vv = (Ds - 0.03 - random.uniform(0, 0.03)) if sd > 0 else (-0.35 + random.uniform(0, 0.03))
                if sd > 0: spine(fr, u, u + t, y + 0.03, y + 0.03 + hgt, vv, col, k)
                else:
                    p = fr.p; books.poly([p(u + t, y + 0.03, vv), p(u, y + 0.03, vv), p(u, y + 0.03 + hgt, vv), p(u + t, y + 0.03 + hgt, vv)], col, k)
                u += t + 0.002
    return fr


shelf = Mesh('bk_shelf', M['shelf'])
# ---- 地板、天花板（木梁）、吊燈
Mesh('bk_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh('bk_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
bm_ = Mesh('bk_beams', M['beam'])
for z in (-3.0, -0.5, 2.0, 4.0):
    bm_.quad([(X0, H - 0.16, z - 0.07), (X1, H - 0.16, z - 0.07), (X1, H - 0.16, z + 0.07), (X0, H - 0.16, z + 0.07)])
    bm_.quad([(X0, H - 0.16, z + 0.07), (X1, H - 0.16, z + 0.07), (X1, H, z + 0.07), (X0, H, z + 0.07)]); bm_.quad([(X0, H - 0.16, z - 0.07), (X1, H - 0.16, z - 0.07), (X1, H, z - 0.07), (X0, H, z - 0.07)][::-1])
bm_.finish(root)
lamp_c, lamp_s = Mesh('bk_lamp_cord', M['black']), Mesh('bk_lampshades', M['shade'])
for (x, z) in ((-3.8, -2.0), (0.0, -2.0), (3.8, -2.0), (-3.8, 1.5), (0.0, 1.5), (3.8, 1.5), (0.0, 3.0)):
    lamp_c.cyl((x, H, z), (x, 2.55, z), 0.006, seg=4)
    bm = L.lathe([(0.04, 0.0), (0.06, 0.02), (0.2, -0.16), (0.21, -0.18)], seg=14); lamp_s.add_bm(bm, Matrix.Translation(g2b(x, 2.55, z))); bm.free()
lamp_c.finish(root); ob = lamp_s.finish(root, uv=False); L.smooth_mesh(ob)

# ---- 牆（灰泥＋深色踢腳板）、前牆兩扇窗（x＝±3.5）和門
for side, (a0, a1) in (('back', (X0, X1)), ('left', (Z0, Z1)), ('right', (Z0, Z1))):
    wall_box(side, 'wall', a0, a1, 0.1, H); wall_box(side, 'frame', a0, a1, 0.0, 0.1, 0.0, 0.13)
xs = [X0, -4.9, -2.1, -0.95, 0.95, 2.1, 4.9, X1]
for a0, a1 in ((xs[0], xs[1]), (xs[2], xs[3]), (xs[4], xs[5]), (xs[6], xs[7])): wall_box('front', 'wall', a0, a1, 0.0, H)
for a0, a1 in ((xs[1], xs[2]), (xs[5], xs[6])):
    wall_box('front', 'wall', a0, a1, 0.0, 1.05); wall_box('front', 'wall', a0, a1, 2.95, H)
    fr_ = wm('front', 'frame')
    for y in (1.0, 2.94): fr_.box(a0, a1, y, y + 0.06, Z1 - 0.14, Z1 - 0.02)
    for x in (a0, (a0 + a1) / 2, a1): fr_.box(x - 0.035, x + 0.035, 1.0, 3.0, Z1 - 0.14, Z1 - 0.02)
    wm('front', 'glass').quad([(a1, 1.06, Z1 - 0.08), (a0, 1.06, Z1 - 0.08), (a0, 2.94, Z1 - 0.08), (a1, 2.94, Z1 - 0.08)])
wall_box('front', 'wall', xs[3], xs[4], 2.35, H)
fr_ = wm('front', 'frame')
for x in (xs[3], 0.0, xs[4]): fr_.box(x - 0.045, x + 0.045, 0.0, 2.35, Z1 - 0.15, Z1 - 0.02)
fr_.box(xs[3], xs[4], 2.3, 2.38, Z1 - 0.15, Z1 - 0.02)
wm('front', 'glass').quad([(xs[4], 0.02, Z1 - 0.09), (xs[3], 0.02, Z1 - 0.09), (xs[3], 2.3, Z1 - 0.09), (xs[4], 2.3, Z1 - 0.09)])

# ---- 書架（套件 shelfWall 的位置）：後牆（11 m，朝 +z）、左牆（8 m，朝 +x）、右牆（8 m，朝 −x）、中間兩排（5 m，雙面）
# 靠牆的三座往房間裡挪 3.5 cm：背板正面原本和牆的內面（Z0＋0.12、X0＋0.12）在同一個平面，從書和書的空隙看進去會閃（使用者回報「書背後面的層板在閃」，BUG-WZFLICKER；
# check_coplanar.py 找到的）。挪 3.5 cm 也讓開踢腳板（離牆 0.13）。導航阻擋照套件、不用改
shelf_unit(0.0, -4.7 + 0.035, 0.0, 11.0)
shelf_unit(-5.7 + 0.035, 0.0, math.pi / 2, 8.0)
shelf_unit(5.7 - 0.035, 0.0, -math.pi / 2, 8.0)
shelf_unit(-2.0, 0.0, math.pi / 2, 5.0, back=False, double=True)
shelf_unit(2.0, 0.0, math.pi / 2, 5.0, back=False, double=True)

# ---- 櫃台桌（套件 (0,3) 2.4×1.2）：桌面、桌腳、一疊疊書、舊收銀機、檯燈、牛皮紙袋
tb = Mesh('bk_table', M['table']); tb.box(-1.2, 1.2, 0.74, 0.8, 2.4, 3.6)
for sx in (-1.12, 1.12):
    for sz in (2.48, 3.52): tb.box(sx - 0.04, sx + 0.04, 0.0, 0.74, sz - 0.04, sz + 0.04)
tb.box(-1.1, 1.1, 0.12, 0.16, 2.5, 3.5); tb.finish(root)
for (x, z, n) in ((-0.8, 2.75, 6), (-0.45, 2.7, 4), (-0.8, 3.2, 3), (0.5, 2.7, 5)):
    for j in range(n):
        col = random.choice(SPINES); y0 = 0.8 + j * 0.04; w_, d_ = random.uniform(0.15, 0.22), random.uniform(0.21, 0.28)
        books.cbox(x - w_ / 2, x + w_ / 2, y0, y0 + 0.038, z - d_ / 2, z + d_ / 2, col)
bl = Mesh('bk_register', M['black']); bl.box(0.15, 0.55, 0.8, 0.95, 3.15, 3.5); bl.box(0.2, 0.5, 0.95, 1.12, 3.4, 3.48); bl.finish(root)
br = Mesh('bk_lamp_brass', M['brass']); br.cyl((0.95, 0.8, 3.3), (0.95, 1.2, 3.3), 0.012, seg=6); br.cyl((0.95, 1.2, 3.3), (0.95, 1.25, 3.05), 0.012, seg=6); br.cyl((0.95, 0.8, 3.3), (0.95, 0.82, 3.3), 0.07, seg=12); br.finish(root)
gl = Mesh('bk_desklamp', M['shade']); bm = L.lathe([(0.03, 0.0), (0.09, -0.1), (0.1, -0.11)], seg=12); gl.add_bm(bm, Matrix.Translation(g2b(0.95, 1.3, 3.05))); bm.free(); gl.finish(root, uv=False)
kr = Mesh('bk_bags', M['kraft']); kr.box(-0.2, 0.05, 0.8, 1.0, 3.3, 3.45); kr.finish(root)

# ---- 牆上：手寫牌（「二手書・法律・人文」）、老海報（頂點色色塊）
sg = Mesh('WALL_back_SIGN_FACE_note', M['board']); sg.quad([(-1.2, 2.55, Z0 + 0.125), (1.2, 2.55, Z0 + 0.125), (1.2, 2.95, Z0 + 0.125), (-1.2, 2.95, Z0 + 0.125)])
signs = [(sg, {'dir': DIRS['back'], 'sign': '二手書・法律・人文', 'style': 'note'})]
pst = L.CMesh('front_posters', M['poster'])
for (x, col) in ((-5.5, '#c94f45'), (5.3, '#2f4a3a')):
    pst.cbox(x - 0.32, x + 0.32, 1.3, 2.2, Z1 - 0.135, Z1 - 0.125, col); pst.cbox(x - 0.27, x + 0.27, 1.75, 2.12, Z1 - 0.137, Z1 - 0.135, '#e8e0cc')
walls['front'].append(pst)

# ---- 收尾
for side, ms in walls.items():
    for m in ms:
        m.name = f'WALL_{m.name}'; m.finish(root, uv=True, props={'dir': DIRS[side]})
for m, props in signs: uv01(m.finish(root, uv=True, props=props))
shelf.finish(root); books.finish(root, uv=False)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
