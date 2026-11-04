"""CC（帳號 A）11-04：公館效能原始數字（BB 03:34：GG_ext 重跑要 street_west、arcade 的 draw call／三角形／平均 FPS／最低 FPS，和上限的差距、對照組同一組數字；GLB 7.4→10.0 MB 載入多幾秒）。
  鏡頭和 tests/gongguan_glb_integration.py 的 VIEWS 完全相同（藏起路人量 draw call；FPS 量的時候路人放回去＝玩家實際看到的）。
  每一區：【前置／捷徑】讀檔到公館 17:30（條件事件關閉）→ 量「讀檔到正式模型 gongguan_shops_glb 出現（裡面有網格）」的秒數 →
  每個鏡頭：draw call／三角形（藏路人，和遊戲附的測試同一種量法）→ 路人放回去，用 requestAnimationFrame 量 8 秒：平均 FPS、最低 FPS（最長的一格）、1% low。
  另外一般網址、?nobldg 各一輪（上限＝?nobldg 的 1.3 倍，照遊戲附的測試）。只記錄數字，不判 PASS／FAIL（判定 BB）；只有載入失敗、JS 例外算 FAIL。
  11-04（WZ2_perf，BB 06:24）：加環境變數量別的區域，不給的時候和原本完全一樣（公館）：
    PERF_ZONE（預設 gongguan）、PERF_POS（JSON {x,z,yaw}，預設公館 (−30,14)）、PERF_HOUR（預設 17.5）、
    PERF_VIEWS（JSON {名字:[eye,look]}，給了就取代內建的鏡頭；VIEWS 沒給時全部量）、PERF_GLB（要等的正式模型節點名，預設 gongguan_shops_glb；溫州街 wenzhou_street_glb，src/zones3d.js:1143）。
    溫州街範例：PERF_ZONE=wenzhou；PERF_POS={"x":10,"z":0,"yaw":1.5708}；PERF_GLB=wenzhou_street_glb；
      PERF_VIEWS={"wz_east":[[2,1.7,1.5],[40,3.5,-3]],"wz_west":[[42,1.7,0.5],[-25,3.5,-1.5]]}
用法：LW_TESTS=<wt>/tests [VIEWS=street_west,arcade] [PERF_ZONE=… PERF_POS=… PERF_VIEWS=… PERF_GLB=…] python3 cc_gg_perf_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ALLV = {'street_west': ((-22, 1.7, 11), (-62, 4.5, 19)), 'from_gate': ((2, 1.7, -36), (-4, 7, 19)),
        'arcade': ((-18, 1.6, 20.6), (-34, 2.2, 20.6)), 'lane': ((-71, 1.7, 9), (-71, 5.5, 32))}
ZONE = (os.environ.get('PERF_ZONE') or 'gongguan').strip()
POS = json.loads(os.environ['PERF_POS']) if os.environ.get('PERF_POS') else {'x': -30, 'z': 14, 'yaw': 1.5708}
HOUR = float(os.environ.get('PERF_HOUR') or 17.5)
if os.environ.get('PERF_VIEWS'):
    ALLV = {k: (tuple(v[0]), tuple(v[1])) for k, v in json.loads(os.environ['PERF_VIEWS']).items()}
VSEL = [v for v in (os.environ.get('VIEWS') or ('street_west,arcade' if not os.environ.get('PERF_VIEWS') else ','.join(ALLV))).split(',') if v in ALLV]
GLB = (os.environ.get('PERF_GLB') or 'gongguan_shops_glb').strip()
ZNAME = {'gongguan': '公館', 'wenzhou': '溫州街'}.get(ZONE, ZONE)
# 量 GLB 下載的檔名：公館照原本；別的區域另外加那一區的關鍵字（溫州街 wenzhou、wz_）
RES_RE = 'gongguan|gg_|scooter|street|shop' if ZONE == 'gongguan' else 'gongguan|gg_|scooter|street|shop|wenzhou|wz_|' + ZONE
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
FPS = """(async ms=>{ const ts=[]; const t0=performance.now(); await new Promise(res=>{ const f=t=>{ ts.push(t); if(t-t0<ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  const d=[]; for(let i=1;i<ts.length;i++) d.push(ts[i]-ts[i-1]); const tot=ts[ts.length-1]-ts[0]; const s=[...d].sort((a,b)=>b-a); const n1=Math.max(1,Math.round(d.length*0.01));
  const ri=GAME.E.renderer.info.render;
  return {frames:d.length, avg:+(d.length/(tot/1000)).toFixed(2), min:+(1000/s[0]).toFixed(2), low1:+(1000/(s.slice(0,n1).reduce((a,b)=>a+b,0)/n1)).toFixed(2), calls_live:ri.calls, tris_live:ri.triangles}; })"""
MEM = """(()=>{ const E=GAME.E, mi=E.renderer.info.memory; const seen=new Set(); let px=0, big=null;
  E.scene.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms) for(const k in m){ const t=m[k]; if(t&&t.isTexture&&!seen.has(t)){ seen.add(t); const im=t.image||{}; const w=im.width||0, h=im.height||0; px+=w*h; if(!big||w*h>big.w*big.h) big={w,h,name:t.name||k}; } } });
  return {textures:mi.textures, geometries:mi.geometries, texCount:seen.size, texPixels:px, texMP:+(px/1e6).toFixed(2), biggest:big}; })()"""
VISLIST = """(()=>{ const E=GAME.E, cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
  const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; }; const out=[];
  E.scene.traverse(o=>{ if(!(o.isMesh||o.isSprite||o.isPoints||o.isLine)) return; if(!shown(o)) return; let inF=true; try{ if(o.geometry){ if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const bs=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld); inF=fr.intersectsSphere(bs); } }catch(e){}
    if(!inF&&o.frustumCulled!==false) return; const ms=Array.isArray(o.material)?o.material:[o.material]; out.push({n:o.name||'(無名)', p:(o.parent&&o.parent.name)||'', m:ms.map(m=>m&&m.name||'?').join('+'), inst:o.isInstancedMesh?o.count:0, fc:o.frustumCulled!==false}); });
  return out; })()"""
INFO_JS = "(()=>({hour:+GAME.G.hour.toFixed(3), npcs:(GAME.E.npcs||[]).length, npcsVisible:(GAME.E.npcs||[]).filter(n=>n.obj&&n.obj.parent).length}))()"
GLBREADY = "(()=>{ const z=GAME.E.zone; if(!z||!z.group) return false; const g=z.group.children.find(o=>o.name==='%s'); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })()" % GLB


async def one(p, formal):
    url = URL if formal else URL + ('&' if '?' in URL else '?') + 'nobldg'
    tag = '一般網址' if formal else '?nobldg'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    t0 = time.time(); await pg.goto(url); ok = await L.wait_loaded(pg); boot = time.time() - t0
    check('%s：遊戲載入' % tag, ok, '%.1f 秒' % boot)
    await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
    if ZONE == 'gongguan' and not os.environ.get('PERF_POS') and not os.environ.get('PERF_HOUR'):
        print('  [前置／捷徑] 讀檔到公館 17:30 (−30,14)，條件事件關閉', flush=True)
    else:
        print('  [前置／捷徑] 讀檔到%s %s 時 %s，條件事件關閉' % (ZNAME, HOUR, J(POS)), flush=True)
    t1 = time.time()
    await L.load_state(pg, {'zone': ZONE, 'hour': HOUR, 'pos': POS}, quiet_events=True)
    t_zone = time.time() - t1; t_glb = None
    if formal:
        for _ in range(480):
            if await pg.evaluate(GLBREADY): t_glb = time.time() - t1; break
            await pg.wait_for_timeout(250)
        check('%s：正式模型 %s 有載入' % (tag, GLB), t_glb is not None, J({'讀檔到區域建好_s': round(t_zone, 2), '讀檔到正式模型出現_s': t_glb and round(t_glb, 2)}))
    size = await pg.evaluate("""(()=>{ const r=performance.getEntriesByType('resource').filter(e=>/\\.(glb|gltf|bin|ktx2|webp|png|jpg)(\\?|$)/i.test(e.name)&&new RegExp(%s,'i').test(e.name)); return r.map(e=>({f:e.name.split('/').pop().split('?')[0], kb:Math.round((e.encodedBodySize||e.transferSize||e.decodedBodySize||0)/1024), ms:Math.round(e.duration)})); })()""" % J(RES_RE))
    mem = await pg.evaluate(MEM)
    print('  %s：讀檔→區域 %.2f 秒；讀檔→正式模型 %s 秒；GLB 下載 %s' % (tag, t_zone, t_glb and round(t_glb, 2), J(size)), flush=True)
    await pg.wait_for_timeout(4000)
    print('  %s：記憶體／貼圖 %s' % (tag, J(mem)), flush=True)
    res = {'boot_s': round(boot, 1), 'zone_s': round(t_zone, 2), 'glb_s': t_glb and round(t_glb, 2), 'glb_files': size, 'glb_kb_total': sum(x['kb'] for x in size), 'mem': mem, 'views': {}}
    for v in VSEL:
        e, l = ALLV[v]
        d = await pg.evaluate(DRAW + '(%s,%s)' % (J(list(e)), J(list(l))))
        await pg.wait_for_timeout(1500)
        f = await pg.evaluate(FPS + '(8000)')
        f.update(await pg.evaluate(INFO_JS))
        if os.environ.get('LIST') == '1':
            vl = await pg.evaluate(VISLIST)
            json.dump(vl, open(os.path.join(OUT, 'vis_%s_%s.json' % (v, 'formal' if formal else 'nobldg')), 'w', encoding='utf-8'), ensure_ascii=False)
            f['visCount'] = len(vl)
            print('  %s %s：畫面裡的 mesh %d 個（清單寫進 vis_*.json）' % (tag, v, len(vl)), flush=True)
        await pg.screenshot(path=os.path.join(OUT, 'perf_%s_%s.png' % (v, 'formal' if formal else 'nobldg')))
        res['views'][v] = dict(d, **f)
        print('  %s %s：draw call %s、三角形 %s（藏路人）；FPS 平均 %s、最低 %s、1%%low %s（%s 格；路人在：call %s／tris %s）；遊戲時間 %s、路人 %s（在場景 %s）' % (tag, v, d['calls'], d['tris'], f['avg'], f['min'], f['low1'], f['frames'], f['calls_live'], f['tris_live'], f.get('hour'), f.get('npcs'), f.get('npcsVisible')), flush=True)
    await pg.evaluate("GAME.E.endCinematic&&GAME.E.endCinematic()")
    check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
    await b.close()
    return res


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC %s效能原始數字；RUN=%s；SHA=%s；' % (ZNAME, os.environ.get('RUN', '-'), os.environ.get('SHA', '?')) + ('ZONE=%s；GLB=%s；' % (ZONE, GLB) if ZONE != 'gongguan' or GLB != 'gongguan_shops_glb' else '') + 'VIEWS=%s；Playwright（PC 有 GPU、有視窗），不是手機實機' % ','.join(VSEL), flush=True)
    async with async_playwright() as p:
        f = await one(p, True)
        n = await one(p, False)
    rows = {}
    for v in VSEL:
        fv, nv = f['views'][v], n['views'][v]; lim = round(1.3 * nv['calls'], 1)
        rows[v] = {'calls': fv['calls'], 'nobldg_calls': nv['calls'], 'limit_1.3x': lim, 'margin': round(lim - fv['calls'], 1), 'ratio': round(fv['calls'] / nv['calls'], 4),
                   'tris': fv['tris'], 'tris_limit': 420000, 'tris_margin': 420000 - fv['tris'], 'fps_avg': fv['avg'], 'fps_min': fv['min'], 'fps_low1': fv['low1'],
                   'nobldg_fps_avg': nv['avg'], 'nobldg_fps_min': nv['min']}
    for v in VSEL: rows[v].update({'fps_low1': f['views'][v]['low1']})
    rows['_mem'] = {'formal': f['mem'], 'nobldg': n['mem'], 'glb_kb_total': f['glb_kb_total'], 'glb_files': f['glb_files'], 'glb_s': f['glb_s']}
    summary = {'run': os.environ.get('RUN'), 'sha': os.environ.get('SHA'), 'zone': ZONE, 'glb': GLB, 'pos': POS, 'hour': HOUR, 'views_def': {k: ALLV[k] for k in VSEL}, 'formal': f, 'nobldg': n, 'table': rows}
    json.dump(summary, open(os.path.join(OUT, 'perf.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('表：' + J(rows), flush=True)
    print('GLB 載入：讀檔→正式模型 %s 秒；檔案 %s' % (f['glb_s'], J(f['glb_files'])), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
