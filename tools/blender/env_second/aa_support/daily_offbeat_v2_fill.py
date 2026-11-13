"""日常失速 v2（AA 2026-11-03；對參考圖 daily_offbeat_ref_v2.webp 補：外露的工業天花板、黑色軌道燈、吧檯下的黃色燈條、長桌的雛菊和書、
更多垂吊植物）。不是單獨執行的腳本：daily_offbeat_interior.py 最後 exec 這個檔（共用 sh、K、Xf、IT、LAY、bf、lt…）。
配置（座位、互動點、導航阻擋）沒有動；椅子統一橘色、牆和天花板的顏色在主腳本頂端改。"""
R5 = random.Random(1103)
xf0 = Xf(0, 0)

# ---------------------------------------------------------------- 1. 外露天花板：第二條風管、黑色軌道燈
duct2 = sh.a('vcm'); dz2 = 2.6
Xf(0, 0).cyl(duct2, (X0 + 0.3, H - 0.28, dz2), (X1 - 1.2, H - 0.28, dz2), 0.13, col='#9a958c', seg=12)
for xx in (-3.0, 0.5, 3.0):
    Xf(0, 0).cyl(duct2, (xx, H, dz2), (xx, H - 0.14, dz2), 0.008, col='#3a3a3a', seg=4)
for (tz, xa, xb) in ((-0.9, -4.6, 4.6), (1.3, -4.6, 4.6)):                     # 兩條黑色軌道＋筒燈
    xf0.rbox(sh.a('vcm'), xa, xb, H - 0.06, H - 0.02, tz - 0.02, tz + 0.02, r=0.004, seg=1, col='#1e1e1e')
    for k in range(7):
        x = xa + 0.5 + k * (xb - xa - 1.0) / 6; sp = Xf(x, tz)
        sp.cyl(sh.a('vcm'), (0, H - 0.06, 0), (0, H - 0.14, 0), 0.008, col='#1e1e1e', seg=4, caps=False)
        sp.cyl(sh.a('vcm'), (0, H - 0.14, 0), (0.0, H - 0.3, 0.05), 0.035, col='#1e1e1e', seg=8)
        sh.a('bulb').cyl(sp.p(0.0, H - 0.3, 0.05), sp.p(0.0, H - 0.305, 0.052), 0.03, seg=8)
        if k % 2 == 0: CL.glow(sh.root, 'track', x, H - 0.4, tz + 0.1, color='rgba(255,214,160,1)', size=0.5, day=0.0, night=0.45)
sh.tally('v2 ceiling')

# ---------------------------------------------------------------- 2. 吧檯正面下緣的黃色燈條（參考圖：磁磚下面一道暖黃光）
bx0, bx1 = bf['x'] - bf['w'] / 2, bf['x'] + bf['w'] / 2; bz1 = bf['z'] + bf['d'] / 2
sh.a('bulb').box(bx0 + 0.05, bx1 - 0.05, bf['h'] - 0.07, bf['h'] - 0.055, bz1 + 0.035, bz1 + 0.045)
for xx in (bx0 + 0.8, bf['x'], bx1 - 0.8): CL.glow(sh.root, 'barled', xx, bf['h'] - 0.2, bz1 + 0.15, color='rgba(255,220,120,1)', size=0.9, day=0.25, night=0.6)
sh.tally('v2 bar led')

# ---------------------------------------------------------------- 3. 長桌：雛菊花瓶、書堆、綠色檯燈
tx, tz, th = lt['x'], lt['z'], 0.76
def daisies(x, z, y):
    Xf(x, z, 0, y).lathe(sh.a('glass'), [(0.0, 0.0), (0.05, 0.0), (0.055, 0.12), (0.03, 0.2), (0.035, 0.22)], 0, 0, 0, seg=10)
    for k in range(9):
        a = k * 0.7; r_ = 0.04 + (k % 3) * 0.035; fy = y + 0.3 + (k % 4) * 0.05
        fx, fz = x + math.cos(a) * r_, z + math.sin(a) * r_
        Xf(x, z).cyl(sh.a('vc'), (0, y + 0.18, 0), (fx - x, fy, fz - z), 0.003, col='#6a8a4a', seg=3, caps=False)
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, -0.006), (0.028, -0.003), (0.03, 0.0), (0.0, 0.004)], seg=7), '#f6f3ea'), Matrix.Translation(g2b(fx, fy, fz)))
        sh.a('vcg').add_bm(K.paint_bm(L.lathe([(0.0, 0.0), (0.009, 0.0), (0.0, 0.006)], seg=5), '#e8b830'), Matrix.Translation(g2b(fx, fy + 0.002, fz)))
daisies(tx - 0.9, tz + 0.05, th); daisies(tx + 0.75, tz - 0.08, th)
for (ox, n) in ((-0.3, 4), (0.35, 3)):
    for q in range(n): Xf(tx + ox, tz + 0.18, R5.uniform(-0.2, 0.2), th + q * 0.032).rbox(sh.a('vcg'), -0.12, 0.12, 0.0, 0.03, -0.085, 0.085, r=0.003, seg=1, col=R5.choice(['#c4513e', '#2f4a5a', '#e8dcc0', '#7d8f52', '#d9a441']))
lp = Xf(tx + 1.3, tz - 0.25)                                                   # 綠色檯燈（參考圖長桌中段）
lp.lathe(sh.a('vcm'), [(0.0, th), (0.07, th), (0.07, th + 0.02), (0.012, th + 0.03)], 0, 0, 0, seg=12, col='#2a2a2a')
lp.cyl(sh.a('vcm'), (0, th + 0.02, 0), (0, th + 0.38, 0), 0.008, col='#2a2a2a', seg=5)
lp.lathe(sh.a('vcg'), [(0.0, th + 0.42), (0.03, th + 0.42), (0.11, th + 0.32), (0.105, th + 0.31)], 0, 0, 0, seg=14, col='#3f6b4a')
sh.a('bulb').cyl(lp.p(0, th + 0.33, 0), lp.p(0, th + 0.31, 0), 0.04, seg=8)
CL.glow(sh.root, 'tablelamp', tx + 1.3, th + 0.2, tz - 0.25, color='rgba(255,210,150,1)', size=0.6, day=0.1, night=0.55)
sh.tally('v2 long table')

# ---------------------------------------------------------------- 4. 更多垂吊植物：長桌上方三個吊盆、吧檯上方兩個
for (px_, pz_) in ((tx - 1.3, tz - 0.6), (tx, tz + 0.7), (tx + 1.4, tz - 0.6), (bf['x'] - 1.6, bf['z'] - 0.4), (bf['x'] + 1.4, bf['z'] - 0.4)):
    Xf(px_, pz_).cyl(sh.a('vcm'), (0, H, 0), (0, 2.75, 0), 0.003, col='#2a2a2a', seg=3, caps=False)
    Xf(px_, pz_, 0, 2.6).lathe(sh.a('vcg'), [(0.05, 0.0), (0.11, 0.06), (0.12, 0.15), (0.11, 0.15)], 0, 0, 0, seg=12, col=R5.choice(['#e8dcc0', '#b0653e']))
    sh.hanging_pothos('pothos', px_, 2.72, pz_, n=7, drop=0.6)
sh.tally('v2 plants')
