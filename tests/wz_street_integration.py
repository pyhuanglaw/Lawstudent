"""溫州街近景的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  bldg.wenzhou_street＝主巷兩側 14 棟公寓、bldg.wz_jphouse＝日式宿舍＋院牆、bldg.wz_props＝電線桿 6 根、反光鏡 3 支、路名牌、Café 門前紅磚道、
  bldg.wz_park＝小公園（地面、鋪面、路緣、樹圍座椅、單槓、名牌）、bldg.wz_scooter＝機車兩款（InstancedMesh，擺在套件機車的位置、顏色照套件）。

檢查正式模型接進遊戲之後，「畫面以外的東西」都沒變、或照設計變了：
  1. 14 棟套件公寓（A1–A5、B1–B7、Café 南北兩側 C1、C2）都接上正式模型、套件外觀全部藏起來；其他建築（遠景、巷底）不受影響。
  2. 導航格、鏡頭碰撞方塊、互動點（看櫥窗、回公館、進 Café…）和 ?nobldg（程序化套件）完全相同。
  3. 招牌、直立招牌、店內景深卡都有 canvas 貼圖；招牌的貼圖比例和板面相同（字不會被拉寬；
     自我檢查：套件原本的 512×128 招牌貼圖用同一個檢查必須失敗）。
  4. 夜間：亮燈的窗（wz_room_lit）、招牌晚上發光、白天不發光；騎樓柱子有「樹幹透視」（擋住玩家時網點透空）。
  5. ?nobldg：沒有載入正式模型，套件公寓照舊參加整區靜態合併（draw call 和以前一樣）。
  6. 日式宿舍、街道細節：套件的房子、院牆、電線桿、反光鏡、路名牌、紅磚道都藏起來；玄關燈的光暈、路燈的光暈與地面光圈、電線還在；
     門牌、告示牌、桿號牌、路牌都有 canvas 字；路燈燈罩晚上亮、白天不亮；電線桿有樹幹透視。
  另外記錄兩邊同一個鏡頭的 draw call 與三角形數（資訊，不判定）。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到溫州街（GAME.applySave），關掉條件事件；直接設鏡頭位置截圖與量 draw call。
用法：python3 tests/wz_street_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'wz_street_integration')
IDS = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'C1', 'C2']
SHOPS = ['A1', 'A3', 'A4', 'A5', 'B2', 'B3', 'B5', 'B6']          # 一樓是店面（招牌＋店內景深卡）
VERT = ['A1', 'A3', 'A4', 'B3']                                    # 有直立招牌

GLBS = ['wenzhou_street_glb', 'wz_jphouse_glb', 'wz_props_glb', 'wz_park_glb', 'wz_scooters_glb']
TAGS = {'wzApt': 14, 'wzJp': 2, 'wzProp': 12, 'wzPark': 5}                    # 套件物件的數量：公寓 14 棟；宿舍＋院牆；電線桿 6＋反光鏡 3＋路名牌＋紅磚道 2 片
WAIT_FORMAL = "(async()=>{ const want=%s; for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&want.every(n=>z.group.children.some(o=>o.name===n))) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % json.dumps(GLBS)
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E, z=E.zone; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; return {calls:ri.calls, tris:ri.triangles}; })"""
VIEWS = [('lane_east', (30, 1.7, -1.5), (44, 3.5, 1.5)), ('lane_west', (14, 1.7, 1.0), (-2, 4.0, -2)), ('arcade', (14.5, 1.6, -1.8), (24, 2.2, -5.5))]


async def check(pg, run, formal):
    run.setup('讀檔到溫州街主巷 (30,−1) 17:30，關掉條件事件')
    await PL.load_state(pg, {'zone': 'wenzhou', 'hour': 17.5, 'pos': {'x': 30, 'z': -1, 'yaw': 1.5708}}, quiet_events=True)
    if formal: run.check('三個正式模型都接上（公寓、日式宿舍、街道細節）', await pg.evaluate(WAIT_FORMAL))
    else:
        await pg.wait_for_timeout(3000)
        run.check('?nobldg：沒有載入正式模型', not await pg.evaluate("GAME.E.zone.group.children.some(o=>%s.includes(o.name))" % json.dumps(GLBS)))
    tags = await pg.evaluate("""(()=>{ const out={}; for(const t of %s){ const objs=GAME.E.zone.group.children.filter(o=>o.userData&&o.userData[t]);
        out[t]={n:objs.length, formal:objs.filter(o=>o.userData.formal).length, dyn:objs.filter(o=>o.userData.dyn).length,
          shown:objs.filter(o=>o.isMesh?o.visible:o.children.some(m=>(m.isMesh||m.isSprite)&&m.visible)).length}; } return out; })()""" % json.dumps(list(TAGS)))
    run.check('套件物件都有標記（公寓 14、宿舍＋院牆 2、街道細節 12、小公園 5）', all(tags[t]['n'] == n for t, n in TAGS.items()), json.dumps(tags))
    if formal:
        run.check('標記的套件物件都接上正式模型、外觀全部藏起來', all(tags[t]['formal'] == n and tags[t]['shown'] == 0 for t, n in TAGS.items()), json.dumps(tags))
    else:
        run.check('?nobldg：標記的套件物件都沒有 dyn（照舊參加靜態合併）、沒有接正式模型', all(tags[t]['dyn'] == 0 and tags[t]['formal'] == 0 for t in TAGS), json.dumps(tags))
        run.check('?nobldg：機車照舊直接放在區域裡（沒有另外分組）', not await pg.evaluate("GAME.E.zone.group.children.some(o=>o.name==='wz_kit_scooters')"))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const apts=z.group.children.filter(o=>o.userData&&o.userData.wzApt);
        const per={}; for(const b of apts) per[b.userData.wzApt]={formal:!!b.userData.formal, dyn:!!b.userData.dyn, kitVisible:b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length};
        const others=z.group.children.filter(o=>o.userData&&o.userData.footprint&&!o.userData.wzApt&&!o.userData.wzJp&&!o.userData.formal); const othersHidden=others.filter(b=>b.children.length&&!b.children.some(o=>o.visible)).length;
        return {per, others:others.length, othersHidden}; })()""")
    per = info['per']
    run.check('14 棟套件公寓都有棟號（A1–A5、B1–B7、C1、C2）', sorted(per) == sorted(IDS), json.dumps(sorted(per)))
    if formal:
        run.check('14 棟都接上正式模型（userData.formal）', all(per.get(i, {}).get('formal') for i in IDS), json.dumps({k: v['formal'] for k, v in per.items()}))
        bad = {k: v['kitVisible'] for k, v in per.items() if v['kitVisible']}
        run.check('套件公寓的外觀全部藏起來', not bad, json.dumps(bad))
    else:
        # 照舊合併：套件公寓的網格搬進整區合併的大網格（建築 group 底下沒有子網格是正常的），所以看 dyn 旗標與 formal，不數子網格
        run.check('?nobldg：套件公寓照舊參加靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in per.values()), json.dumps(per))
        merged = await pg.evaluate("GAME.E.zone.group.children.filter(o=>o.isMesh&&o.userData&&o.userData.merged&&o.visible).length")
        run.check('?nobldg：整區有合併過的網格（套件外觀在裡面）', merged > 0, json.dumps(merged))
    run.check('其他建築（遠景、巷底）沒有被藏起來', info['others'] > 0 and info['othersHidden'] == 0, json.dumps([info['others'], info['othersHidden']]))
    if formal:
        faces = await pg.evaluate("""(()=>{ const root=GAME.E.zone.group.children.find(o=>o.name==='wenzhou_street_glb'); const out={}; const box=new THREE.Box3(), s=new THREE.Vector3();
            root.traverse(o=>{ if(!o.isMesh||!/_FACE_/.test(o.name)) return; o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(s); const m=o.material.map, img=m&&m.image;
              const rep=m?m.repeat.x:1; out[o.name]={canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), board:+(Math.max(s.x,s.z)/s.y).toFixed(3), tex:img?+(img.width*rep/img.height).toFixed(3):0, night:+o.material.emissiveIntensity.toFixed(2)}; });
            return out; })()""")
        signs = {k: v for k, v in faces.items() if k.startswith('SIGN_FACE_')}; vs = {k: v for k, v in faces.items() if k.startswith('VSIGN_FACE_')}; ints = {k: v for k, v in faces.items() if k.startswith('INTERIOR_FACE_')}
        run.check('8 家店的橫招牌都有 canvas 字', sorted(k[10:] for k in signs) == sorted(SHOPS) and all(v['canvas'] for v in signs.values()), json.dumps(signs))
        run.check('4 家店的直立招牌兩面都有 canvas 字', len(vs) == 8 and all(v['canvas'] for v in vs.values()), json.dumps(vs))
        run.check('8 家店的店內景深卡都有貼圖', sorted(k[14:] for k in ints) == sorted(SHOPS) and all(v['canvas'] for v in ints.values()), json.dumps(ints))
        ratio = lambda v: v['tex'] / v['board']
        run.check('招牌貼圖比例＝板面比例（±8%，字不被拉寬）', all(0.92 < ratio(v) < 1.08 for v in list(signs.values()) + list(vs.values())), json.dumps({k: round(ratio(v), 3) for k, v in list(signs.items()) + list(vs.items())}))
        run.check('店內景深卡：貼圖重複後的比例和板面差不到一半', all(0.6 < ratio(v) < 1.6 for v in ints.values()), json.dumps({k: round(ratio(v), 3) for k, v in ints.items()}))
        # 自我檢查（TESTING.md 規則 3）：套件原本的招牌貼圖（TK.signTex 512×128）放到同樣的板面上，比例檢查必須失敗
        kit = [512 / 128 / v['board'] for v in signs.values()]
        run.check('（自我檢查）套件原本 512×128 的招牌貼圖，比例檢查會失敗', any(not (0.92 < r < 1.08) for r in kit), json.dumps([round(r, 2) for r in kit]))
        night = await pg.evaluate("""(()=>{ const z=GAME.E.zone, root=z.group.children.find(o=>o.name==='wenzhou_street_glb'); const mats={};
            root.traverse(o=>{ if(o.isMesh) for(const m of [o.material]) mats[m.name]=m; }); const sign=root.getObjectByName('SIGN_FACE_A4');
            const read=()=>({lit:+(mats.wz_room_lit?mats.wz_room_lit.emissiveIntensity:-1).toFixed(2), tube:+(mats.wz_tube?mats.wz_tube.emissiveIntensity:-1).toFixed(2), sign:+sign.material.emissiveIntensity.toFixed(2)});
            z.applyTimeOutdoor(11,GAME.E); const day=read(); z.applyTimeOutdoor(21,GAME.E); const nt=read(); z.applyTimeOutdoor(17.5,GAME.E);
            return {day, night:nt, pillarSeeThrough:!!(mats.wz_pillar_tile&&mats.wz_pillar_tile.userData._st)}; })()""")
        run.check('亮燈的窗：晚上發光、白天不發光', night['night']['lit'] > 0.3 and night['day']['lit'] < 0.05, json.dumps(night))
        run.check('招牌：晚上比白天亮', night['night']['sign'] > night['day']['sign'] + 0.3, json.dumps(night))
        run.check('騎樓柱子有樹幹透視（擋住玩家時網點透空）', night['pillarSeeThrough'], json.dumps(night))
        extra = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const out={plates:{}}; for(const n of ['wz_jphouse_glb','wz_props_glb']){ const r=z.group.children.find(o=>o.name===n);
              r.traverse(o=>{ if(o.isMesh&&/^PLATE_FACE_/.test(o.name)){ const m=o.material.map; out.plates[o.name]=!!(m&&m.image&&m.image.getContext); } }); }
            const mats={}; for(const n of ['wz_jphouse_glb','wz_props_glb']) z.group.children.find(o=>o.name===n).traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; });
            const rd=()=>({lens:+mats.wz_lamp_lens.emissiveIntensity.toFixed(2), genkan:+mats.jp_lamp.emissiveIntensity.toFixed(2), shoji:+mats.jp_shoji.emissiveIntensity.toFixed(2)});
            z.applyTimeOutdoor(11,GAME.E); out.day=rd(); z.applyTimeOutdoor(21,GAME.E); out.night=rd(); z.applyTimeOutdoor(17.5,GAME.E);
            out.poleST=!!mats.wz_pole_concrete.userData._st; out.shojiMap=!!mats.jp_shoji.emissiveMap;
            out.glows=z.group.children.filter(o=>o.isSprite&&o.visible).length; out.wires=z.group.children.filter(o=>o.isLine||o.isLineSegments||(o.isMesh&&o.geometry&&o.geometry.type==='TubeGeometry')).length;
            return out; })()""")
        pl = extra['plates']
        run.check('門牌、告示牌、6 個桿號牌、路牌兩面、路名牌兩面都有 canvas 字', len(pl) == 12 and all(pl.values()), json.dumps(pl))
        run.check('路燈燈罩、玄關燈、紙拉門：晚上亮、白天暗', all(extra['night'][k] > extra['day'][k] + 0.3 for k in ('lens', 'genkan', 'shoji')), json.dumps([extra['day'], extra['night']]))
        run.check('電線桿有樹幹透視', extra['poleST'], json.dumps(extra['poleST']))
        run.note('看得到的光暈 sprite：%d 個（玄關燈、路燈、Café…，套件的光暈不屬於被藏起來的物件）' % extra['glows'])
        sc = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.name==='wz_kit_scooters'); const out=z.group.children.find(o=>o.name==='wz_scooters_glb');
            const n=kit?kit.children.filter(o=>o.isGroup).length:-1; const ims=out?out.children.filter(o=>o.isInstancedMesh):[];
            const paint=ims.filter(m=>m.material.name==='scooter_paint'); const cnt=paint.reduce((a,m)=>a+m.count,0);
            const kitCols=new Set(), glbCols=new Set(); if(kit) kit.children.forEach(o=>{ if(o.isGroup) kitCols.add(''); });
            const c=new THREE.Color(); for(const m of paint) for(let i=0;i<m.count;i++){ m.getColorAt(i,c); glbCols.add(c.getHexString()); }
            return {kitScooters:n, kitHidden:kit?!kit.visible:null, instanced:ims.length, paintInstances:cnt, colors:[...glbCols].length, hasColor:paint.every(m=>!!m.instanceColor)}; })()""")
        run.check('機車：套件機車整組藏起來、換成 InstancedMesh（台數相同、車殼有每台的顏色）', sc['kitHidden'] is True and sc['kitScooters'] > 30 and sc['paintInstances'] == sc['kitScooters'] and sc['hasColor'] and sc['colors'] >= 5, json.dumps(sc))
        # 自我檢查：把一棟套件公寓的外觀打開，「套件外觀全部藏起來」的檢查必須看得出來
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.wzApt==='B5'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開 B5 的套件外觀時，會被數到', neg > 0, json.dumps(neg))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'nobldg'))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(('一般網址' if formal else '?nobldg') + '：同一個鏡頭的 draw call／三角形 ' + json.dumps(draws))
    return await pg.evaluate(NAV_HASH), await pg.evaluate(STATE)


async def main():
    run = PL.Run('wz_street_integration', OUT)
    res = {}
    async with async_playwright() as p:
        for formal in (True, False):
            url = URL if formal else (URL + ('&' if '?' in URL else '?') + 'nobldg')
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(url); run.check(('一般網址' if formal else '?nobldg') + '：遊戲載入', await PL.wait_loaded(pg))
            res[formal] = await check(pg, run, formal)
            run.check(('一般網址' if formal else '?nobldg') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    run.check('導航格：正式模型和程序化版完全相同', res[True][0] == res[False][0], json.dumps([res[True][0], res[False][0]]))
    run.check('鏡頭碰撞方塊：完全相同', res[True][1]['col'] == res[False][1]['col'], '%d vs %d 個' % (len(res[True][1]['col']), len(res[False][1]['col'])))
    run.check('互動點（位置、半徑、名稱）：完全相同', res[True][1]['it'] == res[False][1]['it'], '%d vs %d 個' % (len(res[True][1]['it']), len(res[False][1]['it'])))
    sys.exit(run.finish())


asyncio.run(main())
