"""木曜日 Mokuyōbi 室內（老公寓二樓）→ GLB（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/mokuyobi_interior.py [-- --out assets/models/env/second_ai/aa_support/mokuyobi.glb]
配置只寫在 src/data/mokuyobi_layout.js，這裡讀同一份。參考圖 docs/story_planning/ref_images/wz_cafes/mokuyobi_ref_v2.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py mok（mok_print.png：海報、唱片封面、菜單、窗景、地毯；mok_bookrows.png：書背）。
日系復古老宅：胡桃木家具、奶油白牆、暖黃吊燈（波浪邊乳白玻璃）、書櫃、黑膠唱片機；磨石子地板＋地毯（D112：不用深色木地板）。安靜、可以念書。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402

arg = K.args()
LAY = K.layout('src/data/mokuyobi_layout.js', 'MOKUYOBI_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('mok_', 'mokuyobi_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=618)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books'}
P = 'mok_'
sh.M.update({
    'floor': L.pbr(P + 'floor_terrazzo', 'terrazzo_tiles', tile=1.5, target='#ddd2bd', normal=0.3, maps=('diff', 'nor'), res=512, rough_value=0.4),
    'wall': CL.soft_plaster(P + 'wall_cream', '#efe6d3', 0.9, tile=1.6, k=0.3),
    'walnut': L.pbr(P + 'walnut', 'walnut_veneer', tile=1.0, target='#5e3e29', maps=('diff',), res=256, rough_value=0.48),
    'glass': L.flat(P + 'glass', '#dfe6e6', rough=0.05, alpha=0.16),
    'shade': L.flat(P + 'milkglass', '#f6e7c8', rough=0.35, emit=B.srgb('#ffd9a0')),
    'ceil': L.flat(P + 'ceiling', '#f1e9d6', rough=0.92, cull=True),
    'print': K.img_mat(P + 'print', 'mok_print.png', rough=0.8),
    'books': K.img_mat(P + 'books', 'mok_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['bulb'] = sh.M['shade']   # 燈泡和燈罩同一個發光材質（少一個材質）
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
WAL = '#5e3e29'; GREEN = '#3f5a46'; xf0 = Xf(0, 0)
SW = LAY['stairWell']

# ---------------------------------------------------------------- 地板（樓梯開口空著）、天花板、木樑
fl = Mesh(P + 'floor', sh.M['floor'], tile=1.5)
fl.box(X0, X1, -0.02, 0.0, Z0, SW['z0']); fl.box(SW['x1'], X1, -0.02, 0.0, SW['z0'], Z1); fl.box(SW['x0'], SW['x1'], -0.02, 0.0, SW['z0'], SW['z0'] + 1.0); fl.finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=False)
for zz in (-3.4, 1.2, 5.2): xf0.rbox(sh.a('walnut'), X0, X1, H - 0.2, H, zz - 0.09, zz + 0.09, r=0.012)
for (rx, rz, rw, rd_) in ((0.5, 1.3, 2.6, 3.6), (2.9, -5.5, 2.6, 2.0)):                                                 # 地毯
    m = sh.a('print'); xf0.quad(m, [(rx - rw / 2, 0.006, rz + rd_ / 2), (rx + rw / 2, 0.006, rz + rd_ / 2), (rx + rw / 2, 0.006, rz - rd_ / 2), (rx - rw / 2, 0.006, rz - rd_ / 2)], uv=K.cell_uv(0, 4, 4, 2))

# ---------------------------------------------------------------- 牆：臨街一排木框窗、樓梯間隔間牆
fr = LAY['front']
sh.wall_with_openings('front', [(a, b, fr['sill'], fr['head'], 'win') for a, b in fr['windows']], 'wall', 'wall', 0.0, 'walnut', mull=0.9)
for a, b in fr['windows']:
    sh.wall_box('front', 'walnut', a, b, 2.1, 2.15, -0.12, 0.0)                                                         # 氣窗的橫櫺
    xf0.rbox(sh.w('front', 'walnut'), a - 0.05, b + 0.05, fr['sill'] - 0.04, fr['sill'], Z1 - 0.22, Z1, r=0.008)        # 窗台板
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
for side, (a0, a1) in (('back', (X0, X1)), ('left', (Z0, Z1)), ('right', (Z0, Z1)), ('front', (SW['x1'], fr['windows'][0][0]))):
    sh.wall_box(side, 'walnut', a0, a1, 0.0, 0.1, -0.015, 0.0)                                                          # 踢腳板
# 樓梯間：x＝−3.0 的隔間牆（z 3.6～7.0）、z＝3.6 的隔間牆（店門開口）——併在 WALL_front（鏡頭在臨街那一側時一起淡出）
fw = sh.w('front', 'wall'); dw = SW['door']; d0, d1 = dw['x'] - dw['w'] / 2, dw['x'] + dw['w'] / 2
fw.box(SW['x1'], SW['x1'] + 0.1, 0.0, H, SW['z0'], Z1)
fw.box(SW['x0'], d0, 0.0, H, SW['z0'] - 0.1, SW['z0']); fw.box(d1, SW['x1'] + 0.1, 0.0, H, SW['z0'] - 0.1, SW['z0']); fw.box(d0, d1, dw['h'], H, SW['z0'] - 0.1, SW['z0'])
fwal = sh.w('front', 'walnut')
for (a, b) in ((d0 - 0.06, d0), (d1, d1 + 0.06)): xf0.rbox(fwal, a, b, 0.0, dw['h'] + 0.06, SW['z0'] - 0.14, SW['z0'] + 0.03, r=0.006)
xf0.rbox(fwal, d0 - 0.06, d1 + 0.06, dw['h'], dw['h'] + 0.07, SW['z0'] - 0.14, SW['z0'] + 0.03, r=0.006)
xf0.rbox(fwal, SW['x1'] + 0.1, SW['x1'] + 0.115, 0.0, 0.1, SW['z0'], Z1, r=0.003); xf0.rbox(fwal, SW['x0'], d0 - 0.06, 0.0, 0.1, SW['z0'], SW['z0'] + 0.015, r=0.003)
dl = Xf(d1 - 0.03, SW['z0'] + 0.47, math.pi / 2)                                                                       # 打開的店門（往樓梯間那一側，靠著隔間牆）：胡桃木框＋玻璃
for (a, b, c, e) in ((-0.45, 0.45, 0.0, 0.1), (-0.45, 0.45, 1.95, 2.05), (-0.45, -0.37, 0.0, 2.05), (0.37, 0.45, 0.0, 2.05), (-0.45, 0.45, 0.85, 0.95)):
    dl.rbox(fwal, a, b, c, e, -0.02, 0.02, r=0.006)
dl.quad(sh.w('front', 'glass'), [(-0.37, 0.95, 0.0), (0.37, 0.95, 0.0), (0.37, 1.95, 0.0), (-0.37, 1.95, 0.0)])
dl.cyl(sh.w('front', 'vcm'), (0.3, 1.0, 0.02), (0.3, 1.0, 0.07), 0.018, col='#a8884a', seg=8)
Xf(d1 - 0.12, SW['z0'] + 0.06, 0, dw['h'] - 0.16).lathe(sh.w('front', 'vcm'), [(0.0, 0.0), (0.035, 0.0), (0.03, 0.04), (0.012, 0.07), (0.0, 0.075)], 0, 0, 0, seg=12, col='#b8944a')   # 門鈴
for k, (c, z_) in enumerate(((6, 4.6), (7, 5.6))):                                                                     # 隔間牆上的兩個小相框（面向店內）
    sh.img_quad(sh.w('front', 'print'), Xf(SW['x1'] + 0.12, z_, math.pi / 2), 0, 1.45, 0.0, 0.32, 0.32, K.cell_uv(c, 1))
    Xf(SW['x1'] + 0.11, z_, math.pi / 2).rbox(fwal, -0.19, 0.19, 1.41, 1.81, -0.012, 0.0, r=0.004)
# 窗外的老樹（窗景卡，離窗 2 m；併在 WALL_front）
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['print'])
xf0.quad(vw, [(X1 + 1.5, -1.6, vz), (X0 - 1.5, -1.6, vz), (X0 - 1.5, 4.4, vz), (X1 + 1.5, 4.4, vz)][::-1], uv=K.cell_uv(4, 2, 4, 2))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
# 紗簾（奶油白、有波浪；窗的兩端和中間各一組）＋窗簾桿
cur = sh.w('front', 'vc')
def curtain(a, b, z, y0=0.62, y1=2.62, folds=6):
    bm = bmesh.new(); nx = folds * 4; rows = []
    for j, y in enumerate((y0, (y0 + y1) / 2, y1)):
        rows.append([bm.verts.new(g2b(a + (b - a) * i / nx, y, z - 0.03 - 0.035 * (1 + math.sin(i / nx * folds * 2 * math.pi)))) for i in range(nx + 1)])
    for A_, B_ in zip(rows, rows[1:]):
        for i in range(nx): bm.faces.new((A_[i], A_[i + 1], B_[i + 1], B_[i]))
    bm.normal_update(); K.paint_bm(bm, '#efe6d2'); cur.add_bm(bm); bm.free()
wa, wb = fr['windows'][0]
for (a, b) in ((wa - 0.15, wa + 0.45), (wb - 0.45, wb + 0.15), (0.55, 1.05)): curtain(a, b, Z1 - 0.12)
xf0.cyl(sh.w('front', 'vcm'), (wa - 0.25, 2.68, Z1 - 0.1), (wb + 0.25, 2.68, Z1 - 0.1), 0.012, col='#6a5a3a', seg=8)

# ---------------------------------------------------------------- 西牆的胡桃木大書櫃
bc = IT['bookcase'][0]; bxf = Xf(bc['x'], bc['z'], bc['ry']); bw, bd, bh = bc['w'], bc['d'], bc['h']; wm = sh.a('walnut')
bxf.rbox(wm, -bw / 2, bw / 2, 0.0, bh, -bd / 2, -bd / 2 + 0.02, r=0.004)                     # 背板
ndiv = 4
for k in range(ndiv + 1): u = -bw / 2 + k * bw / ndiv; bxf.rbox(wm, u - 0.02, u + 0.02, 0.0, bh, -bd / 2, bd / 2, r=0.006)
bxf.rbox(wm, -bw / 2 - 0.03, bw / 2 + 0.03, bh, bh + 0.06, -bd / 2, bd / 2 + 0.03, r=0.012)   # 頂板（線板）
bxf.rbox(wm, -bw / 2, bw / 2, 0.0, 0.1, -bd / 2, bd / 2 - 0.02, r=0.006)
lev = [0.1 + k * 0.385 for k in range(6)]
rng = random.Random(618)
for y in lev: bxf.rbox(wm, -bw / 2, bw / 2, y, y + 0.025, -bd / 2, bd / 2, r=0.005)
for k in range(ndiv):
    u0, u1 = -bw / 2 + k * bw / ndiv + 0.02, -bw / 2 + (k + 1) * bw / ndiv - 0.02
    for j, y in enumerate(lev):
        if (k, j) == (1, 3):   # 擺東西的一格：小時鐘、黑膠唱片、一盆植物
            Xf(*bxf.p((u0 + u1) / 2 - 0.15, 0, 0.0)[::2], bc['ry']).lathe(sh.a('vcg'), [(0.0, 0.0), (0.05, 0.0), (0.05, 0.02), (0.0, 0.02)], 0, y + 0.025, 0, seg=12, col='#8a6a3a')
            cxf = Xf(*bxf.p((u0 + u1) / 2 - 0.15, 0, 0.05)[::2], bc['ry'])
            cxf.lathe(sh.a('vcg'), [(0.0, -0.02), (0.08, -0.02), (0.085, 0.0), (0.08, 0.02), (0.0, 0.02)], 0, 0, 0, seg=16, col='#b8944a')
            sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, 0.0), (0.075, 0.0), (0.075, 0.004), (0.0, 0.004)], seg=16), '#f4eedf'), cxf.M(0, y + 0.13, 0.025) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
            sh.plant(*bxf.p((u0 + u1) / 2 + 0.2, 0, 0.0)[::2], h=0.3, r=0.07, pot_col='#e8dcc0', y0=y + 0.025)
            continue
        if (k, j) == (3, 1):   # 平放的一疊書＋相框
            for q in range(5): bxf.rbox(sh.a('vcg'), u0 + 0.05, u0 + 0.3, y + 0.025 + q * 0.035, y + 0.06 + q * 0.035, -0.12, 0.12, r=0.004, col=rng.choice(['#7b2d26', '#2f4a3a', '#e8e0cc', '#1f2e45', '#c9b48a']))
            K.book_rows(sh, 'books', bxf, u0 + 0.4, u1, y + 0.025, bd / 2 - 0.04, hgt=0.3, depth=0.22, rng=rng); continue
        K.book_rows(sh, 'books', bxf, u0, u1, y + 0.025, bd / 2 - 0.04, hgt=0.3, depth=0.22, rng=rng)
for (zz, n) in ((bc['z'] - 1.3, 9), (bc['z'] + 0.9, 8)): sh.hanging_pothos('pothos', bc['x'] + 0.05, bh + 0.1, zz, n=n, drop=0.9)   # 書櫃上垂下來的黃金葛
for zz in (bc['z'] - 1.3, bc['z'] + 0.9): Xf(bc['x'], zz, 0, bh + 0.06).lathe(sh.a('vcg'), [(0.06, 0.0), (0.1, 0.05), (0.11, 0.13), (0.1, 0.13)], 0, 0, 0, seg=14, col='#b0653e')

# ---------------------------------------------------------------- 唱片櫃＋黑膠唱片機
rc = IT['record_cabinet'][0]; rxf = Xf(rc['x'], rc['z'], rc['ry']); rw, rd, rh = rc['w'], rc['d'], rc['h']
rxf.rbox(wm, -rw / 2, rw / 2, 0.14, rh, -rd / 2, rd / 2, r=0.015)
for sx in (-rw / 2 + 0.06, rw / 2 - 0.06):
    for sz in (-rd / 2 + 0.06, rd / 2 - 0.06): rxf.cyl(wm, (sx, 0.0, sz), (sx, 0.15, sz), 0.018, seg=8, r2=0.026)
for k in range(3):
    u = -rw / 2 + 0.03 + k * (rw - 0.06) / 3
    rxf.rbox(sh.a('vc'), u + 0.01, u + (rw - 0.06) / 3 - 0.01, 0.18, rh - 0.05, rd / 2, rd / 2 + 0.012, r=0.004, col='#6a4630')
    rxf.cyl(sh.a('vcm'), (u + (rw - 0.06) / 6, 0.62, rd / 2 + 0.012), (u + (rw - 0.06) / 6, 0.62, rd / 2 + 0.035), 0.012, col='#b8944a', seg=8)
tp = Xf(*rxf.p(-0.3, 0, 0.0)[::2], rc['ry'] + 0.1, rh)                                                                   # 唱片機
tp.rbox(sh.a('vc'), -0.23, 0.23, 0.0, 0.09, -0.18, 0.18, r=0.012, col='#4a3424')
tp.lathe(sh.a('vcg'), [(0.0, 0.09), (0.15, 0.09), (0.15, 0.105), (0.0, 0.105)], -0.04, 0, 0, seg=24, col='#1b1b1b')
tp.lathe(sh.a('vcg'), [(0.0, 0.105), (0.04, 0.105), (0.04, 0.107), (0.0, 0.107)], -0.04, 0, 0, seg=12, col='#c9563f')
tp.cyl(sh.a('vcm'), (0.17, 0.1, -0.12), (0.17, 0.14, -0.12), 0.015, col='#b9bdc0', seg=8); tp.cyl(sh.a('vcm'), (0.17, 0.14, -0.12), (0.02, 0.115, 0.06), 0.005, col='#b9bdc0', seg=5)
tp.quad(sh.a('glass'), [(-0.23, 0.09, -0.18), (0.23, 0.09, -0.18), (0.23, 0.42, -0.24), (-0.23, 0.42, -0.24)])           # 掀開的防塵蓋
cr = Xf(*rxf.p(0.4, 0, 0.0)[::2], rc['ry'] - 0.05, rh)                                                                   # 一箱唱片
cr.rbox(sh.a('walnut'), -0.17, 0.17, 0.0, 0.2, -0.17, 0.17, r=0.008)
for k in range(9):
    zz = -0.13 + k * 0.03; c = (4 + k % 4, 0)
    sh.img_quad(sh.a('print'), cr, 0, 0.02, zz, 0.31, 0.31, K.cell_uv(*c), tilt=-0.05 - 0.02 * k)
K.table_lamp(sh, *rxf.p(0.0, 0, 0.12)[::2], y=rh, r=0.12)

# ---------------------------------------------------------------- 小吧檯（老闆）：直條紋木作正面、淺石檯面、手沖壺、蛋糕罩、菜單
ct = IT['counter'][0]; cx0, cx1 = ct['x'] - ct['w'] / 2, ct['x'] + ct['w'] / 2; cz0, cz1 = ct['z'] - ct['d'] / 2, ct['z'] + ct['d'] / 2; chh = ct['h']
xf0.rbox(wm, cx0, cx1, 0.08, chh - 0.04, cz0, cz1 - 0.02, r=0.01)
k = cx0 + 0.04
while k < cx1 - 0.04: xf0.rbox(sh.a('vc'), k, k + 0.035, 0.1, chh - 0.08, cz1 - 0.02, cz1 + 0.008, r=0.006, col='#6a4630'); k += 0.06   # 直條紋
xf0.rbox(sh.a('vc'), cx0 + 0.02, cx1 - 0.02, 0.0, 0.08, cz0 + 0.02, cz1 - 0.04, r=0.004, col='#3a2a1e')
xf0.rbox(sh.a('vcg'), cx0 - 0.03, cx1 + 0.03, chh - 0.045, chh, cz0 - 0.02, cz1 + 0.05, r=0.012, col='#e6dfd0')
top = chh
Xf(cx1 - 0.45, ct['z'], 0, top).lathe(sh.a('walnut'), [(0.0, 0.0), (0.16, 0.0), (0.16, 0.025), (0.0, 0.025)], 0, 0, 0, seg=20)   # 蛋糕罩（木盤＋玻璃罩）
Xf(cx1 - 0.45, ct['z'], 0, top + 0.025).lathe(sh.a('vcg'), [(0.0, 0.0), (0.1, 0.0), (0.1, 0.06), (0.0, 0.06)], 0, 0, 0, seg=16, col='#d9a64a')
Xf(cx1 - 0.45, ct['z'], 0, top + 0.025).lathe(sh.a('glass'), [(0.15, 0.0), (0.15, 0.16), (0.12, 0.22), (0.03, 0.25), (0.015, 0.29), (0.0, 0.3)], 0, 0, 0, seg=20)
kt = Xf(ct['x'] - 0.6, ct['z'] - 0.1, 0.4, top)                                                                        # 細嘴手沖壺、濾杯架
kt.lathe(sh.a('vcm'), [(0.0, 0.0), (0.07, 0.0), (0.075, 0.1), (0.06, 0.14), (0.03, 0.16), (0.0, 0.17)], 0, 0, 0, seg=16, col='#c9ccce')
kt.cyl(sh.a('vcm'), (0.06, 0.04, 0.0), (0.2, 0.17, 0.0), 0.007, col='#c9ccce', seg=6); kt.cyl(sh.a('vcm'), (-0.07, 0.04, 0.0), (-0.1, 0.13, 0.0), 0.008, col='#3a2a1e', seg=5)
fs = Xf(ct['x'] - 0.15, ct['z'] - 0.05, 0, top)
fs.rbox(sh.a('walnut'), -0.06, 0.06, 0.0, 0.02, -0.06, 0.06, r=0.005); fs.cyl(sh.a('vcm'), (0, 0.02, 0), (0, 0.2, 0), 0.008, col='#3a3a3a', seg=6)
fs.lathe(sh.a('vcg'), [(0.02, 0.2), (0.06, 0.26), (0.065, 0.27)], 0, 0, 0, seg=14, col='#f2efe8'); K.glass_cup(sh, ct['x'] - 0.15, ct['z'] - 0.05, top + 0.02, h=0.12, r=0.05, fill='#6a4630')
mn = Xf(ct['x'] + 0.4, cz1 - 0.12, -0.15)
sh.img_quad(sh.a('print'), mn, 0, top + 0.01, 0, 0.3, 0.15, K.cell_uv(4, 1, 2, 1), tilt=0.25); mn.rbox(sh.a('walnut'), -0.17, 0.17, top, top + 0.02, -0.06, 0.02, r=0.005)
nc = Xf(ct['x'] + 0.9, cz1 - 0.1, 0.2)
sh.img_quad(sh.a('print'), nc, 0, top + 0.005, 0, 0.1, 0.1, K.cell_uv(2, 3), tilt=0.3)
for q in range(3): K.mug(sh, cx0 + 0.2 + q * 0.1, ct['z'] - 0.12, top, col=('#f2efe8', '#c9b48a', '#f2efe8')[q])
sh.plant(cx0 + 0.25, ct['z'] + 0.1, h=0.3, r=0.07, pot_col='#b0653e', y0=top)
bk_ = (ct['x'], -6.8)                                                                                                    # 後面的工作櫃＋牆上層板（杯子、罐子）
xf0.rbox(wm, cx0, cx1, 0.06, 0.9, Z0, Z0 + 0.4, r=0.01); xf0.rbox(sh.a('vcg'), cx0 - 0.01, cx1 + 0.01, 0.9, 0.93, Z0, Z0 + 0.42, r=0.008, col='#e6dfd0')
for k in range(4): u = cx0 + 0.05 + k * (ct['w'] - 0.1) / 4; xf0.rbox(sh.a('vc'), u + 0.015, u + (ct['w'] - 0.1) / 4 - 0.015, 0.1, 0.86, Z0 + 0.4, Z0 + 0.41, r=0.004, col='#6a4630')
K.jar(sh, cx0 + 0.3, Z0 + 0.2, 0.93, h=0.2, r=0.06, col='#c9a26a', lid='#3a2a1e'); K.jar(sh, cx0 + 0.5, Z0 + 0.2, 0.93, h=0.16, r=0.05, col='#e8dcc0', lid='#3a2a1e')
xf0.rbox(sh.a('vcm'), ct['x'] + 0.4, ct['x'] + 0.75, 0.93, 1.3, Z0 + 0.05, Z0 + 0.35, r=0.03, col='#8a8e90')            # 小冰箱上的磨豆機（電動）
for j, yy in enumerate((1.45, 1.85)):
    xf0.rbox(sh.w('back', 'walnut'), cx0 + 0.1, cx1 - 0.1, yy, yy + 0.03, Z0, Z0 + 0.22, r=0.006)
    u = cx0 + 0.2; rnd = random.Random(j)
    while u < cx1 - 0.2:
        if rnd.random() < 0.6: K.mug(sh, u, Z0 + 0.12, yy + 0.03, col=rnd.choice(['#f2efe8', '#c9b48a', '#8a6a4a', '#e8dcc0']))
        else: K.jar(sh, u, Z0 + 0.11, yy + 0.03, h=0.14, r=0.045, col=rnd.choice(['#c9a26a', '#e8dcc0', '#6a4630']), lid='#3a2a1e')
        u += rnd.uniform(0.13, 0.18)
for s_ in LAY['seats']:
    if s_['table'] == 8: K.stool(sh, s_['x'], s_['z'], h=0.7, seat=WAL, metal='#2a2a2a')

# ---------------------------------------------------------------- 桌子、曲木椅、每張桌子一盞小檯燈
tabs = {}
for s_ in LAY['seats']:
    if s_['table'] <= 6: tabs.setdefault(s_['table'], []).append(s_)
for t, ss in sorted(tabs.items()):
    tx = sum(s_['x'] for s_ in ss) / 2; tz = sum(s_['z'] for s_ in ss) / 2
    if t in (1, 2, 5): K.round_table(sh, tx, tz, r=0.34, h=0.74, top_key='walnut', base_col='#2a2622', base='claw')
    else: K.rect_table(sh, tx, tz, 0.0, 0.66, 0.66, h=0.74, top_key='walnut', leg_key='walnut', leg='wood')
    for s_ in ss:
        ox = math.sin(s_['yaw']) * -0.05; oz = math.cos(s_['yaw']) * -0.05
        K.bentwood_chair(sh, s_['x'] + ox, s_['z'] + oz, s_['yaw'], key='walnut')
    lx, lz = (tx + 0.18, tz - 0.18) if t not in (1, 2) else (tx, tz + 0.2)
    K.table_lamp(sh, lx, lz, y=0.74, r=0.09)
# 生活痕跡：窗邊那桌（布丁、巴斯克、拿鐵、小花瓶）、念書的桌子（攤開的書、筆記本、鉛筆、水）
t1 = (-0.9, 6.15)
K.plate(sh, t1[0] - 0.12, t1[1] - 0.1, 0.74, r=0.09); Xf(t1[0] - 0.12, t1[1] - 0.1, 0, 0.75).lathe(sh.a('vcg'), [(0.0, 0.0), (0.045, 0.0), (0.04, 0.05), (0.032, 0.06), (0.0, 0.062)], 0, 0, 0, seg=14, col='#e3b05a')
Xf(t1[0] - 0.12, t1[1] - 0.1, 0, 0.81).lathe(sh.a('vcg'), [(0.0, 0.0), (0.032, 0.0), (0.0, 0.006)], 0, 0, 0, seg=10, col='#6a3a1a')
K.plate(sh, t1[0] + 0.12, t1[1] - 0.05, 0.74, r=0.09); Xf(t1[0] + 0.12, t1[1] - 0.05, 0.6, 0.75).rbox(sh.a('vcg'), -0.05, 0.05, 0.0, 0.05, -0.04, 0.04, r=0.008, col='#e8cf96')
K.mug(sh, t1[0] + 0.05, t1[1] + 0.05, 0.74, col='#e8e0cc', r=0.045, h=0.07)
Xf(t1[0] - 0.05, t1[1] + 0.18, 0, 0.74).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.05), (0.015, 0.1)], 0, 0, 0, seg=10)
rr = random.Random(9)
for j in range(7):
    a = rr.uniform(0, 6.28); r_ = rr.uniform(0.01, 0.06); fy = 0.84 + rr.uniform(0.03, 0.1)
    Xf(t1[0] - 0.05, t1[1] + 0.18).cyl(sh.a('vc'), (0, 0.82, 0), (math.cos(a) * r_, fy, math.sin(a) * r_), 0.0015, col='#6a8a4a', seg=3)
    sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.006), (0.01, -0.003), (0.011, 0.0), (0.0, 0.003)], seg=5), '#f6f2e6'), Matrix.Translation(g2b(t1[0] - 0.05 + math.cos(a) * r_, fy, t1[1] + 0.18 + math.sin(a) * r_)))
def open_book(x, z, ry, y=0.74, col='#f4efe2'):
    bxf_ = Xf(x, z, ry, y)
    for sgn in (-1, 1):
        bm = bmesh.new(); rows = []
        for i in range(5):
            t = i / 4; px = sgn * t * 0.15; py = 0.012 + 0.018 * math.sin(t * math.pi * 0.9) * (1 - t * 0.3)
            rows.append([bm.verts.new(g2b(*bxf_.p(px, py, zz))) for zz in (-0.105, 0.105)])
        for A_, B_ in zip(rows, rows[1:]): f = bm.faces.new((A_[0], B_[0], B_[1], A_[1]) if sgn > 0 else (A_[0], A_[1], B_[1], B_[0]))
        bm.normal_update(); K.paint_bm(bm, col); sh.a('vc').add_bm(bm); bm.free()
    bxf_.rbox(sh.a('vc'), -0.155, 0.155, 0.0, 0.012, -0.11, 0.11, r=0.003, col='#2f4a3a')
for (x, z, ry) in ((-3.05, 1.1, 0.1), (-2.95, -1.55, 0.2), (3.55, 1.9, -0.1)):
    open_book(x, z, ry)
    Xf(x + 0.22, z + 0.05, 0.3, 0.74).rbox(sh.a('vc'), -0.07, 0.07, 0.0, 0.008, -0.1, 0.1, r=0.002, col='#f4efe2')       # 筆記本
    Xf(x + 0.22, z + 0.05, 1.1, 0.748).cyl(sh.a('vc'), (-0.07, 0.004, 0), (0.07, 0.004, 0), 0.004, col='#d9a441', seg=6)  # 鉛筆
    K.glass_cup(sh, x - 0.2, z - 0.15, 0.74, h=0.1, r=0.033, fill='#dfe6e6')
cg = Xf(0.5 + 0.55 + 0.05, 2.6, -math.pi / 2)                                                                             # 椅背上的針織外套
cg.rbox(sh.a('vc'), -0.2, 0.2, 0.55, 0.86, -0.25, -0.17, r=0.03, col='#c9b48a'); cg.rbox(sh.a('vc'), -0.12, 0.12, 0.35, 0.6, -0.26, -0.2, r=0.03, col='#c9b48a')

# ---------------------------------------------------------------- 沙發區（L 形墨綠沙發、單人沙發、矮桌、立燈、半高書櫃）
def sofa_run(x0, x1, z0, z1, face, seats_n):
    """沙發的一段：胡桃木腳的底座、坐墊（seats_n 塊）、靠背靠在牆那一側；face＝坐的人面向（'+z' 或 '-x'）"""
    vg = sh.a('vcg')
    xf0.rbox(wm, x0, x1, 0.08, 0.3, z0, z1, r=0.02)
    for (px, pz) in ((x0 + 0.06, z0 + 0.06), (x1 - 0.06, z0 + 0.06), (x0 + 0.06, z1 - 0.06), (x1 - 0.06, z1 - 0.06)): xf0.cyl(wm, (px, 0.0, pz), (px, 0.09, pz), 0.02, seg=8, r2=0.028)
    if face == '+z':
        sl = (x1 - x0) / seats_n
        for k in range(seats_n): xf0.rbox(vg, x0 + k * sl + 0.01, x0 + (k + 1) * sl - 0.01, 0.3, 0.44, z0 + 0.2, z1, r=0.05, seg=3, col=GREEN)
        for k in range(seats_n): xf0.rbox(vg, x0 + k * sl + 0.02, x0 + (k + 1) * sl - 0.02, 0.36, 0.82, z0, z0 + 0.22, r=0.06, seg=3, col=GREEN)
    else:
        sl = (z1 - z0) / seats_n
        for k in range(seats_n): xf0.rbox(vg, x0, x1 - 0.2, 0.3, 0.44, z0 + k * sl + 0.01, z0 + (k + 1) * sl - 0.01, r=0.05, seg=3, col=GREEN)
        for k in range(seats_n): xf0.rbox(vg, x1 - 0.22, x1, 0.36, 0.82, z0 + k * sl + 0.02, z0 + (k + 1) * sl - 0.02, r=0.06, seg=3, col=GREEN)
sofa_run(1.6, 4.4, Z0, Z0 + 0.76, '+z', 3)
sofa_run(X1 - 0.76, X1, Z0 + 0.76, Z0 + 2.2, '-x', 2)
xf0.rbox(sh.a('vcg'), 1.48, 1.62, 0.3, 0.6, Z0 + 0.02, Z0 + 0.74, r=0.05, col=GREEN)                                     # 扶手
xf0.rbox(sh.a('vcg'), X1 - 0.74, X1 - 0.02, 0.3, 0.6, Z0 + 2.2, Z0 + 2.34, r=0.05, col=GREEN)
ac = Xf(2.9, -4.55, math.pi)                                                                                            # 單人沙發（背對半高書櫃）
ac.rbox(wm, -0.38, 0.38, 0.08, 0.28, -0.36, 0.36, r=0.02); ac.rbox(sh.a('vcg'), -0.3, 0.3, 0.28, 0.43, -0.28, 0.34, r=0.05, seg=3, col='#8a4a3a')
ac.rbox(sh.a('vcg'), -0.34, 0.34, 0.33, 0.82, -0.38, -0.2, r=0.06, seg=3, col='#8a4a3a')
for sx in (-0.37, 0.37): ac.rbox(sh.a('vcg'), sx - 0.06, sx + 0.06, 0.28, 0.6, -0.36, 0.34, r=0.04, col='#8a4a3a')
for (sx, sz) in ((-0.32, -0.3), (0.32, -0.3), (-0.32, 0.3), (0.32, 0.3)): ac.cyl(wm, (sx, 0.0, sz), (sx, 0.09, sz), 0.018, seg=8, r2=0.025)
ctb = IT['coffee_table'][0]
K.rect_table(sh, ctb['x'], ctb['z'], 0.0, ctb['w'], ctb['d'], h=ctb['h'], top_key='walnut', leg_key='walnut', leg='wood')
K.table_lamp(sh, ctb['x'] + 0.3, ctb['z'] - 0.1, y=ctb['h'], r=0.09)
K.mug(sh, ctb['x'] - 0.2, ctb['z'] + 0.1, ctb['h'], col='#e8e0cc'); K.mug(sh, ctb['x'] - 0.05, ctb['z'] - 0.12, ctb['h'], col='#c9b48a')
for q in range(3): Xf(ctb['x'] + 0.05, ctb['z'] + 0.12, 0.2 * q, ctb['h'] + 0.02 * q).rbox(sh.a('vcg'), -0.1, 0.1, 0.0, 0.02, -0.14, 0.14, r=0.003, col=('#2f4a3a', '#e8e0cc', '#8c3b47')[q])
fl_ = Xf(1.55, Z0 + 0.5)                                                                                                # 立燈
fl_.lathe(sh.a('vcm'), [(0.0, 0.0), (0.14, 0.0), (0.14, 0.02), (0.02, 0.04), (0.0, 0.04)], 0, 0, 0, seg=16, col='#8a6a3a')
fl_.cyl(sh.a('vcm'), (0, 0.04, 0), (0, 1.45, 0), 0.012, col='#8a6a3a', seg=8)
fl_.lathe(sh.a('shade'), [(0.12, 1.38), (0.19, 1.38), (0.15, 1.62), (0.09, 1.62)], 0, 0, 0, seg=18)
CL.glow(sh.root, 'floorlamp', 1.55, 1.5, Z0 + 0.5, color='rgba(255,200,130,1)', size=0.6, day=0.0, night=0.8)
hb = IT['half_bookcase'][0]; hxf = Xf(hb['x'], hb['z'], 0.0); hw, hd, hh = hb['w'], hb['d'], hb['h']
hxf.rbox(wm, -hw / 2, hw / 2, 0.0, hh, -hd / 2, -hd / 2 + 0.02, r=0.004)
for u in (-hw / 2, 0.0, hw / 2): hxf.rbox(wm, u - 0.02, u + 0.02, 0.0, hh, -hd / 2, hd / 2, r=0.006)
hxf.rbox(wm, -hw / 2 - 0.02, hw / 2 + 0.02, hh, hh + 0.04, -hd / 2, hd / 2 + 0.02, r=0.01)
for y in (0.05, 0.45, 0.88):
    hxf.rbox(wm, -hw / 2, hw / 2, y, y + 0.025, -hd / 2, hd / 2, r=0.005)
    for (a, b) in ((-hw / 2 + 0.03, -0.03), (0.03, hw / 2 - 0.03)): K.book_rows(sh, 'books', hxf, a, b, y + 0.025, hd / 2 - 0.03, hgt=0.3, depth=0.2, rng=rng)
sh.plant(hb['x'] + 0.6, hb['z'], h=0.35, r=0.08, pot_col='#e8dcc0', y0=hh + 0.04)

# ---------------------------------------------------------------- 東牆的兩張電影海報（胡桃木框）
for p_, cell in zip(IT['poster'], ((0, 0, 2, 3), (2, 0, 2, 3))):
    sh.wall_img('right', 'print', p_['z'], p_['y'], p_['w'], p_['h'], K.cell_uv(*cell), off=0.03)
    Xf(0, 0).rbox(sh.w('right', 'walnut'), X1 - 0.025, X1, p_['y'] - p_['h'] / 2 - 0.04, p_['y'] + p_['h'] / 2 + 0.04, p_['z'] - p_['w'] / 2 - 0.04, p_['z'] + p_['w'] / 2 + 0.04, r=0.005)

# ---------------------------------------------------------------- 吊燈（波浪邊乳白玻璃）、植物
for (x, z) in ((-0.9, 6.0), (2.4, 6.0), (0.5, 2.6), (-3.0, 1.3), (-3.0, -1.3), (3.6, 2.2), (-3.5, -5.5), (-2.3, -5.5), (2.9, -5.5)):
    K.dome_pendant(sh, x, z, 2.05 if z > -5 else 2.15, r=0.19 if z > -5 else 0.14, kind='scallop', glow_size=0.55)
sh.plant(4.05, 6.45, h=1.3, r=0.24, pot_col='#b0653e')
for (x, c) in ((-2.3, '#e8dcc0'), (4.0, '#b0653e')): sh.plant(x, Z1 - 0.12, h=0.3, r=0.07, pot_col=c, y0=fr['sill'])
sh.plant(-0.9 + 0.0, Z0 + 0.35, h=0.9, r=0.18, pot_col='#e8dcc0')

# ---------------------------------------------------------------- 多一點「有人在用」的東西：東牆的矮櫃、唱片櫃上方的小畫、門邊的衣帽架、書櫃旁的大盆栽、地上的一疊書
sb = Xf(X1 - 0.24, -1.0, -math.pi / 2)
sb.rbox(wm, -1.0, 1.0, 0.16, 0.78, -0.22, 0.22, r=0.015)
for sx in (-0.92, 0.92):
    for sz in (-0.16, 0.16): sb.cyl(wm, (sx, 0.0, sz), (sx, 0.17, sz), 0.016, seg=8, r2=0.024)
for k in range(4):
    u = -0.97 + k * 0.485; sb.rbox(sh.a('vc'), u + 0.01, u + 0.475, 0.2, 0.74, 0.22, 0.232, r=0.004, col='#6a4630')
    sb.cyl(sh.a('vcm'), (u + 0.24, 0.62, 0.232), (u + 0.24, 0.62, 0.25), 0.011, col='#b8944a', seg=8)
for q in range(4): sb.rbox(sh.a('vcg'), -0.75, -0.45, 0.78 + q * 0.03, 0.805 + q * 0.03, -0.12, 0.12, r=0.003, col=('#e8e0cc', '#2f4a3a', '#8c3b47', '#c9b48a')[q])
sh.plant(*sb.p(0.55, 0, 0.0)[::2], h=0.5, r=0.1, pot_col='#e8dcc0', y0=0.78)
K.table_lamp(sh, *sb.p(-0.1, 0, -0.05)[::2], y=0.78, r=0.1)
sh.wall_img('left', 'print', -2.8, 1.75, 0.5, 0.5, K.cell_uv(4, 0), off=0.03)
Xf(0, 0).rbox(sh.w('left', 'walnut'), X0, X0 + 0.025, 1.75 - 0.29, 1.75 + 0.29, -2.8 - 0.29, -2.8 + 0.29, r=0.004)
cr_ = Xf(-2.75, 3.25)                                                                                                    # 衣帽架（掛一把雨傘、一件外套）
cr_.lathe(sh.a('walnut'), [(0.0, 0.0), (0.2, 0.0), (0.2, 0.03), (0.04, 0.05), (0.0, 0.05)], 0, 0, 0, seg=16)
cr_.cyl(sh.a('walnut'), (0, 0.05, 0), (0, 1.75, 0), 0.02, seg=8)
for k in range(4): a = k * math.pi / 2 + 0.4; cr_.cyl(sh.a('walnut'), (0, 1.6, 0), (math.cos(a) * 0.14, 1.72, math.sin(a) * 0.14), 0.01, seg=5)
cr_.rbox(sh.a('vc'), -0.17, 0.05, 0.85, 1.6, -0.08, 0.1, r=0.04, col='#3a4a5a')
cr_.cyl(sh.a('vc'), (0.15, 0.05, 0.05), (0.13, 0.95, 0.12), 0.025, col='#2a2a2a', seg=8, r2=0.012)
sh.plant(-4.1, 3.1, h=1.2, r=0.22, pot_col='#b0653e')
for q in range(6): Xf(-4.2, -1.62, 0.15 * q).rbox(sh.a('vcg'), -0.12, 0.12, q * 0.04, q * 0.04 + 0.038, -0.16, 0.16, r=0.004, col=('#e8e0cc', '#7b2d26', '#1f2e45', '#c9b48a', '#2f4a3a', '#f2efe6')[q])

info = sh.finish(OUT, keep=lambda ob: 'VIEW' in ob.name, extra_info={'layout': LAY['version'], 'seats': len(LAY['seats'])})
