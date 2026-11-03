"""好拍運動（羽球、桌球、網球用品店）室內的自製貼圖 v2（CC，帳號 A 的建模子代理，2026-11-03 照參考圖 haopai_int 重做）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/haopai_tex.py [--preview <輸出.jpg>]
輸出到 tools/blender/env_second/textures/gen/：
  haopai_alpha.png  透明貼圖集（2048×1024）：鐵網格（0.5 m 一片）、洞洞板、羽球拍頭 8 色（框＋線＋拍喉，一張卡）、網球拍線、黃金葛葉片
  haopai_goods.png  印刷圖集（2048²）：羽球筒、膠皮、握把布吊卡、拍線包、桌球盒、紙箱（麥克筆字）、資料夾、手寫紙條（新台幣）、價目卡、
                    布簾（竹葉）、櫃台面板（掉漆、邊角變深）、褪色的比賽海報（虛構的「新生盃」）、月曆、抽屜面板
  haopai_emit.png   會亮的（1024×512）：日光燈管、電視（羽球比賽：綠色場地、兩個抽象的人影）、櫃台螢幕、穿線機小螢幕
  haopai_sign.png   招牌「好拍運動」（2048×400，招牌 3.6 × 0.7 m 的比例；米白底、深藍字、紅弧線、羽球人／羽球／桌球拍圖示）
  haopai_floor.png  地磚（1024²＝1.2 m：30 cm 米色方磚 4×4，每片色差、磚縫積灰、鞋底磨痕）
  haopai_atlas.json 每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上）
全部是程式畫的；字用系統的文泉驛正黑（wqy-zenhei，GPL＋字型例外：嵌進圖片可以）。沒有任何真實品牌、標誌（D77）；店名「好拍運動」是虛構的。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(620)
ATL = {}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def font(px): return ImageFont.truetype(FONT, int(px))


def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def uvbox(name, px0, py0, px1, py1, size):
    """像素（左上原點）→ Blender UV（左下原點）"""
    W, H = size; ATL[name] = [px0 / W, 1 - py1 / H, px1 / W, 1 - py0 / H]


def noise(w, h, k=8, amp=10, rng=R):
    n = rng.normal(0, 1, (h // k + 2, w // k + 2)); im = Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * 2 * amp


def grain(im, amp=6, k=6):
    a = np.asarray(im.convert('RGB'), np.float32); n = noise(im.size[0], im.size[1], k, amp)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def text_c(d, xy, s, f, fill, anchor='mm', stroke=0, sfill=None):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=sfill or fill)


def hand(im, box, lines, col='#23305a', size=40, rot=-2.0, paper='#f4efdf', tape=True, red=None):
    """手寫紙條：紙（有一點皺、黃）、麥克筆字（每個字稍微歪一點）、上緣的透明膠帶"""
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0
    p = Image.new('RGBA', (w, h), hx(paper)); a = np.asarray(p, np.float32); a[..., :3] += noise(w, h, 6, 7)[..., None]
    yy = np.linspace(0, 1, h)[:, None]; a[..., :3] *= (1 - 0.06 * yy)[..., None]   # 下緣比較黃
    p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(p)
    rr = np.random.default_rng(abs(hash(''.join(lines))) % 9999)
    n = len(lines); lh = h / (n + 0.6)
    for i, s in enumerate(lines):
        f = font(size * (1.12 if i == 0 else 0.92)); c = hx(red if (red and i == n - 1) else col)
        tw = sum(f.getlength(ch) for ch in s); x = (w - tw) / 2; y = lh * (i + 0.8)
        for ch in s:
            dy = rr.uniform(-2, 2); d.text((x, y + dy), ch, font=f, fill=c, anchor='lm', stroke_width=1, stroke_fill=c); x += f.getlength(ch) * rr.uniform(0.96, 1.04)
    p = p.rotate(rot, resample=Image.BICUBIC, expand=False, fillcolor=hx(paper))
    if tape:
        d = ImageDraw.Draw(p); d.rectangle([w // 2 - 34, 0, w // 2 + 34, 14], fill=(236, 232, 214, 255))
    im.paste(p, (x0, y0))


# ======================= 1. 透明貼圖集（2048×1024） =======================
AW, AH = 2048, 1024
A = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); d = ImageDraw.Draw(A)
# 鐵網格（512 px＝0.5 m；網目 10 cm；鐵絲 4 mm；烤漆灰、焊點）
GRID = '#7f8388'
for i in range(6):
    p = min(int(round(i * 102.4)), 508)
    d.rectangle([0, p - 2, 511, p + 2], fill=hx(GRID)); d.rectangle([p - 2, 0, p + 2, 511], fill=hx(GRID))
    d.line([0, p - 2, 511, p - 2], fill=hx('#a9adb1'), width=1); d.line([p - 2, 0, p - 2, 511], fill=hx('#a9adb1'), width=1)
for i in range(6):
    for j in range(6):
        x, y = min(int(i * 102.4), 508), min(int(j * 102.4), 508); d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=hx('#6f7378'))
uvbox('grid', 0, 0, 512, 512, (AW, AH))
# 洞洞板（老的米色烤漆板，25 mm 一個洞、邊緣有點黃、有釘子痕）
pb = Image.new('RGBA', (512, 512), hx('#cfc3a6')); pa = np.asarray(pb, np.float32); pa[..., :3] += noise(512, 512, 16, 10)[..., None]
pb = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8)); pd = ImageDraw.Draw(pb)
for i in range(13, 512, 26):
    for j in range(13, 512, 26): pd.ellipse([i - 5, j - 5, i + 5, j + 5], fill=(0, 0, 0, 0))
A.paste(pb, (0, 512)); uvbox('peg', 0, 512, 512, 1024, (AW, AH))
# 羽球拍頭（一張卡：拍框 0.236 × 0.196 m＋拍喉；卡 0.22 × 0.30 m → 192 × 256 px）：框、線、拍喉三種東西；8 種框的顏色（參考圖：藍、紅、黃、黑、白、粉紅、綠、紫）
HEAD = [('#2048a8', '#f0d23a'), ('#c8202a', '#1d1d21'), ('#e6d020', '#1d1d21'), ('#1d1d21', '#c8202a'), ('#e8e6e0', '#2048a8'),
        ('#d9579a', '#1d1d21'), ('#23874a', '#e8e6e0'), ('#4a2f8a', '#e6d020')]
for k, (fc, acc) in enumerate(HEAD):
    cx0 = 512 + k * 192; c = Image.new('RGBA', (192, 256), (0, 0, 0, 0)); cd = ImageDraw.Draw(c)
    ex0, ey0, ex1, ey1 = 14, 6, 178, 206   # 外框（0.196 × 0.236 m 的比例）
    cd.ellipse([ex0 + 8, ey0 + 8, ex1 - 8, ey1 - 8], fill=(0, 0, 0, 0))
    for s in range(16, 170, 7): cd.line([s + 4, ey0 + 4, s + 4, ey1 - 4], fill=hx('#efece2'), width=1)   # 主線（直）
    for s in range(14, 202, 7): cd.line([ex0 + 4, s, ex1 - 4, s], fill=hx('#e4e0d4'), width=1)            # 橫線
    m = Image.new('L', (192, 256), 0); ImageDraw.Draw(m).ellipse([ex0 + 7, ey0 + 7, ex1 - 7, ey1 - 7], fill=255)
    c.putalpha(Image.fromarray(np.minimum(np.asarray(c.split()[3]), np.asarray(m))))
    cd = ImageDraw.Draw(c)
    cd.ellipse([ex0, ey0, ex1, ey1], outline=hx(fc), width=9)
    cd.arc([ex0 + 2, ey0 + 2, ex1 - 2, ey1 - 2], 200, 320, fill=hx('#ffffff', 170), width=2)              # 框的高光
    cd.arc([ex0 + 1, ey0 + 1, ex1 - 1, ey1 - 1], 20, 80, fill=hx(acc), width=4)                            # 框側面的配色
    cd.polygon([(84, 204), (108, 204), (99, 250), (93, 250)], fill=hx(fc))                                 # 拍喉（T 字接頭）
    cd.rectangle([94, 228, 98, 256], fill=hx('#3a3c40'))
    A.paste(c, (cx0, 0)); uvbox(f'head{k}', cx0, 0, cx0 + 192, 256, (AW, AH))
# 網球拍線（米黃，15 mm 一條）
for kk in range(4, 512, 21):
    d.rectangle([512 + kk, 512, 512 + kk + 3, 1023], fill=hx('#e6dcbc')); d.rectangle([512, 512 + kk, 1023, 512 + kk + 3], fill=hx('#d6cba6'))
uvbox('ten_str', 512, 512, 1024, 1024, (AW, AH))
# 羽球拍線（給穿線機上那支、網格桶裡的；同一張卡沒有框）
for kk in range(0, 256, 8):
    d.rectangle([1024 + kk, 512, 1024 + kk + 1, 767], fill=hx('#f1efe8')); d.rectangle([1024, 512 + kk, 1279, 512 + kk + 1], fill=hx('#e6e3da'))
uvbox('bad_str', 1024, 512, 1280, 768, (AW, AH))
# 黃金葛葉片（心形，有黃色斑紋；4 種）
for k in range(4):
    lx = 1280 + k * 192; leaf = Image.new('RGBA', (192, 256), (0, 0, 0, 0)); ld = ImageDraw.Draw(leaf)
    g = ['#3f6f30', '#4d7d36', '#5a8a3c', '#3a6230'][k]
    ld.polygon([(96, 250), (20, 120), (24, 60), (60, 22), (96, 52), (132, 22), (168, 60), (172, 120)], fill=hx(g))
    la = np.asarray(leaf, np.float32); mk = la[..., 3] > 0
    n_ = noise(192, 256, 10, 40, np.random.default_rng(k)); yel = (n_ > 18) & mk
    la[yel, 0] += 70; la[yel, 1] += 55; la[yel, 2] += 5; la[mk, :3] += noise(192, 256, 4, 8)[mk][:, None]
    leaf = Image.fromarray(np.clip(la, 0, 255).astype(np.uint8)); ld = ImageDraw.Draw(leaf)
    ld.line([96, 250, 96, 50], fill=hx('#9ab060'), width=3)
    for t in range(3): ld.line([96, 200 - t * 45, 40 + t * 8, 140 - t * 40], fill=hx('#8aa45a'), width=2); ld.line([96, 200 - t * 45, 152 - t * 8, 140 - t * 40], fill=hx('#8aa45a'), width=2)
    A.paste(leaf, (lx, 512)); uvbox(f'leaf{k}', lx, 512, lx + 192, 768, (AW, AH))
# 白色塑膠籃（編織網目，透空）
bk = Image.new('RGBA', (512, 256), (0, 0, 0, 0)); bd = ImageDraw.Draw(bk)
bd.rectangle([0, 0, 511, 255], fill=hx('#ecebe6'))
for i in range(10, 500, 22):
    for j in range(24, 236, 22): bd.rounded_rectangle([i, j, i + 14, j + 12], radius=4, fill=(0, 0, 0, 0))
bd.rectangle([0, 0, 511, 18], fill=hx('#f2f1ec')); bd.rectangle([0, 238, 511, 255], fill=hx('#dcdbd4'))
A.paste(bk, (1024, 768)); uvbox('basket', 1024, 768, 1536, 1024, (AW, AH))
A.save(os.path.join(GEN, 'haopai_alpha.png'))

# ======================= 2. 印刷圖集（2048²） =======================
GW = 2048
G = Image.new('RGB', (GW, GW), hx('#d8d2c4')[:3])


def cell(name, x0, y0, w, h, draw):
    im = Image.new('RGB', (w, h), (200, 200, 200)); draw(im, ImageDraw.Draw(im)); G.paste(im, (x0, y0))
    uvbox(name, x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, (GW, GW))


def tube(cap):
    """羽球筒（繞一圈的標籤）：透明筒裡一層一層的白羽毛（參考圖的筒是白的、蓋子深藍）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#ece8dc'))
        for k in range(12):   # 一顆一顆疊起來的羽毛裙
            y = 18 + k * (h - 36) / 12; d.rectangle([0, y, w, y + 3], fill=hx('#c9c2b0')); d.rectangle([0, y + 4, w, y + 7], fill=hx('#f6f4ee'))
        d.rectangle([0, int(h * 0.42), w, int(h * 0.58)], fill=hx(cap)); d.rectangle([w * 0.1, h * 0.455, w * 0.4, h * 0.545], fill=hx('#f2efe6'))
        text_c(d, (w * 0.7, h * 0.5), '比賽級', font(h * 0.07), hx('#f2efe6'))
        d.rectangle([0, 0, w, 10], fill=hx(cap)); d.rectangle([0, h - 10, w, h], fill=hx(cap))
    return f


def rubber(sheet, head, label):
    """膠皮（透明袋裡的一片膠皮，上面一條印刷的頭）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#d9dde0')); d.rectangle([0, 0, w, 54], fill=hx(head)); d.rectangle([0, 46, w, 54], fill=hx('#c8a24a'))
        text_c(d, (w / 2, 25), label, font(26), hx('#f4f1e8'))
        d.rounded_rectangle([22, 68, w - 22, h - 18], radius=46, fill=hx(sheet))
        a = np.asarray(im, np.float32); a[68:h - 18, 22:w - 22] += noise(w - 44, h - 86, 3, 9)[..., None]
        im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
        d = ImageDraw.Draw(im); d.line([26, 64, w - 30, 200], fill=(255, 255, 255), width=4); d.line([40, 64, w - 10, 150], fill=(240, 244, 246), width=2)   # 塑膠袋反光
    return f


def grip(col, dark=False):
    """握把布吊卡（128×256：上面的掛孔、透明窗裡三卷握把布）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#2a3650' if dark else '#eef0f2')); d.rectangle([0, 0, w, 42], fill=hx('#1f2a44'))
        d.rounded_rectangle([w // 2 - 18, 12, w // 2 + 18, 26], radius=7, fill=hx('#555a60'))
        text_c(d, (w / 2, 54), '握把布', font(20), hx('#f2efe6' if dark else '#1f2a44'))
        for k in range(3):
            y = 74 + k * 56; d.rounded_rectangle([18, y, w - 18, y + 46], radius=20, fill=hx(col))
            for s in range(0, w, 12): d.line([18 + s, y, 6 + s, y + 46], fill=tuple(int(v * 0.85) for v in hx(col)[:3]), width=3)
            d.line([24, y + 8, w - 24, y + 8], fill=(255, 255, 255), width=2)
        d.rectangle([0, h - 16, w, h], fill=hx('#c8202a'))
    return f


def strpack(col):
    """拍線包（128×256：深色紙卡、一卷線）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#1f2530')); d.rectangle([0, 0, w, 30], fill=hx('#c9cdd2')); d.ellipse([w // 2 - 9, 8, w // 2 + 9, 22], fill=hx('#1f2530'))
        for r in range(20, 54, 4): d.ellipse([w // 2 - r, 120 - r, w // 2 + r, 120 + r], outline=hx(col), width=3)
        text_c(d, (w / 2, 196), '拍線 10m', font(20), hx('#f2efe6')); d.rectangle([12, 224, w - 12, 236], fill=hx(col))
    return f


def ballbox(ball, n=6):
    """桌球盒（透明盒、白框，看得到六顆球；參考圖左牆和玻璃櫃裡的）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f1f0ea')); d.rectangle([10, 10, w - 10, h - 40], fill=hx('#d9e0e4'))
        for k in range(n):
            x = 18 + (k % 3) * (w - 36) / 3; y = 18 + (k // 3) * (h - 60) / 2; r = min((w - 36) / 3, (h - 60) / 2) * 0.46
            cx_, cy_ = x + (w - 36) / 6, y + (h - 60) / 4; d.ellipse([cx_ - r, cy_ - r, cx_ + r, cy_ + r], fill=hx(ball))
            d.ellipse([cx_ - r * 0.5, cy_ - r * 0.6, cx_ - r * 0.1, cy_ - r * 0.2], fill=(255, 255, 250))
        d.rectangle([0, h - 34, w, h], fill=hx('#1d3f7a')); text_c(d, (w / 2, h - 17), '三星球 6入', font(18), hx('#f4f1e8'))
    return f


def kraft(note, tape=True, rot=0):
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), hx('#b08a5c')[:3]); base = grain(base, 9, 5); im.paste(base); d = ImageDraw.Draw(im)
        if tape: d.rectangle([w // 2 - 22, 0, w // 2 + 22, h], fill=hx('#c4a679'))
        d.rectangle([0, 0, w - 1, h - 1], outline=hx('#8e6a40'), width=4)
        if note: text_c(d, (w * 0.42, h * 0.62), note, font(h * 0.15), hx('#2a2a2a'))
        d.rectangle([w * 0.62, h * 0.1, w * 0.92, h * 0.3], fill=hx('#efe9dc'))
        for k in range(3): d.line([w * 0.65, h * (0.14 + k * 0.05), w * 0.88, h * (0.14 + k * 0.05)], fill=hx('#555555'), width=2)
    return f


def binders(im, d):
    cols = ['#2f4f8a', '#c8c3b5', '#2f4f8a', '#2f6a4a', '#d8c35a', '#3a3a3a', '#2f4f8a', '#c8c3b5']
    w, h = im.size
    for k, c in enumerate(cols):
        x = k * w // 8; d.rectangle([x, 0, x + w // 8 - 1, h], fill=hx(c)); d.rectangle([x + 6, 30, x + w // 8 - 7, 96], fill=hx('#f2efe6'))
        text_c(d, (x + w // 16, 63), str(100 + k * 3), font(16), hx('#333333'))
        d.ellipse([x + w // 16 - 7, 190, x + w // 16 + 7, 204], fill=hx('#222222')); d.line([x, 0, x, h], fill=hx('#1a1a1a'), width=1)


def whitebox(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#ecebe6')); d.polygon([(0, h * 0.6), (w, h * 0.35), (w, h * 0.5), (0, h * 0.75)], fill=hx('#3b6fb0'))
    text_c(d, (w * 0.3, h * 0.25), '羽球拍', font(h * 0.14), hx('#1f2a44')); d.rectangle([0, 0, w - 1, h - 1], outline=hx('#c8c6be'), width=4)


def ttbox(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#8a2026')); d.rectangle([12, 12, w - 12, h - 12], outline=hx('#e8c46a'), width=4)
    d.ellipse([w * 0.25, h * 0.2, w * 0.6, h * 0.7], fill=hx('#1b1b1d')); d.rectangle([w * 0.55, h * 0.42, w * 0.82, h * 0.5], fill=hx('#b98756'))
    text_c(d, (w * 0.5, h * 0.85), '桌球拍', font(h * 0.12), hx('#f4f1e8'))


def bagfab(im, d):
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#23304f')[:3]); im.paste(grain(base, 8, 2)); d = ImageDraw.Draw(im)
    d.rectangle([0, h * 0.42, w, h * 0.5], fill=hx('#c23b3b')); d.line([0, 2, w, 2], fill=hx('#111111'), width=6)
    for k in range(0, w, 8): d.line([k, 0, k, h], fill=hx('#1c2742'), width=1)


def tags(im, d):
    """價目卡（白卡紅框、新台幣）：一格裡 2×3 張，Blender 用其中一張"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f6f3ea'))
    prices = ['$1,280', '$980', '$1,980', '$2,450', '$1,680', '$3,200']
    for k, p in enumerate(prices):
        x, y = (k % 2) * w // 2, (k // 2) * h // 3
        d.rectangle([x + 3, y + 3, x + w // 2 - 4, y + h // 3 - 4], outline=hx('#d23a3a'), width=4)
        text_c(d, (x + w // 4, y + h // 6 + 4), p, font(h * 0.11), hx('#23305a'))
    for k in range(6): ATL[f'tag{k}'] = None


def curtain(im, d):
    """布簾（參考圖最裡面的門簾：米灰底、淡淡的竹葉；下襬髒一點）"""
    w, h = im.size; base = Image.new('RGB', (w, h), hx('#b9ad92')[:3]); im.paste(grain(base, 6, 3)); d = ImageDraw.Draw(im)
    rr = np.random.default_rng(5)
    for k in range(60):
        x, y = rr.uniform(0, w), rr.uniform(0, h); a = rr.uniform(-1.2, 1.2); L_ = rr.uniform(26, 50)
        dx, dy = math.sin(a) * L_, math.cos(a) * L_; nx, ny = -dy * 0.13, dx * 0.13
        d.polygon([(x, y), (x + dx / 2 + nx, y + dy / 2 + ny), (x + dx, y + dy), (x + dx / 2 - nx, y + dy / 2 - ny)], fill=hx('#7f7a5c'))
    for k in range(0, w, 16): d.line([k, 0, k, h], fill=hx('#a89c80'), width=2)   # 布的褶子
    a = np.asarray(im, np.float32); a *= np.linspace(1.0, 0.8, h)[:, None, None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def counter_face(im, d):
    """木櫃台面向走道的那一面（照參考圖：淺木色的直紋夾板、邊框掉漆露出白底、下緣踢黑）——u 沿著櫃台、v 往上"""
    w, h = im.size
    base = np.zeros((h, w, 3), np.float32) + np.array(hx('#9a7650')[:3], np.float32)
    st = noise(w, h, 3, 10) + noise(w, h, 24, 14); base += st[..., None] * np.array([1.0, 0.85, 0.6])
    for k in range(0, w, 3): base[:, k] *= 1 + 0.04 * math.sin(k * 0.37)
    yy = np.linspace(0, 1, h)[:, None]; base *= (0.72 + 0.28 * np.clip(yy * 3, 0, 1))[..., None][::-1]   # 下緣（踢腳附近）暗
    edge = np.zeros((h, w), bool); edge[:22] = True; edge[-30:] = True; edge[:, :18] = True; edge[:, -18:] = True
    base[edge] *= 0.78
    rr = np.random.default_rng(11)
    im.paste(Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    for k in range(60):   # 掉漆（露出米白底）：多半在邊框和下緣
        x = rr.choice([rr.uniform(0, 22), rr.uniform(w - 22, w), rr.uniform(0, w)]); y = rr.choice([rr.uniform(0, 26), rr.uniform(h - 34, h), rr.uniform(0, h)])
        r = rr.uniform(2, 8); d.ellipse([x - r, y - r * 0.6, x + r, y + r * 0.6], fill=hx('#d8cdb4'))
    for k in range(5): x = 20 + k * (w - 40) / 5; d.line([x, 24, x, h - 32], fill=hx('#6d5134'), width=3)   # 夾板的接縫
    d.rectangle([w * 0.55, h * 0.3, w * 0.66, h * 0.36], fill=hx('#e9e2c8'))   # 撕掉一半的膠帶痕
    d.rectangle([w * 0.2, h * 0.55, w * 0.24, h * 0.62], fill=hx('#b49f7a'))


def counter_top(im, d):
    """櫃台檯面（淺木色、邊緣磨亮、壓著一張透明墊）"""
    w, h = im.size; base = np.zeros((h, w, 3), np.float32) + np.array(hx('#a8825a')[:3], np.float32)
    base += (noise(w, h, 3, 9) + noise(w, h, 32, 12))[..., None] * np.array([1.0, 0.85, 0.6])
    im.paste(Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.rectangle([w * 0.25, h * 0.15, w * 0.75, h * 0.85], outline=hx('#c9b591'), width=3)


def poster(im, d):
    """褪色的比賽海報（虛構：第十二屆新生盃羽球賽；曬過太陽，藍色退成灰藍、四角有膠帶）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#e9e1cc')); d.rectangle([0, 0, w, h * 0.42], fill=hx('#6f8fae'))
    d.ellipse([w * 0.3, h * 0.06, w * 0.7, h * 0.34], fill=hx('#e9e1cc'))
    d.polygon([(w * 0.5, h * 0.1), (w * 0.42, h * 0.26), (w * 0.58, h * 0.26)], fill=hx('#6f8fae'))
    text_c(d, (w / 2, h * 0.5), '第十二屆', font(w * 0.12), hx('#8a4a46'))
    text_c(d, (w / 2, h * 0.62), '新生盃', font(w * 0.2), hx('#3d4f6e'))
    text_c(d, (w / 2, h * 0.74), '羽球賽', font(w * 0.16), hx('#3d4f6e'))
    text_c(d, (w / 2, h * 0.87), '報名：本店', font(w * 0.09), hx('#6a6a6a'))
    a = np.asarray(im, np.float32); a = a * 0.86 + 30; a[..., 2] -= 8; im.paste(Image.fromarray(np.clip(a + noise(w, h, 8, 6)[..., None], 0, 255).astype(np.uint8)))
    d = ImageDraw.Draw(im)
    for (x, y) in ((0, 0), (w - 40, 0), (0, h - 16), (w - 40, h - 16)): d.rectangle([x, y, x + 40, y + 16], fill=hx('#eee8cf'))


def calendar(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f4f0e4')); d.rectangle([0, 0, w, h * 0.38], fill=hx('#9a6b4a'))
    text_c(d, (w / 2, h * 0.19), '十一月', font(w * 0.16), hx('#f4f0e4'))
    for r in range(5):
        for c in range(7):
            x = 10 + c * (w - 20) / 7; y = h * 0.44 + r * h * 0.11
            text_c(d, (x + (w - 20) / 14, y + h * 0.04), str(r * 7 + c + 1) if r * 7 + c < 30 else '', font(h * 0.06), hx('#c8202a' if c == 0 else '#333333'))
    d.ellipse([w * 0.5, h * 0.55, w * 0.64, h * 0.64], outline=hx('#c8202a'), width=3)


def drawer(im, d):
    """塑膠抽屜櫃的抽屜面（半透明白、有把手凹槽、裡面看得到東西的影子）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#dcdcd6')); d.rectangle([8, 8, w - 8, h - 8], fill=hx('#c9cac6'))
    d.rectangle([20, 40, w * 0.5, h - 30], fill=hx('#a9aaa6')); d.rectangle([w * 0.55, 60, w - 24, h - 24], fill=hx('#b3a99a'))
    d.rounded_rectangle([w * 0.35, 14, w * 0.65, 34], radius=8, fill=hx('#9ea0a2'))


def monitor_back(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#2b2b2d'))
    for k in range(8): d.line([w * 0.2, h * (0.2 + k * 0.06), w * 0.8, h * (0.2 + k * 0.06)], fill=hx('#202022'), width=3)


cell('tube_a', 0, 0, 256, 256, tube('#1f2f5e')); cell('tube_b', 256, 0, 256, 256, tube('#2f5f3a'))
cell('rub_red', 512, 0, 256, 256, rubber('#b8262a', '#1f2a44', '反膠')); cell('rub_blk', 768, 0, 256, 256, rubber('#1b1b1d', '#7a1f22', '反膠'))
cell('rub_tt', 1024, 0, 256, 256, rubber('#c0262a', '#2b2b2d', '顆粒'))
cell('ball_org', 1280, 0, 256, 256, ballbox('#f08a24')); cell('ball_wht', 1536, 0, 256, 256, ballbox('#f4f2ec'))
cell('whitebox', 1792, 0, 256, 256, whitebox)
for k, (nm, col, dark) in enumerate((('grip_w', '#f4f3ee', False), ('grip_p', '#ef93ab', False), ('grip_y', '#f0d23a', False), ('grip_b', '#3f8fd0', False),
                                     ('grip_k', '#2a2a2e', False), ('grip_g', '#5fb35a', True), ('grip_o', '#f08a24', True), ('grip_v', '#8a5fc0', True))):
    cell(nm, k * 128, 256, 128, 256, grip(col, dark))
for k, (nm, col) in enumerate((('str_b', '#3f7fd0'), ('str_y', '#f0d23a'), ('str_w', '#f2f0ea'), ('str_r', '#d23a3a'), ('str_g', '#5fb35a'), ('str_p', '#ef93ab'), ('str_o', '#f08a24'), ('str_k', '#555a60'))):
    cell(nm, 1024 + k * 128, 256, 128, 256, strpack(col))
cell('kraft1', 0, 512, 256, 256, kraft('羽球 12打')); cell('kraft2', 256, 512, 256, 256, kraft('', tape=False)); cell('kraft3', 512, 512, 256, 256, kraft('桌球'))
cell('kraft4', 768, 512, 256, 256, kraft('網球拍 ×6')); cell('binders', 1024, 512, 256, 256, binders); cell('ttbox', 1280, 512, 256, 256, ttbox)
cell('bag', 1536, 512, 256, 256, bagfab); cell('tags', 1792, 512, 256, 256, tags)
# 手寫紙條（256×256，Blender 照紙條的比例取一部分）
NOTES = [('note_string', ['穿線', '$250 起', '約20分鐘'], None), ('note_grip', ['握把布', '3條 $100'], '#c8202a'), ('note_sale', ['特價', 'NT$1,680'], '#c8202a'),
         ('note_swing', ['請勿試揮', '謝謝'], None), ('note_tennis', ['網球拍', '$2,980 起'], None), ('note_line', ['拍線久了會鬆', '記得來換'], None),
         ('note_tt', ['桌球拍', '代貼膠皮'], None), ('note_hours', ['營業 12-21點', '週日休'], None)]
for k, (nm, lines, red) in enumerate(NOTES):
    x0, y0 = k * 256, 768
    def f(im, d, lines=lines, red=red): hand(im, (0, 0, 256, 256), lines, size=44 if max(len(s) for s in lines) < 6 else 34, rot=(-3 + (len(lines[0]) % 3) * 2), red=red)
    cell(nm, x0, y0, 256, 256, f)
cell('curtain', 0, 1024, 256, 512, curtain)
cell('counter_face', 256, 1024, 1024, 256, counter_face)
cell('counter_top', 256, 1280, 512, 256, counter_top)
cell('poster', 1280, 1024, 256, 384, poster)
cell('calendar', 1536, 1024, 256, 320, calendar)
cell('drawer', 1792, 1024, 256, 128, drawer)
cell('monback', 1792, 1152, 256, 128, monitor_back)
cell('note_wide', 768, 1280, 512, 256, lambda im, d: hand(im, (0, 0, 512, 256), ['球拍穿線', '當天可取'], size=56, rot=-1.5))
# 價目卡的六張（tags 那一格裡 2×3）
u0, v0, u1, v1 = ATL['tags']
for k in range(6):
    cx, cy = k % 2, k // 2; ATL[f'tag{k}'] = [u0 + (u1 - u0) * cx / 2, v1 - (v1 - v0) * (cy + 1) / 3, u0 + (u1 - u0) * (cx + 1) / 2, v1 - (v1 - v0) * cy / 3]
G.save(os.path.join(GEN, 'haopai_goods.png'))

# ======================= 3. 會亮的（1024×512） =======================
EW, EH = 1024, 512
E = Image.new('RGB', (EW, EH), (0, 0, 0)); d = ImageDraw.Draw(E)
for x in range(0, 128):   # 燈管：中間最亮
    v = int(235 + 20 * math.cos((x - 64) / 64 * math.pi / 2)); d.line([x, 0, x, 255], fill=(v, v, min(255, v + 2)))
uvbox('tube', 40, 40, 88, 216, (EW, EH))
# 電視（羽球比賽：深藍的場館、綠色場地、白線、網子、兩個抽象人影；比分只有色塊）
tv = Image.new('RGB', (512, 288), hx('#1b2c58')); td = ImageDraw.Draw(tv)
td.rectangle([0, 0, 512, 70], fill=hx('#2a3d70'))
for k in range(0, 512, 22): td.rectangle([k, 40, k + 12, 62], fill=hx('#3a5088'))   # 觀眾席
td.polygon([(70, 280), (442, 280), (380, 92), (132, 92)], fill=hx('#2f9a78'))
for t in (0.0, 0.07, 0.5, 0.93, 1.0):
    y = 280 - t * 188; xl = 70 + (132 - 70) * t; xr = 442 - (442 - 380) * t; td.line([xl, y, xr, y], fill=(236, 240, 236), width=3)
td.line([70, 280, 132, 92], fill=(236, 240, 236), width=3); td.line([442, 280, 380, 92], fill=(236, 240, 236), width=3); td.line([256, 280, 256, 92], fill=(236, 240, 236), width=2)
td.rectangle([100, 176, 412, 182], fill=(226, 226, 226)); td.line([100, 150, 100, 182], fill=(200, 200, 200), width=3); td.line([412, 150, 412, 182], fill=(200, 200, 200), width=3)
for (px_, py_, sc, shirt) in ((300, 120, 0.7, '#e8e6e0'), (205, 250, 1.0, '#1f2f5e')):   # 人影：頭、身體、腳、拍子
    td.ellipse([px_ - 7 * sc, py_ - 52 * sc, px_ + 7 * sc, py_ - 38 * sc], fill=hx('#d8b090'))
    td.rectangle([px_ - 9 * sc, py_ - 38 * sc, px_ + 9 * sc, py_ - 14 * sc], fill=hx(shirt))
    td.rectangle([px_ - 8 * sc, py_ - 14 * sc, px_ - 2 * sc, py_], fill=hx('#202020')); td.rectangle([px_ + 2 * sc, py_ - 14 * sc, px_ + 8 * sc, py_], fill=hx('#202020'))
    td.line([px_ + 9 * sc, py_ - 34 * sc, px_ + 22 * sc, py_ - 56 * sc], fill=hx('#d8b090'), width=max(2, int(3 * sc))); td.ellipse([px_ + 18 * sc, py_ - 70 * sc, px_ + 30 * sc, py_ - 54 * sc], outline=(240, 240, 240), width=2)
td.rectangle([16, 250, 120, 266], fill=hx('#c93a3a')); td.rectangle([16, 268, 120, 280], fill=hx('#e8e8e8')); td.rectangle([122, 250, 146, 280], fill=hx('#f0d23a'))
E.paste(tv, (128, 0)); uvbox('tv', 130, 2, 638, 286, (EW, EH))
# 櫃台螢幕（淺色表格）
d.rectangle([640, 0, 895, 191], fill=hx('#dfe8f0')); d.rectangle([640, 0, 895, 20], fill=hx('#3a6aa8'))
for k in range(9): d.rectangle([650, 32 + k * 17, 650 + 60 + (k * 37) % 120, 40 + k * 17], fill=hx('#8aa0b8'))
uvbox('pos', 642, 2, 893, 189, (EW, EH))
# 穿線機的小螢幕（灰綠底、七段數字的色塊）
d.rectangle([896, 0, 1023, 63], fill=hx('#9fb59a'))
for k in range(4): d.rectangle([906 + k * 28, 14, 924 + k * 28, 50], outline=hx('#24321f'), width=4)
uvbox('lcd', 898, 2, 1022, 62, (EW, EH))
E.save(os.path.join(GEN, 'haopai_emit.png'))

# ======================= 4. 招牌（2048×400） =======================
SW, SH = 2048, 400
S = Image.new('RGB', (SW, SH), hx('#e6dcc3')[:3])
sa = np.asarray(S, np.float32) + noise(SW, SH, 10, 6)[..., None]
yy = np.linspace(-1, 1, SH)[:, None]; xx = np.linspace(-1, 1, SW)[None, :]
sa *= (1 - 0.10 * (np.abs(xx) ** 4 + np.abs(yy) ** 4))[..., None]   # 邊緣舊、黃
sa[..., 2] -= 10 * (np.abs(yy) ** 2)
S = Image.fromarray(np.clip(sa, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(S)
NAVY = hx('#23345e')
f = font(250); x = 360
for ch in '好拍運動':
    d.text((x, 175), ch, font=f, fill=NAVY, anchor='lm', stroke_width=5, stroke_fill=NAVY); x += 290
d.arc([380, 268, 1560, 480], 200, 340, fill=hx('#a8312e'), width=22)   # 紅弧線（字底下）
# 左邊：羽球人（跳殺的剪影）
def poly(pts, ox, oy, s): return [(ox + px * s, oy + py * s) for px, py in pts]
ox, oy = 150, 200
d.ellipse([ox + 18, oy - 128, ox + 58, oy - 88], fill=NAVY)                                           # 頭
d.polygon(poly([(0, 0), (30, -80), (62, -82), (70, -20), (40, 10)], ox, oy, 1.0), fill=NAVY)        # 身體
d.line([ox + 60, oy - 76, ox + 120, oy - 150], fill=NAVY, width=16)                                   # 揮拍的手
d.ellipse([ox + 108, oy - 196, ox + 146, oy - 150], outline=NAVY, width=7); d.line([ox + 118, oy - 156, ox + 122, oy - 150], fill=NAVY, width=6)
d.line([ox + 30, oy - 70, ox - 20, oy - 110], fill=NAVY, width=14)                                    # 另一隻手
d.line([ox + 10, oy + 0, ox - 40, oy + 70], fill=NAVY, width=18); d.line([ox + 44, oy + 6, ox + 86, oy + 80], fill=NAVY, width=18)   # 腳
# 右邊：羽球、桌球拍
bx, by = 1610, 190
d.ellipse([bx - 28, by + 38, bx + 28, by + 92], fill=NAVY)                                            # 球頭
d.polygon([(bx - 26, by + 50), (bx - 70, by - 90), (bx + 70, by - 90), (bx + 26, by + 50)], outline=NAVY, width=8)
for t in range(-3, 4): d.line([bx + t * 6, by + 46, bx + t * 20, by - 88], fill=NAVY, width=4)
d.line([bx - 66, by - 50, bx + 66, by - 50], fill=NAVY, width=5)
px_, py_ = 1820, 175
d.ellipse([px_ - 80, py_ - 85, px_ + 80, py_ + 65], fill=NAVY); d.ellipse([px_ - 62, py_ - 68, px_ + 2, py_ - 10], fill=hx('#33477a'))
d.polygon([(px_ + 38, py_ + 48), (px_ + 62, py_ + 30), (px_ + 128, py_ + 120), (px_ + 104, py_ + 140)], fill=hx('#b98756'))
d.ellipse([px_ + 150, py_ + 30, px_ + 192, py_ + 72], fill=hx('#f2efe6'), outline=NAVY, width=4)       # 桌球
d.rectangle([4, 4, SW - 5, SH - 5], outline=hx('#b9ab8c'), width=8)
for k in range(14):   # 舊招牌的污點、鏽水痕
    xk = R.uniform(0, SW); d.line([xk, SH - 10, xk + R.uniform(-6, 6), SH - R.uniform(20, 70)], fill=hx('#c9bb9c'), width=int(R.uniform(2, 6)))
S.save(os.path.join(GEN, 'haopai_sign.png'))

# ======================= 5. 地磚（1024²＝1.2 m） =======================
FW = 1024; T = FW // 4
F = np.zeros((FW, FW, 3), np.float32)
rf = np.random.default_rng(31)
for i in range(4):
    for j in range(4):
        base = np.array(hx('#ddd2be')[:3], np.float32) * rf.uniform(0.95, 1.04) + rf.uniform(-4, 4, 3)
        F[j * T:(j + 1) * T, i * T:(i + 1) * T] = base
F += noise(FW, FW, 5, 5, rf)[..., None] + noise(FW, FW, 40, 8, rf)[..., None] * np.array([1.0, 0.95, 0.85])
for k in range(0, FW, T):   # 磚縫（積灰）
    F[k:k + 4, :] = np.array(hx('#9c8e78')[:3]); F[:, k:k + 4] = np.array(hx('#9c8e78')[:3])
    F[k + 4:k + 7, :] *= 0.94; F[:, k + 4:k + 7] *= 0.94
fl = Image.fromarray(np.clip(F, 0, 255).astype(np.uint8)); fd = ImageDraw.Draw(fl)
for k in range(40):   # 鞋底的黑色磨痕、小污點
    x, y = rf.uniform(0, FW), rf.uniform(0, FW); a = rf.uniform(0, math.pi); L_ = rf.uniform(8, 40)
    fd.line([x, y, x + L_ * math.cos(a), y + L_ * math.sin(a)], fill=(120, 112, 100), width=int(rf.uniform(1, 3)))
fl = fl.filter(ImageFilter.GaussianBlur(0.6)); fl.save(os.path.join(GEN, 'haopai_floor.png'))

json.dump(ATL, open(os.path.join(GEN, 'haopai_atlas.json'), 'w'), indent=1)
print('ok', len(ATL), 'cells')
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]
    pv = Image.new('RGB', (2048, 2048 + 512 + 400 + 512), (60, 60, 60)); pv.paste(G, (0, 0))
    bg = Image.new('RGBA', (AW, AH), (90, 90, 90, 255)); bg.alpha_composite(A); pv.paste(bg.convert('RGB').resize((1024, 512)), (0, 2048))
    pv.paste(E.resize((1024, 512)), (1024, 2048)); pv.paste(S, (0, 2560)); pv.paste(fl.resize((512, 512)), (0, 2960))
    pv.resize((1024, (2048 + 512 + 400 + 512) // 2)).save(out, quality=80)
