"""劇情黑邊不能蓋住對話框（BUG-22，使用者 2026-10-16 iPhone 直向截圖：以安「你要不要一起？……還是你比較想去總圖？那邊安靜。」第二行被下方黑邊切掉，點黑邊也沒反應，看起來像卡住）。
直向 390×844、橫向 844×390 各檢查一次（[前置] 讀檔放到校園、直接開一段兩行的對話＋黑邊）：
  1. 對話框最後一行字、「▼ 點一下繼續」的位置，畫面最上層是對話框（不是黑邊）；
  2. 點下方黑邊也能繼續（黑邊不接點擊，點擊落到下面的畫面＝點一下繼續）；
  3. 有選項時，每個選項都在畫面裡、沒有被黑邊蓋住。
舊版（黑邊 z-index 7）1、2 會失敗。用法：python3 tests/letterbox_dialog.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/letterbox_dialog'
LINE = '你要不要一起？……還是你比較想去總圖？那邊安靜。我等一下要去溫州街那間咖啡廳整理今天的筆記，就是開到凌晨兩點半那間。'

TOP_AT = """(([sel,fy])=>{ const e=document.querySelector(sel); if(!e||e.offsetParent===null) return {ok:false,why:'不在畫面'}; const r=e.getBoundingClientRect();
  const x=r.left+r.width/2, y=r.top+r.height*fy; if(y>innerHeight-1) return {ok:false,why:'超出畫面 y='+y.toFixed(0)+' / '+innerHeight};
  const t=document.elementFromPoint(x,y); return {ok:!!t&&(t===e||e.contains(t)||t.closest('#dlg')===e.closest('#dlg')&&!!t.closest('#dlg')), top:t?(t.id||t.tagName):null, y:Math.round(y), h:innerHeight}; })"""


async def one(p, run, landscape):
    tag = '橫向' if landscape else '直向'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=landscape)
    await pg.goto(URL)
    run.check(f'{tag}：遊戲載入', await L.wait_loaded(pg))
    await L.load_state(pg, {'zone': 'campus', 'day': 3, 'weekday': 5, 'hour': 16, 'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True}}, quiet_events=True)
    await pg.wait_for_timeout(3000)
    await pg.evaluate("(t=>{ GAME.sceneBegin(); GAME.letterbox(true); ADV.begin({background:'blur',right:'heroine_01'}); window.__said=false; GAME.say({name:'小安'},t).then(()=>{ window.__said=true; }); })(%s)" % json.dumps(LINE))
    await pg.wait_for_timeout(2500)
    await L.tap(pg, cdp, '#dlg')   # 打字中：點一下先顯示整句
    await pg.wait_for_timeout(900)
    lb = await pg.evaluate("(()=>{ const r=document.getElementById('letterB').getBoundingClientRect(); return {h:Math.round(r.height), top:Math.round(r.top)}; })()")
    run.check(f'{tag}：下方黑邊有開（前置）', lb['h'] > 10, json.dumps(lb))
    t1 = await pg.evaluate(TOP_AT, ['#dlgText', 0.92])
    t2 = await pg.evaluate(TOP_AT, ['#dlgNext', 0.5])
    await run.shot(pg, f'{tag}_dialog')
    run.check(f'{tag}：對話框最後一行字在最上層（沒有被黑邊蓋住）', t1['ok'], json.dumps(t1, ensure_ascii=False))
    run.check(f'{tag}：「點一下繼續」看得到', t2['ok'], json.dumps(t2, ensure_ascii=False))
    # 點黑邊（畫面最下面那一條、對話框左右兩邊以外的地方）
    vp = pg.viewport_size
    await L.touch_tap(cdp, 6, vp['height'] - 4)
    await pg.wait_for_timeout(1500)
    run.check(f'{tag}：點下方黑邊也能繼續（對話結束）', await pg.evaluate("window.__said===true"))
    # 選項
    await pg.evaluate("(()=>{ window.__pick=null; GAME.choose([{t:'好啊，去咖啡廳。'},{t:'總圖比較安靜，去總圖吧。'},{t:'今天有點累，改天。'}]).then(i=>{ window.__pick=i; }); })()")
    await pg.wait_for_timeout(1500)
    vis = await pg.evaluate("""(()=>{ return [...document.querySelectorAll('#choices button')].map(b=>{ const r=b.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {y:Math.round(r.bottom), h:innerHeight, top:t===b||b.contains(t)}; }); })()""")
    await run.shot(pg, f'{tag}_choices')
    run.check(f'{tag}：三個選項都在畫面裡、在最上層', len(vis) == 3 and all(v['top'] and v['y'] <= v['h'] for v in vis), json.dumps(vis))
    run.check(f'{tag}：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    await b.close()


async def main():
    run = L.Run('letterbox_dialog', OUT)
    async with async_playwright() as p:
        await one(p, run, landscape=False)
        await one(p, run, landscape=True)
    sys.exit(run.finish())

asyncio.run(main())
