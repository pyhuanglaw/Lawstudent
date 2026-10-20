"""BB：X76（使用者 10-20：「遊戲中日期跟課表日期對不上」）。
[前置] 讀使用者存檔 day-18（8/29 22:42 宿舍，法律系），睡到 9/1 開學。之後：
 A 熬夜過午夜：[捷徑] 把時間設 23:55，等到 00:10 以後，記右上角、手機「今天」、手機「週」課表亮的那一欄。
 B 跨午夜的出遊：[捷徑] OUT.plan 一個 23:50 出發的宵夜（ev_kai_sunday_supper，走過去 15 分），照玩家按「出發」演完，記 G.weekday 和日曆的星期；再去睡覺，隔天早上再記一次。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), d2=CALENDAR.dateOf(G.day+Math.floor(G.hour/24)); return {day:G.day, real:d.key, realWd:d.wd%7, shownDate:d2.key, h:+G.hour.toFixed(2), weekday:G.weekday, hud:(document.getElementById('clockT')||{}).textContent||'', zone:G.zone}; })()"""
async def phone(pg, cdp, tab):
    if not await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(700)
    return await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody'); const on=[...b.querySelectorAll('.tth.on')].map(x=>x.textContent); return {head:(b.innerText||'').split('\\n').filter(x=>x.trim()).slice(0,2).join(' ｜ '), on}; })()")
async def close_phone(pg, cdp):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
async def drain(pg, cdp, pref, secs=240):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })(%s)" % json.dumps(pref))
            await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True); await pg.wait_for_timeout(900); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(1200)
        s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def sleep_bed(pg, cdp, run):
    await close_phone(pg, cdp)
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120): return False
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    await drain(pg, cdp, ['睡到明天早上', '睡覺', '睡'], 200); return True
async def main():
    run = L.Run('x76', OUT); rec = []; bad = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await pg.evaluate("(s=>localStorage.setItem('fatiao3d_slot_1',s))(%s)" % json.dumps(open(SAVE, encoding='utf-8').read()))
        await pg.reload(); await L.wait_loaded(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>x.textContent==='讀取'); const e=b[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        await L.touch_tap(cdp, c[0], c[1]); run.setup('讀使用者存檔 day-18（8/29 22:42 宿舍）'); await pg.wait_for_timeout(4000)
        await drain(pg, cdp, ['睡到明天早上', '睡覺'], 120)
        async def note(tag):
            sn = await pg.evaluate(SNAP); ph = await phone(pg, cdp, 'today'); wk = await phone(pg, cdp, 'week'); await close_phone(pg, cdp)
            r = {'tag': tag, **sn, 'phoneToday': ph['head'], 'weekOn': wk['on']}; rec.append(r); print('  ', json.dumps(r, ensure_ascii=False), flush=True)
            await run.shot(pg, tag)
            WD = '日一二三四五六'
            hudwd = sn['hud'].split(' ')[1] if ' ' in sn['hud'] else ''
            if sn['weekday'] != sn['realWd']: bad.append('%s：G.weekday=%d，日曆 %s 是星期%s（右上角「%s」）' % (tag, sn['weekday'], sn['real'], WD[sn['realWd']], sn['hud']))
            if sn['h'] >= 24 and hudwd: bad.append('%s：過了午夜，右上角「%s」（日期是隔天 %s，星期還是前一天）；手機今天「%s」；週課表亮「%s」' % (tag, sn['hud'], sn['shownDate'], ph['head'][:16], ''.join(wk['on'][:1])))
            return r
        # 先睡到 9/1 以後
        for i in range(0):
            sn = await pg.evaluate(SNAP)
            if sn['real'] >= '2025-09-01': break
            await sleep_bed(pg, cdp, run); await drain(pg, cdp, ['睡到明天早上', '睡覺'], 120)
        await note('base')
        r = await pg.evaluate("(()=>{ const G=GAME.G; G.hour=23.7; GAME.E.hour=G.hour; const ok=OUT.plan(G,{id:'bb_x76',ev:'ev_kai_sunday_supper',day:G.day,h:23.9,late:0.5,place:'宿舍旁的滷味攤',title:'宵夜（BB 測試）',travel:'走過去約 15 分鐘',travelH:0.25}); return {ok, due:!!OUT.due(G), rec:(OUT.get(G,'bb_x76')||{}).state||null}; })()")
        print('   OUT.plan', r, flush=True); run.setup('[捷徑] 23:42，排一個 23:54 的宵夜出遊（ev_kai_sunday_supper，走 15 分）')
        for i in range(60):
            s = await L.state(pg)
            if s['choices']: break
            await pg.wait_for_timeout(1000)
        await drain(pg, cdp, ['出發'], 300)
        await note('B_after_outing')
        await sleep_bed(pg, cdp, run)
        await note('B_next_morning')
        json.dump(rec, open(os.path.join(OUT, 'x76_rec.json'), 'w'), ensure_ascii=False, indent=1)
        print('不一致：'); [print('   -', x) for x in bad]
        run.check('右上角的星期、手機今天、週課表亮的那一欄，和日曆一致', not bad, json.dumps(bad[:6], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
