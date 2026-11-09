"""CC-B（帳號 B）11-09：經濟系短版 9/13 停點（b1＝ev_y0_e14 保齡球 19:00，AA_293 4-1）不見了（BB-B 21:37，P1）。判定＝BB。
照 tests/flow_v0_to1017.py（新遊戲真玩，SEG_TO=2024-09-14：過完 9/14 就停），只多一件：頁面裡每 150 ms 記一次——日期或時間跳超過 0.5 小時就記
「從幾點跳到幾點、那時開著什麼（手機／對話／選單）、ECONFF.rec(G).done 裡 b1 和 9/12～9/14 附近步驟的值、ECONFF.next(G) 是哪一步」；
另外記 flow 自己印的「跳過時間：」「睡覺」那幾行（run.log 原樣）。最後印 9/12 18:00～9/14 的跳躍清單。
用法：LW_TESTS=<wt>/tests python3 cc_econ913_flow.py <url> <out>"""
import os, sys
T = os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests')
OUTD = sys.argv[2] if len(sys.argv) > 2 else '.'
os.environ.setdefault('SEG_TO', '2024-09-14'); os.environ.setdefault('SEG_SAVE', os.path.join(OUTD, 'seg_0914.json'))
src = open(os.path.join(T, 'flow_v0_to1017.py'), encoding='utf-8').read()
WATCH = r"""(()=>{ if(window.__ccJW) return; window.__ccJW=1; window.__JL=[]; let ld=null, lh=null;
  setInterval(()=>{ try{ const G=GAME.G; if(!G||G.day==null) return; const t=G.day*24+(+G.hour||0);
    if(ld!=null && Math.abs(t-(ld*24+lh))>0.5){ let done=null, nx=null; try{ const r=ECONFF.rec(G).done||{}; done={}; for(const k of Object.keys(r)) if(/^(b1|1[0-3]|9|8)$/.test(k)) done[k]=r[k]; const n=ECONFF.next?ECONFF.next(G):null; nx=n?{n:n.s?n.s.n:n.n, key:n.s?n.s.key:n.key, ev:n.s?n.s.ev:n.ev}:null; }catch(e){ done=String(e); }
      const vis=id=>{ const e=document.getElementById(id); return !!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; };
      window.__JL.push({from:CALENDAR.dateOf(ld).key+' '+lh.toFixed(2), to:CALENDAR.dateOf(G.day).key+' '+(+G.hour).toFixed(2), phone:vis('phone'), dlg:vis('dlg'), choices:document.querySelectorAll('#choices button').length, short:ECONFF.short?ECONFF.short(G):null, done, next:nx, e14:!!(G.events&&G.events.done&&G.events.done.ev_y0_e14), q14:(()=>{ try{ const q=OUT.get(G,'y0_e14'); return q?{state:q.state,h:q.h,day:CALENDAR.dateOf(q.day).key}:null; }catch(e){ return null; } })(), pend:(()=>{ try{ return PHONE.pending(G).map(m=>PHONE.th(m)+'｜'+String(m.text||'').slice(0,24)); }catch(e){ return null; } })()}); }
    ld=G.day; lh=+G.hour||0; }catch(e){} }, 150); })()"""
P_OLD = '        await pg.evaluate("localStorage.clear()")\n'
assert P_OLD in src; src = src.replace(P_OLD, P_OLD + '        await pg.evaluate(%r)\n' % WATCH, 1)
F_OLD = "        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))\n"
assert F_OLD in src
src = src.replace(F_OLD, """        JL = await pg.evaluate("window.__JL||[]")
        json.dump(JL, open(os.path.join(OUT, 'jumps.json'), 'w'), ensure_ascii=False, indent=1)
        for q in JL:
            if q['to'][:10] >= '2024-09-12' and q['from'][:10] <= '2024-09-14': run.note('跳：' + json.dumps(q, ensure_ascii=False))
        try:
            st13 = await pg.evaluate("(()=>{ const G=GAME.G; const s=ECONFF.STEPS.find(x=>x.key==='2024-09-13'); return {step:s, done:(ECONFF.rec(G).done||{})[s&&s.n], cut:s?ECONFF.stepCut(G,s):null, e14:!!(G.events&&G.events.done&&G.events.done.ev_y0_e14), short:ECONFF.short(G)}; })()")
            run.note('9/13 那一步：' + json.dumps(st13, ensure_ascii=False))
        except Exception as e: run.note('9/13 那一步讀不到：%r' % e)
""" + F_OLD, 1)
sys.path.insert(0, T)
exec(compile(src, 'cc_econ913_flow(flow_v0_to1017)', 'exec'), {'__name__': '__main__', '__file__': os.path.join(T, 'flow_v0_to1017.py')})
