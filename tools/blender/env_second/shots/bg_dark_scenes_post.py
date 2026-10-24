"""BG-DARK-SCENES-1024（LAWWW-B 12:57 派工）：劇情對話會變成黑底的場景，從遊戲的 3D 拍成 2D 背景（1672×941，和 assets/bg 現有的同規格），這支做最後的調光、存成 webp。
LAWWW2-B 2026-10-24。用法：python3 tools/blender/env_second/shots/bg_dark_scenes_post.py <拍好的 PNG 資料夾> <輸出資料夾>
拍法（遊戲畫面，Playwright＋SwiftShader；藏起玩家和路人，垂直視角 50°）見 test_shots/bg_dark_scenes_1024/README.md。
只改光，不加東西，除了醉月湖：
  - cafe_closed：晚上拍（窗外是暗的＝像拉下窗簾），吧檯以外壓暗（台詞：打烊的兩點半，只開吧檯燈）；
  - us_shared_kitchen：廚房那一帶留亮、客廳和四周壓暗（台詞：廚房只開了一盞燈）；
  - zuiyue_night：遊戲裡的湖心亭晚上沒有燈、湖面是深綠色看不出是水（台詞：湖心亭的燈映在水上）——
    補三盞亭子的燈、燈和對面博雅亮窗在水面的倒影、水面往深藍調一點。這是在 3D 截圖上補畫的，不是遊戲裡的樣子（3D 湖心亭加燈另外回報）。"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1672, 941
os.makedirs(OUT, exist_ok=True)


def ellipse_mask(cx, cy, rx, ry, blur):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))


def relight(im, mask, outside):
    """mask 亮的地方照舊、暗的地方乘 outside（0–1）"""
    dark = Image.eval(im, lambda v: int(v * outside))
    return Image.composite(im, dark, mask)


def glow(base, pts, col, r_core, r_halo, a_halo):
    lay = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(lay)
    for (x, y) in pts:
        for k in range(12, 0, -1):
            rr = r_halo * k / 12; a = a_halo * (1 - k / 12) ** 1.6
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=tuple(int(c * a) for c in col))
    lay = lay.filter(ImageFilter.GaussianBlur(r_halo * 0.25))
    out = ImageChops.screen(base, lay); d2 = ImageDraw.Draw(out)
    for (x, y) in pts:   # 燈本身（紅燈籠：外面紅、中間亮）
        d2.ellipse([x - r_core * 0.75, y - r_core, x + r_core * 0.75, y + r_core], fill=(214, 72, 40))
        d2.ellipse([x - r_core * 0.4, y - r_core * 0.55, x + r_core * 0.4, y + r_core * 0.55], fill=(255, 214, 150))
        d2.rectangle([x - 1, y - r_core - 9, x + 1, y - r_core], fill=(40, 20, 16))
    return out


def reflections(base, cols, y0, y1, alpha, width):
    """水面的倒影：每一條是 (x, 顏色)；往下拉長、橫向一點點波紋"""
    lay = Image.new('RGB', (W, H), (0, 0, 0)); d = ImageDraw.Draw(lay)
    for (x, col) in cols:
        for k, y in enumerate(range(y0, y1, 6)):
            f = alpha * (1 - (y - y0) / (y1 - y0)) ** 1.3; wv = width * (0.6 + 0.4 * ((k * 37) % 7) / 6)
            d.rectangle([x - wv, y, x + wv, y + 3], fill=tuple(int(c * f) for c in col))
    lay = lay.filter(ImageFilter.GaussianBlur(3))
    return ImageChops.screen(base, lay)


def save(im, name):
    p = os.path.join(OUT, name + '.webp'); im.convert('RGB').save(p, 'WEBP', quality=86, method=6); print('wrote', p, os.path.getsize(p))


def load(name): return Image.open(os.path.join(SRC, name + '.png')).convert('RGB').resize((W, H))


# 不用調的四張
for n, src in (('cafe', 'cafe'), ('cafe_window', 'cafe_window'), ('cafe_night', 'cafe_night_v2'), ('alley_conv_night', 'alley_conv_night'), ('law_library', 'law_library_s')):
    save(load(src), n)

# 打烊的兩點半：吧檯一帶留亮，其他乘 0.32，整體稍微偏暖
im = load('cafe_closed_base')
im = relight(im, ellipse_mask(int(W * 0.66), int(H * 0.53), int(W * 0.40), int(H * 0.30), 90), 0.32)
save(im, 'cafe_closed')

# C 棟 208 的廚房：只開一盞燈
im = load('us_shared_kitchen_v2')
im = relight(im, ellipse_mask(int(W * 0.49), int(H * 0.46), int(W * 0.30), int(H * 0.40), 110), 0.45)
save(im, 'us_shared_kitchen')

# 醉月湖：水面偏深藍、亭子三盞燈、燈和博雅亮窗的倒影
im = load('zuiyue_night_b_v2')
water = Image.new('L', (W, H), 0); ImageDraw.Draw(water).rectangle([0, 600, W, H], fill=255); water = water.filter(ImageFilter.GaussianBlur(18))
r, g, b = im.split(); tinted = Image.merge('RGB', (r.point(lambda v: int(v * 0.80)), g.point(lambda v: int(v * 0.84)), b.point(lambda v: min(255, int(v * 1.35 + 6)))))
im = Image.composite(tinted, im, water)
LAMPS = [(590, 356), (858, 374), (1062, 352)]
im = reflections(im, [(x, (255, 176, 96)) for x, _ in LAMPS] + [(x, (230, 150, 80)) for x in (90, 200, 330, 450)], 640, 900, 0.55, 9)
im = glow(im, LAMPS, (255, 190, 110), 11, 95, 0.75)
save(im, 'zuiyue_night')
