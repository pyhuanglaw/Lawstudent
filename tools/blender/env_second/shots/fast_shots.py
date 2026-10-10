"""實際遊戲截圖（和 tools/shots/scene_shot.py 同一種 JSON），但同一種畫面大小只載入一次遊戲、連拍多張（SwiftShader 每次載入要一兩分鐘）。
同一個區域內換鏡頭只改：時段（GAME.G.hour＋E.applyTime）、玩家位置、鏡頭；換區域才重新讀檔（GAME.applySave）。
支援的欄位：out、w、h、mobile、hud、hidePlayer、hideNPCs、state{zone,hour,pos,flags}、cam{pos,look}|{yaw,pitch,dist}、js、wait（毫秒，另外至少等引擎畫 6 格）。
不支援 scene_shot 的 companion／player／spawn／walk（要拍人物站位時用 scene_shot.py）。
用法：python3 tools/blender/env_second/shots/fast_shots.py <URL> <shots.json>"""
import asyncio, json, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def main():
    url = sys.argv[1]; shots = json.load(open(sys.argv[2]))
    groups = {}
    for s in shots: groups.setdefault((s.get('w', 1536), s.get('h', 1024), bool(s.get('mobile'))), []).append(s)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for (w, h, mobile), L in groups.items():
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, has_touch=mobile, is_mobile=mobile, user_agent=UA if mobile else None)
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(url)
            for i in range(240):
                if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            zone = None
            for s in sorted(L, key=lambda s: s['state']['zone']):
                st = dict(s['state']); fl = dict(FLAGS); fl.update(st.get('flags', {})); st['flags'] = fl
                if st['zone'] != zone:
                    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.day=s.day||8; s.weekday=s.weekday||6; s.weather=s.weather||'sunny'; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
                    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
                    for i in range(120):
                        ok = await pg.evaluate("(()=>{ const E=GAME.E; const all=[E.player].concat(E.npcs); return all.every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; }); })()")
                        if ok: break
                        await pg.wait_for_timeout(500)
                    zone = st['zone']
                pos = st.get('pos', {})
                await pg.evaluate("""(s=>{ const E=GAME.E, P=E.player; E.endCinematic&&E.endCinematic(); if(s.pos&&'x' in s.pos){ P.obj.position.set(s.pos.x,0,s.pos.z); P.obj.rotation.y=s.pos.yaw||0; P.path=null; }
                    if('hour' in s){ GAME.G.hour=s.hour; E.applyTime(s.hour); } })(%s)""" % json.dumps(st, ensure_ascii=False))
                await pg.evaluate("(h=>{ GAME.E.player.obj.visible=!h; })(%s)" % ('true' if s.get('hidePlayer') else 'false'))
                if s.get('hideNPCs'): await pg.evaluate("GAME.E.npcs.slice().forEach(n=>{ n.obj.visible=false; })")
                await pg.evaluate("(css=>{ let el=document.getElementById('fastShotsCss'); if(!el){ el=document.createElement('style'); el.id='fastShotsCss'; document.head.appendChild(el); } el.textContent=css; })(%s)" % json.dumps('' if s.get('hud') else HIDE_HUD))
                if s.get('js'): await pg.evaluate(s['js'])
                await pg.evaluate("[GAME.E.player].concat(GAME.E.npcs).forEach(n=>{ const u=n.obj&&n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })")
                cam = s.get('cam', {})
                if 'pos' in cam:
                    await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(cam['pos']), json.dumps(cam['look'])))
                elif cam:
                    await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c.yaw; C.pitch=c.pitch; C.distTarget=c.dist; C.dist=c.dist; C.manualT=999; })(%s)" % json.dumps(cam))
                if 'hour' in st: await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(%s)" % st['hour'])
                await pg.wait_for_timeout(min(s.get('wait', 3000), 2500)); await frames(pg, 6)
                if 'hour' in st: await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(%s)" % st['hour'])
                await frames(pg, 2)
                info = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position, C=E.camera.position; return {zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2), player:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+C.x.toFixed(2),+C.y.toFixed(2),+C.z.toFixed(2)], mode:E.cam.mode}; })()")
                await pg.screenshot(path=s['out']); print('shot', s['out'], info, 'errors:', errs[:3], flush=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
