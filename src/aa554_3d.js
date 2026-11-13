/* ===== 芷若、子晴「和她交往中」的版本：手機、時間、電話、摘要日、房間物件（AA_554，企劃線 AA-B 2026-10-31；任務 AA554-ZRZQ-DATING-1031）=====
   現行稿＝BB_187（大一下）、BB_189（大二），第 2 節的五處修正以外一字照用（D109）；每週視訊照 AA_419 第 2 節（第一次交換那段在 src/zr_uk3d.js）。
   「和她交往中」＝祐廷和她交往（dating_<id> 或 romance[id].status 'dating'），不是 GF（和別人交往中、她知道）。事件裡的台詞在原本的事件包
   （src/data/events.js、src/data/y2b_events.js、src/y2r2_3d.js），這個檔只放要「排時間」的部分：
   - Z4（BB_187 1-2；AA_554 第 2 節）：週五 21:00 她私訊「明天下午我在溫州街。……有一件事，我想當面講。」（大一下第 11～15 週、有點熟以上、還沒演過 Z4），
     記 ZR_Z4_INV_DAY；隔天週六 15:00 起在溫州街照原本的 Z4（events.js 的 prereq）。睡過 21:00 的照樣補（週六 15:00 以前）。
   - Q4（BB_187 2-1）：大一下第 8 週週六 13:30 她私訊兩則（問過比賽 ARGUED_ABOUT_CAREER、有聯絡方式）；13:30～15:00 她人在公館（STORY.SCHED_X；15:00 起照她的作息）；
     17:50 還沒去＝「第四罐我自己喝了。」「……沒事。真的。」（不扣分），之後 Q4 不再演、下一次見面她不提（story3d.js contestHeardDue）。
   - Q7（BB_189 1-1）：選「接妳爸的電話。」＝當晚 23:10 三則（ZQ_LAB_DH_DAY）。
   - Q8（BB_189 1-2）：選「妳很有天分。他一定會懂。」＝隔天早上 08:40 三則（ZQ_DAD_DH_DAY；取代兩週內社課的 ev_ziqing_dad_sorry）。
   - Z7（BB_189 2-1）：12/10 23:50 她打來（出遊 OUT call:true、只有「接起來」；睡著也會醒：STORY.WAKE_AT），事件 ev_zhiruo_applied_call，接了記 ZR_Z7_CALL 'took'。
     條件同原本 23:59 的三則（演過 Z4、有她的聯絡方式、還沒演 Café 那一場）。沒接到（過了 23:50＋10 分鐘、或那天的電話沒排上）＝ZR_Z7_CALL 'missed'、
     story3d.js 照原本補 23:59 的三則（技術預設，已列給 AA），Café 那一場照「收到深夜訊息」的開頭。
   - Z9（BB_189 2-4；AA_554 第 2 節）：錯過最後一班、9/2 去了送機（ZR_SENDOFF_2027 'met'）＝登機以後（技術預設 10:30）傳。AA_554 寫「後兩則」，
     可是 6/3 沒到的玩家在機場已經拿到票根（AA_390 第 5 節，ZR_LAST_SHIFT 'airport'），「櫃台有一張票根，你的，跟老闆拿。」和剛剛的事對不上——
     先只傳「星期天晚上十點。不要忘記。」（已列給 AA）。沒去送機的三則在 y2b3d.js（照原本 10:00）。
   - 摘要日（STORY.DAILY_PHONE；story3d.js 的 dailyPhone 照舊：第 4 週起、一天最多一則、輪流）：BB_187 1-4 方奕廷那一則（取代 Z6）、1-5 2/14 前後她在台中（寒假，
     固定日子：技術預設 2026-02-15 22:07，避開 2/14 當天的節日約會）、2-4 子晴 00:40；BB_189 1-4 子晴 Q8 之後 00:20、截圖那一則；2-5 芷若 Z7b 之後（五月以前）、Z8 之後。
     已經有的那幾則（熱可可、拉花、cat_v0.3、實驗室的信、點錯）在 story3d.js 換字；成發倒數三分鐘後的私訊也在 story3d.js。
   - 房間物件（BB_187 1-1）：Z3 是和她交往中演的（ZR_Z3_DH）＝房間多一張點單紙（STORY.ROOM_EXTRA）。BB_186 的「倒數第三排」票根遊戲裡還沒有，所以單獨放（已列給 AA）。
   兩位同時交往、被發現：照 multirel3d.js（AA_554 第 4 節，不改）。
   測試：node tests/aa554_dating_unit.js */
'use strict';
const AA554=(function(){
  const S={}, ZR='heroine_02', ZQ='heroine_04', FY='npc_fangyt';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>(((+G.hour||0)%24)+24)%24;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const contact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const gotBefore=(G,id,day)=>!!(G.contacts&&G.contacts[id]!=null&&G.contacts[id]<(day==null?G.day:day));   /* 同 story3d.js 的手機小事：前一天以前就有聯絡方式 */
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const termDay=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const dm=(id,t,dt)=>Object.assign({th:'p:'+id,from:id,text:t},dt?{dt}:{});
  const seq=(id,A,h0)=>A.map((t,k)=>dm(id,t,(h0||0)+k/60));
  const Z=t=>({speaker:ZR,text:t}), N=t=>({speaker:null,text:t}), P=t=>({speaker:'player',text:t});

  /* ---------- 台詞（照 BB_187、BB_189；AA_554 第 2 節修正過的）---------- */
  S.L={
    z4inv:['明天下午我在溫州街。……有一件事，我想當面講。'],
    q4msg:['我在公館騎樓。不要問為什麼。','……好啦，你要來就來。'],
    q4miss:['第四罐我自己喝了。','……沒事。真的。'],
    q7dad:['他說教授是他同學沒錯','可是信是教授自己寫的','……我還是不想去'],
    q8dad:['我昨天很兇。','……但你不要再說『一定』。','男朋友也不行。'],
    z9board:['星期天晚上十點。不要忘記。'],
    zrTc:['我媽問我今天為什麼一直看手機。','我說，在看天氣。'],
    fy:['我去 Café。她今天笑了三次。','……你的關係吧。黃金葛記得澆。'],
    zqBug:['我修好一個 bug。','你睡了吧。','那早上再說一次。早安。預約的。'],
    zqLevel:['今天寫了一個新的關卡。','小孩等的那個人，回家了。','……還沒想好要不要留。'],
    zqCats:['📷（截圖：遊戲裡兩隻插座貓，一隻在打電動，一隻在旁邊看）','這隻很爛。','……你自己猜。'],
    zrCal:['📷（Café 的月曆，五月那一頁折了一個角）','還沒到。我先折起來。'],
    zrPack:['我在列要帶的東西。','外套。我媽說的。','還有你推薦的那三部片。飛機上看。'],
    room:['吧檯的點單紙','她用吧檯的點單紙寫的「熱可可＋濃縮」。'] };

  /* ---------- Z4：前一晚 21:00 她約 ---------- */
  S.z4Fri=function(G){ for(let w=11;w<=15;w++){ const f=termDay('Y1S2',w,5); if(f==null) continue; if(G.day===f&&hh(G)>=21) return f; if(G.day===f+1&&hh(G)<15) return f; } return null; };
  S.z4=function(G){ if(!dating(G,ZR)||done(G,'ev_zhiruo_secret')||sent(G,'aa554_z4_inv')||!stageAt(ZR,'FAMILIAR')||!contact(G,ZR)) return; const f=S.z4Fri(G); if(f==null) return;
    PHONE.at(G,f,21,S.L.z4inv.map(t=>dm(ZR,t)),'aa554_z4_inv'); G.flags.ZR_Z4_INV_DAY=f; };

  /* ---------- Q4：13:30 她先傳；17:50 沒來 ---------- */
  S.Q4_H=13.5; S.Q4_MISS_H=17+50/60;
  S.q4Day=()=>termDay('Y1S2',8,6);
  S.q4=function(G){ const d=S.q4Day(); if(d==null||!dating(G,ZQ)||done(G,'ev_ziqing_contest_day')) return;
    if(G.day===d&&hh(G)>=S.Q4_H&&hh(G)<S.Q4_MISS_H&&!sent(G,'aa554_q4_msg')&&has(ZQ,'ARGUED_ABOUT_CAREER')&&contact(G,ZQ)) PHONE.at(G,d,S.Q4_H,S.L.q4msg.map(t=>dm(ZQ,t)),'aa554_q4_msg');
    if(sent(G,'aa554_q4_msg')&&!sent(G,'aa554_q4_miss')&&now(G)>=T(d,S.Q4_MISS_H)&&G.day<=d+7) PHONE.at(G,d,S.Q4_MISS_H,S.L.q4miss.map(t=>dm(ZQ,t)),'aa554_q4_miss'); };
  /* events.js 的 Q4 prereq（和她交往中）：她傳了、還沒到 17:50、還沒傳「第四罐我自己喝了」*/
  S.q4Open=G=>{ const d=S.q4Day(); return d!=null&&G.day===d&&sent(G,'aa554_q4_msg')&&!sent(G,'aa554_q4_miss')&&hh(G)>=S.Q4_H&&hh(G)<S.Q4_MISS_H; };
  /* 13:30～15:00 她在公館（她的作息 15:00 才出門；15:00 起照作息表）*/
  S.sched=function(c,G){ if(!c||c.id!==ZQ||!G||!law(G)||!dating(G,ZQ)) return null; const d=S.q4Day(); if(d==null||G.day!==d) return null;
    const h=hh(G); if(h<S.Q4_H||h>=15||!sent(G,'aa554_q4_msg')||sent(G,'aa554_q4_miss')||done(G,'ev_ziqing_contest_day')) return null;
    return {days:[6],from:S.Q4_H,to:15,zone:'gongguan',act:'wander',taipei:'both',note:'AA_554：Q4 和她交往中，她 13:30 先傳「我在公館騎樓」'}; };

  /* ---------- Q7、Q8 的手機 ---------- */
  S.q7=function(G){ const d=G.flags.ZQ_LAB_DH_DAY; if(typeof d!=='number'||sent(G,'aa554_q7_dad')||G.day>d+2||now(G)<T(d,23+10/60)) return; PHONE.at(G,d,23+10/60,S.L.q7dad.map(t=>dm(ZQ,t)),'aa554_q7_dad'); };
  S.q8=function(G){ const d=G.flags.ZQ_DAD_DH_DAY; if(typeof d!=='number'||sent(G,'aa554_q8_dad')||G.day>d+3||now(G)<T(d+1,8+40/60)) return; PHONE.at(G,d+1,8+40/60,S.L.q8dad.map(t=>dm(ZQ,t)),'aa554_q8_dad'); };

  /* ---------- Z7：12/10 23:50 她打來 ---------- */
  S.Z7_DAY='2026-12-10'; S.Z7_H=23+50/60; S.Z7_LATE=1/6; S.Z7_ID='aa554_z7_call'; S.EV_Z7='ev_zhiruo_applied_call';
  S.z7Cond=G=>dating(G,ZR)&&done(G,'ev_zhiruo_secret')&&!done(G,'ev_zhiruo_applied')&&!!(G.contacts&&G.contacts[ZR]!=null);   /* 同 story3d.js 原本 23:59 那三則的條件（她知道祐廷有別人＝那三則本來就沒有；和她交往中不看這一條）*/
  S.z7=function(G){ const d=D(S.Z7_DAY); if(d==null||typeof OUT==='undefined'||G.flags.ZR_Z7_CALL!=null) return; if(G.day<d||G.day>d+1) return;
    const q=OUT.get(G,S.Z7_ID);
    if(!q){ if(now(G)<T(d,S.Z7_H)&&G.day===d&&S.z7Cond(G)) OUT.plan(G,{id:S.Z7_ID,ev:S.EV_Z7,day:d,h:S.Z7_H,late:S.Z7_LATE,place:'電話',title:'芷若打來',verb:'接起來',must:true,call:true,travel:'',travelH:0,back:'電話結束。'});
      else if(now(G)>=T(d,S.Z7_H+S.Z7_LATE)&&S.z7Cond(G)) G.flags.ZR_Z7_CALL='missed';   /* 那天的電話沒排上（例：這之前讀的舊存檔已經過了 23:50）＝照原本的三則 */
      return; }
    if(q.state==='missed') G.flags.ZR_Z7_CALL='missed'; };
  S.wake=function(G){ const d=D(S.Z7_DAY); if(d==null||G.day!==d||hh(G)>=S.Z7_H||typeof OUT==='undefined') return null; const q=OUT.get(G,S.Z7_ID); return q&&q.state==='planned'?S.Z7_H:null; };
  S.EVENT_Z7={ id:S.EV_Z7, title:'23:59', participants:[ZR], location:'any', trigger:'outing', once:true, background:'dark', hours:1/6,
    outingMissed:G=>{ G.flags.ZR_Z7_CALL='missed'; },
    dialogue:[ {scene:'電話'},
      Z('你在幹嘛。'),
      P('……等妳打來。'),
      Z('我在看著那個送出鍵。……你不用講話。我只是想要有人在。'),
      N('（電話那頭很安靜。只有她店裡冰箱的聲音。）'),
      Z('……按了。'),
      Z('十一點五十九分。手在抖。你聽得出來嗎？'),
      {choice:[{text:'「聽得出來。」',goto:'a'},{text:'「明天我去店裡。」',goto:'b'},{text:'（不講話，等她）',goto:'c'}]},
      {label:'a'},Z('……好丟臉。'),{goto:'e'},
      {label:'b'},Z('好。早一點來，比較不忙。'),{goto:'e'},
      {label:'c'},N('（過了一分鐘。）'),Z('……謝謝你沒有掛。'),
      {label:'e'} ],
    after:G=>{ G.flags.ZR_Z7_CALL='took'; } };

  /* ---------- Z9：錯過最後一班、去了送機 ---------- */
  S.Z9_BOARD_H=10.5;
  S.z9=function(G){ const d=D('2027-09-02'); if(d==null||G.day<d||G.day>d+21||!dating(G,ZR)||sent(G,'aa554_z9_board')) return; const F=G.flags;
    if(F.ZR_SENDOFF_2027!=='met'||F.ZR_LAST_SHIFT!=='airport'||now(G)<T(d,S.Z9_BOARD_H)) return; PHONE.at(G,d,S.Z9_BOARD_H,S.L.z9board.map(t=>dm(ZR,t)),'aa554_z9_board'); };

  /* ---------- 2/14 前後她在台中（大一寒假）---------- */
  S.TC_DAY='2026-02-15'; S.TC_H=22+7/60;
  S.zrTc=function(G){ const d=D(S.TC_DAY); if(d==null||G.day<d||G.day>d+3||sent(G,'aa554_zr_tc')||now(G)<T(d,S.TC_H)||!dating(G,ZR)||!gotBefore(G,ZR,d)) return;
    const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(ZR,Object.assign({},G,{day:d})):null; if(p&&!(p.here===false&&p.kind==='home')) return;   /* 她在台中（absentDates 的 home）*/
    PHONE.at(G,d,S.TC_H,S.L.zrTc.map(t=>dm(ZR,t)),'aa554_zr_tc'); };

  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; for(const f of [S.z4,S.q4,S.q7,S.q8,S.z7,S.z9,S.zrTc]){ try{ f(G); }catch(e){ console.warn('AA554 phone',e); } } };

  /* ---------- 摘要日（STORY.DAILY_PHONE）---------- */
  const TM=(...ids)=>t=>!!t&&ids.includes(t.id), TW=(id,w0,w1)=>t=>!!t&&t.id===id&&t.week>=w0&&t.week<=w1;
  S.DP=[
    /* BB_187 1-4：Z6 改成方奕廷這一則（Z6 的條件：大一下第 13～15 週、看過兩個人的早場或午場；只給有他聯絡方式的玩家）。時間照方奕廷別的手機小事 20:30（技術預設）*/
    {id:'aa554_fy_smile',term:TW('Y1S2',13,15),h:()=>20.5,ok:(G,day)=>law(G)&&dating(G,ZR)&&has(ZR,'WATCHED_FILM')&&!done(G,'ev_fangyt_hint')&&gotBefore(G,FY,day),items:()=>seq(FY,S.L.fy)},
    /* BB_187 2-4：凌晨 00:40（照稿）*/
    {id:'aa554_zq_bug',term:TM('Y1S2'),h:()=>24+40/60,ok:(G,day)=>law(G)&&dating(G,ZQ)&&gotBefore(G,ZQ,day),items:()=>seq(ZQ,S.L.zqBug)},
    /* BB_189 1-4：Q8 之後凌晨 00:20（照稿；河堤那一場演過才知道「小孩等的那個人」）*/
    {id:'aa554_zq_level',term:TM('Y2S2'),h:()=>24+20/60,ok:(G,day)=>law(G)&&dating(G,ZQ)&&done(G,'ev_ziqing_dad_visit')&&gotBefore(G,ZQ,day),items:()=>seq(ZQ,S.L.zqLevel)},
    /* BB_189 1-4：截圖那一則（時間照子晴的手機小事 22:10，技術預設）*/
    {id:'aa554_zq_cats',term:TM('Y2S1','Y2S2'),h:()=>22+10/60,ok:(G,day)=>law(G)&&dating(G,ZQ)&&gotBefore(G,ZQ,day),items:()=>seq(ZQ,S.L.zqCats)},
    /* BB_189 2-5：Z7b 之後（1/28 那則）——月曆「還沒到」：技術預設到錄取信那天（2027-05-11）以前；時間照她的 22:07 */
    {id:'aa554_zr_cal',term:TM('Y2S2'),h:()=>22+7/60,ok:(G,day)=>{ const m=D('2027-05-11'); return law(G)&&dating(G,ZR)&&sent(G,'zr_z7b')&&m!=null&&day<m&&gotBefore(G,ZR,day); },items:()=>seq(ZR,S.L.zrCal)},
    /* BB_189 2-5：Z8 之後（錄取信那晚的訊息或 Café 那一場）*/
    {id:'aa554_zr_pack',term:TM('Y2S2'),h:()=>22+7/60,ok:(G,day)=>law(G)&&dating(G,ZR)&&(!!G.flags.ZR_ADMITTED||sent(G,'y2r2_zr_admit'))&&gotBefore(G,ZR,day),items:()=>seq(ZR,S.L.zrPack)} ];

  /* ---------- 房間物件（BB_187 1-1）---------- */
  S.room=function(G,L){ if(!law(G)||!G.flags.ZR_Z3_DH) return; L.push(S.L.room.slice()); };

  /* ---------- 掛上去 ---------- */
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.EV_Z7)) STORY_EVENTS.push(S.EVENT_Z7);
  if(typeof STORY!=='undefined'&&!STORY._aa554){ STORY._aa554=true;
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.WAKE_AT)) STORY.WAKE_AT.push(G=>S.wake(G));
    if(Array.isArray(STORY.SCHED_X)) STORY.SCHED_X.push((c,G)=>S.sched(c,G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>S.room(G,L));
    if(Array.isArray(STORY.DAILY_PHONE)) for(const d of S.DP) if(!STORY.DAILY_PHONE.some(x=>x.id===d.id)) STORY.DAILY_PHONE.push(d); }
  return S;
})();
