"""轉角唱片（公館 G12，取代「二手唱片」）室內的自製貼圖（CC，帳號 A 的建模子代理，2026-11-04；照參考圖 gongguan_corner_int 做）。系統 python3（PIL、numpy）：
  python3 tools/blender/env_second/bb_support/corner_tex.py [--preview <輸出.jpg>]
輸出到 tools/blender/env_second/textures/gen/：
  corner_goods.png  印刷圖集（2048²）：黑膠封面 40 張（日系動畫風的風景：夕陽、電線桿、城市夜景、櫻花、海、山……，全部程式畫的）、
                    海報（台北的午後、公館聲響祭、河岸音樂節、聽音樂的女孩、演唱會、山、城市、裱框的黑膠、人像、唱盤線稿）、
                    分類牌（搖滾 / Indie、民謠 / Folk、電子 / Electronic）、手寫紙卡、試聽區牌、營業時間牌、價錢卡、倉庫牌、
                    唱片書背（黑膠、CD）、紙箱（麥克筆字）、擴大機／收音機／卡帶座面板、喇叭正面、唱盤頂面、櫃台面板、波斯地毯、綠色布簾、冷氣出風口
  corner_alpha.png  透明貼圖集（2048×1024）：黃金葛葉 4 種、龜背芋葉、橡膠樹葉 2 種、小葉 2 種、黃色小花、粉紅小花
  corner_emit.png   會亮的（1024×512）：投射燈燈面、燈泡、白色燈罩、櫃台螢幕、擴大機的琥珀色表頭、指示燈
  corner_sign.png   招牌（2048×1024）：左牆上半段的飾板「轉角唱片 Corner Records」（2048×430＝5.0×1.05 m）、店門旁的布旗（橫著畫 1152×384，貼的時候轉 90°）
  corner_floor.png  地板（1024²＝1.0 m）：淺灰磨石子（白、灰、黑、米色的碎石，無縫拼接；有一點色差、擦痕）
  corner_atlas.json 每一格的 UV 範圍（u0,v0,u1,v1；Blender 的 v 往上）
全部是程式畫的；字用系統的文泉驛正黑（wqy-zenhei，GPL＋字型例外：嵌進圖片可以）。店名「轉角唱片」、海報、樂團名都是虛構的（參考圖上的照用，SCENE_RULES §12）；沒有任何真實品牌、標誌（D77）。"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GEN = os.path.join(HERE, '..', 'textures', 'gen')
os.makedirs(GEN, exist_ok=True)
R = np.random.default_rng(650)
ATL = {}
FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
SLATE, CREAM = '#43504d', '#eee3c6'   # 飾板的深灰綠、米白字（參考圖：暖光下看起來是灰褐）


def font(px): return ImageFont.truetype(FONT, max(6, int(px)))


def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


def rgb(h): return hx(h)[:3]


def uvbox(name, px0, py0, px1, py1, size):
    W, H = size; ATL[name] = [px0 / W, 1 - py1 / H, px1 / W, 1 - py0 / H]


def noise(w, h, k=8, amp=10, rng=R):
    n = rng.normal(0, 1, (h // k + 2, w // k + 2)); im = Image.fromarray(((n - n.min()) / (np.ptp(n) + 1e-6) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(im, np.float32) / 255 - 0.5) * 2 * amp


def grain(im, amp=6, k=6):
    a = np.asarray(im.convert('RGB'), np.float32); n = noise(im.size[0], im.size[1], k, amp)[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def vignette(im, k=0.25):
    """邊角變深（舊紙、褪色）"""
    a = np.asarray(im.convert('RGB'), np.float32); h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]; r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= (1 - k * np.clip(r - 0.55, 0, 1) ** 1.5)[..., None]; return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def fade(im, k=0.12, warm=(1.0, 0.97, 0.88)):
    """褪色（往米黃靠、對比變低）"""
    a = np.asarray(im.convert('RGB'), np.float32); a = a * (1 - k) + 200 * k; a *= np.array(warm); return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def hand(d, x, y, s, f, col, rr, jit=2.0):
    """手寫的一行字（每個字稍微歪）"""
    for ch in s:
        d.text((x, y + rr.uniform(-jit, jit)), ch, font=f, fill=col, anchor='lm', stroke_width=1, stroke_fill=col); x += f.getlength(ch) * rr.uniform(0.95, 1.05)
    return x


def text_c(d, xy, s, f, fill, anchor='mm', stroke=0):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=fill)


def vgrad(w, h, stops):
    """直的漸層：stops＝[(位置 0～1, '#色')…]"""
    t = np.linspace(0, 1, h); a = np.zeros((h, w, 3), np.float32)
    ps = [p for p, _ in stops]; cs = np.array([rgb(c) for _, c in stops], np.float32)
    for ch in range(3): a[..., ch] = np.interp(t, ps, cs[:, ch])[:, None]
    return a


def vinyl_icon(d, cx, cy, r, col, bg, wd=4, half=False):
    """黑膠圖示（同心圓的溝紋＋中間的標籤；half＝只畫上半圈，招牌的那種）"""
    if half:
        for k in range(7): rr_ = r * (1 - k * 0.12); d.arc([cx - rr_, cy - rr_, cx + rr_, cy + rr_], 180, 360, fill=col, width=wd)
        d.pieslice([cx - r * 0.2, cy - r * 0.2, cx + r * 0.2, cy + r * 0.2], 180, 360, fill=col); d.line([cx - r * 1.05, cy, cx + r * 1.05, cy], fill=col, width=wd)
        return
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    for k in range(1, 6): rr_ = r * (1 - k * 0.11); d.ellipse([cx - rr_, cy - rr_, cx + rr_, cy + rr_], outline=bg, width=max(1, wd // 3))
    d.ellipse([cx - r * 0.3, cy - r * 0.3, cx + r * 0.3, cy + r * 0.3], fill=bg); d.ellipse([cx - r * 0.05, cy - r * 0.05, cx + r * 0.05, cy + r * 0.05], fill=col)


# ======================= 封面、海報的畫 =======================
SKIES = [  # 日系動畫風的天空（參考圖封面：雲、夕陽電線桿、城市夜景、櫻花、紫色黃昏……）
    [(0, '#5a7fb8'), (0.6, '#a9c8e6'), (1, '#e9eef0')],          # 晴天
    [(0, '#2b2f5a'), (0.45, '#8a5a8a'), (0.75, '#e08a62'), (1, '#f2c27a')],   # 黃昏（紫→橘）
    [(0, '#141b33'), (0.6, '#2c3a62'), (1, '#4a4a6a')],          # 夜
    [(0, '#d8a0b0'), (0.6, '#f0d0d0'), (1, '#f6ece4')],          # 櫻花色
    [(0, '#3a6a7a'), (0.55, '#8ab8c0'), (1, '#e8d8b0')],         # 海邊
    [(0, '#f2b060'), (0.5, '#e87a50'), (1, '#6a3a5a')],          # 夕陽（橘紅）
    [(0, '#4a5a3a'), (0.6, '#a8b878'), (1, '#e8e0b8')],          # 綠
    [(0, '#3a3a5a'), (0.5, '#6a5a8a'), (1, '#c8a8c8')],          # 紫
]


def scene(w, h, seed, kind=None, sky=None, clouds=None):
    """一張動畫風景（封面、海報共用）：天空漸層＋雲／星＋剪影（電線桿、城市、山、樹、橋、海、電車）"""
    rr = np.random.default_rng(seed); sk = SKIES[sky if sky is not None else seed % len(SKIES)]
    a = vgrad(w, h, sk); a += noise(w, h, max(2, w // 24), 6, rr)[..., None]
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im, 'RGBA')
    kind = kind or ['clouds', 'pole', 'city', 'sakura', 'sea', 'mount', 'tree', 'bokeh', 'train', 'bridge', 'moon'][seed % 11]
    hz = h * rr.uniform(0.62, 0.78); dark = (24, 22, 34, 255) if sk[0][1] in ('#141b33', '#2b2f5a', '#3a3a5a') else (40, 36, 46, 255)
    if clouds if clouds is not None else (kind in ('clouds', 'sea', 'sakura', 'tree') or rr.random() < 0.3):   # 雲（白、亮邊）
        for k in range(rr.integers(3, 7)):
            cx, cy, s = rr.uniform(0, w), rr.uniform(h * 0.15, h * 0.6), rr.uniform(0.1, 0.25) * w
            for j in range(6): ox, oy = rr.uniform(-s, s), rr.uniform(-s * 0.3, s * 0.2); r_ = s * rr.uniform(0.35, 0.6); d.ellipse([cx + ox - r_, cy + oy - r_ * 0.7, cx + ox + r_, cy + oy + r_ * 0.7], fill=(250, 246, 240, 200))
    if kind in ('moon', 'city', 'bokeh') or sk[0][1] == '#141b33':   # 星、月
        for k in range(30): x, y = rr.uniform(0, w), rr.uniform(0, hz * 0.8); d.point((x, y), fill=(255, 250, 230, 200))
        if kind == 'moon': r_ = w * 0.12; d.ellipse([w * 0.62 - r_, h * 0.28 - r_, w * 0.62 + r_, h * 0.28 + r_], fill=(250, 240, 210, 255))
    if kind in ('sea',):
        d.rectangle([0, hz, w, h], fill=(60, 110, 140, 255))
        for k in range(14): y = hz + (h - hz) * rr.uniform(0, 1); d.line([rr.uniform(0, w), y, rr.uniform(0, w), y], fill=(230, 240, 250, 120), width=2)
    elif kind == 'mount':
        for j, col in enumerate(((90, 100, 140, 255), (60, 70, 100, 255), (36, 44, 66, 255))):
            pts = [(0, h)] + [(x, hz - h * 0.25 * (1 - j * 0.3) * abs(math.sin(x / w * (2.2 + j) + seed))) for x in np.linspace(0, w, 12)] + [(w, h)]; d.polygon(pts, fill=col)
    else:
        if kind in ('city', 'bokeh', 'bridge', 'train', 'moon'):   # 城市剪影（一棟高塔、一排大樓）
            x = 0
            while x < w:
                bw, bh = rr.uniform(0.05, 0.12) * w, rr.uniform(0.08, 0.3) * h; d.rectangle([x, hz - bh, x + bw, h], fill=dark)
                for k in range(int(bh // 9)):
                    if rr.random() < 0.35: wx = x + rr.uniform(2, bw - 4); wy = hz - bh + 4 + k * 9; d.rectangle([wx, wy, wx + 2, wy + 3], fill=(250, 210, 140, 230))
                x += bw + rr.uniform(0, 4)
            if rr.random() < 0.6:
                tx = w * rr.uniform(0.25, 0.75); th = h * rr.uniform(0.35, 0.5)
                for k in range(6): tw = w * (0.05 - k * 0.006); d.rectangle([tx - tw, hz - th * (k + 1) / 6, tx + tw, hz - th * k / 6 + 2], fill=dark)
                d.line([tx, hz - th, tx, hz - th - h * 0.06], fill=dark, width=2)
        d.rectangle([0, hz, w, h], fill=dark)
        if kind == 'bridge':
            d.arc([w * 0.1, hz - h * 0.2, w * 0.9, hz + h * 0.2], 180, 360, fill=dark, width=5); d.line([0, hz - 2, w, hz - 2], fill=dark, width=5)
            for k in range(9): x = w * (0.15 + k * 0.08); d.line([x, hz - 2, x, hz - h * 0.2 * math.sin(math.pi * (k + 1) / 10)], fill=dark, width=2)
            d.rectangle([0, hz + 4, w, h], fill=(50, 60, 90, 255))
            for k in range(20): y = hz + 8 + rr.uniform(0, h - hz - 8); x = rr.uniform(0, w); d.line([x, y, x + rr.uniform(6, 30), y], fill=(240, 170, 110, 150), width=2)
        if kind == 'train':
            ty = hz - h * 0.08; d.rounded_rectangle([w * 0.05, ty, w * 0.95, hz], radius=6, fill=(230, 230, 220, 255)); d.rectangle([w * 0.05, ty + h * 0.03, w * 0.95, ty + h * 0.035], fill=(70, 120, 150, 255))
            for k in range(8): x = w * (0.08 + k * 0.11); d.rectangle([x, ty + h * 0.008, x + w * 0.07, ty + h * 0.026], fill=(250, 220, 150, 255))
        if kind == 'pole' or rr.random() < 0.25:   # 電線桿＋電線（參考圖第二張封面）
            px = w * rr.uniform(0.2, 0.8); d.rectangle([px - 3, hz - h * 0.55, px + 3, h], fill=dark)
            for k in range(3): y = hz - h * (0.5 - k * 0.05); d.line([px - w * 0.08, y, px + w * 0.08, y], fill=dark, width=3)
            for k in range(4): y0 = hz - h * (0.5 - k * 0.03); d.line([(0, y0 + h * 0.05)] + [(x, y0 + h * 0.05 * ((x - px) / w) ** 2 * 4) for x in np.linspace(0, w, 9)], fill=dark, width=1)
        if kind in ('tree', 'sakura'):
            for k in range(rr.integers(2, 4)):
                tx, tr = rr.uniform(0, w), rr.uniform(0.12, 0.22) * w; d.rectangle([tx - 3, hz - tr * 1.2, tx + 3, hz], fill=dark)
                for j in range(10): ox, oy = rr.uniform(-tr, tr), rr.uniform(-tr, tr * 0.3); d.ellipse([tx + ox - tr * 0.4, hz - tr * 1.3 + oy - tr * 0.35, tx + ox + tr * 0.4, hz - tr * 1.3 + oy + tr * 0.35], fill=dark)
        if kind == 'sakura':   # 櫻花枝（前景，粉紅點）
            bx = w * rr.uniform(0.5, 1.0)
            for k in range(5): d.line([bx, 0, bx - w * rr.uniform(0.2, 0.6), h * rr.uniform(0.1, 0.5)], fill=(70, 50, 50, 255), width=3)
            for k in range(160): x, y = rr.uniform(w * 0.3, w), rr.uniform(0, h * 0.55); r_ = rr.uniform(1.5, 4); d.ellipse([x - r_, y - r_, x + r_, y + r_], fill=(250, 200, 215, 230))
    if kind == 'bokeh':
        for k in range(26): x, y, r_ = rr.uniform(0, w), rr.uniform(h * 0.2, h * 0.9), rr.uniform(4, w * 0.06); d.ellipse([x - r_, y - r_, x + r_, y + r_], fill=(255, 200, 130, int(rr.uniform(60, 150))))
    return im


TITLES = ['午後回聲', '白色電車', '南方早晨', '星際樂團', '夏の終り', '雨天的公路', '城市散步', '藍色時刻', '溫州街', '河岸', '慢慢走', '晚安台北', '黃昏', '第七夜', '風的形狀', '小站']


def cover(seed):
    def f(im, d):
        w, h = im.size; sc = scene(w, h, seed * 7 + 3)
        if seed % 9 == 4:   # 幾張是單色＋圖形的設計封面
            a = np.zeros((h, w, 3), np.float32) + rgb(['#e8dcc0', '#2a2a2a', '#c84a3a', '#2f4f6a'][seed % 4]); sc = Image.fromarray(a.astype(np.uint8)); dd = ImageDraw.Draw(sc)
            vinyl_icon(dd, w * 0.5, h * 0.5, w * 0.3, (30, 30, 30) if seed % 4 == 0 else (236, 228, 208), rgb('#c88a3a'), 3)
        im.paste(fade(sc, 0.08 + 0.1 * (seed % 3) / 2)); d = ImageDraw.Draw(im)
        if seed % 3 != 2:
            t = TITLES[seed % len(TITLES)]; fs = w * 0.11; col = (248, 244, 232) if seed % 2 else (30, 30, 36)
            d.text((w * 0.08, h * 0.08), t, font=font(fs), fill=col, anchor='lt')
        d.rectangle([0, 0, w - 1, h - 1], outline=(30, 28, 26), width=1)
        a = np.asarray(im, np.float32); a[:, -3:] *= 0.8; a[-3:] *= 0.8; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))
    return f


def poster_taipei(im, d):
    """「台北的午後 獨立音樂合輯 Vol.2」（參考圖左牆：深藍夜空、河邊的城市剪影、一座高塔）"""
    w, h = im.size; sc = scene(w, h, 17, 'city', sky=2); a = np.asarray(sc, np.float32)
    hz = int(h * 0.72); refl = a[hz - (h - hz):hz][::-1] * 0.55 + np.array([20, 30, 60]) * 0.45; a[hz:] = refl[:h - hz]
    im.paste(vignette(fade(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)), 0.06), 0.35)); d = ImageDraw.Draw(im)
    text_c(d, (w / 2, h * 0.13), '台北的午後', font(w * 0.14), rgb('#f2ead6')); text_c(d, (w / 2, h * 0.23), '獨立音樂合輯 Vol.2', font(w * 0.06), rgb('#d8d0bc'))


def poster_gg(im, d):
    """「公館聲響祭 Gongguan Sound Festival '02」（最前面唱片箱的正面：紫色黃昏、樹和人群的剪影、帳篷）"""
    w, h = im.size; sc = scene(w, h, 5, 'tree', sky=7, clouds=False); d2 = ImageDraw.Draw(sc, 'RGBA'); rr = np.random.default_rng(2)
    for k in range(90): x = rr.uniform(0, w); y = h * 0.86 + rr.uniform(-6, 6); r_ = rr.uniform(5, 9); d2.ellipse([x - r_, y - r_ * 2.2, x + r_, y], fill=(28, 24, 36, 255)); d2.rectangle([x - r_, y - r_, x + r_, h], fill=(28, 24, 36, 255))
    d2.polygon([(w * 0.72, h * 0.78), (w * 0.8, h * 0.68), (w * 0.88, h * 0.78)], fill=(40, 34, 48, 255))
    for k in range(40): x, y = rr.uniform(0, w), rr.uniform(0, h * 0.4); d2.point((x, y), fill=(255, 245, 220, 220))
    im.paste(vignette(fade(sc, 0.08), 0.4)); d = ImageDraw.Draw(im)
    d.text((w * 0.08, h * 0.12), '公館聲響祭', font=font(h * 0.2), fill=rgb('#f4ecda'), anchor='lt'); d.text((w * 0.09, h * 0.37), "Gongguan Sound Festival '02", font=font(h * 0.07), fill=rgb('#e4dccb'), anchor='lt')


def poster_river(im, d):
    """「河岸音樂節 Riverside Music Festival 2000」（右牆：深藍、夕陽、拱橋；樂團名虛構）"""
    w, h = im.size; sc = scene(w, int(h * 0.52), 9, 'bridge', sky=1); im.paste(rgb('#22304e'), [0, 0, w, h]); im.paste(sc, (0, int(h * 0.22))); d = ImageDraw.Draw(im)
    d.text((w * 0.07, h * 0.04), '河岸音樂節', font=font(w * 0.15), fill=rgb('#f4ecda'), anchor='lt'); d.text((w * 0.08, h * 0.13), 'Riverside Music Festival', font=font(w * 0.055), fill=rgb('#d8d0c0'), anchor='lt')
    d.text((w * 0.08, h * 0.17), '2000', font=font(w * 0.07), fill=rgb('#e8b870'), anchor='lt')
    for i, s in enumerate(('星際樂團', '午後回聲', '白色電車', '南方早晨', '...and more')): d.text((w * 0.5, h * (0.79 + i * 0.04)), s, font=font(w * 0.075), fill=rgb('#eee6d2'), anchor='mm')
    im.paste(vignette(fade(im, 0.05), 0.3))


def poster_girl(im, d):
    """聽音樂的女孩（右牆：淺色底、短髮側臉、耳機；平塗插畫）"""
    w, h = im.size; im.paste(Image.fromarray(vgrad(w, h, [(0, '#e8e2d6'), (1, '#d6dce0')]).astype(np.uint8))); d = ImageDraw.Draw(im)
    cx, cy = w * 0.5, h * 0.42
    d.ellipse([cx - w * 0.26, cy - w * 0.3, cx + w * 0.26, cy + w * 0.26], fill=rgb('#2a2426'))                     # 頭髮（短髮）
    d.ellipse([cx - w * 0.17, cy - w * 0.17, cx + w * 0.17, cy + w * 0.21], fill=rgb('#f0d6c4'))                    # 臉
    d.rectangle([cx - w * 0.26, cy - w * 0.06, cx - w * 0.16, cy + w * 0.3], fill=rgb('#2a2426')); d.rectangle([cx + w * 0.16, cy - w * 0.06, cx + w * 0.26, cy + w * 0.3], fill=rgb('#2a2426'))
    d.pieslice([cx - w * 0.19, cy - w * 0.26, cx + w * 0.19, cy + w * 0.02], 180, 360, fill=rgb('#2a2426'))      # 瀏海
    d.arc([cx - w * 0.3, cy - w * 0.36, cx + w * 0.3, cy + w * 0.2], 180, 360, fill=rgb('#3a3a3e'), width=int(w * 0.04))   # 耳機頭帶
    for s in (-1, 1): d.rounded_rectangle([cx + s * w * 0.28 - w * 0.06, cy - w * 0.06, cx + s * w * 0.28 + w * 0.06, cy + w * 0.12], radius=8, fill=rgb('#3a3a3e'))
    d.line([cx - w * 0.07, cy + w * 0.04, cx - w * 0.02, cy + w * 0.04], fill=rgb('#3a2a2a'), width=3); d.line([cx + w * 0.02, cy + w * 0.04, cx + w * 0.07, cy + w * 0.04], fill=rgb('#3a2a2a'), width=3)
    d.polygon([(cx - w * 0.3, h), (cx - w * 0.2, cy + w * 0.3), (cx + w * 0.2, cy + w * 0.3), (cx + w * 0.3, h)], fill=rgb('#7a9ab0'))
    im.paste(vignette(fade(im, 0.04), 0.25))


def poster_crowd(im, d):
    """演唱會（右牆：深藍、暖色的燈、人群）"""
    w, h = im.size; sc = scene(w, h, 23, 'bokeh', sky=2); d2 = ImageDraw.Draw(sc, 'RGBA'); rr = np.random.default_rng(4)
    for k in range(120): x = rr.uniform(0, w); y = h * rr.uniform(0.7, 1.0); r_ = rr.uniform(6, 11); d2.ellipse([x - r_, y - r_ * 2, x + r_, y], fill=(20, 18, 30, 255)); d2.rectangle([x - r_, y - r_, x + r_, h], fill=(20, 18, 30, 255))
    for k in range(5): x = w * (0.1 + k * 0.2); d2.polygon([(x, 0), (x - w * 0.12, h * 0.75), (x + w * 0.12, h * 0.75)], fill=(255, 220, 160, 40))
    im.paste(vignette(fade(sc, 0.05), 0.3)); d = ImageDraw.Draw(im); d.text((w * 0.08, h * 0.05), '城市夜唱', font=font(w * 0.12), fill=rgb('#f2ead6'), anchor='lt')


def plain(seed, kind, sky=None):
    def f(im, d):
        w, h = im.size; im.paste(vignette(fade(scene(w, h, seed, kind, sky), 0.08), 0.3))
    return f


def framed_vinyl(im, d):
    w, h = im.size; im.paste(rgb('#e8e0cc'), [0, 0, w, h]); d = ImageDraw.Draw(im); vinyl_icon(d, w / 2, h / 2, w * 0.4, (24, 22, 22), rgb('#d88a3a'), 4)


def portrait(im, d):
    """人像剪影（右牆小畫框：黑白、戴帽子的歌手）"""
    w, h = im.size; a = vgrad(w, h, [(0, '#c8c4bc'), (1, '#8a8680')]); a += noise(w, h, 3, 10)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.ellipse([w * 0.35, h * 0.22, w * 0.65, h * 0.48], fill=(40, 40, 40)); d.polygon([(w * 0.15, h), (w * 0.3, h * 0.55), (w * 0.7, h * 0.55), (w * 0.85, h)], fill=(40, 40, 40))
    d.rectangle([w * 0.3, h * 0.2, w * 0.7, h * 0.25], fill=(30, 30, 30))


def lineart_tt(im, d):
    """唱盤的線稿（小畫框）"""
    w, h = im.size; im.paste(vignette(grain(Image.new('RGB', (w, h), rgb('#ece4d0')), 5, 6), 0.3)); d = ImageDraw.Draw(im); c = rgb('#2b2b2b')
    d.rectangle([w * 0.12, h * 0.45, w * 0.88, h * 0.72], outline=c, width=3); d.ellipse([w * 0.18, h * 0.3, w * 0.62, h * 0.6], outline=c, width=3)
    d.line([w * 0.78, h * 0.35, w * 0.6, h * 0.5], fill=c, width=3); d.text((w * 0.12, h * 0.85), 'no.33', font=font(18), fill=rgb('#555555'))


def note_bin(im, d):
    """唱片箱正面的手寫紙卡（白紙、四角膠帶）：二手黑膠／二手CD／獨立發行／在地音樂／試聽歡迎"""
    w, h = im.size; base = Image.new('RGB', (w, h), rgb('#f2ede0')); im.paste(vignette(grain(base, 5, 6), 0.2)); d = ImageDraw.Draw(im); rr = np.random.default_rng(8)
    for i, s in enumerate(('二手黑膠', '二手CD', '獨立發行', '在地音樂', '試聽歡迎')):
        f_ = font(h * 0.085); y = h * (0.15 + i * 0.17); hand(d, (w - f_.getlength(s)) / 2, y, s, f_, rgb('#2a2622'), rr, 1.5)
        if i < 4: d.line([w * 0.2, y + h * 0.07, w * 0.8, y + h * 0.07], fill=rgb('#d0c8b8'), width=1)
    for (x, y) in ((0, 0), (w - 40, 0), (0, h - 28), (w - 40, h - 28)): d.rectangle([x, y, x + 40, y + 28], fill=rgb('#d8c8a0'))


def catsign(cn, en):
    """分類牌（深灰綠底、米白字：搖滾 / Indie……）"""
    def f(im, d):
        w, h = im.size; im.paste(grain(Image.new('RGB', (w, h), rgb('#38403e')), 6, 4)); d = ImageDraw.Draw(im)
        d.rectangle([3, 3, w - 4, h - 4], outline=rgb('#8a8a7a'), width=2); s = f'{cn} / {en}'; text_c(d, (w / 2, h / 2), s, font(h * 0.5), rgb(CREAM))
    return f


def plaque(lines, bg='#d8d4ca', col='#2a2a2a', icon=False):
    def f(im, d):
        w, h = im.size; im.paste(grain(Image.new('RGB', (w, h), rgb(bg)), 5, 5)); d = ImageDraw.Draw(im); d.rectangle([4, 4, w - 5, h - 5], outline=rgb('#8a857a'), width=2)
        n = len(lines)
        for i, s in enumerate(lines): text_c(d, (w / 2 + (w * 0.06 if icon else 0), h * (i + 0.6) / (n + 0.2)), s, font(min(h / (n + 0.8) * 0.75, w / (len(s) + 1.5) * (1.6 if s.isascii() else 1))), rgb(col))
        if icon: vinyl_icon(d, w * 0.13, h / 2, h * 0.28, rgb(col), rgb(bg), 2)
    return f


def note(lines, col='#23305a', paper='#f4efdf', red=None):
    def f(im, d):
        w, h = im.size; base = Image.new('RGB', (w, h), rgb(paper)); a = np.asarray(grain(base, 6, 6), np.float32)
        a *= (1 - 0.06 * np.linspace(0, 1, h)[:, None])[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
        rr = np.random.default_rng(abs(hash(''.join(lines))) % 9999); n = len(lines); lh = h / (n + 0.6)
        for i, s in enumerate(lines):
            f_ = font(min(w / (len(s) + 1.2), lh * 0.7)); c = rgb(red if (red and i == n - 1) else col)
            hand(d, (w - f_.getlength(s)) / 2, lh * (i + 0.8), s, f_, c, rr)
    return f


def spines(kind):
    """唱片的書背（櫃子裡一格一格：黑膠 3～5 mm 一張，CD 1 cm 一片）"""
    def f(im, d):
        w, h = im.size; rr = np.random.default_rng(31 if kind == 'lp' else 47); x = 0
        cols = ['#2a2a2a', '#e8e0d0', '#8a3a30', '#2f4f6a', '#c8a050', '#3a5a4a', '#6a4a6a', '#d0c8b8', '#1e1e22', '#b85a3a', '#5a6a8a', '#e8d8b0', '#4a3a30']
        while x < w:
            ww = int(rr.uniform(3, 7) if kind == 'lp' else rr.uniform(10, 16)); c = np.array(rgb(cols[rr.integers(len(cols))]), np.float32) * rr.uniform(0.75, 1.05)
            d.rectangle([x, 0, x + ww - 1, h], fill=tuple(int(v) for v in np.clip(c, 0, 255)))
            if kind == 'cd' and rr.random() < 0.7: d.rectangle([x + 2, h * 0.1, x + ww - 3, h * 0.6], fill=tuple(int(v) for v in np.clip(c * 1.3, 0, 255)))
            d.line([x, 0, x, h], fill=(20, 18, 16), width=1); x += ww
        a = np.asarray(im, np.float32); yy = np.linspace(0, 1, h)[:, None]; a *= (0.7 + 0.3 * np.clip(yy * 3, 0, 1))[..., None]   # 上面一點陰影（櫃子的上板）
        im.paste(Image.fromarray(np.clip(a + noise(w, h, 2, 5)[..., None], 0, 255).astype(np.uint8)))
    return f


def kraft(label):
    def f(im, d):
        w, h = im.size; im.paste(grain(Image.new('RGB', (w, h), rgb('#b08a5c')), 9, 5)); d = ImageDraw.Draw(im); rr = np.random.default_rng(len(label) * 7)
        d.rectangle([0, h * 0.45, w, h * 0.53], fill=rgb('#c8a878'))   # 膠帶
        if label: hand(d, w * 0.12, h * 0.72, label, font(h * 0.16), rgb('#2a2a2a'), rr, 3)
    return f


def panel(kind):
    """音響正面（擴大機、收音機、卡帶座）：拉絲銀／黑、旋鈕、表頭"""
    def f(im, d):
        w, h = im.size; base = rgb('#b8b6b0' if kind != 'receiver' else '#2a2a2c')
        a = np.zeros((h, w, 3), np.float32) + base; a += np.repeat(R.normal(0, 4, (1, w)), h, 0)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
        dk = (40, 40, 40) if kind != 'receiver' else (200, 196, 186)
        if kind == 'amp':
            for k, x in enumerate((0.1, 0.24, 0.62, 0.76, 0.9)): r_ = h * (0.2 if k in (1, 3) else 0.14); d.ellipse([w * x - r_, h * 0.55 - r_, w * x + r_, h * 0.55 + r_], fill=(70, 70, 72), outline=(30, 30, 30), width=2)
            d.rectangle([w * 0.34, h * 0.22, w * 0.52, h * 0.6], fill=(222, 170, 90)); d.rectangle([w * 0.53, h * 0.22, w * 0.56, h * 0.6], fill=(30, 30, 30))
        elif kind == 'receiver':
            d.rectangle([w * 0.06, h * 0.2, w * 0.7, h * 0.55], fill=(30, 24, 14)); d.rectangle([w * 0.08, h * 0.3, w * 0.68, h * 0.45], fill=(210, 150, 70))
            for k in range(12): x = w * (0.1 + k * 0.05); d.line([x, h * 0.3, x, h * 0.36], fill=(60, 40, 20), width=1)
            r_ = h * 0.22; d.ellipse([w * 0.84 - r_, h * 0.45 - r_, w * 0.84 + r_, h * 0.45 + r_], fill=(150, 150, 150), outline=(20, 20, 20), width=2)
        else:   # 卡帶座：兩個卡匣窗
            for x0 in (0.08, 0.42):
                d.rectangle([w * x0, h * 0.15, w * (x0 + 0.3), h * 0.75], fill=(36, 36, 38)); d.rectangle([w * (x0 + 0.04), h * 0.3, w * (x0 + 0.26), h * 0.55], fill=(150, 130, 110))
                for c in (0.1, 0.2): d.ellipse([w * (x0 + c) - 6, h * 0.42 - 6, w * (x0 + c) + 6, h * 0.42 + 6], fill=(240, 240, 240))
            for k in range(5): d.rectangle([w * (0.78 + k * 0.04), h * 0.6, w * (0.81 + k * 0.04), h * 0.72], fill=dk)
        d.rectangle([0, 0, w - 1, h - 1], outline=(60, 60, 60), width=2)
    return f


def speaker(im, d):
    """書架喇叭正面（胡桃木框、黑色單體：大的低音、小的高音）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + rgb('#6a4428'); a += np.repeat(R.normal(0, 7, (h, 1)), w, 1)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.rectangle([w * 0.06, h * 0.04, w * 0.94, h * 0.96], fill=(32, 30, 30))
    for cy, r_ in ((0.25, 0.14), (0.64, 0.36)):
        R_ = w * r_; d.ellipse([w / 2 - R_, h * cy - R_, w / 2 + R_, h * cy + R_], fill=(18, 18, 18), outline=(80, 80, 80), width=3)
        d.ellipse([w / 2 - R_ * 0.6, h * cy - R_ * 0.6, w / 2 + R_ * 0.6, h * cy + R_ * 0.6], fill=(40, 40, 42)); d.ellipse([w / 2 - R_ * 0.25, h * cy - R_ * 0.25, w / 2 + R_ * 0.25, h * cy + R_ * 0.25], fill=(70, 70, 72))


def tt_top(im, d):
    """唱盤頂面（木頭底座、黑色轉盤＋一張唱片＋橘色標籤）"""
    w, h = im.size; a = np.zeros((h, w, 3), np.float32) + rgb('#7a5030'); a += np.repeat(R.normal(0, 8, (1, w)), h, 0)[..., None]; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    vinyl_icon(d, w * 0.42, h * 0.5, h * 0.42, (22, 22, 22), rgb('#d07a3a'), 3)


def counter_face(im, d):
    """木櫃台正面（直條拼板、下緣踢黑）"""
    w, h = im.size; rr = np.random.default_rng(31); a = np.zeros((h, w, 3), np.float32); base = np.array(rgb('#8a5c34'), np.float32)
    for k in range(0, w, 40): a[:, k:k + 40] = base * rr.uniform(0.9, 1.06)
    a += np.repeat(rr.normal(0, 7, (1, w)), h, 0)[..., None]; a += noise(w, h, 2, 4)[..., None]
    for k in range(0, w, 40): a[:, k:k + 3] *= 0.7
    yy = np.linspace(0, 1, h)[:, None]; a *= (1 - 0.3 * np.clip((yy - 0.88) / 0.12, 0, 1))[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def rug(im, d):
    """波斯地毯（紅褐底、深藍框、米色花紋；邊緣磨舊）"""
    w, h = im.size; im.paste(rgb('#7a3a2a'), [0, 0, w, h]); d = ImageDraw.Draw(im)
    for k, (m, c) in enumerate(((0, '#2a2e44'), (18, '#c8aa7a'), (26, '#2a2e44'), (60, '#a85a3a'), (66, '#c8aa7a'))): d.rectangle([m, m, w - 1 - m, h - 1 - m], outline=rgb(c), width=6 if k != 3 else 3)
    for i in range(6):
        for j in range(8):
            cx, cy = 90 + i * (w - 180) / 5, 90 + j * (h - 180) / 7; s = 22
            d.polygon([(cx, cy - s), (cx + s, cy), (cx, cy + s), (cx - s, cy)], outline=rgb('#d0b080'), fill=rgb('#5a2a22' if (i + j) % 2 else '#8a4a32'))
    d.ellipse([w / 2 - w * 0.22, h / 2 - h * 0.18, w / 2 + w * 0.22, h / 2 + h * 0.18], outline=rgb('#c8aa7a'), width=5, fill=rgb('#2a2e44'))
    d.ellipse([w / 2 - w * 0.12, h / 2 - h * 0.1, w / 2 + w * 0.12, h / 2 + h * 0.1], fill=rgb('#a85a3a'))
    a = np.asarray(im, np.float32); a += noise(w, h, 2, 14)[..., None]; a *= (0.85 + 0.15 * (noise(w, h, 40, 1) + 1) / 2)[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)))


def curtain(im, d):
    """綠色布簾（直的皺褶）"""
    w, h = im.size; x = np.linspace(0, 1, w); f_ = 0.75 + 0.25 * np.sin(x * math.pi * 14) ** 2
    a = np.zeros((h, w, 3), np.float32) + rgb('#3e5a40'); a *= f_[None, :, None]; a += noise(w, h, 3, 6)[..., None]
    a[int(h * 0.92):] *= 0.8; im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)))


def ac_grille(im, d):
    w, h = im.size; im.paste(rgb('#e6e4dc'), [0, 0, w, h]); d = ImageDraw.Draw(im)
    for s in range(4):   # 四邊的出風口
        for k in range(5):
            o = 14 + k * 7
            if s == 0: d.line([o + 20, o, w - o - 20, o], fill=rgb('#8a8a86'), width=3)
            elif s == 1: d.line([o + 20, h - o, w - o - 20, h - o], fill=rgb('#8a8a86'), width=3)
            elif s == 2: d.line([o, o + 20, o, h - o - 20], fill=rgb('#8a8a86'), width=3)
            else: d.line([w - o, o + 20, w - o, h - o - 20], fill=rgb('#8a8a86'), width=3)
    for k in range(9): y = h * 0.3 + k * h * 0.045; d.line([w * 0.3, y, w * 0.7, y], fill=rgb('#b8b6ae'), width=2)


def cab_door(im, d):
    """木門櫃的門板（框＋中間的板、小黃銅把手；邊角磨淡）"""
    w, h = im.size; rr = np.random.default_rng(5); a = np.zeros((h, w, 3), np.float32) + rgb('#8a5a34'); a += np.repeat(rr.normal(0, 6, (1, w)), h, 0)[..., None]
    im.paste(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))); d = ImageDraw.Draw(im)
    d.rectangle([10, 10, w - 11, h - 11], outline=rgb('#6a4224'), width=4); d.rectangle([22, 22, w - 23, h - 23], outline=rgb('#a07048'), width=2)
    d.ellipse([w - 34, h / 2 - 7, w - 20, h / 2 + 7], fill=rgb('#c8a050'))


# ======================= 1. 印刷圖集（2048²） =======================
GW = 2048
G = Image.new('RGB', (GW, GW), rgb('#cfc7b8'))
CELLS = [(f'cover{k}', 144, 144, cover(k)) for k in range(40)]
CELLS += [('poster_taipei', 384, 544, poster_taipei), ('poster_river', 320, 560, poster_river), ('poster_girl', 320, 432, poster_girl), ('poster_crowd', 320, 464, poster_crowd),
          ('poster_gg', 512, 352, poster_gg), ('poster_mtn', 288, 224, plain(31, 'mount', 0)), ('poster_city', 288, 224, plain(41, 'city', 5)), ('poster_sea', 224, 288, plain(52, 'sea', 4)),
          ('frame_vinyl', 192, 192, framed_vinyl), ('portrait', 224, 288, portrait), ('lineart_tt', 224, 288, lineart_tt), ('note_bin', 224, 320, note_bin),
          ('sign_indie', 320, 80, catsign('搖滾', 'Indie')), ('sign_folk', 320, 80, catsign('民謠', 'Folk')), ('sign_electronic', 384, 80, catsign('電子', 'Electronic')),
          ('sign_listen', 256, 112, plaque(['試聽區', 'Listening'], bg='#e0dcd2', icon=True)),
          ('hours', 256, 192, plaque(['轉角唱片', '營業時間', '每天 12:00～21:00'], bg='#efe8d8')),
          ('note_price', 192, 160, note(['二手黑膠', '每張', '150元起'], red='#c8202a')), ('note_staff', 192, 112, note(['倉庫', '員工專用'], col='#2a2a2a')),
          ('note_listen', 192, 160, note(['耳機請', '輕輕放回', '謝謝'], col='#23305a')), ('note_new', 192, 160, note(['本週', '新進貨'], red='#c8202a')),
          ('spines_lp', 384, 192, spines('lp')), ('spines_cd', 384, 192, spines('cd')),
          ('kraft0', 256, 192, kraft('黑膠 A-M')), ('kraft1', 256, 192, kraft('黑膠 N-Z')), ('kraft2', 256, 192, kraft('CD 待整理')), ('kraft3', 256, 192, kraft('二手 入庫')),
          ('amp', 384, 128, panel('amp')), ('receiver', 384, 128, panel('receiver')), ('deck', 384, 128, panel('deck')), ('speaker', 192, 288, speaker), ('tt_top', 288, 224, tt_top),
          ('counter_face', 384, 144, counter_face), ('rug', 384, 480, rug), ('curtain', 192, 384, curtain), ('ac_grille', 192, 192, ac_grille), ('cab_door', 192, 256, cab_door)]


def pack(cells, W):
    """天際線排版：每一件放在目前最低、放得下的位置（高的先放）"""
    order = sorted(cells, key=lambda c: (-c[2], -c[1])); sky = [0] * (W // 16); pos = {}
    for nm, w, h, fn in order:
        n = -(-w // 16); best = None
        for i in range(0, len(sky) - n + 1):
            y = max(sky[i:i + n])
            if best is None or y < best[1]: best = (i, y)
        i, y = best; pos[nm] = (i * 16, y)
        for j in range(i, i + n): sky[j] = y + h
    assert max(sky) <= W, f'atlas overflow {max(sky)}'
    return pos


POS = pack(CELLS, GW)
for nm, w, h, fn in CELLS:
    x0, y0 = POS[nm]; im = Image.new('RGB', (w, h), (200, 200, 200)); fn(im, ImageDraw.Draw(im)); G.paste(im, (x0, y0)); uvbox(nm, x0 + 2, y0 + 2, x0 + w - 2, y0 + h - 2, (GW, GW))
G.save(os.path.join(GEN, 'corner_goods.png'))

# ======================= 2. 透明貼圖集（2048×1024） =======================
AW, AH = 2048, 1024
A = Image.new('RGBA', (AW, AH), (0, 0, 0, 0))


def leafimg(w, h, shape, col, seed, yel=False):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.polygon(shape, fill=hx(col))
    la = np.asarray(im, np.float32); mk = la[..., 3] > 0; rr = np.random.default_rng(seed)
    if yel: n_ = noise(w, h, 10, 40, rr); y_ = (n_ > 18) & mk; la[y_, 0] += 70; la[y_, 1] += 55; la[y_, 2] += 5
    la[mk, :3] += noise(w, h, 4, 8, rr)[mk][:, None]; im = Image.fromarray(np.clip(la, 0, 255).astype(np.uint8)); return im


x = 0
for k in range(4):   # 黃金葛（心形、黃斑）
    lf = leafimg(192, 256, [(96, 250), (20, 120), (24, 60), (60, 22), (96, 52), (132, 22), (168, 60), (172, 120)], ['#3f6f30', '#4d7d36', '#5a8a3c', '#3a6230'][k], k, True)
    ImageDraw.Draw(lf).line([96, 250, 96, 50], fill=hx('#9ab060'), width=3); A.paste(lf, (x, 0)); uvbox(f'leaf{k}', x, 0, x + 192, 256, (AW, AH)); x += 192
# 龜背芋（大的裂葉）
mo = Image.new('RGBA', (384, 384), (0, 0, 0, 0)); md = ImageDraw.Draw(mo); md.ellipse([24, 30, 360, 370], fill=hx('#2f5a2a'))
for k in range(7):
    a0 = -2.6 + k * 0.85; md.polygon([(192, 200), (192 + 200 * math.cos(a0 - 0.08), 200 + 200 * math.sin(a0 - 0.08)), (192 + 200 * math.cos(a0 + 0.08), 200 + 200 * math.sin(a0 + 0.08))], fill=(0, 0, 0, 0))
    md.ellipse([192 + 110 * math.cos(a0 + 0.42) - 12, 200 + 110 * math.sin(a0 + 0.42) - 12, 192 + 110 * math.cos(a0 + 0.42) + 12, 200 + 110 * math.sin(a0 + 0.42) + 12], fill=(0, 0, 0, 0))
md.line([192, 380, 192, 120], fill=hx('#6a8a4a'), width=5); ma = np.asarray(mo, np.float32); mk = ma[..., 3] > 0; ma[mk, :3] += noise(384, 384, 5, 10)[mk][:, None]
A.paste(Image.fromarray(np.clip(ma, 0, 255).astype(np.uint8)), (768, 0)); uvbox('monstera', 768, 0, 1152, 384, (AW, AH))
for k in range(2):   # 橡膠樹（深綠橢圓、亮的葉脈）
    lf = leafimg(160, 256, [(80, 252), (30, 200), (12, 120), (30, 40), (80, 4), (130, 40), (148, 120), (130, 200)], ['#24401f', '#2e4c26'][k], 10 + k)
    ImageDraw.Draw(lf).line([80, 250, 80, 10], fill=hx('#8a7a5a'), width=3); A.paste(lf, (1152 + k * 160, 0)); uvbox(f'rubber{k}', 1152 + k * 160, 0, 1312 + k * 160, 256, (AW, AH))
for k in range(2):   # 小葉（小盆栽、凳子上那盆）
    lf = leafimg(128, 128, [(64, 126), (20, 80), (24, 30), (64, 4), (104, 30), (108, 80)], ['#4a7a3a', '#5a8a42'][k], 20 + k); A.paste(lf, (1472 + k * 128, 0)); uvbox(f'small{k}', 1472 + k * 128, 0, 1600 + k * 128, 128, (AW, AH))
fl = Image.new('RGBA', (128, 128), (0, 0, 0, 0)); fd = ImageDraw.Draw(fl); rr = np.random.default_rng(3)   # 黃色小花（邊几的花瓶）
for k in range(9): cx, cy = rr.uniform(20, 108), rr.uniform(20, 108); fd.line([64, 127, cx, cy], fill=hx('#5a7a3a'), width=2); [fd.ellipse([cx + 6 * math.cos(t) - 5, cy + 6 * math.sin(t) - 5, cx + 6 * math.cos(t) + 5, cy + 6 * math.sin(t) + 5], fill=hx('#f0c040')) for t in np.linspace(0, 6.28, 6)]; fd.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=hx('#c07020'))
A.paste(fl, (1728, 0)); uvbox('flowers_y', 1728, 0, 1856, 128, (AW, AH))
fp = Image.new('RGBA', (128, 128), (0, 0, 0, 0)); fd = ImageDraw.Draw(fp)   # 粉紅小花（櫃台的小盆）
for k in range(14): cx, cy = rr.uniform(16, 112), rr.uniform(10, 90); fd.line([64, 127, cx, cy], fill=hx('#6a5a3a'), width=2); fd.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=hx(['#f0b8c8', '#e8a0b8', '#f6d0da'][k % 3]))
A.paste(fp, (1856, 0)); uvbox('flowers_p', 1856, 0, 1984, 128, (AW, AH))
A.save(os.path.join(GEN, 'corner_alpha.png'))

# ======================= 3. 會亮的（1024×512） =======================
E = Image.new('RGB', (1024, 512), (0, 0, 0)); d = ImageDraw.Draw(E)
sp = Image.new('RGB', (128, 128), (0, 0, 0)); sd = ImageDraw.Draw(sp)
for r in range(64, 0, -2): v = int(150 + 105 * (1 - r / 64)); sd.ellipse([64 - r, 64 - r, 64 + r, 64 + r], fill=(255, int(v * 0.9), int(v * 0.66)))
E.paste(sp, (0, 0)); uvbox('spot', 8, 8, 120, 120, (1024, 512))
E.paste(sp, (128, 0)); uvbox('bulb', 136, 8, 248, 120, (1024, 512))
d.rectangle([256, 0, 383, 127], fill=(255, 236, 200)); uvbox('shade', 264, 8, 376, 120, (1024, 512))
sc = Image.new('RGB', (384, 256), rgb('#dde4e8')); sd = ImageDraw.Draw(sc)   # 櫃台螢幕：庫存表（抽象的表格）
sd.rectangle([0, 0, 384, 30], fill=rgb(SLATE)); sd.text((12, 15), '庫存・二手收購', font=font(18), fill=(240, 236, 220), anchor='lm')
for k in range(8): sd.line([10, 44 + k * 26, 374, 44 + k * 26], fill=rgb('#9aa6ae'), width=2)
for k in range(3): sd.line([10 + k * 120, 34, 10 + k * 120, 250], fill=rgb('#9aa6ae'), width=2)
E.paste(sc, (384, 0)); uvbox('screen', 384, 0, 768, 256, (1024, 512))
d.rectangle([768, 0, 895, 63], fill=(240, 170, 80)); uvbox('vu', 772, 4, 892, 60, (1024, 512))
d.rectangle([896, 0, 1023, 63], fill=(120, 255, 140)); uvbox('led', 900, 4, 1020, 60, (1024, 512))
d.rectangle([768, 64, 1023, 191], fill=(150, 112, 70)); uvbox('niche', 776, 72, 1016, 184, (1024, 512))
E.save(os.path.join(GEN, 'corner_emit.png'))

# ======================= 4. 招牌（2048×1024） =======================
SG = Image.new('RGB', (2048, 1024), rgb(SLATE))


def slate(w, h):
    im = Image.new('RGB', (w, h), rgb(SLATE)); a = np.asarray(im, np.float32); a += noise(w, h, 10, 5)[..., None]; a += noise(w, h, 2, 3)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


lp_ = slate(2048, 430); d = ImageDraw.Draw(lp_)   # 左牆飾板（5.0 × 1.05 m；從店門那一端〔左〕開始寫）
ix, iy, ir = 250, 205, 120
vinyl_icon(d, ix, iy + 40, ir, rgb(CREAM), rgb(SLATE), wd=7, half=True)
f1 = font(190); s = '轉角唱片'; x = 420
for ch in s: d.text((x, 170), ch, font=f1, fill=rgb(CREAM), anchor='lm'); x += f1.getlength(ch) + 40
d.line([420, 300, 520, 300], fill=rgb(CREAM), width=4); d.line([x - 140, 300, x - 40, 300], fill=rgb(CREAM), width=4)
text_c(d, ((420 + x - 40) / 2, 300), 'Corner Records', font(64), rgb(CREAM))
a = np.asarray(lp_, np.float32); m = noise(2048, 430, 3, 1, np.random.default_rng(4)) > 0.88; a[m] = a[m] * 0.9 + 12; lp_ = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
SG.paste(lp_, (0, 0)); uvbox('logo_panel', 0, 0, 2048, 430, (2048, 1024))
bn = Image.new('RGB', (1152, 384), rgb('#e8e0cc')); bd = ImageDraw.Draw(bn)   # 布旗（直的：橫著畫，字往右轉 90°）
a = np.asarray(bn, np.float32); a += noise(1152, 384, 4, 6)[..., None]; bn = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); bd = ImageDraw.Draw(bn)
vinyl_icon(bd, 110, 192, 70, rgb('#2e3a3a'), rgb('#e8e0cc'), wd=4, half=True)
tx = Image.new('RGBA', (384, 1152), (0, 0, 0, 0)); td = ImageDraw.Draw(tx); f2 = font(150)
for i, ch in enumerate('轉角唱片'): td.text((192, 290 + i * 175), ch, font=f2, fill=hx('#2e3a3a'), anchor='mm')
td.text((192, 1040), 'Corner', font=font(52), fill=hx('#2e3a3a'), anchor='mm'); td.text((192, 1100), 'Records', font=font(52), fill=hx('#2e3a3a'), anchor='mm')
tx = tx.rotate(90, expand=True); bn.paste(tx, (0, 0), tx)
SG.paste(bn, (0, 448)); uvbox('banner', 0, 448, 1152, 832, (2048, 1024))   # 注意：畫的方向是往右＝布旗往下
SG.save(os.path.join(GEN, 'corner_sign.png'))

# ======================= 5. 地板（1024²＝1.0 m 淺灰磨石子，無縫） =======================
FW = 1024; rr = np.random.default_rng(12)
fa = np.zeros((FW, FW, 3), np.float32) + rgb('#b8afa3'); fa += noise(FW, FW, 64, 6, rr)[..., None]
F = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8)); fd = ImageDraw.Draw(F)
CH = [('#e8e6e0', 0.45), ('#8a8680', 0.25), ('#3a3836', 0.12), ('#c8b8a0', 0.12), ('#a89888', 0.06)]
for k in range(5200):
    cx, cy = rr.uniform(0, FW), rr.uniform(0, FW); r_ = rr.uniform(1.5, 7) if rr.random() < 0.85 else rr.uniform(7, 13)
    c = CH[rr.choice(len(CH), p=[p for _, p in CH])][0]; n = rr.integers(5, 8); a0 = rr.uniform(0, 6.28)
    pts = [(r_ * rr.uniform(0.6, 1.0) * math.cos(a0 + t * 6.283 / n), r_ * rr.uniform(0.6, 1.0) * math.sin(a0 + t * 6.283 / n)) for t in range(n)]
    for ox in (-FW, 0, FW):   # 無縫：邊上的碎石在對邊也畫一次
        for oy in (-FW, 0, FW):
            if -15 < cx + ox < FW + 15 and -15 < cy + oy < FW + 15: fd.polygon([(cx + ox + px, cy + oy + py) for px, py in pts], fill=rgb(c))
fa = np.asarray(F, np.float32); fa += noise(FW, FW, 2, 4, rr)[..., None]
F = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5)); F.save(os.path.join(GEN, 'corner_floor.png'))

json.dump(ATL, open(os.path.join(GEN, 'corner_atlas.json'), 'w'), indent=0)
if '--preview' in sys.argv:
    out = sys.argv[sys.argv.index('--preview') + 1]; pv = Image.new('RGB', (2048, 2048 + 1024), (40, 40, 40))
    pv.paste(G, (0, 0)); bg = Image.new('RGBA', (2048, 1024), (90, 120, 90, 255)); bg.alpha_composite(A); pv.paste(bg.convert('RGB'), (0, 2048))
    pv.resize((1024, 1536)).save(out, quality=80)
    pv2 = Image.new('RGB', (2048, 1024 + 512 + 1024), (40, 40, 40)); pv2.paste(SG, (0, 0)); pv2.paste(E, (0, 1024)); pv2.paste(F, (1024, 1024)); pv2.resize((1024, 1280)).save(out.replace('.jpg', '_2.jpg'), quality=80)
print('atlas cells', len(ATL))
