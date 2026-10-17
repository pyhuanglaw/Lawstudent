"""美國校門前主街（SCN-US-02）的招牌貼圖（PIL）。LAWWW2-C 2026-10-17。
  python3 tools/blender/env_second/us_street_tex.py → tools/blender/env_second/textures/gen/ust_signs.png
ust_signs.png（1024×1024，16 列×64 px）：店家招牌，**店名全部虛構**（D77），每列一家，底色、字型、框線不同（老街的手寫感招牌、木招牌、霓虹邊框）；
  第 15 列＝路名牌（E Kirkwood Ave、N Indiana Ave：真的路名，綠底白字）。字型 DejaVu（Bitstream Vera 授權）畫成點陣圖。"""
import json, os, random
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GEN = os.path.join(HERE, 'textures', 'gen')
F = '/usr/share/fonts/truetype/dejavu/'
STY = [((40, 74, 52), (246, 236, 210), 'DejaVuSerif-Bold.ttf'), ((24, 26, 30), (236, 196, 96), 'DejaVuSerif-Bold.ttf'), ((122, 31, 36), (250, 242, 228), 'DejaVuSans-Bold.ttf'),
       ((232, 224, 206), (60, 40, 30), 'DejaVuSerif-Bold.ttf'), ((31, 47, 79), (246, 246, 240), 'DejaVuSans-Bold.ttf'), ((96, 64, 40), (246, 230, 196), 'DejaVuSerif-Bold.ttf'),
       ((236, 236, 230), (30, 30, 34), 'DejaVuSans-Bold.ttf'), ((200, 138, 42), (36, 28, 20), 'DejaVuSans-Bold.ttf')]


def tex_signs(path, names):
    W, RH = 1024, 64; im = Image.new('RGB', (W, RH * 16)); d = ImageDraw.Draw(im); r = random.Random(9)
    for i, name in enumerate(names[:15]):
        bg, fg, font = STY[i % len(STY)]; y0 = i * RH
        d.rectangle([0, y0, W, y0 + RH - 1], fill=bg); d.rectangle([4, y0 + 4, W - 5, y0 + RH - 5], outline=fg, width=2)
        size = 40
        while True:
            fnt = ImageFont.truetype(F + font, size); tw = d.textlength(name, font=fnt)
            if tw < W - 60 or size < 18: break
            size -= 2
        d.text(((W - tw) / 2, y0 + (RH - size) / 2 - 4), name, font=fnt, fill=fg)
    y0 = 15 * RH; d.rectangle([0, y0, W, y0 + RH], fill=(18, 96, 60))
    fnt = ImageFont.truetype(F + 'DejaVuSans-Bold.ttf', 36)
    for k, t in enumerate(('E Kirkwood Ave', 'N Indiana Ave')):
        x0 = k * 512; d.rectangle([x0 + 3, y0 + 3, x0 + 508, y0 + RH - 4], outline=(246, 246, 240), width=2); tw = d.textlength(t, font=fnt); d.text((x0 + (512 - tw) / 2, y0 + 10), t, font=fnt, fill=(246, 246, 240))
    im.save(path)


if __name__ == '__main__':
    L = json.load(open(os.path.join(ROOT, 'assets/models/env/second_ai/us_street.layout.json'), encoding='utf-8'))
    tex_signs(os.path.join(GEN, 'ust_signs.png'), [b['shop'] for b in L['buildings']]); print('ok')
