"""ART-WZ6 溫州街故事線的小物件（AA_166、AA_167；LAWWW2-B 分工 SCENE_RULES.md 第 8 節；AA-B 支援製作 2026-10-16）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/wz6_items.py [-- --out assets/models/env/second_ai/aa_support/wz6_items.glb]

七件，每件一個頂層節點（原點＝底部中央、正面朝 +z；GLB 裡的位置只是排開給人看，遊戲端用網格本身擺）：
  WZ6_egg_timer         半熟早午餐老闆娘的計時器（WZ-B6）：機械式，直徑 6.4 cm、高 5.8 cm；下半部蛋黃色、上半部轉盤有 0～55 分刻度
  WZ6_notebook          阿德的膠裝空白筆記本（WZ-C8）：A5 闔著平放；封面、書頁、封底分開做，書背貼一條深色布膠帶（書背對齊）；封底右下角店章
  WZ6_tea_tin           蘇姨的一小罐茶（WZ-T6）：鐵罐高 8 cm，深綠，和紙標籤只有一個「茶」字
  WZ6_card              林太太的手寫卡片（AA_167 3-5）：對折立著（每面 10.5×7.5 cm），正面手寫
  WZ6_whiteboard_print  讀書會白板的影印照片（AA_167 2-4、2-6）：A4 橫放、黑白影印，貼在牆上，右下角翹起來；原點＝底邊中央、z=0 是牆面
  WZ6_poster            子晴的吉他社成發海報（BB_148 WZ-C4：A2、藍色要亮）：貼在牆上，四角藍色紙膠帶；原點＝底邊中央、z=0 是牆面
  WZ6_cat_bowl          茶屋緣側的貓碗（AA_167 4-3）：陶碗直徑 14 cm（圈足不上釉、碗口一圈手畫藍線、碗裡一小堆飼料）＋旁邊的小水碗
全部一個材質 wz6_items（底色 1024 貼圖集＋粗糙度／金屬度 256）。字、圖案只畫在貼圖裡（紙、印刷、標籤本來就是平面的）：WenQuanYi Zen Hei，沒有附字型檔。
虛構：海報的社團、日期照遊戲（吉他社成發 2026-05-27 週三 19:00 法律系館B大廳（D115 改名；原本寫萬才館大廳），activities.js guitar_show_y1s2）；白板的內容是 AA_167 的時間線，不寫年份、法條、判決字號；店章「阿德影印輸出」是遊戲裡的虛構店名（D77）。
"""
import json, math, os, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/wz6_items.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'wz6_items_{k}.png') for k in ('atlas', 'orm'))
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
N, SS, ORM_N = 1024, 2, 256

# ---------------- 貼圖集的區域（1024 的像素，左上角原點）----------------
REG = {
    'poster': (0, 0, 362, 512),          # A2 直式 420×594 mm
    'wb_print': (362, 0, 724, 256),      # A4 橫式 297×210 mm
    'card_front': (724, 0, 904, 128),    # 卡片正面 105×75 mm
    'tin_label': (362, 256, 724, 346),   # 茶罐標籤（繞一圈 201 mm × 高 40 mm）
    'dial_side': (724, 128, 1024, 152),  # 計時器轉盤的側面刻度（繞一圈）
    'dial_top': (724, 152, 820, 248),    # 計時器頂面（圓）
    'tin_top': (820, 152, 916, 248),     # 茶罐蓋頂（圓）
    'nb_cover': (0, 512, 148, 722),      # 筆記本封面 148×210
    'nb_back': (148, 512, 296, 722),     # 封底（右下角店章）
    'nb_edge': (296, 512, 360, 576),     # 書頁的邊
    'nb_spine': (360, 512, 380, 722),    # 書背布膠帶
    'bowl_band': (380, 512, 636, 544),   # 碗口那一圈（手畫藍線）
}
SW = {   # 純色小格（sRGB）：(顏色, 粗糙度, 金屬度)
    'yolk': ((238, 180, 42), 0.38, 0.0), 'cream_pl': ((242, 236, 220), 0.38, 0.0), 'knob': ((250, 248, 242), 0.32, 0.0),
    'red_pl': ((204, 46, 38), 0.4, 0.0), 'gap': ((44, 40, 36), 0.6, 0.0),
    'tin_green': ((50, 80, 62), 0.42, 0.35), 'tin_rim': ((176, 178, 172), 0.32, 0.45),
    'card': ((246, 240, 226), 0.85, 0.0), 'card_back': ((236, 228, 210), 0.85, 0.0),
    'paper_back': ((232, 232, 228), 0.9, 0.0), 'tape_blue': ((72, 124, 206), 0.6, 0.0), 'tape_cream': ((230, 220, 186), 0.7, 0.0),
    'glaze': ((238, 236, 228), 0.16, 0.0), 'glaze_in': ((232, 230, 222), 0.14, 0.0), 'clay': ((178, 150, 118), 0.85, 0.0),
    'kibble': ((132, 84, 44), 0.7, 0.0), 'kibble2': ((100, 62, 34), 0.7, 0.0), 'water': ((96, 114, 122), 0.04, 0.0),
    'board': ((150, 128, 98), 0.9, 0.0), 'paper': ((246, 246, 242), 0.85, 0.0),
}
SW_CELL, SW_Y0 = 32, 768
for i, k in enumerate(SW):
    cx, cy = (i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL
    REG['sw_' + k] = (cx, cy, cx + SW_CELL, cy + SW_CELL)
ORM_REG = {'poster': (0.8, 0.0), 'wb_print': (0.82, 0.0), 'card_front': (0.85, 0.0), 'tin_label': (0.8, 0.0), 'dial_side': (0.38, 0.0),
           'dial_top': (0.38, 0.0), 'tin_top': (0.42, 0.35), 'nb_cover': (0.85, 0.0), 'nb_back': (0.85, 0.0), 'nb_edge': (0.9, 0.0),
           'nb_spine': (0.7, 0.0), 'bowl_band': (0.16, 0.0)}


# ================= 貼圖 =================
class Painter:
    def __init__(self):
        self.im = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); self.fonts = {}

    def font(self, px):
        px = max(4, int(round(px)))
        if px not in self.fonts: self.fonts[px] = ImageFont.truetype(FONT, px)
        return self.fonts[px]

    def size(self, name):
        x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS

    def put(self, name, img):
        x0, y0, _, _ = REG[name]; self.im.paste(img.convert('RGB'), (x0 * SS, y0 * SS))

    def text_c(self, dr, cx, y, text, size, fill, bold=False):
        f = self.font(size); w = dr.textlength(text, font=f)
        for dx in ((0, max(1, size // 22)) if bold else (0,)): dr.text((cx - w / 2 + dx, y), text, font=f, fill=fill)

    def hand(self, img, x, y, text, size, color, seed=0, slant=0.15, jitter=1.0):
        """手寫：每個字隨機大小、傾斜、旋轉、上下位置（照 desk_props.py 的做法）"""
        r = np.random.default_rng(seed); cx = x
        for ch in text:
            if ch in ' 　':
                cx += size * (0.45 if ch == ' ' else 0.95); continue
            wide = ord(ch) > 0x2E80
            s = size * r.uniform(0.9, 1.06) * (1.0 if wide else 0.8)
            f = self.font(s); T = int(s * 1.7)
            tile = Image.new('L', (T, T), 0); ImageDraw.Draw(tile).text((s * 0.35, s * 0.2), ch, font=f, fill=255)
            tile = tile.transform(tile.size, Image.AFFINE, (1, slant, -slant * T / 2, 0, 1, 0), resample=Image.BICUBIC)
            tile = tile.rotate(r.uniform(-5, 5) * jitter, resample=Image.BICUBIC)
            k = r.uniform(0.75, 0.96); tile = tile.point(lambda v, k=k: int(v * k))
            img.paste(Image.new('RGB', tile.size, color), (int(cx - s * 0.35), int(y - s * 0.95 + r.uniform(-0.06, 0.06) * s * jitter)), tile)
            cx += s * (r.uniform(0.9, 1.02) if wide else r.uniform(0.55, 0.65))
        return cx


def noise(img, amp, seed=0, scale=1, gray=False):
    a = np.asarray(img, np.float32); r = np.random.default_rng(seed); h, w = a.shape[:2]
    n = r.normal(0, amp, (max(1, h // scale), max(1, w // scale), 1)).astype(np.float32)
    if scale > 1: n = np.asarray(Image.fromarray(n[..., 0]).resize((w, h), Image.BILINEAR), np.float32)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def paint_poster(P):
    w, h = P.size('poster'); img = Image.new('RGB', (w, h), (28, 108, 226)); d = ImageDraw.Draw(img)
    for y in range(h):   # 上亮下暗一點的藍（「藍色要亮」）
        k = y / h; d.line([(0, y), (w, y)], fill=(int(30 - 8 * k), int(116 - 20 * k), int(232 - 18 * k)))
    px = w // 36   # 像素風的格子（子晴做遊戲）
    rng = random.Random(527)
    for _ in range(46):   # 像素星星（避開中間吉他那一條）
        x, y = rng.randrange(0, w // px) * px, rng.randrange(int(h * 0.11) // px, int(h * 0.64) // px) * px
        if abs(x - w / 2) < w * 0.20: continue
        c = (255, 255, 255) if rng.random() < 0.7 else (255, 214, 64)
        d.rectangle([x, y, x + px - 1, y + px - 1], fill=c)
    GUITAR = [   # 像素吉他（H 琴頭、P 弦鈕、N 琴頸、B 琴身、O 音孔、R 琴橋）
        '...PHHHP...', '...PHHHP...', '...PHHHP...', '....HHH....', '....NNN....', '....NNN....', '....NNN....', '....NNN....',
        '....NNN....', '....NNN....', '....NNN....', '....NNN....', '...BBBBB...', '..BBBBBBB..', '.BBBBBBBBB.', '.BBBBBBBBB.',
        '.BBBOOOBBB.', '.BBOOOOOBB.', '.BBBOOOBBB.', '..BBBBBBB..', '..BBBBBBB..', '.BBBBBBBBB.', 'BBBBBBBBBBB', 'BBBBBBBBBBB',
        'BBBRRRRRBBB', 'BBBBBBBBBBB', '.BBBBBBBBB.', '..BBBBBBB..', '....BBB....']
    COL = {'H': (255, 255, 255), 'P': (200, 220, 255), 'N': (255, 255, 255), 'B': (255, 214, 64), 'O': (16, 52, 140), 'R': (16, 52, 140)}
    cs = int(h * 0.50 / len(GUITAR)); gx0 = int(w / 2 - cs * len(GUITAR[0]) / 2); gy0 = int(h * 0.135)
    for j, row in enumerate(GUITAR):
        for i, ch in enumerate(row):
            if ch in COL: d.rectangle([gx0 + i * cs, gy0 + j * cs, gx0 + (i + 1) * cs - 1, gy0 + (j + 1) * cs - 1], fill=COL[ch])
    for i in (4.35, 5.0, 5.65):   # 三條弦：琴頭到琴橋
        x = gx0 + i * cs + cs * 0.5 - SS; d.line([(x, gy0 + 3 * cs), (x, gy0 + 24.5 * cs)], fill=(16, 52, 140), width=max(1, SS))
    for j in range(len(GUITAR)):   # 琴身的陰影（右邊一格暗一點，像素風的立體）
        row = GUITAR[j]; k = row.rfind('B')
        if k >= 0 and row[k] == 'B': d.rectangle([gx0 + k * cs, gy0 + j * cs, gx0 + (k + 1) * cs - 1, gy0 + (j + 1) * cs - 1], fill=(226, 176, 40))
    P.text_c(d, w / 2, int(h * 0.05), '吉他社', int(w * 0.075), (255, 255, 255), bold=True)
    P.text_c(d, w / 2, int(h * 0.66), '期末成發', int(w * 0.17), (255, 255, 255), bold=True)
    d.rectangle([w * 0.12, h * 0.835, w * 0.88, h * 0.838], fill=(255, 214, 64))
    P.text_c(d, w / 2, int(h * 0.855), '5.27 WED　19:00', int(w * 0.07), (255, 255, 255), bold=True)
    P.text_c(d, w / 2, int(h * 0.92), '法律系館B大廳｜免費入場', int(w * 0.052), (220, 232, 255))
    P.put('poster', noise(img, 3, seed=1))


def paint_wb_print(P):
    """黑白影印的白板照片：影印的灰底、白板的鋁框、白板上的手寫時間線、磁鐵；整張轉灰階"""
    w, h = P.size('wb_print'); img = Image.new('RGB', (w, h), (236, 236, 234)); d = ImageDraw.Draw(img)
    m = int(w * 0.04)
    d.rectangle([m, m, w - m, h - m], fill=(150, 150, 150))                       # 白板的鋁框
    d.rectangle([m + 10 * SS, m + 10 * SS, w - m - 10 * SS, h - m - 10 * SS], fill=(226, 226, 224))   # 白板面
    ink, red = (24, 24, 24), (70, 70, 70)
    fs = int(h * 0.062)
    P.hand(img, int(w * 0.10), int(h * 0.20), '葉老師的房子　時間線', fs, ink, seed=3)
    y = int(h * 0.50); x0, x1 = int(w * 0.10), int(w * 0.90)
    d.line([(x0, y), (x1, y)], fill=ink, width=3 * SS); d.polygon([(x1, y), (x1 - 14 * SS, y - 6 * SS), (x1 - 14 * SS, y + 6 * SS)], fill=ink)
    marks = [(0.15, '日治', '土地調查・登記'), (0.38, '戰後', '總登記（沒趕上）'), (0.61, '登記', '簿子上寫國家'), (0.84, '現在', '該問誰？怎麼問？')]
    for i, (u, top, bot) in enumerate(marks):
        x = int(w * u); d.line([(x, y - 8 * SS), (x, y + 8 * SS)], fill=ink, width=3 * SS)
        P.hand(img, x - int(fs * 0.95), y - int(fs * 0.55), top, fs, ink, seed=10 + i)
        bs = int(fs * 0.66); bw = len(bot) * bs * 0.95; yb = y + int(fs * (1.7 if i % 2 == 0 else 2.9))
        bx = min(max(int(x - bw / 2), int(w * 0.10)), int(w * 0.90 - bw))
        d.line([(x, y + 9 * SS), (x, yb - bs * 1.05)], fill=(120, 120, 120), width=SS)
        P.hand(img, bx, yb, bot, bs, ink, seed=20 + i)
    for i in range(5):   # 鐵盒子裡的紙：①～⑤
        x = int(w * (0.14 + 0.065 * i)); yy = int(h * 0.835)
        d.ellipse([x, yy, x + fs, yy + fs], outline=ink, width=2 * SS); P.text_c(d, x + fs / 2, yy + fs * 0.08, str(i + 1), int(fs * 0.7), ink)
    P.hand(img, int(w * 0.50), int(h * 0.885), '鐵盒子的紙，照日期排', int(fs * 0.7), red, seed=31)
    xs = int(w * 0.66); ys = int(h * 0.20)   # 小語寫的「不公平！」被劃掉，旁邊以安的字
    end = P.hand(img, xs, ys, '不公平！', int(fs * 0.9), red, seed=40, slant=0.3, jitter=1.6)
    d.line([(xs - 4 * SS, ys - int(fs * 0.45)), (end, ys - int(fs * 0.25))], fill=red, width=2 * SS)
    P.hand(img, xs, ys + int(fs * 1.1), '→ 理由在這疊紙裡', int(fs * 0.62), ink, seed=41, slant=0.05, jitter=0.4)
    for (u, v) in ((0.08, 0.10), (0.93, 0.10), (0.93, 0.90), (0.075, 0.90)):   # 磁鐵（壓在白板的四個角）
        cx, cy = int(w * u), int(h * v); rr = int(h * 0.028); d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(46, 46, 46))
    g = img.convert('L')
    a = np.asarray(g, np.float32)
    a = np.clip((a - 128) * 1.35 + 140, 0, 255)                   # 影印的對比
    yy, xx = np.mgrid[0:h, 0:w]; edge = np.minimum.reduce([xx, yy, w - 1 - xx, h - 1 - yy]) / (w * 0.03)
    a = a * np.clip(0.55 + 0.45 * edge, 0.55, 1.0)               # 影印機蓋子的陰影（邊緣變暗）
    rng = np.random.default_rng(7); specks = rng.random(a.shape) < 0.0012; a[specks] = 40   # 碳粉的小點
    img = Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6 * SS)).convert('RGB')
    P.put('wb_print', noise(img, 5, seed=8))


def paint_card(P):
    w, h = P.size('card_front'); img = Image.new('RGB', (w, h), SW['card'][0]); d = ImageDraw.Draw(img)
    blue = (36, 58, 132); fs = int(h * 0.15)
    P.hand(img, int(w * 0.08), int(h * 0.26), '小老闆：', fs, blue, seed=51)
    P.hand(img, int(w * 0.14), int(h * 0.50), '謝謝你那天陪我去。', fs, blue, seed=52)
    P.hand(img, int(w * 0.14), int(h * 0.72), '我們會一直來吃。', fs, blue, seed=53)
    P.hand(img, int(w * 0.80), int(h * 0.93), '林', fs, blue, seed=54)
    cx, cy, r = int(w * 0.86), int(h * 0.20), int(h * 0.11)   # 色鉛筆的荷包蛋
    d.ellipse([cx - r * 1.4, cy - r, cx + r * 1.4, cy + r], outline=(200, 190, 170), width=SS, fill=(252, 250, 244))
    d.ellipse([cx - r * 0.55, cy - r * 0.55, cx + r * 0.55, cy + r * 0.55], fill=(244, 186, 52))
    P.put('card_front', noise(img, 4, seed=5))


def paint_tin_label(P):
    """和紙標籤：繞罐子一圈；正面（u≈0.75，UV 已經處理成從左讀到右）一個「茶」字和一個紅色小章"""
    w, h = P.size('tin_label'); img = Image.new('RGB', (w, h), (238, 230, 210)); d = ImageDraw.Draw(img)
    img = noise(img, 6, seed=9, scale=2); d = ImageDraw.Draw(img)
    rng = np.random.default_rng(12)
    for _ in range(140):   # 和紙的纖維（紙本來就有，畫在印刷的標籤上）
        x, y = rng.uniform(0, w), rng.uniform(0, h); L_ = rng.uniform(4, 14) * SS; a = rng.uniform(0, math.pi)
        d.line([(x, y), (x + L_ * math.cos(a), y + L_ * math.sin(a))], fill=(222, 212, 188), width=1)
    d.rectangle([0, 0, w, 3 * SS], fill=(50, 80, 62)); d.rectangle([0, h - 3 * SS, w, h], fill=(50, 80, 62))
    cx = w * 0.75; f = P.font(h * 0.74); tw = d.textlength('茶', font=f)
    t = Image.new('L', (int(h * 1.2), int(h * 1.2)), 0); ImageDraw.Draw(t).text(((h * 1.2 - tw) / 2, h * 0.08), '茶', font=f, fill=255)
    t = t.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.8 * SS))
    img.paste(Image.new('RGB', t.size, (26, 24, 22)), (int(cx - h * 0.6), int(-h * 0.08)), t)
    sx, sy, ss_ = int(cx + h * 0.42), int(h * 0.62), int(h * 0.16)   # 小紅章
    d = ImageDraw.Draw(img); d.rectangle([sx, sy, sx + ss_, sy + ss_], fill=(186, 52, 40))
    P.put('tin_label', img)


def paint_dial(P):
    w, h = P.size('dial_side'); img = Image.new('RGB', (w, h), SW['cream_pl'][0]); d = ImageDraw.Draw(img)
    for k in range(60):   # 一分鐘一格，五分鐘長格＋數字（UV 處理成從左讀到右）
        x = w * (k + 0.5) / 60; long_ = k % 5 == 0
        d.line([(x, 0), (x, h * (0.42 if long_ else 0.22))], fill=(40, 40, 40), width=SS)
        if long_:
            f = P.font(h * 0.46); s = str(k); tw = d.textlength(s, font=f); d.text((x - tw / 2, h * 0.44), s, font=f, fill=(30, 30, 30))
    P.put('dial_side', img)
    w, h = P.size('dial_top'); img = Image.new('RGB', (w, h), SW['cream_pl'][0]); d = ImageDraw.Draw(img)
    d.ellipse([w * 0.12, h * 0.12, w * 0.88, h * 0.88], outline=(214, 206, 188), width=SS)
    P.put('dial_top', img)
    w, h = P.size('tin_top'); img = Image.new('RGB', (w, h), SW['tin_green'][0]); d = ImageDraw.Draw(img)
    for k, c in ((0.08, (40, 66, 50)), (0.18, (62, 94, 74)), (0.30, (44, 72, 56))):
        d.ellipse([w * k, h * k, w * (1 - k), h * (1 - k)], outline=c, width=SS * 2)
    P.put('tin_top', img)


def paint_notebook(P):
    kraft = (192, 164, 122)
    for name in ('nb_cover', 'nb_back'):
        w, h = P.size(name); img = noise(Image.new('RGB', (w, h), kraft), 4, seed=hash(name) % 99, scale=2)
        if name == 'nb_back':   # 封底右下角：店章（虛構店名）
            d = ImageDraw.Draw(img); x0, y0 = int(w * 0.50), int(h * 0.86); x1, y1 = int(w * 0.92), int(h * 0.94)
            d.rectangle([x0, y0, x1, y1], outline=(150, 48, 40), width=SS)
            P.text_c(d, (x0 + x1) / 2, y0 + (y1 - y0) * 0.18, '阿德影印輸出', int((y1 - y0) * 0.55), (150, 48, 40))
        P.put(name, img)
    w, h = P.size('nb_edge'); img = Image.new('RGB', (w, h), (244, 242, 236)); d = ImageDraw.Draw(img)
    for k in range(0, h, 2 * SS): d.line([(0, k), (w, k)], fill=(226, 224, 216), width=1)
    P.put('nb_edge', img)
    w, h = P.size('nb_spine'); img = Image.new('RGB', (w, h), (44, 44, 48)); d = ImageDraw.Draw(img)
    for k in range(0, h, 2 * SS): d.line([(0, k), (w, k)], fill=(52, 52, 56), width=1)   # 布膠帶的織紋
    P.put('nb_spine', img)


def paint_bowl(P):
    w, h = P.size('bowl_band'); img = Image.new('RGB', (w, h), SW['glaze'][0]); d = ImageDraw.Draw(img)
    pts = [(x, h * 0.55 + math.sin(x / w * math.pi * 6) * h * 0.06) for x in range(0, w + 1, 4)]
    d.line(pts, fill=(62, 92, 150), width=int(h * 0.16))   # 手畫的一圈藍線（有一點不平）
    P.put('bowl_band', noise(img, 2, seed=4))


def make_textures():
    P = Painter()
    paint_poster(P); paint_wb_print(P); paint_card(P); paint_tin_label(P); paint_dial(P); paint_notebook(P); paint_bowl(P)
    d = ImageDraw.Draw(P.im)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True)
    P.im.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = int(0.6 * 255); f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else ORM_REG[name]
        ys, ye, xs, xe = int(y0 * f), int(math.ceil(y1 * f)), int(x0 * f), int(math.ceil(x1 * f))
        orm[ys:ye, xs:xe, 1] = int(rough * 255); orm[ys:ye, xs:xe, 2] = int(min(metal, B.MAX_METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格（遊戲座標）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]
    inset = SW_CELL * 0.33 if name.startswith('sw_') else 0.6
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / N, 1 - py / N)


def R(name, flip=False):
    return lambda s, t: ruv(name, 1 - s if flip else s, t)


def S(name):   # 純色
    return lambda s, t: ruv('sw_' + name, (s * 37.0) % 1.0, (t * 53.0) % 1.0)


def newell(ps):
    n = np.zeros(3)
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    return n


class PM:
    def __init__(self): self.v = []; self.f = []; self.uv = []

    def vid(self, p): self.v.append(np.array(p, float)); return len(self.v) - 1

    def face(self, ids, uvs, want=None):
        ids, uvs = list(ids), list(uvs)
        if want is not None and np.dot(newell([self.v[i] for i in ids]), want) < 0: ids.reverse(); uvs.reverse()
        self.f.append(ids); self.uv.append(uvs)

    def poly(self, pts, uvs, want): self.face([self.vid(p) for p in pts], uvs, want)

    def add(self, other, M=None):
        off = len(self.v)
        for p in other.v: self.v.append(p if M is None else M[:3, :3] @ p + M[:3, 3])
        for ids, uvs in zip(other.f, other.uv): self.f.append([i + off for i in ids]); self.uv.append(list(uvs))
        return self

    def tris(self): return sum(len(f) - 2 for f in self.f)

    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M


def Rot(axis, a):
    c, s = math.cos(a), math.sin(a); M = np.eye(4)
    if axis == 'y': M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c
    if axis == 'x': M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c
    if axis == 'z': M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c
    return M


def lathe(pm, bands, n, caps=(), M=None):
    """繞 y 軸的旋轉體：bands＝[(r0, y0, r1, y1, uvfn(s, t), want)]，want＝'out'（朝外）／'in'（朝軸心）／'up'／'down'；
    caps＝[(r, y, uvfn, 'up'/'down')]。s＝角度比例（角度 2πs，位置 (r cos, y, r sin)；+z 正面在 s=0.25）"""
    sub = PM()
    for (r0, y0, r1, y1, fn, want) in bands:
        a = [sub.vid((r0 * math.cos(2 * math.pi * k / n), y0, r0 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        b = [sub.vid((r1 * math.cos(2 * math.pi * k / n), y1, r1 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n; o = (math.cos(ang), 0, math.sin(ang))
            w = {'out': o, 'in': (-o[0], 0, -o[2]), 'up': (0, 1, 0), 'down': (0, -1, 0)}[want]
            sub.face([a[k], a[k + 1], b[k + 1], b[k]], [fn(k / n, 0), fn((k + 1) / n, 0), fn((k + 1) / n, 1), fn(k / n, 1)], w)
    for (r, y, fn, want) in caps:
        pts = [(r * math.cos(2 * math.pi * k / n), y, r * math.sin(2 * math.pi * k / n)) for k in range(n)]
        sub.poly(pts, [fn(0.5 - p[0] / (2 * r), 0.5 + p[2] / (2 * r)) for p in pts], (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def box(pm, x0, x1, y0, y1, z0, z1, uv, faces='tbfkrl'):
    """直角盒子；uv：{面: (u, v) 函式, '*': 預設}；面＝t 上 b 下 f 前（+z）k 後（−z）r 右（+x）l 左（−x）"""
    P = {'t': ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)), 'k': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], (0, 0, -1)),
         'r': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], (1, 0, 0)), 'l': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0))}
    for k in faces:
        pts, want = P[k]; fn = uv.get(k) or uv.get('*')
        pm.poly(pts, [fn(s, t) for s, t in ((0, 0), (1, 0), (1, 1), (0, 1))], want)
    return pm


def rbox(pm, x0, x1, y0, y1, z0, z1, uv, r=0.0005, seg=1):
    """倒角方塊（lib2.rbox_bm 的形狀；SCENE_RULES 第 5 點：近景不用直角方塊）。UV 照 box() 的面：每個面依法線最接近的方向投影"""
    W, H, D = x1 - x0, y1 - y0, z1 - z0
    bm = L.rbox_bm(W, H, D, r, seg); cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2
    for f in bm.faces:
        pts = [(v.co.x + cx, v.co.z + cy, -v.co.y + cz) for v in f.verts]
        n = np.array([f.normal.x, f.normal.z, -f.normal.y]); k = int(np.argmax(np.abs(n)))
        key = {(0, 1): 'r', (0, -1): 'l', (1, 1): 't', (1, -1): 'b', (2, 1): 'f', (2, -1): 'k'}[(k, 1 if n[k] > 0 else -1)]
        fn = uv.get(key) or uv.get('*')
        def m(p):
            x, y, z = p
            return {'t': ((x - x0) / W, (z1 - z) / D), 'b': ((x - x0) / W, (z - z0) / D), 'f': ((x - x0) / W, (y - y0) / H),
                    'k': ((x1 - x) / W, (y - y0) / H), 'r': ((z1 - z) / D, (y - y0) / H), 'l': ((z - z0) / D, (y - y0) / H)}[key]
        pm.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm


def sheet(pm, W, H, nx, ny, zfn, front, back, edge=None, z0=0.0006, thick=0.0006):
    """貼在牆上的紙（xy 平面，+z 朝房間）：zfn(u, v)＝離開牆的位移；正面 front、背面 back、四邊的厚度 edge（0.6 mm：從側面看不會消失）"""
    G = []
    for side, fn, want, dz in ((0, front, (0, 0, 1), 0.0), (1, back, (0, 0, -1), -thick)):
        g = [[pm.vid((-W / 2 + W * i / nx, H * j / ny, z0 + dz + zfn(i / nx, j / ny))) for i in range(nx + 1)] for j in range(ny + 1)]
        for j in range(ny):
            for i in range(nx):
                ids = [g[j][i], g[j][i + 1], g[j + 1][i + 1], g[j + 1][i]]
                uvs = [fn(i / nx, j / ny), fn((i + 1) / nx, j / ny), fn((i + 1) / nx, (j + 1) / ny), fn(i / nx, (j + 1) / ny)]
                pm.face(ids, uvs, want)
        G.append(g)
    ed = edge or back; f, b = G
    ring = [(0, i) for i in range(nx)] + [(j, nx) for j in range(ny)] + [(ny, i) for i in range(nx, 0, -1)] + [(j, 0) for j in range(ny, 0, -1)]
    for a in range(len(ring)):
        (j0, i0), (j1, i1) = ring[a], ring[(a + 1) % len(ring)]
        p0, p1 = pm.v[f[j0][i0]], pm.v[f[j1][i1]]; mid = (p0 + p1) / 2; out = np.array([mid[0], mid[1] - H / 2, 0.0])
        pm.face([f[j0][i0], f[j1][i1], b[j1][i1], b[j0][i0]], [ed(0, 0), ed(1, 0), ed(1, 1), ed(0, 1)], out)


def tape(pm, cx, cy, z, w, h, ang, col):
    c, s = math.cos(ang), math.sin(ang)
    pts = [(cx + dx * c - dy * s, cy + dx * s + dy * c, z) for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2))]
    pm.poly(pts, [S(col)(a, b) for a, b in ((0, 0), (1, 0), (1, 1), (0, 1))], (0, 0, 1))


# ---------------- 七件 ----------------
def item_egg_timer():
    pm = PM(); n = 28
    yk, cr, gp = S('yolk'), S('cream_pl'), S('gap')
    lathe(pm, [(0.028, 0.000, 0.0315, 0.003, yk, 'out'), (0.0315, 0.003, 0.0322, 0.012, yk, 'out'), (0.0322, 0.012, 0.0318, 0.024, yk, 'out'),
               (0.0318, 0.024, 0.0300, 0.025, yk, 'up'), (0.0300, 0.025, 0.0300, 0.0265, gp, 'out'), (0.0300, 0.0265, 0.0314, 0.0272, cr, 'down'),
               (0.0314, 0.0272, 0.0314, 0.0400, R('dial_side', flip=True), 'out'), (0.0314, 0.0400, 0.0286, 0.0462, cr, 'out'),
               (0.0286, 0.0462, 0.0200, 0.0512, cr, 'out'), (0.0200, 0.0512, 0.0080, 0.0536, cr, 'out')], n,
          caps=[(0.028, 0.0, lambda s, t: gp(0.5, 0.5), 'down'), (0.0080, 0.0536, R('dial_top'), 'up')])
    kn = S('knob')   # 頂上捏著轉的那一條
    rbox(pm, -0.013, 0.013, 0.049, 0.0585, -0.0033, 0.0033, {'*': kn}, r=0.0028, seg=2)
    rd = S('red_pl')  # 正面（+z）的紅色指針
    pm.poly([(-0.0032, 0.0218, 0.03215), (0.0032, 0.0218, 0.03215), (0.0, 0.0252, 0.0305)], [rd(0, 0), rd(1, 0), rd(0.5, 1)], (0, 0.3, 1))
    return pm


def item_notebook():
    pm = PM(); W, D, c, th = 0.148, 0.210, 0.0012, 0.0095
    bd = S('board')
    # 封底（底面＝nb_back：從下面看，店章在右下）；硬紙板有 0.5 mm 的圓邊
    rbox(pm, -W / 2, W / 2, 0, c, -D / 2, D / 2, {'b': lambda s, t: ruv('nb_back', 1 - s, t), '*': bd}, r=0.0005, seg=1)
    # 書頁（書背那一側 x0 貼齊，其他三邊縮 1.5 mm）
    ed = R('nb_edge')
    rbox(pm, -W / 2 + 0.0004, W / 2 - 0.0015, c, c + th, -D / 2 + 0.0015, D / 2 - 0.0015, {'*': ed, 't': S('paper'), 'b': S('paper')}, r=0.0004, seg=1)
    # 封面（頂面＝nb_cover：從 +z 那一側看，上緣在 −z）
    yt = c + th
    rbox(pm, -W / 2, W / 2, yt, yt + c, -D / 2, D / 2, {'t': lambda s, t: ruv('nb_cover', s, t), '*': bd}, r=0.0005, seg=1)
    # 書背的布膠帶：包住書背，封面、封底各 8 mm（書背對齊）
    sp = lambda s, t: ruv('nb_spine', t, s)
    rbox(pm, -W / 2 - 0.0006, -W / 2 + 0.008, -0.0003, yt + c + 0.0003, -D / 2 - 0.0002, D / 2 + 0.0002, {'*': sp}, r=0.0009, seg=2)
    return pm


def item_tea_tin():
    pm = PM(); n = 28
    g, rim, cd = S('tin_green'), S('tin_rim'), S('card')
    lathe(pm, [(0.030, 0.000, 0.032, 0.002, g, 'out'), (0.032, 0.002, 0.032, 0.012, g, 'out'), (0.032, 0.012, 0.0322, 0.012, cd, 'down'),
               (0.0322, 0.012, 0.0322, 0.052, R('tin_label', flip=True), 'out'), (0.0322, 0.052, 0.032, 0.052, cd, 'up'),
               (0.032, 0.052, 0.032, 0.058, g, 'out'), (0.032, 0.058, 0.0334, 0.058, rim, 'down'), (0.0334, 0.058, 0.0337, 0.0605, rim, 'out'),
               (0.0337, 0.0605, 0.0335, 0.0778, g, 'out'), (0.0335, 0.0778, 0.0316, 0.0800, g, 'up')], n,
          caps=[(0.030, 0.0, lambda s, t: g(0.5, 0.5), 'down'), (0.0316, 0.0800, R('tin_top'), 'up')])
    return pm


def item_card():
    pm = PM(); W, H, th = 0.105, 0.075, math.radians(18); zb, ht, t = H * math.sin(th), H * math.cos(th), 0.0004
    fr, bk, cd = R('card_front'), S('card_back'), S('card')
    n_f = (0, math.sin(th), math.cos(th))
    def panel(sign, outer, inner):
        q = [(-W / 2, 0, sign * zb), (W / 2, 0, sign * zb), (W / 2, ht, 0), (-W / 2, ht, 0)]
        want = (0, n_f[1], sign * n_f[2])
        uv = (lambda u, v: outer(u, v)) if sign > 0 else (lambda u, v: outer(1 - u, v))
        pm.poly(q, [uv(0, 0), uv(1, 0), uv(1, 1), uv(0, 1)], want)
        q2 = [(x, y, z - sign * t / math.cos(th)) for (x, y, z) in q]
        pm.poly(q2, [inner(0, 0), inner(1, 0), inner(1, 1), inner(0, 1)], (0, -want[1], -want[2]))
    panel(1, fr, cd); panel(-1, bk, cd)
    for sign in (1, -1):   # 紙的厚度：兩側和底邊
        off = -sign * t / math.cos(th)
        for (a, b_) in (((-W / 2, 0, sign * zb), (W / 2, 0, sign * zb)), ((-W / 2, 0, sign * zb), (-W / 2, ht, 0)), ((W / 2, 0, sign * zb), (W / 2, ht, 0))):
            q = [a, b_, (b_[0], b_[1], b_[2] + off), (a[0], a[1], a[2] + off)]
            mid = np.mean(np.array(q), axis=0); out = (np.sign(mid[0]) if abs(mid[0]) > W * 0.4 else 0, -1 if abs(mid[0]) <= W * 0.4 else 0, 0)
            pm.poly(q, [cd(0, 0), cd(1, 0), cd(1, 1), cd(0, 1)], out)
    return pm


def item_whiteboard_print():
    pm = PM(); W, H = 0.297, 0.21
    def curl(u, v):   # 右下角翹起來
        a, b = max(0.0, (u - 0.72) / 0.28), max(0.0, (0.30 - v) / 0.30)
        return 0.012 * (a * b) ** 1.5
    sheet(pm, W, H, 8, 6, curl, R('wb_print'), S('paper_back'))
    for (cx, cy, ang) in ((-W / 2 + 0.012, H - 0.010, math.radians(-38)), (W / 2 - 0.012, H - 0.010, math.radians(38)), (-W / 2 + 0.012, 0.010, math.radians(38))):
        tape(pm, cx, cy, 0.0011, 0.045, 0.017, ang, 'tape_cream')
    return pm


def item_poster():
    pm = PM(); W, H = 0.42, 0.594
    sheet(pm, W, H, 4, 6, lambda u, v: 0.0022 * math.sin(math.pi * u) * math.sin(math.pi * v), R('poster'), S('paper_back'))
    for (cx, cy, ang) in ((-W / 2 + 0.014, H - 0.014, math.radians(-45)), (W / 2 - 0.014, H - 0.014, math.radians(45)),
                          (-W / 2 + 0.014, 0.014, math.radians(45)), (W / 2 - 0.014, 0.014, math.radians(-45))):
        tape(pm, cx, cy, 0.0011, 0.055, 0.019, ang, 'tape_blue')
    return pm


def bowl(pm, cx, k, food):
    """陶碗：圈足不上釉、外面白釉、碗口一圈手畫藍線、裡面淺色釉；k＝縮放（小水碗 0.62）；food＝碗裡的東西"""
    gz, gi, cl = S('glaze'), S('glaze_in'), S('clay'); n = 28 if food == 'kibble' else 20
    bands = [(0.040, 0.0, 0.042, 0.002, cl, 'out'), (0.042, 0.002, 0.042, 0.006, cl, 'out'), (0.042, 0.006, 0.046, 0.007, gz, 'up'),
             (0.046, 0.007, 0.058, 0.016, gz, 'out'), (0.058, 0.016, 0.066, 0.028, gz, 'out'), (0.066, 0.028, 0.0695, 0.037, gz, 'out'),
             (0.0695, 0.037, 0.0700, 0.045, R('bowl_band'), 'out'), (0.0700, 0.045, 0.0662, 0.0462, gz, 'up'),
             (0.0662, 0.0462, 0.0642, 0.036, gi, 'in'), (0.0642, 0.036, 0.0560, 0.024, gi, 'in'), (0.0560, 0.024, 0.0400, 0.0145, gi, 'in')]
    sc = lambda b: (b[0] * k, b[1] * k, b[2] * k, b[3] * k, b[4], b[5])
    sub = PM(); lathe(sub, [sc(b) for b in bands], n, caps=[(0.040 * k, 0.0, lambda s, t: cl(0.5, 0.5), 'down'), (0.040 * k, 0.0145 * k, gi, 'up')])
    if food == 'water':
        lathe(sub, [], n, caps=[(0.0590 * k, 0.0290 * k, S('water'), 'up')])
    elif food == 'kibble':
        rng = random.Random(41)
        for i in range(14):   # 圓角的小顆粒（上下有倒角，不是六角柱）
            rr = 0.026 * math.sqrt(rng.random()); a = rng.uniform(0, 2 * math.pi)
            px, pz = rr * math.cos(a), rr * math.sin(a); py = 0.0155 + 0.009 * (1 - rr / 0.028) + rng.uniform(0, 0.002)
            col = S('kibble' if i % 3 else 'kibble2'); piece = PM()
            lathe(piece, [(0.0045, -0.0024, 0.0066, -0.0010, col, 'out'), (0.0066, -0.0010, 0.0066, 0.0010, col, 'out'), (0.0066, 0.0010, 0.0045, 0.0024, col, 'out')], 7,
                  caps=[(0.0045, 0.0024, col, 'up'), (0.0045, -0.0024, col, 'down')])
            M = T(px, py, pz) @ Rot('y', rng.uniform(0, 3.1)) @ Rot('x', rng.uniform(-0.7, 0.7)) @ Rot('z', rng.uniform(-0.5, 0.5))
            sub.add(piece, M)
    return pm.add(sub, T(cx, 0, 0))


def item_cat_bowl():
    pm = PM(); bowl(pm, -0.036, 1.0, 'kibble'); bowl(pm, 0.080, 0.62, 'water'); return pm


ITEMS = {'WZ6_egg_timer': item_egg_timer, 'WZ6_notebook': item_notebook, 'WZ6_tea_tin': item_tea_tin, 'WZ6_card': item_card,
         'WZ6_whiteboard_print': item_whiteboard_print, 'WZ6_poster': item_poster, 'WZ6_cat_bowl': item_cat_bowl}
SPREAD = {'WZ6_egg_timer': (-0.36, 0.0), 'WZ6_tea_tin': (-0.24, 0.0), 'WZ6_card': (-0.10, 0.0), 'WZ6_notebook': (0.08, 0.02),
          'WZ6_cat_bowl': (0.32, 0.0), 'WZ6_whiteboard_print': (-0.25, -0.30), 'WZ6_poster': (0.20, -0.30)}


def to_blender(pm, name, mat, parent):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.validate(clean_customdata=False); me.update(); me.materials.append(mat)
    import bmesh   # LAWWW2-B 驗收修正：PM.vid 每個面各自一組頂點，平滑著色沒有作用（碗、罐子一格一格）→ 合併重疊頂點；UV 在 loop 上，不受影響
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=0.6)
    return ob


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('wz6_items', props={'kind': 'wz6_items'})
    mat = bpy.data.materials.new('wz6_items'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}
    for name, fn in ITEMS.items():
        pm = fn(); ob = to_blender(pm, name, mat, root)
        x, z = SPREAD[name]; ob.location = g2b(x, 0, z)
        mn, mx = pm.bbox(); mods[name] = {'tris': pm.tris(), 'min': mn, 'max': mx}
        assert pm.tris() <= 2000, (name, pm.tris())
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'WZ6_*（桌上、地上的四件）': '底面中心、y=0＝放的那個面、正面朝 +z',
                       'WZ6_whiteboard_print、WZ6_poster': '底邊中央、z=0＝牆面、+z＝離開牆（房間那一側）；紙在 z≈0.0006，紙膠帶在 z≈0.0011',
                       'WZ6_cat_bowl': '兩個碗一起：飼料碗在 x≈−0.036、水碗在 x≈+0.080'}
    info['note'] = '一個材質 wz6_items（底色 1024＋粗糙度／金屬度 256）；每件一個網格；GLB 裡的物件位置只是排開給人看（SPREAD）'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False))
    return info


if __name__ == '__main__':
    build()
