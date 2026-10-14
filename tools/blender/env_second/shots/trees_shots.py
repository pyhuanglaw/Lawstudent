"""行道樹（⑦ prop.trees）修改前／後的遊戲截圖清單 → trees_before.json、trees_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 street_trees.glb（fast_shots.py --block=street_trees.glb）：程序化的葉片卡樹；其他正式模型兩邊一樣。
用法：python3 tools/blender/env_second/shots/trees_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北；椰林大道 z=0（大王椰子在 z=±9.5、兩側的大樹列在 z≈±17.5）；黑森林（榕樹）在 x 58–87、z −66～−78；小椰林道 x 24／36、z −14～−70
# 溫州街：小公園的大樹（榕樹）在 (26,13.2)；公館：x 往南、z 往西，校門在 z −46，校門後面是椰林大道（背景）
VIEWS = [('gate_avenue', 'campus', {'x': -100, 'z': 4, 'yaw': math.pi / 2}, [-110, 1.7, 0.5], [100, 8, 0], True),      # 進校門往東看椰林大道
         ('avenue_row', 'campus', {'x': -100, 'z': 4, 'yaw': math.pi / 2}, [-62, 1.7, 13.5], [-20, 6, 18], True),     # 大道南側人行道，沿著樹列
         ('black_forest', 'campus', {'x': -100, 'z': 4, 'yaw': math.pi / 2}, [70, 1.7, -56], [72, 5, -72], True),     # 黑森林（榕樹）
         ('wz_park', 'wenzhou', {'x': 26, 'z': 2, 'yaw': 0}, [26, 1.7, 1.5], [26, 5, 13], True),                      # 溫州街小公園的大樹
         ('small_palms', 'campus', {'x': -100, 'z': 4, 'yaw': math.pi / 2}, [30, 1.7, -6], [30, 6, -60], False),     # 小椰林道（只拍 11:00）
         ('to_campus', 'gongguan', {'x': -30, 'z': 14, 'yaw': math.pi / 2}, [0, 1.7, -40], [0, 6, -120], False)]     # 公館往校門看（背景的椰林大道，只拍 11:00）
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const s=TK.treeStats&&TK.treeStats(); if(s&&s.ready&&s.near) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, zone, pos, eye, look, all_times in VIEWS:
        for h, t in (TIMES if all_times and not quick else TIMES[:1]):
            s = {'out': f'{OUT}trees_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': zone, 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：站在大道南側的大樹下，鏡頭在玩家後面往東北看
        s = {'out': f'{OUT}trees_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
             'state': {'zone': 'campus', 'hour': 17.5, 'pos': {'x': -64, 'z': 15.5, 'yaw': math.pi / 2}}, 'cam': {'yaw': -0.8, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
        if tag == 'after': s['js'] = WAIT
        L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'trees_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
