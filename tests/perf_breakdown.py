# 效能：每個場景的 draw call、三角形是哪些東西貢獻的（X69，PERF-WENZHOU-1020）——找卡頓的來源用，不是驗收。
# 照 perf_scenes.py 的場景與鏡頭，數「看得到的網格」：照最上層的來源分組（正式模型 GLB 的 ASSETS key／區域程序化的群組名／人物），
# 列出每組的網格數、材質數、三角形、會投影子的網格數與三角形（陰影那一輪要再畫一次）。
# 用法（先開 http server）：python3 tests/perf_breakdown.py http://127.0.0.1:8765/index.html [場景名 ...]
import asyncio, json, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import playlib as L
from perf_scenes import SCENES
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
ONLY = sys.argv[2:] or list(SCENES)
PROBE = """(async()=>{ const E=GAME.E, S=E.scene, R=E.renderer; const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const cnt=()=>{ let n=0; S.traverse(o=>{ if(o.isMesh) n++; }); return n; }; let last=-1, same=0; for(let i=0;i<45&&same<3;i++){ await wait(1000); const c=cnt(); same=c===last?same+1:0; last=c; }
  E.render(); const cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const sc=E.sun.shadow.camera; sc.updateMatrixWorld(); const sfr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(sc.projectionMatrix,sc.matrixWorldInverse));
  const tri=g=>{ if(!g) return 0; const n=g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0); return Math.round(n/3); };
  const npcObjs=new Set((E.npcs||[]).map(n=>n.obj)); if(E.player) npcObjs.add(E.player.obj);
  const label=o=>{ const ch=[]; let p=o; while(p&&p!==S){ ch.unshift(p); p=p.parent; } if(ch.some(q=>npcObjs.has(q))) return o.isSkinnedMesh?'人物（skinned）':'人物（其他）';
    const nm=q=>q?(q.name||(q.userData&&q.userData.ck?'ck':'')||q.type):''; return [nm(ch[0]),nm(ch[1]),nm(ch[2])].filter(Boolean).join('/'); };
  const G={}; const seen=new Set();
  S.traverse(o=>{ if(!(o.isMesh||o.isSkinnedMesh||o.isInstancedMesh)) return; let v=true, p=o; while(p){ if(!p.visible){ v=false; break; } p=p.parent; } if(!v) return;
    const mats=Array.isArray(o.material)?o.material:[o.material]; if(!mats.some(m=>m&&m.visible!==false)) return;
    if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);
    const inMain=o.frustumCulled===false||fr.intersectsSphere(bs), inSh=o.castShadow&&(o.frustumCulled===false||sfr.intersectsSphere(bs)); if(!inMain&&!inSh) return;
    const k=label(o); const g=G[k]||(G[k]={meshes:0,mats:new Set(),tris:0,shMeshes:0,shTris:0}); const t=tri(o.geometry)*(o.isInstancedMesh?o.count:1);
    if(inMain){ g.meshes+=mats.length; mats.forEach(m=>m&&g.mats.add(m.uuid)); g.tris+=t; } if(inSh){ g.shMeshes+=mats.length; g.shTris+=t; } });
  const out=Object.entries(G).map(([k,g])=>({k,meshes:g.meshes,mats:g.mats.size,tris:g.tris,shMeshes:g.shMeshes,shTris:g.shTris})).sort((a,b)=>(b.meshes+b.shMeshes)-(a.meshes+a.shMeshes));
  return {calls:R.info.render.calls, tris:R.info.render.triangles, groups:out.slice(0,25)}; })()"""

async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg)
        for nm in ONLY:
            zone, (x, z, yaw) = SCENES[nm]
            await L.load_state(pg, {'zone': zone, 'hour': 15.0, 'day': 9, 'weekday': 4, 'pos': {'x': x, 'z': z, 'yaw': yaw}, 'flags': {'introDone': True, 'afternoonDone': True}}, quiet_events=True)
            r = await pg.evaluate(PROBE)
            print(f"=== {nm}：一次 render {r['calls']} calls、{r['tris']} 三角形（含陰影那一輪）", flush=True)
            print('  來源                                   網格 材質   三角形 ｜ 陰影網格   陰影三角形')
            for g in r['groups']:
                print(f"  {g['k'][:38]:<38} {g['meshes']:>4} {g['mats']:>4} {g['tris']:>8} ｜ {g['shMeshes']:>6} {g['shTris']:>10}", flush=True)
        await b.close()

asyncio.run(main())
