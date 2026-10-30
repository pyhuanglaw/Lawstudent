"""街道道具的正式模型（第二個 AI：tools/blender/env_second/street_props.py → ASSETS 'prop.street'，開機預載）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
W3.lampPost／W3.bike（含 W3.bikeRack）／長椅 BENCH() 換成正式模型；約定（LAWWW 2026-10-10 16:45Z 的條件①）：
  1. 路燈：燈頭位置 (0, 3.95, 0.75) 不變——發光面中心在 (0, ~3.985, 0.8)、朝下；userData.lamp 是發光面網格（材質是套件原本的 MeshBasicMaterial）、userData.lightPos＝(0,3.9,0.75)。
  2. 腳踏車：沿 z 建模（車頭 +z）、外層 rotation.y＝π/2；兩輪在 z＝±0.47、輪心高 0.30；車架顏色照參數（頂點色）；停車架照舊能合併。
  3. 長椅：userData.seat.y＝0.45；寬約 1.35 m、深度在導航阻擋（1.4×0.7）裡；正面朝 +z。
  3b. ⑥（2026-10-11）花台 W3.planter、公告欄 W3.bulletin、販賣機 W3.vending：是正式模型、外框在程序化版本的範圍（導航阻擋）裡、著地；校園畫面上有它們的材質。
  4. 一般網址與 ?nobldg（關掉正式模型）的導航格、互動點、座位完全相同（校園、溫州街、公館）。
  5. 下載失敗（把 street_props.glb 的請求擋掉 30 秒）：照使用者 2026-10-17「不管怎麼樣都不能讓遊戲進入自動退化成醜的模型」（27e2fb48 ASSETS.ensure），
     不進遊戲、載入畫面寫「重新下載中」；網路恢復（不再擋）後自動重抓、進遊戲，用的是正式模型，導航格和其他模式相同、沒有 JS 例外。
     （2026-10-17 以前這一項檢查「照舊程序化」；規則改了，QA-HANDOFF-B1 改測試。）
  6. 記錄同一個鏡頭（藏起路人）的 draw call／三角形（校園：腳踏車、路燈最多的地方；資訊，不判定）。
[前置／捷徑]：用遊戲自己的讀檔把玩家放進區域（GAME.applySave），關掉條件事件；直接設鏡頭量 draw call。
用法：python3 tests/street_props_integration.py http://127.0.0.1:8765/index.html"""
import asyncio, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'street_props_integration')
WAIT_PROPS = "(async()=>{ for(let i=0;i<240;i++){ if(ASSETS.has('prop.street')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
CONTRACT = """(()=>{ const r=v=>Math.round(v*1000)/1000; const out={};
  const L=W3.lampPost(); L.updateMatrixWorld(true); const lens=L.userData.lamp; const lb=new THREE.Box3().setFromObject(lens); const lc=lb.getCenter(new THREE.Vector3());
  const n=new THREE.Vector3(); { const g=lens.geometry, p=g.attributes.position, ix=g.index; const A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(); const k=0; A.fromBufferAttribute(p,ix?ix.getX(k):k).applyMatrix4(lens.matrixWorld); B.fromBufferAttribute(p,ix?ix.getX(k+1):k+1).applyMatrix4(lens.matrixWorld); C.fromBufferAttribute(p,ix?ix.getX(k+2):k+2).applyMatrix4(lens.matrixWorld); n.copy(B.sub(A).cross(C.sub(A))).normalize(); }
  out.lamp={formal:L.userData.formal||null, lens:[r(lc.x),r(lc.y),r(lc.z)], lensNormalY:r(n.y), lensBasic:!!(lens.material&&lens.material.isMeshBasicMaterial), lensSide:lens.material.side, lightPos:L.userData.lightPos?[L.userData.lightPos.x,L.userData.lightPos.y,L.userData.lightPos.z]:null, h:r(new THREE.Box3().setFromObject(L).max.y)};
  const b=W3.bike('#d03030'); out.bike={formal:b.userData.formal||null, rotY:r(b.rotation.y)}; b.rotation.y=0; b.updateMatrixWorld(true); const bb=new THREE.Box3().setFromObject(b); out.bike.box=[r(bb.min.x),r(bb.max.x),r(bb.min.y),r(bb.max.y),r(bb.min.z),r(bb.max.z)];
  let frame=null, tires=[]; b.traverse(o=>{ if(!o.isMesh) return; if(o.material.name==='bike_frame') frame=o; if(o.material.name==='bike_dark'&&!tires.length) tires.push(o); });
  if(frame){ const c=frame.geometry.attributes.color; out.bike.frameColor=c?[r(c.getX(0)),r(c.getY(0)),r(c.getZ(0))]:null; out.bike.vertexColors=!!frame.material.vertexColors; }
  const want=new THREE.Color('#d03030'); out.bike.want=[r(want.r),r(want.g),r(want.b)];
  const b2=W3.bike('#3070d0'); let f2=null; b2.traverse(o=>{ if(o.isMesh&&o.material.name==='bike_frame') f2=o; }); out.bike.sharedMat=!!(frame&&f2&&frame.material===f2.material);
  const rack=W3.bikeRack(7); let rm=0; rack.traverse(o=>{ if(o.isMesh) rm++; }); out.rack={meshes:rm};
  if(W3.bikeAny){ const ks={}; let formal=0; for(let i=1;i<=60;i++){ const v=W3.bikeAny('#888888',i); const k=v.userData.bikeKind||'?'; ks[k]=(ks[k]||0)+1; if(v.userData.formal==='prop.street') formal++; } out.bikeAny={kinds:ks, n:Object.keys(ks).length, formal}; }   /* 腳踏車多款式（LAWWW2-B） */
  const z3=Z3; const be=(typeof ASSETS!=='undefined')?W3.formalBench():null; if(be){ be.updateMatrixWorld(true); const eb=new THREE.Box3().setFromObject(be); out.bench={formal:be.userData.formal||null, seatY:be.userData.seat&&be.userData.seat.y, box:[r(eb.min.x),r(eb.max.x),r(eb.min.y),r(eb.max.y),r(eb.min.z),r(eb.max.z)]}; } else out.bench=null;
  for(const [k,fn] of [['planter',()=>W3.planter()],['bulletin',()=>W3.bulletin()],['vending',()=>W3.vending()]]){ const o=fn(); o.updateMatrixWorld(true); const bx=new THREE.Box3().setFromObject(o);
    out[k]={formal:o.userData.formal||null, box:[r(bx.min.x),r(bx.max.x),r(bx.min.y),r(bx.max.y),r(bx.min.z),r(bx.max.z)]}; }
  return out; })()"""
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h]; })()"
STATE = """(()=>{ const E=GAME.E, z=E.zone; const r=v=>Math.round(v*100)/100; const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
  const seats=(z.seats||[]).map(s=>[r(s.x),r(s.z),r(s.yaw||0)]).sort(); const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.visible){ const ms=Array.isArray(o.material)?o.material:[o.material]; for(const m of ms) if(m&&m.name) mats[m.name]=(mats[m.name]||0)+1; } });
  return {it, seats, formalMats:['lamp_paint','bike_frame','bike_dark','bench_wood','bench_iron'].filter(k=>mats[k]).length, props6:['planter_conc','board_cork','vend_body'].filter(k=>mats[k])}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); E.endCinematic(); return out; })"""
ZONES = [('campus', {'x': -40, 'z': -5, 'yaw': -1.5708}, [('avenue', [-40, 1.7, 2], [-70, 1.2, -6]), ('racks', [0, 2.0, 20], [20, 0.8, 24])]),
         ('wenzhou', {'x': 30, 'z': -1, 'yaw': -1.5708}, [('park', [25, 1.7, 1], [26, 0.8, 8])]),
         ('gongguan', {'x': -40, 'z': 10, 'yaw': 0}, [('street', [-40, 1.7, 8], [-10, 1.2, 14])])]


async def run_mode(p, run, mode):
    url = URL + ('?nobldg' if mode == 'nobldg' else '')
    b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
    import time; t0 = time.time()
    if mode == 'broken':
        blocked = {'n': 0}
        async def deny(route): blocked['n'] += 1; await route.abort()
        await pg.route('**/street_props.glb*', deny)
        await pg.goto(url); await pg.wait_for_timeout(30000)
        st = await pg.evaluate("({hidden:document.getElementById('loading').classList.contains('hide'), msg:(document.getElementById('loadMsg')||{}).textContent||'', err:ASSETS.lastErr||''})")
        run.check('broken：擋掉 30 秒——還在載入畫面（不退化成程序化道具進遊戲）、畫面寫「重新下載中」、重抓了不只一次', not st['hidden'] and '重新下載中' in st['msg'] and blocked['n'] >= 2, json.dumps(dict(st, blocked=blocked['n']), ensure_ascii=False))
        await pg.unroute('**/street_props.glb*')
    else:
        await pg.goto(url)
    ok = await PL.wait_loaded(pg); run.check(f'{mode}：遊戲載入' + ('（網路恢復後自動重抓）' if mode == 'broken' else ''), ok)
    if mode == 'broken': run.check('broken：網路恢復後用的是正式模型（prop.street 已載入）', await pg.evaluate("!!(ASSETS.getRaw&&ASSETS.getRaw('prop.street'))"))
    run.note(f'{mode}：從開網頁到載入完成 {time.time() - t0:.1f} 秒（SwiftShader 模擬，只能相對比較）')
    res = {'errs': errs}
    if mode == 'formal':
        run.check('正式模型 prop.street 載入（開機預載）', await pg.evaluate(WAIT_PROPS))
        c = await pg.evaluate(CONTRACT); res['contract'] = c
        L, B, E = c['lamp'], c['bike'], c['bench']
        run.check('路燈：是正式模型', L['formal'] == 'prop.street', json.dumps(L))
        run.check('路燈：發光面中心在 (0, 3.985±0.02, 0.8±0.02)（燈頭位置不變）', abs(L['lens'][0]) < 0.02 and abs(L['lens'][1] - 3.985) < 0.02 and abs(L['lens'][2] - 0.8) < 0.02, json.dumps(L['lens']))
        run.check('路燈：發光面朝下、材質是套件原本的發光材質（MeshBasicMaterial）', L['lensNormalY'] < -0.9 and L['lensBasic'], json.dumps(L))
        run.check('路燈：userData.lightPos＝(0, 3.9, 0.75)', L['lightPos'] == [0, 3.9, 0.75], json.dumps(L['lightPos']))
        run.check('腳踏車：是正式模型、外層 rotation.y＝π/2', B['formal'] == 'prop.street' and abs(B['rotY'] - math.pi / 2) < 0.001, json.dumps(B))
        bx = B['box']
        run.check('腳踏車：沿 z 建模（長在 z、寬在 x）、輪子著地、兩輪在 z＝±0.47（車長約 ±0.8）', bx[1] - bx[0] < 0.7 and bx[5] - bx[4] > 1.5 and abs(bx[2]) < 0.03 and 0.7 < bx[5] < 0.9 and -0.9 < bx[4] < -0.7, json.dumps(bx))
        run.check('腳踏車：車架顏色照參數（頂點色）、所有顏色共用一個材質（停車架可以合併）', B.get('vertexColors') and B.get('frameColor') and all(abs(a - b_) < 0.02 for a, b_ in zip(B['frameColor'], B['want'])) and B['sharedMat'], json.dumps(B))
        run.check('停車架：整排合併（網格數少，不是每台各自一組）', 0 < c['rack']['meshes'] <= 12, json.dumps(c['rack']))
        if c.get('bikeAny'):
            ks = c['bikeAny']['kinds']; city = sum(v for k, v in ks.items() if k.startswith('bike_city') and k != 'bike_city_child')   # 淑女車四款（鐵絲籃、有東西、沒籃子、塑膠籃）合計，ART-BIKES2-F
            run.check('腳踏車多款式：停車架、路邊的車照比例混搭（60 台裡至少 5 款、淑女車（四款合計）最多、淑女車至少 3 款、全部是正式模型）', c['bikeAny']['n'] >= 5 and c['bikeAny']['formal'] == 60 and city > max([v for k, v in ks.items() if not k.startswith('bike_city') or k == 'bike_city_child'] or [0]) and sum(1 for k in ks if k.startswith('bike_city') and k != 'bike_city_child') >= 3, json.dumps(c['bikeAny']))
        run.check('長椅：是正式模型、userData.seat.y＝0.45', E and E['formal'] == 'prop.street' and E['seatY'] == 0.45, json.dumps(E))
        eb = E['box'] if E else [0] * 6
        run.check('長椅：寬約 1.35 m、深度在導航阻擋（±0.35）裡、著地', E and 1.3 < eb[1] - eb[0] < 1.42 and eb[4] > -0.36 and eb[5] < 0.36 and abs(eb[2]) < 0.03, json.dumps(eb))
        P6 = {k: c[k] for k in ('planter', 'bulletin', 'vending')}
        run.check('⑥花台、公告欄、販賣機：是正式模型', all(v['formal'] == 'prop.street' for v in P6.values()), json.dumps(P6))
        pb, bb_, vb = P6['planter']['box'], P6['bulletin']['box'], P6['vending']['box']
        run.check('⑥花台：在導航阻擋（1.2×0.5）裡、著地（葉子可以稍微超出）', -0.66 <= pb[0] and pb[1] <= 0.66 and -0.3 <= pb[4] and pb[5] <= 0.3 and abs(pb[2]) < 0.03, json.dumps(pb))
        run.check('⑥公告欄：柱子、板子在 x ±1.25 內、著地、正面朝 +z（雨遮在 2.3 m 以上可以往前伸）', -1.35 <= bb_[0] and bb_[1] <= 1.35 and abs(bb_[2]) < 0.03 and 2.3 < bb_[3] < 2.7, json.dumps(bb_))
        run.check('⑥販賣機：1.1×1.9×0.8 的範圍裡（導航阻擋 0.9×1.2 轉 90°）、著地', -0.56 <= vb[0] and vb[1] <= 0.56 and abs(vb[2]) < 0.03 and 1.85 < vb[3] < 1.95 and -0.41 <= vb[4] and vb[5] <= 0.43, json.dumps(vb))
    res['zones'] = {}
    for zid, pos, views in ZONES:
        run.setup(f'{mode}：讀檔到 {zid} ({pos["x"]},{pos["z"]}) 11:00，關掉條件事件')
        await PL.load_state(pg, {'zone': zid, 'hour': 11, 'pos': pos}, quiet_events=True)
        await pg.wait_for_timeout(2500)
        st = await pg.evaluate(STATE); st['nav'] = await pg.evaluate(NAV_HASH); st['draw'] = {}
        for name, e, l in views: st['draw'][name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))
        res['zones'][zid] = st
        await run.shot(pg, f'{zid}_{mode}')
    run.check(f'{mode}：沒有 JS 例外', not errs, '; '.join(errs[:3]))
    await b.close(); return res


async def main():
    run = PL.Run('street_props_integration', OUT); R = {}
    async with async_playwright() as p:
        for mode in ('formal', 'nobldg', 'broken'): R[mode] = await run_mode(p, run, mode)
    for zid, _, _ in ZONES:
        f, n, k = R['formal']['zones'][zid], R['nobldg']['zones'][zid], R['broken']['zones'][zid]
        if zid == 'campus' and f['nav'] != n['nav']:   # 共同教學館有正式模型時，前面 4 棵大道樹換成模型裡的蒲葵（zones3d.js gtGLB、GT_PALMS）：導航格本來就不同，記下來不判定
            run.note(f'campus：導航格 正式模型≠?nobldg（共同教學館正式模型的蒲葵取代 4 棵大道樹，設計如此）{json.dumps([f["nav"], n["nav"]])}')
        else:
            run.check(f'{zid}：導航格，正式模型＝?nobldg', f['nav'] == n['nav'], json.dumps([f['nav'], n['nav']]))
        dif = lambda a, b: [x for x in a if x not in b][:8]   # 哪幾個不一樣（QA-HANDOFF-B1：校園 41／37、25／21，查是哪幾個）
        D = {'n': [len(f['it']), len(n['it']), len(f['seats']), len(n['seats'])], 'itOnlyFormal': dif(f['it'], n['it']), 'itOnlyNobldg': dif(n['it'], f['it']), 'seatOnlyFormal': dif(f['seats'], n['seats']), 'seatOnlyNobldg': dif(n['seats'], f['seats'])}
        soc = lambda x: (isinstance(x[0], str) and '社科院' in x[0]) or (not isinstance(x[0], str) and 95 <= x[0] <= 126 and -76 <= x[1] <= -55)   # 社科院正式配置（SOCX：中庭長椅、圖書館入口；程序化版本是舊的 CK.modern）
        other = [x for k in ('itOnlyFormal', 'itOnlyNobldg', 'seatOnlyFormal', 'seatOnlyNobldg') for x in D[k] if not soc(x)]
        if zid == 'campus' and not other and (f['it'] != n['it'] or f['seats'] != n['seats']):
            run.note(f'campus：互動點、座位 正式模型≠?nobldg 只差社科院正式配置（中庭長椅、圖書館入口；設計如此）{json.dumps(D, ensure_ascii=False)}')
        else:
            run.check(f'{zid}：互動點、座位，正式模型＝?nobldg', f['it'] == n['it'] and f['seats'] == n['seats'], json.dumps(D, ensure_ascii=False))
        run.check(f'{zid}：下載失敗、網路恢復後＝正式模型（導航格、互動點、座位都一樣：玩家拿到的永遠是正式版）', f['nav'] == k['nav'] and f['it'] == k['it'] and f['seats'] == k['seats'], json.dumps([f['nav'], k['nav']]))
        run.check(f'{zid}：正式模型的材質出現在畫面上（下載失敗、網路恢復後也是）；?nobldg 沒有（照舊程序化）', f['formalMats'] > 0 and n['formalMats'] == 0 and k['formalMats'] > 0, json.dumps([f['formalMats'], n['formalMats'], k['formalMats']]))
        if zid == 'campus':
            run.check('campus：⑥花台、公告欄、販賣機的正式模型在畫面上（法學院廣場、椰影大道的花台；下載失敗後恢復也是）；?nobldg 沒有', sorted(f['props6']) == ['board_cork', 'planter_conc', 'vend_body'] and not n['props6'] and sorted(k['props6']) == sorted(f['props6']), json.dumps([f['props6'], n['props6'], k['props6']]))
        run.note(f'{zid}：同一個鏡頭（藏起路人）的 draw call／三角形，正式 {json.dumps(f["draw"])}｜?nobldg {json.dumps(n["draw"])}')
    sys.exit(run.finish())


asyncio.run(main())
