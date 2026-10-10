"""公館店面街（bldg.gongguan_shops）修改前／後的遊戲截圖清單 → gongguan_before.json、gongguan_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 gongguan_shops.glb（fast_shots.py --block=gongguan_shops.glb）：其他正式模型（街道道具…）兩邊一樣，只比店面街。
用法：python3 tools/blender/env_second/shots/gg_shots.py → 兩個 JSON；
      python3 tools/blender/env_second/shots/fast_shots.py <URL> tools/blender/env_second/shots/gongguan_before.json --block=gongguan_shops.glb
      python3 tools/blender/env_second/shots/fast_shots.py <URL> tools/blender/env_second/shots/gongguan_after.json"""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 公館的區域座標：+x 往南、+z 往西；店面立面在 z=19（騎樓 19–22），人行道 z 4–19，羅斯福路 z −31…4，校門在 z −46
VIEWS = [('street_west', {'x': -22, 'z': 12, 'yaw': -math.pi / 2}, [-22, 1.7, 11], [-62, 4.5, 19]),     # 人行道往西看整排店面
         ('from_gate', {'x': 2, 'z': -34, 'yaw': 0}, [2, 1.7, -36], [-4, 7, 19]),                    # 校門口往南看過羅斯福路
         ('arcade', {'x': -16, 'z': 20.6, 'yaw': -math.pi / 2}, [-18, 1.6, 20.6], [-34, 2.2, 20.6]),  # 騎樓裡往西
         ('lane', {'x': -71, 'z': 10, 'yaw': 0}, [-71, 1.7, 9], [-71, 5.5, 32])]                    # 往溫州街的巷口（轉角那棟、麵店側面）
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='gongguan_shops_glb')) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in TIMES:
            s = {'out': f'{OUT}gongguan_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'gongguan', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    # 玩家鏡頭（手機直向、有 HUD）：人行道上往西走，鏡頭在玩家東北邊（看得到騎樓與店面）
    s = {'out': f'{OUT}gongguan_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
         'state': {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -40, 'z': 16, 'yaw': -math.pi / 2}}, 'cam': {'yaw': 2.0, 'pitch': 0.18, 'dist': 6.5}, 'wait': 3500}
    if tag == 'after': s['js'] = WAIT
    L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'gongguan_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
