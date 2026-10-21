"""PERF-CAMPUS-SHADOW-1020：校園的投影子物件是誰（BB-C：19:30 校園 516 draw calls／857 個投影子）。
在三個鏡頭位置（perf_scenes.py 的 campus_linze／campus_avenue／campus_socsci），把看得到、castShadow 的網格照「來源」分組：
來源＝往上找第一個有名字的祖先（GLB 的根、套件的群組），記：個數、三角形、在陰影相機範圍內的個數、最大邊 < 1 m 的小東西個數。
再量一次 renderer.info：有陰影、沒陰影的 draw call 差＝陰影那一輪。
[前置] 讀使用者 9/25 存檔；[捷徑] 設時間、GAME.enter('campus')、搬玩家。用法：python3 shadow_audit.py <工作樹> <URL> <輸出.json> [時間，預設 19.5]"""
import os, sys, json, asyncio
WT, URL, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 19.5
sys.path.insert(0, os.path.join(WT, 'tests')); import playlib as L
from playwright.async_api import async_playwright
SPOTS = {'campus_linze': (30, -95, 3.1416), 'campus_avenue': (-40, 0, 1.5708), 'campus_socsci': (24, -70, -1.5708)}
AUDIT = """(async()=>{ const E=GAME.E, R=E.renderer, S=E.scene; const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const cnt=()=>{ let n=0; S.traverse(o=>{ if(o.isMesh) n++; }); return n; }; let last=-1, same=0; for(let i=0;i<45&&same<3;i++){ await wait(1000); const c=cnt(); same=c===last?same+1:0; last=c; }
  const sc=E.sun.shadow.camera; sc.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(sc.projectionMatrix,sc.matrixWorldInverse));
  const src=o=>{ const names=[]; for(let p=o.parent;p&&p!==S;p=p.parent){ if(p.name) names.push(p.name); } return names.length?names[names.length-1]+(names.length>1?' / '+names[names.length-2]:''):'(scene)'; };
  const G={}; const b=new THREE.Box3(), sz=new THREE.Vector3(), sp=new THREE.Sphere(); let total=0, inFr=0;
  S.traverse(o=>{ if(!(o.isMesh||o.isInstancedMesh)||!o.castShadow) return; let v=true; for(let p=o;p;p=p.parent) if(!p.visible){ v=false; break; } if(!v) return;
    const geo=o.geometry; if(!geo) return; if(!geo.boundingSphere) geo.computeBoundingSphere(); sp.copy(geo.boundingSphere).applyMatrix4(o.matrixWorld); const inside=fr.intersectsSphere(sp);
    b.setFromObject(o); b.getSize(sz); const small=Math.max(sz.x,sz.y,sz.z)<1.0; const tri=(geo.index?geo.index.count:geo.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);
    const k=src(o); const g=G[k]||(G[k]={n:0,inFr:0,small:0,smallInFr:0,tris:0,trisInFr:0,inst:0}); g.n++; g.tris+=tri; if(inside){ g.inFr++; g.trisInFr+=tri; inFr++; } if(small){ g.small++; if(inside) g.smallInFr++; } if(o.isInstancedMesh) g.inst++; total++; });
  const once=()=>{ E.render(); }; const s0=E.sun.castShadow; E.sun.castShadow=false; once(); const c0=R.info.render.calls, t0=R.info.render.triangles; E.sun.castShadow=s0; R.shadowMap.needsUpdate=true; once(); const c1=R.info.render.calls, t1=R.info.render.triangles;
  const rows=Object.entries(G).sort((a,b)=>b[1].inFr-a[1].inFr).map(([k,v])=>Object.assign({src:k},v));
  return {hour:E.hour, casters:total, castersInShadowFrustum:inFr, calls:{noShadow:c0, withShadow:c1, shadowPass:c1-c0}, tris:{noShadow:t0, withShadow:t1}, shadowBox:[sc.left,sc.right,sc.top,sc.bottom].map(v=>+v.toFixed(1)), rows:rows.slice(0,60)}; })()"""
async def main():
    run = L.Run('shadow_audit', os.path.dirname(OUT) or '.'); res = {}
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
            print(name, 'casters', r['casters'], 'inFrustum', r['castersInShadowFrustum'], 'calls', r['calls'], flush=True)
            for row in r['rows'][:15]: print('   ', json.dumps(row, ensure_ascii=False), flush=True)
        json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()
sys.exit(asyncio.run(main()))
