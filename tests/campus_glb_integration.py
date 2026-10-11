"""校園地標的正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。
  LAWWW 2026-10-10 23:26Z 分派的順序：①總圖書館 bldg.campus_library（campus_library.py）②傅鐘 bldg.campus_bell（campus_bell.py）③行政大樓 ④文學院、校史館。
  新的地標加進 TAGS 就好（標記、外框、匾額、效能的檢查都照 TAGS 跑）。

比較的對象＝「改之前」：同一版遊戲、開機後把 manifest 裡這些地標的 key 拿掉再進校園（套件照舊參加整區靜態合併，和這次修改之前一模一樣；
其他正式模型（霖澤館外觀、路燈腳踏車）兩邊都有，只比地標）。不用 ?nobldg：那會連路燈、腳踏車、霖澤館一起換掉，效能數字分不出是誰的。
檢查（LAWWW 23:26Z 的條件）：
  1. 校園裡有 ckTag 的只有 TAGS 這幾個，都接上正式模型、套件外觀全部藏起來；沒有標記的東西（樹、路燈、其他建築、背景）沒有多藏任何一個。
  2. 位置、尺寸、朝向照套件：正式模型的外框和套件的外框差 ≤ 1.5 m（屋簷、簷口出挑的差別）。
  3. 導航格、鏡頭碰撞方塊、互動點和「改之前」完全相同。
  4. 匾額（總圖「總圖書館」、傅鐘石碑「傅鐘」）：石材匾額，canvas 字、貼圖比例＝板面比例。
  5. 夜間：總圖 20:30 窗戶亮、11:00 不亮；傅鐘的地燈燈罩、柱面暖光、光暈 20:30 亮、11:00 不亮，套件的光暈晚上不會跑回來（藏起來的套件光暈
     會被 TK.setNight 重新打開——這一項在沒修的版本會失敗）、夜裡才進校園（模型在晚上才載入）光暈也是亮的；20:30 路燈開著，開燈數和改之前一樣。
  6. 陰影：大面（牆、屋頂、石材）投影；窗框、窗洞、玻璃、門、燈罩、暖光片不投影。
  7. 太陽：中午在南邊（校園 x 往東、−z 往北，沒有 sunYaw）。
  8. 效能：同一個鏡頭（藏起路人與騎腳踏車的路人；含陰影那一輪、含玩家）三角形 ≤ 改之前、draw call ≤ 改之前的 1.1 倍。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到校園（GAME.applySave），關掉條件事件；直接設鏡頭位置截圖與量 draw call。
用法：python3 tests/campus_glb_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'campus_glb_integration')
# ckTag → (manifest key, 正式模型的節點名稱, 匾額板面的名稱)
TAGS = {'library': ('bldg.campus_library', 'campus_library_glb', 'PLATE_FACE_LIB'),
        'bell': ('bldg.campus_bell', 'campus_bell_glb', 'PLATE_FACE_BELL')}
WAIT_FORMAL = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.name==='%s')) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"
STATE = """(()=>{ const E=GAME.E; const r=v=>Math.round(v*100)/100;
    const col=E.colliders.map(c=>[r(c.position.x),r(c.position.y),r(c.position.z),r(c.geometry.parameters.width),r(c.geometry.parameters.height),r(c.geometry.parameters.depth)]).sort();
    const it=E.interactables.map(i=>[i.label||'',r(i.x),r(i.z),r(i.radius||0)]).sort();
    return {col, it}; })()"""
# 沒有標記的群組：數「底下沒有任何看得到的網格／sprite」的群組，正式模型和改之前必須一樣多（多了＝藏錯東西）。路燈的光暈（E.lampGlows）照時鐘開關，不算
OTHERS = """(()=>{ const z=GAME.E.zone; let n=0, empty=0; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
    for(const o of z.group.children){ if(!o.isGroup||(o.userData&&o.userData.ckTag)||/_glb$/.test(o.name)) continue; n++; let vis=false; o.traverse(m=>{ if(!vis&&(m.isMesh||m.isSprite)&&!skip.has(m)&&shown(m)) vis=true; }); if(!vis) empty++; }
    return {n, empty}; })()"""
DRAW = """(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
    const hid=E.npcs.map(n=>[n.obj,n.obj.parent]).concat((E.extras||[]).filter(x=>x.rider).map(x=>[x.obj,x.obj.parent])).filter(a=>a[1]); hid.forEach(a=>a[1].remove(a[0]));   /* 路人、騎腳踏車的路人每次的位置不同（量測雜訊）：量的時候暫時移出場景，只比場景 */
    const f0=E.frame; for(let i=0;i<240&&E.frame<f0+4;i++) await new Promise(r=>setTimeout(r,250)); const ri=E.renderer.info.render; const out={calls:ri.calls, tris:ri.triangles}; hid.forEach(a=>a[1].add(a[0])); return out; })"""
# 傅鐘的夜間：地燈燈罩、柱面暖光（加法混合）、正式模型的光暈（formalGlow）、套件的光暈（藏起來的那兩個）
BELL_NIGHT = """(h=>{ const E=GAME.E, z=E.zone, root=z.group.children.find(o=>o.name==='campus_bell_glb'); if(h!=null) E.applyTime(h); const mats={};
    root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; }); const kit=z.group.children.find(o=>o.userData&&o.userData.ckTag==='bell');
    const g=z.group.children.filter(o=>o.isSprite&&o.userData.formalGlow);
    return {lens:+(mats.ck_bell_lens?mats.ck_bell_lens.emissiveIntensity:-1).toFixed(2), wash:+(mats.ck_bell_wash?mats.ck_bell_wash.emissiveIntensity:-1).toFixed(2),
      washAdditive:!!(mats.ck_bell_wash&&mats.ck_bell_wash.blending===THREE.AdditiveBlending&&!mats.ck_bell_wash.depthWrite),
      glows:g.length, glowsOn:g.filter(s=>s.visible&&s.material.opacity>0.3).length, kitSpritesOn:kit.children.filter(o=>o.isSprite&&o.visible).length, lampsOn:!!E.lampsOn}; })"""
# 校園座標：x 往東、−z 往北；椰林大道 z=0（校門 x=−124、總圖 x=100，正面朝西：門廊前緣 x≈82.8、一樓拱廊 x 87–90）；傅鐘在 (−38,16.5)，石碑朝北
VIEWS = [('gate_avenue', (-110, 1.7, 0.5), (100, 8, 0)),     # 進校門往東看椰林大道盡頭的總圖（玩家最常看到的角度；傅鐘在右邊）
         ('avenue', (38, 1.7, 0.5), (100, 10, 0)),            # 大道後段
         ('plaza', (68, 1.7, 13), (96, 8, -3)),               # 總圖前廣場，斜看正面
         ('porch', (78, 1.7, 5.5), (88, 5.5, -1)),            # 門廊近看
         ('arcade', (88.6, 1.6, -22), (88.6, 2.4, 10)),       # 一樓拱廊裡
         ('bell_avenue', (-38, 1.7, 4), (-38, 3.0, 16.5)),    # 從大道看傅鐘（石碑那一面）
         ('bell_close', (-35.6, 1.6, 12.4), (-38, 2.8, 16.5))]  # 傅鐘近看（斜前方）


async def check(pg, run, formal):
    run.setup('讀檔到椰林大道 (74,2) 17:30，關掉條件事件' + ('' if formal else '；進校園前先把 manifest 裡地標的 key 拿掉（＝改之前）'))
    if not formal: await pg.evaluate("(()=>{ for(const k of %s) delete ASSETS.manifest[k]; })()" % json.dumps([v[0] for v in TAGS.values()]))
    await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
    if formal:
        for tag, (key, glb, _) in TAGS.items(): run.check('%s 的正式模型接上（%s）' % (tag, glb), await pg.evaluate(WAIT_FORMAL % glb))
    else:
        await pg.wait_for_timeout(3000)
        run.check('改之前：沒有載入正式模型', not await pg.evaluate("GAME.E.zone.group.children.some(o=>/^campus_.*_glb$/.test(o.name))"))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const bs=z.group.children.filter(o=>o.userData&&o.userData.ckTag); const per={};
        for(const b of bs) per[b.userData.ckTag]={formal:!!b.userData.formal, dyn:!!b.userData.dyn, kitVisible:b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length, kitMeshes:b.children.filter(o=>o.isMesh||o.isSprite).length};
        return per; })()""")
    run.check('有 ckTag 的套件建築＝%s' % ', '.join(sorted(TAGS)), sorted(info) == sorted(TAGS), json.dumps(info))
    if formal:
        run.check('都接上正式模型（userData.formal）、不參加整區靜態合併（dyn）', all(v['formal'] and v['dyn'] for v in info.values()), json.dumps(info))
        run.check('套件外觀全部藏起來', all(v['kitVisible'] == 0 and v['kitMeshes'] > 0 for v in info.values()), json.dumps(info))
    else:
        run.check('改之前：套件照舊參加整區靜態合併（不是 dyn、沒有接正式模型）', all(not v['dyn'] and not v['formal'] for v in info.values()), json.dumps(info))
    others = await pg.evaluate(OTHERS)
    lamps = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(20.5); const on=E.lampGlows.filter(l=>l.visible).length, n=E.lampGlows.length; E.applyTime(17.5); return {on, n}; })()""")
    run.check(('一般' if formal else '改之前') + '：20:30 路燈都開著', lamps['n'] > 0 and lamps['on'] == lamps['n'], json.dumps(lamps))
    if formal:
        for tag, (key, glb, plate) in TAGS.items():
            g = await pg.evaluate("""(([tag,glbName])=>{ const z=GAME.E.zone; const kit=z.group.children.find(o=>o.userData&&o.userData.ckTag===tag), glb=z.group.children.find(o=>o.name===glbName);
                z.group.updateMatrixWorld(true); const r=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>Math.round(v*100)/100);
                const bk=new THREE.Box3(), bg=new THREE.Box3(); kit.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bk.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                glb.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bg.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                return {kit:r(bk), glb:r(bg)}; })""" + "(%s)" % json.dumps([tag, glb]))
            d = max(abs(a - b) for a, b in zip(g['kit'], g['glb']))
            run.check('%s：位置、尺寸、朝向照套件（外框 x、y、z 的最小最大值差 ≤ 1.5 m）' % tag, d <= 1.5, json.dumps(g) + ' 最大差 %.2f m' % d)
            pl = await pg.evaluate("""(glbName=>{ const root=GAME.E.zone.group.children.find(o=>o.name===glbName); const at=root.getObjectByName('wz_plates_atlas'); if(!at) return null;
                const m=at.material.map, img=m&&m.image, it=at.userData.atlas.items; return {visible:at.visible, canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), n:it.length, names:it.map(i=>i.name), ratio:it.map(i=>+((i.w/i.h)/i.board).toFixed(3))}; })""" + "(%s)" % json.dumps(glb))
            run.check('%s：匾額 %s 是 canvas 字（石材匾額）、貼圖比例＝板面比例（±8%%）' % (tag, plate), bool(pl) and pl['visible'] and pl['canvas'] and pl['names'] == [plate] and all(0.92 < r < 1.08 for r in pl['ratio']), json.dumps(pl))
        shadow = await pg.evaluate("""(()=>{ const out={}; for(const o of GAME.E.zone.group.children) if(/^campus_.*_glb$/.test(o.name)) o.traverse(m=>{ if(m.isMesh) out[m.material.name]=m.castShadow; }); return out; })()""")
        run.check('陰影：大面（牆、屋頂、石材）投影；窗框、窗洞、玻璃、門、地燈燈罩、柱面暖光片不投影',
                  all(shadow.get(k) for k in ('ck_wall', 'ck_roof', 'ck_trim', 'ck_bell_stone', 'ck_bell_roof')) and not any(shadow.get(k) for k in ('ck_trim_win', 'ck_glass', 'ck_glass_lit', 'ck_frame', 'ck_door', 'ck_bell_lens', 'ck_bell_wash')), json.dumps(shadow))
        night = await pg.evaluate("""(()=>{ const E=GAME.E, root=E.zone.group.children.find(o=>o.name==='campus_library_glb'); const mats={};
            root.traverse(o=>{ if(o.isMesh) mats[o.material.name]=o.material; });
            const read=()=>({lit:+(mats.ck_glass_lit?mats.ck_glass_lit.emissiveIntensity:-1).toFixed(2), dark:+(mats.ck_glass&&mats.ck_glass.emissive?mats.ck_glass.emissiveIntensity*mats.ck_glass.emissive.getHSL({}).l:0).toFixed(2), ceil:+(mats.ck_ceiling?mats.ck_ceiling.emissiveIntensity:-1).toFixed(2)});
            E.applyTime(11); const day=read(); E.applyTime(20.5); const n2030=read(); E.applyTime(17.5); return {day, n2030, litMap:!!(mats.ck_glass_lit&&mats.ck_glass_lit.emissiveMap)}; })()""")
        run.check('總圖的窗：20:30 亮燈的窗發光、11:00 不發光；沒亮燈的窗晚上也不發光；亮燈的窗有自發光貼圖（由上往下漸暗，不是一片平的光）', night['n2030']['lit'] > 0.5 and night['day']['lit'] < 0.05 and night['n2030']['dark'] < 0.05 and night['litMap'], json.dumps(night))
        run.check('總圖的拱廊、門廊、屋簷底下的天花板：晚上比白天暗（白天的補光是陽光的反射；第一版晚上反而更亮，沒有燈的拱廊整片發亮）', 0 <= night['n2030']['ceil'] < night['day']['ceil'], json.dumps(night))
        bd = await pg.evaluate(BELL_NIGHT + '(11)'); bn = await pg.evaluate(BELL_NIGHT + '(20.5)'); await pg.evaluate('GAME.E.applyTime(17.5)')
        run.check('傅鐘的地燈燈罩、柱面暖光：20:30 發光、11:00 不發光；暖光片是加法混合（白天看不到）',
                  bn['lens'] > 1.0 and bd['lens'] < 0.05 and bn['wash'] > 0.5 and bd['wash'] < 0.05 and bn['washAdditive'], json.dumps({'11:00': bd, '20:30': bn}))
        run.check('傅鐘的光暈：兩個（GLOW_* 空節點），20:30 亮、11:00 不亮', bn['glows'] == 2 and bn['glowsOn'] == 2 and bd['glowsOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
        run.check('傅鐘：藏起來的套件光暈晚上不會跑回來（TK.setNight 會重設 visible）', bn['kitSpritesOn'] == 0 and bd['kitSpritesOn'] == 0, json.dumps({'11:00': bd, '20:30': bn}))
        neg2 = await pg.evaluate("""(()=>{ const E=GAME.E, kit=E.zone.group.children.find(o=>o.userData&&o.userData.ckTag==='bell'); const sp=kit.children.filter(o=>o.isSprite);
            const saved=sp.map(s=>[s.userData.nightO,s.userData.dayO]); sp.forEach(s=>{ s.userData.nightO=0.55; s.userData.dayO=0; });   /* 模擬沒修的版本：藏起來的套件光暈還是照時段開關 */
            E.applyTime(11); E.applyTime(20.5); const n=sp.filter(s=>s.visible).length; sp.forEach((s,i)=>{ s.userData.nightO=saved[i][0]; s.userData.dayO=saved[i][1]; }); E.applyTime(11); E.applyTime(17.5); return n; })()""")
        run.check('（自我檢查）套件光暈照舊開關的話（沒修的版本），晚上會被數到', neg2 > 0, json.dumps(neg2))
        neg = await pg.evaluate("""(()=>{ const b=GAME.E.zone.group.children.find(o=>o.userData&&o.userData.ckTag==='library'); const m=b.children.find(o=>o.isMesh); m.visible=true;
            const n=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; m.visible=false; return n; })()""")
        run.check('（自我檢查）故意打開一個套件網格時，會被數到', neg > 0, json.dumps(neg))
    # 太陽方位角（羅盤：0 北、90 東、180 南）：校園 x＝東、−z＝北 → 方位角＝atan2(x, −z)。12:00 的時段表是 150°（南偏東），判定正南 ±45°
    sun = await pg.evaluate("""(()=>{ const E=GAME.E; E.applyTime(12); const d=E.sun.position.clone().sub(E.player.obj.position); let az=Math.atan2(d.x,-d.z)*180/Math.PI; if(az<0) az+=360;
        const out={azimuth:+az.toFixed(1), sunYaw:E.zone.def&&E.zone.def.sunYaw||0}; E.applyTime(17.5); return out; })()""")
    run.check('中午太陽在南邊（方位角在正南 ±45° 內）', 135 <= sun['azimuth'] <= 225, json.dumps(sun))
    draws = {}
    for name, eye, look in VIEWS:
        draws[name] = await pg.evaluate(DRAW + '(%s,%s)' % (json.dumps(eye), json.dumps(look)))
        await run.shot(pg, name + '_' + ('formal' if formal else 'before'))
    await pg.evaluate("GAME.E.endCinematic()")
    run.note(('一般網址' if formal else '改之前') + '：同一個鏡頭（藏起路人）的 draw call／三角形 ' + json.dumps(draws))
    res = (await pg.evaluate(NAV_HASH), await pg.evaluate(STATE), others, draws, lamps)
    if formal:   # 夜裡才進校園：模型在路燈已經開著的時候才載入，光暈要直接是亮的（校園的夜間只在路燈開關時切換）
        await PL.load_state(pg, {'zone': 'campus', 'hour': 20.5, 'pos': {'x': -38, 'z': 6, 'yaw': 3.1416}}, quiet_events=True)
        ok = await pg.evaluate(WAIT_FORMAL % 'campus_bell_glb'); bl = await pg.evaluate(BELL_NIGHT + '(null)')
        run.check('夜裡（20:30）才進校園：傅鐘模型載入後光暈、地燈直接是亮的', ok and bl['lampsOn'] and bl['glowsOn'] == 2 and bl['lens'] > 1.0 and bl['kitSpritesOn'] == 0, json.dumps(bl))
        await run.shot(pg, 'bell_night_2030')
    return res


async def main():
    run = PL.Run('campus_glb_integration', OUT)
    res = {}
    async with async_playwright() as p:
        for formal in (True, False):
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(URL); run.check(('一般網址' if formal else '改之前') + '：遊戲載入', await PL.wait_loaded(pg))
            res[formal] = await check(pg, run, formal)
            run.check(('一般網址' if formal else '改之前') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    run.check('導航格：正式模型和改之前完全相同', res[True][0] == res[False][0], json.dumps([res[True][0], res[False][0]]))
    run.check('鏡頭碰撞方塊：完全相同', res[True][1]['col'] == res[False][1]['col'], '%d vs %d 個' % (len(res[True][1]['col']), len(res[False][1]['col'])))
    run.check('互動點（位置、半徑、名稱）：完全相同', res[True][1]['it'] == res[False][1]['it'], '%d vs %d 個' % (len(res[True][1]['it']), len(res[False][1]['it'])))
    run.check('沒有標記的群組（樹、路燈、其他建築、背景…）沒有多藏任何一個', res[True][2] == res[False][2], json.dumps([res[True][2], res[False][2]]))
    run.check('20:30 開著的路燈數和改之前一樣', res[True][4] == res[False][4], json.dumps([res[True][4], res[False][4]]))
    f, n = res[True][3], res[False][3]
    run.check('效能：每個鏡頭的三角形 ≤ 改之前、draw call ≤ 改之前的 1.1 倍（含陰影那一輪、含玩家；LAWWW 23:26Z 的條件）',
              all(f[k]['tris'] <= n[k]['tris'] and f[k]['calls'] <= 1.1 * n[k]['calls'] for k in f),
              json.dumps({k: {'calls': [n[k]['calls'], f[k]['calls'], round(f[k]['calls'] / n[k]['calls'], 3)], 'tris': [n[k]['tris'], f[k]['tris'], round(f[k]['tris'] / n[k]['tris'], 3)]} for k in f}))
    sys.exit(run.finish())


asyncio.run(main())
