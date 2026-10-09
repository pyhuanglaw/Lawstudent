"""參考圖 07 的構圖在實際遊戲裡重現：黃昏、祐廷和沈以安並肩走在兩點半 Café 前面（Café 在畫面左邊、路往右後方延伸、夕陽從右邊照過來）。
不是合成圖：兩個人真的在走（玩家走導航路徑、同行的小安走同方向的路線），鏡頭是遊戲內的演出鏡頭定位，連拍幾張挑走路姿勢最好的一張。
用法：python3 tools/shots/integration_walk.py <URL> <輸出資料夾> [時間=17.6]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

URL = sys.argv[1]; OUT = sys.argv[2]; HOUR = float(sys.argv[3]) if len(sys.argv) > 3 else 17.6
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': False, 'lawclub': True, 'wenzhouLine': True, 'companion': 'an', 'plan': 'cafe'}
P0, C0, END_Z = (52.3, 7.0), (51.45, 7.0), -5.0         # 起點（Café 北半段）→ 往南走過 Café 門口，最後離鏡頭約 2 m；兩人間隔 0.85 m（參考圖是並肩）
CAM, LOOK = [50.9, 1.38, -6.8], [53.2, 1.42, 3.4]       # 鏡頭在 Café 南端前、看向北：Café 門面在左、溫州街巷口在右；兩人走近時是中景

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 1536, 'height': 1024}, device_scale_factor=1)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        st = {'zone': 'wenzhou', 'hour': HOUR, 'day': 8, 'weekday': 4, 'weather': 'sunny', 'pos': {'x': P0[0], 'z': P0[1], 'yaw': 3.1416}, 'flags': FLAGS}
        await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })(%s)" % json.dumps(st, ensure_ascii=False))
        await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
        for i in range(120):   # 等 VRM 載入
            ok = await pg.evaluate("(()=>{ const E=GAME.E; return [E.player].concat(E.npcs).every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; }); })()")
            if ok: break
            await pg.wait_for_timeout(500)
        info = await pg.evaluate("""(a=>{ const E=GAME.E; E.applyTime(a.h); const an=E.npcs.find(n=>n.id==='an'); if(!an) return 'NO COMPANION';
            E.npcs.forEach(n=>{ if(n!==an){ E.removeNPC(n); } }); for(const k in GAME.npc) if(GAME.npc[k]!==an) delete GAME.npc[k];
            const P=E.player; P.obj.position.set(a.p0[0],0,a.p0[1]); P.obj.rotation.y=Math.PI; an.obj.position.set(a.c0[0],0,a.c0[1]); an.obj.rotation.y=Math.PI;
            [P,an].forEach(n=>{ const u=n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } });
            E.cinematic(new THREE.Vector3(...a.cam),new THREE.Vector3(...a.look)); E.camera.position.set(...a.cam); E.cam.look=new THREE.Vector3(...a.look); E.camera.lookAt(E.cam.look);
            P.path=E.nav.path(a.p0[0],a.p0[1],a.p0[0],a.endz); an.beh='route'; an.frozen=false; an.waypoints=[[a.c0[0],a.endz]]; an.ri=-1; an.timer=0; an.walkSpeed=1.52; an.pauseAt=false; an.greet=false; an.waveT=0; an.lookAt=P.obj.position;
            return {player:[P.obj.position.x,P.obj.position.z], an:[an.obj.position.x,an.obj.position.z], path:P.path?P.path.length:0}; })(%s)""" % json.dumps({'h': HOUR, 'p0': P0, 'c0': C0, 'endz': END_Z, 'cam': CAM, 'look': LOOK}))
        print('setup', info)
        await pg.wait_for_timeout(1500)
        for k in range(12):
            pos = await pg.evaluate("(()=>{ const E=GAME.E, an=E.npcs.find(n=>n.id==='an'); return {p:[+E.player.obj.position.x.toFixed(2),+E.player.obj.position.z.toFixed(2),E.player.pose], a:an?[+an.obj.position.x.toFixed(2),+an.obj.position.z.toFixed(2),an.pose]:null}; })()")
            f = f'{OUT}/walk_{k}.png'; await pg.screenshot(path=f); print(f, pos)
            await pg.wait_for_timeout(600)
        print('errors:', errs[:3])
        await b.close()

asyncio.run(main())
