"""萬才館外觀的正式模型（Blender GLB bldg.wancai_exterior，tools/blender/wancai_exterior.py）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
萬才館第二階段（D41）：外觀換成 Blender 模型；大樓梯、平台、陽台的導航（校園第 1 層）、鏡頭碰撞、互動點都照套件（CK.lawhall），模型只換外觀。

比較兩種載入：一般網址（正式模型）和「只擋掉 wancai_exterior.glb 的下載」（載入失敗退回套件的樣子；其他正式模型照常，畫面只差萬才館）：
  1. 正式模型接上（userData.formal）；套件的外觀全部藏起來，只留館名（金色字，keepWithFormal）；擋掉下載時套件外觀照舊顯示、沒有 JS 錯誤。
  2. 導航格（第 0 層、第 1 層）、鏡頭碰撞方塊、互動點（位置、半徑、名稱、樓層）兩種載入完全相同。
  3. 夜間：會亮的窗（ext_glass_lit）、入口玻璃（ext_glass_lobby）、陽台下的嵌燈（ext_downlight）20:30 發光、11:00 不發光（或比較暗）。
  4. 窗用 GPU instancing（同一種窗一個 InstancedMesh）。
  5. 效能：同一個鏡頭（藏起路人）draw call ≤ 擋掉時的 1.15 倍＋6、三角形 ≤ 擋掉時＋6 萬（含陰影那一輪）。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到法學院廣場（萬才館大樓梯前），關掉條件事件；直接設鏡頭位置量 draw call 與截圖。
用法：python3 tests/wancai_glb_integration.py http://127.0.0.1:8765/index.html [輸出資料夾]
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/wancai_glb_integration'
FIND = "GAME.E.zone.buildings.find(b=>b.userData.ck&&b.userData.ck.wancai)"
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const b=%s; if(b&&b.userData.formal) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % FIND
KIT = """(()=>{ const b=%s; const vis=[], keep=[]; for(const m of b.children){ if(!m.isMesh) continue; if(m.userData.keepWithFormal) keep.push(m.visible); else if(m.visible) vis.push(m.material&&m.material.name||m.name); }
    const root=b.getObjectByName('WancaiExterior'); let inst=0, instN=0; if(root) root.traverse(o=>{ if(o.isInstancedMesh){ inst++; instN+=o.count; } });
    return {formal:!!b.userData.formal, kitVisible:vis.length, keepVisible:keep, root:!!root, inst, instN}; })()""" % FIND
NAV_HASH = """(()=>{ const L=GAME.E.zone.levels||[GAME.E.zone.nav]; return L.map(n=>{ let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h,n.b.reduce((a,v)=>a+(v?1:0),0)]; }); })()"""
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0),i.lv===undefined?'':i.lv]).sort();
    return {col, it}; })()"""
NIGHT = """(()=>{ const E=GAME.E, b=%s, root=b.getObjectByName('WancaiExterior'); const mats={}; root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; });
    const read=()=>{ const o={}; for(const k of ['ext_glass_lit','ext_glass_lobby','ext_downlight']) o[k]=mats[k]?+mats[k].emissiveIntensity.toFixed(2):null; return o; };
    E.applyTime(11); const day=read(); E.applyTime(20.5); const night=read(); E.applyTime(17.5); return {day,night}; })()""" % FIND
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
VIEWS = [('front', (93, 2.0, -70), (88, 10, -112)),       # 廣場往北看整棟
         ('stairs', (87, 1.7, -85.5), (87, 3.2, -102)),   # 大樓梯正前方（玩家最常看到的角度）
         ('balcony', (95.6, 5.4, -99.6), (82, 4.2, -96.5)),  # 陽台上往西看平台、弧形量體
         ('corner', (116, 3, -80), (88, 12, -112))]       # 東南角


async def check(pg, run, formal):
    tag = '正式模型' if formal else '擋掉 GLB'
    run.setup('讀檔到法學院廣場 (87,-84) 17:30，關掉條件事件')
    await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 87, 'z': -84, 'yaw': 3.1416}}, quiet_events=True)
    if formal: run.check(tag + '：萬才館的正式模型接上', await pg.evaluate(WAIT_FORMAL))
    else: await pg.wait_for_timeout(6000)
    kit = await pg.evaluate(KIT)
    if formal:
        run.check(tag + '：套件外觀全部藏起來、館名（金色字）留著', kit['root'] and kit['kitVisible'] == 0 and kit['keepVisible'] == [True], json.dumps(kit))
        run.check(tag + '：窗用 GPU instancing（每種窗一個 InstancedMesh）', kit['inst'] >= 4 and kit['instN'] > 300, json.dumps(kit))
        night = await pg.evaluate(NIGHT)
        ok = all(night['night'][k] is not None and night['night'][k] > (night['day'][k] or 0) + 0.2 for k in ('ext_glass_lit', 'ext_glass_lobby', 'ext_downlight'))
        run.check(tag + '：會亮的窗、入口玻璃、陽台下的嵌燈 20:30 比 11:00 亮', ok, json.dumps(night))
    else:
        run.check(tag + '：沒有正式模型、套件外觀照舊顯示（載入失敗的樣子）', not kit['formal'] and not kit['root'] and kit['kitVisible'] > 5, json.dumps(kit))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'kit'))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(tag + '：同一個鏡頭（藏起路人）的 draw call／三角形 ' + json.dumps(draws))
    return await pg.evaluate(NAV_HASH), await pg.evaluate(STATE), draws


async def main():
    run = PL.Run('wancai_glb_integration', OUT)
    res = {}
    async with async_playwright() as p:
        for formal in (True, False):
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            if not formal:
                for pat in ('**/wancai_exterior.glb', '**/wancai_exterior.glb.json'): await pg.route(pat, lambda route: route.abort())
            await pg.goto(URL); run.check(('正式模型' if formal else '擋掉 GLB') + '：遊戲載入', await PL.wait_loaded(pg))
            res[formal] = await check(pg, run, formal)
            bad = [e for e in errs if 'wancai_exterior' not in e]
            run.check(('正式模型' if formal else '擋掉 GLB') + '：沒有 JS 錯誤', not bad, '; '.join(bad[:3]))
            await b.close()
    run.check('導航格（第 0 層、第 1 層）：正式模型和套件完全相同', res[True][0] == res[False][0], json.dumps([res[True][0], res[False][0]]))
    run.check('鏡頭碰撞方塊：完全相同', res[True][1]['col'] == res[False][1]['col'], '%d vs %d 個' % (len(res[True][1]['col']), len(res[False][1]['col'])))
    run.check('互動點（位置、半徑、名稱、樓層）：完全相同', res[True][1]['it'] == res[False][1]['it'], '%d vs %d 個' % (len(res[True][1]['it']), len(res[False][1]['it'])))
    f, n = res[True][2], res[False][2]
    run.check('效能：每個鏡頭 draw call ≤ 套件版的 1.15 倍＋6、三角形 ≤ 套件版＋6 萬（含陰影那一輪）',
              all(f[k]['calls'] <= 1.15 * n[k]['calls'] + 6 and f[k]['tris'] <= n[k]['tris'] + 60000 for k in f),
              json.dumps({k: [n[k]['calls'], f[k]['calls'], n[k]['tris'], f[k]['tris']] for k in f}))
    sys.exit(run.finish())


asyncio.run(main())
