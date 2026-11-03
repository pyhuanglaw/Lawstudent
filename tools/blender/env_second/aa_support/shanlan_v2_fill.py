"""山嵐書店 v2：一樓擺滿、多一點植物和暖光（AA 子代理 2026-11-03；使用者：一樓偏白、亮過頭，書擺得少）。
不是單獨執行的腳本：shanlan_interior.py 最後 exec 這個檔（共用 sh、K、Xf、stack、IT、LAY…）。新加的大盆栽在 src/data/shanlan_layout.js 的 blocks（v2）。
  1. 雜誌牆：最下面一層平放的雜誌堆、頂上植物
  2. 文具桌：筆記本堆、一排紙膠帶、明信片立架；文具架頂上植物
  3. 書架頂上垂下來的黃金葛（參考圖：左邊書架上面一整排）、書架頂板下的暖色燈條
  4. 一樓多三盆大盆栽、平台上的小盆栽
  5. 櫃檯、長椅上的生活痕跡
"""
R3 = random.Random(2203)
MAGCU = lambda k: (k / 16 + 0.002, 1 - 384 / 1024 + 0.002, (k + 1) / 16 - 0.002, 1 - 256 / 1024 - 0.002)   # 雜誌封面（第 2 列）
NOTECU = lambda k: (0.5 + k / 16 + 0.002, 1 - 768 / 1024 + 0.002, 0.5 + (k + 1) / 16 - 0.002, 1 - 640 / 1024 - 0.002)   # 筆記本封面

# ---------------------------------------------------------------- 1. 雜誌牆
u = -mw / 2 + 0.14
while u < mw / 2 - 0.12:
    stack(mxf, u, 0.17, 0.02, R3.randint(3, 6), 0.21, 0.27, cu=MAGCU(R3.randrange(16)), th=0.012, ry=R3.uniform(-0.06, 0.06)); u += 0.27
for (u_, h_) in ((-1.5, 0.35), (0.6, 0.3), (1.7, 0.4)):
    px_, _, pz_ = mxf.p(u_, 0, 0.18); sh.plant(px_, pz_, h=h_, r=0.08, pot_col='#e8e4dc', y0=2.64)
    sh.hanging_pothos('pothos', px_ - 0.05, 2.72, pz_, n=6, drop=0.7)
sh.tally('v2 magazines')

# ---------------------------------------------------------------- 2. 文具桌、文具架
for st in IT['stationery']:
    sx_, sz_ = st['x'], st['z']; t_ = Xf(sx_, sz_, 0.0)
    for q in range(3): stack(t_, 0.1 + q * 0.2, -0.2, 0.82, R3.randint(3, 7), 0.15, 0.21, cu=NOTECU(R3.randrange(8)), th=0.012, ry=R3.uniform(-0.1, 0.1))
    for q in range(7):   # 一排立著的紙膠帶
        Xf(sx_ - 0.6 + q * 0.065, sz_ + 0.3, 0.0, 0.82).lathe(sh.a('vcg'), [(0.014, 0.0), (0.03, 0.0), (0.032, 0.01), (0.032, 0.05), (0.03, 0.06), (0.014, 0.06)], 0, 0, 0, seg=10, col=R3.choice(['#e8b4a0', '#a8c8d8', '#f0d890', '#b8d0a0', '#d8b8d8', '#f4f1ea', '#c9a27a']))
    ps = Xf(sx_ + 0.6, sz_ + 0.25, 0.3, 0.82)   # 明信片的小立架（木座＋斜靠的四張）
    ps.rbox(sh.a('wood'), -0.12, 0.12, 0.0, 0.03, -0.06, 0.06, r=0.006)
    for q in range(4): sh.img_quad(sh.a('print'), ps, -0.09 + q * 0.06, 0.03, -0.02 + q * 0.01, 0.1, 0.14, (0.5 + q / 16 + 0.002, 1 - 640 / 1024 + 0.002, 0.5 + (q + 1) / 16 - 0.002, 1 - 512 / 1024 - 0.002), tilt=0.25)
for (zz, h_) in ((4.6, 0.35), (7.6, 0.3)):
    sh.plant(X1 - 0.17, zz, h=h_, r=0.08, pot_col='#d8d0c0', y0=2.0); sh.hanging_pothos('pothos', X1 - 0.2, 2.08, zz, n=5, drop=0.6)
sh.tally('v2 stationery')

# ---------------------------------------------------------------- 3. 書架頂上垂下來的黃金葛、頂板下的暖色燈條
for x in (-5.8, -3.9, -1.2, 1.6, 4.4):
    sh.plant(x, Z0 + 0.2, h=0.3, r=0.08, pot_col='#e8e4dc', y0=2.6); sh.hanging_pothos('pothos', x, 2.68, Z0 + 0.36, n=7, drop=0.8)
for zz in (-7.2, -4.6, -2.0):
    sh.plant(X0 + 0.2, zz, h=0.3, r=0.08, pot_col='#e8e4dc', y0=2.6); sh.hanging_pothos('pothos', X0 + 0.36, 2.68, zz, n=6, drop=0.7)
sb = sh.a('bulb')
sb.box(X0 + 0.45, X1 - 0.45, 2.54, 2.555, Z0 + 0.36, Z0 + 0.39)                 # 後牆書架（一樓）
sb.box(X0 + 0.36, X0 + 0.39, 2.54, 2.555, Z0 + 0.45, 0.4)                      # 西牆書架
for isl in IT['island']:
    for sgn in (-1, 1): sb.box(isl['x'] - isl['w'] / 2 + 0.05, isl['x'] + isl['w'] / 2 - 0.05, isl['h'] - 0.07, isl['h'] - 0.055, isl['z'] + sgn * (isl['d'] / 2 - 0.03) - 0.015, isl['z'] + sgn * (isl['d'] / 2 - 0.03) + 0.015)
for zz in (-7.6, -5.0, -2.2): CL.glow(sh.root, 'shelfstrip', 0.0, 2.45, zz if zz != -7.6 else Z0 + 0.6, color='rgba(255,200,130,1)', size=0.8, day=0.0, night=0.6)
sh.tally('v2 shelf tops')

# ---------------------------------------------------------------- 4. 大盆栽、平台上的小盆栽
for (x, z, h_) in ((3.9, 8.5, 1.3), (6.25, 4.45, 1.1), (-4.6, 1.3, 1.2)):
    sh.plant(x, z, h=h_, r=0.22, pot_col=R3.choice(['#e8e4dc', '#d8d0c0', '#b0653e']))
for it in IT['platform'][1:]:
    sh.plant(it['x'] - it['w'] / 2 + 0.25, it['z'], h=0.3, r=0.07, pot_col='#e8e4dc', y0=it['h'])
sh.tally('v2 plants')

# ---------------------------------------------------------------- 5. 櫃檯、長椅
ct_ = Xf(ca['x'], ca['z'], -math.pi / 2, 0.0)
for q in range(3): stack(ct_, -0.9 + q * 0.25, 0.1, ca['h'], R3.randint(2, 4), 0.16, 0.22)
sh.plant(ca['x'], ca['z'] - 1.25, h=0.3, r=0.07, pot_col='#d8d0c0', y0=ca['h'])
K.table_lamp(sh, ca['x'] + 0.1, ca['z'] + 1.2, y=ca['h'], r=0.11)
bn = IT['bench'][0]
for (x, c) in ((bn['x'] - 1.1, '#c9b48a'), (bn['x'] + 0.9, '#9fb49a')): Xf(x, Z1 - 0.3, 0, 0.47).lathe(sh.a('vc'), [(0.0, 0.0), (0.18, 0.0), (0.2, 0.04), (0.16, 0.08), (0.0, 0.09)], 0, 0, 0, seg=12, col=c)
stack(Xf(bn['x'] + 0.2, Z1 - 0.28, 0.3, 0.0), 0, 0, 0.47, 3, 0.15, 0.21)
tb = Xf(bn['x'] - 1.8, Z1 - 0.7, 0.4)   # 長椅旁邊地上的帆布袋
tb.rbox(sh.a('vc'), -0.17, 0.17, 0.0, 0.34, -0.05, 0.05, r=0.03, col='#e0d4b8')
for sx_ in (-0.1, 0.1): tb.cyl(sh.a('vc'), (sx_, 0.34, 0), (0.0, 0.5, 0.0), 0.008, col='#e0d4b8', seg=4, caps=False)
