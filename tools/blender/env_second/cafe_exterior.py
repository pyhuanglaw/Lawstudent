"""兩點半 Café（溫州街東端路口）建築外觀＋一樓店面＋門口道具 → GLB；店面玻璃後面是完整的店內（和室內區域同一套配置）。
第二 AI 工作階段（環境美術）製作；Blender 5.2.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/cafe_exterior.py [-- --out assets/models/env/second_ai/cafe_exterior.glb] [--render 資料夾]

座標＝套件建築 TK.apartment 的座標（遊戲 x 右、y 上、z 往街道）：正面朝 +z、原點在正面中央的地面，
寬 14 m（x −7～7）、深 13 m（z −13～0）、一樓 3.8 m、二三樓各 3.2 m（屋頂 10.2 m）——和 src/zones3d.js 的 cafeB 相同，
所以導航（blockRect）、鏡頭碰撞、店門互動點、門口盆栽與 A 字立牌的導航阻擋都不用改。遊戲整合：GLB 的根節點掛在 cafeB 底下
（zones3d.js 的 attachCafeExterior），套件的外觀藏起來。

店面與店內用 cafe_layout.py（和室內 cafe_interior.py 共用）：外觀座標 z＝室內座標 z − 6。從街上透過玻璃看到的
窗邊吧台、雙人桌、吧檯、書牆、吊燈，就是走進店裡看到的那些（ART_DIRECTION 第 7 節：門窗位置要和室內空間一致）。

參考：docs/art-rebuild/references/04（① 店面外觀白天、④ 店內）、05、07（黃昏店門口）；ART_DIRECTION 第 6、7 節。
不放在 GLB 裡的東西（遊戲用 canvas 畫）：招牌字、A 字立牌的字、黑板菜單的字——GLB 裡是空白板面 SIGN_FACE、ABOARD_FACE_*、MENU_FACE
（自訂屬性帶文字），UV 是整張 0～1。夜間會亮的材質（NIGHT_MATS）、店內材質（BOUNCE_MATS）、光暈位置（GLOW_* 空節點）照名稱約定。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import card, bush, pot, rand_uv, proto, combine, uv01, SX0, SX1, PIL, DOOR, POST, SILL, TRAN, HEAD   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/cafe_exterior.glb'))
RENDER = arg('--render')
TEXRES = int(arg('--texres', '512'))

W, D, GH, FH, NF = 14.0, 13.0, 3.8, 3.2, 3          # 寬、深、一樓高、樓高、樓層數（和套件相同）
TOP = GH + FH * (NF - 1)                            # 屋頂 10.2
IZ = -CL.RD / 2                                     # 室內座標 → 外觀座標：z' = z + IZ（室內前牆 z=+6 ＝ 店面玻璃 z'=0）

NIGHT_MATS = {
    'cafe_bulb': ['#fff1d6', 2.4, 1.0],
    'cafe_lampglass': ['#ffd49a', 1.5, 0.3],
    'cafe_sign_face': ['#f4ead8', 1.1, 0.15],
    'ext_glass_lit': ['#ffd9a0', 0.75, 0.0],
}
BOUNCE_MATS = {'cafe_int_floor': [0.35, 0.7], 'cafe_int_plaster': [0.42, 0.85], 'cafe_int_wood': [0.32, 0.65], 'cafe_int_ceiling': [0.35, 0.75],
               'cafe_int_beam': [0.3, 0.6], 'cafe_int_books': [0.4, 0.75], 'cafe_int_shelf': [0.32, 0.65], 'cafe_int_bar': [0.32, 0.65]}   # 白天店裡也開燈（和 zones3d.js 的 CAFE_BOUNCE 相同）

random.seed(230)
B.reset(texres=TEXRES)
root = B.group('cafe_exterior', props={'kind': 'cafe_exterior', 'w': W, 'd': D, 'gh': GH})
mat = CL.materials()

# ================================================================ 1. 建築量體（磁磚外牆、側牆、背面、屋頂）
facade = B.group('FACADE', root)
LAYOUT = {1: [(-5.15, 'grille'), (-1.75, 'awning'), (1.9, 'balcony'), (5.25, 'grille')],
          2: [(-5.15, 'awning'), (-1.75, 'grille'), (1.9, 'grille'), (5.25, 'awning')]}
WINS = []
for f, row in LAYOUT.items():
    y0 = GH + (f - 1) * FH
    for cx, kind in row:
        w_ = 2.6 if kind == 'balcony' else 2.0; h_ = 2.25 if kind == 'balcony' else 1.45; sill = y0 + (0.12 if kind == 'balcony' else 0.95)
        WINS.append((f, cx, w_, h_, sill, kind))
wall = Mesh('upper_wall', mat['tile'])
for f in range(1, NF):     # 正面牆：窗間牆＋窗下牆＋窗上牆（留窗洞，牆厚 0.25 m 就是窗洞的深度）
    y0 = GH + (f - 1) * FH; y1 = y0 + FH
    ws = sorted([w for w in WINS if w[0] == f], key=lambda w: w[1])
    xs = [-W / 2] + [v for w in ws for v in (w[1] - w[2] / 2, w[1] + w[2] / 2)] + [W / 2]
    for k in range(0, len(xs), 2): wall.box(xs[k], xs[k + 1], y0, y1, -0.25, 0)
    for w in ws:
        x0, x1 = w[1] - w[2] / 2, w[1] + w[2] / 2
        if w[4] > y0 + 0.01: wall.box(x0, x1, y0, w[4], -0.25, 0)
        if w[4] + w[3] < y1 - 0.01: wall.box(x0, x1, w[4] + w[3], y1, -0.25, 0)
wall.box(-W / 2, W / 2, TOP, TOP + 0.95, -0.22, 0)          # 女兒牆
wall.finish(facade)
side = Mesh('side_back_walls', mat['tile'])
WY0, WY1 = CL.WIN_Y - CL.WIN_H / 2, CL.WIN_Y + CL.WIN_H / 2
for s in (-1, 1):
    x0, x1 = (-W / 2, -W / 2 + 0.25) if s < 0 else (W / 2 - 0.25, W / 2)
    side.box(x0, x1, GH, TOP + 0.95, -D, -0.25)               # 二樓以上側牆
    if s < 0: side.box(x0, x1, 0, GH, -D, -0.3)               # 一樓左側牆
    else:                                                     # 一樓右側牆：留室內右牆那兩扇窗的窗洞（同位置）
        zs = [-D] + [v for c in sorted(CL.RIGHT_WINS) for v in (c + IZ - CL.WIN_W / 2, c + IZ + CL.WIN_W / 2)] + [-0.3]
        for k in range(0, len(zs), 2): side.box(x0, x1, 0, GH, zs[k], zs[k + 1])
        for c in CL.RIGHT_WINS:
            za, zb = c + IZ - CL.WIN_W / 2, c + IZ + CL.WIN_W / 2
            side.box(x0, x1, 0, WY0, za, zb); side.box(x0, x1, WY1, GH, za, zb)
side.box(-W / 2, W / 2, 0, TOP + 0.95, -D, -D + 0.25)         # 背面
side.box(-W / 2 + 0.25, W / 2 - 0.25, TOP, TOP + 0.95, -D + 0.25, -D + 0.45)
side.box(-W / 2 + 0.25, W / 2 - 0.25, CL.RH + 0.02, GH - 0.1, -D + 0.25, -0.13)   # 一樓天花板上方的樓板
side.finish(facade)
roof = Mesh('roof', mat['roof']); roof.box(-W / 2 + 0.22, W / 2 - 0.22, TOP - 0.05, TOP + 0.05, -D + 0.25, -0.22); roof.finish(facade)
band = Mesh('bands', mat['band'])
band.box(-W / 2 - 0.04, W / 2 + 0.04, TOP + 0.95, TOP + 1.03, -0.3, 0.06)
for f in range(1, NF):
    y = GH + (f - 1) * FH; band.box(-W / 2 - 0.02, W / 2 + 0.02, y - 0.1, y + 0.1, -0.25, 0.1)
for (f, cx, w_, h_, sill, kind) in WINS:
    if kind != 'balcony': band.box(cx - w_ / 2 - 0.1, cx + w_ / 2 + 0.1, sill - 0.07, sill, -0.25, 0.08)
band.finish(facade)
swf = Mesh('side_win_frames', mat['wood']); swg = Mesh('side_win_glass', mat['glass'])   # 一樓右側牆兩扇窗（外側）
for c in CL.RIGHT_WINS:
    za, zb = c + IZ - CL.WIN_W / 2, c + IZ + CL.WIN_W / 2
    swf.box(W / 2 - 0.02, W / 2 + 0.06, WY0 - 0.06, WY0, za - 0.06, zb + 0.06); swf.box(W / 2 - 0.02, W / 2 + 0.06, WY1, WY1 + 0.06, za - 0.06, zb + 0.06)
    for zz in (za - 0.06, (za + zb) / 2 - 0.03, zb): swf.box(W / 2 - 0.02, W / 2 + 0.06, WY0, WY1, zz, zz + 0.06)
    swg.quad([(W / 2 - 0.12, WY0, za), (W / 2 - 0.12, WY0, zb), (W / 2 - 0.12, WY1, zb), (W / 2 - 0.12, WY1, za)])
swf.finish(facade); swg.finish(facade)

# ================================================================ 2. 樓上的窗（鋁窗、玻璃、窗簾、窗內）、鐵窗、雨遮、冷氣、陽台、水塔
upper = B.group('UPPER', root)
alu = Mesh('win_alu', mat['alu']); glass = Mesh('win_glass', mat['win_glass']); cur = Mesh('win_curtain', mat['curtain'])
curl = Mesh('win_curtain_lit', mat['curtain_lit']); dark = Mesh('win_room', mat['room_dark'])
LIT = {(1, -5.15), (1, 1.9), (2, -1.75), (2, 5.25)}           # 晚上亮燈的住家
for (f, cx, w_, h_, sill, kind) in WINS:
    x0, x1, y0, y1 = cx - w_ / 2, cx + w_ / 2, sill, sill + h_
    fz = -0.12
    dark.box(x0, x1, y0, y1, -0.92, -0.88)
    dark.box(x0, x1, y0 - 0.02, y0, -0.9, fz); dark.box(x0, x1, y1, y1 + 0.02, -0.9, fz)
    dark.box(x0, x0 + 0.02, y0, y1, -0.9, fz); dark.box(x1 - 0.02, x1, y0, y1, -0.9, fz)
    cm = curl if (f, cx) in LIT else cur
    cw = w_ * random.uniform(0.35, 0.55)
    if random.random() < 0.5:
        cm.box(x1 - cw, x1 - 0.03, y0 + 0.03, y1 - 0.05, -0.3, -0.28); cm.box(x0 + 0.03, x0 + 0.12, y0 + 0.03, y1 - 0.05, -0.3, -0.27)
    else:
        cm.box(x0 + 0.03, x0 + cw, y0 + 0.03, y1 - 0.05, -0.3, -0.28); cm.box(x1 - 0.12, x1 - 0.03, y0 + 0.03, y1 - 0.05, -0.3, -0.27)
    t = 0.05
    alu.box(x0, x1, y0, y0 + t, fz - 0.05, fz + 0.03); alu.box(x0, x1, y1 - t, y1, fz - 0.05, fz + 0.03)
    alu.box(x0, x0 + t, y0, y1, fz - 0.05, fz + 0.03); alu.box(x1 - t, x1, y0, y1, fz - 0.05, fz + 0.03)
    alu.box(cx - 0.03, cx + 0.01, y0 + t, y1 - t, fz - 0.03, fz + 0.02); alu.box(cx - 0.01, cx + 0.03, y0 + t, y1 - t, fz - 0.06, fz - 0.01)
    if kind == 'balcony': alu.box(x0 + t, x1 - t, y0 + 1.0, y0 + 1.04, fz - 0.03, fz + 0.01)
    glass.quad([(x0 + t, y0 + t, fz - 0.01), (cx, y0 + t, fz - 0.01), (cx, y1 - t, fz - 0.01), (x0 + t, y1 - t, fz - 0.01)])
    glass.quad([(cx, y0 + t, fz - 0.04), (x1 - t, y0 + t, fz - 0.04), (x1 - t, y1 - t, fz - 0.04), (cx, y1 - t, fz - 0.04)])
for m_ in (alu, glass, cur, curl, dark): m_.finish(upper)


def grille_mesh(w_, h_, dep=0.42):
    """台北老公寓的外凸鐵窗：正面直條、上下與中間橫條、兩側直條、底下放盆栽的板條"""
    m = Mesh('grille_proto', mat['grille']); b = 0.018; n = max(6, int(w_ / 0.12))
    for i in range(n + 1):
        x = -w_ / 2 + i * w_ / n; m.box(x - b / 2, x + b / 2, 0, h_, dep - b, dep)
    for y in (0.0, 0.32, h_ * 0.55, h_ - b * 1.6): m.box(-w_ / 2, w_ / 2, y, y + b * 1.6, dep - b * 1.5, dep + 0.005)
    for s in (-1, 1):
        x = s * w_ / 2
        for k in range(4): m.box(x - b / 2, x + b / 2, 0, h_, dep * k / 3 - b / 2, dep * k / 3 + b / 2)
        for y in (0.0, h_ * 0.55, h_ - b * 1.6): m.box(x - b / 2, x + b / 2, y, y + b * 1.6, 0, dep)
    for k in range(3): m.box(-w_ / 2, w_ / 2, 0.0, 0.03, dep * (k + 0.5) / 3 - 0.03, dep * (k + 0.5) / 3 + 0.03)
    return proto(m.finish(None))


def hood_mesh(w_, dep=0.62):
    """鐵窗頂上、窗上的雨遮：斜的浪板（靠牆高、往外低）＋前緣細框"""
    m = Mesh('hood_proto', mat['corr'], tile=1.12)
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)][::-1])
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)])
    fr = Mesh('hood_frame', mat['grille']); fr.box(-w_ / 2, w_ / 2, -0.03, 0.01, dep - 0.03, dep + 0.01)
    return combine([m.finish(None), fr.finish(None)], 'hood_proto')


GR_H = 1.75
g_mesh = grille_mesh(2.3, GR_H); hood = hood_mesh(2.5)
gplants = Mesh('grille_plants', mat['fern']); gpots = Mesh('grille_pots', mat['pot_terra'])
for i, (f, cx, w_, h_, sill, kind) in enumerate(WINS):
    if kind == 'grille':
        B.instance(g_mesh, f'grille_{i}', cx, sill - 0.12, 0.0, upper); B.instance(hood, f'grille_hood_{i}', cx, sill - 0.12 + GR_H + 0.02, 0.0, upper)
        for k in range(random.randint(1, 3)):
            px = cx + random.uniform(-0.9, 0.9); pz = random.uniform(0.16, 0.28)
            pot(gpots, px, pz, 0.09, 0.16, 'taper', y0=sill - 0.09)
            bush(gplants, px, sill + 0.24, pz, 0.32, n=4, span=0.45)
    elif kind == 'awning':
        B.instance(hood, f'awning_{i}', cx, sill + h_ + 0.18, 0.0, upper)
gplants.finish(upper, uv=False); gpots.finish(upper, smooth=True)

_, bx, bw, bh, bsill, _ = [w for w in WINS if w[5] == 'balcony'][0]       # 陽台（二樓中間）
bx0, bx1, bd = bx - bw / 2 - 0.5, bx + bw / 2 + 0.5, 1.05
balm = Mesh('balcony_slab', mat['band']); balm.box(bx0, bx1, bsill - 0.14, bsill, -0.25, bd); balm.finish(upper)
balw = Mesh('balcony_parapet', mat['tile'])
balw.box(bx0, bx1, bsill, bsill + 0.55, bd - 0.12, bd); balw.box(bx0, bx0 + 0.12, bsill, bsill + 0.55, 0, bd); balw.box(bx1 - 0.12, bx1, bsill, bsill + 0.55, 0, bd)
balw.finish(upper)
balr = Mesh('balcony_rail', mat['grille'])
x = bx0 + 0.06
while x < bx1 - 0.05:
    balr.box(x - 0.01, x + 0.01, bsill + 0.55, bsill + 1.08, bd - 0.07, bd - 0.05); x += 0.13
balr.box(bx0, bx1, bsill + 1.06, bsill + 1.1, bd - 0.09, bd - 0.03)
for s in (bx0 + 0.06, bx1 - 0.06):
    z = 0.05
    while z < bd - 0.1: balr.box(s - 0.01, s + 0.01, bsill + 0.55, bsill + 1.08, z - 0.01, z + 0.01); z += 0.13
    balr.box(s - 0.02, s + 0.02, bsill + 1.06, bsill + 1.1, 0, bd)
balr.cyl((bx0 + 0.1, bsill + 2.0, bd - 0.25), (bx1 - 0.1, bsill + 2.0, bd - 0.25), 0.015, seg=6)
for s in (bx0 + 0.1, bx1 - 0.1): balr.box(s - 0.015, s + 0.015, bsill + 2.0, bsill + 2.1, -0.25, bd - 0.24)
balr.finish(upper)
bpl = Mesh('balcony_plants', mat['broad']); bpo = Mesh('balcony_pots', mat['pot_terra']); bpc = Mesh('balcony_pots2', mat['pot_cream'])
for k, px in enumerate([bx0 + 0.45, bx0 + 1.0, bx1 - 0.5, bx1 - 1.2]):
    big = k in (0, 2); r = 0.2 if big else 0.13; h = 0.36 if big else 0.22; pz = bd - 0.45
    pot(bpo if k % 2 == 0 else bpc, px, pz, r, h, y0=bsill)
    bush(bpl, px, bsill + h + (0.45 if big else 0.25), pz, 0.55 if big else 0.32, n=7 if big else 4, span=0.42)
bpl.finish(upper, uv=False); bpo.finish(upper, smooth=True); bpc.finish(upper, smooth=True)


def ac_mesh():
    """冷氣室外機（窗邊，掛在鐵架上）"""
    body = Mesh('ac_body', mat['ac']); body.box(-0.4, 0.4, 0, 0.56, 0, 0.3)
    fan = Mesh('ac_fan', mat['ac_dark']); fan.cyl((0.1, 0.28, 0.3), (0.1, 0.28, 0.305), 0.21, seg=20)
    for k in range(7): fan.box(-0.13, 0.33, 0.1 + k * 0.06, 0.11 + k * 0.06, 0.304, 0.312)
    for k in range(9): fan.box(-0.38, -0.2, 0.06 + k * 0.05, 0.075 + k * 0.05, 0.3, 0.306)
    br = Mesh('ac_bracket', mat['metal'])
    for x in (-0.4, 0.4): br.box(x - 0.02, x + 0.02, -0.06, 0.0, -0.02, 0.36); br.box(x - 0.02, x + 0.02, -0.3, 0.0, -0.02, 0.02)
    return combine([body.finish(None), fan.finish(None), br.finish(None)], 'ac_unit')


acme = ac_mesh()
pipes = Mesh('ac_pipes', mat['pipe'])
for k, (cx, y, px) in enumerate([(-3.45, GH + 0.5, 0.3), (-3.45, GH + FH + 0.5, -0.32), (3.6, GH + FH + 0.5, 0.3)]):
    B.instance(acme, f'ac_{k}', cx, y, 0.0, upper)
    pipes.cyl((cx + px, y, 0.04), (cx + px, GH + 0.15, 0.04), 0.018, seg=6)
pipes.cyl((6.78, TOP + 0.8, 0.08), (6.78, 0.15, 0.08), 0.045, seg=8)
for y in (1.2, 4.6, 7.8): pipes.box(6.72, 6.84, y, y + 0.05, -0.02, 0.13)
pipes.finish(upper)
tankm = Mesh('roof_tank', mat['tank'])
bmt = L.lathe([(0.0, 0.0), (0.55, 0.0), (0.6, 0.08), (0.6, 1.1), (0.55, 1.2), (0.25, 1.38), (0.0, 1.42)], seg=20)
tankm.add_bm(bmt, Matrix.Translation(g2b(-3.5, TOP + 0.55, -4.0))); bmt.free(); tankm.finish(upper, smooth=True)
tst = Mesh('roof_tank_stand', mat['metal'])
for sx in (-1, 1):
    for sz in (-1, 1): tst.box(-3.5 + sx * 0.45 - 0.03, -3.5 + sx * 0.45 + 0.03, TOP, TOP + 0.55, -4.0 + sz * 0.45 - 0.03, -4.0 + sz * 0.45 + 0.03)
tst.box(-4.0, -3.0, TOP + 0.5, TOP + 0.56, -4.5, -3.5); tst.finish(upper)

# ================================================================ 3. 一樓店面（共用零件）＋門楣店招牆、雨遮、招牌、壁燈
shop = B.group('SHOPFRONT', root)
sf_info = CL.storefront(mat, shop, inside=False)
fas = Mesh('fascia', mat['wood']); fas.box(SX0, SX1, HEAD, GH - 0.1, -0.12, 0.02); fas.finish(shop)
CAN_D, CAN_Y0, CAN_Y1 = 1.0, HEAD + 0.12, HEAD - 0.06
cx0, cx1 = SX0 - 0.1, SX1 + 0.1
can = Mesh('canopy', mat['wood2'], tile=1.2)
can.quad([(cx0, CAN_Y0 + 0.06, 0.02), (cx1, CAN_Y0 + 0.06, 0.02), (cx1, CAN_Y1 + 0.06, CAN_D), (cx0, CAN_Y1 + 0.06, CAN_D)][::-1])
can.quad([(cx0, CAN_Y0, 0.02), (cx1, CAN_Y0, 0.02), (cx1, CAN_Y1, CAN_D), (cx0, CAN_Y1, CAN_D)])
can.finish(shop)
ctr = Mesh('canopy_trim', mat['wood'])
ctr.box(cx0, cx1, CAN_Y1 - 0.12, CAN_Y1 + 0.08, CAN_D - 0.04, CAN_D + 0.02)
for x in (cx0, cx1): ctr.box(x - 0.03, x + 0.03, CAN_Y1 - 0.12, CAN_Y0 + 0.06, 0.02, CAN_D + 0.02)
for k in range(1, 27):
    x = cx0 + (cx1 - cx0) * k / 27; ctr.box(x - 0.02, x + 0.02, CAN_Y1 - 0.04, CAN_Y0 - 0.02, 0.05, CAN_D - 0.05)
ctr.finish(shop)
cbr = Mesh('canopy_brackets', mat['metal'])
for x in (cx0 + 0.3, -3.4, 3.4, cx1 - 0.3):
    cbr.cyl((x, CAN_Y0 - 0.6, 0.02), (x, CAN_Y1 - 0.02, CAN_D - 0.12), 0.022, seg=6); cbr.box(x - 0.05, x + 0.05, CAN_Y0 - 0.7, CAN_Y0 - 0.5, -0.02, 0.03)
    cbr.cyl((x, CAN_Y1 - 0.02, 0.06), (x, CAN_Y1 - 0.02, CAN_D - 0.1), 0.016, seg=6)
cbr.finish(shop)
SIGN_W, SIGN_Y0, SIGN_Y1 = 6.6, HEAD + 0.24, GH - 0.14
sfr = Mesh('sign_frame', mat['wood']); sfr.box(-SIGN_W / 2 - 0.08, SIGN_W / 2 + 0.08, SIGN_Y0 - 0.06, SIGN_Y1 + 0.06, 0.02, 0.16); sfr.finish(shop)
face = Mesh('SIGN_FACE', mat['board'])
face.quad([(-SIGN_W / 2, SIGN_Y0, 0.165), (SIGN_W / 2, SIGN_Y0, 0.165), (SIGN_W / 2, SIGN_Y1, 0.165), (-SIGN_W / 2, SIGN_Y1, 0.165)])
uv01(face.finish(shop, props={'sign': '兩點半 Café', 'sub': '營業 11:00–02:30', 'bg': '#3b2a1e', 'color': '#f4ead8', 'serif': 1}))
gn = Mesh('sign_lamps', mat['metal']); gb = Mesh('sign_lamp_bulbs', mat['bulb'])
for k, x in enumerate((-2.4, 0.0, 2.4)):
    y = GH + 0.12
    gn.box(x - 0.06, x + 0.06, y - 0.05, y + 0.08, -0.02, 0.03)
    gn.cyl((x, y, 0.02), (x, y + 0.14, 0.32), 0.012, seg=6); gn.cyl((x, y + 0.14, 0.32), (x, y + 0.04, 0.55), 0.012, seg=6)
    shade = L.lathe([(0.02, 0.0), (0.05, -0.02), (0.11, -0.12), (0.12, -0.14)], seg=14)
    bmesh.ops.rotate(shade, verts=shade.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(-40), 3, 'X'))
    gn.add_bm(shade, Matrix.Translation(g2b(x, y + 0.06, 0.58))); shade.free()
    gb.sphere((x, y - 0.02, 0.6), 0.035, seg=8, rings=4)
    CL.glow(root, 'signlamp', x, y - 0.06, 0.6, color='rgba(255,226,170,1)', size=0.9, day=0.0, night=0.9)
gn.finish(shop); gb.finish(shop, smooth=True)
lmet = Mesh('lanterns_metal', mat['metal']); lgl = Mesh('lanterns_glass', mat['lampglass']); lbu = Mesh('lanterns_bulb', mat['bulb'])
def lantern(x, y, z, s=1.0, arm=0.32):
    """方形燈籠壁燈（黑鐵框＋暖色玻璃）"""
    lmet.box(x - 0.05 * s, x + 0.05 * s, y + 0.1 * s, y + 0.3 * s, z - 0.03, z + 0.01)
    lmet.cyl((x, y + 0.24 * s, z), (x, y + 0.3 * s, z + arm), 0.014 * s, seg=6)
    lmet.cyl((x, y + 0.3 * s, z + arm), (x, y + 0.2 * s, z + arm), 0.01 * s, seg=6)
    cz = z + arm; h = 0.3 * s; r = 0.09 * s
    lmet.box(x - r - 0.015, x + r + 0.015, y + 0.17 * s, y + 0.2 * s, cz - r - 0.015, cz + r + 0.015)
    lmet.box(x - r * 0.6, x + r * 0.6, y + 0.2 * s, y + 0.23 * s, cz - r * 0.6, cz + r * 0.6)
    lmet.box(x - r - 0.01, x + r + 0.01, y - h + 0.17 * s, y - h + 0.2 * s, cz - r - 0.01, cz + r + 0.01)
    for sx in (-1, 1):
        for sz in (-1, 1): lmet.box(x + sx * r - 0.008, x + sx * r + 0.008, y - h + 0.17 * s, y + 0.17 * s, cz + sz * r - 0.008, cz + sz * r + 0.008)
    lgl.box(x - r + 0.004, x + r - 0.004, y - h + 0.2 * s, y + 0.17 * s, cz - r + 0.004, cz + r - 0.004)
    lbu.sphere((x, y + 0.02 * s, cz), 0.035 * s, seg=8, rings=4)
    CL.glow(root, 'lantern', x, y + 0.02 * s, cz, size=1.6 * s, day=0.2, night=1.0)
for s in (-1, 1):
    lantern(s * (W / 2 - PIL / 2), 2.45, 0.07, 1.15)
    lantern(s * (DOOR + POST / 2), 2.05, 0.09, 0.8, arm=0.2)
lmet.finish(shop); lgl.finish(shop); lbu.finish(shop, smooth=True)

# ================================================================ 4. 店內（和室內區域同一套配置；外觀 z' = 室內 z − 6）
inside = CL.grp('INTERIOR', root, z=IZ)
res = CL.interior(mat, inside, lite=True, half_w=W / 2 - 0.37)
uv01(res['menu'].finish(inside, props={'menu': ['今日手沖', '衣索比亞　耶加雪菲', '瓜地馬拉　安提瓜', '拿鐵　120　・　檸檬塔　90']}))
for (x, y, z) in res['glows']: CL.glow(root, 'pendant', x, y, z + IZ, color='rgba(255,200,130,1)', size=1.5, day=0.55, night=1.0)

# ================================================================ 5. 爬藤（壁柱往上爬到雨遮、招牌兩側；從雨遮前緣垂下）
ivy = Mesh('ivy', mat['ivy'])
for s in (-1, 1):
    x = s * (W / 2 - PIL / 2)
    y = 0.45
    while y < GH + 0.6:
        for _ in range(3 if y < 2.6 else 2):
            w_ = random.uniform(0.45, 0.75)
            card(ivy, x + random.uniform(-0.18, 0.18), y + random.uniform(-0.1, 0.1), 0.09 + random.uniform(0, 0.08), w_, w_,
                 ry=random.uniform(-0.25, 0.25), rx=random.uniform(-0.25, 0.25), uv=rand_uv(0.45))
        y += 0.32
    for _ in range(9):
        w_ = random.uniform(0.4, 0.7)
        card(ivy, x - s * random.uniform(0.3, 1.6), random.uniform(HEAD + 0.1, GH + 0.5), random.uniform(0.17, 0.26), w_, w_ * 1.2,
             ry=random.uniform(-0.3, 0.3), rx=random.uniform(-0.2, 0.2), uv=rand_uv(0.45))
    for _ in range(6):
        w_ = random.uniform(0.35, 0.55)
        card(ivy, x - s * random.uniform(0.2, 1.2), CAN_Y1 - random.uniform(0.15, 0.45), CAN_D + random.uniform(-0.03, 0.05), w_, w_ * 1.5,
             ry=random.uniform(-0.2, 0.2), uv=rand_uv(0.4))
ivy.finish(shop, uv=False)

# ================================================================ 6. 門口道具：兩組盆栽（在原本的導航阻擋範圍內）、壁柱花台、窗台小盆栽、A 字立牌
props = B.group('PROPS', root)
pl1 = Mesh('pots_terracotta', mat['pot_terra']); pl2 = Mesh('pots_cream', mat['pot_cream']); pl3 = Mesh('pots_dark', mat['pot_dark'])
soil = Mesh('pots_soil', mat['soil'])
lv_b = Mesh('plants_broad', mat['broad']); lv_o = Mesh('plants_olive', mat['olive']); lv_f = Mesh('plants_fern', mat['fern']); trk = Mesh('plants_trunk', mat['trunk'])
def potted(cx, cz, r, h, potm, plant):
    pot(potm, cx, cz, r, h); soil.cyl((cx, h - 0.06, cz), (cx, h - 0.04, cz), r * 0.9, seg=14)
    if plant == 'olive':
        trk.cyl((cx, h - 0.05, cz), (cx + 0.03, h + 0.75, cz), 0.03, seg=6); trk.cyl((cx + 0.03, h + 0.55, cz), (cx + 0.2, h + 0.95, cz + 0.05), 0.018, seg=5)
        bush(lv_o, cx + 0.06, h + 1.05, cz, 0.55, n=12, span=0.42, flat_y=1.3)
    elif plant == 'broad':
        for k in range(7):
            a = random.uniform(0, 2 * math.pi)
            card(lv_b, cx + math.cos(a) * 0.18, h + random.uniform(0.25, 0.75), cz + math.sin(a) * 0.18, 0.5, 0.5, ry=a, rx=random.uniform(-0.6, 0.2), uv=rand_uv(0.4))
    else:
        bush(lv_f, cx, h + 0.22, cz, 0.42, n=7, span=0.5, flat_y=0.8)
for (cx, cz, r, h, pm_, pt) in ((4.78, 0.55, 0.24, 0.5, pl1, 'olive'), (5.35, 0.62, 0.17, 0.32, pl2, 'fern'), (5.92, 0.52, 0.22, 0.42, pl3, 'broad'),
                                (-4.32, 0.55, 0.22, 0.46, pl2, 'broad'), (-3.75, 0.6, 0.15, 0.3, pl1, 'fern'), (-3.27, 0.52, 0.2, 0.55, pl3, 'olive')):
    potted(cx, cz, r, h, pm_, pt)
for s in (-1, 1):
    x = s * (W / 2 - PIL / 2); pl3.box(x - 0.27, x + 0.27, 0, 0.38, 0.06, 0.25); soil.box(x - 0.24, x + 0.24, 0.36, 0.37, 0.08, 0.23)
    bush(lv_f, x, 0.55, 0.16, 0.38, n=6, span=0.5, flat_y=0.7)
for xs in sf_info['bays']:
    for k in range(len(xs) - 1):
        if random.random() < 0.55:
            cx = (xs[k] + xs[k + 1]) / 2 + random.uniform(-0.3, 0.3)
            pot(pl1, cx, 0.065, 0.065, 0.12, y0=SILL + 0.06); bush(lv_f, cx, SILL + 0.3, 0.065, 0.22, n=3, span=0.4, flat_y=0.6)
for m_ in (pl1, pl2, pl3): m_.finish(props, smooth=True)
soil.finish(props); trk.finish(props)
for m_ in (lv_b, lv_o, lv_f): m_.finish(props, uv=False)

AX, AZ = 3.6, 1.0           # A 字立牌（面向街道；兩面黑板，字由遊戲畫）
ab = Mesh('aboard_wood', mat['wood2'])
for sgn in (-1, 1):
    for dx in (-0.29, 0.29): ab.cyl((AX + dx, 0.0, AZ + sgn * 0.24), (AX + dx, 1.05, AZ + sgn * 0.03), 0.022, seg=6)
    ab.box(AX - 0.3, AX + 0.3, 0.98, 1.05, AZ + sgn * 0.035 - 0.025, AZ + sgn * 0.035 + 0.025)
    ab.box(AX - 0.3, AX + 0.3, 0.24, 0.29, AZ + sgn * 0.215 - 0.025, AZ + sgn * 0.215 + 0.025)
ab.finish(props)
for sgn, nm in ((1, 'ABOARD_FACE_front'), (-1, 'ABOARD_FACE_back')):
    fm = Mesh(nm, mat['chalk'])
    y0, y1 = 0.29, 0.98; z0, z1 = AZ + sgn * 0.205, AZ + sgn * 0.045
    q = [(AX - 0.27, y0, z0), (AX + 0.27, y0, z0), (AX + 0.27, y1, z1), (AX - 0.27, y1, z1)]
    if sgn < 0: q = [q[1], q[0], q[3], q[2]]
    fm.quad(q); uv01(fm.finish(props, props={'aboard': ['今日手沖', '衣索比亞', '耶加雪菲', '—', '讀書位 有']}))

# ================================================================ 合併同材質的零件（少很多 draw call）；招牌、立牌、菜單板面要單獨（遊戲換 canvas 貼圖）
L.merge_by_material(root, keep=lambda ob: any(k in ob.name for k in ('SIGN_FACE', 'ABOARD_FACE', 'MENU_FACE')))
info = L.export(OUT, gpu_instances=True)
info.update({'night_mats': NIGHT_MATS, 'bounce_mats': BOUNCE_MATS})
L.write_json(OUT[:-4] + '.json', info)
if RENDER:
    B.render_views(RENDER, 'cafe', [
        ('street', (-5.5, 1.7, 9.5), (0.5, 2.6, -0.5)),
        ('front', (0.0, 1.6, 8.5), (0.0, 3.4, 0.0)),
        ('door', (2.2, 1.6, 3.6), (-0.4, 1.6, -0.6)),
    ], lights=[(-4.0, 2.1, -3.5, 30), (0.0, 2.1, -4.5, 30), (4.5, 2.1, -4.5, 30), (-2.5, 2.2, -10.4, 40)], lens=22, res=(1280, 800))
