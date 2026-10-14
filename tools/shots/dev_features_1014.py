"""開發分支 2026-10-14 的畫面驗收截圖（使用者 10-14 試玩 v9.6 的回饋，下一版）——[前置／捷徑] 全部用讀檔把玩家放到那個時間地點，只拍畫面、不測流程：
  1 室內小地圖（總圖大廳二樓、認識的人黃點）        5b7cfdc
  2 路上騎腳踏車的人（校園椰林大道附近；牽車的路人拿掉）  a49939e
  3 男生宿舍一樓交誼廳（晚上、沙發上的人）             55dac83
  4 兩點半 Café 晚上（吧檯東邊的店員、學姊在讀書）       73baa50
  5 總圖大廳服務台的館員                              73baa50
  6 手機「朋友」：約不了的原因                         ce67bb7
  7 男一舍前的地板（步道和柏油路交叉，分上下層、不再閃）  7cd6684
用法：python3 tools/shots/dev_features_1014.py URL [輸出資料夾]（直向、橫向各一張；不是 iPhone 實機，是 Playwright 手機模擬＋SwiftShader）"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/dev_features_1014'
os.makedirs(OUT, exist_ok=True)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'met_sis': True, 'dating_kexin': True}
SOC = {'rel': {'zhe': {'fam': 30, 'trust': 10, 'comf': 10}, 'heroine_01': {'fam': 25, 'trust': 12, 'comf': 6}, 'heroine_05': {'fam': 22, 'trust': 8, 'comf': 4}, 'heroine_03': {'fam': 3}},
       'mem': {'heroine_01': [{'tag': 'FIRST_MET', 'day': 2, 'note': ''}], 'heroine_05': [{'tag': 'FIRST_MET', 'day': 3, 'note': ''}], 'zhe': [{'tag': 'FIRST_MET', 'day': 1, 'note': ''}]}, 'reveal': {}, 'prof': {}}
SHOTS = [
    ('1_indoor_minimap', {'zone': 'library_hall', 'day': 20, 'weekday': 2, 'hour': 15.0, 'pos': {'x': 0, 'z': 0, 'yaw': 0, 'lv': 1}}, None),
    ('2_riders_campus', {'zone': 'campus', 'day': 20, 'weekday': 2, 'hour': 15.0, 'pos': {'x': -40, 'z': 2, 'yaw': 1.57, 'lv': 0}}, 'riders'),
    ('3_dorm_lounge_night', {'zone': 'dorm_hall', 'day': 20, 'weekday': 2, 'hour': 20.5, 'pos': None}, 'lounge'),
    ('4_cafe_night_clerk', {'zone': 'cafe', 'day': 20, 'weekday': 1, 'hour': 20.0, 'pos': {'x': 0, 'z': 2.5, 'yaw': 0, 'lv': 0}}, None),
    ('5_library_desk_clerk', {'zone': 'library_hall', 'day': 20, 'weekday': 2, 'hour': 10.0, 'pos': None}, 'desk'),
    ('6_phone_friends', {'zone': 'campus', 'day': 20, 'weekday': 2, 'hour': 12.0, 'pos': {'x': -40, 'z': 2, 'yaw': 1.57, 'lv': 0}}, 'phone'),
    ('7_ground_mens_dorm', {'zone': 'campus', 'day': 20, 'weekday': 2, 'hour': 15.0, 'pos': {'x': 20, 'z': 52, 'yaw': 0, 'lv': 0}}, 'ground'),   # 男一舍前步道和柏油路交叉 (20,47)：7cd6684 分上下層（使用者回饋 8 地板閃爍）
]


async def main():
    async with async_playwright() as p:
        for landscape in (True, False):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
            await pg.goto(URL)
            await L.wait_loaded(pg)
            for name, st, extra in SHOTS:
                s = dict(st, weather='clear', flags=dict(FLAGS), social=json.loads(json.dumps(SOC)))
                if s['pos'] is None: s.pop('pos')
                await L.load_state(pg, s, quiet_events=True)
                await pg.wait_for_timeout(9000)
                if extra == 'riders':   # 鏡頭對著最近的騎士
                    r = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const rs=(GAME.extras||[]).concat(GAME.E.extras||[]).filter(x=>x&&x.obj&&x.obj.children.some(c=>c.name==='bike_ride')); if(!rs.length) return null; rs.sort((a,b)=>a.obj.position.distanceTo(P)-b.obj.position.distanceTo(P)); return {x:rs[0].obj.position.x,z:rs[0].obj.position.z,n:rs.length}; })()")
                    if r: await L.turn_camera_to(pg, cdp, r['x'], r['z'])
                    print(name, 'riders', json.dumps(r))
                if extra == 'lounge':
                    sf = await pg.evaluate("(()=>{ const f=(typeof DORM_LAYOUT!=='undefined')&&DORM_LAYOUT.furniture.find(f=>f.type==='sofa'); return f&&{x:f.x,z:f.z}; })()")
                    if sf: await L.go_to(pg, cdp, L.Run('shots', OUT), sf['x'] + 2.5, sf['z'] + 1.5, 1.0, '交誼廳'); await L.turn_camera_to(pg, cdp, sf['x'], sf['z'])
                if extra == 'desk':
                    d = await pg.evaluate("(()=>{ const d=(LIBRARY_LAYOUT.furniture||[]).find(f=>f.type==='desk'); return d&&{x:d.x,z:d.z,dd:d.d}; })()")
                    if d: await L.go_to(pg, cdp, L.Run('shots', OUT), d['x'], d['z'] - d['dd'] / 2 - 1.6, 1.0, '服務台前'); await L.turn_camera_to(pg, cdp, d['x'], d['z'])
                if extra == 'phone':
                    await pg.evaluate("GAME.openPhone&&GAME.openPhone('friends')"); await pg.wait_for_timeout(2500)
                if extra == 'ground':
                    await L.turn_camera_to(pg, cdp, 20.0, 47.0)
                await pg.wait_for_timeout(3000)
                fn = os.path.join(OUT, name + ('_land' if landscape else '_port') + '.png')
                await pg.screenshot(path=fn); print('shot', fn)
                if extra == 'phone': await pg.evaluate("GAME.closePhone&&GAME.closePhone()")
            print('errors', errs[:5])
            await b.close()

asyncio.run(main())
