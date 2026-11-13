"""並排對照圖（SHOP-REALISM-1112，LAWWW2-C 11-13）：最上面一列參考圖，下面每列「改之前｜新版」同鏡頭。
用法：python3 tools/blender/env_second/shots/cmp_sheet.py <輸出.jpg> <參考圖> <參考圖標題> <改之前1.jpg> <新版1.jpg> <標題1> [<改之前2> <新版2> <標題2> ...]
截圖用 shots/fast_shots.py 拍（同一份鏡頭設定拍兩次：換模型前一次、換模型後一次）。"""
import sys
from PIL import Image, ImageDraw, ImageFont
out, ref, reftitle, rest = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
assert len(rest) % 3 == 0, '改之前／新版／標題 三個一組'
try: fnt = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 26)
except Exception: fnt = ImageFont.truetype('/usr/share/fonts/opentype/unifont/unifont.otf', 28)
W = 640
def rs(f, w=W): i = Image.open(f).convert('RGB'); return i.resize((w, int(i.height * w / i.width)))
def lab(d, x, t): d.rectangle([x, 0, x + 12 + len(t) * 28, 38], fill='black'); d.text((x + 6, 4), t, font=fnt, fill='white')
rows = []
R = rs(ref, W * 2); r = Image.new('RGB', (W * 2, R.height)); r.paste(R, (0, 0)); lab(ImageDraw.Draw(r), 0, reftitle); rows.append(r)
for k in range(0, len(rest), 3):
    A, B = rs(rest[k]), rs(rest[k + 1]); r = Image.new('RGB', (W * 2, max(A.height, B.height))); r.paste(A, (0, 0)); r.paste(B, (W, 0)); d = ImageDraw.Draw(r)
    lab(d, 0, '改之前 ' + rest[k + 2]); lab(d, W, '新版 ' + rest[k + 2]); rows.append(r)
o = Image.new('RGB', (W * 2, sum(x.height for x in rows))); y = 0
for x in rows: o.paste(x, (0, y)); y += x.height
o.save(out, quality=85); print(out, o.size)
