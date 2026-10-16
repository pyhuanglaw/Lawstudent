"""修改前／修改後的同鏡頭對照表（精修每一批的驗收圖；LAWWW2-B 2026-10-16）。
用法：python3 tools/shots/compare_sheet.py --before <資料夾> --after <資料夾> --name <檔名前綴，例如 player_def> --shots front,q45,face,walk,sit
       [--ref <參考圖> --ref-crop x0,y0,x1,y1] [--title 標題] --out <輸出.png>
每一列一個鏡頭：左＝修改前、右＝修改後（同一個 char_review.py 鏡頭），最左邊可以放 2D 參考圖。"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def main():
    ap = argparse.ArgumentParser()
    for k in ('--before', '--after', '--name', '--out'): ap.add_argument(k, required=True)
    ap.add_argument('--shots', default='front,q45,face,walk,sit'); ap.add_argument('--ref'); ap.add_argument('--ref-crop'); ap.add_argument('--title', default='')
    ap.add_argument('--tile', type=int, default=480)
    a = ap.parse_args(); T = a.tile; shots = a.shots.split(','); f = ImageFont.truetype(FONT, 22); ft = ImageFont.truetype(FONT, 28)
    refw = 0; ref = None
    if a.ref:
        ref = Image.open(a.ref).convert('RGB')
        if a.ref_crop: ref = ref.crop(tuple(int(x) for x in a.ref_crop.split(',')))
        refw = int(ref.width * (T * min(len(shots), 3)) / ref.height); ref = ref.resize((refw, T * min(len(shots), 3)), Image.LANCZOS)
    top = 80; W = refw + 2 * T + (20 if ref else 0); H = top + T * len(shots)
    sheet = Image.new('RGB', (W, H), (24, 24, 24)); d = ImageDraw.Draw(sheet)
    d.text((14, 8), a.title, fill=(255, 255, 255), font=ft)
    x0 = refw + (20 if ref else 0)
    d.text((x0 + 10, 48), '修改前', fill=(255, 200, 120), font=f); d.text((x0 + T + 10, 48), '修改後', fill=(140, 230, 140), font=f)
    if ref: sheet.paste(ref, (0, top)); d.text((10, top + 6), '2D 參考圖', fill=(255, 255, 255), font=f)
    for i, s in enumerate(shots):
        for j, src in enumerate((a.before, a.after)):
            p = os.path.join(src, f'{a.name}_{s}.png')
            if os.path.exists(p): sheet.paste(Image.open(p).convert('RGB').resize((T, T), Image.LANCZOS), (x0 + j * T, top + i * T))
            else: d.text((x0 + j * T + 20, top + i * T + 20), '（沒有這張）', fill=(200, 80, 80), font=f)
        d.text((x0 + 8, top + i * T + 6), s, fill=(255, 255, 255), font=f)
    sheet.save(a.out, quality=90); print('saved', a.out, sheet.size)


if __name__ == '__main__':
    main()
