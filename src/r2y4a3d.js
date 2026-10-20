/* ===== 事件包第 2 輪之三（前半）AA_327 2-Y4-01～29 的時間、手機、出遊、美國路線的整串流程（AA-C 2026-10-20 定稿 e284d601；台詞在 data/r2y4a_events.js，不改字）=====
   掛在 STORY.PHONE_RULES（手機：每一輪）、STORY.TICKS（每 0.5 秒：到時間就演）、STORY.WAKE_AT、STORY.ALARMS；美國路線另外掛 EXCH.onArrive（登機抵達）、EXCH.onLand（回到桃園）、
   STORY.interact（會所門口 usClub:'door'）。不改 story3d.js。
   美國路線（2-Y4-16～22；時間都是當地時間，STORY.tzOffset）：
     8/2 抵達＝US1：交往中 19:00 巴士站 → 19:30 草原超市 → 20:15 竹葉亞洲超市 → 21:00 公寓 214 門口 → 21:30 打給媽媽；挽回中＝巴士站一句以後自己走（社區入口），21:30 打給媽媽。加入「交換生」群組。
     9/13 US2：交往中 18:00 私訊、18:30～19:30 坐到 C 棟 208 的高腳椅、20:00 沒到一則、10/18 21:00「拿了 A」；挽回中 19:00 前後人在社區＝帶到 C 棟（還鍋子）。
     11/3 21:00 芝加哥（交往中私訊、挽回中群組；「去。」＝11/11 07:00 出遊兩天）；11/22 21:00 → 11/23 09:00 感恩節的湖邊；12/2 18:00 → 20:00 初雪（交往中：20:15 沒到＝20:30 一則、
     21:30 還沒到＝帶到場；挽回中 20:00 自動到場、REPAIR ≥ 3 才重新開始）；12/13 21:00 → 12/14 19:00 會所晚餐；12/16 07:00 社區門口（鬧鐘 06:30）→ 交往中舊金山一週／挽回中布魯明頓三天
     → 12/21 起飛 → 12/23 05:40 桃園入境大廳 → 家 → 19:00 409（story3d.js roomY4FromAirport）→ 20:00 阿凱。
   REPAIR（BB_194 §8、BB_204 第 4 節對照）：G.flags.REPAIR={heroine_05:n}，一週最多 +1（抵達後第幾週，STORY.routeWeek）。+1 的地方：US2「還沒。」、群組裡芝加哥的邀約有回、US3「那妳想因為什麼？」。
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
  const md=day=>{ if(typeof CALENDAR==='undefined') return ''; const d=CALENDAR.dateOf(day); return d.m+' 月 '+d.d+' 日'; };
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('R2Y4A',e)).finally(()=>{ busy=false; }); return true; };
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

  /* ===================== 2-Y4-18 芝加哥 ===================== */
  S.chicagoDay2=async function(GM){ const G=GM.G, d12=D('2028-11-12'); if(d12==null) return;
    if(GM.fade) await GM.fade(true); toDay(GM,d12,10); if(GM.titleCard) await GM.titleCard(md(d12),'芝加哥',2200);
    if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); if(GM.fade) await GM.fade(false);
    await run(GM,'ev_us_chicago2',{noTitle:true}); at(GM,21.75); G.flags.US_CHICAGO='went'; };
  /* 這週不行、07:15 還沒上車、沒回：三張照片＋「下次一起。」（交往中私訊；挽回中只在群組）；沒上車的 07:20 先一則 */
  S.chicagoMissed=function(G,late){ if(typeof PHONE==='undefined') return; const d11=D('2028-11-11'), d12=D('2028-11-12'); if(d11==null) return; const M=dating(G,S5)?P5:X5; G.flags.US_CHICAGO='missed';
    if(late) PHONE.at(G,d11,7+20/60,[M('巴士要開了。……我們先走。')],'us_chi_late');
    PHONE.at(G,d12,21,[M('📷（湖邊的風）'),M('📷（博物館的恐龍）'),M('📷（深盤披薩）'),M('下次一起。')],'us_chi_photos'); };

  /* ===================== 2-Y4-19 US3 ===================== */
  S.lakeMissed=function(G){ if(typeof PHONE==='undefined') return; const d=D('2028-11-23'); if(d==null) return; G.flags.US3='missed';
    if(dating(G,S5)) PHONE.at(G,d,10,[P5('我自己去了。……下雪了。拍給你。'),P5('📷（一張照片）')],'us3_missed');
    else PHONE.at(G,d,21.5,[X5('📷（湖邊一排人，中間空了一個位子。）'),X5('大家都在。少你一個。')],'us3_missed'); };

  /* ===================== 2-Y4-20 初雪 ===================== */
  /* 交往中：20:15 沒到＝20:30「我還在台階上。雪還沒停。」，窗口延到 21:30；再沒到＝帶到場（US_SNOW_LATE：先一句「你還是去了。」）*/
  S.snowMissed=function(G,q){ const d=D('2028-12-02'); if(d==null) return; if(q&&q.id==='us_snow2'){ G.flags.US_SNOW_FORCE=true; return; }
    if(typeof PHONE!=='undefined') PHONE.at(G,d,20.5,[P5('我還在台階上。雪還沒停。')],'us_snow_wait');
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'us_snow2',ev:'ev_us_first_snow',day:d,h:20.5,late:1,place:'小教堂前的台階',title:'初雪',travel:'',travelH:0,back:'回到公寓。'}); };
  { const e=evOf('ev_us_first_snow'); if(e) e.outingMissed=(G,GM,q)=>S.snowMissed(G,q); }

  /* ===================== 2-Y4-21 會所晚餐 ===================== */
  S.clubMissed=function(G){ const d=D('2028-12-14'); if(d==null||typeof PHONE==='undefined') return; G.flags.US_CLUB_DINNER='missed'; PHONE.at(G,d,21.5,[X5('📷（會所的長桌，盤子都空了。）'),X5('你的那一份，有人幫你留了。')],'us_club_missed'); };
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
        if(GM.titleCard) await GM.titleCard(md(d16+dd),sf?'舊金山':'布魯明頓',2200); if(typeof ADV!=='undefined') ADV.begin({background:sf?'dark':'blur'}); if(GM.fade) await GM.fade(false);
        await run(GM,id,{noTitle:true}); }
      if(sf) F.SF_DONE=true; F.US_TRIP_DONE=true;
      if(GM.fade) await GM.fade(true); toDay(GM,d16+5,23+55/60); }   /* 12/21（四）23:55 舊金山起飛（挽回中：17:00 印第安納波利斯起飛、舊金山轉同一班）*/
    finally{ GM.sceneEnd(); }
    if(typeof EXCH!=='undefined'&&EXCH.returnHome) return EXCH.returnHome(GM,{force:true});
    return true; };
  /* 回到桃園（EXCH.onLand）：入境大廳 → 臺北的家（上午）。之後照 exchange3d.js：睡到下午、19:00 409（roomY4FromAirport）*/
  S.onLand=async function(GM){ const G=GM.G, F=G.flags; if(!isUS(G)) return false; F.US_RETURN=G.day;
    if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); if(GM.fade) await GM.fade(false);
    if(!done(G,'ev_us_return')) await run(GM,'ev_us_return');
    if(!done(G,'ev_us_home')){ at(GM,9); if(typeof ADV!=='undefined') ADV.begin({background:'dark'}); await run(GM,'ev_us_home',{noTitle:true}); }
    if(GM.fade) await GM.fade(true); return true; };

  /* ===================== 手機（STORY.PHONE_RULES）===================== */
  S.phoneUS=function(G){ const F=G.flags;
    if(F.US_ARRIVED&&abroad(G)) PHONE.join(G,EXG,'交換生');   /* 舊存檔（抵達以後才有這個事件包）*/
    /* ---- US2 ---- */
    { const d=D913(); if(d!=null&&G.day>=d&&G.day<=d+40){
        if(G.day===d&&dating(G,S5)&&past(G,d,18)&&hh(G)<19.5&&!F.US2&&!PHONE.sent(G,'us2_msg')) PHONE.at(G,d,18,[P5('報告被退回來了。'),P5('……我在煮麵。C 棟，廚房。要不要吃。')],'us2_msg');
        if(PHONE.sent(G,'us2_msg')&&!F.US2&&past(G,d,19.5)){ F.US2='missed'; PHONE.at(G,d,20,[P5('麵我吃完了。報告我自己再改一次。')],'us2_missed'); }   /* 20:00 */
        const dA=D('2028-10-18'); if(dA!=null&&(F.US2==='there'||F.US2==='missed')&&dating(G,S5)&&past(G,dA,21)&&G.day<=dA+7&&!PHONE.sent(G,'us2_grade')) PHONE.at(G,dA,21,[P5('改過的報告拿了 A。教授說：『這次我讀到妳了。』')],'us2_grade'); } }   /* 「10 月中」：AA 沒寫哪一天，排 10/18（三）21:00 */
    /* ---- 芝加哥（11/3 21:00）---- */
    { const d3=D('2028-11-03'), d11=D('2028-11-11'); if(d3!=null&&G.day>=d3&&G.day<=d11+1){
        if(past(G,d3,21)&&now(G)<T(d11,7)&&!PHONE.sent(G,'us_chi_ask')){ const dt=dating(G,S5), L=dt?[P5('下週末去芝加哥。巴士早上七點出發，帶厚外套。'),P5(F.MET_LONG?'何俊朗也去。他說他知道哪一家的披薩最好吃。……我們去驗證。':'香港來的那個同學也去，我們一起認識他。')]:[X5('下週末有人要去芝加哥嗎。巴士早上七點。')];
          L[L.length-1].ask={id:'us_chi',until:T(d11,7),opts:[{t:'去。',set:{US_CHI:'go'}},{t:'這週不行。',set:{US_CHI:'no'}}]}; PHONE.at(G,d3,G.day===d3?Math.max(21,G.hour):21,L,'us_chi_ask'); F.US_CHI_DATING=dt; }
        const m=PHONE.byAsk(G,'us_chi');
        if(m&&m.ans!=null&&!F.US_CHI_DATING&&!F.US_CHI_REP){ F.US_CHI_REP=true; S.repairAdd(G,'chicago_reply'); }   /* 挽回中：她在群組說的事，祐廷有回（BB_204 第 4 節「每週」那一列）*/
        if(F.US_CHI==='go'&&typeof OUT!=='undefined'&&!OUT.get(G,'us_chicago')) OUT.plan(G,{id:'us_chicago',ev:'ev_us_chicago',day:d11,h:7,late:0.25,place:'社區門口（長途巴士）',title:'芝加哥的週末',travel:'',travelH:0,back:'回到社區。'});
        if(m&&!F.US_CHICAGO&&(F.US_CHI==='no'||(m.ans==null&&now(G)>=T(d11,7)))) S.chicagoMissed(G,false); } }   /* 沒回＝沒去（照「這週不行」）*/
    /* ---- US3（11/22 21:00）---- */
    { const d22=D('2028-11-22'), d23=d22!=null?d22+1:null; if(d22!=null&&G.day>=d22&&G.day<=d23&&past(G,d22,21)&&now(G)<T(d23,9.25)&&!PHONE.sent(G,'us3_ask')){
        PHONE.at(G,d22,G.day===d22?Math.max(21,G.hour):21,[dating(G,S5)?P5('明天開始放感恩節。氣象說會下雪。我想去湖邊看。九點，會所門口。'):X5('感恩節第一天，大家要去湖邊。九點，會所門口集合。')],'us3_ask');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'us3_lake')) OUT.plan(G,{id:'us3_lake',ev:'ev_us3_lake',day:d23,h:9,late:0.25,place:'會所門口',title:'感恩節的湖邊',travel:'',travelH:0,back:'回到社區。'}); } }
    /* ---- 初雪（12/2 18:00）---- */
    { const d=D('2028-12-02'); if(d!=null&&G.day>=d&&G.day<=d+1){
        if(G.day===d&&past(G,d,18)&&hh(G)<20.25&&!F.US_SNOW&&!PHONE.sent(G,'us_snow_msg')){
          if(dating(G,S5)){ PHONE.at(G,d,18,[P5('今晚會下今年第一場真的會積起來的雪。'),P5('八點，小教堂前面的台階。')],'us_snow_msg'); F.US_SNOW_MODE='together';
            if(typeof OUT!=='undefined'&&!OUT.get(G,'us_snow')) OUT.plan(G,{id:'us_snow',ev:'ev_us_first_snow',day:d,h:20,late:0.25,place:'小教堂前的台階',title:'初雪',travel:'',travelH:0,back:'回到公寓。'}); }
          else { PHONE.at(G,d,18,[{th:EXTH,from:'us_classmate',name:'同學',text:'今晚會積雪'}],'us_snow_msg'); F.US_SNOW_MODE='repair'; } }   /* 「交換生群組有人傳」：傳的人沒有名字（要問 AA）*/
        if(F.US_SNOW_QUIET&&past(G,d+1,8+10/60)&&!PHONE.sent(G,'us_snow_next')) PHONE.at(G,d+1,8+10/60,[P5('昨天你問我還好嗎。……其實不太好。回去再跟你說。')],'us_snow_next'); } }
    /* ---- 會所晚餐（12/13 21:00）---- */
    { const d13=D('2028-12-13'); if(d13!=null&&G.day>=d13&&G.day<=d13+1&&past(G,d13,21)&&now(G)<T(d13+1,19)&&!PHONE.sent(G,'us_club_ask')){ const L=[X5('明天晚上七點，會所。學期最後一頓。每個人帶一道菜。')];
        L[0].ask={id:'us_club',until:T(d13+1,19),opts:[{t:'滷一鍋茶葉蛋。',set:{US_CLUB_DISH:'egg'}},{t:'最後一包台灣泡麵，煮成一大鍋。',set:{US_CLUB_DISH:'noodle'}},{t:'什麼都沒煮，帶了一疊紙盤。',set:{US_CLUB_DISH:'plates'}}]};
        PHONE.at(G,d13,G.day===d13?Math.max(21,G.hour):21,L,'us_club_ask');
        if(typeof OUT!=='undefined'&&!OUT.get(G,'us_club')) OUT.plan(G,{id:'us_club',ev:'ev_us_club_dinner',day:d13+1,h:19,late:1,place:'會所',title:'會所晚餐',travel:'',travelH:0,back:'回到社區。'}); } }
    /* ---- 回到臺灣：20:00 阿凱（msg_kai_back_us；BB_198，台詞 AA 新寫）---- */
    if(F.US_RETURNED!=null&&G.day>=F.US_RETURNED&&G.day<=F.US_RETURNED+1&&past(G,F.US_RETURNED,20)&&!PHONE.sent(G,'msg_kai_back_us')){ const K=t=>({th:'p:kai',from:'kai',text:t});
      const L=[K('回來了？'),K('所以時差調了沒'),K('宵夜 我在宿舍樓下')]; L[2].ask={id:'msg_kai_back_us',opts:[{t:'下去。',say:[{from:'kai',text:'所以你還是沒調'}]},{t:'先睡了。',say:[{from:'kai',text:'好 明天'}]}]};
      PHONE.at(G,F.US_RETURNED,20,L,'msg_kai_back_us'); } };

  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; if(isUS(G)) S.phoneUS(G); };

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
          if(F.US_SNOW_MODE==='repair'&&hh(G)>=20&&hh(G)<23) return go(()=>outNow(GM,{id:'us_snow_r',ev:'ev_us_snow_repair',day:d,h:G.hour,place:'小教堂前的台階',title:'初雪',back:'回到公寓。'})); } }   /* 挽回中：20:00 前後走過小教堂（自動到場）*/
      if(S.leaveDue(G)) return go(()=>S.leave(GM)); }
    return false; };
  /* 睡著也會醒來：抵達那晚 21:30（打給媽媽）、12/2 20:00（初雪）*/
  S.wakeAt=function(G){ if(!isUS(G)) return null; const F=G.flags;
    if(F.US1==='alone'&&!done(G,'ev_us1_mom')&&F.US_ARRIVED_DAY===G.day&&G.hour<21.5) return 21.5;
    const d=D('2028-12-02'); if(d!=null&&G.day===d&&!F.US_SNOW&&abroad(G)&&G.hour<20) return 20;
    return null; };
  S.alarms=function(G,day){ const out=[]; if(isUS(G)&&day===D16()&&!G.flags.US_LEFT&&G.flags.US_RETURNED==null) out.push({h:6.5,why:'07:00 社區門口（機場巴士）'}); return out; };
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
  if(typeof EXCH!=='undefined'){ EXCH.onArrive=async GM=>{ if(!S.us1Due(GM.G)) return false; busy=true; try{ return await S.us1(GM); } finally{ busy=false; } }; EXCH.onLand=GM=>S.onLand(GM); }
  return S;
})();
