"""兩點半 Café 正式模型（第二個 AI：Blender GLB）整合檢查——第二層「系統整合」測試（docs/TESTING.md），不是真實玩家流程。

檢查正式模型接進遊戲之後，「畫面以外的東西」都沒變、或照設計變了：
  溫州街（外觀 bldg.cafe_exterior）：
    1. 正式模型接上（cafeB.userData.formal），套件的 Café 外觀與門口道具藏起來；招牌／立牌／菜單板面有 canvas 字。
    2. 導航格和 ?nobldg（程序化備用版）一模一樣：外觀整合沒有動到導航（店門口、盆栽、A 字立牌的阻擋都還在）。
    3. 店門互動點「進入兩點半 Café」(54.2,0) 還在。
  咖啡廳室內（bldg.cafe_interior）：
    4. 正式模型接上（zone.formal）、程序化備用模型藏起來；會淡出的牆（WALL_*）有前後左右四面。
    5. 鏡頭在前牆外面時前牆淡出、後牆不淡出（attachRoomGLB 的牆面淡出照常運作）。
    6. 故事用到的東西沒變：8 個座位（seats[0..7] 的位置與方向）、4 個雙人桌互動點、吧檯點餐 (−2.5,−3.2)、出口 (0,5.6)。
    7. 新家具的導航：窗邊吧台、書牆、大盆栽擋住；進出門的走道、出生點走得到。和 ?nobldg 的導航一樣（備用版也放了同樣的阻擋）。
    8. 店面玻璃外的街景：白天、夜晚換不同的貼圖。
  每一項都跑一般網址與 ?nobldg 兩次，比較兩邊。
[前置／捷徑]：用遊戲自己的讀檔把玩家放到溫州街、咖啡廳（GAME.applySave），關掉條件事件；直接設鏡頭位置測牆面淡出。
用法：python3 tests/cafe_glb_integration.py http://127.0.0.1:8765/index.html
"""
import asyncio, hashlib, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
import playlib as PL

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', 'art-rebuild', 'second_ai', 'test_shots', 'cafe_glb_integration')
SEATS = [(4.5, -3.3, 0), (4.5, -1.7, 3.1416), (4.5, 0.7, 0), (4.5, 2.3, 3.1416), (0, 0.7, 0), (0, 2.3, 3.1416), (-4, 1.7, 0), (-4, 3.3, 3.1416)]   # twoTop：先 z−0.8（朝 +z）再 z+0.8（朝 −z）

WAIT_FORMAL_EXT = "(async()=>{ for(let i=0;i<240;i++){ const z=GAME.E.zone; if(z&&z.group.children.some(o=>o.userData&&o.userData.formal)) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
WAIT_FORMAL_INT = "(async()=>{ for(let i=0;i<240;i++){ if(GAME.E.zone&&GAME.E.zone.formal) return true; await new Promise(r=>setTimeout(r,250)); } return false; })()"
NAV_HASH = "(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"


async def wenzhou(pg, run, formal):
    run.setup('讀檔到溫州街 Café 前 (50.2,−0.3) 17:30，關掉條件事件')
    await PL.load_state(pg, {'zone': 'wenzhou', 'hour': 17.5, 'pos': {'x': 50.2, 'z': -0.3, 'yaw': 1.5708}}, quiet_events=True)
    ok = await pg.evaluate(WAIT_FORMAL_EXT) if formal else False
    if formal: run.check('溫州街：Café 正式模型接上', ok)
    else:
        await pg.wait_for_timeout(3000)
        has = await pg.evaluate("GAME.E.zone.group.children.some(o=>o.userData&&o.userData.formal)")
        run.check('?nobldg：溫州街沒有載入正式模型（程序化套件）', not has)
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const cafe=z.group.children.find(o=>{ const f=o.userData&&o.userData.footprint; return f&&f.w===14&&f.d===13&&Math.abs(o.position.x-55.4)<0.05; });
        if(!cafe) return {err:'no cafe'}; let root=null; cafe.traverse(o=>{ if(!root&&o.name==='cafe_exterior') root=o; });
        const kitVisible=cafe.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible&&!o.userData.formalGlow).length;
        const near=(o,x,z)=>Math.abs(o.position.x-x)<0.05&&Math.abs(o.position.z-z)<0.05;
        const props=z.group.children.filter(o=>near(o,54.4,3.6)||near(o,54.85,4.6)||near(o,54.85,-4.6)).map(o=>o.visible);
        const faces={}; if(root) root.traverse(o=>{ if(o.isMesh&&/SIGN_FACE|ABOARD_FACE|MENU_FACE/.test(o.name)) faces[o.name]=!!(o.material.map&&o.material.map.isCanvasTexture); });
        const it=GAME.E.interactables.find(i=>i.label==='進入兩點半 Café');
        return {formal:!!cafe.userData.formal, kitVisible, props, faces, door:it?[it.x,it.z]:null}; })()""")
    if formal:
        run.check('套件的 Café 外觀與光暈藏起來', info.get('kitVisible', 1) == 0, json.dumps(info.get('kitVisible')))
        run.check('套件的 A 字立牌、兩組盆栽藏起來', info.get('props') == [False, False, False], json.dumps(info.get('props')))
        f = info.get('faces', {})
        run.check('招牌、A 字立牌兩面、菜單都有 canvas 字', len(f) == 4 and all(f.values()), json.dumps(f, ensure_ascii=False))
    run.check('店門互動點 (54.2,0) 還在', info.get('door') == [54.2, 0], json.dumps(info.get('door')))
    for (x, z, name) in ((54.4, 3.6, 'A 字立牌'), (54.85, 5.4, '右側盆栽'), (54.85, -3.8, '左側盆栽'), (60, 0, 'Café 建築本體')):
        run.check(f'導航：{name} ({x},{z}) 擋住', not await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    for (x, z, name) in ((54.2, 0, '店門口'), (54.75, 2.0, '騎樓（門與立牌之間）'), (52.0, 0, '店門前的路')):
        run.check(f'導航：{name} ({x},{z}) 走得到', await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    await run.shot(pg, 'wenzhou_' + ('formal' if formal else 'nobldg'))
    return await pg.evaluate(NAV_HASH)


async def cafe(pg, run, formal):
    run.setup('讀檔到兩點半 Café 店內出生點 (0,4.6) 11:00，關掉條件事件')
    await PL.load_state(pg, {'zone': 'cafe', 'hour': 11, 'pos': {'x': 0, 'z': 4.6, 'yaw': 3.1416}}, quiet_events=True)
    ok = await pg.evaluate(WAIT_FORMAL_INT) if formal else False
    if formal: run.check('店內：正式模型接上（zone.formal）', ok)
    else:
        await pg.wait_for_timeout(3000)
        run.check('?nobldg：店內沒有載入正式模型', not await pg.evaluate("!!GAME.E.zone.formal"))
    info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const fb=z.group.children.find(o=>o.name==='fallback');
        const sides={}; for(const w of z.walls){ const d=w.userData.dir; const k=d? (Math.abs(d.x)>0.5?(d.x>0?'left':'right'):(d.z>0?'back':'front')) : '?'; sides[k]=(sides[k]||0)+1; }
        const seats=(z.seats||[]).map(s=>[+s.x.toFixed(2),+s.z.toFixed(2),+s.yaw.toFixed(4)]);
        const tables=GAME.E.interactables.filter(i=>i.cafeTable).map(i=>[i.x,i.z]); const bar=GAME.E.interactables.find(i=>i.counter==='cafe'); const exit=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou');
        return {fbVisible:fb?fb.visible:null, sides, seats, tables, bar:bar?[bar.x,bar.z]:null, exit:exit?[exit.x,exit.z]:null}; })()""")
    if formal:
        run.check('程序化備用模型藏起來', info['fbVisible'] is False, json.dumps(info['fbVisible']))
        s = info['sides']; run.check('會淡出的牆有前後左右四面（WALL_*）', all(s.get(k, 0) > 0 for k in ('front', 'back', 'left', 'right')), json.dumps(s))
    else:
        run.check('?nobldg：程序化備用模型看得到', info['fbVisible'] is True, json.dumps(info['fbVisible']))
    want = [[round(x, 2), round(z, 2), round(y, 4)] for (x, z, y) in SEATS]
    run.check('8 個座位的位置與方向不變（seats[0..7]）', info['seats'] == want, json.dumps(info['seats']))
    run.check('4 個雙人桌互動點不變', info['tables'] == [[4.5, -1.7], [4.5, 2.3], [0, 2.3], [-4, 3.3]], json.dumps(info['tables']))
    run.check('吧檯點餐 (−2.5,−3.2)、出口 (0,5.6) 不變', info['bar'] == [-2.5, -3.2] and info['exit'] == [0, 5.6], json.dumps([info['bar'], info['exit']]))
    for (x, z, name) in ((3.775, 5.56, '右段窗邊吧台'), (-3.775, 5.56, '左段窗邊吧台'), (4.1, -5.81, '書牆'), (-6.35, 0.4, '左牆大盆栽'), (6.35, -0.5, '右牆大盆栽'), (-2.5, -4.4, '吧檯')):
        run.check(f'導航：{name} ({x},{z}) 擋住', not await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    for (x, z, name) in ((0, 4.6, '出生點'), (0, 5.0, '門口走道'), (-2.5, -3.2, '點餐位置'), (2.0, 4.6, '窗邊吧台前')):   # 0.4 m 格子：z>5.2 那一排本來就是牆邊（room() 的 blockOutside）
        run.check(f'導航：{name} ({x},{z}) 走得到', await pg.evaluate(f"GAME.E.nav.free({x},{z})"))
    if formal:
        # 牆面淡出：鏡頭放在前牆外面（z=+9）→ 前牆淡出、後牆照常
        fade = await pg.evaluate("""(async()=>{ const E=GAME.E, z=E.zone; E.cinematic(new THREE.Vector3(0,2.2,9.2),new THREE.Vector3(0,1.5,0)); E.camera.position.set(0,2.2,9.2); E.cam.look=new THREE.Vector3(0,1.5,0); E.camera.lookAt(E.cam.look);
            const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));   /* 等引擎真的再畫幾格（SwiftShader 每秒 1–4 格；只等固定秒數可能一格都沒畫）*/
            const o={front:[],back:[],frames:E.frame-f0}; for(const w of z.walls){ const d=w.userData.dir; if(!d) continue; if(d.z<-0.5) o.front.push(+w.material.opacity.toFixed(2)); if(d.z>0.5) o.back.push(+w.material.opacity.toFixed(2)); } E.endCinematic(); return o; })()""")
        run.check('鏡頭在前牆外：前牆淡出', len(fade['front']) > 0 and max(fade['front']) < 0.5, json.dumps(fade))
        run.check('鏡頭在前牆外：後牆不淡出', len(fade['back']) > 0 and min(fade['back']) > 0.9, json.dumps(fade['back']))
        # 測試的自我檢查（TESTING.md 規則 3：要證明抓得到 bug）：故意把前牆的 dir 反過來（模擬 GLB 的 dir 寫錯），同一個檢查必須看得出來
        neg = await pg.evaluate("""(async()=>{ const E=GAME.E, z=E.zone; const fw=z.walls.filter(w=>w.userData.dir&&w.userData.dir.z<-0.5); for(const w of fw) w.userData.dir.z=1;
            E.cinematic(new THREE.Vector3(0,2.2,9.2),new THREE.Vector3(0,1.5,0)); E.camera.position.set(0,2.2,9.2); const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250));
            const op=fw.map(w=>+w.material.opacity.toFixed(2)); for(const w of fw) w.userData.dir.z=-1; E.endCinematic(); return op; })()""")
        run.check('（自我檢查）前牆 dir 故意弄反時，淡出檢查會失敗', len(neg) > 0 and max(neg) > 0.5, json.dumps(neg))
        sv = await pg.evaluate("""(()=>{ const E=GAME.E, z=E.zone; const v=z.group.children.find(o=>o.isMesh&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.width===15); if(!v) return null; z.applyTime(11,'sunny'); const a=v.material.map.uuid; z.applyTime(21,'sunny'); const b=v.material.map.uuid; z.applyTime(11,'sunny'); return [a!==b, !!a]; })()""")
        run.check('店面玻璃外的街景：白天和夜晚是不同的貼圖', sv == [True, True], json.dumps(sv))
    await run.shot(pg, 'cafe_' + ('formal' if formal else 'nobldg'))
    return await pg.evaluate(NAV_HASH)


async def main():
    run = PL.Run('cafe_glb_integration', OUT)
    hashes = {}
    async with async_playwright() as p:
        for formal in (True, False):
            url = URL if formal else (URL + ('&' if '?' in URL else '?') + 'nobldg')
            b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
            await pg.goto(url); run.check(('一般網址' if formal else '?nobldg') + '：遊戲載入', await PL.wait_loaded(pg))
            hashes[('wenzhou', formal)] = await wenzhou(pg, run, formal)
            hashes[('cafe', formal)] = await cafe(pg, run, formal)
            run.check(('一般網址' if formal else '?nobldg') + '：沒有 JS 錯誤', not errs, '; '.join(errs[:3]))
            await b.close()
    run.check('溫州街導航格：正式模型和程序化版完全相同', hashes[('wenzhou', True)] == hashes[('wenzhou', False)], json.dumps([hashes[('wenzhou', True)], hashes[('wenzhou', False)]]))
    run.check('店內導航格：正式模型和程序化版完全相同', hashes[('cafe', True)] == hashes[('cafe', False)], json.dumps([hashes[('cafe', True)], hashes[('cafe', False)]]))
    sys.exit(run.finish())


asyncio.run(main())
