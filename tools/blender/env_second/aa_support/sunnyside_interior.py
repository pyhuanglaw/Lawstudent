"""SUNNY SIDE（溫州街 B7，取代半熟；歐式街角早午餐）室內 → GLB（AA 2026-11-04；AA_654／AA_655，使用者 11-04 04:4x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/sunnyside_interior.py [-- --out assets/models/env/second_ai/aa_support/sunnyside.glb]
遊戲區域照舊是 `wz_brunch`；配置 src/data/sunnyside_layout.js（WZ_SHOPS_LAYOUT.brunch 的新版）。參考圖 docs/story_planning/ref_images/shops/wz_sunnyside_int.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py sns（sns_checker.png 黑白斜鋪小方磚、sns_print.png 菜單板、櫃台木牌、水彩畫、桌卡）；窗景 mok_view.png。
明亮的歐式早午餐：奶油白灰泥牆、白色外露天花板（管線、軌道燈、嵌入式冷氣）、胡桃木出餐檯和結帳櫃台、深綠菜單板、黃銅吊燈和壁燈、奶油色長沙發、曲木藤面椅、大理石小圓桌。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/sunnyside_layout.js', 'SUNNYSIDE_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('sns_', 'sunnyside_interior', W, D, H, texres=512, props={'layout': LAY['version'], 'zone': 'wz_brunch'}, seed=1105)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'view', 'floor'}
P = 'sns_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_checker', 'sns_checker.png', rough=0.35, tile=0.8),
    'wall': CL.soft_plaster(P + 'wall_cream', '#efe6d6', 0.9, cull=True, tile=1.6, k=0.2),
    'wood': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#4e3220', maps=('diff',), res=256, rough_value=0.45, cull=True),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'bulb': L.flat(P + 'bulb', '#fff4e0', rough=0.3, emit=B.srgb('#ffd8a0')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.12),
    'print': K.img_mat(P + 'print', 'sns_print.png', rough=0.7),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
TB = {t['id']: t for t in LAY['tables']}
xf0 = Xf(0, 0); R = random.Random(1105)
WAL = '#4e3220'; WAL2 = '#3e2818'; BRASS = '#b8944a'; IRON = '#2a2a28'; CREAM = '#e8dcc4'; CREAM2 = '#ddd0b6'; RATTAN = '#c8a870'; MARBLE = '#ece8e2'; GREEN = '#2c3e32'; STEEL = '#c0c0bc'; CEIL = '#f2efe8'


def bentwood(x, z, yaw):
    """曲木椅：深木色細腳、藤編圓坐墊、彎成圈的椅背"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.17, 0.15), (0.17, 0.15), (-0.15, -0.16), (0.15, -0.16)):
        xf.cyl(m, (sx * 1.1, 0.0, sz * 1.1), (sx, 0.45, sz), 0.016, col=WAL2, seg=5, caps=False)
    xf.lathe(m, [(0.0, 0.43), (0.2, 0.43), (0.21, 0.46), (0.0, 0.46)], 0, 0, 0, seg=14, col=WAL2)
    xf.lathe(sh.a('vc'), [(0.0, 0.46), (0.19, 0.46), (0.19, 0.47), (0.0, 0.475)], 0, 0, 0, seg=14, col=RATTAN)
    pts = [(0.17 * math.cos(t), 0.5 + 0.38 * math.sin(t) ** 0.6, -0.17 - 0.03 * math.sin(t)) for t in [math.pi * k / 8 for k in range(9)]]
    for a, b in zip(pts[:-1], pts[1:]): xf.cyl(m, a, b, 0.014, col=WAL2, seg=5, caps=False)
    xf.lathe(m, [(0.17, 0.25), (0.18, 0.25), (0.18, 0.27), (0.17, 0.27)], 0, 0, 0, seg=12, col=WAL2)


def stool(x, z, h=0.72):
    xf = Xf(x, z, 0.0); m = sh.a('vc')
    xf.lathe(m, [(0.0, h - 0.04), (0.17, h - 0.04), (0.18, h - 0.01), (0.0, h)], 0, 0, 0, seg=14, col=WAL2)
    xf.lathe(m, [(0.0, h), (0.17, h), (0.17, h + 0.01), (0.0, h + 0.012)], 0, 0, 0, seg=14, col=RATTAN)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        xf.cyl(m, (c * 0.19, 0.0, s_ * 0.19), (c * 0.12, h - 0.04, s_ * 0.12), 0.018, col=WAL2, seg=5, caps=False)
    xf.lathe(sh.a('vcm'), [(0.16, 0.27), (0.175, 0.27), (0.175, 0.29), (0.16, 0.29)], 0, 0, 0, seg=14, col=BRASS)


def iron_base(x, z, h):
    """鑄鐵桌腳：中柱＋四爪"""
    xf = Xf(x, z); m = sh.a('vcm')
    xf.lathe(m, [(0.0, 0.0), (0.06, 0.0), (0.03, 0.08), (0.025, h - 0.06), (0.06, h - 0.03), (0.0, h - 0.03)], 0, 0, 0, seg=10, col=IRON)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; xf.cyl(m, (0, 0.06, 0), (math.cos(a) * 0.28, 0.01, math.sin(a) * 0.28), 0.018, col=IRON, seg=5)


def table_items(x, z, y, k=0):
    """桌上：玻璃水杯兩個、小花瓶（滿天星或粉色花）、桌卡"""
    for j in range(2): K.glass_cup(sh, x - 0.12 + j * 0.24, z + 0.1, y, h=0.1, r=0.03, fill='#e8eef0')
    Xf(x, z - 0.05, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.022, 0.13)], 0, 0, 0, seg=8)
    for j in range(6):
        a = j * 1.1; tx, tz = math.cos(a) * 0.05, math.sin(a) * 0.05
        Xf(x, z - 0.05).cyl(sh.a('vc'), (0, y + 0.1, 0), (tx, y + 0.22 + (j % 2) * 0.04, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.012), (0.022, -0.004), (0.023, 0.0), (0.0, 0.01)], seg=5), ('#f6f2ea', '#f0c8c4')[k % 2]), Matrix.Translation(g2b(x + tx, y + 0.22 + (j % 2) * 0.04, z - 0.05 + tz)))
    sh.img_quad(sh.a('print'), Xf(x + 0.14, z - 0.12, 0.3, y), 0.0, 0.0, 0.0, 0.08, 0.1, K.cell_uv(6, 2, 1, 1), tilt=0.15)


def sconce(side, along, y=1.95):
    wx = sh.wall_xf(side, along, 0.0, y); wx.rbox(sh.w(side, 'vcm'), -0.04, 0.04, -0.07, 0.07, 0.0, 0.03, r=0.01, seg=1, col=BRASS)
    wx.cyl(sh.w(side, 'vcm'), (0, -0.02, 0.02), (0, 0.04, 0.16), 0.009, col=BRASS, seg=5)
    px_, py_, pz_ = wx.p(0, 0.06, 0.17); Xf(px_, pz_, 0, py_).lathe(sh.a('bulb'), [(0.08, 0.0), (0.1, 0.0), (0.07, 0.16), (0.05, 0.16)], 0, 0, 0, seg=14)
    CL.glow(sh.root, 'sconce', px_, py_ + 0.08, pz_, color='rgba(255,215,160,1)', size=0.5, day=0.0, night=0.85)


def brass_pendant(x, z, y, r=0.22):
    K.dome_pendant(sh, x, z, y, r=r, col='#a8843e', inner='#f8e6c0', kind='dome', glow_size=0.75)


# ---------------------------------------------------------------- 地板（黑白斜鋪小方磚）、白色外露天花板、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=0.8).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for z_ in (-1.5, 1.6): xf0.rbox(sh.a('vcm'), X0, X1, H - 0.3, H - 0.005, z_ - 0.15, z_ + 0.15, r=0.0, seg=1, col=CEIL)   # 白色的梁
for (xx, r_) in ((-2.6, 0.06), (-2.35, 0.035), (2.7, 0.045)): xf0.cyl(sh.a('vcm'), (xx, H - 0.38, Z0), (xx, H - 0.38, Z1), r_, col='#e8e6e0', seg=8, caps=False)   # 管線（白漆）
xf0.rbox(sh.a('vcm'), -0.45, 0.45, H - 0.34, H - 0.3, 2.6, 3.5, r=0.01, seg=1, col='#f4f2ee'); xf0.rbox(sh.a('vcm'), -0.33, 0.33, H - 0.345, H - 0.34, 2.72, 3.38, r=0.0, seg=1, col='#b8b6b0')   # 嵌入式冷氣
for xx in (-1.6, 1.5):                                                                                                    # 黑色軌道燈（沿 z）
    xf0.rbox(sh.a('vcm'), xx - 0.02, xx + 0.02, H - 0.34, H - 0.31, Z0 + 1.6, Z1 - 0.8, r=0.004, seg=1, col='#24221f')
    for k in range(5):
        z_ = Z0 + 2.0 + k * 1.6; sp = Xf(xx, z_, 0.0); sp.cyl(sh.a('vcm'), (0, H - 0.34, 0), (0.04 if xx < 0 else -0.04, H - 0.48, 0), 0.03, col='#24221f', seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', xx, H - 0.7, z_, color='rgba(255,225,180,1)', size=0.5, day=0.0, night=0.5)
fr = LAY['front']; dx0, dx1 = fr['door']['x'] - fr['door']['w'] / 2, fr['door']['x'] + fr['door']['w'] / 2
ops = [(fr['windows'][0][0], fr['windows'][0][1], fr['sill'], fr['head'], 'win'), (dx0, dx1, 0.0, 2.55, 'door'), (fr['windows'][1][0], fr['windows'][1][1], fr['sill'], fr['head'], 'win')]
sh.wall_with_openings('front', ops, 'wood', 'wall', 0.75, 'wood', mull=0.5)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
    sh.wall_box(side, 'wood', a0, a1, 0.0, 0.12, -0.015, 0.0)
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.0, 4.5, vz), (-7.0, 4.5, vz), (-7.0, -1.0, vz), (7.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
for (side, along) in (('left', -1.5), ('left', 1.4), ('right', 0.2), ('right', 3.4)): sconce(side, along)
sh.tally('shell')

# ---------------------------------------------------------------- 開放廚房（照舊位置）：料理台、冰箱、銅鍋吊桿、層架、排油煙罩
kl = IT['kitchen_line'][0]; kx0, kx1 = kl['x'] - kl['w'] / 2, kl['x'] + kl['w'] / 2; kz0, kz1 = kl['z'] - kl['d'] / 2, kl['z'] + kl['d'] / 2
xf0.rbox(sh.a('vcm'), kx0, kx1, 0.0, 0.88, kz0, kz1, r=0.0, seg=1, col=STEEL); xf0.rbox(sh.a('vcm'), kx0, kx1, 0.88, 0.91, kz0, kz1 + 0.02, r=0.0, seg=1, col='#d8d8d4')
xf0.rbox(sh.a('vcm'), X0, X1, 0.91, 2.0, Z0, Z0 + 0.012, r=0.0, seg=1, col='#a8a8a4')                                    # 不鏽鋼背板
for k in range(2): Xf(kx0 + 0.9 + k * 0.6, kl['z'], 0, 0.91).lathe(sh.a('vcm'), [(0.0, 0.0), (0.15, 0.0), (0.15, 0.12), (0.14, 0.12), (0.14, 0.01), (0.0, 0.01)], 0, 0, 0, seg=12, col='#8a8a86')
xf0.rbox(sh.a('vcm'), kx0 + 2.2, kx0 + 3.0, 0.91, 0.95, kz0 + 0.1, kz1 - 0.1, r=0.0, seg=1, col='#3a3a38')                # 煎台
hood = Xf(kx0 + 1.6, Z0 + 0.35, 0, 1.95); hood.rbox(sh.a('vcm'), -1.0, 1.0, 0.0, 0.1, -0.35, 0.3, r=0.0, seg=1, col=STEEL)
hood.rbox(sh.a('vcm'), -0.7, 0.7, 0.1, 0.45, -0.35, 0.0, r=0.0, seg=1, col=STEEL); hood.rbox(sh.a('vcm'), -0.25, 0.25, 0.45, H - 1.95, -0.35, -0.1, r=0.0, seg=1, col=STEEL)
xf0.cyl(sh.a('vcm'), (kx0 + 0.3, 1.95, Z0 + 0.45), (kx0 + 1.6, 1.95, Z0 + 0.45), 0.012, col=BRASS, seg=6)                 # 銅鍋吊桿
for k in range(4):
    x = kx0 + 0.45 + k * 0.33; xf0.cyl(sh.a('vcm'), (x, 1.95, Z0 + 0.45), (x, 1.62, Z0 + 0.45), 0.006, col=BRASS, seg=4)
    Xf(x, Z0 + 0.45, 0, 1.45).lathe(sh.a('vcm'), [(0.0, 0.0), (0.1 + 0.015 * k, 0.0), (0.11 + 0.015 * k, 0.12), (0.0, 0.12)], 0, 0, 0, seg=12, col='#b06a3a')
for y in (1.35, 1.7):                                                                                                    # 右邊的不鏽鋼層架（盤子、碗）
    xf0.rbox(sh.a('vcm'), kx1 - 1.6, kx1, y - 0.02, y, Z0 + 0.02, Z0 + 0.35, r=0.0, seg=1, col=STEEL)
    for k in range(6): K.plate(sh, kx1 - 1.45 + k * 0.26, Z0 + 0.18, y, r=0.1, col='#f4f2ea')
fg = IT['fridge'][0]; xf0.rbox(sh.a('vcm'), fg['x'] - fg['w'] / 2, fg['x'] + fg['w'] / 2, 0.0, fg['h'], fg['z'] - fg['d'] / 2, fg['z'] + fg['d'] / 2, r=0.02, seg=1, col='#d8d8d4')
xf0.rbox(sh.a('vcm'), fg['x'] - fg['w'] / 2 + 0.06, fg['x'] - fg['w'] / 2 + 0.09, 0.9, 1.5, fg['z'] + fg['d'] / 2, fg['z'] + fg['d'] / 2 + 0.03, r=0.0, seg=1, col='#8a8a86')
sh.tally('kitchen')

# ---------------------------------------------------------------- 出餐檯（照舊位置）：胡桃木框格、石材檯面、咖啡機、磨豆機、杯子、甜點櫃、高腳凳；上方矮牆＋菜單板
pc = IT['pass_counter'][0]; px0, px1 = pc['x'] - pc['w'] / 2, pc['x'] + pc['w'] / 2; pz0, pz1 = pc['z'] - pc['d'] / 2, pc['z'] + pc['d'] / 2; ph = pc['h']
xf0.rbox(sh.a('wood'), px0, px1, 0.0, ph - 0.04, pz0, pz1, r=0.0, seg=1)
for k in range(6):
    x = px0 + 0.06 + k * (pc['w'] - 0.12) / 6; xf0.rbox(sh.a('vc'), x + 0.06, x + (pc['w'] - 0.12) / 6 - 0.06, 0.14, ph - 0.16, pz1, pz1 + 0.018, r=0.0, seg=1, col=WAL2)
xf0.rbox(sh.a('vcg'), px0 - 0.03, px1 + 0.03, ph - 0.04, ph, pz0 - 0.02, pz1 + 0.05, r=0.01, seg=1, col='#e4ded2')         # 淺色石材檯面
em = Xf(px0 + 1.6, pc['z'] - 0.05, 0.0, ph); em.rbox(sh.a('vcg'), -0.45, 0.45, 0.0, 0.42, -0.2, 0.18, r=0.03, seg=2, col='#d8d8d6'); em.rbox(sh.a('vcg'), -0.45, 0.45, 0.42, 0.46, -0.2, 0.18, r=0.01, seg=1, col='#2e2e2e')
for k in range(3): em.cyl(sh.a('vcm'), (-0.25 + k * 0.25, 0.2, 0.18), (-0.25 + k * 0.25, 0.16, 0.26), 0.035, col='#2e2e2e', seg=8)
for k in range(8): K.mug(sh, px0 + 1.25 + (k % 4) * 0.22, pc['z'] - 0.1 + (k // 4) * 0.14, ph + 0.46, col='#f4f2ea', r=0.03, h=0.06, handle=False)
g = Xf(px0 + 1.0, pc['z'] - 0.05, 0, ph); g.rbox(sh.a('vcm'), -0.08, 0.08, 0.0, 0.32, -0.08, 0.08, r=0.02, seg=1, col='#2e2e2e'); g.lathe(sh.a('glass'), [(0.03, 0.32), (0.08, 0.5), (0.07, 0.52)], 0, 0, 0, seg=10)
cx0_, cx1_ = px1 - 1.5, px1 - 0.1                                                                                         # 玻璃甜點櫃（右段）
xf0.rbox(sh.a('wood'), cx0_, cx1_, ph, ph + 0.05, pz0 + 0.03, pz1 - 0.02, r=0.0, seg=1)
sh.a('glass').box(cx0_ + 0.01, cx1_ - 0.01, ph + 0.05, ph + 0.5, pz0 + 0.04, pz1 - 0.03); sh.a('bulb').box(cx0_ + 0.04, cx1_ - 0.04, ph + 0.485, ph + 0.495, pz0 + 0.08, pz1 - 0.08)
sh.a('glass').box(cx0_ + 0.02, cx1_ - 0.02, ph + 0.26, ph + 0.27, pz0 + 0.05, pz1 - 0.05)
for row, y in enumerate((ph + 0.05, ph + 0.27)):
    for k in range(6): Xf(cx0_ + 0.14 + k * 0.23, pc['z'] + 0.02, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.075, 0.0), (0.07, 0.06), (0.04, 0.08), (0.0, 0.085)], 0, 0, 0, seg=10, col=('#d8a060', '#f0dcb8', '#c88a50', '#f4e8d0')[(k + row) % 4])
for k, x in enumerate((cx0_ + 0.35, cx0_ + 1.0)):                                                                         # 兩個玻璃罩蛋糕
    Xf(x, pc['z'], 0, ph + 0.5).lathe(sh.a('vcg'), [(0.0, 0.0), (0.14, 0.0), (0.14, 0.02), (0.0, 0.02)], 0, 0, 0, seg=14, col='#f4f2ea')
    Xf(x, pc['z'], 0, ph + 0.52).lathe(sh.a('vcg'), [(0.0, 0.0), (0.1, 0.0), (0.1, 0.09), (0.0, 0.095)], 0, 0, 0, seg=12, col='#d8a060')
    Xf(x, pc['z'], 0, ph + 0.52).lathe(sh.a('glass'), [(0.13, 0.0), (0.13, 0.15), (0.09, 0.24), (0.02, 0.27), (0.0, 0.28)], 0, 0, 0, seg=14)
Xf(px0 + 0.4, pc['z'] + 0.08, 0, ph).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.05), (0.035, 0.08), (0.0, 0.085)], 0, 0, 0, seg=10, col='#f2d070')   # 蛋計時器（老闆娘的）
for s_ in LAY['seats']:
    if s_.get('kind') == 'stool': stool(s_['x'], s_['z'] - 0.05)
mw = IT['menu_wall'][0]; mx0, mx1 = mw['x'] - mw['w'] / 2, mw['x'] + mw['w'] / 2
xf0.rbox(sh.a('vcg'), mx0, mx1, mw['y0'], H, mw['z'] - 0.06, mw['z'] + 0.06, r=0.0, seg=1, col='#efe6d6')                 # 出餐檯上方的矮牆
xf0.rbox(sh.a('wood'), mw['x'] - 1.25, mw['x'] + 1.25, 2.22, 3.06, mw['z'] + 0.06, mw['z'] + 0.09, r=0.0, seg=1)
sh.img_quad(sh.a('print'), Xf(mw['x'], mw['z'] + 0.095, 0.0, 0.0), 0.0, 2.26, 0.0, 2.4, 0.8, K.cell_uv(0, 0, 6, 2))
for k in range(2): brass_pendant(mw['x'] - 1.0 + k * 2.0, pc['z'] + 0.35, 2.15, r=0.17)
sh.tally('pass')

# ---------------------------------------------------------------- 結帳櫃台（照舊位置）：金字木牌、黃銅檯燈、收銀機
ca = IT['cashier'][0]; ax0, ax1 = ca['x'] - ca['w'] / 2, ca['x'] + ca['w'] / 2; az0, az1 = ca['z'] - ca['d'] / 2, ca['z'] + ca['d'] / 2
xf0.rbox(sh.a('wood'), ax0, ax1, 0.0, ca['h'] - 0.04, az0, az1, r=0.0, seg=1)
xf0.rbox(sh.a('vcg'), ax0 - 0.03, ax1 + 0.02, ca['h'] - 0.04, ca['h'], az0 - 0.02, az1 + 0.02, r=0.01, seg=1, col='#e4ded2')
sh.img_quad(sh.a('print'), Xf(ax0 - 0.012, ca['z'], -math.pi / 2, 0.0), 0.0, 0.3, 0.0, 0.9, 0.45, K.cell_uv(0, 2, 2, 1))
rg = Xf(ca['x'] + 0.05, ca['z'] - 0.2, -math.pi / 2, ca['h']); rg.rbox(sh.a('vcm'), -0.15, 0.15, 0.0, 0.08, -0.12, 0.12, r=0.01, seg=1, col='#2e2e2e')
rg.rbox(sh.a('vcm'), -0.13, 0.13, 0.12, 0.32, -0.02, 0.0, r=0.005, seg=1, col='#2e2e2e'); rg.cyl(sh.a('vcm'), (0, 0.08, 0.0), (0, 0.13, -0.01), 0.015, col='#2e2e2e', seg=6)
lp = Xf(ca['x'], az1 - 0.18, 0, ca['h']); lp.lathe(sh.a('vcm'), [(0.0, 0.0), (0.08, 0.0), (0.08, 0.02), (0.015, 0.04), (0.012, 0.34), (0.0, 0.35)], 0, 0, 0, seg=12, col=BRASS)
lp.lathe(sh.a('bulb'), [(0.0, 0.48), (0.12, 0.42), (0.15, 0.35), (0.14, 0.34), (0.0, 0.36)], 0, 0, 0, seg=16)
CL.glow(sh.root, 'tablelamp', ca['x'], ca['h'] + 0.4, az1 - 0.18, color='rgba(255,210,150,1)', size=0.5, day=0.0, night=0.8)
Xf(ca['x'] - 0.15, az0 + 0.2, 0, ca['h']).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.1), (0.02, 0.14), (0.0, 0.14)], 0, 0, 0, seg=8)
sh.tally('cashier')

# ---------------------------------------------------------------- 左牆長沙發卡座、鏡子、水彩畫、層架
bq = IT['banquette'][0]; qx0, qx1, qz0, qz1 = bq['x0'], bq['x1'], bq['z0'], bq['z1']
xf0.rbox(sh.a('wood'), qx0, qx1, 0.0, 0.08, qz0, qz1, r=0.0, seg=1)
xf0.rbox(sh.a('vc'), qx0 + 0.15, qx1 + 0.02, 0.08, 0.46, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col=CREAM)
n = 12
for k in range(n): xf0.rbox(sh.a('vc'), qx0 + 0.02, qx0 + 0.18, 0.46, 1.08, qz0 + 0.03 + k * (qz1 - qz0 - 0.06) / n, qz0 + 0.03 + (k + 1) * (qz1 - qz0 - 0.06) / n - 0.012, r=0.04, seg=2, col=CREAM2)
for zz in (qz0 + 0.3, qz1 - 0.5): Xf(qx0 + 0.3, zz, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.86, -0.07, 0.07, r=0.06, seg=2, col='#8a8680')
mr = IT['mirror'][0]; mxf = sh.wall_xf('left', mr['along'], 0.0, mr['y'])
mxf.rbox(sh.w('left', 'vcm'), -mr['w'] / 2 - 0.06, mr['w'] / 2 + 0.06, -mr['h'] / 2 - 0.06, mr['h'] / 2 + 0.06, 0.0, 0.03, r=0.02, seg=2, col=BRASS)
mxf.rbox(sh.w('left', 'vcm'), -0.12, 0.12, mr['h'] / 2 + 0.04, mr['h'] / 2 + 0.16, 0.0, 0.035, r=0.04, seg=2, col=BRASS)   # 上緣的雕花
mxf.rbox(sh.w('left', 'vcg'), -mr['w'] / 2, mr['w'] / 2, -mr['h'] / 2, mr['h'] / 2, 0.03, 0.034, r=0.0, seg=1, col='#7a868c')
for pr in IT['print']:
    c = pr['cell']; sh.wall_img(pr['side'], 'print', pr['along'], pr['y'], pr['w'], pr['h'], K.cell_uv(c[0], c[1], c[2], c[3]), off=0.03)
    wx = sh.wall_xf(pr['side'], pr['along'], 0.0, pr['y']); wx.rbox(sh.w(pr['side'], 'wood'), -pr['w'] / 2 - 0.04, pr['w'] / 2 + 0.04, -pr['h'] / 2 - 0.04, pr['h'] / 2 + 0.04, 0.0, 0.025, r=0.0, seg=1)
sw = IT['shelf_wall'][0]; swx = sh.wall_xf('left', sw['z'], 0.0, sw['y'])
swx.rbox(sh.w('left', 'wood'), -sw['w'] / 2, sw['w'] / 2, -0.03, 0.0, 0.0, 0.25, r=0.0, seg=1)
for k in range(7): swx.rbox(sh.w('left', 'vc'), -0.45 + k * 0.055, -0.45 + k * 0.055 + 0.045, 0.0, R.uniform(0.2, 0.27), 0.03, 0.2, r=0.0, seg=1, col=R.choice(('#5a3a24', '#2c3e32', '#7a2a22', '#c8b898')))
px_, py_, pz_ = swx.p(0.25, 0.0, 0.12); sh.plant(px_, pz_, h=0.3, r=0.1, pot_col='#d8d0c0', y0=py_); sh.hanging_pothos('pothos', px_, py_ + 0.05, pz_, n=9, drop=0.8)
sh.tally('left')

# ---------------------------------------------------------------- 桌子、椅子、植物
for t in LAY['tables']:
    if t['kind'] == 'rect':
        xf = Xf(t['x'], t['z']); xf.rbox(sh.a('wood'), -t['w'] / 2, t['w'] / 2, 0.71, 0.75, -t['d'] / 2, t['d'] / 2, r=0.01, seg=1); iron_base(t['x'], t['z'], 0.71)
        table_items(t['x'], t['z'], 0.75, t['id'])
    else:
        Xf(t['x'], t['z']).lathe(sh.a('vcg'), [(0.0, 0.72), (t['r'] - 0.01, 0.72), (t['r'], 0.73), (t['r'], 0.745), (t['r'] - 0.01, 0.75), (0.0, 0.75)], 0, 0, 0, seg=22, col=MARBLE)
        iron_base(t['x'], t['z'], 0.72); table_items(t['x'], t['z'], 0.75, t['id'])
for s_ in LAY['seats']:
    if s_.get('kind') != 'stool' and not s_.get('seatH'): bentwood(s_['x'] - math.sin(s_['yaw']) * 0.04, s_['z'] - math.cos(s_['yaw']) * 0.04, s_['yaw'])
for pb in IT['plant_big']:
    Xf(pb['x'], pb['z']).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col='#e8e2d6')
    sh.plant(pb['x'], pb['z'], h=0.9, r=0.36, pot_col='#6a5a44', y0=0.42)
for t in (TB[3], TB[4]): brass_pendant(t['x'], t['z'], 2.3, r=0.22)
sh.tally('seating')
info = sh.finish(OUT, keep=lambda ob: 'ceiling' in ob.name, extra_info={'layout': LAY['version'], 'zone': 'wz_brunch'})
