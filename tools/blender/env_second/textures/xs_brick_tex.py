"""X246 新生南路校園那一側的紅磚人行道（XS-BRICK-WALK-1110，LAWWW2 帳號 A 2026-11-10；LAWWW 派：PBR 磚紋，draw call 不增加，D38 第 6 點）。

輸入（Poly Haven CC0，已在 repo）：tools/blender/env_second/textures/brick_pavement_04/brick_pavement_04_{diff,nor_gl}_1k.jpg（512×512，丁字砌的磚，紅、深褐、灰混著）
輸出（遊戲 src/xinsheng3d.js 讀）：
  assets/textures/campus/brick_red_diff.webp   512×512，平均調成遊戲原本的紅磚色 #b77a62，每塊磚的深淺照原圖（灰的、太深的磚拉回紅色系，留一點色差）
  assets/textures/campus/brick_red_nor.webp    法線（原圖，OpenGL 方向）
原圖本來就是無縫的；一張約 1.8 m（一塊磚約 23×10 cm，台灣紅磚的大小）。
用法（repo 根目錄）：python3 tools/blender/env_second/textures/xs_brick_tex.py
"""
import os
import numpy as np
from PIL import Image

T = 'tools/blender/env_second/textures/brick_pavement_04/'
OUT = 'assets/textures/campus/'
TARGET = np.array([0xb7, 0x7a, 0x62], np.float64) / 255.0   # 遊戲原本的紅磚色（sRGB）

def s2l(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def l2s(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, None), 1 / 2.4) - 0.055)

src = np.asarray(Image.open(T + 'brick_pavement_04_diff_1k.jpg').convert('RGB'), np.float64) / 255.0
lin = s2l(src)
lum = lin @ np.array([0.2126, 0.7152, 0.0722])
rel = lum / lum.mean()                                  # 每個像素相對平均的亮度：磚與磚的深淺、磚縫
rel = 1.0 + (rel - 1.0) * 1.0                           # 深淺照原圖（磚縫、每塊磚的明暗）
chroma = lin / np.maximum(lum[..., None], 1e-4)         # 原本的色相（紅、灰）
red = s2l(TARGET) / (s2l(TARGET) @ np.array([0.2126, 0.7152, 0.0722]))
chroma = red + (chroma - chroma.reshape(-1, 3).mean(0)) * 0.5    # 色相拉到紅磚色，留一半的色差（有幾塊偏褐、偏橘）
out_lin = chroma * (rel * (s2l(TARGET) @ np.array([0.2126, 0.7152, 0.0722])))[..., None]
out = np.clip(l2s(out_lin), 0, 1)
# 平均再校正一次到 TARGET（sRGB 平均）
out = np.clip(out * (TARGET / out.reshape(-1, 3).mean(0)), 0, 1)
os.makedirs(OUT, exist_ok=True)
Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(OUT + 'brick_red_diff.webp', quality=88, method=6)
Image.open(T + 'brick_pavement_04_nor_gl_1k.jpg').convert('RGB').save(OUT + 'brick_red_nor.webp', quality=90, method=6)
m = np.asarray(Image.open(OUT + 'brick_red_diff.webp').convert('RGB'), np.float64).reshape(-1, 3).mean(0)
print('brick_red_diff 平均', [round(v) for v in m], '目標', [0xb7, 0x7a, 0x62], os.path.getsize(OUT + 'brick_red_diff.webp'), os.path.getsize(OUT + 'brick_red_nor.webp'))
