"""CC（帳號 A）11-11：機車第三版（BB 00:07）拼圖——三版（新 11161c101／第二版 fd4dd9aef／使用者抱怨的 c17a9919e）同機位上下並排，
兩側車列放大 ×3（從路中間往北／往南那兩張裁左右下方），飲料店前那一群近拍。
用法：python3 cc_sc3_compose.py <新 out> <v2 out> <v1 out> <輸出資料夾> [hh=1400]
  out 裡是 cc_tingzhou_probe SHOTS FULLALL=1 SCOOTV=1 存的 tzf_<hh>_<機位>.jpg"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
NEW, V2, V1, OUT = sys.argv[1:5]; HH = sys.argv[5] if len(sys.argv) > 5 else '1400'; os.makedirs(OUT, exist_ok=True)
FONT = next((f for f in ['/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if os.path.exists(f)), None)
F = ImageFont.truetype(FONT, 22) if FONT else ImageFont.load_default()
VERS = [('新 11161c101（第三版）', NEW), ('舊 fd4dd9aef（第二版）', V2), ('舊 c17a9919e（使用者抱怨的那一版）', V1)]
W = 840


def load(d, view, crop=None, scale=1):
    p = os.path.join(d, 'tzf_%s_%s.jpg' % (HH, view))
    if not os.path.exists(p): return None
    im = Image.open(p).convert('RGB')
    if crop: w, h = im.size; im = im.crop((int(w * crop[0]), int(h * crop[1]), int(w * crop[2]), int(h * crop[3])))
    return im.resize((W, int(im.height * W / im.width)))


def lab(im, t):
    if im is None:
        im = Image.new('RGB', (W, 300), (40, 40, 40)); ImageDraw.Draw(im).text((10, 140), '（沒有）' + t, fill=(220, 220, 220), font=F); return im
    d = ImageDraw.Draw(im); d.rectangle((0, 0, W, 30), fill=(0, 0, 0)); d.text((6, 3), t, fill=(255, 255, 255), font=F); return im


def sheet(cols, fn, title):
    """cols：[(欄標題, (view, crop))]；每欄三版上下"""
    tiles = [[lab(load(d, v, c), '%s %s %s' % (vn, HH, t)) for vn, d in VERS] for t, (v, c) in cols]
    hs = [max(col[r].height for col in tiles) for r in range(3)]
    out = Image.new('RGB', (W * len(cols), sum(hs) + 40), (0, 0, 0)); ImageDraw.Draw(out).text((8, 6), title, fill=(255, 255, 255), font=F)
    for i, col in enumerate(tiles):
        y = 40
        for r, t in enumerate(col): out.paste(t, (i * W, y)); y += hs[r]
    out.save(os.path.join(OUT, fn), quality=84); print('寫', fn, out.size)


sheet([('路中間往北', ('路中間往北', None)), ('路中間往南', ('路中間往南', None)), ('概念圖機位', ('概念圖機位', None)), ('水源市場前', ('水源市場前', None))],
      'sc3_views_%s.jpg' % HH, '汀州路路邊機車：三版同機位上下並排（%s）' % HH)
sheet([('往北 左側 ×3', ('路中間往北', (0.0, 0.45, 0.333, 0.80))), ('往北 右側 ×3', ('路中間往北', (0.667, 0.45, 1.0, 0.80))),
       ('往南 左側 ×3', ('路中間往南', (0.0, 0.45, 0.333, 0.80))), ('往南 右側 ×3', ('路中間往南', (0.667, 0.45, 1.0, 0.80)))],
      'sc3_sides_x3_%s.jpg' % HH, '汀州路路邊機車：兩側車列放大 ×3（三版同機位，%s）' % HH)
sheet([('飲料店前 近拍', ('飲料店前機車近拍', None)), ('飲料店前 正看', ('飲料店前機車正看', None))],
      'sc3_drink_%s.jpg' % HH, '汀州路飲料店（手搖飲 w_tea）前那一群：三版同機位（%s）' % HH)
