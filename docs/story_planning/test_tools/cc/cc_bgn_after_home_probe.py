"""CC（帳號 A）11-10：BGN-AFTER-HOME-1110（X288，P0，使用者回報；BB 11-10 規格）。
bug：使用者「桌遊日桌遊完回到前往之前的系館 ?都晚上這麼晚了 而且行動次數用完不是應該回去睡覺嗎」（day 52 23:36 普通教學館）——
     OUT.go 出遊演完只填時段（CLS.slotFillSpan），沒有排「時段用完」（CLS.queueJump），人留在出發前的地方。
修正：開發分支 claude/modest-rubin-2lyp7g 063592f18（src/outings3d.js：演完一樣 CLS.queueJump；晚上用完＝CLS.afterSlot → eveSleep 回宿舍睡；白天用完照 ACTION-BUDGET 跳下一個時段）。
舊版＝063592f18^（cdcb2650730）。新舊兩版都跑；重要的檢查要「舊版 FAIL、新版 PASS」。
真實玩家流程：不用 ?turbo、不瞬移；出發選單、對話都用手指點。只有讀檔、旗標、手動排出遊是前置，印【前置／捷徑】。
CASES（逗號分開，預設全部）：
  night  桌遊夜重演。【前置／捷徑】讀檔到普通教學館（putong）、Y1S1 的桌遊夜（BGN.weeks 第 NIGHT_IDX 個，預設 1＝第二次）19:33，旗標 BGN_GO＝那一天
         （＝明軒私訊／群組答「好。」的結果）→ 等遊戲自己排出 OUT bgn_<day>（BGN.phone）→ 等「出發：桌遊夜（日常失速）」→ 點出發 → 點完桌遊夜 →
         K1【舊 FAIL／新 PASS】演完以後回宿舍睡：午夜以前進了 dorm 或睡到隔天（不是留在普通教學館）
         K2【舊 FAIL／新 PASS】出現「晚上的時間用完了，回去睡覺。」
         K3【舊 FAIL／新 PASS】最後不是「那一天、還在普通教學館」
  day    ①白天的出遊照舊回原地：【前置／捷徑】隔天（週六）12:53 在普通教學館，手動排一個 13:00、3.5 小時的測試出遊（注入事件 ev_cc_bgn_t）→ 出發 → 演完
         D1 演完回到普通教學館（zone 不變、沒進宿舍）；D2 沒有「晚上的時間用完了」；INFO：之後有沒有照 ACTION-BUDGET 跳到 18:00（新版會跳）
  eve    ②晚上時段還沒用完不能硬拉回宿舍（一）：週六 14:43，14:50～18:20 的測試出遊（跨進晚上只有 20 分鐘＝晚上那一次沒用掉）→ 演完
         E1 沒有被拉回宿舍、日子沒變、留在普通教學館；E2 沒有「晚上的時間用完了」
  exam   ②（二）考試週晚上可以多自習一次：Y1S1 考試週的週五 19:33，手動排 20:00 的桌遊夜（ev_bgnight，考試週 BGN 自己不排）→ 演完 23:30
         X1 沒有被拉回宿舍、日子沒變；X2 沒有「晚上的時間用完了」
每一段另記：演完那一刻幾點、之後每一次換區域（GAME.enter）和 toast／caption、最後狀態；沒有 JS 例外。
判定：探針只印 PASS／FAIL／INFO，最後 ALL PASS 或 FAILED n。舊版預期 FAILED 3（K1～K3），新版預期 ALL PASS。
用法：LW_TESTS=<wt>/tests [CASES=night,day,eve,exam] [NIGHT_IDX=1] [SETTLE=50] python3 cc_bgn_after_home_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'night,day,eve,exam').split(',') if c.strip()]
NIGHT_IDX = int(os.environ.get('NIGHT_IDX') or 1)
SETTLE = float(os.environ.get('SETTLE') or 50)     # 演完以後再看幾秒（真實時間；遊戲 150 秒＝1 小時：50 秒約 20 分鐘，桌遊夜 23:30 演完不會跨過午夜）
MAXS = float(os.environ.get('MAXS') or 900)
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
         'BIKE_TIP': True, 'BIKE_PARK_TIP': True, 'KX_FIRST_MSG': True, 'YT_MET_JOB': True}
EVE_LINE = '晚上的時間用完了'
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, s=''):
    print('INFO ' + name + (('  ' + s) if s else ''), flush=True)


def setup(s): print('  [前置／捷徑] ' + s, flush=True)


def hhmm(h):
    if h is None: return '?'
    m = int(round(h * 60)); return '%02d:%02d' % (m // 60, m % 60)


DAYS_JS = """(idx=>{ const out={}; const ws=BGN.weeks('Y1S1'); out.weeks=ws; const w=ws[Math.min(idx,ws.length-1)]; out.night=STORY.termDayIn('Y1S1',w,5);
  out.nightOk=BGN.isNight(out.night); out.sat=out.night+1;
  for(let x=out.night;x<out.night+160;x++){ const t=CALENDAR.termOf(x); if(t&&t.id==='Y1S1'&&t.exam&&CALENDAR.dateOf(x).wd===5&&!(CALENDAR.holiday&&CALENDAR.holiday(x))){ out.exam=x; break; } }
  const k=d=>d==null?null:{d, key:CALENDAR.dateOf(d).key, wd:CALENDAR.dateOf(d).wd, term:(CALENDAR.termOf(d)||{}).id||null, week:(CALENDAR.termOf(d)||{}).week||null, exam:!!(CALENDAR.termOf(d)||{}).exam};
  out.info={night:k(out.night), sat:k(out.sat), exam:k(out.exam)}; return out; })(%d)"""

HOOK_JS = """(()=>{ window.__cc=window.__cc||{toasts:[],caps:[],enters:[]}; const C=window.__cc; const now=()=>({d:GAME.G?GAME.G.day:null,h:GAME.G?+(+GAME.G.hour).toFixed(3):null});
  if(!GAME.__ccHook){ GAME.__ccHook=true;
    const t0=GAME.toast; GAME.toast=function(t,ms){ try{ C.toasts.push(Object.assign({t:String(t||'').slice(0,80)},now())); }catch(e){} return t0.apply(this,arguments); };
    const c0=GAME.caption; GAME.caption=function(a,b,ms){ try{ C.caps.push(Object.assign({t:String((b||a)||'').slice(0,80)},now())); }catch(e){} return c0.apply(this,arguments); };
    const e0=GAME.enter; GAME.enter=function(z){ try{ C.enters.push(Object.assign({zone:z,from:GAME.G?GAME.G.zone:null},now())); }catch(e){} return e0.apply(this,arguments); }; }
  C.toasts.length=0; C.caps.length=0; C.enters.length=0; return true; })()"""
CC_JS = "(()=>JSON.parse(JSON.stringify(window.__cc||{})))()"

ST = """(qid=>{ const G=GAME.G, E=GAME.E, P=E.player, D=GAME.D||{}; const q=(typeof OUT!=='undefined'&&OUT.get)?OUT.get(G,qid):null;
  return {zone:G.zone, d:G.day, h:+(+G.hour).toFixed(3), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy, adv:!!(typeof ADV!=='undefined'&&ADV.active),
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,100),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim().slice(0,40)),
    q:q?{state:q.state,day:q.day,h:q.h,arrived:!!q.arrived}:null, running:!!(typeof OUT!=='undefined'&&OUT.isRunning&&OUT.isRunning(qid)),
    jump:(typeof CLS!=='undefined'&&CLS._jump)?JSON.parse(JSON.stringify(CLS._jump)):null,
    slots:G.slots?JSON.parse(JSON.stringify(G.slots)):null, bgnN:(G.flags||{}).BGN_N|0, fb:GAME.walkFallbacks||0, paused:!!E.paused}; })"""

INJECT_JS = """(()=>{ if(!STORY_EVENTS.some(e=>e&&e.id==='ev_cc_bgn_t')) STORY_EVENTS.push({id:'ev_cc_bgn_t',title:'測試的出遊',participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:3.5,dialogue:[{text:'（CC 測試的出遊：白天的出遊。）'}]}); return true; })()"""
PLAN_JS = """(o=>{ const G=GAME.G; const r=OUT.plan(G,o); const q=OUT.get(G,o.id); return {r, q:q?{state:q.state,day:q.day,h:q.h}:null}; })"""


async def load(pg, cdp, d, hour, extra_flags, desc):
    wd = await pg.evaluate("d=>CALENDAR.dateOf(d).wd%7", d)
    fl = dict(FLAGS); fl.update(extra_flags or {})
    st = {'zone': 'putong', 'day': d, 'weekday': wd, 'hour': hour, 'weather': 'clear', 'flags': fl, 'money': 3000, 'pos': None}
    await L.load_state(pg, st, quiet_events=True)
    g = await pg.evaluate("(()=>({d:GAME.G.day, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone}))()")
    setup('讀檔：普通教學館（putong 預設站位）%s %s（day %s）、條件事件關閉、手機不自動打開；%s' % (g['key'], hhmm(g['h']), g['d'], desc))
    if g['d'] != d or g['zone'] != 'putong': info('讀檔後和要的不一樣', J(g))
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    await pg.evaluate(HOOK_JS)


async def play(pg, cdp, tag, qid, d, settle):
    """等出發選單 → 點出發 → 點完對話 → 演完以後再看 settle 秒。回傳 (timeline, s_done, s_last, picked)"""
    t0 = time.time(); tl = []; s_done = None; t_done = None; seen_run = False; picked = []; last_key = None; idle0 = None; lastdlg = None
    while time.time() - t0 < MAXS:
        s = await pg.evaluate(ST, qid)
        key = (s['zone'], s['d'], (s['q'] or {}).get('state'), s['running'])
        if key != last_key:
            last_key = key; tl.append({'t': round(time.time() - t0, 1), 'zone': s['zone'], 'd': s['d'], 'h': s['h'], 'q': s['q'], 'running': s['running'], 'jump': s['jump']})
            print('  [%s] %5.1fs %s day %s %s q=%s running=%s jump=%s' % (tag, time.time() - t0, s['zone'], s['d'], hhmm(s['h']), J(s['q']), s['running'], J(s['jump'])), flush=True)
        if s['running']: seen_run = True
        if t_done is None and ((s['q'] or {}).get('state') == 'done' or (seen_run and not s['running'])):
            t_done = time.time(); s_done = s; print('  [%s] 演完（%s day %s %s）' % (tag, s['zone'], s['d'], hhmm(s['h'])), flush=True)
        if s['choices']:
            ch = s['choices']
            k = next((i for i, c in enumerate(ch) if c.startswith('出發')), None)
            if k is None: k = next((i for i, c in enumerate(ch) if c.startswith('先起床')), None)
            if k is None: k = 0
            picked.append(ch[k]); print('  [%s] 選單 %s → %s' % (tag, J(ch), ch[k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(1000); idle0 = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != lastdlg:
                lastdlg = (s['name'], s['text']); print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle0 = None; continue
        if await L.close_panels(pg, cdp): continue
        if t_done is not None:
            if s['depth'] == 0 and not s['busy'] and not s['adv']:
                if idle0 is None: idle0 = time.time()
            else: idle0 = None
            if time.time() - t_done > settle and idle0 is not None and time.time() - idle0 > 3: break
        elif not seen_run and time.time() - t0 > 240 and not picked:
            print('  [%s] 4 分鐘都沒有出發選單，停下' % tag, flush=True); break
        await pg.wait_for_timeout(700)
    s_last = await pg.evaluate(ST, qid)
    tl.append({'t': round(time.time() - t0, 1), 'zone': s_last['zone'], 'd': s_last['d'], 'h': s_last['h'], 'q': s_last['q'], 'final': True})
    return tl, s_done, s_last, picked


async def moved_ok(pg, cdp):
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        m, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if m >= 0.3: return round(m, 2)
    return 0.0


def eve_toasts(cc):
    return [x for x in cc.get('toasts', []) if EVE_LINE in x.get('t', '')]


async def case_night(pg, cdp, D, errs):
    d = D['night']; tag = 'night'; qid = 'bgn_%d' % d
    info('[night] 桌遊夜那一天', J(D['info']['night']))
    check('[night] 前置：選到的日子是桌遊夜（BGN.isNight）', bool(D['nightOk']), J(D['info']['night']))
    await load(pg, cdp, d, 19.55, {'BGN_GO': d}, '旗標 BGN_GO=%d（＝明軒約桌遊答「好。」）' % d)
    planned = False
    for _ in range(30):
        s = await pg.evaluate(ST, qid)
        if s['q']: planned = True; break
        await pg.wait_for_timeout(1000)
    if not check('[night] 遊戲照 BGN_GO 排出桌遊夜（OUT %s，20:00）' % qid, planned, J((await pg.evaluate(ST, qid))['q'])):
        setup('遊戲沒有排出來：手動 OUT.plan 和 BGN.phone 一樣的那一筆（只為了繼續看演完以後）')
        await pg.evaluate(PLAN_JS, {'id': qid, 'ev': 'ev_bgnight', 'day': d, 'h': 20, 'late': 0.5, 'place': '日常失速', 'title': '桌遊夜（日常失速）', 'travel': '走過去約 15 分鐘', 'travelH': 0.25})
    s0 = await pg.evaluate(ST, qid); n0 = s0['bgnN']; info('[night] 出發前', J({k: s0[k] for k in ('zone', 'd', 'h', 'slots', 'bgnN')}))
    tl, sd, sl, picked = await play(pg, cdp, tag, qid, d, SETTLE)
    cc = await pg.evaluate(CC_JS)
    await pg.screenshot(path=os.path.join(OUT, 'night_final.png'))
    check('[night] 出發選單出現、點了「出發：桌遊夜…」', any(p.startswith('出發') for p in picked), J(picked))
    check('[night] 桌遊夜演完（q.state done、BGN_N +1）', bool(sd) and (sl['q'] or {}).get('state') == 'done' and sl['bgnN'] == n0 + 1, J({'done': sd and {k: sd[k] for k in ('zone', 'd', 'h')}, 'q': sl['q'], 'bgnN': [n0, sl['bgnN']]}))
    info('[night] 演完那一刻', J(sd and {'zone': sd['zone'], 'd': sd['d'], 'h': hhmm(sd['h']), 'jump': sd['jump'], 'slots': sd['slots']}))
    info('[night] 換區域（GAME.enter）', J(cc.get('enters')))
    info('[night] toast', J(cc.get('toasts')))
    info('[night] caption', J(cc.get('caps')))
    info('[night] 最後', J({'zone': sl['zone'], 'd': sl['d'], 'h': hhmm(sl['h'])}))
    dorm_before_midnight = any(e.get('zone') == 'dorm' and e.get('d') == d and (e.get('h') or 0) < 24.2 for e in cc.get('enters', []))
    slept = sl['d'] > d
    check('[night] K1 演完以後回宿舍睡：午夜前進了宿舍或睡到隔天（不是留在普通教學館）【舊版應 FAIL】', bool(sd) and (dorm_before_midnight or slept),
          J({'dorm_enter': dorm_before_midnight, 'slept': slept, 'final': [sl['zone'], sl['d'], hhmm(sl['h'])]}))
    check('[night] K2 出現「晚上的時間用完了，回去睡覺。」【舊版應 FAIL】', bool(eve_toasts(cc)), J(eve_toasts(cc)))
    check('[night] K3 最後不是「那一天、還在普通教學館」【舊版應 FAIL】', not (sl['zone'] == 'putong' and sl['d'] == d), J({'zone': sl['zone'], 'd': sl['d'], 'h': hhmm(sl['h'])}))
    json.dump({'timeline': tl, 'cc': cc, 'done': sd, 'last': sl}, open(os.path.join(OUT, 'night.json'), 'w'), ensure_ascii=False, indent=1)


async def stay_case(pg, cdp, tag, d, load_h, plan, desc, errs, label):
    await load(pg, cdp, d, load_h, {}, desc)
    if plan['ev'] == 'ev_cc_bgn_t':
        await pg.evaluate(INJECT_JS); setup('注入測試事件 ev_cc_bgn_t（trigger outing、3.5 小時、一句旁白）')
    r = await pg.evaluate(PLAN_JS, plan); setup('手動排出遊 OUT.plan %s → %s' % (J(plan), J(r)))
    s0 = await pg.evaluate(ST, plan['id']); info('[%s] 出發前' % tag, J({k: s0[k] for k in ('zone', 'd', 'h', 'slots')}))
    tl, sd, sl, picked = await play(pg, cdp, tag, plan['id'], d, min(SETTLE, 40))
    cc = await pg.evaluate(CC_JS)
    await pg.screenshot(path=os.path.join(OUT, '%s_final.png' % tag))
    check('[%s] 出發、演完' % tag, any(p.startswith('出發') for p in picked) and bool(sd), J({'picked': picked, 'done': sd and [sd['zone'], sd['d'], hhmm(sd['h'])]}))
    info('[%s] 演完那一刻' % tag, J(sd and {'zone': sd['zone'], 'd': sd['d'], 'h': hhmm(sd['h']), 'jump': sd['jump'], 'slots': sd['slots']}))
    info('[%s] 換區域（GAME.enter）' % tag, J(cc.get('enters')))
    info('[%s] toast' % tag, J(cc.get('toasts')))
    info('[%s] caption' % tag, J(cc.get('caps')))
    info('[%s] 最後' % tag, J({'zone': sl['zone'], 'd': sl['d'], 'h': hhmm(sl['h'])}))
    dorm = [e for e in cc.get('enters', []) if e.get('zone') == 'dorm']
    check('[%s] %s：演完回到普通教學館、沒有被拉回宿舍、日子沒變' % (tag, label), bool(sd) and sd['zone'] == 'putong' and not dorm and sl['zone'] == 'putong' and sl['d'] == d,
          J({'done_zone': sd and sd['zone'], 'dorm': dorm, 'final': [sl['zone'], sl['d'], hhmm(sl['h'])]}))
    check('[%s] 沒有「晚上的時間用完了，回去睡覺。」' % tag, not eve_toasts(cc), J(eve_toasts(cc)))
    info('[%s] 演完以後還能走（搖桿 ≥0.3 m）' % tag, '%s m' % (await moved_ok(pg, cdp)))
    json.dump({'timeline': tl, 'cc': cc, 'done': sd, 'last': sl}, open(os.path.join(OUT, '%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    return sd, sl


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not check('遊戲載入', await L.wait_loaded(pg), ''):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); return
        has = await pg.evaluate("({BGN:typeof BGN!=='undefined', OUT:typeof OUT!=='undefined', CLS:typeof CLS!=='undefined', queueJump:typeof CLS!=='undefined'&&!!CLS.queueJump, eveSleep:typeof CLS!=='undefined'&&!!CLS.eveSleep, putong:!!(Z3&&Z3.ZONES&&Z3.ZONES.putong)})")
        info('這一版有的東西', J(has))
        D = await pg.evaluate(DAYS_JS % NIGHT_IDX)
        info('日子', J(D))
        for c in CASES:
            print('===== %s =====' % c, flush=True)
            e0 = len(errs)
            try:
                if c == 'night':
                    await case_night(pg, cdp, D, errs)
                elif c == 'day':
                    sd, sl = await stay_case(pg, cdp, 'day', D['sat'], 12.88, {'id': 'cc_bgn_day', 'ev': 'ev_cc_bgn_t', 'day': D['sat'], 'h': 13, 'place': '日常失速', 'title': '白天的出遊（測試）', 'travel': '', 'travelH': 0},
                                             '週六 12:53', errs, '①白天的出遊照舊回原地')
                    info('[day] 演完以後有沒有照 ACTION-BUDGET 跳到 18:00（新版應該會跳、舊版不會；不判）', J({'final_h': hhmm(sl['h'])}))
                elif c == 'eve':
                    await stay_case(pg, cdp, 'eve', D['sat'], 14.72, {'id': 'cc_bgn_eve', 'ev': 'ev_cc_bgn_t', 'day': D['sat'], 'h': 14 + 50 / 60, 'place': '日常失速', 'title': '傍晚的出遊（測試）', 'travel': '', 'travelH': 0},
                                    '週六 14:43', errs, '②晚上那一次還沒用（14:50～18:20）')
                elif c == 'exam':
                    if D.get('exam') is None:
                        check('[exam] 前置：找到 Y1S1 考試週的週五', False, J(D['info'])); continue
                    info('[exam] 考試週那一天', J(D['info']['exam']))
                    await stay_case(pg, cdp, 'exam', D['exam'], 19.55, {'id': 'bgn_cc_exam', 'ev': 'ev_bgnight', 'day': D['exam'], 'h': 20, 'late': 0.5, 'place': '日常失速', 'title': '桌遊夜（日常失速）', 'travel': '走過去約 15 分鐘', 'travelH': 0.25},
                                    '考試週週五 19:33', errs, '②考試週晚上還能多自習一次（20:00～23:30）')
                else:
                    info('不認得的 CASE', c)
            except Exception as ex:
                check('[%s] 探針沒有例外' % c, False, repr(ex)[:300])
                try: await pg.screenshot(path=os.path.join(OUT, 'EXC_%s.png' % c))
                except Exception: pass
            check('[%s] 沒有 JS 例外' % c, len(errs) == e0, J(errs[e0:e0 + 3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)

asyncio.run(main())
