/* ===== 配角第二批（AA_519，企劃線 873b670c0 → d75cd0228 第 8 節；任務 NPC-STORY2-1028、USER_WANTS X119）=====
   使用者 X119「已有劇情的配角無聊的重寫」：麵店阿姨、陳助教、兩點半 Café、黃筱涵、阿凱。台詞在 src/data/aa519_lines.js（一字不差）；改在現有事件裡的句子寫在各自的檔（各處註解寫 AA_519 第幾節）。
   ■ 共用：S.daily＝「一天一句新的（照時期，表的順序）、之後短句輪流」（阿姨 1-2、老闆 3-1、阿凱 5-1；陳助教 2-2、筱涵 4-1 用 alt：一年兩句用完＝和「聊了兩句天氣」交替）。
     「過了那個時期沒說到的就不說」：每一列只在自己的時期成立時才會被挑。存檔 G.flags.AA519.talk[誰]＝{said:{列:那一天}, nd:說新句的那一天, si:短句輪到第幾句, ai:交替輪到第幾句, w:上一次是不是天氣}。
   ■ 第 1 節 麵店阿姨（阿鳳）：
     1-1 麵店櫃台、廚房那位（story3d.js S.populate 的 clerk）＝阿姨的外觀（HCIRCLE.PEOPLE.hc_ayi：中年底模＋圍裙，S.clerkSpec）；能說話（S.clerkWire）；
         語彤那幾列的 3D 阿姨（hc_ayi，HCIRCLE.spawnLabel）也能說話（同一個人、同一份紀錄）；兩個不會同時出現（HCIRCLE.arrange 照舊藏店員）。
         旁白第一次寫「阿姨（阿鳳）」（S.narName：在麵店裡〔G.zone noodle，或正在演麵店的事件〕的第一句提到阿姨的旁白；之後照原文「阿姨」）。
     1-2 說話：S.AUNT_ROWS 的時期（照稿那一欄）；出國回來那一句讀 YT_AUNT_PHOTO。1-4 店名由來（S.auntNameDue：大二上起、15:00～17:00、一個人在店裡，一次；記 AUNT_NAME）。
   ■ 第 8 節（d75cd0228）：
     8-1 語彤顧店的時段阿姨一定在廚房：src/hcircle3d.js S.auntAway、S.kitchen、S.auntOut；src/multirel3d.js S.auntIn。
     8-2 一個人吃麵的旁白：story3d.js noodleScene（阿姨在＝「乾麵很燙。阿姨多給了一匙肉燥。」、不在＝「乾麵很燙。」）。
     8-3 麵店的 2D 事件（阿姨在場或說話：S.auntEvs，載入後掃 STORY_EVENTS 在麵店、台詞提到阿姨的）那一天，圈子表阿姨那幾列一定成立（HCIRCLE.roll 包一層：擲骰當成功）。
     8-4 2029-04-19～25 阿姨出國：門口那張紙 r2y4b3d.js；語彤那一週在總圖（作息補兩筆，S.applySched）；那一週不排新的麵店出遊（OUT.plan 包一層）、邀約（INVITE_DATA 的 noodle 加 avail）；
         麵店團那一週沒有麵店日（STORY.noodleDay 包一層：阿哲不揪、長桌不演），4/23（一）21:00 群組四則（那一週本來有麵店日才發）。
   存檔：G.flags.AA519＝{talk:{…}, nar:那一天, …}；新旗標 AUNT_NAME、CAFE_LATTE_TRY、HXH_SUBJECT；舊存檔沒有＝從那時起（過了的不補）。
   測試：node tests/aa519_support2_unit.js */
'use strict';
const SUP519=(function(){
  const S={};
  const L=typeof AA519_LINES!=='undefined'?AA519_LINES:{aunt:{rows:[],shorts:[],nameScene:[],tripGroup:[]},ta:{years:{},pass:[]},cafe:{rows:[],shorts:[],nameScene:[],latte:[],xt:{},heard:[]},hxh:{years:{},scene:[],opts:[]},kai:{rows:[],shorts:[]}};
  S.L=L;
  let GMr=null;
  S.bind=gm=>{ if(gm){ GMr=gm; S.wrapSay(gm); } return GMr; };
  const curG=()=>(GMr&&GMr.G)||(typeof GAME!=='undefined'&&GAME&&GAME.G)||null;

  /* ---------- 小工具 ---------- */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const termOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null;
  const termAt=d=>typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(d):((termOf(d)||{}).id||null);   /* 寒暑假算前一個學期 */
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const met=id=>has(id,'FIRST_MET');
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&!!PHONE.sent&&PHONE.sent(G,tag);
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  const loc=(G,d,h)=>{ const t=d*24+h+tz(G,d), dd=Math.floor(t/24); return {day:dd,h:t-dd*24}; };
  /* 劇情的訊息：d、h＝臺灣時間；那一天的前一天到後一天之間才排（過了不補，同 SUP497.at）*/
  S.at=function(G,d,h,items,tag){ if(d==null||typeof PHONE==='undefined'||sent(G,tag)) return false; const l=loc(G,d,h); if(G.day<l.day-1||G.day>l.day+1) return false; return PHONE.at(G,l.day,l.h,items,tag); };
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.AA519; if(!R||typeof R!=='object') R=F.AA519={}; if(!R.talk||typeof R.talk!=='object') R.talk={}; return R; };
  /* 祐廷的學年（照日子；2025-09～2026-08＝大一 … 2028-09 以後＝4）：陳助教、筱涵、老闆的「大一／大二…」照稿寫的年份 */
  S.YEAR_FROM=['2026-09-01','2027-09-01','2028-09-01'];
  S.yearOf=function(G){ let y=1; for(const k of S.YEAR_FROM){ const d=DK(k); if(d!=null&&G.day>=d) y++; } return y; };

  /* ---------- 共用：一天一句新的（照時期），之後短句輪流 ----------
     rows：[{k, on:G=>這一列的時期現在成立嗎, t:字或 G=>字}]（照表的順序）；shorts：短句。
     回傳 {t, k?, fresh}：今天還沒說過新的、有成立而且沒說過的那一列＝那一句（記下來）；否則短句輪流。
     o.alt（陳助教、筱涵）：一天只聊一次（當天第二次由呼叫的人處理）；那一年的都說過了＝和「聊了兩句天氣」交替（{weather:true} 和那一年的句子輪流）*/
  S.talkRec=function(G,who){ const R=S.rec(G), t=R.talk[who]&&typeof R.talk[who]==='object'?R.talk[who]:(R.talk[who]={}); if(!t.said||typeof t.said!=='object') t.said={}; return t; };
  S.daily=function(G,who,rows,shorts,o){ o=o||{}; const st=S.talkRec(G,who);
    if(st.nd!==G.day){ for(const r of rows){ if(st.said[r.k]!=null) continue; let on=false; try{ on=!!r.on(G); }catch(e){ on=false; } if(!on) continue;
        const t=typeof r.t==='function'?r.t(G):r.t; if(t==null) continue; st.said[r.k]=G.day; st.nd=G.day; st.w=false; return {t,k:r.k,fresh:true}; } }
    if(o.alt){ const cur=rows.filter(r=>{ try{ return !!r.on(G); }catch(e){ return false; } }).map(r=>typeof r.t==='function'?r.t(G):r.t).filter(x=>x!=null);
      if(!cur.length||!st.w){ st.w=true; st.nd=G.day; return {weather:true,fresh:true}; }   /* 用完那一年：先天氣，再一句，再天氣…（照現有「只剩一句＝中間隔一次打招呼」）*/
      const i=(st.ai|0)%cur.length; st.ai=(st.ai|0)+1; st.w=false; st.nd=G.day; return {t:cur[i],fresh:true}; }
    const L0=shorts||[]; if(!L0.length) return null; const i=(st.si|0)%L0.length; st.si=(st.si|0)+1; return {t:L0[i],fresh:false}; };

  /* ======================= 第 1 節 麵店阿姨（阿鳳）======================= */
  const AY=L.aunt||{};
  const rowT=k=>((AY.rows||[]).find(r=>r.k===k)||{});
  const wkIn=(G,a,b)=>{ const t=termOf(G.day); return !!t&&t.week>=a&&t.week<=b; };
  const after=(G,k)=>{ const d=DK(k); return d!=null&&G.day>=d; };
  /* 1-2 的時期（照稿那一欄；大一上的兩列＝那件事在大一發生以後，大一下第 8 週起換下一個時期）*/
  S.AUNT_ON={
    y1s1_w1_6:G=>termAt(G.day)==='Y1S1'&&wkIn(G,1,6),
    y1_customer:G=>['Y1S1','Y1S2'].includes(termAt(G.day))&&done(G,'ev_yutong_customer')&&!done(G,'ev_yutong_customer_after'),   /* 賠三萬那件以後（events.js ev_yutong_customer 演過），那週六法服以前 */
    y1_fafu:G=>['Y1S1','Y1S2'].includes(termAt(G.day))&&done(G,'ev_yutong_customer_after'),   /* 那週六法服以後（ev_yutong_customer_after：阿姨去了法服）*/
    y1s2_w8_9:G=>termAt(G.day)==='Y1S2'&&wkIn(G,8,9),   /* 扭到手腕那兩週 */
    y1s2_rent:G=>{ if(termAt(G.day)!=='Y1S2') return false; const t=termOf(G.day); if(t&&t.week<10) return false; return done(G,'ev_yutong_landlord')||has('heroine_03','RENT_RUMOR'); },   /* 第 10 週以後、房東來量過（RENT_RUMOR 那一場）*/
    y2s1:G=>termAt(G.day)==='Y2S1',
    y2s2_fafu:G=>termAt(G.day)==='Y2S2'&&after(G,'2027-05-24'),   /* 2027-05-22（六）她去法服以後：「上禮拜」＝下一週起 */
    y3s1_lease:G=>termAt(G.day)==='Y3S1'&&(!!G.flags.RENT_RENEWED||done(G,'ev_yt_lease_renew')),   /* 2027-11-24 續約以後 */
    y3s2:G=>termAt(G.day)==='Y3S2',
    y4s1_23rd:G=>{ if(termAt(G.day)!=='Y4S1') return false; const d=DK('2028-12-14'); return d!=null&&(G.day>d||(G.day===d&&G.flags.ANNIV23!=null)); },   /* 2028-12-14 二十三週年以後 */
    y4s2_back:G=>{ const a=DK('2029-04-26'), b=DK('2029-06-22'); return a!=null&&G.day>=a&&!(G.day>b||done(G,'ev_last_meal_y4')); },   /* 出國回來（4/26 起），最後一頓以前 */
    y4s2_last:G=>{ const b=DK('2029-06-22'); return b!=null&&(G.day>b||done(G,'ev_last_meal_y4')); } };   /* 2029-06-22 最後一頓以後 */
  S.auntPhoto=G=>{ const P=rowT('y4s2_back').photo||{}, v=G.flags.YT_AUNT_PHOTO; return P[v]||P.none; };   /* YT_AUNT_PHOTO（r2y4b3d.js 4/19 那則的回覆）：沒有選的＝none */
  S.AUNT_ROWS=(AY.rows||[]).map(r=>({k:r.k,on:S.AUNT_ON[r.k]||(()=>false),t:r.photo?S.auntPhoto:r.t}));
  /* 1-4：大二上起，那一天一個人在店裡、15:00～17:00（店裡沒客人），一次 */
  S.aloneIn=function(GM){ const G=GM.G, E=GM.E; if(G.flags.companion) return false; if(!E||!E.npcs) return true;
    return !E.npcs.some(n=>n&&n.obj&&!n.hidden&&!n.leaving&&!n.clerk&&!n.hcLabel&&!n.aa519Staff); };   /* 跟著的人、店裡別的客人（店員、阿姨不算）*/
  S.auntNameDue=GM=>{ const G=GM.G, h=hr(G); return law(G)&&G.flags.AUNT_NAME==null&&S.yearOf(G)>=2&&h>=15&&h<17&&S.aloneIn(GM); };
  const sayAs=(GM,n,nm)=>({name:nm,obj:n&&n.obj});
  S.playLines=async function(GM,A,n,nm){ for(const [w,t] of A){ if(w==null) await GM.say(null,t); else await GM.say(w===nm?sayAs(GM,n,nm):{name:w},t); } };
  S.auntTalk=async function(GM,n){ const G=GM&&GM.G; if(!law(G)) return false; S.bind(GM); const E=GM.E, P=E&&E.player, y0=n&&n.obj&&n.obj.rotation?n.obj.rotation.y:null;
    if(GM.sceneBegin) GM.sceneBegin();
    try{ if(GM.face&&n&&P&&P.obj) GM.face(n,P.obj.position.x,P.obj.position.z); if(GM.cine&&n&&P&&P.obj) GM.cine('talk',P.obj,n.obj);
      if(S.auntNameDue(GM)){ G.flags.AUNT_NAME=G.day; const st=S.talkRec(G,'aunt'); st.nd=G.day; await S.playLines(GM,AY.nameScene||[],n,'阿姨'); return true; }   /* 店名由來算今天那一句 */
      const o=S.daily(G,'aunt',S.AUNT_ROWS,AY.shorts); if(o&&o.t) await GM.say(sayAs(GM,n,'阿姨'),o.t); return true; }
    finally{ if(n&&n.obj&&n.obj.rotation&&y0!=null&&n.frozen) n.obj.rotation.y=y0; if(GM.sceneEnd) GM.sceneEnd(); } };   /* 說完轉回去顧鍋子 */

  /* ---------- 1-1 店員的外觀、說話 ---------- */
  S.CLERK_LABEL={noodle:'hc_ayi'};   /* 第 3 節加 Café 的老闆 */
  S.clerkSpec=function(kind){ const cid=S.CLERK_LABEL[kind]; if(!cid||typeof HCIRCLE==='undefined'||!HCIRCLE||!HCIRCLE.specOf) return null; const sp=HCIRCLE.specOf(cid); if(!sp) return null;
    sp.id='clerk_'+kind; if(sp.model&&typeof ASSETS!=='undefined'&&ASSETS.loadOne&&ASSETS.has&&!ASSETS.has(sp.model)){ try{ ASSETS.loadOne(sp.model).catch(()=>{}); }catch(e){} }   /* 模型還沒下載：先載（到了由 game3d.js upgradeModels 換上）*/
    return sp; };
  S.TALK={noodle:{name:'阿姨',fn:(GM,n)=>S.auntTalk(GM,n)}};
  S.clerkWire=function(GM,n,kind){ const w=S.TALK[kind]; if(!n||!w) return n; S.bind(GM); n.name=w.name; n.talkLabel='和'+w.name+'說話'; n.talk=nn=>w.fn(GM,nn||n); n.aa519Staff=kind; return n; };
  /* 圈子表的標籤同伴（HCIRCLE.spawnLabel）：阿姨能說話（同一個人）；第 3 節：老闆、小禾 */
  S.LABEL_WIRE={hc_ayi:'noodle'};
  S.afterSpawnLabel=function(GM,cid,n){ if(!n) return n; const k=S.LABEL_WIRE[cid]; if(k) S.clerkWire(GM,n,k); return n; };

  /* ---------- 1-1 旁白第一次寫「阿姨（阿鳳）」 ---------- */
  let NOODLE_EVS=null;
  S.noodleEvs=function(){ if(NOODLE_EVS) return NOODLE_EVS; const set=new Set(); if(typeof STORY_EVENTS==='undefined') return set;
    for(const ev of STORY_EVENTS){ if(!ev||ev.retired) continue; const lc=ev.location; let at=lc==='noodle'||(Array.isArray(lc)&&lc.includes('noodle'));
      if(!at) for(const l of (ev.dialogue||[])){ if(l&&l.scene!==undefined&&/麵店/.test(String(l.scene))&&!/麵舖/.test(String(l.scene))){ at=true; break; } if(l&&/^noodle/.test(String(l.bg||''))){ at=true; break; } }
      if(at) set.add(ev.id); }
    return NOODLE_EVS=set; };
  S.noodleCtx=G=>G.zone==='noodle'||(typeof EVENTS!=='undefined'&&!!EVENTS.running&&S.noodleEvs().has(EVENTS.running));
  S.narName=function(G,t){ if(!law(G)||typeof t!=='string'||t.indexOf('阿姨')<0||t.indexOf('阿鳳')>=0) return t; const R=S.rec(G); if(R.nar!=null||!S.noodleCtx(G)) return t; R.nar=G.day; return t.replace('阿姨','阿姨（阿鳳）'); };
  S.wrapSay=function(GM){ if(!GM||GM._aa519say||typeof GM.say!=='function') return; const s0=GM.say; GM.say=function(who,t){ if(who==null&&typeof t==='string'){ try{ arguments[1]=S.narName(GM.G,t); }catch(e){} } return s0.apply(this,arguments); }; GM._aa519say=true; };

  /* ---------- 8-3 麵店的 2D 事件那一天：阿姨那幾列擲骰當成功 ---------- */
  let AUNT_EVS=null;
  S.auntEvs=function(){ if(AUNT_EVS) return AUNT_EVS; const set=new Set(); if(typeof STORY_EVENTS==='undefined') return set; const N=S.noodleEvs();
    for(const ev of STORY_EVENTS){ if(!ev||!N.has(ev.id)) continue; let s=''; try{ s=JSON.stringify(ev.dialogue||[]); }catch(e){ s=''; } if(/阿姨/.test(s)) set.add(ev.id); }
    return AUNT_EVS=set; };
  S.auntEvDay=function(G){ if(!law(G)) return false; const last=(G.events&&G.events.last)||{}; for(const id of S.auntEvs()) if(last[id]===G.day) return true;
    const OUTS=typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G):[]; if(OUTS.some(q=>q&&q.day===G.day&&(q.state==='planned'||q.state==='done')&&((q.ev&&S.auntEvs().has(q.ev))||(/麵店/.test(q.place||'')&&!/麵舖/.test(q.place||''))||(q.goto&&q.goto.zone==='noodle')))) return true;
    return false; };
  S.auntRow=r=>!!r&&(r.with||[]).includes('hc_ayi');

  /* ---------- 8-4 2029-04-19～25 阿姨出國 ---------- */
  S.TRIP=['2029-04-19','2029-04-25'];
  S.tripDay=function(d){ const a=DK(S.TRIP[0]), b=DK(S.TRIP[1]); return a!=null&&b!=null&&d!=null&&d>=a&&d<=b; };
  S.tripBlocks=(G,o)=>law(G)&&!!o&&S.tripDay(o.day)&&((/麵店/.test(o.place||'')&&!/麵舖/.test(o.place||''))||(o.goto&&o.goto.zone==='noodle')||/阿鳳麵店/.test(o.title||''));
  /* 語彤那一週在總圖（照她 4/19 那則的回覆「我在總圖。期中考，店剛好也沒開。」）：顧店的兩個時段（週二晚上、週六早上）換總圖；放在作息最前面 */
  S.SCHED_YT=[{days:[2,4],from:17.5,to:20.5,zone:'library',act:'read',dates:[S.TRIP],note:'AA_519 第 8 節第 4 點：2029-04-19～25 阿姨出國、店沒開，語彤那一週在總圖（顧店的時段）'},
    {days:[6],from:9,to:12,zone:'library',act:'read',dates:[S.TRIP],note:'AA_519 第 8 節第 4 點：同上，週六早上的備料不去'}];
  S.applySched=function(){ if(S._sched||typeof CHARACTERS==='undefined'||!CHARACTERS.heroine_03) return 0; const L0=CHARACTERS.heroine_03.daily_schedule||(CHARACTERS.heroine_03.daily_schedule=[]);
    for(let i=S.SCHED_YT.length-1;i>=0;i--) L0.unshift(Object.assign({},S.SCHED_YT[i],{dates:S.SCHED_YT[i].dates.map(x=>x.slice()),aa519:true})); S._sched=true; return S.SCHED_YT.length; };
  /* 麵店團：那一週本來有麵店日（STORY.noodleDay 原本的判斷）＝4/23（一）21:00 群組四則 */
  S.TRIP_MSG='2029-04-23';
  S.tripHadNoodleDay=function(){ const nd=S._nd0||(typeof STORY!=='undefined'&&STORY.noodleDay); if(!nd) return false; const a=DK(S.TRIP[0]), b=DK(S.TRIP[1]); if(a==null) return false; for(let d=a;d<=b;d++) if(nd.call(STORY,d)) return true; return false; };
  S.tripPhone=function(G){ if(!law(G)||!inGrp(G,'noodle_team')) return; const d=DK(S.TRIP_MSG); if(d==null||!S.tripHadNoodleDay()) return;
    S.at(G,d,21,(AY.tripGroup||[]).map(([w,t])=>({th:'g:noodle_team',from:w,text:t})),'aa519_ndl_trip'); };

  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){ if(S._wired) return; S._wired=true;
    S.applySched();
    if(typeof HCIRCLE!=='undefined'&&HCIRCLE){
      if(HCIRCLE.spawnLabel&&!HCIRCLE._aa519){ const sp0=HCIRCLE.spawnLabel; HCIRCLE.spawnLabel=function(GM,cid){ const n=sp0.apply(this,arguments); try{ S.afterSpawnLabel(GM,cid,n); }catch(e){ console.warn('SUP519.spawnLabel',e); } return n; };
        const r0=HCIRCLE.roll; HCIRCLE.roll=function(r,G){ try{ if(S.auntRow(r)&&S.auntEvDay(G)) return true; }catch(e){} return r0.apply(this,arguments); };   /* 8-3 */
        if(HCIRCLE.reservedModels){ const rm0=HCIRCLE.reservedModels; HCIRCLE.reservedModels=function(G){ const out=rm0.apply(this,arguments); try{ const cid=G&&S.CLERK_LABEL[G.zone], p=cid&&HCIRCLE.PEOPLE&&HCIRCLE.PEOPLE[cid]; if(p&&p.model) out.add(p.model); }catch(e){} return out; }; }   /* 店員的底模不給無名路人（店裡不會有第二個阿姨）*/
        HCIRCLE._aa519=true; } }
    if(typeof STORY!=='undefined'){
      if(STORY.noodleDay&&!S._nd0){ S._nd0=STORY.noodleDay; STORY.noodleDay=function(day){ if(S.tripDay(day)) return false; return S._nd0.apply(this,arguments); }; }   /* 8-4：那一週麵店團不排 */
      if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('SUP519.phone',e); } });
      if(Array.isArray(STORY.PRE_PAIR)) STORY.PRE_PAIR.push((zoneId,GM)=>{ S.bind(GM); });
      if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM)=>{ S.bind(GM); return false; }); }
    if(typeof OUT!=='undefined'&&OUT.plan&&!OUT._aa519){ const pl0=OUT.plan; OUT.plan=function(G,o){ if(S.tripBlocks(G,o)) return false; return pl0.apply(this,arguments); }; OUT._aa519=true; }   /* 8-4：那一週不排新的麵店出遊（舊存檔已經排好的照 storyDue 照演）*/
    if(typeof INVITE_DATA!=='undefined'&&INVITE_DATA&&Array.isArray(INVITE_DATA.places)){ const P=INVITE_DATA.places.find(p=>p&&p.id==='noodle'); if(P&&!P._aa519){ const av0=P.avail; P.avail=(G,day)=>!S.tripDay(day)&&(!av0||av0(G,day)); P._aa519=true; } }   /* 8-4：那一週不排新的麵店邀約（INV：「阿鳳麵店那個時間沒開。」改天）*/
  };
  /* ---------- 手機（STORY.PHONE_RULES）---------- */
  S.phone=function(G){ if(!law(G)) return; S.tripPhone(G); };
  S.wire();
  return S;
})();
if(typeof window!=='undefined') window.SUP519=SUP519;
