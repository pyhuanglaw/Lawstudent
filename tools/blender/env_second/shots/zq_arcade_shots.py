"""子晴在公館騎樓（ZQ-ARCADE-SEAT-1028，LAWWW2-B 2026-11-01）：改前（站在 linger 點、沒有筆電）、改後（坐在柱子旁的紅凳子、腿上筆電）同三個鏡頭。
before：攔截 gongguan_shops.glb（--glb= 指到開發分支原本那一份），heroine_04 站在 (16, 20.6) 面向馬路（heroine_circle.js 的 linger）。
after：伺服器上的 GLB（有凳子、插座）；heroine_04 用 GAME.sitAt 坐上 (15.6, 19.8) yaw 0，姿勢 read，開 laptop_lap（CHAR.setProp；伺服器上要先接好道具）。
讀檔到公館 22:30、直接放人物、藏玩家是 [捷徑]（作息、seatAt 那一段是 LAWWW-B 的 heroine_circle.js，這裡不靠它）。Playwright＋SwiftShader（電腦 1280×720），不是手機實機。
用法：python3 zq_arcade_shots.py <網址> <輸出資料夾> before|after [--glb=檔案]"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

URL, OUT, MODE = sys.argv[1], sys.argv[2], sys.argv[3]
OPT = dict(a[2:].split('=', 1) for a in sys.argv[4:] if a.startswith('--') and '=' in a)
os.makedirs(OUT, exist_ok=True)
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phoneBtn,#phone,#choices{display:none!important}"
VIEWS = [('arcade', [18.8, 1.75, 21.4], [15.6, 0.85, 20.0]),      # 騎樓裡從東邊走過來
         ('side', [16.9, 1.2, 20.1], [15.6, 0.7, 19.8]),          # 近拍：凳子、筆電
         ('street', [16.8, 1.7, 15.3], [15.6, 0.9, 19.8])]        # 馬路對面那一側往騎樓看


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720})
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        if OPT.get('glb'):
            gb = open(OPT['glb'], 'rb').read()
            await pg.route('**/gongguan_shops.glb*', lambda r: r.fulfill(status=200, body=gb, headers={'content-type': 'model/gltf-binary'}))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE_HUD)
        await pg.evaluate("""(async()=>{ const g=GAME.defaults('祐廷'); Object.assign(g,{zone:'gongguan',hour:22.5,day:8,weekday:4,pos:{x:18,z:21,lv:0,y:0}}); g.weather='sunny';
          document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(g); })()""")
        for i in range(160):
            if await pg.evaluate("!!GAME.E.zone.group.getObjectByName('gongguan_shops_glb')"): break
            await pg.wait_for_timeout(500)
        r = await pg.evaluate("""(m=>{ const E=GAME.E; for(const n of E.npcs) if(n.id!=='heroine_04') n.obj.visible=false; let n=GAME.npc.heroine_04; if(!n) n=GAME.spawnCharacter('heroine_04',16,20.6,{}); if(!n) return 'no npc';
          if(m==='after'){ GAME.sitAt(n,{x:15.6,z:19.8,yaw:0,lv:0}); n.pose=n.idlePose='read'; } else { n.obj.position.set(16,0,20.6); n.obj.rotation.y=Math.PI; n.pose=n.idlePose='idle'; }
          n.frozen=true; window.__zq=n; E.player.obj.visible=false; return 'ok'; })(%s)""" % json.dumps(MODE))
        print('spawn', r, flush=True)
        if MODE == 'after':
            ok = False
            for i in range(120):
                ok = await pg.evaluate("(()=>{ const n=window.__zq; return !!(n&&CHAR.setProp(n.obj,'laptop_lap',true)); })()")
                if ok: break
                await pg.wait_for_timeout(500)
            print('laptop', ok, flush=True)
        await pg.wait_for_timeout(3000)
        info = {'mode': MODE, 'shots': []}
        for (name, pos, look) in VIEWS:
            for k in range(3):   # SwiftShader 很慢：cinematic 每次都重設一次，等鏡頭到位
                await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))
                await pg.evaluate("(async()=>{ const f0=GAME.E.frame; for(let i=0;i<240&&GAME.E.frame<f0+3;i++) await new Promise(r=>setTimeout(r,250)); })()")
            st = await pg.evaluate("(()=>{ const n=window.__zq, P=n.obj.position, C=GAME.E.camera.position, r=GAME.E.renderer.info.render; return {npc:[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2)], cam:[+C.x.toFixed(2),+C.y.toFixed(2),+C.z.toFixed(2)], calls:r.calls, tris:r.triangles}; })()")
            fn = os.path.join(OUT, f'{MODE}_{name}.png'); await pg.screenshot(path=fn)
            info['shots'].append(dict(view=name, file=fn, **st)); print(name, st, flush=True)
        info['errors'] = errs; json.dump(info, open(os.path.join(OUT, MODE + '.json'), 'w'), ensure_ascii=False, indent=1)
        print('errors', errs[:3]); await b.close()

asyncio.run(main())
