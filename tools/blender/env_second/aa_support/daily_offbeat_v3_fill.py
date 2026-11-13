"""日常失速 v3（AA 2026-11-03；LAWWW2 照 SCENE_RULES §12 退回的五點）。不是單獨執行的腳本：daily_offbeat_interior.py 在 v2 之後 exec 這個檔。
  1. 前窗改落地窗（layout v2：窗台 0.05、窗頂 3.15）；外面一條綠色波浪邊遮雨棚（陽光從前窗、東窗斜進來時有遮雨棚的影子）；窗外的樹（窗景卡，借木曜日的 mok_view.png）
  2. 東牆整面社團佈告欄（corkboard_east）：標題牌、22 種傳單共 34 張（大小、顏色不一、互相疊、歪一點）、便利貼
  3. 地磚縮小、降飽和（aa_int_tex.py dof；主腳本 tile 0.6 → 0.5，一格 0.25 m）；地上多三盆植物
  4. 牆 #f1dfb8（主腳本）
  5. 前景那桌（v3b 改 table 10，東窗邊）：磨石子桌面、冰拿鐵、檸檬冰美式（吸管）、肉桂捲、明太子厚片、雛菊玻璃瓶
"""
R7 = random.Random(1105)

# ---------------------------------------------------------------- 1. 窗景卡（前窗、東窗；雙面材質，自訂屬性 windowView）
vz = Z1 + 2.5; vw = Mesh('WALL_front_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vw, [(7.0, 5.5, vz), (-7.0, 5.5, vz), (-7.0, -1.0, vz), (7.0, -1.0, vz)], uv=(1.0, 1.0, 0.0, 0.0))
vw.finish(sh.root, uv=False, props={'dir': K.DIRS['front'], 'windowView': True})
vx = X1 + 2.5; vr = Mesh('WALL_right_VIEW_' + P + 'window_view', sh.M['view'])
xf0.quad(vr, [(vx, 5.5, -7.0), (vx, 5.5, 7.0), (vx, -1.0, 7.0), (vx, -1.0, -7.0)], uv=(1.0, 1.0, 0.0, 0.0))
vr.finish(sh.root, uv=False, props={'dir': K.DIRS['right'], 'windowView': True})

# 遮雨棚（店外、前窗上方；併在 WALL_front：鏡頭在臨街那一側時一起淡出）
aw = sh.w('front', 'vc'); ax0, ax1 = fr['windows'][0][0] - 0.3, X1 + 0.05; AG = '#4f6b45'
abm = bmesh.new(); nseg = 1; rows = []   # 頂點色材質是雙面的
for (yy, zz) in ((3.36, Z1 + 0.06), (2.92, Z1 + 1.35)):
    rows.append([abm.verts.new(g2b(ax0 + (ax1 - ax0) * i / nseg, yy, zz)) for i in range(nseg + 1)])
for i in range(nseg):
    abm.faces.new((rows[0][i], rows[0][i + 1], rows[1][i + 1], rows[1][i]))
abm.normal_update(); K.paint_bm(abm, AG); aw.add_bm(abm); abm.free()
nsc = 16; sw_ = (ax1 - ax0) / nsc                                                                   # 波浪邊的垂簾
for k in range(nsc):
    a0 = ax0 + k * sw_; vb = bmesh.new(); top = []; bot = []
    for j in range(7):
        u = a0 + sw_ * j / 6; top.append(vb.verts.new(g2b(u, 2.92, Z1 + 1.36)))
        bot.append(vb.verts.new(g2b(u, 2.92 - 0.12 - 0.1 * math.sin(math.pi * j / 6), Z1 + 1.36)))
    for j in range(6):
        vb.faces.new((top[j], top[j + 1], bot[j + 1], bot[j]))
    vb.normal_update(); K.paint_bm(vb, AG if k % 2 else '#5a7850'); aw.add_bm(vb); vb.free()
sh.tally('v3 view+awning')

# ---------------------------------------------------------------- 2. 東牆佈告欄
cbe = IT['corkboard_east'][0]; cz, cy, cw, chh = cbe['z'], cbe['y'], cbe['w'], cbe['h']
sh.wall_img('right', 'print', cz, cy, cw, chh, K.cell_uv(2, 4, 2, 2), off=0.02)
Xf(0, 0).rbox(sh.w('right', 'wood'), X1 - 0.03, X1, cy - chh / 2 - 0.05, cy + chh / 2 + 0.05, cz - cw / 2 - 0.05, cz + cw / 2 + 0.05, r=0.006)
sh.wall_img('right', 'print', cz, cy + chh / 2 - 0.2, 1.5, 0.36, K.cell_uv(0, 5, 2, 1), off=0.03)     # 標題牌「首都帝大學生社團＆活動」
CELLS = [(6, 0), (7, 0), (6, 1), (7, 1), (6, 2), (7, 2)] + [(c, r) for r in (6, 7) for c in range(8)]   # 22 種
fl = sh.w('right', 'print'); wxf = Xf(X1, cz, -math.pi / 2)   # 局部 x 沿著牆（往 −z）、+z 朝店裡
n = 0
for row in range(4):
    for col in range(12):
        if n >= 44: break
        if row == 0 and 4 <= col <= 7: continue                    # 標題牌下面那一段空著
        u = -cw / 2 + 0.2 + col * (cw - 0.4) / 11 + R7.uniform(-0.06, 0.06)
        v = cy + chh / 2 - 0.26 - row * 0.32 + R7.uniform(-0.05, 0.05)
        w = R7.uniform(0.27, 0.42); h = w * R7.choice((1.0, 1.25, 1.4)); rot = R7.uniform(-0.12, 0.12)
        cu = K.cell_uv(*CELLS[(n * 7) % len(CELLS)]); c_, s_ = math.cos(rot), math.sin(rot)
        pts = [(u + c_ * px - s_ * py, v + s_ * px + c_ * py, 0.028 + n * 0.0012) for (px, py) in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
        wxf.quad(fl, pts, uv=cu); n += 1
for k in range(8):                                                                                   # 便利貼
    q = k % 4; u0, v0, u1, v1 = K.cell_uv(1, 2); hu, hv = (u1 - u0) / 2, (v1 - v0) / 2
    uu = (u0 + (q % 2) * hu, v1 - (q // 2 + 1) * hv, u0 + (q % 2 + 1) * hu, v1 - (q // 2) * hv)
    u = -cw / 2 + 0.3 + k * (cw - 0.6) / 7 + R7.uniform(-0.05, 0.05); v = cy - chh / 2 + 0.12 + R7.uniform(0, 0.08)
    wxf.quad(fl, [(u - 0.05, v - 0.05, 0.08), (u + 0.05, v - 0.05, 0.08), (u + 0.05, v + 0.05, 0.08), (u - 0.05, v + 0.05, 0.08)], uv=uu)
print('v3 flyers', n)
sh.tally('v3 corkboard')

# ---------------------------------------------------------------- 3. 地上多三盆植物（蓋掉一點地板）
sh.plant(X1 - 0.3, 0.45, h=1.0, r=0.2, pot_col='#e8dcc0')          # 東窗和佈告欄之間
sh.plant(-2.55, Z1 - 0.35, h=0.9, r=0.18, pot_col='#b0653e')       # 店門東邊、落地窗腳
sh.plant(3.95, Z1 - 0.3, h=0.7, r=0.15, pot_col='#7d8f52')

# ---------------------------------------------------------------- 4. 前景那桌（table 12）：參考圖右下的甜點組
t12 = [s_ for s_ in LAY['seats'] if s_['table'] == 10]; ftx = sum(s_['x'] for s_ in t12) / 2; ftz = sum(s_['z'] for s_ in t12) / 2; TH = 0.74   # v3b：甜點組搬到東窗邊 table 10（鏡頭改看東牆）
def iced(x, z, fill_lo, fill_hi, lemon=False):
    Xf(x, z, 0, TH).lathe(sh.a('glass'), [(0.0, 0.0), (0.036, 0.0), (0.042, 0.14), (0.04, 0.145)], 0, 0, 0, seg=12)
    Xf(x, z, 0, TH + 0.005).lathe(sh.a('vcg'), [(0.0, 0.0), (0.033, 0.0), (0.037, 0.06), (0.0, 0.06)], 0, 0, 0, seg=10, col=fill_lo)
    Xf(x, z, 0, TH + 0.065).lathe(sh.a('vcg'), [(0.0, 0.0), (0.037, 0.0), (0.039, 0.055), (0.0, 0.055)], 0, 0, 0, seg=10, col=fill_hi)
    for k in range(3): Xf(x + R7.uniform(-0.015, 0.015), z + R7.uniform(-0.015, 0.015), R7.uniform(0, 1), TH + 0.1 + k * 0.012).rbox(sh.a('glass'), -0.014, 0.014, 0.0, 0.022, -0.014, 0.014, r=0.003, seg=1)   # 冰塊
    Xf(x, z).cyl(sh.a('vc'), (0.01, TH + 0.04, 0.0), (0.03, TH + 0.22, 0.01), 0.004, col='#1e1e1e', seg=5)                 # 吸管
    if lemon: Xf(x + 0.03, z, 0, TH + 0.14).lathe(sh.a('vcg'), [(0.0, -0.004), (0.028, -0.004), (0.03, 0.0), (0.028, 0.004), (0.0, 0.004)], 0, 0, 0, seg=12, col='#f2d65a')
    Xf(x, z, 0, TH).lathe(sh.a('vcg'), [(0.0, 0.0), (0.055, 0.0), (0.055, 0.008), (0.0, 0.008)], 0, 0, 0, seg=12, col='#8a5a32')   # 杯墊
iced(ftx - 0.12, ftz + 0.1, '#8a5a32', '#efe3cc')          # 冰拿鐵（下面咖啡、上面奶）
iced(ftx + 0.02, ftz + 0.16, '#5a2e14', '#7a4220', lemon=True)   # 檸檬冰美式
K.plate(sh, ftx + 0.12, ftz - 0.02, TH, r=0.09, col='#f2efe8')    # 肉桂捲：一圈一圈＋糖霜
for k in range(3):
    rr = 0.055 - k * 0.016; Xf(ftx + 0.12, ftz - 0.02, 0, TH + 0.008).lathe(sh.a('vcg'), [(rr - 0.016, 0.0), (rr, 0.005), (rr + 0.002, 0.03 + k * 0.006), (rr - 0.008, 0.042 + k * 0.006), (rr - 0.016, 0.04 + k * 0.006)], 0, 0, 0, seg=14, col=('#c07a3a', '#a8602a', '#8a4a20')[k])
Xf(ftx + 0.12, ftz - 0.02, 0, TH + 0.05).lathe(sh.a('vcg'), [(0.0, 0.004), (0.05, 0.0), (0.056, -0.006), (0.0, 0.0)], 0, 0, 0, seg=14, col='#f6efe0')
K.plate(sh, ftx - 0.02, ftz - 0.17, TH, r=0.1, col='#ece6da')      # 明太子厚片
tp = Xf(ftx - 0.02, ftz - 0.17, 0.3, TH + 0.008)
tp.rbox(sh.a('vcg'), -0.065, 0.065, 0.0, 0.045, -0.06, 0.06, r=0.008, seg=1, col='#e8c486')
tp.rbox(sh.a('vcg'), -0.058, 0.058, 0.045, 0.055, -0.053, 0.053, r=0.006, seg=1, col='#e8875a')
for k in range(4): tp.cyl(sh.a('vc'), (-0.04 + k * 0.025, 0.057, -0.02), (-0.035 + k * 0.025, 0.058, 0.02), 0.003, col='#4a6a2a', seg=3)   # 海苔絲
daisies(ftx + 0.2, ftz + 0.14, TH)
sh.tally('v3 foreground table')

# ---------------------------------------------------------------- 6. v3c（LAWWW2 第三輪：每一格都要有東西）
for (px_, pz_) in ((X1 - 0.35, -0.3), (X1 - 0.35, -2.75), (X1 - 0.9, 0.9), (X1 - 0.9, -1.2)):   # 東窗頂多四盆吊著的黃金葛
    Xf(px_, pz_).cyl(sh.a('vcm'), (0, H, 0), (0, 2.8, 0), 0.003, col='#2a2a2a', seg=3, caps=False)
    Xf(px_, pz_, 0, 2.66).lathe(sh.a('vcg'), [(0.05, 0.0), (0.1, 0.05), (0.11, 0.13), (0.1, 0.13)], 0, 0, 0, seg=10, col=R7.choice(['#e8dcc0', '#b0653e', '#7d8f52']))
    sh.hanging_pothos('pothos', px_, 2.78, pz_, n=7, drop=0.65)
for zz in (-3.45 + 0.55, -0.95 - 0.55, 1.0 + 0.55):                                              # 窗邊那排桌子之間再多三盞小吊燈
    K.dome_pendant(sh, X1 - 0.95, zz, 2.45, r=0.12, col=R7.choice(['#e8875a', '#e8dcc0', '#6f8a5e']), kind='cone', glow_size=0.4)
for (cz_, cell, w, h) in ((1.2, (4, 4, 2, 2), 0.55, 0.55), (2.55, (0, 4, 2, 1), 0.9, 0.45), (3.9, (6, 4, 2, 2), 0.55, 0.55)):   # 佈告欄上方一排小框（唱片海報、今日推薦、散步地圖）
    sh.wall_img('right', 'print', cz_, 2.92, w, h, K.cell_uv(*cell), off=0.025)
    Xf(0, 0).rbox(sh.w('right', 'wood'), X1 - 0.02, X1, 2.92 - h / 2 - 0.03, 2.92 + h / 2 + 0.03, cz_ - w / 2 - 0.03, cz_ + w / 2 + 0.03, r=0.004, seg=1)
sh.tally('v3c density')

# ---------------------------------------------------------------- 7. v3c：東窗外也一條遮雨棚（轉角兩面臨街；參考圖窗頂一整條深綠）
aw2 = sh.w('right', 'vc'); za0, za1 = LAY['side']['right']['windows'][0][0] - 0.3, LAY['side']['right']['windows'][0][1] + 0.3
bm2 = bmesh.new()
q = [bm2.verts.new(g2b(X1 + 0.06, 3.36, za0)), bm2.verts.new(g2b(X1 + 0.06, 3.36, za1)), bm2.verts.new(g2b(X1 + 1.35, 2.92, za1)), bm2.verts.new(g2b(X1 + 1.35, 2.92, za0))]
bm2.faces.new(q); bm2.normal_update(); K.paint_bm(bm2, AG); aw2.add_bm(bm2); bm2.free()
nsc2 = 8; sw2 = (za1 - za0) / nsc2
for k in range(nsc2):
    a0 = za0 + k * sw2; vb = bmesh.new(); top = []; bot = []
    for j in range(7):
        u = a0 + sw2 * j / 6; top.append(vb.verts.new(g2b(X1 + 1.36, 2.92, u)))
        bot.append(vb.verts.new(g2b(X1 + 1.36, 2.92 - 0.12 - 0.1 * math.sin(math.pi * j / 6), u)))
    for j in range(6): vb.faces.new((top[j], top[j + 1], bot[j + 1], bot[j]))
    vb.normal_update(); K.paint_bm(vb, AG if k % 2 else '#5a7850'); aw2.add_bm(vb); vb.free()
sh.tally('v3c east awning')
