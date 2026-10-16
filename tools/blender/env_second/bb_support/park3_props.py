"""ART-PARK3 溫州街小公園剩下還像積木的三樣（LAWWW2-B 分派 2026-10-16 16:11；BB-B 支援製作；做法同 ART-PARK1 park_play_props.py：一張底色貼圖集＋ORM、網格工具照抄）
  /opt/blenv/bin/python tools/blender/env_second/bb_support/park3_props.py [-- --out assets/models/env/second_ai/bb_support/park3_props.glb]

換掉 wz_park.py 用圓柱、方塊拼的涼亭石桌石凳、直飲台、腳踏車架。標準照 LAWWW2-B 的 SCENE_RULES.md 第 9 節（「得獎遊戲」那一份清單）。
每件一個頂層節點，原點都在底部中央（地面）：
  PARK_CHESS_TABLE  涼亭裡的圓形花崗岩象棋桌。高 0.66（LAWWW2-B 擺在涼亭石基座 y 0.14 上，桌面到 0.80）；桌面直徑 1.00、厚 8 cm、邊緣倒角；
                    桌腳是束腰的石柱（旋轉體）＋圓座。桌面上淺刻象棋盤：9×10 線、九宮斜線、炮和兵的位置記號、外框；
                    河和本地 x 平行（下棋的人坐 ±z），「楚河」給 +z 那一側的人看、「漢界」給 −z 那一側，各自轉 180°（台灣公園石桌常見的刻法）。
                    磨損：桌邊四個方向手肘的地方比較亮、比較滑；桌緣一圈手摸亮；靠桌角一個淡淡的杯子印。
  PARK_STOOL        鼓形石凳（旋轉體，腰微凸、上下倒角）。高 0.41（座面到 0.55）、最大半徑 0.215；座面中間被坐亮。LAWWW2-B 複製四個，擺在離桌心 0.95 的四個方向。
  PARK_FOUNTAIN     不鏽鋼直飲台。混凝土底座 0.55×0.55×0.07（倒角、落地處和前面滴水的地方發暗）；拉絲不鏽鋼柱身（旋轉體）往上張開成接水盆（有厚度、盆底排水孔）；
                    鵝頸出水口在盆的後側、往前彎；+z 那一側（人站的地方）盆緣下一顆按壓鈕（被按到發亮）；底座前面一個鑄鐵排水蓋。盆裡一圈水漬。高 1.02（出水口頂），盆緣 0.95。
  PARK_BIKE_RACK    四格的倒 U 形熱浸鍍鋅鋼管（格距 0.7，z −1.05、−0.35、0.35、1.05；寬 0.5、高 0.72），腳埋在一條 0.68×2.56、高 3.5 cm 的混凝土墊上，腳下一圈焊接套；
                    第二格（z −0.35）的橫桿上掛一把 U 型鎖（沒有字）。墊上畫鏽水（從管腳往 +x 流）、四條輪胎壓過的泥痕、邊角的灰。管子兩端鏽、頂端被車子磨亮。
沒有字（棋盤的楚河漢界除外）、品牌、標誌（D77）。材質一個：park3（1024 底色貼圖集＋256 ORM；metal 最高 0.40：不鏽鋼 0.35、鍍鋅 0.30、鎖 0.30）。
貼圖：花崗岩＝Poly Haven granite_tile_03 的顆粒明暗（取一片磚裡面、鏡像接，避開磚縫），混凝土＝Poly Haven granular_concrete，都是 CC0（tools/blender/textures/）；
拉絲紋、鍍鋅花、鏽水、泥、水漬、磨亮、杯子印是 numpy／PIL 畫的；棋盤的「楚河」「漢界」用文泉驛正黑（系統字型，GPLv2＋字型例外）渲染成貼圖，不嵌字型檔。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/park3_props.glb'
TEXB = os.path.join(HERE, 'textures')
GEN = os.path.join(TEXB, 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'park3_props_{k}.png') for k in ('atlas', 'orm'))
TEXR = os.path.join(os.path.dirname(PARENT), 'textures')
SRC = {'granite': os.path.join(TEXR, 'granite_tile_03', 'granite_tile_03_diff_1k.jpg'),
       'concrete': os.path.join(TEXR, 'granular_concrete', 'granular_concrete_diff_1k.jpg')}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

GRANITE = (150, 146, 140)        # 淺灰偏暖的花崗岩（公園石桌常見的那種，曬過、不是新的）；在遊戲的太陽下不能過曝（SOP 第 11 節第 10 點）
CONC = (138, 136, 130)
STEEL = (170, 173, 177)          # 白鐵、鍍鋅：遊戲內截圖（16:5x）金屬度 0.3～0.35＋底色 120～130 幾乎是黑的（遊戲沒有環境貼圖，金屬的部分只剩直射光的高光）；
GALV = (162, 166, 168)           # 改成底色亮一點、金屬度 0.15～0.2，在遊戲裡才是銀灰（舊版程序化的 stain 也比 v1 亮）。Blender 預覽會偏白（SOP 第 13 節第 4 點：以遊戲內為準）
RUST = (128, 80, 48)
MUD = (92, 78, 62)

# ---- 剖面（r, y），從地面往上；旋轉體用 ----
TABLE_PROF = [(0.235, 0.0), (0.242, 0.012), (0.242, 0.042), (0.228, 0.058),                                   # 圓座（倒角）
              (0.205, 0.068), (0.178, 0.098), (0.156, 0.15), (0.142, 0.22), (0.138, 0.30), (0.143, 0.38),     # 束腰
              (0.158, 0.44), (0.18, 0.49), (0.198, 0.53), (0.208, 0.555), (0.206, 0.572), (0.198, 0.58),      # 上面收邊
              (0.46, 0.58),                                                                                  # 桌面底下（水平往外）
              (0.488, 0.587), (0.5, 0.604), (0.5, 0.644), (0.492, 0.656), (0.48, 0.66)]                         # 桌緣（上下倒角）
TABLE_TOP_R = 0.48
STOOL_PROF = [(0.185, 0.0), (0.192, 0.01), (0.193, 0.03), (0.2, 0.06), (0.21, 0.11), (0.215, 0.19), (0.213, 0.26),
              (0.206, 0.32), (0.196, 0.36), (0.192, 0.385), (0.186, 0.401), (0.172, 0.41)]
STOOL_TOP_R = 0.172
# 直飲台：柱身（steel）→ 接水盆外側（steel）→ 盆緣 → 盆內（basin）→ 排水孔
FOUNT_PROF = [(0.098, 0.07), (0.099, 0.082), (0.088, 0.09), (0.076, 0.096), (0.072, 0.20), (0.07, 0.78), (0.074, 0.815),
              (0.1, 0.845), (0.15, 0.875), (0.188, 0.903), (0.204, 0.924), (0.211, 0.94), (0.207, 0.951), (0.197, 0.953)]
BASIN_PROF = [(0.197, 0.953), (0.186, 0.94), (0.165, 0.924), (0.13, 0.91), (0.09, 0.9), (0.05, 0.894), (0.026, 0.891)]
DRAIN_R = 0.026
SLOTS = (-1.05, -0.35, 0.35, 1.05)
LOCK_SLOT = -0.35

REG = {
    'board': (0, 0, 512, 512),          # 桌面（上視，x 往右、z 往上）：花崗岩＋淺刻棋盤＋手肘磨亮＋杯子印
    'gr_table': (512, 0, 768, 256),     # 桌腳與桌緣側面（s 繞一圈、t 沿剖面從地面往上）：落地處髒、桌面底下 AO
    'gr_stool': (768, 0, 1024, 256),    # 凳子側面（同上）
    'stool_top': (512, 256, 640, 384),  # 凳面（上視）：中間被坐亮
    'conc_side': (640, 256, 768, 384),  # 直飲台底座側面（t=0 地面）：落地處髒、前面滴水
    'conc_top': (768, 256, 896, 384),   # 底座上面（上視）：前面滴水的濕痕
    'grate': (896, 256, 1024, 384),     # 鑄鐵排水蓋（上視）：五條縫
    'steel': (512, 384, 768, 640),      # 不鏽鋼柱身＋盆外側（s 繞一圈、t 沿剖面往上）：直向拉絲紋、下面水痕
    'basin': (768, 384, 896, 512),      # 盆內（t 從盆緣到排水孔）：水漬一圈、盆底灰
    'galv': (768, 512, 1024, 640),      # 鍍鋅管（s 沿管子從一腳到另一腳、t 繞管）：鋅花、兩端鏽和泥、頂端磨亮
    'pad': (0, 512, 128, 1024),         # 車架混凝土墊上面（s＝x、t＝z）：鏽水、輪胎泥痕、邊角灰
}
SW = {
    'gr_dark': ((112, 108, 102), 0.62, 0.0), 'iron': ((58, 58, 60), 0.7, 0.2), 'drain_hole': ((22, 22, 24), 0.9, 0.0),
    'button': ((182, 184, 186), 0.16, 0.2), 'spout': ((168, 170, 174), 0.24, 0.2), 'spout_tip': ((132, 134, 136), 0.5, 0.18),
    'collar': ((138, 140, 140), 0.55, 0.15), 'lock_steel': ((92, 94, 98), 0.4, 0.22), 'lock_body': ((30, 30, 32), 0.6, 0.0),
    'lock_core': ((168, 146, 86), 0.3, 0.35), 'pad_side': ((120, 118, 112), 0.9, 0.0),
}
SW_CELL, SW_X0, SW_Y0 = 32, 128, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = (SW_X0 + (i % 8) * SW_CELL, SW_Y0 + (i // 8) * SW_CELL, SW_X0 + (i % 8) * SW_CELL + SW_CELL, SW_Y0 + (i // 8) * SW_CELL + SW_CELL)
ROUGH = {}   # 區塊 → (粗糙度陣列 0~1，內部解析度) 或 (常數, 金屬)
CONST = {'gr_table': (0.6, 0.0), 'gr_stool': (0.6, 0.0), 'conc_side': (0.88, 0.0), 'conc_top': (0.86, 0.0), 'grate': (0.72, 0.2)}
METALS = {'steel': 0.18, 'basin': 0.18, 'galv': 0.15}


# ================= 剖面工具 =================
def arclen(prof):
    d = [0.0]
    for (r0, y0), (r1, y1) in zip(prof, prof[1:]): d.append(d[-1] + math.hypot(r1 - r0, y1 - y0))
    return d


# ================= 貼圖 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def norm(a): return (a - a.mean()) / max(1e-6, a.std())


def soft(w, h, seed, scale=24, blur=6):
    rng = np.random.default_rng(seed); a = rng.normal(0, 1, (max(2, h // scale), max(2, w // scale))).astype(np.float32)
    im = Image.fromarray(((a - a.min()) / max(1e-6, a.max() - a.min()) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur))
    return norm(np.asarray(im, np.float32))


def granite_lum(w, h, mw, mh):
    """granite_tile_03 取一片磚的內部（避開磚縫）、鏡像接成無縫；照公尺換算顆粒大小（來源約 1024 px／公尺）"""
    im = Image.open(SRC['granite']).convert('L').crop((14, 14, 328, 496)); a = np.asarray(im, np.float32)
    t = np.concatenate([a, a[:, ::-1]], 1); t = np.concatenate([t, t[::-1]], 0)
    sc = (w / mw) / 1024.0; th, tw = max(8, int(t.shape[0] * sc)), max(8, int(t.shape[1] * sc))
    t = np.asarray(Image.fromarray(t.astype(np.uint8)).resize((tw, th), Image.LANCZOS), np.float32)
    a = np.tile(t, (h // th + 2, w // tw + 2))[:h, :w]
    lo = np.asarray(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(max(2.0, w / mw * 0.012))), np.float32)
    fine = norm(a - lo)                                                                        # 只留細顆粒（鏡像接的大塊明暗會看出對稱，丟掉）
    return norm(fine + 0.45 * soft(w, h, int(w * 7 + h), scale=max(8, int(w / mw * 0.08)), blur=max(2, w / mw * 0.03)))   # 大的明暗自己加（不對稱）


def concrete_lum(w, h, mw):
    im = Image.open(SRC['concrete']).convert('L'); a = np.asarray(im, np.float32)
    sc = (w / mw) / 1024.0 * 1.4; s = max(8, int(1024 * sc)); a = np.asarray(Image.fromarray(a.astype(np.uint8)).resize((s, s), Image.LANCZOS), np.float32)
    return norm(np.tile(a, (h // s + 2, w // s + 2))[:h, :w])


def rgb(base, z, k):
    return np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]


def to_img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def put(P, name, img): P.paste(img, (REG[name][0] * SS, REG[name][1] * SS))


def blob(X, Y, cx, cy, s): return np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * s * s))


def paint_board():
    """上視畫布：右＝+x、下＝+z（下棋的 +z 那一側坐在畫布下面）；最後上下翻轉成貼圖（貼圖上面是 +z）"""
    W = H = 512 * SS; px = lambda x, z: ((x + 0.5) * W, (z + 0.5) * H)
    X, Z = np.meshgrid((np.arange(W) + 0.5) / W - 0.5, (np.arange(H) + 0.5) / H - 0.5)
    base = rgb(GRANITE, granite_lum(W, H, 1.0, 1.0), 0.06)
    R = np.hypot(X, Z)
    wear = np.zeros_like(X)
    for (cx, cz) in [(sx * 0.15, sz_ * 0.42) for sx in (-1, 1) for sz_ in (-1, 1)] + [(sx * 0.42, sz_ * 0.15) for sx in (-1, 1) for sz_ in (-1, 1)]:
        wear = np.maximum(wear, blob(X, Z, cx, cz, 0.05))
    wear = np.maximum(wear, np.clip((R - 0.43) / 0.05, 0, 1) * 0.55)                      # 桌緣一圈手摸
    base *= (1 + 0.06 * wear)[..., None]
    # 杯子印（淡、斷斷續續的一圈）
    ring = np.exp(-((np.hypot(X - 0.33, Z - 0.22) - 0.034) / 0.0035) ** 2) * (0.5 + 0.5 * np.clip(soft(W, H, 11, scale=10, blur=3), -1, 1))
    base *= (1 - 0.09 * np.clip(ring, 0, 1))[..., None]
    # 棋盤：先畫在遮罩上（1＝刻線），再變成刻痕（暗）＋下緣一點亮邊
    M = Image.new('L', (W, H), 0); d = ImageDraw.Draw(M); lw = max(3, int(0.0036 * W))
    xs = [-0.24 + 0.06 * i for i in range(9)]; zs = [-0.27 + 0.06 * j for j in range(10)]
    for j, z in enumerate(zs): d.line([px(xs[0], z), px(xs[-1], z)], fill=255, width=lw)
    for i, x in enumerate(xs):
        if i in (0, 8): d.line([px(x, zs[0]), px(x, zs[-1])], fill=255, width=lw)
        else:
            d.line([px(x, zs[0]), px(x, zs[4])], fill=255, width=lw); d.line([px(x, zs[5]), px(x, zs[9])], fill=255, width=lw)
    for (a, b) in (((3, 0), (5, 2)), ((5, 0), (3, 2)), ((3, 7), (5, 9)), ((5, 7), (3, 9))):
        d.line([px(xs[a[0]], zs[a[1]]), px(xs[b[0]], zs[b[1]])], fill=255, width=lw)
    fr = 0.016; d.rectangle([px(xs[0] - fr, zs[0] - fr), px(xs[-1] + fr, zs[-1] + fr)], outline=255, width=lw + 1)
    g, L_ = 0.006, 0.014                                                                      # 炮、兵的位置記號（交叉點四角的小直角）
    marks = [(1, 2), (7, 2), (1, 7), (7, 7)] + [(i, j) for i in (0, 2, 4, 6, 8) for j in (3, 6)]
    for (i, j) in marks:
        x, z = xs[i], zs[j]
        for sx in (-1, 1):
            if (i == 0 and sx < 0) or (i == 8 and sx > 0): continue
            for sz_ in (-1, 1):
                d.line([px(x + sx * g, z + sz_ * g), px(x + sx * (g + L_), z + sz_ * g)], fill=255, width=lw)
                d.line([px(x + sx * g, z + sz_ * g), px(x + sx * g, z + sz_ * (g + L_))], fill=255, width=lw)
    font = ImageFont.truetype(FONT, int(0.04 * W), index=0)
    for text, cx, rot in (('楚　河', -0.12, 0), ('漢　界', 0.12, 180)):
        tw, th = int(0.2 * W), int(0.056 * H); T = Image.new('L', (tw, th), 0); dt = ImageDraw.Draw(T)
        bb = dt.textbbox((0, 0), text, font=font); dt.text(((tw - (bb[2] - bb[0])) / 2 - bb[0], (th - (bb[3] - bb[1])) / 2 - bb[1]), text, font=font, fill=255)
        if rot: T = T.rotate(rot)
        x0, y0 = px(cx, 0.0); M.paste(255, (int(x0 - tw / 2), int(y0 - th / 2)), T)
    m = np.asarray(M.filter(ImageFilter.GaussianBlur(0.7 * SS)), np.float32) / 255.0
    hi = np.roll(m, 2 * SS, axis=0) - m                                                       # 刻痕靠 +z 那一邊的亮邊（光從 −z 上方來）
    base = base * (1 - 0.56 * m)[..., None] + 20 * np.clip(hi, 0, 1)[..., None]
    rough = 0.55 - 0.2 * wear + 0.2 * m
    return ImageOps.flip(to_img(base)), np.flipud(rough)


def paint_side(name, prof, seed):
    """旋轉體側面：t 沿剖面（弧長）從地面往上；落地處髒＋接合處、凹處 AO"""
    w, h = sz(name); t = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h; T = np.repeat(t[:, None], w, 1)
    d = arclen(prof); tot = d[-1]; frac = [v / tot for v in d]
    base = rgb(GRANITE, granite_lum(w, h, 1.2, tot), 0.06)
    dirt = np.clip((0.06 - T) / 0.06, 0, 1) ** 1.3 * (0.75 + 0.25 * soft(w, h, seed, scale=8, blur=2))
    ao = np.zeros_like(T)
    if name == 'gr_table':                                                                   # 桌面底下、柱子和桌面接合處暗
        i0 = 15; ao += np.clip(1 - np.abs(T - frac[i0]) / 0.07, 0, 1) * 0.8
        ao += ((T > frac[15]) & (T < frac[16])) * 0.35
        ao += np.clip(1 - np.abs(T - frac[4]) / 0.03, 0, 1) * 0.4                             # 圓座和柱子交界
    else:
        ao += np.clip(1 - np.abs(T - frac[3]) / 0.03, 0, 1) * 0.25
    a = base * (1 - 0.18 * np.clip(ao, 0, 1))[..., None] * (1 - 0.22 * dirt)[..., None] + np.array((14, 9, 2), np.float32) * dirt[..., None]
    return to_img(a)


def paint_stool_top():
    w, h = sz('stool_top'); X, Z = np.meshgrid((np.arange(w) + 0.5) / w - 0.5, (np.arange(h) + 0.5) / h - 0.5)
    base = rgb(GRANITE, granite_lum(w, h, 0.44, 0.44), 0.06); pol = blob(X, Z, 0.0, 0.0, 0.17)
    return to_img(base * (1 + 0.06 * pol)[..., None]), 0.55 - 0.2 * pol


def paint_steel():
    w, h = sz('steel'); rng = np.random.default_rng(21)
    st = rng.normal(0, 1, (h // 8, w)).astype(np.float32)                                    # 直向拉絲：橫向變化快、直向變化慢
    st = np.asarray(Image.fromarray(((st - st.min()) / (st.max() - st.min()) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6)), np.float32)   # 直向拉長 8 倍＝直的細紋
    st = norm(st); big = soft(w, h, 22, scale=40, blur=10)
    t = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h; T = np.repeat(t[:, None], w, 1)
    water = np.clip((0.12 - T) / 0.12, 0, 1) * (0.6 + 0.4 * soft(w, h, 23, scale=6, blur=1.5))   # 下面一截被濺到的水痕
    a = rgb(STEEL, st, 0.035) * (1 + 0.02 * big)[..., None] * (1 - 0.14 * water)[..., None]
    rough = 0.3 + 0.05 * np.clip(st, -2, 2) / 2 + 0.18 * water
    return to_img(a), rough


def paint_basin():
    w, h = sz('basin'); t = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h; T = np.repeat(t[:, None], w, 1)   # t=0 盆緣、t=1 排水孔
    z = soft(w, h, 31, scale=6, blur=1.5)
    ring = np.exp(-((T - 0.62) / 0.06) ** 2) * (0.7 + 0.3 * z)                              # 乾掉的水漬一圈
    bottom = np.clip((T - 0.7) / 0.3, 0, 1)
    a = rgb(STEEL, z, 0.02) * (1 - 0.1 * bottom - 0.12 * ring)[..., None] + np.array((10, 9, 4), np.float32) * ring[..., None]
    rough = 0.24 + 0.22 * ring + 0.1 * bottom
    return to_img(a), rough


def paint_galv():
    w, h = sz('galv'); s = (np.arange(w, dtype=np.float32) + 0.5) / w; S_ = np.repeat(s[None, :], h, 0)
    sp = soft(w, h, 41, scale=5, blur=1.2); big = soft(w, h, 42, scale=30, blur=6)
    ends = np.clip((0.08 - np.minimum(S_, 1 - S_)) / 0.08, 0, 1) ** 1.2 * (0.7 + 0.3 * soft(w, h, 43, scale=6, blur=1.5))
    top = np.exp(-((S_ - 0.5) / 0.16) ** 2)                                                   # 頂端被車子、手磨亮（淡、寬，不能像套了一截管子）
    a = rgb(GALV, sp, 0.05) * (1 + 0.03 * big)[..., None] * (1 + 0.035 * top)[..., None]
    a = a * (1 - 0.55 * ends)[..., None] + np.array(RUST, np.float32) * 0.55 * ends[..., None]
    rough = 0.5 + 0.05 * np.clip(sp, -2, 2) / 2 - 0.08 * top + 0.32 * ends
    return to_img(a), rough


def paint_pad():
    w, h = sz('pad'); X, Z = np.meshgrid(-0.34 + 0.68 * (np.arange(w) + 0.5) / w, 1.28 - 2.56 * (np.arange(h) + 0.5) / h)   # 貼圖上面是 +z
    base = rgb(CONC, concrete_lum(w, h, 0.68), 0.07)
    n = soft(w, h, 51, scale=6, blur=1.5)
    rust = np.zeros_like(X); mud = np.zeros_like(X)
    for z0 in SLOTS:
        for x0 in (-0.25, 0.25):
            rust = np.maximum(rust, blob(X, Z, x0, z0, 0.022))
            dx = X - x0; streak = np.exp(-((Z - z0) / 0.012) ** 2) * np.exp(-np.clip(dx, 0, None) / 0.09) * (dx > 0)   # 往 +x（排水的方向）流
            rust = np.maximum(rust, streak * 0.8)
        mud = np.maximum(mud, np.exp(-((Z - z0) / 0.022) ** 2) * np.clip(1 - np.abs(X) / 0.36, 0, 1) ** 0.4)       # 輪胎壓過的泥（沿 x）
    edge = np.clip(1 - np.minimum(0.34 - np.abs(X), 1.28 - np.abs(Z)) / 0.05, 0, 1)
    rust *= (0.7 + 0.3 * np.clip(n, -1, 1)); mud *= (0.55 + 0.45 * np.clip(n, -1, 1))
    a = base * (1 - 0.45 * rust - 0.3 * mud - 0.18 * edge)[..., None] + np.array(RUST, np.float32) * 0.45 * rust[..., None] + np.array(MUD, np.float32) * 0.3 * mud[..., None]
    return to_img(a)


def paint_conc(name):
    w, h = sz(name); base = rgb(CONC, concrete_lum(w, h, 0.55 if name == 'conc_top' else 0.6), 0.07)
    if name == 'conc_side':
        t = 1 - (np.arange(h, dtype=np.float32) + 0.5) / h; T = np.repeat(t[:, None], w, 1)
        dirt = np.clip((0.4 - T) / 0.4, 0, 1) * (0.7 + 0.3 * soft(w, h, 61, scale=6, blur=1.5))
        return to_img(base * (1 - 0.25 * dirt)[..., None])
    X, Z = np.meshgrid((np.arange(w) + 0.5) / w - 0.5, 0.5 - (np.arange(h) + 0.5) / h)       # 上面是 +z（前面）
    wet = blob(X, Z, 0.0, 0.22, 0.12) * (0.7 + 0.3 * soft(w, h, 62, scale=6, blur=1.5))      # 前面滴水、排水蓋旁邊
    return to_img(base * (1 - 0.22 * np.clip(wet, 0, 1))[..., None])


def paint_grate():
    w, h = sz('grate'); a = rgb((62, 62, 64), soft(w, h, 71, scale=5, blur=1.2), 0.08); im = to_img(a); d = ImageDraw.Draw(im)
    for k in range(5):
        x = (0.17 + k * 0.165) * w; d.rectangle([x - 0.04 * w, 0.12 * h, x + 0.04 * w, 0.88 * h], fill=(14, 14, 16))
    return im


def make_textures():
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); rough_full = {}
    img, r = paint_board(); put(P, 'board', img); rough_full['board'] = r
    put(P, 'gr_table', paint_side('gr_table', TABLE_PROF, 81)); put(P, 'gr_stool', paint_side('gr_stool', STOOL_PROF, 82))
    img, r = paint_stool_top(); put(P, 'stool_top', img); rough_full['stool_top'] = r
    img, r = paint_steel(); put(P, 'steel', img); rough_full['steel'] = r
    img, r = paint_basin(); put(P, 'basin', img); rough_full['basin'] = r
    img, r = paint_galv(); put(P, 'galv', img); rough_full['galv'] = r
    put(P, 'pad', paint_pad()); put(P, 'conc_side', paint_conc('conc_side')); put(P, 'conc_top', paint_conc('conc_top')); put(P, 'grate', paint_grate())
    d = ImageDraw.Draw(P)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0 * SS, y0 * SS, x1 * SS - 1, y1 * SS - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.resize((N, N), Image.LANCZOS).save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 200; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        a0, b0, a1, b1 = int(x0 * f), int(y0 * f), int(math.ceil(x1 * f)), int(math.ceil(y1 * f))
        if name in rough_full:
            r = Image.fromarray((np.clip(rough_full[name], 0, 1) * 255).astype(np.uint8)).resize((a1 - a0, b1 - b0), Image.BOX)
            orm[b0:b1, a0:a1, 1] = np.asarray(r); orm[b0:b1, a0:a1, 2] = int(min(METALS.get(name, 0.0), METAL) * 255)
        else:
            rough, metal = SW[name[3:]][1:] if name.startswith('sw_') else CONST.get(name, (0.88, 0.0) if name == 'pad' else (0.6, 0.0))
            orm[b0:b1, a0:a1, 1] = int(rough * 255); orm[b0:b1, a0:a1, 2] = int(min(metal, METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（照抄 park_play_props.py）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; ins = SW_CELL * 0.33 if name.startswith('sw_') else 0.6
    px = x0 + ins + min(1, max(0, s)) * (x1 - x0 - 2 * ins); py = y0 + ins + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * ins)
    return (px / N, 1 - py / N)


def R(name): return lambda s, t: ruv(name, s, t)
def S(name): return lambda s, t: ruv('sw_' + name, 0.5, 0.5)


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
            return {'t': ((x - x0) / W, (z - z0) / D), 'b': ((x - x0) / W, (z - z0) / D), 'f': ((x - x0) / W, (y - y0) / H),
                    'k': ((x1 - x) / W, (y - y0) / H), 'r': ((z1 - z) / D, (y - y0) / H), 'l': ((z - z0) / D, (y - y0) / H)}[key]
        sub.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm.add(sub, M)


def lathe2(pm, prof, n, region, rep=1, M=None):
    """剖面旋轉體：每一段的法線由剖面切線算（往外）；u 繞一圈重複 rep 次（n 要是 rep 的倍數，接縫落在格線上；rep 是偶數時相鄰兩段 u 來回翻）；v＝沿剖面的弧長比例"""
    assert n % rep == 0 and (rep == 1 or rep % 2 == 0)
    sub = PM(); d = arclen(prof); tot = d[-1]; per = n // rep
    for j in range(len(prof) - 1):
        (r0, y0), (r1, y1) = prof[j], prof[j + 1]; v0, v1 = d[j] / tot, d[j + 1] / tot
        dr, dy = r1 - r0, y1 - y0; nx, ny = dy, -dr
        for k in range(n):
            a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n; am = (a0 + a1) / 2
            u0 = (k % per) / per; u1 = u0 + 1 / per
            if (k // per) % 2: u0, u1 = 1 - u0, 1 - u1                                         # 來回翻（ping-pong）：相鄰兩段在交界取同一個 u，貼圖不會有接縫
            pts = [(r0 * math.cos(a0), y0, r0 * math.sin(a0)), (r0 * math.cos(a1), y0, r0 * math.sin(a1)), (r1 * math.cos(a1), y1, r1 * math.sin(a1)), (r1 * math.cos(a0), y1, r1 * math.sin(a0))]
            uvs = [ruv(region, u0, v0), ruv(region, u1, v0), ruv(region, u1, v1), ruv(region, u0, v1)]
            if r0 < 1e-6: pts, uvs = pts[1:], uvs[1:]
            elif r1 < 1e-6: pts, uvs = pts[:3], uvs[:3]
            sub.poly(pts, uvs, (nx * math.cos(am), ny, nx * math.sin(am)))
    return pm.add(sub, M)


def disk(pm, r, y, n, fn, M=None, up=True, rings=1):
    """平的圓盤（同心圓分圈，不做一個大多邊形）；fn(x, z)→uv"""
    sub = PM(); rs = [r * (k + 1) / rings for k in range(rings)]
    for k in range(n):
        a0, a1 = 2 * math.pi * k / n, 2 * math.pi * (k + 1) / n
        prev = None
        for i, rr in enumerate(rs):
            p0, p1 = (rr * math.cos(a0), y, rr * math.sin(a0)), (rr * math.cos(a1), y, rr * math.sin(a1))
            if prev is None: pts = [(0, y, 0), p0, p1]
            else: pts = [prev[0], p0, p1, prev[1]]
            sub.poly(pts, [fn(p[0], p[2]) for p in pts], (0, 1 if up else -1, 0)); prev = (p0, p1)
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
    L_ = [0.0]
    for i in range(1, n): L_.append(L_[-1] + float(np.linalg.norm(P[i] - P[i - 1])))
    tot = max(1e-9, L_[-1])
    for i in range(m):
        A, Bv = rings[i], rings[(i + 1) % n]; s0, s1 = L_[i] / tot, L_[min(i + 1, n - 1)] / tot
        for k in range(sides):
            k1 = (k + 1) % sides; c = (A[k] + A[k1] + Bv[k] + Bv[k1]) / 4; ctr = (P[i] + P[(i + 1) % n]) / 2
            sub.poly([A[k], A[k1], Bv[k1], Bv[k]], [fn(s0, k / sides), fn(s0, (k + 1) / sides), fn(s1, (k + 1) / sides), fn(s1, k / sides)], tuple(c - ctr))
    if caps and not closed:
        for idx, sgn in ((0, -1), (n - 1, 1)):
            tdir = P[min(idx + 1, n - 1)] - P[max(idx - 1, 0)]
            sub.poly(rings[idx], [fn(0.0 if idx == 0 else 1.0, 0.5)] * sides, tuple(tdir * sgn))
    return pm.add(sub, M)


def smooth_open(pts, it=2):
    for _ in range(it):
        out = [pts[0]]
        for a, b in zip(pts, pts[1:]):
            a, b = np.array(a), np.array(b); out += [tuple(0.75 * a + 0.25 * b), tuple(0.25 * a + 0.75 * b)]
        out.append(pts[-1]); pts = out
    return pts


def to_blender(pm, name, mats, parent, angle=0.6):
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    me.materials.append(mats[0])
    me.validate(clean_customdata=False); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
    bm.to_mesh(me); bm.free(); me.update()
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    L.smooth_mesh(ob, angle=angle)
    return ob


# ================= 物件 =================
def chess_table():
    pm = PM(); lathe2(pm, TABLE_PROF, 40, 'gr_table', rep=4)
    disk(pm, TABLE_TOP_R, TABLE_PROF[-1][1], 40, lambda x, z: ruv('board', 0.5 + x, 0.5 + z), rings=3)
    return pm


def stool():
    pm = PM(); lathe2(pm, STOOL_PROF, 28, 'gr_stool', rep=2)
    disk(pm, STOOL_TOP_R, STOOL_PROF[-1][1], 28, lambda x, z: ruv('stool_top', 0.5 + x / 0.44, 0.5 + z / 0.44), rings=2)
    return pm


def fountain():
    pm = PM()
    rbox(pm, -0.275, 0.275, 0.0, 0.07, -0.275, 0.275, {'t': R('conc_top'), '*': R('conc_side')}, r=0.012, seg=2)
    rbox(pm, -0.06, 0.06, 0.066, 0.074, 0.13, 0.245, {'t': R('grate'), '*': S('iron')}, r=0.003, seg=1)        # 前面的鑄鐵排水蓋（嵌在底座上）
    lathe2(pm, FOUNT_PROF, 24, 'steel', rep=2)
    lathe2(pm, BASIN_PROF, 24, 'basin', rep=2)
    disk(pm, DRAIN_R, BASIN_PROF[-1][1], 12, S('drain_hole'))
    # 鵝頸出水口：從盆後側（−z）的盆底長出來，往上、往前彎，出水口朝前下
    neck = smooth_open([(0, 0.896, -0.12), (0, 0.975, -0.12), (0, 1.012, -0.105), (0, 1.02, -0.07), (0, 1.0, -0.045), (0, 0.983, -0.038)], 1)
    lathe2(pm, [(0.022, 0.894), (0.022, 0.905), (0.014, 0.912), (0.0, 0.912)], 12, 'steel', rep=1, M=T(0, 0, -0.12))   # 出水口底座
    sweep(pm, neck, 0.009, 8, S('spout'))
    sweep(pm, [(0, 0.985, -0.039), (0, 0.97, -0.034)], 0.0105, 8, S('spout_tip'))
    # 按壓鈕：盆緣下、+z 那一側（人站的地方）
    sweep(pm, [(0, 0.884, 0.15), (0, 0.884, 0.188)], 0.026, 12, R('steel'))
    sweep(pm, [(0, 0.884, 0.186), (0, 0.884, 0.197)], 0.019, 12, S('button'))
    return pm


def bike_rack():
    pm = PM(); g = R('galv')
    rbox(pm, -0.34, 0.34, 0.0, 0.035, -1.28, 1.28, {'t': R('pad'), '*': S('pad_side')}, r=0.01, seg=1)
    rc = 0.12; xl, top = 0.25, 0.70
    for z in SLOTS:
        arcL = [(-xl + rc - rc * math.cos(a), top - rc + rc * math.sin(a), z) for a in np.linspace(0, math.pi / 2, 6)]
        arcR = [(xl - rc + rc * math.sin(a), top - rc + rc * math.cos(a), z) for a in np.linspace(0, math.pi / 2, 6)]
        path = [(-xl, 0.015, z)] + arcL + arcR + [(xl, 0.015, z)]
        sweep(pm, path, 0.024, 10, g, caps=False)
        for x in (-xl, xl):                                                                    # 腳下的焊接套（埋進墊子）
            lathe2(pm, [(0.034, 0.03), (0.027, 0.056)], 6, 'galv', rep=1, M=T(x, 0, z))          # 斜的焊接套（一段）
    # U 型鎖：掛在第二格的橫桿上（鎖環繞過橫桿、鎖身在下面），沒有字
    zs, xs = LOCK_SLOT, 0.06; rr = 0.046
    sh = [(xs, 0.545, zs - rr)] + [(xs, top + rr * math.sin(a), zs - rr * math.cos(a)) for a in np.linspace(0, math.pi, 9)] + [(xs, 0.545, zs + rr)]
    sh = [sh[0], (xs, top, zs - rr)] + sh[2:-2] + [(xs, top, zs + rr), sh[-1]]
    sweep(pm, sh, 0.0085, 8, S('lock_steel'))
    sweep(pm, [(xs, 0.532, zs - 0.075), (xs, 0.532, zs + 0.075)], 0.02, 10, S('lock_body'))
    sweep(pm, [(xs, 0.532, zs + 0.075), (xs, 0.532, zs + 0.082)], 0.012, 10, S('lock_core'))
    return pm


ITEMS = {'PARK_CHESS_TABLE': chess_table, 'PARK_STOOL': stool, 'PARK_FOUNTAIN': fountain, 'PARK_BIKE_RACK': bike_rack}
# GLB 裡先排開好看（LAWWW2-B 擺放時用各自的原點）：桌在原點、凳子在桌的 +z 0.95、直飲台 x 2.2、車架 x 4.2
SPREAD = {'PARK_CHESS_TABLE': (0.0, 0.0, 0.0, 0), 'PARK_STOOL': (0.0, 0.0, 0.95, 0), 'PARK_FOUNTAIN': (2.2, 0.0, 0.0, 0), 'PARK_BIKE_RACK': (4.2, 0.0, 0.0, 0)}
BUDGET = {'PARK_CHESS_TABLE': 2250, 'PARK_STOOL': 750, 'PARK_FOUNTAIN': 1500, 'PARK_BIKE_RACK': 1500}
TOTAL_BUDGET = 6000
SMOOTH = {'PARK_CHESS_TABLE': 0.8, 'PARK_STOOL': 0.8, 'PARK_FOUNTAIN': 0.9, 'PARK_BIKE_RACK': 1.12}   # 6 邊的焊接套要 ≥1.1 rad（SOP 第 11 節第 3 點）


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('park3_props', props={'kind': 'park3_props'})
    mat = bpy.data.materials.new('park3'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
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
    info['origins'] = {'*': '原點都在底部中央（地面）；GLB 裡先排開（SPREAD），擺放時用各自的原點',
                       'PARK_CHESS_TABLE': '高 0.66、桌面直徑 1.00；河和本地 x 平行，「楚河」給 +z 那一側的人看、「漢界」給 −z',
                       'PARK_STOOL': '高 0.41、最大半徑 0.215；做一個，LAWWW2-B 複製四個',
                       'PARK_FOUNTAIN': '底座 0.55×0.55；盆緣 0.95、出水口頂 1.02；人站 +z（按壓鈕、排水蓋在 +z）',
                       'PARK_BIKE_RACK': '四格沿本地 z（−1.05、−0.35、0.35、1.05），寬 0.5（x ±0.25＋管徑）、高 0.72；墊子 x ±0.34、z ±1.28；U 型鎖在 z −0.35 那一格'}
    info['note'] = ('一個材質 park3（底色 1024＋ORM 256，metal 最高 0.40）；花崗岩＝Poly Haven granite_tile_03、混凝土＝Poly Haven granular_concrete（CC0）；'
                    '拉絲紋、鋅花、鏽水、泥、水漬、磨亮、杯子印是程式畫的；棋盤的字用文泉驛正黑渲染成貼圖。沒有品牌、標誌')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
