"""BB-C 10-28 01:3x：5k 第 1 項「9/6 起床提示框」對照檢查（fair_probe hints 那一行 FAIL：睡醒以後 GAME.toast 一則都沒記到）。
做法：新局（開學改 9/1）最小存檔 9/5 23:00 宿舍房間 → 觸控走到床「睡覺」→ 起床；同時記三樣：
  ① 畫面上的提示框（#toast 的 DOM 文字，MutationObserver，不靠包 GAME.toast）
  ② CLUBFAIR.wake 有沒有被呼叫、回傳什麼（包一層只記錄）
  ③ G.flags.FAIR_WAKE（S.wake 跑過＝記成那一天）
不是 iPhone：Playwright 手機橫向模擬。用法：LW_TESTS=<工作樹>/tests python3 fair_wake_check.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
WAKE = '今天椰林大道有社團博覽會（10:00～16:00）。'
REC = r"""(()=>{ window.__W={toast:[], wake:[], morning:0};
  const el=document.getElementById('toast'); if(el){ let last=''; new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&t!==last){ last=t; window.__W.toast.push({t, d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}); } }).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); }
  const ow=CLUBFAIR.wake; CLUBFAIR.wake=function(GM){ const r=ow.apply(this,arguments); window.__W.wake.push({r, d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), sameGM:GM===GAME, hasToast:!!(GM&&GM.toast)}); return r; };
  const om=CLS.morning; CLS.morning=Object.assign(async function(){ window.__W.morning++; return om.apply(this,arguments); }, om);
})()"""
async def main():
    run = L.Run('fair_wake_check', OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        dk = await pg.evaluate("({d:STORY.dayOfKey('2025-09-05'), law0:STORY.dayOfKey('2025-08-29'), m1:(STORY.MAIN_D1_NEW!=null?STORY.MAIN_D1_NEW:STORY.dayOfKey('2025-09-03'))})")
        F = {'LAW_START_DAY': dk['law0'], 'MAIN_D1': dk['m1'], 'met_zhe': True, 'met_an': True}
        st = {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': dk['d'], 'hour': 23.0, 'energy': 100, 'money': 22000, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'flags': F, 'events': {'done': {}, 'last': {}, 'count': 0}}
        st['weekday'] = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % dk['d'])
        await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(5000)
        run.setup('[前置] 新局（開學改 9/1）最小存檔 2025-09-05 23:00 宿舍房間；關掉條件事件')
        await pg.evaluate(REC)
        run.check('前置：開學改 9/1 的新局、社博是 9/6', await pg.evaluate("!!(STORY.week1Start&&STORY.week1Start(GAME.G))"))
        bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>/床|睡/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
        run.note('床：%s' % bed)
        ok = await L.go_to(pg, cdp, run, bed[0], bed[1], 0.9, bed[2], max_s=180) if bed else False
        await L.tap(pg, cdp, '#interact'); t0 = time.time(); picked = []
        while time.time() - t0 < 300:
            s = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); return {ch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>b.textContent):[], dlg:!!GAME.D.active, day:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), busy:!!GAME.E.player.busy}; })()")
            if s['ch']:
                k = next((i for i, t in enumerate(s['ch']) if t.startswith('睡')), 0); picked.append(s['ch'][k])
                await pg.evaluate("(k=>document.querySelectorAll('#choices button')[k].click())(%d)" % k); await pg.wait_for_timeout(800); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if s['day'] == '2025-09-06' and not s['busy'] and time.time() - t0 > 20: break
            await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(8000)
        W = await pg.evaluate("window.__W"); fw = await pg.evaluate("GAME.G.flags.FAIR_WAKE"); d6 = await pg.evaluate("STORY.dayOfKey('2025-09-06')")
        run.note('選了：%s；%s' % (picked, json.dumps(W, ensure_ascii=False)))
        run.check('睡覺 → 9/6 起床', await pg.evaluate("CALENDAR.dateOf(GAME.G.day).key") == '2025-09-06')
        run.check('起床有跑 CLS.morning', W['morning'] > 0, str(W['morning']))
        run.check('CLUBFAIR.wake 被呼叫且回傳 true（GM＝GAME、有 toast）', any(x['r'] for x in W['wake']), json.dumps(W['wake'], ensure_ascii=False))
        run.check('FAIR_WAKE 記成 9/6', fw == d6, '%s／%s' % (fw, d6))
        run.check('畫面上的提示框出現「%s」' % WAKE, any(WAKE in x['t'] for x in W['toast']), json.dumps(W['toast'][-6:], ensure_ascii=False))
        await run.shot(pg, 'wake')
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
