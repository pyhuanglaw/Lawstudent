"""溫州街公寓用的貼圖：本作程式產生（固定亂數種子，可重現），不是外部素材。
輸出 textures/gen/wz_stain.png：窗台下的雨痕（RGBA：深灰褐色，透明度＝從窗台往下流的水漬條紋，越往下越淡）。
用法：python3 tools/blender/env_second/gen_street_textures.py"""
import os
import numpy as np
from PIL import Image, ImageFilter
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'textures', 'gen')


def stain(w=256, h=256, seed=5):
    rng = np.random.default_rng(seed); a = np.zeros((h, w), np.float32)
    y = np.arange(h, dtype=np.float32)[:, None] / h            # 0＝上緣（窗台下）、1＝下緣
    for _ in range(26):                                          # 一條條往下流的水漬
        cx = rng.uniform(0.04, 0.96) * w; sw = rng.uniform(2.0, 9.0); ln = rng.uniform(0.25, 1.0); st = rng.uniform(0.15, 0.45)
        xs = np.arange(w, dtype=np.float32)[None, :]
        wob = np.sin(y * rng.uniform(6, 14) + rng.uniform(0, 6)) * rng.uniform(0.5, 2.5)
        prof = np.exp(-((xs - cx - wob) ** 2) / (2 * sw * sw)) * np.clip(1 - y / ln, 0, 1) ** 1.3
        a += prof * st
    a += 0.22 * np.clip(1 - y / 0.18, 0, 1)                       # 窗台正下方一條比較深的水線
    noise = np.array(Image.fromarray((rng.random((32, 32)) * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
    a = np.clip(a * (0.6 + 0.5 * noise), 0, 0.55)
    rgb = np.zeros((h, w, 3), np.uint8); rgb[..., 0], rgb[..., 1], rgb[..., 2] = 58, 54, 48
    img = Image.fromarray(np.dstack([rgb, (a * 255).astype(np.uint8)]), 'RGBA').filter(ImageFilter.GaussianBlur(0.8))
    os.makedirs(OUT, exist_ok=True); img.save(os.path.join(OUT, 'wz_stain.png'))


if __name__ == '__main__':
    stain(); print('ok')
