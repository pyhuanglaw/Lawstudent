"""BB：QA-REPRO-1020 驗收（LAWWW 765ac675）：X70 女主角、X76 星期、X71 Café 客人。用使用者 9/25 週四 15:44 溫州街的存檔（v9.10.2 存的，星期記成週五）。
照玩家：標題「讀取」→ 看右上角、手機今天 → 走進 Café（14–18）→ 手機跳到晚上 → Café（18–22、學姊週四在）→ 試坐客人的椅子 →
[捷徑] 23:54 在 Café 等過午夜 → 回宿舍睡 → 9/26 週五早上手機「直接去上課」→ 教室裡找以安、走過去說話 → 總圖 → 中午 Café（11–14）。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SNAP = """(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day), d2=CALENDAR.dateOf(G.day+Math.floor(G.hour/24)); return {day:G.day, real:d.key, realWd:d.wd%7, shown:d2.key, shownWd:d2.wd%7, h:+G.hour.toFixed(2), weekday:G.weekday, hud:(document.getElementById('clockT')||{}).textContent||'', zone:G.zone}; })()"""
PEOPLE = """(()=>{ const E=GAME.E; return E.npcs.filter(n=>n&&n.obj).map(n=>({id:n.charId||n.id||'', name:n.name||'', extra:!!n.isExtra, clerk:!!n.clerk, staff:n.staff||'', seat:!!n.seat, x:+n.obj.position.x.toFixed(1), z:+n.obj.position.z.toFixed(1), lv:n.lv|0, vis:n.obj.visible!==false&&!n.hidden})); })()"""
WD = '日一二三四五六'
bad = []; rep = []
def say(*a):
    s = ' '.join(str(x) for x in a); print(s, flush=True); rep.append(s)
async def drain(pg, cdp, pref=None, secs=120, log=None):
    t0 = time.time()
    while time.time() - t0 < secs:
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(w=>{ const bs=[...document.querySelectorAll('#choices button')]; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().startsWith(t)); if(e) break; } e=e||bs.find(x=>/不|晚一點|之後/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,30)]; })(%s)" % json.dumps(pref or []))
            await L.touch_tap(cdp, c[0], c[1]); print('   ▶', c[2], flush=True)
            if log is not None: log.append('▶' + c[2])
            await pg.wait_for_timeout(900); continue
        if s['dlg']:
            if log is not None: log.append(s['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if s['busy']: await pg.wait_for_timeout(600); continue
        if await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
            await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500); continue
        await pg.wait_for_timeout(1000); s = await L.state(pg)
        if not (s['dlg'] or s['choices'] or s['busy']): return True
    return False
async def phone(pg, cdp, tab):
    if not await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&getComputedStyle(p).display!=='none'; })()"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(700)
    return await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody'); return {head:(b.innerText||'').split('\\n').filter(x=>x.trim()).slice(0,2).join(' ｜ '), on:[...b.querySelectorAll('.tth.on')].map(x=>x.textContent)}; })()")
async def close_phone(pg):
    await pg.evaluate("(()=>{ const b=document.getElementById('btnPhoneClose'); if(b) b.click(); })()"); await pg.wait_for_timeout(500)
async def click_in_phone(pg, cdp, js_find, what):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.closest('.item')||e).textContent.trim().slice(0,40)]; })()" % js_find)
    if not c: say('   手機找不到', what); return False
    await L.touch_tap(cdp, c[0], c[1]); say('   手機：', c[2]); await pg.wait_for_timeout(1800); return True
async def go_place(pg, cdp, name):
    await phone(pg, cdp, 'places')
    ok = await click_in_phone(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>(b.closest('.item')||b).textContent.includes(%s))" % json.dumps(name), '地點 ' + name)
    if not ok: await close_phone(pg)
    await drain(pg, cdp, pref=['前往', '走過去', '去', '好', '確定', '出發'], secs=90); return ok
async def check_date(pg, cdp, run, tag):
    sn = await pg.evaluate(SNAP); ph = await phone(pg, cdp, 'today'); wk = await phone(pg, cdp, 'week'); await close_phone(pg)
    hd = sn['hud'].split(' ')
    exp_hud = '%d/%d 週%s' % (int(sn['shown'][5:7]), int(sn['shown'][8:10]), WD[sn['shownWd']])
    ok = ' '.join(hd[:2]) == exp_hud and sn['weekday'] == sn['realWd']
    say('[日期] %s：真正 %s（週%s）%.2f｜右上角「%s」｜手機今天「%s」｜課表亮「%s」｜G.weekday=%d' % (tag, sn['real'], WD[sn['realWd']], sn['h'], sn['hud'], ph['head'][:22], ''.join(wk['on'][:1]), sn['weekday']))
    if not ok: bad.append('X76 %s：右上角「%s」應該是「%s」（G.weekday=%d）' % (tag, sn['hud'], exp_hud, sn['weekday']))
    if sn['h'] < 24:
        md = ph['head'].split(' ')[0]; real = '%d/%d' % (int(sn['real'][5:7]), int(sn['real'][8:10]))
        if md != real: bad.append('X76 %s：手機今天「%s」不是 %s' % (tag, ph['head'][:16], real))
    await run.shot(pg, 'date_' + tag); return sn
async def cafe_count(pg, run, tag):
    ps = await pg.evaluate(PEOPLE); sn = await pg.evaluate(SNAP)
    clerk = [p for p in ps if p['clerk'] or p['staff'] == 'cafe']; zr = [p for p in ps if p['id'] == 'heroine_02']
    cust = [p for p in ps if p not in clerk and p not in zr]
    say('[Café] %s %.2f：客人 %d（%s）｜芷若 %d｜店員 %d' % (tag, sn['h'], len(cust), '、'.join((p['name'] or ('路人' if p['extra'] else p['id'])) for p in cust), len(zr), len(clerk)))
    await run.shot(pg, 'cafe_' + tag); return cust, ps
async def try_sit_customer_chair(pg, cdp, run):
    info = await pg.evaluate("""(()=>{ const E=GAME.E; const occ=E.npcs.filter(n=>n.seat&&n.obj); const out=[]; for(const n of occ){ const it=E.interactables.find(i=>i.seat&&Math.hypot(i.seat.x-n.seat.x,i.seat.z-n.seat.z)<0.3); out.push({who:n.name||(n.isExtra?'路人':n.charId), sx:n.seat.x, sz:n.seat.z, it:it?{x:it.x,z:it.z,label:it.label,hidden:!!it.hidden,disabled:!!it.disabled}:null}); } return out; })()""")
    say('   客人坐的位子與互動點：', json.dumps(info, ensure_ascii=False)[:500])
    tgt = next((q for q in info if q['it']), None)
    if not tgt: say('   客人的位子都沒有「坐下」互動點'); return True
    await L.go_to(pg, cdp, run, tgt['it']['x'], tgt['it']['z'], 0.6, '客人坐的椅子')
    lab = (await L.state(pg))['interact']; say('   走到 %s 坐的椅子旁，互動按鈕「%s」' % (tgt['who'], lab))
    sat = False
    if lab and '坐' in lab:
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); sat = (await L.state(pg))['pose'] == 'sit'
        say('   按下去以後 pose=%s' % (await L.state(pg))['pose']); await run.shot(pg, 'cafe_sit_try')
        if sat: bad.append('X71 玩家坐上了 %s 坐的椅子' % tgt['who']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    return not sat
async def enter_cafe(pg, cdp, run):
    if (await pg.evaluate("GAME.G.zone")) != 'wenzhou': await go_place(pg, cdp, '溫州街')
    ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='cafe'); return it?[it.x,it.z,it.radius||1.2]:null; })()")
    if ex and await L.go_to(pg, cdp, run, ex[0], ex[1], ex[2] * 0.7, 'Café 門口'):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(6000)
    await drain(pg, cdp, secs=60); await pg.wait_for_timeout(12000)
    return (await pg.evaluate("GAME.G.zone")) == 'cafe'
async def leave_cafe(pg, cdp, run):
    ex = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); return it?[it.x,it.z,it.radius||1.2]:null; })()")
    if ex and await L.go_to(pg, cdp, run, ex[0], ex[1], ex[2] * 0.7, 'Café 出口'):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(5000)
    await drain(pg, cdp, secs=60)
async def skip_to(pg, cdp, t):
    await phone(pg, cdp, 'today')
    ok = await click_in_phone(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].find(b=>Math.abs(+b.dataset.skip-%s)<0.11)" % t, '跳到 %s' % t)
    if not ok: await close_phone(pg)
    await drain(pg, cdp, secs=90); return ok
WHERE = "(ids=>{ const o={}; for(const id of ids){ try{ o[id]=STORY.whereIs(GAME,id); }catch(e){ o[id]=String(e); } } return o; })(['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'])"
cdp_g = [None]; run_g = [None]
SCEN = os.environ.get('SCEN', 'E1,E2,E3,E8,E7,E6,E4').split(',')
ROUTE = "(()=>({route:GAME.G.flags.EXCHANGE_ROUTE||null, applied:GAME.G.flags.EXCH_APPLIED_DAY, rule:GAME.G.flags.EXCH_RULE||null, d05:!!GAME.G.flags.dating_heroine_05, d01:!!GAME.G.flags.dating_heroine_01, rom01:(GAME.G.romance||{}).heroine_01&&GAME.G.romance.heroine_01.status||null, rom05:(GAME.G.romance||{}).heroine_05&&GAME.G.romance.heroine_05.status||null, h:+GAME.G.hour.toFixed(2), key:CALENDAR.dateOf(GAME.G.day).key}))()"
async def load_at(pg, base, key, hour, zone, extra):
    st = json.loads(json.dumps(base)); G = st.get('G', st)
    d = await pg.evaluate("STORY.dayOfKey(%s)" % json.dumps(key))
    G.update({'day': d, 'hour': hour, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d)})
    G['flags'].update({'ROOM_Y2': await pg.evaluate("STORY.dayOfKey('2026-09-06')"), 'ROOM_Y3': await pg.evaluate("STORY.dayOfKey('2027-09-05')")})
    G['flags'].update(extra.get('flags', {}))
    for k in ['EXCHANGE_ROUTE', 'EXCH_APPLIED_DAY', 'EXCH_RULE']:
        if k not in extra.get('flags', {}): G['flags'].pop(k, None)
    await L.load_state(pg, G); await pg.wait_for_timeout(6000)
    if extra.get('settle'):
        tgt = extra['settle']
        for k in range(4):
            sn = await pg.evaluate(SNAP)
            if sn['real'] >= tgt: break
            ln = await sleep_bed(pg, cdp_g[0], run_g[0], ['睡到明天早上', '睡到明天', '睡覺']) or []
            sn2 = await pg.evaluate(SNAP)
            say('   [前置] 讓之前的事件演完、睡一晚（第 %d 次）：%s %.2f → %s %.2f，台詞 %d 句：%s' % (k + 1, sn['real'], sn['h'], sn2['real'], sn2['h'], len(ln), json.dumps(ln[:6], ensure_ascii=False)))
async def sleep_bed(pg, cdp, run, pref):
    bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed or not await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床'): return False
    for k in range(4):
        await close_phone(pg); await pg.wait_for_timeout(800); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        if (await L.state(pg))['choices']: break
    lines = []; await drain(pg, cdp, pref=pref, secs=240, log=lines); return lines
async def wait_until(pg, cdp, h, secs=600):
    t0 = time.time()
    while time.time() - t0 < secs:
        sn = await pg.evaluate(SNAP)
        if sn['h'] >= h: return True
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: await drain(pg, cdp, secs=60)
        else:
            nx = [t for t in (12, 14, 17.5, 20) if t > sn['h'] + 0.2 and t <= h + 0.01]
            if nx: await skip_to(pg, cdp, nx[0]); await close_phone(pg)
            else: await pg.wait_for_timeout(3000)
    return False
async def set_h(pg, run, h):
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % h); run.setup('[捷徑] 時間設 %.2f' % h); await pg.wait_for_timeout(2500)
async def deadline(pg, cdp, run, tag, lines_out):
    r0 = await pg.evaluate(ROUTE); say('   %s 11/17 晚上：%s' % (tag, json.dumps(r0, ensure_ascii=False)))
    labs = await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>i.label||'').filter(l=>/交換|志願/.test(l))")
    say('   %s 宿舍裡和交換有關的按鈕：%s' % (tag, json.dumps(labs, ensure_ascii=False))); await run.shot(pg, tag + '_dorm_1117')
    if labs: bad.append('%s 宿舍還有交換選單：%s' % (tag, labs))
    d_before = (await pg.evaluate(SNAP))['real']
    for k in range(3):
        lines_out += await sleep_bed(pg, cdp, run, ['睡到明天早上', '睡到明天', '睡覺']) or []
        sn = await pg.evaluate(SNAP)
        if sn['real'] > d_before: break
        say('   %s 第 %d 次睡覺沒睡著（%s %.2f），台詞 %s' % (tag, k + 1, sn['real'], sn['h'], json.dumps(lines_out[-8:], ensure_ascii=False)))
    r1 = await pg.evaluate(ROUTE); say('   %s 11/18 早上：%s' % (tag, json.dumps(r1, ensure_ascii=False)))
    if r1['route']: bad.append('%s 11/18 中午以前路線就定了：%s' % (tag, r1['route']))
    await set_h(pg, run, 11.9)
    for k in range(90):
        sn = await pg.evaluate(SNAP)
        if sn['h'] >= 12.1: break
        st = await L.state(pg)
        if st['dlg'] or st['choices']: await drain(pg, cdp, secs=40)
        await close_phone(pg); await pg.wait_for_timeout(2000)
    await pg.wait_for_timeout(4000)
    r2 = await pg.evaluate(ROUTE); say('   %s 11/18 12:00 以後：%s' % (tag, json.dumps(r2, ensure_ascii=False))); return r2
async def main():
    run = L.Run('twdiag', OUT); base = json.load(open(SAVE, encoding='utf-8')); run_g[0] = run
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp
        cons = []; pg.on('console', lambda m: cons.append(m.type + '｜' + m.text[:200]))
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await load_at(pg, base, '2027-11-18', 11.85, 'dorm', {'flags': {'dating_kexin': False}})
        run.setup('[前置] TW 情境：2027-11-18 11:51 宿舍、沒有交往')
        await pg.evaluate("""(()=>{ window.__rd=[]; const S=STORY; const o=S.routeDecide; S.routeDecide=function(G){ const r=o.apply(this,arguments); window.__rd.push({h:+G.hour.toFixed(2), due:S.routeDue(G), for:S.routeFor(G), ret:r, now:G.flags.EXCHANGE_ROUTE||null, stage:G.stage}); return r; };
          window.__tk=0; const t=S.tick; S.tick=function(GM,dt){ window.__tk++; return t.apply(this,arguments); }; })()""")
        for k in range(30):
            await pg.wait_for_timeout(2000); await close_phone(pg)
            st = await L.state(pg)
            if st['dlg'] or st['choices']: await drain(pg, cdp, pref=['好', '嗯'], secs=20)
            info = await pg.evaluate("(()=>({h:+GAME.G.hour.toFixed(2), route:GAME.G.flags.EXCHANGE_ROUTE||null, busy:!!GAME.E.player.busy, dact:!!(GAME.D&&GAME.D.active), ticks:window.__tk, rd:(window.__rd||[]).slice(-2), stage:GAME.G.stage, day0:GAME.G.day>=0}))()")
            if k % 3 == 0 or info['route']: say('  [%d] %s' % (k, json.dumps(info, ensure_ascii=False)))
            if info['route']: break
        say('console：', json.dumps(cons[-10:], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
