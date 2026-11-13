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
# ---------- SHOP-CC0-HELP-1113（D161、D159、D160）：CC0 材質組＋Poly Haven 掃描模型（做法 docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md）----------
#   材質名字照舊（遊戲、光照烘焙、tests/us_asian_market_lm_unit.js 用名字認），內容從純色換成 ambientCG 材質組（顏色＋法線）；
#   牆、紅色飾帶照舊平塗（店面規則：牆不給貼圖）；玻璃、發光面（燈盤、冷藏櫃燈、螢幕）照舊。白色、淺色塑膠 vary=0.05（不壓會有黑紋）。
import cc0_kit   # noqa: E402
K = cc0_kit.Kit(root, 'usam')
M.update({
    'ceil': K.acg('usam_ceiling_tile', 'Plaster001', maps=('diff',), target='#e8e6df', vary=0.04, tile=0.6, rough_value=0.95, res=256),   # 礦纖板（細的顆粒）
    'grid': K.acg('usam_ceiling_grid', 'Metal009', maps=('diff',), target='#f4f4f0', vary=0.05, tile=0.5, metal=0.2, rough_value=0.5, res=128),
    'shelf': K.acg('usam_shelf', 'Metal009', target='#d7d7d2', vary=0.05, tile=0.6, metal=0.3, rough_value=0.45, res=256),             # 烤漆鋼板層架
    'peg': K.acg('usam_pegboard', 'Metal009', maps=('diff',), target='#c4c4bf', vary=0.06, tile=0.6, metal=0.15, rough_value=0.6, res=256),
    'kick': K.acg('usam_kickplate', 'Metal009', maps=('diff',), target='#4a4c4e', tile=0.6, metal=0.25, rough_value=0.5, res=128),
    'price': K.acg('usam_price_strip', 'Plastic006', maps=('diff',), target='#e2e3df', vary=0.05, tile=0.4, rough_value=0.5, res=128),
    'frame': K.acg('usam_case_frame', 'Metal009', target='#2b2d30', tile=0.6, metal=0.35, rough_value=0.35, res=256),
    'caseback': K.acg('usam_case_back', 'Plastic006', target='#e6e9ea', vary=0.05, tile=0.6, rough_value=0.5, res=256),
    'black': K.acg('usam_black', 'Plastic006', maps=('diff',), target='#232527', vary=0.05, tile=0.4, rough_value=0.45, res=128),
    'gold': K.acg('usam_gold', 'Metal009', maps=('diff',), target='#d4a640', tile=0.3, metal=0.45, rough_value=0.35, res=128),
    'lantern': K.acg('GLOW_usam_lantern', 'Fabric036', maps=('diff',), target='#c8282a', tile=0.25, rough_value=0.5, res=128, emit=B.srgb('#7a1010')),   # 紅燈籠的布紋（照舊發光）
    'paint': K.acg('usam_line_paint', 'Concrete034', maps=('diff',), target='#ecebe6', tile=1.0, rough_value=0.6, res=128),
    'pallet': K.acg('usam_pallet', 'Wood049', target='#b08a5a', tile=0.6, rough_value=0.85, res=256),                                   # 棧板（木紋）
    'mat': K.acg('usam_mat', 'Carpet016', maps=('diff',), target='#2c2d2f', tile=0.6, rough_value=0.95, res=256),                       # 門口地墊
    'sack': K.acg('usam_ricebag', 'Fabric036', target='#efe6d2', tile=0.35, rough_value=0.85, res=256),                                 # 米袋（編織袋的紋路）
    'sack_w': K.acg('usam_ricebag_w', 'Fabric036', maps=('diff',), target='#eef0ee', tile=0.35, rough_value=0.85, res=256),
    'plastic_w': K.acg('usam_plastic_w', 'Plastic006', target='#f2f0ea', vary=0.05, tile=0.4, rough_value=0.4, res=256),               # 電鍋、塑膠袋架
    'plastic_y': K.acg('usam_plastic_y', 'Plastic006', maps=('diff',), target='#e3bd3e', vary=0.05, tile=0.4, rough_value=0.35, res=128),   # 大桶的油
    'plastic_b': K.acg('usam_plastic_blue', 'Plastic006', maps=('diff',), target='#2a5592', vary=0.05, tile=0.4, rough_value=0.4, res=128),  # 購物籃
    'cardboard': K.acg('usam_cardboard', 'Cardboard001', tile=0.6, rough_value=0.85, res=256),
})
def _giftbox(d, s):   # 收銀台後面矮櫃上的禮盒（茶葉、糕餅）：紅底、金色回紋邊、中間一塊淡金（沒有字）
    d.rectangle([0, 0, s, s], fill=(168, 32, 34)); b = s // 10
    for k in range(0, s, b): d.rectangle([k, 0, k + b // 2, b // 3], fill=(214, 168, 72)); d.rectangle([k, s - b // 3, k + b // 2, s], fill=(214, 168, 72))
    d.rectangle([s * 0.3, s * 0.28, s * 0.7, s * 0.72], fill=(222, 186, 98)); d.ellipse([s * 0.38, s * 0.36, s * 0.62, s * 0.64], outline=(150, 28, 30), width=max(2, s // 64))
M['gift'] = K.printed('usam_giftbox', 'us_am_giftbox', _giftbox, 'Paper001', size=256, amp=0.12, tile=0.3, rough_value=0.6)
PRODUCT_ROWS = 10


def uv_box(mesh, x0, x1, y0, y1, z0, z1, face, uvr, top_uv=(0.003, 0.999), skip=()):
    """方塊：face 那一面貼圖集的 uvr＝(u0, v0, u1, v1)，其他面指到圖集左上角的深色（和 us_market.py 同一個做法）；skip＝不做的面（貨架上的商品：底面、背面看不到）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); P = {}
    for xi, x in enumerate((x0, x1)):
        for yi, y in enumerate((y0, y1)):
            for zi, z in enumerate((z0, z1)): P[xi, yi, zi] = bm.verts.new(g2b(x, y, z))
    faces = {'-x': [P[0, 0, 0], P[0, 0, 1], P[0, 1, 1], P[0, 1, 0]], '+x': [P[1, 0, 1], P[1, 0, 0], P[1, 1, 0], P[1, 1, 1]],
             '-z': [P[1, 0, 0], P[0, 0, 0], P[0, 1, 0], P[1, 1, 0]], '+z': [P[0, 0, 1], P[1, 0, 1], P[1, 1, 1], P[0, 1, 1]],
             '-y': [P[0, 0, 0], P[1, 0, 0], P[1, 0, 1], P[0, 0, 1]], '+y': [P[0, 1, 0], P[0, 1, 1], P[1, 1, 1], P[1, 1, 0]]}
    u0, v0, u1, v1 = uvr
    for k, vs in faces.items():
        if k in skip: continue
        f = bm.faces.new(vs)
        if k == face:
            for lp, uv in zip(f.loops, ((u0, v0), (u1, v0), (u1, v1), (u0, v1))): lp[uvl].uv = uv
        else:
            for lp in f.loops: lp[uvl].uv = top_uv
    return mesh


# ---------- SHOP-CC0-HELP-1113 v2（LAWWW2-C 退件第 2 點：「一樣大小的方塊排格子、頂面一片深色」）：照汀州路東南大聯 v2 的做法——
#   自己畫的包裝貼圖集（us_asian_market_packs.py：袋裝泡麵、杯麵、醬料瓶、零食、盒裝、乾貨、冷凍、飲料，每種 8 款；沒有字、不像任何品牌，D77），
#   一包一個盒子、正面貼一款；一段一款（同一種商品排一段），每段的寬、高不一樣，同一段每包高低差一點、有的往後推（前面被拿走）、偶爾一格賣空；
#   頂面、側面是同一個顏色調亮的那一條（不再指到深色）；側面只做在一段的兩頭和空格旁邊（中間的貼在一起看不到，省面數）
import us_asian_market_packs as PK   # noqa: E402
PK.all_tex()
def _img(name, fn, rough):
    m = bpy.data.materials.get(name)
    if m is not None: m.name = name + '_replaced'
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color']); m['tile'] = 1.0
    return m
M['prod'] = _img('usam_products', 'us_am_packs.png', 0.38)
M['promo'] = _img('usam_promo_print', 'us_am_promo.png', 0.5)
KIND_ROW = {k: i for i, k in enumerate(PK.KINDS)}
KDIM = {'noodle': ((0.12, 0.16), (0.15, 0.2)), 'cup': ((0.095, 0.11), (0.09, 0.115)), 'sauce': ((0.06, 0.085), (0.15, 0.27)), 'snack': ((0.15, 0.22), (0.19, 0.28)),
        'box': ((0.11, 0.2), (0.11, 0.24)), 'dry': ((0.1, 0.15), (0.16, 0.27)), 'frozen': ((0.17, 0.25), (0.16, 0.26)), 'drink': ((0.19, 0.27), (0.15, 0.24))}
CAT_KINDS = {'noodles': (('noodle', 0.6), ('cup', 0.4)), 'sauce': (('sauce', 0.85), ('box', 0.15)), 'snacks': (('snack', 0.55), ('box', 0.45)), 'dry': (('dry', 0.6), ('box', 0.4)),
             'frozen': (('frozen', 1.0),), 'drinks': (('drink', 1.0),), 'impulse': (('snack', 0.4), ('box', 0.35), ('cup', 0.25))}


def _pick(cat, li):
    if cat == 'noodles' and li >= 3: return 'noodle'                                           # 上面兩層都是袋裝泡麵
    r = rng.random()
    for k, w in CAT_KINDS[cat]:
        if r < w: return k
        r -= w
    return CAT_KINDS[cat][-1][0]


def quad_uv(mesh, pts, uvs, nrm):
    """一片四邊形（遊戲座標）＋UV；照 nrm（遊戲座標的法線方向）決定繞的方向（單面材質：正面要朝外）"""
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify()
    e1 = [pts[1][k] - pts[0][k] for k in range(3)]; e2 = [pts[2][k] - pts[0][k] for k in range(3)]
    n = (e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0])
    if sum(n[k] * nrm[k] for k in range(3)) < 0: pts = pts[::-1]; uvs = uvs[::-1]
    f = bm.faces.new([bm.verts.new(g2b(*p_)) for p_ in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def box_print(mesh, along, a0, a1, dfr, dbk, y0, y1, out, front_uv, side_uv, top_uv=None, sides=(True, True), back=False):
    """一個盒子（along＝沿哪一軸排；d＝往外的那一軸，dfr 正面、dbk 背面；out＝正面朝 +1／−1）：正面貼 front_uv（看的人那邊的左下＝(u0,v0)）、
    頂面 top_uv（沒給就用 side_uv）、兩頭的側面 side_uv（sides 決定做不做）；底面不做"""
    def P(a, d, y): return (d, y, a) if along == 'z' else (a, y, d)
    nO = (out, 0.0, 0.0) if along == 'z' else (0.0, 0.0, out); ad = (0.0, 0.0, 1.0) if along == 'z' else (1.0, 0.0, 0.0)
    right = (nO[2], 0.0, -nO[0]); aL, aR = (a0, a1) if right[0] * ad[0] + right[2] * ad[2] > 0 else (a1, a0)
    u0, v0, u1, v1 = front_uv
    quad_uv(mesh, [P(aL, dfr, y0), P(aR, dfr, y0), P(aR, dfr, y1), P(aL, dfr, y1)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], nO)
    t0, s0, t1, s1 = top_uv or side_uv
    quad_uv(mesh, [P(a0, dfr, y1), P(a1, dfr, y1), P(a1, dbk, y1), P(a0, dbk, y1)], [(t0, s0), (t1, s0), (t1, s1), (t0, s1)], (0.0, 1.0, 0.0))
    t0, s0, t1, s1 = side_uv
    for a, sg, on in ((a0, -1.0, sides[0]), (a1, 1.0, sides[1])):
        if on: quad_uv(mesh, [P(a, dfr, y0), P(a, dbk, y0), P(a, dbk, y1), P(a, dfr, y1)], [(t0, s0), (t1, s0), (t1, s1), (t0, s1)], tuple(sg * v for v in ad))
    if back: quad_uv(mesh, [P(aL, dbk, y0), P(aR, dbk, y0), P(aR, dbk, y1), P(aL, dbk, y1)], [(t0, s0), (t1, s0), (t1, s1), (t0, s1)], tuple(-v for v in nO))


def cell_uv(kind, col):
    r = KIND_ROW[kind]; u0, u1 = col / 8 + 0.002, (col + 1) / 8 - 0.002; vb = 1 - (r + 1) / 8; vt = 1 - r / 8 - 0.002
    return (u0, vb + 16 / 1024 + 0.001, u1, vt), (u0 + 0.01, vb + 0.003, u1 - 0.01, vb + 16 / 1024 - 0.003)


LEVELS = [0.15, 0.48, 0.81, 1.14, 1.47]; SHELF_T = 0.03; PH = 0.3


def products_run(prod, cat, along, a0, a1, front, depth, outward, y_levels=LEVELS, ph=PH):
    """一層一層排商品：一段一款，每段寬高不同；同一段每包高低差一點、有的往後推、偶爾賣空一格"""
    for li, ys in enumerate(y_levels):
        a = a0 + rng.uniform(0.0, 0.03); y = ys + SHELF_T
        while a < a1 - 0.06:
            kind = _pick(cat, li); col = rng.randrange(8); fuv, suv = cell_uv(kind, col)
            (wa, wb), (ha, hb) = KDIM[kind]; w = rng.uniform(wa, wb); h = min(ph - 0.012, rng.uniform(ha, hb))
            end = min(a1, a + rng.uniform(0.32, 0.85)); push = rng.choice((0.0, 0.0, 0.0, 0.02, 0.05)); gap = rng.uniform(0.003, 0.01)
            stack = kind == 'cup' and 2 * h < ph - 0.02 and rng.random() < 0.65
            items = []
            while a + w <= end + 1e-6:
                if rng.random() < 0.06: a += w + gap; continue                                    # 賣掉的空格
                items.append((a, a + w, push + rng.uniform(0.0, 0.015), depth * rng.uniform(0.8, 1.0), h * rng.uniform(0.93, 1.05)))
                a += w + gap
            for i, (p0, p1, ins, dd, hh) in enumerate(items):
                sA = i == 0 or p0 - items[i - 1][1] > 0.02; sB = i == len(items) - 1 or items[i + 1][0] - p1 > 0.02
                fr = front - outward * ins; bk = fr - outward * dd
                box_print(prod, along, p0, p1, fr, bk, y, y + hh, outward, fuv, suv, sides=(sA, sB))
                if stack and rng.random() < 0.85: box_print(prod, along, p0, p1, fr, bk, y + hh + 0.002, y + 2 * hh + 0.002, outward, fuv, suv, sides=(sA, sB))
            a = max(a, end) + rng.uniform(0.01, 0.035)


PROMO = Mesh('usam_promo', M['promo'])   # 印刷的東西（端架看板、整箱泡麵紙箱、糕餅禮盒）：us_am_promo.png
def promo_uv(px0, py0, px1, py1, pad=2):
    return ((px0 + pad) / 1024, 1 - (py1 - pad) / 1024, (px1 - pad) / 1024, 1 - (py0 + pad) / 1024)
def endcap_sign(gx, zface, out, k):
    """端架頂上的特價看板（v2；LAWWW2 退件第 1 點的「印刷的端架看板」）：0.96×0.42 m，印刷面朝 out，背後一塊烤漆板、兩支短柱接在端架頂蓋上"""
    zb = zface - out * 0.025
    sh.box(gx - 0.5, gx + 0.5, 1.55, 1.99, min(zface, zb), max(zface, zb))
    for xx in (gx - 0.4, gx + 0.4): sh.box(xx - 0.015, xx + 0.015, 1.53, 1.56, min(zface, zb), max(zface, zb))
    cx, cy = (k % 4) * 256, (k // 4) * 128; zf = zface + out * 0.001
    xl, xr = (gx - 0.48, gx + 0.48) if out > 0 else (gx + 0.48, gx - 0.48); u0, v0, u1, v1 = promo_uv(cx, cy, cx + 256, cy + 128)
    quad_uv(PROMO, [(xl, 1.57, zf), (xr, 1.57, zf), (xr, 1.97, zf), (xl, 1.97, zf)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], (0.0, 0.0, float(out)))
def cartons(x0, x1, y, dfr, dbk, out, rows=2):
    """整箱的泡麵（紙箱：牛皮紙＋印刷正面、頂面封箱膠帶）：一箱寬 0.28～0.34、高 0.19～0.23，疊 rows 層，最上層偶爾少一箱、位置差一點"""
    for r_ in range(rows):
        x = x0 + rng.uniform(0.0, 0.03); h = rng.uniform(0.19, 0.23)
        while x < x1 - 0.25:
            w = min(x1 - x, rng.uniform(0.28, 0.34))
            if not (r_ == rows - 1 and rng.random() < 0.25):
                k = rng.randrange(8); ins = rng.uniform(0.0, 0.03); t = rng.randrange(4); sd = 4 + rng.randrange(4)
                box_print(PROMO, 'x', x, x + w - 0.006, dfr - out * ins, dbk, y, y + h, out, promo_uv(k * 128, 256, k * 128 + 128, 384),
                          promo_uv(sd * 128, 384, sd * 128 + 128, 512), top_uv=promo_uv(t * 128, 384, t * 128 + 128, 512))
            x += w + rng.uniform(0.004, 0.02)
        y += h + 0.002
def gift_stack(x0, x1, y, dfr, dbk, out):
    """糕餅禮盒（印刷：金邊、透明窗看得到一排圓餅）一疊一疊，大小、高低不一"""
    x = x0 + rng.uniform(0.0, 0.03)
    while x < x1 - 0.2:
        w = min(x1 - x, rng.uniform(0.22, 0.3)); n = rng.randint(1, 3); yy = y; k = rng.randrange(4)
        for j in range(n):
            h = rng.uniform(0.055, 0.08); dx = rng.uniform(-0.012, 0.012)
            box_print(PROMO, 'x', x + dx, x + w + dx, dfr - out * rng.uniform(0.0, 0.02), dbk, yy, yy + h, out, promo_uv((k + j) % 8 * 128, 640, (k + j) % 8 * 128 + 128, 768),
                      promo_uv((k + j) % 8 * 128, 640, (k + j) % 8 * 128 + 128, 768), top_uv=promo_uv(((k + j) % 4) * 256, 512, ((k + j) % 4) * 256 + 256, 640), back=True)
            yy += h + 0.002
        x += w + rng.uniform(0.02, 0.06)


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
sk = Mesh('usam_skirt', M['kick']); sk.box(X0, X1, 0.0, 0.1, Z0, Z0 + 0.03); sk.box(X0, X0 + 0.03, 0.0, 0.1, Z0, Z1); sk.box(X1 - 0.03, X1, 0.0, 0.1, Z0, Z1); sk.finish(root)
# 天花板朝下（LAWWW2-B 10-31 美國室內光照烘焙時找到：原本這片的正面朝上，遊戲裡看得到是靠單面化補的反面——
# 光照烘焙會拿掉疊在一起的反面、留下原本的那一面，烘完天花板從店裡往上看整片不見）
ce = Mesh('usam_ceiling', M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(root)
gr = Mesh('usam_grid', M['grid']); pn = Mesh('GLOW_usam_troffers', M['panel'])
x = X0
while x <= X1 + 1e-6: gr.box(x - 0.012, x + 0.012, H - 0.025, H - 0.002, Z0, Z1); x += 0.6
z = Z0
while z <= Z1 + 1e-6: gr.box(X0, X1, H - 0.025, H - 0.002, z - 0.012, z + 0.012); z += 1.2
for gx_ in [g['x'] + 1.7 for g in J['gondolas'][:3]] + [X0 + 1.5, X1 - 1.5]:                    # 嵌燈盤（走道上方一排一排）
    for zz in (-4.2, -1.8, 0.6, 3.0, 5.0):
        pn.box(gx_ - 0.29, gx_ + 0.29, H - 0.03, H - 0.026, zz - 0.58, zz + 0.58)
gr.finish(root); pn.finish(root, uv=False)

# ================= 正面：玻璃＋門、外面的人行道、停車場、馬路對面的草原超市 =================
# 正面的玻璃、框、門也是南面牆的一部分（WALL_S_*，props dir 同南牆）：鏡頭退到店外時跟著淡出（US-PATROL 10-22：一進門鏡頭在店外，
# 原本合併進 usam_black 的框和門楣不會淡出，畫面上橫著兩條黑帶、人被框擋住）。玻璃、玻璃門是半透明：Z3.attachRoomGLB 當窗的零件，牆淡出時一起藏
gl = Mesh('WALL_S_glass', M['glass']); mu = Mesh('WALL_S_mullions', M['frame']); dg = Mesh('WALL_S_door', M['gdoor'])
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
for m_ in (gl, mu, dg): m_.finish(root, props={'dir': WD['S']}, uv=(m_ is mu))
mt = Mesh('usam_entry_mat', M['mat']); mt.box(dr['x'] - 1.1, dr['x'] + 1.1, 0.0, 0.008, Z1 - 1.6, Z1 - 0.05); mt.finish(root)
out_w = Mesh('usam_out_walk', M['conc'], tile=2.0); out_w.box(-40, 40, -0.05, 0.12, Z1, Z1 + 2.6); out_w.box(-40, 40, -0.05, 0.0, Z1 + 2.6, Z1 + 2.8); out_w.finish(root)
out_a = Mesh('usam_out_lot', M['asph'], tile=3.0); out_a.box(-40, 40, -0.08, -0.02, Z1 + 2.8, Z1 + 24); out_a.finish(root)
ln = Mesh('usam_out_lines', M['paint'])
for k in range(-12, 13): ln.box(k * 2.7 - 0.05, k * 2.7 + 0.05, -0.02, -0.016, Z1 + 3.0, Z1 + 8.2)   # 自己門口的車位線
ln.box(-40, 40, -0.02, -0.016, Z1 + 14.0, Z1 + 14.12); ln.box(-40, 40, -0.02, -0.016, Z1 + 20.0, Z1 + 20.12)   # 馬路的白線
for k in range(-14, 14): ln.box(k * 3.0, k * 3.0 + 1.5, -0.02, -0.016, Z1 + 16.95, Z1 + 17.05)          # 中線（虛線）
ln.finish(root)
vw = Mesh('usam_view', M['view']); bm_ = vw.bm; uvl = bm_.loops.layers.uv.verify()
VZ = Z1 + 24.0   # 景的地平線（貼圖由上往下 72%）放在 y＝0：畫的停車場在地面下（被 3D 的柏油擋住），對面的草原超市從地面起來（第一次截圖：地平線在 5 m 高、只看得到一條灰色）
VH = 20.0; VY0 = -VH * (1 - 0.72)
fc = bm_.faces.new([bm_.verts.new(g2b(*p)) for p in ((-40, VY0, VZ), (40, VY0, VZ), (40, VY0 + VH, VZ), (-40, VY0 + VH, VZ))])
for lp, uv in zip(fc.loops, ((1, 0), (0, 0), (0, 1), (1, 1))): lp[uvl].uv = uv   # 從店裡往南看：右手邊是西（−x），u 要往 −x 增加（第二次截圖：Prairie Basket 是反的）
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
    sh.box(gx - d / 2 - 0.01, gx + d / 2 + 0.01, hh, hh + 0.03, z0 - 0.02, z1 + 0.02)              # 頂蓋（最上層商品的頂面從上面看是一片黑：第一次遊戲內截圖）
    ef = z1 + 0.55                                                                                # 南端的端架（促銷：一箱一箱的泡麵、零食）
    kk.box(gx - 0.5, gx + 0.5, 0.0, 0.13, z1, ef)
    for ys in LEVELS[:4]: sh.box(gx - 0.5, gx + 0.5, ys, ys + SHELF_T, z1, ef)
    for xs_ in (gx - 0.52, gx + 0.5): sh.box(xs_, xs_ + 0.02, 0.0, 1.5, z1, ef)
    sh.box(gx - 0.52, gx + 0.52, 1.5, 1.53, z1, ef)                                             # 端架的頂蓋
    products_run(prod, 'noodles' if g['aisle'] in (1, 3) else 'snacks', 'x', gx - 0.48, gx + 0.48, ef - 0.02, 0.5, 1, LEVELS[:4])
    endcap_sign(gx, ef + 0.02, 1, (g['aisle'] * 2 + 1) % 8)                                     # v2：南端端架頂上的印刷特價看板（朝門口）
    # v2（LAWWW2 退件第 1 點：從裡面朝門口看，貨架北端是一大片灰板）：北端加一個淺端架（深 0.24 m，在配置的擋牆範圍＋玩家半徑以內，導航不動）——
    #   最下面兩層整箱泡麵紙箱、中間一層包裝商品、上面一層糕餅禮盒，頂上一塊印刷特價看板（朝北）
    zN = z0 - 0.02; zf = zN - 0.24
    kk.box(gx - 0.5, gx + 0.5, 0.0, 0.1, zf + 0.02, zN)
    for xs_ in (gx - 0.52, gx + 0.5): sh.box(xs_, xs_ + 0.02, 0.0, 1.5, zf, zN)
    for ys in (0.6, 1.02): sh.box(gx - 0.5, gx + 0.5, ys, ys + SHELF_T, zf, zN)
    sh.box(gx - 0.52, gx + 0.52, 1.5, 1.53, zf, zN)
    cartons(gx - 0.49, gx + 0.49, 0.1, zf + 0.01, zN - 0.01, -1, rows=2)
    products_run(prod, 'noodles' if g['aisle'] in (1, 3) else ('sauce' if g['aisle'] == 2 else 'snacks'), 'x', gx - 0.48, gx + 0.48, zf + 0.02, 0.19, -1, [0.6], 0.38)
    gift_stack(gx - 0.48, gx + 0.48, 1.02 + SHELF_T, zf + 0.02, zN - 0.02, -1)
    endcap_sign(gx, zf - 0.005, -1, (g['aisle'] * 2) % 8)
    # 走道吊牌（貨架東邊那一條走道上方，兩面）：紅底金框中英（us_am_signs.png 上面四塊）
    k = g['aisle'] - 1; sx = g['x'] + (1.7 if g['aisle'] < 4 else 1.3); sz = -0.9; cu, cv = (k % 2) * 0.5, 1.0 - (k // 2) * 160 / 1024   # 第 4 條走道的牌子掛在貨架東邊的走道（原本 −1.4 和第 3 條的牌子疊在一起；SHOP-CC0-HELP-1113 拍照看到）
    for (zf, face) in ((sz + 0.01, '+z'), (sz - 0.01, '-z')): uv_box(sg, sx - 0.7, sx + 0.7, 2.25, 2.67, min(zf, sz), max(zf, sz), face, (cu + 0.003, cv - 0.154, cu + 0.497, cv - 0.003), top_uv=(0.5, 0.3))
    ws = Mesh('usam_sign_wires_%d' % k, M['black'])
    for e in (-0.6, 0.6): ws.cyl((sx + e, 2.67, sz), (sx + e, H - 0.02, sz), 0.005, seg=3)
    ws.finish(root)
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
# SHOP-CC0-HELP-1113：原本頂點色的方塊改進材質組網格（棧板＝木紋、米袋＝編織袋、電鍋和袋架＝白色塑膠、油桶＝黃色塑膠、購物籃＝藍色塑膠、紙箱、禮盒）；
#   疊法、大小每一袋都不一樣（D159：不准一樣大小的方塊排格子）；Poly Haven 掃描模型：塑膠蔬果箱、亞洲梨、洋蔥、地瓜、琺瑯鍋、紙箱、收銀機
pal = Mesh('usam_pallets', M['pallet']); sack = Mesh('usam_ricebags', M['sack']); sack_w = Mesh('usam_ricebags_w', M['sack_w'])
plw = Mesh('usam_plastic_white', M['plastic_w']); ply = Mesh('usam_oil_jugs', M['plastic_y']); plb = Mesh('usam_baskets', M['plastic_b'])
cbd = Mesh('usam_cartons', M['cardboard']); gift = Mesh('usam_giftboxes', M['gift'])
BAND = ['#c8302b', '#1e8a52', '#2a6fb5', '#e0a21b']
def rice_stack(x0, x1, z0, z1, nl, bag_w, bag_d, along_x=True):
    """一棧板的米：每層兩、三袋，每袋大小、位置差一點；最上層有的已經拿走了"""
    for lay in range(nl):
        yb = 0.12 + lay * 0.16 + rng.uniform(-0.004, 0.004)
        nx = max(1, int((x1 - x0) / bag_w)); nz = max(1, int((z1 - z0) / bag_d))
        for i in range(nx):
            for j in range(nz):
                if lay == nl - 1 and rng.random() < 0.3: continue
                m_ = sack if rng.random() < 0.6 else sack_w
                a0 = x0 + i * (x1 - x0) / nx + rng.uniform(0.0, 0.04); a1 = x0 + (i + 1) * (x1 - x0) / nx - rng.uniform(0.01, 0.05)
                b0 = z0 + j * (z1 - z0) / nz + rng.uniform(0.0, 0.04); b1 = z0 + (j + 1) * (z1 - z0) / nz - rng.uniform(0.01, 0.05)
                hh = rng.uniform(0.135, 0.165); m_.rbox(a0, a1, yb, yb + hh, b0, b1, r=0.045, seg=1)
                if along_x: pv.cbox(a1, a1 + 0.005, yb + 0.04, yb + hh - 0.05, b0 + 0.05, b1 - 0.05, rng.choice(BAND))   # 側面的色帶（品項）
                else: pv.cbox(a0 + 0.05, a1 - 0.05, yb + 0.04, yb + hh - 0.05, b1, b1 + 0.005, rng.choice(BAND))
rw = J['rice_wall']
z_ = rw['z0']
while z_ < rw['z1'] - 0.9:                                                                         # 棧板＋大袋子（25、50 磅）
    pl = rw['x0'] + 0.05; pal.box(pl, pl + 1.0, 0.0, 0.12, z_ + 0.02, z_ + 0.98)
    rice_stack(pl + 0.02, pl + 0.97, z_ + 0.03, z_ + 0.97, rng.randint(3, 5), 0.9, 0.46)
    z_ += 1.05
for ys in (1.4, 1.85):                                                                             # 米上面兩層層板：電鍋（白色塑膠圓筒＋蓋子）、琺瑯鍋（Poly Haven）、大桶的油
    sh.box(rw['x0'] + 0.02, rw['x0'] + 0.55, ys, ys + 0.03, rw['z0'], rw['z1'])
    zz = rw['z0'] + 0.3
    while zz < rw['z1'] - 0.3:
        if ys < 1.5:
            if rng.random() < 0.3:
                K.ph_put('pot_enamel_01', rw['x0'] + 0.3, ys + 0.03, zz, rng.uniform(0, 6.28), height=0.17, decimate=0.06); zz += 0.36; continue
            r_ = rng.uniform(0.13, 0.155); h_ = rng.uniform(0.24, 0.29)
            plw.cyl((rw['x0'] + 0.3, ys + 0.03, zz), (rw['x0'] + 0.3, ys + 0.03 + h_, zz), r_, seg=14)
            f0 = set(pv.bm.faces); pv.cyl((rw['x0'] + 0.3, ys + 0.03 + h_, zz), (rw['x0'] + 0.3, ys + 0.09 + h_, zz), r_ - 0.01, seg=14, r2=r_ - 0.04); pv.paint([f for f in pv.bm.faces if f not in f0], rng.choice(['#2a2a2a', '#c8302b', '#e8d8b0']))
            zz += 2 * r_ + rng.uniform(0.08, 0.16)
        else:
            w_ = rng.uniform(0.22, 0.3); h_ = rng.uniform(0.3, 0.38)
            ply.rbox(rw['x0'] + 0.12, rw['x0'] + 0.42, ys + 0.03, ys + 0.03 + h_, zz - w_ / 2, zz + w_ / 2, r=0.03, seg=1)
            pv.cbox(rw['x0'] + 0.24, rw['x0'] + 0.3, ys + 0.03 + h_, ys + 0.08 + h_, zz - 0.03, zz + 0.03, '#c8302b'); zz += w_ + rng.uniform(0.03, 0.08)
for ys in (1.4, 1.85):
    for zz in (rw['z0'] + 0.05, rw['z1'] - 0.05): sh.box(rw['x0'] + 0.02, rw['x0'] + 0.55, 1.3, 2.3, zz - 0.02, zz + 0.02)
# 開放式冷藏櫃（東牆）：白色櫃身、三層、上面一排燈；最下層一排塑膠蔬果箱（Poly Haven）裝青菜、大白菜、亞洲梨、洋蔥、地瓜；上兩層青菜一把一把、豆腐盒
pc = J['produce_case']; cx0, cx1 = pc['x0'], pc['x1']
cb = Mesh('usam_case_body', M['caseback']); cl_ = Mesh('GLOW_usam_case_lights', M['caselight'])
cb.box(cx0, cx1, 0.0, 0.55, pc['z0'], pc['z1']); cb.box(cx1 - 0.12, cx1, 0.55, 2.1, pc['z0'], pc['z1']); cb.box(cx0 + 0.2, cx1, 2.0, 2.15, pc['z0'], pc['z1'])
for zz in (pc['z0'], pc['z1']): cb.box(cx0, cx1, 0.0, 2.15, zz - 0.03, zz + 0.03)
cl_.box(cx0 + 0.3, cx1 - 0.15, 1.97, 2.0, pc['z0'] + 0.05, pc['z1'] - 0.05)
CRATE_H = 0.17
for (ys, dx) in ((0.55, 0.0), (1.05, 0.25), (1.5, 0.45)):
    cb.box(cx0 + dx, cx1 - 0.12, ys, ys + 0.03, pc['z0'], pc['z1'])
    zz = pc['z0'] + 0.2
    while zz < pc['z1'] - 0.2:
        y0 = ys + 0.03; xc = cx0 + dx + (cx1 - 0.12 - cx0 - dx) / 2 - 0.05
        if dx == 0.0:                                                                              # 最下層：塑膠蔬果箱（大小一樣是真的箱子；方向、位置差一點，裡面裝的東西不一樣）
            K.ph_put('plastic_crate_02', xc + rng.uniform(-0.03, 0.03), y0, zz, math.pi / 2 + rng.uniform(-0.06, 0.06), height=CRATE_H, decimate=0.04)
            top = y0 + CRATE_H - 0.03; kind = rng.random()
            if kind < 0.3:
                for j in range(3):
                    f0 = set(pv.bm.faces); pv.ell((xc - 0.1 + j * 0.1, top, zz + rng.uniform(-0.04, 0.04)), 0.06, 0.06, 0.12, seg=7, rings=4); pv.paint([f for f in pv.bm.faces if f not in f0], rng.choice(['#3f7a32', '#5a9a3e', '#7ab04a']))
            elif kind < 0.45:
                f0 = set(pv.bm.faces); pv.ell((xc, top + 0.02, zz), 0.15, 0.1, 0.11, seg=8, rings=5); pv.paint([f for f in pv.bm.faces if f not in f0], '#d8e6b0')
            elif kind < 0.65:
                for j in range(2): K.ph_put('food_pears_asian_01', xc - 0.07 + j * 0.13, top - 0.02, zz + rng.uniform(-0.05, 0.05), rng.uniform(0, 6.28), height=0.075, decimate=0.03)
            elif kind < 0.85:
                for j in range(6): K.ph_put('yellow_onion', xc + rng.uniform(-0.13, 0.13), top - 0.03 + rng.uniform(0, 0.02), zz + rng.uniform(-0.1, 0.1), rng.uniform(0, 6.28), height=0.08, decimate=0.02)
            else:
                for j in range(5): K.ph_put('sweet_potato', xc + rng.uniform(-0.12, 0.12), top - 0.04 + rng.uniform(0, 0.02), zz + rng.uniform(-0.09, 0.09), rng.uniform(0, 6.28), height=0.09, decimate=0.06)
            zz += 0.34
            continue
        kind = rng.random()
        if kind < 0.5:                                                                             # 青江菜、蔥：一把一把（大小不一）
            for j in range(3):
                f0 = set(pv.bm.faces); pv.ell((cx0 + dx + 0.13 + j * 0.12 + rng.uniform(-0.02, 0.02), ys + 0.09, zz + rng.uniform(-0.03, 0.03)), rng.uniform(0.055, 0.075), rng.uniform(0.05, 0.07), rng.uniform(0.08, 0.12), seg=7, rings=4); pv.paint([f for f in pv.bm.faces if f not in f0], rng.choice(['#3f7a32', '#5a9a3e', '#7ab04a']))
            zz += 0.3
        else:                                                                                      # 豆腐盒（白色、透明蓋）：兩三盒，有的疊起來
            n_ = rng.randint(2, 3)
            for j in range(n_):
                yy = ys + 0.03 + (0.05 if (j == n_ - 1 and rng.random() < 0.4) else 0.0); xx = cx0 + dx + 0.06 + (j if yy < ys + 0.05 else j - 1) * 0.13
                pv.cbox(xx, xx + 0.12, yy, yy + 0.05, zz - 0.07, zz + 0.07, '#f4f4ee')
            zz += 0.26
cb.finish(root); cl_.finish(root, uv=False)
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
    x = a0 + rng.uniform(0.2, 0.8)                                                                 # 櫃子上面堆的備貨紙箱（Poly Haven；有的疊兩個）
    while x < a1 - 0.3:
        zc_ = (back + front) / 2 + rng.uniform(-0.08, 0.08)
        K.ph_put('cardboard_box_01', x, 2.35, zc_, rng.uniform(-0.25, 0.25), height=0.33, decimate=0.02)
        if rng.random() < 0.35: K.ph_put('cardboard_box_01', x + rng.uniform(-0.04, 0.04), 2.68, zc_, rng.uniform(-0.4, 0.4), s=0.85, height=0.33, decimate=0.02)
        x += rng.uniform(0.6, 1.5)
fz = J['freezers']; glass_case(fz['x0'], fz['x1'], fz['z0'] + 0.02, fz['z1'], 'frozen', fz['doors'])
dk_ = J['drinks']; glass_case(dk_['x0'], dk_['x1'], dk_['z0'] + 0.02, dk_['z1'], 'drinks', dk_['doors'])
fr_.finish(root); gd.finish(root, uv=False); cl2.finish(root, uv=False); cbk.finish(root)

# ================= 結帳櫃台、燈籠、月曆；門口的促銷米；零食架 =================
wd = Mesh('usam_wood', M['wood'], tile=0.8); cnt = Mesh('usam_counter_top', M['counter']); scr = Mesh('GLOW_usam_screens', M['screen']); bk = Mesh('usam_black_parts', M['black'])
wd.box(ck['x0'], ck['x1'], 0.0, 0.95, ck['z0'], ck['z1']); cnt.box(ck['x0'] - 0.03, ck['x1'] + 0.03, 0.95, 0.99, ck['z0'] - 0.03, ck['z1'] + 0.05)
rx = ck['x0'] + 1.0
bk.box(rx - 0.22, rx + 0.22, 0.99, 1.1, ck['z0'] + 0.15, ck['z0'] + 0.55); bk.box(rx - 0.03, rx + 0.03, 1.1, 1.3, ck['z0'] + 0.2, ck['z0'] + 0.26)
scr.box(rx - 0.18, rx + 0.18, 1.3, 1.55, ck['z0'] + 0.22, ck['z0'] + 0.24)                     # 收銀機螢幕（朝收銀員那一側）
bk.box(rx - 0.18, rx + 0.18, 1.29, 1.56, ck['z0'] + 0.19, ck['z0'] + 0.22)
K.ph_put('CashRegister_01', ck['x0'] + 0.38, 0.99, ck['z0'] + 0.36, math.pi, height=0.4, decimate=0.12)   # 舊式收銀機（放現金；Poly Haven，鍵盤朝收銀員）
pv.crbox(rx + 0.5, rx + 0.62, 0.99, 1.15, ck['z1'] - 0.2, ck['z1'] - 0.08, '#2a2b2d', r=0.01, seg=1)   # 刷卡機（客人那一側）
gift_stack(ck['x1'] - 1.1, ck['x1'] - 0.2, 0.99, ck['z1'] - 0.12, ck['z0'] + 0.3, 1)               # v2（LAWWW2 退件第 3 點：櫃台上一排純白方塊）：糕餅禮盒一疊一疊（印刷，原本是塑膠袋架）
sr = J['snack_rack']
for ys in (0.1, 0.45, 0.8, 1.15): sh.box(sr['x0'], sr['x1'], ys, ys + 0.02, sr['z0'], sr['z1'])
sh.box(sr['x0'], sr['x1'], 0.0, 1.4, sr['z0'], sr['z0'] + 0.03)
products_run(prod, 'impulse', 'x', sr['x0'] + 0.02, sr['x1'] - 0.02, sr['z1'] - 0.02, 0.4, 1, [0.1, 0.45, 0.8, 1.15], 0.26)
# 後面（北邊）收銀員那一側：靠牆的矮櫃，上面禮盒（茶葉、糕餅：紅底金紋、沒有字）和紙箱——大小、高低、間距都不一樣，有的疊起來
wd.box(ck['x0'], ck['x1'], 0.0, 0.9, 2.2, 2.6); cnt.box(ck['x0'], ck['x1'], 0.9, 0.93, 2.2, 2.62)
x = ck['x0'] + 0.08
while x < ck['x1'] - 0.3:
    w_ = rng.uniform(0.16, 0.34); h_ = rng.uniform(0.08, 0.24); d_ = rng.uniform(0.12, 0.22); m_ = gift if rng.random() < 0.7 else cbd
    m_.box(x, x + w_, 0.93, 0.93 + h_, 2.4 - d_ / 2, 2.4 + d_ / 2)
    if rng.random() < 0.3: gift.box(x + 0.02, x + w_ - rng.uniform(0.02, 0.08), 0.93 + h_, 0.93 + h_ + rng.uniform(0.06, 0.12), 2.4 - d_ / 2 + 0.02, 2.4 + d_ / 2 - 0.02)
    x += w_ + rng.uniform(0.02, 0.12)
# 紅燈籠兩顆（櫃台上方）：紅色布紋、發光的球（壓扁）＋金色上下蓋＋流蘇
lt = Mesh('GLOW_usam_lanterns', M['lantern']); gd2 = Mesh('usam_gold_parts', M['gold'])
for lx in (ck['x0'] + 0.8, ck['x1'] - 0.8):
    lt.ell((lx, 2.55, 3.4), 0.22, 0.18, 0.22, seg=14, rings=8)
    gd2.cyl((lx, 2.72, 3.4), (lx, 2.78, 3.4), 0.09, seg=10); gd2.cyl((lx, 2.32, 3.4), (lx, 2.38, 3.4), 0.09, seg=10)
    gd2.cyl((lx, 2.78, 3.4), (lx, H, 3.4), 0.004, seg=3)
    for j in range(5):   # 流蘇
        f0 = set(pv.bm.faces); pv.cyl((lx - 0.04 + j * 0.02, 2.32, 3.4), (lx - 0.04 + j * 0.02, 2.08, 3.4), 0.006, seg=3, r2=0.004); pv.paint([q for q in pv.bm.faces if q not in f0], '#c8282a')
lt.finish(root); gd2.finish(root)
cal = Mesh('usam_calendar_mesh', M['cal']); bm_ = cal.bm; uvl = bm_.loops.layers.uv.verify()
xc, zc = ck['x0'] + 0.35, 2.2                                                                      # 月曆：掛在西牆上（收銀員背後的牆角），寫字的那一面朝東
Q = ((X0 + 0.02, 1.3, zc + 0.6), (X0 + 0.02, 1.3, zc + 0.3), (X0 + 0.02, 1.72, zc + 0.3), (X0 + 0.02, 1.72, zc + 0.6))
for (pts, uvs) in ((Q, ((0, 0), (1, 0), (1, 1), (0, 1))), (Q[::-1], ((0, 1), (1, 1), (1, 0), (0, 0)))):   # 兩面（方向不用算；背面貼著牆看不到）
    f = bm_.faces.new([bm_.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
cal.finish(root, uv=False)
pr_ = J['promo_rice']                                                                              # 門口東邊一棧板促銷的米＋空白紙板牌
pal.box(pr_['x0'], pr_['x1'], 0.0, 0.12, pr_['z0'], pr_['z1'])
rice_stack(pr_['x0'] + 0.03, pr_['x1'] - 0.03, pr_['z0'] + 0.03, pr_['z1'] - 0.03, 4, 0.68, 0.52, along_x=False)
cbd.box((pr_['x0'] + pr_['x1']) / 2 - 0.3, (pr_['x0'] + pr_['x1']) / 2 + 0.3, 0.8, 1.2, pr_['z1'] - 0.03, pr_['z1'] - 0.01)
pv.cbox((pr_['x0'] + pr_['x1']) / 2 - 0.25, (pr_['x0'] + pr_['x1']) / 2 + 0.25, 1.0, 1.1, pr_['z1'] - 0.01, pr_['z1'], '#c8302b')
bx0_, bx1_, bz0_, bz1_ = dr['x'] - 2.05, dr['x'] - 1.5, Z1 - 1.02, Z1 - 0.64                   # 門口疊在一起的購物籃（藍色塑膠）：籃身往下收窄、每個籃口一圈淺色、最上面兩支黑色提把
for k in range(6):
    y_ = k * 0.055; plb.rbox(bx0_ + 0.03, bx1_ - 0.03, y_, y_ + 0.05, bz0_ + 0.03, bz1_ - 0.03, r=0.01, seg=1)
    pv.cbox(bx0_, bx1_, y_ + 0.05, y_ + 0.055, bz0_, bz1_, '#3f76c0')
pv.cbox(bx0_ + 0.06, bx1_ - 0.06, 0.335, 0.336, bz0_ + 0.06, bz1_ - 0.06, '#16345c')                 # 最上面那個籃子的底（看進去是深色）
for zz in (bz0_ + 0.12, bz1_ - 0.12): bk.box(bx0_ + 0.06, bx1_ - 0.06, 0.34, 0.36, zz - 0.01, zz + 0.01)
for m_ in (wd, cnt, pal, sack, sack_w, plw, ply, plb, cbd, gift):
    m_.finish(root)
scr.finish(root, uv=False); bk.finish(root)
for m_ in (prod, sg, PROMO): m_.finish(root, uv=False, merge=False)
for m_ in (sh, pg, kk, pr): m_.finish(root)
for m_ in (tags, pv): m_.finish(root, uv=False)

K.drop_protos()
L.merge_by_material(root, keep=lambda ob: ob.name.startswith('DOOR_') or ob.name.startswith('WALL_') or ob.name.startswith('usam_view'))
# PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：材質改單面（lib2.single_side）——遊戲把 WALL_* 設成 transparent 才能淡出，雙面又半透明要畫兩次。同一頁上限：亞洲超市 2.85→4.15。
_ss = L.single_side(root, keep=r'glass', nodup=r'^usam_products$|^usam_promo_print$|_ph_', skip=lambda ob: ob.name.startswith('usam_view'))   # 商品塊（沒有底、背面）、Poly Haven 掃描模型：只從外面看，不補反面   # 門外的景（usam_view）照舊一片
print('{"single_side": %s}' % json.dumps({k: v for k, v in sorted(_ss.items(), key=lambda kv: -kv[1][1])}, ensure_ascii=False))
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_asian_market.layout.json'))
print('us_asian_market tris', tris)
print('CC0_USED', json.dumps(K.used()))
