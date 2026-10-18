"""BB：期末考 AI 補題（LAWWW e7c5c924）——大一上憲法（上）期末考。
[前置／捷徑] 讀檔到考試那天、考前在宿舍；之後照玩家：手機「今天」→ 去考場 → 五題都選第一個 → 交卷。
[前置／捷徑] 交卷後用同一份狀態讀檔到 2026-01-05 07:25 宿舍，看起床的成績單。
看三件事：真的開考、五題；成績單有分數（不是「未開考（題庫不足）」）；考卷上沒有題目來源。
用法：python3 exam_probe.py URL OUT（LW_TESTS 指到 LAWWW 的 tests/）"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]
BASE = {'KX_FIRST_MSG': True, 'fundsV2': 1, 'introDone': True, 'classDone': True, 'metAn': True, 'afternoonDone': True, 'campusIntro': True, 'zheNoodleDone': True}
SRC = re.compile(r'AI|補題|來源|出處|AA_|exam_ai|題庫|Q[0-9]{2,}|LEGAL_REVIEW|Y4_CROSS')


async def tap_choice(pg, cdp, i=0):
    c = await pg.evaluate("(i=>{ const bs=[...document.querySelectorAll('#choices button')]; if(!bs.length) return null; const e=bs[Math.min(i,bs.length-1)]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,bs.map(b=>b.textContent.trim())]; })(%d)" % i)
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700)
    return c and c[2]


async def main():
    run = L.Run('exam_probe', OUT); lines = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + '?turbo'); run.check('遊戲載入', await L.wait_loaded(pg))
        d0 = await pg.evaluate("STORY.termDay('Y1S1',14,1)")
        await L.load_state(pg, {'stage': 'law', 'zone': 'dorm', 'day': d0, 'weekday': 1, 'hour': 8, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14}, 'flags': dict(BASE), 'events': {'done': {}, 'last': {}, 'count': 0}})
        await pg.wait_for_timeout(2000)
        ex = await pg.evaluate("CLS.examList(GAME.G,'Y1S1').map(e=>({id:e.c.id,name:e.c.name,kind:e.kind,day:e.day,key:CALENDAR.dateOf(e.day).key,t0:e.t0,block:e.block}))")
        print('大一上考試：', json.dumps(ex, ensure_ascii=False))
        fin = [e for e in ex if e['kind'] == 'final' and '憲法' in e['name']]
        run.check('大一上有憲法（上）期末考', bool(fin), json.dumps(fin, ensure_ascii=False))
        if not fin: await b.close(); return run.finish()
        e = fin[0]; wd = await pg.evaluate("(d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; })(%d)" % e['day'])
        run.setup('讀檔到 %s（考試那天）%.2f 宿舍房間' % (e['key'], e['t0'] - 1.5))
        await L.load_state(pg, {'stage': 'law', 'zone': 'dorm', 'day': e['day'], 'weekday': wd, 'hour': e['t0'] - 1.5, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14}, 'flags': dict(BASE), 'events': {'done': {}, 'last': {}, 'count': 0}})
        await pg.wait_for_timeout(2500)
        # 先把起床的對話點完
        for _ in range(30):
            s = await L.state(pg)
            if s['choices']: await tap_choice(pg, cdp, 0)
            elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
            else: break
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
        await run.shot(pg, 'phone_today')
        g = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-go]')]; return bs.map(b=>b.textContent.trim().slice(0,30)); })()")
        print('手機今天可以去的：', g)
        c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>/憲法/.test(b.textContent))||document.querySelector('#phoneBody [data-go]'); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        run.check('手機「今天」有去考場的按鈕', bool(c), json.dumps(g, ensure_ascii=False))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
        key = 'Y1S1:%s:final' % e['id']; qn = 0; shot_q = False
        for _ in range(400):
            st = await pg.evaluate("(k=>{ const R=CLS.rec(GAME.G); return (R.exam||{})[k]||null; })(%s)" % json.dumps(key))
            s = await L.state(pg)
            if st and st.get('status') in ('done', 'insufficient') and not s['dlg'] and not s['choices']: break
            if s['dlg']:
                t = s['dtext']; lines.append(t)
                if re.match(r'^[1-5]／5', t):
                    qn += 1
                    if not shot_q: await run.shot(pg, 'exam_q1'); shot_q = True
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
            elif s['choices']:
                opts = await tap_choice(pg, cdp, 0); lines.append('［選項］' + ' ／ '.join(opts or []))
            else:
                await pg.wait_for_timeout(700)
        st = await pg.evaluate("(k=>{ const R=CLS.rec(GAME.G); return (R.exam||{})[k]||null; })(%s)" % json.dumps(key))
        await run.shot(pg, 'exam_after')
        print('考卷上出現的字：'); [print('   ', x[:90]) for x in lines]
        run.check('1. 真的開考：考卷五題（1／5～5／5）', bool(st) and st.get('status') == 'done' and qn >= 5, json.dumps({'status': st, 'qlines': qn}, ensure_ascii=False))
        bad = [x for x in lines if SRC.search(x)]
        run.check('3. 考卷、答案說明上沒有題目來源', not bad, json.dumps(bad, ensure_ascii=False))
        # 成績單
        snap = await pg.evaluate("JSON.stringify(GAME.snapshot?GAME.snapshot():GAME.G)")
        G2 = json.loads(snap); dg = await pg.evaluate("STORY.dayOfKey('2026-01-05')")
        G2.update({'day': dg, 'hour': 7.4, 'zone': 'dorm', 'weekday': 1, 'pos': {'x': -0.6, 'z': -0.4, 'yaw': 3.14}})
        run.setup('用交卷後的同一份狀態讀檔到 2026-01-05 07:24 宿舍（看起床的成績單）')
        await L.load_state(pg, G2); await pg.wait_for_timeout(2500)
        rep = []
        for _ in range(60):
            s = await L.state(pg)
            if s['dlg']:
                rep.append(s['dtext'])
                if '憲法' in s['dtext']: await run.shot(pg, 'report_card')
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
            elif s['choices']: break
            else: await pg.wait_for_timeout(700)
        cl = [x for x in rep if '憲法' in x]
        print('成績單：', cl)
        ok = bool(cl) and not any('未開考' in x.split('憲法')[1][:20] for x in cl) and any(re.search(r'憲法（上）：[0-9]', x) or re.search(r'憲法[^：]*：[^　]*分', x) for x in cl)
        run.check('2. 成績單上憲法（上）有分數，不是「未開考（題庫不足）」', ok, json.dumps(cl, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()

asyncio.run(main())
