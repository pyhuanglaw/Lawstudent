"""CC（帳號 A）11-10：GG3（BB 23:15）拼圖——參考圖（LAWWW2 gg_shops6_1110 concept／interior）＋新版＋舊版同機位，招牌放大 ×2。
用法：python3 cc_gg3_compose.py <ref 資料夾> <新版 out> <舊版 out 或 -> <int out 資料夾（GG3_int_new_*）或 -> <輸出資料夾>
  ref：shop_<名>.webp、int_<名>.webp（名＝antai、tingzhou_xianguo、rongendian）
  新舊 out：gg3ext_<sid>_<hhmm>_<角度>.jpg（GGEXT）；int：tz4int_<sid>_<hhmm>_<角度>.jpg"""
import os, sys, glob
from PIL import Image, ImageDraw, ImageFont
REF, NEW, OLD, INT, OUT = sys.argv[1:6]; os.makedirs(OUT, exist_ok=True)
FONT = next((f for f in ['/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if os.path.exists(f)), None)
F = ImageFont.truetype(FONT, 22) if FONT else ImageFont.load_default()
REFN = {'antai': 'antai', 'xianguo': 'tingzhou_xianguo', 'rongendian': 'rongendian'}
NAME = {'antai': '安泰藥局', 'xianguo': '汀州鮮果', 'rongendian': '榮恩典文具社'}
W = 640


def tile(path, label, crop=None):
    if not path or not os.path.exists(path):
        im = Image.new('RGB', (W, 360), (40, 40, 40)); d = ImageDraw.Draw(im); d.text((10, 160), '（沒有）' + label, fill=(220, 220, 220), font=F); return im
    im = Image.open(path).convert('RGB')
    if crop: w, h = im.size; im = im.crop((int(w * crop[0]), int(h * crop[1]), int(w * crop[2]), int(h * crop[3])))
    im = im.resize((W, int(im.height * W / im.width)))
    d = ImageDraw.Draw(im); d.rectangle((0, 0, W, 30), fill=(0, 0, 0)); d.text((6, 3), label, fill=(255, 255, 255), font=F); return im


def grid(rows, fn, title):
    rows = [[t for t in r] for r in rows]; h = [max(t.height for t in r) for r in rows]; cols = max(len(r) for r in rows)
    out = Image.new('RGB', (W * cols, sum(h) + 40), (0, 0, 0)); d = ImageDraw.Draw(out); d.text((8, 6), title, fill=(255, 255, 255), font=F); y = 40
    for r, hh in zip(rows, h):
        for i, t in enumerate(r): out.paste(t, (i * W, y))
        y += hh
    out.save(os.path.join(OUT, fn), quality=85); print('寫', fn, out.size)


def one(d, sid, hh, lab):
    if d == '-' or not d: return None
    p = glob.glob(os.path.join(d, '**', 'gg3ext_%s_%s_%s.jpg' % (sid, hh, lab)), recursive=True); return p[0] if p else None


for sid in ('antai', 'xianguo', 'rongendian'):
    ref = os.path.join(REF, 'shop_%s.webp' % REFN[sid]); n = NAME[sid]
    for hh in ('1400', '2030'):
        rows = [[tile(ref, '參考圖（LAWWW2 concept）'), tile(one(NEW, sid, hh, '正面'), '新 正面 %s' % hh), tile(one(OLD, sid, hh, '正面'), '舊 正面 %s' % hh)],
                [tile(one(NEW, sid, hh, '招牌近拍'), '新 招牌近拍'), tile(one(NEW, sid, hh, '招牌近拍'), '新 招牌 放大×2（中間）', (0.25, 0.2, 0.75, 0.6)), tile(one(OLD, sid, hh, '招牌近拍'), '舊 招牌近拍')],
                [tile(one(NEW, sid, hh, '斜看左'), '新 斜看左'), tile(one(NEW, sid, hh, '斜看右'), '新 斜看右'), tile(one(NEW, sid, hh, '騎樓裡看門'), '新 騎樓裡看門')]]
        grid(rows, 'gg3_%s_ext_%s.jpg' % (sid, hh), 'GG3 %s 外觀 %s：參考圖／新／舊（同機位）' % (n, hh))
    if INT != '-':
        iref = os.path.join(REF, 'int_%s.webp' % REFN[sid])
        for hh in ('1400', '2030'):
            g = lambda lab: (glob.glob(os.path.join(INT, '**', 'tz4int_%s_%s_%s.jpg' % (sid, hh, lab)), recursive=True) or [None])[0]
            rows = [[tile(iref, '參考圖（LAWWW2 interior）'), tile(g('門口往裡'), '門口往裡 %s' % hh), tile(g('後面往門口'), '後面往門口')],
                    [tile(g('左前往右後'), '左前往右後'), tile(g('放大'), '放大（右側）'), tile(g('game'), '遊戲畫面')]]
            grid(rows, 'gg3_%s_int_%s.jpg' % (sid, hh), 'GG3 %s 室內 %s：參考圖／新版四角度' % (n, hh))
