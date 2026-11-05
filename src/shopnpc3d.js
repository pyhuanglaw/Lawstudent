/* ===== 新店面裡遇得到有名字的人（AA_705 第一批：大一上；SHOP-NAMED-NPC-1105，USER_WANTS X251）=====
   使用者 11-05 08:4x（對 LAWWW-C）：「現在店面新增很多 裡面要遇的到NPC喔 可攻略不可攻略的都要」。企劃 AA_705 @ ebea3a2b0（AA-C 定，D109）。
   表在 src/data/shop_npc.js（SHOP_NPC.rows）。做法：
   - 作息（STORY.SCHED_X，排在所有作息的最後面）：那一列的星期、時段、學期（大一上）、週次（第 2 週起；雙數週、指定週）、店開著（PLACES.isOpen：颱風天、店休照店）＝
     她在那間店（站在 at、坐 seat、坐在地上）。**跟原本的作息撞到，原本的優先**（AA_705 開頭）：她這個時間原本有作息（上課、社課、打工、讀書會、回老家、約好的事、
     在 Café／總圖讀書、在外面……，含別的模組加的）＝這一次不出現，不另外挪；只有作息表裡單純「在某一區走走」（wander／walk、沒有劇情標記）不算撞到（S.soft）。
     撞到的次數 tests/shop_npc_unit.js 會列出來（AA 要那張表）。
     經濟系那一年沒有（AA_705 是法律系大一上）。人不在臺北、國外、休學照 presence（schedFor 先看）。語彤認識以前（YT_MET_JOB）不在（STORY.schedEnt 的規則）。
   - 學姊一週最多一次（AA_596 第八節；AA_705「給 LAWWW」）：山嵐（雙數週週六）那一週的週三青木那一次有出現＝山嵐那一次不出現（只留青木）。
   - Alison（南洋戲院）：她原本的作息「在南洋戲院打工」（週五、週六 18:00～23:00，AA_661 第 30 列、AA_615 第 4 節）＝人在戲院大廳櫃檯後面（NY3.CLERK）。
     遇到她、送爆米花（AA_615 第 4 節）：玩家走到櫃檯前（她 2.6 m 內）、認識 Alison＝第一次那一段（選項兩個、拿到一桶爆米花＝G.flags.NY_POPCORN）；
     之後一學期最多一次：隨機一句（三句）；有 KNOWS_SIS_ALISON、這學期還沒說過＝一半的機會換成姊姊那一句（也是一學期一次）。
     沒做：「和朋友一起來（柏翰、阿凱那一場撞到她的班）」——遊戲裡還沒有和朋友一起去看電影的流程；人物頁「打工：南洋戲院」那一行——人物頁沒有寫打工的欄位；
           看電影時旁白多一句「（爆米花吃到第二部就沒了。）」——1 廳的「坐下看電影」還沒接（SHOPNPC.popcorn(G)＝今天拿到爆米花，接的時候讀）。
   - 子晴（同弦）：「聽一句」照 AA_619 第 1 節的偶遇（src/guitar3d.js，已有）；偶遇演完（她拿了一包弦就走）那一天就不在店裡了。
   - 聽一句（其他列）：玩家走到她旁邊（2.5 m、同一層）、認識她（STORY.knows）、沒在演、沒在對話＝畫面下方一句字幕（GM.caption；旁白或她說的一句，照稿一字不差）。
     **每個人每學期一次**（同一個人兩列〔學姊、子晴〕合起來算一次）；之後照一般的「和她說話」（閒聊階梯照舊），這裡不加新的閒聊。不認識的人照樣在那裡，沒有聽一句。
     存檔：G.flags.SHOPNPC_HEAR＝{學期:{人物:那一天}}、G.flags.NY_ALISON＝{first:那一天, terms:{學期:那一天}, sis:{學期:那一天}}、G.flags.NY_POPCORN＝那一天（舊存檔沒有＝沒聽過、沒遇過）。
   - 位子：坐的列照配置檔的那一張；有人坐了、或那一張是今天留給約好的兩個人的那一組（CROWD.shopKeepSeats）＝挑同一層最近的空位（也避開那一組）。
     學姊坐在山嵐二樓的地上（跪坐那一套，sitAt 的 floor）；她在的時候那一個「坐在法律區看書」的按鈕藏起來。
   測試：node tests/shop_npc_unit.js */
'use strict';
const SHOPNPC=(function(){
  const S={};
  const D=()=>typeof SHOP_NPC!=='undefined'?SHOP_NPC:{rows:[],alison:{}};
  S.TERM='Y1S1'; S.WEEK_MIN=2; S.HEAR_R=2.5; S.ALISON_R=2.6; S.CAP_MS=4800;
  const termOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null;
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;
  const hr=G=>(+G.hour||0)%24;
  const econ=G=>!!G&&((G.stage||'law')==='econ'||(typeof STORY!=='undefined'&&STORY.isEcon&&STORY.isEcon(G)));
  const hash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const isOpen=(z,h,d)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(z,h,d);
  S.rows=()=>D().rows||[];
  S.row=id=>S.rows().find(r=>r.id===id)||null;
  S.ALISON_AWAY='在南洋戲院打工';

  /* ---------- 作息 ---------- */
  let guard=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shopnpc3d:guard']=()=>{ guard=false; };
  /* 她原本的作息（不算這裡加的）*/
  S.base=function(c,G){ if(typeof STORY==='undefined'||!STORY.schedEnt||!c) return null; const g=guard; guard=true; try{ return STORY.schedEnt(c,G); }catch(e){ return null; } finally { guard=g; } };
  /* 這一列的日曆條件（不看原本的作息）：星期、時段、學期、週次、考試週、店開著 */
  S.calOk=function(G,row,day,h){ if(day==null) day=G.day|0; if(h==null) h=hr(G); if(econ(G)) return false;
    const wd=wdOf(day); if(!row.days.includes(wd)||h<row.from||h>=row.to) return false;
    const T=termOf(day); if(!T||T.id!==S.TERM) return false;
    if(Array.isArray(row.weeks)){ if(!row.weeks.includes(T.week)) return false; } else { if(T.week<S.WEEK_MIN) return false; if(row.weeks==='even'&&T.week%2!==0) return false; if(row.weeks==='odd'&&T.week%2!==1) return false; }
    if(row.noExam&&T.exam) return false;
    if(row.dateFrom&&typeof STORY!=='undefined'&&STORY.dayOfKey){ const d0=STORY.dayOfKey(row.dateFrom); if(d0!=null&&day<d0) return false; }
    if(!isOpen(row.zone,h,day)) return false;
    return true; };
  /* 假的 G（同一個存檔、別的時間）：只換日期、時間、星期 */
  const at=(G,day,h)=>Object.assign({},G,{day,hour:h,weekday:wdOf(day)});
  /* 撞到原本的作息＝原本的優先。只有一種不算撞到：作息表（characters.js）裡那一筆只是「在某一區走走」（act wander／walk、在遊戲的場景裡），
     沒有劇情的標記（pri、talkEvent、spot、activity、cls、invite、enc、with、if 條件、只有幾天的 dates）——那是空檔，不是安排（照 BB_260 第 1 節「只填空檔」同一個標準）。
     上課、社課、打工、讀書會、回老家（presence）、約好的事、在 Café／總圖讀書、在外面（away）、別的模組加的作息（SCHED_X）全部都是撞到。
     S.YIELD_ACTS 改成 [] ＝連「走走」也算撞到（AA_705 字面上最嚴的讀法）。*/
  S.YIELD_ACTS=['wander','walk'];
  S.soft=function(c,b){ if(!b||!c||!Array.isArray(c.daily_schedule)||!c.daily_schedule.includes(b)) return false; if(b.zone==null||!S.YIELD_ACTS.includes(b.act)) return false;
    if(b.pri||b.talkEvent||b.spot||b.activity||b.actHours||b.cls||b.invite||b.enc||b.with||b.if||b.shopEnc||b.exlib) return false;   /* taipei:'both'（子晴週末下午在公館走走）照樣是走走 */
    if(Array.isArray(b.dates)&&b.dates.length&&typeof STORY!=='undefined'&&STORY.dayOfKey&&b.dates.every(r=>{ const a=STORY.dayOfKey(r[0]), z=STORY.dayOfKey(r[1]); return a!=null&&z!=null&&z-a<7; })) return false;
    return true; };
  S.clash=function(G,row,c){ c=c||(typeof CHARACTERS!=='undefined'&&CHARACTERS[row.who]); const b=S.base(c,G); return b&&!S.soft(c,b)?b:null; };
  /* 這一列現在成立嗎（日曆＋沒撞到＋學姊一週一次＋各人的規則）；why：給測試看的原因 */
  S.on=function(G,row,why){ const no=w=>{ if(why) why.push(w); return false; };
    if(row.hearBy==='alison') return no('alison');   /* Alison 照她原本的打工作息（S.alisonEnt）*/
    if(!S.calOk(G,row)) return no('cal');
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[row.who]; if(!c) return no('nochar');
    if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(row.who,G); if(pr&&pr.here===false) return no('presence'); }
    if(row.hearBy==='guitar'&&G.guitar&&typeof G.guitar==='object'&&G.guitar.enc===(G.day|0)) return no('guitar_done');   /* 偶遇演完：她拿了一包弦就走 */
    const b=S.clash(G,row,c); if(b) return no('clash');
    if(row.sisWeek){ const q=S.rows().find(r=>r.who===row.who&&r!==row&&!r.sisWeek); if(q){ const T=termOf(G.day); for(let d=G.day-6;d<=G.day+6;d++){ if(d===G.day) continue; const t=termOf(d); if(!t||!T||t.id!==T.id||t.week!==T.week) continue; if(!q.days.includes(wdOf(d))) continue; const h=(q.from+q.to)/2; const g2=at(G,d,h); if(S.on(g2,q)) return no('sis_week'); } } }   /* 同一週青木那一次有出現＝只留青木 */
    return true; };
  /* 位子 */
  const seatMemo=new Map();
  const curGM=G=>{ const GM=typeof GAME!=='undefined'&&GAME&&GAME.G===G?GAME:lastGM; return GM&&GM.G===G&&GM.E&&GM.E.zone?GM:null; };
  const occupied=(E,st,self)=>{ for(const n of E.npcs||[]){ if(!n||n===self) continue; const q=n.seat||n.seatTarget; if(q&&Math.hypot(q.x-st.x,q.z-st.z)<0.12&&((q.lv|0)===(st.lv|0))) return true; } const P=E.player; if(P&&P.seat&&Math.hypot(P.seat.x-st.x,P.seat.z-st.z)<0.12) return true; return !!st.taken; };
  S.keepSeats=G=>{ try{ return typeof CROWD!=='undefined'&&CROWD.shopKeepSeats?CROWD.shopKeepSeats(G)||[]:[]; }catch(e){ return []; } };
  /* 配置的那一張；有人坐、留給約好的人那一組＝同一層最近的空位（也不坐那一組）；區域沒載入＝配置的那一張 */
  S.seatFor=function(G,row){ const [x,z,lv]=row.seat, GM=curGM(G); if(!GM||G.zone!==row.zone) return {x,z,lv:lv|0};
    const E=GM.E, seats=(E.zone.seats||[]).filter(s=>(s.lv|0)===(lv|0)&&!s.npcOnly), keep=S.keepSeats(G), isKeep=s=>keep.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.12);
    const self=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(row.who):null;
    const k=(G.day|0)+'|'+row.id, m=seatMemo.get(k); if(m&&!occupied(E,m,self)&&!isKeep(m)) return m;
    const best=seats.filter(s=>!occupied(E,s,self)&&!isKeep(s)).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
    const o=best?{x:best.x,z:best.z,lv:lv|0}:{x,z,lv:lv|0}; if(seatMemo.size>100) seatMemo.clear(); seatMemo.set(k,o); return o; };
  /* 作息那一筆（同一天、同一個位子回傳同一個物件）*/
  const entMemo=new Map();
  S.entry=function(G,row){ const wd=G.weekday!=null?G.weekday:wdOf(G.day); let key, mk;
    if(row.pose==='seat'){ const s=S.seatFor(G,row); key=[row.id,G.day|0,s.x,s.z].join('|'); mk=()=>({days:[wd],from:row.from,to:row.to,zone:row.zone,act:row.act==='eat'?'eat':(row.act==='sit'?'sit':'read'),seatAt:[s.x,s.z,s.lv],noPair:true,shopNpc:row.id,note:'AA_705 '+row.shop}); }
    else if(row.pose==='floor'){ key=[row.id,G.day|0].join('|'); mk=()=>({days:[wd],from:row.from,to:row.to,zone:row.zone,act:'read',spot:'shopnpc_'+row.id,noPair:true,shopNpc:row.id,note:'AA_705 '+row.shop}); }
    else { key=[row.id,G.day|0].join('|'); mk=()=>({days:[wd],from:row.from,to:row.to,zone:row.zone,act:'linger',at:row.at.slice(),noPair:true,shopNpc:row.id,note:'AA_705 '+row.shop}); }
    let e=entMemo.get(key); if(!e){ if(entMemo.size>200) entMemo.clear(); e=mk(); entMemo.set(key,e); } return e; };
  /* Alison：原本的作息是「在南洋戲院打工」＝人在大廳櫃檯後面 */
  S.alisonEnt=function(c,G){ const row=S.rows().find(r=>r.hearBy==='alison'); if(!row||econ(G)) return null; const b=S.base(c,G); if(!b||b.away!==S.ALISON_AWAY||b.zone!=null) return null;
    if(!isOpen(row.zone,hr(G),G.day|0)) return null;
    const key='alison|'+(G.day|0)+'|'+b.from+'|'+b.to; let e=entMemo.get(key); if(!e){ e=Object.assign({},b,{zone:row.zone,act:'linger',at:row.at.slice(),away:undefined,noPair:true,shopNpc:row.id,note:'AA_705 南洋戲院（她原本的打工作息，AA_661 第 30 列）'}); delete e.away; entMemo.set(key,e); } return e; };
  S.sched=function(c,G){ if(guard||!c||!c.id||!G||typeof CALENDAR==='undefined') return null;
    if(c.id==='yu') return S.alisonEnt(c,G);
    for(const row of S.rows()){ if(row.who!==c.id||row.hearBy==='alison') continue; if(!row.days.includes(G.weekday!=null?G.weekday:wdOf(G.day))) continue; const h=hr(G); if(h<row.from||h>=row.to) continue;
      if(S.on(G,row)) return S.entry(G,row); }
    return null; };
  /* 這個人現在照這張表在哪一列（測試、聽一句用）*/
  S.rowNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.shopNpc?S.row(e.shopNpc):null; };

  /* ---------- 坐在地上的位子（區域的 spots；populateSchedule 的 spot）----------*/
  S.spotsFor=function(E,zoneId){ if(!E||!E.zone) return; for(const row of S.rows()){ if(row.pose!=='floor'||row.zone!==zoneId) continue; const sp=E.zone.spots||(E.zone.spots={}); const [x,z,yaw,lv]=row.at; sp['shopnpc_'+row.id]={x,z,yaw,lv}; } };
  /* 生出來以後坐到地上（floor）、那一個坐地板的按鈕藏起來 */
  S.fixFloor=function(GM){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!E.zone) return;
    for(const row of S.rows()){ if(row.pose!=='floor'||row.zone!==G.zone) continue; const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(row.who):null; if(!n||!n.seat) continue; const [x,z,yaw,lv]=row.at;
      if(Math.hypot(n.seat.x-x,n.seat.z-z)>0.15) continue;
      if(!n.seat.floor&&GM.sitAt){ GM.sitAt(n,{x,z,yaw,lv:lv|0,floor:0.02}); n.pose=n.idlePose='sit'; }
      for(const it of E.interactables||[]){ if(!it||!it.shlSit||it._shopNpc||Math.hypot(it.x-x,it.z-z)>0.15) continue; const d0=Object.getOwnPropertyDescriptor(it,'hidden')||{value:false};
        const who=row.who; Object.defineProperty(it,'hidden',{configurable:true,enumerable:true,get(){ const m=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(who):null; const occ=!!(m&&m.seat&&!m.leaving&&Math.hypot(m.seat.x-x,m.seat.z-z)<0.15); return occ||(d0.get?!!d0.get.call(it):!!d0.value); }}); it._shopNpc=true; } } };

  /* ---------- 聽一句 ---------- */
  const F_=G=>G.flags||(G.flags={});
  const knows=(id,G)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):!!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET'));
  S.heard=function(G,id){ const T=termOf(G.day), H=(G.flags||{}).SHOPNPC_HEAR; return !!(T&&H&&H[T.id]&&H[T.id][id]!=null); };
  S.markHeard=function(G,id){ const T=termOf(G.day); if(!T) return; const F=F_(G); if(!F.SHOPNPC_HEAR||typeof F.SHOPNPC_HEAR!=='object') F.SHOPNPC_HEAR={}; const R=F.SHOPNPC_HEAR[T.id]||(F.SHOPNPC_HEAR[T.id]={}); R[id]=G.day|0; };
  const sceneFree=GM=>{ const E=GM.E, pl=E&&E.player; if(!pl||!pl.obj||pl.busy) return false; if(GM.D&&(GM.D.active||(GM.D.busyDepth|0)>0)) return false; if(typeof ADV!=='undefined'&&ADV.active) return false; if(typeof EVENTS!=='undefined'&&EVENTS.running) return false; return true; };
  const near=(GM,n,r)=>{ const pl=GM.E.player, p=pl.obj.position, q=n&&!n.hidden&&n.obj&&n.obj.visible!==false&&n.obj.position; return !!q&&(n.lv|0)===(pl.lv|0)&&Math.hypot(q.x-p.x,q.z-p.z)<=r; };
  /* 現在可以聽的那一列：{row,n} */
  S.hearDue=function(GM){ const G=GM&&GM.G; if(!G||!GM.E||!GM.E.player||econ(G)) return null;
    for(const row of S.rows()){ if(row.zone!==G.zone||!row.hear) continue; if(S.heard(G,row.who)||!knows(row.who,G)) continue; const r=S.rowNow(G,row.who); if(r!==row) continue;
      const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(row.who):null; if(!n||n.leaving||!near(GM,n,S.HEAR_R)) continue; return {row,n}; }
    return null; };
  S.nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.npcName?SOCIAL.npcName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  S.hear=function(GM){ const G=GM.G; if(!sceneFree(GM)) return false; const HC=typeof HCIRCLE!=='undefined'&&HCIRCLE?HCIRCLE:null; if(HC&&HC._capBusy) return false;
    const d=S.hearDue(GM); if(!d) return false; S.markHeard(G,d.row.who); const h=d.row.hear;
    if(GM.caption){ GM.caption(h.who?S.nameOf(h.who):'',h.t,S.CAP_MS); if(HC){ HC._capBusy=true; setTimeout(()=>{ HC._capBusy=false; },S.CAP_MS); } }
    return true; };

  /* ---------- Alison：遇到她、送爆米花（AA_615 第 4 節）---------- */
  S.YU='yu';
  S.ny=G=>{ const F=F_(G); let r=F.NY_ALISON; if(!r||typeof r!=='object') r=F.NY_ALISON={first:null,terms:{},sis:{}}; if(!r.terms) r.terms={}; if(!r.sis) r.sis={}; return r; };
  S.popcorn=G=>!!G&&!!G.flags&&G.flags.NY_POPCORN===(G.day|0);
  S.alisonDue=function(GM){ const G=GM&&GM.G; if(!G||G.zone!=='xs_nanyang'||econ(G)||!knows(S.YU,G)) return false; const T=termOf(G.day); if(!T) return false;
    const r=(G.flags||{}).NY_ALISON; if(r&&r.terms&&r.terms[T.id]!=null) return false;
    const e=typeof CHARACTERS!=='undefined'&&CHARACTERS.yu&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(CHARACTERS.yu,G):null; if(!e||e.zone!=='xs_nanyang') return false;
    const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(S.YU):null; return !!n&&!n.leaving&&near(GM,n,S.ALISON_R); };
  /* 這一次演哪一段：'first'｜'sis'｜第幾句（0～2）*/
  S.alisonPick=function(G){ const r=(G.flags||{}).NY_ALISON, T=termOf(G.day); if(!r||r.first==null) return 'first';
    const F=G.flags||{}; if(F.KNOWS_SIS_ALISON&&T&&!(r.sis&&r.sis[T.id]!=null)&&hash('nysis|'+G.day)%2===0) return 'sis';
    return hash('nyagain|'+G.day)%(D().alison.again||[1]).length; };
  S.alisonLines=function(G,pick){ const A=D().alison||{}; if(pick==='first') return A.first.map(l=>Object.assign({},l)); if(pick==='sis') return [{speaker:S.YU,text:A.sis}]; const nr=A.againNarr&&A.againNarr[pick]; return (nr?[{speaker:null,text:nr}]:[]).concat([{speaker:S.YU,text:A.again[pick]}]); };
  S.alison=async function(GM){ const G=GM.G, T=termOf(G.day), r=S.ny(G), pick=S.alisonPick(G);
    r.terms[T.id]=G.day|0; if(pick==='first') r.first=G.day|0; if(pick==='sis') r.sis[T.id]=G.day|0;
    GM.sceneBegin({adv:{charId:S.YU,expression:'neutral'}}); try{ await EVENTS.runLines(S.alisonLines(G,pick),{id:'shopnpc_alison',participants:[S.YU]}); } finally { GM.sceneEnd(); }
    if(pick==='first') F_(G).NY_POPCORN=G.day|0;
    if(GM.autosave) GM.autosave(); return true; };

  /* ---------- 每 0.5 秒（STORY.TICKS）---------- */
  let lastGM=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shopnpc3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!GM.E) return false; lastGM=GM; try{ S.fixFloor(GM); }catch(e){ console.warn('SHOPNPC.fixFloor',e); }
    if(busy||GM.titleIdle) return false;
    if(sceneFree(GM)&&S.alisonDue(GM)){ busy=true; S.alison(GM).catch(e=>console.warn('SHOPNPC.alison',e)).finally(()=>{ busy=false; }); return true; }
    try{ S.hear(GM); }catch(e){ console.warn('SHOPNPC.hear',e); }
    return false; };   /* 字幕不擋後面的 TICKS */

  /* ---------- 掛上去 ---------- */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.SCHED_X)&&!STORY._shopNpcSched){ STORY.SCHED_X.push(S.sched); STORY._shopNpcSched=true; }   /* 最後面：前面別的模組加的作息（約好的、店內偶遇、讀書…）都比這裡優先 */
    if(Array.isArray(STORY.TICKS)&&!STORY._shopNpcTick){ STORY.TICKS.push(S.tick); STORY._shopNpcTick=true; }
    if(STORY.populate&&!STORY._shopNpcPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ lastGM=GM||lastGM;
        try{ if(GM&&GM.E) S.spotsFor(GM.E,zoneId); }catch(e){ console.warn('SHOPNPC.spots',e); }
        const r=p0.apply(this,arguments);
        try{ if(GM&&GM.E) S.fixFloor(GM); }catch(e){ console.warn('SHOPNPC.fixFloor',e); }
        return r; }; STORY._shopNpcPop=true; } }
  S._bindGM=GM=>{ lastGM=GM; };
  S._reset=()=>{ guard=false; busy=false; seatMemo.clear(); entMemo.clear(); };
  return S;
})();
