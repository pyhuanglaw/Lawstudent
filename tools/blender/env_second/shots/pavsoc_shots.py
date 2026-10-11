"""洞洞館（bldg.campus_pavilion）、社科院（bldg.campus_modern）修改前／後的遊戲截圖清單 → pavsoc_before.json、pavsoc_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 campus_pavilion.glb、campus_modern.glb（fast_shots.py --block=campus_pavilion.glb --block=campus_modern.glb）：其他正式模型兩邊一樣。
用法：python3 tools/blender/env_second/shots/pavsoc_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北。洞洞館 ckPlace(hole,-104,-30,0)：正面朝南（鏤空牆外框 z=−23、一樓玻璃 z=−23.6），寬 22 m（x −115～−93）；
# 社科院 ckPlace(soc,110,-70,-π/2)：正面朝西（正面牆 x=99、玻璃大廳 x=100.2），寬 56 m（z −98～−42）；門前 x=96 有一排白色樹狀柱（圖書館的柱，AI-1 的）
VIEWS = [('pav_avenue', {'x': -104, 'z': -2, 'yaw': math.pi}, [-104, 1.7, -2], [-104, 6, -30]),           # 從椰林大道往北看洞洞館
         ('pav_front', {'x': -94, 'z': -12, 'yaw': math.pi}, [-94, 1.7, -12], [-104, 6, -30]),            # 斜看正面（鏤空牆、柱廊）
         ('pav_close', {'x': -100.5, 'z': -18.5, 'yaw': math.pi}, [-100.5, 1.7, -18.5], [-104, 6.5, -23]),   # 近看鏤空牆（往上看）
         ('soc_front', {'x': 78, 'z': -60, 'yaw': math.pi / 2}, [78, 1.7, -60], [110, 8, -70]),           # 社科院：法學院那邊斜看正面
         ('soc_lobby', {'x': 92.5, 'z': -65, 'yaw': math.pi / 2}, [92.5, 1.7, -65], [99.5, 3, -70])]      # 玻璃大廳、雨遮近看
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&['campus_pavilion_glb','campus_modern_glb'].every(n=>z.group.children.some(o=>o.name===n))) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in (TIMES[:1] if quick else TIMES):
            s = {'out': f'{OUT}pavsoc_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：門廊東南方往北看，鏡頭在玩家後面（南邊）偏東
        for name, pos in (('pav_follow', {'x': -100, 'z': -19.5, 'yaw': math.pi}),):
            s = {'out': f'{OUT}pavsoc_{tag}_{name}_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
                 'state': {'zone': 'campus', 'hour': 17.5, 'pos': pos}, 'cam': {'yaw': 0.35, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'pavsoc_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
