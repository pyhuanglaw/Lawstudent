/* ===== 事件包第 2 輪之三（前半）AA_327 2-Y4-01～29 的時間、手機、出遊、美國路線的整串流程（AA-C 2026-10-20 定稿 e284d601；台詞在 data/r2y4a_events.js，不改字）=====
   掛在 STORY.PHONE_RULES（手機：每一輪）、STORY.TICKS（每 0.5 秒：到時間就演）、STORY.WAKE_AT、STORY.ALARMS；美國路線另外掛 EXCH.onArrive（登機抵達）、EXCH.onLand（回到桃園）、
   STORY.interact（會所門口 usClub:'door'）。不改 story3d.js。
   美國路線（2-Y4-16～22；時間都是當地時間，STORY.tzOffset）：
     8/2 抵達＝US1：交往中 19:00 巴士站 → 19:30 草原超市 → 20:15 竹葉亞洲超市 → 21:00 公寓 214 門口 → 21:30 打給媽媽；挽回中＝巴士站一句以後自己走（社區入口），21:30 打給媽媽。加入「交換生」群組。
     9/13 US2：交往中 18:00 私訊、18:30～19:30 坐到 C 棟 208 的高腳椅、20:00 沒到一則、10/16 21:00「拿了 A」；挽回中 19:00 前後人在社區＝帶到 C 棟（還鍋子）。
       AA_453 1-3：交往中 18:00 最後一則要回——「我過去。」＝出遊「C 棟・廚房」18:30（出發就換到 C 棟演，S.us2Stage）；「今天不行。」、沒回＝照舊；自己走去坐高腳椅照舊、先到的直接演。
     11/3 21:00 芝加哥（交往中私訊、挽回中群組；「去。」＝11/11 07:00 出遊兩天）；11/22 21:00 → 11/23 09:00 感恩節的湖邊；12/2 18:00 → 20:00 初雪（交往中：20:15 沒到＝20:30 一則、
     21:30 還沒到＝帶到場；挽回中 20:00 自動到場、REPAIR ≥ 3 才重新開始）；12/13 21:00 → 12/14 19:00 會所晚餐；12/16 07:00 社區門口（鬧鐘 06:30）→ 交往中舊金山一週／挽回中布魯明頓三天
     → 12/21 起飛 → 12/23 05:40 桃園入境大廳 → 家 → 19:00 409（story3d.js roomY4FromAirport）→ 20:00 阿凱。
   REPAIR（BB_194 §8、BB_204 第 4 節對照）：G.flags.REPAIR={heroine_05:n}，一週最多 +1（抵達後第幾週，STORY.routeWeek）。+1 的地方：US2「還沒。」、群組裡芝加哥的邀約有回、US3「那妳想因為什麼？」。
   大四上、寒假（臺灣這邊）：phoneY4／phoneY4b／phoneY4c（邀約、出遊、沒去的訊息、照片；美國路線只有照片，照當地時間）；tickTW（明信片、總圖三樓期刊架、11/6～11/11 霖澤館公告欄的校慶海報、10/26 面試與 2/3 筆試的目標和帶到場、
     寒假總圖那兩句）；在家被帶到場借 STORY.y4HomeDue／y4FromHome（home3d.js 的 loop）；寒假快轉的停點 HOME.STOPS；閒聊階梯 LADDER_HOLD（Y7-L3、A7-L6）。
   測試：node tests/r2y4a_events_unit.js */
'use strict';
const R2Y4A=(function(){
  const S={};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const past=(G,d,h)=>d!=null&&now(G)>=T(d,h);
  const hh=G=>((G.hour%24)+24)%24;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const law=G=>!!G&&(G.stage||'law')==='law';
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const run=(GM,id,o)=>{ const e=evOf(id); return e&&typeof EVENTS!=='undefined'?EVENTS.run(e,o):Promise.resolve(); };
  const S5='heroine_05';
  const isUS=G=>law(G)&&typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='US';
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const inUS=G=>typeof EXCH!=='undefined'&&!!EXCH.inUS&&EXCH.inUS(G);
  /* 出生點：us3d.js 的 US3.SPAWN（載入了才有；測試沒有載 3D）*/
  const SPAWN0={us_outside:{x:-35,z:0,yaw:Math.PI/2},us_market:{x:13.5,z:13.6,yaw:Math.PI},us_asian_market:{x:4.5,z:3.9,yaw:Math.PI},us_apartment:{x:0.4,z:4,yaw:-Math.PI/2},us_shared_kitchen:{x:-3,z:1.8,yaw:Math.PI},us_clubhouse:{x:-28,z:10.6,yaw:Math.PI}};
  const SP=k=>Object.assign({},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN[k])||SPAWN0[k]||{x:0,z:2,yaw:Math.PI});
  const at=(GM,h)=>{ const G=GM.G; if(G.hour<h){ if(GM.advance) GM.advance(h-G.hour); else G.hour=h; } };   /* 跳到當天的某個時間（已經過了就不動）*/
  const toDay=(GM,day,h)=>{ const G=GM.G; if(G.day<day){ if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,day,h); else { G.day=day; G.hour=h; } } else if(G.day===day) at(GM,h); };
  const EXG='us_exchange', EXTH='g:'+EXG;
  const P5=t=>({th:'p:'+S5,from:S5,text:t}), X5=t=>({th:EXTH,from:S5,text:t});
  /* AA_450 1-8：交換生群組裡起頭的改成何俊朗（使用者：「她根本就不是主動在群組會說話的人」AA_218 17-12）；沒見過他的玩家＝寄件人「國際學生會」，句子一樣（傳的那一刻看 MET_LONG）*/
  const LONG=G=>!!(G&&G.flags&&G.flags.MET_LONG)||has('npc_long','MET_LONG');
  const XL=(G,t)=>LONG(G)?{th:EXTH,from:'npc_long',name:'何俊朗',text:t}:{th:EXTH,from:'us_isa',name:'國際學生會',text:t};
  const md=day=>{ if(typeof CALENDAR==='undefined') return ''; const d=CALENDAR.dateOf(day); return d.m+' 月 '+d.d+' 日'; };
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('R2Y4A',e)).finally(()=>{ busy=false; }); return true; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['r2y4a3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.isBusy=()=>busy;
  const outNow=async(GM,o)=>{ if(typeof OUT==='undefined') return false; OUT.plan(GM.G,Object.assign({travel:'',travelH:0,late:1},o)); const q=OUT.get(GM.G,o.id); if(!q||q.state!=='planned') return false; return OUT.go(GM,q); };   /* 帶到場：馬上出發（不問）*/

  /* ===================== REPAIR（挽回）===================== */
  S.repairRec=G=>{ const F=G.flags; if(!F.REPAIR||typeof F.REPAIR!=='object') F.REPAIR={}; if(!F.REPAIR_WK||typeof F.REPAIR_WK!=='object') F.REPAIR_WK={}; return F.REPAIR; };
  S.repairWeek=G=>{ const w=typeof STORY!=='undefined'&&STORY.routeWeek?STORY.routeWeek(G):null; return w!=null?'R'+w:'D'+Math.floor(G.day/7); };
  S.repairAdd=function(G,why,id){ id=id||S5; const R=S.repairRec(G), W=G.flags.REPAIR_WK, wk=S.repairWeek(G); if(W[id]===wk) return false; W[id]=wk; R[id]=(R[id]|0)+1; (G.flags.REPAIR_LOG||(G.flags.REPAIR_LOG=[])).push({id,why,day:G.day}); return true; };
  S.repairOK=G=>(S.repairRec(G)[S5]|0)>=3;   /* 「分手以後沒有再說謊」：美國這半年遊戲裡沒有說謊的機制（YT_LIED 沒有日期），先不看 */
  S.restart=function(G){ const F=G.flags; if(typeof ROM!=='undefined'&&ROM.start){ if(!ROM.start(G,S5)){ F.CLEANUP_DONE=true; ROM.start(G,S5); } } if(!dating(G,S5)) F['dating_'+S5]=true; F.US_RESTART=G.day; };   /* 重新交往（dating_heroine_05）*/

  /* ===================== 2-Y4-16 US1 抵達（EXCH.onArrive）===================== */
  S.us1Due=G=>isUS(G)&&!!G.flags.US_ARRIVED&&!done(G,'ev_us1_arrive');
  S.us1=async function(GM){ const G=GM.G, F=G.flags; if(!isUS(G)) return false;
    if(F.US1==null){ F.US1=dating(G,S5)?'together':'alone'; if(typeof PHONE!=='undefined') PHONE.join(G,EXG,'交換生'); }
    GM.sceneBegin(); try{
      if(!done(G,'ev_us1_arrive')){ if(!inUS(G)) await GM.enter('us_outside',SP('us_outside'),{noFade:true}); at(GM,19); if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); if(GM.fade) await GM.fade(false); await run(GM,'ev_us1_arrive'); }
      if(F.US1==='together'){
        if(!done(G,'ev_us1_market')){ at(GM,19.5); await GM.enter('us_market',SP('us_market')); await run(GM,'ev_us1_market',{noTitle:true}); }
        if(!done(G,'ev_us1_asian')){ at(GM,20.25); await GM.enter('us_asian_market',SP('us_asian_market')); await run(GM,'ev_us1_asian',{noTitle:true}); }
        if(!done(G,'ev_us1_door')){ at(GM,21); await GM.enter('us_apartment',SP('us_apartment')); await run(GM,'ev_us1_door',{noTitle:true}); }
        if(!done(G,'ev_us1_mom')){ at(GM,21.5); await run(GM,'ev_us1_mom',{noTitle:true}); } }
      else if(!F.US1_FREE){ F.US1_FREE=true; if(GM.toast) GM.toast('公寓在社區的另一頭。',3000); } }   /* 挽回中：自己去超市、公寓（toast 照 exchange3d.js 原本的字）*/
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 挽回中的 21:30（所有美國路線都有）；交往中在串裡已經演了 */
  S.momDue=G=>isUS(G)&&G.flags.US1==='alone'&&!done(G,'ev_us1_mom')&&G.flags.US_ARRIVED_DAY===G.day&&G.hour>=21.5&&inUS(G);

  /* ===================== 2-Y4-17 US2（9/13）===================== */
  const D913=()=>D('2028-09-13');
  S.us2Props=function(GM,on){ const z=GM.E&&GM.E.zone; if(GM.G.zone==='us_shared'&&z&&typeof z.us2==='function'&&!!z.us2On!==!!on) z.us2(on); };   /* EVENT_US2：鍋、泡麵、碗、紅筆圈滿的報告（us3d.js）*/
  S.us2RepairDue=G=>{ const d=D913(); return isUS(G)&&abroad(G)&&d!=null&&G.day===d&&hh(G)>=18.75&&hh(G)<20&&!dating(G,S5)&&!G.flags.US2&&['us_outside','us_apartment','us_shared'].includes(G.zone); };
  S.us2Repair=async function(GM){ const G=GM.G; if(G.zone!=='us_shared') await GM.enter('us_shared',SP('us_shared_kitchen')); S.us2Props(GM,true); await run(GM,'ev_us2_repair'); };
  /* AA_453 1-3：交往中 18:00 回「我過去。」排的出遊「C 棟・廚房」：出發就換到 C 棟 208 演（OUT.STAGE，同 us_blank3d.js 的竹葉、圖書館）——
     道具（EVENT_US2）打開、她在爐子前（同 USL.sisSync 9/13 傍晚的位置）、你坐窗口外的高腳椅（seat.lift＞0），畫面用模糊的 3D；演完回到原本的地方 */
  S.US2_OUT='us2_kitchen';
  S.us2Stage=async function(GM,q,ev){ if(!q||q.id!==S.US2_OUT||!ev||ev.id!=='ev_us2_kitchen') return null; const G=GM.G, E=GM.E, P=E&&E.player;
    if(!G||!P||!P.obj||!GM.enter||!isUS(G)||P.riding||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES.us_shared||!Z3.ZONES[G.zone]||(typeof OUT!=='undefined'&&OUT.fromHome)) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const sp=SP('us_shared_kitchen'); await GM.enter('us_shared',{x:sp.x,z:sp.z,yaw:sp.yaw||0},{noFade:true,deferStory:true,noAutosave:true});
    try{ S.us2Props(GM,true); if(GM.npc&&GM.npc[S5]&&GM.removeNPC) GM.removeNPC(S5);
      const n=GM.spawnCharacter?GM.spawnCharacter(S5,-3.2,2.0,{yaw:Math.PI,pose:'idle'}):null; if(n){ n.idlePose=n.pose; n.frozen=true; }
      const bar=((GM.E&&GM.E.zone&&GM.E.zone.seats)||[]).find(s=>s.lift>0); if(bar&&GM.sitAt) GM.sitAt(P,bar); }
    catch(e){ console.warn('R2Y4A.us2Stage',e); }
    let fin=false;
    return {restore:async()=>{ if(fin) return; fin=true; if(P.seat&&GM.standUp) GM.standUp(P); await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };

  /* ===================== 2-Y4-18 芝加哥 ===================== */
  S.chicagoDay2=async function(GM){ const G=GM.G, d12=D('2028-11-12'); if(d12==null) return;
    if(GM.fade) await GM.fade(true); toDay(GM,d12,10); if(GM.titleCard) await GM.titleCard(md(d12),'芝加哥',2200);
    if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); if(GM.fade) await GM.fade(false);
    await run(GM,'ev_us_chicago2',{noTitle:true}); at(GM,21.75); G.flags.US_CHICAGO='went'; };
  /* 這週不行、07:15 還沒上車、沒回：三張照片（交往中私訊；挽回中只在群組）；沒上車的 07:20 先一則。
     AA_450 1-5：「下次一起。」拿掉（11/11 21:00 她已經說過「……下次一起來。」，US_BLANK.CHI）；交往中第一張「📷（湖邊的風）」→「📷（密西根湖，浪很大）」（風拍不到）。
     AA_450 1-8：挽回中的群組版改何俊朗傳（沒見過他＝國際學生會）*/
  S.chicagoMissed=function(G,late){ if(typeof PHONE==='undefined') return; const d11=D('2028-11-11'), d12=D('2028-11-12'); if(d11==null) return; const dt=dating(G,S5), M=dt?P5:t=>XL(G,t); G.flags.US_CHICAGO='missed';
    if(late) PHONE.at(G,d11,7+20/60,[M('巴士要開了。……我們先走。')],'us_chi_late');
    PHONE.at(G,d12,21,[M('📷（密西根湖，浪很大）'),M('📷（博物館的恐龍）'),M('📷（深盤披薩）')],'us_chi_photos'); };   /* AA-B 10-24 23:19：挽回中群組版的第一張也換（風拍不到）*/

  /* ===================== 2-Y4-19 US3 ===================== */
  /* AA_450 1-9：交往中 11/23 岸邊不能有雪（11/25 才「下了一點雪，落地就化了」、12/2 才是第一場會積的雪；AA_448 第 2 節）——原「我自己去了。……下雪了。拍給你。」「📷（一張照片）」；
     1-8：挽回中的群組版改何俊朗傳（沒見過他＝國際學生會）*/
  S.lakeMissed=function(G){ if(typeof PHONE==='undefined') return; const d=D('2028-11-23'); if(d==null) return; G.flags.US3='missed';
    if(dating(G,S5)) PHONE.at(G,d,10,[P5('我自己去了。氣象說錯了，沒有下雪。'),P5('📷（灰色的湖，岸邊沒有人）')],'us3_missed');
    else PHONE.at(G,d,21.5,[XL(G,'📷（湖邊一排人，中間空了一個位子。）'),XL(G,'大家都在。少你一個。')],'us3_missed'); };

  /* ===================== 2-Y4-20 初雪 ===================== */
  /* 交往中：20:15 沒到＝20:30「我還在台階上。雪還沒停。」，窗口延到 21:30；再沒到＝帶到場（US_SNOW_LATE：先一句「你還是去了。」）*/
  S.snowMissed=function(G,q){ const d=D('2028-12-02'); if(d==null) return; if(q&&q.id==='us_snow2'){ G.flags.US_SNOW_FORCE=true; return; }
    if(typeof PHONE!=='undefined') PHONE.at(G,d,20.5,[P5('我還在台階上。雪還沒停。')],'us_snow_wait');
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'us_snow2',ev:'ev_us_first_snow',day:d,h:20.5,late:1,place:'小教堂前的台階',title:'初雪',travel:'',travelH:0,back:'回到公寓。'}); };
  { const e=evOf('ev_us_first_snow'); if(e) e.outingMissed=(G,GM,q)=>S.snowMissed(G,q); }

  /* ===================== 2-Y4-21 會所晚餐 ===================== */
  S.clubMissed=function(G){ const d=D('2028-12-14'); if(d==null||typeof PHONE==='undefined') return; G.flags.US_CLUB_DINNER='missed'; PHONE.at(G,d,21.5,[XL(G,'📷（會所的長桌，盤子都空了。）'),XL(G,'你的那一份，有人幫你留了。')],'us_club_missed'); };   /* AA_450 1-8：何俊朗傳（沒見過他＝國際學生會）*/
  S.clubDue=G=>{ const q=typeof OUT!=='undefined'?OUT.get(G,'us_club'):null, d=D('2028-12-14'); return !!q&&q.state==='planned'&&G.day===d&&hh(G)>=18.75&&hh(G)<20; };

  /* ===================== 2-Y4-22 離開、舊金山／布魯明頓、回臺灣 ===================== */
  const D16=()=>D('2028-12-16');
  S.leaveDue=G=>{ const d=D16(); return isUS(G)&&!!G.flags.US_ARRIVED&&G.flags.US_RETURNED==null&&d!=null&&(G.day>d||(G.day===d&&hh(G)>=7))&&inUS(G)&&!G.flags.US_TRIP_DONE; };
  S.leave=async function(GM){ const G=GM.G, F=G.flags, d16=D16(); if(!S.leaveDue(G)) return false;
    if(F.US_TRIP_MODE==null) F.US_TRIP_MODE=dating(G,S5)?'sf':'bloom';
    if(!done(G,'ev_us_leave')){ if(G.zone!=='us_outside') await GM.enter('us_outside',SP('us_outside')); at(GM,7); await run(GM,'ev_us_leave'); }
    const sf=F.US_TRIP_MODE==='sf';
    const steps=sf?[['ev_sf1',0,20],['ev_sf_photo17',1,10],['ev_sf2',2,10],['ev_sf_photo19',3,13],['ev_sf3',4,15],['ev_sf_photo21',5,12]]   /* SF1 12/16 晚上、SF2 12/18 上午、SF3 12/20 下午；照片 12/17、12/19、12/21（BB_183 第 5 節）*/
                  :[['ev_us_bloom16',0,12],['ev_us_bloom18',2,12],['ev_us_bloom20',4,12],['ev_us_bus21',5,13]];   /* 12/16、12/18、12/20 摘要日；12/21 13:00 社區巴士 */
    GM.sceneBegin(); try{
      for(const [id,dd,h] of steps){ if(done(G,id)) continue; if(GM.fade) await GM.fade(true); toDay(GM,d16+dd,h);
        if(typeof STORY!=='undefined'&&STORY.phoneRules&&typeof PHONE!=='undefined'){ try{ STORY.phoneRules(GM); PHONE.tick(G); }catch(e){ console.warn('R2Y4A trip phone',e); } }   /* 這一週整段在一個劇情裡跑完、直接飛回臺灣：每一天先跑手機規則（AA_451 1-3：媽媽 12/17「棉被曬過了。」在舊金山那幾天收到，不是回家以後才補）*/
        if(GM.titleCard) await GM.titleCard(md(d16+dd),sf?'舊金山':'布魯明頓',2200); if(typeof ADV!=='undefined') ADV.begin({background:sf?'dark':'blur'}); if(GM.fade) await GM.fade(false);
        await run(GM,id,{noTitle:true}); }
      if(sf) F.SF_DONE=true; F.US_TRIP_DONE=true;
      if(GM.fade) await GM.fade(true); toDay(GM,d16+5,23+55/60); }   /* 12/21（四）23:55 舊金山起飛（挽回中：17:00 印第安納波利斯起飛、舊金山轉同一班）*/
    finally{ GM.sceneEnd(); }
    if(typeof EXCH!=='undefined'&&EXCH.returnHome) return EXCH.returnHome(GM,{force:true});
    return true; };
  /* 回到桃園（EXCH.onLand）：入境大廳 → 臺北的家（上午）。之後照 exchange3d.js：睡到下午、19:00 409（roomY4FromAirport）*/
  S.onLand=async function(GM){ const G=GM.G, F=G.flags; if(!isUS(G)) return false; F.US_RETURN=G.day;
    if(typeof ADV!=='undefined') ADV.begin({background:'blur'}); if(GM.fade) await GM.fade(false);   /* blur：落地以後先進入境大廳（airport_arr，AA_340 S10），dark 會把它蓋掉 */
    if(!done(G,'ev_us_return')) await run(GM,'ev_us_return');
    if(!done(G,'ev_us_home')){ at(GM,9); if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); await run(GM,'ev_us_home',{noTitle:true}); }
    if(GM.fade) await GM.fade(true); return true; };

  /* ===================== 手機（STORY.PHONE_RULES）===================== */
  /* 10/16 21:00「改過的報告拿了 A。」傳不傳（交往中、US2 是 there 或 missed）：下面 phoneUS 那一則和美國快轉的 10/16 21:00 停點（us_life3d.js FIXED）共用（BUG-US-WKND-EMPTYSTOP-1025）*/
  S.us2GradeOn=G=>{ const F=(G&&G.flags)||{}; return (F.US2==='there'||F.US2==='missed')&&dating(G,S5); };
  S.phoneUS=function(G){ const F=G.flags;
    if(F.US_ARRIVED&&abroad(G)) PHONE.join(G,EXG,'交換生');   /* 舊存檔（抵達以後才有這個事件包）*/
    /* ---- US2 ---- */
    { const d=D913(); if(d!=null&&G.day>=d&&G.day<=d+40){
        if(G.day===d&&dating(G,S5)&&past(G,d,18)&&hh(G)<19.5&&!F.US2&&!PHONE.sent(G,'us2_msg')){ const L=[P5('報告被退回來了。'),P5('……我在煮麵。C 棟，廚房。要不要吃。')];
          L[1].ask={id:'us2_ask',until:T(d,19.5),opts:[{t:'我過去。',say:[{from:S5,text:'樓下的門，按 208。'}]},{t:'今天不行。',say:[{from:S5,text:'好。'}]}]}; PHONE.at(G,d,18,L,'us2_msg'); }   /* AA_453 1-3：最後一則改成要回的（原本不用回，一快轉就錯過）；回的是哪一個看手機的回覆紀錄（ans），不加旗標 */
        { const m=PHONE.byAsk(G,'us2_ask'); if(m&&m.ans===0&&!F.US2&&now(G)<T(d,19.5)&&typeof OUT!=='undefined'&&!OUT.get(G,S.US2_OUT))
            OUT.plan(G,{id:S.US2_OUT,ev:'ev_us2_kitchen',day:d,h:18.5,late:1,place:'C 棟・廚房',title:'C 棟・廚房',travel:'走路 約 5 分鐘',travelH:1/12,back:'回到社區。',alarm:true}); }   /* 「我過去。」＝排 18:30（到 19:30 都能出發）；出發就帶到 C 棟 208 演 ev_us2_kitchen（S.us2Stage）。快轉停在出發前（USL.nextStop 算出遊）；「今天不行。」、沒回＝照舊 19:30 以後 20:00 那一則 */
        { const q=F.US2&&typeof OUT!=='undefined'?OUT.get(G,S.US2_OUT):null; if(q&&q.state==='planned') q.state='done'; }   /* 自己走過去、坐高腳椅先演了（ev_us2_kitchen 記 US2）：不再問「出發」，不會演兩次 */
        if(PHONE.sent(G,'us2_msg')&&!F.US2&&past(G,d,19.5)){ F.US2='missed'; PHONE.at(G,d,20,[P5('麵我吃完了。報告我自己再改一次。')],'us2_missed'); }   /* 20:00 */
        const dA=D('2028-10-16'); if(dA!=null&&S.us2GradeOn(G)&&past(G,dA,21)&&G.day<=dA+7&&!PHONE.sent(G,'us2_grade')) PHONE.at(G,dA,21,[P5('改過的報告拿了 A。教授說：『這次我讀到妳了。』')],'us2_grade'); } }   /* 「10 月中」＝10/16（一）21:00（AA_340 第 11 週；AA_345 F10、I8 定案：F10 寫的 18:00 作廢）*/
    /* ---- 芝加哥（11/3 21:00）---- */
    { const d3=D('2028-11-03'), d11=D('2028-11-11'); if(d3!=null&&G.day>=d3&&G.day<=d11+1){
        if(past(G,d3,21)&&now(G)<T(d11,7)&&!PHONE.sent(G,'us_chi_ask')){ const dt=dating(G,S5), L=dt?[P5('下週末去芝加哥。巴士早上七點出發，帶厚外套。'),P5(F.MET_LONG||has('npc_long','MET_LONG')?'何俊朗也去。他說他知道哪一家的披薩最好吃。……到了再看。':'香港來的那個同學也去，我們一起認識他。')]:[XL(G,'下週末有人要去芝加哥嗎。巴士早上七點。')];   /* AA_450 1-6：「……我們去驗證。」是可昕的話（經濟系 10/11）→「……到了再看。」；1-8：挽回中的群組改何俊朗傳（沒見過他＝國際學生會）*/
          L[L.length-1].ask={id:'us_chi',until:T(d11,7),opts:[{t:'去。',set:{US_CHI:'go'}},{t:'這週不行。',set:{US_CHI:'no'}}]}; PHONE.at(G,d3,G.day===d3?Math.max(21,G.hour):21,L,'us_chi_ask'); F.US_CHI_DATING=dt; }
        const m=PHONE.byAsk(G,'us_chi');
        if(m&&m.ans!=null&&!F.US_CHI_DATING&&!F.US_CHI_REP){ F.US_CHI_REP=true; S.repairAdd(G,'chicago_reply'); }   /* 挽回中：群組裡芝加哥的邀約，祐廷有回（BB_204 第 4 節「每週」那一列；AA_450 1-8 起是何俊朗起頭，照舊算）*/
        if(F.US_CHI==='go'&&typeof OUT!=='undefined'&&!OUT.get(G,'us_chicago')) OUT.plan(G,{id:'us_chicago',ev:'ev_us_chicago',day:d11,h:7,late:0.25,place:'社區門口（長途巴士）',title:'芝加哥的週末',travel:'',travelH:0,back:'回到社區。'});
        if(m&&!F.US_CHICAGO&&(F.US_CHI==='no'||(m.ans==null&&now(G)>=T(d11,7)))) S.chicagoMissed(G,false); } }   /* 沒回＝沒去（照「這週不行」）*/
    /* ---- US3（11/22 21:00）---- */
    { const d22=D('2028-11-22'), d23=d22!=null?d22+1:null; if(d22!=null&&G.day>=d22&&G.day<=d23&&past(G,d22,21)&&now(G)<T(d23,9.25)&&!PHONE.sent(G,'us3_ask')){
        PHONE.at(G,d22,G.day===d22?Math.max(21,G.hour):21,[dating(G,S5)?P5('明天開始放感恩節。氣象說會下雪。我想去湖邊看。九點，會所門口。'):XL(G,'感恩節第一天，大家要去湖邊。九點，會所門口集合。')],'us3_ask');   /* AA_450 1-8：挽回中改何俊朗傳（沒見過他＝國際學生會）*/
        if(typeof OUT!=='undefined'&&!OUT.get(G,'us3_lake')) OUT.plan(G,{id:'us3_lake',ev:'ev_us3_lake',day:d23,h:9,late:0.25,place:'會所門口',title:'感恩節的湖邊',travel:'',travelH:0,back:'回到社區。'}); } }
    /* ---- 初雪（12/2 18:00）---- */
    { const d=D('2028-12-02'); if(d!=null&&G.day>=d&&G.day<=d+1){
        if(G.day===d&&past(G,d,18)&&hh(G)<20.25&&!F.US_SNOW&&!PHONE.sent(G,'us_snow_msg')){
          if(dating(G,S5)){ PHONE.at(G,d,18,[P5('今晚會下今年第一場真的會積起來的雪。'),P5('八點，小教堂前面的台階。')],'us_snow_msg'); F.US_SNOW_MODE='together';
            if(typeof OUT!=='undefined'&&!OUT.get(G,'us_snow')) OUT.plan(G,{id:'us_snow',ev:'ev_us_first_snow',day:d,h:20,late:0.25,place:'小教堂前的台階',title:'初雪',travel:'',travelH:0,back:'回到公寓。'}); }
          else { const LG=t=>({th:EXTH,from:'npc_long',name:'何俊朗',text:t}); PHONE.at(G,d,18,[LG('今晚會積雪。'),LG('上次那種落地就化了。這次會積起來。')],'us_snow_msg'); F.US_SNOW_MODE='repair';   /* 交換生群組：何俊朗傳（AA_345 F10；沒見過他的玩家只是看到一個名字）。AA_452 1-2：第二句換掉「不是 X，是 Y」*/
            if(typeof OUT!=='undefined'&&!OUT.get(G,'us_snow_r')) OUT.plan(G,{id:'us_snow_r',ev:'ev_us_snow_repair',day:d,h:20,late:3,place:'小教堂前的台階',title:'初雪',travel:'',travelH:0,back:'回到公寓。'}); } }   /* AA_452 1-1：照交往中排進行程（19:45 問「出發：初雪」、到 23:00 都能去；「不去了」＝沒演）。原本只有 20:00～23:00 人在美國自動到場，快轉停在 19:45、一按「到下一個有事的日子」就跳過，挽回第 4 步整步沒有 */
        if(F.US_SNOW_QUIET&&past(G,d+1,8+10/60)&&!PHONE.sent(G,'us_snow_next')) PHONE.at(G,d+1,8+10/60,[P5('昨天你問我還好嗎。……其實不太好。回去再跟你說。')],'us_snow_next'); } }
    /* ---- 會所晚餐（12/13 21:00）---- */
    /* AA_450 1-8：何俊朗傳兩則（沒見過他＝國際學生會）；帶什麼菜的三個選項掛在最後一則（原本學姊一則「明天晚上七點，會所。學期最後一頓。每個人帶一道菜。」）*/
    { const d13=D('2028-12-13'); if(d13!=null&&G.day>=d13&&G.day<=d13+1&&past(G,d13,21)&&now(G)<T(d13+1,19)&&!PHONE.sent(G,'us_club_ask')){ const L=[XL(G,'明天晚上七點，會所。學期最後一頓。'),XL(G,'每個人帶一道菜。泡麵也算。')];
        L[L.length-1].ask={id:'us_club',until:T(d13+1,19),opts:[{t:'滷一鍋茶葉蛋。',set:{US_CLUB_DISH:'egg'}},{t:'最後一包台灣泡麵，煮成一大鍋。',set:{US_CLUB_DISH:'noodle'}},{t:'什麼都沒煮，帶了一疊紙盤。',set:{US_CLUB_DISH:'plates'}}]};
        PHONE.at(G,d13,G.day===d13?Math.max(21,G.hour):21,L,'us_club_ask');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'us_club')) OUT.plan(G,{id:'us_club',ev:'ev_us_club_dinner',day:d13+1,h:19,late:1,place:'會所',title:'會所晚餐',travel:'',travelH:0,back:'回到社區。'}); } }
    /* ---- 回到臺灣：20:00 阿凱（msg_kai_back_us；BB_198，台詞 AA 新寫）---- */
    if(F.US_RETURNED!=null&&G.day>=F.US_RETURNED&&G.day<=F.US_RETURNED+1&&past(G,F.US_RETURNED,20)&&!PHONE.sent(G,'msg_kai_back_us')){ const K=t=>({th:'p:kai',from:'kai',text:t});
      const L=[K('回來了？'),K('所以時差調了沒'),K('宵夜 我在宿舍樓下')]; L[2].ask={id:'msg_kai_back_us',opts:[{t:'下去。',say:[{from:'kai',text:'所以你還是沒調'}]},{t:'先睡了。',say:[{from:'kai',text:'好 明天'}]}]};
      PHONE.at(G,F.US_RETURNED,20,L,'msg_kai_back_us'); } };

  /* ===================== 大四上（臺灣這邊）的手機：邀約、出遊、沒去的照片（美國路線人在美國：只有照片，時間照當地）===================== */
  const loc=(G,d,h)=>{ const tz=typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,d):0; const t=T(d,h)+tz, dd=Math.floor(t/24); return {day:dd,h:t-dd*24}; };   /* 臺灣時間 → 玩家的當地時間 */
  const atTW=(G,d,h,items,tag)=>{ const l=loc(G,d,h); return PHONE.at(G,l.day,l.h,items,tag); };
  const pastTW=(G,d,h)=>{ const l=loc(G,d,h); return past(G,l.day,l.h); };
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const outOf=(G,id)=>typeof OUT!=='undefined'?OUT.get(G,id):null;
  const gone=(G,id,d,h)=>{ const o=outOf(G,id); return !!o&&(o.state==='missed'||(o.state==='planned'&&now(G)>T(d,h)+(o.late!=null?o.late:0.75))); };   /* 沒去（過了時間還沒出發也算）*/
  const plan=(G,o)=>typeof OUT!=='undefined'&&!OUT.get(G,o.id)&&OUT.plan(G,o);
  S.phoneY4=function(G){ const F=G.flags, us=isUS(G);
    /* ---- 2-Y4-01 迎新：8/31 21:00 系學會（法律系（全班））→ 9/2 13:00；沒去、美國路線＝21:30 照片 ---- */
    { const d=D('2028-09-02'), di=D('2028-08-31'); if(d!=null&&di!=null&&G.day>=di&&G.day<=d+2&&PHONE.inGroup(G,'law_class')){ const C=t=>({th:'g:law_class',from:'law_assoc',name:'系學會',text:t});
        if(!us&&past(G,di,21)&&now(G)<T(d,13.25)&&!PHONE.sent(G,'y4_welcome_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[C('禮拜六迎新，一點在社科院旁的草地集合。大四的學長姊有空也來。')],'y4_welcome_ask');
          plan(G,{id:'y4_welcome',ev:'ev_y4_welcome',day:d,h:13,late:0.25,place:'社科院旁的草地',title:'迎新（大四）',travel:'捷運 約 30 分鐘',travelH:0.5}); }   /* 9/3 才搬進 409：從臺北的家出門 */
        if((us||gone(G,'y4_welcome',d,13))&&!done(G,'ev_y4_welcome')&&pastTW(G,d,21.5)&&!PHONE.sent(G,'y4_welcome_photo')){ atTW(G,d,21.5,[C('📷（新生坐在第一排，手上拿著名牌。）')],'y4_welcome_photo'); F.WELCOME_Y4='missed'; } } }
    /* ---- 2-Y4-02 颱風假：9/17 20:00 停課公告；9/18 08:00 T4b（老師的信 9/17 21:30 寄的、早上才看到＋群組）；美國路線都沒有 ---- */
    { const d17=D('2028-09-17'), d18=d17!=null?d17+1:null; if(d17!=null&&!us&&G.day>=d17&&G.day<=d18+1){
        if(past(G,d17,20)&&!PHONE.sent(G,'y4_ty_notice')) PHONE.at(G,d17,G.day===d17?Math.max(20,G.hour):20,[{th:'sys',who:null,text:'颱風假：明天（9/18）停班停課。'}],'y4_ty_notice');
        if(past(G,d18,8)&&!PHONE.sent(G,'y4_ty_mail')){ PHONE.postAt(G,{th:'sys',who:null,name:'老師（信）',text:'明日停課。',tag:'y4_ty_mail'},d17,21.5); PHONE.postAt(G,{th:'sys',who:null,name:'老師（信）',text:'報告的期限不會停。照舊。',tag:'y4_ty_mail'},d17,21.51);
          if(PHONE.inGroup(G,'law_class')){ const L=[]; if(knows('yu',G)) L.push({th:'g:law_class',from:'yu',text:'這是本學期最強制的一封信。'}); const zq={th:'g:law_class',from:'zhe',text:'颱風可以聲明異議嗎？'};
            zq.ask={id:'y4_ty_reply',opts:[{t:'颱風不是當事人。不能聲明異議。',say:knows('classmate_xinci',G)?[{from:'classmate_xinci',text:'……這句可以寫進報告。'}]:[]},{t:'先吃泡麵。',say:[{from:'zhe',text:'大四了，還是泡麵'}]}]}; L.push(zq);
            PHONE.at(G,d18,G.day===d18?Math.max(8,G.hour):8,L,'y4_ty_group'); }
          if(!F.TYPHOON_Y4) F.TYPHOON_Y4='phone'; } } }
    /* ---- 2-Y4-03 中秋：10/2 21:00 阿哲（麵店團；不在群組＝和阿哲 FAMILIAR 以上的私訊）→ 10/3 18:00；沒到 21:30 照片；美國路線 19:30 照片（可昕另外一句）；可昕沒見過麵店團＝22:00 私訊 ---- */
    { const d=D('2028-10-03'), di=d!=null?d-1:null; if(d!=null&&G.day>=di&&G.day<=d+1){ const inG=PHONE.inGroup(G,'noodle_team'), th=inG?'g:noodle_team':'p:zhe', Z=t=>({th,from:'zhe',text:t}), ok=inG||(knows('zhe',G)&&stageAt('zhe','FAMILIAR'));
        if(!us&&ok&&past(G,di,21)&&now(G)<T(d,18.25)&&!PHONE.sent(G,'y4_ma_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[Z('明天中秋 河濱 六點'),Z('烤肉架我借好了')],'y4_ma_ask');
          plan(G,{id:'y4_midautumn',ev:'ev_y4_midautumn',day:d,h:18,late:0.25,place:'公館的河濱',title:'中秋烤肉（大四）',travel:'走過去約 15 分鐘',travelH:0.25}); }
        if(!us&&gone(G,'y4_midautumn',d,18)&&!done(G,'ev_y4_midautumn')&&past(G,d,21.5)&&!PHONE.sent(G,'y4_ma_photo')){ PHONE.at(G,d,21.5,[Z('📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')],'y4_ma_photo'); F.MIDAUTUMN_Y4='missed'; }
        if(us&&inG&&pastTW(G,d,19.5)&&!PHONE.sent(G,'y4_ma_us')){ const L=[Z('📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')]; if(dating(G,'kexin')&&F.KX_MET_NOODLE_TEAM) L.push({th:'g:noodle_team',from:'kexin',text:'阿哲今年贏了。……你不在，我沒力氣講冷笑話。'}); atTW(G,d,19.5,L,'y4_ma_us'); F.MIDAUTUMN_Y4='missed'; }   /* 可昕見過麵店團：跟著照片在群組說 */
        if(us&&dating(G,'kexin')&&!F.KX_MET_NOODLE_TEAM&&pastTW(G,d,22)&&!PHONE.sent(G,'y4_ma_us_kx')&&!(G.msgs||[]).some(m=>m.tag==='y4_ma_us'&&m.from==='kexin')) atTW(G,d,22,[{th:'p:kexin',from:'kexin',text:'阿哲今年贏了。……你不在，我沒力氣講冷笑話。'}],'y4_ma_us_kx');   /* 可昕沒見過麵店團＝那句改私訊（句子不改），照臺灣版：臺灣 22:00、不看群組（AA_370 M7、第 6 節第 5 題）；舊存檔 19:30 已經跟著照片發過的不再發 */
        if(!us&&dating(G,'kexin')&&!F.KX_MET_NOODLE_TEAM&&past(G,d,22)&&!PHONE.sent(G,'y4_ma_kx')) PHONE.at(G,d,22,[{th:'p:kexin',from:'kexin',text:'中秋快樂。……我們這邊也在烤。'}],'y4_ma_kx'); } }
    /* ---- 2-Y4-07 校慶：11/10 21:00 法服群組（法服成員）---- */
    { const d=D('2028-11-10'); if(d!=null&&!us&&G.day>=d&&G.day<=d+1&&past(G,d,21)&&typeof STORY!=='undefined'&&STORY.fafuMember&&STORY.fafuMember(G)&&PHONE.inGroup(G,'lawclub_study')&&!PHONE.sent(G,'y4_fair_ask')){ const J=t=>({th:'g:lawclub_study',from:'fafu_jr',name:'學妹',text:t});   /* 這一屆的社長（學妹），不給名字 */
        PHONE.at(G,d,G.day===d?Math.max(21,G.hour):21,[J('明天校慶，攤位十點開。'),J('大四的學長姊有空回來坐。')],'y4_fair_ask'); } }
    /* ---- 2-Y4-08 交棒：不在場（沒有條件、那晚沒去、美國路線）＝22:00 Alison 在麵店團群組 ---- */
    { const d=D('2028-11-30'); if(d!=null&&G.day>=d&&G.day<=d+2&&PHONE.inGroup(G,'noodle_team')&&knows('yu',G)&&knows('heroine_01',G)&&!done(G,'ev_plg_handover')&&pastTW(G,d,22)&&!PHONE.sent(G,'y4_plg_photo')){ const Y=t=>({th:'g:noodle_team',from:'yu',text:t});
        atTW(G,d,22,[Y('📷（白板，只剩一行字）'),Y('以安交棒了。白板只剩一條。')],'y4_plg_photo'); F.PLG_HANDOVER='heard'; } }
    /* ---- 2-Y4-10 聖誕交換禮物：12/21 21:00 阿哲（麵店團）→ 12/22 19:00；沒到、美國路線＝21:30 照片 ---- */
    { const d=D('2028-12-22'), di=d!=null?d-1:null; if(d!=null&&G.day>=di&&G.day<=d+1&&PHONE.inGroup(G,'noodle_team')){ const Z=t=>({th:'g:noodle_team',from:'zhe',text:t});
        if(!us&&past(G,di,21)&&now(G)<T(d,19.25)&&!PHONE.sent(G,'y4_xmas_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[Z('明天考完 聖誕交換禮物'),Z('七點 麵店 一百五以內')],'y4_xmas_ask');
          plan(G,{id:'y4_xmas',ev:'ev_y4_xmas',day:d,h:19,late:0.25,place:'阿鳳麵店',title:'聖誕交換禮物（大四）',travel:'走過去約 15 分鐘',travelH:0.25}); }
        if((us||gone(G,'y4_xmas',d,19))&&!done(G,'ev_y4_xmas')&&past(G,d,21.5)&&!PHONE.sent(G,'y4_xmas_photo')){ PHONE.at(G,d,21.5,[Z('📷（每個人手上的禮物，都很眼熟。）')],'y4_xmas_photo'); F.XMAS_Y4='missed'; } } }   /* 美國路線那時在回臺灣的路上：照臺灣時間（AA_370 第 6 節第 8 題，同 L3 的 y4_kx_grades0；原本 atTW 換算成 12/22 早上）*/
  };

  /* ===================== 推甄（2-Y4-06）：成績三級（AA_185 0b 第 2 件）＋推薦信 ===================== */
  const BH='classmate_bohan', YT='heroine_03', KX='kexin';
  S.pushOn=G=>{ if(!law(G)||!G.flags||G.flags.Y4_PATH!=='grad') return false; const r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null; return r!=='JP'&&r!=='US'; };   /* 台灣路線（未決定也算，同 y34b3d.js）、選②（10/16 才選的也算）；日本、美國路線延畢＝2030 筆試 */
  /* 大一～大三每學期法律科（期末考五題）的平均答對：4 題以上＝高、3 題以上＝中、不到 3 題＝低；六個學期取平均（沒有考試紀錄的學期不算；一個都沒有＝中）*/
  S.pushLevel=function(G){ const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):(G.courses||{}), E=(R&&R.exam)||{}, byT={};
    for(const k in E){ const m=/^(Y[1-3]S[12]):[^:]+:final$/.exec(k), e=E[k]; if(!m||!e||e.status!=='done'||typeof e.correct!=='number') continue; (byT[m[1]]||(byT[m[1]]=[])).push(e.correct); }
    const lv=Object.values(byT).map(a=>{ const v=a.reduce((s,x)=>s+x,0)/a.length; return v>=4?3:v>=3?2:1; }); if(!lv.length) return 'mid';
    const a=lv.reduce((s,x)=>s+x,0)/lv.length; return a>=2.5?'high':a>=1.5?'mid':'low'; };
  S.letter=G=>{ const P=(G.social&&G.social.prof)||{}; return Object.keys(P).some(id=>{ const p=P[id]; return !!p&&((p.part|0)+(p.perf|0)+(p.office|0)*2+(p.research|0))>=20; }); };   /* 推薦信：有一位教授記得你（SOCIAL.profKnowsYou 的同一條線）*/
  S.pushPass=G=>{ const l=S.pushLevel(G); return l==='high'||(l==='mid'&&S.letter(G)); };
  /* 2-Y4-27 研究所筆試的結果：2028-09-04～2029-02-02 在總圖（含法律學院圖書館）的天數 ≥ 24（裁定第 2 點；G.habits 的 place:／seat: 紀錄）。考完那一刻記 GRAD_EXAM_2029_PASS（放榜在 2-Y4-34）*/
  S.libDays=function(G,a,b){ const H=G.habits||{}, set=new Set(); for(const k in H){ if(!/^(place|seat):(library|library_hall|lawlib):/.test(k)) continue; for(const d of (H[k].days||[])) if(d>=a&&d<=b) set.add(d); } return set.size; };
  S.gradExamPass=G=>{ const F=G.flags||{}; if(typeof F.GRAD_EXAM_2029_PASS==='boolean') return F.GRAD_EXAM_2029_PASS; const a=D('2028-09-04'), b=D('2029-02-02'); return a!=null&&b!=null&&S.libDays(G,a,b)>=24; };

  /* ===================== 大四上（臺灣這邊）的手機之二：大四要怎麼過的姊姊、語彤、推甄、可昕的實習 ===================== */
  S.phoneY4b=function(G){ const F=G.flags, us=isUS(G), SIS=t=>({th:'p:sister',from:'sister',name:'姊姊',text:t});
    /* ---- 2-Y4-04 再問一次：隔天 09:00 姊姊一則（有 SISTER_TALK；選④兩次＝照 undecided 那一列）---- */
    if(F.Y4_PATH_ASK2!=null&&!PHONE.sent(G,'y4_path_sis')){ const P=PHONE.rec(G); (P.cut||(P.cut=[])).push('y4_path_sis'); }   /* 再問一次以後 Y4_PATH_DAY 換成 10/16：story3d.js 1A-08 那一則不要再發（隔天由下面這一則代替；選④兩次照 undecided）*/
    if(F.Y4_PATH_ASK2!=null&&F.SISTER_TALK&&G.day<=F.Y4_PATH_ASK2+2&&past(G,F.Y4_PATH_ASK2+1,9)&&!PHONE.sent(G,'y4_path_sis2')&&typeof STORY!=='undefined'&&STORY.y4PathSisLine){
      const line=F.Y4_PATH_TWICE?STORY.y4PathSisLine({flags:Object.assign({},F,{Y4_PATH:'undecided'})}):STORY.y4PathSisLine(G);
      PHONE.at(G,F.Y4_PATH_ASK2+1,9,[{th:'p:sister',who:null,text:'（昨晚你在家人群組打了一行字，又刪掉。最後只傳給姊姊。）'},SIS(line)],'y4_path_sis2'); }
    /* ---- 2-Y4-05 回家再讀：隔天 21:00「讀了嗎」→「讀了」→「嗯」---- */
    if(F.YT_ESSAY==='home'&&typeof F.YT_ESSAY_DAY==='number'&&G.day<=F.YT_ESSAY_DAY+3&&past(G,F.YT_ESSAY_DAY+1,21)&&!PHONE.sent(G,'y4_yt_essay')){ const m={th:'p:'+YT,from:YT,text:'讀了嗎'}; m.ask={id:'y4_yt_essay',opts:[{t:'讀了',say:[{from:YT,text:'嗯'}]}]}; PHONE.at(G,F.YT_ESSAY_DAY+1,21,[m],'y4_yt_essay'); }
    /* ---- 2-Y4-06 推甄 ---- */
    { const d25=D('2028-10-25'); if(d25!=null&&S.pushOn(G)&&G.day>=d25&&G.day<=d25+1&&past(G,d25,21)&&knows(S5,G)&&stageAt(S5,'FRIEND')&&F.Y4_PATH_ASK2==null&&!PHONE.sent(G,'y4_push_note')){   /* 10/25 21:00 學姊的便條照片（她在美國）；AA_378 S3：她要知道你要推甄＝6 月就選了路（Y4_PATH_ASK2 沒有值，她 8/2 出國前就知道），10/16 才選的不傳 */
        const L=[P5('📷（一張手寫的便條）'),{th:'p:'+S5,who:null,text:'（便條：「你可以。」）'}]; if(dating(G,S5)) L.push(P5('考完傳訊息。我這邊是晚上，我等。'));
        L[L.length-1].ask={id:'y4_push_note',opts:[{t:'只有一句。',say:[{from:S5,text:'一句就夠了。'}]},{t:'謝謝。',say:[{from:S5,text:'考完傳訊息。'}]}]};
        PHONE.at(G,d25,G.day===d25?Math.max(21,G.hour):21,L,'y4_push_note'); } }
    { const d=D('2028-11-23'); if(d!=null&&G.day>=d&&G.day<=d+2){ const B=t=>({th:'p:'+BH,from:BH,text:t});
        if(S.pushOn(G)&&past(G,d,15)&&!F.Y4_PUSH){ const ok=S.pushPass(G); F.Y4_PUSH=ok?'pass':'fail'; if(ok) F.GRAD_ADMIT='push';   /* 11/23 15:00 放榜（學校信箱）*/
          PHONE.at(G,d,15,[{th:'sys',who:null,text:ok?'推甄放榜：法律學研究所，錄取。':'推甄放榜：法律學研究所，未錄取。'}],'y4_push_result');
          if(dating(G,KX)&&!F.KX_INTERN_CALL){ F.KX_INTERN_CALL=ok?'pass':'fail'; F.KX_INTERN_DAY=d; plan(G,{id:'y4_kx_intern',ev:'ev_kexin_intern_result',day:d,h:15.5,late:5.5,place:'電話',title:'可昕打來',verb:'接起來',must:true,call:true,travel:'',travelH:0,back:'電話結束。'}); }   /* 2-Y4-15：15:30 她打來（演出來的電話）*/
          if(knows(BH,G)){ const q=B('你上了嗎。'); q.ask={id:'y4_push_bh',opts:[ok?{t:'上了。',say:[{from:BH,text:'我也上了。'},{from:BH,text:'……所以研究所還要跟你同一班。好。我說好的時候是真的好。'}]}:{t:'沒有。',say:[{from:BH,text:'……二月還有考試。我陪你念。順便。'}]}]};
          PHONE.at(G,d,15+10/60,[q],'y4_push_bh');
          const C=[B('明天晚上六點半，麵店。我請。'),B('……阿哲知道的話，會叫我請全部人。')]; C[1].ask={id:'y4_bh_dinner',until:T(d+1,18.75),opts:[{t:'好。',set:{BH_DINNER_GO:true}},{t:'明天不行。',say:[{from:BH,text:'好。下次。'}],set:{BH_DINNER:'no'}}]};
          PHONE.at(G,d,21.5,C,'y4_bh_dinner_ask'); } }   /* 21:30 柏翰約晚餐（裁定第 1 點：「……阿哲知道的話，會叫我請全部人。」）*/
        if(F.BH_DINNER_GO&&!F.BH_DINNER) plan(G,{id:'y4_bh_dinner',ev:'ev_bh_dinner',day:d+1,h:18.5,late:0.25,place:'阿鳳麵店',title:'阿鳳麵店（柏翰）',travel:'走過去約 15 分鐘',travelH:0.25});
        if(PHONE.inGroup(G,'noodle_team')&&knows(BH,G)&&pastTW(G,d,21)&&!PHONE.sent(G,'y4_push_group')) atTW(G,d,21,[{th:'g:noodle_team',from:'yu',text:'柏翰推甄上了！'},{th:'g:noodle_team',from:BH,text:'……嗯。'}],'y4_push_group'); } }   /* 所有認識柏翰的玩家（美國路線照當地時間）*/
    /* ---- 2-Y4-15 可昕的實習：推甄沒上＝隔天 21:00；沒申請＝11/22 21:00（美國路線＝當地 08:00）；交換延畢 2030-03-15 ---- */
    if(dating(G,KX)){ const K=t=>({th:'p:'+KX,from:KX,text:t}), d22=D('2028-11-22');
      if(F.KX_INTERN_CALL==='fail'&&!F.KX_INTERN_EXAM&&typeof F.KX_INTERN_DAY==='number'&&past(G,F.KX_INTERN_DAY+1,21)&&!PHONE.sent(G,'y4_kx_intern_next')) { PHONE.at(G,F.KX_INTERN_DAY+1,21,[K('我申請的那家事務所實習，上了。……不用恭喜，先吃飯。')],'y4_kx_intern_next'); F.KX_INTERN=true; }   /* 3/22 筆試那一通（KX_INTERN_EXAM）沒有隔天這則（AA_345 F9）*/
      if(d22!=null&&!F.KX_INTERN&&!S.pushOn(G)&&G.day>=d22-1&&G.day<=d22+3&&pastTW(G,d22,21)&&!PHONE.sent(G,'y4_kx_intern_msg')){ atTW(G,d22,21,[K(us?'事務所的實習，我上了。……你回來要負責宵夜。':'事務所的實習，我上了。……你要負責宵夜。')],'y4_kx_intern_msg'); F.KX_INTERN=true; }
      const d30=D('2030-03-15'); if(d30!=null&&G.day>=d30&&G.day<=d30+3&&F.GRAD_EXAM_RESULT!=null&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)&&past(G,d30,15.5)&&!PHONE.sent(G,'y5_kx_grad')) PHONE.at(G,d30,15.5,[K('你研究所放榜了吧。這次換我負責宵夜。')],'y5_kx_grad'); }
    /* ---- 2-Y4-09 語彤事件 16：12/21 12:10（FRIEND 以上、有聯絡方式）；沒到 20:00 兩則；12/28 12:10（美國路線只有這一天，照原本那兩則）---- */
    { const a=D('2028-12-21'), b=D('2028-12-28'); if(a!=null&&G.day>=a&&G.day<=b+1&&!F.YT16){ const Y=t=>({th:'p:'+YT,from:YT,text:t}), fr=knows(YT,G)&&stageAt(YT,'FRIEND')&&typeof INV!=='undefined'&&INV.hasContact(G,YT);
        if(!us&&fr&&G.day===a&&past(G,a,12+10/60)&&hh(G)<18.75&&!PHONE.sent(G,'y4_yt16_a')) PHONE.at(G,a,12+10/60,[Y('今天我在總圖三樓'),Y('有東西想給你看')],'y4_yt16_a');
        if(!us&&PHONE.sent(G,'y4_yt16_a')&&past(G,a,20)&&!PHONE.sent(G,'y4_yt16_miss')) PHONE.at(G,a,20,[Y('今天沒看到你'),Y('下禮拜四 一樣的地方')],'y4_yt16_miss');
        if(fr&&G.day===b&&past(G,b,12+10/60)&&hh(G)<18.75&&!PHONE.sent(G,'y4_yt16_b')) PHONE.at(G,b,12+10/60,PHONE.sent(G,'y4_yt16_a')?[Y('今天也在三樓')]:[Y('今天我在總圖三樓'),Y('有東西想給你看')],'y4_yt16_b');
        if(past(G,b,18.75)) F.YT16='missed'; } }
  };

  /* ===================== 大四上之三、大四寒假：可昕、學姊接機、以安考前一晚、芷若第二輪明信片（2-Y4-11、13、14、15、23～29）===================== */
  const R_=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const twR=G=>{ const r=R_(G); return r!=='JP'&&r!=='US'; };   /* 台灣路線＝不是 JP、也不是 US（未決定也算；同 y34b3d.js）*/
  const exOf=(G,id)=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return !dating(G,id)&&(F['EX_'+id]===true||!!(Rm[id]&&Rm[id].status==='ex')); };
  const partners=G=>{ const F=(G&&G.flags)||{}, s=new Set(Object.keys(F).filter(k=>/^dating_/.test(k)&&F[k]===true).map(k=>k.slice(7))); const Rm=F.romance||{}; for(const id in Rm) if(Rm[id]&&Rm[id].status==='dating') s.add(id); return [...s]; };
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const onTrip=G=>typeof TRIP!=='undefined'&&!!TRIP.at&&TRIP.at(G);
  const leaveHome=G=>{ if(typeof HOME==='undefined'||!HOME.rec) return; const H=HOME.rec(G); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; H.stayMon=null; };   /* 同 y34b3d.js：從家裡被帶到場 */
  const kxOn=G=>law(G)&&dating(G,KX);
  const K=t=>({th:'p:'+KX,from:KX,text:t});
  const EVX=()=>typeof R2Y4A_EVENTS!=='undefined'?R2Y4A_EVENTS:null;
  const mergeF=(G,k,v)=>{ G.flags[k]=Object.assign({},(G.flags[k]&&typeof G.flags[k]==='object')?G.flags[k]:{},v); };
  const setGoalOnce=(GM,key,text,dest)=>{ const G=GM.G; if(G.flags[key]===G.day) return; G.flags[key]=G.day; if(GM.setGoal) GM.setGoal(text,dest); };   /* 一天設一次（別的劇情改了目標就不搶回來）*/
  const backGoal=GM=>{ if(typeof CLS!=='undefined'&&CLS.setGoal) CLS.setGoal(GM); };

  /* ---- 2-Y4-13 K21（沒去、沒回、美國路線沒接）---- */
  S.k21Missed=function(G){ const F=G.flags; if(F.KX_STUDY_PLAN) return; F.KX_STUDY_PLAN='missed'; const d=D('2028-09-23'); if(d==null||typeof PHONE==='undefined') return;
    if(isUS(G)){ const l=loc(G,d,23); PHONE.at(G,l.day,l.h,[K('今天我自己讀完了。你那邊現在是早上吧。……下次你也要真的讀。')],'y4_kx21_missed'); }   /* 台灣 23:00＝當地 11:00（視訊的時段過了）*/
    else PHONE.at(G,d,16,[K('今天我自己讀完了。'),K('表格我開好了。下次你也要真的讀。')],'y4_kx21_missed'); };   /* 16:00（讀書的時段結束）*/
  /* ---- 2-Y4-14 K22（沒去、美國路線：不算沒去）---- */
  S.k22Missed=function(G){ const F=G.flags; if(F.KX_DIRECTION) return; F.KX_DIRECTION=true; const d=D('2028-11-14'); if(d!=null&&typeof PHONE!=='undefined') atTW(G,d,21.5,[K('我比較想當那個幫人講話的人。今天想清楚了。')],'y4_kx22_missed'); };   /* 讀書會結束以後（台灣 21:30）*/
  /* ---- 2-Y4-24 聖誕（沒去）---- */
  S.kxXmasMissed=function(G){ const F=G.flags, X=F.KX_XMAS||{}; if(X[4]) return; mergeF(G,'KX_XMAS',{4:'missed'}); const d=D('2028-12-25'); if(d!=null&&typeof PHONE!=='undefined') PHONE.at(G,d,22,[K('📷（咖啡店拉下來的鐵門）'),K('聖誕快樂。今天讀了十一個小時。……明天我回高雄。')],'y4_kx_xmas_missed'); };   /* 22:00 打烊 */
  /* ---- 2-Y4-26 KH（沒去、「這次不行。」）---- */
  S.khMissed=function(G){ const F=G.flags, T0=(F.KX_TRIP&&typeof F.KX_TRIP==='object')?F.KX_TRIP:{}; if(T0.Y4WIN) return; mergeF(G,'KX_TRIP',{Y4WIN:'missed'}); const d=D('2029-01-06'); if(d!=null&&typeof PHONE!=='undefined') PHONE.at(G,d,12,[K('📷（讀書計畫表，那一天的格子畫了一輛車）'),K('欠著。考完再去。')],'y4_kh_missed'); };
  /* ---- 2-Y4-29 情人節（沒接）---- */
  S.vdayMissed=function(G){ const F=G.flags, V=F.KX_VDAY||{}; if(V[4]) return; mergeF(G,'KX_VDAY',{4:'missed'}); const d=D('2029-02-14'); if(d!=null&&typeof PHONE!=='undefined') PHONE.at(G,d,22,[K('📷（讀書計畫表）'),K('情人節快樂。十點那一格，今天先空著。')],'y4_kx_vday_missed'); };   /* 十點那一格 */
  /* ---- 2-Y4-25 期末成績：大四上修的法律課（美國路線＝美國的三門課，AA_185 1-5）---- */
  S.US_COURSES=[{id:'us_legal_system',name:'Introduction to the U.S. Legal System'},{id:'us_comp_con',name:'Comparative Constitutional Law'},{id:'us_legal_writing',name:'Legal Writing for International Students'}];
  S.gradeOpts=function(G){ const say=(name,more)=>[{th:'p:'+KX,from:'player',who:null,text:name},{th:'p:'+KX,from:KX,text:'法律倫理。'}].concat(more?[{th:'p:'+KX,from:KX,text:more}]:[]);
    if(R_(G)==='US') return S.US_COURSES.map(c=>({t:c.name,post:false,set:{KX_GRADES_Y4S1:c.id},say:say(c.name,'……你選的那一科，我連課名都沒聽過。')}));
    const L=typeof CLS!=='undefined'&&CLS.termCourses?CLS.termCourses(G,'Y4S1').filter(c=>c.kind==='required'||c.kind==='elective'):[];
    return L.map(c=>({t:c.name,post:false,set:{KX_GRADES_Y4S1:c.id},say:say(c.name,c.id==='legal_ethics'?'……我們連這個都一樣。':null)})); };
  /* ---- 2-Y4-23 學姊 M7 接機：版本（BB_99 2-1）---- */
  S.pickupVer=function(G){ if(dating(G,S5)) return 'lover'; if(exOf(G,S5)) return 'family';   /* 分手過＝群組照看，私訊版都沒有 */
    const two=!partners(G).length&&stageAt(S5,'FRIEND')&&(has(S5,'DROVE_HER')||done(G,'ev_sis_graduation'));   /* 雙方都單身、FRIEND 以上、送過她（DROVE_HER）或去過她的畢業典禮 G4 */
    return two?'two':'family'; };
  const GS=t=>({th:'g:family_law',from:S5,name:'溫學姊',text:t}), GK=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t});
  /* AA_516 1-2（企劃線 a9b87c588）：戀人版 12/20 私訊前面的班機截圖（兌現 12/10 視訊 g6「班次，回去前傳給你。」）；1-6：見過她＝FIRST_MET 或舊存檔的 met_sis（SOCIAL.metD）*/
  S.PICKUP_SHOT='📷（截圖：班機時間，桃園 20:05 抵達）';
  S.metSis=G=>(typeof SOCIAL!=='undefined'&&!!SOCIAL.metD&&SOCIAL.metD(S5))||!!(G&&G.flags&&G.flags.met_sis);
  S.pickupMissed=function(G){ const F=G.flags, v=F.SIS_PICKUP_V, d=D('2028-12-23'); if(F.SIS_PICKUP) return; F.SIS_PICKUP='mrt'; if(d==null||typeof PHONE==='undefined') return;   /* 答應了、20:45 還沒到：不記 PICKED_HER_UP */
    if(v==='two'){ PHONE.at(G,d,20.75,[P5('……沒關係。我搭捷運。')],'y4_pickup_late'); PHONE.at(G,d,21.5,[P5('到了。捷運很快。')],'y4_pickup_late2'); }
    else if(v==='lover'){ PHONE.at(G,d,20.75,[P5('……你沒來。我搭捷運。')],'y4_pickup_late'); PHONE.at(G,d,21.5,[P5('到家再說。')],'y4_pickup_late2'); }
    else { PHONE.at(G,d,20.75,[GK('司機呢？？')],'y4_pickup_late'); PHONE.at(G,d,21.5,[GS('我搭捷運。到了。捷運很快。')],'y4_pickup_late2'); } };
  /* ---- 2-Y4-27 研究所筆試：台灣路線、選②、推甄沒上 ---- */
  S.examOn=G=>law(G)&&twR(G)&&!!G.flags&&G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH==='fail';

  S.phoneY4c=function(G){ const F=G.flags, us=isUS(G);
    /* ---- 2-Y4-11 美國路線：八月她要地址——AA_340 定在 8/10（us_life3d.js 的 usl_zr_0810）；原本這裡 8/20 台灣 21:00 再發一次（y4_zr_addr），AA_370 M1 拿掉 ---- */
    /* ---- 2-Y4-13 K21：9/20 21:00 私訊（政大／總圖）→ 9/23（六）14:00；美國路線 9/20 當地 09:00 兩則 → 9/23 當地 09:00 視訊 ---- */
    { const a=D('2028-09-20'), d=D('2028-09-23'); if(a!=null&&d!=null&&kxOn(G)&&G.day>=a-1&&G.day<=d+1){
        if(!us){
          if(past(G,a,21)&&now(G)<T(d,14)&&!PHONE.sent(G,'y4_kx21_ask')){ const L=[K('這學期，我們約讀書，就真的讀。'),K('讀完才能聊天。'),K('週六下午兩點。政大，還是總圖？')];
            L[2].ask={id:'y4_kx21',until:T(d,14),opts:[{t:'政大。',set:{KX_K21_AT:'nccu'}},{t:'總圖。',set:{KX_K21_AT:'lib'}}]}; PHONE.at(G,a,G.day===a?Math.max(21,G.hour):21,L,'y4_kx21_ask'); }
          if(F.KX_K21_AT==='nccu') plan(G,{id:'y4_kx21',ev:'ev_kexin_study_really',day:d,h:14,late:0.25,place:'政大・自強十舍樓下',title:'約讀書（可昕）',travel:'開車 約 40 分鐘',travelH:2/3});
          if(F.KX_K21_AT==='lib') plan(G,{id:'y4_kx21',ev:'ev_kexin_study_really_lib',day:d,h:14,late:0.25,place:'總圖',title:'約讀書（可昕）',travel:'走過去約 10 分鐘',travelH:1/6,goto:{zone:'library',x:0,z:7,yaw:Math.PI}});   /* 3D 總圖（閱覽室）：到了由 ev_kexin_study_really_lib（auto）演 */
          if(PHONE.sent(G,'y4_kx21_ask')&&!F.KX_K21_AT&&now(G)>=T(d,14.25)) S.k21Missed(G); }   /* 沒回＝沒去 */
        else { const ld=loc(G,d,21);
          if(pastTW(G,a,21)&&!PHONE.sent(G,'y4_kx21_us')) atTW(G,a,21,[K('這學期，我們約讀書，就真的讀。……時差也一樣。'),K('台灣晚上九點，你那邊早上九點。剛好。')],'y4_kx21_us');
          if(PHONE.sent(G,'y4_kx21_us')) plan(G,{id:'y4_kx21v',ev:'ev_kexin_study_really_us',day:ld.day,h:ld.h,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title:'和可昕視訊讀書',travel:'',travelH:0,back:'視訊結束。'}); } } }
    /* ---- 2-Y4-14 K22：11/13 21:00 私訊（去／不去）→ 11/14（二）19:00 政大；美國路線＝沒去那一則（不算沒去）---- */
    { const a=D('2028-11-13'), d=a!=null?a+1:null; if(a!=null&&kxOn(G)&&G.day>=a-1&&G.day<=d+1){
        if(!us){
          if(past(G,a,21)&&now(G)<T(d,19)&&!PHONE.sent(G,'y4_kx22_ask')){ const m=K('明天晚上七點，讀書會。邵鈞也在。你來旁聽，不用說話。'); m.ask={id:'y4_kx22',until:T(d,19),opts:[{t:'去。',set:{KX_K22:'go'}},{t:'不去。',set:{KX_K22:'no'}}]}; PHONE.at(G,a,G.day===a?Math.max(21,G.hour):21,[m],'y4_kx22_ask'); }
          if(F.KX_K22==='go') plan(G,{id:'y4_kx22',ev:'ev_kexin_two_directions',day:d,h:19,late:0.25,place:'政大',title:'兩個方向的讀書會（可昕）',travel:'開車 約 40 分鐘',travelH:2/3});
          if(PHONE.sent(G,'y4_kx22_ask')&&F.KX_K22!=='go'&&now(G)>=T(d,19.25)) S.k22Missed(G); }
        else if(pastTW(G,d,21.5)) S.k22Missed(G); } }
    /* ---- 2-Y4-15 交換延畢以外：筆試放榜那天（2029-03-22，2-Y4-34 的 15:00 寫 GRAD_EXAM_RESULT）15:30 可昕打來；KX_INTERN_EXAM＝這一通（推甄沒上、後來筆試：她的實習 11/24 說過了，AA_345 F9）---- */
    { const d=D('2029-03-22'); if(d!=null&&kxOn(G)&&F.GRAD_EXAM_2029&&F.GRAD_EXAM_RESULT&&G.day===d&&past(G,d,15.5)&&typeof OUT!=='undefined'&&!OUT.get(G,'y4_kx_intern2')){ F.KX_INTERN_CALL=F.GRAD_EXAM_RESULT==='pass'?'pass':'fail'; F.KX_INTERN_DAY=d; F.KX_INTERN_EXAM=true;
        plan(G,{id:'y4_kx_intern2',ev:'ev_kexin_intern_result',day:d,h:15.5,late:5.5,place:'電話',title:'可昕打來',verb:'接起來',must:true,call:true,travel:'',travelH:0,back:'電話結束。'}); } }
    /* ---- 2-Y4-23 學姊 M7 接機（台灣、日本路線；家族群組）：12/20 21:00 → 12/23（六）20:30 入境大廳；沒有人說要去＝21:30「到了。捷運很快。」---- */
    { const a=D('2028-12-20'), d=D('2028-12-23'); if(a!=null&&d!=null&&!us&&PHONE.inGroup(G,'family_law')&&G.day>=a&&G.day<=d+2){
        if(past(G,a,21)&&now(G)<T(d,20)&&!PHONE.sent(G,'y4_pickup_ask')){ const v=S.pickupVer(G), h=G.day===a?Math.max(21,G.hour):21;
          if(v==='lover'){ PHONE.at(G,a,h,[GS('這週六回來。')],'y4_pickup_ask'); PHONE.at(G,a,h,[P5(S.PICKUP_SHOT),P5('這週六，晚上八點。你來。')],'y4_pickup_dm'); F.SIS_PICKUP_V='lover'; }   /* 戀人版：家族群組只說「這週六回來。」；私訊前面多一張班機截圖（AA_516 1-2，兌現 12/10 視訊「班次，回去前傳給你。」）*/
          else { const L=[GS('這週六晚上八點落地。'),GS('……有人有空嗎。')]; if(done(G,'ev_sis_graduation')) L.push(GS('我畢業那天，謝謝你來。'));   /* 去過她的畢業典禮 G4 */
            if(v==='family'&&S.metSis(G)) L[L.length-1].ask={id:'y4_pickup',until:T(d,20),opts:[{t:'我去接。我有車。',set:{SIS_PICKUP_GO:'family'}}]};   /* 另一個是不回；AA_516 1-6：要見過她（met）才有按鈕，沒見過的照樣看到群組那兩句 */
            PHONE.at(G,a,h,L,'y4_pickup_ask');
            if(v==='two'){ const m=P5('……你有空嗎。'); m.ask={id:'y4_pickup_two',until:T(d,20),opts:[{t:'有。',set:{SIS_PICKUP_GO:'two'}},{t:'那天不行。',set:{SIS_PICKUP_NO:true}}]}; PHONE.at(G,a,h,[m],'y4_pickup_dm'); } } }   /* 兩個人：她私訊多一句 */
        if(!F.SIS_PICKUP_V&&F.SIS_PICKUP_GO) F.SIS_PICKUP_V=F.SIS_PICKUP_GO;
        if(F.SIS_PICKUP_V&&!F.SIS_PICKUP) plan(G,{id:'y4_sis_pickup',ev:'ev_sis_pickup',day:d,h:20.5,late:0.25,place:'桃園機場入境大廳',title:'接機（學姊）',travel:'開車 約 50 分鐘',travelH:5/6,alarm:true});   /* alarm：跳過時間、睡覺停在出發前（BUG-KAI-PICKUP-1022；同 X81 8/30）*/
        if(!F.SIS_PICKUP_V&&!F.SIS_PICKUP&&PHONE.sent(G,'y4_pickup_ask')&&past(G,d,21.5)){ F.SIS_PICKUP='mrt'; PHONE.at(G,d,21.5,[GS('到了。捷運很快。')],'y4_pickup_mrt'); }
        if(F.SIS_PICKUP_TMR&&F.SIS_PICKUP&&F.SIS_PICKUP!=='mrt'&&!PHONE.sent(G,'y4_pickup_tmr')){ const t='滷肉飯。今天。不要再說明天。'; PHONE.at(G,d+1,11,[F.SIS_PICKUP==='family'?GS(t):P5(t)],'y4_pickup_tmr'); } } }   /* 「先回家睡覺。」隔天（AA 沒寫幾點，排 11:00）：家族共乘發在群組 */
    /* ---- 2-Y4-24 聖誕：12/24 21:00 私訊（去／不去）→ 12/25（一）19:00 政大山下 ---- */
    { const a=D('2028-12-24'), d=a!=null?a+1:null; if(a!=null&&kxOn(G)&&!abroad(G)&&G.day>=a-1&&G.day<=d+1){
        if(past(G,a,21)&&now(G)<T(d,19)&&!PHONE.sent(G,'y4_kx_xmas_ask')){ const L=[K('明天白天各自讀。'),K('晚上來政大山下，那家咖啡店開到十點。我們讀到打烊。')]; L[1].ask={id:'y4_kx_xmas',until:T(d,19),opts:[{t:'去。',set:{KX_XMAS_Y4:'go'}},{t:'不去。',set:{KX_XMAS_Y4:'no'}}]}; PHONE.at(G,a,G.day===a?Math.max(21,G.hour):21,L,'y4_kx_xmas_ask'); }
        if(F.KX_XMAS_Y4==='go') plan(G,{id:'y4_kx_xmas',ev:'ev_kexin_xmas_y4',day:d,h:19,late:0.25,place:'政大山下・咖啡店',title:'聖誕（可昕）',travel:'開車 約 40 分鐘',travelH:2/3});
        if(PHONE.sent(G,'y4_kx_xmas_ask')&&F.KX_XMAS_Y4!=='go'&&now(G)>=T(d,19.25)) S.kxXmasMissed(G); } }
    /* ---- 2-Y4-25 期末成績：12/22 21:00 一則；1/8 21:00 選一科（她在高雄）---- */
    { const a=D('2028-12-22'), g=D('2029-01-08'); if(a!=null&&g!=null&&kxOn(G)){
        if(G.day>=a-1&&G.day<=a+3&&past(G,a,21)&&!PHONE.sent(G,'y4_kx_grades0')) PHONE.at(G,a,21,[K('成績出來那天，各說一科這學期最滿意的。')],'y4_kx_grades0');   /* 美國路線那時在回臺灣的路上：照台灣時間（AA_370 L3：原本 atTW 用舊金山／美東的時差換算，回來以後顯示成 12/22 早上）*/
        if(PHONE.sent(G,'y4_kx_grades0')&&G.day>=g&&G.day<=g+3&&past(G,g,21)&&!PHONE.sent(G,'y4_kx_grades')){ const opts=S.gradeOpts(G);
          if(opts.length) PHONE.at(G,g,G.day===g?Math.max(21,G.hour):21,[{th:'sys',who:null,text:'成績出來了。',ask:{id:'y4_kx_grades',opts}}],'y4_kx_grades'); } } }   /* 「成績出來了。」：選單的系統字（遊戲不顯示分數）*/
    /* ---- 2-Y4-26 KH：1/2 21:00 私訊 →「好。」＝出發選單「高鐵 07:00（去高雄）」1/6 08:35 左營 ---- */
    { const a=D('2029-01-02'), d=D('2029-01-06'); if(a!=null&&d!=null&&kxOn(G)&&G.day>=a&&G.day<=d+1){ const C=typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES.kexin:null, fare=(C&&C.fare)||2980;
        if(past(G,a,21)&&now(G)<T(d,7)&&!PHONE.sent(G,'y4_kh_ask')){ const L=[K('寒假的旅行，一天也算。……而且今年真的只有一天。'),K('你來高雄。我開車。')];
          L[1].ask={id:'y4_kh',until:T(d,6.75),opts:[{t:'好。',need:{money:fare,why:'高鐵票錢不夠'},set:{KX_KH_Y4:'yes'}},{t:'這次不行。',set:{KX_KH_Y4:'no'}}]}; PHONE.at(G,a,G.day===a?Math.max(21,G.hour):21,L,'y4_kh_ask'); }
        if(F.KX_KH_Y4==='yes') plan(G,{id:'y4_kh',ev:'ev_kexin_trip_winter_y4',day:d,h:8+35/60,late:0.25,place:'高雄・左營站',title:'高鐵 07:00（去高雄）',travel:'高鐵 臺北 07:00 → 左營 08:35',travelH:8+35/60-7,back:'回到臺北。'});
        if(PHONE.sent(G,'y4_kh_ask')&&F.KX_KH_Y4!=='yes'&&now(G)>=T(d,7)) S.khMissed(G); } }   /* 「這次不行。」、沒回＝照沒去 */
    /* ---- 2-Y4-27 以安考前一晚：2/2 21:00 麵店團群組（FRIEND 以上）；交往中 23:10 私訊 ---- */
    { const d=D('2029-02-02'), AN='heroine_01'; if(d!=null&&law(G)&&G.day>=d&&G.day<=d+1){
        if(PHONE.inGroup(G,'noodle_team')&&knows(AN,G)&&stageAt(AN,'FRIEND')&&pastTW(G,d,21)&&!PHONE.sent(G,'y4_an_eve')){ const A=t=>({th:'g:noodle_team',from:AN,text:t}), L=[A('明天考試，今天早點睡。'),A('考完再跟你們說。')];
          L[1].ask={id:'y4_an_eve',until:T(d+1,9),opts:[{t:'加油。',set:{AN_EXAM_EVE:'reply'},say:[{from:AN,text:'好。'}]},{t:'早點睡。',set:{AN_EXAM_EVE:'reply'},say:[{from:AN,text:'好。你們也是。'}]}]}; atTW(G,d,21,L,'y4_an_eve'); }
        if(PHONE.sent(G,'y4_an_eve')&&!F.AN_EXAM_EVE&&now(G)>=T(d+1,9)) F.AN_EXAM_EVE='none';   /* 不回（不扣分）*/
        if(dating(G,AN)&&pastTW(G,d,23+10/60)&&!PHONE.sent(G,'y4_an_eve_dm')){ const A=t=>({th:'p:'+AN,from:AN,text:t}), ex=S.examOn(G), L=ex?[A('明天考完 一起去麵店'),A('大碗')]:[A('明天考完 我想吃麵店的大碗'),A('你可以先去排嗎')];
          L[1].ask={id:'y4_an_eve_dm',opts:[{t:'好。',say:[{from:AN,text:ex?'好。……早點睡。':'好。考完打給你。'}]}]}; atTW(G,d,23+10/60,L,'y4_an_eve_dm'); } } }
    /* ---- 2-Y4-28 除夕：2/12 22:00（她在高雄）三選一；「打給妳。」＝電話；不回＝隔天 10:00 ---- */
    { const d=D('2029-02-12'); if(d!=null&&kxOn(G)&&G.day>=d&&G.day<=d+2){
        if(past(G,d,22)&&!PHONE.sent(G,'y4_kx_ny')){ const L=[K('新年快樂。'),K('我阿嬤問我什麼時候考試。我說八月。她說那過年還讀什麼書。')];
          L[1].ask={id:'y4_kx_ny',until:T(d+1,9.75),opts:[{t:'妳阿嬤說得對。',set:{KX_NY_Y4:'agree'},say:[{from:KX,text:'……你站哪一邊。'}]},{t:'八月考完，帶妳去吃麵店。',set:{KX_NY_Y4:'noodle'},say:[{from:KX,text:'阿姨的麵？好。……考完那天。'}]},{t:'打給妳。',set:{KX_NY_Y4:'call'}}]};
          PHONE.at(G,d,G.day===d?Math.max(22,G.hour):22,L,'y4_kx_ny'); }
        if(F.KX_NY_Y4==='call') plan(G,{id:'y4_kx_ny_call',ev:'ev_kexin_lunar_eve_y4_call',day:G.day,h:G.hour,late:1,place:'電話',title:'打給可昕（除夕）',verb:'打給她',must:true,call:true,travel:'',travelH:0,back:'電話結束。'});
        if(!F.KX_NY_Y4&&PHONE.sent(G,'y4_kx_ny')&&past(G,d+1,10)){ F.KX_NY_Y4='none'; PHONE.at(G,d+1,10,[K('新年快樂。……昨天你沒回。我阿嬤說你一定在讀書。')],'y4_kx_ny_none'); } } }   /* AA 寫「隔天」：排 10:00（同大二除夕）*/
    /* ---- 2-Y4-29 情人節：2/14（三）21:00 視訊（排進出遊；照 BB_124 的節日視訊）---- */
    { const d=D('2029-02-14'); if(d!=null&&kxOn(G)&&G.day>=d-1&&G.day<=d) plan(G,{id:'y4_kx_vday',ev:'ev_kexin_valentine_y4',day:d,h:21,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title:'和可昕視訊（情人節）',travel:'',travelH:0,back:'視訊結束。'}); }
  };

  /* ===================== 2-Y4-11 芷若第二輪明信片：每月一張，到了那天中午放在書桌旁（同 1B-10 Z10，y2b3d.js）；美國路線九～十二月在公寓 214 ===================== */
  const PC2=()=>{ const E=EVX(); return E&&E.PC2||null; };
  S.pc2Rec=G=>{ const F=G.flags; if(!F.ZR_PC2||typeof F.ZR_PC2!=='object') F.ZR_PC2={read:{},sent:{}}; if(!Array.isArray(F.ZR_POSTCARD2)) F.ZR_POSTCARD2=[]; if(!Array.isArray(F.ZR_REPLY2)) F.ZR_REPLY2=[]; return F.ZR_PC2; };
  S.pc2Cards=function(G){ const P=PC2(); if(!P||!law(G)||!knows('heroine_02',G)||!stageAt('heroine_02','FAMILIAR')) return []; const out=[];
    P.cards.forEach((c,i)=>{ const d=D(c.key); if(d==null||now(G)<T(d,12)) return; const nx=P.cards[i+1], end=c.until?T(D(c.until),24):T(D(nx.key),12);
      out.push(Object.assign({},c,{i,day:d,end,zone:(isUS(G)&&c.m>=9&&abroad(G))?'us_apartment':'dorm'})); });   /* 美國路線回來以後，還沒拿的那幾張轉到宿舍 */
    return out; };
  S.pc2Opts=function(G,c){ const P=PC2(), used=G.flags.ZR_REPLY2||[]; return P.replies.filter(o=>!used.includes(o.id)&&!(o.fromCard&&D(c.key)<D(o.fromCard))&&!(o.id==='ticket'&&exOf(G,'heroine_02'))); };   /* 每個選項整年各用一次；戲院那句三月以後、分開過的不出 */
  S.pc2CanReply=(G,c)=>!S.pc2Rec(G).sent[c.key]&&now(G)<c.end&&S.pc2Opts(G,c).length>0;   /* 回寄選單開到下一張寄到以前 */
  S.pc2Pending=function(G){ const R=S.pc2Rec(G); return S.pc2Cards(G).filter(c=>!R.read[c.key]||S.pc2CanReply(G,c)); };
  S.zrToldBefore=function(G,c){ const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'heroine_02'):null, a=D('2029-05-21'), d=D(c.key); return !!R&&Array.isArray(R.history)&&a!=null&&d!=null&&R.history.some(h=>h&&h.ev==='end'&&h.how==='told'&&h.day>=a&&h.day<=d); };   /* AA_524 Z9 */
  const zrLate=G=>{ const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'heroine_02'):null, a=D('2028-08-26'); return !!R&&R.sinceDay!=null&&a!=null&&R.sinceDay>=a; };   /* 8/26 才交往的（BB_119 3-2）第一張照 AA_258 第 5 節：不加熱可可那一行 */
  S.pc2Lines=function(G,c){ const P=PC2(), R=S.pc2Rec(G), L=[], prev=P.cards[c.i-1], pr=prev&&R.sent[prev.key];
    if(c.told&&S.zrToldBefore(G,c)) return [{n:c.told}];   /* AA_524 Z9：寄到以前在 5/21 那一週和她坦白過（r2y4b3d.js S.tellScene → ROM history how:'told'）＝背面只有那一行 */
    if(pr){ const o=P.replies.find(x=>x.id===pr); if(o) L.push({q:o.next}); }   /* 回寄過＝下一張的第一行 */
    for(const t of c.text) L.push({q:t});
    if(c.gf&&dating(G,'heroine_02')&&!zrLate(G)) L.push({q:c.gf});
    if(c.fy&&G.flags.ZR_FY) L.push({n:c.fy});   /* 方奕廷那條路：另一種筆跡的那一行（旁白，AA_345 F3）*/
    if(c.us&&isUS(G)) L.push({q:c.us});
    if(c.back){ L.push({n:c.back[0]}); L.push({q:c.back[1]}); }
    return L; };
  S.pc2Place=function(GM){ const G=GM.G, E=GM.E; if(!E||!E.interactables) return; const P=S.pc2Pending(G).filter(c=>c.zone===G.zone), k=E.interactables.findIndex(it=>it.zrPostcard2);
    if(!P.length){ if(k>=0) E.interactables.splice(k,1); return; } if(k>=0) return;
    const d=E.interactables.find(it=>it.deskStudy); let x=0.7, z=-2.3;
    const it={x,z,radius:0.7,label:'明信片',zrPostcard2:true,onInteract:()=>{ S.pc2Scene(GM).catch(e=>console.warn('R2Y4A 明信片',e)); }};
    if(d){ const C=[[0.35,0.35],[-0.35,0.35],[0.35,-0.35],[-0.35,-0.35]]; it.x=d.x+0.35; it.z=d.z+0.35;   /* 和第一輪（y2b3d.js pcPlace）一樣放書桌靠房間那一側；大四 409 的書桌靠西牆，舊版 d.x-0.35 推進書桌和牆中間、玩家拿不到（BB-B 10-23 FY_PC）*/
      const ap=d.seat&&d.seat.ap; for(const c of C){ it.x=d.x+c[0]; it.z=d.z+c[1]; if(S.pc2Reach(E,it,ap)) break; } if(!S.pc2Reach(E,it,ap)){ it.x=d.x+0.35; it.z=d.z+0.35; } }
    E.interactables.push(it); };
  /* 玩家站得到一個點：離明信片在範圍內、明信片是最近的互動點（不會被「坐在書桌前」蓋掉）、而且從書桌的走近點 ap 走得到
     （美國公寓的書桌椅和床中間有一塊站得住、走不進去的小角落：+0.35 放在那裡；ap 是 nav 測試保證走得到的點，從那裡模擬走一小段） */
  S.pc2Reach=function(E,it,ap){ if(!E||!E.canStand) return true; const others=E.interactables.filter(o=>o!==it&&!o.hidden); let n=0;
    for(let r=0;r<0.7;r+=0.1) for(let a=0;a<(r?16:1);a++){ const x=it.x+Math.cos(a*Math.PI/8)*r, z=it.z+Math.sin(a*Math.PI/8)*r; if(!E.canStand(x,z,0.3)) continue;
      const dd=Math.hypot(x-it.x,z-it.z); if(!others.every(o=>{ const e=Math.hypot(o.x-x,o.z-z); return e>=(o.radius||1.8)||e-(o.prio||0)>dd; })) continue;
      if(!ap||!E.simWalk) return true; if(n++>=6) return false; const w=E.simWalk(ap[0],ap[1],x,z,{dt:1/30}); if(w&&w.ok) return true; }
    return false; };
  S.pc2Scene=async function(GM){ const G=GM.G, F=G.flags, R=S.pc2Rec(G), P=PC2(); const L0=S.pc2Pending(G).filter(c=>c.zone===G.zone); const c=L0.find(q=>!R.read[q.key])||L0[L0.length-1]; if(!c) return false;
    const card={name:'明信片'}, seen1=has('heroine_02','POSTCARDS')||has('heroine_02','POSTCARDS_GROUP')||!!(F.ZR_PC&&F.ZR_PC.read&&Object.keys(F.ZR_PC.read).length);   /* 大三收過第一輪（1B-10）*/
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'});
      if(!R.first){ R.first=G.day; await GM.say(null,seen1?P.first.seen:P.first.none); }
      for(const l of S.pc2Lines(G,c)){ if(l.n) await GM.say(null,l.n); else await GM.say(card,'「'+l.q+'」'); }
      if(!R.read[c.key]){ R.read[c.key]=G.day; if(!F.ZR_POSTCARD2.includes(c.m)) F.ZR_POSTCARD2.push(c.m); }
      if(S.pc2CanReply(G,c)){ const O=S.pc2Opts(G,c); const k=await GM.choose(O.map(o=>({t:'「'+o.t+'」'})).concat([{t:'（先不回）'}]));
        if(k>=0&&k<O.length){ const o=O[k]; R.sent[c.key]=o.id; F.ZR_REPLY2.push(o.id); if(GM.toast) GM.toast('寄出了。',2200); } } }   /* 不寄不扣分 */
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    S.pc2Place(GM); if(GM.autosave) GM.autosave(); return true; };

  /* ===================== 2-Y4-05 總圖三樓的期刊架（10/16 起；美國路線 12/24 起）===================== */
  S.shelfOn=G=>{ const d=D('2028-10-16'), u=D('2028-12-24'); return law(G)&&d!=null&&G.day>=d&&(!isUS(G)||(u!=null&&G.day>=u)); };
  S.shelfPlace=function(GM){ const G=GM.G, E=GM.E; if(!E||!E.interactables||G.zone!=='library') return; const k=E.interactables.findIndex(it=>it.ytEssayShelf);
    if(!S.shelfOn(G)){ if(k>=0) E.interactables.splice(k,1); return; } if(k>=0) return;
    E.interactables.push({x:-9.7,z:2.4,radius:1.0,lv:0,label:'看期刊架',ytEssayShelf:true,onInteract:()=>{ S.shelfLook(GM).catch(e=>console.warn('R2Y4A 期刊架',e)); }}); };   /* 西側書牆（zones3d.js 的 library：shelfWall x=-10.8）*/
  S.shelfLook=async function(GM){ const G=GM.G; GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'}); await GM.say(null,'（系刊。目錄第三篇：〈公館的時間〉。作者：陳語彤。）'); }
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); } if(!G.flags.YT_ESSAY) G.flags.YT_ESSAY='shelf'; return true; };

  /* ===================== 2-Y4-07 校慶的海報：11/6～11/11 霖澤館公告欄（AA_345 F1 新寫；11/12 起撤掉）=====================
     霖澤館的公告欄＝校園霖澤館台階西端外面那一塊（zones3d.js 的 W3.bulletin (16.6,−100.6)，原本掛在霖澤館一樓拱廊的內牆上；正面朝 +z）。法服成員另外有 11/10 21:00 的群組 */
  S.POSTER='（公告欄上貼了一張校慶的海報：「11/11（六）校慶園遊會　椰林大道。法律服務社問答攤　10:00～16:00。租屋、打工、買賣，什麼都可以問。」）';
  S.POSTER_AT={x:16.6,z:-99.5};
  S.posterOn=G=>{ const a=D('2028-11-06'), b=D('2028-11-11'); return law(G)&&a!=null&&b!=null&&G.day>=a&&G.day<=b; };
  S.posterPlace=function(GM){ const G=GM.G, E=GM.E; if(!E||!E.interactables||G.zone!=='campus') return; const k=E.interactables.findIndex(it=>it.fairPosterY4);
    if(!S.posterOn(G)){ if(k>=0) E.interactables.splice(k,1); return; } if(k>=0) return;
    E.interactables.push({x:S.POSTER_AT.x,z:S.POSTER_AT.z,radius:1.4,lv:0,label:'看公告欄',fairPosterY4:true,onInteract:()=>{ S.posterLook(GM).catch(e=>console.warn('R2Y4A 校慶海報',e)); }}); };
  S.posterLook=async function(GM){ GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'}); await GM.say(null,S.POSTER); }
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); } return true; };

  /* ===================== 2-Y4-06 推甄面試：10/26（四）早上目標「10:00 萬才館二樓（推甄面試）」；09:45 起人在二樓就開始、09:50 還沒到＝帶到場 ===================== */
  const IV_GOAL='10:00 萬才館二樓（推甄面試）', IV_SPAWN=()=>Object.assign({x:-6.2,z:5.0,lv:1,yaw:Math.PI},(typeof WANCAI_LAYOUT!=='undefined'&&WANCAI_LAYOUT.upperDoor&&WANCAI_LAYOUT.upperDoor.spawn)||{});
  S.ivOn=G=>{ const d=D('2028-10-26'); return S.pushOn(G)&&d!=null&&G.day===d&&!done(G,'ev_push_interview'); };
  S.ivHere=GM=>{ const G=GM.G, P=GM.E&&GM.E.player; return G.zone==='wancai'&&!!P&&(P.lv|0)===1; };
  S.ivBringDue=G=>S.ivOn(G)&&hh(G)>=9+50/60&&hh(G)<12;
  S.interview=async function(GM,o){ const G=GM.G, F=G.flags; if(!S.ivOn(G)) return false;
    if(!S.ivHere(GM)){ F.PUSH_RAN=true; GM.sceneBegin(); try{ if(o&&o.fromHome) leaveHome(G); if(GM.fade) await GM.fade(true); at(GM,9+55/60); if(GM.enter) await GM.enter('wancai',IV_SPAWN(),{noFade:true}); if(GM.fade) await GM.fade(false); } finally{ GM.sceneEnd(); } }
    else at(GM,9+55/60);   /* 09:55 柏翰從門裡出來 */
    await run(GM,'ev_push_interview'); at(GM,10.25); backGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* ===================== 2-Y4-27 研究所筆試：2/3（六）08:00 起目標「09:00 教學館（研究所筆試）」；08:30 起人在共同教學館門口就開始、08:50 還沒到＝帶到場 ===================== */
  const EX_GOAL='09:00 教學館（研究所筆試）', EX_DOOR={x:2,z:22.8}, EX_SPAWN={x:2,z:20.6,yaw:0};   /* classes3d.js DOORS.common（共同教學館）；從館裡出來的位置 */
  S.exOn=G=>{ const d=D('2029-02-03'); return S.examOn(G)&&d!=null&&G.day===d&&!done(G,'ev_grad_exam'); };
  S.exHere=GM=>{ const G=GM.G, P=GM.E&&GM.E.player, p=P&&P.obj&&P.obj.position; return G.zone==='gongtong'||(G.zone==='campus'&&!!p&&Math.hypot(p.x-EX_DOOR.x,p.z-EX_DOOR.z)<6); };
  S.examBringDue=G=>S.exOn(G)&&hh(G)>=8+50/60&&hh(G)<12;
  const AN_FAM=G=>knows('heroine_01',G)&&stageAt('heroine_01','FAMILIAR');
  S.exam=async function(GM,o){ const G=GM.G, F=G.flags; if(!S.exOn(G)) return false;
    if(!S.exHere(GM)){ GM.sceneBegin(); try{ if(o&&o.fromHome) leaveHome(G); if(GM.fade) await GM.fade(true); at(GM,8+50/60); if(GM.enter) await GM.enter('campus',Object.assign({},EX_SPAWN),{noFade:true}); if(GM.fade) await GM.fade(false); } finally{ GM.sceneEnd(); } }
    else at(GM,8+40/60);   /* 08:40 教學館門口 */
    if(typeof F.GRAD_EXAM_2029_PASS!=='boolean') F.GRAD_EXAM_2029_PASS=S.gradExamPass(G);   /* 9/4～2/2 的總圖天數（考的那一刻定；放榜在 2-Y4-34）*/
    await run(GM,'ev_grad_exam'); at(GM,12.5);
    if(AN_FAM(G)) await run(GM,'ev_grad_exam_after',{noTitle:true});
    backGoal(GM); if(GM.autosave) GM.autosave(); return true; };
  /* 寒假一起讀（期末飯的以安鉤子 HOOK_AN_WINTER_STUDY，termend_lines.js Y4S1；AA_262 第 2 節第 8 點）：寒假的總圖，早上一句；柏翰（推甄沒上、11/24 去了晚餐）在二樓一句。一天各一次 */
  S.winterLib=function(GM){ const G=GM.G, F=G.flags; if(!S.examOn(G)||!GM.caption) return; const a=D('2028-12-25'), b=D('2029-02-02'); if(a==null||b==null||G.day<a||G.day>b) return; const h=hh(G), P=GM.E&&GM.E.player;
    if((G.zone==='library'||G.zone==='library_hall')&&F.HOOK_AN_WINTER_STUDY!=null&&h>=7&&h<12&&F.R2Y4A_WLIB_AN!==G.day){ F.R2Y4A_WLIB_AN=G.day; GM.caption('','（寒假的總圖，早上八點。她每天都比你早到十分鐘。）',4200); return; }
    if(G.zone==='library_hall'&&P&&(P.lv|0)===1&&F.BH_DINNER==='went'&&F.R2Y4A_WLIB_BH!==G.day&&F.R2Y4A_WLIB_AN!==G.day){ F.R2Y4A_WLIB_BH=G.day; GM.caption('','（柏翰在二樓。旁邊的位子，他幫你放了一疊考古題。）',4200); } };

  /* ===================== 大四上、寒假（臺灣這邊）的每 0.5 秒：在家、旅行中不跑（同 y34b3d.js）===================== */
  S.tickTW=function(GM){ const G=GM.G, F=G.flags; if(atHome(G)||onTrip(G)) return false;
    if(G.zone==='dorm'||G.zone==='us_apartment') S.pc2Place(GM);   /* 2-Y4-11 */
    if(G.zone==='library') S.shelfPlace(GM);   /* 2-Y4-05 */
    if(G.zone==='campus') S.posterPlace(GM);   /* 2-Y4-07 校慶的海報 */
    if(F.KX_STUDY_PLAN&&typeof OUT!=='undefined'){ const q=OUT.get(G,'y4_kx21'); if(q&&q.state==='planned'&&q.goto) q.state='done'; }   /* 2-Y4-13 總圖：自己走去、已經演了＝不再問「出發」*/
    S.winterLib(GM);
    /* 2-Y4-06 面試 */
    if(S.ivOn(G)){ const h=hh(G); if(h>=6&&h<10) setGoalOnce(GM,'R2Y4A_IV_GOAL',IV_GOAL,{zone:'wancai',name:'萬才館'});
      if((S.ivHere(GM)&&h>=9.75&&h<12)||S.ivBringDue(G)) return go(()=>S.interview(GM)); }
    /* 2-Y4-27 筆試 */
    if(S.exOn(G)){ const h=hh(G); if(h>=8&&h<9) setGoalOnce(GM,'R2Y4A_EX_GOAL',EX_GOAL,{zone:'campus',label:'共同教學館',name:'共同教學館'});
      if((S.exHere(GM)&&h>=8.5&&h<12)||S.examBringDue(G)) return go(()=>S.exam(GM)); }
    return false; };

  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; if(isUS(G)) S.phoneUS(G); S.phoneY4(G); S.phoneY4b(G); S.phoneY4c(G); };

  /* ===================== 每 0.5 秒（STORY.TICKS）：回傳 true＝開始演了 ===================== */
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)||busy) return false; const F=G.flags;
    if(isUS(G)){
      if(S.us1Due(G)&&F.US1!=null&&G.day===F.US_ARRIVED_DAY&&!done(G,'ev_us1_arrive')) return go(()=>S.us1(GM));   /* 讀檔回到抵達那一段 */
      if(F.US1==='together'&&F.US_ARRIVED_DAY===G.day&&!done(G,'ev_us1_mom')) return go(()=>S.us1(GM));
      if(S.momDue(G)) return go(()=>run(GM,'ev_us1_mom'));
      { const d=D913(); if(d!=null&&G.day===d&&G.zone==='us_shared'){ const P=GM.E&&GM.E.player; S.us2Props(GM,hh(G)>=18&&hh(G)<21);
          if(dating(G,S5)&&!F.US2&&hh(G)>=18.5&&hh(G)<19.5&&P&&P.seat&&P.seat.lift>0) return go(()=>run(GM,'ev_us2_kitchen')); } }   /* 已經坐在高腳椅上等到 18:30 */
      if(S.us2RepairDue(G)) return go(()=>S.us2Repair(GM));
      { const d=D('2028-12-02'); if(d!=null&&G.day===d&&!F.US_SNOW&&inUS(G)){
          if(F.US_SNOW_FORCE) { F.US_SNOW_LATE=true; return go(()=>outNow(GM,{id:'us_snow3',ev:'ev_us_first_snow',day:d,h:G.hour,place:'小教堂前的台階',title:'初雪',back:'回到公寓。'})); }
          if(F.US_SNOW_MODE==='repair'&&hh(G)>=20&&hh(G)<23&&!(typeof OUT!=='undefined'&&OUT.get(G,'us_snow_r'))) return go(()=>outNow(GM,{id:'us_snow_r',ev:'ev_us_snow_repair',day:d,h:G.hour,place:'小教堂前的台階',title:'初雪',back:'回到公寓。'})); } }   /* 挽回中：舊存檔（18:00 的訊息已經傳了、沒排進行程）20:00 前後自動到場；排了的照行程問（AA_452 1-1）*/
      if(S.leaveDue(G)) return go(()=>S.leave(GM)); }
    return S.tickTW(GM); };
  /* 睡著也會醒來：抵達那晚 21:30（打給媽媽）、12/2 20:00（初雪）*/
  S.wakeAt=function(G){ if(S.ivOn(G)&&G.hour<9.5) return 9.5; if(S.exOn(G)&&G.hour<8.5) return 8.5; if(!isUS(G)) return null; const F=G.flags;
    if(F.US1==='alone'&&!done(G,'ev_us1_mom')&&F.US_ARRIVED_DAY===G.day&&G.hour<21.5) return 21.5;
    const d=D('2028-12-02'); if(d!=null&&G.day===d&&!F.US_SNOW&&abroad(G)&&G.hour<20) return 20;
    return null; };
  S.alarms=function(G,day){ const out=[]; if(isUS(G)&&day===D16()&&!G.flags.US_LEFT&&G.flags.US_RETURNED==null) out.push({h:6.5,why:'07:00 社區門口（機場巴士）'});
    if(S.pushOn(G)&&day===D('2028-10-26')&&!done(G,'ev_push_interview')) out.push({h:8.5,why:IV_GOAL});
    if(S.examOn(G)&&day===D('2029-02-03')&&!done(G,'ev_grad_exam')) out.push({h:7.5,why:EX_GOAL});
    return out; };
  /* 寒假快轉的停點（HOME.STOPS）：要回的訊息、2/3 筆試帶到場（出遊本來就會停）*/
  S.stops=function(G,now){ if(!law(G)) return null; const out=[], F=G.flags||{}, add=(k,h,ok)=>{ const d=D(k); if(d!=null&&ok) out.push(T(d,h)); };
    if(typeof PHONE!=='undefined'){ const kx=dating(G,KX);
      add('2028-12-24',21,kx&&!PHONE.sent(G,'y4_kx_xmas_ask')); add('2029-01-02',21,kx&&!PHONE.sent(G,'y4_kh_ask')); add('2029-01-08',21,kx&&!PHONE.sent(G,'y4_kx_grades'));
      add('2029-02-12',22,kx&&!PHONE.sent(G,'y4_kx_ny')); add('2029-02-02',21,PHONE.inGroup(G,'noodle_team')&&stageAt('heroine_01','FRIEND')&&!PHONE.sent(G,'y4_an_eve')); }
    add('2029-02-03',8+50/60,S.examOn(G)&&!done(G,'ev_grad_exam'));
    return out.filter(x=>x>now+1e-6); };
  /* 互動（包住 STORY.interact）：會所門口在 12/14 19:00 前後＝會所晚餐 */
  S.interact=async function(it,GM){ const G=GM.G; if(!it||!G||!G.flags) return false;
    if(it.usClub==='door'&&isUS(G)&&S.clubDue(G)&&typeof OUT!=='undefined'){ await OUT.go(GM,OUT.get(G,'us_club')); return true; }
    return false; };

  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
    if(Array.isArray(STORY.WAKE_AT)) STORY.WAKE_AT.push(G=>S.wakeAt(G));
    if(Array.isArray(STORY.ALARMS)) STORY.ALARMS.push((G,day)=>S.alarms(G,day));
    if(STORY.interact&&!STORY._r2y4aInteract){ const orig=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return orig.apply(this,arguments); }; STORY._r2y4aInteract=true; } }
  if(typeof STORY!=='undefined'&&!STORY._r2y4aHome){ const hd0=STORY.y4HomeDue, hf0=STORY.y4FromHome;   /* home3d.js 的 loop 在問：人在家、該被帶到場了＝先離開家 */
    STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; if(r) return r; if(S.ivBringDue(G)) return 'r2y4a_iv'; if(S.examBringDue(G)) return 'r2y4a_exam'; return null; };
    STORY.y4FromHome=function(GM,k){ if(k==='r2y4a_iv') return S.interview(GM,{fromHome:true}); if(k==='r2y4a_exam') return S.exam(GM,{fromHome:true}); return hf0?hf0.apply(this,arguments):null; };
    STORY._r2y4aHome=true; }
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,now)=>S.stops(G,now));
  /* 閒聊階梯（AA_262 第 4 節第 3 點）：Y7-L3 在 15b〈公館的時間〉以後、A7-L6 在新 19 讀書會交棒以後才播 */
  if(typeof STORY!=='undefined'&&STORY.LADDER_HOLD){ const H=STORY.LADDER_HOLD, after=(k,G)=>{ const d=D(k); return d!=null&&G.day>d; };
    if(!H['Y7-L3']) H['Y7-L3']=G=>!!(G.flags&&G.flags.YT_ESSAY)||after('2028-10-24',G);
    if(!H['A7-L6']) H['A7-L6']=G=>!!(G.flags&&G.flags.PLG_HANDOVER)||after('2028-11-30',G); }
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT._us2Stage){ OUT.STAGE.push((GM,q,ev)=>S.us2Stage(GM,q,ev)); OUT._us2Stage=true; }   /* AA_453 1-3 */
  if(typeof EXCH!=='undefined'){ EXCH.onArrive=async GM=>{ if(!S.us1Due(GM.G)) return false; busy=true; try{ return await S.us1(GM); } finally{ busy=false; } }; EXCH.onLand=GM=>S.onLand(GM); }
  return S;
})();
