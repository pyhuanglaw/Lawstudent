"""總圖 5F 書庫（自然科學）的書背圖集（LAWWW2-B 2026-10-23；AA_399 3-3）：程式畫的 1024×1024 圖（不是照片、不是外部素材）。
  python3 tools/blender/env_second/lib5f_atlas.py   → tools/blender/env_second/textures/gen/lib5f_books.png＋lib5f_books.json（每一格的位置、照類號分組）
格式和 3F 閱覽區的 lib3f_atlas.py 一樣（書背 40×192 px、5 排 × 25 格；最下面一條是書口和純色），差在書是照「類」排的：
- 第 0～2 排：300 科學總論、310 數學、320 天文、330 物理、340 化學、350 地球科學、360 生物、370 植物、380 動物，每一類 8～9 格連在一起
  （書庫一排書架是同一類：library_upper.py 一段書取同一類裡連續的幾格）。每一類裡有一兩本外文書、幾本舊書（顏色淡）。
- 第 3 排：參考書——植物圖鑑 1～8 冊（綠色，方奕廷在 5F 最裡面找的那一套：大開本、不外借）、動物圖鑑 1～6、化學手冊 1～3、數學辭典 1～2、天文年曆 6 年。
- 第 4 排：期刊合訂本（自然科學季刊、植物學集刊、物理學刊、化學通訊、生物研究彙刊；一般的詞，不是真實刊物）。
書名是一般的科目名；沒有真實的作者、出版社。索書號照中國圖書分類法的大類（370 植物…）。
字：文泉驛正黑（WenQuanYi Zen Hei，GPLv2＋字型嵌入例外）畫成點陣圖；GLB 裡沒有字型檔。"""
import json, os, random
from PIL import Image, ImageDraw, ImageFont
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures', 'gen', 'lib5f_books.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SW, SH, NCOL, NROW = 40, 192, 25, 5
W = H = 1024
BAND = NROW * SH
rnd = random.Random(20261023)
img = Image.new('RGB', (W, H), '#2a2622'); d = ImageDraw.Draw(img)
class _Fonts(dict):
    def __missing__(self, s): self[s] = ImageFont.truetype(FONT, s); return self[s]
F = _Fonts()

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)
def lum(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

def vtext(draw, x0, y0, w, text, size, fill, step=None):
    f = F[size]; step = step or int(size * 1.08); y = y0
    for ch in text:
        if ch == ' ': y += step // 2; continue
        bb = draw.textbbox((0, 0), ch, font=f); cw = bb[2] - bb[0]
        draw.text((x0 + (w - cw) / 2 - bb[0], y - bb[1] + (size - (bb[3] - bb[1])) / 2), ch, font=f, fill=fill); y += step
    return y

def rtext(x0, y0, w, h, text, size, fill):
    f = F[size]; bb = d.textbbox((0, 0), text, font=f); th = bb[3] - bb[1] + 4
    t = Image.new('RGBA', (bb[2] - bb[0] + 2, th), (0, 0, 0, 0)); ImageDraw.Draw(t).text((-bb[0] + 1, -bb[1] + 2), text, font=f, fill=fill)
    t = t.rotate(90, expand=True)
    if t.size[1] > h - 4: t = t.crop((0, t.size[1] - (h - 4), t.size[0], t.size[1]))
    img.paste(t, (int(x0 + (w - t.size[0]) / 2), int(y0 + (h - t.size[1]) / 2)), t)

def label(x0, y0, cls, num):
    lx, ly = x0 + 4, y0 + SH - 34
    d.rectangle((lx, ly, lx + SW - 9, ly + 26), fill='#f1eee6', outline='#c9c2b2')
    for i, t in enumerate((cls, num)):
        f = F[9]; bb = d.textbbox((0, 0), t, font=f); d.text((lx + (SW - 9 - (bb[2] - bb[0])) / 2 - bb[0], ly + 2 + i * 12 - bb[1]), t, font=f, fill='#222222')

# 每一類：(類號, 格數, 中文書名, 外文書名)
CLASSES = [
    ('300', 8, ['科學史', '科學方法', '自然科學概論', '科學哲學', '科學與社會', '實驗室安全', '研究方法', '科學寫作'], ['History of Science']),
    ('310', 9, ['微積分', '線性代數', '機率論', '數理統計', '高等微積分', '抽象代數', '拓樸學', '數值分析', '微分方程'], ['Calculus', 'Linear Algebra']),
    ('320', 8, ['天文學概論', '恆星物理', '星系天文學', '天體力學', '宇宙論', '觀測天文學', '太陽系'], ['Astronomy']),
    ('330', 9, ['普通物理', '古典力學', '電磁學', '量子力學', '熱力學', '光學', '統計力學', '固態物理', '近代物理'], ['PHYSICS']),
    ('340', 8, ['普通化學', '有機化學', '無機化學', '分析化學', '物理化學', '生物化學', '化學實驗', '高分子化學'], ['Organic Chemistry']),
    ('350', 8, ['地質學概論', '礦物學', '氣象學', '海洋學', '地震學', '岩石學', '古生物學', '臺灣的地形'], ['Geology']),
    ('360', 8, ['普通生物學', '細胞生物學', '遺傳學', '生態學', '演化生物學', '微生物學', '分子生物學', '生物統計'], ['Ecology', 'BIOLOGY']),
    ('370', 9, ['植物學', '植物分類學', '植物生理學', '蕨類植物', '臺灣的樹木', '野花圖譜', '植物形態學', '民族植物學', '苔蘚植物'], ['Botany', 'Plant Taxonomy']),
    ('380', 8, ['動物學', '昆蟲學', '鳥類學', '魚類學', '臺灣的鳥', '哺乳動物', '兩棲爬行類', '動物行為學'], ['Zoology']),
]
SUB = {'300': '1', '310': '4', '320': '2', '330': '3', '340': '6', '350': '4', '360': '7', '370': '5', '380': '7'}
EDN = ['', '', '', '', '修訂版', '第二版', '第三版', '上冊', '下冊', '增訂版']
GENC = ['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f', '#9a8f7a', '#2b5a55',
        '#c2a14a', '#5b3e6b', '#efe9dc', '#38424a', '#8c6d4f', '#a33c33', '#e0d6c0', '#24577a', '#6f7f3a', '#d9a441', '#5a6670', '#f2efe6']
FOREIGNC = ['#1f2f5a', '#7a1d1d', '#2c4a3a', '#2b2b2b', '#5a4a2a', '#24384f']

def spine_zh(x0, y0, title, cls, faded):
    base = hexrgb(rnd.choice(GENC))
    if faded: base = tuple(int(v * 0.74 + 160 * 0.26) for v in base)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    style = rnd.random()
    if style < 0.35: d.rectangle((x0, y0, x0 + SW - 1, y0 + 30), fill=hexrgb(rnd.choice(GENC)))
    elif style < 0.6:
        g = '#c8a960' if lum(base) < 150 else '#5a4a2a'
        for yy in (y0 + 10, y0 + 14, y0 + SH - 44, y0 + SH - 40): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    else: d.rectangle((x0 + 5, y0 + 34, x0 + SW - 6, y0 + 140), fill=shade(base, 1.35) if lum(base) < 110 else shade(base, 0.9))
    fg = (245, 242, 232) if lum(base) < 135 else (34, 30, 28)
    if style >= 0.6: fg = (34, 30, 28) if lum(shade(base, 1.35 if lum(base) < 110 else 0.9)) > 135 else (245, 242, 232)
    n = len(title); step = min(22, 96 // n); size = max(10, int(step / 1.08))
    yy = vtext(d, x0, y0 + 38, SW, title, size, fg, step=step)
    e = rnd.choice(EDN)
    if e and yy - y0 + 4 + len(e) * 10 <= 138: vtext(d, x0, yy + 4, SW, e, 9, fg, step=10)
    label(x0, y0, f'{cls[:2]}{SUB[cls]}' if rnd.random() < 0.6 else cls, f'{rnd.randint(1000, 9999)}')

def spine_en(x0, y0, title, cls):
    base = hexrgb(rnd.choice(FOREIGNC)); g = '#c9ad6a'
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    for yy in (y0 + 8, y0 + 12, y0 + SH - 42): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    rtext(x0, y0 + 18, SW, SH - 66, title, 14 if len(title) < 14 else 12, g)
    label(x0, y0, cls, f'{rnd.randint(1000, 9999)}')

regions = {}
cells = [(c, r) for r in range(3) for c in range(NCOL)]; k = 0
for (cls, n, zh, en) in CLASSES:
    regions[cls] = []
    en_at = set(rnd.sample(range(n), len(en)))
    for i in range(n):
        c, r = cells[k]; k += 1; x0, y0 = c * SW, r * SH
        if i in en_at: spine_en(x0, y0, en[sorted(en_at).index(i)], cls)
        else: spine_zh(x0, y0, zh[i % len(zh)], cls, faded=rnd.random() < 0.22)
        regions[cls].append((x0, y0, x0 + SW, y0 + SH))
assert k == 75, k

# 參考書：同一套同一個顏色。植物圖鑑＝方奕廷要找的那一套（綠色，書背燙金、冊號大）
REFSETS = [('ref_plant', '植物圖鑑', '#2f5a3a', '#e3cf8a', 8, '375.2'), ('ref_animal', '動物圖鑑', '#5a3a24', '#e3cf8a', 6, '385.2'),
           ('ref_chem', '化學手冊', '#1f3a5a', '#e0e0d8', 3, '340.2'), ('ref_math', '數學辭典', '#24262a', '#d8c58e', 2, '310.4'),
           ('ref_astro', '天文年曆', '#1d2b45', '#d2b56a', 6, '327.9')]
c = 0
for (key, t, bg, g, n, cls) in REFSETS:
    regions[key] = []
    for v in range(n):
        x0, y0 = c * SW, 3 * SH; base = hexrgb(bg); c += 1
        d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
        d.rectangle((x0 + 3, y0 + 6, x0 + SW - 4, y0 + 26), fill=shade(base, 0.72))
        for yy in (y0 + 30, y0 + 33): d.line((x0 + 3, yy, x0 + SW - 4, yy), fill=g, width=1)
        vtext(d, x0, y0 + 40, SW, t, 12, g, step=13)
        if key == 'ref_astro': vtext(d, x0, y0 + SH - 84, SW, str(2020 + v), 9, g, step=9)
        else: d.text((x0 + 15 - (5 if v + 1 >= 10 else 0), y0 + SH - 62), str(v + 1), font=F[15], fill=g)
        label(x0, y0, cls, f'v.{v + 1}')
        regions[key].append((x0, y0, x0 + SW, y0 + SH))
assert c == 25, c

JOURNALS = [('自然科學季刊', '#5a1f24'), ('植物學集刊', '#2f4a3a'), ('物理學刊', '#1f3350'), ('化學通訊', '#3a2f2a'), ('生物研究彙刊', '#6b5a3a')]
regions['journal'] = []
for col in range(NCOL):
    j = col // 5; t, cc = JOURNALS[j]; x0, y0 = col * SW, 4 * SH; base = hexrgb(cc); g = '#d4b86e'
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    d.rectangle((x0 + 3, y0 + 6, x0 + SW - 4, y0 + 22), fill=shade(base, 0.7))
    n = len(t); vtext(d, x0, y0 + 26, SW, t, 12 if n <= 4 else 10, g, step=13 if n <= 4 else 11)
    vol = 30 + (col % 5) * 2 + j * 5; yr = 2010 + (col % 5) * 2 + j
    vtext(d, x0, y0 + SH - 82, SW, f'{vol}', 10, g, step=10)
    d.text((x0 + 8, y0 + SH - 56), str(yr), font=F[9], fill=g)
    label(x0, y0, '305', f'{j + 1}{vol}')
    regions['journal'].append((x0, y0, x0 + SW, y0 + SH))

# 書口（頂面）、純色
d.rectangle((0, BAND, 904, H - 1), fill='#e9e1cc')
for y in range(BAND, H, 2): d.line((0, y, 904, y), fill='#ddd3bb' if (y // 2) % 3 else '#efe8d6')
pages = (8, BAND + 8, 896, H - 8)
d.rectangle((908, BAND, 964, H - 1), fill='#8b9095'); d.rectangle((968, BAND, W - 1, H - 1), fill='#3a3d40')
swatch = {'steel': (916, BAND + 8, 956, H - 8), 'dark': (976, BAND + 8, W - 8, H - 8)}

# 書背中間亮、兩邊暗一點（書背是圓的）
a = np.asarray(img, dtype=np.float32); xs = np.arange(SW); kk = 0.84 + 0.16 * np.sin(np.pi * (xs + 0.5) / SW) ** 0.6
a[:BAND, :NCOL * SW] *= np.tile(kk, NCOL)[None, :, None]
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); img.save(OUT)
meta = {'size': [W, H], 'regions': regions, 'pages': pages, 'swatch': swatch, 'classes': [c_[0] for c_ in CLASSES]}
json.dump(meta, open(OUT[:-4] + '.json', 'w'), indent=0)
print(OUT, {k_: len(v) for k_, v in regions.items()})
