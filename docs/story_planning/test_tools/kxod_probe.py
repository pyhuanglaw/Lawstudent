"""BB（帳號 A）2026-10-22：AA354-KX-OURDAYS-1021＋BUG-KX-OD-SKIPALL-1021（開發分支 d72d8a9f 起；src/kxod3d.js）。
LAWWW 要的：「交往中的存檔從大二上第 1 週跳到大四下，每學期看開學那一則和前兩格（AA_354 第 3 節）」；「畢業以後交往中的存檔，在 3D 裡走一下再看可昕的格子還在」。
  Y2S1、Y2S2（每週）、Y3S1、Y3S2、Y4S1（臺灣路線，隔週＝單週）、Y4S2（開學那一則按「好。」＝改回每週）：
    第 1 週週一 20:00 宿舍讀檔 → 21:00 她的開學私訊（逐字對 kxod3d.js S.MSG）→ 照玩家一天一天過（白天手機「跳過時間」、晚上床上「睡到明天…」），
    「我們的日子」出遊按「出發／接起來」，別人的出遊不去 → 看前兩格的日期、時間（週六 14:00）、有沒有去成（done）。
  PG_SKIP：畢業以後（2029-07）和可昕交往中，等 PGDATE 排好她的固定格（kx_od_<天>）→ 在校園走 90 秒、進出一個區域 → 那一格還是 planned（修改前會被改成 skipped）。
日本路線大三下、美國路線大四上（視訊）這一輪沒測（NOT TESTED）。
【前置】讀使用者存檔改日期、地點、旗標（dating_kexin、KX_OUR_DAY {day:'sat', mode:'mid'}）；quiet_events（條件事件不演；手機、出遊照常）。
Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=Y2S1,...,PG_SKIP python3 kxod_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
STATE = """(()=>{ const G=GAME.G; const d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:d.wd%7, h:+(+G.hour).toFixed(3), zone:G.zone}; })()"""
KXMSG = """(()=>(GAME.G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', tag:m.tag||'', text:String(m.text||''), ask:m.ask?m.ask.opts.map(o=>o.t):null})))()"""
KXOD = """(()=>(typeof OUT==='undefined'?[]:OUT.rec(GAME.G)).filter(q=>/^kx_od_/.test(q.id||'')).map(q=>({id:q.id, day:q.day, d:CALENDAR.dateOf(q.day).key, wd:CALENDAR.dateOf(q.day).wd%7, h:q.h, state:q.state, title:q.title||'', place:q.place||'', kxod:q.kxod||null})))()"""
WD_NAME = '週六'
MSG = {'Y2S1': ['這學期還是{星期}。', '你的課表我看過了。那天下午你沒課。'], 'Y2S2': ['{星期}照舊。', '我們系的讀書會排在週間，不會撞到。'],
       'Y3S1': ['這學期改成隔週。', '讀書會改到{星期}，我推不掉。……我也不想。'], 'Y3S2': ['這學期還是隔週。', '你要是那天有事，前一天跟我說。'],
       'Y4S1': ['最後一年了。還是隔週。', '……你要是忙，可以跟我說。不要不來。'], 'Y4S2': ['最後一個學期。', '我想改回每週。可以嗎？']}
WEEKS = {'Y2S1': (2, 3), 'Y2S2': (2, 3), 'Y3S1': (3, 5), 'Y3S2': (3, 5), 'Y4S1': (3, 5), 'Y4S2': (2, 3)}


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def tap_idx(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k); await pg.wait_for_timeout(250)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def phone_open(pg):
    return await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def answer_asks(pg, cdp, pick, seen):
    pend = await pg.evaluate("(()=>PHONE.pending(GAME.G).map(m=>({id:m.ask.id, th:PHONE.th(m), text:String(m.text||''), opts:m.ask.opts.map(o=>o.t)})))()")
    n = 0
    for m in pend:
        if m['id'] in seen: continue
        want = pick(m)
        if want is None: continue
        seen.add(m['id'])
        if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
        await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
        c = await pg.evaluate("(th=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===th); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(m['th']))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
        k = next((i for i, t in enumerate(m['opts']) if t.startswith(want)), 0)
        c = await pg.evaluate("(a=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(b=>b.dataset.ask===a); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })(%s)" % json.dumps('%s|%d' % (m['id'], k)))
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); say('   手機回 %s：「%s」' % (m['id'], c[2])); n += 1
    if n or await phone_open(pg): await L.phone_away(pg, cdp)
    return n


def choose(ops):
    """「我們的日子」＝出發／接起來；床＝睡到明天；起床的課表選單＝先起床再說；別人的出遊＝不去了；其他＝第一個"""
    for i, o in enumerate(ops):
        if o.startswith(('出發：', '接起來：')) and '我們的日子' in o: return i
    for pre in ('睡到明天', '先起床再說', '先起床'):
        for i, o in enumerate(ops):
            if o.startswith(pre): return i
    if any(o.startswith(('出發：', '接起來：')) for o in ops):
        for i, o in enumerate(ops):
            if o.startswith(('不去了', '今天先不要', '不接')): return i
    return 0


async def quick_go(pg, cdp, zone):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"places\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(800)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(zone))
    if not c: await L.phone_away(pg, cdp); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(60):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2000); return True


async def phone_skip(pg, cdp):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"today\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; const e=bs[bs.length-1]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim()]; })()")
    if not c: await L.phone_away(pg, cdp); return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(2000); return c[2]


async def play_until(pg, cdp, run, uday, until_h, pick, max_s=5400, label='', on_day=None):
    """白天手機「跳過時間」；晚上（17:30 以後）今天還有約就繼續跳／等，沒有就床上「睡到明天…」；不在宿舍又沒有約＝手機回宿舍"""
    t0 = time.time(); seen = set(); ch = []; last = None; still = time.time(); lastday = None; same = 0; lastops = None
    while time.time() - t0 < max_s:
        st = await pg.evaluate(STATE)
        if on_day and st['day'] != lastday: lastday = st['day']; await on_day(st)
        if st['day'] > uday or (st['day'] == uday and st['h'] >= until_h): return True, ch
        key = (st['day'], round(st['h'], 2))
        if key != last: last = key; still = time.time()
        elif time.time() - still > 300: run.note('%s：遊戲時間 5 分鐘沒有前進 %s' % (label, json.dumps(st, ensure_ascii=False))); await run.shot(pg, 'stuck_%s' % label); return False, ch
        if await phone_open(pg): await L.phone_away(pg, cdp); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg); k = choose(ops); ch.append({'at': '%s %.2f' % (st['key'], st['h']), 'opts': ops, 'pick': ops[k] if ops else None})
            same = same + 1 if ops == lastops else 0; lastops = ops
            if same > 15: run.note('%s：同一個選單連續 15 次 %s' % (label, ops)); await run.shot(pg, 'loop_%s' % label); return False, ch
            say('   %s %.2f 選項 %s → %s' % (st['key'], st['h'], [o[:14] for o in ops], ops[k][:20] if ops else ''))
            await tap_idx(pg, cdp, k); await pg.wait_for_timeout(1300); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['busy']: await pg.wait_for_timeout(800); continue
        if await answer_asks(pg, cdp, pick, seen): continue
        h = st['h']; night = h >= 17.5 or h < 5
        today = await pg.evaluate("(()=>{ const G=GAME.G; return (typeof OUT==='undefined'?[]:OUT.rec(G)).some(q=>q.state==='planned'&&q.day===G.day&&q.h>G.hour-0.5); })()")
        bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
        if not night or today:
            if await phone_skip(pg, cdp): continue
            if not bed and not today and st['zone'] != 'dorm':
                if await quick_go(pg, cdp, 'dorm'): continue
            await pg.wait_for_timeout(3000); continue
        if not bed:
            if await quick_go(pg, cdp, 'dorm'): continue
            run.note('%s：晚上不在宿舍、也回不去（%s）' % (label, json.dumps(st, ensure_ascii=False))); await pg.wait_for_timeout(3000); continue
        if await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=120): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1300)
    return False, ch


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def term_run(p, run, base, term, out):
    res = out.setdefault(term, {}); allm = {}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        mon = await pg.evaluate("STORY.termDayIn('%s',1,1)" % term)
        w1, w2 = WEEKS[term]
        exp = [await pg.evaluate("STORY.termDayIn('%s',%d,6)" % (term, w)) for w in (w1, w2)]
        st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
        for k, kk in (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03')):
            dd = await pg.evaluate("STORY.dayOfKey('%s')" % kk)
            if dd <= mon: F[k] = dd
        for k in list(F.keys()):
            if k.startswith('dating_'): F[k] = False
        F.update({'dating_kexin': True, 'KX_OUR_DAY': {'day': 'sat', 'mode': 'mid'}, 'KX_DEC3_MIGRATED': True, 'met_kexin': True})
        G.update({'day': mon, 'hour': 20.0, 'zone': 'dorm', 'pos': None, 'money': max(G.get('money') or 0, 30000), 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % mon)})
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000)
        await pg.evaluate("(()=>{ SOCIAL.remember('kexin','FIRST_MET',''); const R=SOCIAL.rel('kexin'); R.fam=Math.max(R.fam||0,70); R.trust=Math.max(R.trust||0,60); R.comf=Math.max(R.comf||0,60); R.npcRom=Math.max(R.npcRom||0,70); R.rom=Math.max(R.rom||0,60); })()")
        key = await pg.evaluate("CALENDAR.dateOf(%d).key" % mon); ek = [await pg.evaluate("CALENDAR.dateOf(%d).key" % d) for d in exp]
        run.setup('[前置] %s：使用者存檔改到 %s（第 1 週週一）20:00 宿舍；和可昕交往中、KX_OUR_DAY 週六／約在中間；quiet_events' % (term, key))
        res['mon'] = key; res['expect'] = ek
        say('   %s 第 1 週週一 %s；前兩格應在 %s 14:00' % (term, key, ek))

        async def collect(stt):
            for m in await pg.evaluate(KXMSG): allm.setdefault('%s|%s|%s' % (m['d'], m['h'], m['text']), m)
        pick = lambda m: ('好。' if term == 'Y4S2' and m['th'] == 'p:kexin' else None)
        ok, ch = await play_until(pg, cdp, run, exp[1] + 1, 12.0, pick, max_s=3600, label=term, on_day=collect)
        await collect(None); res['reached'] = ok
        ms = sorted([m for m in allm.values() if m['d'] >= key], key=lambda m: (m['d'], m['h'])); res['msgs'] = ms[:30]
        od = [q for q in await pg.evaluate(KXOD) if q['day'] >= mon and q['day'] <= exp[1] + 1]; res['od'] = od
        res['flag'] = await pg.evaluate("GAME.G.flags.KX_OD_Y4S2||null")
        say('   %s 開學那一則：%s' % (term, json.dumps([m for m in ms if m['tag'].startswith('kx_od_open')], ensure_ascii=False)))
        say('   %s 格子：%s' % (term, json.dumps(od, ensure_ascii=False)))
        run.check('%s：玩到第 %d 週週日' % (term, w2), ok, json.dumps(await pg.evaluate(STATE), ensure_ascii=False))
        want = [t.replace('{星期}', WD_NAME) for t in MSG[term]]
        op = [m for m in ms if m['tag'] == 'kx_od_open_' + term]
        run.check('%s：第 1 週週一 21:00 她的開學私訊＝%s' % (term, '／'.join(want)), [m['text'] for m in op] == want and all(m['d'] == key and abs(m['h'] - 21) < 0.1 for m in op), json.dumps(op, ensure_ascii=False)[:400])
        if term == 'Y4S2':
            run.check('Y4S2：最後一句有「好。」「隔週就好。」；按「好。」她回「好。」、改回每週（KX_OD_Y4S2＝weekly）', bool(op) and op[-1]['ask'] == ['好。', '隔週就好。'] and any(m['from'] == 'kexin' and m['text'] == '好。' for m in ms) and res['flag'] == 'weekly', json.dumps({'ask': op[-1]['ask'] if op else None, 'flag': res['flag']}, ensure_ascii=False))
        days = [q['day'] for q in sorted(od, key=lambda q: q['day'])]
        run.check('%s：前兩格在第 %d、%d 週週六 14:00（%s）' % (term, w1, w2, '、'.join(ek)), days[:2] == exp and all(abs(q['h'] - 14) < 0.01 for q in od[:2]), json.dumps([(q['d'], q['wd'], q['h']) for q in od], ensure_ascii=False))
        run.check('%s：兩格都去成了（done）' % term, len(od) >= 2 and all(q['state'] == 'done' for q in sorted(od, key=lambda q: q['day'])[:2]), json.dumps([(q['d'], q['state']) for q in od], ensure_ascii=False))
        if w1 == 3: run.check('%s：隔週＝第 2、4 週沒有格子' % term, not any(q['day'] not in exp for q in od), json.dumps([q['d'] for q in od]))
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % term, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完' % term, False, str(e)[:300])
    await close(b)


async def pg_skip(p, run, out):
    """畢業以後的固定格：在 3D 裡走一下以後還在（BUG-KX-OD-SKIPALL：修改前大一下那段把所有 planned 的 kx_od_ 改成 skipped）"""
    res = out.setdefault('PG_SKIP', {})
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        dk = {k: await pg.evaluate("STORY.dayOfKey('%s')" % k) for k in ('2029-06-01', '2029-06-02', '2029-06-28', '2029-07-09')}
        F = {'dating_kexin': True, 'KX_DEC3_MIGRATED': True, 'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'PG': {'done': {'grad': 1}},
             'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'Y4_PATH': 'other', 'PACKED_Y4': dk['2029-06-01'], 'KX_OUR_DAY': {'day': 'sun', 'mode': 'mid'}}
        G = {'v': 3, 'stage': 'law', 'name': '祐廷', 'day': dk['2029-07-09'], 'hour': 10.0, 'energy': 100, 'money': 22000, 'zone': 'campus',
             'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
             'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1}, 'last': {}, 'count': 0}}
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(8000)
        await pg.evaluate("(()=>{ SOCIAL.remember('kexin','FIRST_MET',''); })()")
        run.setup('[前置] PG_SKIP：最小的畢業後存檔（2029-07-09 10:00 校園；GRADUATED、MOVED_OUT、和可昕交往中、KX_OUR_DAY 週日）；quiet_events')
        t0 = time.time(); before = []
        while time.time() - t0 < 120:
            before = [q for q in await pg.evaluate(KXOD) if q['state'] == 'planned']
            if before: break
            await pg.wait_for_timeout(3000)
        res['before'] = before; say('   PG_SKIP 排好的格子：%s' % json.dumps(before, ensure_ascii=False))
        if not before:
            run.note('PG_SKIP：NOT TESTED——讀檔 2 分鐘內 PGDATE 沒有排出 kx_od_ 的格子（%s）' % json.dumps(await pg.evaluate(KXOD), ensure_ascii=False)[:200])
        else:
            P = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()")
            for dx, dz in ((10, 0), (10, 10), (0, 10), (0, 0)):
                await L.go_to(pg, cdp, run, P[0] + dx, P[1] + dz, 1.5, '校園走一圈', max_s=60)
            await quick_go(pg, cdp, 'gongguan'); await pg.wait_for_timeout(4000); await quick_go(pg, cdp, 'campus'); await pg.wait_for_timeout(4000)
            after = await pg.evaluate(KXOD); res['after'] = after
            ids = {q['id'] for q in before}
            st = {q['id']: q['state'] for q in after if q['id'] in ids}
            say('   PG_SKIP 走完以後：%s' % json.dumps(st, ensure_ascii=False))
            run.check('PG_SKIP：在校園走、去公館再回來以後，可昕畢業以後的固定格還是 planned（沒有被改成 skipped）', bool(st) and all(v == 'planned' for v in st.values()), json.dumps(st, ensure_ascii=False))
        res['errs'] = errs[:3]; run.check('PG_SKIP：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('PG_SKIP：測試跑完', False, str(e)[:300])
    await close(b)


async def main():
    run = L.Run('kxod', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    scen = os.environ.get('SCEN', 'Y2S1,Y2S2,Y3S1,Y3S2,Y4S1,Y4S2,PG_SKIP').split(',')
    async with async_playwright() as p:
        for sid in scen:
            say('== %s' % sid)
            if sid == 'PG_SKIP': await pg_skip(p, run, out)
            else: await term_run(p, run, base, sid, out)
            json.dump(out, open(os.path.join(OUT, 'kxod.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
