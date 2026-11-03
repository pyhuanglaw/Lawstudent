"""日常失速 DAILY OFFBEAT 室內 → GLB（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/daily_offbeat_interior.py [-- --out assets/models/env/second_ai/aa_support/daily_offbeat.glb]
配置（家具位置、座位、互動點、導航阻擋）只寫在 src/data/daily_offbeat_layout.js，這裡讀同一份。參考圖 docs/story_planning/ref_images/wz_cafes/daily_offbeat_ref_v2.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py dof（dof_checker.png、dof_print.png）。
90 年代復古混搭：綠白格紋地磚、奶油黃牆、橄欖綠磁磚、橘紅點綴；開放吧檯、八人長桌、顏色不一的殼椅、吊燈、植物、軟木公告板。不是讀書的地方。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402

arg = K.args()
LAY = K.layout('src/data/daily_offbeat_layout.js', 'DAILY_OFFBEAT_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('dof_', 'daily_offbeat_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=617)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print'}
P = 'dof_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_checker', 'dof_checker.png', rough=0.32, tile=0.6),
    'wall': CL.soft_plaster(P + 'wall_cream', '#f0e1b6', 0.88, tile=1.6, k=0.25),
    'tile': L.pbr(P + 'tile_olive', 'long_white_tiles', tile=0.9, target='#5f8058', normal=0.6, maps=('diff', 'nor'), res=256, rough_value=0.25),
    'wood': L.pbr(P + 'wood_light', 'walnut_veneer', tile=1.2, target='#c39a6c', maps=('diff',), res=256, rough_value=0.45),
    'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.16),
    'bulb': L.flat(P + 'bulb', '#fff4dc', rough=0.3, emit=B.srgb('#ffdcaa')),
    'ceil': L.flat(P + 'ceiling', '#f3ead2', rough=0.92, cull=True),
    'print': K.img_mat(P + 'print', 'dof_print.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
ORANGE, OLIVE, CREAM, MUSTARD, TEAL, RED = '#d9673a', '#7d8f52', '#e8dcc0', '#d9a441', '#4f7f7a', '#c4513e'
CHAIRS = [ORANGE, ORANGE, OLIVE, ORANGE, CREAM, MUSTARD, ORANGE, TEAL, RED, ORANGE, OLIVE, CREAM]
_ci = [0]
def ccol(): c = CHAIRS[_ci[0] % len(CHAIRS)]; _ci[0] += 1; return c


def uvbox(m, xf, x0, x1, y0, y1, z0, z1, front, top, side):
    """五個面（沒有底）的盒子，每一面自己的 UV（桌遊盒：盒蓋、側面條紋）"""
    xf.quad(m, [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], uv=front)
    xf.quad(m, [(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], uv=side)
    xf.quad(m, [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], uv=top)
    xf.quad(m, [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], uv=side)
    xf.quad(m, [(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], uv=side)


# ---------------------------------------------------------------- 地板、天花板、牆
Mesh(P + 'floor', sh.M['floor'], tile=0.6).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['ceil']); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=False)
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
front_ops = [(dx - dw / 2, dx + dw / 2, 0.0, dh, 'door')] + [(a, b, fr['sill'], fr['head'], 'win') for a, b in fr['windows']]
sh.wall_with_openings('front', front_ops, 'tile', 'wall', fr['sill'], 'wood')
sr = LAY['side']['right']
sh.wall_with_openings('right', [(a, b, sr['sill'], sr['head'], 'win') for a, b in sr['windows']], 'tile', 'wall', sr['sill'], 'wood')
sh.wall_box('left', 'tile', Z0, Z1, 0.0, 0.95); sh.wall_box('left', 'wall', Z0, Z1, 0.95, H)
sh.wall_box('back', 'tile', X0, -0.4, 0.0, 1.55); sh.wall_box('back', 'wall', X0, -0.4, 1.55, H)
sh.wall_box('back', 'tile', -0.4, X1, 0.0, 0.95); sh.wall_box('back', 'wall', -0.4, X1, 0.95, H)
for side, (a0, a1, yt) in (('left', (Z0, Z1, 0.95)), ('back', (-0.4, X1, 0.95)), ('back', (X0, -0.4, 1.55))):   # 磁磚上緣的木收邊
    sh.wall_box(side, 'wood', a0, a1, yt - 0.02, yt + 0.03, -0.025, 0.0)
for side, (a0, a1) in (('front', (X0, dx - dw / 2)), ('right', (Z0, sr['windows'][0][0]))):
    sh.wall_box(side, 'wood', a0, a1, 0.93, 0.98, -0.025, 0.0)
# 門把（玻璃門的長黃銅把手）
dxf = sh.wall_xf('front', dx + 0.38, 0.0)
dxf.cyl(sh.w('front', 'vcm'), (0, 0.8, 0.05), (0, 1.5, 0.05), 0.014, col='#a8884a', seg=8)
for yy in (0.85, 1.45): dxf.cyl(sh.w('front', 'vcm'), (0, yy, 0.0), (0, yy, 0.05), 0.01, col='#a8884a', seg=6)

# ---------------------------------------------------------------- 吧檯（正面綠磁磚、淺木檯面）
bf = IT['bar_front'][0]; bx0, bx1 = bf['x'] - bf['w'] / 2, bf['x'] + bf['w'] / 2; bz0, bz1 = bf['z'] - bf['d'] / 2, bf['z'] + bf['d'] / 2
xf0 = Xf(0, 0)
sh.a('tile').box(bx0, bx1, 0.1, bf['h'] - 0.04, bz0 + 0.04, bz1)
xf0.rbox(sh.a('vc'), bx0, bx1, 0.0, 0.1, bz0 + 0.06, bz1 - 0.04, r=0.01, col='#3c4a36')                          # 踢腳（內縮）
xf0.rbox(sh.a('wood'), bx0 - 0.03, bx1 + 0.03, bf['h'] - 0.045, bf['h'], bz0 - 0.02, bz1 + 0.05, r=0.012)       # 檯面
xf0.rbox(sh.a('wood'), bx0, bx1, 0.86, 0.9, bz0 - 0.15, bz0 + 0.04, r=0.008)                                   # 裡面的工作檯（低一階）
xf0.cyl(sh.a('vcm'), (bx0 + 0.1, 0.2, bz1 + 0.16), (bx1 - 0.1, 0.2, bz1 + 0.16), 0.022, col='#a8884a', seg=10)    # 腳踏桿
for xx in (bx0 + 0.3, (bx0 + bx1) / 2, bx1 - 0.3): xf0.cyl(sh.a('vcm'), (xx, 0.2, bz1 + 0.16), (xx, 0.2, bz1), 0.012, col='#a8884a', seg=6)
xf0.rbox(sh.a('vc'), bx1 - 0.01, bx1 + 0.02, 0.1, bf['h'] - 0.04, bz0 + 0.04, bz1, r=0.005, col='#c8a074')      # 吧檯東端收邊
# 檯面上：蛋糕玻璃櫃、收銀機、杯子、小黑板、小盆栽
cx, cz, top = bx1 - 0.65, bf['z'] + 0.02, bf['h']
xf0.rbox(sh.a('wood'), cx - 0.4, cx + 0.4, top, top + 0.05, cz - 0.22, cz + 0.22, r=0.01)
g = sh.a('glass'); gx0, gx1, gy0, gy1, gz0, gz1 = cx - 0.38, cx + 0.38, top + 0.05, top + 0.42, cz - 0.2, cz + 0.2
for pts in ([(gx0, gy0, gz1), (gx1, gy0, gz1), (gx1, gy1, gz1), (gx0, gy1, gz1)], [(gx0, gy1, gz0), (gx1, gy1, gz0), (gx1, gy1, gz1), (gx0, gy1, gz1)],
            [(gx0, gy0, gz0), (gx0, gy0, gz1), (gx0, gy1, gz1), (gx0, gy1, gz0)], [(gx1, gy0, gz1), (gx1, gy0, gz0), (gx1, gy1, gz0), (gx1, gy1, gz1)]): g.quad(pts)
for (ox, col) in ((-0.22, '#d8b07a'), (0.0, '#f0e6d0'), (0.22, '#8a5a3a')):
    K.plate(sh, cx + ox, cz, top + 0.06, r=0.09)
    Xf(cx + ox, cz, 0, top + 0.07).lathe(sh.a('vcg'), [(0.0, 0.0), (0.065, 0.0), (0.07, 0.03), (0.06, 0.06), (0.0, 0.065)], 0, 0, 0, seg=12, col=col)   # 肉桂捲、乳酪蛋糕、布朗尼
rx = bf['x'] + 1.2
xf0.rbox(sh.a('vcg'), rx - 0.17, rx + 0.17, top, top + 0.07, cz - 0.16, cz + 0.12, r=0.015, col='#2f3330')        # 收銀機（平板＋底座）
Xf(rx, cz - 0.02, math.pi).rbox(sh.a('vcg'), -0.13, 0.13, top + 0.07, top + 0.27, -0.01, 0.01, r=0.006, col='#1c1d1e')
for k in range(4): K.mug(sh, bx0 + 0.35 + (k % 2) * 0.11, cz - 0.1 + (k // 2) * 0.11, top, col=('#f2efe8', '#e8875a')[k % 2])
ex = Xf(bf['x'] - 0.3, bz1 - 0.12, 0.25)                                                                           # 「今日推薦」小黑板立牌
sh.img_quad(sh.a('print'), ex, 0, top + 0.02, 0, 0.48, 0.24, K.cell_uv(0, 4, 2, 1), tilt=0.22)
ex.rbox(sh.a('wood'), -0.26, 0.26, top, top + 0.025, -0.08, 0.04, r=0.006)
sh.plant(bx0 + 0.25, cz + 0.05, h=0.35, r=0.07, pot_col='#e8dcc0', y0=top)

# ---------------------------------------------------------------- 後面的工作檯、咖啡機、磨豆機、層板、黑板菜單
bb = IT['bar_back'][0]; kx0, kx1 = bb['x'] - bb['w'] / 2, bb['x'] + bb['w'] / 2; kz0, kz1 = bb['z'] - bb['d'] / 2, bb['z'] + bb['d'] / 2; kt = bb['h']
xf0.rbox(sh.a('wood'), kx0, kx1, 0.08, kt - 0.04, kz0, kz1 - 0.02, r=0.01)
xf0.rbox(sh.a('vc'), kx0 + 0.02, kx1 - 0.02, 0.0, 0.08, kz0, kz1 - 0.06, r=0.005, col='#3c4a36')
for k in range(6):
    u = kx0 + 0.05 + k * (bb['w'] - 0.1) / 6
    xf0.rbox(sh.a('vc'), u + 0.02, u + (bb['w'] - 0.1) / 6 - 0.02, 0.14, kt - 0.1, kz1 - 0.025, kz1 - 0.015, r=0.004, col='#b48a5e')   # 櫃門
    xf0.cyl(sh.a('vcm'), (u + 0.35, 0.72, kz1 - 0.01), (u + 0.35, 0.72, kz1 + 0.02), 0.008, col='#a8884a', seg=6)
xf0.rbox(sh.a('vcg'), kx0 - 0.01, kx1 + 0.01, kt - 0.04, kt, kz0, kz1 + 0.02, r=0.01, col='#e4ddcd')                 # 檯面（淺色人造石）
mx = -3.55                                                                                                          # 義式咖啡機（兩孔）
mxf = Xf(mx, kz0 + 0.3, math.pi)
mxf.rbox(sh.a('vcm'), -0.36, 0.36, kt, kt + 0.42, -0.22, 0.2, r=0.04, col='#c9ccce')
mxf.rbox(sh.a('vcg'), -0.34, 0.34, kt + 0.16, kt + 0.36, 0.19, 0.215, r=0.01, col='#2f5a3c')                          # 綠色面板
mxf.rbox(sh.a('vcm'), -0.38, 0.38, kt + 0.42, kt + 0.46, -0.22, 0.2, r=0.015, col='#9a9ea2')                          # 溫杯盤
for sx in (-0.17, 0.17):
    mxf.cyl(sh.a('vcm'), (sx, kt + 0.2, 0.2), (sx, kt + 0.2, 0.27), 0.04, col='#a4a8ab', seg=12)
    mxf.cyl(sh.a('vcm'), (sx, kt + 0.16, 0.27), (sx, kt + 0.16, 0.36), 0.012, col='#2a2a2a', seg=6)                    # 把手
    K.mug(sh, mx - sx, kz0 + 0.3 - 0.27, kt + 0.06, col='#f2efe8', r=0.03, h=0.06)
mxf.cyl(sh.a('vcm'), (0.3, kt + 0.32, 0.2), (0.33, kt + 0.08, 0.3), 0.006, col='#b9bdc0', seg=5)                      # 蒸氣管
for k in range(3): Xf(mx + 0.05 + (k - 1) * 0.18, kz0 + 0.35, 0, kt + 0.46).lathe(sh.a('vcg'), [(0.0, 0.0), (0.04, 0.0), (0.045, 0.08), (0.0, 0.08)], 0, 0, 0, seg=10, col='#f2efe8')
for gx in (-4.55, -2.75):                                                                                           # 磨豆機
    gxf = Xf(gx, kz0 + 0.25, math.pi)
    gxf.rbox(sh.a('vcm'), -0.1, 0.1, kt, kt + 0.32, -0.12, 0.12, r=0.025, col=('#2c2c2c' if gx < -4 else '#c4513e'))
    gxf.lathe(sh.a('vcg'), [(0.03, kt + 0.32), (0.085, kt + 0.46), (0.09, kt + 0.5), (0.0, kt + 0.52)], 0, 0, 0, seg=14, col='#5a3a24')   # 豆槽（咖啡豆）
    gxf.rbox(sh.a('vcm'), -0.05, 0.05, kt + 0.08, kt + 0.12, 0.12, 0.2, r=0.01, col='#2c2c2c')
K.jar(sh, -1.4, kz0 + 0.3, kt, h=0.22, r=0.07, col='#e8dcc0', lid='#7d8f52'); K.jar(sh, -1.2, kz0 + 0.25, kt, h=0.18, r=0.06, col='#c9a26a', lid='#2c2c2c')
K.glass_cup(sh, -0.95, kz0 + 0.3, kt, h=0.25, r=0.06, fill='#e8d090')                                                  # 檸檬水的大玻璃罐
for (a0, a1) in ((X0 + 0.15, -4.25), (-1.75, -0.6)):                                                                # 後牆的兩段開放層板
    for j, yy in enumerate((1.6, 2.0)):
        sxf = sh.wall_xf('back', 0.0)
        Xf(0, 0).rbox(sh.w('back', 'wood'), a0, a1, yy, yy + 0.03, Z0, Z0 + 0.24, r=0.006)
        for u in (a0 + 0.08, a1 - 0.08): Xf(0, 0).rbox(sh.w('back', 'vcm'), u - 0.01, u + 0.01, yy - 0.12, yy, Z0, Z0 + 0.18, r=0.003, col='#2a2a2a')
        u = a0 + 0.08; rnd = random.Random(int(a0 * 10 + j))
        while u < a1 - 0.1:
            k = rnd.random()
            if k < 0.4: K.bottle(sh, u, Z0 + 0.12, yy + 0.03, h=rnd.uniform(0.2, 0.3), r=0.03, col=rnd.choice(['#5a6a3a', '#7a4a2a', '#2f4a3a', '#c9a26a']))
            elif k < 0.75: K.jar(sh, u, Z0 + 0.12, yy + 0.03, h=rnd.uniform(0.1, 0.18), r=0.045, col=rnd.choice(['#e8dcc0', '#c9a26a', '#d9673a', '#f2efe8']))
            else: K.mug(sh, u, Z0 + 0.12, yy + 0.03, col=rnd.choice(['#f2efe8', '#7d8f52', '#e8875a']), handle=False)
            u += rnd.uniform(0.11, 0.17)
for (px_, yy) in ((X0 + 0.5, 2.03), (-1.0, 2.03)): sh.hanging_pothos('pothos', px_, yy, Z0 + 0.14, n=7, drop=0.55)
mb = IT['menu_board'][0]
sh.wall_img('back', 'print', mb['x'], mb['y'], mb['w'], mb['h'], K.cell_uv(0, 0, 4, 2), off=0.03)
Xf(0, 0).rbox(sh.w('back', 'wood'), mb['x'] - mb['w'] / 2 - 0.05, mb['x'] + mb['w'] / 2 + 0.05, mb['y'] - mb['h'] / 2 - 0.05, mb['y'] + mb['h'] / 2 + 0.05, Z0, Z0 + 0.025, r=0.006)

# ---------------------------------------------------------------- 吧檯高腳椅
for s_ in LAY['seats']:
    if s_['table'] == 2: K.stool(sh, s_['x'], s_['z'], h=0.72, seat=ORANGE if s_['x'] < -3 else OLIVE, metal='#2c2c2c')

# ---------------------------------------------------------------- 桌遊櫃（格子櫃＋盒子）
gs = IT['game_shelf'][0]; gxf = Xf(gs['x'], gs['z'] + gs['d'] / 2 - 0.21, 0.0); gw, gh, gd = gs['w'], gs['h'], gs['d']
for k in range(5): u = -gw / 2 + k * gw / 4; gxf.rbox(sh.a('wood'), u - 0.012, u + 0.012, 0.0, gh, -gd / 2, gd / 2, r=0.004)
for k in range(5): y = k * (gh - 0.02) / 4; gxf.rbox(sh.a('wood'), -gw / 2, gw / 2, y, y + 0.022, -gd / 2, gd / 2, r=0.004)
gxf.rbox(sh.a('vc'), -gw / 2, gw / 2, 0.0, gh, -gd / 2, -gd / 2 + 0.01, r=0.002, col='#a88660')
rnd = random.Random(5)
for c in range(4):
    for r in range(4):
        u0 = -gw / 2 + c * gw / 4 + 0.04; y = r * (gh - 0.02) / 4 + 0.022; n = rnd.randint(2, 4); k0 = rnd.randrange(4)
        for j in range(n):
            g_ = (k0 + j) % 4; bw = rnd.uniform(0.26, 0.3); bh = rnd.uniform(0.06, 0.08)
            if y + (j + 1) * bh > y + 0.35: break
            uvbox(sh.a('print'), gxf, u0 + rnd.uniform(0, 0.25), u0 + bw + rnd.uniform(0, 0.25), y + j * bh, y + (j + 1) * bh - 0.004, -0.17, 0.14,
                  K.cell_uv(4 + g_, 3), K.cell_uv(g_, 3), K.cell_uv(4 + g_, 3))
sh.wall_img('back', 'print', 2.1, 2.45, 0.9, 0.9, K.cell_uv(4, 4, 2, 2), off=0.02)                                  # 唱片行海報
Xf(0, 0).rbox(sh.w('back', 'wood'), 2.1 - 0.48, 2.1 + 0.48, 2.45 - 0.48, 2.45 + 0.48, Z0, Z0 + 0.016, r=0.004)
sh.wall_img('back', 'print', 4.4, 1.85, 1.0, 1.5, K.cell_uv(4, 0, 2, 3), off=0.02)                                  # 首都帝大海報
Xf(0, 0).rbox(sh.w('back', 'vcm'), 4.4 - 0.53, 4.4 + 0.53, 1.85 - 0.78, 1.85 + 0.78, Z0, Z0 + 0.016, r=0.004, col='#3f5a46')
sh.wall_img('right', 'print', -4.4, 1.7, 0.75, 0.75, K.cell_uv(6, 4, 2, 2), off=0.02)                               # 溫州街散步地圖（東牆北段）
Xf(0, 0).rbox(sh.w('right', 'wood'), X1 - 0.016, X1, 1.7 - 0.41, 1.7 + 0.41, -4.4 - 0.41, -4.4 + 0.41, r=0.004)

# ---------------------------------------------------------------- 八人長桌
lt = IT['long_table'][0]
K.rect_table(sh, lt['x'], lt['z'], 0.0, lt['w'], lt['d'], h=0.75, top_key='wood', leg_key='vcm', leg_col='#2a2a2a', leg='steel')
for s_ in LAY['seats']:
    if s_['table'] == 1: K.shell_chair(sh, s_['x'], s_['z'] + (-0.05 if s_['yaw'] == 0 else 0.05), s_['yaw'], ccol())
lxf = Xf(lt['x'], lt['z'])
uvbox(sh.a('print'), Xf(lt['x'] - 0.9, lt['z'] - 0.05, 0.3), -0.15, 0.15, 0.75, 0.82, -0.15, 0.15, K.cell_uv(4, 3), K.cell_uv(0, 3), K.cell_uv(4, 3))   # 桌遊盒
uvbox(sh.a('print'), Xf(lt['x'] + 0.55, lt['z'] + 0.08, -0.5), -0.14, 0.14, 0.75, 0.8, -0.14, 0.14, K.cell_uv(5, 3), K.cell_uv(1, 3), K.cell_uv(5, 3))
for k in range(9):                                                                                                  # 攤開的卡牌
    a = k * 0.35; cx_, cz_ = lt['x'] - 0.25 + math.cos(a) * 0.12 * (k % 3), lt['z'] + math.sin(a) * 0.08
    Xf(cx_, cz_, a).rbox(sh.a('vc'), -0.032, 0.032, 0.751, 0.754, -0.045, 0.045, r=0.001, col=('#f6f0e0', '#d24b3e', '#3d7a8c')[k % 3])
for (ox, oz) in ((-1.35, 0.0), (1.2, 0.05)):                                                                          # 小花瓶（玻璃瓶＋白色小花）
    vx, vz = lt['x'] + ox, lt['z'] + oz
    Xf(vx, vz, 0, 0.75).lathe(sh.a('glass'), [(0.0, 0.0), (0.04, 0.0), (0.045, 0.06), (0.02, 0.14), (0.022, 0.16)], 0, 0, 0, seg=12)
    rr = random.Random(int(ox * 10))
    for j in range(9):
        a = rr.uniform(0, 6.28); r_ = rr.uniform(0.01, 0.07); fy = 0.75 + 0.16 + rr.uniform(0.04, 0.14)
        Xf(vx, vz).cyl(sh.a('vc'), (0, 0.75 + 0.1, 0), (math.cos(a) * r_, fy, math.sin(a) * r_), 0.002, col='#6a8a4a', seg=3)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.008), (0.015, -0.004), (0.016, 0.0), (0.0, 0.004)], seg=6), '#f6f2e6'), Matrix.Translation(g2b(vx + math.cos(a) * r_, fy, vz + math.sin(a) * r_)))
for (ox, oz, kind) in ((-0.55, -0.25, 'latte'), (0.3, 0.28, 'lemon'), (0.9, -0.22, 'mug')):                           # 喝到一半的飲料
    if kind == 'mug': K.mug(sh, lt['x'] + ox, lt['z'] + oz, 0.75, col='#e8875a')
    else: K.glass_cup(sh, lt['x'] + ox, lt['z'] + oz, 0.75, fill='#c9a27a' if kind == 'latte' else '#8a5a2a')
K.plate(sh, lt['x'] - 0.1, lt['z'] + 0.25, 0.75, r=0.1)

# 貓「店長」的椅子：空的殼椅＋圓坐墊；椅背貼一張「店長　請勿打擾」
cc = IT['cat_chair'][0]
K.shell_chair(sh, cc['x'], cc['z'], cc['ry'], ORANGE)
Xf(cc['x'], cc['z'], cc['ry'], 0.47).lathe(sh.a('vc'), [(0.0, 0.0), (0.16, 0.0), (0.18, 0.025), (0.17, 0.05), (0.12, 0.06), (0.0, 0.045)], 0, 0, 0.02, seg=18, col='#e9dcc4')
nxf = Xf(cc['x'], cc['z'], cc['ry'] + math.pi)
sh.img_quad(sh.a('print'), nxf, 0, 0.66, 0.258, 0.16, 0.16, K.cell_uv(0, 2), tilt=-0.12)

# ---------------------------------------------------------------- 西牆卡座＋軟木公告板
bq = IT['banquette'][0]; qz0, qz1 = bq['z'] - bq['d'] / 2, bq['z'] + bq['d'] / 2; qx0 = X0; qx1 = X0 + bq['w']
xf0.rbox(sh.a('wood'), qx0, qx1, 0.0, 0.4, qz0, qz1, r=0.015)
xf0.rbox(sh.a('vc'), qx0 + 0.02, qx1 + 0.005, 0.0, 0.07, qz0 + 0.02, qz1 - 0.02, r=0.006, col='#3c4a36')
nseg = 3; sl = (qz1 - qz0) / nseg
for k in range(nseg):
    a0, a1 = qz0 + k * sl + 0.015, qz0 + (k + 1) * sl - 0.015
    xf0.rbox(sh.a('vcg'), qx0 + 0.14, qx1 + 0.02, 0.4, 0.49, a0, a1, r=0.035, seg=3, col='#3f5f46')                   # 坐墊（墨綠皮面）
    bk = L.rbox_bm(0.12, 0.5, a1 - a0, 0.04, 3); K.paint_bm(bk, '#3f5f46')
    sh.a('vcg').add_bm(bk, Matrix.Translation(g2b(qx0 + 0.09, 0.76, (a0 + a1) / 2)) @ Matrix.Rotation(-0.12, 4, 'Y')); bk.free()   # 靠背（往後仰）
cb = IT['corkboard'][0]
sh.wall_img('left', 'print', cb['z'], cb['y'], cb['w'], cb['h'], K.cell_uv(2, 4, 2, 2), off=0.02)
Xf(0, 0).rbox(sh.w('left', 'wood'), X0, X0 + 0.03, cb['y'] - cb['h'] / 2 - 0.04, cb['y'] + cb['h'] / 2 + 0.04, cb['z'] - cb['w'] / 2 - 0.04, cb['z'] + cb['w'] / 2 + 0.04, r=0.006)
rnd = random.Random(485); flyers = [(6, 0), (7, 0), (6, 1), (7, 1), (6, 2), (7, 2), (6, 3), (7, 3)]
for k, (c, r) in enumerate(flyers):
    zc = cb['z'] - cb['w'] / 2 + 0.3 + k * (cb['w'] - 0.6) / 7 + rnd.uniform(-0.06, 0.06); yc = cb['y'] + (0.16 if k % 2 else -0.14) + rnd.uniform(-0.05, 0.05)
    sh.wall_img('left', 'print', zc, yc, 0.34, 0.34, K.cell_uv(c, r), off=0.034 + k * 0.0006)
for k in range(5):                                                                                                  # 便利貼
    zc = cb['z'] - 1.7 + k * 0.85 + rnd.uniform(-0.1, 0.1); yc = cb['y'] + rnd.choice((-0.38, 0.38))
    q = (k % 4); u0, v0, u1, v1 = K.cell_uv(1, 2); hu, hv = (u1 - u0) / 2, (v1 - v0) / 2; uu = (u0 + (q % 2) * hu, v1 - (q // 2 + 1) * hv, u0 + (q % 2 + 1) * hu, v1 - (q // 2) * hv)
    sh.wall_img('left', 'print', zc, yc, 0.09, 0.09, uu, off=0.04)
for s_ in LAY['seats']:
    if s_['table'] in (3, 4, 5) and s_['yaw'] < 0: K.shell_chair(sh, s_['x'] + 0.05, s_['z'], s_['yaw'], ccol())
for t in (3, 4, 5):
    tz = [s_['z'] for s_ in LAY['seats'] if s_['table'] == t][0]
    K.rect_table(sh, -4.45, tz, 0.0, 0.6, 0.6, h=0.75, top_key='wood', leg_key='vcm', leg_col='#2a2a2a')
K.mug(sh, -4.5, -1.25, 0.75, col='#f2efe8'); K.plate(sh, -4.4, 0.15, 0.75, r=0.1); K.glass_cup(sh, -4.35, 1.45, 0.75, fill='#8a5a2a')
Xf(-4.48, 0.2, 0, 0.76).lathe(sh.a('vcg'), [(0.0, 0.0), (0.07, 0.0), (0.075, 0.03), (0.0, 0.035)], 0, 0, 0, seg=12, col='#e9c46a')   # 明太子厚片（盤子上）

# ---------------------------------------------------------------- 窗邊雙人桌（前窗、側窗、轉角）
tabs = {}
for s_ in LAY['seats']:
    if s_['table'] >= 6: tabs.setdefault(s_['table'], []).append(s_)
for t, ss in sorted(tabs.items()):
    tx = sum(s_['x'] for s_ in ss) / 2; tz = sum(s_['z'] for s_ in ss) / 2
    K.round_table(sh, tx, tz, r=0.32, h=0.74, top_key='vcg', top_col='#e9e2d2', base_col='#2a2a2a')                    # 磨石子色的圓桌面
    for s_ in ss:
        ox = math.sin(s_['yaw']) * -0.04; oz = math.cos(s_['yaw']) * -0.04
        K.shell_chair(sh, s_['x'] + ox, s_['z'] + oz, s_['yaw'], ccol())
    if t in (6, 9, 12): K.glass_cup(sh, tx + 0.08, tz - 0.05, 0.74, fill='#c9a27a')
    if t in (7, 10): K.mug(sh, tx - 0.06, tz + 0.04, 0.74, col='#f2efe8'); K.plate(sh, tx + 0.1, tz - 0.08, 0.74, r=0.09)
    Xf(tx, tz, 0, 0.74).lathe(sh.a('glass'), [(0.0, 0.0), (0.025, 0.0), (0.028, 0.05), (0.012, 0.1)], 0, 0, 0, seg=10)   # 小花瓶
    Xf(tx, tz).cyl(sh.a('vc'), (0, 0.8, 0), (0.01, 0.92, 0.0), 0.003, col='#6a8a4a', seg=3)
    sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.01), (0.02, -0.004), (0.022, 0.0), (0.0, 0.006)], seg=6), MUSTARD), Matrix.Translation(g2b(tx + 0.01, 0.92, tz)))

# ---------------------------------------------------------------- 吊燈、風管
for xx in (-0.85, 0.3, 1.45): K.dome_pendant(sh, xx, lt['z'], 2.25, r=0.22, col='#6f8a5e', glow_size=0.7)
for xx in (-4.4, -2.95, -1.5): K.dome_pendant(sh, xx, bf['z'] - 0.15, 2.35, r=0.12, col='#e8dcc0', kind='cone', glow_size=0.5)
for t, ss in sorted(tabs.items()):
    tx = sum(s_['x'] for s_ in ss) / 2; tz = sum(s_['z'] for s_ in ss) / 2
    K.dome_pendant(sh, tx, tz, 2.3, r=0.15, col=('#e8875a' if t % 2 else '#e8dcc0'), glow_size=0.5)
for zz in (-1.4, 1.4): K.dome_pendant(sh, -4.45, zz * 1.0 + (0.1 if zz > 0 else 0.1), 2.2, r=0.14, col='#c4513e', glow_size=0.45)
duct = sh.a('vcm'); dz = -1.6
Xf(0, 0).cyl(duct, (X0 + 0.3, H - 0.32, dz), (X1 - 0.3, H - 0.32, dz), 0.17, col='#d6d0c2', seg=16)
for xx in (-3.5, -0.5, 2.5): Xf(0, 0).cyl(duct, (xx, H, dz), (xx, H - 0.15, dz), 0.008, col='#8a8a8a', seg=4); Xf(0, 0).cyl(duct, (xx, H - 0.15, dz - 0.18), (xx, H - 0.15, dz + 0.18), 0.008, col='#8a8a8a', seg=4)
for xx in (-1.8, 1.8): Xf(xx, dz, 0, H - 0.5).rbox(duct, -0.16, 0.16, 0.0, 0.04, -0.12, 0.12, r=0.01, col='#bdb7aa')       # 出風口

# ---------------------------------------------------------------- 植物
sh.plant(-5.05, 4.45, h=1.25, r=0.24, pot_col='#b0653e'); sh.plant(4.95, -4.5, h=1.45, r=0.26, pot_col='#e8dcc0')
sh.plant(X1 - 0.25, 4.7, h=0.55, r=0.13, pot_col='#7d8f52', y0=0.0)
sh.plant(-5.1, 2.85, h=0.9, r=0.18, pot_col='#d9673a'); sh.plant(-0.25, -4.68, h=0.6, r=0.14, pot_col='#e8dcc0')                   # 卡座南端、吧檯東端
for px_ in (gs['x'] - 0.9, gs['x'] + 0.85): sh.plant(px_, gs['z'] + 0.02, h=0.32, r=0.08, pot_col=('#b0653e', '#e8dcc0')[px_ > gs['x']], y0=gs['h'])   # 桌遊櫃上的小盆栽
sh.hanging_pothos('pothos', gs['x'] + 0.85, gs['h'] + 0.15, gs['z'] + 0.12, n=6, drop=0.5)
for (px_, pz_) in ((-2.0, Z1 - 0.3), (2.0, Z1 - 0.3), (X1 - 0.3, -1.9), (X1 - 0.3, 2.2)):                           # 窗頂垂下來的黃金葛（吊盆）
    Xf(px_, pz_).cyl(sh.a('vcm'), (0, H, 0), (0, 2.75, 0), 0.003, col='#2a2a2a', seg=3)
    Xf(px_, pz_, 0, 2.6).lathe(sh.a('vcg'), [(0.05, 0.0), (0.11, 0.06), (0.12, 0.15), (0.11, 0.15)], 0, 0, 0, seg=14, col='#e8dcc0')
    sh.hanging_pothos('pothos', px_, 2.72, pz_, n=8, drop=0.7)

# ---------------------------------------------------------------- 生活痕跡：椅背掛的帆布袋、地上的背包
bxf = Xf(1.5, 1.15, math.pi)
bxf.rbox(sh.a('vc'), -0.16, 0.16, 0.35, 0.72, -0.03, 0.03, r=0.02, col='#d9cdb2')
bxf.cyl(sh.a('vc'), (-0.1, 0.72, 0.0), (-0.02, 0.86, 0.04), 0.008, col='#d9cdb2', seg=4); bxf.cyl(sh.a('vc'), (0.1, 0.72, 0.0), (0.02, 0.86, 0.04), 0.008, col='#d9cdb2', seg=4)
pk = Xf(-3.4, 1.85, 0.4)
pk.rbox(sh.a('vc'), -0.15, 0.15, 0.0, 0.42, -0.1, 0.1, r=0.06, seg=3, col='#2f4a5a'); pk.rbox(sh.a('vc'), -0.11, 0.11, 0.06, 0.24, 0.09, 0.15, r=0.04, col='#2f4a5a')

info = sh.finish(OUT, extra_info={'layout': LAY['version'], 'seats': len(LAY['seats'])})
