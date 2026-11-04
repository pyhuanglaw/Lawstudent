"""CC（帳號 A）11-04：XS_view——新生南路側門往圍牆後面（校園那一側）看（LAWWW2 XS-CAMPUS-BACK-1104，開發分支 a65f9ae0f／23eaaa7ae）。
  座標（23eaaa7ae）：側門 src/data/xinsheng_layout.js sideGate (18.4, 10)、門洞 z 6.8～13.2（campusWall.gateGap）、門柱 x 17.9～18.9；
  src/xinsheng3d.js 的 xs_campus_back：草地 PlaneGeometry 140×170（中心 x 88.75、z 0）；樹林 xs_campus_trees（x 21.9～80、z −80～4，加圍牆內側矮樹、南邊草地零星大樹）；
  洞洞館（農業陳列館）校園 (−104,−30) → 這裡 (38.4, 64)、校史館校園 (−77,−29) → (65.4, 65)（位移 OX=CW.x+124=142.4、OZ=SG.z+84=94）；正式模型節點 xs_campus_pavilion_glb、xs_campus_hist_glb，套件備用 userData.xsBack。
  鏡頭：站在門洞裡、門柱東邊 (19.0, 1.7, 9.0)，看方位 32°（x 往東、z 往南；洞洞館約 71°、校史館約 51°、樹林南緣東段約 −7°），橫向畫面水平視角約 85°。
  流程：【前置／捷徑】讀檔到新生南路側門 14:00（條件事件關閉）→ 等正式模型 → 藏玩家 → E.cinematic → 截圖 xs_view_day.png → 四樣背景物件在 frustum 裡嗎（INFO）→
        draw call／三角形（藏路人）→ 路人放回去量 8 秒 FPS；再讀檔到 20:00 做一次（xs_view_night.png）。數字寫進 perf.json。
  PERF_ONLY=1：不截圖、不做 frustum（給對照組 555b9e0cb：那一版還沒有圍牆後面的校園）。
  只記錄數字，不判 PASS／FAIL（判定 BB）；只有載入失敗、JS 例外算 FAIL。
用法：LW_TESTS=<wt>/tests [PERF_ONLY=1] [EYE=x,y,z] [LOOK=x,y,z] python3 cc_xs_view_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
PERF_ONLY = os.environ.get('PERF_ONLY') == '1'
vec = lambda s, d: [float(x) for x in s.split(',')] if s else d
EYE = vec(os.environ.get('EYE'), [19.0, 1.7, 9.0])
LOOK = vec(os.environ.get('LOOK'), [19.0 + 40 * 0.848, 3.0, 9.0 + 40 * 0.530])   # 方位 32°、40 m 外、高 3 m
SPAWN = {'x': 14.3, 'z': 10.0, 'yaw': -1.5708}   # xinsheng_layout.js sideGate.spawn
GLBS = ['xinsheng_street_glb', 'xs_campus_pavilion_glb', 'xs_campus_hist_glb']
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


def info(name, txt):
    print('INFO ' + name + '  ' + txt, flush=True)


DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
FPS = """(async ms=>{ const ts=[]; const t0=performance.now(); await new Promise(res=>{ const f=t=>{ ts.push(t); if(t-t0<ms) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
  const d=[]; for(let i=1;i<ts.length;i++) d.push(ts[i]-ts[i-1]); const tot=ts[ts.length-1]-ts[0]; const s=[...d].sort((a,b)=>b-a); const n1=Math.max(1,Math.round(d.length*0.01));
  const ri=GAME.E.renderer.info.render;
  return {frames:d.length, avg:+(d.length/(tot/1000)).toFixed(2), min:+(1000/s[0]).toFixed(2), low1:+(1000/(s.slice(0,n1).reduce((a,b)=>a+b,0)/n1)).toFixed(2), calls_live:ri.calls, tris_live:ri.triangles}; })"""
HAS = "(n=>{ const z=GAME.E.zone; if(!z||!z.group) return false; const g=z.group.getObjectByName(n); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })"
AIM = """(async(e,l)=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return {pos:E.camera.position.toArray().map(v=>+v.toFixed(2)), fov:E.camera.fov, aspect:+E.camera.aspect.toFixed(3), far:E.camera.far}; })"""
HUD = """(on=>{ const c=GAME.E.renderer.domElement; const keep=new Set(); for(let n=c;n;n=n.parentElement) keep.add(n);
  document.querySelectorAll('body *').forEach(el=>{ if(keep.has(el)||c.contains(el)) return; if(el.parentElement&&keep.has(el.parentElement)){ if(on){ if(el.dataset.ccVis!==undefined){ el.style.visibility=el.dataset.ccVis; delete el.dataset.ccVis; } } else { el.dataset.ccVis=el.style.visibility||''; el.style.visibility='hidden'; } } }); })"""
FRUST = """(()=>{ const E=GAME.E, z=E.zone, g=z&&z.group; if(!g) return {err:'no zone'};
  E.camera.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(E.camera.projectionMatrix,E.camera.matrixWorldInverse));
  const shown=o=>{ for(let n=o;n;n=n.parent) if(!n.visible) return false; return true; };
  const back=g.getObjectByName('xs_campus_back');
  const pick={ lawn:back?back.children.filter(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters&&o.geometry.parameters.width>=100):[],
    trees:back?back.children.filter(o=>o.name==='xs_campus_trees'):[],
    pavilion:[g.getObjectByName('xs_campus_pavilion_glb')].concat(g.children.filter(o=>o.userData&&o.userData.xsBack==='pavilion')).filter(Boolean),
    hist:[g.getObjectByName('xs_campus_hist_glb')].concat(g.children.filter(o=>o.userData&&o.userData.xsBack==='hist')).filter(Boolean) };
  const out={camera:{pos:E.camera.position.toArray().map(v=>+v.toFixed(2)),fov:E.camera.fov,aspect:+E.camera.aspect.toFixed(3)}, xs_campus_back:!!back};
  for(const k in pick){ const roots=pick[k]; const meshes=[]; for(const r of roots) r.traverse(o=>{ if((o.isMesh||o.isInstancedMesh)&&shown(o)) meshes.push(o); });
    const src=roots.map(r=>r.name||('kit:'+(r.userData.xsBack||''))+(shown(r)?'':'(hidden)'));
    if(!meshes.length){ out[k]={found:roots.length>0, roots:src, visible_meshes:0, in_frustum:false}; continue; }
    const box=new THREE.Box3(); for(const m of meshes) box.expandByObject(m);
    const c=box.getCenter(new THREE.Vector3()), ndc=c.clone().project(E.camera), sz=box.getSize(new THREE.Vector3());
    let inside=0; for(const m of meshes){ const b=new THREE.Box3().setFromObject(m); if(fr.intersectsBox(b)) inside++; }
    out[k]={found:true, roots:src, visible_meshes:meshes.length, meshes_in_frustum:inside, in_frustum:fr.intersectsBox(box), center:c.toArray().map(v=>+v.toFixed(1)), size:sz.toArray().map(v=>+v.toFixed(1)),
      dist:+c.distanceTo(E.camera.position).toFixed(1), center_ndc:[+ndc.x.toFixed(2),+ndc.y.toFixed(2)], center_on_screen:Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z<1}; }
  return out; })()"""


async def run_time(pg, hour, tag):
    print('  [前置／捷徑] 讀檔到新生南路側門 %s (%.1f, %.1f)，條件事件關閉' % (tag, SPAWN['x'], SPAWN['z']), flush=True)
    t1 = time.time()
    await L.load_state(pg, {'zone': 'xinsheng', 'hour': hour, 'pos': SPAWN}, quiet_events=True)
    zone = await pg.evaluate("GAME.E.zone&&GAME.E.zone.group&&GAME.E.zone.group.name")
    check('%s：進到新生南路區域' % tag, zone == 'xinsheng_zone', 'zone.group=%s' % zone)
    ready = {}
    for _ in range(240):
        for n in GLBS:
            if n not in ready and await pg.evaluate(HAS + '(%s)' % J(n)): ready[n] = round(time.time() - t1, 2)
        if len(ready) == len(GLBS): break
        await pg.wait_for_timeout(250)
    info('%s：正式模型（讀檔後幾秒出現）' % tag, J({n: ready.get(n) for n in GLBS}))
    await pg.wait_for_timeout(3000)
    res = {'hour': hour, 'glb_ready_s': {n: ready.get(n) for n in GLBS}}
    cam = await pg.evaluate(AIM + '(%s,%s)' % (J(EYE), J(LOOK)))
    res['camera'] = cam
    if not PERF_ONLY:
        await pg.evaluate(HUD + '(false)')
        await pg.wait_for_timeout(600)
        fn = 'xs_view_%s.png' % ('day' if hour < 18 else 'night')
        await pg.screenshot(path=os.path.join(OUT, fn))
        await pg.evaluate(HUD + '(true)')
        fr = await pg.evaluate(FRUST)
        res['frustum'] = fr
        for k in ('lawn', 'trees', 'pavilion', 'hist'):
            v = fr.get(k) or {}
            info('%s：%s 在鏡頭裡' % (tag, k), J({'in_frustum': v.get('in_frustum'), 'center_on_screen': v.get('center_on_screen'), 'roots': v.get('roots'), 'meshes': v.get('visible_meshes'),
                                               'center': v.get('center'), 'ndc': v.get('center_ndc'), 'dist': v.get('dist')}))
        print('  截圖 %s；鏡頭 %s' % (fn, J(cam)), flush=True)
    d = await pg.evaluate(DRAW + '(%s,%s)' % (J(EYE), J(LOOK)))
    await pg.wait_for_timeout(1500)
    f = await pg.evaluate(FPS + '(8000)')
    res['perf'] = dict(d, **f)
    print('  %s：draw call %s、三角形 %s（藏路人）；FPS 平均 %s、最低 %s、1%%low %s（%s 格；路人在：call %s／tris %s）' % (tag, d['calls'], d['tris'], f['avg'], f['min'], f['low1'], f['frames'], f['calls_live'], f['tris_live']), flush=True)
    await pg.evaluate("(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()")
    return res


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC XS_view 新生南路側門往校園看；SHA=%s；PERF_ONLY=%s；EYE=%s LOOK=%s；Playwright（PC 有 GPU、有視窗），不是手機實機' % (os.environ.get('SHA', '?'), PERF_ONLY, J(EYE), J([round(v, 2) for v in LOOK])), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); boot = time.time() - t0
        check('遊戲載入', ok, '%.1f 秒' % boot)
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        day = await run_time(pg, 14.0, '白天 14:00')
        night = await run_time(pg, 20.0, '晚上 20:00')
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    summary = {'sha': os.environ.get('SHA'), 'perf_only': PERF_ONLY, 'boot_s': round(boot, 1), 'eye': EYE, 'look': LOOK, 'day': day, 'night': night,
               'table': {k: {kk: v['perf'][kk] for kk in ('calls', 'tris', 'avg', 'min', 'low1', 'calls_live', 'tris_live')} for k, v in (('day', day), ('night', night))}}
    json.dump(summary, open(os.path.join(OUT, 'perf.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('表：' + J(summary['table']), flush=True)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
