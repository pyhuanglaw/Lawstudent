"""CC（帳號 A）11-02：長時間真實玩家流程探針——從標題畫面開新遊戲，照玩家速度一天一天過一學期（給 cc-local：Windows、有 GPU、約 20 fps，跑 2～4 小時）。
規則（docs/TESTING.md、D34）：不用 ?turbo、不瞬移、不改劇情狀態、不讀做好的存檔。唯一的前置是開頭的 localStorage.clear()（乾淨玩家）【前置】。
玩家的操作只用遊戲本身給玩家的功能：
  標題「從法律系開始」（ROUTE tw；START=econ 改按「從經濟系開始」）→ 劇情對話點過去、選項一律選第一個（沒變暗的；記下來）
  → 有課：起床選單的「直接去上課」（第一個選項）或手機「今天」的「直接去上課」（CLS.goClass）→ 上課劇情照演、考卷一律選第一個選項（記分數）
  → 沒課／上完：手機「地點」回宿舍（快速前往）→ 白天在床選「睡到傍晚」→ 晚上（17:30 以後）先用選單存到欄位 1、重新整理頁面、
    標題「讀取」欄位 1 讀回來比對 → 床選「睡到明天…」。週末、放假一樣。
  手機自己跳出來（要回覆的訊息）：按第一個回覆鍵、收起來。同一個選單連續出現 LOOP_N 次（預設 6）＝選第一個會繞圈：改選下一個（記成 loop-break）。
沒有其他捷徑；如果用到會印「[前置／捷徑]」並列在 summary.json 的 shortcuts。
每天的檢查（run.check）：
  1 存讀檔一致：選單存檔前的 GAME.snapshot() ＝欄位 1 的內容（day、hour±0.05、zone、pos、flags 每一個鍵、出席 courses.attend、done／abs／late 數、考試紀錄）；
    重新整理 → 標題「讀取」欄位 1 → 讀進來那一刻的 GAME.G ＝欄位 1（同上，hour±0.01）；讀完空下來以後 day、zone、出席、考試紀錄不變（flags 有變只記 note）
  2 GAME.walkFallbacks 維持 0（重新整理會歸零：累計）
  3 沒有 JS 例外（pageerror、console error 分開記；console error 只記不判，pageerror 判）
  4 不卡住：同一個狀態（day、hour 變化 < 0.01、畫面上的字、選項、忙碌…都沒變）超過 STUCK_S 秒＝FAIL，截圖、記狀態，然後嘗試恢復
    （收面板、點對話框、點腳邊的地面、有課就再按一次「直接去上課」）；恢復以後 STUCK_S 秒還是不動＝結束、FAIL
  5 每天一行摘要（stdout 的「DAY」行＋summary.json）：日期、星期、學期週、每一堂課的狀態（上過／遲到／缺席／沒去）、事件 id、PG 步驟、選項、存讀檔結果、考試分數、耗時
輸出：<輸出>/summary.json（每天一列＋總結）、transcript.jsonl（每天一行：台詞、選項、事件）、每 7 天一張截圖、卡住／例外的截圖。
DAYS＝玩家「自己過完」的天數（那一天有空下來、做了晚上的存讀檔＋上床；開場劇情一路跳過的日子列在摘要、不算）。
  法律系開局：8/22～24 宿營、8/29 搬宿舍以後才開始算；112 天大約到 12 月下旬（期末考週在 1 月：要包含期末考請用 UNTIL=YYYY-MM-DD 或加大 DAYS，開頭會印考試日期）。
環境變數：DAYS（112）、UNTIL（不設）、STUCK_S（不設＝量幀率：每秒 5 格以上 300、以下 900）、TRIP_MAX（一趟上課，1800）、DAY_MAX_S（一天的真實秒數上限，7200）、
  LOOP_N（6）、SAVE_CHECK（1；0＝不做每天的存讀檔）、SHOT_EVERY（7）、ROUTE（tw；makeup 還沒做＝FAIL）、START（law／econ，預設 law）、LW_TESTS（playlib 的資料夾，預設 repo 的 tests/）、SHA。
用法：python3 cc_flow_semester_probe.py '<URL>/index.html' <輸出資料夾>（不要加 ?turbo）。最後一行 ALL PASS／FAILED: ...，exit 0／1。
不是 iPhone：Playwright 手機橫向模擬（is_mobile、觸控）。"""
import os, sys, json, asyncio, re, time, traceback
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(REPO, 'tests')); import playlib as L
sys.path.insert(0, os.path.dirname(HERE)); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
DAYS = ENVI('DAYS', 112); UNTIL = os.environ.get('UNTIL', '').strip() or None
TRIP_MAX = ENVI('TRIP_MAX', 1800); DAY_MAX_S = ENVI('DAY_MAX_S', 7200); LOOP_N = ENVI('LOOP_N', 6)
SAVE_CHECK = ENVI('SAVE_CHECK', 1); SHOT_EVERY = ENVI('SHOT_EVERY', 7)
ROUTE = os.environ.get('ROUTE', 'tw').strip() or 'tw'; START = os.environ.get('START', 'law').strip() or 'law'
STUCK_S = int(os.environ['STUCK_S']) if os.environ.get('STUCK_S') else None
SHORTCUTS = []
ROWBUF = []   # 重新整理以前先把當天的紀錄收起來

if '?turbo' in URL or '&turbo' in URL: raise SystemExit('真實流程不能用 ?turbo')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


def setup(run, s):
    SHORTCUTS.append(s); run.setup(s)


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__FSH) return 'again'; window.__FSH=1; window.__FS=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__FS.push(o); if(window.__FS.length>6000) window.__FS.splice(0,3000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',t:String(a||'')+' '+String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z){ push({k:'enter',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'&&CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it){ push({k:'attend',t:(it&&it.key)||''}); const r=await a0.apply(this,arguments);
      try{ push({k:'attended',t:it.key,ok:!!CLS.rec(GAME.G).done[it.key]}); }catch(e){} return r; }; }
  if(typeof PG!=='undefined'&&PG.runStep){ const r0=PG.runStep; PG.runStep=async function(GM,s){ push({k:'step',t:String(s&&s.id)}); return r0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  return 'ok'; })()"""
TAKE = "(()=>{ const a=window.__FS||[]; window.__FS=[]; return a; })()"

STATE = r"""(()=>{ const G=GAME.G; if(!G) return null; let t=null, items=[], gl=[], homeAt=false;
  try{ t=CALENDAR.termOf(G.day); }catch(e){}
  try{ const R=CLS.rec(G); items=CLS.dayItems(G).filter(it=>!CLS.storyClass(G,it)).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,t0:it.t0,exam:it.exam||null,st:CLS.status(G,it),done:!!R.done[it.key],late:!!R.late[it.key],abs:!!R.abs[it.key],skip:!!(R.note&&R.note['plan_skip_'+it.key])}));
    gl=CLS.goList(G).filter(it=>!R.done[it.key]&&!(R.note&&R.note['plan_skip_'+it.key])).map(it=>it.key); }catch(e){}
  try{ homeAt=!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)); }catch(e){}
  return {key:CALENDAR.dateOf(G.day).key, wd:CALENDAR.dateOf(G.day).wd, day:G.day, h:+(+G.hour).toFixed(3), zone:G.zone, stage:G.stage||null, term:t&&t.id, week:t&&t.week, exam:t&&t.exam||null,
    hol:!!(CALENDAR.holiday&&CALENDAR.holiday(G.day)), items, gl, homeAt, fb:GAME.walkFallbacks|0, money:G.money,
    title:!document.getElementById('titleScreen').classList.contains('hide')}; })()"""
EXAMS = r"""(()=>{ try{ const R=CLS.rec(GAME.G), o={}; for(const k in (R.exam||{})){ const v=R.exam[k]; o[k]={status:v.status,correct:v.correct,score:v.score}; } return o; }catch(e){ return {}; } })()"""
TERMINFO = r"""(()=>{ try{ const G=GAME.G, out={}; for(const id of ['Y1S1','Y1S2']){ const L=CLS.examList(G,id)||[]; out[id]=L.map(e=>({c:e.c.name,kind:e.kind,date:CALENDAR.dateOf(e.day).key})); }
  const t=CALENDAR.termOf(G.day); return {now:CALENDAR.dateOf(G.day).key, term:t&&t.id, week:t&&t.week, exams:out}; }catch(e){ return {err:String(e.message)}; } })()"""
# 存讀檔比對的欄位（s＝存檔物件；沒給＝GAME.G）
KEYF = r"""(s=>{ const G=s||GAME.G; const C=G.courses||{}; const ex={}; for(const k in (C.exam||{})){ const v=C.exam[k]; ex[k]=[v.status,v.correct,v.score]; }
  return {day:G.day,hour:+(+G.hour).toFixed(3),zone:G.zone,stage:G.stage||null,money:G.money,home:!!(G.home&&G.home.at),
    pos:G.pos?{x:+(+G.pos.x).toFixed(2),z:+(+G.pos.z).toFixed(2),lv:G.pos.lv|0}:null,flags:G.flags||{},attend:C.attend||{},
    done:Object.keys(C.done||{}).length,abs:Object.keys(C.abs||{}).length,late:Object.keys(C.late||{}).length,exam:ex,evDone:Object.keys((G.events||{}).done||{}).length}; })"""
MUST = "(()=>{ try{ return !!(PHONE.mustOpen&&PHONE.mustOpen(GAME.G)); }catch(e){ return false; } })()"
Q_RE = re.compile(r'^([1-5])／5　')
SKIP_FIRST = ('快轉', '存檔')   # 系統選單裡不當作「第一個選項」的（快轉＝跳過整段生活、存檔另外做）


def diff_keyf(a, b, htol):
    """兩份 KEYF 的差異（list of str）"""
    out = []
    for k in ('day', 'zone', 'stage', 'money', 'home', 'done', 'abs', 'late', 'evDone'):
        if a.get(k) != b.get(k): out.append('%s %s→%s' % (k, J(a.get(k)), J(b.get(k))))
    if abs(float(a.get('hour') or 0) - float(b.get('hour') or 0)) > htol: out.append('hour %s→%s' % (a.get('hour'), b.get('hour')))
    pa, pb = a.get('pos') or {}, b.get('pos') or {}
    if pa and pb and (abs(pa['x'] - pb['x']) > 0.5 or abs(pa['z'] - pb['z']) > 0.5 or pa['lv'] != pb['lv']): out.append('pos %s→%s' % (J(pa), J(pb)))
    for grp in ('attend', 'exam', 'flags'):
        A, B = a.get(grp) or {}, b.get(grp) or {}
        for k in sorted(set(A) | set(B)):
            if J(A.get(k)) != J(B.get(k)): out.append('%s.%s %s→%s' % (grp, k, J(A.get(k))[:80], J(B.get(k))[:80]))
    return out


# ---------------------------------------------------------------- 玩家操作
async def tap_choice(pg, cdp, k):
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900)


async def phone_unblock(pg, cdp, run):
    """手機自己跳出來：有要回覆的就按第一個回覆鍵，再收起來"""
    asks = []
    if await pg.evaluate(MUST):
        if not await pg.evaluate("!!document.querySelector('#phoneBody [data-ask]')") and await pg.evaluate("!!document.querySelector('#phoneBody [data-th]')"):
            await L.tap(pg, cdp, '#phoneBody [data-th]'); await pg.wait_for_timeout(800)
        asks = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-ask]')].map(b=>(b.textContent||'').trim())")
        if asks: await L.tap(pg, cdp, '#phoneBody [data-ask]'); await pg.wait_for_timeout(1200)
    await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    return asks


class Driver:
    """對話點過去；選項一律第一個（沒變暗、不是快轉／存檔）；同一個選單繞圈 LOOP_N 次改選下一個；考卷第一個選項。全部記在 self.picks"""
    def __init__(self, pg, cdp, run):
        self.pg, self.cdp, self.run = pg, cdp, run; self.picks = []; self.seen = {}; self.exam_ans = []

    def reset_day(self):
        self.picks = []; self.seen = {}; self.exam_ans = []

    async def handle(self, s, prefer=()):
        pg, cdp, run = self.pg, self.cdp, self.run
        if s['ch']:
            T = [o['t'] for o in s['ch']]; live = [i for i, o in enumerate(s['ch']) if not o['dim']] or list(range(len(T)))
            k = None; why = 'first'
            for p in prefer:
                k = next((i for i in live if T[i].startswith(p)), None)
                if k is not None: why = 'prefer'; break
            if k is None:
                cand = [i for i in live if not T[i].startswith(SKIP_FIRST)] or live
                sig = ((s['txt'] or '')[:40], tuple(T)); n = self.seen.get(sig, 0); self.seen[sig] = n + 1
                k = cand[min(n // LOOP_N, len(cand) - 1)] if n >= LOOP_N else cand[0]
                if n >= LOOP_N: why = 'loop-break'
            q = Q_RE.match(s['txt'] or '')
            if q: self.exam_ans.append({'q': int(q.group(1)), 'text': (s['txt'] or '')[:60], 'opts': T, 'pick': k})
            c = await P.clock(pg)
            self.picks.append({'d': c['key'], 'h': hm(c['h']), 'z': c['zone'], 'opts': T, 'pick': T[k], 'why': why, 'q': (s['txt'] or '')[:50]})
            if why == 'loop-break': run.note('同一個選單第 %d 次（%s）：改選「%s」' % (self.seen[((s['txt'] or '')[:40], tuple(T))], J([t[:20] for t in T]), T[k][:30]))
            await tap_choice(pg, cdp, k); return True
        if s['phone'] and not s['dlg']:
            asks = await phone_unblock(pg, cdp, run)
            if asks: self.picks.append({'d': s['day'], 'h': hm(s['h']), 'z': s['zone'], 'opts': asks, 'pick': asks[0], 'why': 'phone-reply'})
            return True
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); return True
        return False


def is_free(s):
    return not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']


async def quick_go(pg, cdp, run, zone):
    """手機「地點」→ 那一區（玩家的快速前往）"""
    await P.phone_tab(pg, cdp, 'places')
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    if not c: await L.close_panels(pg, cdp); run.note('手機「地點」沒有 %s' % zone); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(120):
        await pg.wait_for_timeout(1000)
        s = await P.ts(pg)
        if s['zone'] == zone or s['dlg'] or s['ch']: break
    return (await P.ts(pg))['zone'] == zone


async def bed(pg, cdp, run, drv, prefixes, tag):
    """走到床、按互動、在床的選單選 prefixes 的第一個符合的"""
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()")
    if not it: run.note('%s：這一區找不到床' % tag); return None
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=300, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    for _ in range(12):
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: break
        await pg.wait_for_timeout(600)
    s = await P.ts(pg)
    if not s['ch']: run.note('%s：按了床沒有選單（%s）' % (tag, J({k: s[k] for k in ('dlg', 'txt', 'lab')}))); return None
    ops = [o['t'] for o in s['ch']]
    await drv.handle(s, prefixes)
    run.note('%s：床的選單 %s → %s' % (tag, J([o[:24] for o in ops]), drv.picks[-1]['pick'] if drv.picks else '?'))
    return ops


async def trip(pg, cdp, run, drv, key, stuck_s):
    """手機「今天」→ 那一堂的「直接去上課」→ 照演到上完、空下來"""
    out = {'key': key, 'ok': False}
    await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % key
    out['btn'] = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
    if not out['btn']: await L.close_panels(pg, cdp); run.note('手機「今天」沒有 %s 的按鈕' % key); return out
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time(); day0 = (await P.clock(pg))['day']
    while time.time() - t0 < TRIP_MAX:
        s = await P.ts(pg)
        done = await pg.evaluate("(k=>{ try{ return !!CLS.rec(GAME.G).done[k]; }catch(e){ return false; } })", key)
        if done and is_free(s): out['ok'] = True; break
        if s['day'] != day0: out['jumped'] = True; break
        sig = (s['day'], round(s['h'], 2), s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'])
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > stuck_s: out['stuck'] = await P.clock(pg); break
        if await drv.handle(s): continue
        if is_free(s) and not done:
            st = await pg.evaluate("(k=>{ try{ const G=GAME.G; const it=CLS.dayItems(G).find(x=>x.key===k); return it?CLS.status(G,it):'gone'; }catch(e){ return 'err'; } })", key)
            if st not in ('open', 'upcoming'): out['status'] = st; break   # 沒去成（遲到太多、錯過）：不再等
        await pg.wait_for_timeout(800)
    out['done'] = await pg.evaluate("(k=>{ try{ return !!CLS.rec(GAME.G).done[k]; }catch(e){ return false; } })", key)
    out['end'] = await P.clock(pg); out['secs'] = round(time.time() - t0)
    run.note('上課 %s：%s' % (key, J(out)))
    return out


# ---------------------------------------------------------------- 存讀檔（選單存欄位 1 → 重新整理 → 標題「讀取」欄位 1）
async def save_reload_check(pg, cdp, run, tag, fb_acc):
    res = {'ok': False}
    await L.close_panels(pg, cdp)
    pre = await pg.evaluate("(()=>{ const s=GAME.snapshot(); return (%s)(s); })()" % KEYF)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '.tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
    c = await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>(x.querySelector('b')||{}).textContent==='欄位 1'); const b=it&&[...it.querySelectorAll('button')].find(x=>x.textContent==='存檔'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
    if not c: res['err'] = '選單裡找不到欄位 1 的「存檔」'; await L.close_panels(pg, cdp); return res
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500)
    raw = await pg.evaluate("localStorage.getItem('fatiao3d_slot_1')")
    if not raw: res['err'] = '欄位 1 是空的'; await L.close_panels(pg, cdp); return res
    slot = await pg.evaluate("(r=>(%s)(JSON.parse(r)))" % KEYF, raw)
    d1 = diff_keyf(pre, slot, 0.05); res['pre_vs_slot'] = d1
    fb_acc[0] += await pg.evaluate("GAME.walkFallbacks|0")
    ROWBUF.extend(await pg.evaluate(TAKE))
    await pg.reload()
    if not await L.wait_loaded(pg, 600): res['err'] = '重新整理後載入逾時'; return res
    await P.init(pg); await pg.evaluate(HOOK)
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
    c = await pg.evaluate("(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>(x.querySelector('b')||{}).textContent==='欄位 1'); const b=it&&[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
    if not c: res['err'] = '標題「讀取」找不到欄位 1'; return res
    await L.touch_tap(cdp, c[0], c[1])
    imm = None
    for _ in range(1800):   # 讀進來那一刻（applySave 換掉 G）
        imm = await pg.evaluate("(()=>{ const G=GAME.G; if(!G||G.day!==%d||!document.getElementById('titleScreen').classList.contains('hide')) return null; return (%s)(G); })()" % (slot['day'], KEYF))
        if imm: break
        await pg.wait_for_timeout(100)
    if not imm: res['err'] = '讀檔以後 GAME.G 沒換成欄位 1'; return res
    d2 = diff_keyf(slot, imm, 0.01); res['slot_vs_load'] = d2
    t0 = time.time(); free_since = None
    while time.time() - t0 < 300:   # 讀完、空下來 3 秒
        s = await P.ts(pg)
        if s['phone'] and not s['dlg']: await phone_unblock(pg, cdp, run)
        if is_free(s):
            free_since = free_since or time.time()
            if time.time() - free_since > 3: break
        else: free_since = None
        await pg.wait_for_timeout(500)
    settled = await pg.evaluate("(()=>{ const s=GAME.snapshot(); return (%s)(s); })()" % KEYF)
    d3 = [x for x in diff_keyf(slot, settled, 0.5) if not x.startswith(('flags.', 'pos ', 'evDone'))]
    res['settled_core'] = d3; res['settled_flags'] = [x for x in diff_keyf(slot, settled, 0.5) if x.startswith('flags.')]
    res['ok'] = not d1 and not d2 and not d3
    res['when'] = {'day': slot['day'], 'h': slot['hour'], 'zone': slot['zone']}
    return res


# ---------------------------------------------------------------- 主迴圈
async def main():
    run = L.Run('flow_semester_%s' % ROUTE, OUT); os.makedirs(OUT, exist_ok=True)
    if ROUTE != 'tw':
        run.check('ROUTE=%s 還沒做（目前只有 tw）' % ROUTE, False); sys.exit(run.finish())
    summary = {'sha': os.environ.get('SHA', '?'), 'url': URL, 'route': ROUTE, 'start': START, 'days_target': DAYS, 'until': UNTIL, 'days': [], 'shortcuts': SHORTCUTS}
    tr = open(os.path.join(OUT, 'transcript.jsonl'), 'w', encoding='utf-8')
    cons = []
    T_ALL = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        pg.on('console', lambda m: cons.append(m.text[:300]) if m.type == 'error' else None)
        try:
            await pg.goto(URL)
            run.check('遊戲載入', await L.wait_loaded(pg, 600))
            await pg.evaluate("localStorage.clear()"); setup(run, '[前置] localStorage.clear()（乾淨的玩家，沒有舊存檔）')
            await P.init(pg)
            f0 = await pg.evaluate("GAME.E.frame|0"); t0 = time.time(); await pg.wait_for_timeout(10000)
            fps = ((await pg.evaluate("GAME.E.frame|0")) - f0) / max(0.1, time.time() - t0)
            stuck_s = STUCK_S or (300 if fps >= 5 else 900)
            summary['fps_title'] = round(fps, 2); summary['stuck_s'] = stuck_s
            run.note('標題畫面幀率 %.2f 格／秒 → STUCK_S %d 秒' % (fps, stuck_s))
            await run.shot(pg, 'title')
            btn = '#btnNewLaw' if START == 'law' else '#btnNew'
            run.check('標題畫面有 %s（%s）' % (btn, START), await L.tap(pg, cdp, btn))
            for _ in range(240):
                if await pg.evaluate("!!(GAME.G&&document.getElementById('titleScreen').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            await pg.evaluate(HOOK)
            drv = Driver(pg, cdp, run)
            fb_acc = [0]
            counted = 0; row = None; last = None; since = time.time(); stuck_n = 0; recovering = False
            tried = set(); slept_day = None; saved_day = None; ended = None; term_logged = False
            first_free = False

            async def close_row(row, why):
                rows = ROWBUF + await pg.evaluate(TAKE); ROWBUF.clear()
                st = await pg.evaluate(STATE) or {}
                exams = await pg.evaluate(EXAMS)
                new_ex = {k: v for k, v in exams.items() if J(v) != J(row['exam0'].get(k))}
                fb = fb_acc[0] + (st.get('fb') or 0)
                row.update(end_clock={'key': st.get('key'), 'h': hm(st.get('h')), 'zone': st.get('zone')}, why_end=why,
                           secs=round(time.time() - row['t0']), events=[r['t'] for r in rows if r['k'] == 'ev'], steps=[r['t'] for r in rows if r['k'] == 'step'],
                           cards=[r['t'] for r in rows if r['k'] == 'card'], attended=[[r['t'], r.get('ok')] for r in rows if r['k'] == 'attended'],
                           picks=[[x['h'], x['pick'][:40], x['why']] for x in drv.picks], exams_new=new_ex, exam_answers=drv.exam_ans, walkFallbacks=fb,
                           pageerrors=len(errs) - row['err0'], console_errors=len(cons) - row['con0'])
                row.pop('exam0', None); t0r = row.pop('t0', None); row.pop('err0', None); row.pop('con0', None)
                tr.write(J({'date': row['date'], 'rows': rows, 'picks': drv.picks}) + '\n'); tr.flush()
                summary['days'].append(row)
                cls = '、'.join('%s %s%s' % (hm(it['t0']), it['name'], '（' + ('上過' if it['done'] and not it['abs'] and not it['late'] else '遲到' if it['late'] else '缺席' if it['abs'] else '翹課' if it['skip'] else it['st']) + '）') for it in row.get('items_end') or []) or '沒課'
                print('DAY %s（%s %s週）%s｜課：%s｜事件 %s｜選項 %d｜存讀檔 %s｜考試 %s｜fallback %d｜pageerror %d｜%d 秒' % (
                    row['date'], '一二三四五六日'[(row.get('wd') or 7) - 1] if row.get('wd') else '?', row.get('week') or '-', '【算】' if row['counted'] else '【劇情帶過】', cls,
                    J(row['events'][:8]), len(drv.picks), (row.get('save') or {}).get('ok', '-'), J({k: v.get('correct') for k, v in new_ex.items()}), fb, row['pageerrors'], row['secs']), flush=True)
                if row['counted']:
                    run.check('%s：walkFallbacks 維持 0' % row['date'], fb == 0, 'walkFallbacks=%d' % fb)
                    run.check('%s：沒有 JS 例外（pageerror）' % row['date'], row['pageerrors'] == 0, J(errs[-3:]))
                drv.reset_day()

            while True:
                s = await P.ts(pg); st = await pg.evaluate(STATE)
                if not st: await pg.wait_for_timeout(1000); continue
                # ---- 換日 ----
                if row is None or st['key'] != row['date']:
                    if row is not None:
                        await close_row(row, 'day change')
                        if row['counted']: counted += 1
                        if counted and SHOT_EVERY and counted % SHOT_EVERY == 0 and row['counted']: await run.shot(pg, 'week_%s' % st['key'])
                    if counted >= DAYS or (UNTIL and st['key'] > UNTIL): ended = 'days reached'; row = None; break
                    row = {'date': st['key'], 'wd': st['wd'], 'term': st['term'], 'week': st['week'], 'hol': st['hol'], 'counted': False, 't0': time.time(),
                           'exam0': await pg.evaluate(EXAMS), 'err0': len(errs), 'con0': len(cons), 'items_start': st['items']}
                    tried = set()
                    if not term_logged and st['term']:
                        term_logged = True; ti = await pg.evaluate(TERMINFO); summary['terminfo'] = ti; run.note('學期與考試日期：%s' % J(ti))
                row['items_end'] = st['items']
                if time.time() - row['t0'] > DAY_MAX_S:
                    run.check('%s：一天在 DAY_MAX_S（%d 秒）內過完' % (row['date'], DAY_MAX_S), False, J(st)); await run.shot(pg, 'daymax_%s' % row['date']); ended = 'day max'; break
                # ---- 卡住 ----
                sig = (st['day'], round(st['h'], 2), st['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, s['phone'])
                if sig != last: last = sig; since = time.time(); recovering = False
                elif time.time() - since > stuck_s:
                    snap = {'clock': st, 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone', 'lab')}, 'ch': s['ch']}
                    shot = await run.shot(pg, 'stuck_%s_%s' % (st['key'], hm(st['h']).replace(':', '')))
                    if recovering:
                        run.check('%s %s：卡住以後恢復得了' % (st['key'], hm(st['h'])), False, J(snap)); ended = 'stuck'; break
                    stuck_n += 1; recovering = True; since = time.time()
                    run.check('%s %s：沒有卡住（同一個狀態 %d 秒）' % (st['key'], hm(st['h']), stuck_s), False, J(snap) + ' ' + shot)
                    row.setdefault('stuck', []).append(snap)
                    await L.close_panels(pg, cdp)
                    if s['dlg']: await L.tap(pg, cdp, '#dlg')
                    try:
                        pp = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z,GAME.E.player.lv|0]; })()")
                        await L.tap_ground(pg, cdp, pp[0] + 1.0, pp[1], lv=pp[2])
                    except Exception as e: run.note('恢復：點地面失敗 %r' % e)
                    if st['gl']: tried.discard(st['gl'][0])
                    continue
                # ---- 對話、選項、手機 ----
                if await drv.handle(s): continue
                if not is_free(s): await pg.wait_for_timeout(800); continue
                if not first_free:
                    first_free = True; run.note('第一次空下來：%s' % J({k: st[k] for k in ('key', 'h', 'zone', 'term', 'week', 'stage')})); await run.shot(pg, 'first_free_%s' % st['key'])
                await pg.wait_for_timeout(1600)   # 起床選單、下課選單要空下來 1.5 秒才出：先讓遊戲出
                s = await P.ts(pg)
                if not is_free(s): continue
                st = await pg.evaluate(STATE)
                # ---- 有課：手機「今天」直接去上課 ----
                gl = [k for k in st['gl'] if k not in tried]
                if gl:
                    tried.add(gl[0]); row.setdefault('trips', []).append(await trip(pg, cdp, run, drv, gl[0], stuck_s)); since = time.time(); continue
                # ---- 在家（臺北的家）：照選單（第一個）；沒有選單就等 ----
                if st['homeAt']: await pg.wait_for_timeout(1500); continue
                # ---- 回宿舍 ----
                if st['zone'] != 'dorm':
                    ok = await quick_go(pg, cdp, run, 'dorm'); run.note('%s %s 手機「地點」回宿舍：%s' % (st['key'], hm(st['h']), ok))
                    if not ok: await pg.wait_for_timeout(3000)
                    continue
                h = st['h']
                if h < 17.5 and h >= 5:
                    await bed(pg, cdp, run, drv, ('睡到傍晚',), '%s %s 白天' % (st['key'], hm(h))); continue
                # ---- 晚上：存讀檔（每天一次）→ 睡到明天 ----
                if SAVE_CHECK and saved_day != st['key']:
                    saved_day = st['key']
                    try: res = await save_reload_check(pg, cdp, run, st['key'], fb_acc)
                    except Exception as e: res = {'ok': False, 'err': repr(e)[:300]}
                    row['save'] = res
                    run.check('%s：選單存到欄位 1、重新整理、標題讀取欄位 1，day／hour／zone／flags／出席一致' % st['key'], res.get('ok'), J(res)[:900])
                    since = time.time(); last = None; continue
                row['counted'] = True
                await bed(pg, cdp, run, drv, ('睡到明天', '睡一下（', '睡覺'), '%s %s 晚上' % (st['key'], hm(h)))
                since = time.time()
        except Exception as e:
            run.check('跑完（沒有探針例外）', False, repr(e)[:500]); traceback.print_exc(); ended = 'exception'
            try: await run.shot(pg, 'exception')
            except Exception: pass
        try:
            if row is not None and 'date' in row: await close_row(row, ended or '?')
        except Exception as e: run.note('最後一天的摘要失敗 %r' % e)
        counted_days = [d for d in summary['days'] if d['counted']]
        summary.update(ended=ended, counted=len(counted_days), real_secs=round(time.time() - T_ALL), pageerrors=errs[:20], console_errors=cons[:40],
                       console_error_n=len(cons), walkFallbacks=fb_acc[0])
        run.check('過完 %d 天（實際 %d 天，結束原因 %s）' % (DAYS, len(counted_days), ended), len(counted_days) >= DAYS or (UNTIL is not None and ended == 'days reached'), '')
        run.check('整段沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
        run.note('console error %d 則（只記不判）：%s' % (len(cons), J(cons[:5])))
        try: await run.shot(pg, 'end')
        except Exception: pass
        summary['fails'] = run.fails
        with open(os.path.join(OUT, 'summary.json'), 'w', encoding='utf-8') as f: json.dump(summary, f, ensure_ascii=False, indent=1)
        tr.close()
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'ROUTE', ROUTE, 'DAYS', DAYS, '前置／捷徑：', J(SHORTCUTS), flush=True)
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
