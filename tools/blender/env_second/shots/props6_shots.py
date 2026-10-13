"""⑥法學院廣場的近景小物（花台、公告欄、販賣機：street_props.glb）修改前／後的遊戲截圖清單 → props6_before.json、props6_after.json（fast_shots.py 用）。
修改前＝上一版的遊戲（這三樣是程序化版本）：主工作目錄的 server（分支 claude/second-ai-env-art）；修改後＝這一版。其他正式模型兩邊一樣。
用法：python3 tools/blender/env_second/shots/props6_shots.py → 兩個 JSON"""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots/'
# 校園座標：法學院前庭的花台 x=30、46、62、88（z=−83.5）、長椅 (40,−88)；公告欄 (16.6,−100.6)、販賣機 (13.5,−107.5，靠霖澤館西側牆）；椰林大道北側的花台 x=−64、−48（z=−13）
VIEWS = [('plaza_planters', {'x': 40, 'z': -87, 'yaw': math.pi}, [39.5, 1.6, -87.2], [47, 0.45, -83.5]),       # 法學院前庭：長椅旁看花台
         ('board_vending', {'x': 20, 'z': -98, 'yaw': math.pi}, [19.8, 1.7, -97.4], [14.8, 1.3, -104.2]),      # 霖澤館西側：公告欄、販賣機
         ('avenue_planter', {'x': -56, 'z': -9.5, 'yaw': math.pi}, [-55.6, 1.6, -9.4], [-61.5, 0.45, -13.0]),   # 椰林大道北側的花台
         ('vending', {'x': 9.5, 'z': -106, 'yaw': math.pi / 2}, [9.4, 1.6, -105.6], [13.5, 1.0, -107.5])]   # 販賣機正面（朝西，在霖澤館西側；公告欄那個鏡頭只看得到它的背面）
TIMES = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]


def shots(tag):
    L = []
    for name, pos, eye, look in VIEWS:
        for h, t in TIMES:
            L.append({'out': f'{OUT}props6_{tag}_{name}_{t}.png', 'w': 1280, 'h': 720, 'hideNPCs': True, 'hidePlayer': True,
                      'state': {'zone': 'campus', 'hour': h, 'pos': pos}, 'cam': {'pos': eye, 'look': look}, 'wait': 3500})
    L.append({'out': f'{OUT}props6_{tag}_follow_1730.png', 'w': 390, 'h': 844, 'mobile': True, 'hud': True, 'hideNPCs': True,
              'state': {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 18.5, 'z': -99.5, 'yaw': math.pi}}, 'cam': {'yaw': 0.6, 'pitch': 0.18, 'dist': 5.0}, 'wait': 3500})
    return L


for tag in ('before', 'after'):
    json.dump(shots(tag), open(os.path.join(HERE, f'props6_{tag}.json'), 'w'), ensure_ascii=False, indent=1)
print('ok', len(shots('after')))
