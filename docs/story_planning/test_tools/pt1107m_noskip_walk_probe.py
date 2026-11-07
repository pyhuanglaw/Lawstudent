"""BB-B 2026-11-07：BUG-Y0-DAYSKIP-CARD-1107 第①點「不在走路中跳」瀏覽器驗收（LAWWW-B ba11c0043，在 3b942474b）。
經濟系序章快轉（ECONFF，D102 ③ 短版）：玩家空下來 1.5 秒才跳下一件事；搖桿按著、剛停下不到 1 秒都不跳。
  ① 按住搖桿 8 秒（一直推）：日期、時間不變，沒有開始跳（ECONFF.busy 一直是 false）
  ② 放開搖桿以後 0.6 秒內：還沒開始跳
  ③ 放開以後 6 秒內：開始跳（日期或時間往後、出日期卡）
[前置／捷徑] 讀上一段 flow_v0_to1017_reply 玩到的存檔（2024-09-24 22:00 宿舍，經濟系短版）；
【捷徑】讀檔後先把 ECONFF.busy 設成 true（擋住讀檔那一刻就跳），搖桿按下去以後才放開。
用法：LW_TESTS=<測試樹>/tests python3 pt1107m_noskip_walk_probe.py URL 存檔.json 輸出資料夾"""
import asyncio, json, os, sys, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L
from playwright.async_api import async_playwright

URL, SAVE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
ST = """(()=>{ const G=GAME.G, el=document.getElementById('title3'); return {key:CALENDAR.dateOf(G.day).key, h:+G.hour.toFixed(3), busy:!!ECONFF.busy,
  joy:!!(GAME.E.input&&GAME.E.input.joy&&GAME.E.input.joy.active), card:!!el&&getComputedStyle(el).opacity>0.05&&el.textContent.trim().length>0, cardText:el?el.textContent.trim().slice(0,80):''}; })()"""


async def main():
    run = L.Run('pt1107m_noskip_walk', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        s = json.load(open(SAVE, encoding='utf-8'))
        await L.load_state(pg, s, quiet_phone=True)
        await pg.evaluate("ECONFF.busy=true")
        run.setup('讀 2024-09-24 22:00 宿舍（經濟系短版）的存檔；【捷徑】ECONFF.busy＝true 先擋住讀檔那一刻就跳')
        await pg.wait_for_timeout(2500)
        on = await pg.evaluate("ECONFF.on(GAME.G)&&ECONFF.short(GAME.G)")
        run.check('[前置] 經濟系快轉開著、短版', bool(on))
        s0 = await pg.evaluate(ST)
        jx, jy = await L.center_of(pg, '#joy')
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx, 'y': jy - 40}]})
        await pg.wait_for_timeout(200)
        await pg.evaluate("ECONFF.busy=false")
        run.setup('搖桿按住往前推，按下去以後才把 ECONFF.busy 放開')
        samples = []; t0 = time.time(); k = 0
        while time.time() - t0 < 8:
            k += 1
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + (6 if k % 2 else -6), 'y': jy - 40}]})
            await pg.wait_for_timeout(250)
            samples.append(await pg.evaluate(ST))
        moved = [x for x in samples if x['busy'] or x['key'] != s0['key'] or x['h'] - s0['h'] > 0.3 or x['card']]
        run.check('① 搖桿按著 8 秒：沒有開始跳（%d 次取樣）' % len(samples), not moved and all(x['joy'] for x in samples[1:]), json.dumps(moved[:2] or samples[-1:], ensure_ascii=False))
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        tr = time.time(); early = []
        while time.time() - tr < 0.6:
            early.append(await pg.evaluate(ST)); await pg.wait_for_timeout(100)
        jumped_early = [x for x in early if x['busy'] or x['key'] != s0['key'] or x['card']]
        run.check('② 放開以後 0.6 秒內還沒開始跳', not jumped_early, json.dumps(jumped_early[:2], ensure_ascii=False))
        t_jump = None; last = None
        while time.time() - tr < 6:
            last = await pg.evaluate(ST)
            if last['busy'] or last['card'] or last['key'] != s0['key']:
                t_jump = time.time() - tr; break
            await pg.wait_for_timeout(150)
        run.check('③ 放開以後 6 秒內開始跳（%.1f 秒）' % (t_jump or -1), t_jump is not None and t_jump >= 0.9, json.dumps(last, ensure_ascii=False))
        for _ in range(40):
            q = await pg.evaluate(ST)
            if q['card']: break
            await pg.wait_for_timeout(250)
        await run.shot(pg, 'jump_card')
        print('[JUMP]', json.dumps(q, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
