"""溫州街小公園的貼圖（ART-WZ1，LAWWW2-B 2026-10-16）：從既有的自製貼圖調色產生，輸出到 textures/gen/。
- tree_leaves_bischofia.png：茄苳（偏暗、略帶古銅的綠），由 tree_leaves.png 調色
- tree_leaves_sweetgum_g.png／_r.png：楓香夏天（亮黃綠）／冬天（紅到橘，每片不一樣）
- azalea_leaves.png／azalea_flower.png：杜鵑花籬（由 fern_leaves.png 調成深綠；開花版撒粉紅五瓣小花）
用法：python3 tools/blender/env_second/park_tex.py（在 repo 根目錄）"""
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter
G = 'tools/blender/env_second/textures/gen/'


def hsv(rgb):
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) / 6
    s = np.where(mx > 0, (mx - mn) / (mx + 1e-6), 0)
    return h, s, mx


def rgbf(h, s, v):
    i = np.floor(h * 6) % 6; f = h * 6 - np.floor(h * 6); p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    out = np.zeros(h.shape + (3,))
    for k, (R, Gg, Bb) in enumerate(((v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q))):
        m = (i == k); out[m] = np.stack([R[m], Gg[m], Bb[m]], -1)
    return out


# 樹葉
a = np.asarray(Image.open(G + 'tree_leaves.png').convert('RGBA')).astype(np.float32) / 255
rgb = a[..., :3]; al = a[..., 3:]
h, s, v = hsv(rgb)
rng = np.random.default_rng(5)
noise = gaussian_filter(rng.random(h.shape), 6); noise = (noise - noise.min()) / (noise.max() - noise.min())


def save(nm, hh, ss, vv):
    out = np.concatenate([np.clip(rgbf(hh % 1, np.clip(ss, 0, 1), np.clip(vv, 0, 1)), 0, 1), al], -1)
    Image.fromarray((out * 255).astype(np.uint8), 'RGBA').save(G + nm); print('saved', nm)


save('tree_leaves_bischofia.png', h - 0.03, s * 1.05, v * 0.82)                              # 茄苳
save('tree_leaves_sweetgum_g.png', h + 0.02, s * 0.95, v * 1.05)                             # 楓香：夏
save('tree_leaves_sweetgum_r.png', 0.02 + 0.06 * noise, np.clip(s * 1.2 + 0.25, 0, 1), v * 0.95)   # 楓香：冬

# 杜鵑（修剪過的花籬）：小橢圓葉密密排列（不再用蕨類葉片：葉片太長，花籬看起來像散開的羽毛）。
# 透明處的 RGB 填深綠：同一張圖也給花籬的「實心核心」用（不透明、不看 alpha），葉縫露出來的是暗綠而不是黑。
import math
S = 1024; rng = np.random.default_rng(11)
def leaves_img(flowers):
    im = Image.new('RGBA', (S, S), (38, 58, 34, 0)); d = ImageDraw.Draw(im)
    for _ in range(5200):
        x, y = rng.integers(0, S, 2); L_ = rng.uniform(22, 38); W_ = L_ * rng.uniform(0.38, 0.5); a = rng.uniform(0, math.pi)
        g = rng.uniform(0.75, 1.15); c = (int(48 * g), int(86 * g), int(42 * g), 255)
        pts = [(x + math.cos(a) * L_ / 2 * math.cos(t) - math.sin(a) * W_ / 2 * math.sin(t), y + math.sin(a) * L_ / 2 * math.cos(t) + math.cos(a) * W_ / 2 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 14)]
        d.polygon(pts, fill=c)
        hl = (min(255, c[0] + 40), min(255, c[1] + 46), min(255, c[2] + 26), 255)      # 葉脈的反光
        d.line([(x - math.cos(a) * L_ * 0.4, y - math.sin(a) * L_ * 0.4), (x + math.cos(a) * L_ * 0.4, y + math.sin(a) * L_ * 0.4)], fill=hl, width=2)
    if flowers:
        cols = [(232, 86, 150), (244, 120, 170), (222, 64, 126), (250, 170, 205), (240, 240, 236)]
        for _ in range(900):
            x, y = rng.integers(0, S, 2); r = rng.uniform(9, 15); c = cols[int(rng.integers(0, 4)) if rng.random() > 0.06 else 4]
            for k in range(5):
                ang = k * 1.2566 + rng.random() * 0.3; px, py = x + math.cos(ang) * r * 0.62, y + math.sin(ang) * r * 0.62
                sh = tuple(int(v * rng.uniform(0.86, 1.0)) for v in c)
                d.ellipse([px - r * 0.58, py - r * 0.58, px + r * 0.58, py + r * 0.58], fill=sh + (255,))
            d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(170, 40, 90, 255))
    im = im.resize((512, 512), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); al = a[..., 3:] / 255
    bg = np.array([38, 58, 34], np.float32)
    a[..., :3] = np.where(al > 0.02, a[..., :3], bg)          # 完全透明的地方固定填深綠
    return Image.fromarray(a.astype(np.uint8), 'RGBA')
leaves_img(False).save(G + 'azalea_leaves.png'); print('saved azalea_leaves.png')
leaves_img(True).save(G + 'azalea_flower.png'); print('saved azalea_flower.png')
