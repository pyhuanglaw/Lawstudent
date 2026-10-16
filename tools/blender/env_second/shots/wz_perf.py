"""溫州街效能拆解：三個鏡頭（和 tests/wz_street_integration.py 相同）的 draw call／三角形，總數＋每個正式模型、每類物件藏起來後少多少。
用法：python3 wz_perf.py <worktree> <url> <out.json>"""
import asyncio, json, sys
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.path.insert(0, WT + '/tests')
import playlib as PL  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

GLBS = ['wenzhou_street_glb', 'wz_jphouse_glb', 'wz_props_glb', 'wz_park_glb', 'wz_scooters_glb']
VIEWS = [('lane_east', (30, 1.7, -1.5), (44, 3.5, 1.5)), ('lane_west', (14, 1.7, 1.0), (-2, 4.0, -2)), ('arcade', (14.5, 1.6, -1.8), (24, 2.2, -5.5))]
WAIT_FORMAL = "(async()=>{ const want=%s; for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&want.every(n=>z.group.children.some(o=>o.name===n))) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % json.dumps(GLBS)
SETUP = """(()=>{ window.__cats=()=>{ const E=GAME.E, g=E.zone.group, cats={};
    for(const o of g.children){ let k=o.name&&/_glb$|^asset:|^trees|cafe/i.test(o.name)?o.name:(o.isSprite?'sprites':(o.userData&&o.userData.formalGlow?'glows':(o.isMesh?'kit_mesh':'kit_group'))); (cats[k]=cats[k]||[]).push(o); }
    for(const o of E.scene.children){ if(o===g) continue; const k='scene:'+(o.name||o.type); (cats[k]=cats[k]||[]).push(o); }
    return cats; };
  window.__draw=async()=>{ const E=GAME.E; let best={calls:0,tris:0}; const f0=E.frame; let last=f0;
    for(let i=0;i<400&&E.frame<f0+5;i++){ await new Promise(r=>setTimeout(r,50)); if(E.frame!==last){ last=E.frame; const ri=E.renderer.info.render; if(ri.calls>best.calls) best={calls:ri.calls,tris:ri.triangles}; } }
    return best; };
  window.__stat=(objs)=>{ let meshes=0, cast=0, tris=0; const mats=new Set(); for(const r of objs) r.traverse(o=>{ if(!(o.isMesh||o.isSprite)) return; meshes++; if(o.castShadow) cast++; const m=o.material; (Array.isArray(m)?m:[m]).forEach(x=>x&&mats.add(x.uuid)); const ge=o.geometry; if(ge){ const n=ge.index?ge.index.count:(ge.attributes.position?ge.attributes.position.count:0); tris+=n/3*(o.isInstancedMesh?o.count:1); } }); return {meshes,cast,mats:mats.size,tris:Math.round(tris)}; };
  return true; })()"""
MEASURE = """(async([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
  const out={total:await __draw(), cats:{}}; const cats=__cats();
  for(const [k,objs] of Object.entries(cats)){ const vis=objs.map(o=>o.visible); objs.forEach(o=>o.visible=false); const d=await __draw(); objs.forEach((o,i)=>o.visible=vis[i]);
    out.cats[k]={dCalls:out.total.calls-d.calls, dTris:out.total.tris-d.tris, n:objs.length, ...__stat(objs)}; }
  hid.forEach(a=>a[1].add(a[0])); return out; })"""


async def main():
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); ok = await PL.wait_loaded(pg); print('loaded', ok, flush=True)
        await PL.load_state(pg, {'zone': 'wenzhou', 'hour': 17.5, 'pos': {'x': 30, 'z': -1, 'yaw': 1.5708}}, quiet_events=True)
        print('formal', await pg.evaluate(WAIT_FORMAL), flush=True)
        await pg.wait_for_timeout(3000); await pg.evaluate(SETUP)
        for name, e, l in VIEWS:
            r = await pg.evaluate(MEASURE, [list(e), list(l)]); res[name] = r
            print(name, json.dumps(r['total']), flush=True)
            for k, v in sorted(r['cats'].items(), key=lambda kv: -kv[1]['dCalls']): print('   %-28s dCalls %4d dTris %7d | n %3d meshes %4d cast %4d mats %3d tris %7d' % (k, v['dCalls'], v['dTris'], v['n'], v['meshes'], v['cast'], v['mats'], v['tris']), flush=True)
        print('errs', errs[:3])
        await b.close()
    json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())
