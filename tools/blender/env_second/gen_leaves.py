"""植物用的葉片貼圖（RGBA，透明背景）：本作程式產生（固定亂數種子，可重現），不是外部素材。
輸出 tools/blender/env_second/textures/gen/：
  ivy_leaves.png   常春藤（爬藤）：小的心形／三裂葉＋細莖，貼在牆面的葉片卡上
  broad_leaves.png 大葉植物（龜背芋、琴葉榕一類的盆栽）：大的橢圓葉＋葉脈
  fern_leaves.png  蕨類／細葉：羽狀複葉
  olive_leaves.png 橄欖樹一類的細長葉（門口的小樹）
用法：python3 tools/blender/env_second/gen_leaves.py"""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures', 'gen')
SS = 2   # 先畫兩倍大再縮小（反鋸齒）


def leaf_poly(cx, cy, length, width, ang, kind='oval', n=28):
    """葉片外形（多邊形點）：沿葉軸參數化；kind＝oval（橢圓尖葉）、heart（心形／常春藤）、lance（細長）"""
    pts = []
    for i in range(n + 1):
        t = i / n                       # 0＝葉柄端、1＝葉尖
        if kind == 'heart':
            w = width * (math.sin(math.pi * t) ** 0.7) * (1.0 + 0.35 * math.cos(2 * math.pi * t)) * (0.85 + 0.15 * math.cos(6 * math.pi * t))
        elif kind == 'lance':
            w = width * (math.sin(math.pi * t) ** 1.2)
        else:
            w = width * (math.sin(math.pi * t ** 0.85) ** 0.9)
        pts.append((t * length, w))
    outline = pts + [(x, -y) for (x, y) in reversed(pts)]
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for (x, y) in outline]


def shade(rgb, k):
    return tuple(max(0, min(255, int(c * k))) for c in rgb)


def draw_leaf(d, cx, cy, length, width, ang, base, kind, vein=True):
    poly = leaf_poly(cx, cy, length, width, ang, kind)
    d.polygon(poly, fill=base + (255,))
    # 半邊稍亮（光從上面來的感覺）
    half = leaf_poly(cx, cy, length, width * 0.55, ang, kind)
    d.polygon(half[:len(half) // 2] + [(cx, cy)], fill=shade(base, 1.12) + (255,))
    if vein:
        ex, ey = cx + math.cos(ang) * length * 0.92, cy + math.sin(ang) * length * 0.92
        d.line([(cx, cy), (ex, ey)], fill=shade(base, 1.35) + (255,), width=max(1, int(width * 0.08)))
        for k in range(1, 5):
            t = k / 5.5; px, py = cx + math.cos(ang) * length * t, cy + math.sin(ang) * length * t
            for s in (-1, 1):
                a2 = ang + s * 0.9; L2 = width * 0.75 * (1 - abs(0.5 - t))
                d.line([(px, py), (px + math.cos(a2) * L2, py + math.sin(a2) * L2)], fill=shade(base, 1.2) + (200,), width=max(1, int(width * 0.04)))


def sheet(name, seed, count, kind, greens, size=(26, 60), stems=False, ratio=0.55, pad=40):
    random.seed(seed)
    S = 512 * SS; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if stems:   # 常春藤的細莖：幾條彎曲的線
        for _ in range(9):
            x, y = random.uniform(0, S), random.uniform(0, S); a = random.uniform(0, 2 * math.pi); pts = [(x, y)]
            for _ in range(14):
                a += random.uniform(-0.5, 0.5); x += math.cos(a) * 30 * SS; y += math.sin(a) * 30 * SS; pts.append((x, y))
            d.line(pts, fill=(92, 70, 48, 255), width=3 * SS)
    for i in range(count):
        L = random.uniform(*size) * SS; W = L * ratio * random.uniform(0.85, 1.15)
        cx, cy = random.uniform(pad * SS, S - pad * SS), random.uniform(pad * SS, S - pad * SS)
        base = random.choice(greens); base = shade(base, random.uniform(0.82, 1.12))
        draw_leaf(d, cx, cy, L, W, random.uniform(0, 2 * math.pi), base, kind)
    im = im.resize((512, 512), Image.LANCZOS)
    # 透明邊緣的顏色往外擴（避免 mipmap 時葉緣出現黑邊）
    rgb = im.convert('RGB'); a = im.split()[3]
    dil = Image.new('RGB', im.size, (60, 85, 50)); dil.paste(rgb.filter(ImageFilter.MaxFilter(9)), (0, 0)); dil.paste(rgb, (0, 0), a)
    out = Image.merge('RGBA', (*dil.split(), a))
    os.makedirs(OUT, exist_ok=True); p = os.path.join(OUT, name); out.save(p); print('wrote', p)


def fern(name, seed):
    random.seed(seed); S = 512 * SS; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for _ in range(14):
        x, y = random.uniform(60, S - 60), random.uniform(60, S - 60); a = random.uniform(0, 2 * math.pi); L = random.uniform(150, 260) * SS / 2
        g = shade(random.choice([(70, 110, 52), (58, 98, 46), (84, 124, 60)]), random.uniform(0.85, 1.1))
        ex, ey = x + math.cos(a) * L, y + math.sin(a) * L; d.line([(x, y), (ex, ey)], fill=shade(g, 0.8) + (255,), width=2 * SS)
        for k in range(1, 16):
            t = k / 16; px, py = x + math.cos(a) * L * t, y + math.sin(a) * L * t; l2 = L * 0.28 * (1 - t) + 6
            for s in (-1, 1):
                draw_leaf(d, px, py, l2, l2 * 0.32, a + s * 1.05, g, 'lance', vein=False)
    im = im.resize((512, 512), Image.LANCZOS); rgb = im.convert('RGB'); al = im.split()[3]
    dil = Image.new('RGB', im.size, (60, 85, 50)); dil.paste(rgb.filter(ImageFilter.MaxFilter(9)), (0, 0)); dil.paste(rgb, (0, 0), al)
    Image.merge('RGBA', (*dil.split(), al)).save(os.path.join(OUT, name)); print('wrote', name)


if __name__ == '__main__':
    IVY = [(52, 92, 44), (40, 78, 38), (66, 104, 50), (78, 112, 58), (46, 84, 40)]
    sheet('ivy_leaves.png', 11, 260, 'heart', IVY, size=(22, 44), stems=True, ratio=0.62)
    sheet('broad_leaves.png', 12, 34, 'oval', [(46, 88, 46), (38, 76, 40), (58, 98, 52), (70, 110, 58)], size=(120, 190), ratio=0.42, pad=90)
    sheet('olive_leaves.png', 13, 420, 'lance', [(92, 112, 78), (80, 102, 70), (104, 124, 88), (70, 92, 62)], size=(26, 44), ratio=0.24)
    fern('fern_leaves.png', 14)
