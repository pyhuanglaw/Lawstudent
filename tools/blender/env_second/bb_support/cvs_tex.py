"""日和便利店室內的貼圖（PIL＋numpy，執行 cvs_interior.py 時自動產生）。BB（帳號 A）2026-11-04。
照參考圖 docs/story_planning/ref_images/shops/gongguan_cvs_int.webp 取色：淺灰石紋大地磚（60 cm）、白色方格天花板、淺色橡木、
一張印刷圖集（標誌、吊牌、冷藏櫃標頭、咖啡價目黑板、海報、包裹暫取區、地墊、回收桶標籤…）、一張商品圖集（貨架上一排一排的商品正面、價格條）、
冷藏櫃裡面的發光圖（飲料、鮮食、冷凍）、螢幕、玻璃貼紙（透明底）。
D77：店名「日和便利店」是遊戲裡的虛構店名（使用者給的）；商品沒有真實品牌（字都是品名，例：洋芋片、烏龍茶）。D112：地板是淺灰地磚。"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from shaola_tex import _noise, _save, font

GREEN = (112, 138, 58); DKGREEN = (78, 100, 40); CREAM = (246, 241, 226); SUN = (240, 178, 52)


# ---------------- 地板（1024＝2.4 m：4 × 4 塊 60 cm 淺灰石紋磚；UV 重複） ----------------
def floor(path, rough_path):
    W = H = 1024; t = 256; rng = np.random.RandomState(301)
    n1 = _noise(H, W, 180, 302); n2 = _noise(H, W, 20, 303, 3); n3 = _noise(H, W, 4, 304, 2)
    base = np.array([206, 190, 168], np.float32)   # 參考圖地磚（陽光下偏暖）（偏暖的淺灰）
    col = base[None, None] * (0.93 + 0.1 * n1[..., None] + 0.05 * (n2[..., None] - 0.5) + 0.04 * (n3[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    for i in range(4):
        for j in range(4):
            col[i * t:(i + 1) * t, j * t:(j + 1) * t] *= rng.uniform(0.96, 1.04)
    sp = rng.rand(H, W); col[sp > 0.992] *= 0.82; col[sp < 0.006] = col[sp < 0.006] * 0.5 + 0.5 * 232
    grout = np.zeros((H, W), bool)
    for i in range(0, H, t): grout[max(0, i - 2):i + 2] = True; grout[H - 2:] = True
    for j in range(0, W, t): grout[:, max(0, j - 2):j + 2] = True; grout[:, W - 2:] = True
    col[grout] = col[grout] * 0.7 + np.array([150, 146, 138]) * 0.3
    _save(col, path)
    rgh = 0.28 + 0.12 * n1 + 0.35 * grout
    _save(np.repeat((np.clip(rgh, 0.1, 0.95) * 255)[..., None], 3, 2), rough_path)
    return path


# ---------------- 天花板（1024＝2.4 m：60 cm 白色礦纖板＋白色 T 型鋼架；UV 重複） ----------------
def ceiling(path):
    W = H = 1024; t = 256; n1 = _noise(H, W, 6, 311, 2); n2 = _noise(H, W, 200, 312)
    col = np.array([240, 230, 212], np.float32)[None, None] * (0.97 + 0.03 * n2[..., None] + 0.04 * (n1[..., None] - 0.5)) * np.ones((H, W, 1), np.float32)
    rng = np.random.RandomState(313); dots = rng.rand(H, W) > 0.97; col[dots] *= 0.9   # 礦纖板的小孔
    for i in range(0, H, t): col[max(0, i - 5):i + 5] = [246, 245, 242]; col[max(0, i - 6):max(0, i - 5)] = [200, 198, 192]
    for j in range(0, W, t): col[:, max(0, j - 5):j + 5] = [246, 245, 242]; col[:, max(0, j - 6):max(0, j - 5)] = [200, 198, 192]
    return _save(col, path)


# ---------------- 淺色橡木（512＝1 m；吧台、桌面、椅子、櫃台正面） ----------------
def wood(path):
    """淡色橡木：橫向細紋（每一列一個亮度，沿 u 方向拉長的雜訊）、拼板之間顏色稍有不同"""
    W = H = 512; rng = np.random.RandomState(321)
    rows = rng.normal(0, 1, (H, 1)).astype(np.float32)
    rows = np.asarray(Image.fromarray(((rows - rows.min()) / (np.ptp(rows) + 1e-6) * 255).astype(np.uint8)).resize((1, H), Image.BILINEAR), np.float32) / 255
    streak = _noise(H, W, 3, 324, 2); long_ = np.asarray(Image.fromarray((_noise(H // 8, W // 64 + 1, 1, 325, 1) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    g = 0.6 * rows + 0.25 * long_ + 0.15 * streak
    base = np.array([226, 198, 156], np.float32)
    col = base[None, None] * (0.88 + 0.16 * g[..., None])
    for k, y in enumerate(range(0, H, 128)): col[y:y + 128] *= rng.uniform(0.95, 1.04)
    for y in (0, 128, 256, 384): col[y:y + 2] *= 0.85   # 拼板縫
    return _save(col, path)


# ---------------- 印刷圖集（2048 × 2048；CELLS＝u0,v0,u1,v1，v 從下往上） ----------------
S = 2048
CELLS = {}


def _cell(name, x, y, w, h, s=S):
    CELLS[name] = (x / s, 1 - (y + h) / s, (x + w) / s, 1 - y / s); return (x, y, x + w, y + h)


def sun(d, cx, cy, r, col=SUN, rays=7, lw=None):
    """日和便利店的太陽標誌：半個太陽＋放射的光"""
    d.pieslice([cx - r, cy - r, cx + r, cy + r], 180, 360, fill=col)
    lw = lw or max(2, int(r * 0.16))
    for k in range(rays):
        a = math.pi + math.pi * (k + 0.5) / rays
        d.line([(cx + 1.3 * r * math.cos(a), cy + 1.3 * r * math.sin(a)), (cx + 1.75 * r * math.cos(a), cy + 1.75 * r * math.sin(a))], fill=col, width=lw)


def ctext(d, box, text, sz, fill, dy=0):
    x0, y0, x1, y1 = box; f = font(sz); w = d.textlength(text, font=f)
    d.text(((x0 + x1 - w) / 2, (y0 + y1 - sz) / 2 + dy), text, font=f, fill=fill)


def icon(d, kind, x, y, s, col, lw=4):
    """線條小圖示（吊牌、包裹櫃、玻璃貼紙）"""
    if kind == 'basket':
        d.line([(x, y + s * .35), (x + s, y + s * .35)], fill=col, width=lw); d.polygon([(x + s * .08, y + s * .35), (x + s * .92, y + s * .35), (x + s * .8, y + s * .9), (x + s * .2, y + s * .9)], outline=col, width=lw)
        d.arc([x + s * .2, y, x + s * .8, y + s * .7], 180, 360, fill=col, width=lw)
    elif kind == 'bowl':
        d.chord([x, y + s * .2, x + s, y + s * .95], 0, 180, outline=col, width=lw); d.line([(x + s * .55, y), (x + s * .3, y + s * .5)], fill=col, width=lw); d.line([(x + s * .7, y), (x + s * .45, y + s * .5)], fill=col, width=lw)
    elif kind == 'book':
        d.polygon([(x, y + s * .15), (x + s * .5, y + s * .25), (x + s * .5, y + s * .95), (x, y + s * .85)], outline=col, width=lw)
        d.polygon([(x + s, y + s * .15), (x + s * .5, y + s * .25), (x + s * .5, y + s * .95), (x + s, y + s * .85)], outline=col, width=lw)
    elif kind == 'box':
        d.polygon([(x + s * .5, y), (x + s, y + s * .25), (x + s * .5, y + s * .5), (x, y + s * .25)], outline=col, width=lw)
        d.line([(x, y + s * .25), (x, y + s * .78), (x + s * .5, y + s), (x + s, y + s * .78), (x + s, y + s * .25)], fill=col, width=lw); d.line([(x + s * .5, y + s * .5), (x + s * .5, y + s)], fill=col, width=lw)
    elif kind == 'cup':
        d.polygon([(x + s * .2, y + s * .25), (x + s * .8, y + s * .25), (x + s * .7, y + s), (x + s * .3, y + s)], outline=col, width=lw); d.line([(x + s * .12, y + s * .25), (x + s * .88, y + s * .25)], fill=col, width=lw)
        d.line([(x + s * .55, y + s * .25), (x + s * .68, y - s * .05)], fill=col, width=lw)
    elif kind == 'sandwich':
        d.polygon([(x, y + s), (x + s, y + s), (x + s * .15, y + s * .1)], outline=col, width=lw); d.line([(x + s * .1, y + s * .8), (x + s * .85, y + s * .8)], fill=col, width=lw)
    elif kind == 'onigiri':
        d.rounded_rectangle([x + s * .05, y + s * .1, x + s * .95, y + s], radius=int(s * .35), outline=col, width=lw); d.rectangle([x + s * .35, y + s * .62, x + s * .65, y + s], outline=col, width=lw)
    elif kind == 'steam':
        for k in range(3):
            xx = x + s * (.25 + .25 * k); d.arc([xx - s * .1, y, xx + s * .1, y + s * .5], 270, 90, fill=col, width=lw); d.arc([xx - s * .1, y + s * .45, xx + s * .1, y + s * .95], 90, 270, fill=col, width=lw)
    elif kind == 'wifi':
        for k in range(3): r = s * (.2 + .25 * k); d.arc([x + s / 2 - r, y + s - r, x + s / 2 + r, y + s + r], 225, 315, fill=col, width=lw)
    elif kind == 'recycle':
        for k in range(3):
            a = k * 2 * math.pi / 3; cx, cy = x + s / 2, y + s / 2
            d.arc([cx - s * .4, cy - s * .4, cx + s * .4, cy + s * .4], math.degrees(a) + 20, math.degrees(a) + 100, fill=col, width=lw)
    elif kind == 'trash':
        d.rectangle([x + s * .2, y + s * .25, x + s * .8, y + s], outline=col, width=lw); d.line([(x + s * .1, y + s * .2), (x + s * .9, y + s * .2)], fill=col, width=lw)
    elif kind == 'leaf':
        d.ellipse([x + s * .15, y + s * .1, x + s * .85, y + s * .9], outline=col, width=lw); d.line([(x + s * .3, y + s * .8), (x + s * .7, y + s * .2)], fill=col, width=lw)


def prints(path):
    im = Image.new('RGB', (S, S), (236, 232, 222)); d = ImageDraw.Draw(im); rng = random.Random(1104)
    # 右牆大標誌（米白底、太陽、深綠字）1024 × 300
    b = _cell('logo', 0, 0, 1024, 300); d.rectangle(b, fill=CREAM)
    sun(d, 170, 190, 80); d.line([(300, 60), (300, 250)], fill=DKGREEN, width=5)
    for i, ch in enumerate('日和便利店'): d.text((340 + i * 132, 90), ch, font=font(128), fill=(70, 88, 34))
    d.rectangle([0, 286, 1024, 300], fill=GREEN)
    # 端架頂的綠色招牌 512 × 128
    b = _cell('endsign', 1024, 0, 512, 128); d.rounded_rectangle(b, radius=40, fill=GREEN)
    sun(d, 1024 + 90, 84, 26, col=(250, 214, 110)); ctext(d, (1024 + 120, 0, 1536, 128), '日和便利店', 62, (255, 255, 255), -4)
    # 三張吊牌 512 × 160（綠色方塊＋白色圖示、黑字兩行）
    for k, (ic, t1, t2) in enumerate((('basket', '日用品', '清潔・衛生'), ('bowl', '零食・泡麵', '點心・飲品'), ('book', '文具・生活', '讀書・雨具'))):
        x0, y0 = 1536, k * 170; b = _cell(f'hang{k}', x0, y0, 512, 160); d.rectangle(b, fill=(250, 250, 246)); d.rectangle([x0, y0, x0 + 512, y0 + 160], outline=(200, 200, 194), width=4)
        d.rectangle([x0 + 14, y0 + 14, x0 + 146, y0 + 146], fill=GREEN); icon(d, ic, x0 + 34, y0 + 36, 92, (255, 255, 255), 7)
        d.text((x0 + 170, y0 + 24), t1, font=font(58), fill=(40, 40, 36)); d.text((x0 + 172, y0 + 96), t2, font=font(40), fill=(70, 70, 64))
    # 貨架頂上的分類吊牌（綠底白字）三張 512 × 150（放在印刷圖集下半，y 1720～）
    for k, (ic, t1, t2) in enumerate((('basket', '日用品', '清潔・衛生'), ('bowl', '零食・泡麵', '點心・飲品'), ('book', '文具・生活', '讀書・雨具'))):
        x0, y0 = k * 520, 1720; b = _cell(f'hangG{k}', x0, y0, 512, 150); d.rounded_rectangle(b, radius=14, fill=GREEN); d.rounded_rectangle([x0 + 6, y0 + 6, x0 + 506, y0 + 144], radius=12, outline=(236, 242, 222), width=4)
        icon(d, ic, x0 + 26, y0 + 32, 86, (255, 255, 255), 7)
        d.text((x0 + 140, y0 + 18), t1, font=font(60), fill=(255, 255, 255)); d.text((x0 + 144, y0 + 90), t2, font=font(38), fill=(232, 240, 214))
    # 冷藏櫃標頭（綠底白字）三張 680 × 110
    for k, t in enumerate(('飲品冷藏', '鮮食・三明治・飯糰', '冷凍食品')):
        b = _cell(f'cool{k}', 0, 320 + k * 120, 680, 110); d.rectangle(b, fill=GREEN); d.rectangle([b[0], b[3] - 10, b[2], b[3]], fill=DKGREEN)
        ctext(d, b, t, 62, (255, 255, 255), -6)
    # 咖啡價目黑板 384 × 512
    x0, y0 = 700, 320; b = _cell('coffee', x0, y0, 384, 512); d.rectangle(b, fill=(38, 40, 38)); d.rectangle([x0 + 8, y0 + 8, x0 + 376, y0 + 504], outline=(120, 110, 90), width=6)
    d.text((x0 + 30, y0 + 30), '日和咖啡', font=font(64), fill=(244, 240, 228)); d.text((x0 + 34, y0 + 104), 'Coffee', font=font(36), fill=(220, 214, 196))
    icon(d, 'cup', x0 + 260, y0 + 100, 70, (244, 240, 228), 5)
    for i, (n, p) in enumerate((('美式', '45'), ('拿鐵', '60'), ('卡布奇諾', '65'), ('熱可可', '55'))):
        y = y0 + 210 + i * 70; d.text((x0 + 34, y), n, font=font(42), fill=(244, 240, 228)); d.text((x0 + 290, y), p, font=font(42), fill=(244, 240, 228))
        d.line([(x0 + 34, y + 56), (x0 + 350, y + 56)], fill=(90, 90, 84), width=2)
    # 學生限定海報 384 × 560
    x0, y0 = 1100, 320; b = _cell('poster_student', x0, y0, 384, 560); d.rectangle(b, fill=(250, 248, 240)); d.rectangle([x0, y0, x0 + 384, y0 + 18], fill=GREEN)
    d.text((x0 + 40, y0 + 40), '學生限定', font=font(64), fill=(60, 78, 30)); d.text((x0 + 40, y0 + 118), '輕食套餐', font=font(64), fill=(60, 78, 30))
    d.text((x0 + 44, y0 + 200), '三明治＋飲品', font=font(36), fill=(70, 70, 64)); d.text((x0 + 40, y0 + 250), '特價', font=font(44), fill=(200, 50, 40)); d.text((x0 + 140, y0 + 230), '99', font=font(90), fill=(210, 48, 36)); d.text((x0 + 272, y0 + 270), '元', font=font(40), fill=(200, 50, 40))
    d.polygon([(x0 + 70, y0 + 520), (x0 + 330, y0 + 520), (x0 + 110, y0 + 360)], fill=(232, 210, 160)); d.polygon([(x0 + 92, y0 + 500), (x0 + 300, y0 + 500), (x0 + 120, y0 + 390)], fill=(120, 170, 70))
    d.polygon([(x0 + 100, y0 + 492), (x0 + 270, y0 + 492), (x0 + 125, y0 + 410)], fill=(236, 120, 100)); d.rectangle([x0, y0 + 542, x0 + 384, y0 + 560], fill=GREEN)
    # 晚間優惠海報 384 × 560
    x0, y0 = 1500, 520; b = _cell('poster_night', x0, y0, 384, 560); d.rectangle(b, fill=(252, 250, 244)); d.rectangle([x0, y0, x0 + 384, y0 + 120], fill=(170, 40, 34))
    d.text((x0 + 50, y0 + 26), '晚間優惠', font=font(68), fill=(255, 255, 255)); d.text((x0 + 70, y0 + 140), '21:00 - 24:00', font=font(40), fill=(60, 50, 40))
    d.text((x0 + 60, y0 + 200), '指定熟食', font=font(56), fill=(170, 40, 34)); d.text((x0 + 40, y0 + 270), '第二件', font=font(48), fill=(170, 40, 34)); d.text((x0 + 200, y0 + 250), '8', font=font(100), fill=(200, 44, 34)); d.text((x0 + 270, y0 + 280), '折', font=font(50), fill=(170, 40, 34))
    for k in range(5): cx, cy = x0 + 110 + (k % 3) * 80, y0 + 430 + (k // 3) * 60; d.ellipse([cx - 40, cy - 34, cx + 40, cy + 34], fill=(206, 140, 60), outline=(160, 96, 36), width=4)
    # 包裹暫取區 384 × 256
    x0, y0 = 0, 700; b = _cell('parcel', x0, y0, 384, 256); d.rectangle(b, fill=(244, 243, 238)); d.rectangle([x0 + 6, y0 + 6, x0 + 378, y0 + 250], outline=(170, 170, 164), width=4)
    icon(d, 'box', x0 + 34, y0 + 60, 120, (70, 70, 66), 6); d.text((x0 + 190, y0 + 60), '包裹', font=font(70), fill=(50, 50, 46)); d.text((x0 + 190, y0 + 144), '暫取區', font=font(56), fill=(50, 50, 46))
    # 熱食牌 384 × 128（褐底）
    x0, y0 = 0, 970; b = _cell('hotsign', x0, y0, 384, 128); d.rounded_rectangle(b, radius=16, fill=(120, 74, 52)); icon(d, 'steam', x0 + 20, y0 + 22, 84, (255, 240, 220), 5)
    d.text((x0 + 120, y0 + 14), '熱食', font=font(54), fill=(255, 246, 230)); d.text((x0 + 122, y0 + 76), '茶葉蛋・熱狗堡', font=font(32), fill=(250, 230, 210))
    # 地墊（深綠、太陽、日和便利店）768 × 512
    x0, y0 = 0, 1110; b = _cell('mat', x0, y0, 768, 512)
    n = (_noise(512, 768, 3, 341, 2) * 30).astype(np.int16); mt = np.zeros((512, 768, 3), np.int16) + np.array([70, 92, 60]) + n[..., None]
    im.paste(Image.fromarray(np.clip(mt, 0, 255).astype(np.uint8)), (x0, y0)); d = ImageDraw.Draw(im)
    d.rectangle([x0 + 12, y0 + 12, x0 + 756, y0 + 500], outline=(50, 64, 42), width=14); sun(d, x0 + 170, y0 + 300, 60, col=(196, 206, 176))
    for i, ch in enumerate('日和便利店'): d.text((x0 + 270 + i * 92, y0 + 220), ch, font=font(88), fill=(196, 206, 176))
    # 回收桶標籤 128 × 160 × 3
    for k, (bg, ic, t) in enumerate((((70, 120, 74), 'recycle', '資源回收'), ((52, 82, 128), 'trash', '一般垃圾'), ((122, 84, 56), 'leaf', '廚餘'))):
        x0, y0 = 800 + k * 140, 1110; b = _cell(f'bin{k}', x0, y0, 128, 160); d.rectangle(b, fill=bg); icon(d, ic, x0 + 26, y0 + 16, 76, (255, 255, 255), 6); ctext(d, (x0, y0 + 104, x0 + 128, y0 + 156), t, 26, (255, 255, 255))
    # 帆布袋（太陽標誌）128 × 160
    x0, y0 = 1220, 1110; b = _cell('tote', x0, y0, 128, 160); d.rectangle(b, fill=(240, 234, 218)); sun(d, x0 + 64, y0 + 100, 22, col=SUN); d.arc([x0 + 30, y0 - 30, x0 + 98, y0 + 50], 0, 180, fill=(200, 190, 170), width=6)
    # 微波爐正面 256 × 128
    x0, y0 = 1360, 1110; b = _cell('micro', x0, y0, 256, 128); d.rectangle(b, fill=(232, 232, 228)); d.rectangle([x0 + 12, y0 + 14, x0 + 186, y0 + 114], fill=(40, 42, 44)); d.rectangle([x0 + 22, y0 + 24, x0 + 176, y0 + 104], fill=(70, 74, 76))
    for k in range(6): d.rectangle([x0 + 200 + (k % 2) * 24, y0 + 20 + (k // 2) * 26, x0 + 218 + (k % 2) * 24, y0 + 38 + (k // 2) * 26], fill=(150, 150, 146))
    d.rectangle([x0 + 200, y0 + 100, x0 + 242, y0 + 112], fill=(60, 140, 90))
    # 桌上立牌 128 × 160、員工專用 256 × 96、營業時間貼紙 256 × 128、櫃台小 POP 160 × 128
    x0, y0 = 1630, 1110; b = _cell('tent', x0, y0, 128, 160); d.rectangle(b, fill=(252, 250, 244)); d.rectangle([x0, y0, x0 + 128, y0 + 30], fill=GREEN); d.text((x0 + 14, y0 + 40), '今日推薦', font=font(24), fill=(60, 60, 56))
    d.rounded_rectangle([x0 + 20, y0 + 80, x0 + 108, y0 + 146], radius=10, fill=(230, 196, 120))
    x0, y0 = 1770, 1110; b = _cell('staff', x0, y0, 256, 96); d.rectangle(b, fill=(244, 244, 240)); ctext(d, b, '員工專用', 50, (60, 60, 56))
    x0, y0 = 800, 1290; b = _cell('pop', x0, y0, 160, 128); d.rectangle(b, fill=(255, 236, 110)); d.text((x0 + 12, y0 + 12), '集點', font=font(40), fill=(180, 40, 30)); d.text((x0 + 12, y0 + 64), '換好禮', font=font(34), fill=(60, 60, 56))
    x0, y0 = 980, 1290; b = _cell('pop2', x0, y0, 160, 128); d.rectangle(b, fill=(250, 250, 246)); d.text((x0 + 10, y0 + 10), '新品', font=font(44), fill=(70, 110, 40)); d.rounded_rectangle([x0 + 20, y0 + 66, x0 + 140, y0 + 116], radius=10, fill=(220, 160, 90))
    # 收銀機旁的小招牌：「請排隊」、「行動支付」（沒有真實品牌：只畫手機圖示）
    x0, y0 = 1160, 1290; b = _cell('pay', x0, y0, 256, 128); d.rectangle(b, fill=(250, 250, 246)); d.rounded_rectangle([x0 + 20, y0 + 16, x0 + 70, y0 + 112], radius=8, outline=(60, 60, 56), width=5); d.text((x0 + 86, y0 + 22), '行動支付', font=font(36), fill=(60, 60, 56)); d.text((x0 + 86, y0 + 70), '悠遊卡', font=font(34), fill=(60, 60, 56))
    # 窗外（只給渲染用，--preview；正式 GLB 裡沒有）在另一張
    # 紙箱側面（貨架頂的庫存）256 × 160
    x0, y0 = 1430, 1290; b = _cell('carton', x0, y0, 256, 160); d.rectangle(b, fill=(196, 160, 110)); d.rectangle([x0, y0 + 60, x0 + 256, y0 + 74], fill=(220, 200, 160)); d.text((x0 + 20, y0 + 90), '衛生紙 12入', font=font(30), fill=(80, 50, 30))
    # 熱水瓶正面 128 × 192
    x0, y0 = 1700, 1290; b = _cell('kettle', x0, y0, 128, 192); d.rectangle(b, fill=(214, 216, 216)); d.rectangle([x0 + 20, y0 + 30, x0 + 108, y0 + 70], fill=(60, 62, 64)); d.text((x0 + 26, y0 + 36), '98°', font=font(26), fill=(120, 230, 140)); d.rectangle([x0 + 40, y0 + 110, x0 + 88, y0 + 130], fill=(200, 60, 50))
    # 白牆＋綠色條（櫃台後面上方的牆、冷藏櫃上方的長條）512 × 64
    x0, y0 = 0, 1640; b = _cell('greenband', x0, y0, 512, 64); d.rectangle(b, fill=GREEN); d.rectangle([x0, y0 + 50, x0 + 512, y0 + 64], fill=DKGREEN)
    im.save(path); return path


# ---------------- 商品圖集（2048 × 2048：2 欄 × 16 列，每格 1024 × 128＝貨架一層 1.2 m 寬、0.3 m 高的商品正面） ----------------
GS = 2048; GCELLS = {}
NAMES = {'chips': ['洋芋片', '玉米脆', '蝦味條', '海苔', '餅乾'], 'noodle': ['牛肉麵', '酸辣', '海鮮', '豚骨'], 'bottle': ['洗髮精', '沐浴乳', '洗碗精', '洗衣精'],
         'box': ['蘇打餅', '巧克力', '夾心酥', '燕麥'], 'paper': ['衛生紙', '面紙', '濕紙巾'], 'stat': ['筆記本', '原子筆', '便條紙', '膠帶'],
         'drink': ['烏龍茶', '綠茶', '奶茶', '礦泉水', '柳橙汁'], 'can': ['咖啡', '汽水', '豆漿']}


def _item(d, kind, x, y0, h, rng):
    """一個商品的正面，回傳寬度（px）；y0＝格子上緣、h＝格子高"""
    base = y0 + h - 4
    pal = [(214, 52, 44), (240, 196, 48), (60, 130, 200), (70, 160, 80), (236, 120, 40), (150, 70, 160), (240, 240, 236), (40, 40, 44), (230, 110, 150)]
    c = rng.choice(pal); c2 = rng.choice(pal)
    if kind == 'chips':
        w = rng.randint(62, 86); top = base - rng.randint(int(h * .7), int(h * .9))
        d.rounded_rectangle([x, top, x + w, base], radius=8, fill=c); d.rectangle([x, top, x + w, top + 8], fill=tuple(int(v * .8) for v in c))
        d.ellipse([x + w * .2, top + (base - top) * .45, x + w * .8, top + (base - top) * .85], fill=(246, 214, 110)); d.rectangle([x + 6, top + 14, x + w - 6, top + 34], fill=c2)
        d.text((x + 8, top + 14), rng.choice(NAMES['chips'])[:3], font=font(17), fill=(255, 255, 255)); d.line([(x + 8, top + 3), (x + 8, base - 6)], fill=(255, 255, 255), width=2)
    elif kind == 'noodle':
        w = rng.randint(70, 84); top = base - int(h * .62)
        d.polygon([(x, top), (x + w, top), (x + w - 8, base), (x + 8, base)], fill=(246, 244, 238)); d.rectangle([x + 4, top + 12, x + w - 4, top + 40], fill=c)
        d.text((x + 8, top + 14), rng.choice(NAMES['noodle'])[:3], font=font(18), fill=(255, 255, 255)); d.ellipse([x + w * .3, top + 46, x + w * .7, base - 6], fill=(200, 120, 60))
        d.rectangle([x - 2, top - 6, x + w + 2, top], fill=(232, 232, 226))
    elif kind == 'bottle':
        w = rng.randint(40, 56); top = base - rng.randint(int(h * .7), int(h * .92)); neck = top + 18
        d.rectangle([x + w * .35, top, x + w * .65, neck], fill=c2); d.rounded_rectangle([x, neck, x + w, base], radius=12, fill=c)
        d.rectangle([x + 4, neck + 20, x + w - 4, neck + 50], fill=(250, 250, 246)); d.line([(x + w * .25, neck + 6), (x + w * .25, base - 6)], fill=(255, 255, 255), width=3)
    elif kind == 'box':
        w = rng.randint(56, 90); top = base - rng.randint(int(h * .55), int(h * .85))
        d.rectangle([x, top, x + w, base], fill=c); d.rectangle([x + 4, top + 8, x + w - 4, top + 26], fill=(250, 250, 246)); d.text((x + 6, top + 8), rng.choice(NAMES['box'])[:3], font=font(16), fill=c)
        d.rounded_rectangle([x + w * .2, top + 34, x + w * .8, base - 8], radius=6, fill=c2)
    elif kind == 'paper':
        w = rng.randint(110, 150); top = base - rng.randint(int(h * .75), int(h * .92))
        d.rounded_rectangle([x, top, x + w, base], radius=14, fill=(246, 246, 242)); d.rectangle([x + 10, top + 20, x + w - 10, top + 48], fill=rng.choice([(110, 170, 210), (230, 150, 170), (150, 200, 120)]))
        d.text((x + 14, top + 22), rng.choice(NAMES['paper']), font=font(20), fill=(255, 255, 255))
        for k in range(1, 3): d.line([(x + k * w // 3, top + 6), (x + k * w // 3, base - 6)], fill=(220, 220, 214), width=2)
    elif kind == 'stat':
        w = rng.randint(48, 70); top = base - rng.randint(int(h * .6), int(h * .9))
        if rng.random() < 0.5:
            d.rectangle([x, top, x + w, base], fill=rng.choice([(230, 200, 150), (180, 210, 230), (240, 190, 200), (200, 230, 190), (250, 240, 200)])); d.rectangle([x, top, x + 6, base], fill=(90, 90, 86))
        else:
            d.rectangle([x, top, x + w, base], fill=(250, 250, 246)); [d.line([(x + 10 + k * 10, top + 10), (x + 10 + k * 10, base - 10)], fill=rng.choice(pal), width=5) for k in range(max(1, (w - 16) // 10))]
            d.rectangle([x + w // 2 - 6, top - 10, x + w // 2 + 6, top], fill=(200, 200, 196))
    elif kind == 'drink':
        w = rng.randint(32, 42); top = base - rng.randint(int(h * .8), int(h * .95)); neck = top + 16
        liq = rng.choice([(150, 96, 40), (120, 170, 70), (220, 190, 150), (210, 230, 240), (250, 150, 40), (200, 60, 50)])
        d.rectangle([x + w * .3, top, x + w * .7, top + 8], fill=rng.choice(pal)); d.polygon([(x + w * .3, top + 8), (x + w * .7, top + 8), (x + w, neck + 10), (x + w, base), (x, base), (x, neck + 10)], fill=liq)
        d.rectangle([x, neck + 26, x + w, neck + 56], fill=rng.choice(pal)); d.line([(x + 5, neck + 10), (x + 5, base - 4)], fill=(255, 255, 255), width=3)
    elif kind == 'can':
        w = rng.randint(30, 36); top = base - int(h * .5)
        d.rectangle([x, top, x + w, base], fill=c); d.rectangle([x, top, x + w, top + 5], fill=(200, 200, 200)); d.rectangle([x + 2, top + 16, x + w - 2, top + 30], fill=c2)
    return w


def goods(path):
    im = Image.new('RGB', (GS, GS), (70, 70, 68)); d = ImageDraw.Draw(im); rng = random.Random(2048)
    kinds = ['chips', 'chips', 'noodle', 'noodle', 'bottle', 'box', 'box', 'paper', 'stat', 'stat', 'drink', 'drink', 'can', 'mix_daily', 'mix_snack', 'price']
    for col in range(2):
        for row, k in enumerate(kinds):
            x0, y0 = col * 1024, row * 128
            GCELLS.setdefault(k, []).append((x0 / GS, 1 - (y0 + 128) / GS, (x0 + 1024) / GS, 1 - y0 / GS))
            d.rectangle([x0, y0, x0 + 1024, y0 + 128], fill=(86, 86, 84) if k != 'price' else (250, 250, 246))
            # 貨架背板的陰影（上緣暗）
            for t in range(18): d.line([(x0, y0 + t), (x0 + 1024, y0 + t)], fill=(50 + t, 50 + t, 48 + t))
            if k == 'price':   # 價格條：白底、一格一格的黃色價格牌
                x = x0 + 6
                while x < x0 + 1000:
                    w = rng.randint(70, 110); d.rectangle([x, y0 + 10, x + w - 8, y0 + 118], fill=(255, 226, 80) if rng.random() < 0.8 else (255, 140, 120))
                    d.text((x + 8, y0 + 30), str(rng.choice([25, 29, 35, 39, 45, 49, 55, 59, 65, 79, 89, 99])), font=font(52), fill=(40, 40, 36)); x += w
                continue
            x = x0 + rng.randint(0, 10)
            while x < x0 + 1010:
                kk = k if not k.startswith('mix') else rng.choice(['bottle', 'paper', 'box'] if k == 'mix_daily' else ['chips', 'box', 'can'])
                w = _item(d, kk, x, y0 + 6, 122, rng); x += w + rng.randint(2, 8)
            # 一點陰影（下緣）
    a = np.asarray(im).astype(np.float32); a *= 1.0; im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); im.save(path); return path


def side_cell():
    """商品方塊的側面、頂面：用價格條那一列旁邊的深灰（貨架裡面看起來暗）"""
    return (0.0, 0.0, 0.004, 0.004)


# ---------------- 冷藏櫃裡面（發光：2048 × 2048，4 欄各 512 寬＝1 扇門、高 2048＝1.9 m） ----------------
CCELLS = {}


def cooler(path):
    im = Image.new('RGB', (2048, 2048), (236, 242, 246)); d = ImageDraw.Draw(im); rng = random.Random(77)
    for c, kind in enumerate(('drink', 'drink', 'fresh', 'frozen')):
        x0 = c * 512; CCELLS[f'{kind}{c}'] = (x0 / 2048, 0.0, (x0 + 512) / 2048, 1.0)
        d.rectangle([x0, 0, x0 + 512, 2048], fill=(188, 198, 206) if kind != 'frozen' else (190, 206, 222))
        shelves = [60 + k * 330 for k in range(6)]
        for i, sy in enumerate(shelves):
            y1 = sy + 300; d.rectangle([x0, y1, x0 + 512, y1 + 22], fill=(190, 196, 200)); d.rectangle([x0, y1 + 22, x0 + 512, y1 + 30], fill=(255, 214, 70))
            x = x0 + 8
            while x < x0 + 500:
                if kind == 'drink':
                    w = _item(d, rng.choice(['drink', 'drink', 'can']), x, sy + 40, 260, rng)
                elif kind == 'fresh':
                    if i < 2:   # 三明治（三角形）
                        w = 90; d.polygon([(x, y1 - 4), (x + 84, y1 - 4), (x + 10, y1 - 150)], fill=(236, 226, 196)); d.polygon([(x + 12, y1 - 14), (x + 70, y1 - 14), (x + 18, y1 - 110)], fill=rng.choice([(120, 170, 70), (236, 140, 120), (246, 210, 110)]))
                        d.rectangle([x + 4, y1 - 60, x + 50, y1 - 40], fill=GREEN)
                    elif i < 4:   # 飯糰（三角形、海苔）
                        w = 74; d.polygon([(x, y1 - 4), (x + 70, y1 - 4), (x + 35, y1 - 100)], fill=(248, 248, 244)); d.rectangle([x + 22, y1 - 46, x + 48, y1 - 4], fill=(30, 40, 30)); d.rectangle([x + 4, y1 - 30, x + 66, y1 - 22], fill=rng.choice([(220, 60, 50), (60, 130, 200), (70, 160, 80)]))
                    else:   # 便當、沙拉（方盒）
                        w = 150; d.rectangle([x, y1 - 90, x + 140, y1 - 4], fill=(250, 250, 246)); d.rectangle([x + 8, y1 - 80, x + 70, y1 - 12], fill=(240, 240, 230)); d.rectangle([x + 76, y1 - 80, x + 132, y1 - 46], fill=(200, 120, 60)); d.rectangle([x + 76, y1 - 42, x + 132, y1 - 12], fill=(110, 170, 70))
                        d.rectangle([x, y1 - 90, x + 140, y1 - 80], fill=(80, 60, 40))
                else:
                    w = rng.randint(90, 140); top = y1 - rng.randint(120, 220); col = rng.choice([(60, 120, 190), (220, 70, 60), (250, 200, 60), (70, 150, 90), (240, 240, 236)])
                    d.rectangle([x, top, x + w, y1 - 4], fill=col); d.rectangle([x + 8, top + 16, x + w - 8, top + 46], fill=(250, 250, 246)); d.ellipse([x + w * .25, top + 60, x + w * .75, y1 - 20], fill=(230, 190, 130))
                x += w + 6
        if kind == 'frozen':   # 霜
            a = np.asarray(im).astype(np.float32); n = _noise(2048, 512, 30, 91 + c, 3)
            a[:, x0:x0 + 512] = a[:, x0:x0 + 512] * (0.82 + 0.1 * n[..., None]) + 46 * (1 - n[..., None]) * 0.6; im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
        d.rectangle([x0, 0, x0 + 512, 40], fill=(250, 252, 255))   # 上面的燈條
    im.save(path); return path


# ---------------- 螢幕（512 × 512：收銀機兩面、刷卡機、咖啡機面板、包裹櫃觸控螢幕、熱食櫃的燈） ----------------
SCELLS = {}


def screen(path):
    im = Image.new('RGB', (512, 512), (20, 24, 28)); d = ImageDraw.Draw(im)
    def c(n, x, y, w, h): SCELLS[n] = (x / 512, 1 - (y + h) / 512, (x + w) / 512, 1 - y / 512); return (x, y, x + w, y + h)
    b = c('pos', 0, 0, 256, 192); d.rectangle(b, fill=(236, 240, 236)); d.rectangle([0, 0, 256, 30], fill=GREEN); d.text((8, 4), '日和便利店', font=font(20), fill=(255, 255, 255))
    for k in range(4): d.rectangle([10, 42 + k * 30, 170, 64 + k * 30], fill=(210, 216, 210)); d.text((180, 42 + k * 30), str(25 + k * 10), font=font(18), fill=(40, 40, 40))
    d.rectangle([150, 160, 246, 186], fill=(230, 120, 40))
    b = c('pos2', 256, 0, 256, 192); d.rectangle(b, fill=(30, 60, 50)); d.text((272, 30), '合計', font=font(36), fill=(255, 255, 255)); d.text((300, 90), '$ 85', font=font(56), fill=(140, 240, 160))
    b = c('coffee', 0, 200, 160, 120); d.rectangle(b, fill=(26, 30, 40)); [d.rounded_rectangle([10 + (k % 3) * 50, 214 + (k // 3) * 50, 50 + (k % 3) * 50, 254 + (k // 3) * 50], radius=8, fill=(90, 150, 210) if k != 4 else (230, 140, 60)) for k in range(6)]
    b = c('kiosk', 170, 200, 160, 120); d.rectangle(b, fill=(230, 236, 240)); d.rectangle([170, 200, 330, 228], fill=GREEN); d.text((178, 236), '請輸入取件碼', font=font(18), fill=(40, 40, 40)); d.rectangle([182, 270, 318, 304], fill=(255, 255, 255))
    b = c('lamp', 340, 200, 160, 120); d.rectangle(b, fill=(255, 210, 130))
    b = c('white', 0, 330, 160, 120); d.rectangle(b, fill=(255, 255, 255))
    b = c('reader', 170, 330, 120, 120); d.rectangle(b, fill=(20, 26, 30)); d.text((182, 360), '請感應', font=font(22), fill=(120, 220, 255))
    im.save(path); return path


# ---------------- 玻璃貼紙（1024 × 1024 RGBA：白色線條；從店裡看是正的） ----------------
DCELLS = {}


def decals(path):
    im = Image.new('RGBA', (1024, 1024), (255, 255, 255, 0)); d = ImageDraw.Draw(im); wcol = (255, 255, 255, 245)
    def c(n, x, y, w, h): DCELLS[n] = (x / 1024, 1 - (y + h) / 1024, (x + w) / 1024, 1 - y / 1024); return (x, y, x + w, y + h)
    c('win', 0, 0, 1024, 400)
    for k, ic in enumerate(('cup', 'sandwich', 'onigiri')): icon(d, ic, 80 + k * 330, 30, 170, wcol, 12)
    for k, t in enumerate(('內用座位', '輕食飲品', '便當新鮮')):
        ctext(d, (k * 340, 250, k * 340 + 340, 340), t, 64, wcol)
        if k: d.line([(k * 340, 260), (k * 340, 340)], fill=wcol, width=6)
    c('door', 0, 420, 512, 560); d.text((70, 440), '營業時間', font=font(60), fill=wcol); d.text((60, 520), '07:00 - 24:00', font=font(52), fill=wcol)
    for k, (ic, t) in enumerate((('bowl', '內用座位'), ('box', '包裹取件'), ('wifi', '免費 Wi-Fi'))):
        y = 620 + k * 110; d.ellipse([60, y, 150, y + 90], outline=wcol, width=6); icon(d, ic, 78, y + 16, 54, wcol, 6); d.text((176, y + 16), t, font=font(50), fill=wcol)
    c('stripe', 540, 420, 480, 60); d.rectangle([540, 420, 1020, 480], fill=(112, 138, 58, 235))
    im.save(path); return path


# ---------------- 窗外（只給渲染用：--preview） ----------------
def outside(path):
    """窗外：對面騎樓與公寓（淡）、行道樹（樹冠一團一團、透光）、人行道（陽光）"""
    W, H = 2048, 768; rng = np.random.RandomState(401)
    yy = np.linspace(0, 1, H)[:, None] * np.ones((1, W)); xx = np.ones((H, 1)) * np.linspace(0, 1, W)[None]
    a = np.zeros((H, W, 3), np.float32) + np.array([226, 232, 232])
    bld = (yy > 0.12) & (yy < 0.74); a[bld] = np.array([200, 196, 186]) * (0.92 + 0.1 * _noise(H, W, 30, 405, 2)[bld][:, None])
    for x in range(0, W, 46): a[int(H * .2):int(H * .7), x:x + 22] *= np.array([0.86, 0.88, 0.9])   # 對面的窗
    can = np.zeros((H, W), np.float32)
    for k in range(26):
        cx, cy, r = rng.randint(0, W), rng.randint(0, int(H * .45)), rng.randint(80, 170)
        can = np.maximum(can, np.clip(1 - ((xx * W - cx) ** 2 + ((yy * H - cy) * 1.3) ** 2) / r ** 2, 0, 1))
    n = _noise(H, W, 14, 406, 3); m = (can * (0.6 + 0.6 * n)) > 0.45
    leaf = np.array([86, 120, 58]) * (0.7 + 0.6 * n[..., None]) + np.array([40, 40, 0]) * (n[..., None] > 0.6)
    a = np.where(m[..., None], leaf, a)
    for x in range(120, W, 300): a[int(H * .35):int(H * .76), x:x + 16] = [92, 78, 62]
    walk = yy > 0.74; a = np.where(walk[..., None], np.array([206, 200, 186]) * (0.95 + 0.1 * _noise(H, W, 6, 407, 2)[..., None]), a)
    return _save(a, path)


def leaves(path):
    """窗外行道樹的葉子（透明底 RGBA，只給渲染用：陽光穿過去，地上有樹影）"""
    W, H = 1024, 512; rng = np.random.RandomState(411)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); can = np.zeros((H, W), np.float32)
    for k in range(40):
        cx, cy, r = rng.randint(0, W), rng.randint(0, int(H * 0.8)), rng.randint(40, 110)
        can = np.maximum(can, np.clip(1 - ((xx - cx) ** 2 + ((yy - cy) * 1.2) ** 2) / r ** 2, 0, 1))
    n = _noise(H, W, 6, 412, 3); n2 = _noise(H, W, 2, 413, 2)
    a = ((can * (0.55 + 0.7 * n) + 0.25 * (n2 - 0.5)) > 0.5).astype(np.float32)
    col = np.array([70, 104, 46], np.float32) * (0.75 + 0.5 * n[..., None])
    for x in (180, 560, 900): a[int(H * .55):, x:x + 14] = 1; col[int(H * .55):, x:x + 14] = [86, 72, 56]
    im = np.concatenate([np.clip(col, 0, 255), (a * 255)[..., None]], -1).astype(np.uint8)
    Image.fromarray(im, 'RGBA').save(path); return path


def build_all(outdir):
    os.makedirs(outdir, exist_ok=True); p = lambda n: os.path.join(outdir, n)
    return dict(floor=floor(p('cvs_floor.png'), p('cvs_floor_rough.png')), ceil=ceiling(p('cvs_ceil.png')), wood=wood(p('cvs_wood.png')),
                prints=prints(p('cvs_print.png')), goods=goods(p('cvs_goods.png')), cooler=cooler(p('cvs_cooler.png')), screen=screen(p('cvs_screen.png')),
                decal=decals(p('cvs_decal.png')), outside=outside(p('cvs_outside.png')), leaves=leaves(p('cvs_leaves.png')))


if __name__ == '__main__':
    import sys
    print(build_all(sys.argv[1])); print(CELLS); print(GCELLS)
