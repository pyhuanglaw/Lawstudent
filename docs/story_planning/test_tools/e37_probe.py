"""BB：E37（2025-08-30 政大校門）在 8/29 轉進法律系以後還在不在。
[前置／捷徑] 讀檔到 2025-08-28 21:05 在臺北的家（經濟系、和可昕交往中，flow_v0_home 的同一組旗標）。之後照玩家：家裡選單「快轉」→「到下一個有事的日子」→ 8/29 早上「去學校」→ 等 6:00 轉法律系、搬宿舍。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
CHK = "(()=>{ const G=GAME.G, q=OUT.get(G,'y0_e37'); return {key:CALENDAR.dateOf(G.day).key,h:+G.hour.toFixed(2),stage:G.stage,zone:G.zone,home:HOME.at(G),sent:PHONE.sent(G,'y0_e37_ask'),out:q?{state:q.state,day:CALENDAR.dateOf(q.day).key,h:q.h}:null,done:!!(G.events.done||{}).ev_y0_e37,outings:(G.outings||[]).map(o=>o.id+':'+o.state)}; })()"
async def pick(pg, cdp, rx):
    c = await pg.evaluate("(r=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(b=>new RegExp(r).test(b.textContent)); if(!e) return null; e.scrollIntoView({block:'center'}); const x=e.getBoundingClientRect(); return [x.left+x.width/2,x.top+x.height/2,e.textContent.trim().slice(0,24)]; })(%s)" % json.dumps(rx))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200)
    return c and c[2]
async def drain(pg, cdp, n=40):
    for _ in range(n):
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
        else: return s
    return await L.state(pg)
async def main():
    run = L.Run('e37_probe', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        d = await pg.evaluate("STORY.dayOfKey('2025-08-28')")
        st = {'stage': 'econ', 'zone': 'campus', 'day': d, 'weekday': 4, 'hour': 21.08, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
              'home': {'at': True, 'base': True, 'day': d},
              'contacts': {k: d - 300 for k in ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']},
              'flags': {'ECON_CAMP_OPEN': True, 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True, 'KX_DATING_SINCE': '2024-10-17',
                        'KX_FIRST_MSG': True, 'fundsV2': 1, 'allowanceMonth': 8, 'Y0_STICKY': True, 'E36_RESULT': True},
              'events': {'done': {'ev_y0_e30': 1, 'ev_y0_a3': 1, 'ev_y0_e26': 1, 'ev_y0_e02': 1, 'ev_y0_e36h': 1, 'ev_y0_e36rh': 1}, 'last': {}, 'count': 6}}
        run.setup('讀檔到 2025-08-28（四）21:05 在臺北的家（經濟系、和可昕交往中）')
        await L.load_state(pg, st); await pg.wait_for_timeout(4000)
        await drain(pg, cdp)
        a = await pg.evaluate(CHK); print('8/28 21:05', json.dumps(a, ensure_ascii=False))
        
        await run.shot(pg, 'a_0828')
        first=True
        for _ in range(200):
            s = await drain(pg, cdp); g = await pg.evaluate(CHK)
            if g['stage'] == 'law' and not s['dlg'] and not s['choices']: break
            if s['choices']:
                t = await pick(pg, cdp, '快轉') or await pick(pg, cdp, '到下一個有事') or await pick(pg, cdp, '去學校') or await pick(pg, cdp, '.')
                print('  ▶', t, g['key'], g['h'])
            if first and g['sent']:
                first=False; run.check('1. 8/28 21:00 可昕私訊＋排了 8/30 14:00 政大校門（離開家裡的選單以後補發）', bool(g['out']) and g['out']['day'] == '2025-08-30', json.dumps(g, ensure_ascii=False))
            else: await pg.wait_for_timeout(1500)
        for _ in range(300):
            s = await drain(pg, cdp); g = await pg.evaluate(CHK)
            if s['choices']: print('  ▶', await pick(pg, cdp, '.'), g['key'], g['h'])
            if g['stage'] == 'law' and not s['dlg'] and not s['choices'] and not s.get('busy'): break
            await pg.wait_for_timeout(1500)
        await pg.wait_for_timeout(3000); await drain(pg, cdp)
        c = await pg.evaluate(CHK); print('轉法律系以後', json.dumps(c, ensure_ascii=False)); await run.shot(pg, 'b_law')
        run.check('2. 8/29 轉進法律系以後，8/30 政大校門的約還在（出遊表或手機「今天」看得到）', c['stage'] == 'law' and c['out'] is not None, json.dumps(c, ensure_ascii=False))
        # 照玩家過到 8/30：宿舍睡覺 → 8/30 手機「今天」看政大校門、出發
        lines = []; seen_today = None
        skips = []
        for i in range(600):
            g = await pg.evaluate(CHK)
            if g['done']: break
            s = await L.state(pg)
            if s['dlg']:
                lines.append(s['dtext'][:40]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if s['choices']:
                t = await pick(pg, cdp, '政大') or await pick(pg, cdp, '出發') or await pick(pg, cdp, '睡到明天早上') or await pick(pg, cdp, '^睡') or await pick(pg, cdp, '.')
                print('  ▶', t, g['key'], g['h']); continue
            if g['key'] == '2025-08-30' and i % 4 == 0:
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
                await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
                txt = await pg.evaluate("(document.querySelector('#phoneBody')||{}).textContent||''")
                if seen_today is None: seen_today = txt; await run.shot(pg, 'c_phone_today_0830')
                c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>/政大/.test(b.textContent)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })()")
                if c: print('  手機前往', c[2]); await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); continue
                k = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; if(!bs.length) return null; const e=bs[0]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
                if k: skips.append('%s %.2f %s' % (g['key'], g['h'], k[2])); await L.touch_tap(cdp, k[0], k[1]); await pg.wait_for_timeout(1500); continue
                await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600)
            if g['key'] == '2025-08-29' and i % 10 == 0:
                bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed:
                    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床')
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); continue
            await pg.wait_for_timeout(1200)
        g = await pg.evaluate(CHK); print('最後', json.dumps(g, ensure_ascii=False)); await run.shot(pg, 'd_end')
        print('跳過時間：', skips)
        print('8/30 手機「今天」：', (seen_today or '')[:300])
        print('對話（最後 12 句）：'); [print('   ', x) for x in lines[-12:]]
        run.check('3. 8/30 照玩家出發去政大校門，E37 演完（ev_y0_e37 done）', g['done'], json.dumps(g, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
