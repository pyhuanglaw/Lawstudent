"""美國交換：法學院圖書館（SCN-US-LIB）的程式貼圖（PIL 畫的，不是照片、不是外部素材）。LAWWW2-C 2026-10-18。
  python3 tools/blender/env_second/us_lawlib_tex.py → tools/blender/env_second/textures/gen/usll_*.png
- usll_shelf_face.png（512×1024＝一面書架 1.2 m 寬 × 2.2 m 高）：六層、淺橡木層板＋側板；書是美國法學圖書館常見的一整套判例彙編、法典——
  同一套同一個顏色（棕褐、深紅、黑、深藍、深綠、酒紅），書背上兩條燙金線、一塊黑色標籤（**沒有字**：不放真的書名、出版社，D77）。
- usll_stained.png（512×512＝一組窗 3.4 m × 2.9 m）：藍綠色為主的彩色鉛條玻璃（照片二），幾塊淺色、少數琥珀色；深灰鉛條。
- usll_sign.png（256×128）：樓梯口紅絨繩旁的小立牌——圖示（樓梯＋禁止的斜線），沒有字（說明文字由 AA 寫，遊戲用互動的說明）。"""
import os, random
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen')
rng = random.Random(20261018)


def hexrgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def jit(c, k=10): return tuple(max(0, min(255, v + rng.randint(-k, k))) for v in c)


def shelf_face():
    W, H = 512, 1024; im = Image.new('RGB', (W, H), hexrgb('#3a332b')); d = ImageDraw.Draw(im)
    oak = hexrgb('#c9b083'); oak_d = hexrgb('#a88f62')
    levels = 6; side = 14; top = 18; base = 60; board = 16
    lh = (H - top - base - board * levels) / levels
    SETS = ['#9c7a48', '#b8925a', '#6e1f1f', '#1e1e1e', '#1f2f4f', '#1f3d2f', '#5a1a24', '#7a5a2e', '#2d2d33']
    for lv in range(levels):
        y1 = H - base - lv * (lh + board); y0 = y1 - lh; x = side + 2
        d.rectangle([0, y1, W, y1 + board], fill=oak); d.line([0, y1 + board - 2, W, y1 + board - 2], fill=oak_d, width=2)
        d.rectangle([side, y0, W - side, y1], fill=hexrgb('#1a1612'))                                     # 書架裡面（暗）
        while x < W - side - 6:
            col = hexrgb(rng.choice(SETS)); n = rng.randint(6, 18); bw = rng.randint(17, 24); bh = int(lh * rng.uniform(0.80, 0.93))
            gap = rng.random() < 0.18
            for k in range(n):
                if x + bw > W - side - 2: break
                c = jit(col, 8); yy = y1 - bh
                d.rectangle([x, yy, x + bw - 2, y1], fill=c)
                d.line([x, yy, x, y1], fill=tuple(min(255, v + 25) for v in c), width=1)
                d.line([x + bw - 3, yy, x + bw - 3, y1], fill=tuple(max(0, v - 30) for v in c), width=1)
                gold = (196, 160, 82) if sum(col) > 120 else (205, 170, 95)
                for gy in (yy + int(bh * 0.10), yy + int(bh * 0.16), yy + int(bh * 0.80)): d.line([x + 1, gy, x + bw - 4, gy], fill=gold, width=2)
                d.rectangle([x + 3, yy + int(bh * 0.22), x + bw - 6, yy + int(bh * 0.36)], fill=(28, 26, 24))   # 黑色標籤（沒有字）
                d.line([x + 5, yy + int(bh * 0.27), x + bw - 8, yy + int(bh * 0.27)], fill=gold, width=1)
                d.line([x + 5, yy + int(bh * 0.31), x + bw - 8, yy + int(bh * 0.31)], fill=gold, width=1)
                x += bw
            if gap: x += rng.randint(20, 46)
            else: x += rng.randint(0, 3)
    d.rectangle([0, 0, side, H], fill=oak); d.rectangle([W - side, 0, W, H], fill=oak); d.rectangle([0, 0, W, top], fill=oak)
    d.rectangle([0, H - base, W, H], fill=hexrgb('#b39c70'))                                                   # 踢腳
    im = im.filter(ImageFilter.GaussianBlur(0.4)); im.save(os.path.join(GEN, 'usll_shelf_face.png'))


def stained():
    W = H = 512; im = Image.new('RGB', (W, H), (40, 44, 46)); d = ImageDraw.Draw(im)
    BLUES = ['#2f6f9a', '#3f86b0', '#1f5a86', '#4a9ab8', '#2a7a8a', '#3d8f7a', '#5aa58a', '#2f7d6a', '#6fb3c2', '#8cc6cf']
    PALE = ['#c9e0e2', '#d8e8e4', '#b9d6d8']; AMBER = ['#d9a441', '#c98a32']
    cols, rows = 6, 7; cw, rh = W / cols, H / rows
    for j in range(rows):
        for i in range(cols):
            r = rng.random(); c = hexrgb(rng.choice(AMBER if r < 0.04 else PALE if r < 0.22 else BLUES))
            x0, y0 = int(i * cw) + 3, int(j * rh) + 3; x1, y1 = int((i + 1) * cw) - 3, int((j + 1) * rh) - 3
            if rng.random() < 0.35:                                                                        # 有些格子再切一刀（斜的或橫的）
                if rng.random() < 0.5:
                    ym = rng.randint(y0 + 10, y1 - 10); d.rectangle([x0, y0, x1, ym - 2], fill=jit(c, 18)); d.rectangle([x0, ym + 2, x1, y1], fill=jit(hexrgb(rng.choice(BLUES)), 18))
                else:
                    d.polygon([(x0, y0), (x1, y0), (x0, y1)], fill=jit(c, 18)); d.polygon([(x1, y0 + 4), (x1, y1), (x0 + 4, y1)], fill=jit(hexrgb(rng.choice(BLUES + PALE)), 18))
            else: d.rectangle([x0, y0, x1, y1], fill=jit(c, 18))
    for i in range(cols + 1): d.line([i * cw, 0, i * cw, H], fill=(38, 40, 42), width=5)
    for j in range(rows + 1): d.line([0, j * rh, W, j * rh], fill=(38, 40, 42), width=5)
    im = im.filter(ImageFilter.GaussianBlur(0.6)); im.save(os.path.join(GEN, 'usll_stained.png'))


def sign():
    W, H = 256, 128; im = Image.new('RGB', (W, H), hexrgb('#f2efe6')); d = ImageDraw.Draw(im)
    d.rectangle([4, 4, W - 5, H - 5], outline=hexrgb('#5a1a24'), width=4)
    for k in range(4): d.rectangle([60 + k * 28, 90 - k * 18, 60 + k * 28 + 30, 96 - k * 18 + 18], fill=hexrgb('#3a3a3a'))   # 樓梯圖示
    d.ellipse([64, 18, 188, 112], outline=hexrgb('#a8262a'), width=8); d.line([80, 100, 172, 30], fill=hexrgb('#a8262a'), width=8)
    im.save(os.path.join(GEN, 'usll_sign.png'))


if __name__ == '__main__':
    shelf_face(); stained(); sign(); print('ok')
