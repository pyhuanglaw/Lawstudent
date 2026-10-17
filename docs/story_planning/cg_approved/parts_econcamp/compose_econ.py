"""cg_econ_camp 合成：營地門口背景＋七個人（BB_132 第 71 組站位）。
用法：python3 compose_econ.py <去背 png 資料夾> <背景> <輸出> [zoom]
去背先用 ../parts_cg69/tools/cutout.py 做（econcamp_<名字>.png）。
"""
from PIL import Image, ImageFilter, ImageDraw
import numpy as np, sys
S, BG, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ZOOM = float(sys.argv[4]) if len(sys.argv) > 4 else 1.2
W, H = 1920, 1080
src = Image.open(BG).convert('RGBA')
# 背景放大裁切：學生群在原圖偏左（x 約 420～800），裁切中心往左，底部對齊
cw, ch = src.width / ZOOM, src.height / ZOOM
cx0 = min(max(700 - cw / 2, 0), src.width - cw)
bg = src.crop((int(cx0), int(src.height - ch), int(cx0 + cw), src.height)).resize((W, H), Image.LANCZOS)
bg = bg.filter(ImageFilter.UnsharpMask(radius=2, percent=40, threshold=2))
sc = W / cw                      # 原圖 1 px = 合成圖 sc px
def X(x): return (x - cx0) * sc  # 原圖 x → 合成圖 x
HOR = (430 - (src.height - ch)) * sc   # 地平線（原圖約 y=430：後面學生的眼睛高度）
CAM = 2.0                        # 鏡頭高度（公尺），拍大合照的人站高一點
# 人物：(檔名, 身高 cm, 原圖「站直時頭頂到腳底」的像素)；半蹲的人用頭的大小換算（7.55 頭身）
SRCH = {'tangrui': 1674, 'xun': 1708, 'jiahao': 1549 * 172 / 170, 'weilun': 1713,
        'pinyu': 325 * 7.55, 'kexin': 240 * 7.55, 'player': 247 * 7.55}
CM = {'tangrui': 177, 'xun': 180, 'jiahao': 170, 'weilun': 176, 'pinyu': 158, 'kexin': 164, 'player': 175}
K_BACK = float(sys.argv[5]) if len(sys.argv) > 5 else 300.0   # 後排：每公尺幾 px
K_FRONT = K_BACK * 1.09
GX = X(700) + 100                # 隊伍中心
back = [('tangrui', -285), ('xun', -95), ('jiahao', 78), ('weilun', 250)]
front = [('pinyu', -195), ('kexin', -8), ('player', 168)]
def warm(im):
    a = np.asarray(im).astype(np.float32)
    a[..., 0] *= 1.03; a[..., 1] *= 1.01; a[..., 2] *= 0.96
    a[..., :3] = np.clip(a[..., :3] * 1.01, 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')
def place(layer, name, cx, k):
    im = Image.open(f'{S}/econcamp_{name}.png').convert('RGBA')
    fy = HOR + CAM * k
    s = CM[name] / 100 * k / SRCH[name]
    im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
    im = warm(im)
    a = im.split()[3]
    # 太陽在鏡頭左後上方：影子往人的右後方（畫面右上）倒，大部分被人擋住
    sh_h = max(1, int(im.height * 0.22))
    sil = a.resize((im.width, sh_h))
    shear = 1.6
    sil = sil.transform((im.width + int(sh_h * shear) + 2, sh_h), Image.AFFINE, (1, shear, -sh_h * shear, 0, 1, 0), resample=Image.BILINEAR)
    sil = sil.filter(ImageFilter.GaussianBlur(4)).point(lambda v: int(v * 0.30))
    shl = Image.new('RGBA', sil.size, (35, 30, 40, 0)); shl.putalpha(sil)
    layer.alpha_composite(shl, (int(cx - im.width / 2), int(fy - sh_h + 2)))
    # 腳下接觸陰影
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    w = im.width * 0.42
    d.ellipse([cx - w * 0.6, fy - 7, cx + w * 0.7, fy + 8], fill=(35, 28, 30, 115))
    layer.alpha_composite(c.filter(ImageFilter.GaussianBlur(6)))
    layer.alpha_composite(im, (int(cx - im.width / 2), int(fy - im.height)))
out = bg.copy()
for n, dx in back: place(out, n, GX + dx * K_BACK / 300, K_BACK)
for n, dx in front: place(out, n, GX + dx * K_BACK / 300, K_FRONT)
out.convert('RGB').save(OUT, quality=92)
print('saved', OUT, 'horizon', round(HOR), 'back feet', round(HOR + CAM * K_BACK), 'front feet', round(HOR + CAM * K_FRONT))
