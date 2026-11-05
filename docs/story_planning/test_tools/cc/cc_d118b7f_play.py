"""CC-C（帳號 C）11-05：D118_B7F（BB-C 01:32；SHA 301a74c2d）——司法官二試、研究所筆試的總複習，照玩家操作走一遍（cc_d118b7_play 那一套）。判定歸 BB。
  期望值：AA_692（企劃線 91874f326）、AA_690（c860ff820；司法官二試「照一試那幾句」）、BB_255 00:3x D118-B7-FOLLOW-1104、BB-C 01:32。Node 那一組：cc_d118b7f_node.js。
  CASES（預設 grad,judge）：
  grad  研究所 2029（寒假）：【前置／捷徑】讀檔 2029-01-04 10:00 宿舍 203（大四寒假；台灣路線、選研究所、推甄沒上；成績單到大四上照 transcripts）。
        玩家：手機 →「回家」（找不到按鈕才【捷徑】HOME.go）→ 家裡的選單（拍）→「快轉」→「到下一個有事的日子」→ 途中手機打開那一則（記幾點、哪一則、拍）→ 關掉 →
        回到家裡的選單（拍）。要對：20:00 停下來打開「【研究所】2/3 筆試。從今天起…一次讀過一遍，要四個小時。」；接著家裡的選單要開得了「考前總複習」（BB 判的條件，開不了＝FAIL）。
        有就按下去：4 小時、開始字幕「（你把公法的筆記攤開。研究所要考的 n 科…）」、結束字幕每科一行。
  judge 司法官二試 2029：【前置／捷徑】讀檔 2029-09-06 14:00 總圖 B1：畢業了、報了 2029 國考、一試考過（BAR_SIT_2029、答對 17＝司法官；exam_2029 演過、一試 20 題抽好）。
        玩家：不動＝畢業後篇自己跳到下一件事 → 9/7 放榜（演出來、選項選第一個）→ 開放那天 20:00 手機【國考】那一則（記、拍）→
        隔天 09:00 坐到 B1 的座位（【捷徑】同一份存檔跳到隔天 09:00：20:00 開始讀 6 小時太晚）→「考前總複習」（司法官二試要考的 n 科、6 小時；結束字幕最多 8 科＋「另外還翻了」）→
        站起來、不動 → 10/14 20:00 第二則 → 10/20 律師二試（帶過）→ 10/21 08:30 司法官二試作答（10 題：前 K 題選對、其他選錯）→ 交卷。
        要對：作答的 10 題＝總複習以前存下來的那 10 題（不重抽）、都是修過的課；JUDGE_SCORE2_2029＝K。
  【前置／捷徑】讀檔指定日期地點；成績單用遊戲自己的函式發；太久（雲端 SwiftShader）走不到的那一段改用同一份存檔跳到前 10 分鐘（標【捷徑】）。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [CASES=grad,judge] [K=7] python3 cc_d118b7f_play.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
K = int(os.environ.get('K') or 7)
CASES = [c for c in (os.environ.get('CASES') or 'grad,judge').split(',') if c]
R = L.Run('d118b7f_play', OUT)
# 期望的字（逐字，出處見上；Node 那一組第 0b 節核對過每一句都在原文裡）
G_ROPEN = '【研究所】2/3 筆試。從今天起，坐到書桌或讀書的位子，可以把公法的筆記一次讀過一遍，要四個小時。'   # AA_692 第 2 節（定稿改一個字）
G_OPEN = '（你把公法的筆記攤開。研究所要考的 {n} 科，一共 {m} 張觀念卡。）'   # AA_692 第 2 節 open 定稿
J_ROPEN = '【國考】10/20 司法官二試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。'   # AA_692 第 1 節（{M}/{D}＝二試第一天 10/20）
J_RWEEK = '【國考】10/20（六）司法官二試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。'
J_OPEN = '（你把四年的筆記攤開。司法官二試要考的 {n} 科，一共 {m} 張觀念卡。）'   # AA_690 open（照一試）＋AA_692 what

TRANS = r"""((terms)=>{ const G=GAME.G; const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
  const Rc=CLS.rec(G); Rc.exam=Rc.exam||{}; Rc.grades=Rc.grades||{}; let n=0;
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; if(terms&&!terms.includes(t)) continue; for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      Rc.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; n++; } Rc.grades[t]=CLS.reportFor(G,t); }
  delete G.study; return {exams:n, taken:CLS.takenCourses(G).map(c=>c.id)}; })"""
SETUP_GRAD = r"""(()=>{ const G=GAME.G, F=G.flags; Object.assign(F,{EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail',ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true}); F.examSeed=5151; return true; })()"""
SETUP_JUDGE = r"""(()=>{ const G=GAME.G, F=G.flags; F.BAR_REG=true; F.BAR_SIT_2029=true; F.BAR_SCORE_2029=17; F.GRADUATED=PG.gradDay(); F.GRAD_DONE=true; PG.rec(G).done.grad=1; PG.rec(G).done.exam_2029=1;
  Object.assign(F,{MOVED_OUT:STORY.dayOfKey('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:STORY.dayOfKey('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true}); F.examSeed=5152;
  for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) (G.events.done||(G.events.done={}))[e]=1; return true; })()"""
AFTER_TR_JUDGE = r"""(()=>{ const G=GAME.G; PG.draw(G,2029); const cp=JSON.parse(JSON.stringify(G)); cp.flags.BAR_STAGE_2029='both'; const pre=PG.drawJudge(cp,2029).map(q=>({id:q.id,course:PG.qCourse(q)}));
  return {pre, one:PG.rec(G).exam[2029].qs.length}; })()"""
SEATS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position; return (E.interactables||[]).filter(i=>i&&i.seat&&!i.hidden&&(i.study||i.deskStudy)).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),label:i.label,lv:i.lv|0,d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2)})).sort((a,b)=>a.d-b.d); })()"""
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||'').trim()):[];
  const ph=document.getElementById('phone'), phOpen=!!ph&&!ph.classList.contains('hide')&&ph.offsetParent!==null;
  const D=GAME.D||{}; return {dlg:!!D.active, text:t, opts, phone:phOpen, phoneText:phOpen?(ph.innerText||'').slice(-400):'', hour:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, key:CALENDAR.dateOf(GAME.G.day).key, zone:GAME.G.zone, busy:!!GAME.E.player.busy, seat:!!GAME.E.player.seat, home:!!(HOME.at&&HOME.at(GAME.G))}; })()"""
CAP = r"""(()=>{ const c=document.getElementById('caption')||document.querySelector('.caption,#cap,#captionBox'); if(!c) return null; const cs=getComputedStyle(c); const r=c.getBoundingClientRect(); return {html:c.innerHTML.slice(0,2000), text:(c.innerText||'').slice(0,2000), show:cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&r.height>0, rect:[r.left,r.top,r.right,r.bottom], vw:innerWidth, vh:innerHeight, scrollH:c.scrollHeight, clientH:c.clientHeight}; })()"""
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({t:String(t), key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2)}); }catch(e){} return s0.apply(this,arguments); };
  const p0=GAME.phoneThread; if(p0){ window.__ccPh=[]; GAME.phoneThread=function(th,o){ try{ const m=(GAME.G.msgs||[]).slice(-1)[0]; window.__ccPh.push({key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), th:th||null, last:m?m.text:null, skip:!!(o&&o.skip)}); }catch(e){} return p0.apply(this,arguments); }; }
  window.__ccSayOn=true; return true; })()"""
REMS = r"""(re=>(GAME.G.msgs||[]).filter(m=>new RegExp(re).test(m.tag||'')).map(m=>({tag:m.tag,text:m.text,key:CALENDAR.dateOf(m.day).key,h:m.h})))"""


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def says(pg, n=0):
    return [x['t'] for x in await pg.evaluate("(n=>(window.__ccSay||[]).slice(n))", n)]


async def close_phone(pg, cdp):
    for sel in ('#phone [data-skip]', '#phone .skip', '#btnPhoneClose'):
        if await pg.evaluate("(s=>{ const b=document.querySelector(s); return !!b&&b.offsetParent!==null; })", sel):
            await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200); return sel
    btn = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.offsetParent!==null&&/跳過|關閉|關掉/.test(x.innerText||'')); if(b){ b.setAttribute('data-ccph','1'); return (b.innerText||'').trim(); } return null; })()")
    if btn: await L.tap(pg, cdp, '[data-ccph="1"]'); await pg.wait_for_timeout(1200); return btn
    return None


async def review_flow(pg, cdp, tag, shot, kw):
    """選單已經有「考前總複習」：按下去 → 每科第一張就「跳到下一科」、最後一科「先讀到這裡」；拍結束字幕"""
    u = await pg.evaluate(UI); h0 = u['hour']; d0 = u['day']; n0 = len(await says(pg))
    await pick(pg, cdp, "t=>t.startsWith('考前總複習')")
    firsts, cap, t0 = [], None, time.time()
    while time.time() - t0 < 900:
        u = await pg.evaluate(UI)
        if u['opts']:
            if any(o.startswith('跳到下一科') for o in u['opts']): await pick(pg, cdp, "t=>t.startsWith('跳到下一科')")
            elif any(o.startswith('先讀到這裡') for o in u['opts']): await pick(pg, cdp, "t=>t.startsWith('先讀到這裡')")
            elif firsts or time.time() - t0 > 20: break
            else: await pick(pg, cdp, "t=>true")
            continue
        if u['dlg'] and u['text']:
            if u['text'].startswith('【'): firsts.append(u['text'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        c = await pg.evaluate(CAP)
        if c and c['show'] and kw in (c['text'] or ''):
            await pg.wait_for_timeout(600); cap = await pg.evaluate(CAP); await R.shot(pg, shot); break
        if not u['dlg'] and not u['opts'] and time.time() - t0 > 30 and firsts: break
        await pg.wait_for_timeout(300)
    u = await pg.evaluate(UI)
    return {'h0': h0, 'h1': u['hour'] + 24 * (u['day'] - d0), 'firsts': firsts, 'cap': cap, 'lines': await says(pg, n0)}


VISITS = []


async def drive_until(pg, cdp, stop, max_s=900, exam=None):
    t0 = time.time(); last = None; VISITS.clear()
    while time.time() - t0 < max_s:
        u = await pg.evaluate(UI)
        if stop(u): return u, True
        if u['phone']: await close_phone(pg, cdp); continue
        if u['opts']:
            if exam and await exam(u): continue
            await pick(pg, cdp, "t=>true"); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        await L.close_panels(pg, cdp)
        if (u['key'], u['hour']) != last: last = (u['key'], u['hour']); VISITS.append('%s %05.2f' % last)
        await pg.wait_for_timeout(1200)
    return await pg.evaluate(UI), False


async def jump(pg, key, h, zone=None):
    snap = await pg.evaluate("JSON.stringify(GAME.snapshot())")
    await pg.evaluate("(([s,k,h,z])=>{ const G=JSON.parse(s); G.day=STORY.dayOfKey(k); G.hour=h; if(z){ G.zone=z; delete G.pos; } window.__ccSnap=G; })", [snap, key, h, zone])
    await pg.evaluate("(async()=>{ await GAME.applySave(window.__ccSnap); })()"); await pg.wait_for_timeout(5000); await pg.evaluate(SAYHOOK)


async def case_grad(pg, cdp):
    d = await pg.evaluate("STORY.dayOfKey('2029-01-04')")
    R.setup('[grad] 讀檔：宿舍 203、2029-01-04（四）10:00（大四寒假）；台灣路線、選研究所、推甄沒上；成績單到大四上（transcripts）')
    await L.load_state(pg, {'zone': 'dorm', 'hour': 10.0, 'day': d, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
    await pg.evaluate(SETUP_GRAD); tr = await pg.evaluate(TRANS, ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1'])
    inf = await pg.evaluate("(()=>{ const i=STUDY.reviewInfo(GAME.G,'grad'); return i?{n:i.courses.length,m:i.courses.reduce((a,x)=>a+x.units.length,0),what:i.what}:null; })()")
    lb = await pg.evaluate("(()=>{ const b=HOME.lawBreak(GAME.G); return b?b.key:null; })()")
    R.note('[grad] 成績單 %d 科期末考、修過 %d 門；研究所總複習 %s；HOME.lawBreak %s' % (tr['exams'], len(tr['taken']), J(inf), J(lb)))
    if not R.check('[grad] 前置：研究所總複習開著（STUDY.reviewInfo grad）', bool(inf), J(inf)): return
    await pg.evaluate(SAYHOOK)
    # 手機 →「回家」
    went = False
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    for tab in await pg.evaluate("[...document.querySelectorAll('#phoneTabs button')].map(b=>b.dataset.ptab)"):
        await pg.evaluate("(t=>{ const b=document.querySelector('#phoneTabs [data-ptab=\"'+t+'\"]'); if(b) b.click(); })", tab); await pg.wait_for_timeout(600)
        hb = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone [data-gohome], #phone button')].find(x=>x.offsetParent!==null&&((x.dataset&&x.dataset.gohome!=null)||(x.innerText||'').trim()==='回家')); if(b){ b.setAttribute('data-cchome','1'); return true; } return false; })()")
        if hb:
            R.note('[grad] 手機「%s」那一頁有「回家」' % tab)
            await L.tap(pg, cdp, '[data-cchome="1"]'); went = True; break
    if not went:
        await L.close_panels(pg, cdp)
        R.setup('[grad] 手機裡找不到「回家」按鈕 →【捷徑】void HOME.go(GAME)（遊戲自己的回家那一條）')
        await pg.evaluate("void HOME.go(GAME)")
    await pg.wait_for_timeout(5000)
    menus, phones = [], []
    t0 = time.time(); ff_done = False; first_menu = None; after_menus = []
    while time.time() - t0 < 1200:
        u = await pg.evaluate(UI)
        if u['phone']:
            ph = await pg.evaluate("(window.__ccPh||[]).slice(-1)[0]||null")
            phones.append({'key': u['key'], 'hour': u['hour'], 'ph': ph, 'text': u['phoneText'][-200:]})
            await R.shot(pg, 'grad_phone_%d' % len(phones))
            sel = await close_phone(pg, cdp); R.note('[grad] 手機 %s %.2f 打開（%s）→ 關掉（%s）' % (u['key'], u['hour'], J(ph), sel)); continue
        if u['opts']:
            if any(o.startswith('睡覺') for o in u['opts']):   # 家裡的選單
                menus.append({'key': u['key'], 'hour': u['hour'], 'opts': u['opts']})
                await R.shot(pg, 'grad_home_menu_%d' % len(menus))
                if first_menu is None: first_menu = menus[-1]
                elif ff_done: after_menus.append(menus[-1])
                if ff_done and after_menus: break
                if not ff_done: ff_done = await pick(pg, cdp, "t=>t.startsWith('快轉')"); continue
            if any(o.startswith('到下一個有事的日子') for o in u['opts']): await pick(pg, cdp, "t=>t.startsWith('到下一個有事的日子')"); continue
            await pick(pg, cdp, "t=>true"); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        await pg.wait_for_timeout(800)
    rem = await pg.evaluate(REMS, '^grad_remind_')
    R.note('[grad] 家裡的選單：%s' % J(menus)); R.note('[grad] 手機打開：%s' % J(phones)); R.note('[grad] 研究所提醒：%s' % J(rem))
    R.check('[grad] 回到家：住家裡的選單出來了（有「睡覺」「快轉」）', bool(first_menu) and any(o.startswith('快轉') for o in first_menu['opts']), J(first_menu))
    o = [m for m in rem if m['tag'] == 'grad_remind_open_2029']
    R.check('[grad] 1/4 20:00 那一則逐字「%s」' % G_ROPEN, len(o) == 1 and o[0]['key'] == '2029-01-04' and abs(o[0]['h'] - 20) < 0.01 and o[0]['text'] == G_ROPEN, J(o))
    p1 = next((p for p in phones if p['ph'] and (p['ph'].get('last') or '').startswith('【研究所】')), None)
    R.check('[grad] 在家快轉途中停下來、手機打開那一則', bool(p1) and p1['key'] == '2029-01-04', J(p1))
    R.check('[grad] 停下來的時刻＝1/4 20:00（BB-C 01:32）', bool(p1) and p1['key'] == '2029-01-04' and abs(p1['hour'] - 20) < 0.05, J(p1 and [p1['key'], p1['hour']]))
    R.check('[grad] 1/4（開放那天）家裡的選單有「考前總複習」', bool(first_menu) and any(x.startswith('考前總複習') for x in first_menu['opts']), J(first_menu))
    am = after_menus[0] if after_menus else None
    ok = R.check('[grad] 手機關掉以後回到家裡的選單（%s）開得了「考前總複習」（BB 判的條件）' % (am and '%s %.2f' % (am['key'], am['hour'])), bool(am) and any(x.startswith('考前總複習') for x in am['opts']), J(am))
    if ok:
        rv = await review_flow(pg, cdp, '[grad]', 'grad_review_caption', '研究所範圍')
        n = inf['n']; first = next((t for t in rv['lines'] if '筆記攤開' in t), '')
        R.check('[grad] 4 小時（%.2f → %.2f）' % (rv['h0'], rv['h1']), abs(rv['h1'] - rv['h0'] - 4) < 0.05, J([rv['h0'], rv['h1']]))
        R.check('[grad] 開始字幕逐字「%s」' % G_OPEN.format(n=n, m=inf['m']), first == G_OPEN.format(n=n, m=inf['m']), J(first))
        c = rv['cap']; lines = [x for x in (c['text'] if c else '').split('\n') if '研究所範圍' in x]
        R.check('[grad] 結束字幕每一科一行（%d 行）、不超出畫面' % n, len(lines) == n and c['rect'][3] <= c['vh'] and c['rect'][1] >= 0, J(c and {'text': c['text'], 'rect': c['rect']}))


async def case_judge(pg, cdp):
    d = await pg.evaluate("STORY.dayOfKey('2029-09-06')")
    R.setup('[judge] 讀檔：總圖 B1、2029-09-06（四）14:00；畢業了、報了 2029 國考、一試答對 17（司法官）、一試 20 題抽好；成績單（transcripts）')
    await L.load_state(pg, {'zone': 'library_b1', 'hour': 14.0, 'day': d, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
    await pg.evaluate(SETUP_JUDGE); tr = await pg.evaluate(TRANS, None); st = await pg.evaluate(AFTER_TR_JUDGE)
    R.note('[judge] 修過 %d 門；總複習以前二試會抽到的 10 題（同一份存檔的複本算的）：%s' % (len(tr['taken']), J(st['pre'])))
    await pg.evaluate(SAYHOOK)
    # 9/7 放榜 → 開放那天 20:00 的提醒
    u, ok = await drive_until(pg, cdp, lambda u: u['key'] >= '2029-09-20' and u['hour'] >= 20 and u['key'] <= '2029-09-22', max_s=1500)
    stage = await pg.evaluate("GAME.G.flags.BAR_STAGE_2029||null")
    rem = await pg.evaluate(REMS, '^judge_remind_')
    R.note('[judge] 9/6 → 開放那天：跳過的時間 %s；BAR_STAGE_2029＝%s；提醒 %s' % (J(VISITS[-12:]), stage, J(rem)))
    if not ok: R.note('[judge] 沒在時間內走到 9/20～9/22 20:00（%s）' % J(u))
    R.check('[judge] 9/7 放榜演了、到司法官（BAR_STAGE_2029 both）', stage == 'both', J(stage))
    o = [m for m in rem if m['tag'] == 'judge_remind_open_2029']
    if o: await R.shot(pg, 'judge_open_day')
    R.check('[judge] 開放那天 20:00 一則，逐字「%s」（AA_692）' % J_ROPEN, len(o) == 1 and abs(o[0]['h'] - 20) < 0.01 and o[0]['text'] == J_ROPEN, J(o))
    R.check('[judge] 跳到下一件事停在那一則的 20:00', bool(o) and any(v.startswith(o[0]['key'] + ' 20.0') for v in VISITS), J([v for v in VISITS if '20.0' in v]))
    # 隔天 09:00 坐到 B1
    nd = await pg.evaluate("(()=>{ const n=PG.judgeNext(GAME.G); return n?CALENDAR.dateOf(n.open+1).key:null; })()")
    R.setup('[judge] 【捷徑】同一份存檔跳到開放隔天 %s 09:00 總圖 B1（開放那天 20:00 開始讀 6 小時太晚）' % nd)
    await jump(pg, nd or '2029-09-22', 9.0, 'library_b1')
    seats = await pg.evaluate(SEATS)
    if not R.check('[judge] B1 找得到讀書座位', bool(seats), ''): return
    s0 = seats[0]; R.setup('[judge] 站到座位旁邊 0.6 m（%s, %s）' % (s0['x'], s0['z']))
    await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.x=x+0.6; P.obj.position.z=z; })", [s0['x'], s0['z']]); await pg.wait_for_timeout(1500)
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
    hint = None
    for _ in range(20):
        u = await pg.evaluate(UI)
        if any(x.startswith('考前總複習') for x in u['opts']):
            hint = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>(x.innerText||'').trim().startsWith('考前總複習')); return b?(b.innerText||'').trim():null; })()"); break
        if u['dlg'] and not u['opts']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    await R.shot(pg, 'judge_seat_menu')
    R.note('[judge] 座位選單：%s；那一項：%s' % (J(u['opts']), J(hint)))
    if not R.check('[judge] 座位選單有「考前總複習」，提示「司法官二試要考的 … 要六個小時…」', bool(hint) and '司法官二試要考的' in hint and '要六個小時' in hint, J(hint)): return
    inf = await pg.evaluate("(()=>{ const i=STUDY.reviewInfo(GAME.G,'judge'); return i?{n:i.courses.length,m:i.courses.reduce((a,x)=>a+x.units.length,0)}:null; })()")
    rv = await review_flow(pg, cdp, '[judge]', 'judge_review_caption', '二試範圍')
    first = next((t for t in rv['lines'] if '筆記攤開' in t), '')
    R.check('[judge] 6 小時（%.2f → %.2f）' % (rv['h0'], rv['h1']), abs(rv['h1'] - rv['h0'] - 6) < 0.05, J([rv['h0'], rv['h1']]))
    R.check('[judge] 開始字幕逐字「%s」' % J_OPEN.format(n=inf['n'], m=inf['m']), first == J_OPEN.format(n=inf['n'], m=inf['m']), J(first))
    c = rv['cap']; tx = (c['text'] if c else '').split('\n'); body = [x for x in tx if '二試範圍' in x]; extra = [x for x in tx if x.startswith('（另外還翻了')]
    seen = len(set(t[1:t.index('　')] for t in rv['firsts'] if '　' in t))
    R.check('[judge] 結束字幕最多 8 科（%d 行）；翻到 %d 科＞8＝最後一行「（另外還翻了 %d 科。）」；不超出畫面' % (len(body), seen, max(0, seen - 8)), bool(c) and 0 < len(body) <= 8 and ((seen <= 8 and not extra) or (seen > 8 and extra == ['（另外還翻了 %d 科。）' % (seen - 8)])) and c['rect'][3] <= c['vh'] and c['rect'][1] >= 0, J(c and {'text': c['text'], 'rect': c['rect']}))
    # 站起來、不動 → 10/21 作答
    await L.touch_tap(cdp, 600, 300); await pg.wait_for_timeout(2500)
    n_exam = len(await says(pg)); Q = {'picked': []}

    async def exam(u):
        t = u['text'] or ''
        if '／10　' not in t: return False
        i = int(t.split('／')[0]) if t.split('／')[0].isdigit() else len(Q['picked']) + 1
        right = await pg.evaluate("(i=>{ const G=GAME.G, J=PG.rec(G).judge&&PG.rec(G).judge[2029]; if(!J||!J.qs) return null; const id=J.qs[i-1]; const q=(EXAM_BANK.questions.find(x=>x.id===id)||QBANK.find(x=>x.id===id)); const o=PG.opts(q); return {right:o.findIndex(x=>String(x.v)===String(q.answer)), opts:o.map(x=>x.t)}; })", i)
        if not right: return False
        want = right['right'] if i <= K else (1 if right['right'] == 0 else 0)
        okp = await pick(pg, cdp, "t=>t===%s" % J(right['opts'][want])); Q['picked'].append([i, want == right['right']]); return okp
    u, ok = await drive_until(pg, cdp, lambda u: u['key'] >= '2029-10-21' and (u['text'] or '').startswith('交卷'), max_s=1800, exam=exam)
    short = not ok
    if not ok:
        R.note('[→ 10/21] 沒在時間內走到交卷（%s）→【捷徑】同一份存檔跳到 10/21 08:20' % J(u))
        await jump(pg, '2029-10-21', 8.33)
        u, ok = await drive_until(pg, cdp, lambda u: (u['text'] or '').startswith('交卷'), max_s=900, exam=exam)
    R.check('[judge] 10/21 司法官二試作答到交卷', ok, J(u))
    rem = await pg.evaluate(REMS, '^judge_remind_')
    w = [m for m in rem if m['tag'] == 'judge_remind_week_2029']
    if short: R.note('[judge] 這一輪 → 10/21 用了【捷徑】：10/14 那一則、停點沒有照玩家測到（Node cc_d118b7f_node.js M3、M4）')
    else: R.check('[judge] 10/14 20:00 第二則逐字「%s」' % J_RWEEK, len(w) == 1 and w[0]['key'] == '2029-10-14' and abs(w[0]['h'] - 20) < 0.01 and w[0]['text'] == J_RWEEK, J(w))
    ex = await pg.evaluate("(()=>{ const G=GAME.G, Jd=PG.rec(G).judge&&PG.rec(G).judge[2029]; if(!Jd) return null; const tk=CLS.takenCourses(G).map(c=>c.id); const qs=Jd.qs.map(id=>EXAM_BANK.questions.find(x=>x.id===id)||QBANK.find(x=>x.id===id));"
                           " return {qs:Jd.qs, ans:Jd.ans||null, score:G.flags.JUDGE_SCORE2_2029, right:qs.map((q,i)=>!!Jd.ans&&String(Jd.ans[i])===String(q.answer)), notTaken:qs.filter(q=>!tk.includes(PG.qCourse(q))).map(q=>q.id)}; })()")
    R.note('[judge] 作答 %s；存檔 %s' % (J(Q['picked']), J(ex)))
    if ex:
        R.check('[judge] 作答的 10 題＝總複習以前存下來的那 10 題（不重抽）', ex['qs'] == [x['id'] for x in st['pre']], J([ex['qs'], [x['id'] for x in st['pre']]]))
        R.check('[judge] 10 題都是修過的課', not ex['notTaken'], J(ex['notTaken']))
        R.check('[judge] JUDGE_SCORE2_2029＝答對題數 %d' % K, ex['score'] == K and sum(1 for x in ex['right'] if x) == K, J([ex['score'], sum(1 for x in ex['right'] if x)]))
    await R.shot(pg, 'judge_after_exam')


async def main():
    print('CC D118_B7F（司法官二試、研究所總複習，照玩家操作）：CASES=%s K=%d；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (CASES, K, os.environ.get('SHA', '?')), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261105))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for c in CASES:
            try: await {'grad': case_grad, 'judge': case_judge}[c](pg, cdp)
            except Exception as e: R.check('[%s] 探針沒有例外' % c, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
