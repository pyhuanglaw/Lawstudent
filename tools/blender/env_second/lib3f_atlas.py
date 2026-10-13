"""總圖書館 3F 閱覽區的書背圖集（第二 AI 工作階段製作）：程式畫的 1024×1024 圖（不是照片、不是外部素材）。
  python3 tools/blender/env_second/lib3f_atlas.py   → tools/blender/env_second/textures/gen/lib3f_books.png＋lib3f_books.json（每一格的位置）、lib3f_signs.png
格式和法律學院圖書館的 lawlib_atlas.py 一樣（library_3f.py 用同一套書模組的做法）：
- 書背 5 排 × 25 格（每格 40×192 px）：第 0–1 排一般的中文書（哲學、心理、歷史、地理、經濟、社會、政治、教育、數學、物理、化學、生物、
  電腦、管理、文學、語言、藝術…），第 2 排舊書與外文書，第 3 排參考書（百科全書、辭典、地圖集、年鑑：同一套同一個顏色），
  第 4 排期刊合訂本（同一種期刊同一個顏色、書背燙卷期與年份）。
  書名只寫科目或一般的書名（經濟學原理、台灣史…）；沒有真實的作者、出版社；期刊名稱是一般的詞（人文季刊…），不是真實刊物。
  每本書背下面有索書號標籤（中國圖書分類法：類號照科目，例如經濟 550、台灣史 733）。
- 最下面一條（64 px）：書口（書的頂面：紙的顏色）、兩塊純色（書擋的鐵灰、深灰）。
- lib3f_signs.png（512×256）：牆上的牌子——「3F 閱覽區」「請保持安靜」「樓梯間」「參考書」與出口標示燈（綠底、白色的人往門跑）。
字：系統字型 文泉驛正黑（WenQuanYi Zen Hei，GPLv2＋字型嵌入例外）畫成點陣圖；GLB 裡沒有字型檔。"""
import json, os, random
from PIL import Image, ImageDraw, ImageFont
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures', 'gen', 'lib3f_books.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SW, SH, NCOL, NROW = 40, 192, 25, 5
W = H = 1024
BAND = NROW * SH
rnd = random.Random(20261014)
img = Image.new('RGB', (W, H), '#2a2622'); d = ImageDraw.Draw(img)
class _Fonts(dict):
    def __missing__(self, s): self[s] = ImageFont.truetype(FONT, s); return self[s]
F = _Fonts()

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
def shade(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)
def lum(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

def vtext(draw, x0, y0, w, text, size, fill, step=None):
    """直排：一個字一個字往下，水平置中；回傳最後的 y"""
    f = F[size]; step = step or int(size * 1.08); y = y0
    for ch in text:
        if ch == ' ': y += step // 2; continue
        bb = draw.textbbox((0, 0), ch, font=f); cw = bb[2] - bb[0]
        draw.text((x0 + (w - cw) / 2 - bb[0], y - bb[1] + (size - (bb[3] - bb[1])) / 2), ch, font=f, fill=fill); y += step
    return y

def rtext(x0, y0, w, h, text, size, fill):
    """外文書：字轉 90°（由下往上讀），置中在 (x0,y0,w,h)"""
    f = F[size]; bb = d.textbbox((0, 0), text, font=f); th = bb[3] - bb[1] + 4
    t = Image.new('RGBA', (bb[2] - bb[0] + 2, th), (0, 0, 0, 0)); ImageDraw.Draw(t).text((-bb[0] + 1, -bb[1] + 2), text, font=f, fill=fill)
    t = t.rotate(90, expand=True)
    if t.size[1] > h - 4: t = t.crop((0, t.size[1] - (h - 4), t.size[0], t.size[1]))
    img.paste(t, (int(x0 + (w - t.size[0]) / 2), int(y0 + (h - t.size[1]) / 2)), t)

def label(x0, y0, cls, num):
    """索書號標籤（白色貼紙、兩行小字）"""
    lx, ly = x0 + 4, y0 + SH - 34
    d.rectangle((lx, ly, lx + SW - 9, ly + 26), fill='#f1eee6', outline='#c9c2b2')
    for i, t in enumerate((cls, num)):
        f = F[9]; bb = d.textbbox((0, 0), t, font=f); d.text((lx + (SW - 9 - (bb[2] - bb[0])) / 2 - bb[0], ly + 2 + i * 12 - bb[1]), t, font=f, fill='#222222')

# 一般的書：(書名, 類號)——中國圖書分類法的大類（100 哲學、170 心理、310 數學、330 物理、340 化學、360 生物、312 電腦、494 管理、
# 495 會計、496 行銷、520 教育、540 社會、550 經濟、570 政治、578 國際關係、572 行政、610 中國史、711 世界史、733 台灣史、
# 609 地理、800 語言、805 英語、803 日語、810 文學、820 中國文學、863 台灣文學、870 西洋文學、900 藝術、920 建築、950 攝影、987 電影、890 新聞傳播）
GEN = [('哲學概論', '100'), ('西洋哲學史', '140'), ('倫理學', '190'), ('邏輯導論', '150'), ('心理學導論', '170'), ('社會心理學', '541.7'),
       ('微積分', '314.1'), ('線性代數', '313.3'), ('統計學', '510'), ('普通物理', '330'), ('普通化學', '340'), ('生物學', '360'),
       ('地球科學', '350'), ('計算機概論', '312'), ('資料結構', '312.73'), ('演算法', '318.1'), ('管理學', '494'), ('會計學', '495'),
       ('行銷學', '496'), ('教育概論', '520'), ('教育心理學', '521'), ('社會學', '540'), ('人類學導論', '541'), ('經濟學原理', '550'),
       ('個體經濟學', '551'), ('總體經濟學', '550.1'), ('公共經濟學', '560'), ('政治學', '570'), ('比較政府', '572'), ('國際關係', '578'),
       ('公共行政', '572.9'), ('中國通史', '610'), ('世界通史', '711'), ('台灣史', '733.21'), ('地理學概論', '609'), ('都市計畫', '545.1'),
       ('語言學概論', '800'), ('英文寫作', '805.17'), ('日語文法', '803.16'), ('文學概論', '810'), ('古典詩詞選', '831'), ('現代散文選', '855'),
       ('小說選讀', '857'), ('台灣文學史', '863.09'), ('西洋文學概論', '870'), ('藝術概論', '900'), ('西洋美術史', '909.4'), ('建築史', '920.9'),
       ('攝影入門', '950'), ('電影理論', '987.01'), ('傳播理論', '541.83'), ('新聞學', '890'), ('圖書館學', '020'), ('研究方法', '501.2'),
       ('人口學', '542.1'), ('環境科學', '367'), ('公共衛生', '412'), ('臺灣地理', '733.3'), ('社會福利', '547'), ('性別研究', '544.7')]
EDN = ['', '', '', '', '修訂版', '第二版', '第三版', '上冊', '下冊', '增訂版', '新版']
GENC = ['#7b2e2a', '#2f4f6f', '#3f5d3a', '#c9b48a', '#8a3b5c', '#1f2a36', '#b0532c', '#d8cfb8', '#4a6b8a', '#6b4a2f', '#9a8f7a', '#2b5a55',
        '#c2a14a', '#5b3e6b', '#efe9dc', '#38424a', '#8c6d4f', '#a33c33', '#e0d6c0', '#24577a', '#6f7f3a', '#d9a441', '#5a6670', '#f2efe6',
        '#3d6e8f', '#e6c7a0', '#566b4b', '#8e8a83']
regions = {'gen': [], 'old': [], 'foreign': [], 'ref': [], 'journal': []}

def spine_gen(col, row, faded=False):
    x0, y0 = col * SW, row * SH
    base = hexrgb(rnd.choice(GENC))
    if faded: base = tuple(int(v * 0.78 + 150 * 0.22) for v in base)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    style = rnd.random()
    if style < 0.35:   # 上面一塊不同色（出版社的系列色）
        d.rectangle((x0, y0, x0 + SW - 1, y0 + 30), fill=hexrgb(rnd.choice(GENC)))
    elif style < 0.6:  # 上下兩道線
        g = '#c8a960' if lum(base) < 150 else '#5a4a2a'
        for yy in (y0 + 10, y0 + 14, y0 + SH - 44, y0 + SH - 40): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    else:              # 淡色的書名框
        d.rectangle((x0 + 5, y0 + 34, x0 + SW - 6, y0 + 140), fill=shade(base, 1.35) if lum(base) < 110 else shade(base, 0.9))
    fg = (245, 242, 232) if lum(base) < 135 else (34, 30, 28)
    if style >= 0.6: fg = (34, 30, 28) if lum(shade(base, 1.35 if lum(base) < 110 else 0.9)) > 135 else (245, 242, 232)
    t, cls = rnd.choice(GEN); n = len(t); step = min(22, 96 // n); size = max(10, int(step / 1.08))
    yy = vtext(d, x0, y0 + 38, SW, t, size, fg, step=step)
    e = rnd.choice(EDN)
    if e and yy - y0 + 4 + len(e) * 10 <= 138: vtext(d, x0, yy + 4, SW, e, 9, fg, step=10)
    cy = y0 + SH - 50; mk = rnd.randrange(3)
    if mk == 0: d.ellipse((x0 + 15, cy, x0 + 25, cy + 10), outline=fg, width=2)
    elif mk == 1: d.rectangle((x0 + 15, cy, x0 + 25, cy + 10), outline=fg, width=2)
    else: d.polygon([(x0 + 20, cy), (x0 + 26, cy + 10), (x0 + 14, cy + 10)], outline=fg)
    label(x0, y0, cls, f'{rnd.randint(1000, 9999)}')
    return (x0, y0, x0 + SW, y0 + SH)

FOREIGN = [('ECONOMICS', '#1f2f5a', '550'), ('Sociology', '#7a1d1d', '540'), ('Linear Algebra', '#1f2f5a', '313'), ('World History', '#2b2b2b', '711'),
           ('Psychology', '#6b2a2a', '170'), ('Philosophy', '#24384f', '100'), ('経済学入門', '#3c3c5a', '550'), ('社会学講義', '#5a3c2c', '540'),
           ('PHYSICS', '#1f2f5a', '330'), ('Political Theory', '#2c4a3a', '570'), ('Calculus', '#5a4a2a', '314'), ('LINGUISTICS', '#3a3a3a', '800')]
def spine_foreign(col, row):
    x0, y0 = col * SW, row * SH; t, c, cls = rnd.choice(FOREIGN); base = hexrgb(c)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    g = '#c9ad6a'
    for yy in (y0 + 8, y0 + 12, y0 + SH - 42): d.line((x0 + 2, yy, x0 + SW - 3, yy), fill=g, width=1)
    if any('一' <= ch <= '鿿' for ch in t): vtext(d, x0, y0 + 24, SW, t, 16, g)
    else: rtext(x0, y0 + 18, SW, SH - 66, t, 14 if len(t) < 14 else 12, g)
    label(x0, y0, cls, f'{rnd.randint(1000, 9999)}')
    return (x0, y0, x0 + SW, y0 + SH)

# 參考書：同一套同一個顏色（百科全書一到十冊、辭典、地圖集、年鑑）
REFSETS = [('百科全書', '#1d2b45', '#d2b56a', 10, '030'), ('國語辭典', '#7a2321', '#e3cf96', 3, '802.3'), ('英漢辭典', '#204a3a', '#d8c58e', 3, '805.132'),
           ('世界地圖集', '#2f4a6b', '#e8dcb4', 2, '609.9'), ('統計年鑑', '#4a4f55', '#e0e0d8', 7, '510.58')]
def spine_ref(col, row):
    x0, y0 = col * SW, row * SH
    k = 0; c_ = col
    for i, s_ in enumerate(REFSETS):
        if c_ < s_[3]: k = i; break
        c_ -= s_[3]
    t, bg, g, n, cls = REFSETS[k]; base = hexrgb(bg)
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    d.rectangle((x0 + 3, y0 + 6, x0 + SW - 4, y0 + 26), fill=shade(base, 0.72))
    for yy in (y0 + 30, y0 + 33): d.line((x0 + 3, yy, x0 + SW - 4, yy), fill=g, width=1)
    vtext(d, x0, y0 + 40, SW, t, 12 if len(t) <= 4 else 11, g, step=13)
    if t == '統計年鑑': vtext(d, x0, y0 + SH - 84, SW, str(2018 + c_), 9, g, step=9)
    else: d.text((x0 + 15 - (5 if c_ + 1 >= 10 else 0), y0 + SH - 60), str(c_ + 1), font=F[13], fill=g)
    label(x0, y0, cls, f'v.{c_ + 1}')
    return (x0, y0, x0 + SW, y0 + SH)

JOURNALS = [('人文季刊', '#5a1f24'), ('社會評論', '#1f3350'), ('經濟研究集刊', '#2f4a3a'), ('教育學誌', '#3a2f2a'), ('理工月報', '#6b5a3a')]
def spine_journal(col, row, j):
    x0, y0 = col * SW, row * SH; t, c = JOURNALS[j]; base = hexrgb(c); g = '#d4b86e'
    d.rectangle((x0, y0, x0 + SW - 1, y0 + SH - 1), fill=base)
    d.rectangle((x0 + 3, y0 + 6, x0 + SW - 4, y0 + 22), fill=shade(base, 0.7))
    n = len(t); vtext(d, x0, y0 + 26, SW, t, 12 if n <= 4 else 10, g, step=13 if n <= 4 else 11)
    vol = 20 + (col % 5) * 2 + j * 5; yr = 2008 + (col % 5) * 2 + j
    vtext(d, x0, y0 + SH - 82, SW, f'{vol}', 10, g, step=10)
    d.text((x0 + 8, y0 + SH - 56), str(yr), font=F[9], fill=g)
    label(x0, y0, '050', f'{j + 1}{vol}')
    return (x0, y0, x0 + SW, y0 + SH)

for r in range(NROW):
    for c in range(NCOL):
        if r < 2: regions['gen'].append(spine_gen(c, r))
        elif r == 2: (regions['old'].append(spine_gen(c, r, faded=True)) if c < 13 else regions['foreign'].append(spine_foreign(c, r)))
        elif r == 3: regions['ref'].append(spine_ref(c, r))
        else: regions['journal'].append(spine_journal(c, r, c // 5))

# ---- 書口（頂面）、純色 ----
d.rectangle((0, BAND, 904, H - 1), fill='#e9e1cc')
for y in range(BAND, H, 2): d.line((0, y, 904, y), fill='#ddd3bb' if (y // 2) % 3 else '#efe8d6')
pages = (8, BAND + 8, 896, H - 8)
d.rectangle((908, BAND, 964, H - 1), fill='#8b9095'); d.rectangle((968, BAND, W - 1, H - 1), fill='#3a3d40')
swatch = {'steel': (916, BAND + 8, 956, H - 8), 'dark': (976, BAND + 8, W - 8, H - 8)}

# 書背中間亮、兩邊暗一點（書背是圓的）
a = np.asarray(img, dtype=np.float32); xs = np.arange(SW); k = 0.84 + 0.16 * np.sin(np.pi * (xs + 0.5) / SW) ** 0.6
a[:BAND, :NCOL * SW] *= np.tile(k, NCOL)[None, :, None]
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); img.save(OUT)

# ---- 牌子（512×256）：四塊字牌＋出口標示燈 ----
S = Image.new('RGB', (512, 256), '#24303a'); sd = ImageDraw.Draw(S)
def sign(box, t, size, bg, fg, sub=None):
    x0, y0, x1, y1 = box; sd.rectangle(box, fill=bg)
    f = F[size]; bb = sd.textbbox((0, 0), t, font=f); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    cy = (y0 + y1) / 2 - (8 if sub else 0)
    sd.text(((x0 + x1 - tw) / 2 - bb[0], cy - th / 2 - bb[1]), t, font=f, fill=fg)
    if sub:
        f2 = F[13]; bb = sd.textbbox((0, 0), sub, font=f2); sd.text(((x0 + x1 - (bb[2] - bb[0])) / 2 - bb[0], y1 - 22 - bb[1]), sub, font=f2, fill=fg)
signs = {}
signs['floor'] = (0, 0, 256, 64);   sign(signs['floor'], '3F 閱覽區', 30, '#24303a', '#f2ede0', None)
signs['quiet'] = (256, 0, 512, 64); sign(signs['quiet'], '請保持安靜', 28, '#efe9dc', '#2a2a2a', None)
signs['stairs'] = (0, 64, 256, 128); sign(signs['stairs'], '樓梯間', 30, '#24303a', '#f2ede0', None)
signs['ref'] = (256, 64, 512, 128); sign(signs['ref'], '參考書', 30, '#24303a', '#f2ede0', None)
signs['rules'] = (0, 128, 256, 256)
sd.rectangle(signs['rules'], fill='#f4f1e8'); sd.text((14, 138), '閱覽須知', font=F[22], fill='#24303a')
for i, t in enumerate(('・請勿飲食', '・手機請轉靜音', '・座位請勿長時間保留', '・參考書請勿攜出')):
    sd.text((16, 172 + i * 20), t, font=F[14], fill='#333333')
# 出口標示燈（綠底、白色的人往門跑，沒有字）
ex = Image.new('RGB', (128, 64), '#1f9a4a'); ed = ImageDraw.Draw(ex)
ed.rectangle((76, 10, 112, 56), outline='#ffffff', width=4)
ed.ellipse((44, 8, 56, 20), fill='#ffffff'); ed.line((49, 22, 42, 38), fill='#ffffff', width=7)
ed.line((47, 26, 62, 32), fill='#ffffff', width=5); ed.line((45, 27, 32, 30), fill='#ffffff', width=5)
ed.line((42, 38, 56, 46), fill='#ffffff', width=6); ed.line((56, 46, 58, 56), fill='#ffffff', width=6)
ed.line((42, 38, 32, 48), fill='#ffffff', width=6); ed.line((32, 48, 22, 46), fill='#ffffff', width=6)
S.paste(ex.transpose(Image.FLIP_LEFT_RIGHT), (320, 160)); signs['exit'] = (320, 160, 448, 224)
S.save(OUT.replace('lib3f_books.png', 'lib3f_signs.png'))
meta = {'size': [W, H], 'regions': regions, 'pages': pages, 'swatch': swatch, 'signs_size': [512, 256], 'signs': signs}
json.dump(meta, open(OUT[:-4] + '.json', 'w'), indent=0)
print(OUT, {k: len(v) for k, v in regions.items()})
