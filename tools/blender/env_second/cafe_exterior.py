"""兩點半 Café（溫州街東端路口）建築外觀＋一樓店面＋窗內看得到的店內空間＋門口道具 → GLB。
第二 AI 工作階段（環境美術）製作；Blender 5.2.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/cafe_exterior.py [-- --out assets/models/env/second_ai/cafe_exterior.glb] [--render 資料夾]

座標＝套件建築 TK.apartment 的座標（遊戲 x 右、y 上、z 往街道）：正面朝 +z、原點在正面中央的地面，
寬 14 m（x −7～7）、深 13 m（z −13～0）、一樓 3.8 m、二三樓各 3.2 m（屋頂 10.2 m）——和 src/zones3d.js 的 cafeB 相同，
所以導航（blockRect）、鏡頭碰撞、店門互動點、門口盆栽與 A 字立牌的導航阻擋都不用改。遊戲整合：GLB 的根節點掛在 cafeB 底下
（zones3d.js 的 attachExterior 做法），套件的外觀藏起來。

參考：docs/art-rebuild/references/04（① 店面外觀白天、④ 店內）、05、07（黃昏店門口）；ART_DIRECTION 第 6、7 節：
深木色門窗框＋大面玻璃（窗內看得到吊燈、書架、桌椅、植物）、門楣上方深色招牌（米白字，夜間發光）、壁燈、門口盆栽與爬藤、A 字黑板立牌；
二三樓是台北老公寓（長條磁磚外牆、鋁窗、鐵窗、冷氣室外機、雨遮浪板、陽台盆栽、不鏽鋼水塔）。

不放在 GLB 裡的東西（遊戲用 canvas 畫，和套件相同）：招牌字「兩點半 Café」、A 字立牌的字、店內黑板菜單的字——
GLB 裡是空白的板面，節點名稱 SIGN_FACE、ABOARD_FACE_*、MENU_FACE（自訂屬性帶文字內容），UV 是整張 0～1。
夜間會亮的材質（遊戲用 TK.addNight／TK.bounce 登記；見 NIGHT_MATS、BOUNCE_MATS）與光暈位置（GLOW_* 空節點，自訂屬性 glow）照名稱約定。
"""
import math, os, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/cafe_exterior.glb'))
RENDER = arg('--render')
TEXRES = int(arg('--texres', '512'))

W, D, GH, FH, NF = 14.0, 13.0, 3.8, 3.2, 3          # 寬、深、一樓高、樓高、樓層數（和套件相同）
TOP = GH + FH * (NF - 1)                            # 屋頂 10.2
PIL = 0.55                                          # 一樓兩側壁柱寬
SX0, SX1 = -W / 2 + PIL, W / 2 - PIL                # 店面開口 x −6.45～6.45
DOOR = 0.9                                          # 門洞半寬（雙開門，每扇約 0.8 m）
POST = 0.2                                          # 門兩側的門柱寬（裝小壁燈）
SILL, TRAN, HEAD = 0.58, 2.28, 3.0                  # 窗台、橫楣（上面是氣窗）、店面上緣
DEPTH = 4.2                                         # 窗內看得到的店內深度
CEIL = 3.0                                          # 店內天花板

# 夜間會亮的材質（遊戲整合時登記）：名稱 → [emissive 顏色, 夜間強度, 白天強度]
NIGHT_MATS = {
    'cafe_bulb': ['#fff1d6', 2.4, 1.0],         # 吊燈、壁燈、招牌燈的燈泡
    'cafe_lampglass': ['#ffd49a', 1.5, 0.3],    # 壁燈、吊燈的燈罩玻璃
    'cafe_sign_face': ['#f4ead8', 1.1, 0.15],   # 招牌（遊戲換成 canvas 招牌字貼圖，和套件的招牌相同強度）
    'ext_glass_lit': ['#ffd9a0', 0.75, 0.0],    # 樓上住家亮燈的窗簾（和霖澤館的窗同名、同強度）
}
# 店內材質：遊戲用 TK.bounce(材質, 白天, 夜間) 讓店內看起來有燈（從窗外看進去是暖的）
BOUNCE_MATS = {'cafe_int_floor': [0.45, 0.75], 'cafe_int_plaster': [0.6, 0.95], 'cafe_int_wood': [0.4, 0.7], 'cafe_int_ceiling': [0.4, 0.75],
               'cafe_int_books': [0.5, 0.8], 'cafe_int_shelf': [0.4, 0.7], 'cafe_int_bar': [0.4, 0.7]}   # 白天店裡也開燈（玻璃外看得到暖色的店內）

random.seed(230)
B.reset(texres=TEXRES)
root = B.group('cafe_twothirty', props={'kind': 'cafe_exterior', 'w': W, 'd': D, 'gh': GH})

# ---------------------------------------------------------------- 材質
def M_(name, pid=None, **kw): return L.pbr(name, pid, **kw)
mat = {
    # 外牆：台北老公寓的長條磁磚（Poly Haven rectangular_facade_tiles，校正成米色；2 m 一張）
    'tile': M_('cafe_wall_tile', 'rectangular_facade_tiles', tile=2.0, target='#ddd0b8', normal=0.9),
    # 一樓壁柱：深褐色的二丁掛磁磚（exterior_wall_cladding_02）
    'pier': M_('cafe_pier_tile', 'exterior_wall_cladding_02', tile=1.4, target='#6e4a36', normal=0.9, maps=('diff', 'nor'), rough_value=0.75),
    # 樓板線、窗台、陽台板：水泥漆
    'band': M_('cafe_band', 'plaster_grey_04', tile=1.5, target='#d6ccbb', maps=('diff',), res=256, rough_value=0.85),
    'base': M_('cafe_base_stone', 'terrazzo_tiles', tile=1.2, target='#8a8279', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.6),   # 一樓牆腳、門檻（磨石子）
    # 店面木作：深色舊木（門窗框、窗下木板、招牌框）、雨遮木板
    'wood': M_('cafe_wood_dark', 'fine_grained_wood', tile=0.9, target='#4e3322', normal=0.7),   # 細直木紋（門窗框很細，粗木紋會變成一塊一塊）
    'wood2': M_('cafe_wood_mid', 'dark_wood', tile=1.2, target='#6b4a30', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'board': M_('cafe_sign_face', None, tint=B.srgb('#3b2a1e'), rough=0.7),
    'metal': L.flat('cafe_iron_black', '#24221f', rough=0.45, metal=0.45),
    'brass': L.flat('cafe_brass', '#9a7840', rough=0.35, metal=0.45),
    'glass': L.flat('cafe_glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'lampglass': L.flat('cafe_lampglass', '#f6e2b8', rough=0.2, emit=B.srgb('#ffd49a'), alpha=0.85),
    'bulb': L.flat('cafe_bulb', '#fff4dc', rough=0.3, emit=B.srgb('#fff1d6')),
    # 樓上：鋁窗、窗玻璃（反射天空的深色）、窗簾、窗內房間、鐵窗、冷氣、雨遮浪板、屋頂、水塔
    'alu': L.flat('cafe_alu', '#b9bcbd', rough=0.35, metal=0.45),
    'win_glass': L.flat('cafe_win_glass', '#5d6b74', rough=0.08, alpha=0.55),
    'curtain_lit': L.flat('ext_glass_lit', '#e9dcc3', rough=0.9, emit=B.srgb('#ffd9a0')),
    'curtain': L.flat('cafe_curtain', '#c9c3b4', rough=0.9),
    'room_dark': L.flat('cafe_room_dark', '#2a2724', rough=0.9),
    'grille': L.flat('cafe_grille', '#3b2a1e', rough=0.55, metal=0.3),
    'ac': L.flat('cafe_ac_body', '#e6e4dd', rough=0.5),
    'ac_dark': L.flat('cafe_ac_fan', '#3a3c3e', rough=0.6),
    'pipe': L.flat('cafe_pipe', '#9aa09e', rough=0.5),
    'corr': M_('cafe_corrugated', 'corrugated_iron', tile=1.12, target='#c9cfc9', normal=1.0, maps=('diff', 'nor'), res=256, rough_value=0.55),
    'roof': L.flat('cafe_roof_slab', '#8f8b84', rough=0.95),
    'tank': L.flat('cafe_tank_steel', '#c4c8cb', rough=0.3, metal=0.45),
    # 店內（窗外看得到的部分）
    'floor': M_('cafe_int_floor', 'herringbone_parquet', tile=1.7, target='#8a5f3e', maps=('diff',), rough_value=0.55),
    'plaster': M_('cafe_int_plaster', 'white_plaster_02', tile=1.0, target='#e6d6bd', maps=('diff',), res=256, rough_value=0.9),
    'iwood': M_('cafe_int_wood', 'walnut_veneer', tile=1.2, target='#7a5536', maps=('diff',), res=256, rough_value=0.6),
    'shelf': M_('cafe_int_shelf', 'black_walnut_veneer_01', tile=1.0, target='#5a3d26', maps=('diff',), res=256, rough_value=0.65),
    'ceil': M_('cafe_int_ceiling', 'dark_wood', tile=1.6, target='#5e4330', maps=('diff',), res=256, rough_value=0.75),
    'bar': M_('cafe_int_bar', 'walnut_veneer', tile=1.0, target='#6a4a30', maps=('diff',), res=256, rough_value=0.6),
    'bartop': L.flat('cafe_int_bartop', '#d8cfc0', rough=0.4),
    'steel': L.flat('cafe_steel', '#aeb2b4', rough=0.25, metal=0.45),
    'ceramic': L.flat('cafe_ceramic_white', '#f2efe8', rough=0.25),
    'chalk': L.flat('cafe_board_face', '#2b3530', rough=0.85),
    # 盆栽
    'pot_terra': L.flat('cafe_pot_terracotta', '#a8613f', rough=0.8),
    'pot_cream': L.flat('cafe_pot_cream', '#e4dccb', rough=0.35),
    'pot_dark': L.flat('cafe_pot_dark', '#4a4744', rough=0.45),
    'soil': L.flat('cafe_soil', '#3b2f25', rough=1.0),
    'trunk': L.flat('cafe_trunk', '#6b5a48', rough=0.9),
}


def leaf_mat(name, png):
    """葉片卡：RGBA 貼圖（gen_leaves.py 產生），透明度用 alpha clip（Round 節點 → glTF alphaMode MASK）"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 0.7
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'gen', png))
    Lk.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; Lk.new(tx.outputs['Alpha'], rnd.inputs[0]); Lk.new(rnd.outputs[0], bsdf.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    m.use_backface_culling = False; m['tile'] = 1.0
    return m

for k, png in (('ivy', 'ivy_leaves.png'), ('broad', 'broad_leaves.png'), ('olive', 'olive_leaves.png'), ('fern', 'fern_leaves.png')):
    mat[k] = leaf_mat('cafe_leaf_' + k, png)

# ---------------------------------------------------------------- 小工具
_glow_n = [0]
def glow(kind, x, y, z, color='rgba(255,205,140,1)', size=1.4, day=0.25, night=1.0):
    """夜間光暈的位置（空節點；遊戲照自訂屬性 glow 生成 TK.glowSprite(glow, size, day, night)）"""
    _glow_n[0] += 1
    o = B.group(f'GLOW_{kind}_{_glow_n[0]}', root, {'glow': color, 'size': size, 'day': day, 'night': night}); o.location = g2b(x, y, z); return o


def card(m, cx, cy, cz, w, h, ry=0.0, rx=0.0, uv=(0, 0, 1, 1)):
    """葉片卡（一個四邊形；遊戲座標中心點、寬高、繞 y 轉 ry、往前傾 rx）；uv＝貼圖的哪一塊"""
    bm = m.bm; c = Vector((cx, cy, cz))
    rot = Matrix.Rotation(ry, 3, 'Y') @ Matrix.Rotation(rx, 3, 'X')
    loc = [Vector((-w / 2, -h / 2, 0)), Vector((w / 2, -h / 2, 0)), Vector((w / 2, h / 2, 0)), Vector((-w / 2, h / 2, 0))]
    vs = [bm.verts.new(g2b(*(c + rot @ p))) for p in loc]; f = bm.faces.new(vs)
    uvl = bm.loops.layers.uv.verify(); u0, v0, u1, v1 = uv
    for lp, (u, v) in zip(f.loops, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]): lp[uvl].uv = (u, v)
    return f


def rand_uv(span=0.5):
    u = random.uniform(0, 1 - span); v = random.uniform(0, 1 - span); return (u, v, u + span, v + span)


def bush(m, cx, cy, cz, r, n=10, span=0.5, flat_y=1.0):
    """一團葉子：在球形範圍內放 n 張不同方向的葉片卡"""
    for i in range(n):
        a = random.uniform(0, 2 * math.pi); e = random.uniform(-0.6, 0.9)
        px = cx + math.cos(a) * r * 0.55 * math.cos(e); pz = cz + math.sin(a) * r * 0.55 * math.cos(e); py = cy + math.sin(e) * r * 0.5 * flat_y
        s = r * random.uniform(0.9, 1.3)
        card(m, px, py, pz, s, s, ry=random.uniform(0, math.pi), rx=random.uniform(-0.9, 0.9), uv=rand_uv(span))


def pot(m, cx, cz, r, h, profile='taper', y0=0.0):
    """花盆（旋轉體），底部在 y0"""
    if profile == 'bowl': prof = [(r * 0.55, 0), (r * 0.85, h * 0.25), (r, h * 0.75), (r * 1.02, h), (r * 0.92, h)]
    elif profile == 'cyl': prof = [(r * 0.92, 0), (r, 0.03), (r, h), (r * 0.94, h)]
    else: prof = [(r * 0.72, 0), (r * 0.78, 0.02), (r, h * 0.92), (r * 1.06, h * 0.94), (r * 1.06, h), (r * 0.96, h)]
    bm = L.lathe(prof, seg=18); m.add_bm(bm, Matrix.Translation(g2b(cx, y0, cz))); bm.free()


def proto(mesh_obj):
    """Mesh.finish() 的物件 → 只留網格（給 instancing 用）"""
    me = mesh_obj.data; bpy.data.objects.remove(mesh_obj); return me


def combine(parts, name):
    objs = [p for p in parts if p is not None]; me = B._combine(objs, name)
    for o in objs: bpy.data.meshes.remove(o.data)
    return me


# ================================================================ 1. 建築量體（磁磚外牆、側牆、背面、屋頂）
facade = B.group('FACADE', root)
# 樓上的窗：(樓層, 中心 x, 寬, 高, 窗台高度, 種類)；種類：grille 鐵窗、awning 雨遮、balcony 陽台落地窗
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
for s in (-1, 1):
    x0, x1 = (-W / 2, -W / 2 + 0.25) if s < 0 else (W / 2 - 0.25, W / 2)
    side.box(x0, x1, GH, TOP + 0.95, -D, -0.25)               # 二樓以上側牆
    side.box(x0, x1, 0, GH, -D, -0.3)                         # 一樓側牆（壁柱後面一路到背面，相鄰公寓之間的縫看不到空隙）
side.box(-W / 2, W / 2, 0, TOP + 0.95, -D, -D + 0.25)         # 背面
side.box(-W / 2 + 0.25, W / 2 - 0.25, TOP, TOP + 0.95, -D + 0.25, -D + 0.45)
side.finish(facade)
roof = Mesh('roof', mat['roof']); roof.box(-W / 2 + 0.22, W / 2 - 0.22, TOP - 0.05, TOP + 0.05, -D + 0.25, -0.22); roof.finish(facade)
band = Mesh('bands', mat['band'])
band.box(-W / 2 - 0.04, W / 2 + 0.04, TOP + 0.95, TOP + 1.03, -0.3, 0.06)                                       # 女兒牆壓頂
for f in range(1, NF):
    y = GH + (f - 1) * FH; band.box(-W / 2 - 0.02, W / 2 + 0.02, y - 0.1, y + 0.1, -0.25, 0.1)                   # 樓板線
for (f, cx, w_, h_, sill, kind) in WINS:
    if kind != 'balcony': band.box(cx - w_ / 2 - 0.1, cx + w_ / 2 + 0.1, sill - 0.07, sill, -0.25, 0.08)        # 窗台
band.finish(facade)

# ================================================================ 2. 樓上的窗（鋁窗、玻璃、窗簾、窗內）、鐵窗、雨遮、冷氣、陽台、水塔
upper = B.group('UPPER', root)
alu = Mesh('win_alu', mat['alu']); glass = Mesh('win_glass', mat['win_glass']); cur = Mesh('win_curtain', mat['curtain'])
curl = Mesh('win_curtain_lit', mat['curtain_lit']); dark = Mesh('win_room', mat['room_dark'])
LIT = {(1, -5.15), (1, 1.9), (2, -1.75), (2, 5.25)}           # 晚上亮燈的住家
for (f, cx, w_, h_, sill, kind) in WINS:
    x0, x1, y0, y1 = cx - w_ / 2, cx + w_ / 2, sill, sill + h_
    fz = -0.12                                                 # 窗框在牆厚中間
    dark.box(x0, x1, y0, y1, -0.92, -0.88)                     # 窗內的房間（深色盒子：後、上、下、左、右）
    dark.box(x0, x1, y0 - 0.02, y0, -0.9, fz); dark.box(x0, x1, y1, y1 + 0.02, -0.9, fz)
    dark.box(x0, x0 + 0.02, y0, y1, -0.9, fz); dark.box(x1 - 0.02, x1, y0, y1, -0.9, fz)
    cm = curl if (f, cx) in LIT else cur                       # 窗簾：一邊拉開、一邊拉上
    cw = w_ * random.uniform(0.35, 0.55)
    if random.random() < 0.5:
        cm.box(x1 - cw, x1 - 0.03, y0 + 0.03, y1 - 0.05, -0.3, -0.28); cm.box(x0 + 0.03, x0 + 0.12, y0 + 0.03, y1 - 0.05, -0.3, -0.27)
    else:
        cm.box(x0 + 0.03, x0 + cw, y0 + 0.03, y1 - 0.05, -0.3, -0.28); cm.box(x1 - 0.12, x1 - 0.03, y0 + 0.03, y1 - 0.05, -0.3, -0.27)
    t = 0.05                                                   # 鋁窗框：外框＋兩扇拉窗（中間重疊）
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
    """鐵窗頂上、窗上的雨遮：斜的浪板（靠牆高、往外低）"""
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
        for k in range(random.randint(1, 3)):       # 鐵窗裡的小盆栽
            px = cx + random.uniform(-0.9, 0.9); pz = random.uniform(0.16, 0.28)
            pot(gpots, px, pz, 0.09, 0.16, 'taper', y0=sill - 0.09)
            bush(gplants, px, sill + 0.24, pz, 0.32, n=4, span=0.45)
    elif kind == 'awning':
        B.instance(hood, f'awning_{i}', cx, sill + h_ + 0.18, 0.0, upper)
gplants.finish(upper, uv=False); gpots.finish(upper, smooth=True)

# 陽台（二樓中間）：混凝土陽台板＋磁磚矮牆＋鐵欄杆＋盆栽＋曬衣桿
_, bx, bw, bh, bsill, _ = [w for w in WINS if w[5] == 'balcony'][0]
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
balr.cyl((bx0 + 0.1, bsill + 2.0, bd - 0.25), (bx1 - 0.1, bsill + 2.0, bd - 0.25), 0.015, seg=6)      # 曬衣桿
for s in (bx0 + 0.1, bx1 - 0.1): balr.box(s - 0.015, s + 0.015, bsill + 2.0, bsill + 2.1, -0.25, bd - 0.24)
balr.finish(upper)
bpl = Mesh('balcony_plants', mat['broad']); bpo = Mesh('balcony_pots', mat['pot_terra']); bpc = Mesh('balcony_pots2', mat['pot_cream'])
for k, px in enumerate([bx0 + 0.45, bx0 + 1.0, bx1 - 0.5, bx1 - 1.2]):
    big = k in (0, 2); r = 0.2 if big else 0.13; h = 0.36 if big else 0.22; pz = bd - 0.45
    pot(bpo if k % 2 == 0 else bpc, px, pz, r, h, y0=bsill)
    bush(bpl, px, bsill + h + (0.45 if big else 0.25), pz, 0.55 if big else 0.32, n=7 if big else 4, span=0.42)
bpl.finish(upper, uv=False); bpo.finish(upper, smooth=True); bpc.finish(upper, smooth=True)


def ac_mesh():
    """冷氣室外機（窗邊，掛在鐵架上）：機身、風扇與護網、側邊散熱鰭片、L 形鐵架"""
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
    pipes.cyl((cx + px, y, 0.04), (cx + px, GH + 0.15, 0.04), 0.018, seg=6)        # 冷氣排水管（沿牆往下）
pipes.cyl((6.78, TOP + 0.8, 0.08), (6.78, 0.15, 0.08), 0.045, seg=8)                # 屋頂排水管（正面右側到地面）
for y in (1.2, 4.6, 7.8): pipes.box(6.72, 6.84, y, y + 0.05, -0.02, 0.13)
pipes.finish(upper)

tankm = Mesh('roof_tank', mat['tank'])                                              # 頂樓不鏽鋼水塔＋鐵架
bmt = L.lathe([(0.0, 0.0), (0.55, 0.0), (0.6, 0.08), (0.6, 1.1), (0.55, 1.2), (0.25, 1.38), (0.0, 1.42)], seg=20)
tankm.add_bm(bmt, Matrix.Translation(g2b(-3.5, TOP + 0.55, -4.0))); bmt.free(); tankm.finish(upper, smooth=True)
tst = Mesh('roof_tank_stand', mat['metal'])
for sx in (-1, 1):
    for sz in (-1, 1): tst.box(-3.5 + sx * 0.45 - 0.03, -3.5 + sx * 0.45 + 0.03, TOP, TOP + 0.55, -4.0 + sz * 0.45 - 0.03, -4.0 + sz * 0.45 + 0.03)
tst.box(-4.0, -3.0, TOP + 0.5, TOP + 0.56, -4.5, -3.5); tst.finish(upper)

# ================================================================ 3. 一樓店面
shop = B.group('SHOPFRONT', root)
pier = Mesh('piers', mat['pier'])                                                   # 壁柱（深褐磁磚）
for x0, x1 in ((-W / 2, SX0), (SX1, W / 2)): pier.box(x0, x1, 0.42, GH - 0.1, -0.3, 0.06)
pier.finish(shop)
base = Mesh('base_stone', mat['base'])
for x0, x1 in ((-W / 2, SX0), (SX1, W / 2)): base.box(x0 - 0.01, x1 + 0.01, 0, 0.42, -0.3, 0.09)
base.box(SX0, SX1, 0, 0.1, -0.08, 0.14)                     # 店面下的石台
base.box(-DOOR - 0.05, DOOR + 0.05, 0, 0.03, 0.14, 0.4)     # 門前石階（很薄，人物腳不會陷進去）
base.finish(shop)
fas = Mesh('fascia', mat['wood']); fas.box(SX0, SX1, HEAD, GH - 0.1, -0.12, 0.02); fas.finish(shop)   # 門楣上方的店招牆（深木）

wd = Mesh('shop_wood', mat['wood'])                         # 店面木作：窗下木板（凸起線板）、窗台板、直櫺、橫楣、上框、門柱
bays = []
for (a, b_) in ((SX0, -DOOR - POST), (DOOR + POST, SX1)):
    n = 4; xs = [a + (b_ - a) * k / n for k in range(n + 1)]; bays.append(xs)
    wd.box(a, b_, 0.1, SILL, -0.06, 0.06)
    for k in range(n): wd.box(xs[k] + 0.12, xs[k + 1] - 0.12, 0.2, SILL - 0.1, 0.06, 0.085)
    wd.box(a - 0.02, b_ + 0.02, SILL, SILL + 0.06, -0.08, 0.13)
    for x in xs: wd.box(x - 0.045, x + 0.045, SILL, HEAD, -0.06, 0.06)
    wd.box(a, b_, TRAN, TRAN + 0.08, -0.06, 0.07)
    wd.box(a, b_, HEAD - 0.1, HEAD, -0.07, 0.07)
for s in (-1, 1):
    x0, x1 = sorted((s * DOOR, s * (DOOR + POST))); wd.box(x0, x1, 0.04, HEAD, -0.07, 0.08)
wd.box(-DOOR, DOOR, TRAN, TRAN + 0.1, -0.07, 0.08)
DZ = 0.0
for s in (-1, 1):                                           # 兩扇門：立梃、上下冒頭、中間推手橫條
    x0, x1 = sorted((s * 0.006, s * DOOR))
    wd.box(x0, x0 + 0.1, 0.04, TRAN - 0.02, DZ - 0.04, DZ + 0.04); wd.box(x1 - 0.1, x1, 0.04, TRAN - 0.02, DZ - 0.04, DZ + 0.04)
    wd.box(x0, x1, 0.04, 0.32, DZ - 0.04, DZ + 0.04); wd.box(x0, x1, TRAN - 0.14, TRAN - 0.02, DZ - 0.04, DZ + 0.04)
    wd.box(x0, x1, 1.02, 1.08, DZ - 0.04, DZ + 0.04)
wd.finish(shop)
br = Mesh('shop_brass', mat['brass'])                       # 黃銅：門把（長直把手＋支腳）、門下踢腳板
for s in (-1, 1):
    hx = s * 0.17
    br.cyl((hx, 0.78, DZ + 0.1), (hx, 1.52, DZ + 0.1), 0.017, seg=10)
    for y in (0.84, 1.46): br.cyl((hx, y, DZ + 0.04), (hx, y, DZ + 0.1), 0.012, seg=8)
br.finish(shop, smooth=True)
gl = Mesh('shop_glass', mat['glass'])                       # 店面與門的玻璃
for xs in bays:
    for k in range(len(xs) - 1):
        a, b_ = xs[k] + 0.045, xs[k + 1] - 0.045
        gl.quad([(a, SILL + 0.06, 0.0), (b_, SILL + 0.06, 0.0), (b_, TRAN, 0.0), (a, TRAN, 0.0)])
        gl.quad([(a, TRAN + 0.08, 0.0), (b_, TRAN + 0.08, 0.0), (b_, HEAD - 0.1, 0.0), (a, HEAD - 0.1, 0.0)])
gl.quad([(-DOOR, TRAN + 0.1, 0.0), (DOOR, TRAN + 0.1, 0.0), (DOOR, HEAD - 0.1, 0.0), (-DOOR, HEAD - 0.1, 0.0)])
for s in (-1, 1):
    x0, x1 = sorted((s * 0.106, s * (DOOR - 0.1)))
    gl.quad([(x0, 0.32, DZ), (x1, 0.32, DZ), (x1, 1.02, DZ), (x0, 1.02, DZ)]); gl.quad([(x0, 1.08, DZ), (x1, 1.08, DZ), (x1, TRAN - 0.14, DZ), (x0, TRAN - 0.14, DZ)])
gl.finish(shop)

# 雨遮：木板斜屋頂（靠牆高、往外低）＋前緣與兩端封板＋底下木條＋鐵件斜撐
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

# 招牌：深木框＋空白板面 SIGN_FACE（字由遊戲畫）＋三盞照招牌的鵝頸燈
SIGN_W, SIGN_Y0, SIGN_Y1 = 6.6, HEAD + 0.24, GH - 0.14
sf = Mesh('sign_frame', mat['wood']); sf.box(-SIGN_W / 2 - 0.08, SIGN_W / 2 + 0.08, SIGN_Y0 - 0.06, SIGN_Y1 + 0.06, 0.02, 0.16); sf.finish(shop)


def uv01(ob):
    uvl = ob.data.uv_layers.active
    for poly in ob.data.polygons:
        for li, (u, v) in zip(poly.loop_indices, [(0, 0), (1, 0), (1, 1), (0, 1)]): uvl.data[li].uv = (u, v)


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
    glow('signlamp', x, y - 0.06, 0.6, color='rgba(255,226,170,1)', size=0.9, day=0.0, night=0.9)
gn.finish(shop); gb.finish(shop, smooth=True)

# 壁燈：兩側壁柱各一盞方形燈籠（黑鐵框＋暖色玻璃）、門柱兩側各一盞小的
lmet = Mesh('lanterns_metal', mat['metal']); lgl = Mesh('lanterns_glass', mat['lampglass']); lbu = Mesh('lanterns_bulb', mat['bulb'])
def lantern(x, y, z, s=1.0, arm=0.32):
    lmet.box(x - 0.05 * s, x + 0.05 * s, y + 0.1 * s, y + 0.3 * s, z - 0.03, z + 0.01)              # 牆上底座
    lmet.cyl((x, y + 0.24 * s, z), (x, y + 0.3 * s, z + arm), 0.014 * s, seg=6)                  # 手臂
    lmet.cyl((x, y + 0.3 * s, z + arm), (x, y + 0.2 * s, z + arm), 0.01 * s, seg=6)
    cz = z + arm; h = 0.3 * s; r = 0.09 * s
    lmet.box(x - r - 0.015, x + r + 0.015, y + 0.17 * s, y + 0.2 * s, cz - r - 0.015, cz + r + 0.015)   # 頂蓋
    lmet.box(x - r * 0.6, x + r * 0.6, y + 0.2 * s, y + 0.23 * s, cz - r * 0.6, cz + r * 0.6)
    lmet.box(x - r - 0.01, x + r + 0.01, y - h + 0.17 * s, y - h + 0.2 * s, cz - r - 0.01, cz + r + 0.01)   # 底座
    for sx in (-1, 1):
        for sz in (-1, 1): lmet.box(x + sx * r - 0.008, x + sx * r + 0.008, y - h + 0.17 * s, y + 0.17 * s, cz + sz * r - 0.008, cz + sz * r + 0.008)
    lgl.box(x - r + 0.004, x + r - 0.004, y - h + 0.2 * s, y + 0.17 * s, cz - r + 0.004, cz + r - 0.004)
    lbu.sphere((x, y + 0.02 * s, cz), 0.035 * s, seg=8, rings=4)
    glow('lantern', x, y + 0.02 * s, cz, size=1.6 * s, day=0.2, night=1.0)
for s in (-1, 1):
    lantern(s * (W / 2 - PIL / 2), 2.45, 0.07, 1.15)
    lantern(s * (DOOR + POST / 2), 2.05, 0.09, 0.8, arm=0.2)
lmet.finish(shop); lgl.finish(shop); lbu.finish(shop, smooth=True)

# ================================================================ 4. 店內（窗外看得到的部分）
inside = B.group('INTERIOR', root)
fl = Mesh('int_floor', mat['floor']); fl.box(SX0, SX1, -0.02, 0.02, -DEPTH, -0.06); fl.finish(inside)
pl = Mesh('int_walls', mat['plaster'])
pl.box(SX0, SX1, 1.0, CEIL, -DEPTH - 0.1, -DEPTH)
pl.box(SX0 - 0.1, SX0, 0, CEIL, -DEPTH, -0.3); pl.box(SX1, SX1 + 0.1, 0, CEIL, -DEPTH, -0.3)
pl.finish(inside)
iw = Mesh('int_wood', mat['iwood'])                         # 後牆下半的木作護牆＋兩側護牆
iw.box(SX0, SX1, 0, 1.0, -DEPTH - 0.1, -DEPTH + 0.02); iw.box(SX0, SX1, 0.98, 1.04, -DEPTH, -DEPTH + 0.05)
iw.box(SX0, SX0 + 0.02, 0, 1.0, -DEPTH, -0.3); iw.box(SX1 - 0.02, SX1, 0, 1.0, -DEPTH, -0.3)
iw.finish(inside)
ce = Mesh('int_ceiling', mat['ceil'])
ce.box(SX0, SX1, CEIL, CEIL + 0.05, -DEPTH - 0.1, -0.08)
for k in range(5):
    z = -0.6 - k * 0.85; ce.box(SX0, SX1, CEIL - 0.16, CEIL, z - 0.07, z + 0.07)        # 天花板木梁
ce.finish(inside)

# 吧檯（左後）：直條木紋吧檯、磨石檯面、咖啡機、磨豆機、杯子；牆上層架＋玻璃罐（咖啡豆）＋黑板菜單（MENU_FACE）
BX0, BX1, BZ0, BZ1 = SX0 + 0.5, -2.2, -3.2, -2.6
bar = Mesh('int_bar', mat['bar'])
bar.box(BX0, BX1, 0, 1.0, BZ0, BZ1)
x = BX0 + 0.045
while x < BX1 - 0.03: bar.box(x - 0.025, x + 0.025, 0.08, 0.95, BZ1, BZ1 + 0.02); x += 0.09
bar.box(BX0 + 0.3, BX0 + 0.42, 1.0, 2.2, BZ0 - 0.4, BZ0 - 0.3)
bar.finish(inside)
bt = Mesh('int_bartop', mat['bartop']); bt.box(BX0 - 0.03, BX1 + 0.03, 1.0, 1.05, BZ0 - 0.02, BZ1 + 0.06); bt.finish(inside)
stl = Mesh('int_steel', mat['steel'])
ex = BX0 + 0.8
stl.box(ex - 0.34, ex + 0.34, 1.05, 1.47, BZ0 + 0.05, BZ0 + 0.5)                          # 咖啡機
stl.box(ex - 0.3, ex + 0.3, 1.47, 1.5, BZ0 + 0.05, BZ0 + 0.45)
for gx in (ex - 0.16, ex + 0.16): stl.cyl((gx, 1.3, BZ0 + 0.5), (gx, 1.22, BZ0 + 0.56), 0.045, seg=10)
stl.box(ex - 0.32, ex + 0.32, 1.05, 1.09, BZ0 + 0.45, BZ0 + 0.62)
gx = ex + 0.75; stl.cyl((gx, 1.05, BZ0 + 0.3), (gx, 1.32, BZ0 + 0.3), 0.08, seg=12)        # 磨豆機
stl.box(gx - 0.08, gx + 0.08, 1.05, 1.08, BZ0 + 0.2, BZ0 + 0.45)
stl.finish(inside)
hop = Mesh('int_grinder_hopper', mat['glass']); hop.cyl((gx, 1.32, BZ0 + 0.3), (gx, 1.55, BZ0 + 0.3), 0.06, seg=12, r2=0.1); hop.finish(inside)
cer = Mesh('int_cups', mat['ceramic'])
for k in range(6):
    cx = ex - 0.22 + k * 0.09; cer.cyl((cx, 1.5, BZ0 + 0.18), (cx, 1.57, BZ0 + 0.18), 0.035, seg=10, r2=0.04)
for k in range(4):
    cx = BX1 - 0.7 + k * 0.15; cer.cyl((cx, 1.05, BZ1 - 0.12), (cx, 1.14, BZ1 - 0.12), 0.04, seg=10, r2=0.045)
cer.finish(inside, smooth=True)
sh = Mesh('int_shelf', mat['shelf'])
for y in (1.45, 1.85, 2.25): sh.box(SX0 + 0.1, BX1 - 0.3, y, y + 0.04, -DEPTH, -DEPTH + 0.28)
sh.finish(inside)
jars = Mesh('int_jars', mat['glass']); beans = Mesh('int_jar_beans', mat['soil'])
for y in (1.49, 1.89, 2.29):
    for k in range(9):
        cx = SX0 + 0.3 + k * 0.42 + random.uniform(-0.05, 0.05)
        if cx > BX1 - 0.4: break
        jars.cyl((cx, y, -DEPTH + 0.14), (cx, y + random.uniform(0.14, 0.24), -DEPTH + 0.14), random.uniform(0.05, 0.07), seg=10)
        if y < 2.0: beans.cyl((cx, y + 0.005, -DEPTH + 0.14), (cx, y + 0.09, -DEPTH + 0.14), 0.045, seg=8)
jars.finish(inside); beans.finish(inside)
mb = Mesh('MENU_FACE', mat['chalk']); mb.quad([(-1.95, 1.3, -DEPTH + 0.04), (-0.35, 1.3, -DEPTH + 0.04), (-0.35, 2.4, -DEPTH + 0.04), (-1.95, 2.4, -DEPTH + 0.04)])
uv01(mb.finish(inside, props={'menu': ['今日手沖', '衣索比亞　耶加雪菲', '瓜地馬拉　安提瓜', '拿鐵　120　・　檸檬塔　90']}))
mf = Mesh('menu_frame', mat['shelf']); mf.box(-2.0, -0.3, 1.25, 2.45, -DEPTH, -DEPTH + 0.03); mf.finish(inside)

# 書架（右後，整面牆）：木格＋書（顏色用 8 色色票貼圖，所有書一個網格、一次 draw call）
BK0, BK1 = 0.2, SX1 - 0.15
shf = Mesh('int_bookcase', mat['shelf'])
shf.box(BK0, BK1, 0, 0.12, -DEPTH, -DEPTH + 0.38); shf.box(BK0, BK1, 2.78, 2.86, -DEPTH, -DEPTH + 0.38)
ncol = 5; cols = [BK0 + (BK1 - BK0) * k / ncol for k in range(ncol + 1)]
for x in cols: shf.box(x - 0.03, x + 0.03, 0, 2.86, -DEPTH, -DEPTH + 0.38)
rows = [0.12, 0.62, 1.12, 1.62, 2.12, 2.78]
for y in rows[1:-1]: shf.box(BK0, BK1, y - 0.03, y, -DEPTH, -DEPTH + 0.38)
shf.box(BK0, BK1, 0, 2.86, -DEPTH - 0.02, -DEPTH)
shf.finish(inside)
pal = bpy.data.images.new('cafe_book_palette', 8, 1, alpha=False)
px = []
for h in ['#e8dcc4', '#8c3b47', '#2f5d50', '#c9a24f', '#f4f1ea', '#4a6c8c', '#7b5a3a', '#3a3a3a']: px += [*B.srgb(h), 1.0]
pal.pixels.foreach_set(px)
bk_m = bpy.data.materials.new('cafe_int_books'); bk_m.use_nodes = True; nt = bk_m.node_tree
ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = pal; ti.interpolation = 'Closest'; nt.links.new(ti.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
nt.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8; bk_m['tile'] = 1.0
books = Mesh('int_books', bk_m)
uvl = books.bm.loops.layers.uv.verify()
for ri in range(len(rows) - 1):
    y0 = rows[ri] + 0.005
    for ci in range(ncol):
        x = cols[ci] + 0.04; xe = cols[ci + 1] - 0.04
        while x < xe - 0.05:
            if random.random() < 0.12: x += random.uniform(0.08, 0.2); continue      # 空格
            bw_ = random.uniform(0.025, 0.06); bh_ = random.uniform(0.2, 0.38); bd_ = random.uniform(0.17, 0.25)
            if x + bw_ > xe: break
            z1 = -DEPTH + 0.02 + bd_; xs_ = x + (bw_ if random.random() < 0.5 else 0.0)
            vs = [books.bm.verts.new(g2b(*p)) for p in ((x, y0, z1), (x + bw_, y0, z1), (x + bw_, y0 + bh_, z1), (x, y0 + bh_, z1),
                                                          (x, y0 + bh_, z1 - bd_), (x + bw_, y0 + bh_, z1 - bd_))]
            fs = [books.bm.faces.new((vs[0], vs[1], vs[2], vs[3])), books.bm.faces.new((vs[3], vs[2], vs[5], vs[4]))]     # 書背、上面
            if xs_ > x:   # 右側面
                v6 = books.bm.verts.new(g2b(x + bw_, y0, z1 - bd_)); fs.append(books.bm.faces.new((vs[1], v6, vs[5], vs[2])))
            else:         # 左側面
                v6 = books.bm.verts.new(g2b(x, y0, z1 - bd_)); fs.append(books.bm.faces.new((v6, vs[0], vs[3], vs[4])))
            u = (random.randrange(8) + 0.5) / 8
            for f in fs:
                for lp in f.loops: lp[uvl].uv = (u, 0.5)
            x += bw_ + 0.003
books.finish(inside, uv=False, merge=False)


def chair_mesh():
    """曲木椅：圓座面、四支腳、彎的椅背"""
    m = Mesh('chair_proto', mat['iwood'])
    m.cyl((0, 0.44, 0), (0, 0.47, 0), 0.21, seg=16)
    for a in range(4):
        t = a * math.pi / 2 + math.pi / 4; m.cyl((math.cos(t) * 0.15, 0.0, math.sin(t) * 0.15), (math.cos(t) * 0.17, 0.45, math.sin(t) * 0.17), 0.015, seg=6)
    m.cyl((-0.17, 0.45, -0.12), (-0.15, 0.9, -0.16), 0.014, seg=6); m.cyl((0.17, 0.45, -0.12), (0.15, 0.9, -0.16), 0.014, seg=6)
    for k in range(8):
        a = math.pi * (0.15 + 0.7 * k / 8); a2 = math.pi * (0.15 + 0.7 * (k + 1) / 8)
        m.cyl((math.cos(a) * 0.17, 0.9, -math.sin(a) * 0.17), (math.cos(a2) * 0.17, 0.9, -math.sin(a2) * 0.17), 0.016, seg=6)
    m.cyl((-0.17, 0.25, 0.05), (0.17, 0.25, 0.05), 0.01, seg=5)
    return proto(m.finish(None))


def table_mesh():
    top = Mesh('table_top', mat['iwood']); top.cyl((0, 0.72, 0), (0, 0.75, 0), 0.32, seg=20)
    leg = Mesh('table_leg', mat['metal']); leg.cyl((0, 0.02, 0), (0, 0.72, 0), 0.03, seg=8)
    for a in range(3):
        t = a * 2 * math.pi / 3; leg.cyl((0, 0.06, 0), (math.cos(t) * 0.24, 0.0, math.sin(t) * 0.24), 0.018, seg=5)
    return combine([top.finish(None), leg.finish(None)], 'cafe_table')


chm = chair_mesh(); tbm = table_mesh()
TZ = -0.85
TXS = (-5.3, -3.15, 3.15, 5.3)
for k, tx in enumerate(TXS):                              # 窗邊雙人桌 ×4（椅子面向桌子）
    B.instance(tbm, f'table_{k}', tx, 0, TZ, inside)
    B.instance(chm, f'chair_{k}a', tx - 0.55, 0, TZ, inside, ry=-math.pi / 2); B.instance(chm, f'chair_{k}b', tx + 0.55, 0, TZ, inside, ry=math.pi / 2)
tw = Mesh('int_table_items', mat['ceramic'])
for tx in TXS:
    tw.cyl((tx + 0.08, 0.75, TZ + 0.06), (tx + 0.08, 0.83, TZ + 0.06), 0.04, seg=10, r2=0.045); tw.cyl((tx + 0.08, 0.75, TZ + 0.06), (tx + 0.08, 0.755, TZ + 0.06), 0.07, seg=12)
tw.finish(inside, smooth=True)
pm = Mesh('int_pendant_metal', mat['brass']); pg = Mesh('int_pendant_glass', mat['lampglass']); pb = Mesh('int_pendant_bulb', mat['bulb'])
cord = Mesh('int_pendant_cord', mat['metal'])
def pendant(x, y, z, kind='globe'):
    """吊燈：電線、黃銅燈帽、玻璃球（窗邊）或金屬燈罩（吧檯）、燈泡"""
    cord.cyl((x, CEIL, z), (x, y + 0.16, z), 0.006, seg=4)
    pm.cyl((x, y + 0.16, z), (x, y + 0.1, z), 0.03, seg=10, r2=0.045)
    if kind == 'globe': pg.sphere((x, y - 0.03, z), 0.13, seg=14, rings=8)
    else:
        bmx = L.lathe([(0.04, 0.12), (0.06, 0.08), (0.2, -0.08), (0.21, -0.1)], seg=16); pm.add_bm(bmx, Matrix.Translation(g2b(x, y, z))); bmx.free()
    pb.sphere((x, y - 0.03, z), 0.04, seg=8, rings=4)
    glow('pendant', x, y - 0.05, z, color='rgba(255,200,130,1)', size=1.5, day=0.55, night=1.0)
for x in TXS: pendant(x, 2.15, TZ, 'globe')
for x in (BX0 + 0.9, (BX0 + BX1) / 2 + 0.4, BX1 - 0.3): pendant(x, 2.05, (BZ0 + BZ1) / 2, 'dome')
pm.finish(inside, smooth=True); pg.finish(inside, smooth=True); pb.finish(inside, smooth=True); cord.finish(inside)
ipl = Mesh('int_plants', mat['broad']); ipo = Mesh('int_pots', mat['pot_cream']); itr = Mesh('int_trunks', mat['trunk'])
for (px_, pz_, hgt) in ((SX1 - 0.45, -1.6, 1.7), (SX0 + 0.4, -1.7, 1.5), (0.5, -3.4, 1.2)):     # 店內大盆栽（琴葉榕一類）
    pot(ipo, px_, pz_, 0.22, 0.42, 'cyl'); itr.cyl((px_, 0.4, pz_), (px_ + 0.05, hgt * 0.7, pz_), 0.025, seg=6)
    bush(ipl, px_, hgt * 0.78, pz_, 0.55, n=9, span=0.4, flat_y=1.6)
ipl.finish(inside, uv=False); ipo.finish(inside, smooth=True); itr.finish(inside)

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
    if plant == 'olive':      # 小橄欖樹：細樹幹＋分枝＋細葉
        trk.cyl((cx, h - 0.05, cz), (cx + 0.03, h + 0.75, cz), 0.03, seg=6); trk.cyl((cx + 0.03, h + 0.55, cz), (cx + 0.2, h + 0.95, cz + 0.05), 0.018, seg=5)
        bush(lv_o, cx + 0.06, h + 1.05, cz, 0.55, n=12, span=0.42, flat_y=1.3)
    elif plant == 'broad':    # 大葉植物：葉片從盆中往外展開
        for k in range(7):
            a = random.uniform(0, 2 * math.pi)
            card(lv_b, cx + math.cos(a) * 0.18, h + random.uniform(0.25, 0.75), cz + math.sin(a) * 0.18, 0.5, 0.5, ry=a, rx=random.uniform(-0.6, 0.2), uv=rand_uv(0.4))
    else:
        bush(lv_f, cx, h + 0.22, cz, 0.42, n=7, span=0.5, flat_y=0.8)
for (cx, cz, r, h, pm_, pt) in ((4.78, 0.55, 0.24, 0.5, pl1, 'olive'), (5.35, 0.62, 0.17, 0.32, pl2, 'fern'), (5.92, 0.52, 0.22, 0.42, pl3, 'broad'),
                                (-4.32, 0.55, 0.22, 0.46, pl2, 'broad'), (-3.75, 0.6, 0.15, 0.3, pl1, 'fern'), (-3.27, 0.52, 0.2, 0.55, pl3, 'olive')):
    potted(cx, cz, r, h, pm_, pt)
for s in (-1, 1):            # 壁柱腳的花台（爬藤從這裡長出來；不超出騎樓可以走的範圍 z<0.25）
    x = s * (W / 2 - PIL / 2); pl3.box(x - 0.27, x + 0.27, 0, 0.38, 0.06, 0.25); soil.box(x - 0.24, x + 0.24, 0.36, 0.37, 0.08, 0.23)
    bush(lv_f, x, 0.55, 0.16, 0.38, n=6, span=0.5, flat_y=0.7)
for xs in bays:              # 窗台小盆栽（窗台板上，室外側）
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

# ================================================================ 匯出
info = L.export(OUT, gpu_instances=True)
info.update({'night_mats': NIGHT_MATS, 'bounce_mats': BOUNCE_MATS})
L.write_json(OUT[:-4] + '.json', info)
if RENDER:
    B.render_views(RENDER, 'cafe', [
        ('street', (-5.5, 1.7, 9.5), (0.5, 2.6, -0.5)),
        ('front', (0.0, 1.6, 8.5), (0.0, 3.4, 0.0)),
        ('door', (2.2, 1.6, 3.6), (-0.4, 1.6, -0.6)),
    ], lights=[(-5.3, 2.1, -0.85, 30), (5.3, 2.1, -0.85, 30), (-3.2, 2.0, -2.9, 30), (0, 1.8, -2.5, 40)], lens=22, res=(1280, 800))
