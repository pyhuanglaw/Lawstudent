"""CC-B（帳號 B）11-09：BUG-OUT-ALARM-SKIP-1109 抽查（BB-B 19:47，P2；LAWWW-B 開的）。判定＝BB（只報事實）。
出遊：AA614 看電影（aa614_movie，19:30 南洋戲院，OUT.plan 沒有 alarm）。
【前置／捷徑】讀檔到宿舍 DAY 15:00，旗標 AA614_MOVIE＝那一天（＝群組第 3 列答「好。」的結果；沒有照玩家在手機上回，因為那則群組要很多前置）→ 等遊戲排出 OUT aa614_movie
→ 照玩家按手機「今天」的「跳過時間」，挑會越過 19:30 的（預設「等到晚上（20:00）」，沒有就最後一個）→ 記：停在幾點、caption、toast、q.state、
出遊有沒有演（events.done.ev_aa614_movie）、手機收到的訊息（那天 19:00 以後的 G.msgs）→ 再過到 23:00 看最後狀態。
用法：LW_TESTS=<wt>/tests [DAY=2025-10-18] python3 cc_out_alarm_skip_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
DAY = os.environ.get('DAY') or '2025-10-18'
R = L.Run('out_alarm_skip', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
STATE = """(()=>{ const G=GAME.G; const tx=id=>{ const e=document.getElementById(id); return e?e.textContent.trim().slice(0,90):''; }; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'aa614_movie'):null;
  return {d:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, caption:tx('caption')||tx('cap'), toast:tx('toast'), q:q?{state:q.state,day:q.day,h:q.h,alarm:q.alarm||null}:null,
    played:!!(G.events&&G.events.done&&G.events.done.ev_aa614_movie), flag:G.flags.AA614_MOVIE};})()"""
MSGS = """(d0=>{ const G=GAME.G; return (G.msgs||[]).slice(-12).map(m=>({th:m.th,from:m.from||null,text:String(m.text||'').slice(0,80),day:m.day,h:m.h,t:m.t,tag:m.tag||null})); })"""
SKIPS = """(()=>{ return [...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>b.textContent.trim().slice(0,30)); })()"""
async def open_today(pg, cdp):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=today]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        d = await pg.evaluate("k=>STORY.dayOfKey(k)", DAY)
        R.setup('【前置／捷徑】讀檔到宿舍 %s 15:00，旗標 AA614_MOVIE=%s（＝群組第 3 列答「好。」）' % (DAY, d))
        await L.load_state(pg, {'zone': 'dorm', 'day': d, 'hour': 15.0, 'pos': None, 'flags': {'AA614_MOVIE': d}}, quiet_events=True, quiet_phone=True)
        await pg.wait_for_timeout(6000)
        s0 = await pg.evaluate(STATE); R.note('讀檔後：%s' % J(s0))
        R.check('遊戲排出 OUT aa614_movie（19:30）', bool(s0.get('q')), J(s0))
        hist = []
        for k in range(4):
            await L.close_panels(pg, cdp)
            await open_today(pg, cdp); opts = await pg.evaluate(SKIPS); R.note('第 %d 次手機「今天」的跳過時間：%s' % (k + 1, J(opts)))
            if not opts: await L.tap(pg, cdp, '#btnPhoneClose'); break
            pick = next((i for i, t in enumerate(opts) if '20:00' in t), None)
            if pick is None: pick = next((i for i, t in enumerate(opts) if '晚上' in t or '傍晚' in t), len(opts) - 1)
            c = await pg.evaluate("i=>{ const e=[...document.querySelectorAll('#phoneBody [data-skip]')][i]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; }", pick)
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(2500)
            st = await pg.evaluate(STATE); st['pressed'] = c[2]; hist.append(st); R.note('按「%s」→ %s' % (c[2], J(st)))
            await run_dialog(pg, cdp)
            st2 = await pg.evaluate(STATE); R.note('   對話點完以後：%s' % J(st2))
            if st2['h'] >= 21 or st2['d'] != DAY: break
        await L.close_panels(pg, cdp)
        for k in range(int(os.environ.get('WAITS') or 8)):   # 跳不了以後站著等（遊戲時間自己走），看 q.state 什麼時候變、有沒有收到訊息
            await pg.wait_for_timeout(15000); await run_dialog(pg, cdp); await L.close_panels(pg, cdp)
            w = await pg.evaluate(STATE); R.note('站著等 %d：%s' % (k + 1, J(w)))
            if (w.get('q') or {}).get('state') not in (None, 'planned') and k >= 1: break
        fin = await pg.evaluate(STATE); msgs = await pg.evaluate(MSGS, d)
        R.note('最後：%s' % J(fin)); R.note('手機最後 12 則訊息：%s' % J(msgs))
        await pg.screenshot(path=os.path.join(OUT, 'out_alarm_final.png'))
        stopped = [x for x in hist if 18.5 <= x['h'] < 19.5]
        R.note('事實整理：有沒有停在 19:30 出發前（18:30～19:30 之間停下）＝%s；q.state＝%s；出遊演了沒＝%s；收到的訊息 %d 則' % (bool(stopped), (fin.get('q') or {}).get('state'), fin.get('played'), len(msgs)))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump({'s0': s0, 'hist': hist, 'final': fin, 'msgs': msgs}, open(os.path.join(OUT, 'out_alarm_skip.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
async def run_dialog(pg, cdp):
    for _ in range(60):
        x = await L.state(pg)
        if x['choices']: await L.tap(pg, cdp, '#choices button')
        elif x['dlg']: await L.tap(pg, cdp, '#dlg')
        else: break
        await pg.wait_for_timeout(600)
asyncio.run(main())
