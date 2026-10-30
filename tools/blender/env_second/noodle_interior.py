"""阿鳳麵店（遊戲 noodle 區域，公館南側店面）室內 → GLB。第二 AI 工作階段（環境美術）製作；Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/noodle_interior.py [-- --out assets/models/env/second_ai/noodle_interior.glb]

座標＝遊戲 noodle 區域的座標（room() 10×9×3.2 m，店面在 z=+4.5，窗在 x=±3，門在中間）。
只換畫面：導航、三張桌子的座位（故事用的 z.seats，坐下吃麵）、離開 (0,4.2)、出生點在 src/zones3d.js 的 noodle 區塊，不變；
煮麵台、桌椅的位置和大小照套件（kitchen 6×1.2 在 (−1,−3.8)、桌子 1.4×0.9 在 x＝−3／0／3、z＝0.5，椅子在 z＝−0.3／1.3），沒有加新的障礙物。
椅子座面高度和套件一樣（0.485 m），坐下的姿勢不用改。

台灣的小麵店：牆的下半是白色小方磚、上半奶油色；一整排紅紙菜單（字用 canvas）、價目板「乾麵 60・餛飩湯 70・滷蛋 15」；
不鏽鋼煮麵台（煮麵爐＋麵杓、湯鍋、滷味玻璃櫃、碗盤堆、調味罐）、紅色鐵椅＋白色美耐板桌（每桌：辣椒罐、醋、醬油、筷筒、面紙盒）、
桌上的乾麵與餛飩湯、牆上的電扇、角落高處的電視、日光燈管、店面玻璃窗與門。
會淡出的牆：WALL_<front|back|left|right>_*（自訂屬性 dir＝往室內的法線；遊戲 attachRoomGLB）。字（菜單）用 canvas：SIGN_FACE_*。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import uv01, combine   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/noodle_interior.glb'))
# --layout longtable：2D 背景 noodle_table 用（交接包 v2 C11／C21「考完的晚餐」，tools/blender/env_second/bg_noodle_table.py）——
# 中間和右邊兩張桌子併成一張長桌（2.8×0.9 m，x＝−0.7～2.1）、八張椅子（兩側各三、兩頭各一）、桌上多幾碗麵和小菜；左邊那張照舊。預設 game＝遊戲裡的配置，不變
LAYOUT = arg('--layout', 'game')

W, D, H = 10.0, 9.0, 3.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
random.seed(60)
B.reset(texres=512)
root = B.group('noodle_interior', props={'kind': 'noodle_interior', 'w': W, 'd': D, 'h': H})
M = {
    'floor': L.pbr('ndl_floor', 'terrazzo_tiles', tile=1.4, target='#b7ab98', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'tile': L.pbr('ndl_wall_tile', 'rounded_square_tiled_wall', tile=0.6, target='#ecebe6', normal=0.7, maps=('diff', 'nor'), rough_value=0.3),
    'paint': L.flat('ndl_wall_paint', '#efe3cc', rough=0.85), 'trim': L.flat('ndl_trim', '#8a3b2e', rough=0.5),
    'ceil': L.flat('ndl_ceiling', '#f1ece2', rough=0.9, cull=True), 'tube': L.flat('ndl_tube', '#ffffff', rough=0.3, emit=B.srgb('#fff4e0')),
    # 不鏽鋼（NOODLE-LM-1030 改）：原本金屬度 0.6／0.5（lib2 夾到 0.45）——遊戲沒有環境貼圖，金屬度高只剩高光，煮麵台、湯鍋整片接近黑的；
    # 改成金屬度 0.2、顏色亮一點，看起來是一般小麵店的霧面不鏽鋼
    'steel': L.flat('ndl_steel', '#c4c8cb', rough=0.35, metal=0.2), 'steel_dark': L.flat('ndl_steel_dark', '#959a9f', rough=0.4, metal=0.2),
    'table': L.flat('ndl_table_top', '#f1efe9', rough=0.35), 'tedge': L.flat('ndl_table_edge', '#9aa0a5', rough=0.35, metal=0.5),
    'chair': L.flat('ndl_chair_red', '#c23f35', rough=0.45), 'leg': L.flat('ndl_chair_leg', '#4a4f55', rough=0.45, metal=0.4),
    'bowl': L.flat('ndl_bowl', '#f3f0e8', rough=0.3), 'noodle': L.flat('ndl_noodle', '#e3c27a', rough=0.6), 'soup': L.flat('ndl_soup', '#c08a4a', rough=0.15),
    'black': L.flat('ndl_black', '#1f2022', rough=0.4), 'red': L.flat('ndl_red_jar', '#b3271c', rough=0.3), 'wood': L.pbr('ndl_wood', 'dark_wood', tile=0.8, target='#6b4a30', maps=('diff',), res=256, rough_value=0.6),
    'glass': L.flat('ndl_glass', '#dfe9ec', rough=0.05, alpha=0.18), 'frame': L.flat('ndl_frame', '#9aa0a5', rough=0.35, metal=0.5),
    'board': L.flat('ndl_sign_face', '#ffffff', rough=0.7), 'fan': L.flat('ndl_fan', '#e9e6dc', rough=0.4), 'tv': L.flat('ndl_tv', '#141518', rough=0.2),
    'batten': L.flat('ndl_batten', '#eeeeea', rough=0.4),   # 日光燈座：白色烤漆（NOODLE-LM-1030 改；原本用窗框的金屬灰，遊戲裡是一條條黑的）
    'food': L.vc_material('ndl_food', rough=0.6),
}
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


# ---- 地板（磨石子）、天花板、日光燈管
Mesh('ndl_floor', M['floor']).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
ce = Mesh('ndl_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root, uv=False)
tb = Mesh('ndl_tubes', M['tube']); fx = Mesh('ndl_tube_fix', M['batten'])
for z in (-2.6, 0.5, 3.0):
    for x in (-2.5, 2.5): tb.cyl((x - 0.6, H - 0.12, z), (x + 0.6, H - 0.12, z), 0.018, seg=8); fx.box(x - 0.65, x + 0.65, H - 0.1, H - 0.06, z - 0.05, z + 0.05)
tb.finish(root); fx.finish(root)

# ---- 牆：下半白色小方磚（1.3 m）＋紅色收邊條、上半奶油色漆；前牆兩扇窗（x＝±3）和門
for side, (a0, a1) in (('back', (X0, X1)), ('left', (Z0, Z1)), ('right', (Z0, Z1))):
    wall_box(side, 'tile', a0, a1, 0.0, 1.3); wall_box(side, 'trim', a0, a1, 1.3, 1.36, 0.0, 0.135); wall_box(side, 'paint', a0, a1, 1.36, H)
xs = [X0, -4.3, -1.7, -0.95, 0.95, 1.7, 4.3, X1]
for a0, a1 in ((xs[0], xs[1]), (xs[2], xs[3]), (xs[4], xs[5]), (xs[6], xs[7])):
    wall_box('front', 'tile', a0, a1, 0.0, 1.3); wall_box('front', 'trim', a0, a1, 1.3, 1.36, 0.0, 0.135); wall_box('front', 'paint', a0, a1, 1.36, H)
for a0, a1 in ((xs[1], xs[2]), (xs[5], xs[6])):
    wall_box('front', 'tile', a0, a1, 0.0, 1.05); wall_box('front', 'paint', a0, a1, 2.95, H)
    fr = wm('front', 'frame')
    for y in (1.0, 2.94): fr.box(a0, a1, y, y + 0.06, Z1 - 0.14, Z1 - 0.02)
    for x in (a0, (a0 + a1) / 2, a1): fr.box(x - 0.03, x + 0.03, 1.0, 3.0, Z1 - 0.14, Z1 - 0.02)
    wm('front', 'glass').quad([(a1, 1.06, Z1 - 0.08), (a0, 1.06, Z1 - 0.08), (a0, 2.94, Z1 - 0.08), (a1, 2.94, Z1 - 0.08)])
wall_box('front', 'paint', xs[3], xs[4], 2.35, H)
fr = wm('front', 'frame')
for x in (xs[3], 0.0, xs[4]): fr.box(x - 0.04, x + 0.04, 0.0, 2.35, Z1 - 0.15, Z1 - 0.02)
fr.box(xs[3], xs[4], 2.3, 2.38, Z1 - 0.15, Z1 - 0.02)
wm('front', 'glass').quad([(xs[4], 0.02, Z1 - 0.09), (xs[3], 0.02, Z1 - 0.09), (xs[3], 2.3, Z1 - 0.09), (xs[4], 2.3, Z1 - 0.09)])

# ---- 後牆：價目板（套件 signPlane 的位置 (0,2.4,−4.35)、3×0.6）＋一排紅紙菜單
wood = wm('back', 'wood'); wood.box(-1.6, 1.6, 2.06, 2.74, Z0 + 0.12, Z0 + 0.16)
pm = Mesh('WALL_back_SIGN_FACE_price', M['board']); pm.quad([(-1.5, 2.1, Z0 + 0.165), (1.5, 2.1, Z0 + 0.165), (1.5, 2.7, Z0 + 0.165), (-1.5, 2.7, Z0 + 0.165)])
signs = [(pm, {'dir': DIRS['back'], 'sign': '乾麵 60 ・ 餛飩湯 70 ・ 滷蛋 15', 'style': 'price'})]
for i, txt in enumerate(('陽春麵', '餛飩麵', '炸醬麵', '麻醬麵', '貢丸湯', '燙青菜')):
    x = 1.95 + i * 0.42
    if x > X1 - 0.3: break
    m = Mesh(f'WALL_back_SIGN_FACE_menu{i}', M['board']); m.quad([(x - 0.17, 1.65, Z0 + 0.125), (x + 0.17, 1.65, Z0 + 0.125), (x + 0.17, 2.65, Z0 + 0.125), (x - 0.17, 2.65, Z0 + 0.125)])
    signs.append((m, {'dir': DIRS['back'], 'sign': txt, 'style': 'redpaper'}))
for i, txt in enumerate(('小菜', '滷味', '豆干', '海帶')):
    z = -2.6 + i * 0.42
    m = Mesh(f'WALL_left_SIGN_FACE_menu{i}', M['board']); m.quad([(X0 + 0.125, 1.75, z + 0.17), (X0 + 0.125, 1.75, z - 0.17), (X0 + 0.125, 2.6, z - 0.17), (X0 + 0.125, 2.6, z + 0.17)])
    signs.append((m, {'dir': DIRS['left'], 'sign': txt, 'style': 'redpaper'}))

# ---- 牆上的電扇（右牆）、角落的電視（左前角高處）
fan = wm('right', 'fan'); fan.box(X1 - 0.14, X1 - 0.12, 2.25, 2.55, 0.85, 1.15); fan.cyl((X1 - 0.13, 2.4, 1.0), (X1 - 0.45, 2.38, 1.0), 0.03, seg=6)
fan.cyl((X1 - 0.5, 2.38, 1.0), (X1 - 0.62, 2.38, 1.0), 0.22, seg=16)
tv = wm('left', 'tv'); tv.box(X0 + 0.12, X0 + 0.22, 2.3, 2.8, 2.6, 3.45); wm('left', 'black').box(X0 + 0.12, X0 + 0.3, 2.22, 2.3, 2.85, 3.2)

# ---- 煮麵台（套件 kitchen (−1,−3.8) 6×1.2）：不鏽鋼櫃身、檯面、煮麵爐（三個麵杓）、湯鍋（套件 pot 的位置 (−2,1.25,−3.8)）、滷味玻璃櫃、碗堆、調味罐
kx0, kx1, kz0, kz1 = -4.0, 2.0, -4.4, -3.2
st = Mesh('ndl_counter', M['steel']); st.box(kx0, kx1, 0.0, 0.92, kz0, kz1); st.box(kx0 - 0.02, kx1 + 0.02, 0.92, 0.96, kz0 - 0.02, kz1 + 0.03)
sd = Mesh('ndl_counter_dark', M['steel_dark'])
for x in (-3.0, -1.0, 1.0): sd.box(x - 0.9, x + 0.9, 0.1, 0.8, kz1, kz1 + 0.005)      # 櫃門
pot = Mesh('ndl_pot', M['steel_dark']); bm = L.lathe([(0.0, 0.0), (0.38, 0.0), (0.4, 0.5), (0.42, 0.52), (0.38, 0.5)], seg=18); pot.add_bm(bm, Matrix.Translation(g2b(-2.0, 0.96, -3.8))); bm.free()
pob = pot.finish(None); L.smooth_mesh(pob); pob.parent = root
sp = Mesh('ndl_soup_top', M['soup']); bm = L.lathe([(0.0, 0.0), (0.37, 0.0)], seg=18); sp.add_bm(bm, Matrix.Translation(g2b(-2.0, 1.4, -3.8))); bm.free(); sp.finish(root, uv=False)
bo = Mesh('ndl_boiler', M['steel_dark']); bo.box(-3.75, -2.75, 0.96, 1.18, -4.25, -3.4)
for i in range(3): bo.cyl((-3.55 + i * 0.3, 1.18, -3.82), (-3.55 + i * 0.3, 1.5, -3.6), 0.012, seg=4)
bo.finish(root)
bw = Mesh('ndl_bowls', M['bowl']); nd = Mesh('ndl_noodles', M['noodle']); sp2 = Mesh('ndl_soups', M['soup'])


def bowl(x, z, y, kind=None):
    bm = L.lathe([(0.0, 0.0), (0.045, 0.0), (0.075, 0.06), (0.085, 0.075), (0.08, 0.075), (0.04, 0.012), (0.0, 0.012)], seg=12)
    bw.add_bm(bm, Matrix.Translation(g2b(x, y, z))); bm.free()
    if kind == 'noodle':
        bm = L.lathe([(0.0, 0.0), (0.065, 0.0), (0.04, 0.03), (0.0, 0.035)], seg=10); nd.add_bm(bm, Matrix.Translation(g2b(x, y + 0.055, z))); bm.free()
    elif kind == 'soup':
        bm = L.lathe([(0.0, 0.0), (0.072, 0.0)], seg=12); sp2.add_bm(bm, Matrix.Translation(g2b(x, y + 0.06, z))); bm.free()


for k in range(4):                                                    # 碗堆
    for j in range(5): bowl(0.2 + k * 0.22, -3.75, 0.96 + j * 0.03)
gc = Mesh('ndl_case_glass', M['glass']); gc.box(-0.6, 0.0, 0.96, 1.4, -4.2, -3.35); gc.finish(root)          # 滷味玻璃櫃
food = L.CMesh('ndl_food', M['food'])
for i in range(8): food.cbox(-0.56 + (i % 4) * 0.14, -0.44 + (i % 4) * 0.14, 1.0, 1.05 + random.uniform(0, 0.04), -4.1 + (i // 4) * 0.35, -3.85 + (i // 4) * 0.35, random.choice(['#7a4a2a', '#5c3a21', '#c9a46a', '#2f4a2a', '#8a5a3a']))
food.finish(root, uv=False)
cj = Mesh('ndl_jars', M['red'])
for i in range(3): cj.cyl((1.3 + i * 0.12, 0.96, -3.5), (1.3 + i * 0.12, 1.08, -3.5), 0.035, seg=8)
cj.finish(root)

# ---- 三張桌子（套件 desk：1.4×0.9、桌面 0.745–0.77）＋六張紅椅（座面頂 0.485）＋桌上：調味罐、筷筒、面紙盒、麵碗
tt, te, ch, lg = Mesh('ndl_tables', M['table']), Mesh('ndl_table_edges', M['tedge']), Mesh('ndl_chairs', M['chair']), Mesh('ndl_legs', M['leg'])
cond, blk = Mesh('ndl_condiments', M['red']), Mesh('ndl_black_items', M['black'])
TABLE_XS = (-3.0, 0.0, 3.0) if LAYOUT == 'game' else (-3.0, 0.0, 1.4)
for i, x in enumerate(TABLE_XS):
    z = 0.5
    if LAYOUT == 'longtable' and i > 0:                                             # 長桌的兩半：桌面、桌邊、桌腳照原樣，椅子另外排
        tt.box(x - 0.7, x + 0.7, 0.745, 0.77, z - 0.45, z + 0.45); te.box(x - 0.706, x + 0.706, 0.715, 0.745, z - 0.456, z + 0.456)
        for sx in (-1, 1):
            for sz in (-1, 1): lg.cyl((x + sx * 0.62, 0.0, z + sz * 0.37), (x + sx * 0.62, 0.715, z + sz * 0.37), 0.018, seg=6)
        continue
    tt.box(x - 0.7, x + 0.7, 0.745, 0.77, z - 0.45, z + 0.45); te.box(x - 0.706, x + 0.706, 0.715, 0.745, z - 0.456, z + 0.456)
    for sx in (-1, 1):
        for sz in (-1, 1): lg.cyl((x + sx * 0.62, 0.0, z + sz * 0.37), (x + sx * 0.62, 0.715, z + sz * 0.37), 0.018, seg=6)
    for s in (-1, 1):                                                               # 椅子：z＝0.5±0.8，朝桌子
        cz = z + s * 0.8; back = cz + s * 0.2
        ch.box(x - 0.22, x + 0.22, 0.46, 0.485, cz - 0.21, cz + 0.21); ch.box(x - 0.21, x + 0.21, 0.66, 0.92, back - 0.018, back + 0.018)
        for sx in (-1, 1):
            for sz in (-1, 1): lg.cyl((x + sx * 0.19, 0.0, cz + sz * 0.18), (x + sx * 0.19, 0.46, cz + sz * 0.18), 0.012, seg=5)
            lg.cyl((x + sx * 0.19, 0.46, back), (x + sx * 0.19, 0.92, back), 0.012, seg=5)
    cond.cyl((x + 0.45, 0.77, z - 0.3), (x + 0.45, 0.88, z - 0.3), 0.03, seg=8)                         # 辣椒罐
    blk.cyl((x + 0.55, 0.77, z - 0.3), (x + 0.55, 0.92, z - 0.3), 0.025, seg=8); blk.cyl((x + 0.62, 0.77, z - 0.28), (x + 0.62, 0.9, z - 0.28), 0.022, seg=8)   # 醬油、醋
    blk.cyl((x + 0.5, 0.77, z - 0.18), (x + 0.5, 0.92, z - 0.18), 0.04, seg=10)                         # 筷筒
    bowl(x - 0.2, z + 0.25, 0.77, 'noodle'); bowl(x + 0.2, z - 0.05, 0.77, 'soup' if i == 1 else None)
tissue = Mesh('ndl_tissue', M['fan'])
for x in TABLE_XS[:1] if LAYOUT == 'longtable' else TABLE_XS: tissue.box(x - 0.6, x - 0.38, 0.77, 0.85, 0.15, 0.27)
if LAYOUT == 'longtable':
    z = 0.5; cup = Mesh('ndl_cups', M['glass']); tea = Mesh('ndl_tea', M['soup']); plate = Mesh('ndl_plates', M['bowl']); tfood = L.CMesh('ndl_food_table', M['food'])
    def chair(cx, cz, face):                                                       # face：椅背在哪一邊（'z+'、'z-'、'x+'、'x-'）
        if face in ('z+', 'z-'):
            s = 1 if face == 'z+' else -1; back = cz + s * 0.2
            ch.box(cx - 0.22, cx + 0.22, 0.46, 0.485, cz - 0.21, cz + 0.21); ch.box(cx - 0.21, cx + 0.21, 0.66, 0.92, back - 0.018, back + 0.018)
            for sx in (-1, 1):
                for sz in (-1, 1): lg.cyl((cx + sx * 0.19, 0.0, cz + sz * 0.18), (cx + sx * 0.19, 0.46, cz + sz * 0.18), 0.012, seg=5)
                lg.cyl((cx + sx * 0.19, 0.46, back), (cx + sx * 0.19, 0.92, back), 0.012, seg=5)
        else:
            s = 1 if face == 'x+' else -1; back = cx + s * 0.2
            ch.box(cx - 0.21, cx + 0.21, 0.46, 0.485, cz - 0.22, cz + 0.22); ch.box(back - 0.018, back + 0.018, 0.66, 0.92, cz - 0.21, cz + 0.21)
            for sz in (-1, 1):
                for sx in (-1, 1): lg.cyl((cx + sx * 0.18, 0.0, cz + sz * 0.19), (cx + sx * 0.18, 0.46, cz + sz * 0.19), 0.012, seg=5)
                lg.cyl((back, 0.46, cz + sz * 0.19), (back, 0.92, cz + sz * 0.19), 0.012, seg=5)
    for k, cx in enumerate((-0.25, 0.7, 1.65)):                                    # 兩側各三張，稍微拉開一點（還沒有人坐）
        chair(cx + (0.05 if k == 1 else 0.0), z - 0.84, 'z-'); chair(cx - 0.04, z + 0.86, 'z+')
    chair(-1.18, z, 'x-'); chair(2.58, z, 'x+')                                    # 兩頭各一張
    for k, (bx, bz, kind) in enumerate(((-0.25, 0.22, 'noodle'), (0.7, 0.2, 'soup'), (1.65, 0.24, 'noodle'), (-0.2, 0.8, 'noodle'), (0.75, 0.78, 'noodle'), (1.6, 0.8, 'soup'))):
        bowl(bx, bz, 0.77, kind)                                                    # 每個位子一碗：乾麵或餛飩湯
    for bx, bz in ((0.25, 0.5), (1.15, 0.5)):                                      # 中間兩盤小菜（滷味拼盤、燙青菜）
        bm = L.lathe([(0.0, 0.0), (0.11, 0.0), (0.13, 0.02), (0.125, 0.022), (0.1, 0.006), (0.0, 0.006)], seg=14); plate.add_bm(bm, Matrix.Translation(g2b(bx, 0.77, bz))); bm.free()
    for i2 in range(7): tfood.cbox(0.17 + (i2 % 4) * 0.045, 0.21 + (i2 % 4) * 0.045, 0.776, 0.79 + random.uniform(0, 0.01), 0.45 + (i2 // 4) * 0.06, 0.49 + (i2 // 4) * 0.06, random.choice(['#7a4a2a', '#5c3a21', '#c9a46a', '#8a5a3a']))
    for i2 in range(5): tfood.cbox(1.07 + (i2 % 3) * 0.05, 1.11 + (i2 % 3) * 0.05, 0.776, 0.786, 0.44 + (i2 // 3) * 0.07, 0.5 + (i2 // 3) * 0.07, random.choice(['#3f6a2e', '#4f7a34', '#2f5a26']))
    for cx, cz in ((-0.05, 0.28), (0.9, 0.26), (1.85, 0.3), (0.0, 0.72), (0.95, 0.74), (1.4, 0.7)):   # 每個位子一杯冬瓜茶／冰水（塑膠杯）
        cup.cyl((cx, 0.77, cz), (cx, 0.89, cz), 0.034, seg=10, r2=0.04); tea.cyl((cx, 0.771, cz), (cx, 0.86, cz), 0.031, seg=10, r2=0.037)
    cond.cyl((1.25, 0.77, z - 0.3), (1.25, 0.88, z - 0.3), 0.03, seg=8); blk.cyl((1.32, 0.77, z - 0.18), (1.32, 0.92, z - 0.18), 0.04, seg=10)   # 第二套辣椒罐、筷筒
    tissue.box(0.6, 0.82, 0.77, 0.85, 0.15, 0.27)
    for m in (cup, tea, plate): m.finish(root)
    tfood.finish(root, uv=False)
    # 背景版才有的雜物（v2，讓店裡有生活感；遊戲的配置不受影響）：右牆的玻璃門飲料冰箱、後牆的時鐘、左牆的月曆、疊起來的紅色塑膠椅
    fz0, fz1, fb0, ff0 = -1.3, -0.5, X0 + 0.04, X0 + 0.74     # 左牆：冰箱背面貼牆（x＝fb0）、玻璃門朝店裡（x＝ff0）
    fb = Mesh('ndl_fridge_body', L.flat('ndl_fridge_white', '#e9e9e6', rough=0.4))   # 中空的櫃體：背板、兩側、頂、底（飲料從玻璃門看得到）
    fb.box(fb0, fb0 + 0.04, 0.0, 1.95, fz0, fz1); fb.box(fb0, ff0, 0.0, 1.95, fz0, fz0 + 0.04); fb.box(fb0, ff0, 0.0, 1.95, fz1 - 0.04, fz1)
    fb.box(fb0, ff0, 0.0, 0.1, fz0, fz1); fb.box(fb0, ff0, 1.78, 1.95, fz0, fz1)
    fl = Mesh('ndl_fridge_light', L.flat('ndl_fridge_inside', '#f3f7fb', rough=0.5, emit=B.srgb('#dfe8f5'))); fl.box(fb0 + 0.04, fb0 + 0.05, 0.12, 1.76, fz0 + 0.05, fz1 - 0.05)   # 背板的燈
    fg = Mesh('ndl_fridge_glass', M['glass']); fg.quad([(ff0 + 0.03, 0.1, fz1 - 0.03), (ff0 + 0.03, 0.1, fz0 + 0.03), (ff0 + 0.03, 1.8, fz0 + 0.03), (ff0 + 0.03, 1.8, fz1 - 0.03)])
    ff = Mesh('ndl_fridge_frame', M['frame'])
    for zz in (fz0 + 0.03, fz1 - 0.03): ff.box(ff0, ff0 + 0.04, 0.1, 1.8, zz - 0.025, zz + 0.025)
    for yy in (0.1, 1.8): ff.box(ff0, ff0 + 0.04, yy - 0.025, yy + 0.025, fz0 + 0.03, fz1 - 0.03)
    sign = Mesh('ndl_fridge_top', M['red']); sign.box(fb0, ff0 + 0.005, 1.8, 1.95, fz0, fz1)
    bot = L.CMesh('ndl_fridge_drinks', M['food'])
    for sy in (0.25, 0.65, 1.05, 1.45):
        ff.box(fb0 + 0.05, ff0 - 0.02, sy - 0.015, sy, fz0 + 0.05, fz1 - 0.05)
        for k in range(7):
            zz = fz0 + 0.1 + k * 0.085; col = random.choice(['#c8332a', '#2f6db0', '#f2c230', '#3a8a3a', '#f0f0ea', '#7a3a1a', '#e07a20'])
            bot.cbox(ff0 - 0.12, ff0 - 0.06, sy, sy + random.choice((0.2, 0.24, 0.13)), zz - 0.03, zz + 0.03, col)
    for m in (fb, fl, fg, ff, sign): m.finish(root)
    bot.finish(root, uv=False)
    clk = Mesh('ndl_clock', M['bowl']); clk.cyl((-2.35, 2.55, Z0 + 0.12), (-2.35, 2.55, Z0 + 0.16), 0.16, seg=20)
    rim = Mesh('ndl_clock_rim', M['black']); rim.cyl((-2.35, 2.55, Z0 + 0.115), (-2.35, 2.55, Z0 + 0.155), 0.175, seg=20)
    rim.box(-2.355, -2.345, 2.55, 2.66, Z0 + 0.16, Z0 + 0.168); rim.box(-2.35, -2.27, 2.545, 2.555, Z0 + 0.16, Z0 + 0.168)   # 七點：時針、分針
    clk.finish(root); rim.finish(root)
    cal = Mesh('ndl_calendar', M['bowl']); cal.quad([(-4.4, 1.35, Z0 + 0.125), (-3.95, 1.35, Z0 + 0.125), (-3.95, 1.97, Z0 + 0.125), (-4.4, 1.97, Z0 + 0.125)])   # 月曆：後牆左邊
    calh = Mesh('ndl_calendar_head', M['red']); calh.quad([(-4.4, 1.85, Z0 + 0.13), (-3.95, 1.85, Z0 + 0.13), (-3.95, 1.97, Z0 + 0.13), (-4.4, 1.97, Z0 + 0.13)])
    calg = Mesh('ndl_calendar_grid', M['black'])
    for r in range(5):
        for c in range(7): calg.box(-4.37 + c * 0.06, -4.355 + c * 0.06, 1.42 + r * 0.08, 1.44 + r * 0.08, Z0 + 0.128, Z0 + 0.132)
    for m in (cal, calh, calg): m.finish(root)
    stool = Mesh('ndl_stools', L.flat('ndl_stool_red', '#c0392b', rough=0.5))
    for k in range(4):
        y = k * 0.06; stool.box(-4.55, -4.2, 0.4 + y, 0.44 + y, -2.95, -2.6)
        for sx in (-4.53, -4.22):
            for sz in (-2.93, -2.62): stool.box(sx - 0.015, sx + 0.015, y, 0.4 + y, sz - 0.015, sz + 0.015)
    stool.finish(root)
for m in (tt, te, ch, lg, cond, blk, tissue): m.finish(root)
bw.finish(root, uv=False, smooth=True); nd.finish(root, uv=False, smooth=True); sp2.finish(root, uv=False)
st.finish(root); sd.finish(root)

# ---- 收尾
for side, ms in walls.items():
    for m in ms:
        m.name = f'WALL_{m.name}'; m.finish(root, uv=True, props={'dir': DIRS[side]})
for m, props in signs: uv01(m.finish(root, uv=True, props=props))
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name, key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
info = L.export(OUT, gpu_instances=True)
L.write_json(OUT[:-4] + '.json', info)
