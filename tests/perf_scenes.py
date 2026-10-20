# 效能量測（X69、X79，PERF-WENZHOU-1020／PERF-CAMPUS-SHADOW-1020；使用者 2026-10-20：「溫州街、公館與校園卡頓、影子閃爍，必須有修正前後的效能數據」）。
# 同一台機器、同一組鏡頭量「修正前」「修正後」：每個場景
#   draw call、三角形（renderer.info，一次 render 含陰影那一輪）、投影子的網格數、看得到的網格數、材質數；
#   E.render() 的時間（SwiftShader：GPU 也是 CPU 模擬，數字只拿來前後比，不是手機的實際 fps）——有陰影、把太陽陰影關掉各量一次，看陰影那一輪佔多少。
# 這是量測工具，不是驗收（驗收照 docs/TESTING.md，BB 做）。
# 用法（先開 http server）：python3 tests/perf_scenes.py http://127.0.0.1:8765/index.html [輸出.json]
import asyncio, json, sys, time
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else None
# 名稱: (區域, 玩家位置 (x, z, yaw))；白天 15:00（有太陽陰影）
SCENES = {
    'wenzhou_mid': ('wenzhou', (10, 0, 1.5708)),
    'wenzhou_cafe': ('wenzhou', (44, -2, 1.5708)),
    'gongguan_mrt': ('gongguan', (-30, 10, 0)),
    'campus_linze': ('campus', (30, -95, 3.1416)),
    'campus_avenue': ('campus', (-40, 0, 1.5708)),
    'campus_socsci': ('campus', (24, -70, -1.5708)),
}
MEASURE = """(async()=>{ const E=GAME.E, R=E.renderer, S=E.scene; const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const cnt=()=>{ let n=0; S.traverse(o=>{ if(o.isMesh) n++; }); return n; };   /* 正式模型（GLB）是載入以後才接上：等網格數 3 秒不變（最多 45 秒） */
  let last=-1, same=0; for(let i=0;i<45&&same<3;i++){ await wait(1000); const c=cnt(); same=c===last?same+1:0; last=c; }
  let vis=0, cast=0; const mats=new Set(); S.traverse(o=>{ if(!o.isMesh&&!o.isInstancedMesh&&!o.isSkinnedMesh) return; let v=true, p=o; while(p){ if(!p.visible){ v=false; break; } p=p.parent; } if(!v) return; vis++; if(o.castShadow) cast++; (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m&&mats.add(m.uuid)); });
  const gl=R.getContext(); const once=()=>{ const t=performance.now(); E.render(); gl.finish(); return performance.now()-t; };   /* gl.finish：等 GPU（SwiftShader）真的畫完，量到的才是一格的成本 */
  once(); const ri=R.info.render; const calls=ri.calls, tris=ri.triangles;
  const N=8; let ts=[]; for(let i=0;i<N;i++) ts.push(once()); ts.sort((a,b)=>a-b); const med=ts[N>>1];
  const sc=E.sun&&E.sun.castShadow; if(E.sun) E.sun.castShadow=false; once(); const calls0=R.info.render.calls, tris0=R.info.render.triangles; let ts0=[]; for(let i=0;i<N;i++) ts0.push(once()); ts0.sort((a,b)=>a-b); if(E.sun) E.sun.castShadow=sc;
  return {calls, tris, shadowCasters:cast, visibleMeshes:vis, materials:mats.size, renderMs:+med.toFixed(1), noShadow:{calls:calls0, tris:tris0, renderMs:+ts0[N>>1].toFixed(1)}, shadowMap:E.sun&&E.sun.shadow?E.sun.shadow.mapSize.x:null, fps:GAME.fps?+GAME.fps.toFixed(1):null}; })()"""

async def main():
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for nm, (zone, (x, z, yaw)) in SCENES.items():
            t0 = time.time()
            await L.load_state(pg, {'zone': zone, 'hour': 15.0, 'day': 9, 'weekday': 4, 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': {'introDone': True, 'afternoonDone': True}}, quiet_events=True)
            r = await pg.evaluate(MEASURE)
            r['secs'] = round(time.time() - t0, 1)
            res[nm] = r
            print(nm, json.dumps(r, ensure_ascii=False), flush=True)
        await b.close()
    if OUT:
        json.dump(res, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    asyncio.run(main())
