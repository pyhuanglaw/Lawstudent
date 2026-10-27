"""BADMINTON-CLIP-1027：實際播一次羽球短片（BADCLIP.play），每 N 秒截一張；[捷徑] 讀檔到 1F 體育館、路人藏起來。
用法：python3 badminton_clip_run.py 工作樹 URL 輸出資料夾 [人物 id] [full 1/0] [間隔秒]"""
import asyncio, json, sys, time
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; WHO = sys.argv[4] if len(sys.argv) > 4 else 'heroine_03'
FULL = (sys.argv[5] != '0') if len(sys.argv) > 5 else True; STEP = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
async def main():
    run = L.Run('badminton_clip_run', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'gym', 'hour': 15.0, 'day': day, 'weather': 'sunny', 'pos': {'x': 0, 'z': 10.5, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj&&!n.charId) n.obj.visible=false; })()")
        await pg.evaluate(f"(()=>{{ window.__clip={{t0:performance.now(),done:null}}; BADCLIP.play(GAME,{{who:'{WHO}',full:{'true' if FULL else 'false'}}}).then(r=>{{ window.__clip.done=r; window.__clip.ms=performance.now()-window.__clip.t0; }}).catch(e=>{{ window.__clip.err=String(e&&e.stack||e); }}); }})()")
        t0 = time.time(); k = 0
        while time.time() - t0 < 40:
            st = await pg.evaluate("(()=>{ const c=window.__clip, sh=GAME.E.scene.getObjectByName('badclip'); let s=null; if(sh) sh.traverse(o=>{ if(o!==sh&&!s&&o.parent===sh) s=o; }); return {done:c.done, ms:c.ms, err:c.err, t:Math.round(performance.now()-c.t0), sh:s?[+s.position.x.toFixed(2),+s.position.y.toFixed(2),+s.position.z.toFixed(2),s.visible]:null, cine:GAME.E.cam.mode}; })()")
            if st['done'] is not None or st.get('err'): print('end', json.dumps(st)); break
            await run.shot(pg, f't{k:02d}'); print(k, json.dumps(st)); k += 1
            await pg.wait_for_timeout(int(STEP * 1000))
        after = await pg.evaluate("(()=>({mode:GAME.E.cam.mode, busy:BADCLIP.busy, racket:!!GAME.E.scene.getObjectByName('badminton_racket'), overlay:!!GAME.E.player.obj.userData.overlay, pos:[+GAME.E.player.obj.position.x.toFixed(2),+GAME.E.player.obj.position.z.toFixed(2)]}))()")
        print('after', json.dumps(after)); print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
