"""林家乾麵室內的貼圖（PIL＋numpy，執行 lin_interior.py 時自動產生）。BB（帳號 A）2026-11-04。
照參考圖 docs/story_planning/ref_images/shops/wz_lin_int.webp 取色：淺色磨石子地（米灰底、深淺小石子）、發黃的方格天花板、米白舊漆牆、
中淺色木桌椅（不是深色木頭）、刷紋不鏽鋼（共用 shaola_tex.steel）、一張印刷圖集（招牌、紅紙菜單、福、月曆、時鐘、相框、自助調味區、
收銀台小招牌、白磁磚、玻璃磚窗、紅色塑膠凳的紋路…）、螢幕（收銀機）。菜單照室內圖（AA_654 第 4 節）；沒有真實品牌（D77）。"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw
from shaola_tex import _noise, _save, font, steel
from cvs_tex import ctext

RED = (176, 40, 34); PAPER = (200, 48, 40); CREAM = (244, 232, 206)


def floor(path, rough_path):
    """1024＝2 m：淺色磨石子（米灰底＋深灰、棕、白的小石子），沒有磚縫；每 1 m 一條很淡的銅條"""
    W = H = 1024; rng = np.random.RandomState(701)
    n1 = _noise(H, W, 220, 702); n2 = _noise(H, W, 6, 703, 2)
    col = np.array([206, 198, 186], np.float32)[None, None] * (0.94 + 0.07 * n1[..., None] + 0.03 * (n2[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    im = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for _ in range(26000):
        x, y = rng.randint(0, W), rng.randint(0, H); r = [1, 1, 2, 2, 3, 4][rng.randint(6)]
        c = [(110, 104, 98), (140, 120, 100), (90, 86, 84), (236, 232, 224), (170, 150, 130), (120, 90, 70)][rng.randint(6)]
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    for k in (0, 512): d.line([(0, k), (W, k)], fill=(176, 160, 130), width=2); d.line([(k, 0), (k, H)], fill=(176, 160, 130), width=2)
    im.save(path)
    _save(np.repeat((np.clip(0.3 + 0.12 * n1, 0.1, 0.9) * 255)[..., None], 3, 2), rough_path)
    return path


def ceiling(path):
    W = H = 1024; t = 256; n = _noise(H, W, 120, 711); n2 = _noise(H, W, 6, 712, 2)
    col = np.array([232, 222, 200], np.float32)[None, None] * (0.94 + 0.06 * n[..., None] + 0.04 * (n2[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    for i in range(0, H, t): col[max(0, i - 4):i + 4] = [206, 196, 176]
    for j in range(0, W, t): col[:, max(0, j - 4):j + 4] = [206, 196, 176]
    return _save(col, path)


def wall(path):
    """米白舊漆（1024＝2 m 寬、3 m 高）：色差、補漆、局部發黃、膠帶痕"""
    W, H = 1024, 1024; rng = np.random.RandomState(721)
    n1 = _noise(H, W, 160, 721); n2 = _noise(H, W, 10, 722, 3); n3 = _noise(H, W, 50, 723, 3)
    yy = np.linspace(0, 1, H)[:, None]
    col = np.array([238, 228, 206], np.float32)[None, None] * (0.93 + 0.07 * n1[..., None] + 0.04 * (n2[..., None] - 0.5))
    yel = np.clip((n3 - 0.55) * 3, 0, 1) * (0.4 + 0.6 * np.clip(1 - yy * 1.5, 0, 1))   # 上半發黃（油煙）
    col = col * (1 - 0.12 * yel[..., None]) + np.array([200, 176, 120]) * 0.12 * yel[..., None]
    im = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    for _ in range(12):
        x, y = rng.randint(0, W - 60), rng.randint(100, 900); d.rectangle([x, y, x + rng.randint(16, 36), y + 6], fill=(222, 210, 180))
    im.save(path); return path


def wood(path):
    """中淺色木頭（桌面、椅子、收銀台）：#c8945c 左右，有木紋；不是深色木地板（D112 只管地板，這裡也不用深色）"""
    W = H = 512; rng = np.random.RandomState(731)
    rows = rng.normal(0, 1, (H, 1)).astype(np.float32); rows = (rows - rows.min()) / (np.ptp(rows) + 1e-6)
    rows = np.asarray(Image.fromarray((rows * 255).astype(np.uint8)).resize((1, H), Image.BILINEAR), np.float32) / 255
    g = 0.65 * rows + 0.35 * _noise(H, W, 3, 732, 2); kn = _noise(H, W, 40, 733, 2)
    col = np.array([200, 148, 92], np.float32)[None, None] * (0.8 + 0.3 * g[..., None] - 0.1 * np.clip((kn[..., None] - 0.7) * 5, 0, 1))
    return _save(col, path)


S = 2048
CELLS = {}


def _cell(name, x, y, w, h):
    CELLS[name] = (x / S, 1 - (y + h) / S, (x + w) / S, 1 - y / S); return (x, y, x + w, y + h)


def frame_sign(d, b, text, sz, bg=CREAM, fg=RED, corner=True):
    x0, y0, x1, y1 = b; d.rectangle(b, fill=bg); d.rectangle([x0 + 10, y0 + 10, x1 - 10, y1 - 10], outline=fg, width=6)
    if corner:
        for (cx, cy, sx, sy) in ((x0 + 10, y0 + 10, 1, 1), (x1 - 10, y0 + 10, -1, 1), (x0 + 10, y1 - 10, 1, -1), (x1 - 10, y1 - 10, -1, -1)):   # 回紋角
            d.line([(cx + sx * 20, cy), (cx + sx * 20, cy + sy * 20), (cx, cy + sy * 20)], fill=fg, width=5)
    ctext(d, b, text, sz, fg, -sz // 10)


def prints(path, menu_items):
    im = Image.new('RGB', (S, S), (236, 228, 210)); d = ImageDraw.Draw(im); rng = random.Random(654)
    frame_sign(d, _cell('sign', 0, 0, 1200, 300), '林家乾麵', 170)                                       # 抽油煙機上的招牌
    frame_sign(d, _cell('cashsign', 0, 320, 900, 420), '林家乾麵', 170)                                    # 收銀台正面（有燈）
    # 紅紙菜單：一張一條（直書），每張 120 × 560
    for k, it in enumerate(menu_items):
        name, price = it.rsplit(' ', 1); x0, y0 = 920 + (k % 9) * 124, 380
        b = _cell(f'menu{k}', x0, y0, 120, 560); a = np.random.RandomState(k)
        d.rectangle(b, fill=(PAPER[0] + a.randint(-12, 12), PAPER[1] + a.randint(-6, 6), PAPER[2] + a.randint(-6, 6)))
        n = len(name); sz = 76 if n <= 3 else (64 if n == 4 else 56)
        for i, ch in enumerate(name): d.text((x0 + (120 - sz) // 2, y0 + 30 + i * (sz + 6)), ch, font=font(sz), fill=(250, 240, 220))
        ctext(d, (x0, y0 + 470, x0 + 120, y0 + 550), price, 54, (250, 240, 220))
    # 福（紅色菱形）260 × 260
    x0, y0 = 1220, 0; b = _cell('fu', x0, y0, 260, 260); d.rectangle(b, fill=(236, 228, 210)); d.polygon([(x0 + 130, y0 + 4), (x0 + 256, y0 + 130), (x0 + 130, y0 + 256), (x0 + 4, y0 + 130)], fill=(196, 40, 34))
    ctext(d, b, '福', 130, (250, 214, 110), -12)
    # 月曆（城市風景＋日期）260 × 360
    x0, y0 = 1500, 0; b = _cell('calendar', x0, y0, 260, 360); d.rectangle(b, fill=(250, 250, 246))
    for y in range(160): d.line([(x0 + 10, y0 + 10 + y), (x0 + 250, y0 + 10 + y)], fill=(int(150 + 60 * y / 160), int(190 + 30 * y / 160), 230))
    for k in range(8): bh = rng.randint(30, 100); d.rectangle([x0 + 20 + k * 28, y0 + 170 - bh, x0 + 40 + k * 28, y0 + 170], fill=(90, 110, 130))
    d.text((x0 + 90, y0 + 175), '11', font=font(40), fill=(40, 40, 40))
    for r in range(4):
        for c in range(7): d.text((x0 + 16 + c * 33, y0 + 230 + r * 30), str((r * 7 + c) % 30 + 1), font=font(20), fill=(200, 40, 40) if c == 0 else (50, 50, 50))
    # 時鐘面 256 × 256
    x0, y0 = 1780, 0; b = _cell('clock', x0, y0, 256, 256); d.rectangle(b, fill=(236, 228, 210)); d.ellipse([x0 + 8, y0 + 8, x0 + 248, y0 + 248], fill=(250, 248, 240), outline=(90, 60, 40), width=14)
    for k in range(12):
        a = k * math.pi / 6; d.text((x0 + 128 + 92 * math.sin(a) - 10, y0 + 128 - 92 * math.cos(a) - 14), str(12 if k == 0 else k), font=font(24), fill=(30, 30, 30))
    d.line([(x0 + 128, y0 + 128), (x0 + 128 + 50, y0 + 128 - 30)], fill=(20, 20, 20), width=6); d.line([(x0 + 128, y0 + 128), (x0 + 128 - 10, y0 + 128 - 80)], fill=(20, 20, 20), width=4)
    # 相框（城市黑白照）260 × 320
    x0, y0 = 1580, 1050; b = _cell('photo', x0, y0, 260, 320); d.rectangle(b, fill=(110, 80, 50)); d.rectangle([x0 + 24, y0 + 24, x0 + 236, y0 + 296], fill=(232, 226, 212))
    for y in range(200): d.line([(x0 + 40, y0 + 40 + y), (x0 + 220, y0 + 40 + y)], fill=(int(190 - 40 * y / 200),) * 3)
    for k in range(9): bh = rng.randint(30, 120); d.rectangle([x0 + 44 + k * 19, y0 + 240 - bh, x0 + 58 + k * 19, y0 + 240], fill=(80, 80, 80))
    # 自助調味區 520 × 160
    x0, y0 = 0, 760; b = _cell('selfsauce', x0, y0, 520, 160); d.rectangle(b, fill=(250, 246, 236)); d.rectangle([x0 + 6, y0 + 6, x0 + 514, y0 + 154], outline=RED, width=5)
    ctext(d, b, '自助調味區', 72, RED, -6)
    # 白磁磚 256 × 256（4 × 4，15 cm）
    x0, y0 = 540, 760; b = _cell('tile', x0, y0, 256, 256); d.rectangle(b, fill=(240, 238, 230))
    for k in range(5): d.line([(x0, y0 + k * 64), (x0 + 256, y0 + k * 64)], fill=(196, 192, 182), width=3); d.line([(x0 + k * 64, y0), (x0 + k * 64, y0 + 256)], fill=(196, 192, 182), width=3)
    # 玻璃磚窗（後牆）512 × 320：一格一格的綠白玻璃磚、鐵窗
    x0, y0 = 820, 900; b = _cell('glassblock', x0, y0, 512, 320); d.rectangle(b, fill=(120, 130, 120))
    for r in range(5):
        for c in range(8):
            gx, gy = x0 + 6 + c * 63, y0 + 6 + r * 62; v = rng.randint(-14, 14)
            d.rectangle([gx, gy, gx + 57, gy + 56], fill=(176 + v, 206 + v, 182 + v)); d.ellipse([gx + 14, gy + 14, gx + 43, gy + 42], fill=(200 + v, 226 + v, 204 + v))
    for k in range(1, 8): d.line([(x0 + k * 64, y0), (x0 + k * 64, y0 + 320)], fill=(60, 64, 60), width=4)
    # 名片、點菜單、叫人鈴面板 200 × 140
    x0, y0 = 1360, 900; b = _cell('card', x0, y0, 200, 140); d.rectangle(b, fill=(250, 250, 246)); d.text((x0 + 16, y0 + 16), '林家乾麵', font=font(34), fill=RED); d.text((x0 + 16, y0 + 70), '外帶請先點', font=font(24), fill=(60, 60, 60))
    # 面紙盒 200 × 120
    x0, y0 = 1580, 900; b = _cell('tissue', x0, y0, 200, 120); d.rectangle(b, fill=(250, 250, 248))
    for k in range(5): d.ellipse([x0 + 14 + k * 36, y0 + 40, x0 + 42 + k * 36, y0 + 68], fill=(150, 196, 220))
    # 紙箱 256 × 160
    x0, y0 = 0, 940; b = _cell('carton', x0, y0, 256, 160); d.rectangle(b, fill=(196, 160, 110)); d.rectangle([x0, y0 + 60, x0 + 256, y0 + 74], fill=(220, 200, 160)); d.text((x0 + 20, y0 + 90), '麵條 20斤', font=font(30), fill=(80, 50, 30))
    # 價錢小卡（收銀台）200 × 120
    x0, y0 = 280, 940; b = _cell('price', x0, y0, 200, 120); d.rectangle(b, fill=(252, 244, 220)); d.text((x0 + 16, y0 + 14), '內用・外帶', font=font(30), fill=(60, 60, 60)); d.text((x0 + 16, y0 + 60), '現金・悠遊卡', font=font(26), fill=(60, 60, 60))
    im.save(path); return path


SC = {}


def screen(path):
    im = Image.new('RGB', (512, 512), (20, 24, 28)); d = ImageDraw.Draw(im)
    SC['pos'] = (0.0, 0.5, 0.5, 1.0); d.rectangle([0, 0, 256, 256], fill=(30, 40, 54)); d.rectangle([0, 0, 256, 40], fill=RED); d.text((10, 6), '林家乾麵', font=font(26), fill=(255, 255, 255))
    for k in range(5): d.rectangle([12, 56 + k * 36, 200, 84 + k * 36], fill=(70, 90, 110))
    SC['tube'] = (0.5, 0.5, 1.0, 1.0); d.rectangle([256, 0, 512, 256], fill=(232, 226, 210))
    SC['warm'] = (0.0, 0.0, 0.5, 0.5); d.rectangle([0, 256, 256, 512], fill=(255, 210, 140))
    im.save(path); return path


def build_all(outdir, menu_items):
    os.makedirs(outdir, exist_ok=True); p = lambda n: os.path.join(outdir, n)
    return dict(floor=floor(p('lin_floor.png'), p('lin_floor_rough.png')), ceil=ceiling(p('lin_ceil.png')), wall=wall(p('lin_wall.png')), wood=wood(p('lin_wood.png')),
                steel=steel(p('lin_steel.png')), prints=prints(p('lin_print.png'), menu_items), screen=screen(p('lin_screen.png')))
