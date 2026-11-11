"""118 巷店面室內重做（L118-SHOPS-REDO-1111，USER_WANTS X338）——義大麵屋（店 id pasta，原 Pasta 118）的室內。
LAWWW 的 Blender 子代理臨時代 LAWWW2 做；Blender 5.2（一間店一個 Blender 程序）：
  /opt/blenv/bin/python tools/blender/env_second/l118_int_pasta.py [-- [--out-dir assets/models/env/second_ai] [--preview]]
產出（覆蓋）：assets/models/env/second_ai/l118_pasta.glb、.json、.layout.json；--preview：docs/art-rebuild/second_ai/wip/l118_int_1111/pasta_door.jpg、pasta_back.jpg。
參考圖：docs/handoff/user_specs/l118_ref/int_pasta.webp；店名、品名、價錢照 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md（不照圖抄：圖上的辣味鮮蝦麵、加麵、套餐、$109～$159 都不是規格的）。
共用的零件在 l118_int_omu.py（說明見那個檔的檔頭）。
這間（兩組參考圖都是使用者的，合起來做）：奶油色牆＋淺木腰牆、紅色門框、門口紅地墊、白色圓罩吊燈、淺木桌椅＋米色坐墊（int2）；
  最裡面淺木吧台＋五張高背吧台椅、對著開放料理檯（爐台、抽油煙罩、掛著的鍋、調味罐架、雙門冰箱），吧台上方一排四張紅框的麵照片（int2）；
  右牆靠牆一條淺木吧台＋四張高背吧台椅、紅框黑板菜單；左牆店名字樣（紅色叉子捲麵、「平價義大利麵・學生最愛」）、三張麵的照片、木層板放義大利麵罐；右後白門簾；入口木掛牌、A 字黑板（int 第一組）。
  int2 黑板上的字是日文和日圓——不照抄，菜單字用文字規格的品名和價錢。四人桌三張（左牆一張、中間兩張）、21 席。
  店員支線 SQ12 做完以後的照片 TRACE_SQ12_photo 保留（aa_support/sq_traces.py 的 Part／picture），掛在隔間牆上。
這間有一場用 2D 背景的戲（不歸這支管，3D 室內只管平常進店）。"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import l118_int_omu as K   # noqa: E402
from l118_int_omu import LS, L, B, Mesh, CMesh, Matrix, g2b, Image, ImageDraw, ImageFilter, F, hexrgb, shade, ctext, fit, PI, H, ccyl, csph, clathe, rbox, rot, uvquad   # noqa: E402
from l118_int_noodle2 import mask_mat, jar   # noqa: E402

REG = {'MENU': (0, 0, 448, 560), 'P1': (448, 0, 736, 288), 'P2': (736, 0, 1024, 288), 'P3': (448, 288, 736, 576), 'P4': (736, 288, 1024, 576), 'ABOARD': (0, 560, 264, 1024),
       'SIGN': (264, 560, 520, 816), 'HOURS': (264, 816, 520, 1024), 'NOREN': (520, 576, 792, 832), 'NOTE': (792, 576, 1024, 832), 'SNAP': (520, 832, 1024, 1024)}
PAINT = {'NAME': (0, 0, 1024, 512)}
MENU = [('番茄肉醬麵', 170), ('奶油雞肉麵', 190), ('青醬培根麵', 190), ('蒜香蛤蜊麵', 210)]   # 使用者文字規格第二節 6
NAME = '義大麵屋'; RED = (176, 44, 36); BRN = (112, 52, 34)


def fork_logo(d, cx, cy, s, col, w=8):
    """叉子捲麵的線稿：幾圈橢圓（捲起來的麵）＋一支斜的叉子"""
    for k in range(4): d.ellipse([cx - s * (1.0 - k * 0.2), cy - s * (0.34 - k * 0.07) + k * s * 0.02, cx + s * (1.0 - k * 0.2), cy + s * (0.34 - k * 0.07) + k * s * 0.02], outline=col, width=w)
    d.line([(cx + s * 0.1, cy - s * 0.05), (cx + s * 1.25, cy - s * 0.62)], fill=col, width=w + 3)
    for k in (-1, 0, 1): d.line([(cx + s * 0.1 + k * s * 0.07, cy - s * 0.05 + k * s * 0.1), (cx - s * 0.32 + k * s * 0.07, cy + s * 0.14 + k * s * 0.1)], fill=col, width=w - 2)


def flag(d, x, y, w, h):
    for k, col in enumerate(((0, 140, 69), (244, 245, 240), (205, 33, 42))): d.rectangle([x + k * w / 3, y, x + (k + 1) * w / 3, y + h], fill=col)


def atlas(hours):
    im = Image.new('RGB', (1024, 1024), '#808080'); wh = (244, 238, 224)
    # MENU：紅框黑板菜單（四樣＋價錢）
    w, h = 448, 560; a = K.chalk(w, h, '#2a2c2a', 4); d = ImageDraw.Draw(a); d.rectangle([0, 0, w - 1, h - 1], outline=RED, width=14)
    ctext(d, w / 2, 34, '義大利麵', F(62), wh); ctext(d, w / 2 + 96, 104, 'menu', F(34), (226, 200, 150)); d.line([(50, 150), (w - 50, 150)], fill=(200, 196, 184), width=3)
    K.menu_lines(d, 44, w - 44, 176, MENU, 40, wh, (240, 214, 150), gap=78, dots=True); fork_logo(d, w / 2, 500, 56, wh, 4); K.put(im, REG, 'MENU', a)
    # P1～P4：四張麵的照片（品名照規格：番茄肉醬、奶油雞肉、青醬培根、蒜香蛤蜊）
    for key, kind in (('P1', 'pasta_tomato'), ('P2', 'pasta_cream'), ('P3', 'pasta_pesto'), ('P4', 'pasta_clam')): K.put(im, REG, key, K.dish(kind, 288, 288))
    # ABOARD：門口的 A 字黑板（紅框）：今日推薦（品名、價錢是規格的）
    w, h = 264, 464; a = K.chalk(w, h, '#2b2a28', 6); d = ImageDraw.Draw(a); d.rectangle([0, 0, w - 1, h - 1], outline=RED, width=10)
    ctext(d, w / 2, 26, '今日推薦', F(46), (250, 214, 90)); d.line([(34, 92), (w - 34, 92)], fill=wh, width=3); ctext(d, w / 2, 110, MENU[0][0], F(40), wh); ctext(d, w / 2, 164, '$' + str(MENU[0][1]), F(48), (250, 214, 90))
    ph = K.dish('pasta_tomato', 200, 170); a.paste(ph, (32, 240)); d.rectangle([32, 240, 231, 409], outline=wh, width=3); K.put(im, REG, 'ABOARD', a)
    # SIGN：門上的木掛牌（店名、歡迎光臨）
    w, h = 256, 256; a = K.wood_tex(w, h, '#d6b27c', 21); d = ImageDraw.Draw(a); ctext(d, w / 2, 30, NAME, F(56), BRN); flag(d, 92, 112, 72, 22); ctext(d, w / 2, 160, '歡迎光臨', F(46), BRN); d.rectangle([4, 4, w - 5, h - 5], outline=shade(hexrgb('#d6b27c'), 0.7), width=5); K.put(im, REG, 'SIGN', a)
    # HOURS
    w, h = 256, 208; a = K.paper(w, h, '#fbf6e8', 7); d = ImageDraw.Draw(a); ctext(d, w / 2, 16, '營業時間', F(36), (60, 44, 30)); yy = 76
    for ln in hours.split('；'): ctext(d, w / 2, yy, ln, fit(d, ln, w - 20, 28), (80, 64, 50)); yy += 46
    d.rectangle([3, 3, w - 4, h - 4], outline=RED, width=5); K.put(im, REG, 'HOURS', a)
    # NOREN：廚房門口的白門簾（紅色叉子捲麵、下面一條義大利三色）
    w, h = 272, 256; a = Image.new('RGB', (w, h), '#f4efe4'); d = ImageDraw.Draw(a)
    for x in range(0, w, 4): d.line([(x, 0), (x, h)], fill=shade((244, 239, 228), 0.97 + 0.04 * ((x * 5) % 9) / 9), width=2)
    d.line([(w / 2, 0), (w / 2, h)], fill=(214, 206, 190), width=3); fork_logo(d, 68, 120, 40, RED, 4); fork_logo(d, 204, 120, 40, RED, 4); flag(d, 20, 222, 100, 12); flag(d, 152, 222, 100, 12); K.put(im, REG, 'NOREN', a)
    # NOTE：冰箱上的便條（黃紙）；SNAP：牆上的小照片（義大利街景的小卡，程式畫的色塊）
    a = K.paper(232, 256, '#f3dc84', 9); d = ImageDraw.Draw(a); ctext(d, 116, 40, '麵的軟硬', F(42), (70, 50, 30)); ctext(d, 116, 110, '可以跟老闆說', F(34), (70, 50, 30)); ctext(d, 116, 180, '加麵請先講', F(34), (150, 60, 30)); K.put(im, REG, 'NOTE', a)
    w, h = 504, 192; a = Image.new('RGB', (w, h), '#f4efe4'); d = ImageDraw.Draw(a); rr = random.Random(8)
    for k in range(4):
        x0 = 8 + k * 124; d.rectangle([x0, 8, x0 + 112, 183], fill=(250, 248, 242)); sky = rr.choice([(170, 200, 224), (226, 196, 150), (190, 210, 200)]); d.rectangle([x0 + 8, 16, x0 + 104, 150], fill=sky)
        for j in range(4): bx = x0 + 8 + j * 24; bh = rr.randint(50, 110); d.rectangle([bx, 150 - bh, bx + 22, 150], fill=rr.choice([(214, 150, 110), (226, 190, 140), (190, 120, 96), (240, 214, 170)])); d.rectangle([bx + 6, 150 - bh + 12, bx + 14, 150 - bh + 26], fill=(90, 70, 60))
    K.put(im, REG, 'SNAP', a)
    return im


def paint_atlas():
    """去背的字樣（RGBA）：左牆的店名（紅色叉子捲麵、深紅咖啡色的「義大麵屋」、「平價義大利麵・學生最愛」、兩面小三色旗）"""
    im = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fork_logo(d, 470, 90, 130, RED + (255,), 9)
    for i, ch in enumerate(NAME): ctext(d, 170 + i * 228, 180, ch, F(210), BRN + (255,))
    flag(d, 90, 440, 78, 36); ctext(d, 512, 424, '平價義大利麵・學生最愛', F(60), BRN + (255,)); flag(d, 860, 440, 78, 36)
    return im


def chair(c, x, z, yaw): K.chair_slat(c, x, z, yaw, col='#d3a970', cush='#e9dcc4', slats=4)


def bar_chair(c, x, z, yaw, col='#d3a970'):
    """高背木頭吧台椅：座面 0.76 m（坐下抬高 BAR_LIFT）、四支腳、腳踏橫桿、直條靠背"""
    T = rot(x, z, yaw); v = c.vc; top = 0.76
    rbox(v, T, -0.19, 0.19, top - 0.035, top, -0.14, 0.18, col, r=0.008, seg=1)   # 椅面停在後腳前面（不和後腳共面）
    for lx in (-0.165, 0.165):
        rbox(v, T, lx - 0.018, lx + 0.018, 0.0, top - 0.035, 0.125, 0.161, col); rbox(v, T, lx - 0.018, lx + 0.018, 0.0, 1.16, -0.18, -0.144, col)
    rbox(v, T, -0.147, 0.147, 1.08, 1.156, -0.176, -0.15, col); rbox(v, T, -0.147, 0.147, top + 0.07, top + 0.1, -0.174, -0.152, col)
    for k in range(3): lx = -0.09 + k * 0.09; rbox(v, T, lx - 0.015, lx + 0.015, top + 0.1, 1.08, -0.174, -0.156, col)
    rbox(v, T, -0.147, 0.147, 0.28, 0.31, 0.13, 0.156, col); rbox(v, T, -0.147, 0.147, 0.28, 0.31, -0.175, -0.149, col)
    for lx in (-0.165, 0.165): rbox(v, T, lx - 0.012, lx + 0.012, 0.4, 0.43, -0.144, 0.125, col)


def cutlery(c, x, z):
    """桌上的餐具筒（叉子湯匙）、起司粉和辣椒罐、面紙盒"""
    v = c.vc; vm = c.vm; y = 0.74
    ccyl(vm, (x, y, z), (x, y + 0.11, z), 0.036, '#c4c8cb', seg=8)
    for k in range(5): a = k * 1.3; ccyl(vm, (x + 0.015 * math.cos(a), y + 0.09, z + 0.015 * math.sin(a)), (x + 0.03 * math.cos(a), y + 0.2, z + 0.03 * math.sin(a)), 0.0045, '#d9dcde', seg=3, caps=False)
    for (dx_, col) in ((0.09, '#e9d9a4'), (0.14, '#b83a22')): ccyl(v, (x + dx_, y, z + 0.01), (x + dx_, y + 0.075, z + 0.01), 0.02, col, seg=6); ccyl(vm, (x + dx_, y + 0.075, z + 0.01), (x + dx_, y + 0.092, z + 0.01), 0.021, '#b9bec2', seg=6)
    v.cbox(x - 0.07, x + 0.05, y, y + 0.07, z - 0.14, z - 0.05, '#f4f1ea')


def build():
    sid = 'pasta'; sd = K.shop_data(sid); hours = sd['hours']['text']
    assert [tuple(m) for m in sd['menu']] == MENU and sd['name'] == NAME, '店家資料和這裡寫的菜單不一樣'
    spec = dict(floor=('terrazzo_tiles', '#d9cfbf', 1.2), wall='#f6ebd3', wain=('walnut_veneer', '#dbb985', 1.0), wainH=0.95, wood=('walnut_veneer', '#d6ae76'), trim='#c9a877', ceil='#f2ead8')
    os.makedirs(LS.GEN, exist_ok=True); paint_atlas().save(os.path.join(LS.GEN, 'l118_pasta_paint.png'))
    c = K.begin(sid, spec, REG, atlas(hours)); X0, X1, Z0, Z1 = c.X0, c.X1, c.Z0, c.Z1; v = c.vc; vm = c.vm; LW = '#d3a970'; RD = '#b02c24'; dx = c.S['door_x']; rr = c.rng
    paint = mask_mat('l118_pasta_paint', 'l118_pasta_paint.png')
    K.shell2(c, frame='#c8a474', doorc=RD, handle='#c9ccce', base='#c9a877', backs=[K.street_back(c, 'pasta_p1', -2.5, 1.2, 0.78, 1.9), K.street_back(c, 'pasta_p2', -1.4, 1.2, 0.78, 1.9)])   # 奶油色牆＋淺木腰牆（int2）、紅色門框（int2）、淺木窗框
    # 海報的背面照街上那兩張（wz_shopkit.py SHOPS['pasta'] photos）換算：x 1.41～2.19、0.31～1.09，y 1.2～2.21（原本 −0.85～−0.05、0.3～1.1，y 1.0～1.9 的米白方塊——第一張的位置街上沒有海報）
    v.cbox(dx - 0.6, dx + 0.6, 0.0, 0.008, 2.95, 3.95, '#a8322a'); v.cbox(dx - 0.56, dx + 0.56, 0.008, 0.01, 2.99, 3.91, '#b8382e')        # 門口的紅地墊（int2）
    # ---- 最裡面：開放料理檯（後牆的爐台、抽油煙罩、掛著的鍋、調味罐架、雙門冰箱）----
    LS.frying_station(c, -1.9, 1.0, Z0, pans=3)
    clathe(vm, [(0.0, 0.0), (0.17, 0.0), (0.17, 0.24), (0.18, 0.25), (0.0, 0.02)], -0.2, 0.9, Z0 + 0.36, '#c4c8cb', seg=12); clathe(vm, [(0.0, 0.0), (0.13, 0.0), (0.13, 0.16), (0.14, 0.17), (0.0, 0.02)], 0.72, 0.9, Z0 + 0.34, '#c4c8cb', seg=12)
    trN = c.wg('N', 'trim', c.M['vc'], cm=True)
    ccyl(trN, (-1.75, 1.86, Z0 + 0.05), (-0.5, 1.86, Z0 + 0.05), 0.012, '#c9ced2', seg=5)                                                  # 掛鍋的橫桿
    for k in range(3):
        px = -1.5 + k * 0.4; ccyl(trN, (px, 1.6, Z0 + 0.05), (px, 1.61, Z0 + 0.07), 0.15 - k * 0.015, '#2a2a2a', seg=12); trN.cbox(px - 0.012, px + 0.012, 1.74, 1.86, Z0 + 0.045, Z0 + 0.065, '#2a2a2a')
    for y in (1.35, 1.72):                                                                                                                # 抽油煙罩下面右半的調味罐架
        trN.cbox(-0.2, 1.1, y - 0.02, y, Z0, Z0 + 0.22, '#c9ced2'); xx = -0.1
        while xx < 1.05:
            if rr.random() < 0.75: jar(trN, xx, y, Z0 + 0.11, rr.choice(['#c8a04a', '#8a3a2a', '#e6d9b8', '#5a7a2a', '#d9c7a0', '#a8422a', '#e8d070']), r=0.04, h=rr.uniform(0.1, 0.15), lid='#b9bec2'); xx += 0.115
            else: clathe(trN, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.15), (0.012, 0.2), (0.012, 0.24), (0.0, 0.24)], xx, y, Z0 + 0.11, rr.choice(['#c9b23a', '#b83a22', '#2f4a2a']), seg=6); xx += 0.1
    c.steel.box(X0 + 0.15, -2.15, 0.0, 1.95, Z0, Z0 + 0.72); vm.cbox(X0 + 0.15, -2.15, 0.0, 0.1, Z0 + 0.02, Z0 + 0.73, '#2a2b2d'); vm.cbox(-2.99, -2.96, 0.14, 1.9, Z0 + 0.72, Z0 + 0.73, '#55585c')   # 雙門冰箱
    for xx in (-3.08, -2.88): vm.cbox(xx, xx + 0.02, 0.85, 1.4, Z0 + 0.73, Z0 + 0.765, '#d9dcde')
    K.print_quad(c, c.prt, [(-3.6, 1.35, Z0 + 0.735), (-3.37, 1.35, Z0 + 0.735), (-3.37, 1.6, Z0 + 0.735), (-3.6, 1.6, Z0 + 0.735)], 'NOTE')
    # ---- 料理檯前面的淺木吧台（int2：吧台對著廚房）＋五張高背吧台椅；左端收銀、左邊一扇矮門 ----
    # 坐下膝蓋進前板（LAWWW 11-11 09:41，BB／LAWWW 第 3 點：#2 #3 小腿打到吧台木頭邊）：原本前板在 z −2.25、椅子 −1.92，祐廷的膝蓋前緣到 −2.35（進前板 5 cm）、
    # 店裡男客人（膝蓋在前面 0.5 m）更多。改成：前板往裡退 0.15（kp −2.40，檯面照舊伸到 −2.11＝留 0.29 m 放腳的空間，下面四個托架、兩端側板）＋椅子往外 0.12（−1.80）：
    # 祐廷膝蓋前緣約 −2.24（離前板 16 cm）、男客人約 −2.36（4 cm）
    kx0, kx1, kz0, kz1, kh = -2.6, 1.4, -2.65, -2.25, 1.05; kp = kz1 - 0.15; sz = kz1 + 0.45
    c.wood.rbox(kx0 - 0.04, kx1 + 0.04, kh - 0.05, kh, kz0 - 0.05, kz1 + 0.14, r=0.008, seg=2)
    n = 20; w_ = (kx1 - kx0) / n
    for k in range(n): c.wood.box(kx0 + k * w_ + 0.005, kx0 + (k + 1) * w_ - 0.005, 0.1, kh - 0.05, kp - 0.03, kp)                           # 吧台正面的直木板（往裡退到 kp）
    v.cbox(kx0, kx1, 0.0, kh - 0.05, kz0, kp - 0.03, '#b98f58'); v.cbox(kx0, kx1, 0.0, 0.1, kz0, kp + 0.005, '#8a6a48'); vm.cbox(kx0 + 0.3, kx1 - 0.1, 0.22, 0.25, kp + 0.06, kp + 0.09, '#9aa0a4')   # 檯身、踢腳、腳踏桿
    for xx in (kx0 + 0.4, -0.6, 0.4, kx1 - 0.2): vm.cbox(xx - 0.012, xx + 0.012, 0.22, 0.25, kp, kp + 0.075, '#9aa0a4')
    for xx in (kx0 + 0.02, kx1 - 0.02): c.wood.box(xx - 0.02, xx + 0.02, 0.0, kh - 0.05, kp, kz1 + 0.1)                                        # 兩端的側板（檯面下放腳的空間收邊）
    for xx in (-1.075, -0.425, 0.225, 0.875):                                                                                            # 檯面伸出去那一段的托架（兩張椅子中間；階梯形）
        c.wood.box(xx - 0.02, xx + 0.02, kh - 0.13, kh - 0.05, kp, kz1 + 0.1); c.wood.box(xx - 0.02, xx + 0.02, kh - 0.25, kh - 0.13, kp, kz1 - 0.04)
    LS.register(c, -2.25, kh, -2.45, face='+z')
    for k in range(2): K.plates(v, -1.55 + k * 0.3, kh, -2.5, n=8 - k * 2, r=0.12)
    ccyl(vm, (-0.5, kh, -2.5), (-0.5, kh + 0.12, -2.5), 0.05, '#c4c8cb', seg=8)
    for k in range(3): ccyl(vm, (-0.5 + (k - 1) * 0.02, kh + 0.1, -2.5), (-0.5 + (k - 1) * 0.05, kh + 0.26, -2.49), 0.005, '#d9dcde', seg=3, caps=False)
    for (xx, col) in ((0.5, '#c9b23a'), (0.62, '#4a2c18')): clathe(v, [(0.0, 0.0), (0.03, 0.0), (0.03, 0.16), (0.012, 0.21), (0.012, 0.25), (0.0, 0.25)], xx, kh, -2.5, col, seg=6)
    K.pot_plant(c, 1.2, -2.5, kh, h=0.3, seed=7, r=0.09, pot='#f1ece0'); K.vine(c, v, 1.3, kh + 0.14, -2.3, 0.45, 91, out=(0, 1))
    for xx in (-1.4, -0.75, -0.1, 0.55, 1.2):
        bar_chair(c, xx, sz, PI); c.seat(xx, sz, PI, (xx, -2.45), 'eat', ap=(xx, sz + 0.54), label='坐吧檯', lift=K.BAR_LIFT)   # 原本 z kz1＋0.33（−1.92）、走近點 −1.38
    v.cbox(X0 + 0.02, kx0 - 0.04, 0.12, 0.9, -2.47, -2.43, LW); v.cbox(X0 + 0.02, kx0 - 0.04, 0.82, 0.9, -2.48, -2.42, '#b98f58'); v.cbox(X0, X0 + 0.06, 0.0, 0.95, -2.5, -2.4, '#b98f58')   # 員工進出的矮門
    # 吧台上方的橫牆（一排四張紅框的麵照片，int2）＋右後的隔間牆、門洞（白門簾，int 第一組）；都在料理檯這一條線上
    wN = c.wg('N', 'wall', c.M['wall']); c.WGP[('N', 'parttrim')] = c.WGP[('N', 'partprint')] = {'at': [0.0, 1.6, -2.25]}                     # 橫牆、隔間牆放進後牆那一片（要盒狀 UV：LS.finish 只幫 wall／wain 做）；框和照片的淡出判斷點放在這一條線上
    pt = c.wg('N', 'parttrim', c.M['vc'], cm=True); pp = c.wg('N', 'partprint', c.M['print']); zp = -2.25; d0, d1 = 1.65, 2.45; hy = 2.12
    for (xa, xb, ya, yb) in ((X0, kx1 + 0.04, hy, H), (kx1 + 0.04, d0, 0.0, H), (d1, X1, 0.0, H), (d0, d1, 2.1, H)): wN.quad([(xa, ya, zp), (xb, ya, zp), (xb, yb, zp), (xa, yb, zp)])
    pt.cbox(X0, kx1 + 0.04, hy - 0.06, hy, zp - 0.08, zp + 0.02, LW); pt.cbox(kx1 - 0.02, kx1 + 0.1, 0.0, hy, zp - 0.08, zp + 0.02, LW)          # 橫牆下緣的木條、吧台右端的柱
    for k, key in enumerate(('P1', 'P2', 'P3', 'P4')):
        xc = -2.25 + k * 1.1; pt.cbox(xc - 0.4, xc + 0.4, 2.26, 3.06, zp, zp + 0.022, RD)
        K.print_quad(c, pp, [(xc - 0.35, 2.31, zp + 0.026), (xc + 0.35, 2.31, zp + 0.026), (xc + 0.35, 3.01, zp + 0.026), (xc - 0.35, 3.01, zp + 0.026)], key)
    for xx in (d0, d1): pt.cbox(xx - 0.04, xx + 0.04, 0.0, 2.14, zp - 0.06, zp + 0.02, LW)
    pt.cbox(d0 - 0.04, d1 + 0.04, 2.1, 2.17, zp - 0.06, zp + 0.02, LW); pt.cbox(d0, d1, 2.04, 2.07, zp + 0.02, zp + 0.045, '#8a6a48')
    K.print_quad(c, pp, [(d0 + 0.02, 1.3, zp + 0.035), (d1 - 0.02, 1.3, zp + 0.035), (d1 - 0.02, 2.05, zp + 0.035), (d0 + 0.02, 2.05, zp + 0.035)], 'NOREN')
    pt.poly([(d0, 0.0, zp - 0.5), (d1, 0.0, zp - 0.5), (d1, 2.1, zp - 0.5), (d0, 2.1, zp - 0.5)], '#cfc8b8')                                  # 門洞裡面（門簾下面看得到的儲藏間）
    # 店員支線 SQ12 做完以後多的那張照片（TRACE_SQ12_photo；遊戲照名字開關，tests/sq_traces_unit.js）：原本在開放廚房的後牆，現在掛在隔間牆上（門簾右邊、靠牆吧台上面）
    sys.path.insert(0, os.path.join(HERE, 'aa_support')); import sq_traces as TR
    src = TR.tex_white_border(os.path.join(LS.GEN, 'sq12_photo.png'), os.path.join(LS.GEN, 'sq12_photo_print.png')); img, rects, suv = TR.tex_framed([src], os.path.join(LS.GEN, 'sq12_photo_framed.png'), frame=(30, 30, 30), bpx=16)
    tp = TR.Part('TRACE_SQ12_photo', wall='N'); TR.picture(tp, TR.mat_img('trace_sq12_photo', img, 0.5), (3.05, 1.55, zp + 0.012), 0.32, 0.25, '+z', rect=rects[0], side_uv=suv); tp.finish(c.root)
    c.block(X0, X1, Z0, kz1 + 0.03, 'open_kitchen')
    c.counter = dict(x0=kx0, x1=kx1, z0=kz0, z1=kz1, h=kh, note='淺木吧台（後面是開放料理檯：爐台、抽油煙罩）；吧台對著廚房')
    c.clerk = dict(x=-0.3, z=-3.15, yaw=0.0, note='吧台後面、爐台前面（開放料理檯），面向吧台和店裡；店員＝老闆（兼主廚，AA_772 staff）')
    c.order = dict(x=-2.25, z=-1.7, r=0.8, label='點餐（' + c.T['name'] + '）', note='吧台左端的收銀前面（shop118:pasta）')
    c.look('open_kitchen', 2.05, -1.75, 0.9, '開放料理檯', note='（鍋子一翻，蒜的味道飄到吧檯這一邊。）', dev='AA_772 look_lines pasta；吧台右端外面（看得到爐台的地方；吧台椅的範圍外）')
    # ---- 右牆：靠牆的淺木吧台＋四張高背吧台椅（int 第一組）----
    bx0, bz0, bz1, bh = X1 - 0.46, -1.45, 2.55, 1.05
    c.wood.rbox(bx0, X1, bh - 0.045, bh, bz0, bz1, r=0.008, seg=2)
    for zz in (bz0 + 0.3, (bz0 + bz1) / 2, bz1 - 0.3): v.cbox(X1 - 0.34, X1, bh - 0.3, bh - 0.045, zz - 0.02, zz + 0.02, LW); v.cbox(X1 - 0.05, X1, 0.5, bh - 0.045, zz - 0.02, zz + 0.02, LW)
    for zz in (-0.65, 0.15, 0.95, 1.75):
        bar_chair(c, 2.98, zz, PI / 2); c.seat(2.98, zz, PI / 2, (X1 - 0.23, zz), 'eat', ap=(2.25, zz), label='坐吧檯', lift=K.BAR_LIFT); c.seats[-1]['r'] = 0.9
    for zz in (-0.25, 1.35):                                                                                                             # 吧台上的調味罐、餐具筒（檯面 1.05）
        for (dz_, col) in ((0.0, '#e9d9a4'), (0.06, '#b83a22')): ccyl(v, (X1 - 0.14, bh, zz + dz_), (X1 - 0.14, bh + 0.075, zz + dz_), 0.02, col, seg=6); ccyl(vm, (X1 - 0.14, bh + 0.075, zz + dz_), (X1 - 0.14, bh + 0.092, zz + dz_), 0.021, '#b9bec2', seg=6)
        ccyl(vm, (X1 - 0.14, bh, zz - 0.1), (X1 - 0.14, bh + 0.1, zz - 0.1), 0.034, '#c4c8cb', seg=8)
    K.pot_plant(c, X1 - 0.2, 2.3, bh, h=0.28, seed=3, r=0.09, pot='#f1ece0')
    v.cbox(2.95, 3.45, 0.0, 0.5, -2.1, -1.6, '#b98f58'); K.pot_plant(c, 3.2, -1.85, 0.5, h=0.6, seed=14, r=0.15, n=24, pot='#f1ece0', col='#4f9a37')   # 隔間牆前面：木箱上的大盆栽
    c.block(2.6, X1, -2.25, bz1, 'wall_bar')
    trE = c.wg('E', 'trim', c.M['vc'], cm=True); trW = c.wg('W', 'trim', c.M['vc'], cm=True)
    K.framed(c, 'E', 0.75, 1.95, 1.45, 2.95, 'MENU', col=RD, t=0.02)
    K.framed(c, 'E', -1.05, 0.15, 1.7, 2.157, 'SNAP', col=RD, t=0.03)
    trE.cbox(X1 - 0.2, X1, 2.5, 2.53, -2.1, -1.4, LW); K.pot_plant(c, X1 - 0.11, -1.6, 2.53, h=0.2, seed=6, r=0.075, m=trE, pot='#f1ece0'); K.vine(c, trE, X1 - 0.18, 2.52, -1.45, 0.9, 71, out=(-1, 0)); K.vine(c, trE, X1 - 0.18, 2.52, -1.9, 0.5, 72, out=(-1, 0))
    # ---- 桌椅：左牆一張四人桌、中間兩張四人桌（淺木桌面、灰鐵方腳、淺木直條椅＋米色坐墊）----
    TK = dict(legs='four', legc='#7d8083', half=0.8, td=0.7, gap=0.22)
    t = K.table_unit(c, (X0, -2.6), (-3.74, -2.66), -0.25, [-3.42, -2.9], [(-2.6, 1)], chair, **TK); cutlery(c, t[0] - 0.2, t[1])
    for tz in (0.15, 1.75):   # 中間兩張（第 1 版三張、25 席：店內客人同時最多 10 位，位子太多看起來永遠空空的——tests/shop_diners_unit.js；現在 21 席）
        t = K.table_unit(c, (-1.0, 0.2), (-0.98, 0.18), tz, [-0.7, -0.1], [(-1.0, -1), (0.2, 1)], chair, **TK); cutlery(c, t[0] - 0.05, t[1])
    # ---- 左牆：店名字樣（去背）、三張麵的照片、木層板（義大利麵罐）、黃金葛；門邊 A 字黑板、盆栽 ----
    pw = c.wg('W', 'paint', paint); uvquad(pw, [(X0 + 0.012, 1.85, 3.5), (X0 + 0.012, 1.85, 1.1), (X0 + 0.012, 3.05, 1.1), (X0 + 0.012, 3.05, 3.5)], (0.0, 0.5, 1.0, 1.0))
    for k, key in enumerate(('P2', 'P1', 'P3')): zc_ = 3.05 - k * 0.75; K.framed(c, 'W', zc_ - 0.3, zc_ + 0.3, 1.12, 1.72, key, col=LW, t=0.045)
    for (y, za, zb) in ((2.3, -1.2, 0.5), (1.85, -1.2, 0.5)):
        trW.cbox(X0, X0 + 0.24, y - 0.035, y, za, zb, LW)
        for zz in (za + 0.12, zb - 0.12): trW.cbox(X0, X0 + 0.2, y - 0.2, y - 0.035, zz - 0.015, zz + 0.015, LW)
    for (y, zs) in ((2.3, (-0.9, -0.55, -0.2)), (1.85, (-1.0, -0.65))):
        for zz in zs:                                                                                                                 # 玻璃罐裝的義大利麵（顏色不同的罐子）
            ccyl(trW, (X0 + 0.12, y, zz), (X0 + 0.12, y + 0.26, zz), 0.07, rr.choice(['#e8cf8a', '#e0b85a', '#d8a84a', '#c8d27a']), seg=8); ccyl(trW, (X0 + 0.12, y + 0.26, zz), (X0 + 0.12, y + 0.29, zz), 0.073, '#b98f58', seg=8)
    for k in range(5): trW.cbox(X0 + 0.04, X0 + 0.2, 1.85, 1.85 + rr.uniform(0.2, 0.27), -0.25 + k * 0.05, -0.21 + k * 0.05, rr.choice([RD, '#2a6a4a', '#e8dcc0', '#d8a84a']))
    K.pot_plant(c, X0 + 0.13, 0.25, 2.3, h=0.22, seed=4, r=0.08, m=trW, pot='#f1ece0'); K.vine(c, trW, X0 + 0.2, 2.29, 0.42, 1.0, 81, out=(1, 0)); K.vine(c, trW, X0 + 0.2, 2.29, 0.1, 0.55, 82, out=(1, 0))
    K.vine(c, trW, X0 + 0.06, 3.1, 3.95, 1.5, 83, out=(1, 0)); K.vine(c, trW, X0 + 0.06, 3.1, 3.7, 0.9, 84, out=(1, 0)); K.vine(c, trW, X0 + 0.06, 3.1, 3.45, 0.5, 85, out=(1, 0))
    K.a_board(c, -3.3, 2.15, PI / 2, 'ABOARD', w=0.5, h=0.9, col=RD); K.pot_plant(c, -3.4, 1.2, 0.0, h=0.7, seed=11, r=0.15, n=24, pot='#f1ece0', col='#4f9a37'); c.block(X0, -3.0, 0.55, 2.55, 'a_board_plant')
    K.pot_plant(c, X1 - 0.28, 3.75, 0.0, h=0.75, seed=12, r=0.15, n=24, pot='#f1ece0', col='#5f9a3c')
    # 門上的木掛牌、營業時間
    K.print_quad(c, c.wg('S', 'print', c.M['print']), [(dx + 0.2, 1.42, Z1 - 0.06), (dx - 0.2, 1.42, Z1 - 0.06), (dx - 0.2, 1.82, Z1 - 0.06), (dx + 0.2, 1.82, Z1 - 0.06)], 'SIGN')
    LS.printed(c, 'S', dx + 0.6, dx + 1.02, 1.25, 1.59, 'HOURS', inset=0.03)
    # ---- 天花板：白色圓罩吊燈、兩條軌道燈、吸頂冷氣、嵌燈 ----
    lamps = [(-3.2, -0.25), (-0.4, 0.15), (-0.4, 1.75), (-1.4, -1.75), (0.6, -1.75), (2.4, 0.2), (2.4, 1.9)]
    for (x_, z_) in lamps: K.pendant2(c, x_, z_, 2.52, '#f1ece0', r=0.26, seg=14, drop=0.16)
    cf = c.cf
    for (xa, za, zb) in ((-2.0, -1.2, 3.6), (1.4, -1.2, 3.6)):
        cf.cbox(xa - 0.02, xa + 0.02, H - 0.1, H - 0.06, za, zb, '#f1efe8')
        for zz in (za, (za + zb) / 2, zb): ccyl(cf, (xa, H - 0.06, zz), (xa, H - 0.001, zz), 0.008, '#d9d7d0', seg=4, caps=False)
        for k in range(4):
            zz = za + 0.5 + k * (zb - za - 1.0) / 3; sx = -0.1 if k % 2 else 0.1
            ccyl(cf, (xa, H - 0.1, zz), (xa + sx, H - 0.24, zz + 0.04), 0.045, '#f1efe8', seg=7); c.cw.cyl((xa + sx, H - 0.24, zz + 0.04), (xa + sx * 1.06, H - 0.248, zz + 0.043), 0.036, seg=7)
    for (x_, z_) in ((-2.9, 2.2), (-2.9, 3.4), (0.9, -0.6), (0.9, 2.4), (3.1, 3.3), (3.1, -0.2), (-1.5, 0.6), (-1.5, 2.4)): K.downlight(c, x_, z_)
    K.cassette_ac(c, 1.0, 0.9)
    lay = K.end(c, 'L118-SHOPS-REDO-1111（使用者 2026-11-11 規格＋參考圖 int_pasta.webp、int2_pasta.webp）；店名、菜單 AA_280；室內 tools/blender/env_second/l118_int_pasta.py（LAWWW 子代理代 LAWWW2）')
    if '--preview' in K.ARGS:
        pts = [(x_, 2.45, z_, 22) for (x_, z_) in lamps] + [(-0.4, 2.0, Z0 + 1.0, 40), (-2.2, 2.8, 2.6, 20), (1.6, 2.8, 3.0, 20)]   # 這間的牆、地板、桌椅都是淺色：燈比另外兩間弱、曝光降一格半（第一次算的圖整張過曝）
        K.preview(sid, [['door', [dx + 0.3, 1.5, Z1 - 0.3], [0.6, 1.2, Z0 + 1.6], 17], ['back', [0.3, 1.75, -1.5], [-0.6, 1.0, Z1], 15]], pts, samples=28, exposure=-1.5)
    return lay


if __name__ == '__main__':
    build()
