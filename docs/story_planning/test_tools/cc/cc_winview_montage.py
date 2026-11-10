"""CC（帳號 A）11-10：X254 窗景巡拍的拼圖（雲端用，要 PIL；PC 沒有 PIL）。
  讀 cc_winview_audit_probe.py 的 <dir>/winview_audit.json，每間店（每片窗景卡）一列：左邊店名｜白天窗景｜晚上窗景｜門外實景；
  專屬照片的店（own）只有白天那一張（另外兩格寫「—」）。缺的截圖畫灰底寫「沒有」（打烊、讀檔放不進去、沒有出口…）。
  輸出：<dir>/winview_montage_all.png（全部）＋ winview_montage_<群組>.png（gen5／xs7／tea／own 各一張）；每格寬 CELL_W（預設 560）。
用法：python3 cc_winview_montage.py <probe 的輸出資料夾> [CELL_W=560]"""
import os, sys, json
from PIL import Image, ImageDraw, ImageFont

DIR = sys.argv[1]
CW = int(os.environ.get('CELL_W') or (sys.argv[2] if len(sys.argv) > 2 else 560)); CH = CW * 9 // 16
LW = 260; HEAD = 76; PAD = 6
FONTS = ['/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
         'C:/Windows/Fonts/msjh.ttc', 'C:/Windows/Fonts/msyh.ttc']
GROUP_NAME = {'gen5': '通用視差窗 5 間', 'xs7': '新生南路 7 間', 'tea': '一盞（前院）', 'own': '專屬照片（對照）'}


def font(sz):
    for f in FONTS:
        if os.path.exists(f):
            try: return ImageFont.truetype(f, sz)
            except Exception: pass
    return ImageFont.load_default()


F1, F2, F3 = font(24), font(16), font(20)


def cell(fn):
    p = os.path.join(DIR, fn) if fn else None
    if p and os.path.exists(p):
        im = Image.open(p).convert('RGB'); im.thumbnail((CW, CH)); bg = Image.new('RGB', (CW, CH), (0, 0, 0)); bg.paste(im, ((CW - im.width) // 2, (CH - im.height) // 2)); return bg
    bg = Image.new('RGB', (CW, CH), (90, 90, 90)); d = ImageDraw.Draw(bg); d.text((CW // 2 - 30, CH // 2 - 12), '沒有' if fn != '—' else '—', fill=(230, 230, 230), font=F3); return bg


def rows_of(shops):
    rows = []
    for s in shops:
        if s.get('skipped'): continue
        views = s.get('views') or []
        if not views:
            rows.append((s, None, [None, None, None])); continue
        for k, v in enumerate(views):
            sh = v.get('shots') or {}
            if s.get('group') == 'own': cells = [sh.get('day'), '—', sh.get('street') or '—']
            else: cells = [sh.get('day'), sh.get('night'), sh.get('street')]
            rows.append((s, (k, v), cells))
    return rows


def build(rows, title, path):
    if not rows: return None
    W = LW + 3 * (CW + PAD) + PAD; H = HEAD + len(rows) * (CH + PAD) + PAD
    img = Image.new('RGB', (W, H), (245, 243, 238)); d = ImageDraw.Draw(img)
    d.text((PAD, 8), title, fill=(30, 30, 30), font=F1)
    for i, t in enumerate(('白天 14:00 店裡往窗外', '晚上 21:00 店裡往窗外', '門口外面、同方向（14:00）')):
        d.text((LW + PAD + i * (CW + PAD), 46), t, fill=(60, 60, 60), font=F2)
    for r, (s, kv, cells) in enumerate(rows):
        y = HEAD + r * (CH + PAD)
        lines = [s.get('name', '?'), s.get('zone', '')]
        if kv:
            k, v = kv
            lines.append(('第 %d 片 ' % (k + 1) if k else '') + ('視差窗' if v.get('kind') == 'parallax' else '照片卡' if v.get('kind') == 'photo' else '玻璃（沒有窗景卡）' if v.get('kind') == 'glass' else '前院'))
            lines.append(str(v.get('card', ''))[:26])
            o = v.get('out') or [0, 0]
            lines.append('窗往外 ' + ('東' if o[0] > 0.5 else '西' if o[0] < -0.5 else '+z' if o[1] > 0.5 else '-z'))
            u = (v.get('url') or '').split('/')[-1]
            if u: lines.append(u[:28])
        else:
            lines.append('（%s）' % (s.get('error') or '沒有截圖'))
        for j, t in enumerate(lines):
            d.text((PAD, y + 6 + j * 26), t, fill=(20, 20, 20) if j == 0 else (80, 80, 80), font=F1 if j == 0 else F2)
        for i, fn in enumerate(cells):
            img.paste(cell(fn), (LW + PAD + i * (CW + PAD), y))
    img.save(path); print('寫好 %s（%d 列，%d×%d）' % (path, len(rows), W, H)); return path


def main():
    with open(os.path.join(DIR, 'winview_audit.json'), encoding='utf-8') as f: res = json.load(f)
    shops = res.get('shops') or []
    head = '窗景巡拍 X254（WINVIEW-AUDIT-1105）%s　%s' % (res.get('sha') or '', res.get('day') or '')
    build(rows_of(shops), head, os.path.join(DIR, 'winview_montage_all.png'))
    for g in ('gen5', 'xs7', 'tea', 'own'):
        build(rows_of([s for s in shops if s.get('group') == g]), head + '　' + GROUP_NAME[g], os.path.join(DIR, 'winview_montage_%s.png' % g))
    sk = [s['name'] for s in shops if s.get('skipped')]
    if sk: print('沒拍（沒有專屬照片的窗景卡）：%s' % '、'.join(sk))


main()
