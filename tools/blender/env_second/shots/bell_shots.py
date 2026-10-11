"""傅鐘（bldg.campus_bell）修改前／後的遊戲截圖清單 → bell_before.json、bell_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 campus_bell.glb（fast_shots.py --block=campus_bell.glb）：其他正式模型兩邊一樣，只比傅鐘。
用法：python3 tools/blender/env_second/shots/bell_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北；傅鐘在 (−38,16.5)、石碑朝北（z=13.45）對著椰林大道（z=0）；行政大樓在後面（南邊）
VIEWS = [('avenue', {'x': -38, 'z': 3, 'yaw': math.pi}, [-38, 1.7, 3.5], [-38, 3.2, 16.5]),          # 從椰林大道看傅鐘（後面是行政大樓）
         ('close', {'x': -35.5, 'z': 12, 'yaw': math.pi}, [-35.6, 1.6, 12.4], [-38, 2.8, 16.5]),     # 斜前方近看（銅鐘、柱子、石碑）
         ('side', {'x': -34.6, 'z': 16.3, 'yaw': -math.pi / 2}, [-34.6, 1.6, 16.3], [-38, 2.9, 16.5])]   # 台基東邊外面、兩根柱子中間抬頭看鐘（台基整個不能走：鏡頭不放在鐘亭裡；斜角看會被轉角的柱子擋住）
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='campus_bell_glb')) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in (TIMES[:1] if quick else TIMES):
            s = {'out': f'{OUT}bell_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：站在石碑前面朝南看傅鐘，鏡頭在玩家後面（北邊）偏東（鏡頭在玩家的 (sin yaw, cos yaw) 那一側）
        s = {'out': f'{OUT}bell_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
             'state': {'zone': 'campus', 'hour': 17.5, 'pos': {'x': -37.2, 'z': 11.2, 'yaw': 0}}, 'cam': {'yaw': math.pi - 0.35, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
        if tag == 'after': s['js'] = WAIT
        L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'bell_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
