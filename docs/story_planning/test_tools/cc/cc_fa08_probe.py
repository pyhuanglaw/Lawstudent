"""CC（帳號 A）11-02：FA-08 學期中快轉（SEMFF）會不會被法服值班打斷——社員 vs 非社員（BB_222 驗收計畫 B-2 FA-08；共同規則第 221–237 行）。
方法：瀏覽器 turbo＋【前置】最小存檔。Node 部分另外跑 baseline_1102/fafu_semff_stops.js（不在這支探針裡）。
不是 iPhone：Playwright 手機模擬（SwiftShader 1–4 fps）。URL 用 '<URL>/index.html?turbo'（turbo＝走到床邊瞬間到、淡入淡出縮短；快轉本身是 SEMFF.jump 的計算，不受影響）。

11-02 第二版（BB 要求）：第一版在 a3b1bd647 兩份都停在 10/5 13:00「日文（上）」（有劇情的課前 20 分鐘停、再按床＝why=now「先去上課」）就收工，沒走到 10/24。
  改成照玩家處理上課停點，一路走到 10/24 以後：
  · 停在有劇情的課前（頁面裡只讀算：今天還沒上、沒翹、30 分鐘內開始、SEMFF.classEventful 有劇情；＝再按床會 why=now 的那一堂）→
      NOW_ACTION=go（預設）：手機「今天」→ 那一堂的「直接去上課」→ 照玩家：對話點過去、路上停下來選「繼續去上課：」、座位選「老位子／坐中間的位子」、上完（CLS.attend 跑完）；
          下課選單選「先自由活動」（trip() 複製自 cc_dl04b_probe.py，不 import）。
      NOW_ACTION=skip：手機「今天」→「跳過時間」選第一個跳過下課時間的按鈕（例「等到傍晚（17:30）」）→ 確認選「照樣跳過」（hint「會錯過：…」）。
          遊戲沒有單獨的「翹課」按鈕：起床選單的「翹這堂課」只在睡到早上醒來時出、下課選單的「下一堂不去」只在上完前一堂後出；
          快轉停下來（宿舍、白天）玩家能做的就是不去、把時間跳過（手機「跳過時間」，和床的「睡到傍晚」同一個 CLS.skipTo）。
  · 人不在宿舍（上完課在教室、事件把人帶走）→ 照玩家回宿舍：手機「地點」→「宿舍」的「前往」（快速前往，花路程時間；路上被【固】【必】事件攔下來＝演完再按一次，最多 4 次）。不瞬移。
  · 考試：停點或要處理的那一堂是考試（10/27 期中）＝停止（不考）；日期到 STOP_KEY 也停。
  · 社員：走到 10/24 08:30 看到「出發：法服值班」選單才算走到（check）；看到以後照 pick_opt 婉拒（「不去了」優先）繼續走到 STOP_KEY；
      只有「出發：」（必去）＝停在那裡。非社員：同一段時間的停點記到 10/24 之後（check：最後的日期＞2026-10-24）。
  · 停點比對：why=now 不列入比對（那是探針按床的時間差，秒數不同）；另外記在 now_list。

存檔【前置】：最小存檔（同 cc_dl04b_probe 的 state_at：GAME.defaults＋過了開場的旗標 BASEF），改到大二上第 4 週週五 21:00、宿舍（zone dorm，出生點），
  EXCHANGE_ROUTE:'TW'（不出國交換，和 Node 腳本同）。
  社員＝STORY.fafuMember(G)（story3d.js:681：法律系、F.lawclub||F.CLUB_lawclub_study、大二～大四學期中）→ 旗標 lawclub、CLUB_lawclub_study、SIS_CLUB_EXPO（和 Node 腳本同一組）；
  非社員＝不給這三個。讀檔後印 GAME 算出來的 STORY.fafuMember 當確認。
玩家操作（真的介面）：走到床（點地／搖桿，turbo 下瞬間到）→ 按互動「睡覺」→ 床的選單選「快轉」→ SEMFF 選單選「過一週」→
  快轉途中：手機自己打開（要回的訊息，D103）＝按「收起來」（SEMFF 接著跳）；對話點過去；別的選單照 pick_opt（婉拒那一類；出發提醒選「不去了」）。
  停下來以後記：日期字卡（GAME.titleCard：日期＋「該出發了」／停的原因／「宿舍」）、SEMFF.jump 的回傳（why、stop、stop.x、OUT.due 的標題）、之後出的選單（例：「出發：法服值班」）。
  一輪結束（SEMFF.menu 回來、畫面空下來）→ 上面的上課／回宿舍處理 → 再按床、再「過一週」。
  活動停點（社課等有人物事件的活動，stop.x.act）：這一版不去，記下來直接再按床（SEMFF 不會在同一個停點再停）。
記錄（只記不改）：HOOK（GAME.say／choose／caption／toast／titleCard／enter、EVENTS.run、CLS.routeStop／attend／goClass／skipClass）＋ SEMFF.menu／SEMFF.jump 的包裝（只記回傳值，照原樣呼叫）。
  逐字稿存 <輸出>/transcript_<case>.json（rows＝全部紀錄、ff＝每一次 jump、stops＝整理過的停點、classes＝每一次上課／翹課、dorm＝每一次回宿舍）。
check（客觀記錄，判定由 BB 做）：每一輪能不能從床進到「過一週」；每一堂上課／翹課有沒有做成；回宿舍有沒有回到；社員有沒有走到 10/24 的法服出發選單；
  非社員有沒有走過 10/24；兩份各自的停點清單；社員停點裡有沒有「法服值班」；社員和非社員的停點清單是否相同。
  修改前（a3b1bd647）預期：社員停在「2026-10-24 08:30 該出發了：法服值班」→「停點相同」那一項 FAIL。
環境變數：CASES（預設 member,nonmember）、NOW_ACTION（go|skip，預設 go）、ROUNDS（床→過一週 最多幾輪，預設 20；上課、回宿舍不算輪）、STOP_KEY（預設 2026-10-27，期中考那一週）、
  ROUND_MAX（一輪最多等幾秒，預設 600）、TRIP_MAX（一趟上課最多幾秒，預設 600）、STUCK_S（上課途中畫面不動幾秒算卡住，預設 180）、CASE_MAX（一份最多幾秒，預設 14400）。
預估時間（SwiftShader 1–4 fps，不要和別的瀏覽器工作同時跑）：每輪快轉 3～6 分鐘；每一堂上課（go）5～10 分鐘＋回宿舍 1～3 分鐘；skip 每堂 2～4 分鐘。
  10/2 → 10/27 約 3.5 週，有劇情的課數量未知（第一版只看到 10/5 日文（上）一堂）：一份約 1～2.5 小時，兩份 2～5 小時（CASE_MAX 4 小時一份封頂）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [NOW_ACTION=go|skip] python3 cc_fa08_probe.py '<URL>/index.html?turbo' <輸出資料夾>"""
import os, sys, json, asyncio, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in os.environ.get('CASES', 'member,nonmember').split(',') if c.strip()]
ROUNDS = int(os.environ.get('ROUNDS', '20'))
NOW_ACTION = os.environ.get('NOW_ACTION', 'go').strip() or 'go'
assert NOW_ACTION in ('go', 'skip'), 'NOW_ACTION 只能是 go 或 skip：%s' % NOW_ACTION
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
CASE_MAX = ENVI('CASE_MAX', 14400)
CONT = '繼續去上課'
STOP_KEY = os.environ.get('STOP_KEY', '2026-10-27')
ROUND_MAX = int(os.environ.get('ROUND_MAX', '600'))
START = ['Y2S1', 4, 5]   # 大二上第 4 週週五
MEMBER_FLAGS = {'lawclub': True, 'CLUB_lawclub_study': True, 'SIS_CLUB_EXPO': True}   # 同 baseline_1102/fafu_semff_stops.js


def hm(h):
    if h is None: return '--:--'
    m = int(round(float(h) * 60)); return '%02d:%02d' % ((m // 60) % 24, m % 60)


# ---------------------------------------------------------------- 存檔（複製自 cc_dl04b_probe.py 的 state_at；只留法律系、最小存檔）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
CLEARP = "(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()"


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    return st, d


# ---------------------------------------------------------------- 記錄（只記不改；HOOK 複製自 cc_dl04b_probe.py，拿掉 CLS 的部分，加 SEMFF）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.enter){ const e0=GAME.enter; GAME.enter=function(z,sp){ push({k:'enter',n:sp?JSON.stringify(sp):'',t:String(z)}); return e0.apply(this,arguments); }; }
  if(typeof EVENTS!=='undefined'&&EVENTS.run){ const v0=EVENTS.run; EVENTS.run=function(ev){ push({k:'ev',n:'',t:String((ev&&ev.id)||'')}); return v0.apply(this,arguments); }; }
  if(typeof CLS!=='undefined'){   /* 上課那一段（複製自 cc_dl04b_probe.py 的 HOOK；只記不改）*/
    if(CLS.routeStop){ const r0=CLS.routeStop; CLS.routeStop=function(GM,it,pl,o){ const r=r0.apply(this,arguments); push({k:'route',n:(it&&it.key)||'',t:JSON.stringify(r||null)}); return r; }; }
    if(CLS.attend){ const a0=CLS.attend; CLS.attend=async function(GM,it,o){ let m={}; try{ const G=GAME.G; m={key:it.key,t0:it.t0,lateMin:+(+CLS.lateMin(G,it)).toFixed(2),isLate:!!CLS.isLate(G,it),isLateAbs:!!CLS.isLateAbsent(G,it),kind:(it.c&&it.c.kind)||null,door:!!(o&&o.door),status:CLS.status(G,it)}; }catch(e){ m={err:String(e.message)}; }
      push({k:'attend',n:(it&&it.key)||'',t:JSON.stringify(m)}); const r=await a0.apply(this,arguments);
      try{ const R=CLS.rec(GAME.G); push({k:'attended',n:it.key,t:JSON.stringify({ret:r,done:!!R.done[it.key],late:!!(R.late&&R.late[it.key]),abs:!!(R.abs&&R.abs[it.key])})}); }catch(e){} return r; }; }
    if(CLS.goClass){ const g0=CLS.goClass; CLS.goClass=async function(GM,it,o){ push({k:'go',n:(it&&it.key)||'',t:JSON.stringify(o||{})}); return g0.apply(this,arguments); }; }
    if(CLS.skipClass){ const k0=CLS.skipClass; CLS.skipClass=async function(GM,it){ push({k:'skip',n:(it&&it.key)||'',t:''}); return k0.apply(this,arguments); }; }
    if(CLS.skipTo){ const q0=CLS.skipTo; CLS.skipTo=async function(GM,h1,o){ push({k:'skipto',n:JSON.stringify(o||{}),t:String(h1)}); const r=await q0.apply(this,arguments); push({k:'skipto1',n:'',t:JSON.stringify(r)}); return r; }; }
  }
  if(typeof SEMFF!=='undefined'){
    /* SEMFF.menu 呼叫 S.jump（S===SEMFF）：包 SEMFF.jump 就記得到每一次跳；照原樣呼叫、只記回傳 */
    const j0=SEMFF.jump; SEMFF.jump=async function(GM,to){ const a=at(); const r=await j0.apply(this,arguments); let q=null; try{ q=(typeof OUT!=='undefined'&&OUT.due)?OUT.due(GAME.G):null; }catch(e){}
      push({k:'ffjump',n:JSON.stringify({from:a,to:+(+to).toFixed(3)}),t:JSON.stringify({why:r&&r.why,stop:r&&r.stop?r.stop.why:null,stopx:r&&r.stop&&r.stop.x?r.stop.x:null,auto:r?r.auto|0:0,msgs:r?r.msgs|0:0,out:q?(q.title||q.id):null,outId:q?q.id:null})}); return r; };
    const m0=SEMFF.menu; SEMFF.menu=async function(GM){ push({k:'ffmenu0',n:'',t:''}); let r; try{ r=await m0.apply(this,arguments); }
      finally{ push({k:'ffmenu1',n:'',t:JSON.stringify(r&&typeof r==='object'?{why:r.why,stop:r.stop?r.stop.why:null}:r)}); } return r; };
  }
  const te=document.getElementById('toast'); if(te){ let lt=''; new MutationObserver(()=>{ const h=(te.textContent||'').trim(); if(h&&h!==lt){ lt=h; push({k:'toast',n:'dom',t:h}); } }).observe(te,{childList:true,subtree:true,characterData:true}); }
  return 'ok'; })()"""
MEMBER_JS = "(()=>{ const G=GAME.G, F=G.flags||{}; return {fafuMember:!!(STORY.fafuMember&&STORY.fafuMember(G)),lawclub:!!F.lawclub,CLUB_lawclub_study:!!F.CLUB_lawclub_study,semffOn:!!(typeof SEMFF!=='undefined'&&SEMFF.on(G)),term:(CALENDAR.termOf(G.day)||{}).id||null,week:(CALENDAR.termOf(G.day)||{}).week||null,date:CALENDAR.dateOf(G.day).key,h:G.hour,zone:G.zone,room:(GAME.E.zone&&GAME.E.zone.dormSetKey)||null}; })()"


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0)
    return [r for r in R if k is None or r['k'] == k]


# ---------------------------------------------------------------- 照玩家操作（pick_opt、press_bed 複製自 cc_dl04b_probe.py）
DECL = ('不去了', '晚一點', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')


def pick_opt(ch, picks=()):
    """選哪一個：picks（開頭符合、或包含（4 字以上）；照順序）→ 起床選單「先起床」→ 婉拒那一類（「不去了」優先於「晚一點」：同 Node 腳本把出遊記成 missed）→ 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def tap_text(pg, cdp, ch, prefix):
    k = next((i for i, o in enumerate(ch or []) if o['t'].startswith(prefix) and not o['dim']), None)
    if k is None: return None
    t = ch[k]['t']; await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); return t


async def wait_choice(pg, cdp, pred, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch'] and pred([o['t'] for o in s['ch']]): return s['ch']
        if s['dlg'] and not s['ch']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(700)
    return None

# ---------------------------------------------------------------- 上課停點／回宿舍（11-02 第二版）
GO_PICKS = (CONT, '照樣跳過', '老位子', '坐中間的位子', '還是進去聽', '先自由活動')   # 一鍵上課途中玩家會選的（同 cc_dl04b_probe.py）
KEYST = """(key=>{ try{ const G=GAME.G, it=CLS.dayItems(G).find(q=>q.key===key), R=CLS.rec(G), c=it&&it.c;
  return {status:it?CLS.status(G,it):null,done:!!R.done[key],late:!!(R.late&&R.late[key]),abs:!!(R.abs&&R.abs[key]),att:c?((R.attend&&R.attend[c.id])|0):null,
          skipNote:!!(R.note&&R.note['skip_'+key]),planSkip:!!(R.note&&R.note['plan_skip_'+key])}; }catch(e){ return {err:String(e.message)}; } })"""
BTN_TXT = "(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })"
POS = "(()=>{ const p=GAME.E.player.obj.position; return [Math.round(p.x*2)/2, Math.round(p.z*2)/2, GAME.E.player.lv|0, !!GAME.E.player.seat]; })()"
# 只讀：現在要處理的那一堂＝今天還沒上、沒翹（plan_skip）、可以進（open／upcoming）、還沒遲到超過 15 分鐘、30 分鐘內開始、有劇情（SEMFF.classEventful；
#   SEMFF.jump 在課前 20 分鐘以內遇到它會回 why=now「先去上課」）。classEventful 自己會把時間放回去（semff3d.js 的 at）
NEEDCLS = r"""(()=>{ try{ const G=GAME.G, h=+G.hour, R=CLS.rec(G); if(typeof SEMFF==='undefined'||!SEMFF.classEventful) return {err:'沒有 SEMFF.classEventful'};
  for(const it of CLS.dayItems(G,G.day)){ if(R.done[it.key]||(CLS.planSkip&&CLS.planSkip(G,it))) continue; const st=CLS.status(G,it); if(st!=='open'&&st!=='upcoming') continue;
    if(it.t0-h>0.5) continue; if(CLS.isLateAbsent&&CLS.isLateAbsent(G,it)) continue; const k=SEMFF.classEventful(G,it); if(!k) continue; const rm=it.room||{};
    return {key:it.key,cid:it.c.id,name:it.c.name,kind:k,exam:!!it.exam,t0:it.t0,t1:it.t1,status:st,room:rm.name||null,story:!!(CLS.storyClass&&CLS.storyClass(G,it)),h:h}; }
  return null; }catch(e){ return {err:String(e.message)}; } })()"""
SKIPBTNS = "(()=>[...document.querySelectorAll('#phoneBody [data-skip]')].map(b=>[b.getAttribute('data-skip'),(b.textContent||'').trim()]))()"


async def settle(pg, cdp, run, tag, picks=(), max_s=180, free_s=3.0):
    """像玩家一樣過到畫面空下來：對話點過去、手機收起來、選單照 pick_opt(picks)；空下來 free_s 秒就回傳 True"""
    t0 = time.time(); since = None
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]; k, why = pick_opt(s['ch'], picks)
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, s['day'], hm(s['h']), s['zone'], J([t[:30] for t in T]), T[k][:30], why))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); since = None; continue
        if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); since = None; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); since = None; continue
        if not s['busy'] and s['depth'] == 0:
            since = since or time.time()
            if time.time() - since >= free_s: return True
        else: since = None
        await pg.wait_for_timeout(700)
    return False


async def trip(pg, cdp, run, tag, it, picks=(), max_s=None):
    """（複製自 cc_dl04b_probe.py 的 trip，拿掉 stop_zone／snap_done）手機「今天」→ 那一堂的「直接去上課」→ 照玩家：對話點過去、路上停下來就選「繼續去上課：」、
    坐位子、上完那一堂（CLS.attend 跑完）。回傳整理好的紀錄"""
    max_s = max_s or ENVI('TRIP_MAX', 600)
    out = {'ok': False, 'btn': None, 'cont': [], 'stuck': False, 'jumped': False, 'shots': []}
    day0 = (await P.clock(pg))['day']
    txt = await P.phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % it['key']
    out['btn'] = await pg.evaluate(BTN_TXT, sel); out['today'] = txt[:700]
    out['shots'].append(await run.shot(pg, tag + '_today'))
    if not out['btn']:
        await L.close_panels(pg, cdp); return out
    n0 = await pl_len(pg); out['n0'] = n0
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
    t0 = time.time(); last = None; since = time.time()
    while time.time() - t0 < max_s:
        st = await pg.evaluate(KEYST, it['key'])
        attended = any(r['n'] == it['key'] for r in await rows(pg, n0, 'attended'))
        s = await P.ts(pg); pos = await pg.evaluate(POS)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0 and not s['phone']
        if attended and free:
            out['ok'] = True; break
        if s['day'] != day0 and not attended:
            out['jumped'] = True; out['jumped_to'] = await P.clock(pg); out['shots'].append(await run.shot(pg, tag + '_jumped')); break
        sig = (s['day'], s['zone'], s['txt'][:40], tuple(o['t'] for o in s['ch']), s['busy'], s['depth'] > 0, bool(st.get('done')), tuple(pos))
        if sig != last: last = sig; since = time.time()
        elif free and time.time() - since > ENVI('STUCK_S', 180):
            out['stuck'] = True; out['stuck_at'] = {'clock': await P.clock(pg), 'pos': pos}; out['shots'].append(await run.shot(pg, tag + '_stuck')); break
        if s['phone'] and not s['ch'] and not s['dlg']:
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); continue
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            k = next((i for i, t in enumerate(T) if t.startswith(CONT)), None)
            if k is not None:
                c = await P.clock(pg); await pg.wait_for_timeout(700)
                p = await run.shot(pg, '%s_cont%d' % (tag, len(out['cont']) + 1)); out['shots'].append(p)
                out['cont'].append({'clock': c, 'opts': T, 'shot': p})
                run.note('%s：%s %s 在 %s 出現「%s」（選項 %s）→ 選' % (tag, c['key'], hm(c['h']), c['zone'], T[k][:40], J(T)))
                await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            k, why = pick_opt(s['ch'], tuple(picks) + GO_PICKS)
            run.note('%s %s %s 選項 %s → %s' % (tag, hm(s['h']), s['zone'], J([t[:24] for t in T]), T[k][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        await pg.wait_for_timeout(900)
    out['end'] = await P.clock(pg); out['st'] = await pg.evaluate(KEYST, it['key'])
    if out['ok']:
        await pg.wait_for_timeout(600); out['shots'].append(await run.shot(pg, tag + '_class'))
    R = await rows(pg, n0)
    out['caps'] = [[r['t'], r.get('z'), r.get('h')] for r in R if r['k'] == 'cap' and not r['n']]
    out['enters'] = [[r['t'], r['n'], r.get('h')] for r in R if r['k'] == 'enter']
    out['routes'] = [[json.loads(r['t']), r.get('z'), r.get('h')] for r in R if r['k'] == 'route']
    out['evs'] = [[r['t'], r.get('z'), r.get('h')] for r in R if r['k'] == 'ev']
    out['att'] = next((dict(json.loads(r['t']), h=r.get('h'), z=r.get('z')) for r in R if r['k'] == 'attend' and r['n'] == it['key']), None)
    out['fin'] = next((json.loads(r['t']) for r in R if r['k'] == 'attended' and r['n'] == it['key']), None)
    run.note('%s：結束 %s；換區域 %s；routeStop %s；字幕 %s；事件 %s；上課 %s → %s' % (tag, J(out['end']), J(out['enters']), J(out['routes']), J([c[0] for c in out['caps']]),
                                                                       J([[e[0], e[1], hm(e[2])] for e in out['evs']]), J(out['att']), J(out['fin'])))
    return out


async def skip_class(pg, cdp, run, tag, it):
    """翹（玩家操作）：手機「今天」→「跳過時間」選第一個 ≥ 下課時間的按鈕（沒有就選最晚的）→「照樣跳過」。被停點（電話、約好的時間）攔下來就再跳，最多 3 次"""
    out = {'mode': 'skip', 'tries': [], 'shots': []}
    for k in range(3):
        st = await pg.evaluate(KEYST, it['key']); c = await P.clock(pg)
        if st.get('status') not in ('open', 'upcoming') or st.get('done') or c['h'] > it['t0'] + 0.25:   # 已經過了上課時間（沒去＝翹成了；SEMFF 不會再 why=now）
            break
        txt = await P.phone_tab(pg, cdp, 'today')
        btns = await pg.evaluate(SKIPBTNS)
        out['shots'].append(await run.shot(pg, '%s_today%d' % (tag, k + 1)))
        if not btns:
            out['err'] = '手機「今天」沒有「跳過時間」按鈕'; out['today'] = txt[:700]; await L.close_panels(pg, cdp); break
        vals = [(float(v), v, lab) for v, lab in btns]
        cand = [x for x in vals if x[0] >= it['t1'] - 1e-3]
        pick = min(cand) if cand else max(vals)
        n0 = await pl_len(pg)
        run.note('%s：%s %s 手機「今天」跳過時間 %s → 按「%s」' % (tag, c['key'], hm(c['h']), J([x[2] for x in vals]), pick[2]))
        await L.tap(pg, cdp, '#phoneBody [data-skip="%s"]' % pick[1]); await pg.wait_for_timeout(1200)
        ok = await settle(pg, cdp, run, tag, picks=('照樣跳過',), max_s=240)
        R = await rows(pg, n0)
        out['tries'].append({'clock': c, 'btn': pick[2], 'settled': ok, 'skipto': [[x['k'], x['n'], x['t']] for x in R if x['k'] in ('skipto', 'skipto1')],
                             'chooses': [x['t'] for x in R if x['k'] == 'choose'], 'caps': [x['t'] for x in R if x['k'] == 'cap' and not x['n']], 'end': await P.clock(pg)})
    out['st'] = await pg.evaluate(KEYST, it['key']); out['end'] = await P.clock(pg)
    out['shots'].append(await run.shot(pg, tag + '_after'))
    out['ok'] = bool(out['tries']) and not out['st'].get('done') and (out['st'].get('status') == 'missed' or out['end']['h'] > it['t0'] + 0.25 or out['end']['day'] != out['tries'][0]['clock']['day'])
    run.note('%s：翹 %s → %s；狀態 %s' % (tag, it['name'], J(out['end']), J(out['st'])))
    return out


async def handle_class(pg, cdp, run, case, it, n):
    tag = '%s_c%d' % (case, n)
    c = await P.clock(pg)
    run.note('%s：%s %s 有劇情的課要處理：%s（%s %s–%s，%s；classEventful=%s）→ NOW_ACTION=%s' % (tag, c['key'], hm(c['h']), it['name'], it['key'], hm(it['t0']), hm(it['t1']), it.get('room'), it['kind'], NOW_ACTION))
    o = {'clock': c, 'it': it, 'action': NOW_ACTION}
    if NOW_ACTION == 'skip':
        o.update(await skip_class(pg, cdp, run, tag, it))
    else:
        tr = await trip(pg, cdp, run, tag, it)
        o.update({k: v for k, v in tr.items()}); o['mode'] = 'go'
        if not tr.get('btn'):
            run.note('%s：手機「今天」沒有「%s」的「直接去上課」（劇情課 storyClass=%s）→ 改用「跳過時間」' % (tag, it['name'], it.get('story')))
            o['fallback'] = 'skip'; o.update(await skip_class(pg, cdp, run, tag + 's', it))
        else:
            o['ok'] = bool(tr.get('ok') and tr.get('fin') and tr['fin'].get('done'))
            await settle(pg, cdp, run, tag + '_after', picks=('先自由活動',), max_s=120)   # 下課選單（今天還有下一堂才出）：先自由活動
    return o


async def go_dorm(pg, cdp, run, case, n):
    """照玩家回宿舍：手機「地點」→「宿舍」的「前往」（快速前往；路上被事件攔下來＝演完再按，最多 4 次）"""
    tag = '%s_d%d' % (case, n)
    o = {'start': await P.clock(pg), 'tries': [], 'ok': False, 'shots': []}
    for k in range(4):
        await settle(pg, cdp, run, tag, picks=('先自由活動',), max_s=150)
        c = await P.clock(pg)
        if c['zone'] == 'dorm': o['ok'] = True; break
        txt = await P.phone_tab(pg, cdp, 'places')
        sel = '#phoneBody [data-place^="dorm|"]'
        btn = await pg.evaluate(BTN_TXT, sel)
        if not btn:
            o['err'] = '手機「地點」沒有宿舍的「前往」'; o['places'] = txt[:800]; o['shots'].append(await run.shot(pg, tag + '_noplace')); await L.close_panels(pg, cdp); break
        n0 = await pl_len(pg)
        await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1800)
        await settle(pg, cdp, run, tag, picks=('先自由活動',), max_s=150)
        R = await rows(pg, n0)
        o['tries'].append({'clock': c, 'btn': btn, 'enters': [[x['t'], x['n']] for x in R if x['k'] == 'enter'], 'toasts': [x['t'] for x in R if x['k'] == 'toast'], 'evs': [x['t'] for x in R if x['k'] == 'ev'], 'end': await P.clock(pg)})
    o['end'] = await P.clock(pg); o['ok'] = o['end']['zone'] == 'dorm'
    o['shots'].append(await run.shot(pg, tag + '_end'))
    run.note('%s：回宿舍 %s → %s（%s）%s' % (tag, J(o['start']), J(o['end']), '到了' if o['ok'] else '沒到', J([t.get('toasts') for t in o['tries']])))
    return o


async def one_round(pg, cdp, run, case, r):
    """一輪：床 → 快轉 → 過一週 → 等到 SEMFF.menu 回來、之後的選單／對話處理完、畫面空下來。回傳這一輪的紀錄"""
    tag = '%s_r%d' % (case, r)
    out = {'round': r, 'start': await P.clock(pg), 'ok': False, 'shots': []}
    if not await press_bed(pg, cdp, run):
        out['err'] = '按不到床'; out['shots'].append(await run.shot(pg, tag + '_nobed')); return out
    ch = await wait_choice(pg, cdp, lambda T: any(t.startswith('快轉') for t in T), 30)
    if not ch:
        s = await P.ts(pg); out['err'] = '床的選單沒有「快轉」'; out['bedmenu'] = [o['t'] for o in s['ch']]
        out['shots'].append(await run.shot(pg, tag + '_nofastfwd')); return out
    out['bedmenu'] = [o['t'] for o in ch]
    await tap_text(pg, cdp, ch, '快轉')
    ch = await wait_choice(pg, cdp, lambda T: any(t.startswith('過一週') for t in T), 30)
    if not ch:
        out['err'] = 'SEMFF 選單沒有「過一週」'; out['shots'].append(await run.shot(pg, tag + '_noweek')); return out
    out['ffmenu'] = [o['t'] for o in ch]
    out['shots'].append(await run.shot(pg, tag + '_ffmenu'))
    n0 = await pl_len(pg); out['n0'] = n0
    await tap_text(pg, cdp, ch, '過一週')
    t0 = time.time(); ended = False; ncard = 0; free_since = None; out['after'] = []
    while time.time() - t0 < ROUND_MAX:
        R = await rows(pg, n0)
        cards = [x for x in R if x['k'] == 'card']
        if len(cards) > ncard:   # 日期字卡出來了：截圖（2.4 秒；低幀率可能截不到，紀錄以 HOOK 為準）
            ncard = len(cards); await pg.wait_for_timeout(300); out['shots'].append(await run.shot(pg, '%s_card%d' % (tag, ncard)))
        if not ended and any(x['k'] == 'ffmenu1' for x in R): ended = True; out['menu_end_clock'] = await P.clock(pg)
        s = await P.ts(pg)
        if s['ch']:
            T = [o['t'] for o in s['ch']]
            if ended:
                out['shots'].append(await run.shot(pg, '%s_after_choice%d' % (tag, len(out['after']) + 1)))
            k, why = pick_opt(s['ch'])
            if ended: out['after'].append({'clock': await P.clock(pg), 'opts': T, 'pick': T[k]})
            run.note('%s %s %s %s 選項 %s → %s（%s）' % (tag, s['day'], hm(s['h']), s['zone'], J([t[:30] for t in T]), T[k][:30], why))
            if why == 'first' and T[k].startswith(GO_PREFIX):   # 只剩「出發：」（must）＝不按，停在這裡由 BB 看
                out['must_go'] = T; break
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); free_since = None; continue
        if s['phone'] and not s['dlg']:
            run.note('%s %s %s 手機自己打開了（要回的訊息）→ 收起來' % (tag, s['day'], hm(s['h'])))
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(600); free_since = None; continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); free_since = None; continue
        free = not s['busy'] and s['depth'] == 0
        if ended and free:
            free_since = free_since or time.time()
            if time.time() - free_since > 8: out['ok'] = True; break   # 空下來 8 秒（讓 STORY.tick／OUT.tick 有機會出出發提醒）
        else: free_since = None
        await pg.wait_for_timeout(800)
    R = await rows(pg, n0)
    out['jumps'] = [dict(json.loads(x['t']), **json.loads(x['n'])) for x in R if x['k'] == 'ffjump']
    out['cards'] = [[x['n'], x['t'], x.get('d'), x.get('h')] for x in R if x['k'] == 'card']
    out['toasts'] = [x['t'] for x in R if x['k'] == 'toast' and not x['n']]
    out['evs'] = [x['t'] for x in R if x['k'] == 'ev']
    out['end'] = await P.clock(pg)
    out['shots'].append(await run.shot(pg, tag + '_end'))
    return out


async def run_case(p, run, case):
    member = case == 'member'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    res = {'case': case, 'rounds': [], 'stops': []}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % case, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); run.note('HOOK ' + await pg.evaluate(HOOK))
        flags = {'EXCHANGE_ROUTE': 'TW'}
        if member: flags.update(MEMBER_FLAGS)
        st, d = await state_at(pg, START, 21.0, 'dorm', flags)
        await L.load_state(pg, st, quiet_events=False, quiet_phone=False); await pg.evaluate(CLEARP); await pg.wait_for_timeout(3500)
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
        mem = await pg.evaluate(MEMBER_JS); res['member_state'] = mem
        run.setup('[前置] 最小存檔（GAME.defaults＋BASEF）→ %s（%s 第 %s 週，週五）21:00 宿舍；旗標 %s；讀檔後遊戲算出 %s' % (d['key'], d['term'], d['week'], J(flags), J(mem)))
        run.check('%s：讀檔後 STORY.fafuMember＝%s（前置正確）' % (case, member), mem['fafuMember'] == member, J(mem))
        run.check('%s：讀檔後 SEMFF.on（床有「快轉」的前提）' % case, mem['semffOn'], J(mem))
        res['shots'] = [await run.shot(pg, case + '_start')]
        res['classes'] = []; res['dorm'] = []; res['end_reason'] = None
        t_case = time.time(); r = 0; nc = 0; nd = 0; seen = {}
        while True:
            if time.time() - t_case > CASE_MAX: res['end_reason'] = 'CASE_MAX %ds' % CASE_MAX; break
            c = await P.clock(pg)
            if c['key'] >= STOP_KEY: res['end_reason'] = '到 %s（≥ STOP_KEY %s）' % (c['key'], STOP_KEY); break
            if c['zone'] != 'dorm':   # 人不在宿舍：照玩家回去（手機「地點」），不瞬移
                nd += 1; o = await go_dorm(pg, cdp, run, case, nd); res['dorm'].append(o)
                run.check('%s 回宿舍 %d：%s %s 從 %s 手機「地點」→ 宿舍' % (case, nd, o['start']['key'], hm(o['start']['h']), o['start']['zone']), o['ok'], o.get('err', '') or J(o['end']))
                if not o['ok']: res['end_reason'] = '回不了宿舍'; res['left_dorm'] = o['end']; break
                continue
            need = await pg.evaluate(NEEDCLS)
            if isinstance(need, dict) and need.get('err'): run.note('%s：NEEDCLS 例外 %s（當作沒有要處理的課）' % (case, need['err'])); need = None
            if need:
                if need['exam'] or need['kind'] == 'exam':
                    res['end_reason'] = '考試前停止：%s %s %s' % (c['key'], hm(need['t0']), need['name']); res['exam_at'] = need; break
                seen[need['key']] = seen.get(need['key'], 0) + 1
                if seen[need['key']] > 2: res['end_reason'] = '同一堂（%s）處理兩次還在，停止' % need['key']; break
                nc += 1; o = await handle_class(pg, cdp, run, case, need, nc); res['classes'].append(o)
                run.check('%s 上課停點 %d：%s %s %s（%s）→ %s' % (case, nc, c['key'], hm(c['h']), need['name'], need['kind'], o.get('mode')), bool(o.get('ok')),
                          J({'end': o.get('end'), 'st': o.get('st'), 'fin': o.get('fin'), 'stuck': o.get('stuck_at'), 'jumped': o.get('jumped_to'), 'err': o.get('err')}))
                continue
            if r >= ROUNDS: res['end_reason'] = 'ROUNDS %d 輪用完' % ROUNDS; break
            r += 1
            o = await one_round(pg, cdp, run, case, r); res['rounds'].append(o)
            run.note('%s 第 %d 輪：%s → %s；jumps %s；字卡 %s；之後的選單 %s；toast %s；事件 %s%s' % (case, r, J(o['start']), J(o.get('end')), J(o.get('jumps')), J(o.get('cards')),
                     J([a['opts'] for a in o.get('after', [])]), J(o.get('toasts')), J(o.get('evs')), ('；錯誤 ' + o['err']) if o.get('err') else ''))
            run.check('%s 第 %d 輪：床 → 快轉 → 過一週 → 跑完' % (case, r), o['ok'] and not o.get('err'), o.get('err', '') or ('逾時 %ds' % ROUND_MAX if not o['ok'] else ''))
            if o.get('must_go'): res['end_reason'] = '只剩「出發：」（必去）%s' % J(o['must_go']); res['must_go'] = o['must_go']; break
            if not o['ok'] or o.get('err'): res['end_reason'] = '第 %d 輪沒跑完' % r; break
            ex = next((j for j in o.get('jumps', []) if (j.get('stop') or '').startswith('考試')), None)
            if ex: res['end_reason'] = '快轉停在考試前：%s（不考，停止）' % ex['stop']; res['exam_at'] = ex; break
        run.note('%s：結束原因 %s；%d 輪快轉、%d 次上課停點、%d 次回宿舍；最後 %s' % (case, res['end_reason'], r, nc, nd, J(await P.clock(pg))))
        res['final'] = await P.clock(pg)
        # 停點：每一次 jump 回來的那一刻（d,h 是 push 當下）＋ why＋原因
        R = await rows(pg, 0)
        res['ff'] = [dict(json.loads(x['t']), at_d=x.get('d'), at_h=x.get('h'), at_z=x.get('z'), **json.loads(x['n'])) for x in R if x['k'] == 'ffjump']
        res['stops'] = []
        res['now_list'] = []
        for j in res['ff']:
            if j['why'] == 'end': continue
            if j['why'] == 'now': res['now_list'].append('%s %s now:%s' % (j['at_d'], hm(j['at_h']), j.get('stop'))); continue   # 探針按床的時間差，不比
            why = j['why'] + ((':' + j['stop']) if j.get('stop') else '') + (('｜OUT.due＝' + j['out']) if j.get('out') else '')
            res['stops'].append('%s %s %s' % (j['at_d'], hm(j['at_h']), why))
        res['cards'] = [[x['n'], x['t']] for x in R if x['k'] == 'card']
        res['fafu_menus'] = [[x.get('d'), hm(x.get('h')), x['t']] for x in R if x['k'] == 'choose' and '法服' in x['t']]
        res['rows'] = R
        run.check('%s：沒有 JS 例外' % case, not errs, J(errs[:3]))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % case, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, case + '_exception')
        except Exception: pass
        try: res['rows'] = await rows(pg, 0)
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_%s.json' % case), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def main():
    run = L.Run('fa08_%s_' % NOW_ACTION + '+'.join(CASES), OUT); os.makedirs(OUT, exist_ok=True)
    print('==== FA-08（SHA %s）URL %s NOW_ACTION=%s ====' % (os.environ.get('SHA', '?'), URL, NOW_ACTION), flush=True)
    if '?turbo' not in URL and '&turbo' not in URL: run.note('注意：URL 沒有 ?turbo（驗收計畫寫瀏覽器 turbo）')
    R = {}
    async with async_playwright() as p:
        for c in CASES:
            print('---- case %s ----' % c, flush=True)
            R[c] = await run_case(p, run, c)
    for c, r in R.items():
        run.note('%s 停點（%d）：%s' % (c, len(r.get('stops', [])), J(r.get('stops'))))
        run.note('%s 日期字卡：%s' % (c, J(r.get('cards'))))
    for c, r in R.items():
        run.note('%s：結束原因 %s；最後 %s；why=now %s；上課停點 %s' % (c, r.get('end_reason'), J(r.get('final')), J(r.get('now_list')),
                 J([[o['clock']['key'], hm(o['clock']['h']), o['it']['name'], o.get('mode'), o.get('ok')] for o in r.get('classes', [])])))
    if 'member' in R:
        fm = R['member'].get('fafu_menus', [])
        hit = [x for x in fm if x[0] == '2026-10-24' and '出發' in x[2]]
        run.check('社員：走到 2026-10-24 08:30 看到「出發：法服值班」選單（BB：這樣才算走到）', bool(hit), J({'法服選單': fm, '最後': R['member'].get('final'), '結束原因': R['member'].get('end_reason')}))
    if 'nonmember' in R:
        fin = R['nonmember'].get('final') or {}
        run.check('非社員：停點記到 2026-10-24 之後（最後日期 %s）' % fin.get('key'), (fin.get('key') or '') > '2026-10-24', J({'最後': fin, '結束原因': R['nonmember'].get('end_reason')}))
    if 'member' in R:
        fafu = [s for s in R['member'].get('stops', []) if '法服' in s] + ['字卡 ' + J(x) for x in R['member'].get('cards', []) if '法服' in J(x)]
        for r0 in R['member'].get('rounds', []):
            for a in r0.get('after', []):
                if any('法服' in t for t in a['opts']): fafu.append('%s %s 選單 %s' % (a['clock']['key'], hm(a['clock']['h']), J(a['opts'])))
        run.check('社員：快轉停點／停下來後的選單沒有「法服值班」', not fafu, J(fafu))
    if 'member' in R and 'nonmember' in R:
        a, b = R['member'].get('stops', []), R['nonmember'].get('stops', [])
        diff = {'只有社員': [s for s in a if s not in b], '只有非社員': [s for s in b if s not in a]}
        run.check('社員和非社員的停點相同（FA-08 通過條件；AA 定稿的一次性事件可以停＝由 BB 看差異判）', a == b, J(diff))
    with open(os.path.join(OUT, 'fa08_summary.json'), 'w', encoding='utf-8') as f:
        json.dump({'NOW_ACTION': NOW_ACTION, **{c: {'stops': r.get('stops'), 'now_list': r.get('now_list'), 'cards': r.get('cards'), 'fafu_menus': r.get('fafu_menus'), 'member_state': r.get('member_state'),
                   'left_dorm': r.get('left_dorm'), 'end_reason': r.get('end_reason'), 'final': r.get('final'),
                   'classes': [{'clock': o['clock'], 'it': o['it'], 'mode': o.get('mode'), 'ok': o.get('ok'), 'end': o.get('end'), 'st': o.get('st'), 'fallback': o.get('fallback')} for o in r.get('classes', [])],
                   'dorm': [{'start': o['start'], 'end': o['end'], 'ok': o['ok']} for o in r.get('dorm', [])]} for c, r in R.items()}}, f, ensure_ascii=False, indent=1)
    print('SHA', os.environ.get('SHA', '?'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
