"""C13 兩個晚上場景的遊戲內截圖（LAWWW 16:00Z ②；LAWWW2，2026-10-14）：看燈光、長椅、圓桌在晚上自不自然。
[前置／捷徑] 讀檔到大一下第 11 週週四（STORY.termDay('Y1S2',11,4)）；關掉事件自動觸發（EVENTS.tick／onEnter），只拍場景、不演劇情。
A. 博雅一樓圓桌區 20:45：B5_GO＝今天（以安、小語照作息坐在圓桌，characters.js）——玩家視角（跟隨鏡頭）＋遠一點的全景（演出鏡頭）。
B. 大一女舍門口長椅 20:40：玩家站在長椅前——玩家視角＋全景。
畫面是遊戲引擎即時算圖（Playwright＋SwiftShader，桌機 1280×800 與手機橫向 844×390），不是實機。
用法：python3 c13_night_shots.py <URL> <輸出資料夾>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'zheNoodleDone': True, 'met_yu': True}
SHOTS = [
    {'tag': 'A_boya_round', 'zone': 'boya', 'hour': 20.75, 'pos': {'x': 1.2, 'z': 2.6, 'yaw': -1.5708, 'lv': 0}, 'b5': True,
     'cams': [('follow', {'yaw': -1.2, 'pitch': 0.32, 'dist': 4.2}), ('wide', ((-1.5, 2.6, 6.8), (3.6, 0.9, 2.2)))]},
    {'tag': 'B_fdorm_bench', 'zone': 'campus', 'hour': 20.67, 'pos': {'x': -93.0, 'z': 51.5, 'yaw': 0.0, 'lv': 0}, 'b5': False,
     'cams': [('follow', {'yaw': 3.14, 'pitch': 0.28, 'dist': 5.0}), ('wide', ((-86.0, 3.2, 47.0), (-93.5, 1.2, 55.5)))]},
]
NPC_JS = "GAME.E.npcs.filter(n=>n.charId).map(n=>({id:n.charId, x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1), pose:n.pose||null, seat:!!n.seat}))"


async def one(b, s, vw, vh, mobile, label):
    ctx = await b.new_context(viewport={'width': vw, 'height': vh}, device_scale_factor=1, has_touch=mobile, is_mobile=mobile)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL)
    for _ in range(300):
        if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    day = await pg.evaluate("STORY.termDay('Y1S2',11,4)")
    wd = await pg.evaluate("(d=>CALENDAR.dateOf(d).wd)(%d)" % day)
    fl = dict(FLAGS)
    if s['b5']: fl['B5_GO'] = day
    st = {'zone': s['zone'], 'hour': s['hour'], 'day': day, 'weekday': wd, 'weather': 'sunny', 'pos': s['pos'], 'flags': fl}
    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    for _ in range(120):   # 等人物模型載入
        await pg.wait_for_timeout(500)
        ok = await pg.evaluate("(()=>{ const E=GAME.E; return [E.player].concat(E.npcs).every(n=>{ const u=n.obj.userData||{}; return u.driver!=='pending'; }); })()")
        if ok: break
    await pg.wait_for_timeout(4000)
    npcs = await pg.evaluate(NPC_JS)
    await pg.evaluate("[GAME.E.player].concat(GAME.E.npcs).forEach(n=>{ const u=n.obj&&n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })")
    outs = []
    for name, cam in s['cams']:
        if mobile and name != 'follow': continue
        if name == 'follow':
            await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c.yaw; C.pitch=c.pitch; C.distTarget=c.dist; C.dist=c.dist; C.manualT=999; })(%s)" % json.dumps(cam))
        else:
            p, l = cam
            await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(p), json.dumps(l)))
        await pg.wait_for_timeout(3500)
        f = os.path.join(OUT, f"{s['tag']}_{label}_{name}.png"); await pg.screenshot(path=f); outs.append(f)
    hour = await pg.evaluate("+(GAME.G.hour%24).toFixed(2)")
    print(json.dumps({'shot': s['tag'], 'label': label, 'day': day, 'weekday': wd, 'hour': hour, 'npcs': npcs, 'errors': errs[:3], 'files': outs}, ensure_ascii=False), flush=True)
    await ctx.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for s in SHOTS:
            await one(b, s, 1280, 800, False, 'desk')
            await one(b, s, 844, 390, True, 'phone')
        await b.close()


asyncio.run(main())
