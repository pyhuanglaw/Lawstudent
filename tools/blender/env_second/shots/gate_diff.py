"""除錯（2026-10-11 文學院、校史館第一次整合測試的兩個 FAIL）：校園「改之前」（拿掉五個地標的 key）與一般，在進校門鏡頭畫到的東西逐一比對（依最上層群組分類）；以及「沒有標記的群組」裡哪些是空的。
用法：python3 tools/blender/env_second/shots/gate_diff.py <網址> before,before,formal <輸出.json>"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
URL = sys.argv[1]; MODES = sys.argv[2].split(',')
KEYS = ['bldg.campus_library', 'bldg.campus_bell', 'bldg.campus_admin', 'bldg.campus_arts', 'bldg.campus_hist']
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
PROBE = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const info={calls:ri.calls, tris:ri.triangles};
  const cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const z=E.zone.group; const top=o=>{ let p=o; while(p.parent&&p.parent!==z) p=p.parent; return p; }; const key=o=>{ const t=top(o); const u=t.userData||{}; return (t.name||t.type)+(u.ckTag?'#'+u.ckTag:'')+(u.merged?'#merged':'')+(u.dyn?'#dyn':''); };
  const per={}; const sp=new THREE.Sphere(); E.scene.updateMatrixWorld(true);
  E.scene.traverseVisible(o=>{ if(!(o.isMesh||o.isSprite||o.isPoints||o.isLine)) return; if(o.isMesh&&!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); let vis=true;
    if(o.frustumCulled&&o.isMesh){ sp.copy(o.isInstancedMesh?(o.boundingSphere||o.geometry.boundingSphere):o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); vis=fr.intersectsSphere(sp); }
    if(!vis) return; const k=(o.parent&&z&&(()=>{ let p=o; while(p&&p!==z) p=p.parent; return p===z; })())?key(o):('scene:'+(o.name||o.type)); const e=per[k]||(per[k]={n:0,cast:0}); e.n++; if(o.castShadow) e.cast++; });
  hid.forEach(a=>a[1].add(a[0])); return {info, per, lampsOn:E.lampsOn, shadowAuto:E.renderer.shadowMap.autoUpdate}; })"""
EMPTY = """(()=>{ const z=GAME.E.zone; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; }; const out=[];
  z.group.children.forEach((o,i)=>{ if(!o.isGroup||(o.userData&&o.userData.ckTag)||/_glb$/.test(o.name)) return; let vis=false; o.traverse(m=>{ if(!vis&&(m.isMesh||m.isSprite)&&!skip.has(m)&&shown(m)) vis=true; });
    if(!vis) out.push(i+':'+(o.name||'')+':'+Object.keys(o.userData||{}).join('/')+':'+o.children.length+':'+o.position.x.toFixed(1)+','+o.position.z.toFixed(1)); }); return out; })()"""
async def run(p, mode):
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
    await pg.goto(URL); await PL.wait_loaded(pg)
    if mode == 'before': await pg.evaluate("(()=>{ for(const k of %s) delete ASSETS.manifest[k]; })()" % json.dumps(KEYS))
    await pg.evaluate(SETTLED)
    await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
    await pg.evaluate("(async()=>{ const ks=['bldg.linze_exterior','bldg.wancai_exterior'].filter(k=>ASSETS.manifest[k]); await Promise.all(ks.map(k=>ASSETS.loadOne(k).catch(()=>null))); await new Promise(r=>setTimeout(r,1500)); })()")
    if mode == 'formal': await pg.evaluate("(async()=>{ for(let i=0;i<240;i++){ if(['campus_arts_glb','campus_hist_glb','campus_library_glb','campus_bell_glb','campus_admin_glb'].every(n=>GAME.E.zone.group.children.some(o=>o.name===n))) return; await new Promise(r=>setTimeout(r,250)); } })()")
    else: await pg.wait_for_timeout(3000)
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    st = await pg.evaluate("(()=>{ const A=ASSETS; return {status:Object.keys(A.status).length, cache:Object.keys(A.cache).length, errors:A.errors.slice(0,5)}; })()")
    empty = await pg.evaluate(EMPTY)
    pr = await pg.evaluate(PROBE + '([-110,1.7,0.5],[100,8,0])')
    await b.close(); return {'mode': mode, 'assets': st, 'empty': empty, 'probe': pr, 'errors': errs[:3]}
async def main():
    async with async_playwright() as p:
        out = [await run(p, m) for m in MODES]
    json.dump(out, open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
    for o in out: print(o['mode'], o['probe']['info'], 'empty', len(o['empty']), o['assets'], o['errors'])
asyncio.run(main())
