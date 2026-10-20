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
import math, os, sys, random
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
OUT = os.path.join(L.ROOT, arg('--out', 'assets/models/env/second_ai/' + {'gongguan': 'gongguan_shops.glb', 'lane118': 'lane118_street.glb', 'nccu_food': 'bg_nccu_food_street.glb'}.get(SET, 'wenzhou_street.glb')))

# ---------------- 遊戲裡的配置（照 zones3d.js buildWenzhou；改那邊要一起改這裡） ----------------
SHOP = lambda **k: k
SPECS = [
    # A 側（z>0，立面朝 −z）：aptA(x0,x1,spec) → 位置 ((x0+x1)/2, 5)、rotation.y=π、深 12
    dict(id='A1', side='A', x0=-12, x1=-4, floors=4, wall='tile', color='#d9c9a8', ground='shop', shop=SHOP(type='print', name='阿德影印輸出', sub='影印・膠裝・大圖輸出', signBg='#f4f1ea', signColor='#1f4e8c', band='#1f4e8c', vertical='影印', vBg='#ffffff', vColor='#1f4e8c', vBand='#1f4e8c')),
    dict(id='A2', side='A', x0=-4, x1=3.1, floors=5, wall='mosaic', color='#cfd8d0', ground='door', door='#9c2f2a'),
    dict(id='A3', side='A', x0=8.4, x1=20, floors=4, wall='tile', color='#c9b49a', balcony=True, ground='shop', shop=SHOP(type='books', name='巷口書房', sub='二手書・人文社會・法律', signBg='#2f4a3a', signColor='#f4ead8', serif=True, awning='#2f4a3a', vertical='書', vBg='#f4ead8', vColor='#2f4a3a', vBand='#2f4a3a')),
    dict(id='A4', side='A', x0=32, x1=40, floors=4, wall='plaster', color='#e8e1d4', ground='shop', shop=SHOP(type='noodle', name='林家乾麵', sub='乾麵・餛飩・滷味', signBg='#f4ead8', signColor='#9c2f2a', vertical='麵', vBg='#ffffff', vColor='#9c2f2a', vBand='#9c2f2a', awning='#9c2f2a')),
    dict(id='A5', side='A', x0=40, x1=48, floors=3, wall='tile', color='#b8a088', roofAdd=True, ground='shop', shop=SHOP(type='cvs', name='日日便利', sub='24H', signBg='#ffffff', signColor='#1f6f78', band='#e8a33a', frame='#cfd6d6')),
    # B 側（z<0，立面朝 +z）：aptB → 位置 ((x0+x1)/2, −5)、rotation.y=0
    dict(id='B1', side='B', x0=-30, x1=-21, floors=3, wall='plaster', color='#d8d0c0', roofAdd=True, ground='shutter'),
    dict(id='B2', side='B', x0=-21, x1=-15, floors=4, wall='tile', color='#bfb3a3', ground='shop', shop=SHOP(type='laundry', name='自助洗衣', sub='24 小時・投幣式', signBg='#e9f2f6', signColor='#2a5f8a', frame='#cfd6d6')),
    dict(id='B3', side='B', x0=-9.6, x1=4, floors=5, wall='tile', color='#d5c7b0', ground='shop', shop=SHOP(type='teishoku', name='巷子裡定食', sub='日式家庭料理', signBg='#1f2e45', signColor='#f4ead8', serif=True, awning='#1f2e45', vertical='定食', vBg='#f4ead8', vColor='#1f2e45', vBand='#1f2e45')),
    dict(id='B4', side='B', x0=4, x1=16, floors=4, wall='mosaic', color='#d8d2c6', ground='door', door='#2f4a3a'),
    dict(id='B5', side='B', x0=16, x1=30, floors=4, wall='tile', color='#cbbba3', ground='arcade', shop=SHOP(type='tea', name='巷口茶飲', sub='手搖飲・現煮珍珠', signBg='#f4ead8', signColor='#5c3a21', band='#7a9a5a')),
    dict(id='B6', side='B', x0=30, x1=40, floors=5, wall='plaster', color='#e6dccb', ground='shop', shop=SHOP(type='fruit', name='阿忠水果', sub='當季水果・果汁', signBg='#f2b33e', signColor='#5c2a1a')),
    dict(id='B7', side='B', x0=40, x1=48, floors=4, wall='tile', color='#a89a88', ground='shop', shop=SHOP(type='brunch', name='半熟', sub='早午餐', signBg='#a07850', signColor='#ffffff', frame='#6b4a30')),   # ART-WZ2：原本是住家，改成早午餐店（AA_164）
    # Café 南北兩側（立面朝西，rotation.y=−π/2）
    dict(id='C1', pos=(55.4, -12.4), ry=-math.pi / 2, w=10, d=12, floors=5, wall='tile', color='#cbbba6', ground='shutter'),
    dict(id='C2', pos=(55.4, 11.2), ry=-math.pi / 2, w=7, d=12, floors=4, wall='mosaic', color='#d3cbbd', balcony=True, ground='door', door='#2f4a3a'),
    # 巷底（西端）的住家公寓（套件 endB；近景，原本沒換）
    dict(id='W0', pos=(-37.2, -1.0), ry=math.pi / 2, w=14, d=13, floors=4, wall='tile', color='#cdbfa8', balcony=True, ground='door', door='#5c3a21'),
    # 遠景（套件 detail:false）：far＝細節少一點（鐵窗少、沒有曬衣服與盆栽、冷氣少），材質與窗戶原型和近景共用 → draw call 不增加
    dict(id='F1', pos=(5.75, 21.0), ry=math.pi, w=12, d=10, floors=5, wall='tile', color='#c7b9a3', ground='door', far=True),
    dict(id='F2', pos=(-12.25, -20.0), ry=0.0, w=12, d=10, floors=4, wall='mosaic', color='#d6d0c2', ground='shutter', far=True),
    dict(id='F3', pos=(-33.4, 16.2), ry=math.pi, w=9, d=10, floors=4, wall='tile', color='#cfc4b2', ground='door', far=True),
    dict(id='F4', pos=(-33.4, -16.2), ry=0.0, w=9, d=10, floors=5, wall='tile', color='#d9cdb8', ground='door', far=True),
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
    dict(id='W2', pos=(-37.2, -13.0), ry=math.pi / 2, w=10, d=12, floors=4, wall='tile', color='#cbbfae', ground='door', far=True),
    # 小公園北側（ART-WZ1）：兩棟公寓（導航格外面 z>30，走不到），正面對著公園
    dict(id='P1', pos=(18.0, 30.9), ry=math.pi, w=12.2, d=10, floors=5, wall='tile', color='#cbbfac', ground='door', door='#4a4f52', far=True, p_grille=0.6),
    dict(id='P2', pos=(30.6, 30.9), ry=math.pi, w=12.6, d=10, floors=4, wall='mosaic', color='#d5cfc2', ground='door', door='#6a3a2a', far=True, p_grille=0.55),
]
GH, FH = 3.4, 3.1          # TK.apartment 的預設一樓高、樓高

# ---------------- 公館（--set gongguan）：照 zones3d.js gongguan 區塊的 shops（位置、寬度、樓層、牆、顏色、招牌、柱子），改那邊要一起改這裡 ----------------
if SET == 'gongguan':
    GH = 4.2                # 公館的騎樓店面一樓高 4.2 m（groundH）
    _SHOPS = [dict(n='阿鳳麵店', c='#c9463d', w=10, type='noodle', it='noodle', sub='乾麵・餛飩湯・小菜', v='阿鳳麵店', atlas='gg_afeng_h', vatlas='gg_afeng_v'), dict(n='清葉茶行', c='#2f7d5b', w=8, type='tea', it='tea', sub='手搖飲・現煮珍珠', atlas='gg_qingye_h'),
              dict(n='舊路書房', c='#3b5a8c', w=12, type='book', it='books', sub='法律書・文具・二手書', v='舊路書房', atlas='gg_jiulu_h', vatlas='gg_jiulu_v'), dict(n='日日便利', c='#3a6fb0', w=10, type='cvs', it='cvs', band='#e0a030', atlas='riri_mart_h'),
              dict(n='公館藥局', c='#4a9a6a', w=8, type='none', it='cvs', v='藥局', atlas='gg_yaoju_h', vatlas='gg_yaoju_v'), dict(n='滷味・鹹酥雞', c='#e0b24a', sc='#3b2a1e', w=8, type='none', it='luwei', atlas='gg_luwei_h'),
              dict(n='輪轉單車', c='#b5532c', w=9, type='bike', it='bike', sub='修車・打氣・配件加裝', v='單車', atlas='gg_lunzhuan_h', vatlas='gg_lunzhuan_v'), dict(n='咖啡・輕食', c='#8c3b47', w=9, type='none', it='cafe', atlas='gg_kafei_h'),
              dict(n='水果行', c='#e0a030', sc='#3b2a1e', w=8, type='none', it='fruit', atlas='gg_shuiguo_h'), dict(n='自助洗衣', c='#4a90c2', w=9, type='none', it='laundry', atlas='gg_laundry_h'),
              dict(n='影印・輸出', c='#2f3a44', w=9, type='none', it='print', v='影印', atlas='gg_yingyin_h', vatlas='gg_yingyin_v'), dict(n='日日定食', c='#5c3a21', w=10, type='none', it='teishoku', v='定食', atlas='gg_ririteishoku_h', vatlas='gg_ririteishoku_v'),
              dict(n='二手唱片', c='#2b2b2b', w=8, type='none', it='books', atlas='gg_changpian_h'), dict(n='文具・畫材', c='#8c3b47', w=9, type='none', it='books', atlas='gg_wenju_h'),
              dict(n='早午餐', c='#c9463d', w=9, type='none', it='cafe', atlas='gg_brunch_h')]
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
    SPECS = []; _x = -68.0
    for _i, _s in enumerate(_SHOPS):
        _last = _i == len(_SHOPS) - 1; _X0 = _x; _X1 = _x + _s['w'] + (1.2 if (_i < 8 and not _last) else 0.0); _W = _X1 - _X0; _cx = (_X0 + _X1) / 2
        _pl = [_W / 2]; _nb = max(1, round(_W / 5)) if _s['type'] == 'none' else 1
        for _k in range(1, _nb): _pl.append(_W / 2 - _k * _W / _nb)
        if _last: _pl.append(-_W / 2)
        _sp = dict(id=f'G{_i:02d}', pos=(_cx, 19.0), ry=math.pi, w=_W, d=16, floors=4 + ((_i * 5) % 4), wall=_WALLT[_i % 4], color=_WALLC[_i % 7],
                   balcony=_i % 3 == 1, tank=_i % 2 == 0, roofAdd=_i % 5 == 3, ground='arcade', pillars=_pl, rollbox=True, **_P,
                   shop=SHOP(type=_s['it'], name=_s['n'], sub=_s.get('sub', ''), signBg=_s['c'], signColor=_s.get('sc', '#ffffff'), band=_s.get('band', ''), atlas=_s.get('atlas'),
                             vertical=_s.get('v'), vatlas=_s.get('vatlas'), vBg='#ffffff', vColor=_s['c'], vBand=_s['c']))
        if _i in _VT: _t = _VT[_i]; _sp['vtenant'] = dict(vertical=_t[0], vBg=_t[1], vColor=_t[2], vBand=_t[2], len=_t[3], vatlas=_VTA.get(_i))
        if _i in _S2: _t = _S2[_i]; _sp['sign2f'] = dict(sign=_t[0], sub=_t[1], bg=_t[2], color=_t[3], band=_t[4], atlas=_S2A.get(_i))
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
if SET in ('lane118', 'nccu_food'):
    import json as _json
    if SET == 'lane118':
        _src = open(os.path.join(L.ROOT, 'src/data/lane118_layout.js'), encoding='utf8').read()
        LJ = _json.loads(_src[_src.index('{', _src.index('const LANE118_LAYOUT=')):_src.rindex('}') + 1])
    else:
        LJ = NCCU_FOOD
    GH, FH = LJ['groundH'], LJ['floorH']
    _TYPE = {'滇緬料理': 'teishoku', '自助餐': 'teishoku', '手搖飲': 'tea', '家常菜': 'teishoku', '咖啡': 'cafe', '義大利麵': 'cafe', '韓式': 'teishoku', '蛋包飯': 'cafe', '麵店': 'noodle',
             '滷味': 'noodle', '甜湯': 'teishoku', '早餐': 'teishoku', '鹹酥雞': 'noodle', '速食': 'cafe'}
    # 招牌底色、字色、色帶、雨遮（虛構店家，配色照店的類型）
    _LOOK = {'dian': ('#2f5d50', '#f4ead8', '#c9a24a', '#2f5d50'), 'self': ('#c9463d', '#ffffff', '', '#c9463d'), 'tea': ('#f4ead8', '#2f7d5b', '#2f7d5b', None),
             'home': ('#8c3b2a', '#f4ead8', '', '#3b5a8c'), 'cafe2': ('#3b2a1e', '#f4ead8', '', None), 'pasta': ('#f4f1ea', '#8c3b47', '#2f5d50', '#2f5d50'),
             'korea': ('#ffffff', '#c9463d', '#1f4e8c', '#c9463d'), 'omu': ('#f2c230', '#5c3a21', '', '#e0a030'), 'noodle2': ('#f4ead8', '#9c2f2a', '', '#9c2f2a'),
             'minzhong': ('#b8231c', '#ffffff', '', '#b8231c'), 'milksha': ('#3f6f8c', '#ffffff', '', None), 'fifty': ('#f4f1ea', '#2f5d50', '#2f5d50', None),
             'sichuan': ('#f4ead8', '#9c2f2a', '', None), 'mcd': ('#8c2a22', '#f4ead8', '#e0a030', None), 'mos': ('#2f4a3a', '#f4ead8', '', None)}
    _FILL = [('早餐店', 'teishoku', '#f2b33e', '#3b2a1e'), ('影印・輸出', 'print', '#2f3a44', '#ffffff'), ('自助洗衣', 'laundry', '#e9f2f6', '#2a5f8a'),
             ('水果行', 'fruit', '#e0a030', '#3b2a1e'), ('二手書', 'books', '#2f4a3a', '#f4ead8'), ('文具', 'books', '#8c3b47', '#ffffff')]
    _WALLC = ['#d9cbb0', '#cfc5b2', '#e3ddd0', '#c8bca8', '#d6c3a5', '#e6dfd0', '#bfb2a0', '#cdbfa8']; _WALLT = ['tile', 'mosaic', 'tile', 'plaster']
    _DOOR = ['#9c2f2a', '#2f4a3a', '#5c3a21', '#8a3a2a']
    _P = dict(p_grille=0.6, p_pot=0.45, p_ac=0.6)
    Z0, Z1 = LJ['lane']['z0'], LJ['lane']['z1']
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
            elif w < 2.6: base.update(ground='door', door=_DOOR[_n % 4], floors=max(3, base['floors']))
            elif SET == 'nccu_food': base.update(ground=['shutter', 'door'][_n % 2], door=_DOOR[_n % 4])
            else:
                g = ['door', 'shutter', 'shop'][_n % 3]
                if g == 'shop':
                    nm, ty, bg, fg = _FILL[_fi % len(_FILL)]; _fi += 1
                    base.update(ground='shop', shop=SHOP(type=ty, name=nm, sub='', signBg=bg, signColor=fg, band=''))
                else: base.update(ground=g, door=_DOOR[_n % 4])
            SPECS.append(base); _n += 1

random.seed(707)
B.reset(texres=512)
_RN = {'gongguan': 'gongguan_shops', 'lane118': 'lane118_street', 'nccu_food': 'nccu_food_street'}.get(SET, 'wenzhou_street')
root = B.group(_RN, props={'kind': _RN})
base = CL.materials()      # Café 的共用材質（鋁窗、鐵窗、冷氣、浪板、水塔、植物…，名稱相同→遊戲同一套夜間設定）
_mats = {}


NEUTRAL = {'tile': '#dadada', 'mosaic': '#dadada', 'plaster': '#e9e9e9'}   # 外牆貼圖的平均色（最亮的那棟也不超過，頂點色 ≤ 1）


def wall_mat(kind):
    """外牆：tile＝長條磁磚、mosaic＝小方塊馬賽克、plaster＝水泥漆。每一種只有一個材質、一張中性灰的貼圖：
    每棟的顏色放在頂點色（glTF COLOR_0，three.js 乘上貼圖）→ 同一種外牆整條巷子合成一次 draw call、只存一張貼圖"""
    if kind not in _mats:
        nm = f'wz_wall_{kind}'; c = NEUTRAL[kind]
        if kind == 'mosaic': m = L.pbr(nm, 'rounded_square_tiled_wall', tile=1.0, target=c, normal=0.8, maps=('diff', 'nor'), rough_value=0.45)
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


def potted_proto(kind, r, h, lift, size, n, seed):
    """盆栽（instancing）：陶盆＋葉片卡。原點＝盆底中央"""
    random.seed(seed)
    pm = Mesh('pot', M['pot_terra']); pot(pm, 0.0, 0.0, r, h, 'taper4', y0=0.0, seg=8)   # 街上的盆栽：8 邊、4 點輪廓（Café 裡 18 邊）
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
def broad_proto(r, h, seed):
    """大葉盆栽（instancing）：陶盆＋土＋plants.py 的模型葉子（v6d：葉片卡的大葉子遠看像折紙）。原點＝盆底中央"""
    import plants as PL_
    if '_PLM_ST' not in globals(): globals()['_PLM_ST'] = PL_.materials('wz_pl_')
    random.seed(seed)
    pm = Mesh('pot', M['pot_terra']); pot(pm, 0.0, 0.0, r, h, 'taper4', y0=0.0, seg=8); parts = [pm.finish(None, smooth=True)]
    tmp = B.group('tmp_pl', None)
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=r * 0.95, radius2=r * 0.95, depth=0.02); bmesh.ops.translate(bm, verts=bm.verts, vec=g2b(0.0, h - 0.03, 0.0)); B.mesh_obj('tmp_pl_soil', bm, _PLM_ST['soil'], tmp)
    PL_.broad_plant(B.mesh_obj, _PLM_ST, 'tmp_pl', tmp, 0.0, h - 0.02, 0.0, 0.62, 0.42, seed, stems=3, leaf_n=4)   # 街上的盆栽遠看：3 根莖（室內 5 根）、葉子 4 段（室內 6）
    for ob in list(tmp.children):
        ob.parent = None
        if ob.data.materials and 'leaf_' in ob.data.materials[0].name: L.smooth_mesh(ob, angle=1.2)
        parts.append(ob)
    bpy.data.objects.remove(tmp)
    return combine(parts, f'potted_broad_{seed}')


POT_BROAD = broad_proto(0.16, 0.3, 13)
random.seed(707)

# 累積的網格（同材質一個）：用 dict 依材質名取用
_acc = {}
def acc(mat, name=None):
    k = mat.name
    if k not in _acc: _acc[k] = Mesh(name or ('wz_' + k), mat)
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
    return ob


def apartment(spec):
    xf, Wd, Dd = place(spec); F = spec['floors']; totalH = GH + (F - 1) * FH; rng = random.Random(sum(ord(c) * (i + 7) for i, c in enumerate(spec['id'])))   # 固定種子（Python 的 hash() 每次執行不同）
    lrng = random.Random(len(spec['id']) * 131 + ord(spec['id'][0]) * 7 + ord(spec['id'][1]))                                # 曬衣服用另一個亂數（不改變窗、冷氣的配置）
    kind = spec['wall']; wall = Mesh(f'wall_{spec["id"]}', wall_mat(kind))     # 這棟的外牆（一個物件，頂點色＝牆色）
    gt = spec['ground']; rec = 1.3 if gt == 'shop' else (4.3 if gt == 'arcade' else 0.2)
    if SET == 'gongguan' and 'sf' not in spec and spec['id'] in SF_GG and gt == 'arcade': spec = dict(spec, sf=SF_GG[spec['id']])   # ART-GG-SHOPS-1018：公館騎樓店面（wz_shopkit.arcade_front_v2）
    if SET == 'wenzhou' and 'sf' not in spec:   # ART-WZ0（2026-10-16）：溫州街的店面組件（wz_shopkit.py）；公館、118 巷照舊
        sfx = SF.get(spec['id']) or SF_HOUSE.get(spec['id']) or SF_SHUTTER.get(spec['id'])
        if sfx: spec = dict(spec, sf=sfx)
    if gt == 'shop' and spec.get('sf'): rec = spec['sf'].get('recess', 0.9) + (2.7 if spec['sf'].get('inner') else 1.3)   # 店門退縮成門廊；有立體淺店內的，一樓牆體從玻璃後 2.7 m 開始
    if gt == 'arcade' and spec.get('sf') and not spec['sf'].get('split'): rec = 3.0 + (DI + 0.12 if (spec['sf'].get('inner') or spec['sf'].get('kind') == 'tea') else 1.3)   # 公館騎樓店面：騎樓 3 m＋店內（茶飲的立體櫃台 DI、其他是景深卡 1.3）
    if gt == 'arcade' and spec.get('sf', {}).get('split'): rec = 3.0 + 2.6 + 0.02   # B5：騎樓 3 m＋後面兩間 2.6 m 深的立體小店；牆體再退 2 cm——原本和小店後牆同一個平面，從騎樓看進去會閃（BUG-WZFLICKER）
    W = Wd; D = Dd
    # ---- 樓上的窗：每層 n 扇（和套件相同的算法：n＝round(W/3.6)）
    n = max(1, round(W / 3.6)); ww = min(2.2, W / n - 0.9); wh = 1.5
    wins = []
    for f in range(1, F):
        yc = GH + (f - 1) * FH + FH * 0.52
        for i in range(n):
            x = -W / 2 + (i + 0.5) * W / n
            far = spec.get('far')   # 遠景：只有窗＋少量鐵窗，沒有雨遮、冷氣（instancing 的原型整條巷子一組，任何鏡頭都整組畫出來：遠景加太多會超過三角形預算）
            kind_ = 'balcony' if (spec.get('balcony') and i == n // 2 and f == 1) else ('grille' if rng.random() < spec.get('p_grille', 0.15 if far else 0.7) else 'plain')   # p_*：每棟可調（公館商店街；預設和溫州街一樣）
            wins.append(dict(f=f, x=x, y0=yc - wh / 2, y1=yc + wh / 2, kind=kind_, hood=(not far and kind_ != 'grille' and rng.random() < 0.5), ac=(not far and rng.random() < spec.get('p_ac', 0.65)), lit=rng.random() < 0.35, acs=rng.choice((-1, 1))))
    if SET == 'gongguan':
        if spec.get('sign2f'): wins = [w for w in wins if w['f'] != 1]   # 二樓整面大招牌：二樓不開窗
        # 直立招牌（店的、樓上住戶的）旁邊的窗不加鐵窗、雨遮、冷氣（不然會穿過招牌）
        vs = []
        if gt in ('shop', 'arcade') and spec['shop'].get('vertical'): vs.append((W / 2 - 0.5, GH + 0.3, GH + 2.9))
        if spec.get('vtenant'): vs.append((-W / 2 + 0.5, GH + 0.3, GH + 0.3 + spec['vtenant']['len']))
        for w in wins:
            for vx, a, b in vs:
                if abs(w['x'] - vx) < 1.6 and w['y0'] - 1.0 < b and w['y1'] + 0.6 > a:
                    if w['kind'] == 'grille': w['kind'] = 'plain'
                    w['hood'] = False; w['ac'] = False
    # ---- 牆：一樓以上（留窗洞，牆厚 0.25）
    for f in range(1, F):
        y0 = GH + (f - 1) * FH; y1 = y0 + FH
        ws = sorted([w for w in wins if w['f'] == f], key=lambda w: w['x'])
        xs = [-W / 2] + [v for w in ws for v in (w['x'] - ww / 2, w['x'] + ww / 2)] + [W / 2]
        for k in range(0, len(xs), 2): xf.box(wall, xs[k], xs[k + 1], y0, y1, -0.25, 0)
        for w in ws:   # 窗下的牆停在窗台裡面（低 1 cm）：原本牆頂和窗台頂同一個平面，一直閃（BUG-WZFLICKER）
            xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'] - 0.01, -0.25, 0); xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -0.25, 0)
    xf.box(wall, -W / 2, W / 2, totalH, totalH + 0.9, -0.2, 0)                                   # 女兒牆
    band = acc(M['band'])
    for sd in (-1, 1):
        if spec.get('side_wins') == ('+x' if sd > 0 else '-x'): side_windows(spec, xf, wall, band, W, D, F, totalH, sd, rng)   # 側面朝巷子：開窗
        elif sd < 0: xf.box(wall, -W / 2, -W / 2 + 0.2, GH, totalH + 0.9, -D, -0.25)
        else: xf.box(wall, W / 2 - 0.2, W / 2, GH, totalH + 0.9, -D, -0.25)
    xf.box(wall, -W / 2, W / 2, GH, totalH + 0.9, -D, -D + 0.2)
    for f in range(1, F): xf.box(band, -W / 2 - 0.03, W / 2 + 0.03, GH + (f - 1) * FH - 0.09, GH + (f - 1) * FH + 0.09, -0.25, 0.08)
    xf.box(band, -W / 2 - 0.04, W / 2 + 0.04, totalH + 0.9, totalH + 0.97, -0.26, 0.05)
    xf.box(acc(M['roof']), -W / 2 + 0.2, W / 2 - 0.2, totalH - 0.05, totalH + 0.05, -D + 0.2, -0.2)
    # ---- 窗（instancing）＋窗簾；鐵窗／雨遮／冷氣／陽台
    ac_at = []
    for w in wins:
        x0, x1, y0, y1, cx = w['x'] - ww / 2, w['x'] + ww / 2, w['y0'], w['y1'], w['x']
        inst(window_proto(wh, 'shell'), f'win_{spec["id"]}', xf, cx, y0, 0.0, sx=ww / WIN_W)
        inst(window_proto(wh, 'lit' if w['lit'] else 'dark'), f'pane_{spec["id"]}', xf, cx, y0, 0.0, sx=ww / WIN_W)
        cm = acc(M['curtain_lit'] if w['lit'] else M['curtain']); cw = ww * rng.uniform(0.3, 0.55)
        if rng.random() < 0.5: xf.quad(cm, [(x1 - cw, y0 + 0.03, -0.29), (x1 - 0.03, y0 + 0.03, -0.29), (x1 - 0.03, y1 - 0.05, -0.29), (x1 - cw, y1 - 0.05, -0.29)])
        else: xf.quad(cm, [(x0 + 0.03, y0 + 0.03, -0.29), (x0 + cw, y0 + 0.03, -0.29), (x0 + cw, y1 - 0.05, -0.29), (x0 + 0.03, y1 - 0.05, -0.29)])
        if w['kind'] == 'grille':
            inst(GRILLE, f'grille_{spec["id"]}', xf, cx, y0 - 0.14, 0.0); inst(HOOD, f'ghood_{spec["id"]}', xf, cx, y0 - 0.14 + 1.77, 0.0)
            if not spec.get('far') and lrng.random() < 0.28: bake(LAUNDRY[lrng.randrange(3)], f'laundry_{spec["id"]}', xf, cx, y0 - 0.14, 0.0)
            if not spec.get('far') and rng.random() < spec.get('p_pot', 0.6):
                px_ = cx + rng.uniform(-0.9, 0.9); pz_ = rng.uniform(0.16, 0.28); q = xf.p(px_, 0, pz_)
                B.instance(POT_FERN[rng.randrange(2)], f'pot_{spec["id"]}_{len(_inst)}', q[0], y0 - 0.11, q[2], root, ry=rng.uniform(0, 2 * math.pi)); _inst.append(1)
        elif w['kind'] == 'balcony':
            bx0, bx1, bd = x0 - 0.6, x1 + 0.6, 1.05; xf.box(band, bx0, bx1, y0 - 0.3, y0 - 0.16, -0.25, bd)
            xf.box(wall, bx0, bx1, y0 - 0.16, y0 + 0.4, bd - 0.12, bd); xf.box(wall, bx0, bx0 + 0.12, y0 - 0.16, y0 + 0.4, 0, bd); xf.box(wall, bx1 - 0.12, bx1, y0 - 0.16, y0 + 0.4, 0, bd)
            rl = acc(M['grille']); xx = bx0 + 0.06
            while xx < bx1 - 0.05: xf.box(rl, xx - 0.01, xx + 0.01, y0 + 0.4, y0 + 0.92, bd - 0.07, bd - 0.05); xx += 0.13
            xf.box(rl, bx0, bx1, y0 + 0.9, y0 + 0.94, bd - 0.09, bd - 0.03)
            for k in range(3):
                q = xf.p(bx0 + 0.5 + k * (bx1 - bx0 - 1.0) / 2, 0, bd - 0.45)
                B.instance(POT_BROAD, f'bpot_{spec["id"]}_{len(_inst)}', q[0], y0 - 0.16, q[2], root, ry=rng.uniform(0, 2 * math.pi)); _inst.append(1)
        elif w['hood']:
            inst(HOOD, f'hood_{spec["id"]}', xf, cx, y1 + 0.18, 0.0)
        if w['ac'] and w['kind'] != 'balcony':
            ax = cx + w['acs'] * (ww / 2 + 0.55)
            if -W / 2 + 0.5 < ax < W / 2 - 0.5 and not any(f_ == w['f'] and abs(ax - x_) < 0.9 for (f_, x_) in ac_at):   # 兩扇窗中間只放一台（原本左右兩扇各放一台、疊在一起，會閃）
                ac_at.append((w['f'], ax)); inst(AC, f'ac_{spec["id"]}', xf, ax, y0 - 0.2, 0.0)
                xf.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)
    # ---- 頂樓：水塔、頂樓加蓋
    if spec.get('roofAdd'):
        aw, ad = W * 0.7, D * 0.55; ra = acc(M['corr']); xf.box(ra, -aw / 2, aw / 2, totalH, totalH + 2.4, -D * 0.5 - ad / 2, -D * 0.5 + ad / 2)
        xf.box(band, -aw / 2 - 0.15, aw / 2 + 0.15, totalH + 2.4, totalH + 2.5, -D * 0.5 - ad / 2 - 0.15, -D * 0.5 + ad / 2 + 0.15)
    elif spec.get('tank', True):
        tx = rng.uniform(-W / 2 + 1.5, W / 2 - 1.5); wx, _, wz = xf.p(tx, 0, -D * 0.45); B.instance(TANK, f'tank_{spec["id"]}', wx, totalH, wz, root, ry=xf.ry)
    if SET == 'wenzhou' and spec['id'] in REAR: rear_facade(spec, xf, W, D, F, totalH)   # 背面對著小公園（ART-WZ1）
    upper_signs(spec, xf, W, totalH)
    # ---- 一樓：牆體和樓上同一種外牆（側面露在巷口時不會變成另一種材質）；店面兩側的石材壁柱
    xf.box(wall, -W / 2, W / 2, 0, GH, -D, -rec)                                                  # 一樓牆體（店面退縮）
    gw = acc(M['gwall'])
    if gt in ('shop', 'arcade') and not spec.get('sf'):
        r0 = 3.0 if gt == 'arcade' else 0.0
        # 公館的騎樓：店與店之間的壁柱貼和柱子一樣的磁磚（磨石子在騎樓裡近看是一大片斑點，像髒汙；溫州街照舊）
        pm = acc(M['pillar']) if (gt == 'arcade' and SET == 'gongguan') else gw
        for sx in (-1, 1): xf.box(pm, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0, GH, -rec, -r0)
    else:                                                                                          # 住家／鐵捲門：牆腳的磨石子護牆
        # 鐵捲門、住家鐵門的地方不做護牆：原本護牆整條橫過去，門片／捲門片正好在護牆正面的同一個平面上，下面 0.9 m 一直閃（BUG-WZFLICKER）
        gaps = [(-W / 2 + 0.4, W / 2 - 0.4)] if gt == 'shutter' else ([(-W * 0.2 - 0.72, -W * 0.2 + 0.72)] if not spec.get('sf') else [])
        xs_ = [-W / 2] + [v for g_ in gaps for v in g_] + [W / 2]
        for k in range(0, len(xs_), 2):
            if xs_[k + 1] - xs_[k] > 0.01: xf.box(gw, xs_[k], xs_[k + 1], 0, 0.9, -rec - 0.02, -rec + 0.04)
    xf.box(band, -W / 2, W / 2, GH - 0.12, GH, -0.25, 0.06)
    if gt == 'arcade' and spec.get('sf', {}).get('split'): arcade_split_v2(spec, xf, W, wall)
    elif gt == 'arcade' and spec.get('sf'): arcade_front_v2(spec, xf, W, wall)
    elif gt in ('shop', 'arcade'): shopfront_v2(spec, xf, W, gt, wall) if (spec.get('sf') and gt == 'shop') else shopfront(spec, xf, W, gt)
    elif gt == 'shutter':
        shutter(spec, xf, W, rec)
        if spec.get('sf'): shutter_v2(spec, xf, W, rec)
    else:
        housefront_v2(spec, xf, W, rng, rec) if spec.get('sf') else housedoor(spec, xf, W, rng, rec)
    set_tint(wall.finish(root), spec['color'], kind)


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


def side_windows(spec, xf, wall, band, W, D, F, totalH, sd, rng):
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
        for k in range(0, len(xs), 2): sx_.box(wall, xs[k], xs[k + 1], y0, y1, -T, 0)
        for w in ws: sx_.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'] - 0.01, -T, 0); sx_.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -T, 0)   # 窗下的牆停在窗台裡面
        # 樓板線：往正面多伸 0.325 m 接到正面的樓板線（側牆座標 sd<0 時正面在 +x'）。比正面的薄 1 cm、停在正面樓板線的前緣後 5 mm：
        # 重疊的地方不能有同一個平面上的面（Cycles 會變黑、遊戲裡會閃爍）
        if f > 1: sx_.box(band, -Ls / 2 - (0.325 if sd > 0 else 0), Ls / 2 + (0.325 if sd < 0 else 0), y0 - 0.085, y0 + 0.085, -T, 0.08)
    sx_.box(wall, -Ls / 2 - (0.05 if sd > 0 else 0), Ls / 2 + (0.05 if sd < 0 else 0), totalH, totalH + 0.9, -T, 0)   # 女兒牆：接到正面的女兒牆（正面的在 z −0.2…0，原本中間有 5 cm 的縫）
    ac_at = []
    for w in wins:
        cx, y0, y1 = w['x'], w['y0'], w['y1']; x0, x1 = cx - ww / 2, cx + ww / 2
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
        vx = W / 2 - 0.5; vy0, vy1 = GH + 0.3, GH + 2.9
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
if SET in ('wenzhou', 'gongguan'): exec(open(os.path.join(HERE, 'wz_shopkit.py'), encoding='utf-8').read())   # ART-WZ0 店面組件（同一個命名空間）；公館只用招牌設計稿（日日便利和溫州街同一家連鎖，招牌要一樣），店面照舊
for sp in SPECS: apartment(sp)
if SET in ('wenzhou', 'gongguan'): build_notes()   # 玻璃上的紙條（公館騎樓店面也有，ART-GG-SHOPS-1018）
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

# 第三輪減量（效能，2026-10-16；LAWWW-B 量到主巷三個鏡頭 355～448 次 draw call、51～55 萬三角形，目標 310／42 萬）：
# 其他所有純色材質（v6 店面組件的碗盤、水果、木頭、不鏽鋼、盆栽的葉子和土…）也照粗糙度、金屬度分到三個頂點色材質；
# 遊戲用材質名做事的（晚上發光 WZ_NIGHT、樹幹透視、字牌 *_FACE_ 的材質）不動。
# 這一輪合進來的都是小東西（店裡的碗盤水果、凳子、盆栽、電表…）：用不投影的頂點色材質——遊戲的 WZ_NO_SHADOW 對 cafe_vc_ 開頭的材質不投影
# （第一次量：合進會投影的 wz_vc_* 以後，陰影那一輪多了 2 萬個三角形）。門、窗框、雨遮、冷氣、鐵窗這些照舊在 wz_vc_*（投影）。
VC_GLOSS = L.vc_material('cafe_vc_wz_gloss', rough=0.35)
VC_SMATTE = L.vc_material('cafe_vc_wz_matte', rough=0.85); VC_SMETAL = L.vc_metal('cafe_vc_wz_metal', rough=0.45, metal=0.35)
WZ_KEEP = {'wz_signs_lit', 'ext_glass_lit', 'wz_room_lit', 'wz_win_glass_lit', 'cafe_bulb', 'wz_tube', 'jp_lamp', 'jp_shoji', 'wz_lamp_lens', 'wz_pillar_tile', 'wz_pole_concrete'}
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
print('vc_consolidate:', len(WZ_VC), 'materials ->', sorted({v.name for v in WZ_VC.values()}), sorted(k for k, v in WZ_VC.items() if v.name.startswith('cafe_vc_wz')))
_keep = lambda ob: 'FACE' in ob.name or 'SEASON' in ob.name or (ob.parent is not None and 'SEASON' in ob.parent.name)
L.realize_small_instances(root, keep=_keep)   # 只擺一兩個的店面小物（店裡的冰箱、販賣機、麵攤、傘架、電表…）不用 instancing，合進大網格
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
L.vc_consolidate(root, WZ_VC)
L.split_by_material(root, keep=_keep)
# 小貼圖材質（店內地板、條紋雨遮、菜單、書背…）合成一張貼圖集（效能第二輪，2026-10-16）
WZ_TEXT = {'wz_signs', 'wz_in_board', 'wz_in_price', 'wz_menu_ice', 'wz_menu_tea', 'wz_noren', 'wz_shop_notes'}   # 有字的（招牌設計稿、菜單、價目、告示）不進貼圖集：縮小以後字糊掉（第一次試：招牌整片灰）
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
    L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name or 'SEASON' in ob.name or (ob.parent is not None and 'SEASON' in ob.parent.name))
info = L.export(OUT, gpu_instances=True)
info.update({'buildings': [s['id'] for s in SPECS]})
L.write_json(OUT[:-4] + '.json', info)
