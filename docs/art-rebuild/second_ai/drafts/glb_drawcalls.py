"""校園地標正式模型的 draw call 拆帳（v9.6 RC7；campus_glb_integration 超出 1.1 倍的鏡頭）：同一個鏡頭，一次藏起一個 campus_*_glb，量少了多少 draw call／三角形；
再分「主畫面」和「陰影」：把那個模型的 castShadow 全關掉再量一次。設定和 campus_glb_integration 相同（讀檔 (74,2) 17:30、凍結時鐘、藏起路人）。
用法：python3 glb_drawcalls.py <網址> <輸出.json>"""
import asyncio, json, os, sys
sys.path.insert(0, sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.getcwd(), 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
URL, OUT = sys.argv[1], sys.argv[2]
VIEWS = [('gate_avenue', (-110, 1.7, 0.5), (100, 8, 0)), ('admin_arcade', (-58.6, 1.6, 26.4), (-20, 2.4, 26.4)), ('arts_arcade', (-56.6, 1.6, -26.3), (-20, 2.4, -26.3)), ('bell_avenue', (-38, 1.7, 4), (-38, 3.0, 16.5))]
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
MEASURE = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const roots=E.zone.group.children.filter(o=>/^campus_.*_glb$/.test(o.name));
    const meas=async()=>{ const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; };
    const all=await meas(); const per={};
    const none=await (async()=>{ roots.forEach(r=>r.visible=false); const m=await meas(); roots.forEach(r=>r.visible=true); return m; })();
    for(const r of roots){ let meshes=0, cast=0; const mats=new Set(); r.traverse(o=>{ if(o.isMesh){ meshes++; if(o.castShadow) cast++; mats.add(o.material.name); } });
      r.visible=false; const off=await meas(); r.visible=true;
      const cs=[]; r.traverse(o=>{ if(o.isMesh&&o.castShadow){ cs.push(o); o.castShadow=false; } }); const noShadow=await meas(); cs.forEach(o=>o.castShadow=true);
      per[r.name]={meshes, castMeshes:cast, materials:mats.size, calls:all.calls-off.calls, shadowCalls:all.calls-noShadow.calls, tris:all.tris-off.tris}; }
    hid.forEach(a=>a[1].add(a[0])); return {all, none, per}; })"""

async def main():
    out = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); await PL.wait_loaded(pg); await pg.evaluate(SETTLED)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
        await pg.evaluate("(async()=>{ const ks=Object.keys(ASSETS.manifest).filter(k=>/^bldg\\.(campus_|linze_exterior|wancai_exterior)/.test(k)); await Promise.all(ks.map(k=>ASSETS.loadOne(k).catch(()=>null))); await new Promise(r=>setTimeout(r,3000)); })()")
        await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
        for name, eye, look in VIEWS:
            out[name] = await pg.evaluate(MEASURE + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
            print(name, json.dumps(out[name]['all']), 'none', json.dumps(out[name]['none']), flush=True)
            for k, v in sorted(out[name]['per'].items(), key=lambda kv: -kv[1]['calls']): print('   %-24s %s' % (k, json.dumps(v)), flush=True)
        out['errors'] = errs[:5]
        await b.close()
    json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=1)

asyncio.run(main())
