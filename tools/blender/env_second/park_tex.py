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

# 杜鵑
a = np.asarray(Image.open(G + 'fern_leaves.png').convert('RGBA')).astype(np.float32)
leaf = a.copy(); leaf[..., 0] *= 0.75; leaf[..., 1] *= 0.85; leaf[..., 2] *= 0.7
Image.fromarray(np.clip(leaf, 0, 255).astype(np.uint8), 'RGBA').save(G + 'azalea_leaves.png')
fl = Image.fromarray(np.clip(leaf, 0, 255).astype(np.uint8), 'RGBA'); d = ImageDraw.Draw(fl); rng = np.random.default_rng(3)
W, H = fl.size; alf = a[..., 3]
pts = [(x, y) for x, y in zip(rng.integers(0, W, 900), rng.integers(0, H, 900)) if alf[y, x] > 128][:420]
for x, y in pts:
    r = int(rng.integers(5, 10)); c = [(232, 86, 150), (244, 120, 170), (220, 60, 120), (250, 170, 200)][int(rng.integers(0, 4))]
    for k in range(5):
        ang = k * 1.2566 + rng.random(); px, py = x + np.cos(ang) * r * 0.6, y + np.sin(ang) * r * 0.6
        d.ellipse([px - r * 0.55, py - r * 0.55, px + r * 0.55, py + r * 0.55], fill=c + (255,))
    d.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(250, 230, 120, 255))
fl.save(G + 'azalea_flower.png'); print('saved azalea_flower.png', len(pts))
