"""shop_views_layers.py 的去背：numpy 版和純 PIL 版（使用者電腦沒有 numpy 時用）結果要一樣。
CC-C 11-14：WINVIEW_GG3_1939 在電腦上跑，import numpy 失敗、三間都沒拍。
做法：畫一張「黑底、白底」各一張的假近景（不透明方塊、半透明圓、細線），兩個版本都去背，比 alpha 和顏色。
沒有 numpy 的環境只檢查 PIL 版跑得完、不透明的地方顏色對。用法：python3 tests/shop_views_matte_unit.py"""
import os, sys, random
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src = open(os.path.join(ROOT, 'tools/shots/shop_views_layers.py'), encoding='utf-8').read()
src = src[:src.index("\nREM = ")]                      # 只拿函式，不跑拍照
g = {'__file__': os.path.join(ROOT, 'tools/shots/shop_views_layers.py')}; sys_argv = sys.argv; sys.argv = ['x']
exec(compile(src, 'shop_views_layers.py', 'exec'), g); sys.argv = sys_argv
fails = []
def check(ok, msg): print(('PASS ' if ok else 'FAIL ') + msg); (None if ok else fails.append(msg))

W, H = 256, 128
def scene(bg):
    im = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(im)
    d.rectangle([20, 30, 80, 110], fill=(180, 60, 40))                          # 不透明的柱子
    # 半透明（50%）的圓：顏色 (40,120,200) 混背景
    for y in range(H):
        for x in range(W):
            if (x - 170) ** 2 + (y - 64) ** 2 < 30 ** 2:
                p = im.getpixel((x, y)); im.putpixel((x, y), tuple(int(0.5 * c + 0.5 * q) for c, q in zip((40, 120, 200), p)))
    d.line([100, 10, 140, 120], fill=(250, 250, 240), width=2)
    return im
b, w = scene((0, 0, 0)), scene((255, 255, 255))
pil, cov_p = g['_matte_pil'](b, w, (0.25, 0.06))
px = pil.getpixel((50, 70)); check(px[3] == 255 and abs(px[0] - 180) <= 1 and abs(px[1] - 60) <= 1, 'PIL 版：不透明的柱子 alpha 255、顏色對 %s' % (px,))
px = pil.getpixel((170, 64)); check(abs(px[3] - 128) <= 2 and abs(px[2] - 200) <= 3, 'PIL 版：半透明的圓 alpha≈128、顏色≈(40,120,200) %s' % (px,))
px = pil.getpixel((230, 120)); check(px[3] == 0 and sum(px[:3]) > 0, 'PIL 版：透明的地方填了旁邊的顏色（不是黑邊）%s' % (px,))
check(pil.getpixel((50, 31))[3] < 255, 'PIL 版：上緣淡出有作用')
if g.get('np') is not None:
    np = g['np']
    ref, cov_n = g['matte'](b, w, (0.25, 0.06))
    A = np.asarray(ref).astype(int); B = np.asarray(pil).astype(int)
    da = np.abs(A[..., 3] - B[..., 3]).max(); check(da <= 2, 'alpha 和 numpy 版最多差 %d 階' % da)
    m = A[..., 3] > 8; dc = np.abs(A[..., :3] - B[..., :3])[m].max(); check(dc <= 3, '看得到的地方顏色和 numpy 版最多差 %d 階' % dc)
    dh = np.abs(A[..., :3] - B[..., :3])[~m]; check(dh.max() <= 3, "透明處填的顏色（遊戲取樣時邊緣會混到）和 numpy 版最多差 %d 階" % dh.max())
    check(abs(cov_p - cov_n) < 0.005, 'cover 一樣（%.4f vs %.4f）' % (cov_p, cov_n))
else:
    print('INFO 這個環境沒有 numpy：只檢查 PIL 版')
print('ALL PASS' if not fails else 'FAILED %d' % len(fails)); sys.exit(1 if fails else 0)
