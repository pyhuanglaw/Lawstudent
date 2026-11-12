"""CC-B（帳號 B）11-09：BB-TEST-AA355-358-1021 第 3 條（AA_358 2-3）：可昕告白 E26（舊序章系所 10/17 車上）——中秋系烤去／沒去兩種。判定＝BB。
做法：照 tests/flow_v0_to1017.py（新遊戲 → 舊序章系所 → 一路玩到 10/17 晚上，真實玩家流程、不用 turbo）整支跑，只多三件：
  ① 9/21 16:00 舊序章同學私訊「烤肉你要去嗎？」：E08=yes 回「好」、E08=no 回「今天不行」（玩家在手機上點；原本的流程不回這種非必回的訊息）
  ② 記下全部台詞（ADV.log＋GAME.say）；
  ③ 最後檢查 10/17 車上那一段：E08=yes＝「中秋系烤那天，妳一直跟他講話。」「他在問我會計作業。他問了一個晚上。」；E08=no＝「妳那陣子一直跟他講話。」「他在問我會計作業。他每次都問。」；
     另外 E08=no 要收到可昕「你沒來。火很小，月亮很晚才出來。」、E08=yes 要演過 ev_y0_e08。
用法：LW_TESTS=<wt>/tests E08=yes|no python3 cc_e26_flow.py <url> <out>"""
import os, sys
T = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests')
E08 = (os.environ.get('E08') or 'no').lower()
src = open(os.path.join(T, 'flow_v0_to1017.py'), encoding='utf-8').read()
HOOK = ("(()=>{ if(window.__LOGH) return; window.__LOGH=1; window.__LOG=[]; const o=ADV.log; ADV.log=function(n,t){ try{ window.__LOG.push({n:n||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return o.apply(this,arguments); }; "
        "if(!GAME.say.__bbs){ const s0=GAME.say; const f=function(w,t){ try{ if(!(typeof ADV!=='undefined'&&ADV.active)) window.__LOG.push({n:(w&&(w.name||w.charId))||'',t:String(t),h:+GAME.G.hour.toFixed(2),d:CALENDAR.dateOf(GAME.G.day).key}); }catch(e){} return s0.apply(this,arguments); }; f.__bbs=1; GAME.say=f; } })()")
# BB-B 17:44：y0_e08_missed 第一次排進佇列的那一刻（G.day／G.hour、ev_y0_e08 演過沒、OUT y0_e08 的 state、E08_GO）
HOOK = HOOK[:-4] + (" if(typeof PHONE!=='undefined'&&!PHONE.__ccE08){ const pa=PHONE.at; PHONE.at=function(G,day,h,list,tag){ try{ if(tag==='y0_e08_missed'&&!window.__E08Q){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'y0_e08'):null; window.__E08Q={now:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), forDay:CALENDAR.dateOf(day).key, forH:h, e08done:!!(G.events&&G.events.done&&G.events.done.ev_y0_e08), outState:q?q.state:null, E08_GO:G.flags.E08_GO||null, running:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null}; } }catch(e){} return pa.apply(this,arguments); }; PHONE.__ccE08=1; } })()")
ANS = '好' if E08 == 'yes' else ('今天不行' if E08 == 'no' else '（不回）')   # E08=none：停在私訊但不回，讓它過 17:00（BB-B 18:20 第 1 條）
PATCH1_OLD = 'async def close_or_answer(pg, cdp, run):\n'
PATCH1_NEW = PATCH1_OLD + '''    try: await pg.evaluate(@HOOK@)
    except Exception: pass
    wl = await pg.evaluate("(()=>{ try{ const G=GAME.G; if(G.flags.E08_GO) return null; const m=PHONE.pending(G).find(q=>q.ask&&PHONE.th(q)==='p:econ_weilun'); if(!m) return null; GAME.openPhone('msg','p:econ_weilun'); return 1; }catch(e){ return null; } })()")
    if wl:
        await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(a=>{ const b=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>x.textContent.trim()===a); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(@ANS@)")
        info = await pg.evaluate("(()=>{ const G=GAME.G; let t=''; try{ const m=PHONE.pending(G).find(q=>q.ask&&PHONE.th(q)==='p:econ_weilun'); t=m?m.text:''; }catch(e){} const tx=id=>{ const e=document.getElementById(id); return e?e.textContent.trim().slice(0,60):''; }; return {d:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), text:t, opts:[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>b.textContent.trim()), toast:tx('toast'), caption:tx('caption')||tx('cap')}; })()")
        if not await pg.evaluate("window.__ccE08seen||0"):
            await pg.evaluate("window.__ccE08seen=1")
            print('   [E08=@E08@] 停在 %s %s；私訊原文「%s」；回覆鍵 %s；toast「%s」；caption「%s」' % (info['d'], info['h'], info['text'], info['opts'], info['toast'], info['caption']), flush=True)
        if @NONE@:
            return await L.close_panels(pg, cdp)
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); print('   [E08=@E08@] 舊序章同學「烤肉你要去嗎？」：回「%s」（E08_GO=%s）' % (c[2], await pg.evaluate("GAME.G.flags.E08_GO||null")), flush=True)
        else: print('   [E08] 舊序章同學的訊息開了但找不到「@ANSRAW@」', flush=True)
        if @FAST@:   # BB-B 21:25：回完不關面板，馬上切「今天」按「等到晚上」，要比事件接事件 1.5 秒的自動跳快
            fr = await pg.evaluate("""(()=>{ const h0=+(+GAME.G.hour).toFixed(3); const tb=document.querySelector('#phoneTabs button[data-ptab=today]'); if(tb) tb.click();
              const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; const b=bs.find(x=>/20:00/.test(x.textContent))||bs[bs.length-1]; const lab=b?b.textContent.trim():null; if(b) b.click(); return {pressAt:h0, label:lab, n:bs.length}; })()""")
            print('   [E08 FAST] 回完不關面板、馬上按：%s' % json.dumps(fr, ensure_ascii=False), flush=True)
            await pg.wait_for_timeout(2500)
            sk = await pg.evaluate("""(()=>{ const G=GAME.G; const tx=id=>{ const e=document.getElementById(id); return e?e.textContent.trim().slice(0,80):''; }; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'y0_e08'):null; return {h:+(+G.hour).toFixed(3), caption:tx('caption')||tx('cap'), q8:q?q.state:null, E08_GO:G.flags.E08_GO||null, choices:[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim().slice(0,30))}; })()""")
            print('   [9/21 跳過後] FAST → %s' % json.dumps(sk, ensure_ascii=False), flush=True)
            return ['e08:fast']
        try: await L.close_panels(pg, cdp)   # 回完把私訊那一串關掉（上一版回完第一次按跳過沒生效，疑似面板還開著）
        except Exception: pass
        if @AFTERWAIT@ > 0:   # BB-B 20:33：回「好」以後等幾秒（真實時間，遊戲時間照走）再跳；0＝馬上跳
            print('   [E08] 回完等 @AFTERWAIT@ 秒再跳（遊戲時間 %s）' % await pg.evaluate("+GAME.G.hour.toFixed(3)"), flush=True); await pg.wait_for_timeout(int(@AFTERWAIT@ * 1000))
        return ['e08:@ANSRAW@']
'''.replace('@HOOK@', repr(HOOK)).replace('@ANS@', repr(ANS)).replace('@E08@', E08).replace('@ANSRAW@', ANS).replace('@NONE@', 'True' if E08 == 'none' else 'False').replace('@AFTERWAIT@', str(float(os.environ.get('AFTERWAIT') or 0))).replace('@FAST@', 'True' if os.environ.get('FAST') == '1' else 'False')
assert PATCH1_OLD in src; src = src.replace(PATCH1_OLD, PATCH1_NEW, 1)
SKF_OLD = '    await L.tap(pg, cdp, \'#btnPhone\'); await pg.wait_for_timeout(900)\n    await pg.evaluate("(()=>{ const b=document.querySelector(\'#phoneTabs button[data-ptab=\\"today\\"]\'); if(b) b.click(); })()"); await pg.wait_for_timeout(700)\n    g = await pg.evaluate('
assert SKF_OLD in src, 'skip_time 開頭對不上'
SKF_NEW = """    pend = await pg.evaluate("(()=>{ try{ const G=GAME.G; if(G.flags.E08_GO) return null; return PHONE.pending(G).some(q=>q.ask&&PHONE.th(q)==='p:econ_weilun')?1:null; }catch(e){ return null; } })()")
    if pend:   # 11-09 PC：4154 停在 16:00、私訊在待回覆，但手機不會自己打開——按跳過時間之前先處理（照玩家：看到「舊序章同學傳訊息來」就打開手機）
        r = await close_or_answer(pg, cdp, None)
        if @NONE@:
            print('   [E08] 私訊在待回覆，不回（E08=none），照樣按跳過時間', flush=True)
        else:
            return 'e08:' + str(r)
"""
src = src.replace(SKF_OLD, SKF_NEW.replace('@NONE@', 'True' if E08 == 'none' else 'False') + SKF_OLD, 1)
# BB-B 19:43：9/21 每次按完跳過時間，記停在幾點、caption、OUT y0_e08 的 state、E08_GO（看回「好」以後有沒有停在 16:35 出發前）
LOGSK_OLD = "    lab = c and c[2]\n"
assert LOGSK_OLD in src
LOGSK_NEW = LOGSK_OLD + """    if c:
        try:
            await pg.wait_for_timeout(2500)
            sk = await pg.evaluate("(()=>{ const G=GAME.G; if(CALENDAR.dateOf(G.day).key!=='2024-09-21') return null; const tx=id=>{ const e=document.getElementById(id); return e?e.textContent.trim().slice(0,80):''; }; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'y0_e08'):null; return {h:+(+G.hour).toFixed(3), caption:tx('caption')||tx('cap'), toast:tx('toast'), q8:q?q.state:null, E08_GO:G.flags.E08_GO||null, zone:G.zone}; })()")
            if sk: print('   [9/21 跳過後] 按「%s」→ %s' % (c[2], json.dumps(sk, ensure_ascii=False)), flush=True)
        except Exception as e: print('   [9/21 跳過後] 記錄失敗 %r' % e, flush=True)
"""
src = src.replace(LOGSK_OLD, LOGSK_NEW, 1)
if os.environ.get('WAIT0921') == '1':   # BB-B 18:14：9/21 不要一次跳過 16:00 的舊序章同學私訊——只按目標時間 ≤ 16:00 的「跳過時間」，沒有就站著等
    SK_OLD = "    c = await pg.evaluate(\"(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')]; if(!bs.length) return null; const e=bs[bs.length-1];"
    assert SK_OLD in src
    SK_NEW = """    w0921 = await pg.evaluate("(()=>{ const G=GAME.G; return CALENDAR.dateOf(G.day).key==='2024-09-21'&&G.hour<16; })()")
    if w0921:
        c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#phoneBody [data-skip]')].filter(b=>{ const m=b.textContent.match(/(\\d{1,2}):(\\d{2})/); return m&&(+m[1]+m[2]/60)<=16; }); if(!bs.length) return null; const e=bs[bs.length-1]; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,20)]; })()")
        if not c:
            await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
            print('   [9/21 等 16:00] 沒有 ≤16:00 的跳過時間，站著等 20 秒（遊戲時間 %s）' % await pg.evaluate("+GAME.G.hour.toFixed(2)"), flush=True)
            await pg.wait_for_timeout(20000); return '9/21 站著等'
        print('   [9/21 等 16:00] 按「%s」（不按會跳過 16:00 的）' % c[2], flush=True)
        await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]
"""
    src = src.replace(SK_OLD, SK_NEW + SK_OLD, 1)
P3_OLD = '        await pg.evaluate("localStorage.clear()")\n'
assert P3_OLD in src; src = src.replace(P3_OLD, P3_OLD + '        await pg.evaluate(' + repr(HOOK) + ')\n', 1)   # 一開始就裝好（PHONE.at 包裝要在 9/21 之前）
PATCH2_OLD = "        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))\n"
PATCH2_NEW = '''        if not SEG_TO:
            LOG = await pg.evaluate("window.__LOG||[]")
            json.dump(LOG, open(os.path.join(OUT, 'lines.json'), 'w'), ensure_ascii=False, indent=0)
            d17 = [q for q in LOG if q['d'] == '2024-10-17']
            run.note('10/17 的台詞 %%d 句；E26 附近：' %% len(d17) + json.dumps([q['n'] + '：' + q['t'] for q in d17 if any(k in q['t'] for k in ('舊序章同學', '講話', '會計作業', '喜歡'))], ensure_ascii=False))
            a_yes = ['中秋系烤那天，妳一直跟他講話。', '他在問我會計作業。他問了一個晚上。']; a_no = ['妳那陣子一直跟他講話。', '他在問我會計作業。他每次都問。']
            txt = [q['t'] for q in d17]; has = lambda s: any(s in t for t in txt)
            e08done = await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_y0_e08)")
            missed = await pg.evaluate("(()=>{ try{ return PHONE.sent(GAME.G,'y0_e08_missed')?1:0; }catch(e){ return null; } })()")
            mdet = await pg.evaluate("(()=>{ try{ const G=GAME.G; const r=PHONE.rec(G); return {inMsgs:G.msgs.filter(m=>m.tag==='y0_e08_missed').map(m=>({th:m.th,text:m.text,day:m.day!=null?CALENDAR.dateOf(m.day).key:null,h:m.h})), inQueue:(r.q||[]).filter(q=>q.tag==='y0_e08_missed').length, cut:(r.cut||[]).includes('y0_e08_missed'), e08:(G.events&&G.events.done&&G.events.done.ev_y0_e08)||null}; }catch(e){ return String(e); } })()")
            run.note('y0_e08_missed 細節（G.msgs＝玩家手機上真的收到、queue＝排了還沒送、cut）：' + json.dumps(mdet, ensure_ascii=False))
            run.note('y0_e08_missed 第一次排進佇列：' + json.dumps(await pg.evaluate("window.__E08Q||null"), ensure_ascii=False))
            run.note('E08_GO=%%s、ev_y0_e08 演過=%%s、「你沒來」那則送過=%%s' %% (await pg.evaluate("GAME.G.flags.E08_GO||null"), e08done, missed))
            want, avoid = (a_yes, a_no) if %r == 'yes' else (a_no, a_yes)   # none（不回）＝沒去
            run.check('E26 車上：%%s 那兩句都出現' %% ('有去系烤' if %r == 'yes' else '沒去系烤'), all(has(s) for s in want), json.dumps(want, ensure_ascii=False))
            run.check('E26 車上：另一種的兩句都沒出現', not any(has(s) for s in avoid), json.dumps([s for s in avoid if has(s)], ensure_ascii=False))
            run.check('系烤：%%s' %% ('演過 ev_y0_e08、沒有「你沒來」' if %r == 'yes' else '沒演 ev_y0_e08、收到「你沒來」'), ((e08done and missed == 0) if %r == 'yes' else (not e08done and missed == 1)), json.dumps([e08done, missed]))
''' % (E08, E08, E08, E08) + PATCH2_OLD
assert PATCH2_OLD in src; src = src.replace(PATCH2_OLD, PATCH2_NEW, 1)
MS_OLD = "            miss_s = [k for k in want_s if k not in days]\n"
if MS_OLD in src:   # BB-B 21:49：停點檢查改看 ECONFF done／events.done（flow 的迴圈只記它醒著時看到的日期，整天在事件裡演完的會漏記；9/13 保齡球那次）
    src = src.replace(MS_OLD, """            done_keys = set(await pg.evaluate("(()=>{ const G=GAME.G, D=(ECONFF.rec(G).done||{}), E=(G.events&&G.events.done)||{}; return ECONFF.STEPS.filter(s=>D[s.n]===1||(s.ev&&E[s.ev])).map(s=>s.key); })()"))
            miss_s = [k for k in want_s if k not in days and k not in done_keys]
            run.note('  停點：迴圈看到的日期以外，靠 ECONFF done／events.done 算到的：' + json.dumps(sorted(k for k in want_s if k not in days and k in done_keys)))
""", 1)
sys.path.insert(0, T)
g = {'__name__': '__main__', '__file__': os.path.join(T, 'flow_v0_to1017.py')}
exec(compile(src, 'cc_e26_flow(flow_v0_to1017)', 'exec'), g)
