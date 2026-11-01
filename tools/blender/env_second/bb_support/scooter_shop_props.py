"""ART-SHOP1 公館機車行的道具組（BB-B 支援 LAWWW2-B；2026-10-16；新美術標準 ART_SOP.md v1 的驗證件）
給 LAWWW2-B 放進「公館機車行」的 2D 背景場景（傍晚）。做法照 ART-PARK3 park3_props.py：一張底色貼圖集＋ORM、網格工具照抄。
  產生 GLB：/opt/blenv/bin/python tools/blender/env_second/bb_support/scooter_shop_props.py [-- --out assets/models/env/second_ai/bb_support/scooter_shop_props.glb]
  渲染（傍晚、白天、背景試擺）：見 render_dusk.py 檔頭

座標：遊戲座標 y 往上、x 往右、+z 朝前（朝觀眾）；公尺。每件一個頂層節點，原點都在底部中央（地面）。

== 參考與尺寸（SOP 2-1；「依一般款式估計」＝沒有查到單一規格，照常見款式的量法估） ==
台灣機車行的辨識點：牆邊疊著的機車外胎、掛滿工具的洞洞板、角鋼架上的機油和紙箱、機車用的低升降台、紅色小空壓機（打氣）＋捲起來的紅風管、
接廢機油的藍色鐵桶＋大漏斗、紅藍塑膠矮凳、換下來的電瓶、傳動皮帶；店面是騎樓、鐵捲門。沒有真實店名、商標、品牌（D77）。
  SHOP_TIRE_STACK   機車外胎（速克達）：外徑＝輪框 + 2×胎寬×扁平比。10 吋（25.4 cm 輪框）：90/90-10 約 41.6、100/90-10 約 43.4、120/90-10 約 47 cm，胎寬 9～12 cm；
                    12 吋（30.5 cm）：110/70-12 約 45.9、120/70-12 約 47.3、130/70-12 約 48.7 cm，胎寬 11～13 cm。截面是圓的（胎面是一個圓弧，胎肩不是直角），不是汽車胎的方截面。
                    → 模型：10 吋外徑 45 cm、寬 10 cm（輪框半徑 0.127）；12 吋外徑 49 cm、寬 11.5 cm（輪框半徑 0.1524）；胎面＝半徑 w/2 的半圓，胎唇寬 0.32w。
                    甲疊 10 吋 7 條（x −0.26）、乙疊 12 吋 5 條（x +0.26），新舊混疊、每條偏移 ±1.3 cm、轉角隨機、少數微傾；
                    一條 10 吋立著往後倒 14°，斜靠在乙疊前面（位置照真的截面算：往後推到碰到為止，間隙 2～4 mm，不穿插）；這條最舊（朝前的胎側灰多、有刮痕）。
                    旋轉體 24 邊。胎紋：V 字斜溝＋中間直溝（程式畫的圖樣）；胎側細同心圓紋＋胎肩鋸齒；沒有字。
  SHOP_TOOL_WALL    洞洞板（硬質纖維板）：常見 4×8 呎（1.22×2.44 m）、厚 1/4 吋（6 mm）、孔距 1 吋（25.4 mm）、孔徑約 6 mm。
                    → 模型：2.4×1.2（x ±1.2、y 0.9～2.1）、厚 6 mm、93×46 孔；背後三條木條撐離牆 2 cm（背面 z 0.02、板面 z 0.026，原點在板子正下方的地面）；板邊 2 mm 倒角。
                    工具（依一般款式估計）：開口梅花扳手 8～21 mm、長 12.5～25.5 cm（12 支兩排）；起子總長 17～26 cm；老虎鉗、尖嘴鉗、斜口鉗長約 14～17 cm（各 2）；
                    套筒 3/8" 軌道 8 顆（外徑 1.7～3 cm）；棘輪扳手 20 cm；輪胎撬棒 25～30 cm（3）；黃油槍筒身 Ø 5.2 cm、長約 27 cm；捲尺 7×7×3.6 cm；鐵鎚頭 12 cm、柄 30 cm；
                    電工膠帶 Ø 6.2 cm、寬 1.9 cm（3 捲）；束帶一捆；捲起來的打氣管（兩圈多，Ø 約 21 cm）；機車傳動皮帶 2 條；抹布；零件盒 2 個；套筒盒 32×19×6 cm；空鉤子 6。
                    板面切成 4×4 孔一格（0.1016 m）：每一列一種區塊（上下髒的漸層連續）、常拿工具的 8 格手印／油、兩支空鉤子下面一格拿走的扳手輪廓印、一格滴下來的油；
                    板邊一圈磨損。金屬工具 #7d8084、金屬度 0.40、粗糙度 0.32～0.44（扳手中段被握亮）。
  SHOP_PARTS_SHELF  角鋼架（台灣常見「角鋼」免螺絲／螺絲角鋼架）：4 尺×1.5 尺×6 尺＝寬 120、深 45、高 180 cm；角鋼 40×40 mm、厚約 2 mm、成排長圓孔；層板折邊約 3 cm；
                    灰綠或灰色烤漆。→ 模型照這個尺寸，5 層板 y 0.08、0.48、0.88、1.28、1.68，四角三角補強片、柱腳塑膠墊。
                    放的：素面紙箱 7、無標籤 1 L 機油瓶 8（約 10×6.5×20 cm）、零件盒 6、機車電瓶 2（約 15×8.8×13 cm）、噴罐 2（Ø 6.6、高 22.7 cm）、沾油的舊抹布。
  SHOP_LIFT         機車用低升降台（剪刀式）：依一般款式估計，全長約 2.0～2.2 m、寬約 0.6～0.7 m、最低約 0.2 m、最高約 0.75～0.8 m；前端夾前輪的座、後端斜坡板、腳踩油壓。
                    → 模型：底座框 1.8×0.6、檯面 1.6×0.55、半升起（頂面 y 0.34）、斜坡板到 x −0.99（全長 1.99）；剪刀臂、油壓缸、U 形夾座、腳踩幫浦＋踏板（中間被踩亮）、
                    接油盤（Ø 0.36）、檯面上一塊抹布。藍色烤漆 #4a78ad，邊角掉漆、沾油；金屬零件倒角 3～6 mm。
  SHOP_AIR_PUMP     小型儲氣筒式空壓機（24 L 直驅式）：依一般款式估計，氣筒長約 55 cm、直徑約 28 cm；上面馬達＋散熱片汽缸、壓力錶、快速接頭；一端輪子一端橡膠腳＋提把。
                    → 模型照這個尺寸；紅色橡膠風管在旁邊地上捲 4 圈（Ø 約 33 cm），一頭接出氣閥、一頭是打氣頭。旋轉體：氣筒、輪子、錶 ≥14 邊。
  SHOP_OIL_DRUM     200 L 標準鐵桶：直徑約 57～58.5 cm、高約 88 cm、兩道滾筋、頂蓋兩個桶塞（2 吋、3/4 吋）。
                    → 模型：半徑 0.29（滾筋 0.292）、高 0.88、旋轉體 30 邊；大桶塞插著黃色大漏斗（Ø 40 cm、24 邊；裡面黑油），小桶塞蓋著；桶蓋上一塊抹布垂過桶邊。
                    藍色烤漆、從上緣往下流的黑色油痕、底部一圈鏽、滾筋磨到露鐵。
  SHOP_STOOL_RED／BLUE  台灣常見的塑膠矮凳（紅、藍）：依一般款式估計，高 22～30 cm、座面約 28～30 cm 見方；四面各一個大拱形開口，腳是側板往下延伸到地；
                    座面中間手提長孔、邊緣一圈往下翻的薄邊；一體成型、圓角大。
                    → 模型：座高 0.26、座面 0.296 見方（圓角 4 cm、邊緣 1 cm 圓角、往下翻的薄邊 2.2 cm）、殼由上半寬 0.136 往下張到 0.162、厚 3.5 mm；
                    拱門寬 0.18、高 0.155。塑膠粗糙度 0.56～0.6（座面邊緣被摸亮 0.42）。

== 材質 ==
一個材質 shop1（1024 底色貼圖集＋256 ORM；金屬度最高 0.40：SOP 寫上限 0.45、SCENE_RULES 9-2 寫 ≤0.40，取 0.40）。
Poly Haven（CC0）只取明暗、照目標色校色後畫進貼圖集：metal_plate（檯面、斜坡板的菱形花紋：用法線圖算明暗）、green_metal_rust（層架烤漆的明暗、鏽點）、
rusty_painted_metal（油桶的油痕、底部鏽）、rubber_tiles（輪胎橡膠的細顆粒；只取一片磚的內部、鏡像接）、fine_grained_wood（鐵鎚木柄）。
程式畫的只有：圖樣（胎紋、洞洞、長圓孔、刻度）、污漬、油、灰、刮痕、手印、紙箱、膠帶、抹布、塑膠（SOP 1：不拿隨機斑點冒充石材、木頭、混凝土）。
AO（SOP 2-5 的做法 1：畫進底色）：輪胎疊的接觸圈、胎面兩側、凳腳落地處和座面底下、桶底和滾筋下面、層架柱腳和層板折邊下面、層板靠折邊和角鋼的地方、升降台每個零件的下緣、
洞洞板下緣。每塊貼圖四周留 4 px（GLB 的貼圖是有損 WebP，隔壁區塊的顏色會滲過來）。
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
       'rubber': os.path.join(TEXB, 'rubber_tiles', 'rubber_tiles_diff_1k.jpg'),
       'wood': os.path.join(os.path.dirname(PARENT), 'textures', 'fine_grained_wood', 'fine_grained_wood_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40          # SOP 寫上限 0.45（b3lib.MAX_METAL）、SCENE_RULES 9-2 寫 ≤0.40：取 0.40 兩邊都符合

# ---- 顏色（sRGB）：底色不要太暗（遊戲沒有環境貼圖）；輪胎本來就暗 ----
RUB_NEW = (31, 31, 33)
RUB_OLD = (42, 41, 39)           # 舊胎（SOP 版之前 (47,46,44)：低角度的太陽下偏淺褐）
DUST = (150, 143, 130)
STEEL = (125, 128, 132)          # #7d8084：扳手、起子桿、鉗子頭、撬棒、套筒（金屬度 0.40；v1 是 #aeb0b4／0.2，暖光下偏米白）
PEG = (116, 94, 74)              # 咖啡色硬質纖維板（用舊了：偏暗、偏灰）
GRIME = (52, 40, 30)             # 手、油的髒
SHELF_GG = (128, 145, 131)       # 灰綠烤漆
CARTON = (174, 140, 102)         # 牛皮紙箱（SOP 版之前 (182,143,97)：暖光下太橘）
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
TIRE10 = (0.127, 0.225, 0.10)     # 內徑半徑（10 吋輪框）、外徑半徑（外徑 45 cm）、寬
TIRE12 = (0.1524, 0.245, 0.115)   # 12 吋輪框、外徑 49 cm、寬 11.5 cm
STACK_A_X, STACK_B_X, STACK_B_Z = -0.26, 0.26, -0.015
LEAN = math.radians(14)

PEG_P, PEG_NX, PEG_NY = 0.0254, 93, 46     # 孔數：板邊各留約 1.9 cm、1.6 cm
BOARD_X0, BOARD_X1, BOARD_Y0, BOARD_Y1, BOARD_Z0, BOARD_Z1 = -1.2, 1.2, 0.9, 2.1, 0.02, 0.026
GX0 = -(PEG_NX - 1) * PEG_P / 2
GY0 = (BOARD_Y0 + BOARD_Y1) / 2 - (PEG_NY - 1) * PEG_P / 2
WIRE_R, HOOK_RISE = 0.0022, 0.05
PEG_T = 4                                      # 洞洞板一格 4×4 孔（0.1016 m）
PEG_TW = PEG_T * PEG_P
G0X, G0Y = GX0 - PEG_P / 2, GY0 - PEG_P / 2    # 孔格的左下角
PEG_ROWS = -(-PEG_NY // PEG_T)                 # 12 列（最上面那列只有 2 孔高）
PEG_MARKS = [('ghost', 0.36, 1.30), ('oil', 0.56, 1.17)]   # 兩支空鉤子下面：拿走的扳手留下的乾淨輪廓印、滴下來的油（鉤子的位置）
PEG_SMUDGES = [(-0.19, 1.50), (0.05, 1.52), (-0.40, 1.74), (-0.05, 1.08), (0.30, 1.12), (-0.55, 1.22), (0.86, 1.86), (0.70, 1.42)]   # 常拿工具的地方

SHELF_Y = (0.08, 0.48, 0.88, 1.28, 1.68)
SH_X, SH_Z, SH_H, LIP = 0.6, 0.225, 1.8, 0.03
PX, PZ = 0.5975, 0.2225           # 層板（在角鋼裡面）

DECK_X0, DECK_X1, DECK_Z = -0.62, 0.98, 0.275
DECK_TOP = 0.34
TANK_L, TANK_R, TANK_Y = 0.55, 0.14, 0.20
DRUM_LID_Y, DRUM_LID_R = 0.866, 0.274
BUNG_BIG, BUNG_SMALL, RAG_DRUM = (-0.185, 0.03), (0.17, -0.10), (0.11, 0.17)

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
    'ps4': (256, 480, 320, 544), 'ps5': (320, 480, 384, 544), 'ps6': (384, 480, 448, 544), 'ps7': (448, 480, 512, 544),
    'peg_edge': (256, 544, 320, 608),     # 洞洞板邊上沒有孔的一圈（u 從板邊往裡、v 沿著邊）：磨損
    'zipties': (320, 544, 384, 608),      # 一捆束帶（s 沿著束、t 繞一圈）
    'ps8': (384, 544, 448, 608), 'ps9': (448, 544, 512, 608),      # 空鉤子下面的輪廓印、油
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
    'stool_side_red': (448, 608, 512, 672),
    'stool_side_blue': (384, 672, 448, 736),
    'gauge': (448, 672, 512, 736),        # 壓力錶錶面
    'socket_face': (0, 704, 32, 736),     # 套筒前面（暗色六角孔）
    'pedal_top': (32, 704, 96, 736),      # 升降台踏板的橡膠面：中間被踩亮
    'funnel_out': (704, 640, 832, 704),
    'funnel_in': (704, 704, 832, 768),
    'stool_top_red': (832, 640, 960, 768),
    'stool_top_blue': (832, 768, 960, 896),
    'motor_fins': (960, 640, 1024, 768),  # 汽缸散熱片（鋁）
}
for _j in range(12):                       # 洞洞板：每一列一種（上下的髒是連續的漸層；同一列左右可以接）
    REG['pr%d' % _j] = (64 * (_j % 8), 736 + 64 * (_j // 8), 64 * (_j % 8) + 64, 800 + 64 * (_j // 8))
for _k in range(4):                        # 常拿工具的地方：那一列的漸層＋手印、油（在格子邊上淡到 0，和隔壁接得起來）
    REG['ps%d' % _k] = (256 + 64 * _k, 800, 320 + 64 * _k, 864)
SW = {   # 小色塊：(顏色, 粗糙度, 金屬度)
    'rub_in': ((26, 26, 28), 0.9, 0.0), 'wire': ((168, 170, 174), 0.4, 0.2), 'board_edge': ((88, 70, 54), 0.85, 0.0),
    'board_back': ((96, 74, 54), 0.9, 0.0), 'batten': ((152, 120, 84), 0.8, 0.0), 'chrome': ((178, 180, 184), 0.24, 0.2), 'tool_chrome': ((125, 128, 132), 0.36, 0.40),
    'sd_red': ((190, 42, 40), 0.35, 0.0), 'sd_yellow': ((226, 182, 42), 0.35, 0.0), 'sd_black': ((44, 44, 46), 0.4, 0.0),
    'sd_blue': ((42, 90, 170), 0.35, 0.0), 'pl_red': ((184, 42, 38), 0.65, 0.0), 'pl_blue': ((44, 92, 168), 0.65, 0.0),
    'rail': ((84, 86, 90), 0.5, 0.0), 'tape_body': ((92, 96, 100), 0.55, 0.0), 'tape_bump': ((42, 42, 44), 0.85, 0.0),
    'tape_blade': ((216, 188, 76), 0.4, 0.1), 'ham_head': ((70, 72, 76), 0.5, 0.0), 'ham_face': ((125, 128, 132), 0.32, 0.40),
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
    'tape_red': ((176, 38, 34), 0.35, 0.0), 'tape_blue': ((40, 82, 160), 0.35, 0.0), 'tape_core': ((176, 150, 110), 0.85, 0.0),
    'grease_red': ((170, 42, 34), 0.4, 0.0), 'case_gray': ((72, 86, 102), 0.5, 0.0), 'battery': ((54, 56, 60), 0.6, 0.0),
    'term_red': ((176, 44, 36), 0.5, 0.0), 'spray_red': ((172, 46, 40), 0.35, 0.0), 'spray_gray': ((152, 156, 160), 0.35, 0.15),
    'pan_black': ((40, 40, 42), 0.55, 0.0),
}
SW_CELL, SW_X0, SW_Y0, SW_COLS = 32, 0, 896, 16
for i, k in enumerate(SW):
    REG['sw_' + k] = (SW_X0 + (i % SW_COLS) * SW_CELL, SW_Y0 + (i // SW_COLS) * SW_CELL, SW_X0 + (i % SW_COLS) * SW_CELL + SW_CELL, SW_Y0 + (i // SW_COLS) * SW_CELL + SW_CELL)
CONST = {'post': None}
METALS = {'tool_steel': 0.40, 'deck': 0.15, 'socket_face': 0.40, 'motor_fins': 0.15}


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


PAD = 4        # 每塊四周留 4 px 的邊：GLB 裡的貼圖是有損 WebP（色度分塊），隔壁區塊的顏色會滲過來幾 px，會接的區塊（洞洞板、胎紋）接縫會多一條線
WRAP = {'peg_edge', 'zipties', 'tread_new', 'tread_old', 'side_new', 'side_old', 'side_old_top', 'drum_side', 'tank', 'motor',
        'motor_fins', 'funnel_out', 'funnel_in'}   # 會一格一格接起來的區塊：邊用「繞回來」的內容補（其他的用最邊上那一排補）


def pad_region(name, a, p):
    return np.pad(a, ((p, p), (p, p)) + ((0, 0),) * (a.ndim - 2), mode='wrap' if name in WRAP else 'edge')


def raw(name): return name[:2] in ('pr', 'ps') and name[2:].isdigit()   # 洞洞板的格子：四周的邊直接畫延伸出去的內容（孔、漸層都接得上）


def put(P, name, img):
    """每塊各自縮好、四周補 PAD 再貼（整張一起縮，邊上會混到隔壁區塊的顏色）"""
    x0, y0, x1, y1 = REG[name]
    if raw(name): P.paste(img.resize((x1 - x0, y1 - y0), Image.LANCZOS), (x0, y0)); return
    a = np.asarray(img.resize((x1 - x0 - 2 * PAD, y1 - y0 - 2 * PAD), Image.LANCZOS))
    P.paste(Image.fromarray(pad_region(name, a, PAD)), (x0, y0))


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
    gw = max(3, int(0.0085 * ps)); K = 5; sp = PS / K; lines, small = [], []
    for k in range(K):
        s0 = (k + 0.5) * sp; s1 = s0 + sp / 2                    # 上下兩半錯開半格（V 字的兩邊）；胎肩那一截也有溝
        lines += [[P(s0, 0.56), P(s0 - 0.022, 0.76), P(s0 - 0.034, 0.97)], [P(s1, 0.44), P(s1 - 0.022, 0.24), P(s1 - 0.034, 0.03)]]
        small += [[P(s0 + sp * 0.32, 0.64), P(s0 + sp * 0.32 - 0.016, 0.84)], [P(s1 + sp * 0.32, 0.36), P(s1 + sp * 0.32 - 0.016, 0.16)]]
    m = np.maximum(wrap_lines(w, h, lines, gw, b=0.8 * SS), 0.6 * wrap_lines(w, h, small, max(2, gw // 2), b=0.6 * SS))
    cg = np.exp(-((T_ - 0.5) / (0.0058 / PT * 0.6)) ** 2)            # 中間一條直溝
    grain = rubber_grain(w, h, 4); big = soft(w, h, 3 + old, 40, 10, wrap='x')
    sh_ao = 1 - 0.15 * np.clip(1 - np.minimum(T_, 1 - T_) / 0.08, 0, 1)              # AO：胎面兩側（接近疊起來的接觸處）
    if old:
        center = np.exp(-((T_ - 0.5) / 0.17) ** 2)
        mo = np.maximum(m * (1 - 0.45 * center), 0.8 * cg)                                 # 胎面中間磨淺
        col = rgb(RUB_OLD, 0.6 * grain + 0.5 * big, 0.06) * (1 - 0.5 * mo)[..., None]
        dust_top = np.clip((T_ - 0.7) / 0.3, 0, 1) ** 1.5 * (0.6 + 0.4 * np.clip(soft(w, h, 7, 10, 3, wrap='x'), -1, 1))
        col = mix(col, DUST, 0.12 * mo + 0.18 * dust_top + 0.02)
        cr = cracks(w, h, 8, 10, 0.15, 0.85, (0.02, 0.05))
        col *= (1 - 0.35 * cr)[..., None]
        rough = 0.88 + 0.06 * mo; col *= sh_ao[..., None]
    else:
        mm = np.maximum(m, cg)
        col = rgb(RUB_NEW, 0.7 * grain + 0.3 * big, 0.06) * (1 - 0.7 * mm)[..., None]
        hi = np.clip(np.roll(mm, -2 * SS, axis=0) - mm, 0, 1)                             # 溝的上緣一點亮邊
        col += 9 * hi[..., None]; col *= sh_ao[..., None]
        rough = 0.7 + 0.22 * mm + 0.04 * np.clip(big, -1, 1)                               # 新胎一點脫模光澤（太亮會反射天空、變灰）
    return to_img(col), rough


def paint_sidewall(name, old, dusty):
    w, h, S_, T_ = grid(name)                                   # t：胎唇 0 → 胎肩 1
    grain = rubber_grain(w, h, 4); big = soft(w, h, 11 + 2 * old + dusty, 30, 8, wrap='x')
    rings = sum(np.exp(-((T_ - ti) / 0.008) ** 2) * wi for ti, wi in ((0.12, 1.0), (0.155, 0.8), (0.42, 0.6), (0.45, 0.6), (0.73, 0.9)))
    ser = blur(((np.abs(((S_ * 56) % 1.0) - 0.5) < 0.16) & (T_ > 0.86)).astype(np.float32), 0.7 * SS)   # 胎肩的鋸齒（每圈 224 個）
    bead = np.clip((0.09 - T_) / 0.09, 0, 1)
    ao = 1 - 0.18 * np.clip((T_ - 0.86) / 0.14, 0, 1) ** 1.5                        # AO：最寬那一圈（疊起來的接觸處）暗一點
    if not old:
        col = rgb(RUB_NEW, 0.7 * grain + 0.3 * big, 0.05) * (1 - 0.22 * rings - 0.3 * ser - 0.1 * bead)[..., None] * ao[..., None]
        rough = 0.66 + 0.12 * rings + 0.1 * ser - 0.08 * bead
        return to_img(col), rough
    col = rgb(RUB_OLD, 0.6 * grain + 0.5 * big, 0.05) * (1 - 0.14 * rings - 0.2 * ser)[..., None] * ao[..., None]
    cr = cracks(w, h, 13 + dusty, 9, 0.25, 0.85)
    col *= (1 - 0.4 * cr)[..., None]
    n = np.clip(soft(w, h, 17 + dusty, 8, 2, wrap='x'), -1.5, 1.5)
    if dusty:
        dust = np.clip(0.35 + 0.35 * n, 0, 1) * (0.55 + 0.45 * T_) + 0.25 * rings
        col = mix(col, DUST, 0.3 * dust)
        sc = scratches(w, h, 15, 26, 0.02, 0.07, ang=0.0, width=2) * (T_ > 0.6)                # 胎肩附近擦到路邊的刮痕
        col = mix(col, (126, 120, 110), 0.5 * sc)
    else:
        col = mix(col, DUST, 0.04 + 0.06 * rings + 0.03 * n)
    return to_img(col), 0.86 + 0.04 * rings


# ---- 洞洞板 ----
def peg_base_dirt(y):
    """整片板子的髒（0~1）：下半部越往下越髒（手、油），最上緣一點灰"""
    t = np.clip((1.58 - y) / 0.62, 0, 1); u = np.clip((y - 1.96) / 0.14, 0, 1); b = np.clip((1.12 - y) / 0.2, 0, 1)
    return 0.12 + 0.66 * t * t * (3 - 2 * t) + 0.12 * u * u * (3 - 2 * u) + 0.25 * b * b * (3 - 2 * b)     # v2：最下緣再髒一點


def seg_dist(X, Y, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay; t = np.clip(((X - ax) * dx + (Y - ay) * dy) / (dx * dx + dy * dy), 0, 1)
    return np.hypot(X - ax - t * dx, Y - ay - t * dy)


def paint_peg_tile(name, j, seed=None, kind='hand', c=0, hk=None):
    """洞洞板第 j 列的一格（4×4 孔）。畫布四周 PAD 的邊直接畫延伸出去的內容（孔是週期的、上下漸層是連續的），不另外補。
    seed：常拿工具的格子，加手印、油（乘上在格子邊上變 0 的窗，和隔壁的格子接得起來）"""
    w, h = sz(name); pp = PAD * SS; cw = w - 2 * pp; mp = cw / PEG_TW; ya = G0Y + PEG_TW * j
    X = (np.arange(w) + 0.5 - pp) / mp; Y = ya + (h - pp - (np.arange(h) + 0.5)) / mp
    XX, YY = np.meshgrid(X, Y)
    rng = np.random.default_rng(301 + j + 50 * (seed or 0))
    nz = rng.normal(0, 1, (h, cw)).astype(np.float32); nz = norm(blur(np.tile(nz, (1, 3)), 0.8)[:, cw:2 * cw]); fib = nz[:, (np.arange(w) - pp) % cw]
    D = peg_base_dirt(YY)
    if seed is not None:
        rs = np.random.default_rng(seed); U, V = XX / PEG_TW, (YY - ya) / PEG_TW
        win = (np.sin(np.pi * np.clip(U, 0, 1)) * np.sin(np.pi * np.clip(V, 0, 1))) ** 0.8
        sm = np.zeros_like(U)
        for _ in range(3): sm = np.maximum(sm, blob(U, V, rs.uniform(0.3, 0.7), rs.uniform(0.3, 0.7), rs.uniform(0.1, 0.2)) * rs.uniform(0.5, 0.9))
        ang = rs.uniform(-1.9, -1.2); cx, cy = rs.uniform(0.4, 0.6), rs.uniform(0.45, 0.6)   # 手指印：四道往下斜的短痕
        for k in range(4):
            ox, oy = cx + (k - 1.5) * 0.085 * math.cos(ang + math.pi / 2), cy + (k - 1.5) * 0.085 * math.sin(ang + math.pi / 2)
            L_ = rs.uniform(0.16, 0.26)
            sm = np.maximum(sm, 0.95 * np.exp(-(seg_dist(U, V, ox, oy, ox + L_ * math.cos(ang), oy + L_ * math.sin(ang)) / 0.028) ** 2))
        mod = np.clip(0.75 + 0.25 * np.clip(fib, -1, 1), 0, 1.2)
        D = D + 0.9 * sm * win * mod
    oil = np.zeros_like(D)
    if kind in ('ghost', 'oil'):                                                    # 空鉤子下面（窗比較陡：格子邊上 6% 才淡掉）
        U, V = XX / PEG_TW, (YY - ya) / PEG_TW; win2 = np.clip(np.minimum(np.minimum(U, 1 - U), np.minimum(V, 1 - V)) / 0.06, 0, 1)
        hxl, hy_ = hk[0] - (G0X + c * PEG_TW), hk[1]
        if kind == 'ghost':                                                         # 拿走的扳手：板子被擋住的地方比較乾淨，邊上一圈積的髒
            m = (np.hypot(XX - hxl, YY - (hy_ - 0.011)) < 0.0135) | ((np.abs(XX - hxl) < 0.0055) & (YY < hy_ - 0.018) & (YY > hy_ - 0.074)) | \
                ((np.hypot(XX - hxl, YY - (hy_ - 0.08)) < 0.0125) & ~((np.abs(XX - hxl) < 0.005) & (YY < hy_ - 0.08)))
            m = blur(m.astype(np.float32), 0.8 * SS); edge = np.clip(blur(m, 2.5 * SS) - m, 0, 1)
            D = D * (1 - 0.75 * m * win2) + 0.35 * edge * win2
        else:                                                                       # 掛油膩工具的地方：一灘油、往下滴三道
            oil = blob(XX, YY, hxl, hy_ - 0.012, 0.011)
            for ox, Ld in ((-0.006, 0.05), (0.002, 0.066), (0.008, 0.04)):
                dy = (hy_ - 0.015) - YY
                oil = np.maximum(oil, np.exp(-((XX - hxl - ox) / 0.0026) ** 2) * np.clip(1 - dy / Ld, 0, 1) * (dy > 0))
            oil = np.clip(oil * win2, 0, 1); D = D + 0.4 * oil
    D = np.clip(D, 0, 1)
    col = mix(mix(rgb(PEG, fib, 0.045), GRIME, 0.68 * D), (22, 17, 13), 0.7 * oil)
    fx = (XX / PEG_P) % 1 - 0.5; fy = ((YY - G0Y) / PEG_P) % 1 - 0.5; r = np.hypot(fx, fy) * PEG_P * mp; rh = 0.003 * mp
    hole = np.clip((rh + 0.6 - r) / 1.2, 0, 1); rim = np.exp(-((r - rh - 1.3) / 1.1) ** 2)
    lit = np.clip(-fy / 0.118, 0, 1)                                         # 洞的下半看得到下緣的孔壁（光從上面來；畫布往下是 y 變小）
    hole_col = (1 - lit)[..., None] * np.array((16, 12, 9), np.float32) + lit[..., None] * np.array((62, 48, 34), np.float32)
    col = col * (1 - (0.12 + 0.22 * D) * rim)[..., None]
    col = col * (1 - hole)[..., None] + hole_col * hole[..., None]
    rough = (0.8 - 0.34 * D - 0.2 * oil) * (1 - hole) + 0.95 * hole
    return to_img(col), rough


def paint_peg_edge():
    """板邊沒有孔的一圈：u 從板邊（0）往裡（1）、v 沿著邊。邊上磨毛、露出淺色纖維，再往裡一道髒"""
    w, h, S_, T_ = grid('peg_edge'); fib = soft(w, h, 311, 3, 0.8, wrap='y')
    col = mix(rgb(PEG, fib, 0.05), GRIME, 0.38 + 0.12 * np.clip(soft(w, h, 312, 10, 3, wrap='y'), -1, 1))
    n = soft(w, h, 313, 5, 1.4, wrap='y')
    fray = np.clip((0.28 - S_) / 0.28, 0, 1) * np.clip(0.5 + 0.5 * n, 0, 1)
    col = mix(col, (150, 124, 98), 0.55 * fray)
    col = mix(col, (40, 31, 24), 0.35 * np.exp(-((S_ - 0.42) / 0.08) ** 2) * np.clip(0.6 + 0.4 * n, 0, 1))
    chip = np.clip((n - 1.6) * 3, 0, 1) * (S_ < 0.25)
    col = mix(col, (34, 26, 20), 0.6 * chip)
    return to_img(col), 0.78 + 0.08 * fray


def paint_zipties():
    """一捆束帶：沿著束（s）一條一條；大多是白色尼龍，夾幾條黑的"""
    w, h, S_, T_ = grid('zipties'); rng = np.random.default_rng(321); k = 18
    idx = np.floor(T_ * k).astype(int) % k; black = rng.random(k) < 0.3; shade = rng.uniform(0.85, 1.05, k)
    base = np.where(black[idx][..., None], np.array((36, 36, 38), np.float32), np.array((222, 218, 200), np.float32)) * shade[idx][..., None]
    edge = np.abs(((T_ * k) % 1) - 0.5) > 0.38
    col = base * (1 - 0.35 * edge)[..., None]
    col = mix(col, (110, 100, 86), 0.25 * np.clip(soft(w, h, 322, 8, 2, wrap='y'), 0, 1))
    return to_img(col), 0.45 + 0.2 * edge


# ---- 工具 ----
def paint_tool_steel():
    w, h, S_, T_ = grid('tool_steel'); rng = np.random.default_rng(31)
    st = rng.normal(0, 1, (h, max(2, w // 24))).astype(np.float32)          # 沿長邊的拉絲：橫向變化慢、直向變化快
    st = norm(np.asarray(Image.fromarray(u8(st)).resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6)), np.float32))
    big = soft(w, h, 32, 30, 8); sm = np.clip(soft(w, h, 33, 12, 4) - 0.8, 0, 2) / 2              # 手摸的地方
    col = rgb(STEEL, st, 0.035) * (1 + 0.03 * big)[..., None]
    col = mix(col, (96, 92, 86), 0.35 * sm)
    grip = np.exp(-((S_ - 0.45) / 0.16) ** 2)                                       # 扳手、撬棒中段（手握的地方）：比較亮、比較滑
    col *= (1 + 0.06 * grip)[..., None]
    return to_img(col), 0.44 - 0.12 * grip + 0.04 * np.clip(st, -2, 2) / 2 + 0.12 * sm


def paint_socket_face():
    w, h, S_, T_ = grid('socket_face'); X, Y = S_ - 0.5, T_ - 0.5; r = np.hypot(X, Y)
    ang = np.arctan2(Y, X); hexr = 0.27 / np.cos(((ang + math.pi / 6) % (math.pi / 3)) - math.pi / 6)    # 六角孔
    col = np.zeros((h, w, 3), np.float32) + np.array(STEEL, np.float32)
    col = mix(col, (118, 120, 124), np.exp(-((r - 0.47) / 0.03) ** 2))                                   # 外緣倒角
    hole = np.clip((hexr - r) / 0.02, 0, 1); col = mix(col, (22, 22, 24), hole)
    col = mix(col, (100, 102, 106), np.clip(1 - np.abs(r - hexr - 0.02) / 0.03, 0, 1) * (1 - hole) * 0.6)
    return to_img(col), 0.3 + 0.6 * hole


def paint_wood():
    """鐵鎚木柄：Poly Haven fine_grained_wood 的明暗（木紋沿柄），校到淺木色；中間握的地方亮一點"""
    w, h, S_, T_ = grid('wood'); a = src_phys('wood', w, h, 0.3, 0.08, 0.5, mode='L')
    g = norm(a - blur(a, 30) * 0.5)
    hand = np.exp(-((S_ - 0.75) / 0.2) ** 2)
    col = rgb((186, 148, 100), g, 0.09) * (1 + 0.05 * hand)[..., None]
    return to_img(col), 0.45 + 0.03 * np.clip(g, -2, 2) - 0.1 * hand


def paint_pedal():
    """踏板的橡膠：橫紋防滑條；中間被腳踩亮、比較滑"""
    w, h, S_, T_ = grid('pedal_top'); rib = 0.5 + 0.5 * np.cos(T_ * 2 * math.pi * 7)
    worn = np.exp(-(((S_ - 0.5) / 0.3) ** 2 + ((T_ - 0.5) / 0.35) ** 2))
    col = rgb((46, 46, 48), fine(w, h, 181), 0.05) * (1 - 0.3 * rib * (1 - 0.6 * worn))[..., None] + 14 * worn[..., None]
    return to_img(col), 0.88 - 0.35 * worn


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
    col *= (1 - sum(0.14 * np.exp(-((Ym - (ys - 0.035)) / 0.012) ** 2) for ys in SHELF_Y))[..., None]   # AO：層板折邊下面
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
    dmin = np.minimum(np.minimum(S_, 1 - S_) * 1.2, np.minimum(T_, 1 - T_) * 0.45)
    edge = np.clip(1 - dmin / 0.012, 0, 1)
    col *= (1 - 0.16 * np.clip(1 - dmin / 0.03, 0, 1) ** 1.6)[..., None]             # AO：靠折邊、靠角鋼的地方
    col = mix(col, (150, 154, 148), 0.3 * edge * np.clip(n + 0.5, 0, 1) * (T_ > 0.9))  # 前緣被東西刮的地方
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
        col = mix(col, (120, 92, 62), 0.4 * np.clip((0.1 - T_) / 0.1, 0, 1) * np.clip(soft(w, h, 72, 6, 2) * 0.3 + 0.8, 0, 1.2))   # 底部（接觸、地上的灰）
        col = mix(col, (128, 98, 66), 0.25 * np.clip(1 - np.minimum(S_, 1 - S_) / 0.04, 0, 1))   # 邊角壓扁
        d = np.sqrt(((S_ - 0.7) / 0.17) ** 2 + ((T_ - 0.2) / 0.11) ** 2)                 # 一塊乾掉的水漬（有一圈邊），不是到處撒斑點
        col = mix(col, (128, 98, 66), 0.1 * np.clip(1 - d, 0, 1) ** 0.5 + 0.2 * np.exp(-((d - 1) / 0.06) ** 2))
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
    col = rgb((86, 92, 102), 0.4 * wr + 0.35 * weave + 0.4 * fine(w, h, 83), 0.09)
    rng = np.random.default_rng(84); oil = np.zeros_like(S_)
    for _ in range(8):
        oil = np.maximum(oil, blob(S_, T_, rng.uniform(0.15, 0.85), rng.uniform(0.15, 0.85), rng.uniform(0.07, 0.17)) * rng.uniform(0.6, 1.0))
    oil = np.clip(oil * (0.7 + 0.5 * np.clip(soft(w, h, 85, 6, 2), -1, 1)), 0, 1)
    col = mix(col, (36, 29, 22), 0.8 * oil)
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
    col = rgb((140, 144, 148), 0.25 * dz, 0.05) * np.clip(sh, 0.55, 1.35)[..., None]
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
    col *= (1 - 0.15 * np.clip((0.12 - T_) / 0.12, 0, 1))[..., None]                 # AO：每個零件的下緣（接地、接合）
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
    oil = wrap_lines(w, h, [[(x0, 0.45 * h), (x0 + 3, 0.45 * h + h * 0.04), (x0 + 1, 0.45 * h + h * 0.12)] for x0 in (0.3 * w, 0.34 * w, 0.63 * w, 0.7 * w)], 2 * SS, b=1.2 * SS)
    col = mix(col, (40, 26, 22), 0.45 * oil)                                       # 汽缸那一段往兩側流下來的油（沿著圓周）
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
    dfront = np.abs((ang - math.pi / 2 + math.pi) % (2 * math.pi) - math.pi)          # 抹布那一側（前面，u 0.25）也滴了一些
    wgt = 0.45 + 0.55 * np.exp(-(dfun / 1.0) ** 2) + 0.35 * np.exp(-(dfront / 0.6) ** 2)
    streak = np.clip(1.6 * streak * wgt * np.clip((T_ - 0.1) / 0.25, 0, 1), 0, 1)
    n = soft(w, h, 131, 16, 4, wrap='x')
    col = rgb(DRUM_BLUE, n, 0.05)
    col *= (1 - 0.18 * np.clip((0.3 - T_) / 0.3, 0, 1) * (0.7 + 0.3 * np.clip(soft(w, h, 134, 8, 2, wrap='x'), -1, 1)))[..., None]   # 下半截髒
    sc2 = scratches(w, h, 135, 30, 0.01, 0.05, width=1)
    col = mix(col, (128, 140, 156), 0.35 * sc2)                                        # 刮痕
    col = mix(col, (24, 22, 20), 0.88 * streak)
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
    ao = 0.22 * np.clip((0.035 - T_) / 0.035, 0, 1) + sum(0.12 * np.exp(-((T_ - (fr[i] - 0.012)) / 0.008) ** 2) for i in (5, 10))   # AO：桶底、滾筋下面
    col *= (1 - ao)[..., None]
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
    return to_img(col), 0.26 + 0.3 * film


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
    dust = np.clip(soft(w, h, 163 + len(name), 28, 7) * 0.2 + 0.25, 0, 1) + 0.5 * blur(dim.astype(np.float32), 1.2)   # 薄薄一層灰（大片、淡），小凹點裡積多一點
    edge = np.clip((np.maximum(np.abs(X), np.abs(Z)) - 0.125) / 0.015, 0, 1)
    col = mix(col, (190, 182, 170), np.clip(0.12 * dust * (1 - 0.7 * edge), 0, 1))
    col *= (1 + 0.05 * edge)[..., None]                                              # 座面邊緣（搬椅子、坐下時手抓的地方）：亮一點、滑一點
    return to_img(col), 0.58 + 0.2 * sc + 0.08 * dust * (1 - edge) + 0.35 * hole - 0.16 * edge   # 塑膠：粗糙度偏高、微微的光澤


def paint_stool_side(name, color):
    w, h, S_, T_ = grid(name); col = rgb(color, soft(w, h, 171 + len(name), 10, 3), 0.03)
    col *= (1 - 0.2 * np.clip((0.06 - T_) / 0.06, 0, 1) - 0.14 * np.clip((T_ - 0.88) / 0.12, 0, 1))[..., None]   # AO：腳落地處、座面底下
    low = np.clip((0.2 - T_) / 0.2, 0, 1)
    col = mix(col, (96, 88, 80), 0.35 * low * np.clip(soft(w, h, 172 + len(name), 5, 1.5) + 0.6, 0, 1.5))
    sc = scratches(w, h, 173 + len(name), 10, 0.05, 0.2, width=1)
    col = mix(col, (220, 214, 206), 0.3 * sc)
    return to_img(col), 0.6 + 0.15 * low + 0.15 * sc


def make_textures():
    check_regions()
    P = Image.new('RGB', (N, N), (128, 128, 128)); rough_full = {}

    def add(name, res):
        img, r = res if isinstance(res, tuple) else (res, None)
        put(P, name, img)
        if r is not None: rough_full[name] = np.asarray(r, np.float32) * np.ones((img.size[1], img.size[0]), np.float32)
    add('tread_new', paint_tread('tread_new', 0)); add('tread_old', paint_tread('tread_old', 1))
    add('side_new', paint_sidewall('side_new', 0, 0)); add('side_old', paint_sidewall('side_old', 1, 0)); add('side_old_top', paint_sidewall('side_old_top', 1, 1))
    for j in range(PEG_ROWS): add('pr%d' % j, paint_peg_tile('pr%d' % j, j))
    for k, (x, y) in enumerate(PEG_SMUDGES): add('ps%d' % k, paint_peg_tile('ps%d' % k, peg_cell(x, y)[1], seed=700 + k))
    for k, (kd, x, y) in enumerate(PEG_MARKS):
        hk = hole(*snap(x, y)); c, j = peg_cell(hk[0], hk[1] - 0.04)
        add('ps%d' % (8 + k), paint_peg_tile('ps%d' % (8 + k), j, kind=kd, c=c, hk=hk))
    add('peg_edge', paint_peg_edge()); add('zipties', paint_zipties())
    add('tool_steel', paint_tool_steel()); add('pedal_top', paint_pedal()); add('socket_face', paint_socket_face()); add('wood', paint_wood()); add('gauge', paint_gauge())
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
        x0, y0, x1, y1 = REG['sw_' + k]; d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=c)
    os.makedirs(GEN, exist_ok=True); P.save(ATLAS)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = 200; f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        a0, b0, a1, b1 = int(x0 * f), int(y0 * f), int(math.ceil(x1 * f)), int(math.ceil(y1 * f))
        if name in rough_full:
            pq = 0 if raw(name) else max(1, int(PAD * f))
            r = Image.fromarray((np.clip(rough_full[name], 0, 1) * 255).astype(np.uint8)).resize((a1 - a0 - 2 * pq, b1 - b0 - 2 * pq), Image.BOX)
            orm[b0:b1, a0:a1, 1] = pad_region(name, np.asarray(r), pq) if pq else np.asarray(r); orm[b0:b1, a0:a1, 2] = int(min(METALS.get(name, 0.0), METAL) * 255)
        elif name.startswith('sw_'):
            rough, metal = SW[name[3:]][1:]
            orm[b0:b1, a0:a1, 1] = int(rough * 255); orm[b0:b1, a0:a1, 2] = int(min(metal, METAL) * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格工具（照抄 park3_props.py；另加 Rx、Rz、extrude、lathe_parts）=================
def ruv(name, s, t):
    x0, y0, x1, y1 = REG[name]; ins = SW_CELL * 0.33 if name.startswith('sw_') else PAD
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


def inset_ring(P, En, sgn, b):
    """平面多邊形往裡縮 b（每個頂點沿兩條邊的內法線合成的方向；尖角限制 3 倍）"""
    n = len(P); outs = []
    for i in range(n):
        o = np.cross(P[(i + 1) % n] - P[i], En) * sgn; L_ = np.linalg.norm(o); outs.append(o / L_ if L_ > 1e-12 else o)
    Q = []
    for i in range(n):
        d = (outs[i - 1] + outs[i]) / max(1e-6, 1 + float(np.dot(outs[i - 1], outs[i]))); L_ = np.linalg.norm(d)
        Q.append(P[i] - b * (d / L_ * min(L_, 3.0) if L_ > 1e-9 else d))
    return Q


def extrude(pm, base, E, cap_fn, side_fn=None, M=None, caps=(True, True), skip=(), bevel=(0.0, 0.0)):
    """平面多邊形（3D 點，可以凹）沿 E 擠出：兩個端面（多邊形交給 to_blender 的 triangulate）＋側面四邊形。
    cap_fn(p)→uv；side_fn(第幾條邊, 沿邊 0~1, 沿 E 0~1)→uv（沒給就用 cap_fn）。
    bevel＝(底, 頂) 的倒角寬（公尺）：端面往裡縮、側面多一圈斜面（去積木化：硬邊看得到倒角）"""
    Bp = [np.array(p, float) for p in base]; E = np.array(E, float); n = len(Bp); Ln = np.linalg.norm(E)
    En = E / Ln; sgn = 1.0 if np.dot(newell(Bp), En) > 0 else -1.0; b0, b1 = bevel
    rings, tags = [], []                                                            # tags：這一圈到下一圈的斜面方向（−1 底、0 直、+1 頂）
    if b0 > 0: rings += [inset_ring(Bp, En, sgn, b0), [p + En * b0 for p in Bp]]; tags += [-1]
    else: rings += [Bp]
    tags += [0]
    if b1 > 0: rings += [[p + E - En * b1 for p in Bp], [q + E for q in inset_ring(Bp, En, sgn, b1)]]; tags += [1]
    else: rings += [[p + E for p in Bp]]
    sub = PM()
    if caps[0]: sub.poly(rings[0], [cap_fn(p) for p in rings[0]], tuple(-E))
    if caps[1]: sub.poly(rings[-1], [cap_fn(p) for p in rings[-1]], tuple(E))
    nr = len(rings) - 1
    for r in range(nr):
        A, Bv = rings[r], rings[r + 1]
        for i in range(n):
            if i in skip: continue
            j = (i + 1) % n; out = np.cross(Bp[j] - Bp[i], En) * sgn; out = out / max(1e-12, np.linalg.norm(out)) + En * tags[r]
            if side_fn: uvs = [side_fn(i, 0, r / nr), side_fn(i, 1, r / nr), side_fn(i, 1, (r + 1) / nr), side_fn(i, 0, (r + 1) / nr)]
            else: uvs = [cap_fn(A[i]), cap_fn(A[j]), cap_fn(Bv[j]), cap_fn(Bv[i])]
            sub.poly([A[i], A[j], Bv[j], Bv[i]], uvs, tuple(out))
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
    """機車胎的橫截面（r, y），逆時針：下胎側（胎唇 → 最寬處，往外變寬）、胎面（半徑 w/2 的半圓：最寬處 → 胎冠 → 最寬處，胎肩是圓的）、
    上胎側、內圈。最寬處在 r＝ro − w/2；胎唇窄（0.32w）。最後一個值是疊起來時接觸的半徑（最寬那一圈）"""
    hw, bw = w / 2, 0.32 * w; rm = ro - hw; d = rm - ri
    bot = [(ri, -bw)] + [(ri + d * t, -(bw + (hw - bw) * math.sin(t * math.pi / 2))) for t in (0.5, 1.0)]
    crown = [(rm + hw * math.cos(a), hw * math.sin(a)) for a in np.linspace(-math.pi / 2, math.pi / 2, 7)]
    top = [(r, -y) for r, y in reversed(bot)]
    return bot, crown, top, [(ri, bw), (ri, -bw)], rm


def tire_poly(dims):
    bot, crown, top, _, _ = tire_profile(*dims); return bot + crown[1:] + top[1:]


def in_poly(Pr, Py, poly):
    """點在多邊形裡（射線法，向量化）"""
    inside = np.zeros(Pr.shape, bool); n = len(poly)
    for k in range(n):
        (r0, y0), (r1, y1) = poly[k], poly[(k + 1) % n]
        if y0 == y1: continue
        inside ^= ((y0 > Py) != (y1 > Py)) & (Pr < r0 + (Py - y0) * (r1 - r0) / (y1 - y0))
    return inside


def tire(dims, kind, n=24, rep=4):
    ri, ro, w = dims; bot, crown, top, inner, _ = tire_profile(ri, ro, w)
    tr = 'tread_new' if kind == 'new' else 'tread_old'
    sb = 'side_new' if kind == 'new' else 'side_old'
    st = {'new': 'side_new', 'old': 'side_old', 'dusty': 'side_old_top'}[kind]
    parts = [(bot, lambda s, t, r=sb: ruv(r, s, t)), (crown, lambda s, t, r=tr: ruv(r, s, t)),
             (top, lambda s, t, r=st: ruv(r, s, 1 - t)), (inner, S('rub_in'))]
    pm = PM(); lathe_parts(pm, parts, n, rep); return pm


def xf(M, V): return (M[:3, :3] @ V.T).T + M[:3, 3]


def inside_tire(Pw, Minv, poly, m):
    """點（世界座標）在輪胎的胎體裡（照真的橫截面，不是圓柱）；m＞0：四個方向各推 m 再測一次（等於留 m 的間隙）"""
    q = xf(Minv, Pw); r = np.hypot(q[:, 0], q[:, 2]); y = q[:, 1]; hit = in_poly(r, y, poly)
    for dr, dy in (((m, 0), (-m, 0), (0, m), (0, -m)) if m > 0 else ()): hit |= in_poly(r + dr, y + dy, poly)
    return hit


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
            placed.append({'stack': key, 'M': M, 'Mi': np.linalg.inv(M), 'poly': tire_poly(dims), 'dims': dims, 'V': xf(M, np.array(sub.v))})
            top_y = cy + w / 2 + rc * abs(math.sin(tilt))
        INFO['stack_' + key + '_top'] = round(top_y, 4)
    # 斜靠的那條（10 吋舊胎）：立著、往後倒 14°；底貼地；往後推到碰到乙疊（或甲疊）為止
    sub = tire(TIRE10, 'dusty'); V = np.array(sub.v); ri, ro, w = TIRE10       # 最舊的一條：朝前（朝上）的胎側灰多、有刮痕
    Rm = Rx(-LEAN) @ Rx(math.pi / 2) @ Ry(rng.uniform(0, 2 * math.pi))
    Vr = xf(Rm, V); yl = -Vr[:, 1].min() - 0.003; xl = STACK_B_X + 0.025; polyL = tire_poly(TIRE10)

    def touching(z, m):
        Pw = Vr + np.array((xl, yl, z)); Mli = np.linalg.inv(T(xl, yl, z) @ Rm)
        return any(inside_tire(Pw, p['Mi'], p['poly'], m).any() or inside_tire(p['V'], Mli, polyL, m).any() for p in placed)
    z = STACK_B_Z + 0.9
    while z > STACK_B_Z and not touching(z, 0.002): z -= 0.002                    # 照真的橫截面測（圓的胎面），不是圓柱
    assert z > STACK_B_Z, '斜靠的輪胎沒有碰到輪胎疊'
    z += 0.002                                                                      # 退回一步（2 mm）：剛好靠著、不穿插（間隙 2～4 mm）
    assert not touching(z, 0.0005)                                                 # 再確認一次
    gap = next(m for m in np.arange(0.0005, 0.02, 0.0005) if touching(z, m))       # 間隙：推多少會碰到
    Ml = T(xl, yl, z) @ Rm; pm.add(sub, Ml); Pw = xf(Ml, V)
    INFO['lean'] = {'center': [round(xl, 4), round(yl, 4), round(z, 4)], 'lean_deg': 14, 'contact_gap_m': round(float(gap), 4),
                    'top_y': round(float(Pw[:, 1].max()), 4)}
    return pm


# ================= 2. 洞洞板 =================
def hole(i, j): return GX0 + i * PEG_P, GY0 + j * PEG_P


def peg_cell(x, y): return int(math.floor((x - G0X) / PEG_TW)), int(math.floor((y - G0Y) / PEG_TW))


def snap(x, y):
    i = int(round((x - GX0) / PEG_P)); j = int(round((y - GY0) / PEG_P))
    return min(PEG_NX - 1, max(0, i)), min(PEG_NY - 1, max(0, j))


def wire_y(hy, z): return hy + HOOK_RISE * max(0.0, z - 0.03)


def hook(pm, hx, hy, L_=0.075, up=0.012):
    """洞洞板的直鉤：從孔裡穿出來、往前微微上翹、尖端往上彎"""
    tip = 0.03 + L_
    pts = [(hx, hy, 0.012), (hx, hy, 0.03), (hx, wire_y(hy, tip), tip), (hx, wire_y(hy, tip) + up, tip + 0.005)]
    sweep(pm, pts, WIRE_R, 6, S('wire'), caps=False)


def wrench(pm, i, j, d, Lt, tilt=0.0):
    """開口梅花扳手：梅花端套在鉤子上、開口端朝下；tilt＝繞鉤子歪一點（掛得不整齊）"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.06); sub = PM()
    ri = 0.58 * d; ro = ri + 0.0045 + 0.12 * d; tb = 0.0042 + 0.2 * d; Rj = d / 2 + 0.0045 + 0.16 * d
    to, ts = 0.85 * tb, 0.62 * tb; Lc = Lt - ro - Rj
    zm = BOARD_Z1 + 0.0015 + tb / 2; wy = wire_y(hy, zm)
    cy = wy + WIRE_R - ri                                                           # 梅花端的孔頂貼著鉤子
    uvf = lambda p: ruv('tool_steel', (cy + ro - p[1]) / 0.26, 0.5 + (p[0] - hx) / 0.05)
    ring = [(ri, -tb / 2), (ro, -tb / 2), (ro, tb / 2), (ri, tb / 2), (ri, -tb / 2)]
    lathe_parts(sub, [(ring, R('tool_steel'))], 8 if d <= 0.011 else 10, 1, M=T(hx, cy, zm) @ Rx(math.pi / 2))
    v0, v1 = cy - 0.72 * ro, cy - Lc + 0.7 * Rj; vm = (v0 + v1) / 2
    wb, ws, wn = 1.05 * ro, 0.5 * ro + 0.002, 1.15 * Rj
    sh = [(hx - wb / 2, v0), (hx - ws / 2, vm), (hx - wn / 2, v1), (hx + wn / 2, v1), (hx + ws / 2, vm), (hx + wb / 2, v0)]
    extrude(sub, [(x, y, zm - ts / 2) for x, y in sh], (0, 0, ts), uvf, bevel=(0.0, 0.0012))
    oc = cy - Lc; jt = 0.0025 + 0.12 * d; ph = math.acos(min(0.97, (d / 2 + jt) / Rj)); al = math.radians(35)
    pts = [(hx + Rj * math.cos(f), oc + Rj * math.sin(f)) for f in np.linspace(math.pi / 2 + al, math.pi + ph, 3)]
    yt = oc - Rj * math.sin(ph) + 0.0006
    pts += [(hx - d / 2, yt), (hx - d / 2, oc), (hx - 0.3 * d, oc + 0.14 * d), (hx, oc + 0.19 * d), (hx + 0.3 * d, oc + 0.14 * d), (hx + d / 2, oc), (hx + d / 2, yt)]
    pts += [(hx + Rj * math.cos(f), oc + Rj * math.sin(f)) for f in np.linspace(2 * math.pi - ph, 2 * math.pi + math.pi / 2 - al, 3)]
    extrude(sub, [(x, y, zm - to / 2) for x, y in pts], (0, 0, to), uvf, bevel=(0.0, 0.0012))
    pm.add(sub, T(hx, wy, 0) @ Rz(tilt) @ T(-hx, -wy, 0))


def screwdriver(pm, x, ytop, z, hl, sl, col):
    prof = [(0.0072, 0.0), (0.0105, 0.004), (0.0132, 0.016), (0.0142, 0.45 * hl), (0.0136, 0.82 * hl), (0.0118, 0.95 * hl), (0.0082, hl), (0.0, hl + 0.0012)]
    lathe_parts(pm, [(prof, S(col))], 8, 1, M=T(x, ytop, z))
    sweep(pm, [(x, ytop + 0.006, z), (x, ytop - sl + 0.012, z), (x, ytop - sl, z)], lambda u: 0.0031 if u < 0.6 else 0.0019, 6, S('tool_chrome'), caps=False)


JAWS = {'comb': [(-0.0105, 0.0), (-0.0098, 0.018), (-0.0068, 0.040), (-0.0035, 0.054), (0.0, 0.057), (0.0035, 0.054), (0.0068, 0.040), (0.0098, 0.018), (0.0105, 0.0), (0.0075, -0.0085), (-0.0075, -0.0085)],
        'needle': [(-0.0088, 0.0), (-0.0078, 0.02), (-0.0042, 0.05), (-0.0018, 0.072), (0.0, 0.075), (0.0018, 0.072), (0.0042, 0.05), (0.0078, 0.02), (0.0088, 0.0), (0.0068, -0.0085), (-0.0068, -0.0085)],
        'diag': [(-0.011, 0.0), (-0.0118, 0.012), (-0.0095, 0.024), (-0.0045, 0.032), (0.0, 0.034), (0.0045, 0.032), (0.0095, 0.024), (0.0118, 0.012), (0.011, 0.0), (0.0075, -0.0085), (-0.0075, -0.0085)]}
JAW_LEN = {'comb': 0.055, 'needle': 0.073, 'diag': 0.0}
HANDLE_K = {'comb': 1.0, 'needle': 1.04, 'diag': 0.88}


def pliers(pm, i, j, col, kind='comb', tilt=0.0):
    """鉗子：胯下坐在鉤子上、鉗口朝上、兩支握把往下張開。kind：comb（老虎鉗）、needle（尖嘴鉗）、diag（斜口鉗）"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.065); top_pm = pm; pm = PM()
    zc = BOARD_Z1 + 0.002 + 0.0065; yp = wire_y(hy, zc) + WIRE_R + 0.0135; k = HANDLE_K[kind]
    uvf = lambda p: ruv('tool_steel', (yp + 0.08 - p[1]) / 0.26, 0.5 + (p[0] - hx) / 0.05)
    extrude(pm, [(hx + u, yp + v, zc - 0.005) for u, v in JAWS[kind]], (0, 0, 0.010), uvf, bevel=(0.0, 0.0012))
    if JAW_LEN[kind]:
        zf = zc + 0.0053; L_ = JAW_LEN[kind]
        quad(pm, [(hx - 0.0006, yp + 0.009, zf), (hx + 0.0006, yp + 0.009, zf), (hx + 0.0004, yp + L_, zf), (hx - 0.0004, yp + L_, zf)], [S('hole_dark')()] * 4, (0, 0, 1))
    else:                                                                            # 斜口鉗：刀口是一道斜的縫
        zf = zc + 0.0053
        quad(pm, [(hx - 0.0006, yp + 0.009, zf), (hx + 0.0006, yp + 0.009, zf), (hx + 0.0016, yp + 0.03, zf), (hx + 0.0004, yp + 0.03, zf)], [S('hole_dark')()] * 4, (0, 0, 1))
    lathe_parts(pm, [([(0.0, -0.0066), (0.0088, -0.0066), (0.0088, 0.0066), (0.0, 0.0066)], S('tool_chrome'))], 8, 1, M=T(hx, yp, zc) @ Rx(math.pi / 2))
    for sg in (-1, 1):
        sweep(pm, [(hx + sg * 0.0047, yp - 0.006, zc), (hx + sg * 0.0085, yp - 0.022 * k, zc), (hx + sg * 0.0118, yp - 0.04 * k, zc)], 0.0042, 6, S('tool_chrome'), caps=False)
        sweep(pm, [(hx + sg * 0.0112, yp - 0.036 * k, zc), (hx + sg * 0.0158, yp - 0.07 * k, zc), (hx + sg * 0.0205, yp - 0.104 * k, zc), (hx + sg * 0.0232, yp - 0.13 * k, zc)],
              lambda u: 0.0058 + 0.0012 * u, 6, S(col))
    wy = wire_y(hy, zc); top_pm.add(pm, T(hx, wy, 0) @ Rz(tilt) @ T(-hx, -wy, 0))


def socket_rail(pm, x0, y, socks=None):
    socks = socks or [(0.0085, 0.025), (0.009, 0.025), (0.0095, 0.025), (0.0105, 0.026), (0.0115, 0.026), (0.0125, 0.027), (0.0135, 0.028), (0.015, 0.030)]
    xs, x = [], x0 + 0.025
    for ro, _ in socks: x += ro; xs.append(x); x += ro + 0.009
    x1 = x + 0.016; zr = BOARD_Z1 + 0.010
    rbox(pm, x0, x1, y - 0.011, y + 0.011, BOARD_Z1, zr, {'*': S('rail')}, r=0.003)
    for (ro, Lq), xc in zip(socks, xs):
        n = 8; rf = 0.94 * ro
        M = T(xc, y, zr) @ Rx(math.pi / 2)
        lathe_parts(pm, [([(0.8 * ro, 0.0), (ro, 0.004), (ro, Lq - 0.0015), (rf, Lq)], S('tool_chrome'))], n, 1, M=M)
        disk(pm, rf, Lq, n, lambda X, Z, rf=rf: ruv('socket_face', 0.5 + X / (2 * rf), 0.5 - Z / (2 * rf)), M=M)
    return x1


def ratchet(pm, i, j):
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.06)
    zb = BOARD_Z1 + 0.0015; th = 0.0085; rh = 0.0045; yh = wire_y(hy, zb + th / 2) + WIRE_R - rh; Lh = 0.2
    uvf = {'*': lambda s, t: ruv('tool_steel', s, t)}
    rbox(pm, hx - 0.0095, hx + 0.0095, yh - Lh + 0.012, yh + 0.012, zb, zb + th, uvf, r=0.0035, seg=1)
    disk(pm, rh, 0.0, 8, S('hole_dark'), M=T(hx, yh, zb + th + 0.0003) @ Rx(math.pi / 2))
    head = [(0.0, -0.0075), (0.0205, -0.0075), (0.022, -0.0055), (0.022, 0.0055), (0.0205, 0.0075), (0.0, 0.0075)]
    lathe_parts(pm, [(head, R('tool_steel'))], 12, 1, M=T(hx, yh - Lh, zb + 0.0075) @ Rx(math.pi / 2))
    rbox(pm, hx - 0.004, hx + 0.004, yh - Lh + 0.009, yh - Lh + 0.018, zb + 0.014, zb + 0.0185, {'*': S('tool_chrome')}, r=0.0)       # 換向撥桿
    rbox(pm, hx - 0.0048, hx + 0.0048, yh - Lh - 0.0048, yh - Lh + 0.0048, zb + 0.014, zb + 0.024, {'*': S('tool_chrome')}, r=0.0)   # 方頭


def tape_measure(pm, i, j):
    (x1, hy), (x2, _) = hole(i, j), hole(i + 2, j); hook(pm, x1, hy, 0.08); hook(pm, x2, hy, 0.08)
    xc = (x1 + x2) / 2; z0, z1 = 0.034, 0.070; yb = wire_y(hy, z1) + WIRE_R
    rbox(pm, xc - 0.034, xc + 0.034, yb, yb + 0.068, z0, z1, {'*': S('tape_body')}, r=0.014, seg=2)
    rbox(pm, xc - 0.0355, xc + 0.0355, yb + 0.003, yb + 0.065, z0 + 0.012, z1 - 0.012, {'*': S('tape_bump')}, r=0.012, seg=1)   # 一圈黑色橡膠
    rbox(pm, xc - 0.012, xc + 0.012, yb + 0.004, yb + 0.011, z1 - 0.004, z1 + 0.003, {'*': S('tape_blade')}, r=0.0)
    rbox(pm, xc - 0.013, xc + 0.013, yb + 0.002, yb + 0.014, z1 + 0.003, z1 + 0.0045, {'*': S('tool_chrome')}, r=0.0)
    rbox(pm, xc - 0.011, xc + 0.011, yb + 0.014, yb + 0.062, 0.0285, z0 + 0.001, {'*': S('tool_chrome')}, r=0.0)                      # 皮帶夾
    rbox(pm, xc - 0.006, xc + 0.006, yb + 0.064, yb + 0.072, z0 + 0.012, z1 - 0.01, {'*': S('tape_bump')}, r=0.0)               # 鎖定鈕


def tire_lever(pm, i, j, L_=0.28, tilt=0.0, paint=None):
    """輪胎撬棒：扁鋼條，上端的孔掛在鉤子上，下端是往前彎的匙形"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.06); sub = PM()
    t_ = 0.006; zb = BOARD_Z1 + 0.0015; rh = 0.0045; wy = wire_y(hy, zb + t_ / 2); yh = wy + WIRE_R - rh
    reg = (lambda p: ruv('tool_steel', (yh - p[1]) / 0.3, 0.5 + (p[0] - hx) / 0.05)) if paint is None else S(paint)
    top = [(hx + 0.011 * math.cos(a), yh + 0.011 * math.sin(a)) for a in np.linspace(0, math.pi, 5)]
    shaft = top + [(hx - 0.0105, yh - 0.8 * L_), (hx + 0.0105, yh - 0.8 * L_)]
    extrude(sub, [(x, y, zb) for x, y in shaft], (0, 0, t_), reg, bevel=(0.0, 0.0012))
    yj = yh - 0.8 * L_; Lt = 0.2 * L_
    tip = [(hx - 0.0105, yj), (hx + 0.0105, yj), (hx + 0.0135, yj - 0.5 * Lt), (hx + 0.011, yj - 0.88 * Lt), (hx, yj - Lt), (hx - 0.011, yj - 0.88 * Lt), (hx - 0.0135, yj - 0.5 * Lt)]
    extrude(sub, [(x, y, zb) for x, y in tip], (0, 0, t_), reg, M=T(0, yj, zb) @ Rx(-0.32) @ T(0, -yj, -zb), bevel=(0.0, 0.0012))
    disk(sub, rh, 0.0, 8, S('hole_dark'), M=T(hx, yh, zb + t_ + 0.0003) @ Rx(math.pi / 2))
    pm.add(sub, T(hx, wy, 0) @ Rz(tilt) @ T(-hx, -wy, 0))


def grease_gun(pm, i, j):
    """黃油槍：紅色筒身橫躺在兩支鉤子上（相隔 8 孔），頭在 +x 端（壓桿往回折、黑色軟管往下垂、黃銅接頭）、尾端 T 形拉桿"""
    (x1, hy), (x2, _) = hole(i, j), hole(i + 8, j); hook(pm, x1, hy, 0.085); hook(pm, x2, hy, 0.085)
    Rb = 0.026; zc = BOARD_Z1 + 0.006 + Rb; yb = wire_y(hy, zc) + WIRE_R + Rb; xa, xb = x1 - 0.04, x2 + 0.03; Lb = xb - xa
    lathe_parts(pm, [([(0.0, 0.0), (0.02, 0.0), (0.026, 0.005), (0.026, Lb - 0.012), (0.0285, Lb - 0.01), (0.0285, Lb)], S('grease_red'))], 10, 1, M=T(xa, yb, zc) @ Rz(-math.pi / 2))
    rbox(pm, xb, xb + 0.05, yb - 0.032, yb + 0.03, zc - 0.024, zc + 0.024, {'*': S('ham_head')}, r=0.006)
    sweep(pm, smooth_open([(xb + 0.04, yb + 0.026, zc), (xb + 0.01, yb + 0.058, zc), (xb - 0.06, yb + 0.06, zc), (xb - 0.13, yb + 0.048, zc)], 1), 0.0055, 6, S('tool_chrome'), caps=False)
    sweep(pm, [(xb - 0.075, yb + 0.058, zc), (xb - 0.135, yb + 0.047, zc)], 0.0085, 6, S('grip_black'))
    sweep(pm, [(xa, yb, zc), (xa - 0.04, yb, zc)], 0.0042, 6, S('tool_chrome'), caps=False)
    sweep(pm, [(xa - 0.04, yb - 0.026, zc), (xa - 0.04, yb + 0.026, zc)], 0.0052, 6, S('tool_chrome'))
    hp = smooth_open([(xb + 0.035, yb - 0.03, zc), (xb + 0.045, yb - 0.075, zc + 0.006), (xb + 0.012, yb - 0.12, zc + 0.012), (xb - 0.045, yb - 0.115, zc + 0.014), (xb - 0.07, yb - 0.09, zc + 0.014)], 2)
    sweep(pm, hp, 0.0055, 6, S('hose_blk'))
    e0, e1 = np.array(hp[-2]), np.array(hp[-1])
    lathe_parts(pm, [([(0.0, 0.0), (0.0075, 0.0), (0.0075, 0.016), (0.0045, 0.024), (0.0, 0.025)], S('brass'))], 8, 1, M=T(*e1) @ align_y(e1 - e0))


def cable_ties(pm, i, j):
    """一捆束帶對折掛在鉤子上，兩腳往下垂、尾端散開一點"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.07)
    z = 0.05; r = 0.0075; yt = wire_y(hy, z) + WIRE_R + 0.014                  # 對折處的內緣（半徑 0.014）頂在鉤子上
    pts = [(hx - 0.022, yt - 0.165, z + 0.006), (hx - 0.016, yt - 0.08, z + 0.002), (hx - 0.014, yt - 0.02, z)]
    pts += [(hx - 0.014 * math.cos(a), yt - 0.02 + 0.02 * math.sin(a), z) for a in np.linspace(0.35, math.pi - 0.35, 5)]
    pts += [(hx + 0.014, yt - 0.02, z), (hx + 0.017, yt - 0.075, z + 0.002), (hx + 0.026, yt - 0.155, z + 0.006)]
    sweep(pm, pts, r, 8, lambda s, t: ruv('zipties', s, t))


def tape_rolls(pm, i, j):
    """三捲電工膠帶（黑、紅、藍）串在同一支鉤子上"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.088)
    ri, ro, w = 0.0185, 0.031, 0.019
    for k, col in enumerate(('grip_black', 'tape_red', 'tape_blue')):
        zc = BOARD_Z1 + 0.004 + w / 2 + k * (w + 0.0015); cy = wire_y(hy, zc) + WIRE_R - ri
        prof = [(ri, -w / 2), (ro, -w / 2), (ro, w / 2), (ri, w / 2), (ri, -w / 2)]
        lathe_parts(pm, [(prof[:4], S(col)), (prof[3:], S('tape_core'))], 14, 1, M=T(hx + 0.002 * (k - 1), cy, zc) @ Rx(math.pi / 2))


def hose_coil(pm, i, j):
    """一條捲起來的黑色打氣管掛在鉤子上：兩圈半，每圈往外一點、大小不太一樣；兩頭往下垂，一頭有打氣頭"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.08)
    r = 0.0065; per = 16; turns = 2.2; pts = []
    for k in range(int(turns * per) + 1):
        a = 2 * math.pi * k / per; lp = k / per
        z = BOARD_Z1 + 0.009 + r + 0.0142 * lp; Rk = 0.104 + 0.008 * math.sin(lp * 2.3) + 0.004 * math.sin(a * 1.0 + 1)
        top = wire_y(hy, z) + WIRE_R + r; cx = hx + 0.012 * math.sin(lp * 1.7)
        pts.append((cx + Rk * math.sin(a), top - Rk + Rk * math.cos(a), z))
    s0 = np.array(pts[0]); s1 = np.array(pts[-1]); d1 = s1 - np.array(pts[-2]); d1 /= np.linalg.norm(d1)
    head = [tuple(s0 + (-0.045, -0.15, 0.0)), tuple(s0 + (-0.03, -0.06, 0.0)), tuple(s0 + (-0.012, -0.004, 0.0))]
    tail = smooth_open([tuple(s1), tuple(s1 + d1 * 0.03), tuple(s1 + d1 * 0.04 + np.array((0, -0.05, 0.004))), tuple(s1 + d1 * 0.04 + np.array((0.01, -0.11, 0.006)))], 1)
    path = head + pts + tail[1:]
    sweep(pm, path, r, 6, S('hose_blk'))
    e0, e1 = np.array(path[-2]), np.array(path[-1])
    lathe_parts(pm, [([(0.0, 0.0), (0.0085, 0.0), (0.0085, 0.024), (0.011, 0.028), (0.011, 0.046), (0.0, 0.048)], S('brass'))], 8, 1, M=T(*e1) @ align_y(e1 - e0))


def hook_rag(pm, i, j):
    """抹布搭在鉤子上：後面一半貼著板子垂下、前面一半垂在鉤子前面，有皺褶、下緣不齊"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.07)
    top = wire_y(hy, 0.05) + WIRE_R + 0.002
    path = [(0.031, top - 0.15), (0.031, top - 0.07), (0.034, top - 0.012), (0.046, top + 0.003), (0.058, top - 0.006), (0.064, top - 0.06), (0.068, top - 0.14), (0.071, top - 0.21)]
    xs = np.linspace(-0.105, 0.105, 7); G = []
    for a, (zp, yp) in enumerate(path):
        row = []; hang = 1.0 if a >= 5 else (0.4 if a <= 1 else 0.0)
        for b, x in enumerate(xs):
            pinch = (1 - 0.35 * (1 - abs(x) / 0.105)) if 2 <= a <= 4 else 1.0           # 掛在鉤子上的地方往中間收
            fold = (0.009 * math.sin(b * 1.8 + a * 0.6) + 0.004 * math.sin(b * 3.7)) * hang
            dy = (0.012 * math.sin(b * 2.1 + 0.5) if a in (0, len(path) - 1) else 0.0)
            row.append((hx + x * pinch, yp + dy, zp + max(fold, 0.0 if a <= 1 else -0.01)))
        G.append(row)
    cloth_grid(pm, G, 'rag')


def cvt_belts(pm, i, j):
    """兩條機車的傳動皮帶（黑色橡膠圈）掛在同一支鉤子上，一大一小、往下垂成橢圓"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.07)
    for k, (Rk, dz) in enumerate(((0.118, 0.0), (0.106, 0.012))):
        z = BOARD_Z1 + 0.011 + dz; top = wire_y(hy, z) + WIRE_R + 0.0045
        pts = [(hx + 0.008 * k + 0.9 * Rk * math.sin(a), top - Rk + Rk * math.cos(a), z) for a in np.linspace(0, 2 * math.pi, 21)[:-1]]
        sweep(pm, pts, 0.0045, 4, S('rubber'), closed=True)


def screw_box(pm, i, j, color):
    """掛在洞洞板上的小零件盒（兩個掛片插在孔裡），上方暗色開口裡有螺絲"""
    hx, hy = hole(i, j)
    for di in (-1, 1):
        sx_, sy_ = hole(i + di, j); sweep(pm, [(sx_, sy_, 0.014), (sx_, sy_, 0.03)], WIRE_R, 6, S('wire'), caps=False)
    prof = [(0.0, 0.0), (0.075, 0.0), (0.09, 0.05), (0.082, 0.056), (0.0, 0.075)]
    side = lambda k, s_, t: ruv('bin_top_' + color, t, s_) if k == 3 else ruv('sw_bin_' + color, .5, .5)
    extrude(pm, [(hx - 0.05, hy - 0.06 + v, BOARD_Z1 + 0.001 + u) for u, v in prof], (0.10, 0, 0), S('bin_' + color), side, bevel=(0.004, 0.004))


def socket_case(pm, i, j):
    """套筒組的塑膠盒（素面、沒有字），提把掛在鉤子上"""
    hx, hy = hole(i, j); hook(pm, hx, hy, 0.075)
    W, H, D = 0.32, 0.19, 0.058; zb = BOARD_Z1 + 0.003; zc = zb + D / 2
    ytop = wire_y(hy, zc) + WIRE_R - 0.023
    rbox(pm, hx - W / 2, hx + W / 2, ytop - H, ytop, zb, zb + D, {'*': S('case_gray')}, r=0.012, seg=1)
    rbox(pm, hx - W / 2 + 0.006, hx + W / 2 - 0.006, ytop - 0.052, ytop - 0.046, zb + D - 0.002, zb + D + 0.002, {'*': S('fan')}, r=0.0)   # 蓋子的縫
    sweep(pm, smooth_open([(hx - 0.05, ytop - 0.004, zc), (hx - 0.045, ytop + 0.024, zc), (hx, ytop + 0.03, zc), (hx + 0.045, ytop + 0.024, zc), (hx + 0.05, ytop - 0.004, zc)], 1), 0.007, 6, S('case_gray'))
    for sg in (-1, 1):
        rbox(pm, hx + sg * 0.09 - 0.012, hx + sg * 0.09 + 0.012, ytop - 0.07, ytop - 0.03, zb + D, zb + D + 0.006, {'*': S('tool_chrome')}, r=0.0)   # 扣環


HEAD = [(-0.050, 0.003), (-0.034, 0.0), (0.030, 0.0), (0.040, 0.007), (0.050, 0.012), (0.058, 0.008), (0.066, -0.004), (0.069, -0.016),
        (0.0712, -0.003), (0.068, 0.012), (0.060, 0.023), (0.046, 0.030), (0.020, 0.031), (-0.034, 0.029), (-0.050, 0.026)]


def hammer(pm, i, j):
    (x1, hy), (x2, _) = hole(i, j), hole(i + 2, j); hook(pm, x1, hy, 0.07); hook(pm, x2, hy, 0.07)
    xe = (x1 + x2) / 2; z0, z1 = 0.031, 0.057; zc = (z0 + z1) / 2; y0 = wire_y(hy, z1) + WIRE_R
    extrude(pm, [(xe + u, y0 + v, z0) for u, v in HEAD], (0, 0, z1 - z0), S('ham_head'), bevel=(0.0, 0.003))
    face = [(0.0112, 0.0), (0.0135, 0.004), (0.0135, 0.010), (0.0118, 0.0128), (0.0, 0.0128)]
    lathe_parts(pm, [(face[:4], S('ham_head')), (face[3:], S('ham_face'))], 12, 1, M=T(xe - 0.046, y0 + 0.0148, zc) @ Rz(math.pi / 2))
    sweep(pm, [(xe, y0 + 0.022, zc), (xe, y0 - 0.1, zc), (xe, y0 - 0.2, zc)], 0.0125, 8, lambda s, t: ruv('wood', s, t), caps=False)
    sweep(pm, [(xe, y0 - 0.19, zc), (xe, y0 - 0.25, zc), (xe, y0 - 0.30, zc), (xe, y0 - 0.305, zc)], lambda u: 0.0142 if u < 0.95 else 0.0128, 8, S('grip_black'))


def tool_wall():
    pm = PM(); rng = np.random.default_rng(23)
    for yb in (0.95, 1.50, 2.05):                                                   # 板背後三條木條（撐離牆 2 cm）
        rbox(pm, -1.15, 1.15, yb - 0.02, yb + 0.02, 0.0, BOARD_Z0, {'*': S('batten')}, r=0.0)
    tw = PEG_TW; gxe, gye = G0X + PEG_NX * PEG_P, G0Y + PEG_NY * PEG_P; mx, my = G0X - BOARD_X0, G0Y - BOARD_Y0
    ncol = -(-PEG_NX // PEG_T)
    xs = [BOARD_X0] + [G0X + tw * k for k in range(ncol)] + [gxe, BOARD_X1]
    ys = [BOARD_Y0] + [G0Y + tw * k for k in range(PEG_ROWS)] + [gye, BOARD_Y1]
    special = {}
    for k, (x, y) in enumerate(PEG_SMUDGES):
        c = peg_cell(x, y); assert c not in special and 0 <= c[0] < PEG_NX // PEG_T and 0 <= c[1] < PEG_NY // PEG_T, (x, y); special[c] = 'ps%d' % k
    for k, (kd, x, y) in enumerate(PEG_MARKS):
        hk = hole(*snap(x, y)); c = peg_cell(hk[0], hk[1] - 0.04); assert c not in special, (kd, c); special[c] = 'ps%d' % (8 + k)
    for xa, xb in zip(xs, xs[1:]):
        for ya, yb in zip(ys, ys[1:]):
            cl = lambda v, lo, hi: min(max(v, lo + 0.002), hi - 0.002)                 # 板面最外圈讓出 2 mm 給倒角
            corners = [(cl(x, BOARD_X0, BOARD_X1), cl(y, BOARD_Y0, BOARD_Y1)) for x, y in ((xa, ya), (xb, ya), (xb, yb), (xa, yb))]
            if xa < G0X - 1e-9 or xb > gxe + 1e-9 or ya < G0Y - 1e-9 or yb > gye + 1e-9:   # 板邊沒有孔的一圈：磨損的那一塊
                if xa < G0X - 1e-9: fn = lambda x, y, ya=ya: ((x - BOARD_X0) / mx, (y - ya) / tw)
                elif xb > gxe + 1e-9: fn = lambda x, y, ya=ya: ((BOARD_X1 - x) / mx, (y - ya) / tw)
                elif ya < G0Y - 1e-9: fn = lambda x, y, xa=xa: ((y - BOARD_Y0) / my, (x - xa) / tw)
                else: fn = lambda x, y, xa=xa: ((BOARD_Y1 - y) / my, (x - xa) / tw)
                uvs = [ruv('peg_edge', *fn(x, y)) for x, y in corners]
            else:
                c, jr = int(math.floor((xa - G0X) / tw + 1e-9)), int(math.floor((ya - G0Y) / tw + 1e-9))
                reg = special.get((c, jr), 'pr%d' % jr); tx, ty = G0X + c * tw, G0Y + jr * tw
                u0, u1, v0, v1 = (xa - tx) / tw, (xb - tx) / tw, (ya - ty) / tw, (yb - ty) / tw
                if reg.startswith('pr') and abs(u1 - u0 - 1) < 1e-6 and rng.random() < 0.5: u0, u1 = 1 - u0, 1 - u1    # 同一列左右鏡像（孔對稱、漸層是上下的）
                uvs = [ruv(reg, u0, v0), ruv(reg, u1, v0), ruv(reg, u1, v1), ruv(reg, u0, v1)]
            quad(pm, [(x, y, BOARD_Z1) for x, y in corners], uvs, (0, 0, 1))
    INFO['peg_smudge_cells'] = len(special)
    quad(pm, [(BOARD_X0, BOARD_Y0, BOARD_Z0), (BOARD_X1, BOARD_Y0, BOARD_Z0), (BOARD_X1, BOARD_Y1, BOARD_Z0), (BOARD_X0, BOARD_Y1, BOARD_Z0)], [S('board_back')()] * 4, (0, 0, -1))
    cb = 0.002                                                                      # 板邊 2 mm 倒角（硬質纖維板 6 mm 厚）
    for (p0, p1, wv, d) in (((BOARD_X0, BOARD_Y1), (BOARD_X1, BOARD_Y1), (0, 1, 0), (0, -cb)), ((BOARD_X0, BOARD_Y0), (BOARD_X1, BOARD_Y0), (0, -1, 0), (0, cb)),
                            ((BOARD_X0, BOARD_Y0), (BOARD_X0, BOARD_Y1), (-1, 0, 0), (cb, 0)), ((BOARD_X1, BOARD_Y0), (BOARD_X1, BOARD_Y1), (1, 0, 0), (-cb, 0))):
        quad(pm, [(p0[0], p0[1], BOARD_Z0), (p1[0], p1[1], BOARD_Z0), (p1[0], p1[1], BOARD_Z1 - cb), (p0[0], p0[1], BOARD_Z1 - cb)], [S('board_edge')()] * 4, wv)
        quad(pm, [(p0[0], p0[1], BOARD_Z1 - cb), (p1[0], p1[1], BOARD_Z1 - cb), (p1[0] + d[0], p1[1] + d[1], BOARD_Z1), (p0[0] + d[0], p0[1] + d[1], BOARD_Z1)],
             [S('board_edge')()] * 4, (wv[0] * 0.7, wv[1] * 0.7, 0.7))
    tl = lambda: math.radians(rng.uniform(-4.5, 4.5))
    n_tools = 0
    # ---- 上排：扳手 6 支、起子架、套筒軌道、棘輪扳手、輪胎撬棒 3 支、黃油槍 ----
    x = -1.12
    for k, (d, Lt) in enumerate(((0.008, 0.125), (0.010, 0.145), (0.012, 0.165), (0.014, 0.19), (0.017, 0.215), (0.019, 0.24))):
        i, j = snap(x, 1.95); wrench(pm, i, j + (0, 1, -1, 0, 1, -1)[k], d, Lt, tl()); x += 0.058 + 1.4 * d; n_tools += 1
    ry, rx0, rx1 = 1.86, -0.58, -0.20
    rbox(pm, rx0, rx1, ry - 0.012, ry, 0.030, 0.088, {'*': S('rail')}, r=0.003)
    for bx in (rx0 + 0.006, rx1 - 0.021):
        rbox(pm, bx, bx + 0.015, ry - 0.05, ry, BOARD_Z1, 0.034, {'*': S('rail')}, r=0.003)
    for k, (hl, sl, col) in enumerate(((0.10, 0.10, 'sd_red'), (0.09, 0.075, 'sd_yellow'), (0.11, 0.15, 'sd_black'), (0.10, 0.125, 'sd_blue'), (0.085, 0.10, 'sd_red'))):
        screwdriver(pm, rx0 + 0.05 + k * 0.07, ry, 0.059, hl, sl, col); n_tools += 1
    INFO['socket_rail_x'] = [-0.12, round(socket_rail(pm, -0.12, 2.00), 3)]; n_tools += 1
    ratchet(pm, *snap(0.27, 2.03)); n_tools += 1
    for k, (xl, Ll, pt) in enumerate(((0.40, 0.28, None), (0.47, 0.30, 'rail'), (0.545, 0.25, None))):
        i, j = snap(xl, 2.03); tire_lever(pm, i, j - (k % 2), Ll, math.radians(-10) if k == 2 else tl(), pt); n_tools += 1   # 最後一支掛歪
    grease_gun(pm, *snap(0.72, 1.93)); n_tools += 1
    hook(pm, *hole(*snap(1.10, 2.0)))
    # ---- 中排：扳手再 6 支（別的尺寸）、鐵鎚、捲尺、老虎鉗／尖嘴鉗／斜口鉗各 2、束帶、電工膠帶、打氣管、抹布 ----
    x = -1.11
    for k, (d, Lt) in enumerate(((0.009, 0.135), (0.011, 0.155), (0.013, 0.175), (0.015, 0.195), (0.018, 0.225), (0.021, 0.255))):
        i, j = snap(x, 1.67); wrench(pm, i, j + (-1, 0, 1, -1, 0, 0)[k], d, Lt, math.radians(13) if k == 1 else tl()); x += 0.055 + 1.4 * d; n_tools += 1   # 第二支掛歪
    hammer(pm, *snap(-0.58, 1.62)); n_tools += 1
    tape_measure(pm, *snap(-0.425, 1.60)); n_tools += 1
    for (px_, py_, col, kd, tt) in ((-0.25, 1.66, 'pl_red', 'comb', 0), (-0.13, 1.65, 'pl_blue', 'comb', 0), (-0.01, 1.67, 'sd_yellow', 'needle', 0),
                                    (0.09, 1.66, 'pl_red', 'needle', 9), (0.20, 1.63, 'pl_blue', 'diag', 0), (0.30, 1.64, 'grip_black', 'diag', -3)):
        pliers(pm, *snap(px_, py_), col, kd, math.radians(tt)); n_tools += 1
    cable_ties(pm, *snap(0.43, 1.66)); tape_rolls(pm, *snap(0.55, 1.64)); hose_coil(pm, *snap(0.74, 1.71)); cvt_belts(pm, *snap(0.98, 1.69)); n_tools += 4
    # ---- 下排：套筒盒、零件盒 2 個、抹布、空鉤子 ----
    socket_case(pm, *snap(-0.95, 1.36)); screw_box(pm, *snap(-0.05, 1.27), 'blue'); screw_box(pm, *snap(0.13, 1.22), 'yellow'); hook_rag(pm, *snap(1.01, 1.33)); n_tools += 4
    for (ex, ey) in ((-0.32, 1.22), (0.36, 1.30), (0.56, 1.17), (0.76, 1.30), (-0.62, 1.12)): hook(pm, *hole(*snap(ex, ey)))
    INFO['tool_wall_items'] = n_tools
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


def battery(pm, x, y, z, yaw):
    """機車電瓶（素面黑灰盒、紅黑兩個極柱，沒有字）"""
    sub = PM(); rbox(sub, -0.075, 0.075, 0.0, 0.13, -0.044, 0.044, {'*': S('battery')}, r=0.004)
    rbox(sub, -0.07, 0.07, 0.13, 0.136, -0.04, 0.04, {'*': S('fan')}, r=0.0)
    for sx_, col in ((-0.05, 'term_red'), (0.05, 'cap_k')):
        lathe_parts(sub, [([(0.008, 0.0), (0.008, 0.012), (0.0, 0.013)], S(col))], 6, 1, M=T(sx_, 0.134, 0.0))
    pm.add(sub, T(x, y, z) @ Ry(yaw))


def spray_can(pm, x, y, z, cap):
    """素面噴罐（防鏽油、化油器清潔劑那種，沒有字）"""
    lathe_parts(pm, [([(0.0, 0.0), (0.03, 0.0), (0.033, 0.005), (0.033, 0.16), (0.029, 0.176), (0.016, 0.186), (0.016, 0.19)], S('spray_gray')),
                     ([(0.017, 0.188), (0.017, 0.222), (0.013, 0.226), (0.0, 0.227)], S(cap))], 14, 1, M=T(x, y, z))


def part_bin(pm, x, y, z, color):
    prof = [(-0.085, 0.0), (0.075, 0.0), (0.092, 0.064), (0.083, 0.072), (-0.085, 0.10)]       # 側面（z, y）：後高前低、前面一片斜的擋板
    side = lambda i, s, t: ruv('bin_top_' + color, t, s) if i == 3 else ruv('sw_bin_' + color, .5, .5)
    extrude(pm, [(x - 0.0525, y + v, z + u) for u, v in prof], (0.105, 0, 0), S('bin_' + color), side, bevel=(0.004, 0.004))   # 塑膠一體成型的圓邊


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
    rng = np.random.default_rng(5); xs = np.linspace(0.37, 0.56, 8); G = []
    path = [(0.09, ys + 0.004), (0.15, ys + 0.005), (0.205, ys + 0.004), (0.226, ys - 0.004), (0.229, ys - 0.035), (0.232, ys - 0.08), (0.236, ys - 0.125)]
    for a, (zp, yp) in enumerate(path):
        row = []; hang = max(0.0, (ys - yp) / 0.12)
        for b, x in enumerate(xs):
            fold = (0.016 * math.sin(b * 1.7 + a * 0.5) + 0.006 * math.sin(b * 3.9 + 1.0)) * hang + (0.004 * abs(math.sin(b * 2.3 + a)) if hang == 0 else 0)
            dy = (0.0 if hang == 0 else (0.018 * math.sin(b * 1.3 + 0.4) + rng.uniform(-0.006, 0.006)) * hang) + (0.003 * abs(math.sin(b * 1.3)) if hang == 0 else 0)
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
    spray_can(pm, 0.47, y, -0.13, 'spray_red'); spray_can(pm, 0.545, y, -0.10, 'cap_k')            # 噴罐 2 罐（後面）
    y = SHELF_Y[3]
    boxes.append(carton(pm, -0.31, y, 0.0, 0.40, 0.28, 0.34, math.radians(-2)))
    boxes.append(carton(pm, 0.12, y, 0.01, 0.30, 0.22, 0.30, math.radians(5), True))
    battery(pm, 0.385, y, 0.04, math.radians(8)); battery(pm, 0.52, y, -0.03, math.radians(-5))     # 機車電瓶 2 顆
    y = SHELF_Y[4]
    boxes.append(carton(pm, -0.22, y, 0.0, 0.36, 0.30, 0.32, math.radians(1.5), True))
    boxes.append(carton(pm, 0.25, y, 0.0, 0.26, 0.20, 0.30, math.radians(-5)))
    for (x, z, W, D, yaw) in boxes:                                                   # 箱子不能超出層板
        c, s = abs(math.cos(yaw)), abs(math.sin(yaw))
        assert abs(x) + (W * c + D * s) / 2 < PX - 0.005 and abs(z) + (W * s + D * c) / 2 < PZ - 0.005, (x, z, W, D)
    INFO['cartons'] = len(boxes); INFO['bottles'] = len(cols); INFO['batteries'] = 2; INFO['spray_cans'] = 2
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
    sweep(pm, U, 0.016, 8, R('lift_blue'))
    for zs in (1, -1):
        sweep(pm, [(0.815, 0.55, zs * 0.085), (0.66, 0.355, zs * 0.085)], 0.011, 8, R('lift_blue'))
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
    rbox(pm, -0.06, 0.06, -0.008, 0.008, -0.045, 0.045, {'t': R('pedal_top'), '*': S('rubber')}, r=0.004, M=T(px + 0.26, 0.115, pz + 0.045) @ Rz(-0.2))
    hose = smooth_open([(px - 0.02, 0.03, pz - 0.035), (-0.42, 0.035, 0.36), (-0.55, 0.062, 0.33), (-0.56, 0.088, 0.18), (-0.52, 0.062, 0.05),
                        (-0.47, 0.045, 0.01), (-0.42, 0.047, 0.0), (-0.39, 0.052, 0.0)], 2)                       # 從底座橫梁上面、剪刀臂軸下面穿過去
    sweep(pm, hose, 0.0065, 6, S('hose_blk'))
    # 接油盤（地上、+z 前面，裡面一層黑油）
    pan = [(0.0, 0.0), (0.15, 0.0), (0.16, 0.004), (0.178, 0.055), (0.182, 0.062)]
    lathe_parts(pm, [(pan, S('pan_black')), ([(0.182, 0.062), (0.172, 0.058), (0.16, 0.022)], S('pan_black'))], 16, 1, M=T(0.5, 0.0, 0.53))
    disk(pm, 0.161, 0.022, 16, S('oil_dark'), M=T(0.5, 0.0, 0.53))
    # 檯面上一塊抹布，一角垂過 +z 的邊
    path = [(0.06, DECK_TOP + 0.003), (0.13, DECK_TOP + 0.004), (0.2, DECK_TOP + 0.004), (0.262, DECK_TOP + 0.003), (0.281, DECK_TOP - 0.012), (0.284, DECK_TOP - 0.05), (0.288, DECK_TOP - 0.085)]
    G = []
    for a, (zp, yp) in enumerate(path):
        hang = 1.0 if a >= 4 else 0.0
        G.append([(x + 0.01 * math.sin(a * 1.3), yp + (0.006 * abs(math.sin(b * 1.7 + a)) if a < 4 else 0.012 * math.sin(b * 1.9) * (a == 6)), zp + 0.006 * math.sin(b * 2.1 + a) * hang)
                  for b, x in enumerate(np.linspace(0.30, 0.52, 6))])
    cloth_grid(pm, G, 'rag')
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
                         ([(0.04, 0.02), (0.012, 0.016), (0.012, -0.016)], S('hub'))], 14, 1, M=T(-0.19, 0.06, zs * 0.165) @ Rx(math.pi / 2))
        rbox(pm, 0.17, 0.20, 0.018, 0.105, zs * 0.09 - 0.012, zs * 0.09 + 0.012, {'*': S('red_paint')}, r=0.003)
        lathe_parts(pm, [([(0.016, 0.0), (0.018, 0.004), (0.018, 0.016), (0.014, 0.02), (0.0, 0.02)], S('rubber'))], 8, 1, M=T(0.185, 0.0, zs * 0.09))
    # 紅色風管：旁邊地上捲 4 圈（螺旋）
    hr = 0.008; cx, cz = 0.58, 0.12; turns = 4; per = 20; pts = []
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
    lathe_parts(pm, [(DRUM_PROF, R('drum_side'))], 30, 1)
    disk(pm, DRUM_LID_R, DRUM_LID_Y, 30, lambda X, Z: ruv('drum_top', 0.5 + X / 0.6, 0.5 + Z / 0.6), rings=2)
    bx, bz = BUNG_BIG; sx, sz_ = BUNG_SMALL
    lathe_parts(pm, [([(0.032, 0.0), (0.033, 0.004), (0.033, 0.009), (0.026, 0.011), (0.018, 0.011)], S('drum_bung'))], 12, 1, M=T(bx, DRUM_LID_Y - 0.001, bz))
    lathe_parts(pm, [([(0.022, 0.0), (0.023, 0.004), (0.023, 0.009), (0.018, 0.011), (0.0, 0.0115)], S('drum_bung'))], 10, 1, M=T(sx, DRUM_LID_Y - 0.001, sz_))
    out = [(0.0175, 0.80), (0.0185, 0.87), (0.026, 0.89), (0.07, 0.93), (0.13, 0.985), (0.19, 1.04), (0.199, 1.05), (0.201, 1.058), (0.196, 1.064)]
    inn = [(0.196, 1.064), (0.188, 1.056), (0.12, 0.99), (0.06, 0.935), (0.02, 0.895), (0.0145, 0.85), (0.0145, 0.80)]
    lathe_parts(pm, [(out, R('funnel_out')), (inn, lambda s, t: ruv('funnel_in', s, 1 - t))], 24, 2, M=T(bx, 0.0, bz))
    # 桶蓋上一塊沾油的抹布（0.30×0.24）：隨手丟在桶蓋上、皺起幾道摺痕，靠桶邊的一角翻過捲邊、垂在桶子外面
    rx, rz = RAG_DRUM; NU, NV = 13, 10; ang = math.radians(28); ca, sa = math.cos(ang), math.sin(ang)
    folds = [(0.02, -0.01, 0.4, 0.016, 0.024), (-0.06, 0.03, 1.9, 0.012, 0.02), (0.05, 0.05, 2.6, 0.01, 0.018), (-0.03, -0.06, 1.1, 0.008, 0.016)]
    G = []
    for a in range(NV):
        row = []
        for b_ in range(NU):
            u, v = (b_ / (NU - 1) - 0.5) * 0.30, (a / (NV - 1) - 0.5) * 0.24
            u += 0.012 * math.sin(v * 31 + 1.0); v += 0.01 * math.sin(u * 27 + 2.0)          # 布邊不直
            x, z = rx + u * ca - v * sa, rz + u * sa + v * ca; r = math.hypot(x, z)
            if r < DRUM_LID_R - 0.004:                                                     # 桶蓋上：摺痕（三角形的脊）
                hgt = 0.003
                for fx, fz, fa, fh, fw in folds:
                    dist = abs((u - fx) * math.sin(fa) - (v - fz) * math.cos(fa)); hgt += fh * max(0.0, 1 - dist / fw)
                row.append((x, DRUM_LID_Y + hgt, z))
            elif r < 0.293:                                                                # 翻過捲邊
                row.append((x, 0.884 + 0.004 * math.sin(u * 40), z))
            else:                                                                          # 垂在桶子外面
                e = r - 0.293; k = 0.297 / r
                row.append((x * k, 0.882 - e * 1.1, z * k))
        G.append(row)
    sub = PM()
    for a in range(NV - 1):
        for b_ in range(NU - 1):
            p_ = [G[a][b_], G[a][b_ + 1], G[a + 1][b_ + 1], G[a + 1][b_]]
            c = np.mean(np.array(p_), 0); wv = (0, 1, 0) if math.hypot(c[0], c[2]) < 0.29 else (c[0], 0.3, c[2])
            sub.poly(p_, [ruv('rag', b_ / (NU - 1), a / (NV - 1)), ruv('rag', (b_ + 1) / (NU - 1), a / (NV - 1)),
                          ruv('rag', (b_ + 1) / (NU - 1), (a + 1) / (NV - 1)), ruv('rag', b_ / (NU - 1), (a + 1) / (NV - 1))], wv)
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
    """台灣常見的塑膠矮凳：圓角方座面（中間手提長孔是畫的）、座面邊緣一圈往下翻的薄邊；
    底下是一個往下變大的圓角方殼（厚 3.5 mm），四個側面各挖一個大拱門，四個角的側板一路延伸到地面當腳"""
    pm = PM(); top = 'stool_top_' + color; side = 'stool_side_' + color
    sfn = lambda q: ruv(side, (math.atan2(q[2], q[0]) / (2 * math.pi)) % 1.0, q[1] / 0.26)
    HS, AS, RS = 0.26, 0.148, 0.04                                  # 座面高、座面半寬、座面圓角
    HB, AT, AB, RC, TH = 0.256, 0.136, 0.162, 0.03, 0.0035          # 殼：頂（座面底下）、上半寬、下半寬、圓角、厚
    a = lambda y: AB + (AT - AB) * y / HB
    # 座面＋往下翻的薄邊（2.2 cm）
    o_t, o_r, o_s, o_b = rsq(AS - 0.010, RS - 0.010, HS), rsq(AS - 0.0029, RS - 0.0029, HS - 0.0029), rsq(AS, RS, HS - 0.010), rsq(AS + 0.002, RS + 0.002, HS - 0.022)
    i_b, i_t = rsq(AS - 0.0005, RS - 0.0025, HS - 0.022), rsq(AS - 0.0025, RS - 0.0025, HS - 0.004)
    pm.poly(o_t, [ruv(top, 0.5 + q[0] / (2 * AS), 0.5 + q[2] / (2 * AS)) for q in o_t], (0, 1, 0))
    efn = lambda q: ruv(top, 0.5 + q[0] / (2 * AS), 0.5 + q[2] / (2 * AS))         # 座面邊緣 1 cm 圓角（用座面的貼圖：邊上被摸亮）
    loft(pm, o_t, o_r, efn, True); loft(pm, o_r, o_s, efn, True); loft(pm, o_s, o_b, sfn, True); loft(pm, i_t, i_b, sfn, False)
    for i in range(16):
        j = (i + 1) % 16; pm.poly([o_b[i], o_b[j], i_b[j], i_b[i]], [sfn(o_b[i])] * 4, (0, -1, 0))
    pm.poly(i_t, [sfn(q) for q in i_t], (0, -1, 0))
    # 四片側板（同一片轉 90°）：大拱門＋兩邊延伸到地面的腳
    wa, yb, hb = 0.09, 0.07, 0.085
    arch = [(-wa, 0.0), (-wa, yb)] + [(wa * math.cos(t), yb + hb * math.sin(t)) for t in np.radians((165, 140, 115, 90, 65, 40, 15))] + [(wa, yb), (wa, 0.0)]
    xs = lambda y: a(y) - RC
    poly2 = [(xs(0.0), 0.0), (xs(HB), HB), (-xs(HB), HB), (-xs(0.0), 0.0)] + arch
    n_out = np.array((0.0, -(AT - AB) / HB, 1.0)); n_out /= np.linalg.norm(n_out)
    for k in range(4):
        extrude(pm, [(x, y, a(y)) for x, y in poly2], -n_out * TH, sfn, M=Ry(k * math.pi / 2), skip=(0, 1, 2))
    # 四個圓角（側板接起來的地方，一樣到地面）
    for sx, sz in ((1, 1), (-1, 1), (-1, -1), (1, -1)):
        def ring(y, off):
            aa, rr = a(y) - off, RC - off; cx, cz = sx * (aa - rr), sz * (aa - rr)
            return [(cx + sx * rr * math.cos(ph), y, cz + sz * rr * math.sin(ph)) for ph in np.linspace(0, math.pi / 2, 4)]
        ob_, ot_, ib_, it_ = ring(0.0, 0.0), ring(HB, 0.0), ring(0.0, TH), ring(HB, TH)
        loft(pm, ob_, ot_, sfn, True, closed=False); loft(pm, ib_, it_, sfn, False, closed=False)
        for i in range(3): pm.poly([ob_[i], ob_[i + 1], ib_[i + 1], ib_[i]], [sfn(ob_[i])] * 4, (0, -1, 0))
    return pm


ITEMS = {'SHOP_TIRE_STACK': tire_stack, 'SHOP_TOOL_WALL': tool_wall, 'SHOP_PARTS_SHELF': parts_shelf, 'SHOP_LIFT': lift,
         'SHOP_AIR_PUMP': air_pump, 'SHOP_OIL_DRUM': oil_drum, 'SHOP_STOOL_RED': lambda: stool('red'), 'SHOP_STOOL_BLUE': lambda: stool('blue')}
# GLB 裡先排成店的一角（LAWWW2-B 擺放時用各自的原點）：牆面在 z −1.8；工具牆貼牆、層架在牆邊右側、輪胎左後、升降台前面中間、打氣機和油桶右前、椅子散在前面
SPREAD = {'SHOP_TOOL_WALL': (-0.35, 0.0, -1.8, 0), 'SHOP_PARTS_SHELF': (1.75, 0.0, -1.545, 0), 'SHOP_TIRE_STACK': (-2.25, 0.0, -1.42, 8),
          'SHOP_LIFT': (-0.05, 0.0, 0.05, 0), 'SHOP_AIR_PUMP': (1.45, 0.0, 0.62, -18), 'SHOP_OIL_DRUM': (2.4, 0.0, -0.55, 25),
          'SHOP_STOOL_RED': (-1.75, 0.0, 0.85, 22), 'SHOP_STOOL_BLUE': (0.95, 0.0, 1.35, -38)}
BUDGET = {'SHOP_TIRE_STACK': 8000, 'SHOP_TOOL_WALL': 10500, 'SHOP_PARTS_SHELF': 3000, 'SHOP_LIFT': 2200, 'SHOP_AIR_PUMP': 4800,
          'SHOP_OIL_DRUM': 2500, 'SHOP_STOOL_RED': 470, 'SHOP_STOOL_BLUE': 470}
# 預算在總數 30000 裡重新分配（LAWWW2-B v2：可以）：工具牆原本 5000 → 中途意見工具多一倍 9500 → SOP 倒角 10500；
# 凳子 400 → 470（座面邊 1 cm 圓角）；輪胎 10000 → 8000（胎側 2 段、24 邊，圓的輪廓不變）；其他壓到實際用量附近
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
                       'SHOP_LIFT': '底座框 x −0.80～1.0、z ±0.30；檯面 x −0.62～0.98、頂面 y 0.34；斜坡板到 x −0.99；前輪夾座在 +x；腳踏幫浦在 +z 側（z 到 0.45）；接油盤在 +z 前面（到 z 0.71）',
                       'SHOP_AIR_PUMP': '氣筒軸沿 x（x ±0.275、中心 y 0.20）；輪子在 −x、提把和橡膠腳在 +x；風管捲在 +x 旁邊地上（圈中心約 (0.58, 0.12)）',
                       'SHOP_OIL_DRUM': '半徑 0.29、高 0.88；漏斗插在 (−0.185, 0.03) 的大桶塞（頂 1.064）、小桶塞 (0.17, −0.10)、抹布 (0.11, 0.17)',
                       'SHOP_STOOL_RED': '座面 0.296 見方、座高 0.26；殼往下張到 ±0.162（四面拱門、側板到地）',
                       'SHOP_STOOL_BLUE': '同紅色'}
    info['note'] = ('一個材質 shop1（底色 1024＋ORM 256，金屬度最高 0.40：工具、套筒 0.40，軸、鉤子、銷 0.2，檯面 0.15，塗裝、塑膠、橡膠 0）；'
                    'Poly Haven（CC0）：metal_plate（檯面菱形花紋：法線圖算明暗）、green_metal_rust（層架烤漆明暗、鏽點）、rusty_painted_metal（油桶油痕、底部鏽）、'
                    'rubber_tiles（輪胎橡膠顆粒）、fine_grained_wood（鐵鎚木柄）；其他是程式畫的。沒有任何文字、商標、品牌（D77）')
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False), total)
    return info


if __name__ == '__main__':
    build()
