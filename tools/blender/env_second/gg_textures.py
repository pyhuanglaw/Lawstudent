"""公館背景（GG-STREETVIEW-1020）的貼圖：立面、騎樓店面、招牌、水源市場。PIL 畫，存到 textures/gen/。
使用者 10-20 附的照片（羅斯福路的直立大看板、二樓橫招牌、冷氣、鐵窗；捷運出口；水源市場的藍色大樓與彩色橫條）只當參考，照片不進 repo。
店名、補習班、診所全部虛構（D77）；不寫電話號碼。用法：python3 tools/blender/env_second/gg_textures.py（gg_backdrop.py 會先呼叫）"""
import math, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen')
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def F(n): return ImageFont.truetype(CJK, n)
def hexc(h, a=255): h = h.lstrip('#'); return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)[:3] if a == 255 else (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c[:3])

# ---------------- 立面（4 × 2 格，每格 512 × 1024 px＝6 m × 4 層樓 12.4 m；第 8 格是側牆） ----------------
FAC_CELL = (512, 1024); FAC_M = (6.0, 12.4)
FACADES = [   # (牆色, 磁磚線, 窗型, 鐵窗機率, 冷氣機率, 窗簾色)
    ('#e8e4da', 'tile', 'alu', 0.6, 0.6, ['#c9b48a', '#9fb3c4', '#e0d2c0']),
    ('#d8c6a6', 'mosaic', 'alu', 0.5, 0.7, ['#b8735a', '#d9c49a', '#8fa7b8']),
    ('#b9b6ae', 'concrete', 'balcony', 0.3, 0.5, ['#a0a8a0', '#c9b090', '#d0c8b8']),
    ('#c9d3d6', 'tile', 'alu', 0.4, 0.5, ['#7f98aa', '#e2dacb', '#b0b8a0']),
    ('#b07a5e', 'brick', 'alu', 0.7, 0.6, ['#d8c8a8', '#a8b8c0', '#c0a080']),
    ('#ded8c8', 'stain', 'alu', 0.8, 0.8, ['#bfa98a', '#9aa6ad', '#d6c6a8']),
    ('#5f6f7a', 'glass', 'curtain', 0.0, 0.0, ['#7e94a3']),
]


def tile_lines(d, x0, y0, x1, y1, base, kind, rr):
    if kind in ('tile', 'mosaic', 'brick'):
        step = {'tile': 14, 'mosaic': 7, 'brick': 10}[kind]; lc = shade(base, 0.88)
        for y in range(y0, y1, step): d.line([(x0, y), (x1, y)], fill=lc, width=1)
        off = 0
        for y in range(y0, y1, step):
            off = (step // 2) if (kind == 'brick' and (y // step) % 2) else 0
            for x in range(x0 + off, x1, step * (2 if kind == 'brick' else 1)): d.line([(x, y), (x, min(y1, y + step))], fill=lc, width=1)
        if kind == 'mosaic':
            for _ in range(900):
                x, y = rr.randint(x0, x1 - 7), rr.randint(y0, y1 - 7); d.rectangle([x, y, x + 6, y + 6], fill=shade(base, rr.uniform(0.9, 1.08)))
    elif kind == 'concrete':
        for _ in range(500):
            x, y = rr.randint(x0, x1), rr.randint(y0, y1); d.point((x, y), fill=shade(base, rr.uniform(0.85, 1.05)))


def stains(img, x0, y0, x1, y1, rr, n=10):
    ov = Image.new('L', (x1 - x0, y1 - y0), 0); od = ImageDraw.Draw(ov)
    for _ in range(n):
        x = rr.randint(0, x1 - x0); w = rr.randint(4, 14); y = rr.randint(0, (y1 - y0) // 2)
        od.rectangle([x, y, x + w, y + rr.randint(80, 400)], fill=rr.randint(25, 60))
    ov = ov.filter(ImageFilter.GaussianBlur(6)); dark = Image.new('RGB', ov.size, (60, 58, 52)); base = img.crop((x0, y0, x1, y1))
    img.paste(Image.composite(dark, base, ov), (x0, y0))


def window(d, x0, y0, x1, y1, style, grille, curtain, lit, nd, rr):
    """一扇窗（白天的顏色畫在 d；晚上亮的窗畫在 nd）"""
    fr = (200, 204, 206) if style != 'curtain' else (70, 80, 88)
    d.rectangle([x0, y0, x1, y1], fill=fr)
    gx0, gy0, gx1, gy1 = x0 + 5, y0 + 5, x1 - 5, y1 - 5
    sky = rr.choice([(96, 118, 138), (120, 140, 158), (78, 96, 112), (140, 156, 168)])
    for yy in range(gy0, gy1):   # 玻璃：上亮下暗的反光＋窗簾
        t = (yy - gy0) / max(1, gy1 - gy0); c = tuple(int(sky[i] * (1.15 - 0.45 * t)) for i in range(3)); d.line([(gx0, yy), (gx1, yy)], fill=c)
    if curtain and rr.random() < 0.7:
        cc = hexc(curtain); cw = int((gx1 - gx0) * rr.uniform(0.25, 0.55)); side = rr.random() < 0.5
        d.rectangle([gx0 if side else gx1 - cw, gy0, gx0 + cw if side else gx1, gy1], fill=shade(cc, 0.8))
    d.line([((gx0 + gx1) // 2, gy0), ((gx0 + gx1) // 2, gy1)], fill=fr, width=4)   # 推拉窗的中框
    if lit: nd.rectangle([gx0, gy0, gx1, gy1], fill=rr.choice([(255, 214, 150), (255, 236, 200), (210, 230, 255), (255, 200, 130)]))
    if grille:   # 鐵窗：外凸的鐵框（橫條＋直條）＋下面的陰影
        gc = rr.choice([(90, 96, 98), (210, 212, 208), (120, 92, 70)])
        d.rectangle([x0 - 6, y0 - 8, x1 + 6, y1 + 6], outline=gc, width=4)
        for xx in range(x0, x1, 14): d.line([(xx, y0 - 6), (xx, y1 + 4)], fill=gc, width=2)
        for yy in (y0 + (y1 - y0) // 3, y0 + 2 * (y1 - y0) // 3): d.line([(x0 - 6, yy), (x1 + 6, yy)], fill=gc, width=2)
        d.rectangle([x0 - 6, y1 + 6, x1 + 6, y1 + 12], fill=(40, 40, 38))


def ac_unit(d, x, y, rr):
    w, h = 54, 40; d.rectangle([x, y, x + w, y + h], fill=(232, 232, 226), outline=(150, 150, 146))
    for k in range(6): d.line([(x + 6, y + 6 + k * 5), (x + w - 22, y + 6 + k * 5)], fill=(170, 170, 166))
    d.ellipse([x + w - 20, y + 8, x + w - 4, y + 24], outline=(150, 150, 146), width=2)
    d.rectangle([x + 4, y + h, x + 10, y + h + 6], fill=(120, 120, 116)); d.rectangle([x + w - 10, y + h, x + w - 4, y + h + 6], fill=(120, 120, 116))
    if rr.random() < 0.5: d.line([(x + 8, y + h + 6), (x + 8, y + h + 90)], fill=(110, 104, 96), width=2)   # 排水管的水痕


def make_facades():
    W, H = 2048, 2048; img = Image.new('RGB', (W, H), '#888888'); night = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img); nd = ImageDraw.Draw(night); rr = random.Random(20261020)
    cw, ch = FAC_CELL
    for k in range(8):
        cx, cy = (k % 4) * cw, (k // 4) * ch
        if k == 7:   # 側牆：磁磚、幾個小窗（樓梯間、浴室）
            base = hexc('#d6d0c4'); d.rectangle([cx, cy, cx + cw - 1, cy + ch - 1], fill=base); tile_lines(d, cx, cy, cx + cw, cy + ch, base, 'tile', rr)
            for f in range(4):
                for b in range(2):
                    if rr.random() < 0.45:
                        x0 = cx + 60 + b * 256 + rr.randint(0, 90); y0 = cy + f * 256 + 70; window(d, x0, y0, x0 + 60, y0 + 70, 'alu', rr.random() < 0.5, None, rr.random() < 0.3, nd, rr)
            stains(img, cx, cy, cx + cw, cy + ch, rr, 8); continue
        col, kind, wstyle, pg, pac, curt = FACADES[k]; base = hexc(col)
        d.rectangle([cx, cy, cx + cw - 1, cy + ch - 1], fill=base); tile_lines(d, cx, cy, cx + cw, cy + ch, base, kind if kind != 'glass' else 'tile', rr)
        for f in range(4):   # 由上往下：第 0 列是最上面那一層
            fy = cy + f * 256
            d.rectangle([cx, fy + 236, cx + cw - 1, fy + 255], fill=shade(base, 0.82))   # 樓板線
            if wstyle == 'curtain':   # 玻璃帷幕：整排深色玻璃＋直框
                for b in range(4):
                    x0 = cx + b * 128 + 4; window(d, x0, fy + 20, x0 + 120, fy + 232, 'curtain', False, None, rr.random() < 0.45, nd, rr)
                continue
            for b in range(2):
                bx = cx + b * 256
                if wstyle == 'balcony':   # 陽台：欄杆＋後面的落地窗＋晾衣服
                    d.rectangle([bx + 10, fy + 40, bx + 246, fy + 228], fill=shade(base, 0.55))
                    window(d, bx + 30, fy + 50, bx + 226, fy + 200, 'alu', False, rr.choice(curt), rr.random() < 0.35, nd, rr)
                    d.rectangle([bx + 6, fy + 150, bx + 250, fy + 232], fill=shade(base, 1.02), outline=shade(base, 0.7))
                    for xx in range(bx + 14, bx + 246, 18): d.line([(xx, fy + 156), (xx, fy + 226)], fill=shade(base, 0.75), width=3)
                    if rr.random() < 0.5:
                        for j in range(rr.randint(2, 5)): x = bx + 40 + j * 34; d.rectangle([x, fy + 92, x + 22, fy + 140], fill=rr.choice([(220, 80, 70), (80, 120, 190), (240, 240, 236), (90, 160, 110), (230, 190, 70)]))
                    continue
                x0, y0 = bx + 34, fy + 60; x1, y1 = bx + 222, fy + 196
                window(d, x0, y0, x1, y1, 'alu', rr.random() < pg, rr.choice(curt), rr.random() < 0.38, nd, rr)
                if rr.random() < pac: ac_unit(d, bx + rr.choice([40, 150]), fy + 200 - 4, rr)
        if kind == 'stain' or rr.random() < 0.5: stains(img, cx, cy, cx + cw, cy + ch, rr, 14)
    img.save(os.path.join(GEN, 'gg_bd_facade.png')); night.save(os.path.join(GEN, 'gg_bd_facade_night.png'))


# ---------------- 騎樓店面（4 × 2 格，每格 512 × 256 px＝6 m × 3 m：店面玻璃後面亮著的店裡） ----------------
SF_CELL = (512, 256)
def make_shopfronts():
    W, H = 2048, 512; img = Image.new('RGB', (W, H), (40, 40, 40)); d = ImageDraw.Draw(img); rr = random.Random(118)
    kinds = ['shelves', 'food', 'clothes', 'phone', 'shelves', 'cafe', 'clothes', 'food']
    for k, kd in enumerate(kinds):
        cx, cy = (k % 4) * 512, (k // 4) * 256
        bg = {'shelves': (244, 240, 228), 'food': (250, 232, 196), 'clothes': (246, 238, 232), 'phone': (236, 244, 250), 'cafe': (232, 214, 186)}[kd]
        d.rectangle([cx, cy, cx + 511, cy + 255], fill=bg)
        d.rectangle([cx, cy, cx + 511, cy + 36], fill=shade(bg, 0.8))   # 店裡的天花板燈帶
        for j in range(5): d.rectangle([cx + 30 + j * 96, cy + 14, cx + 80 + j * 96, cy + 22], fill=(255, 255, 250))
        if kd in ('shelves', 'phone'):
            for r_ in range(4):
                y = cy + 60 + r_ * 44; d.rectangle([cx + 10, y + 34, cx + 500, y + 38], fill=(150, 140, 130))
                x = cx + 14
                while x < cx + 496:
                    w = rr.randint(10, 26); d.rectangle([x, y + rr.randint(4, 18), x + w, y + 34], fill=rr.choice([(220, 70, 60), (60, 120, 200), (240, 200, 60), (90, 170, 110), (250, 250, 250), (230, 120, 170)])); x += w + 3
        elif kd == 'food':
            d.rectangle([cx + 20, cy + 150, cx + 492, cy + 230], fill=(200, 200, 204))   # 不鏽鋼台
            for j in range(8): d.ellipse([cx + 30 + j * 58, cy + 130, cx + 80 + j * 58, cy + 160], fill=rr.choice([(200, 120, 60), (230, 200, 120), (120, 160, 80), (220, 90, 60)]))
            for j in range(6): d.rectangle([cx + 40 + j * 78, cy + 60, cx + 100 + j * 78, cy + 110], fill=(250, 250, 240), outline=(200, 60, 50), width=3)   # 菜單
        elif kd == 'clothes':
            d.line([(cx + 20, cy + 70), (cx + 492, cy + 70)], fill=(120, 120, 120), width=3)
            x = cx + 24
            while x < cx + 486: w = rr.randint(18, 30); d.rectangle([x, cy + 72, x + w, cy + 72 + rr.randint(80, 140)], fill=rr.choice([(220, 80, 90), (80, 100, 160), (240, 230, 200), (60, 60, 60), (200, 170, 120), (120, 180, 200)])); x += w + 4
        elif kd == 'cafe':
            d.rectangle([cx + 20, cy + 160, cx + 300, cy + 240], fill=(120, 80, 50)); d.rectangle([cx + 320, cy + 70, cx + 490, cy + 150], fill=(40, 40, 40))
            for j in range(4): d.rectangle([cx + 330 + j * 40, cy + 80, cx + 360 + j * 40, cy + 140], fill=(240, 236, 220))
        for xx in (cx + 2, cx + 170, cx + 340, cx + 508): d.rectangle([xx, cy, xx + 4, cy + 255], fill=(60, 64, 66))   # 玻璃的直框
        for _ in range(3):   # 玻璃反光
            x = cx + rr.randint(0, 400); d.polygon([(x, cy + 255), (x + 40, cy + 255), (x + 120, cy + 40), (x + 80, cy + 40)], fill=shade(bg, 1.06))
    img.save(os.path.join(GEN, 'gg_bd_shopfront.png'))


# ---------------- 招牌（2048 × 2048）：整面大看板 8（256 × 1024）、二樓橫招牌 8（1024 × 128）、直立燈箱 16（128 × 512） ----------------
BILLBOARDS = [('明日文理', '補習班', '國高中・轉學考', '#e8457a', '#ffffff'), ('晴川美語', '', '托福・多益・雅思', '#2f7fd0', '#ffffff'), ('晨光牙醫', '診所', '矯正・植牙', '#ffffff', '#1f8a5b'),
              ('明澈眼科', '', '近視雷射', '#1f9a6a', '#ffffff'), ('學府套房', '出租', '近捷運・月租', '#f2d24a', '#c9302c'), ('公職補習', '考上就是你', '高普考・地特', '#d63a3a', '#ffffff'),
              ('動能健身', '', '24H', '#1e1e1e', '#f2c230'), ('遠帆留學', '代辦', '美・英・日', '#28b4c8', '#14335a')]
HSIGNS = [('老街鍋貼', '#c9302c', '#ffffff'), ('大碗冰品', '#2f6fd0', '#ffffff'), ('公館眼鏡行', '#ffffff', '#1d4e9a'), ('和安藥局', '#1f8a5b', '#ffffff'),
          ('小森髮藝', '#1e1e1e', '#e0b24a'), ('阿姨牛肉麵', '#f2c230', '#b5302a'), ('好走鞋店', '#e8742a', '#ffffff'), ('手機配件・維修', '#14335a', '#ffffff')]
LIGHTBOX = [('美容美髮', '#e8457a', '#ffffff'), ('按摩', '#ffffff', '#c9302c'), ('麻辣鍋', '#c9302c', '#ffffff'), ('咖哩', '#f2c230', '#5a3a1a'), ('拉麵', '#1e1e1e', '#ffffff'),
            ('珍珠奶茶', '#ffffff', '#5a3a1a'), ('影印', '#2f6fd0', '#ffffff'), ('旅館', '#7a3fa0', '#ffffff'), ('撞球', '#1f8a5b', '#ffffff'), ('卡拉OK', '#d63a3a', '#ffffff'),
            ('診所', '#ffffff', '#1f8a5b'), ('中醫', '#f4ead8', '#8a2a1a'), ('補習', '#f2d24a', '#c9302c'), ('租屋', '#ffffff', '#2f6fd0'), ('書局', '#14335a', '#ffffff'), ('早餐', '#e8742a', '#ffffff')]
SIGN_UV = {}


def vtext(d, cx, y0, y1, text, fill, maxw):
    n = len(text); size = min(maxw, int((y1 - y0) / max(1, n) * 0.92)); f = F(size); y = y0 + ((y1 - y0) - size * n) / 2
    for ch in text: w = d.textlength(ch, font=f); d.text((cx - w / 2, y), ch, font=f, fill=fill); y += size


def make_signs():
    W = 2048; img = Image.new('RGB', (W, W), (30, 30, 30)); d = ImageDraw.Draw(img)
    for k, (t1, t2, sub, bg, fg) in enumerate(BILLBOARDS):   # 整面大看板：直寫大字＋下面的小字
        x0, y0 = k * 256, 0; d.rectangle([x0, y0, x0 + 255, y0 + 1023], fill=hexc(bg)); d.rectangle([x0 + 6, y0 + 6, x0 + 249, y0 + 1017], outline=hexc(fg), width=4)
        vtext(d, x0 + 128, 40, 640 if t2 else 820, t1, hexc(fg), 190)
        if t2: vtext(d, x0 + 128, 650, 860, t2, hexc(fg), 110)
        fs = 34
        while fs > 16 and d.textlength(sub, font=F(fs)) > 210: fs -= 2
        f = F(fs); w = d.textlength(sub, font=f); d.rectangle([x0 + 16, 900, x0 + 240, 980], fill=hexc(fg)); d.text((x0 + 128 - w / 2, 940 - fs / 2), sub, font=f, fill=hexc(bg))
        SIGN_UV['bb%d' % k] = (x0 / W, 1 - 1024 / W, (x0 + 256) / W, 1.0)
    for k, (t, bg, fg) in enumerate(HSIGNS):   # 二樓橫招牌
        x0, y0 = (k % 2) * 1024, 1024 + (k // 2) * 128; d.rectangle([x0, y0, x0 + 1023, y0 + 127], fill=hexc(bg)); d.rectangle([x0 + 4, y0 + 4, x0 + 1019, y0 + 123], outline=hexc(fg), width=3)
        f = F(92); w = d.textlength(t, font=f); d.text((x0 + 512 - w / 2, y0 + 12), t, font=f, fill=hexc(fg))
        SIGN_UV['hs%d' % k] = (x0 / W, 1 - (y0 + 128) / W, (x0 + 1024) / W, 1 - y0 / W)
    for k, (t, bg, fg) in enumerate(LIGHTBOX):   # 直立燈箱（兩面一樣）
        x0, y0 = k * 128, 1536; d.rectangle([x0, y0, x0 + 127, y0 + 511], fill=hexc(bg)); d.rectangle([x0 + 3, y0 + 3, x0 + 124, y0 + 508], outline=hexc(fg), width=3)
        vtext(d, x0 + 64, y0 + 20, y0 + 492, t, hexc(fg), 100)
        SIGN_UV['lb%d' % k] = (x0 / W, 1 - (y0 + 512) / W, (x0 + 128) / W, 1 - y0 / W)
    img.save(os.path.join(GEN, 'gg_bd_signs.png'))


# ---------------- 水源市場（1024 × 1024）：上半是藍色立面＋彩色橫條＋大字，下半是一樓的攤位 ----------------
def make_market():
    img = Image.new('RGB', (1024, 1024), (40, 110, 200)); d = ImageDraw.Draw(img); rr = random.Random(92)
    blue = (46, 120, 210)
    d.rectangle([0, 0, 1023, 767], fill=blue)
    cols = [(150, 110, 200), (240, 150, 60), (250, 250, 250), (90, 170, 230), (120, 80, 170), (250, 200, 80), (60, 90, 170)]
    for r_ in range(6):   # 彩色橫條（每一層一條，一格一格不同顏色）
        y = 40 + r_ * 112; x = 0
        while x < 1024:
            w = rr.randint(40, 110); d.rectangle([x, y, x + w - 4, y + 46], fill=rr.choice(cols)); x += w
        for xx in range(0, 1024, 64): d.rectangle([xx + 8, y + 56, xx + 56, y + 96], fill=(30, 70, 120))   # 橫條下面的窗
    f = F(150); t = '水源市場'; w = d.textlength(t, font=f); d.text((512 - w / 2, 690 - 160), t, font=f, fill=(255, 255, 255))
    # 一樓攤位（下半）：遮雨棚＋掛滿衣服、包包、帽子
    d.rectangle([0, 768, 1023, 1023], fill=(220, 220, 214))
    for x in range(0, 1024, 128):
        d.rectangle([x, 768, x + 127, 800], fill=rr.choice([(60, 150, 200), (230, 230, 230), (200, 60, 60)]))
        for j in range(14):
            xx = x + 6 + j * 8; d.rectangle([xx, 806, xx + 6, 806 + rr.randint(60, 150)], fill=rr.choice([(240, 120, 150), (250, 220, 90), (80, 140, 200), (250, 250, 250), (60, 60, 60), (120, 200, 160), (230, 100, 60)]))
    img.save(os.path.join(GEN, 'gg_bd_market.png'))


def make_all():
    os.makedirs(GEN, exist_ok=True); make_facades(); make_shopfronts(); make_signs(); make_market()
    return SIGN_UV


if __name__ == '__main__':
    make_all(); print('ok', len(SIGN_UV))
