"""單面化同角度＋fps（通用：任何區域；PERF-SINGLESIDE-GLB-1025 第六份起，LAWWW2-C 10-27）。玩家跟隨鏡頭；[捷徑] 讀檔、直接放玩家位置；路人藏起來。
用法：python3 tools/shots/singleside_zone_ab.py 工作樹 URL 輸出資料夾 區域 'name:x,z,D;...'(D=N/S/E/W) [時段] [fps:name,name]（第一格先放一個暖身位置：讀檔後第一格的鏡頭有時還沒停好）"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONE, SPEC = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
HOUR = float(sys.argv[6]) if len(sys.argv) > 6 and sys.argv[6] else 15.0
FPS = sys.argv[7][4:].split(',') if len(sys.argv) > 7 and sys.argv[7].startswith('fps:') else None
PI = math.pi
DIR = {'N': (PI, 0), 'S': (0, PI), 'E': (PI / 2, -PI / 2), 'W': (-PI / 2, PI / 2)}
F = {'introDone': True, 'EXCHANGE_ROUTE': 'US', 'US_DEPARTED': True, 'US_ARRIVED': True}
SAMPLE = "(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<5000) requestAnimationFrame(f); else r(n*1000/(performance.now()-t0)); } requestAnimationFrame(f); }))()"
SPOTS = []
for it in SPEC.split(';'):
    nm, rest = it.split(':'); x, z, d = rest.split(','); SPOTS.append((nm, float(x), float(z), d))
async def main():
    run = L.Run('ab_zone', OUT); res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        await L.load_state(pg, {'zone': ZONE, 'hour': HOUR, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': SPOTS[0][1], 'z': SPOTS[0][2], 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(15000); await L.close_panels(pg, cdp)
        for (nm, x, z, d) in SPOTS:
            if FPS and nm not in FPS: continue
            ry, cy = DIR[d]
            await pg.evaluate(f"(()=>{{ GAME.E.hour={HOUR}; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; }})()")
            await pg.wait_for_timeout(8000)
            if FPS:
                v = [round(await pg.evaluate(SAMPLE), 2) for _ in range(4)]
                info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return [r.calls, r.triangles]; })()")
                res[nm] = {'fps': v, 'mean': round(sum(v) / 4, 2), 'calls': info[0], 'tris': info[1]}; print(nm, json.dumps(res[nm]))
            else:
                await run.shot(pg, nm)
        print('errs', errs[:5]); await b.close()
    if FPS: json.dump(res, open(OUT + '/fps.json', 'w'))
    run.finish()
asyncio.run(main())
