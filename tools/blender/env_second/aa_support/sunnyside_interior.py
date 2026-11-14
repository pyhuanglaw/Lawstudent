"""SUNNY SIDE（溫州街 B7，取代半熟；歐式街角早午餐）室內 → GLB（AA 2026-11-04 v1c：BB_257 §3 退件——開放廚房擺滿、咖啡機重做、甜點櫃擺滿、右牆不留白、拱頂鏡、每桌不一樣、使用痕跡、水彩畫重畫；AA_654／AA_655，使用者 11-04 04:4x 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/sunnyside_interior.py [-- --out assets/models/env/second_ai/aa_support/sunnyside.glb]
遊戲區域照舊是 `wz_brunch`；配置 src/data/sunnyside_layout.js（WZ_SHOPS_LAYOUT.brunch 的新版）。參考圖 docs/story_planning/ref_images/shops/wz_sunnyside_int.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py sns（sns_checker.png 黑白斜鋪小方磚、sns_print.png 菜單板、櫃台木牌、水彩畫、桌卡）；窗景 mok_view.png。
明亮的歐式早午餐：奶油白灰泥牆、白色外露天花板（管線、軌道燈、嵌入式冷氣）、胡桃木出餐檯和結帳櫃台、深綠菜單板、黃銅吊燈和壁燈、奶油色長沙發、曲木藤面椅、大理石小圓桌。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
import aa_cc0 as C   # noqa: E402（SHOP-CC0-HELP-1113：CC0 材質組＋Poly Haven 掃描模型）
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
    'view': K.img_mat(P + 'window_view', 'sns_views_day.jpg', rough=0.9, emit=0.12),   # v1e：LAWWW2 a485b6722 從 SUNNY SIDE 往外拍的窗景（上半＝正面、下半＝東側；夜版 sns_views_night.jpg 同樣排法，LAWWW 換）
    'print': K.img_mat(P + 'print', 'sns_print.png', rough=0.7),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
    'mirror': B.pbr(P + 'mirror', None, tint=B.srgb('#c8d0d4'), rough=0.04, metal=0.45),   # v1c：鏡面（亮面）
})
# SHOP-CC0-HELP-1113（D161）：頂點色零件換成 CC0 材質組（顏色照舊）；曲木椅的深木色併進胡桃木材質（木紋）、藤編坐墊用 ambientCG 藤編
C.enable(sh, route=dict({h: 'wood' for h in ('#3e2818', '#3b2d22', '#2e1e14', '#2a1a10', '#5a3a24')}, **{'#c8a870': 'wicker'}))
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
for side in ('back', 'left'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
    sh.wall_box(side, 'wood', a0, a1, 0.0, 0.12, -0.015, 0.0)
RW0, RW1, RS0, RS1 = -2.4, 4.6, 0.75, 2.55                                                                                  # v1d（BB_257 §11①、LAWWW2 06:58）：右牆＝轉角店的整面落地窗
sh.wall_box('right', 'wall', Z0, RW0, 0.0, H); sh.wall_box('right', 'wall', RW1, Z1, 0.0, H)                              # 後段留牆給廚房、轉角 0.4 m 柱
sh.wall_box('right', 'wall', RW0, RW1, 0.0, RS0); sh.wall_box('right', 'wall', RW0, RW1, RS1, H)
sh.wall_box('right', 'wood', Z0, Z1, 0.0, 0.12, -0.015, 0.0)
WG = '#3f5a3c'; WR = lambda z0_, z1_, y0_, y1_, d0=-0.05, d1=0.06: xf0.rbox(sh.w('right', 'vcg'), X1 + d0, X1 + d1, y0_, y1_, z0_, z1_, r=0.0, seg=1, col=WG)
WR(RW0, RW1, RS1 - 0.06, RS1); WR(RW0, RW1, RS0, RS0 + 0.06); WR(RW0, RW0 + 0.06, RS0, RS1); WR(RW1 - 0.06, RW1, RS0, RS1)   # 深綠框
for k in range(1, 13): zc = RW0 + k * (RW1 - RW0) / 13; WR(zc - 0.022, zc + 0.022, RS0, RS1, -0.04, 0.05)                  # 13 格直框
WR(RW0, RW1, 1.98, 2.02, -0.04, 0.05)                                                                                       # 橫框 y 2.0
xf0.rbox(sh.w('right', 'wood'), X1 - 0.16, X1, RS0 - 0.03, RS0, RW0, RW1, r=0.008, seg=1)                                # 窗台（可以放小盆栽）
sh.w('right', 'glass').box(X1 + 0.004, X1 + 0.008, RS0 + 0.02, RS1 - 0.02, RW0 + 0.02, RW1 - 0.02)
vx_ = X1 + 2.5; vr = Mesh('WALL_right_VIEW_' + P + 'window_view', sh.M['view'])                                           # 窗外的街樹（之後 LAWWW2 換溫州街）
xf0.quad(vr, [(vx_, -1.0, -3.0), (vx_, -1.0, 6.5), (vx_, 4.5, 6.5), (vx_, 4.5, -3.0)], uv=(0.0, 0.0, 1.0, 0.5))   # 圖的下半
vr.finish(sh.root, uv=False, props={'dir': K.DIRS['right'], 'windowView': True})
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.0, 4.5, vz), (-7.0, 4.5, vz), (-7.0, -1.0, vz), (7.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.5))   # 圖的上半
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
for (side, along) in (('left', -1.5), ('left', 1.4), ('right', -3.4)): sconce(side, along)   # v1d：右牆開窗，壁燈只留後段一盞
sh.tally('shell')

# ---------------------------------------------------------------- v1c 共用：散擺（BB_257 H：不等間距、不同尺寸、yaw、前後位置；偶爾空一格）
RS = random.Random(2205)


def scatter(x0, x1, makers, gap=(0.02, 0.1), empty=0.12):
    """沿 x 隨機擺：每次隨機挑一種東西（寬度 w×0.8～1.3），間距隨機，偶爾空一段；回傳 [(maker, x中心, 尺寸倍率)]"""
    x = x0 + RS.uniform(0.02, 0.08); out = []
    while True:
        mk, w = RS.choice(makers); sc = RS.uniform(0.8, 1.3); ww = w * sc
        if x + ww > x1: break
        if RS.random() < empty: x += RS.uniform(0.1, 0.22); continue
        out.append((mk, x + ww / 2, sc)); x += ww + RS.uniform(*gap)
    return out


def j(a=0.03): return RS.uniform(-a, a)


CERA = ('#f4f2ea', '#e8e2d4', '#dcd4c4', '#c8d0d4', '#e8d8c0', '#b8c4bc')


def i_plates(x, z, y, sc, yaw):
    n = RS.randint(2, 7); r = 0.09 * sc
    for k in range(n): K.plate(sh, x + j(0.004), z + j(0.004), y + k * 0.014, r=r, col=CERA[(k // 3 + int(sc * 10)) % len(CERA)])


def i_bowls(x, z, y, sc, yaw):
    n = RS.randint(1, 4); r = 0.065 * sc; c = RS.choice(CERA)
    for k in range(n): Xf(x + j(0.005), z + j(0.005), 0, y + k * 0.035).lathe(sh.a('vcg'), [(0.0, 0.0), (r * 0.5, 0.0), (r, r * 0.7), (r * 0.95, r * 0.72), (r * 0.45, 0.008), (0.0, 0.008)], 0, 0, 0, seg=12, col=c)


def i_jar(x, z, y, sc, yaw): K.jar(sh, x, z + j(), y, h=0.14 * sc * RS.uniform(0.8, 1.3), r=0.045 * sc, col=RS.choice(('#e8dcc0', '#c8a46a', '#8a5a3a', '#e8e2d4', '#a8b8a0')), lid=RS.choice(('#3a3a3a', '#b8944a', '#e8e2d4')))


def i_bottle(x, z, y, sc, yaw): K.bottle(sh, x, z + j(), y, h=0.26 * sc * RS.uniform(0.8, 1.25), r=0.032 * sc, col=RS.choice(('#5a6a3a', '#3a2a1e', '#c8a040', '#2e4a2e', '#e8e2d4')))


def i_cups(x, z, y, sc, yaw):
    for k in range(RS.randint(1, 3)): K.mug(sh, x + j(0.06), z + j(0.04), y, col=RS.choice(CERA), r=0.035 * RS.uniform(0.85, 1.2), h=0.08 * RS.uniform(0.85, 1.2), handle=RS.random() < 0.6)


def i_towel(x, z, y, sc, yaw): Xf(x, z + j(), yaw + j(0.3), y).rbox(sh.a('vc'), -0.12 * sc, 0.12 * sc, 0.0, 0.03 + 0.02 * sc, -0.08, 0.08, r=0.012, seg=1, col=RS.choice(('#e8e2d4', '#c8d4dc', '#e8d0b8')))


def i_tin(x, z, y, sc, yaw): Xf(x, z + j(), 0, y).lathe(sh.a('vcm'), [(0.0, 0.0), (0.045 * sc, 0.0), (0.045 * sc, 0.13 * sc), (0.0, 0.135 * sc)], 0, 0, 0, seg=10, col=RS.choice(('#c8c8c4', '#b8944a', '#8a6a3a', '#2c3e32')))


def i_board(x, z, y, sc, yaw): Xf(x, z - 0.06, yaw * 0.2, y).rbox(sh.a('vc'), -0.13 * sc, 0.13 * sc, 0.0, 0.32 * sc, -0.012, 0.012, r=0.02, seg=1, col=RS.choice(('#b88a5a', '#9a6a40')))


def i_crock(x, z, y, sc, yaw):
    t = Xf(x, z + j(), 0, y); t.lathe(sh.a('vcg'), [(0.0, 0.0), (0.05 * sc, 0.0), (0.055 * sc, 0.14 * sc), (0.0, 0.14 * sc)], 0, 0, 0, seg=10, col=RS.choice(('#e8e2d4', '#5a6a7a', '#c8a46a')))
    for k in range(RS.randint(3, 6)):
        a = RS.uniform(0, 6.28); t.cyl(sh.a('vcm'), (0.02 * math.cos(a), 0.05, 0.02 * math.sin(a)), (0.05 * math.cos(a), 0.3 * sc + RS.uniform(0, 0.06), 0.05 * math.sin(a)), 0.006, col=RS.choice(('#c8c8c4', '#5a3a24')), seg=4)


def i_plant(x, z, y, sc, yaw): sh.plant(x, z, h=0.22 * sc, r=0.08 * sc, pot_col=RS.choice(('#d8d0c0', '#b0653e', '#e8e2d6')), y0=y)


KITCHEN = [(i_plates, 0.2), (i_bowls, 0.15), (i_jar, 0.1), (i_bottle, 0.08), (i_cups, 0.2), (i_towel, 0.25), (i_tin, 0.1)]
COUNTER = [(i_board, 0.28), (i_crock, 0.12), (i_bowls, 0.15), (i_bottle, 0.08), (i_jar, 0.1), (i_towel, 0.25)]
SHELF = [(i_jar, 0.1), (i_plant, 0.18), (i_cups, 0.2), (i_tin, 0.1), (i_bottle, 0.08)]


def cake(x, z, y, kind, sc):
    if kind == 'round':
        r = 0.08 * sc; h = RS.uniform(0.05, 0.1)
        Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (r, 0.0), (r, h), (r * 0.95, h + 0.01), (0.0, h + 0.01)], 0, 0, 0, seg=14, col=RS.choice(('#f0dcb8', '#d8a060', '#f4e8d0', '#7a4a30')))
        for q in range(RS.randint(0, 5)):
            a = RS.uniform(0, 6.28)
            sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.01), (0.012, 0.0), (0.0, 0.012)], seg=5), RS.choice(('#c02a3a', '#f4f0e6', '#3a6a2a'))), Matrix.Translation(g2b(x + math.cos(a) * r * 0.6, y + h + 0.015, z + math.sin(a) * r * 0.6)))
    elif kind == 'square':
        w = 0.06 * sc; h = RS.uniform(0.04, 0.07)
        Xf(x, z, RS.uniform(-0.6, 0.6), y).rbox(sh.a('vcg'), -w, w, 0.0, h, -w * 0.7, w * 0.7, r=0.006, seg=1, col=RS.choice(('#c88a50', '#f0dcb8', '#4a2a1a', '#e8c890')))
    elif kind == 'tart':
        r = 0.07 * sc
        Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (r, 0.0), (r * 1.04, 0.025), (r * 0.94, 0.03), (0.0, 0.025)], 0, 0, 0, seg=16, col='#d8a060')
        Xf(x, z, 0, y + 0.02).lathe(sh.a('vcg'), [(0.0, 0.0), (r * 0.9, 0.0), (r * 0.85, 0.012), (0.0, 0.014)], 0, 0, 0, seg=14, col=RS.choice(('#e8c040', '#c02a3a', '#f4e8c8')))
    else:   # 可頌（SHOP-CC0：Poly Haven 掃描的可頌；v1e 是四段圓柱）
        C.ph_put(sh, 'croissant', x, y, z, yaw=RS.uniform(0, 3.14), s=0.75 * sc, height=0.062, decimate=0.5)


def flowers(x, z, y, col, big=False):
    s = 1.5 if big else 1.0
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.03 * s, 0.0), (0.035 * s, 0.08 * s), (0.02 * s, 0.12 * s), (0.022 * s, 0.13 * s)], 0, 0, 0, seg=8)
    for q in range(int(6 * s)):
        a = q * 1.1 + j(0.3); tx, tz = math.cos(a) * 0.05 * s, math.sin(a) * 0.05 * s; hh = y + (0.2 + RS.uniform(0, 0.08)) * s
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.1 * s, 0), (tx, hh, tz), 0.002, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.012), (0.022, -0.004), (0.023, 0.0), (0.0, 0.01)], seg=5), col), Matrix.Translation(g2b(x + tx, hh, z + tz)))


# ---------------------------------------------------------------- 開放廚房（照舊位置）：料理台、冰箱、斜的排油煙罩、銅鍋吊桿、不鏽鋼層架擺滿（v1c）
kl = IT['kitchen_line'][0]; kx0, kx1 = kl['x'] - kl['w'] / 2, kl['x'] + kl['w'] / 2; kz0, kz1 = kl['z'] - kl['d'] / 2, kl['z'] + kl['d'] / 2
xf0.rbox(sh.a('vcm'), kx0, kx1, 0.0, 0.88, kz0, kz1, r=0.01, seg=1, col=STEEL); xf0.rbox(sh.a('vcm'), kx0, kx1, 0.88, 0.91, kz0, kz1 + 0.02, r=0.006, seg=1, col='#d8d8d4')
for k in range(5): xf0.rbox(sh.a('vcm'), kx0 + 0.05 + k * 1.0, kx0 + 0.97 + k * 1.0, 0.1, 0.8, kz1, kz1 + 0.008, r=0.0, seg=1, col=('#b4b4b0', '#bcbcb8', '#b0b0ac', '#b8b8b4', '#b2b2ae')[k])   # 櫃門（顏色微差）
xf0.rbox(sh.a('vcg'), X0, X1, 0.91, 2.05, Z0, Z0 + 0.012, r=0.0, seg=1, col='#ece8e0')                                     # 白色磁磚背牆
for k in range(14): xf0.rbox(sh.a('vcg'), X0, X1, 0.99 + k * 0.075, 0.994 + k * 0.075, Z0 + 0.012, Z0 + 0.014, r=0.0, seg=1, col='#d0ccc2')   # 磁磚縫（橫）
for (x, r, h, col) in ((-2.1, 0.15, 0.13, '#9a9a96'), (-1.45, 0.13, 0.05, '#3a3a38')):                                   # 爐子上：一個深鍋、一個平底鍋（尺寸不同）
    Xf(x, kl['z'], 0, 0.91).lathe(sh.a('vcm'), [(0.0, 0.0), (r, 0.0), (r, h), (r * 0.96, h), (r * 0.96, 0.01), (0.0, 0.01)], 0, 0, 0, seg=14, col=col)
Xf(-1.45, kl['z'], 0.7, 0.93).cyl(sh.a('vcm'), (0.12, 0, 0), (0.34, 0.02, 0), 0.012, col='#2a2a28', seg=6)
xf0.rbox(sh.a('vcm'), kx0 + 2.2, kx0 + 3.0, 0.91, 0.95, kz0 + 0.1, kz1 - 0.1, r=0.01, seg=1, col='#3a3a38')               # 煎台
for (mk, x, sc) in scatter(kx0 + 3.05, kx1 - 0.05, COUNTER, gap=(0.03, 0.15)): mk(x, kl['z'] - 0.08 + j(0.08), 0.91, sc, RS.uniform(-0.4, 0.4))
for (mk, x, sc) in scatter(kx0 + 0.02, kx0 + 0.6, COUNTER, gap=(0.03, 0.1)): mk(x, kl['z'] + j(0.08), 0.91, sc, RS.uniform(-0.4, 0.4))
hb = bmesh.new()                                                                                                          # 排油煙罩：往上收斜的罩子（凸包）＋煙囪
hx, hz = -1.75, Z0 + 0.32
for (w, d_, y) in ((0.78, 0.33, 1.95), (0.78, 0.33, 2.0), (0.26, 0.16, 2.42)):
    for (sx, sz) in ((-1, -1), (1, -1), (1, 1), (-1, 1)): hb.verts.new(g2b(hx + sx * w, y, hz + (sz * d_ if sz > 0 else -0.32)))
bmesh.ops.convex_hull(hb, input=hb.verts); sh.a('vcm').add_bm(K.paint_bm(hb, STEEL)); hb.free()
xf0.rbox(sh.a('vcm'), hx - 0.25, hx + 0.25, 2.42, H, Z0, Z0 + 0.32, r=0.02, seg=1, col='#b8b8b4')
xf0.rbox(sh.a('vcm'), hx - 0.78, hx + 0.78, 1.93, 1.96, Z0, Z0 + 0.66, r=0.006, seg=1, col='#8a8a86')                      # 罩子下緣（比較暗）
for (y, x0_, x1_) in ((1.22, -0.3, 2.15), (1.58, -0.3, 2.15), (1.92, -0.3, 2.15), (1.3, kx0 - 0.15, -2.75), (1.68, kx0 - 0.15, -2.75)):        # 不鏽鋼層架：右邊兩層長的、爐子左邊兩層短的
    xf0.rbox(sh.a('vcm'), x0_, x1_, y - 0.02, y, Z0 + 0.012, Z0 + 0.32, r=0.004, seg=1, col=STEEL)
    for xx in (x0_ + 0.02, x1_ - 0.02): xf0.rbox(sh.a('vcm'), xx - 0.008, xx + 0.008, y - 0.18, y, Z0 + 0.25, Z0 + 0.27, r=0.0, seg=1, col='#8a8a86')
    for (mk, x, sc) in scatter(x0_, x1_, KITCHEN, gap=(0.01, 0.07), empty=0.07): mk(x, Z0 + 0.16 + j(0.04), y, sc, RS.uniform(-0.5, 0.5))
xf0.cyl(sh.a('vcm'), (-0.25, 2.12, Z0 + 0.5), (2.1, 2.12, Z0 + 0.5), 0.012, col=BRASS, seg=6)                             # 銅鍋吊桿（層架上面）
px = -0.15
for k in range(6):                                                                                                        # 銅鍋、平底鍋、湯杓：直徑 16～28 cm、吊的長短不一、有的轉了角度
    kind = ('pot', 'pan', 'pot', 'ladle', 'pan', 'pot')[k]; r = RS.uniform(0.08, 0.14) if kind != 'ladle' else 0.04
    px += r + RS.uniform(0.04, 0.16)
    if px + r > 2.05: break
    drop = RS.uniform(0.1, 0.3); yb = 2.12 - drop; yaw = RS.uniform(-0.6, 0.6)
    xf0.cyl(sh.a('vcm'), (px, 2.12, Z0 + 0.5), (px + j(0.02), yb + 0.02, Z0 + 0.5 + j(0.02)), 0.005, col=BRASS, seg=4)
    if kind == 'pot':
        Xf(px, Z0 + 0.5, yaw, yb - r * 1.15).lathe(sh.a('vcm'), [(0.0, 0.0), (r * 0.9, 0.0), (r, 0.02), (r, r * 1.1), (r * 1.05, r * 1.15), (0.0, r * 1.12)], 0, 0, 0, seg=14, col=('#b06a3a', '#a8603a', '#b8784a')[k % 3])
    elif kind == 'pan':
        xf0.cyl(sh.a('vcm'), (px, yb + 0.01, Z0 + 0.5), (px + j(0.03), yb - 0.2, Z0 + 0.5), 0.009, col='#2a2a28', seg=5)
        xf0.cyl(sh.a('vcm'), (px - r * 0.15, yb - 0.21 - r, Z0 + 0.47), (px + r * 0.15, yb - 0.21 + r, Z0 + 0.5), r, col='#b8784a', seg=14)
    else:
        xf0.cyl(sh.a('vcm'), (px, yb, Z0 + 0.5), (px, yb - 0.3, Z0 + 0.52), 0.008, col='#c8c8c4', seg=4)
        Xf(px, Z0 + 0.53, 0, yb - 0.34).lathe(sh.a('vcm'), [(0.0, 0.0), (0.04, 0.01), (0.045, 0.04), (0.0, 0.035)], 0, 0, 0, seg=10, col='#c8c8c4')
    px += r
fg = IT['fridge'][0]; xf0.rbox(sh.a('vcm'), fg['x'] - fg['w'] / 2, fg['x'] + fg['w'] / 2, 0.0, fg['h'], fg['z'] - fg['d'] / 2, fg['z'] + fg['d'] / 2, r=0.02, seg=1, col='#d8d8d4')
xf0.rbox(sh.a('vcm'), fg['x'] - fg['w'] / 2 + 0.06, fg['x'] - fg['w'] / 2 + 0.09, 0.9, 1.5, fg['z'] + fg['d'] / 2, fg['z'] + fg['d'] / 2 + 0.03, r=0.0, seg=1, col='#8a8a86')
for k in range(3): sh.img_quad(sh.a('print'), Xf(fg['x'] + RS.uniform(-0.25, 0.2), fg['z'] + fg['d'] / 2 + 0.035, j(0.15), RS.uniform(1.1, 1.6)), 0, 0, 0, 0.09, 0.11, K.cell_uv(7, 2, 1, 1))   # 冰箱上的便條
sh.tally('kitchen')

# ---------------------------------------------------------------- 出餐檯（照舊位置）：胡桃木框格（踢腳磨深）、石材檯面、義式咖啡機（v1c 重做）、兩台磨豆機、擺滿的甜點櫃、高腳凳；上方矮牆＋菜單板
pc = IT['pass_counter'][0]; px0, px1 = pc['x'] - pc['w'] / 2, pc['x'] + pc['w'] / 2; pz0, pz1 = pc['z'] - pc['d'] / 2, pc['z'] + pc['d'] / 2; ph = pc['h']
xf0.rbox(sh.a('wood'), px0, px1, 0.0, ph - 0.04, pz0, pz1, r=0.01, seg=1)
for k in range(6):
    x = px0 + 0.06 + k * (pc['w'] - 0.12) / 6; xf0.rbox(sh.a('vc'), x + 0.06, x + (pc['w'] - 0.12) / 6 - 0.06, 0.14, ph - 0.16, pz1, pz1 + 0.018, r=0.008, seg=1, col=WAL2)
xf0.rbox(sh.a('vc'), px0, px1, 0.0, 0.1, pz1, pz1 + 0.022, r=0.0, seg=1, col='#2a1a10')                                    # 踢腳（被鞋子踢深的）
for k in range(7):
    x = RS.uniform(px0 + 0.1, px1 - 0.3); xf0.rbox(sh.a('vc'), x, x + RS.uniform(0.08, 0.3), 0.1, RS.uniform(0.13, 0.2), pz1 + 0.018, pz1 + 0.021, r=0.0, seg=1, col='#2e1e14')   # 踢痕
xf0.rbox(sh.a('vcg'), px0 - 0.03, px1 + 0.03, ph - 0.04, ph, pz0 - 0.02, pz1 + 0.05, r=0.01, seg=1, col='#e4ded2')         # 淺色石材檯面
xf0.rbox(sh.a('vcg'), px0 - 0.03, px1 + 0.03, ph - 0.045, ph - 0.035, pz1 + 0.045, pz1 + 0.052, r=0.0, seg=1, col='#b8b0a0')   # 檯面前緣被手磨暗


def espresso(x, z, y):
    """義式咖啡機：倒角機身、兩個沖煮頭＋把手、兩根蒸氣管、儀表、滴水盤；上面疊著大小不一的杯子"""
    t = Xf(x, z, 0.0, y); m = sh.a('vcm')
    t.rbox(m, -0.4, 0.4, 0.06, 0.44, -0.2, 0.17, r=0.05, seg=3, col='#c8c8c6')
    t.rbox(m, -0.36, 0.36, 0.14, 0.38, 0.165, 0.19, r=0.02, seg=2, col='#2e2e2c')
    t.rbox(m, -0.38, 0.38, 0.0, 0.06, -0.18, 0.24, r=0.015, seg=2, col='#3a3a38')                                     # 滴水盤
    for sx in (-0.17, 0.17):
        t.cyl(m, (sx, 0.32, 0.19), (sx, 0.24, 0.22), 0.045, col='#d8d8d6', seg=12)
        t.cyl(m, (sx, 0.23, 0.22), (sx + 0.02, 0.2, 0.42), 0.014, col='#1e1e1e', seg=6)                               # 把手
        t.lathe(sh.a('vcg'), [(0.0, 0.0), (0.03, 0.0), (0.033, 0.05), (0.0, 0.01)], sx, 0.06, 0.22, seg=10, col='#f4f2ea')   # 接著的小杯
    for sx in (-0.33, 0.33):                                                                                          # 蒸氣管：兩段彎下來
        t.cyl(m, (sx, 0.34, 0.17), (sx * 1.12, 0.3, 0.26), 0.007, col='#d8d8d6', seg=5); t.cyl(m, (sx * 1.12, 0.3, 0.26), (sx * 1.15, 0.12, 0.27), 0.006, col='#d8d8d6', seg=5)
    for sx in (-0.08, 0.08): Xf(x + sx, z + 0.192, 0.0, y + 0.33).rbox(m, -0.03, 0.03, -0.03, 0.03, 0.0, 0.012, r=0.012, seg=2, col='#e8e8e4')   # 兩個儀表
    t.rbox(m, -0.39, 0.39, 0.44, 0.47, -0.2, 0.17, r=0.01, seg=1, col='#a8a8a4')                                       # 上面的溫杯架
    cx = -0.34
    while cx < 0.32:                                                                                                  # 杯子：大小不一、有的疊兩三個
        r = RS.uniform(0.028, 0.042); cx += r + RS.uniform(0.005, 0.03)
        if cx + r > 0.36: break
        n = RS.choice((1, 1, 2, 2, 3)); hh = RS.uniform(0.05, 0.08); col = RS.choice(CERA); zz = RS.uniform(-0.14, 0.08)
        for q in range(n): K.mug(sh, x + cx, z + zz, y + 0.47 + q * hh * 0.82, col=col, r=r, h=hh, handle=False)
        cx += r


espresso(px0 + 1.55, pc['z'] - 0.05, ph)
for (gx, sc) in ((px0 + 2.2, 1.0), (px0 + 2.5, 0.82)):                                                                    # 兩台磨豆機（大小不同）
    g = Xf(gx, pc['z'] - 0.06, RS.uniform(-0.3, 0.3), ph); g.rbox(sh.a('vcm'), -0.08 * sc, 0.08 * sc, 0.0, 0.3 * sc, -0.09 * sc, 0.09 * sc, r=0.03, seg=2, col=('#2e2e2e', '#a8a8a4')[int(sc < 0.9)])
    g.lathe(sh.a('glass'), [(0.03 * sc, 0.3 * sc), (0.08 * sc, 0.5 * sc), (0.075 * sc, 0.52 * sc)], 0, 0, 0, seg=10)
    g.lathe(sh.a('vcg'), [(0.0, 0.3 * sc), (0.035 * sc, 0.31 * sc), (0.06 * sc, 0.42 * sc), (0.0, 0.42 * sc)], 0, 0, 0, seg=8, col='#3a2418')
for (mk, x, sc) in scatter(px0 + 0.05, px0 + 1.0, [(i_jar, 0.11), (i_cups, 0.18), (i_plant, 0.16), (i_crock, 0.12)], gap=(0.04, 0.18)): mk(x, pc['z'] + j(0.1), ph, sc, RS.uniform(-0.5, 0.5))
cx0_, cx1_ = px1 - 1.5, px1 - 0.1                                                                                         # 玻璃甜點櫃（右段，上下兩層擺滿）
xf0.rbox(sh.a('wood'), cx0_, cx1_, ph, ph + 0.05, pz0 + 0.03, pz1 - 0.02, r=0.006, seg=1)
sh.a('glass').box(cx0_ + 0.01, cx1_ - 0.01, ph + 0.05, ph + 0.5, pz0 + 0.04, pz1 - 0.03); sh.a('bulb').box(cx0_ + 0.04, cx1_ - 0.04, ph + 0.485, ph + 0.495, pz0 + 0.08, pz1 - 0.08)
sh.a('glass').box(cx0_ + 0.02, cx1_ - 0.02, ph + 0.26, ph + 0.27, pz0 + 0.05, pz1 - 0.05)
for y in (ph + 0.05, ph + 0.27):
    x = cx0_ + 0.06
    while True:
        kind = RS.choice(('round', 'square', 'tart', 'croissant', 'square', 'round')); sc = RS.uniform(0.8, 1.25); w = 0.16 * sc
        if x + w > cx1_ - 0.04: break
        cake(x + w / 2, pc['z'] + j(0.06), y, kind, sc); x += w + RS.uniform(0.01, 0.06)
for (x, kind) in ((cx0_ + 0.3, 'tall'), (cx0_ + 1.05, 'low')):                                                            # 兩種玻璃罩蛋糕
    hh = 0.32 if kind == 'tall' else 0.16; rr = 0.12 if kind == 'tall' else 0.15
    Xf(x, pc['z'], 0, ph + 0.5).lathe(sh.a('vcg'), [(0.0, 0.0), (rr + 0.02, 0.0), (rr + 0.02, 0.015), (0.03, 0.03), (0.025, 0.08), (rr + 0.03, 0.09), (rr + 0.03, 0.1), (0.0, 0.1)], 0, 0, 0, seg=16, col='#f4f2ea')
    if kind == 'tall': C.ph_put(sh, 'strawberry_chocolate_cake', x, ph + 0.6, pc['z'], yaw=0.6, height=0.08, decimate=0.08)   # SHOP-CC0：玻璃罩裡的蛋糕（Poly Haven 掃描）
    else: RS.choice('a'); C.ph_put(sh, 'carrot_cake', x, ph + 0.6, pc['z'], yaw=2.0, height=0.1, decimate=0.12)   # RS.choice：照舊用掉一次亂數，後面散擺的東西位置不變
    Xf(x, pc['z'], 0, ph + 0.6).lathe(sh.a('glass'), [(rr, 0.0), (rr, hh * 0.6), (rr * 0.7, hh * 0.9), (0.02, hh), (0.0, hh + 0.02)], 0, 0, 0, seg=16)
Xf(px0 + 0.4, pc['z'] + 0.08, 0, ph).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.05), (0.035, 0.08), (0.0, 0.085)], 0, 0, 0, seg=10, col='#f2d070')   # 蛋計時器（老闆娘的）
for s_ in LAY['seats']:
    if s_.get('kind') == 'stool': stool(s_['x'] + j(0.04), s_['z'] - 0.05 + j(0.04))
mw = IT['menu_wall'][0]; mx0, mx1 = mw['x'] - mw['w'] / 2, mw['x'] + mw['w'] / 2
xf0.rbox(sh.a('vcg'), mx0, mx1, mw['y0'], H, mw['z'] - 0.06, mw['z'] + 0.06, r=0.0, seg=1, col='#efe6d6')                 # 出餐檯上方的矮牆
xf0.rbox(sh.a('wood'), mw['x'] - 1.25, mw['x'] + 1.25, 2.22, 3.06, mw['z'] + 0.06, mw['z'] + 0.09, r=0.0, seg=1)
sh.img_quad(sh.a('print'), Xf(mw['x'], mw['z'] + 0.095, 0.0, 0.0), 0.0, 2.26, 0.0, 2.4, 0.8, K.cell_uv(0, 0, 6, 2))
for k in range(2): brass_pendant(mw['x'] - 1.05 + k * 2.1 + j(0.1), pc['z'] + 0.35, 2.15 - k * 0.06, r=0.17 + k * 0.02)
sh.tally('pass')

# ---------------------------------------------------------------- 結帳櫃台（照舊位置）：金字木牌、黃銅檯燈、收銀機、名片、花；踢腳磨深
ca = IT['cashier'][0]; ax0, ax1 = ca['x'] - ca['w'] / 2, ca['x'] + ca['w'] / 2; az0, az1 = ca['z'] - ca['d'] / 2, ca['z'] + ca['d'] / 2
xf0.rbox(sh.a('wood'), ax0, ax1, 0.0, ca['h'] - 0.04, az0, az1, r=0.01, seg=1)
xf0.rbox(sh.a('vc'), ax0 - 0.022, ax0, 0.0, 0.1, az0, az1, r=0.0, seg=1, col='#2a1a10')
xf0.rbox(sh.a('vcg'), ax0 - 0.03, ax1 + 0.02, ca['h'] - 0.04, ca['h'], az0 - 0.02, az1 + 0.02, r=0.01, seg=1, col='#e4ded2')
sh.img_quad(sh.a('print'), Xf(ax0 - 0.024, ca['z'], -math.pi / 2, 0.0), 0.0, 0.3, 0.0, 0.9, 0.45, K.cell_uv(0, 2, 2, 1))
rg = Xf(ca['x'] + 0.05, ca['z'] - 0.2, -math.pi / 2 + 0.25, ca['h']); rg.rbox(sh.a('vcm'), -0.15, 0.15, 0.0, 0.08, -0.12, 0.12, r=0.01, seg=1, col='#2e2e2e')
rg.rbox(sh.a('vcm'), -0.13, 0.13, 0.12, 0.32, -0.02, 0.0, r=0.005, seg=1, col='#2e2e2e'); rg.cyl(sh.a('vcm'), (0, 0.08, 0.0), (0, 0.13, -0.01), 0.015, col='#2e2e2e', seg=6)
lp = Xf(ca['x'], az1 - 0.18, 0, ca['h']); lp.lathe(sh.a('vcm'), [(0.0, 0.0), (0.08, 0.0), (0.08, 0.02), (0.015, 0.04), (0.012, 0.34), (0.0, 0.35)], 0, 0, 0, seg=12, col=BRASS)
lp.lathe(sh.a('bulb'), [(0.0, 0.48), (0.12, 0.42), (0.15, 0.35), (0.14, 0.34), (0.0, 0.36)], 0, 0, 0, seg=16)
CL.glow(sh.root, 'tablelamp', ca['x'], ca['h'] + 0.4, az1 - 0.18, color='rgba(255,210,150,1)', size=0.5, day=0.0, night=0.8)
flowers(ca['x'] - 0.18, az0 + 0.22, ca['h'], '#f4f0e6', big=True)
Xf(ca['x'] - 0.2, ca['z'] + 0.12, 0.4, ca['h']).rbox(sh.a('vc'), -0.04, 0.04, 0.0, 0.05, -0.03, 0.03, r=0.005, seg=1, col='#e8e2d4')   # 名片盒
sh.tally('cashier')

# ---------------------------------------------------------------- 左牆長沙發卡座、拱頂金框鏡（v1c）、水彩畫、層架、黃金葛
bq = IT['banquette'][0]; qx0, qx1, qz0, qz1 = bq['x0'], bq['x1'], bq['z0'], bq['z1']
xf0.rbox(sh.a('wood'), qx0, qx1, 0.0, 0.08, qz0, qz1, r=0.0, seg=1)
xf0.rbox(sh.a('vc'), qx0 + 0.15, qx1 + 0.02, 0.08, 0.46, qz0 + 0.02, qz1 - 0.02, r=0.04, seg=2, col=CREAM)
n = 12
for k in range(n): xf0.rbox(sh.a('vc'), qx0 + 0.02, qx0 + 0.18, 0.46, 1.08, qz0 + 0.03 + k * (qz1 - qz0 - 0.06) / n, qz0 + 0.03 + (k + 1) * (qz1 - qz0 - 0.06) / n - 0.012, r=0.04, seg=2, col=CREAM2)
for (zz, ang, col) in ((qz0 + 0.3, 0.25, '#8a8680'), (qz1 - 0.45, -0.35, '#a89a86')): Xf(qx0 + 0.3, zz, math.pi / 2 + ang).rbox(sh.a('vc'), -0.2, 0.2, 0.5, 0.86, -0.07, 0.07, r=0.06, seg=2, col=col)
mr = IT['mirror'][0]; mw_, mh_ = mr['w'], mr['h']; mr_r = mw_ / 2; mstraight = mh_ - mr_r; my0 = mr['y'] - mh_ / 2


def mpt(u, v, off): return sh.wall_xf('left', mr['along'], off, 0.0).p(u, my0 + v, 0.0)


outline = [(-mr_r, 0.0), (mr_r, 0.0)] + [(mr_r * math.cos(a), mstraight + mr_r * math.sin(a)) for a in [math.pi * k / 16 for k in range(17)]] + [(-mr_r, 0.0)]
mb = bmesh.new(); vs = [mb.verts.new(g2b(*mpt(u, v, 0.034))) for (u, v) in outline[:-2]]; mb.faces.new(vs); mb.normal_update()
sh.w('left', 'mirror').add_bm(mb); mb.free()
for (u0, v0), (u1, v1) in zip(outline[:-1], outline[1:]): xf0.cyl(sh.w('left', 'vcm'), mpt(u0, v0, 0.035), mpt(u1, v1, 0.035), 0.03, col=BRASS, seg=6)   # 金框（沿著拱頂）
for (u0, v0), (u1, v1) in zip(outline[2:-2], outline[3:-1]):
    sc_ = 1.12; q0 = (u0 * sc_, mstraight + (v0 - mstraight) * sc_); q1 = (u1 * sc_, mstraight + (v1 - mstraight) * sc_)
    xf0.cyl(sh.w('left', 'vcm'), mpt(q0[0], q0[1], 0.03), mpt(q1[0], q1[1], 0.03), 0.012, col='#c8a458', seg=5)          # 外圈細線
cx_, cy_, cz_ = mpt(0.0, mh_ + 0.08, 0.04); sh.w('left', 'vcm').add_bm(K.paint_bm(L.lathe([(0.0, -0.06), (0.05, -0.03), (0.06, 0.02), (0.03, 0.06), (0.0, 0.07)], seg=10), BRASS), Matrix.Translation(g2b(cx_, cy_, cz_)))   # 頂上的雕花
for su in (-1, 1): p_ = mpt(su * (mr_r + 0.05), mstraight, 0.04); sh.w('left', 'vcm').add_bm(K.paint_bm(L.lathe([(0.0, -0.035), (0.035, 0.0), (0.0, 0.035)], seg=8), BRASS), Matrix.Translation(g2b(*p_)))
for pr in IT['print']:
    c = pr['cell']; sh.wall_img(pr['side'], 'print', pr['along'], pr['y'], pr['w'], pr['h'], K.cell_uv(c[0], c[1], c[2], c[3]), off=0.03)
    wx = sh.wall_xf(pr['side'], pr['along'], 0.0, pr['y']); wx.rbox(sh.w(pr['side'], 'wood'), -pr['w'] / 2 - 0.04, pr['w'] / 2 + 0.04, -pr['h'] / 2 - 0.04, pr['h'] / 2 + 0.04, 0.0, 0.025, r=0.006, seg=1)
sw = IT['shelf_wall'][0]; swx = sh.wall_xf('left', sw['z'], 0.0, sw['y'])
swx.rbox(sh.w('left', 'wood'), -sw['w'] / 2, sw['w'] / 2, -0.03, 0.0, 0.0, 0.25, r=0.0, seg=1)
for k in range(7):
    h_ = RS.uniform(0.18, 0.28); swx.rbox(sh.w('left', 'vc'), -0.45 + k * 0.055 + j(0.005), -0.45 + k * 0.055 + 0.042, 0.0, h_, 0.03, 0.2, r=0.0, seg=1, col=RS.choice(('#5a3a24', '#2c3e32', '#7a2a22', '#c8b898', '#3a4a6a')))
px_, py_, pz_ = swx.p(0.25, 0.0, 0.12); sh.plant(px_, pz_, h=0.3, r=0.1, pot_col='#d8d0c0', y0=py_); sh.hanging_pothos('pothos', px_, py_ + 0.05, pz_, n=10, drop=0.9)
hx_, hy_, hz_ = mpt(mr_r + 0.3, mh_ + 0.15, 0.14)                                                                         # 鏡子旁邊吊下來的黃金葛
Xf(hx_, hz_).cyl(sh.a('vcm'), (0, H, 0), (0, hy_ + 0.12, 0), 0.003, seg=3, col='#8a7a5a')
Xf(hx_, hz_, 0, hy_).lathe(sh.a('vcg'), [(0.0, 0.0), (0.08, 0.0), (0.1, 0.12), (0.0, 0.12)], 0, 0, 0, seg=10, col='#e8e2d6'); sh.hanging_pothos('pothos', hx_, hy_ + 0.1, hz_, n=11, drop=1.0)
sh.tally('left')

# ---------------------------------------------------------------- 右牆不留白（v1c）：小黑板、長層架（植物、罐子、書）、兩個小框、吊盆；牆腳的髒污
def rw(along, off=0.0, y=0.0): return sh.wall_xf('right', along, off, y)


sh.wall_img('right', 'print', -3.55, 1.85, 0.62, 0.62, K.cell_uv(0, 3, 2, 2), off=0.03)                                     # v1d：小黑板搬到窗洞後面的實牆（z −3.55）
rw(-3.55, 0.0, 1.85).rbox(sh.w('right', 'wood'), -0.35, 0.35, -0.35, 0.35, 0.0, 0.025, r=0.01, seg=1)
for (zz, kind) in ((-1.9, 0), (-0.2, 1), (1.45, 0), (2.95, 1), (4.2, 0)):                                                 # 窗台上的小盆栽（間距、大小不一）
    zz += RS.uniform(-0.15, 0.15); sc = RS.uniform(0.8, 1.3)
    if kind == 0: sh.plant(X1 - 0.08, zz, h=0.25 * sc, r=0.08 * sc, pot_col=RS.choice(('#d8d0c0', '#b0653e', '#e8e2d6')), y0=RS0)
    else: Xf(X1 - 0.08, zz, 0, RS0).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05 * sc, 0.0), (0.06 * sc, 0.1 * sc), (0.0, 0.1 * sc)], 0, 0, 0, seg=10, col='#e8e2d6'); sh.hanging_pothos('pothos', X1 - 0.08, RS0 + 0.1 * sc, zz, n=5, drop=0.35)
gx_, gz_ = X1 - 0.35, 1.75                                                                                                 # 天花板吊下來的植物（走道上方 2.05 m 以上）
Xf(gx_, gz_).cyl(sh.a('vcm'), (0, H, 0), (0, 2.25, 0), 0.003, seg=3, col='#8a7a5a')
Xf(gx_, gz_, 0, 2.05).lathe(sh.a('vcg'), [(0.0, 0.0), (0.09, 0.0), (0.12, 0.18), (0.0, 0.18)], 0, 0, 0, seg=10, col='#c8b48a'); sh.hanging_pothos('pothos', gx_, 2.2, gz_, n=9, drop=0.4)
for side, a0, a1 in (('left', Z0 + 0.3, Z1 - 0.3), ('right', Z0 + 2.6, Z1 - 0.3), ('back', X0 + 0.2, X1 - 0.2)):          # 牆腳的髒污：腳踢的、拖地水漬（高度不一、斷斷續續）
    u = a0
    while u < a1:
        L_ = RS.uniform(0.4, 1.4); hgt = RS.uniform(0.15, 0.3)
        if RS.random() < 0.7:
            p0 = sh._wp(side, u, 0.004); p1 = sh._wp(side, min(u + L_, a1), 0.006)
            xf0.rbox(sh.w(side, 'vc'), min(p0[0], p1[0]), max(p0[0], p1[0]), 0.12, hgt, min(p0[1], p1[1]), max(p0[1], p1[1]), r=0.0, seg=1, col=RS.choice(('#e2d8c4', '#ddd2bc', '#e6dcc8')))
        u += L_ + RS.uniform(0.1, 0.6)
sh.tally('right')


# ---------------------------------------------------------------- 桌子（每桌擺的不一樣）、椅子（有幾張沒推進去、轉了角度）、植物
def tbl_set(t, y):
    x, z, k = t['x'], t['z'], t['id']
    if k in (1, 6):                                                                                                       # 兩杯水＋小花＋桌卡
        for q in range(2): K.glass_cup(sh, x - 0.1 + q * 0.2 + j(0.03), z + 0.08 + j(0.04), y, h=0.1 * RS.uniform(0.9, 1.1), r=0.03, fill='#e8eef0')
        flowers(x + j(0.05), z - 0.06, y, ('#f6f2ea', '#f0c8c4')[k % 2]); sh.img_quad(sh.a('print'), Xf(x + 0.14, z - 0.12, 0.3 + j(0.3), y), 0, 0, 0, 0.08, 0.1, K.cell_uv(6, 2, 1, 1), tilt=0.15)
    elif k == 2:                                                                                                          # 一杯拿鐵在小碟上、菜單立牌
        K.plate(sh, x + 0.08, z + 0.05, y, r=0.07, col='#f4f2ea'); K.mug(sh, x + 0.08, z + 0.05, y + 0.012, col='#f4f2ea', r=0.04, h=0.075)
        sh.img_quad(sh.a('print'), Xf(x - 0.1, z - 0.1, -0.4, y), 0, 0, 0, 0.1, 0.14, K.cell_uv(7, 2, 1, 1), tilt=0.2)
    elif k == 3:                                                                                                          # 糖罐、兩杯水、一枝大一點的花
        K.jar(sh, x - 0.18, z - 0.12, y, h=0.1, r=0.04, col='#f4f2ea', lid='#b8944a')
        for q in range(2): K.glass_cup(sh, x + 0.05 + q * 0.16, z + 0.14 + j(0.03), y, h=0.11, r=0.032, fill='#e8eef0')
        flowers(x + 0.05, z - 0.1, y, '#f4e0a0', big=True)
    elif k == 4:                                                                                                          # 吃完的盤子（剩一點可頌）、刀叉、一杯美式、花
        K.plate(sh, x - 0.1, z + 0.12, y, r=0.11, col='#f4f2ea'); cake(x - 0.12, z + 0.1, y + 0.012, 'croissant', 0.7)
        Xf(x - 0.02, z + 0.14, 0.7, y + 0.014).rbox(sh.a('vcm'), -0.09, 0.09, 0.0, 0.004, -0.006, 0.006, r=0.0, seg=1, col='#c8c8c4')
        K.mug(sh, x + 0.15, z - 0.12, y, col='#e8d8c0', r=0.042, h=0.08); flowers(x + 0.18, z + 0.2, y, '#f0c8c4')
    else:                                                                                                                 # 圓桌五：一本翻開的書、一杯伯爵茶、小盆栽
        Xf(x - 0.06, z + 0.04, 0.5, y).rbox(sh.a('vc'), -0.11, 0.11, 0.0, 0.015, -0.08, 0.08, r=0.004, seg=1, col='#f4efe4')
        K.mug(sh, x + 0.14, z - 0.08, y, col='#c8d0d4', r=0.04, h=0.08); i_plant(x - 0.12, z - 0.15, y, 0.8, 0.0)


for t in LAY['tables']:
    if t['kind'] == 'rect':
        xf = Xf(t['x'], t['z']); xf.rbox(sh.a('wood'), -t['w'] / 2, t['w'] / 2, 0.71, 0.75, -t['d'] / 2, t['d'] / 2, r=0.01, seg=1); iron_base(t['x'], t['z'], 0.71)
    else:
        Xf(t['x'], t['z']).lathe(sh.a('vcg'), [(0.0, 0.72), (t['r'] - 0.01, 0.72), (t['r'], 0.73), (t['r'], 0.745), (t['r'] - 0.01, 0.75), (0.0, 0.75)], 0, 0, 0, seg=22, col=MARBLE)
        iron_base(t['x'], t['z'], 0.72)
    tbl_set(t, 0.75)
PULLED = {1: (0.14, 0.25), 5: (0.1, -0.3), 8: (0.16, 0.2), 11: (0.08, -0.15)}                                             # 沒推進去的椅子（只是畫面；座位點不動）
for i_, s_ in enumerate(LAY['seats']):
    if s_.get('kind') == 'stool' or s_.get('seatH'): continue
    back, turn = PULLED.get(i_, (0.04, 0.0)); bentwood(s_['x'] - math.sin(s_['yaw']) * back, s_['z'] - math.cos(s_['yaw']) * back, s_['yaw'] + turn + j(0.05))
for pb in IT['plant_big']:
    Xf(pb['x'], pb['z']).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col='#e8e2d6')
    sh.plant(pb['x'], pb['z'], h=0.9 * RS.uniform(0.9, 1.2), r=0.36, pot_col='#6a5a44', y0=0.42)
for t in (TB[3], TB[4]): brass_pendant(t['x'] + j(0.05), t['z'], 2.3 - (0.08 if t['id'] == 4 else 0.0), r=0.22)
sh.tally('seating')
C.used()
info = sh.finish(OUT, keep=lambda ob: 'ceiling' in ob.name, extra_info={'layout': LAY['version'], 'zone': 'wz_brunch'})
