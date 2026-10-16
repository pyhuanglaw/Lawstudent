"""BG-11 trip_mountain（春假開車旅行・山上看星星）：用使用者生成、BB-B 通過的約會底圖 D09（黃昏）調成夜晚版（AA-B 確認的做法）。
- 天空換成夜空：深藍漸層、星星（大小亮度不同，少數有光暈）、一彎月亮；地平線留一點城市的光害。
- 地面調暗、偏藍；燈籠、城市燈光、步道燈這些亮的暖色保留（夜晚的光源本來就亮）。
- 「幾乎全黑」（AA_147）：整體很暗，只有燈和星星。
用法：python3 tools/blender/env_second/bg_trip_mountain.py <d09_base_dusk.webp> <輸出 webp>
（D09 在 BB-B 分支 docs/story_planning/date_system/art/d09_base_dusk.webp）"""
import math, sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB').resize((1920, 1080), Image.LANCZOS)
a = np.asarray(im).astype(np.float32) / 255.0; H, W = a.shape[:2]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# ---- 天空遮罩：上面 40%、不是樹葉（綠、暗）、不是燈籠（很亮的暖色）；再往下找到山稜線（從上往下第一個「明顯變暗、變綠」的地方）
mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); sat = (mx - mn) / np.maximum(mx, 1e-4)
skyish = (yy < H * 0.40) & (lum > 0.10) & ~((g > r * 1.05) & (g > b * 0.95)) & ~((lum > 0.75) & (r > b * 1.4))
cand = np.asarray(Image.fromarray((skyish * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))).astype(np.float32) / 255.0 > 0.5
# 山稜線：每一欄找「上面 30 px 裡七成以上是天空」的最低那一列，再沿 x 做中位數平滑（去掉樹葉縫、城市燈造成的尖刺）
cs = np.cumsum(cand.astype(np.float32), axis=0); win = 30
dens = (cs - np.vstack([np.zeros((win, W), np.float32), cs[:-win]])) / win
ok = (dens > 0.7) & cand & (yy < H * 0.38)
ridge = np.where(ok.any(0), H - 1 - np.argmax(ok[::-1], axis=0), 0).astype(np.float32)
from scipy.ndimage import median_filter  # noqa: E402
ridge = median_filter(ridge, size=41, mode='nearest')
from PIL import ImageDraw  # noqa: E402
fg = Image.new('L', (W, H), 0); dfg = ImageDraw.Draw(fg)                # 手畫的前景：左上的茶館（屋簷下的牆、窗、燈籠）——顏色和黃昏天空很像，自動遮罩分不出來
dfg.polygon([(0, 0), (200, 0), (420, 150), (600, 250), (600, 600), (0, 600)], fill=255)   # 1920×1080 座標：屋頂下緣斜線以下都是建築
warm = (lum > 0.6) & (r > b * 1.3) & (yy < H * 0.38)                    # 黃昏太陽附近最亮的雲（茶館外面沒有燈籠，亮的暖色就是天空）
sky0 = (cand | warm) & (yy <= ridge[None, :] + 2) & (np.asarray(fg) < 128)
sky = np.asarray(Image.fromarray((sky0 * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0))).astype(np.float32) / 255.0

# ---- 地面：調暗、偏藍；亮的暖色光源保留
lightmask = np.clip((lum - 0.42) / 0.3, 0, 1) * np.clip((r - b) / 0.25 + 0.3, 0, 1)
night = a * np.array([0.30, 0.36, 0.55], np.float32)
glow = a * (0.9 + 0.2 * lightmask[..., None])
ground = night * (1 - lightmask[..., None]) + glow * lightmask[..., None]

# ---- 夜空：深藍漸層＋地平線一點光害＋星星＋月亮
t = np.clip(yy / (H * 0.38), 0, 1)
ns = np.stack([0.010 + 0.05 * t ** 2.2, 0.016 + 0.07 * t ** 2.2, 0.045 + 0.13 * t ** 2.0], -1)
ns += (np.exp(-((yy - H * 0.33) / (H * 0.05)) ** 2) * 0.05)[..., None] * np.array([1.0, 0.7, 0.45], np.float32)   # 城市的光害
rng = np.random.default_rng(11)
stars = np.zeros((H, W), np.float32)
n = 1800; sx = rng.uniform(0, W, n); sy = rng.uniform(0, H * 0.4, n) ** 1.0; sb = rng.power(4.0, n) * rng.uniform(0.25, 1.0, n)
for x, y, v in zip(sx.astype(int), sy.astype(int), sb):
    stars[y, x] = max(stars[y, x], v * (1.0 - 0.6 * y / (H * 0.4)))
big = Image.fromarray((stars * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
halo = Image.fromarray(((stars > 0.8) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.0))
st = np.asarray(big).astype(np.float32) / 255.0 * 1.6 + np.asarray(halo).astype(np.float32) / 255.0 * 0.35
ns += st[..., None] * np.array([0.92, 0.95, 1.0], np.float32)
mx_, my_, mr = W * 0.60, H * 0.10, H * 0.032                         # 月亮（上弦，偏右的天空；不擋纜車）
d1 = np.hypot(xx - mx_, yy - my_); d2 = np.hypot(xx - (mx_ + mr * 0.55), yy - (my_ - mr * 0.15))
moon = np.clip((mr - d1) / 1.5, 0, 1) * np.clip((d2 - mr * 0.92) / 1.5, 0, 1)
ns += (moon * 0.95)[..., None] * np.array([1.0, 0.97, 0.88], np.float32)
ns += (np.exp(-(d1 / (mr * 4.0)) ** 2) * 0.10)[..., None] * np.array([0.8, 0.85, 1.0], np.float32)

outa = ns * sky[..., None] + ground * (1 - sky[..., None])
outa = np.clip(outa, 0, 1) ** 1.05
Image.fromarray((outa * 255).astype(np.uint8)).save(out, quality=88, method=6)
print('saved', out, outa.shape)
