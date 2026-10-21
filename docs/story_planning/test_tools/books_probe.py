"""BB（帳號 A）2026-10-21：SYS-BOOKS-1018（LAWWW 20:23；USER_WANTS X15，開發分支 1b6b1eed 起）書店照課賣教科書＋期末考「再想一次」。
  econList  經濟系 9 月走進舊路書房：書單《經濟學原理》《初等會計學》《微積分》，沒有《民法總則》
            【前置】讀 qa_play 存的經濟系狀態，改到 2024-09-10 14:00 書店裡；網址加 &nofastecon（經濟系 9/2～10/31 空下來 1.5 秒就快轉，走不到書店，見 econWalk）
  lawBook   法律系大一上：書店買《憲法》（錢 −650、提示「買了《憲法》教科書」）→ 宿舍書桌讀 1 小時憲法（準備度 +2）→ 12/15 憲法（上）期末考：
            第一題故意選錯 → 提示「課本上讀過這一題——再想一次。」、選錯的那個拿掉（剩 3 個）再選一次
  lawNoBook 對照：沒買課本，第一題選錯就直接下一題（沒有提示、不再選一次）
  econWalk  經濟系 30 分鐘版（9/2～10/31）推著搖桿走路的時候，會不會被快轉帶走（讀碼：econff3d.js S.tick 的「空下來」沒有排除搖桿）
【前置】讀使用者 9/25 存檔改日期、地點（書店、宿舍、期末考那天的宿舍＝同一份狀態接著改，等於【捷徑】跳日期，標在 setup）。選書、讀書、考試都照玩家點。
不是 iPhone：Playwright Chromium（SwiftShader）手機橫向模擬、?turbo。
用法：LW_TESTS=<開發分支>/tests python3 books_probe.py '<URL>/index.html?turbo' <輸出資料夾> <使用者存檔.json> <經濟系狀態.json>（SCEN=econList,lawBook,...）"""
import os, sys, json, asyncio, time, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE, ECON = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
SCEN = os.environ.get('SCEN', '').split(',') if os.environ.get('SCEN') else None
bad = []; results = {}
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {key:d.key, h:+(+G.hour).toFixed(2), zone:G.zone, money:G.money|0, stage:G.stage}; })()"""
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const k=()=>{ try{ const G=GAME.G; return CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2); }catch(e){ return ''; } };
  const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push(k()+' '+(n?n+'：':'')+t); }catch(e){} return o.apply(this,arguments); };
  const ot=GAME.toast; GAME.toast=function(t){ try{ window.__LOG.push(k()+' TOAST:'+t); }catch(e){} return ot.apply(this,arguments); };
  if(GAME.say){ const s=GAME.say; GAME.say=function(n,t){ try{ window.__LOG.push(k()+' SAY:'+(typeof t==='string'?t:(typeof n==='string'?n:''))); }catch(e){} return s.apply(this,arguments); }; } })()"""


def chk(sc, ok, what, detail=''):
    say('[%s] %s %s %s' % ('PASS' if ok else 'FAIL', sc, what, detail)); results.setdefault(sc, []).append({'ok': ok, 'what': what, 'detail': detail})
    if not ok: bad.append('%s：%s %s' % (sc, what, detail))


async def tap_js(pg, cdp, js):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()||'(空)']; })()" % js)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); return c[2]


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(), dis:b.disabled||b.classList.contains('dim')||getComputedStyle(b).opacity<0.6}))")


async def pick(pg, cdp, start):
    return await tap_js(pg, cdp, "[...document.querySelectorAll('#choices button')].find(b=>b.textContent.trim().startsWith(%s))" % json.dumps(start))


async def wait_choices(pg, cdp, secs=30):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']: return await choices(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return []


async def drain(pg, cdp, secs=60):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['choices'] or s['busy']: return
        return


async def load(pg, run, G, why, url_extra=''):
    await L.load_state(pg, G); await pg.wait_for_timeout(3500); await pg.evaluate(HOOK); await pg.evaluate('window.__LOG=[]')
    run.setup(why)


def base_law(base, key_day, hour, zone, pos=None, money=5000, books=None):
    G = json.loads(json.dumps(base)); G = G.get('G', G)
    G.update({'day': key_day, 'hour': hour, 'zone': zone, 'pos': pos, 'money': money})
    F = G['flags']; F['books'] = dict(books or {}); F['textbook'] = False
    return G


async def bookstore_menu(pg, cdp, run, tag):
    """書店櫃台「看看法律書與文具」→ 選單"""
    lab = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).filter(i=>!i.hidden&&/看看/.test(i.label||'')); return it.map(i=>[i.label,+i.x.toFixed(1),+i.z.toFixed(1)]); })()")
    say('   書店的互動點：%s' % lab)
    if lab and not await pg.evaluate("(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')&&/看看/.test(b.textContent); })()"):
        await L.go_to(pg, cdp, run, lab[0][1], lab[0][2], 0.8, lab[0][0], max_s=60)
    await L.tap(pg, cdp, '#interact'); cs = await wait_choices(pg, cdp, 20); await run.shot(pg, '%s_menu' % tag)
    say('   書店選單：%s' % json.dumps(cs, ensure_ascii=False)); return cs


async def s_econ_list(pg, cdp, run, base, econ):
    G = json.loads(json.dumps(econ)); G = G.get('G', G)
    d = await pg.evaluate("STORY.dayOfKey('2024-09-10')")
    G.update({'day': d, 'hour': 14.0, 'zone': 'bookstore', 'pos': {'x': 0, 'z': 4}, 'money': 8000, 'weekday': 2}); G['flags']['books'] = {}
    await load(pg, run, G, '[前置] econList：qa_play 存的經濟系狀態改到 2024-09-10（二）14:00 舊路書房裡，網址 &nofastecon（不然 9 月走不到書店）')
    cs = await bookstore_menu(pg, cdp, run, 'econ')
    ts = [c['t'] for c in cs]
    for w in ('《經濟學原理》', '《初等會計學》', '《微積分》'): chk('econList', any(w in t for t in ts), '書單有%s' % w)
    chk('econList', not any('民法總則' in t for t in ts), '書單沒有《民法總則》', json.dumps(ts, ensure_ascii=False))
    hint = next((t for t in ts if '經濟學原理' in t), '')
    if '期末多一次想起答案' in hint: say('   （觀察）經濟學原理的提示寫「期末多一次想起答案」，這一科沒有五題的期末考（子代理讀碼：isExamCourse 是 false）')
    await pick(pg, cdp, '《經濟學原理》'); await pg.wait_for_timeout(1500); await drain(pg, cdp)
    lg = await pg.evaluate("window.__LOG||[]"); sn = await pg.evaluate(SNAP); F = await pg.evaluate("GAME.G.flags.books||{}")
    chk('econList', any('買了《經濟學原理》教科書' in l for l in lg) and sn['money'] == 8000 - 650 and F.get('經濟學原理'), '買《經濟學原理》：錢 −650、提示「買了《經濟學原理》教科書」', '錢 %d、書 %s' % (sn['money'], json.dumps(F, ensure_ascii=False)))


async def s_law(pg, cdp, run, base, with_book):
    tag = 'lawBook' if with_book else 'lawNoBook'
    d0 = await pg.evaluate("STORY.dayOfKey('2025-09-15')")
    if with_book:
        G = base_law(base, d0, 14.0, 'bookstore', {'x': 0, 'z': 4})
        await load(pg, run, G, '[前置] %s：使用者存檔改到 2025-09-15（一）14:00 舊路書房裡、錢 5000、沒有任何課本' % tag)
        cs = await bookstore_menu(pg, cdp, run, tag); ts = [c['t'] for c in cs]
        for w in ('《憲法》', '《刑法總則》', '《民法總則》'): chk(tag, any(w in t for t in ts), '法律系大一上書單有%s' % w)
        m0 = (await pg.evaluate(SNAP))['money']
        await pick(pg, cdp, '《憲法》'); await pg.wait_for_timeout(1500); await drain(pg, cdp)
        lg = await pg.evaluate("window.__LOG||[]"); sn = await pg.evaluate(SNAP); F = await pg.evaluate("GAME.G.flags.books||{}")
        chk(tag, any('買了《憲法》教科書' in l for l in lg) and sn['money'] == m0 - 650 and F.get('憲法'), '買《憲法》：錢 −650、提示「買了《憲法》教科書」', '錢 %d→%d、書 %s' % (m0, sn['money'], json.dumps(F, ensure_ascii=False)))
        nar = [l for l in lg if '書比想像中重' in l or '新書的味道' in l]
        say('   買書的旁白（AA_370 第 6 節後段，子代理讀碼：還沒做）：%s' % (nar or '（沒有）'))
        # 宿舍書桌讀 1 小時憲法
        st = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())")); G2 = st.get('G', st); G2.update({'zone': 'dorm', 'pos': None, 'hour': 15.0})
        await load(pg, run, G2, '[前置] %s：同一份狀態（買了憲法）搬到宿舍 15:00' % tag)
        p0 = await pg.evaluate("((GAME.G.courses||{}).prep||{}).const_1|0")
        desk = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&/書桌/.test(i.label||'')); return it?[it.x,it.z,it.label]:null; })()")
        if desk and await L.go_to(pg, cdp, run, desk[0], desk[1], 0.8, desk[2], max_s=60):
            await L.tap(pg, cdp, '#interact'); cs = await wait_choices(pg, cdp, 15); say('   書桌：%s' % [c['t'][:16] for c in cs])
            if await pick(pg, cdp, '讀書'):
                cs = await wait_choices(pg, cdp, 10); say('   讀書：%s' % [c['t'][:16] for c in cs]); await pick(pg, cdp, '讀 1 小時')
                cs = await wait_choices(pg, cdp, 10); say('   哪一科：%s' % [c['t'][:20] for c in cs]); await pick(pg, cdp, '憲法')
                await pg.wait_for_timeout(2500); await drain(pg, cdp)
        p1 = await pg.evaluate("((GAME.G.courses||{}).prep||{}).const_1|0"); lg = await pg.evaluate("window.__LOG||[]")
        chk(tag, p1 - p0 == 2, '有課本讀 1 小時憲法：準備度 +2', '%d → %d；%s' % (p0, p1, [l for l in lg if '讀了一小時' in l][:1]))
        st = json.loads(await pg.evaluate("JSON.stringify(GAME.snapshot())")); G3 = st.get('G', st)
    else:
        G3 = base_law(base, d0, 15.0, 'dorm')
    # 期末考：12/15（一）憲法（上）09:10 霖澤館 201
    d1 = await pg.evaluate("STORY.dayOfKey('2025-12-15')"); G3.update({'day': d1, 'hour': 8.75, 'zone': 'dorm', 'pos': None, 'weekday': 1})
    await load(pg, run, G3, '[捷徑] %s：同一份狀態跳到 2025-12-15（一）08:45 宿舍（期末考那天）' % tag)
    t0 = time.time(); started = False
    while time.time() - t0 < 120 and not started:
        s = await L.state(pg)
        if '／5' in (s.get('dtext') or '') or (await pg.evaluate("(window.__LOG||[]).some(l=>/考卷發下來/.test(l))")): started = True; break
        if s['choices']:
            cs = await choices(pg); t = next((c['t'] for c in cs if '直接去上課' in c['t'] and '憲法' in c['t']), None) or next((c['t'] for c in cs if c['t'].startswith('直接去上課')), None)
            if t: await pick(pg, cdp, t); say('   ▶ %s' % t[:30]); continue
            say('   選項：%s' % [c['t'][:20] for c in cs]); await pick(pg, cdp, cs[0]['t'])
            continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if not s['busy']:   # 照玩家：手機「今天」→ 憲法（上）那一行的「直接去上課」
            if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()") is False:
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await tap_js(pg, cdp, "document.querySelector('#phoneTabs button[data-ptab=\"today\"]')")
            got = await tap_js(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-go]')].find(b=>/直接去上課|去上課/.test(b.textContent)&&/憲法/.test((b.closest('.item')||b.parentElement||{}).textContent||''))")
            say('   手機今天：%s' % got)
        await pg.wait_for_timeout(1200)
    # 考試：每一題對 EXAM_BANK 找答案；第一題故意選錯
    retried = None; n = 0; t0 = time.time(); first_opts = None
    while time.time() - t0 < 300:
        s = await L.state(pg)
        if s['dlg']:
            txt = await pg.evaluate("(document.getElementById('dlgText')||{}).textContent||''")
            if re.match(r'^\d／5', txt): pass
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['choices']:
            lg = await pg.evaluate("window.__LOG||[]"); qline = next((l for l in reversed(lg) if re.search(r'(?:^| |:)\d／5　', l)), None)
            if not qline: cs = await choices(pg); say('   選項（不是考題）：%s' % [c['t'][:16] for c in cs]); await pick(pg, cdp, cs[0]['t']); continue
            qi = int(re.search(r'(?:^| |:)(\d)／5　', qline).group(1)); qtext = qline.split('／5　', 1)[1]
            ans = await pg.evaluate("(t=>{ const q=CLS.examQuestions('const_1','Y1S1').find(q=>q.q===t); return q?{a:String(q.answer), type:q.type||'', n:q.options?Object.keys(q.options).length:2}:null; })(%s)" % json.dumps(qtext))
            cs = await choices(pg); ts = [c['t'] for c in cs]
            key = lambda t: (re.match(r'^（(.)）', t) or [None, t])[1]
            if ans is None: say('   ⚠ 第 %d 題在題庫裡找不到：%s' % (qi, qtext[:30])); await pick(pg, cdp, ts[0]); continue
            if qi == 1 and retried is None and first_opts is None:
                first_opts = ts; wrong = next((t for t in ts if key(t) != ans['a']), ts[0])
                say('   第 1 題（%d 個選項，答案 %s）故意選「%s」' % (len(ts), ans['a'], wrong[:20])); await pick(pg, cdp, wrong); await pg.wait_for_timeout(1500)
                s2 = await L.state(pg); cs2 = await choices(pg); lg2 = await pg.evaluate("window.__LOG||[]")
                toast = any('課本上讀過這一題——再想一次。' in l for l in lg2[-6:])
                retried = {'toast': toast, 'n2': len(cs2) if s2['choices'] else 0, 'wrongGone': not any(c['t'] == wrong for c in cs2), 'still_q1': not any(re.search(r'(?:^| |:)2／5　', l) for l in lg2)}
                await run.shot(pg, '%s_q1_after_wrong' % tag); say('   選錯以後：%s' % json.dumps(retried, ensure_ascii=False))
                continue
            right = next((t for t in ts if key(t) == ans['a']), ts[0]); await pick(pg, cdp, right); n += 1; continue
        if await pg.evaluate("(window.__LOG||[]).some(l=>/交卷/.test(l))"): break
        await pg.wait_for_timeout(700)
    rec = await pg.evaluate("((GAME.G.courses||{}).examRecall||{})['Y1S1:const_1:final']||null"); ex = await pg.evaluate("((GAME.G.courses||{}).exam||{})['Y1S1:const_1:final']||null")
    lg = await pg.evaluate("window.__LOG||[]"); say('   交卷：%s；examRecall=%s；%s' % ([l for l in lg if '交卷' in l][:1], rec, json.dumps(ex, ensure_ascii=False)[:200]))
    if retried is None: chk(tag, False, '期末考沒有開始（或第一題沒有選項）'); return
    if with_book:
        chk(tag, retried['toast'], '有課本：第一題選錯出現「課本上讀過這一題——再想一次。」')
        chk(tag, retried['n2'] == len(first_opts) - 1 and retried['wrongGone'] and retried['still_q1'], '選錯的那個拿掉、同一題再選一次（剩 %d 個）' % retried['n2'], json.dumps(retried, ensure_ascii=False))
        chk(tag, rec == 1, 'examRecall 記第 1 題', str(rec))
        nar = [l for l in lg if '你想起課本上那一段' in l]; say('   再想一次的旁白（AA_370 第 6 節後段，還沒做）：%s' % (nar or '（沒有）'))
    else:
        chk(tag, not retried['toast'] and not retried['still_q1'], '沒課本：第一題選錯直接下一題（沒有提示、不再選）', json.dumps(retried, ensure_ascii=False))


async def s_econ_walk(pg, cdp, run, base, econ):
    await L.tap(pg, cdp, '#btnNew'); run.setup('econWalk：標題「從經濟系開始」新遊戲（不改狀態）')
    t0 = time.time(); ready = False
    while time.time() - t0 < 900:
        on = await pg.evaluate("(()=>{ try{ return typeof ECONFF!=='undefined'&&ECONFF.on(GAME.G); }catch(e){ return false; } })()")
        s = await L.state(pg)
        if on and not (s['dlg'] or s['choices'] or s['busy']): ready = True; break
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(350); continue
        if s['choices']:
            c = await pg.evaluate("(()=>{ const e=[...document.querySelectorAll('#choices button')][0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(700); continue
        if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide'); })()"): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(400)
    sn0 = await pg.evaluate(SNAP); say('   快轉開始的時候：%s（%s）' % (json.dumps(sn0, ensure_ascii=False), ready))
    if not ready: chk('econWalk', False, '15 分鐘內沒有走到經濟系快轉的時段'); return
    jx, jy = await L.center_of(pg, '#joy'); log = []
    p0 = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    t1 = time.time()
    while time.time() - t1 < 12:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + (25 if int(time.time() * 2) % 2 else -25), 'y': jy - 55}]})
        r = await pg.evaluate("(()=>{ const G=GAME.G, p=GAME.E.player.obj.position; return {k:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2), x:+p.x.toFixed(1), z:+p.z.toFixed(1), dlg:!!(GAME.D&&GAME.D.active), zone:G.zone}; })()")
        r['t'] = round(time.time() - t1, 1); log.append(r); await pg.wait_for_timeout(300)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    await run.shot(pg, 'econWalk_end')
    moved = abs(log[-1]['x'] - p0[0]) + abs(log[-1]['z'] - p0[1]) if log else 0
    jumped = [r for r in log if (r['k'], r['h']) != (sn0['key'], sn0['h']) and (r['k'] != sn0['key'] or abs(r['h'] - sn0['h']) > 0.3)]
    say('   推搖桿 12 秒：走了 %.1f m；日子／時間變了 %d 次取樣：%s' % (moved, len(jumped), json.dumps(jumped[:3], ensure_ascii=False)))
    json.dump(log, open(os.path.join(OUT, 'econWalk.json'), 'w'), ensure_ascii=False, indent=0)
    chk('econWalk', not jumped, '經濟系快轉時段推著搖桿走路，不會被快轉帶走（觀察：讀碼的空下來沒排除搖桿）', json.dumps(jumped[:2], ensure_ascii=False))


SCENS = [('econList', s_econ_list, '&nofastecon'), ('lawBook', lambda *a: s_law(*a[:4], True), ''), ('lawNoBook', lambda *a: s_law(*a[:4], False), ''), ('econWalk', s_econ_walk, '')]


async def main():
    run = L.Run('books', OUT); base = json.load(open(SAVE, encoding='utf-8')); econ = json.load(open(ECON, encoding='utf-8')); allerrs = []
    async with async_playwright() as p:
        for name, fn, extra in SCENS:
            if SCEN and name not in SCEN: continue
            say('== %s' % name); t0 = time.time()
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL + extra); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
                await asyncio.wait_for(fn(pg, cdp, run, base, econ), 1800)
            except asyncio.TimeoutError: chk(name, False, '超過 30 分鐘沒做完')
            except Exception as e: chk(name, False, '例外 %r' % e)
            if errs: chk(name, False, 'JS 例外', json.dumps(errs[:2], ensure_ascii=False)[:200])
            say('   （%.0f 秒）' % (time.time() - t0))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        json.dump({'results': results, 'bad': bad}, open(os.path.join(OUT, 'books.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        for k, v in results.items(): run.check('%s：%d／%d 項' % (k, sum(1 for x in v if x['ok']), len(v)), all(x['ok'] for x in v), '；'.join(x['what'] for x in v if not x['ok'])[:200])
    run.finish()
asyncio.run(main())
