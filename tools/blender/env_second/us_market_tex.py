"""草原超市（SCN-US-03）程式產生的貼圖（PIL；系統 python3 或 /opt/blenv 都能跑）。LAWWW2-C 2026-10-17。
  python3 tools/blender/env_second/us_market_tex.py   → tools/blender/env_second/textures/gen/us_mk_*.png
- us_mk_products.png：貨架商品圖集 1024×2048，16 列、每列＝一層貨架 2.4 m × 0.3 m 的商品正面（427 px／m，橫直同比例）。
  **全部是假包裝**：色塊、色帶、橢圓、幾條淡色橫線當字；不畫任何真實品牌、商標、可讀的商品名（D77）。
  每種商品連著擺 2～5 個（真的貨架就是這樣），商品之間、上面露出深色貨架背板；列 0～15 的類別見 ROWS。
- us_mk_signs.png：區域招牌（PRODUCE、DAIRY…，一般英文字，不是品牌）＋走道號碼牌＋店名 Prairie Basket（AA_144 虛構）。
- us_mk_wire.png：推車、購物籃的鐵絲網（透明貼圖）。"""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen'); os.makedirs(GEN, exist_ok=True)
W, RH, NR = 1024, 128, 16
PPM = W / 2.4
ROWS = ['cereal', 'cereal2', 'snack', 'snack2', 'bottle', 'canbox', 'can', 'jar', 'bag', 'jug', 'paper', 'small', 'frozen', 'tub', 'milk', 'dairy']
PAL = ['#c8302b', '#e0a21b', '#2a6fb5', '#1e8a52', '#f2e9d8', '#6a2c8f', '#e46a1c', '#14365e', '#b8d43a', '#f4c6cf', '#8a5a2b', '#2b2b2b', '#d9d0b0', '#3fb0c9', '#a3172a', '#f5f1e6', '#5b7f2a', '#ef8fa3']
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def hx(c): return tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
def mix(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def dk(c, k): return tuple(max(0, int(v * k)) for v in c)


def label(d, r, x0, y0, x1, y1, base):
    """包裝正面：一條色帶、一個橢圓（假商標）、幾條淡色橫線（假字）、一個圓（假的食物照片）"""
    w, h = x1 - x0, y1 - y0
    acc = hx(r.choice(PAL))
    if r.random() < 0.7:
        by = y0 + h * r.uniform(0.15, 0.45); d.rectangle([x0, by, x1, by + h * r.uniform(0.12, 0.22)], fill=acc)
    ex, ey = x0 + w * r.uniform(0.25, 0.5), y0 + h * r.uniform(0.12, 0.3)
    d.ellipse([ex - w * 0.22, ey - h * 0.07, ex + w * 0.22, ey + h * 0.07], fill=mix(acc, (255, 255, 255), 0.6) if sum(base) < 380 else dk(acc, 0.8))
    for k in range(r.randint(1, 3)):
        ty = y0 + h * (0.55 + 0.08 * k); tw = w * r.uniform(0.3, 0.7)
        d.rectangle([x0 + w * 0.12, ty, x0 + w * 0.12 + tw, ty + max(1, h * 0.018)], fill=mix(base, (255, 255, 255) if sum(base) < 380 else (20, 20, 20), 0.55))
    if r.random() < 0.6:
        cr = min(w, h) * r.uniform(0.14, 0.22); cx, cy = x0 + w * r.uniform(0.5, 0.75), y0 + h * r.uniform(0.6, 0.8)
        d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=hx(r.choice(['#e8c070', '#c84a2a', '#f0e0b0', '#8a3a1a', '#f2d24a', '#5aa040'])))


def shade(im, x0, y0, x1, y1, top=1.08, bot=0.82, edge=0.75):
    """立體感：上亮下暗、左右邊緣暗一點（盒子的側面）"""
    px = im.load()
    for y in range(int(y0), int(y1)):
        k = top + (bot - top) * (y - y0) / max(1, y1 - y0)
        for x in range(int(x0), int(x1)):
            e = edge if (x - x0 < 2 or x1 - x < 3) else 1.0
            c = px[x, y]; px[x, y] = tuple(min(255, int(v * k * e)) for v in c)


def product(im, d, r, kind, x, w, base, ybot):
    h = RH - 4
    if kind in ('cereal', 'cereal2', 'frozen', 'paper', 'canbox'):
        hh = {'cereal': r.uniform(0.86, 0.98), 'cereal2': r.uniform(0.62, 0.8), 'frozen': r.uniform(0.3, 0.42), 'paper': r.uniform(0.8, 0.95), 'canbox': r.uniform(0.38, 0.5)}[kind] * h
        y0 = ybot - hh; d.rectangle([x, y0, x + w - 2, ybot], fill=base); label(d, r, x, y0, x + w - 2, ybot, base); shade(im, x, y0, x + w - 2, ybot)
    elif kind in ('snack', 'snack2', 'bag'):
        hh = (r.uniform(0.6, 0.85) if kind != 'bag' else r.uniform(0.5, 0.7)) * h; y0 = ybot - hh
        d.rounded_rectangle([x + 1, y0 + 6, x + w - 3, ybot], radius=6, fill=base)
        for k in range(int((w - 4) / 5)): d.polygon([(x + 2 + k * 5, y0 + 6), (x + 4.5 + k * 5, y0), (x + 7 + k * 5, y0 + 6)], fill=dk(base, 0.9))   # 封口鋸齒
        label(d, r, x + 2, y0 + 8, x + w - 4, ybot, base); shade(im, x + 1, y0, x + w - 3, ybot, 1.15, 0.8)
        d.rectangle([x + w * 0.22, y0 + 10, x + w * 0.27, ybot - 6], fill=mix(base, (255, 255, 255), 0.35))   # 亮面反光
    elif kind in ('bottle', 'small', 'jug', 'milk'):
        hh = {'bottle': r.uniform(0.85, 0.97), 'small': r.uniform(0.45, 0.62), 'jug': r.uniform(0.72, 0.86), 'milk': r.uniform(0.8, 0.9)}[kind] * h
        y0 = ybot - hh; neck = w * (0.3 if kind in ('bottle', 'small') else 0.35)
        body = base if kind != 'milk' else (238, 238, 232)
        d.rounded_rectangle([x + 1, y0 + hh * 0.28, x + w - 3, ybot], radius=int(w * 0.18), fill=body)
        d.polygon([(x + 1 + w * 0.08, y0 + hh * 0.3), (x + w / 2 - neck / 2, y0 + hh * 0.1), (x + w / 2 + neck / 2, y0 + hh * 0.1), (x + w - 3 - w * 0.08, y0 + hh * 0.3)], fill=body)
        cap = hx(r.choice(['#c8302b', '#2a6fb5', '#1e8a52', '#e0a21b', '#f5f1e6'])) if kind != 'milk' else hx(r.choice(['#c8302b', '#2a6fb5', '#1e8a52', '#6a2c8f']))
        d.rectangle([x + w / 2 - neck / 2, y0, x + w / 2 + neck / 2, y0 + hh * 0.11], fill=cap)
        if kind == 'jug': d.rounded_rectangle([x + w * 0.62, y0 + hh * 0.18, x + w * 0.8, y0 + hh * 0.42], radius=3, fill=(42, 41, 39))   # 把手的洞
        ly0 = y0 + hh * 0.45; label(d, r, x + 2, ly0, x + w - 4, ly0 + hh * 0.38, base if kind != 'milk' else cap)
        shade(im, x + 1, y0, x + w - 3, ybot, 1.12, 0.86, 0.7)
        d.rectangle([x + w * 0.2, y0 + hh * 0.3, x + w * 0.25, ybot - 4], fill=mix(body, (255, 255, 255), 0.5))
    elif kind in ('can', 'jar', 'tub', 'dairy'):
        hh = {'can': r.uniform(0.38, 0.45), 'jar': r.uniform(0.5, 0.62), 'tub': r.uniform(0.3, 0.38), 'dairy': r.uniform(0.25, 0.5)}[kind] * h
        for st in range(2 if kind in ('can', 'tub') else 1):   # 罐頭疊兩層
            yb = ybot - st * (hh + 1); y0 = yb - hh
            d.rectangle([x + 1, y0, x + w - 3, yb], fill=base)
            if kind == 'jar': d.rectangle([x + 3, y0 - 6, x + w - 5, y0], fill=hx(r.choice(['#c8b030', '#e8e4d8', '#c8302b'])))
            if kind == 'can':
                d.rectangle([x + 1, y0, x + w - 3, y0 + 3], fill=(170, 170, 168)); d.rectangle([x + 1, yb - 3, x + w - 3, yb], fill=(150, 150, 148))
            label(d, r, x + 1, y0 + 3, x + w - 3, yb - 3, base); shade(im, x + 1, y0, x + w - 3, yb, 1.1, 0.85, 0.72)


def tex_products(path):
    im = Image.new('RGB', (W, RH * NR)); d = ImageDraw.Draw(im); r = random.Random(17)
    for i, kind in enumerate(ROWS):
        y0 = i * RH
        for y in range(RH): d.line([(0, y0 + y), (W, y0 + y)], fill=mix((26, 25, 24), (54, 53, 50), y / RH))   # 貨架背板（下面亮一點）
        x = 1; ybot = y0 + RH - 2
        wmap = {'cereal': (0.19, 0.24), 'cereal2': (0.15, 0.2), 'snack': (0.17, 0.24), 'snack2': (0.12, 0.17), 'bottle': (0.1, 0.12), 'canbox': (0.28, 0.34), 'can': (0.075, 0.085),
                'jar': (0.08, 0.1), 'bag': (0.2, 0.28), 'jug': (0.14, 0.17), 'paper': (0.24, 0.3), 'small': (0.06, 0.08), 'frozen': (0.22, 0.28), 'tub': (0.1, 0.12), 'milk': (0.15, 0.16), 'dairy': (0.07, 0.11)}[kind]
        while x < W - 4:
            base = hx(r.choice(PAL)); n = r.randint(2, 5); w = int(r.uniform(*wmap) * PPM)
            for k in range(n):
                if x + w > W - 2: break
                product(im, d, r, kind, x, w, base, ybot); x += w + r.randint(1, 3)
            x += r.randint(2, 10)
        d.rectangle([0, y0, W, y0 + 3], fill=(18, 18, 17))   # 上一層層板的影子
    im.filter(ImageFilter.GaussianBlur(0.35)).save(path)


def tex_signs(path):
    """招牌圖集 1024×1024：上半 5 塊區域招牌（深綠底白字，各 1024×96）、店名一塊；下半 8 個走道號碼牌（每塊 256×128：大號碼＋類別字）"""
    im = Image.new('RGB', (1024, 1024), (40, 74, 52)); d = ImageDraw.Draw(im)
    f_big = ImageFont.truetype(FONT, 64); f_name = ImageFont.truetype(FONT, 80); f_num = ImageFont.truetype(FONT, 70); f_cat = ImageFont.truetype(FONT, 20)
    for i, t in enumerate(['PRODUCE', 'DAIRY', 'MEAT', 'BAKERY · DELI', 'FROZEN']):
        y0 = i * 96; d.rectangle([0, y0, 1024, y0 + 95], fill=(40, 74, 52)); d.rectangle([0, y0 + 88, 1024, y0 + 95], fill=(212, 170, 60))
        tw = d.textlength(t, font=f_big); d.text(((1024 - tw) / 2, y0 + 10), t, font=f_big, fill=(246, 242, 230))
    y0 = 480; d.rectangle([0, y0, 1024, y0 + 127], fill=(246, 242, 230))
    t = 'Prairie Basket'; tw = d.textlength(t, font=f_name); d.text(((1024 - tw) / 2 + 40, y0 + 18), t, font=f_name, fill=(40, 74, 52))
    cx = (1024 - tw) / 2 - 20; d.ellipse([cx - 40, y0 + 24, cx + 40, y0 + 104], fill=(212, 170, 60)); d.arc([cx - 30, y0 + 34, cx + 30, y0 + 94], 200, 340, fill=(40, 74, 52), width=8)   # 籃子圖示
    cats = ['CEREAL · BREAKFAST', 'SNACKS · CHIPS', 'BEVERAGES', 'CANNED · SOUP', 'PASTA · SAUCE', 'BAKING · SPICES', 'HOUSEHOLD', 'HEALTH · BEAUTY']
    for k in range(8):
        x0, y0 = (k % 4) * 256, 640 + (k // 4) * 128
        d.rectangle([x0, y0, x0 + 255, y0 + 127], fill=(246, 242, 230)); d.rectangle([x0 + 6, y0 + 6, x0 + 249, y0 + 121], outline=(40, 74, 52), width=4)
        n = str(k + 1); tw = d.textlength(n, font=f_num); d.text((x0 + (256 - tw) / 2, y0 + 8), n, font=f_num, fill=(40, 74, 52))
        tw = d.textlength(cats[k], font=f_cat); d.text((x0 + (256 - tw) / 2, y0 + 92), cats[k], font=f_cat, fill=(40, 40, 40))
    im.save(path)


def tex_wire(path):
    """鐵絲網（推車籃）：銀灰色的格子，其他透明"""
    im = Image.new('RGBA', (256, 256), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(0, 256, 16): d.line([(k, 0), (k, 255)], fill=(200, 202, 205, 255), width=3)
    for k in range(0, 256, 32): d.line([(0, k), (255, k)], fill=(200, 202, 205, 255), width=3)
    im.save(path)


if __name__ == '__main__':
    tex_products(os.path.join(GEN, 'us_mk_products.png')); tex_signs(os.path.join(GEN, 'us_mk_signs.png')); tex_wire(os.path.join(GEN, 'us_mk_wire.png'))
    print('ok')
