"""CC-C（帳號 C）11-04：PARK_glb_r2 的群組拆解（BB-C 13:24，BB_255）——tests/campus_glb_integration.py 的 avenue 鏡頭 draw call 超過改之前的 1.1 倍；
  BB-C 的判斷：那個鏡頭看不到共同教學館，兩次讀檔場景不一樣，數字先不採信。這支：同一頁【前置／捷徑】讀檔進校園兩輪（條件事件關閉、路人和騎腳踏車的路人藏起來，同 campus_glb_integration 的效能那一項），
  每一輪在 avenue 鏡頭（(38, 1.7, 0.5) → (100, 10, 0)）記 renderer.info 的 calls／tris（兩幀穩定後），再把 zone.group 的每個子群組
  估計 calls（視錐裡、看得見的 mesh × 材質數；InstancedMesh 算 1）和 tris（index 或 position 數 ÷3 × instance 數），列出兩輪差最多的 10 組；也列兩輪都最多的 10 組。
  只記錄，不判 PASS／FAIL（判定 BB）；Playwright，不是手機實機。
用法：LW_TESTS=<wt>/tests [VIEW=38,1.7,0.5,100,10,0] [ROUNDS=2] python3 cc_park_glb_groups_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
VIEWS = [(v.split(':')[0], [float(x) for x in v.split(':')[1].split(',')]) for v in (os.environ.get('VIEWS') or 'avenue:38,1.7,0.5,100,10,0').split(';') if ':' in v]   # 名稱:ex,ey,ez,lx,ly,lz;…
HIDE_BIKES = os.environ.get('HIDE_BIKES', '1') == '1'   # BB-C 14:0x：量之前把 parked_bikes 藏起來（每次讀檔停的車不一樣）
ROUNDS = int(os.environ.get('ROUNDS') or 2)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


MEASURE_JS = r"""(async(e,l)=>{ const E=GAME.E; const hid=[], hidN=[];
  for(const n of (E.npcs||[])) if(n&&n.obj&&!n.hidden){ hidN.push(n); n.hidden=true; n.obj.visible=false; }
  for(const x of (E.extras||[])) if(x&&x.obj&&!x.hidden&&!x.trees&&x.name!=='treeFieldExtra'){ hidN.push(x); x.hidden=true; x.obj.visible=false; }
  if(window.__ccHideBikes){ const pb=E.zone&&E.zone.group&&E.zone.group.getObjectByName('parked_bikes'); if(pb&&pb.visible){ hid.push(pb); pb.visible=false; } }
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250));
  const ri=E.renderer.info.render, tot={calls:ri.calls, tris:ri.triangles};
  const cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const groups={}; const g=E.zone&&E.zone.group;
  if(g) for(const c of g.children){ const key=(c.name||'(無名)')+'#'+c.type; const a=groups[key]||(groups[key]={calls:0,tris:0,meshes:0});
    c.traverse(o=>{ if(!(o.isMesh||o.isInstancedMesh)||!vis(o)) return; let inF=true; try{ if(o.geometry){ if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const s=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld); if(!o.isInstancedMesh&&o.frustumCulled!==false) inF=fr.intersectsSphere(s); } }catch(err){}
      if(!inF) return; const nm=Array.isArray(o.material)?o.material.length:1; const geo=o.geometry; const n=geo?(geo.index?geo.index.count:(geo.attributes.position?geo.attributes.position.count:0))/3:0; const inst=o.isInstancedMesh?(o.count||1):1;
      a.calls+=nm; a.tris+=Math.round(n*inst); a.meshes++; }); }
  hid.forEach(o=>o.visible=true); hidN.forEach(n=>{ n.hidden=false; }); E.endCinematic&&E.endCinematic();
  return {tot, groups, nGroups:Object.keys(groups).length}; })"""


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC PARK_glb 群組拆解：鏡頭 %s；%d 輪；%s；SHA=%s；Playwright，不是手機實機' % (J([n for n, _ in VIEWS]), ROUNDS, '停著的腳踏車藏起來' if HIDE_BIKES else '停著的腳踏車照舊', os.environ.get('SHA', '?')), flush=True)
    rounds = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        for r in range(ROUNDS):
            print('== 第 %d 輪：[前置／捷徑] 讀檔：校園 (30, 0.5)、14:00、條件事件關閉' % (r + 1), flush=True)
            await L.load_state(pg, {'zone': 'campus', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': 30, 'z': 0.5, 'yaw': 1.5708, 'lv': 0}}, quiet_events=True)
            js = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"
            last = -1; st = 0; t1 = time.time()
            while time.time() - t1 < 90:
                await pg.wait_for_timeout(1000); n = await pg.evaluate(js)
                if n == last: st += 1
                else: st = 0; last = n
                if st >= 4: break
            await L.close_panels(pg, cdp)
            await pg.evaluate("window.__ccHideBikes=%s" % ('true' if HIDE_BIKES else 'false'))
            rr = {}
            for vn, V in VIEWS:
                m = await pg.evaluate(MEASURE_JS + '(%s,%s)' % (J(V[:3]), J(V[3:])))
                await pg.screenshot(path=os.path.join(OUT, '%s_round%d.png' % (vn, r + 1)))
                print('  [第 %d 輪 %s] mesh %d、renderer.info calls %s、tris %s、群組 %d 個' % (r + 1, vn, last, m['tot']['calls'], m['tot']['tris'], m['nGroups']), flush=True)
                rr[vn] = m
            rounds.append(rr)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    if len(rounds) >= 2:
      for vn, _ in VIEWS:
        a, c = rounds[0][vn]['groups'], rounds[1][vn]['groups']
        print('== %s' % vn, flush=True)
        keys = set(a) | set(c)
        diff = sorted(keys, key=lambda k: -abs((c.get(k, {}).get('calls', 0)) - (a.get(k, {}).get('calls', 0))))
        print('INFO 兩輪 renderer.info：calls %s → %s、tris %s → %s' % (rounds[0][vn]['tot']['calls'], rounds[1][vn]['tot']['calls'], rounds[0][vn]['tot']['tris'], rounds[1][vn]['tot']['tris']), flush=True)
        print('INFO 兩輪估計 calls 差最多的 10 組：', flush=True)
        for k in diff[:10]:
            print('  %s：calls %s → %s、tris %s → %s、mesh %s → %s' % (k, a.get(k, {}).get('calls'), c.get(k, {}).get('calls'), a.get(k, {}).get('tris'), c.get(k, {}).get('tris'), a.get(k, {}).get('meshes'), c.get(k, {}).get('meshes')), flush=True)
        top = sorted(keys, key=lambda k: -max(a.get(k, {}).get('calls', 0), c.get(k, {}).get('calls', 0)))
        print('INFO 估計 calls 最多的 10 組（兩輪）：', flush=True)
        for k in top[:10]:
            print('  %s：calls %s／%s、tris %s／%s' % (k, a.get(k, {}).get('calls'), c.get(k, {}).get('calls'), a.get(k, {}).get('tris'), c.get(k, {}).get('tris')), flush=True)
    json.dump(rounds, open(os.path.join(OUT, 'park_glb_groups.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
