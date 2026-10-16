"""真實玩家流程：總圖新生導覽（AA_134 第 2 節；使用者 2026-10-15「開始到結束就是一個按鈕？」）。不用 ?turbo。
[前置／捷徑] 讀檔：2025-09-19（週五）15:20 總圖大廳的集合點旁；第一、二天主線已過、關掉條件事件。
A. 按集合點 →「參加：總圖新生導覽」→ 館員（NPC）出現、說第一站 → 玩家自己點地面跟著館員走（一樓閘門、服務台 → 大樓梯上二樓 → 研究小間 → 樓梯間）
   → 跟著上三樓閱覽區（換區域）→ 最後一站「以上。法律的書在四樓以上……」→ 記為參加完（full）。七站的話都出現過。
B. 中途離開：重新讀檔、參加後直接走出總圖大門 → 記「去過但沒走完」（partial），清單不打勾。
Playwright 手機模擬＋SwiftShader，不是 iPhone 實機。用法：python3 tests/flow_lib_tour.py URL [輸出資料夾]"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/flow_lib_tour'
DAY = 3   # 2025-09-19 週五
PRE = {'zone': 'library_hall', 'hour': 15.33, 'day': DAY, 'weekday': 5, 'weather': 'clear', 'pos': {'x': -2.0, 'z': 3.6, 'lv': 0, 'yaw': 3.14},
       'flags': {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'plan': 'cafe'}}
LIB = "(()=>{ const n=GAME.E.npcs.find(n=>n.name==='館員'); return n?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),lv:n.lv|0}:null; })()"
CAP = "(()=>{ const el=document.getElementById('caption'); return el&&!el.classList.contains('hide')?el.textContent:''; })()"
ST = "(()=>ACTIVITIES.stateOf(GAME.G,'lib_tour_y1s1',GAME.G.day))()"
LINES = ['新生導覽，十五分鐘', '進出都要刷學生證', '借書、還書、預約研究小間', '二樓的長桌不用預約', '研究小間要上網預約', '三樓比較安靜', '以上。法律的書在四樓以上']

async def join(pg, cdp, run):
    await L.load_state(pg, PRE, quiet_events=True); await pg.wait_for_timeout(5000)
    it = await L.find_it(pg, '新生導覽集合點')
    ok = bool(it) and await L.go_to(pg, cdp, run, it['x'], it['z'], 0.8, '集合點')
    s = await L.state(pg)
    run.check('走到集合點、出現「新生導覽集合點」', ok and '集合點' in s['interact'], s['interact'])
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    c = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent)")
    run.check('選項「參加：總圖新生導覽」', bool(c) and c[0].startswith('參加：總圖新生導覽'), json.dumps(c, ensure_ascii=False))
    await L.tap(pg, cdp, '#choices button:nth-child(1)')

async def main():
    run = L.Run('flow_lib_tour', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：2025-09-19（週五）15:20 總圖大廳集合點旁；關掉條件事件')
        await join(pg, cdp, run)
        seen, t0, zones = [], time.time(), set()
        while time.time() - t0 < 1500:
            cap = await pg.evaluate(CAP)
            for i, l in enumerate(LINES):
                if l in cap and i not in seen: seen.append(i); await run.shot(pg, f'A_stop{i}')
            st = await pg.evaluate(ST); zones.add(await pg.evaluate("GAME.G.zone"))
            if st == 'full': break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
            lib = await pg.evaluate(LIB)
            if lib:
                d = await pg.evaluate("(l=>{ const P=GAME.E.player; return (P.lv|0)!==l.lv?99:Math.hypot(P.obj.position.x-l.x,P.obj.position.z-l.z); })(%s)" % json.dumps(lib))
                if d > 2.5: await L.go_to(pg, cdp, run, lib['x'], lib['z'], 1.8, '跟著館員', max_s=60, lv=lib['lv'])
            await pg.wait_for_timeout(1200)
        st = await pg.evaluate(ST)
        run.check('A 七站的話依序都出現（館員說）', seen == list(range(7)), json.dumps(seen))
        run.check('A 跟著館員從總圖大廳走到三樓閱覽區（換區域）', 'library' in zones and 'library_hall' in zones, json.dumps(sorted(zones)))
        run.check('A 走完：記為參加完（full）', st == 'full', str(st))
        # B 中途離開
        run.setup('重新讀同一個前置存檔')
        await join(pg, cdp, run); await pg.wait_for_timeout(3000)
        ok = await L.go_to(pg, cdp, run, 0, 8.0, 0.6, '大門')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone") != 'library_hall': break
            s = await L.state(pg)
            if s['interact']: await L.tap(pg, cdp, '#interact')
            await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000)
        st = await pg.evaluate("ACTIVITIES.stateOf(GAME.G,'lib_tour_y1s1',%d)" % DAY)
        run.check('B 參加後走出總圖：記「去過但沒走完」（partial），清單不打勾', st == 'partial', str(st))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    return run.finish()

sys.exit(asyncio.run(main()))
