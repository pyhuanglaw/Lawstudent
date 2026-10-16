"""新體育館 1F 多功能球場的地板與看板貼圖（BB_151，LAWWW2-B 2026-10-16）：本作程式畫。
- gym_floor.jpg：40 m × 30 m 的楓木運動地板（2048×1536，約 51 px/m）＋球場線
  - 羽球場 6 面（白線；雙打 13.40×6.10 m、單打邊線往內 0.46 m、前發球線離網 1.98 m、雙打後發球線離底線 0.76 m、中線）
  - 籃球場 1 面（深藍線；28×15 m 橫放在中間：中線、中圈、三分線 6.75 m、禁區 4.9×5.8 m、罰球圈）
- gym_hours.png：開館時間牌（BB_151 4b：週一～五 8:00～22:00、週六 9:00～22:00、週日 9:00～18:00；每月第四個週一健身中心、游泳池休館）。不寫校名、館名（D77）
- gym_score.png：記分板面板（沒有品牌）
座標和 gym_layout.js 一致：球場地板 x −20～20、z −19～11（區域座標）。
用法：python3 tools/blender/env_second/gym_tex.py"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); GEN = os.path.join(HERE, 'textures', 'gen')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def f(sz): return ImageFont.truetype(FONT, sz)
X0, X1, Z0, Z1 = -20.0, 20.0, -19.0, 11.0
PW, PH = 2048, 1536
sx = PW / (X1 - X0); sz = PH / (Z1 - Z0)
def P(x, z): return ((x - X0) * sx, (z - Z0) * sz)          # 貼圖 v 往下＝ z 往南（+z）；Blender 端照這個對 UV

BADMINTON = [(-8.6, -11.2), (0.0, -11.2), (8.6, -11.2), (-8.6, 3.2), (0.0, 3.2), (8.6, 3.2)]   # 羽球場中心（長邊沿 z）
BASKET = (0.0, -4.0)                                                                          # 籃球場中心（長邊沿 x）


def floor():
    rng = np.random.default_rng(151)
    base = np.array([214, 168, 112], np.float32)
    a = np.zeros((PH, PW, 3), np.float32) + base
    strip = int(0.6 * sx)                                                     # 0.6 m 一段的木條（顏色差一點）
    for i in range(0, PW, strip): a[:, i:i + strip] *= rng.uniform(0.97, 1.03)
    for j in range(0, PH, int(0.057 * sz) or 2): a[j:j + 1] *= 0.94          # 木條的接縫（沿 x 的細線）
    grain = rng.normal(0, 1, (PH, PW)).astype(np.float32); grain = np.repeat(np.repeat(grain[::1, ::6], 6, 1)[:, :PW], 1, 0)
    a += grain[..., None] * 4.0
    a = np.clip(a, 0, 255); im = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(im)
    lw = max(2, int(0.045 * sx))
    def line(p, q, col): d.line([P(*p), P(*q)], fill=col, width=lw)
    def rect(x0, z0, x1, z1, col):
        for p, q in (((x0, z0), (x1, z0)), ((x1, z0), (x1, z1)), ((x1, z1), (x0, z1)), ((x0, z1), (x0, z0))): line(p, q, col)
    def arc(cx, cz, r, a0, a1, col, n=48):
        pts = [P(cx + r * math.cos(a0 + (a1 - a0) * k / n), cz + r * math.sin(a0 + (a1 - a0) * k / n)) for k in range(n + 1)]; d.line(pts, fill=col, width=lw)
    # 籃球場（深藍，先畫：羽球的白線蓋在上面）
    B = (40, 66, 122); bx, bz = BASKET; L, Wd = 28.0, 15.0
    rect(bx - L / 2, bz - Wd / 2, bx + L / 2, bz + Wd / 2, B); line((bx, bz - Wd / 2), (bx, bz + Wd / 2), B); arc(bx, bz, 1.8, 0, 2 * math.pi, B)
    for s in (-1, 1):
        ex = bx + s * L / 2; hx = ex - s * 1.575                                     # 籃框中心
        rect(min(ex, ex - s * 5.8), bz - 2.45, max(ex, ex - s * 5.8), bz + 2.45, B)   # 禁區
        arc(ex - s * 5.8, bz, 1.8, -math.pi / 2, math.pi / 2, B) if s < 0 else arc(ex - s * 5.8, bz, 1.8, math.pi / 2, 3 * math.pi / 2, B)
        line((ex, bz - 6.6), (ex - s * 2.99, bz - 6.6), B); line((ex, bz + 6.6), (ex - s * 2.99, bz + 6.6), B)
        a0 = math.asin(6.6 / 6.75)
        if s < 0: arc(hx, bz, 6.75, -a0, a0, B)
        else: arc(hx, bz, 6.75, math.pi - a0, math.pi + a0, B)
    # 羽球場（白）
    Wt = (246, 246, 240)
    for (cx, cz) in BADMINTON:
        x0, x1, z0, z1 = cx - 3.05, cx + 3.05, cz - 6.7, cz + 6.7
        rect(x0, z0, x1, z1, Wt)
        for xx in (x0 + 0.46, x1 - 0.46): line((xx, z0), (xx, z1), Wt)               # 單打邊線
        for s in (-1, 1):
            line((x0, cz + s * 1.98), (x1, cz + s * 1.98), Wt)                       # 前發球線
            line((x0, cz + s * (6.7 - 0.76)), (x1, cz + s * (6.7 - 0.76)), Wt)       # 雙打後發球線
            line((cx, cz + s * 1.98), (cx, cz + s * 6.7), Wt)                        # 中線
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    # 亮漆的反光（中間亮、靠牆暗一點）
    v = np.asarray(im).astype(np.float32); yy, xx = np.mgrid[0:PH, 0:PW]; r = np.hypot((xx - PW / 2) / PW, (yy - PH / 2) / PH)
    v *= (1.04 - 0.12 * r)[..., None]; Image.fromarray(np.clip(v, 0, 255).astype(np.uint8)).save(os.path.join(GEN, 'gym_floor.jpg'), quality=88)


def hours():
    W, H = 700, 520; im = Image.new('RGB', (W, H), (34, 58, 92)); d = ImageDraw.Draw(im)
    d.rectangle([16, 16, W - 16, H - 16], outline=(220, 228, 240), width=3)
    d.text((48, 40), '開 館 時 間', font=f(48), fill=(255, 255, 255))
    rows = [('週一～週五', '08:00～22:00'), ('週六', '09:00～22:00'), ('週日', '09:00～18:00')]
    for i, (a, b) in enumerate(rows): d.text((60, 140 + i * 62), a, font=f(36), fill=(230, 236, 246)); d.text((350, 140 + i * 62), b, font=f(36), fill=(255, 220, 120))
    d.text((60, 345), '每月第四個週一', font=f(30), fill=(230, 236, 246)); d.text((60, 385), '健身中心、游泳池休館', font=f(30), fill=(230, 236, 246))
    d.text((60, 440), '進場請出示學生證・請穿室內運動鞋', font=f(26), fill=(190, 200, 216))
    im.save(os.path.join(GEN, 'gym_hours.png'))


def score():
    W, H = 1024, 384; im = Image.new('RGB', (W, H), (18, 18, 20)); d = ImageDraw.Draw(im)
    d.rectangle([8, 8, W - 8, H - 8], outline=(70, 70, 76), width=6)
    d.text((80, 30), 'HOME', font=f(54), fill=(240, 240, 240)); d.text((W - 300, 30), 'GUEST', font=f(54), fill=(240, 240, 240))
    for x0 in (60, W - 330):
        for k, ch in enumerate('00'): d.rectangle([x0 + k * 130, 110, x0 + k * 130 + 110, 300], fill=(40, 12, 10)); d.text((x0 + k * 130 + 12, 120), ch, font=f(160), fill=(255, 70, 40))
    d.rectangle([W / 2 - 110, 120, W / 2 + 110, 230], fill=(40, 30, 8)); d.text((W / 2 - 100, 125), '10:00', font=f(80), fill=(255, 200, 60))
    d.text((W / 2 - 60, 260), 'PERIOD 1', font=f(34), fill=(200, 200, 200))
    im.save(os.path.join(GEN, 'gym_score.png'))


if __name__ == '__main__':
    floor(); hours(); score(); print('saved gym textures')
