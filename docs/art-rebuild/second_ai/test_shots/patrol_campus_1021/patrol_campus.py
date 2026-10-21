"""巡場景第 1 區：校園。玩家跟隨鏡頭（pitch 0.22、dist 6），三個時段。[捷徑] 讀檔、直接放玩家位置。
用法：python3 patrol_campus.py 工作樹 URL 輸出資料夾 [時段,...] [位置名,...]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; PI = math.pi
HOURS = [float(h) for h in (sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] else ['15.0', '17.7', '20.0'])]
ONLY = sys.argv[5].split(',') if len(sys.argv) > 5 else None
F = {'introDone': True, 'afternoonDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True}
N, S_, E_, W_ = (PI, 0), (0, PI), (PI / 2, -PI / 2), (-PI / 2, PI / 2)   # (玩家 rotation.y, 鏡頭 yaw)：面向北、南、東、西
SPOTS = [('m1_out', 20, 55, N), ('m1_back', 20, 46, S_), ('gt_front', 2, 18, S_),
         ('av_gate', -112, 2, E_), ('av_mid', -20, 2, E_), ('av_lib', 62, 2, E_), ('av_west', 40, -2, W_),
         ('bell', -38, 8, S_), ('arts', -38, -12, N), ('hist', -77, -12, N),
         ('boya', -20, -80, W_), ('lake', -36, -96, N),
         ('linze', 34, -90, N), ('lawplaza', 60, -92, N), ('wancai', 88, -88, N), ('socsci', 92, -70, E_),
         ('soc_appr', 30, -80, W_), ('soc_main', 23, -85, W_), ('soc_lib', 11, -73, S_), ('soc_court_n', 2, -70, N), ('soc_court_s', -2, -75, S_)]
async def main():
    run = L.Run('patrol_campus', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        for h in HOURS:
            x0, z0 = SPOTS[0][1], SPOTS[0][2]
            await L.load_state(pg, {'zone': 'campus', 'hour': h, 'day': 9, 'weekday': 4, 'weather': 'sunny', 'flags': F, 'pos': {'x': x0, 'z': z0, 'yaw': 0}}, quiet_events=True)
            await pg.wait_for_timeout(12000); await L.close_panels(pg, cdp)
            for (nm, x, z, (ry, cy)) in SPOTS:
                if ONLY and nm not in ONLY: continue
                await pg.evaluate(f"(()=>{{ GAME.E.hour={h}; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch=0.22; GAME.E.cam.distTarget=6; }})()")
                await pg.wait_for_timeout(4000)
                await run.shot(pg, f'{nm}_{int(h*10):03d}')
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls, tris:r.triangles}; })()")
        print('last', json.dumps(info), 'errs', errs[:5]); await b.close()
    run.finish()
asyncio.run(main())
