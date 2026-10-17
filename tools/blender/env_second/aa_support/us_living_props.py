"""ART-US1 美國公寓客廳家具組（SCN-US-01 祐廷租的校外學生公寓 1x1，大三下美國交換，D47；LAWWW2-B 分工 2026-10-16 11:27；AA-B 支援製作；規格 SCENE_RULES 第 5、8 節）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/us_living_props.py [-- --out assets/models/env/second_ai/aa_support/us_living_props.glb]

LAWWW2-B 做房間（牆、地、窗、廚房、臥室、衛浴）和組裝；這裡是客廳的家具。位置、尺寸照 src/data/us_apartment_layout.js v2 的 furniture，
外觀照 docs/art-rebuild/second_ai/research/us_apartment_photos.md（使用者 10-16 給的三張照片的特徵；原圖不在 repo）。
每件一個頂層節點，原點＝底部中央、正面（坐的人臉朝的方向、櫃子打開的那一面）朝 +z；吊扇的原點是吸頂座的頂面中央，往 −y 長：
  US_SOFA        黑色皮三人沙發 2.0×0.9×0.85（座面 0.45）：三塊座墊、三塊靠墊（中間有一點塌、側面鼓一點），座墊和靠墊的正面有一圈縫線；扶手、底座、四支深色短腳；兩個黑白抱枕
  US_ARMCHAIR    同款單人沙發 0.95×0.9×0.85
  US_COFFEE      深色木頭咖啡桌 0.6×1.1×0.45（長邊沿 z）：桌面、四支腳、橫板、下層隔板
  US_ENDTABLE    沙發旁的小方桌 0.5×0.5×0.58（深色木頭）＋桌燈（黑色圓底座、有圖案的鼓形燈罩，總高約 0.6）；子節點 US_ENDTABLE_GLOW＝燈罩內面
  US_RUG         橘紅色地毯 2.0×2.6（花紋用貼圖集；一個角和一邊微翹 1～2 cm）
  US_LADDER      黑色梯子形壁架：寬 0.6、高 1.8，前面兩支斜靠、後面兩支貼牆（背面朝 −z），五層；書、一個小盆栽、兩個只有色塊的相框
  US_TVSTAND     黑色電視櫃 1.1×0.4×0.5（兩扇門、中間開放格）＋關著的電視（約 43 吋）
  US_BARSTOOL    吧台高腳椅：黑色椅面（高 0.76）＋低椅背、鍍鉻四腳＋踏圈
  US_CEILINGFAN  白色五葉吊扇（直徑 1.32）＋四個燈罩（總長約 0.42）；子節點 US_CEILINGFAN_GLOW＝四個燈罩內面
沒有字、品牌、校名、校徽（D77）。
材質兩個：us_living（不透明：1024 底色貼圖集＋256 ORM，metal 最高 0.40）、US_glow（燈罩內面：奶油色、有發光；LAWWW-B 在遊戲裡控制亮度）。
貼圖：皮革＝Poly Haven fabric_leather_02 改成黑色（縫線是畫的）；木頭＝Poly Haven walnut_veneer 加深（咖啡桌、小桌）、更深（黑色的壁架、電視櫃）；
地毯＝Poly Haven dirty_carpet 的纖維明暗＋畫上去的花紋（橘紅底、深色邊框和菱格）；燈罩、抱枕的圖案、相框的色塊、電視螢幕是畫的。都是 CC0（LICENSES.md 已登記）。
造型：座墊、靠墊、扶手是「圓角方塊＋格子」（每面有內部格點，才能塌陷、鼓起來）；抱枕、盆栽的葉子是橢球合體＋體素重建；其他是倒角方塊、旋轉體、沿曲線的管子。
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
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/us_living_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'us_living_props_{k}.png') for k in ('atlas', 'orm'))
AO_PNG = os.path.join(GEN, 'us_living_props_ao.png')   # 第 9 節補強：沙發、電視櫃底下的地面 AO（黑色＋透明度漸層，另一個材質 US_ao）
TEX = os.path.join(L.ROOT, 'tools', 'blender', 'textures')
TEX2 = os.path.join(PARENT, 'textures')
SRC = {'leather': os.path.join(TEX, 'fabric_leather_02', 'fabric_leather_02_diff_1k.jpg'),
       'leather_rough': os.path.join(TEX, 'fabric_leather_02', 'fabric_leather_02_rough_1k.jpg'),
       'walnut': os.path.join(TEX2, 'walnut_veneer', 'walnut_veneer_diff_1k.jpg'),
       'carpet': os.path.join(TEX2, 'dirty_carpet', 'dirty_carpet_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

REG = {
    'leather_top': (0, 0, 256, 256),      # 黑皮（座墊、靠墊的正面）：皮紋＋往內一圈的縫線
    'leather_plain': (256, 0, 512, 256),  # 黑皮（側面、扶手、底座）：皮紋
    'wood_dark': (512, 0, 768, 256),      # 深色木頭（咖啡桌、小桌）：木紋直的（沿 t）
    'blackwood': (768, 0, 1024, 256),     # 黑色木頭（壁架、電視櫃）：很淡的木紋
    'rug': (0, 256, 384, 768),            # 地毯 2.0×2.6：橘紅底、深色邊框、菱格、中間一個菱形
    'shade': (384, 256, 640, 384),        # 燈罩外面：奶油色底＋深色的圓圈交疊花紋（s 繞一圈、t 往上）
    'pillow_a': (640, 256, 768, 384),     # 抱枕：白底黑圓圈（和照片的窗簾同一種花紋）
    'pillow_b': (768, 256, 896, 384),     # 抱枕：黑底白色斜紋
    'tv_screen': (896, 256, 1024, 384),   # 電視正面：很窄的黑框＋關著的黑螢幕（左上一點反光）
    'frame_a': (384, 384, 512, 512),      # 相框：黑框、白卡紙、天空和海的色塊
    'frame_b': (512, 384, 640, 512),      # 相框：木框、樹和草地的色塊
    # ---- 第 9 節補強（2026-10-16，LAWWW2-B 16:29 的清單第 2 項）----
    'blanket': (640, 384, 896, 512),      # 披在沙發扶手上的毯子：灰藍色的針織紋＋兩端米色條紋和流蘇（s 沿著披的方向、t 沿毯子的寬）
    'remote': (896, 384, 960, 512),       # 遙控器的正面：黑色、灰色圓按鈕、方向鍵的圈、一個紅點（沒有字）
}
SW = {
    'chrome': ((198, 200, 204), 0.18, METAL), 'black_plastic': ((24, 24, 26), 0.55, 0.0), 'leg_dark': ((38, 31, 26), 0.5, 0.0),
    'white_paint': ((234, 234, 230), 0.45, 0.0), 'blade': ((240, 240, 236), 0.5, 0.0), 'fan_glass': ((244, 242, 234), 0.32, 0.0),
    'lamp_base': ((20, 20, 22), 0.35, 0.0), 'metal_dark': ((72, 72, 76), 0.35, METAL), 'shade_rim': ((40, 38, 36), 0.6, 0.0),
    'pot': ((224, 222, 214), 0.4, 0.0), 'soil': ((62, 46, 34), 0.95, 0.0), 'leaf': ((84, 128, 66), 0.55, 0.0), 'leaf_dark': ((46, 86, 48), 0.55, 0.0),
    'book_navy': ((40, 54, 88), 0.7, 0.0), 'book_maroon': ((112, 40, 44), 0.7, 0.0), 'book_beige': ((198, 182, 150), 0.75, 0.0),
    'book_green': ((52, 84, 64), 0.7, 0.0), 'book_gray': ((122, 124, 128), 0.7, 0.0), 'book_mustard': ((184, 148, 70), 0.7, 0.0), 'book_white': ((228, 226, 218), 0.75, 0.0),
    'page': ((236, 230, 214), 0.85, 0.0), 'frame_black': ((26, 26, 28), 0.4, 0.0), 'tv_black': ((18, 18, 20), 0.35, 0.0),
    'leather_sw': ((30, 30, 32), 0.45, 0.0), 'rug_back': ((168, 150, 120), 0.95, 0.0), 'knob': ((60, 60, 64), 0.3, METAL),
    # ---- 第 9 節補強 ----
    'mug': ((206, 160, 66), 0.3, 0.0), 'mug_in': ((236, 232, 222), 0.22, 0.0), 'pen': ((40, 70, 140), 0.35, 0.0), 'pen_cap': ((210, 210, 206), 0.3, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'leather_top': (0.42, 0.0), 'leather_plain': (0.45, 0.0), 'wood_dark': (0.55, 0.0), 'blackwood': (0.5, 0.0), 'rug': (0.95, 0.0),
           'shade': (0.85, 0.0), 'pillow_a': (0.85, 0.0), 'pillow_b': (0.85, 0.0), 'tv_screen': (0.12, 0.0), 'frame_a': (0.35, 0.0), 'frame_b': (0.45, 0.0),
           'blanket': (0.92, 0.0), 'remote': (0.5, 0.0)}
ROUGH_MASKS = []   # 第 9 節補強：(區塊名, 遮罩（區塊大小、0～1）, 粗糙度)，make_textures 畫進 ORM


# ================= 貼圖：皮、木、地毯的質感來自 Poly Haven（CC0）；只有本來就是畫上去的東西（縫線、花紋、色塊）是畫的 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def lum(path, w, h, crop=None, tile=(1, 1)):
    """標準化的明暗起伏（平均 0、標準差 1）；crop＝(x0, y0, x1, y1) 比例，只取來源的一塊；tile＝(nx, ny) 重複幾次（纖維要照真實大小）"""
    im = Image.open(path).convert('L')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    tw, th = max(1, w // tile[0]), max(1, h // tile[1]); t = np.asarray(im.resize((tw, th), Image.LANCZOS), np.float32)
    a = np.tile(t, (tile[1] + 1, tile[0] + 1))[:h, :w]
    return (a - a.mean()) / max(1.0, a.std())


def tint(z, base, k):
    """z：標準化的明暗起伏；base：平均顏色；k：起伏的幅度（0.1＝±10%）"""
    a = np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def stitch(d, w, h, inset, col):
    """縫線：往內一圈的虛線（正面那一圈，照片的皮沙發座墊）"""
    dash, gap = 7 * SS, 4 * SS
    x0, y0, x1, y1 = w * inset, h * inset, w * (1 - inset), h * (1 - inset)
    for (ax, ay, bx, by) in ((x0, y0, x1, y0), (x1, y0, x1, y1), (x1, y1, x0, y1), (x0, y1, x0, y0)):
        Lg = math.hypot(bx - ax, by - ay); n = int(Lg // (dash + gap))
        for k in range(n):
            t0, t1 = k * (dash + gap) / Lg, (k * (dash + gap) + dash) / Lg
            d.line([(ax + (bx - ax) * t0, ay + (by - ay) * t0), (ax + (bx - ax) * t1, ay + (by - ay) * t1)], fill=col, width=int(1.5 * SS))


def paint(P):
    # 皮：fabric_leather_02 的皮紋明暗，染成黑色（不是隨機斑點）
    w, h = sz('leather_top'); zl = lum(SRC['leather'], w, h, crop=(0.43, 0.0, 1.0, 0.57))   # 來源左邊 0.4 有一條直的接縫：只取右邊沒有接縫的那一塊
    img = tint(zl, (32, 31, 32), 0.16); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.035, h * 0.035, w * 0.965, h * 0.965], outline=(22, 22, 23), width=SS)   # 縫線外側一圈壓痕
    stitch(d, w, h, 0.06, (84, 82, 80)); P.paste(img, (REG['leather_top'][0] * SS, REG['leather_top'][1] * SS))
    P.paste(tint(zl, (32, 31, 32), 0.16), (REG['leather_plain'][0] * SS, REG['leather_plain'][1] * SS))
    # 木頭：walnut_veneer 的木紋（直的，沿 t），加大起伏後加深
    w, h = sz('wood_dark'); zw = lum(SRC['walnut'], w, h)
    P.paste(tint(zw, (74, 50, 36), 0.22), (REG['wood_dark'][0] * SS, REG['wood_dark'][1] * SS))
    P.paste(tint(zw, (30, 28, 27), 0.18), (REG['blackwood'][0] * SS, REG['blackwood'][1] * SS))
    # 地毯：dirty_carpet 的纖維明暗＋畫上去的花紋
    w, h = sz('rug'); zc = lum(SRC['carpet'], w, h, tile=(5, 6))   # 圈絨的大小照真實比例（來源一張約 0.4 m）
    pat = Image.new('RGB', (w, h), (184, 74, 44)); d = ImageDraw.Draw(pat)
    bw = int(w * 0.09)
    d.rectangle([0, 0, w - 1, h - 1], outline=(116, 38, 28), width=bw)                       # 深色邊框
    for inset, col, wd in ((0.03, (214, 186, 140), 2), (0.09, (214, 186, 140), 2), (0.105, (132, 44, 30), 3)):
        d.rectangle([w * inset, w * inset, w - w * inset, h - w * inset], outline=col, width=wd * SS)
    step = w * 0.16; x0, y0, x1, y1 = w * 0.13, w * 0.13, w * 0.87, h - w * 0.13
    k = -12
    while k < 24:   # 菱格（斜線兩個方向）
        for sgn in (1, -1):
            ax = x0 + k * step; d.line([(ax, y0), (ax + sgn * (y1 - y0), y1)], fill=(150, 54, 34), width=2 * SS)
        k += 1
    pat_m = Image.new('L', (w, h), 0); dm = ImageDraw.Draw(pat_m); dm.rectangle([x0, y0, x1, y1], fill=255)
    base = Image.new('RGB', (w, h), (184, 74, 44)); d2 = ImageDraw.Draw(base)
    d2.rectangle([0, 0, w - 1, h - 1], outline=(116, 38, 28), width=bw)
    for inset, col, wd in ((0.03, (214, 186, 140), 2), (0.09, (214, 186, 140), 2), (0.105, (132, 44, 30), 3)):
        d2.rectangle([w * inset, w * inset, w - w * inset, h - w * inset], outline=col, width=wd * SS)
    base.paste(pat, (0, 0), pat_m)
    d3 = ImageDraw.Draw(base); cx, cy = w / 2, h / 2; rx, ry = w * 0.2, h * 0.16   # 中間的菱形（米色線＋深一點的底）
    d3.polygon([(cx, cy - ry), (cx + rx, cy), (cx, cy + ry), (cx - rx, cy)], fill=(160, 58, 36), outline=(214, 186, 140))
    d3.polygon([(cx, cy - ry * 0.55), (cx + rx * 0.55, cy), (cx, cy + ry * 0.55), (cx - rx * 0.55, cy)], outline=(214, 186, 140))
    a = np.asarray(base.filter(ImageFilter.GaussianBlur(0.6 * SS)), np.float32) * (1.0 + 0.07 * np.clip(zc, -2.5, 2.5))[..., None]
    P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG['rug'][0] * SS, REG['rug'][1] * SS))
    # 燈罩：奶油色＋深色的圓圈交疊（幾何花紋）
    w, h = sz('shade'); img = Image.new('RGB', (w, h), (230, 220, 196)); d = ImageDraw.Draw(img); r = h * 0.2
    for j in range(-1, 4):
        for i in range(-1, 13):
            cx, cy = i * r * 1.5 + (r * 0.75 if j % 2 else 0), j * r * 1.5 + r * 0.5
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(64, 56, 50), width=int(1.6 * SS))
    d.rectangle([0, 0, w, h * 0.04], fill=(60, 54, 48)); d.rectangle([0, h * 0.96, w, h], fill=(60, 54, 48))   # 上下的滾邊
    P.paste(img.filter(ImageFilter.GaussianBlur(0.7 * SS)), (REG['shade'][0] * SS, REG['shade'][1] * SS))
    # 抱枕：白底黑圓圈／黑底白斜紋
    w, h = sz('pillow_a'); img = Image.new('RGB', (w, h), (234, 232, 226)); d = ImageDraw.Draw(img); r = w * 0.09
    for j in range(6):
        for i in range(6):
            cx, cy = (i + 0.5) * w / 6 + (w / 12 if j % 2 else 0), (j + 0.5) * h / 6
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(28, 28, 30), width=2 * SS)
    P.paste(img.filter(ImageFilter.GaussianBlur(0.4 * SS)), (REG['pillow_a'][0] * SS, REG['pillow_a'][1] * SS))
    w, h = sz('pillow_b'); img = Image.new('RGB', (w, h), (34, 34, 36)); d = ImageDraw.Draw(img)
    for k in range(-8, 16):
        d.line([(k * w / 8, 0), (k * w / 8 + h, h)], fill=(224, 222, 216), width=3 * SS)
    P.paste(img.filter(ImageFilter.GaussianBlur(0.4 * SS)), (REG['pillow_b'][0] * SS, REG['pillow_b'][1] * SS))
    # 電視：黑框很窄（寬 0.97 m、高 0.56 m 都壓在 128×128，橫的框要畫細一點）＋關著的螢幕（左上一點反光）
    w, h = sz('tv_screen'); a = np.zeros((h, w, 3), np.float32); yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w], np.float32)[:, None, None]
    a[:] = 14 + 16 * np.clip(1.0 - (xx * 0.8 + yy * 1.1), 0, 1)[..., None]
    bx, by = max(2, int(w * 0.012)), max(3, int(h * 0.022)); a[:by] = 8; a[-by:] = 8; a[:, :bx] = 8; a[:, -bx:] = 8
    P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG['tv_screen'][0] * SS, REG['tv_screen'][1] * SS))
    # 相框：只有色塊
    w, h = sz('frame_a'); img = Image.new('RGB', (w, h), (24, 24, 26)); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.08, h * 0.08, w * 0.92, h * 0.92], fill=(236, 234, 228))
    d.rectangle([w * 0.18, h * 0.16, w * 0.82, h * 0.5], fill=(146, 182, 210)); d.rectangle([w * 0.18, h * 0.5, w * 0.82, h * 0.66], fill=(62, 118, 160))
    d.rectangle([w * 0.18, h * 0.66, w * 0.82, h * 0.84], fill=(214, 196, 158)); P.paste(img, (REG['frame_a'][0] * SS, REG['frame_a'][1] * SS))
    w, h = sz('frame_b'); img = Image.new('RGB', (w, h), (150, 110, 74)); d = ImageDraw.Draw(img)
    d.rectangle([w * 0.1, h * 0.1, w * 0.9, h * 0.9], fill=(196, 214, 222)); d.rectangle([w * 0.1, h * 0.62, w * 0.9, h * 0.9], fill=(108, 146, 84))
    d.ellipse([w * 0.5, h * 0.26, w * 0.78, h * 0.64], fill=(60, 102, 64)); d.rectangle([w * 0.62, h * 0.58, w * 0.66, h * 0.7], fill=(92, 70, 52))
    P.paste(img, (REG['frame_b'][0] * SS, REG['frame_b'][1] * SS))
    wear(P)


# ================= 第 9 節補強：皮的光澤和皺褶、地毯走道那一側比較舊、毯子、遙控器、地面 AO 的貼圖 =================
def soft(w, h, shapes, blur, noise=0.0, seed=0):
    """0～1 的遮罩：shapes＝[(cx, cy, rx, ry, 強度)]（像素）；邊緣模糊、加一點不均勻"""
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    for (cx, cy, rx, ry, k) in shapes: d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * k))
    a = np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), np.float32) / 255
    if noise:
        g = np.random.default_rng(seed); n = np.asarray(Image.fromarray((g.random((max(2, h // 8), max(2, w // 8))) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        a = a * (1 - noise + noise * 2 * n)
    return np.clip(a, 0, 1)


def region_arr(P, name):
    x0, y0, x1, y1 = REG[name]; return np.asarray(P.crop((x0 * SS, y0 * SS, x1 * SS, y1 * SS)), np.float32)


def put(P, name, a): P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG[name][0] * SS, REG[name][1] * SS))


def wear(P):
    # --- 皮（座墊上面、靠墊正面、扶手上面共用 leather_top）：坐的地方磨亮（中間偏前）、前緣磨得最多、幾條皺褶 ---
    a = region_arr(P, 'leather_top'); h, w = a.shape[:2]   # 座墊上面：s＝x、t＝z（t=1 是前緣）→ 圖的上面是前緣
    m = soft(w, h, [(0.5 * w, 0.36 * h, 0.3 * w, 0.24 * h, 0.85), (0.5 * w, 0.08 * h, 0.4 * w, 0.06 * h, 0.7)], 9 * SS, noise=0.5, seed=31)
    a = a + 10 * m[..., None]                                                        # 磨亮：黑皮變成深灰一點
    cr = Image.new('L', (w, h), 0); d = ImageDraw.Draw(cr); g = np.random.default_rng(32)
    for k in range(7):   # 皺褶：坐出來的弧線，大多和前緣平行，在磨亮那一塊裡
        y0 = (0.2 + 0.05 * k + g.normal(0, 0.012)) * h; x0, x1 = (0.24 + g.uniform(-0.04, 0.06)) * w, (0.76 + g.uniform(-0.06, 0.04)) * w
        d.line([(x0 + (x1 - x0) * t, y0 + math.sin(t * math.pi) * (0.035 + 0.01 * k) * h * (1 if k % 2 else -0.6)) for t in np.linspace(0, 1, 24)], fill=150 + 15 * (k % 3), width=int(1.4 * SS))
    c = np.asarray(cr.filter(ImageFilter.GaussianBlur(1.2 * SS)), np.float32) / 255
    a = a * (1 - 0.4 * c[..., None]); put(P, 'leather_top', a)
    ROUGH_MASKS.extend([('leather_top', m, 0.28), ('leather_top', c * 0.6, 0.55)])
    # --- 地毯：走道那一側（本地 +x 那一邊、+z 那一端，翹起來的 +x+z 角最舊）顏色淡、絨毛壓平 ---
    a = region_arr(P, 'rug'); h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)   # s＝(x+1)/2（右＝+x）、t＝(1.3−z)/2.6（圖的下面＝+z）
    band = np.clip((xx / w - 0.78) / 0.2, 0, 1) ** 1.5 + np.clip((yy / h - 0.82) / 0.16, 0, 1) ** 1.5
    corner = np.exp(-(((xx / w - 0.98) / 0.22) ** 2 + ((yy / h - 0.98) / 0.18) ** 2))
    mr = np.clip(0.55 * band + 0.6 * corner, 0, 1)
    g = np.random.default_rng(34); n = np.asarray(Image.fromarray((g.random((h // 16, w // 16)) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
    mr = np.clip(mr * (0.7 + 0.6 * n), 0, 1)
    flat_ = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5 * SS)), np.float32)   # 絨毛壓平：纖維的明暗變小
    grey = np.array((176, 120, 96), np.float32)
    a = a * (1 - mr[..., None]) + (flat_ * 0.72 + grey * 0.28) * mr[..., None]; put(P, 'rug', a)
    ROUGH_MASKS.append(('rug', mr, 0.86))
    # --- 毯子：灰藍色針織（橫的細紋＋一點起伏）、兩端米色條紋、流蘇 ---
    w, h = sz('blanket'); yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.zeros((h, w, 3), np.float32); a[:] = (104, 122, 140)
    a *= (1 + 0.07 * np.sin(yy / (1.6 * SS) * math.pi))[..., None] * (1 + 0.04 * np.sin(xx / (2.2 * SS) * math.pi + np.sin(yy / (1.6 * SS))))[..., None]
    for s0 in (0.05, 0.1, 0.9, 0.95):
        msk = np.abs(xx / w - s0) < 0.012; a[msk] = (214, 204, 182)
    fr = (xx / w < 0.025) | (xx / w > 0.975); a[fr] = a[fr] * 0.75 + np.array((214, 204, 182)) * 0.25 * ((yy[fr] // (2 * SS)) % 2)[..., None]
    put(P, 'blanket', a)
    # --- 遙控器 ---
    w, h = sz('remote'); img = Image.new('RGB', (w, h), (22, 22, 24)); d = ImageDraw.Draw(img)
    d.ellipse([w * 0.4, h * 0.06, w * 0.6, h * 0.11], fill=(170, 40, 36))
    d.ellipse([w * 0.22, h * 0.2, w * 0.78, h * 0.38], outline=(110, 110, 112), width=2 * SS); d.ellipse([w * 0.4, h * 0.26, w * 0.6, h * 0.32], fill=(96, 96, 98))
    for r_ in range(5):
        for c_ in range(3): d.ellipse([w * (0.2 + c_ * 0.24), h * (0.46 + r_ * 0.09), w * (0.34 + c_ * 0.24), h * (0.51 + r_ * 0.09)], fill=(84, 84, 86))
    put(P, 'remote', np.asarray(img, np.float32))


def make_ao_png():
    """地面 AO 貼片（九宮格用）：u、v 在 0.25～0.75 是裡面（透明度 0.55），外圈 0～0.25 漸層到 0"""
    n = 64; t = np.linspace(0, 1, n); e = np.clip(np.minimum(t, 1 - t) / 0.25, 0, 1); e = e * e * (3 - 2 * e)
    al = np.outer(e, e) * 0.55; img = np.zeros((n, n, 4), np.uint8); img[..., 3] = (al * 255).astype(np.uint8)
    Image.fromarray(img, 'RGBA').save(AO_PNG)


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
    rl = np.asarray(Image.open(SRC['leather_rough']).convert('L').resize((64, 64), Image.LANCZOS), np.float32) / 255.0   # 皮的粗糙度照 Poly Haven 的 rough 圖起伏
    for name in ('leather_top', 'leather_plain'):
        x0, y0, x1, y1 = (int(v * f) for v in REG[name]); base = ORM_REG[name][0]
        orm[y0:y1, x0:x1, 1] = np.clip((base + 0.18 * (rl - rl.mean())) * 255, 0, 255).astype(np.uint8)
    for name, m, rough in ROUGH_MASKS:   # 第 9 節補強：坐的地方磨亮、皺褶、地毯壓平
        x0, y0, x1, y1 = REG[name]; X0, Y0, X1, Y1 = int(x0 * f), int(y0 * f), int(math.ceil(x1 * f)), int(math.ceil(y1 * f))
        mm = np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).resize((X1 - X0, Y1 - Y0), Image.BILINEAR), np.float32) / 255
        g = orm[Y0:Y1, X0:X1, 1].astype(np.float32); orm[Y0:Y1, X0:X1, 1] = np.clip(g * (1 - mm) + rough * 255 * mm, 0, 255).astype(np.uint8)
    Image.fromarray(orm).save(ATLAS_ORM)
    make_ao_png()


# ================= 網格工具（同 wz6_items.py）=================
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


def sphere(pm, c, r, fn, seg=20, rings=12, M=None):
    sub = PM()
    for j in range(rings):
        t0, t1 = math.pi * j / rings, math.pi * (j + 1) / rings
        for i in range(seg):
            p0, p1 = 2 * math.pi * i / seg, 2 * math.pi * (i + 1) / seg
            q = [(math.sin(t) * math.cos(p), math.cos(t), math.sin(t) * math.sin(p)) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            pts = [(c[0] + r * a, c[1] + r * b, c[2] + r * cc) for a, b, cc in q]
            uvs = [fn(p / (2 * math.pi), 1 - t / math.pi) for t, p in ((t0, p0), (t0, p1), (t1, p1), (t1, p0))]
            mid = np.mean(np.array(q), axis=0); sub.poly(pts, uvs, tuple(mid))
    return pm.add(sub, M)





def sweep(pm, pts, r, sides, fn, caps=True, closed=False):
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
    return pm.add(sub)



def ribbon(pm, P, hw, ht, fn):
    """扁帶子：沿 P（在 yz 平面）走，寬 2×hw（x 方向）、厚 2×ht（z 方向）；四面＋兩端"""
    rings = [[p + np.array(o) for o in ((-hw, 0, -ht), (hw, 0, -ht), (hw, 0, ht), (-hw, 0, ht))] for p in P]
    for a, b in zip(rings, rings[1:]):
        for k, nrm in zip(range(4), ((0, 0, -1), (1, 0, 0), (0, 0, 1), (-1, 0, 0))):
            pm.poly([a[k], a[(k + 1) % 4], b[(k + 1) % 4], b[k]], [fn(0.5, 0.5)] * 4, nrm)
    pm.poly(rings[0], [fn(0.5, 0.5)] * 4, (0, 1, 0)); pm.poly(rings[-1], [fn(0.5, 0.5)] * 4, (0, -1, 0))



def blob_pm(elems, voxel, target, fn, smooth_iter=7, hull=None, hull_shrink=0.96):
    """橢球合體 → 體素重建 → 保體積平滑 → 減面（和 wz_cat.py 同一個做法）；回傳 PM（UV 全部指到 fn 的色塊）"""
    bm = bmesh.new()
    def add_ell(e):
        c, rad = e[0], e[1]; ry, rz = (math.radians(e[2]), math.radians(e[3])) if len(e) > 2 else (0.0, 0.0)
        Rm = (Ry(ry) @ np.array([[math.cos(rz), -math.sin(rz), 0, 0], [math.sin(rz), math.cos(rz), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))[:3, :3]
        res = bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=9, radius=1.0)
        for v in res['verts']:
            p = Rm @ (np.array([v.co.x, v.co.z, -v.co.y]) * np.array(rad)) + np.array(c); v.co = g2b(*p)
        return res['verts']
    if hull:   # 袋子：瓶子堆的凸包，往中心縮一點，再和瓶子本身合在一起——袋子包住整堆，瓶子只在表面撐出淺淺的稜
        hv = []
        for e in hull: hv += add_ell(e)
        h = bmesh.ops.convex_hull(bm, input=hv)
        bmesh.ops.delete(bm, geom=[g for g in h['geom_interior'] + h['geom_unused'] if isinstance(g, bmesh.types.BMVert)], context='VERTS')
        hull_v = [g for g in h['geom'] if isinstance(g, bmesh.types.BMVert) and g.is_valid]
        cen = sum((v.co for v in hull_v), hull_v[0].co * 0) / len(hull_v)
        for v in hull_v: v.co = cen + (v.co - cen) * hull_shrink
        for e in hull: add_ell(e)
    for e in elems: add_ell(e)
    me = bpy.data.meshes.new('_blob'); bm.to_mesh(me); bm.free(); ob = bpy.data.objects.new('_blob', me); B.scene().collection.objects.link(ob)
    rm = ob.modifiers.new('r', 'REMESH'); rm.mode = 'VOXEL'; rm.voxel_size = voxel
    sm = ob.modifiers.new('s', 'LAPLACIANSMOOTH'); sm.lambda_factor = 0.6; sm.iterations = smooth_iter; sm.use_volume_preserve = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); bpy.data.objects.remove(ob); bpy.data.meshes.remove(me)
    ob2 = bpy.data.objects.new('_dec', me2); B.scene().collection.objects.link(ob2); tris = sum(len(p.vertices) - 2 for p in me2.polygons)
    if tris > target:
        dm = ob2.modifiers.new('d', 'DECIMATE'); dm.ratio = target / tris; dm.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me3 = bpy.data.meshes.new_from_object(ob2.evaluated_get(dg)); bpy.data.objects.remove(ob2); bpy.data.meshes.remove(me2)
    pm = PM(); V = [np.array([v.co.x, v.co.z, -v.co.y]) for v in me3.vertices]
    for p in V: pm.v.append(p)
    for poly in me3.polygons: pm.f.append(list(poly.vertices)); pm.uv.append([fn(0.5, 0.5)] * len(poly.vertices))
    bpy.data.meshes.remove(me3); return pm





def proj_uv(pm, name, axes=(0, 2)):
    """把整個網格照兩個軸（預設 x、z：從上面看）投影到貼圖的一塊（燒餅的芝麻、木板）"""
    V = np.array(pm.v); lo, hi = V.min(0), V.max(0); a, b = axes
    pm.uv = [[ruv(name, (pm.v[i][a] - lo[a]) / max(1e-6, hi[a] - lo[a]), (pm.v[i][b] - lo[b]) / max(1e-6, hi[b] - lo[b])) for i in f] for f in pm.f]
    return pm


def blob_at(elems, voxel, target, fn, M=None, proj=None, smooth_iter=4):
    pm = blob_pm(elems, voxel, target, fn, smooth_iter=smooth_iter)
    if proj: proj_uv(pm, proj)
    return PM().add(pm, M)



def to_blender(pm, name, mats, parent, angle=0.6, glass=None):
    """glass：第二個材質（玻璃）的面，和 pm 合成同一個網格，material_index＝1"""
    nv = len(pm.v); V = list(pm.v) + (list(glass.v) if glass else []); F = [list(f) for f in pm.f] + ([[i + nv for i in f] for f in glass.f] if glass else [])
    UV = list(pm.uv) + (list(glass.uv) if glass else [])
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in V], [], [tuple(f) for f in F])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, UV):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mats[0])
    if glass:
        me.materials.append(mats[1])
        for k, poly in enumerate(me.polygons): poly.material_index = 1 if k >= len(pm.f) else 0
    me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6); bm.to_mesh(me); bm.free(); me.update()   # 合併重疊頂點（LAWWW2-B 驗收 WZ6 的修正）
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


def box(pm, x0, x1, y0, y1, z0, z1, uv, M=None):
    """沒有倒角的小方塊（書、門片下的腳）：6 面 12 個三角形；uv 的鍵同 rbox"""
    sub = PM(); W, H, D = x1 - x0, y1 - y0, z1 - z0
    F = {'t': ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)), 'k': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], (0, 0, -1)),
         'r': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], (1, 0, 0)), 'l': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0))}
    for key, (pts, n) in F.items():
        fn = uv.get(key) or uv.get('*'); sub.poly(pts, [fn(0, 0), fn(1, 0), fn(1, 1), fn(0, 1)], n)
    return pm.add(sub, M)


def cushion(pm, W, H, D, r, k=(2, 0, 2), sag=0.0, bulge=0.0, bend=0.0, uv=None, skip=('b',), M=None):
    """座墊、靠墊、扶手：圓角方塊，每一面都有內部格點（才能塌、鼓）。中心在原點；W＝x、H＝y、D＝z。
    sag：上面中間往下塌（公尺）；bulge：側面中段往外鼓（比例）；bend：兩側往 +z 彎（高腳椅的靠背）；uv：{面: 色塊}；skip：不做的面（壓在下面看不到）"""
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
                sub.poly(pts, [fn(s0, t0), fn(s1, t0), fn(s1, t1), fn(s0, t1)], tuple(np.mean(np.array(pts), axis=0)))
    return pm.add(sub, M)


def leg(pm, x, z, h, r0, r1, fn, n=8):
    lathe(pm, [(r1, 0.0, r0, h, fn, 'out'), (0.0, 0.0, r1, 0.0, fn, 'down')], n, M=T(x, 0, z))


LTOP, LPL = R('leather_top'), R('leather_plain')
CUSH_SEAT = {'t': LTOP, 'f': LTOP, '*': LPL}
CUSH_BACK = {'f': LTOP, '*': LPL}


def pillow(fn_name, M, size=0.42, thick=0.14, n=7):
    """抱枕：正方形、四角尖、中間鼓（前後兩片曲面在邊上接起來，邊往內收一點）；圖案正面、背面都照 fn_name"""
    pm = PM(); hs, ht = size / 2, thick / 2; fn = R(fn_name); us = np.linspace(-1, 1, n + 1)
    def P(u, v, side):
        puff = ((1 - u * u) * (1 - v * v)) ** 0.55
        return (u * hs * (1 - 0.07 * (1 - v * v)), v * hs * (1 - 0.07 * (1 - u * u)), side * ht * puff)
    for side in (1, -1):
        for i in range(n):
            for j in range(n):
                q = [(us[i], us[j]), (us[i + 1], us[j]), (us[i + 1], us[j + 1]), (us[i], us[j + 1])]; pts = [P(u, v, side) for u, v in q]
                pm.poly(pts, [fn((u + 1) / 2 if side > 0 else (1 - u) / 2, (v + 1) / 2) for u, v in q], tuple(np.mean(np.array(pts), axis=0)))
    return PM().add(pm, M)


def leather_seat(W, D, H, arm, n_seat, seat_y=0.45, back_top=0.86):
    """沙發（三人、單人共用）：W 寬、D 深；arm 扶手寬；n_seat 塊座墊"""
    pm = PM(); hx, hz = W / 2, D / 2; ix = hx - arm; legh = 0.08
    for sx in (-1, 1):
        for sz_ in (-1, 1): leg(pm, sx * (hx - 0.07), sz_ * (hz - 0.07), legh, 0.022, 0.016, S('leg_dark'))
    rbox(pm, -ix, ix, legh, 0.30, -hz + 0.18, hz - 0.02, {'*': LPL}, r=0.02, seg=2)                       # 座墊下面的底座
    rbox(pm, -ix, ix, legh, 0.74, -hz, -hz + 0.18, {'*': LPL}, r=0.03, seg=2)                              # 靠背的框（座墊、靠墊靠在上面）
    for sx in (-1, 1):   # 扶手：鼓鼓的，上面一點點塌
        cushion(pm, arm, 0.62 - legh, D, 0.05, k=(0, 1, 1), sag=0.006, bulge=0.04, uv={'t': LTOP, '*': LPL}, M=T(sx * (hx - arm / 2), legh + (0.62 - legh) / 2, 0))
    cw = (2 * ix - 0.006 * (n_seat - 1)) / n_seat; sd = D - 0.2; th = seat_y - 0.30
    for i in range(n_seat):
        cx = -ix + cw / 2 + i * (cw + 0.006)
        cushion(pm, cw, th, sd, 0.045, k=(2, 0, 2), sag=0.022, bulge=0.05, uv=CUSH_SEAT, M=T(cx, 0.30 + th / 2, hz - 0.02 - sd / 2))
        bh = back_top - seat_y + 0.02; tilt = math.radians(-11)
        cushion(pm, cw, bh, 0.2, 0.05, k=(2, 1, 0), sag=0.004, bulge=0.06, uv=CUSH_BACK,
                M=T(cx, seat_y - 0.02, -hz + 0.18 + 0.1) @ Rx(tilt) @ T(0, bh / 2, 0))
    return pm


def throw():
    """第 9 節補強（生活痕跡）：披在右邊扶手上的毯子——從座墊上爬過扶手內側、蓋過扶手上面、垂到外側；兩面（正面針織、背面同一張）；
    剖面沿扶手的形狀（離扶手、座墊 1～1.5 cm），沿 z 有一點波浪，垂下來的那一端長短不一"""
    pm = PM(); fn = R('blanket')
    prof = [(0.58, 0.462), (0.7, 0.466), (0.765, 0.482), (0.782, 0.53), (0.787, 0.6), (0.812, 0.636), (0.9, 0.644), (0.99, 0.636), (1.019, 0.6), (1.023, 0.5), (1.021, 0.41), (1.014, 0.34)]
    L_ = np.concatenate([[0], np.cumsum([math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(prof, prof[1:])])]); sv = L_ / L_[-1]
    zs = [0.02, 0.15, 0.28, 0.41]
    def P(i, j, off):
        x, y = prof[i]; z = zs[j]; wv = 0.008 * math.sin(z * 19 + i * 0.7) * (sv[i] > 0.15) * (1 - abs(2 * sv[i] - 1.2))
        if i == len(prof) - 1: y += 0.035 * math.sin(z * 11 + 1.0)        # 垂下來的那一端長短不一
        if i <= 1: x -= 0.03 * math.sin(z * 9)                              # 座墊上那一端斜的
        # 往外（離開沙發）的方向＝剖面的切線逆時針轉 90°：座墊上朝上、扶手內側朝 −x、上面朝上、外側朝 +x
        a, b = prof[max(0, i - 1)], prof[min(len(prof) - 1, i + 1)]; tx, ty = b[0] - a[0], b[1] - a[1]; ln = math.hypot(tx, ty); nx, ny = -ty / ln, tx / ln
        return (x + nx * (wv + off), y + ny * (wv + off), z)
    for side, off in ((1, 0.0), (-1, -0.004)):
        for i in range(len(prof) - 1):
            for j in range(len(zs) - 1):
                pts = [P(i, j, off), P(i + 1, j, off), P(i + 1, j + 1, off), P(i, j + 1, off)]
                a, b = prof[i], prof[i + 1]; tx, ty = b[0] - a[0], b[1] - a[1]
                n_out = np.array((-ty, tx, 0.0)) * side
                uvs = [fn(sv[i], (zs[j] - 0.02) / 0.39), fn(sv[i + 1], (zs[j] - 0.02) / 0.39), fn(sv[i + 1], (zs[j + 1] - 0.02) / 0.39), fn(sv[i], (zs[j + 1] - 0.02) / 0.39)]
                pm.poly(pts if side > 0 else pts[::-1], uvs if side > 0 else uvs[::-1], tuple(n_out))
    return pm


def sofa():
    pm = leather_seat(2.0, 0.9, 0.85, 0.2, 3)
    pm.add(throw())
    pm.add(pillow('pillow_a', T(-0.56, 0.62, -0.02) @ Rx(math.radians(-18)) @ Ry(math.radians(12))))     # 黑白抱枕兩個（照片一）
    pm.add(pillow('pillow_b', T(0.58, 0.6, -0.02) @ Rx(math.radians(-20)) @ Ry(math.radians(-16)) @ np.diag([0.92, 0.92, 0.92, 1.0])))
    return pm


def armchair():
    return leather_seat(0.95, 0.9, 0.85, 0.18, 1)


def wood_table(W, D, H, top_t=0.03, legw=0.045, shelf_y=0.11, fn=None):
    """咖啡桌、小桌：桌面（倒角）、四支腳、四片橫板、下層隔板；W＝x、D＝z"""
    pm = PM(); fn = fn or R('wood_dark'); hx, hz = W / 2, D / 2; uvw = {'*': fn}
    rbox(pm, -hx, hx, H - top_t, H, -hz, hz, uvw, r=0.006, seg=2)
    for sx in (-1, 1):
        for sz_ in (-1, 1):
            x, z = sx * (hx - 0.03 - legw / 2), sz_ * (hz - 0.03 - legw / 2)
            rbox(pm, x - legw / 2, x + legw / 2, 0, H - top_t, z - legw / 2, z + legw / 2, uvw, r=0.004, seg=1)
    ax, az = hx - 0.03 - legw / 2, hz - 0.03 - legw / 2
    for sz_ in (-1, 1): rbox(pm, -ax, ax, H - top_t - 0.07, H - top_t, sz_ * az - 0.01, sz_ * az + 0.01, uvw, r=0.002, seg=1)
    for sx in (-1, 1): rbox(pm, sx * ax - 0.01, sx * ax + 0.01, H - top_t - 0.07, H - top_t, -az, az, uvw, r=0.002, seg=1)
    rbox(pm, -ax, ax, shelf_y, shelf_y + 0.018, -az, az, uvw, r=0.003, seg=1)
    return pm


def mug(r=0.04, h=0.095, seg=14):
    q = PM(); MG, MI = S('mug'), S('mug_in')
    lathe(q, [(r, 0.0, r, h, MG, 'out'), (r, h, r - 0.004, h, MG, 'up'), (r - 0.004, h, r - 0.004, 0.012, MI, 'in')], seg, caps=[(r - 0.004, 0.012, MI, 'up'), (r, 0.0, MG, 'down')])
    sweep(q, [(r - 0.002, 0.075, 0), (r + 0.022, 0.072, 0), (r + 0.028, 0.05, 0), (r + 0.022, 0.027, 0), (r - 0.002, 0.025, 0)], 0.0055, 6, MG)
    return q


def coffee():
    pm = wood_table(0.6, 1.1, 0.45); top = 0.45
    # 第 9 節補強（生活痕跡）：遙控器、馬克杯、兩本疊著的書＋一支筆（桌子長邊沿 z）
    rbox(pm, -0.023, 0.023, 0.0, 0.018, -0.085, 0.085, {'t': R('remote'), '*': S('black_plastic')}, r=0.006, seg=1, M=T(0.14, top, -0.28) @ Ry(0.45))
    pm.add(mug(), T(-0.14, top, 0.24) @ Ry(2.6))
    box(pm, -0.085, 0.085, 0.0, 0.026, -0.12, 0.12, {'*': S('book_navy'), 'r': S('page'), 'l': S('page'), 'f': S('page')}, M=T(0.02, top, -0.02) @ Ry(0.12))
    box(pm, -0.075, 0.075, 0.0, 0.02, -0.105, 0.105, {'*': S('book_mustard'), 'r': S('page'), 'l': S('page'), 'f': S('page')}, M=T(0.03, top + 0.026, -0.03) @ Ry(-0.2))
    q = PM(); sweep(q, [(-0.07, 0.0, 0), (0.06, 0.0, 0)], 0.0045, 6, S('pen')); sweep(q, [(0.06, 0.0, 0), (0.075, 0.0, 0)], 0.0048, 6, S('pen_cap'))
    pm.add(q, T(0.03, top + 0.046 + 0.0045, -0.05) @ Ry(0.9))
    return pm


def endtable():
    """小方桌＋桌燈；回傳（不透明網格, 發光網格）"""
    pm = wood_table(0.5, 0.5, 0.58, top_t=0.028, legw=0.04, shelf_y=0.12); gl = PM(); y0 = 0.58; M = T(-0.04, y0, -0.05)
    prof = [(0.06, 0.0), (0.068, 0.015), (0.078, 0.04), (0.086, 0.07), (0.09, 0.1), (0.09, 0.13), (0.087, 0.16), (0.08, 0.19), (0.068, 0.22), (0.052, 0.25), (0.036, 0.275), (0.024, 0.295), (0.02, 0.31)]
    lathe(pm, [(0.0, 0.0, 0.06, 0.0, S('lamp_base'), 'down')] + [(a[0], a[1], b[0], b[1], S('lamp_base'), 'out') for a, b in zip(prof, prof[1:])] + [(0.02, 0.31, 0.0, 0.312, S('lamp_base'), 'up')], 20, M=M)   # 黑色圓肚的底座（平滑的輪廓）
    lathe(pm, [(0.009, 0.31, 0.009, 0.39, S('metal_dark'), 'out'), (0.016, 0.39, 0.016, 0.43, S('metal_dark'), 'out'), (0.016, 0.43, 0.0, 0.432, S('metal_dark'), 'up')], 8, M=M)   # 燈座
    sb, st_, rb, rt = 0.33, 0.57, 0.19, 0.15   # 燈罩：鼓形，下大上小
    lathe(pm, [(rb, sb, rt, st_, R('shade'), 'out'), (rt, st_, rt - 0.006, st_, S('shade_rim'), 'up'), (rb - 0.006, sb, rb, sb, S('shade_rim'), 'down')], 28, M=M)
    lathe(gl, [(rb - 0.004, sb + 0.002, rt - 0.004, st_ - 0.002, S('shade_rim'), 'in')], 28, M=M)   # 燈罩內面（發光）
    for a in (0, math.pi):   # 燈罩的支架（兩支）＋頂上的小鈕
        c, s = math.cos(a), math.sin(a); sweep(pm, [(-0.04 + 0.016 * c, y0 + 0.43, -0.05 + 0.016 * s), (-0.04 + 0.03 * c, y0 + 0.5, -0.05 + 0.03 * s), (-0.04, y0 + 0.565, -0.05)], 0.003, 4, S('metal_dark'))
    lathe(pm, [(0.0, 0.565, 0.012, 0.57, S('metal_dark'), 'out'), (0.012, 0.57, 0.0, 0.59, S('metal_dark'), 'out')], 8, M=M)
    return pm, gl


def rug():
    """2.0×2.6，厚 8 mm；+x+z 那個角翹起來約 2 cm，−x 那一邊中段翹 0.8 cm；底面（米色背布）只在翹起來的地方看得到"""
    pm = PM(); hx, hz, th = 1.0, 1.3, 0.008
    xs = [-1.0, -0.96, -0.9] + list(np.linspace(-0.7, 0.7, 4)) + [0.9, 0.96, 1.0]
    zs = [-1.3, -1.25, -1.18] + list(np.linspace(-0.9, 0.9, 5)) + [1.18, 1.25, 1.3]
    def lift(x, z):
        d = math.hypot(hx - x, hz - z); a = 0.022 * max(0.0, 1 - d / 0.28) ** 2
        b = 0.008 * max(0.0, 1 - (x + hx) / 0.1) * max(0.0, 1 - (z / 0.9) ** 2)
        return a + b
    top = [[(x, th + lift(x, z), z) for z in zs] for x in xs]; bot = [[(x, lift(x, z), z) for z in zs] for x in xs]
    fnr, fnb = R('rug'), S('rug_back')
    for i in range(len(xs) - 1):
        for j in range(len(zs) - 1):
            s0, s1 = (xs[i] + hx) / 2 / hx, (xs[i + 1] + hx) / 2 / hx; t0, t1 = (hz - zs[j]) / 2 / hz, (hz - zs[j + 1]) / 2 / hz
            pm.poly([top[i][j], top[i + 1][j], top[i + 1][j + 1], top[i][j + 1]], [fnr(s0, t0), fnr(s1, t0), fnr(s1, t1), fnr(s0, t1)], (0, 1, 0))
            pm.poly([bot[i][j], bot[i][j + 1], bot[i + 1][j + 1], bot[i + 1][j]], [fnb(0, 0)] * 4, (0, -1, 0))
    rim = [(i, 0) for i in range(len(xs))] + [(len(xs) - 1, j) for j in range(1, len(zs))] + [(i, len(zs) - 1) for i in range(len(xs) - 2, -1, -1)] + [(0, j) for j in range(len(zs) - 2, 0, -1)]
    for a, b in zip(rim, rim[1:] + rim[:1]):
        p, q = top[a[0]][a[1]], top[b[0]][b[1]]; pb, qb = bot[a[0]][a[1]], bot[b[0]][b[1]]; mid = np.array(p) + np.array(q)
        pm.poly([pb, qb, q, p], [R('rug')(0.02, 0.5)] * 4, (mid[0], 0, mid[2]))
    return pm


def ladder():
    """梯子形壁架：前兩支斜的（底 z=+0.225 → 頂 z≈−0.075），後兩支直的貼牆（z=−0.225）；五層隔板，越上面越淺"""
    pm = PM(); fn = R('blackwood'); uvw = {'*': fn}; Hh = 1.8; zf0, zb = 0.21, -0.21; tan = 0.30 / Hh; ang = math.atan(tan); Lr = Hh / math.cos(ang)
    for sx in (-1, 1):
        rbox(pm, -0.015, 0.015, 0, Lr, -0.015, 0.015, uvw, r=0.004, seg=1, M=T(sx * 0.285, 0, zf0) @ Rx(-ang))     # 前面斜的兩支
        rbox(pm, sx * 0.285 - 0.015, sx * 0.285 + 0.015, 0, Hh - 0.02, zb - 0.015, zb + 0.015, uvw, r=0.004, seg=1)   # 後面直的兩支
    shelves = [0.25, 0.6, 0.95, 1.3, 1.62]
    for y in shelves:
        zf = zf0 + 0.012 - y * tan; rbox(pm, -0.27, 0.27, y, y + 0.02, zb - 0.012, zf, uvw, r=0.003, seg=1)
    rng = np.random.default_rng(11); cols = ['book_navy', 'book_maroon', 'book_beige', 'book_green', 'book_gray', 'book_mustard', 'book_white']
    def books(y, x0, n, zb_, depth, hmin, hmax, lean_last=True):
        x = x0
        for k in range(n):
            w = rng.uniform(0.022, 0.038); hb = rng.uniform(hmin, hmax); c = cols[int(rng.integers(len(cols)))]
            if lean_last and k == n - 1:
                box(pm, -w / 2, w / 2, 0, hb, zb_, zb_ + depth, {'*': S(c), 'f': S('page')}, M=T(x + 0.03, y, 0) @ np.array([[math.cos(-0.35), -math.sin(-0.35), 0, 0], [math.sin(-0.35), math.cos(-0.35), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]))
            else:
                box(pm, x, x + w, y, y + hb, zb_, zb_ + depth, {'*': S(c), 't': S('page')}); x += w + 0.002
    books(0.62, -0.25, 7, zb + 0.005, 0.17, 0.17, 0.24)        # 第二層：一排直立的書，最後一本斜靠
    books(1.64, -0.24, 4, zb + 0.005, 0.12, 0.12, 0.16)        # 最上層：幾本小書
    for k, (c, t) in enumerate((('book_gray', 0.03), ('book_navy', 0.025), ('book_beige', 0.035))):   # 最下層：橫放的一疊
        y = 0.27 + sum([0.03, 0.025, 0.035][:k]); box(pm, -0.2 + 0.01 * k, 0.05 - 0.008 * k, y, y + t, zb + 0.02, zb + 0.24 - 0.01 * k, {'*': S(c), 'r': S('page')})
    # 第三層：小盆栽（白色陶盆、土、一叢葉子）
    px, pz, py = 0.12, -0.08, 0.97
    lathe(pm, [(0.0, 0.0, 0.05, 0.0, S('pot'), 'down'), (0.05, 0.0, 0.066, 0.1, S('pot'), 'out'), (0.066, 0.1, 0.07, 0.108, S('pot'), 'out'), (0.07, 0.108, 0.062, 0.108, S('pot'), 'up'),
               (0.062, 0.108, 0.06, 0.092, S('pot'), 'in'), (0.06, 0.092, 0.0, 0.092, S('soil'), 'up')], 14, M=T(px, py, pz))
    for k in range(8):   # 虎尾蘭：八片直立的劍形葉子（漸尖、往外彎一點），兩面都有
        a = 2 * math.pi * k / 8 + 0.3 * math.sin(k * 1.7); hgt = 0.14 + 0.06 * ((k * 5) % 3) / 2; w0 = 0.016 + 0.004 * (k % 2); bend = 0.03 + 0.012 * (k % 3); r0 = 0.012 + 0.018 * (k % 2)
        fn = S('leaf' if k % 2 else 'leaf_dark'); Ml = T(px, py + 0.09, pz) @ Ry(a)
        pts = []
        for m in range(6):
            f = m / 5; c = np.array((0.0, hgt * f, r0 + bend * f * f)); w = w0 * (1 - f ** 1.6) + 0.0005
            pts.append((c + np.array((-w, 0, 0)), c + np.array((w, 0, 0))))
        for m in range(5):
            (a0, b0), (a1, b1) = pts[m], pts[m + 1]
            q = [Ml[:3, :3] @ v + Ml[:3, 3] for v in (a0, b0, b1, a1)]; nrm = Ml[:3, :3] @ np.array((0, 0, 1.0))
            pm.poly(q, [fn(0.5, 0.5)] * 4, tuple(nrm)); pm.poly(q[::-1], [fn(0.5, 0.5)] * 4, tuple(-nrm))
    # 第四層：兩個相框（只有色塊），往後靠一點
    for (x, w, hgt, name) in ((-0.17, 0.13, 0.18, 'frame_a'), (0.05, 0.16, 0.12, 'frame_b')):
        rbox(pm, -w / 2, w / 2, 0, hgt, -0.008, 0.008, {'f': R(name), '*': S('frame_black')}, r=0.003, seg=1, M=T(x, 1.32, -0.12) @ Rx(math.radians(-9)))
    return pm


def tvstand():
    """黑色電視櫃 1.1×0.4×0.5：頂板、底板、兩側、兩片隔板、背板；左右兩扇門＋小把手、中間開放格（一片層板）；四個小腳；上面一台關著的電視（約 43 吋）"""
    pm = PM(); fn = R('blackwood'); uvw = {'*': fn}; hx, hz, H = 0.55, 0.2, 0.5
    for sx in (-1, 1):
        for sz_ in (-1, 1): box(pm, sx * (hx - 0.05) - 0.02, sx * (hx - 0.05) + 0.02, 0, 0.06, sz_ * (hz - 0.04) - 0.02, sz_ * (hz - 0.04) + 0.02, {'*': S('black_plastic')})
    rbox(pm, -hx, hx, H - 0.03, H, -hz, hz + 0.01, uvw, r=0.005, seg=2)          # 頂板（往前多出 1 cm）
    rbox(pm, -hx + 0.02, hx - 0.02, 0.06, 0.085, -hz, hz, uvw, r=0.003, seg=1)  # 底板
    for sx in (-1, 1):
        sx0, sx1 = (hx - 0.02, hx) if sx > 0 else (-hx, -hx + 0.02)
        rbox(pm, sx0, sx1, 0.06, H - 0.03, -hz, hz, uvw, r=0.003, seg=1)   # 兩側
        rbox(pm, sx * 0.18 - 0.01, sx * 0.18 + 0.01, 0.085, H - 0.03, -hz + 0.01, hz - 0.01, uvw, r=0.002, seg=1)   # 隔板
        x0, x1 = (0.19, hx - 0.025) if sx > 0 else (-hx + 0.025, -0.19)
        rbox(pm, x0, x1, 0.095, H - 0.04, hz - 0.018, hz, uvw, r=0.003, seg=1)   # 門
        kx = 0.215 if sx > 0 else -0.215
        lathe(pm, [(0.008, 0.0, 0.008, 0.012, S('knob'), 'out'), (0.008, 0.012, 0.0, 0.014, S('knob'), 'up')], 8, M=T(kx, 0.29, hz) @ Rx(math.pi / 2))
    box(pm, -hx + 0.02, hx - 0.02, 0.085, H - 0.03, -hz, -hz + 0.01, uvw)        # 背板
    rbox(pm, -0.17, 0.17, 0.27, 0.288, -hz + 0.01, hz - 0.02, uvw, r=0.002, seg=1)   # 中間開放格的層板
    # 電視：底座、支柱、面板（正面是螢幕）
    box(pm, -0.15, 0.15, H, H + 0.012, -0.1, 0.06, {'*': S('tv_black')})
    box(pm, -0.03, 0.03, H + 0.012, H + 0.1, -0.035, -0.015, {'*': S('tv_black')})
    rbox(pm, -0.485, 0.485, H + 0.08, H + 0.64, -0.01, 0.025, {'f': R('tv_screen'), '*': S('tv_black')}, r=0.004, seg=1)
    return pm


def barstool():
    """吧台高腳椅：鍍鉻四腳（往外張一點）＋踏圈；黑色椅盤＋座墊（面高 0.76）；兩支鍍鉻撐著低椅背（往後靠、兩邊往前包）"""
    pm = PM(); ch = S('chrome'); y_pan = 0.69
    tops = [(sx * 0.165, y_pan, sz_ * 0.155) for sx in (-1, 1) for sz_ in (-1, 1)]; feet = [(sx * 0.215, 0.0, sz_ * 0.205) for sx in (-1, 1) for sz_ in (-1, 1)]
    for a, b in zip(tops, feet): sweep(pm, [b, a], 0.011, 6, ch)
    yr = 0.28; ring = []
    for (a, b) in zip(tops, feet):
        t = yr / y_pan; ring.append(tuple(np.array(b) + (np.array(a) - np.array(b)) * t))
    ring = [ring[0], ring[1], ring[3], ring[2]]   # 繞一圈的順序
    sweep(pm, ring, 0.009, 6, ch, caps=False, closed=True)
    rbox(pm, -0.19, 0.19, y_pan, y_pan + 0.018, -0.18, 0.18, {'*': S('black_plastic')}, r=0.008, seg=1)
    cushion(pm, 0.40, 0.055, 0.38, 0.025, k=(1, 0, 1), sag=0.008, bulge=0.03, uv=CUSH_SEAT, M=T(0, y_pan + 0.018 + 0.0275, 0.0))
    for sx in (-1, 1): sweep(pm, [(sx * 0.12, y_pan + 0.01, -0.16), (sx * 0.12, 0.82, -0.2), (sx * 0.12, 0.88, -0.215)], 0.009, 6, ch)
    cushion(pm, 0.38, 0.15, 0.045, 0.02, k=(1, 1, 0), sag=0.0, bulge=0.02, bend=0.035, uv=CUSH_BACK, skip=(), M=T(0, 0.94, -0.22) @ Rx(math.radians(-8)))
    return pm


def ceilingfan():
    """白色五葉吊扇＋四個燈罩；原點＝吸頂座的頂面中央（天花板），往 −y；回傳（不透明網格, 發光網格）"""
    pm = PM(); gl = PM(); wp = S('white_paint')
    lathe(pm, [(0.0, 0.0, 0.075, 0.0, wp, 'up'), (0.075, 0.0, 0.075, -0.012, wp, 'out'), (0.075, -0.012, 0.06, -0.05, wp, 'out'), (0.06, -0.05, 0.022, -0.062, wp, 'out'), (0.022, -0.062, 0.0, -0.064, wp, 'down')], 16)   # 吸頂座
    lathe(pm, [(0.011, -0.06, 0.011, -0.172, wp, 'out')], 8)   # 吊桿
    lathe(pm, [(0.0, -0.17, 0.035, -0.17, wp, 'up'), (0.035, -0.17, 0.11, -0.19, wp, 'out'), (0.11, -0.19, 0.125, -0.215, wp, 'out'), (0.125, -0.215, 0.122, -0.25, wp, 'out'),
               (0.122, -0.25, 0.075, -0.275, wp, 'out'), (0.075, -0.275, 0.05, -0.285, wp, 'out')], 18)   # 馬達外殼
    for k in range(5):
        a = 2 * math.pi * k / 5
        box(pm, 0.1, 0.19, -0.236, -0.228, -0.018, 0.018, {'*': S('metal_dark')}, M=Ry(a))   # 葉片的鐵架
        rbox(pm, -0.255, 0.255, -0.004, 0.004, -0.065, 0.065, {'*': S('blade')}, r=0.003, seg=1, M=Ry(a) @ T(0.405, -0.226, 0) @ Rx(math.radians(12)))   # 葉片（斜 12°）
    lathe(pm, [(0.05, -0.285, 0.056, -0.3, wp, 'out'), (0.056, -0.3, 0.036, -0.33, wp, 'out'), (0.036, -0.33, 0.0, -0.336, wp, 'down')], 14)   # 燈座
    for k in range(4):
        a = 2 * math.pi * (k + 0.5) / 4; M = Ry(a)
        P = [M[:3, :3] @ np.array(p) for p in ((0.03, -0.31, 0.0), (0.09, -0.325, 0.0), (0.15, -0.345, 0.0), (0.17, -0.36, 0.0))]
        sweep(pm, P, 0.007, 5, wp)                      # 燈臂
        c = M[:3, :3] @ np.array((0.17, 0.0, 0.0)); Ms = T(c[0], 0, c[2])
        lathe(pm, [(0.018, -0.355, 0.024, -0.362, wp, 'out'), (0.024, -0.362, 0.055, -0.395, S('fan_glass'), 'out'), (0.055, -0.395, 0.066, -0.418, S('fan_glass'), 'out'),
                   (0.066, -0.418, 0.06, -0.42, S('fan_glass'), 'down')], 12, M=Ms)   # 鬱金香形的燈罩（開口朝下）
        lathe(gl, [(0.02, -0.364, 0.051, -0.396, S('fan_glass'), 'in'), (0.051, -0.396, 0.059, -0.417, S('fan_glass'), 'in')], 12, M=Ms)   # 燈罩內面（發光）
    return pm, gl


ITEMS = {'US_SOFA': sofa, 'US_ARMCHAIR': armchair, 'US_COFFEE': coffee, 'US_ENDTABLE': endtable, 'US_RUG': rug, 'US_LADDER': ladder,
         'US_TVSTAND': tvstand, 'US_BARSTOOL': barstool, 'US_CEILINGFAN': ceilingfan}
GLOW = {'US_ENDTABLE': 'US_ENDTABLE_GLOW', 'US_CEILINGFAN': 'US_CEILINGFAN_GLOW'}
# 第 9 節補強：家具底下地面的 AO（子節點，材質 US_ao：黑色＋透明度漸層）：(子節點名, 寬 x, 深 z, 往外漸層的距離)；離地 1.1 cm（地毯頂面 0.8 cm 之上）
AO = {'US_SOFA': ('US_SOFA_AO', 2.0, 0.9, 0.11), 'US_TVSTAND': ('US_TVSTAND_AO', 1.1, 0.4, 0.08)}


def ao_decal(W, D, m, y=0.011):
    """九宮格的貼片：裡面（家具底下）透明度 0.55，往外 m 公尺漸層到 0；邊在家具外緣往內 2 cm 開始淡"""
    pm = PM(); xs = [-W / 2 - m, -W / 2 + 0.02, W / 2 - 0.02, W / 2 + m]; zs = [-D / 2 - m, -D / 2 + 0.02, D / 2 - 0.02, D / 2 + m]; us = [0.0, 0.25, 0.75, 1.0]
    for i in range(3):
        for j in range(3):
            pts = [(xs[i], y, zs[j]), (xs[i + 1], y, zs[j]), (xs[i + 1], y, zs[j + 1]), (xs[i], y, zs[j + 1])]
            pm.poly(pts, [(us[i], us[j]), (us[i + 1], us[j]), (us[i + 1], us[j + 1]), (us[i], us[j + 1])], (0, 1, 0))
    return pm
# GLB 裡的位置只是排成一個客廳給人看（遊戲裡的位置照 us_apartment_layout.js）：(x, y, z, 轉角°)
SPREAD = {'US_RUG': (0.0, 0.0, 0.0, -90), 'US_SOFA': (0.0, 0.0, -1.1, 0), 'US_COFFEE': (0.0, 0.0, 0.15, 90), 'US_ARMCHAIR': (1.65, 0.0, -0.75, -40),
          'US_ENDTABLE': (-1.4, 0.0, -1.2, 0), 'US_LADDER': (-2.3, 0.0, -1.4, 0), 'US_TVSTAND': (2.5, 0.0, 0.85, -90), 'US_BARSTOOL': (-2.2, 0.0, 0.6, 30),
          'US_CEILINGFAN': (0.0, 2.6, 0.1, 0)}
BUDGET = {'US_SOFA': 3750, 'US_ARMCHAIR': 1700, 'US_COFFEE': 800, 'US_ENDTABLE': 1500, 'US_RUG': 500, 'US_LADDER': 1400, 'US_TVSTAND': 900, 'US_BARSTOOL': 950, 'US_CEILINGFAN': 1500}
TOTAL_BUDGET = 12000
SMOOTH = {'US_SOFA': 0.9, 'US_ARMCHAIR': 0.9, 'US_BARSTOOL': 0.9, 'US_LADDER': 0.9, 'US_ENDTABLE': 1.0, 'US_CEILINGFAN': 1.0}   # 座墊、抱枕、葉子是格子或體素網格：角度放寬，不留稜


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('us_living_props', props={'kind': 'us_living_props'})
    mat = bpy.data.materials.new('us_living'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    glow = bpy.data.materials.new('US_glow'); glow.use_nodes = True; gb = glow.node_tree.nodes['Principled BSDF']
    gb.inputs['Base Color'].default_value = (1.0, 0.86, 0.66, 1.0); gb.inputs['Roughness'].default_value = 0.9; gb.inputs['Metallic'].default_value = 0.0
    for key in ('Emission Color', 'Emission'):
        if key in gb.inputs: gb.inputs[key].default_value = (1.0, 0.82, 0.58, 1.0); break
    if 'Emission Strength' in gb.inputs: gb.inputs['Emission Strength'].default_value = 1.5
    ao = bpy.data.materials.new('US_ao'); ao.use_nodes = True; ab = ao.node_tree.nodes['Principled BSDF']
    ab.inputs['Base Color'].default_value = (0.0, 0.0, 0.0, 1.0); ab.inputs['Roughness'].default_value = 1.0
    if 'Specular IOR Level' in ab.inputs: ab.inputs['Specular IOR Level'].default_value = 0.0
    at = ao.node_tree.nodes.new('ShaderNodeTexImage'); at.image = bpy.data.images.load(AO_PNG); at.image.pack(); ao.node_tree.links.new(at.outputs['Alpha'], ab.inputs['Alpha'])
    try: ao.surface_render_method = 'BLENDED'
    except Exception: ao.blend_method = 'BLEND'
    mods = {}; over = []
    for name, fn in ITEMS.items():
        r = fn(); pm, gl = r if isinstance(r, tuple) else (r, None)
        ob = to_blender(pm, name, (mat,), root, SMOOTH.get(name, 0.6)); x, y, z, a = SPREAD[name]; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if gl is not None:
            gob = to_blender(gl, GLOW[name], (glow,), ob, 0.9); gob.location = (0, 0, 0)
            gt = sum(len(p.vertices) - 2 for p in gob.data.polygons); mods[name]['glow'] = {'node': GLOW[name], 'tris': gt}; mods[name]['tris_total'] = tris + gt
        if name in AO:
            an, W, D, m = AO[name]; aob = to_blender(ao_decal(W, D, m), an, (ao,), ob, 0.1); aob.location = (0, 0, 0)
            at_ = sum(len(p.vertices) - 2 for p in aob.data.polygons); mods[name]['ao'] = {'node': an, 'tris': at_}; mods[name]['tris_total'] = mods[name].get('tris_total', tris) + at_
        if mods[name].get('tris_total', tris) > BUDGET[name]: over.append((name, mods[name].get('tris_total', tris)))
    total = sum(m.get('tris_total', m['tris']) for m in mods.values())
    print('TRIS', json.dumps({k: v.get('tris_total', v['tris']) for k, v in mods.items()}), total, flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 3
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '底部中央、y=0＝地面、正面（坐的人臉朝的方向、櫃門那一面）朝 +z；GLB 裡的位置只是排開給人看（SPREAD）',
                       'US_COFFEE': '0.6（x）×1.1（z），長邊沿 z', 'US_RUG': '2.0（x）×2.6（z），+x+z 的角和 −x 的邊微翹',
                       'US_LADDER': '背面（貼牆）朝 −z：後面兩支直的在 z=−0.21，前面兩支斜到 z=+0.21；寬 0.6、高 1.8',
                       'US_ENDTABLE': '桌燈在桌面上（底座中心在 x=−0.04、z=−0.05）；子節點 US_ENDTABLE_GLOW＝燈罩內面（US_glow 材質）',
                       'US_TVSTAND': '電視在櫃子上（螢幕朝 +z）；子節點 US_TVSTAND_AO＝櫃子底下的地面 AO（US_ao）',
                       'US_SOFA': '右邊扶手上披著一條毯子（生活痕跡）；子節點 US_SOFA_AO＝沙發底下的地面 AO（US_ao：黑色＋透明度漸層，離地 1.1 cm；不要投影）', 'US_BARSTOOL': '椅面高 0.76；椅背在 −z',
                       'US_CEILINGFAN': '原點＝吸頂座的頂面中央（貼天花板），往 −y 長 0.42；葉片直徑 1.32；子節點 US_CEILINGFAN_GLOW＝四個燈罩內面'}
    info['note'] = ('兩個材質：us_living（底色 1024＋ORM 256，metal 最高 0.40；皮＝Poly Haven fabric_leather_02、木＝walnut_veneer、地毯纖維＝dirty_carpet，都是 CC0）、'
                    'US_glow（燈罩內面，奶油色＋發光，亮度由遊戲控制）；每件一個網格，兩件有發光的子節點')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v.get('tris_total', v['tris']) for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
