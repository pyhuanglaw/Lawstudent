"""BB：X69／X79 卡頓的數字（不是手機幀率：SwiftShader 只看相對大小）。[前置] 讀存檔，[捷徑] GAME.enter 各區域，
等 8 秒後量：draw calls、三角形、幾何、貼圖、shader 程式、會投影子的物件數、燈數、5 秒內的幀數（只做相對比較）。四個方向各量一次，取最大。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
ZONES = os.environ.get('ZONES', 'campus,wenzhou,gongguan,cafe,dorm').split(',')
HOURS = [float(x) for x in os.environ.get('HOURS', '15,19.5').split(',')]
MEAS = """(async()=>{ const E=GAME.E, R=E.renderer; let cast=0, mesh=0, lights=0, inst=0; E.scene.traverse(o=>{ if(o.isMesh){ mesh++; if(o.castShadow&&o.visible) cast++; if(o.isInstancedMesh) inst++; } if(o.isLight&&o.visible) lights++; });
  const out=[]; const yaw0=E.cam.yaw; for(let k=0;k<4;k++){ E.cam.yaw=yaw0+k*Math.PI/2; await new Promise(r=>setTimeout(r,1500)); const f0=R.info.render.frame; const t0=performance.now(); await new Promise(r=>setTimeout(r,4000)); const fps=(R.info.render.frame-f0)/((performance.now()-t0)/1000); out.push({calls:R.info.render.calls, tris:R.info.render.triangles, fps:+fps.toFixed(2)}); }
  E.cam.yaw=yaw0; return {zone:GAME.G.zone, h:+GAME.G.hour.toFixed(1), mesh, cast, inst, lights, geos:R.info.memory.geometries, texs:R.info.memory.textures, progs:(R.info.programs||[]).length, shadow:R.shadowMap.enabled, dirs:out}; })()"""
async def main():
    run = L.Run('perf', OUT); rec = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀存檔'); await pg.wait_for_timeout(4000)
        for h in HOURS:
            for zn in ZONES:
                for i in range(30):
                    s = await L.state(pg)
                    if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
                    if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(500); continue
                    break
                await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.evaluate("void GAME.enter(%s)" % json.dumps(zn)); run.setup('[捷徑] %.1f GAME.enter(%s)' % (h, zn))
                await pg.wait_for_timeout(8000)
                r = await pg.evaluate(MEAS); rec.append(r)
                mx = max(r['dirs'], key=lambda q: q['calls'])
                print('  %-9s %5.1f  calls 最多 %4d  三角形 %7d  fps(SwiftShader) %s  mesh %d  投影子 %d  instanced %d  燈 %d  幾何 %d  貼圖 %d  shader %d' % (zn, h, mx['calls'], mx['tris'], [q['fps'] for q in r['dirs']], r['mesh'], r['cast'], r['inst'], r['lights'], r['geos'], r['texs'], r['progs']), flush=True)
                await run.shot(pg, '%s_%02d' % (zn, int(h)))
        json.dump(rec, open(os.path.join(OUT, 'perf_rec.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
