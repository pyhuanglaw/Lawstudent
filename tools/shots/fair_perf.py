"""社博那天校園的效能（LAWWW-C 21:45Z：多 26～36 個坐著的路人）：同一個時刻、同兩個鏡頭，社博當天 vs 平常日；照畫質。
[捷徑] 讀檔（條件事件關閉）、直接放玩家位置；路人照遊戲自己放（不藏）。用法：python3 fair_perf.py 工作樹 URL 輸出 日期 畫質"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, DATE, Q = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
PI = math.pi
SPOTS = [('stageN', -25.25, 1.6, PI, 0.0), ('avenueW', -18.0, 0.0, -PI / 2, PI / 2)]
SAMPLE = "(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<5000) requestAnimationFrame(f); else r(n*1000/(performance.now()-t0)); } requestAnimationFrame(f); }))()"
async def main():
    run = L.Run('fair_perf', OUT); res = {'date': DATE, 'q': Q}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.add_init_script("try{ localStorage.setItem('fatiao3d_settings', JSON.stringify({quality:'%s',joystick:true,volume:0,textSpeed:2,fps:false,guide:false})); }catch(e){}" % Q)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("for(const k of Object.keys(localStorage)) if(k!=='fatiao3d_settings') localStorage.removeItem(k); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate(f"STORY.dayOfKey('{DATE}')")
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': {'x': SPOTS[0][1], 'z': SPOTS[0][2], 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        await L.advance_dialogs(pg, cdp, run, lambda s: not s['busy'], max_steps=60)
        res['quality'] = await pg.evaluate("GAME.E.q.level")
        res['npcs'] = await pg.evaluate("(()=>{ const N=GAME.E.npcs||[]; return {all:N.length, staff:N.filter(n=>n.fairStaff).length, crowd:N.filter(n=>n.fairCrowd).length, extra:N.filter(n=>n.isExtra).length}; })()")
        for (nm, x, z, ry, cy) in SPOTS:
            await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch=0.22; }})()")
            await pg.wait_for_timeout(9000)
            v = [round(await pg.evaluate(SAMPLE), 2) for _ in range(3)]
            info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info; return [r.render.calls, r.render.triangles, r.programs?r.programs.length:0, r.memory.geometries]; })()")
            vis = await pg.evaluate("(()=>{ let n=0,s=0; for(const q of (GAME.E.npcs||[])) if(q.obj&&q.obj.visible){ n++; if(q.fairStaff) s++; } return [n,s]; })()")
            res[nm] = {'fps': v, 'mean': round(sum(v) / len(v), 2), 'calls': info[0], 'tris': info[1], 'programs': info[2], 'geoms': info[3], 'npcVisible': vis}
            print(nm, json.dumps(res[nm]), flush=True); await run.shot(pg, nm)
        res['errs'] = errs[:5]; print('npcs', json.dumps(res['npcs']), 'errs', errs[:3]); await b.close()
    json.dump(res, open(OUT + '/perf.json', 'w'), ensure_ascii=False)
    run.finish()
asyncio.run(main())
