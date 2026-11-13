"""頁間書屋（公館店面街 G02，取代舊路書房）室內 → GLB（AA 2026-11-04；AA_647，使用者 11-04 新店名、新室內圖）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/yejian_interior.py [-- --out assets/models/env/second_ai/aa_support/yejian.glb]
配置只寫在 src/data/yejian_layout.js，這裡讀同一份。參考圖 docs/story_planning/ref_images/shops/gongguan_book_int.webp。美術規則 SCENE_RULES §10～12。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py yej（yej_print.png：分類牌、黑板菜單、書封、明信片、書堆側面）；書背用山嵐的 shl_bookrows.png、窗景用木曜日的 mok_view.png。
淺色橡木書牆（頂天、滑軌梯子）、淺色磨石子（D112）、黃銅吊燈、軌道燈、外露風管；窗邊長桌、兩張閱讀桌、咖啡吧、沙發角。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True

arg = K.args()
LAY = K.layout('src/data/yejian_layout.js', 'YEJIAN_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
sh = K.Shop('yej_', 'yejian_interior', W, D, H, texres=512, props={'layout': LAY['version']}, seed=1104)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books', 'view'}   # floor 用 Mesh(tile) 自己的 UV
P = 'yej_'
sh.M.update({
    'floor': K.img_mat(P + 'floor_terrazzo', 'yej_terrazzo.png', rough=0.35, tile=1.2),   # v2：自製磨石子（黑白小點明顯；LAWWW2）
    'wall': CL.soft_plaster(P + 'wall_cream', '#efe6d6', 0.9, cull=True, tile=1.6, k=0.25),   # 單面（天花板也用它）
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=1.2, target='#c9a072', maps=('diff',), res=256, rough_value=0.5),
    'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.14),
    'bulb': L.flat(P + 'bulb', '#fff1d6', rough=0.3, emit=B.srgb('#ffcf8a')),
    'view': K.img_mat(P + 'window_view', 'mok_view.png', rough=0.9, emit=0.22),
    'print': K.img_mat(P + 'print', 'yej_print.png', rough=0.75),
    'books': K.img_mat(P + 'books', 'mok_bookrows.png', rough=0.8),   # 深色底的書背圖（書格裡比較暗，參考圖）
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']   # 檯燈燈罩＝發光材質（少一個材質）
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件照顏色換成 ambientCG 材質組、盆栽換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
import cc0_kit   # noqa: E402
RP = random.Random(77)   # 掃描盆栽的轉向（另一個亂數，原本的書、杯子排法不變）
CK = cc0_kit.Kit(sh.root, P[:-1])
sh.M.update({
    'oakcg': CK.acg(P + 'oak_cc0', 'Wood049', target='#bf9462', tile=0.7, rough_value=0.55),
    'fab_grey': CK.acg(P + 'fabric_grey', 'Fabric030', target='#9c968c', tile=0.35, rough_value=0.9),
    'fab_linen': CK.acg(P + 'fabric_linen', 'Fabric030', target='#dacdb6', tile=0.35, rough_value=0.9),
    'fab_moss': CK.acg(P + 'fabric_moss', 'Fabric030', target='#7d8f62', tile=0.3, rough_value=0.9),
    'rug': CK.acg(P + 'rug', 'Fabric030', target='#cbbca2', tile=0.25, rough_value=0.95),
    'brass': CK.acg(P + 'brass', 'Metal009', target='#b8944a', vary=0.2, tile=0.3, metal=0.7, rough_value=0.35),
    'blackmetal': CK.acg(P + 'black_metal', 'Metal009', target='#2a2a2a', vary=0.2, tile=0.4, metal=0.4, rough_value=0.45),
    'steel': CK.acg(P + 'steel', 'Metal009', target='#cfccc4', vary=0.08, tile=0.4, metal=0.6, rough_value=0.4),
    'signboard': CK.acg(P + 'sign_board', 'Plastic006', target='#2f3a33', vary=0.03, tile=0.4, rough_value=0.55),
    'stone': CK.acg(P + 'stone_top', 'Marble012', target='#e8e2d6', vary=0.1, tile=1.2, rough_value=0.3),
    'ceramic': CK.acg(P + 'ceramic', 'Plastic006', target='#f2efe8', vary=0.05, tile=0.4, rough_value=0.2),
    'ceramic_b': CK.acg(P + 'ceramic_beige', 'Plastic006', target='#e8dcc0', vary=0.05, tile=0.4, rough_value=0.25),
})
sh.route({'#b98a58': 'oakcg', '#c79c6a': 'oakcg', '#b38a5c': 'oakcg', '#9c968c': 'fab_grey', '#d8cbb4': 'fab_linen', '#e4d9c4': 'fab_linen',
          '#7d8f62': 'fab_moss', '#cbbca2': 'rug', '#b8944a': 'brass', '#2a2a2a': 'blackmetal', '#3a3a3a': 'blackmetal', '#2f3a33': 'signboard',
          '#ece6da': 'stone', '#d9d2c4': 'stone', '#c8c8c4': 'steel', '#9a9a96': 'steel', '#d6d2c8': 'steel', '#e6e2d8': 'steel', '#bdb8ac': 'steel',
          '#f2efe8': 'ceramic', '#e8dcc0': 'ceramic_b', '#d8d0c0': 'ceramic_b', '#b8a890': 'ceramic_b'})


def _ph_plant(x, z, h=1.0, r=0.2, pot_col=None, y0=0.0, lvl='', seed=0):
    """小盆栽：Poly Haven potted_plant_04（掃描；取代 aa_kit 的花盆＋葉片卡）"""
    CK.ph_put('potted_plant_04', x, y0, z, yaw=RP.uniform(0, 6.28), share=False, height=r * 1.5 + h * 0.75, decimate=0.03)


sh.plant = _ph_plant
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
xf0 = Xf(0, 0); BRASS = '#b8944a'; R = random.Random(1104)
GEN_ROWS = [0, 1, 2, 3, 4, 5, 6]


def stack(xf, x, z, y, n, bw, bd, ry=0.0):
    """一疊平放的書（五面盒子、貼 yej_print 的書封＋書堆側面；同山嵐 stack()）"""
    m = sh.a('print'); h = 0.03 * n; y1 = y + h
    c_ = xf.p(x, 0, z); xf = Xf(c_[0], c_[2], xf.ry + ry, xf.py); x0, x1, z0, z1 = -bw / 2, bw / 2, -bd / 2, bd / 2
    k = R.randrange(16); cu = (k / 16 + 0.002, 0.5 + 0.002, (k + 1) / 16 - 0.002, 0.625 - 0.002)
    def strip(kk): return (kk / 16 + 0.003, 0.125 + 0.002, (kk + 1) / 16 - 0.003, 0.125 + 0.125 * n / 6 - 0.002)
    sp, pg = strip(R.randrange(12)), strip(12 + R.randrange(4))
    xf.quad(m, [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], uv=cu)
    xf.quad(m, [(x0, y, z1), (x1, y, z1), (x1, y1, z1), (x0, y1, z1)], uv=sp); xf.quad(m, [(x1, y, z0), (x0, y, z0), (x0, y1, z0), (x1, y1, z0)], uv=pg)
    xf.quad(m, [(x1, y, z1), (x1, y, z0), (x1, y1, z0), (x1, y1, z1)], uv=pg); xf.quad(m, [(x0, y, z0), (x0, y, z1), (x0, y1, z1), (x0, y1, z0)], uv=sp)
    return y1


def chair(x, z, yaw):
    """參考圖的橡木椅：四支腳、灰色布坐墊、兩根後柱＋彎的頂板＋一根橫檔（約 230 三角形）"""
    xf = Xf(x, z, yaw); m = sh.a('vc'); OAK = '#b98a58'
    for (sx, sz) in ((-0.2, 0.19), (0.2, 0.19), (-0.2, -0.19), (0.2, -0.19)):
        xf.cyl(m, (sx, 0.0, sz), (sx * 0.95, 0.43, sz * 0.95), 0.017, col=OAK, seg=5, caps=False)
    xf.rbox(m, -0.22, 0.22, 0.41, 0.45, -0.21, 0.21, r=0.01, seg=1, col=OAK)
    xf.rbox(m, -0.2, 0.2, 0.45, 0.5, -0.19, 0.19, r=0.025, seg=2, col='#9c968c')                                  # 布坐墊
    for sx in (-0.2, 0.2): xf.cyl(m, (sx, 0.45, -0.2), (sx * 1.02, 0.86, -0.24), 0.018, col=OAK, seg=5, caps=False)
    xf.rbox(m, -0.22, 0.22, 0.72, 0.86, -0.255, -0.225, r=0.012, seg=1, col=OAK)                                 # 頂板
    xf.rbox(m, -0.2, 0.2, 0.58, 0.61, -0.225, -0.205, r=0.006, seg=1, col=OAK)                                   # 橫檔


# ---------------------------------------------------------------- 地板、天花板、牆、窗、外露風管
Mesh(P + 'floor', sh.M['floor'], tile=1.2).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
ce = Mesh(P + 'ceiling', sh.M['wall'], tile=1.6); ce.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); ce.finish(sh.root, uv=True)
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
ops = [(dx - dw / 2, dx + dw / 2, 0.0, dh, 'door')] + [(a, b, fr['sill'], fr['head'], 'win') for a, b in fr['windows']]
sh.wall_with_openings('front', ops, 'wall', 'wall', 0.0, 'wood', mull=1.3)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
for side, (a0, a1) in (('left', (Z0, Z1)), ('right', (Z0, Z1)), ('front', (X0, dx - dw / 2)), ('front', (dx + dw / 2, fr['windows'][0][0]))):
    sh.wall_box(side, 'wood', a0, a1, 0.0, 0.1, -0.015, 0.0)                                                          # 踢腳板
for (a, b) in fr['windows']: xf0.rbox(sh.w('front', 'wood'), a - 0.05, b + 0.05, fr['sill'] - 0.04, fr['sill'], Z1 - 0.16, Z1, r=0.006, seg=1)   # 窗台
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.0, 5.5, vz), (-7.0, 5.5, vz), (-7.0, -1.0, vz), (7.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
duct = sh.a('vcm')
xf0.cyl(duct, (X0 + 0.2, H - 0.12, 3.3), (X1 - 0.2, H - 0.12, 3.3), 0.07, col='#d6d2c8', seg=8)   # v2：細的一條（LAWWW2：大風管太搶眼）
xf0.rbox(duct, -0.9, 0.9, H - 0.32, H - 0.02, 0.2, 0.9, r=0.02, seg=1, col='#e6e2d8')                                  # 天花板的冷氣
xf0.rbox(duct, -0.75, 0.75, H - 0.34, H - 0.32, 0.3, 0.8, r=0.005, seg=1, col='#bdb8ac')
sh.tally('shell')

# ---------------------------------------------------------------- 北牆整面書牆（下面有門的矮櫃、上面七層書、類別牌）＋滑軌梯子
bw_ = IT['bookwall'][0]; ln, bh, bd = bw_['w'], bw_['h'], bw_['d']; bxf = Xf(bw_['x'], bw_['z'], 0.0); wm = sh.a('wood')
bxf.rbox(wm, -ln / 2, ln / 2, 0.0, bh, -bd / 2, -bd / 2 + 0.02, r=0.003, seg=1)                                          # 背板
nb = 12
for k in range(nb + 1): u = -ln / 2 + k * ln / nb; bxf.rbox(wm, max(-ln / 2, u - 0.025), min(ln / 2, u + 0.025), 0.0, bh, -bd / 2, bd / 2, r=0.004, seg=1)
bxf.rbox(wm, -ln / 2, ln / 2, 0.0, 0.08, -bd / 2, bd / 2, r=0.003, seg=1); bxf.rbox(wm, -ln / 2 - 0.02, ln / 2 + 0.02, bh - 0.05, bh, -bd / 2, bd / 2 + 0.02, r=0.006, seg=1)
bxf.rbox(wm, -ln / 2, ln / 2, 0.8, 0.83, -bd / 2, bd / 2 + 0.03, r=0.004, seg=1)                                          # 矮櫃的檯面（凸出一點）
for k in range(nb):
    u0, u1 = -ln / 2 + k * ln / nb + 0.025, -ln / 2 + (k + 1) * ln / nb - 0.025
    bxf.rbox(sh.a('vc'), u0 + 0.01, (u0 + u1) / 2 - 0.005, 0.1, 0.78, bd / 2 - 0.01, bd / 2, r=0.004, seg=1, col='#c79c6a')   # 矮櫃門（兩扇）
    bxf.rbox(sh.a('vc'), (u0 + u1) / 2 + 0.005, u1 - 0.01, 0.1, 0.78, bd / 2 - 0.01, bd / 2, r=0.004, seg=1, col='#c79c6a')
    for sx in ((u0 + u1) / 2 - 0.04, (u0 + u1) / 2 + 0.04): bxf.cyl(sh.a('vcm'), (sx, 0.62, bd / 2), (sx, 0.62, bd / 2 + 0.025), 0.008, col=BRASS, seg=6)
    for j, y in enumerate([0.83 + 0.36 * q for q in range(7)]):
        if y + 0.32 > bh - 0.05: break
        if j > 0: bxf.rbox(wm, u0 - 0.02, u1 + 0.02, y - 0.022, y, -bd / 2, bd / 2, r=0.003, seg=1)
        if R.random() < 0.12 and j > 0:
            stack(bxf, u0 + 0.16, bd / 2 - 0.15, y, R.randint(3, 6), 0.24, 0.19); K.book_rows(sh, 'books', bxf, u0 + 0.34, u1, y, bd / 2 - 0.04, hgt=0.3, depth=0.22, rows=GEN_ROWS, rng=R); continue
        if R.random() < 0.06 and j > 1:
            sh.plant(*bxf.p((u0 + u1) / 2, 0, 0.0)[::2], h=0.32, r=0.08, pot_col=R.choice(['#e8dcc0', '#b0653e']), y0=y); continue
        K.book_rows(sh, 'books', bxf, u0, u1, y, bd / 2 - 0.04, hgt=0.3, depth=0.22, rows=GEN_ROWS, rng=R)
CATS = [(0, 0), (2, 0), (4, 0), (6, 0), (0, 1), (2, 1)]                                                                    # 文學・小說、散文・人文、法律、歷史、藝術・設計、大學生活
for k, cell in enumerate(CATS):                                                                                           # 類別牌：掛在第二層的層板前（每兩格一張）
    u = -ln / 2 + (2 * k + 1) * ln / nb
    bxf.rbox(sh.a('vc'), u - 0.3, u + 0.3, 1.93, 2.11, bd / 2 + 0.005, bd / 2 + 0.015, r=0.003, seg=1, col='#2f3a33')
    sh.img_quad(sh.a('print'), bxf, u, 1.94, bd / 2 + 0.017, 0.56, 0.16, K.cell_uv(cell[0], cell[1], 2, 1))
for k in range(5): zz = -ln / 2 + 0.6 + k * 2.7; sh.hanging_pothos('pothos', bw_['x'] + zz, bh + 0.02, bw_['z'] + 0.12, n=7, drop=0.8)   # 書牆頂垂下來的黃金葛
ld = IT['ladder'][0]; lx = ld['x']; top = ld['rail']; zt_, zb_ = bw_['z'] + bd / 2 + 0.05, ld['z'] + 0.25                 # 滑軌梯子
xf0.cyl(sh.a('vcm'), (X0 + 0.3, top, zt_), (X1 - 0.3, top, zt_), 0.012, col=BRASS, seg=6)
for sx in (-0.22, 0.22): xf0.cyl(sh.a('wood'), (lx + sx, 0.0, zb_), (lx + sx, top, zt_), 0.025, seg=6)
for q in range(1, 11):
    t = q / 11.0; y = t * top; z = zb_ + (zt_ - zb_) * t; xf0.cyl(sh.a('wood'), (lx - 0.22, y, z), (lx + 0.22, y, z), 0.018, seg=5)
sh.tally('bookwall')

# ---------------------------------------------------------------- 窗邊長桌（黃銅檯燈、攤開的書）
wc = IT['window_counter'][0]; wz0, wz1 = wc['z'] - wc['d'] / 2, wc['z'] + wc['d'] / 2; wx0, wx1 = wc['x'] - wc['w'] / 2, wc['x'] + wc['w'] / 2
xf0.rbox(sh.a('wood'), wx0, wx1, wc['h'] - 0.04, wc['h'], wz0, wz1, r=0.008, seg=1)
for xx in (wx0 + 0.1, wc['x'], wx1 - 0.1): xf0.rbox(sh.a('wood'), xx - 0.03, xx + 0.03, 0.0, wc['h'] - 0.04, wz1 - 0.12, wz1 - 0.06, r=0.004, seg=1)
for s_ in LAY['seats']:
    if s_['table'] == 3: K.stool(sh, s_['x'], s_['z'] - 0.05, h=0.75, seat='#b98a58', metal='#2a2a2a')   # v2：高腳椅
for xx in (wx0 + 0.9, wx0 + 3.6, wx0 + 6.3): K.table_lamp(sh, xx, wz1 - 0.15, y=wc['h'], r=0.1, base_col=BRASS)
for (xx, kk) in ((wx0 + 1.9, 0), (wx0 + 4.6, 1)):                                                                          # 攤開的書＋一疊書
    stack(xf0, xx, wc['z'] - 0.05, wc['h'], 3, 0.22, 0.17, ry=0.3)
Xf(wx0 + 7.6, wc['z'] + 0.1, 0, wc['h']).lathe(sh.a('glass'), [(0.0, 0.0), (0.035, 0.0), (0.04, 0.12), (0.025, 0.17)], 0, 0, 0, seg=8)   # 乾燥花
for j in range(7):
    a = j * 0.9; Xf(wx0 + 7.6, wc['z'] + 0.1).cyl(sh.a('vc'), (0, wc['h'] + 0.15, 0), (math.cos(a) * 0.06, wc['h'] + 0.36 + (j % 3) * 0.04, math.sin(a) * 0.06), 0.002, col='#b8a070', seg=3, caps=False)
sh.tally('window counter')

# ---------------------------------------------------------------- 兩張閱讀桌
for k, t in enumerate(IT['reading_table']):
    K.rect_table(sh, t['x'], t['z'], 0.0, t['w'], t['d'], h=t['h'], top_key='wood', leg_key='wood', leg='wood')
    for s_ in LAY['seats']:
        if s_['table'] == k + 1: chair(s_['x'], s_['z'] + (-0.05 if s_['yaw'] == 0 else 0.05), s_['yaw'])
    sh.plant(t['x'] + (0.0 if k == 0 else 0.35), t['z'], h=0.42, r=0.12, pot_col='#f2efe8', y0=t['h'])   # v2：兩桌都有小盆栽
    xf0.rbox(sh.a('vc'), t['x'] - 0.15, t['x'] + 0.2, t['h'], t['h'] + 0.005, t['z'] + 0.12, t['z'] + 0.38, r=0.002, seg=1, col='#f4efe2')   # 攤開的筆記本
    xf0.cyl(sh.a('vc'), (t['x'] + 0.0, t['h'] + 0.006, t['z'] + 0.25), (t['x'] + 0.14, t['h'] + 0.006, t['z'] + 0.3), 0.004, col='#2f4a5a', seg=4)   # 筆
    if k == 0:
        K.mug(sh, t['x'] + 0.45, t['z'] + 0.2, t['h'], col='#f2efe8'); stack(xf0, t['x'] - 0.5, t['z'] - 0.15, t['h'], 2, 0.24, 0.17, ry=0.2)
    else:
        stack(xf0, t['x'] - 0.3, t['z'], t['h'], 1, 0.3, 0.22, ry=-0.2); xf0.rbox(sh.a('vc'), t['x'] + 0.15, t['x'] + 0.45, t['h'], t['h'] + 0.006, t['z'] - 0.2, t['z'] + 0.02, r=0.002, seg=1, col='#f4efe2')   # 筆記本
        K.mug(sh, t['x'] + 0.6, t['z'] + 0.25, t['h'], col='#e8dcc0')
    K.dome_pendant(sh, t['x'], t['z'], 2.45, r=0.2, col=('#2a2a2a' if k == 0 else BRASS), inner='#f4ecd8', kind='dome', glow_size=0.7)   # v2：黑、黃銅各一盞
sh.tally('reading tables')

# ---------------------------------------------------------------- 斜放的新書架（面向北，三層，書封朝外）
for dr in IT['display_rack']:
    dxf = Xf(dr['x'], dr['z'], math.pi)
    dxf.rbox(sh.a('wood'), -dr['w'] / 2, dr['w'] / 2, 0.0, 0.1, -dr['d'] / 2, dr['d'] / 2, r=0.006, seg=1)
    for sx in (-dr['w'] / 2, dr['w'] / 2 - 0.03): dxf.rbox(sh.a('wood'), sx, sx + 0.03, 0.0, dr['h'], -dr['d'] / 2, dr['d'] / 2, r=0.004, seg=1)
    for q in range(3):
        y = 0.15 + q * 0.33; zf = dr['d'] / 2 - 0.05 - q * 0.14
        dxf.rbox(sh.a('wood'), -dr['w'] / 2, dr['w'] / 2, y, y + 0.025, zf - 0.08, zf + 0.03, r=0.003, seg=1)
        for k in range(6):
            kk = (q * 6 + k + int(dr['x'] * 3)) % 16; uu = (kk / 16 + 0.002, 0.5 + 0.002, (kk + 1) / 16 - 0.002, 0.625 - 0.002)
            sh.img_quad(sh.a('print'), dxf, -dr['w'] / 2 + 0.2 + k * 0.3, y + 0.025, zf - 0.04, 0.22, 0.3, uu, tilt=0.3)
sh.tally('display rack')

# ---------------------------------------------------------------- 咖啡吧（面向西）＋後面的層板＋黑板菜單
cc = IT['cafe_counter'][0]; cx0, cx1, cz0, cz1 = cc['x'] - cc['w'] / 2, cc['x'] + cc['w'] / 2, cc['z'] - cc['d'] / 2, cc['z'] + cc['d'] / 2
xf0.rbox(sh.a('wood'), cx0, cx1, 0.0, cc['h'] - 0.04, cz0, cz1, r=0.01, seg=1)
xf0.rbox(sh.a('vcg'), cx0 - 0.04, cx1 + 0.02, cc['h'] - 0.04, cc['h'], cz0 - 0.02, cz1 + 0.02, r=0.008, seg=1, col='#ece6da')   # 淺色檯面
for k in range(9): zz = cz0 + 0.2 + k * (cc['d'] - 0.4) / 8; xf0.rbox(sh.a('vc'), cx0 - 0.012, cx0, 0.1, cc['h'] - 0.08, zz - 0.012, zz + 0.012, r=0.002, seg=1, col='#b38a5c')   # 正面的木條
top = cc['h']
cg = sh.a('glass'); xf0.rbox(sh.a('vc'), cx0 + 0.02, cx1 - 0.02, top, top + 0.05, cz0 + 0.2, cz0 + 1.5, r=0.004, seg=1, col='#d9d2c4')   # 玻璃甜點櫃（v2 加大、裡面一條燈）
cg.box(cx0 + 0.03, cx1 - 0.03, top + 0.05, top + 0.55, cz0 + 0.21, cz0 + 1.49)
sh.a('bulb').box(cx1 - 0.08, cx1 - 0.05, top + 0.5, top + 0.52, cz0 + 0.25, cz0 + 1.45); xf0.rbox(sh.a('vcg'), cx0 + 0.05, cx1 - 0.05, top + 0.27, top + 0.285, cz0 + 0.23, cz0 + 1.47, r=0.002, seg=1, col='#ece6da')
for k in range(10):
    zz = cz0 + 0.33 + (k % 5) * 0.25 + (0.0 if k < 5 else 0.0); yy_ = 0.0 if k < 5 else 0.235
    zz = zz; Xf(cc['x'], zz, 0, top + 0.05 + yy_).lathe(sh.a('vcg'), [(0.0, 0.0), (0.07, 0.0), (0.07, 0.008), (0.0, 0.008)], 0, 0, 0, seg=10, col='#f2efe8')
    Xf(cc['x'] - 0.02, zz, 0.3 * k, top + 0.06 + yy_).rbox(sh.a('vcg'), -0.05, 0.05, 0.0, 0.06, -0.035, 0.035, r=0.006, seg=1, col=('#e8c486', '#7a4a2a', '#f0d9a0', '#c96a4a', '#efe3c8')[k % 5])
em = Xf(cc['x'] + 0.05, cz0 + 2.2, -math.pi / 2, top)                                                                     # 濃縮咖啡機
em.rbox(sh.a('vcm'), -0.36, 0.36, 0.0, 0.5, -0.22, 0.22, r=0.02, seg=1, col='#c8c8c4'); em.rbox(sh.a('vc'), -0.26, 0.26, 0.42, 0.46, -0.18, 0.18, r=0.01, seg=1, col='#2a2a2a')
for sx in (-0.12, 0.12): em.cyl(sh.a('vcm'), (sx, 0.22, 0.2), (sx, 0.22, 0.27), 0.03, col='#9a9a96', seg=8)
Xf(cc['x'] + 0.1, cz0 + 2.85, 0, top).lathe(sh.a('vcm'), [(0.0, 0.0), (0.07, 0.0), (0.07, 0.25), (0.05, 0.3), (0.06, 0.42), (0.0, 0.42)], 0, 0, 0, seg=10, col='#3a3a3a')   # 磨豆機
for k in range(3): Xf(cc['x'] - 0.05, cz0 + 3.15 + k * 0.17, 0, top).lathe(sh.a('glass'), [(0.0, 0.0), (0.05, 0.0), (0.06, 0.12), (0.04, 0.14), (0.065, 0.24), (0.06, 0.25)], 0, 0, 0, seg=8)   # 手沖壺
CK.ph_put('CashRegister_01', cx0 + 0.26, top, cz1 - 0.285, yaw=-math.pi / 2, height=0.26, decimate=0.1)       # 收銀機：Poly Haven 掃描（SHOP-CC0-HELP-1113，取代原本的黑方塊）
for (y, n) in ((1.4, 12), (1.8, 12)):                                                                                    # 東牆層板：罐子、杯子
    xf0.rbox(sh.a('wood'), X1 - 0.32, X1, y - 0.03, y, cz0 + 0.1, cz1 - 0.1, r=0.004, seg=1)
    for k in range(n):
        zz = cz0 + 0.3 + k * (cc['d'] - 0.6) / (n - 1)
        if (k + int(y * 10)) % 2: K.jar(sh, X1 - 0.16, zz, y, h=0.16, r=0.045, col=R.choice(['#d8c49a', '#c9a27a', '#e8e0cc']), lid='#6a4630')
        else: K.mug(sh, X1 - 0.16, zz, y, col=R.choice(['#f2efe8', '#e8dcc0', '#c9b48a']))
sh.wall_img('right', 'print', cc['z'] - 0.95, 2.5, 1.2, 0.6, K.cell_uv(0, 4, 4, 2), off=0.032)                               # 手寫黑板菜單（v2：左半）
xf0.rbox(sh.w('right', 'wood'), X1 - 0.025, X1, 2.16, 2.84, cc['z'] - 1.59, cc['z'] - 0.31, r=0.006, seg=1)
sh.wall_img('right', 'print', cc['z'] + 0.85, 2.5, 1.3, 0.62, K.cell_uv(6, 1, 2, 1), off=0.02)                              # 店名牌「頁間書屋」（參考圖：正對門的那面牆）
for zz in (cz0 + 0.6, cc['z'] + 0.3): K.dome_pendant(sh, cc['x'] - 0.15, zz, 2.3, r=0.17, col=BRASS, inner='#f4ecd8', kind='dome', glow_size=0.6)
sh.tally('cafe')

# ---------------------------------------------------------------- 沙發角：雙人沙發、茶几、落地燈、圓地毯
sf = IT['sofa'][0]; sxf = Xf(sf['x'], sf['z'], 0.0); SF = '#d8cbb4'
sxf.rbox(sh.a('vc'), -sf['w'] / 2, sf['w'] / 2, 0.08, 0.42, -sf['d'] / 2, sf['d'] / 2, r=0.05, seg=2, col=SF)
sxf.rbox(sh.a('vc'), -sf['w'] / 2, sf['w'] / 2, 0.4, 0.85, -sf['d'] / 2, -sf['d'] / 2 + 0.2, r=0.06, seg=2, col=SF)
for sx in (-1, 1): sxf.rbox(sh.a('vc'), sx * sf['w'] / 2 - (0.16 if sx > 0 else 0), sx * sf['w'] / 2 + (0.0 if sx > 0 else 0.16), 0.4, 0.62, -sf['d'] / 2, sf['d'] / 2, r=0.05, seg=2, col=SF)
for sx in (-0.45, 0.45): sxf.rbox(sh.a('vc'), sx - 0.4, sx + 0.4, 0.42, 0.52, -sf['d'] / 2 + 0.2, sf['d'] / 2 - 0.02, r=0.04, seg=2, col='#e4d9c4')   # 坐墊
sxf.rbox(sh.a('vc'), -0.55, -0.15, 0.5, 0.78, -sf['d'] / 2 + 0.2, -sf['d'] / 2 + 0.32, r=0.05, seg=2, col='#7d8f62')   # 抱枕
ct = IT['coffee_table'][0]; K.rect_table(sh, ct['x'], ct['z'], 0.0, ct['w'], ct['d'], h=ct['h'], top_key='wood', leg_key='wood', leg='wood')
K.mug(sh, ct['x'] - 0.2, ct['z'], ct['h'], col='#f2efe8'); stack(xf0, ct['x'] + 0.18, ct['z'], ct['h'], 2, 0.24, 0.17, ry=0.4)
fl_ = IT['floor_lamp'][0]; fxf = Xf(fl_['x'], fl_['z'])
fxf.lathe(sh.a('vcm'), [(0.0, 0.0), (0.15, 0.0), (0.15, 0.02), (0.02, 0.04), (0.0, 0.04)], 0, 0, 0, seg=12, col=BRASS)
fxf.cyl(sh.a('vcm'), (0, 0.04, 0), (0, 1.45, 0), 0.012, col=BRASS, seg=6)
fxf.lathe(sh.a('bulb'), [(0.12, 1.4), (0.2, 1.4), (0.14, 1.65), (0.1, 1.65)], 0, 0, 0, seg=14)
CL.glow(sh.root, 'floorlamp', fl_['x'], 1.5, fl_['z'], color='rgba(255,205,140,1)', size=0.8, day=0.15, night=0.8)
Xf(sf['x'], sf['z'] + 1.6, 0, 0.004).lathe(sh.a('vc'), [(0.0, 0.0), (1.25, 0.0), (1.25, 0.008), (0.0, 0.008)], 0, 0, 0, seg=24, col='#cbbca2')   # 圓地毯
sh.tally('sofa')

# ---------------------------------------------------------------- 植物、軌道燈、窗邊的吊燈和明信片
def leafy(x, z, h=1.3):
    """落地植物：Poly Haven potted_plant_02（掃描；SHOP-CC0-HELP-1113，取代原本的花盆＋葉片卡）"""
    CK.ph_put('potted_plant_02', x, 0.0, z, yaw=RP.uniform(0, 6.28), share=False, height=h, decimate=0.03)
    return
    """v2：闊葉的落地植物（高花盆＋兩叢葉片卡；LAWWW2：v1 的大盆栽像細竹子）"""
    Xf(x, z).lathe(sh.a('vcg'), [(0.0, 0.0), (0.16, 0.0), (0.2, 0.42), (0.21, 0.45), (0.0, 0.45)], 0, 0, 0, seg=12, col=R.choice(['#e8dcc0', '#d8d0c0', '#b8a890']))
    sh.plant(x, z, h=0.66, r=0.34, pot_col='#6a5a44', y0=0.42); sh.plant(x + 0.05, z - 0.04, h=0.6, r=0.26, pot_col='#6a5a44', y0=h - 0.55)
    Xf(x, z).cyl(sh.a('vc'), (0, 0.45, 0), (0.03, h - 0.5, 0.0), 0.012, col='#5a6a3a', seg=4, caps=False)
for p_ in IT['plant_big']: leafy(p_['x'], p_['z'])
for (zz, n) in ((-2.6, 7), (2.2, 7)):
    m = sh.a('vcm'); xf0.rbox(m, X0 + 0.6, X1 - 1.2, H - 0.05, H - 0.01, zz - 0.02, zz + 0.02, r=0.004, seg=1, col='#2a2a2a')
    for k in range(n):
        x = X0 + 0.9 + k * (W - 2.4) / (n - 1); sp = Xf(x, zz, 0.0); aim = -0.08 if zz < 0 else 0.08
        sp.cyl(m, (0, H - 0.05, 0), (0, H - 0.12, 0), 0.008, col='#2a2a2a', seg=4, caps=False)
        sp.cyl(m, (0, H - 0.12, 0), (0, H - 0.26, aim), 0.035, col='#2a2a2a', seg=8)
        sh.a('bulb').cyl(sp.p(0, H - 0.26, aim), sp.p(0, H - 0.265, aim * 1.03), 0.03, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'spot', x, H - 0.4, zz + aim, color='rgba(255,214,160,1)', size=0.5, day=0.0, night=0.5)
for xx in (-1.0, 3.5): K.dome_pendant(sh, xx, Z1 - 0.5, 2.5, r=0.18, col='#f2efe8', inner='#f4ecd8', kind='dome', glow_size=0.5)
pc = sh.w('front', 'vc'); pcz = Z1 - 0.18; pa, pb = fr['windows'][0][0] + 0.4, fr['windows'][0][1] - 0.4                 # 明信片的麻繩
Xf(0, 0).cyl(pc, (pa, 2.45, pcz), ((pa + pb) / 2, 2.3, pcz), 0.003, col='#b8a070', seg=3, caps=False)
Xf(0, 0).cyl(pc, ((pa + pb) / 2, 2.3, pcz), (pb, 2.45, pcz), 0.003, col='#b8a070', seg=3, caps=False)
for k in range(10):
    t = (k + 0.5) / 10; x = pa + (pb - pa) * t; y = 2.45 - 0.15 * (1 - abs(2 * t - 1)) - 0.02
    kk = k % 8; uu = (0.5 + kk / 16 + 0.002, 1 - 5 / 8 + 0.002, 0.5 + (kk + 1) / 16 - 0.002, 1 - 4 / 8 - 0.002)
    sh.img_quad(sh.w('front', 'print'), Xf(x, pcz - 0.01, math.pi), 0, y - 0.16, 0.0, 0.11, 0.16, uu)
sh.tally('lights/plants')

# ---------------------------------------------------------------- v1b：密度（參考圖每一面牆都有東西）
def shelf(cx, cz, ry, ln, h, d=0.38):
    """靠牆的書櫃（正面朝 +z 轉 ry；層板每 0.36 m）"""
    xf = Xf(cx, cz, ry); wm = sh.a('wood'); xf.rbox(wm, -ln / 2, ln / 2, 0.0, h, -d / 2, -d / 2 + 0.02, r=0.003, seg=1)
    nb_ = max(1, round(ln / 0.9))
    for k in range(nb_ + 1): u = -ln / 2 + k * ln / nb_; xf.rbox(wm, max(-ln / 2, u - 0.02), min(ln / 2, u + 0.02), 0.0, h, -d / 2, d / 2, r=0.004, seg=1)
    xf.rbox(wm, -ln / 2 - 0.01, ln / 2 + 0.01, h - 0.04, h, -d / 2, d / 2 + 0.01, r=0.005, seg=1)
    for k in range(nb_):
        u0, u1 = -ln / 2 + k * ln / nb_ + 0.02, -ln / 2 + (k + 1) * ln / nb_ - 0.02
        for y in [0.08 + 0.36 * q for q in range(int((h - 0.4) / 0.36) + 1)]:
            xf.rbox(wm, u0 - 0.02, u1 + 0.02, y - 0.02, y, -d / 2, d / 2, r=0.003, seg=1)
            if R.random() < 0.1: stack(xf, u0 + 0.15, d / 2 - 0.14, y, R.randint(3, 6), 0.22, 0.18); continue
            K.book_rows(sh, 'books', xf, u0, u1, y, d / 2 - 0.04, hgt=0.3, depth=0.2, rows=GEN_ROWS, rng=R)
    return xf
shelf(X1 - 0.19, 3.8, -math.pi / 2, 1.8, 2.6)   # v2：咖啡吧加長，書櫃縮到 z 2.9～4.7                                                                         # 東牆南段的書櫃（咖啡吧右邊）
sh.plant(X1 - 0.25, 3.3, h=0.35, r=0.08, pot_col='#e8dcc0', y0=2.6); sh.hanging_pothos('pothos', X1 - 0.2, 2.65, 4.2, n=6, drop=0.7)
for (y, cnt) in ((3.05, 8),):                                                                                          # 咖啡吧上方再一層：植物、罐子
    xf0.rbox(sh.a('wood'), X1 - 0.32, X1, y - 0.03, y, cz0 + 0.1, cz1 - 0.1, r=0.004, seg=1)
    for k in range(cnt):
        zz = cz0 + 0.35 + k * (cc['d'] - 0.7) / (cnt - 1)
        if k % 2: sh.plant(X1 - 0.16, zz, h=0.3, r=0.07, pot_col=R.choice(['#e8dcc0', '#b0653e']), y0=y)
        else: K.jar(sh, X1 - 0.16, zz, y, h=0.2, r=0.05, col='#e8e0cc', lid='#b8944a')
for xx in (-2.2, 0.6, 3.0): K.dome_pendant(sh, xx, LAY['items'][2]['z'] - 0.35, 2.5, r=0.16, col='#2a2a2a', inner='#f4ecd8', kind='dome', glow_size=0.5)   # 窗邊長桌上方的黃銅吊燈
for (x, z) in ((-3.4, 1.6), (-0.4, -3.6), (5.55, 3.2)): leafy(x, z, h=1.1)
for (zz, cell) in ((-3.0, (4, 4, 2, 2)), (3.5, (6, 4, 2, 2))):                                                       # 西牆兩幅小畫（框）
    sh.wall_img('left', 'print', zz, 1.8, 0.55, 0.55, K.cell_uv(*cell), off=0.02)
    xf0.rbox(sh.w('left', 'wood'), X0, X0 + 0.025, 1.49, 2.11, zz - 0.31, zz + 0.31, r=0.004, seg=1)
sh.tally('v1b density')

CK.drop_protos()
info = sh.finish(OUT, keep=lambda ob: ob.name.startswith('S_ph_'), extra_info={'layout': LAY['version'], 'seats': len(LAY['seats']), 'cc0': [list(u) for u in CK.used()]})
print('CC0_USED', CK.used())
