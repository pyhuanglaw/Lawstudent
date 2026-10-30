"""BB-B 10-30（v9.10.14 候選 92e9bca92；BUG-HOME-REST-NOCAP-1027，修正 1bcbbe3a7 HOME.REST_UNTIL＝26.5）：住家裡的選單「在家休息一下」凌晨 2:30 以後不出。
原本（BB-C 10-27 r42yt_new2）：家的選單在 sceneBegin 迴圈裡、S.tick 的凌晨強制睡跑不到，「休息一下」可以一直按，G.hour 到 131、日子不換。
做法：【前置】使用者存檔 → 大一上第 6 週週三 23:00（dl05_home_unit 第 8 段同一天）；【捷徑】HOME.rec(G).at＝true（今天回家吃過飯）、開家的選單（HOME.loop）；
之後照玩家：每次選單出來就點「在家休息一下」，直到它不出現；記每一次的選項和 G.hour；最後點「睡覺」，看是不是隔天早上醒來。
判定：23:00 第一次有「休息一下」；凌晨 2:30（G.hour 26.5）以後的選單沒有、還有「睡覺」；看過的 G.hour 不超過 28；睡覺以後日子＋1。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests python3 home_rest_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
J = lambda o: json.dumps(o, ensure_ascii=False)
REST = '在家休息一下'
has = lambda opts: any(o.startswith(REST) for o in opts)   # 選項的字＝標題＋小字（「在家休息一下一小時」）：看開頭（BB-B 10-30 02:4x 第一次跑就是這裡判斷錯）


async def menu(pg, cdp, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch']: return s
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(500)
    return None


async def main():
    run = L.Run('home_rest', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)
        wed = await pg.evaluate("(()=>{ const d=STORY.termDay('Y1S1',6,3); return {d, key:CALENDAR.dateOf(d).key}; })()")
        st, _ = await P.base(pg, SAVE, wed['key'], 23.0, 'dorm')
        await P.load(pg, cdp, st, quiet=True)
        run.setup('[前置] 使用者存檔 → %s（大一上第 6 週週三）23:00 宿舍' % wed['key'])
        r0 = await pg.evaluate("""(()=>{ const G=GAME.G; const R=HOME.rec(G); R.at=true; R.eat={day:G.day}; void HOME.loop(GAME); return {day:G.day, h:G.hour, at:R.at}; })()""")
        run.setup('【捷徑】HOME.rec(G).at＝true、今天吃過飯，開家的選單（HOME.loop）：%s' % J(r0))
        seen = []; last = None
        for k in range(10):
            s = await menu(pg, cdp)
            if not s: run.note('第 %d 次：60 秒沒有選單' % (k + 1)); break
            h = await pg.evaluate("+GAME.G.hour.toFixed(2)"); opts = [o['t'] for o in s['ch']]
            seen.append({'h': h, 'opts': opts}); run.note('第 %d 次選單（G.hour %.2f）：%s' % (k + 1, h, J(opts)))
            if not has(opts): last = seen[-1]; break
            await P.tap_choice(pg, cdp, [o.startswith(REST) for o in opts].index(True)); await pg.wait_for_timeout(4000)
        await run.shot(pg, 'last_menu')
        run.check('23:00 第一次選單有「%s」' % REST, bool(seen) and has(seen[0]['opts']) and seen[0]['h'] < 24, J(seen[:1]))
        run.check('凌晨 2:30（G.hour 26.5）以後的選單沒有「%s」、還有「睡覺」' % REST, bool(last) and last['h'] >= 26.5 and any(o.startswith('睡覺') for o in last['opts']), J(last))
        run.check('2:30 以前每一次都還有「%s」（沒有提早拿掉）' % REST, all(has(x['opts']) for x in seen if x['h'] < 26.5), J([x for x in seen if x['h'] < 26.5 and not has(x['opts'])]))
        run.check('看過的 G.hour 都不超過 28（原本可以按到 131）', all(x['h'] < 28 for x in seen), J([x['h'] for x in seen]))
        if last:
            d0 = await pg.evaluate("GAME.G.day")
            await P.tap_choice(pg, cdp, [o.startswith('睡覺') for o in last['opts']].index(True))
            for _ in range(40):
                await pg.wait_for_timeout(1500)
                st2 = await pg.evaluate("({day:GAME.G.day, h:+GAME.G.hour.toFixed(2)})")
                if st2['day'] > d0: break
            s3 = await menu(pg, cdp, max_s=20)
            run.note('睡覺以後：%s；選單 %s' % (J(st2), J(s3 and [o['t'] for o in s3['ch']])))
            run.check('點「睡覺」以後是隔天早上（日子＋1、G.hour 在 4～12）', st2['day'] == d0 + 1 and 4 <= st2['h'] <= 12, J(st2))
            await run.shot(pg, 'after_sleep')
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
