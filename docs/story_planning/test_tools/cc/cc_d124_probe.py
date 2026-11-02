"""CC（帳號 A）11-02：BB_246 第一節 #3（D124：大四下「海商法與海洋法」改選修、律師一試不考海商法）的瀏覽器探針（P1_d124）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps），URL 用 '<URL>/index.html?turbo'。Node 對照：n19_maritime_elective.js。
BB_229 第 7 條：一律先讀遊戲狀態（CLS.rec(G).electives／termCourses／examDay／examList／dayItems／rec.exam／rec.grades、CLS.curExam、G.flags、PG.*、FD.*），
畫面文字只用來驗「玩家看得到」；選單比對一律 startswith。

CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設 take,skip,bar_pool）：
  take  【前置】最小存檔（cc_y4s2final_probe 的 state_at）改到 2029-02-18（日）21:00 宿舍（大四下開學前一晚）、Y4_PATH bar；
        R.grades.Y4S1 先填好（大四上每一門「90 分」）＝起床不發大四上成績單、不排重修（不測那一段）。
        照玩家：床「睡到明天」→ 2/19 起床 → 選課結果（CLS.selectTerm）：記下「海商法與海洋法要修嗎？」那一組的選項（startswith「海商法與海洋法」、「這學期不修」）→ 按「海商法與海洋法」。
        讀狀態：electives.y4s2_mar、termCourses、examDay(maritime,Y4S2,final)、examList、手機「課表」考試欄（直向＋橫向截圖）。
        【捷徑】讀檔到期末考前一晚（examDay 那一天的前一天 21:00；courses 整個照剛才遊戲裡的）＋BAR_REG true（5/10 Y4_PATH bar 會自動報名）
        → 床「睡到明天」→ 手機「今天」（直向＋橫向）→「直接去上課」→ 考卷：用 CLS.curExam 認（cid／kind／term／qid；這一版以前沒有 curExam＝退回用題目原文在
        CLS.examPool 找，記下來）→ 每一題【捷徑】讀正解、故意按錯（EXAM_RIGHT，預設 0）。
        【捷徑】讀檔到 2029-06-17 21:00 宿舍（畢業典禮、收拾房間已過的旗標；courses 照考完的）→ 站著不動（畢業後篇＝跳到下一件事）→ 6/18 09:00 成績單
        （成績單那一句直向＋橫向截圖）→ 再站 POST_S 秒（預設 120）。check：成績單「海商法與海洋法：…不及格」、FAIL_DELAY 沒有、FAIL_DELAY_COURSES 不含 maritime、
        FD_MAKEUP 沒有 pending、BAR_REG 仍 true、PG.delayed false、沒有延畢／補考的句子。
  skip  同 take 的前置；選課按「這學期不修…」→ termCourses 沒有 maritime、examDay null、examList 沒有、整學期每天 dayItems 都沒有（讀碼掃 CALENDAR.termDays）、
        手機「課表」沒有海商法；【捷徑】期末考那天（take 那一天：用課表定義算，5/30）手機「今天」沒有海商法；
        【捷徑】6/17 → 6/18 成績單沒有「海商法與海洋法：」那一行、沒有延畢（FAIL_DELAY 沒有、FD.on false）＝畢業照常（GRADUATED 是前置設好的，典禮本身不在這個 case 裡走）。
  bar_pool 只讀：律師一試的考卷＝postgrad3d.js examDay → PG.draw(G,年) → PG.pool()（包住 PG.pool 確認 draw 真的叫它）；
        窮舉 PG.pool() 有沒有海商法題（id ^Y4MAR_ 或 course maritime）；BB CC_34：PG.pool() 裡 course 是 maritime／ip_law／labor_social／tax_law 的題數各一行，都要 0；PG.pool(true)（舊存檔已抽好的題）有幾題；EXAM_BANK 裡海商法題總數（>0 才有意義）；
        假存檔 examSeed 0..SEEDS-1（預設 200）× 2029～2033 PG.draw 抽出來的題目都沒有海商法；司法官二試 PG.judgePool() 有沒有海商法題（AA_583，只記錄）。
修改前對照：b1b249873（11-02 讀碼：D124 的 choice、FD.counts、PG.POOL_EXCLUDE 在 b1b 已經有；b1b 沒有的是 CLS.curExam＝48918ca20，和 CLS.enrolled 防呆 71ce570f4）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=take,skip,bar_pool] [EXAM_RIGHT=0] python3 cc_d124_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：SEL_MAX（選課，預設 600）、TRIP_MAX（考試那一趟，預設 600）、GR_MAX（6/17 → 成績單，預設 900）、STUCK_S（預設 240）。"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_y4s2final_probe as Y   # 共用：state_at、HOOK、Driver、bed、today、week、trip、shoot_both、rows、pl_len（只 import，不跑它的 main）
L, P = Y.L, Y.P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = Y.J
ENVI = Y.ENVI
CASES = [c.strip() for c in os.environ.get('CASES', 'take,skip,bar_pool').split(',') if c.strip()]
EXAM_RIGHT = ENVI('EXAM_RIGHT', 0)
MAR = 'maritime'; MAR_NAME = '海商法與海洋法'; GROUP = 'y4s2_mar'
SEL_EVE = '2029-02-18'; GRADE_DAY = '2029-06-18'
Q_RE = re.compile(r'^([1-5])／5　(.*)$', re.S)
FD_RE = re.compile(r'延畢|證書要等|補考|重修，出席不到')

ST = r"""(()=>{ const G=GAME.G, F=G.flags||{}, R=CLS.rec(G); const tc=CLS.termCourses(G,'Y4S2'); const c=tc.find(x=>x.id==='maritime');
  let ed=null; try{ const d=c?CLS.examDay(G,c,'Y4S2','final'):null; ed=d?{key:CALENDAR.dateOf(d.day).key,day:d.day,block:d.block}:null; }catch(e){ ed='ERR '+e.message; }
  let el=null; try{ el=CLS.examList(G,'Y4S2').map(e=>[e.c.id,e.kind,CALENDAR.dateOf(e.day).key,e.block]); }catch(e){ el='ERR '+e.message; }
  let pgOn=null, delayed=null, fdOn=null; try{ pgOn=PG.on(G); delayed=PG.delayed(G); }catch(e){} try{ fdOn=FD.on(G); }catch(e){}
  let failed=null; try{ failed=CLS.failedIn(G,'Y4S2').map(x=>x.id); }catch(e){ failed='ERR '+e.message; }
  const pick={}; for(const k of ['BAR_REG','Y4_PATH','FAIL_DELAY','FAIL_DELAY_COURSES','FAIL_DELAY_V','FD_MAKEUP','FD_RESCUE_ELECTIVE','GRADUATED']) if(k in F) pick[k]=F[k];
  const t=CALENDAR.termOf(G.day);
  return {clock:{key:CALENDAR.dateOf(G.day).key,day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,term:t&&t.id,week:t&&t.week},electives:R.electives||{},sel:!!(R.note&&R.note.sel_Y4S2),
    termCourses:tc.map(x=>x.id),examDay:ed,examList:el,exam:R.exam&&R.exam['Y4S2:maritime:final']||null,grades:(R.grades||{}).Y4S2||null,flags:pick,pgOn,delayed,fdOn,failed,
    curExamHook:('curExam' in CLS),curExam:CLS.curExam||null,nmsg:(G.msgs||[]).length,
    groups:(CLS.choiceGroups?CLS.choiceGroups('Y4S2'):[]).map(g=>({group:g.group,def:g.def,none:g.none,opts:g.opts.map(o=>o.id)}))}; })()"""
# 整學期每天（讀碼）：哪幾天 dayItems 有海商法
SCAN = r"""(()=>{ const G=GAME.G, r=CALENDAR.termDays('Y4S2'), out=[]; for(let d=r.from;d<=r.to;d++){ try{ if((CLS.dayItems(G,d)||[]).some(it=>it.c&&it.c.id==='maritime')) out.push(CALENDAR.dateOf(d).key); }catch(e){ out.push('ERR '+e.message); break; } } return out; })()"""
# 大四上每一門（只讀；給前置填成績單用）
Y4S1C = "(d=>{ try{ return CLS.termCourses({flags:{},day:d,stage:'law'},'Y4S1').map(c=>c.id); }catch(e){ return ['ERR '+e.message]; } })"
# 課表定義上的海商法期末考日（skip 用：沒選的人 examDay 是 null；用「選了」的假存檔算同一天，只讀）
DEFDAY = "(d=>{ try{ const g={flags:{},day:d,stage:'law',courses:{electives:{y4s2_mar:'maritime'}}}; const c=CLS.byId('maritime'); const x=CLS.examDay(g,c,'Y4S2','final'); return x?CALENDAR.dateOf(x.day).key:null; }catch(e){ return 'ERR '+e.message; } })"
# 考卷：curExam 那一題的正解（只讀）；沒有 curExam（舊版）＝用題目原文
ANS = r"""(([qtext])=>{ try{ const ce=CLS.curExam||null; let cid='maritime', term='Y4S2', kind='final'; if(ce){ cid=ce.cid; term=ce.term; kind=ce.kind; }
  const p=CLS.examPool(cid,term,kind), all=p.cls.concat(p.bank,p.ai); const q=ce&&ce.qid?all.find(x=>x.id===ce.qid):all.find(x=>String(x.q)===qtext); if(!q) return {err:'題庫找不到這一題',ce,n:all.length};
  const opts=q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));
  return {ce,by:ce?'curExam':'text',id:q.id,sameText:String(q.q)===qtext,right:opts.findIndex(o=>String(o.v)===String(q.answer)),opts:opts.map(o=>o.t)}; }catch(e){ return {err:String(e.message)}; } })"""
POOL = r"""(([seeds])=>{ const isMar=q=>!!q&&(/^Y4MAR_/.test(String(q.id))||q.course==='maritime'); const out={};
  out.bankMar=(typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions:[]).filter(isMar).map(q=>[q.id,q.status,q.course]);
  out.exclude=(PG.POOL_EXCLUDE||[]).map(String);
  const pool=PG.pool(); out.poolN=pool.length; out.poolMar=pool.filter(isMar).map(q=>q.id);
  try{ const all=PG.pool(true); out.poolAllN=all.length; out.poolAllMar=all.filter(isMar).map(q=>q.id); }catch(e){ out.poolAll='ERR '+e.message; }
  let calls=0; const p0=PG.pool; PG.pool=function(){ calls++; return p0.apply(this,arguments); };
  const hit={}; let n=0, err=null;
  try{ for(let s=0;s<seeds;s++) for(let y=2029;y<=2033;y++){ const g={flags:{examSeed:s},day:0,stage:'law'}; const qs=PG.draw(g,y); n+=qs.length; for(const q of qs) if(isMar(q)) hit[q.id]=(hit[q.id]||0)+1; } }catch(e){ err=String(e.message); } finally { PG.pool=p0; }
  out.draw={seeds,years:[2029,2033],questions:n,poolCalls:calls,mar:hit,err};
  try{ const jp=PG.judgePool?PG.judgePool():null; out.judgeN=jp?jp.length:null; out.judgeMar=jp?jp.filter(isMar).map(q=>q.id):null; }catch(e){ out.judge='ERR '+e.message; }
  out.drawUsesPool=/S\.pool\(\)/.test(String(PG.draw));
  out.byCourse={}; for(const c of ['maritime','ip_law','labor_social','tax_law']) out.byCourse[c]=pool.filter(q=>q.course===c).map(q=>q.id);   /* BB CC_34：用 course 判斷（不看 id 寫法）*/
  out.bankCourses=[...new Set((typeof EXAM_BANK!=='undefined'?EXAM_BANK.questions:[]).map(q=>q.course))];
  return out; })"""


class D(Y.Driver):
    """考卷用 CLS.curExam 認（BB_229 第 7 條）；其他照 cc_y4s2final 的 Driver"""
    def __init__(self, *a):
        super().__init__(*a); self.exam = []

    async def handle(self, s, picks=()):
        pg, cdp, run = self.pg, self.cdp, self.run
        if s['ch']:
            ce = await pg.evaluate("(typeof CLS!=='undefined'&&CLS.curExam)?Object.assign({},CLS.curExam):null")
            R = await Y.rows(pg, max(self.n0, (await Y.pl_len(pg)) - 12))
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = Q_RE.match(lastsay['t']) if lastsay else None
            if ce or m:
                T = [o['t'] for o in s['ch']]
                key = '%s|%s' % ((ce or {}).get('qid'), (m.group(2)[:30] if m else ''))
                if key in self.answered: await pg.wait_for_timeout(600); return True
                a = await pg.evaluate(ANS, [m.group(2) if m else ''])
                i = (ce or {}).get('i') or (int(m.group(1)) if m else 0)
                if a.get('err') or a['right'] < 0 or a['right'] >= len(T):
                    run.check('%s：第 %s 題讀得到正解（【捷徑】只讀）' % (self.tag, i), False, J(a)); self.answered[key] = None
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); return True
                if [t.strip() for t in T] != [t.strip() for t in a['opts']]:
                    run.check('%s：第 %s 題畫面的選項和題庫一樣' % (self.tag, i), False, J({'screen': T, 'opts': a['opts']}))
                want = a['right'] if len([v for v in self.answered.values() if v and v['correct']]) < EXAM_RIGHT else (1 if a['right'] == 0 else 0)
                rec = {'i': i, 'ce': ce, 'by': a['by'], 'id': a['id'], 'right': a['right'], 'picked': want, 'correct': want == a['right'], 'd': lastsay and lastsay.get('d')}
                self.answered[key] = rec; self.exam.append(rec)
                if len(self.exam) == 1: self.shots['exam_q1'] = await run.shot(pg, self.tag + '_exam_q1')
                run.note('%s：考卷第 %s 題（%s，%s %s）【捷徑】讀正解第 %d 個 → 按第 %d 個' % (self.tag, i, a['by'], J(ce), a['id'], a['right'] + 1, want + 1))
                await P.tap_choice(pg, cdp, want); await pg.wait_for_timeout(900); return True
        return await super().handle(s, picks)


async def wait_free(pg, drv, max_s=120, picks=()):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if await drv.handle(s, picks): continue
        if not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']: return True
        await pg.wait_for_timeout(800)
    return False


async def select_term(pg, cdp, run, tag, pick):
    """2/18 21:00 讀檔 → 睡到明天 → 選課。pick＝'take'｜'skip'。回傳 (選項, 按了哪個, 截圖)"""
    d = (await P.day_of(pg, SEL_EVE))['d']
    s1 = await pg.evaluate(Y4S1C, d)
    st, dd = await Y.state_at(pg, SEL_EVE, 21.0, 'dorm', {'Y4_PATH': 'bar'})
    st['courses'] = {'grades': {'Y4S1': {c: '90 分' for c in s1}}}
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(Y.CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s：最小存檔改到 %s 21:00 宿舍（法律系、台灣路線、Y4_PATH bar；R.grades.Y4S1 先填好 %s＝不發大四上成績單、不排重修）' % (tag, dd['key'], J(s1)))
    s0 = await pg.evaluate(ST)
    run.note('%s：讀檔後 %s' % (tag, J(s0)))
    run.check('%s：前置成立（%s、還沒選大四下的課、choiceGroups(Y4S2) 有 %s）' % (tag, s0['clock']['key'], GROUP),
              s0['clock']['key'] == SEL_EVE and not s0['sel'] and any(g['group'] == GROUP for g in s0['groups']), J({'clock': s0['clock'], 'groups': s0['groups'], 'sel': s0['sel']}))
    n0 = await Y.pl_len(pg); drv = D(pg, cdp, run, tag, n0)
    await Y.bed(pg, cdp, run, ('睡到明天', '睡一下（'), '%s %s 21:00' % (tag, SEL_EVE))
    opts = None; picked = None; shots = []; t0 = time.time(); asked = None
    while time.time() - t0 < ENVI('SEL_MAX', 600):
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if any(t.startswith(MAR_NAME) or t.startswith('這學期不修') for t in T):
                R = await Y.rows(pg, n0); asked = next((x['t'] for x in reversed(R) if x['k'] == 'say'), None)
                opts = T; shots = await Y.shoot_both(pg, run, tag + '_select')
                k = next((i for i, t in enumerate(T) if (t.startswith(MAR_NAME) if pick == 'take' else t.startswith('這學期不修'))), None)
                picked = T[k] if k is not None else None
                run.note('%s：選課「%s」選項 %s → 按「%s」' % (tag, asked, J(T), picked))
                await P.tap_choice(pg, cdp, k if k is not None else 0); await pg.wait_for_timeout(1200)
                await wait_free(pg, drv, 120); break
        g = await pg.evaluate(ST)
        if g['sel'] and opts is None and not s['dlg'] and not s['ch']:
            run.note('%s：選課已經跑過（R.note.sel_Y4S2），沒有看到海商法那一組的選項' % tag); break
        if await drv.handle(s): continue
        await pg.wait_for_timeout(900)
    sel_lines = [x['t'] for x in await Y.rows(pg, n0, 'say') if '選課' in x['t'] or '課表' in x['t'] or MAR_NAME in x['t']]
    return {'opts': opts, 'picked': picked, 'asked': asked, 'shots': shots, 'lines': sel_lines, 'drv': drv}


async def after_select(pg, cdp, run, tag, sel):
    await wait_free(pg, sel['drv'], 60)
    g = await pg.evaluate(ST); scan = await pg.evaluate(SCAN)
    wk = await Y.week(pg, cdp, run, tag + '_after_select')
    run.note('%s：選課以後 %s；整學期有海商法的日子 %d 天（前三天 %s）' % (tag, J(g), len(scan), J(scan[:3])))
    return g, scan, wk


async def eve_load(pg, cdp, run, tag, key, extra_flags=None):
    """【捷徑】讀檔到 key 的 21:00 宿舍；courses 照現在遊戲裡的（electives、exam）"""
    courses = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G.courses||{}))")
    fl = {'Y4_PATH': 'bar', 'BAR_REG': True}; fl.update(extra_flags or {})
    st, dd = await Y.state_at(pg, key, 21.0, 'dorm', fl)
    st['courses'] = courses
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(Y.CLEARP); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置／捷徑] %s：讀檔到 %s 21:00 宿舍（courses 照剛才遊戲裡的：electives %s；flags %s）' % (tag, dd['key'], J(courses.get('electives')), J(fl)))
    return dd


async def exam_day(pg, cdp, run, tag, eday):
    """期末考前一晚 → 睡到明天 → 手機「今天」→ 有海商法就「直接去上課」考完"""
    await eve_load(pg, cdp, run, tag, (await pg.evaluate("k=>CALENDAR.dateOf(STORY.dayOfKey(k)-1).key", eday)))
    n0 = await Y.pl_len(pg); drv = D(pg, cdp, run, tag, n0)
    await Y.bed(pg, cdp, run, ('睡到明天', '睡一下（'), '%s 考試前一晚' % tag)
    t0 = time.time()
    while time.time() - t0 < 240:   # 起床、起床選單「先起床」、劇情點過
        s = await P.ts(pg); c = await P.clock(pg)
        if await drv.handle(s): continue
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if c['key'] == eday and free and time.time() - t0 > 20: break
        await pg.wait_for_timeout(900)
    td = await Y.today(pg, cdp, run, drv, '%s_%s' % (tag, eday.replace('-', '')), both=True)
    gl = [x for x in await pg.evaluate(Y.GOLIST) if x['cid'] == MAR]
    trip = None
    if gl: trip = await Y.trip(pg, cdp, run, drv, '%s_%s_maritime' % (tag, eday.replace('-', '')), gl[0]['key'])
    g = await pg.evaluate(ST)
    return {'today': td, 'go': gl, 'trip': trip, 'g': g, 'drv': drv}


async def grades_part(pg, cdp, run, tag):
    """【捷徑】6/17 21:00 宿舍（畢業典禮等已過）→ 站著不動 → 6/18 成績單 → 再站 POST_S 秒"""
    gd = await pg.evaluate("PG.gradDay()"); dpack = (await P.day_of(pg, '2029-06-01'))['d']
    courses = await pg.evaluate("JSON.parse(JSON.stringify(GAME.G.courses||{}))")
    fl = {'Y4_PATH': 'bar', 'BAR_REG': True, 'GRADUATED': gd, 'GRAD_DONE': True, 'GRAD_EVENING': 'none', 'GRAD_ENVELOPE': 'later', 'PACKED_Y4': dpack, 'PG': {'done': {'grad': 1}}}
    st, dd = await Y.state_at(pg, '2029-06-17', 21.0, 'dorm', fl, done={e: 1 for e in Y.Y4_DONE})
    st['courses'] = courses
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(Y.CLEARP); await pg.wait_for_timeout(3000)
    run.setup('[前置／捷徑] %s：讀檔到 %s 21:00 宿舍（GRADUATED、GRAD_DONE、PACKED_Y4、典禮那幾場 done；BAR_REG true；courses 照剛才的：exam %s）' % (tag, dd['key'], J((courses.get('exam') or {}).get('Y4S2:maritime:final'))))
    n0 = await Y.pl_len(pg); drv = D(pg, cdp, run, tag, n0); nm0 = await pg.evaluate("(GAME.G.msgs||[]).length")
    t0 = time.time(); seen = None; last = None; since = time.time(); stuck = None
    while time.time() - t0 < ENVI('GR_MAX', 900):
        s = await P.ts(pg); g = await pg.evaluate(ST)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if g['grades'] is not None and seen is None: seen = time.time()
        if seen and free and time.time() - seen > ENVI('POST_S', 120): break
        if s['dlg']:
            R = await Y.rows(pg, max(n0, (await Y.pl_len(pg)) - 6)); full = next((x['t'] for x in reversed(R) if x['k'] == 'say'), '')
            if 'grades' not in drv.shots and ('法律專題研究：' in full or (MAR_NAME + '：') in full):
                drv.shots['grades'] = await Y.shoot_both(pg, run, tag + '_grades', full)
        sig = (g['clock']['key'], g['clock']['h'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['phone'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240): stuck = g['clock']; drv.shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        await pg.wait_for_timeout(1200)
    g = await pg.evaluate(ST); R = await Y.rows(pg, n0); said = [x for x in R if x['k'] == 'say']
    msgs = await pg.evaluate(Y.MSGS, nm0)
    gline = next((x['t'] for x in said if x.get('d') == GRADE_DAY and '　' in x['t'] and ('法律專題研究' in x['t'] or MAR_NAME in x['t'])), None)
    fdl = [[x.get('d'), x['t']] for x in said if FD_RE.search(x['t'])]
    steps = [x['t'] for x in R if x['k'] == 'step' and x['n'] == 'end']
    run.note('%s：6/18 以後 %s；成績單 %s；步驟 %s；延畢／補考的句子 %s；新訊息 %s' % (tag, J(g), J(gline), J(steps), J(fdl), J([[m['tag'], m['text'][:40]] for m in msgs][:12])))
    return {'g': g, 'gline': gline, 'fdl': fdl, 'steps': steps, 'stuck': stuck, 'said': said, 'msgs': msgs, 'shots': drv.shots, 'mk_msgs': [m for m in msgs if (m['tag'] or '').startswith('fd_mk') or '補考' in m['text']]}


async def case_take(pg, cdp, run):
    tag = 'take'; sel = await select_term(pg, cdp, run, tag, 'take')
    run.check('%s：選課畫面有海商法這一組：「%s」和「這學期不修…」兩個選項（startswith）' % (tag, MAR_NAME),
              bool(sel['opts']) and any(t.startswith(MAR_NAME) for t in sel['opts']) and any(t.startswith('這學期不修') for t in sel['opts']), J({'asked': sel['asked'], 'opts': sel['opts']}))
    g, scan, wk = await after_select(pg, cdp, run, tag, sel)
    run.check('%s：按「%s」→ electives.%s＝maritime、termCourses 有 maritime' % (tag, MAR_NAME, GROUP), g['electives'].get(GROUP) == MAR and MAR in g['termCourses'], J({'el': g['electives'], 'tc': g['termCourses']}))
    ed = g['examDay'] if isinstance(g['examDay'], dict) else None
    run.check('%s：examDay(maritime,Y4S2,final) 有日期、examList 有' % tag, bool(ed) and any(e[0] == MAR and e[1] == 'final' for e in (g['examList'] or [])), J({'examDay': g['examDay'], 'examList': g['examList']}))
    run.check('%s：手機「課表」考試欄有海商法' % tag, MAR_NAME in (wk.get('exam') or ''), J(wk.get('exam')))
    if not ed: return
    ex = await exam_day(pg, cdp, run, tag, ed['key'])
    run.check('%s：考試那天（%s）手機「今天」有「%s（考試）」' % (tag, ed['key'], MAR_NAME), (MAR_NAME + '（考試）') in (ex['today'].get('text') or ''), J((ex['today'].get('text') or '')[:300]))
    ces = [r['ce'] for r in ex['drv'].exam if r.get('ce')]
    run.note('%s：考卷 %s' % (tag, J(ex['drv'].exam)))
    run.check('%s：期末考得到：CLS.curExam 認得考卷 {cid maritime, kind final, term Y4S2}（%d 題）' % (tag, len(ces)),
              len(ex['drv'].exam) == 5 and len(ces) == 5 and all(c['cid'] == MAR and c['kind'] == 'final' and c['term'] == 'Y4S2' for c in ces),
              J({'curExamHook': ex['g']['curExamHook'], 'exam': ex['drv'].exam}))
    rec = ex['g']['exam'] or {}
    run.check('%s：期末紀錄 status done、答對 %d 題（照玩家按的）' % (tag, EXAM_RIGHT), rec.get('status') == 'done' and rec.get('correct') == EXAM_RIGHT, J(rec))
    gr = await grades_part(pg, cdp, run, tag); g2 = gr['g']; F = g2['flags']
    mline = next((p for p in (gr['gline'] or '').split('　') if p.startswith(MAR_NAME + '：')), None)
    run.check('%s：6/18 成績單有「%s：…不及格」（被當只記成績）' % (tag, MAR_NAME), bool(mline) and '不及格' in mline, J({'line': gr['gline'], 'grades': g2['grades']}))
    run.check('%s：不延畢（沒有 FAIL_DELAY、FAIL_DELAY_COURSES 不含 maritime、PG.delayed false、FD.on false）' % tag,
              not F.get('FAIL_DELAY') and MAR not in (F.get('FAIL_DELAY_COURSES') or []) and g2['delayed'] is False and g2['fdOn'] in (False, None), J({'flags': F, 'delayed': g2['delayed'], 'fdOn': g2['fdOn'], 'failed': g2['failed']}))
    run.check('%s：不排補考（FD_MAKEUP 不是 pending、沒有補考通知）' % tag, not (isinstance(F.get('FD_MAKEUP'), dict) and F['FD_MAKEUP'].get('status') == 'pending') and not gr['mk_msgs'], J({'FD_MAKEUP': F.get('FD_MAKEUP'), 'msgs': gr['mk_msgs'][:3]}))
    run.check('%s：BAR_REG 保留 true' % tag, F.get('BAR_REG') is True, J(F))
    run.check('%s：沒有延畢／補考的句子' % tag, not gr['fdl'], J(gr['fdl']))
    run.check('%s：沒有卡住' % tag, gr['stuck'] is None, J(gr['stuck']))
    dump(tag, sel=sel, g=g, scan=scan, wk=wk, ex=ex, gr=gr)


async def case_skip(pg, cdp, run):
    tag = 'skip'; sel = await select_term(pg, cdp, run, tag, 'skip')
    run.check('%s：選課畫面有「這學期不修…」可以按' % tag, bool(sel['picked']) and sel['picked'].startswith('這學期不修'), J({'asked': sel['asked'], 'opts': sel['opts']}))
    g, scan, wk = await after_select(pg, cdp, run, tag, sel)
    run.check('%s：electives.%s＝none、termCourses 沒有 maritime' % (tag, GROUP), g['electives'].get(GROUP) == 'none' and MAR not in g['termCourses'], J({'el': g['electives'], 'tc': g['termCourses']}))
    run.check('%s：沒有海商法考試日（examDay null、examList 沒有）' % tag, g['examDay'] is None and not any(e[0] == MAR for e in (g['examList'] or [])), J({'examDay': g['examDay'], 'examList': g['examList']}))
    run.check('%s：整學期每天的課（dayItems）都沒有海商法' % tag, scan == [], J(scan[:5]))
    run.check('%s：手機「課表」沒有海商法' % tag, MAR_NAME not in (wk.get('text') or '') and MAR_NAME not in (wk.get('exam') or ''), J({'exam': wk.get('exam'), 'text': (wk.get('text') or '')[:300]}))
    dday = await pg.evaluate(DEFDAY, (await P.day_of(pg, '2029-05-01'))['d'])
    ex = await exam_day(pg, cdp, run, tag, dday) if isinstance(dday, str) and dday[:2] == '20' else None
    if ex:
        run.check('%s：選了才會考的那一天（%s）手機「今天」沒有海商法、「直接去上課」沒有' % (tag, dday), MAR_NAME not in (ex['today'].get('text') or '') and not ex['go'],
                  J({'today': (ex['today'].get('text') or '')[:300], 'go': ex['go']}))
    gr = await grades_part(pg, cdp, run, tag); g2 = gr['g']; F = g2['flags']
    run.check('%s：6/18 成績單沒有「%s：」那一行（R.grades.Y4S2 也沒有 maritime）' % (tag, MAR_NAME),
              bool(gr['gline']) and (MAR_NAME + '：') not in gr['gline'] and MAR not in (g2['grades'] or {}), J({'line': gr['gline'], 'grades': g2['grades']}))
    run.check('%s：畢業照常（沒有 FAIL_DELAY、FD.on false、PG.delayed false；GRADUATED 是前置設的）' % tag,
              not F.get('FAIL_DELAY') and g2['delayed'] is False and g2['fdOn'] in (False, None) and not gr['fdl'], J({'flags': F, 'fdl': gr['fdl']}))
    run.check('%s：沒有卡住' % tag, gr['stuck'] is None, J(gr['stuck']))
    dump(tag, sel=sel, g=g, scan=scan, wk=wk, ex=ex, gr=gr)


async def case_pool(pg, cdp, run):
    tag = 'bar_pool'
    o = await pg.evaluate(POOL, [ENVI('SEEDS', 200)])
    run.note('%s：%s' % (tag, J(o)))
    run.check('%s：EXAM_BANK 有海商法題（>0，不然這一項沒有意義）' % tag, len(o.get('bankMar') or []) > 0, J(o.get('bankMar')))
    run.check('%s：律師一試的抽題函式 PG.draw 用 PG.pool()（包住計數 >0；原始碼也有 S.pool()）' % tag, o['draw']['poolCalls'] > 0 and o['drawUsesPool'], J({'calls': o['draw']['poolCalls'], 'src': o['drawUsesPool']}))
    run.check('%s：PG.pool()（一試題池）窮舉沒有海商法題（%s 題）' % (tag, o.get('poolN')), o.get('poolMar') == [], J(o.get('poolMar')))
    run.check('%s：PG.draw %s 個 examSeed × 2029～2033 抽出來都沒有海商法' % (tag, o['draw']['seeds']), not o['draw']['mar'] and not o['draw']['err'] and o['draw']['questions'] > 0, J(o['draw']))
    for c in ('maritime', 'ip_law', 'labor_social', 'tax_law'):   # BB CC_34：一試不考的四科，PG.pool() 裡用 course 數，都要 0
        ids = (o.get('byCourse') or {}).get(c)
        run.check('%s：PG.pool() 裡 course＝%s 的題數 0（用 course 判斷；EXAM_BANK 有這個 course：%s）' % (tag, c, c in (o.get('bankCourses') or [])), ids == [], J(ids))
    run.note('%s：舊存檔用的 PG.pool(true) 有海商法 %s 題（照設計：已經抽好的照舊）；司法官二試 judgePool %s 題、其中海商法 %s（AA_583，只記錄）' %
             (tag, len(o.get('poolAllMar') or []), o.get('judgeN'), J(o.get('judgeMar'))))
    dump(tag, pool=o)


def dump(tag, **kw):
    def clean(v):
        if isinstance(v, Y.Driver): return {'answered': v.answered, 'shots': v.shots, 'picks': v.picks_log}
        if isinstance(v, dict): return {k: clean(x) for k, x in v.items()}
        if isinstance(v, (list, tuple)): return [clean(x) for x in v]
        return v
    with open(os.path.join(OUT, 'd124_%s.json' % tag), 'w', encoding='utf-8') as f:
        json.dump(dict(case=tag, sha=os.environ.get('SHA', '?'), **clean(kw)), f, ensure_ascii=False, indent=1)


CASEFN = {'take': case_take, 'skip': case_skip, 'bar_pool': case_pool}


async def main():
    run = L.Run('d124_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for cs in CASES:
            fn = CASEFN.get(cs)
            if not fn: run.check('CASE %s 認得' % cs, False, '可以用：' + ','.join(CASEFN)); continue
            print('==== CASE %s（SHA %s）====' % (cs, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % cs, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(Y.HOOK)
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
