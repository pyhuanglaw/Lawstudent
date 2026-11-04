"""CC-C（帳號 C）11-04：D118_B7 國考總複習（BB-C 23:46；LAWWW-C a544cc690 D118-B7-1102）——照玩家操作走一遍。判定歸 BB；期望值照 BB-C 23:46 的派工＋D118_PLAN 第 4 節（暫定字照 STUDY.BAR_TEXT，AA 還沒定稿）。
  1 【前置／捷徑】讀檔 2029-07-10 09:00 總圖 B1：已經畢業（GRADUATED、grad 演過）、報了 2029 國考（BAR_REG）；成績單照 tests/d118_b7_unit.js 的 transcripts（每一學期的期末考照 CLS.drawExam 抽、答對 3／5，成績單照 CLS.reportFor）
     ＝和玩一遍四年一樣有成績單、有答錯過的題（STUDY 第一次讀到時從舊紀錄 backfill 成 miss）。
  2 玩家：走到 B1 的座位按「坐下」→ 選單「考前總複習」（看 hint：國考要考的 n 科、m 張觀念卡、要六個小時）→ 翻頁：每一科第一張看完就「跳到下一科」，最後一科「先讀到這裡」
     要對：6 小時（09:00 → 15:00）；每一科有答錯過的卡＝第一張就是「（之前答錯過）」那一張；結束字幕國考那一段最多 8 科、不能超出畫面（橫向拍一張）。
     隔天 7/11 09:00 直向再做一次（拍直向那一張結束字幕）。
  3 玩家：站起來（點地面走開），不動＝畢業後篇自己跳到下一件事（PG.advance）——一直到 8/4 08:00 一試（中途的劇情點掉、選項選第一個）。
     一試 20 題：前 13 題選對、後 7 題選錯（正確答案從遊戲的 PG.opts／題庫讀：這是「玩家選哪一個」，不是期望值）；記每題前面有沒有 cue（STUDY.CUE_PREFIX）。
     要對：題目＝總複習以前存下來的那 20 題（不重抽）、都來自修過的課（CLS.takenCourses；刑訴題庫 QBANK＝刑事訴訟法）；BAR_SCORE_2029＝13；
           交卷以後觀念卡逐題回寫：答對的那 13 題的卡＝got、答錯的 7 題的卡進 miss。
  4 再不動，跳到 9/7 放榜（r1_2029）：顯示的結果＝照 13 題的那一句（POSTGRAD_LINES.R1.sys[BAR_STAGE_2029]）。
  【前置／捷徑】讀檔指定日期地點、成績單用遊戲自己的函式發、手機自動打開關掉（STORY.phoneAuto）；8/4、9/7 等太久（雲端 SwiftShader）時改用同一份存檔跳到那天前 10 分鐘（標【捷徑】）。
  Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
用法：LW_TESTS=<wt>/tests [K=13] python3 cc_d118b7_play.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
K = int(os.environ.get('K') or 13)
R = L.Run('d118b7_play', OUT)
SETUP = r"""(()=>{ const G=GAME.G; G.flags.BAR_REG=true; G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) (G.events.done||(G.events.done={}))[e]=1;
  G.flags.examSeed=5150; const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
  const Rc=CLS.rec(G); Rc.exam=Rc.exam||{}; Rc.grades=Rc.grades||{}; let n=0;
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      Rc.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; n++; } Rc.grades[t]=CLS.reportFor(G,t); }
  delete G.study;   /* 讓 STUDY 第一次讀到的時候從這些舊紀錄 backfill（答錯過的進 miss）*/
  const tk=CLS.takenCourses(G).map(c=>c.id), pre=PG.draw(JSON.parse(JSON.stringify(G)),2029).map(q=>({id:q.id,course:q.course||null}));
  const info=STUDY.reviewInfo(G,'bar'); const mi=STUDY.rec(G).miss;
  return {exams:n, taken:tk, pre, info:info?{n:info.courses.length, cards:info.courses.reduce((a,x)=>a+x.units.length,0), courses:info.courses.map(x=>({id:x.c.id,name:x.c.name,missed:x.units.filter(u=>mi.includes(u.id)).map(u=>u.id).length}))}:null, miss:mi.length}; })()"""
SEATS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position; return (E.interactables||[]).filter(i=>i&&i.seat&&!i.hidden&&(i.study||i.deskStudy)).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,lv:i.lv|0,d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2)})).sort((a,b)=>a.d-b.d).slice(0,6); })()"""
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||'').trim()):[];
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone, busy:!!GAME.E.player.busy, seat:!!GAME.E.player.seat}; })()"""
CAP = r"""(()=>{ const c=document.getElementById('caption')||document.querySelector('.caption,#cap,#captionBox'); if(!c) return null; const cs=getComputedStyle(c); const r=c.getBoundingClientRect(); return {html:c.innerHTML.slice(0,2000), text:(c.innerText||'').slice(0,1500), show:cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&r.height>0, rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)], vw:innerWidth, vh:innerHeight, scrollH:c.scrollHeight, clientH:c.clientHeight}; })()"""
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({t:String(t), key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.caption; if(c0){ window.__ccCap=[]; GAME.caption=function(a,b){ try{ window.__ccCap.push(String(b!=null?b:a)); }catch(e){} return c0.apply(this,arguments); }; } window.__ccSayOn=true; return true; })()"""


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def says(pg, n=0):
    return [x['t'] for x in await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)]


async def sit_and_review(pg, cdp, tag, shot_name):
    """走到最近的讀書座位 → 坐下 → 考前總複習 → 每科第一張就跳到下一科、最後一科先讀到這裡；拍結束字幕"""
    seats = await pg.evaluate(SEATS)
    R.note('%s 附近的讀書座位：%s' % (tag, J(seats[:3])))
    if not seats: R.check('%s 找得到讀書座位' % tag, False, ''); return None
    s0 = seats[0]
    R.setup('%s 站到座位旁邊 0.6 m（%s, %s）' % (tag, s0['x'], s0['z']))
    await pg.evaluate("(([x,z,lv])=>{ const P=GAME.E.player; P.obj.position.x=x+0.6; P.obj.position.z=z; })", [s0['x'], s0['z'], s0['lv']])
    await pg.wait_for_timeout(1500)
    for _ in range(12):
        s = await L.state(pg)
        if (s.get('interact') or '').startswith(s0['label'] or '坐'): break
        await pg.wait_for_timeout(500)
    R.note('%s 互動鍵：%r' % (tag, s.get('interact')))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    hint = None
    for _ in range(20):
        u = await pg.evaluate(UI)
        if any(o.startswith('考前總複習') for o in u['opts']):
            hint = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>(x.innerText||'').trim().startsWith('考前總複習')); return b?(b.innerText||'').trim():null; })()"); break
        if u['dlg'] and not u['opts']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    R.note('%s 座位選單：%s' % (tag, J(u['opts'])))
    if not R.check('%s 座位選單有「考前總複習」（國考）' % tag, bool(hint), J(u['opts'])): return None
    R.note('%s 「考前總複習」那一項：%s' % (tag, hint.replace('\n', '／')))
    h0 = u['hour']; n0 = len(await says(pg))
    await pick(pg, cdp, "t=>t.startsWith('考前總複習')")
    firsts, caps, t0 = [], [], time.time()
    while time.time() - t0 < 900:
        u = await pg.evaluate(UI)
        if u['opts']:
            if any(o.startswith('跳到下一科') for o in u['opts']): await pick(pg, cdp, "t=>t.startsWith('跳到下一科')")
            elif any(o.startswith('先讀到這裡') for o in u['opts']): await pick(pg, cdp, "t=>t.startsWith('先讀到這裡')")
            else: await pick(pg, cdp, "t=>true")
            continue
        if u['dlg'] and u['text']:
            if u['text'].startswith('【'): firsts.append(u['text'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        c = await pg.evaluate(CAP)
        if c and c['show'] and '國考範圍' in (c['text'] or ''):
            await pg.wait_for_timeout(600); c = await pg.evaluate(CAP)
            await R.shot(pg, shot_name); caps.append(c); break
        if not u['dlg'] and not u['opts'] and time.time() - t0 > 30 and len(firsts) > 0:
            c = await pg.evaluate(CAP)
            if not (c and c['show']): break
        await pg.wait_for_timeout(300)
    u = await pg.evaluate(UI)
    L1 = await says(pg, n0)
    return {'h0': h0, 'h1': u['hour'], 'firsts': firsts, 'cap': caps[0] if caps else None, 'lines': L1, 'hint': hint}


async def drive_until(pg, cdp, tag, stop, max_s=900, exam=None):
    """畢業後篇：不動就跳下一件事。點對話、選項（作答＝exam(u)，其他選第一個），直到 stop(u)"""
    t0 = time.time(); last = None; jumps = 0
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if stop(u): return u, True
        if u['opts']:
            if exam and await exam(u): continue
            await pick(pg, cdp, "t=>true"); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        await L.close_panels(pg, cdp)
        if (u['key'], u['hour']) != last: last = (u['key'], u['hour']); jumps += 1
        await pg.wait_for_timeout(1200)
    return await pg.evaluate(UI), False


async def main():
    print('CC D118_B7（國考總複習，照玩家操作）：K=%d；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (K, os.environ.get('SHA', '?')), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        d = await pg.evaluate("STORY.dayOfKey('2029-07-10')")
        R.setup('讀檔：總圖 B1、2029-07-10（二）09:00；畢業了、報了 2029 國考；成績單照 transcripts（期末考答對 3／5）')
        await L.load_state(pg, {'zone': 'library_b1', 'hour': 9.0, 'day': d, 'weather': 'clear'}, quiet_phone=True)
        await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
        st = await pg.evaluate(SETUP)
        R.note('成績單 %s 科期末考、修過 %d 門：%s' % (st['exams'], len(st['taken']), J(st['taken'])))
        R.note('總複習以前一試會抽到的 20 題（同一份存檔的複本算的）：%s' % J(st['pre']))
        R.note('國考總複習範圍：%s 科、%s 張卡；答錯過的（miss）%s 張；每一科答錯過幾張 %s' % (st['info'] and st['info']['n'], st['info'] and st['info']['cards'], st['miss'], J(st['info'] and [[c['name'], c['missed']] for c in st['info']['courses']])))
        if not R.check('國考總複習開放（STUDY.reviewInfo bar）', bool(st['info']), J(st)): await b.close(); sys.exit(1)
        await pg.evaluate(SAYHOOK)
        # ---- 2 第一次：橫向 ----
        rv = await sit_and_review(pg, cdp, '[7/10 橫向]', 'review_caption_landscape')
        if rv:
            R.check('[7/10] 耗 6 小時（%.2f → %.2f）' % (rv['h0'], rv['h1']), abs(rv['h1'] - rv['h0'] - 6) < 0.05, J([rv['h0'], rv['h1']]))
            missed = {c['name']: c['missed'] for c in st['info']['courses']}
            bad = []
            for t in rv['firsts']:
                nm = t[1:t.index('　')] if '　' in t else t
                if missed.get(nm, 0) > 0 and '（之前答錯過）' not in t: bad.append(t[:60])
            R.note('[7/10] 每一科第一張：%s' % J(rv['firsts'][:30]))
            R.check('[7/10] 答錯過的卡排在前面：有答錯過的科，第一張就是「（之前答錯過）」那一張', bool(rv['firsts']) and not bad, J(bad[:5]))
            c = rv['cap']; R.note('[7/10] 結束字幕：%s' % J(c))
            n = len([x for x in (c['text'] if c else '').split('\n') if '國考範圍' in x])
            R.check('[7/10 橫向] 結束字幕國考那一段最多 8 科（%d 行）、不能超出畫面' % n, bool(c) and 0 < n <= 8 and c['rect'][1] >= 0 and c['rect'][3] <= c['vh'] and c['rect'][0] >= 0 and c['rect'][2] <= c['vw'] and c['scrollH'] <= c['clientH'] + 2, J(c and {'rect': c['rect'], 'vw': c['vw'], 'vh': c['vh'], 'scrollH': c['scrollH'], 'clientH': c['clientH']}))
        # ---- 第二次：直向（7/11 09:00）----
        snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
        R.setup('[7/11 直向] 同一份存檔跳到 7/11 09:00 總圖 B1（隔天再讀一次，拍直向的結束字幕）')
        await pg.set_viewport_size({'width': 390, 'height': 844}); await pg.wait_for_timeout(800)
        await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=G.day+1; G.hour=9; G.zone='library_b1'; delete G.pos; window.__ccSnap=G; })", snap)
        await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); })()"); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
        await pg.evaluate(SAYHOOK)
        rv2 = await sit_and_review(pg, cdp, '[7/11 直向]', 'review_caption_portrait')
        if rv2:
            c = rv2['cap']; R.note('[7/11] 結束字幕：%s' % J(c))
            n = len([x for x in (c['text'] if c else '').split('\n') if '國考範圍' in x])
            R.check('[7/11 直向] 結束字幕國考那一段最多 8 科（%d 行）、不能超出畫面' % n, bool(c) and 0 < n <= 8 and c['rect'][1] >= 0 and c['rect'][3] <= c['vh'] and c['rect'][0] >= 0 and c['rect'][2] <= c['vw'] and c['scrollH'] <= c['clientH'] + 2, J(c and {'rect': c['rect'], 'vw': c['vw'], 'vh': c['vh'], 'scrollH': c['scrollH'], 'clientH': c['clientH']}))
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
        # ---- 3 站起來、不動＝跳到 8/4 一試 ----
        await L.touch_tap(cdp, 600, 300); await pg.wait_for_timeout(2500)
        Q = {'i': 0, 'cue': [], 'picked': []}
        n_exam = len(await says(pg))

        async def exam(u):
            t = u['text'] or ''
            if '／20　' not in t: return False
            i = int(t.split('／')[0]) if t.split('／')[0].isdigit() else Q['i'] + 1
            right = await pg.evaluate("(i=>{ const G=GAME.G, ex=PG.rec(G).exam&&PG.rec(G).exam[2029]; if(!ex||!ex.qs) return null; const id=ex.qs[i-1]; const q=(EXAM_BANK.questions.find(x=>x.id===id)||QBANK.find(x=>x.id===id)); const o=PG.opts(q); return {right:o.findIndex(x=>String(x.v)===String(q.answer)), opts:o.map(x=>x.t)}; })", i)
            if not right: return False
            want = right['right'] if i <= K else (1 if right['right'] == 0 else 0)
            txt = right['opts'][want]
            okp = await pick(pg, cdp, "t=>t===%s" % J(txt))
            Q['i'] = i; Q['picked'].append([i, want, want == right['right']])
            return okp
        u, ok = await drive_until(pg, cdp, '[→ 8/4]', lambda u: u['key'] >= '2029-08-04' and (u['text'] or '').startswith('交卷'), max_s=1500, exam=exam)
        if not ok:
            R.note('[→ 8/4] 沒在時間內走到交卷（%s）→【捷徑】同一份存檔跳到 8/4 07:50' % J(u))
            snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
            await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=STORY.dayOfKey('2029-08-04'); G.hour=7.83; window.__ccSnap=G; })", snap)
            await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(5000); await pg.evaluate(SAYHOOK)
            u, ok = await drive_until(pg, cdp, '[8/4]', lambda u: (u['text'] or '').startswith('交卷'), max_s=900, exam=exam)
        R.check('[8/4] 一試作答到交卷', ok, J(u))
        ex = await pg.evaluate("(()=>{ const G=GAME.G, ex=PG.rec(G).exam&&PG.rec(G).exam[2029]; if(!ex) return null; const all=id=>(EXAM_BANK.questions.find(x=>x.id===id)||QBANK.find(x=>x.id===id)); const tk=CLS.takenCourses(G).map(c=>c.id);"
                               " const qs=ex.qs.map(all); const mi=STUDY.rec(G).miss; return {qs:ex.qs, ans:ex.ans, score:G.flags.BAR_SCORE_2029, sit:G.flags.BAR_SIT_2029, right:qs.map((q,i)=>ex.ans&&String(ex.ans[i])===String(q.answer)),"
                               " courses:qs.map(q=>q.course||'crimpro'), notTaken:qs.filter(q=>!tk.includes(q.course||'crimpro')).map(q=>q.id), st:qs.map(q=>STUDY.unitsOfQ(q.id).map(u=>[STUDY.stateOf(G,u.id), mi.includes(u.id)]))}; })()")
        L2 = await says(pg, n_exam)
        cueShown = []
        for i in range(1, 21):
            j = next((k for k, t in enumerate(L2) if t.startswith('%d／20　' % i)), -1)
            cueShown.append(bool(j > 0 and L2[j - 1].startswith('（你想起筆記上寫的：')))
        R.note('[8/4] 作答：%s；每題前面有沒有 cue：%s' % (J(Q['picked']), J(cueShown)))
        R.note('[8/4] 存檔：%s' % J(ex))
        if ex:
            R.check('[8/4] 題目＝總複習以前存下來的那 20 題（不重抽）', ex['qs'] == [x['id'] for x in st['pre']], J([ex['qs'][:5], [x['id'] for x in st['pre']][:5]]))
            R.check('[8/4] 20 題都來自修過的課（CLS.takenCourses；QBANK＝刑事訴訟法）', not ex['notTaken'], J(ex['notTaken']))
            R.check('[8/4] BAR_SCORE_2029＝答對題數 %d' % K, ex['score'] == K and sum(1 for x in ex['right'] if x) == K, J([ex['score'], sum(1 for x in ex['right'] if x)]))
            R.check('[8/4] 題目前面有 cue（讀過的卡；會洩題的不出）：%d／20 題有' % sum(cueShown), sum(cueShown) > 0, J(cueShown))
            badw = []
            for i, (rt, sts) in enumerate(zip(ex['right'], ex['st'])):
                if rt and not all(s == 'got' for s, m in sts): badw.append([i + 1, '答對', sts])
                if not rt and not all(m for s, m in sts): badw.append([i + 1, '答錯', sts])
            R.check('[8/4] 交卷以後觀念卡逐題回寫：答對的卡＝got、答錯的卡進 miss', not badw, J(badw[:5]))
        # ---- 4 9/7 放榜 ----
        n_r1 = len(await says(pg))
        t0 = time.time(); got = None
        while time.time() - t0 < 1500:
            fl = await pg.evaluate("(()=>({stage:GAME.G.flags.BAR_STAGE_2029||null, key:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(2), r1:!!(PG.rec(GAME.G).done||{}).r1_2029}))()")
            if fl['r1']: got = fl; break
            uu = await pg.evaluate(UI)
            if uu['opts']: await pick(pg, cdp, "t=>true"); continue
            if uu['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(1200)
        if not got:
            R.note('[→ 9/7] 沒在時間內走到放榜 → 【捷徑】同一份存檔跳到 9/7 14:50')
            snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
            await pg.evaluate("(s=>{ const G=JSON.parse(s); G.day=STORY.dayOfKey('2029-09-07'); G.hour=14.83; window.__ccSnap=G; })", snap)
            await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(5000); await pg.evaluate(SAYHOOK); n_r1 = 0
            t0 = time.time()
            while time.time() - t0 < 900:
                fl = await pg.evaluate("(()=>({stage:GAME.G.flags.BAR_STAGE_2029||null, key:CALENDAR.dateOf(GAME.G.day).key, h:+GAME.G.hour.toFixed(2), r1:!!(PG.rec(GAME.G).done||{}).r1_2029}))()")
                if fl['r1']: got = fl; break
                uu = await pg.evaluate(UI)
                if uu['opts']: await pick(pg, cdp, "t=>true"); continue
                if uu['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
                await pg.wait_for_timeout(1200)
        L3 = await says(pg, n_r1)
        R.check('[9/7] 放榜演了（r1_2029）', bool(got), J(got))
        if got:
            want = await pg.evaluate("(s=>{ const S=(POSTGRAD_LINES.R1||{}).sys||{}; return S[s]||null; })", got['stage'])
            R.note('[9/7] BAR_STAGE_2029＝%s；那一句 %s；演出來的台詞（前 6 句）%s' % (got['stage'], J(want), J(L3[:6])))
            R.check('[9/7] 結果和答對題數一致：顯示的是 %s 那一句（13 題）' % got['stage'], bool(want) and want in L3, J(L3[:6]))
        await R.shot(pg, 'after_r1')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
