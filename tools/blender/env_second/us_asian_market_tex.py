"""竹葉亞洲超市（大超市對面的小亞洲超市，區域 us_asian_market）程式產生的貼圖（PIL）。LAWWW2-C 2026-10-17。
  python3 tools/blender/env_second/us_asian_market_tex.py   → tools/blender/env_second/textures/gen/us_am_*.png
- us_am_products.png：貨架商品圖集 1024×1280，10 列、每列＝一層貨架 2.4 m × 0.3 m（427 px／m，和草原超市的圖集同比例；畫法沿用 us_market_tex.product）。
  列：0 袋裝泡麵、1 碗麵／杯麵、2 醬油瓶、3 辣椒醬罐、4 零食袋、5 餅乾盒、6 乾貨袋、7 茶葉盒、8 冷凍水餃袋、9 飲料（鋁箔包、瓶裝）。
  **全部是假包裝**：色塊、色帶、碗的圖案、幾條淡色橫線當字；不畫品牌、商標、可讀的商品名（D77）。
- us_am_signs.png：走道吊牌（中英：泡麵 NOODLES…）、區域招牌（米 RICE、冷凍 FROZEN、青菜 PRODUCE）、店名（竹葉亞洲超市，虛構）。
- us_am_view.png：從店裡看出去的景（馬路對面的草原超市、它的停車場）；天空透明（遊戲照時段畫的天空透出來）。
- us_am_calendar.png：結帳櫃台後面牆上的月曆（紅色、格子，沒有字）。"""
import os, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import us_market_tex as T   # noqa: E402

GEN = T.GEN
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
ROWS = ['noodle', 'cup', 'bottle', 'jar', 'snack', 'cereal2', 'bag', 'canbox', 'frozen', 'drink']
PAL_A = ['#c8302b', '#e0a21b', '#e46a1c', '#f2e9d8', '#1e8a52', '#a3172a', '#f5d23a', '#2b2b2b', '#f5f1e6', '#d9531e', '#3d7a2a', '#8a1f24', '#f2b8b0', '#2a6fb5']


def noodle(im, d, r, x, w, base, ybot):
    """袋裝泡麵：枕頭包（上下封口鋸齒）、正面一個碗（褐色湯＋麵條＋紅辣椒／綠蔥）、一條色帶、幾條字的橫線"""
    h = T.RH - 4; hh = r.uniform(0.55, 0.72) * h; y0 = ybot - hh
    d.rounded_rectangle([x + 1, y0 + 5, x + w - 3, ybot - 3], radius=5, fill=base)
    for k in range(int((w - 4) / 5)):
        d.polygon([(x + 2 + k * 5, y0 + 5), (x + 4.5 + k * 5, y0), (x + 7 + k * 5, y0 + 5)], fill=T.dk(base, 0.88))
        d.polygon([(x + 2 + k * 5, ybot - 3), (x + 4.5 + k * 5, ybot + 1), (x + 7 + k * 5, ybot - 3)], fill=T.dk(base, 0.88))
    acc = T.hx(r.choice(['#f5d23a', '#f5f1e6', '#2b2b2b', '#1e8a52', '#c8302b']))
    d.rectangle([x + 2, y0 + hh * 0.14, x + w - 4, y0 + hh * 0.28], fill=acc)
    cx, cy, rw = x + w * 0.58, y0 + hh * 0.66, w * 0.3
    d.ellipse([cx - rw, cy - rw * 0.42, cx + rw, cy + rw * 0.55], fill=(238, 232, 220))                       # 碗
    d.ellipse([cx - rw * 0.86, cy - rw * 0.34, cx + rw * 0.86, cy + rw * 0.2], fill=T.hx(r.choice(['#b8521e', '#d8a050', '#9a3a1a'])))   # 湯
    for k in range(4): d.arc([cx - rw * 0.7, cy - rw * 0.3 + k * 2, cx + rw * 0.5, cy + rw * 0.1 + k * 2], 190, 340, fill=(240, 214, 140), width=2)   # 麵條
    d.ellipse([cx - rw * 0.2, cy - rw * 0.2, cx, cy - rw * 0.05], fill=T.hx(r.choice(['#3d8a2a', '#c8302b'])))
    for k in range(2): d.rectangle([x + w * 0.1, y0 + hh * (0.36 + 0.08 * k), x + w * (0.1 + r.uniform(0.25, 0.4)), y0 + hh * (0.36 + 0.08 * k) + 2], fill=T.mix(base, (255, 255, 255), 0.6))
    T.shade(im, x + 1, y0, x + w - 3, ybot, 1.12, 0.84)


def cup(im, d, r, x, w, base, ybot):
    """碗麵、杯麵：上寬下窄的杯身、上面一圈蓋子（紙蓋）"""
    h = T.RH - 4; hh = r.uniform(0.38, 0.5) * h; y0 = ybot - hh
    for st in range(2):
        yb = ybot - st * (hh + 1); yt = yb - hh
        d.polygon([(x + 1, yt + 4), (x + w - 3, yt + 4), (x + w - 3 - w * 0.08, yb), (x + 1 + w * 0.08, yb)], fill=base)
        d.rectangle([x, yt, x + w - 2, yt + 5], fill=(236, 232, 224))
        d.rectangle([x + w * 0.15, yt + hh * 0.35, x + w * 0.85, yt + hh * 0.55], fill=T.hx(r.choice(['#f5d23a', '#f5f1e6', '#2b2b2b'])))
        T.shade(im, x, yt, x + w - 2, yb, 1.1, 0.85, 0.72)


def drink(im, d, r, x, w, base, ybot):
    """鋁箔包（方的）或寶特瓶（茶）"""
    if r.random() < 0.5: T.product(im, d, r, 'small', x, w, base, ybot); return
    h = T.RH - 4; hh = r.uniform(0.42, 0.5) * h; y0 = ybot - hh
    d.rectangle([x + 1, y0, x + w - 3, ybot], fill=base); d.polygon([(x + 1, y0), (x + w / 2, y0 - 6), (x + w - 3, y0)], fill=T.dk(base, 0.9))
    T.label(d, r, x + 1, y0 + 4, x + w - 3, ybot - 2, base); T.shade(im, x + 1, y0, x + w - 3, ybot, 1.1, 0.85)


def tex_products(path):
    W, RH = T.W, T.RH; im = Image.new('RGB', (W, RH * len(ROWS))); d = ImageDraw.Draw(im); r = random.Random(23)
    T.PAL = PAL_A
    wmap = {'noodle': (0.13, 0.17), 'cup': (0.1, 0.13), 'bottle': (0.07, 0.09), 'jar': (0.07, 0.09), 'snack': (0.15, 0.22), 'cereal2': (0.15, 0.2),
            'bag': (0.16, 0.22), 'canbox': (0.14, 0.2), 'frozen': (0.22, 0.28), 'drink': (0.07, 0.09)}
    for i, kind in enumerate(ROWS):
        y0 = i * RH
        for y in range(RH): d.line([(0, y0 + y), (W, y0 + y)], fill=T.mix((26, 25, 24), (54, 53, 50), y / RH))
        x = 1; ybot = y0 + RH - 2
        while x < W - 4:
            if kind == 'bottle': base = T.hx(r.choice(['#3a1e10', '#4a2a14', '#2a1a10', '#6a1a12']))   # 醬油、醋、麻油：深色瓶
            elif kind == 'jar': base = T.hx(r.choice(['#a3172a', '#c8302b', '#8a1f24', '#6a3a1a', '#d9531e']))
            else: base = T.hx(r.choice(PAL_A))
            n = r.randint(3, 6); w = int(r.uniform(*wmap[kind]) * T.PPM)
            for k in range(n):
                if x + w > W - 2: break
                if kind == 'noodle': noodle(im, d, r, x, w, base, ybot)
                elif kind == 'cup': cup(im, d, r, x, w, base, ybot)
                elif kind == 'drink': drink(im, d, r, x, w, base, ybot)
                else: T.product(im, d, r, kind, x, w, base, ybot)
                x += w + r.randint(1, 3)
            x += r.randint(2, 8)
        d.rectangle([0, y0, W, y0 + 3], fill=(18, 18, 17))
    im.filter(ImageFilter.GaussianBlur(0.35)).save(path)


SIGN_TEXT = [('泡麵', 'NOODLES'), ('醬料', 'SAUCES'), ('零食、餅乾', 'SNACKS'), ('乾貨、茶葉', 'DRY GOODS · TEA')]
DEPT = [('米', 'RICE'), ('冷凍', 'FROZEN'), ('青菜、豆腐', 'PRODUCE · TOFU'), ('飲料', 'DRINKS')]


def tex_signs(path):
    """1024×1024：上面 4 塊走道吊牌（每塊 512×160：紅底、金框、號碼＋中文＋英文）；中間 4 塊區域招牌（1024×96：深綠底白字）；下面店名（1024×200）"""
    im = Image.new('RGB', (1024, 1024), (150, 30, 32)); d = ImageDraw.Draw(im)
    f_num = ImageFont.truetype(CJK, 92); f_zh = ImageFont.truetype(CJK, 58); f_en = ImageFont.truetype(CJK, 26); f_dz = ImageFont.truetype(CJK, 54); f_dn = ImageFont.truetype(CJK, 34)
    for k, (zh, en) in enumerate(SIGN_TEXT):
        x0, y0 = (k % 2) * 512, (k // 2) * 160
        d.rectangle([x0, y0, x0 + 511, y0 + 159], fill=(160, 32, 34)); d.rectangle([x0 + 6, y0 + 6, x0 + 505, y0 + 153], outline=(222, 180, 80), width=5)
        d.ellipse([x0 + 22, y0 + 22, x0 + 138, y0 + 138], fill=(246, 236, 210)); n = str(k + 1); tw = d.textlength(n, font=f_num); d.text((x0 + 80 - tw / 2, y0 + 28), n, font=f_num, fill=(160, 32, 34))
        d.text((x0 + 160, y0 + 22), zh, font=f_zh, fill=(250, 240, 214)); d.text((x0 + 162, y0 + 100), en, font=f_en, fill=(240, 214, 150))
    for k, (zh, en) in enumerate(DEPT):
        y0 = 320 + k * 96; d.rectangle([0, y0, 1024, y0 + 95], fill=(34, 72, 52)); d.rectangle([0, y0 + 88, 1024, y0 + 95], fill=(222, 180, 80))
        t = zh + '  ' + en; tw = d.textlength(zh, font=f_dz) + d.textlength('  ' + en, font=f_dn)
        x = (1024 - tw) / 2; d.text((x, y0 + 14), zh, font=f_dz, fill=(246, 242, 230)); d.text((x + d.textlength(zh, font=f_dz), y0 + 30), '  ' + en, font=f_dn, fill=(230, 220, 190))
    y0 = 720; d.rectangle([0, y0, 1024, y0 + 199], fill=(246, 240, 226)); d.rectangle([0, y0 + 186, 1024, y0 + 199], fill=(34, 110, 62))
    for (cx, cy, a) in ((96, y0 + 112, 35), (150, y0 + 84, -20), (118, y0 + 62, 65)):   # 竹葉的圖示（三片細長的葉子＋葉脈）
        leaf = Image.new('RGBA', (150, 34), (0, 0, 0, 0)); ld = ImageDraw.Draw(leaf); ld.polygon([(0, 17), (40, 2), (149, 17), (40, 32)], fill=(46, 130, 70, 255)); ld.line([(4, 17), (146, 17)], fill=(30, 96, 52, 255), width=2)
        leaf = leaf.rotate(a, expand=True, resample=Image.BICUBIC); im.paste(leaf, (int(cx - leaf.width / 2), int(cy - leaf.height / 2)), leaf)
    d.text((220, y0 + 22), '竹葉亞洲超市', font=ImageFont.truetype(CJK, 92), fill=(150, 30, 32)); d.text((226, y0 + 128), 'BAMBOO LEAF ASIAN MARKET', font=ImageFont.truetype(CJK, 40), fill=(34, 110, 62))
    im.save(path)


def tex_view(path, W=2048, Hh=512):
    """店裡往南看出去：馬路對面的草原超市（米色長條量體、深綠色帶、店名 Prairie Basket——AA_144 的虛構店名）、它門口的停車場；天空透明"""
    r = random.Random(61); im = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    gy = int(Hh * 0.72)
    for x in range(0, W, 10):   # 遠一點的樹（店後面）
        h_ = r.randint(60, 110); d.ellipse([x - 18, gy - 140 - h_, x + 18, gy - 120], fill=(r.randint(60, 95), r.randint(105, 140), r.randint(55, 80), 255))
    d.rectangle([200, gy - 190, 1850, gy], fill=(214, 204, 182, 255))                       # 草原超市的量體
    d.rectangle([200, gy - 205, 1850, gy - 190], fill=(176, 168, 150, 255))
    d.rectangle([200, gy - 150, 1850, gy - 118], fill=(40, 74, 52, 255)); d.rectangle([200, gy - 120, 1850, gy - 116], fill=(212, 170, 60, 255))
    d.rectangle([780, gy - 190, 1270, gy - 150], fill=(246, 242, 230, 255))
    f = ImageFont.truetype(T.FONT, 34); t = 'Prairie Basket'; tw = d.textlength(t, font=f); d.text((1025 - tw / 2, gy - 186), t, font=f, fill=(40, 74, 52, 255))
    d.rectangle([260, gy - 110, 1790, gy - 6], fill=(70, 86, 96, 255))                        # 玻璃帷幕
    for x in range(260, 1790, 60): d.line([(x, gy - 110), (x, gy - 6)], fill=(40, 42, 44, 255), width=3)
    for dx in (520, 1530): d.rectangle([dx - 40, gy - 96, dx + 40, gy - 6], fill=(150, 170, 176, 255))   # 兩組自動門
    d.rectangle([0, gy, W, Hh], fill=(110, 110, 112, 255))                                   # 它的停車場
    for k in range(14):
        cx = 120 + k * 135 + r.randint(-20, 20); cy = gy + 40; c = r.choice([(170, 30, 32), (40, 50, 70), (200, 200, 205), (30, 30, 34), (120, 124, 128), (240, 240, 236)])
        if r.random() < 0.3: continue
        d.rounded_rectangle([cx - 50, cy - 22, cx + 50, cy + 10], 10, fill=c + (255,)); d.rounded_rectangle([cx - 32, cy - 40, cx + 28, cy - 20], 8, fill=tuple(int(v * 0.8) for v in c) + (255,))
    for x in (150, 1900): d.rectangle([x - 3, gy - 160, x + 3, gy + 20], fill=(60, 56, 50, 255)); d.rectangle([x - 20, gy - 166, x + 20, gy - 156], fill=(60, 56, 50, 255))   # 停車場的燈桿
    im.filter(ImageFilter.GaussianBlur(1.2)).save(path)


def tex_calendar(path):
    im = Image.new('RGB', (200, 280), (248, 246, 240)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 199, 120], fill=(196, 40, 36)); d.ellipse([60, 20, 140, 100], fill=(230, 180, 70))   # 上半張：紅底金色圓（年畫式的圖，沒有字）
    for j in range(5):
        for i in range(7): d.rectangle([10 + i * 26, 132 + j * 28, 30 + i * 26, 150 + j * 28], fill=(200, 60, 50) if i in (0, 6) else (90, 90, 96))
    im.save(path)


def all_tex():
    tex_products(os.path.join(GEN, 'us_am_products.png')); tex_signs(os.path.join(GEN, 'us_am_signs.png'))
    tex_view(os.path.join(GEN, 'us_am_view.png')); tex_calendar(os.path.join(GEN, 'us_am_calendar.png'))


if __name__ == '__main__':
    all_tex(); print('ok')
