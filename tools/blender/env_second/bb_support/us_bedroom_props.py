"""ART-US2 美國公寓臥室家具組（SCN-US-01 祐廷租的校外學生公寓，大三下美國交換，D47；LAWWW2-B 分派 2026-10-16 12:14；BB-B 支援製作；
做法同 AA-B 的 ART-US1 aa_support/us_living_props.py：一張底色貼圖集＋ORM、網格工具照抄）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/us_bedroom_props.py [-- --out assets/models/env/second_ai/bb_support/us_bedroom_props.glb]

LAWWW2-B 做房間和組裝；這裡是臥室的家具。位置、尺寸照 src/data/us_apartment_layout.js v2 的 furniture（room:'bedroom'），
外觀照 docs/art-rebuild/second_ai/research/us_apartment_photos.md 照片一（從客廳看進臥室：米灰色地毯、灰白人字紋被子、黑色小方格櫃、吸頂燈）。
每件一個頂層節點，原點＝底部中央、正面（坐的人臉朝的方向、櫃子開口那一面）朝 +z；吸頂燈的原點是頂面中央（貼天花板），往 −y 長：
  US_BED          Full 床 1.40×2.00（床尾 +z、床頭 −z）：深色胡桃木床頭板（兩支柱子、橫紋板、頂蓋，高 1.03）、黑色鐵床架＋五支腳、
                  灰色床座、白色床單包的床墊（上緣 0.58）、兩個淺灰枕頭、灰白人字紋被子（布料模擬：蓋過床墊，兩側和床尾垂下約 0.3 m）
  US_NIGHTSTAND   黑色方格櫃（兩格疊起來）0.40×0.39×0.62：上格四本直立的書＋一本平放，下格一個灰色帆布收納籃；頂上一支手機、一本平裝書
  US_DESK         書桌 1.20×0.55×0.75（胡桃木）：左邊側板、右邊兩個抽屜的櫃子（金屬拉把）、後面的擋板；
                  桌上：闔上的筆電、黃色橫線便條本（legal pad）＋原子筆、兩本厚的教科書、白色馬克杯、黑色檯燈（子節點 US_DESK_GLOW＝燈罩內面）
  US_DESKCHAIR    黑色辦公椅：五爪腳＋輪子、氣壓桿、布面座墊（座高 0.46）、網背（往前包）、兩邊扶手
  US_SUITCASE     硬殼行李箱攤平在地上（每一半 0.45×0.70）：放東西的那一半在原點（襯布、拉鍊、折好的牛仔褲和 T 恤、盥洗包、一捲襪子，一件淺藍 T 恤拉出來垂到地上），
                  蓋子攤在 −x 那一邊（裡面一片網狀隔層）；兩半各兩個輪子在 −z 端、側邊提把在 +x
  US_CEILINGLIGHT 吸頂燈（直徑 0.37、高 0.15）：白色底盤、鎳色金屬圈、霧面玻璃半圓罩、中間的小螺帽；子節點 US_CEILINGLIGHT_GLOW＝玻璃罩（亮度由遊戲控制）
沒有字、品牌、校名、校徽（D77）。
材質兩個：us_bedroom（不透明：1024 底色貼圖集＋256 ORM，metal 最高 0.40）、US_glow（燈罩內面、吸頂燈玻璃罩：奶油色、有發光；LAWWW-B 在遊戲裡控制亮度）。
貼圖：被子＝Poly Haven poly_wool_herringbone 的纖維明暗＋畫上去的人字紋（印花：白底灰色斜紋，一欄 5.5 cm）；床單、枕頭、床座、收納籃、椅墊、襯布＝rough_linen 的纖維明暗；
T 恤＝cotton_jersey；牛仔褲＝denim_fabric（原色，只取沒有縫線的那一塊）；木頭＝walnut_veneer 加深（床頭板、書桌）、更深（方格櫃）。都是 CC0（LICENSES 段落見 README）。
畫的只有本來就是畫上去的東西：人字紋印花、便條本的橫線、T 恤的領口、收納籃的提把洞、行李箱殼的凹凸紋（只有明暗）、網背的網目。
造型：床墊、座墊、行李箱殼、折好的衣服是「圓角方塊＋格子」（AA-B 的 cushion）；被子是布料模擬；其他是倒角方塊、旋轉體、沿曲線的管子。
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
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/us_bedroom_props.glb'
TEXB = os.path.join(HERE, 'textures')
GEN = os.path.join(TEXB, 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'us_bedroom_props_{k}.png') for k in ('atlas', 'orm'))
TEX2 = os.path.join(PARENT, 'textures')
SRC = {'herring': os.path.join(TEXB, 'poly_wool_herringbone', 'poly_wool_herringbone_diff_1k.jpg'),
       'linen': os.path.join(TEXB, 'rough_linen', 'rough_linen_diff_1k.jpg'),
       'jersey': os.path.join(TEXB, 'cotton_jersey', 'cotton_jersey_diff_1k.jpg'),
       'denim': os.path.join(TEXB, 'denim_fabric', 'denim_fabric_diff_1k.jpg'),
       'walnut': os.path.join(TEX2, 'walnut_veneer', 'walnut_veneer_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40
MT = 0.58          # 床墊上緣
DUVET = dict(x0=-0.985, x1=0.985, z0=-0.42, z1=1.27, nx=26, nz=22)   # 被子（模擬前攤平的大小）：寬 1.97、長 1.69

REG = {
    'duvet': (0, 0, 512, 512),            # 被子正面：白底灰色人字紋（一欄 5.5 cm、斜紋間距 2.2 cm）＋羊毛人字紋的纖維明暗
    'sheet': (512, 0, 768, 256),          # 白色床單（床墊）：亞麻纖維明暗
    'pillow': (768, 0, 1024, 256),        # 枕頭套：很淺的灰，邊上一圈縫線
    'walnut_h': (512, 256, 768, 512),     # 胡桃木（橫紋，沿 s）：床頭板的板子、頂蓋、書桌桌面、抽屜面
    'walnut_v': (768, 256, 896, 512),     # 胡桃木（直紋，沿 t）：床頭柱子、書桌側板
    'blackwood': (896, 256, 1024, 512),   # 黑色木頭（方格櫃）：很淡的木紋
    'boxspring': (0, 512, 128, 640),      # 床座：灰色布、上下兩條滾邊
    'duvet_back': (128, 512, 256, 640),   # 被子反面：白
    'shell': (256, 512, 384, 640),        # 行李箱殼的大面：深藍綠、沿長邊的凹凸紋（只有明暗）
    'shell_plain': (384, 512, 512, 640),  # 行李箱殼的側面
    'lining': (512, 512, 640, 640),       # 行李箱襯布：灰藍、一條拉鍊袋的線
    'mesh': (640, 512, 768, 640),         # 辦公椅網背：黑、細的網目
    'seat': (768, 512, 896, 640),         # 辦公椅座墊：黑色布
    'legalpad': (896, 512, 1024, 640),    # 黃色便條本：藍色橫線、紅色直線（左邊兩條）、上面一條深紅的膠裝
    'tee_gray': (0, 640, 128, 768),       # 折好的灰 T 恤（側面）
    'tee_gray_top': (128, 640, 256, 768),  # 折好的灰 T 恤（上面：領口、肩線）
    'tee_navy': (256, 640, 384, 768),
    'tee_navy_top': (384, 640, 512, 768),
    'tee_white': (512, 640, 640, 768),    # 拉出來的淺藍 T 恤：t=1 那一端是領口
    'denim': (640, 640, 768, 768),        # 牛仔褲（側面）
    'denim_top': (768, 640, 896, 768),    # 牛仔褲（上面：一條側邊的縫線）
    'bin': (896, 640, 1024, 768),         # 收納籃：灰色帆布、上緣深一點、正面的提把洞
    'pouch': (0, 768, 128, 896),          # 盥洗包：橄欖綠、一條拉鍊
}
SW = {
    'black_plastic': ((24, 24, 26), 0.55, 0.0), 'metal_black': ((32, 32, 34), 0.4, 0.3), 'nickel': ((196, 196, 192), 0.25, METAL),
    'steel': ((170, 172, 176), 0.3, METAL), 'laptop': ((176, 178, 182), 0.35, METAL), 'laptop_gap': ((40, 40, 44), 0.5, 0.0),
    'caster': ((20, 20, 22), 0.5, 0.0), 'white_paint': ((236, 236, 232), 0.45, 0.0), 'mug': ((236, 234, 228), 0.25, 0.0),
    'coffee': ((52, 34, 22), 0.15, 0.0), 'pen_blue': ((38, 66, 150), 0.4, 0.0), 'pen_cap': ((28, 28, 32), 0.4, 0.0),
    'phone': ((18, 18, 20), 0.25, 0.0), 'zipper': ((38, 38, 40), 0.45, 0.2), 'wheel': ((26, 26, 28), 0.6, 0.0), 'rubber': ((30, 30, 32), 0.8, 0.0),
    'book_navy': ((40, 54, 88), 0.7, 0.0), 'book_maroon': ((112, 40, 44), 0.7, 0.0), 'book_beige': ((198, 182, 150), 0.75, 0.0),
    'book_green': ((52, 84, 64), 0.7, 0.0), 'book_gray': ((122, 124, 128), 0.7, 0.0), 'book_mustard': ((184, 148, 70), 0.7, 0.0),
    'book_white': ((228, 226, 218), 0.75, 0.0), 'page': ((236, 230, 214), 0.85, 0.0), 'pad_edge': ((232, 216, 132), 0.85, 0.0),
    'pad_back': ((150, 132, 104), 0.9, 0.0), 'sock': ((88, 90, 96), 0.95, 0.0), 'sock_band': ((70, 74, 84), 0.95, 0.0),
    'shell_sw': ((44, 70, 88), 0.32, 0.0), 'lining_sw': ((118, 124, 132), 0.9, 0.0), 'lamp_in': ((40, 40, 42), 0.5, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'duvet': (0.9, 0.0), 'sheet': (0.9, 0.0), 'pillow': (0.9, 0.0), 'walnut_h': (0.5, 0.0), 'walnut_v': (0.5, 0.0), 'blackwood': (0.45, 0.0),
           'boxspring': (0.92, 0.0), 'duvet_back': (0.9, 0.0), 'shell': (0.32, 0.0), 'shell_plain': (0.32, 0.0), 'lining': (0.9, 0.0),
           'mesh': (0.8, 0.0), 'seat': (0.9, 0.0), 'legalpad': (0.85, 0.0), 'tee_gray': (0.95, 0.0), 'tee_gray_top': (0.95, 0.0),
           'tee_navy': (0.95, 0.0), 'tee_navy_top': (0.95, 0.0), 'tee_white': (0.95, 0.0), 'denim': (0.9, 0.0), 'denim_top': (0.9, 0.0),
           'bin': (0.95, 0.0), 'pouch': (0.85, 0.0)}


# ================= 貼圖：布、木的質感來自 Poly Haven（CC0）；只有本來就是畫上去的東西（印花、橫線、領口）是畫的 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def lum(path, w, h, crop=None, tile=(1, 1), blur=0.0):
    """標準化的明暗起伏（平均 0、標準差 1）；crop＝(x0, y0, x1, y1) 比例；tile＝(nx, ny) 重複幾次（纖維照真實大小）；blur：太細的纖維先模糊（不然縮小後變雜訊）"""
    im = Image.open(path).convert('L')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    tw, th = max(1, w // tile[0]), max(1, h // tile[1]); im = im.resize((tw, th), Image.LANCZOS)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    t = np.asarray(im, np.float32); a = np.tile(t, (tile[1] + 1, tile[0] + 1))[:h, :w]
    return (a - a.mean()) / max(1.0, a.std())


def tint(z, base, k):
    a = np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def put(P, name, img):
    P.paste(img, (REG[name][0] * SS, REG[name][1] * SS))


def herringbone(w, h, Wm, Dm, cw=0.055, p=0.022, duty=0.42):
    """人字紋印花：沿長邊（t）一欄一欄，每欄的斜紋方向相反；回傳 0～1 的灰色比例（已經反鋸齒）"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xm = (xx + 0.5) / w * Wm; zm = (yy + 0.5) / h * Dm
    col = np.floor(xm / cw); lx = xm - col * cw; d = np.where(col % 2 == 0, 1.0, -1.0)
    ph = (zm + d * lx) / p; fr = ph - np.floor(ph)
    return (fr < duty).astype(np.float32)


def paint(P):
    # 被子：人字紋印花×羊毛纖維明暗（poly_wool_herringbone 一張 27 cm）
    w, h = sz('duvet'); Wm, Dm = DUVET['x1'] - DUVET['x0'], DUVET['z1'] - DUVET['z0']
    g = herringbone(w, h, Wm, Dm); g = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7 * SS)), np.float32) / 255
    zf = lum(SRC['herring'], w, h, tile=(int(round(Wm / 0.27)), int(round(Dm / 0.27))), blur=1.2)
    white, gray = np.array((220, 219, 214), np.float32), np.array((124, 125, 128), np.float32)
    a = (white[None, None] * (1 - g[..., None]) + gray[None, None] * g[..., None]) * (1.0 + 0.07 * np.clip(zf, -2.5, 2.5))[..., None]
    hem = int(0.012 / Wm * w)   # 邊上 1.2 cm 的車縫（同色、深一點）
    a[:, :hem] *= 0.9; a[:, -hem:] *= 0.9; a[:hem] *= 0.9; a[-hem:] *= 0.9
    put(P, 'duvet', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    # 床單、被子反面、枕頭、床座：亞麻纖維（rough_linen 一張 27 cm）
    for name, base, k, size in (('sheet', (236, 235, 230), 0.05, (1.37, 1.91)), ('duvet_back', (228, 228, 224), 0.05, (0.5, 0.5)),
                                ('pillow', (214, 216, 218), 0.05, (0.66, 0.46)), ('boxspring', (176, 176, 172), 0.08, (1.4, 0.4))):
        w, h = sz(name); z = lum(SRC['linen'], w, h, tile=(max(1, int(round(size[0] / 0.27))), max(1, int(round(size[1] / 0.27)))), blur=0.8)
        img = tint(z, base, k); d = ImageDraw.Draw(img)
        if name == 'pillow': d.rectangle([0, 0, w - 1, h - 1], outline=(186, 188, 192), width=3 * SS)          # 枕頭套邊上的縫線
        if name == 'boxspring':
            for yy in (0.08, 0.92): d.line([(0, h * yy), (w, h * yy)], fill=(120, 120, 118), width=2 * SS)   # 上下的滾邊
        put(P, name, img)
    # 木頭：walnut_veneer（直紋）；橫紋＝轉 90°
    w, h = sz('walnut_h'); zw = lum(SRC['walnut'], h, w).T.copy()
    put(P, 'walnut_h', tint(zw, (78, 54, 40), 0.22))
    w, h = sz('walnut_v'); put(P, 'walnut_v', tint(lum(SRC['walnut'], w, h), (78, 54, 40), 0.22))
    w, h = sz('blackwood'); put(P, 'blackwood', tint(lum(SRC['walnut'], w, h), (31, 29, 28), 0.16))
    # 行李箱殼：深藍綠，大面沿長邊（t）七條凹凸紋（只有明暗，殼本身是平的）
    w, h = sz('shell'); s = (np.arange(w, dtype=np.float32) + 0.5) / w; band = np.ones_like(s)
    inner = (s > 0.1) & (s < 0.9); ph = (s - 0.1) / 0.8 * 7
    band[inner] = 1.0 + 0.10 * np.cos(2 * math.pi * ph[inner]) + 0.05 * np.sin(2 * math.pi * ph[inner])
    a = np.array((44, 70, 88), np.float32)[None, None] * band[None, :, None] * np.ones((h, 1, 1), np.float32)
    put(P, 'shell', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    w, h = sz('shell_plain'); put(P, 'shell_plain', Image.new('RGB', (w, h), (44, 70, 88)))
    # 襯布：灰藍亞麻、一條拉鍊袋（深灰線）
    w, h = sz('lining'); img = tint(lum(SRC['linen'], w, h, tile=(2, 2), blur=0.8), (118, 124, 132), 0.07); d = ImageDraw.Draw(img)
    d.line([(w * 0.08, h * 0.22), (w * 0.92, h * 0.22)], fill=(52, 54, 58), width=3 * SS); put(P, 'lining', img)
    # 網背：黑底、細的斜網目（看起來是一片網，不是畫的洞）
    w, h = sz('mesh'); img = Image.new('RGB', (w, h), (26, 26, 28)); d = ImageDraw.Draw(img)
    for k in range(-h, w + h, 3 * SS):
        d.line([(k, 0), (k + h, h)], fill=(48, 48, 52), width=1); d.line([(k, h), (k + h, 0)], fill=(44, 44, 48), width=1)
    d.rectangle([0, 0, w - 1, h - 1], outline=(18, 18, 20), width=4 * SS); put(P, 'mesh', img.filter(ImageFilter.GaussianBlur(0.5 * SS)))
    w, h = sz('seat'); put(P, 'seat', tint(lum(SRC['linen'], w, h, tile=(2, 2), blur=0.8), (40, 40, 43), 0.14))
    # 便條本（legal pad）：黃紙、藍色橫線（約 8.7 mm）、左邊兩條紅線、上面深紅的膠裝
    w, h = sz('legalpad'); img = Image.new('RGB', (w, h), (240, 224, 124)); d = ImageDraw.Draw(img); top = h * 0.085
    d.rectangle([0, 0, w, top], fill=(126, 34, 40))
    yv = top + h * 0.06
    while yv < h * 0.98:
        d.line([(0, yv), (w, yv)], fill=(120, 150, 196), width=SS); yv += h * 0.029
    for xm in (0.145, 0.16): d.line([(w * xm, top), (w * xm, h)], fill=(206, 80, 80), width=SS)
    put(P, 'legalpad', img.filter(ImageFilter.GaussianBlur(0.4 * SS)))
    # T 恤：cotton_jersey（一張 26 cm）；上面畫領口和肩線（折好的 T 恤正面朝上：領口在 t=1 那一端）
    for name, base in (('tee_gray', (150, 152, 156)), ('tee_navy', (46, 58, 88)), ('tee_white', (104, 140, 192))):
        w, h = sz(name); z = lum(SRC['jersey'], w, h, blur=0.6); put(P, name, tint(z, base, 0.06))
        if name == 'tee_white':   # 拉出來的那件：t=1 那一端畫領口（羅紋一圈）
            img = tint(z, base, 0.06); d = ImageDraw.Draw(img)
            d.arc([w * 0.39, -h * 0.07, w * 0.61, h * 0.07], 0, 180, fill=(80, 108, 150), width=3 * SS); put(P, name, img)
            continue
        img = tint(z, base, 0.06); d = ImageDraw.Draw(img); dk = tuple(int(c * 0.78) for c in base)
        d.arc([w * 0.32, -h * 0.14, w * 0.68, h * 0.2], 0, 180, fill=dk, width=3 * SS)              # 領口
        d.line([(w * 0.06, h * 0.06), (w * 0.3, h * 0.03)], fill=dk, width=SS); d.line([(w * 0.94, h * 0.06), (w * 0.7, h * 0.03)], fill=dk, width=SS)   # 肩線
        d.line([(w * 0.18, h * 0.06), (w * 0.18, h * 0.96)], fill=dk, width=SS); d.line([(w * 0.82, h * 0.06), (w * 0.82, h * 0.96)], fill=dk, width=SS)  # 兩邊往後折的線
        put(P, name + '_top', img.filter(ImageFilter.GaussianBlur(0.4 * SS)))
    # 牛仔褲：denim_fabric 原色（只取兩條縫線中間那一塊），上面一條側邊縫線（橘色雙線）
    w, h = sz('denim'); im = Image.open(SRC['denim']).convert('RGB'); W0, H0 = im.size
    den = im.crop((int(0.48 * W0), 0, int(0.9 * W0), int(0.42 * H0))).resize((w, h), Image.LANCZOS)
    den = Image.fromarray(np.clip(np.asarray(den, np.float32) * 0.82, 0, 255).astype(np.uint8)); put(P, 'denim', den)
    img = den.copy(); d = ImageDraw.Draw(img)
    for xm in (0.12, 0.14): d.line([(w * xm, 0), (w * xm, h)], fill=(186, 140, 84), width=SS)
    put(P, 'denim_top', img)
    # 收納籃：灰色帆布、上緣一圈深色包邊、正面的提把洞
    w, h = sz('bin'); img = tint(lum(SRC['linen'], w, h, blur=0.8), (112, 112, 110), 0.08); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, h * 0.1], fill=(70, 70, 70)); d.rounded_rectangle([w * 0.36, h * 0.18, w * 0.64, h * 0.3], radius=h * 0.06, fill=(30, 30, 30))
    put(P, 'bin', img)
    w, h = sz('pouch'); img = tint(lum(SRC['linen'], w, h, blur=0.8), (96, 104, 72), 0.08); d = ImageDraw.Draw(img)
    d.line([(w * 0.05, h * 0.2), (w * 0.95, h * 0.2)], fill=(34, 34, 34), width=3 * SS); put(P, 'pouch', img)


def make_textures():
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); paint(P); d = ImageDraw.Draw(P)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 150; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else ORM_REG[name]
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 1] = int(rough * 255)
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 2] = int(min(metal, METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（照抄 aa_support/us_living_props.py；加了 Rz、rrect、drape）=================
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
    def tris(self): return sum(len(f) - 2 for f in self.f)
    def bbox(self):
        a = np.array(self.v); return [round(float(v), 4) for v in a.min(0)], [round(float(v), 4) for v in a.max(0)]


def T(x, y, z): M = np.eye(4); M[:3, 3] = (x, y, z); return M
def Ry(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M
def Rx(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c; return M
def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M
def Sc(sx, sy, sz_): return np.diag([sx, sy, sz_, 1.0])


def rbox(pm, x0, x1, y0, y1, z0, z1, uv, r=0.003, seg=1, M=None):
    """倒角方塊（lib2.rbox_bm）；UV 照面的法線方向投影：t 上 b 下 f 前（+z）k 後 r 右（+x）l 左"""
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
        sub.poly(pts, [fn(0.5 - p[0] / (2 * r), 0.5 + p[2] / (2 * r)) for p in pts], (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def sphere(pm, c, r, fn, seg=10, rings=6, M=None, scale=(1, 1, 1)):
    sub = PM()
    for j in range(rings):
        t0, t1 = math.pi * j / rings, math.pi * (j + 1) / rings
        for i in range(seg):
            p0, p1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            q = [(math.sin(t) * math.cos(p), math.cos(t), math.sin(t) * math.sin(p)) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            pts = [(c[0] + r * scale[0] * a, c[1] + r * scale[1] * b, c[2] + r * scale[2] * cc) for a, b, cc in q]
            if j == 0: pts, uvs = [pts[0], pts[2], pts[3]], [fn(0.5, 1)] * 3          # 頂端是三角形（不留退化的面）
            elif j == rings - 1: pts, uvs = [pts[0], pts[1], pts[2]], [fn(0.5, 0)] * 3
            else: uvs = [fn(p / (2 * math.pi), 1 - t / math.pi) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            mid = np.mean(np.array(q), axis=0); sub.poly(pts, uvs, tuple(mid))
    return pm.add(sub, M)


def sweep(pm, pts, r, sides, fn, caps=True, closed=False, M=None):
    """沿折線的管子（平行移動的框架，圈不會扭轉）；fn(s, t)：s 沿管子、t 繞一圈"""
    P = [np.array(p, float) for p in pts]; n = len(P); rings = []; prev_u = None
    for i in range(n):
        if closed: tdir = P[(i + 1) % n] - P[(i - 1) % n]
        else: tdir = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]
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


def box(pm, x0, x1, y0, y1, z0, z1, uv, M=None, skip=()):
    """沒有倒角的小方塊：6 面 12 個三角形；uv 的鍵同 rbox；skip：不做的面"""
    sub = PM()
    F = {'t': ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)), 'k': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], (0, 0, -1)),
         'r': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], (1, 0, 0)), 'l': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0))}
    for key, (pts, n) in F.items():
        if key in skip: continue
        fn = uv.get(key) or uv.get('*'); sub.poly(pts, [fn(0, 0), fn(1, 0), fn(1, 1), fn(0, 1)], n)
    return pm.add(sub, M)


def cushion(pm, W, H, D, r, k=(2, 0, 2), sag=0.0, bulge=0.0, bend=0.0, uv=None, skip=('b',), M=None):
    """圓角方塊，每一面都有內部格點（才能塌、鼓）。中心在原點；W＝x、H＝y、D＝z。
    sag：上面中間往下塌（公尺）；bulge：側面中段往外鼓（比例）；bend：兩側往 +z 彎；uv：{面: 色塊}；skip：不做的面"""
    uv = uv or {}; hx, hy, hz = W / 2, H / 2, D / 2; re = min(r, 0.95 * min(hx, hy, hz)); hs = np.array([hx, hy, hz])
    def axl(h, kk):
        return [-h, -h + 0.35 * re] + list(np.linspace(-h + re, h - re, kk + 2)) + [h - 0.35 * re, h]
    AX = [axl(hx, k[0]), axl(hy, k[1]), axl(hz, k[2])]
    def place(q):
        q = np.array(q, float); inner = np.clip(q, -(hs - re), hs - re); dv = q - inner; n = np.linalg.norm(dv)
        p = inner + (dv / n * re if n > 1e-9 else 0)
        x, y, z = p; wy = max(0.0, y / hy) ** 2
        y -= sag * (1 - (x / hx) ** 2) * (1 - (z / hz) ** 2) * wy
        f = 1 + bulge * (1 - min(1.0, (y / hy) ** 2)); x *= f; z *= f
        z += bend * (x / hx) ** 2
        return (x, y, z)
    faces = {'t': (1, 1, 0, 2), 'b': (1, -1, 0, 2), 'f': (2, 1, 0, 1), 'k': (2, -1, 0, 1), 'r': (0, 1, 2, 1), 'l': (0, -1, 2, 1)}
    sub = PM()
    for key, (a, sg, u, v) in faces.items():
        if key in skip: continue
        fn = uv.get(key) or uv.get('*'); U, V = AX[u], AX[v]
        grid = []
        for i, uu in enumerate(U):
            row = []
            for j, vv in enumerate(V):
                q = [0.0, 0.0, 0.0]; q[a] = sg * hs[a]; q[u] = uu; q[v] = vv; row.append(place(q))
            grid.append(row)
        for i in range(len(U) - 1):
            for j in range(len(V) - 1):
                pts = [grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]
                s0, s1 = (U[i] + hs[u]) / (2 * hs[u]), (U[i + 1] + hs[u]) / (2 * hs[u]); t0, t1 = (V[j] + hs[v]) / (2 * hs[v]), (V[j + 1] + hs[v]) / (2 * hs[v])
                if sg < 0: s0, s1 = 1 - s0, 1 - s1
                want = tuple(np.mean(np.array(pts), axis=0)) if bend == 0 else tuple(np.eye(3)[a] * sg)
                sub.poly(pts, [fn(s0, t0), fn(s1, t0), fn(s1, t1), fn(s0, t1)], want)
    return pm.add(sub, M)


def leg(pm, x, z, h, r0, r1, fn, n=8, y0=0.0):
    lathe(pm, [(r1, y0, r0, y0 + h, fn, 'out'), (0.0, y0, r1, y0, fn, 'down')], n, M=T(x, 0, z))


def rrect(hx, hz, rad, nc=4):
    """圓角長方形（xz 平面，逆時針）：hx、hz 半寬；rad 圓角半徑；每個角 nc 段"""
    pts = []
    for (cx, cz, a0) in ((hx - rad, hz - rad, 0.0), (-(hx - rad), hz - rad, 0.5 * math.pi), (-(hx - rad), -(hz - rad), math.pi), (hx - rad, -(hz - rad), 1.5 * math.pi)):
        for k in range(nc + 1):
            a = a0 + 0.5 * math.pi * k / nc; pts.append((cx + rad * math.cos(a), cz + rad * math.sin(a)))
    return pts


def pillow(fn_name, W, H, thick, n=(8, 6), M=None):
    """床的枕頭（AA-B 的抱枕改成長方形）：前後兩片曲面在邊上接起來，中間鼓、邊往內收一點；W＝x、H＝y、厚度沿 z"""
    pm = PM(); hx, hy, ht = W / 2, H / 2, thick / 2; fn = R(fn_name); us = np.linspace(-1, 1, n[0] + 1); vs = np.linspace(-1, 1, n[1] + 1)
    def P(u, v, side):
        puff = ((1 - u * u) * (1 - v * v)) ** 0.5
        return (u * hx * (1 - 0.05 * (1 - v * v)), v * hy * (1 - 0.06 * (1 - u * u)), side * ht * puff)
    for side in (1, -1):
        for i in range(n[0]):
            for j in range(n[1]):
                q = [(us[i], vs[j]), (us[i + 1], vs[j]), (us[i + 1], vs[j + 1]), (us[i], vs[j + 1])]; pts = [P(u, v, side) for u, v in q]
                pm.poly(pts, [fn((u + 1) / 2 if side > 0 else (1 - u) / 2, (v + 1) / 2) for u, v in q], (0, 0, side))
    return PM().add(pm, M)


def drape(pm, path, hw, th, fn, nw=8, flutter=0.0, folds=(0, 0.0)):
    """布條：沿 xy 平面上的折線 path 走，寬 2×hw（z 方向；hw 可以是 t 的函數），厚 th；flutter：兩邊緣往外翹；
    folds＝(條數, 高度)：順著布走的皺褶（布越過邊垂下去時的樣子；兩端漸弱）。fn(s, t)：s 橫過布、t 沿 path"""
    P = [np.array(p, float) for p in path]; n = len(P); top, bot = [], []
    L_ = [0.0]
    for a, b in zip(P, P[1:]): L_.append(L_[-1] + np.linalg.norm(b - a))
    for i in range(n):
        d = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]; d /= np.linalg.norm(d); nrm = np.array((-d[1], d[0], 0.0))   # path 往 +x 走時，nrm 朝上
        tt = L_[i] / L_[-1]; h_ = hw(tt) if callable(hw) else hw; rt, rb = [], []
        for k in range(nw + 1):
            s = k / nw; zz = -h_ + 2 * h_ * s; e = abs(2 * s - 1) ** 3
            off = flutter * e * abs(math.sin(7.0 * L_[i] + 3.0 * s)) * min(1.0, L_[i] / 0.08)   # 只往外翹（攤在地上的那一段不會穿進地板）
            if folds[0]:
                fade = math.sin(math.pi * min(1.0, max(0.0, (tt - 0.05) / 0.9))) ** 0.7
                off += folds[1] * fade * (0.5 + 0.5 * math.cos(2 * math.pi * folds[0] * s + 2.3 * tt + 0.6))
            c = P[i] + nrm * off + np.array((0, 0, zz))
            rt.append(c + nrm * th / 2); rb.append(c - nrm * th / 2)
        top.append(rt); bot.append(rb)
    for i in range(n - 1):
        t0, t1 = L_[i] / L_[-1], L_[i + 1] / L_[-1]
        dn = np.array((-(P[i + 1] - P[i])[1], (P[i + 1] - P[i])[0], 0.0))
        for k in range(nw):
            s0, s1 = k / nw, (k + 1) / nw
            pm.poly([top[i][k], top[i][k + 1], top[i + 1][k + 1], top[i + 1][k]], [fn(s0, t0), fn(s1, t0), fn(s1, t1), fn(s0, t1)], tuple(dn))
            pm.poly([bot[i][k], bot[i][k + 1], bot[i + 1][k + 1], bot[i + 1][k]], [fn(s0, t0), fn(s1, t0), fn(s1, t1), fn(s0, t1)], tuple(-dn))
        for k, sg in ((0, -1), (nw, 1)):
            pm.poly([top[i][k], top[i + 1][k], bot[i + 1][k], bot[i][k]], [fn(0.5, t0)] * 4, (0, 0, sg))
    for i, sg in ((0, -1), (n - 1, 1)):
        d = P[min(i + 1, n - 1)] - P[max(i - 1, 0)]
        for k in range(nw):
            pm.poly([top[i][k], top[i][k + 1], bot[i][k + 1], bot[i][k]], [fn(0.5, 0.5)] * 4, tuple(d * sg))
    return pm


def to_blender(pm, name, mats, parent, angle=0.6):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mats[0])
    me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


def temp_obj(pm, name):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f]); me.validate(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); return ob


# ================= 床 =================
def mattress_pm():
    """床墊（白色床單包著）＋床座（灰色布）；被子的布料模擬也拿它們當碰撞體"""
    pm = PM()
    rbox(pm, -0.685, 0.685, 0.16, 0.36, -0.95, 0.96, {'*': R('boxspring')}, r=0.012, seg=2)
    cushion(pm, 1.37, 0.22, 1.91, 0.05, k=(2, 0, 3), sag=0.0, bulge=0.02, uv={'*': R('sheet')}, skip=('b',), M=T(0, 0.36 + 0.11, 0.005))
    return pm


def duvet():
    """被子：一張攤平的布（寬 1.97、長 1.69，從床頭往下 0.53 m 開始蓋）放在床墊上（中間一塊固定），兩側和床尾自己垂下去（布料模擬、自我碰撞），
    取出頂點後做厚度：中間 3.2 cm（蓬鬆，加一點起伏）、邊上 1 cm（車縫）；壓在床墊上看不到的底面不做"""
    D = DUVET; nx, nz = D['nx'], D['nz']; xs = np.linspace(D['x0'], D['x1'], nx + 1); zs = np.linspace(D['z0'], D['z1'], nz + 1)
    sc = bpy.context.scene; tmp = []
    col = temp_obj(mattress_pm(), '_col'); mc = col.modifiers.new('col', 'COLLISION')
    col.collision.thickness_outer = 0.004; col.collision.cloth_friction = 10; tmp.append(col)
    me = bpy.data.meshes.new('_duvet')
    me.from_pydata([tuple(g2b(x, MT + 0.012, z)) for z in zs for x in xs], [], [(j * (nx + 1) + i, j * (nx + 1) + i + 1, (j + 1) * (nx + 1) + i + 1, (j + 1) * (nx + 1) + i) for j in range(nz) for i in range(nx)])
    me.update(); cl = bpy.data.objects.new('_duvet', me); sc.collection.objects.link(cl); tmp.append(cl)
    pin = cl.vertex_groups.new(name='pin')   # 床墊上面中間那一塊固定（Blender 的布和碰撞體之間摩擦力不夠，不固定的話整條被子會往床尾滑下去）
    pin.add([j * (nx + 1) + i for j, z in enumerate(zs) for i, x in enumerate(xs) if abs(x) < 0.5 and z < 0.75], 1.0, 'REPLACE')
    cm = cl.modifiers.new('cloth', 'CLOTH'); st = cm.settings; st.vertex_group_mass = 'pin'
    st.quality = 8; st.mass = 0.5; st.tension_stiffness = 40; st.compression_stiffness = 40; st.shear_stiffness = 10; st.bending_stiffness = 0.6; st.air_damping = 2.0
    cs = cm.collision_settings; cs.distance_min = 0.006; cs.use_self_collision = True; cs.self_distance_min = 0.006
    frames = 60; cm.point_cache.frame_start = 1; cm.point_cache.frame_end = frames; sc.frame_start, sc.frame_end = 1, frames
    for f in range(1, frames + 1): sc.frame_set(f)
    dg = bpy.context.evaluated_depsgraph_get(); ev = cl.evaluated_get(dg); m2 = ev.to_mesh()
    P = np.array([(v.co.x, v.co.z, -v.co.y) for v in m2.vertices]).reshape(nz + 1, nx + 1, 3); ev.to_mesh_clear()
    sc.frame_set(1)
    for ob in tmp:
        m_ = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(m_)
    nrm = np.cross(np.gradient(P, axis=0), np.gradient(P, axis=1)); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    if nrm[nz // 2, nx // 2, 1] < 0: nrm = -nrm
    ii, jj = np.meshgrid(np.arange(nx + 1), np.arange(nz + 1)); e = np.minimum(np.minimum(ii, nx - ii), np.minimum(jj, nz - jj))
    th = np.where(e == 0, 0.010, np.where(e == 1, 0.026, 0.032)) + np.where(e >= 2, 0.004 * (np.sin(1.3 * ii + 0.4 * jj) + np.cos(1.1 * jj - 0.6 * ii)) / 2, 0.0)
    Q = P + nrm * th[..., None]
    rest = (np.abs(P[..., 1] - (MT + 0.006)) < 0.012) & (np.abs(P[..., 0]) < 0.64) & (P[..., 2] < 0.92)
    pm = PM(); ft, fb = R('duvet'), R('duvet_back')
    for j in range(nz):
        for i in range(nx):
            q = [(j, i), (j, i + 1), (j + 1, i + 1), (j + 1, i)]; w = tuple(np.mean([nrm[a, b] for a, b in q], axis=0))
            uvs = [ft(b / nx, 1 - a / nz) for a, b in q]
            pm.poly([Q[a, b] for a, b in q], uvs, w)
            if not all(rest[a, b] for a, b in q): pm.poly([P[a, b] for a, b in q], [fb(b / nx, 1 - a / nz) for a, b in q], tuple(-np.array(w)))
    ring = [(0, i) for i in range(nx + 1)] + [(j, nx) for j in range(1, nz + 1)] + [(nz, i) for i in range(nx - 1, -1, -1)] + [(j, 0) for j in range(nz - 1, 0, -1)]
    inward = lambda a, b: (min(max(a, 1), nz - 1) if a in (0, nz) else a, min(max(b, 1), nx - 1) if b in (0, nx) else b)
    for (a, b), (c, d) in zip(ring, ring[1:] + ring[:1]):
        out = (P[a, b] + P[c, d]) / 2 - (P[inward(a, b)] + P[inward(c, d)]) / 2
        pm.poly([P[a, b], P[c, d], Q[c, d], Q[a, b]], [ft(b / nx, 1 - a / nz), ft(d / nx, 1 - c / nz), ft(d / nx, 1 - c / nz), ft(b / nx, 1 - a / nz)], tuple(out))
    return pm


def bed():
    pm = PM(); wv, wh = R('walnut_v'), R('walnut_h')
    for sx in (-1, 1):   # 床頭板：兩支柱子（直紋）
        rbox(pm, sx * 0.67 - 0.03, sx * 0.67 + 0.03, 0, 1.0, -1.0, -0.94, {'*': wv}, r=0.006, seg=2)
    rbox(pm, -0.64, 0.64, 0.34, 0.975, -0.988, -0.962, {'f': wh, 'k': wh, '*': wv}, r=0.004, seg=1)                 # 中間的板子（橫紋）
    rbox(pm, -0.64, 0.64, 0.6, 0.625, -0.992, -0.958, {'*': wh}, r=0.004, seg=1)                                     # 板子中段的一條橫木（比板子厚一點）
    rbox(pm, -0.715, 0.715, 1.0, 1.03, -1.008, -0.932, {'t': wh, 'f': wh, 'k': wh, '*': wv}, r=0.008, seg=2)       # 頂蓋
    mb = S('metal_black')
    for sx in (-1, 1): box(pm, sx * 0.655 - 0.015, sx * 0.655 + 0.015, 0.11, 0.16, -0.93, 0.93, {'*': mb})          # 鐵床架：兩側的角鐵
    for zz in (-0.93, 0.0, 0.93): box(pm, -0.64, 0.64, 0.11, 0.16, zz - 0.015, zz + 0.015, {'*': mb})              # 頭、中、尾三條橫的
    for (x, z) in ((-0.655, -0.93), (0.655, -0.93), (-0.655, 0.93), (0.655, 0.93), (0.0, 0.0)):
        leg(pm, x, z, 0.1, 0.016, 0.016, mb, n=8, y0=0.012); leg(pm, x, z, 0.012, 0.024, 0.026, S('black_plastic'), n=8)   # 腳＋黑色腳墊
    pm.add(mattress_pm())
    for sx, ry in ((-1, 0.05), (1, -0.04)):   # 兩個枕頭：躺在床頭、後緣靠著床頭板翹起來一點
        pm.add(pillow('pillow', 0.66, 0.46, 0.15, M=T(sx * 0.335, MT + 0.075, -0.69) @ Ry(ry) @ Rx(-math.pi / 2 + 0.22)))
    pm.add(duvet())
    return pm


# ================= 床頭櫃（黑色方格櫃） =================
def nightstand():
    pm = PM(); uvw = {'*': R('blackwood')}; hx, hz, H, t = 0.20, 0.195, 0.62, 0.018
    rbox(pm, -hx, hx, H - t, H, -hz, hz, uvw, r=0.003, seg=1); rbox(pm, -hx, hx, 0, t, -hz, hz, uvw, r=0.003, seg=1)
    for sx in (-1, 1): rbox(pm, (hx - t) if sx > 0 else -hx, hx if sx > 0 else (-hx + t), t, H - t, -hz, hz, uvw, r=0.002, seg=1)
    ym = H / 2; rbox(pm, -hx + t, hx - t, ym - t / 2, ym + t / 2, -hz + 0.006, hz, uvw, r=0.002, seg=1)              # 中間的隔板
    box(pm, -hx + t, hx - t, t, H - t, -hz, -hz + 0.006, uvw)                                                        # 背板
    # 下格：灰色帆布收納籃（開口朝上的盒子，壁厚 6 mm）
    bx, bz, by0, by1, w = 0.165, 0.165, t + 0.002, t + 0.25, 0.006; fb = R('bin')
    box(pm, -bx, bx, by0, by0 + 0.006, -bz, bz, {'*': fb}, M=T(0, 0, 0.01))
    for (x0, x1, z0, z1, key) in ((-bx, bx, bz - w, bz, 'f'), (-bx, bx, -bz, -bz + w, 'k'), (bx - w, bx, -bz + w, bz - w, 'r'), (-bx, -bx + w, -bz + w, bz - w, 'l')):
        box(pm, x0, x1, by0, by1, z0, z1, {key: fb, '*': R('bin')}, M=T(0, 0, 0.01))
    # 上格：四本直立的書（最後一本斜靠）＋一本平放
    cols = ['book_navy', 'book_beige', 'book_maroon', 'book_green']; x = -hx + t + 0.006; yb = ym + t / 2
    for k, (wd, hb) in enumerate(((0.032, 0.235), (0.026, 0.21), (0.04, 0.24), (0.028, 0.2))):
        if k < 3: box(pm, x, x + wd, yb, yb + hb, -hz + 0.03, -hz + 0.03 + 0.17, {'*': S(cols[k]), 't': S('page')}); x += wd + 0.002
        else: box(pm, -wd / 2, wd / 2, 0, hb, -hz + 0.03, -hz + 0.2, {'*': S(cols[k]), 't': S('page')}, M=T(x + 0.07, yb, 0) @ Rz(0.32))   # 最後一本往左斜靠在前一本上
    box(pm, 0.02, 0.17, yb, yb + 0.03, -0.12, 0.1, {'*': S('book_gray'), 'r': S('page'), 'l': S('page'), 'f': S('page')})
    # 頂上：手機（螢幕朝下）、一本平裝書
    rbox(pm, -0.038, 0.038, H, H + 0.008, -0.078, 0.078, {'*': S('phone')}, r=0.004, seg=1, M=T(0.09, 0, 0.03) @ Ry(0.25))
    box(pm, -0.065, 0.065, H, H + 0.022, -0.1, 0.1, {'*': S('book_mustard'), 'r': S('page'), 'l': S('page'), 'f': S('page')}, M=T(-0.1, 0, -0.04) @ Ry(-0.12))
    return pm


# ================= 書桌 =================
def desk():
    pm = PM(); wh, wv = R('walnut_h'), R('walnut_v'); hx, hz, H, tt = 0.6, 0.275, 0.75, 0.03; gl = PM()
    rbox(pm, -hx, hx, H - tt, H, -hz, hz, {'*': wh}, r=0.004, seg=2)                                                  # 桌面
    rbox(pm, -hx + 0.01, -hx + 0.035, 0, H - tt, -hz + 0.02, hz - 0.02, {'*': wv}, r=0.003, seg=1)                    # 左邊的側板
    px0, px1 = hx - 0.41, hx - 0.01                                                                                    # 右邊的抽屜櫃
    for (a, b) in ((px0, px0 + 0.02), (px1 - 0.02, px1)): rbox(pm, a, b, 0, H - tt, -hz + 0.02, hz - 0.02, {'*': wv}, r=0.003, seg=1)
    box(pm, px0 + 0.02, px1 - 0.02, 0.0, 0.06, hz - 0.06, hz - 0.045, {'*': R('walnut_h')})                          # 踢腳板（往內縮）
    box(pm, px0 + 0.02, px1 - 0.02, 0.06, H - tt, -hz + 0.02, -hz + 0.035, {'*': wh})                                # 櫃子的背板
    for (y0, y1) in ((0.065, 0.385), (0.39, H - tt - 0.005)):
        rbox(pm, px0 + 0.003, px1 - 0.003, y0, y1, hz - 0.04, hz - 0.02, {'*': wh}, r=0.003, seg=1)                  # 抽屜面
        yc, xc = (y0 + y1) / 2 + (0.06 if y0 < 0.1 else 0.0), (px0 + px1) / 2
        sweep(pm, [(xc - 0.065, yc, hz - 0.02), (xc - 0.065, yc, hz + 0.005), (xc + 0.065, yc, hz + 0.005), (xc + 0.065, yc, hz - 0.02)], 0.005, 6, S('steel'))   # 金屬拉把
    rbox(pm, -hx + 0.035, px0, 0.32, H - tt, -hz + 0.02, -hz + 0.038, {'*': wh}, r=0.002, seg=1)                     # 後面的擋板
    # 桌上：筆電（闔上）
    Ml = T(0.0, H, 0.05) @ Ry(-0.1)
    rbox(pm, -0.155, 0.155, 0.0, 0.009, -0.107, 0.107, {'*': S('laptop')}, r=0.004, seg=1, M=Ml)
    box(pm, -0.152, 0.152, 0.0085, 0.0105, -0.104, 0.104, {'*': S('laptop_gap')}, M=Ml)
    rbox(pm, -0.155, 0.155, 0.01, 0.0165, -0.107, 0.107, {'*': S('laptop')}, r=0.003, seg=1, M=Ml)
    # 黃色便條本＋原子筆
    Mp = T(-0.33, H, 0.07) @ Ry(0.12)
    box(pm, -0.108, 0.108, 0.0, 0.002, -0.15, 0.15, {'*': S('pad_back')}, M=Mp)
    box(pm, -0.108, 0.108, 0.002, 0.012, -0.15, 0.15, {'t': R('legalpad'), 'k': S('book_maroon'), '*': S('pad_edge')}, M=Mp)
    sweep(pm, [(-0.05, 0.0165, -0.02), (0.085, 0.0165, 0.06)], 0.0045, 6, S('pen_blue'), M=Mp)
    sweep(pm, [(-0.05, 0.0165, -0.02), (-0.012, 0.0165, 0.0025)], 0.0052, 6, S('pen_cap'), M=Mp)
    # 兩本厚的教科書（後面、靠右）
    Mb = T(0.33, H, -0.11) @ Ry(0.18)
    box(pm, -0.105, 0.105, 0.0, 0.048, -0.135, 0.135, {'*': S('book_navy'), 'f': S('page'), 'r': S('page'), 'k': S('page')}, M=Mb)
    box(pm, -0.1, 0.1, 0.048, 0.088, -0.13, 0.13, {'*': S('book_maroon'), 'f': S('page'), 'r': S('page'), 'k': S('page')}, M=Mb @ Ry(-0.12))
    # 白色馬克杯（右前）
    Mm = T(0.43, H, 0.12)
    lathe(pm, [(0.0, 0.0, 0.038, 0.0, S('mug'), 'down'), (0.038, 0.0, 0.042, 0.004, S('mug'), 'out'), (0.042, 0.004, 0.043, 0.095, S('mug'), 'out'),
               (0.043, 0.095, 0.037, 0.095, S('mug'), 'up'), (0.037, 0.095, 0.036, 0.07, S('mug'), 'in'), (0.036, 0.07, 0.0, 0.07, S('coffee'), 'up')], 16, M=Mm)
    sweep(pm, [(0.042, 0.078, 0), (0.062, 0.074, 0), (0.07, 0.05, 0), (0.062, 0.026, 0), (0.042, 0.022, 0)], 0.0065, 6, S('mug'), M=Mm @ Ry(-0.9))
    # 黑色檯燈（左後）：圓底座、兩段燈臂、圓錐燈罩（朝下、往前）
    bx, bz = -0.46, -0.17; mb = S('metal_black')
    lathe(pm, [(0.0, 0.0, 0.074, 0.0, mb, 'down'), (0.074, 0.0, 0.072, 0.016, mb, 'out'), (0.072, 0.016, 0.0, 0.02, mb, 'up')], 20, M=T(bx, H, bz))
    p0, p1, p2 = np.array((bx, H + 0.018, bz)), np.array((bx + 0.02, H + 0.36, bz - 0.06)), np.array((bx + 0.08, H + 0.42, bz + 0.17))
    sweep(pm, [p0, p1], 0.0075, 6, mb); sweep(pm, [p1, p2], 0.0065, 6, mb)
    sphere(pm, tuple(p1), 0.013, mb, seg=8, rings=5)
    Ms = T(*p2) @ Ry(0.3) @ Rx(-0.75)
    lathe(pm, [(0.016, 0.03, 0.02, 0.0, mb, 'out'), (0.02, 0.0, 0.064, -0.11, mb, 'out'), (0.016, 0.03, 0.0, 0.032, mb, 'up')], 18, M=Ms)
    lathe(gl, [(0.017, -0.002, 0.061, -0.108, S('lamp_in'), 'in')], 18, M=Ms)
    return pm, gl


# ================= 辦公椅 =================
def deskchair():
    pm = PM(); bp, mb = S('black_plastic'), S('metal_black')
    for k in range(5):   # 五爪腳（一爪朝前）＋輪子
        a = 2 * math.pi * k / 5 - math.pi / 2; M = Ry(a)
        P = [M[:3, :3] @ np.array(p) for p in ((0.03, 0.085, 0.0), (0.16, 0.078, 0.0), (0.285, 0.068, 0.0))]
        sweep(pm, P, lambda f: 0.02 - 0.007 * f, 6, bp)
        box(pm, 0.27, 0.305, 0.04, 0.066, -0.014, 0.014, {'*': bp}, M=M, skip=('b',))                                  # 輪子的蓋
        lathe(pm, [(0.025, -0.011, 0.025, 0.011, S('caster'), 'out')], 10, caps=((0.025, 0.011, S('caster'), 'up'), (0.025, -0.011, S('caster'), 'down')),
              M=M @ T(0.288, 0.026, 0) @ Rx(math.pi / 2))
    lathe(pm, [(0.0, 0.06, 0.045, 0.06, bp, 'down'), (0.045, 0.06, 0.04, 0.105, bp, 'out'), (0.04, 0.105, 0.0, 0.11, bp, 'up')], 14)   # 中間的輪軸座
    lathe(pm, [(0.032, 0.1, 0.029, 0.25, bp, 'out')], 12)                                                                  # 氣壓桿的伸縮蓋
    lathe(pm, [(0.022, 0.25, 0.022, 0.36, mb, 'out')], 12)                                                                 # 氣壓桿
    rbox(pm, -0.1, 0.1, 0.345, 0.385, -0.12, 0.1, {'*': bp}, r=0.008, seg=1)                                               # 椅座下的機構
    sweep(pm, [(0.09, 0.36, 0.02), (0.2, 0.355, 0.05), (0.215, 0.355, 0.08)], 0.006, 5, bp)                                # 調高度的把手
    rbox(pm, -0.23, 0.23, 0.38, 0.395, -0.22, 0.225, {'*': bp}, r=0.01, seg=1)                                             # 座墊下的殼
    cushion(pm, 0.49, 0.068, 0.47, 0.03, k=(2, 0, 2), sag=0.01, bulge=0.035, uv={'*': R('seat')}, M=T(0, 0.392 + 0.034, 0.005))   # 座墊（上緣約 0.46）
    sweep(pm, [(0.0, 0.37, -0.1), (0.0, 0.39, -0.22), (0.0, 0.47, -0.285), (0.0, 0.68, -0.29)], 0.02, 6, bp)              # 椅背的支架
    Mbk = T(0, 0.585, -0.235) @ Rx(-0.14) @ T(0, 0.25, 0)                                                                  # 網背：下緣在 (0, 0.585, -0.235)，往後仰 8°
    cushion(pm, 0.44, 0.48, 0.018, 0.008, k=(2, 2, 0), bend=0.05, uv={'f': R('mesh'), 'k': R('mesh'), '*': bp}, skip=(), M=Mbk)
    loop = [(x, y, 0.05 * (x / 0.22) ** 2) for (x, y) in rrect(0.232, 0.252, 0.06, 3)]                                   # rrect 的第二個座標當 y 用
    sweep(pm, loop, 0.011, 5, bp, caps=False, closed=True, M=Mbk)                                                          # 網背的框
    for sx in (-1, 1):   # 扶手
        sweep(pm, [(sx * 0.16, 0.37, -0.04), (sx * 0.255, 0.39, -0.04), (sx * 0.265, 0.62, -0.05)], 0.013, 6, bp)
        rbox(pm, sx * 0.265 - 0.035, sx * 0.265 + 0.035, 0.62, 0.648, -0.17, 0.09, {'*': bp}, r=0.012, seg=2)
    return pm


# ================= 行李箱 =================
SC_W, SC_D, SC_H, SC_RE = 0.45, 0.70, 0.13, 0.045


def shell_half():
    """硬殼的一半（開口朝上）：外殼（大面 'b' 有凹凸紋）、襯布（底＋一圈牆，朝內）、開口一圈拉鍊、−z 端兩個輪子"""
    pm = PM()
    cushion(pm, SC_W, SC_H, SC_D, SC_RE, k=(1, 0, 2), uv={'b': R('shell'), '*': R('shell_plain')}, skip=('t',), M=T(0, SC_H / 2, 0))
    lin = rrect(SC_W / 2 - 0.016, SC_D / 2 - 0.016, SC_RE - 0.016, 3); y0, y1 = 0.012, SC_H - 0.012; fl = R('lining'); n = len(lin)
    pm.poly([(x, y0, z) for (x, z) in lin], [fl((x / (SC_W - 0.032)) + 0.5, (z / (SC_D - 0.032)) + 0.5) for (x, z) in lin], (0, 1, 0))
    for k in range(n):
        (xa, za), (xb, zb) = lin[k], lin[(k + 1) % n]; mid = np.array(((xa + xb) / 2, 0, (za + zb) / 2))
        pm.poly([(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)], [S('lining_sw')(0.5, 0.5)] * 4, tuple(-mid))
    zr = rrect(SC_W / 2 - 0.014, SC_D / 2 - 0.014, SC_RE - 0.014, 2)
    sweep(pm, [(x, SC_H - 0.012, z) for (x, z) in zr], 0.009, 4, S('zipper'), caps=False, closed=True)
    for sx in (-1, 1):   # 輪子（−z 端；箱子躺著，輪子往 −z 凸出）
        rbox(pm, sx * 0.15 - 0.03, sx * 0.15 + 0.03, 0.02, 0.1, -SC_D / 2 - 0.03, -SC_D / 2 + 0.02, {'*': S('black_plastic')}, r=0.008, seg=1)
        lathe(pm, [(0.026, -0.011, 0.026, 0.011, S('wheel'), 'out')], 8, caps=((0.026, 0.011, S('wheel'), 'up'), (0.026, -0.011, S('wheel'), 'down')),
              M=T(sx * 0.15, 0.06, -SC_D / 2 - 0.055) @ Rz(math.pi / 2))
    return pm


def suitcase():
    """攤平在地上：放東西的那一半在原點（0.45×0.70），蓋子攤在 −x 那一邊（開口也朝上，裡面一片網狀隔層）；側邊提把在 +x；
    裡面：後半（−z）牛仔褲＋深藍 T 恤＋盥洗包＋一捲襪子；前半（+z）灰 T 恤；一件淺藍 T 恤拉出來，越過 +z 那一端垂到地上"""
    pm = PM(); pm.add(shell_half())
    sweep(pm, [(SC_W / 2 - 0.005, 0.065, -0.075), (SC_W / 2 + 0.028, 0.065, -0.062), (SC_W / 2 + 0.028, 0.065, 0.062), (SC_W / 2 - 0.005, 0.065, 0.075)], 0.011, 6, S('black_plastic'))   # 側邊提把
    lid = shell_half()
    cushion(lid, 0.4, 0.03, 0.64, 0.01, k=(0, 0, 1), sag=-0.008, uv={'t': R('mesh'), '*': S('lining_sw')}, M=T(0, 0.012 + 0.015, 0))   # 蓋子裡的網狀隔層（下面還有一點衣服，鼓起來一點）
    pm.add(lid, T(-SC_W, 0, 0))
    yb = 0.012
    rbox(pm, -0.18, 0.18, yb, yb + 0.05, -0.305, -0.035, {'t': R('denim_top'), '*': R('denim')}, r=0.014, seg=2)
    cushion(pm, 0.34, 0.035, 0.26, 0.012, k=(0, 0, 0), sag=0.003, bulge=0.03, uv={'t': R('tee_navy_top'), '*': R('tee_navy')}, M=T(0.01, yb + 0.05 + 0.0175, -0.165) @ Ry(0.06))
    rbox(pm, -0.1, 0.1, 0.0, 0.07, -0.055, 0.055, {'*': R('pouch')}, r=0.024, seg=2, M=T(-0.06, yb + 0.085, -0.2) @ Ry(-0.3))
    for (x, z, a) in ((0.11, -0.11, 0.4), (0.13, -0.21, -0.3)):   # 一捲襪子（兩個，放在深藍 T 恤上）
        sphere(pm, (0, 0, 0), 0.03, S('sock'), seg=8, rings=5, M=T(x, yb + 0.085 + 0.02, z) @ Ry(a), scale=(1.7, 0.7, 0.85))
    cushion(pm, 0.34, 0.036, 0.27, 0.012, k=(0, 0, 0), sag=0.003, bulge=0.03, uv={'t': R('tee_gray_top'), '*': R('tee_gray')}, M=T(-0.01, yb + 0.018, 0.165) @ Ry(-0.04))
    yt = yb + 0.036 + 0.004
    path = [(0.05, yt, 0), (0.2, yt + 0.002, 0), (0.29, yt + 0.025, 0), (0.325, SC_H + 0.006, 0), (0.35, SC_H - 0.002, 0), (0.362, 0.1, 0), (0.366, 0.05, 0),
            (0.375, 0.014, 0), (0.41, 0.004, 0), (0.48, 0.0035, 0), (0.56, 0.0035, 0)]   # 沿 +z 走（先在 x 上建，再轉 −90°）
    hw = lambda t: 0.13 + 0.09 * min(1.0, max(0.0, (t - 0.55) / 0.35)) ** 2   # 在箱子裡那一段窄（被壓著），攤在地上的那一段是衣服的寬度
    pm.add(drape(PM(), path, hw, 0.006, R('tee_white'), nw=8, flutter=0.008, folds=(3, 0.012)), Ry(-math.pi / 2))
    return pm


# ================= 吸頂燈 =================
def ceilinglight():
    """吸頂燈：原點＝頂面中央（貼天花板），往 −y；回傳（不透明網格, 發光網格）"""
    pm = PM(); gl = PM(); wp, ni = S('white_paint'), S('nickel')
    lathe(pm, [(0.0, 0.0, 0.17, 0.0, wp, 'up'), (0.17, 0.0, 0.178, -0.02, wp, 'out')], 24)                                   # 白色底盤
    lathe(pm, [(0.178, -0.02, 0.185, -0.024, ni, 'out'), (0.185, -0.024, 0.185, -0.034, ni, 'out'), (0.185, -0.034, 0.168, -0.036, ni, 'down')], 24)   # 鎳色金屬圈
    prof = [(0.168, -0.034), (0.166, -0.055), (0.156, -0.08), (0.136, -0.104), (0.106, -0.124), (0.068, -0.137), (0.03, -0.143), (0.0, -0.144)]
    lathe(gl, [(a[0], a[1], b[0], b[1], S('white_paint'), 'out') for a, b in zip(prof, prof[1:])], 24)                       # 霧面玻璃罩（發光）
    lathe(pm, [(0.012, -0.143, 0.012, -0.152, ni, 'out'), (0.012, -0.152, 0.0, -0.156, ni, 'down')], 8)                    # 中間的小螺帽
    return pm, gl


ITEMS = {'US_BED': bed, 'US_NIGHTSTAND': nightstand, 'US_DESK': desk, 'US_DESKCHAIR': deskchair, 'US_SUITCASE': suitcase, 'US_CEILINGLIGHT': ceilinglight}
GLOW = {'US_DESK': 'US_DESK_GLOW', 'US_CEILINGLIGHT': 'US_CEILINGLIGHT_GLOW'}
# GLB 裡的位置只是排成臥室給人看：照 us_apartment_layout.js 的位置減掉 (3.2, −1.0)；(x, y, z, 轉角°)。床頭櫃的轉角是建議值（開口朝西，和床尾同方向）
SPREAD = {'US_BED': (0.8, 0.0, 0.0, -90), 'US_NIGHTSTAND': (1.5, 0.0, -1.1, -90), 'US_DESK': (0.0, 0.0, -1.7, 0), 'US_DESKCHAIR': (0.0, 0.0, -1.1, 180),
          'US_SUITCASE': (-1.08, 0.0, -1.45, 0), 'US_CEILINGLIGHT': (0.0, 2.6, 0.0, 0)}
BUDGET = {'US_BED': 4200, 'US_NIGHTSTAND': 900, 'US_DESK': 1900, 'US_DESKCHAIR': 2100, 'US_SUITCASE': 3000, 'US_CEILINGLIGHT': 650}
TOTAL_BUDGET = 12000
SMOOTH = {'US_BED': 1.0, 'US_SUITCASE': 0.9, 'US_DESKCHAIR': 0.9, 'US_CEILINGLIGHT': 1.0}


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('us_bedroom_props', props={'kind': 'us_bedroom_props'})
    mat = bpy.data.materials.new('us_bedroom'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    glow = bpy.data.materials.new('US_glow'); glow.use_nodes = True; gb = glow.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (1.0, 0.86, 0.66, 1.0); gb.inputs['Roughness'].default_value = 0.9; gb.inputs['Metallic'].default_value = 0.0
    for key in ('Emission Color', 'Emission'):
        if key in gb.inputs: gb.inputs[key].default_value = (1.0, 0.82, 0.58, 1.0); break
    if 'Emission Strength' in gb.inputs: gb.inputs['Emission Strength'].default_value = 1.5
    mods = {}; over = []
    for name, fn in ITEMS.items():
        r = fn(); pm, gl = r if isinstance(r, tuple) else (r, None)
        ob = to_blender(pm, name, (mat,), root, SMOOTH.get(name, 0.6)); x, y, z, a = SPREAD[name]; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if gl is not None:
            gob = to_blender(gl, GLOW[name], (glow,), ob, 0.9); gob.location = (0, 0, 0)
            gt = sum(len(p.vertices) - 2 for p in gob.data.polygons); mods[name]['glow'] = {'node': GLOW[name], 'tris': gt}; mods[name]['tris_total'] = tris + gt
        if mods[name].get('tris_total', tris) > BUDGET[name]: over.append((name, mods[name].get('tris_total', tris)))
    total = sum(m.get('tris_total', m['tris']) for m in mods.values())
    print('TRIS', json.dumps({k: v.get('tris_total', v['tris']) for k, v in mods.items()}), total, flush=True)
    print('BBOX', json.dumps({k: [v['min'], v['max']] for k, v in mods.items()}), flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 2
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '底部中央、y=0＝地面、正面（坐的人臉朝的方向、櫃子開口那一面）朝 +z；GLB 裡的位置只是排成臥室給人看（SPREAD＝layout 位置減 (3.2, −1.0)）',
                       'US_BED': 'Full：床架 1.40（x）×2.00（z），床頭板在 −z（z=−1.0～−0.93，高 1.03），床墊上緣 0.58；被子垂到兩側和床尾（離地約 0.28），床尾的被子到 z≈+1.0',
                       'US_NIGHTSTAND': '0.40×0.39×0.62，開口朝 +z；建議 ry=−π/2（開口朝西，和床尾同方向；ry=0 的話開口正對床的側邊，只隔 20 cm）',
                       'US_DESK': '1.20×0.55×0.75，桌面上緣 0.75；抽屜櫃在 +x；子節點 US_DESK_GLOW＝檯燈燈罩內面（US_glow）',
                       'US_DESKCHAIR': '座面上緣約 0.46；腳的半徑 0.31（含輪子）；扶手上緣 0.65（比桌面低，可以推進桌子底下）；椅背在 −z',
                       'US_SUITCASE': '攤平在地上：放東西的那一半 0.45（x）×0.70（z）在原點，蓋子攤在 −x 那一邊（x=−0.675～−0.225）；輪子往 −z 凸出 8 cm、側邊提把往 +x 凸出 4 cm；'
                                      '拉出來的淺藍 T 恤往 +z 垂到地上（到 z≈+0.56）。整體約 x −0.68～+0.27、z −0.43～+0.56、最高 0.17。'
                                      'layout 原本的 (1.8, −2.55) ry 0.4 會讓蓋子穿過西牆：建議 (2.12, −2.45) ry 0（輪子朝北牆、T 恤朝房間）',
                       'US_CEILINGLIGHT': '原點＝頂面中央（貼天花板），往 −y 長 0.156；直徑 0.37；子節點 US_CEILINGLIGHT_GLOW＝整個玻璃罩（白天也看得到，亮度由遊戲控制）'}
    info['note'] = ('兩個材質：us_bedroom（底色 1024＋ORM 256，metal 最高 0.40；被子纖維＝Poly Haven poly_wool_herringbone、床單枕頭等＝rough_linen、T 恤＝cotton_jersey、'
                    '牛仔褲＝denim_fabric、木＝walnut_veneer，都是 CC0）、US_glow（檯燈燈罩內面、吸頂燈玻璃罩；奶油色＋發光，亮度由遊戲控制）；每件一個網格，兩件有發光的子節點；'
                    '被子是布料模擬（Blender cloth，60 格），重跑會有一點點差異')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v.get('tris_total', v['tris']) for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
