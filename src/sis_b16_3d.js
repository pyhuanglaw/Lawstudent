/* ===== 學姊第十六批：回臺灣以後的最後半年（AA_523，企劃線 0d7b5388b；SIS-B16-1028、SIS-LEAD-1021、D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b16_events.js（照稿不改字）。改在現有檔的寫在 sis_b16_events.js 開頭。這個檔：
   - 第 1 節 A（交往中）：
       1-1 12/24 11:00「滷肉飯。今天。不要再說明天。」（r2y4a3d.js y4_pickup_tmr；接機戀人版選「先回家睡覺。」）收到以後排 12:00 公館（出遊；沒到＝不補）。
       1-2 1/19（五）21:00 私訊 →「好。」＝1/20（六）14:00 她家（出遊 2 小時）；「明天不行。」＝她一句、不排。計畫本最後一格旁邊那一行看 S.planNote。
       1-3 書桌夜（r3_events.js ev_sis_y4_desks）3/28～4/11 第一個有去的週三：again 那一段的輪流旁白換成 ev_sis16_job（S.jobDue、S.jobDesk）；
           4/11 以前都沒演到＝4/15（日）21:00 私訊兩則，也記 SIS16_JOB_A（'msg'）。
       1-4 5/11（五）21:00 私訊 →「好。」＝5/12（六）07:00 新體育館（出遊 1.5 小時）。美國路線第四十天選「想什麼？」的多兩句（S.day40Shop：回的時候記 SIS16_DAY40_SHOP；
           舊存檔照手機裡那一則的回覆）。
       1-5 6/2 研究室生日選「修正本我陪妳改。」（postgrad3d.js 記 SIS16_REV_PROMISE）：6/4（一）21:00 私訊 → 6/5（二）19:00 研究室（出遊到 23:00）；沒到＝6/5 23:00 一則。
   - 第 2 節 B（朋友以上、沒交往、不是前任）：
       2-1 演過 12-7（SIS_BLANK_JAN）：2/16（五）21:00 私訊（期限 2/19 21:00）→「有一本，我找了很久。」＝2/20（二）17:00 總圖門口（出遊）；沒到＝2/21 12:00 一則（書在 Café 櫃台）。
           拿到書以後到 3/15 21:00 以前在 Café、總圖（閱覽室、大廳、研究小間、總圖門口）找她說話＝還了（SISY23.preTalk 包一層，不另外演）；沒有＝3/15 21:00「書。」。
       2-2 3/3～3/24 週六 10～12 她在傅鐘旁邊的長椅（characters.js）、走到她旁邊先演（3D）；2-3 3/26～4/13 平日 17:00～17:30 總圖門口（3D）。
       2-4 6/22（五）22:00 私訊 →「好。」＝6/23（六）10:00 法圖門口（A、B）。
       2-5 臺灣、日本路線，美國那一通選「那換我打給妳。」（r2y4b_events.js 記 SIS16_T7B）：12/25（一）14:00 私訊（期限 18:00）→「（打過去）」＝電話（出遊「打給她」）。
   - 第 3 節 家族群組（在群組的人都收到）：3-1 1/10 21:00、3-2 3/20 20:30（→ 3/22 19:00～21:00 法圖討論室 A 的 3D）、3-4 6/29 21:00；
       3-3 生日 Kevin 19:30 那一則改成家族群組的人都收到（postgrad3d.js S.bdayKnown；C、D 只能回「生日快樂。」）、C 典禮上看她一眼（6/2 13:00～14:30 椰林大道，3D 旁白）。
   - 第 4 節 R（美國路線、12/23 回來時沒在交往的前任；沒有在走 4-1 她要的時間）：2/19～3/2 平日 17:00～17:30 總圖門口（3D），一次。
   - 第 5 節：5-3（r3_3d.js 問 S.dayOffMakeup）、5-4（S7-L2 選「那現在還好嗎？」記 SIS7_ASK_LATER → 5/28 22:00 私訊）、5-5（S7-L8 選「一起參加典禮。」記 SIS7_PHOTO → postgrad3d.js 保溫瓶）：
       閒聊階梯選了哪一個＝STORY.ladReply 包一層（同 sis_b14_3d.js）。
   - 第 6 節：6-10 大四上招呼兩句的條件（STORY.LADDER_GREET_IF）、6-15 大四寒假找她說話（S.winterLine，story3d.js talkSis 問）。
   - 2D 背景：新體育館游泳池沒有圖＝gym_pool（這裡登記 OUT.BG image:null＝深色底＋地點字幕；tests/scene_bg_keys_unit.js 的 PENDING，BB 跟使用者要圖）。
   測試：node tests/aa523_sis_b16_unit.js */
'use strict';
const SISB16=(function(){
  const S={}, ID='heroine_05', L=typeof SISB16_LINES!=='undefined'?SISB16_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  S.isEx=G=>!S.dating(G)&&!!(G&&G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  S.friendUp=G=>S.dating(G)||(!S.isEx(G)&&stageOk('FRIEND'));   /* A 或 B */
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const got=(G,tag)=>(G.msgs||[]).some(m=>m&&m.tag===tag);   /* 已經送到手機（不是還在排隊）*/
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'family_law');
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };   /* alarm：跳過時間、睡覺都停在出發前（同 sis_b14／b15）*/
  const inDays=(G,a,b)=>{ const x=D(a), y=D(b); return x!=null&&y!=null&&G.day>=x&&G.day<=y; };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const WHO={k:{from:'kevin',name:'Kevin'},s:{from:ID,name:'溫學姊'},j:{from:'family_junior',name:'佳穎'}};
  const g=([w,t])=>Object.assign({th:'g:family_law',text:t},WHO[w]);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const ask2=(id,until,yes,no,noRep,go)=>({id,until,opts:[{t:yes,set:{[go]:true}},{t:no,set:{[go]:false},say:[{from:ID,text:noRep}]}]});   /* 「好。」＝排出遊；不行＝她一句 */
  /* 那一天人在國外（寒暑假出國 VAC.abroadOn；同 sis_b15_3d.js S.awayOn）：訊息照收、沒有「好。」*/
  S.awayOn=(G,d)=>(typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d})))||(typeof VAC!=='undefined'&&!!VAC.abroadOn&&!!VAC.abroadOn(G,d));
  const askGo=(id,until,G,d,yes,no,noRep,go)=>{ const a=ask2(id,until,yes,no,noRep,go); if(S.awayOn(G,d)) a.opts=a.opts.slice(1); return a; };

  /* ---------------- 1-1 12/24 滷肉飯 ---------------- */
  S.LUROU={day:'2028-12-24'};
  S.LUROU_OUT={id:'sisb16_lurou',ev:'ev_sis16_lurou',h:12,late:0.5,place:'公館',title:'公館・那家滷肉飯（學姊）',travel:'走路 約 15 分鐘',travelH:0.25,hours:1};
  S.lurouOk=G=>law(G)&&S.dating(G)&&!!G.flags.SIS_PICKUP_TMR&&G.flags.SIS_PICKUP==='lover';   /* 戀人版接機選「先回家睡覺。」（家族共乘、兩個人版的那一則照舊，這一批只給 A）*/
  S.lurou=function(G){ const d=D(S.LUROU.day); if(d==null||G.day!==d||G.flags.SIS16_LUROU!=null||!S.lurouOk(G)||!got(G,'y4_pickup_tmr')) return;   /* 11:00 那則送到了才排 */
    if(now(G)<T(d,S.LUROU_OUT.h+S.LUROU_OUT.late)) plan(G,Object.assign({},S.LUROU_OUT,{day:d})); };

  /* ---------------- 1-2 1/20 美國寄回來的最後一箱 ---------------- */
  S.BOX={ask:'2029-01-19',day:'2029-01-20'};
  S.BOX_OUT={id:'sisb16_box',ev:'ev_sis16_box',h:14,late:0.5,place:'學姊的新家',title:'學姊家（美國寄回來的箱子）',travel:'捷運 約 30 分鐘',travelH:0.5,hours:2};   /* 車程同 AA_512 13-2、AA_516 2-5 */
  S.boxOk=G=>law(G)&&S.dating(G)&&here(G)&&!abroad(G);
  S.box=function(G){ const F=G.flags, a=D(S.BOX.ask), d=D(S.BOX.day), tag='sisb16_box_ask'; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(d,S.BOX_OUT.h)&&S.boxOk(G)){ const M=(L.boxAsk||[]).map(dm); M[M.length-1].ask=askGo(tag,T(d,S.BOX_OUT.h),G,d,L.boxYes,L.boxNo,L.boxNoRep,'SIS16_BOX_GO'); PHONE.at(G,a,21,M,tag); }
    if(F.SIS16_BOX_GO===true&&F.SIS16_BOX==null){ const q=outGet(G,S.BOX_OUT.id);
      if(!S.dating(G)){ if(q&&q.state==='planned') q.state='cancelled'; }   /* 1/20 已經不在交往＝不演 */
      else if(now(G)<T(d,S.BOX_OUT.h+S.BOX_OUT.late)) plan(G,Object.assign({},S.BOX_OUT,{day:d})); } };
  /* 計畫本最後一格旁邊那一行：臺灣、日本路線、接機是戀人版＝'exit'；美國路線（同一班回來）＝'us'；其他（接機沒到、兩個人版、家族共乘）＝null */
  S.planNote=G=>{ const F=(G&&G.flags)||{}; if(route(G)==='US') return 'us'; return F.SIS_PICKUP==='lover'?'exit':null; };

  /* ---------------- 1-3 研究單位回信了 ---------------- */
  S.JOB={from:'2029-03-28',to:'2029-04-11',dm:'2029-04-15'};
  S.jobDue=G=>!!G&&law(G)&&S.dating(G)&&!G.flags.SIS16_JOB_A&&inDays(G,S.JOB.from,S.JOB.to);
  S.jobDesk=async function(GM,ev0){ const G=GM&&GM.G, ev=evOf('ev_sis16_job'); if(!ev||!S.jobDue(G)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[ev.id]=(R.done[ev.id]|0)+1; R.last[ev.id]=G.day;   /* 先記（同 SISB15.preTalk）*/
    await EVENTS.runLines(ev.dialogue,ev0||ev); if(!G.flags.SIS16_JOB_A) G.flags.SIS16_JOB_A='desk'; return true; };
  S.jobMsg=function(G){ const d=D(S.JOB.dm), tag='sisb16_job_dm'; if(d==null||G.day<d||G.day>d+2||sent(G,tag)||G.flags.SIS16_JOB_A||!law(G)||!S.dating(G)||now(G)<T(d,21)) return;
    PHONE.at(G,d,21,(L.jobDm||[]).map(dm),tag); G.flags.SIS16_JOB_A='msg'; };

  /* ---------------- 1-4 5/12 游泳、早餐店 ---------------- */
  S.SWIM={ask:'2029-05-11',day:'2029-05-12'};
  S.SWIM_OUT={id:'sisb16_swim',ev:'ev_sis16_swim',h:7,late:0.5,place:'新體育館',title:'新體育館（學姊游泳）',travel:'走路 約 10 分鐘',travelH:1/6,hours:1.5};
  S.swim=function(G){ const F=G.flags, a=D(S.SWIM.ask), d=D(S.SWIM.day), tag='sisb16_swim_ask'; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(d,S.SWIM_OUT.h)&&law(G)&&S.dating(G)){ const M=(L.swimAsk||[]).map(dm); M[M.length-1].ask=askGo(tag,T(d,S.SWIM_OUT.h),G,d,L.swimYes,L.swimNo,L.swimNoRep,'SIS16_SWIM_GO'); PHONE.at(G,a,21,M,tag); }
    if(F.SIS16_SWIM_GO===true&&F.SIS16_SWIM_A==null){ const q=outGet(G,S.SWIM_OUT.id);
      if(!S.dating(G)){ if(q&&q.state==='planned') q.state='cancelled'; }
      else if(now(G)<T(d,S.SWIM_OUT.h+S.SWIM_OUT.late)) plan(G,Object.assign({},S.SWIM_OUT,{day:d})); } };
  /* 美國路線、第四十天（2028-09-11 sisb13_day40）選「想什麼？」（她回「家裡樓下那家早餐店。……」）：回的時候記 SIS16_DAY40_SHOP；之前的存檔照手機裡那一則的回覆（訊息超過 200 則會被刪，刪了就算沒有）*/
  S.day40Shop=G=>{ if(!G||!G.flags||route(G)!=='US') return false; if(G.flags.SIS16_DAY40_SHOP) return true; const m=typeof PHONE!=='undefined'&&PHONE.byAsk?PHONE.byAsk(G,'sisb13_day40'):null; return !!m&&m.ans===0; };

  /* ---------------- 1-5 6/5 修正本 ---------------- */
  S.REV={ask:'2029-06-04',day:'2029-06-05'};
  S.REV_OUT={id:'sisb16_rev',ev:'ev_sis16_rev',h:19,late:0.5,place:'霖澤館・研究室',title:'研究室（學姊的修正本）',travel:'走路 約 10 分鐘',travelH:1/6,hours:4};
  S.rev=function(G){ const F=G.flags, a=D(S.REV.ask), d=D(S.REV.day), tag='sisb16_rev_dm'; if(a==null||d==null||G.day<a||G.day>d+1||!F.SIS16_REV_PROMISE) return;
    if(!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(d,S.REV_OUT.h)&&law(G)&&S.dating(G)) PHONE.at(G,a,21,(L.revDm||[]).map(dm),tag);   /* 不用回：送到就排（照畢業以後篇的出遊）*/
    if(got(G,tag)&&F.SIS16_REV==null){ const q=outGet(G,S.REV_OUT.id);
      if(!S.dating(G)){ if(q&&q.state==='planned') q.state='cancelled'; }
      else if(!q&&now(G)<T(d,S.REV_OUT.h+S.REV_OUT.late)) plan(G,Object.assign({},S.REV_OUT,{day:d})); } };
  S.revMissed=function(G,q){ const d=q&&q.day!=null?q.day:D(S.REV.day); if(!G||!G.flags||G.flags.SIS16_REV!=null||d==null||typeof PHONE==='undefined') return; PHONE.at(G,d,23,[dm(L.revMiss)],'sisb16_rev_miss'); };

  /* ---------------- 2-1 下學期要的書 ---------------- */
  S.BOOK={ask:'2029-02-16',until:'2029-02-19',day:'2029-02-20',miss:'2029-02-21',due:'2029-03-15'};
  S.BOOK_OUT={id:'sisb16_book',ev:'ev_sis16_book',h:17,late:0.5,place:'總圖門口',title:'總圖門口（學姊借的書）',travel:'走路 約 10 分鐘',travelH:1/6,hours:0.5};
  S.bookOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&(has(ID,'SIS_BLANK_JAN')||done(G,'ev_sis_blank_jan'))&&contact(G);   /* 演過 12-7（記憶 SIS_BLANK_JAN）、沒交往、不是前任 */
  S.book=function(G){ const F=G.flags, a=D(S.BOOK.ask), u=D(S.BOOK.until), d=D(S.BOOK.day), due=D(S.BOOK.due), tag='sisb16_book_ask'; if(a==null||u==null||d==null||due==null||G.day<a) return;
    if(G.day<=u&&!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(u,21)&&S.bookOk(G)){ const m=dm(L.bookAsk); m.ask={id:tag,until:T(u,21),opts:(L.bookOpts||[]).map(o=>Object.assign({t:o.t,say:[{from:ID,text:o.r}]},o.k?{set:{SIS16_BOOK:true}}:{}))}; PHONE.at(G,a,21,[m],tag); }
    if(F.SIS16_BOOK===true&&F.SIS16_BOOK_GOT==null&&G.day<=d&&now(G)<T(d,S.BOOK_OUT.h+S.BOOK_OUT.late)) plan(G,Object.assign({},S.BOOK_OUT,{day:d}));
    if(F.SIS16_BOOK===true&&F.SIS16_BOOK_GOT!=null&&!F.SIS16_BOOK_RET&&G.day>=due&&G.day<=due+2&&now(G)>=T(due,21)&&!sent(G,'sisb16_book_due')){   /* 3/15 以前沒在 Café、總圖找她還書 */
      const m=dm(L.bookDue); m.ask={id:'sisb16_book_due',opts:[{t:L.bookDueOpt,say:[{from:ID,text:L.bookDueRep}]}]}; PHONE.at(G,due,21,[m],'sisb16_book_due'); } };   /* 不扣分、不追 */
  S.bookGot=function(G){ if(G&&G.flags&&G.flags.SIS16_BOOK_GOT==null) G.flags.SIS16_BOOK_GOT=G.day; };
  S.bookMissed=function(G,q){ const d=q&&q.day!=null?q.day:D(S.BOOK.day); if(!G||!G.flags||G.flags.SIS16_BOOK_GOT!=null||d==null||typeof PHONE==='undefined') return;
    PHONE.at(G,d+1,12,[dm(L.bookMiss)],'sisb16_book_miss'); G.flags.SIS16_BOOK_GOT=d+1; };   /* 書放在 Café 櫃台（2/21 起算拿到了）*/
  /* 還書：拿到書以後、3/15 21:00 以前，在 Café 或總圖（閱覽室、大廳、研究小間、總圖門口 15 m 以內）找她說話（3D）＝還了，不另外演 */
  S.RET_ZONES=['cafe','library','library_hall','library_carrels'];
  S.GATE={x:86.4,z:0,r:15};   /* 總圖大門（同 sis_b11_3d.js S.DEF.door）*/
  S.retWhere=GM=>{ const G=GM&&GM.G; if(!G) return false; if(S.RET_ZONES.includes(G.zone)) return true; if(G.zone!=='campus') return false;
    const P=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; return !!P&&Math.hypot(P.x-S.GATE.x,P.z-S.GATE.z)<=S.GATE.r; };
  S.bookReturn=function(GM){ const G=GM&&GM.G, F=G&&G.flags; if(!F||F.SIS16_BOOK!==true||F.SIS16_BOOK_GOT==null||F.SIS16_BOOK_RET||G.day<F.SIS16_BOOK_GOT) return false; const due=D(S.BOOK.due);
    if(due==null||now(G)>=T(due,21)||!S.retWhere(GM)) return false; F.SIS16_BOOK_RET=G.day; return true; };

  /* ---------------- 2-2、2-3、3-2、3-3、4-1 的條件（3D，事件在 sis_b16_events.js）---------------- */
  S.READER={from:'2029-03-03',to:'2029-03-24'}; S.JUNIOR={from:'2029-03-26',to:'2029-04-13'}; S.VISIT='2029-03-22'; S.GRAD='2029-06-02'; S.EXDOOR={from:'2029-02-19',to:'2029-03-02',back:'2028-12-23'};
  S.readerOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FRIEND')&&inDays(G,S.READER.from,S.READER.to)&&here(G)&&!abroad(G);   /* B */
  S.juniorOk=G=>law(G)&&!!G.flags.met_sis&&!S.dating(G)&&!S.isEx(G)&&stageOk('FAMILIAR')&&inDays(G,S.JUNIOR.from,S.JUNIOR.to)&&here(G)&&!abroad(G);   /* B、C */
  /* 法圖討論室 A（同 sis_b15_3d.js S.inDisc：北側那一排房間、那一間的 x 範圍、一樓）*/
  S.DISC='discA';
  S.inDisc=GM=>{ const E=GM&&GM.E, P=E&&E.player&&E.player.obj&&E.player.obj.position, LL=typeof LAWLIB_LAYOUT!=='undefined'?LAWLIB_LAYOUT:null; if(!P) return false; if(!LL||!Array.isArray(LL.rooms)) return true;
    const r=LL.rooms.find(q=>q.id===S.DISC); if(!r) return true; return (E.player.lv|0)===0&&P.x>=r.x0&&P.x<=r.x1&&P.z<LL.frontZ; };
  S.visitOk=(G,GM)=>law(G)&&!!G.flags.met_sis&&inGrp(G)&&!S.isEx(G)&&G.day===D(S.VISIT)&&here(G)&&!abroad(G)&&S.inDisc(GM);
  S.visitRel=function(G){ if(typeof SOCIAL==='undefined'||!SOCIAL.adjust||!SOCIAL.rel) return; SOCIAL.adjust(ID,{fam:3,comf:1}); const r=SOCIAL.rel(ID); if(r.fam<20) r.fam=20; };   /* 熟悉 +3、安心 +1；還不到熟悉的（12/28 才認識的 D）演完到熟悉（SOCIAL.stage：fam 20）*/
  /* 椰林大道（東西向，z＝0；兩側的人行道、大王椰子到 z＝±14；西端大門到東端總圖）*/
  S.AVE={x0:-112,x1:70,z:14};
  S.onAvenue=GM=>{ const G=GM&&GM.G, P=GM&&GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; if(!G||G.zone!=='campus'||!P) return false; return P.x>=S.AVE.x0&&P.x<=S.AVE.x1&&Math.abs(P.z)<=S.AVE.z&&((GM.E.player.lv|0)===0); };
  S.ceremonyOk=(G,GM)=>law(G)&&!!G.flags.met_sis&&inGrp(G)&&!S.isEx(G)&&!S.friendUp(G)&&stageOk('FAMILIAR')&&G.day===D(S.GRAD)&&S.onAvenue(GM);   /* C（熟悉；朋友以上的有保溫瓶那一段）*/
  /* R：前任、美國路線、12/23 回來時沒在交往（分開那天在 12/23 以前；沒有紀錄＝當作很久以前）、沒有在走 4-1 她要的時間（這一次分開還沒演 ev_sis_three_conditions）*/
  S.rOk=G=>{ if(!law(G)||route(G)!=='US'||!S.isEx(G)) return false; const b4=typeof SISB4!=='undefined'?SISB4:null, bd=b4&&b4.breakDay?b4.breakDay(G):null, back=D(S.EXDOOR.back);
    if(bd!=null&&back!=null&&bd>=back) return false; const rb=b4&&b4.rebuild?b4.rebuild(G):null; return !(rb&&rb.done); };
  S.exDoorOk=G=>!!G.flags.met_sis&&S.rOk(G)&&inDays(G,S.EXDOOR.from,S.EXDOOR.to)&&here(G)&&!abroad(G);

  /* ---------------- 2-4 6/23 還書 ---------------- */
  S.RET={ask:'2029-06-22',day:'2029-06-23'};
  S.RET_OUT={id:'sisb16_return',ev:'ev_sis16_return',h:10,late:0.5,place:'法圖門口',title:'法圖（學姊還書）',travel:'走路 約 10 分鐘',travelH:1/6,hours:1};
  S.retOk=G=>law(G)&&!!G.flags.met_sis&&S.friendUp(G)&&contact(G);
  S.ret=function(G){ const F=G.flags, a=D(S.RET.ask), d=D(S.RET.day), tag='sisb16_return_ask'; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&now(G)>=T(a,22)&&now(G)<T(d,S.RET_OUT.h)&&S.retOk(G)){ const M=(L.returnAsk||[]).map(dm); M[M.length-1].ask=askGo(tag,T(d,S.RET_OUT.h),G,d,L.returnYes,L.returnNo,L.returnNoRep,'SIS16_RETURN_GO'); PHONE.at(G,a,22,M,tag); }
    if(F.SIS16_RETURN_GO===true&&F.SIS16_RETURN==null&&now(G)<T(d,S.RET_OUT.h+S.RET_OUT.late)) plan(G,Object.assign({},S.RET_OUT,{day:d})); };

  /* ---------------- 2-5 12/25 白天的電話 ---------------- */
  S.DAYCALL={day:'2028-12-25',h:14,until:18};
  S.DAYCALL_OUT={id:'sisb16_day_call',ev:'ev_sis16_day_call',late:1,place:'電話',title:'打給學姊',verb:'打給她',must:true,call:true,travel:'',travelH:0,back:'電話結束。',alarm:false};   /* 同 r2y4a3d.js 除夕「打給妳。」那一通（must：只有「打給她」）*/
  S.dayCallOk=G=>law(G)&&!!G.flags.SIS16_T7B&&route(G)!=='US'&&!S.dating(G)&&!S.isEx(G)&&stageOk('FRIEND')&&contact(G);   /* B、臺灣日本路線、美國那一通選了 t7b */
  S.dayCall=function(G){ const d=D(S.DAYCALL.day), tag='sisb16_day_call_ask'; if(d==null||G.day!==d||sent(G,tag)||now(G)<T(d,S.DAYCALL.h)||now(G)>=T(d,S.DAYCALL.until)||!S.dayCallOk(G)) return;
    const m=dm(L.dayCall); m.ask={id:tag,until:T(d,S.DAYCALL.until),opts:[{t:L.dayCallGo,post:false,set:{SIS16_DAY_CALL:'go'},sisb16Call:true},{t:L.dayCallLater,set:{SIS16_DAY_CALL:'later'},say:[{from:ID,text:L.dayCallLaterRep}]}]};
    PHONE.at(G,d,S.DAYCALL.h,[m],tag); };   /* 沒回：沒有後續 */

  /* ---------------- 第 3 節 家族群組 ---------------- */
  S.POSTCARD='2029-01-10'; S.VISIT_ASK={day:'2029-03-20',h:20.5}; S.WORK_EVE='2029-06-29';
  const grpAt=(G,key,h,lines,tag)=>{ const d=D(key); if(d==null||G.day<d-1||G.day>d+1||!inGrp(G)) return; PHONE.at(G,d,h,(lines||[]).map(g),tag); };
  S.postcard=G=>grpAt(G,S.POSTCARD,21,L.postcard,'sisb16_postcard');   /* 3-1（全部路線）*/
  S.visitAsk=G=>grpAt(G,S.VISIT_ASK.day,S.VISIT_ASK.h,L.visitAsk,'sisb16_visit_ask');   /* 3-2 前一則（同一晚 21:00 學姊的私訊 M18 在後面）*/
  S.workEve=G=>grpAt(G,S.WORK_EVE,21,L.workEve,'sisb16_work_eve');   /* 3-4 */

  /* ---------------- 5-4 5/28 22:00「明天口試。」---------------- */
  S.ASKL={day:'2029-05-28',h:22,until:16};
  S.askLater=function(G){ const d=D(S.ASKL.day), tag='sisb16_ask_later'; if(d==null||G.day<d||G.day>d+1||sent(G,tag)||now(G)<T(d,S.ASKL.h)||now(G)>=T(d+1,S.ASKL.until)) return;
    if(!law(G)||!G.flags.SIS7_ASK_LATER||!S.friendUp(G)||!contact(G)) return;
    const M=(L.askLater||[]).map(dm); M[M.length-1].ask={id:tag,until:T(d+1,S.ASKL.until),opts:(L.askLaterOpts||[]).map(o=>({t:o.t,say:[{from:ID,text:o.r}]}))}; PHONE.at(G,d,S.ASKL.h,M,tag); };   /* 回覆開到口試（5/29 16:00）以前（稿沒寫期限，子代理解讀）*/

  /* ---------------- 5-3 有 SIS_VDAY_MAKEUP 的 4/27 21:00（r3_3d.js S.dayOff 問）：不給選項，直接排 4/28 河堤 10:00 ---------------- */
  S.dayOffMakeup=function(G,d27){ if(!G||!G.flags||!G.flags.SIS_VDAY_MAKEUP||typeof PHONE==='undefined'||d27==null) return false;
    PHONE.at(G,d27,21,(L.dayOffMakeup||[]).map(dm),'r3_sis_dayoff'); G.flags.SIS_DAY_OFF_PLAN='river'; return true; };   /* 同一個 tag（沒回那一段只看三選一那一則；這一則沒有選項）*/

  /* ---------------- 6-15 大四寒假找她說話 ---------------- */
  S.WINTER={from:'2028-12-25',to:'2029-02-18'};
  S.winterLine=function(G){ if(!G||!G.flags||!law(G)||!inDays(G,S.WINTER.from,S.WINTER.to)) return null; const W=L.winter||[]; if(!W.length) return null;
    const n=G.flags.SIS16_WINTER_N|0; G.flags.SIS16_WINTER_N=n+1; return W[n%W.length]; };   /* 六句照順序輪流 */

  /* ---------------- 回覆 ---------------- */
  S.onAnswer=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(!id||!G||!G.flags) return;
    if(id==='sisb13_day40'&&o&&o.t==='想什麼？') G.flags.SIS16_DAY40_SHOP=true;   /* 美國路線第四十天「想什麼？」（sis_b13_events.js day40Opts 第一個）*/
    if(id==='sisb16_day_call_ask'&&o&&o.sisb16Call){ const d=D(S.DAYCALL.day); if(d!=null&&G.day===d&&now(G)<T(d,S.DAYCALL.until)) plan(G,Object.assign({},S.DAYCALL_OUT,{day:G.day,h:+G.hour||0})); } };

  /* ---------------- 閒聊階梯選了哪一個（STORY.ladPlay 選完叫 STORY.ladReply；同 sis_b14_3d.js）---------------- */
  S.LAD={'S7-L2':{t:'「那現在還好嗎？」',f:'SIS7_ASK_LATER'},'S7-L8':{t:'「一起參加典禮。」',f:'SIS7_PHOTO'}};
  S.onLad=function(G,st,ch,id){ if(id!==ID||!G||!G.flags||!st||!ch) return false; const x=S.LAD[st.id]; if(!x||ch.t!==x.t) return false; G.flags[x.f]=true; return true; };

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const f of [S.lurou,S.box,S.jobMsg,S.swim,S.rev,S.book,S.ret,S.dayCall,S.postcard,S.visitAsk,S.workEve,S.askLater]){ try{ f(G); }catch(e){ console.warn('SISB16 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._sisb16){ PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); PHONE.ON_ANSWER._sisb16=true; }
  if(typeof STORY!=='undefined'&&typeof STORY.ladReply==='function'&&!STORY._sisb16Lad){ const r0=STORY.ladReply;
    STORY.ladReply=function(st,ch,G,id){ try{ S.onLad(G,st,ch,id); }catch(e){ console.warn('SISB16 lad',e); } return r0.apply(this,arguments); }; STORY._sisb16Lad=true; }
  /* 找她說話（3D）：story3d.js talkSis 一開始問 SISY23.preTalk——包一層記「還書」（不演、不擋後面的閒聊）*/
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisb16){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ try{ S.bookReturn(GM); }catch(e){ console.warn('SISB16 book',e); } return p0.apply(this,arguments); },p0,{_sisb16:true}); }
  /* 6-10 大四上的招呼：美國那一句只在她回來以前（12/23 以前）說；回來以後換新的那一句（字在 ladder.js，tools/ladder/import_ladder.py）*/
  if(typeof STORY!=='undefined'&&STORY.LADDER_GREET_IF&&L.greetUS&&L.greetBack){ const back=()=>D('2028-12-23');
    STORY.LADDER_GREET_IF[L.greetUS]={test:G=>{ const b=back(); return b==null||G.day<b; }};
    STORY.LADDER_GREET_IF[L.greetBack]={test:G=>{ const b=back(); return b!=null&&G.day>=b; }}; }
  /* 2D 背景：新體育館游泳池沒有圖＝深色底＋地點字幕（BB 跟使用者要圖）*/
  if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.gym_pool) OUT.BG.gym_pool={label:'新體育館・游泳池',image:null};
  return S;
})();
