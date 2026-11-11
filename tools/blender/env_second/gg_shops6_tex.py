"""公館三間（安泰藥局 G04、汀州鮮果 G08、榮恩典文具社 G13）＋花序 Flower Notes（G11）外觀的貼圖：從使用者 2026-11-10 的參考圖拉正裁出來
（GG-SHOPS3-ART-1110、FLOWER-NOTES-ART-1110；圖：docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept/、docs/handoff/user_specs/flower_notes_ref/exterior.png）
→ textures/src/gg_cards/<key>.jpg；xs_front_tex.py 的 QG 用 '@textures/src/gg_cards/<key>.jpg' 收進 gg_fronts_atlas。
四個角＝左上、右上、右下、左下（參考圖 1672×941 的像素）。第 2 版（BB 11-10 23:51：招牌近看是糊的、櫥窗是一張糊掉的照片）：招牌裁成 2048 寬、櫥窗 1536 寬（原本 1024，進圖集以後再縮一半只剩約 500）。用法：python3 tools/blender/env_second/gg_shops6_tex.py [<六間參考圖資料夾> [<花序參考圖資料夾>]]"""
import os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC6 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept')
SRCF = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'docs/handoff/user_specs/flower_notes_ref')
OUT = os.path.join(HERE, 'textures', 'src', 'gg_cards')
k = 1672 / 1400   # 花序外觀的座標是在縮成 1400 寬的圖上量的
Q = {
    'ggantai_sign': (SRC6, 'shop_antai.webp', [(285, 98), (1440, 270), (1437, 418), (272, 298)], 2048, 300),
    'ggantai_int': (SRC6, 'shop_antai.webp', [(290, 404), (1238, 478), (1238, 792), (276, 836)], 1536, 600),
    'ggfruit_sign': (SRC6, 'shop_tingzhou_xianguo.webp', [(175, 5), (1113, 240), (1115, 358), (170, 195)], 2048, 380),
    'ggfruit_shop': (SRC6, 'shop_tingzhou_xianguo.webp', [(112, 292), (1235, 386), (1235, 760), (105, 940)], 1536, 630),
    'ggrong_sign': (SRC6, 'shop_rongendian.webp', [(288, 15), (1090, 228), (1090, 318), (283, 215)], 2048, 380),
    'ggrong_int': (SRC6, 'shop_rongendian.webp', [(190, 250), (1340, 385), (1340, 640), (185, 850)], 1536, 570),
    'ggfn_sign': (SRCF, 'exterior.png', [(372 * k, 270 * k), (1288 * k, 300 * k), (1288 * k, 380 * k), (372 * k, 362 * k)], 2048, 200),
    'ggfn_up': (SRCF, 'exterior.png', [(378 * k, 62 * k), (1258 * k, 125 * k), (1258 * k, 298 * k), (378 * k, 262 * k)], 1536, 330),
    'ggfn_winl': (SRCF, 'exterior.png', [(375 * k, 378 * k), (652 * k, 385 * k), (652 * k, 612 * k), (375 * k, 612 * k)], 672, 570),
    'ggfn_door': (SRCF, 'exterior.png', [(718 * k, 395 * k), (978 * k, 400 * k), (978 * k, 640 * k), (718 * k, 640 * k)], 672, 630),
    'ggfn_winr': (SRCF, 'exterior.png', [(1038 * k, 395 * k), (1258 * k, 400 * k), (1258 * k, 585 * k), (1038 * k, 585 * k)], 576, 480),
}


def coeffs(dst, src):
    A = []; Bv = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(Bv, float))


def main():
    os.makedirs(OUT, exist_ok=True)
    for key, (d, n, quad, w, h) in Q.items():
        im = Image.open(os.path.join(d, n)).convert('RGB').transform((w, h), Image.PERSPECTIVE, coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad), Image.BICUBIC)
        im.save(os.path.join(OUT, key + '.jpg'), quality=92)
    print('saved', len(Q))


if __name__ == '__main__':
    main()
