"""BUG-MAPBLACK（iPhone 按地圖後地圖變黑、人物變黑色剪影）的回歸檢查：iOS 的 2D canvas 有總記憶體上限，
原本大地圖每打開一次就新開一張導航格 canvas 不釋放（b3d67056 修：每個導航格只畫一張、關地圖釋放大地圖畫布、換區域釋放）。
1. [前置] 讀檔到校園 11:00。
2. 真實操作：點小地圖打開大地圖、點「關閉」，重複 5 次——還在用的 canvas（寬×高 > 0）張數和像素總量不能越開越多。
3. 真實操作：換區域（進兩點半 Café 再回來；[前置] 用 GAME.enter）兩輪，各開關一次：第 2 輪不比第 1 輪多（第 1 輪含 Café 第一次的快取）。
每次數之前用 CDP 強制回收記憶體（HeapProfiler.collectGarbage）：數的是還有人用的 canvas。
（Playwright 手機模擬；iPhone 實機的記憶體上限要使用者確認。）
用法：python3 tests/map_canvas_leak.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/map_canvas_leak'

# 記下每一張建立過的 canvas（document.createElement 與 new OffscreenCanvas 以外的都經過這裡）
INIT = """(()=>{ const all=[]; window.__cv=all; const ce=Document.prototype.createElement;
  Document.prototype.createElement=function(t,...a){ const el=ce.call(this,t,...a); if(String(t).toLowerCase()==='canvas') all.push(new WeakRef(el)); return el; };
  window.__cvStat=()=>{ let n=0, px=0; for(const r of all){ const c=r.deref(); if(c&&c.width*c.height>0){ n++; px+=c.width*c.height; } } return {n, mpx:+(px/1e6).toFixed(2), made:all.length}; }; })()"""


async def main():
    run = L.Run('map_canvas_leak', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        await pg.add_init_script(INIT)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('讀檔：校園 11:00')
        await L.load_state(pg, {'zone': 'campus', 'hour': 11.0, 'day': 11, 'weekday': 6, 'weather': 'sunny', 'pos': {'x': 34, 'z': -91.8, 'yaw': 3.14},
                                'flags': {'introDone': True, 'campusIntro': True, 'classDone': True}}, quiet_events=True)
        await pg.wait_for_timeout(3000)

        async def stat():   # 先強制回收記憶體再數：已經沒人用、只是還沒被回收的 canvas 不算（WeakRef 在回收前還拿得到；QA-HANDOFF-B1 換區域那一項原本把它們算進去）
            await cdp.send('HeapProfiler.collectGarbage'); await pg.wait_for_timeout(300); await cdp.send('HeapProfiler.collectGarbage')
            return await pg.evaluate("window.__cvStat()")

        async def cycle(label):
            ok_open = await L.tap(pg, cdp, '#minimap')
            for _ in range(40):
                if await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')"): break
                await pg.wait_for_timeout(250)
            opened = await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')")
            await pg.wait_for_timeout(800)
            await run.shot(pg, label)
            await L.tap(pg, cdp, '#bmClose')
            for _ in range(40):
                if await pg.evaluate("document.getElementById('bigmap').classList.contains('hide')"): break
                await pg.wait_for_timeout(250)
            await pg.wait_for_timeout(500)
            return ok_open and opened, await stat()

        base = await stat()
        stats = []
        for i in range(5):
            ok, s = await cycle(f'open_{i + 1}')
            run.check(f'第 {i + 1} 次點小地圖打開大地圖、點關閉', ok, json.dumps(s))
            stats.append(s)
        run.note(f'開地圖前 {base}；每次關掉後 {stats}')
        run.check('開關 5 次：還在用的 canvas 張數不增加（第 1 次之後）', all(s['n'] <= stats[0]['n'] for s in stats[1:]), json.dumps([base] + stats))
        run.check('開關 5 次：canvas 像素總量不增加（容許 0.05 百萬像素）', all(s['mpx'] <= stats[0]['mpx'] + 0.05 for s in stats[1:]), json.dumps(stats))
        run.check('關掉大地圖後，大地圖畫布已釋放（#bmCanvas 寬高 0）', await pg.evaluate("(()=>{ const c=document.getElementById('bmCanvas'); return !!c&&c.width*c.height===0; })()"))
        run.setup('換區域：進兩點半 Café 再回校園（GAME.enter），做兩輪')
        rounds = []
        for r in range(2):
            await pg.evaluate("void GAME.enter('cafe')"); await pg.wait_for_timeout(4000)
            await pg.evaluate("void GAME.enter('campus')"); await pg.wait_for_timeout(5000)
            ok, s2 = await cycle(f'after_zone_{r + 1}'); rounds.append(s2)
            run.check(f'換區域第 {r + 1} 輪再回來開關一次：大地圖打得開、關得掉', ok)
        # 第 1 輪會多出 Café 第一次進去才建的快取（cafeStreetCache、W3.canvasTex 的招牌與窗景：之後重用，不會再建），所以比第 2 輪和第 1 輪：
        # 換區域本身不能讓 canvas 越來越多（BUG-MAPBLACK：59facb8b 之前每進一次校園多一套 2048×512 的字牌 atlas）
        run.note(f'開關 5 次後 {stats[0]}；第 1 輪 {rounds[0]}（含 Café 第一次的快取）；第 2 輪 {rounds[1]}')
        run.check('換區域第 2 輪：canvas 張數不比第 1 輪多 2 張以上、像素不多 0.5 百萬（沒有每換一次就累積）', rounds[1]['n'] <= rounds[0]['n'] + 2 and rounds[1]['mpx'] <= rounds[0]['mpx'] + 0.5, json.dumps(rounds))
        run.check('換區域第 1 輪：比換區域前多的只有 Café 第一次的快取（不超過 1.5 百萬像素）', rounds[0]['mpx'] <= stats[0]['mpx'] + 1.5, json.dumps([stats[0], rounds[0]]))
        run.check('沒有 JS 錯誤', not errs, '; '.join(errs[:5]))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
