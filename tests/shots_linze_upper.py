"""法律系館A 3F、4F 的遊戲內截圖（LINZE-34F-TABLES-1020）。[前置／捷徑] 每個鏡頭都是讀檔把人物放到那個位置、設鏡頭角度（只為了截圖；走上去、坐下的真實流程是 flow_linze_upper.py）。
每層五張：①從樓梯間進來（面向南、看窗邊）②窗邊長桌（從東往西）③西牆長桌（從東邊看）④東牆的微波爐、飲水機、販賣機 ⑤北側走廊（教室門、電梯）。
另外：⑥ 3F 午餐（12:20）同一角度晚上 19:30 ⑦ 坐在長椅上。手機模擬橫向（844×390）。"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True}
PI = math.pi
# (名字, 人物 x, z, 人物朝向, 鏡頭 yaw)：鏡頭在人物的 (sin yaw, cos yaw) 那一側
VIEWS = [('1_from_stair', None, None, 0.0, PI),
         ('2_window_tables', -0.2, 3.9, -PI / 2, PI / 2),
         ('3_west_tables', -3.6, 1.0, -PI / 2, PI / 2 - 0.35),
         ('4_east_wall', 3.6, 0.2, PI / 2, -PI / 2 + 0.3),
         ('5_corridor', -1.0, -5.0, PI / 2, -PI / 2)]


async def place(pg, x, z, ry, cyaw):
    await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; const nf=GAME.E.nav.nearestFree({x},{z})||[{x},{z}]; P.position.x=nf[0]; P.position.z=nf[1]; P.rotation.y={ry}; GAME.E.cam.yaw={cyaw}; }})()")
    await pg.wait_for_timeout(2500)


async def load(pg, zone, d, hour, sp):
    await L.load_state(pg, {'zone': zone, 'hour': hour, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}})
    for _ in range(40):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500)


async def main():
    run = L.Run('shots_linze_upper', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        for f in ('3f', '4f'):
            LL = await pg.evaluate(f"LINZE_UPPER_LAYOUTS['{f}']")
            sp = LL['stairs']['spawn']
            run.setup(f'{LL["name"]}：讀檔到樓梯間進來的位置（12:20）')
            await load(pg, 'linze_' + f, d, 12.33, sp)
            await L.close_panels(pg, cdp)
            run.check(f'{LL["name"]}：正式模型載入', await pg.evaluate("!!GAME.E.zone.formal"))
            for name, x, z, ry, cyaw in VIEWS:
                if x is None: await place(pg, sp['x'], sp['z'], ry, cyaw)
                else: run.setup(f'{LL["name"]}：[捷徑] 人物放到 ({x}, {z})、鏡頭 yaw {cyaw:.2f}'); await place(pg, x, z, ry, cyaw)
                await run.shot(pg, f'{f}_{name}')
            if f == '3f':
                run.setup('3F：[捷徑] 同一個存檔改到 19:30（晚上）')
                await load(pg, 'linze_3f', d, 19.5, sp); await L.close_panels(pg, cdp)
                await place(pg, -0.2, 3.9, -PI / 2, PI / 2); await run.shot(pg, '3f_6_window_tables_night')
                await load(pg, 'linze_3f', d, 12.33, sp); await L.close_panels(pg, cdp)
            seat = await pg.evaluate("(()=>{ const it=GAME.E.interactables.filter(i=>i.seat&&(i.label||'').startsWith('坐長椅'))[3]; if(!it) return null; return {x:it.x,z:it.z,seat:it.seat}; })()")
            if seat:
                run.setup(f'{LL["name"]}：[捷徑] 直接坐到長椅（GAME.sitAt）')
                await pg.evaluate("(()=>{ const it=GAME.E.interactables.filter(i=>i.seat&&(i.label||'').startsWith('坐長椅'))[3]; GAME.sitAt(GAME.E.player,it.seat); })()")
                await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
                await pg.evaluate("GAME.E.cam.yaw=GAME.E.player.obj.rotation.y+Math.PI*0.85")
                await pg.wait_for_timeout(2000); await run.shot(pg, f'{f}_7_sit')
                await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
