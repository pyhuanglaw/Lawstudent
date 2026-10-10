"""日式宿舍用的貼圖：本作程式產生（固定亂數種子，可重現），不是外部素材。
輸出（lib2.pbr 認得的資料夾與檔名：textures/<id>/<id>_diff_1k.jpg…，內容 512 px）：
  textures/jp_kawara/jp_kawara_{diff,nor_gl,rough}_1k.jpg  日本黑瓦（棧瓦）：4 片寬 × 4 排（一張貼圖＝1.2 m × 1.08 m），
      圖的上方＝往屋脊、下方＝往屋簷；每排瓦的下緣疊在下一排上（高度差＋陰影），橫向是一凹一凸的波浪。法線是 OpenGL（綠＝上）。
  textures/jp_shoji/jp_shoji_diff_1k.jpg  紙拉門（障子）：米白紙＋細木格，窗玻璃後面看得到；晚上遊戲讓它發光（房間亮燈）。
用法：python3 tools/blender/env_second/gen_jp_textures.py"""
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'textures')


def save(img, pid, kind):
    d = os.path.join(TEX, pid); os.makedirs(d, exist_ok=True); img.convert('RGB').save(os.path.join(d, f'{pid}_{kind}_1k.jpg'), quality=92)
N, TILES, COURSES = 512, 4, 4


def kawara():
    rng = np.random.default_rng(31)
    y, x = np.mgrid[0:N, 0:N].astype(np.float32)
    tw, ch = N / TILES, N / COURSES
    u = (x % tw) / tw                     # 一片瓦裡的橫向位置 0–1
    v = (y % ch) / ch                     # 一排裡的縱向位置：0＝上緣（被上一排蓋住）、1＝下緣（疊在下一排上）
    col = (x // tw).astype(int); row = (y // ch).astype(int)
    wave = np.cos(2 * np.pi * (u - 0.4))  # 凸（1）凹（−1）：棧瓦的接縫在凹的那一邊
    h = 0.18 + 0.55 * v + 0.32 * wave * (0.55 + 0.45 * v)        # 往下緣慢慢抬高、波浪越往下越明顯
    edge = np.clip((v - 0.93) / 0.07, 0, 1); h = h * (1 - 0.35 * edge)   # 下緣圓角
    # 法線（OpenGL：x 右、y 上）
    s = 6.0
    dx = np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1); dy_down = np.roll(h, -1, axis=0) - np.roll(h, 1, axis=0)
    nx, ny, nz = -dx * s, dy_down * s, np.ones_like(h)        # 圖的列往下增加：往上的斜率＝−dy_down
    ln = np.sqrt(nx * nx + ny * ny + nz * nz); nor = np.stack([nx / ln, ny / ln, nz / ln], -1) * 0.5 + 0.5
    # 顏色：深灰黑瓦，每片明暗不同、凸的地方略亮、被上一排壓住的地方（v 小）有陰影、低頻的髒污
    tile_var = rng.uniform(0.86, 1.12, size=(COURSES, TILES))[row, col]
    shade = 0.6 + 0.36 * (wave * 0.5 + 0.5) + 0.12 * v          # 遠看也要看得出波浪：凸的地方亮、凹的地方暗
    shade *= np.where(v < 0.16, 0.5 + 0.5 * (v / 0.16), 1.0)          # 上一排瓦壓住的陰影
    low = np.array(Image.fromarray((rng.random((16, 16)) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC), np.float32) / 255
    fine = rng.random((N, N)).astype(np.float32)
    base = np.array([60, 62, 66], np.float32)
    c = base[None, None, :] * (tile_var * shade * (0.88 + 0.22 * low) * (0.94 + 0.08 * fine))[..., None]
    c[..., 2] *= 1.02
    diff = np.clip(c, 0, 255).astype(np.uint8)
    rough = np.clip((0.5 + 0.18 * low - 0.1 * (wave * 0.5 + 0.5) + 0.06 * fine) * 255, 0, 255).astype(np.uint8)
    save(Image.fromarray(diff).filter(ImageFilter.GaussianBlur(0.6)), 'jp_kawara', 'diff')
    save(Image.fromarray((nor * 255).astype(np.uint8)), 'jp_kawara', 'nor_gl')
    save(Image.fromarray(rough), 'jp_kawara', 'rough')


def shoji():
    rng = np.random.default_rng(7); n = 256
    paper = np.array([239, 232, 212], np.float32) * (0.95 + 0.05 * rng.random((n, n, 1)).astype(np.float32))
    img = paper.copy(); wood = np.array([92, 66, 44], np.float32)
    for k in range(0, n + 1, n // 4):          # 直格 4 格
        img[:, max(0, k - 2):k + 2] = wood
    for k in range(0, n + 1, n // 6):          # 橫格 6 格
        img[max(0, k - 2):k + 2, :] = wood
    img[:6, :] = wood; img[-6:, :] = wood; img[:, :6] = wood; img[:, -6:] = wood
    save(Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)), 'jp_shoji', 'diff')


if __name__ == '__main__':
    kawara(); shoji(); print('ok', sorted(os.listdir(os.path.join(TEX, 'jp_kawara'))), sorted(os.listdir(os.path.join(TEX, 'jp_shoji'))))
