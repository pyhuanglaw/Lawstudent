"""公館燒臘室內 v5 的貼圖（PIL＋numpy，執行 shaola_interior.py 時自動產生）。BB（帳號 A）2026-11-03。
照參考圖 docs/story_planning/ref_images/shops/gongguan_shaola_int.webp 取色：發黃的舊灰泥牆（水漬、下緣髒）、暗沉的方格天花板、
米色小方磚地（看得出髒、走道磨亮）、刷紋不鏽鋼（凹痕、邊角變暗）、一張印刷圖集（菜單、招牌、價目卡、月曆、福、紙條、鐘面、面紙盒、窗外、布簾、砧板木紋）。
所有字都是遊戲裡的虛構店名、手寫菜單（D77）。"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def font(sz): return ImageFont.truetype(FONT, sz)


def _noise(h, w, scale, seed, oct_=4):
    """平滑雜訊（幾層放大的隨機格子相加），0～1"""
    rng = np.random.RandomState(seed); acc = np.zeros((h, w), np.float32); amp = 1.0; tot = 0.0
    for o in range(oct_):
        s = max(1, int(scale / (2 ** o)))
        g = rng.rand(h // s + 2, w // s + 2).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize(((w // s + 2) * s, (h // s + 2) * s), Image.BICUBIC)
        acc += amp * (np.asarray(im, np.float32)[:h, :w] / 255); tot += amp; amp *= 0.5
    return acc / tot


def _save(a, p):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(p); return p


# ---------------- 牆（2048 × 1536：上 512＝左牆 13 m、中 512＝右牆 13 m、下 512＝後牆 6 m（0～945）＋前牆 6 m（1024～1969）） ----------------
def wall(path):
    """v7（LAWWW2 11-04）：整面是均勻的舊油漆（只有輕微色差）；水漬、黃斑、剝落只放在局部——靠近地面、冷氣下面、牆角。
    長條分配：上 512＝左牆 13 m、中 512＝右牆 13 m、下 512＝後牆 6 m（0～945）＋前牆 6 m（1024～1969）；每公尺 157.5 px，高 3.2 m＝512 px"""
    W, H = 2048, 1536; img = np.zeros((H, W, 3), np.float32); ppm = 2048 / 13.0
    base = np.array([214, 198, 160], np.float32)   # 參考圖左牆中段（發黃的米色舊漆）
    xs = np.arange(W)[None, :].astype(np.float32)
    def gauss_x(c, w): return np.exp(-((xs - c) / w) ** 2)
    def row(hm): return (3.2 - hm) / 3.2 * 512   # 高度（m）→ 這一條的列
    for k in range(3):
        y0 = k * 512; h = 512
        n1 = _noise(h, W, 260, 11 + k); n2 = _noise(h, W, 24, 21 + k, 3); n3 = _noise(h, W, 6, 31 + k, 2)
        yy = np.linspace(0, 1, h)[:, None]   # 0＝天花板、1＝地板
        col = base[None, None] * (0.95 + 0.06 * n1[..., None] + 0.025 * (n2[..., None] - 0.5) + 0.02 * (n3[..., None] - 0.5))   # 均勻的舊漆、輕微色差
        # 局部的範圍（0～1）：牆角、冷氣下面；靠近地面另外算
        if k < 2: corners = gauss_x(0, 70) + gauss_x(W - 1, 70)
        else: corners = gauss_x(0, 60) + gauss_x(945, 60) + gauss_x(1024, 60) + gauss_x(1969, 60)
        loc = np.clip(corners, 0, 1) * (0.35 + 0.65 * np.clip(np.abs(yy - 0.45) * 2.6, 0, 1))   # 牆角：靠天花板和地面的地方多、中間少
        acs = []   # (中心 px, 半寬 px, 冷氣底的列)
        if k == 0: acs.append(((6.5 - 4.3) * ppm, 0.6 * ppm, row(2.35)))      # 左牆窗型冷氣 z 3.85～4.75
        if k == 1: acs.append(((-0.55 + 6.5) * ppm, 0.55 * ppm, row(2.45)))   # 右牆冷氣 z −1.0～−0.1
        for (cx, hw, r0) in acs:
            yrow = np.arange(h)[:, None]
            loc = np.maximum(loc, gauss_x(cx, hw) * np.clip((yrow - r0 + 10) / 20, 0, 1) * np.exp(-np.clip(yrow - r0, 0, None) / 160))
        floor_ = np.clip((yy - 0.72) / 0.12, 0, 1) * np.clip((_noise(h, W, 220, 61 + k, 2) - 0.48) * 5, 0, 1)   # 靠近地面：只有幾段
        # 下緣：0.9 m 以下灰綠的髒（拖地水、椅子撞），踢腳更暗
        grime = np.array([150, 144, 120], np.float32)
        low = np.clip((yy - 0.7) / 0.1, 0, 1) * (0.55 + 0.45 * n2)
        col = col * (1 - 0.55 * low[..., None]) + grime * 0.55 * low[..., None]
        col *= (1 - 0.25 * np.clip((yy - 0.96) / 0.02, 0, 1))[..., None]
        # 水漬（黃褐、有邊）：只在局部
        nb = _noise(h, W, 50, 91 + k, 3); nc = _noise(h, W, 12, 95 + k, 2)
        wet = np.clip(np.maximum(loc, floor_ * 0.8), 0, 1) * (0.55 + 0.45 * nb)
        m_y = (wet + 0.25 * (nc - 0.5) > 0.5).astype(np.float32)
        m_y = np.asarray(Image.fromarray((m_y * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0)), np.float32) / 255
        rim = np.clip(np.abs(np.gradient(m_y, axis=0)) + np.abs(np.gradient(m_y, axis=1)), 0, 1) * 3
        col = col * (1 - 0.35 * m_y[..., None]) + np.array([170, 132, 76]) * 0.35 * m_y[..., None]
        col *= (1 - 0.14 * np.clip(rim, 0, 1))[..., None]
        # 剝落：只在牆角、冷氣下面、靠近地面的一小部分
        np_ = _noise(h, W, 30, 99 + k, 3)
        m_p = ((np.maximum(loc, floor_ * 0.6) * (0.5 + 0.5 * np_)) > 0.62).astype(np.float32)
        m_p = np.asarray(Image.fromarray((m_p * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)), np.float32) / 255
        rp = np.clip(np.abs(np.gradient(m_p, axis=0)) + np.abs(np.gradient(m_p, axis=1)), 0, 1) * 3
        col = col * (1 - 0.3 * m_p[..., None]) + np.array([224, 216, 194]) * 0.3 * m_p[..., None]
        col *= (1 - 0.18 * np.clip(rp, 0, 1))[..., None]
        img[y0:y0 + h] = col
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im); r = random.Random(7)
    for k in range(3):   # 撕掉的海報、膠帶痕
        y0 = k * 512
        for _ in range(5):
            x = r.randint(20, W - 120); y = y0 + r.randint(110, 330); w_, h_ = r.randint(50, 130), r.randint(60, 150)
            for (tx, ty) in ((x, y), (x + w_, y), (x, y + h_), (x + w_, y + h_)):
                if r.random() < 0.7: d.rectangle([tx - 7, ty - 3, tx + 7, ty + 3], fill=(206, 190, 150))
            if r.random() < 0.25:   # 貼過東西的地方顏色淺一點（很淡）
                ov = Image.new('L', im.size, 0); ImageDraw.Draw(ov).rectangle([x + 2, y + 2, x + w_ - 2, y + h_ - 2], fill=46)
                im.paste(Image.new('RGB', im.size, (236, 226, 198)), (0, 0), ov); d = ImageDraw.Draw(im)
        for _ in range(2):   # 裂縫
            x, y = r.randint(0, W), y0 + r.randint(20, 300)
            for s in range(r.randint(6, 16)):
                nx, ny = x + r.randint(-8, 8), y + r.randint(4, 14); d.line([(x, y), (nx, ny)], fill=(150, 136, 110), width=1); x, y = nx, ny
    im = im.filter(ImageFilter.GaussianBlur(0.6)); im.save(path); return path


# ---------------- 天花板（6 × 13 m＝512 × 1110；0.6 m 一格的礦纖板、舊、有水漬，比牆暗） ----------------
def ceiling(path):
    W, H = 512, 1110; ppm = W / 6.0
    n1 = _noise(H, W, 90, 51); n2 = _noise(H, W, 8, 52, 2)
    base = np.array([178, 170, 148], np.float32)
    col = base[None, None] * (0.9 + 0.12 * n1[..., None] + 0.08 * (n2[..., None] - 0.5))
    rng = np.random.RandomState(53)
    yy, xx = np.mgrid[0:H, 0:W]
    for _ in range(16):   # 水漬圈
        cx, cy, rr = rng.randint(0, W), rng.randint(0, H), rng.randint(15, 60)
        dd = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / rr
        ring = np.exp(-((dd - 1) * 5) ** 2) * 0.5 + np.clip(1 - dd, 0, 1) * 0.35
        col = col * (1 - 0.35 * ring[..., None]) + np.array([150, 118, 72]) * 0.35 * ring[..., None]
    t = int(ppm * 0.6)
    for i in range(int(13 / 0.6) + 1):   # 每一格顏色不一樣（換過的板子比較白）
        for j in range(11):
            v = rng.uniform(0.96, 1.03) if rng.rand() > 0.06 else 1.08
            col[i * t:(i + 1) * t, j * t:(j + 1) * t] *= v
    for i in range(0, H, t): col[max(0, i - 2):i + 2] = [118, 114, 104]   # T 型鋼架
    for j in range(0, W, t): col[:, max(0, j - 2):j + 2] = [118, 114, 104]
    return _save(col, path)


# ---------------- 地板（6 × 13 m＝768 × 1664；0.2 m 米色小方磚，磨石子點、髒的縫、走道磨亮、牆邊和桌子下髒） ----------------
def floor(path, rough_path, tables, aisle):
    ppm = 128; W, H = int(6 * ppm), int(13 * ppm); t = int(0.2 * ppm)
    rng = np.random.RandomState(61)
    n1 = _noise(H, W, 150, 62); n2 = _noise(H, W, 3, 63, 2)
    base = np.array([226, 216, 196], np.float32)   # 參考圖地板 #d6ccb8（再亮一點：反光）
    col = base[None, None] * (0.94 + 0.08 * n1[..., None]) * np.ones((H, W, 1), np.float32)
    for i in range(H // t + 1):
        for j in range(W // t + 1):
            col[i * t:(i + 1) * t, j * t:(j + 1) * t] *= rng.uniform(0.95, 1.04)
    sp = rng.rand(H, W)   # 磨石子的小點（深灰、褐、白）
    col[sp > 0.985] *= 0.55; col[(sp > 0.97) & (sp <= 0.985)] *= np.array([0.86, 0.78, 0.66]); col[sp < 0.012] = col[sp < 0.012] * 0.4 + 0.6 * 245
    grout = np.zeros((H, W), bool)
    for i in range(0, H, t): grout[max(0, i - 1):i + 2] = True
    for j in range(0, W, t): grout[:, max(0, j - 1):j + 2] = True
    col[grout] = col[grout] * 0.62 + np.array([90, 80, 64]) * 0.38
    # 髒：牆邊、桌子下面、櫃台前
    xs = (np.arange(W) + 0.5) / ppm - 3.0; zs = (np.arange(H) + 0.5) / ppm - 6.5   # 影像第 0 列＝z −6.5（後牆）
    X, Z = np.meshgrid(xs, zs)
    dirt = np.clip(1 - (np.minimum.reduce([X + 3, 3 - X, Z + 6.5, 6.5 - Z]) / 0.35), 0, 1) ** 1.5
    for tz in tables: dirt = np.maximum(dirt, 0.8 * np.exp(-(((X + 2.1) / 0.55) ** 2 + ((Z - tz) / 0.7) ** 2)))
    dirt = np.maximum(dirt, 0.45 * np.clip(1 - np.abs(X - 0.95) / 0.25, 0, 1) * (Z > -4.5) * (Z < 5.4))
    dirt *= (0.6 + 0.8 * n1)
    col = col * (1 - 0.45 * dirt[..., None]) + np.array([96, 84, 64]) * 0.45 * dirt[..., None]
    # 走道磨亮（亮一點）
    pol = np.exp(-((X - (aisle[0] + aisle[1]) / 2) / 0.6) ** 2) * np.clip((Z + 6) / 2, 0, 1)
    col *= (1 + 0.06 * pol[..., None])
    _save(col, path)
    rgh = 0.42 - 0.2 * pol + 0.3 * dirt + 0.3 * grout   # 粗糙度：走道最亮、縫和髒的地方粗
    _save(np.repeat((np.clip(rgh, 0.1, 0.95) * 255)[..., None], 3, 2), rough_path)
    return path


# ---------------- 不鏽鋼（512：橫向髮絲紋、凹痕、指紋、邊緣變暗） ----------------
def steel(path):
    """v6：亮一點、髮絲紋對比高；凹痕（暗心＋亮邊）、反光的亮條（斜的、柔邊）、刮痕、手印"""
    W = H = 512; rng = np.random.RandomState(71)
    lines = rng.normal(0, 1, (H, 1)) * 11
    a = np.repeat(lines, W, 1) + rng.normal(0, 4, (H, W))
    n1 = _noise(H, W, 120, 73); n2 = _noise(H, W, 20, 74, 3)
    v = 176 + a + 30 * (n1 - 0.5) + 10 * (n2 - 0.5)
    yy, xx = np.mgrid[0:H, 0:W]
    for k in range(3):   # 反光亮條（斜、柔邊）：日光燈映在不鏽鋼上
        c0 = rng.uniform(0, W); w_ = rng.uniform(18, 50); d = (xx + 0.35 * yy - c0) % W
        v += 46 * np.exp(-((np.minimum(d, W - d)) / w_) ** 2)
    for _ in range(9):   # 凹痕：中間暗、上緣亮
        cx, cy, rr = rng.randint(0, W), rng.randint(0, H), rng.randint(6, 30)
        dx, dy = (xx - cx) / rr, (yy - cy) / rr; dd = np.sqrt(dx ** 2 + dy ** 2)
        v -= 16 * np.clip(1 - dd, 0, 1) ** 1.5; v += 10 * np.exp(-((dd - 1.0) * 4) ** 2) * (dy < 0)
    for _ in range(60):   # 刮痕
        x0, y0 = rng.randint(0, W), rng.randint(0, H); l = rng.randint(30, 220)
        v[y0:y0 + 1, x0:x0 + l] += rng.choice([-30, 34])
    v *= (0.9 + 0.12 * n1)
    col = np.stack([v, v + 3, v + 7], -1)
    return _save(col, path)


# ---------------- 印刷圖集（2048 × 2048；CELLS＝u0,v0,u1,v1，v 從下往上） ----------------
S = 2048
CELLS = {}
RED = (176, 32, 28)


def _cell(name, x, y, w, h):
    CELLS[name] = (x / S, 1 - (y + h) / S, (x + w) / S, 1 - y / S); return (x, y, x + w, y + h)


def _hand(d, xy, text, sz, fill, rng, jit=4, rot=0):
    x, y = xy
    for ch in text:
        d.text((x + rng.randint(-jit, jit), y + rng.randint(-jit, jit)), ch, font=font(sz + rng.randint(-3, 3)), fill=fill)
        x += int(sz * (0.62 if ch.isdigit() else 1.02))
    return x


def prints(path):
    im = Image.new('RGB', (S, S), (238, 232, 218)); d = ImageDraw.Draw(im); rng = random.Random(1103)
    # 1 後牆菜單板（白底紅字兩欄，照參考圖）1024 × 448
    x0, y0, x1, y1 = _cell('menu', 0, 0, 1024, 448)
    d.rectangle([x0, y0, x1, y1], fill=(240, 236, 226)); d.rectangle([x0 + 8, y0 + 8, x1 - 8, y1 - 8], outline=(178, 48, 40), width=5)
    for cx, cy in ((x1 - 46, y1 - 46), (x1 - 46, y0 + 20)):
        for k in range(3): d.line([(cx, cy + k * 10), (cx + 26 - k * 8, cy + k * 10)], fill=(178, 48, 40), width=3)
    # 菜單照 AA_853（src/data/yejian_shaola_buy.js；LAWWW 11-12）：叉燒 90、油雞 90、燒鴨 100、雙拼 110、三寶 130、例湯 20、加滷蛋 15。原本是做模型時自己排的（雞腿飯、燒肉飯、上鴨飯…價錢也不同）
    L_ = [('叉燒飯', '90'), ('油雞飯', '90'), ('燒鴨飯', '100'), ('雙拼飯', '110'), ('三寶飯', '130')]
    R_ = [('例湯', '20'), ('加滷蛋', '15')]
    for col, rows in ((0, L_), (1, R_)):
        for i, (n, p) in enumerate(rows):
            x, y = x0 + 40 + col * 510, y0 + 30 + i * 80
            _hand(d, (x, y), n, 62, RED, rng, 2); _hand(d, (x + 250, y + 4), p, 58, RED, rng, 2)
    # 2 「公館燒臘」招牌 1536 × 300（舊米白底、紅字、角落回紋、髒）
    x0, y0, x1, y1 = _cell('sign', 0, 448, 1536, 300)
    d.rectangle([x0, y0, x1, y1], fill=(226, 214, 188)); d.rectangle([x0 + 12, y0 + 12, x1 - 12, y1 - 12], outline=(150, 40, 34), width=6)
    for cx, sx, cy, sy in ((x0 + 40, 1, y0 + 40, 1), (x1 - 40, -1, y1 - 40, -1)):
        for k in range(4):
            d.line([(cx, cy + sy * k * 16), (cx + sx * (90 - k * 20), cy + sy * k * 16)], fill=(160, 40, 34), width=5)
            d.line([(cx + sx * k * 16, cy), (cx + sx * k * 16, cy + sy * (90 - k * 20))], fill=(160, 40, 34), width=5)
    for i, ch in enumerate('公館燒臘'): d.text((x0 + 230 + i * 280, y0 + 36), ch, font=font(220), fill=(164, 28, 26))
    a = np.asarray(im, np.float32); n = _noise(300, 1536, 40, 81); blk = a[y0:y1, x0:x1]
    a[y0:y1, x0:x1] = blk * (0.86 + 0.16 * n[..., None]) + np.array([60, 40, 10]) * 0.06 * (1 - n[..., None])
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # 3 價目卡（米黃底、黑字、紅色手寫價錢、底下畫一條線）512 × 200 × 2
    for k, (t, p) in enumerate((('叉燒飯', '90'), ('燒鴨飯', '100'))):
        x0, y0, x1, y1 = _cell(f'card{k}', 1536 + 0, 448 + k * 150, 512, 150)
        d.rectangle([x0, y0, x1, y1], fill=(240, 226, 196)); d.rectangle([x0, y0, x1, y1], outline=(200, 186, 150), width=3)
        _hand(d, (x0 + 22, y0 + 32), t, 80, (28, 24, 22), rng, 2); _hand(d, (x0 + 320, y0 + 26), p, 84, (192, 28, 26), rng, 3)
        d.line([(x0 + 318, y1 - 26), (x0 + 490, y1 - 34)], fill=(192, 28, 26), width=6)
    # 4 福（紅底金字、菱形放）256
    x0, y0, x1, y1 = _cell('fu', 1024, 0, 256, 256)
    d.rectangle([x0, y0, x1, y1], fill=(196, 34, 30)); d.rectangle([x0 + 10, y0 + 10, x1 - 10, y1 - 10], outline=(230, 180, 90), width=4)
    d.text((x0 + 40, y0 + 18), '福', font=font(180), fill=(240, 196, 96))
    # 5 月曆（上面一張風景、下面日期格；紅色星期日）256 × 384
    x0, y0, x1, y1 = _cell('cal', 1280, 0, 256, 384)
    d.rectangle([x0, y0, x1, y1], fill=(244, 240, 232)); d.rectangle([x0 + 10, y0 + 10, x1 - 10, y0 + 170], fill=(120, 150, 110))
    d.polygon([(x0 + 10, y0 + 170), (x0 + 90, y0 + 70), (x0 + 160, y0 + 140), (x0 + 200, y0 + 100), (x1 - 10, y0 + 170)], fill=(70, 100, 80))
    d.text((x0 + 70, y0 + 176), '11', font=font(60), fill=(40, 40, 40)); d.text((x0 + 150, y0 + 192), '月', font=font(36), fill=(40, 40, 40))
    for r_ in range(5):
        for c_ in range(7): d.text((x0 + 14 + c_ * 33, y0 + 248 + r_ * 26), str((r_ * 7 + c_) % 30 + 1), font=font(18), fill=(190, 30, 30) if c_ == 0 else (50, 50, 50))
    d.text((x0 + 14, y1 - 26), '新榮行 敬贈', font=font(18), fill=(160, 40, 30))
    # 6 手寫紙條、公告（6 張 256 × 192）
    notes = [('今日公休', '週一'), ('外帶', '加10元'), ('本店', '不收信用卡'), ('滷蛋', '一顆15'), ('徵', '外場工讀'), ('湯', '自取')]
    for k, (a_, b_) in enumerate(notes):
        x0, y0, x1, y1 = _cell(f'note{k}', 1536 + (k % 2) * 256, 0 + (k // 2) * 148, 256, 148)
        bg = [(246, 242, 228), (244, 232, 180), (236, 240, 244)][k % 3]; d.rectangle([x0, y0, x1, y1], fill=bg)
        _hand(d, (x0 + 18, y0 + 14), a_, 52, (30, 30, 34), rng, 3); _hand(d, (x0 + 30, y0 + 80), b_, 42, (190, 30, 30) if k % 2 else (30, 30, 34), rng, 3)
        d.rectangle([x0 + 100, y0, x0 + 156, y0 + 10], fill=(214, 206, 170))   # 膠帶
    # 7 相框裡的東西：營業登記（字很小）、老闆和客人的合照
    x0, y0, x1, y1 = _cell('cert', 0, 748, 256, 340)
    d.rectangle([x0, y0, x1, y1], fill=(236, 228, 206)); d.rectangle([x0 + 14, y0 + 14, x1 - 14, y1 - 14], outline=(170, 140, 80), width=3)
    d.text((x0 + 40, y0 + 34), '營利事業', font=font(40), fill=(60, 50, 40)); d.text((x0 + 40, y0 + 80), '登記證', font=font(40), fill=(60, 50, 40))
    for k in range(9): d.line([(x0 + 34, y0 + 150 + k * 18), (x1 - 34, y0 + 150 + k * 18)], fill=(150, 140, 120), width=2)
    d.ellipse([x1 - 110, y1 - 110, x1 - 40, y1 - 40], outline=(190, 40, 30), width=4)
    x0, y0, x1, y1 = _cell('photo', 256, 748, 256, 340)
    d.rectangle([x0, y0, x1, y1], fill=(150, 130, 100))
    for k, (cx, c_) in enumerate(((80, (60, 50, 50)), (170, (90, 70, 60)))):
        d.ellipse([x0 + cx - 26, y0 + 90, x0 + cx + 26, y0 + 150], fill=(220, 180, 150)); d.rectangle([x0 + cx - 44, y0 + 150, x0 + cx + 44, y1 - 20], fill=c_)
    # 8 鐘面 256
    x0, y0, x1, y1 = _cell('clock', 512, 748, 256, 256)
    d.rectangle([x0, y0, x1, y1], fill=(240, 236, 226)); cx, cy = x0 + 128, y0 + 128
    for k in range(12):
        a_ = k * math.pi / 6; d.text((cx + 98 * math.sin(a_) - 12, cy - 98 * math.cos(a_) - 14), str(12 if k == 0 else k), font=font(24), fill=(30, 30, 30))
    d.line([(cx, cy), (cx + 50 * math.sin(2.1), cy - 50 * math.cos(2.1))], fill=(20, 20, 20), width=7); d.line([(cx, cy), (cx + 80 * math.sin(5.0), cy - 80 * math.cos(5.0))], fill=(20, 20, 20), width=4)
    # 9 面紙盒（粉紅花紋）256 × 128
    x0, y0, x1, y1 = _cell('tissue', 768, 748, 256, 128)
    d.rectangle([x0, y0, x1, y1], fill=(244, 206, 212))
    for k in range(14): px, py = x0 + rng.randint(10, 246), y0 + rng.randint(10, 118); d.ellipse([px - 9, py - 9, px + 9, py + 9], fill=(230, 150, 170)); d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(250, 230, 160))
    # 10 窗外（公館的街：對面騎樓、行道樹、機車）768 × 384
    x0, y0, x1, y1 = _cell('outside', 1024, 748, 1024, 420)
    d.rectangle([x0, y0, x1, y1], fill=(196, 206, 206))
    d.rectangle([x0, y0 + 210, x1, y1], fill=(150, 150, 146))
    for k in range(6): d.rectangle([x0 + k * 180, y0 + 40, x0 + k * 180 + 150, y0 + 230], fill=(176 - k * 6, 170, 160))
    for k in range(9):
        cx = x0 + 40 + k * 120 + rng.randint(-20, 20); d.rectangle([cx - 6, y0 + 150, cx + 6, y0 + 300], fill=(80, 70, 56))
        for _ in range(14): r_ = rng.randint(30, 60); px, py = cx + rng.randint(-60, 60), y0 + rng.randint(20, 170); d.ellipse([px - r_, py - r_, px + r_, py + r_], fill=(rng.randint(70, 110), rng.randint(110, 150), rng.randint(70, 100)))
    for k in range(5): cx = x0 + 100 + k * 190; d.rectangle([cx, y0 + 300, cx + 90, y0 + 350], fill=[(40, 60, 120), (200, 200, 200), (160, 40, 40), (30, 30, 30), (220, 220, 210)][k])
    im.paste(im.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(5)), (x0, y0)); d = ImageDraw.Draw(im)
    # 11 布簾（米黃底、淡褐色小花、皺）512 × 512
    x0, y0, x1, y1 = _cell('curtain', 0, 1168, 512, 512)
    d.rectangle([x0, y0, x1, y1], fill=(222, 208, 174))
    for k in range(70): px, py = x0 + rng.randint(0, 512), y0 + rng.randint(0, 512); d.ellipse([px - 10, py - 7, px + 10, py + 7], fill=(196, 168, 120)); d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(170, 120, 80))
    for k in range(12): d.line([(x0 + k * 43, y0), (x0 + k * 43 + 8, y1)], fill=(200, 186, 150), width=6)
    d.rectangle([x0, y1 - 80, x1, y1], fill=(206, 186, 140))   # 下緣髒
    # 12 圓木砧板的年輪 256
    x0, y0, x1, y1 = _cell('wood', 512, 1004, 256, 256)
    d.rectangle([x0, y0, x1, y1], fill=(150, 104, 64))
    for k in range(30, 0, -1): r_ = k * 4.2; c_ = (160 - k % 3 * 14, 112 - k % 3 * 10, 70 - k % 3 * 6); d.ellipse([x0 + 128 - r_, y0 + 128 - r_, x0 + 128 + r_, y0 + 128 + r_], outline=c_, width=3)
    for k in range(60): a_ = rng.uniform(0, 6.28); r_ = rng.uniform(10, 120); d.line([(x0 + 128 + r_ * math.cos(a_), y0 + 128 + r_ * math.sin(a_)), (x0 + 128 + (r_ + 30) * math.cos(a_ + 0.3), y0 + 128 + (r_ + 30) * math.sin(a_ + 0.3))], fill=(110, 72, 44), width=2)   # 刀痕
    d.ellipse([x0 + 40, y0 + 40, x1 - 40, y1 - 40], outline=(100, 60, 34), width=0)
    # 13 收銀機、電子秤的面板 256 × 128
    x0, y0, x1, y1 = _cell('panel', 768, 876, 256, 128)
    d.rectangle([x0, y0, x1, y1], fill=(60, 64, 66)); d.rectangle([x0 + 10, y0 + 10, x0 + 140, y0 + 50], fill=(90, 170, 120))
    d.text((x0 + 18, y0 + 12), '0.385', font=font(32), fill=(20, 40, 30))
    for r_ in range(3):
        for c_ in range(5): d.rectangle([x0 + 10 + c_ * 46, y0 + 60 + r_ * 22, x0 + 50 + c_ * 46, y0 + 78 + r_ * 22], fill=(200, 200, 196))
    # 14 外帶餐盒的貼紙、塑膠袋上的字 256 × 128
    x0, y0, x1, y1 = _cell('bag', 768, 1260, 256, 128)
    d.rectangle([x0, y0, x1, y1], fill=(244, 244, 240)); d.text((x0 + 26, y0 + 30), '謝謝光臨', font=font(48), fill=(200, 40, 40))
    # 15 舊海報（褪色）：「美味便當」 256 × 340
    x0, y0, x1, y1 = _cell('poster', 1024, 1168, 256, 340)
    d.rectangle([x0, y0, x1, y1], fill=(222, 206, 170)); d.ellipse([x0 + 40, y0 + 60, x1 - 40, y0 + 220], fill=(214, 150, 110)); d.ellipse([x0 + 70, y0 + 90, x1 - 70, y0 + 190], fill=(232, 220, 196))
    d.text((x0 + 30, y0 + 240), '燒臘便當', font=font(48), fill=(170, 60, 40)); d.text((x0 + 60, y0 + 296), '外送專線', font=font(28), fill=(120, 80, 60))
    a = np.asarray(im, np.float32); blk = a[y0:y1, x0:x1]; a[y0:y1, x0:x1] = blk * 0.75 + np.array([230, 220, 196]) * 0.25
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    # 16 白色的抹布（紅線）128
    x0, y0, x1, y1 = _cell('towel', 1280, 1168, 256, 256)
    d.rectangle([x0, y0, x1, y1], fill=(236, 234, 226))
    for k in (40, 56, 200, 216): d.line([(x0, y0 + k), (x1, y0 + k)], fill=(190, 50, 50), width=6)
    # 17 外送單（手寫、夾在牆上的夾子）× 2、紙箱的印刷 × 1、延長線插座面板
    for k in range(2):
        x0, y0, x1, y1 = _cell(f'order{k}', 1536 + k * 256, 1168 + 260, 256, 300)
        d.rectangle([x0, y0, x1, y1], fill=(246, 244, 236))
        d.text((x0 + 16, y0 + 10), '外送單', font=font(34), fill=(30, 60, 140))
        for r_ in range(7):
            d.line([(x0 + 14, y0 + 62 + r_ * 32), (x1 - 14, y0 + 62 + r_ * 32)], fill=(170, 180, 200), width=1)
            _hand(d, (x0 + 18, y0 + 34 + r_ * 32), rng.choice(['叉燒2', '油雞1', '雙拼3', '燒鴨飯', '加滷蛋', '三寶1', '不要蔥']), 26, (40, 40, 60), rng, 2)
        d.rectangle([x0 + 100, y0 - 2, x0 + 156, y0 + 14], fill=(60, 60, 64))
    x0, y0, x1, y1 = _cell('box', 0, 1680, 512, 256)
    d.rectangle([x0, y0, x1, y1], fill=(176, 136, 88))
    d.text((x0 + 30, y0 + 40), '免洗餐盒', font=font(64), fill=(60, 40, 30)); d.text((x0 + 30, y0 + 130), '500入　易碎', font=font(40), fill=(140, 40, 30))
    d.rectangle([x0, y0 + 110, x1, y0 + 124], fill=(196, 170, 120))
    x0, y0, x1, y1 = _cell('box2', 512, 1680, 512, 256)
    d.rectangle([x0, y0, x1, y1], fill=(168, 128, 80)); d.text((x0 + 30, y0 + 50), '台灣白米', font=font(70), fill=(40, 80, 40)); d.text((x0 + 30, y0 + 150), '30公斤', font=font(44), fill=(60, 40, 30))
    im.save(path); return path


def screen(path):   # 舊電視的畫面（新聞台：主播、跑馬燈）
    im = Image.new('RGB', (256, 192), (40, 70, 120)); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 256, 192], fill=(70, 110, 160)); d.rectangle([150, 30, 230, 150], fill=(110, 130, 160))
    d.ellipse([60, 40, 110, 100], fill=(220, 180, 150)); d.rectangle([40, 100, 130, 160], fill=(40, 40, 60))
    d.rectangle([0, 150, 256, 192], fill=(200, 30, 30)); d.text((10, 156), '午間新聞 颱風動態', font=font(24), fill=(255, 255, 255))
    for y in range(0, 192, 3): d.line([(0, y), (256, y)], fill=(30, 40, 60))
    im = Image.blend(im, Image.new('RGB', im.size, (40, 60, 90)), 0.15); im.save(path); return path


def build_all(outdir, tables, aisle):
    os.makedirs(outdir, exist_ok=True); p = lambda n: os.path.join(outdir, n)
    return dict(wall=wall(p('sl_wall.png')), ceil=ceiling(p('sl_ceil.png')), floor=floor(p('sl_floor.png'), p('sl_floor_rough.png'), tables, aisle),
                steel=steel(p('sl_steel.png')), prints=prints(p('sl_print.png')), screen=screen(p('sl_screen.png')))


if __name__ == '__main__':
    import sys
    r = build_all(sys.argv[1], [4.0, 2.2, 0.4, -1.4, -3.2], (-1.3, 0.9)); print(r); print(CELLS)
