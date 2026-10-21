"""US-MARKET-STREET（草原超市和對面小商店之間的停車場、馬路；區域 us_market_street）程式產生的貼圖（PIL）。LAWWW2 2026-10-21。
  python3 tools/blender/env_second/us_market_street_tex.py   → tools/blender/env_second/textures/gen/us_ms_*.png（＋us_ms_signs.json：每塊在圖集上的位置）
- us_ms_signs.png（2048×2048）：門上的 IN／OUT、小商店的燈箱招牌（自助洗衣、麵店：通稱，不是店名；竹葉亞洲超市：中英、竹葉圖案）、招租紙、
  冰櫃 ICE、瓦斯桶 PROPANE、推車回收 CART RETURN、無障礙車位、消防車道告示、公車站牌與路線圖、行人號誌（綠的走路人）、商店街招牌（Bamboo Plaza）、
  玻璃上的海報（新鮮蔬果、每週特價、徵人）、麵店的 OPEN 霓虹、路名牌（Meadow Rd）。店名、路名都虛構（D77）；不畫真的品牌、商標。
- us_ms_interiors.png（2048×1536）：從玻璃外面看進去的店內（6 格 1024×512）：草原超市、自助洗衣、麵店、竹葉亞洲超市、空店面、（空）。
  遊戲裡是會亮的材質（白天也亮一點、晚上全亮）；放在玻璃後面 1～1.5 m 的板子上（只從外面看）。"""
import json, math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
F_SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
F_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
F_SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
GREEN, CREAM, WHEAT = (40, 74, 52), (242, 234, 214), (217, 164, 65)
rng = random.Random(1021)


def font(fn, px): return ImageFont.truetype(fn, px)


def ctext(d, cx, cy, t, f, fill):
    l, t0, r, b = d.textbbox((0, 0), t, font=f); d.text((cx - (r - l) / 2 - l, cy - (b - t0) / 2 - t0), t, font=f, fill=fill)


def fit(d, t, fn, w, h):
    px = int(h)
    while px > 8:
        f = font(fn, px); l, t0, r, b = d.textbbox((0, 0), t, font=f)
        if r - l <= w and b - t0 <= h: return f
        px -= 2
    return font(fn, 8)


# ================= 招牌圖集 =================
S = 2048; sig = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(sig); RECT = {}
def put(name, x0, y0, x1, y1): RECT[name] = [x0, y0, x1, y1]; return x0, y0, x1, y1


def box_sign(name, x0, y0, x1, y1, bg, text, fg, fn=F_SANS, sub=None, sub_fg=None, icon=None):
    put(name, x0, y0, x1, y1); w, h = x1 - x0, y1 - y0
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=bg)
    d.rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], outline=tuple(min(255, int(c * 1.25 + 20)) for c in bg[:3]), width=3)
    tx0 = x0 + (h * 0.95 if icon else 0)
    if sub:
        f = fit(d, text, fn, w - (tx0 - x0) - 40, h * 0.5); ctext(d, (tx0 + x1) / 2, y0 + h * 0.38, text, f, fg)
        f2 = fit(d, sub, F_SANS, w - (tx0 - x0) - 60, h * 0.2); ctext(d, (tx0 + x1) / 2, y0 + h * 0.78, sub, f2, sub_fg or fg)
    else:
        f = fit(d, text, fn, w - (tx0 - x0) - 40, h * 0.62); ctext(d, (tx0 + x1) / 2, (y0 + y1) / 2, text, f, fg)
    if icon: icon(x0 + h * 0.5, (y0 + y1) / 2, h * 0.36)


# 門上的 IN／OUT（深綠底、米白字）
box_sign('in', 0, 0, 256, 128, GREEN, 'IN', CREAM); box_sign('out', 256, 0, 512, 128, GREEN, 'OUT', CREAM)
# 自助洗衣（藍底白字；洗衣機圖示）
def washer(cx, cy, r):
    d.rounded_rectangle([cx - r, cy - r, cx + r, cy + r], radius=r * 0.15, fill=(240, 244, 248)); d.ellipse([cx - r * 0.62, cy - r * 0.45, cx + r * 0.62, cy + r * 0.79], fill=(60, 120, 190))
    d.ellipse([cx - r * 0.42, cy - r * 0.25, cx + r * 0.42, cy + r * 0.59], fill=(150, 200, 235)); d.rectangle([cx - r * 0.8, cy - r * 0.86, cx - r * 0.2, cy - r * 0.68], fill=(60, 120, 190))
box_sign('laundry', 0, 128, 1024, 384, (36, 92, 168), 'COIN LAUNDRY', (250, 250, 250), sub='WASH · DRY · FOLD', sub_fg=(255, 214, 90), icon=washer)
# 麵店（紅底米白字；碗）
def bowl(cx, cy, r):
    d.chord([cx - r, cy - r * 0.6, cx + r, cy + r * 1.0], 0, 180, fill=(250, 240, 220)); d.rectangle([cx - r * 1.05, cy + r * 0.15, cx + r * 1.05, cy + r * 0.26], fill=(250, 240, 220))
    for k in range(3): d.line([cx - r * 0.3 + k * r * 0.3, cy - r * 0.95, cx - r * 0.25 + k * r * 0.3, cy + r * 0.1], fill=(250, 240, 220), width=int(r * 0.09))
box_sign('noodle', 1024, 128, 2048, 384, (160, 34, 38), 'NOODLE HOUSE', (252, 242, 222), sub='HAND-PULLED NOODLES · DUMPLINGS', sub_fg=(255, 214, 120), icon=bowl)
# 竹葉亞洲超市（米白底：紅色中文、深綠英文；左邊竹葉）——和室內招牌同一套顏色（us_asian_market_tex：紅字 (150,30,32)）
x0, y0, x1, y1 = put('asian', 0, 384, 2048, 768); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=CREAM); d.rectangle([x0 + 10, y0 + 10, x1 - 11, y1 - 11], outline=(47, 107, 58), width=10)
def leaf(cx, cy, L_, ang, col):
    pts = []
    for k in range(25):
        t = k / 24; w_ = math.sin(math.pi * t) * L_ * 0.17; u = (t - 0.5) * L_
        pts.append((u, w_))
    pts += [(u, -w) for (u, w) in reversed(pts)]
    ca, sa = math.cos(ang), math.sin(ang); d.polygon([(cx + u * ca - v * sa, cy + u * sa + v * ca) for (u, v) in pts], fill=col)
    d.line([(cx - L_ / 2 * ca, cy - L_ / 2 * sa), (cx + L_ / 2 * ca, cy + L_ / 2 * sa)], fill=(28, 70, 36), width=4)
for (dx, dy, L_, a, c) in ((0, 0, 230, -0.9, (52, 128, 64)), (40, 40, 200, -0.3, (70, 150, 80)), (-30, 50, 180, -1.5, (40, 110, 54))): leaf(190 + dx, 576 + dy - 20, L_, a, c)
ctext(d, 1140, 520, '竹葉亞洲超市', font(CJK, 190), (150, 30, 32)); ctext(d, 1140, 680, 'BAMBOO LEAF ASIAN MARKET', font(F_SANS, 82), (47, 90, 58))
# 招租（白紙、黑紅字；沒有電話號碼）
x0, y0, x1, y1 = put('lease', 0, 768, 512, 1088); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(246, 246, 240)); d.rectangle([x0 + 14, y0 + 14, x1 - 15, y1 - 15], outline=(180, 30, 30), width=8)
ctext(d, 256, 868, 'FOR', font(F_SANS, 84), (180, 30, 30)); ctext(d, 256, 960, 'LEASE', font(F_SANS, 104), (180, 30, 30)); ctext(d, 256, 1040, 'AVAILABLE NOW', font(F_SANS, 34), (40, 40, 40))
# 冰櫃 ICE、瓦斯桶 PROPANE、推車回收
x0, y0, x1, y1 = put('ice', 512, 768, 1024, 1088); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 252, 255)); ctext(d, 768, 900, 'ICE', font(F_SANS, 210), (30, 110, 200))
for k in range(6): a = k * math.pi / 3; d.line([(640, 1030), (640 + 34 * math.cos(a), 1030 + 34 * math.sin(a))], fill=(80, 160, 230), width=6)
ctext(d, 820, 1030, 'BAGGED · 10 LB', font(F_SANS, 34), (30, 80, 150))
box_sign('propane', 1024, 768, 1536, 928, (30, 80, 150), 'PROPANE', (250, 250, 250), sub='EXCHANGE · SEE CASHIER', sub_fg=(255, 220, 90))
box_sign('cart', 1536, 768, 2048, 928, (40, 90, 160), 'CART RETURN', (250, 250, 250))
# 無障礙車位（藍底白色輪椅：圓頭、身體、輪子）
x0, y0, x1, y1 = put('ada', 1024, 928, 1280, 1248); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 250)); d.rectangle([x0 + 18, y0 + 18, x1 - 19, y0 + 220], fill=(30, 80, 160))
cx, cy = 1152, 1046; d.ellipse([cx - 14, cy - 76, cx + 14, cy - 48], fill=(255, 255, 255)); d.line([(cx, cy - 40), (cx - 6, cy + 10), (cx + 36, cy + 12), (cx + 50, cy + 52)], fill=(255, 255, 255), width=12)
d.arc([cx - 52, cy - 10, cx + 26, cy + 68], 20, 300, fill=(255, 255, 255), width=10); ctext(d, 1152, 1208, 'RESERVED', font(F_SANS, 34), (30, 80, 160))
# 消防車道告示
x0, y0, x1, y1 = put('fire', 1280, 928, 1536, 1248); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 250)); d.rectangle([x0 + 12, y0 + 12, x1 - 13, y1 - 13], outline=(190, 30, 30), width=8)
ctext(d, 1408, 1010, 'NO', font(F_SANS, 64), (190, 30, 30)); ctext(d, 1408, 1080, 'PARKING', font(F_SANS, 46), (190, 30, 30)); ctext(d, 1408, 1160, 'FIRE LANE', font(F_SANS, 40), (30, 30, 30))
# 公車站牌（藍白、公車圖示、4 號）＋路線圖
x0, y0, x1, y1 = put('bus', 1536, 928, 1792, 1248); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(250, 250, 250)); d.rectangle([x0, y0, x1 - 1, y0 + 120], fill=(30, 80, 160))
ctext(d, 1664, y0 + 60, 'BUS', font(F_SANS, 80), (255, 255, 255)); d.rounded_rectangle([1604, 1080, 1724, 1170], radius=14, fill=(30, 80, 160)); d.rectangle([1616, 1092, 1712, 1126], fill=(250, 250, 250))
for wx in (1626, 1702): d.ellipse([wx - 12, 1160, wx + 12, 1184], fill=(30, 30, 30))
ctext(d, 1664, 1222, 'ROUTE 4', font(F_SANS, 32), (30, 80, 160))
x0, y0, x1, y1 = put('route', 1792, 928, 2048, 1248); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 244, 238)); ctext(d, 1920, 960, 'ROUTE 4', font(F_SANS, 34), (30, 80, 160))
pts = [(1820, 1010), (1880, 1010), (1880, 1080), (1990, 1080), (1990, 1180), (1840, 1180), (1840, 1120)]
d.line(pts, fill=(220, 120, 30), width=10)
for (px_, py_) in pts[::2]: d.ellipse([px_ - 12, py_ - 12, px_ + 12, py_ + 12], fill=(255, 255, 255), outline=(30, 30, 30), width=4)
for k in range(5): d.rectangle([1810, 1200 + k * 8, 2030 - k * 30, 1203 + k * 8], fill=(120, 120, 120))
# 行人號誌：亮的白色走路人（黑底）、不亮的橘色手
x0, y0, x1, y1 = put('walk', 0, 1088, 256, 1344); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(14, 14, 16))
cx, cy = 128, 1216; W_ = (245, 250, 255); d.ellipse([cx - 16, cy - 96, cx + 16, cy - 64], fill=W_)
for seg in (((cx, cy - 58), (cx - 6, cy + 4)), ((cx - 6, cy + 4), (cx - 40, cy + 86)), ((cx - 6, cy + 4), (cx + 30, cy + 40)), ((cx + 30, cy + 40), (cx + 34, cy + 90)), ((cx, cy - 46), (cx - 40, cy - 6)), ((cx, cy - 46), (cx + 34, cy - 16))):
    d.line(seg, fill=W_, width=16)
x0, y0, x1, y1 = put('hand', 256, 1088, 512, 1344); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(14, 14, 16))
cx, cy = 384, 1226; O = (90, 52, 30); d.rounded_rectangle([cx - 46, cy - 30, cx + 46, cy + 70], radius=20, fill=O)
for k in range(4): d.rounded_rectangle([cx - 44 + k * 23, cy - 100 + abs(k - 1.5) * 10, cx - 26 + k * 23, cy - 10], radius=9, fill=O)
# 商店街招牌（Bamboo Plaza，虛構）：頂端名稱＋三格租戶
x0, y0, x1, y1 = put('plaza', 512, 1088, 1024, 1600); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=(244, 238, 222)); d.rectangle([x0, y0, x1 - 1, y0 + 150], fill=(47, 107, 58))
ctext(d, 768, y0 + 52, 'BAMBOO', font(F_SERIF, 64), (244, 238, 222)); ctext(d, 768, y0 + 116, 'PLAZA', font(F_SERIF, 48), (220, 196, 120))
for k, (t, c) in enumerate((('竹葉亞洲超市', (150, 30, 32)), ('NOODLE HOUSE', (160, 34, 38)), ('COIN LAUNDRY', (36, 92, 168)))):
    yy = y0 + 170 + k * 110; d.rectangle([x0 + 20, yy, x1 - 21, yy + 96], fill=(252, 250, 244), outline=(200, 190, 170), width=3)
    ctext(d, 768, yy + 48, t, fit(d, t, CJK if k == 0 else F_SANS, 420, 70), c)
# 玻璃上的海報（新鮮蔬果、每週特價、徵人）
def poster(name, x0, y0, x1, y1, bg, t1, t2, fg, acc):
    put(name, x0, y0, x1, y1); d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=bg); d.rectangle([x0, y1 - 80, x1 - 1, y1 - 1], fill=acc)
    ctext(d, (x0 + x1) / 2, y0 + (y1 - y0) * 0.2, t1, fit(d, t1, F_SANS, x1 - x0 - 40, 80), fg); ctext(d, (x0 + x1) / 2, y0 + (y1 - y0) * 0.4, t2, fit(d, t2, F_SANS, x1 - x0 - 50, 56), fg)
    for k in range(3): d.ellipse([x0 + 46 + k * 60, y1 - 140, x0 + 96 + k * 60, y1 - 90], fill=[(200, 50, 40), (240, 180, 40), (90, 160, 60)][k])
poster('p_fresh', 1024, 1248, 1280, 1600, (250, 246, 230), 'FRESH', 'PRODUCE', (40, 90, 50), (90, 150, 60))
poster('p_deals', 1280, 1248, 1536, 1600, (200, 36, 40), 'WEEKLY', 'DEALS', (255, 240, 200), (250, 200, 60))
poster('p_hire', 1536, 1248, 1792, 1600, (244, 244, 236), 'NOW', 'HIRING', GREEN, (217, 164, 65))
# OPEN 霓虹（紅、外框藍）
x0, y0, x1, y1 = put('open', 1792, 1248, 2048, 1376); d.rounded_rectangle([x0 + 6, y0 + 6, x1 - 7, y1 - 7], radius=40, outline=(80, 140, 255), width=8); ctext(d, 1920, 1312, 'OPEN', font(F_SANS, 78), (255, 70, 60))
# 路名牌（綠底白字，虛構路名）
box_sign('street', 1792, 1376, 2048, 1472, (16, 112, 64), 'Meadow Rd', (250, 250, 250), fn=F_SANS)
# 草原超市的麥穗標誌（招牌板左右各一）
x0, y0, x1, y1 = put('wheat', 0, 1344, 256, 1600)
for k in range(9):
    a = -0.5 + k * 0.125; L_ = 150 - abs(k - 4) * 12; cx, cy = 128, 1560
    ex, ey = cx + math.sin(a) * L_, cy - math.cos(a) * L_; d.line([(cx, cy), (ex, ey)], fill=WHEAT, width=6)
    for j in range(5):
        t = 0.55 + j * 0.09; px_, py_ = cx + math.sin(a) * L_ * t, cy - math.cos(a) * L_ * t
        for s_ in (-1, 1): d.ellipse([px_ + s_ * 9 - 7, py_ - 12, px_ + s_ * 9 + 7, py_ + 4], fill=WHEAT)
sig.save(os.path.join(GEN, 'us_ms_signs.png'))
json.dump({'size': S, 'rects': RECT}, open(os.path.join(GEN, 'us_ms_signs.json'), 'w'), indent=1)

# ================= 店內景（從外面隔著玻璃看進去）=================
IW, IH = 1024, 512; inn = Image.new('RGB', (IW * 2, IH * 3), (0, 0, 0)); CELLS = {}
def cell(name, i, j):
    im = Image.new('RGB', (IW, IH), (0, 0, 0)); CELLS[name] = (i, j); return im, ImageDraw.Draw(im)
def ceiling(dd, y1, col, light, rows=3, step=170, lw=110):
    dd.rectangle([0, 0, IW, y1], fill=col)
    for r in range(rows):
        yy = 18 + r * (y1 - 30) / max(1, rows)
        for x in range(30 + (r % 2) * 60, IW, step): dd.rectangle([x, yy, x + lw, yy + 10], fill=light)
def shelves(dd, im, x0, x1, ytop, ybot, r, pal, rows=5):
    dd.rectangle([x0, ytop, x1, ybot], fill=(70, 72, 76))
    for k in range(rows):
        y_a = ytop + (ybot - ytop) * k / rows + 6; y_b = ytop + (ybot - ytop) * (k + 1) / rows - 4; x = x0 + 4
        while x < x1 - 8:
            w = r.randint(10, 26); c = r.choice(pal); hh = r.uniform(0.6, 1.0) * (y_b - y_a)
            dd.rectangle([x, y_b - hh, x + w - 2, y_b], fill=c); x += w
        dd.rectangle([x0, y_b, x1, y_b + 4], fill=(205, 208, 210))
# 1. 草原超市：白天花板＋燈管、後牆的區域招牌、一排排貨架、前面結帳台
im, dd = cell('pb', 0, 0); r = random.Random(1)
ceiling(dd, 150, (226, 228, 226), (255, 255, 250), rows=3); dd.rectangle([0, 150, IW, 400], fill=(214, 206, 188))
for k, t in enumerate(('PRODUCE', 'DELI', 'BAKERY', 'DAIRY')):
    cx = 130 + k * 255; dd.rectangle([cx - 100, 165, cx + 100, 215], fill=GREEN); ctext(dd, cx, 190, t, font(F_SANS, 26), CREAM)
PAL = [(200, 50, 40), (230, 170, 40), (40, 110, 180), (60, 140, 80), (240, 230, 210), (130, 60, 140), (220, 110, 40)]
for k in range(7): shelves(dd, im, 20 + k * 145, 140 + k * 145, 230, 400, r, PAL)
dd.rectangle([0, 400, IW, IH], fill=(206, 204, 198))
for k in range(5):
    x = 60 + k * 200; dd.rectangle([x, 380, x + 120, 450], fill=(70, 72, 74)); dd.rectangle([x + 4, 372, x + 116, 382], fill=(40, 40, 42)); dd.rectangle([x + 90, 320, x + 96, 380], fill=(50, 50, 52))
    dd.rectangle([x + 80, 304, x + 106, 322], fill=(255, 255, 255)); ctext(dd, x + 93, 313, str(k + 1), font(F_SANS, 14), GREEN)
for k in range(6):   # 幾個人影（剪影，很淡）
    x = r.randint(40, IW - 60); dd.ellipse([x, 300, x + 22, 322], fill=(120, 110, 100)); dd.rounded_rectangle([x - 6, 320, x + 28, 420], radius=8, fill=r.choice([(80, 90, 110), (140, 60, 50), (60, 80, 60), (150, 140, 120)]))
inn.paste(im.filter(ImageFilter.GaussianBlur(1.2)), (0, 0))
# 2. 自助洗衣：白牆、兩排前開式洗衣機、上面一排烘衣機
im, dd = cell('laundry', 1, 0); ceiling(dd, 110, (236, 238, 238), (255, 255, 255), rows=2); dd.rectangle([0, 110, IW, IH], fill=(226, 232, 236))
for row, (y0_, n) in enumerate(((150, 9), (320, 9))):
    for k in range(n):
        x = 30 + k * 110; dd.rounded_rectangle([x, y0_, x + 96, y0_ + 140], radius=6, fill=(246, 248, 250), outline=(180, 186, 190), width=2)
        dd.ellipse([x + 18, y0_ + 30, x + 78, y0_ + 90], fill=(40, 60, 80)); dd.ellipse([x + 26, y0_ + 38, x + 70, y0_ + 82], fill=(100, 150, 190)); dd.rectangle([x + 8, y0_ + 8, x + 60, y0_ + 18], fill=(60, 90, 140))
dd.rectangle([0, 468, IW, IH], fill=(190, 196, 200)); inn.paste(im.filter(ImageFilter.GaussianBlur(1.0)), (IW, 0))
# 3. 麵店：暖光、木牆、菜單板、桌椅剪影、吊燈
im, dd = cell('noodle', 0, 1); dd.rectangle([0, 0, IW, IH], fill=(120, 74, 44)); dd.rectangle([0, 0, IW, 90], fill=(70, 44, 30))
for x in range(90, IW, 210): dd.line([(x, 0), (x, 70)], fill=(30, 20, 14), width=3); dd.ellipse([x - 26, 64, x + 26, 100], fill=(255, 200, 120))
dd.rectangle([200, 120, 820, 230], fill=(30, 26, 22)); ctext(dd, 510, 150, 'MENU', font(F_SANS, 30), (255, 220, 160))
for k in range(4): dd.rectangle([240 + k * 145, 185, 360 + k * 145, 192], fill=(220, 200, 160)); dd.rectangle([240 + k * 145, 205, 330 + k * 145, 211], fill=(190, 170, 130))
for k in range(4):
    x = 60 + k * 250; dd.rectangle([x, 330, x + 150, 345], fill=(80, 50, 30)); dd.rectangle([x + 70, 345, x + 80, 430], fill=(50, 32, 20))
    for s_ in (-1, 1): dd.rectangle([x + 75 + s_ * 110 - 20, 360, x + 75 + s_ * 110 + 20, 440], fill=(60, 40, 26))
dd.rectangle([0, 440, IW, IH], fill=(90, 60, 40)); inn.paste(im.filter(ImageFilter.GaussianBlur(1.0)), (0, IH))
# 4. 竹葉亞洲超市：燈管、紅色吊牌、貨架（紅黃包裝多）、米袋
im, dd = cell('asian', 1, 1); r = random.Random(4); ceiling(dd, 120, (230, 232, 228), (255, 255, 250), rows=2); dd.rectangle([0, 120, IW, IH], fill=(222, 220, 210)); dd.rectangle([0, 420, IW, IH], fill=(196, 192, 182))
for k, t in enumerate(('泡麵', '醬料', '零食', '冷凍')):
    cx = 140 + k * 250; dd.rectangle([cx - 70, 140, cx + 70, 188], fill=(170, 30, 34)); ctext(dd, cx, 164, t, font(CJK, 30), (255, 240, 220))
PAL_A = [(200, 48, 43), (224, 162, 27), (228, 106, 28), (242, 233, 216), (30, 138, 82), (163, 23, 42), (245, 210, 58)]
for k in range(6): shelves(dd, im, 30 + k * 165, 160 + k * 165, 210, 420, r, PAL_A)
for k in range(8): x = 40 + k * 120; dd.rounded_rectangle([x, 430, x + 90, 500], radius=10, fill=(236, 226, 200)); dd.rectangle([x + 10, 455, x + 80, 470], fill=(170, 40, 40))
inn.paste(im.filter(ImageFilter.GaussianBlur(1.1)), (IW, IH))
# 5. 空店面：白牆、水泥地、梯子、紙箱
im, dd = cell('vacant', 0, 2); dd.rectangle([0, 0, IW, IH], fill=(206, 204, 198)); dd.rectangle([0, 0, IW, 60], fill=(170, 168, 162)); dd.rectangle([0, 400, IW, IH], fill=(150, 148, 142))
dd.line([(600, 400), (660, 160)], fill=(120, 120, 124), width=10); dd.line([(700, 400), (660, 160)], fill=(120, 120, 124), width=10)
for k in range(4): dd.line([(608 + k * 12, 370 - k * 55), (692 - k * 12, 370 - k * 55)], fill=(120, 120, 124), width=6)
for (x, y, w, h) in ((150, 330, 120, 80), (260, 350, 90, 60), (170, 270, 80, 60)): dd.rectangle([x, y, x + w, y + h], fill=(176, 140, 96), outline=(140, 108, 70), width=3)
inn.paste(im.filter(ImageFilter.GaussianBlur(1.4)), (0, IH * 2))
inn.save(os.path.join(GEN, 'us_ms_interiors.png'))
json.dump({'cells': CELLS, 'cw': IW, 'ch': IH, 'size': [IW * 2, IH * 3]}, open(os.path.join(GEN, 'us_ms_interiors.json'), 'w'), indent=1)
print('us_ms_signs.png', len(RECT), '塊；us_ms_interiors.png', len(CELLS), '格')
