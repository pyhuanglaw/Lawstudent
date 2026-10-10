"""公館店面街的正式模型（第二個 AI：Blender GLB bldg.gongguan_shops）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  bldg.gongguan_shops＝羅斯福路南側 15 棟騎樓店面（G00–G14）＋往溫州街的巷口轉角（G15），tools/blender/env_second/wz_street.py --set gongguan。

檢查正式模型接進遊戲之後，「畫面以外的東西」都沒變、或照設計變了（LAWWW 2026-10-10 21:21Z 的條件）：
  1. 16 棟套件店面都有棟號、都接上正式模型、套件外觀全部藏起來；沒有標記的東西（捷運出口、校門、路燈、立牌、校園那一側的背景）沒有多藏任何一個。
  2. 導航格、鏡頭碰撞方塊、互動點（進麵店、買飲料、進書房、進便利商店、往溫州街、回到校園、捷運）和 ?nobldg（程序化套件）完全相同。
  3. 招牌合成一張 atlas：店的橫招牌 16、二樓大招牌 5、屋頂看板 1、直立招牌 14 塊×2 面，每一格都有 canvas 字、貼圖比例＝板面比例
     （自我檢查：套件原本 512×128 的招牌貼圖用同一個檢查必須失敗）；店內景深卡 16 張有貼圖。
  4. 夜間：招牌、騎樓日光燈、亮燈的窗晚上發光、白天不發光；20:30 招牌是亮的；騎樓柱子有樹幹透視（擋住玩家時網點透空）。
  5. 太陽方向：中午太陽在南邊（公館的區域座標 +x＝南，sunYaw＝π/2）。
  6. 效能：同一個鏡頭（藏起路人；含陰影那一輪、含玩家）draw call ≤ ?nobldg 的 1.3 倍、三角形 ≤ 42 萬。
  7. ?nobldg：沒有載入正式模型，套件店面照舊參加整區靜態合併（不是 dyn）。
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
VERT = ['G00', 'G02', 'G04', 'G06', 'G10', 'G11']                     # 店的直立招牌
TENANT = ['G01', 'G04', 'G06', 'G07', 'G08', 'G10', 'G12', 'G14']      # 樓上住戶的直立招牌
SIGN2F = ['G02', 'G05', 'G09', 'G11', 'G13']                          # 二樓整面大招牌
ROOF = ['G07']                                                        # 屋頂看板
GLB = 'gongguan_shops_glb'
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='%s')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()" % GLB
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
# 沒有標記的群組（捷運出口、校門、路燈、立牌、背景…）：數「底下沒有任何看得到的網格／sprite」的群組，正式模型和 ?nobldg 必須一樣多（多了＝藏錯東西）
OTHERS = """(()=>{ const z=GAME.E.zone; let n=0, empty=0; const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
    for(const o of z.group.children){ if(!o.isGroup||(o.userData&&o.userData.ggShop)||/_glb$/.test(o.name)) continue; n++; let vis=false; o.traverse(m=>{ if(!vis&&(m.isMesh||m.isSprite)&&shown(m)) vis=true; }); if(!vis) empty++; }
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
        nface = len(IDS) + len(SIGN2F) + len(ROOF) + 2 * (len(VERT) + len(TENANT))
        run.check('招牌合成一張 atlas、一個網格（%d 面＝店的橫招牌 16＋二樓大招牌 5＋屋頂看板 1＋直立招牌 %d 塊×2 面）' % (nface, len(VERT) + len(TENANT)),
                  bool(atl) and atl['visible'] and atl['n'] == nface and atl['tris'] == 2 * nface and not any(k.startswith(('SIGN_FACE_', 'VSIGN_FACE_')) and not v.get('atlas') for k, v in faces.items()), json.dumps(atl))
        run.check('招牌 atlas 不超過 2048×2048', bool(atl) and atl['w'] <= 2048 and atl['h'] <= 2048, json.dumps(atl))
        signs = {k: v for k, v in faces.items() if k.startswith('SIGN_FACE_')}; vs = {k: v for k, v in faces.items() if k.startswith('VSIGN_FACE_')}; ints = {k: v for k, v in faces.items() if k.startswith('INTERIOR_FACE_')}
        want = sorted(['SIGN_FACE_' + i for i in IDS] + ['SIGN_FACE_%s_2F' % i for i in SIGN2F] + ['SIGN_FACE_%s_roof' % i for i in ROOF])
        run.check('橫招牌（店 16、二樓 5、屋頂 1）都有 canvas 字', sorted(signs) == want and all(v['canvas'] for v in signs.values()), json.dumps(sorted(signs)))
        wantv = sorted(['VSIGN_FACE_%s_%s' % (i, s) for i in VERT for s in 'ab'] + ['VSIGN_FACE_%s_t_%s' % (i, s) for i in TENANT for s in 'ab'])
        run.check('直立招牌（店 6 塊、樓上住戶 8 塊）兩面都有 canvas 字', sorted(vs) == wantv and all(v['canvas'] for v in vs.values()), json.dumps(sorted(vs)))
        run.check('16 棟的店內景深卡都有貼圖', sorted(k[14:] for k in ints) == IDS and all(v['canvas'] for v in ints.values()), json.dumps(sorted(ints)))
        ratio = lambda v: v['tex'] / v['board']
        run.check('招牌貼圖比例＝板面比例（±8%，字不被拉寬）', all(0.92 < ratio(v) < 1.08 for v in list(signs.values()) + list(vs.values())),
                  json.dumps({k: round(ratio(v), 3) for k, v in list(signs.items()) + list(vs.items()) if not 0.92 < ratio(v) < 1.08}))
        kit = [512 / 128 / v['board'] for k, v in signs.items() if k[10:] in IDS]
        run.check('（自我檢查）套件原本 512×128 的招牌貼圖，比例檢查會失敗', any(not (0.92 < r < 1.08) for r in kit), json.dumps([round(r, 2) for r in kit]))
        night = await pg.evaluate("""(()=>{ const E=GAME.E, z=E.zone, root=z.group.children.find(o=>o.name==='%s'); const mats={};
            root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; }); const sign=root.getObjectByName('wz_signs_atlas');
            const read=()=>({lit:+(mats.wz_room_lit?mats.wz_room_lit.emissiveIntensity:-1).toFixed(2), tube:+(mats.wz_tube?mats.wz_tube.emissiveIntensity:-1).toFixed(2), sign:+sign.material.emissiveIntensity.toFixed(2)});
            z.applyTimeOutdoor(11,E); const day=read(); z.applyTimeOutdoor(20.5,E); const n2030=read(); z.applyTimeOutdoor(17.5,E);
            return {day, n2030, pillarSeeThrough:!!(mats.wz_pillar_tile&&mats.wz_pillar_tile.userData._st)}; })()""" % GLB)
        run.check('亮燈的窗：20:30 發光、11:00 不發光', night['n2030']['lit'] > 0.3 and night['day']['lit'] < 0.05, json.dumps(night))
        run.check('騎樓日光燈：20:30 比 11:00 亮', night['n2030']['tube'] > night['day']['tube'] + 0.3, json.dumps(night))
        run.check('招牌：20:30 是亮的（比 11:00 亮）', night['n2030']['sign'] > 0.5 and night['n2030']['sign'] > night['day']['sign'] + 0.3, json.dumps(night))
        run.check('騎樓柱子有樹幹透視（擋住玩家時網點透空）', night['pillarSeeThrough'], json.dumps(night))
        vc = await pg.evaluate("""(()=>{ const z=GAME.E.zone, OLD=/^(cafe_alu|cafe_iron_black|cafe_brass|cafe_grille|cafe_tank_steel|cafe_ac_body|cafe_ac_fan|cafe_roof_slab|cafe_pipe|cafe_curtain|wz_mailbox|wz_door_|wz_frame_|wz_awning_|wz_arcade_ceiling|wz_laundry)/;
            const out={old:[], vc:{}, win:{}}; const r=z.group.getObjectByName('%s');
            r.traverse(o=>{ if(!o.isMesh) return; const mn=o.material.name; if(OLD.test(mn)) out.old.push(mn); if(/^wz_vc_/.test(mn)) out.vc[mn+(o.isInstancedMesh?'[inst]':'')]=o.castShadow;
              if(o.isInstancedMesh&&/^(wz_stain|wz_room_lit|cafe_room_dark)$/.test(mn)){ const e=out.win[mn]||(out.win[mn]={meshes:0,count:0}); e.meshes++; e.count+=o.count; } });
            return out; })()""" % GLB)
        run.check('純色零件都合成頂點色材質（門框、鋁件、鐵件、窗簾、冷氣…沒有剩下原本的單獨材質）', not vc['old'] and any(k.startswith('wz_vc_matte') for k in vc['vc']) and any(k.startswith('wz_vc_metal') for k in vc['vc']), json.dumps(vc, ensure_ascii=False))
        run.check('頂點色合併的網格（不是 instancing）會投影、instancing 的不投影', all(v == (not k.endswith('[inst]')) for k, v in vc['vc'].items()), json.dumps(vc['vc'], ensure_ascii=False))
        wn = vc['win']; st_, li_, da_ = wn.get('wz_stain', {}), wn.get('wz_room_lit', {}), wn.get('cafe_room_dark', {})
        run.check('窗戶：所有的窗共用一個窗框原型，窗內只有亮燈／沒亮燈兩個原型，扇數對得上', st_.get('meshes') == 1 and li_.get('meshes') == 1 and da_.get('meshes') == 1 and st_.get('count', 0) > 100 and st_.get('count') == li_.get('count', 0) + da_.get('count', 0), json.dumps(wn))
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.ggShop==='G07'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開 G07 的套件外觀時，會被數到', neg > 0, json.dumps(neg))
    sun = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(12); const d=E.sun.position.clone().sub(E.player.obj.position); const h=Math.hypot(d.x,d.z); const out={x:+(d.x/h).toFixed(3), z:+(d.z/h).toFixed(3), sunYaw:E.zone.def.sunYaw}; E.applyTime(17.5); return out; })()""")
    run.check('中午太陽在南邊（公館 +x＝南；sunYaw π/2）', sun['x'] > 0.9 and abs(sun['sunYaw'] - 1.5708) < 1e-3, json.dumps(sun))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'nobldg'))
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
    run.check('沒有標記的群組（捷運出口、校門、路燈、背景…）沒有多藏任何一個', res[True][2] == res[False][2], json.dumps([res[True][2], res[False][2]]))
    f, n = res[True][3], res[False][3]
    run.check('效能：每個鏡頭的 draw call ≤ ?nobldg 的 1.3 倍、三角形 ≤ 42 萬（含陰影那一輪、含玩家；LAWWW 21:21Z 的條件）',
              all(f[k]['calls'] <= 1.3 * n[k]['calls'] and f[k]['tris'] <= 420000 for k in f), json.dumps({k: [n[k]['calls'], f[k]['calls'], round(f[k]['calls'] / n[k]['calls'], 3), n[k]['tris'], f[k]['tris']] for k in f}))
    sys.exit(run.finish())


asyncio.run(main())
