"""路線效能巡查：一份地點清單，每個地點兩個方向量 fps（SwiftShader）、draw call、三角形，存截圖——PERF-PATROL-ECON-1025，LAWWW2-B 2026-10-25。
和實際玩的時候一樣：路人、同學照時段出現（不藏），只把劇情事件關掉（EVENTS.onEnter／tick），免得量到一半演起來。
清單（JSON list）每一項：{"name": "412", "state": {"zone": "dorm", "day": -351, "hour": 19, "stage": "econ", "pos": {"x": 0, "z": 1, "yaw": 0}}, "yaws": [1.19, 4.33]}
  - pos 不寫＝區域的出生點；yaws 不寫＝出生時鏡頭的方向和反方向。
用法（repo 根目錄開 http server）：
  python3 tools/blender/env_second/shots/perf_route.py http://127.0.0.1:8765/index.html <清單.json> <截圖資料夾> [844x390] [--samples=4]
同一台機器上同時只跑這一個瀏覽器工作，也不要同時跑 Blender（搶 CPU，數字會偏低）。"""
import asyncio, json, sys, os, math
from playwright.async_api import async_playwright
URL, LIST, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
WH = next((a for a in sys.argv[4:] if 'x' in a and not a.startswith('--')), '844x390'); W, H = map(int, WH.split('x'))
NS = int(next((a.split('=')[1] for a in sys.argv[4:] if a.startswith('--samples=')), 4))
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
STABLE = "(async()=>{ let last=-1, same=0; for(let i=0;i<40&&same<3;i++){ await new Promise(r=>setTimeout(r,2000)); const t=GAME.E.renderer.info.render.triangles; if(Math.abs(t-last)<Math.max(500,t*0.01)) same++; else same=0; last=t; } return last; })()"


async def main():
    pts = json.load(open(LIST)); os.makedirs(OUT, exist_ok=True); res = []
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
        cur = None
        for pt in pts:
            st = dict(pt['state']); fl = dict(FLAGS); fl.update(st.get('flags', {})); st['flags'] = fl
            try:
                if (st['zone'], st.get('day'), st.get('stage')) != cur:
                    await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.day=s.day||8; s.weekday=s.weekday||3; s.weather=s.weather||'sunny'; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
                    cur = (st['zone'], st.get('day'), st.get('stage'))
                await pg.evaluate("""(s=>{ const E=GAME.E, P=E.player; E.endCinematic&&E.endCinematic(); if(s.pos&&'x' in s.pos){ P.obj.position.set(s.pos.x,0,s.pos.z); P.obj.rotation.y=s.pos.yaw||0; P.path=null; if(E.setLv) E.setLv(P,s.pos.lv|0); if(E.settleY) E.settleY(P); }
                    P.busy=true; if('hour' in s){ GAME.G.hour=s.hour; E.applyTime(s.hour); } const C=E.cam; C.mode='follow'; })(%s)""" % json.dumps(st, ensure_ascii=False))
                await pg.evaluate(STABLE)
                y0 = await pg.evaluate("GAME.E.cam.yaw")
                yaws = pt.get('yaws') or [y0, y0 + math.pi]
                for k, y in enumerate(yaws):
                    await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=1e9; GAME.G.hour=%s; GAME.E.applyTime(GAME.G.hour); })(%s)" % (json.dumps(st.get('hour', 12)), y))
                    await pg.wait_for_timeout(4000); fps = []
                    for i in range(NS):
                        f0 = await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(5000); f1 = await pg.evaluate("GAME.E.frame"); fps.append(round((f1 - f0) / 5, 2))
                    info = await pg.evaluate("(()=>{ const E=GAME.E, r=E.renderer.info.render; let npc=0; (E.npcs||[]).forEach(n=>{ if(n.obj&&n.obj.visible) npc++; }); return {zone:GAME.G.zone, calls:r.calls, tris:r.triangles, npcs:npc, extras:(E.extras||[]).length, geoms:E.renderer.info.memory.geometries, tex:E.renderer.info.memory.textures}; })()")
                    shot = os.path.join(OUT, '%s_%d.png' % (pt['name'], k)); await pg.screenshot(path=shot)
                    r = dict(name=pt['name'], view=k, yaw=round(y, 2), fps=fps, avg=round(sum(fps) / len(fps), 2), errors=errs[-2:], **info); res.append(r)
                    print(json.dumps(r, ensure_ascii=False), flush=True)
            except Exception as ex:
                print('fail', pt['name'], str(ex).split('\n')[0][:200], flush=True); cur = None
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'perf_route.json'), 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
