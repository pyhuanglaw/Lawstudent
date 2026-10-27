"""開門（A21）：①靜止的推門姿勢（側面、斜後方）②真的按「進入阿鳳麵店」，連續截圖看推門→變黑→進店。
[捷徑] 讀檔到公館 11:00（條件事件關閉）、直接放到麵店門口。用法：python3 door_shots.py 工作樹 URL 輸出"""
import asyncio, json, sys, time, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; ZONE = sys.argv[4] if len(sys.argv) > 4 else 'gongguan'; LABEL = sys.argv[5] if len(sys.argv) > 5 else '進入舊路書房'
async def main():
    run = L.Run('door_shots', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': ZONE, 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        await L.advance_dialogs(pg, cdp, run, lambda s: not s['busy'], max_steps=40)
        it = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(q=>q.label==="+json.dumps(LABEL)+"); if(!it) return null; const P=GAME.E.player.obj; P.position.set(it.x,P.position.y,it.z-0.9); P.rotation.y=0; GAME.E.player.path=null; for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; return [it.x,it.z,DOOR.kind(it,GAME.G.zone)]; })()")
        print('door', it, flush=True)
        for (vn, yaw, pitch, dist) in (('side', -math.pi / 2, 0.12, 3.0), ('back3q', math.pi * 0.8, 0.18, 3.2)):
            await pg.evaluate(f"(()=>{{ const P=GAME.E.player; P.obj.userData.overlay={{bones:DOOR.POSE,k:1,door:true}}; GAME.E.cam.yaw={yaw}; GAME.E.cam.pitch={pitch}; GAME.E.cam.distTarget={dist}; }})()")
            await pg.wait_for_timeout(3000); await run.shot(pg, 'pose_' + vn)
        await pg.evaluate("(()=>{ GAME.E.player.obj.userData.overlay=null; GAME.E.cam.yaw=Math.PI*0.75; GAME.E.cam.pitch=0.2; GAME.E.cam.distTarget=3.4; const P=GAME.E.player.obj; P.rotation.y=Math.PI/3; })()")
        await pg.wait_for_timeout(2500)
        s = await L.state(pg); print('interact btn', s['interact'], flush=True)
        await pg.evaluate("(()=>{ window.__dl=[]; const t0=performance.now(); const f=()=>{ const u=GAME.E.player.obj.userData; window.__dl.push([Math.round(performance.now()-t0), u.overlay?+u.overlay.k.toFixed(2):null, +GAME.E.player.obj.rotation.y.toFixed(2), +getComputedStyle(document.getElementById('fade')).opacity, GAME.G.zone]); if(performance.now()-t0<4000) requestAnimationFrame(f); }; requestAnimationFrame(f); })()")
        await L.tap(pg, cdp, '#interact')
        for k in range(6): await run.shot(pg, f'live_{k}'); await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(4000)
        dl = await pg.evaluate("window.__dl"); i0 = next((i for i, q in enumerate(dl) if q[4] != 'gongguan'), None); print('n', len(dl), 'first-new-zone', json.dumps(dl[i0 - 2:i0 + 4] if i0 else dl[-5:]), flush=True)
        s = await L.state(pg); print('after', s['zone'], s['busy'], await pg.evaluate("GAME.E.player.obj.userData.overlay"), flush=True)
        await run.shot(pg, 'after'); print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
