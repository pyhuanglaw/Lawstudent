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
    dict(id='A1', side='A', x0=-12, x1=-4, floors=4, wall='tile', color='#d9c9a8', ground='shop', shop=SHOP(type='print', name='大學影印', sub='影印・裝訂・論文輸出', signBg='#f4f1ea', signColor='#1f4e8c', band='#1f4e8c', vertical='影印', vBg='#ffffff', vColor='#1f4e8c', vBand='#1f4e8c')),
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
    dict(id='B7', side='B', x0=40, x1=48, floors=4, wall='tile', color='#a89a88', ground='door', door='#8a3a2a'),
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
]
GH, FH = 3.4, 3.1          # TK.apartment 的預設一樓高、樓高

# ---------------- 公館（--set gongguan）：照 zones3d.js gongguan 區塊的 shops（位置、寬度、樓層、牆、顏色、招牌、柱子），改那邊要一起改這裡 ----------------
if SET == 'gongguan':
    GH = 4.2                # 公館的騎樓店面一樓高 4.2 m（groundH）
    _SHOPS = [dict(n='阿鳳麵店', c='#c9463d', w=10, type='noodle', it='noodle', sub='乾麵・餛飩湯・小菜', v='阿鳳麵店'), dict(n='青葉茶行', c='#2f7d5b', w=8, type='tea', it='tea', sub='手搖飲・現煮珍珠'),
              dict(n='舊路書房', c='#3b5a8c', w=12, type='book', it='books', sub='法律書・文具・二手書', v='舊路書房'), dict(n='全日便利商店', c='#3a6fb0', w=10, type='cvs', it='cvs', band='#e0a030'),
              dict(n='公館藥局', c='#4a9a6a', w=8, type='none', it='cvs', v='藥局'), dict(n='滷味・鹹酥雞', c='#e0b24a', sc='#3b2a1e', w=8, type='none', it='teishoku'),
              dict(n='眼鏡・手機維修', c='#5a5a7a', w=9, type='none', it='print', v='眼鏡'), dict(n='咖啡・輕食', c='#8c3b47', w=9, type='none', it='cafe'),
              dict(n='水果行', c='#e0a030', sc='#3b2a1e', w=8, type='none', it='fruit'), dict(n='自助洗衣', c='#4a90c2', w=9, type='none', it='laundry'),
              dict(n='影印・輸出', c='#2f3a44', w=9, type='none', it='print', v='影印'), dict(n='日日定食', c='#5c3a21', w=10, type='none', it='teishoku', v='定食'),
              dict(n='二手唱片', c='#2b2b2b', w=8, type='none', it='books'), dict(n='文具・畫材', c='#8c3b47', w=9, type='none', it='books'), dict(n='早午餐', c='#c9463d', w=9, type='none', it='cafe')]
    _WALLC = ['#d9cbb0', '#cfc5b2', '#e3ddd0', '#c8bca8', '#d6c3a5', '#e6dfd0', '#bfb2a0']; _WALLT = ['tile', 'mosaic', 'tile', 'plaster']
    # 樓上的住戶（套件沒有；台北商店街的樓上是補習班、診所、髮廊…）：直立招牌（建築另一側：字、底色、字色、長度）、二樓整面大招牌（二樓不開窗）、屋頂廣告看板
    _VT = {1: ('美髮', '#ffffff', '#c9463d', 2.6), 4: ('中醫診所', '#f4ead8', '#2f5d50', 4.2), 6: ('民宿', '#ffffff', '#3b5a8c', 2.6), 7: ('數學補習', '#fff2a8', '#c9463d', 4.2),
           8: ('按摩', '#ffffff', '#8c3b47', 2.6), 10: ('健身房', '#2b2b2b', '#e0b24a', 4.2), 12: ('鋼琴教室', '#ffffff', '#2f3a44', 4.2), 14: ('撞球', '#c9463d', '#ffffff', 2.6)}
    _S2 = {2: ('文理補習班', '高中・轉學考・研究所', '#1f4e8c', '#ffffff', '#e0a030'), 5: ('小火鍋', '二樓・學生套餐', '#c9463d', '#ffffff', ''),
           9: ('桌遊・撞球', '二樓', '#2f3a44', '#f4ead8', '#e0b24a'), 11: ('牙醫診所', '週日休診', '#ffffff', '#2f7d5b', '#2f7d5b'), 13: ('英語會話', '小班制・多益', '#f4ead8', '#8c3b47', '#8c3b47')}
    _RS = {7: ('學生套房出租', '近捷運・月租', '#ffffff', '#c9463d', '#c9463d')}
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
                   shop=SHOP(type=_s['it'], name=_s['n'], sub=_s.get('sub', ''), signBg=_s['c'], signColor=_s.get('sc', '#ffffff'), band=_s.get('band', ''),
                             vertical=_s.get('v'), vBg='#ffffff', vColor=_s['c'], vBand=_s['c']))
        if _i in _VT: _t = _VT[_i]; _sp['vtenant'] = dict(vertical=_t[0], vBg=_t[1], vColor=_t[2], vBand=_t[2], len=_t[3])
        if _i in _S2: _t = _S2[_i]; _sp['sign2f'] = dict(sign=_t[0], sub=_t[1], bg=_t[2], color=_t[3], band=_t[4])
        if _i in _RS: _t = _RS[_i]; _sp['roofsign'] = dict(sign=_t[0], sub=_t[1], bg=_t[2], color=_t[3], band=_t[4])
        if _i == 0: _sp['side_wins'] = '+x'   # 麵店西側（朝往溫州街的巷子）開窗
        SPECS.append(_sp); _x = _X1
    # 巷口轉角（往溫州街的巷子西側）：一般店面、沒有騎樓（照套件 cb）；東側朝巷子開窗
    SPECS.append(dict(id='G15', pos=(-81.0, 19.0), ry=math.pi, w=14.0, d=16, floors=5, wall='tile', color='#cdbfa8', balcony=True, tank=True, ground='shop', side_wins='-x', **_P,
                      shop=SHOP(type='teishoku', name='豆花・甜湯', sub='粉圓・芋圓・紅豆', signBg='#f4ead8', signColor='#5c3a21', band='#c9a24a')))

# ---------------- 118 巷（--set lane118，⑭）：照 src/data/lane118_layout.js（LAWWW 的配置；遊戲的導航、店門互動點讀同一份，兩邊一定對得上） ----------------
# 巷子南北向（x 往東、z 往南）：西側立面在 x=facade.west、朝東（ry=π/2：建築的 +x＝世界 −z）；東側在 x=facade.east、朝西（ry=−π/2：建築的 +x＝世界 +z）。
# 配置裡的 9 間店照 z0～z1 蓋（店門在中間）；店與店之間的空檔補上沒有互動的樓房：寬度不到 2.6 m 的是住家樓梯間（紅／綠鐵門），其他是住家、鐵捲門、一般小店；
# 兩條小巷（alleys）不蓋（走不進去的背景巷由遊戲做）；靠小巷、靠和平東路／辛亥路的那一面開側窗。店名是虛構的（配置裡的名字）。
# 政大山下（--set nccu_food；LAWWW2-B 2026-10-16；outings3d.js 的 nccu_food「政大・山下的小吃街」）：只給 bg_nccu.py 算 2D 背景（沒有導航）。
# 使用者 2026-10-16：「政大附近有麥當勞 和主要什麼學生會去的店你要實際查 不要虛構」→ 照查證（docs/art-rebuild/second_ai/research/nccu_real_shops.md）：
# 指南路二段 57～67 號（政大側門「麥側」斜對面、學生人流最多的一段）由南往北：敏忠小吃 57、迷客夏 59、50嵐 63、一樓甜品店＋二樓四川飯館 65、麥當勞 67（三層）。
# 店面寬度、樓層數、配色是推估（沒有看到照片）；只有一側（W）有房子，對面是指南路和校園（bg_nccu.py 做）。招牌只寫店名，不畫商標圖形。
NCCU_FOOD = {"sides": ["W"], "lane": {"x0": -3.0, "x1": 3.0, "z0": -40.0, "z1": 14.0}, "facade": {"west": -4.6, "east": 4.6}, "floorH": 3.1, "groundH": 3.5, "alleys": [],
             "shops": [{"id": "minzhong", "side": "W", "z0": 6.0, "z1": 11.0, "floors": 4, "name": "敏忠小吃", "type": "家常菜"},
                       {"id": "milksha", "side": "W", "z0": 2.0, "z1": 6.0, "floors": 4, "name": "迷客夏", "type": "手搖飲"},
                       {"id": "fifty", "side": "W", "z0": -2.0, "z1": 2.0, "floors": 4, "name": "50嵐", "type": "手搖飲"},
                       {"id": "sichuan", "side": "W", "z0": -7.0, "z1": -2.0, "floors": 4, "name": "冰品・甜湯", "type": "甜湯", "vsign": "四川飯館"},
                       {"id": "mcd", "side": "W", "z0": -15.0, "z1": -7.0, "floors": 3, "name": "麥當勞", "type": "速食"},
                       {"id": "mos", "side": "W", "z0": -25.0, "z1": -19.0, "floors": 4, "name": "摩斯漢堡", "type": "速食"}]}
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
             'minzhong': ('#b8231c', '#ffffff', '', '#b8231c'), 'milksha': ('#2f7d5b', '#ffffff', '', None), 'fifty': ('#ffffff', '#1f4e8c', '#1f4e8c', None),
             'sichuan': ('#f4ead8', '#9c2f2a', '', None), 'mcd': ('#c8102e', '#ffc72c', '', None), 'mos': ('#ffffff', '#c8102e', '#2f7d5b', None)}
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


def grille_mesh(w_, h_, dep=0.42):
    m = Mesh('grille_proto', M['grille']); b = 0.018; n = max(6, int(w_ / 0.12))
    for i in range(n + 1):
        x = -w_ / 2 + i * w_ / n; bar(m, x - b / 2, x + b / 2, 0, h_, dep - b, dep)
    for y in (0.0, 0.32, h_ * 0.55, h_ - b * 1.6): bar(m, -w_ / 2, w_ / 2, y, y + b * 1.6, dep - b * 1.5, dep + 0.005)
    for s in (-1, 1):
        x = s * w_ / 2
        for k in range(4): bar(m, x - b / 2, x + b / 2, 0, h_, dep * k / 3 - b / 2, dep * k / 3 + b / 2)
        for y in (0.0, h_ * 0.55, h_ - b * 1.6): bar(m, x - b / 2, x + b / 2, y, y + b * 1.6, 0, dep)
    for k in range(3): m.box(-w_ / 2, w_ / 2, 0.0, 0.03, dep * (k + 0.5) / 3 - 0.03, dep * (k + 0.5) / 3 + 0.03)   # 底下的踏板（扁平，兩端蓋子看得到，不省）
    return proto(m.finish(None))


def hood_mesh(w_, dep=0.62):
    m = Mesh('hood_proto', M['corr'], tile=1.12)
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)][::-1])
    m.quad([(-w_ / 2, 0.16, -0.02), (w_ / 2, 0.16, -0.02), (w_ / 2, 0.0, dep), (-w_ / 2, 0.0, dep)])
    fr = Mesh('hood_frame', M['grille']); fr.box(-w_ / 2, w_ / 2, -0.03, 0.01, dep - 0.03, dep + 0.01)
    return combine([m.finish(None), fr.finish(None)], 'hood_proto')


def ac_mesh(lite=False):
    """冷氣室外機。lite（公館）：風扇格柵 5 條、側面散熱條 6 條、風扇 14 邊、細條去掉看不到的端蓋（328 → 約 200 個三角形；冷氣都在二樓以上，從街上看不出差別）"""
    body = Mesh('ac_body', M['ac']); body.box(-0.4, 0.4, 0, 0.56, 0, 0.3)
    fan = Mesh('ac_fan', M['ac_dark']); fan.cyl((0.1, 0.28, 0.3), (0.1, 0.28, 0.305), 0.21, seg=14 if lite else 20)
    if lite:
        for k in range(5): bar(fan, -0.13, 0.33, 0.12 + k * 0.08, 0.13 + k * 0.08, 0.304, 0.312)
        for k in range(6): bar(fan, -0.38, -0.2, 0.08 + k * 0.07, 0.095 + k * 0.07, 0.3, 0.306)
    else:
        for k in range(7): fan.box(-0.13, 0.33, 0.1 + k * 0.06, 0.11 + k * 0.06, 0.304, 0.312)
        for k in range(9): fan.box(-0.38, -0.2, 0.06 + k * 0.05, 0.075 + k * 0.05, 0.3, 0.306)
    br = Mesh('ac_bracket', M['metal'])
    for x in (-0.4, 0.4): br.box(x - 0.02, x + 0.02, -0.06, 0.0, -0.02, 0.36); br.box(x - 0.02, x + 0.02, -0.3, 0.0, -0.02, 0.02)
    return combine([body.finish(None), fan.finish(None), br.finish(None)], 'ac_unit')


def tank_mesh():
    t = Mesh('tank', M['tank']); bmt = L.lathe([(0.0, 0.0), (0.55, 0.0), (0.6, 0.08), (0.6, 1.1), (0.55, 1.2), (0.25, 1.38), (0.0, 1.42)], seg=18)
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
        bar(al, x0, x1, y0, y0 + t, fz - 0.05, fz + 0.03); bar(al, x0, x1, y1 - t, y1, fz - 0.05, fz + 0.03)
        bar(al, x0, x0 + t, y0, y1, fz - 0.05, fz + 0.03); bar(al, x1 - t, x1, y0, y1, fz - 0.05, fz + 0.03)
        bar(al, -0.03, 0.01, y0 + t, y1 - t, fz - 0.03, fz + 0.02)
        sl = Mesh('win_sill', M['band']); sl.box(x0 - 0.08, x1 + 0.08, y0 - 0.07, y0, -0.25, 0.07)
        stn = Mesh('win_stain', M['stain']); stn.quad([(x0 - 0.05, y0 - 1.05, 0.012), (x1 + 0.05, y0 - 1.05, 0.012), (x1 + 0.05, y0 - 0.07, 0.012), (x0 - 0.05, y0 - 0.07, 0.012)])
        so = stn.finish(None, uv=True); uv01(so)                                              # 窗台下的雨痕（整張貼圖）
        _WIN[key] = combine([al.finish(None), sl.finish(None), so], 'window_shell'); return _WIN[key]
    rm = Mesh('win_room', M['room_lit'] if lit else M['room_dark'])
    rm.quad([(x0, y0, bk), (x1, y0, bk), (x1, y1, bk), (x0, y1, bk)])                    # 後牆（朝外）
    rm.quad([(x0, y0, fz), (x1, y0, fz), (x1, y0, bk), (x0, y0, bk)])                    # 地板（朝上）
    rm.quad([(x0, y1, bk), (x1, y1, bk), (x1, y1, fz), (x0, y1, fz)])                    # 天花板（朝下）
    rm.quad([(x0, y0, fz), (x0, y0, bk), (x0, y1, bk), (x0, y1, fz)])                    # 左牆（朝 +x）
    rm.quad([(x1, y0, bk), (x1, y0, fz), (x1, y1, fz), (x1, y1, bk)])                    # 右牆（朝 −x）
    gl = Mesh('win_glass', M['glass_lit'] if lit else M['win_glass']); gl.quad([(x0 + t, y0 + t, fz - 0.01), (x1 - t, y0 + t, fz - 0.01), (x1 - t, y1 - t, fz - 0.01), (x0 + t, y1 - t, fz - 0.01)])
    _WIN[key] = combine([rm.finish(None, uv=False), gl.finish(None)], f'window_{part}')
    return _WIN[key]


def potted_proto(kind, r, h, lift, size, n, seed):
    """盆栽（instancing）：陶盆＋葉片卡。原點＝盆底中央"""
    random.seed(seed)
    pm = Mesh('pot', M['pot_terra']); pot(pm, 0.0, 0.0, r, h, 'taper', y0=0.0)
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
POT_FERN = [potted_proto('fern', 0.09, 0.16, 0.33, 0.32, 4, s) for s in (11, 12)]
POT_BROAD = potted_proto('broad', 0.16, 0.3, 0.66, 0.45, 5, 13)
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
        for w in ws:
            xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'], -0.25, 0); xf.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -0.25, 0)
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
            if -W / 2 + 0.5 < ax < W / 2 - 0.5:
                inst(AC, f'ac_{spec["id"]}', xf, ax, y0 - 0.2, 0.0)
                xf.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)
    # ---- 頂樓：水塔、頂樓加蓋
    if spec.get('roofAdd'):
        aw, ad = W * 0.7, D * 0.55; ra = acc(M['corr']); xf.box(ra, -aw / 2, aw / 2, totalH, totalH + 2.4, -D * 0.5 - ad / 2, -D * 0.5 + ad / 2)
        xf.box(band, -aw / 2 - 0.15, aw / 2 + 0.15, totalH + 2.4, totalH + 2.5, -D * 0.5 - ad / 2 - 0.15, -D * 0.5 + ad / 2 + 0.15)
    elif spec.get('tank', True):
        tx = rng.uniform(-W / 2 + 1.5, W / 2 - 1.5); wx, _, wz = xf.p(tx, 0, -D * 0.45); B.instance(TANK, f'tank_{spec["id"]}', wx, totalH, wz, root, ry=xf.ry)
    upper_signs(spec, xf, W, totalH)
    # ---- 一樓：牆體和樓上同一種外牆（側面露在巷口時不會變成另一種材質）；店面兩側的石材壁柱
    xf.box(wall, -W / 2, W / 2, 0, GH, -D, -rec)                                                  # 一樓牆體（店面退縮）
    gw = acc(M['gwall'])
    if gt in ('shop', 'arcade'):
        r0 = 3.0 if gt == 'arcade' else 0.0
        # 公館的騎樓：店與店之間的壁柱貼和柱子一樣的磁磚（磨石子在騎樓裡近看是一大片斑點，像髒汙；溫州街照舊）
        pm = acc(M['pillar']) if (gt == 'arcade' and SET == 'gongguan') else gw
        for sx in (-1, 1): xf.box(pm, sx * (W / 2 - 0.15) - 0.15, sx * (W / 2 - 0.15) + 0.15, 0, GH, -rec, -r0)
    else: xf.box(gw, -W / 2, W / 2, 0, 0.9, -rec - 0.02, -rec + 0.04)                              # 住家／鐵捲門：牆腳的磨石子護牆
    xf.box(band, -W / 2, W / 2, GH - 0.12, GH, -0.25, 0.06)
    if gt in ('shop', 'arcade'): shopfront(spec, xf, W, gt)
    elif gt == 'shutter': shutter(spec, xf, W, rec)
    else: housedoor(spec, xf, W, rng, rec)
    set_tint(wall.finish(root), spec['color'], kind)


def vsign(xf, sid, vx, vy0, vy1, props):
    """直立招牌（突出牆面，兩面都有字）＋上下鐵架"""
    xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy1 + 0.02, vy1 + 0.08, 0.0, 0.95); xf.box(acc(M['metal']), vx - 0.04, vx + 0.04, vy0 - 0.08, vy0 - 0.02, 0.0, 0.95)
    xf.box(acc(M['ac']), vx - 0.07, vx + 0.07, vy0, vy1, 0.18, 0.92)
    face(f'VSIGN_FACE_{sid}_a', M['board'], xf, [(vx + 0.075, vy0, 0.92), (vx + 0.075, vy0, 0.18), (vx + 0.075, vy1, 0.18), (vx + 0.075, vy1, 0.92)], props)
    face(f'VSIGN_FACE_{sid}_b', M['board'], xf, [(vx - 0.075, vy0, 0.18), (vx - 0.075, vy0, 0.92), (vx - 0.075, vy1, 0.92), (vx - 0.075, vy1, 0.18)], props)


def upper_signs(spec, xf, W, totalH):
    """公館：樓上住戶的招牌（套件沒有）——另一側的直立招牌、二樓整面大招牌、屋頂廣告看板（鐵架）。字都由遊戲畫（SIGN_FACE／VSIGN_FACE），晚上會亮"""
    vt = spec.get('vtenant')
    if vt: vsign(xf, spec['id'] + '_t', -W / 2 + 0.5, GH + 0.3, GH + 0.3 + vt['len'], {k: vt[k] for k in ('vertical', 'vBg', 'vColor', 'vBand')} | {'serif': 0})
    s2 = spec.get('sign2f')
    if s2:   # 板子＋框離牆 0.16 m；店的直立招牌那一側讓出來（鐵架穿過板子）
        xa = -W / 2 + 0.4; xb = W / 2 - (1.1 if spec['shop'].get('vertical') else 0.4); y0 = GH + 0.35; y1 = GH + FH - 0.3
        xf.box(acc(M['alu']), xa - 0.06, xb + 0.06, y0 - 0.06, y1 + 0.06, 0.0, 0.16)
        face(f'SIGN_FACE_{spec["id"]}_2F', M['board'], xf, [(xa, y0, 0.165), (xb, y0, 0.165), (xb, y1, 0.165), (xa, y1, 0.165)],
             {'sign': s2['sign'], 'sub': s2['sub'], 'bg': s2['bg'], 'color': s2['color'], 'serif': 0, 'band': s2['band']})
    rs = spec.get('roofsign')
    if rs:   # 屋頂廣告看板：三根立柱＋往後的斜撐＋兩道橫桿、板子朝馬路（離女兒牆 1.6 m）
        bw = min(9.0, W - 1.2); zb = -1.6; yb0 = totalH + 1.5; yb1 = yb0 + 2.4; st = acc(M['metal'])
        for px in (-bw / 2 + 0.6, 0.0, bw / 2 - 0.6):
            xf.box(st, px - 0.07, px + 0.07, totalH, yb1 + 0.1, zb - 0.22, zb - 0.08)
            xf.cyl(st, (px, totalH, zb - 2.6), (px, yb0 + 1.2, zb - 0.15), 0.045, seg=6)
        for y in (yb0 + 0.15, yb1 - 0.15): xf.box(st, -bw / 2, bw / 2, y - 0.05, y + 0.05, zb - 0.2, zb - 0.08)
        xf.box(acc(M['alu']), -bw / 2 - 0.08, bw / 2 + 0.08, yb0 - 0.08, yb1 + 0.08, zb - 0.08, zb)
        face(f'SIGN_FACE_{spec["id"]}_roof', M['board'], xf, [(-bw / 2, yb0, zb + 0.005), (bw / 2, yb0, zb + 0.005), (bw / 2, yb1, zb + 0.005), (-bw / 2, yb1, zb + 0.005)],
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
        for w in ws: sx_.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, y0, w['y0'], -T, 0); sx_.box(wall, w['x'] - ww / 2, w['x'] + ww / 2, w['y1'], y1, -T, 0)
        # 樓板線：往正面多伸 0.325 m 接到正面的樓板線（側牆座標 sd<0 時正面在 +x'）。比正面的薄 1 cm、停在正面樓板線的前緣後 5 mm：
        # 重疊的地方不能有同一個平面上的面（Cycles 會變黑、遊戲裡會閃爍）
        if f > 1: sx_.box(band, -Ls / 2 - (0.325 if sd > 0 else 0), Ls / 2 + (0.325 if sd < 0 else 0), y0 - 0.085, y0 + 0.085, -T, 0.08)
    sx_.box(wall, -Ls / 2 - (0.05 if sd > 0 else 0), Ls / 2 + (0.05 if sd < 0 else 0), totalH, totalH + 0.9, -T, 0)   # 女兒牆：接到正面的女兒牆（正面的在 z −0.2…0，原本中間有 5 cm 的縫）
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
            if -Ls / 2 + 0.5 < ax < Ls / 2 - 0.5:
                inst(AC, f'sac_{spec["id"]}', sx_, ax, y0 - 0.2, 0.0); sx_.cyl(acc(M['pipe']), (ax + 0.3, y0 - 0.2, 0.04), (ax + 0.3, GH + 0.1, 0.04), 0.018, seg=6)


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
    xf.box(acc(fr), -sw / 2 - 0.05, sw / 2 + 0.05, sy0 - 0.04, sy1 + 0.04, 0.0, 0.1)
    face(f'SIGN_FACE_{spec["id"]}', M['board'], xf, [(-sw / 2, sy0, 0.105), (sw / 2, sy0, 0.105), (sw / 2, sy1, 0.105), (-sw / 2, sy1, 0.105)],
         {'sign': s['name'], 'sub': s.get('sub', ''), 'bg': s.get('signBg', '#3b2a1e'), 'color': s.get('signColor', '#f4ead8'), 'serif': 1 if s.get('serif') else 0, 'band': s.get('band', '')})
    # 直立招牌（突出牆面，兩面都有字）＋鐵架
    if s.get('vertical'):
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
        xf.quad(acc(M['win_glass']), [(wx - 0.97, 1.06, z), (wx + 0.97, 1.06, z), (wx + 0.97, 2.14, z), (wx - 0.97, 2.14, z)])
        if rng.random() < 0.5: inst(GRILLE, f'dgrille_{spec["id"]}', xf, wx, 0.95, z)


for sp in SPECS: apartment(sp)
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
L.vc_consolidate(root, WZ_VC)
L.merge_by_material(root, keep=lambda ob: 'FACE' in ob.name)
info = L.export(OUT, gpu_instances=True)
info.update({'buildings': [s['id'] for s in SPECS]})
L.write_json(OUT[:-4] + '.json', info)
