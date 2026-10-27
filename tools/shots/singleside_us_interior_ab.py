"""單面第四份：美國公寓、C 棟 208「屋內」同角度（玩家跟隨鏡頭；[捷徑] 讀檔、直接放玩家位置）。
用法：python3 ab_us_interior.py 工作樹 URL 輸出資料夾 區域(us_apartment|us_shared) [時段,...]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONE = sys.argv[2], sys.argv[3], sys.argv[4]
HOURS = [float(h) for h in (sys.argv[5].split(',') if len(sys.argv) > 5 else ['15.0', '21.0'])]
PI = math.pi
N, S_, E_, W_ = (PI, 0), (0, PI), (PI / 2, -PI / 2), (-PI / 2, PI / 2)   # (玩家 rotation.y, 鏡頭 yaw)
F = {'introDone': True, 'EXCHANGE_ROUTE': 'US', 'US_DEPARTED': True, 'US_ARRIVED': True}
COMMON = [('living_n', -1.6, -0.6, N), ('living_s', -1.6, -1.6, S_), ('living_e', -3.0, -1.0, E_), ('living_w', 0.4, -1.0, W_),
          ('kitchen_w', -2.4, 2.0, W_), ('hall_n', -1.0, 2.2, N)]
SPOTS = {'us_apartment': COMMON + [('bed_e', 2.4, -1.0, E_), ('bed_n', 3.2, 0.4, N)],
         'us_shared': COMMON + [('bedA_e', 2.4, -2.0, E_), ('bedB_e', 2.4, 0.0, E_)]}[ZONE]
async def main():
    run = L.Run('ab_us_interior', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        for h in HOURS:
            x0, z0 = SPOTS[0][1], SPOTS[0][2]
            await L.load_state(pg, {'zone': ZONE, 'hour': h, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': x0, 'z': z0, 'lv': 0}}, quiet_events=True)
            for _ in range(40):
                if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
            await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; })()")
            for (nm, x, z, (ry, cy)) in SPOTS:
                await pg.evaluate(f"(()=>{{ GAME.E.hour={h}; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch=0.38; GAME.E.cam.distTarget=3.8; }})()")
                await pg.wait_for_timeout(3500)
                await run.shot(pg, f'{nm}_{int(h*10):03d}')
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {zone:GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id, formal:!!(GAME.E.zone&&GAME.E.zone.formal), calls:r.calls, tris:r.triangles}; })()")
        print('last', json.dumps(info), 'errs', errs[:5]); await b.close()
    run.finish()
asyncio.run(main())
