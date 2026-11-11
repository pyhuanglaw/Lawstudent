"""CC（帳號 A）11-12：GOCLASS「去上課被記成翹課」（BUG-GOCLASS-SKIPPED-1111，X337，使用者 11-11 P0）。新舊對照用：同一支探針跑
  新版（開發分支 6f9961fa6 以後：翹課確認「還是去」第一個、「翹」第二個；選單防連點 350 ms，自動化瀏覽器要網址加 ?tapguard 才擋）
  舊版（779ddd650＝線上 v9.10.24：確認是「翹」第一個、沒有防連點——這是預期，不算新版的錯）。
使用者原話：「我早上選去上課 結果直接跳到法律服務圖書館 打開手機還說我沒去上課 上課至少也要播完吧? 連到教室都沒有」
存檔旁證（BB 02:56）：第 57 天週三 08:17 在手機回可昕；沒有 rem_57:crim_gen1（08:40 以前就寫了 plan_skip）；plan_skip 只有 skipClass 選「翹」會寫；之後 done 只有服務學習，15:29 在法圖。
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢。觸控一律 CDP Input.dispatchTouchEvent（playlib.touch_tap）。不用 ?turbo、不瞬移；讀檔只當前置（log 印 [前置／捷徑]）。
探針包了 GAME.choose／say／caption／toast／enter 和 CLS.queueWake／wakeMenu／skipClass／goClass／attend／seatPick／skipTo 只為了記錄（照樣呼叫原本的），不改內容。
對照的程式（6f9961fa6）：src/classes3d.js S.wakeMenu 第 1196 行（早安 → 選單〔直接去上課／翹這堂課／先起床再說〕）、S.skipClass 第 1207 行（新：〔還是去／翹〕；舊：〔翹／還是去〕）、
  第 1202–1203 行（翹了 → 〔再睡一下（睡到 hh:mm）／起床〕→ skipTo nap → 再排一次起床選單）、S.oneTick 第 1300 行（玩家空下來 1.5 秒＋醒來 2.5 秒才出；手機開著＝不空）、
  S.todayHTML 第 1080 行（手機「今天」：翹課／上過了／反悔：直接去上課）；src/game3d.js renderChoose 第 141 行（#choices 貼底、留著上一句時墊高到對話框上面）、tapTooSoon 第 138 行；
  src/home3d.js 第 103 行（在家醒來選「今天不去」也會寫 plan_skip——宿舍的局不會走到）。
前置存檔：最小存檔（同 cc_wake_stale_probe.py 的 mkstate）2025-11-11（第 56 天）23:00 宿舍房間 → 真的走到床、按「睡覺」選「睡到明天早上」→ 第 57 天起床。
  條件事件照常（EVQUIET=1 才關），只關「要回覆的訊息自動打開手機」。每一輪開始叫 CLS.clearPending()【前置】（清掉上一輪留下的待出選單）。
PARTS（逗號分隔；預設全部）：
  REPRO    （GOCLASS_repro）起床選單出現（「早安。今天的課…」那一句）起連點，每 TAP_MIN～TAP_MAX ms（預設 80～120，隨機）一下。位置輪 MODES（預設 A,B,C）：
           A＝對話框中央；B＝起床選單第一項的位置；C＝第二項的位置；D＝起床選單第二項「翹這堂課」和翹課確認第一項重疊的地方（雲端自檢量到：橫向 844×390 起床選單三項各 63 px 高、
           確認兩項各 44 px 高，都貼底墊在對話框上面，「翹這堂課」y 125–188 和確認第一項 y 174–218 重疊在 y 174–188——舊版那一格是「翹」、新版是「還是去」）。
           位置先用正常速度叫出一次選單量 #choices 按鈕的框（再照文字選「翹這堂課」量確認選單，最後照文字選「還是去」收尾）。B、C：畫面上只有對話（還沒有選單）時點對話框中央
           （不點對話就不會出選單；點下去那一刻選單出了沒有是賽跑——這正是要測的）。每種 REPEAT 次（預設 3，四種共 12 次）。連到所有選單關掉、人空下來 FREEWAIT 秒（預設 6：等得到小睡醒來的第二次起床選單），上限 MASH_MAX 秒（60）；
           選單在畫面上 STALL 秒（預設 10）都沒被點到（點的位置底下沒有選項）＝記「其他（卡在選單）」、停止。
           每次記：每個選單出現的時間、選了哪一項（文字）、離選單出現幾 ms、那一下按下去離出現幾 ms、COVER（選單出現那一刻 choices 幾層、每層文字、D.coverWho、#dlg 開著沒有）；
           最後的 zone、G.hour、CLS.rec 的 note／done／attend／late／abs 差異、手機「今天」的字（CLS.todayHTML）。統計：翹（plan_skip）／去上課／其他。只 R.note，不判定。
  GUARD    （GOCLASS_guard）網址加 ?tapguard，同 REPRO 連點 GUARDN 次（預設 10）：判定＝每一個被選到的選項，按下去那一下離選單出現 ≥ 350 ms（新版嚴格大於；舊版沒有防連點＝預期 FAIL）；
           BB 的判定「不會翹課（note 沒有 plan_skip）」也 R.check（注意：防連點只擋 350 ms 內，連點超過 350 ms 還是點得到）。
           另外正常速度（選單出現 600 ms 後、照文字找按鈕）三項各選一次（各自重睡一次）：直接去上課→出門／翹這堂課→出確認選單（選「還是去」收尾）／先起床再說→沒事、沒有 plan_skip。
  FULL     （GOCLASS_full）睡覺 → 起床選單照文字選「直接去上課：刑法總則（一）」→ 到教室、坐下（有沒有問座位）→ 課堂逐句（第一句、最後一句、幾句、花多久）→ 下課（下課選單照文字選「先自由活動」）
           → 真的點手機 →「今天」「課表」截圖 → 判定：到了教室、播了課、done 有這一堂、note 沒有 plan_skip_／skip_、手機「今天」那一列寫「上過了」。
  SERVICE  （GOCLASS_service）【前置】第 57 天 12:40 在宿舍房間 → 手機「今天」服務學習那一列按「直接去上課」→ 逐句、每一步截圖、跳了多少時間、落在哪個 zone、按下到能動幾秒。只記錄。
           LAWWW 說應該是「櫃台報到一句旁白 → 淡出、跳到下課 → 字幕『服務學習（一）：第 n 次』」。
  OTHERS   TERMS（預設 Y1S2,Y2S1,Y3S1；也可以寫日期 YYYY-MM-DD）每個學期第 OTHERWEEK 週（預設 5）第一個「上午有課、教室有 zone」的平日：前一晚睡覺 → 照文字選去上課 → 進教室、≥1 句課堂、done。
  REGRET   （GOCLASS_regret）照文字「翹這堂課」→「翹」→「起床」→ 上課前真的點手機「今天」：要有「反悔：直接去上課」→ 按 → 到教室、課播完（逐句）、手機寫上過了、plan_skip 被清掉；
           【前置／捷徑】同一份進度改成 09:20、09:40（只記鍵寫什麼）、11:45（判定：沒有「反悔」）。註：779ddd650 的 classes3d.js 第 1084 行已經有「反悔：直接去上課」（不是新版才加的）。
  PHONE    （GOCLASS_phone）起床後、起床選單出來以前先真的點手機鍵 →【前置／捷徑】醒來那一刻放一則可昕的未回訊息（PHONE.post，兩個回覆鍵）→「訊息」→ 可昕 → 回 → 關手機。
           PHONEMODES（預設 close2,reply）各 PHONEN 次（預設 10）：close2＝回一則以後「關手機」那一下連按兩次（間隔 80～150 ms）；reply＝回覆鍵連按 PHONE_TAPS 下（預設 5）再正常關手機。
           之後 FOLLOW=1（預設）：有對話就點對話框中央、有選單就點「剛才在手機上按的那個位置」（close2＝關閉鍵、reply＝回覆鍵），連到選單都關掉（同 REPRO 的停止條件）。
           記：起床選單那一句、選單出現時離上一次觸控幾 ms；選單每一項的框和手機上按過的鍵（回覆鍵、關閉鍵、頁籤）重不重疊；第 2 項「翹這堂課」和哪一顆重疊；有沒有落到「翹這堂課」、再落到「翹」。
  USERVIEW （GOCLASS_userview）照文字「翹這堂課」→「翹」，然後 a）「起床」：手機「今天」的字、截圖；站著不動 USERWAIT 秒（預設 20）記目標列／提醒／字幕；
           【前置／捷徑】同一份進度改成 12:30，等遊戲時間自然走到 13:40（USERTO）記提醒、目標列、有沒有選單；b）「再睡一下」：第二次起床選單第一項是什麼、照文字按下去、落在哪個 zone、G.hour、按下到能動幾秒、手機「今天」。
           COVER 併在每個選單的紀錄裡。
環境變數：LW_TESTS SHA PARTS REPEAT MODES TAP_MIN TAP_MAX FREEWAIT MASH_MAX STALL GUARDN PHONEN PHONEMODES PHONE_TAPS FOLLOW TERMS OTHERWEEK USERWAIT USERTO EVQUIET PORTRAIT SEED TARGET（預設 2025-11-12）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=REPRO,... python3 cc_goclass_probe.py <url> <out>"""
import os, sys, json, asyncio, time, random, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
ENV = os.environ.get
PARTS = [p.strip().upper() for p in (ENV('PARTS') or 'REPRO,GUARD,FULL,SERVICE,OTHERS,REGRET,PHONE,USERVIEW').split(',') if p.strip()]
SHA = (ENV('SHA') or '')[:9]
REPEAT = int(ENV('REPEAT') or 3); MODES = [m for m in (ENV('MODES') or 'A,B,C,D').split(',') if m]
TAP_MIN, TAP_MAX = int(ENV('TAP_MIN') or 80), int(ENV('TAP_MAX') or 120)
FREEWAIT = float(ENV('FREEWAIT') or 6); MASH_MAX = float(ENV('MASH_MAX') or 60); STALL = float(ENV('STALL') or 10)
GUARDN = int(ENV('GUARDN') or 10); PHONEN = int(ENV('PHONEN') or 10); PHONEMODES = [m for m in (ENV('PHONEMODES') or 'close2,reply').split(',') if m]
PHONE_TAPS = int(ENV('PHONE_TAPS') or 5); FOLLOW = (ENV('FOLLOW') or '1') != '0'
TERMS = [t for t in (ENV('TERMS') or 'Y1S2,Y2S1,Y3S1').split(',') if t]; OTHERWEEK = int(ENV('OTHERWEEK') or 5)
USERWAIT = float(ENV('USERWAIT') or 20); USERTO = float(ENV('USERTO') or 13 + 40 / 60)
EVQUIET = ENV('EVQUIET') == '1'; PORTRAIT = ENV('PORTRAIT') == '1'
TARGET = ENV('TARGET') or '2025-11-12'
random.seed(int(ENV('SEED') or 1111))
R = L.Run('goclass', OUT)
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
SHOTN = [0]


def guard_url(u):
    return u if 'tapguard' in u else u + ('&' if '?' in u else '?') + 'tapguard'


async def shot(pg, label):
    SHOTN[0] += 1; p = os.path.join(OUT, 'gc_%03d_%s.png' % (SHOTN[0], label))
    try: await pg.screenshot(path=p)
    except Exception as e: R.note('截圖失敗 %s：%r' % (label, e))
    return os.path.basename(p)


# ---------- 前置存檔（同 cc_wake_stale_probe.py）----------
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'dorm', 'dorm_hall')


def mkstate(d, h, zone, flags=None, pos=None):
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF, **(flags or {}))}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st


# ---------- 記錄鉤子（只記、照樣呼叫原本的）----------
HOOK = r"""(()=>{ if(window.__GC&&window.__GC.g===GAME) return {again:true}; const W=window.__GC={g:GAME,log:[],lastDown:null,lastChooseT:null};
  const now=()=>+performance.now().toFixed(1);
  const st=()=>{ try{ const G=GAME.G; return {h:+(+G.hour).toFixed(3),d:G.day,z:G.zone}; }catch(e){ return {}; } };
  const push=o=>{ const e=Object.assign({t:now()},st(),o); W.log.push(e); if(o.k!=='down') W.nd=(W.nd|0)+1; if(W.log.length>6000) W.log.splice(0,2000); return e; };
  const rects=()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>{ const r=b.getBoundingClientRect(); return {t:((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim().slice(0,40),r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]}; }); };
  const cover=()=>{ const D=GAME.D||{}, dl=document.getElementById('dlg'), ch=document.getElementById('choices'), r=dl?dl.getBoundingClientRect():null;
    return {coverWho:D.coverWho||null, busyDepth:D.busyDepth|0, busyWho:(D.busyWho||[]).slice(-4).map(s=>String(s).slice(0,90)), dlgActive:!!D.active, dlgShown:!!dl&&!dl.classList.contains('hide'), dlgStatic:!!dl&&dl.classList.contains('static'), dlgSide:!!dl&&dl.classList.contains('side'),
      dlgRect:r?[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]:null, dlgText:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60),
      chHidden:!ch||ch.classList.contains('hide'), chLayers:ch?ch.children.length:0, chTexts:ch?[...ch.children].map(e=>(e.textContent||'').trim().slice(0,40)):[], phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), adv:typeof ADV!=='undefined'&&!!ADV.active}; };
  W.rects=rects; W.cover=cover; W.push=push;
  const wrap=(o,fn,pre,post)=>{ const f0=o&&o[fn]; if(typeof f0!=='function') return false; o[fn]=function(){ let e=null; try{ e=pre?pre.apply(null,arguments):null; }catch(x){} const r=f0.apply(this,arguments);
      if(post&&r&&typeof r.then==='function') r.then(v=>{ try{ post(e,v); }catch(x){} },()=>{}); else if(post){ try{ post(e,r); }catch(x){} } return r; }; return true; };
  const ok={};
  ok.choose=wrap(GAME,'choose',(opts,opt)=>{ const t0=now(); W.lastChooseT=t0; const all=(opts||[]).map(o=>o&&o.t); const e=push({k:'choose',all,opts:(opts||[]).filter(o=>o&&!o.hidden).map(o=>o.t),sinceDown:W.lastDown!=null?+(t0-W.lastDown).toFixed(1):null}); e.t0=t0;
      setTimeout(()=>{ try{ e.rects=rects(); e.cover=cover(); }catch(x){} },0); requestAnimationFrame(()=>{ try{ e.rects2=rects(); }catch(x){} }); return e; },
    (e,i)=>{ const t=now(); push({k:'pick',ref:e&&e.t0,i,txt:e&&e.all?e.all[i]:null,first:e&&e.opts?e.opts[0]:null,dt:e?+(t-e.t0).toFixed(1):null,downDt:(e&&W.lastDown!=null)?+(W.lastDown-e.t0).toFixed(1):null}); });
  ok.say=wrap(GAME,'say',(who,text)=>push({k:'say',who:who?(who.name||String(who)):null,text:String(text),sinceDown:W.lastDown!=null?+(now()-W.lastDown).toFixed(1):null,cover:/^早安/.test(String(text))?cover():undefined}));
  ok.caption=wrap(GAME,'caption',(who,text)=>push({k:'cap',who:who||'',text:String(text)}));
  ok.toast=wrap(GAME,'toast',(text)=>push({k:'toast',text:String(text)}));
  ok.enter=wrap(GAME,'enter',(to)=>push({k:'enter',to}),(e)=>push({k:'entered',to:e&&e.to}));
  for(const fn of ['queueWake','wakeMenu','skipClass','goClass','attend','seatPick','skipTo','afterMenu']) ok[fn]=wrap(typeof CLS!=='undefined'?CLS:null,fn,(GM,a)=>push({k:'cls',fn,key:a&&a.key?a.key:null,arg:typeof a==='number'?a:null}),(e,v)=>push({k:'clsEnd',fn,key:e&&e.key,ret:(v===undefined)?null:v}));
  document.addEventListener('pointerdown',ev=>{ const t=now(); W.lastDown=t; const el=ev.target, b=el&&el.closest?el.closest('#choices button'):null; let idx=null;
    if(b){ idx=[...document.querySelectorAll('#choices button')].indexOf(b); }
    push({k:'down',x:Math.round(ev.clientX),y:Math.round(ev.clientY),tgt:el?(el.id||(el.className&&String(el.className).slice(0,30))||el.tagName):null,btn:b?((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim().slice(0,30):null,idx,sinceChoose:W.lastChooseT!=null?+(t-W.lastChooseT).toFixed(1):null}); },true);
  W.guard={tapTooSoon:typeof GAME.tapTooSoon==='function',TAP_GUARD:GAME.TAP_GUARD==null?null:GAME.TAP_GUARD,webdriver:!!navigator.webdriver,q:location.search};
  return ok; })()"""
LOGN = "((window.__GC&&window.__GC.log)||[]).length"
LOGS = "(n=>((window.__GC&&window.__GC.log)||[]).slice(n))"
COVER = "(()=>window.__GC?window.__GC.cover():null)()"
RECTS = "(()=>window.__GC?window.__GC.rects():[])()"
MS = r"""(()=>{ const D=GAME.D||{}, E=GAME.E, P=E.player, ch=document.getElementById('choices'), fd=document.getElementById('fade'), dl=document.getElementById('dlg');
  const r=dl&&!dl.classList.contains('hide')?dl.getBoundingClientRect():null;
  return {dlg:!!D.active, ch:(ch&&!ch.classList.contains('hide'))?ch.querySelectorAll('button').length:0, busy:!!P.busy, path:!!(P.path&&P.path.length), seat:!!P.seat, fade:!!(fd&&fd.classList.contains('on')),
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), paused:!!E.paused, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), day:GAME.G.day, dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,40),
    dlgC:r?[Math.round(r.left+r.width/2),Math.round(r.top+Math.min(r.height,60)/2)]:null, nd:window.__GC?(window.__GC.nd|0):0}; })()"""
REC = r"""(()=>{ const G=GAME.G, R=CLS.rec(G), c=o=>JSON.parse(JSON.stringify(o||{})); return {day:G.day,h:+(+G.hour).toFixed(3),zone:G.zone,note:c(R.note),done:c(R.done),attend:c(R.attend),late:c(R.late),abs:c(R.abs)}; })()"""
TODAY = r"""(()=>{ try{ const d=document.createElement('div'); d.innerHTML=CLS.todayHTML(GAME.G); return d.innerText.replace(/\n+/g,' ｜ ').slice(0,900); }catch(e){ return 'ERR '+e; } })()"""
ITEMS = r"""(d=>{ const G=GAME.G; return CLS.dayItems(G,d).map(i=>({key:i.key,id:i.c.id,name:i.c.name,kind:i.c.kind,t0:+i.t0.toFixed(3),t1:+i.t1.toFixed(3),zone:(i.room&&i.room.zone)||null,door:(i.room&&i.room.door)||null,room:(i.room&&i.room.name)||'',exam:i.exam||null,week:i.week,term:i.term})); })"""
FINDDAY = r"""(([term,week])=>{ for(let d=-10; d<2200; d++){ let t=null; try{ t=CALENDAR.termOf(d); }catch(e){} if(!t||t.id!==term||t.week<week) continue; if(CALENDAR.holiday(d)||CALENDAR.holiday(d-1)) continue;
    const wd=CALENDAR.dateOf(d).wd; if(wd>5) continue; let its=[]; try{ its=CLS.dayItems(GAME.G,d); }catch(e){} const am=its.find(i=>i.t0<10&&!i.exam&&i.room&&i.room.zone&&!i.room.door&&!i.room.offsite);
    if(am){ const c=CALENDAR.dateOf(d); return {d,wd:wd===7?0:wd,key:c.key,term:t.id,week:t.week,first:am.c.name,key0:am.key,zone:am.room.zone}; } } return null; })"""
GUARDINFO = "(()=>window.__GC?window.__GC.guard:null)()"


async def hook(pg):
    await P.init(pg); return await pg.evaluate(HOOK)


async def logs(pg, n0):
    return await pg.evaluate(LOGS, n0)


async def logn(pg):
    return await pg.evaluate(LOGN)


async def ms(pg):
    return await pg.evaluate(MS)


def rdiff(a, b):
    out = {}
    for k in ('note', 'done', 'attend', 'late', 'abs'):
        A, B = a.get(k) or {}, b.get(k) or {}
        ch = {x: [A.get(x), B.get(x)] for x in sorted(set(A) | set(B)) if A.get(x) != B.get(x)}
        if ch: out[k] = ch
    return out


def overlap(r, q):
    if not r or not q: return False
    return not (r[0] + r[2] <= q[0] or q[0] + q[2] <= r[0] or r[1] + r[3] <= q[1] or q[1] + q[3] <= r[1])


def inside(pt, r):
    return bool(pt and r) and r[0] <= pt[0] <= r[0] + r[2] and r[1] <= pt[1] <= r[1] + r[3]


# ---------- 日子 ----------
DAYS = {}


async def target_day(pg):
    """第 57 天（2025-11-12 週三）有沒有刑法總則（一）上午＋服務學習（一）下午；沒有就找附近的週三，log 寫清楚"""
    if 'T' in DAYS: return DAYS['T']
    d = await P.day_of(pg, TARGET); its = await pg.evaluate(ITEMS, d['d'])
    R.note('[日子] %s＝第 %d 天（%s 第 %s 週，週%s）的課：%s' % (d['key'], d['d'], d['term'], d['week'], d['wd'], J(its)))
    ok = lambda L_: any(i['id'] == 'crim_gen1' and i['t0'] < 10 for i in L_) and any(i['kind'] == 'service' for i in L_)
    if not ok(its):
        for k in list(range(1, 30)):
            for dd in (d['d'] + k, d['d'] - k):
                its2 = await pg.evaluate(ITEMS, dd)
                if ok(its2):
                    d2 = await P.day_of(pg, (await pg.evaluate("d=>CALENDAR.dateOf(d).key", dd)))
                    R.note('[日子] %s 沒有「刑總上午＋服務學習下午」，改用最接近的 %s（第 %d 天）：%s' % (d['key'], d2['key'], dd, J(its2))); d, its = d2, its2; break
            else: continue
            break
    prev = await P.day_of(pg, await pg.evaluate("d=>CALENDAR.dateOf(d).key", d['d'] - 1))
    crim = next((i for i in its if i['t0'] < 10), its[0] if its else None); svc = next((i for i in its if i['kind'] == 'service'), None)
    DAYS['T'] = {'day': d, 'prev': prev, 'items': its, 'crim': crim, 'svc': svc}
    return DAYS['T']


# ---------- 玩家操作 ----------
async def load(pg, cdp, st, why):
    R.setup(why + ('（條件事件關著）' if EVQUIET else '（條件事件開著，只關手機自動打開）'))
    await L.load_state(pg, st, quiet_events=EVQUIET, quiet_phone=True)
    await pg.wait_for_timeout(4500)
    try: await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
    except Exception: pass
    cp = await pg.evaluate("(()=>{ if(typeof CLS!=='undefined'&&CLS.clearPending){ CLS.clearPending(); return true; } return false; })()")
    R.setup('CLS.clearPending()＝%s（清掉上一輪留下的待出選單）' % cp)
    await hook(pg)


async def tap_text(pg, cdp, prefixes, exact=False):
    """畫面上的選項照文字找（照 prefixes 的順序），點那一顆的中央；exact＝按鈕的主文字（不含灰字說明）要整個一樣。回傳點到的文字或 None"""
    heads = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim())")
    if not await pg.evaluate("(()=>{ const c=document.getElementById('choices'); return !!c&&!c.classList.contains('hide'); })()"): return None
    for p in prefixes:
        for k, t in enumerate(heads):
            if (t == p) if exact else t.startswith(p):
                await P.tap_choice(pg, cdp, k); return t
    return None


async def play(pg, cdp, picks=(), stop=None, max_s=300, idle_s=3.0, tag='', shots=False, wait_ms=600, exact=()):
    """正常速度：對話出現 500 ms 後點對話框；選單出現 wait_ms 後照文字選（picks 照順序；exact 的要整個字一樣）；都沒有就選最後一個（多半是「不要」）。
    回傳 {'menus':[[選項…,選了]], 'stopped':bool}"""
    t0 = time.time(); idle = None; menus = []; last_txt = None
    while time.time() - t0 < max_s:
        s = await ms(pg)
        if stop and await stop(s): return {'menus': menus, 'stopped': True}
        if s['phone'] and not s['ch']:
            await L.phone_away(pg, cdp, tries=1); await L.close_panels(pg, cdp); continue
        if s['ch']:
            idle = None; await pg.wait_for_timeout(wait_ms)
            b = await P.ts(pg); txt = [o['t'] for o in b['ch']]
            if not txt: continue
            got = None
            for p in exact:
                got = await tap_text(pg, cdp, [p], exact=True)
                if got: break
            if not got: got = await tap_text(pg, cdp, list(picks))
            if not got: await P.tap_choice(pg, cdp, len(txt) - 1); got = txt[-1] + '（沒有符合的，選最後一個）'
            menus.append([txt, got]); R.note('%s 選單 %s → %s' % (tag, J(txt), got))
            if shots: await shot(pg, '%s_menu%d' % (tag, len(menus)))
            await pg.wait_for_timeout(700); continue
        if s['dlg']:
            idle = None
            if shots and s['dtext'] != last_txt: last_txt = s['dtext']; await shot(pg, '%s_say' % tag)
            await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(250); continue
        if s['busy'] or s['fade'] or s['paused']:
            idle = None; await pg.wait_for_timeout(250); continue
        idle = idle or time.time()
        if time.time() - idle >= idle_s: return {'menus': menus, 'stopped': False}
        await pg.wait_for_timeout(200)
    R.note('%s play 超過 %d 秒' % (tag, max_s)); return {'menus': menus, 'stopped': False}


async def bed(pg, cdp, tag):
    it = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0]:null; })()")
    if not it: R.note('%s：這一區找不到床' % tag); return None
    await L.go_to(pg, cdp, R, it[0], it[1], 0.8, '床', max_s=150, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(5):
        if (await P.ts(pg))['ch']: break
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    for _ in range(12):
        s = await P.ts(pg)
        if s['ch']: break
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    s = await P.ts(pg); ops = [o['t'] for o in s['ch']]
    k = next((i for p in ('睡到明天早上', '睡到明天') for i, o in enumerate(ops) if o.startswith(p)), None)
    R.note('%s：床的選單 %s → %s' % (tag, J([o.split('\n')[0] for o in ops]), ops[k] if k is not None else '（沒有符合的）'))
    if k is None: return None
    await P.tap_choice(pg, cdp, k); return ops[k]


async def sleep_wake(pg, cdp, tag, day=None, flags=None):
    """【前置】那一天前一晚 23:00 宿舍房間 → 真的上床睡到明天早上 → 等到醒來（CLS.queueWake 被遊戲叫、日子換了）。回傳醒來的紀錄或 None"""
    T = await target_day(pg); dd = day or T['day']; prev = await P.day_of(pg, await pg.evaluate("d=>CALENDAR.dateOf(d).key", dd['d'] - 1))
    await load(pg, cdp, mkstate(prev, 23.0, 'dorm', flags), '%s：最小存檔 %s（第 %d 天）23:00 宿舍房間' % (tag, prev['key'], prev['d']))
    n0 = await logn(pg)
    if not await bed(pg, cdp, tag): return None
    t0 = time.time()
    while time.time() - t0 < 240:
        lg = await logs(pg, n0)
        if any(e['k'] == 'cls' and e['fn'] == 'queueWake' for e in lg) and await pg.evaluate("d=>GAME.G.day===d", dd['d']): break
        s = await ms(pg)
        if s['ch']:
            b = await P.ts(pg); R.note('%s：睡覺途中的選單 %s → 最後一個' % (tag, J([o['t'] for o in b['ch']]))); await pg.wait_for_timeout(500); await P.tap_choice(pg, cdp, len(b['ch']) - 1); await pg.wait_for_timeout(800); continue
        if s['dlg']: await pg.wait_for_timeout(400); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(250)
    lg = await logs(pg, n0); qw = [e for e in lg if e['k'] == 'cls' and e['fn'] == 'queueWake']
    if not qw: R.note('%s：沒睡醒（沒有 queueWake；%s）' % (tag, J(await ms(pg)))); return None
    R.note('%s：醒來 第 %s 天 %s %.3f 時' % (tag, qw[-1].get('d'), qw[-1].get('z'), qw[-1].get('h') or 0))
    return {'n0': n0, 'qw': qw[-1], 'day': dd}


async def wait_wake_say(pg, cdp, tag, max_s=90, handle=True):
    """等起床選單的第一句（「早安。今天的課…」）。途中別的劇情照正常速度點過（選最後一個）並記下來。回傳 True／False"""
    t0 = time.time(); n0 = await logn(pg)
    while time.time() - t0 < max_s:
        s = await ms(pg)
        if s['dlg'] and (s['dtext'].startswith('早安') or any(e['k'] == 'say' and e['text'].startswith('早安') for e in await logs(pg, n0))): return True
        if s['dlg'] and not s['dtext'].strip(): await pg.wait_for_timeout(100); continue   # 剛開始打字（還是空的）：先不點
        if s['ch'] and handle:
            b = await P.ts(pg); txt = [o['t'] for o in b['ch']]
            if txt and (txt[0].startswith('直接去') or txt[0].startswith('翹')): return True
            R.note('%s：起床選單以前的別的選單 %s → 最後一個' % (tag, J(txt))); await pg.wait_for_timeout(600); await P.tap_choice(pg, cdp, len(txt) - 1); await pg.wait_for_timeout(800); continue
        if s['dlg'] and handle:
            R.note('%s：起床選單以前的別的一句：%s' % (tag, s['dtext'])); await pg.wait_for_timeout(500); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1)
        await pg.wait_for_timeout(100)
    R.note('%s：%d 秒內沒等到起床選單（%s）' % (tag, max_s, J(await ms(pg)))); return False


async def calibrate(pg, cdp, tag):
    """正常速度叫出一次起床選單：量對話框中央（A）、第一項（B）、第二項（C）的位置；最後照文字選「先起床再說」"""
    w = await sleep_wake(pg, cdp, tag + '_cal')
    if not w or not await wait_wake_say(pg, cdp, tag + '_cal'): return None
    s = await ms(pg); A = s['dlgC']; await shot(pg, '%s_cal_say' % tag)
    for _ in range(30):
        s = await ms(pg)
        if s['ch']: break
        if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(400)
    rc = await pg.evaluate(RECTS); cv = await pg.evaluate(COVER); await shot(pg, '%s_cal_menu' % tag)
    if len(rc) < 2: R.note('%s：量位置失敗（選單 %s）' % (tag, J(rc))); return None
    c = lambda r: [r[0] + r[2] // 2, r[1] + r[3] // 2]
    dr = cv.get('dlgRect')
    pos = {'A': A or ([dr[0] + dr[2] // 2, dr[1] + 20] if dr else [422, 330]), 'B': c(rc[0]['r']), 'C': c(rc[1]['r']), 'rects': rc, 'cover': cv}
    R.note('%s：位置 A（對話框中央）%s、B（第一項「%s」）%s、C（第二項「%s」）%s；選單 %s；COVER %s' % (tag, pos['A'], rc[0]['t'], pos['B'], rc[1]['t'], pos['C'], J(rc), J(cv)))
    # 再量翹課確認（照文字選「翹這堂課」→ 量 →照文字選「還是去」收尾＝去上課；下一輪會重讀檔）
    await tap_text(pg, cdp, ['翹這堂課'])
    for _ in range(30):
        s = await ms(pg)
        if s['ch']: break
        if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    await pg.wait_for_timeout(400); rc2 = await pg.evaluate(RECTS); await shot(pg, '%s_cal_confirm' % tag)
    pos['confirm'] = rc2
    first = rc2[0]['r'] if rc2 else None; skipr = rc[1]['r']
    if first and overlap(skipr, first):
        y0, y1 = max(skipr[1], first[1]), min(skipr[1] + skipr[3], first[1] + first[3]); x0, x1 = max(skipr[0], first[0]), min(skipr[0] + skipr[2], first[0] + first[2])
        pos['D'] = [(x0 + x1) // 2, (y0 + y1) // 2]
    else: pos['D'] = c(first) if first else pos['C']
    R.note('%s：翹課確認選單 %s；位置 D（起床選單「翹這堂課」和確認第一項「%s」重疊的地方；沒有重疊就是確認第一項的中央）%s' % (tag, J(rc2), rc2[0]['t'] if rc2 else None, pos['D']))
    await pg.wait_for_timeout(600); await tap_text(pg, cdp, ['還是去'], exact=True); await pg.wait_for_timeout(1500)
    json.dump(pos, open(os.path.join(OUT, 'goclass_pos_%s.json' % tag), 'w'), ensure_ascii=False)
    return pos


async def mash(pg, cdp, mode, pos, tag, keypos=None):
    """連點：mode A＝一直點對話框中央；B／C（或 keypos）＝有選單就點那個位置、只有對話就點對話框中央、都沒有（忙／淡出）也點那個位置。
    停止：沒有對話、沒有選單、人不忙，連續 FREEWAIT 秒；上限 MASH_MAX 秒。回傳點了幾下"""
    t0 = time.time(); free = None; n = 0; lastnd = None; still = time.time()
    key = keypos or pos.get(mode)
    while time.time() - t0 < MASH_MAX:
        s = await ms(pg)
        if s['nd'] != lastnd or not s['ch']: lastnd = s['nd']; still = time.time()
        elif time.time() - still >= STALL:
            R.note('%s：選單停在畫面上 %.0f 秒沒有被點到（點的位置 %s 底下沒有選項）——記成「卡在選單」，停止連點' % (tag, STALL, key)); break
        if not (s['dlg'] or s['ch'] or s['busy'] or s['fade']):
            free = free or time.time()
            if time.time() - free >= FREEWAIT: break
            await pg.wait_for_timeout(100); continue
        free = None
        if mode == 'A': xy = s['dlgC'] or pos['A']
        elif s['dlg'] and not s['ch']: xy = s['dlgC'] or pos['A']
        else: xy = key
        await L.touch_tap(cdp, xy[0], xy[1]); n += 1
        await pg.wait_for_timeout(random.randint(TAP_MIN, TAP_MAX))
    return n, time.time() - t0


def chain_of(lg, crim_key):
    """從記錄整理：每個選單（第一項、選了哪一項、離出現幾 ms、那一下按下去離出現幾 ms）"""
    out = []
    for e in lg:
        if e['k'] == 'pick': out.append({'first': e.get('first'), 'picked': e.get('txt'), 'i': e.get('i'), 'dt': e.get('dt'), 'downDt': e.get('downDt'), 'h': e.get('h'), 'z': e.get('z')})
    return out


def outcome(r0, r1, crim_key, lg, stuck=False):
    ps = 'plan_skip_' + crim_key in (r1['note'] or {})
    went = bool((r1['done'] or {}).get(crim_key)) or any(e['k'] == 'cls' and e['fn'] == 'goClass' and e.get('key') == crim_key for e in lg)
    nap = any(e['k'] == 'pick' and (e.get('txt') or '').startswith('再睡一下') for e in lg)
    return ('翹' if ps else ('去上課' if went else ('其他（卡在選單）' if stuck else '其他'))), ps, went, nap


async def one_mash_run(pg, cdp, pos, mode, tag, T, keypos=None):
    w = await sleep_wake(pg, cdp, tag)
    if not w: return None
    r0 = await pg.evaluate(REC)
    if not await wait_wake_say(pg, cdp, tag): return None
    n1 = await logn(pg); say_t = await pg.evaluate("performance.now()")
    ntap, dur = await mash(pg, cdp, mode, pos, tag, keypos)
    stuck = (await ms(pg))['ch'] > 0
    lg = await logs(pg, n1); r1 = await pg.evaluate(REC); today = await pg.evaluate(TODAY)
    ck = T['crim']['key']; oc, ps, went, nap = outcome(r0, r1, ck, lg, stuck); ch = chain_of(lg, ck)
    if stuck: res_stuck = [o['t'] for o in (await P.ts(pg))['ch']]; R.note('%s：停下來時畫面上的選單 %s' % (tag, J(res_stuck)))
    menus = [e for e in lg if e['k'] == 'choose']
    for m in menus: m['msSinceSay'] = round(m['t'] - say_t)
    sn = await shot(pg, '%s_end' % tag)
    res = {'tag': tag, 'mode': mode, 'taps': ntap, 'secs': round(dur, 1), 'outcome': oc, 'plan_skip': ps, 'went': went, 'nap': nap, 'zone': r1['zone'], 'h': r1['h'],
           'diff': rdiff(r0, r1), 'chain': ch, 'today': today, 'shot': sn,
           'menus': [{'opts': m.get('opts'), 'sinceSay': m.get('msSinceSay'), 'sinceDown': m.get('sinceDown'), 'rects': m.get('rects'), 'cover': m.get('cover')} for m in menus]}
    R.note('%s：模式 %s 點 %d 下 %.0f 秒 → %s（plan_skip=%s、去上課=%s、再睡一下=%s）落在 %s %.3f 時；選單鏈 %s' % (tag, mode, ntap, dur, oc, ps, went, nap, r1['zone'], r1['h'], J(ch)))
    R.note('%s：COVER（每個選單出現那一刻）%s' % (tag, J([[m['opts'][:1] if m.get('opts') else None, m.get('cover')] for m in menus])))
    R.note('%s：CLS.rec 差異 %s；手機「今天」：%s' % (tag, J(res['diff']), today))
    json.dump(res, open(os.path.join(OUT, 'goclass_%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    return res


def summarize(name, rs):
    rs = [r for r in rs if r]
    cnt = {}
    for r in rs: cnt[r['outcome']] = cnt.get(r['outcome'], 0) + 1
    by = {}
    for r in rs: by.setdefault(r['mode'], []).append(r['outcome'])
    full = sum(1 for r in rs if r['plan_skip'] and r['nap'])
    R.note('[%s 統計] %d 次：%s；照模式 %s；落到「翹這堂課→翹→再睡一下」%d 次' % (name, len(rs), J(cnt), J(by), full))
    # 新版的確認：連點落在確認的第一個位置＝「還是去」
    conf = [c for r in rs for c in r['chain'] if c['first'] in ('翹', '還是去')]
    R.note('[%s 統計] 翹課確認選單被選到的：%s（新版第一個是「還是去」、舊版第一個是「翹」）' % (name, J([[c['first'], c['picked'], c['dt']] for c in conf])))
    return cnt


# ---------- PARTS ----------
async def part_repro(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('REPRO：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        R.note('REPRO：防連點 %s（新舊對照：舊版 779ddd650 沒有 tapTooSoon 是預期；新版自動化瀏覽器不加 ?tapguard＝不擋）' % J(await pg.evaluate(GUARDINFO)))
        T = await target_day(pg)
        pos = await calibrate(pg, cdp, 'repro')
        if not R.check('REPRO：量到起床選單的位置', bool(pos)): return
        rs = []
        for k in range(REPEAT):
            for m in MODES: rs.append(await one_mash_run(pg, cdp, pos, m, 'repro_%s%d' % (m, k + 1), T))
        summarize('REPRO', rs)
        R.check('REPRO：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def part_guard(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(guard_url(URL)); R.check('GUARD：遊戲載入（?tapguard）', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        gi = await pg.evaluate(GUARDINFO); R.note('GUARD：遊戲有沒有防連點 %s（舊版 779ddd650 沒有＝預期，下面的判定會 FAIL）' % J(gi))
        T = await target_day(pg); ck = T['crim']['key']
        pos = await calibrate(pg, cdp, 'guard')
        if not R.check('GUARD：量到起床選單的位置', bool(pos)): return
        rs = []
        for k in range(GUARDN):
            m = MODES[k % len(MODES)]; r = await one_mash_run(pg, cdp, pos, m, 'guard_%s%d' % (m, k + 1), T); rs.append(r)
            if not r: continue
            early = [c for c in r['chain'] if c['downDt'] is not None and c['downDt'] < 350]
            R.check('GUARD %d（模式 %s）：每一個被選到的選項，按下去那一下離選單出現 ≥ 350 ms（新版防連點；舊版預期 FAIL）' % (k + 1, m), not early, J(early))
            R.check('GUARD %d（模式 %s）：沒有翹課（note 沒有 plan_skip_%s；BB 的判定——防連點只擋 350 ms 內）' % (k + 1, m, ck), not r['plan_skip'], J(r['chain']))
        summarize('GUARD', rs)
        # 正常速度三項各選一次
        for want in ('直接去上課', '翹這堂課', '先起床'):
            tag = 'guard_norm_%s' % {'直接去上課': 'go', '翹這堂課': 'skip', '先起床': 'up'}[want]
            w = await sleep_wake(pg, cdp, tag)
            if not w or not await wait_wake_say(pg, cdp, tag): R.check('%s：起床選單出了' % tag, False); continue
            r0 = await pg.evaluate(REC); n1 = await logn(pg)
            for _ in range(20):
                s = await ms(pg)
                if s['ch']: break
                if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(600); got = await tap_text(pg, cdp, [want]); await pg.wait_for_timeout(1500)
            R.check('%s：正常速度（600 ms 後）照文字點得到「%s」' % (tag, want), bool(got) and any(e['k'] == 'pick' and (e.get('txt') or '').startswith(want) for e in await logs(pg, n1)), J([e for e in await logs(pg, n1) if e['k'] in ('pick', 'down')][:6]))
            if want == '直接去上課':
                lg = await logs(pg, n1); R.check('%s：選了以後出門上課（叫了 CLS.goClass %s）' % (tag, ck), any(e['k'] == 'cls' and e['fn'] == 'goClass' for e in lg))
            elif want == '翹這堂課':
                for _ in range(20):
                    s = await ms(pg)
                    if s['ch']: break
                    if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
                    await pg.wait_for_timeout(300)
                bt = await P.ts(pg); R.check('%s：翹課確認選單出現（%s）' % (tag, J([o['t'] for o in bt['ch']])), bool(bt['ch']) and any(o['t'] == '翹' for o in bt['ch']))
                await pg.wait_for_timeout(600); await tap_text(pg, cdp, ['還是去'], exact=True); await pg.wait_for_timeout(1500)
                R.note('%s：確認選「還是去」收尾（照文字找）' % tag)
            else:
                await pg.wait_for_timeout(2000); r1 = await pg.evaluate(REC)
                R.check('%s：先起床再說＝沒事（沒有 plan_skip、沒有出門）' % tag, 'plan_skip_' + ck not in r1['note'] and not any(e['k'] == 'cls' and e['fn'] == 'goClass' for e in await logs(pg, n1)), J(rdiff(r0, r1)))
            await shot(pg, tag)
        R.check('GUARD：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def class_until_done(pg, cdp, key, tag, max_s=600):
    """上課：對話照正常速度點；下課選單照文字選「先自由活動」；停在 done 有這一堂、人空下來 3 秒"""
    n1 = await logn(pg); t0 = time.time(); shots = {'enter': False, 'mid': False}
    async def stop(s):
        lg = await logs(pg, n1)
        if not shots['enter'] and any(e['k'] == 'entered' for e in lg) and not s['fade']:
            shots['enter'] = True; await shot(pg, '%s_arrive' % tag)
        if not shots['mid'] and s['dlg'] and s['seat']:
            shots['mid'] = True; await shot(pg, '%s_inclass' % tag)
        done = await pg.evaluate("k=>!!CLS.rec(GAME.G).done[k]", key)
        return done and not (s['dlg'] or s['ch'] or s['busy'] or s['fade'])
    pl = await play(pg, cdp, picks=('先自由活動', '還是進去聽', '老位子', '坐中間'), stop=stop, max_s=max_s, idle_s=8, tag=tag)
    await play(pg, cdp, picks=('先自由活動',), max_s=40, idle_s=3, tag=tag + '_after')
    lg = await logs(pg, n1)
    seatq = [m for m in pl['menus'] if any('坐' in o for o in m[0])]
    return lg, seatq, time.time() - t0


def class_lines(lg):
    i0 = next((i for i, e in enumerate(lg) if e['k'] == 'cls' and e['fn'] in ('attend', 'seatPick')), None)
    if i0 is None: return [], None
    L_ = [e for e in lg[i0:] if e['k'] in ('say', 'cap')]
    dur = (L_[-1]['t'] - L_[0]['t']) / 1000 if L_ else None
    return L_, dur


async def phone_today(pg, cdp, tag, week=True):
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    opened = await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="today"]'); await pg.wait_for_timeout(900)
    t = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); s1 = await shot(pg, '%s_phone_today' % tag)
    w = ''
    if week:
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="week"]'); await pg.wait_for_timeout(900)
        w = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await shot(pg, '%s_phone_week' % tag)
    R.note('%s：手機（打開了 %s）「今天」：%s' % (tag, opened, t.replace('\n', ' ｜ ')[:900]))
    if w: R.note('%s：手機「課表」出席：%s' % (tag, w[w.find('出席'):][:500].replace('\n', ' ｜ ')))
    return opened, t, w, s1


async def close_phone(pg, cdp):
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)


async def part_full(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('FULL：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        T = await target_day(pg); it = T['crim']; ck = it['key']
        R.note('FULL：%s（第 %d 天）第一堂 %s %s %s' % (T['day']['key'], T['day']['d'], it['name'], it['room'], ck))
        w = await sleep_wake(pg, cdp, 'full')
        if not R.check('FULL：前一晚真的睡覺、第 %d 天醒來' % T['day']['d'], bool(w)): return
        if not R.check('FULL：起床選單出了', await wait_wake_say(pg, cdp, 'full')): return
        r0 = await pg.evaluate(REC); n1 = await logn(pg); await shot(pg, 'full_wake_say')
        for _ in range(20):
            s = await ms(pg)
            if s['ch']: break
            if s['dlg']: await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(300)
        bt = await P.ts(pg); R.note('FULL：起床選單 %s' % J([o['t'] for o in bt['ch']])); await shot(pg, 'full_wake_menu')
        await pg.wait_for_timeout(600); got = await tap_text(pg, cdp, ['直接去上課'])
        R.check('FULL：照文字選「直接去上課：%s」' % it['name'], bool(got) and it['name'] in (got or ''), got)
        tg = time.time()
        lg, seatq, dur = await class_until_done(pg, cdp, ck, 'full')
        r1 = await pg.evaluate(REC)
        ent = [e['to'] for e in lg if e['k'] == 'enter']
        R.check('FULL：人到了教室（GAME.enter → %s；那一堂的教室 zone=%s）' % (J(ent), it['zone']), it['zone'] in ent or r1['zone'] == it['zone'], J(ent))
        R.note('FULL：問座位的選單 %s（SEAT-NO-ASK-1110 以後應該不問）' % (J(seatq) if seatq else '沒有'))
        cl, cdur = class_lines(lg)
        R.note('FULL：課堂 %d 句／字幕（%s 秒）：第一句 %s；最後一句 %s' % (len(cl), cdur and round(cdur, 1), J(cl[0]['text'] if cl else None), J(cl[-1]['text'] if cl else None)))
        for e in cl: R.note('    [%s %.3f] %s：%s' % (e['k'], e.get('h') or 0, e.get('who') or '', e['text']))
        R.check('FULL：課堂內容真的播了（≥3 句）', len(cl) >= 3, str(len(cl)))
        R.check('FULL：done 有 %s' % ck, bool(r1['done'].get(ck)), J(rdiff(r0, r1)))
        R.check('FULL：note 沒有 plan_skip_／skip_（%s）' % ck, ('plan_skip_' + ck) not in r1['note'] and ('skip_' + ck) not in r1['note'], J(r1['note']))
        R.note('FULL：從選「直接去上課」到下課空下來 %.0f 秒；CLS.rec 差異 %s' % (time.time() - tg, J(rdiff(r0, r1))))
        await shot(pg, 'full_after_class')
        op, t, wk, _ = await phone_today(pg, cdp, 'full')
        row = next((ln for ln in t.split('\n') if it['name'] in ln), '')
        idx = t.find(it['name']); seg = t[idx: idx + 80] if idx >= 0 else ''
        R.check('FULL：手機「今天」那一列寫「上過了」（%s）' % seg.replace('\n', ' '), '上過了' in seg, row)
        await close_phone(pg, cdp)
        R.check('FULL：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def part_service(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('SERVICE：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        T = await target_day(pg); sv = T['svc']
        if not R.check('SERVICE：那一天有服務學習（%s）' % J(sv), bool(sv)): return
        await load(pg, cdp, mkstate(T['day'], 12 + 40 / 60, 'dorm'), 'SERVICE：最小存檔 %s（第 %d 天）12:40 宿舍房間' % (T['day']['key'], T['day']['d']))
        r0 = await pg.evaluate(REC); n1 = await logn(pg)
        op, t, _, _ = await phone_today(pg, cdp, 'service', week=False)
        sel = '#phoneBody [data-go="%s"]' % sv['key']
        lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
        R.note('SERVICE：服務學習那一列的鍵：%s' % J(lab))
        if not lab: R.note('SERVICE：手機上沒有服務學習的鍵，停在這裡'); return
        h0 = await pg.evaluate("GAME.G.hour"); tg = time.time(); await L.tap(pg, cdp, sel)
        last = None; tfree = None; free = None; k = 0
        while time.time() - tg < 300:
            s = await ms(pg)
            sig = (s['dlg'], s['dtext'], s['ch'], s['zone'], s['fade'])
            if sig != last: last = sig; k += 1; await shot(pg, 'service_step%02d' % k)
            if s['ch']:
                bt = await P.ts(pg); R.note('SERVICE：選單 %s → 第一個（照實記）' % J([o['t'] for o in bt['ch']])); await pg.wait_for_timeout(600); await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(600); continue
            if s['dlg']: free = None; await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(300); continue
            if s['busy'] or s['fade'] or s['paused']: free = None; await pg.wait_for_timeout(200); continue
            free = free or time.time()
            if time.time() - free >= 2.0: tfree = free - tg; break
            await pg.wait_for_timeout(150)
        lg = await logs(pg, n1); r1 = await pg.evaluate(REC)
        for e in lg:
            if e['k'] in ('say', 'cap', 'toast', 'enter', 'choose', 'pick') or (e['k'] == 'cls' and e['fn'] in ('goClass', 'attend', 'skipTo')):
                R.note('    [%s %.3f %s] %s' % (e['k'], e.get('h') or 0, e.get('z'), J({x: e[x] for x in ('who', 'text', 'to', 'opts', 'txt', 'fn', 'key') if x in e})))
        R.note('SERVICE（只記）：按「直接去上課」到能動 %s 秒；遊戲時間 %.3f → %.3f（跳了 %.0f 分鐘）；最後 zone=%s；CLS.rec 差異 %s' % (
            None if tfree is None else round(tfree, 1), h0, r1['h'], (r1['h'] - h0) * 60, r1['zone'], J(rdiff(r0, r1))))
        await phone_today(pg, cdp, 'service_after', week=False); await close_phone(pg, cdp)
        R.check('SERVICE：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def part_others(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('OTHERS：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        for term in TERMS:
            if re.match(r'^\d{4}-\d\d-\d\d$', term):
                d0 = await P.day_of(pg, term); its = await pg.evaluate(ITEMS, d0['d']); am = next((i for i in its if i['t0'] < 10 and i['zone']), None)
                d = dict(d0, first=am and am['name'], key0=am and am['key'], zone=am and am['zone']) if am else None
            else:
                d = await pg.evaluate(FINDDAY, [term, OTHERWEEK])
            if not R.check('OTHERS %s：找到上午有課（教室有 zone）的平日（%s）' % (term, J(d)), bool(d and d.get('key0'))): continue
            yr = int(d['term'][1]) if d.get('term') and d['term'][1].isdigit() else 1
            fl = {('ROOM_Y%d' % y): True for y in range(2, yr + 1)}
            w = await sleep_wake(pg, cdp, 'others_' + term, day={'d': d['d'], 'wd': d['wd'], 'key': d['key']}, flags=fl)
            if not R.check('OTHERS %s：%s 前一晚睡覺、醒來（ROOM_Y 旗標 %s）' % (term, d['key'], J(fl)), bool(w)): continue
            if not R.check('OTHERS %s：起床選單出了' % term, await wait_wake_say(pg, cdp, 'others_' + term)): continue
            r0 = await pg.evaluate(REC)
            for _ in range(20):
                s = await ms(pg)
                if s['ch']: break
                if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(600); got = await tap_text(pg, cdp, ['直接去上課'])
            R.note('OTHERS %s：選了 %s' % (term, got))
            lg, seatq, dur = await class_until_done(pg, cdp, d['key0'], 'others_' + term, max_s=480)
            r1 = await pg.evaluate(REC); ent = [e['to'] for e in lg if e['k'] == 'enter']; cl, cdur = class_lines(lg)
            R.check('OTHERS %s：進了教室（%s；教室 zone %s）' % (term, J(ent), d['zone']), d['zone'] in ent or r1['zone'] == d['zone'])
            R.check('OTHERS %s：課堂有播（≥1 句；%d 句，第一句 %s）' % (term, len(cl), J(cl[0]['text'] if cl else None)), len(cl) >= 1)
            R.check('OTHERS %s：CLS.rec done 有 %s' % (term, d['key0']), bool(r1['done'].get(d['key0'])), J(rdiff(r0, r1)))
            await shot(pg, 'others_%s_end' % term)
        R.check('OTHERS：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def skip_by_text(pg, cdp, tag, nap_pick):
    """照文字：翹這堂課 → 翹（整個字＝「翹」）→ nap_pick（起床／再睡一下）。回傳選單鏈"""
    menus = []
    for want, exact in (('翹這堂課', False), ('翹', True), (nap_pick, False)):
        for _ in range(30):
            s = await ms(pg)
            if s['ch']: break
            if s['dlg']: await pg.wait_for_timeout(600); await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(300)
        bt = await P.ts(pg); txt = [o['t'] for o in bt['ch']]; await shot(pg, '%s_menu_%d' % (tag, len(menus) + 1))
        await pg.wait_for_timeout(600); got = await tap_text(pg, cdp, [want], exact=exact)
        menus.append([txt, got]); R.note('%s：選單 %s → 照文字「%s」→ %s' % (tag, J(txt), want, got))
        if not got: break
        await pg.wait_for_timeout(900)
    return menus


async def part_regret(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('REGRET：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        T = await target_day(pg); it = T['crim']; ck = it['key']
        w = await sleep_wake(pg, cdp, 'regret')
        if not w or not R.check('REGRET：起床選單出了', await wait_wake_say(pg, cdp, 'regret')): return
        r0 = await pg.evaluate(REC)
        mn = await skip_by_text(pg, cdp, 'regret', '起床')
        await play(pg, cdp, max_s=30, idle_s=2.5, tag='regret_up')
        r1 = await pg.evaluate(REC)
        R.check('REGRET：翹了（note 有 plan_skip_%s）' % ck, ('plan_skip_' + ck) in r1['note'], J(rdiff(r0, r1)))
        snap = await pg.evaluate("GAME.snapshot()")
        h = await pg.evaluate("GAME.G.hour"); R.note('REGRET：現在 %.3f 時（上課 %.3f）' % (h, it['t0']))
        op, t, _, _ = await phone_today(pg, cdp, 'regret', week=False)
        sel = '#phoneBody [data-go="%s"]' % ck
        lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
        R.check('REGRET：上課前手機「今天」那一列有「反悔：直接去上課」（%s）' % J(lab), lab == '反悔：直接去上課', t[:300])
        if lab:
            n1 = await logn(pg); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1000)
            lg, seatq, dur = await class_until_done(pg, cdp, ck, 'regret')
            r2 = await pg.evaluate(REC); ent = [e['to'] for e in lg if e['k'] == 'enter']; cl, cdur = class_lines(lg)
            R.check('REGRET：按「反悔」以後人到教室（%s）' % J(ent), it['zone'] in ent or r2['zone'] == it['zone'])
            for e in cl: R.note('    [%s %.3f] %s：%s' % (e['k'], e.get('h') or 0, e.get('who') or '', e['text']))
            R.check('REGRET：課有播完（%d 句、%s 秒；done 有 %s）' % (len(cl), cdur and round(cdur, 1), ck), len(cl) >= 3 and bool(r2['done'].get(ck)))
            R.check('REGRET：plan_skip_%s 被清掉' % ck, ('plan_skip_' + ck) not in r2['note'], J(r2['note']))
            op, t2, _, _ = await phone_today(pg, cdp, 'regret_after', week=False)
            idx = t2.find(it['name']); seg = t2[idx: idx + 80] if idx >= 0 else ''
            R.check('REGRET：手機「今天」寫「上過了」（%s）' % seg.replace('\n', ' '), '上過了' in seg)
            await close_phone(pg, cdp)
            _ = n1
        for hh, judge in ((9 + 20 / 60, False), (9 + 40 / 60, False), (11.75, True)):
            st = json.loads(json.dumps(snap)); st['hour'] = hh
            await load(pg, cdp, st, 'REGRET：同一份進度（翹了、還沒反悔）改成 %02d:%02d' % (int(hh), round(hh % 1 * 60)))
            op, t3, _, _ = await phone_today(pg, cdp, 'regret_%02d%02d' % (int(hh), round(hh % 1 * 60)), week=False)
            lab = await pg.evaluate("s=>{ const b=document.querySelector(s); return b?b.textContent.trim():null; }", sel)
            if judge: R.check('REGRET：%.2f 時（過了上課時間、11:40 以後算沒去）手機沒有「反悔」鍵（鍵＝%s）' % (hh, J(lab)), lab != '反悔：直接去上課')
            else: R.note('REGRET（只記）：%.2f 時那一列的鍵＝%s' % (hh, J(lab)))
            await close_phone(pg, cdp)
        R.check('REGRET：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


KXMSG = {'th': 'p:kexin', 'who': 'kexin', 'from': 'kexin', 'text': '起來了沒？今天第一堂幾點？（CC 探針放的）', 'ask': {'opts': [{'t': '九點十分，刑總。'}, {'t': '還在床上。'}]}}
PRECTS = r"""(()=>{ const q=s=>[...document.querySelectorAll(s)].map(b=>{ const r=b.getBoundingClientRect(); return {t:(b.textContent||'').trim().slice(0,20),r:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]}; }).filter(o=>o.r[2]>0);
  return {ask:q('#phoneBody [data-ask]'), close:q('#btnPhoneClose'), tabs:q('#phoneTabs button'), back:q('#phoneBody [data-thback]'), btnPhone:q('#btnPhone')}; })()"""


async def phone_run(pg, cdp, mode, tag, T):
    w = await sleep_wake(pg, cdp, tag)
    if not w: return None
    r0 = await pg.evaluate(REC); ck = T['crim']['key']
    pm = await pg.evaluate("m=>{ try{ return !!PHONE.post(GAME.G,m); }catch(e){ return 'ERR '+e; } }", KXMSG)
    R.setup('%s：醒來那一刻放一則可昕的未回訊息（PHONE.post p:kexin，兩個回覆鍵）＝%s' % (tag, pm))
    # 人能動了就馬上點手機（起床選單要空下來 1.5 秒才出）
    t0 = time.time(); opened = False; early = False
    while time.time() - t0 < 60:
        s = await ms(pg)
        if s['dlg'] and s['dtext'].startswith('早安'): early = True; break
        if s['phone']: opened = True; break
        if not s['busy'] and not s['fade'] and not s['dlg'] and not s['ch']:
            await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(700); continue
        if s['dlg'] and not s['busy']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(100)
    if early: R.note('%s：手機還沒打開，起床選單就出了（那一輪照 REPRO 的 B 模式點完）' % tag)
    if not opened and not early: R.note('%s：60 秒打不開手機' % tag); return None
    keypos = None; prects = None
    if opened:
        th = await P.phone_thread(pg, cdp, 'p:kexin', open_folds=False)
        prects = await pg.evaluate(PRECTS); await shot(pg, '%s_phone' % tag)
        R.note('%s：手機的鍵 %s；可昕對話 ok=%s 回覆鍵 %s' % (tag, J(prects), th['ok'], J(th['asks'])))
        ask = prects['ask'][0]['r'] if prects['ask'] else None; cl = prects['close'][0]['r'] if prects['close'] else None
        c = lambda r: [r[0] + r[2] // 2, r[1] + r[3] // 2]
        if mode == 'reply' and ask:
            keypos = c(ask)
            for _ in range(PHONE_TAPS): await L.touch_tap(cdp, keypos[0], keypos[1]); await pg.wait_for_timeout(random.randint(80, 150))
            await pg.wait_for_timeout(600)
            if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())") and cl: await L.touch_tap(cdp, *c(cl))
        elif cl:
            if ask: await L.touch_tap(cdp, *c(ask)); await pg.wait_for_timeout(900)
            keypos = c(cl); await L.touch_tap(cdp, keypos[0], keypos[1]); await pg.wait_for_timeout(random.randint(80, 150)); await L.touch_tap(cdp, keypos[0], keypos[1])
        R.note('%s：手機手法 %s 做完（按的位置 %s）' % (tag, mode, keypos))
    n1 = await logn(pg)
    pos = {'A': None}
    if FOLLOW:
        if not early:
            t1 = time.time()
            while time.time() - t1 < 30:
                s = await ms(pg)
                if s['dlg'] or s['ch']: break
                await pg.wait_for_timeout(50)
        s = await ms(pg); pos['A'] = s['dlgC'] or [422, 330]
        ntap, dur = await mash(pg, cdp, 'K', pos, tag, keypos=keypos or pos['A'])
    else:
        await play(pg, cdp, picks=('先起床',), max_s=40, idle_s=3, tag=tag); ntap, dur = 0, 0
    lg = await logs(pg, n1); r1 = await pg.evaluate(REC)
    oc, ps, went, nap = outcome(r0, r1, ck, lg, (await ms(pg))['ch'] > 0); ch = chain_of(lg, ck)
    downs = [e for e in await logs(pg, w['n0']) if e['k'] == 'down']
    wsay = next((e for e in lg if e['k'] == 'say' and e['text'].startswith('早安')), None)
    wch = next((e for e in lg if e['k'] == 'choose' and e.get('opts') and e['opts'][0].startswith('直接去')), None)
    ov = {}
    if wch and prects:
        for i, rr in enumerate(wch.get('rects') or []):
            hits = [('%s「%s」' % (k, o['t'])) for k in ('ask', 'close', 'tabs', 'back') for o in prects.get(k) or [] if overlap(rr['r'], o['r'])]
            ov[rr['t']] = hits
    res = {'tag': tag, 'mode': mode, 'early': early, 'outcome': oc, 'plan_skip': ps, 'went': went, 'nap': nap, 'zone': r1['zone'], 'h': r1['h'], 'diff': rdiff(r0, r1), 'chain': ch,
           'wakeSaySinceDown': wsay and wsay.get('sinceDown'), 'wakeMenuSinceDown': wch and wch.get('sinceDown'), 'menuRects': wch and wch.get('rects'), 'cover': wch and wch.get('cover'),
           'phoneRects': prects, 'overlap': ov, 'keypos': keypos, 'taps': ntap, 'secs': round(dur, 1), 'downs': downs[-12:]}
    R.note('%s：起床那一句離上一次觸控 %s ms、起床選單離上一次觸控 %s ms；選單每一項和手機的鍵重疊 %s；COVER %s' % (tag, res['wakeSaySinceDown'], res['wakeMenuSinceDown'], J(ov), J(res['cover'])))
    sk = next((k for k in ov if k.startswith('翹')), None)
    R.note('%s：第 2 項「翹這堂課」和手機的 %s 重疊' % (tag, J(ov.get(sk)) if sk else '（沒量到）'))
    R.note('%s：結果 %s（落到「翹這堂課」=%s、再落到「翹」=%s）；選單鏈 %s；落在 %s %.3f 時' % (tag, oc, any((c['picked'] or '').startswith('翹這堂課') for c in ch), ps, J(ch), r1['zone'], r1['h']))
    await shot(pg, '%s_end' % tag)
    json.dump(res, open(os.path.join(OUT, 'goclass_%s.json' % tag), 'w'), ensure_ascii=False, indent=1)
    return res


async def part_phone(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('PHONE：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        R.note('PHONE：防連點 %s' % J(await pg.evaluate(GUARDINFO)))
        T = await target_day(pg); rs = []
        for m in PHONEMODES:
            for k in range(PHONEN): rs.append(await phone_run(pg, cdp, m, 'phone_%s%d' % (m, k + 1), T))
        rs2 = [r for r in rs if r]
        for m in PHONEMODES:
            g = [r for r in rs2 if r['mode'] == m]
            R.note('[PHONE 統計 %s] %d 次：落到「翹這堂課」%d、再落到「翹」（plan_skip）%d、去上課 %d、其他 %d；選單出現離上一次觸控（ms）%s' % (
                m, len(g), sum(1 for r in g if any((c['picked'] or '').startswith('翹這堂課') for c in r['chain'])), sum(1 for r in g if r['plan_skip']),
                sum(1 for r in g if r['outcome'] == '去上課'), sum(1 for r in g if r['outcome'] == '其他'), J([r['wakeMenuSinceDown'] for r in g])))
        R.check('PHONE：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


async def part_userview(p):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
    try:
        await pg.goto(URL); R.check('USERVIEW：遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()"); await hook(pg)
        T = await target_day(pg); it = T['crim']; ck = it['key']; sv = T['svc']
        # a）翹 → 起床
        w = await sleep_wake(pg, cdp, 'uv_a')
        if w and await wait_wake_say(pg, cdp, 'uv_a'):
            n1 = await logn(pg); await shot(pg, 'uv_a_wake')
            mn = await skip_by_text(pg, cdp, 'uv_a', '起床')
            await play(pg, cdp, max_s=30, idle_s=2.5, tag='uv_a_up'); await shot(pg, 'uv_a_up')
            op, t, _, _ = await phone_today(pg, cdp, 'uv_a', week=False)
            idx = t.find(it['name']); R.note('USERVIEW a：手機「今天」%s 那一列：%s（玩家看得出自己翹了課嗎：有沒有「翹課」兩個字＝%s）' % (it['name'], t[idx:idx + 80].replace('\n', ' '), '翹課' in t[idx:idx + 80]))
            await close_phone(pg, cdp)
            hud = "(()=>({goal:(document.getElementById('goal')||{}).innerText||'',next:(document.getElementById('nextClass')||{}).innerText||'',h:+(+GAME.G.hour).toFixed(3),zone:GAME.G.zone}))()"
            R.note('USERVIEW a：目標列／下一堂 %s' % J(await pg.evaluate(hud)))
            t0 = time.time()
            while time.time() - t0 < USERWAIT:
                s = await ms(pg)
                if s['dlg'] or s['ch']: await play(pg, cdp, picks=('先起床', '先自由活動'), max_s=30, idle_s=2, tag='uv_a_wait')
                await pg.wait_for_timeout(500)
            R.note('USERVIEW a：站了 %.0f 秒：%s；這段時間的提醒／字幕／選單 %s' % (USERWAIT, J(await pg.evaluate(hud)), J([[e['k'], e.get('h'), e.get('text') or e.get('opts')] for e in await logs(pg, n1) if e['k'] in ('toast', 'cap', 'choose', 'say')][-20:])))
            snap = await pg.evaluate("GAME.snapshot()"); snap['hour'] = 12.5
            await load(pg, cdp, snap, 'USERVIEW a：同一份進度（翹了、起床）改成 12:30，之後不碰、讓時間自然走')
            n2 = await logn(pg); await shot(pg, 'uv_a_1230'); R.note('USERVIEW a：12:30 目標列／下一堂 %s' % J(await pg.evaluate(hud)))
            t0 = time.time(); k = 0
            while time.time() - t0 < 900 and await pg.evaluate("GAME.G.hour") < USERTO:
                s = await ms(pg)
                if s['dlg'] or s['ch']:
                    k += 1; await shot(pg, 'uv_a_pop%d' % k); bt = await P.ts(pg)
                    R.note('USERVIEW a：%.3f 時跳出 %s %s（照正常速度點、選單選「先起床／先自由活動」或最後一個）' % (s['h'], s['dtext'], J([o['t'] for o in bt['ch']])))
                    await play(pg, cdp, picks=('先起床', '先自由活動'), max_s=60, idle_s=2, tag='uv_a_pop')
                await pg.wait_for_timeout(1000)
            ev = [[e['k'], e.get('h'), e.get('text') or e.get('opts') or e.get('fn')] for e in await logs(pg, n2) if e['k'] in ('toast', 'cap', 'choose', 'say', 'cls')]
            R.note('USERVIEW a：12:30 → %.3f 時（%.0f 秒）：%s；目標列 %s；CLS.rec %s' % (await pg.evaluate("GAME.G.hour"), time.time() - t0, J(ev), J(await pg.evaluate(hud)), J(await pg.evaluate(REC))))
            await shot(pg, 'uv_a_end'); await phone_today(pg, cdp, 'uv_a_end', week=False); await close_phone(pg, cdp)
        else: R.check('USERVIEW a：睡醒、起床選單出了', False)
        # b）翹 → 再睡一下
        w = await sleep_wake(pg, cdp, 'uv_b')
        if w and await wait_wake_say(pg, cdp, 'uv_b'):
            n1 = await logn(pg)
            mn = await skip_by_text(pg, cdp, 'uv_b', '再睡一下')
            R.note('USERVIEW b：小睡；等第二次起床選單')
            ok = await wait_wake_say(pg, cdp, 'uv_b2', max_s=120)
            for _ in range(20):
                s = await ms(pg)
                if s['ch'] or not ok: break
                if s['dlg']: await shot(pg, 'uv_b2_say'); await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(300)
            bt = await P.ts(pg); txt = [o['t'] for o in bt['ch']]; await shot(pg, 'uv_b2_menu')
            cv = await pg.evaluate(COVER)
            R.note('USERVIEW b：第二次起床選單 %.3f 時 %s；第一項是「直接去上課：%s」＝%s；COVER %s' % (await pg.evaluate("GAME.G.hour"), J(txt), sv and sv['name'], bool(txt) and bool(sv) and txt[0].startswith('直接去上課') and sv['name'] in txt[0], J(cv)))
            if txt:
                await pg.wait_for_timeout(600); h0 = await pg.evaluate("GAME.G.hour"); tg = time.time(); got = await tap_text(pg, cdp, ['直接去上課'])
                R.note('USERVIEW b：照文字按 %s' % got)
                last = None; free = None; tfree = None; k = 0
                while time.time() - tg < 300:
                    s = await ms(pg); sig = (s['dlg'], s['dtext'], s['ch'], s['zone'], s['fade'])
                    if sig != last: last = sig; k += 1; await shot(pg, 'uv_b_step%02d' % k)
                    if s['ch']: await play(pg, cdp, picks=('先自由活動',), max_s=30, idle_s=1, tag='uv_b'); continue
                    if s['dlg']: free = None; await pg.wait_for_timeout(700); await L.tap(pg, cdp, '#dlg'); continue
                    if s['busy'] or s['fade'] or s['paused']: free = None; await pg.wait_for_timeout(200); continue
                    free = free or time.time()
                    if time.time() - free >= 2.0: tfree = free - tg; break
                    await pg.wait_for_timeout(150)
                r1 = await pg.evaluate(REC)
                ev = [[e['k'], e.get('h'), e.get('z'), e.get('text') or e.get('opts') or e.get('to') or e.get('fn')] for e in await logs(pg, n1) if e['k'] in ('toast', 'cap', 'choose', 'pick', 'say', 'enter', 'cls')]
                R.note('USERVIEW b：按下到能動 %s 秒；遊戲時間 %.3f → %.3f；落在 %s；CLS.rec %s；經過 %s' % (None if tfree is None else round(tfree, 1), h0, r1['h'], r1['zone'], J(r1), J(ev)))
                await phone_today(pg, cdp, 'uv_b_end', week=False); await close_phone(pg, cdp)
        else: R.check('USERVIEW b：睡醒、起床選單出了', False)
        R.check('USERVIEW：沒有 JS 例外', not errs, J(errs[:3]))
    finally:
        await b.close()


FN = {'REPRO': part_repro, 'GUARD': part_guard, 'FULL': part_full, 'SERVICE': part_service, 'OTHERS': part_others, 'REGRET': part_regret, 'PHONE': part_phone, 'USERVIEW': part_userview}


async def main():
    real = os.popen('git -C "%s" rev-parse --short=9 HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or 'tests', '..')).read().strip()
    print('CC GOCLASS（BUG-GOCLASS-SKIPPED-1111）新舊對照：SHA=%s worktree=%s；PARTS=%s；Playwright 手機模擬 ≠ iPhone' % (SHA or '?', real or '?', ','.join(PARTS)), flush=True)
    async with async_playwright() as p:
        for part in PARTS:
            if part not in FN: R.note('不認得的 PART：%s' % part); continue
            print('===== %s =====' % part, flush=True); t0 = time.time()
            try: await FN[part](p)
            except Exception as e:
                import traceback; traceback.print_exc(); R.check('%s：沒有例外' % part, False, repr(e)[:300])
            R.note('%s 花了 %.1f 分鐘' % (part, (time.time() - t0) / 60))
    sys.exit(R.finish())


asyncio.run(main())
