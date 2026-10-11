"""文學院（bldg.campus_arts）、校史館（bldg.campus_hist）修改前／後的遊戲截圖清單 → arthist_before.json、arthist_after.json（fast_shots.py 用）。
修改前＝同一版遊戲、只擋掉 campus_arts.glb、campus_hist.glb（fast_shots.py --block=campus_arts.glb --block=campus_hist.glb）：其他正式模型兩邊一樣。
用法：python3 tools/blender/env_second/shots/arthist_shots.py [--quick] → 兩個 JSON（--quick：只有 11:00）"""
import json, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：x 往東、−z 往北；兩棟都在椰林大道北側、正面朝南（yaw π＝面向北）。
# 文學院 ckPlace(arts,-38,-34,0)：正面牆 z=−25、門廊前緣 z=−22、拱廊 z −27.6～−25，寬 40 m（x −58～−18）
# 校史館 ckPlace(hist,-77,-29,0)：正面牆 z=−21、門廊前緣 z=−18.4、拱廊 z −23.6～−21，寬 24 m（x −89～−65）
VIEWS = [('arts_avenue', {'x': -38, 'z': -2, 'yaw': math.pi}, [-38, 1.7, -2], [-38, 6, -30]),          # 從椰林大道往北看文學院
         ('arts_front', {'x': -30, 'z': -12, 'yaw': math.pi}, [-30, 1.7, -12], [-38, 6, -28]),         # 斜看正面（門廊、山牆、拱廊）
         ('arts_porch', {'x': -34.5, 'z': -18.5, 'yaw': math.pi}, [-34.5, 1.7, -18.5], [-38, 5, -24]),  # 門廊近看（山牆的牛眼窗、檐部匾額）
         ('arts_arcade', {'x': -56, 'z': -26.3, 'yaw': math.pi / 2}, [-56.6, 1.6, -26.3], [-20, 2.4, -26.3]),   # 一樓拱廊裡往東
         ('hist_avenue', {'x': -77, 'z': -2, 'yaw': math.pi}, [-77, 1.7, -2], [-77, 6, -24]),          # 從椰林大道往北看校史館
         ('hist_front', {'x': -69, 'z': -8, 'yaw': math.pi}, [-69, 1.7, -8], [-77, 6, -24]),           # 斜看正面
         ('hist_porch', {'x': -74.5, 'z': -14.2, 'yaw': math.pi}, [-74.5, 1.7, -14.2], [-77, 4.6, -19.4]),   # 門廊近看（圓石柱、拱上方的匾額）
         ('hist_arcade', {'x': -88, 'z': -22.3, 'yaw': math.pi / 2}, [-88.2, 1.6, -22.3], [-60, 2.4, -22.3])]   # 一樓拱廊裡往東
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
WAIT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&['campus_arts_glb','campus_hist_glb'].every(n=>z.group.children.some(o=>o.name===n))) return 'formal'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()"
quick = '--quick' in sys.argv


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in (TIMES[:1] if quick else TIMES):
            s = {'out': f'{OUT}arthist_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                 'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    if not quick:   # 玩家鏡頭（手機直向、有 HUD）：門廊東南方往北看，鏡頭在玩家後面（南邊）偏東
        for name, pos in (('arts_follow', {'x': -33, 'z': -19, 'yaw': math.pi}), ('hist_follow', {'x': -72.5, 'z': -15, 'yaw': math.pi})):
            s = {'out': f'{OUT}arthist_{tag}_{name}_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
                 'state': {'zone': 'campus', 'hour': 17.5, 'pos': pos}, 'cam': {'yaw': 0.35, 'pitch': 0.16, 'dist': 6.0}, 'wait': 3500}
            if tag == 'after': s['js'] = WAIT
            L.append(s)
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'arthist_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
