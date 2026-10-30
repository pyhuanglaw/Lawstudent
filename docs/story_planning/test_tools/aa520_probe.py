"""BB-B 10-30（v9.10.14 候選 92e9bca92；LAWWW-B 02:22 第 5 項）：AA_520 予樂自己的線、AA_521「走啦」群組——照玩家站著等到那個時間，手機收到訊息、用手機回、出遊那天照時間出發（不是 Node）。
MODE（環境變數）：
  y31    AA_520 3-1：2025-12-06（六）22:30 宿舍站著等到 22:50 → p:yule「可昕說我太吵 叫我去跑步」…「現在停不下來」（見過予樂；沒見過＝【捷徑】yulePassDay）
  lec    AA_520 4-1／4-2b／4-3：2027-10-14（四）21:50 宿舍等到 22:05 → p:yule 邀請「下週三晚上七點 我要去你們學校聽一場演講」；手機回②「聽完去吃東西？」＝「好 八點十五 阿鳳」、YL_LEC＝eat；
         同一份進度跳到 10/20（三）19:50 宿舍，照時間出發（有「出發」就按）→ 阿鳳麵店「我都點了。你吃我的。」→ 4-3「我八歲的時候，也有一個阿姨來找過我。」
  econ21 AA_521 2-1：2026-05-13（三）21:20 等到 21:40 →「走啦」群組（g:econ_friends）韋綸「走不了啦！」、阿勳「在哪？我去載你。」（不在群組＝前置不成立，照實記）
不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。用法：LW_TESTS=<工作樹>/tests MODE=<上面> python3 aa520_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright
URL, OUT, SAVEF = sys.argv[1], sys.argv[2], sys.argv[3]
SAVE = json.load(open(SAVEF, encoding='utf-8'))
MODE = os.environ.get('MODE', 'y31')
J = lambda o: json.dumps(o, ensure_ascii=False)
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
MSGS = "(th=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>({t:m.text,from:m.from||'',d:CALENDAR.dateOf(m.day).key})))"


async def rooms(pg, key):
    d = await pg.evaluate("STORY.dayOfKey(%s)" % J(key)); fl = {}
    for k, kk in ROOMS:
        dd = await pg.evaluate("STORY.dayOfKey(%s)" % J(kk))
        if dd <= d: fl[k] = dd
    if 'ROOM_Y4' in fl: fl.update({'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
    if 'ROOM_Y3' in fl: fl.update({'ROOM_Y3_ITEMS': [], 'ROOM_Y3_DISCARD': None})
    return fl


async def meet_yule(pg, cdp, run):
    return await P.prep(pg, cdp, run, """(()=>{ const G=GAME.G, ok=HEARD&&HEARD.COND&&HEARD.COND.yule?HEARD.COND.yule(G):null; if(!ok) G.flags.yulePassDay=G.day-30; return {before:ok, after:HEARD&&HEARD.COND&&HEARD.COND.yule?HEARD.COND.yule(G):null}; })()""", label='見過予樂（沒見過才補 yulePassDay）')


async def main():
    run = L.Run('aa520_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await P.init(pg)

        if MODE == 'y31':
            st, d = await P.base(pg, SAVE, '2025-12-06', 22.5, 'dorm'); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → 2025-12-06（六）22:30 宿舍')
            await meet_yule(pg, cdp, run)
            ok = await P.wait_play(pg, cdp, 22.84, max_s=600)
            m = await pg.evaluate(MSGS + "('p:yule')"); t = [x['t'] for x in m if x['d'] == '2025-12-06']
            run.note('等到 22:50：%s；p:yule 這一天 %s' % (ok, J(t)))
            for w in ('可昕說我太吵 叫我去跑步', '我去了', '現在停不下來'):
                run.check('AA_520 3-1 有「%s」' % w, w in t, J(t))
            body = await P.phone_thread(pg, cdp, 'p:yule'); await run.shot(pg, 'y31_phone'); await P.phone_close(pg, cdp)

        elif MODE == 'econ21':
            st, d = await P.base(pg, SAVE, '2026-05-13', 21.33, 'dorm'); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → 2026-05-13（三）21:20 宿舍')
            inG = await pg.evaluate("!!PHONE.inGroup(GAME.G,'econ_friends')"); run.note('在「走啦」群組：%s' % inG)
            ok = await P.wait_play(pg, cdp, 21.67, max_s=600)
            m = await pg.evaluate(MSGS + "('g:econ_friends')"); t = [x['t'] for x in m if x['d'] == '2026-05-13']
            run.note('等到 21:40：%s；g:econ_friends 這一天 %s' % (ok, J(t)))
            if inG:
                for w in ('走不了啦！', '在哪？我去載你。'):
                    run.check('AA_521 2-1 有「%s」' % w, w in t, J(t))
            else: run.note('NOT_TESTED AA_521 2-1：這份存檔不在「走啦」群組（沒有經濟系那一年），群組訊息照設計不傳')
            await run.shot(pg, 'econ21')

        elif MODE == 'lec':
            fl = await rooms(pg, '2027-10-14')
            st, d = await P.base(pg, SAVE, '2027-10-14', 21.83, 'dorm', flags=fl); await P.load(pg, cdp, st)
            run.setup('[前置] 使用者存檔 → 2027-10-14（四）21:50 宿舍；%s' % J(fl))
            await meet_yule(pg, cdp, run)
            ok = await P.wait_play(pg, cdp, 22.08, max_s=600)
            m = await pg.evaluate(MSGS + "('p:yule')"); t = [x['t'] for x in m if x['d'] == '2027-10-14']
            run.note('等到 22:05：%s；p:yule 這一天 %s' % (ok, J(t)))
            run.check('AA_520 4-1 邀請「下週三晚上七點 我要去你們學校聽一場演講」', '下週三晚上七點 我要去你們學校聽一場演講' in t, J(t))
            body = await P.phone_answer(pg, cdp, 'p:yule', '「聽完去吃東西？」')
            if body is None: body = await P.phone_answer(pg, cdp, 'p:yule', '聽完去吃東西')
            await run.shot(pg, 'lec_answer'); await P.phone_close(pg, cdp)
            await P.dialog(pg, cdp, run, max_s=40, tag='lec_after_answer')
            await pg.wait_for_timeout(4000)
            f = await pg.evaluate("(()=>({YL_LEC:GAME.G.flags.YL_LEC==null?null:GAME.G.flags.YL_LEC, trips:(GAME.G.trips||[]).filter(x=>/予樂|yule/.test(JSON.stringify(x))).map(x=>({d:CALENDAR.dateOf(x.day).key,depart:x.depart,status:x.status,who:x.who}))}))()")
            m = await pg.evaluate(MSGS + "('p:yule')"); t2 = [x['t'] for x in m]
            run.note('回了以後：%s；p:yule %s' % (J(f), J(t2[-4:])))
            run.check('AA_520 4-1 ②：手機有回覆鍵「聽完去吃東西？」、按了', body is not None, J(body and body[-300:]))
            run.check('AA_520 4-1 ②：予樂回「好 八點十五 阿鳳」', '好 八點十五 阿鳳' in t2, J(t2[-4:]))
            run.check('AA_520 4-1 ②：記 YL_LEC＝eat', f['YL_LEC'] == 'eat', J(f))
            await P.jump(pg, cdp, run, '2027-10-20', 19.83, zone='dorm', pos=None, note='照時間過到那一天（同一份進度）')
            await P.events_on(pg); n0s = await P.say_hook(pg)
            t0 = time.time(); seen = []; picked = []
            while time.time() - t0 < 900:
                s = await P.ts(pg)
                if s['txt'] and (not seen or seen[-1] != [s['name'], s['txt']]): seen.append([s['name'], s['txt']])
                if s['ch']:
                    k, pk = P.pick_of(s['ch'], ['出發', '好'], decline=False); picked.append(s['ch'][k]['t'])
                    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
                if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
                if s['phone']: await L.phone_away(pg, cdp); continue
                if any('雞排' in x[1] for x in seen[-2:]) or await pg.evaluate("(([n,s])=>(window.__SAY||[]).slice(n).some(x=>x.t.indexOf(s)>=0))", [n0s, '雞排']) or s['h'] >= 22.5: break
                await pg.wait_for_timeout(1500)
            lines = [x[1] for x in P.clean(seen)] + [t for _, t in await P.said(pg, n0s)]
            run.note('10/20：選了 %s；台詞 %s；%s' % (J(picked), J(lines), J(await P.clock(pg))))
            await run.shot(pg, 'lec_noodle')
            run.check('AA_520 4-2b 阿鳳麵店「我都點了。你吃我的。」', '我都點了。你吃我的。' in lines, J(lines))
            run.check('AA_520 4-3「我八歲的時候，也有一個阿姨來找過我。」', '我八歲的時候，也有一個阿姨來找過我。' in lines, J(lines))

        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
