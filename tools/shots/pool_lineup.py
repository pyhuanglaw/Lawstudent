"""人物（含隨身道具）排一排截圖（NPC-POOL-ART-1028，LAWWW2-C 2026-10-28）：用遊戲真正的 CHAR.build（CHARACTERS[id].char3d.spec：底模＋props）、CHAR.animate，
在椰林大道中間排一排，換姿勢（idle、walk、sit、read）拍。[捷徑] 讀檔進校園、其他人藏起來；這是看配件掛得對不對，不是玩家流程測試。
用法：python3 tools/shots/pool_lineup.py URL 輸出資料夾 'pool_2,pool_4,...' 'idle,walk,sit,read' [front|side|back|close|each|each_side|each_back]
  人物也可以給 JSON：'[{"id":"ayi","model":"char.npc_nf3","props":[{"name":"apron","show":true},"ladle","bandage"]},"pool_13"]'
  each＝每個人各拍一張近照（鏡頭直接放到位，不等運鏡）"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
URL, OUT, POSES = sys.argv[1], sys.argv[2], sys.argv[4].split(',')
IDS = json.loads(sys.argv[3]) if sys.argv[3].startswith('[') else sys.argv[3].split(',')   # 也可以給 JSON：['pool_6', {'id':'ayi','model':'char.npc_nf3','props':[...]}]
SPECS = [x if isinstance(x, dict) else None for x in IDS]; IDS = [x['id'] if isinstance(x, dict) else x for x in IDS]
VIEW = sys.argv[5] if len(sys.argv) > 5 else 'front'
async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 1280, 'height': 640}, device_scale_factor=1)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("""(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,{zone:'campus',hour:12,pos:{x:-20,z:6,yaw:0}}); s.day=8; s.weekday=3; s.weather='sunny';
          s.flags=Object.assign(s.flags||{},{introDone:true,campusIntro:true,classDone:true,metAn:true}); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; STORY.phoneAuto=()=>{}; await GAME.applySave(s); })()""")
        await pg.wait_for_timeout(5000)
        n = len(IDS)
        pre = await pg.evaluate("""(async a=>{ const keys=[...new Set(a.ids.map((id,k)=>a.specs[k]?a.specs[k].model:CHARACTERS[id].char3d.spec.model))]; const r=await Promise.allSettled(keys.map(k=>ASSETS.loadOne(k))); return keys.map((k,i)=>k+':'+r[i].status); })(%s)""" % json.dumps({'ids': IDS, 'specs': SPECS}))
        print('preload', pre, flush=True)
        info = await pg.evaluate("""(a=>{ const E=GAME.E, X0=-20, Z0=0; for(const x of E.npcs) x.obj.visible=false; E.player.obj.visible=false; const out=[]; window.__lu=[];
          a.ids.forEach((id,k)=>{ const sp=a.specs[k]?Object.assign({sex:'f'},a.specs[k]):CHARACTERS[id].char3d.spec; const o=CHAR.build(sp); o.position.set(X0+(k-(a.ids.length-1)/2)*1.05,0,Z0); o.rotation.y=0; E.scene.add(o); window.__lu.push(o); out.push(id+' '+sp.model+' '+JSON.stringify(sp.props)); });
          window.__pose='idle'; let last=performance.now();
          const tick=()=>{ const now=performance.now(), dt=Math.min(0.05,(now-last)/1000); last=now; for(const h of window.__lu){ const cur=h; try{ CHAR.animate(cur,dt,{pose:window.__pose,speed:window.__pose==='walk'?1.4:0}); }catch(e){} } requestAnimationFrame(tick); }; requestAnimationFrame(tick);
          return out; })(%s)""" % json.dumps({'ids': IDS, 'specs': SPECS}))
        print('\n'.join(info), flush=True)
        for i in range(160):
            ok = await pg.evaluate("(()=>{ let pend=0; for(const h of window.__lu){ const d=h.userData&&h.userData.driver; if(d!=='vrm') pend++; } return pend===0; })()")
            if ok: break
            await pg.wait_for_timeout(500)
        # 換成真正的模型（C.build 先回傳 pending 的佔位、載好以後 upgrade）：照遊戲的做法換掉
        await pg.evaluate("""(()=>{ const E=GAME.E; for(let i=0;i<window.__lu.length;i++){ const h=window.__lu[i]; if(h.userData.driver!=='vrm'){ const nh=CHAR.upgrade(h); if(nh){ nh.position.copy(h.position); nh.rotation.copy(h.rotation); E.scene.remove(h); E.scene.add(nh); window.__lu[i]=nh; } } } })()""")
        await pg.wait_for_timeout(3000)
        await pg.evaluate("window.__lu.forEach(h=>{ const u=h.userData; if(u&&u.props&&u.props.thermos_bench) CHAR.setProp(h,'thermos_bench',true); })")
        dbg = await pg.evaluate("window.__lu.map(h=>({d:h.userData.driver, p:[+h.position.x.toFixed(2),+h.position.z.toFixed(2)], vis:h.visible, inScene:!!h.parent, kids:h.children.length, model:h.userData.key||null}))")
        print('dbg', json.dumps(dbg), flush=True)
        er = await pg.evaluate("""(()=>{ const out=[]; for(const h of window.__lu){ try{ CHAR.animate(h,0.016,{pose:'sit',speed:0}); out.push('ok'); }catch(e){ out.push(String(e&&e.stack||e).slice(0,400)); } } for(const h of window.__lu){ try{ CHAR.animate(h,0.016,{pose:'idle',speed:0}); }catch(e){} } return out; })()""")
        print('sitErr', json.dumps(er, ensure_ascii=False), flush=True)
        await pg.evaluate("document.getElementById('hud')&&(document.getElementById('hud').style.display='none')")
        await pg.add_style_tag(content="#hud,#hudR,#joy,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#btnPhone,#btnSave{display:none!important}")
        W = (n - 1) * 1.05 + 1.2
        X0, Z0 = -20, 0
        cams = {'front': ([X0, 1.25, Z0 + max(2.6, W * 0.95)], [X0, 0.95, Z0]), 'back': ([X0, 1.3, Z0 - max(2.6, W * 0.95)], [X0, 0.95, Z0]),
                'side': ([X0 + max(3.0, W * 1.1), 1.2, Z0 + 1.2], [X0, 0.95, Z0]), 'close': ([X0, 1.15, Z0 + 1.6], [X0, 1.0, Z0])}
        if VIEW.startswith('each'):
            side = VIEW == 'each_side'
            for pose in POSES:
                await pg.evaluate("window.__pose=%s" % json.dumps(pose)); await pg.wait_for_timeout(1500)
                for k in range(n):
                    xk = X0 + (k - (n - 1) / 2) * 1.05
                    back = VIEW == 'each_back'
                    cp, tg = ([xk + (1.25 if side else 0.0), 1.2 if back else 1.15, Z0 + (0.35 if side else (-1.25 if back else 1.25))], [xk, 1.05 if back else 1.0, Z0])
                    await pg.evaluate("(a=>{ const E=GAME.E, p=new THREE.Vector3(a[0][0],a[0][1],a[0][2]), l=new THREE.Vector3(a[1][0],a[1][1],a[1][2]); E.cinematic(p,l); if(E.camera){ E.camera.position.copy(p); } if(E.cam.look) E.cam.look.copy(l); })(%s)" % json.dumps([cp, tg]))
                    await pg.wait_for_timeout(900 if pose != 'walk' else 500)
                    await pg.screenshot(path=f'{OUT}/{pose}_{VIEW}_{IDS[k]}.png', clip={'x': 340, 'y': 0, 'width': 600, 'height': 640})
                print(pose, flush=True)
            print('errs', errs[:3]); await b.close(); return
        cp, tg = cams[VIEW]
        await pg.evaluate("(a=>{ GAME.E.cinematic(new THREE.Vector3(a[0][0],a[0][1],a[0][2]),new THREE.Vector3(a[1][0],a[1][1],a[1][2])); })(%s)" % json.dumps([cp, tg]))
        for pose in POSES:
            await pg.evaluate("window.__pose=%s" % json.dumps(pose))
            await pg.wait_for_timeout(2500 if pose != 'walk' else 1800)
            await pg.screenshot(path=f'{OUT}/{pose}_{VIEW}.png'); print(pose, flush=True)
        print('errs', errs[:3]); await b.close()
asyncio.run(main())
