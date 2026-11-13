"""一盞茶屋（溫州街日式宿舍改的茶屋）室內 → GLB（AA 2026-11-04；AA_656／AA_657，使用者 11-04 05:08 參考圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/yizhan_interior.py [-- --out assets/models/env/second_ai/aa_support/yizhan.glb]
遊戲區域照舊是 `wz_teahouse`；配置 src/data/yizhan_layout.js（WZ_SHOPS_LAYOUT.teahouse 的新版）。座標＝區域座標：主屋 x −4.2～4.2、z −5～5，緣側 z 5～6.2。
**只做到 z 6.2**：前院、冠木門、竹籬、樟樹、石燈籠、沓脫石、緣側外緣的柱子和簷是 LAWWW2 的 wz_teahouse_yard.glb（11-04 05:22）。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py yzn（yzn_tatami.png、yzn_print.png）。
保留的名字（WZ_YIZHAN_FIXED_COORDS §共通）：材質 wzs_washi（和紙）、wzs_pendant（吊燈的框和線）→ seeThru；天花板材質結尾 ceiling_boards；節點 TRACE_SQ14_catphoto；
正面那一排（玄關前牆、格子玻璃拉門、橫樑）在 WALL_engawa_* 那一組（鏡頭在前院上方時淡出）。地板淺色木地板（D112，參考圖是深色）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import aa_kit as K   # noqa: E402
import aa_cc0 as C   # noqa: E402（SHOP-CC0-HELP-1113：CC0 材質組＋Poly Haven 掃描模型）
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/yizhan_layout.js', 'YIZHAN_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, H = LAY['w'], LAY['h']
sh = K.Shop('yzn_', 'yizhan_interior', W, 10.0, H, texres=512, props={'layout': LAY['version'], 'zone': 'wz_teahouse'}, seed=1106)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1          # x −4.2～4.2、z −5～5（房子本體；緣側在 Z1～Z1+1.2）
K.DIRS['engawa'] = [0, 0, -1]; sh.walls['engawa'] = {}
sh._imgkeys = {'print'}   # v1b：榻榻米要盒狀 UV（v1 放在這裡沒有 UV，整片取到深綠布邊的顏色＝黑）
P = 'yzn_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_wood', 'yzn_floor.png', rough=0.5, tile=2.2),   # v1d：每片木板深淺不一（aa_int_tex.yzn_floor；BB_257 §12 建議）
    'tatami': K.img_mat(P + 'tatami', 'yzn_tatami.png', rough=0.85, tile=1.8),
    'wall': CL.soft_plaster(P + 'wall_plaster', '#efe2c6', 0.9, cull=True, tile=1.4, k=0.3),
    'post': L.pbr(P + 'post', 'walnut_veneer', tile=0.8, target='#5e4028', maps=('diff',), res=256, rough_value=0.5, cull=True),
    'ceil': L.pbr(P + 'ceiling_boards', 'walnut_veneer', tile=1.2, target='#9a7650', maps=('diff',), res=256, rough_value=0.7, cull=True),
    'washi': L.flat('wzs_washi', '#f6efdc', rough=0.7, emit=B.srgb('#ffd8a0')),
    'pend': L.flat('wzs_pendant', '#3a2618', rough=0.6),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'print': K.img_mat(P + 'print', 'yzn_print.png', rough=0.75),
})
sh.M['bulb'] = sh.M['washi']
# SHOP-CC0-HELP-1113（D161）：頂點色零件換成 CC0 材質組（顏色照舊）；坐墊用 ambientCG 布料（織紋）、深色木作併進柱子的胡桃木材質（木紋）
C.enable(sh, route=dict({h: 'fabric' for h in ('#c0b090', '#8a7a62', '#7a6a52', '#5a4a3a')}, **{h: 'post' for h in ('#5a3e28', '#4a3222', '#3a2618', '#2e1e12')}))
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
xf0 = Xf(0, 0); R = random.Random(1106)
POST = '#4a3222'; POST2 = '#3a2618'; PAPER = '#f4e8cc'; CUSH = '#c0b090'; CUSH2 = '#8a7a62'; STONE = '#8e8a82'; CERA = '#e8e2d4'; IRON = '#2a2826'


def lantern(x, z, y, s=0.32, h=0.34):
    """方形和紙吊燈：細木框（wzs_pendant）、和紙（wzs_washi，發光）、吊線"""
    Xf(x, z).cyl(sh.a('pend'), (0, H, 0), (0, y + h, 0), 0.004, seg=4)
    sh.a('washi').box(x - s / 2 + 0.01, x + s / 2 - 0.01, y + 0.01, y + h - 0.01, z - s / 2 + 0.01, z + s / 2 - 0.01)
    for (dx, dz) in ((-1, -1), (1, -1), (1, 1), (-1, 1)): sh.a('pend').box(x + dx * s / 2 - 0.012, x + dx * s / 2 + 0.012, y, y + h, z + dz * s / 2 - 0.012, z + dz * s / 2 + 0.012)
    for yy in (y, y + h - 0.02):
        for dz in (-1, 1): sh.a('pend').box(x - s / 2, x + s / 2, yy, yy + 0.02, z + dz * s / 2 - 0.012, z + dz * s / 2 + 0.012)
        for dx in (-1, 1): sh.a('pend').box(x + dx * s / 2 - 0.012, x + dx * s / 2 + 0.012, yy, yy + 0.02, z - s / 2, z + s / 2)
    CL.glow(sh.root, 'washi', x, y + h / 2, z, color='rgba(255,210,150,1)', size=0.8, day=0.0, night=0.85)


def zabuton(x, z, ry, col=CUSH, y0=0.0):
    """坐墊（v1d）：薄底＋中間鼓起（壓扁的球）＋四角的房（流蘇）；頂約 0.075"""
    xf = Xf(x, z, ry, y0); xf.rbox(sh.a('vc'), -0.27, 0.27, 0.0, 0.035, -0.3, 0.3, r=0.015, seg=1, col=col)
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=8, radius=1.0)
    for v in bm.verts: v.co.x *= 0.25; v.co.y *= 0.28; v.co.z *= 0.042
    sh.a('vc').add_bm(K.paint_bm(bm, col), Matrix.Translation(g2b(*xf.p(0, 0.035, 0))) @ Matrix.Rotation(ry, 4, 'Z')); bm.free()
    for (dx, dz) in ((-0.26, -0.29), (0.26, -0.29), (0.26, 0.29), (-0.26, 0.29)): xf.rbox(sh.a('vc'), dx - 0.012, dx + 0.012, 0.015, 0.04, dz - 0.012, dz + 0.012, r=0.0, seg=1, col=CUSH2 if col == CUSH else '#5a4a3a')


def teacup(x, z, y, col=CERA):
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.025, 0.0), (0.035, 0.05), (0.033, 0.055), (0.0, 0.01)], 0, 0, 0, seg=10, col=col)


def teapot(x, z, y, col='#3a2418', r=0.07):
    t = Xf(x, z, 0, y); t.lathe(sh.a('vcg'), [(0.0, 0.0), (r * 0.7, 0.0), (r, r * 0.6), (r * 0.8, r * 1.15), (r * 0.3, r * 1.25), (0.02, r * 1.45), (0.0, r * 1.5)], 0, 0, 0, seg=12, col=col)
    t.cyl(sh.a('vcg'), (r * 0.8, r * 0.6, 0), (r * 1.6, r * 1.0, 0), 0.012, col=col, seg=5)


def tin(x, z, y, k, h=0.16, r=0.045, face=0.0):
    Xf(x, z, 0, y).lathe(sh.a('vcm'), [(0.0, 0.0), (r, 0.0), (r, h), (r * 0.9, h + 0.012), (0.0, h + 0.015)], 0, 0, 0, seg=10, col='#b8944a' if k % 3 else '#8a6a3a')
    sh.img_quad(sh.a('print'), Xf(x, z, face, y), 0.0, h * 0.12, r + 0.003, r * 1.3, h * 0.75, ((256 + (k % 8) * 64) / 1024 + 0.003, 1 - 128 / 1024 + 0.004, (256 + (k % 8 + 1) * 64) / 1024 - 0.003, 1 - 0.004))


def flowers(x, z, y, col='#e8d8d0'):
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.07, 0.08), (0.04, 0.17), (0.045, 0.2), (0.0, 0.2)], 0, 0, 0, seg=10, col='#8a8a7a')
    for j in range(5):
        a = j * 1.25; tx, tz = math.cos(a) * 0.12, math.sin(a) * 0.12
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.18, 0), (tx, y + 0.42 + (j % 2) * 0.08, tz), 0.004, col='#4a3a2a', seg=3, caps=False)
        for q in range(3): sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.014), (0.016, 0.0), (0.0, 0.014)], seg=5), col), Matrix.Translation(g2b(x + tx * (0.55 + q * 0.22), y + 0.32 + q * 0.04 + (j % 2) * 0.05, z + tz * (0.55 + q * 0.22))))


# ---------------------------------------------------------------- 地板：大間＋緣側淺色木地板、和室榻榻米、玄關石板＋上框
Mesh(P + 'floor', sh.M['floor'], tile=2.2).box(X0, X1, -0.02, 0.0, -0.6, 3.8).box(-2.4, X1, -0.02, 0.0, 3.8, Z1).box(-2.2, X1, -0.02, 0.0, Z1, Z1 + 1.2).finish(sh.root)   # v1b：玄關那一塊（x −4.2～−2.4、z 3.8～5.0）挖掉，做成 y −0.12 的三和土
for t in IT['tatami_room']:
    x0, z0 = t['x'] - t['w'] / 2 + (0.06 if t['x'] > 0 else 0.0), t['z'] - t['d'] / 2; x1, z1 = t['x'] + t['w'] / 2 - (0.06 if t['x'] < 0 else 0.0), t['z'] + t['d'] / 2
    sh.a('tatami').box(x0, x1, -0.02, 0.03, z0, z1)
gk = IT['genkan'][0]; gx0, gx1, gz0, gz1 = gk['x'] - gk['w'] / 2, gk['x'] + gk['w'] / 2, gk['z'] - gk['d'] / 2, gk['z'] + gk['d'] / 2
for i in range(3):                                                                                                         # 玄關的三和土石板（三×二塊，頂面 y −0.12；LAWWW2 11-04 06:24 的導航高度）
    for j in range(2): xf0.rbox(sh.a('vcg'), gx0 + i * gk['w'] / 3 + 0.01, gx0 + (i + 1) * gk['w'] / 3 - 0.01, -0.16, -0.12, gz0 + 0.12 + j * (gk['d'] - 0.12) / 2 + 0.01, gz0 + 0.12 + (j + 1) * (gk['d'] - 0.12) / 2 - 0.01, r=0.0, seg=1, col=(STONE, '#9a958c', '#86827a')[(i + j) % 3])
xf0.rbox(sh.a('vcg'), gx0, gx1, -0.17, -0.125, gz0, gz1, r=0.0, seg=1, col='#6e6a62')                                     # 石板下的底（縫看起來是深色）
xf0.rbox(sh.a('post'), gx0, gx1, -0.12, 0.0, gz0 - 0.02, gz0 + 0.12, r=0.006, seg=1)                                     # 上がり框（z 3.8，−0.12～0）
xf0.rbox(sh.a('post'), gx1 - 0.02, gx1 + 0.03, -0.12, 0.0, gz0, gz1, r=0.0, seg=1)                                        # 玄關東側的木邊（−0.12～0）
xf0.rbox(sh.a('vcg'), X0, gx1, -0.25, -0.12, Z1 - 0.03, Z1 + 0.02, r=0.0, seg=1, col='#7e7a72')                          # z 5.0 的石材立面（前院土間 y −0.24 → 玄關 −0.12）
xf0.rbox(sh.a('vcg'), gx1, -2.2, -0.25, 0.0, Z1 - 0.03, Z1 + 0.02, r=0.0, seg=1, col='#7e7a72')
for j, col in enumerate(('#2a2a2c', '#6a4a30')): Xf(gx0 + 0.55 + j * 0.28, gz0 + 0.95, 0.15 * j).rbox(sh.a('vc'), -0.05, 0.05, -0.115, -0.065, -0.12, 0.12, r=0.02, seg=1, col=col)   # 脫在門口的鞋
gb = IT['getabako'][0]; Xf(gb['x'], gb['z']).rbox(sh.a('post'), -gb['w'] / 2, gb['w'] / 2, -0.12, gb['h'], -gb['d'] / 2, gb['d'] / 2, r=0.01, seg=1)
for k in range(3): Xf(gb['x'] + gb['w'] / 2 + 0.005, gb['z'] - 0.4 + k * 0.4).rbox(sh.a('vc'), -0.005, 0.0, 0.08, gb['h'] - 0.06, -0.18, 0.18, r=0.0, seg=1, col='#5a3e28')
sh.a('washi').box(gb['x'] - 0.09, gb['x'] + 0.09, gb['h'] + 0.02, gb['h'] + 0.28, gb['z'] - 0.39, gb['z'] - 0.21)          # 鞋櫃上的方形紙座燈
CL.glow(sh.root, 'andon', gb['x'], gb['h'] + 0.15, gb['z'] - 0.3, color='rgba(255,210,150,1)', size=0.5, day=0.0, night=0.8)
flowers(gb['x'], gb['z'] + 0.25, gb['h'], col='#f0e8dc')
sh.tally('floor')

# ---------------------------------------------------------------- 天花板（木板＋格縁＋三根梁）、牆（灰泥＋柱＋長押＋腰板）
ce = Mesh(P + 'ceiling', sh.M['ceil'], tile=1.2); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
bt = Mesh(P + 'ceiling_batten', sh.M['post'])
for z in [Z0 + k * 0.9 for k in range(1, 11)]: bt.quad([(X0, H - 0.03, z - 0.02), (X1, H - 0.03, z - 0.02), (X1, H - 0.03, z + 0.02), (X0, H - 0.03, z + 0.02)])   # 格縁：朝下的單面
bt.finish(sh.root, uv=True)
for z_ in (-0.6, 2.2): xf0.rbox(sh.a('post'), X0, X1, H - 0.24, H - 0.01, z_ - 0.1, z_ + 0.1, r=0.0, seg=1)            # 梁
xf0.rbox(sh.a('post'), -2.2 - 0.1, -2.2 + 0.1, H - 0.24, H - 0.01, -0.6, Z1 - 0.09, r=0.0, seg=1)   # v1e：停在正面那一排（WALL_engawa 的橫樑）前面，不然鏡頭在前院上方時這一截不會淡出（wz_shops_cam）
for x_ in (-3.2, -1.1, 1.0, 3.1): xf0.rbox(sh.a('post'), x_ - 0.05, x_ + 0.05, H - 0.14, H - 0.01, -0.6, Z1 - 0.09, r=0.0, seg=1)   # v1d：小梁（沿 z），接近參考圖的外露屋架
for x_ in (-3.2, -1.1, 1.0, 3.1):
    for z_ in (-0.6, 2.2): xf0.rbox(sh.a('post'), x_ - 0.04, x_ + 0.04, H - 0.24, H - 0.14, z_ - 0.04, z_ + 0.04, r=0.0, seg=1)   # 束
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1)
    sh.wall_box(side, 'wall', a0, a1, 0.5, H); sh.wall_box(side, 'post', a0, a1, 0.0, 0.5); sh.wall_box(side, 'post', a0, a1, 1.95, 2.05, -0.03, 0.0)   # 腰板、長押
    for k in range(int((a1 - a0) / 1.8) + 1):
        c = a0 + k * 1.8
        if side == 'back': sh.w(side, 'post').box(c - 0.06, c + 0.06, 0.0, H, Z0, Z0 + 0.12)
        elif side == 'left': sh.w(side, 'post').box(X0, X0 + 0.12, 0.0, H, c - 0.06, c + 0.06)
        else: sh.w(side, 'post').box(X1 - 0.12, X1, 0.0, H, c - 0.06, c + 0.06)
sh.tally('shell')

# ---------------------------------------------------------------- 正面（z 5）：玄關前牆＋格子門、緣側的格子玻璃拉門（收兩端）、橫樑、竹簾——都在 WALL_engawa 那一組，兩面都做
EW = lambda key: sh.w('engawa', key)
EW('wall').box(X0, -3.5, 0.0, H, Z1 - 0.06, Z1 + 0.06); EW('wall').box(-2.5, -2.2, 0.0, H, Z1 - 0.06, Z1 + 0.06); EW('wall').box(-3.5, -2.5, 2.05, H, Z1 - 0.06, Z1 + 0.06)
for x in (X0, -3.5, -2.5, -2.2): EW('post').box(x - 0.06, x + 0.06, 0.0, H, Z1 - 0.08, Z1 + 0.08)                         # 柱（內外都看得到）
for zz in (Z1 - 0.1, Z1 + 0.08):                                                                                           # 內外都有長押、腰板（v1c：貼在柱子外面 2 cm，不和柱面同一個平面——BB_257 §9 門口東側柱腳兩條黑帶）（v1b：腰板只在牆的兩段，門口 x −3.5～−2.5 不擋）
    EW('post').box(X0, -2.2, 1.95, 2.07, zz, zz + 0.02)
    for (a_, b_) in ((X0, -3.5), (-2.5, -2.2)): EW('post').box(a_, b_, 0.0, 0.5, zz, zz + 0.02)
def lattice_door(a, b, z, glass=True, hgt=2.05):
    """格子門：木框＋縱橫格子＋玻璃（或紙）"""
    EW('post').box(a, b, 0.0, 0.06, z - 0.025, z + 0.025); EW('post').box(a, b, hgt - 0.05, hgt, z - 0.025, z + 0.025)
    EW('post').box(a, a + 0.04, 0.0, hgt, z - 0.025, z + 0.025); EW('post').box(b - 0.04, b, 0.0, hgt, z - 0.025, z + 0.025)
    n = max(2, round((b - a) / 0.22))
    for j in range(1, n): u = a + j * (b - a) / n; EW('post').box(u - 0.01, u + 0.01, 0.06, hgt - 0.05, z - 0.015, z + 0.015)
    for yy in (0.55, 0.95, 1.35, 1.75): EW('post').box(a, b, yy - 0.01, yy + 0.01, z - 0.015, z + 0.015)
    if glass: EW('glass').box(a + 0.04, b - 0.04, 0.06, hgt - 0.05, z - 0.004, z + 0.004)
    else: xf0.rbox(EW('vcg'), a + 0.04, b - 0.04, 0.06, hgt - 0.05, z - 0.004, z + 0.004, r=0.0, seg=1, col=PAPER)
lattice_door(-4.15, -3.5, Z1 + 0.1, glass=True)                                                                               # 玄關的格子門（拉開，停在門左邊外側的軌道上）
for (a, b, dz) in ((-2.15, -1.35, -0.03), (-1.95, -1.15, 0.03), (3.35, 4.15, -0.03), (3.15, 3.95, 0.03)): lattice_door(a, b, Z1 + dz)   # 緣側的格子玻璃拉門：拉開，兩端各疊兩片
EW('post').box(-2.2, X1, H - 0.2, H, Z1 - 0.08, Z1 + 0.08)                                                                  # 緣側上方的橫樑（鴨居到天花板）
EW('post').box(-2.2, X1, 2.05, 2.1, Z1 - 0.06, Z1 + 0.06)
for k in range(int((X1 + 2.2) / 0.3)): x = -2.2 + 0.15 + k * 0.3; EW('post').box(x - 0.008, x + 0.008, 2.1, H - 0.2, Z1 - 0.01, Z1 + 0.01)   # 欄間的直格子
for (a, b) in ((-1.1, 1.3), (1.5, 3.1)):                                                                                    # 捲起來的竹簾
    xf0.cyl(EW('vc'), (a, 2.0, Z1 + 0.12), (b, 2.0, Z1 + 0.12), 0.045, col='#8a7448', seg=10)
    for x in (a + 0.15, b - 0.15): xf0.cyl(EW('vc'), (x, 2.05, Z1 + 0.1), (x, 1.9, Z1 + 0.13), 0.004, col='#e8dcc0', seg=3)
sh.tally('front')

# ---------------------------------------------------------------- 和室前的紙拉門（中間各開一段）、襖、床之間、違い棚、矮桌、坐墊、行燈
sj = IT['shoji_wall'][0]; zz = sj['z']; xs_ = [sj['x0']] + [v for o in sj['open'] for v in o] + [sj['x1']]
for i in range(0, len(xs_), 2):
    a, b = xs_[i], xs_[i + 1]
    if a > 3.0:                                                                                                             # 東端那一段＝往後面的布暖簾（水屋北端）
        for k in range(2): xf0.rbox(sh.a('vc'), a + 0.05 + k * (b - a - 0.1) / 2, a + 0.05 + (k + 1) * (b - a - 0.1) / 2 - 0.02, 1.15, 2.0, zz - 0.01, zz + 0.01, r=0.0, seg=1, col='#d8ccb0')
        sh.a('post').box(a, b, 1.98, H, zz - 0.06, zz + 0.06); continue
    xf0.rbox(sh.a('vcg'), a, b, 0.03, 2.0, zz - 0.012, zz + 0.012, r=0.0, seg=1, col=PAPER)
    n = max(2, round((b - a) / 0.3))
    for j in range(n + 1): u = a + j * (b - a) / n; sh.a('post').box(u - 0.012, u + 0.012, 0.03, 2.0, zz - 0.02, zz + 0.02)
    for yy in (0.03, 0.4, 0.8, 1.2, 1.6, 1.98): sh.a('post').box(a, b, yy - 0.01, yy + 0.012, zz - 0.02, zz + 0.02)
    sh.a('post').box(a, b, 1.98, H, zz - 0.06, zz + 0.06)
for (a, b) in sj['open']: sh.a('post').box(a, b, 1.98, H, zz - 0.06, zz + 0.06)
for x in (-1.0, 0.0, 1.0, 3.2): sh.a('post').box(x - 0.06, x + 0.06, 0.0, H, zz - 0.07, zz + 0.07)
fu = IT['fusuma'][0]; xf0.rbox(sh.a('vcg'), -0.05, 0.05, 0.03, 2.0, fu['z'] - fu['d'] / 2, fu['z'] + fu['d'] / 2, r=0.0, seg=1, col='#e7dcc4')
sh.a('post').box(-0.06, 0.06, 1.98, H, fu['z'] - fu['d'] / 2, fu['z'] + fu['d'] / 2)
for zc in (fu['z'] - 1.1, fu['z'] + 1.1):
    for sx in (-0.055, 0.055): xf0.cyl(sh.a('vcm'), (sx, 0.95, zc), (sx * 1.15, 0.95, zc), 0.03, col=IRON, seg=10)
tk = IT['tokonoma'][0]; xf0.rbox(sh.a('post'), tk['x'] - tk['w'] / 2, tk['x'] + tk['w'] / 2, 0.0, 0.15, tk['z'] - tk['d'] / 2, tk['z'] + tk['d'] / 2, r=0.006, seg=1)
xf0.rbox(sh.a('post'), tk['x'] + tk['w'] / 2 - 0.04, tk['x'] + tk['w'] / 2 + 0.06, 0.0, H, tk['z'] + tk['d'] / 2 - 0.08, tk['z'] + tk['d'] / 2 + 0.02, r=0.01, seg=1)   # 床柱
sh.wall_img('back', 'print', tk['x'], 1.35, 0.36, 0.95, K.cell_uv(1, 0, 1, 2), off=0.02)                                    # 掛軸
flowers(tk['x'] + 0.45, tk['z'], 0.15, col='#f4f0e6')
for (y, a, b) in ((1.0, 1.3, 2.2), (1.25, 2.0, 2.9), (1.7, 1.2, 2.9)): xf0.rbox(sh.a('post'), a, b, y - 0.03, y, Z0 + 0.12, Z0 + 0.42, r=0.0, seg=1)   # 和室 B 的違い棚
teapot(1.6, Z0 + 0.27, 1.0, col='#6a4a30'); K.jar(sh, 2.4, Z0 + 0.27, 1.25, h=0.14, r=0.05, col='#8a9aa4', lid='#3a2a1e'); teacup(2.7, Z0 + 0.27, 1.25)
Xf(1.95, Z0 + 0.27, 0, 1.0).lathe(sh.a('vcm'), [(0.0, 0.0), (0.05, 0.0), (0.06, 0.04), (0.055, 0.07), (0.0, 0.075)], 0, 0, 0, seg=10, col='#5a4a2a')   # 香爐（v1d）
for j in range(2): teacup(2.15 + j * 0.02, Z0 + 0.25, 1.25 + j * 0.04, col='#3a3a3a')
for k in range(4): Xf(1.35 + k * 0.045, Z0 + 0.25, 0, 1.7).rbox(sh.a('vc'), -0.02, 0.02, 0.0, 0.2 + 0.02 * (k % 2), -0.1, 0.1, r=0.0, seg=1, col=('#7a2a22', '#2a3a5a', '#c8b898', '#3a4a2a')[k])   # 舊書
flowers(2.6, Z0 + 0.27, 1.7, col='#f0c8c4'); flowers(-1.2, -4.4, 0.03, col='#f4f0e6')
for t in IT['low_table']:
    xf = Xf(t['x'], t['z']); h = t.get('h', 0.34)
    xf.rbox(sh.a('post'), -t['w'] / 2, t['w'] / 2, h - 0.04, h, -t['d'] / 2, t['d'] / 2, r=0.012, seg=1)
    for sx in (-t['w'] / 2 + 0.08, t['w'] / 2 - 0.08):
        for sz in (-t['d'] / 2 + 0.08, t['d'] / 2 - 0.08): xf.rbox(sh.a('post'), sx - 0.035, sx + 0.035, 0.03, h - 0.04, sz - 0.035, sz + 0.035, r=0.0, seg=1)
    if t['w'] > 2:                                                                                                          # 茶席：茶盤、茶壺、六個茶杯、一枝花、竹蓆的桌巾
        xf0.rbox(sh.a('vc'), t['x'] - 0.8, t['x'] + 0.8, h, h + 0.004, t['z'] - 0.14, t['z'] + 0.14, r=0.0, seg=1, col='#c8b48a')
        for s_ in LAY['seats'][:6]: teacup(s_['x'], t['z'] + (0.25 if s_['z'] > t['z'] else -0.25), h)
        for x in (t['x'] - 0.9, t['x'] + 0.45): teapot(x, t['z'], h + 0.004)
        Xf(t['x'] - 0.2, t['z'], 0, h).lathe(sh.a('vcg'), [(0.0, 0.0), (0.035, 0.0), (0.04, 0.09), (0.02, 0.14), (0.0, 0.14)], 0, 0, 0, seg=8, col='#7a8a7a')
        for j in range(3): Xf(t['x'] - 0.2, t['z']).cyl(sh.a('vc'), (0, h + 0.12, 0), (0.05 * math.cos(j * 2.1), h + 0.32, 0.05 * math.sin(j * 2.1)), 0.003, col='#4a5a2a', seg=3, caps=False)
    else: teapot(t['x'] + 0.25, t['z'], h, col='#3a2418', r=0.06); teacup(t['x'] - 0.2, t['z'] + 0.1, h); teacup(t['x'] - 0.3, t['z'] - 0.15, h)
rz = random.Random(1171)
for z_ in IT['zabuton']: zabuton(z_['x'] + rz.uniform(-0.02, 0.02), z_['z'] + rz.uniform(-0.02, 0.02), z_.get('ry', 0.0) + rz.uniform(-0.09, 0.09), col=CUSH if z_['z'] > -0.6 else CUSH2)   # v1d：每個坐墊轉幾度、偏一點（座位點照舊）
for j in range(3): zabuton(-0.55 + j * 0.01, -0.95 - j * 0.01, 0.15 * j, col=(CUSH2, '#7a6a52', CUSH2)[j], y0=j * 0.075)   # 和室 A 角落疊起來的三個（不在走道上：紙拉門 −1.0 那根柱子的北邊）
for (x, z_) in ((-0.65, -4.3), (3.6, -4.4)):                                                                                # 和室的行燈（落地的方形紙燈）
    sh.a('pend').box(x - 0.14, x + 0.14, 0.0, 0.05, z_ - 0.14, z_ + 0.14); sh.a('washi').box(x - 0.12, x + 0.12, 0.05, 0.55, z_ - 0.12, z_ + 0.12)
    for (dx, dz) in ((-1, -1), (1, -1), (1, 1), (-1, 1)): sh.a('pend').box(x + dx * 0.12 - 0.012, x + dx * 0.12 + 0.012, 0.0, 0.58, z_ + dz * 0.12 - 0.012, z_ + dz * 0.12 + 0.012)
    CL.glow(sh.root, 'andon', x, 0.3, z_, color='rgba(255,210,150,1)', size=0.6, day=0.0, night=0.85)
sh.tally('rooms')

# ---------------------------------------------------------------- 水屋（照舊位置大小，朝店裡的木作檯＝「茶屋的吧檯」）、東牆茶具層架、「一盞」木牌、語彤的木凳
mz = IT['mizuya'][0]; mx0, mx1 = mz['x'] - 0.4, mz['x'] + 0.4; mz0, mz1 = mz['z'] - mz['d'] / 2, mz['z'] + mz['d'] / 2; top = 0.86
xf0.rbox(sh.a('post'), mx0, mx1, 0.0, top - 0.05, mz0, mz1, r=0.0, seg=1)
for k in range(5):                                                                                                         # 朝西那一面：框格門板（直條格子）
    z = mz0 + 0.06 + k * (mz['d'] - 0.12) / 5; z2 = z + (mz['d'] - 0.12) / 5 - 0.05
    xf0.rbox(sh.a('vc'), mx0 - 0.015, mx0, 0.1, top - 0.12, z, z2, r=0.0, seg=1, col='#5a3e28')
    for j in range(4): zz_ = z + (j + 1) * (z2 - z) / 5; xf0.rbox(sh.a('vc'), mx0 - 0.02, mx0 - 0.012, 0.12, top - 0.14, zz_ - 0.006, zz_ + 0.006, r=0.0, seg=1, col=POST2)
xf0.rbox(sh.a('post'), mx0 - 0.04, mx1, top - 0.05, top, mz0 - 0.02, mz1 + 0.02, r=0.01, seg=1)
xf0.rbox(sh.a('vc'), mx0 - 0.045, mx0 + 0.02, top - 0.052, top + 0.001, mz0 - 0.02, mz1 + 0.02, r=0.0, seg=1, col='#2e1e12')   # v1d：檯面外緣磨深的那一條                            # 厚檯面（往西只多 4 cm）
xf0.rbox(sh.a('vcm'), mx0 + 0.15, mx1 - 0.12, top - 0.004, top + 0.002, mz0 + 0.3, mz0 + 0.8, r=0.0, seg=1, col='#a8a8a4')  # 流理台
Xf(mx1 - 0.15, mz0 + 0.55).cyl(sh.a('vcm'), (0, top, 0), (0, top + 0.28, 0), 0.012, col='#a8a8a4', seg=6)
C.ph_put(sh, 'vintage_electric_kettle', mz['x'], top, mz0 + 1.2, yaw=math.pi / 2, height=0.24, decimate=0.12)   # 電熱水壺（SHOP-CC0：Poly Haven 掃描；v1d 是旋轉體）
for (dz, dx, k, hh, rr_) in ((1.55, 0.18, 0, 0.2, 0.055), (1.66, 0.05, 2, 0.13, 0.04), (1.83, 0.2, 5, 0.16, 0.048), (2.05, 0.12, 6, 0.24, 0.06)):   # v1d：檯面茶罐四個大小不一、不排成一列
    tin(mz['x'] + dx, mz0 + dz, top, k, h=hh, r=rr_, face=-math.pi / 2 + (k - 3) * 0.12)
Xf(mz['x'] + 0.15, mz0 + 2.0 - 0.15, -0.3, top).rbox(sh.a('vc'), -0.09, 0.09, 0.0, 0.08, -0.06, 0.06, r=0.008, seg=1, col='#6a4a30')   # 小木盒（茶則、茶匙）
hg = Xf(mz['x'] - 0.15, mz0 + 2.3, 0, top)                                                                                  # 計時沙漏
hg.rbox(sh.a('post'), -0.05, 0.05, 0.0, 0.015, -0.05, 0.05, r=0.0, seg=1); hg.rbox(sh.a('post'), -0.05, 0.05, 0.16, 0.175, -0.05, 0.05, r=0.0, seg=1)
hg.lathe(sh.a('glass'), [(0.0, 0.015), (0.035, 0.03), (0.006, 0.0875), (0.035, 0.145), (0.0, 0.16)], 0, 0, 0, seg=10)
xf0.rbox(sh.a('vc'), mx0 - 0.04, mx0 + 0.2, top - 0.3, top + 0.003, mz0 + 2.55, mz0 + 2.8, r=0.0, seg=1, col='#efe6d0')     # 掛在檯邊的茶巾
xf0.rbox(sh.a('vc'), mx0 + 0.1, mx0 + 0.5, top, top + 0.012, mz0 + 0.95, mz0 + 1.4, r=0.0, seg=1, col='#5a3e28')            # 托盤＋茶杯
for k in range(4): teacup(mx0 + 0.2 + (k % 2) * 0.18, mz0 + 1.05 + (k // 2) * 0.2, top + 0.012)
cp = Mesh('TRACE_SQ14_catphoto', sh.M['print'])                                                                             # 豆花的舊照片（找貓支線；條件節點，名字不能改）
pxf = Xf(mz['x'] - 0.05, mz1 - 0.35, -math.pi / 2 + 0.25, top)
pxf.quad(cp, [(-0.07, 0.0, 0.0), (0.07, 0.0, 0.0), (0.07, 0.17, -0.03), (-0.07, 0.17, -0.03)], uv=K.cell_uv(0, 2, 2, 2)); cp.finish(sh.root, uv=False)
pxf.rbox(sh.a('post'), -0.08, 0.08, 0.0, 0.012, -0.05, 0.0, r=0.0, seg=1)
rs = random.Random(1172)
for y in (1.35, 1.75):                                                                                                     # 東牆上的茶具層架（v1d，H：每格不同、尺寸和位置都打散、有空位）
    xf0.rbox(sh.a('post'), X1 - 0.3, X1 - 0.01, y - 0.03, y, mz0 + 0.1, mz1 - 0.1, r=0.0, seg=1)
    z = mz0 + 0.2 + rs.uniform(0.0, 0.1)
    while z < mz1 - 0.25:
        q = rs.random(); xo = X1 - 0.15 + rs.uniform(-0.05, 0.05); sc = rs.uniform(0.75, 1.35)
        if q < 0.1: z += rs.uniform(0.15, 0.3); continue
        if q < 0.28: teapot(xo, z, y, col=rs.choice(('#3a2418', '#6a4a30', '#2a2a2c', '#8a5a3a')), r=0.06 * sc); z += 0.16 * sc
        elif q < 0.45: tin(xo, z, y, rs.randint(0, 7), h=0.16 * sc, r=0.045 * rs.uniform(0.8, 1.2), face=-math.pi / 2 + rs.uniform(-0.4, 0.4)); z += 0.11 * sc
        elif q < 0.6:
            for j in range(rs.randint(2, 5)): teacup(xo + rs.uniform(-0.008, 0.008), z, y + j * 0.04, col=rs.choice(('#e8e2d4', '#c8b898', '#8a9aa4', '#3a3a3a')))   # 疊起來的茶碗
            z += 0.1
        elif q < 0.72: Xf(xo, z, rs.uniform(-0.4, 0.4), y).rbox(sh.a('vc'), -0.07 * sc, 0.07 * sc, 0.0, 0.1 * sc, -0.09 * sc, 0.09 * sc, r=0.006, seg=1, col=rs.choice(('#6a4a30', '#8a6a3a', '#4a3222'))); z += 0.2 * sc   # 木盒
        elif q < 0.84: K.jar(sh, xo, z, y, h=0.18 * sc, r=0.06 * sc, col=rs.choice(('#c8b898', '#8a9aa4', '#5a6a5a')), lid='#5a3e28'); z += 0.14 * sc
        else:                                                                                                       # 斜靠著的茶筅、茶杓
            Xf(xo, z, 0, y).lathe(sh.a('vc'), [(0.0, 0.0), (0.025, 0.0), (0.03, 0.06), (0.012, 0.11), (0.0, 0.115)], 0, 0, 0, seg=8, col='#d8c8a0')
            Xf(xo, z + 0.05).cyl(sh.a('vc'), (0, y, 0), (0.0, y + 0.2, 0.06), 0.006, col='#b89868', seg=4); z += 0.12
        z += rs.uniform(0.03, 0.12)
for (dz, aid, h_, yw) in ((0.5, 'wicker_basket_02', 0.15, 1.75), (1.45, 'wicker_basket_01', 0.12, 1.45), (2.6, 'wicker_basket_02', 0.12, 1.3)): C.ph_put(sh, aid, X1 - 0.17, 2.12, mz0 + dz, yaw=yw, s=h_ / (0.15 if aid == 'wicker_basket_02' else 0.12), height=0.15 if aid == 'wicker_basket_02' else 0.12, decimate=0.06)   # 藤籃三個大小不一（SHOP-CC0：Poly Haven 掃描；v1d 是倒角方塊）
xf0.rbox(sh.a('post'), X1 - 0.3, X1 - 0.01, 2.09, 2.12, mz0 + 0.1, mz1 - 0.1, r=0.0, seg=1)
pq = IT['plaque'][0]; sh.img_quad(sh.w('right', 'print'), Xf(X1 - 0.04, pq['along'], -math.pi / 2, 0.0), 0.0, pq['y'] - pq['h'] / 2, 0.0, pq['w'], pq['h'], K.cell_uv(0, 0, 1, 2))   # v1d：字面朝室內、放在兩根柱子中間
xf0.rbox(sh.w('right', 'post'), X1 - 0.035, X1 - 0.005, pq['y'] - pq['h'] / 2 - 0.03, pq['y'] + pq['h'] / 2 + 0.03, pq['along'] - pq['w'] / 2 - 0.03, pq['along'] + pq['w'] / 2 + 0.03, r=0.0, seg=1)
st = IT['stool_round'][0]; sxf = Xf(st['x'], st['z'])                                                                       # 語彤的木凳（座面 0.45）
sxf.lathe(sh.a('post'), [(0.0, 0.42), (0.17, 0.42), (0.18, 0.45), (0.0, 0.46)], 0, 0, 0, seg=14)
for k in range(3): a = k * 2.094; sxf.cyl(sh.a('post'), (math.cos(a) * 0.16, 0.0, math.sin(a) * 0.16), (math.cos(a) * 0.11, 0.42, math.sin(a) * 0.11), 0.02, seg=5)
sh.tally('mizuya')

# ---------------------------------------------------------------- 吊燈、植物、角落的甕
for (x, z_) in ((-2.3, 1.7), (-0.9, 1.7), (1.4, 1.7)): lantern(x, z_, 1.92)
C.ph_put(sh, 'antique_ceramic_vase_01', -1.8, 0.0, 4.55, yaw=0.7, height=0.54, decimate=0.15, recolor=('#3a2a1e', '#a88a64'), tag='_earth')   # 青花改成土色（保留釉面的明暗紋理）：日式茶屋   # 緣側入口邊的大甕（SHOP-CC0：Poly Haven 掃描的陶甕；v1d 是旋轉體）
flowers(-1.8, 4.55, 0.42, col='#f4f0e6')
sh.plant(3.85, 4.55, h=1.0, r=0.3, pot_col='#6a5a44', y0=0.0)
sh.tally('decor')
C.used()
info = sh.finish(OUT, keep=lambda ob: 'ceiling' in ob.name or ob.name.startswith('TRACE_'), extra_info={'layout': LAY['version'], 'zone': 'wz_teahouse'})
