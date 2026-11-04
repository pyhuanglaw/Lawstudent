"""2:30 AM（原兩點半 Café；溫州街東端路口）建築外觀＋一樓店面＋門口道具 → GLB；店面玻璃後面是完整的店內（和室內區域同一套配置）。
WZ-FIVE-1104（LAWWW2-C 2026-11-04，AA_654；參考圖＝企劃線 docs/story_planning/ref_images/shops/wz_230am_ext.webp，使用者自己生成的）：
  一樓改成參考圖的樣子——奶油色粗灰泥的壁柱和轉角一樓側牆、深綠招牌帶（門窗頂到二樓樓板，往外凸、包過右邊轉角）、招牌字「2:30 AM」、
  黑色圓筒上下出光的壁燈、氣窗和門的木格子、畫架黑板（營業時間 11:00–02:30）、從轉角招牌帶垂下來的爬藤；拿掉原本的木雨遮和咖啡色招牌框。
  參考圖的轉角在左邊，遊戲在右邊（x=+7），所以是鏡像。樓上（磁磚、鐵窗、陽台、冷氣）照舊。
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
mat['stucco'] = L.pbr('cafe230_stucco', 'white_plaster_02', tile=1.4, target='#e3d5b9', normal=1.0, rough_value=0.88)   # 參考圖的奶油色粗灰泥（WZ-FIVE-1104）
mat['fascia_green'] = L.pbr('cafe230_fascia', 'plaster_grey_04', tile=1.2, target='#1c2c23', maps=('diff',), res=256, rough_value=0.5)   # 深綠招牌帶（漆面）
mat['board'] = L.pbr('cafe_sign_face', None, tint=B.srgb('#1c2c23'), rough=0.7)   # 招牌面：遊戲換成 canvas（深綠底＋奶油色字）；預覽時和招牌帶同色
mat['pier'] = mat['stucco']   # 一樓壁柱：咖啡色外牆板 → 灰泥（CL.storefront 讀 mat['pier']）

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
        if w[4] > y0 + 0.01: wall.box(x0, x1, y0, w[4] - 0.01, -0.25, 0)   # 停在窗台裡面（低 1 cm）：原本牆頂和窗台頂同一個平面，會閃（BUG-WZFLICKER）
        if w[4] + w[3] < y1 - 0.01: wall.box(x0, x1, w[4] + w[3], y1, -0.25, 0)
wall.box(-W / 2, W / 2, TOP, TOP + 0.95, -0.22, 0)          # 女兒牆
wall.finish(facade)
side = Mesh('side_back_walls', mat['tile']); st1 = Mesh('side_1f_stucco', mat['stucco']); sbase = Mesh('side_1f_base', mat['base'])
WY0, WY1 = CL.WIN_Y - CL.WIN_H / 2, CL.WIN_Y + CL.WIN_H / 2
for s in (-1, 1):
    x0, x1 = (-W / 2, -W / 2 + 0.25) if s < 0 else (W / 2 - 0.25, W / 2)
    side.box(x0, x1, GH, TOP + 0.95, -D, -0.25)               # 二樓以上側牆
    if s < 0: side.box(x0, x1, 0, GH, -D, -0.3)               # 一樓左側牆
    else:                                                     # 一樓右側牆（轉角那一面，灰泥）：留室內右牆那兩扇窗的窗洞（同位置）
        zs = [-D] + [v for c in sorted(CL.RIGHT_WINS) for v in (c + IZ - CL.WIN_W / 2, c + IZ + CL.WIN_W / 2)] + [-0.3]
        for k in range(0, len(zs), 2): st1.box(x0, x1, 0, GH, zs[k], zs[k + 1])
        for c in CL.RIGHT_WINS:
            za, zb = c + IZ - CL.WIN_W / 2, c + IZ + CL.WIN_W / 2
            st1.box(x0, x1, 0, WY0, za, zb); st1.box(x0, x1, WY1, GH, za, zb)
        sbase.box(x1 - 0.005, x1 + 0.03, 0, 0.42, -D, -0.3)   # 牆腳石（和正面壁柱同一種）
side.box(-W / 2 + 0.25, W / 2 - 0.25, 0, TOP + 0.95, -D, -D + 0.25)   # 背面（夾在兩面側牆中間：原本伸到側牆外緣，兩端的面和側牆外面同一個平面，從路口看後面的轉角會閃）
side.box(-W / 2 + 0.25, W / 2 - 0.25, TOP, TOP + 0.95, -D + 0.25, -D + 0.45)
side.box(-W / 2 + 0.25, W / 2 - 0.25, CL.RH + 0.02, GH - 0.1, -D + 0.25, -0.13)   # 一樓天花板上方的樓板
side.finish(facade); st1.finish(facade); sbase.finish(facade)
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
    e = 0.006   # 窗內房間往內縮 6 mm：原本地板、天花板、左右剛好在窗洞的四個側面上（和窗台頂、牆同一個平面），從玻璃斜看會閃（BUG-WZFLICKER）
    dark.box(x0 + e, x1 - e, y0 - 0.02 + e, y0 + e, -0.9, fz); dark.box(x0 + e, x1 - e, y1 - e, y1 + 0.02 - e, -0.9, fz)
    dark.box(x0 + e, x0 + 0.02 + e, y0 + e, y1 - e, -0.9, fz); dark.box(x1 - 0.02 - e, x1 - e, y0 + e, y1 - e, -0.9, fz)
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
# 深綠招牌帶（參考圖；WZ-FIVE-1104）：門窗頂到二樓樓板線下面、往外凸 BAND_D，正面整條＋包過右邊轉角、沿著側面到店的後牆（店深 12 m）
BAND_Y0, BAND_Y1, BAND_D, BAND_Z0 = HEAD - 0.02, GH - 0.12, 0.32, -12.0
CAN_D, CAN_Y1 = BAND_D, BAND_Y0             # 爬藤、垂吊植物照招牌帶的前緣、底邊
fz = Mesh('fascia_green', mat['fascia_green'])
fz.box(-W / 2, W / 2 + BAND_D, BAND_Y0, BAND_Y1, 0.0, BAND_D)                         # 正面（右端多一個帶深，和側面接成轉角）
fz.box(W / 2, W / 2 + BAND_D, BAND_Y0, BAND_Y1, BAND_Z0, 0.0)                        # 右側面
fz.finish(shop)
ftr = Mesh('fascia_trim', mat['metal'])                                              # 上緣一條深色壓條、下緣的滴水邊
ftr.box(-W / 2, W / 2 + BAND_D + 0.025, BAND_Y1, BAND_Y1 + 0.035, -0.02, BAND_D + 0.025); ftr.box(W / 2 - 0.02, W / 2 + BAND_D + 0.025, BAND_Y1, BAND_Y1 + 0.035, BAND_Z0, -0.02)
ftr.box(-W / 2, W / 2 + BAND_D + 0.012, BAND_Y0 - 0.025, BAND_Y0, BAND_D - 0.02, BAND_D + 0.012); ftr.box(W / 2 + BAND_D - 0.02, W / 2 + BAND_D + 0.012, BAND_Y0 - 0.025, BAND_Y0, BAND_Z0, BAND_D - 0.02)
ftr.finish(shop)
SIGN_W, SIGN_Y0, SIGN_Y1 = 6.6, BAND_Y0 + 0.06, BAND_Y1 - 0.04
face = Mesh('SIGN_FACE', mat['board'])                                               # 字由遊戲畫（zones3d.js cafeSignTex）：底色和招牌帶同色、奶油色襯線字
face.quad([(-SIGN_W / 2, SIGN_Y0, BAND_D + 0.006), (SIGN_W / 2, SIGN_Y0, BAND_D + 0.006), (SIGN_W / 2, SIGN_Y1, BAND_D + 0.006), (-SIGN_W / 2, SIGN_Y1, BAND_D + 0.006)])
uv01(face.finish(shop, props={'sign': '2:30 AM', 'bg': '#1c2c23', 'color': '#efe2c2', 'serif': 1}))
gn = Mesh('sign_lamps', mat['metal']); gb = Mesh('sign_lamp_bulbs', mat['bulb'])        # 招牌上面的鵝頸燈（往下照字）
for k, x in enumerate((-2.4, 0.0, 2.4)):
    y = GH + 0.12
    gn.box(x - 0.06, x + 0.06, y - 0.05, y + 0.08, -0.02, 0.03)
    gn.cyl((x, y, 0.02), (x, y + 0.14, 0.32), 0.012, seg=6); gn.cyl((x, y + 0.14, 0.32), (x, y + 0.04, 0.62), 0.012, seg=6)
    shade = L.lathe([(0.02, 0.0), (0.05, -0.02), (0.11, -0.12), (0.12, -0.14)], seg=14)
    bmesh.ops.rotate(shade, verts=shade.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(-40), 3, 'X'))
    gn.add_bm(shade, Matrix.Translation(g2b(x, y + 0.06, 0.65))); shade.free()
    gb.sphere((x, y - 0.02, 0.67), 0.035, seg=8, rings=4)
    CL.glow(root, 'signlamp', x, y - 0.06, 0.67, color='rgba(255,226,170,1)', size=0.9, day=0.0, night=0.9)
gn.finish(shop); gb.finish(shop, smooth=True)
# 氣窗、門的木格子（參考圖：深色木框、上面一排小格子；外面那一面）
mun = Mesh('shop_muntins', mat['wood'])
for xs in sf_info['bays']:
    for k in range(len(xs) - 1):
        a, b_ = xs[k] + 0.045, xs[k + 1] - 0.045
        for j in (1, 2): u = a + (b_ - a) * j / 3; mun.box(u - 0.018, u + 0.018, TRAN + 0.08, HEAD - 0.1, -0.012, 0.022)
for sgn in (-1, 1):
    x0, x1 = sorted((sgn * 0.106, sgn * (DOOR - 0.1))); xm = (x0 + x1) / 2
    for (ya, yb) in ((0.32, 1.02), (1.08, TRAN - 0.14)): mun.box(xm - 0.016, xm + 0.016, ya, yb, -0.012, 0.022)
    for yy in (0.67, 1.48, 1.86): mun.box(x0, x1, yy - 0.016, yy + 0.016, -0.012, 0.022)
mun.finish(shop)
lmet = Mesh('lanterns_metal', mat['metal']); lgl = Mesh('lanterns_glass', mat['lampglass']); lbu = Mesh('lanterns_bulb', mat['bulb'])
def sconce(x, y, z, s=1.0):
    """壁燈（參考圖：黑色圓筒，上下兩頭出光；牆面在 z）"""
    lmet.box(x - 0.055 * s, x + 0.055 * s, y - 0.09 * s, y + 0.09 * s, z - 0.02, z + 0.012)
    lmet.cyl((x, y, z + 0.01), (x, y, z + 0.08 * s), 0.014 * s, seg=6)
    r = 0.062 * s; cz = z + 0.08 * s + r
    lmet.cyl((x, y - 0.13 * s, cz), (x, y + 0.13 * s, cz), r, seg=16)
    for sg in (-1, 1):
        lgl.cyl((x, y + sg * 0.13 * s, cz), (x, y + sg * 0.136 * s, cz), r * 0.82, seg=16)
        lbu.sphere((x, y + sg * 0.1 * s, cz), 0.022 * s, seg=8, rings=4)
    CL.glow(root, 'sconce', x, y - 0.22 * s, cz, size=1.3 * s, day=0.15, night=1.0); CL.glow(root, 'sconce', x, y + 0.22 * s, cz, size=1.0 * s, day=0.1, night=0.85)
for sgn in (-1, 1):
    sconce(sgn * (W / 2 - PIL / 2), 2.25, 0.06, 1.15)
    sconce(sgn * (DOOR + POST / 2), 2.0, 0.08, 0.85)
lmet.finish(shop); lgl.finish(shop); lbu.finish(shop, smooth=True)

# ================================================================ 4. 店內（和室內區域同一套配置；外觀 z' = 室內 z − 6）
inside = CL.grp('INTERIOR', root, z=IZ)
res = CL.interior(mat, inside, lite=True, half_w=W / 2 - 0.37)
uv01(res['menu'].finish(inside, props={'menu': ['今日手沖', '衣索比亞　耶加雪菲', '瓜地馬拉　安提瓜', '拿鐵　120　・　檸檬塔　90']}))
for (x, y, z) in res['glows']: CL.glow(root, 'pendant', x, y, z + IZ, color='rgba(255,200,130,1)', size=1.5, day=0.55, night=1.0)

# ================================================================ 5. 爬藤（參考圖：從轉角的招牌帶上面垂下來一大片；兩邊壁柱下半段有一些）
ivy = Mesh('ivy', mat['ivy'])
for s in (-1, 1):                                   # 壁柱下半段（壁燈 2.25 m 以下，不蓋到燈）
    x = s * (W / 2 - PIL / 2); y = 0.45
    while y < 1.75:
        for _ in range(2):
            w_ = random.uniform(0.4, 0.62)
            card(ivy, x + random.uniform(-0.16, 0.16), y + random.uniform(-0.1, 0.1), 0.09 + random.uniform(0, 0.06), w_, w_,
                 ry=random.uniform(-0.25, 0.25), rx=random.uniform(-0.25, 0.25), uv=rand_uv(0.45))
        y += 0.34 if s > 0 else 0.5
for _ in range(16):                                 # 轉角：正面招牌帶前緣垂下（x 4.6～7.3）
    w_ = random.uniform(0.38, 0.6); xx = random.uniform(4.6, W / 2 + BAND_D); hh = w_ * random.uniform(1.4, 2.0)
    card(ivy, xx, BAND_Y0 + 0.08 - hh * random.uniform(0.25, 0.5), BAND_D + random.uniform(0.01, 0.06), w_, hh, ry=random.uniform(-0.25, 0.25), uv=rand_uv(0.4))
for _ in range(12):                                 # 轉角：側面招牌帶前緣垂下（z −1.8～0.3）
    w_ = random.uniform(0.38, 0.6); zz = random.uniform(-1.8, BAND_D); hh = w_ * random.uniform(1.4, 2.0)
    card(ivy, W / 2 + BAND_D + random.uniform(0.01, 0.06), BAND_Y0 + 0.08 - hh * random.uniform(0.25, 0.5), zz, w_, hh, ry=math.pi / 2 + random.uniform(-0.25, 0.25), uv=rand_uv(0.4))
for _ in range(10):                                 # 招牌帶頂上冒出來、蓋過轉角的上緣（從二樓的花台垂下來）
    w_ = random.uniform(0.4, 0.65)
    card(ivy, random.uniform(5.4, W / 2 + BAND_D), BAND_Y1 + random.uniform(-0.05, 0.25), random.uniform(0.05, BAND_D + 0.04), w_, w_, ry=random.uniform(-0.6, 0.6), rx=random.uniform(-0.5, 0.2), uv=rand_uv(0.45))
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

AX, AZ = 3.6, 1.0           # 畫架黑板（參考圖：木畫架、營業時間；面向街道，字由遊戲畫）。導航照舊：遊戲 blockCircle(半徑 0.35)，三支腳都在圓裡
ab = Mesh('aboard_wood', mat['wood2'])
EH, EW, ET = 1.42, 0.5, math.radians(12)      # 板頂高、板寬、往後仰
def ep(lx, y, lz=0.0):                         # 畫架的本地座標（板面中心線在 z=AZ；往後仰：越高越往後）
    return (AX + lx, y, AZ + lz - (y - 0.35) * math.tan(ET))
for lx in (-0.24, 0.24): ab.cyl(ep(lx, 0.0, 0.12), ep(lx * 0.8, EH + 0.06), 0.017, seg=6)        # 前面兩支腳
ab.cyl((AX, 0.0, AZ - 0.3), ep(0.0, EH - 0.05, -0.03), 0.015, seg=6)                            # 後面一支腳
ab.box(AX - 0.29, AX + 0.29, 0.52, 0.56, ep(0, 0.54)[2] + 0.01, ep(0, 0.54)[2] + 0.07)              # 放板子的橫木
fr0, fr1 = 0.56, 0.56 + 0.62
for (y0_, y1_) in ((fr0, fr0 + 0.03), (fr1 - 0.03, fr1)): ab.box(AX - EW / 2 - 0.02, AX + EW / 2 + 0.02, y0_, y1_, ep(0, (y0_ + y1_) / 2)[2] - 0.012, ep(0, (y0_ + y1_) / 2)[2] + 0.012)
ab.finish(props)
fm = Mesh('ABOARD_FACE_front', mat['chalk'])
q = [ep(-EW / 2, fr0 + 0.03, 0.014), ep(EW / 2, fr0 + 0.03, 0.014), ep(EW / 2, fr1 - 0.03, 0.014), ep(-EW / 2, fr1 - 0.03, 0.014)]
fm.quad(q); uv01(fm.finish(props, props={'aboard': ['Business Hours', '11:00 – 02:30', '今日手沖', '讀書位 有']}))
fb_ = Mesh('ABOARD_FACE_back', mat['chalk'])                                                  # 板子背面也是黑板（往店裡那一面寫手沖菜單；遊戲照舊畫兩面：tests/cafe_glb_integration.py 要四個字面）
fb_.quad([ep(EW / 2, fr0 + 0.03, -0.014), ep(-EW / 2, fr0 + 0.03, -0.014), ep(-EW / 2, fr1 - 0.03, -0.014), ep(EW / 2, fr1 - 0.03, -0.014)])
uv01(fb_.finish(props, props={'aboard': ['今日手沖', '衣索比亞', '耶加雪菲', '—', '讀書位 有']}))

# ================================================================ 合併同材質的零件（少很多 draw call）；招牌、立牌、菜單板面要單獨（遊戲換 canvas 貼圖）
# 純色材質改成三個頂點色材質（第二輪減量，2026-10-10；lib2.vc_consolidate）：亮面（瓷杯、檯面、釉面盆）、霧面、金屬，各一次 draw call。
# 屋頂板不併（它投影；這三組在遊戲裡都不投影：zones3d.js 的 WZ_NO_SHADOW）
L.vc_consolidate(root, {**dict.fromkeys(('cafe_ceramic_white', 'cafe_int_bartop', 'cafe_pot_cream', 'cafe_pot_dark', 'cafe_pl_leaf_dark', 'cafe_pl_leaf_mid'), L.vc_material('cafe_vc_gloss', rough=0.35)),
                        **dict.fromkeys(('cafe_pot_terracotta', 'cafe_soil', 'cafe_trunk', 'cafe_cake', 'cafe_ac_body', 'cafe_ac_fan', 'cafe_pipe', 'cafe_curtain', 'cafe_room_dark', 'cafe_pl_bark', 'cafe_pl_soil_pot'), L.vc_material('cafe_vc_matte', rough=0.85)),
                        **dict.fromkeys(('cafe_brass', 'cafe_iron_black', 'cafe_steel', 'cafe_grille', 'cafe_tank_steel', 'cafe_alu'), L.vc_metal('cafe_vc_metal', rough=0.4, metal=0.4))})
_keep = lambda ob: any(k in ob.name for k in ('SIGN_FACE', 'ABOARD_FACE', 'MENU_FACE'))
L.realize_small_instances(root, keep=_keep)   # 第三輪減量（2026-10-16）：只擺幾個的 instancing（凳子、桌子、冷氣、鐵窗、雨遮）合進大網格；多材質的零件拆開再合
L.split_by_material(root, keep=_keep)
# 效能第二輪（2026-10-16）：玻璃看進去的店內（地板、牆、木頭、天花板、樑、書、層架、吧台）八個貼圖材質合成一張 cafe_int_atlas——
# 遊戲的 CAFE_BOUNCE（白天店裡也開燈）要加一行 cafe_int_atlas；名字是 cafe_int_ 開頭，WZ_NO_SHADOW 照舊不投影。外面的小貼圖材質另一張。
L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', 'cafe_int_atlas.png'), 'cafe_int_atlas', only=set(BOUNCE_MATS), max_tris=6000, max_rep=8, cell=256, rough=0.6, keep=_keep)
L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', 'cafe_ext_small_atlas.png'), 'cafe_ext_small_atlas', protect=set(NIGHT_MATS) | set(BOUNCE_MATS) | {'cafe230_stucco', 'cafe230_fascia'}, max_tris=600, keep=_keep)   # 灰泥、招牌帶不併（WZ-FIVE-1104：併進小貼圖集細節和顏色都會被壓掉）
L.atlas_rows(root, os.path.join(HERE, 'textures', 'gen', 'cafe_int_rows.jpg'), 'cafe_int_rows', only=set(BOUNCE_MATS), max_tris=4000, max_vloss=0.06, keep=_keep)   # 店內剩下的（牆、樑、天花板、木頭）：CAFE_BOUNCE 也要加 cafe_int_rows
L.atlas_rows(root, os.path.join(HERE, 'textures', 'gen', 'cafe_ext_rows.jpg'), 'cafe_ext_rows', protect=set(NIGHT_MATS) | set(BOUNCE_MATS) | {'cafe230_stucco', 'cafe230_fascia'}, max_vloss=0.06, keep=_keep, skip=lambda m: m.name.startswith(('cafe_int_atlas', 'cafe_ext_small_atlas')))
L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', 'cafe_leaf_atlas.png'), 'cafe_leaf_atlas', alpha=True, max_tris=4000, keep=_keep, rough=0.7)   # 效能第三輪：四種葉片卡合一張（名字 cafe_leaf_ 開頭：遊戲照舊雙面＋alphaTest）
L.merge_by_material(root, keep=_keep)
info = L.export(OUT, gpu_instances=True)
info.update({'night_mats': NIGHT_MATS, 'bounce_mats': BOUNCE_MATS})
L.write_json(OUT[:-4] + '.json', info)
if RENDER:
    B.render_views(RENDER, 'cafe', [
        ('street', (-5.5, 1.7, 9.5), (0.5, 2.6, -0.5)),
        ('front', (0.0, 1.6, 8.5), (0.0, 3.4, 0.0)),
        ('door', (2.2, 1.6, 3.6), (-0.4, 1.6, -0.6)),
    ], lights=[(-4.0, 2.1, -3.5, 30), (0.0, 2.1, -4.5, 30), (4.5, 2.1, -4.5, 30), (-2.5, 2.2, -10.4, 40)], lens=22, res=(1280, 800))
