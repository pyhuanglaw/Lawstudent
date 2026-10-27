"""B08（PARK-ENTRY-B-1027）：溫州街小公園入口 B 改前改後同角度（玩家跟隨鏡頭；[捷徑] 讀檔、直接放玩家位置、路人藏起來）。
用法：python3 us_apt_closet_shots.py 工作樹 URL 輸出資料夾 [時段,...]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
HOURS = [float(h) for h in (sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] else ['15.0'])]
PI = math.pi
N, S_, E_, W_ = (PI, 0), (0, PI), (PI / 2, -PI / 2), (-PI / 2, PI / 2)   # (玩家 rotation.y, 鏡頭 yaw)
F = {'introDone': True}
# (名字, x, z, 方向, 俯角, 距離)
SPOTS = [('top', 15.5, 19.0, N, 1.25, 13.0),          # 從上面看公園西半邊：入口 B、步道、遊戲場、老樹
         ('entryB_e', 9.2, 18.1, E_, 0.40, 4.2),       # 站在入口 B 裡面往東看：步道往老樹
         ('mid_e', 13.0, 18.0, E_, 0.40, 4.2),        # 走到遊戲場南邊往東看
         ('ring_w', 22.8, 18.5, W_, 0.40, 4.2),       # 從老樹的環狀步道往西看回入口 B
         ('playground_n', 15.2, 18.2, N, 0.55, 4.6)]  # 遊戲場南邊往北看遊戲場
async def main():
    run = L.Run('b08_park', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2026-10-14')")
        for h in HOURS:
            await L.load_state(pg, {'zone': 'wenzhou', 'hour': h, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': 9.0, 'z': 18.2, 'lv': 0}}, quiet_events=True)
            for _ in range(40):
                if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
            await pg.evaluate("(()=>{ for(const n of (GAME.E.npcs||[])) if(n.obj) n.obj.visible=false; })()")
            for (nm, x, z, (ry, cy), pitch, dist) in SPOTS:
                stand = await pg.evaluate(f"GAME.E.canStand({x},{z},0.32,0)")
                await pg.evaluate(f"(()=>{{ GAME.E.hour={h}; const P=GAME.E.player.obj; P.position.x={x}; P.position.z={z}; P.rotation.y={ry}; GAME.E.cam.yaw={cy}; GAME.E.cam.pitch={pitch}; GAME.E.cam.distTarget={dist}; }})()")
                await pg.wait_for_timeout(3500)
                await run.shot(pg, f'{nm}_{int(h*10):03d}')
                print(nm, 'standable' if stand else 'NOT standable (camera only)')
        info = await pg.evaluate("(()=>{ const r=GAME.E.renderer.info.render; return {zone:GAME.E.zone&&GAME.E.zone.def&&GAME.E.zone.def.id, formal:!!(GAME.E.zone&&GAME.E.zone.formal), calls:r.calls, tris:r.triangles}; })()")
        print('last', json.dumps(info), 'errs', errs[:5]); await b.close()
    run.finish()
asyncio.run(main())
