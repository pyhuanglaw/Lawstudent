"""汀州路五間店的店面貼圖集（TINGZHOU-AREA-1110／TINGZHOU-SHOPS5-1110，X322；LAWWW2 帳號 A 11-10）。
來源：使用者 11-10 19:2x 自己生成的五張店面概念圖（docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/shop_*.webp）。參考圖就是規格（ROLE_LAWWW2 SCENE_RULES §12）：
招牌、玻璃後面看到的店內、門、照片菜單從概念圖裁出來拉正（做法同新生南路、公館的 xs_front_tex.py）；牆、框、玻璃、雨棚、燈、盆栽是 3D（wz_shopkit.gg_front）。
招牌字就是使用者指定的正式店名（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）。
輸出：textures/gen/tz_fronts_atlas.jpg、tz_fronts_atlas.json（key → [u0, v0, u1, v1, 寬高比]；wz_shopkit.py 的 XS_ATLAS 讀）。
用法：/opt/blenv/bin/python tools/blender/env_second/tz_fronts_tex.py"""
import json, os
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC = os.environ.get('TZ_CONCEPT') or os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/tingzhou_1110/concept'); GEN = os.path.join(HERE, 'textures', 'gen')
SRC2 = os.environ.get('TZ_CONCEPT2') or os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept')
SRC3 = os.environ.get('TZ_CONCEPT3') or os.path.join(ROOT, 'docs/art-rebuild/second_ai/ref/night_market_1110/concept')
# key：(概念圖, 四角 左上／右上／右下／左下（像素）, 輸出寬, 高)
Q = {'tzlian_sign': ('shop_tingzhou_liantong', [(468, 224), (1344, 221), (1344, 378), (466, 383)], 1024, 184),
     'tzlian_vsign': ('shop_tingzhou_liantong', [(372, 24), (440, 28), (436, 366), (368, 362)], 112, 520),
     'tzlian_int': ('shop_tingzhou_liantong', [(600, 402), (1298, 402), (1298, 748), (600, 748)], 768, 380),
     'tzyue_sign': ('shop_yuehaochi', [(528, 256), (1298, 170), (1306, 350), (531, 392)], 1024, 200),
     'tzyue_vsign': ('shop_yuehaochi', [(412, 60), (488, 82), (486, 362), (410, 345)], 112, 440),
     'tzyue_int': ('shop_yuehaochi', [(672, 398), (1162, 402), (1166, 792), (680, 778)], 512, 400),
     'tzyue_menu': ('shop_yuehaochi', [(1180, 430), (1300, 426), (1302, 696), (1184, 693)], 128, 288),
     'tzwen_sign': ('shop_wentebaodi', [(566, 170), (1292, 256), (1278, 352), (570, 306)], 1024, 176),
     'tzwen_int': ('shop_wentebaodi', [(552, 345), (1216, 352), (1214, 722), (556, 722)], 640, 360),   # 第 2 版（沒有騎樓）：櫥窗＋木門一整面
     'tzkeju_sign': ('shop_kejuyunnan', [(460, 258), (1325, 205), (1328, 348), (462, 378)], 1024, 168),
     'tzkeju_vsign': ('shop_kejuyunnan', [(330, 25), (430, 45), (425, 350), (326, 335)], 144, 440),
     'tzkeju_int': ('shop_kejuyunnan', [(572, 446), (1186, 440), (1186, 772), (576, 766)], 640, 344),
     'tzkeju_menu': ('shop_kejuyunnan', [(1205, 470), (1305, 470), (1305, 722), (1205, 722)], 112, 284),
     'tzdong_sign': ('shop_dongnan_dalian', [(385, 235), (1430, 172), (1433, 322), (388, 362)], 1024, 138),
     'tzdong_shop': ('shop_dongnan_dalian', [(482, 432), (1340, 416), (1340, 792), (492, 802)], 896, 392),
     # 第 2 版：三間有規格的店（使用者 11-10 21:1x「六家店外觀參考圖」，docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept/）
     'tzyin_sign': ('shop_yindehao', [(160, 45), (1342, 345), (1340, 430), (165, 285)], 1024, 150),
     'tzyin_winl': ('shop_yindehao', [(90, 315), (632, 357), (632, 828), (68, 878)], 512, 440),
     'tzyin_door': ('shop_yindehao', [(650, 362), (1000, 400), (1000, 790), (650, 840)], 384, 440),
     'tzyin_winr': ('shop_yindehao', [(1005, 400), (1305, 432), (1305, 712), (1005, 780)], 384, 400),
     'tztai_sign': ('shop_taimi', [(215, 42), (1455, 160), (1455, 385), (205, 265)], 1024, 200),
     'tztai_winl': ('shop_taimi', [(222, 300), (830, 345), (830, 668), (222, 690)], 640, 360),
     'tztai_menu': ('shop_taimi', [(218, 700), (828, 682), (828, 795), (218, 835)], 640, 130),
     'tztai_door': ('shop_taimi', [(843, 350), (1045, 362), (1045, 790), (843, 790)], 256, 440),
     'tztai_winr': ('shop_taimi', [(1062, 372), (1420, 395), (1420, 640), (1062, 650)], 448, 300),
     'tzxile_sign': ('shop_xile', [(262, 148), (1178, 290), (1178, 392), (262, 308)], 1024, 130),
     'tzxile_int': ('shop_xile', [(200, 325), (1195, 405), (1195, 695), (200, 800)], 1024, 400),
     # 禮貌生財（X332；使用者 11-11 的外觀圖 docs/art-rebuild/second_ai/ref/night_market_1110/concept/shop_limao_shengcai_exterior.webp）：招牌（深紅棕木板、古銅金書法字）、從門看進去的命理館、窗後面的書櫃
     'limao_sign': ('shop_limao_shengcai_exterior', [(554, 136), (1232, 184), (1226, 323), (557, 292)], 1536, 360),   # 第 2 版（BB：近看字邊偏糊）：1024→1536（原圖上這塊招牌只有約 680 像素寬，再大也不會更清楚）
     'limao_door': ('shop_limao_shengcai_exterior', [(760, 343), (1028, 343), (1028, 669), (760, 669)], 448, 546),
     'limao_win': ('shop_limao_shengcai_exterior', [(769, 354), (1023, 354), (1023, 624), (769, 624)], 448, 476)}


def coeffs(dst, src):
    A = []; Bv = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); Bv += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(Bv, float))


def main():
    W = 2048; H = 4096; atlas = Image.new('RGB', (W, H), (30, 30, 30)); info = {}; x = y = 0; rowh = 0; P = 4
    for k in sorted(Q, key=lambda k: (-Q[k][3], k)):
        n, quad, w, h = Q[k]; im = Image.open(next(os.path.join(d, n + '.webp') for d in (SRC, SRC2, SRC3) if os.path.exists(os.path.join(d, n + '.webp')))).convert('RGB').transform((w, h), Image.PERSPECTIVE, coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad), Image.BICUBIC)
        if x + w > W: x = 0; y += rowh + P; rowh = 0
        atlas.paste(im, (x, y)); info[k] = [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H, round(w / h, 4)]
        x += w + P; rowh = max(rowh, h)
    assert y + rowh <= H, (y, rowh)
    os.makedirs(GEN, exist_ok=True); atlas.save(os.path.join(GEN, 'tz_fronts_atlas.jpg'), quality=90)
    json.dump(info, open(os.path.join(GEN, 'tz_fronts_atlas.json'), 'w'), indent=1); print('saved', len(info), 'used height', y + rowh)


if __name__ == '__main__':
    main()
