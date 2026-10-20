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
            zq.ask={id:'y4_ty_reply',opts:[{t:'颱風不是當事人。不能聲明異議。',say:knows('classmate_xinci',G)?[{from:'classmate_xinci',text:'……這句可以寫進報告。'}]:[]},{t:'先吃泡麵。',say:[{from:'zhe',text:'大四了，還是泡麵。'}]}]}; L.push(zq);
            PHONE.at(G,d18,G.day===d18?Math.max(8,G.hour):8,L,'y4_ty_group'); }
          if(!F.TYPHOON_Y4) F.TYPHOON_Y4='phone'; } } }
    /* ---- 2-Y4-03 中秋：10/2 21:00 阿哲（麵店團；不在群組＝和阿哲 FAMILIAR 以上的私訊）→ 10/3 18:00；沒到 21:30 照片；美國路線 19:30 照片（可昕另外一句）；可昕沒見過麵店團＝22:00 私訊 ---- */
    { const d=D('2028-10-03'), di=d!=null?d-1:null; if(d!=null&&G.day>=di&&G.day<=d+1){ const inG=PHONE.inGroup(G,'noodle_team'), th=inG?'g:noodle_team':'p:zhe', Z=t=>({th,from:'zhe',text:t}), ok=inG||(knows('zhe',G)&&stageAt('zhe','FAMILIAR'));
        if(!us&&ok&&past(G,di,21)&&now(G)<T(d,18.25)&&!PHONE.sent(G,'y4_ma_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[Z('明天中秋 河濱 六點'),Z('烤肉架我借好了')],'y4_ma_ask');
          plan(G,{id:'y4_midautumn',ev:'ev_y4_midautumn',day:d,h:18,late:0.25,place:'公館的河濱',title:'中秋烤肉（大四）',travel:'走過去約 15 分鐘',travelH:0.25}); }
        if(!us&&gone(G,'y4_midautumn',d,18)&&!done(G,'ev_y4_midautumn')&&past(G,d,21.5)&&!PHONE.sent(G,'y4_ma_photo')){ PHONE.at(G,d,21.5,[Z('📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')],'y4_ma_photo'); F.MIDAUTUMN_Y4='missed'; }
        if(us&&inG&&pastTW(G,d,19.5)&&!PHONE.sent(G,'y4_ma_us')){ const L=[Z('📷（河濱，兩個烤肉架，一支夾子插在玉米上。）')]; if(dating(G,'kexin')) L.push({th:'g:noodle_team',from:'kexin',text:'阿哲今年贏了。……你不在，我沒力氣講冷笑話。'}); atTW(G,d,19.5,L,'y4_ma_us'); F.MIDAUTUMN_Y4='missed'; }
        if(!us&&dating(G,'kexin')&&!F.KX_MET_NOODLE_TEAM&&past(G,d,22)&&!PHONE.sent(G,'y4_ma_kx')) PHONE.at(G,d,22,[{th:'p:kexin',from:'kexin',text:'中秋快樂。……我們這邊也在烤。'}],'y4_ma_kx'); } }
    /* ---- 2-Y4-07 校慶：11/10 21:00 法服群組（法服成員）---- */
    { const d=D('2028-11-10'); if(d!=null&&!us&&G.day>=d&&G.day<=d+1&&past(G,d,21)&&typeof STORY!=='undefined'&&STORY.fafuMember&&STORY.fafuMember(G)&&PHONE.inGroup(G,'lawclub_study')&&!PHONE.sent(G,'y4_fair_ask')){ const J=t=>({th:'g:lawclub_study',from:'fafu_jr',name:'學妹',text:t});   /* 這一屆的社長（學妹），不給名字 */
        PHONE.at(G,d,G.day===d?Math.max(21,G.hour):21,[J('明天校慶，攤位十點開。'),J('大四的學長姊有空回來坐。')],'y4_fair_ask'); } }
    /* ---- 2-Y4-08 交棒：不在場（沒有條件、那晚沒去、美國路線）＝22:00 小語在麵店團群組 ---- */
    { const d=D('2028-11-30'); if(d!=null&&G.day>=d&&G.day<=d+2&&PHONE.inGroup(G,'noodle_team')&&knows('yu',G)&&knows('heroine_01',G)&&!done(G,'ev_plg_handover')&&pastTW(G,d,22)&&!PHONE.sent(G,'y4_plg_photo')){ const Y=t=>({th:'g:noodle_team',from:'yu',text:t});
        atTW(G,d,22,[Y('📷（白板，只剩一行字）'),Y('以安交棒了。白板只剩一條。')],'y4_plg_photo'); F.PLG_HANDOVER='heard'; } }
    /* ---- 2-Y4-10 聖誕交換禮物：12/21 21:00 阿哲（麵店團）→ 12/22 19:00；沒到、美國路線＝21:30 照片 ---- */
    { const d=D('2028-12-22'), di=d!=null?d-1:null; if(d!=null&&G.day>=di&&G.day<=d+1&&PHONE.inGroup(G,'noodle_team')){ const Z=t=>({th:'g:noodle_team',from:'zhe',text:t});
        if(!us&&past(G,di,21)&&now(G)<T(d,19.25)&&!PHONE.sent(G,'y4_xmas_ask')){ PHONE.at(G,di,G.day===di?Math.max(21,G.hour):21,[Z('明天考完 聖誕交換禮物'),Z('七點 麵店 一百五以內')],'y4_xmas_ask');
          plan(G,{id:'y4_xmas',ev:'ev_y4_xmas',day:d,h:19,late:0.25,place:'阿鳳麵店',title:'聖誕交換禮物（大四）',travel:'走過去約 15 分鐘',travelH:0.25}); }
        if((us||gone(G,'y4_xmas',d,19))&&!done(G,'ev_y4_xmas')&&pastTW(G,d,21.5)&&!PHONE.sent(G,'y4_xmas_photo')){ atTW(G,d,21.5,[Z('📷（每個人手上的禮物，都很眼熟。）')],'y4_xmas_photo'); F.XMAS_Y4='missed'; } } }
  };

  /* ===================== 推甄（2-Y4-06）：成績三級（AA_185 0b 第 2 件）＋推薦信 ===================== */
  const BH='classmate_bohan', YT='heroine_03', KX='kexin';
  S.pushOn=G=>law(G)&&!!G.flags&&STORY.route&&STORY.route(G)==='TW'&&G.flags.Y4_PATH==='grad';   /* 台灣路線、選②（10/16 才選的也算）；日本、美國路線延畢＝2030 筆試 */
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
    if(F.Y4_PATH_ASK2!=null&&F.SISTER_TALK&&G.day<=F.Y4_PATH_ASK2+2&&past(G,F.Y4_PATH_ASK2+1,9)&&!PHONE.sent(G,'y4_path_sis2')&&typeof STORY!=='undefined'&&STORY.y4PathSisLine){
      const line=F.Y4_PATH_TWICE?STORY.y4PathSisLine({flags:Object.assign({},F,{Y4_PATH:'undecided'})}):STORY.y4PathSisLine(G);
      PHONE.at(G,F.Y4_PATH_ASK2+1,9,[{th:'p:sister',who:null,text:'（昨晚你在家人群組打了一行字，又刪掉。最後只傳給姊姊。）'},SIS(line)],'y4_path_sis2'); }
    /* ---- 2-Y4-05 回家再讀：隔天 21:00「讀了嗎」→「讀了」→「嗯」---- */
    if(F.YT_ESSAY==='home'&&typeof F.YT_ESSAY_DAY==='number'&&G.day<=F.YT_ESSAY_DAY+3&&past(G,F.YT_ESSAY_DAY+1,21)&&!PHONE.sent(G,'y4_yt_essay')){ const m={th:'p:'+YT,from:YT,text:'讀了嗎'}; m.ask={id:'y4_yt_essay',opts:[{t:'讀了',say:[{from:YT,text:'嗯'}]}]}; PHONE.at(G,F.YT_ESSAY_DAY+1,21,[m],'y4_yt_essay'); }
    /* ---- 2-Y4-06 推甄 ---- */
    { const d25=D('2028-10-25'); if(d25!=null&&S.pushOn(G)&&G.day>=d25&&G.day<=d25+1&&past(G,d25,21)&&knows(S5,G)&&stageAt(S5,'FRIEND')&&!PHONE.sent(G,'y4_push_note')){   /* 10/25 21:00 學姊的便條照片（她在美國）*/
        const L=[P5('📷（一張手寫的便條）'),{th:'p:'+S5,who:null,text:'（便條：「一，你可以。二，你可以。三，你可以。」）'}]; if(dating(G,S5)) L.push(P5('考完傳訊息。我這邊是晚上，我等。'));
        L[L.length-1].ask={id:'y4_push_note',opts:[{t:'三件都一樣。',say:[{from:S5,text:'對。'}]},{t:'謝謝。',say:[{from:S5,text:'考完傳訊息。'}]}]};
        PHONE.at(G,d25,G.day===d25?Math.max(21,G.hour):21,L,'y4_push_note'); } }
    { const d=D('2028-11-23'); if(d!=null&&G.day>=d&&G.day<=d+2){ const B=t=>({th:'p:'+BH,from:BH,text:t});
        if(S.pushOn(G)&&past(G,d,15)&&!F.Y4_PUSH){ const ok=S.pushPass(G); F.Y4_PUSH=ok?'pass':'fail'; if(ok) F.GRAD_ADMIT='push';   /* 11/23 15:00 放榜（學校信箱）*/
          PHONE.at(G,d,15,[{th:'sys',who:null,text:ok?'推甄放榜：法律學研究所，錄取。':'推甄放榜：法律學研究所，未錄取。'}],'y4_push_result');
          const q=B('你上了嗎。'); q.ask={id:'y4_push_bh',opts:[ok?{t:'上了。',say:[{from:BH,text:'我也上了。'},{from:BH,text:'……所以研究所還要跟你同一班。好。我說好的時候是真的好。'}]}:{t:'沒有。',say:[{from:BH,text:'……二月還有考試。我陪你念。順便。'}]}]};
          PHONE.at(G,d,15+10/60,[q],'y4_push_bh');
          const C=[B('明天晚上六點半，麵店。我請。'),B('……阿哲知道的話，會叫我請全部人。')]; C[1].ask={id:'y4_bh_dinner',until:T(d+1,18.75),opts:[{t:'好。',set:{BH_DINNER_GO:true}},{t:'明天不行。',say:[{from:BH,text:'好。下次。'}],set:{BH_DINNER:'no'}}]};
          PHONE.at(G,d,21.5,C,'y4_bh_dinner_ask'); }   /* 21:30 柏翰約晚餐（裁定第 1 點：「……阿哲知道的話，會叫我請全部人。」）*/
        if(F.BH_DINNER_GO&&!F.BH_DINNER) plan(G,{id:'y4_bh_dinner',ev:'ev_bh_dinner',day:d+1,h:18.5,late:0.25,place:'阿鳳麵店',title:'阿鳳麵店（柏翰）',travel:'走過去約 15 分鐘',travelH:0.25});
        if(PHONE.inGroup(G,'noodle_team')&&knows(BH,G)&&pastTW(G,d,21)&&!PHONE.sent(G,'y4_push_group')) atTW(G,d,21,[{th:'g:noodle_team',from:'yu',text:'柏翰推甄上了！'},{th:'g:noodle_team',from:BH,text:'……嗯。'}],'y4_push_group'); } }   /* 所有認識柏翰的玩家（美國路線照當地時間）*/
    /* ---- 2-Y4-15 可昕的實習：推甄沒上＝隔天 21:00；沒申請＝11/22 21:00（美國路線＝當地 08:00）；交換延畢 2030-03-15 ---- */
    if(dating(G,KX)){ const K=t=>({th:'p:'+KX,from:KX,text:t}), d22=D('2028-11-22');
      if(F.KX_INTERN_CALL==='fail'&&typeof F.KX_INTERN_DAY==='number'&&past(G,F.KX_INTERN_DAY+1,21)&&!PHONE.sent(G,'y4_kx_intern_next')) PHONE.at(G,F.KX_INTERN_DAY+1,21,[K('我申請的那家事務所實習，上了。……不用恭喜，先吃飯。')],'y4_kx_intern_next');
      if(d22!=null&&!F.KX_INTERN&&!S.pushOn(G)&&G.day>=d22-1&&G.day<=d22+3&&pastTW(G,d22,21)&&!PHONE.sent(G,'y4_kx_intern_msg')){ atTW(G,d22,21,[K(us?'事務所的實習，我上了。……你回來要負責宵夜。':'事務所的實習，我上了。……你要負責宵夜。')],'y4_kx_intern_msg'); F.KX_INTERN=true; }
      const d30=D('2030-03-15'); if(d30!=null&&G.day>=d30&&G.day<=d30+3&&F.GRAD_EXAM_RESULT!=null&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)&&past(G,d30,15.5)&&!PHONE.sent(G,'y5_kx_grad')) PHONE.at(G,d30,15.5,[K('你研究所放榜了吧。這次換我負責宵夜。')],'y5_kx_grad'); }
    /* ---- 2-Y4-09 語彤事件 16：12/21 12:10（FRIEND 以上、有聯絡方式）；沒到 20:00 兩則；12/28 12:10（美國路線只有這一天，照原本那兩則）---- */
    { const a=D('2028-12-21'), b=D('2028-12-28'); if(a!=null&&G.day>=a&&G.day<=b+1&&!F.YT16){ const Y=t=>({th:'p:'+YT,from:YT,text:t}), fr=knows(YT,G)&&stageAt(YT,'FRIEND')&&typeof INV!=='undefined'&&INV.hasContact(G,YT);
        if(!us&&fr&&G.day===a&&past(G,a,12+10/60)&&hh(G)<18.75&&!PHONE.sent(G,'y4_yt16_a')) PHONE.at(G,a,12+10/60,[Y('今天我在總圖三樓'),Y('有東西想給你看')],'y4_yt16_a');
        if(!us&&PHONE.sent(G,'y4_yt16_a')&&past(G,a,20)&&!PHONE.sent(G,'y4_yt16_miss')) PHONE.at(G,a,20,[Y('今天沒看到你'),Y('下禮拜四 一樣的地方')],'y4_yt16_miss');
        if(fr&&G.day===b&&past(G,b,12+10/60)&&hh(G)<18.75&&!PHONE.sent(G,'y4_yt16_b')) PHONE.at(G,b,12+10/60,PHONE.sent(G,'y4_yt16_a')?[Y('今天也在三樓')]:[Y('今天我在總圖三樓'),Y('有東西想給你看')],'y4_yt16_b');
        if(past(G,b,18.75)) F.YT16='missed'; } }
  };

  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; if(isUS(G)) S.phoneUS(G); S.phoneY4(G); S.phoneY4b(G); };

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
