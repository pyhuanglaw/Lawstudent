"""CC（帳號 A）11-02：BB_246 第一節 #4（D118-B6／B8 國考路線補充二、三：88c684187、a68258ea6）的瀏覽器探針（P2_bar）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps），URL 用 '<URL>/index.html?turbo'【捷徑：turbo 只縮短等待】。
BB_229 第 7 條：一律先讀遊戲狀態（G.flags 的 BAR_*／JUDGE_*、PG.rec(G).done、PG.path、PG.lastLine、PG.epiAfterLast），畫面文字只用來驗「玩家看得到」；選單比對 startswith。

前置（【前置／捷徑】）：cc_bar_b8_prefix.js 用遊戲自己的程式（tests/pg_harness.js，Node）從畢業後一路「跳到下一件事」，停在指定場景開演之前，
把整個 G 存成 JSON（路線照 tests/d118_b8b r11、d118_b8d a1），這支用 GAME.applySave 讀進去（zone 改成 gongguan＝退宿以後在外面；pos 不給＝出生點），
之後全部照玩家在瀏覽器裡演：畫面空著就站著不動（畢業後篇＝站 2 秒跳到下一件事）、對話點過、選單照規則（報名→「報名」；其他照 cc_y4s2final 的 pick_opt：婉拒那一類／第一個）、
考卷（「i／20　題目」＝律師一試、「i／10　題目」＝司法官二試）【捷徑】用題目原文在 PG.pool(true)＋PG.judgePool() 找到那一題、照 PG.opts 算正解，照 plan 前 k 題答對、其他故意答錯
（畢業後篇的考卷沒有 CLS.curExam；curExam 只給學期中的考試）。一路跑到尾聲演完（PG.runStep('epi') 結束＝EPILOGUE_DONE），記下每一句台詞。
CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設 missed1,trainee,judge2033）：
  missed1   2029-08-01 起（Y4_PATH bar＝已報名）→ 前置停在一試開演之前 →【捷徑】時間改到 8/5 07:00（一試的時間過了、沒去考）→ 瀏覽器讀檔：
            exam_2029＝missed、旁白「（那天早上，你沒有走進考場。……）」（MISSED.exam2029）、2030-05-10 報名（「國考報名，這週五截止。」報名／不報名 → 報名）、
            2030 一試照玩家答（plan 14 題＝律師）→ BAR_YEAR 2030 → 尾聲。check：旁白、報名問得到、BAR_REG_2030 true、BAR_SIT_2030、BAR_YEAR 2030、沒有 2029 的考卷、
            沒有律師版錯過 2030（MISSED.exam2030）、尾聲演完；記錄尾聲每一句、路線 PG.path、最後一句。
  trainee   r11：2029 一試 18、二試 4 → 再考 → 2030、2031 一試 17、二試 3（前置）→ 停在 2032 一試 → 瀏覽器：一試 17、二試 9 → 2033-01 三試、錄取（JUDGE_YEAR 2033≥PG.TRAINEE_FROM）
            → 尾聲。check：JUDGE_YEAR 2033、PG.path＝J_trainee、沒有 jrole（結業前選擇）、JUDGE_ROLE 沒有、最後一句＝EPI.last.J_trainee、阿凱／沛珊受訓中那兩句（有到場才有）、
            交往中遠距那一句（前置有跟語彤交往）、照片「司法官學院的宿舍書桌」（EPI 照片那一行，有的話）。
  judge2033 a1：2029～2032 一試都沒過（前置）→ 停在 2033 一試 → 瀏覽器：一試 17（第一次到 both）、二試 3（沒上）→ 沒有下一年＝不演二選一 → 尾聲。
            check：BAR_YEAR 2033、JUDGE_PASS_2033 false、JUDGE_RETAKE false＋JUDGE_RETAKE_AUTO、沒有 jretake 步驟、沒有二選一選項（「再考一次司法官。」／「就當律師。」）、
            尾聲有 epiAuto「司法官考過一次，沒有上。……」、沒有 epiD「……我後來沒有再考……」。
修改前（b1b249873）沒有 J_trainee、JUDGE_RETAKE_AUTO、epiAuto（a68258ea6、88c684187 都在 b1b 之後）：trainee、judge2033 預期 FAIL。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=missed1,trainee,judge2033] python3 cc_bar_b8_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（預設 5400）、STUCK_S（預設 240；空著、畫面時間都沒變＝先試床「睡覺」，再沒變＝卡住）。"""
import os, sys, json, asyncio, re, time, subprocess, traceback
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_y4s2final_probe as Y   # 共用：HOOK、Driver、bed、shoot_both、rows、pl_len（只 import，不跑它的 main）
L, P = Y.L, Y.P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = Y.J
ENVI = Y.ENVI
HERE = os.path.dirname(os.path.abspath(__file__))
WT = os.path.dirname(os.path.abspath(os.environ['LW_TESTS']))
CASES = [c.strip() for c in os.environ.get('CASES', 'missed1,trainee,judge2033').split(',') if c.strip()]
PLAN = {'missed1': {'bar': {2030: 14}, 'judge': {}},
        'trainee': {'bar': {2032: 17}, 'judge': {2032: 9}},
        'judge2033': {'bar': {2033: 17}, 'judge': {2033: 3}}}
QX = re.compile(r'^(\d+)／(10|20)　(.*)$', re.S)
RETAKE_OPTS = ('「再考一次司法官。」', '「就當律師。」')

EPIHOOK = r"""(()=>{ if(window.__EPIH) return 'again'; window.__EPIH=1; const r0=PG.runStep; PG.runStep=async function(GM,s){ const r=await r0.apply(this,arguments);
  if(s&&s.id==='epi'){ try{ const G=GAME.G; window.__EPI={flags:JSON.parse(JSON.stringify(G.flags)),path:PG.path(G),last:PG.lastLine(G),after:PG.epiAfterLast?PG.epiAfterLast(G):null,done:JSON.parse(JSON.stringify(PG.rec(G).done))}; }catch(e){ window.__EPI={err:String(e.message)}; } }
  return r; }; return 'ok'; })()"""
PST = r"""(()=>{ const G=GAME.G, F=G.flags||{}, pick={}; for(const k of Object.keys(F)) if(/^(BAR_|JUDGE_|EPILOGUE_DONE|FIRST_DAY_SEEN|RETAKE_STYLE)/.test(k)) pick[k]=F[k];
  let path=null, done=null; try{ path=PG.path(G); done=PG.rec(G).done; }catch(e){}
  return {key:CALENDAR.dateOf(G.day).key,day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,flags:pick,path,done:done&&Object.keys(done).filter(k=>/^(exam|r1|e2|r2|jretake|j3|jb2|jrole|miss|r2miss|reg|jreg|first|epi)/.test(k)).reduce((o,k)=>(o[k]=done[k],o),{}),
    title:!document.getElementById('titleScreen').classList.contains('hide'),nmsg:(G.msgs||[]).length}; })()"""
LINES = r"""(()=>{ const PL=POSTGRAD_LINES, J=PL.JUDGE||{}, E=PL.EPI||{}; return {missed:PL.MISSED||null,epiAuto:J.epiAuto||null,epiD:J.epiD||null,epiF:J.epiF||null,distance:J.distance||null,
  trainee:J.trainee||null,last:E.last||null,meJ:((PL.FIRST||{}).me||{}).J_trainee||null,firstJR:(PL.FIRST||{}).judgeRetake||null,regText:(PL.REG||{}).text||null,TRAINEE_FROM:PG.TRAINEE_FROM==null?null:PG.TRAINEE_FROM,
  photoJ:(()=>{ try{ return JSON.stringify(PL).match(/（照片：司法官學院的宿舍書桌[^」"]*?）/g); }catch(e){ return null; } })()}; })()"""
QANS = r"""(([qt])=>{ try{ const all=PG.pool(true).concat(PG.judgePool?PG.judgePool():[]); const q=all.find(x=>String(x.q)===qt); if(!q) return {err:'題庫找不到這一題',n:all.length};
  const o=PG.opts(q); return {id:q.id,course:q.course||null,right:o.findIndex(x=>String(x.v)===String(q.answer)),opts:o.map(x=>x.t)}; }catch(e){ return {err:String(e.message)}; } })"""


class D(Y.Driver):
    """畢業後篇：一試（／20）、司法官二試（／10）照 plan 答；報名選「報名」；其他照 cc_y4s2final 的 Driver"""
    def __init__(self, pg, cdp, run, tag, n0, plan):
        super().__init__(pg, cdp, run, tag, n0); self.plan = plan; self.exam = []; self.opts_seen = []

    async def handle(self, s, picks=()):
        pg, cdp, run = self.pg, self.cdp, self.run
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            R = await Y.rows(pg, max(self.n0, (await Y.pl_len(pg)) - 10))
            lastsay = next((x for x in reversed(R) if x['k'] == 'say'), None)
            m = QX.match(lastsay['t']) if lastsay else None
            if m:
                i, n, qt = int(m.group(1)), int(m.group(2)), m.group(3)
                yr = int((lastsay.get('d') or '0000')[:4]); kind = 'bar' if n == 20 else 'judge'
                key = '%s|%s|%d|%s' % (kind, yr, i, qt[:24])
                if key in self.answered: await pg.wait_for_timeout(600); return True
                a = await pg.evaluate(QANS, [qt])
                if a.get('err') or a['right'] < 0 or a['right'] >= len(T):
                    run.check('%s：%s %d 第 %d 題讀得到正解（【捷徑】只讀）' % (self.tag, kind, yr, i), False, J(a)); self.answered[key] = None
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(900); return True
                k = (self.plan.get(kind) or {}).get(yr, 0)
                want = a['right'] if i <= k else (1 if a['right'] == 0 else 0)
                rec = {'kind': kind, 'y': yr, 'i': i, 'n': n, 'id': a['id'], 'course': a['course'], 'right': a['right'], 'picked': want, 'correct': want == a['right'], 'same': [t.strip() for t in T] == [t.strip() for t in a['opts']]}
                self.answered[key] = rec; self.exam.append(rec)
                if i == 1: self.shots['%s_%d_q1' % (kind, yr)] = await run.shot(pg, '%s_%s_%d_q1' % (self.tag, kind, yr))
                await P.tap_choice(pg, cdp, want); await pg.wait_for_timeout(800); return True
            self.opts_seen.append([lastsay and lastsay.get('d'), lastsay and lastsay['t'][:60], T])
            if any(t.startswith(RETAKE_OPTS) for t in T): self.shots['retake_choice'] = await run.shot(pg, self.tag + '_retake_choice')
            return await super().handle(s, ('報名',) + tuple(picks))
        return await super().handle(s, picks)


def prefix(route):
    """Node 前置（cc_bar_b8_prefix.js）→ G"""
    out = os.path.join(OUT, 'prefix_%s.json' % route)
    r = subprocess.run(['node', os.path.join(HERE, 'cc_bar_b8_prefix.js'), route, out], capture_output=True, text=True, env=dict(os.environ, WT=WT), timeout=600)
    if r.returncode != 0 or not os.path.exists(out): raise RuntimeError('前置失敗：' + (r.stdout + r.stderr)[-800:])
    d = json.load(open(out, encoding='utf-8'))
    return d['info'], d['G']


async def play(pg, cdp, run, tag):
    route = tag; info, st = prefix(route)
    st['zone'] = 'gongguan'; st['pos'] = None; st.pop('v', None)   # 存檔版本照遊戲的 GAME.defaults（pg_harness 的 G 寫 v:3）
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(Y.CLEARP); await pg.evaluate(EPIHOOK); await pg.wait_for_timeout(3000)
    run.setup('[前置／捷徑] %s：Node 前置（cc_bar_b8_prefix.js，遊戲自己的 PG 程式）停在 %s 開演之前（%s）；讀檔 zone 改 gongguan；前置走過的場景 %s；旗標 %s' %
              (tag, info['stop'], info['at'], J(info['order']), J(info['flags'])))
    s0 = await pg.evaluate(PST); run.note('%s：讀檔後 %s' % (tag, J(s0)))
    lines = await pg.evaluate(LINES)
    n0 = await Y.pl_len(pg); drv = D(pg, cdp, run, tag, n0, PLAN[tag]); nm0 = s0['nmsg']
    t0 = time.time(); last = None; since = time.time(); stuck = None; slept = 0; lastkey = s0['key']
    while time.time() - t0 < ENVI('CASE_MAX', 5400):
        if await pg.evaluate("!!window.__EPI"): break
        s = await P.ts(pg); c = await P.clock(pg)
        if c['key'] != lastkey and c['key'][:4] != lastkey[:4]: run.note('%s：%s 年 %s' % (tag, c['key'][:4], c['key']))
        lastkey = c['key']
        sig = (c['key'], c['h'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'])
        if sig != last: last = sig; since = time.time(); slept = 0
        elif time.time() - since > ENVI('STUCK_S', 240):
            if slept == 0:
                slept = 1; since = time.time(); run.note('%s：%s %s 空著沒動 → 試床' % (tag, c['key'], Y.hm(c['h'])))
                try: await Y.bed(pg, cdp, run, ('睡覺', '睡到明天', '睡一下（'), '%s 卡住時' % tag)
                except Exception as e: run.note('%s：找床失敗 %r' % (tag, e))
                continue
            stuck = {'clock': c, 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}, 'ch': s['ch']}
            drv.shots['stuck'] = await run.shot(pg, tag + '_stuck'); break
        if await drv.handle(s): continue
        await pg.wait_for_timeout(1200)
    epi = await pg.evaluate("window.__EPI||null")
    await pg.wait_for_timeout(4000)
    drv.shots['end'] = await run.shot(pg, tag + '_end')
    R = await Y.rows(pg, n0); said = [x for x in R if x['k'] == 'say']
    steps = [x['t'] for x in R if x['k'] == 'step' and x['n'] == 'end']
    try: msgs = await pg.evaluate(Y.MSGS, nm0); allmsgs = await pg.evaluate(Y.ALLMSG)
    except Exception: msgs = []; allmsgs = []
    # 尾聲的台詞：epi 那一場開始到結束
    i0 = next((i for i, x in enumerate(R) if x['k'] == 'step' and x['n'] == 'start' and x['t'] == 'epi'), None)
    i1 = next((i for i, x in enumerate(R) if x['k'] == 'step' and x['n'] == 'end' and x['t'] == 'epi'), None)
    epil = [[x['n'], x['t']] for x in R[i0:(i1 or len(R))] if x['k'] in ('say', 'card', 'cg')] if i0 is not None else []
    run.note('%s：尾聲 %d 句：%s' % (tag, len(epil), J(epil)))
    run.note('%s：演過的場景 %s' % (tag, J(steps)))
    run.note('%s：考卷 %s' % (tag, J([[e['kind'], e['y'], e['i'], e['id'], e['course'], e['correct'], e['same']] for e in drv.exam])))
    o = dict(info=info, s0=s0, lines=lines, epi=epi, said=said, steps=steps, msgs=msgs, allmsgs=allmsgs, epil=epil, stuck=stuck, drv=drv, elapsed=round(time.time() - t0))
    with open(os.path.join(OUT, 'b8_%s.json' % tag), 'w', encoding='utf-8') as f:
        json.dump({'case': tag, 'sha': os.environ.get('SHA', '?'), 'info': info, 'start': s0, 'epi': epi, 'rows': R, 'msgs': msgs, 'epilogue': epil, 'steps': steps, 'stuck': stuck,
                   'exam': drv.exam, 'opts': drv.opts_seen, 'picks': drv.picks_log, 'shots': drv.shots, 'elapsed': o['elapsed']}, f, ensure_ascii=False, indent=1)
    run.check('%s：一路跑到尾聲演完（EPILOGUE_DONE；%d 秒）' % (tag, o['elapsed']), bool(epi) and not epi.get('err') and (epi.get('flags') or {}).get('EPILOGUE_DONE') is True, J({'epi': (epi or {}).get('path'), 'stuck': stuck}))
    run.check('%s：考卷畫面的選項和題庫一樣（%d 題）' % (tag, len(drv.exam)), all(e['same'] for e in drv.exam), J([e for e in drv.exam if not e['same']][:2]))
    return o


def has(o, t):
    return bool(t) and any(x['t'] == t for x in o['said'])


async def case_missed1(pg, cdp, run):
    tag = 'missed1'; o = await play(pg, cdp, run, tag); F = (o['epi'] or {}).get('flags') or {}; done = (o['epi'] or {}).get('done') or {}; M = o['lines']['missed'] or {}
    run.check('%s：讀檔時 exam_2029 判 missed（時間過了沒去考）' % tag, done.get('exam_2029') == 'missed' and F.get('BAR_SIT_2029') is not True, J({'exam_2029': done.get('exam_2029'), 'sit': F.get('BAR_SIT_2029')}))
    run.check('%s：錯過的旁白「%s」' % (tag, M.get('exam2029')), has(o, M.get('exam2029')) and 'miss_exam_2029' in o['steps'], J([x['t'] for x in o['said'] if '考場' in x['t']][:4]))
    regs = [op for op in o['drv'].opts_seen if any(t.startswith('報名') for t in op[2]) and any(t.startswith('不報名') for t in op[2])]
    run.check('%s：2030 年 5 月問得到報名（「報名／不報名」，按報名）→ BAR_REG_2030 true' % tag, bool(regs) and 'reg_2030' in o['steps'] and F.get('BAR_REG_2030') is True, J({'regs': regs[:2], 'BAR_REG_2030': F.get('BAR_REG_2030')}))
    e30 = [e for e in o['drv'].exam if e['kind'] == 'bar' and e['y'] == 2030]; e29 = [e for e in o['drv'].exam if e['y'] == 2029]
    run.check('%s：2030 一試照玩家考（20 題、答對 %d）、沒有 2029 的考卷' % (tag, sum(e['correct'] for e in e30)), len(e30) == 20 and not e29 and F.get('BAR_SIT_2030') is True and F.get('BAR_SCORE_2030') == PLAN[tag]['bar'][2030], J({'n30': len(e30), 'n29': len(e29), 'score': F.get('BAR_SCORE_2030')}))
    run.check('%s：BAR_YEAR 2030（錄取年）' % tag, F.get('BAR_YEAR') == 2030, J({k: F.get(k) for k in ('BAR_YEAR', 'BAR_STAGE_2030', 'BAR_REG', 'BAR_REG_2030')}))
    run.check('%s：沒有律師版錯過 2030 的旁白（MISSED.exam2030）' % tag, not has(o, M.get('exam2030')), '')
    run.note('%s：路線 %s；最後一句 %s；epiAfterLast %s' % (tag, (o['epi'] or {}).get('path'), J((o['epi'] or {}).get('last')), J((o['epi'] or {}).get('after'))))
    run.check('%s：尾聲的最後一句（PG.lastLine）有說出來' % tag, has(o, (o['epi'] or {}).get('last')), J((o['epi'] or {}).get('last')))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))


async def case_trainee(pg, cdp, run):
    tag = 'trainee'; o = await play(pg, cdp, run, tag); E = o['epi'] or {}; F = E.get('flags') or {}; Ln = o['lines']; done = E.get('done') or {}
    TF = Ln.get('TRAINEE_FROM')
    run.check('%s：JUDGE_YEAR 2033（≥ PG.TRAINEE_FROM %s）、JUDGE_PASS_2032 true' % (tag, TF), F.get('JUDGE_YEAR') == 2033 and F.get('JUDGE_PASS_2032') is True and TF is not None and F.get('JUDGE_YEAR', 0) >= TF,
              J({k: F.get(k) for k in ('JUDGE_YEAR', 'JUDGE_PASS_2032', 'JUDGE_SCORE2_2032', 'BAR_SCORE_2032', 'BAR_STAGE_2032')}))
    run.check('%s：PG.path＝J_trainee' % tag, E.get('path') == 'J_trainee', J(E.get('path')))
    run.check('%s：沒有結業前的選擇（jrole 沒演、JUDGE_ROLE 沒有）' % tag, 'jrole' not in o['steps'] and 'jrole' not in done and F.get('JUDGE_ROLE') is None, J({'role': F.get('JUDGE_ROLE'), 'jrole': done.get('jrole')}))
    lt = (Ln.get('last') or {}).get('J_trainee')
    run.check('%s：尾聲最後一句＝受訓中那一版「%s」' % (tag, (lt or '')[:20]), bool(lt) and E.get('last') == lt and has(o, lt), J({'last': E.get('last')}))
    tr = Ln.get('trainee') or {}
    run.note('%s：阿凱受訓中那句 %s、沛珊 %s、遠距那句 %s；照片那一行 %s（POSTGRAD_LINES 裡有 %s）' % (tag, has(o, tr.get('kai')), has(o, tr.get('peishan')), has(o, Ln.get('distance')),
             J([x['t'] for x in o['said'] if '司法官學院的宿舍書桌' in x['t']] + [m['text'] for m in o['msgs'] if '司法官學院的宿舍書桌' in m['text']]), J(Ln.get('photoJ'))))
    run.check('%s：阿凱、沛珊受訓中那兩句（前置兩人都是朋友）' % tag, has(o, tr.get('kai')) and has(o, tr.get('peishan')), J([x['t'][:40] for x in o['said'] if x['n'] in ('阿凱', '沛珊')][-4:]))
    run.check('%s：交往中遠距那一句（前置和語彤交往）' % tag, has(o, Ln.get('distance')), J(Ln.get('distance')))
    # 照片：讀碼 FIRST.me.J_trainee 是「第一份工作」那一張（2030-10-01 firstDay，S.firstPhoto）；這條路線那時候在重考司法官＝照 FIRST.judgeRetake，尾聲本身沒有照片那一行
    fp = [m['text'] for m in o['allmsgs'] if m['tag'] == 'pg_first_day' and m['from'] == 'player']
    run.note('%s：第一份工作的照片（前置 2030-10-01 演的）%s；FIRST.me.J_trainee＝%s；FIRST.judgeRetake＝%s' % (tag, J(fp), J(Ln.get('meJ')), J(Ln.get('firstJR'))))
    run.check('%s：照片：2030-10-01 那一張照「重考司法官」那一版（S.firstPhoto；不是 J_trainee 那一張）' % tag, bool(fp) and bool(Ln.get('firstJR')) and Ln['firstJR'] in fp[0], J({'photo': fp, 'want': Ln.get('firstJR')}))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))


async def case_judge2033(pg, cdp, run):
    tag = 'judge2033'; o = await play(pg, cdp, run, tag); E = o['epi'] or {}; F = E.get('flags') or {}; Ln = o['lines']; done = E.get('done') or {}
    run.check('%s：2033 一試 17＝both、二試 3＝沒上；BAR_YEAR 2033' % tag, F.get('BAR_STAGE_2033') == 'both' and F.get('JUDGE_PASS_2033') is False and F.get('BAR_YEAR') == 2033,
              J({k: F.get(k) for k in ('BAR_SCORE_2033', 'BAR_STAGE_2033', 'JUDGE_SCORE2_2033', 'JUDGE_PASS_2033', 'BAR_YEAR')}))
    run.check('%s：沒有下一年＝不演二選一（沒有 jretake 步驟、沒有「再考一次司法官。」「就當律師。」的選單）、JUDGE_RETAKE false＋JUDGE_RETAKE_AUTO' % tag,
              not any(k.startswith('jretake') and v == 1 for k, v in done.items()) and not any(any(t.startswith(RETAKE_OPTS) for t in op[2]) for op in o['drv'].opts_seen)
              and F.get('JUDGE_RETAKE') is False and F.get('JUDGE_RETAKE_AUTO') is True, J({k: F.get(k) for k in ('JUDGE_RETAKE', 'JUDGE_RETAKE_AUTO')}))
    run.check('%s：尾聲有 epiAuto「%s」' % (tag, (Ln.get('epiAuto') or '')[:16]), bool(Ln.get('epiAuto')) and has(o, Ln.get('epiAuto')), J([x['t'] for x in o['said'] if '司法官' in x['t']][-4:]))
    run.check('%s：沒有玩家沒選過的「我後來沒有再考」（epiD）' % tag, not has(o, Ln.get('epiD')) and not any('我後來沒有再考' in x['t'] for x in o['said']), '')
    run.note('%s：路線 %s；最後一句 %s；epiAfterLast %s' % (tag, E.get('path'), J(E.get('last')), J(E.get('after'))))
    run.check('%s：沒有卡住' % tag, o['stuck'] is None, J(o['stuck']))


CASEFN = {'missed1': case_missed1, 'trainee': case_trainee, 'judge2033': case_judge2033}


async def main():
    run = L.Run('bar_b8_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
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
