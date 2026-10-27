"""X79 校園白天「走起來卡」（PERF-CAMPUS-DAY-1027，LAWWW2-C 2026-10-27）：沿著經濟系那一年常走的路線（校門 → 椰林大道 → 總圖 → 社科院 → 霖澤館 → 回椰林大道）走，逐格記錄。
[捷徑] 讀檔；玩家每一格沿著遊戲找路的路線前進 STEP 公尺（直接設位置，不是搖桿）；路人照常。
每一格記：這一格多久（上一格開始到這一格開始）、render 花多久、新編譯的 shader（renderer.info.programs）、新上傳的貼圖、幾何、路人數。
用法：python3 tools/shots/x79_walk.py 工作樹 URL 輸出.json [STEP 公尺] [網址參數] [趟數] [等 E.lastWarmup 做完最多幾秒]"""
import asyncio, json, sys, statistics
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
STEP = float(sys.argv[4]) if len(sys.argv) > 4 else 1.2
QS = sys.argv[5] if len(sys.argv) > 5 else ''
PASSES = int(sys.argv[6]) if len(sys.argv) > 6 else 2
WARMWAIT = int(sys.argv[7]) if len(sys.argv) > 7 else 0
WP = [(-115, 0), (75, 2), (97.9, -60), (30, -92), (-40, 1)]
F = {'introDone': True}
SETUP = """(([wp,step])=>{ const E=GAME.E, R=E.renderer; window.__fr=[]; window.__done=false;
  window.__walk=false; let route=[]; let p=wp[0]; for(let i=1;i<wp.length;i++){ const seg=E.pathTo(p[0],p[1],0,wp[i][0],wp[i][1],0)||[]; let a=p; for(const q of seg){ const d=Math.hypot(q[0]-a[0],q[1]-a[1]), n=Math.max(1,Math.ceil(d/step)); for(let k=1;k<=n;k++) route.push([a[0]+(q[0]-a[0])*k/n, a[1]+(q[1]-a[1])*k/n, i]); a=q; } p=wp[i]; }
  window.__route=route; let idx=0, pass=0; const orig=E.render; let last=performance.now();
  E.render=function(){ const t0=performance.now(); const P=E.player.obj;
    if(window.__walk&&!window.__done){ const q=route[idx]; const dx=q[0]-P.position.x, dz=q[1]-P.position.z; P.position.x=q[0]; P.position.z=q[1]; if(Math.hypot(dx,dz)>1e-3) P.rotation.y=Math.atan2(dx,dz); E.cam.yaw=P.rotation.y+Math.PI; idx++; if(idx>=route.length){ idx=0; pass++; if(pass>=window.__passes) window.__done=true; } }
    const i=R.info, pr=(i.programs||[]).length, seen=new Set(i.programs||[]), tx=i.memory.textures, ge=i.memory.geometries;
    orig.apply(this,arguments); const t1=performance.now(); const np=(i.programs||[]).filter(q=>!seen.has(q)).map(q=>q.name+' '+(q.cacheKey||'').replace(/,+/g,',').slice(0,400));
    window.__fr.push({dt:+(t0-last).toFixed(1), r:+(t1-t0).toFixed(1), dprog:(i.programs||[]).length-pr, prog:(i.programs||[]).length, dtex:i.memory.textures-tx, tex:i.memory.textures, geo:i.memory.geometries, dgeo:i.memory.geometries-ge, calls:i.render.calls, npc:(E.npcs||[]).filter(n=>n.obj&&n.obj.visible).length, x:+P.position.x.toFixed(1), z:+P.position.z.toFixed(1), pass:window.__walk?pass:-1, seg:(route[Math.max(0,idx-1)]||[0,0,0])[2], np});
    last=t0; };
  return route.length; })"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + QS); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': WP[0][0], 'z': WP[0][1], 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(3000)
        await pg.evaluate('(n)=>{ window.__passes=n; }', PASSES); n = await pg.evaluate(SETUP, [WP, STEP]); print('route points', n)
        await pg.wait_for_timeout(17000); await L.close_panels(pg, cdp)
        for _ in range(int(WARMWAIT / 5)):
            w = await pg.evaluate("GAME.E.lastWarmup||null")
            if not w or w.get('done'): break
            await pg.wait_for_timeout(5000)
        print('warmup', json.dumps(await pg.evaluate("GAME.E.lastWarmup||null")))
        await pg.evaluate("window.__walk=true")
        for _ in range(1800):
            if await pg.evaluate("window.__done"): break
            await pg.wait_for_timeout(2000)
        fr = await pg.evaluate("window.__fr"); print('frames', len(fr), 'errs', errs[:3]); await b.close()
    json.dump(fr, open(OUT, 'w'))
    w = [x for x in fr if x['pass'] == -1]
    if w:
        print(f"standing (warm-up) frames {len(w)} dt max {max(x['dt'] for x in w):.0f} newprog {sum(x['dprog'] for x in w)} frames-with-newprog {sum(1 for x in w if x['dprog'])}")
    for ps in (0, 1):
        f = [x for x in fr if x['pass'] == ps][1:]
        if not f: continue
        dts = sorted(x['dt'] for x in f); med = statistics.median(dts)
        print(f'pass {ps}: frames {len(f)} dt median {med:.0f} p90 {dts[int(len(dts)*.9)]:.0f} max {dts[-1]:.0f}  render median {statistics.median(x["r"] for x in f):.0f}  newprog {sum(x["dprog"] for x in f)} newtex {sum(max(0,x["dtex"]) for x in f)} newgeo {sum(max(0,x["dgeo"]) for x in f)}')
        for x in sorted(f, key=lambda x: -x['dt'])[:8]: print('   ', json.dumps(x))
asyncio.run(main())
