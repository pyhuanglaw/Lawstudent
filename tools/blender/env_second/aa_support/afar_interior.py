"""afar café（公館店面街 G07，取代「咖啡・輕食」）室內 → GLB（AA 2026-11-04；AA_650，使用者 11-04 新店名、02:2x 新版參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/afar_interior.py [-- --out assets/models/env/second_ai/aa_support/afar.glb]
配置只寫在 src/data/afar_layout.js。參考圖 docs/story_planning/ref_images/shops/gongguan_afar_int.webp。美術規則 SCENE_RULES §10～12。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py afr（afr_print.png：綠牆上的 afar 字、兩張山景畫、黑板菜單、豆袋標籤、雜誌封面）＋ yej（磨石子）；書背 shl_bookrows.png、窗景 mok_view.png。
胡桃木家具、米白牆＋深綠腰牆、淺灰磨石子（D112）、深綠隔牆、灰色布椅、黃銅檯燈、深綠搪瓷吊燈、外露天花板（管線、冷氣、軌道燈）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/afar_layout.js', 'AFAR_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('afr_', 'afar_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=1107)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books', 'view'}
P = 'afr_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_terrazzo', 'yej_terrazzo.png', rough=0.3, tile=1.0),
    'wall': CL.soft_plaster(P + 'wall_cream', '#eee6d6', 0.9, cull=True, tile=1.6, k=0.25),
    'wood': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#7a5236', maps=('diff',), res=256, rough_value=0.45),
    'glass': L.flat(P + 'glass', '#e2ecee', rough=0.05, alpha=0.14),
    'bulb': L.flat(P + 'bulb', '#fff4e0', rough=0.3, emit=B.srgb('#ffd59a')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.12),
    'print': K.img_mat(P + 'print', 'afr_print.png', rough=0.75),
    'books': K.img_mat(P + 'books', 'shl_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']
CC0 = '--nocc0' not in sys.argv   # SHOP-REALISM-1112（D159／D160／D161，LAWWW2-C 11-13）：CC0 材質組＋Poly Haven 掃描模型；--nocc0＝建原版（對照用）
if CC0:
    import cc0_aakit as cc0_kit   # noqa: E402（tools/blender/env_second/cc0_aakit.py）
    K0 = cc0_kit.Kit(L, B, sh.root, g2b, prefix=P)
    sh.M.update({
        'c_fabric': K0.acg(P + 'c_fabric', 'Fabric036', target='#727069', tile=0.45, rough_value=0.9, res=256),     # 灰色布椅
        'c_green': K0.acg(P + 'c_green', 'PaintedPlaster017', maps=('diff',), target='#3f4f40', tile=1.2, rough_value=0.7, res=256),   # 深綠腰牆、隔牆、搪瓷吊燈
        'c_brass': K0.acg(P + 'c_brass', 'Metal009', target='#b8944a', tile=0.6, metal=0.85, rough_value=0.35, res=256),
        'c_metal_dk': K0.acg(P + 'c_metal_dk', 'Metal009', maps=('diff',), target='#30302e', tile=0.8, metal=0.4, rough_value=0.45, res=256),   # 黑鐵、管線、軌道燈
        'c_steel': K0.acg(P + 'c_steel', 'Metal009', target='#b8b9b6', tile=0.8, metal=0.5, rough_value=0.35, res=256),   # 不鏽鋼（咖啡機、冰箱）
        'c_ceramic': K0.acg(P + 'c_ceramic', 'Plastic006', vary=0.05, target='#ece6da', tile=0.4, rough_value=0.25, res=256),   # 白瓷杯盤、白色花盆
        'c_stone': K0.acg(P + 'c_stone', 'PaintedPlaster017', maps=('diff',), target='#dcd6cc', tile=0.8, rough_value=0.4, res=256),   # 淺色石檯面
    })
    VC_ROUTE = {   # 頂點色 → 材質組 key（cc0_kit.split_vc：最接近的顏色，距離 < 26）
        '#6e4a30': 'wood', '#5c3d27': 'wood', '#6a4a2a': 'wood', '#5a3a22': 'wood', '#8a6a3a': 'wood', '#c9a77c': 'wood',
        '#6e6e68': 'c_fabric', '#7a7972': 'c_fabric',
        '#4a5a45': 'c_green', '#34443a': 'c_green', '#5e6c55': 'c_green',
        '#b8944a': 'c_brass', '#2e2e2e': 'c_metal_dk', '#b8bab8': 'c_steel', '#b8b8b4': 'c_steel',
        '#f2efe8': 'c_ceramic', '#e8e2d6': 'c_ceramic', '#e8e0d0': 'c_ceramic', '#e8e0cc': 'c_ceramic', '#f8eed6': 'c_ceramic', '#e8e4dc': 'c_ceramic',
        '#dcd6cc': 'c_stone',
    }
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
TB = {t['id']: t for t in LAY['tables']}
xf0 = Xf(0, 0); R = random.Random(1107)
WAL = '#6e4a30'; WAL2 = '#5c3d27'; GREY = '#6e6e68'; GREY2 = '#7a7972'; GREEN = '#4a5a45'; BRASS = '#b8944a'; STONE = '#dcd6cc'; STEEL = '#2e2e2e'


def wchair(x, z, yaw):
    """方桌的胡桃木椅：細腳、灰色布坐墊、兩根橫條的鏤空椅背（v1b，約 230 三角形）"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.19, 0.18), (0.19, 0.18), (-0.19, -0.18), (0.19, -0.18)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.43, sz * 0.95), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.21, 0.21, 0.39, 0.43, -0.2, 0.2, r=0.01, seg=1, col=WAL)
    xf.rbox(m, -0.2, 0.2, 0.43, 0.49, -0.19, 0.19, r=0.025, seg=2, col=GREY)
    for sx in (-0.19, 0.19): xf.cyl(m, (sx, 0.45, -0.19), (sx, 0.86, -0.22), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.2, 0.2, 0.6, 0.655, -0.215, -0.19, r=0.01, seg=1, col=WAL)                                  # 兩根橫條的鏤空椅背（v1b）
    xf.rbox(m, -0.21, 0.21, 0.77, 0.86, -0.235, -0.205, r=0.012, seg=1, col=WAL)


def uchair(x, z, yaw, arm=False):
    """窗邊長桌、靠牆小桌的灰色布面椅（整張包布、胡桃木細腳；arm＝扶手椅，椅背往兩邊包）"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.18, 0.17), (0.18, 0.17), (-0.18, -0.17), (0.18, -0.17)):
        xf.cyl(m, (sx * 1.1, 0.0, sz * 1.1), (sx, 0.42, sz), 0.016, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.22, 0.22, 0.4, 0.5, -0.21, 0.2, r=0.04, seg=2, col=GREY2)
    xf.rbox(m, -0.21, 0.21, 0.5, 0.92 if not arm else 0.8, -0.25, -0.18, r=0.05, seg=2, col=GREY)
    if arm:
        for sx in (-1, 1): xf.rbox(m, sx * 0.25 - 0.04, sx * 0.25 + 0.04, 0.45, 0.68, -0.22, 0.12, r=0.035, seg=2, col=GREY)


def brass_lamp(x, z, y, yaw=0.0, reach=0.18):
    """黃銅檯燈：圓座、細桿、彎臂、黃銅半球燈罩（燈泡發光）"""
    xf = Xf(x, z, yaw, y); m = sh.a('vcm')
    xf.lathe(m, [(0.0, 0.0), (0.07, 0.0), (0.07, 0.015), (0.0, 0.02)], 0, 0, 0, seg=12, col=BRASS)
    xf.cyl(m, (0, 0.015, 0), (0, 0.4, 0), 0.008, col=BRASS, seg=5, caps=False)
    xf.cyl(m, (0, 0.4, 0), (0, 0.42, reach), 0.007, col=BRASS, seg=5, caps=False)
    sx, sy, sz = xf.p(0, 0, reach)
    Xf(sx, sz, 0, y).lathe(m, [(0.012, 0.44), (0.03, 0.435), (0.08, 0.4), (0.095, 0.36), (0.09, 0.355)], 0, 0, 0, seg=14, col=BRASS)
    sh.a('bulb').sphere((sx, y + 0.38, sz), 0.03, seg=8, rings=5)
    CL.glow(sh.root, 'tablelamp', sx, y + 0.34, sz, color='rgba(255,200,130,1)', size=0.5, day=0.15, night=0.8)


def laptop(x, z, y, yaw=0.0):
    """筆電：底座＋立起來的螢幕（螢幕朝 +z）"""
    xf = Xf(x, z, yaw, y); m = sh.a('vcm')
    xf.rbox(m, -0.16, 0.16, 0.0, 0.012, -0.11, 0.11, r=0.004, seg=1, col='#b8bab8')
    xf.rbox(m, -0.16, 0.16, 0.012, 0.22, -0.125, -0.113, r=0.004, seg=1, col='#b8bab8')
    xf.rbox(sh.a('vcg'), -0.15, 0.15, 0.02, 0.21, -0.113, -0.111, r=0.002, seg=1, col='#dfe6ea')


def leafy(x, z, h=1.3, pot='#e8e2d6'):
    """闊葉的落地植物（高花盆＋兩叢葉片卡）"""
    if CC0:   # CC0：Poly Haven 落地盆栽（掃描）
        K0.ph_put('potted_plant_02', x, 0.0, z, (x * 5.1 + z) % 6.28, 1.0, share=False, height=h + 0.2, decimate=0.03, tag='_leafy'); return
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col=pot)
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)


def vase(x, z, y):
    """小玻璃花瓶＋幾枝白花"""
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.022, 0.13)], 0, 0, 0, seg=8)
    for j in range(5):
        a = j * 1.3; tx, tz = math.cos(a) * 0.05, math.sin(a) * 0.05
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.1, 0), (tx, y + 0.24 + (j % 2) * 0.05, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.008), (0.016, -0.003), (0.017, 0.0), (0.0, 0.006)], seg=5), '#f8f6ee'), Matrix.Translation(g2b(x + tx, y + 0.24 + (j % 2) * 0.05, z + tz)))


def book(x, z, y, col, w=0.15, d=0.21, t=0.03, yaw=0.0):
    Xf(x, z, yaw, y).rbox(sh.a('vc'), -w / 2, w / 2, 0.0, t, -d / 2, d / 2, r=0.003, seg=1, col=col)


# ---------------------------------------------------------------- 地板、外露天花板（管線、冷氣、軌道燈）、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=1.0).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for (zz, r_) in ((-2.6, 0.035), (-2.45, 0.022), (3.3, 0.022)):                                                            # 外露的細管線（米白漆，v1b 改細、貼天花板）
    xf0.cyl(sh.a('vcm'), (X0, H - 0.05, zz), (X1, H - 0.05, zz), r_, col='#e8e4dc', seg=8, caps=False)
xf0.rbox(sh.a('vcm'), 0.2, 1.3, H - 0.24, H - 0.01, -1.0, 0.1, r=0.02, seg=1, col='#ecebe6')                                 # 冷氣（嵌入式）
xf0.rbox(sh.a('vcm'), 0.35, 1.15, H - 0.245, H - 0.235, -0.85, -0.05, r=0.005, seg=1, col='#c8c8c4')
for zz in (2.6, -1.2):                                                                                                    # 兩條黑色軌道燈
    xf0.rbox(sh.a('vcm'), X0 + 0.5, X1 - 0.4, H - 0.06, H - 0.02, zz - 0.02, zz + 0.02, r=0.004, seg=1, col=STEEL)
    for k in range(7):
        x = X0 + 0.9 + k * (W - 1.5) / 6; sp = Xf(x, zz, 0.0)
        sp.cyl(sh.a('vcm'), (0, H - 0.06, 0), (0, H - 0.24, 0.05 if zz > 0 else -0.05), 0.032, col=STEEL, seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.24, 0.05 if zz > 0 else -0.05), sp.p(0, H - 0.245, 0.052 if zz > 0 else -0.052), 0.026, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.4, zz, color='rgba(255,220,170,1)', size=0.5, day=0.0, night=0.5)
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
ops = [(dx - dw / 2, dx + dw / 2, 0.0, dh, 'door')] + [(a, b, fr['sill'], fr['head'], 'win') for a, b in fr['windows']]
sh.wall_with_openings('front', ops, 'wall', 'wall', 0.0, 'wood', mull=1.1)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
xf0.rbox(sh.w('back', 'vc'), X0, X1, 0.0, 1.05, Z0, Z0 + 0.012, r=0.003, seg=1, col='#5e6c55')                              # 深綠腰牆（後牆、東牆、卡座那面西牆）
xf0.rbox(sh.w('back', 'vc'), X0, X1, 1.05, 1.08, Z0, Z0 + 0.02, r=0.003, seg=1, col=WAL)
xf0.rbox(sh.w('right', 'vc'), X1 - 0.012, X1, 0.0, 1.05, Z0, Z1, r=0.003, seg=1, col='#5e6c55')
xf0.rbox(sh.w('right', 'vc'), X1 - 0.02, X1, 1.05, 1.08, Z0, Z1, r=0.003, seg=1, col=WAL)
for (a, b) in fr['windows']: xf0.rbox(sh.w('front', 'wood'), a - 0.05, b + 0.05, fr['sill'] - 0.04, fr['sill'], Z1 - 0.22, Z1, r=0.006, seg=1)
xf0.rbox(sh.w('front', 'vc'), fr['windows'][0][0] - 0.05, fr['windows'][0][1] + 0.05, fr['head'], fr['head'] + 0.06, Z1 - 0.05, Z1, r=0.004, seg=1, col='#f3e6c8')   # 窗頂的燈條（參考圖窗上那一條暖光）
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(8.0, 5.5, vz), (-8.0, 5.5, vz), (-8.0, -1.0, vz), (8.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
sh.tally('shell')

# ---------------------------------------------------------------- 窗邊長桌（檯燈、筆電、書）
wc = IT['window_counter'][0]; wx0, wx1, wz0, wz1 = wc['x'] - wc['w'] / 2, wc['x'] + wc['w'] / 2, wc['z'] - wc['d'] / 2, wc['z'] + wc['d'] / 2
xf0.rbox(sh.a('wood'), wx0, wx1, wc['h'] - 0.045, wc['h'], wz0, wz1, r=0.008, seg=1)
xf0.rbox(sh.a('wood'), wx0, wx1, 0.0, wc['h'] - 0.045, wz1 - 0.06, wz1 - 0.02, r=0.006, seg=1)                             # 下面的擋板
for xx in (wx0 + 0.03, wx1 - 0.06): xf0.rbox(sh.a('wood'), xx, xx + 0.03, 0.0, wc['h'] - 0.045, wz0 + 0.02, wz1 - 0.02, r=0.004, seg=1)
xf0.rbox(sh.a('wood'), wx0, wx1, wc['h'], wc['h'] + 0.12, wz1 - 0.05, wz1, r=0.006, seg=1)                                 # 靠窗的小背板（插座）
for k in range(6): xf0.rbox(sh.a('vcm'), wx0 + 0.4 + k * 0.75, wx0 + 0.46 + k * 0.75, wc['h'] + 0.04, wc['h'] + 0.09, wz1 - 0.052, wz1 - 0.05, r=0.003, seg=1, col='#e8e4dc')
for s_ in LAY['seats']:
    if s_['table'] == 6: uchair(s_['x'], s_['z'] - 0.05, s_['yaw'])
for k in range(6): brass_lamp(wx0 + 0.25 + k * 0.8, wz1 - 0.12, wc['h'], yaw=math.pi, reach=0.2)                       # 每個位子一盞（v1b）
laptop(wx0 + 0.8, wc['z'] - 0.05, wc['h'], 0.0); laptop(wx0 + 2.6, wc['z'] - 0.05, wc['h'], 0.0)
K.mug(sh, wx0 + 1.2, wc['z'] - 0.05, wc['h'], col='#f2efe8'); K.mug(sh, wx0 + 3.0, wc['z'] - 0.1, wc['h'], col='#f2efe8')
book(wx0 + 1.5, wc['z'], wc['h'], '#e8e0cc'); book(wx0 + 1.5, wc['z'], wc['h'] + 0.03, '#6a7a5a'); book(wx0 + 3.8, wc['z'] - 0.02, wc['h'], '#e8e4d8')
Xf(wx0 + 2.1, wc['z'] - 0.05, 0, wc['h']).rbox(sh.a('vc'), -0.09, 0.09, 0.0, 0.05, -0.04, 0.04, r=0.02, seg=2, col='#3a3a38')   # 耳機（近似）
sh.plant(wx1 - 0.15, wc['z'] - 0.02, h=0.35, r=0.1, pot_col='#e8e2d6', y0=wc['h'])
sh.hanging_pothos('pothos', wx1 - 0.15, wc['h'] + 0.28, wc['z'] - 0.1, n=7, drop=0.7)
sh.tally('window')

# ---------------------------------------------------------------- 深綠隔牆、層板、afar 字、黑板、吧台
pt = IT['partition'][0]; px_ = pt['x']
xf0.rbox(sh.a('vc'), px_ - 0.08, px_, 0.0, H, pt['z0'], pt['z1'], r=0.004, seg=1, col=GREEN)
sh.img_quad(sh.a('print'), Xf(px_ + 0.004, 0.3, math.pi / 2), 0, 2.58, 0.0, 2.0, 1.0, K.cell_uv(0, 0, 2, 1))               # afar 字（底色＝綠牆）
br = IT['bar'][0]; bx0, bx1, bz0, bz1 = br['x'] - br['w'] / 2, br['x'] + br['w'] / 2, br['z'] - br['d'] / 2, br['z'] + br['d'] / 2
sz0, sz1 = -0.35, bz1 + 0.2
for (y, kind) in ((1.45, 'mug'), (1.85, 'jar'), (2.25, 'bag')):                                                         # 三層胡桃木層板
    xf0.rbox(sh.a('wood'), px_, px_ + 0.3, y - 0.035, y, sz0, sz1, r=0.004, seg=1)
    sh.a('bulb').box(px_ + 0.24, px_ + 0.26, y - 0.045, y - 0.035, sz0 + 0.05, sz1 - 0.05)
    n = 20 if kind != 'bag' else 14
    for row, dx_ in enumerate((0.08, 0.2)):                                                                                 # 前後兩排（v1b 塞滿）
        for k in range(n):
            zz = sz0 + 0.08 + k * (sz1 - sz0 - 0.16) / (n - 1) + (0.04 if row else 0.0)
            if kind == 'mug': K.mug(sh, px_ + dx_, zz, y, col=('#f2efe8', '#f2efe8', '#7a8a72', '#e8e0d0')[(k + row) % 4], r=0.04, h=0.09, handle=bool(row))
            elif kind == 'jar': K.jar(sh, px_ + dx_, zz, y, h=0.24 if row else 0.28, r=0.055, col=('#5a3a22', '#6a4a2a', '#4a3220', '#8a6a3a')[(k + row) % 4], lid='#2e2e2e')
            else:
                xf0.rbox(sh.a('vc'), px_ + dx_ - 0.05, px_ + dx_ + 0.05, y, y + 0.24, zz - 0.065, zz + 0.065, r=0.01, seg=1, col=('#c9a77c', '#b8966a')[row])
                if row: sh.img_quad(sh.a('print'), Xf(px_ + dx_ + 0.051, zz, math.pi / 2), 0, y + 0.06, 0.0, 0.11, 0.055, K.cell_uv(0, 1, 2, 1))
mb = IT['menu_board'][0]; sh.img_quad(sh.a('print'), Xf(px_ + 0.02, mb['z'], math.pi / 2), 0, mb['y'] - mb['h'] / 2, 0.0, mb['w'], mb['h'], K.cell_uv(6, 0, 2, 2))
xf0.rbox(sh.a('wood'), px_, px_ + 0.018, mb['y'] - mb['h'] / 2 - 0.03, mb['y'] + mb['h'] / 2 + 0.03, mb['z'] - mb['w'] / 2 - 0.03, mb['z'] + mb['w'] / 2 + 0.03, r=0.004, seg=1)
xf0.rbox(sh.a('wood'), bx0, bx1, 0.0, br['h'] - 0.05, bz0, bz1, r=0.01, seg=1)                                           # 吧台本體（胡桃木）
for k in range(26): zz = bz0 + 0.06 + k * (br['d'] - 0.12) / 25; xf0.rbox(sh.a('vc'), bx1, bx1 + 0.012, 0.08, br['h'] - 0.08, zz - 0.05, zz + 0.05, r=0.003, seg=1, col=WAL2)   # 直紋面板
Xf(br['x'], bz0, 0, 0.0).lathe(sh.a('vc'), [(0.0, 0.0), (br['w'] / 2, 0.0), (br['w'] / 2, br['h'] - 0.05), (0.0, br['h'] - 0.05)], 0, 0, 0, seg=20, col=WAL)   # 南端圓角
xf0.rbox(sh.a('vcg'), bx0 - 0.02, bx1 + 0.05, br['h'] - 0.05, br['h'], bz0, bz1 + 0.03, r=0.012, seg=1, col=STONE)        # 淺色石材檯面
Xf(br['x'] + 0.015, bz0, 0, br['h'] - 0.05).lathe(sh.a('vcg'), [(0.0, 0.0), (br['w'] / 2 + 0.04, 0.0), (br['w'] / 2 + 0.05, 0.025), (br['w'] / 2 + 0.04, 0.05), (0.0, 0.05)], 0, 0, 0, seg=20, col=STONE)
top = br['h']; cx = br['x']
em = Xf(cx - 0.05, 0.9, math.pi / 2, top); m = sh.a('vcm')                                                               # 濃縮咖啡機（朝 +x）
em.rbox(sh.a('vcg'), -0.48, 0.48, 0.0, 0.5, -0.26, 0.24, r=0.03, seg=2, col='#e6e6e4'); em.rbox(sh.a('vcg'), -0.48, 0.48, 0.5, 0.55, -0.26, 0.24, r=0.01, seg=1, col='#2e2e2e')   # v1b：大、亮面不鏽鋼
em.rbox(sh.a('vcg'), -0.46, 0.46, 0.1, 0.38, 0.24, 0.25, r=0.004, seg=1, col='#f4f4f2')
for k in range(3): em.cyl(m, (-0.28 + k * 0.28, 0.22, 0.25), (-0.28 + k * 0.28, 0.18, 0.33), 0.04, col='#2e2e2e', seg=8); em.cyl(m, (-0.28 + k * 0.28, 0.12, 0.3), (-0.28 + k * 0.28, 0.12, 0.38), 0.012, col='#2e2e2e', seg=4)
for k in range(8): K.mug(sh, cx - 0.17 + (k % 2) * 0.12, 0.5 + (k // 2) * 0.27, top + 0.55, col='#f2efe8', r=0.03, h=0.06, handle=False)
gx = Xf(cx - 0.1, 1.55, 0, top); gx.rbox(m, -0.09, 0.09, 0.0, 0.32, -0.09, 0.09, r=0.02, seg=1, col='#b8b8b4')                # 磨豆機
gx.lathe(sh.a('glass'), [(0.03, 0.32), (0.08, 0.5), (0.07, 0.52)], 0, 0, 0, seg=10)
for k in range(3):                                                                                                        # 手沖架三個濾杯
    zz = 0.15 - k * 0.2; Xf(cx + 0.1, zz, 0, top).cyl(m, (0, 0.0, 0), (0, 0.22, 0), 0.006, col=WAL2, seg=4, caps=False)
    Xf(cx + 0.1, zz, 0, top + 0.2).lathe(sh.a('vcg'), [(0.025, 0.0), (0.06, 0.07), (0.065, 0.075)], 0, 0, 0, seg=10, col='#f2efe8')
    Xf(cx + 0.1, zz, 0, top).lathe(sh.a('glass'), [(0.0, 0.0), (0.05, 0.0), (0.055, 0.1), (0.03, 0.14)], 0, 0, 0, seg=10)
pc0, pc1 = -1.05, -0.3                                                                                                   # 甜點櫃（玻璃；v1b 加高、木框、三層）
xf0.rbox(sh.a('wood'), cx - 0.26, cx + 0.32, top, top + 0.06, pc0, pc1, r=0.006, seg=1)
for (ax, az) in ((cx - 0.26, pc0), (cx + 0.29, pc0), (cx - 0.26, pc1 - 0.03), (cx + 0.29, pc1 - 0.03)): xf0.rbox(sh.a('wood'), ax, ax + 0.03, top + 0.06, top + 0.5, az, az + 0.03, r=0.003, seg=1)
xf0.rbox(sh.a('wood'), cx - 0.26, cx + 0.32, top + 0.5, top + 0.53, pc0, pc1, r=0.004, seg=1)
sh.a('glass').box(cx - 0.24, cx + 0.3, top + 0.06, top + 0.5, pc0 + 0.01, pc1 - 0.01); sh.a('bulb').box(cx - 0.2, cx + 0.26, top + 0.485, top + 0.495, pc0 + 0.03, pc1 - 0.03)
for y in (top + 0.2, top + 0.34): sh.a('glass').box(cx - 0.22, cx + 0.28, y, y + 0.01, pc0 + 0.02, pc1 - 0.02)
for row, y in enumerate((top + 0.06, top + 0.21, top + 0.35)):
    for k in range(5):
        zz = pc0 + 0.09 + k * 0.14; Xf(cx + 0.05, zz, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.045, 0.0), (0.045, 0.05), (0.03, 0.065), (0.0, 0.07)], 0, 0, 0, seg=8, col=('#f0d890', '#d9a86a', '#f4ecd8', '#c98a5a', '#e8c0a0')[(k + row) % 5])
Xf(cx, -1.15, math.pi / 2, top).rbox(m, -0.15, 0.15, 0.0, 0.08, -0.12, 0.12, r=0.01, seg=1, col='#2e2e2e')                  # 收銀機
Xf(cx, -1.15, math.pi / 2, top).quad(m, [(-0.13, 0.08, -0.05), (0.13, 0.08, -0.05), (0.13, 0.26, -0.1), (-0.13, 0.26, -0.1)])
for k, zz in enumerate((-0.55, 0.3, 1.15)): K.dome_pendant(sh, cx + 0.45, zz, 2.3, r=0.26, col='#34443a', inner='#f8eed6', kind='dome', glow_size=0.8)   # v1b：放低、往吧台前面移，進鏡頭
ss = IT['side_station'][0]; sx0, sx1, sz0_, sz1_ = ss['x'] - ss['w'] / 2, ss['x'] + ss['w'] / 2, ss['z'] - ss['d'] / 2, ss['z'] + ss['d'] / 2   # 門邊的咖啡工作檯（v1c）
xf0.rbox(sh.a('wood'), sx0, sx1, 0.0, ss['h'] - 0.04, sz0_, sz1_, r=0.01, seg=1)
xf0.rbox(sh.a('vcg'), sx0 - 0.03, sx1, ss['h'] - 0.04, ss['h'], sz0_ - 0.02, sz1_ + 0.02, r=0.01, seg=1, col=STONE)
e2 = Xf(ss['x'] + 0.02, ss['z'] + 0.25, -math.pi / 2, ss['h']); e2.rbox(sh.a('vcg'), -0.3, 0.3, 0.0, 0.42, -0.2, 0.18, r=0.03, seg=2, col='#e6e6e4'); e2.rbox(sh.a('vcg'), -0.3, 0.3, 0.42, 0.46, -0.2, 0.18, r=0.01, seg=1, col='#2e2e2e')
for k in range(2): e2.cyl(sh.a('vcm'), (-0.12 + k * 0.24, 0.2, 0.18), (-0.12 + k * 0.24, 0.16, 0.25), 0.035, col='#2e2e2e', seg=8)
g2 = Xf(ss['x'] + 0.05, ss['z'] - 0.45, 0, ss['h']); g2.rbox(sh.a('vcm'), -0.08, 0.08, 0.0, 0.3, -0.08, 0.08, r=0.02, seg=1, col='#b8b8b4'); g2.lathe(sh.a('glass'), [(0.03, 0.3), (0.075, 0.46), (0.065, 0.48)], 0, 0, 0, seg=10)
for k in range(4): K.mug(sh, ss['x'] - 0.12, ss['z'] - 0.75 + k * 0.1, ss['h'], col='#f2efe8', r=0.03, h=0.07, handle=False)
for (y, kind) in ((1.55, 'jar'), (1.95, 'bag')):
    xf0.rbox(sh.a('wood'), X1 - 0.28, X1, y - 0.035, y, sz0_, sz1_, r=0.004, seg=1); sh.a('bulb').box(X1 - 0.26, X1 - 0.24, y - 0.045, y - 0.035, sz0_ + 0.05, sz1_ - 0.05)
    for k in range(9):
        zz = sz0_ + 0.1 + k * (ss['d'] - 0.2) / 8
        if kind == 'jar': K.jar(sh, X1 - 0.14, zz, y, h=0.22, r=0.055, col=('#5a3a22', '#6a4a2a', '#f2efe8')[k % 3], lid='#2e2e2e')
        else:
            xf0.rbox(sh.a('vc'), X1 - 0.2, X1 - 0.08, y, y + 0.24, zz - 0.065, zz + 0.065, r=0.01, seg=1, col='#c9a77c')
            sh.img_quad(sh.a('print'), Xf(X1 - 0.201, zz, -math.pi / 2), 0, y + 0.06, 0.0, 0.11, 0.055, K.cell_uv(0, 1, 2, 1))
K.dome_pendant(sh, ss['x'] - 0.35, ss['z'], 2.3, r=0.22, col='#34443a', inner='#f8eed6', kind='dome', glow_size=0.7)
sh.hanging_pothos('pothos', X1 - 0.14, 2.0, sz1_ - 0.1, n=8, drop=0.8)
sh.tally('bar')

# ---------------------------------------------------------------- 書架（書、雜誌斜架、黃金葛）
bc = IT['bookshelf'][0]; bxf = Xf(bc['x'], bc['z'], bc['ry']); wm = sh.a('wood'); bw_, bd_, bh_ = bc['w'], bc['d'], bc['h']
bxf.rbox(wm, -bw_ / 2, bw_ / 2, 0.0, bh_, -bd_ / 2, -bd_ / 2 + 0.02, r=0.003, seg=1)
for u in (-bw_ / 2, bw_ / 2): bxf.rbox(wm, u - 0.02, u + 0.02, 0.0, bh_, -bd_ / 2, bd_ / 2, r=0.004, seg=1)
for q, y in enumerate((0.06, 0.95, 1.35, 1.75, 2.27)):
    bxf.rbox(wm, -bw_ / 2, bw_ / 2, y - 0.02, y + 0.01, -bd_ / 2, bd_ / 2, r=0.003, seg=1)
    if q >= 1 and y < 2.2: K.book_rows(sh, 'books', bxf, -bw_ / 2 + 0.03, bw_ / 2 - 0.03, y + 0.01, bd_ / 2 - 0.04, hgt=0.3, depth=0.2, rng=R)
for r_, y in enumerate((0.12, 0.5)):                                                                                       # 下面兩層雜誌斜架
    bxf.rbox(wm, -bw_ / 2, bw_ / 2, y, y + 0.03, bd_ / 2 - 0.06, bd_ / 2 - 0.02, r=0.003, seg=1)
    for k in range(3): sh.img_quad(sh.a('print'), bxf, -0.34 + k * 0.34, y + 0.02, bd_ / 2 - 0.07, 0.26, 0.32, K.cell_uv(r_ * 3 + k, 2, 1, 1), tilt=0.25)
sh.plant(*bxf.p(-0.2, 0, 0.0)[::2], h=0.35, r=0.1, pot_col='#e8e0d0', y0=bh_ + 0.01)
sh.hanging_pothos('pothos', *bxf.p(0.25, bh_ + 0.05, 0.05), n=9, drop=0.9)
sh.tally('bookshelf')

# ---------------------------------------------------------------- 中間的胡桃木方桌、靠牆小桌、卡座
for tid, t in TB.items():
    if t['kind'] == 'round': K.round_table(sh, t['x'], t['z'], r=t['r'], h=0.72, top_key='wood', base_col=STEEL)
    else: K.rect_table(sh, t['x'], t['z'], 0.0, t['w'], t['d'], h=0.75, top_key='wood', leg_key='wood', leg='wood')
    for s_ in LAY['seats']:
        if s_['table'] == tid and not s_.get('seatH'): wchair(s_['x'] + math.sin(s_['yaw']) * -0.04, s_['z'] + math.cos(s_['yaw']) * -0.04, s_['yaw'])
th = 0.75
for tid, things in ((1, ('mug', 'book', 'note', 'phones')), (2, ('mug', 'laptop', 'vase')), (3, ('book', 'vase'))):
    t = TB[tid]
    if 'mug' in things: K.mug(sh, t['x'] + 0.15, t['z'] - 0.25, th, col='#f2efe8')
    if 'book' in things: book(t['x'] + 0.1, t['z'] - 0.05, th, '#3f5a46', w=0.14, d=0.2, t=0.035)
    if 'note' in things: xf0.rbox(sh.a('vc'), t['x'] - 0.15, t['x'] + 0.15, th, th + 0.008, t['z'] + 0.05, t['z'] + 0.3, r=0.002, seg=1, col='#f4efe2')
    if 'phones' in things: Xf(t['x'] - 0.05, t['z'] + 0.38, 0, th).rbox(sh.a('vc'), -0.09, 0.09, 0.0, 0.05, -0.04, 0.04, r=0.02, seg=2, col='#e8e4dc')
    if 'laptop' in things: laptop(t['x'] - 0.05, t['z'] + 0.05, th, math.pi / 2)
    if 'vase' in things: vase(t['x'] - 0.1, t['z'] - 0.3, th)
for d_ in IT['wall_desk']:                                                                                               # 靠牆小桌（胡桃木＋黑鐵腳）、扶手椅、黃銅檯燈
    K.rect_table(sh, d_['x'], d_['z'], 0.0, d_['w'], d_['d'], h=0.75, top_key='wood', leg_key='vcm', leg_col=STEEL, leg='steel')
    brass_lamp(d_['x'] + 0.38, d_['z'] - 0.12, 0.75, yaw=0.0, reach=0.16)
for s_ in LAY['seats']:
    if s_['table'] in (7, 8, 9, 10): uchair(s_['x'], s_['z'], s_['yaw'], arm=True)
laptop(1.8, -3.72, th, math.pi); book(0.0, -3.7, th, '#e8e0cc'); K.mug(sh, -1.6, -3.65, th, col='#f2efe8'); K.mug(sh, 3.4, -3.6, th, col='#f2efe8')
for p_ in IT['painting']:
    sh.wall_img(p_['side'], 'print', p_['along'], p_['y'], p_['w'], p_['h'], K.cell_uv(2 if p_['along'] > 1.5 else 4, 0, 2, 2), off=0.02)
    xf0.rbox(sh.w('back', 'wood'), p_['along'] - p_['w'] / 2 - 0.03, p_['along'] + p_['w'] / 2 + 0.03, p_['y'] - p_['h'] / 2 - 0.03, p_['y'] + p_['h'] / 2 + 0.03, Z0, Z0 + 0.018, r=0.004, seg=1)
for bs in IT.get('back_shelf', []):                                                                                       # 後牆的開放層板（v1d，窗卡的視線裡）
    for (y, kind) in ((1.6, 'jar'), (2.05, 'bag')):
        xf0.rbox(sh.w('back', 'wood'), bs['x0'], bs['x1'], y - 0.035, y, Z0, Z0 + 0.28, r=0.004, seg=1)
        sh.a('bulb').box(bs['x0'] + 0.05, bs['x1'] - 0.05, y - 0.045, y - 0.035, Z0 + 0.24, Z0 + 0.26)
        n = int((bs['x1'] - bs['x0']) / 0.15)
        for k in range(n):
            xx = bs['x0'] + 0.1 + k * (bs['x1'] - bs['x0'] - 0.2) / (n - 1)
            if k % 5 == 2: sh.plant(xx, Z0 + 0.14, h=0.3, r=0.07, pot_col='#e8e2d6', y0=y); continue
            if kind == 'jar': K.jar(sh, xx, Z0 + 0.14, y, h=0.22, r=0.055, col=('#5a3a22', '#6a4a2a', '#f2efe8', '#8a6a3a')[k % 4], lid='#2e2e2e')
            else:
                xf0.rbox(sh.a('vc'), xx - 0.06, xx + 0.06, y, y + 0.24, Z0 + 0.08, Z0 + 0.2, r=0.01, seg=1, col='#c9a77c')
                sh.img_quad(sh.a('print'), Xf(xx, Z0 + 0.201, 0.0), 0, y + 0.06, 0.0, 0.1, 0.05, K.cell_uv(0, 1, 2, 1))
    for xx in (bs['x0'] + 0.05, bs['x1'] - 0.05): xf0.cyl(sh.w('back', 'vcm'), (xx, 1.57, Z0 + 0.2), (xx, H, Z0 + 0.2), 0.008, col='#2e2e2e', seg=4, caps=False)
    K.dome_pendant(sh, (bs['x0'] + bs['x1']) / 2, Z0 + 0.75, 2.35, r=0.22, col='#34443a', inner='#f8eed6', kind='dome', glow_size=0.7)
    sh.hanging_pothos('pothos', bs['x1'] - 0.2, 2.1, Z0 + 0.14, n=8, drop=0.7)
bq = IT['banquette'][0]; qz0, qz1 = bq['z'] - bq['d'] / 2, bq['z'] + bq['d'] / 2
xf0.rbox(sh.a('wood'), X0, X0 + bq['w'], 0.0, 0.38, qz0, qz1, r=0.012, seg=1)
xf0.rbox(sh.a('vcg'), X0 + 0.1, X0 + bq['w'] + 0.02, 0.38, 0.47, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col='#8a8e88')
for k in range(5): xf0.rbox(sh.a('vcg'), X0 + 0.02, X0 + 0.15, 0.47, 1.0, qz0 + 0.04 + k * (bq['d'] - 0.08) / 5, qz0 + 0.04 + (k + 1) * (bq['d'] - 0.08) / 5 - 0.01, r=0.04, seg=2, col='#7e837e')   # 直條紋靠背
sh.tally('seating')

for p_ in IT['plant_big']: leafy(p_['x'], p_['z'], h=1.4)
if CC0:   # 頂點色零件照顏色分到材質組；表上沒有的顏色（葉子、書、小東西）照舊頂點色
    VCK = ('vc', 'vcm', 'vcg')
    mv = K0.split_vc([m for (k_, l_), m in list(sh._acc.items()) if k_ in VCK], VC_ROUTE, lambda vm, key: sh.a(key, vm.lvl))
    for side_ in list(sh.walls):
        mv2 = K0.split_vc([m for k_, m in list(sh.walls[side_].items()) if k_ in VCK], VC_ROUTE, lambda vm, key, sd=side_: sh.w(sd, key))
        for k_, n_ in mv2.items(): mv[k_] = mv.get(k_, 0) + n_
    print('CC0 split_vc', mv)
    K0.cleanup()
info = sh.finish(OUT, extra_info={'layout': LAY['version'], 'seats': len(LAY['seats'])})
