"""小路（溫州街 B3，取代巷子裡定食；昭和懷舊居酒屋）室內 → GLB（AA 2026-11-04；AA_654／AA_655，使用者 11-04 04:4x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/komichi_interior.py [-- --out assets/models/env/second_ai/aa_support/komichi.glb]
遊戲區域照舊是 `wz_teishoku`；配置 src/data/komichi_layout.js（WZ_SHOPS_LAYOUT.teishoku 的新版）。參考圖 docs/story_planning/ref_images/shops/wz_komichi_int.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py kmc（kmc_print.png：木匾、營業時間、紙菜單、木札、海報、舊照片、小黑板、酒標）；書背 mok_bookrows.png；窗景 mok_view.png。
昭和懷舊：胡桃木吧台和腰牆、泛黃灰泥牆、深色木天花板和梁、黃銅吊燈、琥珀玻璃壁燈、綠色皮面高腳凳和卡座、波浪玻璃隔板；地板淺色木地板（D112，參考圖是深色）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
import aa_cc0 as C   # noqa: E402（SHOP-CC0-HELP-1113：CC0 材質組＋Poly Haven 掃描模型）
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/komichi_layout.js', 'KOMICHI_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('kmc_', 'komichi_interior', W, D, H, texres=512, props={'layout': LAY['version'], 'zone': 'wz_teishoku'}, seed=1104)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'view'}
P = 'kmc_'
sh.M.update({
    'floor': L.pbr(P + 'floor_wood', 'laminate_floor_02', tile=2.2, target='#c8a47a', maps=('diff',), res=512, rough_value=0.5),
    'wall': CL.soft_plaster(P + 'wall_aged', '#e2d2b0', 0.9, cull=True, tile=1.4, k=0.35),
    'wood': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5a3a24', maps=('diff',), res=256, rough_value=0.42),
    'dark': L.pbr(P + 'ceiling_wood', 'walnut_veneer', tile=1.6, target='#3e2a1c', maps=('diff',), res=256, rough_value=0.6, cull=True),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'bulb': L.flat(P + 'bulb', '#fff0d0', rough=0.3, emit=B.srgb('#ffc878')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.08),
    'print': K.img_mat(P + 'print', 'kmc_print.png', rough=0.7),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['amber'] = sh.M['bulb']; sh.M['ribbed'] = sh.M['glass']   # 材質 ≤ 12：琥珀玻璃用燈泡的、波浪玻璃用一般玻璃＋直紋
# SHOP-CC0-HELP-1113（D161）：頂點色零件換成 CC0 材質組（顏色照舊）；木頭色的零件（椅腳、直木板、椽、木框）併進胡桃木材質（木紋）
C.enable(sh, route=dict({h: 'wood' for h in ('#5a3a24', '#46301e', '#62402a', '#523622', '#2e2016', '#3a281a', '#4a3020', '#6a4428', '#3b2d22')}, **{'vcg:#3e5a40': 'leather', 'vcg:#34503a': 'leather'}))   # 綠色皮面（高腳凳、椅墊、卡座）用 ambientCG 皮革
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
xf0 = Xf(0, 0); R = random.Random(1104)
WAL = '#5a3a24'; WAL2 = '#46301e'; GREEN = '#3e5a40'; GREEN2 = '#34503a'; BRASS = '#b08a44'; STEEL = '#b8b8b4'; CEIL = '#3a281a'
BOTTLE = ('#2e4a2e', '#4a2e1e', '#1e2a22', '#6a5a3a', '#e8e4d8', '#3a3a2a')


def chair(x, z, yaw):
    """木椅：圓腳、綠色皮坐墊、兩根橫木椅背"""
    xf = Xf(x, z, yaw); m = sh.a('vc')
    for (sx, sz) in ((-0.18, 0.17), (0.18, 0.17), (-0.18, -0.17), (0.18, -0.17)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.42, sz * 0.95), 0.019, col=WAL, seg=5, caps=False)
    xf.rbox(m, -0.2, 0.2, 0.38, 0.42, -0.19, 0.19, r=0.0, seg=1, col=WAL)
    xf.rbox(sh.a('vcg'), -0.19, 0.19, 0.42, 0.48, -0.18, 0.18, r=0.025, seg=2, col=GREEN)
    for sx in (-0.18, 0.18): xf.cyl(m, (sx, 0.44, -0.18), (sx, 0.84, -0.21), 0.019, col=WAL, seg=5, caps=False)
    for y in (0.62, 0.76): xf.rbox(m, -0.19, 0.19, y, y + 0.07, -0.215, -0.185, r=0.0, seg=1, col=WAL)


def stool(x, z, h=0.72):
    """吧台高腳凳：綠色皮面圓坐墊、四支木腳、黃銅腳踏圈"""
    xf = Xf(x, z, 0.0); m = sh.a('vc')
    xf.lathe(sh.a('vcg'), [(0.0, h - 0.03), (0.17, h - 0.03), (0.185, h + 0.01), (0.16, h + 0.06), (0.0, h + 0.07)], 0, 0, 0, seg=14, col=GREEN)
    xf.lathe(m, [(0.0, h - 0.06), (0.16, h - 0.06), (0.16, h - 0.03), (0.0, h - 0.03)], 0, 0, 0, seg=12, col=WAL)
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2; c, s_ = math.cos(a), math.sin(a)
        xf.cyl(m, (c * 0.19, 0.0, s_ * 0.19), (c * 0.12, h - 0.06, s_ * 0.12), 0.02, col=WAL2, seg=5, caps=False)
    xf.lathe(sh.a('vcm'), [(0.165, 0.26), (0.18, 0.26), (0.18, 0.28), (0.165, 0.28)], 0, 0, 0, seg=14, col=BRASS)


def candle(x, z, y):
    """琥珀色玻璃燭杯"""
    Xf(x, z, 0, y).lathe(sh.a('amber'), [(0.0, 0.0), (0.03, 0.0), (0.034, 0.05), (0.03, 0.075), (0.0, 0.075)], 0, 0, 0, seg=8)
    CL.glow(sh.root, 'candle', x, y + 0.05, z, color='rgba(255,180,100,1)', size=0.22, day=0.0, night=0.35)


def table_set(x, z):
    """桌上：醬油瓶、七味、筷筒、燭杯"""
    for k, col in enumerate(('#2a1810', '#a8392e')): Xf(x + 0.06 * k, z, 0, 0.75).lathe(sh.a('vcg'), [(0.0, 0.0), (0.022, 0.0), (0.022, 0.08), (0.01, 0.11), (0.0, 0.115)], 0, 0, 0, seg=6, col=col)
    t = Xf(x - 0.12, z + 0.02, 0, 0.75); t.lathe(sh.a('vc'), [(0.0, 0.0), (0.035, 0.0), (0.035, 0.12), (0.0, 0.12)], 0, 0, 0, seg=8, col='#e8e2d0')
    for j in range(6): t.cyl(sh.a('vc'), (0.012 * math.cos(j), 0.1, 0.012 * math.sin(j)), (0.02 * math.cos(j), 0.22, 0.02 * math.sin(j)), 0.003, col='#e0c890', seg=3, caps=False)


def berries(x, z, y):
    """小陶瓶插紅色果枝"""
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.035, 0.0), (0.045, 0.06), (0.02, 0.13), (0.024, 0.15)], 0, 0, 0, seg=8, col='#8a9aa4')
    for j in range(4):
        a = j * 1.6; tx, tz = math.cos(a) * 0.09, math.sin(a) * 0.09
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.13, 0), (tx, y + 0.36 + (j % 2) * 0.06, tz), 0.003, col='#4a3020', seg=3, caps=False)
        for q in range(3): sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.012), (0.012, 0.0), (0.0, 0.012)], seg=5), '#b02a22'), Matrix.Translation(g2b(x + tx * (0.6 + q * 0.2), y + 0.26 + q * 0.04 + (j % 2) * 0.03, z + tz * (0.6 + q * 0.2))))


def bottle(x, z, y, k, h=0.3, label=True, row=6, face=0.0, kind=None):
    """一瓶酒（v1d：四種瓶型、高度不一）：isho＝一升瓶、yongo＝四合瓶、sq＝方瓶燒酎、toku＝陶德利；kind 沒給就照 k 挑"""
    kind = kind or ('isho', 'yongo', 'yongo', 'sq', 'toku', 'isho')[k % 6]
    col = BOTTLE[k % len(BOTTLE)]; xf = Xf(x, z, face, y)
    if kind == 'sq':
        w = 0.05 + 0.01 * (k % 3); xf.rbox(sh.a('vcg'), -w, w, 0.0, h * 0.75, -w, w, r=0.01, seg=1, col=('#d8d0b0', '#5a3a22', '#e8e4d8')[k % 3])
        xf.cyl(sh.a('vcg'), (0, h * 0.75, 0), (0, h * 0.95, 0), 0.015, col='#2a2a2a', seg=6)
        if label: sh.img_quad(sh.a('print'), xf, 0.0, h * 0.15, w + 0.003, w * 1.6, h * 0.42, K.cell_uv(k % 8, 7, 1, 1)); return
        return
    if kind == 'toku':
        xf.lathe(sh.a('vcg'), [(0.0, 0.0), (0.035, 0.0), (0.05, h * 0.35), (0.045, h * 0.6), (0.018, h * 0.85), (0.022, h), (0.0, h)], 0, 0, 0, seg=10, col=('#e8e2d4', '#8a9aa4', '#6a4a30', '#c8b898')[k % 4]); return
    r = (0.05 if kind == 'isho' else 0.038) * (0.9 + 0.2 * ((k * 37) % 7) / 6)
    xf.lathe(sh.a('vcg'), [(0.0, 0.0), (r, 0.0), (r, h * 0.62), (r * 0.4, h * 0.82), (r * 0.32, h), (0.0, h)], 0, 0, 0, seg=8, col=col)
    if label: sh.img_quad(sh.a('print'), xf, 0.0, h * 0.18, r + 0.003, r * 1.4, h * 0.36, K.cell_uv(k % 8, row, 1, 1))


def bottle_row(x0, x1, z, y, seed, hmax=0.4, gap=0.0):
    """一排酒瓶（v1d，H：不等距、高低不一、偶爾前後錯開或轉一點、留空位、偶爾一個倒扣的杯子）"""
    rr = random.Random(seed); x = x0 + rr.uniform(0.02, 0.1); k = seed
    while x < x1 - 0.06:
        k += 1; t = rr.random()
        if t < 0.12: x += rr.uniform(0.15, 0.3); continue                                                          # 空位
        if t < 0.2: teacup_inv(x, z + rr.uniform(-0.04, 0.04), y); x += rr.uniform(0.09, 0.14); continue
        kind = rr.choice(('isho', 'isho', 'yongo', 'yongo', 'sq', 'toku'))
        h = {'isho': rr.uniform(0.34, hmax), 'yongo': rr.uniform(0.26, 0.31), 'sq': rr.uniform(0.2, 0.26), 'toku': rr.uniform(0.15, 0.19)}[kind]
        bottle(x, z + rr.uniform(-0.05, 0.05), y, k, h=h, kind=kind, face=rr.uniform(-0.35, 0.35) if rr.random() < 0.3 else 0.0)
        x += rr.uniform(0.09, 0.2)


def teacup_inv(x, z, y):
    """倒扣的小酒杯"""
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.05), (0.022, 0.05), (0.03, 0.0), (0.0, 0.0)], 0, 0, 0, seg=8, col='#e8e4d8')


def brass_pendant(x, z, y, r=0.22):
    K.dome_pendant(sh, x, z, y, r=r, col='#a8843e', inner='#f8e2b8', kind='dome', glow_size=0.75)


# ---------------------------------------------------------------- 地板、深色木天花板＋梁、冷氣、牆、窗
Mesh(P + 'floor', sh.M['floor'], tile=2.2).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['dark'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
for x_ in (-2.6, -0.2, 2.2): xf0.rbox(sh.a('vc'), x_ - 0.09, x_ + 0.09, H - 0.2, H - 0.005, Z0, Z1, r=0.0, seg=1, col=CEIL)   # 深色木梁（沿 z）
for z_ in (-1.0, 1.6): xf0.rbox(sh.a('vc'), X0, X1, H - 0.14, H - 0.005, z_ - 0.07, z_ + 0.07, r=0.0, seg=1, col=CEIL)
for x_ in (-3.4, -1.4, 1.0, 3.2): xf0.rbox(sh.a('vc'), x_ - 0.04, x_ + 0.04, H - 0.09, H - 0.005, Z0, Z1, r=0.0, seg=1, col='#2e2016')   # v1c：細椽，和梁組成格子
for z_ in (-3.0, 0.3, 2.9): xf0.rbox(sh.a('vc'), X0, X1, H - 0.09, H - 0.005, z_ - 0.04, z_ + 0.04, r=0.0, seg=1, col='#2e2016')
for (lx, lz) in ((0.475, 2.6), (2.425, 2.6), (0.9, 0.75)):                                                               # v1c：和紙燈籠（窗邊兩座、中間四人桌）
    Xf(lx, lz).cyl(sh.a('vcm'), (0, H, 0), (0, 2.43, 0), 0.004, col='#2a2a2a', seg=4)
    Xf(lx, lz, 0, 2.2).lathe(sh.a('bulb'), [(0.0, 0.0), (0.07, 0.01), (0.11, 0.06), (0.12, 0.11), (0.11, 0.17), (0.07, 0.22), (0.0, 0.23)], 0, 0, 0, seg=12)
    for yy in (2.2, 2.43): Xf(lx, lz, 0, yy).lathe(sh.a('vc'), [(0.0, -0.01), (0.07, -0.01), (0.07, 0.01), (0.0, 0.01)], 0, 0, 0, seg=12, col='#2e2016')
    for (yy, rr_) in ((2.245, 0.106), (2.29, 0.12), (2.34, 0.118), (2.385, 0.1)): Xf(lx, lz, 0, yy).lathe(sh.a('vc'), [(rr_, -0.003), (rr_ + 0.004, -0.003), (rr_ + 0.004, 0.003), (rr_, 0.003)], 0, 0, 0, seg=12, col='#7a6a50')   # v1d：竹骨橫紋
    CL.glow(sh.root, 'washi', lx, 2.31, lz, color='rgba(255,200,140,1)', size=0.7, day=0.0, night=0.8)
xf0.rbox(sh.a('vcm'), 0.4, 1.4, H - 0.24, H - 0.2, 0.25, 1.25, r=0.01, seg=1, col='#a8a49a'); xf0.rbox(sh.a('vcm'), 0.55, 1.25, H - 0.245, H - 0.24, 0.4, 1.1, r=0.0, seg=1, col='#8a8680')   # 天花板嵌入式冷氣
fr = IT['genkan'][0]
ops = [(-3.7, -3.1, LAY['front']['sill'], LAY['front']['head'], 'win'), (-2.9, -1.1, 0.0, 2.3, 'door'), (-0.6, 3.4, LAY['front']['sill'], LAY['front']['head'], 'win')]
sh.wall_with_openings('front', ops, 'wood', 'wall', 0.95, 'wood', mull=0.5)
for xx in (-2.45, -2.0, -1.55):                                                                                           # 格子拉門的格子
    xf0.rbox(sh.w('front', 'wood'), xx - 0.015, xx + 0.015, 0.95, 2.25, Z1 - 0.1, Z1 - 0.06, r=0.0, seg=1)
for yy in (1.3, 1.65, 2.0): xf0.rbox(sh.w('front', 'wood'), -2.9, -1.1, yy - 0.015, yy + 0.015, Z1 - 0.1, Z1 - 0.06, r=0.0, seg=1)
xf0.rbox(sh.w('front', 'wood'), -2.9, -1.1, 0.0, 0.95, Z1 - 0.1, Z1 - 0.04, r=0.0, seg=1)                             # 拉門下半是木板
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
    sh.wall_box(side, 'wall', a0, a1, 0.95, H); sh.wall_box(side, 'wood', a0, a1, 0.0, 0.95)                          # 腰牆胡桃木
    sh.wall_box(side, 'wood', a0, a1, 0.93, 0.99, -0.03, 0.0)                                                          # 腰牆上緣的木條
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.0, 4.5, vz), (-7.0, 4.5, vz), (-7.0, -1.0, vz), (7.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
for zz in (2.0, -0.75):                                                                                                  # 西牆的琥珀玻璃壁燈
    wx = sh.wall_xf('left', zz, 0.0, 2.05); wx.rbox(sh.w('left', 'vcm'), -0.05, 0.05, -0.07, 0.07, 0.0, 0.03, r=0.01, seg=1, col=BRASS)
    wx.cyl(sh.w('left', 'vcm'), (0, 0.0, 0.02), (0, 0.1, 0.14), 0.01, col=BRASS, seg=5)
    px_, py_, pz_ = wx.p(0, 0.06, 0.16); Xf(px_, pz_, 0, py_).lathe(sh.a('amber'), [(0.0, -0.13), (0.06, -0.12), (0.075, -0.04), (0.05, 0.0), (0.0, 0.0)], 0, 0, 0, seg=12)
    CL.glow(sh.root, 'sconce', px_, py_ - 0.06, pz_, color='rgba(255,180,100,1)', size=0.55, day=0.0, night=0.85)
hr = IT['hours'][0]; sh.wall_img('front', 'print', hr['x'], hr['y'], hr['w'], hr['h'], K.cell_uv(2, 0, 2, 1), off=0.02)
sh.tally('shell')

# ---------------------------------------------------------------- 結帳台、傘桶、門口花磚
rg = IT['register'][0]
xf0.rbox(sh.a('wood'), rg['x'] - rg['w'] / 2, rg['x'] + rg['w'] / 2, 0.0, rg['h'], rg['z'] - rg['d'] / 2, rg['z'] + rg['d'] / 2, r=0.01, seg=1)
C.ph_put(sh, 'CashRegister_01', rg['x'], rg['h'], rg['z'] - 0.1, yaw=math.pi / 2, height=0.3, decimate=0.3)   # 收銀機（v1f 是兩個黑方塊；SHOP-CC0：Poly Haven 古董收銀機，昭和老店）
cat = Xf(rg['x'] - 0.05, rg['z'] + 0.28, -math.pi / 2, rg['h'])                                                         # 招財貓
cat.lathe(sh.a('vcg'), [(0.0, 0.0), (0.06, 0.0), (0.06, 0.1), (0.0, 0.11)], 0, 0, 0, seg=10, col='#f4f0e6'); sh.a('vcg').sphere(cat.p(0, 0.15, 0), 0.055, seg=10, rings=6)
cat.cyl(sh.a('vcg'), (0.04, 0.12, 0.03), (0.06, 0.22, 0.03), 0.015, col='#f4f0e6', seg=5)
Xf(-0.75, 3.6).lathe(sh.a('vcg'), [(0.0, 0.0), (0.12, 0.0), (0.12, 0.5), (0.11, 0.5), (0.11, 0.02), (0.0, 0.02)], 0, 0, 0, seg=12, col='#5a6a7a')   # 陶傘桶
gk = IT['genkan'][0]; xf0.rbox(sh.a('vcg'), gk['x'] - gk['w'] / 2, gk['x'] + gk['w'] / 2, 0.0, 0.004, gk['z'] - gk['d'] / 2, Z1 - 0.01, r=0.0, seg=1, col='#9a8a70')
sh.tally('entry')

# ---------------------------------------------------------------- 吧台（照舊位置）＋直木板正面、厚檯面、高腳凳
ct = IT['counter'][0]; cx0, cx1 = ct['x'] - ct['w'] / 2, ct['x'] + ct['w'] / 2; cz0, cz1 = ct['z'] - ct['d'] / 2, ct['z'] + ct['d'] / 2; ch = ct['h']
xf0.rbox(sh.a('wood'), cx0, cx1, 0.0, ch - 0.06, cz0, cz1 - 0.05, r=0.0, seg=1)
for k in range(int((cx1 - cx0) / 0.14)):                                                                                # 直木板
    x = cx0 + 0.02 + k * 0.14; xf0.rbox(sh.a('vc'), x, x + 0.125, 0.06, ch - 0.08, cz1 - 0.05, cz1 - 0.03, r=0.0, seg=1, col=(WAL, '#62402a', '#523622')[k % 3])
xf0.rbox(sh.a('vc'), cx0, cx1, 0.0, 0.08, cz1 - 0.06, cz1 - 0.01, r=0.0, seg=1, col=WAL2)
xf0.rbox(sh.a('wood'), cx0, cx1 + 0.02, ch - 0.06, ch, cz0 - 0.05, cz1 + 0.1, r=0.015, seg=1)                          # 厚木檯面（往客人那邊伸出）
xf0.rbox(sh.a('wood'), cx0, cx1, ch + 0.12, ch + 0.16, cz0 - 0.05, cz0 + 0.18, r=0.008, seg=1)                           # 後面高一階的出菜台
xf0.rbox(sh.a('wood'), cx0, cx1, ch, ch + 0.12, cz0 + 0.14, cz0 + 0.18, r=0.0, seg=1)
rb = random.Random(1141); x = cx0 + 0.25                                                                                # v1d（H）：檯面上的東西成組、不等距，有的地方空出來；小菜碟三種形狀；燭杯只放四個、往裡面移
while x < cx1 - 0.3:
    if rb.random() < 0.3: x += rb.uniform(0.4, 0.7); continue                                                         # 空出來給客人放杯子
    for j in range(rb.randint(2, 4)):
        xx = x + rb.uniform(-0.04, 0.04); zz = cz1 - rb.uniform(0.06, 0.24); q = rb.random(); sc = rb.uniform(0.8, 1.25); yaw = rb.uniform(-0.35, 0.35)
        if q < 0.35:
            shp = rb.choice(('round', 'square', 'long'))
            if shp == 'round': K.plate(sh, xx, zz, ch + 0.005, r=0.07 * sc, col=rb.choice(('#e8e2d4', '#3a3a3a', '#8a9aa4')))
            elif shp == 'square': Xf(xx, zz, yaw, ch).rbox(sh.a('vcg'), -0.06 * sc, 0.06 * sc, 0.003, 0.018, -0.06 * sc, 0.06 * sc, r=0.008, seg=1, col=rb.choice(('#e8e2d4', '#2a2a2a', '#c8b898')))
            else: Xf(xx, zz, yaw, ch).rbox(sh.a('vcg'), -0.12 * sc, 0.12 * sc, 0.003, 0.016, -0.04, 0.04, r=0.008, seg=1, col=rb.choice(('#e8e2d4', '#6a4a30')))
            Xf(xx, zz, yaw, ch).rbox(sh.a('vc'), -0.035 * sc, 0.035 * sc, 0.014, 0.034, -0.025, 0.025, r=0.008, seg=1, col=rb.choice(('#c8783a', '#6a8a3a', '#e8d8a8', '#a84a2a')))
        elif q < 0.55: Xf(xx, zz, 0, ch).lathe(sh.a('vcg'), [(0.0, 0.0), (0.03 * sc, 0.0), (0.03 * sc, 0.12 * sc), (0.012, 0.17 * sc), (0.012, 0.2 * sc), (0.0, 0.2 * sc)], 0, 0, 0, seg=7, col=rb.choice(('#e8e4d8', '#2e4a2e', '#4a2e1e')))
        elif q < 0.75: Xf(xx, zz, 0, ch).lathe(sh.a('vcg'), [(0.0, 0.0), (0.022, 0.0), (0.022, 0.08 * sc), (0.01, 0.11 * sc), (0.0, 0.115 * sc)], 0, 0, 0, seg=6, col='#2a1810')
        else: Xf(xx, zz, 0, ch).lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.06 * sc), (0.0, 0.06 * sc)], 0, 0, 0, seg=8, col=rb.choice(('#e8e4d8', '#8a9aa4')))   # 小酒杯
        x += rb.uniform(0.1, 0.2)
    x += rb.uniform(0.2, 0.45)
for xx in (cx0 + 0.9, cx0 + 2.6, cx0 + 4.1, cx1 - 0.7): candle(xx, cz1 - 0.28, ch)
for k in range(rb.randint(5, 7)):                                                                                       # 後面高台：筷筒、醬料、疊起來的碟子，不等距
    xx = cx0 + 0.3 + k * (cx1 - cx0 - 0.6) / 6 + rb.uniform(-0.2, 0.2); q = rb.random()
    if q < 0.4: Xf(xx, cz0 + 0.08, 0, ch + 0.16).lathe(sh.a('vc'), [(0.0, 0.0), (0.035, 0.0), (0.035, 0.12 * rb.uniform(0.85, 1.2)), (0.0, 0.12)], 0, 0, 0, seg=8, col=rb.choice(('#3a4a5a', '#6a4a30')))
    elif q < 0.7:
        for j in range(rb.randint(2, 5)): K.plate(sh, xx + rb.uniform(-0.01, 0.01), cz0 + 0.08, ch + 0.16 + j * 0.012, r=0.06, col='#e8e2d4')
    else: Xf(xx, cz0 + 0.08, 0, ch + 0.16).lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.08), (0.02, 0.12), (0.0, 0.12)], 0, 0, 0, seg=8, col=rb.choice(('#a84a2a', '#2a1810'))) 
for x in (cx0 + 1.2, cx1 - 0.6): berries(x, cz0 + 0.1, ch + 0.16)
hd = Xf(3.1, -2.0, 0, 0); hd.rbox(sh.a('wood'), -0.9, 0.9, 0.0, ch - 0.06, -0.27, 0.22, r=0.0, seg=1); hd.rbox(sh.a('wood'), -0.92, 0.92, ch - 0.06, ch, -0.3, 0.3, r=0.012, seg=1)   # 半門那一段（照舊 block）
for s_ in LAY['seats']:
    if s_.get('kind') == 'stool': stool(s_['x'], s_['z'] - 0.05)
mb = IT['menu_beam'][0]; bx0_, bx1_ = mb['x'] - mb['w'] / 2, mb['x'] + mb['w'] / 2; by = mb['y']; bz = mb['z']
xf0.rbox(sh.a('wood'), bx0_, bx1_ + 0.4, by, by + 0.14, bz - 0.12, bz + 0.12, r=0.0, seg=1)                             # 木札的橫樑
for x_ in (bx0_ + 0.05, bx1_ + 0.3): xf0.rbox(sh.a('wood'), x_ - 0.05, x_ + 0.05, by + 0.14, H, bz - 0.05, bz + 0.05, r=0.0, seg=1)
xf0.rbox(sh.a('wood'), bx0_, bx1_ + 0.4, by + 0.14, by + 0.17, bz - 0.2, bz + 0.12, r=0.0, seg=1)                       # 橫樑上的酒瓶架
bottle_row(bx0_ + 0.05, bx1_ + 0.35, bz - 0.06, by + 0.17, 301, hmax=0.4)                                         # v1d：橫樑上的酒瓶（四種瓶型、高低不一、留空位）
for k in range(16):                                                                                                      # 木札 16 枚（掛在橫樑前面）
    x = bx0_ + 0.5 + k * (mb['w'] - 1.0) / 15
    sh.img_quad(sh.a('print'), Xf(x, bz + 0.135, 0.0, 0.0), 0.0, by - 0.4, 0.0, 0.12, 0.44, (k / 16 + 0.004, 1 - 3 / 8 + 0.004, (k + 1) / 16 - 0.004, 1 - 1 / 8 - 0.004))
gr = Xf(1.0, bz + 0.02, 0, by)                                                                                           # 吊杯架（橫樑下面，倒掛的高腳杯）
gr.rbox(sh.a('vcm'), -0.35, 0.35, -0.03, 0.0, -0.12, 0.12, r=0.004, seg=1, col=BRASS)
for k in range(8):
    gx = -0.3 + (k % 4) * 0.2; gz = -0.06 if k < 4 else 0.06
    gr.lathe(sh.a('glass'), [(0.0, -0.03), (0.035, -0.03), (0.004, -0.05), (0.004, -0.12), (0.04, -0.15), (0.045, -0.24), (0.0, -0.24)], gx, 0, gz, seg=8)
for k in range(4): brass_pendant(cx0 + 0.8 + k * 1.55, -1.75, 2.02, r=0.2)
sh.tally('bar')

# ---------------------------------------------------------------- 開放廚房：炭烤台、排油煙罩、爐台、後牆酒瓶層架、暖簾、木匾
kz0, kz1 = Z0, cz0
xf0.rbox(sh.a('vcm'), -3.9, 2.1, 0.0, 0.9, Z0 + 0.02, Z0 + 0.62, r=0.0, seg=1, col=STEEL)                              # 後牆的不鏽鋼工作台
xf0.rbox(sh.a('vcm'), -3.9, 2.1, 0.9, 0.93, Z0 + 0.02, Z0 + 0.64, r=0.0, seg=1, col='#d0d0cc')
gl = Xf(-0.6, Z0 + 0.32, 0, 0.93); gl.rbox(sh.a('vcm'), -0.55, 0.55, 0.0, 0.12, -0.2, 0.2, r=0.0, seg=1, col='#2e2e2e')   # 炭烤台＋烤雞串
xf0.rbox(sh.a('vc'), -1.1, -0.1, 1.03, 1.045, Z0 + 0.16, Z0 + 0.48, r=0.0, seg=1, col='#a8381a')                                                       # 炭火
for k in range(12): gl.rbox(sh.a('vc'), -0.48 + k * 0.085, -0.45 + k * 0.085, 0.13, 0.16, -0.22, 0.22, r=0.0, seg=1, col=('#8a4a22', '#a86a3a')[k % 2])
CL.glow(sh.root, 'candle_grill', -0.6, 1.08, Z0 + 0.4, color='rgba(255,140,60,1)', size=0.35, day=0.0, night=0.4)   # v1d：烤台的光小一點（v1c 把排油煙罩後面照成一片白）
hb = bmesh.new()                                                                                                        # v1d：排油煙罩＝往上收斜的罩子（下緣 1.7×0.65、上緣 0.6×0.35），上面接煙囪
def hv(x, y, z): return hb.verts.new(g2b(-0.6 + x, 1.72 + y, Z0 + 0.33 + z))
lo = [hv(-0.85, 0.0, -0.32), hv(0.85, 0.0, -0.32), hv(0.85, 0.0, 0.33), hv(-0.85, 0.0, 0.33)]
lo2 = [hv(-0.85, 0.06, -0.32), hv(0.85, 0.06, -0.32), hv(0.85, 0.06, 0.33), hv(-0.85, 0.06, 0.33)]
hi = [hv(-0.3, 0.5, -0.32), hv(0.3, 0.5, -0.32), hv(0.3, 0.5, 0.02), hv(-0.3, 0.5, 0.02)]
for ring_a, ring_b in ((lo, lo2), (lo2, hi)):
    for i in range(4): hb.faces.new((ring_a[i], ring_a[(i + 1) % 4], ring_b[(i + 1) % 4], ring_b[i]))
hb.faces.new(lo[::-1]); hb.normal_update(); sh.a('vcm').add_bm(K.paint_bm(hb, '#b4b4b0')); hb.free()
Xf(-0.6, Z0 + 0.2, 0, 2.22).rbox(sh.a('vcm'), -0.22, 0.22, 0.0, H - 2.22, -0.15, 0.13, r=0.02, seg=1, col='#a8a8a4')
for k in range(4): Xf(-0.6 - 0.6 + k * 0.4, Z0 + 0.33, 0, 1.73).rbox(sh.a('vcm'), -0.12, 0.12, 0.0, 0.01, -0.25, 0.25, r=0.0, seg=1, col=('#8a8a86', '#9a9a96')[k % 2])   # 下面的濾網
rt = random.Random(77)                                                                                                    # v1d：烤台後面的磁磚牆（深綠灰、每塊深淺不一），不再是一面被燈照白的灰泥
for i in range(10):
    for j in range(5):
        xx = -1.58 + i * 0.198; yy = 0.95 + j * 0.15
        xf0.rbox(sh.a('vcg'), xx, xx + 0.19, yy, yy + 0.142, Z0 + 0.005, Z0 + 0.015, r=0.0, seg=1, col=rt.choice(('#4e564c', '#565e52', '#4a5248', '#5c6456')))
xf0.rbox(sh.a('vc'), -1.6, 0.4, 0.93, 1.72, Z0, Z0 + 0.004, r=0.0, seg=1, col='#2e2e2a')
for k in range(2): Xf(-2.4 + k * 0.6, Z0 + 0.35, 0, 0.93).lathe(sh.a('vcm'), [(0.0, 0.0), (0.16, 0.0), (0.16, 0.18), (0.15, 0.18), (0.15, 0.01), (0.0, 0.01)], 0, 0, 0, seg=12, col='#a8a8a4')   # 鍋
Xf(1.2, Z0 + 0.35, 0, 0.93).lathe(sh.a('vcm'), [(0.0, 0.0), (0.17, 0.0), (0.18, 0.3), (0.16, 0.34), (0.0, 0.36)], 0, 0, 0, seg=12, col='#d8d4cc')   # 大電鍋
for (px_, n_, r_) in ((-3.45, 5, 0.1), (-3.1, 3, 0.08), (-2.85, 2, 0.12)):
    for j in range(n_): K.plate(sh, px_ + R.uniform(-0.01, 0.01), Z0 + 0.35, 0.94 + j * 0.016, r=r_, col=('#e8e2d4', '#3a3a3a')[(j + n_) % 2 if r_ < 0.09 else 0])   # v1d：疊起來的碗盤（三疊高低不一）
for sy, kind in ((1.25, 'cup'), (1.6, 'bottle'), (1.95, 'bottle'), (2.3, 'bottle')):                                      # 後牆的層架（爐台上方以外）
    for (a, b) in ((-3.95, -1.6), (0.4, 2.15)):
        xf0.rbox(sh.a('wood'), a, b, sy - 0.03, sy, Z0 + 0.01, Z0 + 0.3, r=0.0, seg=1)
        if kind == 'cup':
            rc = random.Random(int(sy * 100 + a * 10)); x = a + 0.08
            while x < b - 0.08:
                if rc.random() < 0.15: x += rc.uniform(0.12, 0.25); continue
                for j in range(rc.randint(1, 3)): Xf(x, Z0 + 0.15 + rc.uniform(-0.04, 0.04), 0, sy + j * 0.055).lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.055), (0.0, 0.055)], 0, 0, 0, seg=6, col=rc.choice(('#e8e4d8', '#8a9aa4', '#c8b898', '#3a3a3a')))
                x += rc.uniform(0.08, 0.16)
        else: bottle_row(a + 0.02, b - 0.02, Z0 + 0.16, sy, int(sy * 1000 + a * 10), hmax=0.33 if sy < 2.2 else 0.27)
    if sy == 1.6: xf0.rbox(sh.a('bulb'), -3.95, 2.15, sy - 0.04, sy - 0.03, Z0 + 0.26, Z0 + 0.28, r=0.0, seg=1)
for (a, b) in ((-3.95, -1.6), (0.4, 2.15)):
    for x_ in (a, b): xf0.rbox(sh.a('wood'), x_ - 0.02, x_ + 0.02, 1.0, 2.33, Z0 + 0.01, Z0 + 0.3, r=0.0, seg=1)
nr = Xf(3.1, Z0 + 0.02, 0, 0)                                                                                           # 往後面的暖簾（深藍布、白字小路）
for k in range(3): nr.rbox(sh.a('vc'), -0.45 + k * 0.3, -0.17 + k * 0.3, 1.2, 2.2, 0.0, 0.015, r=0.0, seg=1, col='#2a3a5a')
sg = IT['sign'][0]; sh.wall_img('back', 'print', sg['x'], sg['y'], sg['w'], sg['h'], K.cell_uv(0, 0, 2, 1), off=0.03)
xf0.rbox(sh.w('back', 'wood'), sg['x'] - sg['w'] / 2 - 0.04, sg['x'] + sg['w'] / 2 + 0.04, sg['y'] - sg['h'] / 2 - 0.04, sg['y'] + sg['h'] / 2 + 0.04, Z0, Z0 + 0.025, r=0.0, seg=1)
sh.hanging_pothos('pothos', -3.6, 2.6, Z0 + 0.2, n=8, drop=0.7)
sh.tally('kitchen')

# ---------------------------------------------------------------- 窗邊隔板座（木頭矮牆＋波浪玻璃）
for pt in IT['partition']:
    x = pt['x']; z0_, z1_ = pt['z0'], pt['z1']
    xf0.rbox(sh.a('wood'), x - 0.04, x + 0.04, 0.0, 1.1, z0_, z1_ - 0.02, r=0.0, seg=1)
    xf0.rbox(sh.a('wood'), x - 0.05, x + 0.05, 1.72, 1.78, z0_, z1_ - 0.02, r=0.0, seg=1)
    xf0.rbox(sh.a('wood'), x - 0.05, x + 0.05, 1.1, 1.78, z0_, z0_ + 0.06, r=0.0, seg=1)
    sh.a('ribbed').box(x - 0.012, x + 0.012, 1.1, 1.72, z0_ + 0.06, z1_ - 0.02)
    for k in range(0, int((z1_ - z0_) / 0.05), 3): xf0.rbox(sh.a('vcg'), x - 0.014, x + 0.014, 1.1, 1.72, z0_ + 0.07 + k * 0.05, z0_ + 0.078 + k * 0.05, r=0.0, seg=1, col='#a8a290')   # 波浪玻璃的直紋（細、稀）
for t in LAY['tables']:
    if t['id'] in (1, 2, 3):
        K.rect_table(sh, t['x'], t['z'], 0.0, t['w'], t['d'], h=0.75, top_key='wood', leg_key='wood', leg='wood')
        table_set(t['x'], t['z'] - 0.1 if t['id'] < 3 else t['z']); candle(t['x'] + 0.12, t['z'] + 0.2 if t['id'] < 3 else t['z'] + 0.1, 0.75)
        if t['id'] < 3: berries(t['x'], Z1 - 0.18, 0.75)
for s_ in LAY['seats']:
    if s_.get('kind') != 'stool' and not s_.get('seatH'): chair(s_['x'] - math.sin(s_['yaw']) * 0.05, s_['z'] - math.cos(s_['yaw']) * 0.05, s_['yaw'])
sh.tally('window_bays')

# ---------------------------------------------------------------- 西牆卡座（凹間：兩根木柱、上面木架）、海報、照片、紙菜單
bo = IT['booth'][0]; qz0, qz1 = bo['z0'], bo['z1']; qx1 = bo['x1']
xf0.rbox(sh.a('wood'), X0, qx1, 0.0, 0.4, qz0, qz1, r=0.0, seg=1)
xf0.rbox(sh.a('vcg'), X0 + 0.12, qx1 + 0.02, 0.4, 0.49, qz0 + 0.02, qz1 - 0.02, r=0.035, seg=2, col=GREEN)
n = 10
for k in range(n): xf0.rbox(sh.a('vcg'), X0 + 0.02, X0 + 0.16, 0.5, 1.12, qz0 + 0.03 + k * (qz1 - qz0 - 0.06) / n, qz0 + 0.03 + (k + 1) * (qz1 - qz0 - 0.06) / n - 0.012, r=0.035, seg=2, col=GREEN2)
xf0.rbox(sh.a('wood'), X0, X0 + 0.2, 1.12, 1.18, qz0, qz1, r=0.0, seg=1)
for zz in (qz0 - 0.1, qz1 + 0.1): xf0.rbox(sh.a('wood'), X0, X0 + 0.35, 0.0, 2.35, zz - 0.07, zz + 0.07, r=0.0, seg=1)   # 凹間的兩根木柱＋上樑
xf0.rbox(sh.a('wood'), X0, X0 + 0.35, 2.25, 2.42, qz0 - 0.17, qz1 + 0.17, r=0.0, seg=1)
xf0.rbox(sh.a('wood'), X0, X0 + 0.32, 2.42, 2.45, qz0 - 0.17, qz1 + 0.17, r=0.0, seg=1)                                  # 上面木架
rd = Xf(X0 + 0.17, qz0 + 0.45, math.pi / 2, 2.45); rd.rbox(sh.a('vc'), -0.2, 0.2, 0.0, 0.2, -0.1, 0.1, r=0.02, seg=1, col='#6a4428')   # 收音機
rd.rbox(sh.a('vc'), -0.16, 0.06, 0.04, 0.16, 0.1, 0.105, r=0.0, seg=1, col='#c8a870'); rd.rbox(sh.a('vcm'), 0.09, 0.15, 0.06, 0.14, 0.1, 0.11, r=0.0, seg=1, col=BRASS)
for k in range(9): xf0.rbox(sh.a('vc'), X0 + 0.06, X0 + 0.26, 2.45, 2.45 + R.uniform(0.2, 0.27), qz0 + 0.85 + k * 0.055, qz0 + 0.85 + k * 0.055 + 0.045, r=0.0, seg=1, col=R.choice(('#7a2a22', '#2a3a5a', '#c8b898', '#3a4a2a', '#5a3a24')))   # 幾本舊書
sh.hanging_pothos('pothos', X0 + 0.2, 2.5, qz1 - 0.15, n=9, drop=0.7)
tb = [t for t in LAY['tables'] if t['id'] == 4][0]; K.rect_table(sh, tb['x'], tb['z'], 0.0, tb['w'], tb['d'], h=0.75, top_key='wood', leg_key='wood', leg='wood')
table_set(tb['x'], tb['z'] - 0.2); candle(tb['x'], tb['z'] + 0.25, 0.75)
K.dome_pendant(sh, -2.75, tb['z'], 1.95, r=0.16, col='#c8903e', inner='#f8e0b0', kind='dome', glow_size=0.6)
sh.wall_img('left', 'print', (qz0 + qz1) / 2 - 0.35, 1.62, 0.48, 0.4, K.cell_uv(4, 3, 2, 2), off=0.02)   # v1f：照片照原本的長寬比（橫的）                   # 卡座牆上：舊照片＋紙菜單
for k in range(4): sh.wall_img('left', 'print', (qz0 + qz1) / 2 + 0.15 + k * 0.14, 1.62, 0.12, 0.24, K.cell_uv(4 + k, 0, 1, 1), off=0.02)
for pz in IT['poster']:
    c = pz['cell']; sh.wall_img(pz['side'], 'print', pz['along'], pz['y'], pz['w'], pz['h'], K.cell_uv(c[0], c[1], c[2], c[3]), off=0.02)
sh.wall_img('left', 'print', 3.45, 1.75, 0.32, 0.4, K.cell_uv(6, 3, 2, 2), off=0.02)   # v1f：人像（直的）
FUDA = lambda k: (k / 16 + 0.004, 1 - 3 / 8 + 0.004, (k + 1) / 16 - 0.004, 1 - 1 / 8 - 0.004)
for k in range(26):                                                                                                      # v1c：西牆一整排木札（掛在 2.05～2.5，卡座凹間上方照樣掛）
    zz = Z0 + 0.6 + k * (D - 1.2) / 25
    if abs(zz - 2.7) < 0.45 or abs(zz + 1.15) < 0.4: continue
    sh.wall_img('left', 'print', zz, 2.3, 0.12, 0.42, FUDA(k % 16), off=0.03)
xf0.rbox(sh.w('left', 'wood'), X0, X0 + 0.05, 2.52, 2.58, Z0 + 0.4, Z1 - 0.4, r=0.0, seg=1)
for k in range(14):                                                                                                      # v1c：後牆層架上方一整排木札
    x = -3.7 + k * 0.42
    if abs(x - 2.9) < 0.6: continue
    sh.wall_img('back', 'print', x, 2.6, 0.12, 0.4, FUDA((k + 5) % 16), off=0.03)
cl = IT['clock'][0]; cz_, cy_ = cl['z'], cl['y']                                                                     # 掛鐘（木框、米白鐘面）
xf0.cyl(sh.w('left', 'vc'), (X0, cy_, cz_), (X0 + 0.05, cy_, cz_), cl['r'], col='#5a3a24', seg=16); xf0.cyl(sh.w('left', 'vc'), (X0 + 0.05, cy_, cz_), (X0 + 0.055, cy_, cz_), cl['r'] - 0.025, col='#f1ead8', seg=16)
sh.tally('booth')

# ---------------------------------------------------------------- 右牆層板（照舊）、植物
sw = IT['shelf_wall'][0]; swx = sh.wall_xf('right', sw['z'], 0.0, 0.0)
for y in (sw['y'], sw['y'] + 0.45):
    swx.rbox(sh.w('right', 'wood'), -sw['w'] / 2, sw['w'] / 2, y - 0.03, y, 0.0, 0.25, r=0.0, seg=1)
    for k in range(6):
        u = -sw['w'] / 2 + 0.15 + k * (sw['w'] - 0.3) / 5; px_, py_, pz_ = swx.p(u, y, 0.12)
        if k % 2: bottle(px_, pz_, py_, k + 2, h=0.26, row=6, face=-math.pi / 2)
        else: C.ph_put(sh, ('ceramic_vase_02', 'ceramic_vase_04', 'ceramic_vase_01')[k // 2 % 3], px_, py_, pz_, yaw=k * 1.3, height=(0.17, 0.2, 0.16)[k // 2 % 3], decimate=0.08)   # 陶壺（v1f 是旋轉體；SHOP-CC0：Poly Haven 掃描的陶瓶）
pb = IT['plant_big'][0]; sh.plant(pb['x'], pb['z'], h=1.3, r=0.35, pot_col='#7a6a5a', y0=0.0)
sh.tally('right')
# SHOP-CC0-HELP-1113：參考圖吧台右端的花瓶、廚房工作台上的砧板和木碗
C.ph_put(sh, 'antique_ceramic_vase_01', 1.95, ch, -1.92, yaw=0.4, height=0.3, decimate=0.12)
C.ph_put(sh, 'wooden_cutting_board', 1.72, 0.93, Z0 + 0.36, yaw=0.08, height=0.03, decimate=0.3)
for k, (bx, by) in enumerate(((1.62, 0.96), (1.82, 0.96), (1.72, 1.0))): C.ph_put(sh, 'wooden_bowl_02', bx, by + 0.0, Z0 + 0.36 + (k - 1) * 0.04, yaw=k * 2.1, height=0.06, decimate=0.2)
C.used()
info = sh.finish(OUT, extra_info={'layout': LAY['version'], 'zone': 'wz_teishoku'})
