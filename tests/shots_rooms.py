"""室內房間的遊戲內截圖（萬才館研討室 A、霖澤館 202、萬才館多功能教室；LAWWW2-C 2026-10-20）。
[前置／捷徑] 每個鏡頭都是讀檔把人物放到那個位置、設鏡頭角度（只為了截圖；走進去、坐下的真實流程是 flow_wancai_sema.py 等）。手機模擬橫向（844×390）。
用法：python3 tests/shots_rooms.py URL 輸出資料夾 區域[,區域…]"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]; ZS = sys.argv[3].split(',')
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True}
PI = math.pi
# 名字, 人物 x, z（None＝出生點）, 人物朝向, 鏡頭 yaw（鏡頭在人物的 (sin yaw, cos yaw) 那一側）
VIEWS = {
    'wancai_sema': [('1_from_door', None, None, 0.0, PI), ('2_to_board', 3.4, 0.0, -PI / 2, PI / 2), ('3_to_wall_chairs', 0.0, 2.4, PI, 0.0), ('4_bookcase', 2.9, 1.6, PI / 2, -PI / 2)],
    'linze_202': [('1_from_door', None, None, 0.0, PI), ('2_to_board', 5.2, 0.0, -PI / 2, PI / 2), ('3_from_front', -4.8, 2.0, PI / 2, -PI / 2), ('4_aisle', 3.6, 0.0, -PI / 2, PI / 2 - 0.5)],
    'wancai_multi': [('1_from_door', None, None, 0.0, PI), ('2_to_board', 4.6, 0.0, -PI / 2, PI / 2), ('3_from_front', -4.4, 2.0, PI / 2, -PI / 2)],
}


async def place(pg, x, z, ry, cyaw):
    await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; const nf=GAME.E.nav.nearestFree({x},{z})||[{x},{z}]; P.position.x=nf[0]; P.position.z=nf[1]; P.rotation.y={ry}; GAME.E.cam.yaw={cyaw}; }})()")
    await pg.wait_for_timeout(2500)


async def load(pg, zone, d, hour, sp):
    await L.load_state(pg, {'zone': zone, 'hour': hour, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}}, quiet_events=True)
    for _ in range(40):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(2500)


async def main():
    run = L.Run('shots_rooms', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        for z in ZS:
            sp = await pg.evaluate(f"(()=>{{ const t=typeof ROOM_GLB_LAYOUTS!=='undefined'&&ROOM_GLB_LAYOUTS[{json.dumps(z)}]; return t?t.spawn:null; }})()")
            run.setup(f'{z}：讀檔到門口進來的位置（9/9 週二 12:20）')
            await load(pg, z, d, 12.33, sp); await L.close_panels(pg, cdp)
            run.check(f'{z}：正式模型載入', await pg.evaluate("!!GAME.E.zone.formal"))
            for name, x, zz, ry, cyaw in VIEWS[z]:
                if x is None: await place(pg, sp['x'], sp['z'], ry, cyaw)
                else: run.setup(f'{z}：[捷徑] 人物放到 ({x}, {zz})、鏡頭 yaw {cyaw:.2f}'); await place(pg, x, zz, ry, cyaw)
                await run.shot(pg, f'{z}_{name}')
            run.setup(f'{z}：[捷徑] 直接坐到一個座位（GAME.sitAt）')
            await pg.evaluate("(()=>{ const it=GAME.E.interactables.filter(i=>i.seat&&(i.label||'')==='坐下')[2]; GAME.sitAt(GAME.E.player,it.seat); })()")
            await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
            await pg.evaluate("GAME.E.cam.yaw=GAME.E.player.obj.rotation.y+Math.PI*0.8"); await pg.wait_for_timeout(2000); await run.shot(pg, f'{z}_5_sit')
            await L.joystick(pg, cdp, 0, 40, 900); await pg.wait_for_timeout(1500)
            run.setup(f'{z}：[捷徑] 同一個存檔改到 19:30（晚上）')
            await load(pg, z, d, 19.5, sp); await L.close_panels(pg, cdp); await place(pg, sp['x'], sp['z'], 0.0, PI); await run.shot(pg, f'{z}_6_night')
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
