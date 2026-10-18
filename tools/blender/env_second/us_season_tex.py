"""美國篇的季節貼圖（ART-US-SEASON）：本作程式產生（固定亂數種子，可重現），不是外部素材。
祐廷 8/2 到美國、12/23 回來（AA_213）：夏末 → 秋天紅葉 → 初冬落光 → 12 月初下雪。
輸出 tools/blender/env_second/textures/gen/：
  us_leaves_summer.png     夏末的闊葉（楓、橡樹、一般卵形葉）：深綠、偏一點橄欖色（不是春天的嫩綠）
  us_leaves_red.png        秋天：楓樹的紅（深紅、朱紅，夾一點橙）
  us_leaves_orange.png     秋天：橙、銅色（橡樹轉色）
  us_leaves_yellow.png     秋天：黃（鵝掌楸、樺樹一類），夾一點還沒轉的黃綠
  us_twigs.png             初冬、冬天：落光葉子的細枝（灰褐），橡樹留著幾片乾枯的褐色葉子
  us_leaf_litter.png       秋天、初冬：樹下草地上的落葉（貼在地上的一片片葉片卡）
  us_twigs_snow.png        雪：細枝上面積了一層雪（枝條上緣白色）
  us_shrub_snow.png        雪：灌木（常綠，olive_leaves.png）的葉子上緣積雪
用法：python3 tools/blender/env_second/us_season_tex.py"""
import math, os, random, sys
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gen_leaves import leaf_poly, shade, draw_leaf, OUT   # noqa: E402

SS = 2


def maple_poly(cx, cy, size, ang, n=90):
    """楓葉外形：五個裂片（中間最長、兩側往下遞減），裂片之間有缺口；葉柄朝 ang+π"""
    pts = []
    for i in range(n):
        t = -math.pi + 2 * math.pi * i / n          # 0＝葉尖方向
        lobe = max(0.0, math.cos(2.5 * t)) ** 0.9     # 五個裂片的峰：t＝0、±0.4π×…（cos(2.5t) 在 t＝0、±0.8π 是峰，±0.4π 是谷）
        lobe2 = max(0.0, math.cos(2.5 * t + math.pi)) ** 1.2   # 另一組峰（±0.4π），兩組合起來是五個裂片
        fall = 1.0 - 0.35 * abs(t) / math.pi          # 越往葉柄越短
        teeth = 1.0 + 0.06 * math.cos(13 * t)         # 鋸齒
        r = size * (0.38 + 0.55 * max(lobe, 0.85 * lobe2)) * fall * teeth
        if abs(abs(t) - math.pi) < 0.25: r = size * 0.16   # 葉柄那一側的凹口
        pts.append((r * math.cos(t), r * math.sin(t)))
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for (x, y) in pts]


def oak_poly(cx, cy, length, width, ang, n=60):
    """橡樹葉：長形、兩側圓弧裂片（四對）"""
    pts = []
    for i in range(n + 1):
        t = i / n
        env = math.sin(math.pi * t ** 0.9) ** 0.8
        lob = 0.62 + 0.38 * abs(math.sin(4.5 * math.pi * t))
        pts.append((t * length, width * env * lob))
    outline = pts + [(x, -y) for (x, y) in reversed(pts)]
    ca, sa = math.cos(ang), math.sin(ang)
    return [(cx + x * ca - y * sa, cy + x * sa + y * ca) for (x, y) in outline]


def fill_leaf(d, kind, cx, cy, L, ang, base, rnd):
    if kind == 'maple':
        poly = maple_poly(cx, cy, L * 0.7, ang)
        d.polygon(poly, fill=base + (255,))
        inner = maple_poly(cx, cy, L * 0.38, ang)
        d.polygon(inner, fill=shade(base, 1.08) + (255,))
        for k in (-2, -1, 0, 1, 2):                       # 掌狀的葉脈
            a2 = ang + k * 0.75; d.line([(cx, cy), (cx + math.cos(a2) * L * 0.45, cy + math.sin(a2) * L * 0.45)], fill=shade(base, 1.25) + (190,), width=max(1, int(L * 0.025)))
        d.line([(cx, cy), (cx - math.cos(ang) * L * 0.32, cy - math.sin(ang) * L * 0.32)], fill=shade(base, 0.7) + (255,), width=max(1, int(L * 0.03)))
    elif kind == 'oak':
        d.polygon(oak_poly(cx, cy, L, L * 0.34, ang), fill=base + (255,))
        ex, ey = cx + math.cos(ang) * L * 0.9, cy + math.sin(ang) * L * 0.9
        d.line([(cx, cy), (ex, ey)], fill=shade(base, 1.3) + (220,), width=max(1, int(L * 0.03)))
    else:
        draw_leaf(d, cx, cy, L, L * 0.5 * rnd.uniform(0.85, 1.1), ang, base, 'oval')


def finish(im, name, fill_rgb):
    im = im.resize((512, 512), Image.LANCZOS)
    rgb = im.convert('RGB'); a = im.split()[3]
    dil = Image.new('RGB', im.size, fill_rgb); dil.paste(rgb.filter(ImageFilter.MaxFilter(9)), (0, 0)); dil.paste(rgb, (0, 0), a)
    out = Image.merge('RGBA', (*dil.split(), a))
    os.makedirs(OUT, exist_ok=True); p = os.path.join(OUT, name); out.save(p); print("wrote", p)


def leaf_sheet(name, seed, count, palette, kinds=(('maple', 0.45), ('oak', 0.25), ('oval', 0.3)), size=(40, 76), pad=36, gaps=0.0):
    """一張葉片卡：count 片葉子隨機散布、互相重疊。palette＝[(rgb, 權重)]；gaps＝挖掉幾個圓洞（秋天開始落葉、葉子比夏天稀）"""
    rnd = random.Random(seed); S = 512 * SS
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cols, wts = zip(*palette); kn, kw = zip(*kinds)
    for _ in range(9):                                     # 細枝（葉子底下透出來）
        x, y = rnd.uniform(0, S), rnd.uniform(0, S); a = rnd.uniform(0, 2 * math.pi); pts = [(x, y)]
        for _ in range(10):
            a += rnd.uniform(-0.35, 0.35); x += math.cos(a) * 36 * SS; y += math.sin(a) * 36 * SS; pts.append((x, y))
        d.line(pts, fill=(78, 64, 52, 255), width=3 * SS)
    for i in range(count):
        L = rnd.uniform(*size) * SS
        cx, cy = rnd.uniform(pad * SS, S - pad * SS), rnd.uniform(pad * SS, S - pad * SS)
        base = rnd.choices(cols, wts)[0]; base = shade(base, rnd.uniform(0.8, 1.12))
        fill_leaf(d, rnd.choices(kn, kw)[0], cx, cy, L, rnd.uniform(0, 2 * math.pi), base, rnd)
    if gaps:
        mk = Image.new('L', (S, S), 255); md = ImageDraw.Draw(mk)
        for _ in range(int(gaps)):
            x, y, r = rnd.uniform(0, S), rnd.uniform(0, S), rnd.uniform(30, 70) * SS
            md.ellipse([x - r, y - r, x + r, y + r], fill=0)
        a = im.split()[3]; im.putalpha(Image.fromarray(__import__('numpy').minimum(__import__('numpy').array(a), __import__('numpy').array(mk))))
    finish(im, name, tuple(int(c) for c in cols[0]))


def twigs(name, seed, dead_leaves=40):
    """落光葉子的樹冠：一張卡上幾叢分叉的細枝（灰褐、末端越來越細），少數乾枯的褐色橡樹葉還掛著"""
    rnd = random.Random(seed); S = 512 * SS
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    def branch(x, y, a, L, w, depth):
        if depth == 0 or w < 0.6 * SS: return
        x2, y2 = x + math.cos(a) * L, y + math.sin(a) * L
        mid = (x + math.cos(a + rnd.uniform(-0.2, 0.2)) * L * 0.5, y + math.sin(a + rnd.uniform(-0.2, 0.2)) * L * 0.5)
        g = rnd.randint(-8, 8); col = (96 + g, 84 + g, 74 + g, 255)
        d.line([(x, y), mid, (x2, y2)], fill=col, width=max(1, int(w)), joint='curve')
        n = 2 if rnd.random() < 0.75 else 3
        for k in range(n):
            branch(x2, y2, a + rnd.uniform(-0.75, 0.75), L * rnd.uniform(0.62, 0.8), w * 0.68, depth - 1)
    for _ in range(7):                                     # 幾叢枝條，從卡的邊緣、中間往外長
        x, y = rnd.uniform(0.15 * S, 0.85 * S), rnd.uniform(0.15 * S, 0.85 * S)
        for k in range(rnd.randint(2, 3)):
            branch(x, y, rnd.uniform(0, 2 * math.pi), rnd.uniform(70, 110) * SS, rnd.uniform(5, 7) * SS, 6)
    for _ in range(dead_leaves):                           # 乾枯的橡樹葉
        L = rnd.uniform(26, 40) * SS; base = rnd.choice([(122, 86, 52), (104, 74, 46), (140, 104, 64)])
        fill_leaf(d, 'oak', rnd.uniform(40 * SS, S - 40 * SS), rnd.uniform(40 * SS, S - 40 * SS), L, rnd.uniform(0, 2 * math.pi), base, rnd)
    finish(im, name, (96, 84, 74))


def litter(name, seed):
    """地上的落葉：平貼在地上的一片片楓葉、橡樹葉（紅、橙、黃、褐），中間空白多（草地透出來）"""
    rnd = random.Random(seed); S = 512 * SS
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pal = [(170, 52, 34), (196, 104, 34), (206, 160, 52), (128, 90, 56), (150, 70, 40), (186, 132, 48)]
    for _ in range(170):
        L = rnd.uniform(26, 46) * SS; base = shade(rnd.choice(pal), rnd.uniform(0.75, 1.05))
        fill_leaf(d, rnd.choice(['maple', 'maple', 'oak', 'oval']), rnd.uniform(30 * SS, S - 30 * SS), rnd.uniform(30 * SS, S - 30 * SS), L, rnd.uniform(0, 2 * math.pi), base, rnd)
    finish(im, name, (150, 96, 52))


def snow_cap(src, name, thick=3, blobs=0, seed=37):
    """在葉片卡上面加雪：每個不透明像素，如果正上方 thick 像素內是透明的（＝上緣），塗成雪白（卡片的 v 朝上＝世界的上方，見 us_community.py 的 leaf_card）；
    blobs＞0 時另外在葉面上點幾團雪"""
    import numpy as np
    im = Image.open(os.path.join(OUT, src)).convert('RGBA'); a = np.array(im).astype(np.float32); A = a[..., 3] > 127
    top = np.zeros_like(A)
    for k in range(1, thick + 1):
        up = np.zeros_like(A); up[k:, :] = A[:-k, :]
        top |= A & ~up
    cap = top.copy()
    for k in range(1, thick):                              # 上緣往下加厚
        dn = np.zeros_like(cap); dn[k:, :] = top[:-k, :]; cap |= dn & A
    if blobs:
        rnd = random.Random(seed); yy, xx = np.mgrid[0:A.shape[0], 0:A.shape[1]]
        for _ in range(blobs):
            cx, cy, r = rnd.uniform(0, 512), rnd.uniform(0, 512), rnd.uniform(6, 16)
            cap |= A & ((xx - cx) ** 2 + ((yy - cy) * 1.6) ** 2 < r * r)
    snow = np.array([236, 240, 245], np.float32)
    a[cap, :3] = a[cap, :3] * 0.15 + snow * 0.85
    Image.fromarray(a.astype(np.uint8), 'RGBA').save(os.path.join(OUT, name)); print('wrote', name)


if __name__ == '__main__':
    leaf_sheet('us_leaves_summer.png', 31, 330, [((54, 82, 40), 3), ((44, 70, 36), 3), ((66, 92, 46), 2), ((78, 98, 50), 1), ((38, 60, 32), 2)])
    leaf_sheet('us_leaves_red.png', 32, 250, [((168, 36, 28), 3), ((196, 58, 32), 3), ((140, 30, 30), 2), ((210, 96, 40), 1), ((120, 40, 36), 1)])
    leaf_sheet('us_leaves_orange.png', 33, 250, [((204, 110, 36), 3), ((184, 86, 30), 3), ((216, 140, 44), 2), ((150, 82, 40), 2), ((170, 60, 30), 1)])
    leaf_sheet('us_leaves_yellow.png', 34, 250, [((218, 176, 54), 3), ((200, 156, 40), 3), ((228, 196, 80), 2), ((170, 160, 60), 1), ((140, 140, 56), 1)])
    twigs('us_twigs.png', 35)
    litter('us_leaf_litter.png', 36)
    snow_cap('us_twigs.png', 'us_twigs_snow.png', thick=2)
    snow_cap('olive_leaves.png', 'us_shrub_snow.png', thick=5, blobs=90)
