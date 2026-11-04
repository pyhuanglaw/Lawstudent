"""公館窗卡調色（GG-CARDS-1104，LAWWW2）：室內 GLB 的渲染 → textures/src/gg_cards/<key>.jpg
用法：python3 tools/blender/env_second/gg_cards_grade.py <渲染圖資料夾（*_<key>.png）> <參考圖裁切的 atlas 版本，例如 db7679c01>
1. 亮度／色偏往同一扇窗原本的參考圖裁切靠（Y 75%、色偏 60%）
2. BB 11-04 03:52：便利商店、青木正面、頁間兩張再壓暗、調暖（DARK）
3. 全部疊一層淡淡的玻璃反光（上緣一帶天空冷灰、一條斜的亮帶）；窗框不疊，GLB 本來就有 3D 窗框 """
import io, json, subprocess, glob, re, sys, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC, REV = sys.argv[1], sys.argv[2]
A = 'tools/blender/env_second/textures/gen/gg_fronts_atlas'
git = lambda p: subprocess.run(['git', '-C', ROOT, 'show', REV + ':' + p], capture_output=True, check=True).stdout
o = Image.open(io.BytesIO(git(A + '.jpg'))).convert('RGB'); oj = json.loads(git(A + '.json'))
DARK = {'ggcvs_side': (1.45, 1.10, 0.80), 'ggcvs_int': (1.45, 1.10, 0.80), 'ggtea_int': (1.35, 1.09, 0.82), 'ggbook_int': (1.30, 1.08, 0.84), 'ggbook_int2': (1.30, 1.08, 0.84)}   # 亮部壓縮的 gamma（白牆、白櫃不再一片白）、R、B（暖黃燈）
def crop(k):
    u0, v0, u1, v1, _ = oj[k]; W, H = o.size; return o.crop((int(u0 * W), int((1 - v1) * H), int(u1 * W), int((1 - v0) * H)))
s = open(os.path.join(HERE, 'xs_front_tex.py'), encoding='utf8').read()
for k, w, h in re.findall(r"'@textures/src/gg_cards/(\w+)\.jpg', '\w+', None, (\d+), (\d+)\)", s):
    src = Image.open(glob.glob(os.path.join(SRC, '*_%s.png' % k))[0]).convert('RGB')
    S = np.asarray(src.convert('YCbCr'), float); R = np.asarray(crop(k).convert('YCbCr'), float); out = S.copy()
    for c, st in ((0, 0.75), (1, 0.6), (2, 0.6)):
        ms, ss = S[..., c].mean(), S[..., c].std() + 1e-3; mr, sr = R[..., c].mean(), R[..., c].std()
        out[..., c] = S[..., c] * (1 - st) + ((S[..., c] - ms) * (sr / ss) + mr) * st
    rgb = np.asarray(Image.fromarray(np.clip(out, 0, 255).astype('uint8'), 'YCbCr').convert('RGB'), float)
    if k in DARK:
        gm, r, b = DARK[k]; rgb = 255 * (rgb / 255) ** gm; rgb[..., 0] *= r; rgb[..., 1] *= 1.02; rgb[..., 2] *= b
    Hh, Ww = rgb.shape[:2]; yy, xx = np.mgrid[0:Hh, 0:Ww]; v = yy / Hh; u = xx / Ww
    sky = np.clip(1 - v / 0.35, 0, 1) ** 1.6 * 0.16                      # 上緣：玻璃映著天空（冷灰）
    band = np.exp(-((u + v * 0.55 - 0.62) / 0.08) ** 2) * 0.10            # 斜的亮帶
    rgb = rgb * (1 - sky[..., None]) + np.array([200, 208, 214]) * sky[..., None]
    rgb = rgb + 255 * band[..., None]
    im = Image.fromarray(np.clip(rgb, 0, 255).astype('uint8'))
    W, H = (int(w) * 2, int(h) * 2) if int(w) <= 512 else (int(w), int(h))
    im.resize((W, H), Image.LANCZOS).save(os.path.join(HERE, 'textures/src/gg_cards/%s.jpg' % k), quality=88)
    print(k, 'Y %.0f → %.0f（參考 %.0f）' % (S[..., 0].mean(), np.asarray(im.convert('L'), float).mean(), R[..., 0].mean()))
