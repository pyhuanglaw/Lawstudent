"""溫州街三家新店室內的貼圖（ART-WZ3，LAWWW2-B 2026-10-16）：全部本作程式畫，文字虛構。
- tatami_weave.png：榻榻米的藺草編織（可以無縫重複；緣（heri）在模型裡用深色布條做）
- brunch_board.png：半熟出餐檯上方的黑板（今日推薦，粉筆字）
- print_price.png：阿德影印的價目表（白底藍字）
- scroll_cha.png：一盞床之間的掛軸（一個「茶」字＋裱框）
- clock_face.png：半熟牆上的大時鐘
- egg_print.png：半熟牆上的蛋線條畫（和招牌同一個意思）
用法：python3 tools/blender/env_second/shops_tex.py"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
rnd = random.Random(2026)
def f(sz): return ImageFont.truetype(FONT, sz)


def tatami():
    W, H = 512, 512; a = np.zeros((H, W, 3), np.float32)
    base = np.array([196, 182, 120], np.float32)
    for x in range(W):                                    # 一根一根的藺草（直的），每根亮度不同
        k = 0.82 + 0.3 * rnd.random(); a[:, x] = base * k
    for y in range(0, H, 16):                             # 橫向的經線（每 16 px 一條細的暗線）
        a[y:y + 2] *= 0.78
    n = np.random.default_rng(4).normal(0, 6, (H, W, 1)); a = np.clip(a + n, 0, 255)
    g = np.linspace(0, 2 * np.pi, H)[:, None]; a *= (0.96 + 0.04 * np.sin(g * 3))[..., None]   # 曬過的地方淡一點
    Image.fromarray(a.astype(np.uint8)).save(os.path.join(GEN, 'tatami_weave.png'))


def chalk(d, xy, text, sz, col=(238, 236, 228)):
    x, y = xy
    for ch in text:
        s = int(sz * rnd.uniform(0.92, 1.06)); d.text((x + rnd.uniform(-1, 1), y + rnd.uniform(-2, 2)), ch, font=f(s), fill=col)
        x += s * (1.0 if ord(ch) > 255 else 0.58)


def brunch_board():
    W, H = 1200, 400; im = Image.new('RGB', (W, H), (38, 52, 44)); d = ImageDraw.Draw(im)
    for _ in range(900):                                  # 擦過的粉筆痕
        x, y = rnd.randrange(W), rnd.randrange(H); d.line([x, y, x + rnd.randint(10, 60), y + rnd.randint(-4, 4)], fill=(58, 72, 64), width=rnd.randint(2, 6))
    d.rectangle([0, 0, W - 1, H - 1], outline=(120, 86, 52), width=18)
    chalk(d, (60, 40), '今日推薦', 60, (250, 230, 150))
    items = [('半熟蛋吐司', '180'), ('班尼迪克蛋', '260'), ('鬆餅（蜂蜜奶油）', '220'), ('蔬菜蛋捲', '200'), ('熱拿鐵／冰拿鐵', '120')]
    for i, (n, p) in enumerate(items):
        chalk(d, (80, 130 + i * 52), n, 40); chalk(d, (760, 130 + i * 52), p, 40)
    cx, cy = 1010, 120                                    # 黑板角落一顆蛋（粉筆畫）
    d.ellipse([cx - 90, cy - 60, cx + 90, cy + 60], outline=(240, 238, 230), width=5); d.ellipse([cx - 32, cy - 30, cx + 32, cy + 30], fill=(244, 200, 80))
    chalk(d, (900, 230), '三分四十秒', 34, (250, 230, 150))
    im.filter(ImageFilter.GaussianBlur(0.6)).save(os.path.join(GEN, 'brunch_board.png'))


def print_price():
    W, H = 700, 360; im = Image.new('RGB', (W, H), (248, 248, 244)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 64], fill=(31, 78, 140)); d.text((24, 10), '價　目　表', font=f(42), fill=(255, 255, 255))
    rows = [('黑白影印 A4', '1 元'), ('彩色影印 A4', '5 元'), ('雙面・縮印', '另計'), ('膠裝（含封面）', '50 元起'), ('騎馬釘', '20 元'), ('大圖輸出 A1', '250 元'), ('護貝 A4', '15 元')]
    for i, (n, p) in enumerate(rows):
        y = 80 + i * 39; d.text((30, y), n, font=f(28), fill=(30, 40, 60)); d.text((520, y), p, font=f(28), fill=(31, 78, 140))
        d.line([30, y + 36, W - 30, y + 36], fill=(220, 224, 230), width=1)
    d.rectangle([0, 0, W - 1, H - 1], outline=(31, 78, 140), width=4)
    im.save(os.path.join(GEN, 'print_price.png'))


def scroll():
    W, H = 300, 1000; im = Image.new('RGB', (W, H), (128, 108, 78)); d = ImageDraw.Draw(im)
    d.rectangle([22, 120, W - 22, H - 150], fill=(236, 228, 208))                            # 本紙
    d.rectangle([0, 0, W, 40], fill=(70, 52, 36)); d.rectangle([0, H - 60, W, H], fill=(70, 52, 36))   # 上下的軸
    for _ in range(3000):
        x, y = rnd.randrange(22, W - 22), rnd.randrange(120, H - 150); v = rnd.randint(-10, 6); c = im.getpixel((x, y)); d.point((x, y), fill=tuple(max(0, min(255, cc + v)) for cc in c))
    t = Image.new('L', (W, H), 0); dt = ImageDraw.Draw(t); dt.text((W / 2 - 110, 300), '茶', font=f(220), fill=255)
    t = t.filter(ImageFilter.GaussianBlur(1.2)); ink = Image.new('RGB', (W, H), (26, 22, 20)); im.paste(ink, (0, 0), t)
    d.rectangle([W - 70, 640, W - 40, 670], fill=(178, 40, 30))                               # 落款的紅印
    im.save(os.path.join(GEN, 'scroll_cha.png'))


def clock_face():
    S = 512; im = Image.new('RGB', (S, S), (244, 240, 230)); d = ImageDraw.Draw(im); c = S / 2
    d.ellipse([4, 4, S - 4, S - 4], outline=(40, 36, 32), width=14)
    for k in range(60):
        a = k / 60 * 2 * math.pi; r0 = c - 30 if k % 5 else c - 52; r1 = c - 20
        d.line([c + math.sin(a) * r0, c - math.cos(a) * r0, c + math.sin(a) * r1, c - math.cos(a) * r1], fill=(40, 36, 32), width=6 if k % 5 == 0 else 2)
    for k in range(1, 13):
        a = k / 12 * 2 * math.pi; r = c - 92; s = str(k); d.text((c + math.sin(a) * r - 14 * len(s), c - math.cos(a) * r - 26), s, font=f(48), fill=(40, 36, 32))
    d.ellipse([c - 70, c + 40, c + 70, c + 120], outline=(200, 160, 60), width=5); d.ellipse([c - 22, c + 58, c + 22, c + 102], fill=(240, 196, 70))   # 錶面下方一顆小蛋
    im.save(os.path.join(GEN, 'clock_face.png'))


def egg_print():
    W, H = 600, 800; im = Image.new('RGB', (W, H), (245, 241, 232)); d = ImageDraw.Draw(im)
    d.rectangle([40, 40, W - 40, H - 40], outline=(60, 52, 44), width=3)
    d.ellipse([140, 220, 460, 520], outline=(60, 52, 44), width=8); d.ellipse([230, 300, 370, 440], fill=(240, 190, 60))
    d.text((210, 600), '半　熟', font=f(64), fill=(60, 52, 44))
    im.save(os.path.join(GEN, 'egg_print.png'))


def cafe_roster():
    """兩點半 Café 吧檯後面牆上的班表（BB_141 Z5-L8「我的名字還會在店裡的班表上嗎？」）：夾板上的一張紙，一週七天、早晚兩班，鉛筆寫的名字。
    名字只寫店裡的人（芷若、老闆、虛構的工讀生），不寫其他角色。"""
    W, H = 600, 800; im = Image.new('RGB', (W, H), (176, 140, 96)); d = ImageDraw.Draw(im)
    d.rectangle([30, 70, W - 30, H - 30], fill=(246, 243, 233))
    d.rectangle([W / 2 - 90, 30, W / 2 + 90, 95], fill=(150, 150, 152)); d.rectangle([W / 2 - 60, 40, W / 2 + 60, 85], fill=(196, 196, 198))   # 夾子
    d.text((60, 110), '班表', font=f(40), fill=(60, 60, 64)); d.text((300, 120), '十月　第三週', font=f(26), fill=(90, 90, 96))
    days = ['一', '二', '三', '四', '五', '六', '日']; x0, y0 = 44, 190; cw, ch = 64, 70
    for i, dname in enumerate(days): d.text((x0 + 80 + i * cw + 18, y0), dname, font=f(28), fill=(70, 70, 76))
    for r, lab in enumerate(('早', '晚')): d.text((x0 + 10, y0 + 50 + r * (ch * 3) + 70), lab, font=f(30), fill=(70, 70, 76))
    for i in range(8): d.line([x0 + 70 + i * cw, y0 + 40, x0 + 70 + i * cw, y0 + 40 + ch * 6], fill=(180, 180, 186), width=2)
    for r in range(3): d.line([x0 + 70, y0 + 40 + r * ch * 3, x0 + 70 + 7 * cw, y0 + 40 + r * ch * 3], fill=(180, 180, 186), width=2)
    names = {(0, 0): '阿文', (1, 0): '老闆', (2, 0): '阿文', (3, 0): '小婷', (4, 0): '老闆', (5, 0): '小婷', (6, 0): '老闆',
             (0, 1): '芷若', (1, 1): '小婷', (2, 1): '芷若', (3, 1): '阿文', (4, 1): '芷若', (5, 1): '芷若', (6, 1): '阿文'}
    for (i, r), n in names.items():                                       # 鉛筆字（灰、有點歪）
        x = x0 + 70 + i * cw + 8; y = y0 + 60 + r * ch * 3 + rnd.randint(20, 120)
        for k, ch_ in enumerate(n): d.text((x + rnd.uniform(-2, 2), y + k * 30 + rnd.uniform(-2, 2)), ch_, font=f(26), fill=(98, 98, 104))
    d.text((60, H - 90), '換班請先問過老闆', font=f(24), fill=(110, 110, 116))
    im.filter(ImageFilter.GaussianBlur(0.5)).save(os.path.join(GEN, 'cafe_roster.png'))


if __name__ == '__main__':
    tatami(); brunch_board(); print_price(); scroll(); clock_face(); egg_print(); cafe_roster(); print('saved shops textures')
