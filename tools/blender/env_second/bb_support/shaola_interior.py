"""公館燒臘（遊戲 noodle 區域＝原本的阿鳳麵店改成燒臘店，AA_612 A 表）室內 v1 → GLB。BB（帳號 A）2026-11-03。
參考圖（使用者 11-03）：docs/story_planning/ref_images/shops/gongguan_shaola_int.webp（室內）、gongguan_shaola_ext.webp（店面）。
  /opt/blenv/bin/python tools/blender/env_second/bb_support/shaola_interior.py [-- --out <glb>]
座標＝遊戲 noodle 區域（room() 10 × 9 × 3.2 m，店面在 z＝+4.5、窗在 x＝±3、門在中間），**座標、門口、三張桌子的座位都不動**（README：座標、門口不動）：
  - 桌子 1.4 × 0.9 在 x＝−3／0／3、z＝0.5；坐的位置 z＝−0.3／1.3（套件的椅子位置）→ 這裡畫成參考圖的紅色圓凳，座面高 0.485 m 和套件一樣。
  - 煮麵台的導航阻擋 6 × 1.2 在 (−1, −3.8) → 這裡是不鏽鋼備料台（砧板、菜刀、肉盤、碗盤、電子秤），沒有超出原本的阻擋。
  - 新加、需要 LAWWW2 補導航阻擋的兩件（寫在 SHAOLA_NEW_BLOCKS）：前牆右邊窗內的燒臘玻璃櫃、後牆右邊的不鏽鋼冰箱。
照參考圖：磨石子地、米色舊牆（有水漬）、方格天花板＋一排排日光燈管、紅字白底價目表、「公館燒臘」招牌（店裡那一塊）、
  玻璃櫃裡掛叉燒、燒鴨、油雞（銅勾、黃燈）、下面一盤盤切好的肉、「叉燒飯 100」「燒鴨飯 110」價目卡；不鏽鋼桌（筷筒、辣椒罐、醬油、粉紅面紙盒）；
  壁扇、冷氣、圓鐘、紅色「福」、牆上小相框、電視、後面往廚房的布簾門；玻璃門上一條紅線。
D77：店名是遊戲裡的替代名（使用者給的圖照用）；沒有真實品牌。D112：地板是淺色磨石子。
"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from PIL import Image, ImageDraw, ImageFont   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.join(L.ROOT, ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/shaola_interior.glb')
TMP = os.path.join(L.ROOT, 'tools/blender/env_second/textures/gen/shaola'); os.makedirs(TMP, exist_ok=True)
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
W, D, H = 10.0, 9.0, 3.2
X0, X1, Z0, Z1 = -W / 2, W / 2, -D / 2, D / 2
DIRS = {'front': [0, 0, -1], 'back': [0, 0, 1], 'left': [1, 0, 0], 'right': [-1, 0, 0]}
TABLE_X, TABLE_Z, STOOL_Z = (-3.0, 0.0, 3.0), 0.5, (-0.3, 1.3)
CASE = dict(x0=1.75, x1=4.35, z0=3.95, z1=4.38)    # 前牆右窗內的燒臘玻璃櫃（窗 x 1.7～4.3）
FRIDGE = dict(x0=2.35, x1=3.25, z0=-4.38, z1=-3.68)
SHAOLA_NEW_BLOCKS = [[(CASE['x0'] + CASE['x1']) / 2, (CASE['z0'] + CASE['z1']) / 2, CASE['x1'] - CASE['x0'], CASE['z1'] - CASE['z0']],
                     [(FRIDGE['x0'] + FRIDGE['x1']) / 2, (FRIDGE['z0'] + FRIDGE['z1']) / 2, FRIDGE['x1'] - FRIDGE['x0'], FRIDGE['z1'] - FRIDGE['z0']]]
random.seed(612)
B.reset(texres=512)
root = B.group('shaola_interior', props={'kind': 'shaola_interior', 'w': W, 'd': D, 'h': H, 'newBlocks': json.dumps(SHAOLA_NEW_BLOCKS)})
def font(sz): return ImageFont.truetype(FONT, sz)


def img_mat(name, path, rough=0.7, emit=0.0):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; nt = mt.node_tree; b = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(path); nt.links.new(tx.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    if emit: nt.links.new(tx.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emit
    return mt


def uvquad(name, p0, p1, p2, p3, mat, parent=None):
    bm = bmesh.new(); vs = [bm.verts.new(g2b(*p)) for p in (p0, p1, p2, p3)]; f = bm.faces.new(vs)
    ul = bm.loops.layers.uv.new()
    for lp, t in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[ul].uv = t
    return B.mesh_obj(name, bm, mat, parent or root, None)


def glowmat(name, hexcol, k):
    c = B.srgb(hexcol); return L.flat(name, hexcol, rough=0.4, emit=tuple(v * k for v in c[:3]))


def tex(name, size, draw):
    p = os.path.join(TMP, name); im = Image.new('RGB', size, (0, 0, 0)); draw(im, ImageDraw.Draw(im)); im.save(p); return p


RED = (178, 34, 30)
def menu_board(im, d):   # 後牆的價目表：白底紅字兩欄（參考圖照抄）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(246, 242, 232)); d.rectangle([6, 6, w - 6, h - 6], outline=(200, 60, 50), width=4)
    L_ = [('叉燒飯', '100'), ('雞腿飯', '110'), ('燒肉飯', '110'), ('上鴨飯', '110'), ('雙拼飯', '130')]
    R_ = [('燒鴨飯', '110'), ('油雞飯', '120'), ('三寶飯', '130')]
    for col, rows in ((0, L_), (1, R_)):
        for i, (n, p) in enumerate(rows):
            x, y = 30 + col * (w // 2), 24 + i * 78; d.text((x, y), n, font=font(56), fill=RED); d.text((x + 230, y + 4), p, font=font(50), fill=RED)
    for cx, cy in ((w - 30, h - 30), (30, h - 30)): d.rectangle([cx - 14, cy - 14, cx + 14, cy + 14], outline=(200, 60, 50), width=3)


def shop_sign(im, d):    # 店裡的「公館燒臘」招牌：舊白底、紅字、角落的回紋
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(232, 224, 206)); d.rectangle([10, 10, w - 10, h - 10], outline=(160, 40, 34), width=5)
    for cx, sx in ((40, 1), (w - 40, -1)):
        for k in range(3): d.line([(cx, 30 + k * 18), (cx + sx * (60 - k * 16), 30 + k * 18)], fill=(170, 40, 34), width=4)
    t = '公館燒臘'; f = font(150)
    for i, ch in enumerate(t): d.text((150 + i * 190, 40), ch, font=f, fill=(170, 30, 28))
    r = random.Random(5)
    for _ in range(1400): x_, y_ = r.randint(10, w - 10), r.randint(10, h - 10); d.point((x_, y_), fill=(200, 190, 170))


def price_card(text, price):
    def f_(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=(244, 232, 210)); d.text((24, 26), text, font=font(84), fill=(30, 26, 24))
        d.text((w - 190, 28), price, font=font(80), fill=(196, 30, 28)); d.line([(w - 196, h - 30), (w - 30, h - 38)], fill=(196, 30, 28), width=6)
    return f_


def fu(im, d):           # 紅色「福」
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(196, 32, 30)); d.text((24, 14), '福', font=font(150), fill=(250, 214, 110))


def ceiling_tiles(im, d):  # 方格天花板（舊、有點黃）
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(228, 222, 206)); r = random.Random(9)
    for x in range(0, w, 128): d.line([(x, 0), (x, h)], fill=(160, 154, 140), width=4)
    for y in range(0, h, 128): d.line([(0, y), (w, y)], fill=(160, 154, 140), width=4)
    for _ in range(4000): x_, y_ = r.randint(0, w - 1), r.randint(0, h - 1); d.point((x_, y_), fill=(196, 190, 172))


def stained_wall(im, d):   # 米色舊牆：下緣有水漬
    w, h = im.size; r = random.Random(2)
    for y in range(h):
        v = 1.0 - 0.18 * max(0, (y / h - 0.55) / 0.45) ** 1.6; d.line([(0, y), (w, y)], fill=(int(234 * v), int(224 * v), int(200 * v)))
    for _ in range(60):
        x_, y_ = r.randint(0, w), r.randint(int(h * 0.3), h); rr = r.randint(6, 40); d.ellipse([x_ - rr, y_ - rr, x_ + rr, y_ + rr], fill=(214, 202, 172))


def tv_screen(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=(60, 90, 140)); d.rectangle([0, int(h * 0.7), w, h], fill=(200, 40, 40)); d.rectangle([20, 20, int(w * 0.4), int(h * 0.6)], fill=(220, 200, 170))


P = {k: tex(f'{k}.png', s, f) for k, s, f in (('menu', (900, 420), menu_board), ('sign', (1024, 260), shop_sign), ('card1', (512, 160), price_card('叉燒飯', '100')),
                                               ('card2', (512, 160), price_card('燒鴨飯', '110')), ('fu', (200, 200), fu), ('ceil', (512, 512), ceiling_tiles),
                                               ('wall', (256, 512), stained_wall), ('tv', (256, 180), tv_screen))}

# ---------------- 材質（≤12，最後合併）----------------
m_floor = L.pbr('sl_floor', 'terrazzo_tiles', tile=1.2, target='#d6d0c2', normal=0.4, maps=('diff', 'nor'), rough_value=0.35)
m_steel = L.flat('sl_steel', '#c6cacd', rough=0.32, metal=0.25)
m_steel_d = L.flat('sl_steel_dark', '#9da2a7', rough=0.4, metal=0.25)
m_glass = L.flat('sl_glass', '#dfe9ec', rough=0.05, alpha=0.18)
m_tube = glowmat('sl_tube', '#fff6e6', 3.0)
m_lamp = glowmat('sl_lamp', '#ffcf86', 5.0)
m_vc = L.vc_material('sl_props_vc', rough=0.5)
m_meat = L.vc_material('sl_meat_vc', rough=0.25)       # 燒臘油亮
IM = {k: img_mat('sl_' + k, p, rough=0.7 if k != 'tv' else 0.2, emit=(0.8 if k == 'tv' else 0.0)) for k, p in P.items()}

# ---------------- 地板、天花板、日光燈 ----------------
Mesh('FLOOR', m_floor, tile=1.2).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(root)
cq = bmesh.new(); ul = cq.loops.layers.uv.new()
f_ = cq.faces.new([cq.verts.new(g2b(X0, H, Z1)), cq.verts.new(g2b(X1, H, Z1)), cq.verts.new(g2b(X1, H, Z0)), cq.verts.new(g2b(X0, H, Z0))])
for lp, t in zip(f_.loops, ((0, 0), (W / 1.2, 0), (W / 1.2, D / 1.2), (0, D / 1.2))): lp[ul].uv = t   # 一格 0.6 m
B.mesh_obj('CEILING', cq, IM['ceil'], root, None)
tb = Mesh('TUBES', m_tube); fx = Mesh('TUBE_FIX', L.flat('sl_batten', '#eeeeea', rough=0.4))
for z in (-2.8, -0.6, 1.6, 3.6):
    for x in (-2.6, 2.2): tb.cyl((x - 0.6, H - 0.1, z), (x + 0.6, H - 0.1, z), 0.018, seg=8); tb.cyl((x - 0.6, H - 0.1, z + 0.08), (x + 0.6, H - 0.1, z + 0.08), 0.018, seg=8); fx.box(x - 0.66, x + 0.66, H - 0.07, H - 0.03, z - 0.06, z + 0.14)
tb.finish(root); fx.finish(root)


# ---------------- 牆（會淡出）：米色舊牆＋下面一條不鏽鋼踢腳板；前牆兩扇窗＋中間玻璃門 ----------------
def wall_group(side): return B.group(f'WALL_{side}', root, props={'dir': DIRS[side]})


G = {s: wall_group(s) for s in DIRS}
WT = 0.12
def wplane(side, a0, a1, y0, y1, nm):   # 有貼圖（水漬）的牆面：一面一個四邊形，往室內
    if side == 'back': p = [(a0, y0, Z0 + WT), (a1, y0, Z0 + WT), (a1, y1, Z0 + WT), (a0, y1, Z0 + WT)]
    elif side == 'front': p = [(a1, y0, Z1 - WT), (a0, y0, Z1 - WT), (a0, y1, Z1 - WT), (a1, y1, Z1 - WT)]
    elif side == 'left': p = [(X0 + WT, y0, a1), (X0 + WT, y0, a0), (X0 + WT, y1, a0), (X0 + WT, y1, a1)]
    else: p = [(X1 - WT, y0, a0), (X1 - WT, y0, a1), (X1 - WT, y1, a1), (X1 - WT, y1, a0)]
    return uvquad(f'WALL_{side}_{nm}', *p, IM['wall'], G[side])


shell = {s: Mesh(f'WALL_{s}_shell', L.flat('sl_wall_back', '#d8ccb0', rough=0.9)) for s in DIRS}
shell['back'].box(X0, X1, 0, H, Z0, Z0 + WT); shell['left'].box(X0, X0 + WT, 0, H, Z0, Z1); shell['right'].box(X1 - WT, X1, 0, H, Z0, Z1)
for s in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if s == 'back' else (Z0, Z1); wplane(s, a0, a1, 0.12, H, 'paint')
kick = Mesh('WALL_KICK', m_steel_d)
kick.box(X0 + WT, X1 - WT, 0, 0.12, Z0 + WT, Z0 + WT + 0.01); kick.box(X0 + WT, X0 + WT + 0.01, 0, 0.12, Z0, Z1); kick.box(X1 - WT - 0.01, X1 - WT, 0, 0.12, Z0, Z1)
xs = [X0, -4.3, -1.7, -0.95, 0.95, 1.7, 4.3, X1]
fr = Mesh('WALL_front_frame', m_steel); gl = Mesh('WALL_front_glass', m_glass); rs = Mesh('WALL_front_redline', L.flat('sl_red', '#c8342c', rough=0.5))
for a0, a1 in ((xs[0], xs[1]), (xs[2], xs[3]), (xs[4], xs[5]), (xs[6], xs[7])):
    shell['front'].box(a0, a1, 0, H, Z1 - WT, Z1); wplane('front', a0, a1, 0.12, H, f'paint{int(a0 * 10)}')
for a0, a1 in ((xs[1], xs[2]), (xs[5], xs[6])):
    shell['front'].box(a0, a1, 0, 0.6, Z1 - WT, Z1); shell['front'].box(a0, a1, 2.95, H, Z1 - WT, Z1)
    for y in (0.6, 2.9): fr.box(a0, a1, y, y + 0.05, Z1 - 0.12, Z1 - 0.02)
    for x in (a0, a1): fr.box(x - 0.03, x + 0.03, 0.6, 2.95, Z1 - 0.12, Z1 - 0.02)
    gl.quad([(a1, 0.65, Z1 - 0.07), (a0, 0.65, Z1 - 0.07), (a0, 2.9, Z1 - 0.07), (a1, 2.9, Z1 - 0.07)])
shell['front'].box(xs[3], xs[4], 2.35, H, Z1 - WT, Z1)
for x in (xs[3], 0.0, xs[4]): fr.box(x - 0.04, x + 0.04, 0.0, 2.35, Z1 - 0.14, Z1 - 0.02)
fr.box(xs[3], xs[4], 2.3, 2.38, Z1 - 0.14, Z1 - 0.02); fr.box(xs[3], xs[4], 0.0, 0.06, Z1 - 0.14, Z1 - 0.02)
gl.quad([(xs[4], 0.06, Z1 - 0.08), (xs[3], 0.06, Z1 - 0.08), (xs[3], 2.3, Z1 - 0.08), (xs[4], 2.3, Z1 - 0.08)])
rs.box(xs[3] + 0.05, xs[4] - 0.05, 1.12, 1.2, Z1 - 0.095, Z1 - 0.085); rs.box(xs[3] + 0.05, xs[4] - 0.05, 1.24, 1.28, Z1 - 0.095, Z1 - 0.085)   # 玻璃門上的紅線
for s, m in shell.items(): m.finish(G[s])
kick.finish(G['back']); fr.finish(G['front']); gl.finish(G['front'], props={'glass': 1}); rs.finish(G['front'])

# ---------------- 後牆：價目表、往廚房的布簾門、不鏽鋼冰箱 ----------------
uvquad('WALL_back_MENU', (-3.9, 1.75, Z0 + WT + 0.02), (-1.3, 1.75, Z0 + WT + 0.02), (-1.3, 2.95, Z0 + WT + 0.02), (-3.9, 2.95, Z0 + WT + 0.02), IM['menu'], G['back'])
dc = Mesh('WALL_back_kitchen_door', L.flat('sl_dark', '#3a3430', rough=0.9)); dc.box(-0.9, 0.3, 0, 2.2, Z0 + WT, Z0 + WT + 0.005); dc.finish(G['back'])
cur = bmesh.new(); ulc = cur.loops.layers.uv.new(); n = 18
for i in range(n):   # 布簾：米色、有皺褶，到 1.6 m 高
    ta, tb_ = i / n, (i + 1) / n; xa, xb = -0.9 + 1.2 * ta, -0.9 + 1.2 * tb_; za, zb = Z0 + WT + 0.04 + 0.03 * math.sin(ta * 12), Z0 + WT + 0.04 + 0.03 * math.sin(tb_ * 12)
    f = cur.faces.new([cur.verts.new(g2b(xa, 0.65, za)), cur.verts.new(g2b(xb, 0.65, zb)), cur.verts.new(g2b(xb, 2.2, zb)), cur.verts.new(g2b(xa, 2.2, za))])
B.mesh_obj('CURTAIN', cur, L.flat('sl_curtain', '#d8cfae', rough=0.9), root, None)
fg = Mesh('FRIDGE', m_steel); fg.box(FRIDGE['x0'], FRIDGE['x1'], 0, 2.05, FRIDGE['z0'], FRIDGE['z1'])
fgd = Mesh('FRIDGE_HANDLES', m_steel_d)
for y0, y1 in ((0.15, 1.05), (1.1, 2.0)): fgd.box(FRIDGE['x0'] + 0.03, FRIDGE['x1'] - 0.03, y0, y1, FRIDGE['z1'], FRIDGE['z1'] + 0.01); fgd.box(FRIDGE['x1'] - 0.12, FRIDGE['x1'] - 0.08, y0 + 0.2, y1 - 0.2, FRIDGE['z1'] + 0.01, FRIDGE['z1'] + 0.05)
fg.finish(root); fgd.finish(root)

# ---------------- 備料台（原本煮麵台的位置 6 × 1.2 在 (−1, −3.8)）：不鏽鋼、砧板、菜刀、肉盤、碗盤、電子秤、調味罐 ----------------
kx0, kx1, kz0, kz1 = -4.0, 2.0, -4.4, -3.2
ct = Mesh('COUNTER', m_steel); ct.box(kx0, kx1, 0.0, 0.88, kz0, kz1); ct.box(kx0 - 0.02, kx1 + 0.02, 0.88, 0.92, kz0 - 0.02, kz1 + 0.03)
ctd = Mesh('COUNTER_PANELS', m_steel_d)
for x in (-3.0, -1.0, 1.0): ctd.box(x - 0.92, x + 0.92, 0.1, 0.8, kz1 + 0.0, kz1 + 0.006)
ct.finish(root); ctd.finish(root)
sh = Mesh('SHELF', m_steel)   # 後牆的層架（備料台上方）
for y in (1.45, 1.85): sh.box(kx0 + 0.1, kx1 - 0.1, y, y + 0.025, Z0 + WT, Z0 + WT + 0.32)
sh.finish(root)
pr = CMesh('PROPS', m_vc)
pr.crbox(0.5, 1.3, 0.92, 1.12, -3.95, -3.45, '#8a6440', r=0.08)   # 砧板（圓木墩）：方的倒角
pr.crbox(0.65, 0.95, 1.12, 1.125, -3.8, -3.72, '#c8ccd0', r=0.005); pr.cbox(0.95, 1.1, 1.12, 1.13, -3.78, -3.74, '#6a4a2a')   # 菜刀
for i in range(3): pr.crbox(-1.6 + i * 0.5, -1.15 + i * 0.5, 0.92, 0.98, -3.95, -3.45, '#b8bcc0', r=0.01)   # 肉盤（不鏽鋼）
for i in range(3):
    for k in range(9): pr.cbox(-1.55 + i * 0.5 + (k % 3) * 0.13, -1.45 + i * 0.5 + (k % 3) * 0.13, 0.98, 1.02, -3.9 + (k // 3) * 0.14, -3.8 + (k // 3) * 0.14, ['#8a2a1e', '#a0522d', '#c99a5a'][i])
n0 = set(pr.bm.faces)
for k in range(4):
    for j in range(6): pr.add_bm(L.lathe([(0.0, 0.0), (0.06, 0.0), (0.1, 0.03), (0.0, 0.03)], seg=12), Matrix.Translation(g2b(-3.6 + k * 0.26, 0.92 + j * 0.03, -3.75)))   # 碗盤堆
pr.paint([f for f in pr.bm.faces if f not in n0], '#f2efe6')
n0 = set(pr.bm.faces)
pr.crbox(1.45, 1.85, 0.92, 1.02, -3.95, -3.6, '#e8e8e4', r=0.01); pr.cbox(1.5, 1.8, 1.0, 1.04, -3.7, -3.62, '#2a3a2a')   # 電子秤
for i in range(6): pr.add_bm(L.lathe([(0.0, 0.0), (0.045, 0.0), (0.045, 0.14), (0.0, 0.14)], seg=10), Matrix.Translation(g2b(-3.7 + i * 0.25, 1.875, -4.15)))   # 層架上的罐子
pr.paint([f for f in pr.bm.faces if f not in n0], '#c87a3a'); n0 = set(pr.bm.faces)
for i in range(4): pr.add_bm(L.lathe([(0.0, 0.0), (0.16, 0.0), (0.17, 0.28), (0.0, 0.28)], seg=14), Matrix.Translation(g2b(-1.8 + i * 0.5, 1.475, -4.1)))   # 層架上的鍋
pr.paint([f for f in pr.bm.faces if f not in n0], '#9aa0a5'); n0 = set(pr.bm.faces)
# 每一桌：筷筒、辣椒罐、醬油、粉紅面紙盒
for x in TABLE_X:
    n1 = set(pr.bm.faces); pr.add_bm(L.lathe([(0.0, 0.0), (0.045, 0.0), (0.045, 0.13), (0.0, 0.13)], seg=12), Matrix.Translation(g2b(x - 0.4, 0.78, TABLE_Z - 0.1)))
    pr.paint([f for f in pr.bm.faces if f not in n1], '#bfc3c6'); n1 = set(pr.bm.faces)
    for k in range(14): a = k * 2.4; pr.cbox(x - 0.4 + 0.025 * math.cos(a) - 0.004, x - 0.4 + 0.025 * math.cos(a) + 0.004, 0.9, 1.0, TABLE_Z - 0.1 + 0.025 * math.sin(a) - 0.004, TABLE_Z - 0.1 + 0.025 * math.sin(a) + 0.004, '#e6c88e')   # 筷子
    pr.add_bm(L.lathe([(0.0, 0.0), (0.03, 0.0), (0.03, 0.09), (0.02, 0.11), (0.0, 0.11)], seg=10), Matrix.Translation(g2b(x - 0.22, 0.78, TABLE_Z - 0.12)))
    pr.paint([f for f in pr.bm.faces if f not in n1], '#c8321e'); n1 = set(pr.bm.faces)
    pr.add_bm(L.lathe([(0.0, 0.0), (0.025, 0.0), (0.025, 0.12), (0.01, 0.15), (0.0, 0.15)], seg=10), Matrix.Translation(g2b(x - 0.12, 0.78, TABLE_Z - 0.12)))
    pr.paint([f for f in pr.bm.faces if f not in n1], '#2a1a10')
    pr.crbox(x + 0.25, x + 0.47, 0.78, 0.86, TABLE_Z - 0.18, TABLE_Z - 0.06, '#f4c4cc', r=0.01)   # 面紙盒
pr.finish(root, smooth=True)

# ---------------- 不鏽鋼桌＋紅色圓凳（位置照套件）----------------
tt = Mesh('TABLE_TOP', m_steel); tl = Mesh('TABLE_LEGS', m_steel_d)
for x in TABLE_X:
    tt.box(x - 0.7, x + 0.7, 0.74, 0.78, TABLE_Z - 0.45, TABLE_Z + 0.45); tt.box(x - 0.7, x + 0.7, 0.7, 0.74, TABLE_Z - 0.45, TABLE_Z - 0.43); tt.box(x - 0.7, x + 0.7, 0.7, 0.74, TABLE_Z + 0.43, TABLE_Z + 0.45)
    for sx in (-1, 1):
        for sz in (-1, 1): tl.cyl((x + sx * 0.64, 0.0, TABLE_Z + sz * 0.39), (x + sx * 0.64, 0.7, TABLE_Z + sz * 0.39), 0.02, seg=8)
    tl.box(x - 0.64, x + 0.64, 0.2, 0.22, TABLE_Z - 0.4, TABLE_Z - 0.38); tl.box(x - 0.64, x + 0.64, 0.2, 0.22, TABLE_Z + 0.38, TABLE_Z + 0.4)
tt.finish(root); tl.finish(root)
ss = Mesh('STOOL_SEATS', L.flat('sl_stool', '#7a1e22', rough=0.35)); sl = Mesh('STOOL_LEGS', m_steel_d)
for x in TABLE_X:
    for z in STOOL_Z:
        for dx in (-0.5, 0.0, 0.5):   # 中間那張＝遊戲坐的位置（套件的椅子）
            sx_ = x + dx; ss.add_bm(L.lathe([(0.0, 0.0), (0.16, 0.0), (0.17, 0.03), (0.16, 0.06), (0.0, 0.065)], seg=18), Matrix.Translation(g2b(sx_, 0.42, z)))
            for k in range(3):
                a = k * 2 * math.pi / 3; sl.cyl((sx_ + 0.13 * math.cos(a), 0.0, z + 0.13 * math.sin(a)), (sx_ + 0.1 * math.cos(a), 0.42, z + 0.1 * math.sin(a)), 0.012, seg=6)
            sl.add_bm(L.lathe([(0.115, 0.0), (0.12, 0.0), (0.12, 0.012), (0.115, 0.012)], seg=16), Matrix.Translation(g2b(sx_, 0.16, z)))
ss.finish(root, smooth=True); sl.finish(root)

# ---------------- 前牆右邊：燒臘玻璃櫃（掛叉燒、燒鴨、油雞、黃燈）＋價目卡 ----------------
c = CASE
cb_ = Mesh('CASE_BODY', m_steel); cb_.box(c['x0'], c['x1'], 0.0, 0.95, c['z0'], c['z1']); cb_.box(c['x0'], c['x1'], 2.55, 2.62, c['z0'], c['z1'])
for x in (c['x0'], c['x1']): cb_.box(x - 0.025, x + 0.025, 0.95, 2.55, c['z0'], c['z0'] + 0.04)
cb_.finish(root)
Mesh('CASE_GLASS', m_glass).box(c['x0'] + 0.03, c['x1'] - 0.03, 0.95, 2.55, c['z0'], c['z0'] + 0.01).finish(root, props={'glass': 1})
rail = Mesh('CASE_RAIL', L.flat('sl_brass', '#b58a43', rough=0.32, metal=0.4)); rz = (c['z0'] + c['z1']) / 2
rail.cyl((c['x0'] + 0.05, 2.3, rz), (c['x1'] - 0.05, 2.3, rz), 0.015, seg=8)
meat = CMesh('MEATS', m_meat); hooks = []
for i in range(5):        # 叉燒：一條一條（暗紅、邊緣焦）
    x = c['x0'] + 0.22 + i * 0.13; hooks.append(x)
    meat.crbox(x - 0.04, x + 0.04, 1.55, 2.15, rz - 0.035, rz + 0.035, '#8a1e18' if i % 2 else '#a2291c', r=0.02, seg=2)
n_duck = set(meat.bm.faces)
for i in range(2):        # 燒鴨：油亮的深褐，頭垂下來
    x = c['x0'] + 1.05 + i * 0.38; hooks.append(x)
    meat.ell((x, 1.85, rz), 0.13, 0.26, 0.1, seg=12, rings=8); meat.ell((x, 1.5, rz + 0.02), 0.03, 0.12, 0.03, seg=6, rings=4)
meat.paint([f for f in meat.bm.faces if f not in n_duck], '#7a3a14'); n0 = set(meat.bm.faces)
for i in range(2):        # 油雞：金黃
    x = c['x0'] + 1.9 + i * 0.32; hooks.append(x); meat.ell((x, 1.9, rz), 0.12, 0.2, 0.1, seg=12, rings=8)
meat.paint([f for f in meat.bm.faces if f not in n0], '#e8b04a')
# 下層一盤盤切好的肉
for i in range(4):
    x = c['x0'] + 0.25 + i * 0.6; meat.crbox(x, x + 0.5, 0.95, 1.0, c['z0'] + 0.06, c['z1'] - 0.04, '#b8bcc0', r=0.01)
    for k in range(10): meat.crbox(x + 0.04 + (k % 5) * 0.09, x + 0.11 + (k % 5) * 0.09, 1.0, 1.04, c['z0'] + 0.1 + (k // 5) * 0.12, c['z0'] + 0.2 + (k // 5) * 0.12, ['#8a2a1e', '#7a3a14', '#e0a850', '#a04030'][i], r=0.01, seg=1)
meat.finish(root, smooth=True)
hk = Mesh('CASE_HOOKS', m_steel_d)
for x in hooks: hk.cyl((x, 2.3, rz), (x, 2.12, rz), 0.006, seg=4)
hk.finish(root)
lp_ = Mesh('CASE_LAMPS', L.flat('sl_lampshade', '#b58a43', rough=0.35, metal=0.4)); lg = Mesh('CASE_LAMP_GLOW', m_lamp)
for x in (c['x0'] + 0.5, c['x0'] + 1.3, c['x0'] + 2.1):
    lp_.add_bm(L.lathe([(0.02, 0.0), (0.12, -0.1), (0.0, -0.1)], seg=14), Matrix.Translation(g2b(x, 2.55, rz))); lg.cyl((x, 2.44, rz), (x, 2.445, rz), 0.09, seg=12)
lp_.finish(root, smooth=True); lg.finish(root)
for i, k in enumerate(('card1', 'card2')):   # 價目卡（貼在玻璃內側，面向店裡）
    y0 = 1.05 + i * 0.26
    uvquad(f'CASE_CARD{i}', (c['x1'] - 0.06, y0, c['z0'] + 0.02), (c['x1'] - 0.66, y0, c['z0'] + 0.02), (c['x1'] - 0.66, y0 + 0.2, c['z0'] + 0.02), (c['x1'] - 0.06, y0 + 0.2, c['z0'] + 0.02), IM[k])
uvquad('SHOP_SIGN', (X1 - WT - 0.02, 2.4, 2.6), (X1 - WT - 0.02, 2.4, 0.0), (X1 - WT - 0.02, 3.05, 0.0), (X1 - WT - 0.02, 3.05, 2.6), IM['sign'], G['right'])   # 店裡右牆高處的招牌

# ---------------- 牆上的小東西：壁扇、冷氣、圓鐘、福、相框、電視 ----------------
wd = CMesh('WALL_ITEMS', m_vc)
wd.crbox(X0 + WT, X0 + WT + 0.25, 2.45, 2.75, 1.6, 2.5, '#ece6d6', r=0.02)                             # 冷氣（左牆）
for k in range(6): wd.cbox(X0 + WT + 0.25, X0 + WT + 0.26, 2.48 + k * 0.04, 2.5 + k * 0.04, 1.65, 2.45, '#a8a296')
wd.cbox(X0 + WT, X0 + WT + 0.06, 2.0, 2.3, 3.0, 3.1, '#3a3a3a')                                         # 壁扇座
wd.add_bm(L.lathe([(0.0, 0.0), (0.22, 0.0), (0.24, 0.05), (0.0, 0.09)], seg=20), Matrix.Translation(g2b(X0 + WT + 0.3, 2.2, 3.05)) @ Matrix.Rotation(math.pi / 2, 4, 'Y'))
for z, col in ((0.0, '#6a4a2a'), (-0.6, '#8a6a4a'), (-1.2, '#5a4a3a')): wd.cbox(X0 + WT, X0 + WT + 0.03, 1.55, 1.9, z - 0.15, z + 0.15, col)   # 小相框（營業登記、獎狀）
wd.add_bm(L.lathe([(0.0, 0.0), (0.19, 0.0), (0.19, 0.04), (0.0, 0.04)], seg=24), Matrix.Translation(g2b(-0.5, 2.45, Z0 + WT)) @ Matrix.Rotation(-math.pi / 2, 4, 'X'))   # 圓鐘
wd.crbox(-1.0 + 0.0, -0.5 + 0.0, 2.65, 3.0, Z0 + WT, Z0 + WT + 0.45, '#1a1a1c', r=0.03)   # 電視（掛在後牆高處、往前凸）——暫用；畫面另外貼
wd.finish(root, smooth=True)
Mesh('CLOCK_FACE', L.flat('sl_clockface', '#f6f2e6', rough=0.4)).cyl((-0.5, 2.45, Z0 + WT + 0.041), (-0.5, 2.45, Z0 + WT + 0.045), 0.16, seg=24).finish(root)
uvquad('TV_SCREEN', (-0.97, 2.68, Z0 + WT + 0.451), (-0.53, 2.68, Z0 + WT + 0.451), (-0.53, 2.97, Z0 + WT + 0.451), (-0.97, 2.97, Z0 + WT + 0.451), IM['tv'])
uvquad('FU', (X0 + WT + 0.01, 1.55, -1.75), (X0 + WT + 0.01, 1.55, -2.15), (X0 + WT + 0.01, 1.95, -2.15), (X0 + WT + 0.01, 1.95, -1.75), IM['fu'], G['left'])

# ---------------- 減量（材質 ≤ 12）----------------
for ob in list(root.children_recursive):
    if ob.type == 'MESH' and ob.data and len(ob.data.polygons) == 0: B.remove(ob)
vc_m = L.vc_material('sl_vc_matte', rough=0.7); vc_g = L.vc_material('sl_vc_gloss', rough=0.3); vc_x = L.vc_metal('sl_vc_metal', rough=0.32, metal=0.25)
grp = L.auto_vc_groups(root, vc_m, vc_x, gloss=vc_g, protect={'sl_glass', 'sl_tube', 'sl_lamp', 'sl_tv', 'sl_meat_vc'})
grp['sl_props_vc'] = vc_m
L.vc_consolidate(root, grp)
L.atlas_small(root, os.path.join(TMP, 'sl_atlas.png'), 'sl_atlas', max_tris=6000, max_rep=1, cell=512, rough=0.7)
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('WALL_'), key=lambda ob: ('WALL_' + ob.name.split('_')[1]) if ob.name.startswith('WALL_') else '')
L.export(OUT)
print('OK', OUT, B.stats(), 'newBlocks', SHAOLA_NEW_BLOCKS)
