"""美國交換宿舍（v4 美國路線；D47：印第安納大學布魯明頓校區為參考，遊戲裡不寫校名）室內配置 → src/data/us_dorm_layout.js（純 JSON）。
遊戲（src/abroad3d.js 的 us_dorm）與 LAWWW2-B 的 Blender 模型讀同一份（場景施工表 SCN-US-01，批次 1）。

劇情用途（BB_98 2-8、交接包_v4）：US2「退回的報告」在**公用廚房**（BCG-32）；學期中自己的房間睡覺、讀書；交誼區是朋友版晚餐、和香港朋友碰面的地方。
沒有查證的（模板，等 LAWWW2-B 的 IU 宿舍查證後可以改）：走廊、房間大小、門的位置。單層（一般美式宿舍的一層）。
座標：區域自己的座標；南牆（+z）是大門；東西向走廊。導航格 0.4 m、格子中心在 0.4 的倍數上：牆放在 0.4 的倍數，門洞兩端在 0.4k+0.2。
  北側（西→東）：交誼區（開口 4.8 m）、公用廚房（門 1.2 m）、兩間別人的房間（關著）。
  南側（西→東）：自己的單人房（門 1.2 m）、三間別人的房間（關著）、門廳（和走廊連通，南牆大門 1.6 m）。
用法：python3 tools/layout/us_dorm_layout_gen.py"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, D, H = 30.4, 14.4, 2.8
CZN, CZS = -1.2, 1.2
L = {'version': 1, 'id': 'us_dorm', 'name': '交換宿舍', 'W': W, 'D': D, 'cell': 0.4, 'wallT': 0.2, 'ceil': H,
     'note': '美國交換路線（v4）；D47 參考 IU 布魯明頓；配置是模板，等查證（SCN-US-01）'}
walls = []
def wall(x0, z0, x1, z1, gaps=()): walls.append({'x0': x0, 'z0': z0, 'x1': x1, 'z1': z1, 'gaps': [list(g) for g in gaps]})
# 走廊北牆：交誼區開口、廚房門、兩間關著的房門
wall(-15.2, CZN, 15.2, CZN, [(-12.6, -7.8), (-0.6, 0.6), (6.6, 7.8), (11.8, 13.0)])
for x in (-5.2, 4.8, 10.0): wall(x, -7.2, x, CZN)
# 走廊南牆（門廳那一段和走廊連通）：自己的房門、三間關著的房門
wall(-15.2, CZS, 5.6, CZS, [(-13.0, -11.8), (-8.2, -7.0), (-3.0, -1.8), (2.2, 3.4)])
for x in (-10.0, -4.8, 0.4, 5.6): wall(x, CZS, x, 7.2)
L['walls'] = walls
L['outer'] = {'x0': -W / 2, 'x1': W / 2, 'z0': -D / 2, 'z1': D / 2, 'door': {'wall': 'S', 'a0': 9.4, 'a1': 11.0}}
L['entrance'] = {'spawn': {'x': 10.2, 'z': 4.6, 'yaw': 3.1416}, 'exit': {'x': 10.2, 'z': 6.5, 'r': 1.0,
                 'label': '出門', 'look': '大門外是校園街道（還在施工，之後開放）。'}}
L['corridor'] = {'x0': -15.2, 'x1': 15.2, 'z0': CZN, 'z1': CZS}
# 房間：kind room（自己的，開放）、kitchen、lounge、lobby、closed（別人的，關著：門板＋門口說明）
L['rooms'] = [
    {'id': 'my_room', 'kind': 'room', 'label': '自己的房間', 'x0': -15.2, 'x1': -10.0, 'z0': CZS, 'z1': 7.2, 'door': [-13.0, -11.8], 'doorZ': CZS},
    {'id': 'kitchen', 'kind': 'kitchen', 'label': '公用廚房', 'x0': -5.2, 'x1': 4.8, 'z0': -7.2, 'z1': CZN, 'door': [-0.6, 0.6], 'doorZ': CZN},
    {'id': 'lounge', 'kind': 'lounge', 'label': '交誼區', 'x0': -15.2, 'x1': -5.2, 'z0': -7.2, 'z1': CZN, 'door': [-12.6, -7.8], 'doorZ': CZN},
    {'id': 'lobby', 'kind': 'lobby', 'label': '門廳', 'x0': 5.6, 'x1': 15.2, 'z0': CZS, 'z1': 7.2},
    {'id': 'r_n1', 'kind': 'closed', 'label': '別人的房間', 'x0': 4.8, 'x1': 10.0, 'z0': -7.2, 'z1': CZN, 'door': [6.6, 7.8], 'doorZ': CZN, 'look': '門上貼著兩個名字。別人的房間。'},
    {'id': 'r_n2', 'kind': 'closed', 'label': '別人的房間', 'x0': 10.0, 'x1': 15.2, 'z0': -7.2, 'z1': CZN, 'door': [11.8, 13.0], 'doorZ': CZN, 'look': '門上掛著一面小國旗。別人的房間。'},
    {'id': 'r_s1', 'kind': 'closed', 'label': '別人的房間', 'x0': -10.0, 'x1': -4.8, 'z0': CZS, 'z1': 7.2, 'door': [-8.2, -7.0], 'doorZ': CZS, 'look': '門縫裡有音樂聲。別人的房間。'},
    {'id': 'r_s2', 'kind': 'closed', 'label': '別人的房間', 'x0': -4.8, 'x1': 0.4, 'z0': CZS, 'z1': 7.2, 'door': [-3.0, -1.8], 'doorZ': CZS, 'look': '門上的白板寫著「Quiet hours 11pm」。別人的房間。'},
    {'id': 'r_s3', 'kind': 'closed', 'label': '別人的房間', 'x0': 0.4, 'x1': 5.6, 'z0': CZS, 'z1': 7.2, 'door': [2.2, 3.4], 'doorZ': CZS, 'look': '門把上掛著一雙球鞋。別人的房間。'}]
# 家具（type、中心、尺寸 w×d（x×z，轉 ry 之前）、高、ry）；block＝導航擋住
F = []
def furn(t, x, z, w, d, h, ry=0.0, **kw): F.append(dict({'type': t, 'x': x, 'z': z, 'w': w, 'd': d, 'h': h, 'ry': ry}, **kw))
# 自己的房間
furn('bed', -14.6, 5.9, 0.95, 2.0, 0.55)
furn('desk', -11.6, 6.8, 1.2, 0.6, 0.75)
furn('wardrobe', -10.5, 1.75, 0.8, 0.6, 2.0)
furn('shelf', -15.0, 2.6, 0.3, 1.2, 1.6)
# 公用廚房
furn('counter', -1.3, -6.9, 6.6, 0.6, 0.9, sink=-2.6, stove=0.6)
furn('fridge', 3.9, -6.8, 0.8, 0.7, 1.8)
furn('table', -0.4, -3.8, 1.6, 0.9, 0.75)
furn('counter_island', 3.6, -3.2, 0.6, 1.6, 0.9)
# 交誼區
furn('tv', -15.0, -4.2, 0.4, 1.8, 1.2)
furn('sofa', -11.2, -4.2, 2.2, 0.9, 0.8, ry=-1.5708)
furn('sofa', -12.6, -6.7, 2.0, 0.9, 0.8, ry=0.0)
furn('coffee_table', -12.8, -4.2, 0.8, 1.2, 0.42)
# 門廳
furn('mailboxes', 15.0, 3.6, 0.3, 2.0, 1.5)
furn('board', 6.0, 6.9, 1.6, 0.1, 1.2)
L['furniture'] = F
# 座位（yaw：坐的人面向 (sin, cos)）
L['seats'] = [
    {'x': -11.6, 'z': 6.2, 'yaw': 0.0, 'kind': 'desk', 'label': '坐在書桌前', 'room': 'my_room'},
    {'x': -0.8, 'z': -4.45, 'yaw': 0.0, 'kind': 'table', 'label': '坐在餐桌', 'room': 'kitchen'},
    {'x': 0.0, 'z': -4.45, 'yaw': 0.0, 'kind': 'table', 'label': '坐在餐桌', 'room': 'kitchen'},
    {'x': -0.8, 'z': -3.15, 'yaw': 3.1416, 'kind': 'table', 'label': '坐在餐桌', 'room': 'kitchen'},
    {'x': 0.0, 'z': -3.15, 'yaw': 3.1416, 'kind': 'table', 'label': '坐在餐桌', 'room': 'kitchen'},
    {'x': -11.25, 'z': -4.75, 'yaw': -1.5708, 'kind': 'sofa', 'label': '坐在沙發', 'room': 'lounge'},
    {'x': -11.25, 'z': -3.65, 'yaw': -1.5708, 'kind': 'sofa', 'label': '坐在沙發', 'room': 'lounge'},
    {'x': -13.1, 'z': -6.6, 'yaw': 0.0, 'kind': 'sofa', 'label': '坐在沙發', 'room': 'lounge'},
    {'x': -12.1, 'z': -6.6, 'yaw': 0.0, 'kind': 'sofa', 'label': '坐在沙發', 'room': 'lounge'}]
L['looks'] = [
    {'x': -14.0, 'z': 5.9, 'r': 0.9, 'label': '看看床', 'look': '單人床，床單是學校發的。（交換期間的睡覺之後接上。）'},
    {'x': -1.3, 'z': -6.3, 'r': 1.0, 'label': '看看流理台', 'look': '流理台上有人留了一張紙條：「Please wash your dishes :)」'},
    {'x': 14.6, 'z': 3.6, 'r': 0.9, 'label': '看看信箱', 'look': '一整面金屬信箱，你的那一格還是空的。'}]
L['windows'] = [{'wall': 'S', 'a0': -13.6, 'a1': -11.0, 'y0': 1.0, 'y1': 2.3, 'room': 'my_room'},
                {'wall': 'N', 'a0': -14.4, 'a1': -6.0, 'y0': 1.0, 'y1': 2.3, 'room': 'lounge'},
                {'wall': 'N', 'a0': -4.4, 'a1': -1.8, 'y0': 1.2, 'y1': 2.3, 'room': 'kitchen'}]
L['lights'] = [[-12.6, 2.6, 4.2, 4, 2.5], [-10.2, 2.6, -4.2, 5, 3], [-0.2, 2.6, -4.2, 5, 3], [0.0, 2.6, 0.0, 4, 2.5], [10.4, 2.6, 4.2, 5, 3], [-10.0, 2.6, 0.0, 4, 2.5], [10.0, 2.6, 0.0, 4, 2.5]]
out = os.path.join(ROOT, 'src', 'data', 'us_dorm_layout.js')
with open(out, 'w', encoding='utf8') as f:
    f.write('/* 美國交換宿舍配置（自動產生：tools/layout/us_dorm_layout_gen.py，不要手改）*/\n')
    f.write('const US_DORM_LAYOUT=' + json.dumps(L, ensure_ascii=False) + ';\n')
print('wrote', out, 'rooms', len(L['rooms']), 'furniture', len(F), 'seats', len(L['seats']))
