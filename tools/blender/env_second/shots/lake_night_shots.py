"""醉月湖晚上（ART-ECON-3D-GAP-1021 D，LAWWW2-B 2026-11-01）：E12「長頸鹿的尾巴」11/6 17:45（經濟系那一年，那時已經天黑）、20:00 的遊戲截圖，改前改後同一個鏡頭。
不改工作目錄：Playwright 攔截 src/zones3d.js、campus_lake.glb（--zones=、--glb= 指到要比的那一份；不給就用伺服器上的）。
讀檔到 2024-11-06、經濟系那一年（G.stage='econ'）、放時段、放玩家位置是 [捷徑]；藏 NPC（路人每次不一樣）。Playwright＋SwiftShader（電腦 1280×720），不是手機實機。
用法：python3 lake_night_shots.py <網址> <輸出資料夾> <標籤> [--zones=檔案] [--glb=檔案]
輸出：<標籤>_<鏡頭>_<時刻>.png ＋ <標籤>.json（路燈開了沒、draw call、三角形）"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

URL, OUT, TAG = sys.argv[1], sys.argv[2], sys.argv[3]
OPT = dict(a[2:].split('=', 1) for a in sys.argv[4:] if a.startswith('--') and '=' in a)
os.makedirs(OUT, exist_ok=True)
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phoneBtn,#phone,#choices{display:none!important}"   # #choices：11/6 那天的出遊選單（「出發：映月湖 17:45」，讀檔直接跳到那天才會掛著）
# 鏡頭：E12 的位置 (−34.6, −97) 面向北（湖）；南岸往西北看整個湖；木棧道口看湖心亭
VIEWS = [
    ('e12', {'pos': [-34.6, 3.3, -91.6], 'look': [-36.5, 1.2, -112.0]}, True),
    ('wide', {'pos': [-22.5, 2.4, -95.2], 'look': [-42.0, 1.6, -117.0]}, False),
    ('pavilion', {'pos': [-38.6, 1.75, -99.0], 'look': [-39.0, 2.3, -111.4]}, False),
]
HOURS = [17.75, 20.0]


async def frames(pg, n):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<600&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720})
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        if OPT.get('zones'):
            body = open(OPT['zones'], 'rb').read()
            await pg.route('**/src/zones3d.js*', lambda r: r.fulfill(status=200, body=body, headers={'content-type': 'application/javascript; charset=utf-8'}))
        if OPT.get('glb'):
            gb = open(OPT['glb'], 'rb').read()
            await pg.route('**/campus_lake.glb*', lambda r: r.fulfill(status=200, body=gb, headers={'content-type': 'model/gltf-binary'}))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE_HUD)
        await pg.evaluate("""(async()=>{ const s=GAME.defaults('祐廷'); s.stage='econ'; s.day=STORY.dayOfKey('2024-11-06'); s.weekday=3; s.weather='sunny'; s.hour=17.75;
          s.zone='campus'; s.pos={x:-34.6,z:-97,yaw:Math.PI}; Object.assign(s.flags||(s.flags={}),{introDone:true,campusIntro:true});
          document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()""")
        for i in range(160):   # 等湖的正式模型載入
            if await pg.evaluate("!!GAME.E.zone.group.getObjectByName('campus_lake_glb')"): break
            await pg.wait_for_timeout(500)
        await frames(pg, 6)
        info = {'tag': TAG, 'errors': errs, 'shots': []}
        for h in HOURS:
            await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(%f)" % h)
            await frames(pg, 4)
            for (name, cam, show_player) in VIEWS:
                st = await pg.evaluate("""((c,sp)=>{ const E=GAME.E; for(const n of E.npcs) n.obj.visible=false; E.player.obj.visible=sp;
                  E.player.obj.position.set(-34.6,0,-97); E.player.obj.rotation.y=Math.PI;
                  E.cinematic(new THREE.Vector3(...c.pos),new THREE.Vector3(...c.look)); E.camera.position.set(...c.pos); E.cam.look=new THREE.Vector3(...c.look); E.camera.lookAt(E.cam.look);
                  return {lampsOn:!!E.lampsOn, lightH:E.lightH}; })(%s,%s)""" % (json.dumps(cam), 'true' if show_player else 'false'))
                await frames(pg, 3)
                ri = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls, tris:r.triangles}; })()")
                fn = os.path.join(OUT, f'{TAG}_{name}_{int(h * 100):04d}.png')
                await pg.screenshot(path=fn)
                info['shots'].append(dict(view=name, hour=h, file=fn, **st, **ri))
                print(name, h, st, ri, flush=True)
        info['errors'] = errs
        json.dump(info, open(os.path.join(OUT, TAG + '.json'), 'w'), ensure_ascii=False, indent=1)
        print('errors', errs[:3])
        await b.close()

asyncio.run(main())
