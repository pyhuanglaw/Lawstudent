"""總圖 B1 的下沉中庭（LIB-B1-OUTSIDE-1110，使用者 2026-11-10 X298）截圖：樓梯口、中庭底面向北（樓梯）、中庭底面向南（B1 的門），白天和晚上。
[前置／捷徑] 讀檔（GAME.applySave）把玩家放在那個位置；關掉條件事件。也檢查：站在中庭底的高度是 −4.2、門前有「進 B1」、走進去到 library_b1。
LAWWW-B 寫（BB、CC 不在，使用者選「LAWWW 排、LAWWW 判」）。用法（佇列 probe）：args <URL> <out>；LW_TESTS＝遊戲工作樹的 tests 資料夾。"""
import asyncio, json, os, sys
TESTS = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'tests')
sys.path.insert(0, TESTS)
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out_b1court'
BF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
VIEWS = [('top_mouth', {'x': 88, 'z': -40}, 1.5708), ('bottom_north', {'x': 98, 'z': -33}, 3.1416), ('bottom_south', {'x': 98, 'z': -37}, 0.0)]


async def main():
    run = L.Run('lawww_b1court_shot', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        for hour, tag in ((14.5, 'day'), (20.0, 'night')):
            for name, pos, yaw in VIEWS:
                run.setup(f'讀檔：9/26 {hour} 校園 {pos} yaw {yaw}')
                await L.load_state(pg, {'zone': 'campus', 'hour': hour, 'day': 10, 'weekday': 5, 'weather': 'sunny', 'pos': dict(pos, yaw=yaw), 'flags': BF}, quiet_events=True)
                await pg.wait_for_timeout(6000)
                y = await pg.evaluate("+GAME.E.player.obj.position.y.toFixed(2)")
                want = 0 if name == 'top_mouth' else -4.2
                run.check(f'{tag} {name}：站的高度 {want}', abs(y - want) < 0.05, str(y))
                await run.shot(pg, f'{tag}_{name}')
        await L.load_state(pg, {'zone': 'campus', 'hour': 14.5, 'day': 10, 'weekday': 5, 'weather': 'sunny', 'pos': {'x': 98, 'z': -32.2, 'yaw': 0.0}, 'flags': BF}, quiet_events=True)
        await pg.wait_for_timeout(5000)
        it = await pg.evaluate("(document.getElementById('interact')||{}).textContent||''")
        run.check('門前有「進 B1（24 小時自習室）」', '進 B1' in it, it)
        await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone") == 'library_b1': break
            await pg.wait_for_timeout(500)
        run.check('按了走進 B1（library_b1）', await pg.evaluate("GAME.G.zone") == 'library_b1')
        await pg.wait_for_timeout(3000); await run.shot(pg, 'b1_inside')
        run.check('沒有 JS 錯誤', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()


sys.exit(asyncio.run(main()))
