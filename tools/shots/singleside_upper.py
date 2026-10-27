"""單面化的上限：同一頁、同一個鏡頭，「原本 → 區域裡全部材質改單面 → 原本 → 單面」各量 4×5 秒（路人藏起來）。
只是上限（葉片卡、十字薄片也少一半），不是交件的數字。[捷徑] 讀檔、直接放玩家位置。
用法：python3 upper_singleside.py 工作樹 URL 輸出資料夾 區域 x,z,方向;x,z,方向 [時段]（方向 N/S/E/W）"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONE, SPEC = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
HOUR = float(sys.argv[6]) if len(sys.argv) > 6 else 15.0
PI = math.pi
DIR = {'N': (PI, 0), 'S': (0, PI), 'E': (PI / 2, -PI / 2), 'W': (-PI / 2, PI / 2)}
F = {'introDone': True, 'EXCHANGE_ROUTE': 'US', 'US_DEPARTED': True, 'US_ARRIVED': True}
SAMPLE = "(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<5000) requestAnimationFrame(f); else r(n*1000/(performance.now()-t0)); } requestAnimationFrame(f); }))()"
TOGGLE = """(on)=>{ let n=0; const root=GAME.E.zone&&GAME.E.zone.group; if(!root) return -1; root.traverse(o=>{ if(!o.isMesh) return; for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(!m) continue;
  if(on){ if(m.userData._side0===undefined) m.userData._side0=m.side; if(m.side!==THREE.FrontSide){ m.side=THREE.FrontSide; m.needsUpdate=true; n++; } }
  else if(m.userData._side0!==undefined && m.side!==m.userData._side0){ m.side=m.userData._side0; m.needsUpdate=true; n++; } } }); return n; }"""
async def main():
    run = L.Run('upper_singleside', OUT); res = []
    spots = []
    for it in SPEC.split(';'):
        x, z, d = it.split(','); spots.append((float(x), float(z), d))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        x0, z0, _ = spots[0]
        await L.load_state(pg, {'zone': ZONE, 'hour': HOUR, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': x0, 'z': z0, 'lv': 0}}, quiet_events=True)
        for _ in range(60):
            if await pg.evaluate("!!(GAME.E.zone&&(GAME.E.zone.formal||GAME.E.zone.glbLoaded||true))"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(15000); await L.close_panels(pg, cdp)
        for (x, z, d) in spots:
            ry, cy = DIR[d]
            await pg.evaluate(f"(()=>{{ GAME.E.hour={HOUR}; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; }})()")
            await pg.wait_for_timeout(8000)
            row = {'spot': f'{x},{z},{d}'}
            for k, on in (('orig', False), ('single', True), ('orig2', False), ('single2', True)):
                n = await pg.evaluate(f"({TOGGLE})({'true' if on else 'false'})"); await pg.wait_for_timeout(3000)
                v = [round(await pg.evaluate(SAMPLE), 2) for _ in range(4)]
                info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return [r.calls, r.triangles]; })()")
                row[k] = {'mean': round(sum(v) / 4, 2), 'fps': v, 'calls': info[0], 'switched': n}
                if k in ('orig', 'single'): await run.shot(pg, f'{d}_{k}')
            await pg.evaluate(f"({TOGGLE})(false)")
            print(json.dumps(row, ensure_ascii=False)); res.append(row)
        print('errs', errs[:5]); await b.close()
    json.dump(res, open(OUT + '/upper.json', 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
