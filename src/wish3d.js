/* ===== 校外約會的心願事件（DATE-C4、DATE-C5；AA_127 第 1、2 節、BB_128 第 3 節；資料 src/data/date_wish.js＝tools/date/import_wish.py 照白名單匯入）=====
   七位各有一個心願地點（DATE.wishOf）。「第一次和她單獨去她的心願地點」整趟換成心願事件（抵達、固定活動、四個互動點、收尾一定播），不管哪一年都算完成（AA_128 第 6 節）；
   第二次以後照地點檔的一般反應（date3d.js）。玩家知道心願的兩種方式（使用者 2026-10-14 決策第四節）：
     1. 聊天提到（mention）：她和祐廷在校園約出來見面（INV.meet：Café、總圖、麵店、溫州街……）的時候，條件到了就說一次；DATE.knowWish（README 的 WISH_KNOWN＝dateLog 的 wishKnown）。
     2. 她主動約（herInvite）：手機訊息（每學期最多一次、被拒絕以後至少隔 4 週、寒暑假與考試週不約；她有伴侶、她知道祐廷有伴侶時不約＝AA_128 4-5）。
        答應＝建立校外約會（by:'her'，wish:true）；這週不行＝不扣分、不鎖線。訊息本身就說了她想去哪，所以收到就算知道。
   玩家自己約她去心願地點（date3d.js 的 S.menu）：她回 playerInvite 的 known／unknown（還不知道的這一次也算完成心願）。
   hold（DATE_WISH.hold）：台詞和現行人物設定衝突的人整場先不播、手機也不約——照舊走一般的第一次約會（心願照樣算完成）。AA_426（企劃線 967b4273a）改稿以後七位都沒有 hold。
   條件（README 的 dateStage、datingHer、term、termFrom、unless、courseWeek、freeVisited＋EVENTS 的 flags、events、memory、any、flagIs）在 S.cond；企劃的暫名照遊戲實際的 id（S.EV_ALIAS、S.EV_FN、S.FLAG_FN）。
   存檔：G.dateLog[id].wishAsk＝{term, day, date, depart, transport, state}（她主動約的那一次）；旗標 WISH_DONE_<id>、WISH_ASK_<id>；記憶照 record.memory。舊存檔沒有＝沒約過（不追溯）。
   測試：node tests/date_wish_unit.js */
'use strict';
const WISH=(function(){
  const S={};
  const W=()=>typeof DATE_WISH!=='undefined'?DATE_WISH:{events:{},hold:{}};
  const DT=()=>typeof DATE!=='undefined'?DATE:null;
  S.ev=id=>((W().events||{})[id])||null;
  S.held=id=>!!((W().hold||{})[id]);
  S.live=id=>!!S.ev(id)&&!S.held(id);
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);

  /* ---------- 條件 ---------- */
  const ORDER=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2','Y5S1'];
  S.term=G=>{ if(typeof STORY!=='undefined'&&STORY.termAt) return STORY.termAt(G.day); const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return t?t.id:null; };   /* 寒暑假算前一個學期；畢業以後算大四下 */
  /* 企劃的暫名 → 遊戲實際的（README「暫名」那幾個）*/
  S.EV_ALIAS={ev_yutong_free_thursday:'ev_yt_thursday_free'};   /* 語彤事件 13「空出來的週四」（r2y3a_events.js）*/
  S.EV_FN={ev_an_admin_answer:G=>S.weekDone(G,'admin_law',12)};   /* 以安新 9「我要改我的答案」＝大二上行政法第 12 週的課堂（syllabus.js admin_law w12 的 react），上過那一週就算 */
  S.FLAG_FN={
    SIS_BEEN_US:G=>{ const d=dk('2028-12-23'); return d!=null&&G.day>=d; },   /* 學姊去過美國以後（暫名）：她 2028-12-23 回來（characters.js 的 absentDates，BB_204）*/
    KX_TRIP_DEFERRED_DONE:G=>{ const F=G.flags||{}; if(G.events&&G.events.done&&G.events.done.ev_kexin_trip_summer_y2) return true; if(!F.KX_TRIP_DEFERRED) return false; const d=STORY.termDay?STORY.termDay('Y2S1',1,1):null; return d!=null&&G.day>=d; } };   /* K8 延到暑假那一趟走完：春假沒去、延期（KX_TRIP_DEFERRED）的那個暑假過了，或大二暑假的高雄兩天演過（AA_432 確認這樣算，企劃線 1ced2f8b3）*/
  const evDone=(G,e)=>{ if(S.EV_FN[e]) return !!S.EV_FN[e](G); const x=S.EV_ALIAS[e]||e; return !!(G.events&&G.events.done&&G.events.done[x]); };
  const flagOn=(G,f)=>S.FLAG_FN[f]?!!S.FLAG_FN[f](G):!!(G.flags&&G.flags[f]!=null&&G.flags[f]!==false);
  /* 那門課的第幾週已經上過（以安：憲法（上）第 6 週＝人身自由）：照日曆，那一週那堂課結束以後 */
  S.weekDone=function(G,course,week){ const c=typeof COURSES!=='undefined'&&(COURSES.list||[]).find(x=>x.id===course); if(!c||typeof STORY==='undefined'||!STORY.termDay) return false;
    const s=(c.slots||[])[0]||{wd:1,block:'am'}, d=STORY.termDay(c.term,week,s.wd); if(d==null) return false; const b=(COURSES.blocks||{})[s.block]||{t1:12.2}; return G.day>d||(G.day===d&&(G.hour%24)>=b.t1); };
  S.cond=function(G,id,c){ if(!c||typeof c!=='object') return true; const F=G.flags||{};
    for(const k in c){ const v=c[k];
      if(k==='dateStage'){ const st=DT()&&DT().stageNum?DT().stageNum(id):0; if(v.min!=null&&st<v.min) return false; if(v.max!=null&&st>v.max) return false; }
      else if(k==='datingHer'){ if(dating(G,id)!==!!v) return false; }
      else if(k==='term'){ if(![].concat(v).includes(S.term(G))) return false; }
      else if(k==='termFrom'){ if(ORDER.indexOf(S.term(G))<ORDER.indexOf(v)) return false; }
      else if(k==='unless'){ if(S.cond(G,id,v)) return false; }
      else if(k==='any'){ if(!(v||[]).some(x=>S.cond(G,id,x))) return false; }
      else if(k==='events'){ if(!(v||[]).every(e=>evDone(G,e))) return false; }
      else if(k==='notEvents'){ if((v||[]).some(e=>evDone(G,e))) return false; }
      else if(k==='flags'){ if(!(v||[]).every(f=>flagOn(G,f))) return false; }
      else if(k==='notFlags'){ if((v||[]).some(f=>flagOn(G,f))) return false; }
      else if(k==='flagIs'){ for(const f in v) if(F[f]!==v[f]) return false; }
      else if(k==='memory'){ if(!(v||[]).every(m=>typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(m.npc||id,m.tag))) return false; }
      else if(k==='courseWeek'){ if(!S.weekDone(G,v.course,v.week)) return false; }
      else if(k==='freeVisited'){ const P=G.places&&G.places.free; if(!P||(P[v]|0)<1) return false; }   /* 玩家自己（自由出行）去過那個地方（AA_160 4-4）*/
    }
    return true; };
  /* 選項、換句的條件：有 if 用 if；沒有 if 的（芷若 D05.garden 的 replyIf）＝這一筆本身除了台詞的欄位就是條件 */
  const NOT_COND=['reply','lines','note','text','code','t','insertAfter','replace'];
  const cOf=x=>{ if(!x) return null; if('if' in x) return x.if; const o={}; for(const k in x) if(!NOT_COND.includes(k)) o[k]=x[k]; return o; };
  S.pickIf=(G,id,arr)=>(arr||[]).find(x=>S.cond(G,id,cOf(x)))||null;

  /* ---------- 台詞 ---------- */
  /* 真實片名（AA_313 6-2）：《東京物語》照 SOCIAL.filmRename，資料存稿上原文，顯示時才換（芷若的影展那一句 AA_426 已經改成不寫導演）*/
  S.fill=function(t,o){ let s=String(t); if(typeof SOCIAL!=='undefined'&&SOCIAL.filmRename) s=SOCIAL.filmRename(s); if(o&&o.depart!=null) s=s.replace(/\{出發時間\}/g,hm(o.depart)); return s; };
  S.say=async function(GM,id,lines,who,o){ const G=GM.G;
    for(const ln of (lines||[])){ if(!ln||ln.who==='note') continue; const tx=S.fill(ln.text,o);
      if(ln.who==='narr') await GM.say(null,/^（/.test(tx)?tx:'（'+tx+'）');
      else if(ln.who==='player'||ln.who==='you') await GM.say({name:G.name||'祐廷'},tx);
      else if(ln.who===id) await GM.say(who,tx);
      else await GM.say({name:nameOf(ln.who),charId:ln.who},tx); } };
  /* 選項：if 不成立的不列；textIf＝選項的字和回話一起換；replyIf＝換回話（第一個成立的）；extraIf＝回話後面多說（成立的都說）；memory＝記；cost／extra＝選了才扣 */
  S.choose=async function(GM,id,choices,who,o){ const G=GM.G;
    const C=(choices||[]).filter(c=>S.cond(G,id,c.if)).map(c=>{ const ti=S.pickIf(G,id,c.textIf); return ti?Object.assign({},c,{t:ti.text,reply:ti.reply||c.reply}):c; });
    if(!C.length) return null; const k=await GM.choose(C.map(c=>({t:S.fill(c.t,o)}))), c=C[k]||C[0];
    const ri=S.pickIf(G,id,c.replyIf); await S.say(GM,id,ri?ri.reply:c.reply,who,o);
    for(const x of (c.extraIf||[])) if(S.cond(G,id,cOf(x))) await S.say(GM,id,x.lines||x.reply,who,o);
    if(c.memory) S.mem(id,c.memory);
    const pay=(c.cost|0)+(c.extra|0); if(pay&&GM.money) GM.money(-pay,S.fill(c.t).replace(/[「」]/g,''));
    return c; };
  S.mem=function(id,m){ if(!m||!m.tag||typeof SOCIAL==='undefined') return; if(SOCIAL.MEMORY_LABEL&&m.text&&!SOCIAL.MEMORY_LABEL[m.tag]) SOCIAL.MEMORY_LABEL[m.tag]=m.text; if(SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(id,m.tag))) SOCIAL.remember(id,m.tag,''); };
  /* 人物頁的記憶名稱：record.memory、選項的 memory 的 text（AA、BB 寫的「記憶的說明」）；已經有的不蓋 */
  S.labels=function(){ if(typeof SOCIAL==='undefined'||!SOCIAL.MEMORY_LABEL) return; const L=SOCIAL.MEMORY_LABEL, put=m=>{ if(m&&m.tag&&m.text&&!L[m.tag]) L[m.tag]=m.text; };
    const walk=o=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object'){ if(o.memory&&o.memory.tag) put(o.memory); for(const k in o) if(k!=='memory') walk(o[k]); } };
    for(const id in (W().events||{})) walk(S.ev(id)); };
  S.labels();

  /* ---------- 她在不在（聊天提到、她主動約）---------- */
  S.BLOCK={classmate_peishan:[['2026-12-17','2027-08-06']]};   /* 沛珊聯絡不到的日子（使用者定：2026-12-17～2027-08-06；characters.js 的 absentDates 從 12-18 起）*/
  S.here=function(G,id){ const P=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):{here:true}; if(P&&P.here===false) return false;   /* 國外（芷若英國、以安日本、學姊美國）、老家、聯絡不到＝不提、不約 */
    for(const [a,b] of (S.BLOCK[id]||[])){ const x=dk(a), y=dk(b); if(x!=null&&y!=null&&G.day>=x&&G.day<=y) return false; }
    const D=DT(); if(D&&D.noNorthOn&&D.noNorthOn(G,id,G.day)) return false;   /* 沛珊大三起不上來：同一個心願改在台南・美術館（hometown3d.js，AA_349 K3）*/
    return true; };
  S.done=(G,id)=>!!(G.flags&&G.flags['WISH_DONE_'+id])||!!(DT()&&DT().log&&DT().log(G,id).wish);
  S.known=(G,id)=>!!(DT()&&DT().log&&DT().log(G,id).wishKnown);
  S.learn=function(G,id){ if(DT()&&DT().knowWish) DT().knowWish(G,id); };   /* 知道心願＝DATE 的 wishKnown（人物頁的提示「她提過想去……」；同 hometown3d.js 的 museumKnown，不另外記一條沒有名稱的記憶）*/

  /* ---------- 1. 聊天提到 ---------- */
  S.mentionDue=function(G,id){ const ev=S.ev(id); if(!ev||S.held(id)||!ev.mention||S.done(G,id)||S.known(G,id)||!S.here(G,id)) return false; return S.cond(G,id,ev.mention.if); };
  S.mention=async function(GM,id,who){ const G=GM.G, M=S.ev(id).mention, li=S.pickIf(G,id,M.linesIf);
    if(li) await S.say(GM,id,li.lines,who);   /* 整段換成這一版（以安大二下以後：沒有選項）*/
    else { await S.say(GM,id,M.lines,who); if(M.choices) await S.choose(GM,id,M.choices,who); await S.say(GM,id,M.after,who); }
    for(const x of (M.extraIf||[])) if(S.cond(G,id,cOf(x))) await S.say(GM,id,x.lines,who);
    S.learn(G,id); return true; };
  /* invites3d.js 的 S.meet：校園約出來見面、那一段演完以後（道別句以前）*/
  S.meetMention=async function(GM,iv,who){ const G=GM.G; if(!iv||!S.mentionDue(G,iv.who)) return false; return S.mention(GM,iv.who,who); };

  /* ---------- 2. 她主動約（手機）---------- */
  /* 訊息哪一天傳：有 message 照寫的（以安週三四 19:00～22:30、語彤週三四五 20:30～23:00、芷若週三四打烊後）；沒寫的＝約的那天往前三天的 21:00～22:30（週六→週三、週日→週四）*/
  S.msgDays=I=>I.message&&I.message.weekday?I.message.weekday:[...new Set([].concat(I.dateWeekday||[6]).map(w=>(w+4)%7))];
  S.msgTime=I=>(I.message&&I.message.time)||[21,22.5];
  S.nextDay=function(G,wds){ const W=[].concat(wds||[6]); for(let k=1;k<=7;k++){ const d=G.day+k, wd=CALENDAR.dateOf(d).wd%7; if(W.includes(wd)) return d; } return null; };
  /* 約的時間（出發時間）：數字；'sunset-2'＝淡水日落前兩小時（DATE.sunset，取到半點）*/
  S.departOf=function(dt,day){ if(typeof dt==='number') return dt; const m=/^sunset-(\d+(?:\.\d+)?)$/.exec(String(dt||'')); if(m&&DT()&&DT().sunsetH){ const h=DT().sunsetH(day); if(h!=null) return Math.floor((h-+m[1])*2)/2; } if(m&&DT()&&DT().sunset){ const s=DT().sunset(day), p=/^(\d+):(\d+)$/.exec(s||''); if(p) return Math.floor((+p[1]+ +p[2]/60-+m[1])*2)/2; } return 14; };
  S.transOf=function(id,loc,I){ const D=DT(), T=((D.loc(loc)||{}).transport||[]).map(x=>x.mode); const want=I&&I.transport==='train'?'rail':(I&&I.transport); if(want&&T.includes(want)) return want; const p=D.prefOf?D.prefOf(id,loc):null; return p&&T.includes(p)?p:T[0]; };
  /* AA_128 4-5：她自己有伴侶、她知道祐廷有伴侶、她在等你說清楚＝不約；她就是祐廷的女友＝照常 */
  S.willing=function(G,id){ if(dating(G,id)) return true; const D=DT(); if(D.canAskCore&&!D.canAskCore(G,id).ok) return false; if(typeof ROM!=='undefined'&&ROM.knows&&ROM.knows(G,id).length) return false; return true; };
  const P_=(id,t,o)=>({th:'p:'+id,from:id,text:S.fill(t,o)});
  const spoken=L=>(L||[]).filter(l=>l&&l.who!=='note'&&l.who!=='narr');
  S.askRule=function(G,id){ const ev=S.ev(id), I=ev&&ev.herInvite; if(!I||S.held(id)||S.done(G,id)) return false; const D=DT(), lg=D.log(G,id), A=lg.wishAsk;
    if(A&&A.state==='sent') return false;   /* 還沒回 */
    const T=CALENDAR.termOf(G.day); if(!T) return false;   /* 寒暑假不約 */
    const tag='wish_ask_'+id+'_'+T.id; if(PHONE.sent(G,tag)) return false;   /* 每學期最多一次（BB_128 第 3 節共同規則）*/
    if(A&&A.day!=null&&G.day-A.day<28) return false;   /* 被拒絕以後至少隔 4 週 */
    const wd=CALENDAR.dateOf(G.day).wd%7, tm=S.msgTime(I), h=G.hour%24; if(!S.msgDays(I).includes(wd)||h<tm[0]||h>=tm[1]) return false;
    if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,id)) return false;
    if(!S.cond(G,id,I.if)||!S.willing(G,id)||!S.here(G,id)) return false;
    const day=S.nextDay(G,I.dateWeekday); if(day==null) return false; const T2=CALENDAR.termOf(day); if(!T2||(I.notExamWeek&&T2.exam)) return false;   /* 約的那天：學期中、不是考試週 */
    if(!S.here(Object.assign({},G,{day}),id)) return false;   /* 那一天她在臺北 */
    const loc=ev.loc, depart=S.departOf(I.dateTime,day), tr=S.transOf(id,loc,I), c=D.check(G,{who:id,locs:[loc],day,depart,transport:tr}); if(!c.ok) return false;   /* 祐廷那天有空、錢夠、她那時候沒課沒班 */
    const o={depart}, base=(S.pickIf(G,id,I.linesIf)||I).lines, items=spoken(base).map(l=>P_(id,l.text,o)); if(!items.length) return false;
    items[items.length-1].ask={id:tag,until:day*24,opts:[{t:'答應',post:false,say:spoken(I.accept).map(l=>P_(id,l.text,o)),set:{['WISH_ASK_'+id]:'yes'}},{t:'這週不行',post:false,say:spoken(I.decline).map(l=>P_(id,l.text,o)),set:{['WISH_ASK_'+id]:'no'}}]};   /* 選項照稿的「答應」「這週不行」，祐廷不另外說一句（同 hometown3d.js 沛珊的台南美術館）；約的那天 0:00 以前要回 */
    if(G.flags) delete G.flags['WISH_ASK_'+id];
    lg.wishAsk={term:T.id,day:G.day,date:day,depart,transport:tr,state:'sent'}; PHONE.at(G,G.day,h,items,tag); S.learn(G,id); return true; };
  /* 回了以後：答應＝訂下那一趟（by:'her'）；這週不行＝不扣分；沒回、約的那天過了＝作罷 */
  S.askBook=function(G,id){ const D=DT(), lg=D.log(G,id), A=lg.wishAsk; if(!A||A.state!=='sent') return; const f=G.flags&&G.flags['WISH_ASK_'+id];
    if(f==='no'){ A.state='no'; return; }
    if(f!=='yes'){ if(G.day>A.date||(G.day===A.date&&(G.hour%24)>A.depart)) A.state='expired'; return; }
    const t=D.book(G,{who:id,locs:[S.ev(id).loc],day:A.date,depart:A.depart,transport:A.transport,by:'her'}); if(!t.ok){ A.state='fail'; A.why=t.why||''; return; }
    const tr=D.trip(G,t.trip); if(tr) tr.wish=true; A.state='booked'; A.trip=t.trip; };
  S.phone=function(G){ if(!G||!G.flags||(G.stage||'law')!=='law'||typeof PHONE==='undefined'||!DT()||typeof CALENDAR==='undefined') return; DT().rec(G);
    for(const id of Object.keys(W().events||{})){ try{ S.askBook(G,id); S.askRule(G,id); }catch(e){ console.warn('WISH phone',id,e); } } };

  /* ---------- 3. 玩家約她去（date3d.js 的 S.menu，訂好以後）：她回的那幾句 ---------- */
  S.playerLines=function(G,id,loc){ const ev=S.ev(id); if(!ev||S.held(id)||ev.loc!==loc||S.done(G,id)||!ev.playerInvite) return null; const P=ev.playerInvite;
    if(P.if&&!S.cond(G,id,P.if)) return null; const L=(S.known(G,id)?P.known:P.unknown)||[]; if(!L.length) return null;
    const out=L.slice(); for(const x of (P.extraIf||[])) if(S.cond(G,id,cOf(x))) out.push(...(x.lines||[])); return out; };
  S.sayInvite=async function(GM,id,lines,n){ const D=DT(); for(const ln of lines){ if(!ln||ln.who==='note') continue; if(ln.who==='narr'){ const tx=S.fill(ln.text); await GM.say(null,/^（/.test(tx)?tx:'（'+tx+'）'); } else await D.sayLines(GM,id,[S.fill(ln.text)],n); } };   /* 旁白不傳到手機 */

  /* ---------- 4. 那一天（date3d.js 的 S.scene：心願本人第一次去她的心願地點）---------- */
  S.due=function(G,t){ const D=DT(); if(!D||!t||t.kind==='overnight'||!S.HEROINES_OK(t.who)||(D.wishTripOk&&!D.wishTripOk(t))) return false;   /* 芯慈：只有午夜場（DATE.MIDNIGHT）才是心願那一場 */ const loc=(t.locs||[])[0], ev=S.ev(t.who); if(!ev||S.held(t.who)||ev.loc!==loc||D.wishOf(t.who)!==loc) return false; return !S.done(G,t.who); };
  S.HEROINES_OK=id=>!!(DT()&&(DT().HEROINES||[]).includes(id));
  S.spot=async function(GM,t,ev,pid,who){ const G=GM.G, id=t.who, H=ev.hotspots[pid], li=S.pickIf(G,id,H.linesIf); await S.say(GM,id,li?li.lines:H.lines,who); if(H.memory) S.mem(id,H.memory); if(H.choices&&H.choices.length) await S.choose(GM,id,H.choices,who); };
  S.closing=async function(GM,t,ev,who){ const G=GM.G, id=t.who, C=ev.closing||{}, li=S.pickIf(G,id,C.linesIf); let L=((li?li.lines:C.lines)||[]).slice();
    for(const x of (C.timeline||[])){ if(!S.cond(G,id,cOf(x))) continue; if(x.replace){ for(const old in x.replace){ const i=L.findIndex(l=>l&&l.text===old); if(i>=0) L.splice(i,1,...x.replace[old]); } } else if(x.insertAfter!=null) L.splice(x.insertAfter,0,...(x.lines||[])); }   /* 時間線：insertAfter＝第 N 行後面插入；replace＝把那一句換成這幾句 */
    await S.say(GM,id,L,who); if(C.choices&&C.choices.length) await S.choose(GM,id,C.choices,who);
    for(const x of (C.after||[])) if(S.cond(G,id,cOf(x))) await S.say(GM,id,x.lines,who);   /* 成立的都說，照順序 */
    const en=S.pickIf(G,id,C.ending); if(en) await S.say(GM,id,en.lines,who); };   /* 依關係的結尾：第一個成立的 */
  S.record=function(G,t,ev){ const id=t.who, R=ev.record||{}; if(R.flag) G.flags[R.flag]=true; if(R.memory) S.mem(id,R.memory); S.learn(G,id);
    if(R.album&&typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'wish_'+id,R.album,(DT().bgKey&&DT().bgKey(ev.loc))||''); };   /* Life Album：照稿的那一張（沒有人，或交往中的合照）*/
  S.scene=async function(GM,q,t){ const G=GM.G, D=DT(), id=t.who, ev=S.ev(id), loc=t.locs[0], L=D.loc(loc), who={name:nameOf(id),charId:id};
    const visits=(D.log(G,id).byLoc[loc]|0), tr=D.travel(loc,t.transport)||{minutes:30}; let endH=t.day*24+t.back-tr.minutes/60; const spots=[], m0=G.money|0, pts=D.points(loc);
    await GM.say(null,'（'+L.name+'。）'); if(L.admission&&GM.money) GM.money(-L.admission,L.name+' 門票');
    const A=ev.arrive||{}; if(A.narr) await S.say(GM,id,[{who:'narr',text:A.narr}],who); await S.say(GM,id,A.lines,who);
    for(const x of (A.extraIf||[])) if(S.cond(G,id,cOf(x))) await S.say(GM,id,x.lines,who);   /* 關係那一句（交往中、第 6 階單身互斥）、你來過一次……成立的都說 */
    if(ev.fixed){ const lf=(D.fixedOf&&D.fixedOf(loc))||null; await S.say(GM,id,ev.fixed.lines,who); if(GM.advance) GM.advance((ev.fixed.minutes|0)/60); endH+=Math.max(0,(ev.fixed.minutes|0)-((lf&&lf.minutes)|0))/60; if(lf&&(lf.cost|0)>0&&GM.money) GM.money(-(lf.cost|0),L.name+' '+lf.label); }   /* 固定活動（芷若：看電影 120 分，不算互動點，也不吃掉互動點的時間：回程跟著晚——地點資料的 fixed 已經算進回程（DATE.plan），這裡只補多出來的；電影票照地點資料扣（稿：「票各自付（AA_128 定價）」）*/
    const HS=Object.keys(ev.hotspots||{});
    for(let n=0;n<4;n++){ const now=G.day*24+G.hour, left=HS.filter(p=>!spots.includes(p)); if(!left.length) break;
      const opts=left.map(p=>{ const h=ev.hotspots[p], rw=D.spotOff?D.spotOff(G,p):(D.rainOff?D.rainOff(G,p):''); return {t:h.name,hint:(h.minutes|0)+' 分'+(h.cost?'　'+h.cost+' 元':''),dis:!!rw||now+(h.minutes|0)/60>endH,why:rw||'時間差不多了'}; }).concat([{t:n?'差不多了，回去吧':'就這樣回去'}]);   /* 下雨停用的互動點（淡水長椅「椅子是濕的」，DATE.rainOff）同一般約會 */
      const k=await GM.choose(opts.map(o=>o.dis?{t:o.t,hint:o.why,dim:true}:o)); if(k>=left.length) break; if(opts[k].dis){ if(GM.toast) GM.toast(opts[k].why); n--; continue; }
      const pid=left[k], h=ev.hotspots[pid]; spots.push(pid); await S.spot(GM,t,ev,pid,who); if(GM.advance) GM.advance((h.minutes|0)/60); if(h.cost&&GM.money) GM.money(-h.cost,h.name);
      const lk=h.like||(D.likeOf?D.likeOf(id,pid):'normal'); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&D.LIKE&&D.LIKE[lk]&&Object.keys(D.LIKE[lk]).length) SOCIAL.adjust(id,D.LIKE[lk]);
      if(spots.length===3&&HS.length>3&&D.speak) await D.speak(GM,id,'enough',t,{obj:null}); }   /* 第三個互動點之後她說一句「差不多了」（不分地點的句子，同一般約會）*/
    t.spots=spots; const m=D.mem(G,id,loc); m.last=spots.slice(); for(const p of spots) if(!m.picks.includes(p)) m.picks.push(p);
    if(!spots.length){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:1}); t.status='cancelled'; if(!(D.speak&&await D.speak(GM,id,'leaveEarly',t,{obj:null}))) await GM.say(who,'……就這樣？'); return {counted:false}; }   /* 一個都沒做就走：同一般約會（不算次數、心願還沒完成，下次再去還是心願事件）*/
    if(ev.fixedAfter){ const lf=(D.fixedOf&&D.fixedOf(loc))||null; await S.say(GM,id,ev.fixedAfter.lines||[],who); if(GM.advance) GM.advance(((ev.fixedAfter.minutes!=null?ev.fixedAfter.minutes:(lf&&lf.minutes))|0)/60); if(lf&&(lf.cost|0)>0&&GM.money) GM.money(-(lf.cost|0),L.name+' '+lf.label); }   /* 互動點之後的固定活動（芯慈的午夜場：先吃宵夜、選片，再看電影；AA_537b 8-2）*/
    await S.closing(GM,t,ev,who);   /* 收尾：心願場景，第一次一定播 */
    S.record(G,t,ev);
    return D.settle(GM,t,spots,pts,visits,m0); };   /* 結算照 AA_128 5-3（正式校外約會＋第一次心願的加成：DATE.settle 的 firstWish）*/

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();
