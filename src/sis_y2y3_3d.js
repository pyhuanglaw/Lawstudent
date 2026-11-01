/* ===== 學姊大二到大三的八場（AA_379 第 2 節，企劃線 30ab5142；任務 AA379-SIS-Y2Y3-1021）：接線 =====
   台詞、事件在 src/data/sis_y2y3_events.js（照稿不改字）。這個檔：
   - STORY.PHONE_RULES：
     2-1 9/21 21:00、2-2 11/17 21:00、2-5 10/15 21:00 她私訊（兩個回覆）→ 回「好。」排隔天的出遊；沒來（回不行、沒回、沒到）＝那天她再傳一則（搬完了／牆沒有意見／錄音有雜音）；
     2-3 大二下第 11 週週三 21:00（第 5～10 週都沒遇到）→ 法圖外面的台階（等你十分鐘，可以不去）；
     2-4 6/2 12:10 家族群組 Kevin「今天溫學姊生日🎂」（認識她就收得到）；交往中＝前一天 21:00 她約、6/2 19:00 法圖旁邊那家；
     2-6 11/11 21:00（11/1～11/9 都沒遇到）→ 11/12 12:20 總圖門口的台階；2-7 3/15 21:30 她打電話來。
     私訊要有她的聯絡方式；那一天晚兩天以上才讀到（很久沒跑手機規則）的不補。
   - preTalk（story3d.js 的 talkSis、talkCharacter 呼叫）：2-3 大二下第 5～10 週、2-6 11/1～11/9，在法圖或 Café 的晚上（18:00 以後）第一次找她說話，
     接在說話前面演（EVENTS.runLines），演完照常閒聊（閒聊階梯、約她）。
   - 2-4 一般版：ev_sis_bday_y1（2026 週二 Café）／ev_sis_bday_y2（2027 週三法圖）是說話的事件（EVENTS.onInteract），條件 S.bdayTalkDue。
   條件：熟悉以上（2-3、2-5、2-7 朋友以上）、認識她（met_sis）、她在臺北（presence）、你人不在國外、不是前任（前任的這兩年另外問 AA）。錯過都不扣關係、不鎖線。
   存檔：G.flags 的 SIS_LAB_GO／SIS_SEM_GO／SIS_IV_GO（回覆）、SIS_LAB_DESK、SIS_SEMINAR_Y2、SIS_TOPIC_Y2（記憶 SIS_TOPIC）、SIS_BDAY_Y1／Y2、SIS_INTERVIEW（記憶 SIS_INTERVIEW）、
   SIS_US_TOLD（記憶 SIS_US_TOLD）、SIS_US_RESULT；訊息照 PHONE 的 tag（sisy23_*）。
   測試：node tests/aa379_sis_y2y3_unit.js */
'use strict';
const SISY23=(function(){
  const S={}, ID='heroine_05', L=typeof SISY23_LINES!=='undefined'?SISY23_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour, hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const isEx=G=>!dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const contact=(G,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,ID)) return false; const c=G.contacts&&G.contacts[ID]; return c==null||c<(day==null?G.day:day); };   /* 前一天以前就有聯絡方式（同 y3fill3d.js）*/
  const abroad=G=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(G);
  const here=G=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,G);
  S.ok=(G,min)=>law(G)&&!!(G.flags&&G.flags.met_sis)&&!isEx(G)&&stageOk(min)&&here(G)&&!abroad(G);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };   /* alarm：跳過時間、睡覺都停在出發前（BB 10-22 03:01 讀碼提醒：沒有 alarm 會直接跳過研究室、討論室、訪談、台階、電話）*/
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);

  /* ---------------- 2-1、2-2、2-5：她私訊約隔天 ---------------- */
  S.ASKS=[
    {k:'lab',ask:'2026-09-21',h:21,min:'FAMILIAR',lines:L.labAsk,yes:L.labYes,noT:L.labNoT,no:L.labNo,flag:'SIS_LAB_DESK',go:'SIS_LAB_GO',
      out:{id:'sisy23_lab',ev:'ev_sis_lab_desk',day:'2026-09-22',h:12+20/60,late:0.25,place:'法律系館A・研究室',title:'研究室（幫學姊搬書）',travel:'走路 約 10 分鐘',travelH:1/6},
      miss:{day:'2026-09-22',h:18,lines:L.labMissed}},
    {k:'sem',ask:'2026-11-17',h:21,min:'FAMILIAR',lines:L.semAsk,yes:L.semYes,noT:L.semNoT,no:L.semNo,flag:'SIS_SEMINAR_Y2',go:'SIS_SEM_GO',
      out:{id:'sisy23_sem',ev:'ev_sis_seminar_y2',day:'2026-11-18',h:19,late:0.25,place:'法圖・討論室',title:'法圖・討論室（聽學姊練 seminar）',travel:'走路 約 10 分鐘',travelH:1/6},
      miss:{day:'2026-11-18',h:22,lines:[L.semMissed]}},
    {k:'iv',ask:'2027-10-15',h:21,min:'FRIEND',lines:L.ivAsk,yes:L.ivYes,noT:L.ivNoT,no:L.ivNo,flag:'SIS_INTERVIEW',go:'SIS_IV_GO',
      out:{id:'sisy23_iv',ev:'ev_sis_interview',day:'2027-10-16',h:9,late:0.25,place:'法扶・臺北的辦公室',title:'陪學姊去訪談（法扶）',travel:'捷運 約 25 分鐘',travelH:25/60},
      miss:{day:'2027-10-16',h:12.5,lines:[L.ivMissed]}},
    /* AA_392 第 5 節：第二次訪談——第一次訪談選了「下次還要記嗎？」（SIS_IV_AGAIN）；11/24（三）21:00 私訊（志願表 11/18 截止以後）→ 11/27（六）10:00；沒到 13:00「記完了。」*/
    {k:'iv2',ask:'2027-11-24',h:21,min:'FRIEND',cond:G=>!!G.flags.SIS_IV_AGAIN,lines:L.iv2Ask,yes:L.iv2Yes,yesSay:L.iv2YesSay,noT:L.iv2NoT,no:L.iv2No,flag:'SIS_INTERVIEW2',go:'SIS_IV2_GO',
      out:{id:'sisy23_iv2',ev:'ev_sis_interview2',day:'2027-11-27',h:10,late:0.25,place:'社區活動中心・小房間',title:'陪學姊去第二次訪談（社區活動中心）',travel:'捷運 約 25 分鐘',travelH:25/60},
      miss:{day:'2027-11-27',h:13,lines:[L.iv2Missed]}},
    /* AA_379 3-2（企劃線 d037c668）：出國前最後一個週六——臺灣路線、熟悉以上（日本路線那時在日本、美國路線和她同一班飛機，都不演）*/
    {k:'pre',ask:'2028-07-28',h:21,min:'FAMILIAR',cond:G=>!(typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)),lines:L.preAsk,yes:L.preYes,noT:L.preNoT,no:L.preNo,flag:'SIS_PREDEPART',go:'SIS_PRE_GO',
      out:{id:'sisy23_pre',ev:'ev_sis_predepart',day:'2028-07-29',h:15,late:0.25,place:'公館',title:'公館（陪學姊買行李箱的鎖）',travel:'走路 約 15 分鐘',travelH:0.25},
      miss:{day:'2028-07-29',h:18,lines:L.preMissed}} ];
  S.asks=function(G){ const F=G.flags;
    for(const a of S.ASKS){ const d=D(a.ask), od=D(a.out.day), md=D(a.miss.day); if(d==null||od==null||md==null) continue; const tag='sisy23_'+a.k+'_ask';
      if(!sent(G,tag)&&F[a.flag]==null&&G.day>=d&&G.day<=d+1&&now(G)<T(od,a.out.h)&&S.ok(G,a.min)&&(!a.cond||a.cond(G))&&contact(G,d)){   /* 那一天一開始就排好（21:00 才送到；快轉會停在要回的訊息）*/
        const M=a.lines.map(dm); M[M.length-1].ask={id:tag,until:T(od,a.out.h),opts:[Object.assign({t:a.yes,set:{[a.go]:true}},a.yesSay?{say:[{from:ID,text:a.yesSay}]}:{}),{t:a.noT,set:{[a.go]:false},say:[{from:ID,text:a.no}]}]};
        PHONE.at(G,d,a.h,M,tag); }
      if(F[a.go]===true&&F[a.flag]==null&&now(G)<T(od,a.out.h+a.out.late)) plan(G,Object.assign({},a.out,{day:od}));
      /* 沒來（回了不行、沒回、說好了沒到）：那天她再傳一則，記 missed */
      if(sent(G,tag)&&F[a.flag]!=='went'&&F[a.flag]!=='asked'&&now(G)>=T(md,a.miss.h)&&G.day<=md+1&&!sent(G,tag+'_miss')){ if(F[a.flag]==null) F[a.flag]='missed'; PHONE.at(G,md,a.miss.h,a.miss.lines.map(dm),tag+'_miss'); }
      if(sent(G,tag)&&F[a.flag]==null&&G.day>md+1) F[a.flag]='missed'; } };
  /* 出遊沒到（OUT 的 outingMissed）：記 missed，那則私訊照上面的時間傳 */
  S.missed=function(G,k){ const F=G.flags, a=S.ASKS.find(x=>x.k===k); if(a){ if(F[a.flag]==null) F[a.flag]='missed'; return; }
    const B={bday_y1:'SIS_BDAY_Y1',bday_y2:'SIS_BDAY_Y2'}[k]; if(B&&F[B]==null) F[B]='missed'; };

  /* ---------------- 2-3 第 11 週週三 21:00：法圖外面的台階 ---------------- */
  S.topicDone=G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(ID,'SIS_TOPIC');
  S.topicSteps=function(G){ const d=typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn('Y2S2',11,3):null; if(d==null) return;
    if(!sent(G,'sisy23_topic_ask')&&!S.topicDone(G)&&G.day===d&&now(G)<T(d,21)&&S.ok(G,'FRIEND')&&contact(G,d)) PHONE.at(G,d,21,[dm(L.topicAsk)],'sisy23_topic_ask');   /* 那一天一開始排好、21:00 送到 */
    if(sent(G,'sisy23_topic_ask')&&!S.topicDone(G)&&G.day===d&&now(G)>=T(d,21)&&now(G)<T(d,21+1/6))   /* 訊息到了才排（等你十分鐘：21:10 到台階，可以不去）*/
      plan(G,{id:'sisy23_topic',ev:'ev_sis_topic_steps',day:d,h:21+1/6,late:1/12,place:'法圖外面的台階',title:'法圖外面的台階（學姊等你十分鐘）',travel:'走路 約 10 分鐘',travelH:1/6}); };

  /* ---------------- 2-4 她的生日 6/2（2026、2027）---------------- */
  S.BDAY={y1:{day:'2026-06-02',zone:'cafe',flag:'SIS_BDAY_Y1'},y2:{day:'2027-06-02',zone:'lawlib',flag:'SIS_BDAY_Y2'}};   /* 2026 週二＝Café 19:00～22:00、2027 週三＝法圖 */
  S.bdayTalkDue=function(G,y){ const B=S.BDAY[y], d=B&&D(B.day); return d!=null&&G.day===d&&hh(G)>=18&&G.zone===B.zone&&G.flags[B.flag]==null&&!dating(G)&&S.ok(G,'FAMILIAR'); };
  S.bday=function(G){ const F=G.flags;
    for(const y in S.BDAY){ const B=S.BDAY[y], d=D(B.day); if(d==null) continue;
      if(G.day>=d&&G.day<=d+1&&!sent(G,'sisy23_bday_kevin_'+y)&&law(G)&&inGrp(G,'family_law'))   /* 在家族群組就收得到（AA_470 5-2：群組大家都看得到，不看認不認識她；原本要 met_sis）*/
        PHONE.at(G,d,12+10/60,[{th:'g:family_law',from:'kevin',name:'Kevin',text:y==='y2'&&L.bdayKevin2?L.bdayKevin2:L.bdayKevin}],'sisy23_bday_kevin_'+y);   /* 2027 換句（AA_461 第 2 節）*/
      if(dating(G)&&F[B.flag]==null&&G.day>=d-1&&G.day<=d&&now(G)<T(d,19)&&!sent(G,'sisy23_bday_ask_'+y)&&S.ok(G,'FAMILIAR')&&contact(G,d-1))   /* 交往中：前一天 21:00 她約 */
        PHONE.at(G,d-1,21,L.bdayAsk.map(dm),'sisy23_bday_ask_'+y);
      if(sent(G,'sisy23_bday_ask_'+y)&&F[B.flag]==null&&now(G)>=T(d-1,21)&&now(G)<T(d,19.5)) plan(G,{id:'sisy23_bday_'+y,ev:'ev_sis_bday_date_'+y,day:d,h:19,late:0.5,place:'法圖旁邊的簡餐',title:'她的生日（法圖旁邊那家）',travel:'走路 約 10 分鐘',travelH:1/6});
      if(F[B.flag]==null&&G.day>d&&(F.met_sis||sent(G,'sisy23_bday_ask_'+y))) F[B.flag]='missed'; } };   /* 沒找她、沒去：沒有台詞 */

  /* ---------------- 2-6 11/11（四）21:00 → 11/12（五）12:20 總圖門口的台階 ---------------- */
  S.usSteps=function(G){ const d=D('2027-11-11'); if(d==null) return;
    if(!sent(G,'sisy23_us_ask')&&G.flags.SIS_US_TOLD==null&&G.day>=d&&G.day<=d+1&&now(G)<T(d+1,12+20/60)&&S.ok(G,'FAMILIAR')&&contact(G,d)) PHONE.at(G,d,21,[dm(L.usAsk)],'sisy23_us_ask');
    if(sent(G,'sisy23_us_ask')&&G.flags.SIS_US_TOLD==null&&now(G)>=T(d,21)&&now(G)<T(d+1,12+20/60)){   /* 訊息到了才排隔天中午 */
      plan(G,{id:'sisy23_us',ev:'ev_sis_us_told_steps',day:d+1,h:12+20/60,late:0.25,place:'總圖門口的台階',title:'總圖門口的台階（學姊）',travel:'走路 約 10 分鐘',travelH:1/6}); } };

  /* ---------------- 2-7 3/15（三）21:30 她打電話來（大三上期末飯說的「收到信那天，我打給你」；沒和她吃期末飯的也照打）---------------- */
  S.result=function(G){ const d=D('2028-03-15'); if(d==null||G.flags.SIS_US_RESULT!=null||G.day!==d||now(G)>=T(d,21.5+1/6)||!S.ok(G,'FRIEND')||!contact(G,d)) return;   /* 那一天一開始就排好（快轉、睡覺會停在電話）*/
    const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(ID):'溫學姊';
    plan(G,{id:'sisy23_result',ev:'ev_sis_us_result',day:d,h:21.5,late:1/6,place:'電話',verb:'接起來',no:'先不接',title:nm+'打電話來',call:true,travel:'',travelH:0,back:'電話掛了。'}); };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.asks,S.topicSteps,S.bday,S.usSteps,S.result]){ try{ f(G); }catch(e){ console.warn('SISY23 phone',e); } } };

  /* ---------------- 說話前接演：2-3、2-6 ---------------- */
  S.preTalkEv=function(G){ if(!G||!law(G)||!['cafe','lawlib'].includes(G.zone)||hh(G)<18) return null;
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    if(t&&t.id==='Y2S2'&&t.week>=5&&t.week<=10&&!S.topicDone(G)&&S.ok(G,'FRIEND')) return 'ev_sis_topic';
    const a=D('2027-11-01'), b=D('2027-11-09'); if(a!=null&&b!=null&&G.day>=a&&G.day<=b&&G.flags.SIS_US_TOLD==null&&S.ok(G,'FAMILIAR')) return 'ev_sis_us_told';
    return null; };
  S.preTalk=async function(GM){ const G=GM&&GM.G, id=S.preTalkEv(G); if(!id||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; const ev=STORY_EVENTS.find(e=>e.id===id); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.done[id]=(R.done[id]|0)+1;
    await EVENTS.runLines(ev.dialogue,ev); return true; };

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  return S;
})();
