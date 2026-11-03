"""好拍運動（羽球、桌球、網球用品店）室內的自製貼圖（CC，帳號 A 的建模子代理，2026-11-03）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/haopai_tex.py
輸出到 tools/blender/env_second/textures/gen/：
  haopai_alpha.png  透明貼圖集（1024²，2×2 格）：左上＝牆上的鐵網格（0.5 m 一格、10 cm 網目）、右上＝羽球拍線、左下＝網球拍線、右下＝洞洞板（桌球拍掛板）
  haopai_goods.png  商品貼圖集（1024²，4×4 格、每格 256 px）：羽球筒標籤、膠皮包裝、握把布吊卡、拍線包、桌球盒、紙箱、資料夾書背、球拍袋、
                    鞋盒、價目卡、布簾（竹葉印花）——只有色塊、線條、抽象圖案，沒有任何字、品牌、標誌（D77）
  haopai_emit.png   會亮的（512×256）：日光燈管、電視畫面（抽象的綠色球場色塊，不畫人）、櫃台螢幕、穿線機的小螢幕
  haopai_atlas.json 每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上），Blender 腳本照這份給 UV
全部是程式畫的，沒有外部圖片。"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(620)
ATL = {}


def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def uvbox(name, px0, py0, px1, py1, size):
    """像素（左上原點）→ Blender UV（左下原點）"""
    W, H = size; ATL[name] = [px0 / W, 1 - py1 / H, px1 / W, 1 - py0 / H]


def noise(w, h, k=8, amp=10):
    n = R.normal(0, 1, (h // k + 2, w // k + 2)); im = Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * 2 * amp


def grain(im, amp=6, k=6):
    a = np.asarray(im.convert('RGB'), np.float32); n = noise(im.size[0], im.size[1], k, amp)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


# ======================= 1. 透明貼圖集 =======================
A = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); d = ImageDraw.Draw(A)
# 左上：鐵網格（512 px＝0.5 m；網目 10 cm＝102.4 px；鐵絲 4 mm＝5 px，焊點稍粗）
for i in range(6):
    p = int(round(i * 102.4)); p = min(p, 509)
    d.rectangle([0, p - 2, 511, p + 2], fill=hx('#8b9094')); d.rectangle([p - 2, 0, p + 2, 511], fill=hx('#8b9094'))
    d.line([0, p - 2, 511, p - 2], fill=hx('#b4b8bb'), width=1); d.line([p - 2, 0, p - 2, 511], fill=hx('#b4b8bb'), width=1)
for i in range(6):
    for j in range(6):
        x, y = min(int(i * 102.4), 509), min(int(j * 102.4), 509); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=hx('#7e8387'))
uvbox('grid', 0, 0, 512, 512, (1024, 1024))
# 右上：羽球拍線（約 6 mm 一條；這一格＝0.24 × 0.24 m → 每 13 px 一條；線 2 px，交叉處上下交錯）
for k in range(0, 512, 13):
    d.rectangle([512 + k, 0, 512 + k + 1, 511], fill=hx('#f1efe8')); d.rectangle([512, k, 1023, k + 1], fill=hx('#e6e3da'))
for k in range(0, 512, 26):
    for m in range(0, 512, 26): d.rectangle([512 + k, m, 512 + k + 1, m + 1], fill=hx('#c9c5ba'))
uvbox('bad_str', 512, 0, 1024, 512, (1024, 1024))
# 左下：網球拍線（約 15 mm 一條；這一格＝0.36 × 0.36 m → 每 21 px；線 4 px，偏米黃）
for k in range(4, 512, 21):
    d.rectangle([k, 512, k + 3, 1023], fill=hx('#ece4c8')); d.rectangle([0, 512 + k, 511, 512 + k + 3], fill=hx('#ddd3b2'))
uvbox('ten_str', 0, 512, 512, 1024, (1024, 1024))
# 右下：洞洞板（米白烤漆板，25 mm 一個洞；這一格＝0.5 m）
pb = Image.new('RGBA', (512, 512), hx('#e9e4d8')); pd = ImageDraw.Draw(pb)
for i in range(13, 512, 26):
    for j in range(13, 512, 26): pd.ellipse([i - 4, j - 4, i + 4, j + 4], fill=(0, 0, 0, 0))
A.paste(pb, (512, 512)); uvbox('peg', 512, 512, 1024, 1024, (1024, 1024))
A.save(os.path.join(GEN, 'haopai_alpha.png'))

# ======================= 2. 商品貼圖集 =======================
G = Image.new('RGB', (1024, 1024), hx('#d8d2c4')[:3]); C = 256
cells = {}


def cell(name, i, draw):
    cx, cy = (i % 4) * C, (i // 4) * C; im = Image.new('RGB', (C, C), (200, 200, 200)); draw(im, ImageDraw.Draw(im)); G.paste(im, (cx, cy))
    uvbox(name, cx + 2, cy + 2, cx + C - 2, cy + C - 2, (1024, 1024))


def tube(col1, col2):
    def f(im, d):
        d.rectangle([0, 0, C, C], fill=hx('#f2f0ea')); d.rectangle([0, 30, C, 52], fill=hx(col1)); d.rectangle([0, 200, C, 214], fill=hx(col1))
        d.rectangle([0, 56, C, 62], fill=hx(col2))
        for k in range(3):   # 抽象的羽毛線條（不是標誌）
            x = 50 + k * 70; d.polygon([(x, 150), (x + 22, 95), (x + 44, 150)], outline=hx(col1)); d.ellipse([x + 14, 148, x + 30, 164], fill=hx(col2))
        d.rectangle([0, 0, C, 8], fill=hx('#c9c4b8')); d.rectangle([0, C - 8, C, C], fill=hx('#c9c4b8'))
    return f


def rubber(sheet, head):
    def f(im, d):
        d.rectangle([0, 0, C, C], fill=hx('#dfe3e6')); d.rectangle([0, 0, C, 54], fill=hx(head)); d.rectangle([0, 46, C, 54], fill=hx('#c8a24a'))
        d.rounded_rectangle([26, 70, C - 26, C - 20], radius=40, fill=hx(sheet))
        a = np.asarray(im, np.float32); a[70:C - 20, 26:C - 26] += noise(C - 52, C - 90, 3, 9)[..., None]
        im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
        d = ImageDraw.Draw(im); d.line([30, 66, C - 30, 190], fill=(255, 255, 255), width=3)   # 塑膠袋反光
    return f


def grip(col):
    def f(im, d):
        d.rectangle([0, 0, C, C], fill=hx('#eef0f2')); d.rectangle([0, 0, C, 40], fill=hx('#2b3a5c')); d.ellipse([C // 2 - 10, 10, C // 2 + 10, 30], fill=hx('#eef0f2'))
        for k in range(5): d.rounded_rectangle([60, 56 + k * 38, C - 60, 86 + k * 38], radius=12, fill=hx(col)); d.line([60, 62 + k * 38, C - 60, 82 + k * 38], fill=hx('#ffffff'), width=2)
    return f


def strpack(col):
    def f(im, d):
        d.rectangle([0, 0, C, C], fill=hx('#1f2530')); d.rectangle([0, 0, C, 28], fill=hx('#c9cdd2')); d.ellipse([C // 2 - 8, 8, C // 2 + 8, 22], fill=hx('#1f2530'))
        for r in range(34, 92, 6): d.ellipse([C // 2 - r, 140 - r, C // 2 + r, 140 + r], outline=hx(col), width=3)
        d.rectangle([20, 222, C - 20, 236], fill=hx('#d23a3a'))
    return f


def ballbox(ball):
    def f(im, d):
        d.rectangle([0, 0, C, C], fill=hx('#1d3f7a')); d.rectangle([0, 0, C, 22], fill=hx('#f0b32e'))
        d.rounded_rectangle([18, 60, C - 18, 200], radius=10, fill=hx('#dfe7ef'))
        for k in range(3): x = 30 + k * 70; d.ellipse([x, 90, x + 58, 148], fill=hx(ball)); d.ellipse([x + 12, 98, x + 26, 112], fill=(255, 255, 255))
        d.rectangle([0, 220, C, 232], fill=hx('#f0b32e'))
    return f


def kraft(tape):
    def f(im, d):
        base = Image.new('RGB', (C, C), hx('#b78f60')[:3]); base = grain(base, 9, 5); im.paste(base); d = ImageDraw.Draw(im)
        if tape: d.rectangle([C // 2 - 20, 0, C // 2 + 20, C], fill=hx('#c9a77c'))
        d.rectangle([24, 160, 120, 220], fill=hx('#efe9dc')); d.line([30, 175, 110, 175], fill=hx('#6a6a6a'), width=3); d.line([30, 195, 90, 195], fill=hx('#6a6a6a'), width=3)
        d.rectangle([0, 0, C - 1, C - 1], outline=hx('#9a7448'), width=4)
    return f


def binders(im, d):
    cols = ['#2f4f8a', '#c8c3b5', '#8a2f2f', '#2f6a4a', '#d8c35a', '#3a3a3a', '#c8c3b5', '#2f4f8a']
    for k, c in enumerate(cols):
        x = k * 32; d.rectangle([x, 0, x + 31, C], fill=hx(c)); d.rectangle([x + 6, 40, x + 25, 90], fill=hx('#f2efe6')); d.ellipse([x + 9, 190, x + 22, 203], fill=hx('#222222'))
        d.line([x, 0, x, C], fill=hx('#1a1a1a'), width=1)


def bagfab(im, d):
    base = Image.new('RGB', (C, C), hx('#23304f')[:3]); im.paste(grain(base, 8, 2)); d = ImageDraw.Draw(im)
    d.rectangle([0, 110, C, 128], fill=hx('#c23b3b')); d.line([0, 0, C, 0], fill=hx('#111111'), width=6)
    for k in range(0, C, 8): d.line([k, 0, k, C], fill=hx('#1c2742'), width=1)


def shoebox(im, d):
    d.rectangle([0, 0, C, C], fill=hx('#ecebe6')); d.polygon([(0, 150), (C, 90), (C, 130), (0, 190)], fill=hx('#3b6fb0')); d.rectangle([0, 0, C - 1, C - 1], outline=hx('#c8c6be'), width=4)


def tags(im, d):
    d.rectangle([0, 0, C, C], fill=hx('#f6f3ea'))
    for k in range(6): d.line([20, 30 + k * 34, 180 + (k * 37) % 50, 30 + k * 34], fill=hx('#3a3a6a'), width=4)   # 手寫的價目（只是筆畫，不是字）
    d.rectangle([0, 0, C - 1, C - 1], outline=hx('#d23a3a'), width=6)


def curtain(im, d):
    d.rectangle([0, 0, C, C], fill=hx('#ddd2b8'))
    rr = np.random.default_rng(5)
    for k in range(26):   # 竹葉印花（參考圖的布簾）
        x, y = rr.uniform(0, C), rr.uniform(0, C); a = rr.uniform(-1.2, 1.2); L_ = rr.uniform(30, 55)
        dx, dy = math.sin(a) * L_, math.cos(a) * L_; nx, ny = -dy * 0.12, dx * 0.12
        d.polygon([(x, y), (x + dx / 2 + nx, y + dy / 2 + ny), (x + dx, y + dy), (x + dx / 2 - nx, y + dy / 2 - ny)], fill=hx('#9c9878'))
    for k in range(0, C, 4): d.line([0, k, C, k], fill=hx('#d2c7ad'), width=1)


cell('tube_a', 0, tube('#22396a', '#c93a3a')); cell('tube_b', 1, tube('#2f6a3a', '#e0b030'))
cell('rub_red', 2, rubber('#c0262a', '#1f2a44')); cell('rub_blk', 3, rubber('#1b1b1d', '#7a1f22'))
cell('grip_y', 4, grip('#e8d23a')); cell('grip_p', 5, grip('#e7739b')); cell('grip_b', 6, grip('#4aa6d8')); cell('str_pack', 7, strpack('#f0f0ea'))
cell('box_org', 8, ballbox('#f08a24')); cell('kraft', 9, kraft(True)); cell('kraft2', 10, kraft(False)); cell('binders', 11, binders)
cell('bag', 12, bagfab); cell('shoebox', 13, shoebox); cell('tags', 14, tags); cell('curtain', 15, curtain)
G.save(os.path.join(GEN, 'haopai_goods.png'))

# ======================= 3. 會亮的 =======================
E = Image.new('RGB', (512, 256), (0, 0, 0)); d = ImageDraw.Draw(E)
for x in range(0, 128):   # 燈管：中間最亮
    v = int(235 + 20 * math.cos((x - 64) / 64 * math.pi / 2)); d.line([x, 0, x, 255], fill=(v, v, min(255, v + 4)))
uvbox('tube', 40, 40, 88, 216, (512, 256))
# 電視：抽象的羽球場（綠色場地、白線、深藍外框；沒有人、沒有字）
d.rectangle([128, 0, 383, 255], fill=hx('#1f3f7a')); d.rectangle([128, 0, 383, 40], fill=hx('#13284f'))
d.polygon([(168, 230), (343, 230), (310, 70), (201, 70)], fill=hx('#2f8a5a'))
for t in (0.0, 0.08, 0.5, 0.92, 1.0):
    y = 230 - t * 160; xl = 168 + (201 - 168) * t; xr = 343 - (343 - 310) * t; d.line([xl, y, xr, y], fill=(240, 240, 240), width=2)
d.line([168, 230, 201, 70], fill=(240, 240, 240), width=2); d.line([343, 230, 310, 70], fill=(240, 240, 240), width=2); d.line([255, 230, 255, 70], fill=(240, 240, 240), width=2)
d.rectangle([186, 145, 325, 150], fill=(230, 230, 230))   # 網子
d.rectangle([140, 216, 210, 232], fill=hx('#c93a3a')); d.rectangle([140, 234, 210, 246], fill=hx('#e8e8e8'))   # 比分條（只有色塊）
uvbox('tv', 130, 2, 382, 254, (512, 256))
# 櫃台螢幕：淺色表格（色塊）
d.rectangle([384, 0, 511, 127], fill=hx('#dfe8f0')); d.rectangle([384, 0, 511, 14], fill=hx('#3a6aa8'))
for k in range(6): d.rectangle([392, 24 + k * 16, 392 + 40 + (k * 23) % 70, 32 + k * 16], fill=hx('#8aa0b8'))
uvbox('pos', 386, 2, 510, 126, (512, 256))
# 穿線機的小螢幕：灰綠底、深色數字段（不是字，只是七段的色塊）
d.rectangle([384, 128, 511, 255], fill=hx('#9fb59a'))
for k in range(4): d.rectangle([396 + k * 28, 160, 416 + k * 28, 220], outline=hx('#24321f'), width=4)
uvbox('lcd', 386, 130, 510, 254, (512, 256))
E.save(os.path.join(GEN, 'haopai_emit.png'))

json.dump(ATL, open(os.path.join(GEN, 'haopai_atlas.json'), 'w'), indent=1)
print('ok', sorted(ATL))
