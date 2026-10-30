"""室內效能（通用版；SOCLIB-LM-1030 起，LAWWW2-B 2026-10-30；博思用 boya_perf.py）：tools/shots/interior_review/survey.py 的做法（玩家鏡頭，前、左、右、後各量一次 draw call、三角形），
站在指定的位置（spawn＝區域的出生點）。
[捷徑] 讀檔直接進區域（GAME.applySave）、條件事件關閉。手機橫向模擬（SwiftShader），不是 iPhone。
用法：python3 tools/blender/env_second/shots/interior_perf.py 工作樹 URL 輸出資料夾 區域 '名字:x,z,yaw,lv;名字:spawn;…' [hour]"""
import asyncio, json, sys, math, os
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONE = sys.argv[2], sys.argv[3], sys.argv[4]
SPOTS = []
for t in sys.argv[5].split(';'):
    n, v = t.split(':'); v = v.split(',')
    SPOTS.append((n, None if v[0] == 'spawn' else {'x': float(v[0]), 'z': float(v[1]), 'yaw': float(v[2]), 'lv': int(v[3])}))
HOUR = float(sys.argv[6]) if len(sys.argv) > 6 else 14.0
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#btnPhone,#btnSave{display:none!important}"
async def main():
    os.makedirs(OUT, exist_ok=True); info = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        for name0, pos in SPOTS:
            await L.load_state(pg, {'zone': ZONE, 'hour': HOUR, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': pos}, quiet_events=True, quiet_phone=True)
            for i in range(60):
                if await pg.evaluate("GAME.G.zone===%s&&!!GAME.E.zone&&GAME.E.zone.formal" % json.dumps(ZONE)): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            await pg.evaluate("(css=>{ let el=document.getElementById('ivCss'); if(!el){ el=document.createElement('style'); el.id='ivCss'; document.head.appendChild(el); } el.textContent=css; })(%s)" % json.dumps(HIDE))
            st = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj, Z=E.zone||{}; return {x:+P.position.x.toFixed(2),z:+P.position.z.toFixed(2),y:+P.position.y.toFixed(2),ry:+P.rotation.y.toFixed(3),formal:!!Z.formal,lm:!!(Z.formalInfo&&Z.formalInfo.lightmapped),fold:!!Z.seatFold}; })()")
            info[name0] = {'spot': st, 'shots': []}
            for k, (name, dy) in enumerate([('front', 0.0), ('left', math.pi / 2), ('right', -math.pi / 2), ('back', math.pi)]):
                yaw = st['ry'] + math.pi + dy
                await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c.yaw; C.manualT=999; GAME.E.player.busy=true; })(%s)" % json.dumps({'yaw': yaw}))
                await pg.wait_for_timeout(2500)
                r = await pg.evaluate("(()=>{ const R=GAME.E.renderer; return {calls:R.info.render.calls, tris:R.info.render.triangles}; })()")
                f = f"{OUT}/{name0}_{k}_{name}.png"; await pg.screenshot(path=f); info[name0]['shots'].append({'f': os.path.basename(f), **r})
            await pg.evaluate("GAME.E.player.busy=false")
            print(name0, json.dumps(info[name0], ensure_ascii=False), flush=True)
        json.dump(info, open(OUT + '/perf.json', 'w'), ensure_ascii=False, indent=1)
        print('errs', errs[:5]); await b.close()
asyncio.run(main())
