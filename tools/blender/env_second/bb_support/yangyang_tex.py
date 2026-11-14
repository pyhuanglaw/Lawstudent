"""洋洋鹹酥雞室內的貼圖（PIL＋numpy，執行 yangyang_interior.py 時自動產生）。BB（帳號 A）2026-11-04。
照參考圖 docs/story_planning/ref_images/shops/gongguan_yangyang_int.webp 取色：淺灰小方磚地、暖白天花板、右牆暖黃色舊漆、蜂蜜色木桌面、
刷紋不鏽鋼（共用 shaola_tex.steel）、一張印刷圖集（招牌、菜單板、點餐結帳牌、海報、自助區、垃圾分類、價目牌、門簾）、冷飲櫃裡面（發光）。
菜單照 AA_650 第 4 節；店名是使用者給的虛構店名（D77）；沒有真實校名（D115）。"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw
from shaola_tex import _noise, _save, font, steel
from cvs_tex import _item, ctext

RED = (168, 44, 36); CREAM = (246, 236, 214); BROWN = (110, 62, 36)


def floor(path, rough_path):
    """1024＝2.4 m：30 cm 淺灰小方磚（8 × 8），縫比較深、每塊顏色稍有不同"""
    W = H = 1024; t = 128; rng = np.random.RandomState(501)
    n1 = _noise(H, W, 200, 502); n2 = _noise(H, W, 4, 503, 2)
    base = np.array([178, 174, 168], np.float32)
    col = base[None, None] * (0.94 + 0.08 * n1[..., None] + 0.05 * (n2[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    for i in range(8):
        for j in range(8): col[i * t:(i + 1) * t, j * t:(j + 1) * t] *= rng.uniform(0.95, 1.05)
    sp = rng.rand(H, W); col[sp > 0.985] *= 0.85
    g = np.zeros((H, W), bool)
    for i in range(0, H, t): g[max(0, i - 2):i + 2] = True
    for j in range(0, W, t): g[:, max(0, j - 2):j + 2] = True
    col[g] = col[g] * 0.62 + np.array([120, 116, 108]) * 0.38
    _save(col, path); _save(np.repeat((np.clip(0.35 + 0.1 * n1 + 0.35 * g, 0.1, 0.95) * 255)[..., None], 3, 2), rough_path)
    return path


def ceiling(path):
    W = H = 1024; t = 256; n = _noise(H, W, 6, 511, 2)
    col = np.array([236, 228, 208], np.float32)[None, None] * (0.97 + 0.05 * (n[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    for i in range(0, H, t): col[max(0, i - 4):i + 4] = [214, 208, 192]
    for j in range(0, W, t): col[:, max(0, j - 4):j + 4] = [214, 208, 192]
    return _save(col, path)


def wall(path):
    """暖黃色舊漆（1024＝2 m 寬、3.2 m 高）：色差、一塊一塊補漆、水漬、下緣被椅子磨髒、手印"""
    W, H = 1024, 1024; rng = np.random.RandomState(521)
    n1 = _noise(H, W, 160, 521); n2 = _noise(H, W, 10, 522, 3); n3 = _noise(H, W, 40, 523, 3)
    yy = np.linspace(0, 1, H)[:, None]
    col = np.array([232, 214, 168], np.float32)[None, None] * (0.93 + 0.08 * n1[..., None] + 0.04 * (n2[..., None] - 0.5))   # 暖奶油色 #e8d6a8（黃色靠燈照出來）
    patch = (n3 > 0.66).astype(np.float32); col = col * (1 - 0.08 * patch[..., None]) + np.array([240, 226, 186]) * 0.08 * patch[..., None]   # 補過的漆
    stain = np.clip((n3 - 0.3) * 3, 0, 1) * np.clip((yy - 0.6) / 0.3, 0, 1)   # 下半的水漬、油漬
    col = col * (1 - 0.16 * stain[..., None]) + np.array([160, 136, 96]) * 0.16 * stain[..., None]
    low = np.clip((yy - 0.72) / 0.06, 0, 1) * np.clip((yy - 0.72) / 0.06 * 0 + 1, 0, 1) * (0.5 + 0.5 * _noise(H, W, 30, 524, 2))
    col = col * (1 - 0.2 * low[..., None]) + np.array([130, 116, 90]) * 0.2 * low[..., None]   # 椅背高度以下磨髒
    col *= (1 - 0.15 * np.clip((yy - 0.93) / 0.07, 0, 1))[..., None]
    im = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for _ in range(14):   # 撕掉的膠帶痕、刮痕
        x, y = rng.randint(0, W - 60), rng.randint(200, 900)
        if rng.random() < 0.5: d.rectangle([x, y, x + rng.randint(20, 40), y + 6], fill=(220, 200, 150))
        else: d.line([(x, y), (x + rng.randint(40, 160), y + rng.randint(-10, 10))], fill=(196, 176, 130), width=2)
    im.save(path); return path


def wood(path):
    W = H = 512; rng = np.random.RandomState(531)
    rows = rng.normal(0, 1, (H, 1)).astype(np.float32); rows = (rows - rows.min()) / (np.ptp(rows) + 1e-6)
    rows = np.asarray(Image.fromarray((rows * 255).astype(np.uint8)).resize((1, H), Image.BILINEAR), np.float32) / 255
    g = 0.65 * rows + 0.35 * _noise(H, W, 3, 532, 2)
    knots = _noise(H, W, 40, 533, 2)
    col = np.array([214, 182, 136], np.float32)[None, None] * (0.8 + 0.3 * g[..., None] - 0.08 * np.clip((knots[..., None] - 0.7) * 5, 0, 1))   # 淺原木色＋木紋
    return _save(col, path)


S = 2048
CELLS = {}


def _cell(name, x, y, w, h):
    CELLS[name] = (x / S, 1 - (y + h) / S, (x + w) / S, 1 - y / S); return (x, y, x + w, y + h)


def chicken(d, cx, cy, r, col=(250, 246, 236), line=(120, 60, 30)):
    """小雞頭（店的標誌）"""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col, outline=line, width=max(2, r // 10))
    for k in range(3): d.ellipse([cx - r * 0.5 + k * r * 0.35, cy - r * 1.35, cx - r * 0.15 + k * r * 0.35, cy - r * 0.8], fill=(214, 52, 40))
    d.ellipse([cx + r * 0.15, cy - r * 0.25, cx + r * 0.35, cy - r * 0.05], fill=(40, 30, 20))
    d.polygon([(cx + r * 0.85, cy), (cx + r * 1.35, cy + r * 0.15), (cx + r * 0.85, cy + r * 0.35)], fill=(240, 170, 40))


def bucket(d, cx, cy, s):
    """紅白條紋的炸物紙桶＋炸雞"""
    d.polygon([(cx - s * .5, cy - s * .2), (cx + s * .5, cy - s * .2), (cx + s * .38, cy + s * .6), (cx - s * .38, cy + s * .6)], fill=(250, 246, 236))
    for k in range(5):
        x = cx - s * .45 + k * s * .22; d.polygon([(x, cy - s * .2), (x + s * .1, cy - s * .2), (x + s * .08, cy + s * .6), (x - s * .01, cy + s * .6)], fill=(206, 50, 40))
    for k in range(9):
        a = k / 9 * math.pi; d.ellipse([cx + math.cos(a) * s * .32 - s * .14, cy - s * .2 - math.sin(a) * s * .25 - s * .12, cx + math.cos(a) * s * .32 + s * .14, cy - s * .2 - math.sin(a) * s * .25 + s * .12], fill=(214, 144, 56), outline=(170, 100, 30))


def prints(path):
    im = Image.new('RGB', (S, S), (238, 230, 210)); d = ImageDraw.Draw(im); rng = random.Random(650)
    # 大招牌：紅底白字「洋洋鹹酥雞」＋右邊小雞 1400 × 300
    b = _cell('sign', 0, 0, 1400, 300); d.rectangle(b, fill=CREAM); d.rectangle([10, 10, 1390, 290], outline=RED, width=8)
    d.rectangle([380, 40, 1160, 260], fill=RED)
    ctext(d, (380, 40, 1160, 260), '洋洋鹹酥雞', 140, (252, 246, 232), -10)
    chicken(d, 1270, 170, 80)
    for i, t in enumerate(('炸物小吃', '台式滷味', '宵夜・點心')): d.text((40, 40 + i * 80), t, font=font(62), fill=(50, 40, 30))
    # 菜單板（四欄）1400 × 420
    x0, y0 = 0, 320; b = _cell('menu', x0, y0, 1400, 420); d.rectangle(b, fill=(250, 244, 230)); d.rectangle([x0 + 6, y0 + 6, x0 + 1394, y0 + 414], outline=(190, 160, 120), width=4)
    bucket(d, x0 + 130, y0 + 230, 170)
    cols = [('本店推薦', [('鹹酥雞', 70), ('三角骨', 65), ('魷魚', 80), ('雞皮', 55), ('甜不辣', 45)]), ('炸物', [('雞排', 85), ('雞軟骨', 60), ('花枝丸', 50), ('薯條', 45), ('地瓜', 45)]),
            ('滷味', [('豆干', 25), ('米血', 25), ('百頁豆腐', 25), ('海帶', 20), ('滷蛋', 15)]), ('蔬菜小點', [('四季豆', 35), ('杏鮑菇', 45), ('花椰菜', 40), ('玉米筍', 40), ('高麗菜', 35)])]
    for c, (title, items) in enumerate(cols):
        cx = x0 + 270 + c * 285; d.rounded_rectangle([cx, y0 + 24, cx + 250, y0 + 80], radius=12, fill=RED); ctext(d, (cx, y0 + 24, cx + 250, y0 + 80), title, 40, (255, 255, 255), -4)
        for i, (n, p) in enumerate(items):
            y = y0 + 100 + i * 60; d.text((cx + 10, y), n, font=font(40), fill=(40, 32, 24)); d.text((cx + 196, y), str(p), font=font(40), fill=(40, 32, 24))
        if c: d.line([(cx - 16, y0 + 30), (cx - 16, y0 + 390)], fill=(210, 190, 160), width=3)
    d.text((x0 + 270, y0 + 392), '可以加九層塔・蒜・辣', font=font(22), fill=(120, 80, 50))
    # 點餐結帳牌 220 × 420
    x0, y0 = 1420, 0; b = _cell('order', x0, y0, 220, 420); d.rectangle(b, fill=(250, 244, 230)); d.rectangle([x0 + 6, y0 + 6, x0 + 214, y0 + 414], outline=RED, width=6)
    for i, ch in enumerate('點餐'): d.text((x0 + 30, y0 + 30 + i * 0), ch, font=font(1), fill=(0, 0, 0))
    d.text((x0 + 26, y0 + 40), '點餐', font=font(80), fill=RED); d.text((x0 + 26, y0 + 150), '結帳', font=font(80), fill=RED)
    d.line([(x0 + 40, y0 + 330), (x0 + 170, y0 + 330)], fill=RED, width=12); d.polygon([(x0 + 170, y0 + 300), (x0 + 205, y0 + 330), (x0 + 170, y0 + 360)], fill=RED)
    # 海報：洋洋鹹酥雞（炸物桶）360 × 560
    x0, y0 = 1660, 0; b = _cell('poster1', x0, y0, 360, 560); d.rectangle(b, fill=(252, 240, 214)); d.rectangle([x0 + 8, y0 + 8, x0 + 352, y0 + 552], outline=(200, 150, 90), width=5)
    for i, ch in enumerate('洋洋鹹酥雞'): d.text((x0 + 40 + i * 58, y0 + 30), ch, font=font(56), fill=RED)
    bucket(d, x0 + 180, y0 + 320, 260)
    # 海報：公館宵夜 學生最愛（夜景）360 × 520
    x0, y0 = 1660, 580; b = _cell('poster2', x0, y0, 360, 520)
    for y in range(520): d.line([(x0, y0 + y), (x0 + 360, y0 + y)], fill=(int(30 + 120 * y / 520), int(40 + 60 * y / 520), int(90 - 20 * y / 520)))
    d.text((x0 + 40, y0 + 40), '公館宵夜', font=font(60), fill=(250, 240, 210)); d.text((x0 + 60, y0 + 120), '學生最愛！', font=font(54), fill=(250, 220, 140))
    for k in range(9):   # 遠處的樓
        bx = x0 + k * 40; bh = rng.randint(60, 160); d.rectangle([bx, y0 + 520 - bh, bx + 34, y0 + 520], fill=(30, 26, 40))
        for j in range(4): d.rectangle([bx + 8, y0 + 530 - bh + j * 30, bx + 14, y0 + 540 - bh + j * 30], fill=(250, 210, 120))
    d.ellipse([x0 + 280, y0 + 210, x0 + 320, y0 + 250], fill=(250, 236, 180))
    # 海報：鹹酥雞最對味！ 360 × 520
    x0, y0 = 1660, 1120; b = _cell('poster3', x0, y0, 360, 520); d.rectangle(b, fill=(252, 244, 226)); d.rectangle([x0 + 8, y0 + 8, x0 + 352, y0 + 512], outline=(120, 80, 50), width=6)
    for i, ch in enumerate('鹹酥雞'): d.text((x0 + 230, y0 + 30 + i * 84), ch, font=font(80), fill=RED)
    for i, ch in enumerate('最對味！'): d.text((x0 + 140, y0 + 60 + i * 72), ch, font=font(66), fill=RED)
    for k in range(10): cx, cy = x0 + 70 + (k % 3) * 40, y0 + 330 + (k // 3) * 40; d.ellipse([cx - 32, cy - 26, cx + 32, cy + 26], fill=(214, 144, 56), outline=(170, 100, 30), width=3)
    # 自助區牌 520 × 420
    x0, y0 = 0, 760; b = _cell('self', x0, y0, 520, 420); d.rectangle(b, fill=(250, 246, 236)); d.rectangle([x0 + 6, y0 + 6, x0 + 514, y0 + 414], outline=RED, width=6)
    d.rectangle([x0 + 6, y0 + 6, x0 + 514, y0 + 90], fill=RED); ctext(d, (x0, y0 + 6, x0 + 520, y0 + 90), '自助區', 64, (255, 255, 255), -6)
    for i, (t, s2) in enumerate((('餐具', '（筷子・湯匙）'), ('醬料', '（辣椒・蒜泥・胡椒粉）'), ('飲用水', '（請自取）'), ('垃圾分類', '（請依標示放置）'))):
        y = y0 + 110 + i * 75; d.rectangle([x0 + 30, y + 8, x0 + 70, y + 48], outline=(60, 60, 56), width=4); d.line([(x0 + 36, y + 28), (x0 + 48, y + 42), (x0 + 68, y + 10)], fill=RED, width=6)
        d.text((x0 + 90, y + 4), t, font=font(44), fill=(40, 36, 30)); d.text((x0 + 90 + 46 * len(t), y + 14), s2, font=font(26), fill=(90, 80, 70))
    # 垃圾分類標籤 160 × 220 × 3
    for k, (t, c) in enumerate((('一般垃圾', (80, 80, 76)), ('資源回收', (60, 130, 70)), ('廚餘', (120, 86, 50)))):
        x0, y0 = 540 + k * 170, 760; b = _cell(f'bin{k}', x0, y0, 160, 220); d.rectangle(b, fill=(244, 240, 228)); d.rectangle([x0 + 10, y0 + 10, x0 + 150, y0 + 150], outline=c, width=6)
        ctext(d, (x0, y0 + 160, x0 + 160, y0 + 210), t, 32, (40, 36, 30))
        if k == 0: d.rectangle([x0 + 55, y0 + 50, x0 + 105, y0 + 125], outline=c, width=6)
        elif k == 1: d.arc([x0 + 40, y0 + 40, x0 + 120, y0 + 120], 0, 300, fill=c, width=10)
        else: d.ellipse([x0 + 50, y0 + 45, x0 + 110, y0 + 125], outline=c, width=7)
    # 飲用水（自取）160 × 110、冷飲 300 × 90
    x0, y0 = 1060, 760; b = _cell('water', x0, y0, 160, 110); d.rectangle(b, fill=(250, 246, 236)); d.rectangle([x0 + 4, y0 + 4, x0 + 156, y0 + 106], outline=(60, 60, 56), width=3)
    ctext(d, (x0, y0 + 6, x0 + 160, y0 + 60), '飲用水', 38, (40, 36, 30)); ctext(d, (x0, y0 + 56, x0 + 160, y0 + 104), '（自取）', 26, (90, 80, 70))
    x0, y0 = 1060, 880; b = _cell('cold', x0, y0, 300, 90); d.rectangle(b, fill=(250, 250, 246)); ctext(d, b, '冷　飲', 56, RED, -4)
    # 炸物櫃的小價目牌 140 × 60 × 8
    for k, t in enumerate(('鹹酥雞', '甜不辣', '豆干', '米血', '杏鮑菇', '四季豆', '雞排', '花枝丸')):
        x0, y0 = (k % 4) * 150, 1200 + (k // 4) * 70; b = _cell(f'tag{k}', x0, y0, 140, 60); d.rectangle(b, fill=(250, 244, 228)); d.rectangle([x0 + 3, y0 + 3, x0 + 137, y0 + 57], outline=RED, width=3)
        ctext(d, b, t, 32, (40, 30, 24), -2)
    # 紅色門簾（小雞） 300 × 420
    x0, y0 = 620, 1200; b = _cell('noren', x0, y0, 300, 420); d.rectangle(b, fill=(150, 36, 32))
    for k in range(1, 3): d.line([(x0 + k * 100, y0 + 120), (x0 + k * 100, y0 + 420)], fill=(110, 24, 22), width=6)
    chicken(d, x0 + 150, y0 + 170, 56, col=(246, 230, 210), line=(246, 230, 210))
    # 相框（月亮夜景）200 × 260
    x0, y0 = 940, 1200; b = _cell('frame', x0, y0, 200, 260); d.rectangle(b, fill=(60, 44, 30))
    for y in range(230): d.line([(x0 + 15, y0 + 15 + y), (x0 + 185, y0 + 15 + y)], fill=(int(20 + 60 * y / 230), int(30 + 50 * y / 230), int(80 + 30 * y / 230)))
    d.chord([x0 + 120, y0 + 40, x0 + 160, y0 + 80], 60, 300, fill=(250, 230, 160)); d.rectangle([x0 + 40, y0 + 160, x0 + 160, y0 + 245], fill=(30, 26, 40))
    # 點餐單（夾在籃子上）、外帶紙袋、面紙盒、收銀機畫面用 screen
    x0, y0 = 1160, 1200; b = _cell('slip', x0, y0, 160, 220); d.rectangle(b, fill=(252, 252, 248))
    d.text((x0 + 12, y0 + 10), '點餐單', font=font(30), fill=RED)
    for i in range(7): d.line([(x0 + 12, y0 + 60 + i * 22), (x0 + 148, y0 + 60 + i * 22)], fill=(190, 190, 186), width=2); d.text((x0 + 16, y0 + 44 + i * 22), rng.choice(['鹹酥雞', '甜不辣', '米血', '四季豆', '豆干', '杏鮑菇']), font=font(16), fill=(40, 40, 120))
    x0, y0 = 1340, 1200; b = _cell('bag', x0, y0, 200, 240); d.rectangle(b, fill=(214, 178, 130)); chicken(d, x0 + 100, y0 + 130, 40); d.text((x0 + 30, y0 + 190), '洋洋鹹酥雞', font=font(28), fill=RED)
    x0, y0 = 0, 1360; b = _cell('tissue', x0, y0, 200, 120); d.rectangle(b, fill=(246, 200, 196))
    for k in range(6): d.ellipse([x0 + 10 + k * 32, y0 + 30, x0 + 36 + k * 32, y0 + 56], fill=(250, 236, 232))
    d.rectangle([x0 + 70, y0 + 0, x0 + 130, y0 + 18], fill=(250, 250, 250))
    # 紙箱 256 × 160
    x0, y0 = 220, 1360; b = _cell('carton', x0, y0, 256, 160); d.rectangle(b, fill=(196, 160, 110)); d.rectangle([x0, y0 + 60, x0 + 256, y0 + 74], fill=(220, 200, 160)); d.text((x0 + 20, y0 + 90), '食用油 18L', font=font(30), fill=(80, 50, 30))
    # 白磁磚（腰牆）256 × 256＝0.6 m，15 cm 一塊
    x0, y0 = 0, 1540; b = _cell('tile', x0, y0, 256, 256); d.rectangle(b, fill=(238, 236, 228))
    for k in range(5): d.line([(x0, y0 + k * 64), (x0 + 256, y0 + k * 64)], fill=(190, 186, 176), width=3); d.line([(x0 + k * 64, y0), (x0 + k * 64, y0 + 256)], fill=(190, 186, 176), width=3)
    im.save(path); return path


SC = {}


def screen(path):
    """冷飲櫃裡面（發光）＋收銀機螢幕"""
    im = Image.new('RGB', (1024, 1024), (200, 210, 216)); d = ImageDraw.Draw(im); rng = random.Random(77)
    SC['fridge'] = (0.0, 0.0, 0.75, 1.0)
    for i in range(5):
        y1 = 40 + i * 196 + 170; d.rectangle([0, y1, 768, y1 + 14], fill=(170, 176, 180)); d.rectangle([0, y1 + 14, 768, y1 + 20], fill=(250, 220, 90))
        x = 6
        while x < 760: x += _item(d, rng.choice(['drink', 'drink', 'can']), x, y1 - 160, 160, rng) + 5
    d.rectangle([0, 0, 768, 30], fill=(250, 252, 255))
    SC['pos'] = (0.76, 0.8, 1.0, 1.0); d.rectangle([778, 0, 1024, 205], fill=(220, 236, 230)); d.rectangle([778, 0, 1024, 36], fill=RED); d.text((790, 4), '洋洋鹹酥雞', font=font(24), fill=(255, 255, 255))
    for k in range(4): d.rectangle([790, 50 + k * 34, 960, 74 + k * 34], fill=(200, 210, 206))
    SC['warm'] = (0.76, 0.5, 1.0, 0.75); d.rectangle([778, 256, 1024, 512], fill=(255, 214, 150))
    SC['tube'] = (0.76, 0.25, 1.0, 0.45); d.rectangle([778, 563, 1024, 768], fill=(170, 160, 140))   # 日光燈管（調暗、偏暖）
    im.save(path); return path


def build_all(outdir):
    os.makedirs(outdir, exist_ok=True); p = lambda n: os.path.join(outdir, n)
    return dict(floor=floor(p('yy_floor.png'), p('yy_floor_rough.png')), ceil=ceiling(p('yy_ceil.png')), wall=wall(p('yy_wall.png')), wood=wood(p('yy_wood.png')),
                steel=steel(p('yy_steel.png')), prints=prints(p('yy_print.png')), screen=screen(p('yy_screen.png')))


if __name__ == '__main__':
    import sys
    print(build_all(sys.argv[1])); print(CELLS)
