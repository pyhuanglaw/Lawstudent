"""US-APT-CLOSET-1027：美國公寓 v3（衣物間走得進去、床→書桌→洗手間門）改前改後同角度（玩家跟隨鏡頭；[捷徑] 讀檔、直接放玩家位置、路人藏起來）。
用法：python3 us_apt_closet_shots.py 工作樹 URL 輸出資料夾 [時段,...]"""
import asyncio, json, sys, math
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
HOURS = [float(h) for h in (sys.argv[4].split(',') if len(sys.argv) > 4 and sys.argv[4] else ['15.0'])]
PI = math.pi
N, S_, E_, W_ = (PI, 0), (0, PI), (PI / 2, -PI / 2), (-PI / 2, PI / 2)   # (玩家 rotation.y, 鏡頭 yaw)
F = {'introDone': True, 'EXCHANGE_ROUTE': 'US', 'US_DEPARTED': True, 'US_ARRIVED': True}
# (名字, x, z, 方向, 俯角, 距離)
SPOTS = [('top', 2.9, 0.0, N, 1.25, 7.5),           # 從上面看整個臥室＋衣物間＋衛浴
         ('bed_desk_e', 1.9, -0.7, E_, 0.42, 3.4),  # 站在臥室西邊往東看：床、書桌、洗手間門
         ('bed_desk_se', 2.1, -2.2, (PI * 0.75, -PI * 0.25), 0.45, 3.0),   # 從床尾北邊往東南看：床→書桌→門
         ('closet_door', 2.0, 0.3, S_, 0.40, 3.0),  # 站在衣物間門口往南看進去
         ('closet_in', 1.8, 1.7, W_, 0.55, 2.2),    # 站在衣物間裡往西看吊衣桿
         ('bath_door', 4.2, 0.4, S_, 0.40, 3.0),    # 站在洗手間門口往南看：浴缸
         ('bath_in', 3.5, 1.5, S_, 0.62, 2.2)]      # 站在洗手間裡往南看浴缸
async def main():
    run = L.Run('us_apt_closet', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2028-09-14')")
        for h in HOURS:
            await L.load_state(pg, {'zone': 'us_apartment', 'hour': h, 'day': day, 'weather': 'sunny', 'flags': F, 'pos': {'x': 2.4, 'z': -1.0, 'lv': 0}}, quiet_events=True)
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
