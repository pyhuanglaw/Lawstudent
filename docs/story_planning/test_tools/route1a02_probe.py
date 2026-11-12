"""BB：QA-REPRO-1020 驗收（LAWWW 765ac675）：X70 女主角、X76 星期、X71 Café 客人。用使用者 9/25 週四 15:44 溫州街的存檔（v9.10.2 存的，星期記成週五）。
照玩家：標題「讀取」→ 看右上角、手機今天 → 走進 Café（14–18）→ 手機跳到晚上 → Café（18–22、學姊週四在）→ 試坐客人的椅子 →
[捷徑] 23:54 在 Café 等過午夜 → 回宿舍睡 → 9/26 週五早上手機「直接去上課」→ 教室裡找以安、走過去說話 → 總圖 → 中午 Café（11–14）。
CC-C 11-12（BB-C 08:58，QA-REPRO-1020 最後三項 E4／E6／E8，BB_393 e4eb857f4a；BB_218 第 361、367、374、379 行）改：
  ①時間只往前（set_h 目標比現在早＝不動、記一行；上一輪 E6 睡到 11/18 18:00 又被撥回 11:54＝無效）
  ②E6 改成 BB_218 的兩件：E6a 拆箱「（拿出摩天輪的票根…）」能不能一直重複選（大三搬房間 2027-09-05、沒有 ROOM_Y3 → 拆箱清單，連選有票根的那一項最多 8 次，記每次清單）；
     E6b 和以安交往、11/17 晚上睡覺選「醒來在 11/18 12:00 以後」的那一個選項 → 醒來馬上讀路線（E7 修好以後應該已經定成 JP，不是 null）
  ③E4 接著做完：Café 攤牌選以安以後一路睡到 11/18 12:00 以後 → 路線 JP
  ④E8：讀檔後（11/16 讀進來、睡一晚到 11/17）舊的 US 就要清掉（AA_315「讀檔後清掉」），11/18 12:00 以後 TW
  ⑤SAVE 沒給＝受測版本的 tests/repro_1020/user_save_day9.json（使用者 9/25 存檔）；每支 SCEN 一個情境、≤20 分鐘
CC_02 清單 2026-11-12：1✓（日期照 AA_315：11/17 晚上、11/18 12:00 截止） 2✓（床、選項照遊戲的字找） 3✓（睡覺選項照字選，不用位置） 4✓（選項文字記下來） 5✓（走到床 go_to） 6✓（讀檔等 6 秒、對話 drain） 7✓ 8✓（判準＝AA_315／BB_218 的路線結果；拆箱同一項出現第二次＝FAIL） 9n/a（截圖不藏人） 10n/a（條件事件要開：路線、拆箱、攤牌都是劇情） 11✓ 12✓（每一步記路線、日期時間、台詞） 13✓（倒撥時間不做；改存檔旗標寫【前置】）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
SAVE = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.environ['LW_TESTS'], 'repro_1020', 'user_save_day9.json')
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
    cur = await pg.evaluate("GAME.G.hour")
    if h <= cur:   # CC-C 11-12：只往前，不倒撥（上一輪 E6 被撥回 11:54＝無效）
        say('   [不倒撥] 現在 %.2f 已經過了 %.2f，不設' % (cur, h)); return False
    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; if(GAME.updateHUD) GAME.updateHUD(); })(%s)" % h); run.setup('[捷徑] 時間往前設 %.2f' % h); await pg.wait_for_timeout(2500); return True
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
    sn1 = await pg.evaluate(SNAP)
    if r1['route'] and sn1['h'] < 12: bad.append('%s 11/18 中午以前路線就定了：%s' % (tag, r1['route']))
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
    run = L.Run('route1a02', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cdp_g[0] = cdp; run_g[0] = run
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        for sc in SCEN:
            lines = []; say('== %s' % sc)
            try:
                if sc in ('E1', 'E2', 'E3', 'E8'):
                    fl = {'E1': {'dating_heroine_05': True}, 'E2': {'dating_heroine_01': True}, 'E3': {'dating_kexin': True}, 'E8': {'EXCHANGE_ROUTE': 'US', 'EXCH_APPLIED_DAY': None}}[sc]
                    if sc == 'E8': fl['EXCH_APPLIED_DAY'] = await pg.evaluate("STORY.dayOfKey('2027-11-01')")
                    if sc != 'E3': fl.setdefault('dating_kexin', False)
                    await load_at(pg, base, '2027-11-16', 21.0, 'dorm', {'flags': fl, 'settle': '2027-11-17'}); await set_h(pg, run, 21.0); run.setup('[前置] %s：使用者存檔改到 2027-11-17 21:00 宿舍，旗標 %s' % (sc, json.dumps(fl)))
                    if sc == 'E8':
                        r8 = await pg.evaluate(ROUTE); say('   E8 讀檔後（睡一晚到 11/17 21:00）：%s' % json.dumps(r8, ensure_ascii=False))
                        if r8['route']: bad.append('E8 舊存檔讀進來以後舊的 %s 還在（AA_315：讀檔後清掉）' % r8['route'])
                    r = await deadline(pg, cdp, run, sc, lines)
                    want = {'E1': 'US', 'E2': 'JP', 'E3': 'TW', 'E8': 'TW'}[sc]
                    if r['route'] != want: bad.append('%s 路線 %s（應該 %s）' % (sc, r['route'], want))
                elif sc == 'E7':
                    await load_at(pg, base, '2027-11-16', 21.0, 'dorm', {'flags': {'dating_kexin': False}, 'settle': '2027-11-17'}); await set_h(pg, run, 21.0); run.setup('[前置] E7：11/17 沒有交往')
                    r = await deadline(pg, cdp, run, sc, lines)
                    if r['route'] != 'TW': bad.append('E7 截止時沒交往，路線 %s（應該 TW）' % r['route'])
                    await pg.evaluate("(()=>{ GAME.G.flags.dating_heroine_01=true; if(typeof ROM!=='undefined') ROM.rec(GAME.G); })()"); run.setup('[捷徑] E7：11/18 截止後才和以安交往')
                    await pg.wait_for_timeout(5000); r = await pg.evaluate(ROUTE); say('   E7 之後：%s' % json.dumps(r, ensure_ascii=False))
                    if r['route'] != 'TW': bad.append('E7 截止後交往，路線變成 %s' % r['route'])
                elif sc == 'E6':
                    # E6a：拆箱的票根能不能一直重複選（大三搬房間 2027-09-05、沒有 ROOM_Y3）
                    st = json.loads(json.dumps(base)); G0 = st.get('G', st)
                    d5 = await pg.evaluate("STORY.dayOfKey('2027-09-05')")
                    G0.update({'day': d5, 'hour': 20.0, 'zone': 'dorm', 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % d5)})
                    G0['flags'].update({'ROOM_Y2': await pg.evaluate("STORY.dayOfKey('2026-09-06')"), 'dating_heroine_01': True, 'dating_kexin': False, 'EX_kexin': True}); G0['flags'].pop('ROOM_Y3', None)
                    await L.load_state(pg, G0); await pg.wait_for_timeout(6000); run.setup('[前置] E6a：2027-09-05 20:00 宿舍、沒有 ROOM_Y3（拆箱要演）、和可昕分手過（票根在清單裡）')
                    seen = []; picks = 0; t0 = time.time()
                    while time.time() - t0 < 240 and picks < 12:
                        s_ = await L.state(pg)
                        if s_['choices']:
                            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")
                            seen.append(opts); i = next((k for k, o in enumerate(opts) if '票根' in o), None)
                            if i is None and picks == 0: i = 0
                            if i is None: break
                            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
                            await L.touch_tap(cdp, c[0], c[1]); picks += 1; await pg.wait_for_timeout(900); continue
                        if s_['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                        if not s_['busy'] and picks: break
                        await pg.wait_for_timeout(800)
                    ticket = [sum(1 for o in os_ if '摩天輪的票根' in o) for os_ in seen]
                    say('   E6a 拆箱清單（每次）：%s' % json.dumps(seen[:10], ensure_ascii=False)); await run.shot(pg, 'E6a_unbox')
                    n_after = sum(1 for k, os_ in enumerate(seen) if k > 0 and any('摩天輪的票根' in o for o in os_) and any('摩天輪的票根' in o for o in seen[k - 1]))
                    if not seen: bad.append('E6a 2027-09-05 沒有出拆箱清單')
                    elif not any(ticket): say('   E6a 清單裡沒有摩天輪的票根（INFO：這一份存檔不在清單裡）')
                    elif n_after: bad.append('E6a 摩天輪的票根選了以後還在清單裡（連續出現 %d 次）' % (n_after + 1))
                    # E6b：睡覺跳過 11/18 12:00，醒來路線要已經定（E7 修好以後）
                    await load_at(pg, base, '2027-11-16', 21.0, 'dorm', {'flags': {'dating_heroine_01': True, 'dating_kexin': False}, 'settle': '2027-11-17'}); await set_h(pg, run, 21.0); run.setup('[前置] E6b：和以安交往，11/17 21:00 宿舍')
                    ln = []; d17 = (await pg.evaluate(SNAP))['real']
                    for k in range(4):
                        pref = ['睡到中午', '睡到下午', '睡到傍晚', '睡到晚上', '睡到明天下午', '睡到明天晚上', '睡到明天']
                        ln += await sleep_bed(pg, cdp, run, pref) or []
                        sn = await pg.evaluate(SNAP)
                        if sn['real'] > d17 and sn['h'] >= 12: break
                        if sn['real'] > d17: say('   E6b 醒來 %s %.2f 還沒過 12:00，再睡一次（選醒來在下午以後的）' % (sn['real'], sn['h']))
                    sn = await pg.evaluate(SNAP); r6 = await pg.evaluate(ROUTE)
                    say('   E6b 醒來 %s %.2f 馬上讀路線：%s；睡覺台詞 %s' % (sn['real'], sn['h'], json.dumps(r6, ensure_ascii=False), json.dumps(ln[-8:], ensure_ascii=False))); await run.shot(pg, 'E6b_wake')
                    if not (sn['real'] >= '2027-11-18' and sn['h'] >= 12): bad.append('E6b 沒有睡過 11/18 12:00（醒來 %s %.2f；床的選項 %s）' % (sn['real'], sn['h'], json.dumps(ln[:4], ensure_ascii=False)))
                    elif r6['route'] != 'JP': bad.append('E6b 睡過 11/18 12:00 醒來路線 %s（和以安交往，應該已經是 JP）' % r6['route'])
                elif sc == 'E4':
                    await load_at(pg, base, '2027-11-09', 21.0, 'dorm', {'flags': {'dating_heroine_01': True, 'dating_heroine_05': True, 'dating_kexin': False}, 'settle': '2027-11-10'}); await set_h(pg, run, 21.5); run.setup('[前置] E4：11/10（三）21:30 宿舍，同時和以安、學姊交往')
                    kn0 = await pg.evaluate("(()=>typeof ROM!=='undefined'&&ROM.knowsOf?[ROM.knowsOf(GAME.G,'heroine_01','heroine_05'),ROM.knowsOf(GAME.G,'heroine_05','heroine_01')]:null)()"); say('   E4 睡前 knowsOf：%s' % kn0)
                    ln = await sleep_bed(pg, cdp, run, ['睡到明天早上', '睡到明天', '睡覺']) or []
                    say('   E4 睡覺時的台詞：%s' % json.dumps(ln[:12], ensure_ascii=False)); await run.shot(pg, 'E4_after_sleep')
                    if not any('法學院圖書館' in x for x in ln): bad.append('E4 11/10 睡覺時沒有「週三晚上的法學院圖書館」那段')
                    kn1 = await pg.evaluate("(()=>typeof ROM!=='undefined'&&ROM.knowsOf?[ROM.knowsOf(GAME.G,'heroine_01','heroine_05'),ROM.knowsOf(GAME.G,'heroine_05','heroine_01')]:null)()"); say('   E4 睡後 knowsOf：%s' % kn1)
                    await set_h(pg, run, 21.95); await pg.evaluate("void 0"); run.setup('[捷徑] E4：11/11 21:57（手機只跳到 20:00）')
                    t0 = time.time(); msgs = []
                    while time.time() - t0 < 120:
                        if (await pg.evaluate(SNAP))['h'] >= 22.1: break
                        await pg.wait_for_timeout(2000)
                    msgs = await pg.evaluate("(()=>{ const out=[]; try{ const P=GAME.G.phone||{}; const th=P.q||P.threads||{}; for(const k in th){ const a=th[k]; if(Array.isArray(a)) for(const m of a.slice(-3)) out.push(k+'｜'+(m.from||'')+'：'+(m.text||'').slice(0,40)); } }catch(e){} return out.slice(-12); })()")
                    say('   E4 22:00 手機（每串最後三則）：%s' % json.dumps(msgs, ensure_ascii=False))
                    await close_phone(pg); await pg.evaluate("(()=>{ GAME.G.hour=Math.max(GAME.G.hour,22.2); GAME.E.hour=GAME.G.hour; })()")
                    opts = None
                    for k in range(60):
                        s = await L.state(pg)
                        if s['choices']:
                            opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30))"); break
                        if s['dlg']: await L.tap(pg, cdp, '#dlg')
                        await pg.wait_for_timeout(1500)
                    say('   E4 22:30 出遊選項：%s' % json.dumps(opts, ensure_ascii=False)); await run.shot(pg, 'E4_outing_prompt')
                    if not opts or len(opts) != 1 or '出發' not in opts[0]: bad.append('E4 22:30 出遊選項不是只有「出發」：%s' % opts)
                    ln = []; await drain(pg, cdp, pref=['出發', '學姊', '書瑀', '溫'], secs=300, log=ln)
                    say('   E4 Café 攤牌：%s' % json.dumps(ln[:30], ensure_ascii=False)); await run.shot(pg, 'E4_after_cafe')
                    r = await pg.evaluate(ROUTE); say('   E4 選完：%s' % json.dumps(r, ensure_ascii=False))
                    if not (r['d01'] and not r['d05']): bad.append('E4 攤牌選以安以後：以安 %s、學姊 %s（應該只剩以安）' % (r['d01'], r['d05']))
                    if r['route']: bad.append('E4 攤牌完路線就定了：%s（截止是 11/18 12:00）' % r['route'])
                    await pg.evaluate("void GAME.enter('dorm')"); await pg.wait_for_timeout(6000)
                    for k in range(8):   # 11/11 晚上 → 一晚一晚睡到 11/17（不倒撥）
                        if (await pg.evaluate(SNAP))['real'] >= '2027-11-17': break
                        await sleep_bed(pg, cdp, run, ['睡到明天早上', '睡到明天', '睡覺'])
                    await set_h(pg, run, 21.0)
                    r = await deadline(pg, cdp, run, 'E4', lines)
                    if r['route'] != 'JP': bad.append('E4 選以安以後 11/18 12:00 路線 %s（應該 JP）' % r['route'])
            except Exception as e:
                bad.append('%s 腳本例外：%r' % (sc, e)); say('   例外', repr(e)[:200])
            json.dump({'report': rep, 'bad': bad}, open(os.path.join(OUT, 'route1a02.json'), 'w'), ensure_ascii=False, indent=1)
        print('問題：'); [print('   -', x) for x in bad]
        run.check('1A-02 E 情境', not bad, json.dumps(bad[:10], ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3]))
        await b.close()
    run.finish()
asyncio.run(main())
