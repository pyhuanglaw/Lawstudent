"""118 巷十一間店的招牌貼圖集（L118-SHOPS-REDO-1111，X338；LAWWW2 2026-11-11）→ textures/gen/l118_signs_atlas.jpg／.json（wz_shopkit.py 在 --set lane118 時讀這一張）。
使用者的規格（docs/handoff/user_specs/L118_SHOPS_REDO_1111.md）：每間店招牌的顏色、樣子——
  118牛排 紅黃老式｜水上便當 黃色大招牌｜辛亥韓食 深紅＋餐點照片｜五湖四海 米色、老麵館風｜大學食堂 橘白大招牌｜義大麵屋 奶油白、紅字｜
  清州刀削麵 白底紅字老式｜奈良咖哩 黃色＋咖哩飯照片｜迪倫窯烤披薩 黑色鐵件｜喝不喝咖啡 深藍、白字｜果茶社 米白、淡黃字。
店名是使用者定的（不改）；字型是這台機器唯一的中文字型（文泉驛正黑）＋ Inter（英文、數字）；圖案都是程式畫的，沒有真實品牌的商標或配色組合。
鍵：l118_<id>_h（橫招牌）、l118_<id>_v（直立招牌，有的店才有）、l118_ph_<菜>（貼在玻璃、牆上的餐點照片；l118_food_tex.py）、l118_menu_<id>（門邊的菜單板）。
json 的格式和 sign_atlas.py 一樣：{uv:[u0,v0,u1,v1], aspect, lit, part}；m＝這塊招牌在街上的寬（公尺，wz_shopkit 讀）。
用法：/opt/blenv/bin/python tools/blender/env_second/l118_signs_tex.py [預覽圖.jpg]"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import l118_food_tex as FD   # noqa: E402

GEN = os.path.join(HERE, 'textures', 'gen')
CJK = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
LAT = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
LATX = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'
PXM = 240   # 每公尺幾個像素（橫招牌）
S2 = 2      # 畫的時候放大兩倍再縮


def F(n, lat=False, x=False): return ImageFont.truetype((LATX if x else LAT) if lat else CJK, int(n))
def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def sh(c, k): return tuple(max(0, min(255, int(v * k))) for v in c)


class Cv:
    """一塊招牌的畫布（w、h 公尺；畫的座標也用公尺，原點左上）"""
    def __init__(self, w, h, bg, pxm=PXM):
        self.wm, self.hm, self.k = w, h, pxm * S2; self.im = Image.new('RGB', (round(w * self.k), round(h * self.k)), bg); self.d = ImageDraw.Draw(self.im)

    def px(self, v): return v * self.k

    def rect(self, x0, y0, x1, y1, fill=None, outline=None, width=0.0, r=0.0):
        box = [self.px(x0), self.px(y0), self.px(x1), self.px(y1)]
        if r: self.d.rounded_rectangle(box, radius=self.px(r), fill=fill, outline=outline, width=max(1, round(self.px(width))) if outline else 0)
        else: self.d.rectangle(box, fill=fill, outline=outline, width=max(1, round(self.px(width))) if outline else 0)

    def circle(self, x, y, r, fill=None, outline=None, width=0.0): self.d.ellipse([self.px(x - r), self.px(y - r), self.px(x + r), self.px(y + r)], fill=fill, outline=outline, width=max(1, round(self.px(width))) if outline else 0)

    def text(self, x, y, t, size, fill, anchor='mm', bold=0.0, stroke=None, sw=0.0, shadow=None, sp=0.0, lat=False, xb=False):
        """字：size＝字高（公尺）；bold＝加粗（公尺，同色描邊）；stroke／sw＝外框；shadow＝(dx, dy, 顏色)；sp＝字距（公尺）"""
        f = F(self.px(size), lat, xb); d = self.d
        if sp:
            ws = [d.textlength(ch, font=f) for ch in t]; tot = sum(ws) + self.px(sp) * (len(t) - 1); x0 = self.px(x) - (tot / 2 if anchor[0] == 'm' else (tot if anchor[0] == 'r' else 0)); cx = x0
            for ch, w_ in zip(t, ws): self._t(cx + w_ / 2, self.px(y), ch, f, fill, 'm' + anchor[1], bold, stroke, sw, shadow); cx += w_ + self.px(sp)
            return tot / self.k
        self._t(self.px(x), self.px(y), t, f, fill, anchor, bold, stroke, sw, shadow); return d.textlength(t, font=f) / self.k

    def _t(self, X, Y, t, f, fill, anchor, bold, stroke, sw, shadow):
        d = self.d; b = round(self.px(bold))
        if shadow: d.text((X + self.px(shadow[0]), Y + self.px(shadow[1])), t, font=f, fill=shadow[2], anchor=anchor, stroke_width=b + round(self.px(sw)), stroke_fill=shadow[2])
        if stroke: d.text((X, Y), t, font=f, fill=stroke, anchor=anchor, stroke_width=b + round(self.px(sw)), stroke_fill=stroke)
        d.text((X, Y), t, font=f, fill=fill, anchor=anchor, stroke_width=b, stroke_fill=fill)

    def photo(self, kind, x0, y0, x1, y1, r=0.03, border=None, bw=0.012):
        w, h = round(self.px(x1 - x0)), round(self.px(y1 - y0)); im = FD.dish(kind, w, h); m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], radius=self.px(r), fill=255)
        self.im.paste(im, (round(self.px(x0)), round(self.px(y0))), m)
        if border: self.rect(x0, y0, x1, y1, outline=border, width=bw, r=r)

    def grain(self, k=0.05, seed=3):
        """一點點髒污、深淺（招牌不是電腦螢幕那種純色）"""
        import random
        rr = random.Random(seed); w, h = self.im.size; lay = Image.new('L', (w // 8, h // 8), 128); px = lay.load()
        for y in range(lay.size[1]):
            for x in range(lay.size[0]): px[x, y] = 128 + int(rr.uniform(-1, 1) * 127 * k * 4)
        lay = lay.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6)); self.im = Image.blend(self.im, Image.merge('RGB', (lay, lay, lay)), k); self.d = ImageDraw.Draw(self.im)

    def out(self): return self.im.resize((self.im.size[0] // S2, self.im.size[1] // S2), Image.LANCZOS)


# ---------------- 使用者的參考圖（docs/handoff/user_specs/l118_ref/ext_<id>.webp，11-11；1672×941，正面拍） ----------------
# 第 1 版照 RULES_2D_TO_3D：招牌、玻璃上的餐點海報直接從參考圖裁。框的座標是在 1280×720 的縮圖上量的（×1.30625＝原圖）。
#   兩三個顏色的招牌（紅底黃字、黃底咖啡字…）：原圖上只有 1000 像素寬、近看會糊 → 放大三倍、每個像素歸到最近的那個顏色、再縮回來（邊緣變利、顏色變平，字形還是圖上的字）；
#   有木紋、插畫、立體字的招牌（五湖四海、義大麵屋、迪倫）和餐點海報：放大＋銳利化。
#   參考圖上的價目表不裁（價錢是生圖帶出來的，和使用者的文字規格不一樣；LAWWW 11-11 04:45）：價目表用 MENUS 重畫。
REF = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'docs', 'handoff', 'user_specs', 'l118_ref'))
_RK = 1672 / 1280; _REFIM = {}
def has_ref(sid): return os.path.exists(os.path.join(REF, f'ext_{sid}.webp'))
def ref_crop(sid, box):
    if sid not in _REFIM: _REFIM[sid] = Image.open(os.path.join(REF, f'ext_{sid}.webp')).convert('RGB')
    return _REFIM[sid].crop(tuple(round(v * _RK) for v in box))
def ref_flat(im, colors, width):
    up = im.resize((im.width * 3, im.height * 3), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.0)); pal = Image.new('P', (1, 1)); flat = []
    for c in colors: flat += list(rgb(c))
    pal.putpalette(flat + flat[:3] * (256 - len(colors))); q = up.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
    d = ImageDraw.Draw(q); e = max(2, round(q.height * 0.03))   # 邊上一圈塗回底色：裁到的框、陰影會被歸成字的顏色（一塊一塊的髒點）
    for box in ((0, 0, q.width, e), (0, q.height - e, q.width, q.height), (0, 0, e, q.height), (q.width - e, 0, q.width, q.height)): d.rectangle(box, fill=rgb(colors[0]))
    return q.resize((width, round(width * im.height / im.width)), Image.LANCZOS)
def ref_photo(im, width): return im.resize((width, round(width * im.height / im.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
# 店 → (框, 街上的寬 m, 顏色（None＝照片式）, 燈箱)
REF_SIGNS = {
    'dian': ((283, 93, 1105, 207), 5.6, ['#cf141c', '#f8c61c'], True),
    'self': ((278, 84, 1165, 220), 6.5, ['#f8c61a', '#4a2414', '#fff6d2'], True),
    'tea': ((396, 122, 916, 236), 2.6, ['#7c1a22', '#f8e8c8'], True),
    'home': ((428, 72, 1026, 214), 5.2, None, False),
    'cafe2': ((227, 109, 1095, 255), 6.5, ['#f07814', '#fbf2de'], True),
    'pasta': ((305, 84, 1006, 194), 6.2, None, False),
    'korea': ((286, 86, 1090, 208), 6.5, ['#f6f0e4', '#b41e1c'], True),
    'omu': ((254, 92, 1051, 222), 6.5, ['#f2c018', '#4a2a14'], True),
    'noodle2': ((322, 124, 1116, 242), 6.5, None, False),
}
# 玻璃、牆上的海報：鍵 → (店, 框, 寬 m)
REF_POSTERS = {
    'dian_p1': ('dian', (306, 276, 478, 378), 0.95), 'dian_p2': ('dian', (306, 384, 478, 488), 0.95), 'dian_p3': ('dian', (306, 492, 478, 592), 0.95),
    'korea_p1': ('korea', (268, 312, 430, 452), 0.95), 'korea_p2': ('korea', (488, 318, 642, 452), 0.95), 'korea_open': ('korea', (721, 378, 753, 468), 0.2),
    'tea_p1': ('tea', (294, 324, 416, 464), 0.62), 'tea_p2': ('tea', (754, 326, 870, 464), 0.62), 'tea_p3': ('tea', (924, 326, 1040, 462), 0.62),
    'pasta_p1': ('pasta', (390, 300, 503, 446), 0.72), 'pasta_p2': ('pasta', (542, 300, 655, 446), 0.72),
    'omu_p1': ('omu', (332, 320, 454, 454), 0.75), 'omu_p2': ('omu', (557, 322, 672, 452), 0.75),
    'noodle2_board': ('noodle2', (726, 312, 808, 468), 0.6), 'cafe2_today': ('cafe2', (1046, 336, 1186, 546), 0.9),
}


# ---------------- 十一塊橫招牌 ----------------
def s_dian():   # 118牛排：紅底黃字、黃框、黑陰影的老式燈箱
    w, h = 5.6, 0.95; c = Cv(w, h, '#c4201a'); Y = rgb('#ffd21e')
    c.rect(0.04, 0.04, w - 0.04, h - 0.04, outline=Y, width=0.035); c.rect(0.11, 0.11, w - 0.11, h - 0.11, outline=rgb('#ffe98a'), width=0.008)
    c.circle(0.62, h / 2, 0.3, fill=Y); c.circle(0.62, h / 2, 0.3, outline=rgb('#7a100c'), width=0.012); c.text(0.62, h / 2 - 0.02, '牛', 0.4, rgb('#c4201a'), bold=0.012)
    c.text(2.62, h / 2 - 0.02, '118牛排', 0.62, Y, bold=0.02, shadow=(0.03, 0.035, rgb('#3a0806')), sp=0.06)
    for i, t in enumerate(('鐵板牛排', '雞排・豬排')): c.text(w - 0.86, 0.3 + i * 0.3, t, 0.2, (255, 255, 255), bold=0.004)
    c.rect(w - 1.52, 0.72, w - 0.2, 0.735, fill=Y); c.grain(0.04, 1)
    return c


def s_self():   # 水上便當：黃色大招牌、紅字白邊
    w, h = 6.5, 1.15; c = Cv(w, h, '#f7c41a'); R = rgb('#c8201a')
    c.rect(0, 0, w, 0.09, fill=R); c.rect(0, h - 0.09, w, h, fill=R)
    c.text(2.55, h / 2, '水上便當', 0.78, R, bold=0.026, stroke=(255, 255, 255), sw=0.035, sp=0.1)
    c.rect(4.72, 0.2, 6.3, 0.56, fill=R, r=0.05); c.text(5.51, 0.375, '雞腿・雞排', 0.24, (255, 255, 255), bold=0.006)
    c.text(5.51, 0.78, '便當　外帶', 0.26, rgb('#2a1a10'), bold=0.008); c.grain(0.035, 2)
    return c


def s_tea():   # 辛亥韓食：深紅、白字，左邊一張鍋物照片（店面只有 3 m 寬）
    w, h = 2.5, 0.8; c = Cv(w, h, '#7a1418')
    c.photo('stew', 0.06, 0.06, 0.86, h - 0.06, r=0.03, border=rgb('#e8c890'), bw=0.012)
    c.text(1.67, 0.34, '辛亥韓食', 0.33, (255, 255, 255), bold=0.01, sp=0.02); c.rect(0.98, 0.55, w - 0.1, 0.558, fill=rgb('#e8c890'))
    c.text(1.67, 0.665, '韓式鍋物・鐵板烤肉', 0.125, rgb('#f2dcb0'), bold=0.002)
    return c


def s_home():   # 五湖四海：米色底、深褐字、紅色印章（老麵館）
    w, h = 6.5, 0.85; c = Cv(w, h, '#e8dbbd'); K = rgb('#3a2416')
    c.rect(0.05, 0.05, w - 0.05, h - 0.05, outline=K, width=0.014); c.rect(0.1, 0.1, w - 0.1, h - 0.1, outline=K, width=0.005)
    c.text(2.9, h / 2 - 0.01, '五湖四海', 0.56, K, bold=0.016, sp=0.22)
    c.rect(0.34, 0.2, 0.8, 0.65, fill=rgb('#a8281e'), r=0.03); c.text(0.57, 0.315, '水', 0.19, rgb('#f4e6c8'), bold=0.004); c.text(0.57, 0.535, '餃', 0.19, rgb('#f4e6c8'), bold=0.004)
    for i, t in enumerate(('手工水餃', '酸辣湯')): c.text(w - 0.8, 0.3 + i * 0.27, t, 0.19, rgb('#6a3a22'), bold=0.004)
    c.grain(0.06, 4)
    return c


def s_cafe2():   # 大學食堂：橘、白兩色的大招牌
    w, h = 6.5, 1.15; c = Cv(w, h, '#ffffff'); O = rgb('#ef7a1a')
    c.d.polygon([(0, 0), (c.px(4.5), 0), (c.px(4.05), c.px(h)), (0, c.px(h))], fill=O)
    c.text(2.1, h / 2, '大學食堂', 0.74, (255, 255, 255), bold=0.024, sp=0.1, shadow=(0.02, 0.025, rgb('#a84a08')))
    c.text(5.35, 0.36, '自助餐', 0.36, O, bold=0.012, sp=0.03); c.rect(4.6, 0.62, 6.2, 0.635, fill=O); c.text(5.4, 0.86, '秤重計價', 0.26, rgb('#3a2a1e'), bold=0.006, sp=0.03)
    c.grain(0.03, 5)
    return c


def s_pasta():   # 義大麵屋：奶油白、紅字
    w, h = 6.5, 0.85; c = Cv(w, h, '#f6efdc'); R = rgb('#b3261e')
    c.rect(0.06, 0.06, w - 0.06, h - 0.06, outline=R, width=0.01)
    c.text(2.75, h / 2 - 0.01, '義大麵屋', 0.54, R, bold=0.014, sp=0.2)
    c.text(5.35, 0.33, 'PASTA', 0.21, R, lat=True, sp=0.05); c.rect(4.72, 0.47, 5.98, 0.478, fill=R); c.text(5.35, 0.62, '平價義大利麵', 0.15, rgb('#5a3a2a'), bold=0.002)
    # 左邊：叉子捲著一口麵（程式畫的小圖，不是任何品牌的標誌）
    c.circle(0.55, 0.42, 0.2, outline=R, width=0.012); c.circle(0.55, 0.42, 0.13, outline=R, width=0.012); c.circle(0.55, 0.42, 0.06, outline=R, width=0.012); c.rect(0.74, 0.405, 1.02, 0.435, fill=R, r=0.012)
    c.grain(0.035, 6)
    return c


def s_korea():   # 清州刀削麵：白底紅字的老式招牌
    w, h = 6.5, 0.9; c = Cv(w, h, '#fbfaf5'); R = rgb('#c8201a')
    c.rect(0, 0, w, 0.07, fill=R); c.rect(0, h - 0.07, w, h, fill=R)
    c.circle(0.6, h / 2, 0.29, fill=R); c.text(0.6, h / 2 - 0.02, '麵', 0.38, (255, 255, 255), bold=0.01)
    c.text(3.05, h / 2 - 0.01, '清州刀削麵', 0.56, R, bold=0.02, sp=0.1)
    for i, t in enumerate(('牛肉・番茄', '木須・炸醬')): c.text(w - 0.82, 0.3 + i * 0.28, t, 0.19, rgb('#1c1c1c'), bold=0.004)
    c.grain(0.04, 7)
    return c


def s_omu():   # 奈良咖哩：黃色招牌、兩張咖哩飯照片
    w, h = 6.5, 0.9; c = Cv(w, h, '#f2b705'); K = rgb('#4a2a12')
    c.photo('curry_cutlet', 0.08, 0.08, 1.07, h - 0.08, border=(255, 255, 255), bw=0.016); c.photo('curry_croquette', w - 1.07, 0.08, w - 0.08, h - 0.08, border=(255, 255, 255), bw=0.016)
    c.text(w / 2, 0.36, '奈良咖哩', 0.5, K, bold=0.016, sp=0.16); c.rect(2.0, 0.66, w - 2.0, 0.672, fill=K); c.text(w / 2, 0.77, '日式咖哩飯', 0.15, K, bold=0.003, sp=0.08)
    c.grain(0.03, 8)
    return c


def s_noodle2():   # 迪倫窯烤披薩：黑色鐵板、鏤空字、鉚釘
    w, h = 6.5, 0.85; c = Cv(w, h, '#1b1b1c'); c.grain(0.1, 9); W_ = rgb('#efe6d2')
    c.rect(0.04, 0.04, w - 0.04, h - 0.04, outline=rgb('#3a3a3c'), width=0.012)
    for x in (0.14, w - 0.14):
        for y in (0.14, h - 0.14): c.circle(x, y, 0.035, fill=rgb('#4a4a4c')); c.circle(x - 0.008, y - 0.008, 0.014, fill=rgb('#7a7a7c'))
    c.text(2.95, 0.36, '迪倫窯烤披薩', 0.44, W_, bold=0.012, sp=0.12); c.text(2.95, 0.69, 'WOOD-FIRED PIZZA', 0.13, rgb('#d98a3a'), lat=True, sp=0.07)
    # 右邊：窯口（半圓的拱＋裡面的火）
    x, y = 5.72, 0.6; c.d.pieslice([c.px(x - 0.42), c.px(y - 0.42), c.px(x + 0.42), c.px(y + 0.42)], 180, 360, fill=rgb('#8a3a22')); c.d.pieslice([c.px(x - 0.3), c.px(y - 0.3), c.px(x + 0.3), c.px(y + 0.3)], 180, 360, fill=rgb('#1b1b1c'))
    for (dx, r_, col) in ((-0.1, 0.11, '#e8842a'), (0.06, 0.14, '#f2a030'), (0.0, 0.08, '#ffd86a')): c.d.pieslice([c.px(x + dx - r_), c.px(y - r_ * 1.6), c.px(x + dx + r_), c.px(y + r_ * 1.6)], 180, 360, fill=rgb(col))
    c.rect(x - 0.48, y, x + 0.48, y + 0.04, fill=rgb('#8a3a22'))
    return c


def s_drink_a():   # 喝不喝咖啡：深藍、白字（使用者 11-11 定案）
    w, h = 4.4, 0.85; c = Cv(w, h, '#16306b')
    c.rect(0.05, 0.05, w - 0.05, h - 0.05, outline=(255, 255, 255), width=0.008)
    c.text(2.45, 0.35, '喝不喝咖啡', 0.44, (255, 255, 255), bold=0.012, sp=0.08); c.text(2.45, 0.67, '紅茶・綠茶・珍珠奶茶・咖啡', 0.125, rgb('#cfdcf4'), bold=0.002)
    # 左邊：一個外帶杯的線條
    x, y = 0.5, 0.44; c.d.polygon([(c.px(x - 0.17), c.px(y - 0.2)), (c.px(x + 0.17), c.px(y - 0.2)), (c.px(x + 0.12), c.px(y + 0.24)), (c.px(x - 0.12), c.px(y + 0.24))], outline=(255, 255, 255), width=round(c.px(0.016)))
    c.rect(x - 0.2, y - 0.25, x + 0.2, y - 0.2, fill=(255, 255, 255), r=0.01); c.d.line([(c.px(x + 0.04), c.px(y - 0.25)), (c.px(x + 0.1), c.px(y - 0.38))], fill=(255, 255, 255), width=round(c.px(0.02)))
    return c


def s_drink_b():   # 果茶社：米白、淡黃字（使用者 11-11 定案），現代簡約：留白、細線
    w, h = 2.5, 0.8; c = Cv(w, h, '#f6f0e0')
    c.text(w / 2, 0.34, '果茶社', 0.38, rgb('#e9c443'), bold=0.008, sp=0.2, stroke=rgb('#c9a12c'), sw=0.006)   # 淡黃字在米白底上太淡：外緣一圈深一點的黃（6 mm），近看才讀得出來
    c.rect(0.85, 0.585, w - 0.85, 0.591, fill=rgb('#d9b53a')); c.text(w / 2, 0.68, '鮮果茶・多多', 0.11, rgb('#a88a2e'), bold=0.001, sp=0.05)
    return c


# ---------------- 直立招牌（0.62 m 寬） ----------------
def v_sign(chars, bg, fg, top=None, band=None, hm=2.4):
    w = 0.62; c = Cv(w, hm, bg, pxm=200); n = len(chars); y0 = 0.2 + (0.42 if top else 0.0); stepy = (hm - y0 - 0.16) / n
    if band: c.rect(0, 0, w, 0.07, fill=band); c.rect(0, hm - 0.07, w, hm, fill=band)
    if top: c.text(w / 2, 0.36, top, 0.26, fg, lat=True, xb=True)
    for i, ch in enumerate(chars): c.text(w / 2, y0 + (i + 0.5) * stepy, ch, min(0.46, stepy * 0.86), fg, bold=0.012)
    return c


# ---------------- 門邊的菜單板（直的，0.6 × 0.9 m；品名和價錢照使用者的規格） ----------------
MENUS = {
    'dian': ('118牛排', [('鐵板牛排', 190), ('雪花牛排', 230), ('雞排', 180), ('豬排', 170), ('雙拼', 280)], '#c4201a', '#ffd21e', '濃湯・紅茶 自取'),
    'self': ('水上便當', [('炸雞腿飯', 145), ('雞排飯', 135), ('滷雞腿飯', 130), ('排骨飯', 125), ('雙拼', 165)], '#f7c41a', '#c8201a', '外帶・內用'),
    'tea': ('辛亥韓食', [('泡菜鍋', 190), ('海鮮豆腐鍋', 210), ('鐵板豬肉', 200), ('鐵板牛肉', 230), ('石鍋拌飯', 180)], '#7a1418', '#ffffff', '小菜可以續'),
    'home': ('五湖四海', [('高麗菜水餃10顆', 80), ('韭菜水餃10顆', 85), ('酸辣湯', 45), ('玉米濃湯', 45)], '#e8dbbd', '#3a2416', '現包現煮'),
    'cafe2': ('大學食堂', [('菜多肉少', 100), ('三菜一肉', 130), ('三菜兩肉', 160), ('白飯也算重量', None)], '#ef7a1a', '#ffffff', '秤重計價'),
    'pasta': ('義大麵屋', [('番茄肉醬麵', 170), ('奶油雞肉麵', 190), ('青醬培根麵', 190), ('蒜香蛤蜊麵', 210)], '#f6efdc', '#b3261e', '平價義大利麵'),
    'korea': ('清州刀削麵', [('牛肉刀削麵', 190), ('番茄刀削麵', 150), ('木須炒刀削麵', 170), ('炸醬刀削麵', 140)], '#fbfaf5', '#c8201a', '現削現煮'),
    'omu': ('奈良咖哩', [('豬排咖哩', 190), ('雞肉咖哩', 180), ('牛肉咖哩', 210), ('可樂餅咖哩', 170)], '#f2b705', '#4a2a12', '日式咖哩飯'),
    'noodle2': ('迪倫窯烤披薩', [('瑪格麗特', 180), ('夏威夷', 200), ('燻雞蘑菇', 210), ('四種起司', 230)], '#1b1b1c', '#efe6d2', '個人尺寸・現烤'),
    'drink_a': ('喝不喝咖啡', [('紅茶', 30), ('綠茶', 30), ('冬瓜茶', 35), ('珍珠奶茶', 55), ('鮮奶茶', 65), ('美式咖啡', 50), ('拿鐵', 75)], '#16306b', '#ffffff', '甜度冰塊可調'),
    'drink_b': ('果茶社', [('檸檬綠茶', 50), ('百香果綠茶', 60), ('柳橙綠茶', 75), ('葡萄柚茶', 95), ('檸檬多多', 60), ('葡萄柚多多', 80)], '#f6f0e0', '#b8962e', '鮮果現切'),
}
# 九間的品名、價錢照使用者的文字規格；大學食堂、兩間飲料店的品項和價錢照 AA_280 第 1 節（11-11 定稿：使用者給類別和價格範圍，AA 在範圍內定）


def menu_board(sid, w=0.6, h=0.9):
    name, items, bg, fg, foot = MENUS[sid]; c = Cv(w, h, '#fbf8f0', pxm=270); B_, F_ = rgb(bg), rgb(fg); dark = sum(B_) < 420
    c.rect(0, 0, w, 0.15, fill=B_); c.text(w / 2, 0.072, name, 0.075 if len(name) <= 5 else 0.062, F_ if dark or sum(F_) < 420 else rgb('#3a2416'), bold=0.002)
    n = len(items); y0 = 0.2; st = (h - 0.12 - y0) / n; fs = min(0.058, st * 0.62); ink = rgb('#2a2018'); acc = B_ if dark else F_
    for i, (nm, pr) in enumerate(items):
        y = y0 + (i + 0.5) * st; fn = fs if len(nm) <= 6 else fs * 6.4 / len(nm); c.text(0.045, y, nm, fn, ink, anchor='lm', bold=0.001)
        if pr is not None: c.text(w - 0.045, y, str(pr), fs, acc if sum(acc) < 600 else ink, anchor='rm', lat=True)
        c.rect(0.04, y + st / 2 - 0.003, w - 0.04, y + st / 2 - 0.001, fill=(214, 206, 190))
    c.text(w / 2, h - 0.055, foot, 0.042, acc if sum(acc) < 600 else ink, bold=0.001)
    c.rect(0, 0, w, h, outline=sh(B_, 0.8) if sum(B_) < 700 else rgb('#8a7a5a'), width=0.008)
    return c


SIGNS = {'dian': (s_dian, True), 'self': (s_self, True), 'tea': (s_tea, True), 'home': (s_home, False), 'cafe2': (s_cafe2, True), 'pasta': (s_pasta, False), 'korea': (s_korea, True),
         'omu': (s_omu, True), 'noodle2': (s_noodle2, False), 'drink_a': (s_drink_a, True), 'drink_b': (s_drink_b, False)}
def v_box(lines, bg, fg):   # 水上便當：突出牆面的方形燈箱（參考圖左上），兩行各兩個字
    c = Cv(0.9, 0.9, bg, pxm=200); c.rect(0.03, 0.03, 0.87, 0.87, outline=rgb('#fff6d2'), width=0.012)
    for i, t in enumerate(lines): c.text(0.45, 0.27 + i * 0.36, t, 0.3, fg, bold=0.01, sp=0.03)
    return c


VSIGNS = {'dian': (lambda: v_sign('牛排', '#cf141c', rgb('#f8c61c'), top='118', band=rgb('#f8c61c'), hm=2.0), True),
          'self': (lambda: v_box(('水上', '便當'), '#f8c61a', rgb('#4a2414')), True)}
PHOTOS = ['dumpling', 'bento_leg', 'cup_milktea', 'cup_fruit', 'cup_passion', 'cup_coffee', 'cup_green', 'cup_black']   # 程式畫的圖：參考圖沒有海報的店（五湖四海的水餃、水上便當）和兩間飲料店用


def build(preview=None):
    items = []   # (key, img, lit, part, m)
    for sid, (fn, lit) in SIGNS.items():
        if sid in REF_SIGNS and has_ref(sid):   # 第 1 版：照使用者的參考圖（沒有參考圖的兩間飲料店用畫的）
            box, wm, cols, lit = REF_SIGNS[sid]; im = ref_crop(sid, box); W_ = round(wm * 225); items.append((f'l118_{sid}_h', ref_flat(im, cols, W_) if cols else ref_photo(im, W_), lit, 'h', wm)); continue
        c = fn(); items.append((f'l118_{sid}_h', c.out(), lit, 'h', c.wm))
    for sid, (fn, lit) in VSIGNS.items(): c = fn(); items.append((f'l118_{sid}_v', c.out(), lit, 'v', c.wm))
    for k, (sid, box, wm) in REF_POSTERS.items():
        if has_ref(sid): items.append((f'l118_ref_{k}', ref_photo(ref_crop(sid, box), round(wm * 300)), False, 'poster', wm))
    for k in PHOTOS: cup = k.startswith('cup_'); items.append((f'l118_ph_{k}', FD.dish(k, 132 if cup else 200, 176 if cup else 150), False, 'photo', 0.45 if cup else 0.6))
    for sid in MENUS: c = menu_board(sid); items.append((f'l118_menu_{sid}', c.out(), False, 'menu', c.wm))
    # 貨架式排版（高的先排；每一件放進第一列放得下的貨架，放不下才開新的一列——寬招牌旁邊的空位給照片、菜單板）
    S = 2048; pad = 4; order = sorted(items, key=lambda it: (-it[1].size[1], -it[1].size[0])); shelves = []; pos = {}; y = pad; rowh = 0
    for (k, im, lit, part, m) in order:
        w, h = im.size
        for sf in shelves:
            if sf['x'] + w + pad <= S and h <= sf['h']: pos[k] = (sf['x'], sf['y']); sf['x'] += w + pad; break
        else:
            ny = (shelves[-1]['y'] + shelves[-1]['h'] + pad) if shelves else pad; shelves.append(dict(x=pad + w + pad, y=ny, h=h)); pos[k] = (pad, ny)
    y = shelves[-1]['y']; rowh = shelves[-1]['h']
    SH = y + rowh + pad; SH = ((SH + 63) // 64) * 64
    atlas = Image.new('RGB', (S, SH), (40, 40, 40)); out = {}
    for (k, im, lit, part, m) in items:
        x, y = pos[k]; w, h = im.size; atlas.paste(im, (x, y))
        out[k] = dict(uv=[round((x + 1) / S, 6), round(1 - (y + h - 1) / SH, 6), round((x + w - 1) / S, 6), round(1 - (y + 1) / SH, 6)], aspect=round(w / h, 4), lit=bool(lit), part=part, m=m)
    os.makedirs(GEN, exist_ok=True); atlas.save(os.path.join(GEN, 'l118_signs_atlas.jpg'), quality=90)
    json.dump(out, open(os.path.join(GEN, 'l118_signs_atlas.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if preview: atlas.resize((S // 2, SH // 2), Image.LANCZOS).save(preview, quality=88)
    print('l118_signs_atlas', S, SH, len(out)); return out


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
