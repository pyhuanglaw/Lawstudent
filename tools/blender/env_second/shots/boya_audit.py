"""博雅教學館室內檢查（ChatGPT 審查第 2、3 點：101 大講堂的比例、自習小桌）：在 LAWWW 開發分支的乾淨 checkout 上拍實際遊戲畫面＋記 draw call／三角形。
不改遊戲檔案。進博雅用讀檔（[前置／捷徑]：和 tests/flow_boya_interior.py 一樣）；演講的人群用測試活動（[前置／捷徑]：遊戲裡的活動清單是空的）。
兩個畫面：分析用 1280×720（不顯示 HUD、玩家藏起來）；玩家實際看到的手機橫向 844×390（有 HUD、跟隨鏡頭）。
用法：python3 tools/blender/env_second/shots/boya_audit.py <URL> <輸出資料夾>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
HIDE_HUD = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#nextClass{display:none!important}"
URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
INFO = "(()=>{ const r=GAME.E.renderer.info.render; return {calls:r.calls,tris:r.triangles,npcs:GAME.E.npcs.length}; })()"

# 分析鏡頭：[名稱, 鏡頭位置, 注視點, 說明]（區域座標：入口在南牆 +z；101 在西邊 x -16.9..-6.0、講台在南端）
VIEWS = [
    ('b101_back', [-11.4, 4.2, -8.4], [-11.4, 1.0, 7.0], '101 最後一排後面往講台看'),
    ('b101_stage', [-9.0, 2.4, 8.2], [-11.8, 1.4, -6.0], '從講台往座位看'),
    ('b101_seat', [-11.3, 2.25, -0.55], [-11.3, 1.4, 8.0], '坐在第 3 排中間的視線高度（約 1.2 m）'),
    ('b101_side', [-6.6, 3.6, -7.8], [-13.5, 0.6, 5.0], '從後門角落斜看整間'),
    ('lobby_eye', [3.4, 1.6, 8.0], [-4.0, 0.9, -2.0], '大廳入口往西北看：自習小桌、沙發區'),
    ('lobby_study', [-2.6, 1.7, 3.6], [-5.6, 0.8, -1.2], '自習小桌近看'),
    ('lobby_top', [0.0, 4.0, 8.4], [-0.5, 0.0, -2.0], '大廳高處：三處公共空間（沙發、自習小桌、討論桌）'),
    ('lobby_disc', [-1.0, 1.7, 5.6], [4.0, 0.8, 1.5], '討論桌'),
]


async def frames(pg, n=6):
    await pg.evaluate("(async n=>{ const f0=GAME.E.frame; for(let i=0;i<480&&GAME.E.frame<f0+n;i++) await new Promise(r=>setTimeout(r,250)); })(%d)" % n)


async def wait_models(pg):
    for i in range(160):
        ok = await pg.evaluate("(()=>{ const E=GAME.E; return [E.player].concat(E.npcs).every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; }); })()")
        if ok: return True
        await pg.wait_for_timeout(500)
    return False


async def load(pg, pos, hour=10.0):
    st = {'zone': 'boya', 'hour': hour, 'day': 3, 'weekday': 5, 'weather': 'sunny', 'pos': pos, 'flags': FLAGS}
    await pg.evaluate("(async(st)=>{ const s=GAME.defaults('祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })(" + json.dumps(st) + ")")
    await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
    await wait_models(pg); await pg.wait_for_timeout(2500); await frames(pg, 8)


async def lecture(pg, n):
    """[前置／捷徑] 測試演講（博雅 101、現在開始、兩小時、crowd.n=n）→ CLS.syncRooms 讓聽眾坐下"""
    await pg.evaluate("(n=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); const h=G.hour%%24; ACTIVITIES.list=ACTIVITIES.list.filter(a=>a.id!=='t_audit_lec'); ACTIVITIES.list.push({id:'t_audit_lec',title:'測試演講（檢查用）',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',dates:[d.key],t0:h-0.1,t1:h+2,crowd:{n:n}}); CLS.syncRooms(GAME,{instant:true}); })(%d)" % n)
    await wait_models(pg); await pg.wait_for_timeout(2000); await frames(pg, 8)


async def cine(pg, name, pos, look, log, hud=False):
    await pg.evaluate("(css=>{ let el=document.getElementById('auditCss'); if(!el){ el=document.createElement('style'); el.id='auditCss'; document.head.appendChild(el); } el.textContent=css; })(%s)" % json.dumps('' if hud else HIDE_HUD))
    await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(pos), json.dumps(look)))
    await pg.wait_for_timeout(1500); await frames(pg, 6)
    info = await pg.evaluate(INFO); p = f'{OUT}/{name}.png'; await pg.screenshot(path=p)
    log.write(f'post {p} {json.dumps(info)}\n'); log.flush(); print(name, info, flush=True)


async def main():
    log = open(f'{OUT}/audit.log', 'a', encoding='utf8')
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=ARGS)
        # ---------- 分析鏡頭 1280×720 ----------
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await load(pg, {'x': 0, 'z': 6.8, 'yaw': 3.14, 'lv': 0})
        await pg.evaluate("GAME.E.player.obj.visible=false")
        lay = await pg.evaluate("(()=>{ const L=GAME.E.zone.layout; const r=L.rooms.find(q=>q.id==='101'); const seats=GAME.E.zone.seats; const k={}; for(const s of seats){ const key=s.room+':'+s.kind; k[key]=(k[key]||0)+1; } return {W:L.W,D:L.D,r101:{x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,rows:r.rows,rowDepth:r.rowDepth,rise:r.rise,stageEdge:r.stageEdge,seats:r.seats.length}, seatCount:k}; })()")
        log.write('layout ' + json.dumps(lay, ensure_ascii=False) + '\n'); print(lay, flush=True)
        for name, pos, look, _ in VIEWS: await cine(pg, 'empty_' + name, pos, look, log)
        await lecture(pg, 16)
        cnt = await pg.evaluate("GAME.E.npcs.filter(n=>n.clsStudent).length")
        log.write(f'crowd seated {cnt}\n'); print('crowd', cnt, flush=True)
        for name, pos, look, _ in VIEWS[:4]: await cine(pg, 'lecture_' + name, pos, look, log)
        log.write('errors ' + json.dumps(errs[:5], ensure_ascii=False) + '\n')
        await ctx.close()
        # ---------- 手機橫向 844×390：玩家實際看到的（跟隨鏡頭、有 HUD）----------
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        for name, pos in (('m_lobby', {'x': 0, 'z': 6.8, 'yaw': 3.14, 'lv': 0}), ('m_study', {'x': -3.6, 'z': 1.6, 'yaw': 1.2, 'lv': 0}), ('m_101_door', {'x': -5.2, 'z': 6.0, 'yaw': 1.5708, 'lv': 0})):
            await load(pg, pos)
            await pg.evaluate("document.getElementById('auditCss')&&document.getElementById('auditCss').remove()")
            info = await pg.evaluate(INFO); pth = f'{OUT}/{name}.png'; await pg.screenshot(path=pth)
            log.write(f'post {pth} {json.dumps(info)}\n'); log.flush(); print(name, info, flush=True)
        log.write('errors_mobile ' + json.dumps(errs[:5], ensure_ascii=False) + '\n')
        await b.close()
    log.close()


asyncio.run(main())
