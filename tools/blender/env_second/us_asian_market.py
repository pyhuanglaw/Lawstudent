"""美國交換：大超市（草原超市）對面的小亞洲超市「竹葉亞洲超市」（虛構）的室內（區域 us_asian_market）→ GLB。LAWWW2-C 2026-10-17；Blender 5.2：
  python3 tools/blender/env_second/us_asian_market_layout_gen.py && python3 tools/blender/env_second/us_asian_market_tex.py
  /opt/blenv/bin/python tools/blender/env_second/us_asian_market.py [-- --out assets/models/env/second_ai/us_asian_market.glb]
使用者 23:0x「超市一個大的超市對面有一個小的亞洲超市」。配置 assets/models/env/second_ai/us_asian_market.layout.json（遊戲讀同一份）。
做法（和草原超市同一套：tools/blender/env_second/us_market.py）：
  小店面（strip mall 的一間）：米白色地磚、輕鋼架天花板（礦纖板＋白色格子）＋嵌燈盤（發光）、牆是白色、牆上半段一圈紅色帶；
  四排雙面貨架（層板＋價格條＋商品塊：us_am_products.png 的假包裝）、走道吊牌（紅底金框中英：泡麵 NOODLES…）；
  西牆：米（大袋子疊在木棧板上）＋上面層板放電鍋、大桶的油；東牆：開放式冷藏櫃（青江菜、大白菜、豆腐盒）；北牆：冷凍、飲料玻璃門櫃；
  結帳櫃台（收銀機螢幕發光、刷卡機、小零食架）、後面牆上兩顆紅燈籠、月曆、店名牌；門口東邊一棧板促銷的米（空白紙板牌）；
  正面整片玻璃＋玻璃門，外面是人行道、停車場，馬路對面看得到草原超市（us_am_view.png，天空透明：遊戲照時段畫天空）。
不放真實品牌、商標、可讀的商品名（D77）；店名虛構。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_asian_market.glb'))
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_asian_market.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
if not os.path.exists(os.path.join(GEN, 'us_am_products.png')):
    import us_asian_market_tex as T
    T.all_tex()
rng = random.Random(20261023)
B.reset(texres=512)
BD = J['bounds']; X0, X1, Z0, Z1, H = BD['x0'], BD['x1'], BD['z0'], BD['z1'], J['h']
root = B.group('us_asian_market', props={'kind': 'us_asian_market', 'layout': 'us_asian_market.layout.json'})


def img_mat(name, fn, rough=0.6, emit=0.0, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if alpha:
        nt.links.new(tx.outputs['Alpha'], bs.inputs['Alpha'])
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    m['tile'] = 1.0
    return m


M = {'floor': L.pbr('usam_floor', 'large_floor_tiles_02', tile=0.6, target='#e2dccd', contrast=0.45, normal=0.2, maps=('diff', 'nor'), res=512, rough_value=0.3),
     'wall': L.pbr('usam_wall', 'white_plaster_02', tile=2.0, target='#eeeae0', contrast=0.25, normal=0.08, maps=('diff', 'nor'), res=256, rough_value=0.85),
     'band': L.flat('usam_wall_red', '#a8262a', rough=0.6),
     'ceil': L.flat('usam_ceiling_tile', '#e8e6df', rough=0.95), 'grid': L.flat('usam_ceiling_grid', '#f4f4f0', rough=0.5),
     'panel': L.flat('GLOW_usam_troffer', '#ffffff', rough=0.3, emit=B.srgb('#f4f6ff')),
     'shelf': L.flat('usam_shelf', '#d7d7d2', rough=0.45, metal=0.3), 'peg': L.flat('usam_pegboard', '#c4c4bf', rough=0.6, metal=0.15),
     'kick': L.flat('usam_kickplate', '#4a4c4e', rough=0.5, metal=0.25), 'price': L.flat('usam_price_strip', '#e2e3df', rough=0.5),
     'prod': img_mat('usam_products', 'us_am_products.png', rough=0.42), 'signs': img_mat('usam_signs', 'us_am_signs.png', rough=0.6),
     'cal': img_mat('usam_calendar', 'us_am_calendar.png', rough=0.7),
     'frame': L.flat('usam_case_frame', '#2b2d30', rough=0.35, metal=0.35), 'glass': L.flat('ck_glass', '#dfe9ec', rough=0.05, alpha=0.16),
     'gdoor': L.flat('usam_door_glass', '#cfe0e6', rough=0.04, alpha=0.22), 'caselight': L.flat('GLOW_usam_case', '#ffffff', rough=0.3, emit=B.srgb('#eef6ff')),
     'caseback': L.flat('usam_case_back', '#e6e9ea', rough=0.5), 'black': L.flat('usam_black', '#232527', rough=0.45),
     'counter': L.pbr('usam_counter', 'granite_tile_03', tile=0.8, target='#6c6a66', normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.3),
     'wood': L.pbr('usam_wood', 'walnut_veneer', tile=0.8, target='#9a7450', normal=0.2, maps=('diff', 'nor'), res=256, rough_value=0.5),
     'pallet': L.flat('usam_pallet', '#b08a5a', rough=0.85),
     'screen': L.flat('GLOW_usam_screen', '#cfe3f2', rough=0.3, emit=B.srgb('#8fb8e0')),
     'lantern': L.flat('GLOW_usam_lantern', '#c8282a', rough=0.5, emit=B.srgb('#7a1010')), 'gold': L.flat('usam_gold', '#d4a640', rough=0.35, metal=0.45),
     'conc': L.pbr('usam_sidewalk', 'concrete_wall_006', tile=2.0, target='#bdb8ae', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
     'asph': L.pbr('usam_asphalt', 'asphalt_02', tile=3.0, target='#6f6e6b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
     'paint': L.flat('usam_line_paint', '#ecebe6', rough=0.6),
     'view': img_mat('usam_view', 'us_am_view.png', rough=1.0, emit=1.0, alpha=True),
     'vc': L.vc_material('usam_vc', rough=0.55)}
PRODUCT_ROWS = 10


def uv_box(mesh, x0, x1, y0, y1, z0, z1, face, uvr, top_uv=(0.003, 0.999)):
    """方塊：face 那一面貼圖集的 uvr＝(u0, v0, u1, v1)，其他面指到圖集左上角的深色（和 us_market.py 同一個做法）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); P = {}
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
    uw = min(1.0, w / 2.4); u0 = rng.uniform(0.0, 1.0 - uw); vt = 1.0 - row / PRODUCT_ROWS; vb = 1.0 - (row + 1) / PRODUCT_ROWS
    return (u0, vb + 0.002, u0 + uw, vt - 0.0015)


CAT_ROWS = {'noodles': (0, 1), 'sauce': (2, 3), 'snacks': (4, 5), 'dry': (6, 7), 'frozen': (8, 8), 'drinks': (9, 9), 'impulse': (4, 1)}
LEVELS = [0.15, 0.48, 0.81, 1.14, 1.47]; SHELF_T = 0.03; PH = 0.3


def products_run(prod, cat, along, a0, a1, front, depth, outward, y_levels=LEVELS, ph=PH):
    rows = CAT_ROWS[cat]
    for li, ys in enumerate(y_levels):
        a = a0
        while a < a1 - 0.05:
            w = min(a1 - a, rng.uniform(0.4, 1.0)); row = rows[0] if (li + int(a * 3)) % 3 else rows[1]
            if cat == 'noodles' and li >= 3: row = 0                                                  # 上面兩層都是袋裝泡麵（一箱一箱的）
            hgt = ph * rng.uniform(0.92, 1.0); dep = depth * rng.uniform(0.8, 1.0); inset = rng.uniform(0.0, 0.05)
            y0, y1 = ys + SHELF_T, ys + SHELF_T + hgt; fr = front - outward * inset; bk = fr - outward * dep; uvr = row_uv(row, w)
            if along == 'z': uv_box(prod, min(fr, bk), max(fr, bk), y0, y1, a + 0.004, a + w - 0.004, '+x' if outward > 0 else '-x', uvr)
            else: uv_box(prod, a + 0.004, a + w - 0.004, y0, y1, min(fr, bk), max(fr, bk), '+z' if outward > 0 else '-z', uvr)
            a += w


# ================= 殼：地板、牆、天花板＋嵌燈 =================
fl = Mesh('usam_floor', M['floor'], tile=0.6); fl.box(X0, X1, -0.05, 0.0, Z0, Z1); fl.finish(root)
sf = J['storefront']; dr = J['door']
# 四面牆各自一個節點（WALL_<面>_*，props dir＝往室內的法線）：遊戲在鏡頭退到牆外面時淡出那一面（Z3.attachRoomGLB）；牆上的招牌也跟著那一面
WD = {'N': [0, 0, 1], 'W': [1, 0, 0], 'E': [-1, 0, 0], 'S': [0, 0, -1]}
WM = {k: Mesh('WALL_%s_wall' % k, M['wall'], tile=2.0) for k in WD}; BM = {k: Mesh('WALL_%s_band' % k, M['band']) for k in ('N', 'W', 'E')}
WS = {k: Mesh('WALL_%s_sign' % k, M['signs']) for k in WD}
WM['N'].quad([(X0, 0, Z0), (X1, 0, Z0), (X1, H, Z0), (X0, H, Z0)])
WM['W'].quad([(X0, 0, Z1), (X0, 0, Z0), (X0, H, Z0), (X0, H, Z1)])
WM['E'].quad([(X1, 0, Z0), (X1, 0, Z1), (X1, H, Z1), (X1, H, Z0)])
for (xa, xb) in ((X0, sf['x0']), (sf['x1'], X1)): WM['S'].quad([(xb, 0, Z1), (xa, 0, Z1), (xa, H, Z1), (xb, H, Z1)])
WM['S'].quad([(sf['x1'], sf['glass_h'], Z1), (sf['x0'], sf['glass_h'], Z1), (sf['x0'], H, Z1), (sf['x1'], H, Z1)])
for k, (a, b) in (('N', ((X0, Z0 + 0.01), (X1, Z0 + 0.01))), ('W', ((X0 + 0.01, Z1), (X0 + 0.01, Z0))), ('E', ((X1 - 0.01, Z0), (X1 - 0.01, Z1)))):
    BM[k].quad([(a[0], 2.6, a[1]), (b[0], 2.6, b[1]), (b[0], 2.9, b[1]), (a[0], 2.9, a[1])])
sk = Mesh('usam_skirt', M['kick']); sk.box(X0, X1, 0.0, 0.1, Z0, Z0 + 0.03); sk.box(X0, X0 + 0.03, 0.0, 0.1, Z0, Z1); sk.box(X1 - 0.03, X1, 0.0, 0.1, Z0, Z1); sk.finish(root, uv=False)
ce = Mesh('usam_ceiling', M['ceil']); ce.quad([(X0, H, Z1), (X1, H, Z1), (X1, H, Z0), (X0, H, Z0)]); ce.finish(root, uv=False)
gr = Mesh('usam_grid', M['grid']); pn = Mesh('GLOW_usam_troffers', M['panel'])
x = X0
while x <= X1 + 1e-6: gr.box(x - 0.012, x + 0.012, H - 0.025, H - 0.002, Z0, Z1); x += 0.6
z = Z0
while z <= Z1 + 1e-6: gr.box(X0, X1, H - 0.025, H - 0.002, z - 0.012, z + 0.012); z += 1.2
for gx_ in [g['x'] + 1.7 for g in J['gondolas'][:3]] + [X0 + 1.5, X1 - 1.5]:                    # 嵌燈盤（走道上方一排一排）
    for zz in (-4.2, -1.8, 0.6, 3.0, 5.0):
        pn.box(gx_ - 0.29, gx_ + 0.29, H - 0.03, H - 0.026, zz - 0.58, zz + 0.58)
gr.finish(root, uv=False); pn.finish(root, uv=False)

# ================= 正面：玻璃＋門、外面的人行道、停車場、馬路對面的草原超市 =================
gl = Mesh('usam_storefront_glass', M['glass']); mu = Mesh('usam_mullions', M['frame']); dg = Mesh('DOOR_usam', M['gdoor'])
xs = [sf['x0'] + k * 1.6 for k in range(int((sf['x1'] - sf['x0']) / 1.6) + 1)]
d0, d1 = dr['x'] - dr['w'] / 2, dr['x'] + dr['w'] / 2
for xa, xb in zip(xs, xs[1:]):
    a_, b_ = xa, xb
    if b_ <= d0 or a_ >= d1: gl.quad([(a_, 0.0, Z1), (b_, 0.0, Z1), (b_, sf['glass_h'], Z1), (a_, sf['glass_h'], Z1)])
    else:
        if a_ < d0: gl.quad([(a_, 0.0, Z1), (d0, 0.0, Z1), (d0, sf['glass_h'], Z1), (a_, sf['glass_h'], Z1)])
        if b_ > d1: gl.quad([(d1, 0.0, Z1), (b_, 0.0, Z1), (b_, sf['glass_h'], Z1), (d1, sf['glass_h'], Z1)])
        gl.quad([(max(a_, d0), 2.2, Z1), (min(b_, d1), 2.2, Z1), (min(b_, d1), sf['glass_h'], Z1), (max(a_, d0), sf['glass_h'], Z1)])   # 門上面的氣窗
for xx in xs + [d0, d1]: mu.box(xx - 0.04, xx + 0.04, 0.0, sf['glass_h'], Z1 - 0.05, Z1 + 0.05)
mu.box(sf['x0'], sf['x1'], sf['glass_h'] - 0.06, sf['glass_h'] + 0.04, Z1 - 0.05, Z1 + 0.05); mu.box(sf['x0'], sf['x1'], 0.0, 0.1, Z1 - 0.05, Z1 + 0.05)
mu.box(d0, d1, 2.16, 2.24, Z1 - 0.05, Z1 + 0.05)
dg.quad([(d0 + 0.04, 0.02, Z1 - 0.02), (dr['x'], 0.02, Z1 - 0.02), (dr['x'], 2.16, Z1 - 0.02), (d0 + 0.04, 2.16, Z1 - 0.02)])    # 雙開玻璃門
dg.quad([(dr['x'], 0.02, Z1 - 0.02), (d1 - 0.04, 0.02, Z1 - 0.02), (d1 - 0.04, 2.16, Z1 - 0.02), (dr['x'], 2.16, Z1 - 0.02)])
for xx in (d0 + 0.04, dr['x'] - 0.03, dr['x'] + 0.03, d1 - 0.04): mu.box(xx - 0.035, xx + 0.035, 0.02, 2.16, Z1 - 0.06, Z1 + 0.02)
for xx in (dr['x'] - 0.12, dr['x'] + 0.12): mu.box(xx - 0.015, xx + 0.015, 0.8, 1.4, Z1 - 0.12, Z1 - 0.07)   # 直的門把
gl.finish(root, uv=False); mu.finish(root, uv=False); dg.finish(root, uv=False)
mt = Mesh('usam_entry_mat', L.flat('usam_mat', '#2c2d2f', rough=0.95)); mt.box(dr['x'] - 1.1, dr['x'] + 1.1, 0.0, 0.008, Z1 - 1.6, Z1 - 0.05); mt.finish(root, uv=False)
out_w = Mesh('usam_out_walk', M['conc'], tile=2.0); out_w.box(-40, 40, -0.05, 0.12, Z1, Z1 + 2.6); out_w.box(-40, 40, -0.05, 0.0, Z1 + 2.6, Z1 + 2.8); out_w.finish(root)
out_a = Mesh('usam_out_lot', M['asph'], tile=3.0); out_a.box(-40, 40, -0.08, -0.02, Z1 + 2.8, Z1 + 30); out_a.finish(root)
ln = Mesh('usam_out_lines', M['paint'])
for k in range(-12, 13): ln.box(k * 2.7 - 0.05, k * 2.7 + 0.05, -0.02, -0.016, Z1 + 3.0, Z1 + 8.2)   # 自己門口的車位線
ln.box(-40, 40, -0.02, -0.016, Z1 + 14.0, Z1 + 14.12); ln.box(-40, 40, -0.02, -0.016, Z1 + 20.0, Z1 + 20.12)   # 馬路的白線
for k in range(-14, 14): ln.box(k * 3.0, k * 3.0 + 1.5, -0.02, -0.016, Z1 + 16.95, Z1 + 17.05)          # 中線（虛線）
ln.finish(root, uv=False)
vw = Mesh('usam_view', M['view']); bm_ = vw.bm; uvl = bm_.loops.layers.uv.verify()
VZ = Z1 + 30.0
fc = bm_.faces.new([bm_.verts.new(g2b(*p)) for p in ((-40, -0.6, VZ), (40, -0.6, VZ), (40, 19.4, VZ), (-40, 19.4, VZ))])
for lp, uv in zip(fc.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
vw.finish(root, uv=False)

# ================= 貨架 =================
prod = Mesh('usam_products', M['prod']); sh = Mesh('usam_shelves', M['shelf']); pg = Mesh('usam_pegboard', M['peg']); kk = Mesh('usam_kick', M['kick']); pr = Mesh('usam_price', M['price'])
tags = CMesh('usam_tags', M['vc']); sg = Mesh('usam_signs', M['signs']); pv = CMesh('usam_props', M['vc'])
def gondola_side(gx, z0, z1, side, cat, d=1.0):
    fx = gx + side * d / 2
    for ys in LEVELS:
        sh.box(min(gx, fx), max(gx, fx), ys, ys + SHELF_T, z0, z1)
        pr.box(min(fx, fx + side * 0.012), max(fx, fx + side * 0.012), ys - 0.012, ys + SHELF_T, z0, z1)
        zt = z0 + rng.uniform(0.1, 0.5)
        while zt < z1 - 0.1:                                                                   # 價格標籤（偶爾黃色的特價、紅色的手寫牌）
            col = '#f4d23c' if rng.random() < 0.2 else ('#f2b8b0' if rng.random() < 0.1 else '#fbfbf8'); xt = fx + side * 0.014
            tags.poly([(xt, ys - 0.01, zt), (xt, ys - 0.01, zt + 0.07), (xt, ys + 0.028, zt + 0.07), (xt, ys + 0.028, zt)][::(1 if side > 0 else -1)], col)
            zt += rng.uniform(0.25, 0.6)
    products_run(prod, cat, 'z', z0 + 0.01, z1 - 0.01, fx - side * 0.02, d / 2 - 0.1, side)
for g in J['gondolas']:
    gx, z0, z1, d, hh = g['x'], g['z0'], g['z1'], g['d'], g['h']
    kk.box(gx - d / 2, gx + d / 2, 0.0, 0.13, z0, z1); pg.box(gx - 0.025, gx + 0.025, 0.13, hh, z0, z1)
    for zz in (z0, z1): sh.box(gx - d / 2, gx + d / 2, 0.0, hh, zz - 0.02 if zz == z0 else zz, zz if zz == z0 else zz + 0.02)
    for side in (1, -1): gondola_side(gx, z0, z1, side, g['cat'], d)
    ef = z1 + 0.55                                                                                # 南端的端架（促銷：一箱一箱的泡麵、零食）
    kk.box(gx - 0.5, gx + 0.5, 0.0, 0.13, z1, ef)
    for ys in LEVELS[:4]: sh.box(gx - 0.5, gx + 0.5, ys, ys + SHELF_T, z1, ef)
    for xs_ in (gx - 0.52, gx + 0.5): sh.box(xs_, xs_ + 0.02, 0.0, 1.3, z1, ef)
    products_run(prod, 'noodles' if g['aisle'] in (1, 3) else 'snacks', 'x', gx - 0.48, gx + 0.48, ef - 0.02, 0.5, 1, LEVELS[:4])
    # 走道吊牌（貨架東邊那一條走道上方，兩面）：紅底金框中英（us_am_signs.png 上面四塊）
    k = g['aisle'] - 1; sx = g['x'] + (1.7 if g['aisle'] < 4 else -1.4); sz = -0.9; cu, cv = (k % 2) * 0.5, 1.0 - (k // 2) * 160 / 1024
    for (zf, face) in ((sz + 0.01, '+z'), (sz - 0.01, '-z')): uv_box(sg, sx - 0.7, sx + 0.7, 2.25, 2.67, min(zf, sz), max(zf, sz), face, (cu + 0.003, cv - 0.154, cu + 0.497, cv - 0.003), top_uv=(0.5, 0.3))
    ws = Mesh('usam_sign_wires_%d' % k, M['black'])
    for e in (-0.6, 0.6): ws.cyl((sx + e, 2.67, sz), (sx + e, H - 0.02, sz), 0.005, seg=3)
    ws.finish(root, uv=False)
DEPT_V = {'RICE': 0, 'FROZEN': 1, 'PRODUCE': 2, 'DRINKS': 3}
def dept_sign(k, x0, x1, y0, y1, z0, z1, face, wall):
    v1 = 1.0 - (320 + k * 96) / 1024; v0 = v1 - 88 / 1024; uv_box(WS[wall], x0, x1, y0, y1, z0, z1, face, (0.0, v0, 1.0, v1), top_uv=(0.5, 0.3))
dept_sign(0, X0 + 0.02, X0 + 0.07, 2.25, 2.55, -3.6, 0.0, '+x', 'W')                              # 米（西牆）
dept_sign(2, X1 - 0.07, X1 - 0.02, 2.25, 2.55, -3.2, 0.4, '-x', 'E')                              # 青菜、豆腐（東牆）
dept_sign(1, -4.2, -0.2, 2.25, 2.55, Z0 + 0.02, Z0 + 0.07, '+z', 'N')                             # 冷凍（北牆）
dept_sign(3, 3.2, 6.2, 2.25, 2.55, Z0 + 0.02, Z0 + 0.07, '+z', 'N')                               # 飲料
nv0, nv1 = 1.0 - (720 + 199) / 1024, 1.0 - 720 / 1024                                            # 店名牌（結帳櫃台後面的牆上方、正面玻璃上方的內側）
ck = J['checkout']
uv_box(WS['S'], ck['x0'] - 0.2, ck['x1'] + 0.2, 2.62, 3.25, Z1 - 0.07, Z1 - 0.02, '-z', (0.0, nv0, 1.0, nv1), top_uv=(0.5, 0.3))
for k in WD:
    for m_ in (WM.get(k), BM.get(k)):
        if m_ is not None: m_.finish(root, props={'dir': WD[k]}, uv=(m_ is WM.get(k)))
    WS[k].finish(root, props={'dir': WD[k]}, uv=False, merge=False)

# ================= 西牆：米；東牆：開放式冷藏櫃；北牆：冷凍、飲料玻璃門櫃 =================
rw = J['rice_wall']
z_ = rw['z0']
while z_ < rw['z1'] - 0.9:                                                                         # 棧板＋大袋子（25、50 磅：米白、淺黃、淡粉的袋子＋一條色帶）
    pl = rw['x0'] + 0.05; pv.cbox(pl, pl + 1.0, 0.0, 0.12, z_ + 0.02, z_ + 0.98, '#b08a5a')
    for lay in range(rng.randint(3, 5)):
        for j in range(2):
            c_ = rng.choice(['#f2ece0', '#efe2c0', '#f4d8d0', '#e8eef0']); bz0 = z_ + 0.04 + j * 0.47; yb = 0.12 + lay * 0.16
            pv.crbox(pl + 0.04 + (lay % 2) * 0.03, pl + 0.95 - ((lay + 1) % 2) * 0.03, yb, yb + 0.155, bz0, bz0 + 0.44, c_, r=0.05, seg=1)
            pv.cbox(pl + 0.97, pl + 0.975, yb + 0.04, yb + 0.1, bz0 + 0.05, bz0 + 0.39, rng.choice(['#c8302b', '#1e8a52', '#2a6fb5', '#e0a21b']))
    z_ += 1.05
for ys in (1.4, 1.85):                                                                             # 米上面兩層層板：電鍋（白色圓筒＋黑蓋）、大桶的油
    sh.box(rw['x0'] + 0.02, rw['x0'] + 0.55, ys, ys + 0.03, rw['z0'], rw['z1'])
    zz = rw['z0'] + 0.3
    while zz < rw['z1'] - 0.3:
        if ys < 1.5:
            f0 = set(pv.bm.faces); pv.cyl((rw['x0'] + 0.3, ys + 0.03, zz), (rw['x0'] + 0.3, ys + 0.3, zz), 0.15, seg=14); pv.paint([f for f in pv.bm.faces if f not in f0], '#f2f0ea')
            f0 = set(pv.bm.faces); pv.cyl((rw['x0'] + 0.3, ys + 0.3, zz), (rw['x0'] + 0.3, ys + 0.36, zz), 0.14, seg=14); pv.paint([f for f in pv.bm.faces if f not in f0], rng.choice(['#2a2a2a', '#c8302b', '#e8d8b0']))
            zz += 0.42
        else:
            pv.crbox(rw['x0'] + 0.12, rw['x0'] + 0.42, ys + 0.03, ys + 0.38, zz - 0.13, zz + 0.13, rng.choice(['#e8c040', '#f0d870', '#d8a830']), r=0.03, seg=1)
            pv.cbox(rw['x0'] + 0.24, rw['x0'] + 0.3, ys + 0.38, ys + 0.43, zz - 0.03, zz + 0.03, '#c8302b'); zz += 0.32
for ys in (1.4, 1.85):
    for zz in (rw['z0'] + 0.05, rw['z1'] - 0.05): sh.box(rw['x0'] + 0.02, rw['x0'] + 0.55, 1.3, 2.3, zz - 0.02, zz + 0.02)
# 開放式冷藏櫃（東牆）：白色櫃身、斜的三層、上面一排燈；層上青菜（一把一把綠色）、大白菜、豆腐盒
pc = J['produce_case']; cx0, cx1 = pc['x0'], pc['x1']
cb = Mesh('usam_case_body', M['caseback']); cl_ = Mesh('GLOW_usam_case_lights', M['caselight'])
cb.box(cx0, cx1, 0.0, 0.55, pc['z0'], pc['z1']); cb.box(cx1 - 0.12, cx1, 0.55, 2.1, pc['z0'], pc['z1']); cb.box(cx0 + 0.2, cx1, 2.0, 2.15, pc['z0'], pc['z1'])
for zz in (pc['z0'], pc['z1']): cb.box(cx0, cx1, 0.0, 2.15, zz - 0.03, zz + 0.03)
cl_.box(cx0 + 0.3, cx1 - 0.15, 1.97, 2.0, pc['z0'] + 0.05, pc['z1'] - 0.05)
for (ys, dx) in ((0.55, 0.0), (1.05, 0.25), (1.5, 0.45)):
    cb.box(cx0 + dx, cx1 - 0.12, ys, ys + 0.03, pc['z0'], pc['z1'])
    zz = pc['z0'] + 0.15
    while zz < pc['z1'] - 0.2:
        kind = rng.random()
        if kind < 0.45:                                                                            # 青江菜、蔥：一把一把
            for j in range(3):
                f0 = set(pv.bm.faces); pv.ell((cx0 + dx + 0.15 + j * 0.13, ys + 0.09, zz), 0.07, 0.06, 0.1, seg=7, rings=4); pv.paint([f for f in pv.bm.faces if f not in f0], rng.choice(['#3f7a32', '#5a9a3e', '#7ab04a']))
        elif kind < 0.7:                                                                           # 大白菜
            f0 = set(pv.bm.faces); pv.ell((cx0 + dx + 0.3, ys + 0.12, zz), 0.15, 0.11, 0.11, seg=8, rings=5); pv.paint([f for f in pv.bm.faces if f not in f0], '#d8e6b0')
        else:                                                                                      # 豆腐盒（白色、透明蓋）
            for j in range(3): pv.cbox(cx0 + dx + 0.06 + j * 0.13, cx0 + dx + 0.18 + j * 0.13, ys + 0.03, ys + 0.08, zz - 0.07, zz + 0.07, '#f4f4ee')
        zz += 0.3
cb.finish(root, uv=False); cl_.finish(root, uv=False)
fr_ = Mesh('usam_case_frames', M['frame']); gd = Mesh('usam_case_doors', M['gdoor']); cl2 = Mesh('GLOW_usam_caselights', M['caselight']); cbk = Mesh('usam_case_back2', M['caseback'])
CASE_LV = [0.12, 0.5, 0.88, 1.26, 1.64]
def glass_case(a0, a1, back, front, cat, doors):
    """北牆的玻璃門櫃（沿 x，門朝南 +z）"""
    fr_.box(a0, a1, 0.0, 0.12, back, front); fr_.box(a0, a1, 2.05, 2.35, back, front)
    cbk.box(a0, a1, 0.12, 2.05, back, back + 0.03)
    for ys in CASE_LV: cbk.box(a0, a1, ys, ys + 0.025, back + 0.02, front - 0.06)
    products_run(prod, cat, 'x', a0 + 0.03, a1 - 0.03, front - 0.08, (front - back) - 0.15, 1, CASE_LV, 0.3)
    dw = (a1 - a0) / doors
    for k in range(doors + 1):
        p = a0 + k * dw; fr_.box(p - 0.035, p + 0.035, 0.12, 2.05, front - 0.05, front)
        if k < doors: cl2.box(p + 0.035, p + 0.06, 0.15, 2.0, front - 0.06, front - 0.04)
    for k in range(doors):
        p0, p1 = a0 + k * dw + 0.035, a0 + (k + 1) * dw - 0.035
        gd.quad([(p0, 0.12, front), (p1, 0.12, front), (p1, 2.05, front), (p0, 2.05, front)])
        hp = p1 - 0.12 if k % 2 == 0 else p0 + 0.12; fr_.box(hp - 0.015, hp + 0.015, 0.75, 1.6, front + 0.02, front + 0.05)
fz = J['freezers']; glass_case(fz['x0'], fz['x1'], fz['z0'] + 0.02, fz['z1'], 'frozen', fz['doors'])
dk_ = J['drinks']; glass_case(dk_['x0'], dk_['x1'], dk_['z0'] + 0.02, dk_['z1'], 'drinks', dk_['doors'])
fr_.finish(root, uv=False); gd.finish(root, uv=False); cl2.finish(root, uv=False); cbk.finish(root, uv=False)

# ================= 結帳櫃台、燈籠、月曆；門口的促銷米；零食架 =================
wd = Mesh('usam_wood', M['wood'], tile=0.8); cnt = Mesh('usam_counter_top', M['counter']); scr = Mesh('GLOW_usam_screens', M['screen']); bk = Mesh('usam_black_parts', M['black'])
wd.box(ck['x0'], ck['x1'], 0.0, 0.95, ck['z0'], ck['z1']); cnt.box(ck['x0'] - 0.03, ck['x1'] + 0.03, 0.95, 0.99, ck['z0'] - 0.03, ck['z1'] + 0.05)
rx = ck['x0'] + 1.0
bk.box(rx - 0.22, rx + 0.22, 0.99, 1.1, ck['z0'] + 0.15, ck['z0'] + 0.55); bk.box(rx - 0.03, rx + 0.03, 1.1, 1.3, ck['z0'] + 0.2, ck['z0'] + 0.26)
scr.box(rx - 0.18, rx + 0.18, 1.3, 1.55, ck['z0'] + 0.22, ck['z0'] + 0.24)                     # 收銀機螢幕（朝收銀員那一側）
bk.box(rx - 0.18, rx + 0.18, 1.29, 1.56, ck['z0'] + 0.19, ck['z0'] + 0.22)
pv.crbox(rx + 0.5, rx + 0.62, 0.99, 1.15, ck['z1'] - 0.2, ck['z1'] - 0.08, '#2a2b2d', r=0.01, seg=1)   # 刷卡機（客人那一側）
pv.cbox(ck['x1'] - 1.0, ck['x1'] - 0.3, 0.99, 1.01, ck['z0'] + 0.1, ck['z1'] - 0.1, '#e8e4d8')    # 塑膠袋架
for k in range(6): pv.cbox(ck['x1'] - 0.95 + k * 0.11, ck['x1'] - 0.87 + k * 0.11, 1.01, 1.04 + rng.uniform(0, 0.04), ck['z0'] + 0.15, ck['z1'] - 0.15, rng.choice(['#f4f4ee', '#f0e8e0']))
sr = J['snack_rack']
for ys in (0.1, 0.45, 0.8, 1.15): sh.box(sr['x0'], sr['x1'], ys, ys + 0.02, sr['z0'], sr['z1'])
sh.box(sr['x0'], sr['x1'], 0.0, 1.4, sr['z0'], sr['z0'] + 0.03)
products_run(prod, 'impulse', 'x', sr['x0'] + 0.02, sr['x1'] - 0.02, sr['z1'] - 0.02, 0.4, 1, [0.1, 0.45, 0.8, 1.15], 0.26)
# 後面（北邊）收銀員那一側：靠牆的矮櫃（菸酒以外的東西：電話卡、紅包袋——都是色塊，沒有字）上面一排小盒子
wd.box(ck['x0'], ck['x1'], 0.0, 0.9, 2.2, 2.6); cnt.box(ck['x0'], ck['x1'], 0.9, 0.93, 2.2, 2.62)
for k in range(10): pv.cbox(ck['x0'] + 0.1 + k * 0.36, ck['x0'] + 0.38 + k * 0.36, 0.93, 1.1 + rng.uniform(0, 0.1), 2.3, 2.5, rng.choice(['#c8302b', '#e0a21b', '#a3172a', '#f5d23a']))
# 紅燈籠兩顆（櫃台上方）：紅色發光的球（壓扁）＋金色上下蓋＋流蘇
lt = Mesh('GLOW_usam_lanterns', M['lantern']); gd2 = Mesh('usam_gold_parts', M['gold'])
for lx in (ck['x0'] + 0.8, ck['x1'] - 0.8):
    lt.ell((lx, 2.55, 3.4), 0.22, 0.18, 0.22, seg=14, rings=8)
    gd2.cyl((lx, 2.72, 3.4), (lx, 2.78, 3.4), 0.09, seg=10); gd2.cyl((lx, 2.32, 3.4), (lx, 2.38, 3.4), 0.09, seg=10)
    gd2.cyl((lx, 2.78, 3.4), (lx, H, 3.4), 0.004, seg=3)
    for j in range(5):   # 流蘇
        f0 = set(pv.bm.faces); pv.cyl((lx - 0.04 + j * 0.02, 2.32, 3.4), (lx - 0.04 + j * 0.02, 2.08, 3.4), 0.006, seg=3, r2=0.004); pv.paint([q for q in pv.bm.faces if q not in f0], '#c8282a')
lt.finish(root, uv=False); gd2.finish(root, uv=False)
cal = Mesh('usam_calendar_mesh', M['cal']); bm_ = cal.bm; uvl = bm_.loops.layers.uv.verify()
xc, zc = ck['x0'] + 0.35, 2.2                                                                      # 月曆：掛在西牆上（收銀員背後的牆角），寫字的那一面朝東
Q = ((X0 + 0.02, 1.3, zc + 0.6), (X0 + 0.02, 1.3, zc + 0.3), (X0 + 0.02, 1.72, zc + 0.3), (X0 + 0.02, 1.72, zc + 0.6))
for (pts, uvs) in ((Q, ((0, 0), (1, 0), (1, 1), (0, 1))), (Q[::-1], ((0, 1), (1, 1), (1, 0), (0, 0)))):   # 兩面（方向不用算；背面貼著牆看不到）
    f = bm_.faces.new([bm_.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
cal.finish(root, uv=False)
pr_ = J['promo_rice']                                                                              # 門口東邊一棧板促銷的米＋空白紙板牌
pv.cbox(pr_['x0'], pr_['x1'], 0.0, 0.12, pr_['z0'], pr_['z1'], '#b08a5a')
for lay in range(4):
    for i in range(2):
        for j in range(3):
            bx0 = pr_['x0'] + 0.04 + i * 0.68; bz0 = pr_['z0'] + 0.04 + j * 0.52; yb = 0.12 + lay * 0.17
            pv.crbox(bx0, bx0 + 0.64, yb, yb + 0.165, bz0, bz0 + 0.48, '#f2ece0' if (i + j + lay) % 3 else '#efe2c0', r=0.05, seg=1)
pv.cbox((pr_['x0'] + pr_['x1']) / 2 - 0.3, (pr_['x0'] + pr_['x1']) / 2 + 0.3, 0.8, 1.2, pr_['z1'] - 0.03, pr_['z1'] - 0.01, '#d8b07a')
pv.cbox((pr_['x0'] + pr_['x1']) / 2 - 0.25, (pr_['x0'] + pr_['x1']) / 2 + 0.25, 1.0, 1.1, pr_['z1'] - 0.01, pr_['z1'], '#c8302b')
for k in range(5):                                                                                 # 門口疊在一起的購物籃（藍色塑膠）
    pv.crbox(dr['x'] - 2.0, dr['x'] - 1.5, 0.0 + k * 0.05, 0.25 + k * 0.05, Z1 - 1.0, Z1 - 0.65, '#2a5a9a', r=0.02, seg=1)
for m_ in (wd, cnt):
    m_.finish(root)
scr.finish(root, uv=False); bk.finish(root, uv=False)
for m_ in (prod, sg): m_.finish(root, uv=False, merge=False)
for m_ in (sh, pg, kk, pr, tags, pv): m_.finish(root, uv=False)

L.merge_by_material(root, keep=lambda ob: ob.name.startswith('DOOR_') or ob.name.startswith('WALL_') or ob.name.startswith('usam_view'))
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_asian_market.layout.json'))
print('us_asian_market tris', tris)
