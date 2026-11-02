"""一般網址那一輪：三個超過的鏡頭，一次藏一個正式模型（root.visible=false）量 draw call／三角形少多少。用法：python3 probe_perf.py <repo> <URL>"""
import asyncio, json, sys, os
REPO, URL = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(REPO, 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
VIEWS = {'gate_avenue': ((-110, 1.7, 0.5), (100, 8, 0)), 'soc_court': ((24, 1.7, -71), (0, 3, -71)), 'teach_east': ((-15, 1.7, -69), (-38, 8, -70))}
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
DRAW = """(async(e,l,hideName)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const root=hideName?E.zone.group.children.find(o=>o.name===hideName):null; if(root) root.visible=false;
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); if(root) root.visible=true; return out; })"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); await PL.wait_loaded(pg); await pg.evaluate(SETTLED)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
        await pg.wait_for_timeout(8000); await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
        names = await pg.evaluate("GAME.E.zone.group.children.filter(o=>/^campus_.*_glb$/.test(o.name)).map(o=>o.name)")
        # 每個正式模型：網格數、會投影的網格數
        meshes = await pg.evaluate("(ns=>{ const out={}; for(const n of ns){ const r=GAME.E.zone.group.children.find(o=>o.name===n); let m=0,c=0; r.traverse(o=>{ if(o.isMesh&&o.visible){ m++; if(o.castShadow) c++; } }); out[n]=[m,c]; } return out; })(%s)" % json.dumps(names))
        print('MESHES', json.dumps(meshes))
        for v, (e, l) in VIEWS.items():
            base = await pg.evaluate(DRAW + '(%s,%s,null)' % (json.dumps(e), json.dumps(l)))
            res = {}
            for n in names:
                r = await pg.evaluate(DRAW + '(%s,%s,%s)' % (json.dumps(e), json.dumps(l), json.dumps(n)))
                res[n] = [base['calls'] - r['calls'], base['tris'] - r['tris']]
            print('VIEW', v, json.dumps(base), json.dumps({k: x for k, x in sorted(res.items(), key=lambda kv: -kv[1][0]) if x[0] or x[1]}))
        await pg.evaluate("GAME.E.endCinematic()")
        await b.close()
asyncio.run(main())
