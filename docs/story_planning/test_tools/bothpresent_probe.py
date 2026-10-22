"""BB（帳號 A）2026-10-22：INV-BOTH-PRESENT-1021＋BUG-SIS-STUDY-COMPANION-1021（開發分支 2f9413a9；使用者 10-21 23:2x「有約好任何事情 改成只要兩個都在場
就不用一起走或說話才能開始」；23:1x 試玩：和學姊在總圖讀完、當場再約變成跟著走、讀書開始不了、跟到宿舍）。
使用者那份 day8 存檔在 LAWWW 的環境、BB 讀不到：照它的狀況自己做（LAWWW 01:14 說可以）。
  SCHED：第 7 天（9/23 週二）17:30 宿舍，手機「朋友」→ 學姊「約」→「去總圖一起念書」→「今天 19:00」→ 手機「等到晚上」（應停在 18:50）；
         （平日白天約總圖她會說「她已經在那裡」＝不排約，所以用晚上 19:00）→ 手機「地點」快速前往總圖
         → 不說話、不點座位：看會不會自己開始、兩個人一起坐下（淡出淡入）、演完站起來。
  NOW：接著（她還在大廳）走過去說話 →「約她去…」→「去總圖一起念書」→「現在一起過去」→ 直接開始（不跟著走、不是 going）。
  WALK_DORM：第 8 天（9/24 週三）10:00 閱覽室（她平日白天在這裡）→ 當面「現在一起過去」總圖 → 她跟著（going）→ 手機快速前往宿舍 → 作罷（訊息「…後來作罷了。」）、她沒有跟進宿舍。
  WALK_ARRIVE：同上，改成快速前往總圖（大廳）→ 一到就開始（不用說話、一起坐下）。
  WALK_CAFE_DORM（LAWWW 01:48 ③）：閱覽室約「現在一起過去」Café → 她跟著 → 手機回宿舍 → 作罷。
  MISS（LAWWW 01:48 ④）：手機約好 19:00 總圖、人一直待在宿舍 → 不開始；過了 19:30 記沒赴約、訊息「你沒有赴約：…」。
【前置】讀使用者存檔改日期、地點；學姊「已經認識」（met_sis、ev_sis_w1 記成演過、FIRST_MET）、FAMILIAR（fam 25）；去過宿舍、校園、總圖；quiet_events（不測劇情）。
沒有 ?turbo 也能跑（URL 自己決定）。Playwright 手機橫向模擬，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=SCHED,WALK_DORM,WALK_ARRIVE [PORTRAIT=1] python3 bothpresent_probe.py '<URL>/index.html' <輸出資料夾> <存檔.json>（NOW 跟在 SCHED 裡）"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)
SIS = 'heroine_05'
HOOK = """(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[];
  const at=()=>{ try{ return (+GAME.G.hour).toFixed(2); }catch(e){ return ''; } };
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__LOG.push({n:(w&&w.name)||'', t:String(t||''), at:at(), pseat:!!(GAME.E.player&&GAME.E.player.seat)}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ try{ window.__LOG.push({n:'［選項］', t:JSON.stringify((o||[]).map(x=>x.t)), at:at(), pseat:false}); }catch(e){} return c0.apply(this,arguments); }; })()"""
ST = """(()=>{ const G=GAME.G, P=GAME.E.player, n=INV.npcOf(GAME,'heroine_05'); const near=n&&n.obj?Math.hypot(n.obj.position.x-P.obj.position.x,n.obj.position.z-P.obj.position.z):null;
  return {zone:G.zone, h:+(+G.hour).toFixed(3), day:G.day, pseat:!!P.seat, pseatXZ:P.seat?[+P.seat.x.toFixed(2),+P.seat.z.toFixed(2)]:null,
    her:n&&n.obj?{x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),beh:n.beh||'',seat:n.seat?[+n.seat.x.toFixed(2),+n.seat.z.toFixed(2)]:null,pose:n.pose||'',vis:n.obj.visible!==false&&!n.hidden,d:near==null?null:+near.toFixed(2)}:null,
    inv:(G.invites||[]).filter(v=>v.who==='heroine_05').map(v=>({id:v.id,state:v.state,place:v.place,zone:v.zone,day:v.day,h:+(+v.h).toFixed(3),waitSeat:!!v.waitSeat})),
    dlg:!!(GAME.D&&GAME.D.active), busy:!!P.busy}; })()"""
MSGS = """(()=>(GAME.G.msgs||[]).filter(m=>m.th==='p:heroine_05'||/學姊|書瑀/.test(String(m.text||''))).map(m=>({d:m.day,h:m.h,text:String(m.text||'')})))()"""


async def opts(pg):
    """看得到的選項（#choices 收起來的時候按鈕還留在網頁裡，不算）"""
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>b.textContent.trim()); })()")


async def pick(pg, cdp, prefix, wait=20, advance=False):
    """選項出現後點開頭是 prefix 的那一個（像玩家一樣滑到看得到再點；選單剛出現先等 0.8 秒，點了選單沒變就再點，最多 3 次）。回傳 (點到了沒, 當時的選項)"""
    t0 = time.time(); ops = []
    while time.time() - t0 < wait:
        s = await L.state(pg)
        if s['choices']:
            ops = await opts(pg)
            if any(o.startswith(prefix) for o in ops): break
            if advance:   # 前面的閒聊選項（閒聊階梯）：照玩家點第一個，接著等約人的選單
                await pg.wait_for_timeout(800)
                c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
                if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); continue
        elif s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
        await pg.wait_for_timeout(600)
    if not any(o.startswith(prefix) for o in ops): return False, ops
    await pg.wait_for_timeout(800)
    for _ in range(3):
        c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.trim().startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(prefix))
        if not c: return True, ops
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1400)
        if (await opts(pg)) != ops: return True, ops   # 選單收起來（對話、下一層）或換了＝點到了
    return False, ops


async def drain(pg, cdp, max_steps=80, choose_first=True):
    """把對話點完（選項點第一個）；回傳點了幾下"""
    n = 0
    for _ in range(max_steps):
        s = await L.state(pg)
        if s['choices'] and choose_first:
            c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1100); n += 1; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(750); n += 1; continue
        if s['busy']: await pg.wait_for_timeout(700); continue
        break
    return n


async def phone(pg, cdp, tab):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"'+t+'\"]'); if(b) b.click(); })(%s)" % json.dumps(tab)); await pg.wait_for_timeout(800)
    return await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').replace(/\\n/g,'｜')")


async def tap_q(pg, cdp, js_find):
    c = await pg.evaluate("(()=>{ const e=(%s); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim().slice(0,30)]; })()" % js_find)
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1200); return c[2]


async def quick_go(pg, cdp, zone):
    """手機「地點」→ 那一區的「前往」"""
    await phone(pg, cdp, 'places')
    got = await tap_q(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(%s))" % json.dumps(zone + '|'))
    if not got:
        rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-place]')].map(b=>b.dataset.place)")
        await L.phone_away(pg, cdp); return False, rows
    t0 = time.time()
    while time.time() - t0 < 60:
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == zone: break
    await pg.wait_for_timeout(2500); return True, zone


async def watch_auto(pg, cdp, run, tag, secs=90):
    """不點任何東西，等她自己開始：回傳 {started, at, st_first, shots}"""
    t0 = time.time(); first = None; last = None
    while time.time() - t0 < secs:
        st = await pg.evaluate(ST); last = st
        if st['dlg'] or any(v['state'] == 'done' for v in st['inv']):
            first = st; await run.shot(pg, '%s_autostart' % tag); break
        await pg.wait_for_timeout(500)
    return first, last


async def enter_reading_room(pg, cdp, run):
    """總圖大廳二樓東側的樓梯間（exit.to＝library）走進 3F 閱覽室，像玩家一樣"""
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(q=>q.exit&&q.exit.to==='library'); return i?[i.x,i.z,i.lv|0,i.label||'']:null; })()")
    if not it: return False, 'no door'
    await L.go_to(pg, cdp, run, it[0], it[1], 0.9, it[3] or '樓梯間', max_s=180, lv=it[2])
    await L.tap(pg, cdp, '#interact')
    for _ in range(40):
        await pg.wait_for_timeout(1000)
        if (await pg.evaluate("GAME.G.zone")) == 'library': break
    await pg.wait_for_timeout(4000)
    return (await pg.evaluate("GAME.G.zone")) == 'library', it[3]


CONS = {}
DIAG = """(()=>{ const G=GAME.G, n=(GAME.E.npcs||[]).find(x=>x&&(x.charId==='heroine_05'||x.id==='sis')); const P=GAME.E.player;
  return {h:+(+G.hour).toFixed(3), pBusy:!!P.busy, pSeat:!!P.seat, depth:GAME.D?GAME.D.busyDepth:null, dActive:!!(GAME.D&&GAME.D.active), adv:!!(typeof ADV!=='undefined'&&ADV.active),
    her:n?{id:n.id, busy:!!n.busy, beh:n.beh||null, seat:!!n.seat, talk:typeof n.talk, label:n.talkLabel||null}:null, inv:(G.invites||[]).map(v=>({who:v.who,state:v.state,place:v.place})),
    meetable:typeof INV!=='undefined'&&INV.meetable?!!INV.meetable(G,'heroine_05'):null, phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())}; })()"""


async def talk_invite_now(pg, cdp, run, tag, place='去總圖一起念書'):
    """當面：走到她旁邊 →「和學姊說話」→ 聊完的選單「約她去…」→「去總圖一起念書」→「現在一起過去」。回傳 (選到了沒, 過程)"""
    trace = {}
    st = await pg.evaluate(ST); her = st['her']; trace['her0'] = her
    if not her: return False, trace
    lv = await pg.evaluate("(()=>{ const n=INV.npcOf(GAME,'heroine_05'); return n?(n.lv|0):0; })()")
    ok = await L.go_to(pg, cdp, run, her['x'], her['z'], 1.2, '學姊', max_s=150, lv=lv)
    trace['near'] = ok; trace['button'] = (await L.state(pg))['interact']
    await run.shot(pg, '%s_before_talk' % tag)
    got = False; trace['talks'] = []
    for k in range(3):   # 第一次說話可能是升階那一段（SOCIAL.playUp：便條）、那一次沒有約人的選單；照玩家再說一次
        trace.setdefault('diag', []).append({'before': await pg.evaluate(DIAG)})
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        trace['diag'][-1]['after_tap'] = await pg.evaluate(DIAG); trace['diag'][-1]['console'] = (CONS.get(id(pg)) or [])[-4:]
        got, ops = await pick(pg, cdp, '約她去', wait=40, advance=True); trace['menu'] = ops
        trace['talks'].append([(x['n'], x['t']) for x in (await pg.evaluate("window.__LOG||[]"))[-6:]])
        if got: break
        await drain(pg, cdp, choose_first=True); await pg.wait_for_timeout(1500)
        st2 = await pg.evaluate(ST)
        if st2['her']: await L.go_to(pg, cdp, run, st2['her']['x'], st2['her']['z'], 1.2, '學姊', max_s=60, lv=await pg.evaluate("(()=>{ const n=INV.npcOf(GAME,'heroine_05'); return n?(n.lv|0):0; })()"))
    if not got: return False, trace
    got, ops = await pick(pg, cdp, place, wait=20); trace['places'] = ops
    if not got: return False, trace
    got, ops = await pick(pg, cdp, '現在一起過去', wait=20); trace['times'] = ops
    trace['log'] = [(x['n'], x['t']) for x in (await pg.evaluate("window.__LOG||[]"))[-12:]]
    return got, trace


async def launch_load(p, run, base, day, h, zone, label):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=os.environ.get('PORTRAIT') != '1')   # PORTRAIT=1：直向（橫向的當面約地點選單第一排點不到，P1 已報）
    cons = []; pg.on('console', lambda m: cons.append(('%s %s' % (m.type, m.text))[:240]) if m.type in ('warning', 'error') else None); CONS[id(pg)] = cons   # 診斷：console 的 warn／error
    await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); F = G['flags']
    for k in list(F.keys()):
        if k.startswith('dating_'): F[k] = False
    F.update({'met_sis': day - 3, 'SIS_W1': day - 3})
    ev = G.setdefault('events', {}); ev.setdefault('done', {})['ev_sis_w1'] = day - 3
    vis = G.setdefault('visited', {})
    for z in ('dorm', 'campus', 'library_hall', 'library', 'gongguan', 'wenzhou', 'cafe', 'noodle'): vis[z] = True
    G.update({'day': day, 'hour': h, 'zone': zone, 'pos': None, 'weekday': await pg.evaluate("CALENDAR.dateOf(%d).wd%%7" % day)})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(5000); await pg.evaluate(HOOK)
    rel = await pg.evaluate("(()=>{ const R=SOCIAL.rel('heroine_05'); R.fam=Math.max(R.fam||0,25); R.trust=Math.max(R.trust||0,10); R.comf=Math.max(R.comf||0,10); SOCIAL.remember('heroine_05','FIRST_MET',''); return {stage:SOCIAL.stage('heroine_05'), canInvite:INV.canInvite(GAME.G,'heroine_05'), contact:INV.hasContact(GAME.G,'heroine_05'), key:CALENDAR.dateOf(GAME.G.day).key}; })()")
    run.setup('[前置] %s：使用者存檔改到第 %d 天（%s）%.2f %s；學姊已經認識、%s；quiet_events' % (label, day, rel['key'], h, zone, rel['stage']))
    say('   %s 讀檔：%s' % (label, rel))
    return b, pg, cdp, errs, rel


async def close(b):
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def sched(p, run, base, out):
    res = out.setdefault('SCHED', {})
    b, pg, cdp, errs, rel = await launch_load(p, run, base, 7, 17.5, 'dorm', 'SCHED')
    try:
        await L.phone_away(pg, cdp)
        txt = await phone(pg, cdp, 'friends')
        got = await tap_q(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"heroine_05\"]')")
        run.check('SCHED：手機「朋友」有學姊的「約」', bool(got), txt[:200])
        ok1, o1 = await pick(pg, cdp, '去總圖一起念書'); ok2, o2 = (False, [])
        if ok1: ok2, o2 = await pick(pg, cdp, '今天 19:00')
        res['menus'] = [o1, o2]; n0 = len(await pg.evaluate("window.__LOG||[]")); await drain(pg, cdp, choose_first=False)
        res['book_lines'] = (await pg.evaluate("window.__LOG||[]"))[n0:]
        st = await pg.evaluate(ST); iv = [v for v in st['inv'] if v['state'] == 'accepted' and v['place'] == 'library']
        say('   SCHED 約：%s；她說 %s' % (st['inv'], [x['t'] for x in res['book_lines']]))
        if not iv:
            run.note('SCHED：手機約 9/23 19:00 總圖她沒答應（%s）→【捷徑】INV.accept 直接約好（這一段要測的是到了以後）' % json.dumps([x['t'] for x in res['book_lines']], ensure_ascii=False)[:200])
            await pg.evaluate("INV.accept(GAME.G,'heroine_05','library',GAME.G.day,19,{by:'player'})")
        run.check('SCHED：用手機約好 19:00 總圖（accepted）', bool(iv), json.dumps(st['inv'], ensure_ascii=False))
        await L.phone_away(pg, cdp)
        # 等到晚上：應停在 18:50
        await phone(pg, cdp, 'today')
        got = await tap_q(pg, cdp, "document.querySelector('#phoneBody [data-skip=\"20.000\"]')")
        t0 = time.time()
        while time.time() - t0 < 120:
            await pg.wait_for_timeout(1500); s = await L.state(pg)
            if not s['busy'] and not s['dlg'] and not s['choices'] and not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await L.phone_away(pg, cdp)
        st = await pg.evaluate(ST); res['after_skip'] = st
        run.check('SCHED：手機「跳過時間」停在約好的時間前 10 分鐘（18:50）', bool(got) and abs(st['h'] - (19 - 1 / 6)) < 0.06, '%s h=%.3f' % (got, st['h']))
        # 快速前往總圖，不說話
        ok, info = await quick_go(pg, cdp, 'library_hall'); res['go'] = info
        run.check('SCHED：手機快速前往總圖', ok, json.dumps(info, ensure_ascii=False))
        st = await pg.evaluate(ST); res['arrive'] = st; say('   SCHED 到了：%s' % json.dumps(st, ensure_ascii=False))
        await run.shot(pg, 'SCHED_arrive')
        first, last = await watch_auto(pg, cdp, run, 'SCHED', secs=120); res['first'] = first; res['last'] = last
        say('   SCHED 自動開始：%s' % json.dumps(first, ensure_ascii=False))
        run.check('SCHED：她在、你在＝沒說話、沒點座位就自己開始（18:45～19:30 之間）', bool(first), json.dumps(last, ensure_ascii=False)[:400])
        if first:
            run.check('SCHED：開始時兩個人一起坐下（你有座位、她有座位、距離 ≤ 1.6 m）', first['pseat'] and bool(first['her']) and bool(first['her']['seat']) and (first['her']['d'] or 9) <= 1.6, json.dumps(first, ensure_ascii=False)[:400])
            n0 = len(await pg.evaluate("window.__LOG||[]")); h0 = first['h']
            await drain(pg, cdp); await pg.wait_for_timeout(2500)
            lines = (await pg.evaluate("window.__LOG||[]"))[n0 - 1 if n0 else 0:]; res['lines'] = lines
            st = await pg.evaluate(ST); res['after'] = st; await run.shot(pg, 'SCHED_after')
            say('   SCHED 台詞：%s' % json.dumps([(x['n'], x['t'], x['pseat']) for x in lines], ensure_ascii=False)[:1500])
            run.check('SCHED：演出時你是坐著的（每一句 pseat）', bool(lines) and all(x['pseat'] for x in lines), json.dumps([x['pseat'] for x in lines]))
            run.check('SCHED：演完邀約變成 done、時間過了 1.5 小時（總圖 stay）', any(v['state'] == 'done' and v['place'] == 'library' for v in st['inv']) and abs(st['h'] - h0 - 1.5) < 0.2, '%s %.2f→%.2f' % (json.dumps(st['inv'], ensure_ascii=False), h0, st['h']))
            run.check('SCHED：演完你站起來了（沒有座位）', not st['pseat'], json.dumps(st, ensure_ascii=False)[:300])
            ms = await pg.evaluate(MSGS); res['msgs'] = ms[-6:]
            run.check('SCHED：訊息「和…在總圖。」', any('在總圖' in m['text'] for m in ms), json.dumps(ms[-4:], ensure_ascii=False))
            # NOW：她還在的話，當場再約一次
            res2 = out.setdefault('NOW', {}); st = await pg.evaluate(ST); res2['before'] = st
            if not (st['her'] and st['her']['vis']):
                run.note('NOW：NOT TESTED——讀完以後她不在大廳（%s）' % json.dumps(st['her'], ensure_ascii=False))
            else:
                got, trace = await talk_invite_now(pg, cdp, run, 'NOW'); res2['trace'] = trace
                say('   NOW 過程：%s' % json.dumps(trace, ensure_ascii=False)[:800])
                if not got:
                    run.note('NOW：NOT TESTED——當面約的選單沒走到「現在一起過去」：%s' % json.dumps(trace, ensure_ascii=False)[:400])
                else:
                    n0 = len(await pg.evaluate("window.__LOG||[]")); seen_going = False; seen_seat = False; t0 = time.time(); h0 = (await pg.evaluate(ST))['h']
                    while time.time() - t0 < 150:
                        st = await pg.evaluate(ST)
                        if any(v['state'] == 'going' for v in st['inv']): seen_going = True
                        if st['pseat'] and st['dlg']: seen_seat = True
                        s = await L.state(pg)
                        if s['choices']: await drain(pg, cdp, max_steps=1); continue
                        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(750); continue
                        if s['busy']: await pg.wait_for_timeout(600); continue
                        if time.time() - t0 > 20: break
                        await pg.wait_for_timeout(800)
                    lines = (await pg.evaluate("window.__LOG||[]"))[n0:]; res2['lines'] = lines
                    st = await pg.evaluate(ST); res2['after'] = st; await run.shot(pg, 'NOW_after')
                    say('   NOW 台詞：%s' % json.dumps([(x['n'], x['t'], x['pseat']) for x in lines], ensure_ascii=False)[:1500])
                    dn = [v for v in st['inv'] if v['state'] == 'done' and v['place'] == 'library']
                    acc = not any('看了一下手機的行事曆' in x['t'] for x in lines) or len(dn) >= 2
                    if len(dn) < 2 and not seen_going:
                        run.note('NOW：她沒答應（%s）——「現在一起過去」直接開始這一項 NOT TESTED' % json.dumps([x['t'] for x in lines][-4:], ensure_ascii=False))
                    else:
                        run.check('NOW：已經在總圖當面約「現在一起過去」＝直接開始（沒有變成 going／跟著走）', not seen_going and len(dn) >= 2, json.dumps({'going': seen_going, 'inv': st['inv']}, ensure_ascii=False)[:400])
                        run.check('NOW：直接開始時兩個人一起坐下', seen_seat, json.dumps([x['pseat'] for x in lines]))
                        run.check('NOW：演完你站起來、她沒有跟著你（beh 不是 follow）', not st['pseat'] and not (st['her'] and st['her']['beh'] == 'follow'), json.dumps(st, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('SCHED：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('SCHED：測試跑完', False, str(e)[:300])
    await close(b)


async def walk(p, run, base, sid, out):
    # 02:5x 改：閱覽室（總圖 3F）約「去總圖一起念書」她回「我就在總圖…」（她已經在總圖）＝不會跟著走；一起走的三項改約總圖以外的地方（半熟 08:00 開、Café 11:00 開），
    # 在閱覽室當面約總圖另外測（LIB_HERE：LAWWW 01:48 ②「已經在總圖當面再約＝直接開始」）
    res = out.setdefault(sid, {}); dest = {'WALK_DORM': 'dorm', 'WALK_CAFE_DORM': 'dorm', 'WALK_ARRIVE': 'cafe', 'LIB_HERE': None}[sid]
    place = {'WALK_DORM': '去半熟吃早午餐', 'WALK_CAFE_DORM': '去兩點半 Café 坐坐', 'WALK_ARRIVE': '去兩點半 Café 坐坐', 'LIB_HERE': '去總圖一起念書'}[sid]
    hour = 11.0 if place.startswith('去兩點半') else 10.0
    b, pg, cdp, errs, rel = await launch_load(p, run, base, 8, hour, 'library_hall', sid + '（讀檔在總圖大廳，自己走樓梯間進 3F 閱覽室：直接讀檔進閱覽室她不會出現，見 BB_218；約「%s」）' % place)
    try:
        await L.phone_away(pg, cdp); await pg.wait_for_timeout(2000)
        ok, lab = await enter_reading_room(pg, cdp, run); res['enter'] = [ok, lab]
        run.check('%s：從大廳二樓樓梯間走進 3F 閱覽室' % sid, ok, lab)
        st = await pg.evaluate(ST); res['start'] = st
        if not (st['her'] and st['her']['vis']):
            run.check('%s：9/24 10:00 閱覽室有學姊（作息）' % sid, False, json.dumps(st, ensure_ascii=False)[:300]); raise RuntimeError('她不在')
        got, trace = await talk_invite_now(pg, cdp, run, sid, place); res['trace'] = trace
        say('   %s 過程：%s' % (sid, json.dumps(trace, ensure_ascii=False)[:800]))
        if not got: run.check('%s：當面約走到「現在一起過去」' % sid, False, json.dumps(trace, ensure_ascii=False)[:400]); raise RuntimeError('沒約成')
        n0 = len(await pg.evaluate("window.__LOG||[]")); await drain(pg, cdp, choose_first=False); await pg.wait_for_timeout(2500)
        res['book_lines'] = (await pg.evaluate("window.__LOG||[]"))[n0:]
        st = await pg.evaluate(ST); res['after_book'] = st; say('   %s 約完：%s；%s' % (sid, json.dumps(st['inv'], ensure_ascii=False), [x['t'] for x in res['book_lines']]))
        lg = trace.get('log') or []; last_menu = max((i for i, x in enumerate(lg) if x[0] == '［選項］'), default=-1)
        T = [x[1] for x in lg[last_menu + 1:]] + [x['t'] for x in res['book_lines']]   # 選了時間以後她說的話（talk_invite_now 的 log 尾巴＋之後的）；02:5x 第一輪只看 book_lines，漏掉了那一句
        if sid == 'LIB_HERE':   # 兩個人都已經在總圖：當面約總圖＝直接開始（不是手機那句「我就在總圖。三樓。不要講話，傳訊息。」）
            phone_line = [t for t in T if '傳訊息' in t or '不要講話' in t]
            run.check('LIB_HERE：在閱覽室當面約「去總圖一起念書」「現在一起過去」——她沒有回手機那句「…不要講話，傳訊息。」', not phone_line, json.dumps(T[:8], ensure_ascii=False)[:400])
            started = any(v['state'] in ('done', 'together') for v in st['inv']) or st['dlg'] or st['pseat']
            run.check('LIB_HERE：兩個人都在總圖＝直接開始（LAWWW 01:48 ②）', bool(started), json.dumps({'inv': st['inv'], 'lines': T[:8]}, ensure_ascii=False)[:400])
            await run.shot(pg, 'LIB_HERE_after')
            res['errs'] = errs[:3]; run.check('LIB_HERE：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
            await close(b); return
        going = any(v['state'] == 'going' for v in st['inv'])
        if not going: run.note('%s：她沒答應或沒有跟（%s）' % (sid, json.dumps(T, ensure_ascii=False)[:300]))
        run.check('%s：閱覽室約「%s」「現在一起過去」＝她跟著走（going、follow）' % (sid, place), going and bool(st['her']) and st['her']['beh'] == 'follow', json.dumps(st, ensure_ascii=False)[:400])
        await run.shot(pg, '%s_following' % sid)
        ok, info = await quick_go(pg, cdp, dest); res['go'] = info
        run.check('%s：手機快速前往 %s' % (sid, dest), ok, json.dumps(info, ensure_ascii=False))
        if dest == 'dorm':
            await pg.wait_for_timeout(4000); st = await pg.evaluate(ST); res['in_dorm'] = st; await run.shot(pg, '%s_in' % sid)
            ms = await pg.evaluate(MSGS); res['msgs'] = ms[-4:]
            run.check('%s：走進宿舍＝作罷（邀約 cancelled、訊息「…後來作罷了。」）' % sid, any(v['state'] == 'cancelled' for v in st['inv']) and any('作罷' in m['text'] for m in ms), json.dumps({'inv': st['inv'], 'msgs': ms[-3:]}, ensure_ascii=False)[:400])
            run.check('%s：她沒有跟進宿舍' % sid, not (st['her'] and st['her']['vis'] and st['zone'] == 'dorm' and (st['her']['d'] or 99) < 15), json.dumps(st['her'], ensure_ascii=False))
            # 再出宿舍、去總圖看她會不會又出現跟著
        else:
            first, last = await watch_auto(pg, cdp, run, sid, secs=60); res['first'] = first; res['last'] = last
            say('   %s 到了：%s' % (sid, json.dumps(first or last, ensure_ascii=False)))
            run.check('WALK_ARRIVE：一起走到 Café＝不用說話就開始', bool(first), json.dumps(last, ensure_ascii=False)[:400])
            if first:
                run.check('WALK_ARRIVE：開始時兩個人一起坐下', first['pseat'] and bool(first['her']) and bool(first['her']['seat']), json.dumps(first, ensure_ascii=False)[:400])
                n0 = len(await pg.evaluate("window.__LOG||[]")); await drain(pg, cdp); await pg.wait_for_timeout(2500)
                lines = (await pg.evaluate("window.__LOG||[]"))[max(0, n0 - 1):]; res['lines'] = lines
                st = await pg.evaluate(ST); res['after'] = st; await run.shot(pg, 'WALK_ARRIVE_after')
                say('   WALK_ARRIVE 台詞：%s' % json.dumps([(x['n'], x['t'], x['pseat']) for x in lines], ensure_ascii=False)[:1200])
                run.check('WALK_ARRIVE：演完 done、你站起來', any(v['state'] == 'done' for v in st['inv']) and not st['pseat'], json.dumps(st, ensure_ascii=False)[:300])
        res['errs'] = errs[:3]; run.check('%s：沒有 JS 例外' % sid, not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 停在這裡', e)
    await close(b)


async def miss(p, run, base, out):
    """④ 你不在約定的地方：不開始；過了約好的時間（19:00＋30 分鐘）記沒赴約、訊息「你沒有赴約：…」"""
    res = out.setdefault('MISS', {})
    b, pg, cdp, errs, rel = await launch_load(p, run, base, 7, 17.5, 'dorm', 'MISS')
    try:
        await L.phone_away(pg, cdp)
        await phone(pg, cdp, 'friends')
        await tap_q(pg, cdp, "document.querySelector('#phoneBody [data-inv=\"heroine_05\"]')")
        ok1, o1 = await pick(pg, cdp, '去總圖一起念書'); ok2 = False
        if ok1: ok2, o2 = await pick(pg, cdp, '今天 19:00')
        await drain(pg, cdp, choose_first=False); await L.phone_away(pg, cdp)
        st = await pg.evaluate(ST); res['booked'] = st['inv']
        run.check('MISS：手機約好 19:00 總圖', any(v['state'] == 'accepted' for v in st['inv']), json.dumps(st['inv'], ensure_ascii=False))
        t0 = time.time(); started = False
        while time.time() - t0 < 600:   # 一直待在宿舍：手機「跳過時間」到晚上，遇到約好的會停；停了就再跳
            st = await pg.evaluate(ST)
            if st['dlg'] and any(v['state'] == 'done' for v in st['inv']): started = True
            if st['h'] >= 19.75 or any(v['state'] == 'missed' for v in st['inv']): break
            s = await L.state(pg)
            if s['choices']: await drain(pg, cdp, max_steps=1); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            await phone(pg, cdp, 'today')
            got = await tap_q(pg, cdp, "[...document.querySelectorAll('#phoneBody [data-skip]')].pop()")
            if not got: await L.phone_away(pg, cdp); await pg.wait_for_timeout(3000)
            else: await pg.wait_for_timeout(2500)
        await L.phone_away(pg, cdp)
        t1 = time.time(); flip = None   # 跳完時間以後在房間裡待著（時間照走），最多看 90 秒：什麼時候記成沒赴約
        while time.time() - t1 < 90:
            st = await pg.evaluate(ST)
            if any(v['state'] == 'missed' for v in st['inv']): flip = st['h']; break
            await pg.wait_for_timeout(3000)
        res['flip_h'] = flip; res['tick'] = await pg.evaluate("(()=>({stBusy:!!(GAME.E.player&&GAME.E.player.busy), adv:!!(typeof ADV!=='undefined'&&ADV.active), paused:!!GAME.E.paused, zone:GAME.G.zone, h:GAME.G.hour}))()")
        st = await pg.evaluate(ST); res['after'] = st; ms = await pg.evaluate(MSGS); res['msgs'] = ms[-4:]
        await run.shot(pg, 'MISS_after')
        say('   MISS：%s；訊息 %s' % (json.dumps(st, ensure_ascii=False)[:300], json.dumps(ms[-3:], ensure_ascii=False)))
        run.check('MISS：人在宿舍＝沒有開始（邀約沒有變成 done、沒有演見面）', not started and not any(v['state'] == 'done' for v in st['inv']), json.dumps(st['inv'], ensure_ascii=False))
        run.check('MISS：過了 19:30 記沒赴約（missed）、訊息「你沒有赴約：…」', any(v['state'] == 'missed' for v in st['inv']) and any('沒有赴約' in m['text'] for m in ms), json.dumps({'inv': st['inv'], 'h': st['h'], 'flip_h': res.get('flip_h'), 'tick': res.get('tick'), 'msgs': ms[-3:]}, ensure_ascii=False)[:500])
        res['errs'] = errs[:3]; run.check('MISS：沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:300]; say('   ! 例外', e); run.check('MISS：測試跑完', False, str(e)[:300])
    await close(b)


async def main():
    run = L.Run('bothpresent', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    scen = os.environ.get('SCEN', 'SCHED,WALK_DORM,WALK_ARRIVE').split(',')
    async with async_playwright() as p:
        for sid in scen:
            say('== %s' % sid)
            if sid == 'SCHED': await sched(p, run, base, out)
            elif sid == 'MISS': await miss(p, run, base, out)
            else: await walk(p, run, base, sid, out)
            json.dump(out, open(os.path.join(OUT, 'bothpresent.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
