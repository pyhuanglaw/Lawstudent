"""三方比較圖：參考圖｜目前 VRoid 加工版（遊戲內）｜Blender 改造版（遊戲內）［｜Blender 渲染圖］，同樣的角度（正面全身、45 度、側面、背面、臉部特寫）。
遊戲內截圖來自 tools/shots/char_review.py 的輸出資料夾（<id>_front/q45/side/back/face.png）。
用法：python3 tools/shots/char_compare3.py <輸出.jpg> <參考圖資料夾（front/side/back/face.jpg）> <VRoid 版 review 資料夾> <Blender 版 review 資料夾> <人物 id> [Blender 算圖前綴]"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
OUT, REF, A, B, CID = sys.argv[1:6]; BL = sys.argv[6] if len(sys.argv) > 6 else None
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
COLS = [('front', '正面全身'), ('q45', '45 度'), ('side', '側面'), ('back', '背面'), ('face', '臉部特寫')]
H = 520
BODY_CROP = (190, 70, 530, 930)      # char_review 的 720×960 全身鏡頭：人物在中間
FACE_CROP = (150, 90, 570, 650)


def cell(path, kind):
    if not path or not os.path.exists(path): return None
    im = Image.open(path).convert('RGB')
    if kind == 'game': im = im.crop(FACE_CROP if path.endswith('_face.png') else BODY_CROP)
    elif kind == 'blender':
        w, h = im.size; im = im.crop((int(w * 0.18), 0, int(w * 0.82), h)) if 'body' in path else im
    return im.resize((max(1, int(im.width * H / im.height)), H), Image.LANCZOS)


rows = [('參考圖', [cell(os.path.join(REF, k + '.jpg'), 'ref') if k != 'q45' else None for k, _ in COLS]),
        ('目前 VRoid 加工版（遊戲內）', [cell(os.path.join(A, '%s_%s.png' % (CID, k)), 'game') for k, _ in COLS]),
        ('Blender 改造版（遊戲內）', [cell(os.path.join(B, '%s_%s.png' % (CID, k)), 'game') for k, _ in COLS])]
if BL:
    m = {'front': 'body_front', 'q45': 'body_q45', 'side': 'body_side', 'back': 'body_back', 'face': 'face_front'}
    rows.append(('Blender 渲染圖（EEVEE，bind pose）', [cell('%s_%s.png' % (BL, m[k]), 'blender') for k, _ in COLS]))
CW = [max((r[1][i].width if r[1][i] else 0) for r in rows) or 200 for i in range(len(COLS))]
LW = 230; f = ImageFont.truetype(FONT, 24); fs = ImageFont.truetype(FONT, 20)
c = Image.new('RGB', (LW + sum(CW) + 8 * len(COLS), 40 + len(rows) * (H + 8)), (245, 242, 236)); d = ImageDraw.Draw(c)
x = LW
for i, (k, lb) in enumerate(COLS): d.text((x + 6, 8), lb, fill=(30, 30, 30), font=f); x += CW[i] + 8
for r, (lb, cells) in enumerate(rows):
    y = 40 + r * (H + 8); d.text((8, y + 10), lb, fill=(30, 30, 30), font=fs)
    x = LW
    for i, im in enumerate(cells):
        if im: c.paste(im, (x + (CW[i] - im.width) // 2, y))
        else: d.text((x + 10, y + H // 2), '（沒有這個角度）', fill=(150, 150, 150), font=fs)
        x += CW[i] + 8
c.save(OUT, quality=86); print('saved', OUT, c.size)
