"""CG-1「雨天的總圖門口」在遊戲裡的樣子（給 BB 驗收，D59）：手機直向 390×844、橫向 844×390 各一次。
[前置／捷徑] 讀檔：第 6 天（9/22 週一）18:30、下雨、校園總圖前 (81,12)、還沒見過陳語彤（和 tests/flow_first_meet.py 的 E 段一樣）；
之後照玩家的做法點地面往總圖門口走，事件自己開始（ev_rain_library_door），CG 出來後截圖、點一下對話再截一張。
檢查：CG 那一層的圖是正式檔 assets/cg/heroine_03/event_rain_library.webp、圖有載入（naturalWidth 1920）、沒有 JS 例外。
截圖：<輸出資料夾>/cg_rain_{portrait,landscape}_{1,2}.png（Playwright＋SwiftShader，不是 iPhone 實機）。
用法：python3 tools/shots/cg_rain_shots.py URL [輸出資料夾]"""
import asyncio, json, math, os, sys, time
from playwright.async_api import async_playwright
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'tests'))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/cg_rain_shots'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
CG_JS = """(async()=>{ const a=document.getElementById('advCg'); const bg=a?a.style.backgroundImage:''; const m=/url\\(["']?([^"')]+)/.exec(bg||''); if(!m) return {bg:bg||'',w:0};
  const im=new Image(); im.src=m[1]; try{ await im.decode(); }catch(e){} return {bg:m[1],w:im.naturalWidth,h:im.naturalHeight,cls:document.getElementById('adv').className}; })()"""


async def walk_until_dialog(pg, cdp, tx, tz, max_s=300):
    t0 = time.time()
    while time.time() - t0 < max_s:
        q = await L.state(pg)
        if q['dlg'] or q['choices'] or q['busy']: return True
        if math.hypot(q['x'] - tx, q['z'] - tz) < 0.8:
            await pg.wait_for_timeout(3000); q = await L.state(pg); return bool(q['dlg'] or q['choices'] or q['busy'])
        await L.tap_ground(pg, cdp, tx, tz); await pg.wait_for_timeout(4000)
    return False


async def main():
    run = L.Run('cg_rain_shots', OUT)
    async with async_playwright() as p:
        for name, land in (('portrait', False), ('landscape', True)):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
            await pg.goto(URL); await L.wait_loaded(pg)
            run.setup(f'{name}：讀檔第 6 天 18:30、下雨、總圖前 (81,12)、還沒見過陳語彤')
            await L.load_state(pg, {'zone': 'campus', 'hour': 18.5, 'day': 6, 'weekday': 1, 'weather': 'rain', 'pos': {'x': 81, 'z': 12, 'yaw': 3.14}, 'flags': FLAGS})
            await pg.wait_for_timeout(5000)
            started = await walk_until_dialog(pg, cdp, 81, 2.5)
            await pg.wait_for_timeout(2500)
            cg = await pg.evaluate(CG_JS)
            await run.shot(pg, f'cg_rain_{name}_1')
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1800)
            await run.shot(pg, f'cg_rain_{name}_2')
            run.check(f'{name}：走到總圖門口，雨天事件自己開始、CG 是正式檔（1920×1080）', started and cg.get('bg', '').endswith('assets/cg/heroine_03/event_rain_library.webp') and cg.get('w') == 1920, json.dumps(cg, ensure_ascii=False))
            run.check(f'{name}：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
            await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
