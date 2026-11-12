"""公館三間（安泰藥局 G04、汀州鮮果 G08、榮恩典文具社 G13）＋花序 Flower Notes（G11）外觀的貼圖：從使用者 2026-11-10 的參考圖拉正裁出來
（GG-SHOPS3-ART-1110、FLOWER-NOTES-ART-1110；圖：docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept/、docs/handoff/user_specs/flower_notes_ref/exterior.png）
→ textures/src/gg_cards/<key>.jpg；xs_front_tex.py 的 QG 用 '@textures/src/gg_cards/<key>.jpg' 收進 gg_fronts_atlas。
四個角＝左上、右上、右下、左下（參考圖 1672×941 的像素）。第 2 版（BB 11-10 23:51：招牌近看是糊的、櫥窗是一張糊掉的照片）：招牌裁成 2048 寬、櫥窗 1536 寬（原本 1024，進圖集以後再縮一半只剩約 500）。用法：python3 tools/blender/env_second/gg_shops6_tex.py [<六間參考圖資料夾> [<花序參考圖資料夾>]]"""
import os, sys
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC6 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept')
SRCF = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'docs/handoff/user_specs/flower_notes_ref')
OUT = os.path.join(HERE, 'textures', 'src', 'gg_cards')
k = 1672 / 1400   # 花序外觀的座標是在縮成 1400 寬的圖上量的
Q = {
    'ggantai_sign': (SRC6, 'shop_antai.webp', [(285, 98), (1440, 270), (1437, 418), (272, 298)], 2048, 300),
    'ggantai_int': (SRC6, 'shop_antai.webp', [(290, 404), (1238, 478), (1238, 792), (276, 836)], 1536, 600),
    'ggfruit_sign': (SRC6, 'shop_tingzhou_xianguo.webp', [(175, 5), (1113, 240), (1115, 358), (170, 195)], 2048, 380),
    'ggfruit_shop': (SRC6, 'shop_tingzhou_xianguo.webp', [(112, 292), (1235, 386), (1235, 760), (105, 940)], 1536, 630),
    'ggrong_sign': (SRC6, 'shop_rongendian.webp', [(288, 15), (1090, 228), (1090, 318), (283, 215)], 2048, 380),
    'ggrong_int': (SRC6, 'shop_rongendian.webp', [(190, 250), (1340, 385), (1340, 640), (185, 850)], 1536, 570),
    'ggfn_sign': (SRCF, 'exterior.png', [(372 * k, 270 * k), (1288 * k, 300 * k), (1288 * k, 380 * k), (372 * k, 362 * k)], 2048, 200),
    'ggfn_up': (SRCF, 'exterior.png', [(378 * k, 62 * k), (1258 * k, 125 * k), (1258 * k, 298 * k), (378 * k, 262 * k)], 1536, 330),
    'ggfn_winl': (SRCF, 'exterior.png', [(375 * k, 378 * k), (652 * k, 385 * k), (652 * k, 612 * k), (375 * k, 612 * k)], 672, 570),
    'ggfn_door': (SRCF, 'exterior.png', [(718 * k, 395 * k), (978 * k, 400 * k), (978 * k, 640 * k), (718 * k, 640 * k)], 672, 630),
    'ggfn_winr': (SRCF, 'exterior.png', [(1038 * k, 395 * k), (1258 * k, 400 * k), (1258 * k, 585 * k), (1038 * k, 585 * k)], 576, 480),
}


FONT = '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc'
def fn_sign(w=2048, h=200):
    """花序 Flower Notes 的招牌帶（第 2 版，BB 11-11 01:50：從參考圖裁的那一塊只有約 1090 像素寬、灰底灰字，放大到 9.4 m 糊到認不出字）：
    重畫——米白石材（淡淡的橫向紋理）＋深色字「花序｜Flower Notes」＋左邊一枝葉子的圖示（照參考圖的排法）；店名是使用者指定的，不改"""
    S = 2; W, H = w * S, h * S; rng = np.random.default_rng(7)
    base = np.array([240, 233, 219], float); n = rng.normal(0, 1, (H // 8, W // 64, 1)); n = np.array(Image.fromarray(((n[..., 0] * 30) + 128).clip(0, 255).astype('uint8')).resize((W, H), Image.BICUBIC), float)[..., None] - 128
    arr = (base + n * 0.16 + rng.normal(0, 1.2, (H, W, 1))).clip(0, 255).astype('uint8'); im = Image.fromarray(arr, 'RGB'); d = ImageDraw.Draw(im)
    ink = (58, 48, 40); cy = H // 2
    fz = ImageFont.truetype(FONT, int(H * 0.56)); fe = ImageFont.truetype(FONT, int(H * 0.3))
    t1 = '花序'; t2 = 'Flower Notes'; sp1 = int(H * 0.16); sp2 = int(H * 0.035)
    w1 = sum(d.textlength(ch, font=fz) for ch in t1) + sp1 * (len(t1) - 1); w2 = sum(d.textlength(ch, font=fe) for ch in t2) + sp2 * (len(t2) - 1)
    icon = int(H * 0.62); gap = int(H * 0.2); bar = int(H * 0.3); total = icon + gap + w1 + bar * 2 + w2; x = (W - total) // 2
    # 一枝葉子：彎的莖＋左右交錯的葉片
    pts = [(x + icon * (0.15 + 0.7 * t), cy + icon * (0.42 - 0.84 * t) + math.sin(t * math.pi) * icon * 0.08) for t in np.linspace(0, 1, 24)]
    d.line(pts, fill=ink, width=max(3, H // 60))
    for i, t in enumerate((0.2, 0.36, 0.52, 0.68, 0.84, 1.0)):
        px, py = pts[int(t * 23)]; ang = -0.86 + (1 if i % 2 else -1) * 0.9 - (0.0 if t < 1 else (1 if i % 2 else -1) * 0.9); ln = icon * (0.3 - 0.1 * t)
        leaf = Image.new('L', (int(ln * 2.4), int(ln * 2.4)), 0); ld = ImageDraw.Draw(leaf); c0 = leaf.width // 2; ld.ellipse([c0, c0 - ln * 0.22, c0 + ln, c0 + ln * 0.22], fill=255)
        leaf = leaf.rotate(-math.degrees(ang), resample=Image.BICUBIC); im.paste(ink, (int(px - c0), int(py - c0)), leaf)
    x += icon + gap
    for ch in t1: bb = d.textbbox((0, 0), ch, font=fz); d.text((x, cy - (bb[1] + bb[3]) / 2), ch, font=fz, fill=ink); x += d.textlength(ch, font=fz) + sp1
    x += bar - sp1; d.line([(x, cy - H * 0.2), (x, cy + H * 0.2)], fill=ink, width=max(2, H // 90)); x += bar
    for ch in t2: bb = d.textbbox((0, 0), 'F', font=fe); d.text((x, cy - (bb[1] + bb[3]) / 2), ch, font=fe, fill=ink); x += d.textlength(ch, font=fe) + sp2
    return im.resize((w, h), Image.LANCZOS)

def rong_sign(w=2048, h=380):
    """榮恩典文具社的招牌帶（RONG-SIGN-1112，LAWWW2-C；BB：招牌近看馬賽克——參考圖那一塊只有約 800 像素寬、拉正以後邊緣是糊的）：
    照參考圖重畫——米白燈箱底（淡淡的橫向紋理、上下緣略暗）＋黑色粗黑體「榮恩典文具社」＋左邊交叉的鉛筆和毛筆（線稿）＋字下面紅黃藍綠四條色塊；店名是使用者指定的，不改"""
    S = 3; W, H = w * S, h * S; rng = np.random.default_rng(13)
    base = np.array([241, 232, 208], float); n = rng.normal(0, 1, (H // 10, W // 80)); n = np.array(Image.fromarray(((n * 28) + 128).clip(0, 255).astype('uint8')).resize((W, H), Image.BICUBIC), float)[..., None] - 128
    yy = np.linspace(-1, 1, H)[:, None, None]; shade = 1.0 - 0.07 * yy ** 4
    arr = ((base + n * 0.12) * shade).clip(0, 255).astype('uint8'); im = Image.fromarray(arr, 'RGB'); d = ImageDraw.Draw(im)
    ink = (28, 26, 26); cy = int(H * 0.46)
    # 左邊：交叉的鉛筆和毛筆（照參考圖：鉛筆從左上斜到右下、筆尖朝下；毛筆從左下斜到右上、筆頭在右上）——線稿
    lw = max(6, H // 45); sz = H * 0.9; ox, oy = H * 0.12, H * 0.05
    P = lambda u, v: (ox + u * sz, oy + v * sz)
    def body(p0, p1, wd):
        ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0]); nx, ny = -math.sin(ang) * wd / 2, math.cos(ang) * wd / 2
        q = [(p0[0] + nx, p0[1] + ny), (p1[0] + nx, p1[1] + ny), (p1[0] - nx, p1[1] - ny), (p0[0] - nx, p0[1] - ny)]
        d.line(q + [q[0]], fill=ink, width=lw, joint='curve'); return ang, (nx, ny)
    p0, e, tip = P(0.06, 0.03), P(0.44, 0.76), P(0.55, 0.98)
    a1, (nx, ny) = body(p0, e, sz * 0.13)                                                            # 鉛筆桿
    d.line([(e[0] + nx, e[1] + ny), tip, (e[0] - nx, e[1] - ny)], fill=ink, width=lw, joint='curve')  # 削尖的筆頭
    m = (e[0] * 0.55 + tip[0] * 0.45, e[1] * 0.55 + tip[1] * 0.45); d.line([(m[0] + nx * 0.45, m[1] + ny * 0.45), (m[0] - nx * 0.45, m[1] - ny * 0.45)], fill=ink, width=lw)
    r0 = (p0[0] + (e[0] - p0[0]) * 0.12, p0[1] + (e[1] - p0[1]) * 0.12); d.line([(r0[0] + nx, r0[1] + ny), (r0[0] - nx, r0[1] - ny)], fill=ink, width=lw)   # 尾端的金屬環
    c, h1 = P(0.50, 0.34), P(0.10, 0.98)
    a2, (mx, my) = body(h1, c, sz * 0.075)                                                            # 毛筆桿（左下 → 右上）
    L = sz * 0.36; W2 = sz * 0.095; ux, uy = math.cos(a2), math.sin(a2); vx, vy = -uy, ux                 # 筆頭：從桿子上端往右上收尖的水滴
    side = lambda sg: [(c[0] + sg * vx * W2 * (1 - t) ** 0.8 * (0.6 + 0.4 * math.sin(math.pi * t)) + ux * L * t, c[1] + sg * vy * W2 * (1 - t) ** 0.8 * (0.6 + 0.4 * math.sin(math.pi * t)) + uy * L * t) for t in np.linspace(0, 1, 30)]
    tuft = side(1) + side(-1)[::-1]
    d.polygon(tuft, fill=(248, 241, 222)); d.line(tuft + [tuft[0]], fill=ink, width=lw, joint='curve')
    d.line([(c[0] + vx * W2 * 1.1, c[1] + vy * W2 * 1.1), (c[0] - vx * W2 * 1.1, c[1] - vy * W2 * 1.1)], fill=ink, width=int(lw * 1.6))   # 箍
    # 字：「榮恩典文具社」，粗黑體（描邊加粗；參考圖是很粗的黑體）
    fz = ImageFont.truetype(FONT, int(H * 0.54)); t = '榮恩典文具社'; x = int(H * 1.12); sp = int(H * 0.07); sw = max(3, int(H * 0.022))
    for ch in t:
        bb = d.textbbox((0, 0), ch, font=fz); d.text((x, cy - (bb[1] + bb[3]) / 2), ch, font=fz, fill=ink, stroke_width=sw, stroke_fill=ink)
        x += d.textlength(ch, font=fz) + sp
    # 字下面的四條色塊（紅、黃、藍、綠）
    cols = [(214, 44, 36), (238, 200, 30), (40, 112, 196), (68, 170, 64)]; y0b, y1b = int(H * 0.78), int(H * 0.9); x0b = int(H * 1.1); wb = int((x - sp - x0b) / 4.12)
    for i, c in enumerate(cols): xb = x0b + int(i * wb * 1.04); d.rectangle([xb, y0b, xb + wb, y1b], fill=c)
    return im.resize((w, h), Image.LANCZOS)

def coeffs(dst, src):
    A = []; Bv = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(Bv, float))


def main():
    os.makedirs(OUT, exist_ok=True)
    for key, (d, n, quad, w, h) in Q.items():
        im = Image.open(os.path.join(d, n)).convert('RGB').transform((w, h), Image.PERSPECTIVE, coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad), Image.BICUBIC)
        if key == 'ggfn_sign' and os.path.exists(FONT): im = fn_sign(w, h)   # 花序的招牌重畫（不用參考圖裁的那一塊）
        if key == 'ggrong_sign' and os.path.exists(FONT): im = rong_sign(w, h)   # 榮恩典的招牌重畫（RONG-SIGN-1112）
        im.save(os.path.join(OUT, key + '.jpg'), quality=92)
    print('saved', len(Q))


if __name__ == '__main__':
    main()
