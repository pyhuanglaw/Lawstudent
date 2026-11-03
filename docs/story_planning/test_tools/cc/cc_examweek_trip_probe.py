"""CC（帳號 A）11-03：AA_638 ①-4（0370e8820，候選 b1ae1c390）考試週出遊：只擋「自己有期末考的那一天和前一天」，原因字「那幾天有考試。」。
照玩家的方式約：手機 → 訊息 → 和語彤的對話 → 「約」→「出去玩…」→ 地點分類 → 地點 →（交通）→ 日期 → 出發時間，全部用手指點選項。
① 考試週裡沒考試、隔天也沒考試的那一天：臺中（D26）一日遊 09:00 出發 → 不灰、小字沒有「考試」
② 考試那天、考試前一天：一日遊 09:00 出發 → 灰掉、小字逐字「那幾天有考試。」；點了 → 說「那幾天有考試。」、沒有約成
③ 兩天一夜：考試前一天出發（第二天是考試）→ 同上被擋（選單裡「兩天一夜…」那一支）
④ 考試前一天的半日／晚上（D13，18:30）→ 不擋「考試」
【前置／捷徑】讀檔到大一下第 16 週（期末考週）的前一週六 07:00 宿舍（同 tests/date_examweek_unit.js 的 ex-6）；
和語彤交往中（dating_heroine_03）、有她的聯絡方式（G.contacts）、錢 20000；手機自動打開關掉。
用法：LW_TESTS=<wt>/tests python3 cc_examweek_trip_probe.py '<URL>/index.html' <out>"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
URL = sys.argv[1]; OUT = sys.argv[2]
WHY = '那幾天有考試。'
BASE = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'L118_FIRST_SENT': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'dating_heroine_03': True}
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + info if info else ''), flush=True)
    if not ok: fails.append(name)

CH = "[...document.querySelectorAll('#choices button')].map((b,i)=>({i,t:b.innerText.replace(/\\n/g,' / '),dim:b.classList.contains('dim')||b.disabled||b.getAttribute('aria-disabled')==='true'}))"

async def choices(pg, wait_s=20):
    for _ in range(wait_s * 2):
        c = await pg.evaluate(CH)
        if c: return c
        if await pg.evaluate("!!(GAME.D&&GAME.D.active)"):
            await L.tap(pg, pg._cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return []

async def pick(pg, cdp, want, log):
    """在目前的選項裡找開頭（或包含）是 want 的那一個，用手指點；回傳那一個選項的資料"""
    c = await choices(pg)
    hit = next((x for x in c if x['t'].startswith(want)), None) or next((x for x in c if want in x['t']), None)
    log.append({'want': want, 'opts': [x['t'][:40] for x in c], 'hit': hit and hit['t'][:60]})
    if not hit: return None, c
    await pg.evaluate("(()=>{ const b=document.querySelectorAll('#choices button')[%d]; b.id='__ccpick'; })()" % hit['i'])
    await L.tap(pg, cdp, '#__ccpick'); await pg.wait_for_timeout(900)
    return hit, c

async def open_invite(pg, cdp):
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="msg"]'); await pg.wait_for_timeout(900)
    ok = await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-th=\"p:heroine_03\"]'); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })()")
    if not ok: return False
    await L.tap(pg, cdp, '#phoneBody [data-th="p:heroine_03"]'); await pg.wait_for_timeout(900)
    if not await pg.evaluate("!!document.querySelector('#phoneBody [data-inv]')"): return False
    await L.tap(pg, cdp, '#phoneBody [data-inv]'); await pg.wait_for_timeout(1200)
    return True

async def back_out(pg, cdp):
    for _ in range(8):
        c = await pg.evaluate(CH)
        if not c: break
        q = next((x for x in c if x['t'].startswith('算了') or x['t'].startswith('‹') or x['t'].startswith('返回') or x['t'].startswith('先不要')), None)
        if not q: q = c[-1]
        await pg.evaluate("(()=>{ const b=document.querySelectorAll('#choices button')[%d]; b.id='__ccpick'; })()" % q['i'])
        await L.tap(pg, cdp, '#__ccpick'); await pg.wait_for_timeout(800)
    for _ in range(6):
        if not await pg.evaluate("!!(GAME.D&&GAME.D.active)"): break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600)
    await L.close_panels(pg, cdp)

async def trip(pg, cdp, label, route, time_want):
    """route：一串選項開頭；最後在出發時間那一層找 time_want，回傳那一個選項（不點）"""
    log = []
    if not await open_invite(pg, cdp):
        check(f'{label}：手機打得開和語彤的對話、有「約」', False); return None, log
    for w in route:
        h, c = await pick(pg, cdp, w, log)
        if not h: check(f'{label}：選單有「{w}」', False, json.dumps([x['t'][:30] for x in c], ensure_ascii=False)); return None, log
    c = await choices(pg)
    t = next((x for x in c if x['t'].startswith(time_want)), None)
    log.append({'time_opts': [x['t'][:50] for x in c]})
    return t, log

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=False)
        pg._cdp = cdp
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        info = await pg.evaluate("""(()=>{ const T=STORY.termDay; const exD=[]; const G0={day:0,flags:{},choices:{},events:{done:{}},stats:{}};
          return {w16a:T('Y1S2',16,1), w16b:T('Y1S2',16,7)}; })()""")
        d0 = info['w16a'] - 2   # 第 15 週六（考試週之前）
        print(f'【前置／捷徑】讀檔到大一下第 15 週六 07:00 宿舍（day {d0}）；dating_heroine_03、G.contacts.heroine_03、錢 20000', flush=True)
        wd = await pg.evaluate(f"CALENDAR.dateOf({d0}).wd%7")
        await L.load_state(pg, {'zone': 'dorm', 'hour': 7.0, 'day': d0, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': 20000, 'flags': BASE}, quiet_events=True)
        for _ in range(60):
            if await pg.evaluate("!!(GAME.E&&GAME.E.zone&&GAME.E.player&&!(GAME.isEntering&&GAME.isEntering()))"): break
            await pg.wait_for_timeout(1000)
        await pg.evaluate("(()=>{ const G=GAME.G; G.contacts=G.contacts||{}; G.contacts.heroine_03=1; if(typeof INV!=='undefined'&&INV.rec) INV.rec(G); PHONE.postAt(G,{th:'p:heroine_03',from:'heroine_03',text:'考完要去哪裡？'},G.day,6.9); })()")
        await pg.wait_for_timeout(1500)
        ex = await pg.evaluate("""(()=>{ const G=GAME.G, a=STORY.termDay('Y1S2',16,1), b=STORY.termDay('Y1S2',16,7)+1, out=[];
          for(let d=a;d<=b;d++) if(CLS.dayItems(G,d).some(it=>it.exam)) out.push(d); return out; })()""")
        free = next((x for x in range(info['w16a'], info['w16b'] + 1) if x not in ex and x + 1 not in ex), None)
        ca = await pg.evaluate("DATE.canAsk(GAME.G,'heroine_03')")
        print(f'  考試的日子={ex} 考試週裡沒考試、隔天也沒考試={free}；DATE.canAsk={json.dumps(ca, ensure_ascii=False)}', flush=True)
        check('前置：第 16 週有自己的期末考日子', bool(ex), json.dumps(ex))
        check('前置：可以約語彤出去（DATE.canAsk）', bool(ca and ca.get('ok')), json.dumps(ca, ensure_ascii=False))
        if not ex or not (ca and ca.get('ok')):
            print('FAILED（前置不成立）', flush=True); await b.close(); sys.exit(1)
        lab = lambda d: pg.evaluate(f"DATE.dayLabel(GAME.G,{d}).split('（')[0].trim()")
        grp = await pg.evaluate("(()=>{ const g=DATE.GROUPS.find(g=>g.ids.includes('D26')); const h=DATE.GROUPS.find(g=>g.ids.includes('D13')); return {d26:g&&g.t, d13:h&&h.t, n26:DATE.loc('D26').name, n13:DATE.loc('D13').name}; })()")
        out = '出去玩'
        e0 = ex[0]
        cases = []
        if free is not None: cases.append(('① 考試週沒考試的日子', free, False))
        cases += [('② 考試那天', e0, True), ('② 考試前一天', e0 - 1, True)]
        for name, d, blocked in cases:
            dl = await lab(d)
            t, log = await trip(pg, cdp, f'{name}（{dl}，臺中一日遊 09:00）', [out, grp['d26'], grp['n26'], '高鐵', dl], '09:00')
            if t is None:
                check(f'{name}：找得到「09:00 出發」', False, json.dumps(log, ensure_ascii=False)[:400])
            elif blocked:
                check(f'{name}（{dl}）：09:00 出發灰掉、小字逐字「{WHY}」', t['dim'] and WHY in t['t'], t['t'])
                await pg.screenshot(path=os.path.join(OUT, f'blocked_{d}.png'))
                n0 = await pg.evaluate("(GAME.G.dates||[]).length+(GAME.G.invites||[]).length")
                await pick(pg, cdp, '09:00', [])
                said = await pg.evaluate("(()=>{ const a=document.getElementById('dlgText'), t=document.getElementById('toast'), c=document.getElementById('caption'); return [a&&a.textContent,t&&t.textContent,c&&c.textContent].join(' | '); })()")
                n1 = await pg.evaluate("(GAME.G.dates||[]).length+(GAME.G.invites||[]).length")
                check(f'{name}：點了只說「{WHY}」、沒有約成', WHY in (said or '') and n1 == n0, f'{said} / {n0}->{n1}')
            else:
                check(f'{name}（{dl}）：09:00 出發可以選（不灰、小字沒有「考試」）', not t['dim'] and '考試' not in t['t'], t['t'])
                await pg.screenshot(path=os.path.join(OUT, f'free_{d}.png'))
            await back_out(pg, cdp)
        # ③ 兩天一夜
        dl = await lab(e0 - 1)
        log = []
        if await open_invite(pg, cdp):
            h, c = await pick(pg, cdp, out, log)
            h, c = await pick(pg, cdp, '兩天一夜', log)
            if not h:
                check('③ 選單有「兩天一夜…」', False, json.dumps([x['t'][:30] for x in c], ensure_ascii=False))
            else:
                h, c = await pick(pg, cdp, grp['n26'], log)
                c = await choices(pg)
                if any(x['t'].startswith('只去') for x in c): await pick(pg, cdp, '只去', log); c = await choices(pg)
                if any('高鐵' in x['t'] for x in c): await pick(pg, cdp, '高鐵', log); c = await choices(pg)
                dd = next((x for x in c if x['t'].startswith(dl)), None)
                if dd and not dd['dim']:
                    await pick(pg, cdp, dl, log); c = await choices(pg)
                    tt = next((x for x in c if x['t'].startswith('09:00')), None)
                    check(f'③ 兩天一夜（{dl} 出發、第二天考試）：灰掉、小字「{WHY}」', bool(tt) and tt['dim'] and WHY in tt['t'], json.dumps(tt or c[:6], ensure_ascii=False)[:300])
                else:
                    check(f'③ 兩天一夜（{dl} 出發、第二天考試）：日期那一層就灰掉、小字「{WHY}」', bool(dd) and dd['dim'] and WHY in dd['t'], json.dumps(dd or [x['t'][:30] for x in c], ensure_ascii=False)[:300])
                await pg.screenshot(path=os.path.join(OUT, 'overnight_blocked.png'))
        else:
            check('③ 手機打得開和語彤的對話、有「約」', False)
        await back_out(pg, cdp)
        # ④ 考試前一天的晚上
        t, log = await trip(pg, cdp, f'④ 考試前一天晚上（{dl}，{grp["n13"]} 18:30）', [out, grp['d13'], grp['n13'], dl], '18:30')
        if t is None:
            # 交通只有一種時不會問交通：上面 route 沒有交通那一步；找不到時把選項印出來
            check(f'④ 考試前一天晚上：找得到「18:30 出發」', False, json.dumps(log, ensure_ascii=False)[:500])
        else:
            check(f'④ 考試前一天晚上 18:30：不擋「考試」', not t['dim'] or '考試' not in t['t'], t['t'])
            await pg.screenshot(path=os.path.join(OUT, 'evening_ok.png'))
        await back_out(pg, cdp)
        check('沒有 JS 例外', not errs, '；'.join(errs[:3]))
        await b.close()
    print('ALL PASS' if not fails else 'FAILED %d: %s' % (len(fails), ', '.join(fails[:6])), flush=True)
    sys.exit(1 if fails else 0)
asyncio.run(main())
