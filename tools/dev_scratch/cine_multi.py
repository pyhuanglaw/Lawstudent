"""一次載入、連拍多個固定鏡頭（演出鏡頭 E.cinematic）：檢查建築、背景用。畫面是遊戲引擎即時算圖（Playwright＋SwiftShader，不是手機實機）。
比 tools/shots/scene_shot.py 快：同一個區域、同一個時間只載入一次（scene_shot 每張都重新開頁）。
用法：python3 tools/dev_scratch/cine_multi.py URL spec.json [寬=1280] [高=720]
spec.json：[{"out":"a.png","zone":"campus","hour":11,"player":[x,z],"cam":[x,y,z],"look":[x,y,z],"hidePlayer":true,"wait":2500}, ...]
（同一個 zone＋hour 連續排列，只載入一次；player 是玩家站的位置，hidePlayer 預設 true）"""
import asyncio, json, sys
from playwright.async_api import async_playwright

FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}"


async def main():
    url = sys.argv[1] + ('&' if '?' in sys.argv[1] else '?') + 'turbo'
    spec = json.load(open(sys.argv[2]))
    W = int(sys.argv[3]) if len(sys.argv) > 3 else 1280
    H = int(sys.argv[4]) if len(sys.argv) > 4 else 720
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': W, 'height': H}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(url)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.add_style_tag(content=HIDE)
        cur = None
        for s in spec:
            key = (s['zone'], s.get('hour', 11.0))
            px, pz = s.get('player', [s['cam'][0], s['cam'][2]])
            if key != cur:
                st = {'zone': s['zone'], 'hour': key[1], 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': px, 'z': pz, 'yaw': 0}, 'flags': FLAGS}
                await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st))
                await pg.wait_for_timeout(3000)
                await pg.evaluate("GAME.E.applyTime(%s)" % key[1])
                cur = key
            await pg.evaluate("(a=>{ const E=GAME.E, P=E.player; P.obj.position.set(a.x,0,a.z); P.path=null; P.target=null; P.obj.visible=!a.hide; })(%s)" % json.dumps({'x': px, 'z': pz, 'hide': s.get('hidePlayer', True)}))
            await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(s['cam']), json.dumps(s['look'])))
            await pg.wait_for_timeout(s.get('wait', 2500))
            await pg.screenshot(path=s['out'])
            print('shot', s['out'], 'errors:', errs[-3:], flush=True)
        await b.close()
    print('errors:', errs[:5])

asyncio.run(main())
