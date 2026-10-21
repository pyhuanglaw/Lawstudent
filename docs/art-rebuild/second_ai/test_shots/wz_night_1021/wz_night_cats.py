# LAWWW2-C 2026-10-21 量測工具（不是遊戲檔、不是正式測試）：放在 repo 根目錄的 tests/ 旁邊用；python3 這個檔 工作樹 URL 存檔 [小時]
"""溫州街晚上變重：照 BB 的 perf_probe 讀使用者 9/25 存檔、GAME.enter('wenzhou') 19:30，四個方向各量一次——
renderer.info（含陰影那一輪）＋分類（人物、各個模型），主畫面那一輪在視錐內、陰影那一輪在陰影相機內。用法：python3 wz_night_cats.py 工作樹 URL 存檔 [小時]"""
import os, sys, json, asyncio
sys.path.insert(0, sys.argv[1] + '/tests'); import playlib as L
from playwright.async_api import async_playwright
URL, SAVE = sys.argv[2], sys.argv[3]; H = float(sys.argv[4]) if len(sys.argv) > 4 else 19.5
Q = """(async()=>{ const E=GAME.E, R=E.renderer, S=E.scene; const vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const npcSet=new Map(); for(const n of E.npcs) npcSet.set(n.obj, 'NPC:'+(n.id||n.name||'?')); if(E.player) npcSet.set(E.player.obj,'PLAYER'); for(const x of (E.extras||[])) if(x.obj) npcSet.set(x.obj,'EXTRA'+(x.rider?':rider':''));
  const cat=o=>{ for(let p=o;p;p=p.parent){ if(npcSet.has(p)) return npcSet.get(p).startsWith('NPC')?'NPC':npcSet.get(p); } let top=o; while(top.parent&&top.parent!==E.zone.group&&top.parent!==S) top=top.parent; return (top.name||top.type); };
  const tri=o=>{ const g=o.geometry; if(!g) return 0; let n=(g.index?g.index.count:(g.attributes.position?g.attributes.position.count:0))/3; if(g.drawRange&&g.drawRange.count!==Infinity) n=Math.min(n,g.drawRange.count/3); if(o.isInstancedMesh) n*=o.count; return n; };
  const out=[]; const yaw0=E.cam.yaw;
  for(let k=0;k<4;k++){ E.cam.yaw=yaw0+k*Math.PI/2; await new Promise(r=>setTimeout(r,2500));
    const cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
    const lights=[]; S.traverse(o=>{ if(o.isLight&&o.castShadow&&o.shadow&&o.visible) lights.push(o); });
    const inF=(o,f)=>{ if(o.frustumCulled===false) return true; if(o.isSprite) return f.intersectsSprite(o); const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); const s=g.boundingSphere.clone(); if(o.isInstancedMesh){ if(!o.boundingSphere) o.computeBoundingSphere(); s.copy(o.boundingSphere); } s.applyMatrix4(o.matrixWorld); return f.intersectsSphere(s); };
    const main={}, sh={}; let mc=0, mt=0, sc=0, st=0;
    S.traverse(o=>{ if(!(o.isMesh||o.isSprite)||!vis(o)) return; const m=o.material; if(!m||m.visible===false) return; const n=Array.isArray(m)?m.length:1; const c=cat(o), t=tri(o);
      if(inF(o,fr)){ main[c]=main[c]||[0,0]; main[c][0]+=n; main[c][1]+=t; mc+=n; mt+=t; } });
    for(const Lg of lights){ const c=Lg.shadow.camera; c.updateMatrixWorld(); const sf=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));
      S.traverse(o=>{ if(!o.isMesh||!o.castShadow||!vis(o)) return; const m=o.material; const n=Array.isArray(m)?m.length:1; if(!inF(o,sf)) return; const k2=cat(o), t=tri(o); sh[k2]=sh[k2]||[0,0]; sh[k2][0]+=n; sh[k2][1]+=t; sc+=n; st+=t; }); }
    E.render(); const ri=R.info.render;
    out.push({k, info:{calls:ri.calls, tris:ri.triangles}, main:{calls:mc, tris:Math.round(mt)}, shadow:{calls:sc, tris:Math.round(st), lights:lights.length, autoUpdate:R.shadowMap.autoUpdate, needsUpdate:R.shadowMap.needsUpdate},
      mainCats:Object.entries(main).sort((a,b)=>b[1][1]-a[1][1]).slice(0,14).map(([a,b])=>[a,b[0],Math.round(b[1])]), shCats:Object.entries(sh).sort((a,b)=>b[1][1]-a[1][1]).slice(0,10).map(([a,b])=>[a,b[0],Math.round(b[1])])}); }
  E.cam.yaw=yaw0; const npcs=E.npcs.filter(n=>n.obj&&n.obj.parent).map(n=>n.id||n.name); return {h:+GAME.G.hour.toFixed(2), npcs, extras:(E.extras||[]).length, out}; })()"""
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(4000)
        for i in range(30):
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s['choices']: await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; bs[bs.length-1].click(); })()"); await pg.wait_for_timeout(500); continue
            break
        await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % H); await pg.evaluate("void GAME.enter('wenzhou')")
        await pg.wait_for_timeout(8000)
        r = await pg.evaluate(Q); print(json.dumps(r, ensure_ascii=False))
        await b.close()
asyncio.run(main())
