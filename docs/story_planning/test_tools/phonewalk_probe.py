"""BB（帳號 A）2026-10-21：UX-PHONE-AUTO-WALK-1021（LAWWW 4b736d5e）——要回的訊息自動打開手機（D103）不再打斷走路：走路中不開、停下來 1.5 秒才開、同一則只開一次。
[前置] 讀使用者 9/25 存檔（溫州街）；[捷徑] 用 PHONE.at 排一則要回的測試訊息（幾秒後送到）。之後照玩家：推著搖桿走（真的觸控）→ 放開 → 看手機什麼時候打開 → 收起來 → 再走、再停（不該再開）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。用法：LW_TESTS=<開發分支>/tests python3 phonewalk_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
RD = """(()=>{ const p=document.getElementById('phone'), P=GAME.E.player; return {open:!!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none', pend:(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(GAME.G).length:-1,
  x:+P.obj.position.x.toFixed(2), z:+P.obj.position.z.toFixed(2), t:+(+GAME.E.time).toFixed(2), joy:!!(GAME.E.input&&GAME.E.input.joy&&GAME.E.input.joy.active)}; })()"""


async def hold(pg, cdp, secs, dx=0, dy=-60, log=None, tag=''):
    jx, jy = await L.center_of(pg, '#joy'); t0 = time.time(); nxt = 0
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    while time.time() - t0 < secs:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + dx, 'y': jy + dy}]})
        if time.time() - t0 >= nxt and log is not None: r = await pg.evaluate(RD); r['rt'] = round(time.time() - t0, 1); r['tag'] = tag; log.append(r); nxt += 0.5
        await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


async def watch(pg, secs, log, tag):
    t0 = time.time()
    while time.time() - t0 < secs:
        r = await pg.evaluate(RD); r['rt'] = round(time.time() - t0, 1); r['tag'] = tag; log.append(r)
        if r['open'] and tag == 'stop1': return r
        await pg.wait_for_timeout(400)
    return None


async def main():
    run = L.Run('phonewalk', OUT); base = json.load(open(SAVE, encoding='utf-8')); G = base.get('G', base)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, G); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp); run.setup('[前置] 讀使用者 9/25 存檔（溫州街）')
        for k in range(3):   # 讀檔後本來就有要回的：先回掉，才看得出新的那一則
            if not await pg.evaluate("(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(GAME.G).length:0"): break
            await pg.evaluate("(()=>{ for(const m of PHONE.pending(GAME.G)){ (GAME.G.flags._autoAsk=GAME.G.flags._autoAsk||[]).push(m.id||m.key||m.text); } })()"); run.setup('[捷徑] 讀檔時已經有的待回訊息記成開過（不讓它們干擾）')
            break
        await L.close_panels(pg, cdp)
        await pg.evaluate("(()=>{ const G=GAME.G; PHONE.at(G,G.day,G.hour+0.003,[{th:'p:zhe',from:'zhe',text:'（BB 測試）在嗎？',ask:{id:'bb_walk_test',opts:[{t:'在。'},{t:'晚點回。'}]}}],'bb_walk_test'); })()")
        run.setup('[捷徑] PHONE.at 排一則阿哲的測試訊息（要回的，約 10 秒遊戲時間後送到）')
        log = []
        await hold(pg, cdp, 25, log=log, tag='walk1')
        walk_open = [r for r in log if r['tag'] == 'walk1' and r['open']]; got = [r for r in log if r['tag'] == 'walk1' and r['pend'] > 0]
        moved = (abs(log[-1]['x'] - log[0]['x']) + abs(log[-1]['z'] - log[0]['z'])) if log else 0
        print('走 25 秒：待回訊息到了 %d 次取樣、手機打開 %d 次取樣、走了 %.1f m' % (len(got), len(walk_open), moved), flush=True)
        r1 = await watch(pg, 12, log, 'stop1'); await run.shot(pg, 'after_stop')
        print('放開以後：%s' % (json.dumps(r1) if r1 else '12 秒內沒打開'), flush=True)
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(1200)
        await hold(pg, cdp, 6, dy=60, log=log, tag='walk2'); await watch(pg, 8, log, 'stop2')
        reopen = [r for r in log if r['tag'] in ('walk2', 'stop2') and r['open']]
        json.dump(log, open(os.path.join(OUT, 'phonewalk.json'), 'w'), ensure_ascii=False, indent=1)
        run.check('走路中訊息到了，手機不跳出來（取樣 %d 次都沒開）' % len([r for r in log if r['tag'] == 'walk1']), bool(got) and not walk_open, json.dumps(walk_open[:2]))
        run.check('停下來以後手機自己打開（%s）' % ('放開後 %.1f 秒' % r1['rt'] if r1 else '沒開'), bool(r1), '')
        run.check('收起來以後再走、再停：同一則不再打開', not reopen, json.dumps(reopen[:2]))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
