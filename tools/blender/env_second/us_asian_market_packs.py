"""竹葉亞洲超市（us_asian_market）的包裝印刷貼圖集（SHOP-CC0-HELP-1113 v2；LAWWW2-C 退件第 2、3 點：一樣大小的方塊排格子、頂面一片深色、櫃台上一排白色方塊）。
做法照汀州路東南大聯 v2（tz_shops_interior.py 的包裝貼圖集 pkq）：本作自己畫的包裝圖，不寫字、不像任何品牌（D77）——名字的地方是一條條色塊（假字），沒有商標。
  python3 tools/blender/env_second/us_asian_market_packs.py   → tools/blender/env_second/textures/gen/us_am_packs.png、us_am_promo.png（us_asian_market.py 每次建模都會重畫）
us_am_packs.png（1024×1024，8×8 格，一格 128）：一列一種包裝——0 袋裝泡麵、1 杯麵、2 醬料瓶、3 零食袋、4 盒裝（餅乾、茶包）、5 乾貨（看得到裡面的米粉、香菇、豆子）、6 冷凍水餃包子、7 飲料（一手罐、瓶裝茶）；
  每一格上面 112 px 是正面，最下面 16 px 是同一個顏色調亮的一條（頂面、側面用：LAWWW2「頂面不要深色」）。
us_am_promo.png（1024×1024）：第 0、1 列（各 128 高）＝端架頂上的特價看板 8 塊（256×128，爆炸星＋假價錢＋商品圖）；第 2 列＝整箱泡麵的紙箱正面 8 款（128×128）；
  第 3 列＝紙箱頂面（封箱膠帶）、側面；第 4 列＝櫃台上的糕餅禮盒 4 款頂面（256×128，看得到裡面的圓餅）；第 5 列＝禮盒側面 8 款。"""
import math, os, random
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, 'textures', 'gen')
CW = 128
PAL = [(206, 44, 40), (236, 172, 34), (44, 132, 72), (230, 104, 30), (54, 112, 186), (118, 44, 132), (240, 228, 196), (190, 36, 62), (28, 86, 64), (244, 242, 234), (250, 214, 64), (92, 60, 40)]


def lt(c, k=60): return tuple(min(255, v + k) for v in c)
def dk(c, k=60): return tuple(max(0, v - k) for v in c)


def fake_text(d, R, x0, y0, x1, y1, col, n=None):
    """名字的地方：一條條色塊（假字，不是字）"""
    n = n or R.randint(2, 4); x = x0; w_tot = x1 - x0
    for k in range(n):
        w = w_tot * R.uniform(0.14, 0.26)
        if x + w > x1: break
        d.rectangle([x, y0, x + w, y1], fill=col); x += w + w_tot * R.uniform(0.04, 0.08)


def bowl(d, cx, cy, r, R):
    d.ellipse([cx - r, cy - r * 0.55, cx + r, cy + r * 0.75], fill=(250, 246, 236))
    d.ellipse([cx - r * 0.86, cy - r * 0.5, cx + r * 0.86, cy + r * 0.12], fill=(232, 190, 112))
    for k in range(4): yy = cy - r * 0.35 + k * r * 0.1; d.arc([cx - r * 0.7, yy - 5, cx + r * 0.7, yy + 5], 0, 180, fill=(252, 228, 160), width=2)
    d.ellipse([cx + r * 0.2, cy - r * 0.42, cx + r * 0.48, cy - r * 0.16], fill=(196, 58, 38)); d.ellipse([cx - r * 0.5, cy - r * 0.36, cx - r * 0.24, cy - r * 0.12], fill=(72, 150, 66))
    d.ellipse([cx - r * 0.1, cy - r * 0.46, cx + r * 0.16, cy - r * 0.26], fill=(250, 236, 200))


def cell(kind, c, R):
    im = Image.new('RGB', (CW, CW)); d = ImageDraw.Draw(im); FH = 112
    b = PAL[(c * 5 + {'noodle': 0, 'cup': 3, 'sauce': 1, 'snack': 6, 'box': 2, 'dry': 7, 'frozen': 4, 'drink': 9}[kind]) % len(PAL)]
    a = PAL[(c * 7 + 4) % len(PAL)]
    if a == b: a = PAL[(c * 7 + 5) % len(PAL)]
    side = lt(b, 45)
    d.rectangle([0, 0, CW, FH], fill=b)
    if kind == 'noodle':
        d.rectangle([0, 0, CW, 12], fill=dk(b, 50))
        for k in range(0, CW, 6): d.line([k, 0, k, 11], fill=dk(b, 80), width=1)            # 上緣的壓紋封口
        bowl(d, 66, 76, 38, R); d.rounded_rectangle([12, 18, 116, 42], 6, fill=(250, 248, 240)); fake_text(d, R, 18, 24, 110, 36, dk(a, 20))
        d.ellipse([96, 46, 122, 72], fill=a)
    elif kind == 'cup':
        d.rectangle([0, 0, CW, 20], fill=(246, 244, 236)); d.rectangle([0, 18, CW, 22], fill=dk(b, 40))   # 蓋子
        bowl(d, 64, 72, 34, R); fake_text(d, R, 14, 92, 114, 104, (250, 248, 240)); d.polygon([(0, 22), (22, 22), (0, 50)], fill=a)
    elif kind == 'sauce':
        bg = (58, 54, 50); d.rectangle([0, 0, CW, FH], fill=bg)
        liq = [(70, 34, 18), (176, 40, 26), (196, 136, 40), (52, 96, 44), (40, 24, 14), (150, 30, 30), (210, 170, 70), (90, 50, 24)][c]
        cap = [(206, 44, 40), (236, 200, 60), (40, 120, 60), (230, 230, 226), (206, 44, 40), (40, 40, 40), (44, 132, 72), (236, 172, 34)][c]
        d.rectangle([52, 0, 76, 10], fill=cap); d.rectangle([54, 10, 74, 22], fill=liq); d.polygon([(54, 22), (74, 22), (108, 40), (20, 40)], fill=liq)
        d.rounded_rectangle([18, 38, 110, FH], 8, fill=liq); d.line([30, 46, 30, FH - 6], fill=lt(liq, 70), width=4)    # 瓶身的反光
        lab = [(246, 236, 210), (250, 214, 64), (244, 242, 234), (206, 44, 40), (240, 228, 196), (250, 214, 64), (54, 112, 186), (244, 242, 234)][c]
        d.rectangle([22, 58, 106, 98], fill=lab); d.ellipse([50, 62, 78, 90], fill=dk(lab, 90) if c % 2 else (206, 44, 40)); fake_text(d, R, 28, 66, 48, 72, dk(lab, 110), 1); fake_text(d, R, 82, 82, 102, 88, dk(lab, 110), 1)
        side = lt(liq, 40)
    elif kind == 'snack':
        d.polygon([(0, FH), (0, 70), (CW, 30), (CW, FH)], fill=lt(b, 30)); d.rectangle([0, 0, CW, 9], fill=dk(b, 50))
        for k in range(8): cx, cy = R.uniform(24, 104), R.uniform(64, 100); d.ellipse([cx - 15, cy - 8, cx + 15, cy + 8], fill=(240, 202, 118), outline=(196, 146, 70))
        d.rounded_rectangle([10, 16, 118, 44], 10, fill=(252, 250, 244)); fake_text(d, R, 18, 23, 110, 37, a); d.line([14, 52, 30, 104], fill=lt(b, 90), width=3)
    elif kind == 'box':
        d.rectangle([0, 0, CW, 50], fill=b); d.rectangle([0, 50, CW, FH], fill=lt(b, 70)); d.rectangle([0, 48, CW, 53], fill=(214, 168, 72))
        if c % 2:   # 茶包：雲紋
            for k in range(3): d.arc([10 + k * 34, 64, 50 + k * 34, 98], 180, 360, fill=dk(b, 10), width=3)
            d.ellipse([46, 60, 82, 96], fill=(250, 246, 236)); d.ellipse([54, 70, 74, 90], fill=(120, 150, 70))
        else:       # 餅乾：一疊圓餅
            for k in range(4): d.ellipse([28 + k * 14, 62 + k * 4, 70 + k * 14, 96 + k * 4], fill=(222, 170, 96), outline=(176, 120, 60))
        fake_text(d, R, 12, 14, 116, 30, (250, 248, 240)); fake_text(d, R, 12, 34, 70, 40, lt(b, 90), 2)
    elif kind == 'dry':
        d.rectangle([0, 0, CW, FH], fill=(240, 234, 214)); d.rectangle([0, 0, CW, 26], fill=b); fake_text(d, R, 10, 8, 118, 18, (250, 248, 240))
        d.rounded_rectangle([16, 34, 112, 104], 10, fill=(236, 232, 222))
        if c % 3 == 0:
            for k in range(9): x = 22 + k * 10; d.line([x, 38, x + R.uniform(-6, 6), 100], fill=(252, 250, 242), width=3)     # 米粉
        elif c % 3 == 1:
            for k in range(7): cx, cy = R.uniform(30, 98), R.uniform(46, 94); d.ellipse([cx - 11, cy - 7, cx + 11, cy + 7], fill=(92, 62, 40)); d.arc([cx - 11, cy - 7, cx + 11, cy + 7], 200, 340, fill=(150, 112, 80), width=2)   # 香菇
        else:
            for k in range(40): cx, cy = R.uniform(24, 104), R.uniform(40, 100); d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=[(196, 40, 40), (226, 196, 120), (40, 40, 40)][c % 3 if c < 6 else 0])   # 豆子
        d.rectangle([0, FH - 10, CW, FH], fill=b)
    elif kind == 'frozen':
        top = (54, 112, 186) if c % 2 == 0 else b
        for y in range(FH): t = y / FH; d.line([0, y, CW, y], fill=tuple(int(top[k] * (1 - t * 0.5) + 250 * t * 0.5) for k in range(3)))   # 結霜的漸層
        for k in range(5):   # 水餃（半月形＋摺痕）
            cx, cy = 22 + k * 21, 74 + (k % 2) * 10; d.chord([cx - 14, cy - 12, cx + 14, cy + 14], 180, 360, fill=(248, 244, 232)); d.rectangle([cx - 14, cy, cx + 14, cy + 2], fill=(248, 244, 232))
            for j in range(3): d.line([cx - 8 + j * 7, cy - 9, cx - 6 + j * 7, cy - 3], fill=(200, 190, 170), width=1)
        for k in range(3): d.arc([30 + k * 26, 40, 46 + k * 26, 64], 200, 340, fill=(250, 250, 250), width=2)   # 熱氣
        d.rounded_rectangle([10, 10, 118, 34], 8, fill=(250, 250, 252)); fake_text(d, R, 16, 16, 112, 28, dk(top, 10)); side = lt(top, 60)
    elif kind == 'drink':
        d.rectangle([0, 0, CW, FH], fill=(206, 212, 214))                                   # 收縮膜
        if c < 5:   # 一手三罐
            for k in range(3):
                x0 = 6 + k * 40; d.rectangle([x0, 14, x0 + 36, FH - 4], fill=b); d.rectangle([x0, 14, x0 + 36, 20], fill=(196, 198, 200)); d.rectangle([x0, FH - 10, x0 + 36, FH - 4], fill=(196, 198, 200))
                d.ellipse([x0 + 8, 44, x0 + 28, 64], fill=a); d.line([x0 + 6, 24, x0 + 6, FH - 14], fill=lt(b, 90), width=3); fake_text(d, R, x0 + 4, 72, x0 + 32, 78, (250, 248, 240), 2)
        else:       # 兩瓶茶
            for k in range(2):
                x0 = 12 + k * 54; d.rectangle([x0 + 14, 4, x0 + 30, 14], fill=(240, 240, 236)); d.polygon([(x0 + 12, 14), (x0 + 32, 14), (x0 + 44, 30), (x0, 30)], fill=(196, 150, 70))
                d.rectangle([x0, 30, x0 + 44, FH - 2], fill=(196, 150, 70)); d.rectangle([x0, 50, x0 + 44, 92], fill=b); d.ellipse([x0 + 12, 56, x0 + 32, 76], fill=(250, 246, 236)); fake_text(d, R, x0 + 4, 80, x0 + 40, 86, (250, 248, 240), 2)
        side = (214, 220, 222)
    d.rectangle([0, FH, CW, CW], fill=side)
    return im


KINDS = ('noodle', 'cup', 'sauce', 'snack', 'box', 'dry', 'frozen', 'drink')


def packs(path):
    R = random.Random(20261113); at = Image.new('RGB', (CW * 8, CW * 8))
    for r, kd in enumerate(KINDS):
        for c in range(8): at.paste(cell(kd, c, R), (c * CW, r * CW))
    at.save(path)


def promo(path):
    R = random.Random(1113); at = Image.new('RGB', (1024, 1024), (200, 160, 112)); FD = ImageDraw.Draw(at)
    for k in range(8):   # 端架看板 256×128
        bg = [(236, 172, 34), (206, 44, 40), (250, 214, 64), (28, 86, 64), (206, 44, 40), (236, 172, 34), (54, 112, 186), (190, 36, 62)][k]
        im = Image.new('RGB', (256, 128), bg); d = ImageDraw.Draw(im); acc = (206, 44, 40) if bg[0] > 230 and bg[1] > 150 else (250, 214, 64)
        st = [(66 + (50 if j % 2 == 0 else 30) * math.cos(j * math.pi / 8), 64 + (50 if j % 2 == 0 else 30) * math.sin(j * math.pi / 8)) for j in range(16)]; d.polygon(st, fill=(252, 250, 240))
        for j in range(2): d.rectangle([42, 50 + j * 16, 42 + R.uniform(34, 48), 60 + j * 16], fill=acc if acc != (250, 214, 64) else (190, 30, 30))   # 假價錢
        if k % 3 == 0: bowl(d, 186, 76, 42, R)
        elif k % 3 == 1:
            for j in range(3): d.rounded_rectangle([140 + j * 34, 34 + (j % 2) * 8, 168 + j * 34, 106], 6, fill=PAL[(k + j * 3) % len(PAL)], outline=(250, 248, 240), width=2)
        else:
            for j in range(5): cx = 150 + j * 20; d.ellipse([cx - 14, 60 - (j % 2) * 10, cx + 14, 92 - (j % 2) * 10], fill=(214, 160, 88), outline=(170, 110, 50))   # 一疊月餅
        fake_text(d, R, 134, 12, 246, 26, (252, 250, 240) if bg[0] < 230 or bg[1] < 150 else (150, 24, 24)); d.rectangle([0, 116, 256, 128], fill=(28, 86, 64) if bg != (28, 86, 64) else (236, 172, 34))
        d.rectangle([0, 0, 255, 127], outline=dk(bg, 60), width=3)
        at.paste(im, ((k % 4) * 256, (k // 4) * 128))
    for k in range(8):   # 整箱泡麵紙箱：牛皮紙＋印刷的色塊、碗
        im = Image.new('RGB', (128, 128), (198, 160, 112)); d = ImageDraw.Draw(im); b = PAL[(k * 5 + 1) % len(PAL)]
        for y in range(0, 128, 3): d.line([0, y, 128, y], fill=(190 + R.randint(-4, 4), 152 + R.randint(-4, 4), 106), width=1)   # 瓦楞的細紋
        d.rectangle([0, 18, 128, 46], fill=b); fake_text(d, R, 8, 24, 120, 40, (250, 248, 240)); bowl(d, 64, 84, 32, R); d.rectangle([0, 120, 128, 128], fill=b)
        at.paste(im, (k * 128, 256))
    for k in range(8):   # 紙箱頂面（封箱膠帶）／側面
        im = Image.new('RGB', (128, 128), (200, 162, 114)); d = ImageDraw.Draw(im)
        for y in range(0, 128, 3): d.line([0, y, 128, y], fill=(192 + R.randint(-4, 4), 154 + R.randint(-4, 4), 108), width=1)
        if k < 4: d.rectangle([52, 0, 76, 128], fill=(214, 186, 140)); d.line([0, 64, 128, 64], fill=(150, 116, 80), width=2)
        else: b = PAL[(k * 3) % len(PAL)]; d.rectangle([0, 96, 128, 120], fill=b); fake_text(d, R, 10, 102, 118, 114, (250, 248, 240))
        at.paste(im, (k * 128, 384))
    for k in range(4):   # 糕餅禮盒頂面 256×128：金邊、中間透明窗看得到一排圓餅
        bg = [(176, 34, 38), (244, 232, 204), (28, 86, 64), (196, 120, 40)][k]; im = Image.new('RGB', (256, 128), bg); d = ImageDraw.Draw(im); gold = (214, 168, 72)
        d.rectangle([4, 4, 251, 123], outline=gold, width=5)
        for j in range(0, 256, 16): d.rectangle([j, 0, j + 8, 3], fill=gold); d.rectangle([j, 124, j + 8, 128], fill=gold)
        d.rounded_rectangle([40, 28, 216, 100], 14, fill=(232, 228, 216))
        for j in range(4): cx = 64 + j * 42; d.ellipse([cx - 17, 46, cx + 17, 82], fill=(206, 146, 74), outline=(160, 98, 40), width=2); d.ellipse([cx - 8, 56, cx + 8, 72], outline=(236, 196, 120), width=2)
        d.ellipse([10, 44, 34, 84], fill=gold); d.ellipse([222, 44, 246, 84], fill=gold)
        at.paste(im, ((k % 4) * 256, 512))
    for k in range(8):   # 禮盒側面
        bg = [(176, 34, 38), (244, 232, 204), (28, 86, 64), (196, 120, 40)][k % 4]; im = Image.new('RGB', (128, 128), bg); d = ImageDraw.Draw(im)
        d.rectangle([0, 40, 128, 88], fill=(214, 168, 72)); d.rectangle([0, 52, 128, 76], fill=bg)
        at.paste(im, (k * 128, 640))
    at.save(path)


def all_tex():
    os.makedirs(GEN, exist_ok=True); packs(os.path.join(GEN, 'us_am_packs.png')); promo(os.path.join(GEN, 'us_am_promo.png'))


if __name__ == '__main__':
    all_tex(); print('ok')
