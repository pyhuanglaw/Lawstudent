"""木曜日 v2：把店擺滿（AA 子代理 2026-11-03；使用者：第一版太空、太冷，缺參考圖那種擠滿東西的溫暖感）。
不是單獨執行的腳本：mokuyobi_interior.py 最後 exec 這個檔（共用 sh、K、Xf、wm、LAY…）。新加的家具都在 src/data/mokuyobi_layout.js 的 blocks（v2）。
  1. 窗下的矮書櫃（臨街整排）＋窗台上的小盆栽、書
  2. 樓梯間隔間牆前的高書櫃（參考圖：樓梯旁邊的書櫃）
  3. 北牆的格子展示櫃（參考圖：一格一格，時鐘、抽屜、相框、植物）
  4. 東牆北段的小展示櫃、東牆矮櫃上方的層板
  5. 西牆的照片牆、唱片櫃旁地上靠著的唱片
  6. 木樑上吊下來的黃金葛
  7. 每張桌子：杯子、書、玻璃杯裡的小蠟燭（暖光）；大書櫃頂上的書和籃子
"""
BOOKC = ['#7b2d26', '#2f4a3a', '#1f2e45', '#c9b48a', '#e8e0cc', '#8c3b47', '#3e5a48', '#d9a441', '#5c3a21', '#4a6c8c', '#efe6cf', '#b8462e']
R2 = random.Random(1103)


def lying_books(xf, x, z, y, n, w=0.24, d=0.17, lvl=''):
    """平放的一疊書（每本一個薄的倒角方塊、大小差一點、轉一點）"""
    yy = y
    for q in range(n):
        t = R2.uniform(0.025, 0.045); ww, dd = w * R2.uniform(0.85, 1.05), d * R2.uniform(0.85, 1.05)
        bx = Xf(*xf.p(x, 0, z)[::2], xf.ry + R2.uniform(-0.12, 0.12), yy)
        bx.rbox(sh.a('vcg', lvl), -ww / 2, ww / 2, 0.0, t, -dd / 2, dd / 2, r=0.003, col=R2.choice(BOOKC)); yy += t
    return yy


def candle(x, z, y):
    """玻璃杯裡的小蠟燭：玻璃（glass）＋發光的燭芯（燈罩材質）＋小光暈"""
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.028, 0.0), (0.03, 0.07), (0.028, 0.07)], 0, 0, 0, seg=12)
    Xf(x, z, 0, y).lathe(sh.a('vcg'), [(0.0, 0.0), (0.025, 0.0), (0.025, 0.03), (0.0, 0.03)], 0, 0, 0, seg=10, col='#f2ead8')
    sh.a('shade').sphere((x, y + 0.045, z), 0.009, seg=6, rings=4)
    CL.glow(sh.root, 'candle', x, y + 0.05, z, color='rgba(255,190,110,1)', size=0.3, day=0.3, night=1.0)


def frame(side, along, cy, w, h, cell, col='#3a2a1e'):
    """牆上的小相框（框＋畫）"""
    sh.wall_img(side, 'print', along, cy, w - 0.06, h - 0.06, K.cell_uv(*cell), off=0.026)
    if side in ('left', 'right'):
        x0_ = X0 if side == 'left' else X1 - 0.022
        Xf(0, 0).rbox(sh.w(side, 'vc'), x0_, x0_ + 0.022, cy - h / 2, cy + h / 2, along - w / 2, along + w / 2, r=0.004, col=col)
    else:
        Xf(0, 0).rbox(sh.w(side, 'vc'), along - w / 2, along + w / 2, cy - h / 2, cy + h / 2, Z0, Z0 + 0.022, r=0.004, col=col)


def case(cx, cz, ry, w, h, d, cols, levels, cell_fn, top=True):
    """胡桃木的開放櫃：背板、側板、隔板、頂板；cell_fn(xf, k, j, u0, u1, y, y_next) 擺每一格"""
    xf = Xf(cx, cz, ry)
    xf.rbox(wm, -w / 2, w / 2, 0.0, h, -d / 2, -d / 2 + 0.02, r=0.004)
    for k in range(cols + 1): u = -w / 2 + k * w / cols; xf.rbox(wm, u - 0.018, u + 0.018, 0.0, h, -d / 2, d / 2, r=0.005)
    xf.rbox(wm, -w / 2, w / 2, 0.0, levels[0], -d / 2, d / 2 - 0.015, r=0.005)
    if top: xf.rbox(wm, -w / 2 - 0.025, w / 2 + 0.025, h, h + 0.05, -d / 2, d / 2 + 0.025, r=0.01)
    for y in levels[1:]: xf.rbox(wm, -w / 2, w / 2, y - 0.022, y, -d / 2, d / 2, r=0.004)
    ys = list(levels) + [h]
    for k in range(cols):
        u0, u1 = -w / 2 + k * w / cols + 0.02, -w / 2 + (k + 1) * w / cols - 0.02
        for j in range(len(levels)): cell_fn(xf, k, j, u0, u1, ys[j], ys[j + 1] - 0.022)
    return xf


def books_in(xf, u0, u1, y, y1, d):
    """一格塞滿書（書背圖集；格子矮的書就矮一點）"""
    K.book_rows(sh, 'books', xf, u0, u1, y, d / 2 - 0.03, hgt=min(0.3, y1 - y - 0.03), depth=d - 0.08, rng=R2)


def small_plant_at(xf, u, y, z=0.0, h=0.3, r=0.07, col='#e8dcc0'):
    sh.plant(*xf.p(u, 0, z)[::2], h=h, r=r, pot_col=col, y0=y)


def clock(xf, u, y, z=0.0):
    c = Xf(*xf.p(u, 0, z)[::2], xf.ry)   # 立著的圓鐘：旋轉體繞 x 轉 90°（面朝物件的 +z）
    sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.025), (0.075, -0.025), (0.08, 0.0), (0.075, 0.025), (0.0, 0.025)], seg=16), '#b8944a'), c.M(0, y + 0.1, 0.0) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
    c.rbox(sh.a('vc'), -0.03, 0.03, y, y + 0.02, -0.03, 0.03, r=0.004, col='#5a3a24')
    sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, 0.0), (0.068, 0.0), (0.068, 0.004), (0.0, 0.004)], seg=16), '#f4eedf'), c.M(0, y + 0.1, 0.027) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
    c.rbox(sh.a('vc'), -0.004, 0.004, y + 0.1, y + 0.15, 0.031, 0.034, r=0.001, col='#2a2a2a'); c.rbox(sh.a('vc'), 0.0, 0.035, y + 0.098, y + 0.104, 0.031, 0.034, r=0.001, col='#2a2a2a')


# ---------------------------------------------------------------- 1. 窗下的矮書櫃（窗台 0.75 以下；紗簾下緣 0.62，櫃子做到 0.58）
wa, wb = fr['windows'][0]
ub = Xf((wa + wb) / 2, Z1 - 0.17, math.pi)   # 正面朝店裡（−z）
ulen = (wb - 0.1) - (wa + 0.1)
ub.rbox(wm, -ulen / 2, ulen / 2, 0.0, 0.58, -0.15, -0.13, r=0.003)
for k in range(8):
    u = -ulen / 2 + k * ulen / 7; ub.rbox(wm, u - 0.018, u + 0.018, 0.0, 0.58, -0.15, 0.15, r=0.004)
ub.rbox(wm, -ulen / 2 - 0.02, ulen / 2 + 0.02, 0.56, 0.6, -0.15, 0.16, r=0.008)
ub.rbox(wm, -ulen / 2, ulen / 2, 0.0, 0.05, -0.15, 0.14, r=0.004)
ub.rbox(wm, -ulen / 2, ulen / 2, 0.3, 0.322, -0.15, 0.15, r=0.003)
for k in range(7):
    u0, u1 = -ulen / 2 + k * ulen / 7 + 0.02, -ulen / 2 + (k + 1) * ulen / 7 - 0.02
    for y in (0.05, 0.322):
        if (k, y) in ((2, 0.322), (5, 0.05)):   # 兩格放平放的書、一格放一盆小植物
            lying_books(ub, (u0 + u1) / 2 - 0.12, 0.0, y, 4); K.book_rows(sh, 'books', ub, (u0 + u1) / 2 + 0.05, u1, y, 0.12, hgt=0.22, depth=0.2, rng=R2); continue
        K.book_rows(sh, 'books', ub, u0, u1, y, 0.12, hgt=0.22, depth=0.2, rng=R2)
# 窗台上：小盆栽、一疊書、玻璃罐（避開紗簾 x −2.75～−2.15、0.55～1.05、3.75～4.35）
for (x, c) in ((-1.6, '#b0653e'), (1.5, '#e8dcc0')): sh.plant(x, Z1 - 0.11, h=0.3, r=0.065, pot_col=c, y0=fr['sill'])
for x in (-0.45, 1.9): lying_books(xf0, x, Z1 - 0.11, fr['sill'], 3, w=0.2, d=0.15)
K.jar(sh, -1.1, Z1 - 0.1, fr['sill'], h=0.14, r=0.045, col='#d8c49a', lid='#6a4630')
sh.tally('v2 window shelf')

# ---------------------------------------------------------------- 2. 樓梯間隔間牆前的高書櫃（x −2.9、z 4.1～6.5，面向東）
def stair_cell(xf, k, j, u0, u1, y, y1):
    if (k, j) == (1, 4): small_plant_at(xf, (u0 + u1) / 2, y, 0.0, h=0.3); return
    if (k, j) == (0, 2): lying_books(xf, u0 + 0.16, 0.0, y, 5); K.book_rows(sh, 'books', xf, u0 + 0.32, u1, y, 0.13, hgt=min(0.3, y1 - y - 0.03), depth=0.24, rng=R2); return
    if (k, j) == (2, 3): clock(xf, (u0 + u1) / 2 - 0.12, y); K.book_rows(sh, 'books', xf, (u0 + u1) / 2 + 0.02, u1, y, 0.13, hgt=0.28, depth=0.24, rng=R2); return
    books_in(xf, u0, u1, y, y1, 0.34)
_SB = [i for i in LAY['items'] if i['kind'] == 'stair_bookcase'][0]   # v3：矮櫃（h 0.9），海報掛在上方的隔間牆
sc = case(SW['x1'] + 0.1 + 0.17, 5.3, math.pi / 2, 2.4, _SB['h'], 0.34, 3, [0.08, 0.48], stair_cell)
lying_books(Xf(SW['x1'] + 0.27, 4.6, math.pi / 2), 0.0, 0.0, _SB['h'] + 0.05, 5, w=0.28, d=0.2); small_plant_at(Xf(SW['x1'] + 0.27, 6.2, math.pi / 2), 0.0, _SB['h'] + 0.05, h=0.3)
sh.tally('v2 stair bookcase')

# ---------------------------------------------------------------- 3. 北牆的格子展示櫃（x −0.5～1.3）
def disp_cell(xf, k, j, u0, u1, y, y1):
    mid = (u0 + u1) / 2
    if j == 0:   # 最下面一排：抽屜（黃銅把手）
        xf.rbox(sh.a('vc'), u0 + 0.005, u1 - 0.005, y + 0.01, y1 - 0.01, 0.15, 0.165, r=0.004, col='#6a4630')
        xf.cyl(sh.a('vcm'), (mid, (y + y1) / 2, 0.165), (mid, (y + y1) / 2, 0.185), 0.011, col='#b8944a', seg=8); return
    kind = {(0, 1): 'books', (1, 1): 'plant', (2, 1): 'books', (0, 2): 'clock', (1, 2): 'books', (2, 2): 'frame', (0, 3): 'books', (1, 3): 'stack',
            (2, 3): 'books', (0, 4): 'plant', (1, 4): 'jar', (2, 4): 'books'}.get((k, j), 'books')
    if kind == 'books': books_in(xf, u0, u1, y, y1, 0.38)
    elif kind == 'plant': small_plant_at(xf, mid, y, 0.02, h=0.28, r=0.065)
    elif kind == 'clock': clock(xf, mid, y, 0.02); lying_books(xf, mid + 0.16, 0.0, y, 2, w=0.12, d=0.16)
    elif kind == 'frame':
        fx = Xf(*xf.p(mid, 0, -0.08)[::2], xf.ry); fx.rbox(sh.a('vc'), -0.12, 0.12, y, y + 0.3, -0.012, 0.0, r=0.004, col='#3a2a1e')
        sh.img_quad(sh.a('print'), fx, 0, y + 0.03, 0.002, 0.18, 0.24, K.cell_uv(6, 1))
    elif kind == 'stack': lying_books(xf, mid, 0.0, y, 6, w=0.26, d=0.19)
    else: K.jar(sh, *xf.p(mid - 0.08, 0, 0.0)[::2], y, h=0.18, r=0.055, col='#c9a26a', lid='#3a2a1e'); K.mug(sh, *xf.p(mid + 0.1, 0, 0.02)[::2], y, col='#e8dcc0')
dc = case(0.4, Z0 + 0.19, 0.0, 1.8, 2.3, 0.38, 3, [0.08, 0.45, 0.85, 1.25, 1.65, 2.0], disp_cell)
sh.plant(0.4 - 0.5, Z0 + 0.19, h=0.35, r=0.08, pot_col='#b0653e', y0=2.35); lying_books(dc, 0.35, 0.0, 2.35, 4, w=0.3, d=0.22)
sh.hanging_pothos('pothos', -0.1, 2.5, Z0 + 0.25, n=8, drop=0.7)
sh.tally('v2 display case')

# ---------------------------------------------------------------- 4. 東牆北段的小展示櫃（z 3.6～5.0）、矮櫃上方的層板
def east_cell(xf, k, j, u0, u1, y, y1):
    mid = (u0 + u1) / 2
    if j == 0: xf.rbox(sh.a('vc'), u0 + 0.005, u1 - 0.005, y + 0.01, y1 - 0.01, 0.15, 0.165, r=0.004, col='#6a4630'); xf.cyl(sh.a('vcm'), (mid, (y + y1) / 2, 0.165), (mid, (y + y1) / 2, 0.185), 0.011, col='#b8944a', seg=8); return
    if j == 1:   # 一排杯子
        for q in range(3): K.mug(sh, *xf.p(u0 + 0.1 + q * 0.18, 0, 0.0)[::2], y, col=('#f2efe8', '#c9b48a', '#8a6a4a')[(q + k) % 3])
        return
    if (k, j) == (1, 3): small_plant_at(xf, mid, y, h=0.3); return
    if (k, j) == (0, 3): lying_books(xf, mid, 0.0, y, 5); return
    books_in(xf, u0, u1, y, y1, 0.38)
_EB = [i for i in LAY['items'] if i['kind'] == 'bookcase_east'][0]   # v3：東牆的高書櫃（參考圖左牆那座）
ec = case(X1 - 0.19, _EB['z'], -math.pi / 2, _EB['w'], _EB['h'], 0.38, 2, [0.08, 0.48, 0.88, 1.28, 1.68, 2.02], east_cell)
C.ph_put(sh, 'planter_pot_clay', X1 - 0.2, _EB['h'] + 0.05, _EB['z'] + 0.4, yaw=1.1, height=0.14, decimate=0.25); C.ph_put(sh, 'fern_02', X1 - 0.2, _EB['h'] + 0.15, _EB['z'] + 0.4, yaw=0.3, s=0.9, part=0, tag='_p0', decimate=0.6)   # mokuyobi v2.2（LAWWW2-C 11-14 P2）：書櫃頂的盆＋垂藤葉片卡 → Poly Haven 陶盆＋蕨類
C.ph_put(sh, 'planter_pot_clay', X1 - 0.2, _EB['h'] + 0.05, _EB['z'] - 0.45, yaw=2.6, height=0.12, decimate=0.25); C.ph_put(sh, 'fern_02', X1 - 0.2, _EB['h'] + 0.13, _EB['z'] - 0.45, yaw=4.0, s=0.8, part=3, tag='_p3', decimate=0.6)
es = Xf(X1 - 0.11, -1.0, -math.pi / 2)                                                                                 # 矮櫃上方的層板（z −1.95～−0.05、y 1.5）
es.rbox(sh.w('right', 'walnut'), -0.95, 0.95, 1.47, 1.5, -0.11, 0.11, r=0.004)
for u in (-0.75, 0.75): es.rbox(sh.w('right', 'vcm'), u - 0.012, u + 0.012, 1.3, 1.47, -0.11, -0.09, r=0.002, col='#2a2a2a')
lying_books(es, -0.6, 0.0, 1.5, 3, w=0.2, d=0.15); K.book_rows(sh, 'books', es, -0.4, 0.15, 1.5, 0.08, hgt=0.24, depth=0.16, rng=R2)
_px, _, _pz = es.p(0.4, 0, 0); C.ph_put(sh, 'planter_pot_clay', _px, 1.5, _pz, yaw=0.4, height=0.12, decimate=0.25); C.ph_put(sh, 'fern_02', _px, 1.58, _pz, yaw=2.2, s=0.75, part=3, tag='_p3', decimate=0.6)   # mokuyobi v2.2（LAWWW2-C 11-14 P2）：程式畫的盆＋黃金葛葉片卡 → Poly Haven 陶盆＋蕨類
K.jar(sh, *es.p(0.75, 0, 0.0)[::2], 1.5, h=0.12, r=0.04, col='#e8dcc0', lid='#6a4630')
sh.tally('v2 east')

# ---------------------------------------------------------------- 5. 西牆的照片牆（唱片櫃上方）、地上靠著的唱片
for (zz, y, w, h, cell) in ((-3.62, 1.55, 0.34, 0.42, (6, 1)), (-2.0, 1.62, 0.36, 0.36, (7, 1)), (-3.5, 2.2, 0.3, 0.3, (5, 0)), (-2.15, 2.22, 0.28, 0.24, (7, 0)), (-2.8, 2.35, 0.22, 0.22, (6, 0))):
    frame('left', zz, y, w, h, cell)
frame('back', -4.2 + 0.4, 2.2, 0.3, 0.3, (4, 0))
for q in range(4):
    lx = Xf(X0 + 0.1 + q * 0.03, -3.75 + q * 0.02, math.pi / 2)
    sh.img_quad(sh.a('print'), lx, 0, 0.0, 0.0, 0.31, 0.31, K.cell_uv(4 + q, 0), tilt=-0.22 + q * 0.04)
sh.tally('v2 gallery')

# ---------------------------------------------------------------- 6. 木樑上吊下來的黃金葛（陶盆＋三條細繩）
for (x, zz) in ((3.75, 1.2), (1.8, 3.6), (3.1, -3.4), (-1.4, -3.4), (-2.1, 5.2)):   # mokuyobi v2.1（LAWWW2-C 11-13 P2）：(−1.3, 1.2) 那盆的藤垂下來貼在店門鏡頭右上角 → 搬到 (1.8, 3.6)（窗邊，店門鏡頭的畫面外）   # 不放在走道正中間（離鏡頭近的時候像一團）
    py = 2.22; hx = Xf(x, zz, 0, py)
    hx.lathe(sh.a('vcg'), [(0.05, 0.0), (0.09, 0.03), (0.12, 0.12), (0.125, 0.15), (0.115, 0.15)], 0, 0, 0, seg=14, col=R2.choice(['#b0653e', '#e8dcc0', '#c98a5a']))
    for a in range(3): t = a * 2.094; hx.cyl(sh.a('vc'), (math.cos(t) * 0.12, 0.15, math.sin(t) * 0.12), (0, H - 0.2 - py, 0), 0.003, col='#c9b48a', seg=3, caps=False)
    sh.hanging_pothos('pothos', x, py + 0.16, zz, n=9, drop=0.5, size=0.11)   # 小一點的葉子（0.16 的卡片從近看像紙片）
    for k in range(5): a = k * 1.26; CL.card(sh.a('pothos'), x + math.cos(a) * 0.1, py + 0.2, zz + math.sin(a) * 0.1, 0.12, 0.12, ry=a, rx=0.7, uv=CL.rand_uv(0.5))
sh.tally('v2 hanging')

# ---------------------------------------------------------------- 7. 桌上：小蠟燭、杯子、書；大書櫃頂上的書、籃子
tabs2 = {}
for s_ in LAY['seats']:
    if s_['table'] <= 6 or s_['table'] == 9: tabs2.setdefault(s_['table'], []).append(s_)
for t, ss in sorted(tabs2.items()):
    tx = sum(s_['x'] for s_ in ss) / 2; tz = sum(s_['z'] for s_ in ss) / 2
    candle(tx - 0.12 if t not in (1, 2) else tx + 0.15, tz + 0.12 if t not in (1, 2) else tz + 0.15, 0.74)
    if t in (2, 5, 9):
        K.mug(sh, tx - 0.14, tz - 0.08, 0.74, col='#e8e0cc', r=0.045, h=0.07); K.plate(sh, tx - 0.14, tz - 0.08, 0.74, r=0.075)
        K.mug(sh, tx + 0.14, tz - 0.05, 0.74, col='#c9b48a', r=0.045, h=0.07)
    if t in (3, 4, 6): K.mug(sh, tx - 0.2, tz + 0.18, 0.74, col=R2.choice(['#e8e0cc', '#8a6a4a']))
    if t == 2:   # 小花瓶
        Xf(tx, tz + 0.18, 0, 0.74).lathe(sh.a('glass'), [(0.0, 0.0), (0.03, 0.0), (0.035, 0.05), (0.015, 0.1)], 0, 0, 0, seg=10)
        for j in range(6):
            a = R2.uniform(0, 6.28); r_ = R2.uniform(0.01, 0.05); fy = 0.86 + R2.uniform(0.02, 0.08)
            Xf(tx, tz + 0.18).cyl(sh.a('vc'), (0, 0.82, 0), (math.cos(a) * r_, fy, math.sin(a) * r_), 0.0015, col='#6a8a4a', seg=3, caps=False)
            sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.006), (0.01, -0.003), (0.011, 0.0), (0.0, 0.003)], seg=5), '#f6f2e6'), Matrix.Translation(g2b(tx + math.cos(a) * r_, fy, tz + 0.18 + math.sin(a) * r_)))
    if t in (5, 9): lying_books(xf0, tx + 0.05, tz + 0.15, 0.74, 2, w=0.2, d=0.15)
    if t == 9:   # 巴斯克
        K.plate(sh, tx + 0.14, tz + 0.12, 0.74, r=0.08); Xf(tx + 0.14, tz + 0.12, 0.4, 0.75).rbox(sh.a('vcg'), -0.045, 0.045, 0.0, 0.05, -0.035, 0.035, r=0.008, col='#d9a65a')
K.dome_pendant(sh, 0.45, -1.9, 2.05, r=0.19, kind='scallop', glow_size=0.55)
m = sh.a('print'); xf0.quad(m, [(0.45 - 1.0, 0.006, -1.9 + 0.9), (0.45 + 1.0, 0.006, -1.9 + 0.9), (0.45 + 1.0, 0.006, -1.9 - 0.9), (0.45 - 1.0, 0.006, -1.9 - 0.9)], uv=K.cell_uv(0, 4, 4, 2))   # 第三塊地毯
bct = Xf(bc['x'], bc['z'], bc['ry'], 0.0)   # 大書櫃頂上（y 2.51）：平放的書、一個藤籃
for u in (-0.9, 0.3, 1.5): lying_books(bct, u, 0.0, bh + 0.06, R2.randint(3, 5), w=0.3, d=0.22)
Xf(*bct.p(-0.3, 0, 0.0)[::2], 0, bh + 0.06).lathe(sh.a('vc'), [(0.0, 0.0), (0.15, 0.0), (0.18, 0.18), (0.17, 0.18), (0.14, 0.02), (0.0, 0.02)], 0, 0, 0, seg=14, col='#b89a6a')
sh.plant(4.1, -3.5, h=0.95, r=0.2, pot_col='#b0653e')   # 東牆的第四盆大盆栽
