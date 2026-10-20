"""宿舍 507／409 的美術截圖＋效能（SCN-V4-01／SCN-V5-01；dorm_y3_items.glb）：同一個鏡頭拍改前／改後。
用法：python3 tools/shots/dorm_y34_shots.py <網址（含 ?turbo）> <輸出資料夾> <標籤> [507,409|all] [hide3]
（hide3＝把 dorm_y3_items 那一組藏起來再拍：分清楚哪些是大二那組、哪些是大三大四新加的）
[前置] 讀檔到宿舍房間：507＝大三（ROOM_Y3＋拆出來的東西全部有）、409＝大四（再加 ROOM_Y4）；不測劇情（quiet_events，S.tick 關掉）。
鏡頭：A＝進門那個位置（spawn）、B＝站在書桌和衣櫃前面往左牆看、C＝床欄那一側（A～C 是跟隨鏡頭）；
D＝衣櫃門＋床欄正面、E＝書桌桌面（D、E 用 E.cinematic 固定鏡頭，玩家站在門口，不擋）。每張記 renderer.info（draw call、三角形）。
409 用日本路線（志願表上有章），而且 23 件全部擺出來：這是為了驗收每一件；遊戲裡同一個人不會全部都有（例如日本路線沒有田野筆記）。
這是美術驗收的截圖，不是玩家流程測試。"""
import asyncio, json, sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
ONLY = sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] != 'all' else None
HIDE3 = len(sys.argv) > 5 and sys.argv[5] == 'hide3'
os.makedirs(OUT, exist_ok=True)
Y2 = ['film', 'pick', 'civ', 'report', 'noodle', 'duty', 'green', 'sticky', 'y1_0', 'y1_1', 'y1_2', 'y1_3', 'y1_4']
Y3 = ['notes_y2', 'fafu_form', 'sis_plan', 'article', 'zq_usb', 'zhe_notes', 'game_y2', 'expo', 'welcome_badge', 'vac_C02', 'vac_C03', 'vac_C08', 'vac_C09', 'vac_C10', 'vac_C11', 'vac_C12']
Y4 = ['form', 'cold', 'land', 'jp_key', 'postcards', 'credits', 'field']
ROOMS = {
    '507': ('2027-11-03', {'ROOM_Y2': 300, 'ROOM_Y2_ITEMS': Y2, 'ROOM_Y3': 700, 'ROOM_Y3_ITEMS': Y3, 'ROOM_Y3_DISCARD': None, 'POTHOS': True, 'pothosWaterN': 30}),
    '409': ('2028-11-03', {'ROOM_Y2': 300, 'ROOM_Y2_ITEMS': Y2, 'ROOM_Y3': 700, 'ROOM_Y3_ITEMS': Y3, 'ROOM_Y3_DISCARD': None, 'ROOM_Y4': 1060, 'ROOM_Y4_ITEMS': Y4,
            'BOX_KEPT_Y4': None, 'POTHOS': True, 'pothosWaterN': 50, 'EXCHANGE_ROUTE': 'JP'}),
}
VIEWS = {   # 玩家位置、朝向；跟隨鏡頭 yaw／pitch／距離（None＝照遊戲預設）；或固定鏡頭 (位置, 看哪裡)
    'A': ((0.0, 2.4, 3.1416), None, None),
    'B': ((-1.35, 0.25, -1.5708), (1.5708, 0.18, 2.3), None),
    'C': ((-1.25, -0.6, -1.5708), (2.2, 0.05, 2.4), None),
    'D': ((0.3, 2.0, 3.1416), None, ((0.0, 1.45, 0.55), (-2.3, 1.22, 0.55))),
    'E': ((0.3, 2.0, 3.1416), None, ((-1.45, 1.4, -0.15), (-2.55, 0.8, -0.25))),
}
INFO = """(()=>{ const E=GAME.E, R=E.renderer; E.render(); const ri=R.info.render; return {calls:ri.calls, tris:ri.triangles, geo:R.info.memory.geometries, tex:R.info.memory.textures, h:+GAME.G.hour.toFixed(2), zone:GAME.G.zone}; })()"""
PLACE = """((px,pz,pyaw,cam,cine)=>{ const E=GAME.E, P=E.player; E.placeAt(P,px,pz,0); P.obj.rotation.y=pyaw;
  if(cine){ E.cinematic(new THREE.Vector3(...cine[0]),new THREE.Vector3(...cine[1])); return; } if(E.cam.mode==='cinematic'&&E.endCinematic) E.endCinematic();
  if(cam){ E.cam.yaw=cam[0]; E.cam.pitch=cam[1]; E.cam.dist=E.cam.distTarget=cam[2]; } })"""


async def main():
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for room, (key, flags) in ROOMS.items():
            if ONLY and room not in ONLY: continue
            for hour in (15.0, 21.0):
                day = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key)); wd = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)
                f = {'introDone': True, 'afternoonDone': True, 'classDone': True}; f.update(flags)
                await pg.evaluate("(()=>{ if(typeof STORY!=='undefined'){ STORY.tick=()=>{}; } const E=GAME.E; if(E.cam.mode==='cinematic'&&E.endCinematic) E.endCinematic(); })()")   # 拍照：不讓 S.tick 開事件（拆箱補演、手機）
                await L.load_state(pg, {'zone': 'dorm', 'stage': 'law', 'hour': hour, 'day': day, 'weekday': wd, 'pos': {'x': 0, 'z': 2.4, 'yaw': 3.1416}, 'flags': f}, quiet_events=True)
                for i in range(45):
                    await pg.wait_for_timeout(1000)
                    ok = await pg.evaluate("(()=>{ const z=GAME.E.zone; return !!(z&&z.dormRoot)&&!z.itemsLoading; })()")   # itemsLoading：dorm_y2_items、dorm_y3_items 還在載
                    if ok and i > 8: break
                if HIDE3: await pg.evaluate("(()=>{ const o=GAME.E.zone.group.getObjectByName('dorm_y3_items'); if(o) o.visible=false; })()")
                for v, ((px, pz, pyaw), cam, cine) in VIEWS.items():
                    await pg.evaluate(PLACE + "(%s,%s,%s,%s,%s)" % (px, pz, pyaw, json.dumps(cam), json.dumps(cine)))
                    await pg.wait_for_timeout(4000 if cine else 2500)   # 固定鏡頭是慢慢移過去的
                    info = await pg.evaluate(INFO)
                    fn = os.path.join(OUT, '%s_%s_%s_%02d.png' % (TAG, room, v, int(hour)))
                    await pg.screenshot(path=fn)
                    res['%s_%s_%02d' % (room, v, int(hour))] = info
                    print(room, v, hour, json.dumps(info), flush=True)
        print('errs', [e[:160] for e in errs[:8]])
        await b.close()
    json.dump(res, open(os.path.join(OUT, TAG + '_info.json'), 'w'), ensure_ascii=False, indent=1)


asyncio.run(main())
