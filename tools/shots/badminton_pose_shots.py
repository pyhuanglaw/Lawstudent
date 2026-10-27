"""BADMINTON-CLIP-1027：揮拍姿勢＋球拍掛在手上的樣子（靜態，一個姿勢一張；[捷徑] 讀檔到 1F 體育館、直接放玩家、路人藏起來）。
用法：python3 badminton_pose_shots.py 工作樹 URL 輸出資料夾 [姿勢,...]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
POSES = sys.argv[4].split(',') if len(sys.argv) > 4 else ['ready', 'back', 'hit', 'follow', 'sv0', 'sv2', 'smashHit', 'reach']
async def main():
    run = L.Run('badminton_pose', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'gym', 'hour': 15.0, 'day': day, 'weather': 'sunny', 'pos': {'x': 0.4, 'z': 7.6, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(20000); await L.close_panels(pg, cdp)
        r = await pg.evaluate("""(async()=>{ const E=GAME.E, P=E.player; for(const n of (E.npcs||[])) if(n.obj) n.obj.visible=false; P.frozen=true; P.obj.position.set(0.4,P.obj.position.y,7.6); P.obj.rotation.y=Math.PI;
          let pr={}; try{ pr=BADCLIP._props(await ASSETS.loadOne('bldg.badminton_props')); }catch(e){ return 'props '+e.message; }
          window.__rk=BADCLIP._attachRacket(P,pr.racketA); return !!window.__rk; })()""")
        print('attach', r)
        for nm in POSES:
            for (vn, yaw, pitch, dist) in (('side', -math.pi / 2, 0.12, 3.0), ('back', 0.0, 0.18, 3.2)):
                await pg.evaluate(f"(()=>{{ const P=GAME.E.player; P.obj.userData.overlay={{bones:Object.assign({{}},BADCLIP.P['{nm}']),k:1}}; GAME.E.cam.yaw={yaw}; GAME.E.cam.pitch={pitch}; GAME.E.cam.distTarget={dist}; }})()")
                await pg.wait_for_timeout(2500); await run.shot(pg, f'{nm}_{vn}')
        print('errs', errs[:3]); await b.close()
    run.finish()
asyncio.run(main())
