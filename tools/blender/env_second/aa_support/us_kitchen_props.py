"""ART-US2 美國公寓廚房（SCN-US-01 祐廷租的校外學生公寓 1x1，大三下美國交換，D47；LAWWW2-B 分工 2026-10-16 12:14；AA-B 支援製作；規格同 ART-US1）
  /opt/blenv/bin/python tools/blender/env_second/aa_support/us_kitchen_props.py [-- --out assets/models/env/second_ai/aa_support/us_kitchen_props.glb]

LAWWW2-B 做房間和組裝；這裡是廚房的設備與櫃子。位置照 src/data/us_apartment_layout.js v2 的 kitchen furniture，外觀照 docs/art-rebuild/second_ai/research/us_apartment_photos.md（照片三：楓木色吊櫃、白色微波爐裝在爐子上方、白色冰箱、深色花崗石吧台）。
每件一個頂層節點，原點＝地面上的底部中央、正面（人站的那一側）朝 +z；吊櫃、微波爐、窗口的檯面也用地面當原點（和流理台放在同一個位置就對齊）：
  US_FRIDGE      白色冰箱 0.8×0.75×1.75：上冷凍、下冷藏兩扇門＋直把手，下面一條通風格柵
  US_COUNTER     南牆整排下櫃 2.8×0.6、檯面高 0.92：楓木色門片和抽屜（一圈凹框）＋小圓把手、退縮的踢腳、深色花崗石檯面（前緣倒角）＋10 cm 的花崗石擋水；
                 爐子（x 0.2，寬 0.76）、洗碗機（x −1.1，寬 0.6）的位置留空，水槽（x −0.5）在檯面上挖洞；東端一片側板（layout 是 ry=π：本地 +x＝房間的西邊）
  US_RANGE       白色電爐＋烤箱：四個爐口（鍍鉻承盤＋電熱圈）、背板上四個旋鈕、烤箱門有窗、橫把手、下面的抽屜；上面離地 1.45 m 的白色微波爐（門有窗、右邊按鍵面板）
  US_SINK        不鏽鋼雙槽＋鵝頸水龍頭；原點＝檯面的高度（槽往 −y 凹下去，放到 US_COUNTER 的洞裡：x −0.5、y 0.92）
  US_DISHWASHER  白色洗碗機門板 0.6 寬、0.86 高（上面一條按鍵、橫把手）
  US_UPPER       楓木色吊櫃：底離地 1.45、高 0.75、深 0.33；微波爐那一格只有上面的短櫃
  US_PASSSHELF   窗口內側（廚房那一邊）的花崗石檯面 1.8×0.3，高 1.05
  US_BAR         窗口外側（客廳那一邊）的花崗石吧台 2.0×0.36，高 1.05，下面三個黑色托架（靠牆那一側在 −z）
沒有字、品牌、標誌（D77）；微波爐、洗碗機的按鍵只有方塊。
材質一個：us_kitchen（1024 底色貼圖集＋256 ORM，metal 最高 0.40）。花崗石＝Poly Haven granite_tile_03（只取一塊磚的中間，沒有磚縫）加深、加對比；楓木＝walnut_veneer 改成淺的蜂蜜色；
門片的凹框、烤箱和微波爐的窗、爐口的電熱圈是畫的；白色家電、不鏽鋼、鍍鉻是色塊。
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
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/aa_support/us_kitchen_props.glb'
GEN = os.path.join(PARENT, 'textures', 'gen')
ATLAS, ATLAS_ORM = (os.path.join(GEN, f'us_kitchen_props_{k}.png') for k in ('atlas', 'orm'))
TEX = os.path.join(L.ROOT, 'tools', 'blender', 'textures')
TEX2 = os.path.join(PARENT, 'textures')
SRC = {'granite': os.path.join(TEX, 'granite_tile_03', 'granite_tile_03_diff_1k.jpg'),
       'walnut': os.path.join(TEX2, 'walnut_veneer', 'walnut_veneer_diff_1k.jpg')}
N, SS, ORM_N = 1024, 2, 256
METAL = 0.40

REG = {
    'granite': (0, 0, 512, 256),        # 深色花崗石：黑褐底＋淺色顆粒（granite_tile_03 一塊磚的中間）
    'maple_door': (512, 0, 768, 256),   # 楓木門片：木紋直的＋往內一圈的凹框（陰影＋亮邊）
    'maple': (768, 0, 1024, 256),       # 楓木（側板、框）
    'oven_door': (0, 256, 256, 384),    # 烤箱門：白色琺瑯＋中間深色的窗
    'mw_door': (256, 256, 512, 384),    # 微波爐正面：左邊深色的窗（網點）、右邊按鍵面板（只有方塊）
    'dw_front': (512, 256, 768, 384),   # 洗碗機門：白色＋上緣一條淺灰的按鍵條
    'coil': (768, 256, 896, 384),       # 爐口：鍍鉻承盤＋深色的電熱圈（螺旋）
    'cooktop': (896, 256, 1024, 384),   # 爐面：白色琺瑯（四個爐口另外是網格）
    'grille': (0, 384, 128, 448),       # 冰箱下面的通風格柵：深灰橫條
    # ---- 第 9 節補強（2026-10-16，LAWWW2-B 16:29 的清單）----
    'door_tr': (0, 448, 256, 704),      # 楓木門片＋把手在右上（下櫃）：把手附近手摸的髒、亮
    'door_tl': (256, 448, 512, 704),    # 把手在左上（下櫃的第二扇）
    'door_br': (512, 448, 768, 704),    # 把手在右下（吊櫃）
    'door_bl': (768, 448, 1024, 704),   # 把手在左下（吊櫃的第二扇）
    'board': (0, 704, 256, 832),        # 砧板：淺色木紋＋刀痕＋中間洗不掉的一塊淡色
    'note_list': (256, 704, 336, 832),  # 冰箱門上的購物清單：手寫的線（不是字）
    'note_photo': (336, 704, 432, 768), # 一張照片（白邊、海和山，看不出是誰）
    'note_cal': (432, 704, 512, 832),   # 課表：格子＋幾格塗了顏色（沒有字）
    'towel_roll': (512, 704, 640, 832), # 捲筒紙巾：壓紋＋一條撕線
}
SW = {
    'white_app': ((238, 238, 234), 0.32, 0.0), 'white_side': ((228, 228, 224), 0.38, 0.0), 'handle_w': ((226, 226, 222), 0.3, 0.0),
    'steel': ((184, 186, 188), 0.28, METAL), 'steel_dark': ((120, 122, 126), 0.35, METAL), 'chrome': ((200, 202, 206), 0.16, METAL),
    'black_glass': ((22, 24, 26), 0.08, 0.0), 'toe': ((44, 36, 30), 0.7, 0.0), 'knob_black': ((30, 30, 32), 0.35, 0.0),
    'bracket': ((32, 32, 34), 0.45, 0.2), 'drain': ((60, 60, 64), 0.4, METAL), 'shadow': ((20, 18, 16), 0.9, 0.0),
    'granite_edge': ((58, 52, 48), 0.3, 0.0),
    # ---- 第 9 節補強 ----
    'steel_low': ((132, 134, 136), 0.34, METAL),   # 水槽槽底（AO：比槽壁暗）
    'maple_under': ((112, 82, 54), 0.6, 0.0),      # 吊櫃底面（AO：從下面看是暗的）
    'ceramic': ((232, 230, 224), 0.22, 0.0), 'rim_blue': ((64, 96, 148), 0.25, 0.0), 'mug': ((92, 128, 108), 0.3, 0.0),
    'kettle': ((196, 198, 200), 0.26, 0.35), 'kettle_k': ((34, 34, 36), 0.4, 0.0), 'cord': ((238, 238, 234), 0.45, 0.0),
    'rack_wire': ((206, 208, 210), 0.3, 0.3), 'rack_tray': ((70, 74, 78), 0.45, 0.0),
    'sponge_y': ((218, 186, 72), 0.85, 0.0), 'sponge_g': ((58, 110, 70), 0.8, 0.0),
    'board_edge': ((176, 136, 92), 0.55, 0.0), 'holder': ((40, 40, 42), 0.4, 0.2), 'core': ((150, 120, 84), 0.8, 0.0),
    'mag_r': ((186, 64, 52), 0.3, 0.0), 'mag_y': ((222, 182, 62), 0.3, 0.0), 'mag_b': ((62, 108, 168), 0.3, 0.0),
}
SW_CELL, SW_Y0 = 32, 896
for i, k in enumerate(SW):
    REG['sw_' + k] = ((i % 32) * SW_CELL, SW_Y0 + (i // 32) * SW_CELL, (i % 32) * SW_CELL + SW_CELL, SW_Y0 + (i // 32) * SW_CELL + SW_CELL)
ORM_REG = {'granite': (0.22, 0.0), 'maple_door': (0.5, 0.0), 'maple': (0.5, 0.0), 'oven_door': (0.3, 0.0), 'mw_door': (0.3, 0.0), 'dw_front': (0.32, 0.0),
           'coil': (0.3, 0.3), 'cooktop': (0.3, 0.0), 'grille': (0.6, 0.0),
           'door_tr': (0.5, 0.0), 'door_tl': (0.5, 0.0), 'door_br': (0.5, 0.0), 'door_bl': (0.5, 0.0), 'board': (0.6, 0.0),
           'note_list': (0.85, 0.0), 'note_photo': (0.3, 0.0), 'note_cal': (0.85, 0.0), 'towel_roll': (0.9, 0.0)}
# 第 9 節補強：門片把手在哪一角（s, t：0～1，t 往上）
DOOR_KNOB = {'door_tr': (0.86, 0.9), 'door_tl': (0.14, 0.9), 'door_br': (0.86, 0.1), 'door_bl': (0.14, 0.1)}
# 檯面上的水漬、油漬（流理台本地座標 x、z；r＝半徑 m）：只放在檯面的前緣（z>0.2）和靠牆那一條（z<−0.21），
# 這兩條在花崗石那一塊的上下兩端，窗口的檯面、吧台用不到（它們只用到中間那一段），不會跟著出現
WATER = [(-0.62, 0.27, 0.05), (-0.42, 0.25, 0.035), (-0.78, 0.29, 0.03), (-0.33, 0.29, 0.025), (-0.55, -0.25, 0.035), (-0.66, -0.245, 0.03)]
RINGS = [(-0.9, 0.24, 0.036), (-0.24, 0.26, 0.04)]          # 杯子放過的圈
OIL = [(0.66, -0.255, 0.04), (0.75, -0.26, 0.045), (-0.2, -0.25, 0.03), (0.66, 0.26, 0.04)]
COUNTER_SAFE = (0.2, 0.21)   # 上面那幾筆的範圍要在 z>0.2 或 z<−0.21 以內（build 會檢查）


def sz(name):
    x0, y0, x1, y1 = REG[name]; return (x1 - x0) * SS, (y1 - y0) * SS


def lum(path, w, h, crop=None, tile=(1, 1)):
    im = Image.open(path).convert('L')
    if crop: W0, H0 = im.size; im = im.crop((int(crop[0] * W0), int(crop[1] * H0), int(crop[2] * W0), int(crop[3] * H0)))
    tw, th = max(1, w // tile[0]), max(1, h // tile[1]); t = np.asarray(im.resize((tw, th), Image.LANCZOS), np.float32)
    a = np.tile(t, (tile[1] + 1, tile[0] + 1))[:h, :w]
    return (a - a.mean()) / max(1.0, a.std())


def tint(z, base, k):
    a = np.array(base, np.float32)[None, None, :] * (1.0 + k * np.clip(z, -2.5, 2.5))[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def paint(P):
    # 花崗石：granite_tile_03 的顆粒（一塊磚的中間，避開磚縫），加大對比、壓暗；亮的顆粒保留成米白色
    w, h = sz('granite'); zg = lum(SRC['granite'], w, h, crop=(0.36, 0.04, 0.64, 0.46), tile=(14, 2))   # 這一塊對到 2.8 m×0.61 m 的檯面：橫的重複 14 次，顆粒在檯面上才是圓的
    a = np.zeros((h, w, 3), np.float32); base = np.array((54, 48, 44), np.float32); speck = np.array((176, 164, 150), np.float32)
    t = np.clip((zg - 0.9) / 1.6, 0, 1)[..., None]                                  # 亮的顆粒
    a[:] = base * (1.0 + 0.25 * np.clip(zg, -2, 0.9)[..., None]); a = a * (1 - t) + speck * t
    P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG['granite'][0] * SS, REG['granite'][1] * SS))
    # 楓木：walnut_veneer 的木紋（直的），改成淺的蜂蜜色
    w, h = sz('maple'); zw = np.asarray(Image.fromarray(np.clip((lum(SRC['walnut'], w, h) + 3) * 40, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2 * SS)), np.float32) / 40 - 3   # 木紋柔一點（楓木的紋比胡桃細）
    P.paste(tint(zw, (198, 150, 98), 0.06), (REG['maple'][0] * SS, REG['maple'][1] * SS))
    img = tint(zw, (198, 150, 98), 0.06); d = ImageDraw.Draw(img); i = 0.12
    d.rectangle([w * i, h * i, w * (1 - i), h * (1 - i)], outline=(132, 94, 58), width=3 * SS)          # 凹框的陰影
    d.line([(w * i + 3 * SS, h * (1 - i) - 2 * SS), (w * (1 - i) - 2 * SS, h * (1 - i) - 2 * SS)], fill=(222, 182, 130), width=SS)   # 下緣的亮邊
    d.line([(w * (1 - i) - 2 * SS, h * i + 3 * SS), (w * (1 - i) - 2 * SS, h * (1 - i) - 2 * SS)], fill=(222, 182, 130), width=SS)
    P.paste(img, (REG['maple_door'][0] * SS, REG['maple_door'][1] * SS))
    # 烤箱門
    w, h = sz('oven_door'); img = Image.new('RGB', (w, h), SW['white_app'][0]); d = ImageDraw.Draw(img)
    d.rounded_rectangle([w * 0.18, h * 0.26, w * 0.82, h * 0.72], radius=4 * SS, fill=(26, 26, 28), outline=(160, 160, 160), width=SS)
    d.rectangle([w * 0.2, h * 0.28, w * 0.5, h * 0.38], fill=(48, 48, 52))   # 玻璃上的一點反光
    P.paste(img, (REG['oven_door'][0] * SS, REG['oven_door'][1] * SS))
    # 微波爐正面
    w, h = sz('mw_door'); img = Image.new('RGB', (w, h), SW['white_app'][0]); d = ImageDraw.Draw(img)
    d.rounded_rectangle([w * 0.05, h * 0.14, w * 0.66, h * 0.86], radius=3 * SS, fill=(30, 30, 32))
    for yy in range(int(h * 0.18), int(h * 0.82), 3 * SS):
        for xx in range(int(w * 0.08), int(w * 0.63), 3 * SS): d.point((xx, yy), fill=(46, 46, 50))   # 窗的網點（規則的格子）
    d.rectangle([w * 0.74, h * 0.14, w * 0.95, h * 0.3], fill=(36, 40, 40))   # 顯示窗（不亮）
    for r in range(4):
        for c in range(3): d.rectangle([w * (0.745 + c * 0.07), h * (0.38 + r * 0.11), w * (0.795 + c * 0.07), h * (0.45 + r * 0.11)], fill=(196, 196, 194))
    P.paste(img, (REG['mw_door'][0] * SS, REG['mw_door'][1] * SS))
    # 洗碗機門
    w, h = sz('dw_front'); img = Image.new('RGB', (w, h), SW['white_app'][0]); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w, h * 0.12], fill=(214, 214, 210))
    for k in range(5): d.rectangle([w * (0.56 + k * 0.08), h * 0.035, w * (0.6 + k * 0.08), h * 0.085], fill=(150, 150, 150))
    P.paste(img, (REG['dw_front'][0] * SS, REG['dw_front'][1] * SS))
    # 爐口：鍍鉻承盤＋深色電熱圈（阿基米德螺線）
    w, h = sz('coil'); img = Image.new('RGB', (w, h), SW['chrome'][0]); d = ImageDraw.Draw(img); cx, cy = w / 2, h / 2
    pts = [(cx + (0.06 + 0.38 * k / 400) * w * math.cos(k * 0.0785), cy + (0.06 + 0.38 * k / 400) * h * math.sin(k * 0.0785)) for k in range(400)]
    d.line(pts, fill=(36, 34, 34), width=4 * SS); d.ellipse([cx - 0.06 * w, cy - 0.06 * h, cx + 0.06 * w, cy + 0.06 * h], fill=(70, 70, 74))
    P.paste(img.filter(ImageFilter.GaussianBlur(0.4 * SS)), (REG['coil'][0] * SS, REG['coil'][1] * SS))
    w, h = sz('cooktop'); P.paste(Image.new('RGB', (w, h), (232, 232, 228)), (REG['cooktop'][0] * SS, REG['cooktop'][1] * SS))
    w, h = sz('grille'); img = Image.new('RGB', (w, h), (70, 70, 72)); d = ImageDraw.Draw(img)
    for k in range(0, h, 6 * SS): d.rectangle([0, k, w, k + 3 * SS], fill=(28, 28, 30))
    P.paste(img, (REG['grille'][0] * SS, REG['grille'][1] * SS))
    wear(P)


# ================= 第 9 節補強：磨損、髒污、AO（畫在底色上；粗糙度另外記在 ROUGH_MASKS，make_textures 畫進 ORM） =================
ROUGH_MASKS = []   # (區塊名, 遮罩（區塊大小、0～1）, 粗糙度)


def soft(w, h, shapes, blur, noise=0.0, seed=0):
    """畫一張 0～1 的遮罩：shapes＝[(cx, cy, rx, ry, 強度, 'fill'|'ring')]（像素）；邊緣模糊、加一點不均勻"""
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    for (cx, cy, rx, ry, k, kind) in shapes:
        box_ = [cx - rx, cy - ry, cx + rx, cy + ry]; v = int(255 * k)
        if kind == 'ring': d.ellipse(box_, outline=v, width=max(1, int(min(rx, ry) * 0.12)))
        else: d.ellipse(box_, fill=v)
    a = np.asarray(m.filter(ImageFilter.GaussianBlur(blur)), np.float32) / 255
    if noise:
        g = np.random.default_rng(seed); n = np.asarray(Image.fromarray((g.random((max(2, h // 8), max(2, w // 8))) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        a = a * (1 - noise + noise * 2 * n)
    return np.clip(a, 0, 1)


def region_arr(P, name):
    x0, y0, x1, y1 = REG[name]; return np.asarray(P.crop((x0 * SS, y0 * SS, x1 * SS, y1 * SS)), np.float32)


def put(P, name, a): P.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (REG[name][0] * SS, REG[name][1] * SS))


def wear(P):
    # --- 花崗石檯面：水槽前後的水漬（乾掉的白圈、霧面）、杯子的圈、爐子旁的油漬、靠牆那一條的 AO ---
    a = region_arr(P, 'granite'); h, w = a.shape[:2]
    def gp(x, z): return (x + 1.4) / 2.8 * w, (1 - (z + 0.3) / 0.61) * h
    sx, sz_ = w / 2.8, h / 0.61   # 每公尺幾個像素（橫、直不一樣：圓的漬在檯面上才是圓的）
    for (x, z, r) in WATER + RINGS + OIL: assert z - r > COUNTER_SAFE[0] or z + r < -COUNTER_SAFE[1], (x, z, r)
    mw = soft(w, h, [(*gp(x, z), r * sx, r * sz_, 0.8, 'fill') for (x, z, r) in WATER] + [(*gp(x, z), r * sx, r * sz_, 1.0, 'ring') for (x, z, r) in RINGS], 2.5 * SS, noise=0.6, seed=3)
    mo = soft(w, h, [(*gp(x, z), r * sx, r * sz_, 0.7, 'fill') for (x, z, r) in OIL], 4 * SS, noise=0.5, seed=4)
    a = a * (1 - 0.42 * mw[..., None]) + np.array((104, 100, 96), np.float32) * 0.42 * mw[..., None]   # 水漬：礦物的灰白、霧
    a = a * (1 - 0.22 * mo[..., None]) + np.array((40, 30, 18), np.float32) * 0.22 * mo[..., None]     # 油：暗一點、偏黃褐
    zz = -0.3 + 0.61 * (1 - (np.arange(h) + 0.5) / h)                                                 # 每一列對到的 z
    ao = np.clip((zz + 0.28) / 0.035, 0, 1); ao = 0.8 + 0.2 * ao                                      # 靠牆（擋水板前面）3.5 cm 由 0.8 到 1
    a *= ao[:, None, None]; put(P, 'granite', a)
    ROUGH_MASKS.extend([('granite', mw, 0.5), ('granite', mo, 0.12)])
    # --- 門片：把手附近手摸的地方暗一點、亮一點（四種把手位置） ---
    base = region_arr(P, 'maple_door'); h, w = base.shape[:2]
    for name, (s, t) in DOOR_KNOB.items():
        m = soft(w, h, [(s * w, (1 - t) * h, 0.16 * w, 0.1 * h, 0.9, 'fill')], 6 * SS, noise=0.4, seed=20 + list(DOOR_KNOB).index(name))
        a = base * (1 - 0.2 * m[..., None]) + np.array((96, 72, 50), np.float32) * 0.2 * m[..., None]; put(P, name, a)
        ROUGH_MASKS.append((name, m, 0.36))
    # --- 爐面：爐口周圍的油點、前面一條滴下來的痕 ---
    a = region_arr(P, 'cooktop'); h, w = a.shape[:2]; g = np.random.default_rng(11); dots = []
    for (x, z, r) in ((-0.18, 0.13, 0.095), (0.18, 0.13, 0.08), (-0.18, -0.15, 0.08), (0.18, -0.15, 0.095)):
        cx, cy = (x + 0.38) / 0.76 * w, (1 - (0.315 - z) / 0.615) * h
        for _ in range(26):
            ang = g.uniform(0, 2 * math.pi); rr = (r + g.uniform(0.012, 0.06)); px = cx + math.cos(ang) * rr / 0.76 * w; py = cy - math.sin(ang) * rr / 0.615 * h
            q = g.uniform(0.6, 1.8) * SS; dots.append((px, py, q, q, g.uniform(0.4, 0.9), 'fill'))
    x, z = -0.18, 0.13; cx, cy = (x + 0.38) / 0.76 * w, (1 - (0.315 - z) / 0.615) * h
    for k in range(10): dots.append((cx + 0.11 / 0.76 * w + k * 0.4 * SS, cy + (0.1 + k * 0.012) / 0.615 * h, 2 * SS, 3 * SS, 0.6, 'fill'))   # 滴下來的一條
    m = soft(w, h, dots, 0.8 * SS)
    a = a * (1 - 0.3 * m[..., None]) + np.array((176, 158, 112), np.float32) * 0.3 * m[..., None]; put(P, 'cooktop', a)
    ROUGH_MASKS.append(('cooktop', m, 0.42))
    # --- 砧板：淺色木紋、刀痕、中間一塊洗不掉的淡色 ---
    w, h = sz('board'); zw = lum(SRC['walnut'], w, h); img = tint(zw, (204, 168, 120), 0.05); d = ImageDraw.Draw(img); g = np.random.default_rng(5)
    for _ in range(70):
        x0, y0 = g.uniform(0.15, 0.85) * w, g.uniform(0.15, 0.85) * h; ang = g.normal(0.3, 0.5); L_ = g.uniform(0.04, 0.16) * w
        d.line([(x0, y0), (x0 + math.cos(ang) * L_, y0 + math.sin(ang) * L_)], fill=(226, 200, 160) if g.random() < 0.6 else (168, 132, 92), width=1)
    a = np.asarray(img, np.float32); m = soft(w, h, [(0.52 * w, 0.5 * h, 0.22 * w, 0.2 * h, 0.7, 'fill')], 10 * SS, noise=0.6, seed=6)
    a = a * (1 - 0.1 * m[..., None]) + np.array((150, 128, 110), np.float32) * 0.1 * m[..., None]
    ee = np.minimum.outer(np.minimum(np.arange(h), np.arange(h)[::-1]), np.minimum(np.arange(w), np.arange(w)[::-1])) / (0.05 * min(w, h))
    a *= (0.86 + 0.14 * np.clip(ee, 0, 1))[..., None]; put(P, 'board', a)                              # 邊緣比較暗（端面、手摸）
    # --- 冰箱門上的三張紙（沒有字：手寫的線、照片、課表的格子） ---
    w, h = sz('note_list'); img = Image.new('RGB', (w, h), (246, 242, 230)); d = ImageDraw.Draw(img); g = np.random.default_rng(7)
    d.line([(k, 2 * SS + (3 * SS if (k // (4 * SS)) % 2 else 0)) for k in range(0, w, 2 * SS)], fill=(214, 208, 192), width=SS)   # 撕下來的上緣
    for row in range(7):
        y = (0.16 + row * 0.11) * h; x = 0.1 * w; L_ = g.uniform(0.45, 0.8) * w; pts = []
        for k in range(48):
            t_ = k / 47; pts.append((x + t_ * L_, y + math.sin(t_ * 38 + row) * 1.4 * SS + g.normal(0, 0.4 * SS)))
        d.line(pts, fill=(44, 70, 140), width=SS)
        if row == 3: d.line([(x, y), (x + L_ * 0.7, y)], fill=(44, 70, 140), width=SS)   # 劃掉的一項
    put(P, 'note_list', np.asarray(img, np.float32))
    w, h = sz('note_photo'); img = Image.new('RGB', (w, h), (244, 244, 240)); d = ImageDraw.Draw(img); b = int(0.07 * w)
    for yy in range(b, h - b):
        t_ = (yy - b) / max(1, h - 2 * b); c = (int(150 + 60 * t_), int(190 + 35 * t_), int(222 + 12 * t_)) if t_ < 0.55 else (70, 118, int(150 - 20 * t_))
        d.line([(b, yy), (w - b, yy)], fill=c)
    d.polygon([(b, h * 0.58), (w * 0.3, h * 0.36), (w * 0.52, h * 0.5), (w * 0.72, h * 0.3), (w - b, h * 0.52), (w - b, h * 0.6), (b, h * 0.62)], fill=(84, 116, 104))
    put(P, 'note_photo', np.asarray(img, np.float32))
    w, h = sz('note_cal'); img = Image.new('RGB', (w, h), (250, 250, 246)); d = ImageDraw.Draw(img); g = np.random.default_rng(8)
    gx0, gy0, gx1, gy1 = 0.08 * w, 0.14 * h, 0.92 * w, 0.92 * h; cw, ch = (gx1 - gx0) / 5, (gy1 - gy0) / 7
    for (c, r_) in ((0, 1), (2, 1), (1, 3), (3, 3), (4, 2), (0, 5), (2, 4)):
        d.rectangle([gx0 + c * cw + SS, gy0 + r_ * ch + SS, gx0 + (c + 1) * cw - SS, gy0 + (r_ + 1) * ch - SS], fill=[(240, 204, 172), (192, 222, 202), (204, 212, 240)][(c + r_) % 3])
    d.rectangle([gx0, gy0, gx1, gy0 + ch], fill=(226, 226, 222))
    for k in range(6): d.line([(gx0 + k * cw, gy0), (gx0 + k * cw, gy1)], fill=(160, 160, 158), width=SS)
    for k in range(8): d.line([(gx0, gy0 + k * ch), (gx1, gy0 + k * ch)], fill=(160, 160, 158), width=SS)
    d.rectangle([0.08 * w, 0.04 * h, 0.5 * w, 0.08 * h], fill=(60, 60, 64))   # 上面一條粗線（標題的位置，沒有字）
    put(P, 'note_cal', np.asarray(img, np.float32))
    # --- 捲筒紙巾：菱形壓紋（很淡）＋一條撕線 ---
    w, h = sz('towel_roll'); yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); per = 9 * SS
    q = (np.abs(((xx + yy) % per) - per / 2) < 0.7 * SS) | (np.abs(((xx - yy) % per) - per / 2) < 0.7 * SS)
    a = np.full((h, w, 3), 240, np.float32); a[q] -= 9
    a[:, int(0.3 * w):int(0.3 * w) + SS][(np.arange(h) // (3 * SS)) % 2 == 0] -= 22
    put(P, 'towel_roll', a)


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
    for name, m, rough in ROUGH_MASKS:   # 第 9 節補強：水漬霧、油亮、把手附近被手摸亮
        x0, y0, x1, y1 = REG[name]; X0, Y0, X1, Y1 = int(x0 * f), int(y0 * f), int(math.ceil(x1 * f)), int(math.ceil(y1 * f))
        mm = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((X1 - X0, Y1 - Y0), Image.BILINEAR), np.float32) / 255
        g = orm[Y0:Y1, X0:X1, 1].astype(np.float32); orm[Y0:Y1, X0:X1, 1] = np.clip(g * (1 - mm) + rough * 255 * mm, 0, 255).astype(np.uint8)
    Image.fromarray(orm).save(ATLAS_ORM)


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
def Rz(a): c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 1], M[1, 0], M[1, 1] = c, -s, s, c; return M


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


def box(pm, x0, x1, y0, y1, z0, z1, uv, M=None, inward=False, skip=()):
    """沒有倒角的方塊：6 面 12 個三角形；inward＝法線朝裡（水槽的槽）；skip＝不做的面"""
    sub = PM()
    F = {'t': ([(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)), 'k': ([(x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)], (0, 0, -1)),
         'r': ([(x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)], (1, 0, 0)), 'l': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0))}
    for key, (pts, n) in F.items():
        if key in skip: continue
        fn = uv.get(key) or uv.get('*'); nn = tuple(-v for v in n) if inward else n
        sub.poly(pts, [fn(0, 0), fn(1, 0), fn(1, 1), fn(0, 1)], nn)
    return pm.add(sub, M)


GR, GE, MD, MP, WA = R('granite'), S('granite_edge'), R('maple_door'), R('maple'), S('white_app')
UV_GRANITE = {'t': GR, '*': GR}


def granite(pm, x0, x1, y0, y1, z0, z1, r=0.006, seg=2, ox=0.0, oz=0.0):
    """花崗石板：上面、正面照世界座標貼（2.8 m×0.61 m 對到花崗石那一塊），幾塊拼起來接得上、顆粒不會被拉長；ox、oz＝這塊板在流理台本地座標裡的位移（窗口的檯面、吧台用）"""
    W, H, D = x1 - x0, y1 - y0, z1 - z0
    def top(s_, t_): return ruv('granite', (x0 + s_ * W + ox + 1.4) / 2.8, ((z1 - t_ * D) + oz + 0.3) / 0.61)   # 不取餘數（右端 1.0 會變回 0）；ruv 自己夾在 0～1
    def front(s_, t_): return ruv('granite', (x0 + s_ * W + ox + 1.4) / 2.8, ((y0 + t_ * H) - 0.6) / 0.61)
    rbox(pm, x0, x1, y0, y1, z0, z1, {'t': top, 'f': front, 'k': front, '*': GR}, r=r, seg=seg)


def knob(pm, x, y, z, fn=None, r=0.014, M=None):
    """小圓把手（正面朝 +z）"""
    fn = fn or S('chrome')
    lathe(pm, [(0.006, 0.0, 0.006, 0.014, fn, 'out'), (0.006, 0.014, r, 0.02, fn, 'out'), (r, 0.02, r, 0.026, fn, 'out'), (r, 0.026, 0.0, 0.028, fn, 'up')], 10, M=(M if M is not None else np.eye(4)) @ T(x, y, z) @ Rx(math.pi / 2))


def fridge():
    pm = PM(); hx, d0, d1, H = 0.4, -0.375, 0.33, 1.75
    rbox(pm, -hx, hx, 0.03, H - 0.005, d0, d1, {'*': S('white_side')}, r=0.02, seg=2)
    rbox(pm, -hx + 0.004, hx - 0.004, 1.245, H, d1, 0.375, {'*': WA}, r=0.012, seg=2)      # 冷凍庫門
    rbox(pm, -hx + 0.004, hx - 0.004, 0.085, 1.23, d1, 0.375, {'*': WA}, r=0.012, seg=2)   # 冷藏門
    for (y0, y1) in ((1.3, 1.62), (0.75, 1.17)):   # 直把手（左邊，門鉸在右邊）
        x = -hx + 0.055
        for yy in (y0, y1): box(pm, x - 0.01, x + 0.01, yy - 0.012, yy + 0.012, 0.375, 0.41, {'*': S('handle_w')})
        rbox(pm, x - 0.014, x + 0.014, y0 - 0.02, y1 + 0.02, 0.41, 0.435, {'*': S('handle_w')}, r=0.008, seg=2)
    box(pm, -hx + 0.02, hx - 0.02, 0.0, 0.08, 0.3, 0.34, {'f': R('grille'), '*': S('toe')})   # 通風格柵
    # 第 9 節補強（生活痕跡）：門上三張紙＋磁鐵（沒有字：手寫的線、照片、課表的格子）；只做正面（紙 0.8 mm，邊看不到）
    for (name, w, h, cx, cy, deg, mag) in (('note_list', 0.1, 0.15, 0.12, 1.08, 3.0, 'mag_r'), ('note_photo', 0.1, 0.067, -0.13, 1.1, -4.0, 'mag_b'), ('note_cal', 0.14, 0.2, 0.09, 1.47, 1.5, 'mag_y')):
        M = T(cx, cy, 0.3752) @ Rz(math.radians(deg)); box(pm, -w / 2, w / 2, -h / 2, h / 2, 0.0, 0.0008, {'f': R(name)}, M=M, skip=('k', 't', 'b', 'l', 'r'))
        magnet(pm, M @ T(0.0, h / 2 - 0.012, 0.0008), mag)
    magnet(pm, T(-0.2, 0.92, 0.375), 'mag_y')   # 一個沒有夾東西的磁鐵
    return pm


def magnet(pm, M, sw):
    lathe(pm, [(0.011, 0.0, 0.011, 0.005, S(sw), 'out'), (0.011, 0.005, 0.0095, 0.0062, S(sw), 'out')], 10, caps=[(0.0095, 0.0062, S(sw), 'up')], M=M @ Rx(math.pi / 2))


# 流理台的本地座標：x −1.4～1.4（layout 是 ry=π，本地 +x＝房間的西邊）；z −0.3（靠牆）～0.3
RANGE_X, SINK_X, DW_X = (-0.18, 0.58), -0.5, (-1.4, -0.8)
TOP_Y, TOP_T = 0.92, 0.03


def base_cab(pm, x0, x1, doors=2, drawer=False, body_top=None):
    """一段下櫃：踢腳（退縮）、櫃體、門片（或上面一個抽屜）、把手；body_top：水槽下面的櫃體要低於槽底（不然從槽裡看得到櫃體的頂）"""
    box(pm, x0 + 0.01, x1 - 0.01, 0.0, 0.1, -0.29, 0.21, {'*': S('toe')})
    box(pm, x0, x1, 0.1, body_top or (TOP_Y - TOP_T), -0.3, 0.27, {'f': MP, '*': MP})
    if body_top:   # 櫃體低下去的那一截：只留前面的框和兩側（從檯面的洞看下去是暗的）
        box(pm, x0, x1, body_top, TOP_Y - TOP_T, 0.24, 0.27, {'*': MP}, skip=('t',)); box(pm, x0, x0 + 0.018, body_top, TOP_Y - TOP_T, -0.3, 0.24, {'*': MP}); box(pm, x1 - 0.018, x1, body_top, TOP_Y - TOP_T, -0.3, 0.24, {'*': MP})
    ytop = TOP_Y - TOP_T - 0.03
    if drawer:
        rbox(pm, x0 + 0.005, x1 - 0.005, ytop - 0.14, ytop, 0.27, 0.29, {'f': MD, '*': MP}, r=0.004, seg=1)
        knob(pm, (x0 + x1) / 2, ytop - 0.07, 0.29); ytop -= 0.155
    w = (x1 - x0 - 0.01 * (doors + 1)) / doors
    for k in range(doors):
        a = x0 + 0.01 + k * (w + 0.01); rbox(pm, a, a + w, 0.12, ytop, 0.27, 0.29, {'f': R('door_tr' if (doors == 1 or k == 0) else 'door_tl'), '*': MP}, r=0.004, seg=1)
        kx = a + w - 0.04 if (doors == 1 or k == 0) else a + 0.04; knob(pm, kx, ytop - 0.06, 0.29)


def counter():
    pm = PM()
    base_cab(pm, -0.8, RANGE_X[0], doors=2, body_top=0.68)   # 水槽下面：兩扇門（櫃體低於槽底 0.72）
    base_cab(pm, RANGE_X[1], 1.0, doors=1, drawer=True)      # 爐子西邊：抽屜＋一扇門
    base_cab(pm, 1.0, 1.4, doors=1, drawer=True)             # 西南角的轉角櫃
    box(pm, -1.4, -1.38, 0.0, TOP_Y - TOP_T, -0.3, 0.29, {'*': MP})   # 東端的側板（洗碗機旁邊）
    # 檯面：爐子那一段空著；水槽的洞（x −0.77～−0.23、z −0.21～0.21）
    sx0, sx1, sz0, sz1 = SINK_X - 0.27, SINK_X + 0.27, -0.21, 0.21; ty0 = TOP_Y - TOP_T
    for (x0, x1, z0, z1) in ((-1.4, sx0, -0.3, 0.31), (sx1, RANGE_X[0], -0.3, 0.31), (sx0, sx1, -0.3, sz0), (sx0, sx1, sz1, 0.31), (RANGE_X[1], 1.4, -0.3, 0.31)):
        granite(pm, x0, x1, ty0, TOP_Y, z0, z1)
    for (x0, x1) in ((-1.4, RANGE_X[0]), (RANGE_X[1], 1.4)):   # 10 cm 的花崗石擋水
        granite(pm, x0, x1, TOP_Y, TOP_Y + 0.1, -0.3, -0.28, r=0.004, seg=1)
    return pm


def range_():
    pm = PM(); hx = 0.38
    rbox(pm, -hx, hx, 0.02, 0.9, -0.3, 0.3, {'*': S('white_side')}, r=0.008, seg=1)
    rbox(pm, -hx, hx, 0.9, TOP_Y, -0.3, 0.315, {'t': R('cooktop'), '*': WA}, r=0.006, seg=2)
    for (x, z, r) in ((-0.18, 0.13, 0.095), (0.18, 0.13, 0.08), (-0.18, -0.15, 0.08), (0.18, -0.15, 0.095)):   # 四個爐口：承盤＋電熱圈
        lathe(pm, [(r + 0.012, 0.0, r, 0.004, S('chrome'), 'out'), (r, 0.004, r - 0.006, 0.004, S('chrome'), 'up')], 18, caps=[(r - 0.006, 0.002, R('coil'), 'up')], M=T(x, TOP_Y, z))
    rbox(pm, -hx, hx, TOP_Y, TOP_Y + 0.2, -0.33, -0.27, {'*': WA}, r=0.006, seg=1)   # 背板
    for x in (-0.27, -0.12, 0.12, 0.27): knob(pm, x, TOP_Y + 0.1, -0.27, S('knob_black'), r=0.018)
    rbox(pm, -hx + 0.01, hx - 0.01, 0.2, 0.8, 0.3, 0.33, {'f': R('oven_door'), '*': WA}, r=0.006, seg=1)   # 烤箱門
    sweep(pm, [(-0.3, 0.74, 0.33), (-0.3, 0.74, 0.37), (0.3, 0.74, 0.37), (0.3, 0.74, 0.33)], 0.009, 6, S('chrome'))   # 橫把手
    rbox(pm, -hx + 0.01, hx - 0.01, 0.04, 0.18, 0.3, 0.33, {'*': WA}, r=0.006, seg=1)   # 下面的抽屜
    box(pm, -0.12, 0.12, 0.155, 0.165, 0.33, 0.335, {'*': S('steel_dark')})
    # 微波爐（上方，離地 1.45）
    rbox(pm, -hx, hx, 1.45, 1.85, -0.33, 0.07, {'f': R('mw_door'), '*': WA}, r=0.008, seg=1)
    box(pm, 0.13, 0.16, 1.5, 1.8, 0.07, 0.1, {'*': S('handle_w')})   # 門的把手（窗和按鍵中間）
    box(pm, -hx + 0.04, hx - 0.04, 1.45, 1.452, -0.2, 0.05, {'*': S('shadow')}, skip=('t',))   # 底下的排風格（很淡的一塊）
    return pm


def sink():
    """原點＝檯面的高度；槽往 −y"""
    pm = PM(); hx, hz = 0.27, 0.21
    for (x0, x1) in ((-0.26, -0.01), (0.01, 0.26)):
        box(pm, x0, x1, -0.2, 0.0, -0.19, 0.19, {'b': S('steel_low'), '*': S('steel')}, inward=True, skip=('t',))   # 槽底暗一點（AO）
        lathe(pm, [(0.0, -0.198, 0.035, -0.198, S('drain'), 'up')], 12, M=T((x0 + x1) / 2, 0, 0.02))
    for (x0, x1, z0, z1) in ((-hx, hx, -hz, -0.19), (-hx, hx, 0.19, hz), (-hx, -0.26, -0.19, 0.19), (0.26, hx, -0.19, 0.19), (-0.01, 0.01, -0.19, 0.19)):
        box(pm, x0, x1, -0.004, 0.003, z0, z1, {'*': S('steel')}, skip=('b',))   # 邊框（蓋住檯面的洞邊）
    lathe(pm, [(0.0, 0.003, 0.026, 0.003, S('chrome'), 'up'), (0.026, 0.003, 0.02, 0.03, S('chrome'), 'out'), (0.02, 0.03, 0.014, 0.06, S('chrome'), 'out')], 12, M=T(0, 0, -0.2))
    pts = [(0, 0.06, -0.2), (0, 0.2, -0.2), (0, 0.29, -0.17), (0, 0.3, -0.11), (0, 0.27, -0.05), (0, 0.22, -0.03)]
    sweep(pm, pts, 0.011, 8, S('chrome'))   # 鵝頸水龍頭
    box(pm, 0.018, 0.026, 0.035, 0.05, -0.215, -0.185, {'*': S('chrome')}); rbox(pm, 0.024, 0.11, 0.045, 0.055, -0.21, -0.19, {'*': S('chrome')}, r=0.004, seg=1)   # 撥桿
    return pm


def dishwasher():
    pm = PM(); hx = 0.3
    box(pm, -hx + 0.01, hx - 0.01, 0.0, 0.1, -0.29, 0.2, {'*': S('toe')})
    box(pm, -hx + 0.005, hx - 0.005, 0.1, 0.86, -0.29, 0.25, {'*': S('white_side')})
    rbox(pm, -hx + 0.005, hx - 0.005, 0.1, 0.87, 0.25, 0.28, {'f': R('dw_front'), '*': WA}, r=0.006, seg=1)
    sweep(pm, [(-0.22, 0.75, 0.28), (-0.22, 0.75, 0.31), (0.22, 0.75, 0.31), (0.22, 0.75, 0.28)], 0.008, 6, S('handle_w'))
    return pm


def upper():
    """吊櫃：本地 x 和 US_COUNTER 相同；底 1.45、高 0.75、深 0.33（靠牆 z −0.3）；微波爐那一格只有上面的短櫃"""
    pm = PM(); y0, y1, z0, z1 = 1.45, 2.2, -0.3, 0.03
    def cab(x0, x1, doors, yb=y0):
        box(pm, x0, x1, yb, y1, z0, z1 - 0.02, {'b': S('maple_under'), '*': MP})   # 底面暗（AO）
        w = (x1 - x0 - 0.008 * (doors + 1)) / doors
        for k in range(doors):
            a = x0 + 0.008 + k * (w + 0.008); rbox(pm, a, a + w, yb + 0.01, y1 - 0.01, z1 - 0.02, z1, {'f': R('door_br' if k % 2 == 0 else 'door_bl'), '*': MP}, r=0.004, seg=1)
            knob(pm, a + w - 0.04 if k % 2 == 0 else a + 0.04, yb + 0.06, z1)
    cab(-1.4, -0.79, 2); cab(-0.79, RANGE_X[0], 2); cab(RANGE_X[0], RANGE_X[1], 2, yb=1.87); cab(RANGE_X[1], 1.4, 2)
    return pm


def passshelf():
    pm = PM(); granite(pm, -0.9, 0.9, 1.02, 1.05, -0.15, 0.15, ox=0.3); return pm


def bar():
    """吧台：花崗石懸出 0.36；靠牆那一側在 −z，坐的人在 +z；三個黑色 L 形托架"""
    pm = PM(); granite(pm, -1.0, 1.0, 1.02, 1.05, -0.18, 0.18, r=0.008, ox=0.2)
    for x in (-0.8, 0.0, 0.8):
        sweep(pm, [(x, 0.8, -0.18), (x, 1.015, -0.18), (x, 1.015, 0.08)], 0.012, 4, S('bracket'))
        sweep(pm, [(x, 0.86, -0.18), (x, 1.0, 0.04)], 0.009, 4, S('bracket'))   # 斜撐
    return pm


# ================= 第 9 節補強：生活痕跡（一個節點，原點和 US_COUNTER 相同：照流理台的位置擺就對齊） =================
def plate(r=0.11, seg=16):
    q = PM(); C, BL = S('ceramic'), S('rim_blue')
    lathe(q, [(0.042, 0.0, 0.046, 0.007, C, 'out'), (0.046, 0.007, r * 0.78, 0.013, C, 'out'), (r * 0.78, 0.013, r, 0.022, C, 'out'),
              (r, 0.022, r - 0.005, 0.024, BL, 'up'), (r - 0.005, 0.024, r * 0.7, 0.016, C, 'up'), (r * 0.7, 0.016, 0.0, 0.014, C, 'up')], seg, caps=[(0.042, 0.0, C, 'down')])
    return q


def bowl(r=0.072, h=0.06, seg=16):
    q = PM(); C, BL = S('ceramic'), S('rim_blue')
    lathe(q, [(0.03, 0.0, 0.033, 0.007, C, 'out'), (0.033, 0.007, r * 0.82, h * 0.55, C, 'out'), (r * 0.82, h * 0.55, r, h, C, 'out'), (r, h, r - 0.004, h + 0.002, BL, 'up'),
              (r - 0.004, h + 0.002, r * 0.78, h * 0.55, C, 'in'), (r * 0.78, h * 0.55, 0.03, 0.012, C, 'in'), (0.03, 0.012, 0.0, 0.011, C, 'up')], seg, caps=[(0.03, 0.0, C, 'down')])
    return q


def mug(r=0.04, h=0.095, seg=14):
    q = PM(); MG = S('mug')
    lathe(q, [(r, 0.0, r, h, MG, 'out'), (r, h, r - 0.004, h, MG, 'up'), (r - 0.004, h, r - 0.004, 0.012, MG, 'in')], seg, caps=[(r - 0.004, 0.012, MG, 'up'), (r, 0.0, MG, 'down')])
    sweep(q, [(r - 0.002, 0.075, 0), (r + 0.022, 0.072, 0), (r + 0.028, 0.05, 0), (r + 0.022, 0.027, 0), (r - 0.002, 0.025, 0)], 0.0055, 6, MG)
    return q


def rrect(x0, x1, z0, z1, y, c=0.015):
    """圓角的長方形（鐵絲架的框）：每個角兩個點"""
    return [(x0 + c, y, z0), (x1 - c, y, z0), (x1, y, z0 + c), (x1, y, z1 - c), (x1 - c, y, z1), (x0 + c, y, z1), (x0, y, z1 - c), (x0, y, z0 + c)]


def life():
    pm = PM()
    # 水槽裡（左槽靠牆斜放一個盤子、前面一個碗；右槽一個杯子）＋水槽後面的海綿
    pm.add(plate(), T(-0.635, 0.818, -0.15) @ Rx(math.radians(70)))
    pm.add(bowl(), T(-0.64, 0.723, 0.07) @ Ry(0.4))
    pm.add(mug(), T(-0.37, 0.723, 0.04) @ Ry(2.2))
    q = PM(); rbox(q, -0.04, 0.04, 0.0, 0.02, -0.025, 0.025, {'*': S('sponge_y')}, r=0.006, seg=1); rbox(q, -0.04, 0.04, 0.02, 0.028, -0.025, 0.025, {'*': S('sponge_g')}, r=0.003, seg=1)
    pm.add(q, T(-0.66, TOP_Y, -0.245) @ Ry(0.15))
    # 瀝水架（洗碗機上面那一段檯面）：塑膠托盤、鐵絲框、兩排插盤子的鐵絲、兩個盤子、倒扣的杯子
    q = PM(); W_ = S('rack_wire'); rbox(q, -0.21, 0.21, 0.0, 0.016, -0.16, 0.16, {'*': S('rack_tray')}, r=0.006, seg=1)
    sweep(q, rrect(-0.19, 0.19, -0.14, 0.14, 0.035), 0.0025, 6, W_, closed=True); sweep(q, rrect(-0.19, 0.19, -0.14, 0.14, 0.1), 0.0025, 6, W_, closed=True)
    for (x, z) in ((-0.185, -0.135), (0.185, -0.135), (-0.185, 0.135), (0.185, 0.135)): sweep(q, [(x, 0.016, z), (x, 0.1, z)], 0.0025, 6, W_)
    for zr in (-0.1, 0.05):
        for k in range(6): x = -0.15 + k * 0.045; sweep(q, [(x, 0.035, zr), (x, 0.105, zr)], 0.002, 6, W_)
    for x in (-0.1, -0.025): q.add(plate(), T(x, 0.146, -0.02) @ Rz(-math.pi / 2 + 0.1))   # 盤子的厚度往 +x：x 是盤子背面，夾在兩根鐵絲中間
    q.add(mug(), T(0.13, 0.037 + 0.095, 0.07) @ Rx(math.pi) @ Ry(2.0))   # 倒扣，把手朝前（不會穿出框）
    pm.add(q, T(-1.08, TOP_Y, -0.03) @ Ry(0.05))
    # 電熱水壺（爐子西邊、靠牆）＋電線繞到擋水板後面
    q = PM(); K, KT = S('kettle_k'), S('kettle')
    lathe(q, [(0.088, 0.0, 0.088, 0.016, K, 'out'), (0.088, 0.016, 0.074, 0.02, K, 'up')], 16)
    lathe(q, [(0.076, 0.02, 0.082, 0.07, KT, 'out'), (0.082, 0.07, 0.079, 0.14, KT, 'out'), (0.079, 0.14, 0.066, 0.195, KT, 'out'), (0.066, 0.195, 0.045, 0.21, KT, 'out'),
              (0.045, 0.21, 0.043, 0.214, K, 'out'), (0.043, 0.214, 0.0, 0.222, K, 'up')], 16)
    lathe(q, [(0.012, 0.22, 0.012, 0.235, K, 'out'), (0.012, 0.235, 0.0, 0.238, K, 'up')], 8)
    sweep(q, [(0.074, 0.185, 0), (0.108, 0.19, 0), (0.125, 0.16, 0), (0.124, 0.09, 0), (0.105, 0.05, 0), (0.078, 0.045, 0)], 0.013, 6, K)
    sweep(q, [(-0.07, 0.13, 0), (-0.095, 0.155, 0), (-0.11, 0.175, 0)], lambda t: 0.016 - 0.006 * t, 6, KT)
    pm.add(q, T(0.95, TOP_Y, -0.14) @ Ry(-0.5))
    sweep(pm, [(0.98, TOP_Y + 0.004, -0.21), (1.05, TOP_Y + 0.004, -0.235), (1.12, TOP_Y + 0.004, -0.25), (1.16, TOP_Y + 0.006, -0.268), (1.17, TOP_Y + 0.05, -0.276), (1.175, TOP_Y + 0.085, -0.288)], 0.0035, 6, S('cord'))
    # 砧板：靠在擋水板上
    q = PM(); rbox(q, -0.17, 0.17, 0.0, 0.25, -0.008, 0.008, {'f': R('board'), 'k': R('board', flip=True), '*': S('board_edge')}, r=0.004, seg=1)
    pm.add(q, T(1.2, TOP_Y, -0.215) @ Rx(-0.21))
    # 捲筒紙巾架（西南角）
    q = PM(); HD, TR = S('holder'), R('towel_roll')
    lathe(q, [(0.075, 0.0, 0.075, 0.01, HD, 'out'), (0.075, 0.01, 0.0, 0.014, HD, 'up')], 14)
    lathe(q, [(0.007, 0.014, 0.007, 0.31, HD, 'out'), (0.007, 0.31, 0.0, 0.315, HD, 'up')], 6)
    lathe(q, [(0.058, 0.016, 0.06, 0.02, TR, 'out'), (0.06, 0.02, 0.06, 0.285, TR, 'out'), (0.06, 0.285, 0.058, 0.29, TR, 'out'), (0.058, 0.29, 0.02, 0.29, S('ceramic'), 'up'), (0.02, 0.29, 0.02, 0.27, S('core'), 'in')], 16)
    pm.add(q, T(1.28, TOP_Y, -0.08))
    return pm


ITEMS = {'US_FRIDGE': fridge, 'US_COUNTER': counter, 'US_RANGE': range_, 'US_SINK': sink, 'US_DISHWASHER': dishwasher, 'US_UPPER': upper, 'US_PASSSHELF': passshelf, 'US_BAR': bar, 'US_KITCHEN_LIFE': life}
# GLB 裡的位置：流理台、爐子、水槽、洗碗機、吊櫃照組好的樣子擺（看得出彼此對齊）；冰箱、窗口檯面、吧台排在旁邊
SPREAD = {'US_COUNTER': (0.0, 0.0, 0.0, 0), 'US_RANGE': (0.2, 0.0, 0.0, 0), 'US_SINK': (SINK_X, TOP_Y, 0.0, 0), 'US_DISHWASHER': (-1.1, 0.0, 0.0, 0), 'US_UPPER': (0.0, 0.0, 0.0, 0),
          'US_FRIDGE': (2.0, 0.0, -0.075, 0), 'US_PASSSHELF': (0.0, 0.0, 1.6, 0), 'US_BAR': (0.0, 0.0, 2.2, 0), 'US_KITCHEN_LIFE': (0.0, 0.0, 0.0, 0)}
BUDGET = {'US_KITCHEN_LIFE': 2800, 'US_FRIDGE': 900, 'US_COUNTER': 2600, 'US_RANGE': 1800, 'US_SINK': 900, 'US_DISHWASHER': 400, 'US_UPPER': 1600, 'US_PASSSHELF': 200, 'US_BAR': 400}
TOTAL_BUDGET = 12000
SMOOTH = {'US_SINK': 0.9}


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('us_kitchen_props', props={'kind': 'us_kitchen_props'})
    mat = bpy.data.materials.new('us_kitchen'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    mods = {}; over = []
    for name, fn in ITEMS.items():
        pm = fn()
        ob = to_blender(pm, name, (mat,), root, SMOOTH.get(name, 0.6)); x, y, z, a = SPREAD[name]; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, math.radians(a))
        mn, mx = pm.bbox(); tris = sum(len(p.vertices) - 2 for p in ob.data.polygons); mods[name] = {'tris': tris, 'min': mn, 'max': mx}
        if tris > BUDGET[name]: over.append((name, tris))
    total = sum(m['tris'] for m in mods.values())
    print('TRIS', json.dumps({k: v['tris'] for k, v in mods.items()}), total, flush=True)
    assert not over, over
    assert total <= TOTAL_BUDGET, total
    info = L.export(out, gpu_instances=False)
    info['materials'] = 1
    info['modules'] = mods
    info['tris_total'] = total
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM)]
    info['origins'] = {'*': '地面上的底部中央、正面（人站的那一側）朝 +z；GLB 裡的位置見 SPREAD（流理台一組照組好的樣子擺）',
                       'US_COUNTER': '本地 x −1.4～1.4、z −0.3（靠牆）～0.31；layout 是 ry=π（本地 +x＝房間西邊）。爐子在本地 x 0.2（寬 0.76）、水槽 x −0.5、洗碗機 x −1.1（寬 0.6）',
                       'US_RANGE': '和 US_COUNTER 一樣靠牆（z −0.3）；微波爐離地 1.45～1.85，在同一個節點', 'US_SINK': '原點＝檯面的高度（放在 US_COUNTER 的 x −0.5、y 0.92），槽往 −y',
                       'US_UPPER': '原點在地面，本地 x 和 US_COUNTER 相同；吊櫃底 1.45、頂 2.2、深 0.33', 'US_PASSSHELF': '檯面頂 1.05；1.8×0.3',
                       'US_KITCHEN_LIFE': '生活痕跡（水槽裡的盤子、碗、杯子、海綿、瀝水架、電熱水壺＋電線、砧板、捲筒紙巾）：原點、本地座標都和 US_COUNTER 相同（照流理台的位置、角度擺就對齊）；整個節點可以拿掉',
                       'US_BAR': '檯面頂 1.05；靠牆那一側在 −z，坐的人在 +z（layout 的高腳椅在客廳那一側，放的時候 ry=π）'}
    info['note'] = '一個材質：us_kitchen（底色 1024＋ORM 256，metal 最高 0.40；花崗石＝Poly Haven granite_tile_03、楓木＝walnut_veneer 改色，都是 CC0）'
    L.write_json(out[:-4] + '.json', info)
    return info


if __name__ == '__main__':
    build()
