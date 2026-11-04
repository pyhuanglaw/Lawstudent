"""慢輪單車（公館 G06，原名輪轉單車）室內的自製貼圖（CC，帳號 A 的建模子代理，2026-11-04；照參考圖 gongguan_bike_int 做）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/bike_tex.py [--preview <輸出.jpg>]
輸出到 tools/blender/env_second/textures/gen/：
  bike_alpha.png  透明貼圖集（2048×1024）：輻條輪（36 根、20 根兩種）、車籃鐵絲網、黃金葛葉片 4 種、壁掛的鐵網
  bike_goods.png  印刷圖集（2048²）：維修價目表（黑板，粉筆字）、單車路線圖、復古單車構造海報、黑白街景照、騎車老照片、單車線稿、
                  拍立得照片、洞洞板＋扳手（工作區後牆）、紙箱（麥克筆字）、零件包裝、吊卡（車燈、車鈴、鎖）、資料夾／書背、
                  小零件抽屜、工具車抽屜、型錄、手寫紙條（新台幣）、車價卡、櫃台面板（使用痕跡）
  bike_emit.png   會亮的（1024×512）：日光燈管、吊燈燈泡、櫃台螢幕、檯燈
  bike_sign.png   招牌「慢輪單車」（2048×768：上面 2048×384＝天花板吊的大招牌 5.33:1；下面 1229×384＝櫃台正面的小招牌 3.2:1）
  bike_floor.png  地板（1024²＝1.2 m：60 cm 灰色水泥磚 2×2，每片色差、磚縫、輪胎痕、鞋底磨痕）
  bike_atlas.json 每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上）
全部是程式畫的；字用系統的文泉驛正黑（wqy-zenhei，GPL＋字型例外：嵌進圖片可以）。店名「慢輪單車」虛構；沒有任何真實品牌、標誌（D77：自行車品牌一律不放）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(646)
ATL = {}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
GREEN, CREAM = '#2c4436', '#efe4c8'   # 招牌的深綠、米白（參考圖取色：招牌底 #2e4538 一帶、字 #eadfc2）


def font(px): return ImageFont.truetype(FONT, int(px))


def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def uvbox(name, px0, py0, px1, py1, size):
    W, H = size; ATL[name] = [px0 / W, 1 - py1 / H, px1 / W, 1 - py0 / H]


def noise(w, h, k=8, amp=10, rng=R):
    n = rng.normal(0, 1, (h // k + 2, w // k + 2)); im = Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * 2 * amp


def grain(im, amp=6, k=6):
    a = np.asarray(im.convert('RGB'), np.float32); n = noise(im.size[0], im.size[1], k, amp)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def text_c(d, xy, s, f, fill, anchor='mm', stroke=0, sfill=None):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=sfill or fill)


def vignette(im, k=0.25):
    """邊角變深（舊紙、舊板子）"""
    a = np.asarray(im.convert('RGB'), np.float32); h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]; r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= (1 - k * np.clip(r - 0.55, 0, 1) ** 1.5)[..., None]; return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def hand(d, x, y, s, f, col, rr, jit=2.0):
    """手寫的一行字（每個字稍微歪）"""
    for ch in s:
        d.text((x, y + rr.uniform(-jit, jit)), ch, font=f, fill=col, anchor='lm', stroke_width=1, stroke_fill=col); x += f.getlength(ch) * rr.uniform(0.95, 1.05)
    return x


def bike_line(d, ox, oy, s, col, wd=3, kind='city'):
    """單車線稿（海報、黑板、小招牌用）：兩個輪子＋車架；s＝輪距的一半"""
    r = s * 0.62
    for cx in (ox - s, ox + s): d.ellipse([cx - r, oy - r, cx + r, oy + r], outline=col, width=wd)
    bb = (ox - s * 0.1, oy); st = (ox - s * 0.35, oy - s * 0.95); ht = (ox + s * 0.62, oy - s * 0.9)
    if kind == 'lady':
        d.line([(ox - s, oy), bb, st, (ox - s, oy)], fill=col, width=wd); d.line([bb, (ox + s * 0.55, oy - s * 0.7)], fill=col, width=wd)
    else:
        d.line([(ox - s, oy), bb, st, (ox - s, oy)], fill=col, width=wd); d.line([bb, ht, st], fill=col, width=wd)
    d.line([ht, (ox + s, oy)], fill=col, width=wd); d.line([ht, (ht[0] - s * 0.05, ht[1] - s * 0.2), (ht[0] + s * 0.2, ht[1] - s * 0.25)], fill=col, width=wd)
    d.line([st, (st[0] - s * 0.05, st[1] - s * 0.15)], fill=col, width=wd); d.line([(st[0] - s * 0.2, st[1] - s * 0.16), (st[0] + s * 0.12, st[1] - s * 0.16)], fill=col, width=wd + 1)
    d.ellipse([bb[0] - s * 0.12, bb[1] - s * 0.12, bb[0] + s * 0.12, bb[1] + s * 0.12], outline=col, width=wd)


def wheel_icon(d, cx, cy, r, col, wd=5):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=wd); d.ellipse([cx - r * 0.86, cy - r * 0.86, cx + r * 0.86, cy + r * 0.86], outline=col, width=max(2, wd // 2))
    for k in range(16):
        a = 2 * math.pi * k / 16; d.line([cx + r * 0.1 * math.cos(a), cy + r * 0.1 * math.sin(a), cx + r * 0.85 * math.cos(a + 0.2), cy + r * 0.85 * math.sin(a + 0.2)], fill=col, width=max(1, wd // 3))
    d.ellipse([cx - r * 0.12, cy - r * 0.12, cx + r * 0.12, cy + r * 0.12], fill=col)


# ======================= 1. 透明貼圖集（2048×1024） =======================
AW, AH = 2048, 1024
A = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); d = ImageDraw.Draw(A)


def spokes(x0, n, hubcol='#b9bcbf'):
    """輻條輪（一張 512² 的圓：輻條＋花鼓；輪框、輪胎是幾何）：輻條交叉編（切線），兩側各一半"""
    c = Image.new('RGBA', (512, 512), (0, 0, 0, 0)); cd = ImageDraw.Draw(c); C = 256
    for k in range(n):
        a = 2 * math.pi * k / n; off = 0.32 if k % 2 else -0.32
        hx_, hy_ = C + 22 * math.cos(a), C + 22 * math.sin(a); rx, ry = C + 250 * math.cos(a + off), C + 250 * math.sin(a + off)
        cd.line([hx_, hy_, rx, ry], fill=hx('#c4c7ca' if k % 3 else '#a9adb1'), width=3)
    cd.ellipse([C - 30, C - 30, C + 30, C + 30], fill=hx(hubcol)); cd.ellipse([C - 12, C - 12, C + 12, C + 12], fill=hx('#5a5d60'))
    A.paste(c, (x0, 0)); uvbox(f'spokes{n}', x0, 0, x0 + 512, 512, (AW, AH))


spokes(0, 36); spokes(512, 20, '#3a3c3e')
# 車籃（鐵絲方格；參考圖：米白、淺綠車上的方形鐵絲籃，籃口一圈粗的）
bk = Image.new('RGBA', (512, 256), (0, 0, 0, 0)); bd = ImageDraw.Draw(bk)
for i in range(0, 512, 26): bd.line([i, 0, i, 255], fill=hx('#c9c9c4'), width=4)
for j in range(10, 256, 30): bd.line([0, j, 511, j], fill=hx('#b9bab5'), width=4)
bd.rectangle([0, 0, 511, 10], fill=hx('#d6d6d1')); bd.rectangle([0, 246, 511, 255], fill=hx('#a9aaa5'))
A.paste(bk, (1024, 0)); uvbox('basket', 1024, 0, 1536, 256, (AW, AH))
# 壁掛的黑色鐵網（右牆層架後面）
gm = Image.new('RGBA', (512, 256), (0, 0, 0, 0)); gd = ImageDraw.Draw(gm)
for i in range(0, 512, 32): gd.line([i, 0, i, 255], fill=hx('#2b2d2e'), width=5)
for j in range(0, 256, 32): gd.line([0, j, 511, j], fill=hx('#2b2d2e'), width=5)
A.paste(gm, (1536, 0)); uvbox('mesh', 1536, 0, 2048, 256, (AW, AH))
# 黃金葛葉片（心形、黃斑；4 種）
for k in range(4):
    lx = 1024 + k * 192; leaf = Image.new('RGBA', (192, 256), (0, 0, 0, 0)); ld = ImageDraw.Draw(leaf)
    g = ['#3f6f30', '#4d7d36', '#5a8a3c', '#3a6230'][k]
    ld.polygon([(96, 250), (20, 120), (24, 60), (60, 22), (96, 52), (132, 22), (168, 60), (172, 120)], fill=hx(g))
    la = np.asarray(leaf, np.float32); mk = la[..., 3] > 0
    n_ = noise(192, 256, 10, 40, np.random.default_rng(k)); yel = (n_ > 18) & mk
    la[yel, 0] += 70; la[yel, 1] += 55; la[yel, 2] += 5; la[mk, :3] += noise(192, 256, 4, 8)[mk][:, None]
    leaf = Image.fromarray(np.clip(la, 0, 255).astype(np.uint8)); ld = ImageDraw.Draw(leaf)
    ld.line([96, 250, 96, 50], fill=hx('#9ab060'), width=3)
    for t in range(3): ld.line([96, 200 - t * 45, 40 + t * 8, 140 - t * 40], fill=hx('#8aa45a'), width=2); ld.line([96, 200 - t * 45, 152 - t * 8, 140 - t * 40], fill=hx('#8aa45a'), width=2)
    A.paste(leaf, (lx, 256)); uvbox(f'leaf{k}', lx, 256, lx + 192, 512, (AW, AH))
# 吊扇的扇葉（深木色，一片）
fb = Image.new('RGBA', (512, 128), (0, 0, 0, 0)); fd = ImageDraw.Draw(fb)
fd.rounded_rectangle([40, 24, 506, 104], radius=36, fill=hx('#4a3426')); fd.rectangle([0, 52, 60, 76], fill=hx('#2a2a2a'))
fa = np.asarray(fb, np.float32); m_ = fa[..., 3] > 0; fa[m_, :3] += noise(512, 128, 3, 10)[m_][:, None]; fb = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8))
A.paste(fb, (0, 512)); uvbox('blade', 0, 512, 512, 640, (AW, AH))
A.save(os.path.join(GEN, 'bike_alpha.png'))

# ======================= 2. 印刷圖集（2048²） =======================
GW = 2048
G = Image.new('RGB', (GW, GW), hx('#d8d2c4')[:3])


def cell(name, x0, y0, w, h, draw):
    im = Image.new('RGB', (w, h), (200, 200, 200)); draw(im, ImageDraw.Draw(im)); G.paste(im, (x0, y0))
    uvbox(name, x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, (GW, GW))


def chalk(im, d):
    """維修價目表（黑板：深綠、粉筆字；參考圖左後的那塊）"""
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#26362c')[:3]); base = grain(base, 7, 3)
    a = np.asarray(base, np.float32); a += noise(w, h, 40, 10)[..., None] * np.array([0.9, 1.0, 0.9]); im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    rr = np.random.default_rng(7); ch = (232, 228, 214)
    text_c(d, (w / 2, 62), '維修價目表', font(54), ch, stroke=1); d.line([60, 100, w - 60, 100], fill=(210, 206, 192), width=2)
    rows = [('基本檢查', '免費'), ('打氣', '免費'), ('補胎', '100'), ('煞車調整', '300'), ('變速調整', '300'), ('內胎更換', '250'), ('輪胎更換', '500起'), ('鏈條清潔潤滑', '400'), ('全車保養', '1,200')]
    f = font(34)
    for i, (k, v) in enumerate(rows):
        y = 140 + i * 54; hand(d, 46, y, k, f, ch, rr, 1.5); tw = f.getlength(v); hand(d, w - 46 - tw, y, v, f, ch, rr, 1.5)
        for xx in range(int(48 + f.getlength(k) + 12), int(w - 60 - tw), 14): d.ellipse([xx, y + 8, xx + 3, y + 11], fill=(150, 156, 146))
    text_c(d, (w / 2, h - 40), '（新台幣・現金/行動支付）', font(22), (190, 194, 180))
    a = np.asarray(im, np.float32); a += noise(w, h, 2, 6)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def routemap(im, d):
    """單車路線圖（米色紙、淡藍的河、綠色路線；全部虛構）"""
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#e8dcc2')[:3]); im.paste(vignette(grain(base, 6, 6), 0.3)); d = ImageDraw.Draw(im)
    text_c(d, (w / 2, 40), '單車路線圖', font(40), hx('#2b3a30')); bike_line(d, w - 60, 40, 18, hx('#2b3a30'), 2)
    d.rectangle([24, 74, w - 24, h * 0.72], outline=hx('#6b6a5a'), width=2)
    pts = [(24, 160), (120, 190), (200, 260), (260, 250), (330, 330), (w - 24, 380)]
    d.line(pts, fill=hx('#9cc3d6'), width=26); d.line(pts, fill=hx('#b7d3df'), width=14)
    for k in range(9): d.line([(40 + k * 45, 80), (20 + k * 50, h * 0.72)], fill=hx('#d4c8ac'), width=2)
    d.line([(60, 120), (150, 150), (230, 210), (300, 300), (380, 340)], fill=hx('#3c7a4a'), width=6)
    d.line([(60, 400), (140, 330), (220, 300), (330, 250)], fill=hx('#c8642c'), width=5)
    d.line([(100, 110), (110, 260), (180, 420)], fill=hx('#2f5f8a'), width=5)
    for p in ((150, 150), (300, 300), (140, 330)): d.ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], fill=hx('#f2efe6'), outline=hx('#333333'), width=2)
    f = font(26)
    for i, (c, s) in enumerate((('#3c7a4a', '河濱綠廊線'), ('#c8642c', '校園通勤線'), ('#2f5f8a', '帝大生活線'))):
        y = h * 0.72 + 40 + i * 40; d.line([50, y, 100, y], fill=hx(c), width=6); d.text((116, y), s, font=f, fill=hx('#2b3a30'), anchor='lm')


def anatomy(im, d):
    """復古單車構造海報（左牆最前面那張：米黃紙、單車線稿、零件小圖）"""
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#e4d6b6')[:3]); im.paste(vignette(grain(base, 7, 5), 0.4)); d = ImageDraw.Draw(im)
    col = hx('#3a3328'); d.rectangle([14, 14, w - 14, h - 14], outline=col, width=3)
    text_c(d, (w / 2, 54), '自轉車的構造', font(34), col)
    bike_line(d, w / 2, 220, 100, col, 4)
    for i, (x, y) in enumerate(((90, 380), (w / 2, 380), (w - 90, 380))):
        bike_line(d, x, y, 34, col, 2, 'lady' if i == 1 else 'city')
    for i, s in enumerate(('車架', '前叉', '曲柄', '花鼓', '輻條', '鏈條')): d.text((40 + (i % 3) * 110, 450 + (i // 3) * 30), '・' + s, font=font(22), fill=col)


def photo_bw(seed, kind):
    def f(im, d):
        w, h = im.size; rr = np.random.default_rng(seed); base = np.full((h, w), 150.0)
        yy = np.mgrid[0:h, 0:w][0] / h; base = base + 50 * (0.5 - yy)
        a = base + noise(w, h, 3, 18, rr)
        im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGB')); d = ImageDraw.Draw(im)
        if kind == 'street':   # 老街：兩側騎樓、中間的路、遠處的人
            d.polygon([(0, 0), (w * 0.35, h * 0.42), (w * 0.35, h * 0.7), (0, h)], fill=(70, 70, 70)); d.polygon([(w, 0), (w * 0.62, h * 0.42), (w * 0.62, h * 0.7), (w, h)], fill=(85, 85, 85))
            for k in range(6): x = w * 0.08 * k; d.line([x, h * 0.05 * k, x, h - h * 0.05 * k], fill=(40, 40, 40), width=6)
            for k in range(5): x = w * (0.4 + 0.045 * k); d.rectangle([x, h * 0.55, x + 6, h * 0.66], fill=(30, 30, 30)); d.ellipse([x - 1, h * 0.52, x + 7, h * 0.56], fill=(30, 30, 30))
            bike_line(d, w * 0.5, h * 0.82, 30, (30, 30, 30), 3)
        else:                  # 騎車的人（側面）
            bike_line(d, w * 0.5, h * 0.72, w * 0.25, (30, 30, 30), 5)
            d.ellipse([w * 0.4, h * 0.2, w * 0.5, h * 0.3], fill=(30, 30, 30)); d.line([w * 0.45, h * 0.3, w * 0.42, h * 0.5], fill=(30, 30, 30), width=14)
            d.line([w * 0.42, h * 0.5, w * 0.55, h * 0.62], fill=(30, 30, 30), width=10); d.line([w * 0.45, h * 0.33, w * 0.6, h * 0.42], fill=(30, 30, 30), width=8)
        im2 = vignette(im, 0.5); a = np.asarray(im2, np.float32) * np.array([1.0, 0.97, 0.9]); im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
        d = ImageDraw.Draw(im); d.rectangle([0, 0, w - 1, h - 1], outline=(232, 226, 210), width=14)
    return f


def lineart(im, d):
    w, h = im.size; im.paste(vignette(grain(Image.new('RGB', (w, h), hx('#ece4d0')[:3]), 5, 6), 0.3)); d = ImageDraw.Draw(im)
    bike_line(d, w / 2, h * 0.58, w * 0.3, hx('#2b2b2b'), 4); d.text((w * 0.1, h * 0.88), 'no.07', font=font(20), fill=hx('#555555'))


def snaps(im, d):
    """拍立得照片四張（老闆和客人的車，抽象）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#5a4a38'))
    rr = np.random.default_rng(3)
    for k in range(4):
        x0, y0 = (k % 2) * w // 2 + 6, (k // 2) * h // 2 + 6; ww, hh = w // 2 - 12, h // 2 - 12
        d.rectangle([x0, y0, x0 + ww, y0 + hh], fill=hx('#f1ede2'))
        col = [hx('#7aa0b8'), hx('#a8b878'), hx('#d0a070'), hx('#9a8aa0')][k]; d.rectangle([x0 + 8, y0 + 8, x0 + ww - 8, y0 + hh - 34], fill=col)
        bike_line(d, x0 + ww / 2, y0 + hh * 0.55, ww * 0.18, (40, 40, 40), 2)


def pegboard(im, d):
    """工作區後牆的洞洞板＋掛著的扳手、鉗子、螺絲起子（參考圖中後：咖啡色板子、一排一排銀色扳手）"""
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#7a5434')[:3]); im.paste(grain(base, 8, 4)); d = ImageDraw.Draw(im)
    for i in range(10, w, 20):
        for j in range(10, h, 20): d.ellipse([i - 3, j - 3, i + 3, j + 3], fill=hx('#3a2818'))
    d.rectangle([0, 0, w - 1, h - 1], outline=hx('#4a3220'), width=8)
    rr = np.random.default_rng(11)

    def tool(x, y, L, kind):
        sh = 5   # 影子（往右下）
        for off, col, wd in ((sh, (58, 40, 26), 0), (0, (196, 198, 200), 0)):
            xx, yy = x + off, y + off
            if kind == 'wrench':
                d.line([xx, yy, xx, yy + L], fill=col, width=9); d.ellipse([xx - 11, yy - 12, xx + 11, yy + 10], fill=col); d.ellipse([xx - 9, yy + L - 6, xx + 9, yy + L + 12], fill=col)
                if off == 0: d.ellipse([xx - 4, yy - 14, xx + 4, yy - 2], fill=hx('#7a5434')); d.line([xx - 2, yy + 8, xx - 2, yy + L - 8], fill=(232, 234, 236), width=2)
            elif kind == 'driver':
                d.line([xx, yy, xx, yy + L * 0.4], fill=(178, 40, 36) if off == 0 else col, width=14); d.line([xx, yy + L * 0.4, xx, yy + L], fill=col, width=4)
            else:   # 鉗子
                d.line([xx - 8, yy, xx - 2, yy + L * 0.55], fill=(40, 70, 140) if off == 0 else col, width=8); d.line([xx + 8, yy, xx + 2, yy + L * 0.55], fill=(40, 70, 140) if off == 0 else col, width=8)
                d.polygon([(xx - 4, yy + L * 0.55), (xx + 4, yy + L * 0.55), (xx + 1, yy + L), (xx - 1, yy + L)], fill=col)
        d.ellipse([x - 3, y - 18, x + 3, y - 12], fill=(160, 160, 160))   # 掛勾
    for row in range(2):
        y0 = 40 + row * 250
        for k in range(14):
            x = 40 + k * (w - 80) / 13; L = 120 + 60 * math.sin(k * 0.45) + rr.uniform(-10, 10)
            tool(x, y0, L, 'wrench' if (k + row) % 5 not in (2, 4) else ('driver' if k % 2 else 'plier'))
    d.rectangle([30, h - 70, w - 30, h - 40], fill=hx('#5a3c24'))


def kraft(note):
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), hx('#b08a5c')[:3]); base = grain(base, 9, 5); im.paste(base); d = ImageDraw.Draw(im)
        d.rectangle([w // 2 - 22, 0, w // 2 + 22, h], fill=hx('#c4a679')); d.rectangle([0, 0, w - 1, h - 1], outline=hx('#8e6a40'), width=4)
        rr = np.random.default_rng(len(note) * 7)
        if note: hand(d, w * 0.12, h * 0.62, note, font(h * 0.14), hx('#2a2a2a'), rr, 3)
        d.rectangle([w * 0.62, h * 0.1, w * 0.92, h * 0.3], fill=hx('#efe9dc'))
        for k in range(3): d.line([w * 0.65, h * (0.14 + k * 0.05), w * 0.88, h * (0.14 + k * 0.05)], fill=hx('#555555'), width=2)
    return f


def pack(base_, accent, label, pic):
    """零件包裝盒（自製、無品牌：底色＋色帶＋中文品名＋簡圖）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx(base_)); d.polygon([(0, h * 0.62), (w, h * 0.45), (w, h * 0.6), (0, h * 0.78)], fill=hx(accent))
        text_c(d, (w / 2, h * 0.2), label, font(h * 0.14), hx('#1d1d1d' if base_ in ('#ecebe6', '#f0d23a', '#e8e2d0') else '#f4f1e8'))
        c = hx('#2a2a2a' if base_ in ('#ecebe6', '#f0d23a', '#e8e2d0') else '#f4f1e8')
        if pic == 'tire': d.ellipse([w * 0.3, h * 0.32, w * 0.7, h * 0.72], outline=c, width=10)
        elif pic == 'chain':
            for k in range(6): d.ellipse([w * (0.15 + k * 0.12), h * 0.45, w * (0.27 + k * 0.12), h * 0.55], outline=c, width=4)
        elif pic == 'light': d.rounded_rectangle([w * 0.35, h * 0.35, w * 0.65, h * 0.6], radius=10, outline=c, width=6); d.ellipse([w * 0.42, h * 0.4, w * 0.58, h * 0.55], fill=c)
        else: d.rectangle([w * 0.3, h * 0.38, w * 0.7, h * 0.5], fill=c)
        d.rectangle([0, 0, w - 1, h - 1], outline=tuple(int(v * 0.8) for v in hx(base_)[:3]), width=3)
    return f


def blister(label, col, item):
    """吊卡（掛在層架掛勾上的：上面掛孔、透明泡殼裡的車燈、車鈴、鎖）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f1efe8')); d.rectangle([0, 0, w, h * 0.22], fill=hx(col)); d.ellipse([w / 2 - 10, 10, w / 2 + 10, 28], fill=hx('#7a7a7a'))
        text_c(d, (w / 2, h * 0.3), label, font(w * 0.16), hx('#1d1d1d'))
        d.rounded_rectangle([w * 0.15, h * 0.4, w * 0.85, h * 0.9], radius=18, fill=hx('#dfe3e5'))
        if item == 'bell': d.ellipse([w * 0.3, h * 0.48, w * 0.7, h * 0.82], fill=hx('#c4c7ca')); d.ellipse([w * 0.38, h * 0.54, w * 0.52, h * 0.64], fill=hx('#f4f4f4'))
        elif item == 'light': d.rounded_rectangle([w * 0.32, h * 0.5, w * 0.68, h * 0.8], radius=12, fill=hx('#2a2a2a')); d.ellipse([w * 0.4, h * 0.56, w * 0.6, h * 0.74], fill=hx('#f4f0d0' if col != '#c8202a' else '#d83a3a'))
        else: d.arc([w * 0.3, h * 0.42, w * 0.7, h * 0.8], 180, 360, fill=hx('#2a2a2a'), width=10); d.rectangle([w * 0.28, h * 0.62, w * 0.72, h * 0.72], fill=hx('#2a2a2a'))
        text_c(d, (w / 2, h * 0.95), {'bell': '$120', 'light': '$350', 'lock': '$680'}[item], font(w * 0.13), hx('#c8202a'))
    return f


def spines(im, d):
    """資料夾、書背、型錄（左牆低櫃）"""
    cols = ['#2f4f8a', '#c8c3b5', '#6a4a30', '#2f6a4a', '#d8c35a', '#3a3a3a', '#8a3a30', '#c8c3b5', '#2f4f8a', '#4a6a5a', '#b8a888', '#3a3a3a']
    w, h = im.size; x = 0; rr = np.random.default_rng(9)
    for k, c in enumerate(cols):
        ww = int(rr.uniform(0.06, 0.11) * w); d.rectangle([x, 0, x + ww - 1, h], fill=hx(c))
        if k % 3 == 0: d.rectangle([x + 5, 28, x + ww - 6, 80], fill=hx('#f2efe6'))
        else: d.rectangle([x, h * 0.15, x + ww, h * 0.18], fill=hx('#d8c890')); d.rectangle([x, h * 0.8, x + ww, h * 0.83], fill=hx('#d8c890'))
        d.line([x, 0, x, h], fill=hx('#1a1a1a'), width=1); x += ww
        if x > w: break
    if x < w: d.rectangle([x, 0, w, h], fill=hx('#3a2e22'))


def drawers(im, d):
    """小零件抽屜（8×6 格、白色標籤：螺絲、培林、煞車皮……）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#4b5450'))
    labs = ['螺絲', '培林', '煞車皮', '氣嘴', '鋼索', '管束', '墊片', '螺帽']
    for i in range(6):
        for j in range(4):
            x0, y0 = i * w / 6 + 4, j * h / 4 + 4; d.rectangle([x0, y0, x0 + w / 6 - 8, y0 + h / 4 - 8], fill=hx('#6c7570'))
            d.rectangle([x0 + 6, y0 + 8, x0 + w / 6 - 14, y0 + 26], fill=hx('#ece8dc')); d.text((x0 + 9, y0 + 17), labs[(i + j * 2) % 8], font=font(13), fill=hx('#333333'), anchor='lm')
            d.rounded_rectangle([x0 + w / 12 - 12, y0 + h / 4 - 30, x0 + w / 12 + 4, y0 + h / 4 - 20], radius=4, fill=hx('#2a2a2a'))


def toolchest(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#5d6266'))
    for j in range(6):
        y0 = j * h / 6 + 3; d.rectangle([4, y0, w - 4, y0 + h / 6 - 6], fill=hx('#777c80')); d.rectangle([w * 0.2, y0 + 8, w * 0.8, y0 + 16], fill=hx('#b9bcbf'))
    a = np.asarray(im, np.float32); a[int(h * 0.7):] *= 0.92; im.paste(Image.fromarray(np.clip(a + noise(w, h, 4, 5)[..., None], 0, 255).astype(np.uint8)))


def catalog(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f0ebe0')); d.rectangle([0, 0, w, h * 0.12], fill=hx(GREEN))
    text_c(d, (w / 2, h * 0.06), '慢輪單車 車款型錄', font(w * 0.08), hx(CREAM)); bike_line(d, w / 2, h * 0.5, w * 0.22, hx('#2c4436'), 3)
    for k in range(4): d.line([w * 0.12, h * (0.74 + k * 0.05), w * 0.88, h * (0.74 + k * 0.05)], fill=hx('#9a958a'), width=3)


def openbook(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f2ede0')); d.line([w / 2, 0, w / 2, h], fill=hx('#b8b0a0'), width=4)
    for side in (0, 1):
        x0 = side * w / 2 + 16
        for k in range(12): d.line([x0, 20 + k * (h - 40) / 12, x0 + w / 2 - 32 - (k % 3) * 10, 20 + k * (h - 40) / 12], fill=hx('#8a857a'), width=2)
    bike_line(d, w * 0.75, h * 0.45, w * 0.08, hx('#4a4a4a'), 2)


def note(lines, col='#23305a', paper='#f4efdf', red=None):
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), hx(paper)[:3]); a = np.asarray(grain(base, 6, 6), np.float32)
        a *= (1 - 0.06 * np.linspace(0, 1, h)[:, None])[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
        rr = np.random.default_rng(abs(hash(''.join(lines))) % 9999); n = len(lines); lh = h / (n + 0.6)
        for i, s in enumerate(lines):
            f_ = font(min(w / (len(s) + 1.2), lh * 0.7) * (1.08 if i == 0 else 0.95)); c = hx(red if (red and i == n - 1) else col)
            tw = f_.getlength(s); hand(d, (w - tw) / 2, lh * (i + 0.8), s, f_, c, rr)
        d.rectangle([w // 2 - 30, 0, w // 2 + 30, 12], fill=(236, 232, 214))
    return f


def price(name, p, extra):
    """車價卡（掛在展示車把手上：白卡、深綠邊、新台幣）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f6f2e6')); d.rectangle([4, 4, w - 5, h - 5], outline=hx(GREEN), width=6)
        text_c(d, (w / 2, h * 0.27), name, font(h * 0.2), hx('#2a2a2a')); text_c(d, (w / 2, h * 0.58), 'NT$' + p, font(h * 0.24), hx('#b8302c'))
        text_c(d, (w / 2, h * 0.84), extra, font(h * 0.12), hx('#555555'))
    return f


def counter_face(im, d):
    """櫃台客人那一面的木板（直條拼板＋直的木紋、下緣踢黑、邊角磨白；參考圖：淺色松木直條板）"""
    w, h = im.size; rr = np.random.default_rng(31)
    a = np.zeros((h, w, 3), np.float32); base = np.array(hx('#c79b6c')[:3], np.float32)
    for k in range(0, w, 48):
        a[:, k:k + 48] = base * rr.uniform(0.92, 1.06)
    g_ = rr.normal(0, 1, (1, w)); g_ = np.repeat(g_, h, 0); a += (np.asarray(Image.fromarray(((g_ - g_.min()) / np.ptp(g_) * 255).astype(np.uint8)).resize((w, h)), np.float32)[..., None] / 255 - 0.5) * 18
    a += noise(w, h, 2, 4)[..., None]
    for k in range(0, w, 48): a[:, k:k + 3] *= 0.7; a[:, k + 3:k + 4] *= 1.08   # 板縫
    yy = np.linspace(0, 1, h)[:, None]; a *= (1 - 0.3 * np.clip((yy - 0.86) / 0.14, 0, 1))[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def tirebox(im, d):
    """紙箱（內胎、外胎），麥克筆字"""
    kraft('內胎 700C')(im, d)


# 版面（x0, y0, w, h）
cell('chalk', 0, 0, 512, 720, chalk)
cell('routemap', 512, 0, 448, 640, routemap)
cell('anatomy', 960, 0, 384, 560, anatomy)
cell('photo_street', 1344, 0, 512, 360, photo_bw(1, 'street'))
cell('photo_rider', 1344, 360, 352, 440, photo_bw(2, 'rider'))
cell('lineart', 1696, 360, 352, 440, lineart)
cell('snaps', 960, 560, 384, 288, snaps)
cell('pegboard', 0, 720, 1024, 512, pegboard)
for i, nt in enumerate(('內胎 700C', '煞車皮', '外胎 26"', '鏈條', '二手零件', '', '坐墊', '燈')):
    cell(f'kraft{i}', 1024 + (i % 4) * 256, 848 + (i // 4) * 192, 256, 192, kraft(nt))
PACKS = [('#ecebe6', '#3a3a3a', '內胎', 'tire'), ('#2a2b2d', '#c9b98e', '鏈條', 'chain'), ('#e8e2d0', '#2c4436', '車燈', 'light'), ('#3a3a3a', '#b8302c', '煞車皮', 'pad'),
         ('#2c4436', '#e8e2d0', '外胎', 'tire'), ('#e8e2d0', '#6b4a30', '踏板', 'pad'), ('#2a2b2d', '#d8c35a', '潤滑油', 'pad'), ('#ecebe6', '#2f4f8a', '水壺架', 'pad')]   # 參考圖右牆的包裝大多是黑、白、灰
for i, p in enumerate(PACKS): cell(f'pack{i}', (i % 8) * 192, 1232, 192, 192, pack(*p))
for i, b in enumerate((('車鈴', '#2f6fb8', 'bell'), ('前燈', '#f0d23a', 'light'), ('後燈', '#c8202a', 'light'), ('U 型鎖', '#2a2a2a', 'lock'))):
    cell(f'blister{i}', 1536 + (i % 2) * 256, 1232 + (i // 2) * 320, 256, 320, blister(*b))
cell('spines', 0, 1424, 768, 224, spines)
cell('drawers', 768, 1424, 384, 224, drawers)
cell('catalog', 1152, 1424, 192, 256, catalog)
cell('toolchest', 1344, 1424, 192, 384, toolchest)
cell('openbook', 0, 1648, 384, 192, openbook)
NOTES = [('note_pump', ['打氣免費', '請自取'], None), ('note_patch', ['補胎', '$100'], '#c8202a'), ('note_hours', ['營業', '10-20點', '週一公休'], None),
         ('note_used', ['二手車', '收購・寄賣'], None), ('note_test', ['試騎', '請先說一聲'], None), ('note_lock', ['鎖要買', '好一點的'], '#c8202a')]
for i, (nm, ls, red) in enumerate(NOTES): cell(nm, 384 + (i % 3) * 192, 1648 + (i // 3) * 192, 192, 192, note(ls, red=red))
PRICES = [('淑女車', '4,200', '附車籃・載人墊'), ('城市通勤車', '6,800', '內建車燈'), ('小折', '12,800', '可帶上捷運'), ('登山車', '15,800', '前避震'), ('公路車', '22,800', '彎把・輕量')]
for i, p in enumerate(PRICES): cell(f'price{i}', 960 + (i % 2) * 192, 1684 + (i // 2) * 120, 192, 120, price(*p))
cell('counter_face', 1536, 1872, 512, 176, counter_face)
G.save(os.path.join(GEN, 'bike_goods.png'))

# ======================= 3. 會亮的（1024×512） =======================
E = Image.new('RGB', (1024, 512), (0, 0, 0)); d = ImageDraw.Draw(E)
d.rectangle([0, 0, 127, 127], fill=(255, 250, 238)); uvbox('tube', 8, 8, 120, 120, (1024, 512))
bl = Image.new('RGB', (128, 128), (0, 0, 0)); bd_ = ImageDraw.Draw(bl)
for r in range(64, 0, -2): v = int(150 + 105 * (1 - r / 64)); bd_.ellipse([64 - r, 64 - r, 64 + r, 64 + r], fill=(255, int(v * 0.86), int(v * 0.58)))
E.paste(bl, (128, 0)); uvbox('bulb', 128 + 8, 8, 256 - 8, 120, (1024, 512))
sc = Image.new('RGB', (384, 256), hx('#d8e0e6')[:3]); sd = ImageDraw.Draw(sc)   # 櫃台螢幕：維修登記表（抽象的表格）
sd.rectangle([0, 0, 384, 30], fill=hx('#2c4436')); sd.text((12, 15), '維修登記', font=font(18), fill=(240, 236, 220), anchor='lm')
for k in range(8): sd.line([10, 44 + k * 26, 374, 44 + k * 26], fill=hx('#9aa6ae'), width=2)
for k in range(3): sd.line([10 + k * 120, 34, 10 + k * 120, 250], fill=hx('#9aa6ae'), width=2)
E.paste(sc, (256, 0)); uvbox('screen', 256, 0, 640, 256, (1024, 512))
d.rectangle([640, 0, 767, 127], fill=(255, 236, 196)); uvbox('lamp', 648, 8, 760, 120, (1024, 512))
E.save(os.path.join(GEN, 'bike_emit.png'))

# ======================= 4. 招牌（2048×768） =======================
SG = Image.new('RGB', (2048, 768), hx(GREEN)[:3])


def signboard(w, h, fs, icon_r):
    im = Image.new('RGB', (w, h), hx(GREEN)[:3]); a = np.asarray(im, np.float32); a += noise(w, h, 8, 5)[..., None]
    yy = np.linspace(0, 1, h)[:, None]; a *= (1 - 0.12 * np.abs(yy - 0.5) * 2)[..., None]; im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
    b = int(h * 0.06); d.rectangle([b, b, w - b, h - b], outline=hx('#c9b98e'), width=max(3, h // 70)); d.rectangle([b + 10, b + 10, w - b - 10, h - b - 10], outline=hx('#c9b98e'), width=2)
    for (cx, cy) in ((b + 22, b + 22), (w - b - 22, b + 22), (b + 22, h - b - 22), (w - b - 22, h - b - 22)): d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=hx('#b8a676'))
    ix = int(w * 0.13) if w > 1500 else int(w * 0.16)
    d.ellipse([ix - icon_r - 12, h / 2 - icon_r - 12, ix + icon_r + 12, h / 2 + icon_r + 12], fill=hx(CREAM)); wheel_icon(d, ix, h / 2, icon_r, hx(GREEN), 6)
    f = font(fs); s = '慢輪單車'; gap = fs * 0.32; tw = sum(f.getlength(c) for c in s) + gap * 3; x = ix + icon_r + (w - ix - icon_r - tw) / 2
    for ch in s: d.text((x, h / 2), ch, font=f, fill=hx(CREAM), anchor='lm'); x += f.getlength(ch) + gap
    a = np.asarray(im, np.float32); m = noise(w, h, 3, 1, np.random.default_rng(4)) > 0.85; a[m] = a[m] * 0.85 + 20   # 漆面細細的掉漆
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


SG.paste(signboard(2048, 384, 230, 120), (0, 0)); uvbox('sign_big', 0, 0, 2048, 384, (2048, 768))
SG.paste(signboard(1229, 384, 150, 92), (0, 384)); uvbox('sign_counter', 0, 384, 1229, 768, (2048, 768))
SG.save(os.path.join(GEN, 'bike_sign.png'))

# ======================= 5. 地板（1024²＝1.2 m） =======================
FW = 1024; T = FW // 2
fa = np.zeros((FW, FW, 3), np.float32); rr = np.random.default_rng(8)
for i in range(2):
    for j in range(2):
        c = np.array(hx('#958e85')[:3], np.float32) * rr.uniform(0.94, 1.05); fa[j * T:(j + 1) * T, i * T:(i + 1) * T] = c
fa += noise(FW, FW, 24, 9)[..., None]; fa += noise(FW, FW, 3, 6)[..., None]
spots = noise(FW, FW, 60, 1, np.random.default_rng(2)); fa *= (1 - 0.05 * np.clip(spots, 0, 1))[..., None]
for k in (0, T):   # 磚縫（積灰）
    fa[:, max(0, k - 3):k + 3] *= 0.62; fa[max(0, k - 3):k + 3, :] *= 0.62
fa[:, FW - 3:] *= 0.62; fa[FW - 3:, :] *= 0.62
F = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8)); fd_ = ImageDraw.Draw(F, 'RGBA')
for k in range(5):   # 輪胎痕（AA_646：地上有輪胎痕）——淡淡的弧線
    x0 = rr.uniform(0, FW); y0 = rr.uniform(0, FW); a0 = rr.uniform(0, math.pi); pts = []
    for t in range(40):
        a0 += rr.uniform(-0.04, 0.04); x0 += 14 * math.cos(a0); y0 += 14 * math.sin(a0); pts.append((x0 % FW, y0 % FW))
    for p, q in zip(pts, pts[1:]):
        if abs(p[0] - q[0]) < 50 and abs(p[1] - q[1]) < 50: fd_.line([p, q], fill=(40, 36, 32, 40), width=6)
F = F.filter(ImageFilter.GaussianBlur(0.6)); F.save(os.path.join(GEN, 'bike_floor.png'))

json.dump(ATL, open(os.path.join(GEN, 'bike_atlas.json'), 'w'), indent=0)
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]; pv = Image.new('RGB', (2048, 2048 + 1024), (40, 40, 40))
    pv.paste(G, (0, 0)); bg = Image.new('RGBA', (2048, 1024), (90, 120, 90, 255)); bg.alpha_composite(A); pv.paste(bg.convert('RGB'), (0, 2048))
    pv.resize((1024, 1536)).save(out, quality=80)
    pv2 = Image.new('RGB', (2048, 768 + 512 + 1024), (40, 40, 40)); pv2.paste(SG, (0, 0)); pv2.paste(E, (0, 768)); pv2.paste(F, (1024, 768)); pv2.resize((1024, 1152)).save(out.replace('.jpg', '_2.jpg'), quality=80)
print('atlas cells', len(ATL))
