"""總圖（bldg.campus_library）修改前／後的遊戲截圖清單 → library_before.json、library_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 campus_library.glb（fast_shots.py --block=campus_library.glb）：其他正式模型兩邊一樣，只比總圖。
用法：python3 tools/blender/env_second/shots/lib_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北；椰林大道 z=0，總圖在東端 (100,0)，正面朝西（門廊前緣 x≈82.8、拱廊 x 87–90）
VIEWS = [('avenue', {'x': 38, 'z': 1, 'yaw': math.pi / 2}, [38, 1.7, 0.5], [100, 10, 0]),        # 椰林大道往東看總圖（大王椰子夾道）
         ('plaza', {'x': 68, 'z': 12, 'yaw': math.pi / 2}, [68, 1.7, 13], [96, 8, -3]),          # 總圖前廣場，斜看正面
         ('porch', {'x': 78, 'z': 5, 'yaw': math.pi / 2}, [78, 1.7, 5.5], [88, 5.5, -1]),         # 門廊近看
         ('arcade', {'x': 88.5, 'z': -20, 'yaw': 0}, [88.6, 1.6, -22], [88.6, 2.4, 10])]         # 一樓拱廊裡
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='campus_library_glb')) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in (TIMES[:1] if quick else TIMES):
            s = {'out': f'{OUT}library_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：走到總圖門廊前，鏡頭在玩家後面偏南
        s = {'out': f'{OUT}library_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
             'state': {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': math.pi / 2}}, 'cam': {'yaw': -math.pi / 2 - 0.35, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
        if tag == 'after': s['js'] = WAIT
        L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'library_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
