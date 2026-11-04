"""2:30 AM（溫州街東端路口，取代兩點半 Café）室內 → GLB（AA 2026-11-04；AA_654，使用者 11-04 04:4x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/cafe230_interior.py [-- --out assets/models/env/second_ai/aa_support/cafe230.glb]
遊戲區域照舊是 `cafe`：固定的位置照 tools/blender/env_second/cafe_layout.py（從 LAWWW2 分支拿）；新加的照 src/data/cafe230_layout.js。
參考圖 docs/story_planning/ref_images/shops/wz_230am_int.webp。美術規則 SCENE_RULES §10～12＋LAWWW2 11-04 04:45。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py a23（a23_print.png）；書背 mok_bookrows.png；窗景 mok_view.png。
深夜感：胡桃木吧台和家具、暖米色灰泥牆、外露的深色天花板管線、黃銅吊燈、燈罩檯燈、綠色皮卡座、拱門；地板淺色木地板（D112，參考圖是中深色）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
import cafe_layout as CF   # noqa: E402  （LAWWW2 的共用配置：固定位置）
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/cafe230_layout.js', 'CAFE230_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = CF.RW, CF.RD, CF.RH
sh = K.Shop('a23_', 'cafe230_interior', W, D, H, texres=512, props={'layout': LAY['version'], 'zone': 'cafe'}, seed=1109)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books', 'view'}
P = 'a23_'
sh.M.update({
    'floor': L.pbr(P + 'floor_wood', 'laminate_floor_02', tile=2.2, target='#c4a07a', maps=('diff',), res=512, rough_value=0.55),
    'wall': CL.soft_plaster(P + 'wall_warm', '#e6d6bc', 0.9, cull=True, tile=1.6, k=0.25),
    'wood': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5e3f28', maps=('diff',), res=256, rough_value=0.45),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'bulb': L.flat(P + 'bulb', '#fff2d8', rough=0.3, emit=B.srgb('#ffcf8a')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.08),
    'print': K.img_mat(P + 'print', 'a23_print.png', rough=0.7),
    'books': K.img_mat(P + 'books', 'mok_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']
IT = {}
for i in LAY['added']: IT.setdefault(i['kind'], []).append(i)
xf0 = Xf(0, 0); R = random.Random(1109)
WAL = '#5a3c26'; WAL2 = '#4a3120'; GREY = '#7a7672'; GREY2 = '#8a857e'; GREEN = '#3e5a46'; BRASS = '#b8944a'; STONE = '#4a4642'; CEIL = '#5c5852'


def chair(x, z, yaw):
    """胡桃木椅：細腳、灰色布坐墊、兩根橫條的鏤空椅背"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.19, 0.18), (0.19, 0.18), (-0.19, -0.18), (0.19, -0.18)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.43, sz * 0.95), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.21, 0.21, 0.39, 0.43, -0.2, 0.2, r=0.01, seg=1, col=WAL)
    xf.rbox(m, -0.2, 0.2, 0.43, 0.49, -0.19, 0.19, r=0.025, seg=2, col=GREY)
    for sx in (-0.19, 0.19): xf.cyl(m, (sx, 0.45, -0.19), (sx, 0.86, -0.22), 0.018, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.2, 0.2, 0.6, 0.655, -0.215, -0.19, r=0.01, seg=1, col=WAL)
    xf.rbox(m, -0.21, 0.21, 0.77, 0.86, -0.235, -0.205, r=0.012, seg=1, col=WAL)


def stool(x, z, h=0.75):
    """吧檯／窗邊高腳椅：圓木坐面、四支腳、黃銅腳踏"""
    xf = Xf(x, z, 0.0); m = sh.a('vc')
    xf.lathe(m, [(0.0, h - 0.04), (0.17, h - 0.04), (0.18, h - 0.01), (0.17, h + 0.005), (0.0, h + 0.01)], 0, 0, 0, seg=14, col=WAL)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        xf.cyl(m, (c * 0.2, 0.0, s_ * 0.2), (c * 0.12, h - 0.04, s_ * 0.12), 0.02, col=WAL2, seg=5, caps=False)
    xf.lathe(sh.a('vcm'), [(0.17, 0.27), (0.19, 0.27), (0.19, 0.29), (0.17, 0.29)], 0, 0, 0, seg=14, col=BRASS)


def shade_lamp(x, z, y, s=1.0):
    """燈罩檯燈：黃銅座、米白百褶燈罩（發光）"""
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcm'), [(0.0, 0.0), (0.07 * s, 0.0), (0.075 * s, 0.02), (0.02, 0.04), (0.012, 0.32 * s), (0.0, 0.33 * s)], 0, 0, 0, seg=12, col=BRASS)
    xf.lathe(sh.a('shade'), [(0.07 * s, 0.28 * s), (0.15 * s, 0.28 * s), (0.11 * s, 0.48 * s), (0.06 * s, 0.48 * s)], 0, 0, 0, seg=16)
    CL.glow(sh.root, 'tablelamp', x, y + 0.38 * s, z, color='rgba(255,200,130,1)', size=0.6, day=0.15, night=0.9)


def mushroom(x, z, y):
    """桌上的黃銅小蘑菇燈＋一顆蠟燭杯"""
    xf = Xf(x, z, 0.0, y)
    xf.lathe(sh.a('vcm'), [(0.0, 0.0), (0.05, 0.0), (0.012, 0.02), (0.012, 0.2), (0.0, 0.2)], 0, 0, 0, seg=10, col=BRASS)
    xf.lathe(sh.a('vcm'), [(0.0, 0.26), (0.06, 0.24), (0.1, 0.19), (0.095, 0.185)], 0, 0, 0, seg=12, col=BRASS)
    sh.a('bulb').sphere((x, y + 0.19, z), 0.025, seg=8, rings=5)
    CL.glow(sh.root, 'tablelamp', x, y + 0.16, z, color='rgba(255,200,130,1)', size=0.4, day=0.0, night=0.7)


def candle(x, z, y):
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.032, 0.06), (0.0, 0.06)], 0, 0, 0, seg=8)
    sh.a('bulb').cyl((x, y + 0.005, z), (x, y + 0.03, z), 0.022, seg=8)


def vase(x, z, y):
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.022, 0.13)], 0, 0, 0, seg=8)
    for j in range(5):
        a = j * 1.3; tx, tz = math.cos(a) * 0.05, math.sin(a) * 0.05
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.1, 0), (tx, y + 0.24 + (j % 2) * 0.05, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.01), (0.02, -0.004), (0.021, 0.0), (0.0, 0.008)], seg=5), '#f8f6ee'), Matrix.Translation(g2b(x + tx, y + 0.24 + (j % 2) * 0.05, z + tz)))


def leafy(x, z, h=1.5):
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col='#d8d0c0')
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)


def brass_pendant(x, z, y, r=0.24):
    K.dome_pendant(sh, x, z, y, r=r, col='#a8843e', inner='#f8e6c0', kind='dome', glow_size=0.8)


# ---------------------------------------------------------------- 地板、天花板（深色外露：管線、冷氣、軌道燈）、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=2.2).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for k in range(3): z_ = Z0 + 2.0 + k * 4.0; xf0.rbox(sh.a('vcm'), X0, X1, H - 0.22, H - 0.005, z_ - 0.12, z_ + 0.12, r=0.01, seg=1, col=CEIL)   # 深色的梁（v1：三根、細一點）
for (zz, r_) in ((-3.2, 0.05), (-3.0, 0.03), (3.6, 0.04)): xf0.cyl(sh.a('vcm'), (X0, H - 0.42, zz), (X1, H - 0.42, zz), r_, col='#6a6660', seg=8, caps=False)
xf0.rbox(sh.a('vcm'), -1.0, 0.2, H - 0.36, H - 0.32, 0.6, 1.8, r=0.02, seg=1, col='#e6e4dd'); xf0.rbox(sh.a('vcm'), -0.85, 0.05, H - 0.365, H - 0.355, 0.75, 1.65, r=0.005, seg=1, col='#a8a8a4')   # 冷氣
for zz in (3.0, -0.6):                                                                                                    # 兩條黑色軌道燈
    xf0.rbox(sh.a('vcm'), X0 + 0.6, X1 - 0.6, H - 0.36, H - 0.33, zz - 0.02, zz + 0.02, r=0.004, seg=1, col='#24221f')
    for k in range(7):
        x = X0 + 1.1 + k * (W - 2.2) / 6; sp = Xf(x, zz, 0.0); sp.cyl(sh.a('vcm'), (0, H - 0.36, 0), (0, H - 0.5, 0.04 if zz > 0 else -0.04), 0.03, col='#24221f', seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.5, 0.04 if zz > 0 else -0.04), sp.p(0, H - 0.505, 0.042 if zz > 0 else -0.042), 0.024, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.7, zz, color='rgba(255,210,150,1)', size=0.5, day=0.0, night=0.55)
ops = [(-CF.DOOR, CF.DOOR, 0.0, CF.HEAD, 'door'), (CF.SX0, -CF.DOOR - CF.POST, CF.SILL, CF.HEAD, 'win'), (CF.DOOR + CF.POST, CF.SX1, CF.SILL, CF.HEAD, 'win')]
sh.wall_with_openings('front', ops, 'wall', 'wall', 0.0, 'wood', mull=0.9)
xf0.rbox(sh.w('front', 'wood'), -CF.DOOR, CF.DOOR, CF.TRAN - 0.03, CF.TRAN + 0.03, Z1 - 0.14, Z1, r=0.004, seg=1)          # 門上氣窗的橫木
rops = [(zc - CF.WIN_W / 2, zc + CF.WIN_W / 2, CF.WIN_Y - CF.WIN_H / 2, CF.WIN_Y + CF.WIN_H / 2, 'win') for zc in CF.RIGHT_WINS]
sh.wall_with_openings('right', rops, 'wall', 'wall', 0.0, 'wood', mull=0.75)
for side in ('back', 'left'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
for side, (a0, a1) in (('left', (Z0, Z1)), ('right', (Z0, Z1)), ('back', (X0, X1))): sh.wall_box(side, 'wood', a0, a1, 0.0, 0.12, -0.015, 0.0)
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(9.0, 5.5, vz), (-9.0, 5.5, vz), (-9.0, -1.0, vz), (9.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
vx = X1 + 2.5; vr = Mesh('WALL_right_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vr, [(vx, -1.0, -5.0), (vx, -1.0, 5.0), (vx, 5.0, 5.0), (vx, 5.0, -5.0)], uv=(0.0, 0.0, 1.0, 1.0))
vr.finish(sh.root, uv=False, props={'dir': K.DIRS['right'], 'windowView': True})
for zz in (-4.4, 4.2):                                                                                                     # 西牆的黃銅壁燈（拱門兩邊）
    wx = sh.wall_xf('left', zz, 0.0, 2.15); wx.rbox(sh.w('left', 'vcm'), -0.05, 0.05, -0.08, 0.08, 0.0, 0.03, r=0.01, seg=1, col=BRASS)
    px_, py_, pz_ = wx.p(0, 0, 0.14); sh.a('shade').sphere((px_, py_ + 0.02, pz_), 0.07, seg=10, rings=6)
    CL.glow(sh.root, 'sconce', px_, py_, pz_, color='rgba(255,200,130,1)', size=0.5, day=0.1, night=0.8)
sh.tally('shell')

# ---------------------------------------------------------------- 窗邊吧台（固定）＋燈罩檯燈、高腳椅
for sgn in (1, -1):
    a, b = sorted((sgn * CF.COUNTER_X[0], sgn * CF.COUNTER_X[1]))
    xf0.rbox(sh.a('wood'), a, b, CF.COUNTER_H - 0.05, CF.COUNTER_H, CF.COUNTER_Z - CF.COUNTER_DEP / 2, CF.COUNTER_Z + CF.COUNTER_DEP / 2, r=0.01, seg=1)
    for xx in (a + 0.05, b - 0.08): xf0.rbox(sh.a('wood'), xx, xx + 0.03, 0.0, CF.COUNTER_H - 0.05, CF.COUNTER_Z - 0.15, CF.COUNTER_Z + 0.15, r=0.004, seg=1)
    for k in range(2): shade_lamp(a + 0.6 + k * (b - a - 1.2), CF.COUNTER_Z + 0.05, CF.COUNTER_H, s=1.1)
    candle((a + b) / 2, CF.COUNTER_Z - 0.05, CF.COUNTER_H); sh.plant((a + b) / 2 + 0.6, CF.COUNTER_Z + 0.06, h=0.3, r=0.08, pot_col='#d8d0c0', y0=CF.COUNTER_H)
for x in CF.WC_STOOLS: stool(x, 4.95, h=0.75)
sh.tally('window')

# ---------------------------------------------------------------- 吧檯（固定：後牆前）、層架、2:30 AM 招牌、蛋糕櫃、咖啡機、黃銅吊燈
bx0, bx1 = CF.BAR['x'] - CF.BAR['w'] / 2, CF.BAR['x'] + CF.BAR['w'] / 2; bz0, bz1 = CF.BAR['z'] - CF.BAR['d'] / 2, CF.BAR['z'] + CF.BAR['d'] / 2; bh = CF.BAR['h']
xf0.rbox(sh.a('wood'), bx0, bx1, 0.0, bh - 0.05, bz0, bz1, r=0.01, seg=1)
for k in range(10):                                                                                                      # 胡桃木框格面板
    x = bx0 + 0.05 + k * (CF.BAR['w'] - 0.1) / 10; xf0.rbox(sh.a('vc'), x + 0.04, x + (CF.BAR['w'] - 0.1) / 10 - 0.04, 0.15, bh - 0.18, bz1, bz1 + 0.02, r=0.006, seg=1, col=WAL2)
sh.a('bulb').box(bx0 + 0.05, bx1 - 0.05, bh - 0.11, bh - 0.095, bz1 + 0.02, bz1 + 0.03)                                # 檯面下的燈條
xf0.rbox(sh.a('vcg'), bx0 - 0.03, bx1 + 0.03, bh - 0.05, bh, bz0 - 0.02, bz1 + 0.06, r=0.012, seg=1, col=STONE)       # 深色石材檯面
top = bh; m = sh.a('vcm')
em = Xf(bx0 + 1.6, CF.BAR['z'] - 0.1, 0.0, top); em.rbox(sh.a('vcg'), -0.5, 0.5, 0.0, 0.5, -0.25, 0.22, r=0.03, seg=2, col='#d8d8d6'); em.rbox(sh.a('vcg'), -0.5, 0.5, 0.5, 0.55, -0.25, 0.22, r=0.01, seg=1, col='#2e2e2e')
for k in range(3): em.cyl(m, (-0.3 + k * 0.3, 0.22, 0.22), (-0.3 + k * 0.3, 0.18, 0.3), 0.04, col='#2e2e2e', seg=8)
for k in range(8): K.mug(sh, bx0 + 1.2 + (k % 4) * 0.25, CF.BAR['z'] - 0.2 + (k // 4) * 0.18, top + 0.55, col='#f2efe8', r=0.03, h=0.06, handle=False)
for gx in (bx0 + 2.5, bx0 + 2.8):                                                                                       # 兩台磨豆機
    g = Xf(gx, CF.BAR['z'] - 0.15, 0, top); g.rbox(m, -0.09, 0.09, 0.0, 0.3, -0.09, 0.09, r=0.02, seg=1, col='#2e2e2e'); g.lathe(sh.a('glass'), [(0.03, 0.3), (0.08, 0.5), (0.07, 0.52)], 0, 0, 0, seg=10)
    Xf(gx, CF.BAR['z'] - 0.15, 0, top + 0.32).lathe(sh.a('vcg'), [(0.0, 0.0), (0.06, 0.0), (0.07, 0.14), (0.0, 0.14)], 0, 0, 0, seg=10, col='#3a2418')
for k in range(4): Xf(bx0 + 3.3 + k * 0.12, CF.BAR['z'] + 0.15, 0, top).lathe(m, [(0.0, 0.0), (0.035, 0.0), (0.035, 0.09), (0.0, 0.09)], 0, 0, 0, seg=8, col='#c8c8c4')   # 拉花鋼杯
Xf(bx0 + 4.4, CF.BAR['z'], 0.0, top).rbox(m, -0.15, 0.15, 0.0, 0.08, -0.12, 0.12, r=0.01, seg=1, col='#2e2e2e')         # 收銀機
Xf(bx0 + 4.4, CF.BAR['z'], 0.0, top).rbox(m, -0.13, 0.13, 0.08, 0.28, -0.13, -0.11, r=0.006, seg=1, col='#2e2e2e')
vase(bx0 + 4.9, CF.BAR['z'] + 0.1, top); candle(bx0 + 5.3, CF.BAR['z'] + 0.2, top); candle(bx0 + 0.6, CF.BAR['z'] + 0.2, top)
pc = IT['pastry_case'][0]; pc0, pc1 = pc['x'] - pc['w'] / 2, pc['x'] + pc['w'] / 2                                      # 蛋糕櫃（彎玻璃的近似：三層）
xf0.rbox(sh.a('wood'), pc0, pc1, top, top + 0.06, bz0 + 0.05, bz1 - 0.02, r=0.006, seg=1)
sh.a('glass').box(pc0 + 0.01, pc1 - 0.01, top + 0.06, top + 0.5, bz0 + 0.06, bz1 - 0.03); sh.a('bulb').box(pc0 + 0.04, pc1 - 0.04, top + 0.485, top + 0.495, bz0 + 0.1, bz1 - 0.1)
for y in (top + 0.2, top + 0.34): sh.a('glass').box(pc0 + 0.02, pc1 - 0.02, y, y + 0.01, bz0 + 0.07, bz1 - 0.05)
for row, y in enumerate((top + 0.06, top + 0.21, top + 0.35)):
    for k in range(4): Xf(pc0 + 0.15 + k * 0.26, CF.BAR['z'] + 0.05, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.08, 0.0), (0.08, 0.07), (0.0, 0.075)], 0, 0, 0, seg=10, col=('#f4ecd8', '#e8c890', '#c98a5a', '#f0d0c8')[(k + row) % 4])
for (y, kind) in ((1.55, 'jar'), (1.95, 'mug'), (2.35, 'jar')):                                                        # 後牆層架（固定位置 z −5.75）
    xf0.rbox(sh.a('wood'), bx0 + 0.1, bx1 - 0.1, y - 0.035, y, Z0 + 0.012, Z0 + 0.32, r=0.004, seg=1)
    sh.a('bulb').box(bx0 + 0.15, bx1 - 0.15, y - 0.045, y - 0.035, Z0 + 0.28, Z0 + 0.3)
    n = 24
    for k in range(n):
        xx = bx0 + 0.25 + k * (CF.BAR['w'] - 0.5) / (n - 1)
        if k % 7 == 3: sh.plant(xx, Z0 + 0.16, h=0.3, r=0.07, pot_col='#d8d0c0', y0=y); continue
        if kind == 'jar': K.jar(sh, xx, Z0 + 0.16, y, h=0.22 if y < 2 else 0.18, r=0.055, col=('#5a3a22', '#6a4a2a', '#3a2418', '#8a6a3a')[k % 4], lid='#b8944a')
        else: K.mug(sh, xx, Z0 + 0.16, y, col=('#f2efe8', '#f2efe8', '#e8dcc8')[k % 3], r=0.04, h=0.09)
for xx in (bx0 + 0.5, bx1 - 0.6): sh.hanging_pothos('pothos', xx, 2.42, Z0 + 0.2, n=9, drop=0.8)
sg = IT['sign'][0]; sh.wall_img('back', 'print', sg['along'], sg['y'], sg['w'], sg['h'], K.cell_uv(0, 0, 4, 1), off=0.03)
xf0.rbox(sh.w('back', 'wood'), sg['along'] - sg['w'] / 2 - 0.04, sg['along'] + sg['w'] / 2 + 0.04, sg['y'] - sg['h'] / 2 - 0.04, sg['y'] + sg['h'] / 2 + 0.04, Z0, Z0 + 0.025, r=0.006, seg=1)
hr = IT['hours'][0]; sh.wall_img('back', 'print', hr['along'], hr['y'], hr['w'], hr['h'], K.cell_uv(6, 2, 2, 1), off=0.03)
sh.wall_img('back', 'print', 0.7, CF.ROSTER[1], 0.3, 0.42, K.cell_uv(4, 0, 2, 2), off=0.02)                              # 班表位置的小黑板（照舊在 x 0.7）
for k in range(3): brass_pendant(bx0 + 1.4 + k * 2.1, CF.BAR['z'] + 0.5, 2.15, r=0.3)
for x, z_ in CF.STOOLS + [CF.STOOL4]: stool(x, z_, h=0.75)
sh.tally('bar')

# ---------------------------------------------------------------- 後牆書牆（固定 x 1.4～6.8）＋唱盤、黑膠
bk0, bk1 = CF.BOOKCASE; bxf = Xf((bk0 + bk1) / 2, Z0 + 0.2, 0.0); bw_ = bk1 - bk0; wm = sh.a('wood')
bxf.rbox(wm, -bw_ / 2, bw_ / 2, 0.0, 2.4, -0.2, -0.18, r=0.003, seg=1)
for k in range(7): u = -bw_ / 2 + k * bw_ / 6; bxf.rbox(wm, u - 0.02, u + 0.02, 0.0, 2.4, -0.2, 0.18, r=0.004, seg=1)
for q, y in enumerate((0.06, 0.5, 0.94, 1.38, 1.82, 2.38)):
    bxf.rbox(wm, -bw_ / 2, bw_ / 2, y - 0.02, y + 0.01, -0.2, 0.18, r=0.003, seg=1)
    if y > 2.3: continue
    for c in range(6):
        u0 = -bw_ / 2 + c * bw_ / 6 + 0.03; u1 = u0 + bw_ / 6 - 0.06
        if q == 1 and c in (2, 3):                                                                                        # 中段：黑膠一格＋唱盤
            for j in range(7): sh.img_quad(sh.a('print'), bxf, u0 + 0.04 + j * 0.06, y + 0.01, 0.12 - j * 0.01, 0.32, 0.32, K.cell_uv((c * 3 + j) % 8, 3, 1, 1), tilt=0.12)
            continue
        if q == 2 and c == 2:
            rp = IT['record_player'][0]; rxf = Xf(rp['x'], rp['z'], 0.0, y + 0.01); rxf.rbox(sh.a('wood'), -0.22, 0.22, 0.0, 0.1, -0.17, 0.17, r=0.01, seg=1)
            rxf.lathe(sh.a('vcg'), [(0.0, 0.1), (0.15, 0.1), (0.15, 0.115), (0.0, 0.115)], 0, 0, 0, seg=20, col='#1a1a1a'); rxf.cyl(sh.a('vcm'), (0.17, 0.12, -0.12), (0.05, 0.13, 0.05), 0.006, col=BRASS, seg=4); continue
        K.book_rows(sh, 'books', bxf, u0, u1, y + 0.01, 0.12, hgt=0.3, depth=0.2, rng=R)
shade_lamp(bk0 + 0.6, Z0 + 0.2, 2.4, s=0.8)
sh.plant(bk1 - 0.5, Z0 + 0.2, h=0.4, r=0.1, pot_col='#d8d0c0', y0=2.4); sh.hanging_pothos('pothos', bk1 - 0.4, 2.45, Z0 + 0.25, n=9, drop=0.9)
sh.tally('bookcase')

# ---------------------------------------------------------------- 西牆拱門卡座（新加）、照片
ar = IT['arch_alcove'][0]; az0, az1 = ar['z0'], ar['z1']; ax = X0                                                         # 拱門：兩根木框柱＋半圓拱（分段）＋玻璃格子
for zz in (az0, az1):
    xf0.rbox(sh.a('wood'), ax + 0.02, ax + 0.32, 0.0, 2.25, zz - 0.09, zz + 0.09, r=0.01, seg=1)
rc = (az1 - az0) / 2; zc = (az0 + az1) / 2
abm = bmesh.new(); N = 24; ry_ = 0.62                                                                                    # 半圓拱（扁一點）：內外兩條弧、前後兩面，一圈封起來
ring = []
for k in range(N + 1):
    t = math.pi * k / N; row = []
    for (rr, xx) in ((rc + 0.09, ax + 0.02), (rc + 0.09, ax + 0.32), (rc - 0.09, ax + 0.32), (rc - 0.09, ax + 0.02)):
        row.append(abm.verts.new(g2b(xx, 2.25 + rr * ry_ * math.sin(t), zc - rr * math.cos(t))))
    ring.append(row)
for k in range(N):
    for j in range(4): abm.faces.new((ring[k][j], ring[k][(j + 1) % 4], ring[k + 1][(j + 1) % 4], ring[k + 1][j]))
abm.normal_update(); sh.a('wood').add_bm(abm); abm.free()
for zz in (az0 + 0.09, az1 - 0.09):                                                                                      # 拱門兩側的格子玻璃
    s_ = 1 if zz < 0 else -1
    sh.a('glass').box(ax + 0.15, ax + 0.18, 0.9, 2.2, min(zz, zz + s_ * 0.35), max(zz, zz + s_ * 0.35))
    for y in (0.9, 1.33, 1.76, 2.2): xf0.rbox(sh.a('wood'), ax + 0.14, ax + 0.19, y - 0.015, y + 0.015, min(zz, zz + s_ * 0.35), max(zz, zz + s_ * 0.35), r=0.002, seg=1)
xf0.rbox(sh.w('left', 'vcg'), X0, X0 + 0.01, 0.0, 2.25, az0 + 0.1, az1 - 0.1, r=0.0, seg=1, col='#cdb894')   # 拱門裡的牆（稍暗）
bq = IT['banquette'][0]; qz0, qz1 = bq['z'] - bq['d'] / 2, bq['z'] + bq['d'] / 2
xf0.rbox(sh.a('wood'), X0 + 0.3, X0 + 0.3 + bq['w'], 0.0, 0.38, qz0, qz1, r=0.012, seg=1)
xf0.rbox(sh.a('vcg'), X0 + 0.38, X0 + 0.3 + bq['w'] + 0.02, 0.38, 0.48, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col=GREEN)
for k in range(8): xf0.rbox(sh.a('vcg'), X0 + 0.32, X0 + 0.45, 0.48, 1.05, qz0 + 0.03 + k * (bq['d'] - 0.06) / 8, qz0 + 0.03 + (k + 1) * (bq['d'] - 0.06) / 8 - 0.012, r=0.04, seg=2, col='#355040')
for (zz, col) in ((qz0 + 0.5, '#c9c0ae'), (qz1 - 0.5, '#b8ae9a')): Xf(X0 + 0.55, zz, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.84, -0.07, 0.07, r=0.06, seg=2, col=col)
bt = IT['booth_table'][0]; K.round_table(sh, bt['x'], bt['z'], r=bt['r'], h=0.72, top_key='wood', base_col='#2e2e2e'); vase(bt['x'], bt['z'], 0.72); candle(bt['x'] + 0.12, bt['z'] + 0.1, 0.72)
for s_ in LAY['seats']:
    if not s_.get('seatH'): chair(s_['x'] + math.sin(s_['yaw']) * -0.04, s_['z'] + math.cos(s_['yaw']) * -0.04, s_['yaw'])
for k, (zz, cell) in enumerate(((zc - 0.7, (6, 0)), (zc + 0.05, (0, 1)), (zc + 0.75, (2, 1)))):
    sh.wall_img('left', 'print', zz, 1.75 + (0.12 if k == 1 else 0), 0.42 if k != 1 else 0.6, 0.42 if k != 1 else 0.5, K.cell_uv(cell[0], cell[1], 2, 2), off=0.02)
brass_pendant(X0 + 1.4, zc, 2.25, r=0.2)
sh.tally('alcove')

# ---------------------------------------------------------------- 桌子（固定）、沙發角（固定）、植物
for (x, z_) in CF.TABLES:
    four = (x, z_) == CF.FOUR_TOP
    K.rect_table(sh, x, z_, 0.0, 1.3 if four else 0.7, 0.8 if four else 0.7, h=0.75, top_key='wood', leg_key='wood', leg='wood')
    for dz in (-0.8, 0.8): chair(x, z_ + dz, 0.0 if dz < 0 else math.pi)
    if four:
        for dx in (-0.85, 0.85): chair(x + dx, z_, math.pi / 2 if dx < 0 else -math.pi / 2)
    mushroom(x + 0.18, z_ - 0.1, 0.75); candle(x - 0.15, z_ + 0.12, 0.75); vase(x - 0.05, z_ - 0.15, 0.75)
so = CF.SOFA; sx = (so['x0'] + so['x1']) / 2; sz0, sz1 = so['z0'], so['z1']                                             # 沙發（面向 +x）＋矮桌＋立燈
xf0.rbox(sh.a('vc'), so['x0'], so['x1'], 0.05, 0.42, sz0, sz1, r=0.05, seg=2, col=GREY)
xf0.rbox(sh.a('vc'), so['x0'], so['x0'] + 0.22, 0.42, 0.9, sz0, sz1, r=0.06, seg=2, col=GREY)
for zz in (sz0, sz1 - 0.2): xf0.rbox(sh.a('vc'), so['x0'], so['x1'], 0.42, 0.62, zz, zz + 0.2, r=0.06, seg=2, col=GREY)
for k in range(2): xf0.rbox(sh.a('vc'), so['x0'] + 0.22, so['x1'] - 0.02, 0.42, 0.52, sz0 + 0.22 + k * (sz1 - sz0 - 0.44) / 2, sz0 + 0.22 + (k + 1) * (sz1 - sz0 - 0.44) / 2 - 0.02, r=0.05, seg=2, col=GREY2)
Xf(so['x0'] + 0.3, sz0 + 0.5, math.pi / 2).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.86, -0.07, 0.07, r=0.06, seg=2, col='#c9c0ae')
xf0.rbox(sh.a('vc'), so['x0'] + 0.05, so['x1'] - 0.05, 0.5, 0.85, sz1 - 0.45, sz1 - 0.3, r=0.03, seg=2, col='#d8cfc0')   # 搭在扶手上的毯子
K.round_table(sh, -5.3, 3.4, r=0.32, h=0.48, top_key='wood', base_col='#2e2e2e'); candle(-5.25, 3.35, 0.48); vase(-5.4, 3.45, 0.48)
fl = Xf(so['x0'] + 0.3, sz1 + 0.25); fl.lathe(sh.a('vcm'), [(0.0, 0.0), (0.14, 0.0), (0.14, 0.02), (0.02, 0.04), (0.012, 1.35), (0.0, 1.36)], 0, 0, 0, seg=12, col=BRASS)
fl.lathe(sh.a('shade'), [(0.12, 1.3), (0.22, 1.3), (0.16, 1.58), (0.1, 1.58)], 0, 0, 0, seg=16); CL.glow(sh.root, 'floorlamp', so['x0'] + 0.3, 1.45, sz1 + 0.25, color='rgba(255,205,140,1)', size=0.8, day=0.1, night=0.85)
Xf(*CF.UMBRELLA).lathe(sh.a('vcm'), [(0.0, 0.0), (0.11, 0.0), (0.11, 0.5), (0.1, 0.5), (0.1, 0.02), (0.0, 0.02)], 0, 0, 0, seg=12, col=WAL2)   # 傘桶（芷若的傘放這裡）
bp = [(p[0], p[1]) for p in CF.BIG_PLANTS]
pm = IT['plant_moved'][0]; bp = [tuple(pm['to']) if (abs(p[0] - pm['from'][0]) < 0.01 and abs(p[1] - pm['from'][1]) < 0.01) else p for p in bp]
for (x, z_) in bp: leafy(x, z_)
sh.tally('seating')
info = sh.finish(OUT, extra_info={'layout': LAY['version'], 'zone': 'cafe'})
