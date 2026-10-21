"""溫州街近景的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  bldg.wenzhou_street＝主巷兩側 14 棟公寓、bldg.wz_jphouse＝日式宿舍＋院牆、bldg.wz_props＝電線桿 6 根、反光鏡 3 支、路名牌、Café 門前紅磚道、
  bldg.wz_park＝小公園（地面、鋪面、路緣、樹圍座椅、單槓、名牌）、bldg.wz_scooter＝機車兩款（InstancedMesh，擺在套件機車的位置、顏色照套件）。

檢查正式模型接進遊戲之後，「畫面以外的東西」都沒變、或照設計變了：
  1. 29 棟套件公寓（主巷 A1–A5、B1–B7、Café 南北兩側 C1、C2、巷底 W0、遠景 F1–F4、S1–S4、N1–N4、W1、W2）都接上正式模型、套件外觀全部藏起來；沒有標記的建築不受影響。
  2. 導航格、鏡頭碰撞方塊、互動點（看櫥窗、回公館、進 Café…）和 ?nobldg（程序化套件）完全相同。
  3. 招牌、直立招牌、店內景深卡都有 canvas 貼圖；招牌的貼圖比例和板面相同（字不會被拉寬；
     自我檢查：套件原本的 512×128 招牌貼圖用同一個檢查必須失敗）。
  4. 夜間：亮燈的窗（wz_room_lit）、招牌晚上發光、白天不發光；騎樓柱子有「樹幹透視」（擋住玩家時網點透空）。
  5. ?nobldg：沒有載入正式模型，套件公寓照舊參加整區靜態合併（draw call 和以前一樣）。
  6. 日式宿舍、街道細節：套件的房子、院牆、電線桿、反光鏡、路名牌、紅磚道都藏起來；玄關燈的光暈、路燈的光暈與地面光圈、電線還在；
     門牌、告示牌、桿號牌、路牌都有 canvas 字；路燈燈罩晚上亮、白天不亮；電線桿有樹幹透視。
  另外記錄兩邊同一個鏡頭的 draw call 與三角形數（renderer.info，含陰影那一輪；量的時候藏起路人；資訊，不判定）。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到溫州街（GAME.applySave），關掉條件事件；直接設鏡頭位置截圖與量 draw call。
用法：python3 tests/wz_street_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'wz_street_integration')
IDS = ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'C1', 'C2', 'W0',
       'F1', 'F2', 'F3', 'F4', 'S1', 'S2', 'S3', 'S4', 'N1', 'N2', 'N3', 'N4', 'W1', 'W2']   # 近景 15 棟（含巷底 W0）＋遠景 14 棟（巷口兩端、Café 往南／往北的路）
SHOPS_INT = ['A1', 'A3', 'A4', 'A5', 'B2', 'B3', 'B6', 'B7']      # 原本有店內景深卡的 8 家店；溫州街 v6c（LAWWW2-B b7a091b8）起都改成立體淺店內，每家兩盞店內燈（GLOW_shopin_*）
VERT = ['A1', 'A3', 'A4', 'B3']                                    # 有直立招牌

GLBS = ['wenzhou_street_glb', 'wz_jphouse_glb', 'wz_props_glb', 'wz_park_glb', 'wz_scooters_glb']
TAGS = {'wzApt': 29, 'wzJp': 2, 'wzProp': 12, 'wzPark': 28}                  # 套件物件的數量：公寓 29 棟（近景 15、遠景 14）；宿舍＋院牆；電線桿 6＋反光鏡 3＋路名牌＋紅磚道 2 片
WAIT_FORMAL = "(async()=>{ const want=%s; for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&want.every(n=>z.group.children.some(o=>o.name===n))) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % json.dumps(GLBS)
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E, z=E.zone; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人每次的位置不同（量測雜訊）：量的時候暫時移出場景（引擎每格會重設 visible，所以不能只設 visible=false），只比場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
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
    # ?nobldg：小公園的備用外觀沒有 dyn，單一網格的會被整區靜態合併吃掉（本來就要合併，draw call 才會少），所以只剩群組還數得到（2026-10-16：19 個）
    okn = all(tags[t]['n'] == n for t, n in TAGS.items()) if formal else all(tags[t]['n'] == n for t, n in TAGS.items() if t != 'wzPark') and 10 <= tags['wzPark']['n'] <= TAGS['wzPark']
    run.check('套件物件都有標記（公寓 29、宿舍＋院牆 2、街道細節 12、小公園 28＝擴大版的備用外觀：草地 2、樹 5、長椅 4、路燈 2、涼亭等 11、花籬 4；?nobldg 的小公園單一網格已合併）', okn, json.dumps(tags))
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
    run.check('29 棟套件公寓都有棟號（A1–A5、B1–B7、C1、C2、W0、遠景 F1–F4、S1–S4、N1–N4、W1、W2）', sorted(per) == sorted(IDS), json.dumps(sorted(per)))
    if formal:
        run.check('29 棟都接上正式模型（userData.formal）', all(per.get(i, {}).get('formal') for i in IDS), json.dumps({k: v['formal'] for k, v in per.items()}))
        bad = {k: v['kitVisible'] for k, v in per.items() if v['kitVisible']}
        run.check('套件公寓的外觀全部藏起來', not bad, json.dumps(bad))
    else:
        # 照舊合併：套件公寓的網格搬進整區合併的大網格（建築 group 底下沒有子網格是正常的），所以看 dyn 旗標與 formal，不數子網格
        run.check('?nobldg：套件公寓照舊參加靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in per.values()), json.dumps(per))
        merged = await pg.evaluate("GAME.E.zone.group.children.filter(o=>o.isMesh&&o.userData&&o.userData.merged&&o.visible).length")
        run.check('?nobldg：整區有合併過的網格（套件外觀在裡面）', merged > 0, json.dumps(merged))
    run.check('沒有標記的建築沒有被藏起來（2026-10-10 起溫州街的公寓連遠景都換成正式模型，沒有標記的只剩少數；有的話不能被藏）', info['othersHidden'] == 0, json.dumps([info['others'], info['othersHidden']]))
    if formal:
        # 招牌（橫、直立）合成一張 atlas（wz_signs_atlas）：每一格＝一面招牌的 canvas，比例看 atlas 裡那一格；店內景深卡還是各自的網格
        faces = await pg.evaluate("""(()=>{ const root=GAME.E.zone.group.children.find(o=>o.name==='wenzhou_street_glb'); const out={}; const box=new THREE.Box3(), s=new THREE.Vector3();
            const at=root.getObjectByName('wz_signs_atlas'); if(at){ const m=at.material.map, img=m&&m.image; for(const it of at.userData.atlas.items) out[it.name]={canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), board:it.board, tex:+(it.w/it.h).toFixed(3), atlas:true}; }
            root.traverse(o=>{ if(!o.isMesh||!/_FACE_/.test(o.name)) return; o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(s); const m=o.material.map, img=m&&m.image;
              const rep=m?m.repeat.x:1; out[o.name]={canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), board:+(Math.max(s.x,s.z)/s.y).toFixed(3), tex:img?+(img.width*rep/img.height).toFixed(3):0, night:+o.material.emissiveIntensity.toFixed(2)}; });
            out.__atlas=at?{visible:at.visible, w:at.userData.atlas.w, h:at.userData.atlas.h, n:at.userData.atlas.items.length, tris:at.geometry.index.count/3}:null; return out; })()""")
        atl = faces.pop('__atlas')
        # 溫州街 v5（LAWWW2-B 31323eb9）：有設計稿的店（A1、A3、A4、A5、B2、B3、B5、B5i、B6、B7）招牌字在貼圖裡（wz_signs／wz_signs_lit），沒有 SIGN_FACE、VSIGN_FACE，遊戲不畫招牌
        run.check('v5：沒有 SIGN_FACE／VSIGN_FACE（招牌是設計稿貼圖），也就沒有 wz_signs_atlas', atl is None and not any(k.startswith(('SIGN_FACE_', 'VSIGN_FACE_')) for k in faces), json.dumps([k for k in faces if 'SIGN' in k]))
        ints = {k: v for k, v in faces.items() if k.startswith('INTERIOR_FACE_')}
        shal = await pg.evaluate("""(()=>{ const root=GAME.E.zone.group.children.find(o=>o.name==='wenzhou_street_glb'); let lamps=0; const sf={};
            root.traverse(o=>{ if(/^GLOW_shopin_/.test(o.name)) lamps++; if(o.isMesh&&o.material&&/^wz_sf_/.test(o.material.name||'')) sf[o.material.name]=true; }); return {lamps, sf:Object.keys(sf).length}; })()""")
        # 效能第二輪（LAWWW2-B 35513f11）起淺店內的小貼圖合成貼圖集，wz_sf_* 材質變少（13 → 3），不再拿材質數量當條件
        run.check('v6c：店內景深卡換成立體淺店內（沒有 INTERIOR_FACE_；8 家店各兩盞店內燈）', not ints and shal['lamps'] >= 2 * len(SHOPS_INT), json.dumps({'cards': sorted(ints), **shal}))
        night = await pg.evaluate("""(()=>{ const z=GAME.E.zone, root=z.group.children.find(o=>o.name==='wenzhou_street_glb'); const mats={};
            root.traverse(o=>{ if(o.isMesh) for(const m of [o.material]) mats[m.name]=m; }); 
            const read=()=>({lit:+(mats.wz_room_lit?mats.wz_room_lit.emissiveIntensity:-1).toFixed(2), tube:+(mats.wz_tube?mats.wz_tube.emissiveIntensity:-1).toFixed(2), sign:+(mats.wz_signs_lit?mats.wz_signs_lit.emissiveIntensity:-1).toFixed(2)});
            z.applyTimeOutdoor(11,GAME.E); const day=read(); z.applyTimeOutdoor(21,GAME.E); const nt=read(); z.applyTimeOutdoor(17.5,GAME.E);
            return {day, night:nt, pillarSeeThrough:!!(mats.wz_pillar_tile&&mats.wz_pillar_tile.userData._st)}; })()""")
        run.check('亮燈的窗：晚上發光、白天不發光', night['night']['lit'] > 0.3 and night['day']['lit'] < 0.05, json.dumps(night))
        run.check('燈箱招牌（wz_signs_lit）：晚上比白天亮', night['night']['sign'] > night['day']['sign'] + 0.3, json.dumps(night))
        run.check('騎樓柱子有樹幹透視（擋住玩家時網點透空）', night['pillarSeeThrough'], json.dumps(night))
        extra = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const out={plates:{}}; for(const n of ['wz_jphouse_glb','wz_props_glb','wz_park_glb']){ const r=z.group.children.find(o=>o.name===n);
              r.traverse(o=>{ if(o.isMesh&&/^PLATE_FACE_/.test(o.name)){ const m=o.material.map; out.plates[o.name]=!!(m&&m.image&&m.image.getContext); } });
              const at=r.getObjectByName('wz_plates_atlas'); if(at){ const m=at.material.map; for(const it of at.userData.atlas.items) out.plates[it.name]=!!(m&&m.image&&m.image.getContext)&&at.visible&&it.w>8&&it.h>8; } }
            const mats={}; for(const n of ['wz_jphouse_glb','wz_props_glb']) z.group.children.find(o=>o.name===n).traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; });
            const rd=()=>({lens:+mats.wz_lamp_lens.emissiveIntensity.toFixed(2), genkan:+mats.jp_lamp.emissiveIntensity.toFixed(2), shoji:+mats.jp_shoji.emissiveIntensity.toFixed(2)});
            z.applyTimeOutdoor(11,GAME.E); out.day=rd(); z.applyTimeOutdoor(21,GAME.E); out.night=rd(); z.applyTimeOutdoor(17.5,GAME.E);
            out.poleST=!!mats.wz_pole_concrete.userData._st; out.shojiMap=!!mats.jp_shoji.emissiveMap;
            out.glows=z.group.children.filter(o=>o.isSprite&&o.visible).length; out.glowBatches=z.group.children.filter(o=>o.userData&&o.userData.glowBatch).map(o=>o.name+' '+o.userData.glowBatch.items.length); out.wires=z.group.children.filter(o=>o.isLine||o.isLineSegments||(o.isMesh&&o.geometry&&o.geometry.type==='TubeGeometry')).length;
            return out; })()""")
        pl = extra['plates']
        run.check('門牌、6 個桿號牌、路牌兩面、路名牌兩面、小公園名牌都有 canvas 字（每個 GLB 合成一張 atlas；名牌 2026-10-16 起在小公園的 GLB 裡）', len(pl) == 12 and 'PLATE_FACE_parksign' in pl and all(pl.values()), json.dumps(pl))
        run.check('路燈燈罩、玄關燈、紙拉門：晚上亮、白天暗', all(extra['night'][k] > extra['day'][k] + 0.3 for k in ('lens', 'genkan', 'shoji')), json.dumps([extra['day'], extra['night']]))
        run.check('電線桿有樹幹透視', extra['poleST'], json.dumps(extra['poleST']))
        run.note('看得到的光暈 sprite：%d 個（路燈、Café…，套件的光暈不屬於被藏起來的物件）；正式模型的光暈合成網格：%s' % (extra['glows'], '、'.join(extra['glowBatches'])))
        sc = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.name==='wz_kit_scooters'); const out=z.group.children.find(o=>o.name==='wz_scooters_glb');
            const n=kit?kit.children.filter(o=>o.isGroup).length:-1; const ims=out?out.children.filter(o=>o.isInstancedMesh&&o.name!=='wz_scooter_shadows'):[]; const lods=out?out.children.filter(o=>o.isLOD):[];
            const r={kitScooters:n, kitHidden:kit?!kit.visible:null, lods:lods.length};
            if(lods.length){   /* 機車 v2（scooters_v2.py，12 款）：每段一個 THREE.LOD（近：完整、遠：_lod1），合成網格、頂點色 */
              const pick=out.userData.scPick||{}; r.placed=Object.values(pick).reduce((a,b)=>a+b,0); r.kinds=Object.keys(pick).length; r.colors=out.userData.scColors||0; r.pick=pick;
              r.levelsOK=lods.every(l=>l.levels.length===2&&l.levels[1].distance>0&&l.levels.every(v=>v.object.isMesh&&v.object.geometry.attributes.color&&v.object.material.vertexColors)); return r; }
            const paint=ims.filter(m=>m.material.name==='scooter_paint'); const c=new THREE.Color(), glbCols=new Set(); for(const m of paint) for(let i=0;i<m.count;i++){ m.getColorAt(i,c); glbCols.add(c.getHexString()); }
            return Object.assign(r,{instanced:ims.length, paintInstances:paint.reduce((a,m)=>a+m.count,0), colors:[...glbCols].length, hasColor:paint.every(m=>!!m.instanceColor)}); })()""")
        if sc.get('lods'):
            run.check('機車（v2 多車型）：套件機車整組藏起來、換成正式模型（台數相同、至少 6 款、至少 5 種車殼顏色、每段近／遠兩層）', sc['kitHidden'] is True and sc['kitScooters'] > 30 and sc['placed'] == sc['kitScooters'] and sc['kinds'] >= 6 and sc['colors'] >= 5 and sc['levelsOK'] is True, json.dumps(sc, ensure_ascii=False))
        else:
            run.check('機車：套件機車整組藏起來、換成 InstancedMesh（台數相同、車殼有每台的顏色）', sc['kitHidden'] is True and sc['kitScooters'] > 30 and sc['paintInstances'] == sc['kitScooters'] and sc['hasColor'] and sc['colors'] >= 5, json.dumps(sc))
        # 自我檢查：把一棟套件公寓的外觀打開，「套件外觀全部藏起來」的檢查必須看得出來
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.wzApt==='B5'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開 B5 的套件外觀時，會被數到', neg > 0, json.dumps(neg))
    if formal:
        # 第二輪減量（LAWWW 18:54Z：同一鏡頭 ≤ 約 310 次 draw call）：純色零件合成頂點色材質、窗戶共用原型
        vc = await pg.evaluate("""(()=>{ const z=GAME.E.zone, OLD=/^(cafe_alu|cafe_iron_black|cafe_brass|cafe_grille|cafe_tank_steel|cafe_ac_body|cafe_ac_fan|cafe_roof_slab|cafe_pipe|cafe_curtain|wz_mailbox|wz_door_|wz_frame_|wz_awning_|wz_arcade_ceiling|wz_laundry|jp_ridge|jp_gutter|jp_meter|wz_galv|wz_porcelain|wz_stripe_|wz_poster|wz_transformer|wz_signpole|wz_lamp_body|wz_mirror_orange|park_steel|park_bar_green)/;
            const out={old:[], vc:{}, win:{}}; for(const n of ['wenzhou_street_glb','wz_jphouse_glb','wz_props_glb','wz_park_glb']){ const r=z.group.getObjectByName(n); if(!r) continue;
              r.traverse(o=>{ if(!o.isMesh) return; const mn=o.material.name; if(OLD.test(mn)) out.old.push(n+':'+mn); if(/^wz_vc_/.test(mn)) out.vc[n+':'+mn+(o.isInstancedMesh?'[inst]':'')]=o.castShadow;
                if(n==='wenzhou_street_glb'&&/^(wz_stain|wz_room_lit|cafe_room_dark)$/.test(mn)){ const k=mn+(o.isInstancedMesh?'':'[merged]'); const e=out.win[k]||(out.win[k]={meshes:0,count:0}); e.meshes++; e.count+=o.isInstancedMesh?o.count:1; } }); }
            return out; })()""")
        run.check('純色零件都合成頂點色材質（門、雨遮、鋁框、鐵件、窗簾、曬的衣服…沒有剩下原本的單獨材質）', not vc['old'] and any(k.startswith('wenzhou_street_glb:wz_vc_matte') for k in vc['vc']) and any(k.startswith('wenzhou_street_glb:wz_vc_metal') for k in vc['vc']), json.dumps(vc, ensure_ascii=False))
        run.check('頂點色合併的網格（不是 instancing）會投影、instancing 的不投影', all(v == (not k.endswith('[inst]')) for k, v in vc['vc'].items()), json.dumps(vc['vc'], ensure_ascii=False))
        wn = vc['win']; st_, li_, da_ = wn.get('wz_stain', {}), wn.get('wz_room_lit', {}), wn.get('cafe_room_dark', {})
        # 效能第一輪（LAWWW2-B 86df67a3）起：亮燈的窗內合成一個網格（wz_room_lit[merged]），沒亮燈的窗內改成頂點色（沒有 cafe_room_dark）；之前是兩個 InstancedMesh、扇數相加＝窗框
        lim_ = wn.get('wz_room_lit[merged]', {})
        inst_ok = li_.get('meshes') == 1 and da_.get('meshes') == 1 and st_.get('count') == li_.get('count', 0) + da_.get('count', 0)
        merged_ok = lim_.get('meshes') == 1 and not li_ and not da_ and not wn.get('cafe_room_dark[merged]')
        run.check('窗戶：所有的窗共用一個窗框原型（一個 InstancedMesh）；窗內是兩個原型（扇數對得上），或亮燈的窗內合成一個網格、沒亮燈的進頂點色', st_.get('meshes') == 1 and st_.get('count', 0) > 100 and (inst_ok or merged_ok), json.dumps(wn))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'nobldg'))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(('一般網址' if formal else '?nobldg') + '：同一個鏡頭（藏起路人）的 draw call／三角形 ' + json.dumps(draws))
    if formal:
        run.check('效能：三個鏡頭的 draw call ≤ 310、三角形 ≤ 42 萬（含陰影那一輪、含玩家；LAWWW 的目標）', all(d['calls'] <= 310 and d['tris'] <= 420000 for d in draws.values()), json.dumps(draws))
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
