# CC-C 11-04：用 cards.json 的螢幕框裁切窗卡截圖、算平均亮度（白天／晚上／晚上設黑）。用法：python3 -I cc_card_luma.py <out 目錄>
import json, sys, os
from PIL import Image, ImageStat
D = sys.argv[1]
cards = json.load(open(os.path.join(D, 'cards.json')))
night = cards.get('night', {})
names = sorted(cards['day']['cards'].keys())
print('卡片 | 白天 | 晚上 | 晚上設黑 | 黑-晚 差')
for n in names:
    vals = []
    for tag, part in (('day', 'day'), ('night', 'night'), ('night_black', 'night')):
        fn = os.path.join(D, f'card_{n}_{tag}.png')
        if not os.path.exists(fn): vals.append(None); continue
        im = Image.open(fn).convert('L')
        c = cards.get(part, {}).get('cards', {}).get(n, {})
        scr = c.get('screen')
        vp = cards.get(part, {}).get('viewport') or [im.width, im.height]
        if scr and im.width > 200:
            sx = im.width / vp[0]; sy = im.height / vp[1]
            xs = [p[0]*sx for p in scr]; ys = [p[1]*sy for p in scr]
            box = (max(0,int(min(xs))), max(0,int(min(ys))), min(im.width,int(max(xs))), min(im.height,int(max(ys))))
            if box[2] > box[0] and box[3] > box[1]:
                im = im.crop(box)
        vals.append(round(ImageStat.Stat(im).mean[0], 1))
    d = None if None in vals[1:] else round(vals[2]-vals[1], 1)
    print(f'{n} | {vals[0]} | {vals[1]} | {vals[2]} | {d}')
