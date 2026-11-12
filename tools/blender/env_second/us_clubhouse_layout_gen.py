"""美國交換：社區 Linden Grove 會所的室內配置（US-CLUBHOUSE-3D-1110，AA_741；LAWWW2 帳號 A 2026-11-10）→ src/data/us_clubhouse_layout.js。
遊戲（src/us_clubhouse3d.js：導航、備用模型、座位、互動點、劇情站位）和 Blender（tools/blender/env_second/us_clubhouse.py）讀同一份。
  python3 tools/blender/env_second/us_clubhouse_layout_gen.py
座標：x 往東、z 往南、y 朝上；地板 0、天花板 2.9。一層三塊（AA_741 第 1 節）：
  門廳 4×4（x −1～3、z 0～4）：南邊大門、北邊社區辦公室的櫃台（窗口後面是辦公室，走不進去）、東牆信件架；西邊通交誼廳、東邊通自習室
  交誼廳 10×8（x −11～−1、z −4～4）：淺色木地板；兩張可以併起來的長桌、L 型沙發＋電視、熱飲販賣機、小廚房檯面＋微波爐；北牆通後面草地的玻璃門（關著）；
         12/1 起西南角一棵聖誕樹（晚上亮燈）
  自習室 8×6（x 3～11、z −2～4）：灰色地毯；四張長桌、一張四個座位（16 席）、檯燈、北牆軟木公布欄
外觀（社區的 us_community.glb 會所 13×7.6 m）比室內小：室內照 AA_741 的大小（玩家在室內看不到外觀，兩邊不能同時比對；要一致時改社區的外觀）。"""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'src', 'data', 'us_clubhouse_layout.js')
PI = math.pi
r2 = lambda v: round(v, 3)

L = {'version': 1, 'zone': 'us_clubhouse_in', 'ceilY': 2.9, 'wallT': 0.2,
     'bounds': {'x0': -11.0, 'x1': 11.0, 'z0': -4.0, 'z1': 4.0},
     'rooms': [
         {'id': 'foyer', 'x0': -1.0, 'x1': 3.0, 'z0': 0.0, 'z1': 4.0, 'floor': 'tile', 'name': '門廳'},
         {'id': 'lounge', 'x0': -11.0, 'x1': -1.0, 'z0': -4.0, 'z1': 4.0, 'floor': 'wood', 'name': '交誼廳'},
         {'id': 'study', 'x0': 3.0, 'x1': 11.0, 'z0': -2.0, 'z1': 4.0, 'floor': 'carpet', 'name': '自習室'},
         {'id': 'office', 'x0': -1.0, 'x1': 3.0, 'z0': -4.0, 'z1': 0.0, 'floor': 'tile', 'name': '社區辦公室', 'walk': False, 'note': '櫃台後面（走不進去；窗口看得到裡面）'}],
     }
# 牆：axis x＝沿 x 的牆（在 z＝at）、axis z＝沿 z 的牆（在 x＝at）；open＝[a, b, 種類]（沿牆的座標）；dir＝朝房間裡的法線（淡出用）；partition＝隔間
L['walls'] = [
    {'id': 'S', 'axis': 'x', 'at': 4.0, 'from': -11.0, 'to': 11.0, 'dir': [0, 0, -1], 'open': [[-9.4, -7.8, 'window'], [-6.0, -4.4, 'window'], [0.3, 1.7, 'frontDoor'], [7.6, 9.6, 'window']], 'note': '正面（朝社區的停車場）：大門是兩扇玻璃門'},
    {'id': 'N_l', 'axis': 'x', 'at': -4.0, 'from': -11.0, 'to': -1.0, 'dir': [0, 0, 1], 'open': [[-10.2, -8.8, 'window'], [-6.9, -5.1, 'patioDoor'], [-3.6, -2.2, 'window']], 'note': '交誼廳北牆：中間通後面草地的玻璃門（關著、不能開；AA_741 第 1 節）'},
    {'id': 'N_o', 'axis': 'x', 'at': -4.0, 'from': -1.0, 'to': 3.0, 'dir': [0, 0, 1], 'note': '辦公室北牆'},
    {'id': 'N_s', 'axis': 'x', 'at': -2.0, 'from': 3.0, 'to': 11.0, 'dir': [0, 0, 1], 'note': '自習室北牆：軟木公布欄'},
    {'id': 'W', 'axis': 'z', 'at': -11.0, 'from': -4.0, 'to': 4.0, 'dir': [1, 0, 0], 'open': [[0.4, 2.2, 'window']], 'note': '交誼廳西牆：電視、窗'},
    {'id': 'E', 'axis': 'z', 'at': 11.0, 'from': -2.0, 'to': 4.0, 'dir': [-1, 0, 0], 'open': [[1.0, 3.2, 'window']], 'note': '自習室東牆：窗（靠窗那張桌子旁邊）'},
    {'id': 'E_o', 'axis': 'z', 'at': 3.0, 'from': -4.0, 'to': -2.0, 'dir': [-1, 0, 0], 'note': '辦公室東牆（外牆）'},
    {'id': 'lf', 'axis': 'z', 'at': -1.0, 'from': -4.0, 'to': 4.0, 'dir': [1, 0, 0], 'partition': True, 'open': [[1.4, 3.0, 'opening']], 'note': '交誼廳｜辦公室、門廳：通交誼廳的門口（1.6 m、沒有門板）；交誼廳這一面是小廚房、販賣機'},
    {'id': 'fs', 'axis': 'z', 'at': 3.0, 'from': -2.0, 'to': 4.0, 'dir': [-1, 0, 0], 'partition': True, 'open': [[2.5, 3.5, 'studyDoor']], 'note': '門廳、辦公室｜自習室：自習室的門（開著，門板靠牆）；門廳這一面是信件架'},
    {'id': 'fo', 'axis': 'x', 'at': 0.0, 'from': -1.0, 'to': 3.0, 'dir': [0, 0, 1], 'partition': True, 'open': [[-0.4, 2.4, 'counter']], 'sill': 1.05, 'head': 2.15, 'note': '門廳｜辦公室：櫃台的窗口（下緣 1.05、上緣 2.15）；平日 09～17 以外拉下百葉'},
]
L['doors'] = [
    {'id': 'front', 'x': 1.0, 'z': 4.0, 'w': 1.4, 'axis': 'x', 'style': 'glassDouble', 'state': 'closed', 'label': '離開會所'},
    {'id': 'study', 'x': 3.0, 'z': 3.0, 'w': 1.0, 'axis': 'z', 'style': 'wood', 'state': 'open', 'note': '門板往自習室那邊開、靠在南牆'},
    {'id': 'patio', 'x': -6.0, 'z': -4.0, 'w': 1.8, 'axis': 'x', 'style': 'glassDouble', 'state': 'closed', 'note': '門外看得到草地和烤肉架（窗景，不做 3D）'},
]
L['windows'] = {'y0': 0.9, 'y1': 2.2, 'view': 'usch', 'note': '窗外＝會所後面的草地、烤肉架、社區的公寓（us_clubhouse_view.py 用社區的正式模型拍，四季×白天／晚上）；玻璃門落地'}

# ---------------- 家具 ----------------
F = []
# 交誼廳：電視（西牆）、L 型沙發、茶几
F.append({'type': 'tvConsole', 'room': 'lounge', 'x': -10.78, 'z': -1.6, 'w': 1.7, 'd': 0.45, 'ry': PI / 2, 'note': '電視櫃＋55 吋電視（面向東）'})
F.append({'type': 'sofaLong', 'room': 'lounge', 'x0': -8.6, 'x1': -7.65, 'z0': -2.8, 'z1': -0.4, 'face': 'W', 'note': 'L 型沙發長的那一段（面向電視）'})
F.append({'type': 'sofaShort', 'room': 'lounge', 'x0': -9.9, 'x1': -8.6, 'z0': -3.7, 'z1': -2.8, 'face': 'S', 'note': 'L 型沙發短的那一段（靠北牆、面向南）'})
F.append({'type': 'coffeeTable', 'room': 'lounge', 'x0': -10.2, 'x1': -9.7, 'z0': -2.2, 'z1': -1.0, 'h': 0.42, 'note': '沙發前面留 1 m 走道（坐下前站的位置）'})
F.append({'type': 'rug', 'room': 'lounge', 'x0': -10.4, 'x1': -8.3, 'z0': -2.9, 'z1': -0.3})
# 交誼廳：小廚房（東牆）、熱飲販賣機
F.append({'type': 'counterRun', 'room': 'lounge', 'x0': -1.65, 'x1': -1.1, 'z0': -3.85, 'z1': -1.4, 'h': 0.92, 'sink': -3.05, 'microwave': -2.05, 'note': '小廚房檯面：水槽、微波爐、吊櫃'})
F.append({'type': 'vending', 'room': 'lounge', 'x': -1.52, 'z': -0.72, 'w': 0.95, 'd': 0.8, 'ry': -PI / 2, 'note': '熱飲販賣機（咖啡、熱可可、茶；按鈕上的字虛構）'})
# 交誼廳：兩張長桌（平常分開、12/14 晚餐併成一張）
TZ = 2.0; TW, TD = 2.2, 0.9
APART = [-7.7, -4.6]; MERGED = [-7.25, -5.05]
F.append({'type': 'longTables', 'room': 'lounge', 'z': TZ, 'w': TW, 'd': TD, 'h': 0.75, 'apart': APART, 'merged': MERGED, 'navX0': -8.8, 'navX1': -3.5,
          'note': '平常兩張分開（中間 0.9 m）；z.setDinner(true)＝併成一張、鋪桌巾、一排菜（12/14 會所晚餐，AA_741 第 4 節）。導航擋兩種擺法的聯集'})
F.append({'type': 'xmasTree', 'room': 'lounge', 'x': -10.15, 'z': 3.25, 'r': 0.62, 'h': 2.3, 'from': '12-01', 'note': '12/1 起到離開（AA_741）；晚上亮燈'})
# 自習室：四張長桌（1.8×0.8），一張四個座位
ST = {'NW': (5.4, -0.3), 'NE': (8.9, -0.3), 'SW': (5.4, 2.2), 'SE': (8.9, 2.2)}   # 自習室南牆只有東南那扇窗（＋東牆的窗）：東南那張＝「靠窗那張桌子」
for k, (x, z) in ST.items():
    F.append({'type': 'studyTable', 'room': 'study', 'id': k, 'x': x, 'z': z, 'w': 1.8, 'd': 0.8, 'h': 0.74, 'lamp': True})
F.append({'type': 'corkBoard', 'room': 'study', 'wall': 'N_s', 'x0': 3.9, 'x1': 5.9, 'y0': 1.05, 'y1': 2.0, 'note': '軟木公布欄（ev_usl_long3 開頭「公布欄貼著一張單子」：z.setNotice(true)）'})
# 門廳
F.append({'type': 'counter', 'room': 'foyer', 'x0': -0.4, 'x1': 2.4, 'z0': 0.0, 'z1': 0.42, 'h': 1.05, 'note': '櫃台檯面（在窗口的門廳這一邊）'})
F.append({'type': 'mailRack', 'room': 'foyer', 'x0': 2.62, 'x1': 2.9, 'z0': 0.6, 'z1': 2.0, 'y0': 0.85, 'y1': 1.95, 'note': '信件架（一格一格的木格子，格子上的門號虛構）'})
F.append({'type': 'plant', 'room': 'foyer', 'x': -0.55, 'z': 3.45, 'r': 0.3})
F.append({'type': 'officeDesk', 'room': 'office', 'x0': 0.1, 'x1': 1.7, 'z0': -1.25, 'z1': -0.6, 'note': '辦公室裡：書桌、電腦、檔案櫃（從窗口看得到）'})
L['furniture'] = F

# ---------------- 座位 ----------------
S = []
def seat(id_, x, z, yaw, room, label='坐下', ap=None, **kw):
    s = {'id': id_, 'x': r2(x), 'z': r2(z), 'yaw': r2(yaw), 'room': room, 'label': label}
    if ap: s['ap'] = [r2(ap[0]), r2(ap[1])]
    s.update(kw); S.append(s)
# 自習室：每張桌子北邊兩個（面向南＝yaw 0）、南邊兩個（面向北＝yaw π）；0＝西、1＝東
for k, (x, z) in ST.items():
    for side, dz, yaw in (('n', -0.62, 0.0), ('s', 0.62, PI)):
        for i, dx in enumerate((-0.45, 0.45)):
            S.append({'id': f'st_{k}_{side}{i}', 'x': r2(x + dx), 'z': r2(z + dz), 'yaw': r2(yaw), 'room': 'study', 'label': '坐下讀書', 'study': True, 'table': k})
# 交誼廳：長桌（平常）
for t, tx in zip('AB', APART):
    for side, dz, yaw in (('n', -0.62, 0.0), ('s', 0.62, PI)):
        for i, dx in enumerate((-0.55, 0.55)):
            S.append({'id': f'lt_{t}_{side}{i}', 'x': r2(tx + dx), 'z': r2(TZ + dz), 'yaw': r2(yaw), 'room': 'lounge', 'label': '坐下', 'set': 'apart'})
# 交誼廳：長桌（併起來，晚餐）：兩邊各四個、兩頭各一個＝10 人
for side, dz, yaw in (('n', -0.62, 0.0), ('s', 0.62, PI)):
    for i, x in enumerate((-7.9, -6.7, -5.6, -4.4)):
        S.append({'id': f'ld_{side}{i}', 'x': x, 'z': r2(TZ + dz), 'yaw': r2(yaw), 'room': 'lounge', 'label': '坐下', 'set': 'merged'})
S.append({'id': 'ld_w', 'x': -8.9, 'z': TZ, 'yaw': r2(PI / 2), 'room': 'lounge', 'label': '坐下', 'set': 'merged', 'ap': [-9.45, TZ], 'note': '主位（西頭）'})
S.append({'id': 'ld_e', 'x': -3.4, 'z': TZ, 'yaw': r2(-PI / 2), 'room': 'lounge', 'label': '坐下', 'set': 'merged', 'ap': [-2.85, TZ]})
# 沙發：長的那一段三個（面向西）、短的那一段一個（面向南）；坐下前站在沙發和茶几中間
for i, z in enumerate((-2.2, -1.5, -0.8)):
    seat(f'sofa_{i + 1}', -8.82, z, -PI / 2, 'lounge', '坐在沙發上', ap=(-9.2, z))
seat('sofa_c', -9.3, -3.05, 0.0, 'lounge', '坐在沙發上', ap=(-9.2, -2.35))
L['seats'] = S

# ---------------- 出入口、人、劇情 ----------------
L['spawn'] = {'x': 1.0, 'z': 3.2, 'yaw': PI, 'note': '從社區的「會所」進來：門廳、面向櫃台'}
L['exit'] = {'x': 1.0, 'z': 3.55, 'r': 0.9, 'label': '離開會所', 'note': '回社區：US3.SPAWN.us_clubhouse（會所門口的走道上）'}
L['looks'] = [   # 「看」：AA_741 第 5 節不加新台詞——只放櫃台（字照舊用 aa287 那句：S.look(G,'us_outside','club')，LAWWW 接）；其他地方不做「看」
    {'id': 'counter', 'x': 1.0, 'z': 0.75, 'r': 0.8, 'label': '看櫃台'},
]
L['npc'] = {
    'long': 'st_SE_s1', 'longNext': 'st_SE_s0', 'note_long': '舊序章人物己：自習室靠窗那張桌子（東南），固定同一個位子；旁邊那張空著（AA_741 第 2 節）',
    'sis': 'st_NE_n1', 'sisNext': 'st_NE_n0', 'note_sis': '學姊：自習室最裡面角落那張桌子（東北）、背對北牆；旁邊那張交往中空出來、挽回中放她的外套（z.setSisCoat）',
    'sisStand': {'x': 10.4, 'z': -0.3, 'yaw': r2(-PI / 2), 'note': '站在學姊那張桌子旁邊（東頭）'},
    'office': {'x': 0.9, 'z': -0.35, 'yaw': 0.0, 'note': '辦公室的人：櫃台後面（不在導航上，放著不走）'},
    'lounge': [{'kind': 'sofa', 'seat': 'sofa_2'}, {'kind': 'table', 'seat': 'lt_A_n0'}, {'kind': 'vending', 'x': -2.35, 'z': -0.72, 'yaw': r2(PI / 2)}, {'kind': 'microwave', 'x': -2.3, 'z': -2.05, 'yaw': r2(PI / 2)}],
    'study': ['st_SW_s0', 'st_NW_n1'],
    'note': '交誼廳的住戶 2～4 人（沙發看電視、長桌開電腦、販賣機或微波爐前輪流）；自習室的住戶 0～2 人。都不能聊（路人）',
}
L['events'] = {
    'ev_usl_long3': {'long': 'st_SE_s1', 'player': 'st_SE_s0', 'notice': True, 'note': '舊序章人物己在他的位子、玩家坐他旁邊；公布欄貼一張單子'},
    'ev_usb_fb_study': {'sis': 'st_NE_n1', 'player': {'x': 10.4, 'z': -0.3, 'yaw': r2(-PI / 2)}, 'empty': True, 'note': '學姊在她的角落；玩家站在她桌子旁邊；自習室沒有別人'},
    'ev_sis_plan_us': {'sis': 'st_NE_n1', 'player': 'st_NE_n0', 'plan': True, 'note': '兩個人並排坐，桌上攤著讀書計畫（z.setPlan(true)）'},
    'ev_usl_thanks_long': {'start': {'player': {'x': -2.35, 'z': -0.25, 'yaw': r2(PI / 2)}, 'long': {'x': -2.35, 'z': -1.2, 'yaw': r2(PI / 2)}}, 'sofa': {'player': 'sofa_2', 'long': 'sofa_1'}, 'empty': True, 'note': '販賣機前開始，之後坐到沙發；交誼廳沒有別人'},
    'ev_us_club_dinner': {'dinner': True, 'head': 'ld_w', 'roommates': ['ld_n0', 'ld_s0'], 'long': 'ld_n3', 'player': 'ld_s3', 'others': ['ld_n1', 'ld_s1', 'ld_n2', 'ld_s2', 'ld_e'],
                          'note': '兩張長桌併成一張（z.setDinner(true)）：學姊坐西頭主位、兩位室友在她兩邊、舊序章人物己（MET_LONG）坐玩家對面、其他是交換生；聖誕樹亮著'},
}

txt = ('/* ===== 美國交換：社區 Linden Grove 會所 室內配置（US-CLUBHOUSE-3D-1110，LAWWW2 帳號 A 2026-11-10；AA_741，D109）=====\n'
       '   由 tools/blender/env_second/us_clubhouse_layout_gen.py 產生（不要手改，改產生器）。遊戲 src/us_clubhouse3d.js、Blender tools/blender/env_second/us_clubhouse.py 讀同一份。\n'
       '   座位 id：st_<桌>_<n 北邊｜s 南邊><0 西｜1 東>（自習室）、lt_<A｜B>_…（交誼廳長桌平常）、ld_…（併起來的晚餐）、sofa_*（沙發）。 */\n'
       'const US_CLUBHOUSE_LAYOUT=' + json.dumps(L, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(OUT, 'w', encoding='utf-8').write(txt)
print(OUT, len(S), 'seats')
