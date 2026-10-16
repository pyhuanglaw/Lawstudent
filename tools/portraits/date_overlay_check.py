"""約會人物圖疊到約會底圖的對照（給 BB-B 驗收站位、比例、腳踩地；LAWWW2-B 2026-10-16）。
照 BB_128 2-9 的欄位：<Dxx>_coords.json 的 comps：[姿勢, 腳底中心 x, 腳底 y, 縮放]（1920×1080 座標）；
比例：縮放 1.0 時，站姿的頭頂到腳底＝身高(cm)×3.4 px（BB_128「比例」表）。同一個人的各姿勢在原圖裡是同一個比例尺，
所以坐姿、背影也用那個人 H1（祐廷 Y1）的「像素→公分」換算。
用法：python3 tools/portraits/date_overlay_check.py --base <底圖.webp> --coords <Dxx_coords.json> --cut <assets/date 資料夾> --her heroine_01 --out <對照.png> [--all-heights]
"""
import argparse, json, os
from PIL import Image, ImageDraw, ImageFont

HEIGHT = {'player': 175, 'heroine_05': 172, 'heroine_04': 169, 'heroine_01': 166, 'kexin': 164, 'classmate_peishan': 163, 'heroine_02': 161, 'heroine_03': 159}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def place(canvas, cut, A, cid, pose, x, y, sc, mark=True):
    an = A[cid][pose]; ref = A[cid]['Y1' if cid == 'player' else 'H1']
    px = HEIGHT[cid] * 3.4 * sc / ref['h']                                   # 原圖 1 px → 底圖幾 px
    im = Image.open(os.path.join(cut, cid, pose + '.webp')).convert('RGBA'); w, h = round(im.width * px), round(im.height * px)
    im = im.resize((w, h), Image.LANCZOS); ox, oy = round(x - an['footX'] * px), round(y - an['footY'] * px)
    canvas.alpha_composite(im, (ox, oy))
    if mark:
        d = ImageDraw.Draw(canvas); d.ellipse((x - 6, y - 6, x + 6, y + 6), outline=(0, 255, 0, 255), width=3)
        for k, col in (('handY', (255, 200, 0, 255)), ('seatY', (0, 200, 255, 255))):
            if k in an: yy = oy + an[k] * px; d.line((ox, yy, ox + w, yy), fill=col, width=2)
    return (ox, oy, w, h)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--base', required=True); ap.add_argument('--coords', required=True); ap.add_argument('--cut', required=True)
    ap.add_argument('--her', default='heroine_01'); ap.add_argument('--out', required=True); ap.add_argument('--all-heights', action='store_true')
    a = ap.parse_args(); C = json.load(open(a.coords)); A = json.load(open(os.path.join(a.cut, 'anchors.json')))
    base = Image.open(a.base).convert('RGBA').resize(tuple(C['size']), Image.LANCZOS); f = ImageFont.truetype(FONT, 30)
    tiles = []
    for cn, comp in C['comps'].items():
        cv = base.copy(); d = ImageDraw.Draw(cv)
        for hs in C.get('hotspots', []): r = hs['rect']; d.rectangle((r[0], r[1], r[0] + r[2], r[1] + r[3]), outline=(255, 255, 255, 160), width=2)
        if 'horizonY' in C: d.line((0, C['horizonY'], 1920, C['horizonY']), fill=(255, 80, 80, 200), width=2)
        d.line((0, 1080 - C['uiSafe']['bottom'], 1920, 1080 - C['uiSafe']['bottom']), fill=(80, 160, 255, 200), width=2)
        if comp.get('bodies') is not False:                                      # bodies:false＝這個互動點只用頭像（BB-B D13 C3）
            if 'you' in comp: p, x, y, s = comp['you']; place(cv, a.cut, A, 'player', p, x, y, s)
            if 'her' in comp: p, x, y, s = comp['her']; place(cv, a.cut, A, a.her, p, x, y, s)
        else: ImageDraw.Draw(cv).text((60, 900), '（bodies:false：只用頭像）', fill=(255, 255, 255, 255), font=f)
        d = ImageDraw.Draw(cv); d.rectangle((0, 0, 1920, 46), fill=(0, 0, 0, 150)); d.text((14, 6), f"{cn}  {comp.get('_note', '')}", fill=(255, 255, 255, 255), font=f)
        tiles.append(cv)
    if a.all_heights:                                                            # 八個人並排（前景 y 1000、縮放 1.0）：比身高
        cv = base.copy(); xs = range(160, 1920, 220); ids = list(HEIGHT)
        for x, cid in zip(xs, ids): place(cv, a.cut, A, cid, 'Y1' if cid == 'player' else 'H1', x, 1000, 1.0)
        d = ImageDraw.Draw(cv); d.rectangle((0, 0, 1920, 46), fill=(0, 0, 0, 150)); d.text((14, 6), '身高比例（前景 y 1000、縮放 1.0）：' + '、'.join(f'{k} {v}' for k, v in HEIGHT.items()), fill=(255, 255, 255, 255), font=ImageFont.truetype(FONT, 24))
        tiles.append(cv)
    cols = 2; rows = (len(tiles) + 1) // 2; tw, th = 960, 540
    sheet = Image.new('RGB', (cols * tw, rows * th), (0, 0, 0))
    for i, t in enumerate(tiles): sheet.paste(t.convert('RGB').resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
    sheet.save(a.out); print('saved', a.out, len(tiles), 'tiles')


if __name__ == '__main__':
    main()
