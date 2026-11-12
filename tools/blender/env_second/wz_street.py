"""溫州街主巷兩側的台北老公寓（近景）→ 一個 GLB（溫州街區域的世界座標，同材質合併）。第二 AI 工作階段（環境美術）製作：
  /opt/blenv/bin/python tools/blender/env_second/wz_street.py [-- --out assets/models/env/second_ai/wenzhou_street.glb]

取代 src/zones3d.js buildWenzhou 裡 aptA／aptB 的 12 棟、以及 Café 南北兩側兩棟的 TK.apartment 外觀（位置、寬深、樓層、
牆面種類、顏色、一樓種類照遊戲）。導航阻擋、鏡頭碰撞、店家的「看櫥窗」互動點都在遊戲程式裡，不變。
遠景（detail:false）的公寓不換。

台北老公寓（ART_DIRECTION 第 5 節）：長條磁磚／小方塊馬賽克／水泥漆外牆、樓板線、鋁窗＋窗簾、外凸鐵窗（真的鐵條）、
浪板雨遮、冷氣室外機與排水管、陽台；一樓：店面（木或鋁框玻璃、窗內景深卡、橫招牌、直立招牌、帆布雨遮）、
住家（紅／綠鐵門、信箱、門燈、小窗）、鐵捲門、騎樓（柱子、天花板日光燈）；頂樓：女兒牆、不鏽鋼水塔、頂樓加蓋。

中文字不放在 GLB：招牌板面 SIGN_FACE_<棟>、直立招牌 VSIGN_FACE_<棟>、店內景深卡 INTERIOR_FACE_<棟> 是空白板面
（自訂屬性帶店名、顏色、店種），遊戲用 TK.signTex／TK.interiorTex 畫（和原本的套件同一套字型與設計）。
"""
import math, os, re, sys, random
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lib2 as L   # noqa: E402
import cafe_layout as CL   # noqa: E402
from lib2 import B, Mesh, g2b, bpy, bmesh, Vector, Matrix   # noqa: E402
from cafe_layout import bush, pot, card, rand_uv, proto, combine, uv01   # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default
SET = arg('--set', 'wenzhou')   # wenzhou＝溫州街（預設）；gongguan＝公館羅斯福路南側的騎樓店面；lane118＝和平東路二段 118 巷（⑭；同一套公寓、材質與窗戶原型）；nccu_food＝政大山下的小吃街（只給 2D 背景算圖：bg_nccu.py）
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/' + {'gongguan': 'gongguan_shops.glb', 'lane118': 'lane118_street.glb', 'nccu_food': 'bg_nccu_food_street.glb', 'xinsheng': 'xinsheng_street.glb', 'xinsheng_far': 'xinsheng_far.glb', 'tingzhou': 'tingzhou_street.glb'}.get(SET, 'wenzhou_street.glb')))

# ---------------- 遊戲裡的配置（照 zones3d.js buildWenzhou；改那邊要一起改這裡） ----------------
SHOP = lambda **k: k
SPECS = [
    # A 側（z>0，立面朝 −z）：aptA(x0,x1,spec) → 位置 ((x0+x1)/2, 5)、rotation.y=π、深 12
    dict(id='A1', side='A', x0=-12, x1=-4, floors=4, wall='tile_sq', color='#efd6b0', p_grille=1.0, p_pot=1.0, pots_n=4, pot_mix=True, p_laundry=0.7, ground='shop', shop=SHOP(type='print', name='阿德影印輸出', frame='#c3c7ca', sub='影印・膠裝・大圖輸出', signBg='#f4f1ea', signColor='#1f4e8c', band='#1f4e8c', vertical='影印', vBg='#ffffff', vColor='#1f4e8c', vBand='#1f4e8c')),
    dict(id='A2', side='A', x0=-4, x1=3.1, floors=5, wall='mosaic', color='#cfd8d0', ground='door', door='#9c2f2a'),
    dict(id='A3', side='A', x0=8.4, x1=20, floors=4, wall='tile', color='#c9b49a', balcony=True, ground='shop', shop=SHOP(type='books', name='溫州書屋', sub='二手書・人文社會・法律', signBg='#2f4a3a', signColor='#f4ead8', serif=True, awning='#2f4a3a', vertical='書', vBg='#f4ead8', vColor='#2f4a3a', vBand='#2f4a3a')),
    dict(id='A4', side='A', x0=32, x1=40, floors=4, wall='tile', color='#e9e6df', ground='shop', shop=SHOP(type='noodle', name='林家乾麵', sub='乾麵・餛飩・滷味', signBg='#2f5a47', signColor='#e9d9a8', awning='#2f5a47', atlas='wz_lin_h')),
    dict(id='A5', side='A', x0=40, x1=48, floors=3, wall='tile', color='#b8a088', roofAdd=True, ground='shop', shop=SHOP(type='cvs', name='日和便利店', sub='24H', signBg='#f4efe2', signColor='#4b4a2c', band='#8a9a4a', frame='#cfd6d6')),   # 11-04 日日便利 → 日和便利店（AA_647 §6，和公館 G03 同一家連鎖：米白燈箱、橄欖綠字和色帶、橘色太陽）
    # B 側（z<0，立面朝 +z）：aptB → 位置 ((x0+x1)/2, −5)、rotation.y=0
    dict(id='B1', side='B', x0=-30, x1=-21, floors=3, wall='plaster', color='#d8d0c0', roofAdd=True, ground='shutter'),
    dict(id='B2', side='B', x0=-21, x1=-15, floors=4, wall='tile', color='#bfb3a3', ground='shop', shop=SHOP(type='laundry', name='常在洗衣', sub='24 小時營業', signBg='#e9f2f6', signColor='#2a5f8a', frame='#cfd6d6')),
    dict(id='B3', side='B', x0=-9.6, x1=4, floors=5, wall='tile', color='#bba98f', ground='shop', shop=SHOP(type='teishoku', name='小路', sub='居酒屋', signBg='#2e2219', signColor='#f4ead8', serif=True, awning='#3a2a1f', atlas='wz_komichi_h')),
    dict(id='B4', side='B', x0=4, x1=16, floors=4, wall='mosaic', color='#d8d2c6', ground='door', door='#2f4a3a'),
    dict(id='B5', side='B', x0=16, x1=30, floors=4, wall='tile', color='#cbbba3', ground='arcade', shop=SHOP(type='tea', name='帝大紅茶', sub='手搖飲・現煮珍珠', signBg='#f4ead8', signColor='#5c3a21', band='#7a9a5a')),
    dict(id='B6', side='B', x0=30, x1=40, floors=5, wall='plaster', color='#e6dccb', ground='shop', shop=SHOP(type='fruit', name='阿忠鮮果', sub='當季水果・果汁', signBg='#f2b33e', signColor='#5c2a1a')),
    dict(id='B7', side='B', x0=40, x1=48, floors=4, wall='tile', color='#d6cfc1', ground='shop', shop=SHOP(type='brunch', name='SUNNY SIDE', sub='Brunch', signBg='#f1ead8', signColor='#3f5a3c', frame='#3f5a3c', atlas='wz_sunnyside_h')),   # ART-WZ2：原本是住家，改成早午餐店（AA_164）
    # Café 南北兩側（立面朝西，rotation.y=−π/2）
    dict(id='C1', pos=(55.4, -12.4), ry=-math.pi / 2, w=10, d=12, floors=5, wall='tile', color='#cbbba6', ground='shutter'),
    dict(id='C2', pos=(55.4, 11.2), ry=-math.pi / 2, w=7, d=12, floors=4, wall='mosaic', color='#d3cbbd', balcony=True, ground='door', door='#2f4a3a'),
    # 巷底（西端）的住家公寓（套件 endB；近景，原本沒換）
    dict(id='W0', pos=(-37.2, -1.0), ry=math.pi / 2, w=14, d=13, floors=4, wall='tile', color='#cdbfa8', balcony=True, ground='door', door='#5c3a21'),
    # 遠景（套件 detail:false）：far＝細節少一點（鐵窗少、沒有曬衣服與盆栽、冷氣少），材質與窗戶原型和近景共用 → draw call 不增加
    dict(id='F1', pos=(5.75, 21.0), ry=math.pi, w=12, d=10, floors=5, wall='tile', color='#c7b9a3', ground='door', far=True),
    dict(id='F2', pos=(-12.25, -20.0), ry=0.0, w=12, d=10, floors=4, wall='mosaic', color='#d6d0c2', ground='shutter', far=True),
    dict(id='F3', pos=(-33.4, 16.2), ry=math.pi, w=9, d=10, floors=4, wall='tile', color='#cfc4b2', ground='door', far=True),
    # F4（−33.4, −16.2，遠景，「新生大樓」）拿掉：西側橫巷的北口打開，接新生南路（ART-XINSHENG-GATE-1103，LAWWW 11-03 20:24 同意西端；W0 巷底公寓照留）
    # dict(id='F4', pos=(-33.4, -16.2), ry=0.0, w=9, d=10, floors=5, wall='tile', color='#d9cdb8', ground='door', far=True),
    # Café 往南的路（+z，施工護欄外，走不到）
    dict(id='S1', pos=(47.9, 23.0), ry=math.pi / 2, w=11, d=10, floors=5, wall='tile', color='#cdbfa9', ground='door', far=True),
    dict(id='S2', pos=(54.7, 22.5), ry=-math.pi / 2, w=10, d=10, floors=4, wall='tile', color='#d6cab6', ground='door', far=True),
    dict(id='S3', pos=(47.9, 37.0), ry=math.pi / 2, w=14, d=10, floors=6, wall='tile', color='#c3b6a0', ground='door', far=True),
    dict(id='S4', pos=(54.7, 36.0), ry=-math.pi / 2, w=14, d=10, floors=5, wall='tile', color='#cfc3ae', ground='door', far=True),
    # Café 往北的路（−z）
    dict(id='N1', pos=(47.9, -24.0), ry=math.pi / 2, w=12, d=10, floors=5, wall='tile', color='#c9bba5', ground='door', far=True),
    dict(id='N2', pos=(54.7, -24.0), ry=-math.pi / 2, w=12, d=10, floors=6, wall='tile', color='#d4c8b4', ground='door', far=True),
    dict(id='N3', pos=(47.9, -38.0), ry=math.pi / 2, w=14, d=10, floors=4, wall='tile', color='#bfb29c', ground='door', far=True),
    dict(id='N4', pos=(54.7, -38.0), ry=-math.pi / 2, w=14, d=10, floors=7, wall='tile', color='#cdc2ae', ground='door', far=True),
    # 西端巷口兩側
    dict(id='W1', pos=(-37.2, 11.0), ry=math.pi / 2, w=10, d=12, floors=4, wall='tile', color='#d4c6b0', ground='door', far=True),
    # W2＝日常失速（WZ-OFFBEAT-1104，AA_617、AA_618；參考圖 ref_images/wz_cafes/daily_offbeat_ref_v2.webp）：轉角一樓的店，正面朝西側橫巷（+x）、北面也開窗（室內 aa_support/daily_offbeat.glb，11×10 m）。
    # 本地 x＝室內 x（溫州街 z＝−13.5−x）；本地 z＝室內 z−5（店門在室內 (−3.9, 5)＝溫州街 (−37.2, −9.6)）。原本 z −13、寬 10，往北挪 0.5、加寬到 11（和 W0 之間不留縫）
    dict(id='W2', pos=(-37.2, -13.5), ry=math.pi / 2, w=11, d=12, floors=4, wall='tile', color='#cbbfae', ground='shop', far=False, p_ac=0.4,
         shop=dict(type='cafe', name='日常失速', sub='DAILY OFFBEAT')),
    # 小公園北側（ART-WZ1）：兩棟公寓（導航格外面 z>30，走不到），正面對著公園
    dict(id='P1', pos=(18.0, 30.9), ry=math.pi, w=12.2, d=10, floors=5, wall='tile', color='#cbbfac', ground='door', door='#4a4f52', far=True, p_grille=0.6),
    dict(id='P2', pos=(30.6, 30.9), ry=math.pi, w=12.6, d=10, floors=4, wall='mosaic', color='#d5cfc2', ground='door', door='#6a3a2a', far=True, p_grille=0.55),
]
GH, FH = 3.4, 3.1          # TK.apartment 的預設一樓高、樓高
# 日常失速的店面（wz_shopkit.xs_front 的非騎樓模式；貼圖在 wz_fronts_atlas：招牌是參考圖裁的，店裡、側窗裡是 AA 室內 GLB 從街上渲染的）
OFFBEAT_XS = dict(arcade=False, dep=0.3, glass=(-4.55, 5.25), glass_h=3.1, int='offbeat_int', frame='#1f1f1d', pane=1.1, transom=2.65,
                  door=(-4.5, -3.3, 2.3), piers=[(-3.3, -3.0)], panes=[(-3.0, 5.25)],
                  awning=dict(x0=-4.75, x1=5.45, y0=3.36, y1=3.0, d=1.0, color='#3f6a4a'),
                  panel=dict(x0=-5.3, x1=5.3, y0=3.4, y1=4.2, color='#efe4cc', text=[('offbeat_sign', -2.0, 2.66, 3.48, 4.21)]),
                  lamps=[(-4.6, 3.55), (-3.1, 3.55)],
                  side=dict(z0=-8.8, z1=-4.7, glass_h=3.1, dep=0.3, int='offbeat_side', awning=dict(y0=3.36, y1=3.0, d=0.9, color='#3f6a4a')),
                  clutter=[('aboard', -5.0, 0.42), ('bistro', 4.5, 0.42)], lit=True,
                  int3d=os.path.exists(os.path.join(L.ROOT, 'assets/models/env/second_ai/offbeat_storefront.glb')) and '--no-int3d' not in ARGS)   # SHOP-WINDOW-2D-1105：有立體店內就不畫景深卡

# ---------------- 公館（--set gongguan）：照 zones3d.js gongguan 區塊的 shops（位置、寬度、樓層、牆、顏色、招牌、柱子），改那邊要一起改這裡 ----------------
if SET == 'gongguan':
    GH = 4.2                # 公館的騎樓店面一樓高 4.2 m（groundH）
    _SHOPS = [dict(n='阿鳳麵店', c='#c9463d', w=10, type='noodle', it='noodle', sub='乾麵・餛飩湯・小菜', v='阿鳳麵店', atlas='gg_afeng_h', vatlas='gg_afeng_v'), dict(n='青木茶室', c='#2f7d5b', w=8, type='tea', it='tea', sub='茶室・外帶'),
              dict(n='頁間書屋', c='#3b5a8c', w=12, type='book', it='books', sub='書店・咖啡'), dict(n='日和便利店', c='#3a6fb0', w=10, type='cvs', it='cvs', band='#e0a030'),
              dict(n='安泰藥局', c='#f5f5f2', sc='#1f5a3a', w=8, type='none', it='cvs'), dict(n='洋洋鹹酥雞', c='#e0b24a', sc='#3b2a1e', w=8, type='none', it='luwei'),
              dict(n='慢輪單車', c='#b5532c', w=9, type='bike', it='bike', sub='維修・保養・二手單車'), dict(n='Afar café', c='#3e4c42', w=9, type='none', it='cafe'),
              dict(n='汀州鮮果', c='#e8a33a', sc='#3b2a1e', w=8, type='none', it='fruit'), dict(n='自助洗衣', c='#4a90c2', w=9, type='none', it='laundry', atlas='gg_laundry_h'),
              dict(n='影印・輸出', c='#2f3a44', w=9, type='none', it='print', v='影印', atlas='gg_yingyin_h', vatlas='gg_yingyin_v'), dict(n='花序 Flower Notes', c='#ece5d8', sc='#8a6e3a', w=10, type='none', it='books'),
              dict(n='轉角唱片', c='#2b3a4a', w=8, type='none', it='books'), dict(n='榮恩典文具社', c='#f2ede0', sc='#1a1a1a', w=9, type='none', it='books'),
              dict(n='Daybreak', c='#3e5a3e', w=9, type='none', it='cafe')]
    _WALLC = ['#d9cbb0', '#cfc5b2', '#e3ddd0', '#c8bca8', '#d6c3a5', '#e6dfd0', '#bfb2a0']; _WALLT = ['tile', 'mosaic', 'tile', 'plaster']
    # 樓上的住戶（套件沒有；台北商店街的樓上是補習班、診所、髮廊…）：直立招牌（建築另一側：字、底色、字色、長度）、二樓整面大招牌（二樓不開窗）、屋頂廣告看板
    _VT = {1: ('美髮', '#ffffff', '#c9463d', 2.6), 4: ('中醫診所', '#f4ead8', '#2f5d50', 4.2), 6: ('民宿', '#ffffff', '#3b5a8c', 2.6), 7: ('數學補習', '#fff2a8', '#c9463d', 4.2),
           8: ('按摩', '#ffffff', '#8c3b47', 2.6), 10: ('健身房', '#2b2b2b', '#e0b24a', 4.2), 12: ('鋼琴教室', '#ffffff', '#2f3a44', 4.2), 14: ('撞球', '#c9463d', '#ffffff', 2.6)}
    _S2 = {2: ('文理補習班', '高中・轉學考・研究所', '#1f4e8c', '#ffffff', '#e0a030'), 5: ('小火鍋', '二樓・學生套餐', '#c9463d', '#ffffff', ''),
           9: ('桌遊・撞球', '二樓', '#2f3a44', '#f4ead8', '#e0b24a'), 11: ('牙醫診所', '週日休診', '#ffffff', '#2f7d5b', '#2f7d5b'), 13: ('英語會話', '小班制・多益', '#f4ead8', '#8c3b47', '#8c3b47')}
    _RS = {7: ('學生套房出租', '近捷運・月租', '#ffffff', '#c9463d', '#c9463d')}
    # 設計稿（使用者生成、BB-B 通過，BB 分支 bc9e0f58；sign_atlas.py --set gongguan）：樓上住戶的直立招牌、二樓大招牌、屋頂看板。有設計稿的不留 SIGN_FACE／VSIGN_FACE（遊戲不再畫字）
    _VTA = {1: 'gg_meifa_v', 4: 'gg_zhongyi_v', 6: 'gg_minsu_v', 7: 'gg_math_v', 8: 'gg_massage_v', 10: 'gg_gym_v', 12: 'gg_piano_v', 14: 'gg_billiard_v'}
    _S2A = {2: 'gg_wenli_2f', 5: 'gg_huoguo_2f', 9: 'gg_boardgame_2f', 11: 'gg_dental_2f', 13: 'gg_english_2f'}; _RSA = {7: 'gg_rent_roof'}
    # 小零件的密度（instancing 的原型整條街一組，任何鏡頭都整組畫出來；從校門看整排店面的鏡頭一定全部看到）：商店街的鐵窗、盆栽比住宅巷少
    # （溫州街 0.7／0.6／0.65；照原本的密度，從校門看的鏡頭三角形 44.9 萬，超過 42 萬的上限）
    _P = dict(p_grille=0.4, p_pot=0.25, p_ac=0.5)
    # 樓層數和校園看出去的那一排相同（gg_backdrop.py HEIGHTS_SHOPS；X86：從校園看是高低錯落的 6～14 層）。zones3d.js 的套件（載入前、載入失敗的備用）照舊 4～7 層
    _GG_FLOORS = [9, 12, 7, 13, 8, 10, 6, 11, 9, 12, 8, 14, 7, 10, 9]
    # 公館四間新店（使用者 11-04 01:0x，AA_647；LAWWW2 11-04）：店面照參考圖 ref_images/shops/gongguan_<店>_ext.webp（wz_shopkit.gg_front；貼圖 gg_fronts_atlas）。
    # 本地 x＝從騎樓看過去的左→右（＝室內 x）；騎樓 3 m，店面在 z −3；一樓騎樓頂 3.85。店門口互動點（zones3d.js：店的中心往右 0.6 m）不動，只有頁間書屋的門照 AA 的室內配置開在左邊（x −4.6，要請 LAWWW 移互動點）
    GG_XS = {
        'G01': dict(dep=3.0, wallc='#e9dfcc', street='ggtea_sign',   # 青木茶室：大窗（店內）＋木門＋外帶窗口；綠瓦屋簷、上面一整塊招牌
                    cards=[('ggtea_int', -1.93, 1.27, 0.79, 2.5, 0.8, [0.24]), ('ggtea_take', 2.94, 4.24, 1.2, 2.45, 0.4)],
                    door=dict(x0=1.3, x1=2.4, y1=2.65, style='wood', key='ggtea_door', d=0.6, hinge='right'),
                    eave=('ggtea_eave', -4.3, 4.3, 2.86, 2.56, 0.55), signs=[('ggtea_sign', -2.27, 4.17, 2.93, 3.78, 'front')], sign_back='wood',
                    decals=[('ggtea_plaque', 2.56, 2.78, 1.35, 2.05, 0.03)], ledges=[(2.9, 4.28, 1.2, 0.3)],
                    props=[('pot', -3.3, 0.4, 'broad'), ('pot', -2.55, 0.32, 'fern'), ('board', 'ggtea_board', -0.9, 0.5)]),
        'G02': dict(dep=3.0, wallc='#e9dfcc', street='ggbook_sign', base='ggbook_stone',   # 頁間書屋：門在左（AA 的室內 yejian_layout.js：門 x −4.6 寬 1.1、窗 −3.6～5.6）
                    cards=[('ggbook_int2', -3.6, 1.0, 0.55, 2.85, 0.8, [-1.3]), ('ggbook_int', 1.0, 5.6, 0.55, 2.85, 0.8, [3.3])],
                    door=dict(x0=-5.15, x1=-4.05, y1=2.85, leaf=2.4, style='wood', key='ggbook_door', d=0.6, hinge='left', mat=True),
                    signs=[('ggbook_sign', -2.4, 3.2, 2.93, 3.8, 'front')], sign_back='wood',
                    decals=[('ggbook_pic', -5.98, -5.48, 1.55, 2.05, 0.03)], lamps=[(-4.6, 3.35), (5.95, 3.35)],
                    props=[('box', 'ggbook_cart', -6.2, -5.45, 1.15, 0.42, 0.35, 'wood'), ('board', 'ggbook_board', -3.0, 0.5), ('pot', -2.2, 0.3, 'fern'), ('pot', 5.95, 0.35, 'broad')]),   # 11-04 蕨類盆栽 −3.85→−2.2（GG_ext_nav2：原本壓到門的左緣，門口 (−36.4,21) 站不住；搬到立牌另一邊）
        'G03': dict(dep=3.0, wallc='#f0eee8', frame='alu', street='ggcvs_sign', street_x=0.6, street_lit=True, sign_lit=True,   # 日和便利店：自動門＋整面玻璃；白色招牌框、綠色線
                    cards=[('ggcvs_side', -5.3, -1.45, 0.08, 2.73, 0.8, [-4.0, -2.7]), ('ggcvs_int', -1.33, 2.93, 0.08, 2.73, 0.8, [-0.56, 1.36])],
                    door=dict(x0=-0.56, x1=1.36, y1=2.73, leaf=2.13, style='auto', frame='alu', mat=True),
                    canopy=dict(x0=-5.3, x1=5.3, y0=2.8, y1=3.84, d=0.45, stripes=[(-5.2, -0.55, 3.28), (3.85, 5.2, 3.28)], stripe='#8a9a4a'),
                    signs=[('ggcvs_sign', -0.33, 3.65, 2.9, 3.77, 'canopy')],
                    props=[('box', 'ggcvs_locker', 2.97, 3.5, 1.7, 0.45, 0.4, 'cream'), ('box', 'ggcvs_bins', 3.53, 4.36, 0.78, 0.45, 0.4, 'steel'),
                           ('box', 'ggcvs_vend', 4.39, 5.28, 1.75, 0.55, 0.7, 'cream'), ('pot', -1.0, 0.35, 'broad')]),
        'G06': dict(dep=3.0, wallc='#e9dfcc', street='ggbike_sign', street_x=0.6,   # 慢輪單車：中間整面拉開的門（騎樓的三台車、櫥窗的兩台在 zones3d.js）；深綠招牌、鐵皮雨遮
                    cards=[('ggbike_int', -4.4, -0.6, 0.85, 2.55, 0.8, [-2.5]), ('ggbike_int2', 1.75, 4.1, 0.75, 2.55, 0.8)],
                    door=dict(x0=-0.5, x1=1.6, y1=2.6, style='open', key='ggbike_shop', d=0.8),   # 景深卡要在一樓牆體（玻璃後 0.85）前面
                    awning=dict(x0=-4.6, x1=4.6, y0=2.76, y1=2.44, d=0.7), signs=[('ggbike_sign', -2.6, 1.2, 2.84, 3.8, 'front')], sign_back='black',
                    decals=[('ggbike_plaque', 4.25, 4.6, 1.5, 2.1, 0.03)], lamps=[(-2.95, 3.62), (1.55, 3.62), (4.42, 2.55)],
                    props=[('pump', 4.55, 0.25), ('board', 'ggbike_board', 2.05, 0.55)]),
        # 公館第二批（使用者 11-04 02:0x，AA_650；門窗數字 docs/art-rebuild/second_ai/wip/gongguan5/DOORS.md）
        'G05': dict(dep=3.0, wallc='#d9b46a', frame='alu', street='ggyy_sign', street_lit=True, sign_lit=True,   # 洋洋鹹酥雞：左邊開放式炸物櫃台、右邊玻璃門＋落地窗；黃色舊牆、燈箱招牌
                    cards=[('ggyy_kitchen', -4.3, -0.25, 0.82, 2.85, 0.7), ('ggyy_win', 1.95, 3.5, 0.3, 2.47, 0.8)], open=('ggyy_kitchen',),
                    door=dict(x0=0.45, x1=1.95, y1=2.47, style='wood', key='ggyy_door', d=0.6, frame='alu', hinge='right'),
                    ledges=[(-4.3, -0.25, 0.82, 0.25, 'steel')], signs=[('ggyy_sign', -2.2, 2.8, 2.88, 3.8, 'front')], sign_back='#c9a24e',
                    props=[('board', 'ggyy_board', -0.1, 0.5), ('box', 'ggyy_bins', 3.55, 4.25, 0.95, 0.4, 0.4, 'steel')]),
        'G07': dict(dep=3.0, wallc='#e8dfcc', street='ggafar_sign', street_x=0.6,   # Afar café：深綠飾帶上的招牌字、木框大窗、木門；黑板菜單、壁燈、窗前矮書架
                    cards=[('ggafar_win', -3.9, -0.3, 0.73, 2.68, 0.8, [-2.1]), ('ggafar_int', -0.3, 1.75, 0.73, 2.68, 0.8, [0.7])],
                    door=dict(x0=1.8, x1=3.35, y1=2.82, style='wood', key='ggafar_door', d=0.6, hinge='left'),
                    signs=[('ggafar_sign', -4.8, 4.8, 2.9, 3.84, 'front')], sign_back='black',
                    decals=[('ggafar_menu', 3.7, 4.3, 1.15, 2.05, 0.03)], lamps=[(3.95, 2.6)],
                    props=[('box', 'ggafar_shelf', 0.25, 1.65, 1.1, 0.3, 0.35, 'wood'), ('pot', 4.45, 0.35, 'broad')]),
        'G12': dict(dep=3.0, wallc='#e9e1d0', street='ggcorner_sign',   # 轉角唱片：深藍飾帶、櫥窗（海報、唱機、黑膠）、木門；營業時間牌、門外唱片箱
                    cards=[('ggcorner_win', -3.39, -2.0, 0.64, 2.81, 0.8), ('ggcorner_int', -2.0, 0.69, 0.64, 2.81, 0.8)],
                    door=dict(x0=0.84, x1=2.42, y1=2.81, leaf=2.47, style='wood', key='ggcorner_door', d=0.6, hinge='left'),
                    signs=[('ggcorner_sign', -3.7, 3.7, 2.9, 3.84, 'front')], sign_back='black',
                    decals=[('ggcorner_notice', 2.75, 3.35, 1.3, 2.12, 0.03)], lamps=[(3.05, 2.75)],
                    props=[('box', 'ggcorner_crate', 2.6, 3.4, 1.0, 0.35, 0.4, 'wood'), ('pot', 3.9, 0.35, 'fern')]),   # 11-04 盆栽 0.75→0.35（v9.10.20 gongguan_layout_nav：原本凸到騎樓 z 20.9，x 51.25～52.75 那一段站不住）
        'G14': dict(dep=3.0, wallc='#efe8da', frame='#7d9a86', street='ggdb_sign', base='ggdb_tile',   # Daybreak：灰綠框大窗＋黃色小方磚腰牆、灰綠框玻璃門＋側窗；米色帆布雨棚、米白飾帶上的招牌
                    cards=[('ggdb_int', -3.31, 1.48, 0.76, 2.53, 0.8, [-1.7, -0.1]), ('ggdb_door', 2.73, 3.07, 0.05, 2.43, 0.6)],
                    door=dict(x0=1.6, x1=2.73, y1=2.43, style='wood', key='ggdb_door', d=0.6, hinge='right'),
                    awning=dict(x0=-3.5, x1=3.1, y0=2.94, y1=2.5, d=0.75, style='canvas', color='#e8dcc0'),
                    canopy=dict(x0=-4.2, x1=4.2, y0=2.96, y1=3.84, d=0.12, color='#efe8da'), signs=[('ggdb_sign', -2.2, 2.9, 3.05, 3.76, 'canopy')],
                    decals=[('ggdb_menu', 3.3, 3.95, 1.2, 2.15, 0.03)], lamps=[(3.62, 2.62)],
                    props=[('board', 'ggdb_board', -2.6, 0.5), ('pot', -3.85, 0.35, 'broad'), ('pot', 3.95, 0.4, 'broad')]),
    }
    # 使用者 2026-11-10 的外觀參考圖（GG-SHOPS3-ART-1110：G04 安泰藥局、G08 汀州鮮果、G13 榮恩典文具社，docs/art-rebuild/second_ai/ref/gg_shops6_1110/；FLOWER-NOTES-ART-1110：G11 花序，docs/handoff/user_specs/flower_notes_ref/exterior.png）。
    # 貼圖 gg_shops6_tex.py → xs_front_tex.py 的 QG。招牌只有騎樓外面那一塊（參考圖的位置），放大到店面寬（street_fit）。公館的騎樓線照舊（一樓玻璃退 3 m）
    GG_XS.update({
        'G04': dict(dep=3.0, wallc='#f1f1ec', frame='alu', street='ggantai_sign', street_fit=8.6, street_lit=True,   # 安泰藥局：白色舊燈箱、深綠字、藥罐圖示；鋁框玻璃自動門、玻璃上一條綠線、店內白光貨架和藥師櫃台
                    cards=[('ggantai_int', -4.15, 4.15, 0.1, 2.8, 0.8, [-2.1, -0.75, 0.75, 2.1])]),
        'G08': dict(dep=3.0, back=2.35, wallc='#eef0ec', frame='alu', street='ggfruit_sign', street_fit=7.4, street_lit=True, keep=('stool_r', 'outlet'),   # 汀州鮮果：橘黃燈箱、深咖啡色手寫字；整面開著的水果行（綠色塑膠籃、木箱、吊著的香蕉、吊秤、黃燈泡）
                    cards=[('ggfruit_shop', -3.65, 3.65, 0.0, 3.0, 2.3)], open=('ggfruit_shop',),   # 第 3 版（BB 11-11 01:47，D141 最後一版）：照片卡從店面線後 0.8 m 退到 2.3 m 當背景，開口到照片中間排真的水果箱（前排六箱在地上、第二排六箱墊高 0.34 m、最裡面靠兩邊四箱墊高 0.62 m；中間 2.4 m 留給進門）；一樓牆體跟著往後退（back＝2.35）
                    props=[('fruit', 'banana', -3.2, -0.38), ('fruit', 'orange', -2.4, -0.38), ('fruit', 'apple', -1.6, -0.38), ('fruit', 'melon', 1.6, -0.38), ('fruit', 'guava', 2.4, -0.38), ('fruit', 'pine', 3.2, -0.38),
                           ('fruit', 'tomato', -3.2, -1.05, 0.34), ('fruit', 'guava', -2.4, -1.05, 0.34), ('fruit', 'orange', -1.6, -1.05, 0.34), ('fruit', 'orange', 1.6, -1.05, 0.34), ('fruit', 'apple', 2.4, -1.05, 0.34), ('fruit', 'tomato', 3.2, -1.05, 0.34),
                           ('fruit', 'apple', -3.2, -1.72, 0.62), ('fruit', 'orange', -2.4, -1.72, 0.62), ('fruit', 'guava', 2.4, -1.72, 0.62), ('fruit', 'tomato', 3.2, -1.72, 0.62)]),
        'G13': dict(dep=3.0, wallc='#efe9dc', frame='alu', street='ggrong_sign', street_fit=7.2, street_lit=True,   # 榮恩典文具社：米色招牌、黑字、鉛筆畫筆圖示、四色線；鋁框玻璃、木層架塞滿
                    cards=[('ggrong_int', -4.15, 4.15, 0.1, 2.85, 0.8, [-2.2, -0.6, 0.9, 2.4])]),
        # GG-G09-G10-SHUTTER-1111（X335，使用者 11-11 選「先拉下鐵門」）：洗樂、印得好搬到汀州路以後，公館這兩格是拉下鐵捲門的空店面；之後放什麼店由使用者決定（D147），不放別的
        'G09': dict(dep=3.0, wallc='#d9d6cc', shut=True),
        # GG-G10-LANE-MOUTH-1111（使用者 11-11 選擇題「改成真的巷口」）：G10 的一樓是往汀州路那條巷子的巷口（遊戲的「往汀州路（巷子）」互動點在這一格前面）；G10 之後不放店
        'G10': dict(dep=3.0, wallc='#d4d0c4', lane=True, lane_w=4.6, lane_d=13.0),
        'G11': dict(dep=3.0, wallc='#f6efe1', wall_flat=True, frame='#c9a86a', street='ggfn_sign', street_fit=9.4,   # 花序 Flower Notes：米白洞石色、香檳金細框；兩側大櫥窗、中間雙開玻璃門；招牌帶在騎樓外面；二樓整排玻璃（xs_up）
                    cards=[('ggfn_winl', -4.3, -1.4, 0.25, 3.1, 0.8, [-2.85]), ('ggfn_door', -1.0, 1.0, 0.0, 2.95, 0.8, [0.0]), ('ggfn_winr', 1.4, 4.3, 0.25, 3.1, 0.8, [2.85])],
                    props=[('fn_tree', -1.2, 0.3), ('fn_tree', 1.2, 0.3), ('fn_box', -4.2, -1.6, 0.03, 0.34), ('fn_box', 1.6, 4.2, 0.03, 0.34)]),   # 第 2 版（BB 11-11 01:50）：牆改平塗的米白石材（wall_flat，比兩邊亮）；門口兩棵白方盆的樹、兩個櫥窗下各一個長花箱（原本只有兩盆小盆栽）；招牌重畫（gg_shops6_tex.fn_sign）
    })
    SPECS = []; _x = -68.0
    for _i, _s in enumerate(_SHOPS):
        _last = _i == len(_SHOPS) - 1; _X0 = _x; _X1 = _x + _s['w'] + (1.2 if (_i < 8 and not _last) else 0.0); _W = _X1 - _X0; _cx = (_X0 + _X1) / 2
        _pl = [_W / 2]; _nb = max(1, round(_W / 5)) if (_s['type'] == 'none' and _i not in (4, 5, 7, 8, 10, 11, 12, 13, 14)) else 1   # 第二批四間（AA_650）變成進得去的店：店門前不放中間那根柱子（參考圖沒有；zones3d.js 一起改）；11-10 再加 G04 安泰、G08 汀州鮮果、G11 花序、G13 榮恩典（參考圖門在中間）
        for _k in range(1, _nb): _pl.append(_W / 2 - _k * _W / _nb)
        if _last: _pl.append(-_W / 2)
        _sp = dict(id=f'G{_i:02d}', pos=(_cx, 19.0), ry=math.pi, w=_W, d=16, floors=_GG_FLOORS[_i], wall=_WALLT[_i % 4], color=_WALLC[_i % 7],
                   balcony=_i % 3 == 1, tank=_i % 2 == 0, roofAdd=_i % 5 == 3, ground='arcade', pillars=_pl, rollbox=True, **_P,
                   shop=SHOP(type=_s['it'], name=_s['n'], sub=_s.get('sub', ''), signBg=_s['c'], signColor=_s.get('sc', '#ffffff'), band=_s.get('band', ''), atlas=_s.get('atlas'),
                             vertical=_s.get('v'), vatlas=_s.get('vatlas'), vBg='#ffffff', vColor=_s['c'], vBand=_s['c']))
        if _sp['id'] in GG_XS: _sp['xs'] = GG_XS[_sp['id']]   # 公館四間新店（AA_647）
        if _sp['id'] == 'G11': _sp.update(wall='plaster', color='#f6efe1', balcony=False, xs_up=[dict(f=1, x0=-4.5, x1=4.5, y0=GH + 0.75, y1=GH + 2.95, tex='ggfn_up', pane=1.5, frame='#c9a86a')])   # 花序：一、二樓都是店（二樓花藝教室整排玻璃），樓上照舊是公寓
        if _i in _VT: _t = _VT[_i]; _sp['vtenant'] = dict(vertical=_t[0], vBg=_t[1], vColor=_t[2], vBand=_t[2], len=_t[3], vatlas=_VTA.get(_i))
        if _i in _S2 and _i != 11: _t = _S2[_i]; _sp['sign2f'] = dict(sign=_t[0], sub=_t[1], bg=_t[2], color=_t[3], band=_t[4], atlas=_S2A.get(_i))
        if _i in _RS: _t = _RS[_i]; _sp['roofsign'] = dict(sign=_t[0], sub=_t[1], bg=_t[2], color=_t[3], band=_t[4], atlas=_RSA.get(_i))
        if _i == 0: _sp['side_wins'] = '+x'   # 麵店西側（朝往溫州街的巷子）開窗
        SPECS.append(_sp); _x = _X1
    # 巷口轉角（往溫州街的巷子西側）：一般店面、沒有騎樓（照套件 cb）；東側朝巷子開窗
    SPECS.append(dict(id='G15', pos=(-81.0, 19.0), ry=math.pi, w=14.0, d=16, floors=5, wall='tile', color='#cdbfa8', balcony=True, tank=True, ground='shop', side_wins='-x', **_P,
                      shop=SHOP(type='teishoku', name='豆花・甜湯', sub='粉圓・芋圓・紅豆', signBg='#f4ead8', signColor='#5c3a21', band='#c9a24a', atlas='gg_douhua_h')))

# ---------------- 118 巷（--set lane118，⑭）：照 src/data/lane118_layout.js（LAWWW 的配置；遊戲的導航、店門互動點讀同一份，兩邊一定對得上） ----------------
# 巷子南北向（x 往東、z 往南）：西側立面在 x=facade.west、朝東（ry=π/2：建築的 +x＝世界 −z）；東側在 x=facade.east、朝西（ry=−π/2：建築的 +x＝世界 +z）。
# 配置裡的 9 間店照 z0～z1 蓋（店門在中間）；店與店之間的空檔補上沒有互動的樓房：寬度不到 2.6 m 的是住家樓梯間（紅／綠鐵門），其他是住家、鐵捲門、一般小店；
# 兩條小巷（alleys）不蓋（走不進去的背景巷由遊戲做）；靠小巷、靠和平東路／辛亥路的那一面開側窗。店名是虛構的（配置裡的名字）。
# 政大山下（--set nccu_food；LAWWW2-B 2026-10-16；outings3d.js 的 nccu_food「政大・山下的小吃街」）：只給 bg_nccu.py 算 2D 背景（沒有導航）。
# 使用者 2026-10-16：「政大附近有麥當勞 和主要什麼學生會去的店你要實際查 不要虛構」→ 照查證（docs/art-rebuild/second_ai/research/nccu_real_shops.md）：
# 指南路二段 57～67 號（政大側門「麥側」斜對面、學生人流最多的一段）由南往北：敏忠小吃 57、迷客夏 59、50嵐 63、一樓甜品店＋二樓四川飯館 65、麥當勞 67（三層）。
# 店面寬度、樓層數、配色是推估（沒有看到照片）；只有一側（W）有房子，對面是指南路和校園（bg_nccu.py 做）。
# 使用者 2026-10-16：店名一律改諧音（避免侵權）：敏忠小吃→明中小吃、迷客夏→米可夏、50嵐→五十藍、四川飯館→肆川飯館、麥當勞→麥丹勞、摩斯漢堡→魔司漢堡；不畫商標、不照抄品牌配色
NCCU_FOOD = {"sides": ["W"], "lane": {"x0": -3.0, "x1": 3.0, "z0": -40.0, "z1": 14.0}, "facade": {"west": -4.6, "east": 4.6}, "floorH": 3.1, "groundH": 3.5, "alleys": [],
             "shops": [{"id": "minzhong", "side": "W", "z0": 6.0, "z1": 11.0, "floors": 4, "name": "明中小吃", "type": "家常菜"},
                       {"id": "milksha", "side": "W", "z0": 2.0, "z1": 6.0, "floors": 4, "name": "米可夏", "type": "手搖飲"},
                       {"id": "fifty", "side": "W", "z0": -2.0, "z1": 2.0, "floors": 4, "name": "五十藍", "type": "手搖飲"},
                       {"id": "sichuan", "side": "W", "z0": -7.0, "z1": -2.0, "floors": 4, "name": "冰品・甜湯", "type": "甜湯", "vsign": "肆川飯館"},
                       {"id": "mcd", "side": "W", "z0": -15.0, "z1": -7.0, "floors": 3, "name": "麥丹勞", "type": "速食"},
                       {"id": "mos", "side": "W", "z0": -25.0, "z1": -19.0, "floors": 4, "name": "魔司漢堡", "type": "速食"}]}
# 麥當勞和摩斯中間：一棟鐵門長年拉下的公寓（關鍵評論網）；其他查不到的門面只放住家鐵門、鐵捲門，不編店名
# ART-XINSHENG-GATE-1103（D108，LAWWW2 11-03）：新生南路西側一整排騎樓店面，照 XINSHENG_LAYOUT（草案在 docs/art-rebuild/second_ai/wip/xinsheng/；接進遊戲以後是 src/data/xinsheng_layout.js）。
#   換算成 118 巷那一套的格式：只有西側、街沿著 z、立面（樓上的牆面）在 x＝facade.upper、一樓退成騎樓（ground 'arcade'）
def _xinsheng_lj():
    import json as _j
    _p = os.path.join(L.ROOT, 'src/data/xinsheng_layout.js')
    if not os.path.exists(_p): _p = os.path.join(L.ROOT, 'docs/art-rebuild/second_ai/wip/xinsheng/xinsheng_layout.js')
    _s = open(_p, encoding='utf8').read(); X = _j.loads(_s[_s.index('{', _s.index('\nconst XINSHENG_LAYOUT=')):_s.rindex('}') + 1])
    sh = sorted([dict(id=q['id'], side='W', z0=q['z0'], z1=q['z1'], floors=q['floors'], name=q['name'], type=q['type'], door=q['door']) for q in X['shops']], key=lambda q: q['z0'])
    for a, b in zip(sh, sh[1:]):   # 店與店之間不到 1.5 m 的縫：店面加寬補滿（原本會做成一棟 0.6 m 寬、只有一扇門的小房子）
        if 0 < b['z0'] - a['z1'] < 1.5: a['z1'] = b['z0']
    _wl = X['wenzhouLane']
    for q in sh:   # 店和溫州街巷口之間不到 1.5 m 的縫也補滿
        if 0 < _wl['z0'] - q['z1'] < 1.5: q['z1'] = _wl['z0']
        if 0 < q['z0'] - _wl['z1'] < 1.5: q['z0'] = _wl['z1']
    wl = X['wenzhouLane']
    return {"sides": ["W"], "lane": {"z0": X['road']['z0'], "z1": X['road']['z1']}, "facade": {"west": X['facade']['upper'], "east": -X['facade']['upper']},
            "floorH": X['facade']['floorH'], "groundH": X['facade']['groundH'], "alleys": [{"side": "W", "z0": wl['z0'], "z1": wl['z1']}], "shops": sh, "X": X}
if SET in ('lane118', 'nccu_food', 'xinsheng', 'xinsheng_far'):
    import json as _json
    if SET in ('xinsheng', 'xinsheng_far'):
        LJ = _xinsheng_lj()
    elif SET == 'lane118':
        _src = open(os.path.join(L.ROOT, 'src/data/lane118_layout.js'), encoding='utf8').read()
        LJ = _json.loads(_src[_src.index('{', _src.index('const LANE118_LAYOUT=')):_src.rindex('}') + 1])
        # L118-SHOPS-REDO-1111（X338）：兩間外帶飲料店（LAWWW 11-11 04:15 同意的位置；原本這兩格是拉下鐵捲門的空店面，樓層數照原本的 4 層）。
        # 配置檔（LAWWW 的 lane118_layout.js）還沒有這兩筆的時候在這裡補上，有了就用配置檔的
        for _q in ({"id": "drink_a", "side": "E", "z0": -7.0, "z1": -2.0, "floors": 4, "name": "喝不喝咖啡", "type": "手搖飲"}, {"id": "drink_b", "side": "W", "z0": -9.0, "z1": -6.0, "floors": 4, "name": "果茶社", "type": "手搖飲"}):
            if not any(_s['id'] == _q['id'] for _s in LJ['shops']): LJ['shops'].append(_q)
    else:
        LJ = NCCU_FOOD
    GH, FH = LJ['groundH'], LJ['floorH']
    _TYPE = {'滇緬料理': 'teishoku', '自助餐': 'teishoku', '手搖飲': 'tea', '家常菜': 'teishoku', '咖啡': 'cafe', '義大利麵': 'cafe', '韓式': 'teishoku', '蛋包飯': 'cafe', '麵店': 'noodle',
             '滷味': 'noodle', '甜湯': 'teishoku', '早餐': 'teishoku', '鹹酥雞': 'noodle', '速食': 'cafe',
             '速食（24 小時）': 'cafe', '二輪戲院': 'books', '書店（兩層）': 'books', '吉他行（二樓）': 'books', '球鞋': 'bike', '球拍專賣': 'bike', '運動用品（兩層）': 'bike'}
    # 招牌底色、字色、色帶、雨遮（虛構店家，配色照店的類型）
    _LOOK = {'dian': ('#2f5d50', '#f4ead8', '#c9a24a', '#2f5d50'), 'self': ('#c9463d', '#ffffff', '', '#c9463d'), 'tea': ('#f4ead8', '#2f7d5b', '#2f7d5b', None),
             'home': ('#8c3b2a', '#f4ead8', '', '#3b5a8c'), 'cafe2': ('#3b2a1e', '#f4ead8', '', None), 'pasta': ('#f4f1ea', '#8c3b47', '#2f5d50', '#2f5d50'),
             'korea': ('#ffffff', '#c9463d', '#1f4e8c', '#c9463d'), 'omu': ('#f2c230', '#5c3a21', '', '#e0a030'), 'noodle2': ('#f4ead8', '#9c2f2a', '', '#9c2f2a'),
             'minzhong': ('#b8231c', '#ffffff', '', '#b8231c'), 'milksha': ('#3f6f8c', '#ffffff', '', None), 'fifty': ('#f4f1ea', '#2f5d50', '#2f5d50', None),
             'sichuan': ('#f4ead8', '#9c2f2a', '', None), 'mcd': ('#8c2a22', '#f4ead8', '#e0a030', None), 'mos': ('#2f4a3a', '#f4ead8', '', None),
             # 新生南路（照參考圖 ref_images/shops/*_ext.webp 的配色；大口漢堡用藍底橘字，不用紅黃）
             'dakou': ('#1f3a6b', '#f4ead8', '#e8873a', None), 'nanyang': ('#8c2a22', '#f6e7c8', '#d9b45a', '#6b2a22'), 'shanlan': ('#f4ead8', '#3b2a1e', '', None),
             'tongxian': ('#7a2a2a', '#f4ead8', '', None), 'dabu': ('#1f2e45', '#ffffff', '', None), 'haopai': ('#2f6f4a', '#ffffff', '#e0b24a', '#2f6f4a'),
             'xsports': ('#1f4e8c', '#ffffff', '#c9463d', None)}
    _FILL = [('早餐店', 'teishoku', '#f2b33e', '#3b2a1e'), ('影印・輸出', 'print', '#2f3a44', '#ffffff'), ('自助洗衣', 'laundry', '#e9f2f6', '#2a5f8a'),
             ('水果行', 'fruit', '#e0a030', '#3b2a1e'), ('二手書', 'books', '#2f4a3a', '#f4ead8'), ('文具', 'books', '#8c3b47', '#ffffff')]
    _WALLC = ['#d9cbb0', '#cfc5b2', '#e3ddd0', '#c8bca8', '#d6c3a5', '#e6dfd0', '#bfb2a0', '#cdbfa8']; _WALLT = ['tile', 'mosaic', 'tile', 'plaster']
    _DOOR = ['#9c2f2a', '#2f4a3a', '#5c3a21', '#8a3a2a']
    _P = dict(p_grille=0.6, p_pot=0.45, p_ac=0.75 if SET == 'lane118' else 0.6)   # 118 巷：冷氣多一點（ART-L118-LANE-1020：二樓以上太空）
    # 118 巷樓上的住戶、小店（ART-L118-LANE-1020）：直立招牌（建築的另一端，字由遊戲畫；虛構、不寫電話）
    _VT_L = [('套房出租', '#ffffff', '#3b5a8c', 3.2), ('補習班', '#fff2a8', '#c9463d', 4.2), ('美髮', '#ffffff', '#c9463d', 2.6), ('桌遊', '#2b2b2b', '#e0b24a', 2.6),
             ('牙醫', '#ffffff', '#2f7d5b', 2.6), ('二樓咖啡', '#3b2a1e', '#f4ead8', 3.2), ('按摩', '#ffffff', '#8c3b47', 2.6), ('中醫', '#f4ead8', '#2f5d50', 2.6)]
    Z0, Z1 = LJ['lane']['z0'], LJ['lane']['z1']
    # 新生南路七家店的店面（ART-XINSHENG-FRONTS-1104）：照參考圖 ref_images/shops/<店>_ext.webp（企劃線）。貼圖 xs_front_tex.py 從參考圖裁出來（圖集的 key＝<店>_<部位>）；
    # 本地 x：−W/2 → +W/2＝參考圖的左 → 右（西側的樓：本地 +x＝北）。signs：(key, x0, x1, y0, y1, 'front' 店面上方｜'street' 騎樓靠街那一面｜'hang' 騎樓下吊著)；
    # up：二樓以上的整排窗（f＝第幾層，1＝二樓；solid＝整片外牆貼圖）；vsigns：(key, x, y0, y1, 突出)；decals：(key, x0, x1, y0, y1, 離店面)。GH＝4.2、FH＝3.2
    _G = LJ['groundH']
    XS_FRONTS = {
        'dabu': dict(int='dabu_int', back=3.1, frame='#d8d8d4', signs=[('dabu_sign', -3.5, 3.5, 3.0, 3.8, 'front')], mullions=[1.2]),
        'haopai': dict(int='haopai_int', frame='#cfd6d6', signs=[('haopai_sign', -2.05, 2.05, 3.05, 3.8, 'front')], glass=(-2.0, 2.0)),
        'shanlan': dict(int='shanlan_int', int_tiles=1, frame='#2a2a28', glass_h=3.15, mullions=[-2.6, 2.6], signs=[('shanlan_sign', -1.0, 2.9, _G - 0.1, _G + 0.82, 'street')], sign_back='#4a3426',
                        up=[dict(f=1, x0=-6.8, x1=6.8, y0=_G + 0.25, y1=_G + 2.85, tex='shanlan_up', tiles=1, pane=1.6)]),
        'tongxian': dict(int='tongxian_int', glass=(-3.0, 0.55), frame='#cfd6d6', stair=dict(x0=1.45, x1=2.95, depth=4.4), signs=[('tongxian_sign', -2.9, 0.3, _G + 0.7, _G + 1.6, 'street')], sign_back='#5a3a22',
                         decals=[('tongxian_guitar', 0.72, 1.08, 1.1, 2.0, 0.04), ('tongxian_plaque', 1.15, 1.38, 1.4, 2.1, 0.04)],
                         up=[dict(f=1, x0=0.4, x1=3.0, y0=_G + 0.35, y1=_G + 2.6, tex='tongxian_up', tiles=1, pane=1.3),
                             dict(f=1, x0=-3.0, x1=0.3, y0=_G + 0.35, y1=_G + 2.6, tex=None, blank=True)]),   # 二樓招牌後面：原本那扇鐵窗拿掉（招牌蓋在窗上很怪）
        'xsports': dict(int='xsports_int', frame='#cfd6d6', mullions=[-2.2, 2.2], signs=[('xsports_sign', -6.6, 6.6, _G - 0.72, _G + 0.92, 'street')],
                        vsigns=[('xsports_v', 6.55, _G + 1.2, _G + 5.0, 0.95)], up=[dict(f=1, x0=-6.6, x1=6.6, y0=_G + 1.15, y1=_G + 2.85, tex='xsports_up', pane=1.1)]),
        'dakou': dict(int='dakou_int', frame='#2a2f3a', lit=True, mullions=[-3.4, 0.0, 3.4], signs=[('dakou_sign', -6.6, 6.6, _G - 0.7, _G + 0.72, 'street')], sign_back='#1f3a6b',
                      vsigns=[('dakou_v', 6.6, _G + 0.9, _G + 4.4, 1.2)], up=[dict(f=1, x0=-6.6, x1=6.6, y0=_G + 0.95, y1=_G + 2.9, tex='dakou_up', pane=1.6)]),
        'nanyang': dict(int=None, band='stone', signs=[('nanyang_sign', -0.8, 1.6, _G - 1.25, _G - 0.42, 'hang')], sign_back='#3a2a22',
                        decals=[('nanyang_front', -4.3, 4.3, 0.0, 3.75, 0.02), ('nanyang_poster', -7.0, -5.3, 0.35, 3.55, 0.05), ('nanyang_poster', 5.3, 7.0, 0.35, 3.55, 0.05)],
                        up=[dict(f=1, x0=-4.0, x1=4.0, y0=_G + 0.1, y1=_G + 3.0, tex='nanyang_fascia', solid=True)]),
    }
    SPECS = []; _n = 0; _fi = 0
    for _side in LJ.get('sides', ('W', 'E')):
        _fx = LJ['facade']['west'] if _side == 'W' else LJ['facade']['east']; _ry = math.pi / 2 if _side == 'W' else -math.pi / 2
        _shops = sorted([q for q in LJ['shops'] if q['side'] == _side], key=lambda q: q['z0'])
        _gaps = sorted([(a['z0'], a['z1']) for a in LJ['alleys'] if a['side'] == _side])
        _segs = [(q['z0'], q['z1'], q) for q in _shops]; _cur = Z0; _taken = sorted([(q['z0'], q['z1']) for q in _shops] + _gaps)
        _free = []
        for a, b in _taken:
            if a > _cur + 0.05: _free.append((_cur, a))
            _cur = max(_cur, b)
        if Z1 > _cur + 0.05: _free.append((_cur, Z1))
        for a, b in _free:                                                     # 空檔切成 ≤ 9 m 的樓房
            k = max(1, math.ceil((b - a) / 9.0)); w = (b - a) / k
            for i in range(k): _segs.append((a + i * w, a + (i + 1) * w, None))
        _segs.sort(key=lambda t: t[0])
        for i, (a, b, q) in enumerate(_segs):
            w = b - a; cz = (a + b) / 2; sid = f'{_side}{i:02d}'
            # 側面開窗：靠小巷、或在巷子兩端（朝和平東路／辛亥路）的那一面；西側的 +x＝北（−z）、東側的 +x＝南（+z）
            north_open = abs(a - Z0) < 0.05 or any(abs(a - g1) < 0.05 for g0, g1 in _gaps)
            south_open = abs(b - Z1) < 0.05 or any(abs(b - g0) < 0.05 for g0, g1 in _gaps)
            sw = None
            if north_open: sw = '+x' if _side == 'W' else '-x'
            elif south_open: sw = '-x' if _side == 'W' else '+x'
            base = dict(id=sid, pos=(_fx, cz), ry=_ry, w=w, d=12, floors=(q['floors'] if q else 3 + (_n * 7) % 3), wall=_WALLT[_n % 4], color=_WALLC[(_n * 3) % 8],
                        balcony=(_n % 3 == 1 and w > 5), tank=_n % 2 == 0, roofAdd=(_n % 5 == 3 and w > 5), **_P)
            if sw: base['side_wins'] = sw
            if q:
                bg, fg, band, awn = _LOOK.get(q['id'], ('#f4ead8', '#3b2a1e', '', None))
                shop = SHOP(type=_TYPE.get(q['type'], 'teishoku'), name=q['name'], sub=q.get('sub', q['type'] if SET == 'lane118' else ''), signBg=bg, signColor=fg, band=band,
                            vertical=q.get('vsign', q['name'][:4] if len(q['name']) <= 6 else None), vBg='#ffffff', vColor=bg if bg not in ('#ffffff', '#f4f1ea', '#f4ead8') else fg, vBand=fg)
                if awn: shop['awning'] = awn
                base.update(ground='shop', shop=shop, lane118=q['id'])
                if SET == 'xinsheng': base.update(ground='arcade', pillars=[w / 2], rollbox=False, d=20)   # 新生南路：一樓退成騎樓（參考圖），樓房比 118 巷深
                if SET == 'xinsheng' and q['id'] in XS_FRONTS: base['xs'] = XS_FRONTS[q['id']]; base['xs_up'] = XS_FRONTS[q['id']].get('up', [])   # 照參考圖的店面（wz_shopkit.xs_front）
            elif w < 2.6: base.update(ground='door', door=_DOOR[_n % 4], floors=max(3, base['floors']))
            elif SET == 'nccu_food': base.update(ground=['shutter', 'door'][_n % 2], door=_DOOR[_n % 4])
            else:
                g = ['door', 'shutter', 'shop'][_n % 3]
                if g == 'shop':
                    nm, ty, bg, fg = _FILL[_fi % len(_FILL)]; _fi += 1
                    base.update(ground='shop', shop=SHOP(type=ty, name=nm, sub='', signBg=bg, signColor=fg, band=''))
                else: base.update(ground=g, door=_DOOR[_n % 4])
            if SET == 'lane118' and w > 4.0 and base['floors'] >= 3 and _n % 2 == 0 and base.get('ground') != 'door':
                _t = _VT_L[(_n // 2) % len(_VT_L)]; base['vtenant'] = dict(vertical=_t[0], vBg=_t[1], vColor=_t[2], vBand=_t[2], len=min(_t[3], GH + (base['floors'] - 1) * FH - GH - 0.8))
            SPECS.append(base); _n += 1

# ---------------- 汀州路商圈（--set tingzhou；TINGZHOU-AREA-1110，X321；LAWWW2 帳號 A 11-10）----------------
# 使用者 3D 美術指令（docs/art-rebuild/second_ai/ref/tingzhou_1110/USER_INSTRUCTION_1110.md）：中低樓層老街屋、一樓密集店面與騎樓、二樓以上鐵窗冷氣陽台、
# 直立燈箱招牌一整排（參考圖 5、6）、新舊混合、東南亞餐館混在學生日常店裡；不要統一規格的方盒子店面。不用 118 巷那一套排法（使用者「118這麼醜」）：
#   每一棟照 src/data/tingzhou_layout.js 的寬度（2.5～12 m）、樓層（3～7）、裝修年代（era）、店面（front）各自不同；騎樓 3.2 m；
#   每一棟一支店的直立招牌，大部分再一支樓上住戶的（補習班、診所、美髮、套房…）；鐵窗、冷氣、盆栽比溫州街密（老公寓）。
#   店面組件照公館騎樓那一套（wz_shopkit.arcade_front_v2：立體淺店內、門、地磚、燈、紙條、門口雜物），每一間照 era／front 換。
if SET == 'tingzhou':
    import json as _json
    _s = open(os.path.join(L.ROOT, 'src/data/tingzhou_layout.js'), encoding='utf8').read(); TZ = _json.loads(_s[_s.index('{', _s.index('\nconst TINGZHOU_LAYOUT=')):_s.rindex('}') + 1])
    GH, FH = TZ['groundH'], TZ['floorH']; _FW, _FE, _DEP = TZ['facade']['west'], TZ['facade']['east'], TZ['facade']['depth']
    _P = dict(p_grille=0.85, p_pot=0.55, p_ac=0.85)
    # 招牌（底色、字色、色帶）：東南亞餐館用各自的配色（不照抄任何真實店家）；三間有互動的照 GG_SHOPS3_1110.md 第三節
    _LK = {'wente': ('#26221f', '#e6d3a8', ''), 'liantong': ('#1f3f9a', '#ffffff', '#6fa3e0'), 'dongnan': ('#f2c230', '#b8231c', '#2f7d5b'), 'keju': ('#f1e3c4', '#8a2a22', '#8a2a22'), 'yuehaochi': ('#8a2a26', '#f4e6c8', ''),
           'e_books': ('#2f4a3a', '#f4ead8', ''), 'taimi': ('#f2e8d6', '#5a3a22', '#d9772e'), 'xile': ('#bfe2f2', '#ffffff', '#5aa7d0'), 'yindehao': ('#2f4256', '#ffffff', ''),
           'w_burma': ('#8a1f2a', '#f2d27a', '#d9a640'), 'w_indo': ('#b8231c', '#ffffff', '#ffffff'), 'e_malay': ('#1f6b4a', '#f6e27a', '#e0b24a'), 'e_hainan': ('#f6e7c8', '#8a2a22', '#c9a24a'),
           'w_viet': ('#2f6f4a', '#ffffff', '#e8c040'), 'w_bento': ('#c9463d', '#ffffff', ''), 'w_sport': ('#1f4e8c', '#ffffff', '#c9463d'), 'w_phone': ('#ffffff', '#1f6fb0', '#1f6fb0'),
           'w_tea': ('#f4ead8', '#2f7d5b', '#2f7d5b'), 'w_cafe': ('#3b2a1e', '#f4ead8', ''), 'w_mian': ('#f2b33e', '#7a2a1e', ''), 'w_daily': ('#e8f0f4', '#c9463d', '#c9463d'),
           'w_books': ('#2f4a3a', '#f4ead8', ''), 'w_luwei': ('#9c2f2a', '#ffffff', ''), 'w_moto': ('#2b2b2b', '#f2c230', ''), 'w_brunch': ('#f4f1ea', '#5c3a21', '#8fa070'),
           'e_glass': ('#ffffff', '#1f4e8c', '#1f4e8c'), 'e_chicken': ('#f4ead8', '#9c2f2a', '#9c2f2a'), 'e_douhua': ('#f4ead8', '#5c3a21', '#c9a24a'), 'e_cloth': ('#2b2b2b', '#f4ead8', ''),
           'e_dump': ('#f2c230', '#8a2a22', ''), 'e_lotto': ('#e0b24a', '#9c2f2a', ''), 'e_bfast': ('#ffffff', '#e0731e', '#e0731e'), 'e_shoes': ('#3a3a3a', '#ffffff', '#e0731e'),
           'e_cvs': ('#f4f4f0', '#2f7d5b', '#e0731e'), 'e_market': ('#2f5d50', '#f4ead8', '#c9a24a')}
    # 店內景（wz_shopkit.shallow_interior 的種類；藥局那一種有綠十字燈箱，不用）、門、地磚、燈
    _KIND = {'wente': 'records', 'liantong': 'cvs', 'dongnan': 'cvs', 'keju': 'brunch', 'yuehaochi': 'brunch', 'e_books': 'books', 'taimi': 'brunch', 'xile': 'laundry', 'yindehao': 'print', 'w_burma': 'noodle', 'w_bento': 'buffet', 'w_sport': 'stationery', 'w_phone': 'cvs', 'w_indo': 'noodle', 'w_tea': 'tea',
             'w_cafe': 'books', 'w_mian': 'noodle', 'w_viet': 'buffet', 'w_daily': 'cvs', 'w_books': 'books', 'w_luwei': 'luwei', 'w_moto': 'bike', 'w_brunch': 'brunch',
             'e_glass': 'cvs', 'e_chicken': 'luwei', 'e_malay': 'noodle', 'e_douhua': 'buffet', 'e_cloth': 'records', 'e_dump': 'noodle', 'e_lotto': 'cvs', 'e_bfast': 'tea',
             'e_hainan': 'buffet', 'e_shoes': 'stationery', 'e_cvs': 'cvs', 'e_market': 'fruit'}
    _ERA = {'old': dict(floor=['f_mosaic', 'f_concrete', 'f_floral', 'f_terrazzo'], light='cool', door={'open': 'open', 'glass': 'alu', 'half': 'alu'}),
            'mid': dict(floor=['f_granite', 'f_white', 'f_terrazzo'], light='cool', door={'open': 'open', 'glass': 'alu', 'half': 'alu'}),
            'new': dict(floor=['f_white', 'f_floral', 'f_granite'], light='warm', door={'open': 'open', 'glass': 'wood', 'half': 'wood'})}
    _WARM = {'wente', 'keju', 'yuehaochi', 'e_books', 'taimi', 'w_burma', 'w_indo', 'e_malay', 'e_hainan', 'w_viet', 'w_cafe', 'w_books', 'w_brunch', 'e_douhua', 'w_mian', 'e_dump', 'w_luwei', 'e_chicken', 'e_market', 'w_bento'}
    # 門口的雜物（wz_shopkit 的原型；每一間不一樣）：小吃＝塑膠凳、菜單立牌、桶子；東南亞餐館＝照片菜單立牌、盆栽；玻璃店面＝傘桶、立牌、盆栽；市場＝箱子、水果架
    _CL = {'open': [('stool_r', -1.2, 0.35), ('stool_b', -0.6, 0.4), ('bins', 1.2, 0.35)], 'half': [('aboard', -0.9, 0.45, 'menu'), ('pot', 1.3, 0.3, 'broad')],
           'glass': [('umb', -1.1, 0.3), ('aboard', 0.9, 0.45, 'menu')], 'market': [('crates', -3.0, 0.55), ('boxes', -1.0, 0.35), ('crates', 2.2, 0.55), ('boxes', 4.0, 0.3)]}
    _NT = ['hours', 'pay', 'hiring', 'hours2', 'menu', 'poster', 'tutor', 'rent']
    # 樓上住戶的直立招牌（虛構、不寫電話）：補習班、診所、美髮、套房、按摩、會計、中醫、瑜珈、英文、牙醫、桌遊、二樓咖啡
    _S2F = [('數學・理化家教班', '國中・高中', '#ffffff', '#c9463d', '#c9463d'), ('桌遊空間', '2F', '#2b2b2b', '#f2c230', ''), ('美髮造型', '剪・染・燙', '#f4ead8', '#5a3a22', ''), ('英日語會話', '小班制', '#1f3f9a', '#ffffff', '#f2c230'), ('自習教室', '月租・時租', '#ffffff', '#2f5d50', '#2f5d50')]   # 暫定的字（種類當招牌，D77 不用真實店名）
    _VTZ = [('文理補習班', '#fff2a8', '#c9463d', 3.6), ('牙醫診所', '#ffffff', '#2f7d5b', 3.0), ('套房出租', '#ffffff', '#3b5a8c', 2.8), ('美髮沙龍', '#2b2b2b', '#f4ead8', 2.8), ('中醫', '#f4ead8', '#2f5d50', 2.6),
            ('英語教室', '#1f4e8c', '#ffffff', 3.2), ('會計事務所', '#ffffff', '#2f3a44', 3.4), ('按摩', '#ffffff', '#8c3b47', 2.6), ('瑜珈', '#e8f0e8', '#2f6f4a', 2.6), ('桌遊二樓', '#2b2b2b', '#e0b24a', 2.8),
            ('二樓咖啡', '#3b2a1e', '#f4ead8', 3.0), ('鋼琴教室', '#ffffff', '#3a3a3a', 3.0)]
    # 使用者指定的五間（X322）：照概念圖 docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/shop_*.webp；貼圖 tz_fronts_tex.py → tz_fronts_atlas。
    # 第 2 版（使用者 11-10 20:5x「混合」）：這五間沒有騎樓、直接臨人行道——整棟退到店面線（立面 x −8.2），用沒有騎樓的店面（wz_shopkit.xs_street_front，同溫州街日常失速）：
    #   落地窗後面一張店內卡（概念圖裁的）、門框、雨棚、窗上一塊招牌板（概念圖的招牌貼在上面）、門燈。本地 x＝從街上看的左→右。照片菜單貼在窗旁的牆上（panel 的 text）
    TZ_XS = {
        'wente': dict(arcade=False, dep=0.3, glass=(-2.45, 2.45), glass_h=2.75, int='tzwen_int', pane=1.65, transom=2.45, lit=True,   # 溫特寶邸：深色木作櫥窗＋木門；黑底米金字招牌；三盞燈
                      panel=dict(x0=-2.62, x1=2.62, y0=2.95, y1=3.72, color='#26221f', text=[('tzwen_sign', -2.5, 2.5, 2.99, 3.67)]), lamps=[(-1.7, 3.5), (0.0, 3.5), (1.7, 3.5)], frame='#3a2a20'),
        'liantong': dict(arcade=False, dep=0.3, glass=(-1.95, 1.95), glass_h=2.75, int='tzlian_int', pane=1.3, transom=2.45, lit=True,   # 汀州聯通：鋁框玻璃、白光、手機殼牆
                         panel=dict(x0=-2.15, x1=2.15, y0=2.95, y1=3.78, color='#1f3f9a', text=[('tzlian_sign', -2.1, 2.1, 3.0, 3.74)]), frame='#c9ccd0', vsigns=[('tzlian_vsign', 2.05, 4.3, 7.6, 0.85)]),
        'dongnan': dict(arcade=False, dep=0.3, glass=(-3.45, 3.45), glass_h=2.6, int='tzdong_shop', pane=3.45, transom=2.6, lit=True,   # 東南大聯商行：整面開著、貨架塞滿；墨綠帆布雨棚；黃底紅字招牌
                        awning=dict(x0=-3.6, x1=3.6, y0=2.92, y1=2.62, d=1.0, color='#2f5d50'),
                        panel=dict(x0=-3.55, x1=3.55, y0=2.95, y1=3.88, color='#f2c230', text=[('tzdong_sign', -3.45, 3.45, 2.96, 3.87)])),
        'keju': dict(arcade=False, dep=0.3, glass=(-2.4, 1.45), glass_h=2.7, int='tzkeju_int', pane=1.9, transom=2.7, lit=True,   # 客居雲南：黑框玻璃、藤編吊燈、木桌；酒紅帆布雨棚；右邊照片菜單
                     awning=dict(x0=-2.55, x1=1.6, y0=2.95, y1=2.68, d=0.9, color='#7a2a2a'),
                     panel=dict(x0=-2.62, x1=2.62, y0=2.98, y1=3.86, color='#f1e3c4', text=[('tzkeju_sign', -2.6, 2.6, 2.99, 3.85), ('tzkeju_menu', 1.75, 2.35, 0.8, 2.3)]), vsigns=[('tzkeju_vsign', -2.55, 4.3, 7.9, 0.95)]),
        'yuehaochi': dict(arcade=False, dep=0.3, glass=(-2.35, 1.3), glass_h=2.8, int='tzyue_int', pane=1.8, transom=2.5, lit=True,   # 越好吃小館：深色木框玻璃門窗、藤編吊燈、木桌椅；右邊照片菜單
                          panel=dict(x0=-2.4, x1=2.4, y0=2.95, y1=3.88, color='#8a2a26', text=[('tzyue_sign', -2.35, 2.35, 2.96, 3.87), ('tzyue_menu', 1.55, 2.3, 0.7, 2.45)]), frame='#3a2a20', vsigns=[('tzyue_vsign', -2.8, 4.3, 7.9, 0.95)]),
    }
    # 第 2 版：三間有規格的店照使用者 11-10 21:1x 的外觀參考圖（docs/art-rebuild/second_ai/ref/gg_shops6_1110/concept/）。三張圖都有騎樓：保留騎樓，店面用參考圖裁的景深卡（wz_shopkit.gg_front）
    # 第 3 版（BB 第 2 版判定）：一間店只留一塊招牌（參考圖只有一塊：騎樓外面那一塊），招牌板放大到整個店面寬（street_fit）
    TZ_ARC = {
        'taimi': dict(dep=3.0, wallc='#4a2f1c', frame='#3a2416', street='tztai_sign', street_fit=7.4,   # 泰米村食：深木色店面、米白字招牌＋三盞射燈；左大窗（藤編吊燈、木桌椅）、窗下一排菜色照片；中間米色布簾的門；右窗（吧台、層架）
                      cards=[('tztai_winl', -3.6, -0.5, 0.95, 2.75, 0.8, [-2.05]), ('tztai_door', -0.4, 0.7, 0.0, 2.75, 0.8), ('tztai_winr', 0.85, 3.55, 0.95, 2.65, 0.8, [2.2])], open=('tztai_door',),
                      decals=[('tztai_menu', -3.6, -0.5, 0.2, 0.86, 0.03)],
                      props=[('pot', -3.75, 0.35, 'broad'), ('pot', 1.1, 0.4, 'fern')]),
        'xile': dict(dep=3.0, wallc='#f2f2ee', frame='alu', street='tzxile_sign', street_fit=5.6, street_lit=True, keep=('bench',),   # 洗樂洗衣坊：淺天藍燈箱；鋁框大玻璃，左一排洗衣機、中間折衣桌、右邊上下疊的烘衣機；騎樓木長椅、盆栽
                     cards=[('tzxile_int', -2.65, 2.65, 0.12, 2.7, 0.8, [-1.3, 0.1, 1.05])], props=[('pot', -2.45, 0.4, 'broad')]),
        'yindehao': dict(dep=3.0, wallc='#e8e6e0', frame='alu', street='tzyin_sign', street_fit=6.1, street_lit=True,   # 印得好：深灰藍招牌；左窗（輸出樣張、色票、窗台的裝訂樣本）、中間玻璃雙開門（影印機、櫃台）、右窗（海報、門外的樣本架）
                         cards=[('tzyin_winl', -2.95, -0.8, 0.12, 2.7, 0.8), ('tzyin_door', -0.7, 0.75, 0.0, 2.7, 0.8, [0.02]), ('tzyin_winr', 0.85, 2.95, 0.12, 2.7, 0.8)],
                         ),
        # 禮貌生財（X332；使用者 11-11 的外觀圖）：巷 A 後段南側靠公館那一端，一樓退成騎樓（規格：傳統騎樓柱、騎樓下的算命桌）。深色木框格子窗（左）、深色木框的門開著（右）、
        #   深紅棕木招牌古銅金書法字（從圖裁）；算命桌是另外的節點（nm_stalls.py 的 LIMAO_TABLE_*，照時間切換）
        'limao': dict(dep=3.0, wall_same=True, frame='#3a2416', street='limao_sign', street_fit=4.3, fw=0.07, ceilc='#e4dcc8', lamp_warm=True,
                      # 第 2 版（BB 11-11 01:21：店面太暗太素、窗小、門洞窄、招牌下面一條黑）：牆＝這一棟的米白小方磚；格子窗加大（四直三橫）；門洞加寬、一扇格子門往外開著；騎樓天花板米白、暖黃燈；
                      #   兩盆植物（左高、右青花瓷盆）和算命桌在 nm_stalls.py 的 LIMAO_* 節點（位置在配置 limao）
                      cards=[('limao_win', -2.35, -0.1, 0.8, 2.7, 0.8, [-1.79, -1.23, -0.66], [1.43, 2.07]), ('limao_door', 0.15, 1.75, 0.0, 2.7, 0.8)], open=('limao_door',),
                      leaves=[(1.75, 0.8, 2.66, 1)]),
    }
    _WALLC = ['#e6e2d8', '#d9d4c6', '#cfd2cc', '#e2d6c0', '#d4c7b0', '#c9cfc6', '#ddd2c2', '#bfb7aa', '#e9e4da', '#cbbfae']; _WALLT = ['mosaic', 'tile', 'mosaic', 'plaster', 'tile', 'mosaic']
    SPECS = []
    for _n, q in enumerate(sorted(TZ['shops'], key=lambda q: (q['side'], q['z0']))):
        _w = q['z1'] - q['z0']; _cz = (q['z0'] + q['z1']) / 2; _W = q['side'] == 'W'
        _fx = _FW if _W else _FE; _ry = math.pi / 2 if _W else -math.pi / 2
        _rr = random.Random(sum(ord(c) for c in q['id']) * 7 + 3)
        bg, fg, band = _LK.get(q['id'], ('#f4ead8', '#3b2a1e', ''))
        _front = q.get('front', 'glass'); _era = _ERA[q.get('era', 'mid')]
        _sign_txt = q['name']; _v = q['name'][:5] if len(q['name']) <= 5 else q['name'][:4]
        shop = SHOP(type=_KIND.get(q['id'], 'cvs'), name=_sign_txt, sub=q.get('type', ''), signBg=bg, signColor=fg, band=band, vertical=_v, vBg=bg if bg not in ('#ffffff', '#f4f1ea', '#f4ead8', '#f4f4f0', '#e8f0f4') else '#ffffff', vColor=fg, vBand=band or fg)
        shop['vlen'] = round(min(_rr.choice([2.6, 3.4, 4.2, 5.0, 5.8]), (q['floors'] - 1) * FH - 0.6), 1)
        # （21:0x 自己畫的三塊招牌 tz_signs_tex.py 不用了：使用者 21:1x 給了參考圖，招牌從圖上裁）
        _dw = min(1.6, max(0.9, _w * 0.28)); _dx = _rr.choice([-1, 1]) * max(0.0, _w / 2 - _dw / 2 - 0.6) * _rr.uniform(0.3, 1.0)
        sf = dict(inner=True, kind=None, door=_era['door'].get(_front, 'alu') if _front != 'market' else 'open', floor=_rr.choice(_era['floor']),
                  light='warm' if q['id'] in _WARM else _era['light'], door_x=round(_dx, 2), door_w=round(_dw, 2),
                  notes=[(_rr.choice(_NT), round(_rr.uniform(-_w / 2 + 0.6, _w / 2 - 0.6), 2), round(_rr.uniform(1.0, 1.35), 2), 0.36, 0.38)] + ([(_rr.choice(_NT), round(_rr.uniform(-_w / 2 + 0.6, _w / 2 - 0.6), 2), 1.2, 0.34, 0.34)] if _w > 5 else []),
                  clutter=[(c[0], max(-_w / 2 + 0.5, min(_w / 2 - 0.5, c[1] * (1 if _w > 3.5 else 0.5))), *c[2:]) for c in _CL.get(_front, [])] if _w > 3 else [])
        sf['bright'] = {'old': 0.5, 'mid': 0.6, 'new': 0.66}[q.get('era', 'mid')]   # 第 2 版（BB：沒名字的店晚上是一格一格白亮的空房間）：店內調暗，老店最暗
        if q.get('type') == '手搖飲' or q['id'] == 'e_bfast': sf['kind'] = 'tea'; sf['floor_in'] = 'f_white'   # 臨騎樓的點餐櫃台（公館青木那一種）
        if q['id'] == 'xile': sf['clutter'] = [('bench', -0.6, 0.35), ('vend', _w / 2 - 0.7, 0.42)]   # 規格：騎樓下的木長椅；洗衣精販賣機
        if q['id'] == 'yindehao': sf['clutter'] = [('boxes', -_w / 2 + 0.8, 0.3), ('aboard', 0.6, 0.45, 'menu')]; sf['notes'] = [('copyprice', -1.6, 0.95, 0.6, 0.62), ('copyprice2', -0.9, 0.95, 0.6, 0.62), ('pay', 1.3, 1.45, 0.34, 0.34)]   # 規格：店外裝訂樣本架（之後換專用的）
        _floors = q['floors']
        base = dict(id='T' + q['id'], pos=(_fx, _cz), ry=_ry, w=_w, d=_DEP, floors=_floors, wall=_WALLT[(_n * 5 + len(q['id'])) % len(_WALLT)], color=_WALLC[(_n * 3 + 1) % len(_WALLC)],
                    balcony=_rr.random() < 0.35 and _w > 4, tank=_rr.random() < 0.5, roofAdd=_rr.random() < 0.45 and _w > 4, ground='arcade', pillars=[_w / 2], rollbox=_rr.random() < 0.6,
                    shop=shop, sf=sf, **_P)
        if q['id'] in TZ_ARC: base['xs'] = TZ_ARC[q['id']]; base['rollbox'] = False; sf['notes'] = []; sf['clutter'] = [('bench', -1.0, 0.35)] if q['id'] == 'xile' else []
        if q['id'] == 'taimi': _tpl = (dict(shop), dict(sf))   # 禮貌生財借這一間的店面設定（騎樓＋參考圖店面）
        if q['id'] in TZ_XS:   # 沒有騎樓（第 2 版）：整棟退 3.2 m 到店面線，一樓是一般店面（不是騎樓），不要柱子、不要組件店面
            _ad = TZ['facade']['arcade']; base.update(pos=(_fx - _ad if _W else _fx + _ad, _cz), d=_DEP - _ad, ground='shop', xs=TZ_XS[q['id']], rollbox=False); base.pop('sf'); base.pop('pillars')
        if _w > 3.5 and _floors >= 4 and _rr.random() < 0.85:
            _t = _VTZ[(_n * 5) % len(_VTZ)]; base['vtenant'] = dict(vertical=_t[0][:5], vBg=_t[1], vColor=_t[2], vBand=_t[2], len=min(_t[3], (_floors - 1) * FH - 0.8))
        base.update(p_laundry=0.45, pots_n=3, pot_mix=True)   # 第 2 版：樓上多一點生活的東西（使用者：鐵窗、冷氣、不規則立面；v1 樓上太乾淨）
        if _w >= 4.5 and _floors >= 4 and q['id'] not in TZ_XS and (_n * 7 + len(q['id'])) % 3 == 0:   # 三棟裡一棟：二樓整面的住戶招牌（參考圖 5、6：二樓的補習班、診所、美容）
            _s2 = _S2F[(_n * 3) % len(_S2F)]; base['sign2f'] = dict(sign=_s2[0], sub=_s2[1], bg=_s2[2], color=_s2[3], band=_s2[4])
        if q['id'] == 'xile': base['side_wins'] = '+x'
        if q['id'] == 'yindehao': base['side_wins'] = '-x'   # 巷 A 口兩邊的側牆開窗（BB：整面沒紋理的灰牆）
        if q['id'] == 'e_market': shop['vlen'] = 2.6
        if q['id'] == 'e_market': base.update(balcony=False, roofAdd=False, tank=False, wall='plaster', color='#cfc8b8')
        if q['id'] == 'e_market' and q.get('deep'): base['d'] = q['deep']; base['side_wins'] = '-x'   # SHUIYUAN-MARKET-LANE-1112（使用者 11-12「水源市場是一棟建築!!!」）：整棟深 26 m（x 5～31），北面臨市場旁的巷子、開側窗
        if q['id'] == 'e_hainan' and len(TZ['alleys']) > 1: base['side_wins'] = '+x'   # 新巷子北側的那一面
        SPECS.append(base)
    # 巷 A 的兩側（樓房深 14 m 以外的那一段）、盡頭（公館店面街的背面）：住家門、鐵捲門、小雜貨
    _A = TZ['alleys'][0]; _ax0 = _FE + _DEP; _ax1 = _FE + _A['len'] + 2.0
    _LM = TZ.get('limao'); _sx1 = _LM['x0'] if _LM else _ax1   # 禮貌生財（X332）：南側那一棟靠公館的一段（配置 limao.x0～x1）另外一棟、一樓騎樓
    for _i, (_id, _pos, _ry, _w, _d, _fl, _g) in enumerate([('TA_N', ((_ax0 + _ax1) / 2, _A['z0']), 0.0, _ax1 - _ax0, 10, 5, 'door'), ('TA_S', ((_ax0 + _sx1) / 2, _A['z1']), math.pi, _sx1 - _ax0, 10, 4, 'shutter'),
                                                           ('TA_END', (_ax1, 0.0), -math.pi / 2, _A['z1'] - _A['z0'] + 8, 14, 7, 'door')]):
        SPECS.append(dict(id=_id, pos=_pos, ry=_ry, w=_w, d=_d, floors=_fl, wall=_WALLT[_i % len(_WALLT)], color=_WALLC[(_i * 4 + 2) % len(_WALLC)], balcony=_i == 1, tank=True, roofAdd=_i != 1,
                          ground=_g, door=['#5c3a21', '#2f4a3a', '#8a3a2a'][_i], **_P))
    # 水源市場旁的巷子（SHUIYUAN-MARKET-LANE-1112）：南側就是市場那一棟（上面 deep）；北側臨街樓房以外的那一段、盡頭各一棟
    for _M in TZ['alleys'][1:]:
        _mx0 = _FE + _DEP; _mx1 = _FE + _M['len'] + 2.0
        SPECS.append(dict(id='TM_N', pos=((_mx0 + _mx1) / 2, _M['z0']), ry=0.0, w=_mx1 - _mx0, d=6, floors=4, wall=_WALLT[1], color=_WALLC[3], balcony=True, tank=True, roofAdd=False, ground='shutter', door='#5c3a21', **_P))
        SPECS.append(dict(id='TM_END', pos=(_mx1, (_M['z0'] + _M['z1']) / 2), ry=-math.pi / 2, w=_M['z1'] - _M['z0'] + 8, d=14, floors=6, wall=_WALLT[2], color=_WALLC[5 % len(_WALLC)], balcony=False, tank=True, roofAdd=True, ground='door', door='#2f4a3a', **_P))
    if _LM:
        _lw = _LM['x1'] - _LM['x0']; _sh, _sf = _tpl; _sh = dict(_sh, name=_LM['name'], sub='', vertical='', type='cvs'); _sf = dict(_sf, notes=[], clutter=[], light='warm', bright=0.5)
        SPECS.append(dict(id='TA_LIMAO', pos=((_LM['x0'] + _LM['x1']) / 2, _A['z1']), ry=math.pi, w=_lw, d=10, floors=4, wall='mosaic', color='#d8d0bc', balcony=False, tank=True, roofAdd=False,
                          ground='arcade', pillars=[-_lw / 2 + 0.3, _lw / 2 - 0.3], rollbox=False, shop=_sh, sf=_sf, xs=TZ_ARC['limao'], p_laundry=0.3, pots_n=2, pot_mix=True, **_P))

# XS-FARVIEW-1105（LAWWW2-B 2026-11-07；使用者 11-05 08:1x「新生南路側門 遠景太假」＝一排方盒、路口外面平的）：--set xinsheng_far → xinsheng_far.glb。
#   新生南路區域（src/xinsheng3d.js）走得到的是 z −68～68；街的兩頭原本只有平地，遠景是引擎的城市剪影圓筒（半徑 118 m，在校園那一側就落在校園裡面）。
#   這裡做街廓：西側店面那一排往兩頭接下去（和 xinsheng_street.glb 同一套公寓、材質、窗戶原型 → draw call 幾乎不加）、北端 T 字路口（往西）、南端十字路口、
#   南端路口過去東側（校園的西南角外面）也是一排樓房、店面那一排後面一排 6～13 層的樓（從街上看得到屋頂線上面多一層）、路口盡頭擋視線的樓、號誌桿。
#   路面、人行道、分隔島、圍牆、行道樹、路燈是遊戲的程式畫（docs/art-rebuild/second_ai/wip/xs_farview_1107/ 的 patch），兩邊的數字是同一組 XSF。
XSF = dict(zN=-178.0, zS=178.0, armN=(-100.0, -84.0), armS=(74.0, 90.0), backW=-37.0, backE=38.0, endW=-66.0, endE=70.0)
if SET == 'xinsheng_far':
    def _xs_far_specs():
        R = random.Random(1105); WF, EF = LJ['facade']['west'], LJ['facade']['east']; out = []; cnt = [0]
        WALLC = _WALLC + ['#c9c6bf', '#b9b4aa', '#d8d4cb', '#c4bdb0']
        def one(side, fx, a, b, floors, far, ground, sw=None, d=12, tag='F'):
            k = cnt[0]; cnt[0] += 1; w = b - a
            sp = dict(id=f'{tag}{side}{k:02d}', pos=(fx, (a + b) / 2), ry=math.pi / 2 if side == 'W' else -math.pi / 2, w=w, d=d, floors=floors,
                      wall=_WALLT[k % 4], color=WALLC[(k * 3) % len(WALLC)], balcony=(k % 3 == 1 and w > 5 and not far), tank=k % 2 == 0, roofAdd=(k % 5 == 3 and w > 5),
                      far=far, flatwin=far, p_grille=0.3 if far else 0.6, p_pot=0.0 if far else 0.35, p_ac=0.0 if far else 0.55)
            if sw: sp['side_wins'] = sw
            if ground == 'shop' and w >= 4.0:
                nm, ty, bg, fg = _FILL[k % len(_FILL)]; sp.update(ground='shop', shop=SHOP(type=ty, name=nm, sub='', signBg=bg, signColor=fg, band=''))
            elif ground == 'shutter' and w >= 3.0: sp.update(ground='shutter', door=_DOOR[k % 4])
            else: sp.update(ground='door', door=_DOOR[k % 4])
            out.append(sp)
        def row(side, fx, z0, z1, fmin, fmax, far, wmax=9.0, gaps_n=False, gaps_s=False, tag='F', d=12, irregular=False):
            # gaps_n：這一段北端（−z）是路口（側面開窗）；gaps_s：南端（+z）
            segs = []
            if irregular:   # 後排：9～16 m 一棟，偶爾留 2～4 m 的防火巷
                z = z0
                while z < z1 - 0.5:
                    w = min(z1 - z, R.uniform(9.0, 16.0))
                    if z1 - (z + w) < 6.0: w = z1 - z
                    segs.append((z, z + w)); z += w + (R.uniform(2.0, 4.0) if R.random() < 0.3 else 0.0)
            else:
                k = max(1, math.ceil((z1 - z0) / wmax)); w = (z1 - z0) / k; segs = [(z0 + i * w, z0 + (i + 1) * w) for i in range(k)]
            for i, (a, b) in enumerate(segs):
                sw = None
                if i == 0 and gaps_n: sw = '+x' if side == 'W' else '-x'
                elif i == len(segs) - 1 and gaps_s: sw = '-x' if side == 'W' else '+x'
                g = ['shop', 'door', 'shutter'][(cnt[0]) % 3] if not far else ['door', 'shutter'][cnt[0] % 2]
                one(side, fx, a, b, R.randint(fmin, fmax), far, g, sw=sw, d=d, tag=tag)
        zN, zS, (n0, n1), (s0, s1) = XSF['zN'], XSF['zS'], XSF['armN'], XSF['armS']
        # ① 西側店面那一排接下去（樓層和 xinsheng_street 差不多：3～6 層；離區域遠的那幾段只有窗）
        row('W', WF, zN, n0, 4, 7, True, gaps_s=True); row('W', WF, n1, -68.0, 3, 5, False, gaps_n=True)
        row('W', WF, 68.0, s0, 3, 5, False, gaps_s=True); row('W', WF, s1, zS, 4, 7, True, gaps_n=True)
        # ② 南端路口過去的東側（校園西南角外面）
        row('E', EF, s1, zS, 4, 7, True, gaps_n=True)
        # ③ 後排：店面那一排後面（西側，x −37 起）；南端東側那一排的後面
        for a, b in ((zN, n0), (n1, s0), (s1, zS)): row('W', XSF['backW'], a, b, 6, 13, True, gaps_n=a != zN, gaps_s=b != zS, tag='B', d=14, irregular=True)
        row('E', XSF['backE'], s1 + 2.0, zS, 7, 12, True, gaps_n=True, tag='B', d=14, irregular=True)
        # ④ 路口的路往兩邊看過去，盡頭的樓（不是一直看到天邊）
        one('W', XSF['endW'], n0 - 6.0, n1 + 6.0, 9, True, 'door', tag='E', d=14)
        one('W', XSF['endW'], s0 - 6.0, s1 + 6.0, 8, True, 'door', tag='E', d=14)
        one('E', XSF['endE'], s0 - 6.0, s1 + 6.0, 10, True, 'door', tag='E', d=14)
        return out
    SPECS = _xs_far_specs()
    print('{"xs_far_specs": %d}' % len(SPECS))

random.seed(707)
B.reset(texres=512)
_RN = {'gongguan': 'gongguan_shops', 'lane118': 'lane118_street', 'nccu_food': 'nccu_food_street', 'xinsheng': 'xinsheng_street', 'xinsheng_far': 'xinsheng_far'}.get(SET, 'wenzhou_street')
root = B.group(_RN, props={'kind': _RN})
base = CL.materials()      # Café 的共用材質（鋁窗、鐵窗、冷氣、浪板、水塔、植物…，名稱相同→遊戲同一套夜間設定）
_mats = {}


NEUTRAL = {'tile': '#dadada', 'mosaic': '#dadada', 'plaster': '#e9e9e9', 'tile_sq': '#ebe0cd'}   # tile_sq：暖米色小方磚（ambientCG Tiles139，CC0；阿德影印 ADE-V2-1104，參考圖 wz_ade_ext）   # 外牆貼圖的平均色（最亮的那棟也不超過，頂點色 ≤ 1）


def pillar_mat(kind):
    """騎樓柱子（公館，包外牆）：和外牆同一張貼圖、頂點色，材質名 wz_pillar_<kind>（遊戲的樹幹透視照名字找；合併時不和外牆合在一起）"""
    k = 'wz_pillar_' + kind; m = bpy.data.materials.get(k)
    if m is None: m = wall_mat(kind).copy(); m.name = k
    return m


def wall_mat(kind):
    """外牆：tile＝長條磁磚、mosaic＝小方塊馬賽克、plaster＝水泥漆。每一種只有一個材質、一張中性灰的貼圖：
    每棟的顏色放在頂點色（glTF COLOR_0，three.js 乘上貼圖）→ 同一種外牆整條巷子合成一次 draw call、只存一張貼圖"""
    if kind not in _mats:
        nm = f'wz_wall_{kind}'; c = NEUTRAL[kind]
        if kind == 'mosaic': m = L.pbr(nm, 'rounded_square_tiled_wall', tile=1.0, target=c, normal=0.8, maps=('diff', 'nor'), rough_value=0.45)
        elif kind == 'tile_sq': m = L.pbr(nm, 'acg_tiles139', tile=0.6, target=c, normal=0.55, maps=('diff', 'nor'), rough_value=0.42, contrast=0.8)   # 一張 6×6 塊：一塊 10 cm、磚縫細、每塊深淺不同（v2b：7 cm 從街上看磚縫太密、整面偏灰）
        elif kind == 'plaster': m = L.pbr(nm, 'plaster_grey_04', tile=1.5, target=c, normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.9)
        else: m = L.pbr(nm, 'long_white_tiles', tile=1.2, target=c, normal=0.8, maps=('diff', 'nor'), rough_value=0.5)
        _mats[kind] = vc_tint(m)
    return _mats[kind]


def vc_tint(m, layer='Col'):
    """顏色貼圖 × 頂點色（Color Attribute 節點：glTF 匯出器看到它就輸出 COLOR_0）"""
    nt = m.node_tree; N = nt.nodes; Lk = nt.links; bsdf = N['Principled BSDF']
    src = bsdf.inputs['Base Color'].links[0].from_socket
    mix = N.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
    vc = N.new('ShaderNodeVertexColor'); vc.layer_name = layer
    Lk.new(src, mix.inputs[6]); Lk.new(vc.outputs['Color'], mix.inputs[7]); Lk.new(mix.outputs[2], bsdf.inputs['Base Color'])
    return m


def set_tint(ob, hexcol, kind):
    """整個物件的頂點色＝這棟的牆色 ÷ 貼圖的平均色（線性空間）"""
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    t = [int(hexcol[i:i + 2], 16) / 255 for i in (1, 3, 5)]; n = [int(NEUTRAL[kind][i:i + 2], 16) / 255 for i in (1, 3, 5)]
    col = [min(1.0, lin(a) / lin(b)) for a, b in zip(t, n)] + [1.0]
    ca = ob.data.color_attributes.new('Col', 'FLOAT_COLOR', 'CORNER'); ca.data.foreach_set('color', col * len(ca.data))


def flat(name, hexcol, **kw):
    if name not in _mats: _mats[name] = L.flat(name, hexcol, **kw)
    return _mats[name]


M = dict(base)
M.update({
    'gwall': L.pbr('wz_ground_wall', 'terrazzo_tiles', tile=1.0, target='#8a8278', normal=0.5, maps=('diff', 'nor'), res=256, rough_value=0.7),
    'shutter': L.pbr('wz_shutter', 'painted_metal_shutter', tile=1.2, target='#a9aeb1', normal=0.9, maps=('diff', 'nor'), res=256, rough_value=0.5),
    'pillar': L.pbr('wz_pillar_tile', 'long_white_tiles', tile=1.0, target='#b8aa96', normal=0.7, maps=('diff', 'nor'), rough_value=0.5),
    'sidewalk': L.pbr('wz_arcade_floor', 'square_brick_paving', tile=1.6, target='#9a8f84', maps=('diff',), res=256, rough_value=0.85),
    'ceilA': flat('wz_arcade_ceiling', '#d8d2c6', rough=0.9),
    'tube': L.flat('wz_tube', '#f6f4ee', rough=0.4, emit=B.srgb('#ffffff')),
    'mailbox': flat('wz_mailbox', '#7d8a8f', rough=0.5, metal=0.3),
    'awning_fabric': None,
})


def door_mat(color):
    return flat('wz_door_' + color.lstrip('#'), color, rough=0.5, metal=0.35)


def frame_mat(color):
    return flat('wz_frame_' + color.lstrip('#'), color, rough=0.55, metal=0.2 if color in ('#cfd6d6',) else 0.0)


def awning_mat(color):
    nm = 'wz_awning_' + color.lstrip('#')
    if nm not in _mats:
        m = L.flat(nm, color, rough=0.85); _mats[nm] = m
    return _mats[nm]


SEASON_DOORS = []   # LIFE-DETAILS-SEASONAL-1110：各店門、住家門的位置（世界座標），給 season_deco.py 畫春聯、聖誕布置。只記錄——不影響街景模型
def season_door(spec, xf, x0, x1, top, z, kind, glass=None):
    """記一扇門：x0～x1＝門洞（建築自己的 x）、top＝門頂的高度、z＝門面的平面、kind＝shop／house／gg／open、glass＝整面玻璃的左右（掛燈串用）"""
    w0, w1, wn = xf.p(x0, 0, z), xf.p(x1, 0, z), xf.p(x0, 0, z + 1.0)
    SEASON_DOORS.append(dict(id=spec.get('id'), kind=kind, w0=[w0[0], w0[2]], w1=[w1[0], w1[2]], n=[round(wn[0] - w0[0], 4), round(wn[2] - w0[2], 4)], top=round(top, 3),
                             glass=([list(xf.p(glass[0], 0, z))[::2], list(xf.p(glass[1], 0, z))[::2]] if glass else None)))


class Xf:
    """建築自己的座標（TK.apartment：正面朝 +z、原點在正面中央地面）→ 溫州街世界座標（只轉 π/2 的倍數）"""
    def __init__(self, px, pz, ry): self.px, self.pz, self.c, self.s, self.ry = px, pz, round(math.cos(ry)), round(math.sin(ry)), ry
    def p(self, x, y, z): return (self.px + x * self.c + z * self.s, y, self.pz - x * self.s + z * self.c)
    def box(self, m, x0, x1, y0, y1, z0, z1):
        a = self.p(x0, y0, z0); b = self.p(x1, y1, z1); m.box(min(a[0], b[0]), max(a[0], b[0]), y0, y1, min(a[2], b[2]), max(a[2], b[2])); return m
    def quad(self, m, pts): m.quad([self.p(*q) for q in pts]); return m
    def cyl(self, m, a, b, r, **kw): m.cyl(self.p(*a), self.p(*b), r, **kw); return m


def place(spec):
    if 'pos' in spec: return Xf(spec['pos'][0], spec['pos'][1], spec['ry']), spec['w'], spec['d']
    w = spec['x1'] - spec['x0']; cx = (spec['x0'] + spec['x1']) / 2
    return (Xf(cx, 5.0, math.pi), w, 12.0) if spec['side'] == 'A' else (Xf(cx, -5.0, 0.0), w, 12.0)


# 共用零件（instancing）：鐵窗、雨遮、冷氣、水塔
def bar(m, x0, x1, y0, y1, z0, z1):
    """細鐵條：方塊去掉兩端看不到的蓋子（每根 8 個三角形，原本 12）。最長的那一軸＝鐵條方向（遊戲 x/y/z → Blender x/z/−y）"""
    fs = L.bm_box(m.bm, x0, x1, y0, y1, z0, z1)
    ax = {0: 0, 1: 2, 2: 1}[max((abs(x1 - x0), 0), (abs(y1 - y0), 1), (abs(z1 - z0), 2))[1]]
    caps = []
    for f in fs:
        f.normal_update()
        if abs(f.normal[ax]) > 0.9: caps.append(f)
    bmesh.ops.delete(m.bm, geom=caps, context='FACES_ONLY')


def xbar(m, a, b_, w):
    """細鐵條（效能版，2026-10-16）：沿 a→b 的兩片「十」字交叉薄片（4 個三角形；方條 8 個），薄片和軸對齊——直條、橫條有一片正對街道
    （第一版斜 45° 的 X 字：一半朝下、整片鐵窗看起來比方條暗很多）。材質是雙面的（頂點色金屬），從哪個角度看都有寬度"""
    A, Bv = Vector(a), Vector(b_); d = (Bv - A).normalized(); u = Vector((0, 1, 0)) if abs(d.y) < 0.9 else Vector((1, 0, 0)); u = (u - d * u.dot(d)).normalized(); v = d.cross(u)
    for e in (u * (w / 2), v * (w / 2)): m.quad([tuple(A - e), tuple(Bv - e), tuple(Bv + e), tuple(A + e)])


def grille_mesh(w_, h_, dep=0.42):
    """鐵窗（instancing，整條巷子約 150 個）：前面直條 0.16 m 一根、四條橫條、兩側籠子、底下踏板。
    效能版（2026-10-16）：細條改十字薄片 xbar（4 個三角形）、兩側籠子少兩根、踏板一片 → 348 → 約 120 個三角形"""
    m = Mesh('grille_proto', M['grille']); b = 0.018; n = max(6, int(w_ / 0.16))
    for i in range(n + 1):
        x = -w_ / 2 + i * w_ / n; xbar(m, (x, 0.0, dep - b / 2), (x, h_, dep - b / 2), b)
    for y in (0.0, 0.32, h_ * 0.55, h_ - b * 1.6): xbar(m, (-w_ / 2, y + b * 0.8, dep - b / 2), (w_ / 2, y + b * 0.8, dep - b / 2), b * 1.6)
    for s in (-1, 1):
        x = s * w_ / 2
        # 兩側籠子：一片朝外的薄片（效能第五輪；側面的條子從正面看是側邊、看不出厚度，從巷子斜看是正面）
        for k in (0, 2): m.quad([(x, 0.0, dep * k / 3 - b / 2), (x, 0.0, dep * k / 3 + b / 2), (x, h_, dep * k / 3 + b / 2), (x, h_, dep * k / 3 - b / 2)])
        for y in (0.0, h_ * 0.55, h_ - b * 1.6): m.quad([(x, y, 0.0), (x, y, dep), (x, y + b * 1.6, dep), (x, y + b * 1.6, 0.0)])
    for k in range(3):   # 底下的三條踏板：一條一片（雙面材質；第一版整片底板從街上看是一條黑帶）
        zc = dep * (k + 0.5) / 3; m.quad([(-w_ / 2, 0.03, zc - 0.03), (w_ / 2, 0.03, zc - 0.03), (w_ / 2, 0.03, zc + 0.03), (-w_ / 2, 0.03, zc + 0.03)])
    return proto(m.finish(None))


def hood_mesh(w_, dep=0.62):
    m = Mesh('hood_proto', M['corr'], tile=1.12)
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)][::-1])
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)])
    fr = Mesh('hood_frame', M['grille']); fr.box(-w_ / 2, w_ / 2, -0.03, 0.01, dep - 0.03, dep + 0.01)
    return combine([m.finish(None), fr.finish(None)], 'hood_proto')


def ac_mesh(lite=False):
    """冷氣室外機。效能版（2026-10-16，溫州街、公館都用）：風扇 12 邊、正面格柵 5 條、側面散熱條 6 條都是薄片（每條 2 個三角形；冷氣都在二樓以上，從街上看不出差別）
    → 328 → 約 120 個三角形。lite 參數留著相容（兩邊現在一樣）"""
    body = Mesh('ac_body', M['ac']); body.box(-0.4, 0.4, 0, 0.56, 0, 0.3)
    fan = Mesh('ac_fan', M['ac_dark']); fan.quad([(0.1 + 0.21 * math.cos(k * math.pi / 6), 0.28 + 0.21 * math.sin(k * math.pi / 6), 0.305) for k in range(12)])   # 風扇：正面一片 12 邊形（效能第三輪：原本 0.5 cm 厚的圓柱，側面和背面看不到，44 → 10 個三角形）
    for k in range(5): fan.quad([(-0.13, 0.12 + k * 0.08, 0.31), (0.33, 0.12 + k * 0.08, 0.31), (0.33, 0.135 + k * 0.08, 0.31), (-0.13, 0.135 + k * 0.08, 0.31)])
    for k in range(6): fan.quad([(-0.38, 0.08 + k * 0.07, 0.303), (-0.2, 0.08 + k * 0.07, 0.303), (-0.2, 0.095 + k * 0.07, 0.303), (-0.38, 0.095 + k * 0.07, 0.303)])
    br = Mesh('ac_bracket', M['metal'])
    for x in (-0.4, 0.4): bar(br, x - 0.02, x + 0.02, -0.06, 0.0, -0.02, 0.36); bar(br, x - 0.02, x + 0.02, -0.3, 0.0, -0.02, 0.02)
    return combine([body.finish(None), fan.finish(None), br.finish(None)], 'ac_unit')


def tank_mesh():
    t = Mesh('tank', M['tank']); bmt = L.lathe([(0.0, 0.0), (0.55, 0.0), (0.6, 0.08), (0.6, 1.1), (0.55, 1.2), (0.25, 1.38), (0.0, 1.42)], seg=10)   # 屋頂水塔：10 邊（效能第五輪）
    t.add_bm(bmt, Matrix.Translation(Vector((0, 0, 0.55)))); bmt.free()
    st = Mesh('tank_stand', M['metal'])
    for sx in (-1, 1):
        for sz in (-1, 1): st.box(sx * 0.45 - 0.03, sx * 0.45 + 0.03, 0, 0.55, sz * 0.45 - 0.03, sz * 0.45 + 0.03)
    st.box(-0.5, 0.5, 0.5, 0.56, -0.5, 0.5)
    tob = t.finish(None); L.smooth_mesh(tob)
    return combine([tob, st.finish(None)], 'roof_tank')


GRILLE = grille_mesh(2.5, 1.75); HOOD = hood_mesh(2.7); AC = ac_mesh(lite=SET == 'gongguan'); TANK = tank_mesh()
M['room_lit'] = L.flat('wz_room_lit', '#3a3228', rough=0.9, emit=B.srgb('#ffcf8a'))   # 亮燈的房間：晚上發光（遊戲 TK.addNight）
M['laundry'] = L.vc_material('wz_laundry', rough=0.85)                                    # 鐵窗裡曬的衣服（顏色在頂點色）
M['glass_lit'] = L.flat('wz_win_glass_lit', '#8a8272', rough=0.08, alpha=0.3, emit=B.srgb('#ffc070'))   # 亮燈那戶的窗玻璃：比較透明、晚上自己帶一點暖光（深色玻璃在夜間的環境光下會變淺灰、蓋住燈光）


def stain_mat():
    """窗台下的雨痕（gen_street_textures.py 產生的 RGBA；半透明疊在外牆上：glTF alphaMode BLEND）"""
    m = bpy.data.materials.new('wz_stain'); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; bsdf = N['Principled BSDF']
    tx = N.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(HERE, 'textures', 'gen', 'wz_stain.png'))
    nt.links.new(tx.outputs['Color'], bsdf.inputs['Base Color']); nt.links.new(tx.outputs['Alpha'], bsdf.inputs['Alpha']); bsdf.inputs['Roughness'].default_value = 0.9
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    m.use_backface_culling = True; m['tile'] = 1.0; return m


M['stain'] = stain_mat()


_WIN = {}
WIN_W = 2.2   # 窗的原型寬度（巷子裡大多是 2.2 m；比較窄的窗用 x 方向縮放，鋁框粗細差 1 cm 以內，看不出來）


def window_proto(wh, part):
    """一扇窗（instancing）分兩個原型，所有的窗共用：
      'shell'＝鋁框＋中間的直框、窗台、窗台下的雨痕（亮燈與否都一樣）；'lit'／'dark'＝窗內房間（只有看得到的內面）＋玻璃。
    原本「每種寬度 × 亮燈與否」各一個原型、每個 5 個材質（整條巷子 20 次 draw call），改成 3＋2＋2 次。
    原點＝窗的下緣中央、牆面（z＝0）；寬度 WIN_W，實際寬度用實例的 x 縮放。窗簾不在這裡（每扇的寬度、左右不同）"""
    key = (round(wh, 3), part)
    if key in _WIN: return _WIN[key]
    ww = WIN_W; lit = part == 'lit'
    x0, x1, y0, y1, fz, t, bk = -ww / 2, ww / 2, 0.0, wh, -0.12, 0.05, -0.9
    if part == 'shell':
        al = Mesh('win_alu', M['alu'])   # 鋁框：兩端的蓋子藏在窗洞裡、看不到（bar 不做蓋子）
        # 效能第三輪：鋁框的五根框條改「十」字薄片（每根 4 個三角形；整條巷子 325 扇窗）
        xbar(al, (x0, y0 + t / 2, fz - 0.01), (x1, y0 + t / 2, fz - 0.01), t); xbar(al, (x0, y1 - t / 2, fz - 0.01), (x1, y1 - t / 2, fz - 0.01), t)
        xbar(al, (x0 + t / 2, y0, fz - 0.01), (x0 + t / 2, y1, fz - 0.01), t); xbar(al, (x1 - t / 2, y0, fz - 0.01), (x1 - t / 2, y1, fz - 0.01), t)
        xbar(al, (-0.01, y0 + t, fz - 0.005), (-0.01, y1 - t, fz - 0.005), 0.04)
        sl = Mesh('win_sill', M['band']); sl.box(x0 - 0.08, x1 + 0.08, y0 - 0.07, y0, -0.25, 0.07)   # 窗台：水泥色（效能第三輪試過改鋁框材質省一次 draw call，遊戲裡窗台變深灰，看得出差別，退回）
        stn = Mesh('win_stain', M['stain']); stn.quad([(x0 - 0.05, y0 - 1.05, 0.012), (x1 + 0.05, y0 - 1.05, 0.012), (x1 + 0.05, y0 - 0.07, 0.012), (x0 - 0.05, y0 - 0.07, 0.012)])
        so = stn.finish(None, uv=True); uv01(so)                                              # 窗台下的雨痕（整張貼圖）
        _WIN[key] = combine([al.finish(None), sl.finish(None), so], 'window_shell'); return _WIN[key]
    rm = Mesh('win_room', M['room_lit'] if lit else M['room_dark'])
    # 窗內房間的四面（地板、天花板、左右）往內縮 6 mm：原本剛好在窗洞的四個側面上（牆在 z −0.25～0），
    # 從玻璃斜著看進去，窗洞側面的牆磚和房間一直閃（BUG-WZFLICKER，check_coplanar：一扇窗 4 條，整條巷子上千條）
    # x 方向內縮 2 cm：實例會在 x 方向縮放（窄的側窗縮到 0.27 倍），6 mm 縮完只剩 1.6 mm，遠處還是會閃（BUG-WZFLICKER-2，118 巷東側小巷旁的側窗）
    e = 0.006; ex = 0.02; rx0, rx1, ry0, ry1 = x0 + ex, x1 - ex, y0 + e, y1 - e
    rm.quad([(rx0, ry0, bk), (rx1, ry0, bk), (rx1, ry1, bk), (rx0, ry1, bk)])            # 後牆（朝外）
    rm.quad([(rx0, ry0, fz), (rx1, ry0, fz), (rx1, ry0, bk), (rx0, ry0, bk)])            # 地板（朝上）
    rm.quad([(rx0, ry1, bk), (rx1, ry1, bk), (rx1, ry1, fz), (rx0, ry1, fz)])            # 天花板（朝下）
    zs = -0.26                                                                             # 左右兩面從牆厚後面才開始：牆洞的兩側（−0.25～0）是牆面，不和房間的側牆重疊（窄窗縮放後也不會）
    rm.quad([(rx0, ry0, zs), (rx0, ry0, bk), (rx0, ry1, bk), (rx0, ry1, zs)])            # 左牆（朝 +x）
    rm.quad([(rx1, ry0, bk), (rx1, ry0, zs), (rx1, ry1, zs), (rx1, ry1, bk)])            # 右牆（朝 −x）
    gl = Mesh('win_glass', M['glass_lit'] if lit else M['win_glass']); gl.quad([(x0 + t, y0 + t, fz - 0.01), (x1 - t, y0 + t, fz - 0.01), (x1 - t, y1 - t, fz - 0.01), (x0 + t, y1 - t, fz - 0.01)])
    _WIN[key] = combine([rm.finish(None, uv=False), gl.finish(None)], f'window_{part}')
    return _WIN[key]


def potted_proto(kind, r, h, lift, size, n, seed, potm='pot_terra', prof='taper4'):
    """盆栽（instancing）：陶盆＋葉片卡。原點＝盆底中央；potm／prof：盆子的材質、形狀（ADE-V2.1：白瓷、水泥盆）"""
    random.seed(seed)
    pm = Mesh('pot', M[potm]); pot(pm, 0.0, 0.0, r, h, prof, y0=0.0, seg=8)   # 街上的盆栽：8 邊、4 點輪廓（Café 裡 18 邊）
    lv = Mesh('leaves', M[kind]); bush(lv, 0.0, lift, 0.0, size, n=n, span=0.45)
    return combine([pm.finish(None, smooth=True), lv.finish(None, uv=False)], f'potted_{kind}_{seed}')


def laundry_proto(seed):
    """鐵窗裡曬的衣服（instancing；原點同鐵窗：窗下緣下 0.14 m、牆面）：一支曬衣桿＋三到五件（T 恤、毛巾、長褲、襯衫），掛在鐵窗籠子裡"""
    rnd = random.Random(seed); m = L.CMesh('laundry', M['laundry']); z = 0.27; top = 1.56
    m.cbox(-1.1, 1.1, top + 0.01, top + 0.035, z - 0.012, z + 0.012, '#9aa0a3')                 # 曬衣桿
    cols = ['#f4f2ec', '#dfe6ee', '#7f9cc4', '#2f3e5c', '#9ea3a8', '#e7b8c2', '#d9c7a6', '#3d5a47', '#262626', '#c94f45']
    x = -1.0 + rnd.uniform(0, 0.15)
    while x < 0.85:
        kind = rnd.choice(('tee', 'tee', 'towel', 'pants', 'shirt')); c = rnd.choice(cols)
        if kind == 'towel': w_, h_ = rnd.uniform(0.28, 0.36), rnd.uniform(0.5, 0.65); m.poly([(x, top - h_, z), (x + w_, top - h_, z), (x + w_, top, z), (x, top, z)], c)
        elif kind == 'pants':
            w_, h_ = 0.36, rnd.uniform(0.7, 0.85); m.poly([(x, top - h_, z), (x + 0.16, top - h_, z), (x + 0.18, top - 0.3, z), (x + 0.2, top - h_, z), (x + w_, top - h_, z), (x + w_, top, z), (x, top, z)], c)
        else:
            w_, h_ = (0.46, rnd.uniform(0.55, 0.62)) if kind == 'tee' else (0.48, rnd.uniform(0.68, 0.75)); sl_ = 0.11 if kind == 'tee' else 0.05
            m.poly([(x + sl_, top - h_, z), (x + w_ - sl_, top - h_, z), (x + w_ - sl_, top - 0.24, z), (x + w_, top - 0.3 if kind == 'tee' else top - 0.62, z),
                    (x + w_, top - 0.06, z), (x + w_ * 0.62, top, z), (x + w_ * 0.38, top, z), (x, top - 0.06, z), (x, top - 0.3 if kind == 'tee' else top - 0.62, z), (x + sl_, top - 0.24, z)], c, rnd.uniform(0.9, 1.05))
        x += w_ + rnd.uniform(0.06, 0.16)
    return combine([m.finish(None, uv=False)], f'laundry_{seed}')


LAUNDRY = [laundry_proto(s) for s in (21, 22, 23)]
POT_FERN = [potted_proto('fern', 0.09, 0.16, 0.33, 0.32, 4, 11)] * 2   # 效能第二輪：兩個種子的蕨類盆栽合成一個原型（每個原型 2 次 draw call；擺的時候本來就各自轉向）
def broad_proto(r, h, seed, potm='pot_terra', prof='taper4', ph=0.62, pw=0.42, stems=3):
    """大葉盆栽（instancing）：陶盆＋土＋plants.py 的模型葉子（v6d：葉片卡的大葉子遠看像折紙）。原點＝盆底中央"""
    import plants as PL_
    if '_PLM_ST' not in globals():
        globals()['_PLM_ST'] = PL_.materials('wz_pl_')
        # 街上的大葉盆栽葉子調亮一點（ART-BALCONY-POTS，2026-10-21）：從街上往上看陽台時葉子在陽台的陰影裡，原本的深綠（#2f5130／#3f6a3a）幾乎是黑色剪影
        for k_, hx_ in (('leaf_dark', '#3d6a3a'), ('leaf_mid', '#55894a')):
            _PLM_ST[k_].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*PL_._srgb(hx_), 1.0)
    random.seed(seed)
    pm = Mesh('pot', M[potm]); pot(pm, 0.0, 0.0, r, h, prof, y0=0.0, seg=8); parts = [pm.finish(None, smooth=True)]
    tmp = B.group('tmp_pl', None)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=r * 0.95, radius2=r * 0.95, depth=0.02); bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(0.0, h - 0.03, 0.0)); B.mesh_obj('tmp_pl_soil', bm, _PLM_ST['soil'], tmp)
    PL_.broad_plant(B.mesh_obj, _PLM_ST, 'tmp_pl', tmp, 0.0, h - 0.02, 0.0, ph, pw, seed, stems=stems, leaf_n=4)   # 街上的盆栽遠看：3 根莖（室內 5 根）、葉子 4 段（室內 6）
    for ob in list(tmp.children):
        ob.parent = None
        if ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
        parts.append(ob)
    bpy.data.objects.remove(tmp)
    return combine(parts, f'potted_broad_{seed}')


POT_BROAD = broad_proto(0.16, 0.3, 13)
# ADE-V2.1（BB_255 第 4 點：門口的盆栽大多是同一種紅陶盆，D133 H）：白瓷、水泥盆，大小、高度都不同（放在 random.seed(707) 前面：不改後面的亂數）
M['pot_conc'] = L.flat('wz_pot_concrete', '#9d9b95', rough=0.92)
POT_TALL_W = broad_proto(0.19, 0.5, 17, potm='ceramic', prof='cyl', ph=0.95, pw=0.55, stems=4)   # 高的白瓷圓筒盆＋大葉（總高約 1.4 m）
POT_BROAD_W = broad_proto(0.15, 0.24, 23, potm='ceramic', prof='bowl', ph=0.5, pw=0.4)          # 白瓷碗形盆的矮大葉
POT_FERN_C = potted_proto('fern', 0.15, 0.26, 0.4, 0.4, 5, 19, potm='pot_conc', prof='cyl')     # 水泥圓筒盆的蕨類
random.seed(707)

# 累積的網格（同材質一個）：用 dict 依材質名取用
_acc = {}
def acc(mat, name=None):
    k = mat.name
    if k not in _acc: _acc[k] = Mesh(name or ('wz_' + k), mat)
    return _acc[k]


def acc_hi(mat):
    """公館七樓以上（LAWWW-C 10-20 決定：七樓以上不投影）：物件名開頭 NOSHADOW_，遊戲的 wzCastsShadow 看到就不投影；merge_by_material 的 key 讓它們和低樓層分開合併"""
    k = 'hi:' + mat.name
    if k not in _acc: _acc[k] = Mesh('NOSHADOW_wz_' + mat.name, mat)
    return _acc[k]


faces = []   # (名稱, 材質, 四點, 自訂屬性)
_inst = []


def face(name, mat, xf, pts, props):
    m = Mesh(name, mat); xf.quad(m, pts); faces.append((m, props))


def bake(mesh, tag, xf, x, y, z):
    """不用 instancing：放一份自己的網格（之後 merge_by_material 和同材質的零件合成一個）。數量少、三角形少的小東西
    （曬的衣服三款各一個原型＝三次 draw call）這樣比較省"""
    wx, _, wz = xf.p(x, 0, z); ob = bpy.data.objects.new(f'{tag}_{len(_inst)}', mesh.copy()); B.scene().collection.objects.link(ob)
    ob.location = g2b(wx, y, wz); ob.rotation_euler = (0, 0, xf.ry); ob.parent = root; _inst.append(1); return ob


def inst(mesh, tag, xf, x, y, z, sx=1.0):
    wx, _, wz = xf.p(x, 0, z); ob = B.instance(mesh, f'{tag}_{len(_inst)}', wx, y, wz, root, ry=xf.ry); _inst.append(1)
    if sx != 1.0: ob.scale = (sx, 1.0, 1.0)   # 建築自己的 x（寬度方向）
    if abs(y) < 0.05: prop_fp(mesh, tag, wx, wz, xf.ry, sx)
    return ob


# 地上的雜物腳印（世界座標，人貼牆走會不會穿過去）：輸出 <OUT>.props.json，tests/street_props_nav_unit.js 和遊戲的導航格比對（ART-WZ0，LAWWW2 2026-10-21）。
# 門口凸出牆面、又在人走得到的地方的，要在 zones3d.js 擋住那幾格（或移進門廊）。
PROP_FP, _bbc = [], {}
def prop_fp(mesh, tag, wx, wz, ry, sx=1.0):
    if mesh.name not in _bbc:
        vs = mesh.vertices
        if not len(vs): _bbc[mesh.name] = None
        else: _bbc[mesh.name] = (min(v.co.x for v in vs), max(v.co.x for v in vs), min(-v.co.y for v in vs), max(-v.co.y for v in vs), max(v.co.z for v in vs))
    bb = _bbc[mesh.name]
    if bb is None or bb[4] < 0.1: return                                                  # 貼地的薄片不算
    c, s_ = math.cos(ry), math.sin(ry); pts = [(wx + lx * sx * c + lz * s_, wz - lx * sx * s_ + lz * c) for lx in (bb[0], bb[1]) for lz in (bb[2], bb[3])]
    PROP_FP.append(dict(tag=tag, rect=[round(min(p[0] for p in pts), 3), round(min(p[1] for p in pts), 3), round(max(p[0] for p in pts), 3), round(max(p[1] for p in pts), 3)], h=round(bb[4], 2)))


def far_window(xf, x0, x1, y0, y1, lit, grille, band):
    """XS-FARVIEW-1105：遠景（新生南路兩頭、後排高樓）的窗。牆是每層一整片（flatwin：不挖窗洞），玻璃貼在牆面前 1.5 cm；
    亮燈那戶用 wz_room_lit（白天是深色、晚上發光，和近景同一個材質），其他是深灰藍的玻璃；窗台、鐵窗只做朝外的那一面（遠景只從街上看）。
    近景的做法（窗洞＋窗框、玻璃、窗簾 instancing＋鐵窗原型）一扇幾十到幾百個三角形，遠景幾千扇乘上去太多（第一版畫出來 26.6 萬）；這樣一扇 4 個，有鐵窗 20 個。"""
    gm = acc(M['room_lit'] if lit else flat('wz_far_glass', '#59636c', rough=0.18)); z = 0.015
    xf.quad(gm, [(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)])
    xf.quad(band, [(x0 - 0.06, y0, 0.07), (x1 + 0.06, y0, 0.07), (x1 + 0.06, y0, 0.0), (x0 - 0.06, y0, 0.0)])            # 窗台上面
    xf.quad(band, [(x0 - 0.06, y0 - 0.06, 0.07), (x1 + 0.06, y0 - 0.06, 0.07), (x1 + 0.06, y0, 0.07), (x0 - 0.06, y0, 0.07)])   # 窗台正面
    if grille:
        g = acc(M['grille']); d = 0.34
        for a, b in ((y0 - 0.12, y0 - 0.06), (y1 + 0.08, y1 + 0.14)): xf.quad(g, [(x0 - 0.08, a, d), (x1 + 0.08, a, d), (x1 + 0.08, b, d), (x0 - 0.08, b, d)])
        for k in range(5):
            xx = x0 - 0.05 + k * (x1 - x0 + 0.1) / 4; xf.quad(g, [(xx - 0.015, y0 - 0.06, d), (xx + 0.015, y0 - 0.06, d), (xx + 0.015, y1 + 0.08, d), (xx - 0.015, y1 + 0.08, d)])
        xf.quad(acc(M['corr']), [(x0 - 0.12, y1 + 0.14, d + 0.08), (x1 + 0.12, y1 + 0.14, d + 0.08), (x1 + 0.12, y1 + 0.32, 0.0), (x0 - 0.12, y1 + 0.32, 0.0)])   # 鐵窗頂上的浪板


def apartment(spec):
    xf, Wd, Dd = place(spec); F = spec['floors']; totalH = GH + (F - 1) * FH; rng = random.Random(sum(ord(c) * (i + 7) for i, c in enumerate(spec['id'])))   # 固定種子（Python 的 hash() 每次執行不同）
    lrng = random.Random(len(spec['id']) * 131 + ord(spec['id'][0]) * 7 + ord(spec['id'][1]))                                # 曬衣服用另一個亂數（不改變窗、冷氣的配置）
    kind = spec['wall']; wall = Mesh(f'wall_{spec["id"]}', wall_mat(kind))     # 這棟的外牆（一個物件，頂點色＝牆色）
    HI = GH + 5 * FH if (SET == 'gongguan' and F >= 7) else None                    # 公館七樓以上不投影（LAWWW-C 10-20）：七樓樓板以上的牆、樓板線、女兒牆、屋頂另外一個物件
    wall_hi = Mesh(f'NOSHADOW_wall_{spec["id"]}', wall_mat(kind)) if HI else wall
    gt = spec['ground']; rec = 1.3 if gt == 'shop' else (4.3 if gt == 'arcade' else 0.2)
    if SET == 'gongguan' and 'sf' not in spec and spec['id'] in SF_GG and gt == 'arcade': spec = dict(spec, sf=SF_GG[spec['id']])   # ART-GG-SHOPS-1018：公館騎樓店面（wz_shopkit.arcade_front_v2）
    if SET == 'lane118' and 'sf' not in spec and gt == 'shop' and spec.get('lane118') in SF_L118:   # ART-L118-FACADE-3D-1023（使用者 10-23「118店面…外觀還是很2D」）：118 巷九間店改用店面組件＋立體淺店內
        _sf = SF_L118[spec['lane118']]; spec = dict(spec, sf=_sf, shop=dict(spec['shop'], type=_sf.get('kind', spec['shop']['type'])))
    elif SET == 'lane118' and 'sf' not in spec and gt == 'shop' and spec.get('shop', {}).get('type') in SF_L118_FILL:   # 填空的小店（早餐、影印、洗衣、水果、二手書、文具）照店型
        spec = dict(spec, sf=SF_L118_FILL[spec['shop']['type']])
    if SET == 'wenzhou' and 'sf' not in spec:   # ART-WZ0（2026-10-16）：溫州街的店面組件（wz_shopkit.py）；公館照舊（騎樓另外一套 SF_GG）
        sfx = SF.get(spec['id']) or SF_HOUSE.get(spec['id']) or SF_SHUTTER.get(spec['id'])
        if sfx: spec = dict(spec, sf=sfx)
    if gt == 'shop' and spec.get('sf'): rec = spec['sf'].get('recess', 0.9) + (2.7 if spec['sf'].get('inner') else 1.3)   # 店門退縮成門廊；有立體淺店內的，一樓牆體從玻璃後 2.7 m 開始
    if gt == 'arcade' and spec.get('sf') and not spec['sf'].get('split'): rec = 3.0 + (DI + 0.12 if (spec['sf'].get('inner') or spec['sf'].get('kind') == 'tea') else 1.3)   # 公館騎樓店面：騎樓 3 m＋店內（茶飲的立體櫃台 DI、其他是景深卡 1.3）
    if gt == 'arcade' and spec.get('sf', {}).get('split'): rec = 3.0 + 2.6 + 0.02   # B5：騎樓 3 m＋後面兩間 2.6 m 深的立體小店；牆體再退 2 cm——原本和小店後牆同一個平面，從騎樓看進去會閃（BUG-WZFLICKER）
    if SET == 'wenzhou' and spec['id'] == 'W2' and 'xs_front' in globals(): spec = dict(spec, xs=OFFBEAT_XS)   # 日常失速（WZ-OFFBEAT-1104）
    if spec.get('xs'): rec = spec['xs'].get('dep', 3.5) + spec['xs'].get('back', 0.85)   # 新生南路：店面玻璃在騎樓 3.5 m 深的地方（xinsheng_layout arcade），店內景深 0.8 m
    W = Wd; D = Dd
    # ---- 樓上的窗：每層 n 扇（和套件相同的算法：n＝round(W/3.6)）
    n = max(1, round(W / 3.6)); ww = min(2.2, W / n - 0.9); wh = 1.5
    wins = []
    for f in range(1, F):
        yc = GH + (f - 1) * FH + FH * 0.52
        for i in range(n):
            x = -W / 2 + (i + 0.5) * W / n
            far = spec.get('far') or (SET == 'gongguan' and f >= 6)   # 遠景：只有窗＋少量鐵窗，沒有雨遮、冷氣（instancing 的原型整條巷子一組，任何鏡頭都整組畫出來：遠景加太多會超過三角形預算）
            # 公館 7 樓以上（X86 加高到 6～14 層）也用遠景的做法：從馬路看上去，鐵窗、冷氣、雨遮看不清楚，三角形不要跟著樓層一起長
            kind_ = 'balcony' if (spec.get('balcony') and i == n // 2 and f == 1) else ('grille' if rng.random() < (spec.get('p_grille', 0.15) * 0.4 if (far and not spec.get('far')) else spec.get('p_grille', 0.15 if far else 0.7)) else 'plain')   # p_*：每棟可調（公館商店街；預設和溫州街一樣）
            wins.append(dict(f=f, x=x, y0=yc - wh / 2, y1=yc + wh / 2, kind=kind_, hood=(not far and kind_ != 'grille' and rng.random() < 0.5), ac=(not far and rng.random() < spec.get('p_ac', 0.65)), lit=rng.random() < 0.35, acs=rng.choice((-1, 1))))
    for u in spec.get('xs_up', []):   # 新生南路：照參考圖的整排窗（蓋掉那一層這一段原本的窗）
        wins = [w for w in wins if not (w['kind'] != 'xs' and w['f'] == u['f'] and w['x'] + ww / 2 > u['x0'] - 0.3 and w['x'] - ww / 2 < u['x1'] + 0.3)]   # 只蓋掉原本的窗；同一層前面排好的 xs 窗不動（XS-TONGXIAN-SIGN-1111：同弦第二段「不開窗」把第一段的吉他櫥窗也刪掉了）
        wins.append(dict(f=u['f'], x=(u['x0'] + u['x1']) / 2, w=u['x1'] - u['x0'], y0=u['y0'], y1=u['y1'], kind='xs', tex=u['tex'], frame=u.get('frame'), solid=u.get('solid'), blank=u.get('blank'), tiles=u.get('tiles'), pane=u.get('pane', 1.4), hood=False, ac=False, lit=True, acs=1))
    if spec.get('xs', {}).get('panel'):   # 日常失速：二樓窗下就是招牌，那一層不掛冷氣、雨遮（原本冷氣蓋住「OFFBEAT」）
        for w in wins:
            if w['f'] == 1: w['ac'] = False; w['hood'] = False
    w2 = spec.get('sf', {}).get('win2f') if spec.get('sf') else None
    if w2:   # 木曜日（B4 二樓，ART-MOKUYOBI-1103）：二樓一整排木框窗（對齊店內 mokuyobi_layout.js 的 front.windows），蓋掉這一段原本的窗
        wins = [w for w in wins if not (w['f'] == 1 and w['x'] + ww / 2 > w2['x0'] - 0.3 and w['x'] - ww / 2 < w2['x1'] + 0.3)]
        wins.append(dict(f=1, x=(w2['x0'] + w2['x1']) / 2, w=w2['x1'] - w2['x0'], y0=w2['y0'], y1=w2['y1'], kind='mok', hood=False, ac=False, lit=True, acs=1))
    if SET in ('gongguan', 'lane118', 'tingzhou'):
        if spec.get('sign2f'): wins = [w for w in wins if w['f'] != 1]   # 二樓整面大招牌：二樓不開窗
        # 直立招牌（店的、樓上住戶的）旁邊的窗不加鐵窗、雨遮、冷氣（不然會穿過招牌）
        vs = []
        if gt in ('shop', 'arcade') and spec['shop'].get('vertical'): vs.append((W / 2 - 0.5, GH + 0.3, GH + 0.3 + spec['shop'].get('vlen', 2.6)))
        if spec.get('vtenant'): vs.append((-W / 2 + 0.5, GH + 0.3, GH + 0.3 + spec['vtenant']['len']))
        for w in wins:
            for vx, a, b in vs:
                if abs(w['x'] - vx) < 1.6 and w['y0'] - 1.0 < b and w['y1'] + 0.6 > a:
                    if w['kind'] == 'grille': w['kind'] = 'plain'
                    w['hood'] = False; w['ac'] = False
    # ---- 牆：一樓以上（留窗洞，牆厚 0.25）
    for f in range(1, F):
        y0 = GH + (f - 1) * FH; y1 = y0 + FH; wl = wall_hi if (HI and f >= 6) else wall
        ws = sorted([w for w in wins if w['f'] == f], key=lambda w: w['x'])
        if spec.get('flatwin'): xf.box(wl, -W / 2, W / 2, y0, y1, -0.25, 0); continue   # XS-FARVIEW-1105：遠景每層一整片牆（窗貼在牆面上，far_window）
        xs = [-W / 2] + [v for w in ws for v in (w['x'] - w.get('w', ww) / 2, w['x'] + w.get('w', ww) / 2)] + [W / 2]   # w：這扇窗自己的寬（木曜日的整排窗）
        for k in range(0, len(xs), 2): xf.box(wl, xs[k], xs[k + 1], y0, y1, -0.25, 0)
        for w in ws:   # 窗下的牆停在窗台裡面（低 1 cm）：原本牆頂和窗台頂同一個平面，一直閃（BUG-WZFLICKER）
            wv = w.get('w', ww); xf.box(wl, w['x'] - wv / 2, w['x'] + wv / 2, y0, w['y0'] - 0.01, -0.25, 0); xf.box(wl, w['x'] - wv / 2, w['x'] + wv / 2, w['y1'], y1, -0.25, 0)
            if w.get('blank'): xf.box(wl, w['x'] - wv / 2, w['x'] + wv / 2, w['y0'] - 0.01, w['y1'], -0.25, 0)   # 這一段不開窗：用同一種外牆補滿（原本在 xs_window 補一塊平塗的顏色，和周圍的牆不一樣、看得出一塊方形）
    xf.box(wall_hi, -W / 2, W / 2, totalH, totalH + 0.9, -0.2, 0)                                # 女兒牆
    band = acc(M['band']); band_hi = acc_hi(M['band']) if HI else band
    def tall(m, x0, x1, z0, z1):   # 側牆、後牆：從二樓一直到女兒牆頂；七樓以上那一段放進不投影的物件
        if HI: xf.box(m, x0, x1, GH, HI, z0, z1); xf.box(wall_hi, x0, x1, HI, totalH + 0.9, z0, z1)
        else: xf.box(m, x0, x1, GH, totalH + 0.9, z0, z1)
    for sd in (-1, 1):
        if spec.get('side_wins') == ('+x' if sd > 0 else '-x'): side_windows(spec, xf, wall, band, W, D, F, totalH, sd, rng, wall_hi=wall_hi, band_hi=band_hi, hi_f=6 if HI else None)   # 側面朝巷子：開窗
        elif sd < 0: tall(wall, -W / 2, -W / 2 + 0.2, -D, -0.25)
        else: tall(wall, W / 2 - 0.2, W / 2, -D, -0.25)
    tall(wall, -W / 2, W / 2, -D, -D + 0.2)
    if HI: xf.box(wall, -W / 2 + 0.2, W / 2 - 0.2, HI - 0.2, HI, -D + 0.2, -0.25)   # 七樓樓板（在樓裡面，看不到）：七樓以上不投影以後，陰影計算裡整棟樓沒有屋頂，下午太陽從頂上照進中空的樓、再從二到六樓的窗洞照出來，人行道上一排亮條（LAWWW2 巡場景第 4 區 10-22）；這塊會投影，把一到六樓蓋起來
    for f in range(1, F): xf.box(band_hi if (HI and f >= 6) else band, -W / 2 - 0.03, W / 2 + 0.03, GH + (f - 1) * FH - 0.09, GH + (f - 1) * FH + 0.09, -0.25, 0.08)
    xf.box(band_hi, -W / 2 - 0.04, W / 2 + 0.04, totalH + 0.9, totalH + 0.97, -0.26, 0.05)
    xf.box(acc_hi(M['roof']) if HI else acc(M['roof']), -W / 2 + 0.2, W / 2 - 0.2, totalH - 0.05, totalH + 0.05, -D + 0.2, -0.2)
    # ---- 窗（instancing）＋窗簾；鐵窗／雨遮／冷氣／陽台
    ac_at = []
    for w in wins:
        if w['kind'] == 'mok': mok_window(spec, xf, w); continue   # 木曜日二樓的木框窗（wz_shopkit.py）
        if w['kind'] == 'xs': xs_window(spec, xf, w); continue     # 新生南路照參考圖的整排窗
        x0, x1, y0, y1, cx = w['x'] - ww / 2, w['x'] + ww / 2, w['y0'], w['y1'], w['x']
        if spec.get('flatwin'): far_window(xf, x0, x1, y0, y1, w['lit'], w['kind'] == 'grille', band); continue   # XS-FARVIEW-1105：遠景的窗（不用 instancing 的窗框原型）
        inst(window_proto(wh, 'shell'), f'win_{spec["id"]}', xf, cx, y0, 0.0, sx=ww / WIN_W)
        inst(window_proto(wh, 'lit' if w['lit'] else 'dark'), f'pane_{spec["id"]}', xf, cx, y0, 0.0, sx=ww / WIN_W)
        cm = acc(M['curtain_lit'] if w['lit'] else M['curtain']); cw = ww * rng.uniform(0.3, 0.55)
        if rng.random() < 0.5: xf.quad(cm, [(x1 - cw, y0 + 0.03, -0.29), (x1 - 0.03, y0 + 0.03, -0.29), (x1 - 0.03, y1 - 0.05, -0.29), (x1 - cw, y1 - 0.05, -0.29)])
        else: xf.quad(cm, [(x0 + 0.03, y0 + 0.03, -0.29), (x0 + cw, y0 + 0.03, -0.29), (x0 + cw, y1 - 0.05, -0.29), (x0 + 0.03, y1 - 0.05, -0.29)])
        if w['kind'] == 'grille':
            inst(GRILLE, f'grille_{spec["id"]}', xf, cx, y0 - 0.14, 0.0); inst(HOOD, f'ghood_{spec["id"]}', xf, cx, y0 - 0.14 + 1.77, 0.0)
            if not spec.get('far') and lrng.random() < spec.get('p_laundry', 0.28): bake(LAUNDRY[lrng.randrange(3)], f'laundry_{spec["id"]}', xf, cx, y0 - 0.14, 0.0)   # p_laundry：ADE-V2.1 阿德樓上多曬一點衣服（BB_255 第 5 點）
            if not spec.get('far') and rng.random() < spec.get('p_pot', 0.6):
                npot = spec.get('pots_n', 1)   # ADE-V2-1104：阿德（參考圖 wz_ade_ext）鐵窗裡一排盆栽——一扇窗放 npot 盆，蕨類和大葉輪流、間距和角度不一樣
                for k_ in range(npot):
                    px_ = (cx + rng.uniform(-0.9, 0.9)) if npot == 1 else (cx - 0.95 + (k_ + 0.5) * 1.9 / npot + rng.uniform(-0.12, 0.12)); pz_ = rng.uniform(0.16, 0.28); q = xf.p(px_, 0, pz_)
                    pm_ = POT_FERN[rng.randrange(2)] if (npot == 1 or k_ % 2 == 0) else POT_BROAD
                    if spec.get('pot_mix'): pm_ = (POT_FERN[0], POT_BROAD_W, POT_FERN_C, POT_BROAD)[(k_ + int(abs(cx) * 3)) % 4]   # ADE-V2.1：紅陶、白瓷、水泥盆混著放（上面那行照舊用掉亂數，後面的配置不變）
                    B.instance(pm_, f'pot_{spec["id"]}_{len(_inst)}', q[0], y0 - 0.11, q[2], root, ry=rng.uniform(0, 2 * math.pi)); _inst.append(1)
        elif w['kind'] == 'balcony':
            bx0, bx1, bd = x0 - 0.6, x1 + 0.6, 1.05; xf.box(band, bx0, bx1, y0 - 0.3, y0 - 0.16, -0.25, bd)
            xf.box(wall, bx0, bx1, y0 - 0.16, y0 + 0.4, bd - 0.12, bd); xf.box(wall, bx0, bx0 + 0.12, y0 - 0.16, y0 + 0.4, 0, bd); xf.box(wall, bx1 - 0.12, bx1, y0 - 0.16, y0 + 0.4, 0, bd)
            rl = acc(M['grille']); xx = bx0 + 0.06
            while xx < bx1 - 0.05: xf.box(rl, xx - 0.01, xx + 0.01, y0 + 0.4, y0 + 0.92, bd - 0.07, bd - 0.05); xx += 0.13
            xf.box(rl, bx0, bx1, y0 + 0.9, y0 + 0.94, bd - 0.09, bd - 0.03)
            # 盆栽放在鐵花架上（ART-BALCONY-POTS，2026-10-21）：原本放在陽台地上，56 cm 的女兒牆＋欄杆擋住，從街上幾乎看不到；
            # 花架高 36 cm、貼著欄杆（離欄杆 0.12 m），葉子露出欄杆上緣——台北老公寓陽台常見的擺法
            sy0, sy1, sz0, sz1 = y0 - 0.16, y0 + 0.2, bd - 0.5, bd - 0.2
            xf.box(rl, bx0 + 0.25, bx1 - 0.25, sy1 - 0.025, sy1, sz0, sz1)                                  # 架面
            for lx in (bx0 + 0.28, (bx0 + bx1) / 2, bx1 - 0.28):
                for lz in (sz0 + 0.02, sz1 - 0.02): xf.box(rl, lx - 0.012, lx + 0.012, sy0, sy1 - 0.025, lz - 0.012, lz + 0.012)   # 腳
            xf.box(rl, bx0 + 0.28, bx1 - 0.28, sy0 + 0.1, sy0 + 0.12, sz0 + 0.01, sz0 + 0.03)              # 下面的橫撐
            for k in range(3):
                q = xf.p(bx0 + 0.55 + k * (bx1 - bx0 - 1.1) / 2, 0, (sz0 + sz1) / 2)
                B.instance(POT_BROAD, f'bpot_{spec["id"]}_{len(_inst)}', q[0], sy1, q[2], root, ry=rng.uniform(0, 2 * math.pi)); _inst.append(1)
        elif w['hood']:
            inst(HOOD, f'hood_{spec["id"]}', xf, cx, y1 + 0.18, 0.0)
        if w['ac'] and w['kind'] != 'balcony':
            ax = cx + w['acs'] * (ww / 2 + 0.55)
            if -W / 2 + 0.5 < ax < W / 2 - 0.5 and not any(f_ == w['f'] and abs(ax - x_) < 0.9 for (f_, x_) in ac_at):   # 兩扇窗中間只放一台（原本左右兩扇各放一台、疊在一起，會閃）
                ac_at.append((w['f'], ax)); inst(AC, f'ac_{spec["id"]}', xf, ax, y0 - 0.2, 0.0)
                xf.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)
    # ---- 頂樓：水塔、頂樓加蓋
    if spec.get('roofAdd'):
        aw, ad = W * 0.7, D * 0.55; ra = acc_hi(M['corr']) if HI else acc(M['corr']); xf.box(ra, -aw / 2, aw / 2, totalH, totalH + 2.4, -D * 0.5 - ad / 2, -D * 0.5 + ad / 2)
        xf.box(band_hi, -aw / 2 - 0.15, aw / 2 + 0.15, totalH + 2.4, totalH + 2.5, -D * 0.5 - ad / 2 - 0.15, -D * 0.5 + ad / 2 + 0.15)
    elif spec.get('tank', True):
        tx = rng.uniform(-W / 2 + 1.5, W / 2 - 1.5); wx, _, wz = xf.p(tx, 0, -D * 0.45); B.instance(TANK, f'tank_{spec["id"]}', wx, totalH, wz, root, ry=xf.ry)
    if SET == 'wenzhou' and spec['id'] in REAR: rear_facade(spec, xf, W, D, F, totalH)   # 背面對著小公園（ART-WZ1）
    upper_signs(spec, xf, W, totalH)
    # ---- 一樓：牆體和樓上同一種外牆（側面露在巷口時不會變成另一種材質）；店面兩側的石材壁柱
    if SET == 'wenzhou' and spec['id'] == 'A2' and 'copy_corner_carve' in globals(): copy_corner_carve(xf, wall, W, D, rec)   # ART-WZ6：東側（北巷）挖出阿德影印搬過來的轉角店面（wz_shopkit.py）
    elif spec.get('xs', {}).get('stair'):   # 新生南路同弦樂器：樓梯口那一段挖開（裡面的踏階在 wz_shopkit.xs_stair）
        st = spec['xs']['stair']; dz = spec['xs'].get('dep', 3.5) + st['depth']
        xf.box(wall, -W / 2, st['x0'], 0, GH, -D, -rec); xf.box(wall, st['x1'], W / 2, 0, GH, -D, -rec); xf.box(wall, st['x0'], st['x1'], GH - 0.38, GH, -D, -rec); xf.box(wall, st['x0'], st['x1'], 0, GH - 0.38, -D, -dz)
    elif spec.get('xs', {}).get('int3d'):   # 日常失速（W2）有立體店內（SHOP-WINDOW-2D-1105）：一樓量體只留店內後面那一段（室內 z −5～5＝本地 z −10～0），北面窗兩側是薄牆
        sd = spec['xs']['side']; xg = W / 2 - sd.get('dep', 0.3); IZ = -10.0
        xf.box(wall, -W / 2, W / 2, 0, GH, -D, IZ)
        xf.box(wall, xg + 0.05, W / 2, 0, GH, IZ, sd['z0']); xf.box(wall, xg + 0.05, W / 2, 0, GH, sd['z1'], -rec)
        xf.box(wall, xg + 0.05, W / 2, sd.get('glass_h', 3.1) + 0.08, GH, sd['z0'], sd['z1'])   # 窗上的牆
    elif spec.get('xs', {}).get('side'):   # 日常失速（W2）：側面（本地 x＝+W/2）的落地窗那一段挖進去 dep＋0.85 m（裡面是 wz_shopkit.xs_side_window 的景深卡）
        sd = spec['xs']['side']; xi = W / 2 - sd.get('dep', 0.3) - 0.85
        xf.box(wall, -W / 2, xi, 0, GH, -D, -rec); xf.box(wall, xi, W / 2, 0, GH, -D, sd['z0']); xf.box(wall, xi, W / 2, 0, GH, sd['z1'], -rec)
        xf.box(wall, xi, W / 2, sd.get('glass_h', 3.1) + 0.08, GH, sd['z0'], sd['z1'])   # 窗上的牆
    elif spec.get('sf', {}).get('side_glass'):   # SUNNY SIDE（B7）東側（本地 x＝+W/2，朝 2:30 AM 路口）照參考圖的轉角落地窗（BB 11-04 06:43；數字和 AA 室內右牆同一組，wz_shopkit.side_glass）
        sg = spec['sf']['side_glass']; xi = W / 2 - sg.get('dep', 0.15) - 0.85; z0, z1 = sg['z0'], sg['z1']
        xf.box(wall, -W / 2, xi, 0, GH, -D, -rec); xf.box(wall, xi, W / 2, 0, GH, -D, z0)
        xf.box(wall, xi, W / 2, sg.get('head', 2.6) + 0.08, GH, z0, -rec)
        side_glass(spec, xf, W, rec, wall)
    elif spec.get('sf', {}).get('stair_open'):   # 木曜日（B4）：鐵門打開，一樓牆體挖出往上的樓梯間（裡面的樓梯在 wz_shopkit.mok_stair_entry）
        so = spec['sf']; sx0, sx1 = so['door_x'] - so['door_w'] / 2, so['door_x'] + so['door_w'] / 2; dep, ph = so['stair_open']['depth'], GH - 0.05
        xf.box(wall, -W / 2, sx0, 0, GH, -D, -rec); xf.box(wall, sx1, W / 2, 0, GH, -D, -rec); xf.box(wall, sx0, sx1, ph, GH, -D, -rec); xf.box(wall, sx0, sx1, 0, ph, -D, -rec - dep)
    elif spec.get('xs', {}).get('lane'):   # 巷口（GG-G10-LANE-MOUTH-1111）：一樓牆體在通道的範圍打開（通道的側牆、樓板底、地面在 wz_shopkit.gg_front 的 lane）
        _lw = spec['xs'].get('lane_w', 4.6) / 2 + 0.22
        xf.box(wall, -W / 2, -_lw, 0, GH, -D, -rec); xf.box(wall, _lw, W / 2, 0, GH, -D, -rec); xf.box(wall, -_lw, _lw, GH - 0.33, GH, -D, -rec)
    else: xf.box(wall, -W / 2, W / 2, 0, GH, -D, -rec)                                                  # 一樓牆體（店面退縮）
    gw = acc(M['gwall'])
    if gt in ('shop', 'arcade') and not spec.get('sf') and spec.get('xs', {}).get('arcade', True) is not False:   # 日常失速的兩端是牆（xs_street_front 自己做），不加石材壁柱（同一個面會閃）
        r0 = 3.0 if gt == 'arcade' else 0.0
        # 公館的騎樓：店與店之間的壁柱貼和柱子一樣的磁磚（磨石子在騎樓裡近看是一大片斑點，像髒汙；溫州街照舊）
        pm = acc(M['pillar']) if (gt == 'arcade' and SET == 'gongguan') else gw
        for sx in (-1, 1): xf.box(pm, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0, GH, -rec, -r0)
    else:                                                                                          # 住家／鐵捲門：牆腳的磨石子護牆
        # 鐵捲門、住家鐵門的地方不做護牆：原本護牆整條橫過去，門片／捲門片正好在護牆正面的同一個平面上，下面 0.9 m 一直閃（BUG-WZFLICKER）
        gaps = [(-W / 2 + 0.4, W / 2 - 0.4)] if gt == 'shutter' else ([(-W * 0.2 - 0.72, -W * 0.2 + 0.72)] if not spec.get('sf') else [])
        if spec.get('xs', {}).get('lane'): _lw = spec['xs'].get('lane_w', 4.6) / 2 + 0.22; gaps = [(-_lw, _lw)]   # 巷口：通道的範圍不做護牆
        xs_ = [-W / 2] + [v for g_ in gaps for v in g_] + [W / 2]
        for k in range(0, len(xs_), 2):
            if xs_[k + 1] - xs_[k] > 0.01: xf.box(gw, xs_[k], xs_[k + 1], 0, 0.9, -rec - 0.02, -rec + 0.04)
    xf.box(band, -W / 2, W / 2, GH - 0.12, GH, -0.25, 0.06)
    if gt == 'arcade' and spec.get('sf', {}).get('split'): arcade_split_v2(spec, xf, W, wall)
    elif gt == 'arcade' and spec.get('sf'): arcade_front_v2(spec, xf, W, wall)
    elif spec.get('xs'): xs_front(spec, xf, W, wall)   # 新生南路（ART-XINSHENG-FRONTS-1104）；溫州街日常失速（W2，非騎樓）
    elif gt in ('shop', 'arcade'): shopfront_v2(spec, xf, W, gt, wall) if (spec.get('sf') and gt == 'shop') else shopfront(spec, xf, W, gt)
    elif gt == 'shutter':
        shutter(spec, xf, W, rec)
        if spec.get('sf'): shutter_v2(spec, xf, W, rec)
    else:
        housefront_v2(spec, xf, W, rng, rec) if spec.get('sf') else housedoor(spec, xf, W, rng, rec)
    set_tint(wall.finish(root), spec['color'], kind)
    if HI and wall_hi is not wall and not wall_hi.empty(): set_tint(wall_hi.finish(root), spec['color'], kind)


def vsign(xf, sid, vx, vy0, vy1, props):
    """直立招牌（突出牆面，兩面都有字）＋上下鐵架"""
    xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy1 + 0.02, vy1 + 0.08, 0.0, 0.95); xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy0 - 0.08, vy0 - 0.02, 0.0, 0.95)
    xf.box(acc(M['ac']), vx - 0.07, vx + 0.07, vy0, vy1, 0.18, 0.92)
    face(f'VSIGN_FACE_{sid}_a', M['board'], xf, [(vx + 0.075, vy0, 0.92), (vx + 0.075, vy0, 0.18), (vx + 0.075, vy1, 0.18), (vx + 0.075, vy1, 0.92)], props)
    face(f'VSIGN_FACE_{sid}_b', M['board'], xf, [(vx - 0.075, vy0, 0.18), (vx - 0.075, vy0, 0.92), (vx - 0.075, vy1, 0.92), (vx - 0.075, vy1, 0.18)], props)


def upper_signs(spec, xf, W, totalH):
    """公館：樓上住戶的招牌（套件沒有）——另一側的直立招牌、二樓整面大招牌、屋頂廣告看板（鐵架）。字都由遊戲畫（SIGN_FACE／VSIGN_FACE），晚上會亮"""
    vt = spec.get('vtenant'); HAS = lambda k: bool(k) and 'SIGN_ATLAS' in globals() and k in SIGN_ATLAS
    if vt and HAS(vt.get('vatlas')): vsign_tex(xf, spec['id'] + '_t', vt['vatlas'], -W / 2 + 0.5, GH + 0.3, vw=0.74)   # 設計稿：0.74 m 寬、長度照圖（2.6／4.2 m）
    elif vt: vsign(xf, spec['id'] + '_t', -W / 2 + 0.5, GH + 0.3, GH + 0.3 + vt['len'], {k: vt[k] for k in ('vertical', 'vBg', 'vColor', 'vBand')} | {'serif': 0})
    s2 = spec.get('sign2f')
    if s2:   # 板子＋框離牆 0.16 m；店的直立招牌那一側讓出來（鐵架穿過板子）
        xa = -W / 2 + 0.4; xb = W / 2 - (1.1 if spec['shop'].get('vertical') else 0.4); y0 = GH + 0.35; y1 = GH + FH - 0.3
        xf.box(acc(M['alu']), xa - 0.06, xb + 0.06, y0 - 0.06, y1 + 0.06, 0.0, 0.16)
        if HAS(s2.get('atlas')):   # 設計稿貼滿板面（BB-B 照這個板面的尺寸補過比例）
            it_ = SIGN_ATLAS[s2['atlas']]; uvquad(f'sk_sign2f_{spec["id"]}', SK['sign_lit'] if it_['lit'] else SK['sign'], [xf.p(xa, y0, 0.165), xf.p(xb, y0, 0.165), xf.p(xb, y1, 0.165), xf.p(xa, y1, 0.165)], tuple(it_['uv']))
            if it_['lit']: CL.glow(root, 'signbox', *xf.p((xa + xb) / 2, (y0 + y1) / 2, 0.8), color='rgba(255,250,235,1)', size=3.2, day=0.0, night=0.5)
        else: face(f'SIGN_FACE_{spec["id"]}_2F', M['board'], xf, [(xa, y0, 0.165), (xb, y0, 0.165), (xb, y1, 0.165), (xa, y1, 0.165)],
             {'sign': s2['sign'], 'sub': s2['sub'], 'bg': s2['bg'], 'color': s2['color'], 'serif': 0, 'band': s2['band']})
    rs = spec.get('roofsign')
    if rs:   # 屋頂廣告看板：三根立柱＋往後的斜撐＋兩道橫桿、板子朝馬路（離女兒牆 1.6 m）
        bw = min(9.0, W - 1.2); zb = -1.6; yb0 = totalH + 1.5; yb1 = yb0 + 2.4; st = acc(M['metal'])
        for px in (-bw / 2 + 0.6, 0.0, bw / 2 - 0.6):
            xf.box(st, px - 0.07, px + 0.07, totalH, yb1 + 0.1, zb - 0.22, zb - 0.08)
            xf.cyl(st, (px, totalH, zb - 2.6), (px, yb0 + 1.2, zb - 0.15), 0.045, seg=6)
        for y in (yb0 + 0.15, yb1 - 0.15): xf.box(st, -bw / 2, bw / 2, y - 0.05, y + 0.05, zb - 0.2, zb - 0.08)
        xf.box(acc(M['alu']), -bw / 2 - 0.08, bw / 2 + 0.08, yb0 - 0.08, yb1 + 0.08, zb - 0.08, zb)
        if HAS(rs.get('atlas')):
            it_ = SIGN_ATLAS[rs['atlas']]; uvquad(f'sk_signroof_{spec["id"]}', SK['sign_lit'] if it_['lit'] else SK['sign'], [xf.p(-bw / 2, yb0, zb + 0.005), xf.p(bw / 2, yb0, zb + 0.005), xf.p(bw / 2, yb1, zb + 0.005), xf.p(-bw / 2, yb1, zb + 0.005)], tuple(it_['uv']))
        else: face(f'SIGN_FACE_{spec["id"]}_roof', M['board'], xf, [(-bw / 2, yb0, zb + 0.005), (bw / 2, yb0, zb + 0.005), (bw / 2, yb1, zb + 0.005), (-bw / 2, yb1, zb + 0.005)],
             {'sign': rs['sign'], 'sub': rs['sub'], 'bg': rs['bg'], 'color': rs['color'], 'serif': 0, 'band': rs['band']})


def side_windows(spec, xf, wall, band, W, D, F, totalH, sd, rng, wall_hi=None, band_hi=None, hi_f=None):
    """側牆開窗（公館：朝往溫州街巷子的那一面）。側牆自己的座標：x'＝沿著牆、+z'＝朝外、原點在側牆外面的中央；窗和正面同一套原型"""
    ox, _, oz = xf.p(sd * W / 2, 0, -(D + 0.25) / 2); sx_ = Xf(ox, oz, xf.ry + sd * math.pi / 2)
    Ls = D - 0.25; n = max(1, round(Ls / 3.6)); ww = min(2.2, Ls / n - 0.9); wh = 1.5; T = 0.25
    wins = []
    for f in range(1, F):
        yc = GH + (f - 1) * FH + FH * 0.52
        for i in range(n): wins.append(dict(f=f, x=-Ls / 2 + (i + 0.5) * Ls / n, y0=yc - wh / 2, y1=yc + wh / 2, grille=rng.random() < spec.get('p_grille', 0.5), lit=rng.random() < 0.35, ac=rng.random() < 0.4, acs=rng.choice((-1, 1))))
    for f in range(1, F):
        y0 = GH + (f - 1) * FH; y1 = y0 + FH; ws = sorted([w for w in wins if w['f'] == f], key=lambda w: w['x'])
        xs = [-Ls / 2] + [v for w in ws for v in (w['x'] - ww / 2, w['x'] + ww / 2)] + [Ls / 2]
        wl = wall_hi if (hi_f and f >= hi_f) else wall; bd = band_hi if (hi_f and f >= hi_f) else band
        if spec.get('flatwin'): sx_.box(wl, -Ls / 2, Ls / 2, y0, y1, -T, 0)   # XS-FARVIEW-1105：遠景每層一整片牆
        else:
            for k in range(0, len(xs), 2): sx_.box(wl, xs[k], xs[k + 1], y0, y1, -T, 0)
            for w in ws: sx_.box(wl, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'] - 0.01, -T, 0); sx_.box(wl, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -T, 0)   # 窗下的牆停在窗台裡面
        # 樓板線：往正面多伸 0.325 m 接到正面的樓板線（側牆座標 sd<0 時正面在 +x'）。比正面的薄 1 cm、停在正面樓板線的前緣後 5 mm：
        # 重疊的地方不能有同一個平面上的面（Cycles 會變黑、遊戲裡會閃爍）
        if f > 1: sx_.box(bd, -Ls / 2 - (0.325 if sd > 0 else 0), Ls / 2 + (0.325 if sd < 0 else 0), y0 - 0.085, y0 + 0.085, -T, 0.08)
    sx_.box(wall_hi if hi_f else wall, -Ls / 2 - (0.05 if sd > 0 else 0), Ls / 2 + (0.05 if sd < 0 else 0), totalH, totalH + 0.9, -T, 0)   # 女兒牆：接到正面的女兒牆（正面的在 z −0.2…0，原本中間有 5 cm 的縫）
    ac_at = []
    for w in wins:
        cx, y0, y1 = w['x'], w['y0'], w['y1']; x0, x1 = cx - ww / 2, cx + ww / 2
        if spec.get('flatwin'): far_window(sx_, x0, x1, y0, y1, w['lit'], w['grille'], band); continue
        inst(window_proto(wh, 'shell'), f'swin_{spec["id"]}', sx_, cx, y0, 0.0, sx=ww / WIN_W)
        inst(window_proto(wh, 'lit' if w['lit'] else 'dark'), f'spane_{spec["id"]}', sx_, cx, y0, 0.0, sx=ww / WIN_W)
        cm = acc(M['curtain_lit'] if w['lit'] else M['curtain']); cw = ww * rng.uniform(0.3, 0.55)
        if rng.random() < 0.5: sx_.quad(cm, [(x1 - cw, y0 + 0.03, -0.29), (x1 - 0.03, y0 + 0.03, -0.29), (x1 - 0.03, y1 - 0.05, -0.29), (x1 - cw, y1 - 0.05, -0.29)])
        else: sx_.quad(cm, [(x0 + 0.03, y0 + 0.03, -0.29), (x0 + cw, y0 + 0.03, -0.29), (x0 + cw, y1 - 0.05, -0.29), (x0 + 0.03, y1 - 0.05, -0.29)])
        if w['grille']: inst(GRILLE, f'sgrille_{spec["id"]}', sx_, cx, y0 - 0.14, 0.0); inst(HOOD, f'sghood_{spec["id"]}', sx_, cx, y0 - 0.14 + 1.77, 0.0)
        elif w['ac']:
            ax = cx + w['acs'] * (ww / 2 + 0.55)
            if -Ls / 2 + 0.5 < ax < Ls / 2 - 0.5 and not any(f_ == w['f'] and abs(ax - x_) < 0.9 for (f_, x_) in ac_at):
                ac_at.append((w['f'], ax)); inst(AC, f'sac_{spec["id"]}', sx_, ax, y0 - 0.2, 0.0); sx_.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)


def shopfront(spec, xf, W, gt):
    s = spec['shop']; dep = 3.0 if gt == 'arcade' else 0.0; iw = W - 0.6; ih = GH - 0.9; fr = frame_mat(s.get('frame', '#3b2a1e'))
    # 店內景深卡（後退 1.2 m）：遊戲貼 TK.interiorTex(店種)
    face(f'INTERIOR_FACE_{spec["id"]}', M['board'], xf, [(-iw / 2, 0.15, -1.2 - dep), (iw / 2, 0.15, -1.2 - dep), (iw / 2, ih + 0.15, -1.2 - dep), (-iw / 2, ih + 0.15, -1.2 - dep)], {'interior': s['type']})
    fl = acc(M['gwall']); xf.box(fl, -iw / 2, iw / 2, 0, 0.15, -1.3 - dep, -dep)
    # 店內兩側的牆：公館用淺米色素面（和騎樓天花板同一個頂點色材質，套件原本也是淺米色素面）；Café 的灰泥貼圖在騎樓陰影＋玻璃後面變成深褐色斑點
    for sx in (-1, 1): xf.box(acc(M['ceilA'] if SET == 'gongguan' else M['plaster']), sx * iw / 2 - 0.03, sx * iw / 2 + 0.03, 0.15, ih + 0.15, -1.2 - dep, -dep)
    f_ = acc(fr)
    xf.box(f_, -W / 2, W / 2, ih + 0.15, ih + 0.4, -dep - 0.12, -dep + 0.12)
    for sx in (-0.5, -0.17, 0.17, 0.5): xf.box(f_, sx * iw - 0.05, sx * iw + 0.05, 0.15, ih + 0.15, -dep - 0.06, -dep + 0.06)
    xf.box(f_, -iw / 2, iw / 2, 0.1, 0.18, -dep - 0.06, -dep + 0.08)
    xf.quad(acc(M['glass']), [(-iw / 2, 0.18, -dep + 0.01), (iw / 2, 0.18, -dep + 0.01), (iw / 2, ih + 0.15, -dep + 0.01), (-iw / 2, ih + 0.15, -dep + 0.01)])
    if gt == 'arcade' and spec.get('rollbox'):   # 公館：鐵捲門箱（白天捲門收在店面上方的箱子裡）；在頭頂以上，不加導軌（騎樓走得到店面玻璃前 0.4 m，導軌會穿過人物）
        xf.box(acc(M['alu']), -iw / 2 - 0.1, iw / 2 + 0.1, ih + 0.18, GH - 0.37, -dep + 0.12, -dep + 0.42)
    # 橫招牌（板面＋框）
    sw = min(W - 0.4, 6.5); sy0, sy1 = GH - 0.67, GH - 0.03
    if s.get('atlas') and 'SIGN_ATLAS' in globals() and s['atlas'] in SIGN_ATLAS:   # 設計稿招牌（貼圖集）：鋁框燈箱＋設計稿，不留 SIGN_FACE（遊戲不再用 canvas 字蓋過去）
        h_ = sy1 - sy0 + 0.08; w_ = min(sw, h_ * SIGN_ATLAS[s['atlas']]['aspect'])
        xf.box(acc(SK['alu2']), -w_ / 2 - 0.03, w_ / 2 + 0.03, sy0 - 0.07, sy0 - 0.04 + h_ + 0.03, 0.0, 0.2)
        sign_tex(xf, s['atlas'], 0.0, sy0 - 0.04, w_, 0.204, f'sk_sign_{spec["id"]}')
        if SIGN_ATLAS[s['atlas']]['lit']: CL.glow(root, 'signbox', *xf.p(0.0, (sy0 + sy1) / 2, 0.6), color='rgba(255,250,235,1)', size=2.2, day=0.0, night=0.55)
    else:
      xf.box(acc(fr), -sw / 2 - 0.05, sw / 2 + 0.05, sy0 - 0.04, sy1 + 0.04, 0.0, 0.1)
      face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, 0.105), (sw / 2, sy0, 0.105), (sw / 2, sy1, 0.105), (-sw / 2, sy1, 0.105)],
         {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
    # 直立招牌（突出牆面，兩面都有字）＋鐵架
    if s.get('vatlas') and 'SIGN_ATLAS' in globals() and s['vatlas'] in SIGN_ATLAS:   # 設計稿直立招牌（使用者生成、BB-B 通過）：0.74×2.60 m，兩面貼圖，不留 VSIGN_FACE
        vsign_tex(xf, spec['id'], s['vatlas'], W / 2 - 0.5, GH + 0.3, vw=0.74)
    elif s.get('vertical'):
        vx = W / 2 - 0.5; vy0, vy1 = GH + 0.3, GH + 0.3 + s.get('vlen', 2.6)   # vlen：汀州路的直立燈箱 2.6～6 m（參考圖 5、6：跨兩三層樓）
        xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy1 + 0.02, vy1 + 0.08, 0.0, 0.95); xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy0 - 0.08, vy0 - 0.02, 0.0, 0.95)
        xf.box(acc(M['ac']), vx - 0.07, vx + 0.07, vy0, vy1, 0.18, 0.92)
        vp = {'vertical': s['vertical'], 'vBg': s.get('vBg', '#ffffff'), 'vColor': s.get('vColor', '#b0332a'), 'vBand': s.get('vBand', '#b0332a'), 'serif': 1 if s.get('serif') else 0}
        face(f'VSIGN_FACE_{spec["id"]}_a', M['board'], xf, [(vx + 0.075, vy0, 0.92), (vx + 0.075, vy0, 0.18), (vx + 0.075, vy1, 0.18), (vx + 0.075, vy1, 0.92)], vp)
        face(f'VSIGN_FACE_{spec["id"]}_b', M['board'], xf, [(vx - 0.075, vy0, 0.18), (vx - 0.075, vy0, 0.92), (vx - 0.075, vy1, 0.92), (vx - 0.075, vy1, 0.18)], vp)
    # 帆布雨遮（斜的，有前緣垂邊）
    if s.get('awning'):
        am = awning_mat(s['awning']); aw = W - 0.4; ay0, ay1, ad = GH - 0.75, GH - 1.25, 1.2
        m = acc(am); xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)][::-1])
        xf.quad(m, [(-aw / 2, ay0, 0.02), (aw / 2, ay0, 0.02), (aw / 2, ay1, ad), (-aw / 2, ay1, ad)])
        xf.box(m, -aw / 2, aw / 2, ay1 - 0.22, ay1, ad - 0.01, ad + 0.01)
        for sx in (-1, 1): xf.cyl(acc(M['metal']), (sx * aw / 2, ay0 + 0.05, 0.02), (sx * aw / 2, ay1 + 0.02, ad), 0.015, seg=5)
    # 騎樓：上面樓板延伸到街邊、兩端柱子、地坪、天花板日光燈
    if gt == 'arcade':
        xf.box(acc(M['ceilA']), -W / 2, W / 2, GH - 0.35, GH - 0.12, -dep, 0.0)
        for sx in spec.get('pillars', (-W / 2 + 0.3, W / 2 - 0.3)): xf.box(acc(M['pillar']), sx - 0.275, sx + 0.275, 0.05, GH - 0.35, -0.575, -0.025)   # 公館：柱子照套件的位置（店與店的分界）
        xf.box(acc(M['sidewalk']), -W / 2, W / 2, 0.0, 0.05, -dep, 0.0)
        nl = max(1, round(W / 2.5))
        for k in range(nl):
            tx = -W / 2 + (k + 0.5) * W / nl; xf.box(acc(M['tube']), tx - 0.6, tx + 0.6, GH - 0.38, GH - 0.35, -dep * 0.55 - 0.05, -dep * 0.55 + 0.05)


def shutter(spec, xf, W, rec):
    """鐵捲門：門片貼在一樓牆面前（退縮 rec）、上方捲門箱、兩側導軌"""
    z = -rec + 0.04; sm = acc(M['shutter'])
    xf.quad(sm, [(-W / 2 + 0.4, 0.05, z), (W / 2 - 0.4, 0.05, z), (W / 2 - 0.4, GH - 0.55, z), (-W / 2 + 0.4, GH - 0.55, z)])
    xf.box(acc(M['alu']), -W / 2 + 0.3, W / 2 - 0.3, GH - 0.62, GH - 0.27, -rec, -rec + 0.3)
    for sx in (-1, 1): xf.box(acc(M['alu']), sx * (W / 2 - 0.4) - 0.04, sx * (W / 2 - 0.4) + 0.04, 0.0, GH - 0.55, -rec, -rec + 0.08)


def housedoor(spec, xf, W, rng, rec):
    """住家：鐵門（凸起方框）、門把、門口台階、信箱、門燈、小窗（一半有鐵窗）。全部貼在一樓牆面（退縮 rec）前"""
    dc = door_mat(spec.get('door', '#9c2f2a')); dx = -W * 0.2; z = -rec
    d = acc(dc); xf.box(d, dx - 0.7, dx + 0.7, 0.05, 2.35, z - 0.02, z + 0.03)
    for k in range(3):                                   # 鐵門上的凸起方框（台灣老公寓常見的造型鐵門）
        y = 0.25 + k * 0.72; xf.box(d, dx - 0.58, dx + 0.58, y, y + 0.55, z + 0.03, z + 0.05)
    xf.box(acc(M['brass']), dx + 0.48, dx + 0.53, 1.0, 1.25, z + 0.05, z + 0.09)
    xf.box(acc(M['base']), dx - 0.85, dx + 0.85, 0.0, 0.12, z - 0.05, z + 0.3)                    # 門口台階
    mb = acc(M['mailbox']); xf.box(mb, dx + 0.85, dx + 1.3, 1.1, 1.55, z, z + 0.18)                 # 信箱
    q = xf.p(dx + 0.95, 2.25, z + 0.12); acc(M['bulb']).sphere(q, 0.08, seg=8, rings=4)            # 門燈
    if W > 4:
        wx = W * 0.18; al = acc(M['alu'])
        xf.box(al, wx - 1.0, wx + 1.0, 1.0, 1.06, z - 0.05, z + 0.05); xf.box(al, wx - 1.0, wx + 1.0, 2.14, 2.2, z - 0.05, z + 0.05)
        for xx in (wx - 1.0, wx - 0.03, wx + 0.94): xf.box(al, xx, xx + 0.06, 1.0, 2.2, z - 0.05, z + 0.05)
        # 玻璃原本直接貼在牆面上（同一個平面，從外面看牆的磁磚在玻璃裡閃，BUG-WZFLICKER）：玻璃後面一層拉上的窗簾（離牆 6 mm）、玻璃再往前 8 mm
        xf.quad(acc(M['curtain']), [(wx - 0.97, 1.06, z + 0.006), (wx + 0.97, 1.06, z + 0.006), (wx + 0.97, 2.14, z + 0.006), (wx - 0.97, 2.14, z + 0.006)])
        xf.quad(acc(M['win_glass']), [(wx - 0.97, 1.06, z + 0.014), (wx + 0.97, 1.06, z + 0.014), (wx + 0.97, 2.14, z + 0.014), (wx - 0.97, 2.14, z + 0.014)])
        if rng.random() < 0.5: inst(GRILLE, f'dgrille_{spec["id"]}', xf, wx, 0.95, z)


SF, SF_HOUSE, SF_SHUTTER = {}, {}, {}
if SET in ('wenzhou', 'gongguan', 'lane118', 'xinsheng', 'xinsheng_far', 'tingzhou'): exec(open(os.path.join(HERE, 'wz_shopkit.py'), encoding='utf-8').read())   # ART-WZ0 店面組件（同一個命名空間）；公館只用招牌設計稿（日日便利和溫州街同一家連鎖，招牌要一樣），店面照舊
for sp in SPECS: apartment(sp)

# 水源市場臨巷子的那一面（SHUIYUAN-MARKET-LANE-1112，使用者 11-12：「水源市場是一棟建築!!! 公館有很多攤販的地方就是水源市場那一棟的旁邊」）：
#   市場整棟（Te_market，深 26 m）的北面原本只是側牆＋樓上的窗。照市場的側面補：三個敞開的側門（裡面暗、看得到一排排的菜攤箱子）、門上的捲門箱、
#   整排墨綠的遮雨棚和支架、棚下的日光燈、門和門中間的磁磚腰牆和公告欄、棚上面「水源市場」的大字牌（字由遊戲畫，和其他招牌一樣）。外觀原創，不照任何真實建築（D136）。
if SET == 'tingzhou' and len(TZ['alleys']) > 1:
    _M = TZ['alleys'][1]; _mk = [q for q in TZ['shops'] if q['id'] == 'e_market'][0]; _mx0 = _FE + TZ['facade']['arcade'] + 0.6; _mx1 = _FE + _mk.get('deep', _DEP) - 0.6
    _mxf = Xf((_mx0 + _mx1) / 2, _M['z1'], math.pi); _hw = (_mx1 - _mx0) / 2; _GRN = '#2f5d50'
    _wm = acc(flat('tz_mkt_tile', '#d9d5c8', rough=0.5)); _dk = acc(flat('tz_mkt_dark', '#24211e', rough=0.9)); _gr = acc(awning_mat(_GRN)); _al = acc(M['alu']); _fr = acc(frame_mat('#4a4e54'))
    _mxf.box(_wm, -_hw, _hw, 0.0, 1.1, 0.0, 0.03)                                                    # 磁磚腰牆
    _mxf.box(acc(flat('tz_mkt_band', _GRN, rough=0.6)), -_hw, _hw, 1.1, 1.18, 0.0, 0.035)
    _GATES = [-_hw + 4.2, 0.6, _hw - 4.6]
    for _k, _gx in enumerate(_GATES):
        _mxf.box(_dk, _gx - 1.7, _gx + 1.7, 0.02, 3.05, 0.0, 0.045)                                   # 門洞（暗）
        for _sx in (-1, 1): _mxf.box(_fr, _gx + _sx * 1.7 - 0.07, _gx + _sx * 1.7 + 0.07, 0.0, 3.1, 0.0, 0.12)
        _mxf.box(_al, _gx - 1.85, _gx + 1.85, 3.05, 3.4, 0.0, 0.3)                                    # 捲門箱
        for _j in range(5):                                                                          # 門裡看得到的菜攤：一疊疊籃子和箱子
            _bx = _gx - 1.3 + _j * 0.62; _c = ['#c8301c', '#2a5aa8', '#c9a878', '#3f8a4a', '#e0a030'][(_j + _k) % 5]
            _ch = 0.38 + (_j % 3) * 0.2; _mxf.box(acc(flat('tz_mkt_crate_' + _c[1:], _c, rough=0.7)), _bx, _bx + 0.5, 0.02, _ch, 0.05, 0.4)
            for _q in range(int(_ch / 0.2)):                                                         # 塑膠籃一格一格疊：每一格的把手孔和接縫（不是光滑的方塊）
                _mxf.box(_dk, _bx + 0.14, _bx + 0.36, 0.02 + _q * 0.2 + 0.11, 0.02 + _q * 0.2 + 0.15, 0.4, 0.404); _mxf.box(_dk, _bx, _bx + 0.5, 0.02 + _q * 0.2 + 0.19, 0.02 + _q * 0.2 + 0.2, 0.4, 0.403)
        _mxf.box(acc(M['tube']), _gx - 1.2, _gx + 1.2, 2.85, 2.9, 0.06, 0.12)
    for _a, _b in zip([-_hw] + [g + 1.9 for g in _GATES], [g - 1.9 for g in _GATES] + [_hw]):         # 門和門中間：公告欄、水龍頭的小台子
        if _b - _a < 1.6: continue
        _cx = (_a + _b) / 2; _mxf.box(_fr, _cx - 0.75, _cx + 0.75, 1.35, 2.45, 0.0, 0.05); _mxf.box(acc(flat('tz_mkt_cork', '#b98d5e', rough=0.9)), _cx - 0.68, _cx + 0.68, 1.42, 2.38, 0.05, 0.06)
        for _j in range(5): _mxf.box(acc(flat('tz_mkt_paper', '#f1ede0', rough=0.9)), _cx - 0.6 + (_j % 3) * 0.42, _cx - 0.6 + (_j % 3) * 0.42 + 0.3, 1.5 + (_j // 3) * 0.46, 1.5 + (_j // 3) * 0.46 + 0.38, 0.06, 0.064)
    _mxf.box(_gr, -_hw, _hw, 3.42, 3.5, 0.0, 1.5)                                                     # 遮雨棚：一整排，往外挑 1.5 m、前緣垂下一條
    _mxf.box(_gr, -_hw, _hw, 3.2, 3.42, 1.44, 1.5)
    for _k in range(int((_hw * 2) / 2.6) + 1):
        _bx = -_hw + 0.1 + _k * (2 * _hw - 0.2) / int((_hw * 2) / 2.6); _mxf.box(_al, _bx - 0.025, _bx + 0.025, 3.36, 3.42, 0.0, 1.46); _mxf.box(_al, _bx - 0.025, _bx + 0.025, 2.9, 3.38, 0.0, 0.05)
    for _k in range(6): _tx = -_hw + 2.0 + _k * (2 * _hw - 4.0) / 5; _mxf.box(acc(M['tube']), _tx - 0.6, _tx + 0.6, 3.36, 3.4, 0.9, 0.98)
    _sw = 7.0; _mxf.box(acc(flat('tz_mkt_signback', '#1f4034', rough=0.6)), -_sw / 2 - 0.12, _sw / 2 + 0.12, 3.72, 5.02, 0.0, 0.1)
    face('SIGN_FACE_TMKT_N', M['board'], _mxf, [(-_sw / 2, 3.8, 0.105), (_sw / 2, 3.8, 0.105), (_sw / 2, 4.94, 0.105), (-_sw / 2, 4.94, 0.105)],
         {'sign': '水源市場', 'sub': '', 'bg': _GRN, 'color': '#f4ead8', 'serif': 0, 'band': '#c9a24a'})
if SET == 'xinsheng_far':   # XS-FARVIEW-1105：路口的號誌（台灣常見的橫式燈頭掛在懸臂上；行人號誌在桿子上）。燈頭的綠燈自己發光（白天也亮）
    def _signals():
        pole = acc(flat('wz_sig_pole', '#7b8086', rough=0.45, metal=0.35)); head = acc(flat('wz_sig_head', '#2b2e31', rough=0.6))
        lens = {c: acc(flat('wz_sig_' + c, h, rough=0.3, **({'emit': B.srgb(h)} if c == 'green' else {}))) for c, h in (('red', '#5a1c18'), ('amber', '#5a4418'), ('green', '#36d07a'))}
        def sig(x, z, dx, arm):   # (x, z) 桿子；dx＝懸臂往馬路的方向（±1，沿 x）；arm＝懸臂長
            pole.cyl((x, 0, z), (x, 6.2, z), 0.11, seg=10); pole.cyl((x, 5.9, z), (x + dx * arm, 5.9, z), 0.06, seg=8)
            hx = x + dx * (arm - 0.6); head.box(hx - 0.75, hx + 0.75, 5.45, 5.85, z - 0.16, z + 0.16)
            for i, c in enumerate(('red', 'amber', 'green')): lens[c].cyl((hx - 0.48 + i * 0.48, 5.65, z - 0.17), (hx - 0.48 + i * 0.48, 5.65, z - 0.2), 0.15, seg=10)
            head.box(x - 0.17, x + 0.17, 2.3, 2.95, z - 0.17 - dx * 0, z + 0.17)   # 行人號誌
            lens['green'].box(x - 0.11, x + 0.11, 2.36, 2.58, z - 0.19, z - 0.17)
        (n0, n1), (s0, s1) = XSF['armN'], XSF['armS']
        sig(-8.6, n1 + 1.2, 1, 7.0); sig(8.6, n0 - 1.2, -1, 7.0)            # 北端 T 字路口：西南角、東北角（東側是校園圍牆外的人行道）
        sig(-8.6, s0 - 1.2, 1, 7.0); sig(8.6, s1 + 1.2, -1, 7.0); sig(-8.6, s1 + 1.2, 1, 7.0); sig(8.6, s0 - 1.2, -1, 7.0)   # 南端十字路口四個角
    _signals()
if SET in ('xinsheng', 'wenzhou', 'gongguan', 'tingzhou') and 'xs_finish' in globals(): xs_finish()   # 新生南路的店面貼圖、溫州街日常失速（各一個網格）
if SET == 'wenzhou' and 'copy_variants' in globals(): copy_variants()   # ART-WZ6：阿德影印的兩種外觀（COPY_* 節點，遊戲照 WZ_COPY_SHOP 開關）
if SET in ('wenzhou', 'gongguan', 'tingzhou'): build_notes()   # 玻璃上的紙條（公館騎樓店面也有，ART-GG-SHOPS-1018）
if SET == 'wenzhou':
    acc(M['sidewalk']).box(11.8, 37.2, -0.01, 0.015, 29.3, 31.0)   # 小公園北牆和 P1、P2 之間的地（區域地面到 z=30 為止）
for k, m in _acc.items():
    m.finish(root, uv=(k not in ('cafe_leaf_fern', 'cafe_leaf_broad', 'cafe_leaf_olive', 'cafe_leaf_ivy')), smooth=k in ('cafe_pot_terracotta', 'cafe_bulb'))
for m, props in faces: uv01(m.finish(root, uv=True, props=props))

# 純色材質改成兩個頂點色材質（第二輪減量，2026-10-10）：門、鋁框、雨遮、屋頂板、鐵件、窗簾…原本每一種一次 draw call（會投影的再加陰影那一輪一次），
# 整條巷子同一組合成一個網格。顏色放在頂點色；金屬度不同的照漫射補償（lib2.vc_consolidate）。冷氣、水塔這些 instancing 原型裡的零件也合成一個材質。
VC_MATTE = L.vc_material('wz_vc_matte', rough=0.85)
VC_METAL = L.vc_metal('wz_vc_metal', rough=0.45, metal=0.35)
WZ_VC = {**{n: VC_MATTE for n in ('cafe_ac_body', 'cafe_ac_fan', 'cafe_roof_slab', 'cafe_pipe', 'cafe_curtain', 'wz_arcade_ceiling', 'wz_frame_3b2a1e',
                                   'wz_awning_1f2e45', 'wz_awning_2f4a3a', 'wz_awning_9c2f2a', 'wz_laundry')},
         **{n: VC_METAL for n in ('cafe_alu', 'cafe_iron_black', 'cafe_brass', 'cafe_grille', 'cafe_tank_steel', 'wz_mailbox', 'wz_frame_cfd6d6',
                                   'wz_door_2f4a3a', 'wz_door_8a3a2a', 'wz_door_9c2f2a')}}
for _m in bpy.data.materials:   # 門、窗框、雨遮的顏色是每棟自己的（例如巷底那棟的深咖啡色鐵門）：全部照金屬度分到兩組
    if _m.name.startswith(('wz_door_', 'wz_frame_', 'wz_awning_')) and _m.name not in WZ_VC and L.flat_info(_m):
        WZ_VC[_m.name] = VC_METAL if L.flat_info(_m)['metal'] > 0.1 else VC_MATTE
# ---------------- ART-WZ7 路邊小物（AA-B 做，LAWWW2-B 擺）：生活痕跡 ----------------
# 擺在店面退縮的門廊（門面線和店面玻璃之間，建築的導航阻擋範圍內，人走不進去；和 wz_shopkit 的門廊雜物同一個做法）。
# A 側（z>0）的建築原點在 ((x0+x1)/2, 5)、轉 π：本地 (lx, lz) → 世界 (cx − lx, 5 − lz)。三角形預算：只擺三件（約 2.8k）
WZ7 = os.path.join(L.ROOT, 'assets/models/env/second_ai/aa_support/wz7_street_props.glb')
if SET == 'wenzhou' and os.path.exists(WZ7):
    _before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=WZ7); _new = [o for o in bpy.data.objects if o not in _before]
    _tops = {o.name.split('.')[0]: o for o in _new if o.type == 'MESH' and o.name.startswith('WZ7_')}   # GLB 裡五件都掛在 wz7_street_props 底下
    _g7 = B.group('wz7_props', root)
    def _put7(nd, x, y, z, ry):
        src = _tops.get(nd)
        if src is None: print('WZ7 沒有', nd); return
        ob = src.copy(); bpy.context.scene.collection.objects.link(ob); ob.parent = _g7; ob.matrix_parent_inverse.identity()
        ob.rotation_mode = 'XYZ'; ob.location = g2b(x, y, z); ob.rotation_euler = (0, 0, ry); ob.scale = (1, 1, 1)
    _put7('WZ7_delivery_box', 36 + 3.3, 0.0, 5 + 0.5, math.pi + 0.15)    # 林家乾麵（A4）門廊的西端：外送員在等餐，保溫箱放地上
    _put7('WZ7_helmet', 36 + 3.3, 0.46, 5 + 0.5, math.pi - 0.6)         # 安全帽放在保溫箱上
    _put7('WZ7_RECYCLE', 44 + 3.2, 0.0, 5 + 0.45, math.pi - 0.08)      # 日日便利（A5）門廊的西端（門在東邊）：要拿去回收的紙箱捆＋一袋寶特瓶
    for _o in _new:
        if _o.name in bpy.data.objects: bpy.data.objects.remove(_o)

# 日常失速的立體店內（SHOP-WINDOW-2D-1105 試做，LAWWW2-B 11-07）：offbeat_storefront.glb（offbeat_storefront.py：AA 的室內拿掉臨街兩面牆、燈光烘成一張自發光貼圖）
#   擺在 W2 的一樓：室內 (x, z) → 溫州街 (z − 42.2, −13.5 − x)＝遊戲 rotation.y π/2、位置 (−42.2, −13.5)。OFFBEAT_XS 的 int3d 讓外觀不畫景深卡。
STOREFRONT = os.path.join(L.ROOT, arg('--storefront', 'assets/models/env/second_ai/offbeat_storefront.glb'))
if SET == 'wenzhou' and OFFBEAT_XS.get('int3d') and os.path.exists(STOREFRONT):
    _before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=STOREFRONT); _new = [o for o in bpy.data.objects if o not in _before]
    _gs = B.group('offbeat_storefront', root); _gs.rotation_mode = 'XYZ'; _gs.location = g2b(-42.2, 0.01, -13.5); _gs.rotation_euler = (0, 0, math.pi / 2)
    _gs.scale = (1, 1, 0.99)   # 抬 1 cm、高度縮 1%：店內地板（0）和街面、天花板（3.4）和樓上量體的底面不在同一個平面（會閃）
    for _o in _new:
        if _o.parent is None: _o.parent = _gs; _o.matrix_parent_inverse.identity()
    # WZ-OFFBEAT-WINDOW-FLICKER-1112（使用者 11-12「日常失速從店外面看進去會一直閃」）：店內的西牆（室內 z＝−5.0）、北牆（室內 x＝−5.5）和這一棟外殼牆的內面在同一個平面（36＋33 m²）。
    #   店內這兩面牆（連同貼著牆的地板、天花板邊）往店裡挪 8 mm（挪 2 cm 會撞到離牆 2 cm 的掛板）。已交的 wenzhou_street.glb 用 glb_shift_plane.py 挪了同樣的量，沒有重建；下面這一段是重建時用的，還沒有實際跑過重建
    import mathutils as _mu
    for _o in _new:
        if _o.type != 'MESH': continue
        _mw = _o.matrix_world.copy(); _mi = _mw.inverted()
        for _v in _o.data.vertices:
            _w = _mw @ _v.co; _hit = False
            if abs(_w.x + 5.5) < 5e-4: _w.x += 0.008; _hit = True       # 室內 x＝−5.5 → 往 +x
            if abs(_w.y - 5.0) < 5e-4: _w.y -= 0.008; _hit = True       # 室內 z＝−5.0（Blender y＝+5.0）→ 往 +z
            if _hit: _v.co = _mi @ _w
    print('storefront', len(_new), flush=True)

if "goods_finish" in globals(): goods_finish()   # 店裡的商品（wz_shopkit.goods；2026-10-23）：整條街一個網格、一張貼圖

# 第三輪減量（效能，2026-10-16；LAWWW-B 量到主巷三個鏡頭 355～448 次 draw call、51～55 萬三角形，目標 310／42 萬）：
# 其他所有純色材質（v6 店面組件的碗盤、水果、木頭、不鏽鋼、盆栽的葉子和土…）也照粗糙度、金屬度分到三個頂點色材質；
# 遊戲用材質名做事的（晚上發光 WZ_NIGHT、樹幹透視、字牌 *_FACE_ 的材質）不動。
# 這一輪合進來的都是小東西（店裡的碗盤水果、凳子、盆栽、電表…）：用不投影的頂點色材質——遊戲的 WZ_NO_SHADOW 對 cafe_vc_ 開頭的材質不投影
# （第一次量：合進會投影的 wz_vc_* 以後，陰影那一輪多了 2 萬個三角形）。門、窗框、雨遮、冷氣、鐵窗這些照舊在 wz_vc_*（投影）。
VC_GLOSS = L.vc_material('cafe_vc_wz_gloss', rough=0.35)
VC_SMATTE = L.vc_material('cafe_vc_wz_matte', rough=0.85); VC_SMETAL = L.vc_metal('cafe_vc_wz_metal', rough=0.45, metal=0.35)
WZ_KEEP = {'wz_in_shop', 'wz_signs_lit', 'ext_glass_lit', 'wz_room_lit', 'wz_win_glass_lit', 'cafe_bulb', 'wz_tube', 'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'wz_pillar_tile', 'wz_pole_concrete'}
_face_mats = {ms.material.name for ob in root.children_recursive if ob.type == 'MESH' and 'FACE' in ob.name for ms in ob.material_slots if ms.material}
for _m in bpy.data.materials:
    if _m.users == 0 or _m.name in WZ_VC or _m.name.startswith(('wz_vc_', 'cafe_vc_wz')) or _m.name in WZ_KEEP or _m.name in _face_mats: continue
    _fi = L.flat_info(_m)
    if not _fi or _fi['color'] is None: continue
    _r = _m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value
    WZ_VC[_m.name] = VC_SMETAL if _fi['metal'] > 0.1 else (VC_GLOSS if _r < 0.5 else VC_SMATTE)
# 第二輪（效能，2026-10-16）：貼在牆上的薄零件（門、窗框、鋁框、窗簾、曬的衣服、水管、信箱、門把）的影子從上往下看不到——
# 改到不投影的那一組；會投影的只剩雨遮、屋頂板、騎樓天花板（還有 instancing 的冷氣、水塔，本來就不投影）
for _n, _v in list(WZ_VC.items()):
    if _v in (VC_MATTE, VC_METAL) and (_n.startswith(('wz_door_', 'wz_frame_')) or _n in ('cafe_pipe', 'cafe_curtain', 'wz_laundry', 'cafe_alu', 'cafe_iron_black', 'cafe_brass', 'wz_mailbox')):
        WZ_VC[_n] = VC_SMETAL if _v is VC_METAL else VC_SMATTE
if 'wz_fruit_vc' in bpy.data.materials: WZ_VC['wz_fruit_vc'] = VC_SMATTE   # 阿忠鮮果攤子上的水果不投影（LAWWW 11-04 lane_east）
print('vc_consolidate:', len(WZ_VC), 'materials ->', sorted({v.name for v in WZ_VC.values()}), sorted(k for k, v in WZ_VC.items() if v.name.startswith('cafe_vc_wz')))
_keep = lambda ob: 'FACE' in ob.name or 'SEASON' in ob.name or (ob.parent is not None and 'SEASON' in ob.parent.name) or ob.name.startswith('COPY_') or (ob.parent is not None and ob.parent.name.startswith('COPY_'))   # COPY_：阿德影印的兩種外觀（ART-WZ6，遊戲照名字開關）
L.realize_small_instances(root, keep=_keep)   # 只擺一兩個的店面小物（店裡的冰箱、販賣機、麵攤、傘架、電表…）不用 instancing，合進大網格
# PERF-GG-DC-1104（LAWWW2 11-04；v9.10.20 的 gongguan_glb_integration：street_west draw call 236 ＞ ?nobldg 172 的 1.3 倍）：
# 公館的 instancing 原型每個材質一次 draw call（6 個原型 12 次）。小的（一個原型 ≤ 120 個三角形、全部 ≤ 12,500）改成各自一份網格，合進大網格；
# 最大的（騎樓前的欄杆 397 個）照舊 instancing（合進去檔案會再大 1 MB 以上）。
# 原本 instancing 不投影（遊戲的 wzCastsShadow），合進去以後也不能投影：材質換成同參數、不投影的 cafe_vc_wz_*，其他會投影的材質物件名加 NOSHADOW_
if SET in ('gongguan', 'tingzhou'):
    _by = {}
    for _ob in root.children_recursive:
        if _ob.type == 'MESH' and _ob.data.users > 1 and not _keep(_ob): _by.setdefault(_ob.data.name, []).append(_ob)
    _rl = []
    for _nm, _obs in _by.items():
        _t = sum(len(_p.vertices) - 2 for _p in _obs[0].data.polygons)
        if (_t <= 120 and _t * len(_obs) <= 12500) or (_t <= 450 and _t * len(_obs) <= 10000):   # 第二條：店裡的桌椅（22 組）
            _me = _obs[0].data
            for _ob in _obs: _ob.data = _me.copy(); _ob['gg_real'] = 1
            _rl.append([_nm, len(_obs), _t])
    print('{"gg_realize_instances": %s}' % _rl)
if os.environ.get('WZ_DIAG'):   # 效能診斷：合併前每個材質畫出來的三角形數（instancing 每一個都算）
    import collections; _tc = collections.Counter(); _no = collections.Counter()
    for ob in root.children_recursive:
        if ob.type != 'MESH': continue
        for pg in ob.data.polygons:
            mn = ob.data.materials[pg.material_index].name if ob.data.materials else '-'; _tc[mn] += len(pg.vertices) - 2; _no[(mn, ob.name.split('.')[0])] += len(pg.vertices) - 2
    for k, v in _tc.most_common(45): print('DIAG', v, k, '->', WZ_VC[k].name if k in WZ_VC else '')
    for k, v in _no.most_common(60): print('DIAGO', v, k)
# 效能第五輪：店面組件（sk_*）離地 0.95 m 以下、朝下的面刪掉——放在地上、層架上的箱子、桌椅、櫃子的底面，鏡頭（1.5 m 以上往下看）看不到
_cull = 0
for _ob in [o for o in root.children_recursive if o.type == 'MESH' and o.name.startswith('sk_') and o.data.users == 1]:
    _bm = bmesh.new(); _bm.from_mesh(_ob.data); _mw = _ob.matrix_world; _n3 = _mw.to_3x3().inverted().transposed()
    _del = [f for f in _bm.faces if (_n3 @ f.normal).normalized().z < -0.95 and (_mw @ f.calc_center_median()).z < 0.95]
    if _del:
        _cull += sum(len(f.verts) - 2 for f in _del); bmesh.ops.delete(_bm, geom=_del, context='FACES_ONLY'); _bm.to_mesh(_ob.data)
    _bm.free()
print('{"cull_bottoms_tris": %d}' % _cull)
# LANEEAST-TRIS2-1104（LAWWW2-C 11-04）：店裡隔著玻璃的東西（sk_* 的 wz_in_* 材質：貨架上的商品、書、水果、桌椅）背對街道的面刪掉——
# 街上只看得到朝街、朝上、朝左右的面；朝店裡後牆的那一面（A 側 z>0 的店：法線 +z；B 側 z<0：法線 −z）從街上永遠看不到（玻璃另一邊沒有鏡頭）。
# 單面材質（PERF-SINGLESIDE）雖然顯示卡會剔除，但 renderer.info 照樣算三角形、照樣送進去；刪掉才真的少。店內是另一個區域（另一個 GLB），不受影響
_cullb = 0
if SET == 'wenzhou':
    for _ob in [o for o in root.children_recursive if o.type == 'MESH' and o.name.startswith('sk_') and o.data.users == 1]:
        _mw = _ob.matrix_world; _side = 1.0 if (_mw @ Vector([sum(c[i] for c in _ob.bound_box) / 8.0 for i in range(3)])).y < 0 else -1.0   # Blender y＝遊戲 −z：y<0＝遊戲 z>0＝A 側
        _bm = bmesh.new(); _bm.from_mesh(_ob.data); _n3 = _mw.to_3x3().inverted().transposed(); _mats = _ob.data.materials
        _del = [f for f in _bm.faces if f.material_index < len(_mats) and _mats[f.material_index] and _mats[f.material_index].name.startswith('wz_in_')
                and (_n3 @ f.normal).normalized().y * _side < -0.9]   # 遊戲 +z（A 側背向街）＝Blender −y；B 側背向街＝Blender +y
        if _del:
            _cullb += sum(len(f.verts) - 2 for f in _del); bmesh.ops.delete(_bm, geom=_del, context='FACES_ONLY'); _bm.to_mesh(_ob.data)
        _bm.free()
print('{"cull_backs_tris": %d}' % _cullb)
L.vc_consolidate(root, WZ_VC)
L.split_by_material(root, keep=_keep)
if SET in ('gongguan', 'tingzhou'):   # PERF-GG-DC-1104：上面合進來的 instancing 零件照舊不投影（見上）
    _NOSH = re.compile(r'^(wz_menu_|wz_in_|wz_shop_notes|wz_shutter|cafe_int_|cafe_room_dark|cafe_curtain|ext_glass_lit|wz_room_lit|jp_shoji|cafe_leaf_|cafe_glass|cafe_win_glass|cafe_lampglass|cafe_bulb|cafe_books|cafe_vc_)')   # ＝zones3d.js 的 WZ_NO_SHADOW
    for _ob in [o for o in root.children_recursive if o.type == 'MESH' and o.get('gg_real')]:
        for _i, _m in enumerate(_ob.data.materials):
            if _m and _m.name == 'wz_vc_matte': _ob.data.materials[_i] = VC_SMATTE
            elif _m and _m.name == 'wz_vc_metal': _ob.data.materials[_i] = VC_SMETAL
        _m = _ob.data.materials[0] if len(_ob.data.materials) else None
        if _m and not _NOSH.match(_m.name) and not _ob.name.startswith('NOSHADOW_'): _ob.name = 'NOSHADOW_' + _ob.name
# 小貼圖材質（店內地板、條紋雨遮、菜單、書背…）合成一張貼圖集（效能第二輪，2026-10-16）
WZ_TEXT = {'wz_in_goods', 'wz_in_books_u', 'wz_in_price_u', 'wz_in_board_u', 'wz_signs', 'wz_in_board', 'wz_in_price', 'wz_menu_ice', 'wz_menu_tea', 'wz_menu_tea_wz', 'wz_noren', 'wz_shop_notes'}   # 有字的（招牌設計稿、菜單、價目、告示）不進貼圖集：縮小以後字糊掉（第一次試：招牌整片灰）
if L.atlas_small(root, os.path.join(HERE, 'textures', 'gen', f'wz_small_atlas_{SET}.png'), f'wz_small_atlas_{SET}', protect=WZ_KEEP | WZ_TEXT, keep=_keep): pass
# 有字的小牌子（菜單、價目、告示、門簾）不合貼圖集：效能第三輪試過另一張 512 格的貼圖集，寬的菜單被壓扁、字橫向糊掉（遊戲截圖看得出來），退回各自的材質
L.atlas_rows(root, os.path.join(HERE, 'textures', 'gen', f'wz_rows_atlas_{SET}.jpg'), f'wz_rows_atlas_{SET}', protect=WZ_KEEP | WZ_TEXT, max_vloss=0.06, keep=_keep, skip=lambda m: m.name.startswith('wz_small_atlas'))   # 沿 u 重複很多次的（條紋雨遮、店內地板、木頭）
# 效能第四輪：atlas_rows 不收的磁磚、木紋、地板（兩個方向都有細節）合成一張 2D 貼圖集——面沿 UV 格線切開、格子用 wrap 墊邊，不糊（lib2 atlas_tiles）
WZ_TILES = {'wz_in_books', 'wz_sf_wood_light', 'wz_sf_wood_dark', 'wz_sf_floral', 'wz_sf_quarry', 'wz_sf_white', 'wz_sf_concrete', 'wz_sf_corr', 'wz_sf_granite',
            'wz_sf_terrazzo', 'wz_sf_mosaic', 'wz_arcade_floor', 'wz_shutter', 'cafe_base_stone'}
# 材質名開頭 wz_in_：遊戲的 WZ_NO_SHADOW 不投影（店裡的家具、地板、騎樓地板、鐵捲門的影子本來就看不到；投影的話切開的三角形在陰影那一輪又畫一次）
L.atlas_tiles(root, os.path.join(HERE, 'textures', 'gen', f'wz_tiles_{SET}'), f'wz_in_tiles_{SET}', only=WZ_TILES, keep=_keep,
              reps={'wz_sf_wood_dark': 2, 'wz_sf_wood_light': 2, 'wz_sf_mosaic': 2, 'wz_sf_granite': 2, 'wz_sf_terrazzo': 2, 'wz_sf_white': 2, 'wz_sf_floral': 2})
# ↑ 木頭多半是店裡的小家具、店內地板隔著玻璃看：一格放 2×2 個週期，少切很多刀；騎樓地板（近看、走在上面）、鐵捲門、石材牆基維持一格一個週期
if not os.environ.get('WZ_NOMERGE'):   # 除錯：WZ_NOMERGE=1 不合併，疊面掃描（tools/glb_coplanar.py）就看得到每個零件的名字
    # 整條街共用的大材質（LANEEAST-TRIS2-1104，LAWWW2-C 11-04：BB_255「lane_east 三角形 ≤ 42 萬」）：頂點色雜物、金屬件、牆面磁磚、店內地磚原本各自整條街一個網格
    # （cafe_vc_wz_matte 2.1 萬、cafe_vc_wz_metal 1.2 萬、wz_wall_tile 1.1 萬、wz_in_tiles_wenzhou 0.5 萬三角形），不管鏡頭看哪裡都整條畫、陰影那一輪也整條畫。
    # 照零件中心的 x 分四段（x < 5／5～18／18～31／≥ 31，切在棟和棟中間：A2|A3、B4|B5、B5|B6）各自合併：站在東段往東看時西邊兩段整段裁掉；
    # 不分南北兩側（包圍球大一點，但 draw call 少一半：每種材質在鏡頭裡多 1～2 次）。材質不變、名字 wzx<段>_<材質>，遊戲照材質名做事的都不受影響
    #   第一版照零件（合併前的物件）中心分段不行：很多零件本身就跨半條街（實體化的 instancing 組、貼圖集切過的面），每一段還是從西到東。
    #   改成合併以後照「每一個面」的中心切（_xseg_split），每一段只含自己那一截的面
    WZ_XSEG_MATS = {'cafe_vc_wz_matte', 'cafe_vc_wz_metal', 'wz_wall_tile', 'wz_in_tiles_wenzhou'}
    WZ_XSEG_CUTS = (5.0, 18.0, 31.0)
    def _xseg_split(root):
        made = []
        for ob in [o for o in root.children if o.type == 'MESH' and len(o.data.materials) == 1 and o.data.materials[0] and o.data.materials[0].name in WZ_XSEG_MATS]:
            if ob.data.users > 1: continue   # instancing（共用網格）不動
            props = {kk: (vv.to_list() if hasattr(vv, 'to_list') else (vv.to_dict() if hasattr(vv, 'to_dict') else vv)) for kk, vv in ob.items()}
            mw = ob.matrix_world.copy(); bm0 = bmesh.new(); bm0.from_mesh(ob.data); bm0.faces.ensure_lookup_table()
            bins = {}
            for f in bm0.faces: bins.setdefault(sum(1 for c in WZ_XSEG_CUTS if (mw @ f.calc_center_median()).x >= c), []).append(f.index)
            if len(bins) < 2: bm0.free(); continue
            for k, idx in sorted(bins.items()):
                bm = bm0.copy(); bm.faces.ensure_lookup_table(); keep_ = set(idx)
                bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in keep_], context='FACES_ONLY')
                bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
                me = bpy.data.meshes.new('wzx%d_%s' % (k, ob.name)); bm.to_mesh(me); bm.free(); me.materials.append(ob.data.materials[0])
                nob = bpy.data.objects.new('wzx%d_%s' % (k, ob.name), me); B.scene().collection.objects.link(nob); nob.parent = root; nob.matrix_world = mw
                for kk, vv in props.items(): nob[kk] = vv
                made.append((nob.name, len(idx)))
            bm0.free(); old = ob.data; bpy.data.objects.remove(ob); bpy.data.meshes.remove(old)
        import json as _j; print(_j.dumps({'xseg_split': made}, ensure_ascii=False))
    def _seg(ob):   # 溫州街的店內（wz_in_shop）一間店一個網格合併（LAWWW 11-04 08:16 lane_east 三角形超標）：整條街一個網格的話，站在東段往東看時西段的書屋、帝大紅茶、常在洗衣、小路
        # 也整個要畫（裁不掉）；材質不變，看得到的店才畫。名字 wz_in_<棟號>_wz_in_shop 照舊 wz_in_ 開頭（遊戲不投影）
        if SET != 'wenzhou' or len(ob.data.materials) != 1 or not ob.data.materials[0] or ob.data.materials[0].name != 'wz_in_shop': return ''
        m = re.match(r'sk_in_([A-Z]\d+i?)', ob.name)   # 店內的頂點色網格叫 sk_in_<棟號>：一間店一個網格（包圍球小，背後的店整間裁掉；分東西兩段的話包圍球太大、跨到鏡頭前面，裁不掉）
        return ('wz_in_' + m.group(1)) if m else ''
    if SET == 'wenzhou' and not os.environ.get('WZ_NOPACK'):   # 除錯：WZ_NOPACK=1 不打包（和改之前一樣）。PERF-WZ-DC-1107（LAWWW2-B 11-07；LAWWW-B 09:04「主模型 −13」）：只差粗糙度、金屬度的頂點色材質合成一個（lib2.vc_pack：粗糙度、金屬度放在一張
        # 小貼圖，每個面讀它原本那一格，畫面不變）。投影的（wz_vc_*）和不投影的（cafe_vc_wz_*：遊戲 WZ_NO_SHADOW）分開打包，影子照舊；
        # instancing 原型（窗、冷氣、鐵窗…遊戲裡本來就不投影）全部用不投影那一個。四段 wzx 每段霧面＋金屬＋亮面合成一個網格
        L.vc_pack(root, {'wz_vc_matte': 'wz_vc_pack', 'wz_vc_metal': 'wz_vc_pack', 'cafe_vc_wz_matte': 'cafe_vc_wz_pack', 'cafe_vc_wz_gloss': 'cafe_vc_wz_pack',
                         'cafe_vc_wz_metal': 'cafe_vc_wz_pack'}, 'cafe_vc_wz_pack', os.path.join(HERE, 'textures', 'gen', 'wz_vc_pack_rm.png'))
        WZ_XSEG_MATS.add('cafe_vc_wz_pack')
    L.merge_by_material(root, keep=_keep,
                        key=lambda ob: 'NOSHADOW' if ob.name.startswith('NOSHADOW_') else _seg(ob))   # 公館七樓以上：合併後名字是 NOSHADOW_<材質>
    if SET == 'wenzhou': _xseg_split(root)   # LANEEAST-TRIS2-1104：整條街一個網格的四種材質照面的 x 切四段
for _g in [o for o in root.children if o.name.startswith('COPY_')]: L.merge_by_material(_g)
if SET in ('gongguan', 'tingzhou'):   # PERF-GG-DC-1104：店面的燈（小燈泡、燈管）、店內景深卡、亮窗的玻璃、新店面的灰泥牆（騎樓裡，影子本來就在騎樓的陰影裡）、騎樓梁上的招牌（薄板，影子落在騎樓的影子裡）不投影：陰影那一輪少 9 次 draw call
    for _ob in list(root.children):
        if _ob.type != 'MESH' or len(_ob.data.materials) != 1 or not _ob.data.materials[0] or _ob.name.startswith('NOSHADOW_'): continue
        if re.match(r'(wz_sf_lamp|wz_tube$|wz_xs_fronts|wz_win_glass_lit$|gg_xs_plaster_|wz_signs)', _ob.data.materials[0].name): _ob.name = 'NOSHADOW_' + _ob.name   # ART-WZ6：開關的店面各自照材質合併（節點保留，遊戲照名字開關；原本 15 個網格＝15 次 draw call）
if SET in ('wenzhou', 'lane118', 'xinsheng_far', 'tingzhou'):   # PERF-SINGLESIDE-GLB-1025（LAWWW2-B 2026-10-25）：只把「大面、背面看不到」的材質改單面——立面的牆與柱（只從巷子看）、
    # 店內的殼和商品（隔著玻璃）、店內地板、亮窗的房間卡。網格不動、不補反面（鐵窗、鋁框、葉片卡這些照舊雙面：公館試過全部單面＋薄零件補反面，instancing 乘上去反而沒變快）。
    # 同一頁量（路人拿掉）：溫州街 +11%、118 巷 +15%／+3%；公館量不出差別，不改
    for _m in {s.material for o in root.children_recursive if o.type == 'MESH' for s in o.material_slots if s.material}:
        if re.match(r'(wz_in_goods|wz_in_price_u|wz_in_board_u|wz_in_shop|wz_wall_|wz_in_tiles_|wz_room_lit|wz_pillar_|wz_ground_wall)', _m.name): _m.use_backface_culling = True   # wz_in_price_u、wz_in_board_u（PERF-WZ-SHADERS 11-07）：和 wz_in_goods 同一個 shader；價目牌、黑板朝街（和店內外殼同方向）
if '--season' in ARGS:   # 只輸出季節布置（season_<區域>.glb）：街景照常建一次（為了拿到每扇門的位置），不存街景模型
    import season_deco; season_deco.export(SET, SEASON_DOORS, os.path.join(L.ROOT, 'assets/models/env/second_ai/season_%s.glb' % SET)); sys.exit(0)
info = L.export(OUT, gpu_instances=True)
if SET == 'wenzhou' and not os.environ.get('WZ_NOSLIM'):   # PERF-COLD-RT（LAWWW2-B 11-07；CC-B：第一次進溫州街慢在下載這個檔）：法線 8 位元、頂點色 0～255，位置、UV、節點不動；
    import glb_slim; info['slim'] = glb_slim.slim(OUT, OUT); info['bytes'] = os.path.getsize(OUT)   # 招牌、門牌、景深卡（遊戲會改幾何）不碰；見 glb_slim.py
info.update({'buildings': [s['id'] for s in SPECS]})
if SET == 'tingzhou': info.update({'noArcade': {s['id']: [round(s['pos'][0], 3), round(s['d'], 3)] for s in SPECS if s.get('ground') == 'shop' and s.get('xs')}})   # 沒有騎樓的店：立面的 x、樓房深度（tests/tingzhou_unit.js 和配置、導航對）
L.write_json(OUT[:-4] + '.json', info)
L.write_json(OUT[:-4] + '.props.json', {'set': SET, 'note': '地上雜物的腳印（世界座標 [minx,minz,maxx,maxz]、高度）；tests/street_props_nav_unit.js 用', 'props': PROP_FP})
