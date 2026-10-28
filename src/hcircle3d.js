/* ===== 女主角的圈子在 3D（HEROINE-CIRCLE3D-1028；AA_503 第 2 節、第 11 節第 2、3 點＋AA_503～508 各位那一節的「x-1 圈子」表；
   使用者 2026-10-28 01:2x 對 LAWWW-C「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）=====
   資料（每一列：什麼時候、和誰、在哪、走近時聽到）在 src/data/heroine_circle.js（HCIRCLE_DATA；句子照稿一字不差，「A：…／B：…」原樣存，載入時拆開）。
   ■ 作息加 with（AA_503 第 2 節）：表上要「補一筆」的作息（HCIRCLE_DATA.SCHED）載入時放進 CHARACTERS[她].daily_schedule 最前面（越前面越優先），帶 with:[同伴]、hc:列的 id。
   ■ 同伴在哪（STORY.SCHED_WITH：story3d.js schedEnt 在 pri 那幾筆之後問）：這一列成立（她照作息在那一區、時間學期週次日期條件都對、她在、一定同框或那一天擲到 70%）的時候，
     同伴是人物（CHARACTERS）、而且他自己的作息不在那一區＝回傳一筆跟著她的作息（進區域生成、待在區域裡補人、時段結束離開、手機「現在大概在」都照這一筆）；他本來就在那一區＝照他自己的。
     同班同學的必修課、約好的時間、麵店團出遊、pri 那幾筆照舊優先（schedEnt 前面那幾段）。
   ■ 站在她旁邊（S.arrange：進區域時在 pairUp 之前〔STORY.PRE_PAIR〕，待在區域裡每秒一次〔STORY.TICKS〕）：
     她坐著＝同伴坐離她最近的空位（同一排、同一桌優先）；她站著（linger、吧檯、顧店、社課）＝站在她旁邊、面向她；她在走＝一起走（pairUp 的 buddy）。
     anchor 'with'（必修課上課前和曾靖雯）＝倒過來：她坐到曾靖雯旁邊。表上「和誰」不是人物的（小婷、阿姨、學姊的同學…）＝標籤＋固定的路人底模（HCIRCLE_DATA.PEOPLE）；
     Café 的小婷／老闆／新來的工讀生站吧檯店員的位置、麵店的阿姨站語彤旁邊，原本那位無名的店員先藏起來（她就是那位店員），走了再出來。
     「一個人」的列＝她不和別人配對（noPair，pairUp 跳過）。她照作息要站在某一點（SCHED 的 at）、可是用舊的劇情人物生出來在別處走（大道上的以安）＝走過去站好，那一列結束再走開。
   ■ 走近時聽到（S.tick）：玩家走到她 5 m 內（同一層、同一間），同伴在她旁邊（3.2 m 內），那一列的句子一句一句出字幕（GM.caption），一列一天一次（once 的列整個存檔一次）；
     必修課那幾列只在上課以前。玩家沒聽到就直接找她說話＝先在對話框演那幾句（S.before，包在她的 talk 外面：talkCharacter、talkAn、talkSis 都一樣），再照常說話。
   ■ 第一次介紹（AA_503 第 2 節）：稿沒寫介紹的句子＝不加台詞，用名牌：第一次在同伴旁邊找她說話，同伴如果是二十位同學（pool_*）還沒認識的，就在這裡認識
     （SOCIAL.meet；第一批五位照 POOL.afterMeet〔熟悉＋3 信任＋3，同他自己那一場〕，其他十五位同他們舊的自我介紹熟悉＋3）——之後不再演他自己的認識那一場，
     他頭上、字幕上的名字從外觀描述換成名字。其他人只記下介紹過（G.flags.HCIRCLE.intro）。
   ■ 旁邊有人的時候（STORY.COMPANY，story3d.js offerInvite 問）：同伴在她 3.2 m 內＝「約她去…」和 priv 的一次性選項（告白：multirel3d.js）不出；交換聯絡方式、閒聊照常。
   存檔：G.flags.HCIRCLE＝{heard:{列:那一天}, once:{列:那一天}, intro:{同伴:那一天}}；舊存檔沒有＝從那時起。
   測試：node tests/heroine_circle3d_unit.js */
/* ■ 第二輪（2026-10-28）：
     CIRCLE3D-Y4-1028（AA_509、AA_510）：只有旁白的同框列（以安和語彤週四總圖三樓）＝同伴也要在她旁邊才聽到（S.together）；
       spot 的列（AA_509 3-1 總圖門口的媽媽，只有旁白）＝走到那個地點 5 m 內就出旁白（S.SPOTS、S.hearDue；不生人物、不在她旁邊聽、不配對）；
       comp 的 behind（anchor 'with'）＝她坐到同伴背後那一桌（S.behindOf、S.seatNear；「以安坐在語彤後面那桌」）。
     COMPANY-PRIV-1028：旁邊有人（S.company → STORY.COMPANY）＝私密的不出、不演、不前進，等她一個人；各入口問 STORY.privNow，清單在 src/privtalk3d.js（PRIVTALK.LIST）。 */
'use strict';
const HCIRCLE=(function(){
  const S={};
  const D=typeof HCIRCLE_DATA!=='undefined'?HCIRCLE_DATA:{NAMES:{},PEOPLE:{},ROWS:[],SCHED:[]};
  S.D=D;
  const ROWS=D.ROWS||[], PEOPLE=D.PEOPLE||{}, NAMES=D.NAMES||{}, SCHED=D.SCHED||[];
  S.ROWS=ROWS; S.PEOPLE=PEOPLE;
  S.P=0.7;   /* 沒寫「一定同框」的列：照 pairUp 的 70%（同一天同一列擲一次，出去再進來一樣）*/
  S.HEAR_R=5; S.NEAR_R=3.2; S.CAP_MS=3400; S.CAP_GAP=3600;
  let GMr=null; S.bind=gm=>{ if(gm) GMr=gm; return GMr; };
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const isChar=id=>typeof CHARACTERS!=='undefined'&&!!CHARACTERS[id];
  const isLabel=id=>!!PEOPLE[id];
  const hash=str=>{ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const range=(a,b)=>{ const o=[]; for(let i=a;i<=b;i++) o.push(i); return o; };
  S.later=(fn,ms)=>setTimeout(fn,ms);   /* 字幕的下一句（測試換成同步的）*/
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.HCIRCLE; if(!R||typeof R!=='object') R=F.HCIRCLE={}; for(const k of ['heard','once','intro']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };

  /* ---------- 句子：「A：…／B：…」→ [{id,label,t}]；整格是（…）＝旁白 ---------- */
  S.parse=function(raw){ if(typeof raw!=='string'||!raw) return []; if(/^（[^／]*）$/.test(raw)) return [{id:null,label:null,t:raw}];
    return raw.split('／').map(p=>{ const m=/^([^：（]+)：([\s\S]*)$/.exec(p); if(!m) return {id:null,label:null,t:p}; return {id:NAMES[m[1]]||null,label:m[1],t:m[2]}; }); };
  for(const r of ROWS){ if(r.wk&&!r.weeks) r.weeks=range(r.wk[0],r.wk[1]); }
  for(const r of ROWS){ const src=r.heardFrom?ROWS.find(q=>q.id===r.heardFrom):null; r.lines=(r.ref&&!r.heardFrom)?[]:S.parse(src?src.heard:r.heard); }
  /* 這一列在 3D 裡做什麼：有同伴（with）＝同框；一個人（alone）＝只有旁白；ref 沒有 with、沒有 heardFrom＝只有作息（或照現有，什麼都不做）*/
  const live=r=>!!((r.with&&r.with.length)||r.alone);
  const BY_WHO={}, BY_COMP={};
  for(const r of ROWS){ if(!live(r)) continue; (BY_WHO[r.who]||(BY_WHO[r.who]=[])).push(r); for(const c of (r.with||[])) if(!isLabel(c)) (BY_COMP[c]||(BY_COMP[c]=[])).push(r); }
  S.BY_WHO=BY_WHO; S.BY_COMP=BY_COMP;
  /* spot＝只有旁白、在某個地點聽到的列（AA_509 3-1 第二列：總圖門口的媽媽，不生 3D 人物）：[[區域,x,z,層],…]；她照作息在 zone（不在她旁邊聽，不配對、不進 BY_WHO）*/
  const SPOTS=ROWS.filter(r=>r.spot&&r.spot.length);
  S.SPOTS=SPOTS;
  S.row=id=>ROWS.find(r=>r.id===id)||null;

  /* ---------- 條件 ---------- */
  S.COND={
    metZjw:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('pool_7','FIRST_MET'),   /* AA_503 4-1「祐廷認識曾靖雯以後」*/
    /* 沛珊和柏翰那一段（同 heard3d.js HEARD.COND.psBohan：characters.js 沛珊的 partner、STORY.partnerOn；玩家和沛珊交往＝沒有）*/
    psBohan:G=>{ const c=isChar('classmate_peishan')?CHARACTERS.classmate_peishan:null; if(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn) return !!STORY.partnerOn(G,c.partner); return !(G.flags&&G.flags.dating_classmate_peishan); },
    psAfterBohan:G=>!(G.flags&&G.flags.dating_classmate_peishan)&&!S.COND.psBohan(G),   /* AA_505 6-1「和柏翰分開以後」*/
    beforePlgRules:G=>!(G.events&&G.events.done&&G.events.done.ev_plg_rules)   /* AA_505 1-1「只在第 7 週以前說」（ev_plg_rules：Alison 撕掉一半）*/
  };

  /* ---------- 這一列現在成立嗎 ---------- */
  S.timeOk=function(r,G){ const h=hr(G);
    if(r.days&&!r.days.includes(G.weekday)) return false;
    if(r.from!=null&&!(h>=r.from&&h<r.to)) return false;
    const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
    if(r.terms&&!(T&&r.terms.includes(T.id))) return false;
    if(r.weeks&&!(T&&r.weeks.includes(T.week))) return false;
    if(r.dates&&!(typeof STORY!=='undefined'&&STORY.inDates&&STORY.inDates(G,r.dates))) return false;
    if(r.cond&&!(S.COND[r.cond]&&S.COND[r.cond](G))) return false;
    return true; };
  const guard=new Set();
  /* 她（或他）照作息現在那一筆（schedEnt；自己在算的時候不再進來）*/
  S.entOf=function(id,G){ if(guard.has(id)||typeof STORY==='undefined'||!STORY.schedEnt||!isChar(id)) return null; guard.add(id); try{ return STORY.schedEnt(CHARACTERS[id],G); } finally { guard.delete(id); } };
  /* 她照作息在那一區、那個動作，而且照進區域生成的規則該出現（schedFor：presence、舊劇情人物的 afternoonDone、跟著玩家走的不算）*/
  S.heroEnt=function(r,G){ const e=S.entOf(r.who,G); if(!e||e.zone==null||e.invite) return null; if(r.zone&&e.zone!==r.zone) return null; if(r.act&&e.act!==r.act) return null;   /* invite：和玩家約好、一起走過去的那一段（src/invites3d.js INV.entryFor）＝她在陪你，不是她自己的生活 */
    if(typeof STORY!=='undefined'&&STORY.schedInZone){ if(guard.has(r.who)) return null; guard.add(r.who); try{ if(!STORY.schedInZone(r.who,e.zone,G)) return null; } finally { guard.delete(r.who); } }
    return e; };
  /* 必修課上課前（cls）：她那一堂（classmateClass：from＝上課前 15 分鐘）上課前 10 分鐘到下課；pm＝下午的課；wkFrom＝第幾週起 */
  S.clsOk=function(r,G,e){ if(!e||e.act!=='class'||!e.cls) return false; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||(r.terms&&!r.terms.includes(T.id))) return false;
    if(r.wkFrom&&T.week<r.wkFrom) return false; const t0=e.from+0.25, h=hr(G); if(r.pm&&t0<12) return false; if(h<t0-1/6||h>=e.to) return false;
    if(r.cond&&!(S.COND[r.cond]&&S.COND[r.cond](G))) return false; return true; };
  S.clsT0=e=>e?e.from+0.25:null;
  S.roll=(r,G)=>((hash(r.id+'|'+G.day)%1000)/1000)<S.P;
  S.on=function(r,G,zone){ if(!law(G)||!(live(r)||r.spot)) return false;
    if(r.once){ const R=S.rec(G); if(R.once[r.id]!=null&&R.once[r.id]!==G.day) return false; }   /* once：聽過的那一天以後就沒有這一列 */
    if(!r.cls&&!S.timeOk(r,G)) return false;
    const e=S.heroEnt(r,G); if(!e) return false; if(zone&&e.zone!==zone) return false;
    if(r.cls&&!S.clsOk(r,G,e)) return false;
    if(!r.alone&&!r.spot&&!r.always&&!S.roll(r,G)) return false;
    return true; };
  S.rowsIn=function(G,zone){ const out=[]; for(const who in BY_WHO) for(const r of BY_WHO[who]) if(S.on(r,G,zone)) out.push(r); return out; };

  /* ---------- 同伴跟著她（STORY.SCHED_WITH）---------- */
  const SEAT_ACTS=['read','eat','sit','class'];
  const CLUB_AT=[[-2.1,3.6],[-3.9,3.6],[-3,4.5]];   /* 萬才館大廳社課（CLUB_SPOTS 第一個 (-3,3.6) 的兩旁；S.arrange 再照她實際的位置站好）*/
  const MIR=new Map();
  S.natural=function(c,G,hit,L,T){ for(const ent of L) if(ent.terms&&T&&ent.terms.includes(T.id)&&hit(ent)) return ent; for(const ent of L) if(!ent.terms&&hit(ent)) return ent; return null; };
  S.mirror=function(c,G,hit,L,T){ const id=c&&c.id, rs=id&&BY_COMP[id]; if(!rs||!law(G)||guard.has(id)) return null; const h=hr(G);
    for(const r of rs){ if(r.days&&!r.days.includes(G.weekday)) continue; if(r.from!=null&&!(h>=r.from&&h<r.to)) continue;
      guard.add(id); let ok=false, e=null; try{ ok=S.on(r,G); e=ok?S.heroEnt(r,G):null; } finally { guard.delete(id); }
      if(!ok||!e) continue;
      if(typeof STORY!=='undefined'&&STORY.reachable&&!STORY.reachable(id,G)) continue;   /* 他不在臺北（回老家、出國）*/
      const nat=hit&&L?S.natural(c,G,hit,L,T):null; if(nat&&nat.zone===e.zone) return null;   /* 他本來就在那一區：照他自己的 */
      return S.mirrorEnt(r,e,id,G); }
    return null; };
  S.mirrorEnt=function(r,e,id,G){ const k=r.id+'|'+id+'|'+G.day, m0=MIR.get(k); if(m0&&m0.zone===e.zone) return m0;
    const ix=Math.max(0,(r.with||[]).indexOf(id));
    const act=SEAT_ACTS.includes(e.act)?(e.act==='class'?'read':e.act):(e.act==='wander'?'wander':'linger');
    let at=null; if(act==='linger'){ const ca=r.compAt&&r.compAt[ix]; if(ca) at=[ca[0],ca[1],ca[2]||0,0]; else if(e.at){ const y=e.at[2]||0, a=ix%2?-1:1; at=[+(e.at[0]+Math.cos(y)*0.95*a).toFixed(2),+(e.at[1]-Math.sin(y)*0.95*a).toFixed(2),y+Math.PI*(a>0?-0.5:0.5),e.at[3]|0]; } else if(e.act==='club'){ const q=CLUB_AT[ix%CLUB_AT.length]; at=[q[0],q[1],0,0]; } }
    const from=r.cls?e.from:Math.max(r.from!=null?r.from:e.from,e.from), to=r.cls?e.to:Math.min(r.to!=null?r.to:e.to,e.to);
    const c=isChar(id)?CHARACTERS[id]:null, desc=c&&(c.poolClass&&c.poolClass.desc||((c.daily_schedule||[]).find(q=>q&&q.desc)||{}).desc)||null;
    const m={days:[G.weekday],from,to,zone:e.zone,act,hc:r.id,with:r.who};
    if(e.label) m.label=e.label;   /* 手機「現在大概在」（STORY.whereIs）：照她那一筆的地點說法（萬才館門口、霖澤館門口…），不寫和誰（還沒認識她的玩家不露名字）*/
    if(at) m.at=at; if(e.room&&act!=='linger') m.room=e.room; if(desc) m.desc=desc; if(act==='linger'&&!at){ m.act='circle'; }   /* 沒有位置可寫：先照路線生，S.arrange 再站好 */
    MIR.set(k,m); if(MIR.size>400) MIR.clear(); return m; };
  S.nameOf=id=>{ if(isLabel(id)) return PEOPLE[id].label; return typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id; };

  /* ---------- 她要補的作息：放進 daily_schedule 最前面（帶 with、hc）---------- */
  S.apply=function(){ if(typeof CHARACTERS==='undefined'||S._applied) return 0; let n=0;
    for(let i=SCHED.length-1;i>=0;i--){ const s=SCHED[i], c=CHARACTERS[s.who]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); const r=S.row(s.hc);
      const e=Object.assign({},s.e,{hc:s.hc}); if(r&&r.with&&r.with.length) e.with=r.with.slice(); L.unshift(e); n++; }
    S._applied=true; return n; };

  /* ---------- 3D：站在一起 ---------- */
  const P=n=>n&&n.obj&&n.obj.position;
  const near=(a,b,d)=>!!a&&!!b&&Math.hypot(a.x-b.x,a.z-b.z)<(d||0.35);
  const canStand=(E,x,z,lv)=>!E.canStand||E.canStand(x,z,0.3,lv|0);
  const occupied=(E,x,z,lv,except)=>(E.npcs||[]).some(m=>m&&!except.includes(m)&&m.obj&&!m.hidden&&(m.lv|0)===(lv|0)&&Math.hypot(m.obj.position.x-x,m.obj.position.z-z)<0.55)||!!(E.player&&E.player.obj&&Math.hypot(E.player.obj.position.x-x,E.player.obj.position.z-z)<0.55);
  const putAt=(E,n,x,z,lv)=>{ if(E.placeAt) E.placeAt(n,x,z,lv|0); else { n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; } };
  const face=(n,p)=>{ const o=P(n); if(o&&p&&n.obj.rotation) n.obj.rotation.y=Math.atan2(p.x-o.x,p.z-o.z); };
  S.npcOf=function(GM,id){ if(typeof EVENTS!=='undefined'&&EVENTS.npcOf){ const n=EVENTS.npcOf(id); if(n) return n; } return (GM.npc&&GM.npc[id])||null; };
  /* 安靜地放（瞬移）：進區域那一刻，或離玩家 14 m 以外；否則走過去 */
  const quietFor=(GM,n,refresh)=>{ if(!refresh) return true; const E=GM.E, p=P(n), q=E&&E.player&&P(E.player); if(!p||!q) return true; return Math.hypot(p.x-q.x,p.z-q.z)>14; };
  /* 她旁邊站得住的位置：右、左、右前、左前…（她的朝向；第 k 個同伴從第 k 格開始找）*/
  const OFFS=[[0.95,0.15],[-0.95,0.15],[0.75,0.75],[-0.75,0.75],[1.35,-0.35],[-1.35,-0.35],[0,1.1],[0,-1.0]];
  S.beside=function(E,hn,k,except){ const p=P(hn); if(!p) return null; const y=(hn.obj.rotation&&hn.obj.rotation.y)||0, lv=hn.lv|0, rx=Math.cos(y), rz=-Math.sin(y), fx=Math.sin(y), fz=Math.cos(y);
    const st=hn.seat||hn.seatTarget; const c=st?{x:st.x,z:st.z}:p;
    const order=OFFS.slice(k%OFFS.length).concat(OFFS.slice(0,k%OFFS.length));
    for(const [a,b] of order){ const x=+(c.x+rx*a+fx*b).toFixed(2), z=+(c.z+rz*a+fz*b).toFixed(2); if(!canStand(E,x,z,lv)) continue; if(occupied(E,x,z,lv,except)) continue; return {x,z,lv}; }
    return null; };
  const seatBusy=(E,st,except)=>!!st.taken||(E.npcs||[]).some(m=>m&&!except.includes(m)&&(near(m.seat,st)||near(m.seatTarget,st)))||!!(E.player&&near(E.player.seat,st));
  /* 離 a 最近的空位（3.5 m 內；同一排隔壁、同一桌優先）*/
  S.seatNear=function(E,a,except,behind){ const seats=(E.zone&&E.zone.seats)||[]; let best=null, bd=1e9;
    for(const st of seats){ if((st.lv|0)!==(a.lv|0)||near(st,a)||seatBusy(E,st,except)) continue; let d=Math.hypot(st.x-a.x,st.z-a.z); if(d>3.5) continue;
      if(behind&&S.behindOf(st,a)) d-=20;   /* behind：她背後那一桌優先（AA_509 1-1「以安坐在語彤後面那桌」）*/
      if(a.row!=null&&st.row===a.row&&Math.abs((st.col|0)-(a.col|0))===1) d-=10; else if(a.table&&st.table===a.table) d-=5; if(d<bd){ bd=d; best=st; } }
    return best; };
  /* st 在 a 的背後（a 坐的方向往後 0.5 m 以上；座位的 yaw＝面向）*/
  S.behindOf=(st,a)=>{ const y=a.yaw||0; return (st.x-a.x)*Math.sin(y)+(st.z-a.z)*Math.cos(y)<-0.5; };
  const sitMove=(GM,n,st,pose,quiet)=>{ const E=GM.E; if(quiet||!E.moveTo){ if(n.seat&&GM.standUp) GM.standUp(n); n.seatTarget=null; n.path=null; if(GM.sitAt) GM.sitAt(n,st); else { putAt(E,n,st.x,st.z,st.lv); n.seat=st; } n.pose=n.idlePose=pose; return; }
    if(n.seat&&GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.waypoints=null; n.seatTarget=st;
    const sit=()=>{ n.seatTarget=null; if(seatBusy(E,st,[n])){ n.pose=n.idlePose='idle'; return; } if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pose; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)) sit(); };
  const standMove=(GM,n,spot,lookAt,quiet,yaw)=>{ const E=GM.E; const done=()=>{ n.path=null; if(yaw!=null&&n.obj.rotation) n.obj.rotation.y=yaw; else face(n,lookAt); n.faceYaw=null; n.frozen=true; n.beh='idle'; n.pose=n.idlePose='idle'; n._hcGo=false; };
    if(n.seat&&GM.standUp) GM.standUp(n); n.waypoints=null; n.chatWith=null;
    if(quiet||!E.moveTo){ putAt(E,n,spot.x,spot.z,spot.lv); done(); return; }
    if(n._hcGo) return; n._hcGo=true; n.frozen=false; n.beh='idle'; if(!E.moveTo(n,spot.x,spot.z,done,spot.lv|0)){ putAt(E,n,spot.x,spot.z,spot.lv); done(); } };
  S.unpair=function(n){ if(!n) return; const b=n.paired; if(b&&typeof b==='object'){ if(b.paired===n) b.paired=null; if(b.chatWith===n){ b.chatWith=null; if(b.beh==='chat'){ b.beh='idle'; b.frozen=false; b.pose=b.idlePose='idle'; } } if(b.buddy===n&&b.beh==='buddy') S.toWander(b); }
    n.paired=null; if(n.beh==='chat'){ n.beh='idle'; n.chatWith=null; n.frozen=false; n.pose=n.idlePose='idle'; } if(n.beh==='buddy'&&n.buddy&&!n._hcWith) S.toWander(n); };
  /* 配對結束：回去照路線走（沒有路線＝站著）*/
  S.toWander=function(n){ const G=GMr&&GMr.G, rs=G&&typeof STORY!=='undefined'&&STORY.walkRoutesOf?STORY.walkRoutesOf(G.zone):[]; n.buddy=null; n.paired=null; n.chatWith=null;
    if(rs&&rs.length){ const p=P(n), dq=q=>Math.hypot(q[0]-p.x,q[1]-p.z), r=rs.slice().sort((a,b)=>Math.min(...a.map(dq))-Math.min(...b.map(dq)))[0]; n.beh='wander'; n.waypoints=r; n.frozen=false; n.timer=0.3; }
    else { n.beh='idle'; n.frozen=false; } n.pose=n.idlePose='idle'; };
  /* 吧檯、廚房的店員（story3d.js S.populate 的 clerk）*/
  S.CLERK={cafe:{x:-0.6,z:-5.25,yaw:0},noodle:{x:-2.0,z:-2.75,yaw:Math.PI}};
  const clerkNpc=(E,zone)=>{ const c=S.CLERK[zone]; if(!c) return null; return (E.npcs||[]).find(m=>m&&m.clerk&&m.obj&&Math.hypot(m.obj.position.x-c.x,m.obj.position.z-c.z)<0.6)||null; };
  /* 一個同伴站好 */
  S.place=function(GM,r,hn,cn,cid,k,refresh){ const E=GM.E, opt=(r.comp&&r.comp[cid])||{}, quiet=quietFor(GM,cn,refresh)&&quietFor(GM,hn,refresh), hp=P(hn); if(!hp||!P(cn)) return;
    cn._hcWith=r.who; cn._hcRow=r.id; hn._hcRow=r.id; if(cn.leaving) return;
    if(r.anchor==='with'){   /* 她坐到他旁邊（必修課上課前和曾靖雯，第一排）*/
      const a=cn.seat||cn.seatTarget, hs=hn.seat||hn.seatTarget; if(!a) return; if(hs&&(opt.behind?S.behindOf(hs,a)&&Math.hypot(hs.x-a.x,hs.z-a.z)<3.6:Math.hypot(hs.x-a.x,hs.z-a.z)<1.7&&(a.row==null||hs.row===a.row))) return; if(hn._hcSeatTry===r.id+G0(GM)) return;
      hn._hcSeatTry=r.id+G0(GM); const st=S.seatNear(E,a,[hn,cn],!!opt.behind); if(st) sitMove(GM,hn,st,hn.idlePose==='read'?'read':'sit',quiet); return; }
    if(opt.clerk||opt.at){   /* 店員的位置、指定的位置 */
      const c=opt.at?{x:opt.at[0],z:opt.at[1],yaw:null}:S.CLERK[opt.clerk]; if(!c) return; if(near(P(cn),c,0.4)&&cn.frozen) return;
      standMove(GM,cn,{x:c.x,z:c.z,lv:hn.lv|0},hp,quiet||!!opt.clerk,opt.at?null:c.yaw); if(opt.at) face(cn,hp); return; }
    const hs=hn.seat||hn.seatTarget;
    if(hs&&!opt.stand){   /* 她坐著：坐她旁邊的空位（沒有空位＝站她旁邊；同一天同一列找過沒位子就不再找）*/
      const cs=cn.seat||cn.seatTarget; if(cs&&Math.hypot(cs.x-hs.x,cs.z-hs.z)<2.6) return;
      if(cn._hcNoSeat!==r.id+G0(GM)){ const st=S.seatNear(E,hs,[hn,cn]); if(st){ sitMove(GM,cn,st,hn.idlePose==='read'||hn.pose==='read'?'read':'sit',quiet); return; } cn._hcNoSeat=r.id+G0(GM); } }
    if(hs||hn.frozen||!(hn.beh==='wander'||hn.beh==='route'||hn.beh==='buddy')){   /* 她站著（或坐著、旁邊沒位子）：站她旁邊 */
      if(near(P(cn),hs||hp,1.6)&&cn.frozen) return; const sp=S.beside(E,hn,k,[hn,cn]); if(!sp) return; standMove(GM,cn,sp,hs||hp,quiet); cn.lookAt=hn.obj.position; return; }
    /* 她在走：一起走（pairUp 的 buddy）*/
    if(cn.beh==='buddy'&&cn.buddy===hn) return;
    if(hn.paired&&typeof hn.paired==='object'&&hn.paired!==cn&&!(r.with||[]).some(id=>S.npcOf(GM,id)===hn.paired||GM.npc[id]===hn.paired)) S.unpair(hn);   /* pairUp 之前配給別人的：先拆 */
    if(cn.seat&&GM.standUp) GM.standUp(cn); S.unpairOther(cn,hn);
    cn.beh='buddy'; cn.buddy=hn; cn.side=k%2?-1:1; cn.followOff=0.9+0.45*Math.floor(k/2); cn.waypoints=null; cn.path=null; cn.onArrive=null; cn.frozen=false; cn.chatWith=null; cn.pose=cn.idlePose='idle';
    cn.paired=hn; if(!hn.paired||hn.paired===cn||!hn.paired.obj) hn.paired=cn;
    if(quiet){ const y=(hn.obj.rotation&&hn.obj.rotation.y)||0, x=+(hp.x+Math.cos(y)*0.9*cn.side).toFixed(2), z=+(hp.z-Math.sin(y)*0.9*cn.side).toFixed(2); if(canStand(E,x,z,hn.lv)) putAt(E,cn,x,z,hn.lv); else putAt(E,cn,hp.x,hp.z+0.9,hn.lv); if(cn.obj.rotation) cn.obj.rotation.y=y; } };
  const G0=GM=>':'+(GM.G?GM.G.day:0);
  S.unpairOther=function(cn,hn){ const b=cn.paired; if(b&&b!==hn&&typeof b==='object') S.unpair(cn); };
  /* 她照作息要站在 SCHED 的那一點（舊的劇情人物：大道上走的以安）＝走過去站好；那一列結束再走開（S.release）*/
  S.holdHero=function(GM,hn,r,refresh){ const s=SCHED.find(q=>q.hc===r.id&&q.who===r.who&&q.e.act==='linger'&&q.e.at); if(!s) return; const at=s.e.at, spot={x:at[0],z:at[1],lv:at[3]|0};
    if(near(P(hn),spot,1.0)) return; if(!hn._hcPrev) hn._hcPrev={beh:hn.beh,waypoints:hn.waypoints,frozen:hn.frozen,pose:hn.idlePose};
    S.unpair(hn); standMove(GM,hn,spot,null,quietFor(GM,hn,refresh),at[2]||0); };
  /* 標籤同伴：固定的路人底模（spec.id＝標籤 id，不進無名路人池；模型還沒下載完先藏起來）*/
  S.specOf=function(cid){ const p=PEOPLE[cid]; if(!p) return null; const ix=Object.keys(PEOPLE).indexOf(cid); const base=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(900+ix*2+(p.sex==='m'?1:0)):{};
    return Object.assign(base,{id:cid,name:p.label,sex:p.sex,model:p.model},p.height?{height:p.height}:{},p.props?{props:p.props.map(q=>typeof q==='object'?Object.assign({},q):q)}:{}); };   /* props：配件（HEROINE-LIFE-NPC3D-1028，LAWWW2-C）*/
  S._loading={}; S._failed={};
  S.modelWait=function(n){ const m=n&&n.hcModel; if(!m||typeof CHAR==='undefined'||!CHAR.isDegraded||!n.obj) return;
    if(CHAR.isDegraded(n.obj)){ if(S._failed[m]){ const u=n.obj.userData; u.wantModel=null; if(u.degradedHidden){ for(const ch of n.obj.children) ch.visible=true; u.degradedHidden=false; } n.hidden=false; n._hcWait=false; return; }
      n.hidden=true; n._hcWait=true; if(typeof ASSETS!=='undefined'&&ASSETS.loadOne&&ASSETS.has&&!ASSETS.has(m)&&!S._loading[m]){ S._loading[m]=true; ASSETS.loadOne(m).catch(e=>{ S._failed[m]=true; console.warn('HCIRCLE model',m,e&&e.message); }).finally(()=>{ delete S._loading[m]; }); } }
    else if(n._hcWait){ n.hidden=false; n._hcWait=false; } };
  /* at：生出來的位置（店員的位置）；室內、待在區域裡、在玩家眼前＝從門口走進來；室外照她旁邊（S.place 再站好）*/
  S.spawnLabel=function(GM,cid,hn,refresh,at){ const E=GM.E, spec=S.specOf(cid); if(!spec||!GM.spawnNPC||!P(hn)) return null; const hp=P(hn);
    const indoor=!!(E.indoor||(E.zone&&E.zone.indoor)), door=!at&&indoor&&refresh&&E.zone&&E.zone.spawn&&quietFor(GM,hn,refresh)===false?E.zone.spawn:null;
    const x=at?at.x:(door?door.x:hp.x+0.9), z=at?at.z:(door?door.z:hp.z);
    const n=GM.spawnNPC(cid,spec,x,z,{lv:door?(door.lv|0):(hn.lv|0),yaw:at&&at.yaw!=null?at.yaw:0,pose:'idle',talk:null,talkLabel:null,greet:false}); if(!n) return null;
    n.name=PEOPLE[cid].label; n.hcLabel=cid; n.hcModel=spec.model; n.charId=null; n.talk=null; n.talkLabel=null; if(GM.G&&GM.G.zone==='cafe') n.staff='cafe';   /* Café 的人是店員（S.cafeOthers 不算客人）*/
    S.modelWait(n); return n; };
  S.dropLabel=function(GM,key,n,refresh){ const E=GM.E; if(n._hcHid){ const c=n._hcHid; c.hidden=false; if(c.obj) c.obj.visible=true; n._hcHid=null; }
    if(n.leaving){ if(n.arrived||quietFor(GM,n,refresh)) GM.removeNPC?GM.removeNPC(key):delete GM.npc[key]; return; }
    if(quietFor(GM,n,refresh)||!(typeof STORY!=='undefined'&&STORY.walkAway&&STORY.walkAway(GM,n))){ if(GM.removeNPC) GM.removeNPC(key); else delete GM.npc[key]; } };
  /* 一區裡：成立的列＝同伴站好；不成立的＝放開 */
  S.arrange=function(GM,refresh){ const G=GM&&GM.G, E=GM&&GM.E; if(!law(G)||!E||!E.zone||!GM.npc) return [];
    const act=S.rowsIn(G,G.zone), want=new Set(), slots={}, heroes=new Set();
    for(const r of act){ const hn=S.npcOf(GM,r.who); if(!hn||hn.leaving||!P(hn)) continue; heroes.add(hn); hn._hcRow=r.id; S.wrapTalk(GM,r.who,hn);
      S.holdHero(GM,hn,r,refresh);
      if(r.alone){ hn.noPair=true; if(hn.paired) S.unpair(hn); continue; }
      for(const cid of r.with){ let cn;
        if(isLabel(cid)){ want.add(cid); const o=(r.comp&&r.comp[cid])||{}, at=o.clerk&&!o.at?S.CLERK[o.clerk]:null;
          cn=GM.npc[cid]||S.spawnLabel(GM,cid,hn,refresh,at); if(cn&&cn.leaving){ cn.leaving=false; cn.arrived=false; cn.beh='idle'; cn.path=null; } }
        else cn=S.npcOf(GM,cid);
        if(!cn||!P(cn)) continue;
        const k=slots[r.who]=(slots[r.who]|0)+1; S.place(GM,r,hn,cn,cid,k-1,refresh);
        const ck=(r.comp&&r.comp[cid]&&r.comp[cid].clerk)||null; if(ck&&isLabel(cid)&&!cn._hcHid){ const c=clerkNpc(E,ck); if(c&&!c.hidden){ c.hidden=true; if(c.obj) c.obj.visible=false; cn._hcHid=c; } } } }
    for(const key of Object.keys(GM.npc)){ const n=GM.npc[key]; if(!n||!n.hcLabel) continue; if(want.has(n.hcLabel)){ S.modelWait(n); continue; } S.dropLabel(GM,key,n,refresh); }
    S.release(GM,act,heroes);
    return act; };
  /* 那一列不成立了：她回去照原本的（站好的走開、一個人的可以配對），一起走的人回去照路線走 */
  S.release=function(GM,act,heroes){ const ids=new Set(act.map(r=>r.id)), G=GM.G;
    for(const key of Object.keys(GM.npc)){ const n=GM.npc[key]; if(!n||n.hcLabel) continue;
      if(n._hcRow&&!ids.has(n._hcRow)&&!heroes.has(n)){ const was=n._hcRow; n._hcRow=null; n.noPair=false;
        if(n._hcPrev){ const pv=n._hcPrev; n._hcPrev=null; const id=n.charId||key, e=S.entOf(id,G);
          if((!e||e.zone!==G.zone)&&typeof STORY!=='undefined'&&STORY.walkAway){ n.frozen=false; STORY.walkAway(GM,n); }
          else { n.frozen=!!pv.frozen; n.beh=pv.beh||'idle'; n.waypoints=pv.waypoints||null; n.pose=n.idlePose=pv.pose||'idle'; } }
        if(n._hcWith&&!n.leaving){ const r=S.row(was); n._hcWith=null; n.lookAt=null; if(n.beh==='buddy') S.toWander(n); else if(n.frozen&&!n.seat&&!(r&&r.comp&&r.comp[key])&&n.sched) { n.frozen=false; } } }
      else if(n._hcWith&&!heroes.has(S.npcOf(GM,n._hcWith))&&!n.leaving){ n._hcWith=null; n._hcRow=null; n.lookAt=null; if(n.beh==='buddy') S.toWander(n); } } };

  /* ---------- 旁邊有人（STORY.COMPANY）---------- */
  S.withNow=function(GM,id){ GM=GM||GMr; if(!GM||!GM.G||!GM.E) return []; const G=GM.G, hn=S.npcOf(GM,id), hp=P(hn); if(!hp) return []; const out=[];
    for(const r of (BY_WHO[id]||[])){ if(r.alone||!S.on(r,G,G.zone)) continue; for(const cid of r.with){ const cn=isLabel(cid)?GM.npc[cid]:S.npcOf(GM,cid), cp=P(cn); if(cp&&!cn.leaving&&(cn.lv|0)===(hn.lv|0)&&Math.hypot(cp.x-hp.x,cp.z-hp.z)<S.NEAR_R) out.push(cid); } }
    return out; };
  S.company=(G,id,n,GM)=>S.withNow(GM||GMr,id).length>0;

  /* ---------- 走近時聽到 ---------- */
  const sameSpace=(E,a,b,la,lb)=>{ const Z=E.zone, sp=Z&&(Z.spaceAt||Z.roomAt); if(!sp) return true; try{ return sp.call(Z,a.x,a.z,la|0)===sp.call(Z,b.x,b.z,lb|0); }catch(e){ return true; } };
  S.speakers=r=>[...new Set(r.lines.map(l=>l.id).filter(id=>id&&id!==r.who))];
  S.together=function(GM,r,hn){ const hp=P(hn), sp=S.speakers(r); for(const id of (sp.length?sp:(r.with||[]))){   /* 只有旁白的同框列（AA_509、AA_510 以安和語彤）：同伴要在旁邊 */ const cn=isLabel(id)?GM.npc[id]:S.npcOf(GM,id), cp=P(cn); if(!cp||cn.leaving||cn.hidden||Math.hypot(cp.x-hp.x,cp.z-hp.z)>=S.NEAR_R) return false; } return true; };
  S.hearable=function(GM,r,hn){ const G=GM.G, R=S.rec(G); if(!r.lines.length||R.heard[r.id]===G.day||(r.once&&R.once[r.id]!=null)) return false;
    if(r.cls){ const e=S.heroEnt(r,G); if(!e||hr(G)>=S.clsT0(e)) return false; }   /* 必修課：只在上課以前 */
    if(!hn||hn.leaving||hn.hidden||!P(hn)) return false; return r.alone||S.together(GM,r,hn); };
  S.hearDue=function(GM){ const G=GM.G, E=GM.E, pl=E&&E.player, pp=P(pl); if(!pp) return null;
    for(const r of S.rowsIn(G,G.zone)){ const hn=S.npcOf(GM,r.who), hp=P(hn); if(!hp||(hn.lv|0)!==(pl.lv|0)) continue; if(Math.hypot(hp.x-pp.x,hp.z-pp.z)>S.HEAR_R) continue;
      if(!sameSpace(E,hp,pp,hn.lv,pl.lv)) continue; if(S.hearable(GM,r,hn)) return {r,hn}; }
    const R=S.rec(G); for(const r of SPOTS){ if(!r.lines.length||R.heard[r.id]===G.day||(r.once&&R.once[r.id]!=null)||!S.on(r,G)) continue;   /* spot：走到那個地點 5 m 內（同一區、同一層）*/
      for(const sp of r.spot){ if(sp[0]===G.zone&&(sp[3]|0)===(pl.lv|0)&&Math.hypot(sp[1]-pp.x,sp[2]-pp.z)<=S.HEAR_R) return {r,hn:null}; } }
    return null; };
  S.who=function(GM,l){ if(!l.id) return null; if(isLabel(l.id)) return l.label||PEOPLE[l.id].label; const n=S.npcOf(GM,l.id); return (n&&n.name)||S.nameOf(l.id); };
  S.markHeard=function(G,r){ const R=S.rec(G); R.heard[r.id]=G.day; if(r.once) R.once[r.id]=G.day; };
  S.hear=function(GM,r){ const G=GM.G; S.markHeard(G,r); if(!GM.caption) return true; const L=r.lines; S._capBusy=true;
    L.forEach((l,i)=>{ const show=()=>{ if(GM.G!==G||(GM.D&&GM.D.active)) return; GM.caption(S.who(GM,l)||'',l.t,S.CAP_MS); }; if(i===0) show(); else S.later(show,i*S.CAP_GAP); });   /* 開始對話了（找她說話）就不再出字幕 */
    S.later(()=>{ S._capBusy=false; },Math.max(0,L.length-1)*S.CAP_GAP+S.CAP_MS); return true; };
  /* 找她說話：沒聽到的先在對話框演（第一個還沒聽到的那一列）；第一次在同伴旁邊＝介紹（名牌）*/
  S.before=async function(GM,id,n){ const G=GM&&GM.G; if(!law(G)) return; S.bind(GM); const hn=n||S.npcOf(GM,id); let said=false;
    for(const r of (BY_WHO[id]||[])){ if(!S.on(r,G,G.zone)) continue;
      if(!said&&S.hearable(GM,r,hn)){ said=true; S.markHeard(G,r); if(GM.sceneBegin) GM.sceneBegin(); try{ for(const l of r.lines){ const o=l.id?(isLabel(l.id)?GM.npc[l.id]:S.npcOf(GM,l.id)):null; await GM.say(l.id?{name:S.who(GM,l),obj:o&&o.obj,charId:isLabel(l.id)?undefined:l.id}:null,l.t); } } finally { if(GM.sceneEnd) GM.sceneEnd(); } }
      if(!r.alone) S.intro(GM,r,hn); } };
  S.intro=function(GM,r,hn){ const G=GM.G, R=S.rec(G), hp=P(hn);
    for(const cid of (r.with||[])){ if(isLabel(cid)||R.intro[cid]!=null) continue; const cn=S.npcOf(GM,cid), cp=P(cn); if(!cp||!hp||Math.hypot(cp.x-hp.x,cp.z-hp.z)>=S.NEAR_R) continue;
      R.intro[cid]=G.day;
      if(/^pool_/.test(cid)&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&!SOCIAL.has(cid,'FIRST_MET')){ SOCIAL.meet(cid,G.zone);
        if(typeof POOL!=='undefined'&&POOL.owns&&POOL.owns(cid)&&POOL.afterMeet) POOL.afterMeet(G,cid); else if(SOCIAL.adjust) SOCIAL.adjust(cid,{fam:3});
        if(SOCIAL.npcName){ cn.name=SOCIAL.npcName(cid); if(cn.talk||cn._poolTalk) cn.talkLabel='和'+cn.name+'說話'; } } } };
  S.wrapTalk=function(GM,id,hn){ if(!hn||!hn.talk||hn.talk._hc) return; const t0=hn.talk; const w=async function(nn){ try{ await S.before(GM,id,nn||hn); }catch(e){ console.warn('HCIRCLE.before',e); } return t0.apply(this,arguments); }; w._hc=true; w._t0=t0; hn.talk=w; };

  /* ---------- 每 0.5 秒（STORY.TICKS）---------- */
  let acc=1;
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!law(G)||!GM.E||!GM.E.player) return false; S.bind(GM);
    acc+=dt||0.5; if(acc>=1){ acc=0; try{ S.arrange(GM,true); }catch(e){ console.warn('HCIRCLE.arrange',e); } }
    if(S._capBusy) return false; try{ const d=S.hearDue(GM); if(d) S.hear(GM,d.r); }catch(e){ console.warn('HCIRCLE.hear',e); } return false; };
  S._resetTick=()=>{ acc=1; S._capBusy=false; };

  /* 無名路人不拿這一區標籤同伴的底模（POOL.reserved 包一層；POOL.wrapAnon 的 choose 讀它）*/
  S.reservedModels=function(G){ const out=new Set(); if(!G) return out; for(const r of S.rowsIn(G,G.zone)) for(const cid of (r.with||[])) if(isLabel(cid)) out.add(PEOPLE[cid].model); return out; };

  /* ---------- 接線（載入時一次）---------- */
  S.apply();
  if(typeof STORY!=='undefined'){
    STORY.SCHED_WITH=(c,G,hit,L,T)=>S.mirror(c,G,hit,L,T);
    if(Array.isArray(STORY.PRE_PAIR)) STORY.PRE_PAIR.push((zoneId,GM)=>{ S.bind(GM); S.arrange(GM,false); });
    if(Array.isArray(STORY.COMPANY)) STORY.COMPANY.push((G,id,n,GM)=>S.company(G,id,n,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  if(typeof POOL!=='undefined'&&POOL.reserved&&!POOL._hc){ const r0=POOL.reserved; POOL.reserved=function(G){ const out=r0.apply(this,arguments); try{ for(const m of S.reservedModels(G||(GMr&&GMr.G))) out.add(m); }catch(e){} return out; }; POOL._hc=true; }
  return S;
})();
if(typeof window!=='undefined') window.HCIRCLE=HCIRCLE;
