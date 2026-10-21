"""PERF-CAMPUS-SHADOW-1020 第二輪：校園每一幀到底畫了什麼（主畫面＋陰影那一輪），照來源分組，列出三角形最多、draw call 最多的。
來源＝往上找第一個有名字的祖先；沒有名字的（合併過的程序化網格）列出材質名稱和大小。三個鏡頭位置同 shadow_audit.py。
[前置] 讀使用者 9/25 存檔；[捷徑] 設時間、GAME.enter('campus')、搬玩家。用法：python3 shadow_audit2.py <工作樹> <URL> <輸出.json> [時間，預設 15]"""
import os, sys, json, asyncio
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
SPOTS = {'campus_linze': (30, -95, 3.1416), 'campus_avenue': (-40, 0, 1.5708), 'campus_socsci': (24, -70, -1.5708)}
AUDIT = """(async()=>{ const E=GAME.E, S=E.scene, cam=E.camera; const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const cnt=()=>{ let n=0; S.traverse(o=>{ if(o.isMesh) n++; }); return n; }; let last=-1, same=0; for(let i=0;i<45&&same<3;i++){ await wait(1000); const c=cnt(); same=c===last?same+1:0; last=c; }
  cam.updateMatrixWorld(); const fc=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const sc=E.sun.shadow.camera; sc.updateMatrixWorld(); const fs=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(sc.projectionMatrix,sc.matrixWorldInverse));
  const src=o=>{ const names=[]; for(let p=o.parent;p&&p!==S;p=p.parent){ if(p.name) names.push(p.name); } return names.length?names[names.length-1]+(names.length>1?' / '+names[names.length-2]:''):'(scene)'; };
  const main={}, shad={}, anon=[]; const b=new THREE.Box3(), sz=new THREE.Vector3(), sp=new THREE.Sphere();
  S.traverse(o=>{ if(!(o.isMesh||o.isInstancedMesh)||o.isSprite) return; for(let p=o;p;p=p.parent) if(!p.visible) return; const geo=o.geometry; if(!geo||!geo.attributes||!geo.attributes.position) return;
    const mats=Array.isArray(o.material)?o.material:[o.material]; if(mats.every(m=>!m||m.visible===false)) return;
    if(!geo.boundingSphere) geo.computeBoundingSphere(); sp.copy(geo.boundingSphere).applyMatrix4(o.matrixWorld); if(o.isInstancedMesh&&o.boundingSphere) sp.copy(o.boundingSphere).applyMatrix4(o.matrixWorld);
    const inMain=o.frustumCulled===false||fc.intersectsSphere(sp), inShad=o.castShadow&&(o.frustumCulled===false||fs.intersectsSphere(sp));
    const tri=(geo.index?geo.index.count:geo.attributes.position.count)/3*(o.isInstancedMesh?o.count:1), draws=Array.isArray(o.material)?Math.max(1,geo.groups.length):1;
    const k=src(o); const add=(G,doIt)=>{ if(!doIt) return; const g=G[k]||(G[k]={n:0,draws:0,tris:0}); g.n++; g.draws+=draws; g.tris+=tri; };
    add(main,inMain); add(shad,inShad);
    if(k==='(scene)'&&(inMain||inShad)){ b.setFromObject(o); b.getSize(sz); anon.push({mat:mats.map(m=>m&&m.name||'').join('+'), tris:Math.round(tri), cast:!!o.castShadow, inMain, inShad, size:[sz.x,sz.y,sz.z].map(v=>+v.toFixed(1)), merged:!!(o.userData&&o.userData.merged), inst:o.isInstancedMesh?o.count:0}); } });
  const top=G=>Object.entries(G).map(([k,v])=>Object.assign({src:k},v)).sort((a,b)=>b.tris-a.tris).slice(0,40);
  E.render(); const R=E.renderer, calls=R.info.render.calls, tris=R.info.render.triangles;
  return {hour:E.hour, info:{calls,tris}, main:top(main), shadow:top(shad), anon:anon.sort((a,b)=>b.tris-a.tris).slice(0,60)}; })()"""
async def main():
    run = L.Run('shadow_audit2', os.path.dirname(OUT) or '.'); res = {}
    base = json.load(open(os.path.join(WT, 'tests/repro_1020/user_save_day9.json'), encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('[前置] 讀 9/25 存檔')
        await pg.evaluate("(async()=>{ GAME.G.hour=%s; GAME.E.hour=%s; await GAME.enter('campus'); })()" % (HOUR, HOUR)); await pg.wait_for_timeout(15000)
        for _ in range(3):
            n = await L.phone_away(pg, cdp, tries=4); shut = await L.close_panels(pg, cdp)
            if not (n or shut): break
            await pg.wait_for_timeout(1500)
        for name, (x, z, yaw) in SPOTS.items():
            await pg.evaluate("(([x,z,y])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); P.obj.rotation.y=y; GAME.E.cam.yaw=y+Math.PI; })(%s)" % json.dumps([x, z, yaw]))
            await pg.wait_for_timeout(5000); r = await pg.evaluate(AUDIT); res[name] = r
            print(name, 'info', r['info'], flush=True)
            for row in r['main'][:12]: print('  main', json.dumps(row, ensure_ascii=False), flush=True)
            for row in r['shadow'][:8]: print('  shad', json.dumps(row, ensure_ascii=False), flush=True)
            for row in r['anon'][:15]: print('  anon', json.dumps(row, ensure_ascii=False), flush=True)
        json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
