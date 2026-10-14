"""路人底模的遊戲內截圖（LAWWW2，2026-10-14）：在實際遊戲裡拍共同教學館門口的人流（crowd3d.js 的 gongtong），
同一個時間、同一個鏡頭，比較原本的路人底模（AMB 4 個＋照人物資料換顏色）和加上 LAWWW2 的 7 個（?npcnew，本機試接，不 commit 到開發分支）。
用法：python3 npc_crowd_shot.py <URL（不含 ?）> <輸出資料夾> [old|new|both]
畫面是遊戲引擎即時算圖（Playwright＋SwiftShader，1280×800 桌機視窗、HUD 隱藏）；鏡頭用遊戲的演出鏡頭（E.cinematic）固定位置。"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

URL = sys.argv[1]; OUT = sys.argv[2]; WHICH = sys.argv[3] if len(sys.argv) > 3 else 'both'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
# 11/10 週一（大一上第 11 週，上課日）：13:05＝13:20 那一節開始前在門口等的人（3～6 個）；15:12＝15:10 下課後從門口出來聊天的人（2～5 個）
SHOTS = [
    {'tag': 'g1305', 'hour': 13.08},
    {'tag': 'g1512', 'hour': 15.22},
]
# 鏡頭（第 2 版：第 1 版從北邊拍，大多是背面，而且前面有樹幹）：
# wide＝門廊上方往北拍整群（FOV 66）；side＝西側平視；face＝離門口最近的兩個人，照他現在面向的方向，站在他前面 2.2 m 拍臉
CAMS = [('wide', (2, 3.2, 23.2), (2, 1.0, 17.0), 66), ('side', (-5.5, 1.75, 21.5), (2.5, 1.3, 20.0), 50)]
NEAR_JS = """(()=>{ const E=GAME.E; return E.npcs.filter(n=>Math.hypot(n.obj.position.x-2,n.obj.position.z-20.2)<9).map(n=>{ const u=n.obj.userData||{};
  return {id:n.id||'', key:u.key||null, driver:u.driver||null, x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1), pose:n.pose||null}; }); })()"""


async def one(b, url, label, s):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, device_scale_factor=1)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(url)
    for _ in range(300):
        if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
        await pg.wait_for_timeout(500)
    st = {'zone': 'campus', 'hour': s['hour'], 'day': 55, 'weekday': 1, 'weather': 'sunny', 'pos': {'x': 2, 'z': 12.5, 'yaw': 0, 'lv': 0}, 'flags': FLAGS}
    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    # 等人流排好、模型載入完（VRM 不是 pending）
    near = []
    for _ in range(240):
        await pg.wait_for_timeout(500)
        near = await pg.evaluate(NEAR_JS)
        if near and all(n['driver'] not in (None, 'pending') for n in near): break
    await pg.wait_for_timeout(2500)
    near = await pg.evaluate(NEAR_JS)
    await pg.evaluate("GAME.E.player.obj.visible=false")
    await pg.evaluate("[GAME.E.player].concat(GAME.E.npcs).forEach(n=>{ const u=n.obj&&n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })")
    await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#btnPhone{display:none!important}")
    outs = []
    async def shoot(name, p, l, fov):
        await pg.evaluate("((p,l,f)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); E.camera.fov=f; E.camera.updateProjectionMatrix(); })(%s,%s,%s)" % (json.dumps(p), json.dumps(l), fov))
        await pg.wait_for_timeout(3000)
        f = os.path.join(OUT, f"npc_{s['tag']}_{label}_{name}.png"); await pg.screenshot(path=f); outs.append(f)
    for name, p, l, fov in CAMS: await shoot(name, p, l, fov)
    faces = await pg.evaluate("""(()=>{ const E=GAME.E; const L=E.npcs.filter(n=>Math.hypot(n.obj.position.x-2,n.obj.position.z-20.2)<9).sort((a,b)=>Math.hypot(a.obj.position.x-2,a.obj.position.z-20.2)-Math.hypot(b.obj.position.x-2,b.obj.position.z-20.2)).slice(0,2);
      return L.map(n=>{ const o=n.obj.position, r=n.obj.rotation.y, u=n.obj.userData||{}; const fx=Math.sin(r), fz=Math.cos(r); return {key:u.key||null, p:[o.x+fx*2.2, 1.55, o.z+fz*2.2], l:[o.x, 1.45, o.z]}; }); })()""")
    for i, fc in enumerate(faces): await shoot(f"face{i + 1}_{(fc['key'] or 'x').split('.')[-1]}", fc['p'], fc['l'], 40)
    keys = sorted({n['key'] for n in near if n['key']})
    print(json.dumps({'label': label, 'shot': s['tag'], 'n': len(near), 'distinct_models': len(keys), 'keys': keys, 'near': near, 'errors': errs[:3], 'files': outs}, ensure_ascii=False))
    await ctx.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        for s in SHOTS:
            if WHICH in ('old', 'both'): await one(b, URL, 'old', s)
            if WHICH in ('new', 'both'): await one(b, URL + '?npcnew', 'new', s)
        await b.close()


asyncio.run(main())
