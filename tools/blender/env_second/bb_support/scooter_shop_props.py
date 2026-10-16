"""ART-SHOP1 公館機車行的道具組（BB-B 支援 LAWWW2-B；2026-10-16；做法照 ART-PARK3 park3_props.py：一張底色貼圖集＋ORM、網格工具照抄）
給 LAWWW2-B 放進「公館機車行」的 2D 背景場景（傍晚）。
  產生 GLB：/opt/blenv/bin/python tools/blender/env_second/bb_support/scooter_shop_props.py [-- --out assets/models/env/second_ai/bb_support/scooter_shop_props.glb]
  渲染（傍晚暖光）：見 render_dusk.py 檔頭

座標：遊戲座標 y 往上、x 往右、+z 朝前（朝觀眾）；公尺；尺寸照實物。每件一個頂層節點，原點都在底部中央（地面）：
  SHOP_TIRE_STACK   機車外胎兩疊：甲疊 10 吋 7 條（x −0.26）、乙疊 12 吋 5 條（x +0.26），新舊混疊、每條一點偏移和轉角（少數微傾）；
                    再一條 10 吋立著、往後倒 14°，斜靠在乙疊前面（+z）的胎面上（靠的位置用計算找：往後推到碰到為止，不穿插）。
                    輪胎是旋轉體（橫截面圓角）：胎面一圈另一個區塊（V 字斜溝＋中間一條直溝）、胎側細同心圓紋＋胎肩鋸齒；
                    新胎深黑、溝清楚、一點脫模光澤；舊胎偏灰、胎面中間磨淺、溝裡卡灰、少量細裂紋，最上面那條朝上的胎側灰比較多。胎側沒有任何字。
  SHOP_TOOL_WALL    洞洞板 2.4×1.2（x −1.2～1.2、y 0.9～2.1），板背後三條木條撐離牆 2 cm：背面 z 0.02、板面 z 0.026（原點在板子正下方的地面，可以直接貼牆放）。
                    孔距 25.4 mm、孔徑 6 mm：板面切成 8×8 孔（0.2032 m）一格，每格 UV 對到同一個 128×128 的「洞洞」區塊（乾淨／沾油兩種，下方中間沾油的多；
                    完整的格子隨機轉 90°／鏡像，看不出重複）。掛的工具：開口梅花扳手 6 支（梅花端套在鉤子上）、起子 5 支（橫的起子架）、鉗子 2 支（紅、藍握把）、
                    套筒軌道 8 顆（軸朝 +z、前面暗色六角孔）、棘輪扳手 1、捲尺 1（素色，放在兩支鉤子上）、鐵鎚 1（鎚頭架在兩支鉤子上、柄往下垂）、空鉤子 3。
  SHOP_PARTS_SHELF  角鋼層架 高 1.8、寬 1.2、深 0.45，5 層板（y 0.08、0.48、0.88、1.28、1.68）。四根 L 形角鋼（4 cm、2 mm）柱面成排的長圓孔、層板 3 cm 折邊、
                    每層四角三角補強片、柱腳塑膠墊。灰綠烤漆（明暗＝Poly Haven green_metal_rust）。素面紙箱 7 個（封箱膠帶、稍微歪）、無標籤 1 公升機油瓶 8 罐、
                    零件盒 6 個（藍黃灰，上方暗色開口）、第三層前緣掛一塊沾油的舊抹布。
  SHOP_LIFT         機車用低升降台：底座框 x −0.80～1.0（貼地）、檯面 1.6×0.55 半升起（頂面 y 0.34，Poly Haven metal_plate 菱形花紋鋼板，染鋼灰、金屬度 0.15，
                    中間油污和黑色胎痕）；兩側 X 形剪刀臂＋軸、油壓缸、前端（+x）夾前輪的 U 形夾座、後端（−x）一片斜坡板到地面（x −1.02）、
                    +z 側腳踩油壓幫浦＋踏板＋油管。藍色烤漆 #4a78ad，邊角掉漆、沾油。
  SHOP_AIR_PUMP     小型儲氣筒式空壓機：臥式紅色氣筒（長 0.55、半徑 0.14、兩端圓頂，軸沿 x），上面灰色馬達、散熱片汽缸、曲軸箱、白色錶面壓力錶（沒有字、一根指針）、
                    壓力開關、出氣閥＋快速接頭；+x 端 U 形提把、兩個橡膠腳，−x 端兩個輪子。紅色橡膠風管在 +x 旁邊地上捲 4 圈（螺旋 sweep），一頭接出氣閥、一頭有打氣頭。
  SHOP_OIL_DRUM     200 L 鐵桶（半徑 0.29、高 0.88、兩道滾筋）當廢油桶：藍色烤漆、上緣往下流的黑色油痕（明暗參考 Poly Haven rusty_painted_metal）、底部一圈鏽；
                    頂蓋兩個桶塞（大的插著黃色大漏斗：直徑 0.4，漏斗內面是黑油；小的蓋著），桶蓋上一團沾油的抹布。
  SHOP_STOOL_RED    台灣常見的矮塑膠椅（紅）：座高 0.26、座面 0.28 見方圓角、中間橢圓提把孔（畫的）、座面下一圈裙邊、四隻往外張的腳；座面一點刮痕和灰。
  SHOP_STOOL_BLUE   同上（藍）。
沒有任何文字、商標、品牌（D77）。材質一個：shop1（1024 底色貼圖集＋256 ORM；金屬度最高 0.40：工具、軸、套筒 0.2，檯面 0.15，塗裝 0）。
貼圖：Poly Haven（CC0）metal_plate（檯面、斜坡板的菱形花紋：用法線圖算明暗）、green_metal_rust（層架烤漆的明暗、鏽點）、rusty_painted_metal（油桶的油痕、底部鏽的明暗）、
rubber_tiles（輪胎橡膠的細顆粒；只取一片磚的內部、鏡像接）；其他（胎紋、洞洞、刮痕、灰、油污、紙箱、抹布、塑膠）都是 numpy／PIL 畫的。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(HERE)
sys.path.insert(0, PARENT)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy, bmesh   # noqa: E402
from mathutils import Vector   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/bb_support/scooter_shop_props.glb'
TEXB = os.path.join(HERE, 'textures')
GEN = os.path.join(TEXB, 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'scooter_shop_props_{k}.png') for k in ('atlas', 'orm'))
SRC = {'plate_n': os.path.join(TEXB, 'metal_plate', 'metal_plate_nor_gl_1k.jpg'),
       'plate': os.path.join(TEXB, 'metal_plate', 'metal_plate_diff_1k.jpg'),
       'rusty': os.path.join(TEXB, 'rusty_painted_metal', 'rusty_painted_metal_diff_1k.jpg'),
       'green': os.path.join(TEXB, 'green_metal_rust', 'green_metal_rust_diff_1k.jpg'),
       'rubber': os.path.join(TEXB, 'rubber_tiles', 'rubber_tiles_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

# ---- 顏色（sRGB）：底色不要太暗（遊戲沒有環境貼圖）；輪胎本來就暗 ----
RUB_NEW = (31, 31, 33)
RUB_OLD = (72, 70, 66)
DUST = (150, 143, 130)
STEEL = (174, 176, 180)          # #aeb0b4：扳手、起子桿、套筒（金屬度 0.2）
PEG = (134, 101, 70)             # 咖啡色硬質纖維板
SHELF_GG = (128, 145, 131)       # 灰綠烤漆
CARTON = (182, 143, 97)
TAPE = (204, 176, 122)
BLUE_LIFT = (74, 120, 173)       # #4a78ad
RED_TANK = (176, 42, 34)
DRUM_BLUE = (50, 92, 150)
FUNNEL = (228, 186, 44)
STOOL_RED = (198, 46, 44)
STOOL_BLUE = (40, 94, 172)
RUST = (126, 74, 44)
OILC = (24, 20, 16)

# ================= 尺寸 =================
TIRE10 = (0.127, 0.217, 0.10)     # 內徑半徑、外徑半徑、寬
TIRE12 = (0.1524, 0.236, 0.12)
STACK_A_X, STACK_B_X, STACK_B_Z = -0.26, 0.26, -0.015
LEAN = math.radians(14)

PEG_P, PEG_NX, PEG_NY = 0.0254, 94, 47
BOARD_X0, BOARD_X1, BOARD_Y0, BOARD_Y1, BOARD_Z0, BOARD_Z1 = -1.2, 1.2, 0.9, 2.1, 0.02, 0.026
GX0 = -(PEG_NX - 1) * PEG_P / 2
GY0 = (BOARD_Y0 + BOARD_Y1) / 2 - (PEG_NY - 1) * PEG_P / 2
WIRE_R, HOOK_RISE = 0.0022, 0.05

SHELF_Y = (0.08, 0.48, 0.88, 1.28, 1.68)
SH_X, SH_Z, SH_H, LIP = 0.6, 0.225, 1.8, 0.03
PX, PZ = 0.5975, 0.2225           # 層板（在角鋼裡面）

DECK_X0, DECK_X1, DECK_Z = -0.62, 0.98, 0.275
DECK_TOP = 0.34
TANK_L, TANK_R, TANK_Y = 0.55, 0.14, 0.20
DRUM_LID_Y, DRUM_LID_R = 0.866, 0.274
BUNG_BIG, BUNG_SMALL, RAG_DRUM = (-0.185, 0.03), (0.17, -0.10), (0.07, 0.13)

TANK_PROF = [(0.0, -0.275), (0.055, -0.268), (0.095, -0.252), (0.122, -0.232), (0.137, -0.213), (0.14, -0.2),
             (0.14, 0.2), (0.137, 0.213), (0.122, 0.232), (0.095, 0.252), (0.055, 0.268), (0.0, 0.275)]
DRUM_PROF = [(0.262, 0.012), (0.283, 0.002), (0.29, 0.008), (0.291, 0.018), (0.284, 0.03),          # 底部捲邊
             (0.284, 0.27), (0.29, 0.282), (0.292, 0.293), (0.29, 0.304), (0.284, 0.316),            # 滾筋一
             (0.284, 0.564), (0.29, 0.576), (0.292, 0.587), (0.29, 0.598), (0.284, 0.61),            # 滾筋二
             (0.284, 0.85), (0.29, 0.862), (0.291, 0.874), (0.286, 0.88), (0.278, 0.878), (DRUM_LID_R, DRUM_LID_Y)]   # 上面捲邊（內側往下到桶蓋）

# ================= 貼圖集：區塊 =================
REG = {
    'drum_side': (0, 0, 512, 256),        # 油桶側面（s 繞一圈、t 沿剖面從地面往上）
    'drum_top': (512, 0, 768, 256),       # 桶蓋（上視，上面是 +z）
    'tread_new': (768, 0, 1024, 128),     # 胎面（s＝四分之一圈、可接；t 從下胎肩到上胎肩）
    'tread_old': (768, 128, 1024, 256),
    'deck': (0, 256, 512, 448),           # 升降台檯面（s＝x 1.6 m、t＝z 0.55 m）：菱形花紋鋼板＋油污、胎痕
    'side_new': (512, 256, 768, 320),     # 胎側（s＝四分之一圈、t 胎唇 0 → 胎肩 1）
    'side_old': (512, 320, 768, 384),
    'side_old_top': (512, 384, 768, 448), # 舊胎朝上的胎側（灰多）
    'tank': (768, 256, 1024, 384),        # 氣筒（s 繞一圈：0 朝下、0.5 朝上；t 沿軸）
    'lift_blue': (768, 384, 1024, 512),   # 升降台藍烤漆（盒狀 UV：每面對整塊，邊角掉漆）
    'shelf_top': (0, 448, 256, 576),      # 層板上面（s＝x、t＝z，t 0 後面）
    'shelf_lip': (256, 448, 512, 480),    # 層板折邊（s 沿邊、t 0 下緣）
    'peg_clean': (256, 480, 384, 608),    # 洞洞板 8×8 孔（乾淨）
    'peg_oily': (384, 480, 512, 608),     # 洞洞板 8×8 孔（沾油）
    'post': (512, 448, 576, 960),         # 角鋼柱面（s 橫過 4 cm、t 沿 1.8 m）
    'carton_side': (576, 448, 704, 576),
    'bin_top_gray': (704, 448, 768, 512),
    'carton_end': (704, 512, 832, 640),
    'carton_top': (832, 512, 960, 640),
    'bin_top_blue': (960, 512, 1024, 576),
    'bin_top_yellow': (960, 576, 1024, 640),
    'rag': (576, 576, 704, 704),
    'tool_steel': (0, 576, 256, 704),     # 工具鋼（s 沿長邊的拉絲紋）
    'motor': (256, 608, 384, 672),        # 馬達外殼（散熱肋）
    'wood': (256, 672, 384, 704),         # 鐵鎚木柄
    'board_plain': (384, 608, 448, 672),  # 洞洞板邊上沒有孔的地方
    'stool_side_red': (448, 608, 512, 672),
    'stool_side_blue': (384, 672, 448, 736),
    'gauge': (448, 672, 512, 736),        # 壓力錶錶面
    'socket_face': (0, 704, 32, 736),     # 套筒前面（暗色六角孔）
    'funnel_out': (704, 640, 832, 704),
    'funnel_in': (704, 704, 832, 768),
    'stool_top_red': (832, 640, 960, 768),
    'stool_top_blue': (832, 768, 960, 896),
    'motor_fins': (960, 640, 1024, 768),  # 汽缸散熱片（鋁）
}
SW = {   # 小色塊：(顏色, 粗糙度, 金屬度)
    'rub_in': ((26, 26, 28), 0.9, 0.0), 'wire': ((168, 170, 174), 0.4, 0.2), 'board_edge': ((112, 86, 62), 0.85, 0.0),
    'board_back': ((96, 74, 54), 0.9, 0.0), 'batten': ((152, 120, 84), 0.8, 0.0), 'chrome': ((178, 180, 184), 0.24, 0.2),
    'sd_red': ((190, 42, 40), 0.35, 0.0), 'sd_yellow': ((226, 182, 42), 0.35, 0.0), 'sd_black': ((44, 44, 46), 0.4, 0.0),
    'sd_blue': ((42, 90, 170), 0.35, 0.0), 'pl_red': ((184, 42, 38), 0.65, 0.0), 'pl_blue': ((44, 92, 168), 0.65, 0.0),
    'rail': ((84, 86, 90), 0.5, 0.0), 'tape_body': ((92, 96, 100), 0.55, 0.0), 'tape_bump': ((42, 42, 44), 0.85, 0.0),
    'tape_blade': ((216, 188, 76), 0.4, 0.1), 'ham_head': ((70, 72, 76), 0.5, 0.0), 'ham_face': ((172, 174, 178), 0.25, 0.2),
    'grip_black': ((40, 40, 42), 0.85, 0.0), 'hole_dark': ((20, 20, 22), 0.9, 0.0), 'shelf_edge': ((112, 126, 114), 0.6, 0.0),
    'shelf_under': ((104, 116, 106), 0.7, 0.0), 'foot': ((52, 52, 54), 0.8, 0.0), 'bottle_w': ((214, 212, 204), 0.5, 0.0),
    'bottle_g': ((46, 88, 62), 0.45, 0.0), 'bottle_k': ((144, 146, 144), 0.5, 0.0), 'cap_k': ((38, 38, 40), 0.5, 0.0),
    'cap_r': ((172, 44, 38), 0.45, 0.0), 'cap_w': ((196, 194, 186), 0.45, 0.0), 'bin_blue': ((46, 98, 170), 0.5, 0.0),
    'bin_yellow': ((228, 184, 42), 0.5, 0.0), 'bin_gray': ((130, 132, 134), 0.55, 0.0), 'pin': ((166, 168, 172), 0.4, 0.2),
    'rod': ((184, 186, 190), 0.18, 0.2), 'rubber': ((40, 40, 42), 0.85, 0.0), 'tread_pad': ((48, 48, 50), 0.9, 0.0),
    'hose_blk': ((34, 34, 36), 0.7, 0.0), 'alu': ((160, 162, 164), 0.45, 0.15), 'fan': ((66, 68, 72), 0.6, 0.0),
    'switch': ((124, 128, 132), 0.5, 0.0), 'hub': ((150, 152, 150), 0.5, 0.0), 'hose_red': ((168, 42, 36), 0.6, 0.0),
    'brass': ((176, 152, 92), 0.35, 0.2), 'drum_bung': ((150, 152, 156), 0.45, 0.15), 'red_paint': ((168, 40, 32), 0.45, 0.0),
    'blue_paint': ((74, 120, 173), 0.5, 0.0), 'handle_blk': ((50, 50, 52), 0.5, 0.0), 'plate_gray': ((96, 98, 102), 0.55, 0.0),
    'stool_red': ((190, 44, 42), 0.5, 0.0), 'stool_blue': ((40, 92, 168), 0.5, 0.0), 'oil_dark': ((30, 26, 22), 0.3, 0.0),
}
SW_CELL, SW_X0, SW_Y0, SW_COLS = 32, 0, 896, 16
for i, k in enumerate(SW):
    REG['sw_' + k] = (SW_X0 + (i % SW_COLS) * SW_CELL, SW_Y0 + (i // SW_COLS) * SW_CELL, SW_X0 + (i % SW_COLS) * SW_CELL + SW_CELL, SW_Y0 + (i // SW_COLS) * SW_CELL + SW_CELL)
CONST = {'post': None}
METALS = {'tool_steel': 0.2, 'deck': 0.15, 'socket_face': 0.2, 'motor_fins': 0.15}


def check_regions():
    """區塊不能重疊、不能超出 1024"""
    items = list(REG.items())
    for i, (a, (ax0, ay0, ax1, ay1)) in enumerate(items):
        assert 0 <= ax0 < ax1 <= N and 0 <= ay0 < ay1 <= N, a
        for b, (bx0, by0, bx1, by1) in items[i + 1:]:
            assert ax1 <= bx0 or bx1 <= ax0 or ay1 <= by0 or by1 <= ay0, (a, b)


# ================= 剖面工具 =================
def arclen(prof):
    d = [0.0]
    for (r0, y0), (r1, y1) in zip(prof, prof[1:]): d.append(d[-1] + math.hypot(r1 - r0, y1 - y0))
    return d


# ================= 貼圖 =================
def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def grid(name):
    w, h = sz(name)
    S_, T_ = np.meshgrid((np.arange(w) + 0.5) / w, 1 - (np.arange(h) + 0.5) / h)
    return w, h, S_.astype(np.float32), T_.astype(np.float32)


def norm(a): return (a - a.mean()) / max(1e-6, a.std())
def u8(a): return ((a - a.min()) / max(1e-6, a.max() - a.min()) * 255).astype(np.uint8)


def blur(a, r):
    lo, hi = float(a.min()), float(a.max()); sc = max(1e-6, hi - lo)
    im = Image.fromarray(((a - lo) / sc * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, np.float32) / 255 * sc + lo


def soft(w, h, seed, scale=24, blur_=6, wrap=''):
    """平滑雜訊（平均 0、標準差 1）；wrap='x'／'xy'：左右（上下）可以接（輪胎、桶子繞一圈、洞洞板的格子）"""
    rng = np.random.default_rng(seed); gh, gw = max(2, h // scale), max(2, w // scale)
    a = rng.normal(0, 1, (gh, gw)).astype(np.float32)
    rx, ry = (3 if 'x' in wrap else 1), (3 if 'y' in wrap else 1)
    a = np.tile(a, (ry, rx))
    arr = np.asarray(Image.fromarray(u8(a)).resize((w * rx, h * ry), Image.BICUBIC).filter(ImageFilter.GaussianBlur(blur_)), np.float32)
    if rx == 3: arr = arr[:, w:2 * w]
    if ry == 3: arr = arr[h:2 * h, :]
    return norm(arr)


def fine(w, h, seed, b=0.7):
    rng = np.random.default_rng(seed); return norm(blur(rng.normal(0, 1, (h, w)).astype(np.float32), b))


def rgb(base, z, k):
    return np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]


def mix(a, c, t):
    """a 往顏色 c 混 t（0~1）"""
    t = np.clip(t, 0, 1)[..., None]; return a * (1 - t) + np.array(c, np.float32) * t


def to_img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def put(P, name, img): P.paste(img, (REG[name][0] * SS, REG[name][1] * SS))


def blob(X, Y, cx, cy, s): return np.exp(-((X - cx) ** 2 + (Y - cy) ** 2) / (2 * s * s))


def src_gray(key, crop=None):
    im = Image.open(SRC[key]).convert('L')
    return np.asarray(im.crop(crop) if crop else im, np.float32)


def src_phys(key, w, h, mw, mh, src_m=1.0, mode='RGB'):
    """Poly Haven 貼圖（可接、整張＝src_m 公尺）照公尺換算重新取樣、鋪滿 (w,h)＝(mw,mh) 公尺"""
    im = Image.open(SRC[key]).convert(mode)
    tw, th = max(4, int(round(src_m * w / mw))), max(4, int(round(src_m * h / mh)))
    a = np.asarray(im.resize((tw, th), Image.LANCZOS), np.float32)
    reps = (h // th + 2, w // tw + 2) + ((1,) if a.ndim == 3 else ())
    return np.tile(a, reps)[:h, :w]


def rubber_grain(w, h, k=4):
    """rubber_tiles 只取一片磚的內部（避開磚縫）、鏡像接成可接的方塊；橫向剛好鋪 k 塊（繞一圈可以接）"""
    a = src_gray('rubber', (12, 26, 244, 258))
    t = np.concatenate([a, a[:, ::-1]], 1); t = np.concatenate([t, t[::-1]], 0)
    tw = w // k; th = max(8, int(tw * 0.75))
    t = np.asarray(Image.fromarray(np.clip(t, 0, 255).astype(np.uint8)).resize((tw, th), Image.LANCZOS), np.float32)
    a = np.tile(t, (h // th + 2, k))[:h, :w]
    return norm(a - blur(a, 6))


def wrap_lines(w, h, lines, width, fill=255, b=0.8):
    """在三倍寬的畫布上畫（每條線左右各再畫一次），模糊後取中間：左右可以接"""
    M = Image.new('L', (3 * w, h), 0); d = ImageDraw.Draw(M)
    for pts in lines:
        for off in (-w, 0, w):
            d.line([(x + w + off, y) for x, y in pts], fill=fill, width=width, joint='curve')
    return np.asarray(M.filter(ImageFilter.GaussianBlur(b)), np.float32)[:, w:2 * w] / 255.0


def scratches(w, h, seed, n, lmin, lmax, ang=None, width=1, margin=0.04):
    """細刮痕遮罩（不碰到邊：重複的區塊接起來不會斷）"""
    rng = np.random.default_rng(seed); M = Image.new('L', (w, h), 0); d = ImageDraw.Draw(M)
    for _ in range(n):
        x, y = rng.uniform(margin, 1 - margin) * w, rng.uniform(margin, 1 - margin) * h
        a = rng.uniform(0, math.pi) if ang is None else ang + rng.normal(0, 0.15)
        L_ = rng.uniform(lmin, lmax) * w
        x1 = np.clip(x + math.cos(a) * L_, margin * w, (1 - margin) * w); y1 = np.clip(y + math.sin(a) * L_, margin * h, (1 - margin) * h)
        d.line([(x, y), (x1, y1)], fill=int(rng.uniform(120, 255)), width=width)
    return np.asarray(M.filter(ImageFilter.GaussianBlur(0.5)), np.float32) / 255.0


def cracks(w, h, seed, n, t0, t1, length=(0.03, 0.08), margin=0.05):
    """舊輪胎的細裂紋：沿圓周方向的短波浪線"""
    rng = np.random.default_rng(seed); M = Image.new('L', (w, h), 0); d = ImageDraw.Draw(M)
    for _ in range(n):
        x = rng.uniform(margin, 1 - margin - length[1]) * w; y = (1 - rng.uniform(t0, t1)) * h; L_ = rng.uniform(*length) * w
        pts = [(x + L_ * k / 6, y + rng.normal(0, 0.6 * SS)) for k in range(7)]
        d.line(pts, fill=255, width=1)
    return np.asarray(M.filter(ImageFilter.GaussianBlur(0.45)), np.float32) / 255.0


# ---- 輪胎 ----
def paint_tread(name, old):
    w, h, S_, T_ = grid(name); PS, PT = 0.34, 0.13              # 一個重複的周長、胎面弧長（公尺）
    ps = w / PS; P = lambda s, t: (s * ps, (1 - t) * h)
    gw = max(3, int(0.0058 * ps)); K = 6; sp = PS / K; lines, small = [], []
    for k in range(K):
        s0 = (k + 0.5) * sp; s1 = s0 + sp / 2                    # 上下兩半錯開半格（V 字的兩邊）
        lines += [[P(s0, 0.56), P(s0 - 0.02, 0.74), P(s0 - 0.04, 0.93)], [P(s1, 0.44), P(s1 - 0.02, 0.26), P(s1 - 0.04, 0.07)]]
        small += [[P(s0 + sp * 0.3, 0.66), P(s0 + sp * 0.3 - 0.014, 0.82)], [P(s1 + sp * 0.3, 0.34), P(s1 + sp * 0.3 - 0.014, 0.18)]]
    m = np.maximum(wrap_lines(w, h, lines, gw, b=0.8 * SS), 0.6 * wrap_lines(w, h, small, max(2, gw // 2), b=0.6 * SS))
    cg = np.exp(-((T_ - 0.5) / (0.0048 / PT * 0.6)) ** 2)            # 中間一條直溝
    grain = rubber_grain(w, h, 4); big = soft(w, h, 3 + old, 40, 10, wrap='x')
    if old:
        center = np.exp(-((T_ - 0.5) / 0.17) ** 2)
        mo = np.maximum(m * (1 - 0.6 * center), 0.75 * cg)                                 # 胎面中間磨淺
        col = rgb(RUB_OLD, 0.6 * grain + 0.5 * big, 0.06) * (1 - 0.34 * mo)[..., None]
        dust_top = np.clip((T_ - 0.7) / 0.3, 0, 1) ** 1.5 * (0.6 + 0.4 * np.clip(soft(w, h, 7, 10, 3, wrap='x'), -1, 1))
        col = mix(col, DUST, 0.3 * mo + 0.3 * dust_top + 0.05)
        cr = cracks(w, h, 8, 10, 0.15, 0.85, (0.02, 0.05))
        col *= (1 - 0.35 * cr)[..., None]
        rough = 0.86 + 0.06 * mo
    else:
        mm = np.maximum(m, cg)
        col = rgb(RUB_NEW, 0.7 * grain + 0.3 * big, 0.06) * (1 - 0.6 * mm)[..., None]
        hi = np.clip(np.roll(mm, -2 * SS, axis=0) - mm, 0, 1)                             # 溝的上緣一點亮邊
        col += 9 * hi[..., None]
        rough = 0.52 + 0.3 * mm + 0.04 * np.clip(big, -1, 1)
    return to_img(col), rough


def paint_sidewall(name, old, dusty):
    w, h, S_, T_ = grid(name)                                   # t：胎唇 0 → 胎肩 1
    grain = rubber_grain(w, h, 4); big = soft(w, h, 11 + 2 * old + dusty, 30, 8, wrap='x')
    rings = sum(np.exp(-((T_ - ti) / 0.008) ** 2) * wi for ti, wi in ((0.12, 1.0), (0.155, 0.8), (0.42, 0.6), (0.45, 0.6), (0.73, 0.9)))
    ser = blur(((np.abs(((S_ * 56) % 1.0) - 0.5) < 0.16) & (T_ > 0.86)).astype(np.float32), 0.7 * SS)   # 胎肩的鋸齒（每圈 224 個）
    bead = np.clip((0.09 - T_) / 0.09, 0, 1)
    if not old:
        col = rgb(RUB_NEW, 0.7 * grain + 0.3 * big, 0.05) * (1 - 0.22 * rings - 0.3 * ser - 0.1 * bead)[..., None]
        rough = 0.5 + 0.12 * rings + 0.1 * ser - 0.1 * bead
        return to_img(col), rough
    col = rgb(RUB_OLD, 0.6 * grain + 0.5 * big, 0.05) * (1 - 0.14 * rings - 0.2 * ser)[..., None]
    cr = cracks(w, h, 13 + dusty, 9, 0.25, 0.85)
    col *= (1 - 0.4 * cr)[..., None]
    n = np.clip(soft(w, h, 17 + dusty, 8, 2, wrap='x'), -1.5, 1.5)
    if dusty:
        dust = np.clip(0.35 + 0.35 * n, 0, 1) * (0.55 + 0.45 * T_) + 0.25 * rings
        col = mix(col, DUST, 0.5 * dust)
    else:
        col = mix(col, DUST, 0.08 + 0.1 * rings + 0.05 * n)
    return to_img(col), 0.86 + 0.04 * rings


# ---- 洞洞板 ----
def paint_peg(name, oily, holes=True):
    w, h = sz(name); X, Y = np.meshgrid(np.arange(w) + 0.5, np.arange(h) + 0.5)
    cell = w / 8.0 if holes else w / 2.5
    fib = soft(w, h, 101, 3, 0.8, wrap='xy'); mot = soft(w, h, 102 + oily, 40, 10, wrap='xy')
    col = rgb(PEG, 0.5 * fib + 0.6 * mot, 0.05)
    rough = np.full((h, w), 0.74, np.float32)
    if oily:
        rng = np.random.default_rng(7); sm = np.zeros((h, w), np.float32)
        for (ci, cj) in ((1, 5), (4, 2), (5, 6), (2, 1), (6, 4)):            # 幾個孔旁邊的手指油印（離開格子邊）
            cx, cy = (ci + 0.5 + rng.uniform(-0.3, 0.3)) * cell, (cj + 0.5 + rng.uniform(-0.3, 0.3)) * cell
            sm = np.maximum(sm, blob(X, Y, cx, cy, 0.42 * cell) * rng.uniform(0.5, 1.0))
        sm *= (0.65 + 0.35 * np.clip(soft(w, h, 103, 6, 2, wrap='xy'), -1, 1))
        col = col * 0.88
        col = mix(col, (64, 44, 28), 0.42 * sm)
        rough -= 0.22 * sm + 0.06
    if holes:
        fx = (X / cell) % 1 - 0.5; fy = (Y / cell) % 1 - 0.5; r = np.hypot(fx, fy) * cell; rh = 0.118 * cell
        hole = np.clip((rh + 0.6 - r) / 1.2, 0, 1)
        rim = np.exp(-((r - rh - 1.3) / 1.1) ** 2)
        lit = np.clip(fy / 0.118, 0, 1)                                          # 洞的下半看得到下緣的孔壁（光從上面來）
        hole_col = (1 - lit)[..., None] * np.array((18, 14, 10), np.float32) + lit[..., None] * np.array((70, 52, 36), np.float32)
        col = col * (1 - (0.14 + 0.1 * oily) * rim)[..., None]
        col = col * (1 - hole)[..., None] + hole_col * hole[..., None]
        rough = rough * (1 - hole) + 0.95 * hole
    return to_img(col), rough


# ---- 工具 ----
def paint_tool_steel():
    w, h, S_, T_ = grid('tool_steel'); rng = np.random.default_rng(31)
    st = rng.normal(0, 1, (h, max(2, w // 24))).astype(np.float32)          # 沿長邊的拉絲：橫向變化慢、直向變化快
    st = norm(np.asarray(Image.fromarray(u8(st)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6)), np.float32))
    big = soft(w, h, 32, 30, 8); sm = np.clip(soft(w, h, 33, 12, 4) - 0.8, 0, 2) / 2              # 手摸的地方
    col = rgb(STEEL, st, 0.035) * (1 + 0.03 * big)[..., None]
    col = mix(col, (96, 92, 86), 0.35 * sm)
    return to_img(col), 0.3 + 0.04 * np.clip(st, -2, 2) / 2 + 0.25 * sm


def paint_socket_face():
    w, h, S_, T_ = grid('socket_face'); X, Y = S_ - 0.5, T_ - 0.5; r = np.hypot(X, Y)
    ang = np.arctan2(Y, X); hexr = 0.27 / np.cos(((ang + math.pi / 6) % (math.pi / 3)) - math.pi / 6)    # 六角孔
    col = np.zeros((h, w, 3), np.float32) + np.array(STEEL, np.float32)
    col = mix(col, (118, 120, 124), np.exp(-((r - 0.47) / 0.03) ** 2))                                   # 外緣倒角
    hole = np.clip((hexr - r) / 0.02, 0, 1); col = mix(col, (22, 22, 24), hole)
    col = mix(col, (100, 102, 106), np.clip(1 - np.abs(r - hexr - 0.02) / 0.03, 0, 1) * (1 - hole) * 0.6)
    return to_img(col), 0.3 + 0.6 * hole


def paint_wood():
    w, h, S_, T_ = grid('wood'); rng = np.random.default_rng(41)
    g = rng.normal(0, 1, (max(2, h // 2), max(2, w // 32))).astype(np.float32)
    g = norm(np.asarray(Image.fromarray(u8(g)).resize((w, h), Image.BICUBIC), np.float32))
    col = rgb((186, 148, 100), g, 0.08) * (1 + 0.04 * soft(w, h, 42, 20, 5))[..., None]
    return to_img(col), 0.42 + 0.03 * g


def paint_gauge():
    w, h, S_, T_ = grid('gauge'); X, Y = S_ - 0.5, T_ - 0.5; r = np.hypot(X, Y); ang = np.arctan2(X, Y)   # ang：0＝正上方，順時針為正
    col = np.zeros((h, w, 3), np.float32) + np.array((236, 234, 226), np.float32)
    col = mix(col, (176, 178, 182), np.clip((r - 0.44) / 0.01, 0, 1))                   # 錶框
    col = mix(col, (200, 200, 194), np.exp(-((r - 0.43) / 0.012) ** 2) * 0.6)
    tick = np.zeros_like(r)
    for k in range(41):                                                              # 刻度（270° 弧，沒有數字）
        a = math.radians(-135 + 270 * k / 40); major = (k % 5 == 0)
        da = np.abs(((ang - a + math.pi) % (2 * math.pi)) - math.pi) * r
        tick = np.maximum(tick, (da < (0.008 if major else 0.004)) * ((r > (0.31 if major else 0.35)) & (r < 0.40)))
    col = mix(col, (34, 34, 36), blur(tick.astype(np.float32), 0.6))
    a = math.radians(48); d = X * math.cos(a) - Y * math.sin(a); along = X * math.sin(a) + Y * math.cos(a)     # 指針：從中心往右上（約 7 成）
    needle = (np.abs(d) < 0.012 * (1 - np.clip(along / 0.36, 0, 1)) + 0.004) & (along > -0.06) & (along < 0.36)
    col = mix(col, (190, 36, 30), blur(needle.astype(np.float32), 0.6))
    col = mix(col, (30, 30, 32), np.clip((0.045 - r) / 0.01, 0, 1))
    return to_img(col), 0.25 + 0.1 * (r > 0.44)


# ---- 層架 ----
def green_paint(w, h, mw, mh, seed):
    a = src_phys('green', w, h, mw, mh, 1.0)
    lum = a.mean(-1); z = norm(lum - blur(lum, 40)) * 0.7 + 0.5 * norm(blur(lum, 40))
    rust = np.clip((a[..., 0] - a[..., 1] + 8) / 40, 0, 1)                          # 綠漆上的鏽點（紅＞綠）
    return z, blur(rust, 0.8)


def paint_post():
    w, h, S_, T_ = grid('post'); Xm, Ym = S_ * 0.04, T_ * SH_H
    z, rust = green_paint(w, h, 0.04, SH_H, 51)
    col = mix(rgb(SHELF_GG, z, 0.07), RUST, 0.6 * rust)
    yc = 0.024 + 0.03 * np.round((Ym - 0.024) / 0.03); dy = Ym - yc                 # 成排的長圓孔（孔距 3 cm）
    dist = np.hypot(np.maximum(np.abs(dy) - 0.0044, 0), Xm - 0.0215)
    slot = np.clip((0.0036 - dist) / 0.0006, 0, 1)
    bolt = np.zeros_like(slot); bhi = np.zeros_like(slot)
    for ys in SHELF_Y:                                                              # 層板的螺絲頭（蓋在那一格長孔上）
        by = ys - 0.015; near = np.abs(yc - by) < 0.016; slot = np.where(near, 0, slot)
        bolt = np.maximum(bolt, np.clip((0.0064 - np.hypot(Xm - 0.0215, Ym - by)) / 0.0007, 0, 1))
        bhi = np.maximum(bhi, np.clip(1 - np.hypot(Xm - 0.0195, Ym - by - 0.0018) / 0.0028, 0, 1))
    edge = np.clip(1 - np.minimum(S_, 1 - S_) / 0.1, 0, 1) * np.clip(soft(w, h, 52, 6, 2) - 0.2, 0, 1.5)
    col = mix(col, (154, 158, 152), 0.5 * edge)
    col = mix(col, (64, 62, 56), 0.45 * np.clip((0.06 - Ym) / 0.06, 0, 1))
    col = mix(col, (26, 28, 26), slot)
    col = mix(col, (128, 130, 128), bolt); col += 22 * (bhi * bolt)[..., None]
    return to_img(col), 0.55 + 0.2 * rust + 0.35 * slot - 0.1 * edge


def paint_shelf_top():
    w, h, S_, T_ = grid('shelf_top'); X, Z = S_ * 1.2 - 0.6, T_ * 0.45 - 0.225
    z, rust = green_paint(w, h, 1.2, 0.45, 61)
    col = mix(rgb(SHELF_GG, z, 0.07), RUST, 0.5 * rust)
    sc = scratches(w, h, 62, 40, 0.05, 0.25, ang=0.0, width=1)                      # 東西拖過的刮痕（沿 x）
    col = mix(col, (176, 180, 172), 0.55 * sc)
    n = np.clip(soft(w, h, 63, 10, 3), -1.5, 1.5)
    dust = np.clip(0.3 + 0.3 * n, 0, 1) * (0.5 + 0.5 * np.clip((-Z + 0.05) / 0.25, 0, 1))
    col = mix(col, DUST, 0.3 * dust)
    rng = np.random.default_rng(64); ring = np.zeros_like(X); oil = np.zeros_like(X)
    for _ in range(6):                                                              # 機油瓶底的油圈、滴下來的油
        cx, cz, rr = rng.uniform(-0.5, 0.5), rng.uniform(-0.15, 0.15), rng.uniform(0.028, 0.04)
        ring = np.maximum(ring, np.exp(-((np.hypot(X - cx, Z - cz) - rr) / 0.003) ** 2) * rng.uniform(0.5, 1))
        oil = np.maximum(oil, blob(X, Z, cx + rng.uniform(-0.05, 0.05), cz + rng.uniform(-0.04, 0.04), rng.uniform(0.012, 0.03)) * rng.uniform(0.3, 0.8))
    col = mix(col, OILC, 0.5 * ring + 0.5 * oil)
    edge = np.clip(1 - np.minimum(np.minimum(S_, 1 - S_) * 1.2, np.minimum(T_, 1 - T_) * 0.45) / 0.012, 0, 1)
    col = mix(col, (150, 154, 148), 0.35 * edge * np.clip(n + 0.5, 0, 1))
    return to_img(col), 0.6 + 0.15 * dust - 0.3 * oil - 0.15 * ring + 0.1 * sc


def paint_shelf_lip():
    w, h, S_, T_ = grid('shelf_lip'); z, rust = green_paint(w, h, 1.2, 0.03, 65)
    col = mix(rgb(SHELF_GG, z, 0.06), RUST, 0.5 * rust)
    top = np.clip((T_ - 0.82) / 0.18, 0, 1) * np.clip(soft(w, h, 66, 4, 1.5) + 0.3, 0, 1.5)
    col = mix(col, (160, 164, 158), 0.6 * top)
    col = mix(col, (70, 70, 64), 0.35 * np.clip((0.2 - T_) / 0.2, 0, 1))
    return to_img(col), 0.6 - 0.15 * top


def kraft(w, h, seed):
    col = rgb(CARTON, 0.6 * fine(w, h, seed, 0.8) + 0.5 * soft(w, h, seed + 1, 18, 5), 0.05)
    return col


def paint_carton(name):
    w, h, S_, T_ = grid(name); col = kraft(w, h, 71 + len(name))
    rough = np.full((h, w), 0.86, np.float32)
    if name == 'carton_side':
        col *= (1 - 0.02 * np.sin(T_ * 2 * math.pi * 40))[..., None]                       # 瓦楞的淡橫紋
        col = mix(col, (120, 92, 62), 0.4 * np.clip((0.1 - T_) / 0.1, 0, 1) * np.clip(soft(w, h, 72, 6, 2) + 0.6, 0, 1.5))
        col = mix(col, (128, 98, 66), 0.25 * np.clip(1 - np.minimum(S_, 1 - S_) / 0.04, 0, 1))   # 邊角壓扁
        sp = np.clip(soft(w, h, 73, 10, 3) - 1.2, 0, 2)
        col = mix(col, (110, 82, 54), 0.3 * sp)
    elif name == 'carton_end':
        col = mix(col, (120, 92, 62), 0.4 * np.clip((0.1 - T_) / 0.1, 0, 1))
        jag = 0.72 + 0.025 * np.sin(S_ * 60) + 0.015 * np.sin(S_ * 137)
        tape = ((np.abs(S_ - 0.5) < 0.09) & (T_ > jag)).astype(np.float32); tape = blur(tape, 0.6)
        col = mix(col, TAPE, 0.85 * tape); col += 10 * tape[..., None] * (S_ > 0.5)[..., None]
        rough = rough * (1 - tape) + 0.3 * tape
    else:   # carton_top：兩片蓋子在中間合起來＋膠帶
        seam = np.exp(-((T_ - 0.5) / 0.006) ** 2)
        col = mix(col, (96, 72, 48), 0.6 * seam)
        crease = np.exp(-((np.minimum(T_, 1 - T_) - 0.03) / 0.006) ** 2)
        col = mix(col, (150, 116, 78), 0.4 * crease)
        wav = 0.08 + 0.004 * np.sin(S_ * 40)
        tape = blur((np.abs(T_ - 0.5) < wav).astype(np.float32), 0.6)
        col = mix(col, TAPE, 0.85 * tape); col += 12 * (tape * (T_ > 0.5))[..., None]
        dust = np.clip(soft(w, h, 74, 8, 3) * 0.4 + 0.2, 0, 1)
        col = mix(col, (196, 188, 172), 0.18 * dust * (1 - tape))
        rough = rough * (1 - tape) + 0.3 * tape
    return to_img(col), rough


def paint_bin_top(name, color):
    w, h, S_, T_ = grid(name); col = np.zeros((h, w, 3), np.float32) + np.array(color, np.float32)
    rim = np.clip(np.minimum(np.minimum(S_, 1 - S_), np.minimum(T_, 1 - T_)) - 0.1, 0, 1) > 0
    inner = blur(rim.astype(np.float32), 1.0)
    dark = np.array((34, 34, 38), np.float32)[None, None, :] * (0.8 + 0.4 * T_)[..., None]   # 裡面暗（後面比較亮一點）
    col = col * (1 - inner)[..., None] + dark * inner[..., None]
    rng = np.random.default_rng(len(name)); X, Y = S_ * w, T_ * h; parts = np.zeros_like(S_)
    for _ in range(9):                                                              # 裡面的螺絲、墊片（灰色小點）
        cx, cy = rng.uniform(0.22, 0.78) * w, rng.uniform(0.15, 0.55) * h
        parts = np.maximum(parts, np.clip((rng.uniform(2.0, 3.6) * SS / 2 - np.hypot(X - cx, Y - cy)) / 1.0, 0, 1))
    col = mix(col, (120, 120, 116), parts * inner)
    return to_img(col), 0.5 + 0.3 * inner


def paint_rag():
    w, h, S_, T_ = grid('rag'); X, Y = S_ * w, T_ * h
    weave = 0.5 * np.sin(X / SS * 2.6) * np.sin(Y / SS * 2.6)
    wr = soft(w, h, 81, 14, 4) + 0.5 * soft(w, h, 82, 5, 1.5)
    col = rgb((122, 130, 140), 0.4 * wr + 0.3 * weave + 0.4 * fine(w, h, 83), 0.07)
    rng = np.random.default_rng(84); oil = np.zeros_like(S_)
    for _ in range(6):
        oil = np.maximum(oil, blob(S_, T_, rng.uniform(0.15, 0.85), rng.uniform(0.15, 0.85), rng.uniform(0.06, 0.16)) * rng.uniform(0.6, 1.0))
    oil = np.clip(oil * (0.7 + 0.5 * np.clip(soft(w, h, 85, 6, 2), -1, 1)), 0, 1)
    col = mix(col, (40, 32, 24), 0.75 * oil)
    col = mix(col, (70, 66, 60), 0.3 * np.clip(1 - np.minimum(np.minimum(S_, 1 - S_), np.minimum(T_, 1 - T_)) / 0.05, 0, 1))
    return to_img(col), 0.92 - 0.35 * oil


# ---- 升降台 ----
def paint_deck():
    w, h, S_, T_ = grid('deck'); X, Z = S_ * 1.6, T_ * 0.55 - 0.275
    nm = src_phys('plate_n', w, h, 1.6, 0.55, 0.45) / 255.0 * 2 - 1                 # 菱形花紋：法線圖算明暗（光從左上前方）
    Lv = np.array((-0.35, 0.55, 0.76)); Lv /= np.linalg.norm(Lv)
    sh = (nm @ Lv) / Lv[2]
    dl = src_phys('plate', w, h, 1.6, 0.55, 0.45).mean(-1); dz = norm(dl - blur(dl, 6))
    raised = np.clip((1 - nm[..., 2]) * 6, 0, 1)
    col = rgb((154, 158, 162), 0.25 * dz, 0.05) * np.clip(sh, 0.55, 1.35)[..., None]
    trk = np.exp(-(Z / 0.06) ** 2)
    rng = np.random.default_rng(91)
    st = rng.normal(0, 1, (max(2, h // 2), max(2, w // 60))).astype(np.float32)
    st = norm(np.asarray(Image.fromarray(u8(st)).resize((w, h), Image.BICUBIC), np.float32))
    tire = np.clip(trk * (0.55 + 0.35 * st), 0, 1) * np.clip((X - 0.1) / 0.3, 0, 1)            # 黑色胎痕（沿 x，前輪從斜坡上來）
    col = mix(col, (30, 30, 32), 0.6 * tire * (1 - 0.5 * raised))
    oil = np.zeros_like(X)
    for _ in range(9):
        oil = np.maximum(oil, blob(X, Z, rng.uniform(0.3, 1.4), rng.normal(0, 0.06), rng.uniform(0.02, 0.07)) * rng.uniform(0.4, 1))
    oil = np.clip(oil * (0.7 + 0.4 * np.clip(soft(w, h, 92, 8, 3), -1, 1)), 0, 1)
    col = mix(col, OILC, 0.55 * oil)
    edge = np.clip(1 - np.minimum(np.minimum(S_, 1 - S_) * 1.6, np.minimum(T_, 1 - T_) * 0.55) / 0.03, 0, 1)
    col = mix(col, (84, 80, 72), 0.35 * edge)
    return to_img(col), np.clip(0.48 - 0.12 * raised + 0.25 * tire - 0.25 * oil + 0.1 * edge, 0.15, 1)


def paint_lift_blue():
    w, h, S_, T_ = grid('lift_blue'); n = soft(w, h, 101, 20, 5)
    col = rgb(BLUE_LIFT, n, 0.04)
    e = np.clip(1 - np.minimum(np.minimum(S_, 1 - S_), np.minimum(T_, 1 - T_)) / 0.08, 0, 1)
    cn = soft(w, h, 102, 5, 1.3)
    chip = np.clip((e * 1.6 + 0.35 * cn - 1.05) * 6, 0, 1)                           # 邊角掉漆
    chip = np.maximum(chip, np.clip((cn - 2.3) * 4, 0, 1))                         # 中間也有幾個小點
    under = np.clip((cn - 1.6) * 3, 0, 1) * chip
    col = mix(col, (150, 150, 148), chip * (1 - under)); col = mix(col, (62, 62, 64), under)
    oil = np.clip(soft(w, h, 103, 14, 4) - 1.1, 0, 2) / 2
    col = mix(col, (30, 28, 24), 0.5 * oil)
    dust = np.clip(soft(w, h, 104, 10, 3) * 0.3 + 0.15, 0, 1)
    col = mix(col, DUST, 0.12 * dust)
    return to_img(col), 0.5 + 0.12 * chip - 0.2 * oil + 0.1 * dust


# ---- 打氣機 ----
def paint_tank():
    w, h, S_, T_ = grid('tank'); n = soft(w, h, 111, 16, 4, wrap='x')
    col = rgb(RED_TANK, n, 0.035)
    d = arclen(TANK_PROF); fr = [v / d[-1] for v in d]
    seam = np.exp(-((T_ - fr[5]) / 0.006) ** 2) + np.exp(-((T_ - fr[6]) / 0.006) ** 2)   # 圓頂和筒身的焊道
    seam += np.exp(-((S_ - 0.82) / 0.004) ** 2) * ((T_ > fr[5]) & (T_ < fr[6]))       # 縱向焊道
    col *= (1 - 0.18 * np.clip(seam, 0, 1))[..., None]
    up = np.exp(-((S_ - 0.5) / 0.13) ** 2)                                         # 朝上的那一面：灰
    dust = up * np.clip(0.45 + 0.35 * soft(w, h, 112, 8, 2, wrap='x'), 0, 1)
    col = mix(col, DUST, 0.35 * dust)
    cn = soft(w, h, 113, 4, 1.0, wrap='x')
    chip = np.clip((cn - 2.0) * 4, 0, 1) * (0.4 + 0.6 * up)
    col = mix(col, (70, 66, 64), chip)
    down = np.exp(-(np.minimum(S_, 1 - S_) / 0.12) ** 2)
    col = mix(col, (90, 52, 40), 0.3 * down * np.clip(soft(w, h, 114, 8, 2, wrap='x') + 0.4, 0, 1.5))
    return to_img(col), 0.34 + 0.4 * dust + 0.25 * chip


def paint_motor():
    w, h, S_, T_ = grid('motor'); rib = 0.5 + 0.5 * np.cos(S_ * 2 * math.pi * 24)
    body = ((T_ > 0.08) & (T_ < 0.92)).astype(np.float32)
    col = rgb((130, 134, 138), soft(w, h, 121, 10, 3, wrap='x'), 0.04) * (1 - 0.22 * rib * body)[..., None]
    col = mix(col, DUST, 0.18 * np.exp(-((S_ - 0.5) / 0.15) ** 2))
    return to_img(col), 0.5 + 0.05 * rib


def paint_fins():
    w, h, S_, T_ = grid('motor_fins'); col = rgb((160, 162, 164), soft(w, h, 125, 8, 2, wrap='x'), 0.05)
    col = mix(col, (60, 58, 54), 0.25 * np.clip(soft(w, h, 126, 5, 1.5, wrap='x') - 0.5, 0, 1.5))
    return to_img(col), 0.5


# ---- 油桶 ----
def paint_drum_side():
    w, h, S_, T_ = grid('drum_side'); d = arclen(DRUM_PROF); tot = d[-1]; fr = [v / tot for v in d]
    a = src_phys('rusty', w, h, 1.82, 0.88, 0.91)                                   # 兩塊剛好繞一圈（可以接）；上面對齊桶子上緣
    lum = a.mean(-1); med = blur(lum, 30)
    streak = np.clip((med - lum) / (0.45 * med + 1), 0, 1)                         # 來源貼圖的深色流痕 → 黑色油痕
    ang = S_ * 2 * math.pi; dfun = np.abs(((ang - math.pi) + math.pi) % (2 * math.pi) - math.pi)   # 離漏斗那一側（左邊、u 0.5）的角度
    wgt = 0.25 + 0.75 * np.exp(-(dfun / 0.9) ** 2)
    streak = streak * wgt * np.clip((T_ - 0.12) / 0.2, 0, 1)
    n = soft(w, h, 131, 16, 4, wrap='x')
    col = rgb(DRUM_BLUE, n, 0.04)
    col = mix(col, (28, 26, 24), 0.85 * streak)
    topoil = np.clip((T_ - 0.93) / 0.07, 0, 1) * wgt
    col = mix(col, (30, 28, 26), 0.6 * topoil)
    hoops = sum(np.exp(-((T_ - fr[i]) / 0.006) ** 2) for i in (7, 12))
    sc = np.clip(soft(w, h, 132, 5, 1.2, wrap='x') + 0.2, 0, 2) / 2 * np.clip(hoops, 0, 1)
    col = mix(col, (150, 152, 152), 0.6 * sc)                                        # 滾筋磨到露鐵
    rust_src = np.clip((a[..., 0] - a[..., 2] - 30) / 60, 0, 1)
    bot = np.clip((0.09 - T_) / 0.07, 0, 1) * (0.5 + 0.5 * np.clip(soft(w, h, 133, 6, 2, wrap='x') + 0.5 * norm(rust_src), -1, 1))
    col = mix(col, RUST, 0.85 * np.clip(bot, 0, 1))
    seam = np.exp(-((S_ - 0.15) / 0.002) ** 2)
    col *= (1 - 0.15 * seam)[..., None]
    return to_img(col), np.clip(0.5 - 0.25 * streak + 0.35 * bot + 0.05 * n, 0.15, 1)


def paint_drum_top():
    w, h, S_, T_ = grid('drum_top'); X, Z = S_ * 0.6 - 0.3, T_ * 0.6 - 0.3; r = np.hypot(X, Z)
    n = soft(w, h, 141, 14, 4)
    col = rgb(DRUM_BLUE, n, 0.04)
    col *= (1 + 0.08 * np.exp(-((r - 0.235) / 0.006) ** 2) - 0.1 * np.exp(-((r - 0.248) / 0.006) ** 2))[..., None]   # 桶蓋壓出來的一圈
    bx, bz = BUNG_BIG; sx, sz_ = BUNG_SMALL; rx, rz = RAG_DRUM
    rb, rs = np.hypot(X - bx, Z - bz), np.hypot(X - sx, Z - sz_)
    puddle = np.clip(1.2 - rb / 0.085 + 0.25 * soft(w, h, 142, 8, 2), 0, 1)        # 大桶塞旁邊的油漬
    drip = np.clip(1 - np.abs(Z - bz - 0.01 * np.sin(X * 40)) / 0.012, 0, 1) * (X < bx) * (X > -0.28)
    rag = blob(X, Z, rx, rz, 0.06)
    oil = np.clip(puddle + 0.8 * drip + 0.6 * rag, 0, 1)
    col = mix(col, OILC, 0.82 * oil)
    col = mix(col, (150, 152, 156), np.clip((0.034 - rb) / 0.004, 0, 1) * np.clip((rb - 0.022) / 0.003, 0, 1))
    col = mix(col, (14, 12, 10), np.clip((0.022 - rb) / 0.003, 0, 1))
    dust = np.clip(soft(w, h, 143, 8, 2) * 0.35 + 0.25, 0, 1) * (1 - oil)
    col = mix(col, DUST, 0.3 * dust)
    rust = np.clip(soft(w, h, 144, 4, 1.0) - 1.6, 0, 1)
    col = mix(col, RUST, 0.6 * rust)
    return to_img(col), np.clip(0.55 - 0.4 * oil + 0.25 * dust, 0.12, 1)


def paint_funnel(name):
    w, h, S_, T_ = grid(name); n = soft(w, h, 151 + len(name), 10, 3, wrap='x')
    if name == 'funnel_out':
        col = rgb(FUNNEL, n, 0.04)
        dr = wrap_lines(w, h, [[(x, 0), (x + 1, h * np.random.default_rng(int(x)).uniform(0.3, 0.8))] for x in np.linspace(0, w, 9)[:-1] + w / 18], 2 * SS, b=1.5 * SS)
        col = mix(col, (40, 30, 18), 0.6 * dr)
        col = mix(col, (60, 46, 26), 0.6 * np.clip((0.3 - T_) / 0.3, 0, 1))         # 出口那一截髒
        return to_img(col), 0.45 - 0.15 * dr
    col = rgb((22, 20, 17), n, 0.1)
    film = np.clip((T_ - 0.86) / 0.1, 0, 1) * (0.6 + 0.4 * np.clip(soft(w, h, 155, 6, 2, wrap='x'), -1, 1))
    col = mix(col, (176, 140, 36), 0.7 * film)
    return to_img(col), 0.12 + 0.3 * film


# ---- 塑膠椅 ----
def paint_stool_top(name, color):
    w, h, S_, T_ = grid(name); X, Z = (S_ - 0.5) * 0.28, (T_ - 0.5) * 0.28
    col = rgb(color, soft(w, h, 161 + len(name), 16, 4), 0.03)
    ell = np.hypot(X / 0.045, Z / 0.016)
    hole = np.clip((1 - ell) / 0.12, 0, 1); lip = np.exp(-((ell - 1.12) / 0.08) ** 2)
    col *= (1 + 0.08 * lip)[..., None]
    col = mix(col, (26, 22, 22), hole)
    gx, gz = (X / 0.022) % 1 - 0.5, (Z / 0.022) % 1 - 0.5                           # 一格一格的小凹點（防滑）
    dim = (np.hypot(gx, gz) < 0.13) & (np.maximum(np.abs(X), np.abs(Z)) < 0.105) & (ell > 1.6)
    col *= (1 - 0.12 * blur(dim.astype(np.float32), 0.8))[..., None]
    sc = scratches(w, h, 162 + len(name), 26, 0.04, 0.2, width=1)
    col = mix(col, (230, 226, 220), 0.35 * sc)
    dust = np.clip(soft(w, h, 163 + len(name), 8, 2.5) * 0.35 + 0.2, 0, 1)
    col = mix(col, (190, 182, 170), 0.22 * dust)
    edge = np.clip((np.maximum(np.abs(X), np.abs(Z)) - 0.125) / 0.015, 0, 1)
    col *= (1 - 0.1 * edge)[..., None]
    return to_img(col), 0.42 + 0.3 * sc + 0.25 * dust + 0.5 * hole


def paint_stool_side(name, color):
    w, h, S_, T_ = grid(name); col = rgb(color, soft(w, h, 171 + len(name), 10, 3), 0.03)
    low = np.clip((0.2 - T_) / 0.2, 0, 1)
    col = mix(col, (96, 88, 80), 0.35 * low * np.clip(soft(w, h, 172 + len(name), 5, 1.5) + 0.6, 0, 1.5))
    sc = scratches(w, h, 173 + len(name), 10, 0.05, 0.2, width=1)
    col = mix(col, (220, 214, 206), 0.3 * sc)
    return to_img(col), 0.48 + 0.2 * low + 0.2 * sc


def make_textures():
    check_regions()
    P = Image.new('RGB', (N * SS, N * SS), (128, 128, 128)); rough_full = {}

    def add(name, res):
        img, r = res if isinstance(res, tuple) else (res, None)
        put(P, name, img)
        if r is not None: rough_full[name] = np.asarray(r, np.float32) * np.ones((img.size[1], img.size[0]), np.float32)
    add('tread_new', paint_tread('tread_new', 0)); add('tread_old', paint_tread('tread_old', 1))
    add('side_new', paint_sidewall('side_new', 0, 0)); add('side_old', paint_sidewall('side_old', 1, 0)); add('side_old_top', paint_sidewall('side_old_top', 1, 1))
    add('peg_clean', paint_peg('peg_clean', 0)); add('peg_oily', paint_peg('peg_oily', 1)); add('board_plain', paint_peg('board_plain', 0, holes=False))
    add('tool_steel', paint_tool_steel()); add('socket_face', paint_socket_face()); add('wood', paint_wood()); add('gauge', paint_gauge())
    add('post', paint_post()); add('shelf_top', paint_shelf_top()); add('shelf_lip', paint_shelf_lip())
    for nm in ('carton_side', 'carton_end', 'carton_top'): add(nm, paint_carton(nm))
    add('bin_top_blue', paint_bin_top('bin_top_blue', SW['bin_blue'][0])); add('bin_top_yellow', paint_bin_top('bin_top_yellow', SW['bin_yellow'][0]))
    add('bin_top_gray', paint_bin_top('bin_top_gray', SW['bin_gray'][0])); add('rag', paint_rag())
    add('deck', paint_deck()); add('lift_blue', paint_lift_blue())
    add('tank', paint_tank()); add('motor', paint_motor()); add('motor_fins', paint_fins())
    add('drum_side', paint_drum_side()); add('drum_top', paint_drum_top()); add('funnel_out', paint_funnel('funnel_out')); add('funnel_in', paint_funnel('funnel_in'))
    add('stool_top_red', paint_stool_top('stool_top_red', STOOL_RED)); add('stool_top_blue', paint_stool_top('stool_top_blue', STOOL_BLUE))
    add('stool_side_red', paint_stool_side('stool_side_red', STOOL_RED)); add('stool_side_blue', paint_stool_side('stool_side_blue', STOOL_BLUE))
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
        elif name.startswith('sw_'):
            rough, metal = SW[name[3:]][1:]
            orm[b0:b1, a0:a1, 1] = int(rough * 255); orm[b0:b1, a0:a1, 2] = int(min(metal, METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（照抄 park3_props.py；另加 Rx、Rz、extrude、lathe_parts）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; ins = SW_CELL * 0.33 if name.startswith('sw_') else 0.6
    px = x0 + ins + min(1, max(0, s)) * (x1 - x0 - 2 * ins); py = y0 + ins + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * ins)
    return (px / N, 1 - py / N)


def R(name): return lambda s, t: ruv(name, s, t)
def S(name): return lambda *a: ruv('sw_' + name, 0.5, 0.5)


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
def Rx(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1, 1], M[1, 2], M[2, 1], M[2, 2] = c, -s, s, c; return M
def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M


def align_y(d):
    """把本地 +y 轉到方向 d 的旋轉"""
    d = np.asarray(d, float); d = d / np.linalg.norm(d); y = np.array([0, 1.0, 0])
    v = np.cross(y, d); c = float(np.dot(y, d))
    if np.linalg.norm(v) < 1e-9: return np.eye(4) if c > 0 else Rx(math.pi)
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    M = np.eye(4); M[:3, :3] = np.eye(3) + vx + vx @ vx / (1 + c); return M


def _rbox_bm(w, h, d, r=0.03, seg=3):
    """倒角方塊（同 LAWWW2-B 分支 lib2.rbox_bm；這個分支的 lib2 沒有時用這份）"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector((v.co.x * w, v.co.y * d, v.co.z * h))
    r = min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)
    if r > 1e-4: bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=r, segments=seg, affect='EDGES', profile=0.5, clamp_overlap=True)
    return bm


RBOX_BM = getattr(L, 'rbox_bm', None) or _rbox_bm


def rbox(pm, x0, x1, y0, y1, z0, z1, uv, r=0.003, seg=1, M=None):
    W, H, D = x1 - x0, y1 - y0, z1 - z0; bm = RBOX_BM(W, H, D, r, seg); cx, cy, cz = (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2; sub = PM()
    for f in bm.faces:
        pts = [(v.co.x + cx, v.co.z + cy, -v.co.y + cz) for v in f.verts]; n = np.array([f.normal.x, f.normal.z, -f.normal.y]); k = int(np.argmax(np.abs(n)))
        key = {(0, 1): 'r', (0, -1): 'l', (1, 1): 't', (1, -1): 'b', (2, 1): 'f', (2, -1): 'k'}[(k, 1 if n[k] > 0 else -1)]; fn = uv.get(key) or uv.get('*')
        def m(p):
            x, y, z = p
            return {'t': ((x - x0) / W, (z - z0) / D), 'b': ((x - x0) / W, (z - z0) / D), 'f': ((x - x0) / W, (y - y0) / H),
                    'k': ((x1 - x) / W, (y - y0) / H), 'r': ((z1 - z) / D, (y - y0) / H), 'l': ((z - z0) / D, (y - y0) / H)}[key]
        sub.poly(pts, [fn(*m(p)) for p in pts], tuple(n))
    bm.free(); return pm.add(sub, M)


def lathe_parts(pm, parts, n, rep=1, M=None, a0=0.0):
    """剖面旋轉體（照 lathe2，但一條剖面可以分好幾段、各段用自己的區塊）：parts＝[(剖面, uv(s,t)), ...]，t＝該段的弧長比例；
    u 繞一圈重複 rep 次、不來回翻（貼圖左右要能接：胎紋 V 字不能被鏡像）"""
    assert n % rep == 0
    sub = PM(); per = n // rep
    for prof, fn in parts:
        d = arclen(prof); tot = max(d[-1], 1e-9)
        for j in range(len(prof) - 1):
            (r0, y0), (r1, y1) = prof[j], prof[j + 1]; v0, v1 = d[j] / tot, d[j + 1] / tot
            if abs(r1 - r0) + abs(y1 - y0) < 1e-9: continue
            dr, dy = r1 - r0, y1 - y0; nx, ny = dy, -dr
            for k in range(n):
                b0, b1 = a0 + 2 * math.pi * k / n, a0 + 2 * math.pi * (k + 1) / n; am = (b0 + b1) / 2
                u0 = (k % per) / per; u1 = u0 + 1 / per
                pts = [(r0 * math.cos(b0), y0, r0 * math.sin(b0)), (r0 * math.cos(b1), y0, r0 * math.sin(b1)), (r1 * math.cos(b1), y1, r1 * math.sin(b1)), (r1 * math.cos(b0), y1, r1 * math.sin(b0))]
                uvs = [fn(u0, v0), fn(u1, v0), fn(u1, v1), fn(u0, v1)]
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


def extrude(pm, base, E, cap_fn, side_fn=None, M=None, caps=(True, True)):
    """平面多邊形（3D 點，可以凹）沿 E 擠出：兩個端面（多邊形交給 to_blender 的 triangulate）＋側面四邊形。
    cap_fn(p)→uv；side_fn(第幾條邊, 沿邊 0~1, 沿 E 0~1)→uv（沒給就用 cap_fn）"""
    Bp = [np.array(p, float) for p in base]; E = np.array(E, float); Tp = [b + E for b in Bp]; n = len(Bp)
    En = E / np.linalg.norm(E); sgn = 1.0 if np.dot(newell(Bp), En) > 0 else -1.0
    sub = PM()
    if caps[0]: sub.poly(Bp, [cap_fn(p) for p in Bp], tuple(-E))
    if caps[1]: sub.poly(Tp, [cap_fn(p) for p in Tp], tuple(E))
    for i in range(n):
        j = (i + 1) % n; out = np.cross(Bp[j] - Bp[i], En) * sgn
        if side_fn: uvs = [side_fn(i, 0, 0), side_fn(i, 1, 0), side_fn(i, 1, 1), side_fn(i, 0, 1)]
        else: uvs = [cap_fn(Bp[i]), cap_fn(Bp[j]), cap_fn(Tp[j]), cap_fn(Tp[i])]
        sub.poly([Bp[i], Bp[j], Tp[j], Tp[i]], uvs, tuple(out))
    return pm.add(sub, M)


def quad(pm, pts, uvs, want): pm.poly([np.array(p, float) for p in pts], uvs, want)


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


# ================= 1. 輪胎 =================
def tire_profile(ri, ro, w):
    """輪胎橫截面（r, y），逆時針：下胎側（胎唇→胎肩）、胎面（下胎肩→上胎肩，圓的）、上胎側（胎肩→胎唇）、內圈"""
    hw, bw = w / 2, 0.36 * w; a = 0.028 if ro < 0.226 else 0.031; b = 0.94 * hw; sh = ro - a - ri
    bot = [(ri, -bw), (ri + 0.13 * sh, -(bw + 0.009)), (ri + 0.62 * sh, -hw), (ri + sh, -b)]
    crown = [(ri + sh + a * math.cos(p), b * math.sin(p)) for p in np.linspace(-math.pi / 2, math.pi / 2, 6)]
    top = [(r, -y) for r, y in reversed(bot)]
    return bot, crown, top, [(ri, bw), (ri, -bw)], ri + 0.62 * sh


def tire(dims, kind, n=28, rep=4):
    ri, ro, w = dims; bot, crown, top, inner, _ = tire_profile(ri, ro, w)
    tr = 'tread_new' if kind == 'new' else 'tread_old'
    sb = 'side_new' if kind == 'new' else 'side_old'
    st = {'new': 'side_new', 'old': 'side_old', 'dusty': 'side_old_top'}[kind]
    parts = [(bot, lambda s, t, r=sb: ruv(r, s, t)), (crown, lambda s, t, r=tr: ruv(r, s, t)),
             (top, lambda s, t, r=st: ruv(r, s, 1 - t)), (inner, S('rub_in'))]
    pm = PM(); lathe_parts(pm, parts, n, rep); return pm


def xf(M, V): return (M[:3, :3] @ V.T).T + M[:3, 3]


def inside_cyl(Pw, Minv, ro, hw, m):
    q = xf(Minv, Pw); return (np.hypot(q[:, 0], q[:, 2]) < ro + m) & (np.abs(q[:, 1]) < hw + m)


def inside_ring(Pw, Minv, ri, ro, hw, m):
    q = xf(Minv, Pw); r = np.hypot(q[:, 0], q[:, 2]); return (r > ri - m) & (r < ro + m) & (np.abs(q[:, 1]) < hw + m)


INFO = {}


def tire_stack():
    pm = PM(); rng = np.random.default_rng(11); placed = []
    kinds = {'A': ['old', 'new', 'old', 'old', 'new', 'new', 'dusty'], 'B': ['new', 'old', 'new', 'old', 'dusty']}
    for key, cx, cz, dims in (('A', STACK_A_X, 0.0, TIRE10), ('B', STACK_B_X, STACK_B_Z, TIRE12)):
        ri, ro, w = dims; rc = tire_profile(*dims)[4]; top_y = 0.0
        for i, kd in enumerate(kinds[key]):
            tilt = 0.0 if i == 0 else rng.uniform(0.002, 0.009) * rng.choice((-1, 1))      # 少數微傾（不到 0.6°）
            td, yaw = rng.uniform(0, 2 * math.pi), rng.uniform(0, 2 * math.pi)
            ox, oz = rng.uniform(-0.013, 0.013, 2)
            cy = top_y + w / 2 + rc * abs(math.sin(tilt))
            M = T(cx + ox, cy, cz + oz) @ Ry(td) @ Rx(tilt) @ Ry(-td) @ Ry(yaw)
            sub = tire(dims, kd); pm.add(sub, M)
            placed.append({'stack': key, 'M': M, 'dims': dims, 'V': xf(M, np.array(sub.v))})
            top_y = cy + w / 2 + rc * abs(math.sin(tilt))
        INFO['stack_' + key + '_top'] = round(top_y, 4)
    # 斜靠的那條（10 吋舊胎）：立著、往後倒 14°；底貼地；往後推到碰到乙疊（或甲疊）為止
    sub = tire(TIRE10, 'old'); V = np.array(sub.v); ri, ro, w = TIRE10
    Rm = Rx(-LEAN) @ Rx(math.pi / 2) @ Ry(rng.uniform(0, 2 * math.pi))
    Vr = xf(Rm, V); yl = -Vr[:, 1].min() - 0.003; xl = STACK_B_X + 0.025
    z = STACK_B_Z + 0.9; hit = False
    while z > STACK_B_Z:
        Pw = Vr + np.array((xl, yl, z)); Ml = T(xl, yl, z) @ Rm; Mli = np.linalg.inv(Ml)
        for p in placed:
            if inside_cyl(Pw, np.linalg.inv(p['M']), p['dims'][1], p['dims'][2] / 2, 0.002).any() or \
               inside_ring(p['V'], Mli, ri, ro, w / 2, 0.002).any():
                hit = True; break
        if hit: break
        z -= 0.002
    assert hit, '斜靠的輪胎沒有碰到輪胎疊'
    z += 0.004                                                                      # 退回 2 mm＋留 2 mm：剛好靠著、不穿插
    Ml = T(xl, yl, z) @ Rm; pm.add(sub, Ml)
    Pw = xf(Ml, V); Mli = np.linalg.inv(Ml)
    for p in placed:   # 再確認一次
        assert not inside_cyl(Pw, np.linalg.inv(p['M']), p['dims'][1], p['dims'][2] / 2, 0.0005).any()
        assert not inside_ring(p['V'], Mli, ri, ro, w / 2, 0.0005).any()
    gaps = []
    for p in placed:
        if p['stack'] != 'B': continue
        q = xf(np.linalg.inv(p['M']), Pw); gaps.append(float((np.hypot(q[:, 0], q[:, 2]) - p['dims'][1]).min()))
    INFO['lean'] = {'center': [round(xl, 4), round(yl, 4), round(z, 4)], 'lean_deg': 14, 'min_gap_to_stack_B_m': round(min(gaps), 4),
                    'top_y': round(float(Pw[:, 1].max()), 4)}
    return pm


# ================= 2. 洞洞板 =================
def hole(i, j): return GX0 + i * PEG_P, GY0 + j * PEG_P


def snap(x, y):
    i = int(round((x - GX0) / PEG_P)); j = int(round((y - GY0) / PEG_P))
    return min(PEG_NX - 1, max(0, i)), min(PEG_NY - 1, max(0, j))


def wire_y(hy, z): return hy + HOOK_RISE * max(0.0, z - 0.03)


def hook(pm, hx, hy, L_=0.075, up=0.012):
    """洞洞板的直鉤：從孔裡穿出來、往前微微上翹、尖端往上彎"""
    tip = 0.03 + L_
    pts = [(hx, hy, 0.012), (hx, hy, 0.03), (hx, wire_y(hy, tip), tip), (hx, wire_y(hy, tip) + up, tip + 0.005)]
    sweep(pm, pts, WIRE_R, 6, S('wire'), caps=False)


def wrench(pm, i, j, d, Lt):
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.06)
    ri = 0.58 * d; ro = ri + 0.0045 + 0.12 * d; tb = 0.0042 + 0.2 * d; Rj = d / 2 + 0.0045 + 0.16 * d
    to, ts = 0.85 * tb, 0.62 * tb; Lc = Lt - ro - Rj
    zm = BOARD_Z1 + 0.0015 + tb / 2
    cy = wire_y(hy, zm) + WIRE_R - ri                                               # 梅花端的孔頂貼著鉤子
    uvf = lambda p: ruv('tool_steel', (cy + ro - p[1]) / 0.26, 0.5 + (p[0] - hx) / 0.05)
    ring = [(ri, -tb / 2), (ro - 0.0012, -tb / 2), (ro, -tb / 2 + 0.0012), (ro, tb / 2 - 0.0012), (ro - 0.0012, tb / 2), (ri, tb / 2), (ri, -tb / 2)]
    lathe_parts(pm, [(ring, R('tool_steel'))], 12, 1, M=T(hx, cy, zm) @ Rx(math.pi / 2))
    v0, v1 = cy - 0.72 * ro, cy - Lc + 0.7 * Rj; vm = (v0 + v1) / 2
    wb, ws, wn = 1.05 * ro, 0.5 * ro + 0.002, 1.15 * Rj
    sh = [(hx - wb / 2, v0), (hx - ws / 2, vm), (hx - wn / 2, v1), (hx + wn / 2, v1), (hx + ws / 2, vm), (hx + wb / 2, v0)]
    extrude(pm, [(x, y, zm - ts / 2) for x, y in sh], (0, 0, ts), uvf)
    oc = cy - Lc; jt = 0.0025 + 0.12 * d; ph = math.acos(min(0.97, (d / 2 + jt) / Rj)); al = math.radians(35)
    pts = [(hx + Rj * math.cos(f), oc + Rj * math.sin(f)) for f in np.linspace(math.pi / 2 + al, math.pi + ph, 3)]
    yt = oc - Rj * math.sin(ph) + 0.0006
    pts += [(hx - d / 2, yt), (hx - d / 2, oc), (hx - 0.3 * d, oc + 0.14 * d), (hx, oc + 0.19 * d), (hx + 0.3 * d, oc + 0.14 * d), (hx + d / 2, oc), (hx + d / 2, yt)]
    pts += [(hx + Rj * math.cos(f), oc + Rj * math.sin(f)) for f in np.linspace(2 * math.pi - ph, 2 * math.pi + math.pi / 2 - al, 3)]
    extrude(pm, [(x, y, zm - to / 2) for x, y in pts], (0, 0, to), uvf)
    return cy - Lc - Rj


def screwdriver(pm, x, ytop, z, hl, sl, col):
    prof = [(0.0072, 0.0), (0.0105, 0.004), (0.0132, 0.016), (0.0142, 0.45 * hl), (0.0136, 0.82 * hl), (0.0118, 0.95 * hl), (0.0082, hl), (0.0, hl + 0.0012)]
    lathe_parts(pm, [(prof, S(col))], 8, 1, M=T(x, ytop, z))
    sweep(pm, [(x, ytop + 0.006, z), (x, ytop - sl + 0.012, z), (x, ytop - sl, z)], lambda u: 0.0031 if u < 0.6 else 0.0019, 6, S('chrome'))


def pliers(pm, i, j, col):
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.065)
    zc = BOARD_Z1 + 0.002 + 0.0065; yp = wire_y(hy, zc) + WIRE_R + 0.0135
    uvf = lambda p: ruv('tool_steel', (yp + 0.06 - p[1]) / 0.26, 0.5 + (p[0] - hx) / 0.05)
    jaw = [(-0.0105, 0.0), (-0.0098, 0.018), (-0.0068, 0.040), (-0.0035, 0.054), (0.0, 0.057), (0.0035, 0.054), (0.0068, 0.040), (0.0098, 0.018), (0.0105, 0.0), (0.0075, -0.0085), (-0.0075, -0.0085)]
    extrude(pm, [(hx + u, yp + v, zc - 0.005) for u, v in jaw], (0, 0, 0.010), uvf)
    lathe_parts(pm, [([(0.0, -0.0066), (0.0085, -0.0066), (0.0092, -0.005), (0.0092, 0.005), (0.0085, 0.0066), (0.0, 0.0066)], S('chrome'))], 10, 1, M=T(hx, yp, zc) @ Rx(math.pi / 2))
    for sg in (-1, 1):
        sweep(pm, [(hx + sg * 0.0047, yp - 0.006, zc), (hx + sg * 0.0085, yp - 0.022, zc), (hx + sg * 0.0118, yp - 0.04, zc)], 0.0042, 6, S('chrome'))
        sweep(pm, [(hx + sg * 0.0112, yp - 0.036, zc), (hx + sg * 0.0158, yp - 0.07, zc), (hx + sg * 0.0205, yp - 0.104, zc), (hx + sg * 0.0232, yp - 0.13, zc)],
              lambda u: 0.0058 + 0.0012 * u, 6, S(col))


def socket_rail(pm, x0, y):
    socks = [(0.0085, 0.025), (0.009, 0.025), (0.0095, 0.025), (0.0105, 0.026), (0.0115, 0.026), (0.0125, 0.027), (0.0135, 0.028), (0.015, 0.030)]
    xs, x = [], x0 + 0.025
    for ro, _ in socks: x += ro; xs.append(x); x += ro + 0.009
    x1 = x + 0.016; zr = BOARD_Z1 + 0.010
    rbox(pm, x0, x1, y - 0.011, y + 0.011, BOARD_Z1, zr, {'*': S('rail')}, r=0.002)
    for (ro, Lq), xc in zip(socks, xs):
        n = 8 if ro < 0.0101 else 10; rf = 0.94 * ro
        M = T(xc, y, zr) @ Rx(math.pi / 2)
        lathe_parts(pm, [([(0.8 * ro, 0.0), (ro, 0.004), (ro, Lq - 0.0015), (rf, Lq)], S('chrome'))], n, 1, M=M)
        disk(pm, rf, Lq, n, lambda X, Z, rf=rf: ruv('socket_face', 0.5 + X / (2 * rf), 0.5 - Z / (2 * rf)), M=M)
    return x1


def ratchet(pm, i, j):
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.06)
    zb = BOARD_Z1 + 0.0015; th = 0.0085; rh = 0.0045; yh = wire_y(hy, zb + th / 2) + WIRE_R - rh; Lh = 0.2
    uvf = {'*': lambda s, t: ruv('tool_steel', s, t)}
    rbox(pm, hx - 0.0095, hx + 0.0095, yh - Lh + 0.012, yh + 0.012, zb, zb + th, uvf, r=0.0035, seg=1)
    disk(pm, rh, 0.0, 8, S('hole_dark'), M=T(hx, yh, zb + th + 0.0003) @ Rx(math.pi / 2))
    head = [(0.0, -0.0075), (0.0205, -0.0075), (0.022, -0.0055), (0.022, 0.0055), (0.0205, 0.0075), (0.0, 0.0075)]
    lathe_parts(pm, [(head, R('tool_steel'))], 14, 1, M=T(hx, yh - Lh, zb + 0.0075) @ Rx(math.pi / 2))
    rbox(pm, hx - 0.004, hx + 0.004, yh - Lh + 0.009, yh - Lh + 0.018, zb + 0.014, zb + 0.0185, {'*': S('chrome')}, r=0.0012)      # 換向撥桿
    rbox(pm, hx - 0.0048, hx + 0.0048, yh - Lh - 0.0048, yh - Lh + 0.0048, zb + 0.014, zb + 0.024, {'*': S('chrome')}, r=0.0008)  # 方頭


def tape_measure(pm, i, j):
    (x1, hy), (x2, _) = hole(i, j), hole(i + 2, j); hook(pm, x1, hy, 0.08); hook(pm, x2, hy, 0.08)
    xc = (x1 + x2) / 2; z0, z1 = 0.034, 0.070; yb = wire_y(hy, z1) + WIRE_R
    rbox(pm, xc - 0.034, xc + 0.034, yb, yb + 0.068, z0, z1, {'*': S('tape_body')}, r=0.014, seg=2)
    rbox(pm, xc - 0.0355, xc + 0.0355, yb + 0.003, yb + 0.065, z0 + 0.012, z1 - 0.012, {'*': S('tape_bump')}, r=0.012, seg=1)   # 一圈黑色橡膠
    rbox(pm, xc - 0.012, xc + 0.012, yb + 0.004, yb + 0.011, z1 - 0.004, z1 + 0.003, {'*': S('tape_blade')}, r=0.001)
    rbox(pm, xc - 0.013, xc + 0.013, yb + 0.002, yb + 0.014, z1 + 0.003, z1 + 0.0045, {'*': S('chrome')}, r=0.0006)
    rbox(pm, xc - 0.011, xc + 0.011, yb + 0.014, yb + 0.062, 0.0285, z0 + 0.001, {'*': S('chrome')}, r=0.002)                    # 皮帶夾
    rbox(pm, xc - 0.006, xc + 0.006, yb + 0.064, yb + 0.072, z0 + 0.012, z1 - 0.01, {'*': S('tape_bump')}, r=0.002)             # 鎖定鈕


HEAD = [(-0.050, 0.003), (-0.034, 0.0), (0.030, 0.0), (0.040, 0.007), (0.050, 0.012), (0.058, 0.008), (0.066, -0.004), (0.069, -0.016),
        (0.0712, -0.003), (0.068, 0.012), (0.060, 0.023), (0.046, 0.030), (0.020, 0.031), (-0.034, 0.029), (-0.050, 0.026)]


def hammer(pm, i, j):
    (x1, hy), (x2, _) = hole(i, j), hole(i + 2, j); hook(pm, x1, hy, 0.07); hook(pm, x2, hy, 0.07)
    xe = (x1 + x2) / 2; z0, z1 = 0.031, 0.057; zc = (z0 + z1) / 2; y0 = wire_y(hy, z1) + WIRE_R
    extrude(pm, [(xe + u, y0 + v, z0) for u, v in HEAD], (0, 0, z1 - z0), S('ham_head'))
    face = [(0.0112, 0.0), (0.0135, 0.004), (0.0135, 0.010), (0.0118, 0.0128), (0.0, 0.0128)]
    lathe_parts(pm, [(face[:4], S('ham_head')), (face[3:], S('ham_face'))], 12, 1, M=T(xe - 0.046, y0 + 0.0148, zc) @ Rz(math.pi / 2))
    sweep(pm, [(xe, y0 + 0.022, zc), (xe, y0 - 0.1, zc), (xe, y0 - 0.2, zc)], 0.0125, 8, lambda s, t: ruv('wood', s, t), caps=False)
    sweep(pm, [(xe, y0 - 0.19, zc), (xe, y0 - 0.25, zc), (xe, y0 - 0.30, zc), (xe, y0 - 0.305, zc)], lambda u: 0.0142 if u < 0.95 else 0.0128, 8, S('grip_black'))


def tool_wall():
    pm = PM(); rng = np.random.default_rng(23)
    for yb in (0.95, 1.50, 2.05):                                                   # 板背後三條木條（撐離牆 2 cm）
        rbox(pm, -1.15, 1.15, yb - 0.02, yb + 0.02, 0.0, BOARD_Z0, {'*': S('batten')}, r=0.0)
    g0x, g0y, t8 = GX0 - PEG_P / 2, GY0 - PEG_P / 2, 8 * PEG_P
    xs = [BOARD_X0] + [g0x + t8 * k for k in range(12)] + [g0x + PEG_NX * PEG_P, BOARD_X1]
    ys = [BOARD_Y0] + [g0y + t8 * k for k in range(6)] + [g0y + PEG_NY * PEG_P, BOARD_Y1]
    gxe, gye = g0x + PEG_NX * PEG_P, g0y + PEG_NY * PEG_P; oily_n = 0
    for xa, xb in zip(xs, xs[1:]):
        for ya, yb in zip(ys, ys[1:]):
            ingrid = xa >= g0x - 1e-9 and xb <= gxe + 1e-9 and ya >= g0y - 1e-9 and yb <= gye + 1e-9
            tx = g0x + t8 * math.floor((xa - g0x) / t8 + 1e-9); ty = g0y + t8 * math.floor((ya - g0y) / t8 + 1e-9)
            u0, u1, v0, v1 = (xa - tx) / t8, (xb - tx) / t8, (ya - ty) / t8, (yb - ty) / t8
            if xa < g0x - 1e-9: u0, u1 = 1 - (xb - xa) / t8, 1.0
            if ya < g0y - 1e-9: v0, v1 = 1 - (yb - ya) / t8, 1.0
            if xb > gxe + 1e-9: u0, u1 = 0.0, (xb - xa) / t8
            if yb > gye + 1e-9: v0, v1 = 0.0, (yb - ya) / t8
            xm, ym = (xa + xb) / 2, (ya + yb) / 2
            if ingrid:
                p_oil = 0.08 + 0.8 * math.exp(-((xm / 0.6) ** 2 + ((ym - 1.12) / 0.24) ** 2))   # 下方中間（手拿工具的地方）沾油的多
                reg = 'peg_oily' if rng.random() < p_oil else 'peg_clean'; oily_n += reg == 'peg_oily'
            else: reg = 'board_plain'
            uvs = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
            if ingrid and abs(u1 - u0 - 1) < 1e-6 and abs(v1 - v0 - 1) < 1e-6:     # 完整的格子：隨機轉 90°／鏡像（孔是對稱的），看不出重複
                k = int(rng.integers(4)); uvs = uvs[k:] + uvs[:k]
                if rng.random() < 0.5: uvs = [(1 - a, b) for a, b in uvs]
            quad(pm, [(xa, ya, BOARD_Z1), (xb, ya, BOARD_Z1), (xb, yb, BOARD_Z1), (xa, yb, BOARD_Z1)], [ruv(reg, a, b) for a, b in uvs], (0, 0, 1))
    INFO['peg_cells_oily'] = oily_n
    quad(pm, [(BOARD_X0, BOARD_Y0, BOARD_Z0), (BOARD_X1, BOARD_Y0, BOARD_Z0), (BOARD_X1, BOARD_Y1, BOARD_Z0), (BOARD_X0, BOARD_Y1, BOARD_Z0)], [S('board_back')()] * 4, (0, 0, -1))
    for (p0, p1, wv) in (((BOARD_X0, BOARD_Y1), (BOARD_X1, BOARD_Y1), (0, 1, 0)), ((BOARD_X0, BOARD_Y0), (BOARD_X1, BOARD_Y0), (0, -1, 0)),
                         ((BOARD_X0, BOARD_Y0), (BOARD_X0, BOARD_Y1), (-1, 0, 0)), ((BOARD_X1, BOARD_Y0), (BOARD_X1, BOARD_Y1), (1, 0, 0))):
        quad(pm, [(p0[0], p0[1], BOARD_Z0), (p1[0], p1[1], BOARD_Z0), (p1[0], p1[1], BOARD_Z1), (p0[0], p0[1], BOARD_Z1)], [S('board_edge')()] * 4, wv)
    # 第一排：扳手 6 支（梅花端套在鉤子上）、起子架、套筒軌道、棘輪扳手
    x = -1.075
    for d, Lt in ((0.008, 0.125), (0.010, 0.145), (0.012, 0.165), (0.014, 0.19), (0.017, 0.215), (0.019, 0.24)):
        i, j = snap(x, 1.88); wrench(pm, i, j, d, Lt); x += 0.058 + 1.4 * d
    INFO['wrenches_end_x'] = round(x, 3)
    ry, rx0, rx1 = 1.765, -0.50, -0.12
    rbox(pm, rx0, rx1, ry - 0.012, ry, 0.030, 0.088, {'*': S('rail')}, r=0.002)
    for bx in (rx0 + 0.006, rx1 - 0.021):
        rbox(pm, bx, bx + 0.015, ry - 0.05, ry, BOARD_Z1, 0.034, {'*': S('rail')}, r=0.0015)
    for k, (hl, sl, col) in enumerate(((0.10, 0.10, 'sd_red'), (0.09, 0.075, 'sd_yellow'), (0.11, 0.15, 'sd_black'), (0.10, 0.125, 'sd_blue'), (0.085, 0.10, 'sd_red'))):
        screwdriver(pm, rx0 + 0.05 + k * 0.07, ry, 0.059, hl, sl, col)
    INFO['socket_rail_x'] = [0.0, round(socket_rail(pm, 0.0, 1.905), 3)]
    ratchet(pm, *snap(0.80, 1.945))
    hook(pm, *hole(*snap(1.02, 1.90)))
    # 第二排：鐵鎚（兩支鉤子）、捲尺（兩支鉤子）、鉗子 2 支、空鉤子
    hammer(pm, *snap(-1.0, 1.50))
    hook(pm, *hole(*snap(-0.72, 1.47)))
    tape_measure(pm, *snap(-0.47, 1.48))
    pliers(pm, *snap(0.18, 1.52), 'pl_red'); pliers(pm, *snap(0.36, 1.52), 'pl_blue')
    hook(pm, *hole(*snap(0.64, 1.47))); hook(pm, *hole(*snap(0.88, 1.36)))
    return pm


# ================= 3. 角鋼層架 =================
def post(pm, sx, sz):
    cx, cz, ix, iz = sx * SH_X, sz * SH_Z, -sx, -sz
    L2 = [(cx, cz), (cx + ix * 0.04, cz), (cx + ix * 0.04, cz + iz * 0.002), (cx + ix * 0.002, cz + iz * 0.002), (cx + ix * 0.002, cz + iz * 0.04), (cx, cz + iz * 0.04)]
    side = lambda i, s, t: ruv('post', s if i in (0, 2) else 1 - s, 0.007 + t * 0.993) if i in (0, 2, 3, 5) else ruv('sw_shelf_edge', .5, .5)
    extrude(pm, [(x, 0.012, z) for x, z in L2], (0, SH_H - 0.012, 0), S('shelf_edge'), side)
    rbox(pm, cx + min(0, ix * 0.044), cx + max(0, ix * 0.044), 0.0, 0.012, cz + min(0, iz * 0.044), cz + max(0, iz * 0.044), {'*': S('foot')}, r=0.0)


def shelf_panel(pm, ys, flip):
    th = 0.0012
    ut = lambda x, z: ruv('shelf_top', (x + PX) / (2 * PX) if not flip else (PX - x) / (2 * PX), (z + PZ) / (2 * PZ))
    quad(pm, [(-PX, ys, -PZ), (PX, ys, -PZ), (PX, ys, PZ), (-PX, ys, PZ)], [ut(-PX, -PZ), ut(PX, -PZ), ut(PX, PZ), ut(-PX, PZ)], (0, 1, 0))
    quad(pm, [(-PX + th, ys - th, -PZ + th), (PX - th, ys - th, -PZ + th), (PX - th, ys - th, PZ - th), (-PX + th, ys - th, PZ - th)], [S('shelf_under')()] * 4, (0, -1, 0))
    lo = ys - LIP
    for (a, b, nrm) in ((((-PX, PZ), (PX, PZ)), None, (0, 0, 1)), (((PX, -PZ), (-PX, -PZ)), None, (0, 0, -1)),
                        (((PX, PZ), (PX, -PZ)), None, (1, 0, 0)), (((-PX, -PZ), (-PX, PZ)), None, (-1, 0, 0))):
        (x0, z0), (x1, z1) = a; nv = np.array(nrm, float)
        quad(pm, [(x0, lo, z0), (x1, lo, z1), (x1, ys, z1), (x0, ys, z0)], [ruv('shelf_lip', 0, 0), ruv('shelf_lip', 1, 0), ruv('shelf_lip', 1, 1), ruv('shelf_lip', 0, 1)], tuple(nv))
        ii = -nv * th
        quad(pm, [(x0 + ii[0], lo, z0 + ii[2]), (x1 + ii[0], lo, z1 + ii[2]), (x1 + ii[0], ys - th, z1 + ii[2]), (x0 + ii[0], ys - th, z0 + ii[2])], [S('shelf_under')()] * 4, tuple(-nv))
        quad(pm, [(x0, lo, z0), (x1, lo, z1), (x1 + ii[0], lo, z1 + ii[2]), (x0 + ii[0], lo, z0 + ii[2])], [S('shelf_edge')()] * 4, (0, -1, 0))
    for sx in (-1, 1):                                                              # 四角三角補強片（層板底下）
        for sz in (-1, 1):
            c = (sx * (PX - 0.001), sz * (PZ - 0.001))
            tri = [(c[0], ys - th, c[1]), (c[0] - sx * 0.085, ys - th, c[1]), (c[0], ys - th, c[1] - sz * 0.085)]
            extrude(pm, tri, (0, -0.003, 0), S('shelf_edge'))


def carton(pm, x, y, z, W, H, D, yaw, flip=False):
    f = (lambda r: (lambda s, t: ruv(r, 1 - s, t))) if flip else R
    rbox(pm, -W / 2, W / 2, 0.0, H, -D / 2, D / 2, {'t': f('carton_top'), 'l': f('carton_end'), 'r': f('carton_end'), '*': f('carton_side')}, r=0.006, M=T(x, y, z) @ Ry(yaw))
    return x, z, W, D, yaw


def oil_bottle(pm, x, y, z, yaw, col, cap):
    sub = PM()
    rbox(sub, -0.05, 0.05, 0.0, 0.17, -0.032, 0.032, {'*': S(col)}, r=0.008)
    sh = [(-0.049, 0.165), (0.049, 0.165), (0.049, 0.20), (0.044, 0.205), (0.004, 0.205), (-0.049, 0.185)]
    extrude(sub, [(u, v, -0.029) for u, v in sh], (0, 0, 0.058), S(col))
    lathe_parts(sub, [([(0.016, 0.0), (0.016, 0.015)], S(col))], 10, 1, M=T(0.024, 0.2, 0))
    lathe_parts(sub, [([(0.0185, 0.0), (0.0195, 0.003), (0.0195, 0.018), (0.017, 0.021), (0.0, 0.021)], S(cap))], 10, 1, M=T(0.024, 0.213, 0))
    pm.add(sub, T(x, y, z) @ Ry(yaw))


def part_bin(pm, x, y, z, color):
    prof = [(-0.085, 0.0), (0.075, 0.0), (0.092, 0.064), (0.083, 0.072), (-0.085, 0.10)]       # 側面（z, y）：後高前低、前面一片斜的擋板
    side = lambda i, s, t: ruv('bin_top_' + color, t, s) if i == 3 else ruv('sw_bin_' + color, .5, .5)
    extrude(pm, [(x - 0.0525, y + v, z + u) for u, v in prof], (0.105, 0, 0), S('bin_' + color), side)


def cloth_grid(pm, G, reg):
    rows, cols = len(G), len(G[0])
    for a in range(rows - 1):
        for b in range(cols - 1):
            p = [G[a][b], G[a][b + 1], G[a + 1][b + 1], G[a + 1][b]]
            n = np.cross(np.array(p[1]) - np.array(p[0]), np.array(p[3]) - np.array(p[0]))
            pm.poly(p, [ruv(reg, b / (cols - 1), a / (rows - 1)), ruv(reg, (b + 1) / (cols - 1), a / (rows - 1)),
                        ruv(reg, (b + 1) / (cols - 1), (a + 1) / (rows - 1)), ruv(reg, b / (cols - 1), (a + 1) / (rows - 1))], tuple(n))


def shelf_rag(pm, ys):
    """第三層前緣掛的舊抹布：一半鋪在層板上、一半從折邊垂下來（有皺褶）"""
    rng = np.random.default_rng(5); xs = np.linspace(0.37, 0.56, 7); G = []
    path = [(0.09, ys + 0.004), (0.15, ys + 0.005), (0.205, ys + 0.004), (0.226, ys - 0.004), (0.229, ys - 0.035), (0.232, ys - 0.08), (0.236, ys - 0.125)]
    for a, (zp, yp) in enumerate(path):
        row = []; hang = max(0.0, (ys - yp) / 0.12)
        for b, x in enumerate(xs):
            fold = 0.008 * math.sin(b * 1.9 + a * 0.7) * hang + (0.003 * abs(math.sin(b * 2.3 + a)) if hang == 0 else 0)
            dy = (0.0 if hang == 0 else rng.uniform(-0.01, 0.01) * hang) + (0.003 * abs(math.sin(b * 1.3)) if hang == 0 else 0)
            row.append((x + (0.006 * math.sin(a * 1.1 + b) if hang > 0 else 0), yp + dy, zp + fold))
        G.append(row)
    cloth_grid(pm, G, 'rag')


def parts_shelf():
    pm = PM()
    for sx in (-1, 1):
        for sz in (-1, 1): post(pm, sx, sz)
    for k, ys in enumerate(SHELF_Y): shelf_panel(pm, ys, k % 2 == 1)
    boxes = []
    y = SHELF_Y[0]
    boxes.append(carton(pm, -0.29, y, 0.0, 0.44, 0.30, 0.36, math.radians(2)))
    boxes.append(carton(pm, 0.27, y, 0.02, 0.38, 0.26, 0.32, math.radians(-3.5), True))
    y = SHELF_Y[1]
    cols = ['bottle_g', 'bottle_w', 'bottle_k', 'bottle_g', 'bottle_w', 'bottle_g', 'bottle_k', 'bottle_w']
    caps = {'bottle_g': 'cap_k', 'bottle_w': 'cap_r', 'bottle_k': 'cap_w'}
    rng = np.random.default_rng(3)
    for k, c in enumerate(cols):
        bx = -0.5 + k * 0.108 + (0.06 if k >= 5 else 0.0)
        oil_bottle(pm, bx, y, 0.03 + rng.uniform(-0.03, 0.03), rng.uniform(-0.12, 0.12), c, caps[c])
    boxes.append(carton(pm, 0.47, y, -0.01, 0.2, 0.2, 0.3, math.radians(4)))
    y = SHELF_Y[2]
    for k, c in enumerate(('blue', 'blue', 'yellow', 'gray', 'yellow', 'gray')):
        part_bin(pm, -0.33 + k * 0.112, y, -0.01, c)
    shelf_rag(pm, y)
    y = SHELF_Y[3]
    boxes.append(carton(pm, -0.31, y, 0.0, 0.40, 0.28, 0.34, math.radians(-2)))
    boxes.append(carton(pm, 0.12, y, 0.01, 0.30, 0.22, 0.30, math.radians(5), True))
    y = SHELF_Y[4]
    boxes.append(carton(pm, -0.22, y, 0.0, 0.36, 0.30, 0.32, math.radians(1.5), True))
    boxes.append(carton(pm, 0.25, y, 0.0, 0.26, 0.20, 0.30, math.radians(-5)))
    for (x, z, W, D, yaw) in boxes:                                                   # 箱子不能超出層板
        c, s = abs(math.cos(yaw)), abs(math.sin(yaw))
        assert abs(x) + (W * c + D * s) / 2 < PX - 0.005 and abs(z) + (W * s + D * c) / 2 < PZ - 0.005, (x, z, W, D)
    INFO['cartons'] = len(boxes); INFO['bottles'] = len(cols)
    return pm


# ================= 4. 升降台 =================
def lift():
    pm = PM(); bl = {'*': R('lift_blue')}
    FX0, FX1 = -0.80, 1.0
    for zs in (1, -1):                                                              # 底座框（貼地）
        rbox(pm, FX0, FX1, 0.0, 0.05, min(zs * 0.24, zs * 0.30), max(zs * 0.24, zs * 0.30), bl, r=0.005)
    for xc in (-0.77, -0.36, 0.97):
        rbox(pm, xc - 0.03, xc + 0.03, 0.0, 0.04, -0.24, 0.24, bl, r=0.004)
    # 檯面（半升起）
    rbox(pm, DECK_X0, DECK_X1, DECK_TOP - 0.05, DECK_TOP, -DECK_Z, DECK_Z, {'t': R('deck'), '*': R('lift_blue')}, r=0.006)
    # 剪刀臂（兩側各一個 X）
    xa, xb, ya, yb = -0.45, 0.55, 0.07, 0.27; ang = math.atan2(yb - ya, xb - xa); Lb = math.hypot(xb - xa, yb - ya); xm, ym = (xa + xb) / 2, (ya + yb) / 2
    for zs in (1, -1):
        for (sgn, zi) in ((1, (0.200, 0.212)), (-1, (0.214, 0.226))):
            z0, z1 = sorted((zs * zi[0], zs * zi[1]))
            rbox(pm, -Lb / 2 - 0.02, Lb / 2 + 0.02, -0.02, 0.02, z0, z1, bl, r=0.004, M=T(xm, ym, 0) @ Rz(sgn * ang))
        sweep(pm, [(xm, ym, zs * 0.19), (xm, ym, zs * 0.236)], 0.012, 8, S('pin'))
    for (x, y) in ((xa, ya), (xa, yb), (xb, ya), (xb, yb)):                           # 剪刀臂兩端的軸
        sweep(pm, [(x, y, -0.235), (x, y, 0.235)], 0.013, 8, S('pin'))
    # 油壓缸：底座橫梁 → 剪刀臂的橫管
    xt = 0.25; yt = ya + (xt - xa) / (xb - xa) * (yb - ya)
    sweep(pm, [(xt, yt, -0.205), (xt, yt, 0.205)], 0.014, 8, S('pin'))
    p0, p1 = np.array((-0.36, 0.075, 0.0)), np.array((xt, yt, 0.0)); dv = p1 - p0
    rbox(pm, -0.40, -0.32, 0.04, 0.07, -0.05, 0.05, bl, r=0.004)
    sweep(pm, [p0, p0 + 0.6 * dv], 0.032, 10, R('lift_blue'))
    sweep(pm, [p0 + 0.58 * dv, p1], 0.013, 8, S('rod'))
    # 前端 U 形夾座
    rbox(pm, 0.62, 0.90, DECK_TOP, DECK_TOP + 0.012, -0.11, 0.11, bl, r=0.003)
    U = smooth_open([(0.82, 0.62, -0.085), (0.82, 0.37, -0.085), (0.82, 0.36, -0.07), (0.82, 0.36, 0.07), (0.82, 0.37, 0.085), (0.82, 0.62, 0.085)], 1)
    sweep(pm, U, 0.016, 4, R('lift_blue'))
    for zs in (1, -1):
        sweep(pm, [(0.815, 0.55, zs * 0.085), (0.66, 0.355, zs * 0.085)], 0.011, 4, R('lift_blue'))
    rbox(pm, 0.83, 0.845, 0.37, 0.58, -0.076, 0.076, bl, r=0.003)
    rbox(pm, 0.818, 0.83, 0.42, 0.56, -0.06, 0.06, {'*': S('rubber')}, r=0.003)        # 擋板內側的橡膠墊
    # 後端斜坡板（鉸在檯面後緣、斜到地上）
    Lr = 0.5; hgt = DECK_TOP - 0.003; th = math.asin(hgt / Lr)
    rbox(pm, -Lr, 0.0, -0.012, 0.0, -0.25, 0.25, {'t': lambda s, t: ruv('deck', s * Lr / 1.6, 0.05 + 0.9 * t), '*': R('lift_blue')}, r=0.003,
         M=T(DECK_X0, hgt, 0) @ Rz(th))
    sweep(pm, [(DECK_X0 - 0.002, hgt - 0.014, -0.25), (DECK_X0 - 0.002, hgt - 0.014, 0.25)], 0.011, 8, S('pin'))
    INFO['ramp_end_x'] = round(DECK_X0 - Lr * math.cos(th), 3)
    # 腳踩油壓幫浦（+z 側）
    px, pz = -0.30, 0.36
    rbox(pm, px - 0.07, px + 0.07, 0.0, 0.012, 0.30, 0.42, bl, r=0.003)
    lathe_parts(pm, [([(0.05, 0.0), (0.05, 0.012), (0.036, 0.016), (0.035, 0.19), (0.04, 0.195), (0.04, 0.215), (0.0, 0.218)], R('lift_blue'))], 12, 1, M=T(px, 0.012, pz))
    sweep(pm, [(px + 0.01, 0.215, pz), (px + 0.12, 0.17, pz + 0.02), (px + 0.22, 0.12, pz + 0.04)], 0.011, 6, R('lift_blue'))
    rbox(pm, -0.06, 0.06, -0.008, 0.008, -0.045, 0.045, {'t': S('tread_pad'), '*': S('rubber')}, r=0.004, M=T(px + 0.26, 0.115, pz + 0.045) @ Rz(-0.2))
    hose = smooth_open([(px - 0.02, 0.03, pz - 0.035), (-0.42, 0.035, 0.36), (-0.55, 0.062, 0.33), (-0.56, 0.088, 0.18), (-0.52, 0.062, 0.05),
                        (-0.47, 0.045, 0.01), (-0.42, 0.047, 0.0), (-0.39, 0.052, 0.0)], 2)                       # 從底座橫梁上面、剪刀臂軸下面穿過去
    sweep(pm, hose, 0.0065, 6, S('hose_blk'))
    return pm


# ================= 5. 打氣機 =================
def air_pump():
    pm = PM()
    Mt = T(0, TANK_Y, 0) @ Rz(-math.pi / 2)                                          # 本地 y（軸）→ x；本地 x → 往下
    lathe_parts(pm, [(TANK_PROF, R('tank'))], 24, 1, M=Mt)
    lathe_parts(pm, [([(0.006, 0.0), (0.006, -0.012), (0.009, -0.014), (0.009, -0.024), (0.0, -0.025)], S('brass'))], 8, 1, M=T(0.0, 0.065, 0.0))   # 排水閥
    for xs_ in (-0.15, 0.07):                                                       # 馬達座（焊在氣筒上）
        rbox(pm, xs_ - 0.02, xs_ + 0.02, 0.31, 0.336, -0.06, 0.06, {'*': S('red_paint')}, r=0.003)
    rbox(pm, -0.20, 0.13, 0.335, 0.355, -0.075, 0.075, {'*': S('plate_gray')}, r=0.003)
    for xf_ in (-0.17, -0.02):
        rbox(pm, xf_ - 0.015, xf_ + 0.015, 0.353, 0.37, -0.05, 0.05, {'*': S('plate_gray')}, r=0.002)
    motor = [(0.0, -0.132), (0.045, -0.132), (0.058, -0.128), (0.064, -0.12), (0.066, -0.11)]
    body = [(0.066, -0.11), (0.066, 0.095), (0.062, 0.104), (0.05, 0.11)]
    lathe_parts(pm, [(motor, S('fan')), (body, R('motor'))], 16, 1, M=T(-0.09, 0.425, 0) @ Rz(-math.pi / 2))
    rbox(pm, 0.02, 0.115, 0.355, 0.43, -0.05, 0.05, {'*': S('alu')}, r=0.008)
    fins = [(0.042, 0.0), (0.042, 0.03)]
    for k in range(5):
        y0 = 0.03 + k * 0.016; fins += [(0.051, y0 + 0.001), (0.051, y0 + 0.007), (0.04, y0 + 0.009), (0.04, y0 + 0.016)]
    fins += [(0.047, 0.112), (0.047, 0.13), (0.04, 0.135), (0.0, 0.136)]
    lathe_parts(pm, [(fins, R('motor_fins'))], 10, 1, M=T(0.068, 0.39, 0))
    sweep(pm, smooth_open([(0.105, 0.50, 0.02), (0.135, 0.505, 0.03), (0.2, 0.47, 0.035), (0.205, 0.40, 0.035), (0.205, 0.33, 0.035)], 1), 0.005, 6, S('chrome'))
    rbox(pm, 0.12, 0.19, 0.30, 0.375, 0.02, 0.09, {'*': S('alu')}, r=0.004)                 # 分歧座
    rbox(pm, 0.125, 0.185, 0.375, 0.425, -0.045, 0.012, {'*': S('switch')}, r=0.004)       # 壓力開關
    sweep(pm, [(0.155, 0.37, 0.068), (0.155, 0.405, 0.068)], 0.004, 6, S('brass'))
    gM = T(0.155, 0.432, 0.06) @ Rx(math.pi / 2)
    lathe_parts(pm, [([(0.0, 0.0), (0.028, 0.0), (0.031, 0.004), (0.031, 0.018), (0.028, 0.021)], S('chrome'))], 16, 1, M=gM)
    disk(pm, 0.028, 0.0205, 16, lambda X, Z: ruv('gauge', 0.5 + X / 0.056, 0.5 - Z / 0.056), M=gM)
    cM = T(0.155, 0.345, 0.09) @ Rx(math.pi / 2)                                     # 出氣閥＋快速接頭（朝 +z）
    lathe_parts(pm, [([(0.008, 0.0), (0.008, 0.012), (0.0105, 0.014), (0.0105, 0.03), (0.0075, 0.032), (0.0075, 0.042)], S('brass'))], 8, 1, M=cM)
    # 提把（+x 端）
    hp = smooth_open([(0.235, 0.27, -0.085), (0.235, 0.53, -0.085), (0.235, 0.565, -0.06), (0.235, 0.565, 0.06), (0.235, 0.53, 0.085), (0.235, 0.27, 0.085)], 1)
    sweep(pm, hp, 0.0105, 8, S('handle_blk'))
    sweep(pm, [(0.235, 0.566, -0.048), (0.235, 0.566, 0.048)], 0.0145, 8, S('rubber'))
    # 輪子（−x 端）、橡膠腳（+x 端）
    sweep(pm, [(-0.19, 0.06, -0.19), (-0.19, 0.06, 0.19)], 0.008, 8, S('pin'))
    for zs in (1, -1):
        rbox(pm, -0.205, -0.175, 0.05, 0.11, zs * 0.09 - 0.006, zs * 0.09 + 0.006, {'*': S('red_paint')}, r=0.002)
        lathe_parts(pm, [([(0.012, -0.016), (0.04, -0.02)], S('hub')),
                         ([(0.04, -0.02), (0.055, -0.02), (0.06, -0.012), (0.06, 0.012), (0.055, 0.02), (0.04, 0.02)], S('rubber')),
                         ([(0.04, 0.02), (0.012, 0.016), (0.012, -0.016)], S('hub'))], 12, 1, M=T(-0.19, 0.06, zs * 0.165) @ Rx(math.pi / 2))
        rbox(pm, 0.17, 0.20, 0.018, 0.105, zs * 0.09 - 0.012, zs * 0.09 + 0.012, {'*': S('red_paint')}, r=0.003)
        lathe_parts(pm, [([(0.016, 0.0), (0.018, 0.004), (0.018, 0.016), (0.014, 0.02), (0.0, 0.02)], S('rubber'))], 8, 1, M=T(0.185, 0.0, zs * 0.09))
    # 紅色風管：旁邊地上捲 4 圈（螺旋）
    hr = 0.008; cx, cz = 0.58, 0.12; turns = 4; per = 22; pts = []
    for k in range(turns * per + 1):
        th = 2 * math.pi * k / per + math.pi / 2                                    # 從前面（+z）開始、往左繞
        rr = 0.165 + 0.012 * math.sin(th * 0.5 + 1.0) + 0.006 * math.sin(th * 1.7)
        pts.append((cx + rr * math.cos(th), hr + (2 * hr + 0.0012) * k / per, cz + rr * math.sin(th)))
    end = np.array(pts[-1]); start = np.array(pts[0])
    lead = smooth_open([tuple(end), tuple(end + (-0.02, 0.012, 0.05)), (0.33, 0.14, 0.20), (0.24, 0.26, 0.205), (0.17, 0.33, 0.17), (0.155, 0.345, 0.14), (0.155, 0.345, 0.13)], 2)
    out_ = smooth_open([(0.62, 0.0125, 0.42), (0.6, 0.0115, 0.36), tuple(start + (0.0, 0.0, 0.04)), tuple(start)], 2)
    sweep(pm, out_[:-1] + pts + lead[1:], hr, 6, S('hose_red'))
    INFO['hose_points'] = len(out_) + len(pts) + len(lead)
    chM = T(0.62, 0.0125, 0.42) @ align_y((0.6, 0.0, 0.8))
    lathe_parts(pm, [([(0.0, 0.0), (0.009, 0.0), (0.009, 0.026), (0.0125, 0.03), (0.0125, 0.052), (0.008, 0.058), (0.0, 0.059)], S('brass'))], 8, 1, M=chM)
    rbox(pm, -0.004, 0.004, 0.028, 0.06, 0.009, 0.0135, {'*': S('chrome')}, r=0.0015, M=chM)   # 打氣頭的撥桿
    return pm


# ================= 6. 廢油桶 =================
def oil_drum():
    pm = PM()
    lathe_parts(pm, [(DRUM_PROF, R('drum_side'))], 32, 1)
    disk(pm, DRUM_LID_R, DRUM_LID_Y, 32, lambda X, Z: ruv('drum_top', 0.5 + X / 0.6, 0.5 + Z / 0.6), rings=3)
    bx, bz = BUNG_BIG; sx, sz_ = BUNG_SMALL
    lathe_parts(pm, [([(0.032, 0.0), (0.033, 0.004), (0.033, 0.009), (0.026, 0.011), (0.018, 0.011)], S('drum_bung'))], 12, 1, M=T(bx, DRUM_LID_Y - 0.001, bz))
    lathe_parts(pm, [([(0.022, 0.0), (0.023, 0.004), (0.023, 0.009), (0.018, 0.011), (0.0, 0.0115)], S('drum_bung'))], 10, 1, M=T(sx, DRUM_LID_Y - 0.001, sz_))
    out = [(0.0175, 0.80), (0.0185, 0.87), (0.026, 0.89), (0.07, 0.93), (0.13, 0.985), (0.19, 1.04), (0.199, 1.05), (0.201, 1.058), (0.196, 1.064)]
    inn = [(0.196, 1.064), (0.188, 1.056), (0.12, 0.99), (0.06, 0.935), (0.02, 0.895), (0.0145, 0.85), (0.0145, 0.80)]
    lathe_parts(pm, [(out, R('funnel_out')), (inn, lambda s, t: ruv('funnel_in', s, 1 - t))], 24, 2, M=T(bx, 0.0, bz))
    # 桶蓋上一團沾油的抹布（隆起的一團）
    rng = np.random.default_rng(9); rx, rz = RAG_DRUM; G = []
    rings = [(0.0, 0.058), (0.35, 0.05), (0.7, 0.03), (1.0, 0.004)]
    nseg = 12; jit = [1 + rng.uniform(-0.18, 0.18) for _ in range(nseg)]
    sub = PM()
    for k in range(nseg):
        a0, a1 = 2 * math.pi * k / nseg, 2 * math.pi * (k + 1) / nseg
        def P(f, hgt, a, kk):
            j = jit[kk % nseg]; return (rx + f * 0.10 * j * math.cos(a), DRUM_LID_Y + hgt * (1 + 0.25 * math.sin(kk * 2.1 + f * 5)) if f < 1 else DRUM_LID_Y + 0.003, rz + f * 0.075 * j * math.sin(a))
        for (f0, h0), (f1, h1) in zip(rings, rings[1:]):
            p = [P(f0, h0, a0, k), P(f1, h1, a0, k), P(f1, h1, a1, k + 1), P(f0, h0, a1, k + 1)]
            if f0 == 0: p = [P(0, h0, 0, 0), p[1], p[2]]
            sub.poly(p, [ruv('rag', 0.5 + (q[0] - rx) / 0.26, 0.5 + (q[2] - rz) / 0.26) for q in p], (0, 1, 0))
    pm.add(sub)
    return pm


# ================= 7. 塑膠椅 =================
def rsq(a, rc, y, n=4):
    """圓角正方形的一圈（16 點）"""
    pts = []
    for sx, sz, a0 in ((1, 1, 0.0), (-1, 1, math.pi / 2), (-1, -1, math.pi), (1, -1, 1.5 * math.pi)):
        cx, cz = sx * (a - rc), sz * (a - rc)
        for k in range(n): ang = a0 + math.pi / 2 * k / (n - 1); pts.append((cx + rc * math.cos(ang), y, cz + rc * math.sin(ang)))
    return pts


def loft(pm, A, Bv, fn, outward=True, closed=True):
    n = len(A); m = n if closed else n - 1
    for i in range(m):
        j = (i + 1) % n; p = [A[i], A[j], Bv[j], Bv[i]]; c = np.mean(np.array(p), 0)
        want = np.array((c[0], 0, c[2])) * (1 if outward else -1)
        pm.poly(p, [fn(q) for q in p], tuple(want))


def stool(color):
    pm = PM(); top = 'stool_top_' + color; side = 'stool_side_' + color
    sfn = lambda q: ruv(side, (math.atan2(q[2], q[0]) / (2 * math.pi)) % 1.0, q[1] / 0.26)
    H, Hs, rc = 0.26, 0.215, 0.04
    o_t, o_b = rsq(0.14, rc, H), rsq(0.145, rc, Hs)
    i_t, i_b = rsq(0.134, rc - 0.005, H - 0.004), rsq(0.139, rc - 0.005, Hs)
    pm.poly(o_t, [ruv(top, 0.5 + q[0] / 0.28, 0.5 + q[2] / 0.28) for q in o_t], (0, 1, 0))
    pm.poly(i_t, [sfn(q) for q in i_t], (0, -1, 0))
    loft(pm, o_t, o_b, sfn, True); loft(pm, i_t, i_b, sfn, False)
    for i in range(16):
        j = (i + 1) % 16; pm.poly([o_b[i], o_b[j], i_b[j], i_b[i]], [sfn(o_b[i])] * 4, (0, -1, 0))
    # 四隻往外張的腳：每個角一條圓角的 L 形片（上接裙邊、下往外張）
    for sx, sz in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
        rows = []
        for (y, a, ext) in ((Hs, 0.145, 0.045), (0.11, 0.158, 0.034), (0.0, 0.172, 0.024)):
            out, inn = [], []
            for (aa, rr, lst) in ((a, rc, out), (a - 0.005, rc - 0.005, inn)):
                cx, cz = sx * (aa - rr), sz * (aa - rr)
                lst.append((sx * aa, y, sz * (aa - rr - ext)))
                for k in range(4):
                    ph = math.pi / 2 * k / 3; lst.append((cx + sx * rr * math.cos(ph), y, cz + sz * rr * math.sin(ph)))
                lst.append((sx * (aa - rr - ext), y, sz * aa))
            rows.append((out, inn))
        for (oa, ia), (ob, ib) in zip(rows, rows[1:]):
            loft(pm, oa, ob, sfn, True, closed=False); loft(pm, ia, ib, sfn, False, closed=False)
            for e, wv in ((0, (0, 0, -sz)), (5, (-sx, 0, 0))):                       # 腳的兩條側邊（厚度）
                p = [oa[e], ob[e], ib[e], ia[e]]; pm.poly(p, [sfn(q) for q in p], wv)
        ob, ib = rows[-1]
        for i in range(5): pm.poly([ob[i], ob[i + 1], ib[i + 1], ib[i]], [sfn(ob[i])] * 4, (0, -1, 0))
    return pm


ITEMS = {'SHOP_TIRE_STACK': tire_stack, 'SHOP_TOOL_WALL': tool_wall, 'SHOP_PARTS_SHELF': parts_shelf, 'SHOP_LIFT': lift,
         'SHOP_AIR_PUMP': air_pump, 'SHOP_OIL_DRUM': oil_drum, 'SHOP_STOOL_RED': lambda: stool('red'), 'SHOP_STOOL_BLUE': lambda: stool('blue')}
# GLB 裡先排成店的一角（LAWWW2-B 擺放時用各自的原點）：牆面在 z −1.8；工具牆貼牆、層架在牆邊右側、輪胎左後、升降台前面中間、打氣機和油桶右前、椅子散在前面
SPREAD = {'SHOP_TOOL_WALL': (-0.35, 0.0, -1.8, 0), 'SHOP_PARTS_SHELF': (1.75, 0.0, -1.545, 0), 'SHOP_TIRE_STACK': (-2.25, 0.0, -1.42, 8),
          'SHOP_LIFT': (-0.05, 0.0, 0.05, 0), 'SHOP_AIR_PUMP': (1.45, 0.0, 0.62, -18), 'SHOP_OIL_DRUM': (2.4, 0.0, -0.55, 25),
          'SHOP_STOOL_RED': (-1.75, 0.0, 0.85, 22), 'SHOP_STOOL_BLUE': (0.95, 0.0, 1.35, -38)}
BUDGET = {'SHOP_TIRE_STACK': 10000, 'SHOP_TOOL_WALL': 5000, 'SHOP_PARTS_SHELF': 4500, 'SHOP_LIFT': 2500, 'SHOP_AIR_PUMP': 5500,
          'SHOP_OIL_DRUM': 2500, 'SHOP_STOOL_RED': 400, 'SHOP_STOOL_BLUE': 400}
TOTAL_BUDGET = 30000
SMOOTH = {'SHOP_TIRE_STACK': 0.8, 'SHOP_TOOL_WALL': 1.1, 'SHOP_PARTS_SHELF': 1.1, 'SHOP_LIFT': 1.1, 'SHOP_AIR_PUMP': 1.1,
          'SHOP_OIL_DRUM': 1.1, 'SHOP_STOOL_RED': 0.9, 'SHOP_STOOL_BLUE': 0.9}   # 6 邊的鉤子、風管要 ≥1.1 rad 才是圓的（SOP 第 11 節第 3 點）


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('scooter_shop_props', props={'kind': 'scooter_shop_props'})
    mat = bpy.data.materials.new('shop1'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
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
    print('INFO', json.dumps(INFO, ensure_ascii=False), flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['spread'] = {k: list(v) for k, v in SPREAD.items()}
    info['checks'] = INFO
    info['origins'] = {'*': '原點都在底部中央（地面）；遊戲座標 y 上、+z 朝前（朝觀眾）。GLB 裡先排成店的一角（spread：x, y, z, yaw°；牆面 z −1.8），擺放時用各自的原點',
                       'SHOP_TIRE_STACK': '甲疊 10 吋 7 條（中心 x −0.26）、乙疊 12 吋 5 條（x +0.26、z −0.015）；斜靠的 10 吋在乙疊 +z 前面（位置見 checks.lean）',
                       'SHOP_TOOL_WALL': '洞洞板 x −1.2～1.2、y 0.9～2.1；背面 z 0.02、板面 z 0.026；木條 z 0～0.02：原點放在牆面上（z＝牆），板面朝 +z',
                       'SHOP_PARTS_SHELF': '寬 1.2（x ±0.6）、深 0.45（z ±0.225）、高 1.8；層板 y 0.08、0.48、0.88、1.28、1.68；背面 z −0.225（離牆留 2～3 cm）',
                       'SHOP_LIFT': '底座框 x −0.80～1.0、z ±0.30；檯面 x −0.62～0.98、頂面 y 0.34；斜坡板到 x −1.02；前輪夾座在 +x；腳踏幫浦在 +z 側（z 到 0.45）',
                       'SHOP_AIR_PUMP': '氣筒軸沿 x（x ±0.275、中心 y 0.20）；輪子在 −x、提把和橡膠腳在 +x；風管捲在 +x 旁邊地上（圈中心約 (0.58, 0.12)）',
                       'SHOP_OIL_DRUM': '半徑 0.29、高 0.88；漏斗插在 (−0.185, 0.03) 的大桶塞（頂 1.064）、小桶塞 (0.17, −0.10)、抹布 (0.07, 0.13)',
                       'SHOP_STOOL_RED': '座面 0.28 見方、座高 0.26；腳往外張到 ±0.172',
                       'SHOP_STOOL_BLUE': '同紅色'}
    info['note'] = ('一個材質 shop1（底色 1024＋ORM 256，金屬度最高 0.40：工具、軸、套筒 0.2、檯面 0.15、塗裝 0）；'
                    'Poly Haven（CC0）：metal_plate（檯面菱形花紋：法線圖算明暗）、green_metal_rust（層架烤漆明暗、鏽點）、rusty_painted_metal（油桶油痕、底部鏽）、'
                    'rubber_tiles（輪胎橡膠顆粒）；其他是程式畫的。沒有任何文字、商標、品牌（D77）')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
