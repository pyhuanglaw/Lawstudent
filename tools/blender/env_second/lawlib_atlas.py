"""法律學院圖書館的書背圖集（第二 AI 工作階段製作）：程式畫的 1024×1024 圖（不是照片、不是外部素材）。
  python3 tools/blender/env_second/lawlib_atlas.py   → tools/blender/env_second/textures/gen/lawlib_books.png、lawlib_covers.png＋lawlib_books.json（每一格的位置）
內容：
- 書背 5 排 × 25 格（每格 40×192 px）：第 0–1 排法律教科書、第 2 排舊版與外文書、第 3 排博碩士論文（深色精裝＋燙金）、第 4 排期刊合訂本（同一種期刊同一個顏色、書背燙年份）。
  書名只寫科目（民法總則、刑事訴訟法…）；沒有真實的作者、出版社、期刊名稱。每本書背下面有圖書館的索書號標籤（中國圖書分類法 58x）。
- 最下面一條（64 px）：書口（書的頂面：紙的顏色）、兩塊純色（書擋的鐵灰、深灰）。
- lawlib_exit.png（128×64）：出口標示燈（綠底、白色的人往門跑，沒有字）。
- 另一張 lawlib_covers.png（512×512）：封面 12 張（128×170）：期刊 8 張（現期期刊架）、新書 4 張（新書展示台）。
字：系統字型 文泉驛正黑（WenQuanYi Zen Hei，GPLv2＋字型嵌入例外）畫成點陣圖；GLB 裡沒有字型檔。"""
import json, os, random
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures', 'gen', 'lawlib_books.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SW, SH, NCOL, NROW = 40, 192, 25, 5
W = H = 1024
BAND = NROW * SH                                   # 960：下面是書口
rnd = random.Random(20261013)
img = Image.new('RGB', (W, H), '#2a2622'); d = ImageDraw.Draw(img)
class _Fonts(dict):
    def __missing__(self, s): self[s] = ImageFont.truetype(FONT, s); return self[s]
F = _Fonts()

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)
def lum(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

def vtext(x0, y0, w, text, size, fill, step=None):
    """直排：一個字一個字往下，水平置中；回傳最後的 y"""
    f = F[size]; step = step or int(size * 1.08); y = y0
    for ch in text:
        if ch == ' ': y += step // 2; continue
        bb = d.textbbox((0, 0), ch, font=f); cw = bb[2] - bb[0]
        d.text((x0 + (w - cw) / 2 - bb[0], y - bb[1] + (size - (bb[3] - bb[1])) / 2), ch, font=f, fill=fill); y += step
    return y

def rtext(x0, y0, w, h, text, size, fill):
    """外文書：字轉 90°（由下往上讀），置中在 (x0,y0,w,h)"""
    f = F[size]; bb = d.textbbox((0, 0), text, font=f); tw, th = bb[2] - bb[0] + 2, bb[3] - bb[1] + 4
    tw = min(tw, h - 4)
    t = Image.new('RGBA', (bb[2] - bb[0] + 2, th), (0, 0, 0, 0)); ImageDraw.Draw(t).text((-bb[0] + 1, -bb[1] + 2), text, font=f, fill=fill)
    t = t.rotate(90, expand=True)
    if t.size[1] > h - 4: t = t.crop((0, t.size[1] - (h - 4), t.size[0], t.size[1]))
    img.paste(t, (int(x0 + (w - t.size[0]) / 2), int(y0 + (h - t.size[1]) / 2)), t)

def label(x0, y0, cls, num):
    """索書號標籤（白色貼紙、兩行小字）：中國圖書分類法的法律類 58x"""
    lx, ly = x0 + 4, y0 + SH - 34
    d.rectangle((lx, ly, lx + SW - 9, ly + 26), fill='#f1eee6', outline='#c9c2b2')
    for i, t in enumerate((cls, num)):
        f = F[9]; bb = d.textbbox((0, 0), t, font=f); d.text((lx + (SW - 9 - (bb[2] - bb[0])) / 2 - bb[0], ly + 2 + i * 12 - bb[1]), t, font=f, fill='#222222')

LAW = ['民法總則', '債法總論', '債法各論', '物權法', '親屬法', '繼承法', '刑法總則', '刑法分則', '刑事訴訟法', '民事訴訟法', '行政法總論', '行政救濟法',
       '憲法', '基本權', '法學緒論', '法理學', '公司法', '票據法', '保險法', '海商法', '證券交易法', '國際私法', '國際公法', '勞動法', '著作權法',
       '專利法', '商標法', '公平交易法', '稅法', '環境法', '法制史', '羅馬法', '刑事政策', '犯罪學', '強制執行法', '法學方法論', '實例研習', '案例演習',
       '少年事件處理法', '消費者保護法', '行政程序法', '地方自治法']
CLS = {'民法': '584', '債': '584.3', '物權': '584.2', '親屬': '584.4', '繼承': '584.5', '刑法': '585', '刑事': '586.2', '民事訴': '586.1', '行政': '588',
       '憲法': '581', '基本權': '581.2', '法學': '580', '法理': '580.1', '公司': '587.2', '票據': '587.4', '保險': '587.5', '海商': '587.6', '證券': '563.5',
       '國際私': '579.9', '國際公': '579', '勞動': '556.8', '著作': '588.34', '專利': '440.6', '商標': '587.8', '公平': '553.4', '稅': '567', '環境': '445.9',
       '法制史': '580.9', '羅馬': '580.9', '犯罪': '548.5', '強制': '586.1', '實例': '580', '案例': '580', '少年': '585.7', '消費': '548.39', '地方': '575.1'}
def cls_of(t):
    for k, v in CLS.items():
        if k in t: return v
    return '580'
EDN = ['', '', '', '修訂版', '第二版', '第三版', '第五版', '上冊', '下冊', '增訂版']
LAWC = ['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f', '#9a8f7a', '#2b5a55',
        '#c2a14a', '#5b3e6b', '#efe9dc', '#38424a', '#8c6d4f', '#a33c33', '#e0d6c0', '#24577a', '#6f7f3a', '#d9a441', '#5a6670', '#f2efe6']
regions = {'law': [], 'old': [], 'foreign': [], 'thesis': [], 'journal': []}

def spine_law(col, row, faded=False):
    x0, y0 = col * SW, row * SH
    base = hexrgb(rnd.choice(LAWC));
    if faded: base = tuple(int(v * 0.8 + 150 * 0.2) for v in base)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    style = rnd.random()
    top = shade(base, 0.62) if lum(base) > 140 else shade(base, 1.55)
    if style < 0.35:   # 上面一塊不同色（出版社的系列色）
        d.rectangle((x0, y0, x0 + SW - 1, y0 + 30), fill=hexrgb(rnd.choice(LAWC)))
    elif style < 0.6:  # 上下兩道燙金線
        g = '#c8a960' if lum(base) < 150 else '#5a4a2a'
        for yy in (y0 + 10, y0 + 14, y0 + SH - 44, y0 + SH - 40): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    else:              # 白色或淡色的書名框
        d.rectangle((x0 + 5, y0 + 34, x0 + SW - 6, y0 + 140), fill=shade(base, 1.35) if lum(base) < 110 else shade(base, 0.9))
    fg = (245, 242, 232) if lum(base) < 135 else (34, 30, 28)
    if style >= 0.6: fg = (34, 30, 28) if lum(shade(base, 1.35 if lum(base) < 110 else 0.9)) > 135 else (245, 242, 232)
    t = rnd.choice(LAW); n = len(t); step = min(22, 96 // n); size = max(10, int(step / 1.08))   # 書名放在 y 38–134
    yy = vtext(x0, y0 + 38, SW, t, size, fg, step=step)
    e = rnd.choice(EDN)
    if e and yy - y0 + 4 + len(e) * 10 <= 138: vtext(x0, yy + 4, SW, e, 9, fg, step=10)   # 版次：放得下才寫
    # 出版社的小標記（幾何圖形，沒有字）
    cy = y0 + SH - 50; mk = rnd.randrange(3); c = fg
    if mk == 0: d.ellipse((x0 + 15, cy, x0 + 25, cy + 10), outline=c, width=2)
    elif mk == 1: d.rectangle((x0 + 15, cy, x0 + 25, cy + 10), outline=c, width=2)
    else: d.polygon([(x0 + 20, cy), (x0 + 26, cy + 10), (x0 + 14, cy + 10)], outline=c)
    label(x0, y0, cls_of(t), f'{rnd.randint(1000, 9999)}')
    return (x0, y0, x0 + SW, y0 + SH)

FOREIGN = [('STRAFRECHT AT', '#1f2f5a'), ('BGB KOMMENTAR', '#7a1d1d'), ('VERFASSUNGSRECHT', '#1f2f5a'), ('Constitutional Law', '#2b2b2b'),
           ('Contracts', '#6b2a2a'), ('Criminal Procedure', '#24384f'), ('民法注釈', '#3c3c5a'), ('刑法講義', '#5a3c2c'), ('ZPO', '#1f2f5a'),
           ('Verwaltungsrecht', '#2c4a3a'), ('Torts', '#5a4a2a'), ('JURISPRUDENCE', '#3a3a3a')]
def spine_foreign(col, row):
    x0, y0 = col * SW, row * SH; t, c = rnd.choice(FOREIGN); base = hexrgb(c)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    g = '#c9ad6a'
    for yy in (y0 + 8, y0 + 12, y0 + SH - 42): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    if any('一' <= ch <= '鿿' for ch in t): vtext(x0, y0 + 24, SW, t, 16, g)
    else: rtext(x0, y0 + 18, SW, SH - 66, t, 14 if len(t) < 14 else 12, g)
    label(x0, y0, '58' + str(rnd.randint(0, 8)), f'{rnd.randint(1000, 9999)}')
    return (x0, y0, x0 + SW, y0 + SH)

def spine_thesis(col, row):
    x0, y0 = col * SW, row * SH; base = hexrgb(rnd.choice(['#16181c', '#1b2436', '#1a1f2b', '#3a1b1f', '#1e2a22', '#222222']))
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base); g = '#cfb46e'
    vtext(x0, y0 + 10, SW, '碩士論文' if rnd.random() < 0.8 else '博士論文', 10, g, step=11)
    for k in range(rnd.randint(4, 7)):   # 題目（燙金細字：太小，畫成一個一個的短橫線群）
        yy = y0 + 62 + k * 8; d.line((x0 + 14, yy, x0 + 26, yy), fill=g, width=2)
    vtext(x0, y0 + SH - 64, SW, str(rnd.randint(2008, 2025)), 9, g, step=8)
    label(x0, y0, '58' + str(rnd.choice([0, 1, 4, 5, 6, 7, 8])), f'{rnd.randint(1000, 9999)}')
    return (x0, y0, x0 + SW, y0 + SH)

JOURNALS = [('法學論叢', '#5a1f24'), ('法律評論', '#1f3350'), ('憲政研究', '#2f4a3a'), ('刑事法學', '#3a2f2a'), ('民商法研究', '#6b5a3a')]
def spine_journal(col, row, j):
    x0, y0 = col * SW, row * SH; t, c = JOURNALS[j]; base = hexrgb(c); g = '#d4b86e'
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    d.rectangle((x0 + 3, y0 + 6, x0 + SW - 4, y0 + 22), fill=shade(base, 0.7))
    vtext(x0, y0 + 26, SW, t, 12 if len(t) <= 4 else 11, g, step=13)
    vol = 30 + (col % 5) * 2 + j * 7; yr = 2005 + (col % 5) * 2 + j
    vtext(x0, y0 + SH - 82, SW, f'{vol}', 10, g, step=10)
    d.text((x0 + 8, y0 + SH - 56), str(yr), font=F[9], fill=g)
    label(x0, y0, '580.5', f'{j + 1}{vol}')
    return (x0, y0, x0 + SW, y0 + SH)

for r in range(NROW):
    for c in range(NCOL):
        if r < 2: regions['law'].append(spine_law(c, r))
        elif r == 2: (regions['old'].append(spine_law(c, r, faded=True)) if c < 13 else regions['foreign'].append(spine_foreign(c, r)))
        elif r == 3: regions['thesis'].append(spine_thesis(c, r))
        else: regions['journal'].append(spine_journal(c, r, c // 5))

# ---- 書口（頂面）：最下面一條，米白的紙、一條一條細紋 ----
d.rectangle((0, BAND, 904, H - 1), fill='#e9e1cc')
for y in range(BAND, H, 2): d.line((0, y, 904, y), fill='#ddd3bb' if (y // 2) % 3 else '#efe8d6')
pages = (8, BAND + 8, 896, H - 8)
d.rectangle((908, BAND, 964, H - 1), fill='#8b9095'); d.rectangle((968, BAND, W - 1, H - 1), fill='#3a3d40')   # 純色：書擋（鐵灰）、深灰
swatch = {'steel': (916, BAND + 8, 956, H - 8), 'dark': (976, BAND + 8, W - 8, H - 8)}

# ---- 封面（另一張 512×512）：期刊 8 張、新書 4 張 ----
cimg = Image.new('RGB', (512, 512), '#ddd8cc'); cd = ImageDraw.Draw(cimg)
def ctext(x0, y0, w, t, size, fill):
    f = F[size]; bb = cd.textbbox((0, 0), t, font=f); cd.text((x0 + (w - (bb[2] - bb[0])) / 2 - bb[0], y0 - bb[1]), t, font=f, fill=fill)
covers = []
TOP = ['AI 與著作權', '少年事件處理', '行政訴訟新制', '刑事訴訟新趨勢', '公司治理', '基本權保障', '勞動契約', '國際私法新論']
MAST = ['法學期刊', '法律評論', '憲政時代', '刑事法月刊', '民事法學', '法學新論', '月刊法學', '法政論壇']
NEWB = [('民法總則', '第十版', '#efe9dc', '#7b2e2a'), ('刑法總論', '修訂五版', '#20324d', '#c2a14a'), ('行政法', '新論', '#f4f4f0', '#2f4f6f'), ('論文集', '比較法研究', '#2f4a3a', '#e8e2d2')]
CW, CH = 128, 170
for i in range(12):
    x0, y0 = (i % 4) * CW, (i // 4) * CH; w, h = CW - 4, CH - 4; x0 += 2; y0 += 2
    if i < 8:
        bg = hexrgb(['#f2efe6', '#e8e2d2', '#20324d', '#7b2e2a', '#efe9dc', '#2f4a3a', '#d9a441', '#f4f4f0'][i])
        fg = (240, 236, 226) if lum(bg) < 130 else (30, 28, 26); acc = hexrgb(['#b0532c', '#2f4f6f', '#c2a14a', '#8a3b5c', '#3f5d3a', '#b0532c', '#2f4f6f', '#8a3b5c'][i])
        cd.rectangle((x0, y0, x0 + w - 1, y0 + h - 1), fill=bg); cd.rectangle((x0, y0, x0 + w - 1, y0 + 34), fill=acc)
        ctext(x0, y0 + 7, w, MAST[i], 20, (250, 248, 240))
        cd.text((x0 + 8, y0 + 42), f'No.{rnd.randint(180, 340)}', font=F[11], fill=fg)
        ctext(x0, y0 + 64, w, '專題', 11, fg); ctext(x0, y0 + 80, w, TOP[i], 15, fg)
        for k in range(4): cd.line((x0 + 12, y0 + 108 + k * 9, x0 + w - 12 - rnd.randint(0, 40), y0 + 108 + k * 9), fill=shade(fg, 0.8) if lum(bg) < 130 else (90, 86, 80), width=2)
        cd.rectangle((x0 + 12, y0 + 146, x0 + w - 13, y0 + 160), fill=acc)
    else:
        t, e, bgc, acc = NEWB[i - 8]; bg = hexrgb(bgc); acc = hexrgb(acc); fg = (240, 236, 226) if lum(bg) < 130 else (30, 28, 26)
        cd.rectangle((x0, y0, x0 + w - 1, y0 + h - 1), fill=bg); cd.rectangle((x0, y0 + 98, x0 + w - 1, y0 + 104), fill=acc)
        ctext(x0, y0 + 28, w, t, 24 if len(t) <= 4 else 20, fg); ctext(x0, y0 + 64, w, e, 12, fg)
        for k in range(2): cd.line((x0 + 30, y0 + 120 + k * 10, x0 + w - 30, y0 + 120 + k * 10), fill=acc, width=2)
        cd.ellipse((x0 + w / 2 - 6, y0 + 148, x0 + w / 2 + 6, y0 + 160), outline=fg, width=2)
    covers.append((x0, y0, x0 + w, y0 + h))
cimg.save(OUT.replace('lawlib_books.png', 'lawlib_covers.png'))

# 書背中間亮、兩邊暗一點（書背是圓的）：每一格乘上橫向的明暗
import numpy as np
a = np.asarray(img, dtype=np.float32); xs = np.arange(SW); k = 0.84 + 0.16 * np.sin(np.pi * (xs + 0.5) / SW) ** 0.6
a[:BAND, :NCOL * SW] *= np.tile(k, NCOL)[None, :, None]
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
img.save(OUT)
# ---- 出口標示燈（綠底、白色跑步的人＋門；沒有字）128×64 ----
ex = Image.new('RGB', (128, 64), '#1f9a4a'); ed = ImageDraw.Draw(ex)
ed.rectangle((76, 10, 112, 56), outline='#ffffff', width=4)                                  # 門
ed.ellipse((44, 8, 56, 20), fill='#ffffff')                                                 # 頭
ed.line((49, 22, 42, 38), fill='#ffffff', width=7)                                          # 身體（往前傾）
ed.line((47, 26, 62, 32), fill='#ffffff', width=5); ed.line((45, 27, 32, 30), fill='#ffffff', width=5)   # 手
ed.line((42, 38, 56, 46), fill='#ffffff', width=6); ed.line((56, 46, 58, 56), fill='#ffffff', width=6)   # 前腳
ed.line((42, 38, 32, 48), fill='#ffffff', width=6); ed.line((32, 48, 22, 46), fill='#ffffff', width=6)   # 後腳
ex = ex.transpose(Image.FLIP_LEFT_RIGHT)                                                     # 門在左邊、人往門跑（出口標示燈的樣子）
ex.save(OUT.replace('lawlib_books.png', 'lawlib_exit.png'))
meta = {'size': [W, H], 'regions': regions, 'pages': pages, 'swatch': swatch, 'covers_size': [512, 512], 'covers': covers}
json.dump(meta, open(OUT[:-4] + '.json', 'w'), indent=0)
print(OUT, {k: len(v) for k, v in regions.items()}, 'covers', len(covers))
