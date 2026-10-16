"""GPU 貼圖洩漏追蹤（BUG-01，2026-10-16）：用法 python3 tools/dev_scratch/tex_leak3.py URL [區域,區域,…]。
掛 WebGL createTexture／deleteTexture，記建立時的區域、正在畫的物件、材質、three 貼圖；來回幾次後列出不在場景裡、還活著的 GPU 貼圖（依物件分組）。
找到的第一個原因：VRM 骨架 clone 的 Skeleton.boneTexture 沒釋放（ASSETS.releaseVRM 已修，tests/vrm_release_unit.js）。"""
# 貼圖洩漏追蹤第三版：直接掛 WebGL 的 createTexture／deleteTexture，記下每個 GPU 貼圖「建立時在哪個區域、上傳時正在畫哪個物件、哪個材質、哪個 three 貼圖」。
# 來回幾次以後，列出「在別的區域建立、回到校園還活著」的 GPU 貼圖，依物件路徑分組。
import asyncio, json, sys
sys.path.insert(0, '/home/user/Lawstudent/tests')
from playwright.async_api import async_playwright
import playlib as L
URL = sys.argv[1]
ZONES = sys.argv[2].split(',') if len(sys.argv) > 2 else ['cvs', 'wenzhou', 'noodle', 'cvs']
TRACK = r"""(()=>{ const E=GAME.E, R=E.renderer, gl=R.getContext(); window.__gt=new Map(); let seq=0; window.__last={obj:null,mat:null,tex:null};
  const path=o=>{ const p=[]; for(let i=0;i<6&&o;i++){ p.push((o.name||o.type)+(o.userData&&o.userData.zoneTag?'['+o.userData.zoneTag+']':'')); o=o.parent; } return p.join('<'); };
  const oBR=THREE.Object3D.prototype.onBeforeRender; THREE.Object3D.prototype.onBeforeRender=function(){ __last.obj=this; return oBR.apply(this,arguments); };
  const pg=R.properties.get.bind(R.properties); R.properties.get=function(o){ if(o){ if(o.isTexture) __last.tex=o; else if(o.isMaterial) __last.mat=o; } return pg(o); };
  const cT=gl.createTexture.bind(gl); gl.createTexture=function(){ const t=cT(); const tx=__last.tex, m=__last.mat, o=__last.obj; const img=tx&&tx.image;
    __gt.set(t,{id:seq++, zone:GAME.G.zone, obj:o?path(o):'', inScene:null, objRef:o, mat:m?(m.name||m.type):'', tex:tx?(tx.name||tx.constructor.name):'', src:img?(img.src?String(img.src).replace(/^.*\/assets\//,'assets/').slice(0,80):(img.width+'x'+img.height+' '+(img.constructor&&img.constructor.name))):'', rt:!!(tx&&tx.isRenderTargetTexture)}); return t; };
  const dT=gl.deleteTexture.bind(gl); gl.deleteTexture=function(t){ __gt.delete(t); return dT(t); };
  return true; })()"""
REPORT = r"""(()=>{ const sc=GAME.E.scene; const live=[...__gt.values()]; const g={};
  for(const r of live){ let attached=false, o=r.objRef; while(o){ if(o===sc){ attached=true; break; } o=o.parent; } r.inScene=attached; }
  for(const r of live){ if(r.inScene) continue; const key=r.zone+'|'+(r.inScene?'IN':'OUT')+'|'+r.obj.split('<').slice(0,4).join('<')+'|'+r.mat+'|'+r.tex+'|'+r.src.replace(/\d+x\d+/,'WxH'); g[key]=(g[key]||0)+1; }
  const byZone={}; for(const r of live){ byZone[r.zone]=(byZone[r.zone]||0)+1; }
  return {live:live.length, info:GAME.E.renderer.info.memory.textures, byZone, top:Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,60)}; })()"""
MEM = "(()=>{ const m=GAME.E.renderer.info.memory; return [m.geometries,m.textures,__gt.size]; })()"
async def go(pg, zone):
    await pg.evaluate("void GAME.enter(%s,undefined,{noFade:true})" % json.dumps(zone))
    for _ in range(120):
        await pg.wait_for_timeout(1000)
        if await pg.evaluate("GAME.G.zone") == zone: break
    await pg.wait_for_timeout(6000)
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        await pg.evaluate(TRACK)
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'day': 5, 'weekday': 0, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True}})
        await pg.wait_for_timeout(8000)
        print('start [geo, info.textures, gl live]', await pg.evaluate(MEM), flush=True)
        for other in ZONES:
            await go(pg, other); print(' in', other, await pg.evaluate(MEM), flush=True)
            await go(pg, 'campus'); print('back from', other, await pg.evaluate(MEM), flush=True)
        r = await pg.evaluate(REPORT)
        print('live', r['live'], 'info', r['info'], 'byZone', r['byZone'], flush=True)
        for row in r['top']: print(row, flush=True)
        await b.close()
asyncio.run(main())
