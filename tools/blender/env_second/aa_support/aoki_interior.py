"""青木茶室（公館店面街 G01，取代清葉茶行）室內 → GLB（AA 2026-11-04；AA_647，使用者 11-04 新店名、新室內圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/aoki_interior.py [-- --out assets/models/env/second_ai/aa_support/aoki.glb]
配置只寫在 src/data/aoki_layout.js。參考圖 docs/story_planning/ref_images/shops/gongguan_tea_int.webp。美術規則 SCENE_RULES §10～12。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py aok（aok_print.png：店名、山景畫、茶罐標籤、茶包、黑板）＋ yej（yej_terrazzo.png 磨石子）；書背 shl_bookrows.png、窗景 mok_view.png。
淺色橡木、米白灰泥牆、淺色磨石子（D112）、綠色長條磁磚、深綠茶罐、紙燈籠、條紋玻璃吊燈、淺木條天花板＋軌道燈。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/aoki_layout.js', 'AOKI_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('aok_', 'aoki_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=1105)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books', 'view'}
P = 'aok_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_terrazzo', 'yej_terrazzo.png', rough=0.35, tile=1.0),
    'wall': CL.soft_plaster(P + 'wall_cream', '#efe8da', 0.9, cull=True, tile=1.6, k=0.25),
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=1.2, target='#d2ad7e', maps=('diff',), res=256, rough_value=0.5),
    'glass': L.flat(P + 'glass', '#e2ecee', rough=0.05, alpha=0.14),
    'bulb': L.flat(P + 'bulb', '#fff4e0', rough=0.3, emit=B.srgb('#ffd59a')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.12),
    'print': K.img_mat(P + 'print', 'aok_print.png', rough=0.75),
    'books': K.img_mat(P + 'books', 'shl_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件照顏色換成 ambientCG 材質組、植物／茶具／熱水壺換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
import cc0_kit   # noqa: E402
CK = cc0_kit.Kit(sh.root, P[:-1])
sh.M.update({
    'oakcg': CK.acg(P + 'oak_cc0', 'Wood049', target='#c39a69', tile=0.7, rough_value=0.55),
    'traywood': CK.acg(P + 'tray_walnut', 'Wood066', target='#6a4a2a', tile=0.5, rough_value=0.45),
    'fab_cream': CK.acg(P + 'fabric_cream', 'Fabric030', target='#e6ddcc', tile=0.35, rough_value=0.9),
    'fab_oat': CK.acg(P + 'fabric_oat', 'Fabric030', target='#b8c4a8', tile=0.35, rough_value=0.9),
    'fab_sage': CK.acg(P + 'fabric_sage', 'Fabric030', target='#7d9a7e', tile=0.35, rough_value=0.85),
    'kraft': CK.acg(P + 'kraft', 'Cardboard004', target='#c9a77c', vary=0.12, tile=0.35, rough_value=0.8),
    'paper_g': CK.acg(P + 'giftbox_green', 'Paper001', target='#4a6542', vary=0.3, tile=0.3, rough_value=0.6),
    'stone': CK.acg(P + 'stone_top', 'Marble012', target='#ece7de', vary=0.35, tile=1.2, rough_value=0.3),
    'ceramic': CK.acg(P + 'ceramic', 'Plastic006', target='#f2eee6', vary=0.05, tile=0.4, rough_value=0.2),
    'celadon': CK.acg(P + 'celadon', 'Plastic006', target='#9ab0a0', vary=0.05, tile=0.4, rough_value=0.2),
    'tin': CK.acg(P + 'tin', 'Metal009', target='#34503c', vary=0.2, tile=0.3, metal=0.3, rough_value=0.35),
    'tile_a': CK.acg(P + 'tile_green_a', 'Plastic006', target='#7f9c80', vary=0.05, tile=0.25, rough_value=0.15),
    'tile_b': CK.acg(P + 'tile_green_b', 'Plastic006', target='#77927a', vary=0.05, tile=0.25, rough_value=0.15),
    'steel': CK.acg(P + 'steel', 'Metal009', target='#c8c8c4', vary=0.3, tile=0.4, metal=0.6, rough_value=0.35),
})
sh.route({'#b98d5c': 'oakcg', '#a87a4a': 'oakcg', '#b0814f': 'oakcg', '#6a4a2a': 'traywood',
          '#e6ddcc': 'fab_cream', '#e8e0cc': 'fab_cream', '#b8c4a8': 'fab_oat', '#7d9a7e': 'fab_sage',
          '#c9a77c': 'kraft', '#4f6b45': 'paper_g', '#3f5a46': 'paper_g', '#ece7de': 'stone', '#e2dcd0': 'stone',
          '#f4f1ea': 'ceramic', '#f4f0e6': 'ceramic', '#e8dcc8': 'ceramic', '#9ab0a0': 'celadon', '#34503c': 'tin',
          '#7a957a': 'tile_a', '#829f82': 'tile_a', '#76917a': 'tile_b', '#c8c8c4': 'steel', '#e8e8e4': 'steel'})
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
TB = {t['id']: t for t in LAY['tables']}
xf0 = Xf(0, 0); R = random.Random(1105); OAK = '#b98d5c'; STOOL = '#a87a4a'; CREAM = '#e6ddcc'; SAGE = '#7d9a7e'


def chair(x, z, yaw):
    """參考圖的布面椅：淺橡木框（腳、坐框、靠背上緣）、米白布面坐墊和靠背（約 260 三角形）"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.19, 0.18), (0.19, 0.18), (-0.19, -0.18), (0.19, -0.18)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.96, 0.43, sz * 0.96), 0.017, col=OAK, seg=5, caps=False)
    xf.rbox(m, -0.21, 0.21, 0.38, 0.43, -0.2, 0.2, r=0.01, seg=1, col=OAK)                                   # 坐框
    xf.rbox(m, -0.2, 0.2, 0.43, 0.5, -0.19, 0.19, r=0.03, seg=2, col=CREAM)
    for sx in (-0.19, 0.19): xf.cyl(m, (sx, 0.45, -0.19), (sx, 0.86, -0.23), 0.017, col=OAK, seg=5, caps=False)
    xf.rbox(m, -0.18, 0.18, 0.56, 0.8, -0.245, -0.195, r=0.025, seg=2, col=CREAM)
    xf.rbox(m, -0.21, 0.21, 0.8, 0.86, -0.25, -0.2, r=0.01, seg=1, col=OAK)                                  # 靠背上緣


def wstool(x, z, h=0.72):
    """參考圖的木高腳椅：圓木坐面、四支外八的腳、一圈腳踏（約 220 三角形）"""
    xf = Xf(x, z, 0.0); m = sh.a('vc')
    xf.lathe(m, [(0.0, h - 0.04), (0.17, h - 0.04), (0.18, h - 0.01), (0.17, h + 0.005), (0.0, h + 0.01)], 0, 0, 0, seg=14, col=OAK)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        xf.cyl(m, (c * 0.2, 0.0, s_ * 0.2), (c * 0.12, h - 0.04, s_ * 0.12), 0.02, col=STOOL, seg=5, caps=False)
        b = a + math.pi / 2; xf.cyl(m, (c * 0.17, 0.26, s_ * 0.17), (math.cos(b) * 0.17, 0.26, math.sin(b) * 0.17), 0.012, col=STOOL, seg=4, caps=False)


def leafy(x, z, h=1.3):
    """闊葉的落地植物：Poly Haven potted_plant_01（掃描；SHOP-CC0-HELP-1113，取代原本的花盆＋葉片卡）"""
    CK.ph_put('potted_plant_01', x, 0.0, z, yaw=R.uniform(0, 6.28), share=False, height=h, decimate=0.006)
    return
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col=R.choice(['#e8e0d0', '#d8d0c0']))
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)


def vase(x, z, y, col='#f4f0e6'):
    """小白瓷花瓶（Poly Haven ceramic_vase_03，掃描）＋幾枝白花"""
    CK.ph_put('ceramic_vase_03', x, y, z, yaw=R.uniform(0, 6.28), height=0.13, decimate=0.03)
    for j in range(5):
        a = j * 1.3; tx, tz = math.cos(a) * 0.05, math.sin(a) * 0.05
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.12, 0), (tx, y + 0.25 + (j % 2) * 0.05, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.008), (0.016, -0.003), (0.017, 0.0), (0.0, 0.006)], seg=5), '#f8f6ee'), Matrix.Translation(g2b(x + tx, y + 0.25 + (j % 2) * 0.05, z + tz)))


def teapot(x, z, y, col='#f4f1ea', s=1.0):
    m = sh.a('vcg'); xf = Xf(x, z, 0, y)
    xf.lathe(m, [(0.0, 0.0), (0.05 * s, 0.0), (0.07 * s, 0.04 * s), (0.065 * s, 0.08 * s), (0.03 * s, 0.1 * s), (0.012 * s, 0.12 * s), (0.0, 0.125 * s)], 0, 0, 0, seg=10, col=col)
    xf.cyl(m, (0.06 * s, 0.05 * s, 0), (0.11 * s, 0.09 * s, 0), 0.008 * s, col=col, seg=4)


def globe(x, z, y, r=0.12):
    """玻璃球吊燈（v2b）：細吊線、黃銅燈頭、透明玻璃球、裡面一顆燈泡（約 150 三角形）"""
    xf = Xf(x, z, 0, 0.0)
    xf.cyl(sh.a('vcm'), (0, H, 0), (0, y + r + 0.04, 0), 0.004, col='#2f2f2f', seg=3, caps=False)
    xf.lathe(sh.a('vcm'), [(0.0, y + r + 0.06), (0.03, y + r + 0.06), (0.03, y + r - 0.01), (0.0, y + r - 0.01)], 0, 0, 0, seg=8, col='#b8944a')
    xf.lathe(sh.a('glass'), [(0.0, y - r)] + [(r * math.sin(t), y - r * math.cos(t)) for t in [math.pi * k / 8 for k in range(1, 8)]] + [(0.0, y + r)], 0, 0, 0, seg=12)
    xf.lathe(sh.a('bulb'), [(0.0, y - 0.035), (0.03, y - 0.02), (0.03, y + 0.02), (0.0, y + 0.035)], 0, 0, 0, seg=6)
    CL.glow(sh.root, 'spot', x, y, z, color='rgba(255,220,170,1)', size=0.45, day=0.0, night=0.55)


def lantern(x, z, y, r=0.26):
    """紙燈籠（v2b）：扁圓的米白紙燈籠（亮的紙）、上下兩圈細竹圈"""
    xf = Xf(x, z, 0, 0.0)
    xf.cyl(sh.a('vcm'), (0, H, 0), (0, y + r * 0.8 + 0.02, 0), 0.004, col='#2f2f2f', seg=3, caps=False)
    xf.lathe(sh.a('bulb'), [(0.0, y - r * 0.78)] + [(r * math.sin(t), y - r * 0.8 * math.cos(t)) for t in [math.pi * k / 10 for k in range(1, 10)]] + [(0.0, y + r * 0.78)], 0, 0, 0, seg=16)
    for yy in (y - r * 0.7, y + r * 0.7):
        xf.lathe(sh.a('vc'), [(r * 0.42, yy - 0.012), (r * 0.46, yy - 0.012), (r * 0.46, yy + 0.012), (r * 0.42, yy + 0.012)], 0, 0, 0, seg=12, col='#a87a4a')
    CL.glow(sh.root, 'spot', x, y, z, color='rgba(255,224,180,1)', size=0.8, day=0.0, night=0.6)


def giftbox(x, z, y, col, w=0.16, h=0.12, d=0.1):
    """茶葉禮盒（v2b）：盒子＋一條腰帶"""
    xf0.rbox(sh.a('vc'), x - w / 2, x + w / 2, y, y + h, z - d / 2, z + d / 2, r=0.006, seg=1, col=col)
    xf0.rbox(sh.a('vc'), x - 0.012, x + 0.012, y - 0.001, y + h + 0.002, z - d / 2 - 0.002, z + d / 2 + 0.002, r=0.002, seg=1, col='#e8dcc0')


def tin(x, z, y, k):
    """深綠茶罐＋標籤（aok_print 第 0 列 (4,0) 起的 8 張）"""
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.085, 0.0), (0.085, 0.27), (0.078, 0.285), (0.0, 0.29)], 0, 0, 0, seg=12, col='#34503c')
    kk = k % 8; uu = (0.5 + kk / 16 + 0.002, 1 - 1 / 8 + 0.002, 0.5 + (kk + 1) / 16 - 0.002, 1.0 - 0.002)
    sh.img_quad(sh.a('print'), Xf(x, z, 0.0), 0, y + 0.07, 0.086, 0.08, 0.14, uu)


# ---------------------------------------------------------------- 地板、天花板（淺木條＋軌道燈）、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=1.0).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for k in range(19):                                                                                                       # 淺木條（沿 x，每 0.37 m 一條）
    zz = Z0 + 0.2 + k * (D - 0.4) / 18; sh.a('wood').box(X0, X1, H - 0.08, H - 0.01, zz - 0.04, zz + 0.04)
for (zz, n) in ((-0.5, 7), (2.0, 7)):
    m = sh.a('vcm'); xf0.rbox(m, X0 + 0.4, X1 - 0.4, H - 0.12, H - 0.08, zz - 0.02, zz + 0.02, r=0.004, seg=1, col='#ece8e0')
    for k in range(n):
        x = X0 + 0.7 + k * (W - 1.4) / (n - 1); sp = Xf(x, zz, 0.0)
        sp.cyl(m, (0, H - 0.12, 0), (0, H - 0.3, 0.06 if zz > 0 else -0.06), 0.035, col='#ece8e0', seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.3, 0.06 if zz > 0 else -0.06), sp.p(0, H - 0.305, 0.062 if zz > 0 else -0.062), 0.03, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.45, zz, color='rgba(255,220,170,1)', size=0.5, day=0.0, night=0.5)
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']; ta = fr['takeaway']
ops = [(dx - dw / 2, dx + dw / 2, 0.0, dh, 'door'), (ta['x0'], ta['x1'], ta['sill'], ta['head'], 'win')] + [(a, b, fr['sill'], fr['head'], 'win') for a, b in fr['windows']]
sh.wall_with_openings('front', ops, 'wall', 'wall', 0.0, 'wood', mull=1.1)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
for side, (a0, a1) in (('left', (Z0, Z1)), ('right', (Z0, Z1)), ('back', (X0, X1))): sh.wall_box(side, 'wood', a0, a1, 0.0, 0.1, -0.015, 0.0)
for (a, b) in fr['windows']: xf0.rbox(sh.w('front', 'wood'), a - 0.05, b + 0.05, fr['sill'] - 0.04, fr['sill'], Z1 - 0.2, Z1, r=0.006, seg=1)
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(8.5, 5.5, vz), (-8.5, 5.5, vz), (-8.5, -1.0, vz), (8.5, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
sh.tally('shell')

# ---------------------------------------------------------------- 窗邊長桌、玻璃茶具櫃、外帶窗口的小工作檯
wc = IT['window_counter'][0]; wx0, wx1, wz0, wz1 = wc['x'] - wc['w'] / 2, wc['x'] + wc['w'] / 2, wc['z'] - wc['d'] / 2, wc['z'] + wc['d'] / 2
xf0.rbox(sh.a('wood'), wx0, wx1, wc['h'] - 0.04, wc['h'], wz0, wz1, r=0.008, seg=1)
for xx in (wx0 + 0.1, wc['x'], wx1 - 0.1): xf0.rbox(sh.a('wood'), xx - 0.03, xx + 0.03, 0.0, wc['h'] - 0.04, wz1 - 0.12, wz1 - 0.06, r=0.004, seg=1)
for s_ in LAY['seats']:
    if s_['table'] == 6: chair(s_['x'], s_['z'] - 0.04, s_['yaw'])
for (xx, kind) in ((wx0 + 0.35, 'vase'), (wx0 + 1.2, 'cup'), (wx0 + 2.0, 'vase'), (wx0 + 2.75, 'cup')):
    if kind == 'vase': vase(xx, wc['z'] + 0.08, wc['h'])
    else: K.mug(sh, xx, wc['z'], wc['h'], col='#f4f0e6', r=0.035, h=0.06, handle=False); teapot(xx + 0.15, wc['z'] + 0.05, wc['h'], s=0.8)
for dp in IT['display']:                                                                                                  # 窗前的玻璃展示櫃（v2b）：木底座、玻璃櫃身、兩層禮盒＋一層茶罐
    x0d, x1d, z0d, z1d, hd = dp['x'] - dp['w'] / 2, dp['x'] + dp['w'] / 2, dp['z'] - dp['d'] / 2, dp['z'] + dp['d'] / 2, dp['h']
    xf0.rbox(sh.a('wood'), x0d, x1d, 0.0, 0.32, z0d, z1d, r=0.008, seg=1)
    xf0.rbox(sh.a('wood'), x0d, x1d, hd - 0.04, hd, z0d, z1d, r=0.008, seg=1)
    for (ax, az) in ((x0d, z0d), (x1d - 0.03, z0d), (x0d, z1d - 0.03), (x1d - 0.03, z1d - 0.03)): xf0.rbox(sh.a('wood'), ax, ax + 0.03, 0.32, hd - 0.04, az, az + 0.03, r=0.003, seg=1)
    sh.a('glass').box(x0d + 0.03, x1d - 0.03, 0.32, hd - 0.04, z0d, z0d + 0.008)
    for (ax0, ax1) in ((x0d, x0d + 0.008), (x1d - 0.008, x1d)): sh.a('glass').box(ax0, ax1, 0.32, hd - 0.04, z0d + 0.03, z1d - 0.03)
    for q, y in enumerate((0.32, 0.6, 0.86)):
        if q: sh.a('glass').box(x0d + 0.03, x1d - 0.03, y, y + 0.01, z0d + 0.01, z1d - 0.01)
        if q == 2:
            for k in range(3): tin(dp['x'] - 0.2 + k * 0.2, dp['z'], y + 0.01, k)
        else:
            for k in range(3): giftbox(dp['x'] - 0.2 + k * 0.2, dp['z'] + 0.03 * (k % 2), y + 0.01, ('#4f6b45', '#c9a77c', '#e8e0cc', '#3f5a46', '#c9a77c')[(q * 2 + k) % 5], w=0.17, h=0.13 if q == 0 else 0.11, d=0.12)
            giftbox(dp['x'] - 0.1, dp['z'] - 0.05, y + (0.14 if q == 0 else 0.12), '#e8e0cc' if q == 0 else '#4f6b45', w=0.14, h=0.07)
    sh.a('bulb').box(x0d + 0.05, x1d - 0.05, hd - 0.055, hd - 0.045, dp['z'] - 0.02, dp['z'] + 0.02)
vt = IT['vitrine'][0]; vxf = Xf(vt['x'], vt['z'], math.pi)                                                                  # 正面朝 −z（店裡）
vxf.rbox(sh.a('wood'), -vt['w'] / 2, vt['w'] / 2, 0.0, 0.35, -vt['d'] / 2, vt['d'] / 2, r=0.006, seg=1)
vxf.rbox(sh.a('wood'), -vt['w'] / 2, vt['w'] / 2, vt['h'] - 0.04, vt['h'], -vt['d'] / 2, vt['d'] / 2, r=0.006, seg=1)
for sx in (-vt['w'] / 2, vt['w'] / 2 - 0.03): vxf.rbox(sh.a('wood'), sx, sx + 0.03, 0.35, vt['h'], -vt['d'] / 2, vt['d'] / 2, r=0.003, seg=1)
sh.a('glass').box(vt['x'] - vt['w'] / 2 + 0.03, vt['x'] + vt['w'] / 2 - 0.03, 0.35, vt['h'] - 0.04, vt['z'] - vt['d'] / 2, vt['z'] - vt['d'] / 2 + 0.01)
for q, y in enumerate((0.35, 0.67, 0.98)):
    sh.a('glass').box(vt['x'] - vt['w'] / 2 + 0.03, vt['x'] + vt['w'] / 2 - 0.03, y, y + 0.01, vt['z'] - vt['d'] / 2, vt['z'] + vt['d'] / 2)
    if q == 1:
        for k in range(2): teapot(vt['x'] - 0.11 + k * 0.22, vt['z'], y + 0.01, col=('#f4f1ea', '#9ab0a0')[k], s=0.7)
    else:
        for k in range(2): giftbox(vt['x'] - 0.11 + k * 0.22, vt['z'] - 0.02 * k, y + 0.01, ('#4f6b45', '#c9a77c', '#e8e0cc', '#3f5a46')[(q + k) % 4], w=0.18, h=0.13 if q == 0 else 0.1)
        giftbox(vt['x'], vt['z'] + 0.06, y + 0.14 if q == 0 else y + 0.11, '#c9a77c' if q == 0 else '#4f6b45', w=0.14, h=0.08)
sh.a('bulb').box(vt['x'] - vt['w'] / 2 + 0.04, vt['x'] + vt['w'] / 2 - 0.04, vt['h'] - 0.055, vt['h'] - 0.045, vt['z'] - 0.02, vt['z'] + 0.02)   # 櫃頂的燈條
tk = IT['takeaway_bench'][0]; xf0.rbox(sh.a('wood'), tk['x'] - tk['w'] / 2, tk['x'] + tk['w'] / 2, 0.0, tk['h'], tk['z'] - tk['d'] / 2, tk['z'] + tk['d'] / 2, r=0.01, seg=1)
xf0.rbox(sh.a('vcg'), tk['x'] - tk['w'] / 2 - 0.02, tk['x'] + tk['w'] / 2 + 0.02, tk['h'], tk['h'] + 0.03, tk['z'] - tk['d'] / 2, tk['z'] + tk['d'] / 2 + 0.02, r=0.006, seg=1, col='#ece7de')   # 檯面（v2d）
th_ = tk['h'] + 0.03
for k in range(3):                                                                                                        # 三疊紙杯
    for j in range(4): Xf(tk['x'] - 0.42 + k * 0.1, tk['z'] + 0.12, 0, th_ + j * 0.025).lathe(sh.a('vcg'), [(0.0, 0.0), (0.035, 0.0), (0.045, 0.12), (0.0, 0.12)], 0, 0, 0, seg=8, col='#f4f0e6' if j < 3 else '#d9c9a8')
mxf = Xf(tk['x'] - 0.05, tk['z'] + 0.22, 0.0, th_); mxf.rbox(sh.a('wood'), -0.13, 0.13, 0.0, 0.02, -0.04, 0.04, r=0.004, seg=1)   # 菜單牌（朝街）
sh.img_quad(sh.a('print'), mxf, 0, 0.02, 0.01, 0.24, 0.17, K.cell_uv(0, 2, 4, 2), tilt=0.2)
teapot(tk['x'] + 0.2, tk['z'] + 0.05, th_, col='#f4f1ea', s=1.1)
Xf(tk['x'] + 0.42, tk['z'] - 0.05, 0, th_).rbox(sh.a('vcm'), -0.08, 0.08, 0.0, 0.3, -0.12, 0.12, r=0.015, seg=1, col='#c8c8c4')   # 封口機
CK.ph_put('potted_plant_04', tk['x'] + 0.45, th_, tk['z'] + 0.18, yaw=2.0, share=False, height=0.28, decimate=0.1)
for k in range(3): K.glass_cup(sh, tk['x'] - 0.15 + k * 0.1, tk['z'] - 0.1, th_, h=0.13, r=0.035, fill=('#c9a050', '#a8b860', '#e8d8b0')[k])
sh.tally('window')

# ---------------------------------------------------------------- 長吧台、後面的工作檯、綠磁磚牆、茶罐層板
br = IT['bar'][0]; bx0, bx1, bz0, bz1 = br['x'] - br['w'] / 2, br['x'] + br['w'] / 2, br['z'] - br['d'] / 2, br['z'] + br['d'] / 2
xf0.rbox(sh.a('wood'), bx0, bx1, 0.0, br['h'] - 0.05, bz0, bz1, r=0.01, seg=1)
for k in range(40): xx = bx0 + 0.06 + k * (br['w'] - 0.12) / 39; xf0.rbox(sh.a('vc'), xx - 0.022, xx + 0.022, 0.08, br['h'] - 0.08, bz1, bz1 + 0.012, r=0.003, seg=1, col='#b0814f')   # 直木條
STONE = '#ece7de'
xf0.rbox(sh.a('vcg'), bx0 - 0.03, bx1, br['h'] - 0.05, br['h'], bz0 - 0.02, bz1 + 0.06, r=0.012, seg=1, col=STONE)   # 淺色石材檯面
bzc = (bz0 + bz1) / 2                                                                                                    # 鏡頭那一端（東）做圓角：半圓的木條身＋半圓檯面
Xf(bx1, bzc, 0, 0.0).lathe(sh.a('vc'), [(0.0, 0.0), (br['d'] / 2, 0.0), (br['d'] / 2, br['h'] - 0.05), (0.0, br['h'] - 0.05)], 0, 0, 0, seg=20, col='#b0814f')
for k in range(9):
    a = -math.pi / 2 + (k + 0.5) * math.pi / 9; xx, zz = bx1 + math.cos(a) * (br['d'] / 2 + 0.006), bzc + math.sin(a) * (br['d'] / 2 + 0.006)
    Xf(xx, zz, -a + math.pi / 2).rbox(sh.a('vc'), -0.022, 0.022, 0.08, br['h'] - 0.08, -0.006, 0.006, r=0.003, seg=1, col='#a87a4a')
Xf(bx1, bzc + 0.02, 0, br['h'] - 0.05).lathe(sh.a('vcg'), [(0.0, 0.0), (br['d'] / 2 + 0.04, 0.0), (br['d'] / 2 + 0.05, 0.025), (br['d'] / 2 + 0.04, 0.05), (0.0, 0.05)], 0, 0, 0, seg=20, col=STONE)
for s_ in LAY['seats']:
    if s_['table'] == 7: wstool(s_['x'], s_['z'], h=0.72)
top = br['h']
for k in range(3):                                                                                                        # 玻璃公道杯（裡面是茶）
    x = bx0 + 1.0 + k * 0.4; Xf(x, br['z'] - 0.05, 0, top).lathe(sh.a('glass'), [(0.0, 0.0), (0.06, 0.0), (0.07, 0.16), (0.05, 0.2), (0.055, 0.22)], 0, 0, 0, seg=10)
    Xf(x, br['z'] - 0.05, 0, top + 0.005).lathe(sh.a('vcg'), [(0.0, 0.0), (0.055, 0.0), (0.062, 0.1), (0.0, 0.1)], 0, 0, 0, seg=10, col=('#c98a3a', '#b8a050', '#d9b870')[k])
xf0.rbox(sh.a('vc'), bx0 + 2.3, bx0 + 2.8, top, top + 0.025, br['z'] - 0.2, br['z'] + 0.1, r=0.005, seg=1, col='#6a4a2a')     # 茶盤
for k in range(3): Xf(bx0 + 2.4 + k * 0.15, br['z'] - 0.05, 0, top + 0.025).lathe(sh.a('vcg'), [(0.0, 0.0), (0.025, 0.0), (0.03, 0.04), (0.0, 0.04)], 0, 0, 0, seg=8, col='#f4f0e6')
sc_ = Xf(bx0 + 3.3, br['z'] - 0.05, 0, top); sc_.rbox(sh.a('vcm'), -0.1, 0.1, 0.0, 0.05, -0.1, 0.1, r=0.01, seg=1, col='#e8e8e4'); sc_.lathe(sh.a('vcm'), [(0.0, 0.05), (0.09, 0.05), (0.09, 0.06), (0.0, 0.06)], 0, 0, 0, seg=10, col='#c8c8c4')   # 秤
Xf(bx0 + 3.8, br['z'] - 0.05, 0, top).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.16), (0.0, 0.16)], 0, 0, 0, seg=8, col='#8a7a5a')   # 竹茶具筒
for j in range(5): Xf(bx0 + 3.8, br['z'] - 0.05).cyl(sh.a('vc'), (0, top + 0.1, 0), ((j - 2) * 0.015, top + 0.3, 0.01), 0.004, col='#d9c49a', seg=3, caps=False)
for k in range(4): globe(bx0 + 0.7 + k * 1.3, br['z'], 2.35 - 0.1 * (k % 2), r=0.12)                                       # 玻璃球吊燈（v2b）
xf0.rbox(sh.a('vc'), bx0 + 0.2, bx0 + 0.7, top, top + 0.025, br['z'] - 0.2, br['z'] + 0.1, r=0.005, seg=1, col='#6a4a2a')     # 第二個茶盤（茶壺＋兩杯）
teapot(bx0 + 0.35, br['z'] - 0.05, top + 0.025, col='#9ab0a0', s=1.1)
for k in range(2): Xf(bx0 + 0.55, br['z'] - 0.12 + k * 0.14, 0, top + 0.025).lathe(sh.a('vcg'), [(0.0, 0.0), (0.025, 0.0), (0.03, 0.04), (0.0, 0.04)], 0, 0, 0, seg=8, col='#f4f0e6')
for k in range(3): tin(bx0 + 4.25 + k * 0.2, br['z'] - 0.12, top, k + 3)                                                    # 檯面上的試聞茶罐
for k in range(3): Xf(bx0 + 4.35 + k * 0.18, br['z'] + 0.1, 0, top).lathe(sh.a('glass'), [(0.0, 0.0), (0.04, 0.0), (0.04, 0.11), (0.025, 0.13), (0.0, 0.13)], 0, 0, 0, seg=8)   # 小玻璃罐（茶葉樣品）
CK.ph_put('tea_set_01', bx1 - 0.25, top, bzc - 0.02, yaw=math.pi / 2, s=1.0, height=0.12, decimate=0.04)   # 茶具組（Poly Haven tea_set_01，掃描；取代原本那一把茶壺）
CK.ph_put('potted_plant_04', bx0 + 1.75, top, br['z'] - 0.15, yaw=0.6, share=False, height=0.27, decimate=0.1)
bb = IT['back_bench'][0]; xf0.rbox(sh.a('wood'), bb['x'] - bb['w'] / 2, bb['x'] + bb['w'] / 2, 0.0, bb['h'], bb['z'] - bb['d'] / 2, bb['z'] + bb['d'] / 2, r=0.01, seg=1)
xf0.rbox(sh.a('vcg'), bb['x'] - bb['w'] / 2, bb['x'] + bb['w'] / 2, bb['h'], bb['h'] + 0.03, bb['z'] - bb['d'] / 2, bb['z'] + bb['d'] / 2, r=0.006, seg=1, col='#e2dcd0')
for k in range(2): CK.ph_put('vintage_electric_kettle', bb['x'] - 1.6 + k * 0.5, bb['h'] + 0.03, bb['z'], yaw=math.pi * (0.9 + 0.25 * k), height=0.27, decimate=0.08)   # 熱水壺（Poly Haven 掃描）
Xf(bb['x'] + 0.4, bb['z'], 0, bb['h'] + 0.03).rbox(sh.a('vcm'), -0.2, 0.2, 0.0, 0.42, -0.18, 0.18, r=0.02, seg=1, col='#c8c8c4')   # 煮水機
tx0, tx1 = bb['x'] - bb['w'] / 2 - 0.3, X1                                                                                                    # 綠色長條磁磚（直貼）
for k in range(int((tx1 - tx0) / 0.08)):
    xx = tx0 + 0.04 + k * 0.08; xf0.rbox(sh.a('vcg'), xx - 0.036, xx + 0.036, 0.95, 3.0, Z0, Z0 + 0.012, r=0.004, seg=1, col=R.choice(['#76917a', '#7a957a', '#829f82', '#76917a']))
for (y, n, kind) in ((1.3, 34, 'jar'), (1.75, 40, 'bag'), (2.2, 28, 'pot'), (2.65, 30, 'tin')):                         # 四層層板（v2b：擺滿＋層板下的燈條）
    xf0.rbox(sh.a('wood'), tx0 + 0.1, tx1 - 0.1, y - 0.03, y, Z0 + 0.012, Z0 + 0.3, r=0.004, seg=1)
    sh.a('bulb').box(tx0 + 0.15, tx1 - 0.15, y - 0.04, y - 0.03, Z0 + 0.26, Z0 + 0.28)
    for k in range(n):
        xx = tx0 + 0.25 + k * (tx1 - tx0 - 0.5) / (n - 1)
        if kind == 'tin': tin(xx, Z0 + 0.15, y, k)
        elif kind == 'pot': teapot(xx, Z0 + 0.15, y, col=R.choice(['#f4f1ea', '#e8dcc8', '#9ab0a0', '#f4f1ea']), s=1.15) if k % 3 else tin(xx, Z0 + 0.15, y, k + 2)
        elif kind == 'jar':
            if k % 4 == 3: giftbox(xx, Z0 + 0.15, y, R.choice(['#4f6b45', '#c9a77c', '#e8e0cc']), w=0.15, h=0.14)
            else:
                Xf(xx, Z0 + 0.15, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.06, 0.0), (0.06, 0.2), (0.035, 0.24), (0.0, 0.24)], 0, 0, 0, seg=8)
                Xf(xx, Z0 + 0.15, 0, y + 0.005).lathe(sh.a('vcg'), [(0.0, 0.0), (0.055, 0.0), (0.055, 0.12), (0.0, 0.12)], 0, 0, 0, seg=8, col=R.choice(['#7a8a4a', '#8a6a3a', '#a8a070', '#5a6a3a']))
        else:
            kk = k % 8; xf0.rbox(sh.a('vc'), xx - 0.06, xx + 0.06, y, y + 0.18, Z0 + 0.08, Z0 + 0.2, r=0.006, seg=1, col='#c9a77c')   # 牛皮紙茶包
            sh.img_quad(sh.a('print'), Xf(xx, Z0 + 0.201, 0.0), 0, y + 0.02, 0.0, 0.1, 0.14, (0.5 + kk / 16 + 0.002, 1 - 2 / 8 + 0.002, 0.5 + (kk + 1) / 16 - 0.002, 1 - 1 / 8 - 0.002))
for xx in (tx0 + 0.6, tx1 - 0.5): sh.hanging_pothos('pothos', xx, 2.95, Z0 + 0.2, n=6, drop=0.5)
sh.tally('bar')

# ---------------------------------------------------------------- 卡座、書櫃、店名、山景畫、桌子
bq = IT['banquette'][0]; qz0, qz1 = bq['z'] - bq['d'] / 2, bq['z'] + bq['d'] / 2
xf0.rbox(sh.a('wood'), X0, X0 + bq['w'], 0.0, 0.4, qz0, qz1, r=0.015, seg=1)
xf0.rbox(sh.a('vcg'), X0 + 0.12, X0 + bq['w'] + 0.02, 0.4, 0.5, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col=SAGE)
xf0.rbox(sh.a('vcg'), X0 + 0.02, X0 + 0.16, 0.48, 0.95, qz0 + 0.02, qz1 - 0.02, r=0.05, seg=2, col=SAGE)
for k in range(3): Xf(X0 + 0.24, qz0 + 0.45 + k * 0.95, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.86, -0.07, 0.07, r=0.06, seg=2, col=('#e8e0cc', '#b8c4a8', '#e8e0cc')[k])
sh.wall_img('left', 'print', bq['z'], 2.35, 2.2, 1.1, K.cell_uv(0, 0, 2, 1), off=0.004)                                 # 店名「青木茶室」（v2b：寫在牆上的大字＋雙葉，底色＝牆色）
bc = IT['bookcase'][0]; bxf = Xf(bc['x'], bc['z'], bc['ry']); wm = sh.a('wood'); bw_, bd_, bh_ = bc['w'], bc['d'], bc['h']
bxf.rbox(wm, -bw_ / 2, bw_ / 2, 0.0, bh_, -bd_ / 2, -bd_ / 2 + 0.02, r=0.003, seg=1)
for u in (-bw_ / 2, 0.0, bw_ / 2): bxf.rbox(wm, u - 0.02, u + 0.02, 0.0, bh_, -bd_ / 2, bd_ / 2, r=0.004, seg=1)
for q, y in enumerate((0.06, 0.48, 0.9, 1.32, 1.74, 2.26)):
    bxf.rbox(wm, -bw_ / 2, bw_ / 2, y - 0.02, y + 0.01, -bd_ / 2, bd_ / 2, r=0.003, seg=1)
    if y > 2.2: continue
    if q == 2: CK.ph_put('potted_plant_04', bxf.p(-0.3, 0, 0.0)[0], y + 0.01, bxf.p(-0.3, 0, 0.0)[2], yaw=1.0, share=False, height=0.3, decimate=0.1); K.book_rows(sh, 'books', bxf, 0.03, bw_ / 2 - 0.03, y + 0.01, bd_ / 2 - 0.04, hgt=0.3, depth=0.2, rng=R); continue
    K.book_rows(sh, 'books', bxf, -bw_ / 2 + 0.03, -0.03, y + 0.01, bd_ / 2 - 0.04, hgt=0.3, depth=0.2, rng=R); K.book_rows(sh, 'books', bxf, 0.03, bw_ / 2 - 0.03, y + 0.01, bd_ / 2 - 0.04, hgt=0.3, depth=0.2, rng=R)
pt = IT['painting'][0]; sh.wall_img('left', 'print', pt['z'], pt['y'], pt['w'], pt['h'], K.cell_uv(2, 0, 2, 2), off=0.03)
xf0.rbox(sh.w('left', 'wood'), X0, X0 + 0.025, pt['y'] - pt['h'] / 2 - 0.04, pt['y'] + pt['h'] / 2 + 0.04, pt['z'] - pt['w'] / 2 - 0.04, pt['z'] + pt['w'] / 2 + 0.04, r=0.004, seg=1)
sh.wall_img('right', 'print', 0.9, 2.2, 1.2, 0.6, K.cell_uv(0, 2, 4, 2), off=0.03)                                        # 東牆的黑板「季節限定」
xf0.rbox(sh.w('right', 'wood'), X1 - 0.025, X1, 1.86, 2.54, 0.24, 1.56, r=0.006, seg=1)
for tid, t in TB.items():
    if t['kind'] == 'round': K.round_table(sh, t['x'], t['z'], r=t['r'], h=0.72, top_key='wood', base_col='#3a3a3a')
    else: K.rect_table(sh, t['x'], t['z'], 0.0, t['w'], t['d'], h=0.74, top_key='wood', leg_key='wood', leg='wood')
    for s_ in LAY['seats']:
        if s_['table'] == tid and not s_.get('seatH'): chair(s_['x'] + math.sin(s_['yaw']) * -0.04, s_['z'] + math.cos(s_['yaw']) * -0.04, s_['yaw'])
    th = 0.72 if t['kind'] == 'round' else 0.74
    vase(t['x'] + 0.05, t['z'] - 0.05, th)
    if tid in (3, 5): teapot(t['x'] - 0.2, t['z'] + 0.1, th); K.mug(sh, t['x'] + 0.2, t['z'] + 0.15, th, col='#f4f0e6', r=0.035, h=0.06, handle=False)
    if tid == 3: xf0.rbox(sh.a('vc'), t['x'] - 0.15, t['x'] + 0.1, th, th + 0.02, t['z'] - 0.3, t['z'] - 0.12, r=0.003, seg=1, col='#e8e0cc')   # 一本書
lantern(TB[5]['x'], TB[5]['z'], 2.45)                                                                                     # 最裡面那桌一盞紙燈籠（參考圖中間那盞）
for tid in (1, 2, 3): globe(TB[tid]['x'], TB[tid]['z'], 2.3, r=0.13)                                                       # 其他桌玻璃球燈
sh.tally('seating')

for p_ in IT['plant_big']: leafy(p_['x'], p_['z'])
sh.hanging_pothos('pothos', X0 + 0.12, 2.32, bc['z'] - 0.3, n=6, drop=0.6)
sh.tally('plants')
CK.drop_protos()
info = sh.finish(OUT, keep=lambda ob: ob.name.startswith('S_ph_'), extra_info={'layout': LAY['version'], 'seats': len(LAY['seats']), 'cc0': [list(u) for u in CK.used()]})
print('CC0_USED', CK.used())
