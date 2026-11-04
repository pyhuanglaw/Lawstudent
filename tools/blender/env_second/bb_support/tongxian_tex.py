"""同弦樂器（吉他店）室內的自製貼圖（CC，帳號 A 的建模子代理，2026-11-03）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/tongxian_tex.py
輸出到 tools/blender/env_second/textures/gen/：
  tongxian_guitar.png  吉他貼圖集（1024²，8×8 格、每格 128 px）：面板木紋、側板、電吉他烤漆、指板（含琴格、圓點）、琴頭面、護板、五金、弦、拾音器…
  tongxian_props.png   道具貼圖集（1024²）：波斯風地毯、窗外的新生南路（樹、對面的公寓、路）、壓花玻璃、音箱面網、Pick 盒、背帶花紋、
                       弦的紙盒（只有抽象圖案、沒有字或品牌，D77）、照片（抽象色塊）、空白紙、空白木板、譜架、軟木板
  tongxian_props_emit.png 只有窗外景那一格是亮的（窗外的景自己發光，不被室內光弄暗）
  tongxian_atlas.json  每一格在圖上的位置（像素，左上原點），Blender 腳本照這份給 UV
v4（11-04，照參考圖重做）：道具貼圖集 1024 → 2048，加上印刷的東西（中文字用系統的文泉驛正黑）：弦的包裝 8 種、Pick 吊卡、移調夾／調音器的盒子、
  店名木牌「同弦樂器」、手寫紙條（弦一個月換一次、換弦 $150…新台幣）、價錢牌、名片、樂譜、溝槽板、膠帶；新的窗外景（新生南路的路樹、對面的公寓、路牌）。
全部是程式畫的，沒有任何外部圖片、沒有真實品牌或標誌（店名「同弦樂器」虛構）。"""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(619)


def hx(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255.0


def noise(h, w, scale=8, rng=R):
    """平滑雜訊（0～1）：低解析度亂數放大"""
    sh, sw = max(2, h // scale), max(2, w // scale)
    a = (rng.random((sh, sw)) * 255).astype(np.uint8)
    return np.asarray(Image.fromarray(a).resize((w, h), Image.BICUBIC), np.float32) / 255.0


def grain(h, w, base, dark, freq=40, wav=0.6, along='v', contrast=0.35, rng=R):
    """木紋：沿著 along（v＝圖的上下＝吉他的長度方向）的細紋"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    n = noise(h, w, 16, rng); n2 = noise(h, w, 4, rng)
    t = (xx / w if along == 'v' else yy / h)
    s = np.sin((t * freq + n * wav * 1.1 + n2 * 0.25) * 2 * math.pi) * 0.5 + 0.5
    s = s ** 3 * 0.8 + n2 * 0.2
    k = (s * contrast)[..., None]
    return np.clip(hx(base) * (1 - k) + hx(dark) * k, 0, 1)


def flat(h, w, col, var=0.03, rng=R):
    n = noise(h, w, 6, rng)[..., None]
    return np.clip(hx(col) * (1 - var + 2 * var * n), 0, 1)


def radial(h, w, cols, cx=0.5, cy=0.58, rx=0.55, ry=0.6, base=None):
    """漸層（日暉色）：cols＝[(半徑比例, 色碼)…] 由中心往外；base＝底下的木紋（中心透出來）"""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w - cx) / rx) ** 2 + ((yy / h - cy) / ry) ** 2)
    out = np.zeros((h, w, 3), np.float32)
    rs = [c[0] for c in cols]; cs = [hx(c[1]) for c in cols]
    for ch in range(3): out[..., ch] = np.interp(r, rs, [c[ch] for c in cs])
    if base is not None:
        m = np.clip(1 - (r - rs[0]) / (rs[1] - rs[0] + 1e-6), 0, 1)[..., None] * 0.55
        out = out * (1 - m) + base * m
    return out


# ======================= 吉他貼圖集 =======================
GS, GC = 1024, 128
gimg = np.zeros((GS, GS, 3), np.float32); gcells = {}
_slot = [0]


def gput(name, arr):
    i = _slot[0]; _slot[0] += 1
    x, y = (i % 8) * GC, (i // 8) * GC
    gimg[y:y + GC, x:x + GC] = arr; gcells[name] = [x, y, GC, GC]


C = GC
spruce = grain(C, C, '#dcbb7e', '#b88a4c', freq=26)
gput('spruce', spruce)
gput('spruce_aged', grain(C, C, '#cf9a55', '#9a6430', freq=24))
gput('mahog_top', grain(C, C, '#8c4a2c', '#5a2a18', freq=18, wav=1.0))
gput('koa_dark', grain(C, C, '#5e3a22', '#2e1a0e', freq=10, wav=1.6, contrast=0.5))
gput('sunburst_ac', radial(C, C, [(0.35, '#d9a24c'), (0.62, '#9a5a24'), (0.85, '#3a1f10'), (1.4, '#1c0e06')], base=spruce))
gput('side_mahog', grain(C, C, '#6e3a22', '#45200f', freq=14, along='u'))
gput('side_rose', grain(C, C, '#43281a', '#22120a', freq=20, along='u', contrast=0.5))
gput('side_maple', grain(C, C, '#c9a06c', '#a87a48', freq=8, along='u', wav=1.4))
ash = grain(C, C, '#e0bf7c', '#b38a4c', freq=9, wav=1.4, contrast=0.45)
gput('e_sunburst', radial(C, C, [(0.3, '#e0b040'), (0.55, '#b84a1c'), (0.8, '#3a1408'), (1.4, '#120604')], base=ash))
gput('e_cream', flat(C, C, '#e8dec2'))
gput('e_blue', flat(C, C, '#87afc4'))
gput('e_black', flat(C, C, '#1e1e21'))
gput('e_red', radial(C, C, [(0.3, '#a8262a'), (1.0, '#7a1418'), (1.5, '#4a0a0c')]))
gput('e_seafoam', flat(C, C, '#a3c7b1'))
gput('e_blonde', ash)
gput('e_cherry', radial(C, C, [(0.3, '#c0582c'), (0.6, '#8a1e16'), (0.9, '#3e0808'), (1.4, '#200404')], base=grain(C, C, '#c87a3c', '#8a4a20', freq=12)))
gput('e_olive', flat(C, C, '#727552'))
gput('e_white', flat(C, C, '#efece3'))
gput('e_navy', radial(C, C, [(0.4, '#2e4566'), (1.2, '#1f2f48')]))   # v4：參考圖右上的深藍、灰綠
gput('e_sage', flat(C, C, '#93a596'))
gput('owner_burst', radial(C, C, [(0.25, '#c88a3a'), (0.5, '#8a4a1c'), (0.75, '#3c1e0c'), (1.3, '#1a0c06')], base=grain(C, C, '#c89048', '#7a4a1e', freq=14, wav=1.2)))


def fretboard(base, dark, dot):
    a = grain(C, C, base, dark, freq=30, along='v', contrast=0.3)
    S, Lf = 0.645, 0.44   # 弦長、指板長（琴枕到指板末端）：v＝1 是琴枕、v＝0 是指板末端（第 20 格附近）
    for n in range(1, 21):
        d = S * (1 - 2 ** (-n / 12)); y = int(round(d / Lf * (C - 1)))
        if 0 <= y < C: a[max(0, y - 1):y + 1, :] = hx('#c9c6bc')
    for n in (3, 5, 7, 9, 12, 15, 17, 19):
        dm = S * ((1 - 2 ** (-n / 12)) + (1 - 2 ** (-(n - 1) / 12))) / 2; y = int(dm / Lf * (C - 1))
        xs = [C // 2] if n != 12 else [C // 2 - 22, C // 2 + 22]
        for x in xs:
            yy, xx = np.mgrid[0:C, 0:C]; m = (xx - x) ** 2 + (yy - y) ** 2 <= 16
            a[m] = hx(dot)
    return a


gput('fb_rose', fretboard('#3c2619', '#22140c', '#e8e2d2'))
gput('fb_maple', fretboard('#dab47a', '#b8894e', '#1a1a1a'))
gput('neck_maple', grain(C, C, '#d6ae74', '#b88c52', freq=16))
gput('neck_mahog', grain(C, C, '#7a4428', '#4e2612', freq=16))
gput('head_black', flat(C, C, '#161413', var=0.02))
gput('head_rose', grain(C, C, '#3e2619', '#1e100a', freq=20))
gput('pg_white', flat(C, C, '#ebe7da', var=0.015))
gput('pg_mint', flat(C, C, '#dcdcc2', var=0.015))
gput('pg_black', flat(C, C, '#19191b', var=0.02))
t = noise(C, C, 10); t2 = noise(C, C, 4)
tort = np.clip(hx('#4a1e0c') * (1 - t[..., None]) + hx('#b8642a') * (t[..., None] ** 3) * 1.3 + 0.05 * t2[..., None], 0, 1)
gput('pg_tort', tort)
yy, xx = np.mgrid[0:C, 0:C].astype(np.float32)
chrome = np.stack([0.62 + 0.25 * np.sin(yy / C * math.pi)] * 3, -1) * hx('#e4e6ea')
gput('chrome', chrome)
gput('gold', np.stack([0.7 + 0.25 * np.sin(yy / C * math.pi)] * 3, -1) * hx('#d6b060'))
gput('hw_black', flat(C, C, '#222224'))
gput('nickel', flat(C, C, '#a9aba6'))
gput('hole', flat(C, C, '#0d0a08', var=0.01))
r = np.sqrt((xx / C - 0.5) ** 2 + (yy / C - 0.5) ** 2) * 2
ros = np.full((C, C, 3), hx('#e9dfc8'))
for (a0, a1, col) in ((0.0, 0.6, '#0d0a08'), (0.6, 0.66, '#1a1410'), (0.68, 0.72, '#e9dfc8'), (0.72, 0.8, '#2a1a12'), (0.8, 0.84, '#c84a2a'), (0.84, 0.88, '#2a1a12'), (0.88, 0.92, '#e9dfc8'), (0.92, 2.0, '#2a1a12')):
    ros[(r >= a0) & (r < a1)] = hx(col)
gput('rosette', ros)
gput('str_bronze', flat(C, C, '#d2ad70', var=0.0))
gput('str_nickel', flat(C, C, '#dcdcd8', var=0.0))
gput('bone', flat(C, C, '#efe7d3', var=0.01))
gput('ebony', flat(C, C, '#1b1513', var=0.02))


def pickup(base, pole, rows=1):
    a = flat(C, C, base, var=0.01)
    for rr in range(rows):
        y = C // 2 if rows == 1 else int(C * (0.3 + 0.4 * rr))
        for k in range(6):
            x = int(C * (0.12 + 0.76 * k / 5)); m = (xx - x) ** 2 + (yy - y) ** 2 <= 30; a[m] = hx(pole)
    return a


gput('pu_cream', pickup('#e9e2cc', '#9a9a96'))
gput('pu_black', pickup('#151516', '#8a8a86'))
gput('pu_hb', pickup('#191919', '#a8a8a4', rows=2))
tag = flat(C, C, '#f3efe4', var=0.01); m = (xx - C / 2) ** 2 + (yy - 18) ** 2 <= 30; tag[m] = hx('#8a8476')
gput('tag', tag)
gput('binding', flat(C, C, '#ece3cc', var=0.01))
gput('rubber', flat(C, C, '#2a2a2a', var=0.02))
Image.fromarray((np.clip(gimg, 0, 1) * 255).astype(np.uint8)).save(os.path.join(GEN, 'tongxian_guitar.png'))

# ======================= 道具貼圖集 =======================
PS = 2048   # v4：1024 → 2048（右半、下半放印刷的東西：弦的包裝、Pick 卡、木牌、手寫紙條、價錢牌、新的窗外景）
pimg = np.zeros((PS, PS, 3), np.float32); pcells = {}


def pput(name, x, y, arr):
    h, w = arr.shape[:2]; pimg[y:y + h, x:x + w] = np.clip(arr, 0, 1); pcells[name] = [x, y, w, h]


# ---- 地毯（波斯風：紅底、深藍邊框、中央的菱形圖案、兩端的流蘇）
RW_, RH_ = 512, 320
im = Image.new('RGB', (RW_, RH_), '#8c2e27'); d = ImageDraw.Draw(im)
FR = 14   # 流蘇
d.rectangle([FR, 0, RW_ - FR - 1, RH_ - 1], fill='#26304c')
d.rectangle([FR + 10, 10, RW_ - FR - 11, RH_ - 11], fill='#d9c49a')
d.rectangle([FR + 13, 13, RW_ - FR - 14, RH_ - 14], fill='#7a2420')
for i in range(0, RW_, 22):   # 邊框的花紋：一排小菱形
    for (yy0, yy1) in ((13, 37), (RH_ - 38, RH_ - 14)):
        cx, cy = i + 11, (yy0 + yy1) / 2
        if FR + 14 < cx < RW_ - FR - 14: d.polygon([(cx, yy0 + 2), (cx + 9, cy), (cx, yy1 - 2), (cx - 9, cy)], fill='#d0a24c', outline='#26304c')
for j in range(0, RH_, 22):
    for (xx0, xx1) in ((FR + 13, FR + 37), (RW_ - FR - 38, RW_ - FR - 14)):
        cx, cy = (xx0 + xx1) / 2, j + 11
        if 40 < cy < RH_ - 40: d.polygon([(xx0 + 2, cy), (cx, cy - 9), (xx1 - 2, cy), (cx, cy + 9)], fill='#d0a24c', outline='#26304c')
d.rectangle([FR + 38, 38, RW_ - FR - 39, RH_ - 39], outline='#26304c', width=4)
d.rectangle([FR + 44, 44, RW_ - FR - 45, RH_ - 45], fill='#932f28')
cx, cy = RW_ / 2, RH_ / 2
for (sx, sy, col) in ((150, 90, '#26304c'), (138, 80, '#d9c49a'), (128, 72, '#26304c'), (100, 56, '#b8462e'), (70, 38, '#d0a24c'), (40, 22, '#26304c'), (16, 9, '#d9c49a')):
    d.polygon([(cx - sx, cy), (cx - sx * 0.55, cy - sy), (cx + sx * 0.55, cy - sy), (cx + sx, cy), (cx + sx * 0.55, cy + sy), (cx - sx * 0.55, cy + sy)], fill=col)
for (qx, qy) in ((FR + 44, 44), (RW_ - FR - 45, 44), (FR + 44, RH_ - 45), (RW_ - FR - 45, RH_ - 45)):   # 四角
    d.pieslice([qx - 34, qy - 26, qx + 34, qy + 26], 0, 360, fill='#26304c'); d.pieslice([qx - 22, qy - 16, qx + 22, qy + 16], 0, 360, fill='#b8462e'); d.pieslice([qx - 9, qy - 7, qx + 9, qy + 7], 0, 360, fill='#d0a24c')
for k in range(60):   # 散在紅底上的小花
    x = R.uniform(FR + 60, RW_ - FR - 60); y = R.uniform(56, RH_ - 56)
    if abs(x - cx) / 160 + abs(y - cy) / 96 < 1.05: continue
    d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=['#d0a24c', '#d9c49a', '#26304c'][k % 3])
for y in range(0, RH_, 3):
    d.line([(0, y), (FR - 2, y)], fill='#e6dcc4'); d.line([(RW_ - FR + 1, y), (RW_ - 1, y)], fill='#e6dcc4')
rug = np.asarray(im, np.float32) / 255
rug = rug * (0.86 + 0.14 * noise(RH_, RW_, 3)[..., None]) * (0.92 + 0.08 * noise(RH_, RW_, 40)[..., None])   # 織紋、用久了的不均勻
pput('rug', 0, 0, rug)

# ---- 窗外：新生南路（對面的老公寓、路樹、綠籬、馬路）；光線是午後
VW, VH = 512, 320
im = Image.new('RGB', (VW, VH), '#e9eef0'); d = ImageDraw.Draw(im)
for y in range(VH // 2):
    k = y / (VH / 2); d.line([(0, y), (VW, y)], fill=tuple(int(a * (1 - k) + b * k) for a, b in zip((214, 228, 236), (240, 238, 228))))
d.rectangle([150, 20, VW, 230], fill='#ddd3c0')   # 對面的公寓
for fy in range(4):
    y0 = 30 + fy * 48
    d.rectangle([150, y0 + 38, VW, y0 + 42], fill='#c7bca8')
    for fx in range(6):
        x0 = 170 + fx * 58
        d.rectangle([x0, y0, x0 + 40, y0 + 30], fill='#8e989c'); d.rectangle([x0, y0, x0 + 40, y0 + 30], outline='#e8e2d4', width=2)
        d.line([(x0 + 20, y0), (x0 + 20, y0 + 30)], fill='#e8e2d4', width=2)
        if (fx + fy) % 3 == 0: d.rectangle([x0 + 4, y0 + 30, x0 + 30, y0 + 40], fill='#efefea')   # 冷氣
        for bx in range(x0, x0 + 41, 6): d.line([(bx, y0 + 30), (bx, y0 + 38)], fill='#6e706c')   # 鐵窗
d.rectangle([150, 200, VW, 236], fill='#b9ad98')
for sx in range(160, VW, 70): d.rectangle([sx, 206, sx + 52, 232], fill='#6a7a7e')   # 一樓店面
d.rectangle([0, 236, VW, 252], fill='#c8c2b6')   # 對面的人行道
d.rectangle([0, 252, VW, VH], fill='#97958f')    # 馬路
for x in range(0, VW, 60): d.rectangle([x, 284, x + 30, 288], fill='#e9e6dc')
d.rectangle([0, 300, VW, VH], fill='#b0aca2')    # 這一側的人行道
for k in range(18):   # 綠籬
    x = k * 30 + R.uniform(-6, 6); d.ellipse([x - 22, 222, x + 22, 252], fill=['#3f6a2c', '#4b7a34', '#365e26'][k % 3])
tr = Image.new('RGBA', (VW, VH), (0, 0, 0, 0)); td = ImageDraw.Draw(tr)
for tx_ in (40, 250, 470):   # 路樹（樟樹）：樹幹＋很多葉團
    td.polygon([(tx_ - 8, 250), (tx_ + 8, 250), (tx_ + 4, 120), (tx_ - 4, 120)], fill='#5a4a3a')
    td.line([(tx_, 150), (tx_ - 40, 90)], fill='#5a4a3a', width=6); td.line([(tx_, 140), (tx_ + 45, 80)], fill='#5a4a3a', width=6)
    for k in range(70):
        a = R.uniform(0, 2 * math.pi); rr = R.uniform(0, 1) ** 0.6 * 120
        x = tx_ + math.cos(a) * rr; y = 90 + math.sin(a) * rr * 0.55
        s = R.uniform(10, 24); c = [(62, 98, 44), (84, 124, 56), (112, 150, 70), (150, 178, 92), (52, 84, 38)][k % 5]
        td.ellipse([x - s, y - s * 0.8, x + s, y + s * 0.8], fill=c + (255,))
im = Image.alpha_composite(im.convert('RGBA'), tr).convert('RGB').filter(ImageFilter.GaussianBlur(1.3))
view = np.asarray(im, np.float32) / 255
pput('view', 512, 0, view)

# ---- 壓花玻璃（門的玻璃：小圓點的凹凸）
G2 = 256
gl = np.full((G2, G2), 0.82, np.float32)
yy, xx = np.mgrid[0:G2, 0:G2].astype(np.float32)
for k in range(900):
    x, y, s = R.uniform(0, G2), R.uniform(0, G2), R.uniform(3, 6)
    dd = ((xx - x) ** 2 + (yy - y) ** 2) / (s * s); gl += np.exp(-dd) * R.uniform(-0.12, 0.14)
gl = np.clip(gl, 0, 1)
pput('frosted', 0, 320, np.stack([gl * 0.93, gl * 0.97, gl * 1.0], -1))

# ---- 音箱的面網（米白、斜紋）
yy, xx = np.mgrid[0:128, 0:128].astype(np.float32)
weave = 0.5 + 0.5 * np.sin((xx + yy) * 1.4) * np.sin((xx - yy) * 1.4)
pput('grille', 256, 320, hx('#c9b994') * (0.78 + 0.22 * weave[..., None]))
pput('grille_dark', 384, 320, hx('#3a3634') * (0.75 + 0.25 * weave[..., None]))


def picks(seed):
    rg = np.random.default_rng(seed)
    im = Image.new('RGB', (128, 128), '#2b2420'); d = ImageDraw.Draw(im)
    cols = ['#d94a3a', '#e9b03a', '#3a7ad9', '#f2efe6', '#2a2a2a', '#7a3ad9', '#3ab07a', '#e97ab0', '#b0703a', '#7ad0e0']
    for k in range(70):
        x, y = rg.uniform(4, 124), rg.uniform(4, 124); a = rg.uniform(0, 2 * math.pi); s = rg.uniform(7, 10)
        pts = [(x + math.cos(a + t) * s * (1.0 if i == 0 else 0.85), y + math.sin(a + t) * s * (1.0 if i == 0 else 0.85)) for i, t in enumerate((0, 2.3, 3.98))]
        d.polygon(pts, fill=cols[int(rg.integers(len(cols)))], outline='#1a1a1a')
    return np.asarray(im.filter(ImageFilter.SMOOTH), np.float32) / 255


pput('picks_a', 512, 320, picks(1)); pput('picks_b', 640, 320, picks(2))
pput('felt', 768, 320, hx('#567a68') * (0.85 + 0.15 * noise(128, 128, 2)[..., None]))   # 櫃台裡的絨布墊（v3：#2c3a34 → #567a68，PC 渲染太暗、Pick 盒看不出來）
pput('felt_red', 896, 320, hx('#6a2428') * (0.85 + 0.15 * noise(128, 128, 2)[..., None]))


def strap(c1, c2, c3, kind):
    a = np.zeros((128, 128, 3), np.float32) + hx(c1)
    yy, xx = np.mgrid[0:128, 0:128]
    if kind == 0:   # 民族風：菱形
        m = (np.abs((xx % 32) - 16) + np.abs((yy % 32) - 16)) < 10; a[m] = hx(c2); m2 = (np.abs((xx % 32) - 16) + np.abs((yy % 32) - 16)) < 4; a[m2] = hx(c3)
    elif kind == 1:   # 條紋
        a[(yy % 24) < 6] = hx(c2); a[(yy % 24) == 12] = hx(c3)
    elif kind == 2:   # 鋸齒
        a[((xx + np.abs((yy % 20) - 10) * 2) % 28) < 8] = hx(c2)
    else:   # 皮革
        a = hx(c1) * (0.8 + 0.2 * noise(128, 128, 4)[..., None]); a[(yy < 6) | (yy > 121)] = hx(c2)
    a[(yy < 3) | (yy > 124)] = hx(c3)
    return a


for i, (c1, c2, c3, k) in enumerate((('#2c3a5a', '#d0a24c', '#c84a3a', 0), ('#8a2a22', '#e9d9b0', '#2a2a2a', 1), ('#3a5a3a', '#e0c070', '#1a1a1a', 2), ('#5a3420', '#3a2010', '#2a1a10', 3),
                                     ('#d9c49a', '#8a2a22', '#26304c', 0), ('#1d1d1d', '#9a9a9a', '#111111', 1))):
    pput(f'strap{i}', i * 128, 448, strap(c1, c2, c3, k))


def pack(bg, fg, shape, seed):
    """弦的紙盒正面：抽象的圖形（不放字、不放品牌）"""
    im = Image.new('RGB', (128, 128), bg); d = ImageDraw.Draw(im)
    d.rectangle([6, 6, 121, 121], outline=fg, width=3)
    if shape == 0: d.ellipse([34, 26, 94, 86], outline=fg, width=6)
    elif shape == 1:
        for k in range(6): d.line([(24, 30 + k * 10), (104, 30 + k * 10)], fill=fg, width=3)
    elif shape == 2: d.polygon([(64, 22), (100, 84), (28, 84)], outline=fg, width=5)
    else: d.rectangle([30, 30, 98, 80], fill=fg); d.ellipse([52, 44, 76, 68], fill=bg)
    d.rectangle([20, 96, 108, 104], fill=fg)   # 規格的色條（照弦的粗細分顏色，沒有字）
    return np.asarray(im, np.float32) / 255


for i, (bg, fg, sh) in enumerate((('#f0ede4', '#2a4a7a', 0), ('#2a2a2c', '#d0a24c', 1), ('#8a2a26', '#f0e6d0', 2), ('#e9d6a0', '#5a3420', 3),
                                   ('#3a6a5a', '#f0ede4', 0), ('#c9d4dc', '#2a2a2c', 2), ('#e8b4b0', '#5a2a30', 1), ('#f4f2ec', '#3a8a5a', 3))):
    pput(f'pack{i}', i * 128, 576, pack(bg, fg, sh, i))


def photo(kind):
    yy, xx = np.mgrid[0:128, 0:128].astype(np.float32) / 128
    if kind == 0:   # 夕陽、海平線
        a = np.stack([0.95 - 0.3 * yy, 0.55 + 0.1 * yy, 0.4 + 0.25 * (1 - yy)], -1); a[yy > 0.66] = hx('#2a3a5a') * (0.8 + 0.2 * xx[yy > 0.66][..., None]); m = (xx - 0.5) ** 2 + (yy - 0.62) ** 2 < 0.01; a[m] = hx('#ffd27a')
    elif kind == 1:   # 舞台的燈（色點）
        a = np.zeros((128, 128, 3), np.float32) + hx('#1a1424')
        for k in range(14):
            cx, cy = R.uniform(0.1, 0.9), R.uniform(0.1, 0.6); c = hx(['#e9a03a', '#d94a6a', '#4a8ad9', '#f0e0a0'][k % 4])
            g = np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / 0.006)[..., None]; a = a + c * g * 0.8
        a[yy > 0.75] = hx('#0e0a12')
    else:   # 天空、草地、一棵樹的剪影
        a = np.stack([0.55 + 0.3 * yy, 0.72 + 0.15 * yy, 0.9 - 0.1 * yy], -1); a[yy > 0.7] = hx('#6a8a4a'); m = ((xx - 0.65) ** 2 / 0.02 + (yy - 0.45) ** 2 / 0.03) < 1; a[m] = hx('#3a5a2a')
    a[:6] = a[-6:] = a[:, :6] = a[:, -6:] = hx('#f3f0e8')   # 白邊
    return np.clip(a, 0, 1)


for i in range(3): pput(f'photo{i}', i * 128, 704, photo(i))
pput('paper', 384, 704, flat(128, 128, '#f2eee3', var=0.02))
board = grain(128, 128, '#c49a6a', '#9a6e44', freq=6, along='u', wav=1.2); pput('board', 512, 704, board)
yy, xx = np.mgrid[0:128, 0:128]
ms = np.full((128, 128, 3), hx('#1c1c1e')); ms[((xx % 12) - 6) ** 2 + ((yy % 12) - 6) ** 2 < 8] = hx('#0a0a0a') * 0.3 + 0.0
pput('mstand', 640, 704, ms)
pput('cork', 768, 704, hx('#b88a5a') * (0.75 + 0.25 * noise(128, 128, 2)[..., None]))
pput('flyer', 896, 704, flat(128, 128, '#f4ead0', var=0.02))
pput('tolex', 0, 832, hx('#1f1d1c') * (0.8 + 0.2 * noise(128, 128, 1)[..., None]))
pput('tolex_tan', 128, 832, hx('#b89a6a') * (0.82 + 0.18 * noise(128, 128, 1)[..., None]))
gigbag = hx('#232426') * (0.85 + 0.15 * noise(128, 128, 2)[..., None]); gigbag[60:68] = hx('#4a4a4c'); pput('gigbag', 256, 832, gigbag)

# ======================= v4（11-04）：照參考圖加的印刷品（字用文泉驛正黑，GPL＋字型例外：嵌進圖片可以；沒有任何真實品牌） =======================
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def font(px): return ImageFont.truetype(FONT, int(px))
def to_arr(im): return np.asarray(im.convert('RGB'), np.float32) / 255
def pim(name, x, y, im): pput(name, x, y, to_arr(im))


def hand_text(d, w, h, lines, col, size, rng, y0=None, lh=None):
    """麥克筆的字：每個字稍微歪、大小不一"""
    n = len(lines); lh = lh or h / (n + 0.6); y0 = y0 if y0 is not None else lh * 0.8
    for i, s in enumerate(lines):
        f = font(size); tw = sum(f.getlength(ch) for ch in s); x = (w - tw) / 2; y = y0 + lh * i
        for ch in s:
            d.text((x, y + rng.uniform(-3, 3)), ch, font=f, fill=col, anchor='lm', stroke_width=2, stroke_fill=col); x += f.getlength(ch) * rng.uniform(0.95, 1.05)


def paper(w, h, base='#f3eedf', rng=R):
    a = np.zeros((h, w, 3), np.float32) + hx(base); a *= (0.95 + 0.05 * noise(h, w, 6, rng)[..., None])
    yy = np.linspace(0, 1, h)[:, None, None]; a *= (1 - 0.05 * yy)   # 下緣比較黃
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


# ---- 窗外：新生南路（1024×640；參考圖：一排高大的路樹、對面的老公寓（鐵窗、冷氣、陽台）、一樓的騎樓店面、綠籬、汽車、路牌「新生南路」）
VW, VH = 1024, 640
rv = np.random.default_rng(1104)
im = Image.new('RGB', (VW, VH), '#e8ecec'); d = ImageDraw.Draw(im)
for y in range(VH // 2):
    k = y / (VH / 2); d.line([(0, y), (VW, y)], fill=tuple(int(a * (1 - k) + b * k) for a, b in zip((206, 222, 232), (238, 236, 226))))
for bi, (bx0, bx1, top, col) in enumerate(((0, 330, 60, '#d8cfbc'), (330, 700, 30, '#e2dccd'), (700, 1024, 80, '#cfc6b2'))):   # 對面的公寓（三棟）
    d.rectangle([bx0, top, bx1, 470], fill=col)
    for fy in range(6):
        y0 = top + 20 + fy * 62
        if y0 + 40 > 400: break
        d.rectangle([bx0, y0 + 48, bx1, y0 + 54], fill='#bdb29e')
        for fx in range(int((bx1 - bx0 - 20) // 70)):
            x0 = bx0 + 18 + fx * 70
            d.rectangle([x0, y0, x0 + 48, y0 + 38], fill='#7f8a90'); d.rectangle([x0, y0, x0 + 48, y0 + 38], outline='#ece6d8', width=3)
            for bx in range(x0, x0 + 49, 7): d.line([(bx, y0 - 2), (bx, y0 + 40)], fill='#5e605c', width=2)   # 鐵窗
            if (fx + fy + bi) % 3 == 0: d.rectangle([x0 + 6, y0 + 40, x0 + 40, y0 + 52], fill='#f2f2ee')   # 冷氣
d.rectangle([0, 395, VW, 470], fill='#a89c86')   # 一樓騎樓
for sx in range(10, VW, 92):
    d.rectangle([sx, 405, sx + 70, 466], fill=['#5f6f72', '#7a6a50', '#3f5a4a', '#8a5a4a'][(sx // 92) % 4])
    d.rectangle([sx - 4, 396, sx + 74, 412], fill=['#2f6a5a', '#c8b070', '#a83a2a', '#e8e0d0'][(sx // 92 + 1) % 4])   # 招牌（只有顏色、沒有字）
d.rectangle([0, 470, VW, 490], fill='#c8c2b6')   # 對面的人行道
d.rectangle([0, 490, VW, VH], fill='#8e8c86')    # 馬路
for x in range(0, VW, 110): d.rectangle([x, 556, x + 56, 562], fill='#ece8dc')
for (cx_, cy_, w_, col) in ((560, 520, 150, '#dedcd8'), (180, 505, 120, '#5a6a7a'), (880, 512, 130, '#2a2a2c')):   # 汽車
    d.rounded_rectangle([cx_ - w_ / 2, cy_ - 22, cx_ + w_ / 2, cy_ + 16], 10, fill=col); d.rounded_rectangle([cx_ - w_ * 0.32, cy_ - 44, cx_ + w_ * 0.28, cy_ - 18], 8, fill=col)
    d.rectangle([cx_ - w_ * 0.28, cy_ - 40, cx_ + w_ * 0.24, cy_ - 22], fill='#9fb0ba')
    for s in (-1, 1): d.ellipse([cx_ + s * w_ * 0.3 - 14, cy_ + 4, cx_ + s * w_ * 0.3 + 14, cy_ + 30], fill='#1a1a1a')
for k in range(40):   # 綠籬（分隔島）
    x = k * 27 + rv.uniform(-5, 5); d.ellipse([x - 22, 452, x + 22, 492], fill=['#3f6a2c', '#4b7a34', '#365e26', '#5a8a3a'][k % 4])
tr = Image.new('RGBA', (VW, VH), (0, 0, 0, 0)); td = ImageDraw.Draw(tr)
for tx_ in (60, 330, 600, 900):   # 路樹（樟樹／楓香）：粗樹幹、分枝、很多葉團（亮綠、逆光）
    td.polygon([(tx_ - 16, 500), (tx_ + 16, 500), (tx_ + 8, 240), (tx_ - 8, 240)], fill='#5a4a3a')
    for (dx, dy, wd) in ((-90, -150, 10), (100, -170, 10), (-40, -210, 7), (50, -230, 7)): td.line([(tx_, 300), (tx_ + dx, 300 + dy)], fill='#4e4032', width=wd)
    for k in range(900):   # 葉團：小的、很多；上面、右邊被太陽照亮（亮黃綠），下面、左邊暗
        a = rv.uniform(0, 2 * math.pi); rr = rv.uniform(0, 1) ** 0.5 * 220
        x = tx_ + math.cos(a) * rr; y = 160 + math.sin(a) * rr * 0.62
        lit = np.clip(0.5 + 0.5 * (math.cos(a) * 0.4 - math.sin(a) * 0.8) * (rr / 220) + rv.uniform(-0.25, 0.25), 0, 1)
        c0, c1 = np.array((40, 70, 30)), np.array((176, 204, 104)); c = tuple(int(v) for v in c0 + (c1 - c0) * lit)
        s = rv.uniform(5, 15); td.ellipse([x - s, y - s * 0.75, x + s, y + s * 0.75], fill=c + (255,))
    for k in range(60):   # 葉子中間透出來的天光
        a = rv.uniform(0, 2 * math.pi); rr = rv.uniform(0.3, 1) * 200; x = tx_ + math.cos(a) * rr; y = 150 + math.sin(a) * rr * 0.6; s = rv.uniform(2, 6)
        td.ellipse([x - s, y - s, x + s, y + s], fill=(236, 240, 226, 255))
im = Image.alpha_composite(im.convert('RGBA'), tr).convert('RGB').filter(ImageFilter.GaussianBlur(0.9)); d = ImageDraw.Draw(im)
d.rectangle([224, 200, 232, 640], fill='#8a8e90')   # 路牌的桿子（前景，不模糊）＋藍底白字「新生南路 Xinsheng S. Rd.」（臺北市的路牌：公共標示，不是品牌）；位置＝參考圖鏡頭從窗的左半看出去
d.rounded_rectangle([180, 196, 340, 254], 6, fill='#1f4f9a', outline='#f2f2f2', width=3)
d.text((260, 214), '新生南路', font=font(30), fill='#ffffff', anchor='mm'); d.text((260, 240), 'Xinsheng S. Rd.', font=font(15), fill='#ffffff', anchor='mm')
pim('view', 1024, 0, im)

# ---- 店名木牌（門片上掛的；0.3 × 0.44 m）：舊木板、刷白邊、毛筆感的「同弦樂器」＋吉他線稿（參考圖）
SW, SH = 384, 560
b = grain(SH, SW, '#c9a477', '#9a7048', freq=7, along='u', wav=1.4, contrast=0.4)
b *= (0.9 + 0.1 * noise(SH, SW, 3)[..., None]); yy, xx = np.mgrid[0:SH, 0:SW]
edge = np.minimum(np.minimum(xx, SW - 1 - xx), np.minimum(yy, SH - 1 - yy)); b[edge < 10] *= 0.72   # 邊緣比較深（手摸、日曬）
im = Image.fromarray((np.clip(b, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(im)
for i, ch in enumerate('同弦'): d.text((SW / 2 + (i - 0.5) * 150, 140), ch, font=font(128), fill='#2a1a10', anchor='mm', stroke_width=3, stroke_fill='#2a1a10')
for i, ch in enumerate('樂器'): d.text((SW / 2 + (i - 0.5) * 150, 290), ch, font=font(128), fill='#2a1a10', anchor='mm', stroke_width=3, stroke_fill='#2a1a10')
gx, gy = 120, 470   # 吉他線稿（斜的，琴頸往右上）
d.ellipse([gx - 52, gy - 40, gx + 22, gy + 30], outline='#2a1a10', width=4); d.ellipse([gx - 18, gy - 62, gx + 34, gy - 14], outline='#2a1a10', width=4)
d.ellipse([gx - 14, gy - 30, gx + 6, gy - 10], outline='#2a1a10', width=3)
d.line([(gx + 10, gy - 30), (SW - 40, 360)], fill='#2a1a10', width=6); d.line([(SW - 40, 360), (SW - 22, 344)], fill='#2a1a10', width=9)
pim('sign', 1024, 640, im)

# ---- 手寫紙條（新台幣；店裡的口氣）
rh = np.random.default_rng(77)
NOTES = [('note_string', 384, 420, ['弦一個月', '換一次'], '#23243a', 92, '#f4efe0'),
         ('note_setup', 256, 256, ['換弦 $150', '調琴 $300', '當天可取'], '#23305a', 34, '#f6f1e2'),
         ('note_lesson', 256, 256, ['吉他課', '週三 晚上', '一堂 $600'], '#5a2a20', 38, '#fbf3d6'),
         ('note_owner', 256, 128, ['不賣，老闆的'], '#3a2a20', 34, '#f4efe2'),
         ('note_wash', 256, 256, ['試彈前', '請先洗手', '謝謝 :)'], '#23305a', 38, '#eef3f0'),
         ('note_used', 256, 256, ['二手琴', '寄賣中', '歡迎詢問'], '#7a2a20', 38, '#f6efe0')]
# 排版（不重疊）
pos = {'note_string': (1408, 640), 'note_setup': (1792, 640), 'note_lesson': (1792, 896), 'note_owner': (1664, 1152), 'note_wash': (1408, 1152), 'note_used': (1792, 1280)}
for (nm, w, h, lines, col, sz, bg) in NOTES:
    p = paper(w, h, bg, rh); d = ImageDraw.Draw(p)
    if nm == 'note_owner':
        f = font(sz); d.text((w / 2, h / 2), lines[0], font=f, fill=col, anchor='mm', stroke_width=1, stroke_fill=col)
    else: hand_text(d, w, h, lines, col, sz, rh)
    if nm == 'note_string': d.line([(80, 380), (310, 372)], fill='#c83a2a', width=5)
    pim(nm, *pos[nm], p)

# ---- 價錢牌（掛在吉他上的小卡；新台幣）
PRICES = ['NT$4,800', 'NT$6,200', 'NT$8,900', 'NT$12,800', 'NT$15,600', 'NT$3,600', 'NT$22,000', 'NT$9,800']
for i, pr in enumerate(PRICES):
    w, h = 128, 96; p = paper(w, h, '#f7f3e8', rh); d = ImageDraw.Draw(p)
    d.ellipse([8, 8, 18, 18], outline='#8a8a8a', width=2); d.text((w / 2, 40), pr, font=font(22), fill='#c0262a' if i % 3 == 0 else '#1f2a44', anchor='mm', stroke_width=1, stroke_fill='#c0262a' if i % 3 == 0 else '#1f2a44')
    d.text((w / 2, 72), ['面單', '全單', '電吉他', '民謠', '二手', '入門', '手工', '旅行'][i], font=font(20), fill='#555555', anchor='mm')
    pim(f'ptag{i}', 640 + (i % 4) * 128, 1824 + (i // 4) * 96, p)

# ---- 弦的包裝（印刷；正面 192 × 192）：不同種類、粗細、顏色；只有中文品名和規格，沒有品牌
SP = [('#f1ece0', '#1f3f6e', '民謠吉他弦', '磷青銅', '012-053'), ('#232326', '#d4a84a', '電吉他弦', '鍍鎳', '010-046'), ('#8a2a26', '#f3e8d0', '民謠吉他弦', '80/20 黃銅', '011-052'),
      ('#e9d6a0', '#5a3420', '古典吉他弦', '尼龍 高張力', 'NORMAL'), ('#36695a', '#f1ece0', '電吉他弦', '純鎳', '009-042'), ('#c9d4dc', '#23283a', '貝斯弦', '不鏽鋼', '045-105'),
      ('#e8b4b0', '#5a2a30', '烏克麗麗弦', '碳纖', 'SOPRANO'), ('#f6f3ec', '#2f7a4f', '民謠吉他弦', '包膜 長效', '012-053')]
for i, (bg, fg, a, b_, c) in enumerate(SP):
    w = h = 192; p = Image.new('RGB', (w, h), bg); d = ImageDraw.Draw(p)
    d.rectangle([8, 8, w - 9, h - 9], outline=fg, width=4)
    d.rectangle([8, 8, w - 9, 52], fill=fg); d.text((w / 2, 31), a, font=font(30), fill=bg, anchor='mm')
    d.text((w / 2, 82), b_, font=font(24), fill=fg, anchor='mm')
    for k in range(6): d.line([(36, 104 + k * 7), (w - 36, 104 + k * 7)], fill=fg, width=1 + (5 - k) // 2)   # 六條弦的圖（粗細不同）
    d.text((w / 2, 166), c, font=font(26), fill=fg, anchor='mm')
    pim(f'spack{i}', (i % 4) * 192, 1408 + (i // 4) * 192, p)
    # 包裝的側面：只有色條
# ---- Pick 卡（吊卡，6 片 Pick）、移調夾的盒子、背帶的標籤
for i, (bg, cols, txt) in enumerate((('#1f2a44', ['#d94a3a', '#e9b03a', '#3a7ad9', '#f2efe6', '#7a3ad9', '#3ab07a'], '0.71mm'), ('#f2efe6', ['#2a2a2a', '#c8202a', '#2a2a2a', '#c8202a', '#2a2a2a', '#c8202a'], '0.46mm'),
                                    ('#7a2a26', ['#f2efe6', '#e9b03a', '#f2efe6', '#e9b03a', '#f2efe6', '#e9b03a'], '0.88mm'), ('#36695a', ['#e97ab0', '#7ad0e0', '#f0e070', '#b0e07a', '#e9a03a', '#f2efe6'], '綜合 6入'))):
    w, h = 160, 224; p = Image.new('RGB', (w, h), bg); d = ImageDraw.Draw(p)
    d.ellipse([w / 2 - 10, 8, w / 2 + 10, 28], fill='#d8d4c8')   # 吊孔
    for k, c in enumerate(cols):
        x, y = 40 + (k % 2) * 80, 72 + (k // 2) * 50; s = 22
        d.polygon([(x - s, y - s * 0.7), (x + s, y - s * 0.7), (x, y + s)], fill=c, outline='#111111')
    d.text((w / 2, 206), txt, font=font(22), fill='#f2efe6' if bg != '#f2efe6' else '#1f2a44', anchor='mm')
    pim(f'pcard{i}', i * 160, 1792, p)
cb = Image.new('RGB', (192, 128), '#1d1d1f'); d = ImageDraw.Draw(cb)   # 移調夾的盒子
d.rectangle([6, 6, 185, 121], outline='#d4a84a', width=3); d.text((96, 40), '移調夾', font=font(30), fill='#f1ece0', anchor='mm'); d.text((96, 88), '快速 單手', font=font(22), fill='#d4a84a', anchor='mm')
pim('capobox', 768, 1600, cb)
tn = Image.new('RGB', (192, 128), '#f1ece0'); d = ImageDraw.Draw(tn)
d.rectangle([6, 6, 185, 121], outline='#23283a', width=3); d.text((96, 40), '夾式調音器', font=font(26), fill='#23283a', anchor='mm'); d.text((96, 88), '吉他 貝斯 烏克', font=font(20), fill='#5a5a5a', anchor='mm')
pim('tunerbox', 960, 1600, tn)
# ---- 紙膠帶、髒污（櫃台、牆）、名片
tp = np.zeros((32, 128, 3), np.float32) + hx('#e6d6a6'); tp *= (0.92 + 0.08 * noise(32, 128, 2)[..., None]); pput('tape', 1024, 1408, tp)
tp2 = np.zeros((32, 128, 3), np.float32) + hx('#d2d6c8'); tp2 *= (0.9 + 0.1 * noise(32, 128, 2)[..., None]); pput('tape_old', 1024, 1440, tp2)   # 撕掉後留下的膠帶痕（灰）
cards = paper(192, 128, '#f6f3ec', rh); d = ImageDraw.Draw(cards); d.text((96, 44), '同弦樂器', font=font(30), fill='#2a1a10', anchor='mm'); d.text((96, 88), '新生南路 二樓', font=font(20), fill='#555555', anchor='mm')
pim('bizcard', 1152, 1408, cards)
# ---- 樂譜（譜架上：五線譜＋音符）、書的書背（樂譜書）
sc = paper(256, 320, '#f6f2e6', rh); d = ImageDraw.Draw(sc)
d.text((128, 26), '練習曲　第三首', font=font(22), fill='#222222', anchor='mm')
for st in range(6):
    y0 = 56 + st * 44
    for k in range(5): d.line([(16, y0 + k * 6), (240, y0 + k * 6)], fill='#444444', width=1)
    for n in range(9):
        x = 30 + n * 24; y = y0 + rh.integers(0, 5) * 6 - 3
        d.ellipse([x - 4, y - 3, x + 4, y + 3], fill='#111111'); d.line([(x + 4, y), (x + 4, y - 18)], fill='#111111', width=1)
pim('score', 1344, 1408, sc)
# ---- 溝槽板（米色烤漆木條；一格 15 cm 高的木條＋溝）
sl = grain(128, 256, '#efe3cc', '#d9c6a4', freq=5, along='u', wav=1.0, contrast=0.25)
sl[:10] = hx('#6a4a30') * (0.85 + 0.15 * noise(10, 256, 2)[..., None]); sl[10:13] = hx('#c9b28c')
pput('slat', 1600, 1536, sl)

pcells['frosted'] = [0, 320, 256, 128]   # v4：壓花玻璃原本 256 高，下半被背帶那一排蓋掉（v1～v3 門上的玻璃有一半是背帶的花紋）
Image.fromarray((pimg * 255).astype(np.uint8)).save(os.path.join(GEN, 'tongxian_props.png'))
emit = np.zeros_like(pimg); x, y, w, h = pcells['view']; emit[y:y + h, x:x + w] = pimg[y:y + h, x:x + w] * 0.85
Image.fromarray((emit * 255).astype(np.uint8)).save(os.path.join(GEN, 'tongxian_props_emit.png'))
json.dump({'guitar': {'size': GS, 'cells': gcells}, 'props': {'size': PS, 'cells': pcells}}, open(os.path.join(GEN, 'tongxian_atlas.json'), 'w'), indent=1)
print('ok', len(gcells), 'guitar cells;', len(pcells), 'prop cells')
