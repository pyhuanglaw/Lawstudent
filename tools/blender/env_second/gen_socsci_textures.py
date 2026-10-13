"""社科院大樓的清水混凝土貼圖：Poly Haven concrete_wall_006（CC0）改出來——調成淺灰、壓低斑駁，加上模板的分割線與螺栓孔（固定亂數種子，可重現）。
一張貼圖＝1.8 m × 1.8 m：兩排 1.8 × 0.9 m 的模板（第二排錯開 0.9 m），每片 6 個螺栓孔（3 × 2）。
輸出（lib2.pbr 認得的資料夾與檔名）：textures/socsci_formwork/socsci_formwork_{diff,nor_gl,rough}_1k.jpg（1024 px）。
用法：python3 tools/blender/env_second/gen_socsci_textures.py"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'textures', 'concrete_wall_006')
OUT = os.path.join(HERE, 'textures', 'socsci_formwork')
N = 1024
M = 1.8                     # 一張貼圖幾公尺
PX = N / M                  # 每公尺幾像素
TARGET = np.array([0.70, 0.69, 0.665])   # 平均顏色（sRGB 0–1）：淺灰、微暖


def load(kind):
    return np.asarray(Image.open(os.path.join(SRC, f'concrete_wall_006_{kind}_1k.jpg')).convert('RGB').resize((N, N), Image.LANCZOS), dtype=np.float32) / 255.0


def main():
    os.makedirs(OUT, exist_ok=True)
    diff, nor, rough = load('diff'), load('nor_gl'), load('rough')
    # 顏色：去掉原圖的螺栓孔（原圖的洞位置和我們的模板不一樣）——用模糊版填掉特別暗的點
    lum = diff.mean(axis=2)
    blur = np.asarray(Image.fromarray((diff * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), dtype=np.float32) / 255.0
    dark = np.clip((blur.mean(axis=2) - lum - 0.06) / 0.08, 0, 1)[..., None]
    diff = diff * (1 - dark) + blur * dark
    g = diff.mean(axis=2, keepdims=True)
    diff = g + (diff - g) * 0.35                      # 降低彩度
    diff = (diff - diff.mean(axis=(0, 1))) * 0.55     # 壓低斑駁
    diff = np.clip(diff + TARGET, 0, 1)
    # 高度：模板接縫（凹 2 mm、寬約 4 mm）＋螺栓孔（直徑約 3 cm 的錐形凹洞）
    y, x = np.mgrid[0:N, 0:N].astype(np.float32)
    xm, ym = x / PX, y / PX                           # 公尺
    row = (ym // 0.9).astype(int)
    xs = (xm + (row % 2) * 0.9) % 1.8                 # 第二排錯開半片
    yp = ym % 0.9
    h = np.zeros((N, N), np.float32)
    jw = 0.004
    h -= np.clip(1 - np.minimum(np.minimum(xs, 1.8 - xs), 9) / jw, 0, 1)
    h -= np.clip(1 - np.minimum(yp, 0.9 - yp) / jw, 0, 1)
    rng = np.random.default_rng(2013)
    for ry_ in range(2):
        for hx in (0.3, 0.9, 1.5):
            for hy in (0.225, 0.675):
                for k in (-1, 0, 1):   # 錯開的那一排：洞的位置也跟著模板錯開（含跨邊界的那一個）
                    cx = (hx - (ry_ % 2) * 0.9 + k * 1.8) * PX + rng.normal(0, 0.6)
                    cy = (ry_ * 0.9 + hy) * PX + rng.normal(0, 0.6)
                    r = 0.016 * PX
                    d = np.hypot(x - cx, y - cy)
                    h -= np.clip(1 - d / r, 0, 1) ** 0.7
    h = np.clip(h, -1, 0)
    # 顏色：接縫比較暗（水泥漿）、螺栓孔中間很暗＋一圈淺色（封孔砂漿）
    hole = np.clip(-h, 0, 1)
    ring = np.clip(1 - np.abs(-h - 0.08) / 0.08, 0, 1) * (hole < 0.3)
    diff = diff * (1 - 0.55 * hole[..., None]) + 0.06 * ring[..., None]
    diff = np.clip(diff, 0, 1)
    # 法線：原圖的細節（減弱）＋高度圖算出來的接縫與洞
    gy, gx = np.gradient(np.asarray(Image.fromarray(((h + 1) * 127.5).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32) / 255.0)
    n0 = nor * 2 - 1; n0[..., :2] *= 0.5
    nx = n0[..., 0] - gx * 6.0; ny = n0[..., 1] + gy * 6.0; nz = np.maximum(n0[..., 2], 0.2)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz); nn = np.stack([nx / ln, ny / ln, nz / ln], axis=2)
    rough = np.clip(rough * 0.6 + 0.35 + 0.15 * hole[..., None], 0, 1)
    Image.fromarray((diff * 255).astype(np.uint8)).save(os.path.join(OUT, 'socsci_formwork_diff_1k.jpg'), quality=92)
    Image.fromarray(((nn * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(OUT, 'socsci_formwork_nor_gl_1k.jpg'), quality=92)
    Image.fromarray((rough * 255).astype(np.uint8)).save(os.path.join(OUT, 'socsci_formwork_rough_1k.jpg'), quality=92)
    print('ok', OUT, 'mean color', diff.reshape(-1, 3).mean(axis=0).round(3).tolist())


if __name__ == '__main__':
    main()
