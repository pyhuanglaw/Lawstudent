"""大學食堂（118 巷店 id cafe2，秤重自助餐）的室內——L118-SHOPS-REDO-1111（USER_WANTS X338；使用者 2026-11-11 規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md
＋參考圖 docs/handoff/user_specs/l118_ref/int_cafe2.webp）。LAWWW 的 Blender 子代理臨時代 LAWWW2 做（2026-11-11）。
  /opt/blenv/bin/python tools/blender/env_second/l118_int_cafe2.py [-- --out-dir assets/models/env/second_ai] [--preview <輸出資料夾>] [--preview-only]
產出（覆蓋）：assets/models/env/second_ai/l118_cafe2.glb、l118_cafe2.json、l118_cafe2.layout.json。一間店一個 Blender 程序。
原本這一格是慢讀咖啡（書架、窗邊吧檯、可以讀書的桌位）；讀書的功能程式端已經拿掉、搬去木曜日（AA_772）。新室內：
  明亮（白牆、淺灰地磚、日光燈）；左側（西牆）一長條不鏽鋼自助餐台（玻璃防護罩、保溫燈、二十幾格菜、最前面白飯鍋和餐具筒、餐盤車）；
  左牆「大學食堂 — 秤重自助餐 —」、黑板「今日菜色推薦」、橘色「用餐流程」；最裡面出菜口看得到不鏽鋼廚房；
  右後橘色櫃台「秤重結帳區」（磅秤、收銀機）、黑板「計價方式」、「餐盤自取」架；右牆（東）靠牆兩人桌、門邊靠窗兩人桌（淺木桌面、深灰椅）；中間兩張四人桌。
  牆上的字：品項只寫使用者文字規格的（熱炒、蔬菜、肉類、白飯；依重量計價；一餐約 100–160 元），不照參考圖的菜名和每 100 公克的價錢。
共用的收尾（finish2、notrap、ensure_view、preview、印刷品、畫框、橢球）從同一個子代理的 l118_int_home.py import（不是 LAWWW2 的檔）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..'))
import l118_int_home as HM   # noqa: E402  （有 __main__ 保護）
from l118_int_home import LS, L, B, Mesh, CMesh, g2b, Matrix, PI, H, ccyl, csph, clathe, TX, GEN, F, STEEL, STEEL_D, pr, frame, cell_, uvr   # noqa: E402
from PIL import Image, ImageDraw   # noqa: E402

SID = 'cafe2'
NAME, SUB = '大學食堂', '秤重自助餐'
MENU = [('自助餐（菜多肉少）', 100), ('自助餐（三菜一肉）', 130), ('自助餐（三菜兩肉）', 160)]   # src/data/lane118_shops.js（AA_280；使用者規格：依重量計價，一餐約 $100–160）
HOURS = '11:00～13:30、17:00～19:00；週六、週日休'
ORANGE = '#e2742b'; GREY = '#4b4e53'
REG = {'TITLE': (0, 0, 1024, 300), 'BB1': (0, 300, 420, 700), 'FLOW': (420, 300, 700, 700), 'BB2': (700, 300, 1024, 560), 'HOURS': (700, 560, 1024, 700),
       'CHECK': (0, 700, 560, 836), 'TRAY': (560, 700, 860, 790), 'NOTE': (860, 700, 1024, 790), 'ART': (0, 836, 240, 1024), 'DISP': (240, 836, 420, 916), 'RET': (420, 836, 800, 926)}
FOODS = [('#5f9a3f', '#7fb04a'), ('#c98a3a', '#e3b25a'), ('#a8422a', '#c9623a'), ('#e0c24a', '#f0dc7a'), ('#8a5a2a', '#b07a3a'), ('#d9c7a0', '#efe2c0'), ('#6a8a3a', '#c8322a'), ('#b8742a', '#5f9a3f'),
         ('#7a3a2a', '#a85a3a'), ('#e6d9b8', '#c9a24a'), ('#3f7a3a', '#e9e2c8'), ('#c9622a', '#e8a04a'), ('#d8b060', '#8a6a3a'), ('#9ab85a', '#e0e0c8')]


def atlas():
    """大學食堂室內的印刷品貼圖集 → textures/gen/l118_int_cafe2_print.png（程式畫的；字型文泉驛正黑）"""
    im = Image.new('RGB', (1024, 1024), '#808080'); org = TX.hexrgb(ORANGE); dark = (58, 56, 54); rr = random.Random(118)
    def put(key, sub): im.paste(sub, REG[key][:2])
    def size(key): x0, y0, x1, y1 = REG[key]; return x1 - x0, y1 - y0
    def chalk(w, h, seed):
        b = Image.new('RGB', (w, h), (52, 56, 54)); px = b.load(); r2 = random.Random(seed)
        for _ in range(w * h // 14): x, y = r2.randrange(w), r2.randrange(h); k = r2.randint(-6, 10); px[x, y] = (52 + k, 56 + k, 54 + k)
        return b
    # 牆上的店名「大學食堂 — 秤重自助餐 —」（白底、深灰大字、橘色弧線、冒熱氣的碗）
    w, h = size('TITLE'); t = Image.new('RGB', (w, h), '#f6f4ee'); d = ImageDraw.Draw(t)
    x = 70
    for ch in NAME: d.text((x, 20), ch, font=F(150), fill=dark); x += 172
    d.arc([40, 60, 820, 250], 28, 152, fill=org, width=9)
    bx, by = 880, 150; d.pieslice([bx - 62, by - 60, bx + 62, by + 64], 0, 180, fill=org); d.rectangle([bx - 30, by + 60, bx + 30, by + 70], fill=org)
    for k in (-1, 0, 1): d.arc([bx + k * 30 - 12, by - 78, bx + k * 30 + 12, by - 38], 250, 110, fill=org, width=6)
    TX.ctext(d, 440, 232, '—　秤 重 自 助 餐　—', F(46), (96, 92, 88)); put('TITLE', t)
    # 黑板「今日菜色推薦」（打勾的四類：使用者規格寫的熱炒、蔬菜、肉類、白飯）
    w, h = size('BB1'); b = chalk(w, h, 5); d = ImageDraw.Draw(b); TX.ctext(d, w / 2, 26, '今日菜色推薦', F(50), (238, 236, 226)); d.line([(60, 96), (w - 60, 100)], fill=(226, 150, 80), width=4)
    for k, nm in enumerate(('各式熱炒', '蔬菜', '肉類', '白飯')):
        y = 128 + k * 64; d.rectangle([70, y + 8, 106, y + 44], outline=(238, 236, 226), width=3); d.line([(76, y + 26), (88, y + 40), (112, y + 2)], fill=(238, 236, 226), width=4); d.text((132, y), nm, font=F(46), fill=(238, 236, 226))
    put('BB1', b)
    # 橘色的「用餐流程」四步驟
    w, h = size('FLOW'); f = Image.new('RGB', (w, h), '#fbf7f0'); d = ImageDraw.Draw(f); d.rectangle([0, 0, w, 84], fill=org); TX.ctext(d, w / 2, 16, '用餐流程', F(48), (255, 255, 255))
    for k, nm in enumerate(('夾取喜愛的菜色', '至結帳區秤重', '依重量計價結帳', '找座位用餐')):
        y = 112 + k * 70; d.ellipse([20, y, 64, y + 44], fill=org); TX.ctext(d, 42, y + 3, str(k + 1), F(34), (255, 255, 255)); d.text((78, y + 6), nm, font=F(27), fill=dark)
    d.rectangle([0, 0, w - 1, h - 1], outline=org, width=5); put('FLOW', f)
    # 黑板「計價方式」
    w, h = size('BB2'); b = chalk(w, h, 9); d = ImageDraw.Draw(b); TX.ctext(d, w / 2, 16, '計價方式', F(46), (238, 236, 226)); TX.ctext(d, w / 2, 88, '依餐盤總重量計價', F(34), (238, 236, 226))
    TX.ctext(d, w / 2, 150, '一餐約', F(32), (238, 236, 226)); TX.ctext(d, w / 2, 192, '100–160 元', F(44), (240, 160, 84)); put('BB2', b)
    # 營業時間
    w, h = size('HOURS'); hr = TX.paper(w, h, '#ffffff', seed=7); d = ImageDraw.Draw(hr); TX.ctext(d, w / 2, 8, '營業時間', F(36), (40, 40, 40)); yy = 56
    for ln in HOURS.split('；')[0].split('、') + HOURS.split('；')[1:]: TX.ctext(d, w / 2, yy, ln, F(24), (60, 60, 60)); yy += 27
    d.rectangle([3, 3, w - 4, h - 4], outline=org, width=4); put('HOURS', hr)
    # 吊牌「秤重結帳區」（橘底白字、磅秤的小圖）
    w, h = size('CHECK'); ck = Image.new('RGB', (w, h), org); d = ImageDraw.Draw(ck)
    d.rounded_rectangle([40, 62, 120, 104], radius=8, outline=(255, 255, 255), width=5); d.line([(52, 52), (108, 52)], fill=(255, 255, 255), width=6); d.line([(80, 52), (80, 62)], fill=(255, 255, 255), width=5); d.ellipse([70, 72, 90, 92], outline=(255, 255, 255), width=3)
    x = 160
    for ch in '秤重結帳區': d.text((x, 30), ch, font=F(72), fill=(255, 255, 255)); x += 78
    put('CHECK', ck)
    w, h = size('TRAY'); tr = Image.new('RGB', (w, h), org); d = ImageDraw.Draw(tr); TX.ctext(d, w / 2, 14, '餐盤自取 ↓', F(52), (255, 255, 255)); put('TRAY', tr)
    w, h = size('NOTE'); nt = TX.paper(w, h, '#fffdf4', seed=3); d = ImageDraw.Draw(nt); TX.ctext(d, w / 2, 10, '飯也算', F(34), (50, 46, 42)); TX.ctext(d, w / 2, 48, '重量喔', F(34), (50, 46, 42)); put('NOTE', nt)   # AA_772 look_lines.cafe2
    # 牆上的小掛畫（線稿：一疊書、一個碗）
    w, h = size('ART'); a = TX.paper(w, h, '#f7f3ea', seed=21); d = ImageDraw.Draw(a)
    for k in range(3): d.rounded_rectangle([56 - k * 6, 118 - k * 26, 184 + k * 4, 140 - k * 26], radius=3, outline=dark, width=3)
    d.pieslice([78, 2, 162, 76], 0, 180, outline=dark, width=3); d.line([(78, 40), (162, 40)], fill=dark, width=3)
    for k in (-1, 0, 1): d.arc([112 + k * 22, 4, 128 + k * 22, 30], 250, 110, fill=org, width=3)
    put('ART', a)
    w, h = size('RET'); rt = Image.new('RGB', (w, h), '#fbf7f0'); d = ImageDraw.Draw(rt); d.text((22, 14), '餐盤回收', font=F(58), fill=dark); d.line([(272, 46), (346, 46)], fill=org, width=9); d.polygon([(340, 24), (368, 46), (340, 68)], fill=org); d.rectangle([0, h - 9, w, h], fill=org); put('RET', rt)   # 第二組參考圖 int2_cafe2
    w, h = size('DISP'); dp = Image.new('RGB', (w, h), (18, 30, 24)); d = ImageDraw.Draw(dp); d.text((14, 12), '0.000 kg', font=F(40), fill=(130, 236, 160)); put('DISP', dp)
    im.save(os.path.join(GEN, 'l118_int_cafe2_print.png'))


def chair_grey(c, x, z, yaw, col=GREY):
    """深灰色的塑膠殼椅（坐墊和椅背是有圓角的殼、四支細腳往外張）；(x, z) 是坐的位置，面向 yaw"""
    # CC0 的店（SHOP-CC0-HELP-1113）：形狀照舊（參考圖是塑膠殼椅；Poly Haven 沒有這種、掃描的木椅不像），殼的顏色 GREY 由 cc0_setup 分到深灰塑膠材質組、椅腳分到深色不鏽鋼
    T = LS.rot(x, z, yaw)
    LS.rbox(c.vc, T, -0.21, 0.21, 0.425, 0.455, -0.2, 0.21, col, r=0.014, seg=1)
    LS.rbox(c.vc, T, -0.2, 0.2, 0.52, 0.86, -0.225, -0.195, col, r=0.014, seg=1)
    for lx in (-0.16, 0.16): (ax, az), (bx, bz) = T(lx, -0.2), T(lx, -0.21); ccyl(c.vc, (ax, 0.44, az), (bx, 0.54, bz), 0.014, col, seg=5)
    for lx in (-1, 1):
        for lz in (-1, 1): (ax, az), (bx, bz) = T(lx * 0.17, lz * 0.16), T(lx * 0.2, lz * 0.2); ccyl(c.vm, (ax, 0.43, az), (bx, 0.0, bz), 0.011, '#3a3d41', seg=5)


def mini_plant(c, x, y, z, rng, n=7):
    if getattr(c, 'ph', None): c.ph.put('potted_plant_04', x, y, z, rng.uniform(0, 6.283), s=0.65, share=False, height=0.2, decimate=0.07, texres=256); return   # CC0：Poly Haven 小盆栽
    clathe(c.vc, [(0.0, 0.0), (0.035, 0.0), (0.045, 0.07), (0.048, 0.075), (0.0, 0.075)], x, y, z, '#f1efe9', seg=10)
    for k in range(n): a = k * 2 * PI / n + rng.uniform(-0.3, 0.3); cell_(c.vc, (x + 0.035 * math.cos(a), y + 0.11 + 0.03 * (k % 2), z + 0.035 * math.sin(a)), 0.045, 0.012, 0.028, rng.choice(['#4f8f44', '#3f7a3a', '#63a552']), rotz=a)


def plates(m, x, y, z, n=8, r=0.12, col='#f1f0ec', seg=10):
    """一疊盤子：整疊一個車床外型（底、每一個盤子的盤緣凸一圈、最上面那個的盤面往下凹）——原本一個盤子一個車床零件，30 個盤子的面數太多（GLB 1.5 倍預算）"""
    prof = [(0.0, 0.0), (r * 0.6, 0.0)]
    for k in range(n): yk = k * 0.011; prof += [(r * 0.97, yk + 0.006), (r, yk + 0.011)]
    top = (n - 1) * 0.011; prof += [(r, top + 0.016), (r * 0.58, top + 0.006), (0.0, top + 0.006)]
    clathe(m, prof, x, y, z, col, seg=seg)


def buffet(c, x0, x1, z0, z1, rng):
    """西牆的自助餐台（客人在東側）：不鏽鋼櫃身（一格一格的門）、檯面上兩排菜盤（每盤兩種顏色的菜）、斜的玻璃防護罩、上層不鏽鋼架和保溫燈、推餐盤的滑軌"""
    ks = c.steel; km = c.vm; v = c.vc
    ks.rbox(x0, x1 + 0.03, 0.82, 0.86, z0, z1, r=0.006, seg=1); km.cbox(x0, x1, 0.1, 0.82, z0, z1, '#a9aeb2'); km.cbox(x0 + 0.03, x1 - 0.04, 0.0, 0.1, z0 + 0.03, z1 - 0.03, '#3a3d40')
    n = max(1, round((z1 - z0) / 0.75)); dz = (z1 - z0) / n
    for k in range(n):                                                                          # 櫃門（面向客人）
        km.crbox(x1, x1 + 0.014, 0.15, 0.78, z0 + k * dz + 0.012, z0 + (k + 1) * dz - 0.012, '#bcc1c5', r=0.004, seg=1); km.crbox(x1 + 0.014, x1 + 0.03, 0.42, 0.56, z0 + (k + 1) * dz - 0.1, z0 + (k + 1) * dz - 0.07, STEEL_D, r=0.004, seg=1)
    rows = max(1, int((z1 - z0 - 0.1) / 0.4)); dzr = (z1 - z0 - 0.1) / rows; dx = (x1 - x0 - 0.1) / 2
    for i in range(rows):
        for j in range(2):
            a = x0 + 0.05 + j * dx + 0.02; b = a + dx - 0.04; za = z0 + 0.05 + i * dzr + 0.02; zb = za + dzr - 0.04
            km.crbox(a, b, 0.86, 0.878, za, zb, '#c9ced2', r=0.006, seg=1)                                # 菜盤的邊
            if getattr(c, 'foodm', None): LS.food_dome(c, a + 0.012, b - 0.012, za + 0.012, zb - 0.012, 0.874, 0.035, (i * 2 + j * 5 + i // 3) % 12); continue   # CC0：菜色貼圖集的菜面（和水上便當同一張）
            c1, c2 = FOODS[(i * 2 + j * 5 + i // 3) % len(FOODS)]
            v.crbox(a + 0.014, b - 0.014, 0.87, 0.905, za + 0.014, zb - 0.014, c1, k=0.9, r=0.016, seg=2)   # 一盤菜：鋪滿的一層＋上面堆起來的幾塊（兩種顏色）
            for q in range(7):
                fx = a + 0.07 + (b - a - 0.14) * rng.random(); fz = za + 0.07 + (zb - za - 0.14) * rng.random()
                cell_(v, (fx, 0.905 + 0.01 * (q % 3), fz), 0.07, 0.032, 0.055, c1 if q % 3 else c2, seg=8, rings=4, rotz=rng.uniform(0, 3))
    # 防護罩：斜玻璃（客人側）、上層架、保溫燈、支柱；滑軌
    gl = c.extra.setdefault('sglass', Mesh(f'l118_{c.sid}_sneezeguard', c.M['glass'])); xt = x1 - 0.42
    gl.quad([(x1 + 0.02, 1.0, z0 + 0.02), (x1 + 0.02, 1.0, z1 - 0.02), (xt, 1.52, z1 - 0.02), (xt, 1.52, z0 + 0.02)])
    for zz in (z0 + 0.02, z1 - 0.02): gl.quad([(x1 + 0.02, 1.0, zz), (xt, 1.52, zz), (x0 + 0.06, 1.52, zz), (x0 + 0.06, 1.0, zz)])
    ks.box(x0 + 0.04, xt + 0.02, 1.52, 1.545, z0, z1); c.warm.box(x0 + 0.2, xt - 0.06, 1.512, 1.52, z0 + 0.12, z1 - 0.12)
    np_ = max(2, round((z1 - z0) / 1.5) + 1)
    for k in range(np_):
        zz = z0 + 0.03 + k * (z1 - z0 - 0.06) / (np_ - 1)
        ccyl(km, (x1 + 0.02, 0.86, zz), (x1 + 0.02, 1.0, zz), 0.012, STEEL, seg=6); ccyl(km, (x1 + 0.02, 1.0, zz), (xt, 1.52, zz), 0.012, STEEL, seg=6); ccyl(km, (x0 + 0.06, 0.86, zz), (x0 + 0.06, 1.52, zz), 0.012, STEEL, seg=6)
    for k in range(3): ccyl(km, (x1 + 0.07 + k * 0.07, 0.8, z0), (x1 + 0.07 + k * 0.07, 0.8, z1), 0.011, STEEL, seg=6)
    for k in range(np_): zz = z0 + 0.05 + k * (z1 - z0 - 0.1) / (np_ - 1); km.cbox(x1, x1 + 0.23, 0.775, 0.79, zz - 0.012, zz + 0.012, STEEL_D)


def build_cafe2(c):
    X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; M = c.M; rng = c.rng; c.S['kpass'] = True
    LS.shell(c)
    LS.kitchen(c, -2.45, 0.25, depth=1.8, win=(1.0, 1.78))                                              # 最裡面：出菜口後面的不鏽鋼廚房（跟著後牆淡出）
    sv = c.wg('S', 'trim', M['vc'], cm=True); g0, g1 = X0 + 0.3, X1 - 0.3; d0, d1 = c.door['x'] - 0.5, c.door['x'] + 0.5   # 店面玻璃上的橘色腰線（參考圖外觀）; g0, g1 = X0 + 0.3, X1 - 0.3; d0, d1 = c.door['x'] - 0.5, c.door['x'] + 0.5
    for (xa, xb) in ((g0, d0 - 0.04), (d1 + 0.04, g1)):
        if xb - xa > 0.05: sv.cbox(xa, xb, 0.9, 1.06, Z1 - 0.034, Z1 - 0.028, ORANGE)

    # ---------- 左側（西牆）：一長條自助餐台；最前面白飯鍋、餐具筒、餐盤車 ----------
    bx0, bx1, bz0, bz1 = X0 + 0.05, -2.42, -2.82, 2.2
    buffet(c, bx0, bx1, bz0, bz1, rng)
    ex0, ex1, ez0, ez1 = bx0, bx1, 2.2, 3.05                                                            # 餐台最前面一段（沒有罩子）：白飯鍋、餐具筒
    c.steel.rbox(ex0, ex1 + 0.03, 0.82, 0.86, ez0, ez1, r=0.006, seg=1); c.vm.cbox(ex0, ex1, 0.1, 0.82, ez0, ez1, '#a9aeb2'); c.vm.cbox(ex0 + 0.03, ex1 - 0.04, 0.0, 0.1, ez0 + 0.03, ez1 - 0.03, '#3a3d40')
    c.vm.crbox(ex1, ex1 + 0.014, 0.15, 0.78, ez0 + 0.012, ez1 - 0.012, '#bcc1c5', r=0.004, seg=1)
    rx, rz = -2.86, 2.52                                                                                 # 白飯鍋（不鏽鋼保溫飯鍋、掀開的蓋子、白飯、飯匙）
    clathe(c.vm, [(0.0, 0.0), (0.2, 0.0), (0.215, 0.015), (0.215, 0.25), (0.205, 0.265), (0.185, 0.265), (0.185, 0.05), (0.0, 0.05)], rx, 0.86, rz, '#c6cbce', seg=22)
    csph(c.vc, (rx, 1.07, rz), 0.18, '#f6f4ee', seg=14, rings=5, sy=0.42)
    f0 = set(c.vm.bm.faces); bm = L.lathe([(0.0, 0.05), (0.08, 0.045), (0.17, 0.02), (0.215, 0.0), (0.215, 0.012), (0.17, 0.034), (0.08, 0.06), (0.0, 0.066)], seg=22)
    c.vm.add_bm(bm, Matrix.Translation(g2b(rx - 0.19, 1.3, rz)) @ Matrix.Rotation(math.radians(72), 4, 'Y')); bm.free(); c.vm.paint([q for q in c.vm.bm.faces if q not in f0], '#b9bec2')
    ccyl(c.vc, (rx + 0.05, 1.1, rz + 0.05), (rx + 0.2, 1.24, rz + 0.16), 0.01, '#f1efe9', seg=5)
    us = 1.3 if getattr(c, 'cc0m', None) is not None else 1.0   # LAWWW2-C 11-13 cafe2 P2：餐台開頭那一區（白盤疊、餐具筒、飯鍋）不夠明顯 → 餐具筒放大、多一疊白盤
    for k, (ux, uz) in enumerate(((-2.62, 2.9), (-2.86, 2.9))):                                          # 餐具筒（筷子、湯匙）
        clathe(c.vm, [(0.0, 0.0), (0.06 * us, 0.0), (0.062 * us, 0.005), (0.062 * us, 0.15 * us), (0.056 * us, 0.15 * us), (0.056 * us, 0.012), (0.0, 0.012)], ux, 0.86, uz, '#b9bec2', seg=12)
        for j in range(12 if us > 1 else 9): a = j * 0.75 * (9 / 12 if us > 1 else 1) + k; ccyl(c.vm if k else c.vc, (ux + 0.03 * us * math.cos(a), 0.9, uz + 0.03 * us * math.sin(a)), (ux + 0.045 * us * math.cos(a), 0.86 + (0.24 + 0.02 * (j % 3)) * us, uz + 0.045 * us * math.sin(a)), 0.004, '#c9ced2' if k else '#d8c08a', seg=4)
    if us > 1:
        for (px_, pz_, n_) in ((-2.56, 2.3, 8), (-2.56, 2.58, 6)): plates(c.vc, px_, 0.86, pz_, n=n_, r=0.105)   # 兩疊白盤（盤子一個個疊起來看得到盤緣）
    c.block(X0, -2.1, -2.9, 3.1, 'buffet')
    # 餐盤車（餐台前面、靠窗）：兩層，疊起來的盤子和餐盤；角落一盆樹
    cx0, cx1, cz0, cz1 = X0 + 0.08, -2.45, 3.2, 3.95
    for yy in (0.3, 0.78): c.steel.box(cx0, cx1, yy - 0.025, yy, cz0, cz1)
    for (xx, zz) in ((cx0 + 0.02, cz0 + 0.02), (cx1 - 0.02, cz0 + 0.02), (cx0 + 0.02, cz1 - 0.02), (cx1 - 0.02, cz1 - 0.02)): ccyl(c.vm, (xx, 0.05, zz), (xx, 0.86, zz), 0.014, STEEL_D, seg=6); csph(c.vc, (xx, 0.035, zz), 0.035, '#2c2c2c', seg=6, rings=4)
    for k in range(4): plates(c.vc, cx0 + 0.18 + (k % 2) * 0.3, 0.78, cz0 + 0.19 + (k // 2) * 0.34, n=9 - k)
    for k in range(7): c.vc.crbox(cx0 + 0.06, cx1 - 0.06, 0.3 + k * 0.016, 0.312 + k * 0.016, cz0 + 0.1, cz1 - 0.1, '#e9e4d8' if k % 2 else '#ded8ca', r=0.005, seg=1)
    LS.plant(c, X0 + 0.42, 4.18, 1.25, pot='#e8e4dc'); c.block(X0, -2.1, 3.1, Z1, 'tray_cart')

    # ---------- 最裡面左邊：不鏽鋼層架；出菜口下面：湯桶、回收台 ----------
    for yy in (0.25, 0.75, 1.25, 1.75): c.steel.box(X0 + 0.05, -2.75, yy - 0.02, yy, -4.4, -3.0)
    for (xx, zz) in ((X0 + 0.07, -4.38), (-2.77, -4.38), (X0 + 0.07, -3.02), (-2.77, -3.02)): ccyl(c.vm, (xx, 0.0, zz), (xx, 1.85, zz), 0.014, STEEL_D, seg=6)
    for s_, yy in enumerate((0.25, 0.75, 1.25)):                                                          # 餐盤回收架（int2 參考圖）：一層一層疊著收回來的深灰餐盤、最上層幾個碗
        for q in range(2):
            for k in range(6 - s_ - q): c.vc.crbox(X0 + 0.09, -2.79, yy + k * 0.018, yy + 0.013 + k * 0.018, -4.34 + q * 0.68, -3.72 + q * 0.68, '#4b4e53' if k % 2 else '#42454a', r=0.006, seg=1)
    for k in range(3): HM.bowls(c.vc, X0 + 0.28, 1.75, -4.15 + k * 0.42, n=4 - k, rim='#eef0f2')
    fpr = c.extra.setdefault('iprint_free', Mesh('l118_cafe2_printfree', M['iprint']))
    c.vc.cbox(-2.75, -2.735, 1.84, 2.1, -4.3, -3.1, '#f1efe9'); LS.uvquad(fpr, [(-2.733, 1.85, -3.12), (-2.733, 1.85, -4.28), (-2.733, 2.09, -4.28), (-2.733, 2.09, -3.12)], uvr(REG, 'RET'))
    c.block(X0, -2.1, Z0, -2.9, 'tray_return')
    LS.counter(c, -2.05, 0.3, Z0, Z0 + 0.58, h=0.86, top='steel', front='#b7bcc0', block=False)
    clathe(c.vm, [(0.0, 0.0), (0.2, 0.0), (0.21, 0.012), (0.21, 0.36), (0.225, 0.37), (0.225, 0.385), (0.19, 0.385), (0.19, 0.03), (0.0, 0.03)], -1.6, 0.86, Z0 + 0.3, '#c6cbce', seg=20)
    ccyl(c.vc, (-1.6, 1.19, Z0 + 0.3), (-1.6, 1.195, Z0 + 0.3), 0.188, '#d9c08a', seg=18); ccyl(c.vm, (-1.52, 1.2, Z0 + 0.3), (-1.3, 1.46, Z0 + 0.36), 0.008, STEEL, seg=5)
    for k in range(3): HM.bowls(c.vc, -1.05 + k * 0.19, 0.86, Z0 + 0.3, n=6 - k, rim='#eef0f2')
    for k in range(5): c.vc.crbox(-0.4, 0.2, 0.86 + k * 0.016, 0.872 + k * 0.016, Z0 + 0.1, Z0 + 0.5, '#e9e4d8' if k % 2 else '#ded8ca', r=0.005, seg=1)
    c.block(-2.1, 0.7, Z0, -3.7, 'soup_return')

    # ---------- 右後：橘色櫃台「秤重結帳區」（磅秤、收銀機）、黑板「計價方式」、「餐盤自取」架 ----------
    kx0, kx1, kz0, kz1 = 0.72, 2.68, -3.55, -2.95
    c.steel.rbox(kx0 - 0.02, kx1 + 0.02, 0.93, 0.97, kz0 - 0.02, kz1 + 0.04, r=0.006, seg=1)
    c.vc.cbox(kx0, kx1, 0.1, 0.93, kz0, kz1 - 0.02, '#c9652a'); c.vc.cbox(kx0 + 0.03, kx1 - 0.03, 0.0, 0.1, kz0 + 0.03, kz1 - 0.05, '#3a3d40')
    c.vm.crbox(kx0, kx0 + 0.62, 0.12, 0.9, kz1 - 0.02, kz1, '#b7bcc0', r=0.004, seg=1)                   # 左邊一段不鏽鋼
    n = 26
    for k in range(n): a = kx0 + 0.64 + k * (kx1 - kx0 - 0.64) / n; c.vc.crbox(a + 0.006, a + (kx1 - kx0 - 0.64) / n - 0.006, 0.14, 0.86, kz1 - 0.02, kz1 + 0.004, ORANGE, r=0.008, seg=1)   # 橘色直條飾板
    c.warm.box(kx0 + 0.64, kx1, 0.885, 0.9, kz1 - 0.005, kz1 + 0.012)                                     # 檯面下的燈條
    sx, sz = 1.08, -3.22                                                                                  # 磅秤（底座、不鏽鋼秤盤、顯示幕）
    c.vc.crbox(sx - 0.17, sx + 0.17, 0.97, 1.03, sz - 0.15, sz + 0.17, '#dfe2e4', r=0.012, seg=2); c.vm.crbox(sx - 0.16, sx + 0.16, 1.045, 1.058, sz - 0.14, sz + 0.1, '#c9ced2', r=0.005, seg=1)
    ccyl(c.vm, (sx, 1.03, sz - 0.02), (sx, 1.045, sz - 0.02), 0.04, STEEL_D, seg=8); c.vc.cbox(sx - 0.15, sx + 0.15, 0.975, 1.028, sz + 0.171, sz + 0.176, '#2a2c2e')
    fp = c.extra.setdefault('iprint_free', Mesh('l118_cafe2_printfree', M['iprint']))
    LS.uvquad(fp, [(sx - 0.1, 0.983, sz + 0.178), (sx + 0.1, 0.983, sz + 0.178), (sx + 0.1, 1.022, sz + 0.178), (sx - 0.1, 1.022, sz + 0.178)], uvr(REG, 'DISP'))
    c.vc.crbox(sx + 0.24, sx + 0.25, 0.97, 1.15, sz + 0.02, sz + 0.2, '#e9e6dc', r=0.003, seg=1)          # 秤旁邊貼的紙「飯也算重量喔」（立牌）
    LS.uvquad(fp, [(sx + 0.212, 0.99, sz + 0.202), (sx + 0.388, 0.99, sz + 0.202), (sx + 0.388, 1.14, sz + 0.202), (sx + 0.212, 1.14, sz + 0.202)], uvr(REG, 'NOTE')); c.vc.cbox(sx + 0.2, sx + 0.4, 0.97, 1.15, sz + 0.185, sz + 0.2, '#f1efe9')
    LS.register(c, 2.15, 0.97, -3.25, face='+z')
    clathe(c.vm, [(0.0, 0.0), (0.045, 0.0), (0.047, 0.005), (0.047, 0.11), (0.042, 0.11), (0.042, 0.01), (0.0, 0.01)], 1.6, 0.97, -3.12, '#b9bec2', seg=10)
    for j in range(5): a = j * 1.3; ccyl(c.vc, (1.6 + 0.02 * math.cos(a), 1.0, -3.12 + 0.02 * math.sin(a)), (1.6 + 0.035 * math.cos(a), 1.16, -3.12 + 0.035 * math.sin(a)), 0.004, ('#2a4a8a', '#b3261e', '#2a2a2a')[j % 3], seg=4)
    # 「餐盤自取」架（櫃台右邊）
    tx0, tx1, tz0, tz1 = 2.78, X1 - 0.03, -3.72, -3.02
    for yy in (0.2, 0.62, 1.04, 1.46): c.steel.box(tx0, tx1, yy - 0.02, yy, tz0, tz1)
    for (xx, zz) in ((tx0 + 0.015, tz0 + 0.015), (tx1 - 0.015, tz0 + 0.015), (tx0 + 0.015, tz1 - 0.015), (tx1 - 0.015, tz1 - 0.015)): ccyl(c.vm, (xx, 0.0, zz), (xx, 1.62, zz), 0.013, STEEL_D, seg=6)
    for s_, yy in enumerate((0.2, 0.62, 1.04)):
        for k in range(8 - s_ * 2): c.vc.crbox(tx0 + 0.04, tx1 - 0.04, yy + k * 0.016, yy + 0.012 + k * 0.016, tz0 + 0.08, tz1 - 0.08, '#e9e4d8' if k % 2 else '#ded8ca', r=0.005, seg=1)
    c.vc.cbox(tx0 - 0.02, tx1 + 0.01, 1.52, 1.7, tz1 - 0.012, tz1, '#c9652a')
    LS.uvquad(fp, [(tx0 - 0.02, 1.53, tz1 + 0.002), (tx1 + 0.01, 1.53, tz1 + 0.002), (tx1 + 0.01, 1.69, tz1 + 0.002), (tx0 - 0.02, 1.69, tz1 + 0.002)], uvr(REG, 'TRAY'))
    c.block(0.7, X1, Z0, -2.9, 'checkout')
    c.counter = dict(x0=kx0, x1=kx1, z0=kz0, z1=kz1, h=0.97, note='右後的橘色櫃台「秤重結帳區」')
    c.clerk = dict(x=1.55, z=-4.05, yaw=0.0, note='櫃台後面、秤的旁邊，面向客人；阿姨（AA_772 staff：原好家自助餐的阿姨）')
    c.order = dict(x=1.95, z=-2.3, r=0.8, label='點餐（' + NAME + '）', note='秤重結帳區櫃台前面（shop118:cafe2）')
    c.look('scale', 0.75, -2.45, 0.6, '秤重的檯子', '（秤旁邊貼著一張紙：「飯也算重量喔」。）', dev='AA_772 look_lines.cafe2；磅秤在櫃台左端 (1.08, -3.22)')
    # 吊牌「秤重結帳區」（櫃台前緣上方，2.5 m 以上；跟著後牆淡出）、黑板「計價方式」（後牆）
    nt = c.wg('N', 'trim', M['vc'], cm=True)
    nt.crbox(0.95, 2.45, 2.5, 2.88, kz1 - 0.02, kz1 + 0.006, '#c9652a', r=0.008, seg=1)
    for xx in (1.15, 2.25): ccyl(nt, (xx, 2.88, kz1 - 0.007), (xx, H, kz1 - 0.007), 0.006, '#8e9499', seg=4)
    pr(c, 'N', 0.96, 2.44, 2.51, 2.87, 'CHECK', inset=kz1 + 0.008 - Z0)
    pr(c, 'N', 1.25, 2.35, 1.42, 2.3, 'BB2'); frame(c, 'N', 1.25, 2.35, 1.42, 2.3, '#b08a5e')
    c.WGP[('N', 'iprint')] = {'at': [0.0, 1.6, Z0 + 0.02]}

    # ---------- 座位：右牆（東）靠牆兩張兩人桌、門邊靠窗一張兩人桌、中間兩張四人桌（淺木桌面、深灰椅） ----------
    for tz in (-1.3, 0.7):
        LS.table(c, 2.95, tz, 0.66, 0.7, top='wood', legc='#3a3d41', block=False); c.block(2.7, X1, tz - 0.4, tz + 0.4, 'table')   # 擋的範圍從 2.7 起（導航格線）：椅子從西邊那一格走近
        chair_grey(c, 2.92, tz - 0.62, 0.0); c.seat(2.92, tz - 0.62, 0.0, (2.95, tz), 'eat'); chair_grey(c, 2.92, tz + 0.62, PI); c.seat(2.92, tz + 0.62, PI, (2.95, tz), 'eat')
        mini_plant(c, 3.12, 0.74, tz, rng); c.vm.crbox(3.02, 3.16, 0.74, 0.82, tz - 0.22, tz - 0.12, '#c4c8cb', r=0.006, seg=1)
    for tz in (-1.1, 1.3):
        LS.table(c, 0.3, tz, 0.7, 1.2, top='wood', legc='#3a3d41', block=False); c.block(-0.1, 0.7, tz - 0.6, tz + 0.6, 'table')
        for sz_ in (tz - 0.3, tz + 0.3):
            chair_grey(c, -0.35, sz_, PI / 2); c.seat(-0.35, sz_, PI / 2, (0.3, tz), 'eat'); chair_grey(c, 0.95, sz_, -PI / 2); c.seat(0.95, sz_, -PI / 2, (0.3, tz), 'eat')
        c.vm.crbox(0.23, 0.37, 0.74, 0.82, tz - 0.05, tz + 0.05, '#c4c8cb', r=0.006, seg=1); c.vc.cbox(0.27, 0.33, 0.82, 0.845, tz - 0.012, tz + 0.012, '#fbfaf6')
    tz = 3.5                                                                                              # 門邊靠窗的兩人桌
    LS.table(c, 0.3, tz, 0.7, 0.7, top='wood', legc='#3a3d41', block=False); c.block(-0.1, 0.7, tz - 0.4, tz + 0.4, 'table')
    chair_grey(c, -0.35, tz, PI / 2); c.seat(-0.35, tz, PI / 2, (0.3, tz), 'eat', label='坐窗邊'); chair_grey(c, 0.95, tz, -PI / 2); c.seat(0.95, tz, -PI / 2, (0.3, tz), 'eat', label='坐窗邊')
    mini_plant(c, 0.3, 0.74, tz + 0.2, rng)
    LS.plant(c, X1 - 0.38, Z1 - 0.4, 1.2, pot='#e8e4dc'); c.block(2.7, X1, 3.9, Z1, 'plant')

    # ---------- 牆上 ----------
    pr(c, 'W', 0.55, 3.15, 1.82, 2.58, 'TITLE'); wt = c.wg('W', 'trim', M['vc'], cm=True); wt.cbox(X0, X0 + 0.008, 1.8, 2.6, 0.53, 3.17, '#e4e1d8')     # 店名（靠門這一頭）
    pr(c, 'W', -0.75, 0.25, 1.3, 2.25, 'BB1'); frame(c, 'W', -0.75, 0.25, 1.3, 2.25, '#b08a5e', t=0.04)                                              # 黑板「今日菜色推薦」
    pr(c, 'W', -1.75, -1.05, 1.3, 2.3, 'FLOW')                                                                                                    # 橘色「用餐流程」
    wt.crbox(X0, X0 + 0.22, 2.72, 2.75, 2.2, 3.0, '#d9c7a3', r=0.006, seg=1)                                                                       # 高處的小層板：一盆垂下來的黃金葛
    clathe(wt, [(0.0, 0.0), (0.07, 0.0), (0.095, 0.13), (0.1, 0.14), (0.0, 0.14)], X0 + 0.12, 2.75, 2.75, '#e8e4dc', seg=12)
    for k in range(20):
        a = rng.uniform(0, 2 * PI); dn = rng.uniform(0.0, 0.5); rd = rng.uniform(0.04, 0.15)
        cell_(wt, (X0 + 0.13 + abs(rd * math.cos(a)) * 0.8, 2.92 - dn, 2.75 + rd * math.sin(a) * 1.5), 0.055, 0.012, 0.04, rng.choice(['#3f7a3a', '#4f8f44', '#356a33']), rotz=a)
    pr(c, 'E', 1.55, 2.0, 1.45, 2.05, 'ART'); frame(c, 'E', 1.55, 2.0, 1.45, 2.05, '#b08a5e', t=0.03)                                                # 右牆的小掛畫
    dd = c.door; pr(c, 'S', dd['x'] - 1.05, dd['x'] - 0.58, 1.3, 1.5, 'HOURS', inset=0.03)
    LS.ac_unit(c, X1, 2.6, -0.3, '-x', fade=True)
    # ---------- 天花板：輕鋼架的格線、雙管日光燈 ----------
    cg = c.extra.setdefault('ceilgrid', Mesh('l118_cafe2_ceilgrid', L.flat('l118_cafe2_ceilgrid', '#d6d4cc', rough=0.9, cull=True)))
    x = X0 + 0.6
    while x < X1 - 0.1: cg.quad([(x - 0.012, H - 0.004, Z0), (x + 0.012, H - 0.004, Z0), (x + 0.012, H - 0.004, Z1), (x - 0.012, H - 0.004, Z1)]); x += 0.6
    z = Z0 + 0.6
    while z < Z1 - 0.1: cg.quad([(X0, H - 0.004, z - 0.012), (X1, H - 0.004, z - 0.012), (X1, H - 0.004, z + 0.012), (X0, H - 0.004, z + 0.012)]); z += 0.6
    pts = []
    for (lx, lz) in ((-1.5, -2.4), (1.5, -2.4), (-1.5, -0.3), (1.5, -0.3), (-1.5, 1.8), (1.5, 1.8), (0.0, 3.6)): pts += [(lx, lz - 0.09, 'x'), (lx, lz + 0.09, 'x')]
    LS.tubes(c, pts, L_=1.2)
    c.spawn['note'] = '從門進來、面向店裡（左邊是自助餐台，右後是秤重結帳區）'


PREVIEW = ([['door', [2.3, 1.55, 4.25], [-0.9, 1.0, -1.5], 17], ['back', [-0.8, 1.6, -3.4], [1.0, 0.95, 3.0], 17]],
           [(-1.5, 2.9, -2.4, 40), (1.5, 2.9, -2.4, 40), (-1.5, 2.9, -0.3, 40), (1.5, 2.9, -0.3, 40), (-1.5, 2.9, 1.8, 40), (1.5, 2.9, 1.8, 40), (0.0, 2.9, 3.6, 40)])


def main():
    pv = LS.arg('--preview')
    if '--preview-only' in LS.ARGS: return HM.preview(SID, os.path.join(L.ROOT, pv), *PREVIEW)
    os.makedirs(GEN, exist_ok=True)
    # lane118_shops 的兩個表改寫成新店（W、D、door_x 維持原值）；它的印刷品貼圖照新店名重畫——這間實際用的是自己的貼圖集（atlas()）
    LS.SPEC[SID] = dict(W=6.6, D=9.0, floor=('granite_tile', '#cfcec8', 1.2), wall='#f4f2ec', wain=('white_plaster_02', '#f4f2ec', 2.0), wainH=1.0, wood=('walnut_veneer', '#d6b88c'), door_x=2.2, trim='#eceae3', ceil='#f4f3ee')
    TX.SHOPS[SID] = dict(name=NAME, sub=SUB, menu=MENU, hours=HOURS, bg=ORANGE, fg='#ffffff', ac='#f4f2ec', p1=('用餐流程', ['夾取喜愛的菜色', '至結帳區秤重', '找座位用餐']), p2='依重量計價')
    TX.shop_atlas(SID, TX.SHOPS[SID])
    if not os.path.exists(os.path.join(GEN, 'l118_screens.png')): TX.screens()
    atlas(); HM.ensure_view(SID)
    c = LS.Shop(SID); c.extra = {}; c.REG = REG
    if SID in LS.CC0_INT: LS.cc0_setup(c); c.kpots = True   # SHOP-CC0-HELP-1113：CC0 材質組＋Poly Haven 模型（lane118_shops.py 的同一套）；kpots：出菜口後面層架放湯鍋（P2）
    c.M['wain'] = c.M['wall']   # 白牆從地板到天花板同一種（參考圖沒有腰牆；SPEC 的 wain 不用）
    c.M['iprint'] = LS.img_mat('l118_cafe2_iprint', 'l118_int_cafe2_print.png', rough=0.6)
    build_cafe2(c)
    if SID in LS.CC0_INT: LS.cc0_post(c)
    prob = HM.finish2(c, src='L118-SHOPS-REDO-1111（使用者 2026-11-11 規格：店名、餐飲類型；參考圖 l118_ref/int_cafe2.webp）；室內 tools/blender/env_second/l118_int_cafe2.py')
    print('L118_INT_CAFE2', 'OK' if not prob else prob)
    if pv: HM.preview(SID, os.path.join(L.ROOT, pv), *PREVIEW)


if __name__ == '__main__':
    main()
