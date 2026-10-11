"""行道樹的正式模型（第二個 AI ⑦：Blender GLB prop.trees＝tools/blender/env_second/street_trees.py）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  TK.tree／TK.royalPalm 在正式模型載入後回傳「樹的位置記號」，區域建好後 TreeField 把整區的樹改成 InstancedMesh：
  鏡頭附近（42 m 內）畫模型（樟樹兩款、榕樹、大王椰子；會投影），遠的畫一片面向鏡頭的卡片，畫面外的不畫。

兩輪：「正式」（一般網址）和「改之前」（擋掉 street_trees.glb 的下載＝載入失敗的備用：程序化的樹；其他正式模型照舊），各跑校園、公館、溫州街：
  1. 正式：每個區域登記一個 TreeField、讀到的樹＝建區域時 TK.tree／TK.royalPalm 的呼叫次數；記號都拿掉了（區域裡沒有記號網格）。
  2. 正式：樹皮有樹幹透視（userData.seeThrough、已經 patch）；葉片材質有改法線（treeLeaf）；近的模型會投影、卡片不投影。
  3. 正式：近的模型都在鏡頭 46 m 內；遠的卡片 ≥ 1；鏡頭轉 180° 時畫的樹不一樣（畫面外的真的不畫）。
  4. 兩輪的導航格、鏡頭碰撞方塊、互動點完全相同（樹的導航阻擋是呼叫端加的，不受影響）。
  5. 效能（同一個鏡頭、藏起路人、含陰影那一輪）：draw call ≤ 改之前 ×1.1、三角形 ≤ 改之前。
  6. 換區域（校園 → 公館 → 校園）：每次都重新登記、上一個區域的樹拿掉。
  7. ?nobldg：沒有 TreeField，照舊是程序化的樹。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到各區域（GAME.applySave），關掉條件事件；直接設鏡頭位置量 draw call、截圖。
用法：python3 tests/street_trees_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'street_trees_integration')
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
# 建區域時數 TK.tree／TK.royalPalm 的呼叫次數（每次讀檔前歸零）
COUNT_HOOK = """(()=>{ if(window.__treeCalls) return; window.__treeCalls={n:0}; for(const fn of ['tree','royalPalm']){ const o=TK[fn]; TK[fn]=function(){ window.__treeCalls.n++; return o.apply(this,arguments); }; } })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人、騎腳踏車的路人每次的位置不同（量測雜訊）：量的時候暫時移出場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles, st:TK.treeStats()}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
INFO = """(()=>{ const E=GAME.E, z=E.zone; const st=TK.treeStats(); let seeds=0, kitLeaf=0, field=null; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.treeSeed) seeds++; if(o.name==='street_trees_field') field=o; });
    const ims={}; if(field) field.children.forEach(m=>{ ims[m.name]={count:m.count, cap:m.instanceMatrix.count, cast:m.castShadow, st:!!(m.material.userData&&m.material.userData.seeThrough&&m.material.userData._st), leaf:!!(m.material.userData&&m.material.userData.treeLeaf)}; });
    const inScene=[]; E.scene.traverse(o=>{ if(o.name==='street_trees_field') inScene.push(o.parent===z.group); });
    return {st, seeds, field:!!field, ims, inScene, calls:window.__treeCalls?window.__treeCalls.n:-1, extras:(E.extras||[]).filter(x=>x.obj&&x.obj.name==='treeFieldExtra').length}; })()"""
# 近的模型離鏡頭多遠（每一棵畫模型的樹）
NEAR_DIST = """(()=>{ const E=GAME.E, c=E.camera.position; const f=E.zone.group.children.find(o=>o.name==='street_trees_field'); if(!f) return null; let mx=0, n=0; const m=new THREE.Matrix4(), p=new THREE.Vector3();
    f.children.forEach(im=>{ if(!/_bark$/.test(im.name)) return; for(let i=0;i<im.count;i++){ im.getMatrixAt(i,m); p.setFromMatrixPosition(m); mx=Math.max(mx,Math.hypot(p.x-c.x,p.z-c.z)); n++; } }); return {n, max:+mx.toFixed(1)}; })()"""
ZONES = {
    'campus': {'pos': {'x': -100, 'z': 4, 'yaw': 1.5708}, 'views': [
        ('gate_avenue', (-110, 1.7, 0.5), (100, 8, 0)),       # 進校門往東看椰林大道（大王椰子＋兩側的大樹）
        ('avenue_row', (-62, 1.7, 13.5), (-20, 6, 18)),       # 大道南側的人行道，沿著樹列往東
        ('small_palms', (30, 1.7, -6), (30, 6, -60)),         # 小椰林道（大王椰子，樹冠比例大）
        ('black_forest', (70, 1.7, -56), (72, 5, -72))]},     # 黑森林（榕樹）
    'gongguan': {'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}, 'views': [
        ('from_gate', (2, 1.7, -36), (-4, 7, 19)),            # 校門口往南看過羅斯福路
        ('to_campus', (0, 1.7, -40), (0, 6, -120))]},         # 從公館往校園看（校門後面的椰林大道）
    'wenzhou': {'pos': {'x': 26, 'z': 2, 'yaw': 0}, 'views': [
        ('park', (26, 1.7, 1.5), (26, 5, 13)),                # 小公園中間的大樹（榕樹）
        ('street', (38, 1.7, -2), (49, 4, 12))]},             # 巷子裡的行道樹
}


async def zone_pass(pg, run, formal, zid):
    Z = ZONES[zid]; tag = '正式' if formal else '改之前'
    await pg.evaluate("window.__treeCalls&&(window.__treeCalls.n=0)")
    await PL.load_state(pg, {'zone': zid, 'hour': 17.5, 'pos': Z['pos']}, quiet_events=True)
    await pg.evaluate(SETTLED); await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")   # 凍結遊戲時鐘（17:30 是路燈開關的時刻）
    await pg.evaluate("(async()=>{ const f0=GAME.E.frame; for(let i=0;i<240&&GAME.E.frame<f0+8;i++) await new Promise(r=>setTimeout(r,250)); })()")
    info = await pg.evaluate(INFO)
    if formal:
        st = info['st'] or {}
        run.check('%s／%s：登記一個 TreeField、讀到的樹＝TK.tree／TK.royalPalm 的呼叫次數（%s 棵）' % (tag, zid, info['calls']),
                  bool(st) and st.get('ready') and st.get('trees') == info['calls'] and info['extras'] == 1, json.dumps({'st': st, 'calls': info['calls'], 'extras': info['extras']}))
        run.check('%s／%s：樹的位置記號都拿掉了（區域裡沒有記號網格）' % (tag, zid), info['seeds'] == 0 and info['field'] and info['inScene'] == [True], json.dumps({'seeds': info['seeds'], 'inScene': info['inScene']}))
        ims = info['ims']
        run.check('%s／%s：樹皮有樹幹透視、葉片材質改過法線；近的模型會投影、遠景卡片不投影' % (tag, zid),
                  all(v['st'] for k, v in ims.items() if k.endswith('_bark')) and all(v['leaf'] for k, v in ims.items() if k.endswith('_leaf'))
                  and all(v['cast'] for k, v in ims.items() if not k.endswith('cards')) and not ims.get('trees_cards', {}).get('cast', True), json.dumps(ims))
    else:
        run.check('%s／%s：沒有 TreeField（照舊是程序化的樹）' % (tag, zid), info['st'] is None and not info['field'] and info['calls'] > 0, json.dumps({'st': info['st'], 'calls': info['calls']}))
    nav = await pg.evaluate(NAV_HASH); state = await pg.evaluate(STATE)
    draws = {}
    for name, e, l in Z['views']:
        d = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))
        draws[name] = {'calls': d['calls'], 'tris': d['tris']}
        if formal:
            nd = await pg.evaluate(NEAR_DIST); st = d['st'] or {}
            draws[name]['near'] = sum((st.get('near') or {}).values()); draws[name]['cards'] = st.get('cards', 0)
            run.check('%s／%s／%s：近的模型都在鏡頭 46 m 內（%s 棵）' % (tag, zid, name, nd and nd['n']), bool(nd) and nd['max'] <= 46.01, json.dumps(nd))
        await run.shot(pg, '%s_%s_%s' % (zid, name, 'formal' if formal else 'before'))
    if formal and zid == 'campus':   # 鏡頭轉 180°：畫的樹不一樣（畫面外的不畫）
        e, l = Z['views'][0][1], Z['views'][0][2]
        a = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps(l)))
        b_ = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(e), json.dumps([2 * e[0] - l[0], l[1], 2 * e[2] - l[2]])))
        sa, sb = a['st'] or {}, b_['st'] or {}
        run.check('正式／campus：鏡頭轉 180° 畫的樹不一樣（畫面外的真的不畫；遠景卡片 ≥ 1）', sa.get('cards', 0) >= 1 and (sa.get('cards'), sa.get('near')) != (sb.get('cards'), sb.get('near')) and sa.get('cards', 0) + sum((sa.get('near') or {}).values()) < sa.get('trees', 0),
                  json.dumps({'front': {k: sa.get(k) for k in ('near', 'cards', 'trees')}, 'back': {k: sb.get(k) for k in ('near', 'cards')}}))
    return nav, state, draws, info['st']


async def main():
    run = PL.Run('street_trees_integration', OUT)
    res = {}
    async with async_playwright() as p:
        for formal in (True, False):
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            if not formal: await pg.route('**/street_trees.glb', lambda route: route.abort())
            await pg.goto(URL); run.check(('正式' if formal else '改之前（擋掉 street_trees.glb）') + '：遊戲載入', await PL.wait_loaded(pg))
            await pg.evaluate(COUNT_HOOK)
            res[formal] = {}
            for zid in ZONES: res[formal][zid] = await zone_pass(pg, run, formal, zid)
            if formal:   # 換區域：校園 → 公館 → 校園（上一個區域的樹拿掉、每次重新登記）
                await pg.evaluate("window.__treeCalls.n=0"); await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': ZONES['campus']['pos']}, quiet_events=True); await pg.wait_for_timeout(1500)
                again = await pg.evaluate(INFO)
                run.check('正式：換區域（校園 → 公館 → 溫州街 → 校園）後照樣只有一個 TreeField、樹的數目一樣、只在目前的區域裡',
                          bool(again['st']) and again['st'].get('trees') == (res[True]['campus'][3] or {}).get('trees') and again['extras'] == 1 and again['inScene'] == [True] and again['st'].get('trees') == again['calls'],
                          json.dumps({k: again[k] for k in ('st', 'extras', 'inScene', 'calls')}))
            run.check(('正式' if formal else '改之前') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
        # ?nobldg：程序化的樹
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'nobldg'); await PL.wait_loaded(pg)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': ZONES['campus']['pos']}, quiet_events=True); await pg.wait_for_timeout(1500)
        nb = await pg.evaluate("(()=>({st:TK.treeStats(), manifest:!!ASSETS.manifest['prop.trees']}))()")
        run.check('?nobldg：沒有 TreeField、manifest 裡沒有 prop.trees（照舊是程序化的樹）', nb['st'] is None and not nb['manifest'], json.dumps(nb))
        await b.close()
    for zid in ZONES:
        f, n = res[True][zid], res[False][zid]
        run.check('%s：導航格兩輪完全相同' % zid, f[0] == n[0], json.dumps([f[0], n[0]]))
        run.check('%s：鏡頭碰撞方塊、互動點兩輪完全相同' % zid, f[1] == n[1], '%d/%d vs %d/%d 個' % (len(f[1]['col']), len(f[1]['it']), len(n[1]['col']), len(n[1]['it'])))
        fd, nd = f[2], n[2]
        run.check('%s：效能——每個鏡頭的 draw call ≤ 改之前 ×1.1、三角形 ≤ 改之前（含陰影那一輪）' % zid,
                  all(fd[k]['calls'] <= 1.1 * nd[k]['calls'] and fd[k]['tris'] <= nd[k]['tris'] for k in fd),
                  json.dumps({k: {'calls': [nd[k]['calls'], fd[k]['calls'], round(fd[k]['calls'] / nd[k]['calls'], 3)], 'tris': [nd[k]['tris'], fd[k]['tris'], round(fd[k]['tris'] / nd[k]['tris'], 3)], 'near': fd[k].get('near'), 'cards': fd[k].get('cards')} for k in fd}))
    sys.exit(run.finish())


asyncio.run(main())
