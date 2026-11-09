"""CC-B（帳號 B）11-09：BB-TEST-AA355-358-1021 第 3 條（AA_358 2-3）：可昕告白 E26（經濟系 10/17 車上）——中秋系烤去／沒去兩種。判定＝BB。
做法：照 tests/flow_v0_to1017.py（新遊戲 → 經濟系 → 一路玩到 10/17 晚上，真實玩家流程、不用 turbo）整支跑，只多三件：
  ① 9/21 16:00 韋綸私訊「烤肉你要去嗎？」：E08=yes 回「好」、E08=no 回「今天不行」（玩家在手機上點；原本的流程不回這種非必回的訊息）
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
ANS = '好' if E08 == 'yes' else '今天不行'
PATCH1_OLD = 'async def close_or_answer(pg, cdp, run):\n'
PATCH1_NEW = PATCH1_OLD + '''    try: await pg.evaluate(@HOOK@)
    except Exception: pass
    wl = await pg.evaluate("(()=>{ try{ const G=GAME.G; if(G.flags.E08_GO) return null; const m=PHONE.pending(G).find(q=>q.ask&&PHONE.th(q)==='p:econ_weilun'); if(!m) return null; GAME.openPhone('msg','p:econ_weilun'); return 1; }catch(e){ return null; } })()")
    if wl:
        await pg.wait_for_timeout(1200)
        c = await pg.evaluate("(a=>{ const b=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>x.textContent.trim()===a); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(@ANS@)")
        if c: await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); print('   [E08=@E08@] 韋綸「烤肉你要去嗎？」：回「%s」（E08_GO=%s）' % (c[2], await pg.evaluate("GAME.G.flags.E08_GO||null")), flush=True)
        else: print('   [E08] 韋綸的訊息開了但找不到「@ANSRAW@」', flush=True)
        return ['e08:' + ANS]
'''.replace('@HOOK@', repr(HOOK)).replace('@ANS@', repr(ANS)).replace('@E08@', E08).replace('@ANSRAW@', ANS)
assert PATCH1_OLD in src; src = src.replace(PATCH1_OLD, PATCH1_NEW, 1)
PATCH2_OLD = "        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))\n"
PATCH2_NEW = '''        if not SEG_TO:
            LOG = await pg.evaluate("window.__LOG||[]")
            json.dump(LOG, open(os.path.join(OUT, 'lines.json'), 'w'), ensure_ascii=False, indent=0)
            d17 = [q for q in LOG if q['d'] == '2024-10-17']
            run.note('10/17 的台詞 %%d 句；E26 附近：' %% len(d17) + json.dumps([q['n'] + '：' + q['t'] for q in d17 if any(k in q['t'] for k in ('唐睿', '講話', '會計作業', '喜歡'))], ensure_ascii=False))
            a_yes = ['中秋系烤那天，妳一直跟他講話。', '他在問我會計作業。他問了一個晚上。']; a_no = ['妳那陣子一直跟他講話。', '他在問我會計作業。他每次都問。']
            txt = [q['t'] for q in d17]; has = lambda s: any(s in t for t in txt)
            e08done = await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_y0_e08)")
            missed = await pg.evaluate("(()=>{ try{ return PHONE.sent(GAME.G,'y0_e08_missed')?1:0; }catch(e){ return null; } })()")
            run.note('E08_GO=%%s、ev_y0_e08 演過=%%s、「你沒來」那則送過=%%s' %% (await pg.evaluate("GAME.G.flags.E08_GO||null"), e08done, missed))
            want, avoid = (a_yes, a_no) if %r == 'yes' else (a_no, a_yes)
            run.check('E26 車上：%%s 那兩句都出現' %% ('有去系烤' if %r == 'yes' else '沒去系烤'), all(has(s) for s in want), json.dumps(want, ensure_ascii=False))
            run.check('E26 車上：另一種的兩句都沒出現', not any(has(s) for s in avoid), json.dumps([s for s in avoid if has(s)], ensure_ascii=False))
            run.check('系烤：%%s' %% ('演過 ev_y0_e08' if %r == 'yes' else '沒演 ev_y0_e08、收到「你沒來」'), (e08done if %r == 'yes' else (not e08done and missed == 1)), json.dumps([e08done, missed]))
''' % (E08, E08, E08, E08) + PATCH2_OLD
assert PATCH2_OLD in src; src = src.replace(PATCH2_OLD, PATCH2_NEW, 1)
sys.path.insert(0, T)
g = {'__name__': '__main__', '__file__': os.path.join(T, 'flow_v0_to1017.py')}
exec(compile(src, 'cc_e26_flow(flow_v0_to1017)', 'exec'), g)
