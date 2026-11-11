"""CC（帳號 A）11-11：LEADOUT-WALL-1111——一起念書散場、兩個人起身「一起走到門口」（src/invites3d.js S.leadOut）的瀏覽器探針（BB 的判準）。判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。
受測：開發分支 01679bc0a7580dabd373d2fbfda8542c21e0fc20（S.leadOutSpots：照舊的兩個點站得住、找得到路就照舊，不行才在出生點附近找；木曜日等六區改點、總圖不變）。
修改前（D34）：01679bc0a 的父 15e7b31f83b1559d4ebfec7b322aaf956698990d（和 b77af3a4fe6d348ae58337a1ce708442ef9ef458 只差 docs/handoff/tasks.json，src 相同）：
  沒有 INV.leadOutSpots，目標點＝區域出生點（zone.spawn）左右各 0.55 m；木曜日的出生點在一樓窄樓梯上，兩個點在牆裡 → 預期 MOKU FAIL（站不住、靠 walkTo 的保險放過去）；LIB 照舊 PASS。
對照的程式：
  S.meet（o.lib）→ S.libEnd：收書 → S.leadOut（兩個人起身 GM.standUp → GM.walkTo 兩個點、lv＝出生點那一層）→ 道別。現在**只有總圖**（地點 library 有 sitAt.lead）會走這一段。
  地點 slowread（木曜日「去木曜日念書」）沒有 sitAt：S.meet 走一般念書（SNo：收書、道別），**遊戲本身在木曜日不走 leadOut**（LAWWW 11-11 22:2x「念書不走這條」；commit 訊息「現在真的會走 leadOut 的只有總圖」）。
  GAME.walkTo 的保險：遊戲時間連續 4 秒沒前進 0.25 m（或走超過 90 秒）＝E.placeAt 放到目的地、GAME.walkFallbacks +1；E.moveTo 找不到路＝當場 E.placeAt（不加 walkFallbacks）。
PARTS（逗號分隔；預設 LIB,MOKU；各自讀檔）：
  LIB   總圖：手機「朋友」→ 她的「約」→「念書…」→「去總圖一起念書」→「今天 HH:MM」→【捷徑】時間撥到約好的前 10 分鐘 → 手機「今天」「現在過去」→「直接過去」
        → 總圖大廳：她帶路上二樓、坐好（INV lead.ph wait）→ 玩家搖桿／點地走到她旁邊（6 秒一段，途中劇情開始就停）＝開演 → 念書（快轉、中途、選項照字選）
        → 遊戲自己的 S.libEnd → S.leadOut（自然觸發，不插手）。二樓坐滿改去三樓閱覽區（區域 library）也照記，log 寫明在哪一區。
  MOKU  木曜日：同樣的入口約「去木曜日念書」（地點 slowread）→「直接過去」→ 一樓樓梯 → 走上二樓她旁邊＝開演 → 念書。
        遊戲本身不走 leadOut，所以【捷徑】：探針在 INV.ON_STAYED（遊戲給見面用的掛勾：時間過去以後、收書道別以前，兩個人還坐在念書的座位上）呼叫遊戲自己的 INV.leadOut
        （只在這一次約、而且 INV.sitRule 說遊戲自己不帶路的時候插；遊戲以後自己會帶路就不插、log 寫明）。走的是遊戲的 S.leadOut 原封不動：起身、選點、walkTo、保險都照遊戲。
判準（BB）：散場走到門口那一刻——
  1 兩個目標點都站得住（E.canStand 半徑 0.32，在出生點那一層；0.32＝S.leadOutSpots 的 R／tests/leadout_spots_1111_unit.js）
  2 你和她各自在 15 秒遊戲時間內走到自己的點（GAME.walkTo 完成、停在目標 0.4 m 內、同一層、沒有被 E.placeAt 放過去）
    遊戲時間＝E.time（主迴圈的 dt，每格最多 0.1 秒；雲端 SwiftShader 掉幀時比真實時間慢，walkTo 的 4 秒保險也是用這個時間）
  3 沒有人卡在牆上或原地走：每一格（E.update）記兩個人的位置；還沒到以前，任何 2 秒遊戲時間的移動 < 0.15 m＝卡住
    （走路 E.SPD.walk 1.8 m/s，2 秒該走 3.6 m；0.15 m 比 10 fps 一格 0.18 m 還小）；相鄰兩格移動超過 max(0.5, E.SPD.run×1.5×dt)＝瞬移
  4 GAME.walkFallbacks 沒有增加、走路途中沒有 E.placeAt 放過去、E.moveTo 都找得到路
記錄：選出來的點（有 INV.leadOutSpots 就用和遊戲一樣的輸入算一次，和遊戲 walkTo 的目的地比；沒有＝修改前，照舊的兩個點）、兩個人的軌跡（每 0.5 秒遊戲時間印一點）、時間、
  門口截圖（lo_<part>_door：兩個人都在點上 0.6 m 內那一刻；沒抓到就拍結束時）、開始截圖（lo_<part>_start）。玩家不藏（要看的是兩個人站在哪）。
  掛勾（只記不改）：INV.leadOut、GAME.walkTo、E.moveTo、E.placeAt、E.update（取樣）、GAME.say／GAME.choose／GAME.caption（逐字）；唯一改變流程的是 MOKU 的 ON_STAYED 插入（【捷徑】，log 會印）。
【前置／捷徑】（log 都會印）：讀檔（GAME.applySave、關條件事件和手機自動打開）到宿舍 10:00、日子照 CALENDAR 挑（不是假日、颱風假、考試週）、晴天、錢 3000；她的聯絡方式；
  關係數值（SOCIAL.rel 直接設＝第 2 階）；一起念書次數 STUDYN＝第 1 場；故事線 BEATS.last＝今天（今天不演一拍）；升階門檻台詞記成說過；
  MOKU：G.visited.wz_mokuyobi＝true（slowread 要去過才列，invites.js show）、G.mokuyobi.first（第一次進門那一段不演）；時間撥到約好的前 10 分鐘。
環境變數：PARTS、WHO（逗號分隔候選，預設 heroine_01,heroine_03,heroine_02：挑第一個「那天那個地點有時間會答應」的人）、SHA、MAX_S（每段赴約的真實秒數上限，預設 1800）。
用法：LW_TESTS=<worktree>/tests SHA=<40 碼> PARTS=LIB,MOKU python3 cc_leadout_probe.py <url（不加 ?turbo）> <outdir>"""
import os, sys, json, time, math, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ALL_PARTS = ['LIB', 'MOKU']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
WHO = [x.strip() for x in (os.environ.get('WHO') or 'heroine_01,heroine_03,heroine_02').split(',') if x.strip()]
MAX_S = int(os.environ.get('MAX_S') or 1800)
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('cc_leadout', OUT)

LIMIT_S = 15.0      # BB：15 秒遊戲時間內走到
STALL_S = 2.0       # BB：沒到以前沒有超過 2 秒不動
STALL_M = 0.15      # 2 秒內移動不到這個距離＝不動（走路 1.8 m/s×2 s＝3.6 m；10 fps 一格 0.18 m）
ARRIVE_M = 0.4      # 停在目標這個距離內＝走到（GAME.walkTo 最後一步走到轉折點：stepSp）
R_STAND = 0.32      # S.leadOutSpots 的 R、tests/leadout_spots_1111_unit.js
WATCH_S = 600       # 看著走到門口的真實秒數上限（雲端 1～4 fps）
DAY_KEYS = ['2025-10-18', '2025-10-25', '2025-11-01', '2025-11-08', '2025-11-15', '2025-11-22', '2025-10-19', '2025-10-26', '2025-11-02', '2025-11-09', '2025-10-23', '2025-11-06']
REL2 = dict(fam=28, trust=12, comf=12, npcRom=4)   # 第 2 階（cc_act_probe.py REL[2]）
EXIT_WORDS = ('算了', '返回', '下次再說', '換一天', '不用了', '先不要')
PART_CFG = {
    'LIB': {'pid': 'library', 'zone': 'library_hall', 'h_pref': 15.5, 'inject': False, 'visit': None, 'moku': False},
    'MOKU': {'pid': 'slowread', 'zone': 'wz_mokuyobi', 'h_pref': 15.5, 'inject': True, 'visit': 'wz_mokuyobi', 'moku': True},
}


def log(s):
    print(s, flush=True)


# ---------------------------------------------------------------- 頁面上的 JS
# 逐字、選單（只記不改；cc_act_probe.py HOOK_JS 的精簡版）
HOOK_JS = r"""(()=>{ if(!window.__ACTH){ window.__ACTH=1; window.__AE=[];
  const n=()=>window.__AE.length, G=()=>GAME.G;
  const s0=GAME.say; GAME.say=function(w,t){ try{ window.__AE.push({k:'say',i:n(),who:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t),h:+(+G().hour).toFixed(3),z:G().zone}); }catch(e){} return s0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(a,b){ try{ window.__AE.push({k:'cap',i:n(),t:String(b==null?a:b)}); }catch(e){} return p0.apply(this,arguments); }; }
  const c0=GAME.choose; GAME.choose=function(o){ const rec={k:'ch',i:n(),opts:(o||[]).map(x=>typeof x==='string'?x:((x&&x.t)||'')),dim:(o||[]).map(x=>!!(x&&x.dim)),pick:null,z:G().zone};
    try{ window.__AE.push(rec); }catch(e){} const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; };
 }
 if(!window.__ccHookSay){ window.__ccHookSay=1; window.__ccCons=[];
  for(const k of ['warn','error']){ const o=console[k].bind(console); console[k]=(...a)=>{ try{ window.__ccCons.push(k+': '+a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,200)); }catch(e){} return o(...a); }; }
  window.addEventListener('error',e=>{ window.__ccCons.push('onerror: '+String(e.message).slice(0,200)); });
  window.addEventListener('unhandledrejection',e=>{ window.__ccCons.push('reject: '+String(e.reason&&e.reason.stack||e.reason).slice(0,200)); });
 }
 window.__AE=[]; return true; })()"""

ST_JS = r"""(()=>{ const D=GAME.D||{}, ch=document.getElementById('choices'), tx=document.getElementById('dlgText'), nm=document.getElementById('dlgName'), ph=document.getElementById('phone');
  const B=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const E=window.__AE||[]; let last=null; for(let i=E.length-1;i>=0;i--) if(E[i].k==='ch'){ last=E[i]; break; }
  const it=document.getElementById('interact'), P=GAME.E&&GAME.E.player;
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(b=>(b.textContent||'').trim()), ch:last&&last.pick==null?{i:last.i,opts:last.opts,dim:last.dim}:null,
    phone:!!(ph&&!ph.classList.contains('hide')), zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), busy:!!(P&&P.busy), seat:!!(P&&P.seat), lv:P?(P.lv|0):0,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim().slice(0,30):''}; })()"""

CAL_JS = r"""(k=>{ const d=STORY.dayOfKey(k); const x=CALENDAR.dateOf(d), t=CALENDAR.termOf?CALENDAR.termOf(d):null; return {k, d, wd:((x.wd%7)+7)%7, hol:!!(CALENDAR.holiday&&CALENDAR.holiday(d)), typh:!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)), term:t?t.id:null, week:t?t.week:null, exam:!!(t&&t.exam)}; })"""

SETUP_JS = r"""(q=>{ const G=GAME.G, F=G.flags||(G.flags={}), out={notes:[]};
  G.contacts=G.contacts||{}; if(G.contacts[q.who]==null) G.contacts[q.who]=1; G.money=Math.max(G.money|0,3000); G.invites=[]; G.weather='clear';
  Object.assign(SOCIAL.rel(q.who), q.rel);
  if(typeof STUDYN!=='undefined'&&STUDYN.rec){ const RS=STUDYN.rec(G); RS[q.who]={n:0,k:1,last:null,rot:-1}; } else out.notes.push('沒有 STUDYN.rec');
  if(typeof ARCS!=='undefined'&&ARCS.rec){ const r=ARCS.rec(G,q.who); r.last=G.day; }
  let ups=0; if(SOCIAL.upLine&&SOCIAL.markUp){ for(let i=0;i<10;i++){ const U=SOCIAL.upLine(q.who,{place:q.pid||null,outing:true}); if(!U) break; SOCIAL.markUp(q.who,U.k); ups++; } }
  if(q.visit){ const V=G.visited||(G.visited={}); out.visited0=!!V[q.visit]; V[q.visit]=true; }
  if(q.moku){ const M=(G.mokuyobi&&typeof G.mokuyobi==='object')?G.mokuyobi:(G.mokuyobi={}); out.mokuFirst0=M.first==null?null:M.first; if(M.first==null) M.first=G.day-14; }
  out.stage=(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(q.who):null; out.canInvite=INV.canInvite?INV.canInvite(G,q.who):null; out.whyNot=INV.whyNot?INV.whyNot(G,q.who):'';
  let sn=null; try{ const x=STUDYN.pick(G,q.who); sn=x?{k:x.k==null?null:x.k,generic:!!x.generic}:null; }catch(e){ sn={err:String(e)}; } out.studyN=sn;
  out.dating=Object.keys(F).filter(k=>k.indexOf('dating_')===0&&F[k]); out.ups=ups; out.name=G.name||''; return out; })"""

PLACE_JS = r"""(q=>{ const P=INV.place?INV.place(q.pid):null; if(!P) return null; let show=true; try{ show=P.show?!!P.show(GAME.G,q.who):true; }catch(e){ show='err '+String(e); }
  return {id:P.id, zone:P.zone, name:P.name, verb:P.verb, verbStudy:P.verbStudy||null, sitAt:P.sitAt||null, show, why:INV.placeWhy?INV.placeWhy(GAME.G,q.who,P):'', cats:INV.catsOf?INV.catsOf(P):null}; })"""

TIMES_JS = r"""(q=>{ const G=GAME.G, P=INV.place(q.pid); if(!P) return {err:'沒有地點'}; const T=INV.timeOptions(G,false,P,q.who), out=[];
  for(const x of T){ if(x.day!==G.day||x.dim||x.now) { out.push({t:x.t,skip:x.dim?'灰':(x.now?'現在':'不是今天')}); continue; }
    let r=null; try{ r=INV.personal(G,q.who,P,x.day,x.h,INV.decide(G,q.who,P.id,x.day,x.h)); }catch(e){ r={res:'err',why:String(e)}; }
    let te=null; try{ te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,q.who,P,{day:x.day,h:x.h}):null; }catch(e){ te={err:String(e)}; }
    out.push({t:x.t,h:x.h,res:r&&r.res,why:r&&r.why||null,te:!!te}); }
  return out; })"""

IV_JS = r"""(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{id:v.id,st:v.state,ph:(v.lead&&v.lead.ph)||null,place:v.place,zone:v.zone,h:v.h,mid:!!v.mid,alt:!!v.alt,gz:GAME.G.zone}:null; })"""

NPC_JS = r"""(w=>{ const n=(GAME.npc&&GAME.npc[w])||(GAME.E.npcs||[]).find(q=>q.id===w||q.charId===w); return n&&n.obj?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0,seat:!!n.seat}:null; })"""

IDLE_JS = r"""(w=>{ const E=GAME.E, P=E.player, D=GAME.D||{}, f2=v=>v==null?null:+(+v).toFixed(2); const n=(GAME.npc&&GAME.npc[w])||(E.npcs||[]).find(q=>q.charId===w);
  return {me:{x:f2(P.obj.position.x), z:f2(P.obj.position.z), lv:P.lv|0, busy:!!P.busy, pose:P.pose||null, seat:!!P.seat, frozen:!!P.frozen}, cam:E.cam&&E.cam.mode, depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active,
    ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, adv:typeof ADV!=='undefined'&&!!ADV.active, paused:!!E.paused, fade:!!(document.getElementById('fade')&&document.getElementById('fade').classList.contains('on')),
    her:n&&n.obj?{x:f2(n.obj.position.x), z:f2(n.obj.position.z), lv:n.lv|0, seat:!!n.seat, pose:n.pose||null, vis:n.obj.visible!==false}:null,
    zone:GAME.G.zone, hour:f2(GAME.G.hour), fb:GAME.walkFallbacks||0, lo:window.__lo?{on:!!window.__lo.on, calls:window.__lo.calls.length, arm:window.__lo.arm, inj:window.__lo.inj}:null,
    top:(()=>{ const e=document.elementFromPoint(innerWidth/2, innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })(),
    ivs:(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day).map(v=>({id:v.id,st:v.state,ph:v.lead&&v.lead.ph,zone:v.zone,mid:!!v.mid})),
    cons:(window.__ccCons||[]).slice(-6)}; })"""

# 散場走到門口的掛勾：INV.leadOut／GAME.walkTo／E.moveTo／E.placeAt 只記不改；E.update 每一格取樣；MOKU 在 INV.ON_STAYED 插一次遊戲自己的 INV.leadOut（【捷徑】）
LO_JS = r"""(()=>{ const W=window; if(W.__lo&&W.__lo.v) return 'already';
  const E=GAME.E, S=W.__lo={v:1,on:false,calls:[],moves:[],places:[],smp:[],inj:null,arm:null,near:null,n:null,cur:null,_inj:false,err:[]};
  const f3=v=>v==null?null:+(+v).toFixed(3);
  const pos=e=>e&&e.obj?[f3(e.obj.position.x),f3(e.obj.position.z),e.lv|0,f3(e.obj.position.y)]:null;
  const who=e=>e===E.player?'P':((S.n&&e===S.n)?'n':null);
  const lo0=INV.leadOut;
  INV.leadOut=async function(GM,iv,n){ const sp=E.zone&&E.zone.spawn, y=sp?(sp.yaw||0):0, lv=sp?(sp.lv|0):0;
    const orig=sp?[{x:sp.x-Math.cos(y)*0.55,z:sp.z+Math.sin(y)*0.55},{x:sp.x+Math.cos(y)*0.55,z:sp.z-Math.sin(y)*0.55}].map(q=>({x:f3(q.x),z:f3(q.z),stand:!!E.canStand(q.x,q.z,0.32,lv)})):null;
    const c={k:S.calls.length+1, src:S._inj?'inject':'game', zone:GAME.G.zone, who:iv&&iv.who, ivid:iv&&iv.id, t0:f3(E.time), w0:Date.now(), fb0:GAME.walkFallbacks||0,
      P0:pos(E.player), n0:pos(n), pSeat:!!E.player.seat, nSeat:!!(n&&n.seat), hasN:!!(n&&n.obj), spawn:sp?{x:f3(sp.x),z:f3(sp.z),yaw:f3(y),lv}:null, orig,
      spotsFn:typeof INV.leadOutSpots==='function', spots:null, tg:[], t1:null, w1:null, fb1:null, P1:null, n1:null, err:null};
    S.calls.push(c); S.cur=c; S.n=n||null; S.near=null; S.on=true;
    try{ return await lo0.apply(this,arguments); }
    catch(e){ c.err=String(e&&e.message||e); throw e; }
    finally{ c.t1=f3(E.time); c.w1=Date.now(); c.fb1=GAME.walkFallbacks||0; c.P1=pos(E.player); c.n1=pos(n); S.on=false; } };
  const w0=GAME.walkTo;
  GAME.walkTo=function(ent,x,z,o){ if(!S.on||!S.cur) return w0.apply(this,arguments); const c=S.cur;
    if(c.spots===null&&c.spotsFn){ try{ const pp=e=>e&&e.obj?{x:e.obj.position.x,z:e.obj.position.z,lv:e.lv|0}:null; const r=INV.leadOutSpots(E,[pp(E.player),S.n&&S.n.obj?pp(S.n):null]); c.spots=r?r.map(q=>({x:f3(q.x),z:f3(q.z),s:q.s,f:q.f})):'null'; }catch(e){ c.spots='err '+String(e&&e.message||e); } }
    const lv=(o&&o.lv!=null)?(o.lv|0):(ent.lv|0);
    const r={who:who(ent)||'other', x:f3(x), z:f3(z), lv, t0:f3(E.time), from:pos(ent), stand:!!E.canStand(x,z,0.32,lv), path:null, done:null, ret:null, at:null};
    try{ const p=E.pathTo(ent.obj.position.x,ent.obj.position.z,ent.lv|0,x,z,lv); if(p&&p.length){ let len=0, ax=ent.obj.position.x, az=ent.obj.position.z; for(const q of p){ len+=Math.hypot(q[0]-ax,q[1]-az); ax=q[0]; az=q[1]; } r.path={n:p.length,len:f3(len),end:[f3(ax),f3(az)]}; } else r.path='沒有路'; }catch(e){ r.path='err '+String(e&&e.message||e); }
    c.tg.push(r);
    const pr=w0.apply(this,arguments); Promise.resolve(pr).then(v=>{ r.done=f3(E.time); r.ret=v; r.at=pos(ent); },()=>{}); return pr; };
  const m0=E.moveTo; E.moveTo=function(ent,x,z,cb,lv){ const ret=m0.apply(this,arguments); try{ const w=S.on?who(ent):null; if(w) S.moves.push({k:S.cur?S.cur.k:0,who:w,x:f3(x),z:f3(z),lv:lv==null?null:(lv|0),ok:!!ret,t:f3(E.time)}); }catch(e){} return ret; };
  const pa0=E.placeAt; E.placeAt=function(ent,x,z,lv){ try{ const w=S.on?who(ent):null; if(w) S.places.push({k:S.cur?S.cur.k:0,who:w,phase:(S.cur&&S.cur.tg.length)?'walk':'stand',from:pos(ent),to:[f3(x),f3(z),lv==null?null:(lv|0)],t:f3(E.time)}); }catch(e){} return pa0.apply(this,arguments); };
  const u0=E.update; E.update=function(dt){ const ret=u0.apply(this,arguments);
    try{ if(S.on&&S.cur&&S.smp.length<6000){ const c=S.cur; S.smp.push({k:c.k,t:f3(E.time),p:pos(E.player),n:pos(S.n),pp:E.player.pose||null,np:(S.n&&S.n.pose)||null});
      if(S.near==null){ const tp=c.tg.find(q=>q.who==='P'), tn=c.tg.find(q=>q.who==='n'); const d=(e,q)=>(e&&e.obj&&q)?Math.hypot(e.obj.position.x-q.x,e.obj.position.z-q.z):99;
        if(tp&&(!S.n||(tn&&d(S.n,tn)<0.6))&&d(E.player,tp)<0.6) S.near=f3(E.time); } } }catch(e){} return ret; };
  if(Array.isArray(INV.ON_STAYED)) INV.ON_STAYED.push(async function(GM,iv,w,P){ if(!S.arm||!iv||String(iv.id)!==String(S.arm)) return; S.arm=null;
    const rule=INV.sitRule?INV.sitRule(GAME.G,iv):null; const n=(GAME.E.npcs||[]).find(q=>q&&q.obj&&w&&q.obj===w.obj)||(GAME.npc&&GAME.npc[iv.who])||null;
    S.inj={t:f3(GAME.E.time), zone:GAME.G.zone, rule:rule?JSON.parse(JSON.stringify(rule)):null, hasN:!!(n&&n.obj), pSeat:!!GAME.E.player.seat, nSeat:!!(n&&n.seat), P:pos(GAME.E.player), n:pos(n), skip:null, err:null};
    if(rule){ S.inj.skip='這一區遊戲自己會帶路、走到門口（INV.sitRule），不插'; return; }
    S._inj=true; try{ await INV.leadOut(GM,iv,n); }catch(e){ S.inj.err=String(e&&e.message||e); } finally{ S._inj=false; } });
  else S.err.push('INV.ON_STAYED 不是陣列：沒辦法插散場走到門口');
  return 'ok'; })()"""

LO_RESET_JS = r"""(()=>{ const S=window.__lo; if(!S) return false; S.calls=[]; S.moves=[]; S.places=[]; S.smp=[]; S.inj=null; S.arm=null; S.near=null; S.n=null; S.cur=null; S.on=false; S._inj=false; S.err=[]; return true; })()"""

LO_ARM_JS = r"""(id=>{ if(!window.__lo) return false; window.__lo.arm=id; return true; })"""

LO_BRIEF_JS = r"""(()=>{ const S=window.__lo; if(!S) return {on:false,k:0,tg:0,near:null,inj:null}; const c=S.calls[S.calls.length-1]; return {on:!!S.on, k:S.calls.length, tg:c?c.tg.length:0, near:S.near, inj:S.inj, zone:c?c.zone:null}; })()"""

LO_GET_JS = r"""(()=>{ const S=window.__lo||{}; return JSON.parse(JSON.stringify({calls:S.calls||[], moves:S.moves||[], places:S.places||[], smp:S.smp||[], inj:S.inj||null, near:S.near==null?null:S.near, err:S.err||[], fbNow:GAME.walkFallbacks||0})); })()"""

VER_JS = r"""(()=>{ const P=id=>{ const p=INV.place?INV.place(id):null; return p?{zone:p.zone,sitAt:p.sitAt||null}:null; }; const E=GAME.E;
  return {spotsFn:typeof INV.leadOutSpots==='function', leadOut:typeof INV.leadOut==='function', onStayed:Array.isArray(INV.ON_STAYED), sitRule:typeof INV.sitRule==='function',
    meetLib:String(INV.meet||'').indexOf('libEnd')>=0, library:P('library'), slowread:P('slowread'), turbo:!!GAME.turbo, spd:E&&E.SPD?{walk:E.SPD.walk,run:E.SPD.run}:null}; })()"""

TODAY_TXT_JS = r"""(()=>((document.getElementById('phoneBody')||{}).innerText||'').trim())()"""

ALL_JS = [HOOK_JS, ST_JS, CAL_JS, SETUP_JS, PLACE_JS, TIMES_JS, IV_JS, NPC_JS, IDLE_JS, LO_JS, LO_RESET_JS, LO_ARM_JS, LO_BRIEF_JS, LO_GET_JS, VER_JS, TODAY_TXT_JS]   # node --check 用


# ---------------------------------------------------------------- 觸控（cc_act_probe.py 同一套）
async def st(pg):
    return await pg.evaluate(ST_JS)


async def tap_btn(pg, cdp, i):
    """先確認手指底下是那顆鈕（被手機蓋住就先收起來），再按"""
    HIT = "(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y],hit:!!h&&(h===b||b.contains(h)),top:h?(h.id||String(h.className).slice(0,30)):null}; })"
    q = await pg.evaluate(HIT, i)
    if not q: return False
    if not q['hit']:
        log('    [被蓋住] 選項 #%d 上面是「%s」：先收起手機／面板' % (i, q.get('top')))
        await close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
        q = await pg.evaluate(HIT, i)
        if not q: return False
    await L.touch_tap(cdp, q['c'][0], q['c'][1]); return True


class Menu:
    """選單剛出來 350 ms 內的點擊會被吃掉：同一組選項看到 ≥ 650 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.65


async def tap_dlg(pg, cdp, s, screen):
    """打字機：同一句長出來不算換句；打完才記、才翻頁"""
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(300); s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']:
            await pg.wait_for_timeout(1700); s2 = await st(pg)
            if s2['typing'] and s2['shown'] != s2['full']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); s2 = await st(pg)
        s = s2
    if s['dlg'] and s['full'] and (not screen or screen[-1][:2] != [s['name'], s['full']]):
        screen.append([s['name'], s['full'], s['zone'], s['hour']])
        log('    [說] %s：%s' % (s['name'] or '（旁白）', s['full']))
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)
    return s


async def phone(pg, cdp, tab):
    if not (await st(pg))['phone']:
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"): return True
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#phone button')].find(x=>x.textContent.trim()==='收起來'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        if c: await L.touch_tap(cdp, c[0], c[1])
        else: await L.tap(pg, cdp, '#btnPhoneClose')
        await pg.wait_for_timeout(700)
    return not await pg.evaluate("!document.getElementById('phone').classList.contains('hide')")


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })", sel)
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def wait_menu(pg, cdp, screen, secs=20):
    """等選單（中間的對話點掉）；回傳選項字"""
    menu = Menu(); t0 = time.time()
    while time.time() - t0 < secs:
        s = await st(pg)
        if s['nb'] and s['ch']:
            if await menu.ready(s): return s['ch']['opts'], menu
            await pg.wait_for_timeout(150); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        await pg.wait_for_timeout(300)
    return None, menu


async def tap_text(pg, cdp, screen, pred, why):
    opts, menu = await wait_menu(pg, cdp, screen)
    if not opts: return None, None
    k = next((i for i, o in enumerate(opts) if pred(o)), None)
    if k is None: return None, opts
    log('    [選項] %s → %s（%s）' % ('｜'.join(opts), opts[k], why))
    await tap_btn(pg, cdp, k); await pg.wait_for_timeout(900)
    return opts[k], opts


# ---------------------------------------------------------------- 前置
async def load_day(pg, cdp, key, hour=10.0):
    c = await pg.evaluate(CAL_JS, key)
    stt = {'zone': 'dorm', 'day': c['d'], 'weekday': c['wd'], 'hour': hour, 'weather': 'clear', 'money': 3000,
           'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'KX_DEC3_MIGRATED': True, 'YT_JOB_V': 1, 'NAMECARD_V': 1, 'FAFU_PURE': 1, 'FAFU_STORY_SEEN': 0}}
    try: await L.load_state(pg, stt, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, stt, quiet_events=True)
    await pg.wait_for_timeout(3500)
    await close_phone(pg, cdp); await L.close_panels(pg, cdp)
    await pg.evaluate(HOOK_JS)
    lo = await pg.evaluate(LO_JS)
    await pg.evaluate(LO_RESET_JS)
    return c, lo


async def choose(pg, cdp, tag, cfg):
    """人（WHO 依序）× 日子（DAY_KEYS 依序；CALENDAR 排掉假日、颱風假、考試週）× 地點的時間（她會答應、不是期末的飯，離 h_pref 近的先）；每個被跳過的都記原因"""
    tried = []
    for who in WHO:
        for key in DAY_KEYS:
            c = await pg.evaluate(CAL_JS, key)
            if c['hol'] or c['typh'] or c['exam'] or not c['term']:
                tried.append([who, key, '假日／颱風／考試週／沒有學期', c]); continue
            c, lo = await load_day(pg, cdp, key)
            s = await pg.evaluate(SETUP_JS, {'who': who, 'rel': REL2, 'pid': cfg['pid'], 'visit': cfg['visit'], 'moku': cfg['moku']})
            p = await pg.evaluate(PLACE_JS, {'who': who, 'pid': cfg['pid']})
            if not p: tried.append([who, key, '沒有地點 ' + cfg['pid']]); continue
            if p['show'] is not True or p['why']: tried.append([who, key, '地點 show／why', p['show'], p['why']]); continue
            if s.get('canInvite') is False: tried.append([who, key, 'canInvite false', s.get('whyNot')]); continue
            tm = await pg.evaluate(TIMES_JS, {'who': who, 'pid': cfg['pid']})
            if isinstance(tm, dict): tried.append([who, key, tm]); continue
            hs = [x for x in tm if x.get('res') == 'accept' and not x.get('te')]
            hs.sort(key=lambda x: abs(x['h'] - cfg['h_pref']))
            if not hs: tried.append([who, key, '沒有會答應的時間', [[x.get('t'), x.get('res') or x.get('skip'), x.get('why')] for x in tm][:8]]); continue
            log('  [%s] 選人／日子／時間（只讀的查詢）：被跳過的 %s' % (tag, J(tried[-10:])))
            return {'who': who, 'key': key, 'cal': c, 'setup': s, 'place': p, 'time': hs[0], 'lo': lo}
    log('  [%s] 每一個都被跳過：%s' % (tag, J(tried)))
    return None


# ---------------------------------------------------------------- 約、赴約
async def invite(pg, cdp, tag, pk, screen):
    """手機「朋友」→ 她的「約」→「念書…」→ 地點（verbStudy／verb）→「今天 HH:MM」→ 她的回答；回傳 iv（約不到＝None）"""
    who = pk['who']; P = pk['place']; t = pk['time']['t']
    verb = P.get('verbStudy') or P['verb']
    await phone(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    if not await tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who):
        body = await pg.evaluate(TODAY_TXT_JS)
        R.check('[%s] 手機「朋友」有 %s 的「約」' % (tag, who), False, body[:300]); await close_phone(pg, cdp); return None
    log('    [按] 手機「朋友」→ %s「約」' % who)
    await pg.wait_for_timeout(1200)
    got = None; opts = None
    for _ in range(4):
        got, opts = await tap_text(pg, cdp, screen, lambda o: o == verb or o.startswith('念書'), '類別／地點')
        if got is None or got == verb: break
    if got != verb:
        R.check('[%s] 邀約選單選到「%s」' % (tag, verb), False, J(opts)); await close_phone(pg, cdp); return None
    got, opts = await tap_text(pg, cdp, screen, lambda o: o == t, '時間')
    if got is None:
        R.check('[%s] 時間選單有「%s」' % (tag, t), False, J(opts)); await close_phone(pg, cdp); return None
    t0 = time.time(); menu = Menu()
    while time.time() - t0 < 25:   # 她的回答：resched 的「好，就…」照按；其他對話點掉
        s = await st(pg)
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            k = next((i for i, o in enumerate(s['ch']['opts']) if o.startswith('好，就')), 0)
            log('    [選項] %s → %s（她的回答）' % ('｜'.join(s['ch']['opts']), s['ch']['opts'][k]))
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        if time.time() - t0 > 3: break
        await pg.wait_for_timeout(400)
    await close_phone(pg, cdp)
    return await pg.evaluate("(q=>{ const L=(GAME.G.invites||[]).filter(v=>v.who===q.w&&v.place===q.p&&v.day===GAME.G.day&&v.state==='accepted'); const v=L[L.length-1]; return v?{id:v.id,h:v.h,zone:v.zone}:null; })", {'w': who, 'p': P['id']})


def pick_opt(opts, dims):
    """選單照字選：直接過去 → 好，就… → 第一個能選、不是離開類的"""
    for w in ('直接過去', '好，就'):
        k = next((i for i, o in enumerate(opts) if o.startswith(w)), None)
        if k is not None: return k, w
    k = next((i for i, o in enumerate(opts) if not (dims[i] if i < len(dims) else False) and not any(w in o for w in EXIT_WORDS)), 0)
    return k, '第一個能選的'


async def watch_leadout(pg, tag, k):
    """散場走到門口的那一段：不按任何東西，只看（0.3 秒一次），拍開始、兩個人都在點上、結束"""
    t0 = time.time(); shot_start = False; shot_near = False; q = None
    log('    [走到門口] 第 %d 次 INV.leadOut 開始（真實時間 %s）' % (k, time.strftime('%H:%M:%S')))
    while time.time() - t0 < WATCH_S:
        q = await pg.evaluate(LO_BRIEF_JS)
        if not shot_start and q['tg'] >= 1:
            await pg.wait_for_timeout(600); await R.shot(pg, 'lo_%s_start' % tag.lower()); shot_start = True; continue
        if q['near'] is not None and not shot_near:
            await R.shot(pg, 'lo_%s_door' % tag.lower()); shot_near = True
            log('    [走到門口] 兩個人都在目標 0.6 m 內（E.time %s）：截圖 lo_%s_door' % (q['near'], tag.lower()))
        if not q['on']: break
        await pg.wait_for_timeout(300)
    if not shot_near:
        await R.shot(pg, 'lo_%s_door_end' % tag.lower())
        log('    [走到門口] 沒抓到「兩個人都在點上」那一刻：改拍結束時（lo_%s_door_end）' % tag.lower())
    log('    [走到門口] %s（真實 %.0f 秒）' % ('結束' if q and not q['on'] else '看到上限還沒結束', time.time() - t0))


async def go_meet(pg, cdp, tag, who, iv, screen, path_seen):
    """【捷徑】撥到約好的前 10 分鐘 → 手機「今天」現在過去 → 走到她旁邊（6 秒一段）→ 見面整段（選項照字選）；散場走到門口那一段交給 watch_leadout"""
    await pg.evaluate("(h=>{ GAME.G.hour=h; })", iv['h'] - 0.17); await pg.wait_for_timeout(1200)
    R.setup('[%s]【捷徑】時間撥到約好的前 10 分鐘（%.2f）' % (tag, iv['h'] - 0.17))
    await phone(pg, cdp, 'today')
    if not await tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']):
        R.check('[%s] 手機「今天」有「現在過去」' % tag, False, (await pg.evaluate(TODAY_TXT_JS))[:300]); await close_phone(pg, cdp); return False
    log('    [按] 手機「今天」現在過去'); path_seen.append('手機「今天」現在過去')
    await pg.wait_for_timeout(1500)
    menu = Menu(); t0 = time.time(); walked = 0; reopen = 0; same = [None, 0]; done_t = None; zt = [None, 0]; idle_t = time.time(); idle_n = 0; watched = set()
    while time.time() - t0 < MAX_S:
        lo = await pg.evaluate(LO_BRIEF_JS)
        if lo['on'] and lo['k'] not in watched:
            watched.add(lo['k']); path_seen.append('散場走到門口（第 %d 次 leadOut，%s）' % (lo['k'], lo.get('zone')))
            await watch_leadout(pg, tag, lo['k']); idle_t = time.time(); continue
        s = await st(pg)
        if s['zone'] != zt[0]: zt = [s['zone'], time.time()]; log('    [區域] %s（%.2f）' % (s['zone'], s['hour']))
        v = await pg.evaluate(IV_JS, iv['id'])
        if v and v['st'] in ('done', 'missed', 'cancelled') and not v['mid'] and not s['dlg'] and not s['nb'] and not s['busy'] and not lo['on']:
            if done_t is None: done_t = time.time()
            if time.time() - done_t > 2.5: break
            await pg.wait_for_timeout(500); continue
        done_t = None
        if s['phone'] and not s['nb']:
            reopen += 1; await close_phone(pg, cdp)
            if reopen > 8: R.note('[%s] 手機一直自己打開（%d 次）：停' % (tag, reopen)); break
            continue
        if s['nb'] and s['ch']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['ch']['opts']; k, why = pick_opt(opts, s['ch']['dim'])
            log('    [選項] %s → %s（%s）' % ('｜'.join(opts), opts[k], why))
            if opts[k].startswith('直接過去'): path_seen.append('直接過去')
            sig = (opts[k], s['zone'], s['hour']); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6:
                await R.shot(pg, 'lo_%s_stuckopt' % tag.lower()); R.check('[%s] 選項「%s」按得下去（同一個選項按了 6 次沒反應）' % (tag, opts[k]), False); return False
            await tap_btn(pg, cdp, k); menu.tapped = time.time(); await pg.wait_for_timeout(900); continue
        if s['nb'] and not s['ch']:   # game3d 內部的 choose（座位 seatMenu 等）不經 GAME.choose：照按鈕文字選、記一行（CC_02 乙 4、13）
            bt = s['btn']
            k = next((i for i, t in enumerate(bt) if any(t.startswith(w) for w in ('起身', '算了', '返回'))), None)
            if k is None: k = next((i for i, t in enumerate(bt) if any(w in t for w in EXIT_WORDS)), 0)
            log('    [選項（遊戲內部選單）] %s → %s' % ('｜'.join(bt), bt[k] if bt else None))
            sig = (('int',) + tuple(bt), s['zone'], s['hour']); same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6: await R.shot(pg, 'lo_%s_stuckopt' % tag.lower()); R.check('[%s] 遊戲內部選單「%s」按得下去' % (tag, bt[k] if bt else ''), False); return False
            await tap_btn(pg, cdp, k); await pg.wait_for_timeout(1500); continue
        if s['dlg']: await tap_dlg(pg, cdp, s, screen); continue
        if v and v['st'] == 'accepted' and not s['busy'] and (v['ph'] == 'wait' or v['zone'] == s['zone']) and walked < 6 and time.time() - zt[1] > 5:   # 進那個區域 5 秒還沒開始（她坐著等、帶路）才走過去
            n = await pg.evaluate(NPC_JS, who)
            if n:
                walked += 1; tw = time.time(); s3 = s
                log('    [走到她旁邊] 第 %d 次：她在 (%.2f, %.2f) lv%d%s；帶路 %s' % (walked, n['x'], n['z'], n['lv'], '（坐著）' if n['seat'] else '', v['ph']))
                while time.time() - tw < 90:   # CC_02 乙 13：6 秒一段，每段前看 busy／dlg／nb，出現就回主迴圈
                    s3 = await st(pg)
                    if s3['busy'] or s3['dlg'] or s3['nb']: log('    [走路中斷] busy=%s dlg=%s nb=%s（%.2f）' % (s3['busy'], s3['dlg'], s3['nb'], s3['hour'])); break
                    if (await pg.evaluate(LO_BRIEF_JS))['on']: break
                    n = await pg.evaluate(NPC_JS, who) or n
                    if await L.go_to(pg, cdp, R, n['x'], n['z'], 1.6, '走到她旁邊', lv=n['lv'], max_s=6): s3 = await st(pg); break
                if s3['busy'] or s3['dlg'] or s3['nb']: path_seen.append('走向她的途中開始（%s）' % s3['zone']); continue
                s3 = await st(pg)
                if s3['interact'] and (s3['interact'].startswith('坐') or '說話' in s3['interact']) and not s3['dlg']:
                    log('    [按互動鍵] %s' % s3['interact']); path_seen.append('按「%s」' % s3['interact']); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                else: path_seen.append('走到她旁邊（%s）' % s3['zone'])
                continue
        if time.time() - idle_t > 30:   # 沒進展每 30 秒記一次狀態，前兩次截圖（CC_02 乙 4）
            idle_t = time.time(); idle_n += 1
            dg = await pg.evaluate(IDLE_JS, who)
            log('    [等待 %d] 狀態 %s；邀約 %s；%s' % (idle_n, J({k2: s.get(k2) for k2 in ('zone', 'hour', 'busy', 'dlg', 'nb', 'phone', 'interact', 'lv')}), J(v), J(dg)))
            if idle_n <= 2: await R.shot(pg, 'lo_%s_idle%d' % (tag.lower(), idle_n))
        await pg.wait_for_timeout(500)
    else:
        dg = await pg.evaluate(IDLE_JS, who)
        R.note('[%s] 赴約到上限 %d 秒還沒結束：%s' % (tag, MAX_S, J(dg))); await R.shot(pg, 'lo_%s_timeout' % tag.lower())
    v = await pg.evaluate(IV_JS, iv['id'])
    return bool(v and v['st'] == 'done')


# ---------------------------------------------------------------- 判定
def dist(a, b):
    return math.hypot(a[0] - b[0], a[1] - b[1])


def stalls(smp, key, ta, tb):
    """還沒到以前（ta～tb，遊戲時間）任何 STALL_S 秒內移動 < STALL_M 的段落（合併重疊的）"""
    pts = [(s['t'], s[key]) for s in smp if s.get(key) and ta <= s['t'] <= tb]
    out = []; j = 0
    for i in range(len(pts)):
        ti, pi = pts[i]; j = max(j, i)
        while j < len(pts) and pts[j][0] < ti + STALL_S: j += 1
        if j >= len(pts): break
        if dist(pts[j][1], pi) < STALL_M:
            if out and ti <= out[-1][1]: out[-1][1] = pts[j][0]
            else: out.append([ti, pts[j][0], pi[:3]])
    return out


def jumps(smp, key, ta, tb, run):
    out = []; prev = None
    for s in smp:
        if not s.get(key) or s['t'] < ta or s['t'] > tb: continue
        if prev:
            dt = max(s['t'] - prev['t'], 0.0); d = dist(s[key], prev[key])
            if d > max(0.5, run * 1.5 * dt): out.append([prev['t'], s['t'], round(d, 2), prev[key][:3], s[key][:3]])
        prev = s
    return out


def traj(smp, key, ta, tb, step=0.5):
    out = []; nxt = ta
    for s in smp:
        if not s.get(key) or s['t'] < ta or s['t'] > tb: continue
        if s['t'] >= nxt: out.append([round(s['t'] - ta, 1)] + s[key][:3]); nxt = s['t'] + step
    last = [s for s in smp if s.get(key) and ta <= s['t'] <= tb]
    if last and (not out or out[-1][0] != round(last[-1]['t'] - ta, 1)): out.append([round(last[-1]['t'] - ta, 1)] + last[-1][key][:3])
    return out


def analyze(tag, cfg, d, ver, who):
    calls = d.get('calls') or []
    for c in calls:
        R.note('[%s] INV.leadOut 第 %d 次：來源 %s（%s）、區域 %s、她 %s、起身前 你 %s（坐著 %s）／她 %s（坐著 %s）；E.time %s → %s；walkFallbacks %s → %s%s' % (
            tag, c.get('k'), c.get('src'), '探針插的【捷徑】' if c.get('src') == 'inject' else '遊戲自己呼叫', c.get('zone'), c.get('who'), J(c.get('P0')), c.get('pSeat'), J(c.get('n0')), c.get('nSeat'),
            c.get('t0'), c.get('t1'), c.get('fb0'), c.get('fb1'), ('；例外 ' + c['err']) if c.get('err') else ''))
    if cfg['inject']:
        R.note('[%s] ON_STAYED 插入：%s；掛勾錯誤 %s' % (tag, J(d.get('inj')), J(d.get('err'))))
        game_moku = [c for c in calls if c.get('src') == 'game' and c.get('zone') == cfg['zone']]
        if game_moku: R.note('[%s]【觀察】遊戲自己在 %s 也呼叫了 leadOut %d 次（這一版木曜日會自己走到門口了）' % (tag, cfg['zone'], len(game_moku)))
        else: R.note('[%s]【觀察】遊戲自己在 %s 沒有呼叫 leadOut（地點 %s sitAt %s；和讀碼一致：只有總圖走 S.libEnd）' % (tag, cfg['zone'], cfg['pid'], J((ver.get('slowread') or {}).get('sitAt'))))
        pool = [c for c in calls if c.get('src') == 'inject'] or [c for c in calls if c.get('zone') == cfg['zone']]
    else:
        pool = [c for c in calls if c.get('src') == 'game']
    c = pool[0] if pool else None
    tP = next((r for r in (c or {}).get('tg', []) if r.get('who') == 'P'), None)
    tN = next((r for r in (c or {}).get('tg', []) if r.get('who') == 'n'), None)
    if not R.check('[%s] 前置：散場真的走了「一起走到門口」（INV.leadOut 有呼叫，你和她各有一個 GAME.walkTo 目的地）' % tag, bool(c and tP and tN),
                   J({'calls': len(calls), 'tg': (c or {}).get('tg'), 'hasN': (c or {}).get('hasN'), 'inj': d.get('inj')})):
        return
    if c['zone'] != cfg['zone']: R.note('[%s]【說明】這一次的散場在 %s（不是 %s；總圖二樓坐滿改去三樓閱覽區＝區域 library）' % (tag, c['zone'], cfg['zone']))
    sp = c.get('spawn') or {}; lv = sp.get('lv', 0)
    R.note('[%s] 區域出生點 %s；照舊的兩個點（出生點左右各 0.55 m，你在左、她在右）%s' % (tag, J(sp), J(c.get('orig'))))
    if c.get('spotsFn'):
        R.note('[%s] INV.leadOutSpots（用和遊戲一樣的輸入：兩個人起身的位置）＝%s' % (tag, J(c.get('spots'))))
    else:
        R.note('[%s] 頁面沒有 INV.leadOutSpots（修改前的版本）：遊戲用照舊的兩個點（D34：木曜日預期站不住）' % tag)
    R.note('[%s] 遊戲 walkTo 的目的地：你 %s；她 %s' % (tag, J({k: tP.get(k) for k in ('x', 'z', 'lv', 'stand', 'from', 'path')}), J({k: tN.get(k) for k in ('x', 'z', 'lv', 'stand', 'from', 'path')})))
    R.check('[%s] 兩個目標點都站得住（E.canStand 半徑 %.2f、第 %d 層＝出生點那一層）：你 (%.2f, %.2f) %s、她 (%.2f, %.2f) %s' % (
        tag, R_STAND, lv, tP['x'], tP['z'], tP['stand'], tN['x'], tN['z'], tN['stand']), bool(tP['stand'] and tN['stand'] and tP['lv'] == lv and tN['lv'] == lv), J({'orig': c.get('orig')}))
    if c.get('spotsFn') and isinstance(c.get('spots'), list) and len(c['spots']) == 2:
        same = dist([tP['x'], tP['z']], [c['spots'][0]['x'], c['spots'][0]['z']]) < 0.01 and dist([tN['x'], tN['z']], [c['spots'][1]['x'], c['spots'][1]['z']]) < 0.01
        R.check('[%s] 遊戲走的兩個點＝INV.leadOutSpots 選的（你＝第 1 個、她＝第 2 個）' % tag, same, J(c['spots']))
    elif c.get('spotsFn'):
        R.note('[%s] INV.leadOutSpots 回 %s：遊戲退回照舊的兩個點（walkTo 的保險還在）' % (tag, J(c.get('spots'))))
    R.note('[%s] 兩個點相距 %.2f m（S.leadOutSpots 要 ≥ 0.7 m；參考）' % (tag, dist([tP['x'], tP['z']], [tN['x'], tN['z']])))
    smp = [s for s in (d.get('smp') or []) if s.get('k') == c['k']]
    run = ((ver.get('spd') or {}).get('run')) or 6.2
    places = [x for x in (d.get('places') or []) if x.get('k') == c['k']]
    moves = [x for x in (d.get('moves') or []) if x.get('k') == c['k']]
    stand_places = [x for x in places if x.get('phase') == 'stand']
    if stand_places: R.note('[%s] 起身時的 E.placeAt（GM.standUp，不算瞬移）：%s' % (tag, J(stand_places)))
    R.note('[%s] E.moveTo（走路途中，你＝P、她＝n）：%s' % (tag, J(moves)))
    t_end = c['t1'] if c.get('t1') is not None else (smp[-1]['t'] if smp else c['t0'])
    for lab, r, key, wk in (('你', tP, 'p', 'P'), ('她', tN, 'n', 'n')):
        tele = [x for x in places if x.get('who') == wk and x.get('phase') == 'walk']
        tb = r['done'] if r.get('done') is not None else t_end
        arr = (r['done'] - c['t0']) if r.get('done') is not None else None
        de = dist(r['at'], [r['x'], r['z']]) if r.get('at') else None
        R.note('[%s] %s的軌跡（[距開始秒, x, z, 層]，每 0.5 秒遊戲時間）：%s' % (tag, lab, J(traj(smp, key, c['t0'], t_end))))
        R.note('[%s] %s：walkTo 開始 E.time %s、完成 %s（回傳 %s）、停在 %s（離目標 %s m）、路線 %s' % (tag, lab, r.get('t0'), r.get('done'), r.get('ret'), J(r.get('at')), None if de is None else round(de, 2), J(r.get('path'))))
        ok = arr is not None and arr <= LIMIT_S and r.get('ret') is True and de is not None and de <= ARRIVE_M and (r.get('at') or [0, 0, -1])[2] == r['lv'] and not tele
        R.check('[%s] %s %.0f 秒（遊戲時間）內自己走到目標點（walkTo 完成、停在 %.1f m 內、同一層、沒有被 E.placeAt 放過去）：%s' % (
            tag, lab, LIMIT_S, ARRIVE_M, '%.1f 秒' % arr if arr is not None else '沒走完'), ok, J({'tele': tele, 'at': r.get('at'), 'ret': r.get('ret')}))
        # 11-11 雲端修改前第一次跑（LIB）：總圖二樓長桌 → 一樓入口的路線 42～44 m，玩家走路 E.SPD.walk 1.8 m/s、NPC 1.35 m/s（engine3d.js 的 n.walkSpeed||1.35），
        # 物理上就要 24～32 秒，BB 的 15 秒在總圖一定 FAIL。這一行照路線長度從遊戲常數推（CC_02 乙 8）：路線長／速度×1.5＋2 秒（起身、轉彎、最後一步），分開「路太長」和「卡住」
        spd = ((ver.get('spd') or {}).get('walk') or 1.8) if key == 'p' else 1.35
        plen = (r.get('path') or {}).get('len') if isinstance(r.get('path'), dict) else None
        lim2 = (plen / spd * 1.5 + 2.0) if plen else None
        R.check('[%s] %s照路線長度的時間內走到（路線 %s m ÷ %.2f m/s ×1.5＋2＝%s 秒；實際 %s）' % (
            tag, lab, plen, spd, None if lim2 is None else round(lim2, 1), '%.1f 秒' % arr if arr is not None else '沒走完'),
            lim2 is not None and arr is not None and arr <= lim2 and r.get('ret') is True and not tele, J({'15 秒以內': arr is not None and arr <= LIMIT_S}))
        sl = stalls(smp, key, r.get('t0') or c['t0'], tb)
        R.check('[%s] %s走到以前沒有卡住或原地走（%.0f 秒遊戲時間內移動 < %.2f m 的段落：%d 段）' % (tag, lab, STALL_S, STALL_M, len(sl)), not sl,
                J([[round(a - c['t0'], 1), round(b - c['t0'], 1), p] for a, b, p in sl[:6]]))
        jp = jumps(smp, key, r.get('t0') or c['t0'], tb, run)
        R.check('[%s] %s的軌跡沒有瞬移（相鄰兩格 > max(0.5, %.1f×1.5×dt) m）' % (tag, lab, run), not jp, J(jp[:5]))
    fb0, fb1 = c.get('fb0') or 0, c.get('fb1') if c.get('fb1') is not None else d.get('fbNow')
    tele_all = [x for x in places if x.get('phase') == 'walk']
    bad_mv = [x for x in moves if not x.get('ok')]
    R.check('[%s] GAME.walkFallbacks 沒有增加（%s → %s）、走路途中沒有 E.placeAt 放過去、E.moveTo 都找得到路' % (tag, fb0, fb1), fb1 == fb0 and not tele_all and not bad_mv, J({'placeAt': tele_all, 'moveTo false': bad_mv}))
    other = [m for m in moves if m.get('who') == 'n' and not (abs(m['x'] - tN['x']) < 0.01 and abs(m['z'] - tN['z']) < 0.01)]
    if other: R.note('[%s]【觀察】走到門口途中她另外被叫去別的地方（E.moveTo，不是 leadOut 的點）：%s' % (tag, J(other[:5])))
    R.note('[%s] 走到門口用了 E.time %.1f 秒、真實 %.0f 秒；兩個人都在點上 0.6 m 內：E.time %s' % (
        tag, t_end - c['t0'], ((c.get('w1') or 0) - (c.get('w0') or 0)) / 1000.0 if c.get('w1') else -1, d.get('near')))


async def run_part(pg, cdp, errs, tag, ver):
    cfg = PART_CFG[tag]; e0 = len(errs)
    pk = await choose(pg, cdp, tag, cfg)
    if not R.check('[%s] 前置：找得到人、日子、她會答應的時間（地點 %s）' % (tag, cfg['pid']), bool(pk)): return
    s = pk['setup']; who = pk['who']
    R.setup('[%s] 讀檔（GAME.applySave、關條件事件／手機自動打開）：宿舍、%s（第 %d 天，週%s）10:00、晴天、錢 3000；%s 的聯絡方式；關係 %s → 第 %s 階；升階門檻台詞記成說過 %d 則；BEATS.last＝今天；STUDYN[%s]＝第 1 場（STUDYN.pick %s）；dating %s' % (
        tag, pk['key'], pk['cal']['d'], '日一二三四五六'[pk['cal']['wd']], who, J(REL2), s.get('stage'), s.get('ups', 0), who, J(s.get('studyN')), J(s.get('dating'))))
    if cfg['visit']: R.setup('[%s]【前置】G.visited.%s＝true（地點 %s 要去過才列；原本 %s）' % (tag, cfg['visit'], cfg['pid'], s.get('visited0')))
    if cfg['moku']: R.setup('[%s]【前置】G.mokuyobi.first＝14 天前（第一次進門那一段不演；原本 %s）' % (tag, J(s.get('mokuFirst0'))))
    R.note('[%s] 地點 %s：%s；時間 %s（她會答應）；掛勾 %s' % (tag, cfg['pid'], J(pk['place']), J(pk['time']), pk.get('lo')))
    await pg.evaluate(HOOK_JS); await pg.evaluate(LO_RESET_JS)
    screen = []; path_seen = []
    iv = await invite(pg, cdp, tag, pk, screen)
    if not R.check('[%s] 手機約成了：%s「%s」%s' % (tag, who, pk['place'].get('verbStudy') or pk['place']['verb'], pk['time']['t']), bool(iv), J(iv)):
        await R.shot(pg, 'lo_%s_invite_fail' % tag.lower()); return
    if cfg['inject']:
        await pg.evaluate(LO_ARM_JS, iv['id'])
        R.setup('[%s]【捷徑】遊戲在木曜日念書不走「一起走到門口」：在 INV.ON_STAYED（時間過去以後、收書道別以前，兩個人還坐在念書的座位上）呼叫遊戲自己的 INV.leadOut 一次（只這一次約 %s；INV.sitRule 說遊戲自己會帶路就不插）' % (tag, iv['id']))
    ok = await go_meet(pg, cdp, tag, who, iv, screen, path_seen)
    await R.shot(pg, 'lo_%s_end' % tag.lower())
    R.note('[%s] 走的路：%s' % (tag, ' → '.join(path_seen) or '（沒有記到）'))
    R.check('[%s] 赴約演完（邀約 done）' % tag, ok, J(await pg.evaluate(IV_JS, iv['id'])))
    d = await pg.evaluate(LO_GET_JS)
    try:
        json.dump({'tag': tag, 'sha': SHA, 'who': who, 'pick': pk, 'iv': iv, 'path': path_seen, 'screen': screen, 'lo': d, 'ver': ver},
                  open(os.path.join(OUT, 'leadout_%s.json' % tag.lower()), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    except Exception as ex:
        R.note('[%s] 寫 JSON 失敗：%r' % (tag, ex))
    analyze(tag, cfg, d, ver, who)
    R.check('[%s] 沒有 JS 例外（pageerror）' % tag, len(errs) == e0, J(errs[e0:e0 + 5]))


async def main():
    log('# CC LEADOUT %s SHA=%s PARTS=%s WHO=%s MAX_S=%d URL=%s' % (time.strftime('%Y-%m-%d %H:%M:%S'), SHA or '（沒給）', ','.join(PARTS), ','.join(WHO), MAX_S, URL))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg)):
            await b.close(); return R.finish()
        vs = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        ver = await pg.evaluate(VER_JS)
        R.note('版本字樣 %s；%s' % (vs, J(ver)))
        if not R.check('前置：不是 ?turbo（turbo 會讓 walkTo 直接放到目的地，測不到走路）', not ver.get('turbo') and 'turbo' not in URL, URL):
            await b.close(); return R.finish()
        if not ver.get('spotsFn'):
            R.note('【D34】頁面沒有 INV.leadOutSpots＝修改前的版本：預期 MOKU 的「站得住」「自己走到」「walkFallbacks」FAIL（兩個點在牆裡、靠保險），LIB 照舊 PASS')
        for part in PARTS:
            log('== %s' % part); t0 = time.time()
            if part not in PART_CFG:
                R.check('認得 PARTS「%s」' % part, False); continue
            try:
                await run_part(pg, cdp, errs, part, ver)
            except Exception:
                import traceback
                R.check('[%s] 探針沒有例外' % part, False, traceback.format_exc()[-900:])
                try: await R.shot(pg, 'lo_%s_exception' % part.lower())
                except Exception: pass
            log('  [%s] 用了 %.0f 秒' % (part, time.time() - t0))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
