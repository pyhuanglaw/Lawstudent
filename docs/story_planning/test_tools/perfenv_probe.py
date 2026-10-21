"""BB：X69 只量場景（LAWWW2 9aaa24a7 的量法）：路人、NPC 移出場景 → shadowMap.needsUpdate=true → E.render() → renderer.info。
[前置] 讀使用者 9/25 存檔；[捷徑] GAME.enter 到區域、設時間。四個方向各量一次。不是 iPhone：只比數字。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ZONES = os.environ.get('ZONES', 'wenzhou,campus,gongguan').split(','); HOURS = [float(x) for x in os.environ.get('HOURS', '15,19.5').split(',')]
MEAS = """(async()=>{ const E=GAME.E, R=E.renderer, sc=E.scene; const hid=[]; for(const n of (E.npcs||[]).concat(E.extras||[])){ const o=n&&n.obj; if(o&&o.parent){ hid.push([o,o.parent]); o.parent.remove(o); } }
  const out=[]; const yaw0=E.cam.yaw; R.info.autoReset=false;
  for(let k=0;k<4;k++){ E.cam.yaw=yaw0+k*Math.PI/2; await new Promise(r=>setTimeout(r,800)); R.shadowMap.needsUpdate=true; R.info.reset(); E.render(); out.push({calls:R.info.render.calls, tris:R.info.render.triangles}); }
  R.info.autoReset=true; E.cam.yaw=yaw0; for(const [o,p] of hid) p.add(o); return {zone:GAME.G.zone, h:+GAME.G.hour.toFixed(1), hidden:hid.length, dirs:out}; })()"""
async def main():
    run = L.Run('perfenv', OUT); rec = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.load(open(SAVE, encoding='utf-8')); await L.load_state(pg, st.get('G', st)); await pg.wait_for_timeout(6000); run.setup('讀存檔')
        for h in HOURS:
            for z in ZONES:
                await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h)); run.setup('[捷徑] %s GAME.enter(%s)' % (h, z))
                await pg.wait_for_timeout(9000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(3000)
                m = await pg.evaluate(MEAS); rec.append(m)
                print('  %-9s %4.1f  隱藏人物 %3d  calls %s  三角形 %s' % (m['zone'], m['h'], m['hidden'], [d['calls'] for d in m['dirs']], [d['tris'] for d in m['dirs']]), flush=True)
        json.dump(rec, open(os.path.join(OUT, 'perfenv.json'), 'w'), indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
    run.finish()
asyncio.run(main())
