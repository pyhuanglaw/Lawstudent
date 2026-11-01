"""換區域後顯示記憶體不會一直增加（2026-10-14 使用者 iPhone 試玩 v9.6：換地點時跳回開始畫面＋「請把手機轉為橫向」，疑似 iOS Safari 記憶體到上限、網頁重新載入）。
[前置／捷徑] 讀檔到校園；換區域用 GAME.enter（這是記憶體測試，不是玩家流程：走路換區域的流程在 tests/zone_transitions.py）。
來回 校園 → 便利商店 → 校園 → 溫州街 → 校園 → 麵店 → 校園 四輪，每次回到校園記下 renderer.info.memory（幾何、貼圖）；
第 2 輪以後回到校園的數量不能比第 1 輪多太多（貼圖 +10% 以內、幾何 +10% 以內）。修正前（只釋放幾何）貼圖每一輪都多一批。
這是 Playwright 手機模擬＋SwiftShader，不是 iPhone 實機；iPhone 的記憶體上限要實機看。
用法：python3 tests/zone_memory.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/zone_memory'
MEM = "(()=>{ const r=GAME.E.renderer; const m=r&&r.info&&r.info.memory; return m?{g:m.geometries,t:m.textures,z:GAME.G.zone,last:GAME.E.lastDispose||null}:null; })()"


async def go(pg, zone, spawn=None):
    await pg.evaluate("(([z,s])=>{ void GAME.enter(z,s||undefined,{noFade:true}); })(%s)" % json.dumps([zone, spawn]))
    for _ in range(120):
        await pg.wait_for_timeout(1000)
        z = await pg.evaluate("GAME.G.zone")
        if z == zone: break
    await pg.wait_for_timeout(6000)   # 正式模型、人物載入、畫幾格
    return await pg.evaluate(MEM)


async def main():
    run = L.Run('zone_memory', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：第 5 天 15:00 校園（晨思鐘附近）')
        await L.load_state(pg, {'zone': 'campus', 'hour': 15.0, 'day': 5, 'weekday': 0, 'weather': 'clear', 'pos': {'x': -38, 'z': 6, 'yaw': 0}, 'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}})
        await pg.wait_for_timeout(8000)
        m0 = await pg.evaluate(MEM)
        run.check('renderer.info.memory 讀得到', bool(m0), json.dumps(m0))
        camp = []
        for other in ['cvs', 'wenzhou', 'noodle', 'cvs']:
            mo = await go(pg, other)
            mc = await go(pg, 'campus')
            camp.append(mc)
            run.note(f'{other} → 校園：{json.dumps(mo)} → {json.dumps(mc)}')
        g1, t1 = camp[0]['g'], camp[0]['t']
        gN, tN = camp[-1]['g'], camp[-1]['t']
        run.check('回到校園 4 次：貼圖沒有一直增加（第 4 次 ≤ 第 1 次 ×1.1）', tN <= t1 * 1.1 + 2, f'貼圖 {[c["t"] for c in camp]}')
        run.check('回到校園 4 次：幾何沒有一直增加（第 4 次 ≤ 第 1 次 ×1.1）', gN <= g1 * 1.1 + 5, f'幾何 {[c["g"] for c in camp]}')
        last = camp[-1].get('last') or {}
        run.check('離開區域時有釋放材質、貼圖（E.lastDispose）', (last.get('textures') or 0) > 0 and (last.get('materials') or 0) > 0, json.dumps(last))
        await run.shot(pg, 'campus_after_4_rounds')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()

asyncio.run(main())
