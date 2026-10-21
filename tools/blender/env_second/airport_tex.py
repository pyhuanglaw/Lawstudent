"""桃園機場第二航廈（VAC-A2）的程式產生貼圖（PIL）。LAWWW2-C 2026-10-17。
  python3 tools/blender/env_second/airport_tex.py → tools/blender/env_second/textures/gen/ap_*.png
- ap_signs.png（2048×1024，8 列×128 px）：台灣機場風格的指標（深灰底、黃色圖示、白色中英文字）：出境、報到、證照查驗、入境、出口、停車與交通、行李推車、航廈名。
- ap_shops.png（2048×768，6 列）：店家招牌（全部虛構，D77）：日日便利 DAILY MART、雲端咖啡 CLOUD CAFE、旅人書店、外幣兌換、電信門市、旅客服務。
- ap_airlines.png（1024×512，2×2）：四家虛構航空公司的櫃台背板（標誌是簡單幾何形狀＋名字；不像任何真實航空公司）。
- ap_fids_dep.png、ap_fids_arr.png（1024×512）：出發、抵達看板（黑底黃字；航班號碼是虛構代碼，城市是真的地名）。
- ap_ads.png（2048×1024）：四張燈箱廣告（風景插畫＋一行字，沒有品牌）。
- ap_ceiling.png、ap_ceiling_nor.png（256×256 無縫）：金屬格柵天花板（一條一條的鋁格柵＋縫的陰影）。
字型：WenQuanYi Zen Hei（GPL-2.0＋字型嵌入例外；只畫成點陣圖，不附字型檔）、DejaVu Sans。"""
import math, os, random
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
LAT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
LATR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
BG, YEL, WHT = (43, 47, 51), (242, 194, 48), (246, 246, 242)


def plane(d, cx, cy, s, col, rot=0.0):
    """飛機圖示（俯視）：機身、主翼、尾翼；rot＝弧度（0＝機頭朝上）"""
    def P(x, y):
        c, s_ = math.cos(rot), math.sin(rot); return (cx + (x * c - y * s_) * s, cy + (x * s_ + y * c) * s)
    d.polygon([P(-0.07, -0.5), P(0.07, -0.5), P(0.08, 0.45), P(-0.08, 0.45)], fill=col)
    d.polygon([P(-0.5, 0.08), P(0.5, 0.08), P(0.08, -0.12), P(-0.08, -0.12)], fill=col)
    d.polygon([P(-0.22, 0.48), P(0.22, 0.48), P(0.05, 0.36), P(-0.05, 0.36)], fill=col)
    nx_, ny_ = P(0, -0.5); d.ellipse([nx_ - 0.07 * s, ny_ - 0.07 * s, nx_ + 0.07 * s, ny_ + 0.07 * s], fill=col)   # 機頭圓


def arrow(d, cx, cy, s, col, ang):
    """箭頭（ang：0＝往上、π/2＝往右）"""
    def P(x, y):
        c, s_ = math.cos(ang), math.sin(ang); return (cx + (x * c - y * s_) * s, cy + (x * s_ + y * c) * s)
    d.polygon([P(0, -0.5), P(0.42, -0.05), P(0.15, -0.05), P(0.15, 0.5), P(-0.15, 0.5), P(-0.15, -0.05), P(-0.42, -0.05)], fill=col)


def tex_signs(path):
    W, RH = 2048, 128
    im = Image.new('RGB', (W, RH * 8), BG); d = ImageDraw.Draw(im)
    fz = ImageFont.truetype(CJK, 64); fe = ImageFont.truetype(LAT, 40)
    rows = [('出境', 'Departures', 'plane_up', 'arrow_up'), ('報到櫃台', 'Check-in Counters  A  B  C  D', 'desk', 'arrow_left'),
            ('證照查驗', 'Passport Control · Departures', 'passport', None), ('入境', 'Arrivals', 'plane_down', 'arrow_down'),
            ('出口', 'Exit', 'exit', 'arrow_right'), ('計程車　巴士　停車場', 'Taxi · Bus · Parking', 'bus', 'arrow_right'),
            ('行李推車', 'Baggage Carts', 'cart', None), ('第二航廈　出境', 'Terminal 2  Departures', 'plane_up', None)]
    for i, (zh, en, icon, ar) in enumerate(rows):
        y0 = i * RH; d.rectangle([0, y0, W, y0 + RH - 1], fill=BG)
        d.rounded_rectangle([18, y0 + 14, 118, y0 + 114], radius=10, fill=YEL)                     # 黃色圖示方塊
        cx, cy = 68, y0 + 64
        if icon == 'plane_up': plane(d, cx, cy, 80, BG, -0.6)
        elif icon == 'plane_down': plane(d, cx, cy, 80, BG, 2.4)
        elif icon == 'desk': d.rectangle([cx - 34, cy + 2, cx + 34, cy + 26], fill=BG); d.ellipse([cx - 12, cy - 34, cx + 12, cy - 10], fill=BG); d.rectangle([cx - 18, cy - 8, cx + 18, cy + 2], fill=BG)
        elif icon == 'passport': d.rounded_rectangle([cx - 24, cy - 32, cx + 24, cy + 32], radius=5, fill=BG); d.ellipse([cx - 12, cy - 14, cx + 12, cy + 10], outline=YEL, width=4)
        elif icon == 'exit': d.rectangle([cx - 28, cy - 34, cx + 6, cy + 34], outline=BG, width=6); arrow(d, cx + 12, cy, 44, BG, math.pi / 2)
        elif icon == 'bus': d.rounded_rectangle([cx - 32, cy - 30, cx + 32, cy + 22], radius=8, fill=BG); d.rectangle([cx - 24, cy - 22, cx + 24, cy - 2], fill=YEL); d.ellipse([cx - 26, cy + 14, cx - 12, cy + 30], fill=BG); d.ellipse([cx + 12, cy + 14, cx + 26, cy + 30], fill=BG)
        elif icon == 'cart': d.line([(cx - 34, cy - 30), (cx - 22, cy - 30), (cx - 12, cy + 16), (cx + 30, cy + 16)], fill=BG, width=6); d.rectangle([cx - 14, cy - 18, cx + 28, cy + 8], fill=BG); d.ellipse([cx - 14, cy + 20, cx - 2, cy + 32], fill=BG); d.ellipse([cx + 18, cy + 20, cx + 30, cy + 32], fill=BG)
        d.text((150, y0 + 22), zh, font=fz, fill=WHT)
        tw = d.textlength(zh, font=fz); d.text((150 + tw + 36, y0 + 40), en, font=fe, fill=WHT)
        if ar:
            ang = {'arrow_up': 0.0, 'arrow_down': math.pi, 'arrow_left': -math.pi / 2, 'arrow_right': math.pi / 2}[ar]
            d.rounded_rectangle([W - 120, y0 + 14, W - 20, y0 + 114], radius=10, fill=YEL); arrow(d, W - 70, y0 + 64, 76, BG, ang)
        d.line([(0, y0 + RH - 2), (W, y0 + RH - 2)], fill=(28, 30, 33), width=3)
    im.save(path)


def tex_shops(path):
    W, RH = 2048, 128
    im = Image.new('RGB', (W, RH * 6)); d = ImageDraw.Draw(im)
    fz = ImageFont.truetype(CJK, 70); fe = ImageFont.truetype(LAT, 44)
    rows = [('日日便利', 'DAILY MART', (24, 120, 88), (246, 246, 242)), ('雲端咖啡', 'CLOUD CAFE', (232, 226, 214), (64, 48, 40)),
            ('旅人書店', 'TRAVELERS BOOKS', (34, 46, 74), (236, 220, 180)), ('外幣兌換', 'CURRENCY EXCHANGE', (43, 47, 51), (242, 194, 48)),
            ('電信門市', 'SIM CARDS', (43, 47, 51), (242, 194, 48)), ('旅客服務', 'INFORMATION', (43, 47, 51), (242, 194, 48))]
    for i, (zh, en, bg, fg) in enumerate(rows):
        y0 = i * RH; d.rectangle([0, y0, W, y0 + RH], fill=bg)
        tw = d.textlength(zh, font=fz); te = d.textlength(en, font=fe); x = (W - tw - te - 50) / 2
        d.text((x, y0 + 20), zh, font=fz, fill=fg); d.text((x + tw + 50, y0 + 40), en, font=fe, fill=fg)
    im.save(path)


def tex_airlines(path):
    im = Image.new('RGB', (1024, 512)); d = ImageDraw.Draw(im)
    fz = ImageFont.truetype(CJK, 40); fe = ImageFont.truetype(LAT, 36)
    A = [('LUMEN AIR', '曜光航空', (18, 52, 96), (255, 196, 64), 'sun'), ('PACIFIC KITE', '太平洋風箏航空', (0, 120, 128), (250, 250, 245), 'kite'),
         ('NANFENG AIR', '南風航空', (140, 28, 40), (250, 240, 228), 'wave'), ('HARBOR JET', '港灣捷運航空', (36, 38, 44), (120, 200, 240), 'ring')]
    for k, (en, zh, bg, fg, logo) in enumerate(A):
        x0, y0 = (k % 2) * 512, (k // 2) * 256; d.rectangle([x0, y0, x0 + 511, y0 + 255], fill=bg)
        cx, cy = x0 + 90, y0 + 128
        if logo == 'sun':
            d.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=fg)
            for a in range(8): aa = a * math.pi / 4; d.line([(cx + 52 * math.cos(aa), cy + 52 * math.sin(aa)), (cx + 66 * math.cos(aa), cy + 66 * math.sin(aa))], fill=fg, width=6)
        elif logo == 'kite': d.polygon([(cx, cy - 60), (cx + 40, cy - 6), (cx, cy + 60), (cx - 40, cy - 6)], fill=fg); d.line([(cx, cy + 60), (cx + 18, cy + 90)], fill=fg, width=4)
        elif logo == 'wave':
            for j in range(3): d.arc([cx - 60, cy - 50 + j * 26, cx + 60, cy + 10 + j * 26], 200, 340, fill=fg, width=8)
        else: d.ellipse([cx - 52, cy - 52, cx + 52, cy + 52], outline=fg, width=12); d.ellipse([cx - 16, cy - 16, cx + 16, cy + 16], fill=fg)
        d.text((x0 + 180, y0 + 70), en, font=fe, fill=fg); d.text((x0 + 180, y0 + 128), zh, font=fz, fill=fg)
    im.save(path)


CITIES_D = [('東京/成田', 'TOKYO NARITA'), ('大阪/關西', 'OSAKA KANSAI'), ('舊金山', 'SAN FRANCISCO'), ('洛杉磯', 'LOS ANGELES'), ('首爾/仁川', 'SEOUL INCHEON'), ('香港', 'HONG KONG'),
            ('新加坡', 'SINGAPORE'), ('曼谷', 'BANGKOK'), ('芝加哥', 'CHICAGO'), ('福岡', 'FUKUOKA'), ('金邊', 'PHNOM PENH'), ('札幌', 'SAPPORO'), ('紐約', 'NEW YORK'), ('東京/羽田', 'TOKYO HANEDA')]


def tex_fids(path, arrive=False):
    W, H = 1024, 512; im = Image.new('RGB', (W, H), (8, 10, 12)); d = ImageDraw.Draw(im); r = random.Random(7 if arrive else 3)
    fz = ImageFont.truetype(CJK, 22); fe = ImageFont.truetype(LATR, 18); fh = ImageFont.truetype(CJK, 34); fhe = ImageFont.truetype(LAT, 28)
    d.rectangle([0, 0, W, 56], fill=(20, 24, 30))
    d.text((20, 8), '抵達' if arrive else '出發', font=fh, fill=YEL); d.text((110, 14), 'ARRIVALS' if arrive else 'DEPARTURES', font=fhe, fill=YEL)
    cols = [(20, '時間 Time'), (150, '航班 Flight'), (300, ('出發地 From' if arrive else '目的地 Destination')), (650, ('行李轉盤 Belt' if arrive else '櫃台 Counter')), (830, '備註 Remarks')]
    for x, t in cols: d.text((x, 64), t, font=fz, fill=(160, 170, 180))
    codes = ['LM', 'PK', 'NF', 'HJ']; t = 6 * 60 + 40 if not arrive else 5 * 60 + 10
    # 寒暑假出國、交換會飛的地方一定要在看板上（AA-C 2026-10-17：C08 首爾、C09 柬埔寨、C10 加州、C11 東京、C12 京都＝大阪關西；美國交換經芝加哥），打散在前 13 列裡
    MUST = [CITIES_D[k] for k in (4, 0, 10, 2, 1, 8, 3)]; r.shuffle(MUST); MUST = MUST + [None] * 6; r.shuffle(MUST); MUST = [m if m else r.choice(CITIES_D) for m in MUST]
    for i in range(13):
        y = 100 + i * 31
        if i % 2 == 0: d.rectangle([0, y - 3, W, y + 27], fill=(16, 20, 26))
        t += r.choice([10, 15, 20, 25]); c = r.choice(codes); zh, en = MUST[i] if i < len(MUST) else r.choice(CITIES_D)
        rem = r.choice((['已抵達 Landed', '準時 On Time', '準時 On Time', '延誤 Delayed', '提早 Early']) if arrive else ['準時 On Time', '準時 On Time', '登機 Boarding', '延誤 Delayed', '報到中 Check-in'])
        col = {'延誤': (240, 90, 70), '登機': (120, 220, 120), '已抵': (120, 220, 120)}.get(rem[:2], WHT)
        d.text((20, y), '%02d:%02d' % (t // 60 % 24, t % 60), font=fe, fill=WHT); d.text((150, y), '%s %d' % (c, r.randint(100, 899)), font=fe, fill=WHT)
        d.text((300, y - 2), zh, font=fz, fill=WHT); d.text((300 + d.textlength(zh, font=fz) + 14, y), en, font=fe, fill=(200, 205, 210))
        d.text((650, y), (str(r.randint(1, 7)) if arrive else r.choice('ABCD') + ' ' + str(r.randint(1, 18))), font=fe, fill=WHT); d.text((830, y - 2), rem, font=fz, fill=col)
    im.save(path)


def tex_ceiling(path, path_n, S=256):
    """鋁格柵天花板：沿 u 一條一條（每條 S/8 px）：亮的格柵面＋暗的縫；法線貼圖做出格柵的圓角"""
    im = Image.new('RGB', (S, S)); nm = Image.new('RGB', (S, S)); p, q = im.load(), nm.load(); P = S // 8
    for x in range(S):
        t = (x % P) / P
        if t < 0.72:
            k = 0.88 + 0.12 * math.sin(math.pi * t / 0.72); c = tuple(int(v * k) for v in (226, 224, 218)); nx = math.cos(math.pi * t / 0.72) * 0.35
        else: c = (70, 70, 72); nx = 0.0
        nz = math.sqrt(1 - nx * nx)
        for y in range(S): p[x, y] = c; q[x, y] = (int(128 + 127 * nx), 128, int(128 + 127 * nz))
    im.save(path); nm.save(path_n)


def tex_outside(path, arrive=False):
    """航廈外的遠景（2048×512，窗景平面用）：天空漸層、遠處的停車大樓與高架道路、一排樹、路燈（沒有字）"""
    W, H = 2048, 512; im = Image.new('RGB', (W, H)); d = ImageDraw.Draw(im); r = random.Random(11)
    for y in range(H):
        t = y / H; c = tuple(int(a + (b - a) * t) for a, b in zip((150, 190, 228), (226, 232, 236)))
        d.line([(0, y), (W, y)], fill=c)
    hz = int(H * 0.62)
    for k in range(6):                                                                             # 停車大樓（灰白、一層一層的橫帶）
        x0 = r.randint(0, W - 300); w = r.randint(260, 520); h = r.randint(70, 140)
        d.rectangle([x0, hz - h, x0 + w, hz], fill=(196, 198, 196))
        for j in range(4): yy = hz - h + 12 + j * (h - 16) // 4; d.rectangle([x0, yy, x0 + w, yy + 10], fill=(120, 124, 128))
    d.rectangle([0, hz - 34, W, hz - 22], fill=(170, 172, 170)); d.rectangle([0, hz - 22, W, hz - 16], fill=(120, 122, 124))   # 高架道路
    for x in range(0, W, 120): d.rectangle([x + 50, hz - 22, x + 64, hz], fill=(150, 152, 150))
    for k in range(70):                                                                            # 一排樹
        x = r.randint(0, W); rr = r.randint(18, 34); d.ellipse([x - rr, hz - rr * 2 + 6, x + rr, hz + 6], fill=r.choice([(62, 96, 58), (74, 108, 66), (54, 84, 52)]))
    d.rectangle([0, hz, W, H], fill=(128, 130, 132))
    for x in range(30, W, 160): d.line([(x, hz + 4), (x, hz - 90)], fill=(90, 94, 98), width=4); d.line([(x, hz - 90), (x + 22, hz - 94)], fill=(90, 94, 98), width=4)
    im.save(path)


def tex_ads(path):
    """燈箱廣告四張（2048×1024，每張 512×1024 直式）：簡化的風景插畫（山的日出、海岸、城市夜景、茶園）＋一行字；沒有品牌、商標"""
    W, H = 512, 1024; im = Image.new('RGB', (W * 4, H)); d = ImageDraw.Draw(im); r = random.Random(21)
    fz = ImageFont.truetype(CJK, 64); fe = ImageFont.truetype(LAT, 30)
    def grad(x0, top, bot, y0=0, y1=H):
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0 - 1); d.line([(x0, y), (x0 + W - 1, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bot)))
    # 1 山的日出
    x0 = 0; grad(x0, (250, 196, 140), (120, 150, 196)); d.ellipse([x0 + 300, 260, x0 + 420, 380], fill=(255, 236, 190))
    for k, (col, base) in enumerate((((96, 112, 150), 560), ((70, 84, 118), 650), ((46, 56, 82), 760))):
        pts = [(x0, H)] + [(x0 + i * 32, base - r.randint(0, 140) - (60 if 4 < i < 9 else 0)) for i in range(17)] + [(x0 + W, H)]; d.polygon(pts, fill=col)
    d.text((x0 + 40, 820), '山與雲之間', font=fz, fill=(250, 246, 236)); d.text((x0 + 44, 900), 'Above the Clouds', font=fe, fill=(250, 246, 236))
    # 2 海岸
    x0 = W; grad(x0, (120, 190, 230), (200, 230, 240), 0, 520); grad(x0, (40, 120, 160), (20, 70, 110), 520, H)
    d.polygon([(x0, 520), (x0 + 220, 430), (x0 + 330, 520)], fill=(90, 110, 90)); d.ellipse([x0 + 380, 110, x0 + 460, 190], fill=(255, 250, 230))
    for k in range(9): y = 560 + k * 40; d.line([(x0 + 20, y), (x0 + W - 20, y)], fill=(90, 160, 196), width=3)
    d.text((x0 + 40, 820), '回到海邊', font=fz, fill=(250, 246, 236)); d.text((x0 + 44, 900), 'Back to the Coast', font=fe, fill=(250, 246, 236))
    # 3 城市夜景
    x0 = 2 * W; grad(x0, (20, 26, 60), (70, 60, 110))
    for k in range(30):
        bx = x0 + r.randint(0, W - 60); bw = r.randint(30, 80); bh = r.randint(120, 380); d.rectangle([bx, 760 - bh, bx + bw, 760], fill=(30, 34, 56))
        for j in range(bh // 18):
            for i in range(bw // 14):
                if r.random() < 0.45: d.rectangle([bx + 4 + i * 14, 760 - bh + 6 + j * 18, bx + 10 + i * 14, 760 - bh + 14 + j * 18], fill=(250, 214, 140))
    d.polygon([(x0 + 250, 120), (x0 + 270, 120), (x0 + 290, 760), (x0 + 230, 760)], fill=(40, 46, 74))   # 一棟很高的塔樓（剪影）
    d.rectangle([x0, 760, x0 + W, H], fill=(16, 18, 30)); d.text((x0 + 40, 820), '夜晚的城市', font=fz, fill=(250, 246, 236)); d.text((x0 + 44, 900), 'City Lights', font=fe, fill=(250, 246, 236))
    # 4 茶園
    x0 = 3 * W; grad(x0, (200, 226, 236), (236, 240, 230), 0, 400)
    for k in range(14):
        y = 380 + k * 46; d.ellipse([x0 - 60, y, x0 + W + 60, y + 120], fill=(70 + k * 4, 130 + k * 3, 70))
        for i in range(0, W, 26): d.ellipse([x0 + i, y + 10, x0 + i + 30, y + 40], fill=(90 + k * 4, 150 + k * 3, 80))
    d.text((x0 + 40, 820), '一杯茶的時間', font=fz, fill=(40, 60, 40)); d.text((x0 + 44, 900), 'Time for Tea', font=fe, fill=(40, 60, 40))
    im.save(path)


if __name__ == '__main__':
    tex_signs(os.path.join(GEN, 'ap_signs.png')); tex_shops(os.path.join(GEN, 'ap_shops.png')); tex_airlines(os.path.join(GEN, 'ap_airlines.png'))
    tex_fids(os.path.join(GEN, 'ap_fids_dep.png')); tex_fids(os.path.join(GEN, 'ap_fids_arr.png'), True)
    tex_ceiling(os.path.join(GEN, 'ap_ceiling.png'), os.path.join(GEN, 'ap_ceiling_nor.png')); tex_outside(os.path.join(GEN, 'ap_outside.png')); tex_ads(os.path.join(GEN, 'ap_ads.png'))
    print('ok')
