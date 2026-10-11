"""行政大樓（bldg.campus_admin）修改前／後的遊戲截圖清單 → admin_before.json、admin_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 campus_admin.glb（fast_shots.py --block=campus_admin.glb）：其他正式模型兩邊一樣，只比行政大樓。
用法：python3 tools/blender/env_second/shots/admin_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北；行政大樓 ckPlace(admin,-38,33,π)：正面朝北（正面牆 z≈25、門廊前緣 z≈22、拱廊 z 25.3–27.6），寬 46 m（x −61～−15）；傅鐘在前面 (−38,16.5)
VIEWS = [('bell_axis', {'x': -38, 'z': 2, 'yaw': 0}, [-38, 1.7, 2], [-38, 7, 30]),            # 從椰林大道往南看：傅鐘後面的行政大樓
         ('front', {'x': -30, 'z': 14, 'yaw': 0}, [-30, 1.7, 14], [-38, 6, 28]),               # 傅鐘廣場東側斜看正面
         ('porch', {'x': -34.5, 'z': 19.5, 'yaw': 0}, [-34.5, 1.7, 19.5], [-38, 4.4, 24]),     # 門廊近看
         ('arcade', {'x': -58, 'z': 26.4, 'yaw': math.pi / 2}, [-58.6, 1.6, 26.4], [-20, 2.4, 26.4])]   # 一樓拱廊裡往東
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='campus_admin_glb')) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in (TIMES[:1] if quick else TIMES):
            s = {'out': f'{OUT}admin_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：傅鐘東側往南看行政大樓，鏡頭在玩家後面（北邊）偏東
        s = {'out': f'{OUT}admin_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
             'state': {'zone': 'campus', 'hour': 17.5, 'pos': {'x': -31, 'z': 19, 'yaw': 0}}, 'cam': {'yaw': math.pi - 0.35, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
        if tag == 'after': s['js'] = WAIT
        L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'admin_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
