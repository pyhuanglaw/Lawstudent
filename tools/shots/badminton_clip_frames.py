"""BADMINTON-CLIP 第四版：照「遊戲時間」一格一格播羽球短片（頁面的時鐘換成每一格固定 1/30 秒，SwiftShader 慢也不會跳格），每 STEP 秒截一張、記錄兩個人的腳。
[捷徑] 讀檔到 1F 體育館、路人藏起來。用法：python3 badminton_clip_frames.py 工作樹 URL 輸出資料夾 [人物 id] [full 1/0] [間隔秒]"""
import asyncio, json, sys, time
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]; WHO = sys.argv[4] if len(sys.argv) > 4 else 'heroine_01'
FULL = (sys.argv[5] != '0') if len(sys.argv) > 5 else True; STEP = float(sys.argv[6]) if len(sys.argv) > 6 else 0.4
CLOCK = """(()=>{ if(window.__fake) return; const r0=window.requestAnimationFrame.bind(window); window.__fake=performance.now(); performance.now=()=>window.__fake;
  const tick=()=>{ window.__fake+=1000/30; r0(tick); }; r0(tick); window.requestAnimationFrame=f=>r0(()=>f(window.__fake)); })()"""   # rAF 的時間戳也要用假的時鐘（不然短片的 dt＝真實−假的，每一格都跳 0.25 秒）
FEET = """(()=>{ const out={}; for(const [k,e] of [['me',GAME.E.player],['her',Object.values(GAME.npc||{}).find(n=>n&&n.obj&&n.obj.userData.overlay)]]){ if(!e) continue; const u=e.obj.userData, H=u.vrm&&u.vrm.humanoid; if(!H) continue;
  const g=n=>{ const b=H.getRawBoneNode(n); if(!b) return null; const v=new THREE.Vector3(); b.getWorldPosition(v); return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]; };
  out[k]={pos:[+e.obj.position.x.toFixed(3),+e.obj.position.z.toFixed(3)],L:g('leftFoot'),R:g('rightFoot'),Lt:g('leftToes'),Rt:g('rightToes'),hip:g('hips'),feet:!!(u.overlay&&u.overlay.feet)}; } return out; })()"""
async def main():
    run = L.Run('badminton_clip_frames', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'gym', 'hour': 15.0, 'day': day, 'weather': 'sunny', 'pos': {'x': 0, 'z': 10.5, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj&&!n.charId) n.obj.visible=false; })()")
        await pg.evaluate(CLOCK)
        await pg.evaluate(f"(()=>{{ window.__clip={{t0:performance.now(),done:null}}; BADCLIP.play(GAME,{{who:'{WHO}',full:{'true' if FULL else 'false'}}}).then(r=>{{ window.__clip.done=r; }}).catch(e=>{{ window.__clip.err=String(e&&e.stack||e); }}); }})()")
        k = 0; nxt = 0.0; log = []; t_real = time.time()
        while time.time() - t_real < 1500:
            st = await pg.evaluate("(()=>({t:(performance.now()-window.__clip.t0)/1000, done:window.__clip.done, err:window.__clip.err||null}))()")
            if st['done'] is not None or st['err']: print('end', json.dumps(st)); break
            if st['t'] >= nxt:
                f = await pg.evaluate(FEET); f['t'] = round(st['t'], 2); log.append(f)
                await run.shot(pg, f't{k:03d}_{st["t"]:05.2f}'); k += 1; nxt = st['t'] + STEP
            else:
                await pg.wait_for_timeout(150)
        json.dump(log, open(OUT + '/feet_log.json', 'w'), ensure_ascii=False, indent=0)
        print('frames', k, 'errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
