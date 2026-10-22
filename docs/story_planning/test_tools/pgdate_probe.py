"""BB（帳號 A）2026-10-21：LAWWW 22:23 派的 AA366＋AA367 畢業以後的約會節奏（開發分支 9e4e6387 整合，企劃線 e75d1cce 之後 AA 又改了四項）。
對照表：子代理 2026-10-21 22:5x 的報告（程式位置、存檔前置、每一格的日子和句子）；Node 的排程檢查是 LAWWW 的 tests/aa366_kx_postgrad_unit.js、aa367_pg_dates_unit.js。
這支只看瀏覽器裡玩家會看到的：跳日期停在哪裡（日期卡）、按鈕的字（「出發：…」和小字）、地點字幕、她那一句、手機收到的訊息、錢。
【前置】最小存檔（畢業後篇：GRADUATED、MOVED_OUT、Y4_PATH:'other'；不報國考），讀檔以後在頁面裡補 FIRST_MET、交往（ROM.start；可昕用 dating_kexin）。
之後照玩家：站在校園不動等跳日期、手機自己打開就按「跳過」、出現選項照情境按「出發」或「不去了」、點對話。
EXD、BREAK 兩個情境是【捷徑】：直接問排程（PGDATE.upcoming／sixMonth）、BREAK 在 console 呼叫 ROM.end（分手的對話不在這次範圍）。
AA 22:35（e75d1cce）新稿的四項（8/5 第二句、K26 改字、2030-10 台南字幕、交換延畢大五上要排）：程式還是舊的就記「還沒照新稿」＝FAIL（不是遊戲壞掉，是還沒做）。
Playwright 手機橫向模擬、?turbo（只縮短淡入淡出和日期卡，不加快跳日期），不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=KX_P1,... python3 pgdate_probe.py '<URL>/index.html?turbo' <輸出資料夾>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
def say(*a): print(' '.join(str(x) for x in a), flush=True)

KX, AN, ZQ, PS = 'kexin', 'heroine_01', 'heroine_04', 'classmate_peishan'
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; window.__CAP=[];
  const at=()=>{ try{ return PG.dateLabel(GAME.G.day,GAME.G.hour); }catch(e){ try{ return CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e2){ return ''; } } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||(typeof w==='string'?w:''), t:String(t||''), at:at()}); }catch(e){} return s0.apply(this,arguments); };
  const watch=id=>{ const e=document.getElementById(id); if(!e) return; let last=''; new MutationObserver(()=>{ const t=(e.textContent||'').trim(); if(t&&t!==last){ last=t; window.__CAP.push({id, t, at:at()}); } }).observe(e,{childList:true,subtree:true,characterData:true}); };
  watch('title3'); watch('caption'); })()"""
MSGS = """(([th,d0,d1])=>(GAME.G.msgs||[]).filter(m=>PHONE.th(m)===th&&m.day>=d0&&m.day<=d1).map(m=>({d:CALENDAR.dateOf(m.day).key, h:+(+m.h||0).toFixed(2), from:m.from||m.who||'', text:String(m.text||'')})))"""
SCHED = """(who=>{ const G=GAME.G, S=PGDATE, busy=S.busyDays(G,G.day,STORY.dayOfKey(S.TO)+1); const o={};
  for(const ym of ['2029-08','2029-09','2029-10','2029-11','2029-12','2030-01','2030-02']){ const M=S.sixMonth(G,ym,busy); const s=M[who]; o[ym]=s?CALENDAR.dateOf(s.day).key+' '+s.h+' '+(s.place||''):null; }
  const up=S.upcoming(G).filter(s=>s.who===who)[0]; return {months:o, next:up?CALENDAR.dateOf(up.day).key:null, delayed:PG.delayed(G)}; })('%s')"""
NOW = "(()=>{ const G=GAME.G; return {day:G.day, h:+(+G.hour).toFixed(3), label:(typeof PG!=='undefined'&&PG.dateLabel)?PG.dateLabel(G.day,G.hour):'', money:G.money, zone:G.zone}; })()"

# 情境：who＝交往的人；key/h＝讀檔的日子、時間；go＝遇到選項按什麼（'go'＝出發／接起來，'no'＝不去了）；until＝玩到哪一天幾點；extra＝多的旗標
SCENS = {
    'KX_P1': dict(who=[KX], key='2029-06-10', h=15, go='go', until=('2029-06-17', 21.5),
                  note='可昕 P1：6/10 21:00 開頭兩則 → 6/17 18:35 停「出發：我們的日子：約在公館」→ 公館那一句'),
    'KX_805': dict(who=[KX], key='2029-08-05', h=15, go='go', until=('2029-08-12', 21.5),
                   note='可昕 P2：8/5 21:00 兩則（第二句照 AA_366 第 4 節新稿）→ 8/12 18:35 公館那一句'),
    'KX_K26': dict(who=[KX], key='2029-07-05', h=12, go='go', until=('2029-07-07', 18.5),
                   note='K26：7/5 21:00 兩則（AA_366 A7 新稿）→ 7/7 14:05 出發 → 老地方；字幕「老地方」'),
    'KX_K26N': dict(who=[KX], key='2029-07-05', h=12, go='no', until=('2029-07-07', 17.0),
                    note='K26 沒去：7/7 選「不去了」→ 16:00 兩則（AA_366 A7 新稿）'),
    'AN_P1': dict(who=[AN], key='2029-06-08', h=12, go='go', until=('2029-06-09', 18.0),
                  note='以安第一格：6/9 14:30 停「出發：和沈以安：總圖 B1 的長桌」→ 她那一句'),
    'PS_TN29': dict(who=[PS], key='2029-10-05', h=12, go='go', until=('2029-10-06', 19.5),
                    note='沛珊第一次去台南（2029-10-06）：小字「台南・她的學校」照舊、扣 2,700、18:45「回到臺北。」'),
    'PS_TN30': dict(who=[PS], key='2030-10-04', h=12, go='go', until=('2030-10-05', 19.5),
                    note='沛珊 2030-10 去台南：字幕改「台南・她實習的國小」（AA_367 A3 新稿）'),
    'EXD': dict(who=[ZQ], key='2029-08-20', h=12, go=None, until=None, extra={'EXCHANGE_ROUTE': 'JP', 'EXCH_RULE': 1},
                note='【捷徑：問排程】交換延畢的大五上 2029-09～2030-01 要排、2029-12 不排（AA_367 A4 新稿）'),
    'BREAK': dict(who=[AN], key='2029-07-05', h=12, go=None, until=None,
                  note='【捷徑：console 分手】ROM.end 以後排好的格子改 skipped、下一站不再是她'),
}
NEW = {   # AA 22:35（e75d1cce）新稿；OLD＝開發分支 d1b3d5f9 的寫法
    'kx805_2': ('二試以前隔週一次。你那天要是讀得正順，前一天跟我說。', '二試以前一樣隔週。你那天要是讀得正順，前一天跟我說。'),
    'k26_a': (['禮拜六下午，我把行程表空出來了。', '三點，老地方。'], ['畢業了。我們的日子，重新排一天。', '週六下午三點，老地方。']),
    'k26_miss': (['三點，老地方。你沒來。', '……我自己吃了兩份。'], ['重新排的第一天。你沒來。', '……我自己吃了兩份。']),
    'k26_title': ('老地方', '重新排的一天'),
    'tn30': ('台南・她實習的國小', '台南・她的學校'),
}


def base_state(dk, key, h, who, extra):
    day = dk[key]
    F = {'dating_kexin': KX in who, 'KX_DEC3_MIGRATED': True, 'GRADUATED': dk['2029-06-02'], 'GRAD_DONE': True, 'PG': {'done': {'grad': 1}},
         'MOVED_OUT': dk['2029-06-28'], 'HOME_AFTER': 'home', 'Y4_PATH': 'other', 'PACKED_Y4': dk['2029-06-01']}
    if KX in who: F['KX_OUR_DAY'] = {'day': 'sun', 'mode': 'mid'}
    F.update(extra or {})
    return {'v': 2, 'stage': 'law', 'name': '祐廷', 'day': day, 'hour': h, 'energy': 100, 'money': 22000, 'zone': 'campus',
            'pos': {'x': -34, 'z': 12.5, 'yaw': 3.14159, 'lv': 0}, 'weather': 'clear', 'flags': F,
            'events': {'done': {'ev_grad_family': 1, 'ev_grad_lunch': 1, 'ev_grad_envelope': 1, 'ev_move_out_y4': 1}, 'last': {}, 'count': 0}}


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def tap_choice(pg, cdp, k):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % k)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
    await L.touch_tap(cdp, c[0], c[1])


async def drive(pg, cdp, run, sc, dk, max_s=2400):
    """照玩家：等跳日期；手機自己打開就「跳過」；選項照 sc['go']；點對話。玩到 until 那天那個時間。回傳途中看到的選項（時間、選項、按了哪一個）"""
    ud, uh = sc['until']; uday = dk[ud]; seen = []; t0 = time.time(); last_t = None; stuck_since = time.time()
    while time.time() - t0 < max_s:
        n = await pg.evaluate(NOW)
        if n['day'] > uday or (n['day'] == uday and n['h'] >= uh): return seen, True
        t = (n['day'], round(n['h'], 2))
        if t != last_t: last_t = t; stuck_since = time.time()
        elif time.time() - stuck_since > 420:
            run.note('超過 7 分鐘遊戲時間沒有前進：%s' % json.dumps(n, ensure_ascii=False)); await run.shot(pg, 'stuck_%s' % sc['id']); return seen, False
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
            await L.phone_away(pg, cdp); await pg.wait_for_timeout(600); continue
        s = await L.state(pg)
        if s['choices']:
            ops = await choices(pg)
            if sc['go'] == 'go': k = next((i for i, o in enumerate(ops) if o.startswith(('出發：', '接起來：', '打給她：'))), 0)
            else: k = next((i for i, o in enumerate(ops) if o.startswith(('不去了', '今天先不要'))), None)
            if k is None: k = next((i for i, o in enumerate(ops) if o.startswith(('出發：', '接起來：', '打給她：'))), 0)
            seen.append({'at': n['label'], 'h': n['h'], 'opts': ops, 'pick': k, 'money': n['money']})
            say('   %s 選項 %s → 按 %d' % (n['label'], ops, k))
            if len(seen) <= 6: await run.shot(pg, '%s_choice%d' % (sc['id'], len(seen)))
            await tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        await pg.wait_for_timeout(1500)
    return seen, False


async def one(p, run, sid):
    sc = dict(SCENS[sid]); sc['id'] = sid; res = {'sid': sid, 'note': sc['note']}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        keys = ['2029-06-01', '2029-06-02', '2029-06-28', sc['key']] + ([sc['until'][0]] if sc['until'] else [])
        dk = await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })(%s)" % json.dumps(keys))
        st = base_state(dk, sc['key'], sc['h'], sc['who'], sc.get('extra'))
        st['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % st['day'])
        await L.load_state(pg, st); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        await pg.evaluate("(who=>{ for(const id of who){ const r=SOCIAL.rel(id); r.fam=45; r.trust=30; SOCIAL.remember(id,'FIRST_MET',''); if(id!=='kexin') ROM.start(GAME.G,id); } })(%s)" % json.dumps(sc['who']))
        pre = await pg.evaluate("(()=>{ const G=GAME.G; return {pgOn:!!(PG.on&&PG.on(G)), pgdOn:!!(PGDATE.on&&PGDATE.on(G)), delayed:!!(PG.delayed&&PG.delayed(G)), partners:(ROM.partners?ROM.partners(G):[]), home:!!(HOME.at&&HOME.at(G)), next:(PG.nextStop&&PG.nextStop(G)!=null)?PG.dateLabel(Math.floor(PG.nextStop(G)/24),PG.nextStop(G)%24):null, up:PGDATE.upcoming(G).map(s=>({who:s.who, day:CALENDAR.dateOf(s.day).key, h:s.h, place:s.place, title:s.title}))}; })()")
        res['pre'] = pre; say('   讀檔後：%s' % json.dumps(pre, ensure_ascii=False))
        run.setup('[前置] %s：最小存檔（畢業後篇）讀 %s %02d:00 校園；交往：%s%s' % (sid, sc['key'], sc['h'], '、'.join(sc['who']), ('；' + json.dumps(sc.get('extra'), ensure_ascii=False)) if sc.get('extra') else ''))
        run.check('%s：讀檔後畢業後篇有開（PG.on、PGDATE.on），交往對象對' % sid, pre['pgOn'] and pre['pgdOn'] and all(w in pre['partners'] for w in sc['who']), json.dumps(pre, ensure_ascii=False)[:300])

        if sid == 'EXD':
            run.note('【捷徑】直接問排程：PGDATE.sixMonth（不是玩到那天）')
            sch = await pg.evaluate(SCHED % ZQ)
            res['sched'] = sch; say('   排程：%s' % json.dumps(sch, ensure_ascii=False))
            m = sch['months']
            run.check('EXD：交換延畢（PG.delayed）', sch['delayed'], json.dumps(sch, ensure_ascii=False))
            ok = bool(m.get('2029-09')) and bool(m.get('2029-10')) and bool(m.get('2029-11')) and not m.get('2029-12') and bool(m.get('2030-01'))
            run.check('EXD：子晴 2029-09～11、2030-01 有格子、2029-12 沒有（AA_367 A4 新稿；舊程式整段不排、下一格 2030-02）', ok, json.dumps(sch, ensure_ascii=False)[:400])
        elif sid == 'BREAK':
            up0 = [u for u in pre['up'] if u['who'] == AN]
            run.note('【捷徑】console：ROM.end(GAME.G,"heroine_01","apart_talk")')
            await pg.evaluate("ROM.end(GAME.G,'heroine_01','apart_talk')"); await pg.wait_for_timeout(9000)
            post = await pg.evaluate("(()=>{ const G=GAME.G; return {dating:!!G.flags.dating_heroine_01, ex:!!G.flags.EX_heroine_01, up:PGDATE.upcoming(G).filter(s=>s.who==='heroine_01').map(s=>CALENDAR.dateOf(s.day).key), out:OUT.rec(G).filter(q=>q.pgWho==='heroine_01').map(q=>({id:q.id,state:q.state})), next:(PG.nextStop(G)!=null)?PG.dateLabel(Math.floor(PG.nextStop(G)/24),PG.nextStop(G)%24):null}; })()")
            res['post'] = post; say('   分手前 %s → 分手後 %s' % (json.dumps(up0, ensure_ascii=False), json.dumps(post, ensure_ascii=False)))
            run.check('BREAK：分手以前有以安的下一格（7/7）', bool(up0) and up0[0]['day'] == '2029-07-07', json.dumps(up0, ensure_ascii=False))
            run.check('BREAK：分手以後不再排她（upcoming 沒有、排好的不是 planned）', not post['dating'] and not post['up'] and all(q['state'] != 'planned' for q in post['out']), json.dumps(post, ensure_ascii=False)[:300])
        else:
            seen, done = await drive(pg, cdp, run, sc, dk)
            res['seen'] = seen; res['reached'] = done
            log = await pg.evaluate("window.__LOG||[]"); cap = await pg.evaluate("window.__CAP||[]"); res['log'] = log[-40:]; res['cap'] = cap[-40:]
            n = await pg.evaluate(NOW); res['end'] = n
            lines = [x['t'] for x in log]; caps = [x['t'] for x in cap]
            say('   結束 %s；字卡／字幕：%s' % (n['label'], json.dumps(caps[-14:], ensure_ascii=False)))
            say('   台詞：%s' % json.dumps(lines[-10:], ensure_ascii=False))
            run.check('%s：玩到 %s %s（沒有卡住）' % (sid, sc['until'][0], sc['until'][1]), done, json.dumps(n, ensure_ascii=False))
            if sid in ('KX_P1', 'KX_805'):
                d0 = dk[sc['key']]
                ms = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:kexin', d0, d0])); res['msgs'] = ms; txt = [m['text'] for m in ms]
                say('   手機 p:kexin %s：%s' % (sc['key'], json.dumps(ms, ensure_ascii=False)))
                if sid == 'KX_P1':
                    run.check('KX_P1：6/10 21:00 兩則「畢業了。我們的日子改一下。」「隔週的週日，晚上七點到九點。那兩個小時不讀書。」', txt[:2] == ['畢業了。我們的日子改一下。', '隔週的週日，晚上七點到九點。那兩個小時不讀書。'] and all(abs(m['h'] - 21) < 0.05 for m in ms[:2]), json.dumps(ms, ensure_ascii=False)[:300])
                    st0 = next((x for x in seen if any(o.startswith('出發：我們的日子：約在公館') for o in x['opts'])), None)
                    run.check('KX_P1：6/17 18:35 停下來問「出發：我們的日子：約在公館」（小字 19:00 騎車約 10 分鐘）', bool(st0) and st0['at'].startswith('6/17') and '18:35' in st0['at'] and '騎車約 10 分鐘' in ''.join(st0['opts']), json.dumps(st0, ensure_ascii=False)[:300])
                    run.check('KX_P1：公館那一句「書桌上那疊考古題，我今天丟了一半。剩下的是寫錯過的。」＋字幕「我們的日子」', '書桌上那疊考古題，我今天丟了一半。剩下的是寫錯過的。' in lines and '我們的日子' in caps, json.dumps({'caps': caps[-8:], 'lines': lines[-4:]}, ensure_ascii=False)[:400])
                else:
                    new, old = NEW['kx805_2']
                    st = 'NEW' if new in txt else ('OLD' if old in txt else 'NONE')
                    run.check('KX_805：8/5 21:00 第一句「考完了。先不要對答案。」', '考完了。先不要對答案。' in txt, json.dumps(ms, ensure_ascii=False)[:300])
                    run.check('KX_805：8/5 第二句照新稿「%s」（AA_366 第 4 節；%s）' % (new, {'NEW': '已照新稿', 'OLD': '還沒照新稿＝舊句', 'NONE': '沒收到'}[st]), st == 'NEW', json.dumps(txt, ensure_ascii=False)[:300])
                    run.check('KX_805：8/12 公館那一句「考完那天我睡到隔天下午。醒來第一件事，是去買二試要用的筆。」', '考完那天我睡到隔天下午。醒來第一件事，是去買二試要用的筆。' in lines, json.dumps(lines[-4:], ensure_ascii=False)[:300])
            elif sid in ('KX_K26', 'KX_K26N'):
                d5 = await pg.evaluate("STORY.dayOfKey('2029-07-05')"); d7 = await pg.evaluate("STORY.dayOfKey('2029-07-07')")
                ms5 = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:kexin', d5, d5])); t5 = [m['text'] for m in ms5]; res['msgs5'] = ms5
                say('   7/5 手機：%s' % json.dumps(ms5, ensure_ascii=False))
                new, old = NEW['k26_a']; st = 'NEW' if all(x in t5 for x in new) else ('OLD' if all(x in t5 for x in old) else 'NONE')
                run.check('%s：7/5 21:00 兩則照新稿「%s」（AA_366 A7；%s）' % (sid, '」「'.join(new), {'NEW': '已照新稿', 'OLD': '還沒照新稿＝舊句', 'NONE': '沒收到'}[st]), st == 'NEW', json.dumps(t5, ensure_ascii=False)[:300])
                if sid == 'KX_K26':
                    st0 = next((x for x in seen if any(o.startswith('出發：和可昕：老地方') for o in x['opts'])), None)
                    run.check('KX_K26：7/7 停下來問「出發：和可昕：老地方（…）」', bool(st0) and st0['at'].startswith('7/7'), json.dumps(st0, ensure_ascii=False)[:300])
                    newt, oldt = NEW['k26_title']; stt = 'NEW' if newt in caps else ('OLD' if oldt in caps else 'NONE')
                    run.check('KX_K26：事件字幕「%s」（AA_366 A7；%s）' % (newt, {'NEW': '已照新稿', 'OLD': '還沒照新稿＝「重新排的一天」', 'NONE': '兩個都沒看到'}[stt]), stt == 'NEW', json.dumps(caps[-10:], ensure_ascii=False)[:300])
                    run.check('KX_K26：見面那一場的句子照舊（「下個月考試。今天不讀書。……考試的事，明天再說。」）', '下個月考試。今天不讀書。……考試的事，明天再說。' in lines, json.dumps(lines[-8:], ensure_ascii=False)[:300])
                else:
                    ms7 = await pg.evaluate(MSGS + "(%s)" % json.dumps(['p:kexin', d7, d7])); t7 = [m['text'] for m in ms7]; res['msgs7'] = ms7
                    say('   7/7 手機：%s' % json.dumps(ms7, ensure_ascii=False))
                    new, old = NEW['k26_miss']; st = 'NEW' if all(x in t7 for x in new) else ('OLD' if all(x in t7 for x in old) else 'NONE')
                    run.check('KX_K26N：選「不去了」→ 7/7 16:00 兩則照新稿「%s」（AA_366 A7；%s）' % ('」「'.join(new), {'NEW': '已照新稿', 'OLD': '還沒照新稿＝舊句', 'NONE': '沒收到'}[st]), st == 'NEW', json.dumps(ms7, ensure_ascii=False)[:300])
            elif sid == 'AN_P1':
                st0 = next((x for x in seen if any(o.startswith('出發：和沈以安') for o in x['opts'])), None)
                run.check('AN_P1：6/9 14:30 停下來問「出發：和沈以安：總圖 B1 的長桌」（15:00）', bool(st0) and st0['at'].startswith('6/9') and '14:30' in st0['at'] and '總圖 B1' in ''.join(st0['opts']), json.dumps(st0, ensure_ascii=False)[:300])
                run.check('AN_P1：她那一句「這個禮拜開始，我早上七點到總圖。……門口排隊的人比我還早。」', '這個禮拜開始，我早上七點到總圖。……門口排隊的人比我還早。' in lines, json.dumps(lines[-5:], ensure_ascii=False)[:300])
            elif sid in ('PS_TN29', 'PS_TN30'):
                st0 = next((x for x in seen if any(o.startswith('出發：去台南') for o in x['opts'])), None)
                hint = ''.join(st0['opts']) if st0 else ''
                m0 = st0['money'] if st0 else None; res['money0'] = m0
                d2 = await pg.evaluate("STORY.dayOfKey('%s')" % sc['until'][0])
                spent = await pg.evaluate("(()=>{ const L=(GAME.G.ledger||GAME.G.moneyLog||[]); return Array.isArray(L)?L.slice(-12):null; })()")
                res['ledger'] = spent
                run.check('%s：%s 08:30 停下來問「出發：去台南找郭沛珊」' % (sid, sc['until'][0][5:].replace('-', '/')), bool(st0) and '08:30' in st0['at'], json.dumps(st0, ensure_ascii=False)[:300])
                if sid == 'PS_TN29':
                    run.check('PS_TN29：小字／字幕「台南・她的學校」照舊', '台南・她的學校' in hint and '台南・她的學校' in caps, json.dumps({'hint': hint, 'caps': caps[-10:]}, ensure_ascii=False)[:300])
                else:
                    new, old = NEW['tn30']; stv = 'NEW' if (new in hint or new in caps) else ('OLD' if (old in hint or old in caps) else 'NONE')
                    run.check('PS_TN30：小字／字幕「%s」（AA_367 A3；%s）' % (new, {'NEW': '已照新稿', 'OLD': '還沒照新稿＝「台南・她的學校」', 'NONE': '兩個都沒看到'}[stv]), stv == 'NEW', json.dumps({'hint': hint, 'caps': caps[-10:]}, ensure_ascii=False)[:300])
                run.check('%s：出發時扣 2,700（交通）' % sid, m0 is not None and (m0 - n['money']) >= 2700, json.dumps({'before': m0, 'after': n['money'], 'ledger': spent}, ensure_ascii=False)[:300])
                run.check('%s：最後字幕「回到臺北。」' % sid, '回到臺北。' in caps, json.dumps(caps[-8:], ensure_ascii=False)[:300])
        run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e:
        res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s：測試跑完（測試本身沒有例外）' % sid, False, str(e)[:300])
        try: await run.shot(pg, 'err_%s' % sid)
        except Exception: pass
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


# ---------------------------------------------------------------- PG-ASKAT-HOME-1021（LAWWW 6cfc73fd；06:46 派）
# 畢業以後住家裡（MOVED_OUT＋HOME_AFTER home，人在家裡的選單）：可昕的固定格 6/17（日）19:00 公館——
#   18:10 家裡的選單還沒有「出發」；18:16 有「出發：我們的日子…」（從家裡出發算 30 分鐘：19:00 − 30 − 15＝18:15 就問）；按出發 → 照家裡 30 分鐘到 → 不算遲到（KX_CRACK 1 → 0）
HOMEQ = "(()=>{ const G=GAME.G; return {home:!!(HOME.at&&HOME.at(G)), pgHome:!!(HOME.pgHome&&HOME.pgHome(G)), h:+(+G.hour).toFixed(3), label:(PG.dateLabel?PG.dateLabel(G.day,G.hour):''), zone:G.zone, crack:G.flags.KX_CRACK, out:OUT.rec(G).filter(q=>q.pgWho==='kexin').map(q=>({id:q.id, state:q.state, h:q.h, arrH:q.arrH||null})), late:G.flags.KX_LATE_N||null}; })()"


async def home_case(p, run, sid):
    res = {'sid': sid, 'note': 'PG-ASKAT-HOME-1021：畢業後住家裡，可昕 6/17 19:00 的固定格照家裡 30 分鐘問出發、不遲到'}
    for h, tag in ((18.1, 'early'), (18.27, 'due')):
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        try:
            await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
            keys = ['2029-06-01', '2029-06-02', '2029-06-28', '2029-06-17', '2026-09-06', '2027-09-05', '2028-09-03']
            dk = await pg.evaluate("(ks=>{ const o={}; for(const k of ks) o[k]=STORY.dayOfKey(k); return o; })(%s)" % json.dumps(keys))
            st = base_state(dk, '2029-06-17', h, [KX], None); st['flags']['KX_CRACK'] = 1; st['home'] = {'at': True}
            # 2026-10-22（候選 364dabe0 第一輪）：最小存檔沒有 ROOM_Y2～Y4＝讀檔就演「大二上開學前搬新房間」（主線 3：從家裡帶回宿舍拆箱），人不在家——三年的搬房間都記成搬過了
            st['flags'].update({'ROOM_Y2': dk['2026-09-06'], 'ROOM_Y3': dk['2027-09-05'], 'ROOM_Y4': dk['2028-09-03'], 'ROOM_Y4_ITEMS': [], 'BOX_KEPT_Y4': None})
            st['weekday'] = await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % st['day'])
            await L.load_state(pg, st); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
            await pg.evaluate("(()=>{ const r=SOCIAL.rel('kexin'); r.fam=45; r.trust=30; SOCIAL.remember('kexin','FIRST_MET',''); })()")
            run.setup('[前置] %s-%s：最小存檔（畢業後篇、住家裡 HOME_AFTER home、讀檔時人在家 home.at）讀 2029-06-17 %05.2f；和可昕交往、KX_CRACK 1' % (sid, tag, h))
            ops = []
            for _ in range(25):
                ops = await choices(pg)
                if ops: break
                s = await L.state(pg)
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(800)
            q0 = await pg.evaluate(HOMEQ); res[tag] = {'ops': ops, 'q0': q0}; await run.shot(pg, '%s_%s_menu' % (sid, tag))
            say('   %s %s 家裡的選單：%s｜%s' % (sid, tag, ops, json.dumps(q0, ensure_ascii=False)))
            go = next((i for i, o in enumerate(ops) if o.startswith('出發：') and '我們的日子' in o), None)
            if tag == 'early':
                run.check('%s：18:10 人在家（home.at、pgHome）、家裡的選單還沒有「出發：我們的日子」（從家裡出發 18:15 才問）' % sid, q0['home'] and q0['pgHome'] and go is None, json.dumps({'ops': ops, 'q': q0}, ensure_ascii=False)[:500])
            else:
                run.check('%s：18:16 家裡的選單有「出發：我們的日子」（小字寫從家裡出發）' % sid, go is not None and '家' in ops[go], json.dumps({'ops': ops, 'q': q0}, ensure_ascii=False)[:500])
                if go is not None:
                    await tap_choice(pg, cdp, go); arr = None; t0 = time.time(); lines = []
                    while time.time() - t0 < 300:
                        s = await L.state(pg); q = await pg.evaluate(HOMEQ)
                        if arr is None and q['zone'] != 'campus' and not q['home']: arr = q
                        log = await pg.evaluate("window.__LOG||[]")
                        if any('書桌上那疊考古題' in x['t'] for x in log) and arr is None: arr = q
                        if s['choices']:
                            o2 = await choices(pg)
                            if q['home'] and o2 and not any(o.startswith('出發：') for o in o2): break   # 回到家的選單＝演完回家了
                            await tap_choice(pg, cdp, 0); await pg.wait_for_timeout(1200); continue
                        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                        await pg.wait_for_timeout(1200)
                    q1 = await pg.evaluate(HOMEQ); log = await pg.evaluate("window.__LOG||[]"); cap = await pg.evaluate("window.__CAP||[]")
                    res['due'].update({'arrive': arr, 'after': q1, 'lines': [x['t'] for x in log][-10:], 'cap': [x['t'] for x in cap][-10:]}); await run.shot(pg, '%s_after' % sid)
                    say('   %s 到了：%s｜之後：%s' % (sid, json.dumps(arr, ensure_ascii=False), json.dumps(q1, ensure_ascii=False)))
                    say('   字卡／字幕：%s' % json.dumps([x['t'] for x in cap][-8:], ensure_ascii=False))
                    run.check('%s：按出發以後演了公館那一句「書桌上那疊考古題…」' % sid, any('書桌上那疊考古題' in x['t'] for x in log), json.dumps([x['t'] for x in log][-6:], ensure_ascii=False))
                    run.check('%s：沒有記遲到（KX_CRACK 1 → 0：準時 −1；遲到 15 分鐘以上才 +1）' % sid, q1['crack'] == 0, json.dumps({'before': 1, 'after': q1['crack'], 'arrive': arr}, ensure_ascii=False))
            res[tag]['errs'] = errs[:3]; run.check('%s-%s：沒有 JS 例外' % (sid, tag), not errs, json.dumps(errs[:3], ensure_ascii=False))
        except Exception as e:
            res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('%s-%s：測試跑完' % (sid, tag), False, str(e)[:300])
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def main():
    run = L.Run('pgdate', OUT); out = []
    scen = [s for s in os.environ.get('SCEN', ','.join(SCENS)).split(',') if s]
    async with async_playwright() as p:
        for sid in scen:
            if sid == 'KX_HOME': say('== KX_HOME：畢業後住家裡，可昕固定格照家裡車程問出發（PG-ASKAT-HOME-1021）'); out.append(await home_case(p, run, sid)); continue
            say('== %s：%s' % (sid, SCENS[sid]['note'])); out.append(await one(p, run, sid))
            json.dump(out, open(os.path.join(OUT, 'pgdate.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
