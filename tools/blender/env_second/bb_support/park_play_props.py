"""ART-PARK1 溫州街小公園的遊戲場道具組（LAWWW2-B 分派 2026-10-16 15:06；BB-B 支援製作；做法同 ART-US3 us_bedroom_props.py：一張底色貼圖集＋ORM、網格工具照抄）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/park_play_props.py [-- --out assets/models/env/second_ai/bb_support/park_play_props.glb]

使用者 07:1x：「日系加一點寫實 不要很像積木」，點名公園的搖搖馬、溜滑梯還像積木（wz_park.py「小遊戲場」那一段是橢球、圓柱拼的）。這一組換掉它們。
每件一個頂層節點，原點都在地面：
  PARK_SLIDE     台灣社區公園的共融式溜滑梯。原點＝平台中心的地面。平台 0.9×0.9、上緣 1.10（藍色、打孔鋼板的樣子）；四根粉體烤漆圓柱（黃、頂端圓帽）；
                 兩側（±z）波浪邊的圓角護板（橘）；平台上一個小四坡頂（橘，頂高 2.32，頂上一顆圓球）；
                 −x：五階踏板（藍）＋兩條側樑＋兩條扶手（黃），底端到 x −0.87；+x：U 形滑道（綠），水平約 2.0 m 從 1.10 平順地下到 0.22，出口一段平的到 x 2.9；
                 入口上方一支橫桿（坐下來先抓的那一支）；出口下面兩支短腳。滑道出口那一段中間磨亮（底色淺一點、粗糙度低一點）。
  PARK_SPRING_A  彈簧搖搖馬（黃，鬃毛和尾巴是深一點的橘棕，馬鞍藍）：身體長約 0.8（含頭、尾）、座高 0.50；頭朝 +x。
  PARK_SPRING_B  彈簧搖搖小鴨（藍綠，嘴橘）：座高 0.50；頭朝 +x。
                 兩隻都是「側面輪廓擠出、邊緣倒圓」的一體成型塑膠件（真的公園搖搖動物就是這樣做的），眼睛、鬃毛、馬鞍、翅膀是畫在貼圖上的；
                 握把穿過頭（兩端黑色握套）、腳踏穿過下腹；鋼彈簧（螺旋）、底盤 Ø0.34（邊緣有一點髒）。原點＝底盤中心。
  PARK_SANDBOX   木框沙坑 1.8×1.3、框高 0.25（上面一圈 12 cm 寬的座板）；沙面低一點、有起伏；角落一個留下來的小水桶（紅）＋鏟子（藍）。原點＝中心地面。
沒有字、品牌、標誌（D77）。
材質一個：park_play（1024 底色貼圖集＋256 ORM；metal 最高 0.40：只有鋼彈簧和握把的鋼管）。
貼圖：沙＝Poly Haven granular_concrete 的顆粒明暗（tools/blender/textures/）；木框＝Poly Haven dark_planks 的木紋明暗（tools/blender/env_second/textures/），都是 CC0；
塑膠和烤漆是單色＋很淡的起伏。畫的只有本來就是畫上去的東西：搖搖動物的眼睛、鬃毛、馬鞍、翅膀、嘴，平台的打孔，滑道出口的磨痕，底盤的髒邊。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/park_play_props.glb'
TEXB = os.path.join(HERE, 'textures')
GEN = os.path.join(TEXB, 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'park_play_props_{k}.png') for k in ('atlas', 'orm'))
SRC = {'sand': os.path.join(os.path.dirname(PARENT), 'textures', 'granular_concrete', 'granular_concrete_diff_1k.jpg'),
       'planks': os.path.join(PARENT, 'textures', 'dark_planks', 'dark_planks_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

# 顏色（台灣社區公園：黃、藍、綠、橘，飽和度壓低一點）
YEL, BLU, GRN, ORA, TEAL = (222, 186, 86), (70, 118, 166), (86, 146, 96), (222, 134, 70), (86, 156, 160)

# 搖搖動物的側面輪廓（x 往前＝頭、y 往上；單位公尺；原點＝底盤中心）——逆時針，下面從尾巴那一側開始
HORSE = [(-0.26, 0.36), (-0.21, 0.30), (-0.13, 0.31), (0.00, 0.335), (0.10, 0.31), (0.18, 0.30), (0.25, 0.38), (0.27, 0.50), (0.33, 0.60),
         (0.42, 0.62), (0.48, 0.64), (0.495, 0.69), (0.47, 0.735), (0.36, 0.79), (0.33, 0.83), (0.305, 0.905),
         (0.255, 0.87), (0.205, 0.815), (0.14, 0.72), (0.08, 0.60), (0.02, 0.53), (-0.10, 0.50), (-0.20, 0.525), (-0.27, 0.55), (-0.33, 0.52),
         (-0.385, 0.44), (-0.31, 0.42)]
DUCK = [(-0.24, 0.36), (-0.10, 0.31), (0.06, 0.31), (0.18, 0.36), (0.24, 0.46), (0.225, 0.58), (0.28, 0.635), (0.40, 0.645), (0.435, 0.69),
        (0.395, 0.725), (0.30, 0.74), (0.285, 0.82), (0.20, 0.875), (0.11, 0.845), (0.075, 0.74), (0.06, 0.62), (0.0, 0.54), (-0.12, 0.50),
        (-0.22, 0.53), (-0.30, 0.60), (-0.35, 0.675), (-0.385, 0.64), (-0.375, 0.59), (-0.335, 0.48), (-0.30, 0.40)]
SIDE_BOX = (-0.42, 0.26, 0.52, 1.00)   # 側面貼圖對應的範圍（x0, y0, x1, y1）

REG = {
    'slide_in': (0, 0, 256, 512),         # 滑道內面：s＝橫過滑道、t＝沿滑道（t=1 出口）；出口那一段中間磨亮
    'deck': (256, 0, 512, 256),           # 平台：藍色打孔鋼板（打孔是畫的）
    'horse': (512, 0, 1024, 512),         # 搖搖馬側面：身體黃、鬃毛尾巴橘棕、馬鞍藍、眼睛、鼻孔、蹄
    'duck': (512, 512, 1024, 1024),       # 小鴨側面：身體藍綠、嘴橘、眼睛、翅膀
    'wood': (256, 256, 512, 384),         # 沙坑木框（橫紋，沿 s）：兩片板子疊起來的接縫
    'wood_top': (256, 384, 512, 512),     # 沙坑座板（橫紋）
    'sand': (0, 512, 256, 768),           # 沙：顆粒明暗＋幾塊濕的深色
    'base': (256, 512, 384, 640),         # 底盤上面：灰色烤漆、邊緣一圈髒
    'panel': (384, 512, 512, 640),        # 護板：橘色塑膠、很淡的起伏
}
SW = {
    'yellow': (YEL, 0.42, 0.0), 'blue': (BLU, 0.45, 0.0), 'green': (GRN, 0.45, 0.0), 'orange': (ORA, 0.45, 0.0), 'teal': (TEAL, 0.45, 0.0),
    'steel': ((156, 158, 162), 0.32, METAL), 'grip': ((34, 34, 36), 0.8, 0.0), 'base_side': ((96, 100, 104), 0.5, 0.0),
    'green_dk': ((70, 122, 80), 0.5, 0.0), 'bucket': ((210, 92, 88), 0.4, 0.0), 'bucket_in': ((176, 72, 70), 0.5, 0.0),
    'shovel': ((72, 124, 186), 0.4, 0.0), 'wood_end': ((104, 80, 58), 0.8, 0.0), 'sand_sw': ((206, 186, 146), 0.98, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 8) * SW_CELL, SW_Y0 + (i // 8) * SW_CELL, (i % 8) * SW_CELL + SW_CELL, SW_Y0 + (i // 8) * SW_CELL + SW_CELL)
ORM_REG = {'slide_in': None, 'deck': (0.5, 0.0), 'horse': (0.42, 0.0), 'duck': (0.42, 0.0), 'wood': (0.78, 0.0), 'wood_top': (0.74, 0.0),
           'sand': (0.98, 0.0), 'base': (0.55, 0.0), 'panel': (0.45, 0.0)}


# ================= 貼圖 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def lum(path, w, h, tile=(1, 1), blur=0.0):
    im = Image.open(path).convert('L'); tw, th = max(1, w // tile[0]), max(1, h // tile[1]); im = im.resize((tw, th), Image.LANCZOS)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    t = np.asarray(im, np.float32); a = np.tile(t, (tile[1] + 1, tile[0] + 1))[:h, :w]
    return (a - a.mean()) / max(1.0, a.std())


def soft(w, h, seed, scale=24, blur=6):
    """很淡的大起伏（塑膠、烤漆不是完全平的顏色）"""
    rng = np.random.default_rng(seed); a = rng.normal(0, 1, (max(2, h // scale), max(2, w // scale))).astype(np.float32)
    im = Image.fromarray(((a - a.min()) / max(1e-6, a.max() - a.min()) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur * SS))
    z = np.asarray(im, np.float32); return (z - z.mean()) / max(1.0, z.std())


def tint(z, base, k):
    a = np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def put(P, name, img):
    P.paste(img, (REG[name][0] * SS, REG[name][1] * SS))


def side_px(name, x, y):
    """側面座標（公尺）→ 貼圖區塊裡的像素（SS 倍）"""
    w, h = sz(name); X0, Y0, X1, Y1 = SIDE_BOX
    return ((x - X0) / (X1 - X0) * w, (1 - (y - Y0) / (Y1 - Y0)) * h)


def paint_horse(P):
    w, h = sz('horse'); img = tint(soft(w, h, 1, scale=48, blur=10), YEL, 0.012); d = ImageDraw.Draw(img); f = lambda x, y: side_px('horse', x, y)
    mane = (156, 92, 52)
    # 鬃毛：從兩耳之間沿脖子後緣到肩；尾巴
    d.polygon([f(0.28, 0.87), f(0.20, 0.84), f(0.13, 0.73), f(0.07, 0.60), f(0.11, 0.585), f(0.17, 0.71), f(0.23, 0.80)], fill=mane)
    d.polygon([f(-0.26, 0.56), f(-0.34, 0.55), f(-0.40, 0.44), f(-0.33, 0.40), f(-0.28, 0.47)], fill=mane)
    # 馬鞍（藍）＋鞍墊的邊
    d.polygon([f(0.06, 0.60), f(0.02, 0.43), f(-0.21, 0.43), f(-0.24, 0.60), f(-0.10, 0.56)], fill=BLU)
    d.line([f(0.02, 0.43), f(-0.21, 0.43)], fill=(52, 88, 128), width=4 * SS)
    # 蹄（前後腳的下緣）
    for x0, x1 in ((-0.24, -0.11), (0.08, 0.22)): d.rectangle([f(x0, 0.335), f(x1, 0.25)], fill=(118, 96, 70))
    # 眼睛、反光、鼻孔、嘴角
    ex, ey = f(0.375, 0.74); r = 0.018 / (SIDE_BOX[2] - SIDE_BOX[0]) * w
    d.ellipse([ex - r, ey - r * 1.15, ex + r, ey + r * 1.15], fill=(26, 24, 24)); d.ellipse([ex - r * 0.55, ey - r * 0.8, ex - r * 0.05, ey - r * 0.3], fill=(240, 240, 236))
    nx, ny = f(0.475, 0.70); rn = r * 0.45; d.ellipse([nx - rn, ny - rn, nx + rn, ny + rn], fill=(120, 84, 50))
    d.arc([f(0.43, 0.67)[0], f(0.43, 0.67)[1], f(0.49, 0.645)[0], f(0.49, 0.645)[1]], 20, 160, fill=(120, 84, 50), width=2 * SS)
    put(P, 'horse', img.filter(ImageFilter.GaussianBlur(0.6 * SS)))


def paint_duck(P):
    w, h = sz('duck'); img = tint(soft(w, h, 2, scale=48, blur=10), TEAL, 0.012); d = ImageDraw.Draw(img); f = lambda x, y: side_px('duck', x, y)
    # 嘴（橘）
    d.polygon([f(0.27, 0.625), f(0.41, 0.635), f(0.45, 0.69), f(0.40, 0.735), f(0.27, 0.755)], fill=ORA)
    d.line([f(0.29, 0.69), f(0.43, 0.69)], fill=(176, 98, 48), width=2 * SS)
    # 翅膀：淺一點的藍綠、三條羽毛線
    wing = tuple(int(min(255, c * 1.16)) for c in TEAL)
    d.polygon([f(0.06, 0.52), f(-0.04, 0.40), f(-0.20, 0.40), f(-0.27, 0.47), f(-0.18, 0.52), f(-0.04, 0.54)], fill=wing)
    for k in range(3):
        x = -0.20 + k * 0.06; d.line([f(x, 0.43), f(x + 0.05, 0.50)], fill=(64, 122, 126), width=2 * SS)
    # 眼睛、反光、臉頰
    ex, ey = f(0.235, 0.79); r = 0.02 / (SIDE_BOX[2] - SIDE_BOX[0]) * w
    d.ellipse([ex - r, ey - r * 1.1, ex + r, ey + r * 1.1], fill=(26, 24, 24)); d.ellipse([ex - r * 0.55, ey - r * 0.75, ex - r * 0.05, ey - r * 0.25], fill=(240, 240, 236))
    cx, cy = f(0.215, 0.725); rc = r * 1.3; d.ellipse([cx - rc, cy - rc * 0.7, cx + rc, cy + rc * 0.7], fill=(204, 150, 140))
    put(P, 'duck', img.filter(ImageFilter.GaussianBlur(0.6 * SS)))


def paint(P):
    # 滑道內面：綠、出口那一段中間磨亮（往出口越亮、只在中間 45%）
    w, h = sz('slide_in'); s = (np.arange(w, dtype=np.float32) + 0.5) / w; t = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h
    band = np.exp(-((s - 0.5) / 0.16) ** 2)[None, :] * np.clip((t[:, None] - 0.35) / 0.65, 0, 1) ** 1.5
    z = soft(w, h, 3, scale=16, blur=3)
    a = np.array(GRN, np.float32)[None, None] * (1 + 0.025 * z[..., None]) * (1 + 0.22 * band[..., None]) + 18 * band[..., None]
    put(P, 'slide_in', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    # 平台：藍色、打孔（每 4 cm 一個圓孔，畫成深色）
    w, h = sz('deck'); img = tint(soft(w, h, 4), BLU, 0.03); d = ImageDraw.Draw(img); step = w / 22.0; r = step * 0.22
    for i in range(22):
        for j in range(22):
            cx, cy = (i + 0.5) * step, (j + 0.5) * step; d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(34, 52, 74))
    put(P, 'deck', img)
    paint_horse(P); paint_duck(P)
    # 木框：dark_planks 的木紋（轉成橫紋）、調成戶外曬過的淺棕；中間一條兩片板子的接縫
    w, h = sz('wood'); zw = lum(SRC['planks'], h, w, blur=0.6).T.copy(); img = tint(zw, (146, 112, 78), 0.16); d = ImageDraw.Draw(img)
    d.line([(0, h * 0.5), (w, h * 0.5)], fill=(70, 52, 38), width=2 * SS); put(P, 'wood', img)
    w, h = sz('wood_top'); zw = lum(SRC['planks'], h, w, blur=0.6).T.copy(); put(P, 'wood_top', tint(zw, (156, 122, 86), 0.15))
    # 沙：granular_concrete 的顆粒明暗＋幾塊濕的深色
    w, h = sz('sand'); z = lum(SRC['sand'], w, h, tile=(3, 3), blur=0.5); wet = soft(w, h, 5, scale=40, blur=10)
    a = np.array((214, 194, 152), np.float32)[None, None] * (1 + 0.07 * np.clip(z, -2.5, 2.5))[..., None] * (1 - 0.12 * np.clip(wet - 0.6, 0, 2)[..., None])
    put(P, 'sand', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    # 底盤上面：灰色烤漆、外圈一圈髒（中心到邊緣漸深）
    w, h = sz('base'); tt = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h   # 底盤上面那一圈：t=0 是外緣（髒）、t=1 是內圈（乾淨）
    dirt = np.clip((0.6 - tt) / 0.6, 0, 1)[:, None] ** 1.2 * (0.8 + 0.2 * soft(w, h, 6, scale=10, blur=2))
    a = np.array((112, 116, 120), np.float32)[None, None] * (1 - 0.32 * dirt[..., None]) + np.array((18, 12, 0), np.float32)[None, None] * dirt[..., None]
    put(P, 'base', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    w, h = sz('panel'); put(P, 'panel', tint(soft(w, h, 7, scale=40, blur=8), ORA, 0.012))


def make_textures():
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); paint(P); d = ImageDraw.Draw(P)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 150; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        if name == 'slide_in': continue
        rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else ORM_REG[name]
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 1] = int(rough * 255)
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 2] = int(min(metal, METAL) * 255)
    # 滑道內面：磨亮的地方粗糙度低（0.45 → 0.24）
    x0, y0, x1, y1 = (int(v * f) for v in REG['slide_in']); w, h = x1 - x0, y1 - y0
    s = (np.arange(w) + 0.5) / w; t = 1 - (np.arange(h) + 0.5) / h
    band = np.exp(-((s - 0.5) / 0.16) ** 2)[None, :] * np.clip((t[:, None] - 0.35) / 0.65, 0, 1) ** 1.5
    orm[y0:y1, x0:x1, 1] = (255 * (0.45 - 0.21 * band)).astype(np.uint8); orm[y0:y1, x0:x1, 2] = 0
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（照抄 us_bedroom_props.py）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; inset = SW_CELL * 0.33 if name.startswith('sw_') else 0.6
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / N, 1 - py / N)


def R(name, flip=False): return lambda s, t: ruv(name, 1 - s if flip else s, t)
def S(name): return lambda s, t: ruv('sw_' + name, (s * 37.0) % 1.0, (t * 53.0) % 1.0)


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
    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M
def Ry(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M


def rbox(pm, x0, x1, y0, y1, z0, z1, uv, r=0.003, seg=1, M=None):
    W, H, D = x1 - x0, y1 - y0, z1 - z0; bm = L.rbox_bm(W, H, D, r, seg); cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2; sub = PM()
    for f in bm.faces:
        pts = [(v.co.x + cx, v.co.z + cy, -v.co.y + cz) for v in f.verts]; n = np.array([f.normal.x, f.normal.z, -f.normal.y]); k = int(np.argmax(np.abs(n)))
        key = {(0, 1): 'r', (0, -1): 'l', (1, 1): 't', (1, -1): 'b', (2, 1): 'f', (2, -1): 'k'}[(k, 1 if n[k] > 0 else -1)]; fn = uv.get(key) or uv.get('*')
        def m(p):
            x, y, z = p
            return {'t': ((x - x0) / W, (z1 - z) / D), 'b': ((x - x0) / W, (z - z0) / D), 'f': ((x - x0) / W, (y - y0) / H),
                    'k': ((x1 - x) / W, (y - y0) / H), 'r': ((z1 - z) / D, (y - y0) / H), 'l': ((z - z0) / D, (y - y0) / H)}[key]
        sub.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm.add(sub, M)


def lathe(pm, bands, n, caps=(), M=None):
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
        sub.poly(pts, [fn(0.5 + p[0] / (2 * r), 0.5 + p[2] / (2 * r)) for p in pts], (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def sphere(pm, c, r, fn, seg=10, rings=6, M=None, scale=(1, 1, 1)):
    sub = PM()
    for j in range(rings):
        t0, t1 = math.pi * j / rings, math.pi * (j + 1) / rings
        for i in range(seg):
            p0, p1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            q = [(math.sin(t) * math.cos(p), math.cos(t), math.sin(t) * math.sin(p)) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            pts = [(c[0] + r * scale[0] * a, c[1] + r * scale[1] * b, c[2] + r * scale[2] * cc) for a, b, cc in q]
            if j == 0: pts, uvs = [pts[0], pts[2], pts[3]], [fn(0.5, 1)] * 3
            elif j == rings - 1: pts, uvs = [pts[0], pts[1], pts[2]], [fn(0.5, 0)] * 3
            else: uvs = [fn(p / (2 * math.pi), 1 - t / math.pi) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            sub.poly(pts, uvs, tuple(np.mean(np.array(q), axis=0)))
    return pm.add(sub, M)


def sweep(pm, pts, r, sides, fn, caps=True, closed=False, M=None):
    P = [np.array(p, float) for p in pts]; n = len(P); rings = []; prev_u = None
    for i in range(n):
        tdir = (P[(i + 1) % n] - P[(i - 1) % n]) if closed else (P[min(i + 1, n - 1)] - P[max(i - 1, 0)])
        tdir /= max(1e-9, np.linalg.norm(tdir))
        if prev_u is None:
            u = np.cross(tdir, [0, 1.0, 0]); u = u if np.linalg.norm(u) > 1e-6 else np.cross(tdir, [1.0, 0, 0])
        else: u = prev_u - tdir * np.dot(prev_u, tdir)
        u /= np.linalg.norm(u); w = np.cross(tdir, u); prev_u = u
        rr = r(i / max(1, n - 1)) if callable(r) else r
        rings.append([P[i] + (u * math.cos(2 * math.pi * k / sides) + w * math.sin(2 * math.pi * k / sides)) * rr for k in range(sides)])
    sub = PM(); m = n if closed else n - 1
    for i in range(m):
        A, Bv = rings[i], rings[(i + 1) % n]
        for k in range(sides):
            k1 = (k + 1) % sides; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4; ctr = (P[i] + P[(i + 1) % n]) / 2
            sub.poly([A[k], A[k1], Bv[k1], Bv[k]], [fn(i / m, k / sides), fn(i / m, (k + 1) / sides), fn((i + 1) / m, (k + 1) / sides), fn((i + 1) / m, k / sides)], tuple(c - ctr))
    if caps and not closed:
        for idx, sgn in ((0, -1), (n - 1, 1)):
            tdir = P[min(idx + 1, n - 1)] - P[max(idx - 1, 0)]
            sub.poly(rings[idx], [fn(0.5, 0.5)] * sides, tuple(tdir * sgn))
    return pm.add(sub, M)


def to_blender(pm, name, mats, parent, angle=0.6):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mats[0])
    me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])   # 輪廓的凹多邊形先自己切成三角形（不靠匯出時的切法）
    bm.to_mesh(me); bm.free(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


# ================= 輪廓擠出（搖搖動物）=================
def chaikin(pts, it=1):
    for _ in range(it):
        out = []
        for i in range(len(pts)):
            a, b = np.array(pts[i]), np.array(pts[(i + 1) % len(pts)]); out += [tuple(0.75 * a + 0.25 * b), tuple(0.25 * a + 0.75 * b)]
        pts = out
    return pts


def inset(pts, d):
    """逆時針多邊形往內縮 d（斜接，限制最大長度，凹角不會爆）"""
    P = np.array(pts, float); n = len(P); out = []
    for i in range(n):
        a, b, c = P[i - 1], P[i], P[(i + 1) % n]
        e0 = (b - a) / np.linalg.norm(b - a); e1 = (c - b) / np.linalg.norm(c - b)
        n0, n1 = np.array((-e0[1], e0[0])), np.array((-e1[1], e1[0]))   # 逆時針的內側法線
        m = n0 + n1; m = m / max(1e-9, np.linalg.norm(m)); k = d / max(0.45, np.dot(m, n0)); out.append(tuple(b + m * k))
    return out


def silhouette(pm, outline, thick, rim, fn, K=2):
    """側面輪廓擠出成一體成型的塑膠件：中間兩片平面、邊緣一圈圓角（K 段）、側邊一條直的帶子；fn(x, y)→uv（兩面共用同一張側面貼圖）"""
    hz = thick / 2; rings = []   # (內縮, z) 從後面中心往外繞到前面中心
    prof = [(rim * (1 - math.cos(a)), -(hz - rim) - rim * math.sin(a)) for a in np.linspace(math.pi / 2, 0, K + 1)]   # 後面：內縮 rim → 0
    prof += [(rim * (1 - math.cos(a)), (hz - rim) + rim * math.sin(a)) for a in np.linspace(0, math.pi / 2, K + 1)]   # 前面：0 → 內縮 rim
    R_ = [[(x, y, z) for (x, y) in (inset(outline, d) if d > 1e-9 else outline)] for d, z in prof]
    n = len(outline)
    for j in range(len(R_) - 1):
        A, Bv = R_[j], R_[j + 1]
        for i in range(n):
            i1 = (i + 1) % n; pts = [A[i], A[i1], Bv[i1], Bv[i]]
            e = np.array(outline[i1]) - np.array(outline[i]); out_n = np.array((e[1], -e[0])); zm = (A[i][2] + Bv[i][2]) / 2
            pm.poly(pts, [fn(p[0], p[1]) for p in pts], (out_n[0], out_n[1], zm * 4))
    for ring, sg in ((R_[0], -1), (R_[-1], 1)):
        pm.poly(ring, [fn(p[0], p[1]) for p in ring], (0, 0, sg))
    return pm


def side_uv(name):
    X0, Y0, X1, Y1 = SIDE_BOX
    return lambda x, y: ruv(name, (x - X0) / (X1 - X0), (y - Y0) / (Y1 - Y0))


# ================= 溜滑梯 =================
DECK_Y, HALF = 1.10, 0.45
LAD_X = -0.87      # 階梯底端（LAWWW2-B 原本寫 −0.6：只多出平台 15 cm，五階會變成直梯；放在 (−1.55, 0) 時到 −2.42，還在遊戲場的 −2.6 以內）


def slide_path():
    """滑道內面最低線的高度：平台邊 0.45 起，先平 10 cm，平順地下到 2.45 的 0.22，再平到 2.90"""
    pts = []
    for k in range(25):
        x = 0.45 + 2.45 * k / 24
        if x <= 0.55: y = DECK_Y
        elif x >= 2.45: y = 0.22
        else:
            u = (x - 0.55) / 1.9; y = DECK_Y - (DECK_Y - 0.22) * (u * u * (3 - 2 * u))
        pts.append((x, y))
    return pts


def slide():
    pm = PM(); yel, blu, ora = S('yellow'), S('blue'), S('orange')
    # 平台（打孔鋼板）
    rbox(pm, -HALF, HALF, DECK_Y - 0.06, DECK_Y, -HALF, HALF, {'t': R('deck'), '*': blu}, r=0.012, seg=1)
    # 四根柱子（上面的圓帽在屋頂下面一點）
    for x in (-0.42, 0.42):
        for z in (-0.42, 0.42):
            lathe(pm, [(0.045, 0.0, 0.045, 1.98, yel, 'out'), (0.045, 1.98, 0.03, 2.025, yel, 'out'), (0.03, 2.025, 0.0, 2.04, yel, 'out')], 10, M=T(x, 0, z))
    # 兩側的護板：波浪的上緣、兩端圓角（厚 3 cm）
    xe, r = 0.37, 0.08
    def top(x):
        y = 1.52 + 0.035 * math.cos(4 * math.pi * (x + xe) / (2 * xe))
        dx = abs(x) - (xe - r)
        if dx > 0: y = min(y, (1.52 - r) + math.sqrt(max(0.0, r * r - dx * dx)))
        return y
    xs = list(np.linspace(-xe, xe, 25))
    for zc, sg in ((-HALF - 0.005, -1), (HALF + 0.005, 1)):
        for zz, side in ((zc + sg * 0.015, sg), (zc - sg * 0.015, -sg)):
            for a, b in zip(xs, xs[1:]):
                pts = [(a, DECK_Y, zz), (b, DECK_Y, zz), (b, top(b), zz), (a, top(a), zz)]
                pm.poly(pts, [R('panel')((p[0] + xe) / (2 * xe), (p[1] - DECK_Y) / 0.5) for p in pts], (0, 0, side))
        z0, z1 = zc - 0.015, zc + 0.015
        for a, b in zip(xs, xs[1:]):
            pm.poly([(a, top(a), z0), (b, top(b), z0), (b, top(b), z1), (a, top(a), z1)], [ora(0, 0)] * 4, (0, 1, 0))
        for x in (-xe, xe):
            pm.poly([(x, DECK_Y, z0), (x, top(x), z0), (x, top(x), z1), (x, DECK_Y, z1)], [ora(0, 0)] * 4, (np.sign(x), 0, 0))
    # 小四坡頂（四角錐、有厚度、角朝四根柱子）＋頂上的圓球
    rc = 0.62 * math.sqrt(2)
    lathe(pm, [(rc, 1.97, 0.05, 2.29, ora, 'out'), (0.05, 2.29, 0.0, 2.30, ora, 'out'), (rc - 0.03, 1.945, rc, 1.97, ora, 'out'),
               (0.0, 2.265, rc - 0.03, 1.945, ora, 'in')], 4, M=Ry(math.pi / 4))
    sphere(pm, (0, 2.32, 0), 0.04, ora, seg=8, rings=4)
    # −x 的階梯：兩條側樑（從地面斜上到平台邊）、五片踏板、兩條扶手
    run = -HALF - 0.02 - LAD_X
    for z in (-0.29, 0.29):
        sweep(pm, [(LAD_X - 0.02, 0.0, z), (-HALF - 0.03, DECK_Y - 0.02, z)], 0.026, 6, yel)
    for k in range(1, 6):
        y = 0.19 * k; x = LAD_X + run * y / DECK_Y
        rbox(pm, x - 0.065, x + 0.065, y - 0.035, y, -0.27, 0.27, {'*': blu}, r=0.012, seg=1)
    for z in (-0.33, 0.33):
        sweep(pm, smooth_open([(LAD_X - 0.06, 0.0, z), (LAD_X - 0.06, 0.62, z), (LAD_X + 0.0, 0.72, z), (-0.56, 1.50, z), (-0.50, 1.60, z), (-0.44, 1.63, z * 1.16), (-0.42, 1.63, z * 1.27)], 2),
              0.022, 8, yel)
    # +x 的 U 形滑道：內面、外面、兩條上緣、兩端
    PIN = [(-0.235, 0.19), (-0.235, 0.05), (-0.205, -0.012), (-0.12, -0.03), (0.0, -0.035), (0.12, -0.03), (0.205, -0.012), (0.235, 0.05), (0.235, 0.19)]
    POUT = [(-0.265, 0.19), (-0.265, 0.04), (-0.232, -0.038), (-0.13, -0.06), (0.0, -0.065), (0.13, -0.06), (0.232, -0.038), (0.265, 0.04), (0.265, 0.19)]
    path = slide_path(); Lp = [0.0]
    for a, b in zip(path, path[1:]): Lp.append(Lp[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    rin, rout = [], []
    for i, (x, y) in enumerate(path):
        a, b = path[max(i - 1, 0)], path[min(i + 1, len(path) - 1)]; d = np.array((b[0] - a[0], b[1] - a[1])); d /= np.linalg.norm(d)
        up = np.array((-d[1], d[0])); base = np.array((x, y + 0.035))
        rin.append([(*(base + up * h), z) for (z, h) in PIN]); rout.append([(*(base + up * h), z) for (z, h) in POUT])
    rin = [[(p[0], p[1], p[2]) for p in r_] for r_ in rin]; rout = [[(p[0], p[1], p[2]) for p in r_] for r_ in rout]
    gin, gout = R('slide_in'), S('green'); np_ = len(PIN)
    for i in range(len(path) - 1):
        t0, t1 = Lp[i] / Lp[-1], Lp[i + 1] / Lp[-1]
        for k in range(np_ - 1):
            s0, s1 = k / (np_ - 1), (k + 1) / (np_ - 1)
            q = [rin[i][k], rin[i][k + 1], rin[i + 1][k + 1], rin[i + 1][k]]; c = np.mean(np.array(q), 0)
            nrm = np.array((0.0, 1.0, 0.0)) if 0 < k < np_ - 2 else np.array((0.0, 0.0, -np.sign(c[2])))
            pm.poly(q, [gin(s0, t0), gin(s1, t0), gin(s1, t1), gin(s0, t1)], tuple(nrm))
            q = [rout[i][k], rout[i][k + 1], rout[i + 1][k + 1], rout[i + 1][k]]
            nrm = np.array((0.0, -1.0, 0.0)) if 0 < k < np_ - 2 else np.array((0.0, 0.0, np.sign(c[2])))
            pm.poly(q, [gout(0, 0)] * 4, tuple(nrm))
        for k in (0, np_ - 1):   # 上緣
            pm.poly([rin[i][k], rin[i + 1][k], rout[i + 1][k], rout[i][k]], [gout(0, 0)] * 4, (0, 1, 0))
    for i, sg in ((0, -1), (len(path) - 1, 1)):   # 兩端的截面
        for k in range(np_ - 1):
            pm.poly([rin[i][k], rin[i][k + 1], rout[i][k + 1], rout[i][k]], [S('green_dk')(0, 0)] * 4, (sg, 0, 0))
    # 入口上方的橫桿（坐下來先抓的那一支）
    arch = [(0.47, DECK_Y + 0.19, -0.25)] + [(0.47, 1.42 + 0.23 * math.sin(a), -0.25 * math.cos(a)) for a in np.linspace(0, math.pi, 11)] + [(0.47, DECK_Y + 0.19, 0.25)]
    sweep(pm, arch, 0.02, 8, yel)
    # 出口下面兩支短腳
    for z in (-0.18, 0.18):
        lathe(pm, [(0.03, 0.0, 0.03, 0.17, S('green_dk'), 'out'), (0.06, 0.0, 0.03, 0.0, S('green_dk'), 'down')], 8, M=T(2.62, 0, z))
    return pm


# ================= 搖搖動物 =================
def smooth_open(pts, it=2):
    """開放折線的 Chaikin 圓角（兩端點不動）"""
    for _ in range(it):
        out = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            a, b = np.array(a), np.array(b); out += [tuple(0.75 * a + 0.25 * b), tuple(0.25 * a + 0.75 * b)]
        out.append(pts[-1]); pts = out
    return pts


def coil(pm, y0, y1, r, turns, wire, fn):
    pts = [(r * math.cos(2 * math.pi * turns * k / (10 * turns)), y0 + (y1 - y0) * k / (10 * turns), r * math.sin(2 * math.pi * turns * k / (10 * turns))) for k in range(int(10 * turns) + 1)]
    sweep(pm, pts, wire, 6, fn)


def rider(kind):
    pm = PM(); outline = chaikin(HORSE if kind == 'horse' else DUCK, 1); thick = 0.15 if kind == 'horse' else 0.19
    silhouette(pm, outline, thick, 0.024, side_uv(kind), K=2)
    st, base = S('steel'), S('base_side')
    # 底盤（圓角的鋼盤、上面一圈髒）＋彈簧座＋彈簧＋身體下面的安裝盤
    lathe(pm, [(0.17, 0.0, 0.17, 0.022, base, 'out'), (0.17, 0.022, 0.155, 0.032, base, 'out'), (0.155, 0.032, 0.08, 0.032, R('base'), 'up'),
               (0.08, 0.032, 0.08, 0.065, st, 'out'), (0.08, 0.065, 0.0, 0.065, st, 'up')], 16,
          caps=(), M=None)
    coil(pm, 0.065, 0.30, 0.068, 4.5, 0.012, st)
    lathe(pm, [(0.075, 0.30, 0.075, 0.325, st, 'out'), (0.0, 0.30, 0.075, 0.30, st, 'down')], 12)
    # 握把：穿過頭，兩端黑色握套；腳踏：穿過下腹
    hx, hy = (0.25, 0.72) if kind == 'horse' else (0.17, 0.76)
    sweep(pm, [(hx, hy, -0.15), (hx, hy, 0.15)], 0.013, 8, st)
    for sg in (-1, 1): sweep(pm, [(hx, hy, sg * 0.095), (hx, hy, sg * 0.165)], 0.019, 8, S('grip'))
    fx, fy = (0.06, 0.37) if kind == 'horse' else (0.04, 0.37)
    sweep(pm, [(fx, fy, -0.21), (fx, fy, 0.21)], 0.014, 8, st)
    for sg in (-1, 1): sweep(pm, [(fx, fy, sg * 0.15), (fx, fy, sg * 0.215)], 0.02, 8, S('grip'))
    return pm


def spring_a(): return rider('horse')
def spring_b(): return rider('duck')


# ================= 沙坑 =================
def sandbox():
    pm = PM(); W, D, H, th = 0.9, 0.65, 0.25, 0.07; wd, wt, we = R('wood'), R('wood_top'), S('wood_end')
    # 木框：長邊整條、短邊夾在中間（不重疊，角不會閃）
    for z0, z1 in ((D - th, D), (-D, -D + th)): rbox(pm, -W, W, 0.0, H, z0, z1, {'f': wd, 'k': wd, 't': wd, 'l': we, 'r': we, '*': wd}, r=0.008, seg=1)
    for x0, x1 in ((-W, -W + th), (W - th, W)): rbox(pm, x0, x1, 0.0, H, -D + th, D - th, {'r': wd, 'l': wd, 't': wd, 'f': we, 'k': we, '*': wd}, r=0.008, seg=1)
    # 座板（12 cm 寬、3 cm 厚，往內凸出一點）
    for z0, z1 in ((D - 0.12, D + 0.005), (-D - 0.005, -D + 0.12)): rbox(pm, -W - 0.005, W + 0.005, H, H + 0.03, z0, z1, {'t': wt, '*': we}, r=0.008, seg=1)
    for x0, x1 in ((-W - 0.005, -W + 0.12), (W - 0.12, W + 0.005)): rbox(pm, x0, x1, H, H + 0.03, -D + 0.12, D - 0.12, {'t': wt, '*': we}, r=0.008, seg=1)
    # 沙面：格子＋起伏（靠牆高一點、中間一個挖過的小坑）
    xi, zi = W - th, D - th; nx, nz = 12, 8; gx, gz = np.linspace(-xi, xi, nx + 1), np.linspace(-zi, zi, nz + 1)
    def h(x, z):
        edge = max(abs(x) / xi, abs(z) / zi) ** 6
        return 0.165 + 0.025 * edge + 0.012 * math.sin(3.1 * x + 1.3) * math.cos(4.2 * z) - 0.04 * math.exp(-((x + 0.35) ** 2 + (z - 0.12) ** 2) / 0.018)
    sd = R('sand')
    for i in range(nx):
        for j in range(nz):
            q = [(gx[i], h(gx[i], gz[j]), gz[j]), (gx[i + 1], h(gx[i + 1], gz[j]), gz[j]), (gx[i + 1], h(gx[i + 1], gz[j + 1]), gz[j + 1]), (gx[i], h(gx[i], gz[j + 1]), gz[j + 1])]
            pm.poly(q, [sd((p[0] + xi) / (2 * xi), (p[2] + zi) / (2 * zi)) for p in q], (0, 1, 0))
    # 水桶（角落，口朝上，有一點歪）：外壁、口緣、內壁、底；提把倒在旁邊
    bx, bz = 0.52, 0.32; by = h(bx, bz) - 0.005; bk, bi = S('bucket'), S('bucket_in')
    lathe(pm, [(0.062, 0.0, 0.08, 0.125, bk, 'out'), (0.08, 0.125, 0.074, 0.13, bk, 'up'), (0.074, 0.13, 0.058, 0.012, bi, 'in'), (0.058, 0.012, 0.0, 0.012, bi, 'up')], 12,
          M=T(bx, by, bz) @ Ry(0.3))
    sweep(pm, [(bx + 0.085 * math.cos(a), by + 0.11 + 0.045 * math.sin(math.pi * (k / 8)), bz + 0.085 * math.sin(a)) for k, a in enumerate(np.linspace(math.pi * 0.55, math.pi * 1.45, 9))],
          0.004, 4, bk)
    # 鏟子：躺在沙上（柄＋微彎的鏟面）
    sx, sz_ = 0.28, 0.42; sy = h(sx, sz_) + 0.012; sh = S('shovel')
    sweep(pm, [(sx - 0.17, sy + 0.012, sz_ - 0.05), (sx - 0.02, sy + 0.004, sz_ - 0.005)], 0.009, 6, sh)
    bl = []
    for k in range(5):
        u = k / 4; zz = -0.045 + 0.09 * u; bl.append([(sx - 0.02 + 0.11 * v, sy + 0.012 * (1 - (2 * u - 1) ** 2) * 1.0, sz_ + zz * (1 - 0.35 * v)) for v in (0.0, 0.5, 1.0)])
    for k in range(4):
        for j in range(2):
            q = [bl[k][j], bl[k + 1][j], bl[k + 1][j + 1], bl[k][j + 1]]
            pm.poly(q, [sh(0, 0)] * 4, (0, 1, 0)); pm.poly([(p[0], p[1] - 0.004, p[2]) for p in q], [sh(0, 0)] * 4, (0, -1, 0))
    return pm


ITEMS = {'PARK_SLIDE': slide, 'PARK_SPRING_A': spring_a, 'PARK_SPRING_B': spring_b, 'PARK_SANDBOX': sandbox}
# GLB 裡的位置照 LAWWW2-B 給的遊戲場本地座標（溜滑梯平台中心 (−1.55, 0)、搖搖動物 (0.9, 0.6)、(1.85, 0.6)、沙坑 (1.4, −0.9)）
SPREAD = {'PARK_SLIDE': (-1.55, 0.0, 0.0, 0), 'PARK_SPRING_A': (0.9, 0.0, 0.6, 0), 'PARK_SPRING_B': (1.85, 0.0, 0.6, 0), 'PARK_SANDBOX': (1.4, 0.0, -0.9, 0)}
BUDGET = {'PARK_SLIDE': 4200, 'PARK_SPRING_A': 1650, 'PARK_SPRING_B': 1650, 'PARK_SANDBOX': 1100}
TOTAL_BUDGET = 8000
SMOOTH = {'PARK_SLIDE': 0.75, 'PARK_SPRING_A': 1.0, 'PARK_SPRING_B': 1.0, 'PARK_SANDBOX': 0.6}


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('park_play_props', props={'kind': 'park_play_props'})
    mat = bpy.data.materials.new('park_play'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}; over = []
    for name, fn in ITEMS.items():
        pm = fn(); ob = to_blender(pm, name, (mat,), root, SMOOTH.get(name, 0.6)); x, y, z, a = SPREAD[name]
        ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if tris > BUDGET[name]: over.append((name, tris))
    total = sum(m['tris'] for m in mods.values())
    print('TRIS', json.dumps({k: v['tris'] for k, v in mods.items()}), total, flush=True)
    print('BBOX', json.dumps({k: [v['min'], v['max']] for k, v in mods.items()}), flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '原點都在地面；GLB 裡的位置照 LAWWW2-B 給的遊戲場本地座標（SPREAD），擺放時用各自的原點',
                       'PARK_SLIDE': '原點＝平台中心的地面；平台 0.9×0.9、上緣 1.10；滑道往 +x，出口到 x 2.90（高 0.22）；階梯在 −x，底端到 x −0.87（擺在 (−1.55, 0) 時到 −2.42）；'
                                     'z 約 ±0.47（扶手 ±0.36）；屋頂最高 2.36',
                       'PARK_SPRING_A': '搖搖馬：原點＝底盤中心；頭朝 +x；座高 0.50；身體 x −0.39～+0.45（含尾巴、鼻子）、厚 0.15；握把、腳踏兩端到 z ±0.21',
                       'PARK_SPRING_B': '搖搖小鴨：原點＝底盤中心；頭朝 +x；座高 0.50；身體 x −0.38～+0.44（含尾巴、嘴）、厚 0.19；握把、腳踏兩端到 z ±0.21',
                       'PARK_SANDBOX': '沙坑：原點＝中心地面；外框 1.8（x）×1.3（z）、框高 0.25＋座板 0.03；沙面約 0.17；水桶在 (+0.52, +0.32)、鏟子在 (+0.28, +0.42)'}
    info['note'] = ('一個材質 park_play（底色 1024＋ORM 256，metal 最高 0.40：鋼彈簧、握把鋼管）；沙＝Poly Haven granular_concrete、木框＝Poly Haven dark_planks（都是 CC0）；'
                    '塑膠和烤漆是單色＋很淡的起伏；畫上去的只有眼睛、鬃毛、馬鞍、翅膀、嘴、平台打孔、滑道出口的磨痕（粗糙度也低一點）、底盤的髒邊。沒有字、品牌、標誌')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
