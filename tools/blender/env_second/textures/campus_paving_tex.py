"""ART-LIB-FRONT-PAVING-1103：校園人行道石磚、椰影大道柏油的遊戲貼圖。

輸入（Poly Haven CC0，已在 repo）：
  tools/blender/env_second/textures/asphalt_02/asphalt_02_diff_1k.jpg
  tools/blender/env_second/textures/granite_tile/granite_tile_{diff,nor_gl}_1k.jpg
輸出（遊戲 src/zones3d.js 的 photoTex() 讀）：
  assets/textures/campus/asphalt_light_diff.webp   512×512，D30 淺灰（平均約 #acacaa），無縫
  assets/textures/campus/paving_light_diff.webp    1024×1024，淺米色石磚（照舊遊戲 #e3d9c6 一帶），接縫重畫（第二版）
  assets/textures/campus/paving_light_nor.webp     石磚法線（原圖＋接縫凹槽）

柏油的做法：
  1. 取原圖 384×384 沒有裂縫的那一塊（x 200～584、y 300～684）；
  2. 和位移半格的自己混合，讓貼圖無縫；
  3. 減掉大範圍模糊（環繞），只留細顆粒＝拿掉「污漬」般的大塊明暗；
  4. 上色成 D30 淺灰。
用法（repo 根目錄）：python3 tools/blender/env_second/textures/campus_paving_tex.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter, ImageStat

T = 'tools/blender/env_second/textures/'
OUT = 'assets/textures/campus/'


def wrap_blur(x, r):
    big = np.tile(x, (3, 3))
    im = Image.fromarray(np.clip(big, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    h, w = x.shape
    return np.asarray(im).astype(np.float32)[h:2 * h, w:2 * w]


def tint(im, target, contrast):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    lum = a.mean(2, keepdims=True)
    g = (lum - lum.mean()) * contrast          # 保留明暗起伏、去掉原本的色偏
    return Image.fromarray(np.clip(np.array(target, np.float32) + g, 0, 255).astype(np.uint8))


def asphalt():
    a = np.asarray(Image.open(T + 'asphalt_02/asphalt_02_diff_1k.jpg').convert('L')).astype(np.float32)
    c = a[300:684, 200:584]
    n = c.shape[0]
    sh = np.roll(np.roll(c, n // 2, 0), n // 2, 1)
    y, x = np.mgrid[0:n, 0:n]
    d = np.minimum(np.minimum(x, n - 1 - x), np.minimum(y, n - 1 - y)) / (n / 2)
    w = np.clip(d * 2.2, 0, 1)
    s = c * w + sh * (1 - w)
    g = (s - wrap_blur(s, 30)) * 0.8
    out = np.clip(np.stack([172 + g, 172 + g, 170 + g], 2), 0, 255).astype(np.uint8)
    im = Image.fromarray(out).resize((512, 512), Image.LANCZOS)
    im.save(OUT + 'asphalt_light_diff.webp', quality=90)
    return im


def paving():
    """第二版（BB 11-03 15:02：5～10 m 外看不出一塊一塊）：原圖 5×5 塊（一塊 204.8 px、遊戲裡 0.6 m），
    接縫自己畫在原圖接縫的位置——寬＝磚長的 3%、顏色比磚面深 32%；每一塊明度 ±5%（固定亂數，貼圖照樣無縫）；
    法線＝原圖法線＋接縫的凹槽。BB 的範圍：接縫深 25～35%、寬 2～3%、磚和磚之間 ±4～6%、不要大塊污漬"""
    p = Image.open(T + 'granite_tile/granite_tile_diff_1k.jpg')
    N, K = 1024, 5; P = N / K
    base = np.asarray(tint(p, (222, 213, 196), 0.75)).astype(np.float32)
    y, x = np.mgrid[0:N, 0:N].astype(np.float32) + 0.5
    d = np.minimum(np.abs(((x + P / 2) % P) - P / 2), np.abs(((y + P / 2) % P) - P / 2))   # 到最近一條接縫的距離（px）
    HW = P * 0.03 / 2
    joint = np.clip((HW + 1.0 - d) / 2.0, 0, 1)                                              # 邊緣 2 px 柔化
    var = np.random.RandomState(1103).uniform(-0.05, 0.05, (K, K))
    tm = 1 + var[(y // P).astype(int) % K, (x // P).astype(int) % K]
    col = base * tm[..., None]
    jc = base.reshape(-1, 3).mean(0) * 0.68
    out = col * (1 - joint[..., None]) + jc * joint[..., None]
    im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)); im.save(OUT + 'paving_light_diff.webp', quality=88)
    # 法線（OpenGL：綠＝往上）：凹槽高度 h＝−joint；n＝(−dh/du, −dh/dv, 1)，影像的列往下＝v 往下
    n0 = np.asarray(Image.open(T + 'granite_tile/granite_tile_nor_gl_1k.jpg').convert('RGB')).astype(np.float32) / 127.5 - 1
    h = -joint
    dhx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) / 2; dhy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) / 2
    S = 1.2
    nn = n0 + np.stack([-dhx * S, dhy * S, np.zeros_like(h)], 2)
    nn /= np.linalg.norm(nn, axis=2, keepdims=True)
    Image.fromarray(np.clip((nn + 1) * 127.5, 0, 255).astype(np.uint8)).save(OUT + 'paving_light_nor.webp', quality=90)
    return im


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, im in (('asphalt_light_diff', asphalt()), ('paving_light_diff', paving())):
        print(name, im.size, [round(v) for v in ImageStat.Stat(im).mean])
