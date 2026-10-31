"""穿堂前的柱子擋住跟隨鏡頭（BUG-CAM-PILLAR-LAWA-1031；LAWWW2-B 2026-10-31）：站在系館門口、跟隨鏡頭從背後看，截圖＋記錄鏡頭位置、玩家在畫面上被遮住多少。
BB-B 的重現：2029-04-27 17:25，校園 (34,−99) 走到 A館門口 (34,−106.5)；鏡頭 follow、yaw 0（從南往北看），穩定在 (34.18,3.84,−100.4)。
「遮住多少」：把玩家藏起來再拍一張，兩張在玩家外框裡差多少像素（差越多＝玩家越看得到）。
[捷徑] 讀檔直接放到位置、條件事件關閉、路人拿掉。手機橫向模擬（SwiftShader），不是 iPhone。
用法：python3 tools/blender/env_second/shots/cam_pillar_probe.py 工作樹 URL 輸出資料夾 '名字:x,z,鏡頭yaw;…' [日期 2029-04-27] [時間 17.42]"""
import asyncio, json, sys, os
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
SPOTS = []
for t in sys.argv[4].split(';'):
    n, v = t.split(':'); v = [float(a) for a in v.split(',')]; SPOTS.append((n, v[0], v[1], v[2]))
DATE = sys.argv[5] if len(sys.argv) > 5 else '2029-04-27'
HOUR = float(sys.argv[6]) if len(sys.argv) > 6 else 17.42
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#btnPhone,#btnSave{display:none!important}"
async def main():
    os.makedirs(OUT, exist_ok=True); info = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(DATE))
        for name, x, z, cy in SPOTS:
            await L.load_state(pg, {'zone': 'campus', 'hour': HOUR, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': {'x': x, 'z': z, 'yaw': 3.1416, 'lv': 0}}, quiet_events=True, quiet_phone=True)
            for i in range(60):
                if await pg.evaluate("GAME.G.zone==='campus'&&!!GAME.E.zone"): break
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            await pg.evaluate("(css=>{ let el=document.getElementById('ivCss'); if(!el){ el=document.createElement('style'); el.id='ivCss'; document.head.appendChild(el); } el.textContent=css; })(%s)" % json.dumps(HIDE))
            await pg.evaluate("GAME.E.npcs.slice().forEach(n=>{ n.obj.visible=false; if(n.obj.parent) n.obj.parent.remove(n.obj); }); (GAME.E.extras||[]).forEach(x=>{ if(x.rider&&x.obj.parent) x.obj.parent.remove(x.obj); })")
            await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c; C.manualT=999; GAME.E.player.busy=true; })(%s)" % json.dumps(cy))
            await pg.wait_for_timeout(3000)
            st = await pg.evaluate("""(()=>{ const E=GAME.E, P=E.player.obj.position, c=E.camera.position, V=new THREE.Vector3(); const R=E.renderer, S=new THREE.Vector2(); R.getDrawingBufferSize(S);
              const pr=(y)=>{ V.set(P.x,P.y+y,P.z).project(E.camera); return [(V.x*0.5+0.5), (1-(V.y*0.5+0.5))]; }; const t=pr(1.75), f=pr(0.05);
              return {player:[+P.x.toFixed(2),+P.y.toFixed(2),+P.z.toFixed(2)], cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], dist:+c.distanceTo(P).toFixed(2), box:[t[0],t[1],f[1]], formal:!!(E.zone&&E.zone.group)}; })()""")
            f1 = f"{OUT}/{name}.png"; await pg.screenshot(path=f1)
            await pg.evaluate("GAME.E.player.obj.visible=false"); await pg.wait_for_timeout(1200)
            f0 = f"{OUT}/{name}_noplayer.png"; await pg.screenshot(path=f0)
            await pg.evaluate("GAME.E.player.obj.visible=true; GAME.E.player.busy=false")
            info[name] = st; print(name, json.dumps(st), flush=True)
        json.dump(info, open(OUT + '/probe.json', 'w'), ensure_ascii=False, indent=1)
        print('errs', errs[:5]); await b.close()
asyncio.run(main())
# 遮住多少：python3 這支腳本旁邊的 cam_pillar_visible.py 輸出資料夾
