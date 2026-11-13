"""Daybreak（公館店面街 G14，取代「早午餐」）室內 → GLB（AA 2026-11-04；AA_650，使用者 11-04 新店名、02:2x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/daybreak_interior.py [-- --out assets/models/env/second_ai/aa_support/daybreak.glb]
配置只寫在 src/data/daybreak_layout.js。參考圖 docs/story_planning/ref_images/shops/gongguan_daybreak_int.webp。美術規則 SCENE_RULES §10～12。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py dbk（dbk_print.png：牆上 Daybreak 字＋黃色山丘、黑板、Pick Up 牌、三張早午餐插畫）＋ yej（磨石子）；窗景 mok_view.png。
淺色橡木、米白牆、白天花板＋梁＋嵌燈、淺色磨石子（D112）、灰綠窗框、綠磁磚、綠色卡座、木編吊燈、明亮的早上。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/daybreak_layout.js', 'DAYBREAK_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('dbk_', 'daybreak_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=1108)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'view'}
P = 'dbk_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_terrazzo', 'yej_terrazzo.png', rough=0.35, tile=1.0),
    'wall': CL.soft_plaster(P + 'wall_cream', '#f3ede2', 0.9, cull=True, tile=1.6, k=0.2),
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=1.2, target='#dcbf94', maps=('diff',), res=256, rough_value=0.5),
    'glass': L.flat(P + 'glass', '#e2ecee', rough=0.05, alpha=0.14),
    'bulb': L.flat(P + 'bulb', '#fff6e6', rough=0.3, emit=B.srgb('#ffe2b0')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.2),
    'print': K.img_mat(P + 'print', 'dbk_print.png', rough=0.75),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件照顏色換成 ambientCG 材質組、植物／收銀機換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
import cc0_kit   # noqa: E402
CK = cc0_kit.Kit(sh.root, P[:-1])
sh.M.update({
    'frame': CK.acg(P + 'frame_sage', 'Plastic006', target='#8a9e8a', vary=0.05, tile=0.5, rough_value=0.5),    # 灰綠窗框：烤漆
    'oakcg': CK.acg(P + 'oak_cc0', 'Wood049', target='#d4b384', vary=0.35, tile=0.5, rough_value=0.55),
    'fab_cream': CK.acg(P + 'fabric_cream', 'Fabric030', target='#ebe4d4', tile=0.35, rough_value=0.9),
    'fab_sage': CK.acg(P + 'fabric_sage', 'Fabric030', target='#869a80', tile=0.35, rough_value=0.85),
    'fab_yellow': CK.acg(P + 'fabric_yellow', 'Fabric030', target='#f0d478', tile=0.3, rough_value=0.9),
    'doormat': CK.acg(P + 'doormat', 'Fabric030', target='#b8935e', tile=0.25, rough_value=0.95),
    'stone': CK.acg(P + 'stone_top', 'Marble012', target='#e6e1d8', vary=0.1, tile=1.2, rough_value=0.3),
    'ceramic': CK.acg(P + 'ceramic', 'Plastic006', target='#f4f0e8', vary=0.05, tile=0.4, rough_value=0.2),
    'tile_a': CK.acg(P + 'tile_green_a', 'Plastic006', target='#a0b69d', vary=0.05, tile=0.25, rough_value=0.15),
    'tile_b': CK.acg(P + 'tile_green_b', 'Plastic006', target='#95ad93', vary=0.05, tile=0.25, rough_value=0.15),
    'sagepaint': CK.acg(P + 'sage_paint', 'Metal009', target='#7d927a', vary=0.15, tile=0.4, metal=0.2, rough_value=0.45),
    'blackmetal': CK.acg(P + 'black_metal', 'Metal009', target='#2e2e2e', vary=0.2, tile=0.4, metal=0.4, rough_value=0.45),
    'steel': CK.acg(P + 'steel', 'Metal009', target='#d6d6d2', vary=0.04, tile=0.4, metal=0.25, rough_value=0.35),
    'blackplastic': CK.acg(P + 'black_plastic', 'Plastic006', target='#3a3a38', vary=0.03, tile=0.4, rough_value=0.4),
    'beam': CK.acg(P + 'beam_plaster', 'Plaster001', target='#f4f2ec', vary=0.04, tile=1.0, rough_value=0.85),
})
sh.route({'#d9b98a': 'oakcg', '#cfae7e': 'wood',   # 吧台直紋木條＝和吧台本體同一個 walnut_veneer（Wood049 在細木條上太碎）
          '#ebe4d4': 'fab_cream', '#8a9e84': 'fab_sage', '#7d927a': 'fab_sage',
          '#f0d070': 'fab_yellow', '#f4e4a0': 'fab_yellow', '#b8935e': 'doormat', '#e6e1d8': 'stone',
          '#f6f3ec': 'ceramic', '#efe9de': 'ceramic', '#e8dcc8': 'ceramic', '#9fb59c': 'tile_a', '#a6bba3': 'tile_a', '#98b096': 'tile_b', '#93ab91': 'tile_b',
          '#7e937b': 'sagepaint', '#2e2e2e': 'blackmetal', '#3a3a38': 'blackplastic', '#f4f2ec': 'beam',
          '#e8e8e6': 'steel', '#e4e4e0': 'steel', '#d8d8d4': 'steel', '#dadad8': 'steel', '#a8a8a4': 'steel', '#cfcfcb': 'steel', '#b8b8b4': 'steel', '#f2f2ee': 'steel', '#8a8a86': 'steel'})
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
TB = {t['id']: t for t in LAY['tables']}
xf0 = Xf(0, 0); R = random.Random(1108)
OAK = '#d9b98a'; OAK2 = '#cfae7e'; CREAM = '#ebe4d4'; SAGE = '#8a9e84'; SAGE2 = '#7d927a'; FRAME = '#8a9e8a'; STONE = '#e6e1d8'; STEEL = '#c8c8c4'


def chair(x, z, yaw, cushion=CREAM, spindle=False):
    """淺橡木椅：四腳、布面坐墊；spindle＝窗邊那種直條椅背，否則是彎的木靠背（約 230 三角形）"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.19, 0.18), (0.19, 0.18), (-0.19, -0.18), (0.19, -0.18)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.43, sz * 0.95), 0.017, col=OAK, seg=5, caps=False)
    xf.rbox(m, -0.21, 0.21, 0.39, 0.43, -0.2, 0.2, r=0.01, seg=1, col=OAK)
    xf.rbox(m, -0.19, 0.19, 0.43, 0.48, -0.18, 0.18, r=0.025, seg=2, col=cushion)
    for sx in (-0.19, 0.19): xf.cyl(m, (sx, 0.45, -0.19), (sx, 0.84, -0.22), 0.017, col=OAK, seg=5, caps=False)
    if spindle:
        for k in range(4): xf.cyl(m, (-0.11 + k * 0.073, 0.45, -0.2), (-0.11 + k * 0.073, 0.8, -0.22), 0.01, col=OAK, seg=4, caps=False)
        xf.rbox(m, -0.21, 0.21, 0.78, 0.85, -0.25, -0.2, r=0.02, seg=1, col=OAK)
    else: xf.rbox(m, -0.21, 0.21, 0.62, 0.84, -0.245, -0.2, r=0.02, seg=2, col=OAK)


def leafy(x, z, h=1.4, pot='#efe9de'):
    """落地植物：Poly Haven potted_plant_02（掃描；SHOP-CC0-HELP-1113，取代原本的花盆＋葉片卡）"""
    CK.ph_put('potted_plant_02', x, 0.0, z, yaw=R.uniform(0, 6.28), share=False, height=h, decimate=0.03)
    return
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col=pot)
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)


def vase(x, z, y):
    """小玻璃花瓶＋白色滿天星"""
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.022, 0.13)], 0, 0, 0, seg=8)
    for j in range(6):
        a = j * 1.1; tx, tz = math.cos(a) * 0.06, math.sin(a) * 0.06
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.1, 0), (tx, y + 0.22 + (j % 3) * 0.03, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.01), (0.02, -0.004), (0.021, 0.0), (0.0, 0.008)], seg=5), '#f8f6ee'), Matrix.Translation(g2b(x + tx, y + 0.22 + (j % 3) * 0.03, z + tz)))


def setting(x, z, y, yaw, food=True):
    """一份餐具：餐巾、刀叉、水杯；food＝盤子上一份早午餐（蛋捲／吐司＋沙拉）"""
    xf = Xf(x, z, yaw, y)
    xf.rbox(sh.a('vc'), -0.06, 0.06, 0.0, 0.004, -0.11, 0.11, r=0.002, seg=1, col='#f6f3ec')
    xf.rbox(sh.a('vcm'), -0.02, -0.01, 0.004, 0.008, -0.09, 0.09, r=0.002, seg=1, col='#b8b8b4'); xf.rbox(sh.a('vcm'), 0.01, 0.02, 0.004, 0.008, -0.09, 0.09, r=0.002, seg=1, col='#b8b8b4')
    gx, gy, gz = xf.p(0.06, 0, -0.16); K.glass_cup(sh, gx, gz, y, h=0.1, r=0.03, fill='#e8eef0')
    if food:
        px_, py_, pz_ = xf.p(-0.2, 0, 0.0); K.plate(sh, px_, pz_, y, r=0.12)
        Xf(px_, pz_, yaw, y + 0.012).rbox(sh.a('vcg'), -0.06, 0.04, 0.0, 0.03, -0.05, 0.03, r=0.015, seg=2, col='#f0c850')
        for k in range(3): Xf(px_ + 0.05 * math.cos(k * 2.1), pz_ + 0.05 * math.sin(k * 2.1), 0, y + 0.012).lathe(sh.a('vc'), [(0.0, 0.0), (0.03, 0.0), (0.0, 0.025)], 0, 0, 0, seg=5, col=('#6a9a4a', '#c0392b', '#7aa858')[k])


def wood_pendant(x, z, y, r=0.22):
    """木編（藤色）的半球吊燈"""
    K.dome_pendant(sh, x, z, y, r=r, col='#c9a26a', inner='#f6e6c6', kind='dome', glow_size=0.7)


# ---------------------------------------------------------------- 地板、白天花板（梁、嵌燈、冷氣）、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=1.0).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for k in range(6):                                                                                                        # 白色的梁（沿 z）
    x = X0 + 0.75 + k * (W - 1.5) / 5; xf0.rbox(sh.a('vcm'), x - 0.1, x + 0.1, H - 0.28, H - 0.005, Z0, Z1, r=0.01, seg=1, col='#f4f2ec')
for k in range(5):                                                                                                        # 嵌燈
    for zz in (-1.6, 0.6, 2.6):
        x = X0 + 1.6 + k * (W - 3.2) / 4 - 0.45; sh.a('bulb').cyl((x, H - 0.006, zz), (x, H - 0.012, zz), 0.05, seg=10)
        if (k + int(zz)) % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.3, zz, color='rgba(255,228,190,1)', size=0.45, day=0.0, night=0.45)
xf0.rbox(sh.a('vcm'), -0.6, 0.4, H - 0.22, H - 0.01, -0.3, 0.7, r=0.02, seg=1, col='#f2f2ee'); xf0.rbox(sh.a('vcm'), -0.45, 0.25, H - 0.225, H - 0.215, -0.15, 0.55, r=0.005, seg=1, col='#d8d8d4')
for zz in (2.9, -1.0):                                                                                                    # 兩條黑色軌道燈（v1b）
    xf0.rbox(sh.a('vcm'), X0 + 0.6, X1 - 0.5, H - 0.32, H - 0.29, zz - 0.02, zz + 0.02, r=0.004, seg=1, col='#2e2e2e')
    for k in range(7):
        x = X0 + 0.9 + k * (W - 1.6) / 6; sp = Xf(x, zz, 0.0); sp.cyl(sh.a('vcm'), (0, H - 0.32, 0), (0, H - 0.47, 0.04 if zz > 0 else -0.04), 0.03, col='#2e2e2e', seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.47, 0.04 if zz > 0 else -0.04), sp.p(0, H - 0.475, 0.042 if zz > 0 else -0.042), 0.024, seg=8)
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
ops = [(dx - dw / 2, dx + dw / 2, 0.0, dh, 'door')] + [(a, b, fr['sill'] if (b - a) > 1 else 0.1, fr['head'] if (b - a) > 1 else dh, 'win') for a, b in fr['windows']]
sh.wall_with_openings('front', ops, 'wall', 'wall', 0.0, 'frame', mull=1.6)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
for (a, b) in fr['windows']:
    if b - a > 1: xf0.rbox(sh.w('front', 'frame'), a - 0.05, b + 0.05, fr['sill'] - 0.04, fr['sill'], Z1 - 0.22, Z1, r=0.006, seg=1)
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.5, 5.5, vz), (-7.5, 5.5, vz), (-7.5, -1.0, vz), (7.5, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
for xx in (-2.6, -1.0, 0.6): sh.hanging_pothos('pothos', xx, 2.75, Z1 - 0.35, n=14, drop=1.1, size=0.085)              # 窗上的垂吊黃金葛（v1b：小葉、往下垂）
for xx in (-2.6, -1.0, 0.6): Xf(xx, Z1 - 0.35, 0, 2.75).lathe(sh.a('vcg'), [(0.0, 0.0), (0.08, 0.0), (0.1, 0.11), (0.0, 0.11)], 0, 0, 0, seg=10, col='#efe9de'); xf0.cyl(sh.a('vcm'), (xx, H, Z1 - 0.35), (xx, 2.89, Z1 - 0.35), 0.003, col='#8a8a86', seg=3, caps=False)
sh.tally('shell')

# ---------------------------------------------------------------- 後牆的長吧台、綠磁磚、層板、抽油煙機、黑板
ct = IT['counter'][0]; cx0, cx1, cz0, cz1 = ct['x'] - ct['w'] / 2, ct['x'] + ct['w'] / 2, ct['z'] - ct['d'] / 2, ct['z'] + ct['d'] / 2
xf0.rbox(sh.a('wood'), cx0, cx1, 0.0, ct['h'] - 0.05, cz0, cz1, r=0.01, seg=1)
for k in range(40): xx = cx0 + 0.06 + k * (ct['w'] - 0.12) / 39; xf0.rbox(sh.a('vc'), xx - 0.035, xx + 0.035, 0.08, ct['h'] - 0.12, cz1, cz1 + 0.012, r=0.0, seg=1, col=OAK2)   # 直紋
sh.a('bulb').box(cx0 + 0.05, cx1 - 0.05, ct['h'] - 0.1, ct['h'] - 0.085, cz1 + 0.02, cz1 + 0.03)                    # 檯面下的燈條
xf0.rbox(sh.a('vcg'), cx0 - 0.03, cx1 + 0.03, ct['h'] - 0.05, ct['h'], cz0 - 0.02, cz1 + 0.06, r=0.012, seg=1, col=STONE)
top = ct['h']; m = sh.a('vcm')
em = Xf(cx0 + 1.2, ct['z'] - 0.05, 0.0, top); em.rbox(sh.a('vcg'), -0.46, 0.46, 0.0, 0.5, -0.24, 0.22, r=0.03, seg=2, col='#e8e8e6'); em.rbox(sh.a('vcg'), -0.46, 0.46, 0.5, 0.55, -0.24, 0.22, r=0.01, seg=1, col='#3a3a38')   # v1b 大、亮面
for k in range(3): em.cyl(m, (-0.28 + k * 0.28, 0.22, 0.22), (-0.28 + k * 0.28, 0.18, 0.3), 0.04, col='#2e2e2e', seg=8)
for k in range(6): K.mug(sh, cx0 + 0.95 + (k % 3) * 0.16, ct['z'] - 0.1 + (k // 3) * 0.14, top + 0.55, col='#f6f3ec', r=0.03, h=0.06, handle=False)
for (gx, hh) in ((cx0 + 1.85, 0.42), (cx0 + 2.6, 0.38)):                                                                 # 磨豆機兩台
    g = Xf(gx, ct['z'] - 0.05, 0, top); g.rbox(m, -0.09, 0.09, 0.0, hh * 0.65, -0.09, 0.09, r=0.02, seg=1, col='#e4e4e0'); g.lathe(sh.a('glass'), [(0.03, hh * 0.65), (0.08, hh), (0.07, hh + 0.02)], 0, 0, 0, seg=10)
for k in range(6): Xf(cx0 + 0.25 + k * 0.1, ct['z'] - 0.15, 0, top).lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.04, 0.1), (0.0, 0.1)], 0, 0, 0, seg=8, col='#f6f3ec')   # 一疊外帶杯
pc0, pc1 = cx1 - 1.75, cx1 - 0.95                                                                                        # 甜點櫃（v1b：加高、木框、三層麵包）
xf0.rbox(sh.a('wood'), pc0, pc1, top, top + 0.06, cz0 + 0.05, cz1 - 0.05, r=0.006, seg=1)
for (ax, az) in ((pc0, cz0 + 0.05), (pc1 - 0.03, cz0 + 0.05), (pc0, cz1 - 0.08), (pc1 - 0.03, cz1 - 0.08)): xf0.rbox(sh.a('wood'), ax, ax + 0.03, top + 0.06, top + 0.48, az, az + 0.03, r=0.003, seg=1)
xf0.rbox(sh.a('wood'), pc0, pc1, top + 0.48, top + 0.51, cz0 + 0.05, cz1 - 0.05, r=0.004, seg=1)
sh.a('glass').box(pc0 + 0.01, pc1 - 0.01, top + 0.06, top + 0.48, cz0 + 0.06, cz1 - 0.06); sh.a('bulb').box(pc0 + 0.04, pc1 - 0.04, top + 0.465, top + 0.475, cz0 + 0.1, cz1 - 0.1)
for y in (top + 0.2, top + 0.33): sh.a('glass').box(pc0 + 0.02, pc1 - 0.02, y, y + 0.01, cz0 + 0.07, cz1 - 0.07)
for row, y in enumerate((top + 0.06, top + 0.21, top + 0.34)):
    for k in range(5): Xf(pc0 + 0.1 + k * 0.15, ct['z'] + 0.03 * (k % 2), 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.055, 0.035), (0.035, 0.06), (0.0, 0.065)], 0, 0, 0, seg=8, col=('#e8b868', '#d9a050', '#f0d090', '#c98a40', '#f4e4c0')[(k + row) % 5])
CK.ph_put('CashRegister_01', cx1 - 0.55, top, ct['z'], yaw=math.pi, height=0.3, decimate=0.1)   # 收銀機（Poly Haven 掃描）
pu = Xf(cx1 - 0.2, cz1 - 0.02, 0.0, top); pu.rbox(sh.a('wood'), -0.16, 0.16, 0.0, 0.02, -0.04, 0.04, r=0.004, seg=1)
sh.img_quad(sh.a('print'), pu, 0, 0.02, 0.0, 0.3, 0.15, K.cell_uv(6, 0, 2, 1), tilt=0.15)
CK.ph_put('potted_plant_04', cx1 - 0.08, top, ct['z'] - 0.12, yaw=0.4, share=False, height=0.36, decimate=0.02)
tw = IT['tile_wall'][0]; tx0, tx1 = tw['x0'], tw['x1']                                                                    # 綠磁磚（15 cm 方磚，四色交錯）
for i in range(int((tx1 - tx0) / 0.15)):
    for j in range(int(2.0 / 0.15)):
        x = tx0 + 0.075 + i * 0.15; y = 0.95 + 0.075 + j * 0.15
        if tx0 + 2.3 < x < tx0 + 3.4 and y > 1.6: continue                                                                # 抽油煙機那一段
        xf0.rbox(sh.a('vcg'), x - 0.07, x + 0.07, y - 0.07, y + 0.07, Z0, Z0 + 0.012, r=0.0, seg=1, col=R.choice(['#9fb59c', '#98b096', '#a6bba3', '#93ab91']))
xf0.rbox(sh.a('vcm'), tx0 + 2.3, tx0 + 3.4, 0.95, 1.6, Z0, Z0 + 0.012, r=0.004, seg=1, col='#d8d8d4')     # 抽油煙機下的不鏽鋼牆
xf0.rbox(sh.a('vcg'), tx0 + 2.25, tx0 + 3.45, 1.95, 2.45, Z0, Z0 + 0.55, r=0.02, seg=1, col='#dadad8'); xf0.rbox(sh.a('vcg'), tx0 + 2.22, tx0 + 3.48, 1.93, 1.98, Z0, Z0 + 0.58, r=0.01, seg=1, col='#a8a8a4'); xf0.rbox(m, tx0 + 2.6, tx0 + 3.1, 2.45, H, Z0, Z0 + 0.3, r=0.01, seg=1, col='#cfcfcb')
for (y, kind) in ((1.75, 'bowl'), (2.25, 'jar')):                                                                       # 兩層木層板（抽油煙機兩邊）
    for (a0, a1) in ((tx0 + 0.1, tx0 + 2.15), (tx0 + 3.55, tx1 - 0.1)):
        xf0.rbox(sh.a('wood'), a0, a1, y - 0.035, y, Z0 + 0.012, Z0 + 0.3, r=0.004, seg=1)
        n = max(3, int((a1 - a0) / 0.11))
        for k in range(n):
            xx = a0 + 0.1 + k * (a1 - a0 - 0.2) / (n - 1)
            if kind == 'bowl': Xf(xx, Z0 + 0.15, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.08, 0.06), (0.075, 0.065)], 0, 0, 0, seg=10, col='#f6f3ec') if k % 3 else K.mug(sh, xx, Z0 + 0.15, y, col='#f6f3ec')
            else: K.jar(sh, xx, Z0 + 0.15, y, h=0.18, r=0.05, col=('#c9a26a', '#e8d8b0', '#8a6a3a')[k % 3], lid='#efe9de')
    for (a0, a1) in ((tx0 + 0.1, tx0 + 2.15), (tx0 + 3.55, tx1 - 0.1)):
        for xx in (a0 + 0.1, a1 - 0.1): xf0.cyl(sh.a('vcm'), (xx, H, Z0 + 0.2), (xx, y, Z0 + 0.2), 0.008, col='#2e2e2e', seg=4, caps=False) if y > 2 else None
for xx in (tx0 + 0.9, tx1 - 0.6): CK.ph_put('potted_plant_04', xx, 2.25, Z0 + 0.15, yaw=R.uniform(0, 6.28), share=False, height=0.34, decimate=0.02)
mb = IT['menu_board'][0]; sh.wall_img('back', 'print', mb['along'], mb['y'], mb['w'], mb['h'], K.cell_uv(4, 0, 2, 2), off=0.03)
xf0.rbox(sh.w('back', 'wood'), mb['along'] - mb['w'] / 2 - 0.03, mb['along'] + mb['w'] / 2 + 0.03, mb['y'] - mb['h'] / 2 - 0.03, mb['y'] + mb['h'] / 2 + 0.03, Z0, Z0 + 0.028, r=0.005, seg=1)
for k, xx in enumerate((cx0 + 0.6, cx0 + 2.1, cx1 - 0.6)): wood_pendant(xx, ct['z'] + 0.15, 2.6, r=0.2)
sh.tally('counter')

# ---------------------------------------------------------------- 卡座、牆上的 Daybreak、插畫
bq = IT['banquette'][0]; qx0, qx1 = bq['x'] - bq['w'] / 2, bq['x'] + bq['w'] / 2
xf0.rbox(sh.a('wood'), qx0, qx1, 0.0, 0.38, Z0, Z0 + bq['d'], r=0.012, seg=1)
xf0.rbox(sh.a('vcg'), qx0 + 0.02, qx1 - 0.02, 0.38, 0.47, Z0 + 0.1, Z0 + bq['d'] + 0.02, r=0.04, seg=2, col=SAGE)
for k in range(11): xf0.rbox(sh.a('vcg'), qx0 + 0.03 + k * (bq['w'] - 0.06) / 11, qx0 + 0.03 + (k + 1) * (bq['w'] - 0.06) / 11 - 0.012, 0.47, 1.05, Z0 + 0.02, Z0 + 0.15, r=0.04, seg=2, col=SAGE2)
for (xx, col) in ((qx0 + 0.45, '#f0d070'), (qx1 - 0.4, '#f4e4a0')): Xf(xx, Z0 + 0.25, 0.25).rbox(sh.a('vc'), -0.2, 0.2, 0.48, 0.84, -0.07, 0.07, r=0.06, seg=2, col=col)
mu = IT['mural'][0]; sh.wall_img('back', 'print', mu['along'], mu['y'], mu['w'], mu['h'], K.cell_uv(0, 0, 4, 2), off=0.004)
for k, ar in enumerate(IT['art']):
    ar = dict(ar, y=2.75)                                                                                             # v1b：層板在下面，畫往上移
    sh.wall_img('left', 'print', ar['along'], ar['y'], ar['w'], ar['h'], K.cell_uv(k * 2, 2, 2, 2), off=0.025)
    xf0.rbox(sh.w('left', 'wood'), X0, X0 + 0.02, ar['y'] - ar['h'] / 2 - 0.03, ar['y'] + ar['h'] / 2 + 0.03, ar['along'] - ar['w'] / 2 - 0.03, ar['along'] + ar['w'] / 2 + 0.03, r=0.004, seg=1)
mt = IT['mat'][0]; xf0.rbox(sh.a('vc'), mt['x'] - mt['w'] / 2, mt['x'] + mt['w'] / 2, 0.0, 0.012, mt['z'] - mt['d'] / 2, mt['z'] + mt['d'] / 2, r=0.004, seg=1, col='#b8935e')
for (y, kind) in ((1.55, 'jar'), (2.05, 'cup')):                                                                       # 西牆兩層開放層板（v1b：遠處那面牆不要空）
    xf0.rbox(sh.w('left', 'wood'), X0, X0 + 0.26, y - 0.035, y, -1.3, 3.4, r=0.004, seg=1)
    for k in range(int(4.7 / 0.16)):
        zz = -1.2 + k * 0.16
        if 0.0 < zz < 1.8 and kind == 'jar' and k % 5: continue                                                           # 長桌後面那段留空一點（人坐著頭會碰到）
        if k % 6 == 0: CK.ph_put('potted_plant_04', X0 + 0.13, y, zz, yaw=R.uniform(0, 6.28), share=False, height=0.3, decimate=0.02)
        elif kind == 'jar': K.jar(sh, X0 + 0.13, zz, y, h=0.18, r=0.05, col=('#c9a26a', '#e8d8b0', '#8a6a3a', '#d9b070')[k % 4], lid='#efe9de')
        else: K.mug(sh, X0 + 0.13, zz, y, col=('#f6f3ec', '#e8dcc8', '#a8b8a0')[k % 3], r=0.038, h=0.08)
for zz in (-1.2, 3.3): xf0.cyl(sh.w('left', 'vcm'), (X0 + 0.2, 1.52, zz), (X0 + 0.2, H, zz), 0.008, col='#2e2e2e', seg=4, caps=False)
sh.hanging_pothos('pothos', X0 + 0.15, 2.05, 2.9, n=10, drop=0.8, size=0.085); sh.hanging_pothos('pothos', X0 + 0.15, 2.05, -0.9, n=10, drop=0.8, size=0.085)
sh.tally('banquette')

# ---------------------------------------------------------------- 桌子、椅子、桌上的早午餐
for tid, t in TB.items():
    if t['kind'] == 'pedestal':
        xf0.rbox(sh.a('wood'), t['x'] - t['w'] / 2, t['x'] + t['w'] / 2, 0.71, 0.75, t['z'] - t['d'] / 2, t['z'] + t['d'] / 2, r=0.01, seg=1)
        Xf(t['x'], t['z']).cyl(sh.a('vcg'), (0, 0.0, 0), (0, 0.71, 0), 0.05, col='#7e937b', seg=10)
        Xf(t['x'], t['z']).lathe(sh.a('vcg'), [(0.0, 0.0), (0.22, 0.0), (0.2, 0.03), (0.0, 0.04)], 0, 0, 0, seg=14, col='#7e937b')
    else: K.rect_table(sh, t['x'], t['z'], 0.0, t['w'], t['d'], h=0.75, top_key='wood', leg_key='wood', leg='wood')
    for s_ in LAY['seats']:
        if s_['table'] == tid and not s_.get('seatH'):
            chair(s_['x'] + math.sin(s_['yaw']) * -0.04, s_['z'] + math.cos(s_['yaw']) * -0.04, s_['yaw'], cushion=(SAGE if tid in (4, 5) and s_['z'] > t['z'] else CREAM), spindle=t['kind'] == 'small')
    vase(t['x'], t['z'] + (0.0 if t['kind'] != 'small' else -0.18), 0.75)
for tid in (1, 2, 3, 4, 5, 7, 8):
    t = TB[tid]
    for s_ in LAY['seats']:
        if s_['table'] == tid and (tid in (4, 5, 7, 8) or s_['x'] < t['x']):
            sx, sz = s_['x'], s_['z']; ex, ez = t['x'] + (sx - t['x']) * 0.45, t['z'] + (sz - t['z']) * 0.45
            setting(ex, ez, 0.75, s_['yaw'] + math.pi, food=(tid + int(sx * 10)) % 3 != 0)
for k in range(2): K.mug(sh, TB[1]['x'] + 0.12 + k * 0.1, TB[1]['z'] + 0.1, 0.75, col='#f6f3ec')
for zz in (1.0, -0.4): wood_pendant(TB[4]['x'] if zz > 0 else 1.3, zz if zz > 0 else -2.9, 2.55, r=0.24)
wood_pendant(TB[5]['x'], TB[5]['z'], 2.55, r=0.24); wood_pendant(TB[6]['x'], TB[6]['z'], 2.6, r=0.2)
sh.tally('tables')

for p_ in IT['plant_big']: leafy(p_['x'], p_['z'])
CK.drop_protos()
info = sh.finish(OUT, keep=lambda ob: ob.name.startswith('S_ph_'), extra_info={'layout': LAY['version'], 'seats': len(LAY['seats']), 'cc0': [list(u) for u in CK.used()]})
print('CC0_USED', CK.used())
