"""CC（帳號 A）11-02：BUG-LEGALPAGE-RETAKE-ROW-1102「法律」頁截圖探針（開發分支 888d14c38；修改前基準 781bd3039）。
Node 證據：tests/legal_page_retake_unit.js（修改前 FAIL 1、3）、docs/story_planning/test_tools/cc/m6_studied_xy.js。
讀碼看到的規則（888d14c38）：
  法律頁＝右上 ☰ 選單的「法律」頁籤（#menu .tabs button[data-tab="legal"] → #legalList；手機 📱 裡沒有法律頁——任務寫「手機法律頁」，照這個選單頁做，要實跑確認）。
  game3d.js renderLegal：CLS.legalCourses(G)（R.done 的出席照「課號＋學期」一學期一列；重修那學期用 CLS.termCourses 的重修那一門＝名字「○○（重修）」）
    ＋STUDY.courses(G)（這學期考五題的課；之前的學期有紀錄的課；刑訴題庫只有那學期修過（enrolled）才建列）；have 照「課號|學期」去重；
    分「這學期」「之前的學期」兩段（<div class="item muted"><b>這學期</b></div>）；每一列 <b>課名</b>＋<div class="muted">學期名（大一下…）[・重修][・上過 n 週]</div>。
  重修排法：CLS.planRetakes(G,'Y1S2')（成績單那一刻）→ G.courses.retake {id,from:'Y1S2',base:'Y1S2',term:'Y2S1',slots,alt}。
不是 iPhone：Playwright 手機模擬（橫向開，截圖直向＋橫向）。URL 用 '<URL>/index.html?turbo'。

CASES（逗號隔開，每個 case 開新的瀏覽器；預設 retake,crim_qb）：
  retake   【前置】大二上第一週星期五 18:00 宿舍的存檔（RT_DAY 可以改 [學期,週,星期]）：
             大一上、大一下考五題的法律課各上了第 1～3 週（R.done，讓「之前的學期」有別的列）；
             大一下的一門法律課（RT_COURSE，預設第一門考五題、名字有「法」的課）第 1～7、10～15 週都上了、期末 status done 答對 0 題、成績 0 分（不及格）；
             重修照遊戲的 CLS.planRetakes 在一份暫時的存檔物件上排（只取那一門的那一筆；排不出來才照原本時段手組，標明）；
             RT_ATTEND=1（預設）：大二上第一週重修那一門、到今天為止的那幾堂已經上了（R.done）。
           → ☰ 選單 →「法律」：直向截圖（最上面、重修那一列、原學期那一列、往下捲 LEGAL_PAGES 頁）＋橫向一張（重修那一列）。
           check：「這學期」有重修那一列（名字有「（重修）」或學期那一行有「・重修」、學期那一行是「大二上」）；「之前的學期」有原本那一門（不含（重修）、大一下）；
                  「之前的學期」沒有重修那一列；同一門課（去掉（重修））剛好兩列。
           修改前（781bd3039）預期 FAIL：「這學期」沒有重修那一列（原本照課號一列、留在大一下，這學期那一筆被 have 擋掉）。
  crim_qb  【前置】大一上 2025-10-20（一）18:00 宿舍、只在讀書會碰過刑訴題庫（G.legal.q[QBANK 第一題]={state:'learned'…}，照 legal3d.js 的紀錄格式）、
             大一上考五題的法律課第 1～6 週有上 → 法律頁：課程列裡沒有「刑事訴訟法」；別的區塊提到刑訴（題庫概況）只記。
           修改前預期 FAIL（會建出「刑事訴訟法・大三上」那一列）。
記錄：<輸出>/transcript_<case>.json（法律頁每一列：段落、課名、學期那一行、全文前 400 字；存檔前置內容；截圖路徑）。
不確定、要實跑確認：
  1. 「手機法律頁」＝選單的「法律」頁籤（index.html 只有這一個 #tab-legal）。
  2. #legalList 的捲動容器（找 #legalList 往上第一個 overflow-y auto／scroll、內容比框高的元素；找不到就用 scrollIntoView）。
  3. 大二上第一週星期五可能是假日或有開學劇情（quiet_events 讀檔，關條件事件；STORY 的主線不關）。
  4. 課名比對：重修那一門的名字＝原本課名＋「（重修）」（classes3d.js rtCourse）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=retake,crim_qb] python3 cc_legalpage_probe.py '<URL>/index.html?turbo' <輸出資料夾>
其他環境變數：RT_COURSE（課號）、RT_DAY（JSON，例 '["Y2S1",1,5]'）、RT_ATTEND（1）、LEGAL_PAGES（4）。"""
import os, sys, json, asyncio, traceback, re
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'retake,crim_qb').split(',') if c.strip()]
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')


async def state_at(pg, key, h, zone, flags=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}, 'retake': []}
    return st, d


# 【前置】出席：terms 裡考五題、名字像法律的課，第 weeks 週每一個時段記 R.done（key＝day:課號:block，同 classes3d.js dayItems）
ATTEND = r"""(([st,terms,weeks,until])=>{ const g=JSON.parse(JSON.stringify(st)); const R=CLS.rec(g), out={};
  for(const T of terms) for(const c of CLS.termCourses(g,T)){ if(!CLS.isExamCourse(c)||!/法|憲|刑|民|債|訴訟|行政/.test(c.name)||c.redo) continue;
    for(const w of weeks) for(const s of c.slots||[]){ const d=STORY.termDay(T,w,s.wd); if(d==null||(until!=null&&d>until)) continue; R.done[d+':'+c.id+':'+s.block]=1; out[c.id]=(out[c.id]||0)+1; } }
  st.courses=g.courses; return {st,att:out}; })"""
# 【前置】大一下那一門被當＋照遊戲的 CLS.planRetakes 排重修（暫時的存檔物件；只取那一門）
RETAKE = r"""(([st,want,attY2])=>{ const g=JSON.parse(JSON.stringify(st)); const R=CLS.rec(g);
  const L1=CLS.termCourses(g,'Y1S2').filter(c=>CLS.isExamCourse(c)&&!c.redo); const c=want?L1.find(x=>x.id===want):L1.find(x=>/法/.test(x.name));
  if(!c) return {err:'大一下找不到考五題的法律課',list:L1.map(x=>x.id+' '+x.name)};
  const W=[1,2,3,4,5,6,7,10,11,12,13,14,15]; let n=0; for(const w of W) for(const s of c.slots||[]){ const d=STORY.termDay('Y1S2',w,s.wd); if(d!=null){ R.done[d+':'+c.id+':'+s.block]=1; n++; } }
  R.exam=R.exam||{}; R.exam['Y1S2:'+c.id+':final']={qs:[],ans:[],status:'done',correct:0,score:0};
  R.grades=R.grades||{}; R.grades.Y1S2=Object.assign({},R.grades.Y1S2||{}); R.grades.Y1S2[c.id]='0 分（不及格）';
  /* 其他大一下考五題的課：期末都過（不然 planRetakes 會一起排）*/
  for(const x of L1){ if(x.id===c.id) continue; R.exam['Y1S2:'+x.id+':final']={qs:[],ans:[],status:'done',correct:3,score:60}; R.grades.Y1S2[x.id]='60 分'; }
  let rec=null, how='CLS.planRetakes'; try{ const tmp=JSON.parse(JSON.stringify(g)); tmp.courses.retake=[]; const made=CLS.planRetakes(tmp,'Y1S2'); rec=(made||[]).find(r=>r.id===c.id)||null; }catch(e){ how='planRetakes 例外 '+e.message; }
  if(!rec){ rec={id:c.id,from:'Y1S2',base:'Y1S2',term:'Y2S1',slots:(c.slots||[]).map(s=>({wd:s.wd,block:s.block})),alt:false}; how+='（沒排出來：照原本時段手組）'; }
  R.retake=[rec];
  let n2=0; if(attY2){ for(const s of rec.slots){ const d=STORY.termDay(rec.term,1,s.wd); if(d!=null&&d<=g.day){ R.done[d+':'+c.id+':'+s.block]=1; n2++; } } }
  st.courses=g.courses; return {st,cid:c.id,name:c.name,rec,how,y1s2Done:n,y2Done:n2}; })"""
LEGAL_ROWS = r"""(()=>{ const box=document.getElementById('legalList'); if(!box) return null; const out=[]; let sec=null; let i=-1;
  for(const d of box.children){ i++; const b=d.querySelector('b'), bt=b?(b.textContent||'').trim():'', txt=(d.innerText||d.textContent||'').trim();
    if(d.classList.contains('muted')&&/^(這學期|之前的學期)$/.test(bt)&&txt===bt){ sec=bt; out.push({i,head:true,sec}); continue; }
    const m=d.querySelector(':scope > div.muted'); out.push({i,sec,name:bt,term:m?(m.textContent||'').trim():null,text:txt.slice(0,400)}); }
  return out; })()"""
SCROLLER = r"""(()=>{ let e=document.getElementById('legalList'); while(e&&e!==document.body){ const s=getComputedStyle(e); if(/(auto|scroll)/.test(s.overflowY)&&e.scrollHeight>e.clientHeight+4) break; e=e.parentElement; }
  if(!e||e===document.body) return null; if(!e.id) e.id='__ccLegalScroll'; return {id:e.id,sh:e.scrollHeight,ch:e.clientHeight,st:e.scrollTop}; })()"""


async def open_legal(pg, cdp):
    if await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="legal"]'); await pg.wait_for_timeout(1500)
    return await pg.evaluate(LEGAL_ROWS)


async def scroll_row(pg, i):
    await pg.evaluate("i=>{ const e=document.getElementById('legalList').children[i]; if(e) e.scrollIntoView({block:'center'}); }", i); await pg.wait_for_timeout(700)


async def shots_legal(pg, run, tag, focus):
    """直向：最上面、focus 每一列、往下捲 LEGAL_PAGES 頁；橫向：focus 第一列"""
    S = {}
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    sc = await pg.evaluate(SCROLLER); run.note('%s：捲動容器 %s' % (tag, J(sc)))
    if sc: await pg.evaluate("id=>{ document.getElementById(id).scrollTop=0; }", sc['id'])
    await pg.wait_for_timeout(600); S['port_top'] = await run.shot(pg, tag + '_port_top')
    for nm, i in focus:
        await scroll_row(pg, i); S['port_' + nm] = await run.shot(pg, '%s_port_%s' % (tag, nm))
    if sc:
        await pg.evaluate("id=>{ document.getElementById(id).scrollTop=0; }", sc['id'])
        for k in range(ENVI('LEGAL_PAGES', 4)):
            at = await pg.evaluate("id=>{ const e=document.getElementById(id); const t0=e.scrollTop; e.scrollTop=t0+e.clientHeight*0.85; return [t0,e.scrollTop,e.scrollHeight]; }", sc['id'])
            if at[1] <= at[0]: break
            await pg.wait_for_timeout(600); S['port_page%d' % (k + 1)] = await run.shot(pg, '%s_port_page%d' % (tag, k + 1))
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    if focus: await scroll_row(pg, focus[0][1])
    S['land'] = await run.shot(pg, tag + '_land')
    return S


def dump(tag, **kw):
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


async def case_retake(pg, cdp, run):
    tag = 'retake'
    spec = json.loads(os.environ.get('RT_DAY', '["Y2S1",1,5]'))
    d = await P.day_of(pg, spec)
    st, _ = await state_at(pg, d['key'], 18.0, 'dorm')
    a = await pg.evaluate(ATTEND, [st, ['Y1S1', 'Y1S2'], [1, 2, 3], None]); st = a['st']
    r = await pg.evaluate(RETAKE, [st, os.environ.get('RT_COURSE') or None, ENVI('RT_ATTEND', 1) == 1])
    if r.get('err'):
        run.check('%s：前置成立' % tag, False, J(r)); return
    st = r['st']
    run.setup('[前置] %s：%s（%s 第 %s 週，假日 %s）18:00 宿舍；大一上／大一下法律課第 1～3 週出席 %s；大一下「%s」（%s）上了 %d 堂、期末答對 0 題、0 分（不及格）；'
              '重修 %s（%s）；大二上第一週重修已上 %d 堂；quiet_events' % (tag, d['key'], d['term'], d['week'], d['hol'], J(a['att']), r['name'], r['cid'], r['y1s2Done'], J(r['rec']), r['how'], r['y2Done']))
    await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    chk = await pg.evaluate("cid=>({term:(CALENDAR.termOf(GAME.G.day)||{}).id,week:(CALENDAR.termOf(GAME.G.day)||{}).week,retake:GAME.G.courses.retake,cur:CLS.termCourses(GAME.G,'Y2S1').filter(c=>c.id===cid).map(c=>c.name),lc:CLS.legalCourses(GAME.G).map(e=>[e.c.name,e.term,e.current])})", r['cid'])
    run.note('%s：讀檔後 %s' % (tag, J(chk)))
    rows = await open_legal(pg, cdp)
    run.note('%s：法律頁 %s' % (tag, J([[x.get('sec'), x.get('name'), x.get('term')] for x in rows or []])))
    base = r['name']; crs = [x for x in rows or [] if not x.get('head')]
    same = [x for x in crs if (x['name'] or '').replace('（重修）', '') == base]
    rt = [x for x in same if x['sec'] == '這學期' and ('（重修）' in (x['name'] or '') or '重修' in (x['term'] or '')) and '大二上' in (x['term'] or '')]
    orig = [x for x in same if x['sec'] == '之前的學期' and '（重修）' not in (x['name'] or '') and (x['term'] or '').startswith('大一下')]
    rt_prev = [x for x in same if x['sec'] == '之前的學期' and ('（重修）' in (x['name'] or '') or '大二上' in (x['term'] or ''))]
    focus = ([('retake', rt[0]['i'])] if rt else []) + ([('orig', orig[0]['i'])] if orig else [])
    S = await shots_legal(pg, run, tag, focus)
    run.check('%s：「這學期」有重修那一列（「%s（重修）」或「・重修」，學期大二上）（修改前預期 FAIL）' % (tag, base), bool(rt), J(same))
    run.check('%s：「之前的學期」有原本那一列（%s・大一下，沒有（重修））' % (tag, base), bool(orig), J(same))
    run.check('%s：「之前的學期」沒有重修那一列' % tag, not rt_prev, J(rt_prev))
    run.check('%s：同一門課剛好兩列（大一下一列、大二上一列）' % tag, len(same) == 2, J(same))
    run.note('%s：重修那一列全文 %s；原本那一列全文 %s' % (tag, J(rt[0]['text'] if rt else None), J(orig[0]['text'] if orig else None)))
    dump(tag, prep={k: r[k] for k in ('cid', 'name', 'rec', 'how', 'y1s2Done', 'y2Done')}, att=a['att'], day=d, after_load=chk, rows=rows, shots=S)


async def case_crim_qb(pg, cdp, run):
    tag = 'crim_qb'
    st, d = await state_at(pg, '2025-10-20', 18.0, 'dorm')
    a = await pg.evaluate(ATTEND, [st, ['Y1S1'], [1, 2, 3, 4, 5, 6], d['d']]); st = a['st']
    q0 = await pg.evaluate("(()=>{ const q=(typeof QBANK!=='undefined'?QBANK:[])[0]; return q?{id:q.id,section:q.section||null}:null; })()")
    if not q0:
        run.check('%s：前置成立（有 QBANK）' % tag, False); return
    st['legal'] = {'q': {q0['id']: {'state': 'learned', 'seen': 2, 'ok': 2, 'bad': 0, 'last': d['d'] - 1, 'ctx': ['studygroup', 'studygroup']}}, 'misc': {}, 'log': []}
    run.setup('[前置] %s：%s（%s 第 %s 週）18:00 宿舍；大一上法律課第 1～6 週出席 %s；只在讀書會碰過刑訴題庫：G.legal.q[%s]={state:learned}；quiet_events'
              % (tag, d['key'], d['term'], d['week'], J(a['att']), q0['id']))
    await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    await pg.wait_for_timeout(6000); await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
    chk = await pg.evaluate("(()=>({term:(CALENDAR.termOf(GAME.G.day)||{}).id,legal:GAME.G.legal&&GAME.G.legal.q?Object.keys(GAME.G.legal.q).filter(k=>GAME.G.legal.q[k].state!=='unseen'):null,"
                            "study:(typeof STUDY!=='undefined'?STUDY.courses(GAME.G).map(e=>[e.c.id,e.c.name,e.term,e.current]):null),crimTerm:(CLS.byId('crimpro')||{}).term}))()")
    run.note('%s：讀檔後 %s' % (tag, J(chk)))
    rows = await open_legal(pg, cdp)
    run.note('%s：法律頁 %s' % (tag, J([[x.get('sec'), x.get('name'), x.get('term')] for x in rows or []])))
    crs = [x for x in rows or [] if not x.get('head') and x.get('term') is not None]
    # 課程列＝第二行是學期（「大三上」「大一上・上過 6 週」）；題庫概況「刑事訴訟法（讀書會、課堂遇到的題目）」底下的主題列（第二行是「聽過 · 學到…」）不是課程列（雲端 b1b 11-02 誤判）
    crim = [x for x in crs if (x['name'] or '').startswith('刑事訴訟法') and re.match(r'^大[一二三四五][上下]', x.get('term') or '')]
    other = [x for x in rows or [] if not x.get('head') and x not in crim and '刑事訴訟' in (x.get('text') or '')]
    S = await shots_legal(pg, run, tag, [('crim', crim[0]['i'])] if crim else [])
    run.check('%s：前置成立（法律頁有別的課程列，不是空的）' % tag, bool(crs), J(rows))
    run.check('%s：課程列沒有「刑事訴訟法」（修改前預期 FAIL：「刑事訴訟法・大三上」）' % tag, not crim, J(crim))
    run.note('%s：別的區塊提到「刑事訴訟」（題庫概況等，只記）%s' % (tag, J(other)))
    dump(tag, att=a['att'], q=q0, day=d, after_load=chk, rows=rows, shots=S)


CASEFN = {'retake': case_retake, 'crim_qb': case_crim_qb}


async def main():
    run = L.Run('legalpage_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for cs in CASES:
            fn = CASEFN.get(cs)
            if not fn: run.check('CASE %s 認得' % cs, False, '可以用：' + ','.join(CASEFN)); continue
            print('==== CASE %s（SHA %s）====' % (cs, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % cs, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % cs, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, cs + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % cs, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
