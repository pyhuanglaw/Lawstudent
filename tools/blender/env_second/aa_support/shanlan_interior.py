"""山嵐書店 兩層樓室內 → GLB（AA 子代理 2026-11-03；臨時支援 LAWWW2，SCENE_RULES 第 10 節）。Blender 5.2（bpy，無介面）：
  /opt/blenv/bin/python tools/blender/env_second/aa_support/shanlan_interior.py [-- --out assets/models/env/second_ai/aa_support/shanlan.glb]
配置只寫在 src/data/shanlan_layout.js，這裡讀同一份。參考圖 docs/story_planning/ref_images/shops/shanlan_int.webp、shanlan_ext.webp。
貼圖：python3 tools/blender/env_second/aa_support/aa_int_tex.py shl（shl_print.png：分類牌、雜誌、書封、明信片、海報；shl_bookrows.png：書背，第 6 列是法律書）。
淺色木地板、淺色橡木書架、暖色燈、高書架、寬走道、整面玻璃；西南角挑空兩層高，寬木樓梯沿西牆上二樓。
二樓的東西（y ≥ 4.2）放在名字 L2_ 開頭的網格（自訂屬性 level＝1），一樓的沒有前綴：遊戲可以照樓層顯示／隱藏、分開算三角形。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import aa_kit as K   # noqa: E402
from aa_kit import L, CL, B, Mesh, g2b, bpy, bmesh, Matrix, Xf   # noqa: E402
K.AUTO_SEG = True   # v2：小零件倒角一段、細管不封口

arg = K.args()
LAY = K.layout('src/data/shanlan_layout.js', 'SHANLAN_LAYOUT')
OUT = os.path.join(L.ROOT, arg('--out', LAY['glb']))
W, D, H = LAY['w'], LAY['d'], LAY['h']
Y2 = LAY['levels'][1]['y']; H1 = LAY['levels'][0]['h']
sh = K.Shop('shl_', 'shanlan_interior', W, D, H, texres=512, props={'layout': LAY['version'], 'levels': [0.0, Y2]}, seed=613)
X0, X1, Z0, Z1 = sh.X0, sh.X1, sh.Z0, sh.Z1
sh._imgkeys = {'print', 'books'}
P = 'shl_'
sh.M.update({
    'floor': L.pbr(P + 'floor_oak', 'laminate_floor_02', tile=1.6, target='#c49b6c', normal=0.4, maps=('diff', 'nor'), res=512, rough_value=0.5),
    'wall': CL.soft_plaster(P + 'wall', '#d7bf98', 0.92, tile=1.8, k=0.25),   # v3：再往暖色（LAWWW2 驗收：參考圖整體蜂蜜色）；v2 #d9cbb4、v1 #ece6da
    'wood': L.pbr(P + 'oak', 'walnut_veneer', tile=1.3, target='#c99f6e', maps=('diff',), res=256, rough_value=0.48),
    'glass': L.flat(P + 'glass', '#dfe9ec', rough=0.05, alpha=0.14),
    'bulb': L.flat(P + 'bulb', '#ffeccc', rough=0.3, emit=B.srgb('#ffc88a')),
    'ceil': L.flat(P + 'ceiling', '#d8c4a2', rough=0.95, cull=True),   # v3：v2 #ddd2bf 偏灰白
    'print': K.img_mat(P + 'print', 'shl_print.png', rough=0.75),
    'books': K.img_mat(P + 'books', 'shl_bookrows.png', rough=0.8),
    'pothos': CL.leaf_mat(P + 'leaf_pothos', 'pothos_leaf.png'),
})
sh.M['shade'] = sh.M['bulb']   # 檯燈的燈罩＝發光材質
# ---- SHOP-CC0-HELP-1113（D161；幫手 g2）：頂點色零件照顏色換成 ambientCG 材質組、天花板換灰泥材質組、盆栽換 Poly Haven 掃描模型（做法 SHOP_CC0_HOWTO.md）
import cc0_kit   # noqa: E402
CK = cc0_kit.Kit(sh.root, P[:-1]); RP = random.Random(77)   # RP：掃描盆栽的轉向（另一個亂數，原本的書、雜誌排法不變）
sh.M.update({
    'ceil': CK.acg(P + 'ceiling', 'Plaster001', target='#d8c4a2', vary=0.04, tile=2.0, rough_value=0.95, cull=True),
    'paper': CK.acg(P + 'paper', 'Paper001', target='#efe8d8', vary=0.3, tile=0.3, rough_value=0.8),
    'blackmetal': CK.acg(P + 'black_metal', 'Metal009', target='#33353a', vary=0.2, tile=0.4, metal=0.4, rough_value=0.45),
    'steel': CK.acg(P + 'steel', 'Metal009', target='#a8aaa8', vary=0.04, tile=0.4, metal=0.25, rough_value=0.35),
    'ceramic': CK.acg(P + 'ceramic', 'Plastic006', target='#e8e4dc', vary=0.05, tile=0.4, rough_value=0.25),
    'ceramic_b': CK.acg(P + 'ceramic_beige', 'Plastic006', target='#d8d0c0', vary=0.05, tile=0.4, rough_value=0.3),
    'stone': CK.acg(P + 'counter_top', 'Marble012', target='#d6c4a4', vary=0.1, tile=1.2, rough_value=0.35),
    'darkwood': CK.acg(P + 'dark_wood', 'Wood066', target='#8a7258', tile=0.6, rough_value=0.5),
    'fab_grey': CK.acg(P + 'fabric_grey', 'Fabric030', target='#a9a49a', tile=0.35, rough_value=0.9),
    'canvas': CK.acg(P + 'canvas', 'Fabric030', target='#dccfb4', tile=0.25, rough_value=0.9),
    'shade_linen': CK.acg(P + 'shade_linen', 'Fabric030', target='#e8e2d4', tile=0.25, rough_value=0.85),
    'kraft': CK.acg(P + 'kraft', 'Cardboard004', target='#6e5a44', vary=0.12, tile=0.35, rough_value=0.8),
    'blackplastic': CK.acg(P + 'black_plastic', 'Plastic006', target='#26282a', vary=0.03, tile=0.4, rough_value=0.4),
})
sh.route({'#efe8d8': 'paper', '#f4efe2': 'paper', '#efe6d2': 'paper', '#3a3c3e': 'blackmetal', '#2a2a2a': 'blackmetal', '#9a9ea2': 'steel', '#b8b0a0': 'blackmetal',
          '#e8e4dc': 'ceramic', '#d8d0c0': 'ceramic_b', '#d6c4a4': 'stone', '#8a7258': 'darkwood', '#a9a49a': 'fab_grey',
          '#d9cdb2': 'canvas', '#e0d4b8': 'canvas', '#e8e2d4': 'shade_linen', '#6e5a44': 'kraft', '#2f3330': 'blackplastic', '#1c1d1e': 'blackplastic'})


_aa_plant = sh.plant


def _ph_plant(x, z, h=1.0, r=0.2, pot_col='#e8e4dc', y0=0.0, lvl='', seed=0):
    """大盆栽：Poly Haven potted_plant_02（掃描）。二樓的放進 L2（自訂屬性 level＝1）。
    小盆栽（h < 0.7）照舊 aa_kit 的黃金葛葉片卡：potted_plant_04 減到兩百面以下會變成一團灰（並排圖 v1 門口那盆），不減又超過大店 8 萬面"""
    big = h >= 0.7
    if not big: return _aa_plant(x, z, h=h, r=r, pot_col=pot_col, y0=y0, lvl=lvl, seed=seed)
    o = CK.ph_put('potted_plant_02' if big else 'potted_plant_04', x, y0, z, yaw=RP.uniform(0, 6.28), share=False,
                  height=(h + r * 0.8) if big else (r * 1.5 + h * 0.75), decimate=0.009)
    if lvl: o.name = 'L2_' + o.name; o['level'] = 1


sh.plant = _ph_plant
IT = {}
for i in LAY['items']: IT.setdefault(i['kind'], []).append(i)
STEEL = '#3a3c3e'; xf0 = Xf(0, 0)
VD = LAY['void']; ST = LAY['stairs']
GEN_ROWS = [0, 1, 2, 3, 4, 5]; LAW_ROWS = [6]
rng = random.Random(613)


def lv(y): return 'L2' if y >= Y2 - 1e-3 else ''


R2 = random.Random(1103)


def stack(xf, x, z, y, n, bw, bd, lvl='', cover=None, side=None, ry=0.0, cu=None, th=0.03):
    """v2：一疊平放的書＝一個五面的盒子（10 個三角形），貼 shl_print 的圖：上面是書封（cover＝圖集第 3 列的 16 張），
    四個側面是「書堆側面」的條（第 6 列：0～11 書背、12～15 頁緣；n 本用條的下面 n/6）——從旁邊看得到一本一本的顏色（v1 是素色的方塊）。
    xf：物件座標；(x, z) 是這疊書的中心、y 是底；bw 沿 x、bd 沿 z。回傳這疊書的頂。"""
    m = sh.a('print', lvl); h = th * n; x0, x1, z0, z1 = x - bw / 2, x + bw / 2, z - bd / 2, z + bd / 2; y1 = y + h
    if ry:
        c_ = xf.p(x, 0, z); xf = Xf(c_[0], c_[2], xf.ry + ry, xf.py); x0, x1, z0, z1 = -bw / 2, bw / 2, -bd / 2, bd / 2
    k = cover if cover is not None else R2.randrange(16); cu = cu or (k / 16 + 0.002, 0.5 + 0.002, (k + 1) / 16 - 0.002, 0.625 - 0.002)
    def strip(kk): return (kk / 16 + 0.003, 0.125 + 0.002, (kk + 1) / 16 - 0.003, 0.125 + 0.125 * n / 6 - 0.002)
    sp = strip(side if side is not None else R2.randrange(12)); pg = strip(12 + R2.randrange(4))
    spine_z = R2.random() < 0.7
    xf.quad(m, [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], uv=cu)
    xf.quad(m, [(x0, y, z1), (x1, y, z1), (x1, y1, z1), (x0, y1, z1)], uv=sp if spine_z else pg)
    xf.quad(m, [(x1, y, z0), (x0, y, z0), (x0, y1, z0), (x1, y1, z0)], uv=pg if spine_z else sp)
    xf.quad(m, [(x1, y, z1), (x1, y, z0), (x1, y1, z0), (x1, y1, z1)], uv=pg if spine_z else sp)
    xf.quad(m, [(x0, y, z0), (x0, y, z1), (x0, y1, z1), (x0, y1, z0)], uv=sp if spine_z else pg)
    return y1


# ---------------------------------------------------------------- 書架
def shelf_bank(cx, cz, ry, ln, h, d=0.42, y0=0.0, double=False, rows=GEN_ROWS, bay=0.9, levels=None, skip=()):
    """一座書架：x 沿書架（−ln/2～ln/2）、正面朝 +z（double＝兩面都有書，背面朝 −z）。層板每 0.4 m，書用書背圖集的一排一排"""
    lvl = lv(y0); xf = Xf(cx, cz, ry, y0); wm = sh.a('wood', lvl)
    levels = levels or [0.1 + 0.4 * k for k in range(int((h - 0.3) / 0.4) + 1) if 0.1 + 0.4 * k + 0.32 <= h]
    zb = -d / 2 if not double else -d / 2
    if not double: xf.rbox(wm, -ln / 2, ln / 2, 0.0, h, -d / 2, -d / 2 + 0.02, r=0.003, seg=1)
    else: xf.rbox(wm, -ln / 2, ln / 2, 0.1, h - 0.03, -0.01, 0.01, r=0.002, seg=1)
    nb = max(1, round(ln / bay))
    for k in range(nb + 1): u = -ln / 2 + k * ln / nb; xf.rbox(wm, max(-ln / 2, u - 0.02), min(ln / 2, u + 0.02), 0.0, h, zb, d / 2, r=0.004, seg=1)
    xf.rbox(wm, -ln / 2, ln / 2, 0.0, 0.1, zb + 0.02, d / 2 - 0.02, r=0.003, seg=1)
    xf.rbox(wm, -ln / 2 - 0.01, ln / 2 + 0.01, h - 0.03, h, zb, d / 2 + 0.01, r=0.006, seg=1)
    for y in levels[1:]: xf.rbox(wm, -ln / 2, ln / 2, y - 0.025, y, zb, d / 2, r=0.003, seg=1)
    sides = [(xf, d / 2 - 0.03)]
    if double: sides.append((Xf(cx, cz, ry + math.pi, y0), d / 2 - 0.03))
    for si, (sx, v) in enumerate(sides):
        for k in range(nb):
            u0, u1 = -ln / 2 + k * ln / nb + 0.025, -ln / 2 + (k + 1) * ln / nb - 0.025
            if si == 1: u0, u1 = -u1, -u0
            for j, y in enumerate(levels):
                if (si, k, j) in skip: continue
                if rng.random() < 0.09 and j > 0:   # 偶爾一格放平放的一疊書（v2：stack()，看得到書背的顏色）
                    stack(sx, u0 + 0.175, v - 0.12, y, rng.randint(3, 6), 0.25, 0.2, lvl=lvl)
                    K.book_rows(sh, 'books', sx, u0 + 0.38, u1, y, v, hgt=0.3, depth=0.22, lvl=lvl, rows=rows, rng=rng); continue
                K.book_rows(sh, 'books', sx, u0, u1, y, v, hgt=0.3, depth=0.22, lvl=lvl, rows=rows, rng=rng)
    return xf


def hang_sign(x, z, y, ry, cell, w=0.9, h=0.45, ceil=None):
    """吊牌（兩面都印）：淺木框、兩條細吊線"""
    lvl = lv(y); xf = Xf(x, z, ry); top = ceil if ceil is not None else (H if lvl else H1)
    xf.rbox(sh.a('wood', lvl), -w / 2 - 0.03, w / 2 + 0.03, y - h / 2 - 0.03, y + h / 2 + 0.03, -0.015, 0.015, r=0.006, seg=1)
    sh.img_quad(sh.a('print', lvl), xf, 0, y - h / 2, 0.017, w, h, K.cell_uv(*cell))
    sh.img_quad(sh.a('print', lvl), Xf(x, z, ry + math.pi), 0, y - h / 2, 0.017, w, h, K.cell_uv(*cell))
    for sx in (-w / 2 + 0.05, w / 2 - 0.05): xf.cyl(sh.a('vcm', lvl), (sx, y + h / 2 + 0.03, 0), (sx, top, 0), 0.003, col='#2a2a2a', seg=3)


def track(x0, x1, z, y, n, lvl, glow_every=2, aim=0.0):
    """軌道燈：一條黑色軌道、n 盞小筒燈（往下、稍微斜）"""
    m = sh.a('vcm', lvl); xf0.rbox(m, x0, x1, y - 0.04, y, z - 0.02, z + 0.02, r=0.004, seg=1, col='#2a2a2a')
    for k in range(n):
        x = x0 + (k + 0.5) * (x1 - x0) / n; sp = Xf(x, z, 0.0)
        sp.cyl(m, (0, y - 0.04, 0), (0, y - 0.1, 0), 0.008, col='#2a2a2a', seg=4)
        sp.cyl(m, (0, y - 0.1, 0), (0.0, y - 0.24, aim), 0.035, col='#2a2a2a', seg=10)
        sh.a('bulb', lvl).cyl(sp.p(0, y - 0.24, aim), sp.p(0, y - 0.245, aim * 1.04), 0.03, seg=10)
        if k % glow_every == 0: CL.glow(sh.root, 'spot', x, y - 0.3, z + aim, color='rgba(255,214,160,1)', size=0.5, day=0.0, night=0.5)


# ---------------------------------------------------------------- 地板、樓板、天花板、牆
Mesh(P + 'floor', sh.M['floor'], tile=1.6).box(X0, X1, -0.02, 0.0, Z0, Z1).finish(sh.root)
f2 = Mesh('L2_' + P + 'floor2', sh.M['floor'], tile=1.6); f2.box(X0, X1, Y2 - 0.02, Y2, Z0, VD['z0']); f2.box(VD['x1'], X1, Y2 - 0.02, Y2, VD['z0'], Z1); o = f2.finish(sh.root); o['level'] = 1
c1 = Mesh(P + 'ceiling1', sh.M['ceil'])
for (a0, a1, b0, b1) in ((X0, X1, Z0, VD['z0']), (VD['x1'], X1, VD['z0'], Z1)): c1.quad([(a0, H1, b0), (a1, H1, b0), (a1, H1, b1), (a0, H1, b1)])
c1.finish(sh.root, uv=True)
c2 = Mesh('L2_' + P + 'ceiling2', sh.M['ceil']); c2.quad([(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]); o = c2.finish(sh.root, uv=True); o['level'] = 1
fas = sh.a('wall')                                                                                                     # 挑空邊的樓板厚度（飾帶）
fas.box(VD['x0'] + 0.0, VD['x1'] + 0.12, H1, Y2 + 0.0, VD['z0'] - 0.12, VD['z0']); fas.box(VD['x1'], VD['x1'] + 0.12, H1, Y2, VD['z0'], Z1)
for side in ('back', 'left', 'right'):
    a0, a1 = (X0, X1) if side == 'back' else (Z0, Z1); sh.wall_box(side, 'wall', a0, a1, 0.0, H)
    for yy in (0.0, Y2): sh.wall_box(side, 'wood', a0, a1, yy, yy + 0.1, -0.015, 0.0)
# 臨街整面玻璃：一樓 0～3.95（中間雙開玻璃門）、石材飾帶 3.95～4.45、二樓 4.45～8.1、上緣 8.1～8.4
fr = LAY['front']; dx, dw, dh = fr['door']['x'], fr['door']['w'], fr['door']['h']
fw = sh.w('front', 'wall'); fg = sh.w('front', 'glass'); fm = sh.w('front', 'vcm')
fw.box(X0, X1, H1, 4.45, Z1, Z1 + 0.16); fw.box(X0, X1, 8.1, H, Z1, Z1 + 0.16)
def glass_band(y0, y1, xs):
    for a, b in zip(xs, xs[1:]): fg.quad([(b, y0 + 0.02, Z1 + 0.06), (a, y0 + 0.02, Z1 + 0.06), (a, y1 - 0.02, Z1 + 0.06), (b, y1 - 0.02, Z1 + 0.06)])
    for x in xs: xf0.rbox(fm, x - 0.035, x + 0.035, y0, y1, Z1 - 0.02, Z1 + 0.12, r=0.006, seg=1, col=STEEL)
    for y in (y0, y1): xf0.rbox(fm, X0, X1, y - 0.035, y + 0.035, Z1 - 0.02, Z1 + 0.12, r=0.006, seg=1, col=STEEL)
glass_band(0.0, H1, [X0, -5.6, -4.2, -2.8, -1.4, dx - dw / 2, dx + dw / 2, 3.1, 4.4, 5.7, X1])
glass_band(4.45, 8.1, [X0 + 0.0, -5.6, -4.2, -2.8, -1.4, 0.0, 1.4, 2.8, 4.2, 5.6, X1])
xf0.rbox(fm, dx - dw / 2, dx + dw / 2, dh - 0.035, dh + 0.035, Z1 - 0.02, Z1 + 0.12, r=0.006, seg=1, col=STEEL)        # 門楣
for sx in (-1, 1):                                                                                                       # 兩扇玻璃門的框＋長把手
    a = dx + sx * 0.02; b = dx + sx * (dw / 2 - 0.02)
    xf0.rbox(fm, min(a, b), max(a, b), 0.0, 0.06, Z1 + 0.0, Z1 + 0.1, r=0.004, seg=1, col=STEEL)
    xf0.cyl(fm, (dx + sx * 0.12, 0.85, Z1 - 0.06), (dx + sx * 0.12, 1.55, Z1 - 0.06), 0.015, col='#b8b0a0', seg=8)
    for yy in (0.9, 1.5): xf0.cyl(fm, (dx + sx * 0.12, yy, Z1 - 0.06), (dx + sx * 0.12, yy, Z1 + 0.02), 0.01, col='#b8b0a0', seg=6)
xf0.rbox(fm, dx - 0.025, dx + 0.025, 0.0, dh, Z1 - 0.02, Z1 + 0.12, r=0.004, seg=1, col=STEEL)
# v3：v2 一樓天花板的兩根樑拿掉，改成 shanlan_v3_fill.py 的木格樑
for (cx, cz) in [(c['x'], c['z']) for c in IT['column']]: xf0.rbox(sh.a('wall'), cx - 0.2, cx + 0.2, 0.0, H, cz - 0.2, cz + 0.2, r=0.02, seg=2)

# ---------------------------------------------------------------- 樓梯（實心的淺木階梯、木側板、玻璃欄杆、木扶手）
sx0, sx1 = ST['x'] - ST['w'] / 2, ST['x'] + ST['w'] / 2; zb = ST['z'] + ST['len'] / 2; ri, tr = ST['rise'], ST['tread']
sw = sh.a('wood')
for k in range(ST['n'] - 1):
    z1 = zb - k * tr; z0 = z1 - tr; y1 = (k + 1) * ri
    sw.box(sx0, sx1, y1 - ri - (0.0 if k == 0 else 0.0), y1 - 0.03, z0, z1)                                               # 踏階的體
    xf0.rbox(sw, sx0, sx1, y1 - 0.035, y1, z0, z1 + 0.025, r=0.008, seg=1)                                              # 踏板（前緣凸出 2.5 cm、倒角）
    if k > 0: sw.box(sx0, sx1, 0.0, y1 - ri, z0, z1)
sw.box(sx0, sx1, 0.0, Y2 - 0.03, VD['z0'] - 0.0, VD['z0'] + 0.001)
for k in range(ST['n'] - 1):                                                                                            # 東側的實心側板：每階一根從地面到踏板的柱（合起來是鋸齒上緣的整片側板）
    z1 = zb - k * tr; z0 = z1 - tr; y1 = (k + 1) * ri
    sw.box(sx1, sx1 + 0.06, 0.0, y1, z0, z1 + (0.03 if k == 0 else 0.0))
sw.box(sx1, sx1 + 0.06, 0.0, Y2, VD['z0'] - 0.001, VD['z0'] + 0.001)
gl = sh.a('glass'); hr = sh.a('vcm')
for k in range(5):                                                                                                      # 玻璃欄杆（五片，跟著斜度）＋木扶手
    za = zb - k * ST['len'] / 5; zc = za - ST['len'] / 5; ya = ri + (zb - za) / tr * ri; yc = ri + (zb - zc) / tr * ri
    gl.quad([(sx1 + 0.03, ya + 0.04, za - 0.03), (sx1 + 0.03, yc + 0.04, zc + 0.03), (sx1 + 0.03, yc + 0.95, zc + 0.03), (sx1 + 0.03, ya + 0.95, za - 0.03)])
    xf0.cyl(hr, (sx1 + 0.03, ya + 0.04, za - 0.03), (sx1 + 0.03, ya + 0.12, za - 0.03), 0.012, col='#9a9ea2', seg=6)
hy0, hy1 = ri + 1.0, Y2 + 1.0
Xf(0, 0).cyl(sh.a('wood'), (sx1 + 0.03, hy0, zb), (sx1 + 0.03, hy1, VD['z0']), 0.03, seg=10)
Xf(0, 0).cyl(sh.a('wood'), (sx1 + 0.03, hy1, VD['z0']), (sx1 + 0.03, hy1, VD['z0'] - 0.25), 0.03, seg=10)
Xf(0, 0).cyl(hr, (X0 + 0.07, 0.9 + ri, zb), (X0 + 0.07, 0.9 + Y2, VD['z0']), 0.02, col='#9a9ea2', seg=8)                   # 靠牆的扶手
for k in range(6): zz = zb - k * ST['len'] / 5.5; yy = 0.9 + ri + (zb - zz) / tr * ri; Xf(0, 0).cyl(hr, (X0, yy, zz), (X0 + 0.07, yy, zz), 0.008, col='#9a9ea2', seg=5)

# ---------------------------------------------------------------- 二樓挑空邊的玻璃欄杆（木扶手、鋼柱）＋欄杆邊垂下來的黃金葛
def rail(a, b, fixed, axis):
    n = max(1, round(abs(b - a) / 1.2))
    for k in range(n):
        u0, u1 = a + k * (b - a) / n, a + (k + 1) * (b - a) / n
        q = (lambda u, y: (u, y, fixed)) if axis == 'x' else (lambda u, y: (fixed, y, u))
        sh.a('glass', 'L2').quad([q(u0 + 0.02, Y2 + 0.06), q(u1 - 0.02, Y2 + 0.06), q(u1 - 0.02, Y2 + 0.98), q(u0 + 0.02, Y2 + 0.98)])
        Xf(0, 0).cyl(sh.a('vcm', 'L2'), q(u0, Y2), q(u0, Y2 + 1.02), 0.02, col='#9a9ea2', seg=8)
    Xf(0, 0).cyl(sh.a('wood', 'L2'), q(a, Y2 + 1.04), q(b, Y2 + 1.04), 0.035, seg=10)
rail(sx1 + 0.06, VD['x1'], VD['z0'], 'x'); rail(VD['z0'], Z1 - 0.1, VD['x1'], 'z')
for (pz, n) in ((3.2, 10), (6.8, 10)):                                                                                   # 欄杆內側的長花槽
    xf0.rbox(sh.a('vcg', 'L2'), VD['x1'] + 0.2, VD['x1'] + 0.55, Y2, Y2 + 0.38, pz - 0.5, pz + 0.5, r=0.02, col='#e8e4dc')
    sh.hanging_pothos('pothos', VD['x1'] + 0.37, Y2 + 0.55, pz - 0.25, n=6, drop=0.4, lvl='L2'); sh.hanging_pothos('pothos', VD['x1'] + 0.37, Y2 + 0.55, pz + 0.25, n=6, drop=0.4, lvl='L2')
    for k in range(4): sh.hanging_pothos('pothos', VD['x1'] - 0.05, Y2 + 1.0, pz - 0.4 + k * 0.27, n=4, drop=1.4, lvl='L2')    # 垂到挑空裡

# ---------------------------------------------------------------- 一樓：書架（後牆、西牆、東牆北段、兩排島架）
shelf_bank(0.0, Z0 + 0.21, 0.0, W, 2.6)
shelf_bank(X0 + 0.21, (Z0 + 0.42 + 0.6) / 2, math.pi / 2, 0.6 - (Z0 + 0.42), 2.6)
shelf_bank(X1 - 0.21, (Z0 + 0.42 - 4.2) / 2, -math.pi / 2, -4.2 - (Z0 + 0.42), 2.6)
for isl in IT['island']: shelf_bank(isl['x'], isl['z'], 0.0, isl['w'], isl['h'], d=isl['d'], double=True)
for isl in IT['island']: sh.plant(isl['x'] + isl['w'] / 2 - 0.3, isl['z'], h=0.35, r=0.09, pot_col='#e8e4dc', y0=isl['h'])
sh.wall_img('left', 'print', -4.0, 3.25, 2.4, 1.2, K.cell_uv(0, 4, 4, 2), off=0.02)                                     # 西牆上方：秋日讀書節海報

# 雜誌牆（東牆）：斜放的展示架四層、雜誌封面（圖集第 2 列 16 張，每張 64×128 px）
mg = IT['magazine_wall'][0]; mxf = Xf(X1 - 0.02, mg['z'], -math.pi / 2); mw = mg['w']
mxf.rbox(sh.a('wood'), -mw / 2, mw / 2, 0.0, 2.6, -0.02, 0.02, r=0.004, seg=1)
for k in range(5): u = -mw / 2 + k * mw / 4; mxf.rbox(sh.a('wood'), u - 0.02, u + 0.02, 0.0, 2.6, 0.0, 0.36, r=0.004, seg=1)
mxf.rbox(sh.a('wood'), -mw / 2 - 0.02, mw / 2 + 0.02, 2.6, 2.64, -0.02, 0.38, r=0.006, seg=1)
mi = 0
for j, y in enumerate((0.25, 0.7, 1.15, 1.6, 2.05)):   # v2：多一層
    mxf.rbox(sh.a('wood'), -mw / 2, mw / 2, y - 0.03, y, 0.0, 0.36, r=0.004, seg=1)
    mxf.rbox(sh.a('wood'), -mw / 2, mw / 2, y, y + 0.05, 0.3, 0.33, r=0.004, seg=1)                                     # 擋條
    u = -mw / 2 + 0.06
    while u < mw / 2 - 0.25:
        k = mi % 16; mi += 1; uu = (k / 16 + 0.002, 1 - 384 / 1024 + 0.002, (k + 1) / 16 - 0.002, 1 - 256 / 1024 - 0.002)
        sh.img_quad(sh.a('print'), mxf, u + 0.105, y + 0.01, 0.31, 0.21, 0.29, uu, tilt=0.32)
        u += 0.225   # v2：排滿（v1 每層最後空 1 m）
hang_sign(X1 - 0.6, mg['z'], 3.05, -math.pi / 2, (2, 0, 2, 1), w=0.9, h=0.45)

# 文具：東牆的架子（筆記本、紙膠帶、明信片）＋兩張文具桌
sw_ = IT['stationery_wall'][0]; wxf = Xf(X1 - 0.02, sw_['z'], -math.pi / 2); ww = sw_['w']
wxf.rbox(sh.a('wood'), -ww / 2, ww / 2, 0.0, 2.0, -0.02, 0.0, r=0.003, seg=1)
for y in (0.4, 0.8, 1.2, 1.6):
    wxf.rbox(sh.a('wood'), -ww / 2, ww / 2, y - 0.025, y, 0.0, 0.3, r=0.004, seg=1)
    u = -ww / 2 + 0.05
    while u < ww / 2 - 0.2:
        if y < 1.5:
            k = rng.randrange(8); uu = (0.5 + k / 16 + 0.002, 1 - 768 / 1024 + 0.002, 0.5 + (k + 1) / 16 - 0.002, 1 - 640 / 1024 - 0.002)   # 筆記本封面
            for q in range(rng.randint(2, 5)): wxf.rbox(sh.a('vcg'), u, u + 0.16, y + q * 0.015, y + 0.013 + q * 0.015, 0.03, 0.25, r=0.0, seg=1, col='#efe8d8')   # CC0：紙材質組；不倒角（1.3 cm 厚看不出來，少 7 千面）
            sh.img_quad(sh.a('print'), wxf, u + 0.08, y + 0.075, 0.25, 0.16, 0.0001, uu)
            u += 0.2
        else:
            k = rng.randrange(8); uu = (0.5 + k / 16 + 0.002, 1 - 640 / 1024 + 0.002, 0.5 + (k + 1) / 16 - 0.002, 1 - 512 / 1024 - 0.002)    # 明信片（斜靠）
            sh.img_quad(sh.a('print'), wxf, u + 0.06, y, 0.2, 0.11, 0.16, uu, tilt=0.18); u += 0.14
hang_sign(X1 - 0.6, sw_['z'], 3.05, -math.pi / 2, (4, 0, 2, 1), w=0.9, h=0.45)
for st in IT['stationery']:
    K.rect_table(sh, st['x'], st['z'], 0.0, st['w'], st['d'], h=0.82, top_key='wood', leg_key='wood', leg='wood')
    for k in range(5):                                                                                                  # 筆筒、紙膠帶、筆記本
        px_, pz_ = st['x'] - 0.55 + k * 0.27, st['z'] + rng.uniform(-0.25, 0.25)
        if k % 2 == 0:
            Xf(px_, pz_, 0, 0.82).lathe(sh.a('vcg'), [(0.0, 0.0), (0.045, 0.0), (0.045, 0.11), (0.04, 0.11), (0.04, 0.01), (0.0, 0.01)], 0, 0, 0, seg=12, col='#e8e4dc')
            for q in range(6): a = q * 1.05; Xf(px_, pz_).cyl(sh.a('vc'), (math.cos(a) * 0.02, 0.83, math.sin(a) * 0.02), (math.cos(a) * 0.03, 0.97, math.sin(a) * 0.03), 0.004, col=rng.choice(['#c4513e', '#2f4a5a', '#d9a441', '#2a2a2a', '#6f8a5e']), seg=5)
        else:
            for q in range(3): Xf(px_ + q * 0.07 - 0.07, pz_, 0, 0.82).lathe(sh.a('vcg'), [(0.012, 0.0), (0.035, 0.0), (0.035, 0.018), (0.012, 0.018)], 0, 0, 0, seg=12, col=rng.choice(['#e8b4a0', '#a8c8d8', '#f0d890', '#b8d0a0', '#d8b8d8']))
    for q in range(4): sh.img_quad(sh.a('print'), Xf(st['x'] + 0.3 + (q % 2) * 0.2, st['z'] - 0.1 + (q // 2) * 0.22, 0.0), 0, 0.83, 0.0, 0.15, 0.2, (0.5 + q / 16, 1 - 768 / 1024, 0.5 + (q + 1) / 16, 1 - 640 / 1024), tilt=math.pi / 2)

# 結帳櫃檯＋後面的矮櫃
ca = IT['cashier'][0]; cx0, cx1, cz0, cz1 = ca['x'] - ca['w'] / 2, ca['x'] + ca['w'] / 2, ca['z'] - ca['d'] / 2, ca['z'] + ca['d'] / 2
xf0.rbox(sh.a('wood'), cx0, cx1, 0.06, ca['h'] - 0.04, cz0, cz1, r=0.01, seg=1)
xf0.rbox(sh.a('vcg'), cx0 - 0.04, cx1 + 0.02, ca['h'] - 0.04, ca['h'], cz0 - 0.02, cz1 + 0.02, r=0.01, seg=2, col='#d6c4a4')   # v2：v1 #ece6da 太白
xf0.rbox(sh.a('vc'), cx0 + 0.03, cx1 - 0.03, 0.0, 0.06, cz0 + 0.03, cz1 - 0.03, r=0.004, seg=1, col='#8a7258')
rg = Xf(ca['x'] + 0.1, ca['z'] - 0.6, -math.pi / 2, ca['h'])
rg.rbox(sh.a('vcg'), -0.15, 0.15, 0.0, 0.05, -0.12, 0.12, r=0.01, col='#2f3330'); rg.rbox(sh.a('vcg'), -0.13, 0.13, 0.05, 0.25, -0.02, 0.0, r=0.005, col='#1c1d1e')
for q in range(6): Xf(ca['x'] + 0.05, ca['z'] + 0.6, 0.0, ca['h'] + q * 0.008).rbox(sh.a('vc'), -0.16, 0.16, 0.0, 0.007, -0.11, 0.11, r=0.002, seg=1, col='#efe6d2')   # 紙袋
for q in range(3): Xf(ca['x'] + 0.05, ca['z'] + 0.05 + q * 0.0, 0.1 * q, ca['h'] + q * 0.03).rbox(sh.a('vcg'), -0.11, 0.11, 0.0, 0.028, -0.15, 0.15, r=0.003, col=('#4a6c8c', '#e8e0cc', '#8c3b47')[q])
bk = Xf(X1 - 0.2, ca['z'], -math.pi / 2)
bk.rbox(sh.a('wood'), -ca['d'] / 2, ca['d'] / 2, 0.0, 1.0, -0.2, 0.2, r=0.01, seg=1)
K.book_rows(sh, 'books', Xf(X1 - 0.02, ca['z'], -math.pi / 2, 1.0), -1.4, 1.4, 0.0, 0.2, hgt=0.3, depth=0.2, rows=GEN_ROWS, rng=rng)
sh.plant(X1 - 0.3, ca['z'] + 1.2, h=0.4, r=0.1, pot_col='#e8e4dc', y0=1.0)

# 新書平台（三座）：底座兩側是書背、上面兩層平放的書（書封朝上）、中間一排立著的書
def platform(it, lamp=False, flowers=False):
    x, z, w, d, h = it['x'], it['z'], it['w'], it['d'], it['h']; long_x = w >= d; L_, S_ = (w, d) if long_x else (d, w)
    xf = Xf(x, z, 0.0 if long_x else math.pi / 2); wm = sh.a('wood')
    xf.rbox(wm, -L_ / 2, L_ / 2, 0.0, 0.5, -S_ / 2, S_ / 2, r=0.015, seg=2)
    for sgn in (1, -1):
        bx = Xf(x, z, (0.0 if long_x else math.pi / 2) + (0 if sgn > 0 else math.pi))
        bx.rbox(sh.a('vc'), -L_ / 2 + 0.05, L_ / 2 - 0.05, 0.08, 0.44, S_ / 2 - 0.25, S_ / 2 - 0.24, r=0.002, seg=1, col='#6e5a44')
        K.book_rows(sh, 'books', bx, -L_ / 2 + 0.06, L_ / 2 - 0.06, 0.1, S_ / 2 - 0.02, hgt=0.3, depth=0.2, rows=GEN_ROWS, rng=rng)
    xf.rbox(wm, -L_ / 2 + 0.3, L_ / 2 - 0.3, 0.5, h - 0.17, -S_ / 2 + 0.3, S_ / 2 - 0.3, r=0.012, seg=2)
    xf.rbox(wm, -L_ / 2 + 0.55, L_ / 2 - 0.55, h - 0.17, h, -0.12, 0.12, r=0.01, seg=2)
    def stacks(yt, a, b, c0, c1):
        u = a
        while u < b - 0.16:
            for vv in ([c0, (c0 + c1) / 2, c1] if c1 - c0 > 0.45 else [c0, c1]):   # v2：寬的那一層排三排
                n = rng.randint(3, 6); bw_, bd_ = rng.uniform(0.14, 0.17), rng.uniform(0.2, 0.23)
                stack(xf, u + bw_ / 2, vv + rng.uniform(-0.01, 0.01), yt, n, bw_, bd_, ry=rng.uniform(-0.05, 0.05))
            u += 0.175   # v2：排密一點（v1 0.2）
    stacks(0.5, -L_ / 2 + 0.04, L_ / 2 - 0.02, -S_ / 2 + 0.15, S_ / 2 - 0.15)
    stacks(h - 0.17, -L_ / 2 + 0.32, L_ / 2 - 0.3, -S_ / 2 + 0.42, S_ / 2 - 0.42)
    u = -L_ / 2 + 0.6
    while u < L_ / 2 - 0.7:                                                                                             # 立著的書（書封朝外，兩面）
        for sgn in (1, -1):
            k = rng.randrange(16); uu = (k / 16 + 0.002, 0.5 + 0.002, (k + 1) / 16 - 0.002, 0.625 - 0.002)
            sh.img_quad(sh.a('print'), Xf(x, z, (0.0 if long_x else math.pi / 2) + (0 if sgn > 0 else math.pi)), sgn * (u + 0.08), h, 0.12, 0.15, 0.22, uu, tilt=0.18)
        u += 0.2
    if lamp:
        Xf(*xf.p(L_ / 2 - 0.4, 0, 0)[::2], 0.0, h).lathe(sh.a('bulb'), [(0.0, 0.0), (0.12, 0.02), (0.2, 0.12), (0.22, 0.22), (0.18, 0.34), (0.08, 0.4), (0.0, 0.41)], 0, 0, 0, seg=20)
        CL.glow(sh.root, 'lantern', *xf.p(L_ / 2 - 0.4, h + 0.2, 0), color='rgba(255,214,160,1)', size=0.9, day=0.2, night=0.9)
    if flowers:
        fx, fz = xf.p(-L_ / 2 + 0.7, 0, 0)[::2]
        Xf(fx, fz, 0, h).lathe(sh.a('vcg'), [(0.0, 0.0), (0.07, 0.0), (0.12, 0.12), (0.1, 0.25), (0.05, 0.3), (0.06, 0.34)], 0, 0, 0, seg=16, col='#d8d0c0')
        rr = random.Random(3)
        for j in range(26):
            a = rr.uniform(0, 6.28); r_ = rr.uniform(0.02, 0.28); fy = h + 0.36 + rr.uniform(0.1, 0.55)
            Xf(fx, fz).cyl(sh.a('vc'), (0, h + 0.3, 0), (math.cos(a) * r_, fy, math.sin(a) * r_), 0.004, col='#6a7a3a', seg=3)
            sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.02), (0.03, -0.01), (0.032, 0.0), (0.0, 0.015)], seg=6), '#e8c43a'), Matrix.Translation(g2b(fx + math.cos(a) * r_, fy, fz + math.sin(a) * r_)))
platform(IT['platform'][0], lamp=True, flowers=True); platform(IT['platform'][1]); platform(IT['platform'][2], lamp=False)
hang_sign(2.2, 6.3, 3.1, 0.0, (0, 0, 2, 1), w=1.0, h=0.5)
hang_sign(-0.6, -1.2, 3.1, 0.0, (0, 0, 2, 1), w=1.0, h=0.5)
# 一樓靠窗長椅（灰色坐墊，底下一條暖色燈）
bn = IT['bench'][0]
xf0.rbox(sh.a('wood'), bn['x'] - bn['w'] / 2, bn['x'] + bn['w'] / 2, 0.06, 0.4, Z1 - 0.5, Z1 - 0.02, r=0.01, seg=2)
xf0.rbox(sh.a('vc'), bn['x'] - bn['w'] / 2 + 0.02, bn['x'] + bn['w'] / 2 - 0.02, 0.4, 0.47, Z1 - 0.49, Z1 - 0.04, r=0.025, seg=2, col='#a9a49a')
sh.a('bulb').box(bn['x'] - bn['w'] / 2 + 0.05, bn['x'] + bn['w'] / 2 - 0.05, 0.03, 0.05, Z1 - 0.52, Z1 - 0.5)
# 植物（挑空下、門邊、雜誌牆北端）
sh.plant(-1.95, 1.5, h=1.5, r=0.26, pot_col='#e8e4dc'); sh.plant(-1.15, 8.6, h=1.1, r=0.22, pot_col='#d8d0c0'); sh.plant(6.55, -4.0, h=1.2, r=0.22, pot_col='#e8e4dc')
# 一樓天花板：軌道燈＋挑空的大吊燈
for zz in (-7.6, -5.0, -2.2): track(-6.0, 5.8, zz, H1, 8, '')
for zz in (2.0, 4.6, 7.2): track(-1.0, 6.4, zz, H1, 5, '')
for (x, z) in ((-3.3, 3.6), (-3.3, 6.0)): K.dome_pendant(sh, x, z, 5.2, r=0.32, col='#e8e2d4', inner='#fbf3e0', cord_top=H, lvl='L2', glow_size=1.0)

# ---------------------------------------------------------------- 二樓：書架（後牆、西牆、東牆＝法律）、四排雙面書架、童書、閱讀區、靠窗長椅
y2 = Y2
shelf_bank(0.9, Z0 + 0.21, 0.0, W - 1.8, 2.6, y0=y2)                                                                  # 後牆（西段 x −7～−5.2 是童書的矮書架）
shelf_bank(X0 + 0.21, (Z0 + 0.42 - 0.6) / 2, math.pi / 2, -0.6 - (Z0 + 0.42), 2.6, y0=y2)
shelf_bank(X1 - 0.21, (Z0 + 0.42 + 0.6) / 2, -math.pi / 2, 0.6 - (Z0 + 0.42), 2.6, y0=y2, rows=LAW_ROWS + [2])
sec = {'人文': (6, 0), '文學': (0, 1), '藝術': (2, 1), '法律': (6, 1)}
for rw in IT['row']:
    shelf_bank(rw['x'], rw['z'], math.pi / 2, rw['d'], rw['h'], d=rw['w'], y0=y2, double=True, rows=(LAW_ROWS if rw['section'] == '法律' else GEN_ROWS), bay=0.95)
    hang_sign(rw['x'], rw['z'] + rw['d'] / 2 + 0.35, y2 + 2.75, 0.0, (*sec[rw['section']], 2, 1), w=0.8, h=0.4)
hang_sign(X1 - 0.6, -4.0, y2 + 2.75, -math.pi / 2, (6, 1, 2, 1), w=0.8, h=0.4)
kx = Xf(-6.1, Z0 + 0.2, 0.0, y2)                                                                                        # 童書：矮書架、圓地墊、兩個小凳子
kx.rbox(sh.a('wood', 'L2'), -0.85, 0.85, 0.0, 1.0, -0.2, 0.2, r=0.01, seg=1)
for y in (0.08, 0.52): kx.rbox(sh.a('wood', 'L2'), -0.85, 0.85, y - 0.02, y, -0.2, 0.2, r=0.003, seg=1); K.book_rows(sh, 'books', kx, -0.8, 0.8, y, 0.17, hgt=0.3, depth=0.18, lvl='L2', rows=GEN_ROWS, rng=rng)
Xf(-5.6, -7.4, 0, y2).lathe(sh.a('vc', 'L2'), [(0.0, 0.004), (1.0, 0.004), (1.0, 0.012), (0.0, 0.012)], 0, 0, 0, seg=32, col='#e8d6a8')
Xf(-5.6, -7.4, 0, y2).lathe(sh.a('vc', 'L2'), [(0.0, 0.013), (0.55, 0.013), (0.55, 0.016), (0.0, 0.016)], 0, 0, 0, seg=28, col='#9fb49a')
for (x, z, c) in ((-5.0, -7.0, '#e8b4a0'), (-6.2, -6.8, '#a8c8d8')): Xf(x, z, 0, y2).lathe(sh.a('vcg', 'L2'), [(0.0, 0.0), (0.14, 0.0), (0.13, 0.28), (0.15, 0.3), (0.0, 0.31)], 0, 0, 0, seg=14, col=c)
hang_sign(-6.1, -7.6, y2 + 2.6, 0.0, (4, 1, 2, 1), w=0.8, h=0.4)
bn2 = IT['bench'][1]
xf0.rbox(sh.a('wood', 'L2'), bn2['x'] - bn2['w'] / 2, bn2['x'] + bn2['w'] / 2, y2 + 0.06, y2 + 0.4, Z1 - 0.5, Z1 - 0.02, r=0.01, seg=2)
xf0.rbox(sh.a('vc', 'L2'), bn2['x'] - bn2['w'] / 2 + 0.02, bn2['x'] + bn2['w'] / 2 - 0.02, y2 + 0.4, y2 + 0.47, Z1 - 0.49, Z1 - 0.04, r=0.025, seg=2, col='#a9a49a')
for k in range(3): Xf(bn2['x'] - 3.0 + k * 2.6, Z1 - 0.28, 0, y2 + 0.47).lathe(sh.a('vc', 'L2'), [(0.0, 0.0), (0.18, 0.0), (0.2, 0.04), (0.16, 0.08), (0.0, 0.09)], 0, 0, 0, seg=12, col=('#c9b48a', '#9fb49a', '#d8c4a8')[k])   # 坐墊
for rt in IT['reading_table']:
    K.rect_table(sh, rt['x'], rt['z'], 0.0, rt['w'], rt['d'], h=0.75, top_key='wood', leg_key='wood', leg='wood', lvl='L2', y0=y2)
    for s_ in LAY['seats']:
        if s_['lv'] == 1 and s_.get('table') and abs(s_['x'] - rt['x']) < 1 and abs(s_['z'] - rt['z']) < 1:
            K.bentwood_chair(sh, s_['x'], s_['z'] + (-0.05 if s_['yaw'] == 0 else 0.05), s_['yaw'], key='wood', lvl='L2', y0=y2)
    K.table_lamp(sh, rt['x'] - 0.55, rt['z'], y=y2 + 0.75, r=0.12, lvl='L2')
    for q in range(2): Xf(rt['x'] + 0.2 + q * 0.3, rt['z'] + 0.1, 0.2 * q, y2 + 0.75).rbox(sh.a('vcg', 'L2'), -0.11, 0.11, 0.0, 0.03, -0.15, 0.15, r=0.003, col=('#2f4a3a', '#e8e0cc')[q])
    K.dome_pendant(sh, rt['x'], rt['z'], y2 + 2.4, r=0.24, col='#e8e2d4', inner='#fbf3e0', lvl='L2', glow_size=0.8)
sh.plant(-1.15, 1.6, h=1.3, r=0.22, pot_col='#e8e4dc', y0=y2, lvl='L2'); sh.plant(6.5, 1.6, h=1.1, r=0.2, pot_col='#d8d0c0', y0=y2, lvl='L2')   # v5.1：二樓這兩盆原本漏了 lvl，被併進一樓的網格（LAWWW-C 11-05）
for zz in (-8.0, -1.2): track(-6.0, 6.0, zz, H, 8, 'L2')
for xx in (-3.2, -0.4, 2.4, 5.2):
    Xf(0, 0).rbox(sh.a('vcm', 'L2'), xx - 0.02, xx + 0.02, H - 0.04, H, -7.4, -2.0, r=0.004, seg=1, col='#2a2a2a')
    for k in range(4): zz = -7.0 + k * 1.5; sp = Xf(xx, zz); sp.cyl(sh.a('vcm', 'L2'), (0, H - 0.04, 0), (0, H - 0.22, 0), 0.035, col='#2a2a2a', seg=10); sh.a('bulb', 'L2').cyl(sp.p(0, H - 0.22, 0), sp.p(0, H - 0.225, 0), 0.03, seg=10)
for zz in (3.0, 6.0): track(-0.8, 6.6, zz, H, 4, 'L2')

# ---------------------------------------------------------------- 生活痕跡：地上的一個帆布袋、一本攤開放在長椅上的書、平台旁的購物籃
bg = Xf(-3.4, -5.4, 0.3, y2); bg.rbox(sh.a('vc', 'L2'), -0.17, 0.17, 0.0, 0.34, -0.05, 0.05, r=0.03, col='#d9cdb2')
bg.cyl(sh.a('vc', 'L2'), (-0.1, 0.34, 0), (0.0, 0.5, 0.0), 0.008, col='#d9cdb2', seg=4); bg.cyl(sh.a('vc', 'L2'), (0.1, 0.34, 0), (0.0, 0.5, 0.0), 0.008, col='#d9cdb2', seg=4)
for (x, z, yy, ry) in ((-2.6, 8.72, 0.47, 0.2), (3.6, 8.72, y2 + 0.47, -0.3)):
    ob_ = Xf(x, z, ry, yy); ob_.rbox(sh.a('vc', lv(yy)), -0.15, 0.15, 0.0, 0.02, -0.1, 0.1, r=0.003, seg=1, col='#f4efe2'); ob_.rbox(sh.a('vc', lv(yy)), -0.152, 0.152, -0.004, 0.004, -0.102, 0.102, r=0.001, seg=1, col='#4a6c8c')
bk_ = Xf(0.6, 7.6, 0.4); bk_.rbox(sh.a('vcm'), -0.22, 0.22, 0.02, 0.26, -0.15, 0.15, r=0.02, col='#c4513e')
bk_.cyl(sh.a('vcm'), (-0.15, 0.26, 0), (0.15, 0.26, 0), 0.008, col='#2a2a2a', seg=5)

sh.tally('v1')
exec(open(os.path.join(HERE, 'shanlan_v2_fill.py'), encoding='utf-8').read())   # v2：一樓擺滿（另一個檔）
sh.tally('v2 fill')
exec(open(os.path.join(HERE, 'shanlan_v3_fill.py'), encoding='utf-8').read())   # v3：樓梯實木側板、天花板格樑＋嵌燈
exec(open(os.path.join(HERE, 'shanlan_v4_fill.py'), encoding='utf-8').read())   # v4：樓梯側板的嵌入式書架、樓梯旁西牆的書牆（§12 對參考圖）；木色 #c8955a → #c99f6e（LAWWW2 ref_match：太橘）
CK.drop_protos()
info = sh.finish(OUT, keep=lambda ob: 'S_ph_' in ob.name, extra_info={'layout': LAY['version'], 'seats': len(LAY['seats']), 'floorSit': len(LAY['floorSit']), 'cc0': [list(u) for u in CK.used()]})
print('CC0_USED', CK.used())
# 每層樓的三角形（L2_ 開頭＝二樓；WALL_ 是兩層共用的牆）
import json as _j
lv_tris = {'L1': 0, 'L2': 0, 'walls': 0}
for ob in bpy.data.objects:
    if ob.type != 'MESH' or ob.name == 'Plane': continue
    t = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    lv_tris['L2' if ob.name.startswith('L2_') or ob.get('level') == 1 else ('walls' if ob.name.startswith('WALL_') else 'L1')] += t
info['tris_by_level'] = lv_tris; L.write_json(OUT[:-4] + '.json', info); print(_j.dumps({'tris_by_level': lv_tris}))
