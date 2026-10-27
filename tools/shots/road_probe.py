"""椰林大道柏油路：A→B→A 回到校園後路面變成地磚＋直條紋——查路面網格的材質與貼圖狀態。
用法：python3 road_probe.py 工作樹 URL 輸出 [查詢字串]"""
import asyncio, json, os, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; Q = sys.argv[4] if len(sys.argv) > 4 else ''
INSPECT = """(()=>{ const E=GAME.E; let road=null; E.scene.traverse(o=>{ if(o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.width===12&&o.geometry.parameters.height===196) road=o; });
  const out={zone:E.zone&&E.zone.def&&E.zone.def.id, found:!!road};
  if(road){ const m=road.material, t=m.map, im=t&&t.image; let vis=true; for(let p=road;p;p=p.parent) if(!p.visible) vis=false;
    out.road={visible:vis, y:+road.position.y.toFixed(3), parent:road.parent&&road.parent.name, matType:m.type, matVisible:m.visible, transparent:m.transparent, opacity:m.opacity, depthWrite:m.depthWrite,
      color:m.color&&m.color.getHexString(), mapType:t&&t.constructor.name, isCanvas:!!(t&&t.isCanvasTexture), imgType:im&&im.constructor&&im.constructor.name, w:im&&im.width, h:im&&im.height, ver:t&&t.version,
      repeat:t&&[t.repeat.x,+t.repeat.y.toFixed(2)], uuid:t&&t.uuid.slice(0,8), shared:!!(t&&ASSETS.texShare&&[...ASSETS.texShare.values()].includes(t)), userData:t&&Object.keys(t.userData||{}),
      merged:!!road.userData.merged, renderOrder:road.renderOrder}; }
  out.dedup=ASSETS.texDedup||null; out.warm=E.lastWarmup?{done:E.lastWarmup.done,depth:E.lastWarmup.depth,programs:E.lastWarmup.programs}:null; return out; })()"""
async def main():
    os.makedirs(OUT, exist_ok=True); run = L.Run('road_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + Q); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'weather': 'sunny', 'pos': {'x': -30, 'z': -7, 'lv': 0}}, quiet_events=True)
        async def look(tag):
            await pg.evaluate("(()=>{ const P=GAME.E.player.obj; P.position.x=-30; P.position.z=-7; P.rotation.y=1.5708; GAME.E.cam.yaw=-1.5708; GAME.E.cam.pitch=0.3; GAME.E.cam.distTarget=6; GAME.E.hour=11; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; })()")
            await pg.wait_for_timeout(3000); r = await pg.evaluate(INSPECT); print(tag, json.dumps(r, ensure_ascii=False), flush=True); await run.shot(pg, tag); return r
        await pg.wait_for_timeout(30000); await look('campus1')
        await pg.evaluate("void GAME.enter('wenzhou')"); await pg.wait_for_timeout(30000); print('wenzhou', json.dumps(await pg.evaluate(INSPECT), ensure_ascii=False), flush=True)
        await pg.evaluate("void GAME.enter('campus',{x:-30,z:-7,yaw:Math.PI/2})"); await pg.wait_for_timeout(30000); await look('campus2')
        await pg.wait_for_timeout(15000); await look('campus2_later')
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
