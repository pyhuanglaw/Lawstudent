"""兩點半 Café 的遊戲內截圖清單（給 tools/shots/scene_shot.py）：修改前／修改後同一組鏡頭；時段照 ART_DIRECTION 第 8 節（11:00／17:30／20:30）。
修改前＝網址加 ?nobldg（不載入 Blender 正式模型，看到的是原本的程序化套件）；修改後＝一般網址（等正式模型接上才拍）。
用法：
  python3 tools/blender/env_second/shots/make_shots.py
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html?nobldg' tools/blender/env_second/shots/cafe_before.json
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html'        tools/blender/env_second/shots/cafe_after.json"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = 'docs/art-rebuild/second_ai/shots'
H = {'1100': 11, '1730': 17.5, '2030': 20.5}
ALL = ('1100', '1730', '2030')
# (名稱, 時段, 參數)
VIEWS = [
    # 外觀（溫州街）：一般玩家鏡頭（手機直向／橫向）從巷子走向 Café
    ('follow_portrait', ALL, dict(zone='wenzhou', w=390, h=844, mobile=True, hud=True, pos={'x': 50.2, 'z': -0.3, 'yaw': 1.5708}, cam={'yaw': -1.5708, 'pitch': 0.22, 'dist': 5.2})),
    ('follow_landscape', ('1730',), dict(zone='wenzhou', w=844, h=390, mobile=True, hud=True, pos={'x': 50.2, 'z': -0.3, 'yaw': 1.5708}, cam={'yaw': -1.5708, 'pitch': 0.22, 'dist': 5.2})),
    # 從公館那頭走到溫州街東端的路口，看到 Café（玩家在路口南側往東北看）
    ('approach', ('1730',), dict(zone='wenzhou', w=390, h=844, mobile=True, hud=True, pos={'x': 50.0, 'z': -9.0, 'yaw': 0.535}, cam={'yaw': 3.68, 'pitch': 0.2, 'dist': 5.2})),
    # 對街斜看店面、店門口近景（演出鏡頭位置，人物藏起來）
    ('street', ALL, dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 49.0, 'z': -1.0, 'yaw': 1.5708}, cam={'pos': [46.6, 1.7, 4.2], 'look': [55.4, 2.4, -0.6]})),
    ('close', ('1730', '2030'), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 49.0, 'z': -1.0, 'yaw': 1.5708}, cam={'pos': [51.2, 1.55, 2.3], 'look': [55.4, 1.5, -0.4]})),
    # 室內：進門（出生點，手機直向一般鏡頭）、往店門口看（街景）、坐在窗邊的雙人桌（seats[0]）、吧檯點餐
    ('int_entry', ALL, dict(zone='cafe', w=390, h=844, mobile=True, hud=True, pos={'x': 0, 'z': 4.6, 'yaw': 3.1416}, cam={'yaw': 0.0, 'pitch': 0.38, 'dist': 4.2})),
    ('int_door', ('1730',), dict(zone='cafe', w=1280, h=720, pos={'x': 0.3, 'z': -0.6, 'yaw': 0.0}, cam={'yaw': 3.1416, 'pitch': 0.3, 'dist': 4.2})),
    ('int_seat', ('2030',), dict(zone='cafe', w=1280, h=720, pos={'x': 4.5, 'z': -1.7, 'yaw': 3.1416}, cam={'yaw': -0.95, 'pitch': 0.3, 'dist': 3.8}, sit={'x': 4.5, 'z': -1.7, 'yaw': 3.1416})),
    ('int_bar', ('1100',), dict(zone='cafe', w=1280, h=720, pos={'x': -2.5, 'z': -3.0, 'yaw': 3.1416}, cam={'yaw': 0.35, 'pitch': 0.28, 'dist': 4.0})),
]
WAIT_EXT = ("(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; const ok=z&&z.group.children.some(o=>o.userData&&o.userData.formal); "
            "if(ok||%s) return ok?'formal':'kit'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()")
WAIT_INT = ("(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if((z&&z.formal)||%s) break; await new Promise(r=>setTimeout(r,250)); } "
            "%s return GAME.E.zone.formal?'formal':'fallback'; })()")


def build(mode):
    shots = []
    for name, tags, v in VIEWS:
        for tag in tags:
            s = {'out': f'{OUT}/cafe_{mode}_{name}_{tag}.png', 'w': v['w'], 'h': v['h'], 'hideNPCs': True,
                 'state': {'zone': v['zone'], 'hour': H[tag], 'pos': v['pos']}, 'cam': v['cam'], 'wait': 3500}
            for k in ('mobile', 'hud', 'hidePlayer'):
                if v.get(k): s[k] = True
            nb = 'true' if mode == 'before' else 'false'
            if v['zone'] == 'wenzhou': s['js'] = WAIT_EXT % nb
            else:
                sit = ("GAME.sitAt(GAME.E.player,%s);" % json.dumps(v['sit'])) if v.get('sit') else ''
                s['js'] = WAIT_INT % (nb, sit)
            shots.append(s)
    return shots


if __name__ == '__main__':
    for mode in ('before', 'after'):
        p = os.path.join(HERE, f'cafe_{mode}.json'); json.dump(build(mode), open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(build(mode)))
