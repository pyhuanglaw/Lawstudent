"""近看：電影鏡頭（不是玩家鏡頭，只用來查原因）。[捷徑] 讀檔。
用法：python3 closeup.py 工作樹 URL 輸出資料夾 區域 時段 'name:cx,cy,cz:tx,ty,tz;...' [玩家x,z]"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONE, H, SPEC = sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5]), sys.argv[6]
PX, PZ = (float(v) for v in (sys.argv[7].split(',') if len(sys.argv) > 7 else ['20', '55']))
F = {'introDone': True, 'afternoonDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True}
async def main():
    run = L.Run('closeup', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': ZONE, 'hour': H, 'day': 9, 'weekday': 4, 'weather': 'sunny', 'flags': F, 'pos': {'x': PX, 'z': PZ, 'yaw': 0}}, quiet_events=True)
        await pg.wait_for_timeout(12000); await L.close_panels(pg, cdp)
        for it in SPEC.split(';'):
            nm, c, t = it.split(':'); c = [float(v) for v in c.split(',')]; t = [float(v) for v in t.split(',')]
            await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; P.position.x={c[0]}; P.position.z={c[2]}; P.visible=false; GAME.E.cinematic(new THREE.Vector3({c[0]},{c[1]},{c[2]}),new THREE.Vector3({t[0]},{t[1]},{t[2]})); }})()")
            await pg.wait_for_timeout(4000); await run.shot(pg, nm)
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
