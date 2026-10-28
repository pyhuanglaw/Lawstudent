/* ===== 學姊第十四批：她在美國的五個月（AA_516，企劃線 a9b87c588 → cf7d5fa94 第 7 節 → 3cd10909b 第 8 節；SIS-B14-1028、SIS-B14-AAFIX-1028、SIS-LEAD-1021、D111、USER_WANTS C25）：接線 =====
   台詞、事件在 src/data/sis_b14_events.js（照稿不改字）。第 1 節的十二處改在各自的檔（寫在 sis_b14_events.js 開頭）。這個檔：
   - 2-1 臺灣路線交往中、8/2 送機或在機場等她（y34b3d.js SIS_SENDOFF family／two／airport：交往中那兩場才有「到了先在群組說，再打給你。」）：
       8/3（四）22:00 她打來（出遊「接起來」；前 2 小時才排、不跳「排進行程」，同 y34b3d.js 以安 AN18 的視訊）；22:30 還沒接＝22:40 私訊；記 SIS14_CALL0803（沒接＝'missed'）。
       日本路線 8/2 人在日本、沒有送機＝沒有（稿 2-4）。
   - 2-3 等你考完：有 10/25 那則便條（r2y4a3d.js y4_push_note）、到那時還沒自己傳訊息給她（MSG「傳訊息」那一天沒有傳給她：G.msgChat.sent）：
       交往中 10/26（四）13:00、朋友 21:00；兩個回覆；記 SIS14_EXAM_WAIT（'gf'／'friend'）。自己先傳過的＝她照 MSG 那幾版回，不另外送。
   - 2-5 h5 選「好吃嗎？」（SIS14_CURRY_PROMISE，r2y4b_events.js）：12/30（六）21:00 私訊（規則晚跑到的照 21:00 補，回覆開到 12/31 11:30）→ 回「好。」→ 12/31（日）12:00 她家（出遊 2 小時）；那時已經不在交往＝不演。
   - 4-1 美國路線交往中、人在美國：9/1（五）21:00（當地）私訊兩則（兩個回覆都去）→ 9/2（六）14:00 C 棟 208（出遊 2 小時；2D C 棟 208）。
   - 4-2、4-3、4-5 閒聊階梯（src/data/ladder.js 的 SU-L6／SU-L7／SU-L8；選項沒有寫記憶）：STORY.ladReply 包一層，看選的是哪一個——
       SU-L6「明天早上我來煮。」＝隔天 07:00 208 的廚房（遲到 10 分鐘內算到；沒到＝07:15 私訊兩則、SIS14_EGGS 'missed'；隔天她不在＝12/16 離開、11/11 一早去芝加哥，不排）；
       SU-L7「好。週六。」＝那一週的週六 10:00 草原超市旁邊那家店（選的那天是週六、09:40 以前＝當天；其他＝下一個週六；那個週六她在芝加哥（11/11）＝再下一個；12/16 離開以後沒有）；
       SU-L8「那這次超重什麼？」（她回「書。三本。第四本你幫我拿。」）＝記 SIS14_BOOK4，12/16 離開那天（ev_us_leave）開頭多一句旁白。
   - 4-4 第四十天的私訊（src/sis_b13_3d.js sisb13_day40）選「我過去。」＝當晚 22:30（當地）C 棟門口（出遊 0.5 小時，不用移動）。
   - 1-3 大峽谷才交往的（SIS_GF_CANYON）第一次女朋友視訊開頭那一句：S.canyonOpenDue（r2y4b_events.js 問）。
  - 第 8 節懸著的承諾（3cd10909b，SIS-B14-AAFIX-1028）：
      第 1 點 4-1「……下次你用我的碗。」：有 SIS14_US_CURRY 的，之後第一次 208 的場景（us208_3d.js 七場，哪一場先演就哪一場）開頭多一句旁白、一次——S.bowlDue（us208_3d.js 七場共用的 BOWL 問；演了記 SIS14_BOWL）；
        七場都還沒演過才算「之後第一次」（4-1 是 9/2，七場最早 9/16：演過的一定在 4-1 以後；舊存檔已經演過一場的不補）。
      第 2 點 h9 選「我會去接妳。」記 SIS14_RIGHT（r2y4b_events.js ev_sis_video_gf）＝12/23 接機戀人版第一句旁白前面多一句（r2y4a_events.js ev_sis_pickup）。
   - 2D 背景：草原超市旁邊那家店、C 棟門口都沒有圖＝深色底＋地點字幕（在這裡登記 image:null；tests/scene_bg_keys_unit.js 的 PENDING）。
   旁邊有人時私密的不演（src/privtalk3d.js）：這一批新的都是電話、視訊、私訊約好的出遊（2D），沒有 3D 當面的入口，不用登記。
   測試：node tests/aa516_sis_b14_unit.js */
'use strict';
const SISB14=(function(){
  const S={}, ID='heroine_05', L=typeof SISB14_LINES!=='undefined'?SISB14_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  S.route=route;
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const stageOk=min=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf(min); };
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  const wd=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd:0;   /* 1＝週一 … 7＝週日 */
  const inUS=G=>typeof USL!=='undefined'&&!!USL.here&&USL.here(G);   /* 美國路線、人在美國（抵達以後、回來以前）*/
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const reply=o=>({t:o.t,say:[{from:ID,text:o.r}]});
  const leaveDay=()=>D(typeof USL!=='undefined'&&USL.CAL&&USL.CAL.leave?USL.CAL.leave:'2028-12-16');   /* 12/16 離開社區（us_life3d.js S.CAL.leave）*/
  const away=(d,h)=>typeof USL!=='undefined'&&!!USL.sisAwayAt&&!!USL.sisAwayAt(T(d,h));   /* 她不在社區（芝加哥 11/11 07:00～11/12 21:45；us_life3d.js S.SIS_AWAY）*/

  /* ---------------- 1-3 大峽谷才交往的第一次女朋友視訊（一次）---------------- */
  S.canyonOpenDue=G=>law(G)&&route(G)!=='US'&&S.dating(G)&&!!G.flags&&G.flags.SIS_GF_CANYON!=null&&!G.flags.SIS14_CANYON_OPEN;

  /* ---------------- 第 8 節第 1 點：4-1 之後第一次 208 的場景開頭那一句（一次；us208_3d.js 的 BOWL 問）---------------- */
  S.played208=G=>typeof US208!=='undefined'&&Array.isArray(US208.SCENES)&&US208.SCENES.some(s=>!!(G&&G.events&&G.events.done&&G.events.done[s.ev]));   /* 七場演過任何一場（EVENTS.run 演完才記 done：演的那一場自己不算）*/
  S.bowlDue=G=>law(G)&&G.flags.SIS14_US_CURRY===true&&!G.flags.SIS14_BOWL&&!S.played208(G);

  /* ---------------- 2-1 8/3 那一通電話 ---------------- */
  S.CALL={day:'2028-08-03',h:22,late:0.5,lead:2,miss:22+40/60};
  S.CALL_OUT={id:'sisb14_call0803',ev:'ev_sis14_call0803',place:'電話',verb:'接起來',no:'先不接',title:'書瑀打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true,alarm:false};   /* 電話：在家也不用出門（OUT.trip 看 call）；睡覺不叫醒（同 y34b3d.js 口試那一通）*/
  S.callOk=G=>law(G)&&route(G)!=='JP'&&route(G)!=='US'&&S.dating(G)&&['family','two','airport'].includes(G.flags.SIS_SENDOFF);   /* 送機那兩場交往中才說「到了先在群組說，再打給你。」；送機只有 8/2，8/3 還在交往＝那時也在交往 */
  S.call=function(G){ const F=G.flags, d=D(S.CALL.day); if(d==null||G.day<d||G.day>d+1||F.SIS14_CALL0803!=null||!S.callOk(G)) return;
    const t=T(d,S.CALL.h), q=outGet(G,S.CALL_OUT.id);
    if(!q){ if(now(G)>=t-S.CALL.lead&&now(G)<t+S.CALL.late) plan(G,Object.assign({},S.CALL_OUT,{day:d,h:S.CALL.h,late:S.CALL.late}));
      else if(now(G)>=t+S.CALL.late) S.callMissed(G); return; }   /* 那一段沒跑到規則（整段在別的劇情裡、讀檔）＝當作沒接 */
    if(q.state==='missed'||(q.state==='planned'&&now(G)>t+S.CALL.late)){ q.state='missed'; S.callMissed(G); } };   /* 人在家（暑假住家裡）的時候 OUT.tick 不跑：過了時間這裡自己記沒接（同 y34b3d.js S.an18Video）*/
  S.callMissed=function(G){ const F=G.flags, d=D(S.CALL.day); if(F.SIS14_CALL0803!=null||d==null||typeof PHONE==='undefined') return; F.SIS14_CALL0803='missed'; PHONE.at(G,d,S.CALL.miss,[dm(L.callMiss)],'sisb14_call0803_miss'); };
  /* 跳過時間碰到她打來要停下來（同 y34b3d.js AN18：CLS.STOP_FNS；睡覺照舊算沒接）*/
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.STOP_FNS)) CLS.STOP_FNS.push(G=>{ const F=(G&&G.flags)||{}, d=D(S.CALL.day); if(d==null||G.day!==d||F.SIS14_CALL0803!=null||!S.callOk(G)) return []; const q=outGet(G,S.CALL_OUT.id); if(q&&q.state!=='planned') return []; return [{h:S.CALL.h,why:'手機響了'}]; });

  /* ---------------- 2-3 等你考完 ---------------- */
  S.EXAM={day:'2028-10-26',gf:13,friend:21};
  S.selfSent=(G,d)=>!!(G.msgChat&&G.msgChat.sent&&G.msgChat.sent[ID]===d);   /* 那一天自己傳過訊息給她（MSG：同一個人一天一次，記傳的那一天）*/
  S.exam=function(G){ const F=G.flags, d=D(S.EXAM.day), tag='sisb14_exam'; if(d==null||G.day!==d||F.SIS14_EXAM_WAIT!=null||sent(G,tag)||!sent(G,'y4_push_note')||!law(G)) return;
    const gf=S.dating(G), h=gf?S.EXAM.gf:S.EXAM.friend; if(now(G)<T(d,h)||S.selfSent(G,d)||!contact(G)) return;
    if(!gf&&!stageOk('FRIEND')) return;   /* 朋友版：推甄便條朋友版那一群（FRIEND 以上）*/
    const M=(gf?L.examGf:L.examFriend).map(dm); M[M.length-1].ask={id:tag,opts:(gf?L.examGfOpts:L.examFriendOpts).map(reply)};
    PHONE.at(G,d,h,M,tag); F.SIS14_EXAM_WAIT=gf?'gf':'friend'; };

  /* ---------------- 2-5 鍋子那一句的兌現 ---------------- */
  S.HOME={ask:'2028-12-30',day:'2028-12-31'};
  S.HOME_OUT={id:'sisb14_curry_home',ev:'ev_sis14_curry_home',h:12,late:0.5,place:'學姊的新家',title:'書瑀家的咖哩（中午）',travel:'捷運 約 30 分鐘',travelH:0.5,hours:2,back:'回到住的地方。'};   /* 車程同 AA_512 13-2 */
  S.homeOk=G=>law(G)&&route(G)!=='US'&&S.dating(G)&&!!G.flags.SIS14_CURRY_PROMISE;
  S.home=function(G){ const F=G.flags, a=D(S.HOME.ask), d=D(S.HOME.day), tag='sisb14_curry_home_ask'; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(d,11.5)&&S.homeOk(G)&&contact(G)){ const m=dm(L.curryHome); m.ask={id:tag,until:T(d,11.5),opts:[{t:L.curryHomeGo,set:{SIS14_CURRY_HOME_GO:true}}]}; PHONE.at(G,a,21,[m],tag); }   /* 回「好。」才演 */
    if(F.SIS14_CURRY_HOME_GO===true&&F.SIS14_CURRY_HOME==null){ const q=outGet(G,S.HOME_OUT.id);
      if(!S.homeOk(G)){ if(q&&q.state==='planned') q.state='cancelled'; }   /* 12/31 已經不在交往＝不演 */
      else if(now(G)<T(d,S.HOME_OUT.h+S.HOME_OUT.late)) plan(G,Object.assign({},S.HOME_OUT,{day:d})); } };

  /* ---------------- 4-1 開學第一週（美國路線交往中）---------------- */
  S.US1={ask:'2028-09-01',day:'2028-09-02'};
  S.US1_OUT={id:'sisb14_us_curry',ev:'ev_sis14_us_curry',h:14,late:0.5,place:'C 棟 208',title:'C 棟 208（書瑀的咖哩）',travel:'走路 約 5 分鐘',travelH:1/12,hours:2,back:'回到社區。'};   /* 同 us208_3d.js 的出遊 */
  S.usOk=G=>law(G)&&route(G)==='US'&&S.dating(G)&&inUS(G);
  S.us1=function(G){ const F=G.flags, a=D(S.US1.ask), d=D(S.US1.day), tag='sisb14_us_curry_ask'; if(a==null||d==null||G.day<a||G.day>d) return;
    if(!sent(G,tag)&&now(G)>=T(a,21)&&now(G)<T(d,S.US1_OUT.h)&&S.usOk(G)){ const M=(L.usCurry||[]).map(dm); M[M.length-1].ask={id:tag,until:T(d,S.US1_OUT.h),opts:(L.usCurryOpts||[]).map(o=>Object.assign(reply(o),{set:{SIS14_US_CURRY_GO:true}}))}; PHONE.at(G,a,21,M,tag); }   /* 兩個回覆都去；沒回＝不排 */
    if(F.SIS14_US_CURRY_GO===true&&F.SIS14_US_CURRY==null&&S.usOk(G)&&now(G)<T(d,S.US1_OUT.h+S.US1_OUT.late)) plan(G,Object.assign({},S.US1_OUT,{day:d})); };

  /* ---------------- 4-2、4-3、4-5 閒聊階梯的選項 ---------------- */
  S.LAD={'SU-L6':{t:'「明天早上我來煮。」',f:'SIS14_EGGS_DAY'},'SU-L7':{t:'「好。週六。」',f:'SIS14_COAT_DAY'},'SU-L8':{t:'「那這次超重什麼？」',f:'SIS14_BOOK4'}};
  S.onLad=function(G,st,ch,id){ if(id!==ID||!G||!G.flags||!st||!ch||!law(G)||route(G)!=='US'||!S.dating(G)) return false; const x=S.LAD[st.id]; if(!x||ch.t!==x.t) return false;
    if(G.flags[x.f]!=null) return false; G.flags[x.f]=st.id==='SU-L8'?true:G.day;
    if(st.id==='SU-L6') S.eggsPlan(G); if(st.id==='SU-L7') S.coatPlan(G); return true; };
  /* 4-2 隔天 07:00（她 12/16 離開以前）*/
  S.EGGS_OUT={id:'sisb14_eggs',ev:'ev_sis14_eggs',h:7,late:10/60,place:'C 棟 208',title:'C 棟 208（早上七點，煮蛋）',travel:'走路 約 5 分鐘',travelH:1/12,hours:1,back:'回到社區。'};
  S.eggsPlan=function(G){ const d0=G.flags.SIS14_EGGS_DAY, lv=leaveDay(); if(d0==null) return; const d=d0+1; if((lv!=null&&d>=lv)||away(d,S.EGGS_OUT.h)) return; plan(G,Object.assign({},S.EGGS_OUT,{day:d})); };   /* 隔天她不在（12/16 離開、11/11 一早去芝加哥）＝不排（稿寫「隔天」，不往後挪）*/
  S.eggsMissed=function(G,q){ const F=G.flags; if(F.SIS14_EGGS!=null||typeof PHONE==='undefined') return; F.SIS14_EGGS='missed'; const d=q&&q.day!=null?q.day:(F.SIS14_EGGS_DAY|0)+1; PHONE.at(G,d,7.25,(L.eggsMiss||[]).map(dm),'sisb14_eggs_miss'); };   /* 07:15 */
  /* 4-3 那一週的週六 10:00（「早上去。下午人很多。」）*/
  S.COAT_OUT={id:'sisb14_coat',ev:'ev_sis14_coat',h:10,late:0.5,place:'草原超市旁邊那家店',title:'草原超市旁邊那家店（挑外套）',travel:'公車 約 20 分鐘',travelH:1/3,hours:1.5,back:'回到社區。'};   /* 車程同竹葉亞洲超市（就在草原超市對面，us_blank_lines.js）*/
  S.coatDay=G=>{ const d0=G.flags.SIS14_COAT_DAY; if(d0==null) return null; let n=(6-wd(d0)+7)%7; if(n===0&&(d0<G.day||(+G.hour||0)>=S.COAT_OUT.h-S.COAT_OUT.travelH)) n=7; let d=d0+n;
    while(away(d,S.COAT_OUT.h)) d+=7; return d; };   /* 選的那天是週六、還來得及＝當天；其他＝下一個週六；那個週六她在芝加哥（11/11）＝再下一個週六 */
  S.coatPlan=function(G){ const d=S.coatDay(G), lv=leaveDay(); if(d==null||(lv!=null&&d>=lv)) return; plan(G,Object.assign({},S.COAT_OUT,{day:d})); };

  /* ---------------- 4-4 第四十天「我過去。」---------------- */
  S.DAY40_OUT={id:'sisb14_day40',ev:'ev_sis14_day40',h:22.5,late:0.5,place:'C 棟門口',title:'C 棟門口（書瑀）',travel:'',travelH:0,hours:0.5,back:'回到公寓。'};   /* 不用移動 */
  S.onAnswer=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='sisb13_day40'||!o||o.t!=='我過去。'||!G||!G.flags) return; const d=m.day;
    G.flags.SIS14_DAY40_GO=d; if(now(G)<T(d,S.DAY40_OUT.h+S.DAY40_OUT.late)) plan(G,Object.assign({},S.DAY40_OUT,{day:d})); };   /* 當晚；隔天才回的不排 */

  /* ---------------- 手機規則、掛勾 ---------------- */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.call,S.exam,S.home,S.us1]){ try{ f(G); }catch(e){ console.warn('SISB14 phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._sisb14){ PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); PHONE.ON_ANSWER._sisb14=true; }
  /* 閒聊階梯選了哪一個（STORY.ladPlay 選完叫 STORY.ladReply(那一層, 選的那一個, G, 人物)）：包一層，回覆照舊 */
  if(typeof STORY!=='undefined'&&typeof STORY.ladReply==='function'&&!STORY._sisb14Lad){ const r0=STORY.ladReply;
    STORY.ladReply=function(st,ch,G,id){ try{ S.onLad(G,st,ch,id); }catch(e){ console.warn('SISB14 lad',e); } return r0.apply(this,arguments); }; STORY._sisb14Lad=true; }
  /* 2D 背景：沒有圖＝深色底＋地點字幕（tests/scene_bg_keys_unit.js 的 PENDING；BB 跟使用者要圖）*/
  if(typeof OUT!=='undefined'&&OUT.BG){ if(!OUT.BG.us_coat_shop) OUT.BG.us_coat_shop={label:'草原超市旁邊那家店',image:null}; if(!OUT.BG.us_c_door) OUT.BG.us_c_door={label:'C 棟門口',image:null}; }
  return S;
})();
