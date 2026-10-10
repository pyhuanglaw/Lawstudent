"""兩點半 Café／溫州街公寓的遊戲內截圖清單（給 tools/shots/scene_shot.py）：修改前／修改後同一組鏡頭；時段照 ART_DIRECTION 第 8 節（11:00／17:30／20:30）。
修改前＝網址加 ?nobldg（不載入 Blender 正式模型，看到的是原本的程序化套件）；修改後＝一般網址（等正式模型接上才拍）。
用法：
  python3 tools/blender/env_second/shots/make_shots.py
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html?nobldg' tools/blender/env_second/shots/cafe_before.json
  python3 tools/shots/scene_shot.py 'http://127.0.0.1:8765/index.html'        tools/blender/env_second/shots/cafe_after.json
  （溫州街公寓：street_before.json／street_after.json，等 wenzhou_street 正式模型接上才拍）"""
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
# 溫州街近景（bldg.wenzhou_street 公寓、wz_jphouse 日式宿舍、wz_props 電線桿等、wz_park 小公園、wz_scooter 機車）：
# 巷子中段往東（Café）／往西、騎樓、A 側店面、Café 南側轉角、日式宿舍、小公園、機車；一般玩家鏡頭（手機直向）
STREET = [
    ('lane_east', ALL, dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 30, 'z': -1, 'yaw': 1.5708}, cam={'pos': [30, 1.7, -1.5], 'look': [44, 3.5, 1.5]})),
    ('lane_west', ('1730', '2030'), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 14, 'z': 1, 'yaw': -1.5708}, cam={'pos': [14, 1.7, 1.0], 'look': [-2, 4.0, -2]})),
    ('arcade', ('1730',), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 14.5, 'z': -1.8, 'yaw': 1.5708}, cam={'pos': [14.5, 1.6, -1.8], 'look': [24, 2.2, -5.5]})),
    ('shops_a', ('1100',), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 8, 'z': -3, 'yaw': 0.0}, cam={'pos': [7.5, 1.6, -3.2], 'look': [16, 2.6, 5]})),
    ('corner', ('2030',), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 47, 'z': -4, 'yaw': 1.5708}, cam={'pos': [46.5, 1.7, -3.5], 'look': [56, 4.0, -11]})),
    ('jp_front', ('1730', '2030'), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': -21, 'z': 0.7, 'yaw': 0.0}, cam={'pos': [-21, 1.7, 1.2], 'look': [-21.5, 3.0, 10]})),
    ('jp_oblique', ('1100',), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': -11.5, 'z': 2.0, 'yaw': 0.0}, cam={'pos': [-11.5, 1.7, 2.5], 'look': [-21, 2.8, 9]})),
    ('park', ('1100', '1730'), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 26, 'z': 2.2, 'yaw': 0.0}, cam={'pos': [26, 1.7, 2.2], 'look': [26, 1.2, 11]})),
    ('scooters', ('1100',), dict(zone='wenzhou', w=1280, h=720, hidePlayer=True, pos={'x': 8.5, 'z': -1.2, 'yaw': 0.0}, cam={'pos': [8.5, 1.25, -1.2], 'look': [12, 0.5, -4.0]})),
    ('follow_east', ALL, dict(zone='wenzhou', w=390, h=844, mobile=True, hud=True, pos={'x': 22, 'z': -1.5, 'yaw': 1.5708}, cam={'yaw': -1.5708, 'pitch': 0.22, 'dist': 5.2})),
]
STREET_GLBS = ['wenzhou_street_glb', 'wz_jphouse_glb', 'wz_props_glb', 'wz_park_glb', 'wz_scooters_glb']
WAIT_STREET = ("(async()=>{ const want=%s; for(let i=0;i<240;i++){ const z=GAME.E.zone; const ok=z&&want.every(n=>z.group.children.some(o=>o.name===n)); "
               "if(ok||%%s) return ok?'formal':'kit'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()") % json.dumps(STREET_GLBS)
# 全日便利商店（cvs 室內，bldg.cvs_interior）：進門（手機直向）、走道、櫃檯、飲料櫃
CVS = [
    ('entry', ALL, dict(zone='cvs', w=390, h=844, mobile=True, hud=True, pos={'x': 0, 'z': 3.5, 'yaw': 3.1416}, cam={'yaw': 0.0, 'pitch': 0.38, 'dist': 4.0})),
    ('aisle', ('1100',), dict(zone='cvs', w=1280, h=720, hidePlayer=True, pos={'x': 0, 'z': 2.8, 'yaw': 3.1416}, cam={'pos': [0.2, 1.6, 3.6], 'look': [0.0, 1.0, -3.5]})),
    ('counter', ('1730',), dict(zone='cvs', w=1280, h=720, hidePlayer=True, pos={'x': 3.2, 'z': -0.6, 'yaw': 3.1416}, cam={'pos': [1.2, 1.65, 1.6], 'look': [4.4, 1.0, -2.6]})),
    ('cooler', ('2030',), dict(zone='cvs', w=1280, h=720, hidePlayer=True, pos={'x': 4.0, 'z': 2.0, 'yaw': 1.5708}, cam={'pos': [2.6, 1.6, 0.2], 'look': [5.6, 1.1, 2.6]})),
]
WAIT_ROOM = ("(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if((z&&z.formal)||%s) return z&&z.formal?'formal':'fallback'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()")
WAIT_EXT = ("(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; const ok=z&&z.group.children.some(o=>o.userData&&o.userData.formal); "
            "if(ok||%s) return ok?'formal':'kit'; await new Promise(r=>setTimeout(r,250)); } return 'timeout'; })()")
WAIT_INT = ("(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if((z&&z.formal)||%s) break; await new Promise(r=>setTimeout(r,250)); } "
            "%s return GAME.E.zone.formal?'formal':'fallback'; })()")


def build(mode, which='cafe'):
    shots = []
    for name, tags, v in {'cafe': VIEWS, 'street': STREET, 'cvs': CVS}[which]:
        for tag in tags:
            s = {'out': f'{OUT}/{which}_{mode}_{name}_{tag}.png', 'w': v['w'], 'h': v['h'], 'hideNPCs': True,
                 'state': {'zone': v['zone'], 'hour': H[tag], 'pos': v['pos']}, 'cam': v['cam'], 'wait': 3500}
            for k in ('mobile', 'hud', 'hidePlayer'):
                if v.get(k): s[k] = True
            nb = 'true' if mode == 'before' else 'false'
            if which == 'street': s['js'] = WAIT_STREET % nb
            elif which == 'cvs': s['js'] = WAIT_ROOM % nb
            elif v['zone'] == 'wenzhou': s['js'] = WAIT_EXT % nb
            else:
                sit = ("GAME.sitAt(GAME.E.player,%s);" % json.dumps(v['sit'])) if v.get('sit') else ''
                s['js'] = WAIT_INT % (nb, sit)
            shots.append(s)
    return shots


if __name__ == '__main__':
    for which in ('cafe', 'street', 'cvs'):
        for mode in ('before', 'after'):
            p = os.path.join(HERE, f'{which}_{mode}.json'); sh = build(mode, which); json.dump(sh, open(p, 'w'), ensure_ascii=False, indent=1); print(p, len(sh))
