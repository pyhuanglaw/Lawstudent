"""單面第五份：美國大超市 us_market 同角度＋fps（玩家跟隨鏡頭；[捷徑] 讀檔、直接放玩家位置；路人藏起來）。
用法：python3 ab_us_market.py 工作樹 URL 輸出資料夾 [fps]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
FPS = len(sys.argv) > 4 and sys.argv[4] == 'fps'
ONLY = sys.argv[5].split(',') if len(sys.argv) > 5 else None
PI = math.pi
N, S_, E_, W_ = (PI, 0), (0, PI), (PI / 2, -PI / 2), (-PI / 2, PI / 2)
F = {'introDone': True, 'EXCHANGE_ROUTE': 'US', 'US_DEPARTED': True, 'US_ARRIVED': True}
SPOTS = [('entry_n', 13.5, 13.0, N), ('produce_e', 15.3, -3.8, E_), ('produce_w', 15.3, -3.8, W_), ('aisle1_n', -10.95, -1.0, N), ('aisle2_s', -8.05, -3.0, S_),
         ('freezer_n', -19.0, -1.0, N), ('deli_n', -18.0, -8.5, N), ('checkout_n', -4.5, 13.0, N), ('checkout_s', 2.0, 5.5, S_), ('dairy_n', 6.0, -12.5, N), ('meat_n', -9.0, -12.5, N)]
FPS_SPOTS = ['entry_n', 'aisle1_n']
SAMPLE = "(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<5000) requestAnimationFrame(f); else r(n*1000/(performance.now()-t0)); } requestAnimationFrame(f); }))()"
async def main():
    run = L.Run('ab_us_market', OUT); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        await L.load_state(pg, {'zone': 'us_market', 'hour': 15.0, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': 13.5, 'z': 13.0, 'lv': 0}}, quiet_events=True)
        for _ in range(60):
            if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
        await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; })()")
        for (nm, x, z, (ry, cy)) in SPOTS:
            if FPS and nm not in FPS_SPOTS: continue
            if ONLY and nm not in ONLY: continue
            await pg.evaluate(f"(()=>{{ GAME.E.hour=15.0; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch=0.38; GAME.E.cam.distTarget=3.8; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; }})()")
            await pg.wait_for_timeout(8000)
            if FPS:
                v = [round(await pg.evaluate(SAMPLE), 2) for _ in range(4)]
                info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return [r.calls, r.triangles]; })()")
                res[nm] = {'fps': v, 'mean': round(sum(v) / len(v), 2), 'calls': info[0], 'tris': info[1]}; print(nm, json.dumps(res[nm]))
            else:
                await run.shot(pg, nm)
        print('errs', errs[:5]); await b.close()
    if FPS: json.dump(res, open(OUT + '/fps.json', 'w'))
    run.finish()
asyncio.run(main())
