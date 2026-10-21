"""公館店面街的正式模型（第二個 AI：Blender GLB bldg.gongguan_shops）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  bldg.gongguan_shops＝羅斯福路南側 15 棟騎樓店面（G00–G14）＋往溫州街的巷口轉角（G15），tools/blender/env_second/wz_street.py --set gongguan。

檢查正式模型接進遊戲之後，「畫面以外的東西」都沒變、或照設計變了（LAWWW 2026-10-10 21:21Z 的條件）：
  1. 16 棟套件店面都有棟號、都接上正式模型、套件外觀全部藏起來；沒有標記的東西（捷運出口、校門、路燈、立牌、校園那一側的背景）沒有多藏任何一個。
  2. 導航格、鏡頭碰撞方塊、互動點（進麵店、買飲料、進書房、進便利商店、往溫州街、回到校園、捷運）和 ?nobldg（程序化套件）完全相同。
  3. 招牌：ART-GG-SIGNS-2 起全部是設計稿（字在貼圖裡，wz_signs／wz_signs_lit），沒有 canvas 字的 SIGN_FACE／VSIGN_FACE；設計稿網格看得到、三角形數夠；
     店內景深卡 15 面合成一張 atlas（2026-10-21）；光暈合成一個網格。（之前：canvas 招牌合成一張 atlas、檢查貼圖比例＝板面比例。）
  4. 夜間：招牌、騎樓日光燈、亮燈的窗晚上發光、白天不發光；20:30 招牌是亮的；騎樓柱子有樹幹透視（擋住玩家時網點透空）。
  5. 太陽方向：中午太陽在南邊（公館的區域座標 +x＝南，sunYaw＝π/2）。
  6. 效能：同一個鏡頭（藏起路人；含陰影那一輪、含玩家）draw call ≤ ?nobldg 的 1.3 倍、三角形 ≤ 42 萬。
  7. ?nobldg：沒有載入正式模型，套件店面照舊參加整區靜態合併（不是 dyn）。
  8. 機車（LAWWW 2026-10-11 03:47Z ⑧）：60 台套件機車整組藏起來、換成正式模型（bldg.wz_scooter 兩款）的 InstancedMesh，**分組**（北側 5 組、南側 3 組，每組 6～9 台；
     每組各自一套 InstancedMesh，看不到的那一組整組被剔除）；台數、每台的車殼顏色和套件相同；每個鏡頭至少有一組在畫面外（分組有用）。?nobldg：機車照舊直接放在區域裡。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到公館（GAME.applySave），關掉條件事件；直接設鏡頭位置截圖與量 draw call。
用法：python3 tests/gongguan_glb_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'gongguan_glb_integration')
IDS = ['G%02d' % i for i in range(16)]
INT_IDS = [i for i in IDS if i != 'G01']   # 店內景深卡：G01 清葉茶行 10-18 起是臨騎樓的立體櫃台（開口看得到裡面，ART-GG-SHOPS-1018），沒有景深卡
DESIGNED = list(IDS)   # ART-GG-SIGNS-2（LAWWW2-B）：16 家的橫招牌全部是使用者生成、BB-B 通過的設計稿（gg_signs_atlas）；之前 G00／G02／G03／G04／G06／G10／G11 七家   # G00／G02／G04／G06／G10／G11：使用者生成、BB-B 通過的設計稿（gg_signs_atlas，LAWWW2-B ART-GG-SIGNS）    # 招牌用設計稿（日日便利 riri_mart_h，和溫州街同一張；LAWWW2-B b7a091b8 拿掉 SIGN_FACE_G03）：沒有 canvas 字的橫招牌，改檢查設計稿招牌 sk_sign_G03 在
IDS_CANVAS = [i for i in IDS if i not in DESIGNED]
VERT = []                                                              # 店的直立招牌：六塊都換成設計稿了（VDESIGNED）
VDESIGNED = ['G00', 'G02', 'G04', 'G06', 'G10', 'G11']               # 設計稿直立招牌：sk_vsign_<店>_a／_b
TENANT = ['G01', 'G04', 'G06', 'G07', 'G08', 'G10', 'G12', 'G14']      # 樓上住戶的直立招牌（ART-GG-SIGNS-2 起也是設計稿）
SIGN2F = ['G02', 'G05', 'G09', 'G11', 'G13']                          # 二樓整面大招牌（ART-GG-SIGNS-2 起是設計稿）
ROOF = ['G07']                                                        # 屋頂看板（ART-GG-SIGNS-2 起是設計稿）
GLB = 'gongguan_shops_glb'
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
# 機車的分組（zones3d.js gongguan 區塊的 scRow）：北側 N0–N4、南側 S0–S2
SC_GROUPS = {'N0': 6, 'N1': 6, 'N2': 8, 'N3': 7, 'N4': 9, 'S0': 6, 'S1': 9, 'S2': 9}
SC_VIS = """(()=>{ const E=GAME.E, cam=E.camera; cam.updateMatrixWorld(); const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
    const out=E.zone.group.children.find(o=>o.name==='gg_scooters_glb'); if(!out) return null; const seen=new Set(), all=new Set(); const sp=new THREE.Sphere();
    out.children.forEach(o=>{ const m=o.isLOD?o.levels[0].object:o; if(!(m.isInstancedMesh||o.isLOD)||!o.userData.scGroup) return; all.add(o.userData.scGroup); o.updateMatrixWorld(true); if(!m.boundingSphere&&m.geometry) m.geometry.computeBoundingSphere(); sp.copy(m.boundingSphere||m.geometry.boundingSphere).applyMatrix4(m.matrixWorld); if(fr.intersectsSphere(sp)) seen.add(o.userData.scGroup); });   /* 機車 v2：每組一個 THREE.LOD（近的那一層的範圍） */
    return {seen:[...seen].sort(), all:all.size}; })()"""
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='%s')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % GLB
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
# 沒有標記的群組（捷運出口、校門、路燈、立牌、背景…）：數「底下沒有任何看得到的網格／sprite」的群組，正式模型和 ?nobldg 必須一樣多（多了＝藏錯東西）。
# 機車（userData.ggScooter；有正式模型時在 gg_kit_scooters 裡）另外檢查（第 8 項）：?nobldg 的套件機車直接放在區域裡、合併後是空的群組，兩邊的數法不同
# 路燈的光暈與地面光圈（E.lampGlows）不算：遊戲時鐘在跑，兩輪量的時候一個還沒開燈、一個已經開燈（第一次跑就因為這樣差了 18 個＝18 盞路燈）
OTHERS = """(()=>{ const z=GAME.E.zone; let n=0, empty=0; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
    for(const o of z.group.children){ if(!o.isGroup||(o.userData&&(o.userData.ggShop||o.userData.ggScooter||o.userData.ckTag||o.userData.ggMrt))||/_glb$|Fallback$/.test(o.name)||o.name==='gg_kit_scooters') continue;   /* ckTag 校門、ggMrt 捷運出口、*Fallback（公館遠景的方盒）：被正式模型取代的套件，藏起來是對的 */ n++; let vis=false; o.traverse(m=>{ if(!vis&&(m.isMesh||m.isSprite)&&!skip.has(m)&&shown(m)) vis=true; }); if(!vis) empty++; }
    return {n, empty}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人每次的位置不同（量測雜訊）：量的時候暫時移出場景，只比場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
# 公館的區域座標：+x 往南、+z 往西；店面立面在 z=19（騎樓 19–22），人行道 z 4–19，羅斯福路 z −31…4，校門在 z −46
VIEWS = [('street_west', (-22, 1.7, 11), (-62, 4.5, 19)),     # 人行道往西看整排店面（玩家最常看到的角度）
         ('from_gate', (2, 1.7, -36), (-4, 7, 19)),          # 校門口往南看過羅斯福路
         ('arcade', (-18, 1.6, 20.6), (-34, 2.2, 20.6)),     # 騎樓裡往西
         ('lane', (-71, 1.7, 9), (-71, 5.5, 32))]            # 往溫州街的巷口（轉角那棟、麵店側面）


async def check(pg, run, formal):
    run.setup('讀檔到公館人行道 (−30,14) 17:30，關掉條件事件')
    await pg.evaluate(SETTLED)   # 開機預載的街道道具（路燈、腳踏車）要在建公館之前載好（W3.lampPost()／W3.bike() 是同步建立的；校園 2026-10-11 的教訓）
    await PL.load_state(pg, {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}}, quiet_events=True)
    if formal: run.check('公館店面的正式模型接上', await pg.evaluate(WAIT_FORMAL))
    else:
        await pg.wait_for_timeout(3000)
        run.check('?nobldg：沒有載入正式模型', not await pg.evaluate("GAME.E.zone.group.children.some(o=>o.name==='%s')" % GLB))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const bs=z.group.children.filter(o=>o.userData&&o.userData.ggShop); const per={};
        for(const b of bs) per[b.userData.ggShop]={formal:!!b.userData.formal, dyn:!!b.userData.dyn, kitVisible:b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length};
        return per; })()""")
    run.check('16 棟套件店面都有棟號（G00–G14 店面街、G15 巷口轉角）', sorted(info) == IDS, json.dumps(sorted(info)))
    if formal:
        run.check('16 棟都接上正式模型（userData.formal）', all(info.get(i, {}).get('formal') for i in IDS), json.dumps({k: v['formal'] for k, v in info.items()}))
        bad = {k: v['kitVisible'] for k, v in info.items() if v['kitVisible']}
        run.check('套件店面的外觀全部藏起來', not bad, json.dumps(bad))
    else:
        run.check('?nobldg：套件店面照舊參加靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in info.values()), json.dumps(info))
        merged = await pg.evaluate("GAME.E.zone.group.children.filter(o=>o.isMesh&&o.userData&&o.userData.merged&&o.visible).length")
        run.check('?nobldg：整區有合併過的網格（套件外觀在裡面）', merged > 0, json.dumps(merged))
    others = await pg.evaluate(OTHERS)
    if formal:
        faces = await pg.evaluate("""(()=>{ const root=GAME.E.zone.group.children.find(o=>o.name==='%s'); const out={}; const box=new THREE.Box3(), s=new THREE.Vector3();
            const at=root.getObjectByName('wz_signs_atlas'); if(at){ const m=at.material.map, img=m&&m.image; for(const it of at.userData.atlas.items) out[it.name]={canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), board:it.board, tex:+(it.w/it.h).toFixed(3), atlas:true}; }
            root.traverse(o=>{ if(!o.isMesh||!/_FACE_/.test(o.name)) return; o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).getSize(s); const m=o.material.map, img=m&&m.image;
              const rep=m?m.repeat.x:1; out[o.name]={canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), board:+(Math.max(s.x,s.z)/s.y).toFixed(3), tex:img?+(img.width*rep/img.height).toFixed(3):0}; });
            out.__atlas=at?{visible:at.visible, w:at.userData.atlas.w, h:at.userData.atlas.h, n:at.userData.atlas.items.length, tris:at.geometry.index.count/3}:null; return out; })()""" % GLB)
        atl = faces.pop('__atlas')
        # ART-GG-SIGNS-2（LAWWW2-B）：店的橫招牌 16、直立 6、樓上住戶直立 8、二樓大招牌 5、屋頂看板 1 全部換成設計稿，招牌字在貼圖裡（wz_signs／wz_signs_lit），
        # 和溫州街 v5 一樣沒有 SIGN_FACE、VSIGN_FACE，遊戲不畫招牌、也就沒有 wz_signs_atlas
        run.check('沒有 SIGN_FACE／VSIGN_FACE（招牌全部是設計稿貼圖），也就沒有 wz_signs_atlas', atl is None and not any(k.startswith(('SIGN_FACE_', 'VSIGN_FACE_')) for k in faces), json.dumps([k for k in faces if 'SIGN' in k]))
        signs = {k: v for k, v in faces.items() if k.startswith('SIGN_FACE_')}; vs = {k: v for k, v in faces.items() if k.startswith('VSIGN_FACE_')}; ints = {k: v for k, v in faces.items() if k.startswith('INTERIOR_FACE_')}
        # 效能那幾輪（LAWWW2-B）起，設計稿招牌（sk_sign_*、sk_vsign_*）和同材質的零件合成一個網格，節點名稱不在了：
        # 改查①沒有 canvas 字的板面（SIGN_FACE_／VSIGN_FACE_）②設計稿材質（wz_signs／wz_signs_lit）的網格看得到、三角形至少 橫 16＋店直 6×2＋住戶直 8×2＋二樓 5＋屋頂 1＝50 面×2
        dsg = await pg.evaluate("(([ids,vids,tids,f2,rf])=>{ const r=GAME.E.zone.group.children.find(o=>o.name==='%s'); let tris=0, vis=0; r.traverse(o=>{ if(o.isMesh&&/^wz_signs(_lit)?$/.test(o.material.name)){ let v=true; for(let p=o;p&&v;p=p.parent) v=p.visible; if(v){ vis++; tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3; } } }); return {faces:ids.filter(i=>r.getObjectByName('SIGN_FACE_'+i)).concat(vids.filter(i=>r.getObjectByName('VSIGN_FACE_'+i+'_a')), tids.filter(i=>r.getObjectByName('VSIGN_FACE_'+i+'_t_a')), f2.filter(i=>r.getObjectByName('SIGN_FACE_'+i+'_2F')), rf.filter(i=>r.getObjectByName('SIGN_FACE_'+i+'_roof'))), meshes:vis, tris}; })" % GLB, [DESIGNED, VDESIGNED, TENANT, SIGN2F, ROOF])
        run.check('設計稿招牌（橫 %d 家；店的直立 %d 塊；樓上住戶直立 %d 塊；二樓 %d；屋頂 %d）沒有 canvas 字、設計稿網格看得到' % (len(DESIGNED), len(VDESIGNED), len(TENANT), len(SIGN2F), len(ROOF)),
                  not dsg['faces'] and dsg['meshes'] >= 1 and dsg['tris'] >= 2 * (len(DESIGNED) + 2 * len(VDESIGNED) + 2 * len(TENANT) + len(SIGN2F) + len(ROOF)), json.dumps(dsg))
        # 店內景深卡（LAWWW2-C 2026-10-21 效能）：15 面合成一張 atlas、一個網格（wz_interior_atlas）；同一種店共用 atlas 的一格；重複兩次的板面切成兩塊（atlas 裡不能重複貼圖）
        ia = await pg.evaluate("""(()=>{ const r=GAME.E.zone.group.children.find(o=>o.name==='%s'), at=r&&r.getObjectByName('wz_interior_atlas'); if(!at) return null; const m=at.material.map, img=m&&m.image, A=at.userData.atlas;
            const left=[]; r.traverse(o=>{ if(o.isMesh&&/^INTERIOR_FACE_/.test(o.name)) left.push(o.name); });
            return {names:A.items.map(i=>i.name).sort(), cells:A.cells, w:A.w, h:A.h, canvas:!!(img&&img.getContext), visible:at.visible, tris:at.geometry.index.count/3, left, night:+at.material.emissiveIntensity.toFixed(2), wrap:!!(m&&m.wrapS===THREE.ClampToEdgeWrapping)}; })()""" % GLB)
        run.check('15 棟的店內景深卡（G01 茶行是立體櫃台）合成一張 atlas、一個網格，原本的板面拿掉；同一種店共用一格；重複兩次的 4 面切成兩塊（三角形 2×(15+4)）',
                  ia is not None and [n[14:] for n in ia['names']] == INT_IDS and ia['canvas'] and ia['visible'] and not ia['left'] and ia['cells'] < len(INT_IDS) and ia['tris'] == 2 * (len(INT_IDS) + 4) and ia['w'] <= 2048 and ia['h'] <= 2048, json.dumps(ia))
        # 光暈（LAWWW2-C 2026-10-21 效能）：GLOW_* 86 個原本各自一個 Sprite、天快黑就 86 次 draw call → 一個網格；白天整個不畫、晚上畫
        gl = await pg.evaluate("""(()=>{ const E=GAME.E, z=E.zone, b=z.group.children.find(o=>o.name==='%s_glows'); if(!b) return null; const sp=z.group.children.filter(o=>o.isSprite&&o.userData.formalGlow&&o.visible).length;
            z.applyTimeOutdoor(11,E); const day=b.visible; z.applyTimeOutdoor(20.5,E); const night=b.visible, k=+b.material.emissiveIntensity.toFixed(2); z.applyTimeOutdoor(17.5,E);
            return {n:b.userData.glowBatch.items.length, day, night, k, sprites:sp, shadow:b.castShadow, additive:b.material.blending===THREE.AdditiveBlending&&!b.material.depthWrite}; })()""" % GLB)
        run.check('店面的光暈（86 個）合成一個網格（沒有個別的光暈 Sprite）：11:00 不畫、20:30 畫；加法混合、不寫深度、不投影', gl is not None and gl['n'] == 86 and not gl['day'] and gl['night'] and gl['k'] > 0.9 and gl['sprites'] == 0 and not gl['shadow'] and gl['additive'], json.dumps(gl))
        night = await pg.evaluate("""(()=>{ const E=GAME.E, z=E.zone, root=z.group.children.find(o=>o.name==='%s'); const mats={};
            root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; }); 
            const read=()=>({lit:+(mats.wz_room_lit?mats.wz_room_lit.emissiveIntensity:-1).toFixed(2), tube:+(mats.wz_tube?mats.wz_tube.emissiveIntensity:-1).toFixed(2), sign:+(mats.wz_signs_lit?mats.wz_signs_lit.emissiveIntensity:-1).toFixed(2)});   /* ART-GG-SIGNS-2：canvas 招牌 atlas 不在了，量燈箱招牌的設計稿材質 */
            z.applyTimeOutdoor(11,E); const day=read(); z.applyTimeOutdoor(20.5,E); const n2030=read(); z.applyTimeOutdoor(17.5,E);
            return {day, n2030, pillarSeeThrough:!!(mats.wz_pillar_tile&&mats.wz_pillar_tile.userData._st)}; })()""" % GLB)
        run.check('亮燈的窗：20:30 發光、11:00 不發光', night['n2030']['lit'] > 0.3 and night['day']['lit'] < 0.05, json.dumps(night))
        run.check('騎樓日光燈：20:30 比 11:00 亮', night['n2030']['tube'] > night['day']['tube'] + 0.3, json.dumps(night))
        run.check('燈箱招牌（wz_signs_lit）：20:30 是亮的（比 11:00 亮）', night['n2030']['sign'] > 0.5 and night['n2030']['sign'] > night['day']['sign'] + 0.3, json.dumps(night))
        run.check('騎樓柱子有樹幹透視（擋住玩家時網點透空）', night['pillarSeeThrough'], json.dumps(night))
        vc = await pg.evaluate("""(()=>{ const z=GAME.E.zone, OLD=/^(cafe_alu|cafe_iron_black|cafe_brass|cafe_grille|cafe_tank_steel|cafe_ac_body|cafe_ac_fan|cafe_roof_slab|cafe_pipe|cafe_curtain|wz_mailbox|wz_door_|wz_frame_|wz_awning_|wz_arcade_ceiling|wz_laundry)/;
            const out={old:[], vc:{}, win:{}}; const r=z.group.getObjectByName('%s');
            r.traverse(o=>{ if(!o.isMesh) return; const mn=o.material.name; if(OLD.test(mn)) out.old.push(mn); if(/^wz_vc_/.test(mn)) out.vc[mn+(o.isInstancedMesh?'[inst]':'')]=o.castShadow;
              if(/^(wz_stain|wz_room_lit|cafe_room_dark)$/.test(mn)){ const k=mn+(o.isInstancedMesh?'':'[merged]'); const e=out.win[k]||(out.win[k]={meshes:0,count:0}); e.meshes++; e.count+=o.isInstancedMesh?o.count:1; } });
            return out; })()""" % GLB)
        run.check('純色零件都合成頂點色材質（門框、鋁件、鐵件、窗簾、冷氣…沒有剩下原本的單獨材質）', not vc['old'] and any(k.startswith('wz_vc_matte') for k in vc['vc']) and any(k.startswith('wz_vc_metal') for k in vc['vc']), json.dumps(vc, ensure_ascii=False))
        run.check('頂點色合併的網格（不是 instancing）會投影、instancing 的不投影', all(v == (not k.endswith('[inst]')) for k, v in vc['vc'].items()), json.dumps(vc['vc'], ensure_ascii=False))
        wn = vc['win']; st_, li_, da_ = wn.get('wz_stain', {}), wn.get('wz_room_lit', {}), wn.get('cafe_room_dark', {})
        # 效能第一輪（LAWWW2-B 86df67a3）起，和溫州街一樣：亮燈的窗內合成一個網格（wz_room_lit[merged]），沒亮燈的進頂點色；之前是兩個 InstancedMesh、扇數相加＝窗框
        lim_ = wn.get('wz_room_lit[merged]', {})
        inst_ok = li_.get('meshes') == 1 and da_.get('meshes') == 1 and st_.get('count') == li_.get('count', 0) + da_.get('count', 0)
        merged_ok = lim_.get('meshes') == 1 and not li_ and not da_ and not wn.get('cafe_room_dark[merged]')
        run.check('窗戶：所有的窗共用一個窗框原型（一個 InstancedMesh）；窗內是兩個原型（扇數對得上），或亮燈的窗內合成一個網格、沒亮燈的進頂點色', st_.get('meshes') == 1 and st_.get('count', 0) > 100 and (inst_ok or merged_ok), json.dumps(wn))
        await pg.evaluate("(async()=>{ for(let i=0;i<240;i++){ if(GAME.E.zone.group.children.some(o=>o.name==='gg_scooters_glb')) return; await new Promise(r=>setTimeout(r,250)); } })()")
        sc = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.name==='gg_kit_scooters'); const out=z.group.children.find(o=>o.name==='gg_scooters_glb');
            const n=kit?kit.children.filter(o=>o.isGroup).length:-1; const ims=out?out.children.filter(o=>o.isInstancedMesh):[]; const lods=out?out.children.filter(o=>o.isLOD):[];
            if(lods.length){   /* 機車 v2（scooters_v2.py，12 款）：每組一個 THREE.LOD（近：完整、遠：_lod1），合成網格、頂點色 */
              const pick=out.userData.scPick||{}; const ms=[]; lods.forEach(l=>l.levels.forEach(v=>ms.push(v.object)));
              return {kitScooters:n, kitHidden:kit?!kit.visible:null, lods:lods.length, placed:Object.values(pick).reduce((a,b)=>a+b,0), kinds:Object.keys(pick).length, pick, colors:out.userData.scColors||0, perGroup:out.userData.scPerGroup||{},
                levelsOK:lods.every(l=>l.levels.length===2&&l.levels[1].distance>0), castShadow:ms.some(m=>m.castShadow)}; }
            const paint=ims.filter(m=>m.material.name==='scooter_paint'); const per={}; for(const m of paint){ const k=m.userData.scGroup||'?'; per[k]=(per[k]||0)+m.count; }
            const glbCols=[], c=new THREE.Color(); for(const m of paint) for(let i=0;i<m.count;i++){ m.getColorAt(i,c); glbCols.push(c.getHexString()); }
            const rad={}; for(const m of ims){ if(m.userData.scGroup) rad[m.userData.scGroup]=Math.max(rad[m.userData.scGroup]||0,+m.boundingSphere.radius.toFixed(1)); }
            return {kitScooters:n, kitHidden:kit?!kit.visible:null, instanced:ims.length, paintInstances:paint.reduce((a,m)=>a+m.count,0), perGroup:per, radius:rad,
              colors:new Set(glbCols).size, hasColor:paint.every(m=>!!m.instanceColor), castShadow:ims.some(m=>m.castShadow&&m.name!=='wz_scooter_shadows')}; })()""")
        if sc.get('lods'):
            run.check('機車（v2 多車型）：60 台套件機車整組藏起來、換成正式模型（台數相同、至少 6 款、至少 5 種車殼顏色、每組近／遠兩層、不進陰影那一輪）',
                      sc['kitHidden'] is True and sc['kitScooters'] == 60 and sc['placed'] == 60 and sc['kinds'] >= 6 and sc['colors'] >= 5 and sc['levelsOK'] and not sc['castShadow'], json.dumps(sc, ensure_ascii=False))
            run.check('機車分組：北側 N0–N4、南側 S0–S2，每組 6～9 台（每組一個 THREE.LOD）', sc['perGroup'] == SC_GROUPS, json.dumps({'perGroup': sc['perGroup']}))
        else:
            run.check('機車：60 台套件機車整組藏起來、換成正式模型的 InstancedMesh（台數相同、車殼有每台的顏色、不進陰影那一輪）',
                      sc['kitHidden'] is True and sc['kitScooters'] == 60 and sc['paintInstances'] == 60 and sc['hasColor'] and sc['colors'] >= 5 and not sc['castShadow'], json.dumps(sc))
            run.check('機車分組：北側 N0–N4、南側 S0–S2，每組 6～9 台（每組各自一套 InstancedMesh）', sc['perGroup'] == SC_GROUPS, json.dumps({'perGroup': sc['perGroup'], 'radius': sc['radius']}))
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.ggShop==='G07'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開 G07 的套件外觀時，會被數到', neg > 0, json.dumps(neg))
    # 太陽方位角（羅盤：0 北、90 東、180 南）：公館的區域座標 +x＝南、−z＝東 → 方位角＝atan2(東, 北)＝atan2(−z, −x)。
    # 12:00 的時段表是 150°（南偏東）；判定正南 ±45°。沒有 sunYaw（區域座標當成 +z＝南）會算出 240°、D29 以前「中午在北邊」的錯誤會更偏，都會失敗
    sun = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(12); const d=E.sun.position.clone().sub(E.player.obj.position); const h=Math.hypot(d.x,d.z);
        let az=Math.atan2(-d.z,-d.x)*180/Math.PI; if(az<0) az+=360; const out={x:+(d.x/h).toFixed(3), z:+(d.z/h).toFixed(3), azimuth:+az.toFixed(1), sunYaw:E.zone.def.sunYaw}; E.applyTime(17.5); return out; })()""")
    run.check('中午太陽在南邊（公館 +x＝南；sunYaw π/2；方位角在正南 ±45° 內）', 135 <= sun['azimuth'] <= 225 and abs(sun['sunYaw'] - 1.5708) < 1e-3, json.dumps(sun))
    if not formal:
        run.check('?nobldg：機車照舊直接放在區域裡（沒有另外分組、沒有正式模型）', not await pg.evaluate("GAME.E.zone.group.children.some(o=>o.name==='gg_kit_scooters'||o.name==='gg_scooters_glb')"))
    draws, vis = {}, {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        if formal: vis[name] = await pg.evaluate(SC_VIS)
        await run.shot(pg, name + '_' + ('formal' if formal else 'nobldg'))
    if formal:
        run.check('機車分組有用：每個鏡頭都至少有一組機車在畫面外（整組不畫）', all(v and len(v['seen']) < v['all'] for v in vis.values()), json.dumps(vis))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(('一般網址' if formal else '?nobldg') + '：同一個鏡頭（藏起路人）的 draw call／三角形 ' + json.dumps(draws))
    return await pg.evaluate(NAV_HASH), await pg.evaluate(STATE), others, draws


async def main():
    run = PL.Run('gongguan_glb_integration', OUT)
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
    run.check('沒有標記的群組（捷運出口、校門、路燈、背景…）沒有多藏任何一個', res[True][2]['empty'] == res[False][2]['empty'], json.dumps([res[True][2], res[False][2]]))   # 只比藏起來的數量：正式模型自己會多出群組（例：公館遠景），被取代的套件在一般網址略過，總數本來就不一樣
    f, n = res[True][3], res[False][3]
    run.check('效能：每個鏡頭的 draw call ≤ ?nobldg 的 1.3 倍、三角形 ≤ 42 萬（含陰影那一輪、含玩家；LAWWW 21:21Z 的條件）',
              all(f[k]['calls'] <= 1.3 * n[k]['calls'] and f[k]['tris'] <= 420000 for k in f), json.dumps({k: [n[k]['calls'], f[k]['calls'], round(f[k]['calls'] / n[k]['calls'], 3), n[k]['tris'], f[k]['tris']] for k in f}))
    sys.exit(run.finish())


asyncio.run(main())
