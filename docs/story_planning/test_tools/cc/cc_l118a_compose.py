"""CC（帳號 A）11-11：L118A 拼圖——讀 PC 回來的 cc_l118a_probe.py 輸出，拼「參考圖｜新｜舊（有的話）」同機位並排（雲端跑，要 PIL）。
用法：python3 cc_l118a_compose.py <ref 資料夾> <新版 out（可逗號分隔多個，往下遞迴找）> <舊版 out（逗號分隔；沒有寫 -）> <輸出資料夾>
  ref：<開發分支>/docs/handoff/user_specs/l118_ref/（ext_<id>.webp、int_<id>.webp、int2_<id>.webp）
  探針檔名：l118a_<kind>_<id>_<hhmm>_<view>_<cam|game>.jpg（kind＝ext／int／corner／walk／seat／wall／door／view／drink）
輸出：
  l118a_ext_<id>_<hhmm>.jpg    外觀：上排 參考圖｜新 正面｜舊 正面；下排 參考圖上半（招牌）｜新 招牌近拍｜舊 招牌近拍（十一間 × 14:00、20:00）
  l118a_int_<id>_<hhmm>.jpg    室內：上排 int_｜int2_｜新 門口往裡｜舊 門口往裡；下排 新 最裡面往門口｜舊 最裡面往門口｜新 進門遊戲鏡頭｜近照
  l118a_sheet_<kind>_<id>.jpg  遊戲鏡頭總覽（四角、轉一圈、座位、沿牆卡點、巷子走一趟、門、窗景）
  l118a_nav_diff.txt           DRINK 存的 118 巷導航格新舊比對（差異格的世界座標範圍）"""
import os, sys, glob, json
from PIL import Image, ImageDraw, ImageFont
REF, NEW, OLD, OUT = sys.argv[1:5]; os.makedirs(OUT, exist_ok=True)
FONT = next((f for f in ['/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'] if os.path.exists(f)), None)
F = ImageFont.truetype(FONT, 22) if FONT else ImageFont.load_default()
W = 640
NAME = {'dian': '118牛排', 'self': '水上便當', 'tea': '辛亥韓食', 'home': '五湖四海', 'cafe2': '大學食堂', 'pasta': '義大麵屋', 'korea': '清州刀削麵', 'omu': '奈良咖哩',
        'noodle2': '迪倫窯烤披薩', 'drink_a': '喝不喝咖啡', 'drink_b': '果茶社'}
OLDNAME = {'dian': '滇香小館', 'self': '好家自助餐', 'tea': '一一八茶飲', 'home': '巷口家常菜', 'cafe2': '慢讀咖啡', 'pasta': 'Pasta 118', 'korea': '韓食小廚', 'omu': '蛋包飯研究所', 'noodle2': '六張犁麵舖'}
dirs = lambda s: [] if s in ('-', '') else [d for d in s.split(',') if d]
NEWD, OLDD = dirs(NEW), dirs(OLD)


def find(ds, pat):
    for d in ds:
        p = sorted(glob.glob(os.path.join(d, '**', pat), recursive=True))
        if p: return p[-1]
    return None


def tile(path, label, crop=None):
    if not path or not os.path.exists(path):
        im = Image.new('RGB', (W, 360), (40, 40, 40)); ImageDraw.Draw(im).text((10, 160), '（沒有）' + label, fill=(220, 220, 220), font=F); return im
    im = Image.open(path).convert('RGB')
    if crop: w, h = im.size; im = im.crop((int(w * crop[0]), int(h * crop[1]), int(w * crop[2]), int(h * crop[3])))
    im = im.resize((W, int(im.height * W / im.width)))
    d = ImageDraw.Draw(im); d.rectangle((0, 0, W, 30), fill=(0, 0, 0)); d.text((6, 3), label, fill=(255, 255, 255), font=F); return im


def grid(rows, fn, title):
    h = [max(t.height for t in r) for r in rows]; cols = max(len(r) for r in rows)
    out = Image.new('RGB', (W * cols, sum(h) + 40), (0, 0, 0)); d = ImageDraw.Draw(out); d.text((8, 6), title, fill=(255, 255, 255), font=F); y = 40
    for r, hh in zip(rows, h):
        for i, t in enumerate(r): out.paste(t, (i * W, y))
        y += hh
    out.save(os.path.join(OUT, fn), quality=85); print('寫', fn, out.size)


n = 0
for sid in NAME:
    ref = os.path.join(REF, 'ext_%s.webp' % sid)
    for hh in ('1400', '2000'):
        nf = find(NEWD, 'l118a_ext_%s_%s_front_cam.jpg' % (sid, hh)); of = find(OLDD, 'l118a_ext_%s_%s_front_cam.jpg' % (sid, hh))
        if not nf and not of: continue
        ns = find(NEWD, 'l118a_ext_%s_%s_sign_cam.jpg' % (sid, hh)); os_ = find(OLDD, 'l118a_ext_%s_%s_sign_cam.jpg' % (sid, hh))
        on = OLDNAME.get(sid, '（舊版沒有這間）')
        rows = [[tile(ref, '參考圖 ext_%s' % sid), tile(nf, '新 %s 正面 %s【捷徑機位】' % (NAME[sid], hh)), tile(of, '舊 %s 正面 %s' % (on, hh))],
                [tile(ref, '參考圖 上半（招牌）', (0, 0, 1, 0.5)), tile(ns, '新 招牌近拍 %s' % hh), tile(os_, '舊 招牌近拍 %s' % hh)]]
        grid(rows, 'l118a_ext_%s_%s.jpg' % (sid, hh), 'L118A %s 外觀 %s：參考圖｜新｜舊（同機位）' % (NAME[sid], hh)); n += 1
for sid in ('dian', 'self', 'korea', 'tea', 'home', 'cafe2', 'pasta', 'omu', 'noodle2'):
    hs = sorted({os.path.basename(p).split('_')[3] for d in NEWD for p in glob.glob(os.path.join(d, '**', 'l118a_int_%s_*_in_cam.jpg' % sid), recursive=True)})
    for hh in hs:
        g = lambda ds, v, c='cam': find(ds, 'l118a_int_%s_%s_%s_%s.jpg' % (sid, hh, v, c))
        close = find(NEWD, 'l118a_int_%s_%s_close_*_cam.jpg' % (sid, hh))
        rows = [[tile(os.path.join(REF, 'int_%s.webp' % sid), '參考圖 int_%s' % sid), tile(os.path.join(REF, 'int2_%s.webp' % sid), '參考圖 int2_%s' % sid),
                 tile(g(NEWD, 'in'), '新 門口往裡 %s【捷徑機位】' % hh), tile(g(OLDD, 'in'), '舊 %s 門口往裡' % OLDNAME[sid])],
                [tile(g(NEWD, 'out'), '新 最裡面往門口【捷徑機位】'), tile(g(OLDD, 'out'), '舊 最裡面往門口'), tile(g(NEWD, 'door', 'game'), '新 進門【遊戲鏡頭】'),
                 tile(close, '新 近照 %s' % (os.path.basename(close).split('_close_')[1].rsplit('_', 1)[0] if close else ''))]]
        grid(rows, 'l118a_int_%s_%s.jpg' % (sid, hh), 'L118A %s 室內 %s：參考圖 int_／int2_｜新｜舊（同機位）' % (NAME[sid], hh)); n += 1
# 遊戲鏡頭總覽
for kind in ('corner', 'seat', 'wall', 'walk', 'door', 'view', 'drink'):
    ps = sorted({p for d in NEWD for p in glob.glob(os.path.join(d, '**', 'l118a_%s_*.jpg' % kind), recursive=True)})
    groups = {}
    for p in ps: groups.setdefault(os.path.basename(p).split('_')[2], []).append(p)
    for key, lst in groups.items():
        lst = lst[:24]; tiles = [tile(p, os.path.basename(p)[6:-4]) for p in lst]
        rows = [tiles[i:i + 4] for i in range(0, len(tiles), 4)]
        grid(rows, 'l118a_sheet_%s_%s.jpg' % (kind, key), 'L118A %s %s（%d 張；_game＝遊戲鏡頭、_cam＝捷徑機位）' % (kind, NAME.get(key, key), len(lst))); n += 1
# 導航格新舊
nj, oj = find(NEWD, 'l118a_nav_lane118.json'), find(OLDD, 'l118a_nav_lane118.json')
if nj and oj:
    a, b = json.load(open(nj, encoding='utf-8')), json.load(open(oj, encoding='utf-8'))
    lines = []
    if (a['cols'], a['rows']) != (b['cols'], b['rows']): lines.append('格子大小不同：新 %sx%s、舊 %sx%s' % (a['cols'], a['rows'], b['cols'], b['rows']))
    else:
        cell = a.get('cell') or 0.5; ox, oz = a['origin']; diff = []
        for r in range(a['rows']):
            for c in range(a['cols']):
                if a['grid'][r][c] != b['grid'][r][c]: diff.append((round(ox + c * cell, 2), round(oz + r * cell, 2), '新擋住' if a['grid'][r][c] == '#' else '新可走'))
        lines.append('差異 %d 格（格子 %s m；座標是格子的世界座標）' % (len(diff), cell))
        for x, z, k in diff: lines.append('  x %6.2f z %6.2f %s' % (x, z, k))
    open(os.path.join(OUT, 'l118a_nav_diff.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n'); print('寫 l118a_nav_diff.txt：' + lines[0]); n += 1
print('共 %d 張／檔' % n)
