"""美國交換：草原超市和對面竹葉亞洲超市之間的停車場、馬路（US-MARKET-STREET；區域 us_market_street）→ GLB。LAWWW2 2026-10-21；Blender 5.2：
  python3 tools/blender/env_second/us_market_street_layout_gen.py && python3 tools/blender/env_second/us_market_street_tex.py
  /opt/blenv/bin/python tools/blender/env_second/us_market_street.py [-- --out assets/models/env/second_ai/us_market_street.glb] [--preview <out.glb>]
  （--preview：另外輸出一份把 us_cars.glb 的車照配置停進去、每台上色的版本，只給驗收渲染用；遊戲的車由遊戲照 layout 的 cars 放）
配置 assets/models/env/second_ai/us_market_street.layout.json（座標＝區域座標：x 東、z 南、y 上）。
使用者 2026-10-17：「超市一個大的超市對面有一個小的亞洲超市」，選「做停車場和馬路」（UA-LAWWW2-1017-03）。
外觀照從竹葉亞洲超市看出去的景（us_am_view.png）：草原超市＝米色牆、深綠色帶、米白招牌板上深綠色字、玻璃帷幕、兩端兩道自動門（IN／OUT）。
做法：
  草原超市：劈裂磚的牆腳（Poly Haven sandstone_blocks_08 調成褐米色）＋米色抹灰牆（plaster_grey_04）、深綠色帶、壓頂；正中間加高的招牌牆＋米白板＋立體字「Prairie Basket」
    （Blender 文字轉網格、晚上字面亮）＋兩側麥穗；前面整片玻璃帷幕（2 m 一支直框，和室內 us_market 同一組）、玻璃後面 1.2 m 是店內景（會亮的板子：貨架、結帳台）、
    兩個玻璃門斗（自動門、IN／OUT 牌）、深綠色雨遮（圓柱、底面嵌燈、麥色細線）、推車回收欄＋推車（和室內同一款）、冰櫃、瓦斯桶籠、長椅、垃圾桶、車阻、季節陳列。
  停車場：柏油（asphalt_02，社區同一組）、白色車位線、無障礙車位（藍線、標誌）、門口斑馬線、消防車道紅色路緣、燈桿（混凝土座、雙燈頭）、安全島的樹、南緣灌木帶。
  馬路：往西兩線、中央分隔島（路緣、草、灌木）、往東兩線；車道虛線、白色邊線、黃色邊線、停止線、斑馬線（路口兩側）、號誌（遠側的懸臂桿；主幹道紅燈）、行人燈（綠的走路人）、
    眼鏡蛇頭路燈、消防栓、公車亭＋站牌（4 路）。
  對面的小商店（一層、正面朝北）：紅磚壁柱＋米色招牌帶、燈箱招牌（自助洗衣、麵店：通稱；竹葉亞洲超市：中英）、玻璃店面、店內景、騎樓雨遮（磚柱、嵌燈）、
    麵店的 OPEN 霓虹、空店面的招租紙；東邊的商店街招牌（Bamboo Plaza，虛構）。
  四季（us_season.py，社區同一套）：樹的葉子（夏綠、秋紅橙黃、初冬落光、雪天積雪）、草地（轉黃、枯黃、雪）、灌木、雪天剷到停車場角落的雪堆、門口的季節陳列
    （夏天花架、秋天南瓜、初冬柴薪＋融雪鹽、雪天聖誕樹）。
店名、路名都虛構（D77）；不放車牌、真的品牌。"""
import json, math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import lib2 as L   # noqa: E402
from lib2 import B, Mesh, CMesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(n, d=None): return ARGS[ARGS.index(n) + 1] if n in ARGS else d
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/us_market_street.glb')); PREVIEW = arg('--preview')
J = json.load(open(os.path.join(L.ROOT, 'assets/models/env/second_ai/us_market_street.layout.json'), encoding='utf-8'))
GEN = os.path.join(HERE, 'textures', 'gen')
SG = json.load(open(os.path.join(GEN, 'us_ms_signs.json'))); INN = json.load(open(os.path.join(GEN, 'us_ms_interiors.json')))
rng = random.Random(20261021)
B.reset(texres=512)
root = B.group('us_market_street', props={'kind': 'us_market_street', 'layout': 'us_market_street.layout.json'})
BD = J['bounds']; PB = J['market']; FZ = PB['front_z']; SM = J['stripmall']; SFZ = SM['front_z']; RD = J['road']
SW = 0.03                                     # 人行道、門前、騎樓的面高（人物站在 y 0：只高 3 cm，腳不會陷進去）
CURB = 0.12                                   # 路緣高


def img_mat(name, fn, rough=0.6, emit=0.0, clip=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bs = N['Principled BSDF']; bs.inputs['Roughness'].default_value = rough
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(GEN, fn), check_existing=True); nt.links.new(tx.outputs['Color'], bs.inputs['Base Color'])
    if emit: nt.links.new(tx.outputs['Color'], bs.inputs['Emission Color']); bs.inputs['Emission Strength'].default_value = emit
    if clip:
        rnd = N.new('ShaderNodeMath'); rnd.operation = 'ROUND'; nt.links.new(tx.outputs['Alpha'], rnd.inputs[0]); nt.links.new(rnd.outputs[0], bs.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    m['tile'] = 1.0
    return m


def uv_quad(mesh, pts, uvs):
    bm = mesh.bm; uvl = bm.loops.layers.uv.verify(); f = bm.faces.new([bm.verts.new(g2b(*p)) for p in pts])
    for lp, uv in zip(f.loops, uvs): lp[uvl].uv = uv
    return f


def sg_uv(name, inset=2):
    """圖集上那一塊的 UV（左下、右下、右上、左上）"""
    x0, y0, x1, y1 = SG['rects'][name]; S_ = SG['size']
    u0, u1 = (x0 + inset) / S_, (x1 - inset) / S_; v0, v1 = 1 - (y1 - inset) / S_, 1 - (y0 + inset) / S_
    return ((u0, v0), (u1, v0), (u1, v1), (u0, v1))


def face_quad(mesh, cx, cy, cz, w, h, yaw, uvs, off=0.0):
    """直立的板子（中心 cx,cy,cz、寬 w、高 h），面向 (sin yaw, cos yaw)；off＝往面向的方向推出去"""
    nx, nz = math.sin(yaw), math.cos(yaw); tx_, tz_ = math.cos(yaw), -math.sin(yaw)    # 板子的「右」（從正面看）
    cx += nx * off; cz += nz * off
    p = lambda u, v: (cx + tx_ * u, cy + v, cz + tz_ * u)
    return uv_quad(mesh, [p(-w / 2, -h / 2), p(w / 2, -h / 2), p(w / 2, h / 2), p(-w / 2, h / 2)], uvs)


def in_uv(name, rep=1.0):
    i, j = INN['cells'][name]; W_, H_ = INN['size']; cw, ch = INN['cw'], INN['ch']
    u0, u1 = i * cw / W_ + 0.002, (i + 1) * cw / W_ - 0.002; v0, v1 = 1 - (j + 1) * ch / H_ + 0.002, 1 - j * ch / H_ - 0.002
    return ((u0, v0), (u1, v0), (u1, v1), (u0, v1))


# ================= 材質 =================
M = {
    'asph': L.pbr('usms_asphalt', 'asphalt_02', tile=3.0, target='#6f6e6b', normal=0.4, maps=('diff', 'nor'), rough_value=0.9),
    'conc': L.pbr('usms_concrete', 'concrete_wall_006', tile=2.0, target='#c4bfb5', normal=0.3, maps=('diff', 'nor'), rough_value=0.85),
    'grass': L.pbr('usms_grass', 'grass_ground', tile=3.0, target='#5d6a44', normal=0.4, maps=('diff', 'nor'), rough_value=0.95),
    'mulch': L.flat('usms_mulch', '#4a3426', rough=0.97),
    'stucco': L.pbr('usms_stucco', 'plaster_grey_04', tile=2.5, target='#d8cbb0', normal=0.35, maps=('diff', 'nor'), rough_value=0.88),
    'block': L.pbr('usms_splitface', 'sandstone_blocks_08', tile=1.6, target='#a1927a', normal=0.6, maps=('diff', 'nor'), rough_value=0.9),
    'brick': L.pbr('usms_brick', 'red_brick_03', tile=1.2, target='#8a5a48', normal=0.5, maps=('diff', 'nor'), rough_value=0.85),
    'sband': L.pbr('usms_signband', 'plaster_grey_04', tile=2.0, target='#cfc3a6', normal=0.3, maps=('diff', 'nor'), res=256, rough_value=0.85),
    'green': L.flat('usms_brand_green', '#2c4a35', rough=0.45, metal=0.25),
    'wheat': L.flat('usms_brand_wheat', '#d9a441', rough=0.5, metal=0.2),
    'cream': L.flat('usms_sign_cream', '#f2ead6', rough=0.5),
    'coping': L.flat('usms_coping', '#cdbf9f', rough=0.6),
    'soffit': L.flat('usms_soffit', '#e6e3dc', rough=0.7),
    'bronze': L.flat('usms_bronze', '#3a332d', rough=0.45, metal=0.4),
    'galv': L.flat('usms_galv', '#9aa0a3', rough=0.4, metal=0.45),
    'frame': L.flat('usms_alu_frame', '#2b2d30', rough=0.35, metal=0.35),
    'frame_al': L.flat('usms_alu_clear', '#b9bcbe', rough=0.35, metal=0.45),
    'glass': L.flat('usms_glass', '#33414a', rough=0.05, metal=0.3, alpha=0.4),
    'gdoor': L.flat('usms_door_glass', '#3a4954', rough=0.04, metal=0.3, alpha=0.32),
    'paint': L.flat('usms_line_paint', '#ecebe6', rough=0.6),
    'yellow': L.flat('usms_line_yellow', '#e3bd3e', rough=0.6),
    'red': L.flat('usms_curb_red', '#b0362b', rough=0.6),
    'blue': L.flat('usms_ada_blue', '#2f5fae', rough=0.6),
    'black': L.flat('usms_black', '#1c1d1f', rough=0.5),
    'membrane': L.flat('usms_roof', '#bdbfbe', rough=0.85),
    'mat': L.flat('usms_entry_mat', '#2c2d2f', rough=0.95),
    'chrome': L.flat('usms_chrome', '#c4c7ca', rough=0.25, metal=0.45),
    'cartred': L.flat('usms_cart_red', '#a3202a', rough=0.45),
    'wire': img_mat('usms_cart_wire', 'us_mk_wire.png', rough=0.35, clip=True),
    'signs': img_mat('usms_signs', 'us_ms_signs.png', rough=0.5),
    'signs_lit': img_mat('GLOW_usms_lightbox_lamp', 'us_ms_signs.png', rough=0.5, emit=1.0),         # 燈箱：晚上亮（白天照貼圖顏色）
    'signs_const': img_mat('GLOW_usms_signal', 'us_ms_signs.png', rough=0.4, emit=1.2),              # 行人燈、OPEN 霓虹：一直亮
    'signs_clip': img_mat('usms_signs_clip', 'us_ms_signs.png', rough=0.5, clip=True),
    'inter': img_mat('GLOW_usms_store_interior', 'us_ms_interiors.png', rough=0.6, emit=0.9),          # 店內景（白天 0.55、晚上全亮：遊戲照名字）
    'inter_dim': img_mat('usms_vacant_interior', 'us_ms_interiors.png', rough=0.8),                  # 空店面不亮
    'lamp': L.flat('GLOW_usms_lamp', '#fff4dc', rough=0.3, emit=B.srgb('#ffe8c0')),
    'letter_lit': L.flat('GLOW_usms_letters_lamp', '#2c5a3a', rough=0.4, emit=B.srgb('#7ac48a')),     # 立體字：白天深綠、晚上亮綠
    'sig_red': L.flat('GLOW_usms_sig_red', '#ff3a2a', rough=0.3, emit=B.srgb('#ff2a1a')),
    'sig_green': L.flat('GLOW_usms_sig_green', '#3aff9a', rough=0.3, emit=B.srgb('#20ff90')),
    'sig_off': L.flat('usms_sig_off', '#2a2e2c', rough=0.3),
    'vc': L.vc_material('usms_vc', rough=0.6),
}
try:
    import plants as PL
    PM = PL.materials('usms_')
except Exception as ex:
    PL = None; print('plants', ex)

# ================= 季節（社區同一套：us_season.py）=================
import us_season as SEA   # noqa: E402
CAR = SEA.carrier(root)
LEAF_T = []
for k_, png in zip('abc', ('us_leaves_red.png', 'us_leaves_orange.png', 'us_leaves_yellow.png')):
    m_ = SEA.leaf_mat(f'usms_leaf_tree_{k_}', 'us_leaves_summer.png'); LEAF_T.append(m_)
    SEA.swap(CAR, m_, 'autumn', SEA.leaf_mat('t', png)); SEA.swap(CAR, m_, 'bare', SEA.leaf_mat('t', 'us_twigs.png')); SEA.swap(CAR, m_, 'snow', SEA.leaf_mat('t', 'us_twigs_snow.png'))
TWIG_IN = SEA.leaf_mat('usms_twig_inner', 'us_twigs.png'); SEA.swap(CAR, TWIG_IN, 'snow', SEA.leaf_mat('t', 'us_twigs_snow.png'))
LITTER = SEA.leaf_mat('usms_leaf_litter', 'us_leaf_litter.png', rough=0.85)
SEA.swap(CAR, M['grass'], 'autumn', L.pbr('t', 'grass_ground', tile=3.0, target='#646b43', normal=0.4, maps=('diff', 'nor'), rough_value=0.95))
SEA.swap(CAR, M['grass'], 'bare', L.pbr('t', 'withered_grass', tile=3.0, target='#857a58', normal=0.4, maps=('diff', 'nor'), rough_value=0.95))
SEA.swap(CAR, M['grass'], 'snow', L.pbr('t', 'snow_02', tile=3.0, target='#e6eaee', normal=0.5, maps=('diff', 'nor'), rough_value=0.75))
SEA.swap(CAR, M['mulch'], 'snow', L.pbr('t', 'snow_02', tile=2.0, target='#e2e6ea', normal=0.4, maps=('diff', 'nor'), rough_value=0.8))
SEA.swap(CAR, M['asph'], 'snow', L.pbr('t', 'asphalt_02', tile=3.0, target='#56565a', normal=0.4, maps=('diff', 'nor'), rough_value=0.55))   # 雪天：剷過雪、濕的柏油


# ================= 地面 =================
asp = Mesh('usms_asphalt', M['asph'], tile=3.0)
def flat_rect(m, x0, x1, z0, z1, y):
    m.quad([(x0, y, z1), (x1, y, z1), (x1, y, z0), (x0, y, z0)])
LOT = J['lot']; DR = J['drive']; DW = J['drive_w']
flat_rect(asp, LOT['x0'], LOT['x1'], LOT['z0'], LOT['z1'], 0.0)
flat_rect(asp, -130.0, 130.0, RD['z0'], RD['z1'], 0.0)                                          # 馬路往兩邊延伸到看不見
for d_ in (DR, DW): flat_rect(asp, d_['x0'], d_['x1'], LOT['z1'], RD['z0'], 0.0)
flat_rect(asp, DR['x0'], DR['x1'], RD['z1'], BD['z1'] + 30.0, 0.0)                               # 商店東邊往後面停車場的車道
asp.finish(root)
cn = Mesh('usms_concrete', M['conc'], tile=2.0)
def slab(x0, x1, z0, z1, y=SW): cn.box(x0, x1, -0.05, y, z0, z1)
slab(PB['x0'] - 0.6, PB['x1'] + 0.6, FZ, J['apron']['z1'])                                     # 草原超市門前（雨遮下）
slab(-130.0, 130.0, J['walk_n']['z0'], J['walk_n']['z1']); slab(-130.0, 130.0, J['walk_s']['z0'], J['walk_s']['z1'])   # 兩側人行道（過車道的地方也是水泥）
slab(SM['x0'] - 0.6, DR['x0'], J['arcade']['z0'], SFZ)                                           # 騎樓
for c_ in J['cross']:                                                                            # 斑馬線兩端的無障礙坡道（路緣斷開、水泥面）
    for (z0_, z1_) in ((J['lawn_n']['z0'], RD['z0']), (RD['z1'], J['walk_s']['z0'] + 0.01)): slab(c_['x0'] - 0.3, c_['x1'] + 0.3, z0_, z1_, 0.02)
bs_ = J['bus']['shelter']; slab(bs_['x0'] - 0.4, bs_['x1'] + 0.4, bs_['z0'] - 0.2, J['walk_n']['z0'])   # 公車亭的水泥地
cn.finish(root)
gr = Mesh('usms_grass', M['grass'], tile=3.0)
def lawn(x0, x1, z0, z1, y=0.04): gr.box(x0, x1, -0.05, y, z0, z1)
gr.quad([(-130, -0.02, 130), (130, -0.02, 130), (130, -0.02, -130), (-130, -0.02, -130)])        # 底下整片（遠處）
for (x0_, x1_) in ((-130.0, DW['x0']), (DW['x1'], J['cross'][0]['x0'] - 0.3), (J['cross'][0]['x1'] + 0.3, DR['x0']), (DR['x1'], J['cross'][1]['x0'] - 0.3), (J['cross'][1]['x1'] + 0.3, 130.0)):
    lawn(x0_, x1_, J['lawn_n']['z0'], J['lawn_n']['z1'] - CURB * 0)                              # 北側行道樹草帶
med = J['road']['median']
for (x0_, x1_) in ((-130.0, J['cross'][0]['x0']), (J['cross'][1]['x1'], 130.0)): lawn(x0_ + 0.18, x1_ - 0.18, med[0] + 0.18, med[1] - 0.18, CURB)   # 中央分隔島
lawn(-130.0, PB['x0'] - 0.6, -60.0, LOT['z0']); lawn(PB['x1'] + 0.6, 130.0, -60.0, LOT['z0'])    # 超市兩側
lawn(-130.0, LOT['x0'], LOT['z0'], J['strip']['z0']); lawn(LOT['x1'], 130.0, LOT['z0'], J['strip']['z0'])
lawn(-130.0, SM['x0'] - 0.6, J['arcade']['z0'], 90.0); lawn(DR['x1'], 130.0, J['walk_s']['z1'], 90.0)   # 小商店西邊、東邊
gr.finish(root)
mu = Mesh('usms_mulch', M['mulch'], tile=2.0)                                                     # 停車場南緣的灌木帶（樹皮覆蓋）
gaps = sorted([(DR['x0'], DR['x1']), (DW['x0'], DW['x1']), (J['cross'][0]['x0'] - 1.6, J['cross'][0]['x1'] + 0.4), (bs_['x0'] - 1.2, bs_['x1'] + 1.2)])
x = LOT['x0']; STRIP_SEGS = []
for g0, g1 in gaps:
    if g0 > x: STRIP_SEGS.append((x, g0))
    x = max(x, g1)
if x < LOT['x1']: STRIP_SEGS.append((x, LOT['x1']))
for (x0_, x1_) in STRIP_SEGS: mu.box(x0_ + 0.15, x1_ - 0.15, -0.05, 0.06, J['strip']['z0'] + 0.15, J['strip']['z1'] - 0.15)
for x_ in (-36.4, 36.4): mu.box(x_ - 1.25, x_ + 1.25, -0.05, 0.08, -8.85, 1.85)                   # 停車場兩端的安全島
mu.finish(root)
cn2 = Mesh('usms_concrete_gaps', M['conc'], tile=2.0)
for g0, g1 in [(bs_['x1'] + 0.4, bs_['x1'] + 1.2), (bs_['x0'] - 1.2, bs_['x0'] - 0.4), (J['cross'][0]['x0'] - 1.6, J['cross'][0]['x1'] + 0.4)]:
    cn2.box(g0, g1, -0.05, SW, J['strip']['z0'], J['strip']['z1'])                                 # 灌木帶的行人缺口（公車亭兩側、對著西側斑馬線）
cn2.finish(root)
# 路緣（水泥條，高 0.12）：停車場邊、灌木帶、草帶靠馬路、中央分隔島、安全島；斑馬線、車道出入口斷開
cb = Mesh('usms_curbs', M['conc'], tile=1.0)
def curb_x(x0, x1, z, cuts=()):
    xs = [x0]; ys = []
    segs = [(x0, x1)]
    for (c0, c1) in cuts:
        nxt = []
        for (a, b) in segs:
            if c1 <= a or c0 >= b: nxt.append((a, b)); continue
            if c0 > a: nxt.append((a, c0))
            if c1 < b: nxt.append((c1, b))
        segs = nxt
    for (a, b) in segs:
        if b - a > 0.05: cb.rbox(a, b, -0.02, CURB, z - 0.08, z + 0.08, r=0.02, seg=1)
def curb_z(z0, z1, x):
    cb.rbox(x - 0.08, x + 0.08, -0.02, CURB, z0, z1, r=0.02, seg=1)
CUTS_N = [(DW['x0'], DW['x1']), (DR['x0'], DR['x1']), (J['cross'][0]['x0'] - 0.3, J['cross'][0]['x1'] + 0.3), (J['cross'][1]['x0'] - 0.3, J['cross'][1]['x1'] + 0.3)]
curb_x(-130.0, 130.0, RD['z0'], CUTS_N)                                                             # 北側馬路邊
curb_x(-130.0, 130.0, RD['z1'], [(DR['x0'], DR['x1'])] + CUTS_N[2:])                                # 南側馬路邊
for (x0_, x1_) in ((-130.0, J['cross'][0]['x0']), (J['cross'][1]['x1'], 130.0)):                    # 分隔島
    curb_x(x0_, x1_, med[0]); curb_x(x0_, x1_, med[1])
curb_z(med[0], med[1], J['cross'][0]['x0']); curb_z(med[0], med[1], J['cross'][1]['x1'])
for (x0_, x1_) in STRIP_SEGS: curb_x(x0_, x1_, J['strip']['z0'] + 0.08); curb_x(x0_, x1_, J['strip']['z1'] - 0.08)
curb_x(LOT['x0'], LOT['x1'], LOT['z0'] - 0.08, [(PB['x0'] - 0.6, PB['x1'] + 0.6)])                 # 停車場北緣（超市門前那一段另外漆紅）
curb_z(LOT['z0'], J['strip']['z0'], LOT['x0'] - 0.08); curb_z(LOT['z0'], J['strip']['z0'], LOT['x1'] + 0.08)
for x_ in (-36.4, 36.4):
    curb_x(x_ - 1.35, x_ + 1.35, -9.0); curb_x(x_ - 1.35, x_ + 1.35, 2.0); curb_z(-9.0, 2.0, x_ - 1.35); curb_z(-9.0, 2.0, x_ + 1.35)
cb.finish(root)
rc = Mesh('usms_curb_red', M['red'])                                                                  # 消防車道：超市門前的路緣漆紅
rc.rbox(PB['x0'] - 0.6, PB['x1'] + 0.6, -0.02, CURB, LOT['z0'] - 0.16, LOT['z0'], r=0.02, seg=1)
rc.finish(root)
# 標線
pl = Mesh('usms_paint_white', M['paint']); yl = Mesh('usms_paint_yellow', M['yellow']); bl = Mesh('usms_paint_blue', M['blue'])
Y_P = 0.006
def line(m, x0, x1, z0, z1): m.box(x0, x1, 0.0, Y_P, z0, z1)
SW_ = J['stall']['w']; SD = J['stall']['d']
for s in J['stalls']:
    m = bl if s.get('ada') else pl; x_, z_ = s['x'], s['z']
    for dx in (-SW_ / 2, SW_ / 2): line(m, x_ + dx - 0.05, x_ + dx + 0.05, z_ - SD / 2 + (0.3 if s['face'] > 0 else 0.0), z_ + SD / 2 - (0.3 if s['face'] < 0 else 0.0))
line(pl, LOT['x0'] + 1.0, LOT['x1'] - 1.0, -3.55, -3.45)                                              # 兩排車頭中間那條線
for d in PB['doors']:                                                                                 # 門口的斑馬線（跨前車道）
    for k in range(6): line(pl, d['x'] - 1.5, d['x'] + 1.5, LOT['z0'] + 0.4 + k * 1.15, LOT['z0'] + 0.95 + k * 1.15)
for k in range(int((LOT['x1'] - LOT['x0']) / 2.4)):                                                 # 消防車道的紅白斜線（門口斑馬線以外）
    x_ = LOT['x0'] + 0.6 + k * 2.4
    if any(abs(x_ - d['x']) < 2.4 for d in PB['doors']) or not (PB['x0'] < x_ < PB['x1']): continue
    f0 = set(pl.bm.faces); pl.quad([(x_, Y_P, J['fire_lane']['z1'] - 0.3), (x_ + 0.25, Y_P, J['fire_lane']['z1'] - 0.3), (x_ + 1.45, Y_P, J['fire_lane']['z0'] + 0.3), (x_ + 1.2, Y_P, J['fire_lane']['z0'] + 0.3)])
line(pl, PB['x0'], PB['x1'], J['fire_lane']['z1'] - 0.1, J['fire_lane']['z1'])
for zc, (za, zb) in ((J['lane_c']['w1'] + 1.8, RD['lanes_w']), (J['lane_c']['e2'] + 1.8, RD['lanes_e'])):   # 同方向兩線之間的白虛線
    x_ = -130.0
    while x_ < 130.0:
        if not (J['cross'][0]['x0'] - 1.5 < x_ < J['cross'][1]['x1'] + 1.5): line(pl, x_, x_ + 3.0, zc - 0.06, zc + 0.06)
        x_ += 12.0
for zc in (RD['z0'] + 0.35, RD['z1'] - 0.35):                                                        # 邊線
    for (x0_, x1_) in ((-130.0, J['cross'][0]['x0'] - 0.5), (J['cross'][1]['x1'] + 0.5, 130.0)): line(pl, x0_, x1_, zc - 0.06, zc + 0.06)
for zc in (med[0] - 0.3, med[1] + 0.3):                                                               # 分隔島兩側的黃線
    for (x0_, x1_) in ((-130.0, J['cross'][0]['x0'] - 0.5), (J['cross'][1]['x1'] + 0.5, 130.0)): line(yl, x0_, x1_, zc - 0.06, zc + 0.06)
line(pl, J['stop_w'] - 0.25, J['stop_w'] + 0.25, RD['lanes_w'][0] + 0.2, RD['lanes_w'][1] - 0.2)   # 停止線
line(pl, J['stop_e'] - 0.25, J['stop_e'] + 0.25, RD['lanes_e'][0] + 0.2, RD['lanes_e'][1] - 0.2)
line(pl, DR['x0'] + 5.0, DR['x1'] - 0.3, LOT['z1'] - 0.7, LOT['z1'] - 0.3)                            # 停車場大門出口的停止線
for c_ in J['cross']:                                                                                 # 路口兩側的斑馬線（條紋和車道平行）
    z_ = RD['z0'] + 0.5
    while z_ < RD['z1'] - 0.6: line(pl, c_['x0'], c_['x1'], z_, z_ + 0.6); z_ += 1.2
pl.finish(root, uv=False); yl.finish(root, uv=False); bl.finish(root, uv=False)
# 無障礙車位的地面標誌、立牌
ada_ = Mesh('usms_ada_marks', M['signs'])
for s in [s for s in J['stalls'] if s.get('ada')]:
    x_, z_ = s['x'], s['z']; uvs = sg_uv('ada'); x0, y0, x1, y1 = SG['rects']['ada']; S_ = SG['size']
    vtop = 1 - (y0 + 18) / S_; vbot = 1 - (y0 + 220) / S_; u0, u1 = (x0 + 18) / S_, (x1 - 19) / S_
    uv_quad(ada_, [(x_ - 0.6, 0.008, z_ + 0.6), (x_ + 0.6, 0.008, z_ + 0.6), (x_ + 0.6, 0.008, z_ - 0.6), (x_ - 0.6, 0.008, z_ - 0.6)], ((u0, vbot), (u1, vbot), (u1, vtop), (u0, vtop)))
ada_.finish(root, uv=False)

# ================= 草原超市 =================
st = Mesh('usms_stucco', M['stucco'], tile=2.5); bk = Mesh('usms_splitface', M['block'], tile=1.6)
gb = Mesh('usms_green', M['green']); wh = Mesh('usms_wheat', M['wheat']); cp = Mesh('usms_coping', M['coping'])
X0p, X1p, H = PB['x0'], PB['x1'], PB['h']; ZB = PB['back_z']; GH = PB['glass']['h']; GX0, GX1 = PB['glass']['x0'], PB['glass']['x1']
BASE = 1.2
# 正面：兩端的牆墩（劈裂磚）、玻璃上面的抹灰牆、深綠色帶、壓頂
for (a, b) in ((X0p, GX0), (GX1, X1p)):
    bk.box(a, b, 0.0, GH, FZ - 0.3, FZ); st.box(a, b, GH, H, FZ - 0.3, FZ)
st.box(GX0, GX1, GH + 0.2, H, FZ - 0.3, FZ)
gb.box(GX0, GX1, GH, GH + 0.2, FZ - 0.3, FZ + 0.02)                                                    # 玻璃上緣的深綠框
gb.box(X0p - 0.04, X1p + 0.04, 5.25, 5.85, FZ - 0.3, FZ + 0.06)                                          # 深綠色帶（照 us_am_view）
wh.box(X0p - 0.05, X1p + 0.05, 5.18, 5.25, FZ - 0.3, FZ + 0.07)                                          # 帶子下面一條麥色細線
cp.box(X0p - 0.1, X1p + 0.1, H - 0.15, H, FZ - 0.4, FZ + 0.1)
# 側牆（劈裂磚牆腳＋抹灰）、背後
for (xa, xb) in ((X0p, X0p + 0.3), (X1p - 0.3, X1p)):
    bk.box(xa - (0.0 if xa > X0p else 0.0), xb, 0.0, BASE, ZB, FZ - 0.3); st.box(xa, xb, BASE, H, ZB, FZ - 0.3)
    gb.box(xa - 0.04 if xa <= X0p else xa, xb + 0.04 if xb >= X1p else xb, 5.25, 5.85, FZ - 8.0, FZ - 0.3); wh.box(xa - 0.05 if xa <= X0p else xa, xb + 0.05 if xb >= X1p else xb, 5.18, 5.25, FZ - 8.0, FZ - 0.3)
    cp.box(xa - 0.1 if xa <= X0p else xa, xb + 0.1 if xb >= X1p else xb, H - 0.15, H, ZB, FZ - 0.3)
    for zz in (FZ - 8.0, FZ - 16.0, FZ - 24.0): st.box(xa - 0.02 if xa <= X0p else xa, xb + 0.02 if xb >= X1p else xb, BASE, H - 0.15, zz - 0.04, zz + 0.04)   # 伸縮縫
st.box(X0p, X1p, 0.0, H, ZB, ZB + 0.3); cp.box(X0p - 0.1, X1p + 0.1, H - 0.15, H, ZB - 0.1, ZB + 0.3)
rf = Mesh('usms_roof', M['membrane']); rf.box(X0p + 0.3, X1p - 0.3, H - 0.5, H - 0.4, ZB + 0.3, FZ - 0.3); rf.finish(root)
# 正中間加高的招牌牆：抹灰、米白板、立體字、兩側麥穗
sw_ = PB['sign_w']; SH = PB['sign_h']
st.box(-sw_ / 2, sw_ / 2, H, SH, FZ - 0.3, FZ - 0.0); st.box(-sw_ / 2, sw_ / 2, 4.4, H, FZ - 0.0, FZ + 0.15)
cp.box(-sw_ / 2 - 0.1, sw_ / 2 + 0.1, SH - 0.15, SH, FZ - 0.4, FZ + 0.25)
gb.box(-sw_ / 2 - 0.06, sw_ / 2 + 0.06, 5.25, 5.85, FZ + 0.15, FZ + 0.21)
crm = Mesh('usms_sign_panel', M['cream']); crm.box(-sw_ / 2 + 0.9, sw_ / 2 - 0.9, 6.05, 8.85, FZ + 0.15, FZ + 0.22); crm.finish(root)
gb.box(-sw_ / 2 + 0.8, sw_ / 2 - 0.8, 5.95, 6.05, FZ + 0.15, FZ + 0.25); gb.box(-sw_ / 2 + 0.8, sw_ / 2 - 0.8, 8.85, 8.95, FZ + 0.15, FZ + 0.25)
st.finish(root); bk.finish(root); cp.finish(root); wh.finish(root, uv=False)
# 立體字「Prairie Basket」（DejaVu Sans Bold，和 us_am_view 的字同一款）
cu = bpy.data.curves.new('pb_letters', 'FONT'); cu.body = PB['name_en']; cu.font = bpy.data.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
cu.extrude = 0.06; cu.size = 1.0; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
tob = bpy.data.objects.new('pb_letters_tmp', cu); bpy.context.scene.collection.objects.link(tob)
dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(tob.evaluated_get(dg)); bpy.data.objects.remove(tob, do_unlink=True)
bb = [Vector(v.co) for v in me.vertices]; xmin = min(v.x for v in bb); xmax = max(v.x for v in bb); ymin = min(v.y for v in bb); ymax = max(v.y for v in bb)
sc = min((sw_ - 3.4) / (xmax - xmin), 1.25 / (ymax - ymin))
tm = Matrix.Translation(g2b(0.0, 7.45, FZ + 0.22 + 0.06)) @ Matrix.Rotation(math.pi / 2, 4, 'X') @ Matrix.Scale(sc, 4) @ Matrix.Translation(Vector((-(xmin + xmax) / 2, -(ymin + ymax) / 2, -0.06)))
me.transform(tm)
lt = bpy.data.objects.new('GLOW_usms_letters', me); lt.data.materials.append(M['letter_lit']); lt.parent = root; bpy.context.scene.collection.objects.link(lt)
for k_ in me.polygons: k_.use_smooth = False
wq = Mesh('usms_wheat_logo', M['signs_clip'])
for sx_ in (-1, 1): face_quad(wq, sx_ * (sw_ / 2 - 1.75), 7.45, FZ + 0.23, 1.4, 1.4, 0.0, sg_uv('wheat'))
wq.finish(root, uv=False)
# 玻璃帷幕（2 m 一支直框，和室內同一組）＋店內景
gl = Mesh('usms_storefront_glass', M['glass']); fr = Mesh('usms_frames', M['frame'])
xs = [GX0 + k * 2.0 for k in range(int((GX1 - GX0) / 2.0) + 1)]
for xa, xb in zip(xs, xs[1:]):
    if any(abs((xa + xb) / 2 - d['x']) < d['w'] / 2 + 0.3 for d in PB['doors']): continue
    gl.quad([(xa, 0.0, FZ), (xb, 0.0, FZ), (xb, GH, FZ), (xa, GH, FZ)])
for xx in xs: fr.box(xx - 0.05, xx + 0.05, 0.0, GH, FZ - 0.06, FZ + 0.06)
fr.box(GX0, GX1, 0.0, 0.12, FZ - 0.06, FZ + 0.08)
it = Mesh('usms_pb_interior', M['inter'])
k = 0; x_ = GX0
while x_ < GX1 - 0.1:
    w_ = min(8.0, GX1 - x_); uv = in_uv('pb'); u0, v0 = uv[0]; u1, v1 = uv[2]; uu = u0 + (u1 - u0) * (w_ / 8.0)
    uv_quad(it, [(x_, 0.0, FZ - 1.25), (x_ + w_, 0.0, FZ - 1.25), (x_ + w_, GH + 0.3, FZ - 1.25), (x_, GH + 0.3, FZ - 1.25)], ((u0, v0), (uu, v0), (uu, v1), (u0, v1)))
    x_ += w_; k += 1
it.finish(root, uv=False)
mt = Mesh('usms_store_floor_dark', M['black']); mt.box(GX0, GX1, -0.05, 0.01, FZ - 1.3, FZ); mt.finish(root)   # 玻璃和店內景之間的地（深色）
po = Mesh('usms_posters', M['signs'])                                                                     # 玻璃內側的海報
for (px_, nm_) in ((9.0, 'p_fresh'), (6.95, 'p_deals'), (-9.0, 'p_hire'), (-17.0, 'p_deals')): face_quad(po, px_, 1.35, FZ - 0.05, 0.7, 0.97, 0.0, sg_uv(nm_))
# 門斗（玻璃盒、自動門、IN／OUT 牌）
VD, VW, VH = PB['vestibule']['d'], PB['vestibule']['w'], PB['vestibule']['h']; VZ = FZ + VD
gd = Mesh('usms_door_glass', M['gdoor'])
for d in PB['doors']:
    xa, xb, dx0, dx1 = d['x'] - VW / 2, d['x'] + VW / 2, d['x'] - d['w'] / 2, d['x'] + d['w'] / 2
    for (a, b) in ((xa, dx0), (dx1, xb)): gl.quad([(a, 0.0, VZ), (b, 0.0, VZ), (b, VH - 0.6, VZ), (a, VH - 0.6, VZ)])   # 正面兩側固定玻璃
    gd.quad([(dx0, 0.0, VZ - 0.04), (d['x'] - 0.01, 0.0, VZ - 0.04), (d['x'] - 0.01, 2.35, VZ - 0.04), (dx0, 2.35, VZ - 0.04)])   # 自動門兩片（關著）
    gd.quad([(d['x'] + 0.01, 0.0, VZ - 0.08), (dx1, 0.0, VZ - 0.08), (dx1, 2.35, VZ - 0.08), (d['x'] + 0.01, 2.35, VZ - 0.08)])
    for xs_ in (xa, xb): gl.quad([(xs_, 0.0, FZ), (xs_, 0.0, VZ), (xs_, VH - 0.6, VZ), (xs_, VH - 0.6, FZ)])            # 兩側玻璃
    for xx in (xa, dx0, dx1, xb): fr.box(xx - 0.06, xx + 0.06, 0.0, VH - 0.2, VZ - 0.06, VZ + 0.06)
    for xx in (xa, xb):
        fr.box(xx - 0.06, xx + 0.06, 0.0, VH - 0.2, FZ, VZ); fr.box(xx - 0.06, xx + 0.06, 0.0, VH - 0.2, FZ + VD / 2 - 0.04, FZ + VD / 2 + 0.04)
    for (a, b) in ((dx0, d['x'] - 0.01), (d['x'] + 0.01, dx1)): fr.box(a, b, 0.0, 0.08, VZ - 0.1, VZ - 0.02); fr.box(a, b, 2.3, 2.4, VZ - 0.1, VZ - 0.02)
    fr.box(xa, xb, VH - 0.6, VH - 0.5, VZ - 0.06, VZ + 0.06)
    gb.box(xa - 0.1, xb + 0.1, VH - 0.5, VH, FZ, VZ + 0.12)                                                       # 門斗頂（深綠）
    gb.box(dx0 - 0.2, dx1 + 0.2, 2.4, VH - 0.6, VZ - 0.12, VZ - 0.02)                                             # 自動門上方的機箱
    fr.box(d['x'] - 0.15, d['x'] + 0.15, 2.5, 2.58, VZ - 0.02, VZ + 0.05)                                         # 感應器
    face_quad(po, d['x'], VH - 0.25, VZ + 0.12, 1.1, 0.5, 0.0, sg_uv(d['id']), off=0.005)
    mt2 = Mesh('usms_vest_mat_' + d['id'], M['mat']); mt2.box(xa + 0.15, xb - 0.15, -0.05, 0.02, FZ + 0.1, VZ - 0.15); mt2.finish(root)
po.finish(root, uv=False)
# 雨遮：底板（嵌燈）、深綠色封簷（麥色細線）、圓柱
cz1 = PB['canopy']['z1']; CY = PB['canopy']['y']; FA = PB['canopy']['fascia']
so = Mesh('usms_soffit', M['soffit']); so.box(X0p, X1p, CY, CY + 0.12, FZ, cz1); so.finish(root)
gb.box(X0p - 0.05, X1p + 0.05, CY - 0.1, CY + FA - 0.1, cz1 - 0.04, cz1 + 0.12); gb.box(X0p - 0.05, X0p + 0.12, CY - 0.1, CY + FA - 0.1, FZ, cz1); gb.box(X1p - 0.12, X1p + 0.05, CY - 0.1, CY + FA - 0.1, FZ, cz1)
wh2 = Mesh('usms_wheat_stripe', M['wheat']); wh2.box(X0p - 0.06, X1p + 0.06, CY + 0.12, CY + 0.2, cz1 + 0.12, cz1 + 0.13); wh2.finish(root, uv=False)
lp_ = Mesh('GLOW_usms_canopy_lamp', M['lamp'])
for zz in (FZ + 1.2, cz1 - 0.9):
    x_ = X0p + 2.0
    while x_ < X1p - 1.0:
        lp_.cyl((x_, CY - 0.012, zz), (x_, CY - 0.002, zz), 0.14, seg=12); x_ += 4.0
for x_ in PB['canopy']['cols']:
    gb.cyl((x_, 0.0, cz1 - 0.3), (x_, CY, cz1 - 0.3), 0.16, seg=16); gb.box(x_ - 0.22, x_ + 0.22, 0.0, 0.06, cz1 - 0.52, cz1 - 0.08)
gb.finish(root, uv=False); gl.finish(root, uv=False); gd.finish(root, uv=False); fr.finish(root, uv=False)

# ================= 對面的小商店（一層、正面朝北）=================
sb = Mesh('usms_brick', M['brick'], tile=1.2); sbd = Mesh('usms_signband', M['sband'], tile=2.0); bz = Mesh('usms_bronze', M['bronze'])
gl2 = Mesh('usms_shop_glass', M['glass']); fr2 = Mesh('usms_shop_frames', M['frame_al']); gd2 = Mesh('usms_shop_door_glass', M['gdoor'])
it2 = Mesh('usms_shop_interiors', M['inter']); itv = Mesh('usms_vacant_interior', M['inter_dim']); lb = Mesh('usms_lightboxes', M['signs_lit'])
X0s, X1s, Hs, PAR = SM['x0'], SM['x1'], SM['h'], SM['parapet']; ZBs = SM['back_z']; AY = J['arcade']['y']; AZ0 = J['arcade']['z0']
GHs = 3.0
DOORX = {'laundry': -24.6, 'noodle': -15.0, 'lease': 11.0}
for u in SM['units']:
    a, b = u['x0'], u['x1']; ga, gb_ = a + 0.3, b - 0.3
    dx = u.get('door_x', DOORX.get(u['id'], (a + b) / 2)); dw = u.get('door_w', 1.0)
    # 玻璃（門的位置留開）、框
    for (p, q) in ((ga, dx - dw / 2), (dx + dw / 2, gb_)):
        if q - p > 0.1: gl2.quad([(q, 0.0, SFZ), (p, 0.0, SFZ), (p, GHs, SFZ), (q, GHs, SFZ)])
    n = max(1, int(round((gb_ - ga) / 2.4)))
    for kk in range(n + 1):
        xx = ga + (gb_ - ga) * kk / n
        if abs(xx - dx) > dw / 2 + 0.1: fr2.box(xx - 0.04, xx + 0.04, 0.0, GHs, SFZ - 0.06, SFZ + 0.05)
    for xx in (dx - dw / 2, dx + dw / 2): fr2.box(xx - 0.05, xx + 0.05, 0.0, GHs, SFZ - 0.06, SFZ + 0.06)
    fr2.box(ga, gb_, 0.0, 0.15, SFZ - 0.06, SFZ + 0.06); fr2.box(ga, gb_, GHs - 0.06, GHs + 0.04, SFZ - 0.06, SFZ + 0.06); fr2.box(dx - dw / 2, dx + dw / 2, 2.25, 2.33, SFZ - 0.06, SFZ + 0.06)
    if dw > 1.2:                                                                                                  # 雙開門（亞洲超市 1.8 m）
        gd2.quad([(dx + dw / 2, 0.0, SFZ - 0.02), (dx + 0.02, 0.0, SFZ - 0.02), (dx + 0.02, 2.25, SFZ - 0.02), (dx + dw / 2, 2.25, SFZ - 0.02)])
        gd2.quad([(dx - 0.02, 0.0, SFZ - 0.02), (dx - dw / 2, 0.0, SFZ - 0.02), (dx - dw / 2, 2.25, SFZ - 0.02), (dx - 0.02, 2.25, SFZ - 0.02)])
        fr2.box(dx - 0.03, dx + 0.03, 0.0, 2.25, SFZ - 0.06, SFZ + 0.02)
        for s_ in (-1, 1): fr2.box(dx + s_ * 0.12 - 0.015, dx + s_ * 0.12 + 0.015, 0.9, 1.25, SFZ - 0.12, SFZ - 0.06)   # 把手
    else:
        gd2.quad([(dx + dw / 2, 0.0, SFZ - 0.02), (dx - dw / 2, 0.0, SFZ - 0.02), (dx - dw / 2, 2.25, SFZ - 0.02), (dx + dw / 2, 2.25, SFZ - 0.02)])
        fr2.box(dx + dw / 2 - 0.16, dx + dw / 2 - 0.12, 0.85, 1.3, SFZ - 0.12, SFZ - 0.06)
    fr2.box(ga, gb_, GHs + 0.04, AY + 0.05, SFZ - 0.04, SFZ + 0.02)                                                  # 玻璃上面的橫楣（到雨遮）
    # 店內景（玻璃後 1.2 m）
    kind = u['kind']; tgt = itv if kind == 'vacant' else it2; uv = in_uv('vacant' if kind == 'vacant' else kind)
    (u0, v0), (u1, v1) = uv[0], uv[2]; w_ = gb_ - ga
    uv_quad(tgt, [(gb_, 0.0, SFZ + 1.2), (ga, 0.0, SFZ + 1.2), (ga, GHs + 0.3, SFZ + 1.2), (gb_, GHs + 0.3, SFZ + 1.2)], ((u0, v0), (u1, v0), (u1, v1), (u0, v1)))
    # 招牌帶（米色）＋燈箱
    sbd.box(a, b, AY + 0.05, PAR if u['kind'] != 'asian' else PAR + 1.0, SFZ - 0.02, SFZ + 0.3)
    if kind != 'vacant':
        nm_ = {'laundry': 'laundry', 'noodle': 'noodle', 'asian': 'asian'}[kind]; x0_, y0_, x1_, y1_ = SG['rects'][nm_]
        asp_ = (x1_ - x0_) / (y1_ - y0_); hh = 1.35 if kind != 'asian' else 1.9; ww = min(hh * asp_, (b - a) - 1.4); hh = ww / asp_
        cy_ = AY + 0.25 + (PAR + (1.0 if kind == 'asian' else 0.0) - AY - 0.25) / 2
        bz.box((a + b) / 2 - ww / 2 - 0.08, (a + b) / 2 + ww / 2 + 0.08, cy_ - hh / 2 - 0.08, cy_ + hh / 2 + 0.08, SFZ - 0.22, SFZ - 0.02)
        face_quad(lb, (a + b) / 2, cy_, SFZ - 0.22, ww, hh, math.pi, sg_uv(nm_), off=0.003)
# 磚壁柱（店與店之間、兩端）、女兒牆壓頂、側牆、屋頂
for xx in sorted(set([u['x0'] for u in SM['units']] + [X1s])):
    sb.box(xx - 0.3, xx + 0.3, 0.0, PAR + 0.1, SFZ - 0.12, SFZ + 0.4)
for u in SM['units']:
    top = PAR + (1.0 if u['kind'] == 'asian' else 0.0); bz.box(u['x0'], u['x1'], top, top + 0.12, SFZ - 0.1, SFZ + 0.35)
sb.box(X0s - 0.3, X0s, 0.0, PAR, SFZ, ZBs); sb.box(X1s, X1s + 0.3, 0.0, PAR, SFZ, ZBs); sb.box(X0s, X1s, 0.0, PAR, ZBs - 0.3, ZBs)
rf2 = Mesh('usms_shop_roof', M['membrane']); rf2.box(X0s, X1s, Hs - 0.1, Hs, SFZ + 0.3, ZBs - 0.3); rf2.finish(root)
# 騎樓雨遮：底板（嵌燈）、銅色封簷、磚柱
so2 = Mesh('usms_shop_soffit', M['soffit']); so2.box(X0s - 0.3, DR['x0'] - 0.4, AY - 0.12, AY, AZ0, SFZ); so2.finish(root)
bz.box(X0s - 0.35, DR['x0'] - 0.35, AY - 0.2, AY + 0.25, AZ0 - 0.1, AZ0 + 0.05)
for xx in SM['cols']: sb.box(xx - 0.28, xx + 0.28, 0.0, AY - 0.12, AZ0 + 0.18, AZ0 + 0.74)
for xx in [X0s + 2.0 + k * 4.0 for k in range(int((DR['x0'] - X0s - 2) / 4.0))]:
    lp_.cyl((xx, AY - 0.132, (AZ0 + SFZ) / 2), (xx, AY - 0.122, (AZ0 + SFZ) / 2), 0.13, seg=12)
# 麵店的 OPEN 霓虹、空店面的招租紙
neo = Mesh('usms_neon', M['signs_const']); face_quad(neo, -17.4, 1.55, SFZ - 0.08, 0.95, 0.48, math.pi, sg_uv('open'))
face_quad(neo, -31.0, 1.55, SFZ - 0.08, 0.95, 0.48, math.pi, sg_uv('open')); neo.finish(root, uv=False)
le = Mesh('usms_lease_paper', M['signs'])
for xx in (9.4, 12.6): face_quad(le, xx, 1.45, SFZ - 0.01, 0.85, 0.53, math.pi, sg_uv('lease'))
le.finish(root, uv=False)
sb.finish(root); sbd.finish(root); gl2.finish(root, uv=False); fr2.finish(root, uv=False); gd2.finish(root, uv=False)
it2.finish(root, uv=False); itv.finish(root, uv=False); lb.finish(root, uv=False)
lp_.finish(root, uv=False)
mt3 = Mesh('usms_shop_floor_dark', M['black']); mt3.box(X0s, X1s, -0.05, 0.01, SFZ, SFZ + 1.25); mt3.finish(root)

# ================= 小東西（燈桿、號誌、公車亭…）=================
pv = CMesh('usms_props', M['vc']); gv = Mesh('usms_galv_parts', M['galv']); br = Mesh('usms_bronze_parts', M['bronze'])
lamps = Mesh('GLOW_usms_lot_lamp', M['lamp']); sg2 = Mesh('usms_prop_signs', M['signs']); sgc = Mesh('usms_prop_signs_const', M['signs_const'])
srd = Mesh('usms_sig_red', M['sig_red']); sgn = Mesh('usms_sig_green', M['sig_green']); sof = Mesh('usms_sig_off', M['sig_off']); blk = Mesh('usms_black_parts', M['black'])
ch = Mesh('usms_cart_chrome', M['chrome']); rd = Mesh('usms_cart_handles', M['cartred']); wr = Mesh('usms_cart_baskets', M['wire'])
def wire_quad(pts, ru, rv): uv_quad(wr, pts, ((0, 0), (ru, 0), (ru, rv), (0, rv)))
def cart(x, z, yaw):
    """推車（照 us_market.py：鐵絲網籃＋鍍鉻管＋紅色把手＋四個輪子；籃子後低前高、往前收）"""
    c, s_ = math.cos(yaw), math.sin(yaw)
    def P(u, y, v): return (x + u * c + v * s_, y, z - u * s_ + v * c)
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
        for vv in (l0 - 0.02, l1 - 0.05): blk.cyl(P(side * 0.21, 0.06, vv), P(side * 0.21 + 0.001, 0.06, vv), 0.06, seg=10)
    rd.cyl(P(-hw0 - 0.02, yt + 0.06, l0 - 0.14), P(hw0 + 0.02, yt + 0.06, l0 - 0.14), 0.022, seg=8)
def R2(x, z, yaw, u, v):
    c, s_ = math.cos(yaw), math.sin(yaw); return (x + u * c + v * s_, z - u * s_ + v * c)
# 停車場燈桿（混凝土座、方管桿、雙燈頭）
for p in J['poles']:
    x_, z_ = p['x'], p['z']
    pv.crbox(x_ - 0.3, x_ + 0.3, 0.0, 0.75, z_ - 0.3, z_ + 0.3, '#b8b4ab', r=0.03, seg=1)
    br.box(x_ - 0.09, x_ + 0.09, 0.75, 9.6, z_ - 0.09, z_ + 0.09)
    for s_ in (-1, 1):
        br.box(x_ - 0.04, x_ + 0.04, 9.35, 9.45, z_ + s_ * 0.09, z_ + s_ * 0.95)
        br.rbox(x_ - 0.36, x_ + 0.36, 9.3, 9.45, z_ + s_ * 0.8, z_ + s_ * 1.4, r=0.02, seg=1); lamps.box(x_ - 0.3, x_ + 0.3, 9.29, 9.3, z_ + s_ * 0.85 - 0.0, z_ + s_ * 1.35)
for t in J['props']:
    ty = t['type']; x, z, yaw = t['x'], t['z'], t['yaw']
    if ty == 'street_lamp':   # 眼鏡蛇頭路燈：鍍鋅桿、彎臂伸向馬路、燈頭
        nx, nz = math.sin(yaw), math.cos(yaw)
        gv.cyl((x, 0.0, z), (x, 8.2, z), 0.11, seg=10, r2=0.07); gv.cyl((x, 7.9, z), (x + nx * 1.2, 8.55, z + nz * 1.2), 0.05, seg=6); gv.cyl((x + nx * 1.2, 8.55, z + nz * 1.2), (x + nx * 2.4, 8.7, z + nz * 2.4), 0.045, seg=6)
        hx, hz = x + nx * 2.75, z + nz * 2.75
        gv.ell((hx, 8.66, hz), 0.2 if abs(nz) > 0.5 else 0.36, 0.09, 0.36 if abs(nz) > 0.5 else 0.2, seg=10, rings=6)
        lamps.box(hx - (0.13 if abs(nz) > 0.5 else 0.26), hx + (0.13 if abs(nz) > 0.5 else 0.26), 8.565, 8.575, hz - (0.26 if abs(nz) > 0.5 else 0.13), hz + (0.26 if abs(nz) > 0.5 else 0.13))
        gv.cyl((x, 0.0, z), (x, 0.5, z), 0.2, seg=10, r2=0.14)
    elif ty == 'signal_mast':   # 號誌懸臂桿（路口遠側）：桿、往馬路伸的橫桿、兩組三燈（主幹道紅燈亮）、桿上一組給側邊車道（綠燈亮）、行人燈、路名牌
        nx, nz = math.sin(yaw), math.cos(yaw)
        gv.cyl((x, 0.0, z), (x, 7.2, z), 0.17, seg=12, r2=0.13); gv.cyl((x, 0.0, z), (x, 0.4, z), 0.3, seg=12, r2=0.22)
        gv.cyl((x, 6.3, z), (x + nx * 8.2, 6.3, z + nz * 8.2), 0.09, seg=8, r2=0.06); gv.cyl((x, 7.0, z), (x + nx * 3.6, 6.36, z + nz * 3.6), 0.03, seg=5)
        fx = 1 if nz > 0 else -1        # 燈面向 −fx（西北桿往南伸、燈面向東＝往西開過來的車；東南桿相反）
        for k_ in (0.42, 0.88):
            hx, hz = x + nx * 8.2 * k_, z + nz * 8.2 * k_
            blk.box(hx - 0.06, hx + 0.06, 6.0, 6.3, hz - 0.05, hz + 0.05)
            blk.box(hx - 0.17, hx + 0.17, 4.95, 6.0, hz - 0.17, hz + 0.17)
            blk.box(hx + fx * 0.17, hx + fx * 0.19, 4.8, 6.15, hz - 0.3, hz + 0.3)                                    # 背板
            for i_, mm in enumerate((srd, sof, sof)):
                yy = 5.8 - i_ * 0.33; mm.cyl((hx - fx * 0.17, yy, hz), (hx - fx * 0.2, yy, hz), 0.11, seg=12)
        hz0 = z + nz * 0.32                                                                                           # 桿上給側邊車道的一組（面向橫桿那一邊）
        blk.box(x - 0.17, x + 0.17, 3.4, 4.45, hz0 - 0.17, hz0 + 0.17)
        for i_, mm in enumerate((sof, sof, sgn)):
            yy = 4.25 - i_ * 0.33; mm.cyl((x, yy, hz0 + nz * 0.17), (x, yy, hz0 + nz * 0.2), 0.11, seg=12)
        hz1 = z - nz * 0.28                                                                                           # 行人燈（給斑馬線對面的人看：面向橫桿那一邊）
        blk.box(x - 0.24, x + 0.24, 2.3, 2.78, hz1 - 0.14, hz1 + 0.14); face_quad(sgc, x, 2.54, hz1, 0.38, 0.38, yaw, sg_uv('walk'), off=0.145)
        pv.cbox(x - 0.07, x + 0.07, 1.0, 1.2, z - nz * 0.2 - 0.04, z - nz * 0.2 + 0.04, '#e2c030')                 # 按鈕盒
        sx_, sz_ = x + nx * 5.0, z + nz * 5.0                                                                         # 路名牌（掛在橫桿上，兩面）
        gv.box(sx_ - 0.05, sx_ + 0.05, 6.38, 6.86, sz_ - 0.8, sz_ + 0.8)
        for yy_ in (math.pi / 2, -math.pi / 2): face_quad(sg2, sx_, 6.62, sz_, 1.6, 0.45, yy_, sg_uv('street'), off=0.06)
    elif ty == 'ped_signal':   # 行人號誌：短桿、黑盒、亮的走路人（朝馬路對面）
        gv.cyl((x, 0.0, z), (x, 3.0, z), 0.06, seg=8)
        nx, nz = math.sin(yaw), math.cos(yaw)
        blk.box(x - 0.24, x + 0.24, 2.3, 2.78, z + nz * 0.08 - 0.14, z + nz * 0.08 + 0.14)
        face_quad(sgc, x, 2.54, z + nz * 0.08, 0.38, 0.38, yaw, sg_uv('walk'), off=0.145)
        pv.cbox(x - 0.07, x + 0.07, 1.0, 1.2, z - nz * 0.1 - 0.04, z - nz * 0.1 + 0.04, '#e2c030')   # 按鈕盒
    elif ty == 'bus_shelter':
        S = J['bus']['shelter']; x0, x1, z0, z1 = S['x0'], S['x1'], S['z0'], S['z1']
        for (px_, pz_) in ((x0, z0), (x1, z0), (x0, z1), (x1, z1)): br.box(px_ - 0.04, px_ + 0.04, 0.0, 2.45, pz_ - 0.04, pz_ + 0.04)
        gl3 = Mesh('usms_shelter_glass', M['glass']); gl3.quad([(x1, 0.15, z0 + 0.02), (x0, 0.15, z0 + 0.02), (x0, 2.3, z0 + 0.02), (x1, 2.3, z0 + 0.02)])
        for xs_ in (x0, x1): gl3.quad([(xs_, 0.15, z0), (xs_, 0.15, z1 - 0.4), (xs_, 2.3, z1 - 0.4), (xs_, 2.3, z0)])
        gl3.finish(root, uv=False)
        br.box(x0 - 0.15, x1 + 0.15, 2.45, 2.55, z0 - 0.15, z1 + 0.3); br.box(x0, x1, 2.28, 2.32, z0, z0 + 0.06)
        pv.crbox(x0 + 0.4, x1 - 0.4, 0.42, 0.47, z0 + 0.12, z0 + 0.52, '#6a6e72', r=0.01, seg=1)
        for xx in (x0 + 0.6, x1 - 0.6): br.box(xx - 0.03, xx + 0.03, 0.0, 0.45, z0 + 0.2, z0 + 0.45)
        face_quad(sg2, x0 + 0.02, 1.4, (z0 + z1) / 2 - 0.2, 0.8, 1.0, math.pi / 2, sg_uv('route'), off=0.02)
        lamps.box(x0 + 0.5, x1 - 0.5, 2.43, 2.44, z0 + 0.4, z1 - 0.2)
    elif ty == 'bus_sign':
        gv.cyl((x, 0.0, z), (x, 3.0, z), 0.04, seg=8)
        for s_ in (1, -1): face_quad(sg2, x, 2.45, z, 0.45, 0.6, yaw if s_ > 0 else yaw + math.pi, sg_uv('bus'), off=0.03)
        gv.box(x - 0.02, x + 0.02, 2.13, 2.77, z - 0.24, z + 0.24) if abs(math.sin(yaw)) > 0.5 else gv.box(x - 0.24, x + 0.24, 2.13, 2.77, z - 0.02, z + 0.02)
    elif ty == 'cart_corral':   # 推車回收欄：鍍鋅管框＋藍牌＋推車
        Lc = 4.2 if t.get('carts', 3) > 3 else 3.0
        ax, az = (1, 0) if abs(math.sin(yaw)) > 0.7 else (0, 1)    # 長邊方向
        for s_ in (-1, 1):
            ox, oz = (0, s_ * 0.45) if ax else (s_ * 0.45, 0)
            p0 = (x - ax * Lc / 2 + ox, z - az * Lc / 2 + oz); p1 = (x + ax * Lc / 2 + ox, z + az * Lc / 2 + oz)
            for yy in (0.45, 0.95): gv.cyl((p0[0], yy, p0[1]), (p1[0], yy, p1[1]), 0.03, seg=6)
            for k_ in range(3):
                q = (p0[0] + (p1[0] - p0[0]) * k_ / 2, p0[1] + (p1[1] - p0[1]) * k_ / 2); gv.cyl((q[0], 0.0, q[1]), (q[0], 1.0, q[1]), 0.03, seg=6)
        ex, ez = (x + ax * Lc / 2, z + az * Lc / 2)
        gv.cyl((ex - (0 if ax else 0.45), 1.0, ez - (0.45 if ax else 0)), (ex + (0 if ax else 0.45), 1.0, ez + (0.45 if ax else 0)), 0.03, seg=6)
        gv.cyl((ex, 1.0, ez), (ex, 1.75, ez), 0.03, seg=6); face_quad(sg2, ex, 1.6, ez, 0.75, 0.24, math.pi / 2 if ax else 0.0, sg_uv('cart'), off=0.04)
        face_quad(sg2, ex, 1.6, ez, 0.75, 0.24, -math.pi / 2 if ax else math.pi, sg_uv('cart'), off=0.04)
        for k_ in range(t.get('carts', 3)):
            v_ = -Lc / 2 + 0.7 + k_ * 0.32
            cart(x + ax * v_, z + az * v_, (math.pi / 2 if ax else 0.0) + math.pi)
    elif ty == 'trash':
        pv.crbox(x - 0.3, x + 0.3, 0.0, 0.95, z - 0.3, z + 0.3, '#2c4a35', r=0.04, seg=1); pv.crbox(x - 0.33, x + 0.33, 0.95, 1.05, z - 0.33, z + 0.33, '#22382a', r=0.03, seg=1)
    elif ty == 'bollard':
        pv.cyl((x, 0.0, z), (x, 1.0, z), 0.15, seg=12); pv.paint(list(pv.bm.faces)[-14:], '#2c4a35'); pv.ell((x, 1.0, z), 0.15, 0.06, 0.15, seg=10, rings=4); pv.paint(list(pv.bm.faces)[-40:], '#2c4a35')
    elif ty == 'ice_chest':
        pv.crbox(x - 1.0, x + 1.0, 0.1, 1.25, z - 0.42, z + 0.42, '#f2f4f6', r=0.04, seg=1); pv.cbox(x - 1.0, x + 1.0, 0.0, 0.1, z - 0.4, z + 0.4, '#3a3c3e')
        face_quad(sg2, x, 0.72, z, 1.1, 0.68, 0.0, sg_uv('ice'), off=0.425)
    elif ty == 'propane_cage':
        pv.cbox(x - 0.8, x + 0.8, 0.0, 0.08, z - 0.45, z + 0.45, '#4a4c4e'); pv.cbox(x - 0.8, x + 0.8, 1.55, 1.62, z - 0.45, z + 0.45, '#4a4c4e')
        for (px_, pz_) in ((x - 0.8, z - 0.45), (x + 0.8, z - 0.45), (x - 0.8, z + 0.45), (x + 0.8, z + 0.45)): gv.box(px_ - 0.025, px_ + 0.025, 0.0, 1.62, pz_ - 0.025, pz_ + 0.025)
        for k_ in range(9): gv.box(x - 0.8 + k_ * 0.2 - 0.008, x - 0.8 + k_ * 0.2 + 0.008, 0.08, 1.55, z + 0.445, z + 0.455)
        for i_ in range(2):
            for k_ in range(4):
                cx_ = x - 0.56 + k_ * 0.37; yy = 0.08 + i_ * 0.74; pv.cyl((cx_, yy, z), (cx_, yy + 0.62, z), 0.16, seg=12); pv.paint(list(pv.bm.faces)[-14:], '#e8ecef' if (i_ + k_) % 3 else '#2f6fb5')
        face_quad(sg2, x, 1.85, z, 1.0, 0.31, 0.0, sg_uv('propane'), off=0.46)
        gv.box(x - 0.52, x + 0.52, 1.62, 2.02, z + 0.44, z + 0.455)
    elif ty == 'bench':
        nx, nz = math.sin(yaw), math.cos(yaw)
        for k_ in range(4): pv.crbox(x - 0.9, x + 0.9, 0.43, 0.46, z - nz * (0.2 - k_ * 0.13) - 0.05, z - nz * (0.2 - k_ * 0.13) + 0.05, '#2c4a35', r=0.01, seg=1) if abs(nz) > 0.5 else None
        for k_ in range(3): pv.crbox(x - 0.9, x + 0.9, 0.55 + k_ * 0.12, 0.6 + k_ * 0.12, z - nz * 0.3 - 0.03, z - nz * 0.3 + 0.03, '#2c4a35', r=0.01, seg=1)
        for e in (-0.75, 0.75): pv.cbox(x + e - 0.03, x + e + 0.03, 0.0, 0.43, z - 0.25, z + 0.25, '#232a26')
    elif ty == 'season_display':   # 季節陳列（季節網格，遊戲照日期開關）
        sm = CMesh('season_disp_summer_%d' % int(x), M['vc']); au = CMesh('season_disp_autumn_%d' % int(x), M['vc']); ba = CMesh('season_disp_bare_%d' % int(x), M['vc']); sn = CMesh('season_disp_snow_%d' % int(x), M['vc'])
        for k_ in range(3):                                                                                                 # 夏天：三層花架、盆花
            yy = 0.3 + k_ * 0.38; dz_ = -0.4 + k_ * 0.3; sm.cbox(x - 1.5, x + 1.5, yy - 0.03, yy, z + dz_ - 0.25, z + dz_ + 0.25, '#7a5a3e')
            for j in range(9):
                fx_ = x - 1.35 + j * 0.34; sm.cyl((fx_, yy, z + dz_), (fx_, yy + 0.14, z + dz_), 0.09, seg=8, r2=0.11); sm.paint(list(sm.bm.faces)[-10:], '#3a2a20')
                sm.ell((fx_, yy + 0.22, z + dz_), 0.13, 0.1, 0.13, seg=8, rings=4); sm.paint(list(sm.bm.faces)[-32:], rng.choice(['#d8384a', '#f0c030', '#e86aa0', '#f4f0e8', '#8a4ad0', '#ef7a2a']))
        for (ox, oz) in ((-1.0, 0.0), (0.0, 0.1), (1.0, -0.05)):                                                           # 秋天：木箱南瓜、菊花
            au.cbox(x + ox - 0.45, x + ox + 0.45, 0.0, 0.45, z + oz - 0.4, z + oz + 0.4, '#8a6a46')
            for j in range(5): au.ell((x + ox + rng.uniform(-0.28, 0.28), 0.55, z + oz + rng.uniform(-0.25, 0.25)), 0.17, 0.13, 0.17, seg=10, rings=6); au.paint(list(au.bm.faces)[-60:], rng.choice(['#e07a1e', '#d8661a', '#eb9a30', '#f2e8d0']))
        for ox in (-1.3, 1.3): au.ell((x + ox, 0.25, z + 0.55), 0.3, 0.25, 0.3, seg=10, rings=6); au.paint(list(au.bm.faces)[-60:], rng.choice(['#c8402a', '#e8c040', '#a03050']))
        for i_ in range(3):                                                                                                 # 初冬：柴薪、融雪鹽
            for j in range(4): ba.cyl((x - 1.4, 0.12 + i_ * 0.2, z - 0.3 + j * 0.2), (x - 0.6, 0.12 + i_ * 0.2, z - 0.3 + j * 0.2), 0.09, seg=7); ba.paint(list(ba.bm.faces)[-9:], '#7a5638')
        for i_ in range(3):
            for j in range(2): ba.crbox(x + 0.1 + j * 0.62, x + 0.68 + j * 0.62, i_ * 0.14, i_ * 0.14 + 0.13, z - 0.3, z + 0.3, '#2a6fb5' if (i_ + j) % 2 else '#e8ecef', r=0.03, seg=1)
        ba.cbox(x - 0.05, x + 1.45, 0.0, 0.0001, z - 0.4, z + 0.4, '#6a5a4a')
        for j in range(5):                                                                                                  # 雪天：一排聖誕樹靠在架子上
            tx_ = x - 1.3 + j * 0.65; sn.cyl((tx_, 0.0, z + 0.2), (tx_, 0.3, z + 0.2), 0.05, seg=6); sn.paint(list(sn.bm.faces)[-8:], '#5a4030')
            sn.cyl((tx_, 0.3, z + 0.2), (tx_, 1.9, z + 0.05), 0.42, seg=10, r2=0.04); sn.paint(list(sn.bm.faces)[-12:], rng.choice(['#1f4a2a', '#24502e', '#1c4426']))
        sn.cyl((x - 1.6, 1.4, z - 0.15), (x + 1.6, 1.4, z - 0.15), 0.03, seg=6); sn.paint(list(sn.bm.faces)[-8:], '#8a6a46')
        SEA.geo(root, 'disp_summer_%d' % int(x), 'summer', sm, uv=False); SEA.geo(root, 'disp_autumn_%d' % int(x), 'autumn', au, uv=False)
        SEA.geo(root, 'disp_bare_%d' % int(x), 'bare', ba, uv=False); SEA.geo(root, 'disp_snow_%d' % int(x), 'snow', sn, uv=False)
    elif ty == 'hydrant':
        pv.cyl((x, 0.0, z), (x, 0.62, z), 0.12, seg=12); pv.paint(list(pv.bm.faces)[-14:], '#b8302a'); pv.ell((x, 0.64, z), 0.13, 0.09, 0.13, seg=10, rings=4); pv.paint(list(pv.bm.faces)[-40:], '#b8302a')
        for (dx_, dz_) in ((0.16, 0), (-0.16, 0), (0, 0.16)): pv.cyl((x, 0.42, z), (x + dx_, 0.42, z + dz_), 0.05, seg=8); pv.paint(list(pv.bm.faces)[-10:], '#d8d4cc')
    elif ty == 'newsbox':
        pv.crbox(x - 0.25, x + 0.25, 0.0, 1.05, z - 0.22, z + 0.22, '#2a5ea8', r=0.02, seg=1); pv.cbox(x - 0.2, x + 0.2, 0.62, 0.95, z + 0.22, z + 0.23, '#cfd8e0')
    elif ty == 'planter':
        pv.crbox(x - 0.45, x + 0.45, 0.0, 0.6, z - 0.45, z + 0.45, '#b8b2a5', r=0.03, seg=1)
    elif ty == 'monument_sign':
        nx, nz = math.sin(yaw), math.cos(yaw); tx_, tz_ = math.cos(yaw), -math.sin(yaw)
        def MP(u, y, v): return (x + tx_ * u + nx * v, y, z + tz_ * u + nz * v)
        sbm = Mesh('usms_monument_brick', M['brick'], tile=1.2)
        rot = Matrix.Translation(g2b(x, 0, z)) @ Matrix.Rotation(yaw, 4, 'Z')
        bm_ = L.rbox_bm(2.8, 1.0, 0.7, r=0.03, seg=1); sbm.add_bm(bm_, rot @ Matrix.Translation(Vector((0, 0, 0.5)))); bm_.free()
        bm_ = L.rbox_bm(2.4, 2.4, 0.35, r=0.02, seg=1); br.add_bm(bm_, rot @ Matrix.Translation(Vector((0, 0, 2.2)))); bm_.free()
        bm_ = L.rbox_bm(2.6, 0.12, 0.5, r=0.02, seg=1); br.add_bm(bm_, rot @ Matrix.Translation(Vector((0, 0, 3.46)))); bm_.free()
        sbm.finish(root)
        mf = Mesh('usms_monument_face', M['signs_lit'])
        for s_ in (1, -1): face_quad(mf, x, 2.2, z, 2.25, 2.25, yaw if s_ > 0 else yaw + math.pi, sg_uv('plaza'), off=0.18)
        mf.finish(root, uv=False)
    elif ty == 'fire_sign':
        pass
# 消防車道告示（門前路緣兩支）
for x_ in (-7.0 - 3.0, 7.0 + 3.0):
    gv.cyl((x_, 0.0, LOT['z0'] - 0.45), (x_, 2.3, LOT['z0'] - 0.45), 0.03, seg=6); face_quad(sg2, x_, 1.95, LOT['z0'] - 0.45, 0.36, 0.45, 0.0, sg_uv('fire'), off=0.035)
# 無障礙車位立牌（車頭那端）
for s in [s for s in J['stalls'] if s.get('ada')]:
    zz = s['z'] + (SD / 2 - 0.1) * (1 if s['face'] > 0 else -1)
    gv.cyl((s['x'], 0.0, zz), (s['x'], 2.0, zz), 0.03, seg=6); face_quad(sg2, s['x'], 1.7, zz, 0.3, 0.38, math.pi if s['face'] > 0 else 0.0, sg_uv('ada'), off=0.035)
for m_ in (pv, gv, br, lamps, sg2, sgc, srd, sgn, sof, blk, ch, rd, wr): m_.finish(root, uv=False)

# ================= 樹、灌木 =================
trunk = Mesh('usms_trunks', L.flat('usms_bark', '#54473b', rough=0.9))
CARDS = [Mesh(f'usms_tree_cards_{k_}', m_) for k_, m_ in zip('abc', LEAF_T)]; cards = CARDS[0]
core = Mesh('usms_tree_core', L.flat('usms_tree_core', '#1c2a18', rough=0.98))
SEA.swap(CAR, bpy.data.materials['usms_tree_core'], 'autumn', L.flat('t', '#6a3422', rough=0.98))
twin = Mesh('usms_twig_inner', TWIG_IN); litm = Mesh('usms_leaf_litter', LITTER)
def leaf_card(m, px, py, pz, sz, yaw, tilt):
    ca, sa = math.cos(yaw), math.sin(yaw)
    def P(du, dv): return (px + ca * du, py + dv + tilt * du, pz + sa * du)
    f = m.bm.faces.new([m.bm.verts.new(g2b(*P(du, dv))) for (du, dv) in ((-sz / 2, -sz / 2), (sz / 2, -sz / 2), (sz / 2, sz / 2), (-sz / 2, sz / 2))])
    uvl = m.bm.loops.layers.uv.verify()
    for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
def litter(x, z, r, n):
    uvl = litm.bm.loops.layers.uv.verify()
    for k in range(n):
        a_ = rng.uniform(0, 2 * math.pi); d_ = r * math.sqrt(rng.uniform(0, 1)); sz = rng.uniform(1.0, 1.7); yaw = rng.uniform(0, math.pi)
        cx, cz = x + math.cos(a_) * d_, z + math.sin(a_) * d_; ca, sa = math.cos(yaw) * sz / 2, math.sin(yaw) * sz / 2
        f = litm.bm.faces.new([litm.bm.verts.new(g2b(cx + du * ca - dv * sa, 0.05, cz + du * sa + dv * ca)) for (du, dv) in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
        for lp, uv in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))): lp[uvl].uv = uv
def crown(cx, cy, cz, rx, ry, rz, ncard, csz, face=None):
    v0 = set(core.bm.verts)
    core.ell((cx, cy, cz), rx * 0.74, ry * 0.74, rz * 0.74, seg=8, rings=5)
    for vv in core.bm.verts:
        if vv not in v0:
            k = rng.uniform(0.88, 1.08); c0 = Vector(g2b(cx, cy, cz)); vv.co = c0 + (vv.co - c0) * k
    for j in range(ncard):
        a_ = rng.uniform(0, 2 * math.pi)
        if face is not None and math.cos(a_) * face[0] + math.sin(a_) * face[1] < -0.2: continue
        e_ = math.asin(rng.uniform(-0.85, 1.0)); rr = rng.uniform(0.72, 1.02)
        px, py, pz = cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_)
        leaf_card(cards, px, py, pz, csz * rng.uniform(0.8, 1.25), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
    for j in range(int(ncard * 0.3)):
        a_ = rng.uniform(0, 2 * math.pi); e_ = math.asin(rng.uniform(-0.6, 1.0)); rr = rng.uniform(0.2, 0.7)
        leaf_card(twin, cx + rx * rr * math.cos(a_) * math.cos(e_), cy + ry * rr * math.sin(e_), cz + rz * rr * math.sin(a_) * math.cos(e_), csz * rng.uniform(1.0, 1.5), rng.uniform(0, math.pi), rng.uniform(-0.6, 0.6))
def tree(x, z, h, big):
    global cards
    cards = CARDS[rng.randrange(3)]
    lean = (rng.uniform(-0.04, 0.04), rng.uniform(-0.04, 0.04)) if big else (0.0, 0.0)
    rb = rng.uniform(0.2, 0.32) if big else (0.11 if h > 6 else 0.07)
    bt = L.lathe([(rb * 1.35, 0.0), (rb, 0.35), (rb * 0.8, h * 0.4), (rb * 0.55, h * 0.62)], seg=9 if big else 7)
    sh_ = Matrix(((1, 0, lean[0]), (0, 1, -lean[1]), (0, 0, 1))).to_4x4()
    trunk.add_bm(bt, Matrix.Translation(g2b(x, 0, z)) @ sh_); bt.free()
    if big or h > 6:
        cr = h * 0.3; cy = h * 0.66
        for k in range(rng.randint(2, 3)):
            a_ = rng.uniform(0, 2 * math.pi); y0 = h * rng.uniform(0.38, 0.5)
            trunk.cyl((x + lean[0] * y0, y0, z + lean[1] * y0), (x + math.cos(a_) * cr * 0.6, cy + rng.uniform(-0.5, 1.0), z + math.sin(a_) * cr * 0.6), rb * 0.35, seg=6, r2=rb * 0.18)
        for k in range(rng.randint(4, 6)):
            a_ = rng.uniform(0, 2 * math.pi); d_ = cr * rng.uniform(0.2, 0.62); r_ = cr * rng.uniform(0.5, 0.72)
            crown(x + lean[0] * cy + math.cos(a_) * d_, cy + rng.uniform(-0.25, 0.4) * cr, z + lean[1] * cy + math.sin(a_) * d_, r_, r_ * 0.78, r_, int(9 * r_ * r_), 1.5)
    else:
        for k in range(3):
            a_ = k * 2.1 + rng.uniform(0, 0.6)
            crown(x + math.cos(a_) * 0.35, h * 0.74 + rng.uniform(-0.15, 0.25), z + math.sin(a_) * 0.35, 0.9, 0.8, 0.9, 30, 0.65)
for t in J['trees']:
    tree(t['x'], t['z'], t['h'], t['kind'] == 'big')
    litter(t['x'], t['z'], t['h'] * (0.3 if t['kind'] == 'big' else 0.22) + 0.6, 9 if t['kind'] == 'big' else 4)
gt = Mesh('usms_tree_grates', M['bronze'])
for t in [t for t in J['trees'] if t.get('grate')]:
    for k in range(7): gt.box(t['x'] - 0.6, t['x'] + 0.6, SW, SW + 0.012, t['z'] - 0.6 + k * 0.19, t['z'] - 0.55 + k * 0.19)
    gt.box(t['x'] - 0.62, t['x'] + 0.62, SW, SW + 0.015, t['z'] - 0.62, t['z'] - 0.58); gt.box(t['x'] - 0.62, t['x'] + 0.62, SW, SW + 0.015, t['z'] + 0.58, t['z'] + 0.62)
gt.finish(root, uv=False)
# 外圍樹林（走不到）：超市後面、小商店後面、東西兩端
def belt(pts, face):
    global cards
    for (x, z) in pts:
        cards = CARDS[rng.randrange(3)]
        h = rng.uniform(12, 17); r_ = rng.uniform(3.6, 5.0)
        trunk.cyl((x, 0, z), (x, h * 0.55, z), rng.uniform(0.18, 0.28), seg=6, r2=0.14)
        crown(x, h * 0.62, z, r_, h * 0.36, r_, int(4.5 * r_ * r_), 2.1, face)
        crown(x + rng.uniform(-1.5, 1.5), h * 0.85, z + rng.uniform(-1, 1), r_ * 0.65, h * 0.2, r_ * 0.65, int(2.0 * r_ * r_), 1.8, face)
belt([(x_, PB['back_z'] + rng.uniform(-2, 2)) for x_ in [X0p - 6 + k * 5.6 for k in range(10)]], (0, 1))           # 超市屋頂後面
belt([(x_, -34.0 + rng.uniform(-2, 2)) for x_ in [-60 + k * 5.4 for k in range(8)] + [32 + k * 5.4 for k in range(6)]], (0, 1))
belt([(x_, ZBs + 3.0 + rng.uniform(-1.5, 1.5)) for x_ in [X0s - 4 + k * 5.6 for k in range(10)]], (0, -1))          # 小商店後面
belt([(x_, 52.0 + rng.uniform(-2, 2)) for x_ in [-70 + k * 5.4 for k in range(7)] + [30 + k * 5.4 for k in range(8)]], (0, -1))
trunk.finish(root, uv=False)
for cm in CARDS: cm.finish(root, uv=False, merge=False)
SEA.geo(root, 'tree_core', 'summer,autumn', core, uv=False, smooth=True)
SEA.geo(root, 'twig_inner', 'bare,snow', twin, uv=False, merge=False)
SEA.geo(root, 'leaf_litter', 'autumn,bare', litm, uv=False, merge=False)
# 灌木（停車場南緣、分隔島、商店前的盆栽）：芯＋葉片卡（社區同一套）
sh = Mesh('usms_shrub_core', L.flat('usms_shrub_core', '#1e2d19', rough=0.98))
leaf_mat0 = PM['leaf_small'] if PL else L.flat('usms_leaf', '#4a6a3a', rough=0.8)
shc = Mesh('usms_shrub_cards', leaf_mat0)
SEA.swap(CAR, leaf_mat0, 'snow', SEA.leaf_mat('t', 'us_shrub_snow.png'))
SEA.swap(CAR, bpy.data.materials['usms_shrub_core'], 'snow', L.flat('t', '#b9c0c4', rough=0.9))
def shrub(x, z, r, y0=0.0):
    v0 = set(sh.bm.verts); sh.ell((x, y0 + r * 0.62, z), r * 0.7, r * 0.56, r * 0.66, seg=8, rings=5)
    for vv in sh.bm.verts:
        if vv not in v0: vv.co.x += rng.uniform(-0.05, 0.05); vv.co.y += rng.uniform(-0.05, 0.05); vv.co.z += rng.uniform(-0.04, 0.04)
    for j in range(24):
        a_ = rng.uniform(0, 2 * math.pi); e_ = rng.uniform(-0.1, 1.2); rr = r * rng.uniform(0.75, 1.05)
        leaf_card(shc, x + rr * math.cos(a_) * math.cos(e_), y0 + r * 0.7 + rr * 0.7 * math.sin(e_), z + rr * math.sin(a_) * math.cos(e_), 0.55 * rng.uniform(0.8, 1.2) * (r / 0.5), rng.uniform(0, math.pi), rng.uniform(-0.5, 0.5))
TREE_XZ = [(t['x'], t['z']) for t in J['trees']]
for (x0_, x1_) in STRIP_SEGS:
    x_ = x0_ + 0.7
    while x_ < x1_ - 0.6:
        if all(abs(x_ - tx) > 1.0 or abs((J['strip']['z0'] + J['strip']['z1']) / 2 - tz) > 1.0 for (tx, tz) in TREE_XZ): shrub(x_, (J['strip']['z0'] + J['strip']['z1']) / 2 + rng.uniform(-0.25, 0.25), rng.uniform(0.42, 0.6))
        x_ += rng.uniform(0.9, 1.3)
for (x0_, x1_) in ((-60.0, J['cross'][0]['x0'] - 1.0), (J['cross'][1]['x1'] + 1.0, 60.0)):
    x_ = x0_
    while x_ < x1_:
        shrub(x_, (med[0] + med[1]) / 2 + rng.uniform(-0.2, 0.2), rng.uniform(0.32, 0.45), CURB); x_ += rng.uniform(2.6, 3.6)
for p in [p for p in J['props'] if p['type'] == 'planter']: shrub(p['x'], p['z'], 0.42, 0.6)
sh.finish(root, uv=False, smooth=True); shc.finish(root, uv=False, merge=False)
# 雪天：剷到停車場角落、分隔島上的雪堆
snow = Mesh('usms_snow_piles', L.pbr('usms_snowpile', 'snow_02', tile=2.0, target='#e8ecf0', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.7))
for (x_, z_, r_) in ((-37.0, -14.5, 1.6), (37.0, -14.5, 1.6), (-37.0, 7.5, 1.4), (37.0, 7.5, 1.4), (-36.4, -3.5, 1.1), (36.4, -3.5, 1.1)):
    for k in range(3): snow.ell((x_ + rng.uniform(-0.6, 0.6), 0.0, z_ + rng.uniform(-0.6, 0.6)), r_ * rng.uniform(0.7, 1.0), r_ * 0.5, r_ * rng.uniform(0.7, 1.0), seg=10, rings=6)
SEA.geo(root, 'snow_piles', 'snow', snow, smooth=True)

# 純色材質合成頂點色（三組：霧面、金屬、亮面）：材質數和美國社區同一個量級；季節要換的、會亮的、有貼圖的不動
VC_METAL = L.vc_metal('usms_vc_metal', rough=0.42, metal=0.4); VC_GLOSS = L.vc_material('usms_vc_gloss', rough=0.35)
L.vc_consolidate(root, L.auto_vc_groups(root, M['vc'], VC_METAL, VC_GLOSS, protect={'usms_mulch', 'usms_tree_core', 'usms_shrub_core'}))
L.merge_by_material(root, keep=SEA.keep)
st_ = L.export(OUT, gpu_instances=False)
tris = 0
for ob in bpy.data.objects:
    if ob.type == 'MESH': ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
L.write_json(OUT[:-4] + '.json', dict(st_ if isinstance(st_, dict) else {}, tris_total=tris, layout='us_market_street.layout.json'))
print('us_market_street tris', tris)

if PREVIEW:   # 驗收渲染用：把車停進去（社區同一套做法）
    bpy.ops.import_scene.gltf(filepath=os.path.join(L.ROOT, 'assets/models/env/second_ai/us_cars.glb'))
    src = {o.name: o for o in bpy.data.objects if o.name.startswith('car_') and o.type == 'EMPTY'}
    cols = {}
    for c_ in J['cars']:
        s0 = src.get(c_['kind'])
        if s0 is None: continue
        e = bpy.data.objects.new('prev_' + c_['kind'], None); bpy.context.scene.collection.objects.link(e)
        e.location = (c_['x'], -c_['z'], 0.0); e.rotation_euler = (0, 0, c_['yaw'])
        for chh in s0.children:
            o = chh.copy(); bpy.context.scene.collection.objects.link(o); o.parent = e; o.matrix_parent_inverse.identity(); o.location = chh.location; o.rotation_euler = chh.rotation_euler
            if o.type == 'MESH' and o.data.materials and o.data.materials[0].name.startswith('car_paint'):
                k = c_['color']
                if k not in cols:
                    mt_ = o.data.materials[0].copy(); mt_.name = 'car_paint_' + k[1:]
                    bs = mt_.node_tree.nodes.get('Principled BSDF')
                    if bs: bs.inputs['Base Color'].default_value = tuple(B.srgb(k)) + (1.0,) if len(B.srgb(k)) == 3 else B.srgb(k)
                    cols[k] = mt_
                o.data = o.data.copy(); o.data.materials[0] = cols[k]
    for o in list(src.values()):
        for chh in list(o.children_recursive): bpy.data.objects.remove(chh, do_unlink=True)
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.ops.export_scene.gltf(filepath=PREVIEW, export_format='GLB', use_visible=False, export_extras=True)
    print('preview', PREVIEW)
