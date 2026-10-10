"""兩點半 Café 的遊戲內截圖清單（給 tools/shots/scene_shot.py）：修改前／修改後同一組鏡頭、三個時段（ART_DIRECTION 第 8 節：11:00／17:30／20:30）。
修改前＝網址加 ?nobldg（不載入 Blender 正式模型，看到的是原本的程序化套件）；修改後＝一般網址（等正式模型接上才拍）。
用法：
  python3 tools/blender/env_second/shots/make_shots.py
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html?nobldg' tools/blender/env_second/shots/cafe_before.json
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html'        tools/blender/env_second/shots/cafe_after.json"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots'
HOURS = [(11, '1100'), (17.5, '1730'), (20.5, '2030')]
# 外觀（溫州街）
EXT = [
    # 一般玩家鏡頭（手機直向／橫向）：從巷子走向 Café
    ('follow_portrait', dict(w=390, h=844, mobile=True, hud=True, pos={'x': 50.2, 'z': -0.3, 'yaw': 1.5708}, cam={'yaw': -1.5708, 'pitch': 0.22, 'dist': 5.2})),
    ('follow_landscape', dict(w=844, h=390, mobile=True, hud=True, pos={'x': 50.2, 'z': -0.3, 'yaw': 1.5708}, cam={'yaw': -1.5708, 'pitch': 0.22, 'dist': 5.2})),
    # 從公館那頭走進溫州街東端，遠遠看到 Café（玩家在路口南側往北看）
    ('approach', dict(w=390, h=844, mobile=True, hud=True, pos={'x': 50.0, 'z': -9.0, 'yaw': 0.535}, cam={'yaw': 3.68, 'pitch': 0.2, 'dist': 5.2})),
    # 對街斜看店面、店門口近景（演出鏡頭位置，人物藏起來）
    ('street', dict(w=1280, h=720, hidePlayer=True, pos={'x': 49.0, 'z': -1.0, 'yaw': 1.5708}, cam={'pos': [46.6, 1.7, 4.2], 'look': [55.4, 2.4, -0.6]})),
    ('close', dict(w=1280, h=720, hidePlayer=True, pos={'x': 49.0, 'z': -1.0, 'yaw': 1.5708}, cam={'pos': [51.2, 1.55, 2.3], 'look': [55.4, 1.5, -0.4]})),
]
WAIT = ("(async()=>{ for(let i=0;i<200;i++){ const z=GAME.E.zone; const ok=z&&z.group.children.some(o=>o.userData&&o.userData.formal); "
        "if(ok||%s) return ok?'formal':'kit'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()")


def build(mode):
    shots = []
    for name, v in EXT:
        for h, tag in HOURS:
            s = {'out': f'{OUT}/cafe_{mode}_{name}_{tag}.png', 'w': v['w'], 'h': v['h'], 'hideNPCs': True,
                 'state': {'zone': 'wenzhou', 'hour': h, 'pos': v['pos']}, 'cam': v['cam'], 'wait': 5000,
                 'js': WAIT % ('true' if mode == 'before' else 'false')}
            for k in ('mobile', 'hud', 'hidePlayer'):
                if v.get(k): s[k] = True
            shots.append(s)
    return shots


if __name__ == '__main__':
    for mode in ('before', 'after'):
        p = os.path.join(HERE, f'cafe_{mode}.json'); json.dump(build(mode), open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(build(mode)))
