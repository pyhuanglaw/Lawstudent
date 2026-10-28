"""INTERIOR-AAA-REVIEW-1028：校內建築室內現況截圖（玩家鏡頭）。每個區域：讀檔進去（出生點）、等正式模型載入，鏡頭在玩家後方往前看＋左、右、後各一張。
[捷徑] 讀檔直接進區域（GAME.applySave）、條件事件關閉。手機橫向模擬（SwiftShader），不是 iPhone。
用法：python3 survey.py 工作樹 URL 輸出資料夾 zone1,zone2,... [hour]"""
import asyncio, json, sys, math, os
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT, ZONES = sys.argv[2], sys.argv[3], sys.argv[4].split(',')
HOUR = float(sys.argv[5]) if len(sys.argv) > 5 else 14.0
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#btnPhone,#btnSave{display:none!important}"
async def main():
    os.makedirs(OUT, exist_ok=True); info = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        for z in ZONES:
            try:
                await L.load_state(pg, {'zone': z, 'hour': HOUR, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True, quiet_phone=True)
                for i in range(80):   # 等人物、正式模型
                    ok = await pg.evaluate("(()=>{ const E=GAME.E; const all=[E.player].concat(E.npcs); return GAME.G.zone===%s&&all.every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; }); })()" % json.dumps(z))
                    if ok: break
                    await pg.wait_for_timeout(500)
                await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
                await pg.evaluate("(css=>{ let el=document.getElementById('ivCss'); if(!el){ el=document.createElement('style'); el.id='ivCss'; document.head.appendChild(el); } el.textContent=css; })(%s)" % json.dumps(HIDE))
                st = await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj, C=E.cam; return {x:+P.position.x.toFixed(2),z:+P.position.z.toFixed(2),ry:+P.rotation.y.toFixed(3),camYaw:+C.yaw.toFixed(3),pitch:+(C.pitch||0).toFixed(3),dist:+(C.dist||0).toFixed(2),calls:0}; })()")
                info[z] = {'spawn': st, 'shots': []}
                for k, (name, dy) in enumerate([('front', 0.0), ('left', math.pi / 2), ('right', -math.pi / 2), ('back', math.pi)]):
                    yaw = st['ry'] + math.pi + dy   # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側：玩家面向 ry → 鏡頭在 ry+π 那一側＝從背後往前看
                    await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c.yaw; C.manualT=999; GAME.E.player.busy=true; })(%s)" % json.dumps({'yaw': yaw}))
                    await pg.wait_for_timeout(2500)
                    r = await pg.evaluate("(()=>{ const R=GAME.E.renderer; return {calls:R.info.render.calls, tris:R.info.render.triangles}; })()")
                    f = f"{OUT}/{z}_{k}_{name}.png"; await pg.screenshot(path=f); info[z]['shots'].append({'f': os.path.basename(f), **r})
                await pg.evaluate("GAME.E.player.busy=false")
                print(z, json.dumps(info[z], ensure_ascii=False), flush=True)
            except Exception as ex:
                print(z, 'FAIL', str(ex)[:200], flush=True)
        json.dump(info, open(OUT + '/survey.json', 'w'), ensure_ascii=False, indent=1)
        print('errs', errs[:5]); await b.close()
asyncio.run(main())
