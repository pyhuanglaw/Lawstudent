"""第一版／第二版並排比較圖（左 v1、右 v2；每個鏡頭一列）。
用法：python3 tools/blender/env_second/aa_support/compare_v1_v2.py mokuyobi front diag45 close sofa bookcase"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
D = 'docs/story_planning/ref_images/model_renders'; shop, views = sys.argv[1], sys.argv[2:]
F = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 22); W, H = 640, 400
out = Image.new('RGB', (W * 2 + 30, (H + 34) * len(views) + 10), '#f4efe4'); d = ImageDraw.Draw(out)
for i, v in enumerate(views):
    y = 10 + i * (H + 34)
    for j, tag in enumerate(('', '_v2')):
        im = Image.open(os.path.join(D, f'{shop}{tag}_{v}.png')).convert('RGB').resize((W, H), Image.LANCZOS)
        out.paste(im, (10 + j * (W + 10), y + 30)); d.text((14 + j * (W + 10), y + 2), f'{shop} {v}　{"第一版" if not tag else "第二版"}', font=F, fill='#3a2c22')
out.save(os.path.join(D, f'{shop}_v1_v2_compare.png')); print('ok', shop)
