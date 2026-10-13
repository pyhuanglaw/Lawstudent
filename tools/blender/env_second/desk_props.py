"""桌上小物（使用者 2026-10-13 分工 U6：自習區的「桌上小物」是 LAWWW2 的；也補坐姿替身缺的筆記本、筆、手機——VISUAL_REVIEW 24.7 第 5 點）→ GLB，給遊戲用 InstancedMesh 放。
  /opt/blenv/bin/python tools/blender/env_second/desk_props.py [-- --out 輸出.glb]

全部一個材質 desk_props（1024 貼圖集＋粗糙度／金屬度＋自發光：只有螢幕會亮），每個網格就是一個 InstancedMesh。四種原點：
  item_*  單件：原點＝底面中心、y=0＝放的那個面、+z＝離開坐的人的方向（封面的字、螢幕正對坐在 −z 那一側的人）
  tset_*  自習雙人桌（0.9×0.6）上一個人面前的東西；rset_* 圓桌（Ø1.0）上的（比較少，放得進四分之一的扇形）。
          原點＝桌緣上、坐的人正前方那一點；y=0＝桌面（自習桌、圓桌都是 0.75）；+z＝往桌子裡面（坐的人面向 +z）。
  lset_*  講堂：原點＝座位的地面中心（和 furniture_study.glb 的講堂椅、seated_figures.glb 同一個原點：直接用同一個 instance 矩陣）；
          東西放在桌板（y 0.75、z 0.30–0.64）上。lset_write、lset_phone 配坐姿替身的「抄筆記」「滑手機」：筆在右手、手機在兩手中間
          （位置來自 data/seated_hands.json＝seated_hands.py 從替身的骨架算出來，四個底模平均，彼此差不到 2.5 cm）；其他配「聽講」（手在大腿上）。
  hold_*  只有手上的東西（座位座標，和替身同一個矩陣）：hold_phone（滑手機的姿勢，在哪裡坐都可以用）、hold_pen（抄筆記；只有桌面在座位座標 0.75 的地方對得上）。
每一組都有 _lod1（遠處用：三角形少很多，筆、螢光筆省略）。
貼圖是程式畫的平面圖案：紙上的手寫筆記、書頁的印刷字、螢幕畫面、封面——這些東西本來就是印刷或畫面（不是拿來冒充石材、木材的斑點）。
手寫：WenQuanYi Zen Hei 畫字後每個字隨機傾斜、大小、位置（只畫進貼圖，沒有附字型檔）。六法的條文是《中華民國刑法》第 1–4、12–14 條原文（遊戲裡看不清楚，但要正確）。
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
from lib2 import B, g2b, bpy   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = ARGS[ARGS.index('--out') + 1] if '--out' in ARGS else 'assets/models/env/second_ai/desk_props.glb'
GEN = os.path.join(HERE, 'textures', 'gen')
ATLAS, ATLAS_ORM, ATLAS_EMIT = (os.path.join(GEN, f'desk_props_{k}.png') for k in ('atlas', 'orm', 'emit'))
HANDS = os.path.join(HERE, 'data', 'seated_hands.json')
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
N, SS = 1024, 4          # 貼圖 1024；先畫 4 倍大再縮小（字、細線比較乾淨）
EMIT_N, ORM_N = 512, 256
EMIT_STRENGTH = 0.85

# ---------------- 貼圖集的區域（1024 的像素，左上角原點）----------------
REG = {
    'nb_spread': (0, 0, 512, 362),       # 打開的筆記本（B5 兩頁 364×257 mm）
    'bk_spread': (0, 362, 512, 718),     # 打開的六法（兩頁 304×215 mm）
    'scr_laptop': (512, 0, 832, 217),    # 筆電螢幕那一面（含邊框）304×206
    'deck': (512, 217, 832, 440),        # 鍵盤面 304×212
    'scr_phone': (832, 0, 912, 164),     # 手機螢幕（亮著）71.5×146.5
    'scr_off': (912, 0, 952, 82),        # 手機螢幕（暗）
    'ph_back': (952, 0, 992, 82),        # 手機背面
    'pen_strip': (912, 82, 1024, 98),    # 原子筆筆身（沿著筆的長度）
    'hl_strip': (912, 98, 1024, 114),    # 螢光筆筆身
    'hl_strip2': (912, 114, 1024, 130),  # 螢光筆（粉紅）
    'nb_cov_a': (512, 440, 640, 621),    # 筆記本封面（藍）182×257
    'nb_cov_b': (640, 440, 768, 621),    # 筆記本封面（綠）
    'code_cov': (768, 440, 896, 618),    # 六法封面 155×215
    'code_spine': (896, 440, 946, 618),  # 六法書背（厚 5.5 cm）
    'text_cov': (512, 621, 640, 802),    # 教科書封面 170×240
    'text_spine': (640, 621, 662, 802),  # 教科書書背
    'page_edge': (662, 621, 726, 685),   # 書頁的邊
    'sleeve': (726, 621, 918, 669),      # 紙杯的隔熱紙套（繞一圈）
    'pcase': (726, 669, 918, 717),       # 筆袋（布＋拉鍊）
}
SW = {   # 純色小格（sRGB）：(顏色, 粗糙度, 金屬度)
    'paper': ((243, 241, 233), 0.85, 0.0), 'gutter': ((128, 120, 108), 0.9, 0.0), 'card': ((214, 206, 192), 0.85, 0.0),
    'white_pl': ((236, 236, 232), 0.45, 0.0), 'black_pl': ((30, 30, 33), 0.45, 0.0), 'graphite': ((62, 64, 70), 0.4, 0.3),
    'alu': ((196, 199, 204), 0.38, 0.45), 'alu_dark': ((150, 153, 158), 0.4, 0.45), 'steel': ((176, 178, 182), 0.3, 0.45),
    'tape_blue': ((64, 88, 124), 0.6, 0.0), 'tape_green': ((88, 128, 110), 0.6, 0.0), 'code_navy': ((30, 44, 84), 0.5, 0.0),
    'text_teal': ((36, 112, 122), 0.55, 0.0), 'text_white': ((238, 236, 229), 0.6, 0.0),
    'hl_yellow': ((246, 226, 46), 0.45, 0.0), 'hl_pink': ((238, 112, 160), 0.45, 0.0),
    'cup_white': ((241, 239, 233), 0.7, 0.0), 'lid_white': ((232, 232, 228), 0.45, 0.0),
    'th_sage': ((132, 160, 136), 0.6, 0.0), 'th_navy': ((46, 62, 98), 0.6, 0.0), 'th_cream': ((231, 222, 203), 0.6, 0.0),
    'rubber': ((36, 36, 39), 0.9, 0.0), 'case_navy': ((42, 54, 82), 0.95, 0.0), 'pen_blue': ((40, 72, 162), 0.45, 0.0), 'pen_white': ((240, 240, 236), 0.45, 0.0),
}
SW_CELL, SW_Y0 = 48, 802
for i, k in enumerate(SW):
    cx, cy = (i % 21) * SW_CELL, SW_Y0 + (i // 21) * SW_CELL
    REG['sw_' + k] = (cx, cy, cx + SW_CELL, cy + SW_CELL)
ORM_REG = {   # 區域的粗糙度、金屬度
    'nb_spread': (0.85, 0.0), 'bk_spread': (0.82, 0.0), 'scr_laptop': (0.2, 0.0), 'deck': (0.4, 0.45), 'scr_phone': (0.18, 0.0), 'scr_off': (0.15, 0.0),
    'ph_back': (0.35, 0.0), 'pen_strip': (0.45, 0.0), 'hl_strip': (0.45, 0.0), 'hl_strip2': (0.45, 0.0), 'nb_cov_a': (0.55, 0.0), 'nb_cov_b': (0.55, 0.0),
    'code_cov': (0.5, 0.0), 'code_spine': (0.5, 0.0), 'text_cov': (0.55, 0.0), 'text_spine': (0.55, 0.0), 'page_edge': (0.9, 0.0), 'sleeve': (0.9, 0.0), 'pcase': (0.95, 0.0),
}


# ================= 貼圖 =================
class Painter:
    def __init__(self):
        self.im = Image.new('RGB', (N * SS, N * SS), (128, 128, 128))
        self.em = Image.new('RGB', (N * SS, N * SS), (0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.fonts = {}
        self.rng = np.random.default_rng(11)

    def font(self, px):
        px = max(4, int(round(px)))
        if px not in self.fonts: self.fonts[px] = ImageFont.truetype(FONT, px)
        return self.fonts[px]

    def box(self, name):
        x0, y0, x1, y1 = REG[name]; return x0 * SS, y0 * SS, x1 * SS, y1 * SS

    def sub(self, name):
        """區域的畫布（新的 RGB 圖），畫完用 put() 貼回去"""
        x0, y0, x1, y1 = self.box(name); return Image.new('RGB', (x1 - x0, y1 - y0))

    def put(self, name, img, emit=None):
        x0, y0, _, _ = self.box(name); self.im.paste(img, (x0, y0))
        if emit is not None: self.em.paste(emit, (x0, y0))

    def noise(self, img, amp, seed=0, scale=1):
        a = np.asarray(img, np.float32); r = np.random.default_rng(seed)
        h, w = a.shape[:2]
        n = r.normal(0, amp, (max(1, h // scale), max(1, w // scale), 1)).astype(np.float32)
        if scale > 1: n = np.asarray(Image.fromarray(n[..., 0]).resize((w, h), Image.BILINEAR), np.float32)[..., None]
        return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))

    def hand(self, img, x, y, text, size, color, seed=0, slant=0.18, weight=1.0):
        """手寫：每個字隨機大小、傾斜、旋轉、上下位置；筆畫顏色深淺不一（原子筆）"""
        r = np.random.default_rng(seed); cx = x
        for ch in text:
            if ch in ' 　':
                cx += size * (0.45 if ch == ' ' else 0.95); continue
            wide = ord(ch) > 0x2E80
            s = size * r.uniform(0.9, 1.05) * (1.0 if wide else 0.8)
            f = self.font(s); T = int(s * 1.7)
            tile = Image.new('L', (T, T), 0); ImageDraw.Draw(tile).text((s * 0.35, s * 0.2), ch, font=f, fill=255)
            if weight < 1.0: tile = tile.filter(ImageFilter.MinFilter(3))
            tile = tile.transform(tile.size, Image.AFFINE, (1, slant, -slant * T / 2, 0, 1, 0), resample=Image.BICUBIC)
            tile = tile.rotate(r.uniform(-5, 5), resample=Image.BICUBIC)
            k = r.uniform(0.72, 0.95); tile = tile.point(lambda v, k=k: int(v * k))
            img.paste(Image.new('RGB', tile.size, color), (int(cx - s * 0.35), int(y - s * 0.95 + r.uniform(-0.06, 0.06) * s)), tile)
            cx += s * (r.uniform(0.9, 1.02) if wide else r.uniform(0.55, 0.65))
        return cx

    def printed(self, dr, x, y, text, size, fill, bold=False):
        f = self.font(size)
        dr.text((x, y), text, font=f, fill=fill)
        if bold: dr.text((x + max(1, size // 18), y), text, font=f, fill=fill)


def paint_notebook_spread(P):
    img = P.sub('nb_spread'); W, H = img.size; mm = W / 364.0
    img.paste((243, 241, 233), (0, 0, W, H)); img = P.noise(img, 2.5, 1)
    dr = ImageDraw.Draw(img)
    rule = (150, 176, 206)
    for page in (0, 1):
        x0 = page * W // 2; x1 = x0 + W // 2
        # 頁首：No. ／ Date
        dr.line([(x1 - 70 * mm, 9 * mm), (x1 - 52 * mm, 9 * mm)], fill=(170, 170, 170), width=max(1, int(0.3 * mm)))
        dr.line([(x1 - 45 * mm, 9 * mm), (x1 - 12 * mm, 9 * mm)], fill=(170, 170, 170), width=max(1, int(0.3 * mm)))
        P.printed(dr, x1 - 79 * mm, 5.2 * mm, 'No.', int(3 * mm), (160, 160, 160)); P.printed(dr, x1 - 55 * mm, 5.2 * mm, 'Date', int(3 * mm), (160, 160, 160))
        for k in range(34):
            y = (14 + 7 * k) * mm
            if y > H - 6 * mm: break
            dr.line([(x0 + 6 * mm, y), (x1 - 6 * mm, y)], fill=rule, width=max(1, int(0.28 * mm)))
    blue, red = (28, 56, 140), (178, 40, 46)
    left = [('刑法總則　第三週', red, 1.08), ('犯罪的三個階層', blue, 1.0), ('一、構成要件該當性', blue, 1.0), ('　　行為、結果、因果關係', blue, 1.0),
            ('　　故意／過失', blue, 1.0), ('二、違法性', blue, 1.0), ('　　阻卻違法事由：正當防衛、緊急避難', blue, 1.0), ('三、罪責', blue, 1.0),
            ('　　責任能力、不法意識', blue, 1.0), ('→ 三層都成立，才成立犯罪', red, 1.0)]
    for i, (t, c, k) in enumerate(left):
        P.hand(img, 9 * mm, (14 + 7 * (i + 1)) * mm - 1.3 * mm, t, 4.5 * mm * k, c, seed=100 + i)
    dr.line([(9 * mm, (14 + 7 * 2) * mm + 0.4 * mm), (55 * mm, (14 + 7 * 2) * mm + 0.9 * mm)], fill=blue, width=max(1, int(0.35 * mm)))   # 標題底線
    # 左頁下方：三個框＋箭頭（手畫）
    yb = (14 + 7 * 13) * mm
    for j, t in enumerate(('構成要件', '違法', '罪責')):
        bx = (12 + j * 56) * mm
        dr.rounded_rectangle([bx, yb, bx + 40 * mm, yb + 13 * mm], radius=2 * mm, outline=blue, width=max(1, int(0.4 * mm)))
        P.hand(img, bx + 5 * mm, yb + 9.2 * mm, t, 4.3 * mm, blue, seed=200 + j)
        if j < 2:
            ax = bx + 42 * mm; dr.line([(ax, yb + 6.5 * mm), (ax + 11 * mm, yb + 6.5 * mm)], fill=blue, width=max(1, int(0.4 * mm)))
            dr.line([(ax + 8 * mm, yb + 4.5 * mm), (ax + 11 * mm, yb + 6.5 * mm), (ax + 8 * mm, yb + 8.5 * mm)], fill=blue, width=max(1, int(0.4 * mm)))
    more = [('四、未遂犯', blue), ('　　著手 → 未遂／既遂', blue), ('　　障礙未遂、不能未遂、中止未遂', blue), ('※ 下週：正當防衛的要件', red)]
    for i, (t, c) in enumerate(more):
        P.hand(img, 9 * mm, (14 + 7 * (i + 16)) * mm - 1.3 * mm, t, 4.5 * mm, c, seed=150 + i)
    right = [('例：甲被乙持刀攻擊，推倒乙', blue), ('　構成要件：該當（傷害？）', blue), ('　違法性：正當防衛？', blue), ('　　→「現在不法之侵害」', red),
             ('　　→ 防衛行為是否必要', blue), ('　罪責：', blue)]
    for i, (t, c) in enumerate(right):
        P.hand(img, W / 2 + 9 * mm, (14 + 7 * (i + 1)) * mm - 1.3 * mm, t, 4.5 * mm, c, seed=300 + i)
    a = np.asarray(img, np.float32)
    # 中間的裝訂線：陰影、兩個釘書針
    xs = (np.arange(W) - W / 2) / mm
    sh = 1.0 - 0.3 * np.exp(-np.abs(xs) / 5.0) - 0.08 * np.exp(-np.abs(xs) / 20.0)
    a *= sh[None, :, None]
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); dr = ImageDraw.Draw(img)
    for yy in (H * 0.25, H * 0.75):
        dr.rectangle([W / 2 - 0.5 * mm, yy - 4 * mm, W / 2 + 0.5 * mm, yy + 4 * mm], fill=(150, 150, 152))
    P.put('nb_spread', img)


LAW_L = [('中華民國刑法', True), ('第一編　總則', True), ('第一章　法例', True),
         ('第 1 條　行為之處罰，以行為時之法律有明文規定者為限。拘束人身自由之保安處分，亦同。', False),
         ('第 2 條　行為後法律有變更者，適用行為時之法律。但行為後之法律有利於行為人者，適用最有利於行為人之法律。', False),
         ('沒收、非拘束人身自由之保安處分適用裁判時之法律。', False),
         ('處罰或保安處分之裁判確定後，未執行或執行未完畢，而法律有變更，不處罰其行為或不施以保安處分者，免其刑或保安處分之執行。', False),
         ('第 3 條　本法於在中華民國領域內犯罪者，適用之。在中華民國領域外之中華民國船艦或航空器內犯罪者，以在中華民國領域內犯罪論。', False),
         ('第 4 條　犯罪之行為或結果，有一在中華民國領域內者，為在中華民國領域內犯罪。', False)]
LAW_R = [('第二章　刑事責任', True),
         ('第 12 條　行為非出於故意或過失者，不罰。過失行為之處罰，以有特別規定者，為限。', False),
         ('第 13 條　行為人對於構成犯罪之事實，明知並有意使其發生者，為故意。行為人對於構成犯罪之事實，預見其發生而其發生並不違背其本意者，以故意論。', False),
         ('第 14 條　行為人雖非故意，但按其情節應注意，並能注意，而不注意者，為過失。行為人對於構成犯罪之事實，雖預見其能發生而確信其不發生者，以過失論。', False)]


def paint_book_spread(P):
    img = P.sub('bk_spread'); W, H = img.size; mm = W / 304.0
    img.paste((247, 245, 238), (0, 0, W, H)); img = P.noise(img, 2.0, 2)
    dr = ImageDraw.Draw(img); fs = 2.9 * mm; lh = fs * 1.55
    hl = Image.new('RGBA', img.size, (0, 0, 0, 0)); hd = ImageDraw.Draw(hl)
    for page, items in ((0, LAW_L), (1, LAW_R)):
        x0 = page * W / 2 + (14 if page == 0 else 17) * mm; colw = (W / 2 - 31 * mm - 6 * mm) / 2
        P.printed(dr, x0, 6 * mm, '刑　法', int(2.6 * mm), (90, 90, 90)); P.printed(dr, x0 + (W / 2 - 40 * mm), 6 * mm, ('1-3' if page == 0 else '1-5'), int(2.6 * mm), (90, 90, 90))
        dr.line([(x0, 10 * mm), (x0 + W / 2 - 31 * mm, 10 * mm)], fill=(120, 120, 120), width=max(1, int(0.25 * mm)))
        col, y = 0, 14 * mm; per = max(6, int(colw / fs))
        k = 0
        while True:   # 兩欄；條文不夠就從頭再排一次（頁面要排滿）
            t, head = items[k % len(items)]; k += 1
            lines = [t[i:i + per] for i in range(0, len(t), per)] if not head else [t]
            for li, ln in enumerate(lines):
                if y > H - 12 * mm:
                    col += 1; y = 14 * mm
                if col > 1: break
                xx = x0 + col * (colw + 6 * mm)
                if head: P.printed(dr, xx + (colw - len(ln) * fs * 1.1) / 2, y, ln, int(fs * 1.1), (30, 30, 30), bold=True)
                else:
                    P.printed(dr, xx, y, ln, int(fs), (40, 40, 40))
                    if page == 0 and k == 5 and li < 3: hd.rectangle([xx - 0.5 * mm, y + 0.2 * mm, xx + len(ln) * fs + 0.5 * mm, y + fs * 1.1], fill=(250, 230, 60, 110))   # 第 2 條畫螢光筆
                y += lh
            if col > 1 or k > 60: break
            y += lh * 0.25
        P.printed(dr, page * W / 2 + W / 4 - 3 * mm, H - 8 * mm, str(5 + page), int(2.5 * mm), (110, 110, 110))
    img = Image.alpha_composite(img.convert('RGBA'), hl).convert('RGB')
    a = np.asarray(img, np.float32); xs = (np.arange(W) - W / 2) / mm
    a *= (1.0 - 0.45 * np.exp(-np.abs(xs) / 6.0) - 0.1 * np.exp(-np.abs(xs) / 25.0))[None, :, None]
    P.put('bk_spread', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def screen_frame(img, bezel, chin, cam=True):
    """img：整個螢幕面（含黑框）；回傳顯示區域的 (x0, y0, x1, y1)"""
    W, H = img.size; dr = ImageDraw.Draw(img); dr.rectangle([0, 0, W, H], fill=(14, 14, 16))
    box = (bezel, bezel, W - bezel, H - chin)
    if cam: dr.ellipse([W / 2 - bezel * 0.18, bezel * 0.35, W / 2 + bezel * 0.18, bezel * 0.71], fill=(40, 42, 48))
    return box


def paint_laptop_screen(P):
    img = P.sub('scr_laptop'); W, H = img.size; mm = W / 304.0
    x0, y0, x1, y1 = screen_frame(img, int(8 * mm), int(16 * mm))
    scr = Image.new('RGB', (x1 - x0, y1 - y0), (38, 40, 45)); w, h = scr.size; dr = ImageDraw.Draw(scr)
    dr.rectangle([0, 0, w, h * 0.06], fill=(28, 29, 33))
    for i, c in enumerate(((236, 95, 85), (240, 190, 70), (98, 196, 98))): dr.ellipse([h * 0.02 + i * h * 0.04, h * 0.017, h * 0.045 + i * h * 0.04, h * 0.043], fill=c)
    P.printed(dr, w * 0.4, h * 0.012, '刑法總則（三）.pdf', int(h * 0.035), (200, 200, 205))
    for i in range(5):   # 左邊的投影片縮圖
        ty = h * (0.1 + i * 0.17); dr.rectangle([w * 0.02, ty, w * 0.17, ty + h * 0.13], fill=(235, 235, 232) if i != 1 else (250, 250, 248), outline=(90, 140, 230) if i == 1 else None, width=3)
        dr.rectangle([w * 0.035, ty + h * 0.02, w * 0.12, ty + h * 0.035], fill=(60, 60, 64))
        for j in range(3): dr.rectangle([w * 0.035, ty + h * (0.055 + j * 0.022), w * 0.15, ty + h * (0.064 + j * 0.022)], fill=(150, 150, 150))
    sx0, sy0, sx1, sy1 = w * 0.21, h * 0.11, w * 0.97, h * 0.93
    dr.rectangle([sx0, sy0, sx1, sy1], fill=(252, 252, 250))
    sw_, sh_ = sx1 - sx0, sy1 - sy0
    P.printed(dr, sx0 + sw_ * 0.06, sy0 + sh_ * 0.07, '犯罪的三個階層', int(sh_ * 0.085), (25, 40, 80), bold=True)
    dr.rectangle([sx0 + sw_ * 0.06, sy0 + sh_ * 0.2, sx0 + sw_ * 0.4, sy0 + sh_ * 0.205], fill=(40, 90, 170))
    for j, t in enumerate(('・構成要件該當性：行為、結果、因果關係', '・違法性：有沒有阻卻違法事由', '・罪責：責任能力、不法意識')):
        P.printed(dr, sx0 + sw_ * 0.07, sy0 + sh_ * (0.28 + j * 0.11), t, int(sh_ * 0.05), (40, 40, 44))
    for j, t in enumerate(('構成要件', '違法性', '罪責')):   # 下面的圖：三個框
        bx = sx0 + sw_ * (0.08 + j * 0.3); by = sy0 + sh_ * 0.68
        dr.rounded_rectangle([bx, by, bx + sw_ * 0.22, by + sh_ * 0.16], radius=int(sh_ * 0.02), fill=(225, 235, 250), outline=(40, 90, 170), width=3)
        P.printed(dr, bx + sw_ * 0.035, by + sh_ * 0.045, t, int(sh_ * 0.055), (25, 40, 80))
        if j < 2: dr.polygon([(bx + sw_ * 0.235, by + sh_ * 0.05), (bx + sw_ * 0.275, by + sh_ * 0.08), (bx + sw_ * 0.235, by + sh_ * 0.11)], fill=(40, 90, 170))
    P.printed(dr, sx1 - sw_ * 0.12, sy1 - sh_ * 0.07, '12 / 40', int(sh_ * 0.035), (130, 130, 130))
    emit = Image.new('RGB', img.size, (0, 0, 0)); emit.paste(scr, (x0, y0))
    a = np.asarray(scr, np.float32) * 0.33 + 6; img.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0))   # 底色暗一點（亮度主要來自自發光）
    P.put('scr_laptop', img, emit)


def paint_deck(P):
    img = P.sub('deck'); W, H = img.size; mm = W / 304.0
    img.paste((198, 201, 206), (0, 0, W, H)); img = P.noise(img, 3.0, 3, scale=1)
    a = np.asarray(img, np.float32); a += np.random.default_rng(4).normal(0, 2.2, (1, W, 1)).astype(np.float32)   # 髮絲紋（左右方向）
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); dr = ImageDraw.Draw(img)
    dr.rectangle([0, 0, W, 5 * mm], fill=(150, 153, 158))   # 轉軸那一條（上緣＝離人遠的那一邊）
    kx0, kx1, ky0 = 18 * mm, W - 18 * mm, 12 * mm; rows = [(14, 0.55)] + [(14, 1.0)] * 5
    ky = ky0; pitch = (kx1 - kx0) / 14
    for ri, (n, hk) in enumerate(rows):
        kh = pitch * 0.92 * hk
        if ri == 5:   # 最下面一排：空白鍵
            xs = [0, 1, 2, 3, 8.2, 9.2, 10.2, 11.2, 14]
        else: xs = list(range(n + 1))
        for i in range(len(xs) - 1):
            a0 = kx0 + xs[i] * pitch + 0.08 * pitch; a1 = kx0 + xs[i + 1] * pitch - 0.08 * pitch
            dr.rounded_rectangle([a0, ky, a1, ky + kh - 0.08 * pitch], radius=int(0.08 * pitch), fill=(42, 43, 47))
            dr.line([(a0 + 0.1 * pitch, ky + kh * 0.75), (a0 + 0.3 * pitch, ky + kh * 0.75)], fill=(70, 72, 78), width=2)
        ky += kh
    tx0, tx1, ty0, ty1 = W / 2 - 55 * mm, W / 2 + 55 * mm, ky + 10 * mm, H - 9 * mm
    dr.rounded_rectangle([tx0, ty0, tx1, ty1], radius=int(3 * mm), fill=(186, 189, 194), outline=(160, 163, 168), width=3)
    P.put('deck', img)


def paint_phone(P):
    img = P.sub('scr_phone'); W, H = img.size; mm = W / 71.5
    dr = ImageDraw.Draw(img); dr.rectangle([0, 0, W, H], fill=(10, 10, 12))
    x0, y0, x1, y1 = int(2 * mm), int(2 * mm), W - int(2 * mm), H - int(2 * mm)
    scr = Image.new('RGB', (x1 - x0, y1 - y0), (250, 250, 250)); w, h = scr.size; d = ImageDraw.Draw(scr)
    d.rectangle([0, 0, w, h * 0.09], fill=(255, 255, 255)); P.printed(d, w * 0.06, h * 0.035, '動態', int(h * 0.03), (20, 20, 20), bold=True)
    d.rectangle([0, h * 0.09, w, h * 0.092], fill=(220, 220, 220))
    def photo(y, hh, c0, c1, palms):
        g = np.linspace(0, 1, int(hh))[:, None, None]; arr = (np.array(c0)[None, None] * (1 - g) + np.array(c1)[None, None] * g) * np.ones((1, w, 1))
        ph = Image.fromarray(arr.astype(np.uint8)); pd = ImageDraw.Draw(ph)
        if palms:   # 夕陽下的椰子樹剪影
            for px in (0.2, 0.55, 0.85):
                cx = w * px; pd.line([(cx, hh), (cx + w * 0.02, hh * 0.35)], fill=(40, 30, 40), width=max(2, int(w * 0.02)))
                for ang in range(0, 360, 45):
                    r_ = w * 0.11; pd.line([(cx + w * 0.02, hh * 0.35), (cx + w * 0.02 + r_ * math.cos(math.radians(ang)), hh * 0.35 + r_ * 0.5 * math.sin(math.radians(ang)) + r_ * 0.25)], fill=(40, 30, 40), width=max(2, int(w * 0.025)))
            pd.rectangle([0, hh * 0.9, w, hh], fill=(40, 30, 40))
        scr.paste(ph, (0, int(y)))
    d.ellipse([w * 0.05, h * 0.11, w * 0.15, h * 0.16], fill=(200, 170, 140)); d.rectangle([w * 0.2, h * 0.125, w * 0.55, h * 0.14], fill=(60, 60, 60))
    photo(h * 0.18, h * 0.36, (250, 170, 90), (120, 70, 140), True)
    for j in range(3): d.rectangle([w * 0.05, h * (0.57 + j * 0.035), w * (0.9 if j < 2 else 0.6), h * (0.585 + j * 0.035)], fill=(110, 110, 110))
    d.ellipse([w * 0.05, h * 0.7, w * 0.15, h * 0.75], fill=(140, 180, 150)); d.rectangle([w * 0.2, h * 0.715, w * 0.5, h * 0.73], fill=(60, 60, 60))
    photo(h * 0.77, h * 0.23, (150, 200, 120), (60, 120, 80), False)
    d.rectangle([0, h * 0.95, w, h], fill=(255, 255, 255))
    emit = Image.new('RGB', img.size, (0, 0, 0)); emit.paste(scr, (x0, y0))
    a = np.asarray(scr, np.float32) * 0.33 + 6; img.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0))
    P.put('scr_phone', img, emit)
    off = P.sub('scr_off'); W2, H2 = off.size
    g = np.linspace(0, 1, W2)[None, :, None] * 0.6 + np.linspace(0, 1, H2)[:, None, None] * 0.4
    a = 10 + 16 * np.exp(-((g - 0.55) / 0.12) ** 2); P.put('scr_off', Image.fromarray(np.clip(a * np.ones((1, 1, 3)), 0, 255).astype(np.uint8)))
    bk = P.sub('ph_back'); W3, H3 = bk.size; bk.paste((58, 62, 72), (0, 0, W3, H3)); bd = ImageDraw.Draw(bk)
    bd.rounded_rectangle([W3 * 0.08, H3 * 0.04, W3 * 0.45, H3 * 0.22], radius=int(W3 * 0.06), fill=(44, 47, 55))
    for (cx, cy) in ((0.18, 0.09), (0.35, 0.09), (0.18, 0.17)): bd.ellipse([W3 * (cx - 0.06), H3 * (cy - 0.03), W3 * (cx + 0.06), H3 * (cy + 0.03)], fill=(20, 20, 24))
    P.put('ph_back', bk)


def paint_strips(P):
    # 原子筆：筆尖（左）→ 握位（深灰）→ 白色筆身（藍色字）→ 藍色尾端
    s = P.sub('pen_strip'); W, H = s.size; d = ImageDraw.Draw(s)
    d.rectangle([0, 0, W, H], fill=(240, 240, 236)); d.rectangle([0, 0, W * 0.22, H], fill=(64, 68, 76)); d.rectangle([W * 0.9, 0, W, H], fill=(40, 72, 162))
    d.rectangle([W * 0.5, H * 0.4, W * 0.7, H * 0.6], fill=(40, 72, 162)); P.put('pen_strip', s)
    for name, body, cap in (('hl_strip', (246, 226, 46), (226, 196, 20)), ('hl_strip2', (238, 112, 160), (214, 80, 130))):
        s = P.sub(name); W, H = s.size; d = ImageDraw.Draw(s)
        d.rectangle([0, 0, W, H], fill=body); d.rectangle([0, 0, W * 0.33, H], fill=cap); d.rectangle([W * 0.45, H * 0.3, W * 0.8, H * 0.7], fill=(250, 250, 245))
        P.put(name, s)


def paint_covers(P):
    for name, col, title, seed in (('nb_cov_a', (92, 122, 160), '刑法總則', 21), ('nb_cov_b', (138, 182, 160), '民法總則', 22)):
        img = P.sub(name); W, H = img.size; mm = W / 182.0
        img.paste(col, (0, 0, W, H)); img = P.noise(img, 3.0, seed); d = ImageDraw.Draw(img)
        dark = tuple(int(c * 0.7) for c in col)
        d.rectangle([0, 0, 9 * mm, H], fill=dark)   # 裝訂的布膠帶（左邊）
        d.rectangle([30 * mm, 26 * mm, W - 20 * mm, 92 * mm], fill=(246, 244, 238))
        P.printed(d, 35 * mm, 30 * mm, 'NOTEBOOK', int(7 * mm), (60, 60, 64), bold=True); P.printed(d, 35 * mm, 41 * mm, 'B5 · 7mm · 30 sheets', int(3.6 * mm), (110, 110, 110))
        for k in range(3): d.line([(35 * mm, (58 + k * 11) * mm), (W - 26 * mm, (58 + k * 11) * mm)], fill=(170, 170, 170), width=max(1, int(0.4 * mm)))
        P.hand(img, 40 * mm, 67 * mm, title, 8.5 * mm, (24, 24, 28), seed=seed, slant=0.1)
        P.put(name, img)
    # 六法
    img = P.sub('code_cov'); W, H = img.size; mm = W / 155.0
    img.paste((30, 44, 84), (0, 0, W, H)); img = P.noise(img, 2.0, 31); d = ImageDraw.Draw(img); gold = (206, 172, 92)
    d.rectangle([8 * mm, 8 * mm, W - 8 * mm, H - 8 * mm], outline=gold, width=max(2, int(0.6 * mm)))
    P.printed(d, 26 * mm, 40 * mm, '六法全書', int(25 * mm), gold, bold=True)
    P.printed(d, 52 * mm, 72 * mm, '2026 年版', int(7 * mm), gold)
    d.rectangle([8 * mm, H - 58 * mm, W - 8 * mm, H - 52 * mm], fill=gold)
    P.printed(d, 30 * mm, H - 44 * mm, '憲法・民法・刑法・訴訟法', int(6 * mm), (210, 214, 228))
    P.put('code_cov', img)
    sp = P.sub('code_spine'); W2, H2 = sp.size; sp.paste((26, 38, 74), (0, 0, W2, H2)); sp = P.noise(sp, 2.0, 32)
    t = Image.new('RGB', (H2, W2), (26, 38, 74)); td = ImageDraw.Draw(t)   # 書背的字：先橫著畫再轉 90°
    P.printed(td, H2 * 0.07, W2 * 0.27, '六法全書　2026', int(W2 * 0.4), gold, bold=True)
    sp = t.rotate(-90, expand=True); P.put('code_spine', sp.resize((W2, H2)))
    # 教科書
    img = P.sub('text_cov'); W, H = img.size; mm = W / 170.0
    img.paste((238, 236, 229), (0, 0, W, H)); img = P.noise(img, 2.0, 41); d = ImageDraw.Draw(img); teal = (36, 112, 122)
    d.rectangle([0, H * 0.58, W, H * 0.74], fill=teal); d.rectangle([0, H * 0.75, W, H * 0.76], fill=teal)
    P.printed(d, 16 * mm, 40 * mm, '刑法總則', int(24 * mm), (30, 50, 60), bold=True); P.printed(d, 18 * mm, 72 * mm, '講　義', int(10 * mm), (60, 80, 90))
    P.printed(d, 18 * mm, H * 0.62, '第二版', int(8 * mm), (236, 240, 240))
    P.put('text_cov', img)
    sp = P.sub('text_spine'); W2, H2 = sp.size; sp.paste(teal, (0, 0, W2, H2)); P.put('text_spine', sp)


def paint_misc(P):
    img = P.sub('page_edge'); W, H = img.size; img.paste((232, 229, 218), (0, 0, W, H))
    a = np.asarray(img, np.float32); r = np.random.default_rng(51)
    rows = r.uniform(0.82, 1.0, (H, 1, 1)).astype(np.float32); a *= rows; P.put('page_edge', Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    img = P.sub('sleeve'); W, H = img.size; img.paste((172, 132, 92), (0, 0, W, H)); img = P.noise(img, 5.0, 52, scale=2); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H * 0.06], fill=(140, 104, 70)); d.rectangle([0, H * 0.94, W, H], fill=(140, 104, 70))
    for cx in (W * 0.25, W * 0.75):   # 印的咖啡杯圖示（前後各一個）
        r_ = H * 0.28; d.ellipse([cx - r_, H / 2 - r_, cx + r_, H / 2 + r_], outline=(84, 56, 36), width=max(2, int(H * 0.04)))
        d.rectangle([cx - r_ * 0.45, H / 2 - r_ * 0.25, cx + r_ * 0.35, H / 2 + r_ * 0.45], fill=(84, 56, 36))
        d.arc([cx + r_ * 0.2, H / 2 - r_ * 0.15, cx + r_ * 0.6, H / 2 + r_ * 0.25], -90, 90, fill=(84, 56, 36), width=max(2, int(H * 0.03)))
    P.put('sleeve', img)
    img = P.sub('pcase'); W, H = img.size; img.paste((42, 54, 82), (0, 0, W, H))
    a = np.asarray(img, np.float32); yy, xx = np.mgrid[0:H, 0:W]; a += (np.sin(xx * 1.3) * np.sin(yy * 1.3) * 5)[..., None]; img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    img = P.noise(img, 3.0, 53); d = ImageDraw.Draw(img)
    zy = H * 0.5; d.rectangle([W * 0.04, zy - H * 0.05, W * 0.96, zy + H * 0.05], fill=(24, 24, 28))
    for x in range(int(W * 0.04), int(W * 0.96), 6): d.rectangle([x, zy - H * 0.03, x + 2, zy + H * 0.03], fill=(60, 60, 66))
    d.rounded_rectangle([W * 0.84, zy - H * 0.06, W * 0.92, zy + H * 0.06], radius=4, fill=(190, 192, 196))
    P.put('pcase', img)
    for k, (c, _, _) in SW.items():
        x0, y0, x1, y1 = P.box('sw_' + k); P.d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=c)


def make_textures():
    P = Painter()
    paint_notebook_spread(P); paint_book_spread(P); paint_laptop_screen(P); paint_deck(P); paint_phone(P); paint_strips(P); paint_covers(P); paint_misc(P)
    os.makedirs(GEN, exist_ok=True)
    P.im.resize((N, N), Image.LANCZOS).save(ATLAS)
    P.em.resize((EMIT_N, EMIT_N), Image.LANCZOS).save(ATLAS_EMIT)
    orm = np.zeros((ORM_N, ORM_N, 3), np.uint8); orm[..., 0] = 255; orm[..., 1] = int(0.6 * 255)
    f = ORM_N / N
    for name, (x0, y0, x1, y1) in REG.items():
        if name.startswith('sw_'): rough, metal = SW[name[3:]][1:]
        else: rough, metal = ORM_REG[name]
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 1] = int(rough * 255)
        orm[int(y0 * f):int(math.ceil(y1 * f)), int(x0 * f):int(math.ceil(x1 * f)), 2] = int(metal * 255)
    Image.fromarray(orm).save(ATLAS_ORM)


# ================= 網格 =================
def ruv(name, s, t, inset=0.7):
    """區域裡的 (s, t)（0..1；t=1 是圖的上緣）→ UV（Blender：v 往上）"""
    x0, y0, x1, y1 = REG[name]
    if name.startswith('sw_'): inset = SW_CELL * 0.33
    px = x0 + inset + min(1, max(0, s)) * (x1 - x0 - 2 * inset); py = y0 + inset + (1 - min(1, max(0, t))) * (y1 - y0 - 2 * inset)
    return (px / N, 1 - py / N)


def newell(ps):
    n = np.zeros(3)
    for i in range(len(ps)):
        a, b = ps[i], ps[(i + 1) % len(ps)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    return n


class PM:
    """遊戲座標的網格：頂點、面（頂點編號）、每個面每個角的 UV。同一個平滑群組的面共用頂點（Blender 平滑著色時法線平均）；不同群組不共用（邊是硬的）"""
    def __init__(self): self.v = []; self.f = []; self.uv = []

    def vid(self, p): self.v.append(np.array(p, float)); return len(self.v) - 1

    def face(self, ids, uvs, want=None):
        ids, uvs = list(ids), list(uvs)
        if want is not None and np.dot(newell([self.v[i] for i in ids]), want) < 0: ids.reverse(); uvs.reverse()
        self.f.append(ids); self.uv.append(uvs)

    def poly(self, pts, uvfn, want):
        """獨立的一個面（不和別的面共用頂點）"""
        self.face([self.vid(p) for p in pts], [uvfn(p) for p in pts], want)

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


def frame(origin, ydir, zhint):
    """局部 y → ydir、局部 z → zhint（和 y 正交化）、局部 x＝y×z"""
    y = np.array(ydir, float); y /= np.linalg.norm(y); z = np.array(zhint, float); z -= y * np.dot(z, y); z /= np.linalg.norm(z); x = np.cross(y, z)
    M = np.eye(4); M[:3, 0], M[:3, 1], M[:3, 2], M[:3, 3] = x, y, z, origin; return M


def rr_outline(w, d, r, n):
    pts = []
    for (sx, sz, a0) in ((1, 1, 0.0), (-1, 1, 90.0), (-1, -1, 180.0), (1, -1, 270.0)):
        ccx, ccz = sx * (w / 2 - r), sz * (d / 2 - r)
        for k in range(n + 1):
            a = math.radians(a0 + 90.0 * k / n); pts.append((ccx + r * math.cos(a), ccz + r * math.sin(a)))
    return pts


def prism(pm, w, d, r, n, y0, y1, top, side, bottom, cht=0.0, chb=0.0, ch_side=None, closed_bottom=True):
    """圓角長方形的板：top/bottom＝(x, z) → UV 的函式；side＝(周長的比例, 高度比例) → UV；cht／chb＝上／下緣的倒角"""
    outer = rr_outline(w, d, r, n)
    def ring(pts, y): return [pm.vid((x, y, z)) for x, z in pts + [pts[0]]]
    per = [0.0]
    for i in range(1, len(outer) + 1):
        a, b = outer[i - 1], outer[i % len(outer)]; per.append(per[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    per = [p / per[-1] for p in per]
    ya, yb = y0 + chb, y1 - cht
    lo, hi = ring(outer, ya), ring(outer, yb)
    for i in range(len(outer)):
        q = [lo[i], lo[i + 1], hi[i + 1], hi[i]]; m = (pm.v[lo[i]] + pm.v[lo[i + 1]]) / 2
        pm.face(q, [side(per[i], 0), side(per[i + 1], 0), side(per[i + 1], 1), side(per[i], 1)], (m[0], 0, m[2]))
    cs = ch_side or side
    def chamfer(y_out, y_in, inner, up):
        a, b = ring(outer, y_out), ring(inner, y_in)
        for i in range(len(outer)):
            m = (pm.v[a[i]] + pm.v[a[i + 1]]) / 2
            pm.face([a[i], a[i + 1], b[i + 1], b[i]], [cs(per[i], 1 if up else 0), cs(per[i + 1], 1 if up else 0), cs(per[i + 1], 1 if up else 0), cs(per[i], 1 if up else 0)], (m[0], 1 if up else -1, m[2]))
    if cht > 0:
        inner = rr_outline(w - 2 * cht, d - 2 * cht, max(0.0005, r - cht), n); chamfer(yb, y1, inner, True); tp = inner
    else: tp = outer
    pm.poly([(x, y1, z) for x, z in tp], lambda p: top(p[0], p[2]), (0, 1, 0))
    if closed_bottom:
        if chb > 0:
            inner = rr_outline(w - 2 * chb, d - 2 * chb, max(0.0005, r - chb), n); chamfer(ya, y0, inner, False); bp = inner
        else: bp = outer
        pm.poly([(x, y0, z) for x, z in bp], lambda p: bottom(p[0], p[2]), (0, -1, 0))
    return pm


def box(pm, x0, x1, y0, y1, z0, z1, uv, faces='tbfkrl'):
    """直角的盒子；uv：{面: (x, y, z) → UV}，面＝t 上 b 下 f 前（−z）k 後（+z）r 右（−x）l 左（+x）"""
    P = {'t': ([(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)], (0, 1, 0)), 'b': ([(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)], (0, -1, 0)),
         'f': ([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)], (0, 0, -1)), 'k': ([(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], (0, 0, 1)),
         'r': ([(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)], (-1, 0, 0)), 'l': ([(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)], (1, 0, 0))}
    for k in faces:
        pts, want = P[k]; fn = uv.get(k) or uv.get('*')
        pm.poly(pts, fn, want)
    return pm


def lathe(pm, bands, n, caps=(), M=None):
    """繞 y 軸：bands＝[(r0, y0, r1, y1, uvfn(角度比例, 沿著比例), want)]，want＝'out'／'up'／'down'；caps＝[(r, y, uvfn(x, z), 'up'/'down')]"""
    sub = PM()
    for (r0, y0, r1, y1, fn, want) in bands:
        a = [sub.vid((r0 * math.cos(2 * math.pi * k / n), y0, r0 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        b = [sub.vid((r1 * math.cos(2 * math.pi * k / n), y1, r1 * math.sin(2 * math.pi * k / n))) for k in range(n + 1)]
        for k in range(n):
            ang = 2 * math.pi * (k + 0.5) / n
            w = (math.cos(ang), 0, math.sin(ang)) if want == 'out' else ((0, 1, 0) if want == 'up' else (0, -1, 0))
            sub.face([a[k], a[k + 1], b[k + 1], b[k]], [fn(k / n, 0), fn((k + 1) / n, 0), fn((k + 1) / n, 1), fn(k / n, 1)], w)
    for (r, y, fn, want) in caps:
        sub.poly([(r * math.cos(2 * math.pi * k / n), y, r * math.sin(2 * math.pi * k / n)) for k in range(n)], lambda p, fn=fn: fn(p[0], p[2]), (0, 1, 0) if want == 'up' else (0, -1, 0))
    return pm.add(sub, M)


def swq(name):
    """純色：讓 UV 在小格中間有一點範圍（不是同一點）"""
    def f(*a):
        if len(a) == 1: a = (a[0][0], a[0][2])   # box() 給的是一個點
        return ruv('sw_' + name, (a[0] * 37.0) % 1.0, (a[-1] * 53.0) % 1.0)
    return f


# ---------------- 單件 ----------------
NB_W, NB_D = 0.182, 0.257
COV, NB_TH = 0.0012, 0.0026


def nb_top_y(u): return COV + 0.0003 + NB_TH * (1 - math.exp(-u / 0.010))


def item_notebook_open(cov='tape_blue', lod=0):
    pm = PM(); W, D, ov = NB_W, NB_D, 0.002
    sp = lambda p: ruv('nb_spread', (W - p[0]) / (2 * W), (p[2] + D / 2) / D)
    if lod:
        pm.poly([(-W, 0.004, -D / 2), (W, 0.004, -D / 2), (W, 0.004, D / 2), (-W, 0.004, D / 2)], sp, (0, 1, 0)); return pm
    box(pm, -(W + ov), W + ov, 0, COV, -(D / 2 + ov), D / 2 + ov, {'t': swq('gutter'), '*': swq(cov)})
    xs = [0.0015, 0.005, 0.011, 0.022, 0.05, 0.11, W]
    for sg in (1, -1):
        X = [sg * u for u in xs]; Y = [nb_top_y(u) for u in xs]
        fr = [pm.vid((x, y, -D / 2)) for x, y in zip(X, Y)]; bk = [pm.vid((x, y, D / 2)) for x, y in zip(X, Y)]
        for i in range(len(xs) - 1):
            q = [fr[i], fr[i + 1], bk[i + 1], bk[i]]; pm.face(q, [sp(pm.v[j]) for j in q], (0, 1, 0))
        for zz, wz in ((-D / 2, -1), (D / 2, 1)):
            for i in range(len(xs) - 1):
                pts = [(X[i], COV, zz), (X[i + 1], COV, zz), (X[i + 1], Y[i + 1], zz), (X[i], Y[i], zz)]
                pm.poly(pts, lambda p: ruv('page_edge', abs(p[0]) / W, (p[1] - COV) / NB_TH), (0, 0, wz))
        pm.poly([(X[-1], COV, -D / 2), (X[-1], COV, D / 2), (X[-1], Y[-1], D / 2), (X[-1], Y[-1], -D / 2)], lambda p: ruv('page_edge', (p[2] + D / 2) / D, (p[1] - COV) / NB_TH), (sg, 0, 0))
    return pm


def item_notebook_closed(cov='nb_cov_a', edge='tape_blue', lod=0):
    pm = PM(); W, D, th = NB_W, NB_D, 0.0055
    top = lambda x, z: ruv(cov, (W / 2 - x) / W, (z + D / 2) / D)
    if lod:
        pm.poly([(-W / 2, th, -D / 2), (W / 2, th, -D / 2), (W / 2, th, D / 2), (-W / 2, th, D / 2)], lambda p: top(p[0], p[2]), (0, 1, 0))
        pm.poly([(-W / 2, 0, -D / 2), (W / 2, 0, -D / 2), (W / 2, th, -D / 2), (-W / 2, th, -D / 2)], lambda p: ruv('page_edge', 0.5 + p[0], p[1] / th), (0, 0, -1)); return pm
    return prism(pm, W, D, 0.003, 2, 0, th, top, lambda s, t: ruv('page_edge', s, 0.15 + 0.7 * t), swq(edge))


def item_book_closed(w, d, th, cov, spine, board, lod=0):
    """書：封面、封底（各 2.5 mm，比書頁大 3 mm）、書背在左邊（+x：坐的人的左手邊）、書頁三面"""
    pm = PM(); bt, ins = 0.0025, 0.003
    cv = lambda p: ruv(cov, (w / 2 - p[0]) / w, (p[2] + d / 2) / d)
    spv = lambda p: ruv(spine, p[1] / th, (p[2] + d / 2) / d)
    pe = lambda p: ruv('page_edge', (p[0] + p[2]) / max(w, d) + 0.5, (p[1] - bt) / (th - 2 * bt))
    if lod:
        box(pm, -w / 2, w / 2, 0, th, -d / 2, d / 2, {'t': cv, 'l': spv, '*': pe}, faces='tfkrl'); return pm
    box(pm, -w / 2, w / 2, th - bt, th, -d / 2, d / 2, {'t': cv, '*': swq(board)}, faces='tfkr')
    box(pm, -w / 2, w / 2, 0, bt, -d / 2, d / 2, {'*': swq(board)}, faces='bfkr')
    box(pm, -w / 2 + ins, w / 2 - 0.004, bt, th - bt, -d / 2 + ins, d / 2 - ins, {'*': pe}, faces='fkr')
    box(pm, w / 2 - 0.004, w / 2, 0, th, -d / 2, d / 2, {'l': spv, '*': swq(board)}, faces='lfk')
    return pm


CODE = dict(w=0.155, d=0.215, th=0.055, cov='code_cov', spine='code_spine', board='code_navy')
TEXT = dict(w=0.170, d=0.240, th=0.028, cov='text_cov', spine='text_spine', board='text_white')


def item_book_open(lod=0):
    """攤開的六法（從中間翻開：左右各 2 cm 厚的書頁，靠中間的地方往下彎）"""
    pm = PM(); Wp, D, th, bt, ov = 0.152, 0.215, 0.020, 0.0025, 0.003
    sp = lambda p: ruv('bk_spread', (Wp - p[0]) / (2 * Wp), (p[2] + D / 2) / D)
    yf = lambda u: bt + th * (1 - math.exp(-u / 0.014)) + 0.003 * math.sin(math.pi * min(1.0, u / Wp))
    if lod:
        for sg in (1, -1):
            pts = [(0, yf(0.01), -D / 2), (sg * Wp, yf(Wp), -D / 2), (sg * Wp, yf(Wp), D / 2), (0, yf(0.01), D / 2)]
            pm.poly(pts, sp, (0, 1, 0))
            pm.poly([(0, bt, -D / 2), (sg * Wp, bt, -D / 2), (sg * Wp, yf(Wp), -D / 2), (0, yf(0.01), -D / 2)], lambda p: ruv('page_edge', abs(p[0]) / Wp, p[1] / (th + bt)), (0, 0, -1))
        return pm
    box(pm, -(Wp + ov), Wp + ov, 0, bt, -(D / 2 + ov), D / 2 + ov, {'t': swq('gutter'), '*': swq('code_navy')})
    xs = [0.002, 0.006, 0.012, 0.022, 0.04, 0.07, 0.11, Wp]
    for sg in (1, -1):
        X = [sg * u for u in xs]; Y = [yf(u) for u in xs]
        fr = [pm.vid((x, y, -D / 2)) for x, y in zip(X, Y)]; bk = [pm.vid((x, y, D / 2)) for x, y in zip(X, Y)]
        for i in range(len(xs) - 1):
            q = [fr[i], fr[i + 1], bk[i + 1], bk[i]]; pm.face(q, [sp(pm.v[j]) for j in q], (0, 1, 0))
        for zz, wz in ((-D / 2, -1), (D / 2, 1)):
            for i in range(len(xs) - 1):
                pm.poly([(X[i], bt, zz), (X[i + 1], bt, zz), (X[i + 1], Y[i + 1], zz), (X[i], Y[i], zz)], lambda p: ruv('page_edge', abs(p[0]) / Wp, (p[1] - bt) / (th + 0.003)), (0, 0, wz))
        pm.poly([(X[-1], bt, -D / 2), (X[-1], bt, D / 2), (X[-1], Y[-1], D / 2), (X[-1], Y[-1], -D / 2)], lambda p: ruv('page_edge', (p[2] + D / 2) / D, (p[1] - bt) / th), (sg, 0, 0))
    return pm


LT_W, LT_D, LT_BH, LT_LD, LT_LH = 0.304, 0.212, 0.0145, 0.206, 0.0055


def item_laptop(open_deg=110.0, lod=0):
    """筆電：底座（鍵盤面）＋螢幕（轉軸在底座後緣）；open_deg＝0 是闔起來"""
    pm = PM(); W, D, bh = LT_W, LT_D, LT_BH
    deck = lambda x, z: ruv('deck', (W / 2 - x) / W, (z + D / 2) / D)
    a = math.radians(open_deg)
    hinge = np.array([0.0, bh, D / 2])
    lid = PM()   # 局部：闔起來的樣子（螢幕朝下 y=0、外殼 y=LT_LH；z 從 0＝轉軸往 −z 到 −LT_LD）
    scr = lambda x, z: ruv('scr_laptop', (W / 2 - x) / W, (-z) / LT_LD)
    if lod:
        pm.poly([(-W / 2, bh, -D / 2), (W / 2, bh, -D / 2), (W / 2, bh, D / 2), (-W / 2, bh, D / 2)], lambda p: deck(p[0], p[2]), (0, 1, 0))
        pm.poly([(-W / 2, 0, -D / 2), (W / 2, 0, -D / 2), (W / 2, bh, -D / 2), (-W / 2, bh, -D / 2)], swq('alu'), (0, 0, -1))
        lid.poly([(-W / 2, 0, 0), (W / 2, 0, 0), (W / 2, 0, -LT_LD), (-W / 2, 0, -LT_LD)], lambda p: scr(p[0], p[2]), (0, -1, 0))
        lid.poly([(-W / 2, LT_LH, 0), (W / 2, LT_LH, 0), (W / 2, LT_LH, -LT_LD), (-W / 2, LT_LH, -LT_LD)], swq('alu'), (0, 1, 0))
    else:
        prism(pm, W, D, 0.008, 3, 0, bh, deck, lambda s, t: ruv('sw_alu', s, t), swq('graphite'), cht=0.0015, ch_side=lambda s, t: ruv('sw_alu_dark', s, t))
        sub = PM(); prism(sub, W, LT_LD, 0.008, 3, 0, LT_LH, swq('alu'), lambda s, t: ruv('sw_alu_dark', s, t), lambda x, z: scr(x, z - LT_LD / 2))
        lid.add(sub, T(0, 0, -LT_LD / 2))
        lathe(pm, [(0.0042, -W * 0.36, 0.0042, W * 0.36, lambda s, t: ruv('sw_graphite', s, t), 'out')], 6, M=T(0, bh - 0.001, D / 2 - 0.004) @ Rx(0) @ np.array([[0, 1, 0, 0], [-1, 0, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], float))
    # 打開：繞轉軸（x 方向）把螢幕的前緣往上、往後轉 a
    M = T(*hinge) @ Rx(a) @ T(0, 0, 0)
    pm.add(lid, M)
    return pm


PH_W, PH_D, PH_H = 0.0715, 0.1465, 0.0078


def item_phone(on=True, lod=0, two_sided=False):
    pm = PM(); W, D, h = PH_W, PH_D, PH_H
    reg = 'scr_phone' if on else 'scr_off'
    top = lambda x, z: ruv(reg, (W / 2 - x) / W, (z + D / 2) / D)
    back = lambda x, z: ruv('ph_back', (x + W / 2) / W, (z + D / 2) / D)
    if lod:
        pm.poly([(-W / 2, h, -D / 2), (W / 2, h, -D / 2), (W / 2, h, D / 2), (-W / 2, h, D / 2)], lambda p: top(p[0], p[2]), (0, 1, 0))
        if two_sided: pm.poly([(-W / 2, 0, -D / 2), (W / 2, 0, -D / 2), (W / 2, 0, D / 2), (-W / 2, 0, D / 2)], lambda p: back(p[0], p[2]), (0, -1, 0))
        return pm
    return prism(pm, W, D, 0.009, 2, 0, h, top, lambda s, t: ruv('sw_graphite', s, t), back, cht=0.0012, chb=0.0012)


def item_pen(lod=0):
    """原子筆：沿著 +y（筆尖 y=0、尾端 y=0.142），半徑 5 mm；筆夾在 +z 那一側"""
    pm = PM(); L_, r = 0.142, 0.0052
    st = lambda s, t, a, b: ruv('pen_strip', a + (b - a) * t, 0.3 + 0.4 * s)
    lathe(pm, [(0.0004, 0.0, 0.0042, 0.014, lambda s, t: ruv('sw_steel', s, t), 'out'),
               (0.0042, 0.014, r, 0.014, lambda s, t: ruv('sw_pen_white', s, t), 'down'),
               (r, 0.014, r, L_ - 0.004, lambda s, t: st(s, t, 0.06, 0.97), 'out'),
               (r, L_ - 0.004, 0.0035, L_, lambda s, t: ruv('sw_pen_blue', s, t), 'out')], 6, caps=[(0.0035, L_, lambda x, z: ruv('sw_pen_blue', 0.5, 0.5), 'up')])
    box(pm, -0.0012, 0.0012, L_ - 0.05, L_ - 0.008, r, r + 0.0022, {'*': swq('pen_blue')}, faces='tbkrl')
    return pm


def item_highlighter(pink=False, lod=0):
    """螢光筆：扁圓筆身沿著 +y（筆蓋那一端 y=0）"""
    pm = PM(); L_ = 0.122; reg = 'hl_strip2' if pink else 'hl_strip'
    lathe(pm, [(0.0085, 0.0, 0.0085, L_, lambda s, t: ruv(reg, t, 0.3 + 0.4 * s), 'out')], 8,
          caps=[(0.0085, 0.0, lambda x, z: ruv(reg, 0.05, 0.5), 'down'), (0.0085, L_, lambda x, z: ruv(reg, 0.95, 0.5), 'up')])
    for i in range(len(pm.v)): pm.v[i] = pm.v[i] * np.array([1.0, 1.0, 0.72])   # 扁一點（z 方向）
    return pm


def item_pencil_case(lod=0):
    """布筆袋：沿著 x（長 0.20），底部壓扁，兩端收小；拉鍊在上面"""
    pm = PM(); n = 10; L2 = 0.10
    if lod:
        box(pm, -L2, L2, 0, 0.05, -0.03, 0.03, {'t': lambda p: ruv('pcase', (p[0] + L2) / (2 * L2), 0.5), '*': swq('case_navy')}, faces='tfkrl'); return pm
    sec = [(0.022, -L2), (0.032, -L2 + 0.012), (0.032, L2 - 0.012), (0.022, L2)]
    sub = PM()
    rings = []
    for (r, x) in sec:
        ring = []
        for k in range(n + 1):
            a = 2 * math.pi * k / n - math.pi / 2   # k=0 在底部
            y, z = r * math.sin(a), r * math.cos(a)
            if y < 0: y *= 0.55   # 底部壓扁（放在桌上）
            ring.append(sub.vid((x, y, z)))
        rings.append(ring)
    for j in range(3):
        for k in range(n):
            q = [rings[j][k], rings[j][k + 1], rings[j + 1][k + 1], rings[j + 1][k]]
            mid = sum(sub.v[i] for i in q) / 4
            sub.face(q, [ruv('pcase', (sub.v[i][0] + L2) / (2 * L2), 1 - ((kk / n + 0.0) % 1.0)) for i, kk in zip(q, (k, k + 1, k + 1, k))], (0, mid[1], mid[2]))
    for j, sg in ((0, -1), (3, 1)):
        pts = [sub.v[i] for i in rings[j][:n]]
        sub.poly(pts, lambda p: ruv('sw_case_navy', 0.5, 0.5), (sg, 0, 0))
    ymin = min(p[1] for p in sub.v)
    return pm.add(sub, T(0, -ymin, 0))


def item_cup(lod=0):
    """外帶紙杯（12 oz）＋紙套＋杯蓋"""
    pm = PM(); n = 6 if lod else 10
    wt = lambda s, t: ruv('sw_cup_white', s, t); lw = lambda s, t: ruv('sw_lid_white', s, t)
    if lod:
        return lathe(pm, [(0.030, 0.0, 0.0465, 0.118, lambda s, t: ruv('sleeve', s, 0.2 + 0.6 * t), 'out')], n, caps=[(0.0465, 0.118, lambda x, z: lw(0.5, 0.5), 'up')])
    rs = lambda y: 0.030 + (0.0448 - 0.030) * y / 0.108
    return lathe(pm, [(0.0295, 0.0, rs(0.03), 0.03, wt, 'out'),
                      (rs(0.03), 0.03, rs(0.03) + 0.0012, 0.03, wt, 'down'),
                      (rs(0.03) + 0.0012, 0.03, rs(0.085) + 0.0012, 0.085, lambda s, t: ruv('sleeve', s, t), 'out'),
                      (rs(0.085) + 0.0012, 0.085, rs(0.085), 0.085, wt, 'up'),
                      (rs(0.085), 0.085, rs(0.106), 0.106, wt, 'out'),
                      (rs(0.106), 0.105, 0.0468, 0.105, lw, 'down'),
                      (0.0468, 0.105, 0.0468, 0.115, lw, 'out'),
                      (0.0468, 0.115, 0.041, 0.118, lw, 'up'),
                      (0.041, 0.118, 0.036, 0.123, lw, 'up')], n,
                 caps=[(0.0295, 0.0, lambda x, z: wt(0.5, 0.5), 'down'), (0.036, 0.123, lambda x, z: lw(0.5, 0.5), 'up')])


def item_thermos(col='th_sage', lod=0):
    pm = PM(); n = 6 if lod else 12
    c = lambda s, t: ruv('sw_' + col, s, t); stl = lambda s, t: ruv('sw_steel', s, t)
    if lod:
        return lathe(pm, [(0.034, 0.0, 0.034, 0.232, c, 'out')], n, caps=[(0.034, 0.232, lambda x, z: stl(0.5, 0.5), 'up')])
    return lathe(pm, [(0.031, 0.0, 0.034, 0.004, c, 'out'), (0.034, 0.004, 0.034, 0.186, c, 'out'), (0.034, 0.186, 0.0305, 0.195, stl, 'out'), (0.0305, 0.195, 0.0315, 0.195, stl, 'down'),
                      (0.0315, 0.195, 0.0315, 0.226, stl, 'out'), (0.0315, 0.226, 0.028, 0.232, stl, 'up')], n,
                 caps=[(0.031, 0.0, lambda x, z: c(0.5, 0.5), 'down'), (0.028, 0.232, lambda x, z: stl(0.5, 0.5), 'up')])


# ---------------- 擺放 ----------------
def lay(x, y, z, yaw=0.0): return T(x, y, z) @ Ry(yaw)


def lay_pen(x, y, z, yaw, r=0.0052):
    """筆平放：(x, z) 是筆的中心；yaw＝0 時筆尖朝 +x（坐的人的左手邊），yaw 是繞 y 軸轉；筆夾朝上"""
    d = np.array([-math.cos(yaw), 0.0, math.sin(yaw)])
    return frame(np.array([x, y + r, z]) - d * 0.071, d, (0, 1, 0))


def hands():
    d = json.load(open(HANDS, encoding='utf8'))
    avg = lambda pose, k: np.mean([np.array(d[b][pose][k]) for b in d], axis=0)
    return avg


DESK_Y = 0.75


def pen_in_hand(avg, paper_y):
    """抄筆記的右手：筆尖在食指尖前面一點、貼在紙上；筆身往後上方經過虎口（拇指尖和食指根部之間）"""
    idx, th, i1, wr = avg('write', 'R_Index3_tip'), avg('write', 'R_Thumb3_tip'), avg('write', 'R_Index1'), avg('write', 'R_Hand')
    fw = idx - wr; fw[1] = 0; fw /= np.linalg.norm(fw)
    tip = idx + fw * 0.012; tip[1] = paper_y + 0.0005
    grip = (th + i1) / 2 + np.array([0, 0.012, 0])
    axis = grip - tip; axis /= np.linalg.norm(axis)
    side = np.cross(axis, (0, 1, 0)); up = np.cross(side, axis)
    return frame(tip, axis, up)


def phone_in_hands(avg):
    """滑手機：手機底緣靠在兩個手掌上、往臉的方向斜 30°（螢幕朝臉）"""
    pal = [(avg('phone', s + '_Hand') + avg('phone', s + '_Middle1')) / 2 for s in ('L', 'R')]
    tips = [avg('phone', s + '_Middle3_tip') for s in ('L', 'R')]
    c = (pal[0] + pal[1]) / 2; tip = (tips[0] + tips[1]) / 2
    fwd = tip - c; fwd[1] = 0; fwd /= np.linalg.norm(fwd)
    tilt = math.radians(32)
    A = fwd * math.cos(tilt) + np.array([0, math.sin(tilt), 0])          # 手機的長邊（往上、往前）
    head = avg('phone', 'Head'); Nn = head - c; Nn -= A * np.dot(Nn, A); Nn /= np.linalg.norm(Nn)   # 螢幕朝臉
    base = c + np.array([0, 0.016, 0]) + fwd * 0.004   # 手機底緣在手掌上面一點（手掌厚約 2.5 cm）
    center = base + A * (PH_D / 2) + Nn * (PH_H / 2)
    M = frame(center, Nn, A)          # 局部 y→螢幕的方向、z→長邊
    return M @ T(0, -PH_H / 2, 0)     # 手機的網格 y 從 0 到 PH_H：中心移到 0


def SETS(avg):
    """每一組：[(單件的名稱, 參數, 矩陣)]"""
    nb_y = nb_top_y(0.08)   # 打開的筆記本，右頁中間的紙面高度
    S = {}
    # ---- 講堂（座位座標；桌板 y 0.75、z 0.30–0.64）----
    S['lset_write'] = [('notebook_open', {}, lay(0.055, DESK_Y, 0.47, math.radians(-7))), ('pen', {}, pen_in_hand(avg, DESK_Y + nb_y))]
    S['lset_phone'] = [('phone', {'on': True}, phone_in_hands(avg)), ('notebook_closed', {}, lay(0.06, DESK_Y, 0.47, math.radians(5))),
                       ('pen', {}, lay_pen(0.08, DESK_Y + 0.0055, 0.46, math.radians(-30)))]
    S['lset_laptop'] = [('laptop', {}, lay(0.0, DESK_Y, 0.415, 0.0)), ('phone', {'on': False}, lay(0.205, DESK_Y, 0.44, math.radians(4)))]
    S['lset_book'] = [('book_closed', TEXT, lay(0.03, DESK_Y, 0.46, math.radians(3))), ('notebook_closed', {'cov': 'nb_cov_b', 'edge': 'tape_green'}, lay(0.05, DESK_Y + TEXT['th'], 0.45, math.radians(-6))),
                      ('pen', {}, lay_pen(0.06, DESK_Y + TEXT['th'] + 0.0055, 0.44, math.radians(25))), ('thermos', {'col': 'th_sage'}, lay(-0.205, DESK_Y, 0.56, 0.0))]
    S['lset_code'] = [('book_closed', CODE, lay(0.02, DESK_Y, 0.46, math.radians(-3))), ('highlighter', {}, lay_pen(-0.15, DESK_Y, 0.40, math.radians(68), r=0.0061)),
                      ('cup', {}, lay(-0.20, DESK_Y, 0.57, 0.0))]
    S['hold_phone'] = [('phone', {'on': True}, phone_in_hands(avg))]
    S['hold_pen'] = [('pen', {}, pen_in_hand(avg, DESK_Y + nb_y))]
    # ---- 自習雙人桌（桌面座標：原點在坐的人面前的桌緣，+z 往桌子裡面；一個人用 x −0.42～0.42、z 0～0.3）----
    S['tset_notes'] = [('notebook_open', {}, lay(0.055, 0, 0.121, 0.0)), ('pen', {}, lay_pen(-0.05, nb_y, 0.14, math.radians(-35))),   # 桌子中間有插座盒（x ±0.07、z 0.255–0.345）：筆記本不能超過 z 0.255（靠人那一邊凸出桌緣 1 cm）
                       ('pencil_case', {}, lay(0.33, 0, 0.17, math.radians(78))), ('cup', {}, lay(-0.30, 0, 0.21, 0.0))]
    S['tset_laptop'] = [('laptop', {}, lay(0.0, 0, 0.11, math.radians(2))), ('phone', {'on': False}, lay(0.27, 0, 0.12, math.radians(-12))),
                        ('thermos', {'col': 'th_navy'}, lay(-0.31, 0, 0.18, 0.0))]
    S['tset_book'] = [('book_open', {}, lay(-0.03, 0, 0.13, math.radians(-4))), ('highlighter', {'pink': True}, lay_pen(-0.24, 0, 0.11, math.radians(-70), r=0.0061)),
                      ('notebook_closed', {}, lay(0.28, 0, 0.15, math.radians(84))), ('pen', {}, lay_pen(0.27, 0.0055, 0.10, math.radians(10)))]
    S['tset_away'] = [('laptop', {'open_deg': 0.0}, lay(-0.02, 0, 0.14, math.radians(3))), ('book_closed', TEXT, lay(0.0, LT_BH + LT_LH, 0.12, math.radians(-3))),
                      ('cup', {}, lay(0.30, 0, 0.13, 0.0)), ('phone', {'on': False}, lay(-0.30, 0, 0.12, math.radians(15)))]
    # ---- 圓桌（Ø1.0；桌心在 z=0.5；只放得下中間一件＋一件小的）----
    S['rset_notes'] = [('notebook_open', {}, lay(0.02, 0, 0.165, math.radians(-4))), ('pen', {}, lay_pen(-0.06, nb_y, 0.17, math.radians(-40)))]
    S['rset_laptop'] = [('laptop', {}, lay(0.0, 0, 0.14, 0.0))]
    S['rset_book'] = [('book_open', {}, lay(0.0, 0, 0.16, math.radians(3))), ('highlighter', {}, lay_pen(-0.12, 0, 0.30, math.radians(15), r=0.0061))]
    S['rset_cup'] = [('cup', {}, lay(0.10, 0, 0.18, 0.0)), ('notebook_closed', {'cov': 'nb_cov_b', 'edge': 'tape_green'}, lay(-0.07, 0, 0.17, math.radians(-8)))]   # 沒有手機：配滑手機的替身（hold_phone）時不會多一支
    return S


def check_sets(S):
    """每一組放得下嗎（只看每一件的頂點，不看形狀之間的碰撞）：
    tset：在雙人桌一個人的那一半（x ±0.44、z −0.03～0.30：筆記本可以凸出桌緣一點），不碰到桌子中間的插座盒（x ±0.072、z 0.253–0.347、高 3.4 cm）
    rset：在圓桌上（離桌心 0.5 以內，邊緣可以凸出 3 cm）、在左右兩個人的扇形之間（|x| ≤ 0.5 − z ＋ 0.03）
    lset：桌上的東西在這個座位的桌板上（x ±0.26、z 0.30–0.64）"""
    bad = []
    for name, entries in S.items():
        for it, kw, M in entries:
            pm = FN[it](lod=0, **kw); P = np.array([M[:3, :3] @ v + M[:3, 3] for v in pm.v])
            if name.startswith('tset'):
                if (np.abs(P[:, 0]) > 0.44).any() or (P[:, 2] < -0.03).any() or (P[:, 2] > 0.30).any(): bad.append((name, it, '超出桌面的一半'))
                hit = (np.abs(P[:, 0]) < 0.072) & (P[:, 2] > 0.253) & (P[:, 2] < 0.347) & (P[:, 1] < 0.034)
                if hit.any(): bad.append((name, it, '碰到插座盒'))
            elif name.startswith('rset'):
                r = np.hypot(P[:, 0], P[:, 2] - 0.5)
                if (r > 0.53).any(): bad.append((name, it, f'超出圓桌 {r.max() - 0.5:.3f} m'))
                if (np.abs(P[:, 0]) > 0.5 - P[:, 2] + 0.03).any(): bad.append((name, it, '超出扇形'))
            elif name.startswith('lset') and it not in ('pen',) and not (it == 'phone' and kw.get('on')):
                lo = P[P[:, 1] < 0.80]
                if len(lo) and ((np.abs(lo[:, 0]) > 0.26).any() or (lo[:, 2] < 0.30).any() or (lo[:, 2] > 0.64).any()): bad.append((name, it, '超出桌板'))
    return bad


ITEMS = {   # 名稱 → (函式, 參數)
    'notebook_open': (item_notebook_open, {}), 'notebook_closed': (item_notebook_closed, {}),
    'notebook_closed_b': (item_notebook_closed, {'cov': 'nb_cov_b', 'edge': 'tape_green'}),
    'code_book': (item_book_closed, CODE), 'code_open': (item_book_open, {}), 'textbook': (item_book_closed, TEXT),
    'laptop_open': (item_laptop, {}), 'laptop_closed': (item_laptop, {'open_deg': 0.0}),
    'phone_on': (item_phone, {'on': True}), 'phone_off': (item_phone, {'on': False}),
    'pen': (item_pen, {}), 'highlighter': (item_highlighter, {}), 'highlighter_pink': (item_highlighter, {'pink': True}),
    'pencil_case': (item_pencil_case, {}), 'cup': (item_cup, {}), 'thermos_sage': (item_thermos, {'col': 'th_sage'}), 'thermos_navy': (item_thermos, {'col': 'th_navy'}),
}
FN = {'notebook_open': item_notebook_open, 'notebook_closed': item_notebook_closed, 'book_closed': item_book_closed, 'book_open': item_book_open,
      'laptop': item_laptop, 'phone': item_phone, 'pen': item_pen, 'highlighter': item_highlighter, 'pencil_case': item_pencil_case, 'cup': item_cup, 'thermos': item_thermos}
NO_LOD1 = {'pen', 'highlighter'}


def build_set(entries, lod):
    pm = PM()
    for name, kw, M in entries:
        if lod and name in NO_LOD1: continue
        kw = dict(kw)
        if name == 'phone' and lod: kw['two_sided'] = True
        pm.add(FN[name](lod=lod, **kw), M)
    return pm


def to_blender(pm, name, mat, parent):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(g2b(*p)) for p in pm.v], [], [tuple(f) for f in pm.f])
    uvl = me.uv_layers.new(name='UVMap')
    for poly, uvs in zip(me.polygons, pm.uv):
        for li, uv in zip(poly.loop_indices, uvs): uvl.data[li].uv = uv
    for p in me.polygons: p.use_smooth = True
    me.validate(clean_customdata=False); me.update(); me.materials.append(mat)
    ob = bpy.data.objects.new(name, me); B.scene().collection.objects.link(ob); ob.parent = parent; ob['module'] = name
    return ob


def build():
    make_textures()
    out = os.path.join(L.ROOT, OUT)
    B.reset(texres=1024)
    root = B.group('desk_props', props={'kind': 'desk_props'})
    mat = bpy.data.materials.new('desk_props'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes['Principled BSDF']
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(ATLAS); tx.image.pack(); nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = bpy.data.images.load(ATLAS_ORM); to.image.colorspace_settings.name = 'Non-Color'; to.image.pack()
    sp = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(to.outputs['Color'], sp.inputs['Color'])
    nt.links.new(sp.outputs['Green'], bsdf.inputs['Roughness']); nt.links.new(sp.outputs['Blue'], bsdf.inputs['Metallic'])
    te = nt.nodes.new('ShaderNodeTexImage'); te.image = bpy.data.images.load(ATLAS_EMIT); te.image.pack()
    nt.links.new(te.outputs['Color'], bsdf.inputs['Emission Color']); bsdf.inputs['Emission Strength'].default_value = EMIT_STRENGTH
    avg = hands(); S = SETS(avg)
    bad = check_sets(S)
    for b in bad: print('  ！擺放', *b)
    mods = {}
    for name, (fn, kw) in ITEMS.items():
        pm = fn(**kw)
        if fn in (item_pen, item_highlighter): pm = PM().add(pm, lay_pen(0, 0, 0, 0, r=0.0052 if fn is item_pen else 0.0061))   # 單件的筆：平放在桌上，中心在原點
        to_blender(pm, 'item_' + name, mat, root)
        mn, mx = pm.bbox(); mods['item_' + name] = {'tris': pm.tris(), 'min': mn, 'max': mx}
    for name, entries in S.items():
        for lod in (0, 1):
            pm = build_set(entries, lod)
            if not pm.f: continue
            nm = name + ('_lod1' if lod else ''); to_blender(pm, nm, mat, root)
            mn, mx = pm.bbox(); mods[nm] = {'tris': pm.tris(), 'min': mn, 'max': mx, 'items': [e[0] for e in entries if not (lod and e[0] in NO_LOD1)]}
    for i, ob in enumerate(sorted(root.children, key=lambda o: o.name)):   # 檢視用：排開（遊戲端用網格本身）
        ob.location = g2b((i % 8) * 1.0, 0, (i // 8) * 1.0)
    info = L.export(out, gpu_instances=False)
    info['modules'] = mods
    info['atlas'] = [os.path.relpath(p, L.ROOT) for p in (ATLAS, ATLAS_ORM, ATLAS_EMIT)]
    info['origins'] = {
        'item_*': '底面中心、y=0＝放的那個面、+z＝離開坐的人的方向（螢幕、封面朝 −z 那一側的人）',
        'tset_*': '自習雙人桌：坐的人正前方的桌緣、y=0＝桌面、+z＝往桌子裡面；一個人的範圍 x −0.42～0.42、z 0～0.3（對面的人用自己的那一組）',
        'rset_*': '圓桌（Ø1.0）：坐的人正前方的桌緣（離桌心 0.5）、y=0＝桌面、+z＝往桌心',
        'lset_*': '講堂：座位的地面中心（＝講堂椅、坐姿替身的原點），桌板 y 0.75、z 0.30–0.64；lset_write／lset_phone 配替身的抄筆記／滑手機',
        'hold_*': '座位座標（和替身同一個矩陣）：hold_phone＝滑手機的手機；hold_pen＝抄筆記的筆（筆尖在座位座標 y≈0.754）',
    }
    info['placement_check'] = [' '.join(b) for b in bad] or 'ok'
    info['note'] = '一個材質 desk_props（底色 1024＋粗糙度／金屬度 256＋自發光 512：只有螢幕）；每個網格一個 InstancedMesh；_lod1 是遠處用的（筆、螢光筆省略）。GLB 裡的物件位置只是排開給人看'
    L.write_json(out[:-4] + '.json', info)
    print(json.dumps({k: v['tris'] for k, v in mods.items()}, ensure_ascii=False))
    return info


if __name__ == '__main__':
    build()
