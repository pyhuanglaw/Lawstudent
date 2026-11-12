"""CC-C 11-12：LAWWW-C 07:16 四件（開發分支 2c8249b216e5791fb344da8ff586c9b02c5dd6bf）——新店打工第二批、手機快速前往六間、汀州路三間「買一份帶走送人」、颱風假 14 間店門。判定歸 BB；Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
對照的程式（2c8249b216 讀過；行號是那一版的）：
  JOBS  src/jobs3d.js（S.X3 花序／越好吃／大口 L40～L58：desk 座標、need、from；S.pickDays L163～L174 灰掉撞班的那一班、選了灰的再選一次；S.busyWith L155；S.apply L179；S.apply3 L471；
        S.runShiftX L283～L316：三段 nov→選項→end 第一句→薪水 payWd／pay→toast；S.deskLabel L464＝X.look；S.tick L509 走進店裡、班的時間到了自己開班）、src/data/shop_jobs_aa829.js（look、notice、askOpt、segs、end、pay、sched）、
        src/flower_class3d.js（G.flags.FC 的 cnt／last）、src/data/wz_jobs.js（別的打工的班表＝撞班的對象）。
  QT    src/data/places.js quickList L124～L152（六間第 5 格＝自己走進去過一次才出現）、src/game3d.js placeState L714／quickGo L719、src/placemap3d.js（分地區、row、圖釘）。
        大地圖（src/guide3d.js openMap）只畫目前區域、入口、路線，沒有快速前往清單：地圖這一項改看手機「地點」上面的簡圖（PLACEMAP.html）有沒有那一顆圖釘。
  GIFT  src/gift3d.js（S.SHOPS 越好吃小館／客居雲南／東南大聯商行 L69～L70、S.buy L104、S.carry L100、SHOP_OPT）、src/gg3shops3d.js（S.mealOrder L254～L260：gift 放在「不用了」後面＝最後；S.groceryShelf L291～L297）、
        src/data/tz_meal_lines.js、src/data/tz_grocery_lines.js（品名、價錢、按鈕字「點餐」「看飲料冰箱」）。
  TYPH  src/data/places.js typhoonShops L99～L101（cfcbc17e75 加了新生南路 5、花序、禮貌生財、118 巷 7）、typhoonClosed／closedText；src/story3d.js L1479（店門 exit＋颱風＝toast closedText）；
        src/flower_notes_sys3d.js S.door（花序門口：旁白＋toast）；src/zones3d.js L2844（118 巷：沒開＝「進…」藏起來、店門口按鈕 L118.order 說 closedLine）；src/tingzhou3d.js L107～L109（禮貌生財：颱風＝「看禮貌生財」＋look 那一句）。
PARTS（env PARTS=JOBS,QT,GIFT,TYPH；預設全部）：
  JOBS  花序（flower）、越好吃（yue）、大口漢堡（dakou）各一次：①先確認條件不夠時告示藏著（花序沒上過花藝課；越好吃、大口在大一上）②【前置／捷徑】使用者存檔 day51，改日子、補條件（花序 G.flags.FC.cnt=1；
        越好吃、大口＝大一下的日子），G.jobs 換成「一份別的打工、班表只排撞班的那一天」（撞班的對象照遊戲資料挑，PLAN_JS）③讀檔進店（出生點）→ 走過去（花序先上樓梯到二樓）→ 互動鍵是 look 的字 → 按
        → 告示 → 選 askOpt → 班表：記每一個選項（字、時間、灰不灰）；撞班的那一天要灰、按了灰的要再出一次同一份選單、還沒排班 → 選另一天 → 「班表：」toast → 等開班（S.tick）→ 三段照第一個選項做完
        → 每段的 nov、選的那一句、end 第一句、薪水 toast、錢加了剛好那一班的薪水、G.jobs 的 shifts=1。
  QT    六間（bikeshop、gg_antai、gg_xianguo、gg_rongendian、flower_notes、tz_limao）：①【前置／捷徑】把 visited 那一間拿掉、讀檔在公館 → 手機「地點」那一列寫「還沒去過」、沒有「前往」
        ②【前置／捷徑】讀檔到那條街、站到店門口前 4 m → 走到店門、按（真的走進去一次）③【前置／捷徑】同一份進度（GAME.snapshot）讀回公館 → 手機「地點」cc_phone.reveal → 有「前往」、簡圖有那一顆圖釘 → 按 → 到了那一區、站得住。
  GIFT  越好吃小館（點餐）越南冰咖啡、客居雲南（點餐）冰普洱茶、東南大聯商行（看飲料冰箱）瓶裝泰式奶茶：選單有「買一份帶走送人…」且在最後 → 選那一樣（字＝「品名　價錢 元」、價錢＝店的資料）→ 錢少了剛好那個價錢（GAME.money 只叫一次）
        → G.carry 多一筆 {n, cat:'drink', day, shop:店名} →「你買了○○，帶在身上。」→ 選「不用了」離開。
  TYPH  2025-10-13（颱風假）：PLACES.typhoonShops 裡 xs_、l118_、flower_notes、tz_limao 每一間：讀檔到那條街、那間平常開著的時間 → 站到店門口前 4 m → 走到店門按 → 沒有換區域、跳出來的字＝遊戲資料那一句
        （店門 exit＝PLACES.closedText；118 巷＝LANE118_SHOPS.closedLine；禮貌生財＝門的 look）。每條街第一間另外在 7 天後同一時間（不是颱風）按一次＝要進得去（對照：證明探針按得進門）。
【前置／捷徑】讀檔一律 GAME.applySave（L.load_state，條件事件、手機自動打開關掉，STORY.TICKS 照跑）；站到店門前 4 m 用 E.placeAt；JOBS 的 G.jobs／G.flags.FC、QT 的 visited 都是改存檔，log 標【前置／捷徑】。網址加 ?tapguard（CC_02 乙 4）。
CC_02 清單 2026-11-12：1✓（打工：need／from／一週兩班的名額／撞課 classOn／excused 都先算，條件不夠時告示藏著先查再補；快速前往：先查沒去過、再走進去；颱風：挑那間平常開著的時間） 2✓（座標、按鈕字、品名、價錢、班表、店門、颱風店名單全從頁面上的遊戲資料讀；篩到 0 筆列原因） 3✓（打工日子依序掃、跳過的記原因；站的點一個一個試 4 個；撞班對象照 KEYS 順序挑第一個不是夜班的） 4✓（按互動鍵前看互動鍵的字、選項照字選、看 elementFromPoint） 5✓（go_to 40 秒一段、花序一層一層走（樓梯口→樓梯中段→平台→告示）、到了看互動鍵的字、走不到附 pathTo／canStand） 6✓（讀檔等 7 秒淡入；開班前 0.6 小時讀檔、等開班上限照雲端最慢算 600 秒、每 30 秒記一次狀態） 7✓（probe_lint、每段 JS node 檢查、.get()、前一步沒成功就跳過） 8✓（期望值＝遊戲資料（AA_829 稿的 nov／end／pay、店的價錢、closedText／closedLine），錢看前後差＋GAME.money 每一筆；颱風另做非颱風日對照＝要進得去） 9n/a（不判截圖，每段最後一張存給人看） 10✓（插進來的劇情先點完、選單照字選、遊戲內部選單（出門提醒）照按鈕字選「出發」） 11✓（SHA 40 碼、merge-base 確認 2c8249b216 含 142664dba8、cfcbc17e75；ENV 沒有「|」） 12✓（每段印「真的按了告示／選了班表／做完一班／按了前往／按了買一份帶走送人／按了店門」那一行，沒走到就 FAIL） 13✓（走路分段、途中有對話／選單就停下來處理、記走的是哪條路（點地 go_to、哪一個站點））
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [PARTS=JOBS,QT,GIFT,TYPH] [JOBS=flower,yue,dakou] [QT_ZONES=…] [TY_DAY=2025-10-13] [FIX=tests/fixtures/user_save_day51_1110.json] python3 cc_l2c82_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, copy, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); sys.path.insert(0, os.path.dirname(HERE))
import playlib as L
import cc_d141_lib as D
import cc_phone
import bbplay as P   # bbplay 在上一層（BB 的 test_tools）：phone_tab
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
URL = URL0 if 'tapguard' in URL0 else URL0 + ('&' if '?' in URL0 else '?') + 'tapguard'   # CC_02 乙 4：點對話框的探針加 ?tapguard
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
PARTS = [p.strip() for p in (os.environ.get('PARTS') or 'JOBS,QT,GIFT,TYPH').split(',') if p.strip()]
JOB_KEYS = [k for k in (os.environ.get('JOBS') or 'flower,yue,dakou').split(',') if k]
QT_ZONES = [z for z in (os.environ.get('QT_ZONES') or 'bikeshop,gg_antai,gg_xianguo,gg_rongendian,flower_notes,tz_limao').split(',') if z]
GIFT_CASES = [('tz_yuehaochi', 'meal', os.environ.get('GIFT_YUE') or '越南冰咖啡'), ('tz_keju', 'meal', os.environ.get('GIFT_KEJU') or '冰普洱茶'), ('tz_dongnan', 'shelf', os.environ.get('GIFT_DN') or '瓶裝泰式奶茶')]
TY_DAY = os.environ.get('TY_DAY') or '2025-10-13'
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51_1110.json'
ORIGIN = 'gongguan'   # QT：從公館按「前往」（六間都不在公館這一區的同一個區域裡＝不會是「你在這裡」）
R = L.Run('l2c82_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
RES = {'tag': TAG, 'sha': SHA, 'url': URL, 'parts': {}}
WDN = ['', '週一', '週二', '週三', '週四', '週五', '週六', '週日']   # src/jobs3d.js L157 const WD（閉包裡的，頁面上讀不到；照抄，2c8249b216）
STOP = lambda s: bool(s.get('dlg') or s.get('choices'))

HOOK_JS = r"""(()=>{ const W=window; W.__SAY=W.__SAY||[]; W.__MON=W.__MON||[]; W.__CH=W.__CH||[]; W.__TOAST=W.__TOAST||[]; if(W.__l2c82) return 'already'; W.__l2c82=1;
  const s0=GAME.say; if(typeof s0==='function') GAME.say=function(a,b){ try{ W.__SAY.push([((a&&a.name)||(typeof a==='string'?a:'')), String(b==null?'':b)]); }catch(e){} return s0.apply(this,arguments); };
  const m0=GAME.money; if(typeof m0==='function') GAME.money=function(d){ try{ W.__MON.push([d, +(+GAME.G.hour).toFixed(3)]); }catch(e){} return m0.apply(this,arguments); };
  const c0=GAME.choose; if(typeof c0==='function') GAME.choose=function(o){ try{ W.__CH.push((o||[]).map(x=>x?((x.dim?'[灰]':'')+x.t):'')); }catch(e){} return c0.apply(this,arguments); };
  const t=document.getElementById('toast'); if(t){ let lk=''; new MutationObserver(()=>{ const x=(t.innerText||t.textContent||'').trim(), vis=!!x&&!t.classList.contains('hide')&&getComputedStyle(t).display!=='none'; const k=vis?x:''; if(k&&k!==lk) W.__TOAST.push(x); lk=k; }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); }
  return 'hooked'; })()"""
MARK_JS = "(()=>({say:(window.__SAY||[]).length, mon:(window.__MON||[]).length, ch:(window.__CH||[]).length, toast:(window.__TOAST||[]).length}))()"
SINCE_JS = "(m=>({say:(window.__SAY||[]).slice(m.say), mon:(window.__MON||[]).slice(m.mon), ch:(window.__CH||[]).slice(m.ch), toast:(window.__TOAST||[]).slice(m.toast)}))"
ST_JS = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E.player, o=P.obj.position, it=document.getElementById('interact'), ph=document.getElementById('phone'), ch=document.getElementById('choices');
  return {zone:G.zone, day:G.day, hour:+(+G.hour).toFixed(3), money:G.money|0, x:+o.x.toFixed(2), z:+o.z.toFixed(2), lv:P.lv|0, busy:!!P.busy, dlg:!!(GAME.D&&GAME.D.active),
    dtext:(((document.getElementById('dlgName')||{}).textContent||'').trim()+'｜'+((document.getElementById('dlgText')||{}).textContent||'').trim()).slice(0,120),
    nch:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).length:0,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):'', fb:GAME.walkFallbacks||0,
    stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, phone:!!ph&&!ph.classList.contains('hide'), jr:typeof JOBS!=='undefined'&&!!JOBS.running,
    carry:(Array.isArray(G.carry)?G.carry:[]).map(c=>Object.assign({},c))}; })()"""
OPTS_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return [];
  return [...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,k)=>{ const c=b.cloneNode(true); const h=c.querySelector('.hint'); const hint=h?h.textContent.trim():''; if(h) h.remove();
    return {k, t:c.textContent.trim(), hint, dim:!!(b.disabled||b.classList.contains('dim'))}; }); })()"""
OPT_AT_JS = r"""(k=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[k]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect();
  const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {xy:[r.left+r.width/2,r.top+r.height/2], top:!!e&&(e===b||b.contains(e)), who:e?(e.id||String(e.className||'')||e.tagName):null}; })"""
TOP_JS = r"""(s=>{ const b=document.querySelector(s); if(!b) return null; const r=b.getBoundingClientRect(); if(!r.width) return null; const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {top:!!e&&(e===b||b.contains(e)), who:e?(e.id||String(e.className||'')||e.tagName):null}; })"""
ITS_JS = r"""(()=>(GAME.E.interactables||[]).map((i,n)=>{ let lab=''; try{ lab=String(typeof i.label==='function'?i.label():(i.label||'')); }catch(e){} let hid=false; try{ hid=!!i.hidden; }catch(e){}
  return {n, label:lab, x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), lv:i.lv|0, r:i.radius||1.0, hidden:hid, to:i.exit?i.exit.to:null, wzJob:i.wzJob||null, kind:i.kind||null, tzPoint:!!i.tzPoint,
    shop118:i.shop118||null, fnDoor:!!i.fnDoor, lmDoor:!!i.tzLimaoDoor, look:i.look||null}; }))()"""
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
# 打工：條件、能選的日子、撞班的對象（照 KEYS 順序第一個同一天時間重疊、不是過午夜的班）、那一天（依序掃、跳過的記原因）。只算，算完放回去
PLAN_JS = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,weekday:G.weekday,jobs:G.jobs,fc:(G.flags||{}).FC}; const out={k:a.k};
  try{ JOBS.hrsWd('brunch',6); const W=WZ_JOBS_DATA.shops, s=W[a.k]; if(!s){ out.err='WZ_JOBS_DATA.shops 沒有 '+a.k; return out; }
    const TD=CALENDAR.termDays(a.term); out.term=TD; const d0=Math.max(a.d0,TD.from+7); out.d0=d0;
    G.day=d0; G.jobs={_meta:(keep.jobs&&keep.jobs._meta)||{n:{},asked:{}}}; if(a.fc) G.flags.FC={cnt:1,n:{},gave:{},after:{}};
    out.eligible=JOBS.eligible(G,a.k); out.days=s.days.slice(); out.hours={}; for(const wd of s.days) out.hours[wd]=JOBS.hrsWd(a.k,wd);
    const ok=s.days.filter(wd=>s.classOk||!JOBS.classOn(G,a.k,wd)); out.ok=ok;
    const cand=wd=>{ const h=JOBS.hrsWd(a.k,wd); for(const o of JOBS.KEYS){ if(o===a.k||!W[o]||!Array.isArray(W[o].days)||!W[o].days.includes(wd)) continue; const b=JOBS.hrsWd(o,wd); if(b[1]>24) continue; if(JOBS.overlap(h[0],h[1],b[0],b[1])) return {o,b}; } return null; };
    const firstDay=wd=>{ const why={wd:0,term:0,exam:0,hol:0,ty:0,exc:[]}; for(let x=d0;x<=TD.to;x++){ const c=CALENDAR.dateOf(x); if(c.wd!==wd){ why.wd++; continue; } const t=CALENDAR.termOf(x); if(!t||t.id!==a.term){ why.term++; continue; } if(t.exam){ why.exam++; continue; }
        if(CALENDAR.holiday(x)){ why.hol++; continue; } if(CALENDAR.typhoon&&CALENDAR.typhoon(x)){ why.ty++; continue; } G.day=x; const e=JOBS.excused(G,a.k,x); if(e){ why.exc.push([c.key,e]); continue; } return {d:x,key:c.key,why}; } return {d:null,why}; };
    const C=ok.map(wd=>{ const f=firstDay(wd), h=JOBS.hrsWd(a.k,wd); return {wd, c:cand(wd), day:f.d, key:f.key||null, why:f.why, night:h[1]>24, open:f.d!=null&&PLACES.isOpen(s.zone,h[0]-0.6,f.d)}; }); out.cands=C;
    const order=C.filter(x=>x.day!=null).sort((p,q)=>((p.open?0:2)+(p.night?1:0))-((q.open?0:2)+(q.night?1:0)));
    let pick=null; for(const w of order){ const cl=C.find(x=>x.wd!==w.wd&&x.c); if(cl){ pick={work:w.wd,day:w.day,key:w.key,clash:cl.wd,o:cl.c.o,ob:cl.c.b,t0:JOBS.hrsWd(a.k,w.wd)[0]}; break; } }
    if(!pick&&order.length){ const w=order[0]; pick={work:w.wd,day:w.day,key:w.key,clash:null,o:null,t0:JOBS.hrsWd(a.k,w.wd)[0]}; }
    out.pick=pick; out.used=JOBS.used(G); out.cap=JOBS.cap(G,a.k); }
  catch(e){ out.err=String(e&&e.stack||e).slice(0,400); }
  finally{ G.day=keep.day; G.hour=keep.hour; G.weekday=keep.weekday; G.jobs=keep.jobs; if(keep.fc===undefined) delete G.flags.FC; else G.flags.FC=keep.fc; }
  return out; })"""
JOB_DATA_JS = r"""(a=>{ const k=a.k; JOBS.hrsWd(k,a.wd); const A=(typeof SHOP_JOBS_AA829!=='undefined'&&SHOP_JOBS_AA829.jobs&&SHOP_JOBS_AA829.jobs[k])||null, s=WZ_JOBS_DATA.shops[k];
  if(!A||!s) return {err:'沒有 SHOP_JOBS_AA829.jobs.'+k+' 或 WZ_JOBS_DATA.shops.'+k};
  const sc=(A.sched||[]).find(q=>q.wd===a.wd)||{}, end=A.end?(A.end.all||A.end[String(a.wd)]||null):null, pay=sc.pay!=null?sc.pay:A.pay;
  return {look:A.look, notice:A.notice, askOpt:A.askOpt, laterOpt:A.laterOpt, boss:A.boss, ask:A.ask, segs:(A.segs||[]).map(g=>({name:g.name,nov:g.nov,ch:g.ch})), end0:end&&end.length?end[0]:null,
    pay, toast:s.short+' 薪水 '+pay+' 元', short:s.short, zone:s.zone, desk:s.desk, sched:A.sched}; })"""
JOB_ST_JS = r"""(k=>{ const G=GAME.G, j=JOBS.job(G,k); let sn=null; try{ sn=JOBS.shiftNow(G,k); }catch(e){} return {j:j?{day:(j.day||[]).slice(),shifts:j.shifts|0,worked:(j.worked||[]).slice(-3),since:j.since,gone:j.gone||null}:null, shiftNow:sn, running:!!JOBS.running, hour:+(+G.hour).toFixed(3)}; })"""
QT_INFO_JS = r"""(a=>{ const z=a.z, Lq=PLACES.quickList(), pl=Lq.find(p=>p&&p[4]===z)||Lq.find(p=>p&&p[0]===z)||null; const out={z, pl:pl?[pl[0],pl[1],pl[2]||null,pl[3]||null,pl[4]||null]:null};
  if(!pl) return out; out.name=pl[1]; out.area=typeof PLACEMAP!=='undefined'?PLACEMAP.areaOf(pl):null; const pin=typeof PLACEMAP!=='undefined'?PLACEMAP.pinOf(pl):null; out.pin=pin?pin.id:null;
  out.street=(typeof PLACEMAP!=='undefined'&&PLACEMAP.ZONE_PIN&&PLACEMAP.ZONE_PIN[z])||PLACES.base(z); const LM=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT.limao:null;
  let ws=PLACES.windowsOf?PLACES.windowsOf(z,a.day):undefined; if(ws===undefined&&LM&&LM.zone===z) ws=[[LM.from,LM.to]]; out.windows=ws===undefined?'沒有營業時間（整天）':ws;
  const w=Array.isArray(ws)&&ws.length?ws[0]:null; out.h=w?Math.min(w[0]+1.0,(w[0]+w[1])/2):14; out.visitedNow=!!(GAME.G.visited&&GAME.G.visited[z]); return out; })"""
ROWS_JS = r"""(nm=>[...document.querySelectorAll('#phoneBody .phrow')].map(r=>{ const d=r.querySelector('div'); const t=d&&d.childNodes[0]?String(d.childNodes[0].textContent||'').trim():''; if(t!==nm) return null;
  const m=r.querySelector('.muted'), b=r.querySelector('button[data-place]'); return {muted:m?m.textContent.trim():'', btn:b?(b.textContent||'').trim():null, place:b?b.dataset.place:null, inPinBox:!r.classList.contains('item')}; }).filter(Boolean))"""
AREA_JS = "(id=>{ const b=document.querySelector('#phoneBody [data-parea=\"'+id+'\"]'); return b?{on:b.getAttribute('aria-expanded')==='true', t:(b.textContent||'').trim()}:null; })"
PIN_JS = "(id=>!!document.querySelector('#phoneBody [data-pmap=\"'+id+'\"]'))"
GIFT_INFO_JS = r"""(a=>{ const T=GG3_LINES[a.zone]; if(!T) return {err:'GG3_LINES 沒有 '+a.zone}; let kind=null, price=null, label=null;
  if(a.how==='meal'){ kind=T.meal&&T.meal.point; const m=(T.meal&&T.meal.menu||[]).find(x=>x.n===a.item); price=m?m.p:null; }
  else { const g=(T.grocery&&T.grocery.goods||[]).find(x=>x.n===a.item); kind=g?g.at:null; price=g?g.p:null; }
  label=T.labels&&kind?T.labels[kind]:null; const gm=typeof GIFT!=='undefined'&&GIFT.menu?GIFT.menu(GAME.G,T.name,a.how==='shelf'?T.grocery.goods.filter(g=>g.at===kind&&!g.noBuy):undefined):[];
  return {name:T.name, kind, label, price, giftOpt:typeof GIFT!=='undefined'?GIFT.SHOP_OPT:null, no:typeof GG3!=='undefined'&&GG3.SYS?GG3.SYS.no:null, giftMenu:gm.map(x=>[x.n,x.p]), carry0:(GAME.G.carry||[]).length}; })"""
TY_INFO_JS = r"""(a=>{ const z=a.z, G=GAME.G, b=PLACES.base(z), street=b!==z?b:((typeof PLACEMAP!=='undefined'&&PLACEMAP.ZONE_PIN&&PLACEMAP.ZONE_PIN[z])||null);
  const LM=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT.limao:null, dc=a.day+7, wd=CALENDAR.dateOf(dc).wd;
  const open=h=>{ if(/^l118_/.test(z)) return typeof L118!=='undefined'&&L118.isOpen(z.slice(5),Object.assign({},G,{day:dc,hour:h,weekday:wd%7})); if(LM&&LM.zone===z) return h>=LM.from&&h<LM.to; return PLACES.isOpen(z,h,dc); };
  let h=null; for(const x of [14,12.5,18.5,15,11.5,19.5,20,10.5,21,16,17,13]){ if(open(x)&&open(x+0.5)){ h=x; break; } }
  let exp=null, how=null; if(/^l118_/.test(z)){ how='l118'; exp=typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS.closedLine:null; } else if(LM&&LM.zone===z){ how='limao'; exp=LM.name+'。門關著，裡面沒有開燈。'; } else { how='exit'; exp=PLACES.closedText(z,h==null?14:h,a.day); }
  return {z, street, name:PLACES.names[z]||z, h, ctlDay:dc, ctlKey:CALENDAR.dateOf(dc).key, ctlTyphoon:!!(CALENDAR.typhoon&&CALENDAR.typhoon(dc)), ctlHol:!!CALENDAR.holiday(dc), how, exp, typhoonClosed:PLACES.typhoonClosed(z,a.day)}; })"""
TY_LIST_JS = "(()=>PLACES.typhoonShops.filter(z=>/^xs_/.test(z)||/^l118_/.test(z)||z==='flower_notes'||z==='tz_limao'))()"
LM_LOOK_JS = "(()=>{ const z=GAME.E.zone, d=z&&z.tzLimao&&z.tzLimao.door; return d?{label:d.label, look:d.look||null, exit:d.exit?d.exit.to:null}:null; })()"


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


def base_sv(sv0, day, wd, hour, zone, pos=None):
    s = copy.deepcopy(sv0); s = s.get('G', s) if isinstance(s.get('G'), dict) else s
    s.pop('_stuck', None); s.pop('_busy', None)
    s.update(day=day, weekday=wd % 7, hour=hour, zone=zone, weather='clear')
    if pos: s['pos'] = pos
    else: s.pop('pos', None)
    s['invites'] = [v for v in s.get('invites', []) if v.get('state') != 'going']
    return s


async def load(pg, cdp, s, tag, why):
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(7000)   # 讀檔淡入（CC_02 乙 6）
    await L.close_panels(pg, cdp); await pg.evaluate(HOOK_JS)
    lg = await drain(pg, cdp, tag + ' 讀檔後', secs=30)
    R.setup('%s 【前置／捷徑】%s' % (tag, why))
    if lg: R.note('%s 讀檔以後先有的劇情（照字點完，不算）：%s' % (tag, J(lg[-8:])))
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


# ---------------------------------------------------------------- JOBS
async def climb_flower(pg, cdp, tag):
    """花序：告示在二樓（jobs3d.js desk lv 1）。像玩家一樣一層一層走：樓梯口（一樓）→ 樓梯中段 → 二樓平台（FLOWER_NOTES_LAYOUT.stair／landing）"""
    lay = await pg.evaluate("(()=>typeof FLOWER_NOTES_LAYOUT!=='undefined'?{stair:FLOWER_NOTES_LAYOUT.stair, landing:FLOWER_NOTES_LAYOUT.landing}:null)()")
    if not R.check('%s 讀得到花序的樓梯配置（FLOWER_NOTES_LAYOUT.stair／landing）' % tag, bool(lay and lay.get('stair') and lay.get('landing')), J(lay)): return False
    s_, l_ = lay['stair'], lay['landing']; cx = (s_['x0'] + s_['x1']) / 2
    steps = [('樓梯口（一樓）', cx, s_['zBottom'] + 0.8, 0), ('樓梯中段', cx, (s_['zBottom'] + s_['zTop']) / 2, None), ('二樓平台', (l_['x0'] + l_['x1']) / 2, (l_['z0'] + l_['z1']) / 2, 1)]
    for nm, x, z, lv in steps:
        ok = False
        for seg in range(3):
            q = await st(pg)
            if q['dlg'] or q['nch']: await drain(pg, cdp, tag + ' 樓梯途中', secs=30); continue
            ok = await L.go_to(pg, cdp, R, x, z, 0.6, '%s %s（第 %d 段）' % (tag, nm, seg + 1), max_s=40, lv=lv, stop=STOP)
            q = await D.settle(pg)
            if ok and math.hypot(q['x'] - x, q['z'] - z) <= 0.9 and (lv is None or q['lv'] == lv): break
        q = await st(pg)
        if not R.check('%s 走到%s (%.2f, %.2f)%s' % (tag, nm, x, z, '' if lv is None else ' 第 %d 層' % lv), bool(ok) and (lv is None or q['lv'] == lv), J({'me': [q['x'], q['z'], q['lv']], 'diag': await pg.evaluate(DIAG_JS, {'x': x, 'z': z, 'lv': lv or 0})})):
            await D.shot(pg, 'jobs_flower_stair_fail', judge_black=False); return False
    return True


async def job_one(pg, cdp, sv0, k):
    tag = '[JOBS %s]' % k; out = {'k': k}; RES['parts'].setdefault('JOBS', {})[k] = out
    term = 'Y1S1' if k == 'flower' else 'Y1S2'
    plan = await pg.evaluate(PLAN_JS, {'k': k, 'term': term, 'd0': int(sv0.get('day', 51)) + 1, 'fc': k == 'flower'}); out['plan'] = plan
    R.note('%s 計畫：%s' % (tag, J(plan)))
    if not R.check('%s 算得出日子和班表（PLAN_JS）' % tag, bool(plan.get('pick')) and plan['pick'].get('day') is not None and not plan.get('err'), J(plan)): return
    pk = plan['pick']; jd = await pg.evaluate(JOB_DATA_JS, {'k': k, 'wd': pk['work']}); out['data'] = jd
    if not R.check('%s 讀得到 AA_829 的字（SHOP_JOBS_AA829.jobs.%s）' % (tag, k), not jd.get('err'), J(jd)): return
    zone, desk = jd['zone'], jd['desk']
    if not pk.get('clash'): R.note('%s 找不到和別的打工撞班的那一天（%s）：灰掉那一項不驗' % (tag, J(plan.get('cands'))))
    # ① 條件不夠：告示藏著（花序：沒上過花藝課；越好吃、大口：大一上＝存檔那一天）
    pre_day = pk['day'] if k == 'flower' else int(sv0.get('day', 51))
    pre_wd = (await pg.evaluate("(d=>CALENDAR.dateOf(d).wd)", pre_day))
    s = base_sv(sv0, pre_day, pre_wd, max(14.0, pk['t0'] - 0.6) if k != 'dakou' else 15.0, zone)
    s.setdefault('flags', {}).pop('FC', None)
    q = await load(pg, cdp, s, tag + ' ①', '讀使用者存檔 %s、改到 day %s（%s）%s 店裡；%s' % (FIX, pre_day, '同一天' if k == 'flower' else '存檔那一天＝大一上', zone, '拿掉 G.flags.FC（沒上過花藝課）' if k == 'flower' else '不補條件'))
    if R.check('%s ① 讀到 %s' % (tag, zone), q['zone'] == zone, J(q)):
        dk = await find_its(pg, lambda i: i['wzJob'] == k)
        R.check('%s ① 條件不夠（%s）時告示藏著（wzJob 互動點 hidden）' % (tag, '沒上過花藝課' if k == 'flower' else '大一上'), bool(dk) and all(i['hidden'] for i in dk), J(dk))
    # ② 前置：條件補上、G.jobs 換成一份撞班的打工
    t0 = pk['t0']; h = t0 - 0.6; d = pk['day']
    s = base_sv(sv0, d, pk['work'], h, zone)
    meta = (s.get('jobs') or {}).get('_meta') or {'n': {}, 'asked': {}}
    s['jobs'] = {'_meta': meta}
    if pk.get('o'):
        s['jobs'][pk['o']] = {'since': d, 'from': d * 24 + h, 'day': [pk['clash']], 'shifts': 0, 'skill': 0, 'missedRun': 0, 'quit': None, 'gone': None, 'missPend': False, 'missN': 0, 'worked': [], 'chk': d - 1, 'wk': {}, 'brk': {}, 'ot': {}, 'back': False, 'away': False}
    if k == 'flower': s.setdefault('flags', {})['FC'] = {'cnt': 1, 'n': {}, 'gave': {}, 'after': {}}
    why = '讀使用者存檔、改到 %s（%s）%.2f 時 %s 出生點；G.jobs 換成只有 %s（%s %s，撞 %s 的班；原本的一盞拿掉＝名額剩一班）%s' % (
        pk['key'], WDN[pk['work']], h, zone, pk.get('o') or '（沒有）', WDN[pk['clash']] if pk.get('clash') else '-', J(pk.get('ob')), WDN[pk['clash']] if pk.get('clash') else '-',
        '；G.flags.FC={cnt:1}（上過一次花藝課）' if k == 'flower' else '')
    q = await load(pg, cdp, s, tag + ' ②', why); out['start'] = q
    if not R.check('%s ② 讀到 %s' % (tag, zone), q['zone'] == zone, J(q)): return
    dk = await find_its(pg, lambda i: i['wzJob'] == k and not i['hidden'])
    if not R.check('%s ② 告示在（wzJob 互動點、看得到）、位置＝jobs3d.js desk (%s, %s) 第 %s 層' % (tag, desk.get('x'), desk.get('z'), desk.get('lv', 0)), bool(dk), J(await find_its(pg, lambda i: i['wzJob'] == k))): return
    it = dk[0]
    R.check('%s ② 告示按鈕的字＝稿的 look「%s」' % (tag, jd['look']), it['label'] == jd['look'], J(it))
    R.check('%s ② 告示在 desk 的位置（%.2f, %.2f, lv %d）' % (tag, it['x'], it['z'], it['lv']), abs(it['x'] - desk['x']) < 0.05 and abs(it['z'] - desk['z']) < 0.05 and it['lv'] == (desk.get('lv') or 0), J(desk))
    if it['lv'] == 1 and k == 'flower':
        if not await climb_flower(pg, cdp, tag): return
    ok, route = await walk_to_it(pg, cdp, tag, it, jd['look']); out['route'] = route
    if not R.check('%s 走到告示旁、互動鍵是「%s」' % (tag, jd['look']), ok, J(route[-3:])):
        await D.shot(pg, 'jobs_%s_nobtn' % k, judge_black=False); return
    await D.shot(pg, 'jobs_%s_notice' % k, judge_black=False)
    m0 = await pg.evaluate(MARK_JS); money0 = (await st(pg))['money']
    await press(pg, cdp, tag)
    # 告示 → askOpt → 班表 → 等開班 → 三段 → 薪水
    lines, menus = [], []; sched = []; dim_tap = None; again = None; applied = False; started = False; done = None
    tst = time.time(); tlog = time.time(); tprog = time.time(); MAXS = 900
    while time.time() - tst < MAXS:
        q = await st(pg)
        if q['phone'] and not q['dlg'] and not q['nch']: await L.close_panels(pg, cdp); continue
        if q['nch']:
            o = await opts(pg); T = [x['t'] for x in o]; menus.append([('[灰]' if x['dim'] else '') + x['t'] + ('（' + x['hint'] + '）' if x['hint'] else '') for x in o]); tprog = time.time()
            if jd['askOpt'] in T:
                await tap_opt(pg, cdp, T.index(jd['askOpt']), tag, jd['askOpt']); continue
            if '先不要' in T and any(t in WDN[1:] for t in T):
                sched.append(o)
                if pk.get('clash') and dim_tap is None and WDN[pk['clash']] in T:
                    i = T.index(WDN[pk['clash']]); dim_tap = {'opt': o[i], 'job_before': (await pg.evaluate(JOB_ST_JS, k))['j']}
                    R.note('%s 班表選單：%s；先按撞班的「%s」（%s）' % (tag, J(menus[-1]), o[i]['t'], '灰' if o[i]['dim'] else '沒有灰'))
                    await tap_opt(pg, cdp, i, tag, o[i]['t']); continue
                if dim_tap is not None and again is None:
                    again = {'same': T == [x['t'] for x in sched[0]], 'job': (await pg.evaluate(JOB_ST_JS, k))['j'], 'opts': menus[-1]}
                w = WDN[pk['work']]
                if w not in T: R.note('%s 班表選單沒有「%s」：%s' % (tag, w, J(menus[-1]))); break
                await tap_opt(pg, cdp, T.index(w), tag, w); continue
            ki = next((x['k'] for x in o if not x['dim']), 0)
            if '出發' in T: ki = T.index('出發'); R.note('%s 遊戲內部選單（出門提醒）：%s → 選「出發」' % (tag, J(T)))
            await tap_opt(pg, cdp, ki, tag, T[ki] if ki < len(T) else '?'); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            tprog = time.time(); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        js = await pg.evaluate(JOB_ST_JS, k)
        if js['j'] and js['j']['day'] and not applied: applied = True; tprog = time.time(); R.note('%s 排好班了：%s（%.2f 時）' % (tag, J(js['j']), js['hour']))
        if js['running']: started = True
        if js['j'] and js['j']['shifts'] >= 1 and not js['running'] and not q['busy']:
            done = js; break
        if applied and not js['running'] and not q['busy']:
            if q['interact'].startswith('開始上班'): R.note('%s 互動鍵是「開始上班」：按' % tag); await press(pg, cdp, tag); await pg.wait_for_timeout(1500); continue
        if not applied and not q['busy'] and time.time() - tprog > 20: R.note('%s 按了告示 20 秒沒有選單、對話，也沒排班：停' % tag); break
        if time.time() - tlog > 30:
            tlog = time.time(); R.note('%s 等待中 %.0f 秒：%s；%s' % (tag, time.time() - tst, J({k_: q[k_] for k_ in ('zone', 'hour', 'busy', 'interact')}), J(js)))
            await D.shot(pg, 'jobs_%s_wait_%d' % (k, int(time.time() - tst)), judge_black=False)
        await pg.wait_for_timeout(500)
    if done: lines += await drain(pg, cdp, tag + ' 下班以後', secs=25)
    lg = await pg.evaluate(SINCE_JS, m0); q = await st(pg); money1 = q['money']
    said = [x[1] for x in lg['say']] + [x.split('｜', 1)[-1] for x in lines]
    out.update({'lines': lines, 'say': lg['say'], 'menus': menus, 'choose_log': lg['ch'], 'toast': lg['toast'], 'mon': lg['mon'], 'money': [money0, money1], 'dim_tap': dim_tap, 'again': again, 'done': done})
    await D.shot(pg, 'jobs_%s_end' % k, judge_black=False)
    R.note('%s 對話全文：%s' % (tag, J(lg['say'])))
    R.note('%s 選單：%s；toast：%s；錢 %s' % (tag, J(menus), J(lg['toast']), J(lg['mon'])))
    R.check('%s 按告示：旁白是告示的字「%s」' % (tag, jd['notice']), any(jd['notice'] in t for t in said), J(said[:4]))
    R.check('%s 告示以後的選單＝「%s」「%s」' % (tag, jd['askOpt'], jd['laterOpt']), any(jd['askOpt'] in ' '.join(m) and jd['laterOpt'] in ' '.join(m) for m in menus), J(menus[:2]))
    R.check('%s 選了「%s」以後，%s開口「%s」' % (tag, jd['askOpt'], jd['boss'], jd['ask']), any(jd['ask'] in t for t in said), '')
    if not R.check('%s 出了班表選單（真的走到選班表）' % tag, bool(sched), J(menus)): return
    R.note('%s 班表選項（字、時間、灰不灰）：%s' % (tag, J([[x['t'], x['hint'], x['dim']] for x in sched[0]])))
    w0 = next((x for x in sched[0] if x['t'] == WDN[pk['work']]), None)
    R.check('%s 班表裡要選的「%s」沒有灰（%s）' % (tag, WDN[pk['work']], J(w0)), bool(w0) and not w0['dim'], '')
    if pk.get('clash'):
        R.check('%s 和已經排的 %s（%s %s）重疊的「%s」灰掉（S.busyWith，AA_829 第 4 節）' % (tag, pk['o'], WDN[pk['clash']], J(pk.get('ob')), WDN[pk['clash']]), bool(dim_tap) and dim_tap['opt']['dim'], J(dim_tap))
        R.check('%s 按了灰的那一項：同一份班表再出一次、還沒排班（選了灰的＝再選一次）' % tag, bool(again) and again['same'] and not (dim_tap or {}).get('job_before') and not (again or {}).get('job'), J(again))
    jj = (done or await pg.evaluate(JOB_ST_JS, k)).get('j') or {}
    R.check('%s 排的班＝%s（G.jobs.%s.day）' % (tag, WDN[pk['work']], k), jj.get('day') == [pk['work']], J(jj))
    R.check('%s 跳出「班表：%s…」toast' % (tag, jd['short']), any(t.startswith('班表：' + jd['short']) for t in lg['toast']), J(lg['toast']))
    if not R.check('%s 開班、做完一班（G.jobs.%s.shifts=1、worked 有今天）' % (tag, k), bool(done) and jj.get('shifts') == 1 and pk['day'] in (jj.get('worked') or []), J({'done': done, 'started': started})): return
    for i, g in enumerate(jd['segs']):
        R.check('%s 第 %d 段「%s」的旁白（nov）' % (tag, i + 1, g['name']), any(g['nov'] in t for t in said), g['nov'][:30])
        R.check('%s 第 %d 段選第一個「%s」→「%s」' % (tag, i + 1, g['ch'][0][0], g['ch'][0][1][:20]), any(g['ch'][0][1] in t for t in said), '')
    if jd.get('end0'): R.check('%s 最後一句旁白＝end 第一句「%s」' % (tag, jd['end0'][:24]), any(jd['end0'] in t for t in said), '')
    R.check('%s 薪水 toast「%s」' % (tag, jd['toast']), jd['toast'] in lg['toast'], J(lg['toast']))
    R.check('%s 錢加了剛好 %d 元（%d → %d；GAME.money %s）' % (tag, jd['pay'], money0, money1, J(lg['mon'])), money1 - money0 == jd['pay'] and [x[0] for x in lg['mon']] == [jd['pay']], '')


async def part_jobs(pg, cdp, sv0):
    for k in JOB_KEYS:
        try: await job_one(pg, cdp, sv0, k)
        except Exception as e: R.check('[JOBS %s] 沒有中斷' % k, False, repr(e)[:300])
        dump()


# ---------------------------------------------------------------- QT
async def phone_row(pg, cdp, info):
    await P.phone_tab(pg, cdp, 'places')
    ar = await pg.evaluate(AREA_JS, info.get('area') or '')
    if ar and not ar['on']: await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % info['area']); await pg.wait_for_timeout(700)
    rows = await pg.evaluate(ROWS_JS, info['name'])
    pin = await pg.evaluate(PIN_JS, info['pin']) if info.get('pin') else False
    return {'area': ar, 'rows': rows, 'pin': pin}


async def qt_one(pg, cdp, sv0, z, dd):
    tag = '[QT %s]' % z; out = {'z': z}; RES['parts'].setdefault('QT', {})[z] = out
    info = await pg.evaluate(QT_INFO_JS, {'z': z, 'day': dd['d']}); out['info'] = info
    if not R.check('%s 快速前往清單有這一間（PLACES.quickList 第 5 格＝%s）' % (tag, z), bool(info.get('pl')), J(info)): return
    h = info['h']
    # ① 沒去過
    s = base_sv(sv0, dd['d'], dd['wd'], h, ORIGIN); s.setdefault('visited', {}).pop(z, None)
    await load(pg, cdp, s, tag + ' ①', '讀使用者存檔（存檔裡 visited.%s＝%s），拿掉 visited.%s，改到 %s %.2f 時 %s' % (z, J((sv0.get('visited') or {}).get(z)), z, dd['key'], h, ORIGIN))
    r0 = await phone_row(pg, cdp, info); out['before'] = r0
    await D.shot(pg, 'qt_%s_before' % z, judge_black=False); await L.close_panels(pg, cdp)
    R.note('%s ① 沒去過：手機「地點」%s 那一區 %s、那一列 %s' % (tag, info.get('area'), J(r0['area']), J(r0['rows'])))
    R.check('%s ① 沒去過：清單裡有「%s」、寫「還沒去過」、沒有「前往」（places.js 第 5 格）' % (tag, info['name']), bool(r0['rows']) and all(x['btn'] is None and x['muted'].startswith('還沒去過') for x in r0['rows']), J(r0['rows']))
    # ② 走進去一次（真的店門）
    st_ = info['street']
    s = base_sv(sv0, dd['d'], dd['wd'], h, st_); s.setdefault('visited', {}).pop(z, None)
    q = await load(pg, cdp, s, tag + ' ②', '同上（沒去過），讀檔到 %s 出生點 %.2f 時' % (st_, h))
    doors = await find_its(pg, lambda i: i['to'] == z and not i['hidden'])
    out['doors'] = doors; entered = False
    if doors:
        dr = doors[0]; ap = await pg.evaluate(APPROACH_JS, {'x': dr['x'], 'z': dr['z'], 'lv': dr['lv'], 'back': 4.0})
        await pg.evaluate(PLACE_JS, {'x': ap['x'], 'z': ap['z'], 'lv': dr['lv']}); await pg.wait_for_timeout(1500)
        R.setup('%s 【前置／捷徑】E.placeAt 站到「%s」(%s, %s) 前 4 m 的 (%s, %s)（%s）' % (tag, dr['label'], dr['x'], dr['z'], ap['x'], ap['z'], ap['how']))
        q = await D.use_exit(pg, cdp, tag + ' ②', dr['label'], z, pred=lambda e: e['to'] == z)
        entered = bool(q and q['zone'] == z)
    else:
        R.note('%s ② %s 沒有往 %s 的店門（exit.to）：%s；改用讀檔進去' % (tag, st_, z, J([[i['label'], i['to']] for i in await find_its(pg, lambda i: i['to'])][:20])))
    if not entered:
        s = base_sv(sv0, dd['d'], dd['wd'], h, z); s.setdefault('visited', {}).pop(z, None)
        q = await load(pg, cdp, s, tag + ' ②b', '店門走不進去：讀檔直接進 %s（遊戲的 enter 會記 visited）' % z)
    vis = await pg.evaluate("(z=>!!(GAME.G.visited&&GAME.G.visited[z]))", z)
    out['entered_by_door'] = entered
    if not R.check('%s ② 走進過 %s 一次（visited.%s＝true；%s）' % (tag, z, z, '店門' if entered else '讀檔'), q['zone'] == z and vis, J(q)): return
    await D.shot(pg, 'qt_%s_inside' % z, judge_black=False)
    # ③ 回公館、按「前往」
    snap = await pg.evaluate("()=>GAME.snapshot()")
    s = base_sv(snap, dd['d'], dd['wd'], h, ORIGIN)
    await load(pg, cdp, s, tag + ' ③', '同一份進度（GAME.snapshot，visited.%s 留著）讀回 %s 出生點 %.2f 時' % (z, ORIGIN, h))
    r1 = await phone_row(pg, cdp, info); out['after'] = r1
    rv = await cc_phone.reveal(pg, cdp, z)
    sel = '#phoneBody [data-place^="%s|"]' % z
    btn = await pg.evaluate("(s=>{ const b=document.querySelector(s); return b?{t:(b.textContent||'').trim(), place:b.dataset.place}:null; })", sel)
    await D.shot(pg, 'qt_%s_phone' % z, judge_black=False)
    R.note('%s ③ 去過以後：%s；reveal %s；按鈕 %s' % (tag, J(r1), rv, J(btn)))
    R.check('%s ③ 去過以後清單有「前往」（cc_phone.reveal）' % tag, bool(rv) and bool(btn) and btn['t'] == '前往', J(btn))
    R.check('%s ③ 手機「地點」的簡圖有那一顆圖釘（%s；大地圖沒有快速前往清單，看這張）' % (tag, info.get('pin')), bool(r1['pin']), J(info.get('pin')))
    if not btn: await L.close_panels(pg, cdp); return
    m0 = await pg.evaluate(MARK_JS); fb0 = (await st(pg))['fb']
    await L.tap(pg, cdp, sel)
    for k_ in range(3):
        q = await D.wait_zone(pg, cdp, z, 40)
        if q['zone'] == z: break
        lg = await drain(pg, cdp, tag + ' 路上', secs=40, picks=('直接過去', '前往', '出發'))
        lgs = await pg.evaluate(SINCE_JS, m0); R.note('%s 按了前往還沒到（第 %d 次）：%s；toast %s；劇情 %s' % (tag, k_ + 1, J(q), J(lgs['toast']), J(lg)))
        if (await st(pg))['zone'] == z: break
        if any('路上' in t for t in lgs['toast']):   # CLS.routeStopTo：路上停下來演（R2）＝演完再按一次
            await P.phone_tab(pg, cdp, 'places'); await cc_phone.reveal(pg, cdp, z); await L.tap(pg, cdp, sel)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); q = await st(pg); lgs = await pg.evaluate(SINCE_JS, m0)
    out['arrive'] = q; out['toast'] = lgs['toast']
    await D.shot(pg, 'qt_%s_arrive' % z, judge_black=False)
    R.check('%s ③ 按「前往」到了 %s（toast %s）' % (tag, z, J(lgs['toast'][-2:])), q['zone'] == z, J(q))
    R.check('%s ③ 落點站得住（canStand）、沒有被放到目的地（walkFallbacks 不變）' % tag, q['zone'] == z and bool(q['stand']) and q['fb'] == fb0, J({k_: q[k_] for k_ in ('x', 'z', 'lv', 'stand', 'fb')}))


async def part_qt(pg, cdp, sv0):
    dd = await pg.evaluate(DAY_JS, {'d0': int(sv0.get('day', 51)) + 1, 'wds': [3]})
    RES['parts'].setdefault('QT', {})['_day'] = dd
    if not R.check('[QT] 找得到存檔以後第一個學期中的週三（六間都開：慢輪週一休、榮恩典週日休）', dd.get('d') is not None, J(dd)): return
    R.note('[QT] 大地圖（src/guide3d.js openMap）只畫目前區域、入口、路線，沒有快速前往清單：地圖這一項看手機「地點」上面的簡圖（PLACEMAP.html）有沒有那一顆圖釘')
    for z in QT_ZONES:
        try: await qt_one(pg, cdp, sv0, z, dd)
        except Exception as e: R.check('[QT %s] 沒有中斷' % z, False, repr(e)[:300])
        dump()


# ---------------------------------------------------------------- GIFT
async def gift_one(pg, cdp, sv0, zone, how, item, dd):
    tag = '[GIFT %s %s]' % (zone, item); out = {'zone': zone, 'item': item}; RES['parts'].setdefault('GIFT', {})[zone] = out
    s = base_sv(sv0, dd['d'], dd['wd'], 14.0, zone)
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s 14:00 %s 出生點' % (dd['key'], zone))
    if not R.check('%s 讀到 %s' % (tag, zone), q['zone'] == zone, J(q)): return
    gi = await pg.evaluate(GIFT_INFO_JS, {'zone': zone, 'how': how, 'item': item}); out['info'] = gi
    R.note('%s 店的資料：%s' % (tag, J(gi)))
    if not R.check('%s 店的資料有「%s」（價錢 %s、按鈕「%s」）' % (tag, item, gi.get('price'), gi.get('label')), not gi.get('err') and gi.get('price') and gi.get('kind'), J(gi)): return
    R.check('%s GIFT.menu 有「%s」（買來送人的飲料）' % (tag, item), any(x[0] == item for x in gi['giftMenu']), J(gi['giftMenu']))
    pts = await find_its(pg, lambda i: i['kind'] == gi['kind'] and i['tzPoint'] and not i['hidden'])
    if not R.check('%s 店裡有「%s」的互動點（kind %s）' % (tag, gi['label'], gi['kind']), bool(pts), J(await find_its(pg, lambda i: i['tzPoint']))): return
    it = pts[0]
    R.check('%s 按鈕的字＝稿的「%s」' % (tag, gi['label']), it['label'] == gi['label'], J(it))
    ok, route = await walk_to_it(pg, cdp, tag, it, gi['label']); out['route'] = route
    if not R.check('%s 走到「%s」、互動鍵是它' % (tag, gi['label']), ok, J(route[-3:])): await D.shot(pg, 'gift_%s_nobtn' % zone, judge_black=False); return
    q0 = await st(pg); m0 = await pg.evaluate(MARK_JS)
    await press(pg, cdp, tag)
    menus, lines = [], []; first = None; bought = False; picked = None; tst = time.time()
    while time.time() - tst < 120:
        q = await st(pg)
        if q['nch']:
            o = await opts(pg); T = [x['t'] for x in o]; menus.append(T)
            if not bought and gi['giftOpt'] in T and picked is None:
                if first is None: first = o
                await tap_opt(pg, cdp, T.index(gi['giftOpt']), tag, gi['giftOpt']); continue
            if not bought and picked is None and any(t.startswith(item + '　') for t in T):
                i = next(i for i, t in enumerate(T) if t.startswith(item + '　')); picked = o[i]; out['buymenu'] = T
                await tap_opt(pg, cdp, i, tag, T[i]); continue
            if not bought and picked is not None:   # 再選一次（S.ITEMS 同名的品項）
                R.note('%s 再選一次：%s → 選第一個' % (tag, J(T))); out['opt2'] = T; await tap_opt(pg, cdp, 0, tag, T[0]); continue
            if bought and gi['no'] in T: await tap_opt(pg, cdp, T.index(gi['no']), tag, gi['no']); continue
            R.note('%s 不認識的選單：%s → 選最後一個' % (tag, J(T))); await tap_opt(pg, cdp, len(T) - 1, tag, T[-1]); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if len(q['carry']) > len(q0['carry']): bought = True
        if not q['busy']:
            if bought or (time.time() - tst > 15 and not menus): break
        await pg.wait_for_timeout(400)
    q1 = await st(pg); lg = await pg.evaluate(SINCE_JS, m0)
    out.update({'menus': menus, 'lines': lines, 'say': lg['say'], 'mon': lg['mon'], 'toast': lg['toast'], 'money': [q0['money'], q1['money']], 'carry': [q0['carry'], q1['carry']]})
    await D.shot(pg, 'gift_%s_end' % zone, judge_black=False)
    R.note('%s 選單 %s；對話 %s；GAME.money %s' % (tag, J(menus), J(lg['say']), J(lg['mon'])))
    if not R.check('%s 選單有「%s」（真的按得到）' % (tag, gi['giftOpt']), bool(first), J(menus[:2])): return
    R.check('%s「%s」是選單最後一項' % (tag, gi['giftOpt']), first[-1]['t'] == gi['giftOpt'], J([x['t'] for x in first]))
    if not R.check('%s 帶走的選單有「%s　%s 元」（價錢＝店的資料）' % (tag, item, gi['price']), bool(picked) and picked['t'] == '%s　%s 元' % (item, gi['price']), J(out.get('buymenu'))): return
    extra = 0
    if out.get('opt2'):
        mm = re.search(r'（\+(\d+) 元）', out['opt2'][0]); extra = int(mm.group(1)) if mm else 0
    want = gi['price'] + extra
    R.check('%s 錢少了剛好 %d 元（%d → %d；GAME.money 只叫一次 −%d）' % (tag, want, q0['money'], q1['money'], want), q0['money'] - q1['money'] == want and [x[0] for x in lg['mon']] == [-want], J(lg['mon']))
    new = [c for c in q1['carry'] if c not in q0['carry']]
    R.check('%s G.carry 多一筆 {n:%s…, cat:drink, day:今天, shop:%s}' % (tag, item, gi['name']), len(new) == 1 and new[0].get('n', '').startswith(item) and new[0].get('cat') == 'drink' and new[0].get('day') == q1['day'] and new[0].get('shop') == gi['name'], J(new))
    R.check('%s 旁白「你買了%s…，帶在身上。」' % (tag, item), any(x[1].startswith('你買了' + item) and x[1].endswith('帶在身上。') for x in lg['say']), J(lg['say'][-3:]))
    R.check('%s 最後沒有對話框、選單' % tag, not q1['dlg'] and not q1['nch'], J({k_: q1[k_] for k_ in ('dlg', 'nch', 'busy')}))


async def part_gift(pg, cdp, sv0):
    dd = await pg.evaluate(DAY_JS, {'d0': int(sv0.get('day', 51)) + 1, 'wds': [3]})
    if not R.check('[GIFT] 找得到存檔以後第一個學期中的週三', dd.get('d') is not None, J(dd)): return
    for zone, how, item in GIFT_CASES:
        try: await gift_one(pg, cdp, sv0, zone, how, item, dd)
        except Exception as e: R.check('[GIFT %s] 沒有中斷' % zone, False, repr(e)[:300])
        dump()


# ---------------------------------------------------------------- TYPH
def door_pred(z):
    return lambda i: (not i['hidden']) and (i['to'] == z or (z.startswith('l118_') and i['shop118'] == z[5:]) or (z == 'tz_limao' and i['lmDoor']) or (z == 'flower_notes' and i['fnDoor']))


async def door_try(pg, cdp, sv0, z, ti, day, wd, tag, ctl):
    s = base_sv(sv0, day, wd, ti['h'] if ti['h'] is not None else 14.0, ti['street'])
    q = await load(pg, cdp, s, tag, '讀使用者存檔，改到 %s %.2f 時 %s 出生點%s' % (ti['ctlKey'] if ctl else TY_DAY, ti['h'] or 14.0, ti['street'], '（對照：不是颱風假）' if ctl else '（颱風假）'))
    out = {'load': q}
    if q['zone'] != ti['street']: R.check('%s 讀到 %s' % (tag, ti['street']), False, J(q)); return out
    allx = await find_its(pg, lambda i: i['to'] == z or (z.startswith('l118_') and i['shop118'] == z[5:]) or (z == 'tz_limao' and i['lmDoor']) or (z == 'flower_notes' and i['fnDoor']))
    out['all'] = allx
    dr = next(iter(await find_its(pg, door_pred(z))), None)
    if not R.check('%s %s 有看得到的店門／店門口按鈕' % (tag, ti['street']), bool(dr), J(allx)): return out
    if z == 'tz_limao': out['lm'] = await pg.evaluate(LM_LOOK_JS)
    ap = await pg.evaluate(APPROACH_JS, {'x': dr['x'], 'z': dr['z'], 'lv': dr['lv'], 'back': 4.0})
    await pg.evaluate(PLACE_JS, {'x': ap['x'], 'z': ap['z'], 'lv': dr['lv']}); await pg.wait_for_timeout(1500)
    R.setup('%s 【前置／捷徑】E.placeAt 站到「%s」(%s, %s) 前 4 m 的 (%s, %s)（%s）' % (tag, dr['label'], dr['x'], dr['z'], ap['x'], ap['z'], ap['how']))
    ok, route = await walk_to_it(pg, cdp, tag, dr, dr['label']); out['route'] = route; out['door'] = dr
    if not R.check('%s 走到「%s」、互動鍵是它' % (tag, dr['label']), ok, J(route[-3:])): await D.shot(pg, 'typh_%s_nobtn%s' % (z, '_ctl' if ctl else ''), judge_black=False); return out
    m0 = await pg.evaluate(MARK_JS)
    await press(pg, cdp, tag); await pg.wait_for_timeout(1200)
    lines = []
    for _ in range(40):
        q = await st(pg)
        if q['zone'] != ti['street']: break
        if q['nch']:
            o = await opts(pg); lines.append('選項：' + '｜'.join(x['t'] for x in o)); await tap_opt(pg, cdp, len(o) - 1, tag, o[-1]['t']); continue
        if q['dlg']:
            if not lines or lines[-1] != q['dtext']: lines.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q['busy']: break
        await pg.wait_for_timeout(400)
    await pg.wait_for_timeout(2500)
    q = await D.wait_zone(pg, cdp, z, 8) if ctl else await st(pg)
    lg = await pg.evaluate(SINCE_JS, m0)
    out.update({'after': q, 'lines': lines, 'say': lg['say'], 'toast': lg['toast']})
    await D.shot(pg, 'typh_%s%s' % (z, '_ctl' if ctl else ''), judge_black=False)
    return out


async def part_typh(pg, cdp, sv0):
    dk = await pg.evaluate(KEY_JS, TY_DAY); RES['parts'].setdefault('TYPH', {})['_day'] = dk
    if not R.check('[TYPH] %s 是颱風假（CALENDAR.typhoon）' % TY_DAY, bool(dk and dk['typhoon']), J(dk)): return
    zs = await pg.evaluate(TY_LIST_JS)
    R.note('[TYPH] PLACES.typhoonShops 裡要測的 %d 間：%s（cfcbc17e75 新加的：新生南路 nanyang／shanlan／dabu／haopai／xsports、花序、禮貌生財、118 巷 7 間；xs_tongxian 是之前就有的）' % (len(zs), J(zs)))
    R.check('[TYPH] 名單有新生南路 5 間、花序、禮貌生財、118 巷 7 間', all(x in zs for x in ['xs_nanyang', 'xs_shanlan', 'xs_dabu', 'xs_haopai', 'xs_xsports', 'flower_notes', 'tz_limao']) and len([x for x in zs if x.startswith('l118_')]) >= 7, J(zs))
    ctl_done = set()
    for z in zs:
        tag = '[TYPH %s]' % z
        try:
            ti = await pg.evaluate(TY_INFO_JS, {'z': z, 'day': dk['d']}); out = {'info': ti}; RES['parts']['TYPH'][z] = out
            if not R.check('%s 找得到那條街（%s）' % (tag, ti.get('street')), bool(ti.get('street')), J(ti)): continue
            if ti['h'] is None: R.note('%s 那一天（%s）平常也沒開（公休）：颱風擋不擋看不出來；照樣按、記字（14:00）' % (tag, WDN[dk['wd']]))
            R.check('%s PLACES.typhoonClosed＝true' % tag, ti['typhoonClosed'], J(ti))
            r = await door_try(pg, cdp, sv0, z, ti, dk['d'], dk['wd'], tag, False); out['typh'] = r
            if not r.get('after'): continue
            shown = [x.split('｜', 1)[-1] for x in r['lines']] + [x[1] for x in r['say']] + r['toast']
            R.note('%s 按下去：%s；toast %s；對話 %s；期望（%s）「%s」' % (tag, J({k_: r['after'][k_] for k_ in ('zone', 'hour')}), J(r['toast']), J(r['lines']), ti['how'], ti['exp']))
            R.check('%s 颱風假按「%s」：沒有進去（還在 %s）' % (tag, r['door']['label'], ti['street']), r['after']['zone'] == ti['street'], J(r['after']))
            R.check('%s 跳出的字＝遊戲資料那一句「%s」' % (tag, ti['exp']), bool(ti['exp']) and any(ti['exp'] in t or (t and t in ti['exp']) for t in shown), J(shown))
            if ti['street'] not in ctl_done and ti['h'] is not None and not ti['ctlTyphoon'] and not ti['ctlHol']:
                ctl_done.add(ti['street'])
                c = await door_try(pg, cdp, sv0, z, ti, ti['ctlDay'], dk['wd'], tag + ' 對照', True); out['ctl'] = c
                if c.get('after'): R.check('%s 對照 %s（不是颱風假）同一時間按：進得去（探針按得進門）' % (tag, ti['ctlKey']), c['after']['zone'] == z, J(c['after']))
        except Exception as e: R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
        dump()


def dump():
    open(os.path.join(OUT, 'l2c82_%s.json' % TAG), 'w', encoding='utf-8').write(J(RES))


async def main():
    print('CC L2C82（LAWWW-C 07:16）：TAG %s；SHA %s；PARTS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS)), flush=True)
    R.setup('網址加 ?tapguard（選單剛出來那一下不收點擊，和真手機一樣；CC_02 乙 4）：%s' % URL)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        sv0 = await pg.evaluate("(f=>fetch(f).then(r=>r.ok?r.json():null).catch(()=>null))", FIX)
        if not R.check('讀得到使用者存檔 %s' % FIX, bool(sv0), ''): await b.close(); sys.exit(1)
        if isinstance(sv0.get('G'), dict): sv0 = sv0['G']
        ver = await pg.evaluate("(()=>({jobs:typeof JOBS!=='undefined'&&!!JOBS.busyWith&&!!JOBS.early, aa829:typeof SHOP_JOBS_AA829!=='undefined', gift:typeof GIFT!=='undefined'&&!!GIFT.SHOPS&&!!GIFT.SHOPS['東南大聯商行'], typh:typeof PLACES!=='undefined'&&PLACES.typhoonShops.includes('tz_limao')}))()")
        RES['ver'] = ver
        R.check('這一版有要測的東西（JOBS.busyWith／early、SHOP_JOBS_AA829、GIFT 東南大聯商行、颱風名單有禮貌生財）', all(ver.values()), J(ver))
        await pg.evaluate(HOOK_JS)
        for part, fn in (('JOBS', part_jobs), ('QT', part_qt), ('GIFT', part_gift), ('TYPH', part_typh)):
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
