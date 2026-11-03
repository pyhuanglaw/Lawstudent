"""大步球鞋室內 v2 的自製貼圖（PIL／numpy；CC 建模子代理 2026-11-03，照使用者的參考圖 dabu_int 重做）。
用法：python3 tools/blender/env_second/bb_support/dabu_tex.py [輸出資料夾]（預設 bb_support/textures/gen/）；dabu_interior.py 也會 import 這支、直接呼叫 gen()。
輸出：
  dabu_print.png  2048×2048 印刷圖集：鞋牆上方的六張運動海報（虛構、沒有品牌）、櫃台後的木頭招牌「大步球鞋」（字畫在貼圖上）、地毯、鏡子的倒影、
                  收銀螢幕、刷卡機、鞋盒側面標籤（16 種）、價格卡（NT$，12 種）、手寫紙條（8 張）、襪子吊卡、噴霧標籤、系隊團購傳單、月曆、門口地墊、
                  員工專用門牌、支付貼紙、櫃台正面（白色檯身＋踢腳的磨痕）
  dabu_shoe.png   1024×1024 鞋子圖集：5 種鞋型 × 4 個配色＝20 格（每格 256×204）：鞋面展開圖（u＝鞋長、v＝繞鞋身一圈）＋中底＋大底＋小色塊
字型：文泉驛正黑（系統字型 wqy-zenhei，GPL＋字型例外：產生的圖不受 GPL 約束；和 AA 的 aa_int_tex.py 一樣）。店名、海報、標籤都是虛構的（D77）：
鞋上沒有勾勾、三條線或任何真實品牌的標誌；鞋側是本店虛構的「步紋」（一道從後跟往前升的弧形色片＋縫線）。"""
import math, os, random, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def F(sz): return ImageFont.truetype(FONT, sz)
def hexc(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def mix(a, b, t): return tuple(int(a[i] * (1 - t) + b[i] * t) for i in range(3))
def dk(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)

PW, PH = 2048, 2048
# 圖集格子（像素框 x0,y0,x1,y1；y 往下）。Blender 端用 uv_of(框) 轉成 UV
CELLS = {}
for i in range(6): CELLS[f'poster{i}'] = ((i % 3) * 680, (i // 3) * 340, (i % 3) * 680 + 680, (i // 3) * 340 + 340)
CELLS['sign'] = (0, 680, 672, 1160)          # 比例 1.4（＝模型裡招牌的寬高比，字不會被擠扁）
CELLS['rug'] = (1024, 680, 1536, 1192)
CELLS['mirror'] = (1536, 680, 1792, 1192)
CELLS['monitor'] = (1792, 680, 2048, 840)
CELLS['reader'] = (1792, 840, 2048, 1000)
CELLS['woodpanel'] = (1792, 1000, 2048, 1192)          # 招牌旁邊的直條木板（沒有字）
for i in range(16): CELLS[f'boxend{i}'] = (i * 128, 1200, i * 128 + 128, 1280)
for i in range(12): CELLS[f'price{i}'] = ((i % 12) * 160, 1288, (i % 12) * 160 + 160, 1384)
for i in range(8): CELLS[f'note{i}'] = (i * 256, 1392, i * 256 + 256, 1584)
for i in range(4): CELLS[f'sockcard{i}'] = (i * 64, 1592, i * 64 + 64, 1688)
for i in range(4): CELLS[f'spray{i}'] = (256 + i * 64, 1592, 256 + i * 64 + 64, 1720)
CELLS['flyer'] = (512, 1592, 768, 1940)
CELLS['calendar'] = (768, 1592, 1024, 1940)
CELLS['doormat'] = (1024, 1592, 1536, 1848)
CELLS['staffdoor'] = (1536, 1592, 1792, 1720)
CELLS['paysticker'] = (1792, 1592, 2048, 1720)
CELLS['counterfront'] = (0, 1944, 1024, 2048)
CELLS['hours'] = (1536, 1728, 1792, 1912)
CELLS['shoebag'] = (1792, 1728, 2048, 1912)

# 鞋子圖集
SW, SH = 1024, 1024
SCW, SCH = 256, 204
STYLES = ['bb_high', 'bb_mid', 'run', 'casual', 'retro']
#             base       toe        heel       accent     lining     lace       mid        out        tongue
COLS = {
    'bb_high': [('#f2f2ef', '#f2f2ef', '#8e2a2e', '#8e2a2e', '#2a2a2c', '#f7f7f5', '#f3f1ea', '#8e2a2e', '#2a2a2c'),
                ('#3a3d44', '#5c6068', '#3a3d44', '#b4b8be', '#c8663a', '#2b2d33', '#efede6', '#2b2d33', '#3a3d44'),
                ('#f4f4f2', '#f4f4f2', '#36598f', '#36598f', '#1f2f55', '#f7f7f5', '#f3f1ea', '#36598f', '#f4f4f2'),
                ('#e9e6df', '#e9e6df', '#4a4c52', '#4a4c52', '#2a2a2c', '#f2efe6', '#efe9dc', '#9a6a3e', '#e9e6df')],
    'bb_mid': [('#8b9096', '#d8d9db', '#5b5f65', '#d8d9db', '#2a2a2c', '#f0f0ee', '#f0f0ee', '#3a3c40', '#8b9096'),
               ('#f3f3f1', '#f3f3f1', '#565a60', '#565a60', '#2a2a2c', '#f7f7f5', '#f3f1ea', '#565a60', '#f3f3f1'),
               ('#2a3550', '#2a3550', '#c8c9cc', '#c8c9cc', '#b8503a', '#2a3550', '#f3f1ea', '#2a3550', '#b8503a'),
               ('#efe9dd', '#d6cfc2', '#8a3a2e', '#8a3a2e', '#3a2e28', '#efe9dd', '#efe9dd', '#a7703f', '#efe9dd')],
    'run': [('#eef0f3', '#eef0f3', '#8f959c', '#7d8fa8', '#c9ccd2', '#ffffff', '#ffffff', '#5d6166', '#eef0f3'),
            ('#2d3a5a', '#2d3a5a', '#9aa3b5', '#9aa3b5', '#1d2538', '#e9ebef', '#f4f4f2', '#2d3a5a', '#2d3a5a'),
            ('#a9aeb3', '#c9cdd1', '#e2a46a', '#e2a46a', '#5d6166', '#f4f4f2', '#f7f6f2', '#5d6166', '#a9aeb3'),
            ('#d9d4c8', '#d9d4c8', '#6e7d66', '#6e7d66', '#5a5a52', '#f2efe8', '#f2efe8', '#7a6a52', '#d9d4c8')],
    'casual': [('#f3efe6', '#f3efe6', '#4d6a4f', '#4d6a4f', '#ddd5c6', '#f3efe6', '#f3efe6', '#c9b08a', '#f3efe6'),
               ('#f6f6f4', '#f6f6f4', '#c9c9c4', '#c9c9c4', '#e2e2de', '#f6f6f4', '#f6f6f4', '#e6e6e2', '#f6f6f4'),
               ('#c8a274', '#c8a274', '#8a6542', '#f1ece2', '#5a4632', '#f1ece2', '#f1ece2', '#6e5236', '#c8a274'),
               ('#3a3b3e', '#3a3b3e', '#3a3b3e', '#f2f2ef', '#2a2b2e', '#f2f2ef', '#f2f2ef', '#2a2b2e', '#3a3b3e')],
    'retro': [('#9aa09f', '#d9d6cf', '#d9d6cf', '#2d4f7a', '#3a3a3c', '#f0ede6', '#efeae0', '#a7703f', '#9aa09f'),
              ('#2f3b5c', '#efe9dc', '#efe9dc', '#efe9dc', '#2a2a2c', '#efe9dc', '#efe9dc', '#a7703f', '#2f3b5c'),
              ('#f2f0ea', '#5c7a4f', '#5c7a4f', '#5c7a4f', '#3a3a3c', '#f2f0ea', '#f2f0ea', '#a7703f', '#f2f0ea'),
              ('#7a2e36', '#e9e1d0', '#e9e1d0', '#e9e1d0', '#2a2a2c', '#e9e1d0', '#e9e1d0', '#e9e1d0', '#7a2e36')],
}
# 鞋面展開圖在格子裡的範圍：x 4..252（u＝鞋長，0＝後跟）；y 0..150（v＝繞鞋身一圈的 8 段：0–2 右側、3 鞋口／鞋舌、4–6 左側、7 底）
UP_Y1 = 150; MID_Y = (150, 182); OUT_Y = (182, 196); PATCH_Y = (196, 204)


def shoe_cell(st, k): return (k * SCW, STYLES.index(st) * SCH)


def _text_c(d, xy, s, f, fill):
    bb = d.textbbox((0, 0), s, font=f); d.text((xy[0] - (bb[2] - bb[0]) / 2 - bb[0], xy[1] - (bb[3] - bb[1]) / 2 - bb[1]), s, font=f, fill=fill)


def _grad(w, h, top, bot):
    t = np.linspace(0, 1, h)[:, None, None]; a = np.array(top, np.float32); b = np.array(bot, np.float32)
    return Image.fromarray(np.broadcast_to(a * (1 - t) + b * t, (h, w, 3)).astype(np.uint8))


def _noise(w, h, sc, seed):
    rng = np.random.default_rng(seed); a = rng.random((h // sc + 2, w // sc + 2)).astype(np.float32)
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255.0


# ---------------------------------------------------------------- 海報（虛構的運動插畫：黃昏球場、河濱跑步、階梯上的球鞋……沒有字、沒有品牌）
def _figure(d, x, y, s, col, pose):
    """很簡單的人物剪影（逆光）：pose＝'jump'（跳投）、'run'、'run2'"""
    def limb(a, b, w): d.line([a, b], fill=col, width=max(2, int(w * s)))
    if pose == 'jump':
        hx, hy = x, y - 150 * s
        d.ellipse([hx - 11 * s, hy - 11 * s, hx + 11 * s, hy + 11 * s], fill=col)
        d.polygon([(x - 16 * s, y - 135 * s), (x + 16 * s, y - 135 * s), (x + 12 * s, y - 70 * s), (x - 12 * s, y - 70 * s)], fill=col)
        limb((x + 12 * s, y - 130 * s), (x + 30 * s, y - 180 * s), 9); limb((x - 12 * s, y - 130 * s), (x - 26 * s, y - 175 * s), 9)
        limb((x - 6 * s, y - 72 * s), (x - 14 * s, y - 30 * s), 12); limb((x - 14 * s, y - 30 * s), (x - 4 * s, y), 10)
        limb((x + 6 * s, y - 72 * s), (x + 20 * s, y - 38 * s), 12); limb((x + 20 * s, y - 38 * s), (x + 12 * s, y - 6 * s), 10)
    else:
        ph = 1 if pose == 'run' else -1
        hx, hy = x, y - 150 * s
        d.ellipse([hx - 10 * s, hy - 10 * s, hx + 10 * s, hy + 10 * s], fill=col)
        d.polygon([(x - 13 * s, y - 136 * s), (x + 13 * s, y - 136 * s), (x + 10 * s, y - 75 * s), (x - 10 * s, y - 75 * s)], fill=col)
        limb((x - 10 * s, y - 128 * s), (x - 26 * s * ph, y - 100 * s), 8); limb((x - 26 * s * ph, y - 100 * s), (x - 16 * s * ph, y - 82 * s), 7)
        limb((x + 10 * s, y - 128 * s), (x + 22 * s * ph, y - 104 * s), 8); limb((x + 22 * s * ph, y - 104 * s), (x + 34 * s * ph, y - 120 * s), 7)
        limb((x - 4 * s, y - 78 * s), (x + 22 * s * ph, y - 40 * s), 12); limb((x + 22 * s * ph, y - 40 * s), (x + 10 * s * ph, y), 10)
        limb((x + 4 * s, y - 78 * s), (x - 18 * s * ph, y - 44 * s), 12); limb((x - 18 * s * ph, y - 44 * s), (x - 34 * s * ph, y - 18 * s), 10)


def poster(k, w, h):
    rnd = random.Random(40 + k)
    if k == 0:    # 黃昏的戶外球場：跳投（參考圖左邊那張）
        p = _grad(w, h, (96, 108, 160), (246, 176, 120)); d = ImageDraw.Draw(p)
        d.ellipse([w * 0.66, h * 0.52, w * 0.66 + 70, h * 0.52 + 70], fill=(255, 214, 150))
        for i in range(7):   # 樹的剪影
            cx = rnd.uniform(0, w * 0.45); cy = h * 0.62; r = rnd.uniform(40, 80); d.ellipse([cx - r, cy - r * 1.3, cx + r, cy + r * 0.4], fill=(58, 62, 74))
        d.rectangle([0, h * 0.72, w, h], fill=(92, 84, 96))
        for x in range(int(w * 0.55), w, 14): d.line([(x, h * 0.3), (x, h * 0.74)], fill=(70, 70, 82), width=1)   # 球場的鐵網
        for y in range(int(h * 0.3), int(h * 0.74), 14): d.line([(w * 0.55, y), (w, y)], fill=(70, 70, 82), width=1)
        d.line([(w * 0.55, h * 0.3), (w * 0.55, h * 0.74)], fill=(50, 50, 60), width=4)
        d.rectangle([w * 0.5 - 3, h * 0.18, w * 0.5 + 3, h * 0.74], fill=(48, 48, 58)); d.rectangle([w * 0.44, h * 0.16, w * 0.56, h * 0.3], outline=(240, 240, 236), width=4)
        d.ellipse([w * 0.47, h * 0.29, w * 0.53, h * 0.33], outline=(230, 110, 50), width=4)
        _figure(d, w * 0.34, h * 0.88, 1.35, (52, 48, 60), 'jump'); d.ellipse([w * 0.34 + 26, h * 0.88 - 270, w * 0.34 + 56, h * 0.88 - 240], fill=(214, 104, 52))
    elif k == 1:  # 河濱跑步：兩個人在河堤上跑（參考圖中間那張）
        p = _grad(w, h, (170, 196, 222), (250, 218, 186)); d = ImageDraw.Draw(p)
        x = 0
        while x < w * 0.6:
            bw, bh = rnd.randint(24, 60), rnd.randint(30, 120); d.rectangle([x, h * 0.55 - bh, x + bw - 4, h * 0.55], fill=(150, 156, 172)); x += bw
        d.rectangle([0, h * 0.55, w, h * 0.68], fill=(120, 150, 170))
        d.polygon([(0, h * 0.68), (w, h * 0.62), (w, h), (0, h)], fill=(196, 176, 150))
        for x in range(0, w, 34): d.line([(x, h * 0.66 - x * 0.06 * h / w), (x, h * 0.6 - x * 0.06 * h / w)], fill=(90, 84, 80), width=3)
        d.line([(0, h * 0.6), (w, h * 0.54)], fill=(90, 84, 80), width=3)
        _figure(d, w * 0.42, h * 0.9, 1.15, (62, 66, 84), 'run'); _figure(d, w * 0.58, h * 0.88, 1.05, (190, 92, 100), 'run2')
    elif k == 2:  # 階梯上的球鞋（近照：兩隻白鞋、牛仔褲）
        p = _grad(w, h, (222, 206, 190), (176, 160, 150)); d = ImageDraw.Draw(p)
        for i in range(5): y = h * (0.35 + i * 0.16); d.rectangle([0, y, w, y + 8], fill=(150, 136, 128)); d.rectangle([0, y + 8, w, y + h * 0.16], fill=(196, 182, 170) if i % 2 else (206, 192, 180))
        for (x0, y0) in ((w * 0.3, h * 0.62), (w * 0.52, h * 0.7)):
            d.rectangle([x0 + 20, y0 - 210, x0 + 90, y0 - 40], fill=(92, 118, 150))
            d.rounded_rectangle([x0, y0 - 50, x0 + 150, y0 + 10], 22, fill=(246, 246, 242)); d.rectangle([x0, y0 - 2, x0 + 150, y0 + 10], fill=(220, 216, 206))
            d.line([(x0 + 40, y0 - 44), (x0 + 120, y0 - 20)], fill=(180, 184, 190), width=4)
    elif k == 3:  # 跑道起跑線
        p = _grad(w, h, (156, 196, 226), (250, 226, 196)); d = ImageDraw.Draw(p)
        d.polygon([(0, h * 0.5), (w, h * 0.42), (w, h), (0, h)], fill=(190, 96, 74))
        for j in range(8): d.line([(w * 0.02 + j * 90, h), (w * 0.56 + j * 26, h * 0.44)], fill=(246, 238, 230), width=4)
        d.rectangle([0, h * 0.34, w, h * 0.44], fill=(110, 150, 110))
        _figure(d, w * 0.62, h * 0.86, 1.1, (40, 46, 62), 'run')
    elif k == 4:  # 球場地板＋籃球（俯看）
        p = Image.new('RGB', (w, h), (214, 156, 98)); d = ImageDraw.Draw(p)
        for x in range(0, w, 26): d.line([(x, 0), (x, h)], fill=(196, 138, 84), width=2)
        d.arc([w * 0.15, h * 0.2, w * 0.85, h * 1.6], 180, 360, fill=(250, 246, 236), width=7)
        d.ellipse([w * 0.6, h * 0.3, w * 0.6 + 120, h * 0.3 + 120], fill=(222, 108, 48)); d.arc([w * 0.6, h * 0.3, w * 0.6 + 120, h * 0.3 + 120], 0, 360, fill=(60, 30, 18), width=4)
        d.line([(w * 0.6 + 60, h * 0.3), (w * 0.6 + 60, h * 0.3 + 120)], fill=(60, 30, 18), width=4); d.line([(w * 0.6, h * 0.3 + 60), (w * 0.6 + 120, h * 0.3 + 60)], fill=(60, 30, 18), width=4)
    else:         # 公園的晨跑步道（樹、長椅）
        p = _grad(w, h, (206, 226, 210), (240, 224, 190)); d = ImageDraw.Draw(p)
        for i in range(9):
            cx = rnd.uniform(0, w); r = rnd.uniform(40, 90); d.ellipse([cx - r, h * 0.2 - r * 0.2, cx + r, h * 0.2 + r * 1.4], fill=(108, 146, 100))
        d.polygon([(w * 0.3, h), (w * 0.7, h), (w * 0.55, h * 0.5), (w * 0.47, h * 0.5)], fill=(214, 200, 176))
        _figure(d, w * 0.5, h * 0.82, 0.9, (70, 80, 96), 'run2')
    p = p.filter(ImageFilter.GaussianBlur(0.7))
    a = np.asarray(p, np.float32)   # 褪色一點（貼了一兩年）：往奶油色偏、四角暗一點
    yy, xx = np.mgrid[0:h, 0:w]; vig = 1 - 0.12 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a = a * 0.9 + np.array((250, 240, 225)) * 0.1; a *= vig[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def wood_planks(w, h, base=(204, 160, 110), vertical=True, seed=5, plank=64):
    rng = np.random.default_rng(seed)
    a = np.zeros((h, w, 3), np.float32) + np.array(base, np.float32)
    n = _noise(w, h, 3, seed)[..., None]; streak = _noise(w if vertical else 4, 4 if vertical else h, 1, seed + 1)
    streak = np.asarray(Image.fromarray((streak * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32)[..., None] / 255
    a *= 0.88 + 0.12 * n; a *= 0.92 + 0.12 * streak
    if vertical:
        for x in range(0, w, plank):
            a[:, x:x + plank] *= rng.uniform(0.93, 1.05); a[:, x:x + 2] *= 0.72
    else:
        for y in range(0, h, plank):
            a[y:y + plank] *= rng.uniform(0.93, 1.05); a[y:y + 2] *= 0.72
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def sign(w, h):
    """櫃台後面的木頭招牌：淺木直條板＋深咖啡立體字「大步球鞋」＋一道橘色的「步紋」（虛構：兩段斜折的筆刷，不是任何品牌）"""
    p = wood_planks(w, h, (206, 160, 108), True, 7, 96); d = ImageDraw.Draw(p, 'RGBA')
    f = F(int(h * 0.29)); s = '大步球鞋'
    bb = d.textbbox((0, 0), s, font=f); tw = bb[2] - bb[0]; x0 = (w - tw) / 2 - bb[0] + w * 0.03; y0 = h * 0.2 - bb[1]
    for k in range(9, 0, -1): d.text((x0 + k * 1.6, y0 + k * 1.8), s, font=f, fill=(70, 50, 34, 34))      # 立體字的影子
    d.text((x0 + 3, y0 + 3), s, font=f, fill=(46, 34, 26, 255)); d.text((x0, y0), s, font=f, fill=(78, 60, 46, 255))
    yb = y0 + bb[3] + h * 0.07
    pts = [(w * 0.22, yb + 46), (w * 0.62, yb + 6), (w * 0.58, yb + 24), (w * 0.86, yb - 18), (w * 0.62, yb + 40), (w * 0.66, yb + 22)]
    d.polygon(pts, fill=(196, 98, 44, 255))
    return p


def rug(w, h):
    rnd = np.random.default_rng(7); a = np.full((h, w, 3), (176, 166, 150), np.float32)
    y = np.arange(h)[:, None]; x = np.arange(w)[None, :]
    a += (np.sin(y / 1.6) * 10)[..., None] + (np.sin(x / 1.3 + y / 7.0) * 6)[..., None] + rnd.normal(0, 7, (h, w, 1))
    a *= (0.92 + 0.1 * _noise(w, h, 40, 3))[..., None]
    edge = (np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y)) < 14); a[edge] *= 0.85
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def mirror(w, h):
    """落地鏡裡的倒影：對面的鞋牆（暖光層板）、木地板、門口的亮光，柔焦"""
    m = Image.new('RGB', (w, h), (214, 196, 172)); d = ImageDraw.Draw(m)
    d.rectangle([0, int(h * 0.74), w, h], fill=(170, 120, 82))
    d.rectangle([0, int(h * 0.1), int(w * 0.55), int(h * 0.74)], fill=(232, 214, 186))
    for j in range(6):
        y = int(h * 0.16) + j * int(h * 0.1); d.rectangle([0, y, int(w * 0.55), y + 5], fill=(255, 230, 176))
        for k in range(3): d.rounded_rectangle([6 + k * 40, y - 22, 36 + k * 40, y - 4], 5, fill=(236, 234, 228) if (j + k) % 3 else (96, 96, 100))
    d.rectangle([int(w * 0.62), int(h * 0.2), int(w * 0.95), int(h * 0.74)], fill=(244, 238, 224))   # 門口的光
    d.rectangle([int(w * 0.66), int(h * 0.3), int(w * 0.92), int(h * 0.74)], fill=(186, 206, 196))
    m = m.filter(ImageFilter.GaussianBlur(4.0)); a = np.asarray(m, np.float32) * 0.9 + np.array((8, 12, 16), np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def boxend(k, w, h):
    """鞋盒的側面（朝外那一面）：白、淺灰、深灰、牛皮紙；尺寸貼紙（US／cm）、條碼、小小的「大步」字樣"""
    base = [(238, 236, 230), (196, 198, 200), (92, 96, 102), (196, 162, 120)][k % 4]
    p = Image.new('RGB', (w, h), base); d = ImageDraw.Draw(p)
    d.rectangle([0, 0, w, 12], fill=dk(base, 0.86))                    # 盒蓋
    d.line([(0, 12), (w, 12)], fill=dk(base, 0.7), width=2)
    lx = 12 + (k * 7) % 30; d.rectangle([lx, 26, lx + 62, 70], fill=(250, 250, 246)); d.rectangle([lx, 26, lx + 62, 70], outline=(200, 200, 196))
    sz = ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 7.5'][k % 8]
    d.text((lx + 4, 28), sz, font=F(15), fill=(30, 30, 32)); d.text((lx + 4, 46), f'{24 + (k % 8) * 0.5:.1f}cm', font=F(11), fill=(70, 70, 72))
    for i in range(16): d.line([(lx + 36 + i * 1.6, 48), (lx + 36 + i * 1.6, 66)], fill=(20, 20, 20), width=1 if i % 3 else 2)
    d.text((w - 34, 52), '大步', font=F(12), fill=dk(base, 0.6) if k % 4 != 2 else (220, 220, 220))
    return p


def price(k, w, h):
    """價格卡（新台幣）：白底、橘色或深灰色的上條；有的寫「新品」「學生95折」"""
    prices = ['2,980', '3,280', '3,680', '2,480', '1,980', '4,280', '3,180', '2,680', '1,680', '3,880', '2,280', '4,680']
    tags = ['新品', '', '人氣', '', '特價', '', '', '新品', '特價', '', '學生95折', '']
    p = Image.new('RGB', (w, h), (250, 248, 242)); d = ImageDraw.Draw(p)
    top = (204, 104, 48) if tags[k] in ('特價', '新品') else (64, 66, 72)
    d.rectangle([0, 0, w, 24], fill=top); _text_c(d, (w / 2, 12), tags[k] or '大步球鞋', F(16), (255, 255, 255))
    _text_c(d, (w / 2, 58), 'NT$' + prices[k], F(30), (30, 30, 32))
    d.rectangle([0, 0, w - 1, h - 1], outline=(200, 196, 188))
    return p


NOTES = [('試穿請坐這邊\n謝謝！ ↓', (252, 232, 120)), ('運動襪\n3雙 NT$299', (250, 250, 244)), ('本週新到\n籃球鞋 →', (244, 170, 110)), ('出示學生證\n全面95折', (246, 196, 200)),
         ('7天內尺寸可換\n(請保留鞋盒)', (250, 250, 244)), ('鞋帶 一雙\nNT$60', (200, 226, 200)), ('請勿在店內\n試跑 :)', (252, 232, 120)), ('鞋墊 加購\nNT$350', (250, 250, 244))]


def note(k, w, h):
    txt, bg = NOTES[k]; rnd = random.Random(k)
    p = Image.new('RGB', (w, h), bg); d = ImageDraw.Draw(p)
    a = np.asarray(p, np.float32) * (0.95 + 0.05 * _noise(w, h, 30, k))[..., None]; p = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(p)
    d.rectangle([w * 0.3, 0, w * 0.7, 18], fill=(236, 232, 214))     # 膠帶
    ink = (40, 44, 80) if k % 2 else (30, 30, 34)
    for i, line in enumerate(txt.split('\n')):
        f = F(36 if len(line) < 7 else 30); x = 18 + rnd.randint(0, 10); y = 36 + i * 64 + rnd.randint(-4, 4)
        d.text((x, y), line, font=f, fill=ink)
    return p.rotate(rnd.uniform(-2, 2), fillcolor=bg)


def gen(outdir=None):
    outdir = outdir or os.path.join(HERE, 'textures', 'gen'); os.makedirs(outdir, exist_ok=True)
    im = Image.new('RGB', (PW, PH), (236, 230, 220))
    def put(name, img):
        x0, y0, x1, y1 = CELLS[name]; im.paste(img.resize((x1 - x0, y1 - y0)), (x0, y0))
    for i in range(6): put(f'poster{i}', poster(i, 680, 340))
    put('sign', sign(672, 480)); put('rug', rug(512, 512)); put('mirror', mirror(256, 512))
    put('woodpanel', wood_planks(256, 192, (206, 160, 108), True, 7, 48))
    s = Image.new('RGB', (256, 160), (36, 40, 46)); d = ImageDraw.Draw(s)   # 收銀螢幕（POS：品項列表、合計）
    d.rectangle([8, 8, 248, 152], fill=(232, 234, 236)); d.rectangle([8, 8, 248, 30], fill=(64, 96, 130)); d.text((14, 11), '大步球鞋 POS', font=F(14), fill=(255, 255, 255))
    for j in range(4): d.rectangle([16, 40 + j * 20, 150, 52 + j * 20], fill=(190, 196, 202)); d.text((170, 38 + j * 20), f'{[2980, 299, 60, 0][j]:,}', font=F(12), fill=(40, 40, 40))
    d.rectangle([16, 124, 240, 146], fill=(206, 110, 60)); d.text((24, 126), '合計 NT$3,339', font=F(16), fill=(255, 255, 255)); put('monitor', s)
    c = Image.new('RGB', (256, 160), (20, 22, 26)); d = ImageDraw.Draw(c); d.rectangle([20, 14, 236, 96], fill=(56, 96, 130)); d.text((40, 36), '請感應或插卡', font=F(22), fill=(240, 240, 240))
    for j in range(3):
        for k in range(4): d.rectangle([28 + k * 54, 104 + j * 18, 70 + k * 54, 116 + j * 18], fill=(110, 114, 120))
    put('reader', c)
    for i in range(16): put(f'boxend{i}', boxend(i, 128, 80))
    for i in range(12): put(f'price{i}', price(i, 160, 96))
    for i in range(8): put(f'note{i}', note(i, 256, 192))
    for i in range(4):   # 襪子吊卡（牛皮紙）
        p = Image.new('RGB', (64, 96), (196, 160, 116)); d = ImageDraw.Draw(p); d.ellipse([26, 6, 38, 18], fill=(60, 52, 44))
        _text_c(d, (32, 40), '大步', F(16), (60, 44, 30)); _text_c(d, (32, 62), ['短筒', '中筒', '長筒', '踝襪'][i], F(13), (60, 44, 30)); _text_c(d, (32, 82), 'NT$120', F(11), (60, 44, 30)); put(f'sockcard{i}', p)
    for i in range(4):   # 噴霧的標籤（除臭、防水、清潔、鞋油）
        bg = [(240, 240, 236), (60, 110, 160), (220, 120, 60), (60, 60, 66)][i]; p = Image.new('RGB', (64, 128), bg); d = ImageDraw.Draw(p)
        d.rectangle([0, 40, 64, 92], fill=(250, 250, 248) if i else (70, 150, 170))
        for j, ch in enumerate(['除臭', '防水', '清潔', '保養'][i]): _text_c(d, (32, 54 + j * 22), ch, F(18), (30, 30, 34) if i else (255, 255, 255))
        put(f'spray{i}', p)
    p = Image.new('RGB', (256, 348), (250, 246, 236)); d = ImageDraw.Draw(p)   # 系隊團購傳單
    d.rectangle([0, 0, 256, 70], fill=(40, 70, 120)); _text_c(d, (128, 36), '系隊團購', F(36), (255, 255, 255))
    for j, line in enumerate(['10雙以上 85折', '球衣、球鞋、襪子', '可代訂繡字', '歡迎系學會洽詢', '店長 小陳']): d.text((18, 90 + j * 46), line, font=F(24), fill=(30, 30, 34))
    d.rectangle([0, 320, 256, 348], fill=(206, 110, 60)); put('flyer', p)
    p = Image.new('RGB', (256, 348), (250, 250, 248)); d = ImageDraw.Draw(p)   # 月曆（2026 年 11 月）
    d.rectangle([0, 0, 256, 120], fill=(176, 196, 206)); _text_c(d, (128, 150), '2026  11月', F(26), (40, 40, 44))
    for j in range(5):
        for k in range(7):
            n = j * 7 + k - 6 + 1
            if 1 <= n <= 30: _text_c(d, (22 + k * 35, 190 + j * 32), str(n), F(16), (200, 60, 50) if k == 0 else (50, 50, 54))
    put('calendar', p)
    p = Image.new('RGB', (512, 256), (62, 60, 58)); d = ImageDraw.Draw(p)       # 門口地墊
    a = np.asarray(p, np.float32) * (0.85 + 0.25 * _noise(512, 256, 2, 9))[..., None]; p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(p)
    d.rectangle([10, 10, 502, 246], outline=(96, 92, 88), width=6); _text_c(d, (256, 128), '歡迎光臨', F(64), (150, 140, 128)); put('doormat', p)
    p = Image.new('RGB', (256, 128), (70, 72, 76)); d = ImageDraw.Draw(p); _text_c(d, (128, 48), '員工專用', F(40), (240, 240, 236)); _text_c(d, (128, 98), 'STAFF ONLY', F(20), (200, 200, 196)); put('staffdoor', p)
    p = Image.new('RGB', (256, 128), (250, 250, 248)); d = ImageDraw.Draw(p); _text_c(d, (128, 24), '可刷卡・行動支付', F(22), (40, 40, 44))
    for k, col in enumerate([(60, 120, 200), (90, 170, 90), (220, 120, 60), (140, 90, 170)]): d.rounded_rectangle([20 + k * 58, 56, 66 + k * 58, 108], 8, fill=col)   # 沒有品牌的色塊圖示
    put('paysticker', p)
    p = Image.new('RGB', (256, 184), (250, 248, 242)); d = ImageDraw.Draw(p)
    _text_c(d, (128, 30), '營業時間', F(28), (40, 40, 44)); _text_c(d, (128, 80), '11:30 – 22:00', F(30), (40, 40, 44)); _text_c(d, (128, 130), '週一公休', F(26), (190, 70, 50)); put('hours', p)
    p = Image.new('RGB', (256, 184), (238, 232, 220)); d = ImageDraw.Draw(p)   # 紙提袋的印刷
    _text_c(d, (128, 80), '大步球鞋', F(44), (78, 60, 46)); d.polygon([(40, 130), (150, 112), (144, 122), (216, 106), (150, 132), (154, 124)], fill=(196, 98, 44)); put('shoebag', p)
    # 櫃台正面：白色檯身、上緣燈條的暖光、踢腳一帶的磨痕和鞋印
    w, h = 1024, 104; a = np.full((h, w, 3), (236, 232, 224), np.float32)
    yy = np.arange(h)[:, None]; a *= (1.0 + 0.10 * np.exp(-yy / 10.0))[..., None]
    a *= (0.97 + 0.03 * _noise(w, h, 20, 4))[..., None]
    rng = np.random.default_rng(3)
    for _ in range(40):
        x = rng.integers(0, w); y = rng.integers(int(h * 0.75), h); ww = rng.integers(8, 40); a[y:y + 2, x:x + ww] *= 0.82
    a[int(h * 0.9):] *= 0.9
    for x in range(0, w, 256): a[:, x:x + 2] *= 0.88
    put('counterfront', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    out1 = os.path.join(outdir, 'dabu_print.png'); im.save(out1)
    out2 = os.path.join(outdir, 'dabu_shoe.png'); gen_shoes().save(out2)
    return out1, out2


# ---------------------------------------------------------------- 鞋子圖集
def gen_shoes():
    im = Image.new('RGB', (SW, SH), (240, 240, 238))
    for si, st in enumerate(STYLES):
        for k in range(4):
            x0, y0 = shoe_cell(st, k); cell = shoe_one(st, k); im.paste(cell, (x0, y0))
    return im


def shoe_one(st, k):
    base, toe, heel, accent, lining, lace, mid, out, tongue = [hexc(c) for c in COLS[st][k]]
    w, h = SCW, SCH; p = Image.new('RGB', (w, h), base); d = ImageDraw.Draw(p)
    U = lambda t: 4 + t * 248                        # 鞋長 t（0 後跟～1 鞋頭）→ x
    band = UP_Y1 / 8.0
    V = lambda j: j * band                           # 第 j 段的上緣
    # 鞋面底色＋面料的細紋
    a = np.asarray(p, np.float32); nn = _noise(w, h, 2, k * 7 + len(st)); a *= (0.96 + 0.05 * nn)[..., None]; p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(p)
    for side in (0, 1):   # 0＝右側 j 0..3、1＝左側 j 4..7（左側上下顛倒：j=4 靠鞋口、j=6 靠鞋底）
        def SY(f):   # f：0＝鞋底、1＝鞋口（側面的高度比例）→ y
            return V(3) * (1 - f) if side == 0 else V(4) + V(3) * f
        # 鞋頭包覆（toe）、後跟（heel）
        d.polygon([(U(0.78), SY(0)), (U(1.0), SY(0)), (U(1.0), SY(1)), (U(0.86), SY(1)), (U(0.80), SY(0.5))], fill=toe)
        d.polygon([(U(0.0), SY(0)), (U(0.16), SY(0)), (U(0.13), SY(0.6)), (U(0.10), SY(1)), (U(0.0), SY(1))], fill=heel)
        # 步紋（虛構）：一條等寬、往前微微上升的側片（前端斜切）＋上緣縫線；不是勾勾、不是三條線
        poly = [(U(0.15), SY(0.14)), (U(0.66), SY(0.30)), (U(0.70), SY(0.58)), (U(0.15), SY(0.42))]
        d.polygon(poly, fill=accent)
        for i in range(0, 52, 2):
            f = i / 52; d.point((U(0.15 + 0.53 * f), SY(0.45 + 0.16 * f) + (0 if side == 0 else 0)), fill=dk(accent, 0.6) if accent[0] > 90 else mix(accent, (255, 255, 255), 0.4))
        # 縫線：沿著鞋頭包覆、後跟的邊
        for i in range(0, 40, 2):
            f = i / 40; d.point((U(0.80 + 0.06 * f), SY(0.5 + 0.5 * f)), fill=dk(toe, 0.6)); d.point((U(0.13 - 0.03 * f), SY(0.6 + 0.4 * f)), fill=dk(heel, 0.6))
        # 鞋頭的透氣孔
        for i in range(4):
            for j in range(2): d.point((U(0.88 + i * 0.025), SY(0.35 + j * 0.2)), fill=dk(toe, 0.7))
        # 後跟的小布標（沒有字）
        d.rectangle([U(0.02), SY(0.75) - 3, U(0.06), SY(0.75) + 3], fill=lining)
        # 鞋帶孔那一條（靠鞋口那一段的上緣）
        ey0, ey1 = (V(2), V(3)) if side == 0 else (V(4), V(5))
        d.rectangle([U(0.30), ey0 + band * 0.25, U(0.72), ey1 - band * 0.15], fill=dk(base, 0.82) if base[0] > 120 else mix(base, (255, 255, 255), 0.2))
        for i in range(6):
            x_ = U(0.32 + i * 0.07); y_ = (ey0 + ey1) / 2; d.ellipse([x_ - 2.2, y_ - 2.2, x_ + 2.2, y_ + 2.2], fill=(210, 210, 206) if base[0] < 120 else (90, 90, 92))
        # 中底的接縫陰影（鞋面最下緣暗一點）
        yb = SY(0); d.line([(U(0), yb + (-1 if side == 0 else 1)), (U(1), yb + (-1 if side == 0 else 1))], fill=dk(base, 0.7), width=2)
    # 鞋口／鞋舌那一段（j=3）：內裡色在鞋口、鞋舌色在中間、鞋頭色在前面
    d.rectangle([0, V(3), w, V(4)], fill=tongue); d.rectangle([0, V(3), U(0.26), V(4)], fill=lining); d.rectangle([U(0.76), V(3), w, V(4)], fill=toe)
    d.rectangle([0, V(7), w, V(8)], fill=mid)
    # 中底：白／米色，中間一道細的色線；靠下緣暗一點（地面的髒）
    d.rectangle([0, MID_Y[0], w, MID_Y[1]], fill=mid)
    d.line([(0, MID_Y[0] + 12), (w, MID_Y[0] + 12)], fill=accent, width=2)
    for x_ in range(0, w, 6): d.point((x_, MID_Y[0] + 4), fill=dk(mid, 0.85))
    d.rectangle([0, MID_Y[1] - 4, w, MID_Y[1]], fill=dk(mid, 0.82))
    # 大底：橡膠色＋紋路
    d.rectangle([0, OUT_Y[0], w, OUT_Y[1]], fill=out)
    for x_ in range(0, w, 5): d.line([(x_, OUT_Y[0]), (x_ + 2, OUT_Y[1])], fill=dk(out, 0.75))
    # 小色塊：鞋帶、鞋舌、內裡、大底
    for i, c in enumerate((lace, tongue, lining, out)): d.rectangle([i * 64, PATCH_Y[0], i * 64 + 63, PATCH_Y[1]], fill=c)
    return p


if __name__ == '__main__':
    print(gen(sys.argv[1] if len(sys.argv) > 1 else None))
