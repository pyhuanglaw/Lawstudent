"""BB：QA-AA300-1018（同一支，MODE=ff＋記停點、日期卡）／QA-PLAYTHROUGH-1018（v9.10.1 發布條件，使用者 10-18 07:1x 同意）——經濟系路線從新遊戲玩到 8/30 第一次去政大（E37）以後，照「真實玩家」的四種玩法：
  MODE=sleep    天天直接睡覺：一空下來，在宿舍就走去床邊睡、在家就選「睡覺」
  MODE=nophone  完全不開手機：不打開手機、不回任何訊息（自動打開的手機直接收起來）
  MODE=decline  所有邀約都拒絕／不回：手機要回的選最後一個（不去／今天不行），選項裡有拒絕的就選拒絕
  MODE=ff       一直快轉：選項裡有「快轉」「到下一個有事的日子」「跳過」就選
不瞬移、不改劇情狀態；開局按標題「從經濟系前傳開始」。手機模擬 844×390 觸控（Playwright，不是實機）。
記錄：卡住超過 4 分鐘（重現：日期、時間、區域、畫面）、JS 例外、畫面檢查（screencheck）、每月一張截圖、遊戲裡的台詞（dlg hook）。
用法：MODE=sleep LW_TESTS=<LAWWW>/tests python3 qa_play.py URL OUT"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
import screencheck as SC
from playwright.async_api import async_playwright
URL = sys.argv[1]; OUT = sys.argv[2]; MODE = os.environ.get('MODE', 'sleep'); MAXH = float(os.environ.get('MAXH', '1.9')); END = os.environ.get('END', '')
import re
BADTXT = re.compile(r'undefined|NaN|null|\$\{|\b(ev|rh|kh|y0|cg|bg)_[a-z0-9_]+|[A-Z]{2,}_[A-Z0-9_]+')
EXTRA = [x for x in os.environ.get('PREF_EXTRA', '').split(',') if x]
PENDING = "(()=>{ const G=GAME.G; const a=(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>PHONE.th(m)):[]; const b=(G.invites||[]).filter(v=>v.state==='offered'||v.state==='changed').map(v=>{ const m=(G.msgs||[]).find(q=>q.iv===v.id); return m?PHONE.th(m):null; }).filter(Boolean); return a.concat(b); })()"
PREF0 = {'sleep': ['睡到明天早上', '睡覺', '睡', '出發', '直接去'],
        'nophone': ['出發', '直接去'],
        'decline': ['不去', '今天不行', '先不要', '不了', '下次', '不用了', '先走'],
        'ff': ['快轉', '到下一個有事的日子', '跳過', '睡到明天早上', '睡覺', '出發', '直接去']}[MODE]
PREF = EXTRA + PREF0
DECLINE_LAST = MODE == 'decline'
async def pick(pg, cdp):
    c = await pg.evaluate("((w,last)=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>!b.disabled); if(!bs.length) return null; let e=null; for(const t of w){ e=bs.find(x=>x.textContent.trim().replace(/^「/,'').startsWith(t)); if(e) break; } e=e||(last?bs[bs.length-1]:bs[0]); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,28),bs.map(x=>x.textContent.trim().slice(0,12))]; })(%s,%s)" % (json.dumps(PREF), 'true' if DECLINE_LAST else 'false'))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    return c
async def phone_open(pg):
    return await pg.evaluate("!document.getElementById('phone').classList.contains('hide')")
async def answer_phone(pg, cdp, th):
    if not await phone_open(pg): await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{ const b=document.querySelector('#phoneTabs button[data-ptab=\"msg\"]'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)
    c = await pg.evaluate("(t=>{ const e=[...document.querySelectorAll('#phoneBody [data-th]')].find(b=>b.dataset.th===t); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % json.dumps(th))
    if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900)
    b = await pg.evaluate("((last,ex)=>{ const es=[...document.querySelectorAll('#phoneBody [data-ask], #phoneBody [data-ans]')]; if(!es.length) return null; const e=es.find(x=>ex.some(t=>x.textContent.includes(t)))||(last?es[es.length-1]:es[0]); e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })(%s,%s)" % ('true' if DECLINE_LAST else 'false', json.dumps(EXTRA)))
    if b: await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(900)
    if await phone_open(pg): await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    return b and b[2]
async def main():
    run = L.Run('qa_play_' + MODE, OUT); sc = SC.Checker(run, OUT); problems = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        await L.tap(pg, cdp, '#btnNew'); print('MODE', MODE, '：標題「從經濟系前傳開始」', flush=True)
        t0 = time.time(); last_key = None; last_sig = None; stuck_t = time.time(); stuck = 0; idle = 0; was_dlg = False; last_opts = None; months = set(); answered = 0; phone_closed = 0; stops = []; seen_bad = set(); cards = []; beds = []; last_card = ''; in_scene = False; phone_auto = 0
        while time.time() - t0 < MAXH * 3600:
            if not await pg.evaluate("!!GAME.G&&GAME.running"): await pg.wait_for_timeout(800); continue
            g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:+GAME.G.hour.toFixed(2),zone:GAME.G.zone,home:typeof HOME!=='undefined'&&HOME.at(GAME.G),e37:!!(GAME.G.events.done||{}).ev_y0_e37})")
            if (END and g['key'] >= END) or (not END and (g['e37'] or g['key'] >= '2025-09-01')): break
            if g['key'] != last_key:
                last_key = g['key']; print('  [%6.1f 分] %s' % ((time.time()-t0)/60, json.dumps(g, ensure_ascii=False)), flush=True)
                if g['key'][:7] not in months: months.add(g['key'][:7]); await run.shot(pg, 'month_' + g['key'])
            await pg.evaluate("(()=>{ if(GAME.titleCard&&!GAME.titleCard.__bb){ const o=GAME.titleCard; const f=function(t,s,ms){ (window.__cards=window.__cards||[]).push((CALENDAR.dateOf(GAME.G.day).key)+'｜'+t+(s?'｜'+s:'')); return o.apply(this,arguments); }; f.__bb=1; GAME.titleCard=f; } })()")
            newc = await pg.evaluate("(()=>{ const a=window.__cards||[]; window.__cards=[]; return a; })()")
            for card in newc: cards.append(card); print('   【日期卡】', card, flush=True)
            s = await L.state(pg)
            if s['dlg'] and not in_scene:
                in_scene = True; stops.append((g['key'], g['h'], g['zone'], s['dtext'][:36])); print('   ＊停點 %d：%s %.2f %s「%s」' % (len(stops), g['key'], g['h'], g['zone'], s['dtext'][:36]), flush=True)
            if not s['dlg'] and not s['choices'] and not s['busy']: in_scene = False
            sig = (s['dtext'], s['choices'], g['zone'], g['h'], g['key'])
            if sig != last_sig: last_sig = sig; stuck_t = time.time()
            elif time.time() - stuck_t > 240:
                stuck += 1; problems.append('卡住超過 4 分鐘：%s %.2f %s 對話「%s」選項 %s' % (g['key'], g['h'], g['zone'], s['dtext'][:30], s['choices']))
                run.note(problems[-1]); await run.shot(pg, 'stuck_%d' % stuck); stuck_t = time.time()
                await L.close_panels(pg, cdp)
                if stuck > 4: break
            if s['dlg'] and not was_dlg: await sc.check(pg, '%s 對話 %s' % (last_key, s['dtext'][:12]))
            was_dlg = bool(s['dlg'])
            if s['dlg'] and await phone_open(pg):   # 手機自己打開、蓋在對話上：玩家會先處理手機（回要回的那一則，沒有就收起來）
                pend1 = [] if MODE == 'nophone' else await pg.evaluate(PENDING)
                if pend1: a = await answer_phone(pg, cdp, pend1[0]); answered += 1; print('   （手機蓋在對話上）回覆', pend1[0], a, flush=True)
                else: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
                continue
            if s['dlg']:
                hz = await pg.evaluate("(()=>{ const G=GAME.G, dd=CALENDAR.dateOf(G.day+Math.floor(G.hour/24)), t=(document.getElementById('clockT')||{}).textContent||''; const h=Math.floor(G.hour%24), m=Math.floor((G.hour%1)*60); return {t, exp:dd.m+'/'+dd.d, hm:String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}; })()")
                if hz['t'] and not hz['t'].startswith(hz['exp'] + ' '):
                    k2 = ('hud', g['key'], int(g['h']))
                    if k2 not in seen_bad: seen_bad.add(k2); problems.append('右上角日期「%s」≠ 真正 %s（%s %.2f，對話「%s」）' % (hz['t'], hz['exp'], g['key'], g['h'], s['dtext'][:16]))
                if BADTXT.search(s['dtext'] or ''):
                    k3 = ('txt', s['dtext'][:20])
                    if k3 not in seen_bad: seen_bad.add(k3); problems.append('台詞有奇怪的字：%s %.2f「%s」' % (g['key'], g['h'], s['dtext'][:50])); await run.shot(pg, 'badtxt_%d' % len(seen_bad))
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); idle = 0; continue
            if MODE == 'nophone':
                if await phone_open(pg): phone_closed += 1; await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); continue
            else:
                if await phone_open(pg) and not s['dlg']:
                    pend0 = await pg.evaluate(PENDING)
                    phone_auto += 1; print('   手機自己打開了（待回 %d 則）' % len(pend0), flush=True)
                    if pend0:   # 手機自己打開又有要回的：玩家會直接回（遊戲在等這則回覆，所以 busy）
                        a = await answer_phone(pg, cdp, pend0[0]); answered += 1; print('   （自動打開的手機）回覆', pend0[0], a, flush=True); continue
                    if not pend0:
                        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
                        if await phone_open(pg): problems.append('手機打開以後關不掉：%s %.2f' % (g['key'], g['h'])); await run.shot(pg, 'phone_stuck_%d' % phone_auto)
                        continue
                pend = await pg.evaluate(PENDING)
                if pend and (s['choices'] or not s['busy'] or await phone_open(pg)):
                    a = await answer_phone(pg, cdp, pend[0]); answered += 1; print('   手機回覆', pend[0], a, flush=True); continue
            if s['choices']:
                opts = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,12)).join('|')")
                if opts != last_opts: last_opts = opts; await sc.check(pg, '%s 選項 %s' % (last_key, opts[:16]))
                c = await pick(pg, cdp)
                if c: print('   ▶', c[2], '／', c[3], flush=True)
                idle = 0; continue
            if s['busy']: await pg.wait_for_timeout(700); continue
            idle += 1
            if (MODE == 'sleep' or (MODE == 'ff' and g['stage'] == 'law')) and g['zone'] == 'dorm' and not g['home'] and idle >= 2:   # 2026-10-21：快轉玩法進了法律系宿舍（8/29 起）也去床邊——床的選單有沒有「快轉」照實記下來（BUG-0830-EMPTYSTOP-1018）
                bed = await pg.evaluate("(()=>{ const it=GAME.E.interactables.find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
                if bed and await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=90):
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); idle = 0
                    bo = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30))")
                    print('   床的選單 %s %.2f：%s' % (g['key'], g['h'], ' / '.join(bo)), flush=True); beds.append((g['key'], g['h'], bo)); continue
            if idle >= 40 and not g['home'] and g['zone'] == 'campus':   # 出遊演完人留在校園：走到校門口「回臺北的家」（玩家會做的）
                problems.append('演完留在校園、要自己走去校門口回家：%s %.2f' % (g['key'], g['h'])); print('   ' + problems[-1], flush=True)
                if await L.go_to(pg, cdp, run, -120.5, 2.4, 0.9, '回臺北的家', max_s=240): await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
                idle = 0; continue
            await pg.wait_for_timeout(700)
        await run.shot(pg, 'end'); sc.finish()
        g = await pg.evaluate("({stage:GAME.G.stage,key:CALENDAR.dateOf(GAME.G.day).key,h:GAME.G.hour,e37:!!(GAME.G.events.done||{}).ev_y0_e37,fb:GAME.walkFallbacks||0})")
        print('結束', json.dumps(g, ensure_ascii=False), '手機回覆', answered, '收起自動打開的手機', phone_closed, flush=True)
        print('總時間 %.1f 分（真實時間，?turbo 下）' % ((time.time()-t0)/60))
        print('停點 %d 個：' % len(stops)); [print('   %2d %s %5.2f %-10s「%s」' % (i+1, *x)) for i, x in enumerate(stops)]
        print('日期卡 %d 張：' % len(cards)); [print('   ', x) for x in cards]
        print('床的選單 %d 次：' % len(beds)); [print('   %s %5.2f %s' % (k, h, ' / '.join(o))) for k, h, o in beds]
        print('手機自己打開 %d 次' % phone_auto)
        print('問題：'); [print('   -', x) for x in problems]
        # 2026-10-21 BB（帳號 A）：AA_368 H3（2/8 23:00 可昕「我把高三的講義翻出來了。」、沒有選項）、H4／M7（7/10～7/26）——收到的訊息全部存 msgs.json，可昕那兩段印出來
        msgs = await pg.evaluate("(GAME.G.msgs||[]).map(m=>({d:CALENDAR.dateOf(m.day).key, h:m.h!=null?m.h:(m.hour!=null?m.hour:null), from:m.from||'', text:String(m.text||''), ask:!!m.ask, tag:m.tag||''}))")
        json.dump(msgs, open(os.path.join(OUT, 'msgs.json'), 'w'), ensure_ascii=False, indent=1)
        print('可昕的訊息（2/1～2/14、7/10～7/26）：'); [print('   %s %s %s%s' % (m['d'], m['h'], m['text'][:60], '（有選項）' if m['ask'] else '')) for m in msgs if m['from'] == 'kexin' and ('2025-02-01' <= m['d'] <= '2025-02-14' or '2025-07-10' <= m['d'] <= '2025-07-26')]
        run.check('玩到 8/30 第一次去政大（E37 演完）', g['e37'], json.dumps(g, ensure_ascii=False))
        run.check('沒有卡住超過 4 分鐘', stuck == 0, str(stuck))
        run.check('沒有用到卡住保險', g['fb'] == 0, str(g['fb']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())
asyncio.run(main())
