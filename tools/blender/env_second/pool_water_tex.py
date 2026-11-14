"""游泳池水面的兩張貼圖（POOL-SWIM-LOOK-1110，LAWWW2 帳號 A 2026-11-11；LAWWW 角色驗收：水太透明、沒有水面，泳客近看像趴在水上）：
1. pool_ripple_nor.webp：水面的小波紋法線圖（512×512、四邊無縫）。做法：好幾組整數頻率的正弦波（方向、波長、相位用固定亂數，無縫）＋頻域濾過的亂數（也是無縫）疊成高度場 → 有限差分算法線。
   遊戲裡兩層不同大小、往不同方向慢慢捲動（src/gym3d.js 的 poolWater），疊起來不會看到重複。
2. pool_env.webp：水面反射用的環境圖（等距圓柱 1024×512）＝在 Blender 裡用 gym_b1.glb 從池中央水面高度拍一張全景（Cycles 全景鏡頭），
   不是畫的：反射看到的是體育館真的天花板、燈、牆（tools/blender/env_second/pool_env_render.py；這支只做法線圖，環境圖另外那支）。
用法：python3 tools/blender/env_second/pool_water_tex.py（numpy、Pillow）"""
import os
import numpy as np
from PIL import Image
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets', 'models', 'env', 'second_ai')
N = 512
rng = np.random.default_rng(1103)
y, x = np.mgrid[0:N, 0:N] / N
h = np.zeros((N, N))
for k in range(14):   # 整數頻率＝無縫
    fx, fy = rng.integers(-9, 10, 2)
    if fx == 0 and fy == 0: continue
    amp = 1.0 / np.hypot(fx, fy) ** 1.1
    h += amp * np.sin(2 * np.pi * (fx * x + fy * y) + rng.uniform(0, 2 * np.pi))
F = np.fft.fft2(rng.normal(size=(N, N)))
ky, kx = np.meshgrid(np.fft.fftfreq(N) * N, np.fft.fftfreq(N) * N, indexing='ij'); kr = np.hypot(kx, ky)
F *= np.exp(-((kr - 14) / 7.0) ** 2) + 0.45 * np.exp(-((kr - 34) / 10.0) ** 2)   # 留下中等大小的波紋（環形帶通）
n = np.real(np.fft.ifft2(F)); n /= n.std()
h = h / h.std() + 0.8 * n
h = np.sign(h) * np.abs(h) ** 0.85   # 波峰稍微尖一點（水面的波紋）
dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / 2; dy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / 2
s = 0.9
nx, ny, nz = -dx * s, dy * s, np.ones_like(h)   # 圖的 +y 往上（three.js 法線圖：綠色＝+y 切線方向）
L = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / L, ny / L, nz / L
img = np.stack([(nx * 0.5 + 0.5), (ny * 0.5 + 0.5), (nz * 0.5 + 0.5)], -1)
Image.fromarray((img * 255 + 0.5).clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, 'pool_ripple_nor.webp'), quality=90, method=6)
print('ok', os.path.normpath(os.path.join(OUT, 'pool_ripple_nor.webp')), 'slope', float(np.abs(dx).mean() * s))
