"""新生南路七家店的店面貼圖：直接從使用者給的參考圖（企劃線 docs/story_planning/ref_images/shops/*_ext.webp）裁出來、校正透視（LAWWW2 11-04，SCENE_RULES 第 12 節：參考圖就是規格）。
用法：python3 tools/blender/env_second/xs_front_tex.py <參考圖資料夾>   → tools/blender/env_second/textures/gen/xs_<店>_<部位>.jpg
每一塊是參考圖上的一個四邊形（左上、右上、右下、左下，參考圖 1672×941 的像素），校正成正面的長方形：
  sign＝招牌（貼在 3D 招牌板上）、int＝一樓玻璃後面看到的店內（景深卡，放在玻璃後 1.3 m，兩側牆、地板、天花是 3D）、
  up＝二樓的窗後面（同弦的吉他、新生運動廣場的球衣、山嵐的二樓書區、大口漢堡的二樓座位）、v＝直立招牌、其他是門口的小東西。
店名、招牌都是虛構的（D77）；這些貼圖只在遊戲裡用，來源寫在 LICENSES.md（使用者提供的參考圖）。"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

REF = sys.argv[1] if len(sys.argv) > 1 else 'docs/story_planning/ref_images/shops'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'textures', 'gen')
# (參考圖, 部位, 四個角, 輸出寬, 輸出高)
Q = [
    ('dabu_ext', 'sign', [(547, 207), (1600, 13), (1600, 187), (547, 344)], 1024, 192),
    ('dabu_ext', 'int', [(583, 349), (1553, 253), (1553, 800), (583, 693)], 1024, 384),
    ('haopai_ext', 'sign', [(583, 167), (1453, 13), (1453, 133), (583, 287)], 1024, 160),
    ('haopai_ext', 'int', [(587, 300), (1480, 173), (1480, 880), (587, 800)], 768, 512),
    ('shanlan_ext', 'sign', [(637, 317), (1000, 340), (1000, 440), (637, 407)], 512, 128),
    ('shanlan_ext', 'int', [(260, 400), (1147, 415), (1147, 705), (260, 735)], 1024, 384),
    ('shanlan_ext', 'up', [(160, 53), (1267, 227), (1267, 393), (160, 253)], 1024, 256),
    ('tongxian_ext', 'sign', [(527, 133), (891, 40), (891, 160), (527, 260)], 512, 160),
    ('tongxian_ext', 'up', [(891, 53), (1187, 13), (1187, 240), (891, 287)], 512, 384),
    ('tongxian_ext', 'int', [(504, 513), (953, 467), (953, 853), (504, 793)], 512, 448),
    ('tongxian_ext', 'plaque', [(1191, 440), (1249, 440), (1249, 620), (1191, 620)], 96, 288),
    ('tongxian_ext', 'guitar', [(1087, 407), (1187, 407), (1187, 653), (1087, 653)], 128, 320),
    ('xinsheng_sports_ext', 'sign', [(247, 304), (1264, 429), (1264, 513), (247, 440)], 1024, 128),
    ('xinsheng_sports_ext', 'v', [(1287, 51), (1376, 47), (1376, 416), (1287, 420)], 128, 512),
    ('xinsheng_sports_ext', 'int', [(220, 460), (1207, 520), (1207, 767), (220, 793)], 1024, 320),
    ('xinsheng_sports_ext', 'up', [(340, 60), (1224, 220), (1224, 393), (340, 287)], 1024, 256),
    ('dakou_ext', 'sign', [(653, 380), (1507, 353), (1507, 460), (653, 480)], 1024, 128),
    ('dakou_ext', 'int', [(687, 473), (1593, 467), (1593, 700), (687, 693)], 1024, 288),
    ('dakou_ext', 'up', [(811, 180), (1480, 153), (1480, 357), (811, 360)], 1024, 320),
    ('dakou_ext', 'v', [(1507, 93), (1640, 113), (1640, 473), (1507, 467)], 192, 512),
    ('nanyang_ext', 'fascia', [(587, 27), (1213, 27), (1213, 267), (587, 267)], 768, 288),
    ('nanyang_ext', 'sign', [(843, 273), (1180, 271), (1180, 387), (843, 389)], 512, 176),
    ('nanyang_ext', 'front', [(407, 393), (1380, 373), (1380, 800), (407, 800)], 1024, 448),
    ('nanyang_ext', 'poster', [(1393, 307), (1640, 307), (1640, 773), (1393, 773)], 288, 544),
]
# 溫州街（wz_fronts_atlas）：日常失速（W2 一樓，參考圖 ref_images/wz_cafes/daily_offbeat_ref_v2.webp，企劃線）
QW = [
    ('offbeat_ref_v2', 'sign', [(600, 18), (1340, 0), (1340, 112), (600, 140)], 1024, 160),
    # 店裡、側窗裡：不裁參考圖，直接用 AA 的室內 GLB（aa_support/daily_offbeat.glb）從街上的位置渲染（render_interior.py，鏡頭正對玻璃、畫面寬＝玻璃寬）：
    # 從外面看到的店內＝走進去看到的店內（參考圖畫的店內和 AA 做的室內配置不一樣，以走得進去的那一個為準）
    ('@textures/src/offbeat_int_render.jpg', 'int', None, 1024, 300),    # 正面：眼睛 (0.35,1.55,11)、看 (0.35,1.55,0)、22.3 mm、藏 WALL_front；畫面＝本地 x −4.55～5.25、y 0.11～2.99
    ('@textures/src/offbeat_side_render.jpg', 'side', None, 704, 512),
    ('@textures/src/sunnyside_side_render.jpg', 'side', None, 640, 256),   # SUNNY SIDE 東側落地窗後面（BB 11-04 06:43）：AA 的 sunnyside.glb（企劃線 8345fe067，右牆開窗那一版）從東邊渲染，眼睛 (11.5,1.65,1.1)、看 (0,1.65,1.1)、59 mm、藏 WALL_right；裁右邊 2/3＝室內 z 2.2～−2.4   # 側面：眼睛 (11.5,1.6,−1.75)、看 (0,1.6,−1.75)、52.7 mm、藏 WALL_right；畫面＝室內 z 0.3～−3.8（側窗）
    # 溫州街第一批五間（WZ-FIVE-1104，使用者 11-04 04:4x，AA_654）：參考圖 ref_images/shops/wz_<店>_ext.webp（企劃線 41169746b）；店內的窗卡等室內 MODEL_READY 再用室內 GLB 拍
    ('wz_lin_ext', 'sign', [(797, 262), (1398, 323), (1398, 425), (797, 387)], 1024, 176),          # 林家乾麵：深綠底金字招牌
    ('wz_lin_ext', 'menu', [(1365, 535), (1452, 538), (1452, 668), (1365, 667)], 128, 200),          # 門邊的價目牌（乾麵 55…滷味 30）
    ('wz_sunnyside_ext', 'sign', [(835, 285), (1545, 330), (1545, 410), (835, 375)], 1600, 176),    # SUNNY SIDE：米白飾帶上的深綠字
    ('wz_sunnyside_ext', 'board', [(1100, 625), (1203, 628), (1203, 795), (1100, 795)], 160, 256),   # 門口黑板立牌（Brunch）
    ('wz_komichi_ext', 'sign', [(905, 250), (1428, 235), (1428, 342), (905, 378)], 1024, 208),      # 小路：深色木招牌
    ('wz_komichi_ext', 'noren', [(985, 400), (1258, 400), (1258, 537), (985, 540)], 512, 256),      # 門口的暖簾（小路）
    ('wz_komichi_ext', 'door', [(1030, 540), (1228, 540), (1228, 815), (1030, 808)], 256, 352),     # 木格拉門
    ('wz_komichi_ext', 'menu', [(1250, 600), (1395, 598), (1395, 840), (1250, 842)], 192, 320),     # 本日のおすすめ黑板
    ('wz_ade_ext', 'sign', [(670, 236), (1558, 325), (1558, 397), (670, 365)], 1600, 156),          # 阿德影印輸出：白底藍字＋藍線
    ('@textures/src/wz_cards/wzade_price.jpg', 'price', None, 160, 192),                         # 價目表：參考圖寫「黑白 NT$1／頁」，AA 11-04 定 2 元（AA_655 §5，和室內一致）→ 那一格改成 NT$2（原圖裁切同上一版座標）
    ('wz_ade_ext', 'cork', [(1323, 483), (1420, 487), (1420, 633), (1323, 632)], 160, 240),         # 軟木公告板
    ('wz_ade_ext', 'decal', [(685, 465), (815, 465), (815, 612), (685, 612)], 160, 176),            # 玻璃上的服務項目貼紙
    ('wz_230am_ext', 'sign', [(700, 255), (1545, 345), (1545, 440), (700, 397)], 1600, 160),        # 2:30 AM：深綠飾帶
    ('wz_230am_ext', 'door', [(1005, 415), (1140, 425), (1140, 770), (1005, 775)], 192, 448),       # 木門（玻璃格）
    ('@textures/src/wz_cards/wz230am_board.jpg', 'board', None, 192, 216),
    # 溫州街第二批五間（WZ-SECOND-1104，使用者 11-04 05:4x）：參考圖 docs/art-rebuild/second_ai/wip/wz_second_1104/ref/<店>_ext.webp（複製到 REF 時加 wz2_ 前綴）
    ('wz2_dida_tea_ext', 'menu', [(243, 403), (466, 412), (462, 662), (240, 660)], 224, 256),        # 帝大紅茶：牆上的價目牌
    ('wz2_dida_tea_ext', 'aboard', [(988, 622), (1092, 625), (1098, 800), (984, 800)], 160, 256),    # 帝大紅茶：門口的立牌
    ('wz2_summer_ice_ext', 'menu', [(712, 422), (813, 427), (815, 632), (712, 630)], 160, 320),      # 夏日冰菓室：刨冰價目牌
    ('wz2_summer_ice_ext', 'flag', [(975, 432), (1040, 434), (1040, 523), (975, 520)], 128, 176),    # 夏日冰菓室：「冰」旗
    ('wz2_wenzhou_books_ext', 'chalk', [(1033, 672), (1141, 668), (1150, 840), (1040, 843)], 160, 256),   # 溫州書屋：營業時間黑板立牌                       # 營業時間立牌：參考圖寫 21:00–02:30，使用者 11-04 定 11:00～02:30（AA_654 §6），時間那一行重寫
    ('wz2_azhong_fruit_ext', 'pine', [(566, 592), (616, 592), (616, 642), (566, 642)], 96, 96),      # 阿忠鮮果：手寫價錢牌（鳳梨、香蕉、西瓜）
    ('wz2_azhong_fruit_ext', 'banana', [(686, 592), (732, 592), (732, 642), (686, 642)], 96, 104),
    ('wz2_azhong_fruit_ext', 'melon', [(1356, 650), (1414, 650), (1414, 714), (1356, 714)], 96, 104),
]

# 公館四間新店（gg_fronts_atlas；使用者 11-04 01:0x，AA_647）：青木茶室（tea）、頁間書屋（book）、日和便利店（cvs）、慢輪單車（bike）。
# 參考圖 ref_images/shops/gongguan_<店>_ext.webp（企劃線）；遊戲的店面比參考圖寬，多出來的那一段用同一間店的室內參考圖（_int.webp）做第二扇窗
QG = [
    ('gongguan_tea_ext', 'sign', [(305, 118), (1580, 76), (1580, 194), (305, 226)], 1024, 136),
    ('gongguan_tea_ext', 'eave', [(253, 287), (1633, 149), (1633, 222), (253, 325)], 1024, 64),
    ('@textures/src/gg_cards/ggtea_int.jpg', 'int', None, 768, 408),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_tea_ext 的 int
    ('gongguan_tea_ext', 'door', [(1013, 280), (1233, 276), (1233, 807), (1013, 810)], 256, 512),
    ('@textures/src/gg_cards/ggtea_take.jpg', 'take', None, 384, 368),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_tea_ext 的 take
    ('gongguan_tea_ext', 'plaque', [(1271, 397), (1313, 397), (1313, 540), (1271, 540)], 64, 224),
    ('gongguan_tea_ext', 'board', [(797, 567), (980, 567), (980, 840), (797, 840)], 192, 288),
    ('gongguan_book_ext', 'sign', [(420, 149), (1335, 147), (1335, 296), (420, 299)], 1024, 168),
    ('@textures/src/gg_cards/ggbook_int.jpg', 'int', None, 1024, 512),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_book_ext 的 int
    ('gongguan_book_ext', 'door', [(460, 353), (600, 350), (600, 733), (460, 735)], 192, 512),
    ('gongguan_book_ext', 'side', [(612, 353), (663, 353), (663, 733), (612, 733)], 64, 512),
    ('gongguan_book_ext', 'stone', [(767, 640), (1353, 640), (1353, 780), (767, 780)], 512, 128),
    ('gongguan_book_ext', 'board', [(617, 543), (767, 543), (767, 787), (617, 787)], 192, 320),
    ('gongguan_book_ext', 'pic', [(340, 424), (413, 424), (413, 493), (340, 493)], 96, 96),
    ('gongguan_book_ext', 'cart', [(296, 557), (429, 557), (429, 763), (296, 763)], 160, 256),
    ('@textures/src/gg_cards/ggbook_int2.jpg', 'int2', None, 1024, 512),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_book_int 的 int2
    ('gongguan_cvs_ext', 'sign', [(691, 145), (1377, 204), (1377, 307), (691, 263)], 768, 168),   # 11-04：照片有透視（右端低 60 px），原本的長方形切掉了招牌下緣
    ('@textures/src/gg_cards/ggcvs_int.jpg', 'int', None, 1024, 640),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_cvs_ext 的 int
    ('@textures/src/gg_cards/ggcvs_side.jpg', 'side', None, 1024, 704),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_cvs_ext 的 side
    ('gongguan_cvs_ext', 'locker', [(1251, 453), (1373, 453), (1373, 731), (1251, 731)], 128, 288),
    ('gongguan_cvs_ext', 'bins', [(1320, 593), (1493, 593), (1493, 736), (1320, 736)], 256, 208),
    ('gongguan_cvs_ext', 'vend', [(1433, 420), (1640, 420), (1640, 720), (1433, 720)], 224, 320),
    ('gongguan_bike_ext', 'sign', [(596, 138), (1404, 127), (1404, 278), (596, 288)], 1024, 200),
    ('@textures/src/gg_cards/ggbike_int.jpg', 'int', None, 1024, 456),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_bike_ext 的 int
    ('gongguan_bike_ext', 'shop', [(1133, 320), (1340, 320), (1340, 787), (1133, 787)], 256, 576),
    ('gongguan_bike_ext', 'board', [(907, 584), (1060, 584), (1060, 820), (907, 820)], 192, 288),
    ('gongguan_bike_ext', 'plaque', [(1429, 400), (1491, 400), (1491, 500), (1429, 500)], 96, 160),
    ('@textures/src/gg_cards/ggbike_int2.jpg', 'int2', None, 1024, 784),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_bike_int 的 int2
    # 公館第二批（AA_650，使用者 11-04 02:0x）：洋洋鹹酥雞（yangyang）、Afar café（afar）、轉角唱片（corner）、Daybreak（daybreak）
    ('gongguan_yangyang_ext', 'sign', [(460, 109), (1269, 213), (1267, 349), (460, 287)], 1024, 192),
    ('gongguan_yangyang_ext', 'kitchen', [(331, 355), (807, 345), (807, 727), (331, 727)], 768, 576),
    ('gongguan_yangyang_ext', 'door', [(887, 371), (1087, 371), (1087, 767), (887, 767)], 256, 512),
    ('gongguan_yangyang_int', 'win', [(560, 250), (1150, 250), (1150, 920), (560, 920)], 384, 448),
    ('gongguan_yangyang_ext', 'board', [(807, 549), (960, 549), (960, 813), (807, 813)], 192, 320),
    ('gongguan_yangyang_ext', 'bins', [(1233, 607), (1387, 607), (1387, 760), (1233, 760)], 192, 192),
    ('gongguan_afar_ext', 'sign', [(440, 240), (1360, 240), (1360, 330), (440, 330)], 1600, 156),   # 11-04 02:1x 使用者換新版參考圖：深綠飾帶上的小寫「afar」（舊版是真實店名，作廢）
    ('@textures/src/gg_cards/ggafar_win.jpg', 'win', None, 1024, 552),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_afar_int 的 win
    ('@textures/src/gg_cards/ggafar_int.jpg', 'int', None, 384, 368),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_afar_ext 的 int
    ('gongguan_afar_ext', 'door', [(1073, 349), (1220, 349), (1220, 727), (1073, 727)], 256, 640),
    ('gongguan_afar_ext', 'menu', [(1256, 407), (1353, 407), (1353, 557), (1256, 557)], 128, 192),
    ('gongguan_afar_ext', 'shelf', [(864, 557), (1053, 557), (1053, 731), (864, 731)], 256, 224),
    ('gongguan_corner_ext', 'sign', [(457, 215), (1420, 215), (1420, 333), (457, 333)], 1600, 196),
    ('@textures/src/gg_cards/ggcorner_int.jpg', 'int', None, 640, 520),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_corner_ext 的 int
    ('@textures/src/gg_cards/ggcorner_win.jpg', 'win', None, 512, 800),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_corner_int 的 win
    ('gongguan_corner_ext', 'door', [(1053, 400), (1247, 400), (1247, 853), (1053, 853)], 256, 592),
    ('gongguan_corner_ext', 'notice', [(1300, 447), (1403, 447), (1403, 587), (1300, 587)], 128, 176),
    ('gongguan_corner_ext', 'crate', [(1251, 633), (1407, 633), (1407, 760), (1251, 760)], 192, 160),
    ('gongguan_daybreak_ext', 'sign', [(680, 233), (1173, 233), (1173, 304), (680, 304)], 768, 112),
    ('@textures/src/gg_cards/ggdb_int.jpg', 'int', None, 1024, 376),   # 11-04 窗卡：室內 GLB 從街上看進去的渲染（取代參考圖裁切）；原本 gongguan_daybreak_ext 的 int
    ('gongguan_daybreak_ext', 'tile', [(660, 620), (1053, 620), (1053, 700), (660, 700)], 512, 104),   # 左邊的黑板立牌不要裁進來
    ('gongguan_daybreak_ext', 'door', [(1073, 393), (1207, 393), (1207, 700), (1073, 700)], 192, 448),
    ('gongguan_daybreak_ext', 'menu', [(1273, 440), (1360, 440), (1360, 576), (1273, 576)], 128, 192),
    ('gongguan_daybreak_ext', 'board', [(536, 576), (647, 576), (647, 740), (536, 740)], 128, 192),
]


def coeffs(dst, src):
    """PIL PERSPECTIVE 的 8 個係數：輸出（dst 長方形）→ 輸入（src 四邊形）"""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


os.makedirs(OUT, exist_ok=True)


def build(QQ, atlas_name, alias=lambda n: n):
  cache = {}
  for name, part, quad, w, h in QQ:
      if name.startswith('@'):   # 本作的渲染圖（tools/blender/env_second/ 底下的相對路徑），整張縮到 w×h
          o = Image.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), name[1:])).convert('RGB').resize((w, h), Image.LANCZOS)
          key = f'{alias(name)}_{part}'; cache[key] = o; print(key, o.size); continue
      if name not in cache: cache[name] = Image.open(os.path.join(REF, name + '.webp')).convert('RGB')
      im = cache[name]
      c = coeffs([(0, 0), (w, 0), (w, h), (0, h)], quad)
      o = im.transform((w, h), Image.PERSPECTIVE, c, Image.BICUBIC).filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
      key = f'{alias(name)}_{part}'
      if key == 'ggtea_int':   # 青木茶室：窗前的 A 字立牌（店門外的東西，3D 另外做）不要留在店內的景深卡上：用它左邊那一段鏡射蓋掉
          bx0 = int((797 - 367) / 640 * w); by0 = int((567 - 309) / 351 * h); bw = w - bx0
          o.paste(o.crop((bx0 - bw, by0, bx0, h)).transpose(Image.FLIP_LEFT_RIGHT), (bx0, by0))
      if key == 'xsports_up':   # 球衣上的校名（參考圖寫了真實的大學名字，D77 要虛構）：只把字那一條糊掉，號碼留著
          band = o.crop((0, 62, w, 112)).filter(ImageFilter.GaussianBlur(5)); o.paste(band, (0, 62))
      cache[key] = o; print(key, o.size)

  # ---- 拼成一張圖集（整條街一個材質）：一列一列往下排，寬 2048；xs_fronts_atlas.jpg＋.json（uv：u0, v0, u1, v1，v 從下往上）
  import json
  keys = [k for k in cache if k not in {n for n, *_ in QQ}]   # 參考圖原圖不放進圖集
  items = sorted(keys, key=lambda k: -cache[k].size[1]); AW = 2048; pos = {}; x = y = rowh = 0
  for k in items:
      w_, h_ = cache[k].size
      if x + w_ > AW: x = 0; y += rowh + 4; rowh = 0
      pos[k] = (x, y); x += w_ + 4; rowh = max(rowh, h_)
  AH = y + rowh; atlas = Image.new('RGB', (AW, AH), (128, 128, 128))
  for k, (x_, y_) in pos.items(): atlas.paste(cache[k], (x_, y_))
  atlas = atlas.resize((AW // 2, AH // 2), Image.LANCZOS)   # 手機：2048×3856 的圖集在 GPU 上 31 MB，縮一半（招牌從人行道看還是清楚）
  atlas.save(os.path.join(OUT, atlas_name + '.jpg'), quality=88)
  uv = {k: [x_ / AW, 1 - (y_ + cache[k].size[1]) / AH, (x_ + cache[k].size[0]) / AW, 1 - y_ / AH, cache[k].size[0] / cache[k].size[1]] for k, (x_, y_) in pos.items()}
  json.dump(uv, open(os.path.join(OUT, atlas_name + '.json'), 'w'), indent=1)
  print('atlas', AW, AH, len(uv))


build(Q, 'xs_fronts_atlas', lambda n: n.replace('_ext', '').replace('xinsheng_sports', 'xsports'))
build(QW, 'wz_fronts_atlas', lambda n: os.path.basename(n).split('_')[0] if n.startswith('@') else n.replace('_ref_v2', '').replace('_ext', ''))   # key：offbeat_int、wz_lin_sign、wz230am_board…
build(QG, 'gg_fronts_atlas', lambda n: os.path.basename(n).split('_')[0] if n.startswith('@') else n.replace('gongguan_', 'gg').replace('_ext', '').replace('_int', '').replace('yangyang', 'yy').replace('daybreak', 'db'))   # key：ggtea_sign、ggbook_int2…
