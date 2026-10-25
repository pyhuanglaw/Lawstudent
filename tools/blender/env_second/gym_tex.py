"""新體育館 1F 多功能球場的地板與看板貼圖（BB_151，LAWWW2-B 2026-10-16）：本作程式畫。
- gym_floor.jpg：40 m × 30 m 的楓木運動地板（2048×1536，約 51 px/m）＋球場線
  - 羽球場 6 面（白線；雙打 13.40×6.10 m、單打邊線往內 0.46 m、前發球線離網 1.98 m、雙打後發球線離底線 0.76 m、中線）
  - 籃球場 1 面（深藍線；28×15 m 橫放在中間：中線、中圈、三分線 6.75 m、禁區 4.9×5.8 m、罰球圈）
- gym_hours.png：開館時間牌（BB_151 4b：週一～五 8:00～22:00、週六 9:00～22:00、週日 9:00～18:00；每月第四個週一健身中心、游泳池休館）。不寫校名、館名（D77）
- gym_score.png：記分板面板（沒有品牌）
- gym_wayfind.png、gym_directory.png、gym_notice.png：大廳的指標、樓層指引、公告欄（v2）
- arena_floor.jpg、arena_screen.png、arena_banner.png：3F 主球場的地板（籃球＋排球）、大螢幕待機畫面、典禮背板的長布（第二階段）
座標和 gym_layout.js 一致：球場地板 x −20～20、z −19～11（區域座標）。
用法：python3 tools/blender/env_second/gym_tex.py [b1]（b1：只重做 B1 健身中心那幾張：b1_rubber／b1_rubber_grey／b1_turf／b1_wall_free／b1_rules／b1_tv／b1_timer／b1_ceiling／b1_mirror，2026-10-24 v7）"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def f(sz): return ImageFont.truetype(FONT, sz)
X0, X1, Z0, Z1 = -20.0, 20.0, -19.0, 11.0
PW, PH = 2048, 1536
sx = PW / (X1 - X0); sz = PH / (Z1 - Z0)
def P(x, z): return ((x - X0) * sx, (z - Z0) * sz)          # 貼圖 v 往下＝ z 往南（+z）；Blender 端照這個對 UV

BADMINTON = [(-8.6, -11.2), (0.0, -11.2), (8.6, -11.2), (-8.6, 3.2), (0.0, 3.2), (8.6, 3.2)]   # 羽球場中心（長邊沿 z）
BASKET = (0.0, -4.0)                                                                          # 籃球場中心（長邊沿 x）


def floor():
    rng = np.random.default_rng(151)
    base = np.array([214, 168, 112], np.float32)
    a = np.zeros((PH, PW, 3), np.float32) + base
    strip = int(0.6 * sx)                                                     # 0.6 m 一段的木條（顏色差一點）
    for i in range(0, PW, strip): a[:, i:i + strip] *= rng.uniform(0.97, 1.03)
    for j in range(0, PH, int(0.057 * sz) or 2): a[j:j + 1] *= 0.94          # 木條的接縫（沿 x 的細線）
    grain = rng.normal(0, 1, (PH, PW)).astype(np.float32); grain = np.repeat(np.repeat(grain[::1, ::6], 6, 1)[:, :PW], 1, 0)
    a += grain[..., None] * 4.0
    a = np.clip(a, 0, 255); im = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(im)
    lw = max(2, int(0.045 * sx))
    def line(p, q, col): d.line([P(*p), P(*q)], fill=col, width=lw)
    def rect(x0, z0, x1, z1, col):
        for p, q in (((x0, z0), (x1, z0)), ((x1, z0), (x1, z1)), ((x1, z1), (x0, z1)), ((x0, z1), (x0, z0))): line(p, q, col)
    def arc(cx, cz, r, a0, a1, col, n=48):
        pts = [P(cx + r * math.cos(a0 + (a1 - a0) * k / n), cz + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]; d.line(pts, fill=col, width=lw)
    # 籃球場（深藍，先畫：羽球的白線蓋在上面）
    B = (40, 66, 122); bx, bz = BASKET; L, Wd = 28.0, 15.0
    rect(bx - L / 2, bz - Wd / 2, bx + L / 2, bz + Wd / 2, B); line((bx, bz - Wd / 2), (bx, bz + Wd / 2), B); arc(bx, bz, 1.8, 0, 2 * math.pi, B)
    for s in (-1, 1):
        ex = bx + s * L / 2; hx = ex - s * 1.575                                     # 籃框中心
        rect(min(ex, ex - s * 5.8), bz - 2.45, max(ex, ex - s * 5.8), bz + 2.45, B)   # 禁區
        arc(ex - s * 5.8, bz, 1.8, -math.pi / 2, math.pi / 2, B) if s < 0 else arc(ex - s * 5.8, bz, 1.8, math.pi / 2, 3 * math.pi / 2, B)
        line((ex, bz - 6.6), (ex - s * 2.99, bz - 6.6), B); line((ex, bz + 6.6), (ex - s * 2.99, bz + 6.6), B)
        a0 = math.asin(6.6 / 6.75)
        if s < 0: arc(hx, bz, 6.75, -a0, a0, B)
        else: arc(hx, bz, 6.75, math.pi - a0, math.pi + a0, B)
    # 羽球場（白）
    Wt = (246, 246, 240)
    for (cx, cz) in BADMINTON:
        x0, x1, z0, z1 = cx - 3.05, cx + 3.05, cz - 6.7, cz + 6.7
        rect(x0, z0, x1, z1, Wt)
        for xx in (x0 + 0.46, x1 - 0.46): line((xx, z0), (xx, z1), Wt)               # 單打邊線
        for s in (-1, 1):
            line((x0, cz + s * 1.98), (x1, cz + s * 1.98), Wt)                       # 前發球線
            line((x0, cz + s * (6.7 - 0.76)), (x1, cz + s * (6.7 - 0.76)), Wt)       # 雙打後發球線
            line((cx, cz + s * 1.98), (cx, cz + s * 6.7), Wt)                        # 中線
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    # 亮漆的反光（中間亮、靠牆暗一點）
    v = np.asarray(im).astype(np.float32); yy, xx = np.mgrid[0:PH, 0:PW]; r = np.hypot((xx - PW / 2) / PW, (yy - PH / 2) / PH)
    v *= (1.04 - 0.12 * r)[..., None]; Image.fromarray(np.clip(v, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'gym_floor.jpg'), quality=88)


def hours():
    W, H = 700, 520; im = Image.new('RGB', (W, H), (34, 58, 92)); d = ImageDraw.Draw(im)
    d.rectangle([16, 16, W - 16, H - 16], outline=(220, 228, 240), width=3)
    d.text((48, 40), '開 館 時 間', font=f(48), fill=(255, 255, 255))
    rows = [('週一～週五', '08:00～22:00'), ('週六', '09:00～22:00'), ('週日', '09:00～18:00')]
    for i, (a, b) in enumerate(rows): d.text((60, 140 + i * 62), a, font=f(36), fill=(230, 236, 246)); d.text((350, 140 + i * 62), b, font=f(36), fill=(255, 220, 120))
    d.text((60, 345), '每月第四個週一', font=f(30), fill=(230, 236, 246)); d.text((60, 385), '健身中心、游泳池休館', font=f(30), fill=(230, 236, 246))
    d.text((60, 440), '進場請出示學生證・請穿室內運動鞋', font=f(26), fill=(190, 200, 216))
    im.save(os.path.join(GEN, 'gym_hours.png'))


def score():
    W, H = 1024, 384; im = Image.new('RGB', (W, H), (18, 18, 20)); d = ImageDraw.Draw(im)
    d.rectangle([8, 8, W - 8, H - 8], outline=(70, 70, 76), width=6)
    d.text((80, 30), 'HOME', font=f(54), fill=(240, 240, 240)); d.text((W - 300, 30), 'GUEST', font=f(54), fill=(240, 240, 240))
    for x0 in (60, W - 330):
        for k, ch in enumerate('00'): d.rectangle([x0 + k * 130, 110, x0 + k * 130 + 110, 300], fill=(40, 12, 10)); d.text((x0 + k * 130 + 12, 120), ch, font=f(160), fill=(255, 70, 40))
    d.rectangle([W / 2 - 110, 120, W / 2 + 110, 230], fill=(40, 30, 8)); d.text((W / 2 - 100, 125), '10:00', font=f(80), fill=(255, 200, 60))
    d.text((W / 2 - 60, 260), 'PERIOD 1', font=f(34), fill=(200, 200, 200))
    im.save(os.path.join(GEN, 'gym_score.png'))


def wayfind():
    """大廳的指標（開口上方三塊，1024×128 一條）：深藍底白字＋箭頭。不寫館名（D77）"""
    W, H = 1024, 384; im = Image.new('RGB', (W, H), (26, 44, 74)); d = ImageDraw.Draw(im)
    rows = [('←', '3F 主球場', '典禮・演講・演唱會'), ('↑', '1F 多功能球場', '羽球・籃球・體育課'), ('→', 'B1 健身中心・游泳池', '溫水游泳池・重量訓練')]
    for i, (ar, a, b) in enumerate(rows):
        y = i * 128; d.rectangle([0, y, W - 1, y + 127], fill=(26, 44, 74)); d.rectangle([0, y + 120, W, y + 127], fill=(232, 176, 60))
        d.ellipse([22, y + 16, 110, y + 104], fill=(255, 255, 255)); d.text((40, y + 14), ar, font=f(66), fill=(26, 44, 74))
        d.text((136, y + 18), a, font=f(54), fill=(255, 255, 255)); d.text((140, y + 80), b, font=f(28), fill=(196, 210, 230))
    im.save(os.path.join(GEN, 'gym_wayfind.png'))


def b1_desk():
    """B1 服務台後面牆上的牌子（1024×256）：深藍底白字、底下一條黃線（和 1F 指標同一套）。不寫館名（D77）"""
    W, H = 1024, 256; im = Image.new('RGB', (W, H), (26, 44, 74)); d = ImageDraw.Draw(im)
    d.rectangle([0, H - 12, W, H], fill=(232, 176, 60))
    d.text((60, 34), '服務台', font=f(120), fill=(255, 255, 255))
    d.text((500, 52), '學生證進場・會員申辦', font=f(46), fill=(220, 230, 244)); d.text((500, 124), '失物招領・置物櫃鑰匙', font=f(46), fill=(220, 230, 244))
    im.save(os.path.join(GEN, 'b1_desk_sign.png'))


def directory():
    """樓層指引（直的，0.9×1.2 m）"""
    W, H = 600, 800; im = Image.new('RGB', (W, H), (240, 241, 238)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 110], fill=(26, 44, 74)); d.text((40, 24), '樓 層 指 引', font=f(58), fill=(255, 255, 255))
    rows = [('3F', '主球場', ['典禮・演講・演唱會', '（整修中）']), ('1F', '多功能球場', ['羽球 6 面・籃球 1 面', '服務台・販賣機']), ('B1', '健身中心', ['游泳池（溫水）', '每月第四個週一休館'])]
    for i, (fl, a, bs) in enumerate(rows):
        y = 150 + i * 190; d.rectangle([40, y, 150, y + 110], fill=(232, 176, 60) if fl == '1F' else (26, 44, 74)); d.text((52, y + 18), fl, font=f(66), fill=(255, 255, 255))
        d.text((180, y + 2), a, font=f(48), fill=(26, 44, 74))
        for k, b in enumerate(bs): d.text((184, y + 64 + k * 38), b, font=f(28), fill=(80, 90, 104))
        d.line([40, y + 160, W - 40, y + 160], fill=(200, 204, 210), width=2)
    d.text((40, H - 60), '目前位置：1F 大廳', font=f(30), fill=(200, 80, 60))
    im.save(os.path.join(GEN, 'gym_directory.png'))


def notice():
    """大廳的軟木公告欄（3.2×1.2 m）：運動相關的公告；沒有校名、日期（不和劇情衝突）"""
    W, H = 1280, 480; rng = random.Random(7)
    a = np.zeros((H, W, 3), np.float32) + np.array([176, 128, 80], np.float32)
    a += np.random.default_rng(8).normal(0, 9, (H, W, 1)); im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W - 1, H - 1], outline=(92, 66, 44), width=16)
    posters = [((40, 40, 300, 420), (232, 108, 40), '系際盃', ['籃球賽', '報名中', '各系隊長', '請至服務台']),
               ((330, 60, 560, 330), (250, 250, 246), '羽球場', ['借用規則', '一次兩小時', '請穿室內鞋', '用完收網']),
               ((590, 30, 860, 300), (70, 150, 96), '體適能', ['檢測', '自由報名', '請洽服務台']),
               ((890, 50, 1230, 300), (52, 104, 178), '游泳池', ['冬季開放', '溫水', '請戴泳帽']),
               ((600, 330, 820, 450), (246, 214, 80), '失物招領', ['請洽服務台']),
               ((880, 330, 1100, 450), (250, 250, 246), '注意', ['球場內禁止飲食'])]
    for (x0, y0, x1, y1), col, t, lines in posters:
        dark = sum(col) < 450
        d.rectangle([x0 + 6, y0 + 6, x1 + 6, y1 + 6], fill=(120, 86, 56)); d.rectangle([x0, y0, x1, y1], fill=col)
        fg = (255, 255, 255) if dark else (40, 44, 52); sz = 44 if (y1 - y0) > 200 else 30
        d.text((x0 + 18, y0 + 14), t, font=f(sz), fill=fg)
        for k, ln in enumerate(lines): d.text((x0 + 20, y0 + 30 + sz + k * (sz * 0.72)), ln, font=f(int(sz * 0.6)), fill=fg)
        for (px, py) in ((x0 + 12, y0 + 10), (x1 - 12, y0 + 10)): d.ellipse([px - 7, py - 7, px + 7, py + 7], fill=rng.choice([(220, 40, 40), (40, 120, 220), (240, 200, 40)]))
    im.filter(ImageFilter.GaussianBlur(0.4)).save(os.path.join(GEN, 'gym_notice.png'))


def arena_floor():
    """3F 主球場的地板（x −22～22、z −22～17，44×39 m；2048×1816）：楓木＋籃球場（深藍，長邊沿 z）＋排球場（黃）；北端 z −22～−17 是活動時放舞台的地方（沒有線）"""
    AX0, AX1, AZ0, AZ1 = -22.0, 22.0, -22.0, 17.0; W_, H_ = 2048, int(2048 * (AZ1 - AZ0) / (AX1 - AX0))
    kx = W_ / (AX1 - AX0); kz = H_ / (AZ1 - AZ0)
    def Q(x, z): return ((x - AX0) * kx, (z - AZ0) * kz)
    rng = np.random.default_rng(23)
    a = np.zeros((H_, W_, 3), np.float32) + np.array([210, 162, 104], np.float32)
    strip = int(0.6 * kz)
    for j in range(0, H_, strip): a[j:j + strip] *= rng.uniform(0.97, 1.03)          # 木條沿 x（和 1F 垂直，看得出是不同的場地）
    for i in range(0, W_, int(0.057 * kx) or 2): a[:, i:i + 1] *= 0.94
    g = rng.normal(0, 1, (H_, W_ // 6 + 1)).astype(np.float32); a += np.repeat(g, 6, 1)[:, :W_, None] * 4.0
    cx, cz = 0.0, -2.0; Bl = (36, 60, 118); L_, Wd = 28.0, 15.0                        # 籃球場：長邊沿 z
    (qx0, qz0), (qx1, qz1) = Q(cx - Wd / 2 - 2.0, cz - L_ / 2 - 2.0), Q(cx + Wd / 2 + 2.0, cz + L_ / 2 + 2.0)   # 場外 2 m 以外上深一點的漆（體育館常見的外圍色帶）
    m_ = np.ones((H_, W_), np.float32) * 0.78; m_[int(qz0):int(qz1), int(qx0):int(qx1)] = 1.0; a *= m_[..., None]
    for s in (-1, 1):                                                                   # 禁區上一層淡藍
        ez = cz + s * L_ / 2; (kx0, kz0), (kx1, kz1) = Q(cx - 2.45, min(ez, ez - s * 5.8)), Q(cx + 2.45, max(ez, ez - s * 5.8))
        a[int(kz0):int(kz1), int(kx0):int(kx1)] = a[int(kz0):int(kz1), int(kx0):int(kx1)] * 0.25 + np.array([38, 74, 150], np.float32) * 0.75
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im); lw = max(3, int(0.06 * kx))
    def line(p, q, col): d.line([Q(*p), Q(*q)], fill=col, width=lw)
    def rect(x0, z0, x1, z1, col):
        for p_, q_ in (((x0, z0), (x1, z0)), ((x1, z0), (x1, z1)), ((x1, z1), (x0, z1)), ((x0, z1), (x0, z0))): line(p_, q_, col)
    def arc(cx, cz, r, a0, a1, col, n=48): d.line([Q(cx + r * math.cos(a0 + (a1 - a0) * k / n), cz + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)], fill=col, width=lw)
    Bl = (246, 246, 240)                                                                # 線改白色（在深藍禁區、深色外圍上都看得到）
    rect(cx - Wd / 2, cz - L_ / 2, cx + Wd / 2, cz + L_ / 2, Bl); line((cx - Wd / 2, cz), (cx + Wd / 2, cz), Bl); arc(cx, cz, 1.8, 0, 2 * math.pi, Bl)
    for s in (-1, 1):
        ez = cz + s * L_ / 2; hz = ez - s * 1.575
        rect(cx - 2.45, min(ez, ez - s * 5.8), cx + 2.45, max(ez, ez - s * 5.8), Bl)
        if s < 0: arc(cx, ez - s * 5.8, 1.8, 0, math.pi, Bl)
        else: arc(cx, ez - s * 5.8, 1.8, math.pi, 2 * math.pi, Bl)
        a0 = math.asin(6.6 / 6.75)
        if s < 0: arc(cx, hz, 6.75, math.pi / 2 - a0, math.pi / 2 + a0, Bl)
        else: arc(cx, hz, 6.75, -math.pi / 2 - a0, -math.pi / 2 + a0, Bl)
        for sx in (-1, 1): line((cx + sx * 6.6, ez), (cx + sx * 6.6, ez - s * 2.99), Bl)
    Y_ = (232, 196, 60); rect(cx - 4.5, cz - 9, cx + 4.5, cz + 9, Y_); line((cx - 4.5, cz), (cx + 4.5, cz), Y_)   # 排球場
    for s in (-1, 1): line((cx - 4.5, cz + s * 3), (cx + 4.5, cz + s * 3), Y_)
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    v = np.asarray(im).astype(np.float32); yy, xx = np.mgrid[0:H_, 0:W_]; r = np.hypot((xx - W_ / 2) / W_, (yy - H_ * 0.55) / H_)
    v *= (1.05 - 0.14 * r)[..., None]; Image.fromarray(np.clip(v, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'arena_floor.jpg'), quality=86)


def arena_screen():
    """北牆的大螢幕（平常的待機畫面）：深藍漸層＋細的光線，沒有字、沒有標誌"""
    W, H = 1024, 448; y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    a = np.zeros((H, W, 3), np.float32); a[..., 0] = 14 + 20 * (y / H); a[..., 1] = 34 + 40 * (y / H); a[..., 2] = 84 + 70 * (1 - y / H)
    for k in range(7):
        ph = k * 0.9; yy = H * (0.25 + 0.08 * k) + 40 * np.sin(x / W * 6.28 * 1.3 + ph)
        a += (np.exp(-((y - yy) / 3.0) ** 2) * (60 + 10 * k))[..., None] * np.array([0.6, 0.85, 1.0], np.float32)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'arena_screen.png'))


def ceremony_banner():
    """典禮的舞台背板：深藍布幕上方的一條米色長布（金邊、中間一圈月桂葉的線條），不寫校名、不放校徽（D77）"""
    W, H = 1600, 260; im = Image.new('RGB', (W, H), (238, 230, 210)); d = ImageDraw.Draw(im)
    for k, c in ((10, (176, 140, 60)), (20, (206, 176, 96))): d.rectangle([k, k, W - k, H - k], outline=c, width=4)
    cx, cy = W / 2, H / 2
    for s in (-1, 1):
        for i in range(9):
            t = i / 8; ang = math.pi * (0.15 + 0.7 * t); px = cx + s * 230 * math.cos(ang) * 0.9; py = cy + 70 * math.sin(ang) - 30
            d.ellipse([px - 16, py - 7, px + 16, py + 7], outline=(176, 140, 60), width=3)
    d.ellipse([cx - 34, cy - 34, cx + 34, cy + 34], outline=(176, 140, 60), width=4)
    im.save(os.path.join(GEN, 'arena_banner.png'))


def _rubber(fn, base, flecks, seed, S=1024):
    """B1 健身區的橡膠地墊（1024＝2 m，2×2 塊 1 m 的墊子；每塊深淺差一點、接縫、EPDM 彩色小顆粒）"""
    rs = np.random.default_rng(seed); a = np.zeros((S, S, 3), np.float32) + np.array(base, np.float32)
    h = S // 2
    for i in range(2):
        for j in range(2): a[i * h:(i + 1) * h, j * h:(j + 1) * h] += rs.normal(0, 2.5)
    a += rs.normal(0, 3.5, (S, S, 1))
    n = int(S * S * 0.012)
    xs, ys = rs.integers(0, S - 3, n), rs.integers(0, S - 3, n); cs = np.array(flecks, np.float32)[rs.integers(0, len(flecks), n)]
    for k in range(n): sz = 2 + (k % 3 == 0); a[ys[k]:ys[k] + sz, xs[k]:xs[k] + sz] = cs[k] + rs.normal(0, 4)
    for q in (0, h):                                                     # 接縫：深一點的細線＋旁邊一點點亮邊（墊子的倒角）
        a[q:q + 2] *= 0.45; a[:, q:q + 2] *= 0.45; a[q + 2:q + 4] *= 1.12; a[:, q + 2:q + 4] *= 1.12
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, fn), quality=88)


def b1_rubber():
    """自由重量區：黑色橡膠墊＋灰、藍灰顆粒（v1 是幾乎全黑的 40）；有氧區：中灰的運動地墊（v2 新增）"""
    _rubber('b1_rubber.jpg', (44, 45, 47), [(118, 120, 124), (96, 104, 118), (140, 140, 136), (70, 74, 80)], 7)
    _rubber('b1_rubber_grey.jpg', (104, 106, 108), [(60, 62, 66), (150, 152, 154), (82, 92, 110), (128, 120, 104)], 8)


def b1_turf():
    """自由重量區的人工草皮道（推雪橇、農夫走路；11 m × 2 m，2048×372）：割草紋（每 1 m 深淺交替）、兩側白線、每 2.5 m 一條橫線"""
    W, H = 2048, 372; kx = W / 11.0; rs = np.random.default_rng(31)
    a = np.zeros((H, W, 3), np.float32) + np.array([58, 112, 62], np.float32)
    xx = np.arange(W)[None, :]; a *= (1.0 + 0.06 * np.where((xx // int(kx)) % 2 == 0, 1, -1))[..., None]
    a += rs.normal(0, 9, (H, W, 1)) * np.array([0.6, 1.0, 0.5], np.float32)
    blur = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)); im = blur.copy(); d = ImageDraw.Draw(im)
    lw = int(0.05 * kx)
    for y in (int(0.08 * H), int(0.92 * H) - lw): d.rectangle([int(0.1 * kx), y, W - int(0.1 * kx), y + lw], fill=(232, 234, 228))
    for k in range(5): x = int((0.5 + k * 2.5) * kx); d.rectangle([x, int(0.08 * H), x + lw, int(0.92 * H)], fill=(232, 234, 228))
    im.save(os.path.join(GEN, 'b1_turf.jpg'), quality=88)


def b1_wall_free():
    """自由重量區的主題牆（西牆 10.75 m × 2.88 m，2048×548）：深藍底、斜的淺一點的色塊、黃線（和 1F 指標同一套）、白字。不寫館名（D77）"""
    W, H = 2048, 548; im = Image.new('RGB', (W, H), (30, 48, 82)); d = ImageDraw.Draw(im)
    for x0, w in ((1180, 260), (1500, 120), (1680, 60)): d.polygon([(x0, H), (x0 + w, H), (x0 + w + 300, 0), (x0 + 300, 0)], fill=(38, 60, 100))
    d.rectangle([0, 372, W, 384], fill=(232, 176, 60))
    d.text((110, 150), '自由重量區', font=f(150), fill=(255, 255, 255))
    d.text((116, 404), '槓鈴、啞鈴用畢請歸位　・　深蹲、臥推請使用安全槓並請同伴保護', font=f(38), fill=(214, 224, 240))
    cx, cy = 1800, 210                                                   # 啞鈴圖示
    d.rectangle([cx - 130, cy - 10, cx + 130, cy + 10], fill=(255, 255, 255))
    for s in (-1, 1):
        d.rounded_rectangle([cx + s * 95 - 18, cy - 70, cx + s * 95 + 18, cy + 70], 8, fill=(255, 255, 255))
        d.rounded_rectangle([cx + s * 135 - 14, cy - 50, cx + s * 135 + 14, cy + 50], 8, fill=(255, 255, 255))
    im.save(os.path.join(GEN, 'b1_wall_free.png'))


def b1_rules():
    """健身中心東牆的使用須知（0.95 m × 1.25 m，608×800）：深藍標題列＋白底條列。不寫館名（D77）"""
    W, H = 608, 800; im = Image.new('RGB', (W, H), (246, 246, 242)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 118], fill=(30, 48, 82)); d.rectangle([0, 118, W, 126], fill=(232, 176, 60))
    d.text((40, 30), '健身中心使用須知', font=f(54), fill=(255, 255, 255))
    rows = ['進場請出示學生證或會員證', '請穿運動服裝、室內運動鞋', '請攜帶毛巾，器材用畢擦拭', '槓片、啞鈴用畢請歸位',
            '尖峰時段跑步機每人三十分鐘', '請勿飲食，可攜帶有蓋水壺', '身體不適請立即停止並告知櫃台']
    for i, t in enumerate(rows):
        y = 168 + i * 82; d.ellipse([36, y + 2, 76, y + 42], fill=(30, 48, 82)); d.text((47 if i < 9 else 40, y + 4), str(i + 1), font=f(30), fill=(255, 255, 255))
        d.text((96, y + 2), t, font=f(34), fill=(40, 46, 56))
    d.rectangle([24, 160, W - 24, 162], fill=(210, 214, 220)); d.text((40, H - 54), '每月第四個週一　健身中心、游泳池休館', font=f(26), fill=(110, 118, 130))
    im.save(os.path.join(GEN, 'b1_rules.png'))


def b1_tv():
    """有氧區上方兩台螢幕的公告輪播（各 512×288，並排一張 1024×288）。內容照 BB_151：每月第四個週一休館"""
    W, H = 1024, 288; im = Image.new('RGB', (W, H), (22, 36, 62)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 512, 56], fill=(232, 176, 60)); d.text((24, 8), '健身中心公告', font=f(38), fill=(22, 36, 62))
    d.text((34, 92), '每月第四個週一', font=f(52), fill=(255, 255, 255)); d.text((34, 168), '健身中心・游泳池休館', font=f(44), fill=(214, 224, 240))
    d.rectangle([512, 0, W, H], fill=(18, 70, 84)); d.rectangle([512, 0, W, 56], fill=(255, 255, 255)); d.text((536, 8), '運動小提醒', font=f(38), fill=(18, 70, 84))
    d.text((546, 92), '器材用畢', font=f(56), fill=(255, 255, 255)); d.text((546, 170), '請擦拭並歸位', font=f(48), fill=(206, 236, 236))
    im.save(os.path.join(GEN, 'b1_tv.png'))


def b1_timer():
    """自由重量區的間歇計時器（512×160）：黑底、紅色數字、綠色組數。沒有字"""
    W, H = 512, 160; im = Image.new('RGB', (W, H), (12, 12, 14)); d = ImageDraw.Draw(im)
    d.text((24, 22), '03', font=f(104), fill=(60, 220, 110)); d.text((184, 22), '01:30', font=f(104), fill=(255, 64, 40))
    im.save(os.path.join(GEN, 'b1_timer.png'))


def b1_ceiling():
    """健身中心的天花板（輕鋼架 60 cm 礦纖板；512＝1.2 m＝2×2 塊）：米白、細小的孔洞紋、灰白的 T 型骨架"""
    S = 512; rs = np.random.default_rng(41); a = np.zeros((S, S, 3), np.float32) + np.array([236, 235, 230], np.float32)
    a += rs.normal(0, 2.0, (S, S, 1)); n = 2600; xs, ys = rs.integers(0, S - 2, n), rs.integers(0, S - 2, n)
    for k in range(n): a[ys[k]:ys[k] + 2, xs[k]:xs[k] + 2] -= 22
    for q in (0, S // 2):
        a[q:q + 6] = (214, 214, 210); a[:, q:q + 6] = (214, 214, 210); a[q + 6:q + 8] *= 0.93; a[:, q + 6:q + 8] *= 0.93
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'b1_ceiling.jpg'), quality=88)


def b1_mirror():
    """鏡牆（整面 32 m × 2.1 m 一張，2048×256；每片鏡片取它那一段）：沒有環境貼圖，金屬度上限 0.45、鏡子只會是一片灰——用顏色畫出「反射」的感覺：
    上面亮（反射天花板和燈）、下面暗（反射黑色地墊）、中間一條模糊的亮帶（對面的玻璃牆）、下半部很淡很模糊的深色塊（反射的器材）、幾道不規則的斜光；
    每片鏡片的顏色差一點點。v1 每片同一張圖、同一道斜光，遊戲裡像不鏽鋼浪板。片和片之間的接縫在 Blender 端用幾何做"""
    W, H = 2048, 256; rs = np.random.default_rng(53); y = np.linspace(0, 1, H)[:, None]; xx = np.arange(W)[None, :] / W
    top, mid, bot = np.array([216, 222, 226], np.float32), np.array([178, 186, 192], np.float32), np.array([98, 102, 106], np.float32)
    t = np.clip(y / 0.5, 0, 1); a = top * (1 - t[..., None]) + mid * t[..., None]
    t2 = np.clip((y - 0.5) / 0.5, 0, 1); a = np.where((y > 0.5)[..., None], mid * (1 - t2[..., None]) + bot * t2[..., None], a)
    a = np.broadcast_to(a, (H, W, 3)).copy()
    a += (np.exp(-((y - 0.3) / 0.04) ** 2) * 16)[..., None]
    blob = np.zeros((H, W), np.float32)                                  # 反射的器材：下半部很淡的深色塊（之後整張模糊）
    for _ in range(46):
        cx, w = rs.uniform(0, W), rs.uniform(10, 46); y0 = rs.uniform(0.42, 0.62) * H
        blob[int(y0):H, int(max(0, cx - w)):int(min(W, cx + w))] += rs.uniform(10, 22)
    bl = np.asarray(Image.fromarray(np.clip(blob, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9)), np.float32)
    a -= bl[..., None] * 0.9
    for c in rs.uniform(0.05, 0.95, 6):                                  # 不規則的斜光（寬度、亮度都不一樣）
        w, k = rs.uniform(0.004, 0.012), rs.uniform(6, 12); u = xx - c - (1 - y) * 0.03
        a += (np.exp(-(u / w) ** 2) * k)[..., None]
    n = 27; pw = W / n                                                   # 每片鏡片的顏色差一點點（和 gym_b1.py 的片數一樣：32 m／1.2 m＝27）
    for k in range(n): a[:, int(k * pw):int((k + 1) * pw)] += rs.normal(0, 2.0)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'b1_mirror.jpg'), quality=90)


def b1_all():
    b1_rubber(); b1_turf(); b1_wall_free(); b1_rules(); b1_tv(); b1_timer(); b1_ceiling(); b1_mirror()


def pool_floor():
    """泳池底（25×17.5 m、7 水道；2048×1434）：淺藍白的馬賽克＋每道中間一條深藍線、兩端 T 字（離池壁 2 m）"""
    W, H = 2048, 1434; kx = W / 25.0; kz = H / 17.5
    a = np.zeros((H, W, 3), np.float32) + np.array([206, 230, 238], np.float32)
    t = int(0.05 * kx)                                                    # 5 cm 的小磁磚＋縫
    yy, xx = np.mgrid[0:H, 0:W]; a[(xx % t == 0) | (yy % t == 0)] *= 0.9
    a += np.random.default_rng(9).normal(0, 3, (H, W, 1))
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im); B_ = (24, 52, 112)
    for k in range(7):
        zc = (k + 0.5) * 2.5 * kz; d.rectangle([2.0 * kx, zc - 0.125 * kz, W - 2.0 * kx, zc + 0.125 * kz], fill=B_)
        for xe in (2.0 * kx, W - 2.0 * kx): d.rectangle([xe - 0.125 * kx, zc - 0.5 * kz, xe + 0.125 * kx, zc + 0.5 * kz], fill=B_)
    im.save(os.path.join(GEN, 'pool_floor.jpg'), quality=88)


if __name__ == '__main__':
    import sys
    if sys.argv[1:] == ['b1']: b1_all(); print('saved B1 fitness textures'); sys.exit(0)   # 只重做 B1 健身中心那幾張（2026-10-24 v7）
    floor(); hours(); score(); wayfind(); directory(); notice(); arena_floor(); arena_screen(); ceremony_banner(); b1_all(); pool_floor(); b1_desk(); print('saved gym textures')
