"""山嵐書店 v4（AA 2026-11-03；SCENE_RULES §12：對參考圖 shanlan_int.webp 的鏡頭看，樓梯旁一大片空白牆、空白側板）。
不是單獨執行的腳本：shanlan_interior.py 在 v3 之後 exec 這個檔（共用 sh、K、Xf、LAY、ST、VD、Y2、sx0、sx1、zb、ri、tr…）。
導航、座位、樓梯、blocks 都沒動：新加的書架都貼著牆／側板（凸出 ≤ 4 cm），在樓梯和牆的範圍裡。
  1. 樓梯東側板上的嵌入式書架（參考圖：樓梯下面是一格一格的書櫃）
  2. 樓梯旁西牆、跟著樓梯斜度一格一格往上的書牆（扶手上方）
"""
R8 = random.Random(1106)
zt = VD['z0']


def tread_y(z):   # 樓梯在 z 那裡的踏面高度（z 越小越高）
    return max(0.0, min(Y2, (zb - z) / (zb - zt) * Y2))


def flush_bay(xw, zc, w, y0, y1, face, lvl=''):
    """貼在牆面（x＝xw）的一格書櫃：外框、層板、書；face＝+1 朝 +x"""
    ry = math.pi / 2 if face > 0 else -math.pi / 2
    xf = Xf(xw, zc, ry); wm = sh.a('wood', lvl)
    xf.rbox(wm, -w / 2, w / 2, y0, y0 + 0.03, 0.0, 0.04, r=0.004, seg=1)   # 底板
    xf.rbox(wm, -w / 2, -w / 2 + 0.03, y0, y1, 0.0, 0.04, r=0.004, seg=1); xf.rbox(wm, w / 2 - 0.03, w / 2, y0, y1, 0.0, 0.04, r=0.004, seg=1)
    xf.rbox(wm, -w / 2, w / 2, y1 - 0.03, y1, 0.0, 0.04, r=0.004, seg=1)
    y = y0; n = 0
    while y + 0.34 < y1:
        xf.rbox(wm, -w / 2, w / 2, y, y + 0.025, 0.0, 0.04, r=0.003, seg=1)
        K.book_rows(sh, 'books', xf, -w / 2 + 0.04, w / 2 - 0.04, y + 0.025, 0.02, hgt=0.29, depth=0.015, lvl=lvl, rows=GEN_ROWS, rng=R8)
        y += 0.36; n += 1
    return n


# ---------------------------------------------------------------- 1. 樓梯東側板上的嵌入式書架（z 1.2～6.6，每格 0.9 m）
xe = sx1 + 0.09   # v3 東側板的外面
nb = 0
for k in range(6):
    z0 = zt + 0.3 + k * 0.9; z1 = z0 + 0.9; top = min(tread_y(z1) - 0.12, 2.45)
    if top < 0.75: continue
    flush_bay(xe, (z0 + z1) / 2, 0.88, 0.08, top, +1); nb += 1
sh.tally('v4 under-stair shelves')

# ---------------------------------------------------------------- 2. 樓梯旁西牆的書牆（扶手上方，一格一格跟著斜度往上）
xw = X0 + 0.005
for k in range(7):
    z0 = zt + 0.05 + k * 0.95; z1 = z0 + 0.95
    if z1 > zb + 0.4: break
    y0 = tread_y(z0) + 1.08; y1 = y0 + 1.5
    if y1 > Y2 + 3.6: y1 = Y2 + 3.6
    flush_bay(xw, (z0 + z1) / 2, 0.93, y0, y1, +1); nb += 1
for k in range(3):   # 書牆上面垂下來的黃金葛
    zz = zt + 0.9 + k * 2.2; sh.hanging_pothos('pothos', X0 + 0.15, tread_y(zz) + 2.75, zz, n=6, drop=0.6)
print('v4 bays', nb)
sh.tally('v4 stair wall shelves')

# ---------------------------------------------------------------- 3. v5（LAWWW2 第三輪）：挑空下新書平台的小立牌（店員推薦卡）
pf = IT['platform'][0]; long_x = pf['w'] >= pf['d']; pry = 0.0 if long_x else math.pi / 2
PL_, PS_ = (pf['w'], pf['d']) if long_x else (pf['d'], pf['w'])
for k, (u, yy, cell) in enumerate(((-PL_ / 2 + 0.25, 0.5, (8 + 0, 4)), (PL_ / 2 - 0.25, 0.5, (8 + 3, 4)), (0.0, pf['h'] - 0.17, (8 + 6, 4)))):
    for sgn in (1, -1):
        sxf = Xf(pf['x'], pf['z'], pry + (0 if sgn > 0 else math.pi))
        sxf.rbox(sh.a('wood'), sgn * u - 0.06, sgn * u + 0.06, yy, yy + 0.012, PS_ / 2 - 0.2, PS_ / 2 - 0.12, r=0.002, seg=1)          # 小木座
        kk = (k * 5 + (0 if sgn > 0 else 3)) % 16; uu = (kk / 16 + 0.002, 0.5 + 0.002, (kk + 1) / 16 - 0.002, 0.625 - 0.002)
        sh.img_quad(sh.a('print'), sxf, sgn * u, yy + 0.012, PS_ / 2 - 0.15, 0.1, 0.14, uu, tilt=0.12)                          # 推薦卡（書封圖集裡的一格）
sh.tally('v5 platform signs')
