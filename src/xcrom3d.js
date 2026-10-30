/* 吳芯慈可以交往（很難）：XINCI-ROMANCE-1030（使用者 2026-10-30 X139「芯慈可攻略 但要很難達成 請AA規劃」；AA_537 企劃線 2f523e21a、AA_537b 5ba143d2c）。
   這一支管：門檻 G1～G10（S.gates）、心意邀約發不發（S.heartOk：學期末 termend3d.js S.cond 問）、告白那一刻有沒有別的交往對象（S.othersNow）、她接不接受多段（S.acceptsOpen）。
   - 告白只在學期末（TERMEND.ON）：心意邀約 → 期末飯 → 回家的路上（termend_lines.js HEART.classmate_xinci，AA_537b 第 7 節）。
   - 「跟以安交往過就不開」（G10）、「不接受多段」（AA_537 5-5）是 AA 的建議，使用者 05:4x 還沒回（AA-B 16:18）：各做成一個開關，集中在 S.CFG。
   - 新的時刻（3-1～3-6）、半夜訊息（G5 XC_NIGHT）、交往以後（第 5、6 節）在後面幾段加（同一支）。 */
'use strict';
const XCROM=(()=>{
  const S={};
  const XC='classmate_xinci', AN='heroine_01';
  S.XC=XC;
  /* 使用者還沒定的兩條（AA_537 第 2 節、5-5）：改這裡就好 */
  S.CFG={noAnEx:true,noOpen:true};
  const F=G=>(G&&G.flags)||{};
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const mem=(G,tag)=>!!(G&&G.social&&G.social.mem&&(G.social.mem[XC]||[]).some(m=>m.tag===tag));
  const rel=()=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(XC):{};
  const n=v=>+v||0;
  /* G10 以安那一條：跟以安交往過（現在交往中、或分開過）＝這條線不開（只看這一個判斷）*/
  S.anDated=G=>{ const f=F(G); return f['dating_'+AN]===true||!!f['EX_'+AN]; };
  /* 多段那一條：她接不接受祐廷同時和別人交往（termend3d.js 的 KNOWS_OK、告白那一刻的 others 都問這裡）*/
  S.acceptsOpen=G=>!S.CFG.noOpen;
  /* G9：交往前第 6 階、她的戀愛 ≥ 70、信任 ≥ 60（一般 55／45）、正式約會 ≥ 6 次（一般 4）、去過她的心願地點 */
  S.NUM={npcRom:70,trust:60,count:6};
  S.numbers=function(G){ if(typeof DATE==='undefined'||!DATE.stageNum||!DATE.log) return false; const r=rel(), L=DATE.log(G,XC);
    return DATE.stageNum(XC)>=6&&n(r.npcRom)>=S.NUM.npcRom&&n(r.trust)>=S.NUM.trust&&(L.count|0)>=S.NUM.count&&!!L.wish; };
  /* 門檻（AA_537 第 1 節的表）*/
  S.gates=function(G){ const f=F(G), l118=G&&G.l118&&G.l118.once;
    return {
      G1:done(G,'ev_xinci_notes')&&typeof INV!=='undefined'&&!!INV.hasContact&&!!INV.hasContact(G,XC),   /* 慈 1 筆記，拿到聯絡方式 */
      G2:mem(G,'TALKED_FAMILY')||mem(G,'ECON_TOGETHER'),   /* 慈 2 雙主修（3-1 補問也記 TALKED_FAMILY）*/
      G3:!!(l118&&l118.H7c!=null),   /* 「她今天要換。」（lane118.js H7c）*/
      G4:mem(G,'XINCI_SECOND')&&(f.XC_FIX!=='yes'||!!f.XC_CALL1),   /* 慈 3 半夜的便利商店；走 Café 補演（XC_FIX）的要多過 3-3 那通電話（XC_CALL1）*/
      G5:(f.XC_NIGHT|0)>=6,   /* 半夜回她訊息 6 次（她傳的 30 分鐘內）*/
      G6:!!f.XC5_RECONCILE,   /* 慈 5 她跟以安和好 */
      G7:!!f.XC_SAMEDAY,   /* 「沒有提前一天」：她第一次當天約你，你答應 */
      G8:(done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video'))&&!!f.XC_BLANK,   /* 慈 6＋「空白的週三下午」選「那我來填。」*/
      G9:S.numbers(G),
      G10:!(S.CFG.noAnEx&&S.anDated(G)) }; };
  S.allGates=G=>{ const g=S.gates(G); return Object.keys(g).every(k=>g[k]); };
  /* 心意邀約發不發（AA_537b 第 7 節：G1～G8 都過、G9 數值、G10；人在國外那一學期沒有）——termend3d.js S.cond 一開始問；沒過＝不發、也不傳 NOPE 那一句 */
  S.heartOk=function(G){ if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; return S.allGates(G); };
  /* 告白那一刻祐廷正在交往的別人（她接受多段＝不算）：有＝她問完「你現在有在跟誰交往嗎。」接 others、不交往（AA_537 第 4 節、AA_537b 第 7 節）*/
  S.othersNow=function(G,who){ if(S.acceptsOpen(G)) return []; const f=F(G); return Object.keys(f).filter(k=>/^dating_/.test(k)&&f[k]===true).map(k=>k.slice(7)).filter(id=>id!==(who||XC)); };
  /* 她問過（5-5 被發現那一句「告白那天，我問過你」的來由）*/
  S.asked=G=>{ const f=F(G); if(f.XC_ASKED==null) f.XC_ASKED=G.day; };

  /* ===================== 第 2 段：新的時刻（AA_537 第 3 節）＝台詞一字照稿 ===================== */
  const law=G=>!!G&&(G.stage||'law')==='law';
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour%24);
  const hasP=()=>typeof PHONE!=='undefined'&&!!PHONE.at;
  const sent=(G,tag)=>hasP()&&PHONE.sent(G,tag);
  const contact=G=>typeof INV!=='undefined'&&!!INV.hasContact&&!!INV.hasContact(G,XC);
  const P=t=>({th:'p:'+XC,from:XC,text:t});
  const due=(G,d,h,late)=>d!=null&&now(G)>=T(d,h)&&now(G)<T(d,h)+(late==null?6:late);   /* 到了那個時間、還沒過太久（快轉跳過很久的不補）*/
  /* 3-1 G2 的補問：大二上第 3 週麵店長桌（麵店日、她在），慈 2 兩個都沒記（TALKED_FAMILY、ECON_TOGETHER）才有 */
  S.EV_G2={ id:'ev_xc_g2_dad', title:'', participants:[XC], location:'noodle', trigger:'auto', term:['Y2S1'], weeks:[3], ndlDay:true, time:[17.5,21], once:true, npcPresent:XC, background:'blur',
    prereq:{custom:G=>law(G)&&!mem(G,'TALKED_FAMILY')&&!mem(G,'ECON_TOGETHER')},
    dialogue:[ {speaker:XC,text:'我爸是會計師。……算了，沒什麼。'},
      {choice:[{text:'「妳爸怎麼了？」',goto:'a'},{text:'（不問）',goto:'end'}]},   /* 稿寫「玩家點她，選項」：大家都在長桌，旁白之後直接出選項（LAWWW-B 10-30 告訴 AA）*/
      {label:'a'},{speaker:XC,text:'他說，法律系畢業沒有第二專長會餓死。'},{speaker:XC,text:'……所以我有第二專長。'},{mem:[{npc:XC,tag:'TALKED_FAMILY',note:'她爸爸是會計師'}]},
      {label:'end'} ] };
  /* 3-2 G3 的提醒：大二下第 10 週週四 00:40，還沒過 G3（沒選過「她今天要換。」）、有她的聯絡方式 */
  S.G3_REMIND=['巷口那間家常菜，我還是點番茄炒蛋。','上次說想換。你沒有記。','……我也沒有。晚安。'];
  S.g3Remind=function(G){ const d=TD('Y2S2',10,4); if(!law(G)||!due(G,d,0+40/60)||sent(G,'xc_g3_remind')||!contact(G)||S.gates(G).G3) return; PHONE.at(G,d,40/60,S.G3_REMIND.map(P),'xc_g3_remind'); };
  /* 3-5 後補：慈 6 那天沒選「那我來填。」（另外兩個）＝大四上第 6 週週三 14:00 她再傳一次；回「我來填。」照樣記 XC_BLANK */
  S.blankAgain=function(G){ const d=TD('Y4S1',6,3), f=F(G); if(!law(G)||!due(G,d,14)||sent(G,'xc_blank_again')||f.XC_BLANK||!contact(G)||!(done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video'))) return;
    PHONE.at(G,d,14,[Object.assign(P('週三下午還是空的。'),{ask:{id:'xc_blank_again',until:T(d+2,0),opts:[{t:'我來填。',set:{XC_BLANK:true}}]}})],'xc_blank_again'); };
  /* 3-4 G7「沒有提前一天」：慈 5 以後的第一個週三（大三上第 14 週起）15:00 她當天約；沒答應（或答應了沒到）＝大三下第 6 週週三再約一次（第三則換「……再破例一次。」；
     日本路線大三下在日本＝改大四上第 2 週週三，AA_537 1-1）。兩次都沒答應：這條線關上（G7 不會過）。答應＝當天 18:00 巷口家常菜（出遊，ev_xc_sameday）*/
  S.G7_MSG=['今天晚上有空嗎。','我知道我說過吃飯要提前一天。','……今天想破例。'];
  S.G7_MSG2=['今天晚上有空嗎。','我知道我說過吃飯要提前一天。','……再破例一次。'];
  const isJP=G=>typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='JP';
  S.g7Day2=G=>isJP(G)?TD('Y4S1',2,3):TD('Y3S2',6,3);
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  S.g7Send=function(G,k,d){ const M=(k===1?S.G7_MSG:S.G7_MSG2).map(P), K='XC_G7_'+k;
    M[M.length-1].ask={id:'xc_g7_'+k,until:T(d,17.5),opts:[{t:'有。去哪？',say:[{from:XC,text:'巷口家常菜。六點。'}],set:{[K]:'go'}},{t:'今天不行。',say:[{from:XC,text:'好。那我還是提前一天。'}],set:{[K]:'no'}}]};
    PHONE.at(G,d,15,M,'xc_g7_'+k); F(G)['XC_G7_DAY'+k]=d; };
  S.g7=function(G){ const f=F(G); if(!law(G)||!hasP()||f.XC_SAMEDAY||!f.XC5_RECONCILE) return;
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:-1;
    if(!sent(G,'xc_g7_1')){ if(contact(G)&&t&&t.id==='Y3S1'&&t.week>=14&&wd===3&&(G.hour%24)>=15&&(G.hour%24)<17.5) S.g7Send(G,1,G.day); }
    else if(!sent(G,'xc_g7_2')){ const q1=outGet(G,'xc_g7_1'), d1=f.XC_G7_DAY1, failed=f.XC_G7_1!=='go'||(q1&&(q1.state==='missed'||q1.state==='cancelled'))||(d1!=null&&G.day>d1+1&&!f.XC_SAMEDAY);
      const d2=S.g7Day2(G); if(failed&&contact(G)&&due(G,d2,15,2.5)) S.g7Send(G,2,d2); }
    for(const k of [1,2]){ const d=f['XC_G7_DAY'+k]; if(f['XC_G7_'+k]==='go'&&d!=null&&!outGet(G,'xc_g7_'+k)&&now(G)<T(d,18.5)&&typeof OUT!=='undefined'&&OUT.plan)
      OUT.plan(G,{id:'xc_g7_'+k,ev:'ev_xc_sameday',day:d,h:18,late:0.5,place:'巷口家常菜',title:'和'+(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(XC):'芯慈')+'吃晚餐',travel:'',travelH:0.25,alarm:true,back:'吃完了。'}); } };
  S.EV_SAMEDAY={ id:'ev_xc_sameday', title:'今天想破例', participants:[XC], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'巷口家常菜',bg:'l118_home'},
      {speaker:'shop_home',name:'老闆娘',text:'妹妹今天也是番茄炒蛋？'},{speaker:XC,text:'……排骨飯。'},{speaker:'shop_home',name:'老闆娘',text:'喔！又換！'},
      {speaker:null,text:'（她看你一眼，好像在說：你看，我自己換了。）'},{speaker:XC,text:'今天沒有排讀書。是我自己沒有排。'},
      {set:{XC_SAMEDAY:true}} ] };
  /* 3-3 G4b：慈 3 走 Café 補演（XC_FIX＝yes）的玩家，大二下第 8 週週三 00:30 她第一次打電話來（出遊的電話，同 an_yt_hol3d.js）：接＝XC_CALL1（G4 過）；不接＝隔天早上「打錯了。」，G4 沒過 */
  S.callDay=()=>TD('Y2S2',8,3);
  S.call1=function(G){ const f=F(G), d=S.callDay(); if(!law(G)||d==null||f.XC_FIX!=='yes'||f.XC_CALL1||typeof OUT==='undefined'||!OUT.plan) return;
    if(f.XC_CALL1_MISS==null&&!outGet(G,'xc_call1')&&now(G)>=T(d-1,12)&&now(G)<T(d,0.75))
      OUT.plan(G,{id:'xc_call1',ev:'ev_xc_call1',day:d,h:0.5,late:0.25,place:'電話',verb:'接起來',no:'先不接',title:(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(XC):'芯慈')+'打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',alarm:true});
    const q=outGet(G,'xc_call1'); if(f.XC_CALL1_MISS==null&&q&&(q.state==='missed'||q.state==='cancelled'||(q.state==='planned'&&now(G)>T(d,0.75)))) f.XC_CALL1_MISS=d;
    if(f.XC_CALL1_MISS!=null&&!sent(G,'xc_call1_miss')&&now(G)>=T(d,8.5)&&now(G)<T(d+2,0)) PHONE.at(G,Math.max(d,G.day),Math.max(8.5,(G.day>d?G.hour%24:8.5)),[P('打錯了。')],'xc_call1_miss'); };
  S.EV_CALL1={ id:'ev_xc_call1', title:'她第一次打電話來', participants:[XC], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'電話',bg:'phone'},
      {speaker:XC,text:'……你還沒睡。'},{speaker:XC,text:'我在看一部劇。女主角考了第二名，哭了一整集。'},{speaker:XC,text:'我覺得很蠢。可是我也哭了。'},{speaker:XC,text:'你不用說什麼。我只是想講出來。'},
      {speaker:null,text:'（她講到一點半。你們掛電話的時候，她說了「晚安」，又說了一次。）'},
      {set:{XC_CALL1:true}} ],
    outingMissed:G=>{ if(G&&G.flags&&G.flags.XC_CALL1_MISS==null) G.flags.XC_CALL1_MISS=S.callDay(); } };
  S.phone=function(G){ for(const f of [S.g3Remind,S.blankAgain,S.g7,S.call1]){ try{ f(G); }catch(e){ console.warn('XCROM.phone',e); } } };
  S.EVENTS=[S.EV_G2,S.EV_SAMEDAY,S.EV_CALL1];
  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){ if(S._wired) return; S._wired=true;
    if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); };
  S.wire();
  return S;
})();
