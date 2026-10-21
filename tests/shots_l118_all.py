"""118 巷九間店的遊戲內截圖（LANE118-SHOPS-1020）。[前置／捷徑] 每間店直接讀檔到店裡（只為了截圖；走進去的真實流程是 flow_l118_shops.py）。
每間兩張：①進門站的位置（面向店裡）②[捷徑] 人物放到店中間、面向店門（看店員、門外的巷子）。手機模擬橫向。"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
IDS = (__import__('os').environ.get('L118_IDS') or 'dian,self,tea,home,cafe2,pasta,korea,omu,noodle2').split(',')
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True}
async def main():
    run = L.Run('shots_l118_all', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        d = await pg.evaluate("STORY.dayOfKey('2025-09-09')")
        for sid in IDS:
            LL = await pg.evaluate(f"L118_SHOP_LAYOUTS.{sid}")
            sp = LL['spawn']
            run.setup(f'{LL["name"]}：讀檔到店裡的進門位置（12:20）')
            await L.load_state(pg, {'zone': 'l118_' + sid, 'hour': 12.33, 'day': d, 'weekday': 2, 'weather': 'sunny', 'stage': 'law', 'money': 3000, 'flags': BASE, 'pos': {'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw']}})
            for _ in range(40):
                if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
                await pg.wait_for_timeout(1000)
            await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
            info = await pg.evaluate("({formal:!!GAME.E.zone.formal, clerk:GAME.E.npcs.filter(n=>n.clerk).length, zone:GAME.G.zone})")
            run.check(f'{LL["name"]}：正式模型載入、店員 1 位', info['formal'] and info['clerk'] == 1, json.dumps(info))
            await run.shot(pg, f'{sid}_1_door')
            B = LL['bounds']; cx = LL['door']['x'] * 0.3; cz = (B['z0'] + B['z1']) / 2 + 0.6
            await pg.evaluate(f"(()=>{{ const P=GAME.E.player.obj; const nf=GAME.E.nav.nearestFree({cx},{cz})||[{cx},{cz}]; P.position.x=nf[0]; P.position.z=nf[1]; P.rotation.y=0; GAME.E.cam.yaw=Math.PI; }})()")
            await pg.wait_for_timeout(2500); await run.shot(pg, f'{sid}_2_mid')
        run.check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
