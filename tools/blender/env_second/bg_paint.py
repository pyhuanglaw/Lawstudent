"""2D 背景的「繪畫感」後製（LAWWW2-C 2026-10-17，ART-BG-AA185）：Blender 算圖 → 和遊戲裡已經通過的手繪風底圖（assets/bg/*.webp，1672×941）放在一起不突兀。
不是濾鏡特效：只做手繪背景共有的幾件事——
  1. Kuwahara（各向異性前的簡化版：四個象限取變異數最小的平均）：把 CG 的細雜訊、貼圖重複變成一塊一塊的筆觸，邊緣留著；
  2. 色調：暗部往藍紫、亮部往暖（手繪背景的冷暖對比）、整體飽和度略升；
  3. 光暈：亮的地方（燈、窗）往外溢一點；
  4. 邊緣暗角很淡。
用法：python3 tools/blender/env_second/bg_paint.py <輸入.png> <輸出.webp> [--r 4] [--warm 0.06] [--cool 0.05] [--sat 1.08] [--bloom 0.22] [--size 1672x941]
或 import bg_paint; bg_paint.paint(PIL.Image, ...) → PIL.Image"""
import sys
import numpy as np
from PIL import Image, ImageFilter


def _box(a, r):
    """每個像素周圍 (2r+1)² 的和（積分圖）；邊界用最近的像素補"""
    p = np.pad(a, ((r + 1, r), (r + 1, r)) + ((0, 0),) * (a.ndim - 2), mode='edge')
    c = p.cumsum(0).cumsum(1)
    return c[2 * r + 1:, 2 * r + 1:] - c[:-2 * r - 1, 2 * r + 1:] - c[2 * r + 1:, :-2 * r - 1] + c[:-2 * r - 1, :-2 * r - 1]


def kuwahara(rgb, r=4, q=6.0):
    """平滑版 Kuwahara：四個象限（半徑 h＝r/2 的方塊，中心在 (±h, ±h)）的平均顏色，用 1/(1+K·變異數)^q 加權（變異數小＝平坦的那一側權重大）。
    第二版（2026-10-17）：第一版每個像素硬選一個象限，招牌字、磁磚縫被切成一格一格的方塊"""
    H, W = rgb.shape[:2]; lum = rgb @ np.array([0.299, 0.587, 0.114]); h = max(1, r // 2); n = float((2 * h + 1) ** 2)
    sl = _box(lum, h) / n; sl2 = _box(lum * lum, h) / n; sc = _box(rgb, h) / n
    var = np.maximum(sl2 - sl * sl, 0.0); K = 1.0 / max(1e-6, float(np.median(var)) * 4 + 1e-4)
    acc = np.zeros_like(rgb); wsum = np.zeros((H, W))
    for dy in (-h, h):
        for dx in (-h, h):
            ys = np.clip(np.arange(H) + dy, 0, H - 1); xs = np.clip(np.arange(W) + dx, 0, W - 1)
            w = 1.0 / (1.0 + K * var[ys][:, xs]) ** q
            acc += sc[ys][:, xs] * w[..., None]; wsum += w
    return acc / wsum[..., None]


def paint(im, r=4, warm=0.06, cool=0.05, sat=1.08, bloom=0.22, vign=0.10, size=None, mix=0.65):
    a0 = np.asarray(im.convert('RGB'), np.float64) / 255.0
    a = a0 * (1 - mix) + kuwahara(a0, r) * mix                  # 筆觸和原圖混合：字、細的線條留著
    lum = a @ np.array([0.299, 0.587, 0.114])
    # 冷暖：暗部 (−, −, +)、亮部 (+, 0, −)
    sh = np.clip(1 - lum / 0.45, 0, 1)[..., None]; hi = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None]
    a = a + sh * np.array([-0.4, -0.2, 1.0]) * cool * 0.5 + hi * np.array([1.0, 0.35, -0.6]) * warm * 0.5
    g = (a @ np.array([0.299, 0.587, 0.114]))[..., None]; a = g + (a - g) * sat
    # 光暈
    if bloom > 0:
        br = np.clip((lum - 0.72) / 0.28, 0, 1)[..., None] * a
        bi = Image.fromarray((np.clip(br, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=max(4, a.shape[1] // 90)))
        a = a + bloom * np.asarray(bi, np.float64) / 255.0
    # 暗角
    H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]; d = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2))
    a = a * (1 - vign * np.clip(d - 0.55, 0, 1) ** 1.5)[..., None]
    out = Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))
    if size: out = out.resize(size, Image.LANCZOS)
    return out


if __name__ == '__main__':
    A = sys.argv[1:]
    def opt(k, d): return A[A.index(k) + 1] if k in A else d
    sz = tuple(map(int, opt('--size', '1672x941').split('x')))
    out = paint(Image.open(A[0]), r=int(opt('--r', 4)), warm=float(opt('--warm', 0.06)), cool=float(opt('--cool', 0.05)), sat=float(opt('--sat', 1.08)),
                bloom=float(opt('--bloom', 0.22)), size=sz)
    out.save(A[1], quality=90); print('wrote', A[1], out.size)
