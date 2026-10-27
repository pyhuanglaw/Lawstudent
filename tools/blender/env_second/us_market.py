"""美國交換：大型超市「Prairie Basket」（草原超市）的室內（SCN-US-03；區域 us_market）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2：
  python3 tools/blender/env_second/us_market_layout_gen.py && python3 tools/blender/env_second/us_market_tex.py
  /opt/blenv/bin/python tools/blender/env_second/us_market.py [-- --out assets/models/env/second_ai/us_market.glb]
配置 assets/models/env/second_ai/us_market.layout.json（遊戲和這支腳本讀同一份）；座標＝區域座標（x 東、z 南、y 上；原點＝賣場中心；入口在南邊 z＝+16）。
做法：
  貨架＝鋼製雙面貨架（踢腳板、洞洞背板、五層層板＋價格條），商品＝每層一段一段的「商品塊」：正面貼 us_mk_products.png 的一段（假包裝，D77），
    頂面是深色；一段 0.4～1.2 m、高度和深度不一樣，斜著看也不是一張平面。走道兩端是端架（促銷），上面有吊牌。
  蔬果＝斜面陳列台上的「水果堆」：網格照六角排列的水果位置隆起（每顆一個隆起）、每顆一個顏色（同一種水果深淺不同）、縫隙壓暗。
  冷藏、冷凍＝玻璃門櫃（黑框、半透明玻璃、門把、裡面的層板和商品、門框之間的燈條）；肉品＝開放式冷藏櫃；熟食＝彎玻璃展示櫃台＋後面麵包架。
  結帳＝輸送帶櫃台＋收銀機（螢幕發光）＋刷卡機＋裝袋轉盤＋車道燈號；自助結帳機兩排；服務台＋店名牌（Prairie Basket，虛構）。
  天花板＝外露鋼桁架（白色）＋圓形風管＋一排一排的長條 LED（發光）；地面＝淺灰大地磚（Poly Haven large_floor_tiles_02）。
  正面玻璃帷幕＋兩組自動門；門外是停車場（窗景平面 assets/models/env/views/us_market_out.webp，之後由社區停車場的渲染產生）。
不放真實品牌、商標、可讀的商品名稱（D77）。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_market.glb'))
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_market.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
if not os.path.exists(os.path.join(GEN, 'us_mk_products.png')):
    import us_market_tex as T
    T.tex_products(os.path.join(GEN, 'us_mk_products.png')); T.tex_signs(os.path.join(GEN, 'us_mk_signs.png')); T.tex_wire(os.path.join(GEN, 'us_mk_wire.png'))
rng = random.Random(20261018)
B.reset(texres=512)
BD = J['bounds']; X0, X1, Z0, Z1, H = BD['x0'], BD['x1'], BD['z0'], BD['z1'], J['h']
root = B.group('us_market', props={'kind': 'us_market', 'layout': 'us_market.layout.json'})


def img_mat(name, fn, rough=0.6, clip=False, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if clip:
        rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rnd.inputs[0]); nt.links.new(rnd.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    m['tile'] = 1.0
    return m


M = {'floor': L.pbr('usm_floor', 'large_floor_tiles_02', tile=1.2, target='#d4d2cb', contrast=0.5, normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.26),
     'wall': L.pbr('usm_wall', 'white_plaster_02', tile=2.0, target='#e9e5da', contrast=0.25, normal=0.08, maps=('diff', 'nor'), res=256, rough_value=0.85),
     'band': L.flat('usm_wall_green', '#2f5a3e', rough=0.7),
     'deck': L.flat('usm_deck', '#e4e4e0', rough=0.85, cull=True),   # 10-22：單面朝下（鏡頭拉遠最高 6.85 m，頂板 6.4 m；原本雙面＝畫面整片白）
     'steel': L.flat('usm_joist', '#eeeeea', rough=0.6, metal=0.2),
     'duct': L.flat('usm_duct', '#b8bcc0', rough=0.35, metal=0.45),
     'col': L.flat('usm_column', '#d9d9d4', rough=0.5),
     'led': L.flat('GLOW_usm_led', '#ffffff', rough=0.3, emit=B.srgb('#f6f8ff')),
     'shelf': L.flat('usm_shelf', '#d7d7d2', rough=0.45, metal=0.3),
     'peg': L.flat('usm_pegboard', '#b9b9b4', rough=0.6, metal=0.15),
     'kick': L.flat('usm_kickplate', '#4a4c4e', rough=0.5, metal=0.25),
     'price': L.flat('usm_price_strip', '#d8d9d6', rough=0.5),
     'prod': img_mat('usm_products', 'us_mk_products.png', rough=0.42),
     'signs': img_mat('usm_signs', 'us_mk_signs.png', rough=0.6),
     'wire': img_mat('usm_wire', 'us_mk_wire.png', rough=0.35, clip=True),
     'black': L.flat('usm_black', '#232527', rough=0.45),
     'frame': L.flat('usm_case_frame', '#2b2d30', rough=0.35, metal=0.35),
     'glass': L.flat('ck_glass', '#dfe9ec', rough=0.05, alpha=0.16),
     'gdoor': L.flat('usm_door_glass', '#cfe0e6', rough=0.04, alpha=0.22),
     'caselight': L.flat('GLOW_usm_case', '#ffffff', rough=0.3, emit=B.srgb('#eef6ff')),
     'caseback': L.flat('usm_case_back', '#e6e9ea', rough=0.5),
     'belt': L.flat('usm_belt', '#1d1e20', rough=0.75),
     'counter': L.pbr('usm_counter', 'granite_tile_03', tile=0.8, target='#6c6a66', normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.3),
     'wood': L.pbr('usm_wood', 'walnut_veneer', tile=0.8, target='#8a6444', normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.5),
     'screen': L.flat('GLOW_usm_screen', '#cfe3f2', rough=0.3, emit=B.srgb('#8fb8e0')),
     'lanelight': L.flat('GLOW_usm_lane', '#ffffff', rough=0.3, emit=B.srgb('#ffffff')),
     'red': L.flat('usm_cart_red', '#a3202a', rough=0.45),
     'chrome': L.flat('usm_chrome', '#c4c7ca', rough=0.25, metal=0.45),
     'mat': L.flat('usm_entry_mat', '#2c2d2f', rough=0.95),
     'vc': L.vc_material('usm_vc', rough=0.55)}
PRODUCT_ROWS = 16


def uv_box(mesh, x0, x1, y0, y1, z0, z1, face, uvr, top_uv=(0.003, 0.999)):
    """方塊：face（'+x'／'-x'／'+z'／'-z'）那一面貼圖集的 uvr＝(u0, v0, u1, v1)；其他面全部指到圖集左上角的深色背板（看起來是商品的側面陰影）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify()
    P = {}
    for xi, x in enumerate((x0, x1)):
        for yi, y in enumerate((y0, y1)):
            for zi, z in enumerate((z0, z1)): P[xi, yi, zi] = bm.verts.new(g2b(x, y, z))
    faces = {'-x': [P[0, 0, 0], P[0, 0, 1], P[0, 1, 1], P[0, 1, 0]], '+x': [P[1, 0, 1], P[1, 0, 0], P[1, 1, 0], P[1, 1, 1]],
             '-z': [P[1, 0, 0], P[0, 0, 0], P[0, 1, 0], P[1, 1, 0]], '+z': [P[0, 0, 1], P[1, 0, 1], P[1, 1, 1], P[0, 1, 1]],
             '-y': [P[0, 0, 0], P[1, 0, 0], P[1, 0, 1], P[0, 0, 1]], '+y': [P[0, 1, 0], P[0, 1, 1], P[1, 1, 1], P[1, 1, 0]]}
    u0, v0, u1, v1 = uvr
    for k, vs in faces.items():
        f = bm.faces.new(vs)
        if k == face:
            for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
        else:
            for lp in f.loops: lp[uvl].uv = top_uv
    return mesh


def row_uv(row, w):
    """商品圖集第 row 列、寬 w 公尺的一段（隨機位置）"""
    uw = min(1.0, w / 2.4); u0 = rng.uniform(0.0, 1.0 - uw)
    vt = 1.0 - row / PRODUCT_ROWS; vb = 1.0 - (row + 1) / PRODUCT_ROWS
    return (u0, vb + 0.002, u0 + uw, vt - 0.0015)


CAT_ROWS = {'cereal': (0, 1), 'snacks': (2, 3), 'drinks': (4, 5), 'canned': (6, 7), 'pasta': (7, 1), 'baking': (8, 6), 'household': (9, 10), 'personal': (11, 15),
            'promo': (2, 4), 'frozen': (12, 13), 'dairy': (14, 15), 'impulse': (11, 3)}
LEVELS = [0.17, 0.52, 0.87, 1.22, 1.57]   # 層板頂面高度（最下一層在踢腳板上）
SHELF_T = 0.03; PH = 0.3


def products_run(prod, cat, along, a0, a1, front, depth, outward, y_levels=LEVELS, ph=PH):
    """沿 along（'z' 或 'x'）從 a0 到 a1、正面在 front（垂直座標）、往外的方向 outward（±1），每層排一段一段的商品塊"""
    rows = CAT_ROWS[cat]
    for li, ys in enumerate(y_levels):
        a = a0
        while a < a1 - 0.05:
            w = min(a1 - a, rng.uniform(0.4, 1.2)); row = rows[0] if (li + int(a * 3)) % 3 else rows[1]
            if cat == 'drinks' and li == 0: row = 5
            if cat == 'household' and li <= 1: row = 10
            hgt = ph * rng.uniform(0.92, 1.0); dep = depth * rng.uniform(0.8, 1.0); inset = rng.uniform(0.0, 0.06)
            y0, y1 = ys + SHELF_T, ys + SHELF_T + hgt
            fr = front - outward * inset; bk = fr - outward * dep
            uvr = row_uv(row, w)
            if along == 'z':
                face = '+x' if outward > 0 else '-x'
                uv_box(prod, min(fr, bk), max(fr, bk), y0, y1, a + 0.004, a + w - 0.004, face, uvr)
            else:
                face = '+z' if outward > 0 else '-z'
                uv_box(prod, a + 0.004, a + w - 0.004, y0, y1, min(fr, bk), max(fr, bk), face, uvr)
            a += w


# ================= 殼：地板、牆、天花板、桁架、風管、燈 =================
fl = Mesh('usm_floor', M['floor'], tile=1.2); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(root)
mats = Mesh('usm_mats', M['mat'])
for d in J['doors']: mats.box(d['x'] - 1.6, d['x'] + 1.6, 0.0, 0.008, Z1 - 3.0, Z1 - 0.05)
mats.finish(root, uv=False)
wl = Mesh('WALL_usm_walls', M['wall'], tile=2.0); band = Mesh('usm_band', M['band'])
sf = J['storefront']
wl.quad([(X0, 0, Z0), (X1, 0, Z0), (X1, H, Z0), (X0, H, Z0)])                                   # 北牆（裡面朝南）
wl.quad([(X0, 0, Z1), (X0, 0, Z0), (X0, H, Z0), (X0, H, Z1)])                                   # 西牆
wl.quad([(X1, 0, Z0), (X1, 0, Z1), (X1, H, Z1), (X1, H, Z0)])                                   # 東牆
for (xa, xb) in ((X0, sf['x0']), (sf['x1'], X1)): wl.quad([(xb, 0, Z1), (xa, 0, Z1), (xa, H, Z1), (xb, H, Z1)])
wl.quad([(sf['x1'], sf['glass_h'], Z1), (sf['x0'], sf['glass_h'], Z1), (sf['x0'], H, Z1), (sf['x1'], H, Z1)])   # 玻璃上面的牆
for (a, b, c, d) in (((X0, Z0 + 0.01), (X1, Z0 + 0.01), None, 'N'), ((X0 + 0.01, Z1), (X0 + 0.01, Z0), None, 'W'), ((X1 - 0.01, Z0), (X1 - 0.01, Z1), None, 'E')):
    band.quad([(a[0], 3.85, a[1]), (b[0], 3.85, b[1]), (b[0], 4.85, b[1]), (a[0], 4.85, a[1])])   # 招牌那一圈的深綠色帶
wl.finish(root); band.finish(root, uv=False)
skirt = Mesh('usm_skirt', M['kick'])
skirt.box(X0, X1, 0.0, 0.12, Z0, Z0 + 0.03); skirt.box(X0, X0 + 0.03, 0.0, 0.12, Z0, Z1); skirt.box(X1 - 0.03, X1, 0.0, 0.12, Z0, Z1)   # 踢腳線
skirt.finish(root, uv=False)
# 天花板：鋼承板（白）＋桁架（每 1.8 m 一支，跨 z）＋主梁（z＝±8）＋圓形風管＋長條 LED（沿 z，在每條走道上方）
dk = Mesh('usm_deck', M['deck']); dk.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); dk.finish(root, uv=False)   # 朝下
st = Mesh('usm_joists', M['steel'])
x = X0 + 0.9
while x < X1:
    st.box(x - 0.04, x + 0.04, H - 0.08, H - 0.02, Z0, Z1); st.box(x - 0.04, x + 0.04, H - 0.62, H - 0.56, Z0 + 0.4, Z1 - 0.4)
    z = Z0 + 0.4; k = 0
    while z < Z1 - 0.9:
        za, zb = z, z + 0.75
        st.cyl((x, H - 0.58 if k % 2 == 0 else H - 0.06, za), (x, H - 0.06 if k % 2 == 0 else H - 0.58, zb), 0.018, seg=4, caps=False); z = zb; k += 1
    x += 1.8
for zg in (-8.0, 0.0, 8.0): st.box(X0, X1, H - 0.95, H - 0.6, zg - 0.12, zg + 0.12)
st.finish(root, uv=False)
du = Mesh('usm_ducts', M['duct'])
for zd in (-5.0, 4.0):
    du.cyl((X0 + 0.5, 5.2, zd), (X1 - 0.5, 5.2, zd), 0.42, seg=18)
    for xx in range(-18, 20, 6):
        du.cyl((xx, 4.78, zd), (xx, 4.55, zd), 0.22, seg=12)                                    # 出風口
    for xx in range(-20, 21, 4):
        du.cyl((xx - 0.02, 5.2, zd), (xx + 0.02, 5.2, zd), 0.44, seg=18)                        # 接縫的箍
du.finish(root, uv=False)
led = Mesh('GLOW_usm_leds', M['led']); wire_ = Mesh('usm_hangers', M['black'])
for g in J['gondolas']:
    xa = g['x'] + 1.45
    for zz in (-7.5, -3.8, -0.1, 3.6):
        led.box(xa - 0.06, xa + 0.06, 4.55, 4.6, zz - 1.4, zz + 1.4)
        for e in (-1.2, 1.2): wire_.cyl((xa, 4.6, zz + e), (xa, H - 0.6, zz + e), 0.006, seg=3)
for xx in range(-20, 22, 4):                                                                     # 前段、後段、蔬果區的燈（沿 x）
    for zz in (-12.6, 9.5, 13.2):
        led.box(xx - 1.4, xx + 1.4, 4.55, 4.6, zz - 0.06, zz + 0.06)
for zz in (-6.0, -1.6, 2.8):
    led.box(14.0, 18.6, 4.55, 4.6, zz - 0.06, zz + 0.06)
led.finish(root, uv=False); wire_.finish(root, uv=False)
# 柱子（在貨架裡面、蔬果區）
co = Mesh('usm_columns', M['col'])
COLS = [(J['gondolas'][k]['x'], -1.8) for k in (1, 4, 7)] + [(15.3, -3.8)]
for (cx, cz) in COLS:
    co.box(cx - 0.17, cx + 0.17, 0.0, H - 0.6, cz - 0.17, cz + 0.17)
    co.box(cx - 0.22, cx + 0.22, 0.0, 0.25, cz - 0.22, cz + 0.22)
co.finish(root, uv=False)

# ================= 正面：玻璃帷幕＋自動門＋門外的景 =================
gl = Mesh('usm_storefront_glass', M['glass']); mu = Mesh('usm_mullions', M['frame'])
xs = [sf['x0'] + k * 2.0 for k in range(int((sf['x1'] - sf['x0']) / 2.0) + 1)]
for xa, xb in zip(xs, xs[1:]):
    if any(abs((xa + xb) / 2 - d['x']) < d['w'] / 2 + 0.3 for d in J['doors']): continue
    gl.quad([(xa, 0.0, Z1), (xb, 0.0, Z1), (xb, sf['glass_h'], Z1), (xa, sf['glass_h'], Z1)])
for xx in xs: mu.box(xx - 0.05, xx + 0.05, 0.0, sf['glass_h'], Z1 - 0.06, Z1 + 0.06)
mu.box(sf['x0'], sf['x1'], sf['glass_h'] - 0.08, sf['glass_h'] + 0.04, Z1 - 0.06, Z1 + 0.06); mu.box(sf['x0'], sf['x1'], 0.0, 0.1, Z1 - 0.06, Z1 + 0.06)
dg = Mesh('DOOR_usm_auto', M['gdoor'])
for d in J['doors']:
    x0d, x1d = d['x'] - d['w'] / 2, d['x'] + d['w'] / 2
    for (a, b) in ((x0d, d['x'] - 0.02), (d['x'] + 0.02, x1d)):
        dg.quad([(a, 0.02, Z1 - 0.12), (b, 0.02, Z1 - 0.12), (b, 2.3, Z1 - 0.12), (a, 2.3, Z1 - 0.12)])
        mu.box(a, b, 0.02, 0.1, Z1 - 0.15, Z1 - 0.09); mu.box(a, b, 2.24, 2.32, Z1 - 0.15, Z1 - 0.09)
        for xx in (a, b): mu.box(xx - 0.03, xx + 0.03, 0.02, 2.32, Z1 - 0.15, Z1 - 0.09)
    mu.box(x0d - 0.1, x1d + 0.1, 2.32, 2.6, Z1 - 0.25, Z1 - 0.05)                              # 自動門的機構蓋
    for xx in (x0d - 0.08, x1d + 0.08): mu.box(xx - 0.06, xx + 0.06, 0.0, 2.6, Z1 - 0.25, Z1 - 0.05)
gl.finish(root, uv=False); mu.finish(root, uv=False); dg.finish(root, uv=False)
view_png = os.path.join(L.ROOT, 'assets/models/env/views/us_market_out.webp')
if os.path.exists(view_png):
    vm = bpy.data.materials.new('GLOW_usm_outside'); vm.use_nodes = True; nt = vm.node_tree; bs = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(view_png); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = 1.0
    ov = Mesh('usm_outside_view', vm); bm = ov.bm; uvl = bm.loops.layers.uv.verify()
    f = bm.faces.new([bm.verts.new(g2b(*p)) for p in ((-36, -1.5, Z1 + 9), (36, -1.5, Z1 + 9), (36, 9.5, Z1 + 9), (-36, 9.5, Z1 + 9))])
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
    ov.finish(root, uv=False)
    og = Mesh('usm_outside_ground', L.flat('usm_outside_walk', '#9a9893', rough=0.9)); og.box(-36, 36, -0.06, -0.02, Z1, Z1 + 9); og.finish(root, uv=False)

# ================= 貨架 =================
prod = Mesh('usm_products', M['prod'])
sh = Mesh('usm_shelves', M['shelf']); pg = Mesh('usm_pegboard', M['peg']); kk = Mesh('usm_kick', M['kick']); pr = Mesh('usm_price', M['price'])
tags = CMesh('usm_tags', M['vc']); sg = Mesh('usm_aisle_signs', M['signs'])
def gondola_side(gx, z0, z1, side, cat, d=1.2, hh=1.95, levels=LEVELS):
    """雙面貨架的一面：side＝+1（朝 +x）或 −1；層板、價格條、商品"""
    fx = gx + side * d / 2
    for ys in levels:
        sh.box(min(gx, fx), max(gx, fx), ys, ys + SHELF_T, z0, z1)
        pr.box(min(fx, fx + side * 0.012), max(fx, fx + side * 0.012), ys - 0.012, ys + SHELF_T, z0, z1)
        z = z0 + rng.uniform(0.1, 0.5)
        while z < z1 - 0.1:                                                                     # 價格標籤（偶爾黃色的特價）
            col = '#f4d23c' if rng.random() < 0.18 else '#fbfbf8'
            xt = fx + side * 0.014
            tags.poly([(xt, ys - 0.01, z), (xt, ys - 0.01, z + 0.07), (xt, ys + 0.028, z + 0.07), (xt, ys + 0.028, z)][::(1 if side > 0 else -1)], col)
            z += rng.uniform(0.25, 0.6)
    products_run(prod, cat, 'z', z0 + 0.01, z1 - 0.01, fx - side * 0.02, d / 2 - 0.12, side, levels)
for g in J['gondolas']:
    gx, z0, z1, d, hh = g['x'], g['z0'], g['z1'], g['d'], g['h']
    kk.box(gx - d / 2, gx + d / 2, 0.0, 0.15, z0, z1)
    pg.box(gx - 0.025, gx + 0.025, 0.15, hh, z0, z1)
    for zz in (z0, z1): sh.box(gx - d / 2, gx + d / 2, 0.0, hh, zz - 0.02 if zz == z0 else zz, zz if zz == z0 else zz + 0.02)   # 兩端的側板
    for side in (1, -1): gondola_side(gx, z0, z1, side, g['cat'], d, hh)
    for (ze, dirz) in ((z1, 1), (z0, -1)):                                                      # 端架（促銷）＋上面的小吊牌
        ef = ze + dirz * 0.75
        kk.box(gx - 0.6, gx + 0.6, 0.0, 0.15, min(ze, ef), max(ze, ef))
        for ys in LEVELS[:4]:
            sh.box(gx - 0.6, gx + 0.6, ys, ys + SHELF_T, min(ze, ef), max(ze, ef)); pr.box(gx - 0.6, gx + 0.6, ys - 0.035, ys + SHELF_T, min(ef, ef + dirz * 0.012), max(ef, ef + dirz * 0.012))
        sh.box(gx - 0.6, gx + 0.6, 0.15, 1.6, min(ze, ze + dirz * 0.03), max(ze, ze + dirz * 0.03))
        for xs_ in (gx - 0.62, gx + 0.6): sh.box(xs_, xs_ + 0.02, 0.0, 1.6, min(ze, ef), max(ze, ef))   # 端架兩側的側板（走道上看過去不會看到商品的側面）
        products_run(prod, 'promo', 'x', gx - 0.58, gx + 0.58, ef - dirz * 0.02, 0.6, dirz, LEVELS[:4])
        # 號碼牌：走道上方（每條貨架東邊那一條走道）——兩面
    k = g['aisle'] - 1; sx = g['x'] + 1.45; sz = -1.8
    for k2, (zf, face) in enumerate(((sz + 0.01, '+z'), (sz - 0.01, '-z'))):
        cu, cv = (k % 4) * 0.25, 1.0 - (640 + (k // 4) * 128) / 1024
        uv_box(sg, sx - 0.7, sx + 0.7, 3.4, 4.1, min(zf, sz), max(zf, sz), face, (cu + 0.004, cv - 0.121, cu + 0.246, cv - 0.004), top_uv=(0.5, 0.95))
    wire_s = Mesh('usm_sign_wires_%d' % k, M['black'])
    for e in (-0.6, 0.6): wire_s.cyl((sx + e, 4.1, sz), (sx + e, H - 0.6, sz), 0.006, seg=3)
    wire_s.finish(root, uv=False)

# ================= 牆上的區域招牌 =================
SIGN_ROW = {'PRODUCE': 0, 'DAIRY': 1, 'MEAT': 2, 'BAKERY · DELI': 3, 'FROZEN': 4}
for s_ in J['wall_signs']:
    r_ = SIGN_ROW[s_['text']]; v1, v0 = 1.0 - r_ * 96 / 1024, 1.0 - (r_ * 96 + 88) / 1024; wdt = 4.4 if s_['text'] != 'BAKERY · DELI' else 5.4
    if s_['face'] == 'S': uv_box(sg, s_['x'] - wdt / 2, s_['x'] + wdt / 2, s_['y'] - 0.4, s_['y'] + 0.32, s_['z'], s_['z'] + 0.06, '+z', (0.0, v0, 1.0, v1), top_uv=(0.5, 0.95))
    elif s_['face'] == 'W': uv_box(sg, s_['x'] - 0.06, s_['x'], s_['y'] - 0.4, s_['y'] + 0.32, s_['z'] - wdt / 2, s_['z'] + wdt / 2, '-x', (0.0, v0, 1.0, v1), top_uv=(0.5, 0.95))
    else: uv_box(sg, s_['x'], s_['x'] + 0.06, s_['y'] - 0.4, s_['y'] + 0.32, s_['z'] - wdt / 2, s_['z'] + wdt / 2, '+x', (0.0, v0, 1.0, v1), top_uv=(0.5, 0.95))
nv0, nv1 = 1.0 - (480 + 127) / 1024, 1.0 - 480 / 1024                                          # 店名牌（服務台上方、正面玻璃上方的內側）
uv_box(sg, -21.0, -16.0, 2.75, 3.75, J['service_desk']['z0'] - 1.3, J['service_desk']['z0'] - 1.24, '+z', (0.0, nv0, 1.0, nv1), top_uv=(0.5, 0.95))
uv_box(sg, -4.0, 4.0, 4.0, 5.6, Z1 - 0.08, Z1 - 0.02, '-z', (0.0, nv0, 1.0, nv1), top_uv=(0.5, 0.95))

# ================= 冷藏、冷凍玻璃門櫃 =================
fr = Mesh('usm_case_frames', M['frame']); gd = Mesh('usm_case_doors', M['gdoor']); cl = Mesh('GLOW_usm_caselights', M['caselight']); cb = Mesh('usm_case_back', M['caseback'])
CASE_LV = [0.12, 0.5, 0.88, 1.26, 1.64]
def glass_case(a0, a1, along, back, front, cat, doors, outward):
    """玻璃門櫃：along 方向從 a0 到 a1；back＝背板座標、front＝門的座標；outward＝門朝的方向（±1）"""
    lo, hi = min(back, front), max(back, front)
    def B_(p0, p1, y0, y1, c0, c1, m):   # along/垂直 → x/z
        (m.box(c0, c1, y0, y1, p0, p1) if along == 'z' else m.box(p0, p1, y0, y1, c0, c1))
    B_(a0, a1, 0.0, 0.12, lo, hi, fr); B_(a0, a1, 2.05, 2.4, lo, hi, fr)                        # 底座、上框（門頭）
    B_(a0, a1, 0.12, 2.05, min(back, back + outward * 0.03), max(back, back + outward * 0.03), cb)
    for ys in CASE_LV:
        B_(a0, a1, ys, ys + 0.025, lo + 0.02, hi - 0.06, cb)
    products_run(prod, cat, along, a0 + 0.03, a1 - 0.03, front - outward * 0.08, abs(front - back) - 0.15, outward, CASE_LV, 0.3)
    n = doors; dw = (a1 - a0) / n
    for k in range(n + 1):
        p = a0 + k * dw
        B_(p - 0.035, p + 0.035, 0.12, 2.05, min(front, front - outward * 0.05), max(front, front - outward * 0.05), fr)
        if k < n: B_(p + 0.035, p + 0.06, 0.15, 2.0, min(front - outward * 0.06, front - outward * 0.04), max(front - outward * 0.06, front - outward * 0.04), cl)   # 門框之間的燈條
    for k in range(n):
        p0, p1 = a0 + k * dw + 0.035, a0 + (k + 1) * dw - 0.035
        if along == 'z': gd.quad([(front, 0.12, p0), (front, 0.12, p1), (front, 2.05, p1), (front, 2.05, p0)])
        else: gd.quad([(p0, 0.12, front), (p1, 0.12, front), (p1, 2.05, front), (p0, 2.05, front)])
        hp = p1 - 0.12 if k % 2 == 0 else p0 + 0.12
        if along == 'z': fr.box(front + outward * 0.02, front + outward * 0.05, 0.75, 1.6, hp - 0.015, hp + 0.015) if outward > 0 else fr.box(front - 0.05, front - 0.02, 0.75, 1.6, hp - 0.015, hp + 0.015)
        else: fr.box(hp - 0.015, hp + 0.015, 0.75, 1.6, min(front + outward * 0.02, front + outward * 0.05), max(front + outward * 0.02, front + outward * 0.05))
dw_ = J['dairy_wall']; glass_case(dw_['x0'], dw_['x1'], 'x', Z0 + 0.02, Z0 + dw_['d'], 'dairy', dw_['doors'], 1)
for f_ in J['freezers']:
    if f_['x'] < X0 + 1: glass_case(f_['z0'], f_['z1'], 'z', X0 + 0.02, X0 + 1.1, 'frozen', f_['doors'], 1)
glass_case(J['freezers'][1]['z0'], J['freezers'][1]['z1'], 'z', -16.0, -17.15, 'frozen', J['freezers'][1]['doors'], -1)   # 中島（背對背）
glass_case(J['freezers'][2]['z0'], J['freezers'][2]['z1'], 'z', -16.0, -14.85, 'frozen', J['freezers'][2]['doors'], 1)
fr.finish(root, uv=False); gd.finish(root, uv=False); cl.finish(root, uv=False); cb.finish(root, uv=False)

# ================= 蔬果：斜面陳列台＋水果堆、靠牆冷藏噴霧櫃 =================
FRUIT_KINDS = ['apple', 'orange', 'banana', 'pepper', 'potato', 'onion', 'lemon', 'greens', 'melon']
FM = {k: img_mat('usm_fruit_' + k, 'us_mk_fruit_%s.jpg' % k, rough=0.45) for k in FRUIT_KINDS}   # 每種水果一張無縫貼圖（0.4 m 一格）
FMESH = {k: Mesh('usm_fruit_' + k, FM[k]) for k in FRUIT_KINDS}
fv = CMesh('usm_produce', M['vc']); wd = Mesh('usm_wood', M['wood'])
def fruit_bin(c, s_dir, t_dir, ls, lt, kind, lift=0.0):
    """水果堆：c＝角落、s_dir、t_dir＝兩個邊的方向（單位向量）、ls、lt＝長度；低面數的小土丘（中間高、四邊貼著箱子）＋水果貼圖（一顆一顆是貼圖畫的）"""
    m = FMESH[kind]; bm = m.bm; uvl = bm.loops.layers.uv.verify()
    n_ = s_dir.cross(t_dir).normalized()
    if n_.y < 0: n_ = -n_
    res = 0.06; ns, nt_ = max(2, int(ls / res)), max(2, int(lt / res)); amp = min(0.1, 0.24 * min(ls, lt))
    du, dv = rng.uniform(0, 1), rng.uniform(0, 1); V = {}
    down = s_dir.cross(t_dir).y < 0   # 面的方向照 s_dir×t_dir：朝下的那幾箱把頂點順序反過來（單面化以後從上面看才不會整箱不見；PERF-SINGLESIDE 第五份）
    for i in range(ns + 1):
        for k in range(nt_ + 1):
            s, t = ls * i / ns, lt * k / nt_
            h = amp * max(0.0, math.sin(math.pi * i / ns)) ** 0.6 * max(0.0, math.sin(math.pi * k / nt_)) ** 0.6 + (rng.uniform(-0.008, 0.008) if 0 < i < ns and 0 < k < nt_ else 0.0)
            p = c + s_dir * s + t_dir * t + n_ * (h + 0.02 + lift)
            V[i, k] = (bm.verts.new(g2b(p.x, p.y, p.z)), (du + s / 0.4, dv + t / 0.4))
    for i in range(ns):
        for k in range(nt_):
            vs = [V[i, k], V[i + 1, k], V[i + 1, k + 1], V[i, k + 1]]
            if down: vs = vs[::-1]
            f = bm.faces.new([v[0] for v in vs])
            for lp, v in zip(f.loops, vs): lp[uvl].uv = v[1]
for t_ in J['produce_tables']:
    cx, cz, w, d = t_['x'], t_['z'], t_['w'], t_['d']
    wd.rbox(cx - w / 2, cx + w / 2, 0.0, 0.72, cz - d / 2, cz + d / 2, r=0.02, seg=2)            # 木作檯身
    kinds = [t_['mix'], rng.choice(FRUIT_KINDS), rng.choice(['apple', 'orange', 'lemon', 'pepper', 'onion'])]
    for side in (1, -1):                                                                         # 兩面斜坡（中間高）
        for b_ in range(3):
            xa = cx - w / 2 + 0.04 + b_ * (w - 0.08) / 3; xb = xa + (w - 0.08) / 3 - 0.04
            ze, zr = cz + side * (d / 2 - 0.05), cz + side * 0.04
            c0 = Vector((xa, 0.78, ze)); c1 = Vector((xa, 1.02, zr))
            sdir = Vector((1, 0, 0)); tdir = (c1 - c0).normalized(); lt = (c1 - c0).length
            wd.quad([(xa, 0.78, ze), (xb, 0.78, ze), (xb, 1.02, zr), (xa, 1.02, zr)][::(1 if side > 0 else -1)])
            fruit_bin(c0, sdir, tdir, xb - xa, lt, kinds[b_ if side > 0 else (2 - b_)])
            wd.box(xa - 0.02, xa, 0.72, 1.06, min(ze, zr), max(ze, zr)) if b_ == 0 else None
        wd.box(cx - w / 2, cx + w / 2, 0.72, 0.84, min(cz + side * (d / 2), cz + side * (d / 2 - 0.04)), max(cz + side * (d / 2), cz + side * (d / 2 - 0.04)))   # 前緣擋板
    sg_ = J['produce_tables'].index(t_)
    tags.cbox(cx - 0.12, cx + 0.12, 1.06, 1.3, cz - 0.01, cz + 0.01, '#f4f1e6'); tags.cbox(cx - 0.008, cx + 0.008, 1.0, 1.06, cz - 0.005, cz + 0.005, '#333333')   # 價格立牌
pw = J['produce_wall']                                                                           # 靠牆噴霧櫃：三層斜面＋上面鏡面＋燈
xb_ = X1 - pw['d']
fr2 = Mesh('usm_produce_case', M['frame'])
fr2.box(xb_, X1, 0.0, 0.62, pw['z0'], pw['z1']); fr2.box(xb_ + 0.6, X1, 0.62, 2.3, pw['z0'], pw['z1']); fr2.box(xb_ + 0.2, X1, 2.3, 2.45, pw['z0'], pw['z1'])
cl2 = Mesh('GLOW_usm_produce_light', M['caselight']); cl2.box(xb_ + 0.25, X1 - 0.2, 2.28, 2.3, pw['z0'] + 0.1, pw['z1'] - 0.1); cl2.finish(root, uv=False)
z = pw['z0'] + 0.05
while z < pw['z1'] - 0.3:
    zb = min(pw['z1'] - 0.05, z + 1.2)
    for tier, (y0, y1, d0, d1) in enumerate(((0.62, 0.86, 0.0, 0.32), (1.05, 1.25, 0.3, 0.55), (1.45, 1.62, 0.5, 0.62))):
        c0 = Vector((xb_ + d0 + 0.02, y0, zb)); c1 = Vector((xb_ + d1 + 0.02, y1, zb))
        fruit_bin(c0, Vector((0, 0, -1)), (c1 - c0).normalized(), zb - z - 0.04, (c1 - c0).length, rng.choice(['greens', 'greens', 'pepper', 'lemon']))
    z = zb + 0.02
fr2.finish(root, uv=False)
# 蔬果區、超市裡的小東西（頂點色）：塑膠袋捲、水果秤、地上的濕地板告示
pv = CMesh('usm_props', M['vc'])
for (sx_, sz_) in ((12.0, 4.6), (19.6, -9.0)):
    f0 = set(pv.bm.faces)                                                                          # 塑膠袋架：圓底座、細桿、上面一捲袋子（橫的）、一個撕下來的袋子垂著
    pv.cyl((sx_, 0.0, sz_), (sx_, 0.03, sz_), 0.2, seg=14); pv.cyl((sx_, 0.03, sz_), (sx_, 1.35, sz_), 0.022, seg=8); pv.cyl((sx_ - 0.16, 1.32, sz_), (sx_ + 0.16, 1.32, sz_), 0.012, seg=6)
    pv.paint([f for f in pv.bm.faces if f not in f0], '#8a8e92')
    f0 = set(pv.bm.faces); pv.cyl((sx_ - 0.14, 1.26, sz_), (sx_ + 0.14, 1.26, sz_), 0.07, seg=12); pv.paint([f for f in pv.bm.faces if f not in f0], '#e6ecee')
    pv.poly([(sx_ - 0.1, 1.26, sz_ + 0.07), (sx_ + 0.1, 1.26, sz_ + 0.07), (sx_ + 0.09, 0.92, sz_ + 0.09), (sx_ - 0.09, 0.92, sz_ + 0.09)], '#dfe6e8')
f0 = set(pv.bm.faces); pv.bm.verts.ensure_lookup_table()
for (sx_, sz_) in ((11.4, -9.6),):                                                                 # 濕地板告示（黃色 A 字牌，沒有字）
    pv.poly([(sx_ - 0.2, 0.0, sz_ + 0.18), (sx_ + 0.2, 0.0, sz_ + 0.18), (sx_ + 0.15, 0.62, sz_), (sx_ - 0.15, 0.62, sz_)], '#f2c81e')
    pv.poly([(sx_ + 0.2, 0.0, sz_ - 0.18), (sx_ - 0.2, 0.0, sz_ - 0.18), (sx_ - 0.15, 0.62, sz_), (sx_ + 0.15, 0.62, sz_)], '#f2c81e')

# ================= 肉品開放櫃、熟食麵包 =================
mc = J['meat_case']
fr3 = Mesh('usm_meat_case', M['frame']); fr3.box(mc['x0'], mc['x1'], 0.0, 0.85, Z0 + 0.02, Z0 + mc['d']); fr3.box(mc['x0'], mc['x1'], 0.85, 2.0, Z0 + 0.02, Z0 + 0.45)
fr3.box(mc['x0'], mc['x1'], 2.0, 2.2, Z0 + 0.02, Z0 + 0.9)
cl3 = Mesh('GLOW_usm_meat_light', M['caselight']); cl3.box(mc['x0'] + 0.1, mc['x1'] - 0.1, 1.98, 2.0, Z0 + 0.5, Z0 + 0.85); cl3.finish(root, uv=False)
for (yy, z0_, z1_) in ((0.85, Z0 + 0.45, Z0 + mc['d'] - 0.05), (1.3, Z0 + 0.45, Z0 + 0.8), (1.65, Z0 + 0.45, Z0 + 0.75)):
    fr3.box(mc['x0'] + 0.05, mc['x1'] - 0.05, yy - 0.02, yy, z0_, z1_)
    x = mc['x0'] + 0.08
    while x < mc['x1'] - 0.3:                                                                    # 一盒一盒的肉（白色托盤＋紅色、粉紅色＋保鮮膜的亮面）
        z = z0_ + 0.03
        while z < z1_ - 0.18:
            pv.cbox(x, x + 0.24, yy, yy + 0.02, z, z + 0.17, '#f2f2ee')
            pv.cbox(x + 0.02, x + 0.22, yy + 0.02, yy + 0.05, z + 0.02, z + 0.15, rng.choice(['#a8303a', '#b8404a', '#c8606a', '#d89a8a', '#9a2a30', '#e0b0a0']))
            z += 0.19
        x += 0.26
fr3.finish(root, uv=False)
dl = J['deli']; cz_ = dl['counter_z']
# 熟食展示櫃台：前面木作面板＋不鏽鋼踢腳、裡面發光的展示底板＋一盤一盤的熟食、彎玻璃（四段近似弧面）、不鏽鋼頂框；後面員工那一側是不鏽鋼工作台
ss = Mesh('usm_stainless', M['chrome']); gc = Mesh('usm_deli_glass', M['glass']); cbd = Mesh('usm_case_back2', M['caseback'])
wd.box(dl['x0'], dl['x1'], 0.12, 0.88, cz_ + 0.4, cz_ + 0.45); ss.box(dl['x0'], dl['x1'], 0.0, 0.12, cz_ + 0.38, cz_ + 0.45)
cbd.box(dl['x0'] + 0.02, dl['x1'] - 0.02, 0.0, 0.86, cz_ - 0.45, cz_ + 0.4)
cl4 = Mesh('GLOW_usm_deli_floor', M['caselight']); cl4.box(dl['x0'] + 0.04, dl['x1'] - 0.04, 0.86, 0.88, cz_ - 0.4, cz_ + 0.38); cl4.finish(root, uv=False)
arc = [(0.0, 0.0), (0.1, 0.02), (0.22, 0.07), (0.33, 0.16), (0.4, 0.3), (0.42, 0.45)]   # （往後、往上）從前下緣開始的弧
for (t0, y0), (t1, y1) in zip(arc, arc[1:]):
    gc.quad([(dl['x0'], 0.88 + y0, cz_ + 0.45 - t0), (dl['x1'], 0.88 + y0, cz_ + 0.45 - t0), (dl['x1'], 0.88 + y1, cz_ + 0.45 - t1), (dl['x0'], 0.88 + y1, cz_ + 0.45 - t1)])
ss.box(dl['x0'], dl['x1'], 1.33, 1.36, cz_ - 0.45, cz_ + 0.03)                                          # 頂框（不鏽鋼）
for xx in (dl['x0'], (dl['x0'] + dl['x1']) / 2, dl['x1']): ss.box(xx - 0.02, xx + 0.02, 0.88, 1.36, cz_ - 0.45, cz_ + 0.45)   # 兩端與中間的立框
ss.box(dl['x0'], dl['x1'], 0.88, 0.92, cz_ - 0.9, cz_ - 0.45); cbd.box(dl['x0'], dl['x1'], 0.0, 0.88, cz_ - 0.9, cz_ - 0.48)  # 員工那一側的工作台
x = dl['x0'] + 0.12
while x < dl['x1'] - 0.4:                                                                          # 展示櫃裡的熟食（一盤一盤，前低後高兩排）
    for row_, (zz0, zz1, yy) in enumerate(((cz_ + 0.02, cz_ + 0.34, 0.88), (cz_ - 0.36, cz_ - 0.04, 1.0))):
        if row_ == 1: ss.box(x, x + 0.38, 0.88, 1.0, zz0, zz1)
        pv.cbox(x, x + 0.38, yy, yy + 0.02, zz0, zz1, '#e8e8e4')
        pv.crbox(x + 0.03, x + 0.35, yy + 0.02, yy + 0.08, zz0 + 0.03, zz1 - 0.03, rng.choice(['#c88a4a', '#e0c070', '#8a4a2a', '#d8b890', '#6a8a3a', '#e8d8b0', '#b84a2a', '#f0e0c0']), r=0.02, seg=1)
        if rng.random() < 0.5: tags.cbox(x + 0.15, x + 0.23, yy + 0.08, yy + 0.13, zz1 - 0.02, zz1 - 0.01, '#f4f1e6')   # 價格小牌
    x += 0.42
# 後面的麵包架（開放式三層木架＋背板，一條一條的麵包、可頌、袋裝吐司）＋不鏽鋼烤箱
bz = dl['z0'] + 0.05; bx0, bx1 = dl['x0'] + 0.3, dl['x1'] - 2.1
wd.box(bx0, bx1, 0.0, 1.9, bz, bz + 0.03)
for yy in (0.3, 0.75, 1.2, 1.65): wd.box(bx0, bx1, yy - 0.03, yy, bz, bz + 0.5)
for xs_ in (bx0, bx1 - 0.03): wd.box(xs_, xs_ + 0.03, 0.0, 1.9, bz, bz + 0.5)
for yy in (0.3, 0.75, 1.2, 1.65):
    x = bx0 + 0.1
    while x < bx1 - 0.2:
        kind = rng.random()
        f0 = set(pv.bm.faces)
        if kind < 0.45: pv.ell((x + 0.1, yy + 0.06, bz + 0.3), 0.1, 0.065, 0.17, seg=8, rings=4); col = rng.choice(['#b87a3a', '#c88a4a', '#a8682a', '#d8a868'])   # 長條麵包
        elif kind < 0.75: pv.crbox(x, x + 0.2, yy, yy + 0.13, bz + 0.15, bz + 0.45, '#f0ece2', r=0.03, seg=1); col = None                     # 袋裝吐司（透明袋＋白麵包）
        else: pv.ell((x + 0.1, yy + 0.05, bz + 0.3), 0.09, 0.05, 0.06, seg=8, rings=4); col = '#d89a4a'                                        # 可頌、圓麵包
        if col: pv.paint([f for f in pv.bm.faces if f not in f0], col)
        x += 0.24
ss.box(dl['x1'] - 1.9, dl['x1'] - 0.3, 0.0, 1.95, bz, bz + 0.85)                                         # 烤箱：不鏽鋼本體、玻璃門（暗）、把手、控制面板
pv.cbox(dl['x1'] - 1.75, dl['x1'] - 0.45, 0.85, 1.45, bz + 0.851, bz + 0.86, '#1d1e20'); ss.box(dl['x1'] - 1.7, dl['x1'] - 0.5, 1.5, 1.53, bz + 0.86, bz + 0.92)
pv.cbox(dl['x1'] - 1.75, dl['x1'] - 0.45, 1.6, 1.85, bz + 0.851, bz + 0.86, '#2a2c2e')
for k in range(4): pv.cyl((dl['x1'] - 1.6 + k * 0.12, 1.72, bz + 0.86), (dl['x1'] - 1.6 + k * 0.12, 1.72, bz + 0.88), 0.025, seg=8)
mbm = img_mat('GLOW_usm_menu', 'us_mk_menu.png', rough=0.4, emit=0.6)
mb = Mesh('GLOW_usm_menu', mbm); bm_ = mb.bm; uvl = bm_.loops.layers.uv.verify()
for k in range(3):                                                                                       # 菜單燈箱（三塊，字是一般英文＋價格）
    xa, xb = dl['x0'] + 0.5 + k * 2.0, dl['x0'] + 2.3 + k * 2.0
    f = bm_.faces.new([bm_.verts.new(g2b(*q)) for q in ((xa, 2.45, Z0 + 0.07), (xb, 2.45, Z0 + 0.07), (xb, 3.35, Z0 + 0.07), (xa, 3.35, Z0 + 0.07))])
    for lp, uv in zip(f.loops, ((k / 3, 0), ((k + 1) / 3, 0), ((k + 1) / 3, 1), (k / 3, 1))): lp[uvl].uv = uv
    pv.cbox(xa - 0.04, xb + 0.04, 2.41, 3.39, Z0 + 0.02, Z0 + 0.065, '#1a1c1e')
mb.finish(root, uv=False)

# ================= 結帳 =================
cb2 = Mesh('usm_checkout_body', M['black']); cnt2 = Mesh('usm_checkout_top', M['counter']); bl = Mesh('usm_belts', M['belt']); scr = Mesh('GLOW_usm_screens', M['screen'])
ll = Mesh('GLOW_usm_lane_lights', M['lanelight']); ch = Mesh('usm_chrome_parts', M['chrome'])
for c in J['checkouts']:
    x, z0, z1 = c['x'], c['z0'], c['z1']
    cb2.rbox(x - 0.45, x + 0.45, 0.0, 0.86, z0, z1, r=0.02, seg=1)
    cnt2.box(x - 0.47, x + 0.47, 0.86, 0.9, z1 - 1.25, z1)
    bl.box(x - 0.38, x + 0.38, 0.86, 0.905, z0 + 0.05, z1 - 1.3)
    ch.box(x - 0.47, x - 0.38, 0.86, 0.95, z0, z1 - 1.25); ch.box(x + 0.38, x + 0.47, 0.86, 0.95, z0, z1 - 1.25)   # 輸送帶兩側的護條
    pv.cbox(x - 0.25, x + 0.25, 0.905, 0.91, z1 - 1.22, z1 - 0.9, '#3a3c3e')                       # 掃描台
    cb2.rbox(x + 0.45, x + 1.1, 0.0, 0.95, z1 - 1.2, z1 - 0.4, r=0.02, seg=1)                     # 收銀站
    scr.box(x + 0.6, x + 0.98, 1.2, 1.48, z1 - 0.95, z1 - 0.93); cb2.box(x + 0.75, x + 0.83, 0.95, 1.2, z1 - 0.9, z1 - 0.84)
    pv.crbox(x + 0.47, x + 0.57, 0.9, 1.08, z1 - 1.45, z1 - 1.33, '#2a2b2d', r=0.01, seg=1)        # 刷卡機
    ch.cyl((x - 0.25, 0.9, z1 - 0.2), (x - 0.25, 1.25, z1 - 0.2), 0.02, seg=6)                     # 裝袋轉盤
    for a_ in range(3):
        aa = a_ * 2.09; ch.cyl((x - 0.25, 1.22, z1 - 0.2), (x - 0.25 + 0.25 * math.cos(aa), 1.22, z1 - 0.2 + 0.25 * math.sin(aa)), 0.008, seg=4)
        pv.cbox(x - 0.25 + 0.2 * math.cos(aa) - 0.1, x - 0.25 + 0.2 * math.cos(aa) + 0.1, 0.92, 1.18, z1 - 0.2 + 0.2 * math.sin(aa) - 0.06, z1 - 0.2 + 0.2 * math.sin(aa) + 0.06, '#f0f0ec')
    ch.cyl((x - 0.4, 0.9, z0 + 0.05), (x - 0.4, 2.3, z0 + 0.05), 0.025, seg=8)                     # 車道燈號（字由遊戲畫：PLATE_FACE_lane_<n>）
    ll.box(x - 0.6, x - 0.2, 2.3, 2.62, z0 - 0.03, z0 + 0.13)
    nb = B.mesh_obj('PLATE_FACE_lane_%d' % c['n'], (lambda b_: (L.bm_box(b_, x - 0.58, x - 0.22, 2.33, 2.59, z0 + 0.131, z0 + 0.135), b_)[1])(bmesh.new()), M['price'], root, {'text': str(c['n'])})
    # 結帳道入口的小貨架（口香糖、雜誌）
    sh.box(x + 0.5, x + 0.9, 0.0, 1.4, z0, z0 + 0.03); products_run(prod, 'impulse', 'z', z0 + 0.04, z0 + 1.2, x + 0.9 - 0.02, 0.3, 1, [0.1, 0.45, 0.8, 1.1], 0.26)
    for ys in (0.1, 0.45, 0.8, 1.1): sh.box(x + 0.5, x + 0.92, ys, ys + 0.02, z0 + 0.03, z0 + 1.2)
for s in J['self_checkout']:
    x, z = s['x'], s['z']; fz = 1 if math.cos(s['yaw']) > 0 else -1
    cb2.rbox(x - 0.32, x + 0.32, 0.0, 0.95, z - 0.25, z + 0.25, r=0.03, seg=2)
    scr.box(x - 0.2, x + 0.2, 1.05, 1.35, z + fz * 0.08, z + fz * 0.1); cb2.box(x - 0.24, x + 0.24, 1.02, 1.38, z + fz * 0.05, z + fz * 0.08)
    cb2.box(x - 0.05, x + 0.05, 0.95, 1.05, z, z + fz * 0.06)
    cnt2.box(x + 0.32, x + 0.7, 0.82, 0.86, z - 0.25, z + 0.25); ch.box(x + 0.66, x + 0.7, 0.86, 1.25, z - 0.25, z + 0.25)   # 裝袋台
    ll.box(x - 0.1, x + 0.1, 1.9, 2.0, z - 0.05, z + 0.05); ch.cyl((x, 0.95, z), (x, 1.9, z), 0.015, seg=6)   # 燈號
sd = J['service_desk']
wd.rbox(sd['x0'], sd['x1'], 0.0, 1.0, sd['z0'], sd['z1'], r=0.02, seg=2); cnt2.box(sd['x0'] - 0.03, sd['x1'] + 0.03, 1.0, 1.04, sd['z0'] - 0.05, sd['z1'] + 0.03)
cb2.box(X0 + 0.02, sd['x1'] - 0.4, 0.0, 2.4, sd['z0'] - 1.3, sd['z0'] - 1.2)                      # 後牆的櫃子（門關著）
for k in range(4): pv.cbox(X0 + 0.3 + k * 1.3, X0 + 1.4 + k * 1.3, 0.3, 2.2, sd['z0'] - 1.199, sd['z0'] - 1.19, '#3a3c3f')
scr.box(sd['x0'] + 1.0, sd['x0'] + 1.4, 1.1, 1.36, sd['z0'] + 0.3, sd['z0'] + 0.32)
cb2.finish(root, uv=False); cnt2.finish(root); bl.finish(root, uv=False); scr.finish(root, uv=False); ll.finish(root, uv=False)

# ================= 推車、購物籃、季節陳列 =================
wr = Mesh('usm_cart_wire', M['wire']); rd = Mesh('usm_cart_red', M['red'])
def wire_quad(pts, ru, rv):
    bm = wr.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, ((0, 0), (ru, 0), (ru, rv), (0, rv))): lp[uvl].uv = uv
def cart(x, z, yaw):
    """推車：鐵絲網籃（透明貼圖）＋鍍鉻管＋紅色把手＋四個輪子；籃子後低前高、往前收"""
    c, s_ = math.cos(yaw), math.sin(yaw)
    def P(u, y, v): return (x + u * c + v * s_, y, z - u * s_ + v * c)   # u：側向、v：前後（+v＝推車前面）
    hw0, hw1, l0, l1, yb, yt = 0.26, 0.22, -0.45, 0.45, 0.48, 0.95
    for side in (1, -1):
        wire_quad([P(side * hw0, yb, l0), P(side * hw1, yb + 0.03, l1), P(side * hw1, yt, l1), P(side * hw0, yt, l0)][::(1 if side < 0 else -1)], 3.6, 1.9)
    wire_quad([P(-hw1, yb + 0.03, l1), P(hw1, yb + 0.03, l1), P(hw1, yt, l1), P(-hw1, yt, l1)], 1.8, 1.9)
    wire_quad([P(hw0, yb + 0.1, l0), P(-hw0, yb + 0.1, l0), P(-hw0, yt, l0 - 0.05), P(hw0, yt, l0 - 0.05)], 2.0, 1.7)
    wire_quad([P(-hw0, yb, l0), P(hw0, yb, l0), P(hw1, yb + 0.03, l1), P(-hw1, yb + 0.03, l1)], 2.0, 3.6)
    for side in (1, -1):
        ch.cyl(P(side * hw0, yt, l0), P(side * hw1, yt, l1), 0.012, seg=5); ch.cyl(P(side * hw0, yb, l0), P(side * hw1, yb + 0.03, l1), 0.012, seg=5)
        ch.cyl(P(side * 0.22, 0.12, l0 - 0.05), P(side * hw0, yt + 0.05, l0 - 0.12), 0.014, seg=5); ch.cyl(P(side * 0.2, 0.12, l1 - 0.05), P(side * hw1, yb + 0.03, l1), 0.014, seg=5)
        ch.cyl(P(side * 0.22, 0.12, l0 - 0.05), P(side * 0.2, 0.12, l1 - 0.05), 0.012, seg=5)
        for vv in (l0 - 0.02, l1 - 0.05): pv.cyl(P(side * 0.21, 0.06, vv), P(side * 0.21 + 0.001, 0.06, vv), 0.06, seg=10); pv.paint(list(pv.bm.faces)[-12:], '#2a2a2a')
    rd.cyl(P(-hw0 - 0.02, yt + 0.06, l0 - 0.14), P(hw0 + 0.02, yt + 0.06, l0 - 0.14), 0.022, seg=8)
ca = J['carts']
for k in range(ca['n']):
    row = k // 7; i = k % 7
    cart(ca['x0'] + 0.5 + row * 0.75, ca['z1'] - 0.55 - i * 0.28, math.pi)
cart(-1.2, -6.5, 0.4); cart(17.5, 6.2, -1.2)                                                      # 走道上、蔬果區有人推著停下的車
for k in range(6):                                                                                # 紅色購物籃一疊
    yy = k * 0.06; pv.crbox(18.6, 19.1, yy, yy + 0.22, 11.6, 11.95, '#b8262e', r=0.02, seg=1)
for t_ in J['seasonal']:
    x, z, w, d = t_['x'], t_['z'], t_['w'], t_['d']
    if t_['kind'] == 'flowers':                                                                   # 花：三層木架＋花桶（一束一束）
        wd.box(x - w / 2, x + w / 2, 0.0, 0.5, z - d / 2, z + d / 2); wd.box(x - w / 2, x + w / 2, 0.5, 0.8, z - d / 2, z)
        for k in range(10):                                                                       # 花桶（深灰）裡插三、四束花：每束＝牛皮紙或透明包裝的圓錐＋七、八朵小花＋幾片葉子
            fx_ = x - w / 2 + 0.15 + (k % 5) * (w - 0.3) / 4; fz_ = z + (0.25 if k < 5 else -0.25); fy = 0.5 if k < 5 else 0.8
            f0 = set(pv.bm.faces); pv.cyl((fx_, fy, fz_), (fx_, fy + 0.24, fz_), 0.1, seg=10, r2=0.12); pv.paint([f for f in pv.bm.faces if f not in f0], '#3a3c3e')
            col = rng.choice(['#e84a6a', '#f2c83a', '#f4efe6', '#c83a8a', '#ef8a3a', '#9a5ac8', '#f08aa8'])
            for b_ in range(rng.randint(3, 4)):
                bx, bz_ = fx_ + rng.uniform(-0.05, 0.05), fz_ + rng.uniform(-0.05, 0.05); lean = (rng.uniform(-0.08, 0.08), rng.uniform(-0.08, 0.08))
                f0 = set(pv.bm.faces); wrap = rng.choice(['#c8a878', '#e8eef0', '#d8c8a8'])
                pv.cyl((bx, fy + 0.15, bz_), (bx + lean[0], fy + 0.5, bz_ + lean[1]), 0.02, seg=7, r2=0.085, caps=False); pv.paint([f for f in pv.bm.faces if f not in f0], wrap)
                for j in range(rng.randint(6, 8)):
                    a_ = j * 2.4 + rng.uniform(0, 0.5); rr_ = rng.uniform(0.0, 0.065)
                    hx_, hy, hz = bx + lean[0] + rr_ * math.cos(a_), fy + 0.52 + rng.uniform(-0.03, 0.04), bz_ + lean[1] + rr_ * math.sin(a_)
                    f0 = set(pv.bm.faces); pv.ell((hx_, hy, hz), 0.032, 0.022, 0.032, seg=6, rings=3); pv.paint([f for f in pv.bm.faces if f not in f0], col if rng.random() < 0.85 else '#f4efe6')
                for j in range(3):
                    a_ = rng.uniform(0, 2 * math.pi); f0 = set(pv.bm.faces)
                    pv.poly([(bx + lean[0], fy + 0.45, bz_ + lean[1]), (bx + lean[0] + 0.1 * math.cos(a_), fy + 0.5, bz_ + lean[1] + 0.1 * math.sin(a_)), (bx + lean[0] + 0.03 * math.cos(a_ + 0.5), fy + 0.53, bz_ + lean[1] + 0.03 * math.sin(a_ + 0.5))], '#3f6a32')
    else:                                                                                         # 一棧板的瓶裝水（塑膠膜包好的箱子）
        wd.box(x - w / 2, x + w / 2, 0.0, 0.14, z - d / 2, z + d / 2)
        for i in range(int(w / 0.4)):
            for j in range(2):
                for yy in range(3): pv.crbox(x - w / 2 + i * 0.4 + 0.01, x - w / 2 + i * 0.4 + 0.39, 0.14 + yy * 0.26, 0.39 + yy * 0.26, z - d / 2 + j * 0.5 + 0.01, z - d / 2 + j * 0.5 + 0.49, '#bcd6e6', r=0.02, seg=1)
# 補貨中的紙箱（第五條走道尾端）
for k in range(4): pv.cbox(J['gondolas'][4]['x'] + 0.7, J['gondolas'][4]['x'] + 1.1, k * 0.3, k * 0.3 + 0.29, -8.6 + (k % 2) * 0.05, -8.2 + (k % 2) * 0.05, '#b8925a')
ss.finish(root, uv=False); gc.finish(root, uv=False); cbd.finish(root, uv=False)
for k_, m_ in FMESH.items():
    if not m_.empty(): m_.finish(root, uv=False, merge=False, smooth=True)
for m_ in (wd, prod, sh, pg, kk, pr, tags, sg, fv, pv, wr, rd, ch):
    m_.finish(root, uv=(m_ is wd)) if m_ is not prod and m_ is not sg and m_ is not wr else m_.finish(root, uv=False, merge=False)

L.merge_by_material(root, keep=lambda ob: ob.name.startswith('PLATE_FACE') or ob.name.startswith('DOOR_') or ob.name.startswith('WALL_'))
# PERF-SINGLESIDE-GLB-1025 第五份（LAWWW2-C 2026-10-27，接 LAWWW2-B 的第一～四份）：材質改單面（lib2.single_side）——雙面材質在 three.js 不剔除背面；
# 上限（同一頁全部改單面）+33～56%（test_shots/singleside_glb_1025/README.md 上限表）。玻璃照舊雙面；遊戲接手的 PLATE_FACE_ 不補反面。
# 水果（開口的球、葉片）只從上面、外面看：nodup 不補反面（第一次全補，三角形 +36%、水果占 1.9 萬）
_ss = L.single_side(root, keep=r'glass', nodup=r'^usm_fruit_', skip=lambda ob: 'FACE' in ob.name)
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_market.layout.json'))
print('us_market tris', tris)
