"""CC（帳號 A）11-02：#14 BUG-DELAY-RETAKE-SKIP-1102「延畢大五上，畢業後篇跳日期要停在重修課前」的瀏覽器探針。
受測＝開發分支 5506d6259（src/faildelay3d.js 的 FD.clsStop 加進 PG.stops：延畢大五上還不到三堂的重修，下一堂上課前 45 分鐘當停點；
  src/y5s1_3d.js 的 Y5.homeOpts 給家裡選單「直接去上課：重修：<課名>」，手機「今天」給「直接去上課」按鈕（人在家不放，game3d.js data-y5go））。
修改前基準＝5b40dad61：預期 dorm_sleep／dorm_stand／home 的「停在 9/5（三）08:25」FAIL（9/2 一跳就到 12/14，中間沒機會上課）；control_skip 的 9/12、9/19 也 FAIL。
Node 證據：docs/story_planning/test_tools/cc/n14_delay_retake.js（9/2 22:00 跳日期第一個停點 2029-09-05（三）08:25；上滿三堂不再停）。

讀碼看到的（5506d6259）：
  FD.items：延畢的課（FAIL_DELAY_COURSES ['maritime']）在大五上（CALENDAR.termOfDelayed，9/3～12/23）每週一堂，label「重修：海商法與海洋法」（FD.cname 去掉「（重修）」），
    key＝'<日>:maritime'，fd:true；上課有沒有去記在 G.y5.cls[key]（FD.attended 數這個）；海商法的時段＝週三上午（9:10–12:10）。
  Y5.status：上課前 1 小時起 open、下課前 15 分鐘以後 missed；FD.clsStop＝下一堂 t0-0.75（08:25）。
  畢業後篇（PG.on）站著不動 2 秒＝PG.advance 跳到下一個停點（jumpTo 不換場景；字卡 PG.dateLabel）；在家（HOME.at）PG.tick 不跑、「睡覺」＝HOME.sleep → PG.sleepJump → PG.advance。
  住處：MOVED_OUT（6/28 退宿）＋HOME_AFTER 'home'＝HOME.pgHome：住臺北的家（2D 家裡的選單，沒有 3D 房間）；3D 世界裡宿舍門口變成「看宿舍門口」（門禁卡已經還了），
    凌晨在外面＝STORY.forceHome 回家。所以「宿舍的床」在 9/2 已經不存在：
      dorm_sleep 預設（SLEEP_AT=home）＝住處（臺北的家）的「睡覺」；SLEEP_AT=dorm＝照 n14 harness 的 zone 'dorm' 字面讀檔，找床（只記遊戲怎麼處理，不是玩家走得到的狀態）。
      dorm_stand 預設（STAND_ZONE=campus，出生點）＝退宿以後玩家「出門」會到的 3D 世界裡站著不動。
  家裡選單（home3d.js loop）：Y5.homeOpts 在「存檔」「睡覺」前面；「在家休息一下」＝1 小時（02:30 以後不出）；選單項 k 'y5cls' → Y5.attend，上完回家裡的選單。
  Y5.attend：字卡（課名、時間）→ 從家裡 +0.5 小時、在外面 +0.25（早到等到 t0）→ G.y5.cls[key]=1 → 第一次老師一句（FD.firstLine）→ 課堂一句 → 下課（在家 +0.5）→ caption「下課了。」。

CASES（逗號隔開，每個 case 開一個新的瀏覽器；預設 dorm_sleep,dorm_stand,home,control_skip）：
  dorm_sleep   【前置】2029-09-02（日）22:00 延畢存檔（旗標照 n14 base()：FAIL_DELAY true、FAIL_DELAY_V 2、FAIL_DELAY_COURSES ['maritime']、FAIL_DELAY_DAY＝2029-06-26、
               Y5_DAYS 'study'、BAR_REG false、GRADUATED 6/2、GRAD_DONE、MOVED_OUT 6/28、HOME_AFTER 'home'、PACKED_Y4 6/1、PG.done.grad＝1；畢業那幾件 events done）
               SLEEP_AT=home（預設）：人在臺北的家（G.home.at）→ 家裡選單「睡覺」（「會錯過」確認選「照樣」）
               SLEEP_AT=dorm：zone 'dorm' 讀檔 → 照玩家走到床、「睡覺」（找不到床／沒有「睡覺」＝只記，退回家裡那一條不做）
               → 記停在哪個日期時間（期望 9/5（三）08:25）、手機「今天」內容（人在家時照設計沒有按鈕，只記）、選單／畫面有沒有「直接去上課：重修…」
               → 直向＋橫向截圖 → 按它 → 記有沒有上到課（G.y5.cls、FD.attended）、下課時間、回到哪裡。
  dorm_stand   【前置】同日期時間、旗標，人在 3D（STAND_ZONE，預設 campus 出生點）→ 站著不動（畢業後篇站 2 秒＝跳到下一件事）→ 第一次落點：記日期時間（期望 9/5 08:25）、
               馬上開手機「今天」（記內容、有沒有「直接去上課」按鈕＝data-y5go；先截橫向再直向；記截圖期間時間有沒有又跳）→ 按 → 記上到課沒有。
               落點如果人在家（forceHome）＝改用家裡選單那一項（照記）。
  home         【前置】同旗標，人在臺北的家。HOME_SUBS（預設 sleep,morning）：
               sleep    9/2 22:00：選單（記、截圖；9/2 週日沒有課＝不應有那一項）→「睡覺」→ 落點的選單：日期時間（期望 9/5 08:25）、有「直接去上課：重修…」（直向＋橫向）
                        → 不按，一直選「在家休息一下」（每一輪記時間、選單、「會錯過」那一句）直到那一項不見或 12:30 → 記 G.y5.cls 沒有上（對照）。
               morning  9/5 07:00：選單（期望已經有那一項：upcoming 也給）→ 按 → 上到課（G.y5.cls）、回到家裡的選單、那一項不見了。
  control_skip （可選）【前置】同 dorm_stand（3D、站著不動），照停點都不去：記每一個落點（PG.advance 結束時的日期時間、那時 open 的重修課、Y5.homeOpts），
               到第三個「有重修課可上」的落點或過了 9/20 為止（期望 9/5、9/12、9/19 08:25）；G.y5.cls 一直是空的。
記錄（只記不改）：HOOK＝GAME.say／choose（連 hint）／caption／titleCard／toast／ADV.begin／GAME.enter／Y5.attend／PG.advance（開始、結束的時刻）／PG.runStep／HOME.sleep
  → <輸出>/transcript_<case>.json（另外存狀態快照、每個落點、手機「今天」）。check 只客觀記錄（不判定企劃）。
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，1～4 fps）＋直向截圖，URL 用 '<URL>/index.html?turbo'。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=dorm_sleep,...] python3 cc_delay14_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）：CASE_MAX（一個 case，預設 1800）、JUMP_MAX（等第一個落點，600）、STUCK_S（240）、ATTEND_MAX（等上完課，300）。"""
import os, sys, json, asyncio, re, time, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASES = [c.strip() for c in os.environ.get('CASES', 'dorm_sleep,dorm_stand,home,control_skip').split(',') if c.strip()]
HOME_SUBS = [c.strip() for c in os.environ.get('HOME_SUBS', 'sleep,morning').split(',') if c.strip()]
SLEEP_AT = os.environ.get('SLEEP_AT', 'home')
STAND_ZONE = os.environ.get('STAND_ZONE', 'campus')
LAND = {'width': 844, 'height': 390}; PORT = {'width': 390, 'height': 844}
DAY0 = '2029-09-02'; H0 = 22.0
EXP = ['2029-09-05', '2029-09-12', '2029-09-19']; EXP_H = 8 + 25 / 60.0   # 期望的停點：週三 09:10 上課前 45 分
CID = 'maritime'
OPT = '直接去上課：重修'   # Y5.homeOpts：'直接去上課：'+label，label＝'重修：'+FD.cname
Y4_DONE = ('ev_pack_y4', 'ev_grad_family', 'ev_grad_lunch', 'ev_grad_envelope')
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
DECL = ('不去了', '晚一點', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事')


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % ((m // 60) % 24, m % 60)


# ---------------------------------------------------------------- 存檔（【前置】：旗標照 n14_delay_retake.js 的 base()）
async def delay_state(pg, key, h, zone, home=False, pos=None):
    d = await P.day_of(pg, key)
    D = lambda k: P.day_of(pg, k)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {e: 1 for e in Y4_DONE}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS: F[k] = (await D(kk))['d']
    F.update({'FAIL_DELAY': True, 'FAIL_DELAY_V': 2, 'FAIL_DELAY_COURSES': [CID], 'FAIL_DELAY_DAY': (await D('2029-06-26'))['d'], 'Y5_DAYS': 'study', 'BAR_REG': False,
              'GRADUATED': (await D('2029-06-02'))['d'], 'GRAD_DONE': True, 'MOVED_OUT': (await D('2029-06-28'))['d'], 'HOME_AFTER': 'home',
              'PACKED_Y4': (await D('2029-06-01'))['d'], 'examSeed': 12345, 'PG': {'done': {'grad': 1}}})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    if home: st['home'] = {'at': True, 'day': d['d']}
    return st, d


# ---------------------------------------------------------------- 記錄（只記不改）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone, home:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(GAME.G))}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof Y5!=='undefined'&&Y5.attend){ const a0=Y5.attend; Y5.attend=async function(GM,it){ push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify({key:it&&it.key,label:it&&it.label,fd:!!(it&&it.fd)})});
    const r=await a0.apply(this,arguments); push({k:'attended',n:(it&&it.key)||'',t:JSON.stringify({ret:r,cls:!!(GAME.G.y5&&GAME.G.y5.cls&&it&&GAME.G.y5.cls[it.key])})}); return r; }; }
  if(typeof PG!=='undefined'){
    if(PG.advance){ const v0=PG.advance; PG.advance=async function(GM,o){ push({k:'adv',n:'start',t:JSON.stringify(o||{})}); let r; try{ r=await v0.apply(this,arguments); } finally { push({k:'adv',n:'end',t:String(r)}); } return r; }; }
    if(PG.runStep){ const r0=PG.runStep; PG.runStep=async function(GM,s){ push({k:'step',n:'start',t:String(s&&s.id)}); const r=await r0.apply(this,arguments); push({k:'step',n:'end',t:String(s&&s.id)}); return r; }; }
  }
  if(typeof HOME!=='undefined'&&HOME.sleep){ const h0=HOME.sleep; HOME.sleep=async function(){ push({k:'hsleep',n:'start',t:''}); const r=await h0.apply(this,arguments); push({k:'hsleep',n:'end',t:''}); return r; }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  return 'ok'; })()"""

STATE = r"""(()=>{ const G=GAME.G, F=G.flags||{}; const pick={};
  for(const k of ['FAIL_DELAY','FAIL_DELAY_V','FAIL_DELAY_COURSES','FAIL_DELAY_DAY','FAIL_DELAY_PASS','FAIL_DELAY_CERT','Y5_DAYS','BAR_REG','MOVED_OUT','HOME_AFTER','FD_TEACHER']) if(k in F) pick[k]=F[k];
  const lab=t=>{ if(t==null||!isFinite(t)) return null; const d=Math.floor(t/24), h=t-d*24; return CALENDAR.dateOf(d).key+' '+String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0'); };
  let items=null, opts=null, next=null, cls=null, att=null, fdStop=null, pgOn=null, y5On=null;
  try{ items=(Y5.classItems(G)||[]).map(it=>({key:it.key,label:it.label,fd:!!it.fd,t0:it.t0,t1:it.t1,st:Y5.status(G,it)})); }catch(e){ items='ERR '+e.message; }
  try{ opts=(Y5.homeOpts?Y5.homeOpts(G):[]).map(o=>o.t+(o.hint?'〔'+o.hint+'〕':'')); }catch(e){ opts='ERR '+e.message; }
  try{ next=lab(PG.nextStop(G)); }catch(e){ next='ERR '+e.message; }
  try{ fdStop=typeof FD!=='undefined'&&FD.clsStop?lab(FD.clsStop(G)):'(沒有 FD.clsStop)'; }catch(e){ fdStop='ERR '+e.message; }
  try{ cls=JSON.parse(JSON.stringify((G.y5&&G.y5.cls)||{})); att=typeof FD!=='undefined'&&FD.attended?FD.attended(G,'maritime'):null; }catch(e){}
  try{ pgOn=PG.on(G); y5On=Y5.on(G); }catch(e){}
  const t=CALENDAR.dateOf(G.day);
  return {clock:{key:t.key,wd:t.wd,day:G.day,h:+(+G.hour).toFixed(3),hm:lab(G.day*24+(+G.hour)),zone:G.zone},flags:pick,items,opts,next,fdStop,cls,att,pgOn,y5On,
    homeAt:!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)),busy:!!(GAME.E&&GAME.E.player&&GAME.E.player.busy),title:!document.getElementById('titleScreen').classList.contains('hide')}; })()"""
Y5BTN = "[...document.querySelectorAll('#phoneBody [data-y5go]')].map(b=>({key:b.dataset.y5go,t:(b.textContent||'').trim(),row:((b.closest('.item')||b.parentElement||{}).innerText||'').trim().slice(0,160)}))"


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


def landings(R):
    """PG.advance 每一次結束時的時刻（落點）"""
    return [{'d': r.get('d'), 'h': r.get('h'), 'hm': hm(r.get('h')), 'z': r.get('z'), 'home': r.get('home')} for r in R if r['k'] == 'adv' and r['n'] == 'end']


def dump(tag, **kw):
    kw.setdefault('sha', os.environ.get('SHA', '?')); kw['case'] = tag
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


def is_exp(clock_or_row, i=0):
    d = clock_or_row.get('key', clock_or_row.get('d')); h = clock_or_row.get('h')
    return d == EXP[i] and h is not None and abs(float(h) - EXP_H) < 0.02


# ---------------------------------------------------------------- 操作
def pick_opt(ch, picks=()):
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p): return i, 'pick'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(('出發：', '直接過去：', '接起來：', '上線：', '直接去上課')) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def shoot_both(pg, run, tag):
    await pg.wait_for_timeout(600)
    a = await run.shot(pg, tag + '_land')
    await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000)
    b = await run.shot(pg, tag + '_port')
    await pg.set_viewport_size(LAND); await pg.wait_for_timeout(2000)
    return [a, b]


def is_home_menu(s):
    return bool(s['ch']) and any(o['t'] == '睡覺' for o in s['ch']) and any(o['t'] == '存檔' for o in s['ch'])


class Driver:
    """對話點過去、一般選單照規則（「會錯過」確認＝照樣）、手機收起來；碰到有「直接去上課：重修」的選單就截圖（每個 tag 一次）"""
    def __init__(self, pg, cdp, run, tag):
        self.pg, self.cdp, self.run, self.tag = pg, cdp, run, tag; self.shots = {}; self.picks_log = []

    async def handle(self, s, picks=()):
        pg, cdp, run = self.pg, self.cdp, self.run
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            k, why = pick_opt(s['ch'], tuple(picks) + ('照樣',))
            c = await P.clock(pg)
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (self.tag, c['key'], hm(c['h']), c['zone'], J([t[:30] for t in T]), T[k][:30], why))
            self.picks_log.append([c['key'], hm(c['h']), T, T[k]])
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); return True
        if s['phone'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=2); await pg.wait_for_timeout(500); return True
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(550); return True
        return False


async def home_menu(pg, cdp, run, drv, max_s=120):
    """等到家裡的選單（有「睡覺」「存檔」那一個）出來；中間的對話點過去。回傳選項（不選）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if is_home_menu(s): return [o['t'] for o in s['ch']]
        if s['ch'] or s['dlg'] or s['phone']: await drv.handle(s); continue
        await pg.wait_for_timeout(800)
    return None


async def home_pick(pg, cdp, run, tag, opts, prefix):
    k = next((i for i, t in enumerate(opts) if t.startswith(prefix)), None)
    c = await P.clock(pg); run.note('%s %s %s 家裡選單 %s → %s' % (tag, c['key'], hm(c['h']), J(opts), opts[k] if k is not None else '（沒有 %s）' % prefix))
    if k is None: return False
    await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); return True


async def home_until_menu(pg, cdp, run, drv, max_s=900):
    """選了一項以後：對話、確認照 Driver 處理，直到家裡的選單再出來（或離開家）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if is_home_menu(s): return [o['t'] for o in s['ch']]
        if not await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at(GAME.G))") and not (s['dlg'] or s['ch'] or s['busy']): return None
        if await drv.handle(s): continue
        await pg.wait_for_timeout(800)
    return 'timeout'


async def phone_today(pg, cdp, run, tag):
    txt = await P.phone_tab(pg, cdp, 'today')
    btns = await pg.evaluate(Y5BTN)
    run.note('%s：手機「今天」%s；直接去上課按鈕 %s' % (tag, J(txt[:600]), J(btns)))
    return txt, btns


async def wait_attended(pg, cdp, run, drv, n0, max_s):
    """按了上課以後：對話照 Driver 點過去，直到 Y5.attend 結束（attended 那一列）而且畫面空下來"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        done = await rows(pg, n0, 'attended')
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if done and (free or is_home_menu(s)): return done
        if is_home_menu(s) and done: return done
        if s['ch'] and is_home_menu(s): await pg.wait_for_timeout(800); continue
        if await drv.handle(s): continue
        await pg.wait_for_timeout(800)
    return await rows(pg, n0, 'attended')


async def setup_case(pg, run, tag, h, zone, home, key=DAY0):
    st, d = await delay_state(pg, key, h, zone, home=home)
    await L.load_state(pg, st, quiet_events=False, quiet_phone=False)
    run.setup('[前置] %s：%s %s %s 延畢存檔（n14 base() 旗標：FAIL_DELAY、V2、COURSES [maritime]、FAIL_DELAY_DAY 6/26、Y5_DAYS study、BAR_REG false、GRADUATED／GRAD_DONE／'
              'MOVED_OUT 6/28／HOME_AFTER home／PACKED_Y4、PG.done.grad、畢業那幾件 events done）%s' % (tag, key, hm(h), zone, '；人在臺北的家（G.home.at＝true）' if home else ''))
    g = await pg.evaluate(STATE); run.note('%s：讀檔那一刻 %s' % (tag, J(g))); return g


def first_check(run, tag, clk, what):
    run.check('%s：%s第一個停點＝2029-09-05（三）08:25（修改前 5b40dad61 預期 FAIL）' % (tag, what), is_exp(clk, 0), J(clk))


# ---------------------------------------------------------------- dorm_sleep
async def case_sleep(pg, cdp, run):
    tag = 'dorm_sleep'; home = SLEEP_AT != 'dorm'
    g0 = await setup_case(pg, run, tag, H0, 'dorm', home)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag); out = {'start': g0}
    if home:
        run.note('%s：SLEEP_AT=home——9/2 已經退宿（MOVED_OUT 6/28、HOME_AFTER home＝HOME.pgHome），住處＝臺北的家；「睡覺」在家裡的選單' % tag)
        ops = await home_menu(pg, cdp, run, drv)
        out['menu0'] = ops
        run.check('%s：家裡的選單出來了' % tag, bool(ops), J(await P.ts(pg)))
        if not ops: dump(tag, rows=await rows(pg, n0), **out); return
        run.note('%s：9/2 22:00 選單有沒有「%s」：%s' % (tag, OPT, any(t.startswith(OPT) for t in ops)))
        await home_pick(pg, cdp, run, tag, ops, '睡覺')
        ops2 = await home_until_menu(pg, cdp, run, drv)
    else:
        z = (await pg.evaluate(STATE))['clock']['zone']
        it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()")
        run.note('%s：SLEEP_AT=dorm——讀檔後 zone %s；床 %s（退宿以後玩家走不到宿舍：這一條只記遊戲怎麼處理）' % (tag, z, J(it)))
        out['bed'] = it
        if not it: run.check('%s：（SLEEP_AT=dorm）找得到床' % tag, False, J(z)); dump(tag, rows=await rows(pg, n0), **out); return
        await L.phone_away(pg, cdp, tries=1)
        await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
        bops = []
        for _ in range(6):
            s = await P.ts(pg)
            if s['ch']: bops = [o['t'] for o in s['ch']]; break
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        out['bed_menu'] = bops; run.note('%s：床的選單 %s' % (tag, J(bops)))
        k = next((i for i, t in enumerate(bops) if t == '睡覺'), None)
        run.check('%s：（SLEEP_AT=dorm）床有「睡覺」' % tag, k is not None, J(bops))
        if k is None: dump(tag, rows=await rows(pg, n0), **out); return
        await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1500)
        ops2 = None; t0 = time.time()
        while time.time() - t0 < ENVI('JUMP_MAX', 600):   # 等第一個 PG.advance 結束、畫面空下來
            R = await rows(pg, n0); s = await P.ts(pg)
            if landings(R) and not (s['dlg'] or s['ch'] or s['busy']): break
            if is_home_menu(s): ops2 = [o['t'] for o in s['ch']]; break
            if not await drv.handle(s): await pg.wait_for_timeout(700)
    R = await rows(pg, n0); lands = landings(R); g1 = await pg.evaluate(STATE)
    first = lands[0] if lands else None
    out.update(menu_after=ops2, landings=lands, after=g1)
    run.note('%s：睡覺以後 落點 %s；字卡 %s；狀態 %s' % (tag, J(lands), J([[x.get('d'), hm(x.get('h')), x['n'], x['t']] for x in R if x['k'] == 'card']), J(g1)))
    first_check(run, tag, first or {}, '睡覺以後')
    has_menu = isinstance(ops2, list) and any(t.startswith(OPT) for t in ops2)
    txt, btns = await phone_today(pg, cdp, run, tag)
    drv.shots['phone_today'] = await shoot_both(pg, run, tag + '_phone_today'); await L.close_panels(pg, cdp)
    out.update(phone_today=txt, phone_btns=btns)
    run.note('%s：手機「今天」寫了重修那一堂：%s（人在家時照設計沒有按鈕，按鈕在家裡的選單）' % (tag, '重修' in (txt or '')))
    if g1['homeAt']:
        ops2 = await home_menu(pg, cdp, run, drv) if not isinstance(ops2, list) else ops2
        has_menu = isinstance(ops2, list) and any(t.startswith(OPT) for t in ops2)
        run.check('%s：落點的家裡選單有「%s…」' % (tag, OPT), has_menu, J(ops2))
        drv.shots['menu'] = await shoot_both(pg, run, tag + '_menu')
        if not has_menu: dump(tag, rows=R, shots=drv.shots, **out); return
        n1 = await pl_len(pg); await home_pick(pg, cdp, run, tag, ops2, OPT)
        att = await wait_attended(pg, cdp, run, drv, n1, ENVI('ATTEND_MAX', 300))
        ops3 = await home_until_menu(pg, cdp, run, drv, 120); out['menu_after_class'] = ops3
    else:
        run.check('%s：落點手機「今天」有「直接去上課」按鈕（data-y5go）' % tag, bool(btns), J(btns))
        if not btns: dump(tag, rows=R, shots=drv.shots, **out); return
        n1 = await pl_len(pg); await P.phone_tab(pg, cdp, 'today'); await L.tap(pg, cdp, '#phoneBody [data-y5go]'); await pg.wait_for_timeout(1200)
        att = await wait_attended(pg, cdp, run, drv, n1, ENVI('ATTEND_MAX', 300)); ops3 = None
    g2 = await pg.evaluate(STATE); R = await rows(pg, n0)
    drv.shots['after_class'] = await shoot_both(pg, run, tag + '_after_class')
    out.update(attended=att, end=g2)
    run.note('%s：上課那一段 %s；結束 %s' % (tag, J([[x['k'], x.get('d'), hm(x.get('h')), x['n'], x['t'][:60]] for x in R if x['k'] in ('attend', 'attended', 'card', 'say', 'cap') and x.get('d', '') >= EXP[0]][:20]), J(g2)))
    key = '%d:%s' % ((await P.day_of(pg, EXP[0]))['d'], CID)
    run.check('%s：按了＝上到課（G.y5.cls[%s]、FD.attended＝1）' % (tag, key), bool((g2['cls'] or {}).get(key)) and g2['att'] == 1, J({'cls': g2['cls'], 'att': g2['att'], 'attended': att}))
    if isinstance(ops3, list): run.check('%s：上完回到家裡的選單、那一項不見了' % tag, not any(t.startswith(OPT) for t in ops3), J(ops3))
    dump(tag, rows=R, shots=drv.shots, picks=drv.picks_log, **out)


# ---------------------------------------------------------------- dorm_stand／control_skip（3D 站著不動）
async def stand_until(pg, cdp, run, drv, n0, want, max_s):
    """站著不動（只點對話、收手機）；want(R, g) 成立就回傳。回傳 (R, g, stuck)"""
    t0 = time.time(); last = None; since = time.time()
    while time.time() - t0 < max_s:
        R = await rows(pg, n0); g = await pg.evaluate(STATE)
        if want(R, g): return R, g, None
        s = await P.ts(pg)
        sig = (g['clock']['hm'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['phone'], len(R))
        if sig != last: last = sig; since = time.time()
        elif time.time() - since > ENVI('STUCK_S', 240): return R, g, {'clock': g['clock'], 'ts': {k: s[k] for k in ('dlg', 'txt', 'busy', 'depth', 'phone', 'zone')}}
        if is_home_menu(s): return R, g, None   # forceHome 回到家：交給呼叫的人
        if await drv.handle(s): continue
        await pg.wait_for_timeout(500)
    return await rows(pg, n0), await pg.evaluate(STATE), {'timeout': True}


async def case_stand(pg, cdp, run):
    tag = 'dorm_stand'
    g0 = await setup_case(pg, run, tag, H0, STAND_ZONE, False)
    run.note('%s：STAND_ZONE=%s——退宿以後沒有宿舍房間（宿舍門口只能看），站在 3D 世界裡' % (tag, STAND_ZONE))
    await L.phone_away(pg, cdp, tries=2)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag); out = {'start': g0}
    R, g1, stuck = await stand_until(pg, cdp, run, drv, n0, lambda R, g: bool(landings(R)) and not g['busy'], ENVI('JUMP_MAX', 600))
    # 落點：馬上看手機（站 2 秒會再跳）
    s = await P.ts(pg)
    lands = landings(R); first = lands[0] if lands else None
    out.update(landings0=lands, at_land=g1, stuck=stuck)
    run.note('%s：第一個落點 %s；狀態 %s' % (tag, J(first), J(g1)))
    first_check(run, tag, first or {}, '站著不動，')
    if g1['homeAt'] or is_home_menu(s):
        run.note('%s：落點人在家（forceHome？）——改看家裡的選單' % tag)
        ops = await home_menu(pg, cdp, run, drv); out['home_menu'] = ops
        run.check('%s：落點的家裡選單有「%s…」' % (tag, OPT), isinstance(ops, list) and any(t.startswith(OPT) for t in ops), J(ops))
        drv.shots['menu'] = await shoot_both(pg, run, tag + '_menu')
        if not (isinstance(ops, list) and any(t.startswith(OPT) for t in ops)): dump(tag, rows=await rows(pg, n0), shots=drv.shots, **out); return
        n1 = await pl_len(pg); await home_pick(pg, cdp, run, tag, ops, OPT)
    else:
        nadv0 = len(lands)
        txt = await P.phone_tab(pg, cdp, 'today'); btns = await pg.evaluate(Y5BTN)
        a = await run.shot(pg, tag + '_phone_today_land')
        await pg.set_viewport_size(PORT); await pg.wait_for_timeout(2000); b = await run.shot(pg, tag + '_phone_today_port')
        await pg.set_viewport_size(LAND); await pg.wait_for_timeout(1500)
        drv.shots['phone_today'] = [a, b]
        g2 = await pg.evaluate(STATE); R2 = await rows(pg, n0)
        out.update(phone_today=txt, phone_btns=btns, at_shot=g2)
        run.note('%s：手機「今天」%s；按鈕 %s' % (tag, J(txt[:600]), J(btns)))
        run.check('%s：落點手機「今天」有「直接去上課」按鈕（重修那一堂，data-y5go）' % tag, any(str(x['key']).endswith(':' + CID) for x in btns), J(btns))
        run.check('%s：開手機、截圖期間時間沒有又跳（PG.advance 沒有再跑）' % tag, len(landings(R2)) == nadv0 and g2['clock']['hm'] == g1['clock']['hm'],
                  J({'before': g1['clock'], 'after': g2['clock'], 'landings': landings(R2)}))
        if not btns: dump(tag, rows=R2, shots=drv.shots, **out); return
        n1 = await pl_len(pg)
        if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"): await P.phone_tab(pg, cdp, 'today')
        await L.tap(pg, cdp, '#phoneBody [data-y5go]'); await pg.wait_for_timeout(1200)
    att = await wait_attended(pg, cdp, run, drv, n1, ENVI('ATTEND_MAX', 300))
    g3 = await pg.evaluate(STATE); R = await rows(pg, n0)
    drv.shots['after_class'] = await shoot_both(pg, run, tag + '_after_class')
    key = '%d:%s' % ((await P.day_of(pg, EXP[0]))['d'], CID)
    run.note('%s：上課那一段 %s；結束 %s' % (tag, J([[x['k'], x.get('d'), hm(x.get('h')), x['n'], x['t'][:60]] for x in R[-40:] if x['k'] in ('attend', 'attended', 'card', 'say', 'cap', 'adv')]), J(g3)))
    run.check('%s：按了＝上到課（G.y5.cls[%s]、FD.attended＝1）' % (tag, key), bool((g3['cls'] or {}).get(key)) and g3['att'] == 1, J({'cls': g3['cls'], 'att': g3['att'], 'attended': att}))
    run.note('%s：下課後在 %s（人在家 %s）' % (tag, J(g3['clock']), g3['homeAt']))
    out.update(attended=att, end=g3)
    dump(tag, rows=R, shots=drv.shots, picks=drv.picks_log, **out)


async def case_control(pg, cdp, run):
    tag = 'control_skip'
    g0 = await setup_case(pg, run, tag, H0, STAND_ZONE, False)
    await L.phone_away(pg, cdp, tries=2)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag); stops = []; seen = 0
    d920 = (await P.day_of(pg, '2029-09-20'))['d']; t0 = time.time(); stuck = None
    while time.time() - t0 < ENVI('CASE_MAX', 1800):
        R, g, stuck = await stand_until(pg, cdp, run, drv, n0, lambda R, g: len(landings(R)) > seen, ENVI('JUMP_MAX', 600))
        L2 = landings(R)
        if len(L2) > seen:
            seen = len(L2)
            op = [it for it in (g['items'] if isinstance(g['items'], list) else []) if it['fd'] and it['st'] == 'open']
            stops.append({'land': L2[-1], 'clock': g['clock'], 'open': op, 'opts': g['opts'], 'next': g['next']})
            run.note('%s：落點 %s %s；有重修可上 %s；下一個停點 %s' % (tag, L2[-1]['d'], L2[-1]['hm'], J([x['label'] for x in op]), g['next']))
        if g['homeAt']:
            ops = await home_menu(pg, cdp, run, drv)
            run.note('%s：人在家（%s）選單 %s → 睡覺（不去上課）' % (tag, J(g['clock']), J(ops)))
            if not ops or not await home_pick(pg, cdp, run, tag, ops, '睡覺'): break
            await home_until_menu(pg, cdp, run, drv); continue
        cs = [x for x in stops if x['open']]
        if len(cs) >= 3 or g['clock']['day'] > d920 or stuck: break
    gE = await pg.evaluate(STATE); R = await rows(pg, n0)
    cs = [x for x in stops if x['open']]
    run.note('%s：全部落點 %s' % (tag, J([[x['land']['d'], x['land']['hm'], [o['label'] for o in x['open']]] for x in stops])))
    for i in range(3):
        x = cs[i] if i < len(cs) else None
        run.check('%s：第 %d 個有重修課的落點＝%s 08:25（修改前預期 FAIL）' % (tag, i + 1, EXP[i]), bool(x) and is_exp(x['land'], i), J(x and x['land']))
    run.check('%s：一直沒去：G.y5.cls 沒有 maritime' % tag, not any(k.endswith(':' + CID) for k in (gE['cls'] or {})), J(gE['cls']))
    run.check('%s：沒有卡住' % tag, not stuck or stuck.get('timeout'), J(stuck))
    dump(tag, rows=R, stops=stops, end=gE, start=g0, stuck=stuck, picks=drv.picks_log)


# ---------------------------------------------------------------- home
async def case_home(pg, cdp, run, sub):
    tag = 'home_' + sub
    key, h = (DAY0, H0) if sub == 'sleep' else (EXP[0], 7.0)
    g0 = await setup_case(pg, run, tag, h, 'dorm', True, key)
    n0 = await pl_len(pg); drv = Driver(pg, cdp, run, tag); out = {'start': g0, 'menus': []}
    ops = await home_menu(pg, cdp, run, drv)
    run.check('%s：家裡的選單出來了' % tag, bool(ops), J(await P.ts(pg)))
    if not ops: dump(tag, rows=await rows(pg, n0), **out); return
    drv.shots['menu0'] = await shoot_both(pg, run, tag + '_menu0'); out['menu0'] = ops
    if sub == 'sleep':
        run.check('%s：9/2（日）22:00 選單沒有「%s…」（這一天沒有課）' % (tag, OPT), not any(t.startswith(OPT) for t in ops), J(ops))
        await home_pick(pg, cdp, run, tag, ops, '睡覺')
        cur = await home_until_menu(pg, cdp, run, drv)
        R = await rows(pg, n0); lands = landings(R); g1 = await pg.evaluate(STATE)
        run.note('%s：睡覺以後 落點 %s；字卡 %s' % (tag, J(lands), J([[x.get('d'), hm(x.get('h')), x['n'], x['t']] for x in R if x['k'] == 'card'])))
        first_check(run, tag, (lands[0] if lands else {}), '在家睡覺，')
        has = isinstance(cur, list) and any(t.startswith(OPT) for t in cur)
        run.check('%s：落點的家裡選單有「%s…」（hint 寫上課時間）' % (tag, OPT), has, J({'menu': cur, 'opts': g1['opts'], 'clock': g1['clock']}))
        if has: drv.shots['menu_opt'] = await shoot_both(pg, run, tag + '_menu_opt')
        out['menu_land'] = cur
        for i in range(8):   # 不按，一直休息：那一項什麼時候不見
            if not isinstance(cur, list): break
            c = await pg.evaluate(STATE); out['menus'].append([c['clock']['key'], hm(c['clock']['h']), cur, c['opts']])
            if not any(t.startswith(OPT) for t in cur) or c['clock']['h'] >= 12.5: break
            n1 = await pl_len(pg)
            if not await home_pick(pg, cdp, run, tag, cur, '在家休息一下'): break
            cur = await home_until_menu(pg, cdp, run, drv)
            warn = [x['t'] for x in await rows(pg, n1, 'say') if x['t'].startswith('會錯過')]
            if warn: run.note('%s：休息前的預告 %s' % (tag, J(warn))); out.setdefault('warns', []).append(warn)
        g2 = await pg.evaluate(STATE)
        run.note('%s：每一輪選單 %s' % (tag, J(out['menus'])))
        run.check('%s：一直休息到 12:00 前後，那一項不見了（status missed）' % tag, isinstance(cur, list) and not any(t.startswith(OPT) for t in cur), J({'menu': cur, 'clock': g2['clock'], 'items': g2['items']}))
        run.check('%s：（對照）沒有按＝G.y5.cls 沒有 maritime' % tag, not any(k.endswith(':' + CID) for k in (g2['cls'] or {})), J(g2['cls']))
        if out.get('warns'): run.note('%s：「會錯過」有沒有列重修：%s' % (tag, any('重修' in w for ws in out['warns'] for w in ws)))
        out['end'] = g2
    else:
        has = any(t.startswith(OPT) for t in ops)
        run.check('%s：9/5（三）07:00 家裡選單已經有「%s…」（upcoming 也給）' % (tag, OPT), has, J({'menu': ops, 'opts': g0['opts']}))
        if has:
            n1 = await pl_len(pg); await home_pick(pg, cdp, run, tag, ops, OPT)
            att = await wait_attended(pg, cdp, run, drv, n1, ENVI('ATTEND_MAX', 300))
            cur = await home_until_menu(pg, cdp, run, drv, 120); g2 = await pg.evaluate(STATE)
            drv.shots['menu_after'] = await shoot_both(pg, run, tag + '_menu_after')
            key2 = '%d:%s' % ((await P.day_of(pg, EXP[0]))['d'], CID)
            run.check('%s：按了＝上到課（G.y5.cls[%s]）' % (tag, key2), bool((g2['cls'] or {}).get(key2)), J({'cls': g2['cls'], 'att': g2['att'], 'attended': att}))
            run.check('%s：上完回到家裡的選單、人在家、那一項不見了' % tag, isinstance(cur, list) and g2['homeAt'] and not any(t.startswith(OPT) for t in cur), J({'menu': cur, 'clock': g2['clock']}))
            run.note('%s：下課回到家的時間 %s（期望 12:10＋0.5＝12:40 前後）' % (tag, J(g2['clock'])))
            out.update(attended=att, menu_after=cur, end=g2)
    dump(tag, rows=await rows(pg, n0), shots=drv.shots, picks=drv.picks_log, **out)


CASEFN = {'dorm_sleep': case_sleep, 'dorm_stand': case_stand, 'control_skip': case_control}
for _s in ('sleep', 'morning'): CASEFN['home_' + _s] = (lambda v: (lambda pg, cdp, run: case_home(pg, cdp, run, v)))(_s)


async def main():
    run = L.Run('delay14_' + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    todo = []
    for cs in CASES: todo += ['home_' + s for s in HOME_SUBS] if cs == 'home' else [cs]
    async with async_playwright() as p:
        for cs in todo:
            fn = CASEFN.get(cs)
            if not fn: run.check('CASE %s 認得' % cs, False, '可以用：' + ','.join(list(CASEFN) + ['home'])); continue
            print('==== CASE %s（SHA %s）====' % (cs, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % cs, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % cs, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, cs + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % cs, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(todo), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
