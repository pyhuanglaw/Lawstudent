"""CC-C 11-12：LAWWW-C 07:43（07:47 更正＝AA_831 第二版）——四間店的營業時間（SHOP-STANDARD-BACKFILL-1112，AA_831）＋新店打工後續（SHOP-JOBS，3611dfac34）。
開發分支 8cd94d440ded2c19332c794bbbc224f2ee6de7e0（含 77de5bcb30、3611dfac34：git merge-base --is-ancestor 確認過）。判定歸 BB；探針只記事實、截圖，檢查＝程式自己寫的預期。Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
對照的程式（8cd94d440d 讀過；行號是那一版的）：
  HOURS src/data/places.js L63～L66（noodle 每天 11:00–23:00、bookstore 每天 10:00–21:30、tz_limao 每天 19:00–23:30、us_market 每天 08:00–22:00；AA_831 第二版 8e41821f4a）；
        src/data/shop_hours_aa831.js（門口那一句 door L13／L21／L29／L37；limaoClose 上師「今天就看到這裡。回去早點睡。」L40）；
        src/shop_hours831_3d.js（S.due L25：那天在這間店有答應的邀約、約的時間前一小時起／出遊 OUT 的 goto、地點字（只有 noodle、bookstore 有 OUT_RE）／JOBS.early；S.door L32：關著＝say(null, door)＋toast PLACES.closedText）；
        src/story3d.js L1482（店門 exit → SH831.door；燒臘、頁間書屋）、src/us_life3d.js L388（草原超市門 → SH831.door，USL.here 才走這裡；story3d 那一處也會擋）；
        src/tingzhou3d.js L111（禮貌生財關著＝門的互動點變成「看禮貌生財」、沒有 exit、look＝SH831.line；開不開只看 S.limaoOpen，不看 SH831.due）、src/game3d.js L291（look＝caption，不是 toast）；
        src/xs_close3d.js（S.LINE L14「我們今天要打烊了。」；L51 noodle＝老闆娘、bookstore＝老闆、us_market＝店員；L52 tz_limao＝上師＋limaoClose.line；S.closingMoment L75、S.gen L86、S.outOf L90、S.closeOut L95、S.tick L102：
        讀檔在已經關的店裡＝不是打烊那一刻、這一趟沒看過開著＝不說那一句，走出去、toast 開放時間）；src/jobs3d.js S.early L138（頁間書屋 books 週六 10:00～14:00 的班：開班前半小時起）；src/data/invites.js L13／L636（邀約地點 noodle、bookstore；tz_limao、us_market 沒有）。
        美國：src/us_life3d.js L39 isUS（stage law＋STORY.route＝US）、L49 usDay（US_ARRIVED、沒有 US_RETURNED、出發日 2028-08-02～返台日 2028-12-23 前一天）；src/exchange3d.js L18（us_market、us_market_street 算在美國）。
  JOBS2 src/jobs3d.js（S.busyLine L174＋S.pickDays 的 ask L179：選了灰的＝旁白「（這個時段你已經有班了。）」再回選單；S.apply3 L512；S.znCoLines L337、S.segAfter L341：山嵐「上架」那一段後面、一次、_meta.znCo＝那天；
        S.staffTicketOk L413（cinema shifts≥3、這週沒拿過、沒有同行）、S.staffTicketTakeLine L418；S.runShiftX L325 過午夜的班 → S.nightSleep L353（S.liveAt L352：宿舍＝進 dorm、STORY.sleepNow 到 10:00））；
        src/nanyang_sys3d.js L59（拿員工票＝售票員一句）；src/data/shop_jobs_aa829.js L6 busyLine；src/data/shop_jobs_aa828.js L92（co：宋知寧 met／new、until 大二下）、L201（ticket.take）；src/shopenc3d.js L47／L55（認識過的名字＝SHOPENC.npOf 的 name）。
PARTS（env PARTS=HOURS,JOBS2；預設全部）：
  HOURS 四間（env SHOPS=noodle,bookstore,tz_limao,us_market）各四項：
    a 打烊以後（關門 +0.2 小時）讀檔到街上、站到店門前 4 m → 走到店門按 → 記旁白／caption／toast、區域沒變；
    b 關門前 0.3 小時讀檔在店裡（開著＝這一趟看過開著）→ 等到打烊 → 記說話的人和那一句、最後在哪一區、站不站得住；
    c 已經關門的時間讀檔在店裡（不是打烊那一刻）→ 被帶出去、toast、區域、canStand、推得動搖桿；
    d 那一天有約（noodle、bookstore：INVITE 答應的邀約）／有班（bookstore：books 週六 10:00 的班）→ 關著的時間按店門進得去；同一時間沒有約、沒有班的對照＝進不去。
      禮貌生財、草原超市：程式沒有可以約的地點、沒有班（invites.js 沒有、JOBS.ZONE_KEY 沒有、OUT_RE 沒有；禮貌生財的門關著時連 exit 都沒有）＝不測，JSON 寫原因。
    草原超市：【前置／捷徑】使用者存檔改到美國那一學期（2028-09-13，env US_DAY），加美國路線旗標（EXCHANGE_ROUTE US、US_DEPARTED、US_ARRIVED…，同 cc_aa814_probe.py 的 us_flags）、events.done 補 ev_us1_arrive、ev_us1_mom。
  JOBS2 1 灰的那一班：山嵐書店（shanlan）告示 → 問店員 → 班表：先按撞班（灰）的 → 要有旁白「（這個時段你已經有班了。）」、同一份班表再出一次、還沒排班 → 選另一天 → 「班表：」toast。
        2 南洋員工票：【前置／捷徑】G.jobs.cinema shifts=3（大一下的週三 14:00 在大廳）→ 走到「買票」按 → 選單有「拿員工票（站著看）」→ 選 → 售票員「員工票。站最後面，不要擋到走道。」；對照 shifts=2＝選單沒有那一項。
        3 山嵐第一班遇到宋知寧：【前置／捷徑】G.jobs.shanlan 週日班、shifts=0、_meta.znCo 沒有；G.flags.SHOP_ZN_MET 有／沒有兩趟 → 讀檔週日 13:24 店裡、等開班（S.tick）→ 三段照第一個選項 →「上架」後面那幾句（說話的人、字、位置）。
        4 大夜班：【前置／捷徑】G.jobs.dakou 週六 22:00～02:00 → 讀檔週六 21:24 大口漢堡、等開班、做完 → 回住的地方（JOBS.liveAt）→ 區域、日子、時間（期望：宿舍、隔天、10:00）。
【前置／捷徑】讀檔一律 GAME.applySave（L.load_state quiet_events＝條件事件、手機自動打開關掉，STORY.TICKS 照跑）；G.jobs、G.invites、旗標、日子都是改使用者存檔 tests/fixtures/user_save_day51_1110.json，log 標【前置／捷徑】。網址加 ?tapguard（CC_02 乙 4）。
CC_02 清單 2026-11-12：1✓（a 挑打烊以後、不是颱風／過年；b 先在開著的時候進店（markSeen）；d 邀約 state accepted、時間在約的前一小時以內、班＝books 週六 10:00、JOBS.due；員工票 shifts≥3、這週沒拿、沒有同行；宋知寧 _meta.znCo 沒有、日子在大二下以前；美國 isUS／usDay 的旗標全設） 2✓（店門、互動點、時間、字全從頁面上的遊戲資料讀（PLACES、SHOP_HOURS_AA831、XSCLOSE、SHOP_JOBS_AA828／829），另外和 8cd94d440d 原始碼抄下來的字比一次；找不到門列出全部 exit） 3✓（日子依序掃、跳過的記原因（DAY_JS）；站的點 4 個依序試；撞班的對象照 KEYS 順序挑） 4✓（按互動鍵前看互動鍵的字、選項照字選、選之前看 elementFromPoint） 5✓（go_to 40 秒一段、到了看互動鍵的字、走不到附 pathTo／canStand） 6✓（讀檔等 7 秒淡入；打烊前 0.3 小時（18 分）讀檔、等打烊上限照雲端最慢算 900 秒、每 30 秒記一次狀態；a 在關門 +0.2 小時；c 離打烊那一刻超過半小時；d 離開門至少 0.8 小時） 7✓（probe_lint、每段 JS node 檢查、.get()、前一步沒成功就跳過、每段 try） 8✓（期望值＝原始碼的字和 places.js 的時間；d 每一項都有同一時間沒有約／班的對照＝要進不去；員工票有 shifts=2 對照） 9n/a（不判截圖，每段存一張給 BB 看） 10✓（插進來的劇情先點完、選單照字選、遊戲內部選單照按鈕字） 11✓（SHA 40 碼、merge-base 確認 8cd94d440d 含 77de5bcb30、3611dfac34；ENV 沒有「|」） 12✓（每段印「真的按了店門／等到打烊／被帶出去／按了灰的／選了員工票／做完一班」那一行，沒走到就 FAIL） 13✓（走路分段、途中有對話／選單就停下來處理；等打烊、等開班的迴圈遇到對話、選單照字處理並記下來；記每一段走的是哪條路）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [PARTS=HOURS,JOBS2] [SHOPS=noodle,bookstore,tz_limao,us_market] [J2=GREY,TICKET,ZN,NIGHT] [US_DAY=2028-09-13] [FIX=tests/fixtures/user_save_day51_1110.json] python3 cc_l77de_probe.py <url> <out>"""
import os, sys, json, asyncio, time, copy
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
URL = URL0 if 'tapguard' in URL0 else URL0 + ('&' if '?' in URL0 else '?') + 'tapguard'   # CC_02 乙 4
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
PARTS = [p.strip() for p in (os.environ.get('PARTS') or 'HOURS,JOBS2').split(',') if p.strip()]
SHOPS = [z for z in (os.environ.get('SHOPS') or 'noodle,bookstore,tz_limao,us_market').split(',') if z]
J2 = [x for x in (os.environ.get('J2') or 'GREY,TICKET,ZN,NIGHT').split(',') if x]
US_DAY = os.environ.get('US_DAY') or '2028-09-13'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
R = L.Run('l77de_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
RES = {'tag': TAG, 'sha': SHA, 'url': URL, 'parts': {}}
WDN = ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日']   # src/jobs3d.js L161 const WD（閉包裡的，頁面上讀不到；照抄，8cd94d440d）
STOP = lambda s: bool(s.get('dlg') or s.get('choices'))
STREET = {'noodle': 'gongguan', 'bookstore': 'gongguan', 'tz_limao': 'tingzhou', 'us_market': 'us_market_street'}
# 原始碼抄下來的字（8cd94d440d）：和頁面上的資料各比一次（頁面上的不一樣＝這一版不是要測的那一版）
SRC_CLOSE = {'noodle': ['老闆娘', '我們今天要打烊了。'], 'bookstore': ['老闆', '我們今天要打烊了。'], 'us_market': ['店員', '我們今天要打烊了。'], 'tz_limao': ['上師', '今天就看到這裡。回去早點睡。']}   # xs_close3d.js L14、L51～L52；shop_hours_aa831.js L40
SRC_HOURS = {'noodle': [11, 23], 'bookstore': [10, 21.5], 'tz_limao': [19, 23.5], 'us_market': [8, 22]}   # places.js L63～L66（每天）
SRC_DOOR = {'noodle': '（鐵門拉下來了。玻璃櫃裡的掛鉤是空的，只剩一盞小燈。）', 'bookstore': '（門上掛著「休息中」。櫥窗裡的書換了一排，燈還留著一盞。）',
            'tz_limao': '（騎樓下那張鋪紅布的桌子收起來了。門上貼著一張紙：「今日不看」。）', 'us_market': '（自動門沒有開。裡面的燈暗了一半，推車排成一長列。）'}   # shop_hours_aa831.js L13／L21／L29／L37
SRC_BUSY = '（這個時段你已經有班了。）'   # shop_jobs_aa829.js L6
SRC_TAKE = ['售票員', '員工票。站最後面，不要擋到走道。']   # shop_jobs_aa828.js L201
SRC_ZN_NEW = [['宋知寧', '新來的？二樓我比較熟，找不到可以問我。']]   # shop_jobs_aa828.js L111
SRC_ZN_MET = [['宋知寧', '……又是你。'], [None, '（她抱著一疊書，看了你的名牌一眼。）'], ['宋知寧', '我上次說的另一家，就是這裡。二樓的書我比較熟，找不到就問我。']]   # shop_jobs_aa828.js L96～L107（met＝說話的人換成遊戲裡顯示的名字）
NO_D = {'tz_limao': 'invites.js 沒有禮貌生財這個地點、JOBS.ZONE_KEY 沒有、SH831.OUT_RE 沒有；而且 tingzhou3d.js L111 門關著的時候沒有 exit（只看 S.limaoOpen，不看 SH831.due）',
        'us_market': 'invites.js 沒有草原超市這個地點、JOBS.ZONE_KEY 沒有、SH831.OUT_RE 沒有（美國那一學期沒有在這間店的約、班）'}

HOOK_JS = r"""(()=>{ const W=window; W.__SAY=W.__SAY||[]; W.__MON=W.__MON||[]; W.__CH=W.__CH||[]; W.__TOAST=W.__TOAST||[]; W.__CAP=W.__CAP||[]; if(W.__l77de) return 'already'; W.__l77de=1;
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ try{ W.__SAY.push([(a&&a.name!=null)?String(a.name):(typeof a==='string'?a:null), String(b==null?'':b), +(+GAME.G.hour).toFixed(3), GAME.G.zone]); }catch(e){} return s0.apply(this,arguments); };
  const m0=GAME.money; if(typeof m0==='function') GAME.money=function(d){ try{ W.__MON.push([d, +(+GAME.G.hour).toFixed(3)]); }catch(e){} return m0.apply(this,arguments); };
  const c0=GAME.choose; if(typeof c0==='function') GAME.choose=function(o){ try{ W.__CH.push((o||[]).map(x=>x?((x.dim?'[灰]':'')+x.t):'')); }catch(e){} return c0.apply(this,arguments); };
  const obs=(id,arr)=>{ const t=document.getElementById(id); if(!t) return; let lk=''; new MutationObserver(()=>{ const x=(t.innerText||t.textContent||'').trim(), vis=!!x&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'&&t.style.opacity!=='0'; const k=vis?x:''; if(k&&k!==lk) arr.push(x); lk=k; }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); };
  obs('toast',W.__TOAST); obs('caption',W.__CAP);
  return 'hooked'; })()"""
MARK_JS = "(()=>({say:(window.__SAY||[]).length, mon:(window.__MON||[]).length, ch:(window.__CH||[]).length, toast:(window.__TOAST||[]).length, cap:(window.__CAP||[]).length}))()"
SINCE_JS = "(m=>({say:(window.__SAY||[]).slice(m.say), mon:(window.__MON||[]).slice(m.mon), ch:(window.__CH||[]).slice(m.ch), toast:(window.__TOAST||[]).slice(m.toast), cap:(window.__CAP||[]).slice(m.cap)}))"
ST_JS = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E.player, o=P.obj.position, it=document.getElementById('interact'), ph=document.getElementById('phone'), ch=document.getElementById('choices');
  return {zone:G.zone, day:G.day, hour:+(+G.hour).toFixed(3), money:G.money|0, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active),
    dtext:(((document.getElementById('dlgName')||{}).textContent||'').trim()+'｜'+((document.getElementById('dlgText')||{}).textContent||'').trim()).slice(0,120),
    nch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).length:0,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'', fb:GAME.walkFallbacks||0,
    stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, phone:!!ph&&!ph.classList.contains('hide'), jr:typeof JOBS!=='undefined'&&!!JOBS.running}; })()"""
OPTS_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return [];
  return [...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,k)=>{ const c=b.cloneNode(true); const h=c.querySelector('.hint'); const hint=h?h.textContent.trim():''; if(h) h.remove();
    return {k, t:c.textContent.trim(), hint, dim:!!(b.disabled||b.classList.contains('dim'))}; }); })()"""
OPT_AT_JS = r"""(k=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[k]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
  const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!e&&(e===b||b.contains(e)), who:e?(e.id||String(e.className||'')||e.tagName):null}; })"""
TOP_JS = r"""(s=>{ const b=document.querySelector(s); if(!b) return null; const r=b.getBoundingClientRect(); if(!r.width) return null; const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {top:!!e&&(e===b||b.contains(e)), who:e?(e.id||String(e.className||'')||e.tagName):null}; })"""
ITS_JS = r"""(()=>(GAME.E.interactables||[]).map((i,n)=>{ let lab=''; try{ lab=String(typeof i.label==='function'?i.label():(i.label||'')); }catch(e){} let hid=false; try{ hid=!!i.hidden; }catch(e){}
  return {n, label:lab, x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), lv:i.lv|0, r:i.radius||1.0, hidden:hid, to:i.exit?i.exit.to:null, wzJob:i.wzJob||null, lmDoor:!!i.tzLimaoDoor, look:i.look||null, nyTicket:i.nyTicket||null}; }))()"""
NEAR_PTS_JS = r"""(a=>{ const E=GAME.E, P=E.player.obj.position, out=[]; for(let r=0;r<=a.r+1e-6;r+=0.1) for(let g=0;g<360;g+=20){ const x=a.x+r*Math.sin(g*Math.PI/180), z=a.z+r*Math.cos(g*Math.PI/180);
    if(!E.canStand(x,z,0.3,a.lv|0)) continue; if(out.some(q=>Math.hypot(q.x-x,q.z-z)<0.3)) continue; out.push({x:+x.toFixed(2),z:+z.toFixed(2),d:+Math.hypot(x-P.x,z-P.z).toFixed(2),r:+r.toFixed(2)}); }
  out.sort((p,q)=>(p.d+2*p.r)-(q.d+2*q.r)); return out.slice(0,a.n||4); })"""
DIAG_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position; let path=null; try{ const p=E.pathTo(o.x,o.z,P.lv|0,a.x,a.z,a.lv|0); path=p?p.length:null; }catch(e){ path='err'; }
  const ni=E.nearestInteractable?E.nearestInteractable():null; let nl=''; try{ nl=ni?String(ni.label||''):''; }catch(e){}
  return {me:[+o.x.toFixed(2),+o.z.toFixed(2),P.lv|0], to:[a.x,a.z,a.lv|0], d:+Math.hypot(a.x-o.x,a.z-o.z).toFixed(2), pathLen:path, standHere:!!E.canStand(o.x,o.z,0.3,P.lv|0), standThere:!!E.canStand(a.x,a.z,0.3,a.lv|0), nearest:nl}; })"""
APPROACH_JS = r"""(a=>{ const E=GAME.E, zn=E.zone, P=E.player.obj.position, sp=(zn&&zn.spawn)||{x:P.x,z:P.z}; const lv=a.lv|0; let path=null; try{ path=E.pathTo(sp.x,sp.z,0,a.x,a.z,lv); }catch(e){}
  const pts=(path||[]).map(q=>Array.isArray(q)?q:[q.x,q.z]);
  if(pts.length>=2){ let acc=0; for(let i=pts.length-1;i>0;i--){ const x1=pts[i][0], z1=pts[i][1], x0=pts[i-1][0], z0=pts[i-1][1], Ln=Math.hypot(x1-x0,z1-z0); if(acc+Ln>=a.back){ const t=(a.back-acc)/(Ln||1), x=x1+(x0-x1)*t, z=z1+(z0-z1)*t; if(E.canStand(x,z,0.3,lv)) return {x:+x.toFixed(2),z:+z.toFixed(2),how:'path',n:pts.length}; break; } acc+=Ln; } }
  for(const r of [a.back,a.back-1,a.back+1,2]) for(let g=0;g<360;g+=15){ const x=a.x+r*Math.sin(g*Math.PI/180), z=a.z+r*Math.cos(g*Math.PI/180); if(!E.canStand(x,z,0.3,lv)) continue; let p2=null; try{ p2=E.pathTo(x,z,lv,a.x,a.z,lv); }catch(e){} if(p2&&p2.length) return {x:+x.toFixed(2),z:+z.toFixed(2),how:'ring',r}; }
  return {x:+sp.x.toFixed(2),z:+sp.z.toFixed(2),how:'spawn'}; })"""
PLACE_JS = "(a=>{ const E=GAME.E, P=E.player; E.placeAt(P,a.x,a.z,a.lv|0); P.path=null; return true; })"
DAY_JS = r"""(a=>{ const why={wd:0,term:0,exam:0,hol:0,ty:0}; for(let d=a.d0; d<a.d0+200; d++){ const c=CALENDAR.dateOf(d); if(a.wds&&!a.wds.includes(c.wd)){ why.wd++; continue; } const t=CALENDAR.termOf(d); if(!t){ why.term++; continue; } if(t.exam){ why.exam++; continue; }
    if(CALENDAR.holiday(d)){ why.hol++; continue; } if(CALENDAR.typhoon&&CALENDAR.typhoon(d)){ why.ty++; continue; } return {d, key:c.key, wd:c.wd, term:t.id, week:t.week, why}; } return {d:null, why}; })"""
KEY_JS = "(k=>{ const d=STORY.dayOfKey?STORY.dayOfKey(k):null; if(d==null) return null; const c=CALENDAR.dateOf(d); return {d, key:c.key, wd:c.wd, typhoon:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)), hol:!!CALENDAR.holiday(d)}; })"
# 頁面上的資料（四間店）：時間、門口那一句、打烊那一句、說話的人；和 SRC_* 各比一次
INFO_JS = r"""(a=>{ const z=a.z, H=typeof SHOP_HOURS_AA831!=='undefined'?SHOP_HOURS_AA831:null, X=typeof XSCLOSE!=='undefined'?XSCLOSE:null, ws=PLACES.windowsOf?PLACES.windowsOf(z,a.day):null;
  const C=X&&X.ZONES?X.ZONES[z]:null; return {z, name:(H&&H.shops[z]&&H.shops[z].name)||null, door:(H&&H.shops[z]&&H.shops[z].door)||null, sh831:typeof SH831!=='undefined'&&SH831.ZONES.includes(z),
    ws, text:(PLACES.hours[z]||{}).text||null, who:X?X.whoOf(z):null, line:C?(C.line||X.LINE):null, mute:!!(C&&C.mute), to:C?(C.to||null):null, typhoon:!!(PLACES.typhoonClosed&&PLACES.typhoonClosed(z,a.day)),
    limaoClose:H&&H.limaoClose||null}; })"""
EXPTXT_JS = "(z=>PLACES.closedText(z,(((+GAME.G.hour)%24)+24)%24,GAME.G.day))"
OPEN_JS = "(z=>({open:PLACES.isOpen(z,(((+GAME.G.hour)%24)+24)%24,GAME.G.day), due:typeof SH831!=='undefined'&&SH831.due?SH831.due(GAME.G,z):null, early:typeof JOBS!=='undefined'&&JOBS.early?JOBS.early(GAME.G,z):null}))"
EXITS_JS = "(z=>(GAME.E.interactables||[]).filter(i=>i&&i.exit&&i.exit.to).map(i=>({label:String(i.label||''), to:i.exit.to})))"
US_JS = "(()=>({here:typeof USL!=='undefined'&&USL.here?USL.here(GAME.G):null, inUS:typeof EXCH!=='undefined'&&EXCH.inUS?EXCH.inUS(GAME.G):null, route:STORY.route?STORY.route(GAME.G):null}))()"
LM_LOOK_JS = "(()=>{ const z=GAME.E.zone, d=z&&z.tzLimao&&z.tzLimao.door; return d?{label:d.label, look:d.look||null, exit:d.exit?d.exit.to:null}:null; })()"
INV_JS = "(id=>(GAME.G.invites||[]).filter(v=>v&&v.id===id).map(v=>({state:v.state, accepted:v.accepted, h:v.h, day:v.day, place:v.place})))"
# 打工：頁面上的字（和 SRC_* 比）
JDATA_JS = r"""(()=>{ const A=typeof SHOP_JOBS_AA828!=='undefined'?SHOP_JOBS_AA828.jobs:{}, B=typeof SHOP_JOBS_AA829!=='undefined'?SHOP_JOBS_AA829:{};
  const sh=A.shanlan||{}, ci=A.cinema||{}; return {busyLine:B.busyLine||null, jobsBusyLine:typeof JOBS!=='undefined'&&JOBS.busyLine?JOBS.busyLine():null, take:(ci.ticket||{}).take||null, opt:(ci.ticket||{}).opt||null, after:(ci.ticket||{}).after,
    co:sh.co||null, segs:(sh.segs||[]).map(g=>({name:g.name,nov:g.nov,ch:g.ch})), look:sh.look||null, notice:sh.notice, askOpt:sh.askOpt, laterOpt:sh.laterOpt, boss:sh.boss, ask:sh.ask,
    nyLabel:typeof NYS!=='undefined'?NYS.LABEL:null, nyNone:typeof NYS!=='undefined'?NYS.NONE:null}; })()"""
# 打工：條件、能選的日子、撞班的對象（照 KEYS 順序第一個同一天時間重疊、不是過午夜的班）、那一天（cc_l2c82_probe.py 的 PLAN_JS）。只算，算完放回去
PLAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,jobs:G.jobs}; const out={k:a.k};
  try{ JOBS.hrsWd('brunch',6); const W=WZ_JOBS_DATA.shops, s=W[a.k]; if(!s){ out.err='WZ_JOBS_DATA.shops 沒有 '+a.k; return out; }
    const TD=CALENDAR.termDays(a.term); out.term=TD; const d0=Math.max(a.d0,TD.from+7); out.d0=d0;
    G.day=d0; G.jobs={_meta:(keep.jobs&&keep.jobs._meta)||{n:{},asked:{}}};
    out.eligible=JOBS.eligible(G,a.k); out.days=s.days.slice(); out.hours={}; for(const wd of s.days) out.hours[wd]=JOBS.hrsWd(a.k,wd);
    const ok=s.days.filter(wd=>s.classOk||!JOBS.classOn(G,a.k,wd)); out.ok=ok;
    const cand=wd=>{ const h=JOBS.hrsWd(a.k,wd); for(const o of JOBS.KEYS){ if(o===a.k||!W[o]||!Array.isArray(W[o].days)||!W[o].days.includes(wd)) continue; const b=JOBS.hrsWd(o,wd); if(b[1]>24) continue; if(JOBS.overlap(h[0],h[1],b[0],b[1])) return {o,b}; } return null; };
    const C=ok.map(wd=>({wd, c:cand(wd), night:JOBS.hrsWd(a.k,wd)[1]>24})); out.cands=C;
    let pick=null; for(const w of C){ const cl=C.find(x=>x.wd!==w.wd&&x.c); if(cl&&!w.night){ pick={work:w.wd,clash:cl.wd,o:cl.c.o,ob:cl.c.b}; break; } }
    out.pick=pick; }
  catch(e){ out.err=String(e&&e.stack||e).slice(0,400); }
  finally{ G.day=keep.day; G.hour=keep.hour; G.weekday=keep.weekday; G.jobs=keep.jobs; }
  return out; })"""
JOB_ST_JS = r"""(k=>{ const G=GAME.G, j=JOBS.job(G,k); let sn=null; try{ sn=JOBS.shiftNow(G,k); }catch(e){} return {j:j?{day:(j.day||[]).slice(),shifts:j.shifts|0,worked:(j.worked||[]).slice(-3),since:j.since,gone:j.gone||null}:null, shiftNow:sn, running:!!JOBS.running, hour:+(+G.hour).toFixed(3), day:G.day, zone:G.zone, znCo:(G.jobs&&G.jobs._meta)?(G.jobs._meta.znCo==null?null:G.jobs._meta.znCo):null}; })"""
ZN_NAME_JS = "(()=>{ try{ const P=typeof SHOPENC!=='undefined'&&SHOPENC.npOf?SHOPENC.npOf(GAME.G,SHOPENC.ZN):null; return P&&P.name?P.name:null; }catch(e){ return null; } })()"
LIVE_JS = "(()=>({liveAt:typeof JOBS!=='undefined'&&JOBS.liveAt?JOBS.liveAt(GAME.G):null, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3)}))()"
NYF_JS = "(()=>{ const F=GAME.G.flags||{}; return {NY_TICKET:F.NY_TICKET==null?null:F.NY_TICKET, NY_TICKET_STAFF:F.NY_TICKET_STAFF==null?null:F.NY_TICKET_STAFF, ok:typeof JOBS!=='undefined'&&JOBS.staffTicketOk?JOBS.staffTicketOk(GAME.G):null}; })()"


async def st(pg):
    return await pg.evaluate(ST_JS)


async def opts(pg):
    return await pg.evaluate(OPTS_JS)


async def tap_opt(pg, cdp, k, tag, what):
    await pg.wait_for_timeout(500)   # ?tapguard：選單剛出來 350 ms 內的那一下不算
    c = await pg.evaluate(OPT_AT_JS, k)
    if not c: R.note('%s 選項「%s」不在畫面上' % (tag, what)); return False
    if not c['top']: R.note('%s 選項「%s」中心最上層是 %s，不是那顆鈕（照按，記下來）' % (tag, what, c['who']))
    await L.touch_tap(cdp, c['xy'][0], c['xy'][1]); await pg.wait_for_timeout(1000); return True


async def press(pg, cdp, tag):
    t = await pg.evaluate(TOP_JS, '#interact')
    if t and not t['top']: R.note('%s 互動鍵中心最上層是 %s（照按，記下來）' % (tag, t['who']))
    await L.tap(pg, cdp, '#interact')


async def drain(pg, cdp, tag, secs=40, picks=('出發',), log=None):
    """把插進來的劇情點完：選單照字（picks 的開頭優先，沒有就第一個不灰、不是「約」的）、對話點過去；回傳記下來的 [字]"""
    log = [] if log is None else log; t0 = time.time()
    while time.time() - t0 < secs:
        q = await st(pg)
        if q['phone'] and not q['dlg'] and not q['nch']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); log.append('選項：' + '｜'.join(('[灰]' if x['dim'] else '') + x['t'] for x in o))
            k = next((x['k'] for p in picks for x in o if x['t'].startswith(p) and not x['dim']), None)
            if k is None: k = next((x['k'] for x in o if not x['dim'] and not x['t'].startswith('約')), o[0]['k'] if o else 0)
            await tap_opt(pg, cdp, k, tag, '插進來的選單'); continue
        if q['dlg']:
            if not log or log[-1] != q['dtext']: log.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q['busy']: break
        await pg.wait_for_timeout(400)
    return log


def base_sv(sv0, day, wd, hour, zone):
    s = copy.deepcopy(sv0); s = s.get('G', s) if isinstance(s.get('G'), dict) else s
    s.pop('_stuck', None); s.pop('_busy', None); s.pop('pos', None)
    s.update(day=day, weekday=wd % 7, hour=hour, zone=zone, weather='clear')
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    return s


async def load(pg, cdp, s, tag, why, drain_s=30):
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(7000)   # 讀檔淡入（CC_02 乙 6）
    await L.close_panels(pg, cdp); await pg.evaluate(HOOK_JS)
    lg = await drain(pg, cdp, tag + ' 讀檔後', secs=drain_s) if drain_s else []
    R.setup('%s 【前置／捷徑】%s' % (tag, why))
    if lg: R.note('%s 讀檔以後先有的劇情（照字點完，記下來）：%s' % (tag, J(lg[-8:])))
    return await st(pg)


async def walk_to_it(pg, cdp, tag, it, want, max_pts=4):
    """分段走到互動點旁邊（每段 ≤40 秒；途中有對話／選單停下來處理，CC_02 乙 13）；到了＝互動鍵的字是 want 開頭。回傳 (到了沒, 路線)"""
    route = []
    pts = await pg.evaluate(NEAR_PTS_JS, {'x': it['x'], 'z': it['z'], 'lv': it['lv'], 'r': max(0.4, it['r'] * 0.75), 'n': max_pts})
    if not pts: R.note('%s「%s」範圍 %.2f m 裡沒有站得住的點，改走中心' % (tag, want, it['r'])); pts = [{'x': it['x'], 'z': it['z'], 'd': None, 'r': 0}]
    for k, pt in enumerate(pts[:max_pts]):
        for seg in range(4):
            q = await st(pg)
            if q['interact'].startswith(want): return True, route
            if q['dlg'] or q['nch']:
                lg = await drain(pg, cdp, tag + ' 途中', secs=40); route.append({'drain': lg[-4:]}); continue
            ok = await L.go_to(pg, cdp, R, pt['x'], pt['z'], 0.3, '%s 走到「%s」旁（第 %d 點、第 %d 段）' % (tag, want, k + 1, seg + 1), max_s=40, lv=it['lv'], stop=STOP)
            q = await D.settle(pg); route.append({'pt': [pt['x'], pt['z']], 'seg': seg + 1, 'ok': bool(ok), 'at': [q['x'], q['z'], q['lv']], 'interact': q['interact'], 'how': '點地 go_to'})
            q = await st(pg)
            if q['interact'].startswith(want): return True, route
            if ok and not q['dlg'] and not q['nch']: break
        R.note('%s 第 %d 點到了、互動鍵是「%s」不是「%s」：換下一點' % (tag, k + 1, (await st(pg))['interact'], want))
    route.append({'diag': await pg.evaluate(DIAG_JS, {'x': it['x'], 'z': it['z'], 'lv': it['lv']})})
    return False, route


async def find_its(pg, pred):
    return [i for i in await pg.evaluate(ITS_JS) if pred(i)]


def said_of(lg):
    return [x[1] for x in lg.get('say', [])]


def dump():
    open(os.path.join(OUT, 'l77de_%s.json' % TAG), 'w', encoding='utf-8').write(J(RES))


# ---------------------------------------------------------------- HOURS
def door_pred(z):
    return lambda i: (not i['hidden']) and (i['to'] == z or (z == 'tz_limao' and i['lmDoor']))


async def hours_sv(sv0, z, dd, us, hour, zone):
    s = base_sv(sv0, dd['d'], dd['wd'], hour, zone)
    if z == 'us_market' and us:
        s.setdefault('flags', {}).update(us['flags']); s['stage'] = 'law'
        ev = s.setdefault('events', {}); dn = ev.setdefault('done', {})
        for e in ('ev_us1_arrive', 'ev_us1_mom'): dn[e] = dn.get(e) or dd['d'] - 30
    return s


def us_why(z, us):
    return ('；美國路線旗標 %s、events.done 補 ev_us1_arrive、ev_us1_mom（同 cc_aa814_probe.py us_flags）' % J(us['flags'])) if z == 'us_market' and us else ''


async def door_once(pg, cdp, z, tag, shot):
    """站到店門前 4 m（E.placeAt）→ 分段走到店門 → 按 → 記字。回傳 {after, say, toast, cap, lines, door, exp, before}"""
    out = {}
    allx = await find_its(pg, lambda i: i['to'] == z or (z == 'tz_limao' and i['lmDoor'])); out['all'] = allx
    dr = next(iter(await find_its(pg, door_pred(z))), None)
    if not R.check('%s %s 有看得到的店門' % (tag, STREET[z]), bool(dr), J({'door': allx, 'exits': await pg.evaluate(EXITS_JS, z)})): return out
    if z == 'tz_limao': out['lm'] = await pg.evaluate(LM_LOOK_JS)
    ap = await pg.evaluate(APPROACH_JS, {'x': dr['x'], 'z': dr['z'], 'lv': dr['lv'], 'back': 4.0})
    await pg.evaluate(PLACE_JS, {'x': ap['x'], 'z': ap['z'], 'lv': dr['lv']}); await pg.wait_for_timeout(1500)
    R.setup('%s 【前置／捷徑】E.placeAt 站到「%s」(%s, %s) 前 4 m 的 (%s, %s)（%s）' % (tag, dr['label'], dr['x'], dr['z'], ap['x'], ap['z'], ap['how']))
    ok, route = await walk_to_it(pg, cdp, tag, dr, dr['label']); out['route'] = route; out['door'] = dr
    if not R.check('%s 走到「%s」、互動鍵是它（路：E.placeAt 前 4 m → 點地 go_to）' % (tag, dr['label']), ok, J(route[-3:])):
        await D.shot(pg, shot + '_nobtn', judge_black=False); return out
    out['before'] = await st(pg); out['exp'] = await pg.evaluate(EXPTXT_JS, z); out['open'] = await pg.evaluate(OPEN_JS, z)
    m0 = await pg.evaluate(MARK_JS)
    await press(pg, cdp, tag); await pg.wait_for_timeout(1200)
    lines = []
    for _ in range(60):
        q = await st(pg)
        if q['zone'] != out['before']['zone']: break
        if q['nch']:
            o = await opts(pg); lines.append('選項：' + '｜'.join(x['t'] for x in o)); await tap_opt(pg, cdp, len(o) - 1, tag, o[-1]['t']); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q['busy']: break
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(2500)
    q = await st(pg); lg = await pg.evaluate(SINCE_JS, m0)
    out.update({'after': q, 'lines': lines, 'say': lg['say'], 'toast': lg['toast'], 'cap': lg['cap']})
    await D.shot(pg, shot, judge_black=False)
    R.note('%s 按下去：%s；對話 %s；toast %s；caption %s' % (tag, J({k_: q[k_] for k_ in ('zone', 'hour', 'stand')}), J(lg['say']), J(lg['toast']), J(lg['cap'])))
    return out


async def hours_a(pg, cdp, sv0, z, inf, dd, us):
    tag = '[HOURS %s a 打烊以後的店門]' % z; out = {}; RES['parts']['HOURS'][z]['a'] = out
    h = inf['close'] + 0.2
    s = await hours_sv(sv0, z, dd, us, h, STREET[z])
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s %.2f 時（關門 %.2f 後 0.2 小時）%s 出生點%s' % (dd['key'], h, inf['close'], STREET[z], us_why(z, us)))
    if not R.check('%s 讀到 %s' % (tag, STREET[z]), q['zone'] == STREET[z], J(q)): return
    if z == 'us_market': out['us'] = await pg.evaluate(US_JS); R.check('%s 前置：人在美國（USL.here）' % tag, bool(out['us'].get('here')), J(out['us']))
    r = await door_once(pg, cdp, z, tag, 'hours_%s_a_door' % z); out.update(r)
    if not r.get('after'): return
    R.check('%s 按了以後沒有進去（還在 %s）' % (tag, STREET[z]), r['after']['zone'] == STREET[z], J(r['after']))
    if z == 'tz_limao':
        lm = r.get('lm') or {}
        R.check('%s 門的互動點是「看…」、沒有 exit（tingzhou3d.js L111）' % tag, r['door']['label'].startswith('看') and not lm.get('exit'), J(lm))
        R.check('%s 跳出的字（caption）＝稿的那一句「%s」' % (tag, SRC_DOOR[z]), any(SRC_DOOR[z] in t for t in r['cap']), J(r['cap']))
        R.note('%s 開放時間提示：toast %s（原始碼：look 只出 caption，沒有 toast＝記下來給 BB 看）' % (tag, J(r['toast'])))
    else:
        R.check('%s 旁白＝稿的那一句「%s」（說話的人空白）' % (tag, SRC_DOOR[z]), any(x[1] == SRC_DOOR[z] and not x[0] for x in r['say']), J(r['say']))
        R.check('%s toast＝開放時間 PLACES.closedText「%s」' % (tag, r.get('exp')), bool(r.get('exp')) and r['exp'] in r['toast'], J(r['toast']))


async def wait_close(pg, cdp, z, tag, inf, maxs=900):
    """等到打烊：遇到對話照點、遇到選單記下來選第一個不灰的；離開這一區、場景不忙＝結束。每 30 秒記一次狀態＋截圖"""
    lines, menus = [], []; t0 = time.time(); tlog = time.time()
    while time.time() - t0 < maxs:
        q = await st(pg)
        if q['phone'] and not q['dlg'] and not q['nch']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); menus.append([x['t'] for x in o]); k = next((x['k'] for x in o if not x['dim']), 0)
            R.note('%s 等的時候出了選單 %s → 選「%s」' % (tag, J(menus[-1]), o[k]['t'] if o else '?')); await tap_opt(pg, cdp, k, tag, '選單'); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if q['zone'] != z and not q['busy']: return True, lines, menus
        if time.time() - tlog > 30:
            tlog = time.time(); R.note('%s 等打烊 %.0f 秒：%s；%s' % (tag, time.time() - t0, J({k_: q[k_] for k_ in ('zone', 'hour', 'busy', 'interact')}), J(await pg.evaluate(OPEN_JS, z))))
            await D.shot(pg, 'hours_%s_b_wait_%d' % (z, int(time.time() - t0)), judge_black=False)
        await pg.wait_for_timeout(500)
    return False, lines, menus


async def hours_b(pg, cdp, sv0, z, inf, dd, us):
    tag = '[HOURS %s b 打烊時人在店裡]' % z; out = {}; RES['parts']['HOURS'][z]['b'] = out
    h = inf['close'] - 0.3
    s = await hours_sv(sv0, z, dd, us, h, z)
    m0 = await pg.evaluate(MARK_JS)
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s %.2f 時（關門前 0.3 小時）在 %s 店裡（出生點）%s' % (dd['key'], h, z, us_why(z, us)), drain_s=10)
    out['load'] = q
    if not R.check('%s 讀到 %s（開著）' % (tag, z), q['zone'] == z, J(q)): return
    out['open0'] = await pg.evaluate(OPEN_JS, z); out['exits'] = await pg.evaluate(EXITS_JS, z)
    R.check('%s 前置：讀檔的時候店開著（這一趟看過開著）' % tag, bool(out['open0'].get('open')), J(out['open0']))
    exp_to = inf['to'] or next((e['to'] for e in out['exits'] if e['to'] != z), None)
    ok, lines, menus = await wait_close(pg, cdp, z, tag, inf)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    q1 = await st(pg); lg = await pg.evaluate(SINCE_JS, m0)
    out.update({'done': ok, 'lines': lines, 'menus': menus, 'say': lg['say'], 'toast': lg['toast'], 'cap': lg['cap'], 'after': q1, 'exp_to': exp_to})
    await D.shot(pg, 'hours_%s_b_after' % z, judge_black=False)
    R.note('%s 對話 %s；toast %s；最後 %s' % (tag, J(lg['say']), J(lg['toast']), J(q1)))
    if not R.check('%s 等到打烊、被帶出店（等的時候在店裡，900 秒內）' % tag, ok, J(q1)): return
    who, line = SRC_CLOSE[z]
    hit = [x for x in lg['say'] if x[1] == line]
    R.check('%s 打烊那一句：%s「%s」' % (tag, who, line), any(x[0] == who for x in hit), J(lg['say']))
    if hit: R.note('%s 那一句說的時候 %s 時、在 %s' % (tag, hit[0][2], hit[0][3]))
    R.check('%s 那一句在店裡說（走出去以前）' % tag, any(x[3] == z for x in hit), J(hit))
    R.check('%s 走到店外：%s（表上的 to／店裡的出口）' % (tag, exp_to), q1['zone'] == exp_to, J({'zone': q1['zone'], 'exits': out['exits']}))
    R.check('%s 出來以後站得住（canStand）' % tag, bool(q1['stand']), J(q1))


async def hours_c(pg, cdp, sv0, z, inf, dd, us):
    tag = '[HOURS %s c 讀檔在已經關的店裡]' % z; out = {}; RES['parts']['HOURS'][z]['c'] = out
    h = {'noodle': 9.5, 'bookstore': 22.5, 'tz_limao': 15.0, 'us_market': 23.0}.get(z, inf['close'] + 1.0)   # 離打烊那一刻 >0.5 小時（S.closingMoment），也不在開門前後
    s = await hours_sv(sv0, z, dd, us, h, z)
    m0 = await pg.evaluate(MARK_JS)
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    R.setup('%s 【前置／捷徑】讀使用者存檔，改到 %s %.2f 時（關著）人在 %s 店裡（出生點）%s' % (tag, dd['key'], h, z, us_why(z, us)))
    t0 = time.time(); lines = []; q = await st(pg)
    while time.time() - t0 < 90:
        q = await st(pg)
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if q['nch']:
            o = await opts(pg); lines.append('選項：' + '｜'.join(x['t'] for x in o)); await tap_opt(pg, cdp, 0, tag, o[0]['t'] if o else '?'); continue
        if q['zone'] != z and not q['busy'] and time.time() - t0 > 7: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    q1 = await st(pg); lg = await pg.evaluate(SINCE_JS, m0); exp = PLACE_TXT.get(z)
    out.update({'after': q1, 'lines': lines, 'say': lg['say'], 'toast': lg['toast'], 'secs': round(time.time() - t0, 1)})
    await D.shot(pg, 'hours_%s_c_after' % z, judge_black=False)
    R.note('%s 讀檔後 %.0f 秒：%s；對話 %s；toast %s' % (tag, time.time() - t0, J(q1), J(lg['say']), J(lg['toast'])))
    if not R.check('%s 被帶出店（不在 %s）' % (tag, z), q1['zone'] != z, J(q1)): return
    R.check('%s 到了 %s（表上的 to）' % (tag, inf['to'] or '店的出口'), (q1['zone'] == inf['to']) if inf['to'] else True, J(q1))
    R.check('%s 沒有說打烊那一句（不是打烊那一刻、這一趟沒看過開著）' % tag, not any(x[1] == SRC_CLOSE[z][1] for x in lg['say']), J(lg['say']))
    R.check('%s toast＝開放時間（PLACES.closedText，含「%s」）' % (tag, inf['text']), any(('現在沒有開' in t) for t in lg['toast']) and (not exp or exp in lg['toast']), J({'toast': lg['toast'], 'exp': exp}))
    R.check('%s 出來以後站得住（canStand）' % tag, bool(q1['stand']), J(q1))
    mv = await D.pushable(pg, cdp); out['push'] = mv
    R.check('%s 推搖桿走得動（沒有卡住，≥0.3 m）' % tag, mv >= 0.3, J(mv))


PLACE_TXT = {}


async def hours_d(pg, cdp, sv0, z, inf, dd, sat):
    if z in NO_D:
        RES['parts']['HOURS'][z]['d'] = {'skip': NO_D[z]}; R.note('[HOURS %s d] 不測：%s' % (z, NO_D[z])); return
    cases = []
    if z == 'noodle': cases.append(('邀約', dd, 10.2, {'place': 'noodle', 'zone': 'noodle', 'h': 11.0, 'label': '和沈以安約在公館燒臘'}))
    if z == 'bookstore':
        cases.append(('邀約', dd, 9.2, {'place': 'bookstore', 'zone': 'bookstore', 'h': 10.0, 'label': '和沈以安約在頁間書屋'}))
        if sat.get('d') is not None: cases.append(('有班', sat, 9.6, None))
    out = RES['parts']['HOURS'][z]['d'] = {}
    for kind, day, h, iv in cases:
        for ctl in (False, True):
            tag = '[HOURS %s d %s%s]' % (z, kind, ' 對照（沒有約、沒有班）' if ctl else '')
            o = out[kind + ('_ctl' if ctl else '')] = {}
            try:
                s = base_sv(sv0, day['d'], day['wd'], h, STREET[z])
                s['invites'] = [v for v in s.get('invites', []) if v.get('day') != day['d']]
                meta = (s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}; s['jobs'] = {'_meta': meta}
                why = '讀使用者存檔，改到 %s（%s）%.2f 時 %s 出生點（%s 關著）；G.jobs 只留 _meta、拿掉那天的邀約' % (day['key'], WDN[day['wd']], h, STREET[z], z)
                if not ctl and iv:
                    s['invites'].append(dict(iv, id='cc77_iv', who='heroine_01', day=day['d'], state='accepted', accepted=True, by='player', now=False, rem=1))
                    why += '；G.invites 加一筆答應了的邀約 %s %.2f 時（約的前一小時起 SH831.due）' % (iv['place'], iv['h'])
                if not ctl and kind == '有班':
                    s['jobs']['books'] = {'since': day['d'] - 14, 'from': (day['d'] - 14) * 24, 'day': [6], 'shifts': 2, 'skill': 2, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0, 'worked': [], 'chk': day['d'] - 1, 'wk': {}, 'brk': {}, 'ot': {}, 'back': False, 'away': False}
                    why += '；G.jobs.books＝頁間書屋週六 10:00～14:00 的班（JOBS.early：開班前半小時起）'
                q = await load(pg, cdp, s, tag, why)
                if not R.check('%s 讀到 %s' % (tag, STREET[z]), q['zone'] == STREET[z], J(q)): continue
                pre = await pg.evaluate(OPEN_JS, z); o['pre'] = pre
                R.note('%s 按以前：%s' % (tag, J(pre)))
                if ctl: R.check('%s 前置：店關著、沒有約也沒有班（SH831.due 假）' % tag, not pre['open'] and not pre['due'], J(pre))
                else: R.check('%s 前置：店關著、這一天有%s（SH831.due 真）' % (tag, kind), not pre['open'] and bool(pre['due']), J(pre))
                r = await door_once(pg, cdp, z, tag, 'hours_%s_d_%s%s' % (z, 'iv' if kind == '邀約' else 'shift', '_ctl' if ctl else ''))
                o.update(r)
                if not r.get('after'): continue
                q2 = await D.wait_zone(pg, cdp, z, 10) if not ctl else r['after']
                if not ctl:
                    lg = await drain(pg, cdp, tag + ' 進去以後', secs=60); o['afterLines'] = lg
                    if lg: R.note('%s 進去以後接著演的（照字點完）：%s' % (tag, J(lg[-10:])))
                    o['inv'] = await pg.evaluate(INV_JS, 'cc77_iv')
                    R.check('%s 關著也進得去（到了 %s）' % (tag, z), q2['zone'] == z or any(x[3] == z for x in r.get('say', [])), J({'q': q2, 'inv': o['inv']}))
                else:
                    R.check('%s 對照：同一時間進不去（還在 %s、旁白是門口那一句）' % (tag, STREET[z]), r['after']['zone'] == STREET[z] and any(x[1] == SRC_DOOR[z] for x in r['say']), J({'after': r['after'], 'say': r['say']}))
            except Exception as e: R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
            dump()


async def part_hours(pg, cdp, sv0):
    RES['parts']['HOURS'] = {}
    dd = await pg.evaluate(DAY_JS, {'d0': int(sv0.get('day', 51)) + 1, 'wds': [3]})
    sat = await pg.evaluate(DAY_JS, {'d0': int(sv0.get('day', 51)) + 1, 'wds': [6]})
    RES['parts']['HOURS']['_day'] = {'wed': dd, 'sat': sat}
    if not R.check('[HOURS] 找得到存檔以後第一個學期中的週三（不是假日、颱風）', dd.get('d') is not None, J(dd)): return
    R.check('[HOURS] 找得到存檔以後第一個學期中的週六（頁間書屋的班）', sat.get('d') is not None, J(sat))
    us = None
    if 'us_market' in SHOPS:
        uk = await pg.evaluate(KEY_JS, US_DAY); a = await pg.evaluate(KEY_JS, '2028-08-02'); p = await pg.evaluate(KEY_JS, '2028-06-08')
        if R.check('[HOURS us_market] 美國那一天 %s、出發日 2028-08-02 讀得到（STORY.dayOfKey）' % US_DAY, bool(uk and a and p), J([uk, a, p])):
            us = {'day': {'d': uk['d'], 'key': uk['key'], 'wd': uk['wd']}, 'flags': {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': a['d'], 'US1': 'together', 'Y4_PATH': 'bar', 'Y4_PATH_DAY': p['d']}}
        RES['parts']['HOURS']['_us'] = us
    for z in SHOPS:
        RES['parts']['HOURS'][z] = {}
        try:
            zd = us['day'] if (z == 'us_market' and us) else dd
            if z == 'us_market' and not us: R.check('[HOURS us_market] 沒有美國的日子：整間跳過', False, ''); continue
            inf = await pg.evaluate(INFO_JS, {'z': z, 'day': zd['d']}); RES['parts']['HOURS'][z]['info'] = inf
            ws = inf.get('ws') or []
            inf['close'] = max(w[1] for w in ws) if ws else None
            R.note('[HOURS %s] 頁面上的資料：%s' % (z, J(inf)))
            R.check('[HOURS %s] 這一版的時間＝原始碼 places.js（%s）' % (z, J(SRC_HOURS[z])), ws == [SRC_HOURS[z]], J(ws))
            R.check('[HOURS %s] 門口那一句＝原始碼 shop_hours_aa831.js' % z, inf.get('door') == SRC_DOOR[z], J(inf.get('door')))
            R.check('[HOURS %s] 打烊那一句、說話的人＝原始碼 xs_close3d.js（%s）' % (z, J(SRC_CLOSE[z])), [inf.get('who'), inf.get('line')] == SRC_CLOSE[z] and not inf.get('mute'), J([inf.get('who'), inf.get('line'), inf.get('mute')]))
            if inf['close'] is None: R.check('[HOURS %s] 那一天有營業時間' % z, False, J(ws)); continue
            if inf.get('typhoon'): R.check('[HOURS %s] 那一天不是颱風假' % z, False, J(zd)); continue
            PLACE_TXT[z] = None
            for nm, fn in (('a', hours_a), ('b', hours_b), ('c', hours_c)):
                try:
                    if nm == 'c':
                        PLACE_TXT[z] = await pg.evaluate("(a=>PLACES.closedText(a.z,a.h,a.d))", {'z': z, 'h': {'noodle': 9.5, 'bookstore': 22.5, 'tz_limao': 15.0, 'us_market': 23.0}.get(z), 'd': zd['d']})
                    await fn(pg, cdp, sv0, z, inf, zd, us)
                except Exception as e: R.check('[HOURS %s %s] 沒有中斷' % (z, nm), False, repr(e)[:300])
                dump()
            await hours_d(pg, cdp, sv0, z, inf, dd, sat)
        except Exception as e: R.check('[HOURS %s] 沒有中斷' % z, False, repr(e)[:300])
        dump()


# ---------------------------------------------------------------- JOBS2
def job_rec(day, wds, shifts=0):
    return {'since': day - 14, 'from': (day - 14) * 24, 'day': list(wds), 'shifts': shifts, 'skill': shifts, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0,
            'worked': [], 'chk': day - 1, 'wk': {}, 'brk': {}, 'ot': {}, 'back': False, 'away': False}


async def j2_grey(pg, cdp, sv0, jd, dd):
    tag = '[JOBS2 1 灰的那一班 shanlan]'; out = {}; RES['parts']['JOBS2']['GREY'] = out
    plan = await pg.evaluate(PLAN_JS, {'k': 'shanlan', 'term': 'Y1S1', 'd0': dd['d']}); out['plan'] = plan
    R.note('%s 計畫：%s' % (tag, J(plan)))
    if not R.check('%s 找得到撞班的對象（PLAN_JS）、告示看得到（eligible）' % tag, bool(plan.get('pick')) and plan.get('eligible') and not plan.get('err'), J(plan)): return
    pk = plan['pick']; h = 15.0
    s = base_sv(sv0, dd['d'], dd['wd'], h, 'xs_shanlan')
    meta = (s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}
    s['jobs'] = {'_meta': meta, pk['o']: job_rec(dd['d'], [pk['clash']])}
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s（%s）%.2f 時山嵐書店；G.jobs 換成只有 %s（%s %s，撞山嵐 %s 的班）' % (dd['key'], WDN[dd['wd']], h, pk['o'], WDN[pk['clash']], J(pk['ob']), WDN[pk['clash']]))
    if not R.check('%s 讀到 xs_shanlan' % tag, q['zone'] == 'xs_shanlan', J(q)): return
    want = jd.get('look') or '看告示'   # jobs3d.js deskLabel：ap3.look||'看告示'
    dk = await find_its(pg, lambda i: i['wzJob'] == 'shanlan' and not i['hidden'])
    if not R.check('%s 告示在（wzJob 互動點、看得到）' % tag, bool(dk), J(await find_its(pg, lambda i: i['wzJob']))): return
    R.check('%s 告示按鈕的字＝「%s」' % (tag, want), dk[0]['label'] == want, J(dk[0]))
    ok, route = await walk_to_it(pg, cdp, tag, dk[0], dk[0]['label']); out['route'] = route
    if not R.check('%s 走到告示旁、互動鍵是「%s」（路：出生點 → 點地 go_to）' % (tag, dk[0]['label']), ok, J(route[-3:])): await D.shot(pg, 'j2_grey_nobtn', judge_black=False); return
    m0 = await pg.evaluate(MARK_JS); await press(pg, cdp, tag)
    menus, sched = [], []; dim_tap = None; again = None; t0 = time.time(); tprog = time.time()
    while time.time() - t0 < 180:
        q = await st(pg)
        if q['phone'] and not q['dlg'] and not q['nch']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); T = [x['t'] for x in o]; menus.append([('[灰]' if x['dim'] else '') + x['t'] for x in o]); tprog = time.time()
            if jd['askOpt'] in T: await tap_opt(pg, cdp, T.index(jd['askOpt']), tag, jd['askOpt']); continue
            if '先不要' in T and any(t in WDN[1:] for t in T):
                sched.append(o)
                if dim_tap is None and WDN[pk['clash']] in T:
                    i = T.index(WDN[pk['clash']]); dim_tap = {'opt': o[i], 'say_at': (await pg.evaluate(MARK_JS))['say'], 'job': (await pg.evaluate(JOB_ST_JS, 'shanlan'))['j']}
                    R.note('%s 班表 %s：先按撞班的「%s」（%s）' % (tag, J(menus[-1]), o[i]['t'], '灰' if o[i]['dim'] else '沒有灰'))
                    await tap_opt(pg, cdp, i, tag, o[i]['t']); continue
                if dim_tap is not None and again is None:
                    again = {'same': T == [x['t'] for x in sched[0]], 'job': (await pg.evaluate(JOB_ST_JS, 'shanlan'))['j'], 'opts': menus[-1], 'say_at': (await pg.evaluate(MARK_JS))['say']}
                w = WDN[pk['work']]
                if w not in T: R.note('%s 班表沒有「%s」：%s' % (tag, w, J(menus[-1]))); break
                await tap_opt(pg, cdp, T.index(w), tag, w); continue
            k = next((x['k'] for x in o if not x['dim']), 0); R.note('%s 不認識的選單 %s → 選第一個不灰的' % (tag, J(T))); await tap_opt(pg, cdp, k, tag, T[k] if k < len(T) else '?'); continue
        if q['dlg']: tprog = time.time(); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        js = await pg.evaluate(JOB_ST_JS, 'shanlan')
        if js['j'] and js['j']['day'] and not q['busy']: out['job'] = js; break
        if not q['busy'] and time.time() - tprog > 20: R.note('%s 20 秒沒有選單、對話，也沒排班：停' % tag); break
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(1500)
    lg = await pg.evaluate(SINCE_JS, m0); allsay = await pg.evaluate("(()=>window.__SAY||[])()")
    out.update({'menus': menus, 'dim_tap': dim_tap, 'again': again, 'say': lg['say'], 'toast': lg['toast'], 'choose_log': lg['ch']})
    await D.shot(pg, 'j2_grey_end', judge_black=False)
    R.note('%s 選單 %s；對話 %s；toast %s' % (tag, J(menus), J(lg['say']), J(lg['toast'])))
    if not R.check('%s 出了班表、按了撞班的那一項（真的走到選班表）' % tag, bool(sched) and bool(dim_tap), J(menus)): return
    R.check('%s 撞班的「%s」是灰的' % (tag, WDN[pk['clash']]), dim_tap['opt']['dim'], J(dim_tap['opt']))
    between = allsay[dim_tap['say_at']:(again or {}).get('say_at', len(allsay))]
    out['between'] = between
    R.check('%s 按了灰的：旁白「%s」（說話的人空白）' % (tag, SRC_BUSY), any(x[1] == SRC_BUSY and not x[0] for x in between), J(between))
    R.check('%s 那一句以後同一份班表再出一次、還沒排班' % tag, bool(again) and again['same'] and not dim_tap.get('job') and not (again or {}).get('job'), J(again))
    jj = (out.get('job') or {}).get('j') or {}
    R.check('%s 選另一天：排的班＝%s' % (tag, WDN[pk['work']]), jj.get('day') == [pk['work']], J(jj))
    R.check('%s 跳出「班表：山嵐書店…」toast' % tag, any(t.startswith('班表：山嵐') for t in lg['toast']), J(lg['toast']))


async def j2_ticket(pg, cdp, sv0, jd, dd):
    out = RES['parts']['JOBS2']['TICKET'] = {}
    for shifts in (3, 2):
        tag = '[JOBS2 2 南洋員工票 shifts=%d%s]' % (shifts, '' if shifts >= 3 else ' 對照')
        o = out[str(shifts)] = {}
        try:
            h = 14.0
            s = base_sv(sv0, dd['d'], dd['wd'], h, 'xs_nanyang')
            meta = (s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}
            s['jobs'] = {'_meta': meta, 'cinema': job_rec(dd['d'], [5], shifts)}
            fl = s.setdefault('flags', {})
            for f in ('NY_TICKET', 'NY_TICKET_STAFF', 'companion'): fl.pop(f, None)
            q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s（%s，大一下）%.2f 時南洋戲院大廳；G.jobs 換成只有 cinema（週五晚場、shifts=%d）；拿掉 NY_TICKET／NY_TICKET_STAFF／companion' % (dd['key'], WDN[dd['wd']], h, shifts))
            if not R.check('%s 讀到 xs_nanyang' % tag, q['zone'] == 'xs_nanyang', J(q)): continue
            f0 = await pg.evaluate(NYF_JS); o['f0'] = f0; R.note('%s 前置：%s' % (tag, J(f0)))
            tk = await find_its(pg, lambda i: i['nyTicket'] and not i['hidden'])
            if not R.check('%s 大廳有「%s」（nyTicket）' % (tag, jd.get('nyLabel')), bool(tk), J(await find_its(pg, lambda i: i['nyTicket']))): continue
            ok, route = await walk_to_it(pg, cdp, tag, tk[0], tk[0]['label']); o['route'] = route
            if not R.check('%s 走到「%s」、互動鍵是它（路：出生點 → 點地 go_to）' % (tag, tk[0]['label']), ok, J(route[-3:])): await D.shot(pg, 'j2_ticket_%d_nobtn' % shifts, judge_black=False); continue
            m0 = await pg.evaluate(MARK_JS); await press(pg, cdp, tag)
            menu = None; picked = None; t0 = time.time()
            while time.time() - t0 < 60:
                q = await st(pg)
                if q['nch']:
                    op = await opts(pg); T = [x['t'] for x in op]
                    if menu is None:
                        menu = T; o['menu'] = T
                        if jd['opt'] in T: picked = jd['opt']; await tap_opt(pg, cdp, T.index(jd['opt']), tag, jd['opt']); continue
                        nn = jd.get('nyNone') or '不用了'; picked = nn if nn in T else T[-1]; await tap_opt(pg, cdp, T.index(picked), tag, picked); continue
                    R.note('%s 第二份選單 %s → 選最後一個' % (tag, J(T))); await tap_opt(pg, cdp, len(T) - 1, tag, T[-1]); continue
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                if menu is not None and not q['busy']: break
                await pg.wait_for_timeout(400)
            await pg.wait_for_timeout(1500)
            lg = await pg.evaluate(SINCE_JS, m0); f1 = await pg.evaluate(NYF_JS)
            o.update({'picked': picked, 'say': lg['say'], 'toast': lg['toast'], 'f1': f1})
            await D.shot(pg, 'j2_ticket_%d' % shifts, judge_black=False)
            R.note('%s 選單 %s；選了 %s；對話 %s；旗標 %s' % (tag, J(menu), J(picked), J(lg['say']), J(f1)))
            if not R.check('%s 按了「買票」、出了選單' % tag, menu is not None, ''): continue
            if shifts >= 3:
                R.check('%s 選單有「%s」，排在「買票」下面（第 2 項）' % (tag, jd['opt']), len(menu) > 1 and menu[1] == jd['opt'], J(menu))
                R.check('%s 選了以後 %s：「%s」' % (tag, SRC_TAKE[0], SRC_TAKE[1]), any(x[0] == SRC_TAKE[0] and x[1] == SRC_TAKE[1] for x in lg['say']), J(lg['say']))
                R.check('%s 記下今天拿了員工票（NY_TICKET_STAFF＝今天）' % tag, f1.get('NY_TICKET_STAFF') == q['day'], J(f1))
            else:
                R.check('%s 對照：shifts=2 選單沒有「%s」' % (tag, jd['opt']), jd['opt'] not in menu, J(menu))
                R.check('%s 對照：沒有售票員那一句' % tag, not any(x[1] == SRC_TAKE[1] for x in lg['say']), J(lg['say']))
        except Exception as e: R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        dump()


async def run_shift(pg, cdp, tag, k, shot, maxs=900, after=None):
    """等開班（S.tick）→ 三段照第一個選項做完；回傳 (done 狀態, 對話行, 選單)；每 30 秒記一次狀態"""
    lines, menus = [], []; t0 = time.time(); tlog = time.time(); started = False; done = None; t_fin = None
    while time.time() - t0 < maxs:
        q = await st(pg)
        if q['phone'] and not q['dlg'] and not q['nch']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); T = [x['t'] for x in o]; menus.append(T); ki = next((x['k'] for x in o if not x['dim']), 0)
            if '出發' in T: ki = T.index('出發'); R.note('%s 遊戲內部選單（出門提醒）%s → 選「出發」' % (tag, J(T)))
            await tap_opt(pg, cdp, ki, tag, T[ki] if ki < len(T) else '?'); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        js = await pg.evaluate(JOB_ST_JS, k)
        if js['running']: started = True
        if js['j'] and js['j']['shifts'] >= 1 and not js['running'] and not q['busy']:
            if after is None or after(q, js): done = js; break
            if t_fin is None: t_fin = time.time(); R.note('%s 做完一班了，等下班以後的那一步（上限 90 秒）：%s' % (tag, J({k_: q[k_] for k_ in ('zone', 'day', 'hour')})))
            if time.time() - t_fin > 90: R.note('%s 做完一班 90 秒以後還是 %s：停（下班以後那一步沒發生）' % (tag, J({k_: q[k_] for k_ in ('zone', 'day', 'hour', 'busy')}))); done = js; break
        if not started and not q['busy'] and q['interact'].startswith('開始上班'): R.note('%s 互動鍵是「開始上班」：按' % tag); await press(pg, cdp, tag); await pg.wait_for_timeout(1500); continue
        if time.time() - tlog > 30:
            tlog = time.time(); R.note('%s 等待中 %.0f 秒：%s；%s' % (tag, time.time() - t0, J({k_: q[k_] for k_ in ('zone', 'day', 'hour', 'busy', 'interact')}), J(js)))
            await D.shot(pg, '%s_wait_%d' % (shot, int(time.time() - t0)), judge_black=False)
        await pg.wait_for_timeout(500)
    return done, lines, menus


async def j2_zn(pg, cdp, sv0, jd, sun):
    out = RES['parts']['JOBS2']['ZN'] = {}
    for met in (False, True):
        tag = '[JOBS2 3 山嵐第一班 宋知寧 %s]' % ('認識' if met else '不認識')
        o = out['met' if met else 'new'] = {}
        try:
            h = 13.4
            s = base_sv(sv0, sun['d'], sun['wd'], h, 'xs_shanlan')
            meta = copy.deepcopy((s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}); meta.pop('znCo', None)
            s['jobs'] = {'_meta': meta, 'shanlan': job_rec(sun['d'], [7], 0)}
            fl = s.setdefault('flags', {})
            if met: fl['SHOP_ZN_MET'] = True; fl['SHOP_ZN_N'] = fl.get('SHOP_ZN_N') or 1
            else: fl.pop('SHOP_ZN_MET', None); fl.pop('SHOP_ZN_N', None)
            q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s（週日）%.2f 時山嵐書店；G.jobs 換成只有 shanlan（週日假日班 14:00～18:00、shifts=0、_meta.znCo 沒有）；G.flags.SHOP_ZN_MET %s' % (sun['key'], h, '＝true（在二手書架認識過）' if met else '拿掉（沒認識）'))
            if not R.check('%s 讀到 xs_shanlan' % tag, q['zone'] == 'xs_shanlan', J(q)): continue
            nm = ((await pg.evaluate(ZN_NAME_JS)) or jd['co']['who']) if met else jd['co']['who']; o['name'] = nm   # 認識過＝SHOPENC.npOf 的名字（jobs3d.js L337）；讀不到＝稿的 who
            exp = [[(nm if x[0] else None), x[1]] for x in (SRC_ZN_MET if met else SRC_ZN_NEW)]; o['exp'] = exp
            R.note('%s 期望（稿 co.%s，說話的人＝%s）：%s' % (tag, 'met' if met else 'new', nm, J(exp)))
            m0 = await pg.evaluate(MARK_JS)
            done, lines, menus = await run_shift(pg, cdp, tag, 'shanlan', 'j2_zn_%s' % ('met' if met else 'new'))
            lg = await pg.evaluate(SINCE_JS, m0); js = await pg.evaluate(JOB_ST_JS, 'shanlan')
            o.update({'done': done, 'lines': lines, 'menus': menus, 'say': lg['say'], 'toast': lg['toast'], 'job': js})
            await D.shot(pg, 'j2_zn_%s_end' % ('met' if met else 'new'), judge_black=False)
            R.note('%s 對話全文：%s' % (tag, J(lg['say'])))
            if not R.check('%s 開班、做完一班（shifts=1）' % tag, bool(done), J(js)): continue
            S2 = [[x[0] or None, x[1]] for x in lg['say']]
            idx = next((i for i in range(len(S2)) if S2[i:i + len(exp)] == exp), None)
            R.check('%s 宋知寧那幾句照稿、連在一起、說話的人對（%s）' % (tag, nm), idx is not None, J(S2))
            segs = jd.get('segs') or []
            if idx is not None and len(segs) >= 2:
                said = [x[1] for x in S2]
                i0 = next((i for i, t in enumerate(said) if t == segs[0]['ch'][0][1]), None); i1 = next((i for i, t in enumerate(said) if t == segs[1]['nov']), None)
                R.check('%s 位置：「%s」那一段選完以後、「%s」那一段開始以前' % (tag, segs[0]['name'], segs[1]['name']), i0 is not None and i1 is not None and i0 < idx < i1, J({'上架選完': i0, '宋知寧': idx, '下一段': i1}))
            R.check('%s 記下說過了（_meta.znCo＝那天）' % tag, js.get('znCo') == sun['d'], J(js))
        except Exception as e: R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        dump()


async def j2_night(pg, cdp, sv0, jd, sat):
    tag = '[JOBS2 4 大夜班下班]'; o = RES['parts']['JOBS2']['NIGHT'] = {}
    h = 21.4
    s = base_sv(sv0, sat['d'], sat['wd'], h, 'xs_dakou')
    meta = (s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}
    s['jobs'] = {'_meta': meta, 'dakou': job_rec(sat['d'], [6], 0)}
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s（週六）%.2f 時大口漢堡；G.jobs 換成只有 dakou（週六大夜班 22:00～隔天 02:00、shifts=0）' % (sat['key'], h))
    if not R.check('%s 讀到 xs_dakou' % tag, q['zone'] == 'xs_dakou', J(q)): return
    lv = await pg.evaluate(LIVE_JS); o['live'] = lv
    R.note('%s 住哪（JOBS.liveAt）：%s' % (tag, J(lv)))
    m0 = await pg.evaluate(MARK_JS)
    done, lines, menus = await run_shift(pg, cdp, tag, 'dakou', 'j2_night', after=lambda q_, js_: q_['zone'] != 'xs_dakou')
    await pg.wait_for_timeout(3000); lg2 = await drain(pg, cdp, tag + ' 睡醒以後', secs=30)
    q1 = await st(pg); lg = await pg.evaluate(SINCE_JS, m0); js = await pg.evaluate(JOB_ST_JS, 'dakou')
    o.update({'done': done, 'lines': lines, 'menus': menus, 'wake': lg2, 'say': lg['say'], 'toast': lg['toast'], 'mon': lg['mon'], 'after': q1, 'job': js})
    await D.shot(pg, 'j2_night_after', judge_black=False)
    R.note('%s 下班以後：%s；toast %s；錢 %s；醒來以後 %s' % (tag, J(q1), J(lg['toast']), J(lg['mon']), J(lg2[-6:])))
    if not R.check('%s 開班、做完一班（shifts=1）' % tag, bool(done), J(js)): return
    R.check('%s 回住的地方：宿舍（liveAt＝%s；期望 dorm）' % (tag, lv.get('liveAt')), q1['zone'] == 'dorm', J(q1))
    R.check('%s 隔天（day %d → %d）' % (tag, sat['d'], sat['d'] + 1), q1['day'] == sat['d'] + 1, J(q1))
    R.check('%s 睡到 10:00（10.00～10.50 時）' % tag, 10.0 - 0.005 <= q1['hour'] < 10.5, J(q1))
    R.check('%s 薪水 880 元（大夜班 payWd）' % tag, [x[0] for x in lg['mon']] == [880], J(lg['mon']))
    R.check('%s 醒來站得住（canStand）' % tag, bool(q1['stand']), J(q1))


async def part_jobs2(pg, cdp, sv0):
    RES['parts']['JOBS2'] = {}
    jd = await pg.evaluate(JDATA_JS); RES['parts']['JOBS2']['_data'] = jd
    R.note('[JOBS2] 頁面上的字：%s' % J({k: jd.get(k) for k in ('busyLine', 'jobsBusyLine', 'take', 'opt', 'after', 'co')}))
    R.check('[JOBS2] 這一版的字＝原始碼（busyLine、員工票 take、宋知寧 co）', jd.get('busyLine') == SRC_BUSY and jd.get('jobsBusyLine') == SRC_BUSY and jd.get('take') == SRC_TAKE
            and (jd.get('co') or {}).get('new') == SRC_ZN_NEW and (jd.get('co') or {}).get('met') == SRC_ZN_MET, J(jd))
    d0 = int(sv0.get('day', 51)) + 1
    wed = await pg.evaluate(DAY_JS, {'d0': d0, 'wds': [3]}); sun = await pg.evaluate(DAY_JS, {'d0': d0, 'wds': [7]}); sat = await pg.evaluate(DAY_JS, {'d0': d0, 'wds': [6]})
    wed2 = await pg.evaluate("(a=>{ const T=CALENDAR.termDays('Y1S2'); return T?T.from+7:null; })", {})
    wed2 = await pg.evaluate(DAY_JS, {'d0': wed2, 'wds': [3]}) if wed2 is not None else {'d': None}
    RES['parts']['JOBS2']['_days'] = {'wed': wed, 'sun': sun, 'sat': sat, 'wedY1S2': wed2}
    for nm, fn, day in (('GREY', j2_grey, wed), ('TICKET', j2_ticket, wed2), ('ZN', j2_zn, sun), ('NIGHT', j2_night, sat)):
        if nm not in J2: continue
        if not R.check('[JOBS2 %s] 找得到日子（DAY_JS）' % nm, day.get('d') is not None, J(day)): continue
        try: await fn(pg, cdp, sv0, jd, day)
        except Exception as e: R.check('[JOBS2 %s] 沒有中斷' % nm, False, repr(e)[:300])
        dump()


async def main():
    print('CC L77DE（LAWWW-C 07:43／07:47 更正）：TAG %s；SHA %s；PARTS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS)), flush=True)
    R.setup('網址加 ?tapguard（選單剛出來那一下不收點擊，和真手機一樣；CC_02 乙 4）：%s' % URL)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        sv0 = await pg.evaluate("(f=>fetch(f).then(r=>r.ok?r.json():null).catch(()=>null))", FIX)
        if not R.check('讀得到使用者存檔 %s' % FIX, bool(sv0), ''): await b.close(); sys.exit(1)
        if isinstance(sv0.get('G'), dict): sv0 = sv0['G']
        ver = await pg.evaluate("(()=>({sh831:typeof SH831!=='undefined'&&!!SH831.due, limaoClose:typeof SHOP_HOURS_AA831!=='undefined'&&!!SHOP_HOURS_AA831.limaoClose, busyLine:typeof JOBS!=='undefined'&&!!JOBS.busyLine, zn:typeof JOBS!=='undefined'&&!!JOBS.znCoLines, take:typeof JOBS!=='undefined'&&!!JOBS.staffTicketTakeLine, live:typeof JOBS!=='undefined'&&!!JOBS.liveAt}))()")
        RES['ver'] = ver
        R.check('這一版有要測的東西（SH831、AA_831 第二版 limaoClose、JOBS.busyLine／znCoLines／staffTicketTakeLine／liveAt）', all(ver.values()), J(ver))
        await pg.evaluate(HOOK_JS)
        for part, fn in (('HOURS', part_hours), ('JOBS2', part_jobs2)):
            if part not in PARTS: continue
            try: await fn(pg, cdp, sv0)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            dump()
        RES['js_errors'] = errs[:10]; RES['fails'] = R.fails; dump()
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
