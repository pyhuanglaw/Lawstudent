"""公館機車（⑧，LAWWW 2026-10-11 03:47Z）：換成正式模型（bldg.wz_scooter 分組 InstancedMesh）修改前／後的遊戲截圖清單 → ggsc_before.json、ggsc_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 scooter.glb（fast_shots.py --block=scooter.glb）：機車照舊是套件，其他正式模型兩邊一樣。
用法：python3 tools/blender/env_second/shots/ggsc_shots.py → 兩個 JSON"""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 公館的區域座標：+x 往南、+z 往西；北側機車（校門那一側的人行道邊）z=−32、x −70～60；南側（店面街人行道）z=6.8、x −60～38
VIEWS = [('north_row', {'x': -36, 'z': -27, 'yaw': 0}, [-35.5, 1.6, -28.6], [-42, 0.7, -32.2]),   # 北側人行道邊的一排機車（近看）
         ('south_row', {'x': -53, 'z': 10.6, 'yaw': 0}, [-53, 1.6, 10.6], [-59.5, 0.7, 6.8]),     # 店面街人行道上的一排機車（近看；捷運出口玻璃亭 x −43～−37 的西邊）
         ('street_west', {'x': -22, 'z': 11, 'yaw': 0}, [-22, 1.7, 11], [-62, 4.5, 19]),           # 人行道往西看整排店面
         ('from_gate', {'x': 2, 'z': -36, 'yaw': 0}, [2, 1.7, -36], [-4, 7, 19])]                  # 校門口往南看過羅斯福路
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='gg_scooters_glb')) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in TIMES:
            s = {'out': f'{OUT}ggsc_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'gongguan', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    # 玩家鏡頭（手機直向、有 HUD）：店面街人行道上，機車在玩家旁邊
    s = {'out': f'{OUT}ggsc_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
         'state': {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -42, 'z': 9.2, 'yaw': math.pi / 2}}, 'cam': {'yaw': -math.pi / 2 + 0.5, 'pitch': 0.2, 'dist': 5.5}, 'wait': 3500}
    if tag == 'after': s['js'] = WAIT
    L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'ggsc_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
