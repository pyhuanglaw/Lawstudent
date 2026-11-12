"""新生運動廣場室內的自製貼圖 v3（CC，帳號 A 的建模子代理，2026-11-04 照使用者的參考圖 xinsheng_sports_int 重做）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/xinsheng_tex.py [--preview <輸出.jpg>]
輸出到 tools/blender/env_second/textures/gen/：
  xs_goods.png   印刷圖集（2048²）：籃球、排球、網球（球面展開，接縫畫在貼圖上）、三件展示球衣的胸前字（系名＋背號）、法律系 7 號、
                 護膝／護肘／護腕／運動襪吊卡、價目卡（新台幣）、手寫紙條、紙箱（麥克筆字）、鞋盒、資料夾、窗外的樹、後門外的街、虛構的比賽海報、收銀台面板
  xs_sign.png    招牌（4096×1024）：夾層前緣主招牌「新生運動廣場」（9.28 × 0.93 m）、二樓「系隊球衣訂做」（3.0 × 0.73 m）、球衣尺寸表（1.4 × 1.75 m）、
                 右邊牆上的樓層指示牌（1.25 × 3.3 m；在圖集裡轉 90° 放）——字都畫在貼圖上，照板子的比例畫，不擠扁
  xs_alpha.png   透明貼圖（1024×512）：鐵網格（球架、護具網牆、端架）、網籃
  xs_emit.png    會亮的（512×256）：日光燈管、螢幕、後門外的光
  xs_floor.png   地磚（1024²＝1.8 m：60 cm 米色磚 3×3，每片色差、磚縫積灰、鞋底磨痕）
  xs_atlas.json  每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上）
全部是程式畫的；字用系統的文泉驛正黑（wqy-zenhei，GPL＋字型例外：嵌進圖片可以）。沒有任何真實品牌、標誌（D77）；店名「新生運動廣場」、系名都是虛構的，
參考圖上球衣的校名（其中兩個是真的學校）換成系名（電機系、土木系、舊序章）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(1104)
ATL = {}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'


def font(px): return ImageFont.truetype(FONT, max(8, int(px)))


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


def spaced(d, cx, cy, s, f, fill, gap, stroke=0):
    """一個字一個字排（字距 gap 倍字寬）：招牌的字要照參考圖拉開，不是把整行字拉寬（不擠扁）"""
    ws = [f.getlength(ch) for ch in s]; tot = sum(ws) + gap * f.size * (len(s) - 1); x = cx - tot / 2
    for ch, w in zip(s, ws):
        d.text((x, cy), ch, font=f, fill=fill, anchor='lm', stroke_width=stroke, stroke_fill=fill); x += w + gap * f.size


def hand(im, box, lines, col='#23305a', size=40, rot=-2.0, paper='#f4efdf', tape=True, red=None):
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0
    p = Image.new('RGBA', (w, h), hx(paper)); a = np.asarray(p, np.float32); a[..., :3] += noise(w, h, 6, 7)[..., None]
    yy = np.linspace(0, 1, h)[:, None]; a[..., :3] *= (1 - 0.06 * yy)[..., None]
    p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(p)
    rr = np.random.default_rng(abs(hash(''.join(lines))) % 9999)
    n = len(lines); lh = h / (n + 0.6)
    for i, s in enumerate(lines):
        f = font(size * (1.12 if i == 0 else 0.92)); c = hx(red if (red and i == n - 1) else col)
        tw = sum(f.getlength(ch) for ch in s); x = (w - tw) / 2; y = lh * (i + 0.8)
        for ch in s:
            dy = rr.uniform(-2, 2); d.text((x, y + dy), ch, font=f, fill=c, anchor='lm', stroke_width=1, stroke_fill=c); x += f.getlength(ch) * rr.uniform(0.96, 1.04)
    p = p.rotate(rot, resample=Image.BICUBIC, expand=False, fillcolor=hx(paper))
    if tape: d = ImageDraw.Draw(p); d.rectangle([w // 2 - 30, 0, w // 2 + 30, 12], fill=(236, 232, 214, 255))
    im.paste(p, (x0, y0))


# ======================= 1. 印刷圖集（2048²） =======================
GW = 2048
G = Image.new('RGB', (GW, GW), hx('#d8d2c4')[:3])


def cell(name, x0, y0, w, h, draw, pad=2):
    im = Image.new('RGB', (w, h), (200, 200, 200)); draw(im, ImageDraw.Draw(im)); G.paste(im, (x0, y0))
    uvbox(name, x0 + pad, y0 + pad, x0 + w - pad, y0 + h - pad, (GW, GW))


def basketball(im, d):
    """籃球（球面展開：u 繞一圈、v 從北極到南極）：橘色、顆粒、八片的黑色接縫（兩條經線、赤道、兩條彎的線）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + np.array(hx('#c8622e')[:3], np.float32)
    a += noise(w, h, 2, 14)[..., None] * np.array([1.0, 0.7, 0.45]) + noise(w, h, 24, 10)[..., None]
    vv = np.linspace(0, 1, h)[:, None]; a *= (0.92 + 0.08 * np.sin(vv * math.pi))[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im); K = hx('#1d1410'); lw = 7
    for u in (0.0, 0.5, 1.0): d.line([u * w, 0, u * w, h], fill=K, width=lw * 2 if u in (0, 1) else lw)
    d.line([0, h / 2, w, h / 2], fill=K, width=lw)
    for s in (1, -1):
        pts = [(x, h / 2 + s * h * 0.3 * math.cos(2 * math.pi * (x / w) * 2) ** 2 * (1 if s > 0 else 1) * (0.55 + 0.45 * math.cos(4 * math.pi * x / w))) for x in range(0, w + 1, 4)]
        pts = [(x, h / 2 + s * h * (0.18 + 0.12 * math.cos(4 * math.pi * x / w))) for x in range(0, w + 1, 4)]
        d.line(pts, fill=K, width=lw)


def volleyball(im, d):
    """排球（球面展開）：黃、藍、白三色彎曲的長條（參考圖：黃藍白）"""
    w, h = im.size; cols = [hx('#f2c230'), hx('#2a52a8'), hx('#f3f1ea')]
    a = np.zeros((h, w, 3), np.float32)
    uu, vv = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    t = (vv * 3 + 0.35 * np.sin(uu * 4 * math.pi + vv * 2.0)) % 3; idx = np.floor(t).astype(int)
    for k in range(3): a[idx == k] = np.array(cols[k][:3], np.float32)
    edge = np.abs(t - np.round(t)) < 0.03; a[edge] *= 0.55
    seam = (np.abs(((uu * 3) % 1) - 0.5) < 0.006) & (idx == 2); a[seam] *= 0.8
    a += noise(w, h, 3, 6)[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def tennis(im, d):
    """網球（球面展開）：螢光黃綠、毛絨、白色 S 形接縫"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + np.array(hx('#c9dc3c')[:3], np.float32)
    a += noise(w, h, 2, 16)[..., None] * np.array([0.9, 1.0, 0.4])
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    pts = [(x, h / 2 + h * 0.26 * math.sin(4 * math.pi * x / w)) for x in range(0, w + 1, 3)]
    d.line(pts, fill=hx('#f4f4e8'), width=6)


def jersey_front(col, trim, dept, no, num_col, side=None):
    """展示球衣胸前那一塊（系名＋背號，照參考圖的位置：系名在上、號碼在下；外框滾邊）"""
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), hx(col)[:3]); im.paste(grain(base, 5, 3)); d = ImageDraw.Draw(im)
        for k in range(0, w, 6): d.line([k, 0, k, h], fill=tuple(int(v * 0.97) for v in hx(col)[:3]), width=1)   # 網眼布
        text_c(d, (w / 2, h * 0.25), dept, font(h * 0.15), hx(num_col), stroke=2, sfill=hx(side or num_col))
        text_c(d, (w / 2, h * 0.62), str(no), font(h * 0.42), hx(num_col), stroke=5, sfill=hx(side or num_col))
    return f


def pack(kind, head, body, label):
    """吊卡（掛在網牆上的護具包裝：上面掛孔＋色條印品名、透明窗裡的護具）"""
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx(body)); d.rectangle([0, 0, w, h * 0.17], fill=hx(head))
        d.rounded_rectangle([w / 2 - 16, 10, w / 2 + 16, 24], radius=7, fill=hx('#4a4d52'))
        text_c(d, (w / 2, h * 0.1 + 6), label, font(h * 0.07), hx('#f4f1e8'))
        d.rounded_rectangle([14, h * 0.21, w - 14, h * 0.9], radius=16, fill=hx('#6a7480'))
        if kind == 'knee':
            d.rounded_rectangle([34, h * 0.26, w - 34, h * 0.86], radius=40, fill=hx('#27282c'))
            d.ellipse([w * 0.3, h * 0.42, w * 0.7, h * 0.66], fill=hx('#3b3d42')); d.ellipse([w * 0.38, h * 0.48, w * 0.62, h * 0.6], fill=hx('#202125'))
            for k in range(5): d.line([40, h * (0.3 + k * 0.12), w - 40, h * (0.3 + k * 0.12)], fill=hx('#3a3b40'), width=3)
        elif kind == 'wrist':
            for k in range(2):
                y = h * (0.32 + k * 0.3); d.rounded_rectangle([30, y, w - 30, y + h * 0.2], radius=20, fill=hx(head)); d.line([36, y + 10, w - 36, y + 10], fill=hx('#f4f1e8'), width=3)
        else:   # 襪子
            d.polygon([(w * 0.3, h * 0.25), (w * 0.62, h * 0.25), (w * 0.62, h * 0.64), (w * 0.84, h * 0.76), (w * 0.8, h * 0.86), (w * 0.46, h * 0.82), (w * 0.3, h * 0.7)], fill=hx('#f2f0ea'))
            d.rectangle([w * 0.3, h * 0.25, w * 0.62, h * 0.33], fill=hx(head))
        d.line([18, h * 0.24, w * 0.6, h * 0.5], fill=(250, 252, 255), width=3)   # 塑膠袋反光
        d.rectangle([0, h * 0.92, w, h], fill=hx(head)); text_c(d, (w / 2, h * 0.96), 'S M L XL', font(h * 0.04), hx('#f4f1e8'))
    return f


def tags(im, d):
    """價目卡（白卡紅字、新台幣）：一格裡 2×4 張"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#f6f3ea'))
    prices = [('籃球 7號', '$680'), ('排球 5號', '$890'), ('網球 3入', '$150'), ('護膝', '$450'), ('水壺', '$420'), ('後背包', '$1,280'), ('運動T', '$390'), ('球褲', '$350')]
    for k, (n, p) in enumerate(prices):
        x, y = (k % 2) * w // 2, (k // 2) * h // 4
        d.rectangle([x + 3, y + 3, x + w // 2 - 4, y + h // 4 - 4], outline=hx('#d23a3a'), width=3)
        text_c(d, (x + w // 4, y + h // 12 + 2), n, font(h * 0.045), hx('#23305a')); text_c(d, (x + w // 4, y + h * 0.17), p, font(h * 0.07), hx('#c8202a'))


def kraft(note):
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), hx('#b08a5c')[:3]); im.paste(grain(base, 9, 5)); d = ImageDraw.Draw(im)
        d.rectangle([w // 2 - 20, 0, w // 2 + 20, h], fill=hx('#c4a679')); d.rectangle([0, 0, w - 1, h - 1], outline=hx('#8e6a40'), width=4)
        if note: text_c(d, (w * 0.42, h * 0.62), note, font(h * 0.15), hx('#2a2a2a'))
    return f


def shoebox(col, lid):
    def f(im, d):
        w, h = im.size; d.rectangle([0, 0, w, h], fill=hx(col)); d.rectangle([0, 0, w, h * 0.22], fill=hx(lid))
        d.rectangle([w * 0.62, h * 0.4, w * 0.92, h * 0.78], fill=hx('#f2efe6'))
        for k in range(3): d.line([w * 0.65, h * (0.48 + k * 0.1), w * 0.88, h * (0.48 + k * 0.1)], fill=hx('#555555'), width=2)
        text_c(d, (w * 0.3, h * 0.6), '26.5', font(h * 0.2), hx('#f2efe6'))
    return f


def binders(im, d):
    cols = ['#2f4f8a', '#c8c3b5', '#b8262a', '#2f6a4a', '#d8c35a', '#3a3a3a', '#2f4f8a', '#e8e6e0']
    w, h = im.size
    for k, c in enumerate(cols):
        x = k * w // 8; d.rectangle([x, 0, x + w // 8 - 1, h], fill=hx(c)); d.rectangle([x + 6, 24, x + w // 8 - 7, 80], fill=hx('#f2efe6'))
        text_c(d, (x + w // 16, 52), ['籃', '排', '壘', '足', '系', '班', '隊', '服'][k], font(22), hx('#333333'))
        d.ellipse([x + w // 16 - 6, h - 40, x + w // 16 + 6, h - 28], fill=hx('#222222'))


def trees(im, d):
    """窗外（新生南路的行道樹：亮綠、逆光、樹縫透天空）——窗玻璃外面的一片"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + np.array(hx('#d8e2e0')[:3], np.float32)
    rr = np.random.default_rng(7)
    for k in range(900):
        x, y = rr.uniform(0, w), rr.uniform(-0.1 * h, 1.0 * h); r = rr.uniform(10, 46)
        g = np.array(hx(rr.choice(['#5f8a3e', '#7aa24a', '#4c7434', '#8fb25a', '#6a9440']))[:3], np.float32) * rr.uniform(0.8, 1.15)
        yy, xx = np.ogrid[max(0, int(y - r)):min(h, int(y + r)), max(0, int(x - r)):min(w, int(x + r))]
        m = (xx - x) ** 2 + (yy - y) ** 2 < r * r
        a[max(0, int(y - r)):min(h, int(y + r)), max(0, int(x - r)):min(w, int(x + r))][m] = g
    a[int(h * 0.82):] = np.array(hx('#9a9790')[:3]) + noise(w, h - int(h * 0.82), 6, 8)[..., None]   # 下面：對面的騎樓
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2)))
    d = ImageDraw.Draw(im)
    for k in range(5): x = 40 + k * 110 + rr.uniform(-20, 20); d.line([x, h * 0.4, x + rr.uniform(-15, 15), h * 0.84], fill=hx('#4a3b2c'), width=int(rr.uniform(6, 12)))


def poster(im, d):
    """褪色的比賽海報（虛構：第九屆新生盃 系際籃球賽）"""
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#ece4d0')); d.rectangle([0, 0, w, h * 0.45], fill=hx('#2a4486'))
    d.ellipse([w * 0.3, h * 0.08, w * 0.7, h * 0.38], fill=hx('#d87a3a'))
    d.line([w * 0.5, h * 0.08, w * 0.5, h * 0.38], fill=hx('#2a1a10'), width=4); d.line([w * 0.3, h * 0.23, w * 0.7, h * 0.23], fill=hx('#2a1a10'), width=4)
    text_c(d, (w / 2, h * 0.53), '第九屆', font(w * 0.11), hx('#9a3a2e')); text_c(d, (w / 2, h * 0.65), '新生盃', font(w * 0.2), hx('#2a4486'))
    text_c(d, (w / 2, h * 0.77), '系際籃球賽', font(w * 0.13), hx('#2a4486')); text_c(d, (w / 2, h * 0.9), '報名請洽櫃台', font(w * 0.08), hx('#5a5a5a'))
    a = np.asarray(im, np.float32) * 0.9 + 22; im.paste(Image.fromarray(np.clip(a + noise(w, h, 8, 6)[..., None], 0, 255).astype(np.uint8)))


def cashier(im, d):
    """收銀台正面（白色美耐板、底下踢黑、一條深藍色帶、手寫的「結帳」）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + np.array(hx('#e6e1d6')[:3], np.float32); a += noise(w, h, 6, 5)[..., None]
    a[int(h * 0.86):] *= 0.55; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.rectangle([0, h * 0.12, w, h * 0.26], fill=hx('#233f8f')); d.rectangle([0, h * 0.26, w, h * 0.29], fill=hx('#e8782a'))
    text_c(d, (w * 0.5, h * 0.19), '結帳　包裝　系服取貨', font(h * 0.09), hx('#f4f1e8'))
    for k in range(40):
        x, y = R.uniform(0, w), R.uniform(h * 0.6, h * 0.86); d.line([x, y, x + R.uniform(-30, 30), y + R.uniform(-4, 4)], fill=hx('#a8a296'), width=2)


def street(im, d):
    """後門外（巷子：白天的亮、對面的牆、機車的影子）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + np.array(hx('#f4efe2')[:3], np.float32)
    a[int(h * 0.62):] = np.array(hx('#d8d0c0')[:3]); a[:int(h * 0.2)] = np.array(hx('#fbf8f0')[:3])
    a += noise(w, h, 8, 6)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))); d = ImageDraw.Draw(im)
    d.rectangle([w * 0.55, h * 0.2, w * 0.95, h * 0.62], fill=hx('#d9cfbd')); d.ellipse([w * 0.1, h * 0.7, w * 0.4, h * 0.8], fill=hx('#b8ae9c'))


def monback(im, d):
    w, h = im.size; d.rectangle([0, 0, w, h], fill=hx('#2b2b2d'))
    for k in range(8): d.line([w * 0.2, h * (0.2 + k * 0.06), w * 0.8, h * (0.2 + k * 0.06)], fill=hx('#202022'), width=3)


def towel(cols):
    """疊好的毛巾側面（一條一條、有折痕和條紋）"""
    def f(im, d):
        w, h = im.size; n = 8
        for k in range(n):
            y0 = k * h / n; c = hx(cols[k % len(cols)]); d.rectangle([0, y0, w, y0 + h / n], fill=c)
            d.line([0, y0 + 2, w, y0 + 2], fill=tuple(min(255, int(v * 1.1)) for v in c[:3]), width=2); d.line([0, y0 + h / n - 2, w, y0 + h / n - 2], fill=tuple(int(v * 0.75) for v in c[:3]), width=3)
            d.rectangle([w * 0.1, y0 + h / n * 0.4, w * 0.9, y0 + h / n * 0.55], fill=tuple(int(v * 0.9) for v in c[:3]))
        im.paste(grain(im, 6, 2))
    return f


cell('basket', 0, 0, 512, 256, basketball, pad=0)
cell('volley', 512, 0, 512, 256, volleyball, pad=0)
cell('tennis', 1024, 0, 256, 128, tennis, pad=0)
cell('trees', 1280, 0, 512, 512, trees)
cell('street', 1792, 0, 256, 512, street)
JERSEYS = [('j37', '#1f2d55', '電機系', 37, '#f4f2ec', None), ('j16', '#b8242c', '土木系', 16, '#f4f2ec', None), ('j88', '#eeede6', '舊序章', 88, '#1f2d55', None),
           ('j7', '#17213f', '法律系', 7, '#d9b45a', None), ('j12', '#6e1f2c', '化工系', 12, '#efe6d2', None), ('j21', '#2f6b45', '森林系', 21, '#f4f2ec', None),
           ('j5', '#8fb8de', '大氣系', 5, '#1f2d55', None), ('j30', '#26272b', '機械系', 30, '#d8742c', None)]
for k, (nm, col, dept, no, nc, sd) in enumerate(JERSEYS):
    cell(nm, k * 256, 512, 256, 256, jersey_front(col, None, dept, no, nc, sd))
PACKS = [('p_knee', 'knee', '#1b1c20', '#2a2b30', '護膝'), ('p_elbow', 'knee', '#2a3f8a', '#1f2a55', '護肘'), ('p_wrist', 'wrist', '#e8a33a', '#233f8f', '護腕'),
         ('p_ankle', 'knee', '#3b3d42', '#26272b', '護踝'), ('p_sock', 'sock', '#2a52a8', '#2a4a9a', '運動襪'), ('p_sock2', 'sock', '#1f2d55', '#3a6ac0', '籃球襪'),
         ('p_tape', 'wrist', '#c8202a', '#26272b', '肌貼'), ('p_band', 'wrist', '#2f6b45', '#1f2a55', '頭帶')]
for k, (nm, kind, head, body, lab) in enumerate(PACKS):
    cell(nm, k * 256, 768, 256, 384, pack(kind, head, body, lab))
cell('tags', 0, 1152, 512, 512, tags)
for k, (nm, note) in enumerate((('kraft1', '籃球 12入'), ('kraft2', ''), ('kraft3', '水壺'), ('kraft4', '系服 S×10'))):
    cell(nm, 512 + k * 256, 1152, 256, 256, kraft(note))
for k, (nm, col, lid) in enumerate((('sb_w', '#e9e6de', '#2a2c30'), ('sb_o', '#e0783a', '#2a2c30'), ('sb_b', '#2a4a8a', '#e9e6de'), ('sb_k', '#2a2c30', '#c8202a'))):
    cell(nm, 1536 + (k % 2) * 256, 1152 + (k // 2) * 128, 256, 128, shoebox(col, lid))
cell('binders', 512, 1408, 512, 256, binders)
cell('poster', 1024, 1408, 256, 384, poster)
cell('cashier', 1280, 1408, 768, 256, cashier)
cell('monback', 1280, 1664, 256, 128, monback)
cell('towel_a', 1536, 1664, 256, 128, towel(['#f2f0ea', '#e8e6e0', '#f2f0ea', '#dcdad2']))
cell('towel_b', 1792, 1664, 256, 128, towel(['#3a6ac0', '#2a4a9a', '#f2f0ea', '#3a6ac0']))
NOTES = [('n_order', ['系隊球衣', '10件起訂', '約兩週'], '#c8202a'), ('n_print', ['印字・號碼', '每件 +$50'], None), ('n_bag', ['背包特價', '$1,280'], '#c8202a'),
         ('n_bottle', ['水壺', '$420 起'], None), ('n_ball', ['籃球', '可試拍'], None), ('n_try', ['試穿請找', '店員 謝謝'], None),
         ('n_tennis', ['網球', '3入 $150'], '#c8202a'), ('n_up', ['系服訂做', '請上二樓 ↑'], None)]
for k, (nm, lines, red) in enumerate(NOTES):
    def f(im, d, lines=lines, red=red): hand(im, (0, 0, 256, 256), lines, size=44 if max(len(s) for s in lines) < 6 else 34, rot=(-3 + (len(lines[0]) % 3) * 2), red=red)
    cell(nm, k * 256, 1792, 256, 256, f)
u0, v0, u1, v1 = ATL['tags']
for k in range(8):
    cx, cy = k % 2, k // 2; ATL[f'tag{k}'] = [u0 + (u1 - u0) * cx / 2, v1 - (v1 - v0) * (cy + 1) / 4, u0 + (u1 - u0) * (cx + 1) / 2, v1 - (v1 - v0) * cy / 4]
G.save(os.path.join(GEN, 'xs_goods.png'))

# ======================= 2. 招牌（4096×1024） =======================
SW, SH = 4096, 1024
S = Image.new('RGB', (SW, SH), hx('#233f8f')[:3]); d = ImageDraw.Draw(S)
NAVY, ORG, WHT = hx('#233f8f'), hx('#e8782a'), hx('#f6f4ee')


def board(x0, y0, x1, y1, age=6):
    a = np.asarray(S.crop((x0, y0, x1, y1)), np.float32) + noise(x1 - x0, y1 - y0, 10, age)[..., None]
    yy = np.linspace(-1, 1, y1 - y0)[:, None]; xx = np.linspace(-1, 1, x1 - x0)[None, :]
    a *= (1 - 0.05 * (np.abs(xx) ** 6 + np.abs(yy) ** 6))[..., None]
    S.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), (x0, y0))


def swoosh(d, x0, x1, ymid, thick, col, up=True, curve=0.5):
    """參考圖的弧線（橘、白）：一條往右變粗的彎刀形"""
    n = 40; top, bot = [], []
    for i in range(n + 1):
        t = i / n; x = x0 + (x1 - x0) * t; c = math.sin(t * math.pi) * curve * thick * 2 * (1 if up else -1)
        th = thick * (0.15 + 0.85 * t); top.append((x, ymid - c - th / 2)); bot.append((x, ymid - c + th / 2))
    d.polygon(top + bot[::-1], fill=col)


def runner(d, ox, oy, s, col):
    """跑步的人形（參考圖招牌左邊的白色剪影）"""
    d.ellipse([ox + 30 * s, oy - 118 * s, ox + 62 * s, oy - 86 * s], fill=col)
    d.polygon([(ox + 20 * s, oy - 80 * s), (ox + 52 * s, oy - 84 * s), (ox + 40 * s, oy - 30 * s), (ox + 12 * s, oy - 26 * s)], fill=col)
    for a, b, wd in (((ox + 44 * s, oy - 76 * s), (ox + 84 * s, oy - 58 * s), 12), ((ox + 84 * s, oy - 58 * s), (ox + 100 * s, oy - 84 * s), 11),
                     ((ox + 28 * s, oy - 76 * s), (ox - 8 * s, oy - 52 * s), 12), ((ox - 8 * s, oy - 52 * s), (ox - 30 * s, oy - 66 * s), 11),
                     ((ox + 26 * s, oy - 30 * s), (ox + 70 * s, oy - 4 * s), 15), ((ox + 70 * s, oy - 4 * s), (ox + 62 * s, oy + 40 * s), 13),
                     ((ox + 22 * s, oy - 28 * s), (ox - 14 * s, oy + 8 * s), 15), ((ox - 14 * s, oy + 8 * s), (ox - 52 * s, oy + 0 * s), 13)):
        d.line([a, b], fill=col, width=int(wd * s)); d.ellipse([b[0] - wd * s / 2, b[1] - wd * s / 2, b[0] + wd * s / 2, b[1] + wd * s / 2], fill=col)


# 2-1 主招牌（0,0)-(4096,410)：9.28 × 0.93 m
board(0, 0, 4096, 410)
d.rectangle([0, 0, 4095, 409], outline=hx('#1a2f6e'), width=10)
swoosh(d, 90, 930, 250, 70, WHT, up=True, curve=0.35); swoosh(d, 160, 1000, 290, 80, ORG, up=True, curve=0.3)
runner(d, 800, 215, 1.25, WHT)
spaced(d, 2120, 205, '新生運動廣場', font(250), WHT, 0.42, stroke=3)
swoosh(d, 3220, 4060, 320, 70, WHT, up=True, curve=0.28); swoosh(d, 3320, 4090, 360, 85, ORG, up=True, curve=0.25)
uvbox('banner_main', 0, 0, 4096, 410, (SW, SH))
# 2-2 二樓「系隊球衣訂做」（0,420)-(1400,760)：3.0 × 0.73 m
board(0, 420, 1400, 760)
d.rectangle([0, 420, 1399, 759], outline=hx('#1a2f6e'), width=8)
spaced(d, 640, 560, '系隊球衣訂做', font(150), WHT, 0.12, stroke=2)
text_c(d, (600, 680), '系服・隊服・班服　印字　號碼　10件起訂', font(40), hx('#d8dcea'))
swoosh(d, 1000, 1395, 735, 34, ORG, curve=0.3); swoosh(d, 20, 420, 742, 18, WHT, curve=0.2)
uvbox('banner_order', 0, 420, 1400, 760, (SW, SH))
# 2-3 球衣尺寸表（1410,420)-(1890,1020)：1.4 × 1.75 m
d.rectangle([1410, 420, 1890, 1020], fill=hx('#f4f2ec')); d.rectangle([1410, 420, 1890, 500], fill=NAVY)
text_c(d, (1650, 460), '球衣尺寸表', font(50), WHT)
COLS3 = [1410, 1530, 1720, 1890]; rows = [('尺寸', '胸圍(cm)', '衣長(cm)'), ('XS', '86', '62'), ('S', '92', '65'), ('M', '98', '68'), ('L', '104', '71'), ('XL', '110', '74'), ('2XL', '116', '77')]
for i, r in enumerate(rows):
    y0 = 505 + i * 72
    if i % 2 == 0: d.rectangle([1414, y0, 1886, y0 + 72], fill=hx('#e6e6ea'))
    for j, s in enumerate(r): text_c(d, ((COLS3[j] + COLS3[j + 1]) / 2, y0 + 36), s, font(32 if i == 0 else 44), hx('#1f2d55'))
    d.line([1414, y0, 1886, y0], fill=hx('#9aa0b0'), width=2)
for x in COLS3[1:-1]: d.line([x, 505, x, 1009], fill=hx('#9aa0b0'), width=2)
d.rectangle([1410, 420, 1890, 1020], outline=hx('#1a2f6e'), width=6)
uvbox('size_chart', 1410, 420, 1890, 1020, (SW, SH))
# 2-4 樓層指示牌（直的 600×1580，畫好轉 90° 放進 (1900,420)-(3480,1020)）
FG = Image.new('RGB', (600, 1580), NAVY[:3]); fd = ImageDraw.Draw(FG)
a = np.asarray(FG, np.float32) + noise(600, 1580, 10, 6)[..., None]; FG = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); fd = ImageDraw.Draw(FG)
fd.rectangle([0, 0, 599, 1579], outline=hx('#1a2f6e'), width=8)
spaced(fd, 250, 95, '新生運動廣場', font(62), WHT, 0.02)
runner(fd, 500, 170, 0.62, WHT); swoosh(fd, 40, 580, 255, 34, ORG, curve=0.6)
fd.text((50, 420), '2F', font=font(96), fill=WHT, anchor='lm'); fd.line([150, 470, 560, 470], fill=WHT, width=4)
text_c(fd, (300, 560), '系隊球衣訂做', font(62), WHT)
fd.text((50, 760), '1F', font=font(96), fill=WHT, anchor='lm'); fd.line([150, 810, 560, 810], fill=WHT, width=4)
text_c(fd, (290, 900), '運動用品', font(70), WHT)
for k, s in enumerate(('球類', '運動服飾', '護具', '水壺', '運動背包')):
    y = 1010 + k * 92; fd.ellipse([96, y - 9, 114, y + 9], fill=WHT); fd.text((140, y), s, font=font(56), fill=WHT, anchor='lm')
swoosh(fd, 60, 590, 1520, 40, ORG, curve=0.3); swoosh(fd, 150, 590, 1548, 16, WHT, curve=0.2)
S.paste(FG.rotate(90, expand=True), (1900, 420))   # 轉 90°（逆時針）：直的上緣 → 圖集的左緣
ATL['floor_guide'] = [1900 / SW, 1 - 1020 / SH, 3480 / SW, 1 - 420 / SH]; ATL['floor_guide_rot'] = 90
# 2-5 收銀台上方的小招牌（3490,420)-(4096,620)：1.2 × 0.4 m
d.rectangle([3490, 420, 4096, 620], fill=NAVY); text_c(d, (3793, 505), '結帳 CASHIER', font(74), WHT); swoosh(d, 3500, 4090, 590, 22, ORG, curve=0.3)
uvbox('sign_cashier', 3490, 420, 4096, 620, (SW, SH))
# 2-6 球鞋區、二樓的小吊牌（3490,630)-(4096,830)／(3490,840)-(4096,1024)
d.rectangle([3490, 630, 4096, 830], fill=NAVY); text_c(d, (3793, 720), '球鞋區', font(100), WHT); swoosh(d, 3500, 4090, 805, 18, ORG, curve=0.3)
uvbox('sign_shoes', 3490, 630, 4096, 830, (SW, SH))
d.rectangle([3490, 840, 4096, 1024], fill=hx('#f4f2ec')); text_c(d, (3793, 920), '樣衣　試穿', font(90), NAVY); d.rectangle([3490, 1000, 4096, 1024], fill=ORG)
uvbox('sign_sample', 3490, 840, 4096, 1024, (SW, SH))
S.save(os.path.join(GEN, 'xs_sign.png'))

# ======================= 3. 透明貼圖（1024×512） =======================
AW, AH = 1024, 512
A = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); d = ImageDraw.Draw(A)
GRID = '#5e6166'   # 鐵網格（512 px＝0.5 m；網目 5 cm；參考圖：深灰）
for i in range(11):
    p = min(int(round(i * 51.2)), 509)
    d.rectangle([0, p - 2, 511, p + 2], fill=hx(GRID)); d.rectangle([p - 2, 0, p + 2, 511], fill=hx(GRID))
    d.line([0, p - 2, 511, p - 2], fill=hx('#8a8e94'), width=1)
uvbox('grid', 0, 0, 512, 512, (AW, AH))
for i in range(0, 256, 22):   # 網籃（白色鐵線，3 cm 網目）
    d.rectangle([512 + i, 0, 512 + i + 3, 255], fill=hx('#e8e8e4')); d.rectangle([512, i, 767, i + 3], fill=hx('#d8d8d2'))
d.rectangle([512, 0, 767, 8], fill=hx('#f0f0ec'))
uvbox('basket_wire', 512, 0, 768, 256, (AW, AH))
A.save(os.path.join(GEN, 'xs_alpha.png'))

# ======================= 4. 會亮的（512×256） =======================
EW, EH = 512, 256
E = Image.new('RGB', (EW, EH), (0, 0, 0)); d = ImageDraw.Draw(E)
for x in range(0, 128):
    v = int(235 + 20 * math.cos((x - 64) / 64 * math.pi / 2)); d.line([x, 0, x, 255], fill=(v, v - 3, v - 10))
uvbox('tube', 40, 40, 88, 216, (EW, EH))
d.rectangle([128, 0, 383, 159], fill=hx('#dfe8f0')); d.rectangle([128, 0, 383, 18], fill=hx('#3a6aa8'))
for k in range(8): d.rectangle([138, 30 + k * 16, 138 + 60 + (k * 37) % 150, 38 + k * 16], fill=hx('#8aa0b8'))
d.rectangle([300, 40, 370, 140], fill=hx('#2a52a8'))   # 螢幕上的球衣樣式（藍色色塊）
uvbox('screen', 130, 2, 381, 157, (EW, EH))
st = Image.open(os.path.join(GEN, 'xs_goods.png')).crop((1792, 0, 2048, 512)).resize((128, 256))
E.paste(st, (384, 0)); uvbox('street', 386, 2, 510, 254, (EW, EH))
d.ellipse([140, 170, 220, 250], fill=(255, 238, 205)); uvbox('spot', 160, 190, 200, 230, (EW, EH))
E.save(os.path.join(GEN, 'xs_emit.png'))

# ======================= 5. 地磚（1024²＝1.8 m，60 cm 方磚 3×3） =======================
FW = 1024; T = FW // 3
F = np.zeros((FW, FW, 3), np.float32)
rf = np.random.default_rng(43)
for i in range(3):
    for j in range(3):
        base = np.array(hx('#dcc6ae')[:3], np.float32) * rf.uniform(0.95, 1.04) + rf.uniform(-4, 4, 3)
        F[j * T:(j + 1) * T + 2, i * T:(i + 1) * T + 2] = base
F += noise(FW, FW, 4, 5, rf)[..., None] + noise(FW, FW, 48, 7, rf)[..., None] * np.array([1.0, 0.95, 0.85])
for k in [0, T, 2 * T]:
    F[k:k + 4, :] = np.array(hx('#a08c78')[:3]); F[:, k:k + 4] = np.array(hx('#a08c78')[:3])
    F[k + 4:k + 7, :] *= 0.95; F[:, k + 4:k + 7] *= 0.95
F[-3:, :] = np.array(hx('#a08c78')[:3]); F[:, -3:] = np.array(hx('#a08c78')[:3])
fl = Image.fromarray(np.clip(F, 0, 255).astype(np.uint8)); fd = ImageDraw.Draw(fl)
for k in range(50):
    x, y = rf.uniform(0, FW), rf.uniform(0, FW); a_ = rf.uniform(0, math.pi); L_ = rf.uniform(8, 40)
    fd.line([x, y, x + L_ * math.cos(a_), y + L_ * math.sin(a_)], fill=(140, 124, 108), width=int(rf.uniform(1, 3)))
fl = fl.filter(ImageFilter.GaussianBlur(0.6)); fl.save(os.path.join(GEN, 'xs_floor.png'))

json.dump(ATL, open(os.path.join(GEN, 'xs_atlas.json'), 'w'), indent=1)
print('ok', len(ATL), 'cells')
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]
    pv = Image.new('RGB', (2048, 2048 + 1024 + 512), (60, 60, 60)); pv.paste(G, (0, 0)); pv.paste(S.resize((2048, 512)), (0, 2048))
    bg = Image.new('RGBA', (AW, AH), (90, 90, 90, 255)); bg.alpha_composite(A); pv.paste(bg.convert('RGB'), (0, 2560)); pv.paste(E.resize((512, 256)), (1024, 2560)); pv.paste(fl.resize((512, 512)), (1536, 2560))
    pv.resize((1024, (2048 + 1024 + 512) // 2)).save(out, quality=80)
