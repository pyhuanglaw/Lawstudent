"""社團博覽會的攤位（LAWWW 2026-10-13 22:01Z 分派①；AA_110 6-8 (b)，AA 暫定）→ GLB。PROPOSAL→MODEL_READY，整合由 LAWWW 做。
  /opt/blenv/bin/python tools/blender/env_second/club_fair.py [-- --out 輸出.glb]

每個攤位一個網格（booth_<id>），全部共用一個材質 club_fair（2048×1024 印刷圖貼圖集＋純色小格；粗糙度／金屬度 256）。
原點＝帳篷中心的地面；+z＝攤位正面（桌子、垂簾的字）；放在大道南側時轉 π（面向北＝大道）。帳篷 3×3 m、屋簷 2.05 m、屋頂尖 2.9 m。
攤位：hiking 登山社、lawclub 法服（法律服務社）、info 社團博覽會服務台（集合點）、guitar 吉他社、debate 辯論社、basketball 系籃（法律系系學會）、bg1–bg3 背景攤（不具名）。
社團名稱照 src/data/activities.js 的 clubName；標語是一般的招生用語，不寫社課時間（時間是企劃的內容）。
每一攤：折疊帳篷（鋁腳、上緣的剪刀架、屋頂帆布兩面、四邊垂簾印社名）、後面的背板、摺疊桌＋桌巾（正面印社名）、兩張折疊椅、易拉展（背景攤沒有）、
桌上的傳單、報名表、壓克力立牌、四個沙包；各社自己的東西（吉他＋音箱、天平與書、講台、登山背包與登山杖、籃球與球袋、地圖看板、相機腳架、桌遊盒、手作）。
貼圖全部程式畫（PIL）：字是 WenQuanYi Zen Hei（只畫進貼圖）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402
from pmesh import PM, T, Ry, Rx, Rz, S, frame, prism, box, lathe, bar, to_blender   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/club_fair.glb'
GEN = os.path.join(HERE, 'textures', 'gen')
ATLAS, ATLAS_ORM = os.path.join(GEN, 'club_fair_atlas.png'), os.path.join(GEN, 'club_fair_orm.png')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
NW, NH, SS = 2048, 1024, 2

BOOTHS = [   # id, 社名（垂簾）, 桌巾, 標語, 主色, 第二色, 帆布
    ('hiking', '登山社', '登山社', '一起去爬山', '#3f6e45', '#2f4f6a', 'white'),
    ('lawclub', '法服　法律服務社', '法服', '讀書會・法律服務', '#2b4576', '#c9a54e', 'white'),
    ('info', '社團博覽會　服務台', '服務台', '社團地圖・活動資訊', '#5a6c80', '#d8a33a', 'white'),
    ('guitar', '吉他社', '吉他社', '新生招募中・歡迎試彈', '#c4702a', '#3b2a22', 'white'),
    ('debate', '辯論社', '辯論社', '來辯一場', '#a3333a', '#1f2f4a', 'white'),
    ('basketball', '法律系系學會　系籃', '系學會', '系籃新血招募', '#d0622a', '#1c1c1e', 'white'),
    ('bg1', None, None, None, '#5b86b8', '#e8eef4', 'blue'),
    ('bg2', None, None, None, '#b8945a', '#f2ead8', 'white'),
    ('bg3', None, None, None, '#6aa07c', '#eef2ea', 'white'),
]
IDS = [b[0] for b in BOOTHS]

# ---------------- 貼圖集區域（2048×1024 的像素）----------------
REG = {}
for i, bid in enumerate(IDS):
    REG['val_' + bid] = (0, i * 38, 512, i * 38 + 38)                                    # 垂簾 3.0×0.22 m
    REG['cloth_' + bid] = (512 + (i % 2) * 256, (i // 2) * 98, 512 + (i % 2) * 256 + 256, (i // 2) * 98 + 98)   # 桌巾正面 1.85×0.70
    REG['ban_' + bid] = (1024 + (i % 2) * 384, (i // 2) * 178, 1024 + (i % 2) * 384 + 384, (i // 2) * 178 + 178)   # 背板 2.8×1.3
for i, bid in enumerate(IDS[:6]):
    REG['std_' + bid] = ((i % 4) * 128, 342 + (i // 4) * 320, (i % 4) * 128 + 128, 342 + (i // 4) * 320 + 320)   # 易拉展 0.8×2.0
MISC = {'flyer_a': (512, 490, 576, 554), 'flyer_b': (576, 490, 640, 554), 'flyer_c': (640, 490, 704, 554), 'sheet': (704, 490, 768, 554), 'sign': (768, 490, 832, 554),
        'guitar_top': (512, 554, 640, 682), 'guitar_side': (640, 554, 768, 586), 'amp': (768, 554, 832, 618), 'ball': (832, 490, 960, 618),
        'map': (512, 682, 704, 810), 'scale': (704, 682, 768, 746), 'books': (768, 682, 896, 746), 'game_a': (896, 682, 960, 746), 'game_b': (960, 682, 1024, 746),
        'photos': (704, 746, 896, 810), 'pack': (512, 810, 640, 938), 'sandbag': (640, 810, 704, 874), 'podium': (704, 810, 832, 938), 'craft': (832, 810, 960, 938)}
REG.update(MISC)
SW = {   # 純色（sRGB）、粗糙度、金屬度
    'canopy_white': ((240, 240, 236), 0.8, 0.0), 'canopy_under': ((206, 206, 200), 0.85, 0.0), 'canopy_blue': ((92, 132, 178), 0.8, 0.0), 'canopy_blue_u': ((70, 102, 140), 0.85, 0.0),
    'alu': ((186, 190, 196), 0.4, 0.45), 'alu_dark': ((120, 124, 130), 0.45, 0.4), 'table_top': ((236, 236, 232), 0.55, 0.0), 'steel': ((80, 84, 90), 0.45, 0.35),
    'chair_seat': ((46, 50, 56), 0.5, 0.0), 'chair_frame': ((150, 154, 160), 0.4, 0.4), 'paper': ((244, 242, 236), 0.85, 0.0), 'acrylic': ((210, 222, 228), 0.2, 0.0),
    'wood_dark': ((92, 62, 40), 0.55, 0.0), 'black': ((26, 26, 28), 0.6, 0.0), 'strap': ((60, 64, 70), 0.85, 0.0), 'rope': ((196, 160, 70), 0.9, 0.0),
    'gold': ((200, 166, 84), 0.35, 0.45), 'net': ((232, 232, 228), 0.9, 0.0), 'tripod': ((38, 38, 42), 0.45, 0.2), 'lens': ((20, 22, 26), 0.2, 0.0),
}
for bid, _, _, _, c1, c2, _ in BOOTHS:
    SW['c1_' + bid] = (tuple(int(c1[k:k + 2], 16) for k in (1, 3, 5)), 0.85, 0.0)
    SW['c2_' + bid] = (tuple(int(c2[k:k + 2], 16) for k in (1, 3, 5)), 0.85, 0.0)
SWC = 32
for i, k in enumerate(SW):
    cx, cy = 1792 + (i % 8) * SWC, (i // 8) * SWC
    REG['sw_' + k] = (cx, cy, cx + SWC, cy + SWC)
ORM_REG = {'val': 0.85, 'cloth': 0.9, 'ban': 0.85, 'std': 0.6, 'flyer': 0.7, 'sheet': 0.8, 'sign': 0.25, 'guitar': 0.35, 'amp': 0.8, 'ball': 0.75, 'map': 0.6, 'scale': 0.4,
           'books': 0.7, 'game': 0.6, 'photos': 0.5, 'pack': 0.85, 'sandbag': 0.95, 'podium': 0.55, 'craft': 0.7}


def hex2rgb(h): return tuple(int(h[k:k + 2], 16) for k in (1, 3, 5))


# ---------------- 貼圖 ----------------
class Painter:
    def __init__(self):
        self.im = Image.new('RGB', (NW * SS, NH * SS), (128, 128, 128)); self.fonts = {}

    def font(self, px):
        px = max(6, int(round(px)))
        if px not in self.fonts: self.fonts[px] = ImageFont.truetype(FONT, px)
        return self.fonts[px]

    def sub(self, name):
        x0, y0, x1, y1 = REG[name]; return Image.new('RGB', ((x1 - x0) * SS, (y1 - y0) * SS))

    def put(self, name, img):
        x0, y0, _, _ = REG[name]; self.im.paste(img, (x0 * SS, y0 * SS))

    def ctext(self, d, cx, cy, text, px, fill, bold=True, maxw=None):
        f = self.font(px)
        w, h = d.textbbox((0, 0), text, font=f)[2:]
        if maxw and w > maxw:
            f = self.font(px * maxw / w); w, h = d.textbbox((0, 0), text, font=f)[2:]
        d.text((cx - w / 2, cy - h / 2), text, font=f, fill=fill)
        if bold: d.text((cx - w / 2 + max(1, px // 22), cy - h / 2), text, font=f, fill=fill)


def noise(img, amp, seed):
    a = np.asarray(img, np.float32); r = np.random.default_rng(seed); a += r.normal(0, amp, a.shape[:2] + (1,)).astype(np.float32)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def weave(img, amp=4):
    a = np.asarray(img, np.float32); h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w]
    a += (np.sin(xx * 1.9) * np.sin(yy * 1.9) * amp)[..., None]; return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def motif(d, bid, x0, y0, w, h, C1, C2):
    """易拉展中間的圖（和背板同一個主題，簡化）"""
    cx, cy = x0 + w / 2, y0 + h / 2; s = min(w, h) * 0.42
    if bid == 'hiking':
        d.polygon([(x0, y0 + h), (x0 + w * 0.35, y0 + h * 0.25), (x0 + w * 0.6, y0 + h * 0.6), (x0 + w * 0.78, y0 + h * 0.35), (x0 + w, y0 + h)], fill=C1)
        d.polygon([(x0 + w * 0.29, y0 + h * 0.37), (x0 + w * 0.35, y0 + h * 0.25), (x0 + w * 0.41, y0 + h * 0.37)], fill=(245, 245, 245))
    elif bid == 'lawclub':
        d.line([(cx, cy - s), (cx, cy + s)], fill=C2, width=max(2, int(s * 0.12))); d.line([(cx - s, cy - s * 0.55), (cx + s, cy - s * 0.55)], fill=C2, width=max(2, int(s * 0.1)))
        for sx in (-1, 1): d.chord([cx + sx * s - s * 0.35, cy - s * 0.15, cx + sx * s + s * 0.35, cy + s * 0.3], 0, 180, fill=C2)
        d.rectangle([cx - s * 0.5, cy + s * 0.9, cx + s * 0.5, cy + s], fill=C2)
    elif bid == 'info':
        for k in range(9): d.rectangle([x0 + w * (0.08 + (k % 3) * 0.3), y0 + h * (0.1 + (k // 3) * 0.3), x0 + w * (0.3 + (k % 3) * 0.3), y0 + h * (0.32 + (k // 3) * 0.3)], fill=hex2rgb(BOOTHS[k][4]))
    elif bid == 'guitar':
        d.ellipse([cx - s * 0.7, cy - s * 0.1, cx + s * 0.7, cy + s * 1.0], fill=(70, 46, 30)); d.ellipse([cx - s * 0.55, cy - s * 0.6, cx + s * 0.55, cy + s * 0.3], fill=(70, 46, 30))
        d.rectangle([cx - s * 0.1, cy - s * 1.0, cx + s * 0.1, cy - s * 0.4], fill=(70, 46, 30)); d.ellipse([cx - s * 0.18, cy + s * 0.15, cx + s * 0.18, cy + s * 0.5], fill=C1)
    elif bid == 'debate':
        d.rounded_rectangle([x0 + w * 0.08, y0 + h * 0.15, x0 + w * 0.55, y0 + h * 0.55], radius=int(h * 0.08), fill=C1)
        d.rounded_rectangle([x0 + w * 0.45, y0 + h * 0.45, x0 + w * 0.92, y0 + h * 0.85], radius=int(h * 0.08), fill=C2)
    elif bid == 'basketball':
        d.ellipse([cx - s, cy - s, cx + s, cy + s], fill=(214, 108, 44)); d.line([(cx - s, cy), (cx + s, cy)], fill=(30, 30, 30), width=3); d.line([(cx, cy - s), (cx, cy + s)], fill=(30, 30, 30), width=3)


def paint_booth(P, bid, title, cloth, slogan, c1, c2, canopy, i):
    C1, C2 = hex2rgb(c1), hex2rgb(c2); W_ = (250, 250, 248)
    # 垂簾：主色布＋白字（背景攤：條紋，沒有字）
    v = P.sub('val_' + bid); w, h = v.size; d = ImageDraw.Draw(v); d.rectangle([0, 0, w, h], fill=C1)
    if title:
        d.rectangle([0, h * 0.86, w, h], fill=C2); P.ctext(d, w / 2, h * 0.45, title, h * 0.62, W_, maxw=w * 0.9)
    else:
        for k in range(0, w, int(h * 1.2)): d.rectangle([k, 0, k + h * 0.6, h], fill=C2)
    P.put('val_' + bid, weave(v))
    # 桌巾正面
    c = P.sub('cloth_' + bid); w, h = c.size; d = ImageDraw.Draw(c); d.rectangle([0, 0, w, h], fill=C1 if title else C2)
    if title:
        d.rectangle([0, h * 0.78, w, h * 0.84], fill=C2); P.ctext(d, w / 2, h * 0.36, cloth, h * 0.36, W_, maxw=w * 0.8)
        P.ctext(d, w / 2, h * 0.62, slogan, h * 0.12, W_, bold=False, maxw=w * 0.86)
    else:
        for k in range(5): d.ellipse([w * (0.1 + k * 0.18), h * 0.3, w * (0.2 + k * 0.18), h * 0.6], fill=C1)
    P.put('cloth_' + bid, weave(c, 3))
    # 背板（後面的大圖）
    b = P.sub('ban_' + bid); w, h = b.size; d = ImageDraw.Draw(b)
    g = np.linspace(0, 1, h)[:, None, None]; arr = np.array(C1)[None, None] * (1 - g * 0.35) + np.array(C2)[None, None] * (g * 0.35)
    b = Image.fromarray((arr * np.ones((1, w, 1))).astype(np.uint8)); d = ImageDraw.Draw(b)
    if bid == 'hiking':
        for k, (yy, col) in enumerate(((0.55, (60, 96, 70)), (0.68, (44, 74, 56)), (0.8, (32, 56, 44)))):
            pts = [(0, h)] + [(x, h * yy - (math.sin(x / w * 7 + k) * 0.5 + 0.5) * h * 0.25) for x in np.linspace(0, w, 24)] + [(w, h)]; d.polygon(pts, fill=col)
        d.polygon([(w * 0.62, h * 0.32), (w * 0.7, h * 0.12), (w * 0.78, h * 0.32)], fill=(240, 240, 240))
    elif bid == 'lawclub':
        cx, cy, s = w * 0.22, h * 0.5, h * 0.32; g_ = C2
        d.line([(cx, cy - s), (cx, cy + s)], fill=g_, width=int(s * 0.12)); d.line([(cx - s, cy - s * 0.6), (cx + s, cy - s * 0.6)], fill=g_, width=int(s * 0.1))
        for sx in (-1, 1):
            d.line([(cx + sx * s, cy - s * 0.6), (cx + sx * s * 0.7, cy + s * 0.1)], fill=g_, width=3); d.line([(cx + sx * s, cy - s * 0.6), (cx + sx * s * 1.3, cy + s * 0.1)], fill=g_, width=3)
            d.chord([cx + sx * s - s * 0.35, cy - s * 0.1, cx + sx * s + s * 0.35, cy + s * 0.3], 0, 180, fill=g_)
        d.rectangle([cx - s * 0.5, cy + s, cx + s * 0.5, cy + s * 1.1], fill=g_)
    elif bid == 'info':
        d.rectangle([w * 0.05, h * 0.25, w * 0.42, h * 0.92], fill=(244, 242, 236))
        for k in range(9): d.rectangle([w * (0.07 + (k % 3) * 0.12), h * (0.32 + (k // 3) * 0.2), w * (0.16 + (k % 3) * 0.12), h * (0.45 + (k // 3) * 0.2)], fill=hex2rgb(BOOTHS[k][4]))
    elif bid == 'guitar':
        cx, cy = w * 0.2, h * 0.55
        d.ellipse([cx - h * 0.22, cy - h * 0.05, cx + h * 0.22, cy + h * 0.38], fill=(70, 46, 30)); d.ellipse([cx - h * 0.17, cy - h * 0.25, cx + h * 0.17, cy + h * 0.08], fill=(70, 46, 30))
        d.rectangle([cx - h * 0.03, cy - h * 0.62, cx + h * 0.03, cy - h * 0.2], fill=(70, 46, 30)); d.ellipse([cx - h * 0.06, cy + h * 0.06, cx + h * 0.06, cy + h * 0.18], fill=C1)
        for k in range(4): d.ellipse([w * (0.3 + k * 0.035), h * (0.12 + (k % 2) * 0.08), w * (0.315 + k * 0.035), h * (0.17 + (k % 2) * 0.08)], fill=W_)
    elif bid == 'debate':
        for k, (x, y, s, col, t) in enumerate(((0.16, 0.5, 0.28, W_, '正方'), (0.36, 0.62, 0.24, C2, '反方'))):
            d.rounded_rectangle([w * x - h * s, h * y - h * s * 0.6, w * x + h * s, h * y + h * s * 0.6], radius=int(h * 0.08), fill=col)
            P.ctext(d, w * x, h * y, t, h * s * 0.55, C1 if col == W_ else W_)
    elif bid == 'basketball':
        cx, cy, r = w * 0.2, h * 0.55, h * 0.3
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(214, 108, 44)); d.line([(cx - r, cy), (cx + r, cy)], fill=(30, 30, 30), width=4); d.line([(cx, cy - r), (cx, cy + r)], fill=(30, 30, 30), width=4)
        d.arc([cx - r * 1.4, cy - r, cx - r * 0.2, cy + r], -60, 60, fill=(30, 30, 30), width=4); d.arc([cx + r * 0.2, cy - r, cx + r * 1.4, cy + r], 120, 240, fill=(30, 30, 30), width=4)
    else:
        rng = np.random.default_rng(70 + i)
        for k in range(7):
            x, y, s = rng.uniform(0.05, 0.95) * w, rng.uniform(0.1, 0.9) * h, rng.uniform(0.08, 0.2) * h
            col = (W_, C2, tuple(int(v * 0.8) for v in C1))[k % 3]
            (d.ellipse if k % 2 else d.rectangle)([x - s, y - s, x + s, y + s], fill=col)
    if title:
        P.ctext(d, w * 0.66 if bid in ('lawclub', 'guitar', 'debate', 'basketball', 'info') else w * 0.36, h * 0.38, cloth if bid != 'info' else '社團博覽會', h * 0.2, W_, maxw=w * 0.55)
        P.ctext(d, w * 0.66 if bid in ('lawclub', 'guitar', 'debate', 'basketball', 'info') else w * 0.36, h * 0.66, slogan, h * 0.1, W_, bold=False, maxw=w * 0.55)
    P.put('ban_' + bid, noise(b, 2.5, 80 + i))
    # 易拉展
    if 'std_' + bid in REG:
        s = P.sub('std_' + bid); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=W_)
        d.rectangle([0, 0, w, h * 0.36], fill=C1); d.rectangle([0, h * 0.9, w, h], fill=C1)
        P.ctext(d, w / 2, h * 0.16, cloth, w * 0.24, W_, maxw=w * 0.86)
        d.rectangle([w * 0.1, h * 0.42, w * 0.9, h * 0.72], fill=tuple(int(v * 0.35 + 255 * 0.65) for v in C1))
        motif(d, bid, w * 0.1, h * 0.42, w * 0.8, h * 0.3, C1, C2)
        P.ctext(d, w / 2, h * 0.8, '新生招募中' if bid != 'info' else '9/30・10/1', w * 0.12, C1, maxw=w * 0.86)
        P.put('std_' + bid, s)


def paint_misc(P):
    def solid(name, col, seed=0, n=3.0):
        s = P.sub(name); s.paste(col, (0, 0) + s.size); P.put(name, noise(s, n, seed))
    for name, col in (('flyer_a', (236, 120, 70)), ('flyer_b', (90, 140, 200)), ('flyer_c', (120, 180, 120))):
        s = P.sub(name); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(246, 244, 238)); d.rectangle([0, 0, w, h * 0.35], fill=col)
        for k in range(4): d.rectangle([w * 0.1, h * (0.45 + k * 0.12), w * 0.9, h * (0.5 + k * 0.12)], fill=(150, 150, 150))
        P.put(name, s)
    s = P.sub('sheet'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(246, 244, 238))
    for k in range(9): d.line([(w * 0.08, h * (0.15 + k * 0.09)), (w * 0.92, h * (0.15 + k * 0.09))], fill=(160, 160, 160), width=2)
    for k in range(5): d.line([(w * 0.12, h * (0.13 + k * 0.09)), (w * (0.4 + (k * 7 % 4) * 0.08), h * (0.13 + k * 0.09))], fill=(40, 60, 140), width=3)
    P.put('sheet', s)
    s = P.sub('sign'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(250, 250, 248)); P.ctext(d, w / 2, h * 0.4, '報名', h * 0.28, (40, 40, 40)); P.ctext(d, w / 2, h * 0.72, 'QR', h * 0.18, (40, 40, 40)); P.put('sign', s)
    s = P.sub('guitar_top'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(214, 168, 108))
    a = np.asarray(s, np.float32); a *= (0.92 + 0.08 * np.sin(np.arange(w) * 0.9))[None, :, None]; s = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(s)
    d.ellipse([w * 0.38, h * 0.38, w * 0.62, h * 0.62], fill=(30, 22, 18)); d.ellipse([w * 0.34, h * 0.34, w * 0.66, h * 0.66], outline=(60, 40, 26), width=4)
    d.rectangle([w * 0.42, h * 0.74, w * 0.58, h * 0.8], fill=(60, 40, 26)); P.put('guitar_top', s)
    solid('guitar_side', (120, 74, 40), 5)
    s = P.sub('amp'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(30, 30, 32)); d.ellipse([w * 0.15, h * 0.2, w * 0.85, h * 0.9], fill=(52, 52, 56))
    d.rectangle([0, 0, w, h * 0.12], fill=(190, 160, 90)); P.put('amp', s)
    s = P.sub('ball'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(210, 104, 42))
    s = noise(s, 6, 9); d = ImageDraw.Draw(s)
    for x in (w * 0.25, w * 0.5, w * 0.75): d.line([(x, 0), (x, h)], fill=(30, 26, 24), width=3)
    d.line([(0, h * 0.5), (w, h * 0.5)], fill=(30, 26, 24), width=3); P.put('ball', s)
    s = P.sub('map'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(246, 244, 236)); d.rectangle([w * 0.05, h * 0.42, w * 0.95, h * 0.58], fill=(170, 170, 170))
    for k in range(9): d.rectangle([w * (0.06 + k * 0.1), h * 0.62, w * (0.14 + k * 0.1), h * 0.74], fill=hex2rgb(BOOTHS[k][4]))
    P.ctext(d, w / 2, h * 0.2, '社團地圖', h * 0.16, (40, 40, 40)); P.put('map', s)
    s = P.sub('scale'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(200, 166, 84)); P.put('scale', noise(s, 5, 11))
    s = P.sub('books'); w, h = s.size; d = ImageDraw.Draw(s)
    for k, col in enumerate(((40, 60, 110), (130, 40, 40), (30, 90, 80), (190, 170, 120))): d.rectangle([k * w / 4, 0, (k + 1) * w / 4, h], fill=col); d.rectangle([k * w / 4, h * 0.2, (k + 1) * w / 4, h * 0.26], fill=(220, 190, 110))
    P.put('books', s)
    for name, c in (('game_a', (200, 70, 60)), ('game_b', (60, 120, 180))):
        s = P.sub(name); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=c); d.ellipse([w * 0.2, h * 0.2, w * 0.8, h * 0.8], fill=(240, 220, 120)); P.put(name, s)
    s = P.sub('photos'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(30, 30, 32)); rng = np.random.default_rng(13)
    for k in range(6):
        x0 = (k % 3) * w / 3 + 4; y0 = (k // 3) * h / 2 + 4; c0 = tuple(int(v) for v in rng.uniform(60, 230, 3))
        d.rectangle([x0, y0, x0 + w / 3 - 8, y0 + h / 2 - 8], fill=c0); d.rectangle([x0, y0 + (h / 2 - 8) * 0.6, x0 + w / 3 - 8, y0 + h / 2 - 8], fill=tuple(int(v * 0.6) for v in c0))
    P.put('photos', s)
    s = P.sub('pack'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(176, 64, 48)); d.rectangle([0, h * 0.62, w, h * 0.7], fill=(40, 40, 44)); d.rectangle([w * 0.3, 0, w * 0.36, h], fill=(40, 40, 44))
    P.put('pack', weave(s, 6))
    solid('sandbag', (198, 182, 140), 17, 8)
    s = P.sub('podium'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(110, 76, 50)); d.rectangle([w * 0.2, h * 0.25, w * 0.8, h * 0.45], fill=(200, 170, 90)); P.put('podium', noise(s, 4, 19))
    s = P.sub('craft'); w, h = s.size; d = ImageDraw.Draw(s); d.rectangle([0, 0, w, h], fill=(240, 232, 214)); rng = np.random.default_rng(23)
    for k in range(14):
        x, y, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(4, 14); d.ellipse([x - r, y - r, x + r, y + r], fill=tuple(int(v) for v in rng.uniform(60, 230, 3)))
    P.put('craft', s)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; ImageDraw.Draw(P.im).rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)


def make_textures():
    P = Painter()
    for i, bk in enumerate(BOOTHS): paint_booth(P, *bk[:6], bk[6], i)
    paint_misc(P)
    os.makedirs(GEN, exist_ok=True)
    P.im.resize((NW, NH), Image.LANCZOS).save(ATLAS)
    O = 256; orm = np.zeros((O // 2, O, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = int(0.8 * 255); fx, fy = O / NW, (O // 2) / NH
    for name, (x0, y0, x1, y1) in REG.items():
        if name.startswith('sw_'): rough, metal = SW[name[3:]][1:]
        else: rough, metal = ORM_REG.get(name.split('_')[0], 0.8), 0.0
        orm[int(y0 * fy):int(math.ceil(y1 * fy)), int(x0 * fx):int(math.ceil(x1 * fx)), 1] = int(rough * 255)
        orm[int(y0 * fy):int(math.ceil(y1 * fy)), int(x0 * fx):int(math.ceil(x1 * fx)), 2] = int(metal * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ---------------- 網格 ----------------
def ruv(name, s, t, inset=0.7):
    x0, y0, x1, y1 = REG[name]
    if name.startswith('sw_'): inset = SWC * 0.3
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / NW, 1 - py / NH)


def sw(name):
    def f(*a):
        if len(a) == 1: a = (a[0][0] + a[0][1] * 0.37, a[0][2])
        return ruv('sw_' + name, (a[0] * 37.0) % 1.0, (a[-1] * 53.0) % 1.0)
    return f


TW, EAVE, PEAK = 3.0, 2.05, 2.9
LEG = 0.04


def sandbags(pm):
    h = TW / 2 - LEG / 2
    for sx in (-1, 1):
        for sz in (-1, 1):
            s_ = PM(); prism(s_, 0.32, 0.16, 0.05, 2, 0.0, 0.11, lambda x, z: ruv('sandbag', x + 0.5, z * 2 + 0.5), lambda a, b: ruv('sandbag', a, b), (lambda *a: ruv('sandbag', 0.5, 0.5)))
            pm.add(s_, T(sx * (h - 0.2), 0, sz * (h - 0.02)))


def frame_tent(pm, bid, canopy):
    h = TW / 2 - LEG / 2
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(pm, sx * h - LEG / 2, sx * h + LEG / 2, 0.0, EAVE, sz * h - LEG / 2, sz * h + LEG / 2, {'*': sw('alu')}, faces='fkrl')
            box(pm, sx * h - 0.07, sx * h + 0.07, 0.0, 0.008, sz * h - 0.07, sz * h + 0.07, {'*': sw('alu_dark')}, faces='tfkrl')
    sandbags(pm)
    # 上緣：四邊的橫梁＋剪刀架（每邊兩個 X）
    y0, y1 = 1.62, 2.0
    for (a, b) in (((-h, h), (h, h)), ((-h, -h), (h, -h)), ((-h, -h), (-h, h)), ((h, -h), (h, h))):
        A, Bp = np.array((a[0], y1, a[1])), np.array((b[0], y1, b[1]))
        bar(pm, A, Bp, 0.03, 0.05, sw('alu'))
        for k in range(2):
            p = A + (Bp - A) * (k / 2); q = A + (Bp - A) * ((k + 1) / 2)
            bar(pm, (p[0], y0, p[2]), (q[0], y1, q[2]), 0.018, 0.012, sw('alu_dark')); bar(pm, (p[0], y1, p[2]), (q[0], y0, q[2]), 0.018, 0.012, sw('alu_dark'))
    for sx in (-1, 1):   # 屋頂的斜桿（帆布下面）
        for sz in (-1, 1): bar(pm, (sx * h, EAVE, sz * h), (0, PEAK - 0.04, 0), 0.02, 0.02, sw('alu'))
    # 屋頂帆布（兩面）
    top, under = ('canopy_blue', 'canopy_blue_u') if canopy == 'blue' else ('canopy_white', 'canopy_under')
    e = TW / 2 + 0.03
    corners = [(e, EAVE + 0.01, e), (-e, EAVE + 0.01, e), (-e, EAVE + 0.01, -e), (e, EAVE + 0.01, -e)]
    apex = (0.0, PEAK, 0.0)
    for k in range(4):
        a, b = corners[k], corners[(k + 1) % 4]; m = ((a[0] + b[0]) / 2, 0.6, (a[2] + b[2]) / 2)
        pm.poly([a, b, apex], sw(top), m); pm.poly([a, b, (0.0, PEAK - 0.012, 0.0)], sw(under), (-m[0], -1, -m[2]))
    # 垂簾（四邊，兩面；外面印字）
    vy0, vy1 = EAVE - 0.21, EAVE + 0.01
    sides = [((-e, e), (e, e), (0, 0, 1)), ((e, -e), (-e, -e), (0, 0, -1)), ((e, e), (e, -e), (1, 0, 0)), ((-e, -e), (-e, e), (-1, 0, 0))]
    for (a, b, n) in sides:
        pts = [(a[0], vy0, a[1]), (b[0], vy0, b[1]), (b[0], vy1, b[1]), (a[0], vy1, a[1])]
        L_ = math.hypot(b[0] - a[0], b[1] - a[1])
        fn = lambda p, a=a, L_=L_: ruv('val_' + bid, math.hypot(p[0] - a[0], p[2] - a[1]) / L_, (p[1] - vy0) / (vy1 - vy0))
        pm.poly(pts, fn, n); pm.poly([(p[0] - n[0] * 0.002, p[1], p[2] - n[2] * 0.002) for p in pts], sw('c1_' + bid), tuple(-v for v in n))   # 背面往內 2 mm


def back_banner(pm, bid):
    z = -(TW / 2 - LEG) + 0.01; x0, x1, y0, y1 = -1.42, 1.42, 0.72, 2.0
    pts = [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)]
    pm.poly(pts, lambda p: ruv('ban_' + bid, (p[0] - x0) / (x1 - x0), (p[1] - y0) / (y1 - y0)), (0, 0, 1))
    pm.poly([(p[0], p[1], p[2] - 0.002) for p in pts], sw('c1_' + bid), (0, 0, -1))
    bar(pm, (x0, y1, z), (x1, y1, z), 0.02, 0.02, sw('alu_dark')); bar(pm, (x0, y0, z), (x1, y0, z), 0.02, 0.02, sw('alu_dark'))


TBL_Z, TBL_W, TBL_D, TBL_H = 0.95, 1.5, 0.76, 0.74   # 1.5 m 的摺疊桌：兩邊各留 0.75 m 放易拉展、道具


def table(pm, bid, plain=False):
    x0, x1, z0, z1 = -TBL_W / 2, TBL_W / 2, TBL_Z - TBL_D / 2, TBL_Z + TBL_D / 2
    for sx in (-1, 1):   # 桌腳（後面兩支看得到；前面被桌巾蓋住）
        for sz in (-1, 1): bar(pm, (sx * (TBL_W / 2 - 0.08), 0, TBL_Z + sz * (TBL_D / 2 - 0.06)), (sx * (TBL_W / 2 - 0.08), TBL_H - 0.03, TBL_Z + sz * (TBL_D / 2 - 0.06)), 0.03, 0.03, sw('steel'))
    # 桌巾：蓋住桌面、前面和兩側垂到離地 6 cm（後面不垂：工作人員坐的那一邊）
    ct, cy0, ex = TBL_H + 0.006, 0.06, 0.015
    X0, X1, Z0, Z1 = x0 - ex, x1 + ex, z0 - ex, z1 + ex
    col = 'c1_' + bid if not plain else 'c2_' + bid
    pm.poly([(X0, ct, Z0), (X1, ct, Z0), (X1, ct, Z1), (X0, ct, Z1)], sw(col), (0, 1, 0))
    pm.poly([(X0, cy0, Z1), (X1, cy0, Z1), (X1, ct, Z1), (X0, ct, Z1)], lambda p: ruv('cloth_' + bid, (p[0] - X0) / (X1 - X0), (p[1] - cy0) / (ct - cy0)), (0, 0, 1))
    for sx in (-1, 1):
        X = X1 if sx > 0 else X0
        pm.poly([(X, cy0, Z0), (X, cy0, Z1), (X, ct, Z1), (X, ct, Z0)], sw(col), (sx, 0, 0))
    box(pm, x0, x1, TBL_H - 0.03, TBL_H, z0, z1, {'*': sw('table_top')}, faces='b')   # 從下面看得到的桌面底


def chair(pm, x, z, yaw):
    c = PM()
    box(c, -0.21, 0.21, 0.43, 0.46, -0.2, 0.2, {'*': sw('chair_seat')}, faces='tbfkrl')
    box(c, -0.2, 0.2, 0.62, 0.86, -0.25, -0.23, {'*': sw('chair_seat')}, faces='fkrl')
    for sx in (-1, 1):
        bar(c, (sx * 0.2, 0, 0.2), (sx * 0.2, 0.88, -0.24), 0.022, 0.016, sw('chair_frame'))
        bar(c, (sx * 0.2, 0, -0.22), (sx * 0.2, 0.45, 0.16), 0.022, 0.016, sw('chair_frame'))
    pm.add(c, T(x, 0, z) @ Ry(yaw))


def standee(pm, bid, x, z, yaw):
    s = PM()
    box(s, -0.42, 0.42, 0.0, 0.08, -0.11, 0.11, {'*': sw('alu')}, faces='tfkrl')
    bar(s, (0, 0.08, -0.06), (0, 2.1, -0.06), 0.02, 0.02, sw('alu_dark'))
    pts = [(-0.4, 0.08, -0.04), (0.4, 0.08, -0.04), (0.4, 2.08, -0.04), (-0.4, 2.08, -0.04)]
    s.poly(pts, lambda p: ruv('std_' + bid, (p[0] + 0.4) / 0.8, (p[1] - 0.08) / 2.0), (0, 0, 1)); s.poly([(p[0], p[1], p[2] - 0.002) for p in pts], sw('canopy_under'), (0, 0, -1))
    pm.add(s, T(x, 0, z) @ Ry(yaw))


def table_items(pm, bid, plain):
    y = TBL_H + 0.006
    for k, (fl, x) in enumerate((('flyer_a', -0.62), ('flyer_b', -0.36), ('flyer_c', 0.42))):   # 傳單（三疊）
        box(pm, x - 0.105, x + 0.105, y, y + 0.012 + k * 0.004, TBL_Z + 0.02, TBL_Z + 0.32, {'t': lambda p, fl=fl, x=x: ruv(fl, (p[0] - x + 0.105) / 0.21, (p[2] - TBL_Z - 0.02) / 0.3), '*': sw('paper')}, faces='tfkrl')
    if not plain:
        # 報名表（夾板）＋壓克力立牌（QR）
        box(pm, -0.08, 0.17, y, y + 0.008, TBL_Z - 0.12, TBL_Z + 0.2, {'*': sw('wood_dark')}, faces='tfkrl')
        box(pm, -0.07, 0.16, y + 0.008, y + 0.01, TBL_Z - 0.11, TBL_Z + 0.17, {'t': lambda p: ruv('sheet', (p[0] + 0.07) / 0.23, (p[2] - TBL_Z + 0.11) / 0.28)}, faces='t')
        sg = PM(); box(sg, -0.075, 0.075, 0.0, 0.21, -0.004, 0.004, {'k': lambda p: ruv('sign', (p[0] + 0.075) / 0.15, p[1] / 0.21), '*': sw('acrylic')}, faces='fkrl')
        box(sg, -0.08, 0.08, 0.0, 0.01, -0.05, 0.05, {'*': sw('acrylic')}, faces='tfkrl')
        pm.add(sg, T(0.6, y, TBL_Z - 0.05) @ Rx(-0.2))


def sphere(pm, c, r, reg, n=10, rings=6):
    s = PM(); verts = []
    for j in range(rings + 1):
        th = math.pi * j / rings; row = []
        for k in range(n + 1):
            ph = 2 * math.pi * k / n; row.append(s.vid((c[0] + r * math.sin(th) * math.cos(ph), c[1] + r * math.cos(th), c[2] + r * math.sin(th) * math.sin(ph))))
        verts.append(row)
    for j in range(rings):
        for k in range(n):
            q = [verts[j][k], verts[j][k + 1], verts[j + 1][k + 1], verts[j + 1][k]]
            if j == 0: q = [verts[0][k], verts[1][k + 1], verts[1][k]]
            elif j == rings - 1: q = [verts[j][k], verts[j][k + 1], verts[j + 1][k]]
            m = sum(s.v[i] for i in q) / len(q) - np.array(c)
            s.face(q, [ruv(reg, (kk % (n + 1)) / n, 1 - jj / rings) for (jj, kk) in ([(j, k), (j + 1, k + 1), (j + 1, k)] if j == 0 else [(j, k), (j, k + 1), (j + 1, k)] if j == rings - 1 else [(j, k), (j, k + 1), (j + 1, k + 1), (j + 1, k)])], m)
    return pm.add(s)


def props(pm, bid):
    y = TBL_H + 0.006
    if bid == 'guitar':   # 吉他（立在琴架上，琴頸往後靠）＋小音箱
        g = PM(); pts = []
        for k in range(20):
            a = 2 * math.pi * k / 20; rx = 0.19 if math.sin(a) < 0 else 0.15
            pts.append((rx * math.cos(a), 0.0, 0.26 + 0.21 * math.sin(a) * (1.15 if math.sin(a) < 0 else 0.95)))
        g.poly([(p[0], 0.05, p[2]) for p in pts], lambda p: ruv('guitar_top', p[0] / 0.4 + 0.5, (p[2] - 0.02) / 0.5), (0, 1, 0))
        g.poly([(p[0], -0.05, p[2]) for p in pts], sw('wood_dark'), (0, -1, 0))
        for k in range(20):
            a, b = pts[k], pts[(k + 1) % 20]
            g.poly([(a[0], -0.05, a[2]), (b[0], -0.05, b[2]), (b[0], 0.05, b[2]), (a[0], 0.05, a[2])], lambda p: ruv('guitar_side', (p[0] + 0.2) / 0.4, (p[1] + 0.05) / 0.1), (a[0] + b[0], 0, a[2] + b[2] - 0.52))
        bar(g, (0, 0.03, 0.46), (0, 0.03, 1.0), 0.05, 0.03, sw('wood_dark'))
        box(g, -0.045, 0.045, 0.0, 0.05, 0.98, 1.16, {'*': sw('wood_dark')}, faces='tbfkrl')
        pm.add(g, T(1.12, 0.0, 1.22) @ Ry(math.pi - 0.45) @ Rx(-1.32))   # 立著、面板朝前、往後靠 14°
        bar(pm, (1.0, 0, 1.12), (1.1, 0.5, 1.08), 0.02, 0.02, sw('tripod')); bar(pm, (1.24, 0, 1.12), (1.1, 0.5, 1.08), 0.02, 0.02, sw('tripod'))
        box(pm, -1.25, -0.95, 0.0, 0.32, -0.2, 0.04, {'k': lambda p: ruv('amp', (p[0] + 1.25) / 0.3, p[1] / 0.32), '*': sw('black')}, faces='tfkrl')   # 小音箱（桌子後面）
    elif bid == 'lawclub':   # 桌上的書（一疊）＋金色天平
        box(pm, 0.25, 0.49, y, y + 0.09, TBL_Z - 0.3, TBL_Z - 0.05, {'k': lambda p: ruv('books', (p[0] - 0.25) / 0.24, (p[1] - y) / 0.09), '*': sw('paper')}, faces='tfkrl')
        lathe(pm, [(0.05, 0.0, 0.05, 0.015, sw('gold'), 'out'), (0.012, 0.015, 0.008, 0.26, sw('gold'), 'out')], 8, caps=[(0.05, 0.015, sw('gold'), 'up')], M=T(-0.1, y, TBL_Z - 0.18))
        bar(pm, (-0.24, y + 0.25, TBL_Z - 0.18), (0.04, y + 0.25, TBL_Z - 0.18), 0.01, 0.01, sw('gold'))
        for sx in (-0.24, 0.04):
            lathe(pm, [(0.045, 0.0, 0.01, 0.03, sw('gold'), 'out')], 8, caps=[(0.045, 0.0, sw('gold'), 'down')], M=T(sx, y + 0.12, TBL_Z - 0.18))
            bar(pm, (sx, y + 0.15, TBL_Z - 0.18), (sx, y + 0.25, TBL_Z - 0.18), 0.004, 0.004, sw('gold'))
    elif bid == 'debate':   # 講台（攤位右前角）
        p = PM(); box(p, -0.3, 0.3, 0.0, 1.0, -0.22, 0.22, {'k': lambda q: ruv('podium', (q[0] + 0.3) / 0.6, q[1] / 1.0), '*': sw('wood_dark')}, faces='tfkrl')
        box(p, -0.33, 0.33, 1.0, 1.04, -0.27, 0.22, {'*': sw('wood_dark')}, faces='tbfkrl')
        pm.add(p, T(1.12, 0, 1.1) @ Ry(-0.35))
    elif bid == 'hiking':   # 登山背包＋登山杖
        bp = PM(); prism(bp, 0.36, 0.26, 0.08, 3, 0.0, 0.72, lambda x, z: ruv('pack', x / 0.36 + 0.5, z / 0.26 + 0.5), lambda s_, t_: ruv('pack', s_, t_), sw('strap'), cht=0.05)
        box(bp, -0.15, 0.15, 0.12, 0.42, 0.13, 0.2, {'*': lambda q: ruv('pack', 0.5, (q[1] - 0.12) / 0.3)}, faces='tkrl')
        lathe(bp, [(0.08, 0.0, 0.08, 0.3, sw('rope'), 'out')], 8, M=T(0, 0.72, 0) @ Rz(math.pi / 2) @ T(0, -0.15, 0))
        pm.add(bp, T(1.15, 0, 1.25) @ Ry(-0.4))
        for dx in (-0.06, 0.06): bar(pm, (1.42 + dx, 0, 1.0), (1.36 + dx * 0.5, 1.2, 0.9), 0.016, 0.016, sw('tripod'))
    elif bid == 'basketball':   # 球袋裡兩顆籃球＋桌上一顆
        sphere(pm, (1.1, 0.12, 1.25), 0.12, 'ball'); sphere(pm, (1.28, 0.12, 1.12), 0.12, 'ball'); sphere(pm, (0.55, y + 0.12, TBL_Z - 0.12), 0.12, 'ball')
        for k in range(6):
            a = 2 * math.pi * k / 6; bar(pm, (1.19 + 0.26 * math.cos(a), 0, 1.18 + 0.2 * math.sin(a)), (1.19 + 0.2 * math.cos(a), 0.3, 1.18 + 0.16 * math.sin(a)), 0.008, 0.008, sw('net'))
    elif bid == 'info':   # 社團地圖看板（A 字架：兩片板在上面靠攏、下面張開；前面那片印地圖）
        mp = PM(); top, foot, hw = 1.22, 0.3, 0.42
        for sz in (1, -1):
            pts = [(-hw, 0.0, sz * foot), (hw, 0.0, sz * foot), (hw, top, 0.0), (-hw, top, 0.0)]
            mp.poly(pts, (lambda p: ruv('map', (p[0] + hw) / (2 * hw), p[1] / top)) if sz > 0 else sw('wood_dark'), (0, foot, sz * top))
            mp.poly([(p[0], p[1], p[2] - sz * 0.02 * (1 - p[1] / top)) for p in pts], sw('wood_dark'), (0, -foot, -sz * top))   # 裡面（往內 2 cm）
        pm.add(mp, T(1.1, 0, 1.1) @ Ry(-0.3))
    elif bid == 'bg1':   # 相機腳架＋照片
        for k in range(3):
            a = 2 * math.pi * k / 3; bar(pm, (1.15 + 0.3 * math.cos(a), 0, 1.15 + 0.3 * math.sin(a)), (1.15, 1.3, 1.15), 0.015, 0.015, sw('tripod'))
        box(pm, 1.07, 1.23, 1.3, 1.42, 1.1, 1.2, {'*': sw('tripod')}, faces='tbfkrl'); lathe(pm, [(0.035, 0, 0.035, 0.07, sw('lens'), 'out')], 8, caps=[(0.035, 0.07, sw('lens'), 'up')], M=T(1.15, 1.36, 1.2) @ Rx(math.pi / 2))
        box(pm, -0.7, 0.2, y, y + 0.004, TBL_Z - 0.1, TBL_Z + 0.25, {'t': lambda p: ruv('photos', (p[0] + 0.7) / 0.9, (p[2] - TBL_Z + 0.1) / 0.35)}, faces='t')
    elif bid == 'bg2':   # 桌遊盒（疊起來）
        for k, (gm, x, z, rot) in enumerate((('game_a', -0.2, TBL_Z - 0.05, 0.1), ('game_b', -0.18, TBL_Z - 0.04, -0.15), ('game_a', 0.15, TBL_Z + 0.02, 0.3))):
            b_ = PM(); box(b_, -0.15, 0.15, 0, 0.07, -0.15, 0.15, {'t': lambda p, gm=gm: ruv(gm, p[0] / 0.3 + 0.5, p[2] / 0.3 + 0.5), '*': sw('c1_bg2')}, faces='tfkrl')
            pm.add(b_, T(x, y + (0.07 if k == 1 else 0), z) @ Ry(rot))
    elif bid == 'bg3':   # 手作（桌上一塊布、作品）
        box(pm, -0.7, 0.25, y, y + 0.006, TBL_Z - 0.15, TBL_Z + 0.25, {'t': lambda p: ruv('craft', (p[0] + 0.7) / 0.95, (p[2] - TBL_Z + 0.15) / 0.4)}, faces='t')
        for k, x in enumerate((-0.6, -0.35, -0.1)): lathe(pm, [(0.04, 0, 0.05, 0.12, sw(('c1_bg3', 'c2_bg1', 'c1_bg2')[k]), 'out')], 8, caps=[(0.05, 0.12, (lambda *a: ruv('craft', 0.5, 0.5)), 'up')], M=T(x, y + 0.006, TBL_Z + 0.08))


def booth(bid, canopy, has_title):
    pm = PM()
    frame_tent(pm, bid, canopy)
    back_banner(pm, bid)
    table(pm, bid, plain=not has_title)
    for x in (-0.45, 0.45): chair(pm, x, TBL_Z - 0.75, math.pi + (0.15 if x > 0 else -0.1))
    if 'std_' + bid in REG: standee(pm, bid, -1.12, 1.05, -math.pi / 4)   # 桌子左邊、斜 45° 朝外
    table_items(pm, bid, not has_title)
    props(pm, bid)
    return pm


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=2048)
    root = B.group('club_fair', props={'kind': 'club_fair'})
    mat = bpy.data.materials.new('club_fair'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    mat.use_backface_culling = True   # glTF doubleSided=false：帆布、垂簾、背板、易拉展的正反兩面是各自的面（雙面材質會讓疊在一起的兩面互搶）
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}
    for bid, title, cloth, slogan, c1, c2, canopy in BOOTHS:
        pm = booth(bid, canopy, title is not None)
        ob = to_blender(pm, 'booth_' + bid, mat, root, B, g2b, bpy)
        mn, mx = pm.bbox(); mods['booth_' + bid] = {'tris': pm.tris(), 'min': mn, 'max': mx, 'name': title or '（背景攤，不具名）'}
    for i, ob in enumerate(sorted(root.children, key=lambda o: o.name)): ob.location = g2b((i % 5) * 4.0, 0, (i // 5) * 4.5)
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origin'] = '帳篷中心的地面；+z＝攤位正面（桌子、垂簾的字）；放在大道南側時轉 π（面向北＝大道）。帳篷 3×3 m（腳在 ±1.48）、屋簷 2.05 m、屋頂尖 2.9 m；桌子前緣 z 1.33；易拉展、道具都在 3×3 m 裡面'
    info['nav'] = '整頂帳篷擋起來（3×3 m）；人站在正面（+z）外面 0.3–1.2 m'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False))


if __name__ == '__main__':
    build()
