/* 吳芯慈可以交往（很難）：XINCI-ROMANCE-1030（使用者 2026-10-30 X139「芯慈可攻略 但要很難達成 請AA規劃」；AA_537 企劃線 2f523e21a、AA_537b 5ba143d2c）。
   這一支管：門檻 G1～G10（S.gates）、心意邀約發不發（S.heartOk：學期末 termend3d.js S.cond 問）、告白那一刻有沒有別的交往對象（S.othersNow）、她接不接受多段（S.acceptsOpen）。
   - 告白只在學期末（TERMEND.ON）：心意邀約 → 期末飯 → 回家的路上（termend_lines.js HEART.classmate_xinci，AA_537b 第 7 節）。
   - 「跟以安交往過就不開」（G10）：使用者 10-30 選「照樣可以開」（CFG.noAnEx false）；「不接受多段」（AA_537 5-5）：使用者要先討論她的個性，還沒定（CFG.noOpen 照 AA 的建議）。
   - 新的時刻（3-1～3-6）、半夜訊息（G5 XC_NIGHT）、交往以後（第 5、6 節）在後面幾段加（同一支）。 */
'use strict';
const XCROM=(()=>{
  const S={};
  const XC='classmate_xinci', AN='heroine_01';
  S.XC=XC;
  /* 兩條開關（AA_537 第 2 節、5-5）：
     noAnEx＝跟以安交往過就不開——使用者 2026-10-30 選「照樣可以開」（UA-LAWWW-1030-26）＝false；
     noOpen＝不接受多段——使用者 10-30：「我們要討論一下他的個性再來討論……應該是他主觀要知道如果玩家有跟別人交往，如果只是客觀有這件事情他不知道的話那他也無從在意吧」（UA-LAWWW-1030-27）＝還在討論，先照 AA 的建議 */
  S.CFG={noAnEx:false,noOpen:false};   /* noOpen：使用者 10-31 00:0x 點選「只要沒騙她就接受」（AA_548 第 7 節）＝false；noAnEx 已經沒有用了（G10 拿掉）*/
  /* 整條線的開關（2026-10-30 17:1x AA-B 轉：使用者直接對 AA 否決芯慈×以安「第一名／第二名」整條劇情——「拜託你把那個第一第二名刪掉，這個爛劇情」；
     這條線用「第二名」撐，先停、不進下一版，等 AA 重寫）：false＝芯慈不在 DATE.HEROINES、沒有心意邀約、告白、半夜訊息、新的時刻、心願午夜場；
     程式留著（tests/xinci_romance_unit.js 用 XCROM.setOn(true) 測），AA 重寫以後照新稿改、再打開 */
  S.ON=true;   /* 2026-10-31 打開：AA_548 第 1～7 節做完（芯慈新個性 AA_547 使用者 10-30 19:2x 點選、告白不問／沒騙就接受 10-31 00:0x 點選；AA-B 00:25「XCROM.ON 可以打開」）*/
  /* 慈 3、慈 5、慈 6 的開關（名字 OLD 是歷史：10-30 19:0x 先關掉舊的「第二名」四場，D116）：AA_547（企劃線 c746f364d，使用者 19:2x 點選「照這份寫」）已經把它們換成新稿——
     慈 3「凌晨的便利商店」（＋B1、Café 補演、第 11 週提示）、慈 5「對答案」（分工抄筆記）、慈 6「暑期實習」；慈 4、Alison「吵架了」整場拿掉。true＝照新稿演；
     要整批再關掉時改 false（各支的條件問 XCROM.OLD）。戀愛線（S.ON）照舊關著，等 AA_548 重寫門檻 */
  S.OLD=true;
  const F=G=>(G&&G.flags)||{};
  const eDay=G=>G.day+Math.floor((+G.hour||0)/24), eH=G=>{ const h=+G.hour||0; return h-24*Math.floor(h/24); };   /* 換算後的日期、時刻（見下面 now）*/
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const mem=(G,tag)=>!!(G&&G.social&&G.social.mem&&(G.social.mem[XC]||[]).some(m=>m.tag===tag));
  const rel=()=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(XC):{};
  const n=v=>+v||0;
  /* G10 以安那一條：跟以安交往過（現在交往中、或分開過）＝這條線不開（只看這一個判斷）*/
  S.anDated=G=>{ const f=F(G); return f['dating_'+AN]===true||!!f['EX_'+AN]; };
  /* 多段那一條：她接不接受祐廷同時和別人交往（termend3d.js 的 KNOWS_OK、告白那一刻的 others 都問這裡）*/
  S.acceptsOpen=G=>!S.CFG.noOpen;
  /* ===================== AA_548 第 7 節（使用者 10-31 00:0x 點選：告白時她不問；只要沒騙她就接受）=====================
     她自己知道了才算：你親口說（ROM.tellBy，source yt_told）＝接受；她從別的地方知道、你沒說過＝分手（挽回一次）。不問、也就沒有「騙」的那一句 */
  const romOk=()=>typeof ROM!=='undefined'&&!!ROM.knowsOf;
  S.othersDating=G=>{ const f=F(G); return Object.keys(f).filter(k=>/^dating_/.test(k)&&f[k]===true).map(k=>k.slice(7)).filter(id=>id!==XC); };
  S.toldOf=(G,p)=>romOk()&&!!ROM.relRec&&(((ROM.relRec(G)||{})[XC]||{})[p]||{}).source==='yt_told';
  S.hidden=G=>S.othersDating(G).filter(p=>!S.toldOf(G,p));   /* 交往中、還沒親口跟她說的 */
  S.foundOut=G=>S.othersDating(G).filter(p=>romOk()&&ROM.knowsOf(G,XC,p)&&!S.toldOf(G,p));   /* 她自己知道了、你沒說過的 */
  S.knowsOk=G=>!S.foundOut(G).length;   /* termend3d.js KNOWS_OK：她知道的每一段都是你說的 */
  S.tell=G=>{ for(const p of S.hidden(G)) if(typeof ROM!=='undefined'&&ROM.tellBy) ROM.tellBy(G,XC,p); F(G).XC_TOLD=eDay(G); };
  S.TELL_OPT='（先告訴她，你在跟誰交往）';
  S.TELL_LINES=['……我要知道是誰。',{narr:'（你說了。）'},'好。知道了，我才排得出來。'];   /* 告白那時（termend3d.js 回家的路上）*/
  S.KNOWN_LINE='你跟她的事，我知道。……我排得出來。';   /* 告白那時她已經知道（之前說過）：她答應的時候 */

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
      G4:(mem(G,'XINCI_NIGHT')||mem(G,'XINCI_SECOND'))&&(f.XC_FIX!=='yes'||!!f.XC_CALL1),   /* 慈 3 半夜的便利商店；走 Café 補演（XC_FIX）的要多過 3-3 那通電話（XC_CALL1）*/
      G5:(f.XC_NIGHT|0)>=6,   /* 半夜回她訊息 6 次（她傳的 30 分鐘內）*/
      G6:!!f.XC5_RECONCILE,   /* 慈 5「對答案」演過＝開始一起讀書（AA_548 第 1 節；沒演到＝大三下第 3 週總圖三樓補一次，S.EV_G6）*/
      G7:!!f.XC_SAMEDAY,   /* 「沒有提前一天」：她第一次當天約你，你答應 */
      G8:(done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video'))&&!!f.XC_BLANK,   /* 慈 6「暑期實習」以後「週六晚上」選「我可以一起嗎？」（AA_548 3-5；大四上第 6 週週六再問一次）*/
      G9:S.numbers(G) }; };   /* 舊 G10「跟以安交往過就不開」拿掉（AA_548 第 1 節；使用者選照樣可以開）*/
  S.allGates=G=>{ if(!S.ON) return false; const g=S.gates(G); return Object.keys(g).every(k=>g[k]); };
  /* 心意邀約發不發（AA_537b 第 7 節：G1～G8 都過、G9 數值、G10；人在國外那一學期沒有）——termend3d.js S.cond 一開始問；沒過＝不發、也不傳 NOPE 那一句 */
  S.heartOk=function(G){ if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; return S.allGates(G); };
  /* 告白那一刻祐廷正在交往的別人（她接受多段＝不算）：有＝她問完「你現在有在跟誰交往嗎。」接 others、不交往（AA_537 第 4 節、AA_537b 第 7 節）*/
  S.othersNow=function(G,who){ if(S.acceptsOpen(G)) return []; const f=F(G); return Object.keys(f).filter(k=>/^dating_/.test(k)&&f[k]===true).map(k=>k.slice(7)).filter(id=>id!==(who||XC)); };
  /* 她問過（5-5 被發現那一句「告白那天，我問過你」的來由）*/
  S.asked=G=>{ const f=F(G); if(f.XC_ASKED==null) f.XC_ASKED=eDay(G); };

  /* ===================== 第 2 段：新的時刻（AA_537 第 3 節）＝台詞一字照稿 ===================== */
  const law=G=>!!G&&(G.stage||'law')==='law';
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  /* 現在是哪一天、幾點（BB-B 10-31 讀程式找到）：過了半夜遊戲只把 G.hour 加到 24 以上、不換 G.day（睡覺才換）——原本用 G.day、G.hour%24 會少算一天（熬夜到 01:00 收不到半夜訊息、隔一晚才傳）。同 msg3d.js：G.day＋floor(hour/24) */
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const hasP=()=>typeof PHONE!=='undefined'&&!!PHONE.at;
  const sent=(G,tag)=>hasP()&&PHONE.sent(G,tag);
  const contact=G=>typeof INV!=='undefined'&&!!INV.hasContact&&!!INV.hasContact(G,XC);
  const P=t=>({th:'p:'+XC,from:XC,text:t});
  const due=(G,d,h,late)=>d!=null&&now(G)>=T(d,h)&&now(G)<T(d,h)+(late==null?6:late);   /* 到了那個時間、還沒過太久（快轉跳過很久的不補）*/
  /* 3-1 G2 的補問（AA_548 3-1）：大二上第 3 週，巷口家常菜（l118_home；她那一週平日 18:00～19:30 在那裡吃飯，S.SCHED），慈 2 兩個都沒記（TALKED_FAMILY、ECON_TOGETHER）才有 */
  S.g2Done=G=>mem(G,'TALKED_FAMILY')||mem(G,'ECON_TOGETHER');
  S.EV_G2={ id:'ev_xc_g2_dad', title:'', participants:[XC], location:'l118_home', trigger:'auto', term:['Y2S1'], weeks:[3], weekday:[1,2,3,4,5], time:[18,19.5], once:true, npcPresent:XC, background:'blur',   /* id 照舊（舊存檔記過的）*/
    prereq:{custom:G=>law(G)&&!S.g2Done(G)},
    dialogue:[ {speaker:XC,text:'我昨天又在幫我媽對帳。……算了，你不會想聽。'},
      {choice:[{text:'「我想聽。」',goto:'a'},{text:'（不問）',goto:'end'}]},
      {label:'a'},{speaker:XC,text:'我爸媽都是律師。事務所的帳，我從國中就在對。'},{speaker:XC,text:'……所以我雙主修財金。是我自己要的。'},{mem:[{npc:XC,tag:'TALKED_FAMILY',note:'她爸媽都是律師，雙主修財金是她自己要的'}]},
      {label:'end'} ] };
  /* G6 補一次（AA_548 第 2 節）：慈 5 沒演到的，大三下第 3 週週一～三 18:00～21:00 總圖三樓（以安、芯慈都在，S.SCHED）；看到就算、不用選，記 XC5_RECONCILE */
  S.EV_G6={ id:'ev_xc_g6_makeup', title:'對答案', participants:[], location:'library', trigger:'enter', once:true, background:'blur', npcZone:[AN,XC], term:['Y3S2'], weeks:[3], weekday:[1,2,3], time:[18,21],
    prereq:{custom:G=>law(G)&&!F(G).XC5_RECONCILE&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))},
    dialogue:[ {speaker:null,text:'（以安和芯慈在對民訴的考古題。以安在日本以前的最後幾個禮拜。）'},
      {speaker:XC,text:'第三題，妳的寫法比我的清楚。我抄。'},{speaker:AN,text:'第六題換我抄妳的表。'},{speaker:XC,text:'（對你）你要加入嗎？你負責第八題。'},
      {set:{XC5_RECONCILE:true}} ] };
  /* 3-2 G3 的提醒：大二下第 10 週週四 00:40，還沒過 G3（沒選過「她今天要換。」）、有她的聯絡方式 */
  S.G3_REMIND=['巷口那間家常菜，我還是點番茄炒蛋。','上次說想換。你沒有記。','……我也沒有。晚安。'];
  S.g3Remind=function(G){ const d=TD('Y2S2',10,4); if(!law(G)||!due(G,d,0+40/60)||sent(G,'xc_g3_remind')||!contact(G)||S.gates(G).G3) return; PHONE.at(G,d,40/60,S.G3_REMIND.map(P),'xc_g3_remind'); };
  /* 3-5 後補（AA_548 3-5）：慈 6 那天「週六晚上」沒選「我可以一起嗎？」＝大四上第 6 週週六 14:00 她再傳一則；回「我也去。」照樣記 XC_BLANK，那天 19:00 排一次 D04 約會（一般約會，不是心願的午夜場）*/
  S.BLANK_AGAIN='今天晚上七點，西門町。……我還是一個人。';
  S.blankAgain=function(G){ const d=TD('Y4S1',6,6), f=F(G); if(!law(G)||!due(G,d,14)||sent(G,'xc_blank_again')||f.XC_BLANK||!contact(G)||!(done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video'))) return;
    PHONE.at(G,d,14,[Object.assign(P(S.BLANK_AGAIN),{ask:{id:'xc_blank_again',until:T(d,18),opts:[{t:'我也去。',set:{XC_BLANK:true}}]}})],'xc_blank_again'); };
  S.onBlank=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='xc_blank_again'||!o||typeof DATE==='undefined'||!DATE.check||!DATE.book) return; const tr=DATE.travel&&DATE.travel('D04');
    const tH=tr?tr.minutes/60:0.5;   /* 七點那一場：提早 15 分鐘到（19:00 才到，回程會超過約會的 23:30 上限）*/
    for(const dep of [19-tH-0.25,19-tH-0.5]){ const o2={who:XC,locs:['D04'],day:m.day,depart:dep,kind:'evening'}, c=DATE.check(G,o2); if(c&&c.ok){ DATE.book(G,Object.assign(o2,{by:'npc'})); return; } } };
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
    const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(eDay(G)):null, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(eDay(G)).wd%7:-1;
    if(!sent(G,'xc_g7_1')){ if(contact(G)&&t&&t.id==='Y3S1'&&t.week>=14&&wd===3&&eH(G)>=15&&eH(G)<17.5) S.g7Send(G,1,eDay(G)); }
    else if(!sent(G,'xc_g7_2')){ const q1=outGet(G,'xc_g7_1'), d1=f.XC_G7_DAY1, failed=f.XC_G7_1!=='go'||(q1&&(q1.state==='missed'||q1.state==='cancelled'))||(d1!=null&&eDay(G)>d1+1&&!f.XC_SAMEDAY);
      const d2=S.g7Day2(G); if(failed&&contact(G)&&due(G,d2,15,2.5)) S.g7Send(G,2,d2); }
    for(const k of [1,2]){ const d=f['XC_G7_DAY'+k]; if(f['XC_G7_'+k]==='go'&&d!=null&&!outGet(G,'xc_g7_'+k)&&now(G)<T(d,18.5)&&typeof OUT!=='undefined'&&OUT.plan)
      OUT.plan(G,{id:'xc_g7_'+k,ev:'ev_xc_sameday',day:d,h:18,late:0.5,place:'巷口家常菜',title:'和'+(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(XC):'芯慈')+'吃晚餐',travel:'',travelH:0.25,alarm:true,back:'吃完了。'}); } };
  S.EV_SAMEDAY={ id:'ev_xc_sameday', title:'今天想破例', participants:[XC], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'巷口家常菜'},   /* 118 巷的店沒有 2D 底圖（3D 店面 l118_home）＝深色底＋字幕 */
      {speaker:'shop_home',name:'老闆娘',text:'妹妹今天也是番茄炒蛋？'},{speaker:XC,text:'……排骨飯。'},{speaker:'shop_home',name:'老闆娘',text:'喔！又換！'},
      {speaker:null,text:'（她看你一眼，好像在說：你看，我自己換了。）'},{speaker:XC,text:'今天沒有排讀書。是我自己沒有排。'},
      {set:{XC_SAMEDAY:true}} ] };
  /* 3-3 G4b：慈 3 走 Café 補演（XC_FIX＝yes）的玩家，大二下第 8 週週三 00:30 她第一次打電話來（出遊的電話，同 an_yt_hol3d.js）：接＝XC_CALL1（G4 過）；不接＝隔天早上「打錯了。」，G4 沒過 */
  S.callDay=()=>TD('Y2S2',8,3);
  S.call1=function(G){ const f=F(G), d=S.callDay(); if(!law(G)||d==null||f.XC_FIX!=='yes'||f.XC_CALL1||typeof OUT==='undefined'||!OUT.plan) return;
    if(f.XC_CALL1_MISS==null&&!outGet(G,'xc_call1')&&now(G)>=T(d-1,12)&&now(G)<T(d,0.75))
      OUT.plan(G,{id:'xc_call1',ev:'ev_xc_call1',day:d,h:0.5,late:0.25,place:'電話',verb:'接起來',no:'先不接',title:(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(XC):'芯慈')+'打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',alarm:true});
    const q=outGet(G,'xc_call1'); if(f.XC_CALL1_MISS==null&&q&&(q.state==='missed'||q.state==='cancelled'||(q.state==='planned'&&now(G)>T(d,0.75)))) f.XC_CALL1_MISS=d;
    if(f.XC_CALL1_MISS!=null&&!sent(G,'xc_call1_miss')&&now(G)>=T(d,8.5)&&now(G)<T(d+2,0)) PHONE.at(G,Math.max(d,eDay(G)),Math.max(8.5,(eDay(G)>d?eH(G):8.5)),[P('打錯了。')],'xc_call1_miss'); };
  S.EV_CALL1={ id:'ev_xc_call1', title:'她第一次打電話來', participants:[XC], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'電話'},
      {speaker:XC,text:'……你還沒睡。'},{speaker:XC,text:'我在看一部劇。女主角一個人把整間公司的帳對完，哭了一整集。'},{speaker:XC,text:'我覺得很蠢。可是我也哭了。'},{speaker:XC,text:'你不用說什麼。我只是想講出來。'},
      {speaker:null,text:'（她講到一點半。掛電話的時候，她說了「晚安」，又說了一次。）'},
      {set:{XC_CALL1:true}} ],
    outingMissed:G=>{ if(G&&G.flags&&G.flags.XC_CALL1_MISS==null) G.flags.XC_CALL1_MISS=S.callDay(); } };
  /* 第 2 節「和以安分開那晚 01:10」那一則：使用者 10-30 選「照樣可以開」以後 AA-B 17:18「拿掉，不換」——不做 */
  /* ---------- G5 半夜訊息（AA_537 第 1 節「G5 的訊息從哪裡來」、AA_537b 第 9 節 8acf3b308）----------
     慈 3（或 3-3 電話）以後每週一則：週三或週日（一週週三、一週週日輪流）00:30～01:30；照順序輪、用完從頭（八則一輪＝同一則八週內不重複）。
     A＝慈 3 以後、慈 5 以前，B＝慈 5（開始一起讀書）以後（AA_548 第 5 節換了 A3、A4、A5、A7、A8、B1、B3、B8；B3、B8 不再看慈 6）。交往以後換 L 層（AA_537 5-2）。
     30 分鐘內回任何一個選項＝XC_NIGHT +1（PHONE.ON_ANSWER）；沒回不扣分。快轉停在這一則（不是 quiet）。線關上（G7 兩次沒答應、3-3 沒接）以後不傳。
     心願 mention（AA_537b 8-2）：大三上起、交往前第 4 階以上的第一則，那一週用 mention 代替（不佔順序）。 */
  const B_=(t,o)=>({t:o[0],r:o[1]});
  S.NIGHT_A=[
    {k:'A1',m:['你還沒睡吧。','我把民法的筆記重抄了一次。第一次抄的，字太醜。'],o:[['多醜？','醜到我自己看不懂。'],['妳的字已經很工整了。','那是你沒看過第一版。'],['快睡。','抄完這頁。']]},
    {k:'A2',m:['我在看劇。女主角一直在等一個人回訊息。','……我覺得她應該先睡。'],o:[['那妳呢？','我在看劇，不算等。'],['哪一部？','說了你也不會看。……好啦，我傳給你。'],['她會等到嗎？','還剩四集。我等一下告訴你。']]},
    {k:'A3',m:['今天財管的小考，最後一題我算了三次才對起來。','對起來的時候，我在考場笑出來。'],o:[['監考沒看到吧？','看到了。他也笑了。'],['妳真的很喜歡數字。','嗯。數字不會繞路。'],['恭喜。','謝謝。……還沒改。可是我知道對了。']]},   /* AA_548 第 5 節 */
    {k:'A4',m:['我媽問我寒假要不要去事務所幫忙對帳。','我說好。……我好像是全家唯一喜歡對帳的人。'],o:[['妳爸媽呢？','他們喜歡吵架。法庭上的那種。'],['那很好啊。','嗯。我也覺得。'],['對帳有什麼好玩？','對起來的那一下。你沒試過。']]},
    {k:'A5',m:['最後一班公車，我跑到站牌，車剛好開走。','……結果下一班才是最後一班。'],o:[['所以有趕上？','有。我白跑了。'],['妳也會用跑的？','會。很少。'],['到家說一聲。','到了。……你怎麼還沒睡。']]},
    {k:'A6',m:['你還沒睡吧。','我發現我的筆記，有一半是寫給別人看的。'],o:[['寫給誰？','不知道。寫給想像中會來借的人。'],['那另一半？','另一半是寫給以後的我。她比較好說話。'],['我就是來借的那個。','嗯。你是真的那個。']]},
    {k:'A7',m:['我在看第八集。','男主角說：「我不是不想選，是每一個都想要。」','……我把它暫停了。我也是這樣。'],o:[['妳想要什麼？','財金跟法律。兩個都要。'],['繼續看啊。','等一下。我想一下再看。'],['這句很好。','這句很爛。可是很準。']]},
    {k:'A8',m:['今天在總圖，以安坐我斜對面。','她讀到一半，把她的條文筆記推過來。我把我的表推過去。……兩個小時，都沒說話，一直在換。'],o:[['妳們很有默契。','嗯。我們很會讀書。'],['她的筆記好嗎？','好。很細。我抄了三頁。'],['下次叫我。','好。你帶你的經原筆記。']]} ];
  S.NIGHT_B=[
    {k:'B1',m:['你還沒睡吧。','以安傳了一張照片給我。開學第一天，我們坐第一排，兩個人都在抄課表。'],o:[['好懷念？','嗯。那天她的螢光筆借我。'],['誰拍的？','阿哲。他坐我們後面。'],['傳給我看。','不要。']]},
    {k:'B2',m:['我今天沒有排讀書，去西門町看了一部電影。七點那一場。','一個人。'],o:[['好看嗎？','普通。可是我坐到字幕跑完。'],['下次叫我。','……我會考慮。'],['一個人也很好。','嗯。我也這麼覺得。只是說出來有點奇怪。']]},
    {k:'B3',m:['財金那邊，我這學期多修了一門投資學。','我媽說我瘋了。可是她說的時候在笑。'],o:[['妳撐得住嗎？','撐得住。我排好了。'],['為什麼要多修？','因為我想。'],['妳媽說得對。','……你跟她一國。']]},   /* AA_548：不再看「改輔系」*/
    {k:'B4',m:['你還沒睡吧。','我在算一題，算了三次，三次答案都不一樣。','我決定去睡。'],o:[['明天再算。','好。明天的我比較聰明。'],['哪一題？','說了你也睡不著。晚安。'],['第四次會對。','你根本不知道。……好，第四次。']]},
    {k:'B5',m:['巷口那家今天換了新菜。','我點了。……還可以。'],o:[['是什麼？','三杯杏鮑菇。下次你點。'],['下次也換。','不一定。今天只是剛好。'],['好吃嗎？','還可以。……還可以的意思是好吃。']]},
    {k:'B6',m:['你還沒睡吧。','我把明天要穿的衣服排好了。排了三套。'],o:[['明天有什麼事？','沒有。這就是問題。'],['選中間那套。','你又沒看到。……好，中間那套。'],['快睡。','三套都很好。好，睡。']]},
    {k:'B7',m:['期末考完，我想去一個沒有排的地方。','還沒想到是哪裡。'],o:[['陽明山？','可以考慮。……你看，我又在排了。'],['到時候再說。','嗯。到時候再說。這句話我很少說。'],['我想到再跟妳說。','好。我等。']]},
    {k:'B8',m:['今天以安問我，大四要不要一起讀書。','我說好。我們連螢光筆的顏色都講好了。'],o:[['那很好。','嗯。很好。'],['什麼顏色？','她黃色，我藍色。……不要問為什麼。'],['我也可以一起嗎？','你要先問以安。……我說好。']]} ];   /* AA_548：慈 5 以後就可以（原本要慈 6）*/
  S.NIGHT_L=['我在看劇。你要不要也打開，我們一起按播放。','今天的筆記我多寫了一頁。不是給你的。好吧，有一段是。','我發現我現在吃飯不太提前約了。你有發現嗎。','你睡了嗎。沒睡的話，回我一個字就好。',
    '今天以安問我最近怎麼樣。我說很好。我說的是真的。','巷口家常菜的老闆娘問你是誰。我說是常客。','我把週三下午寫成『空白』。你看到不要改。','晚安。這是今天第二次說。'];   /* AA_537 5-2：交往以後，她 00:30 以後才傳，句子完整（msg3d.js ROMANTIC 另外加）*/
  S.MENTION={k:'wish',m:['我想看一次午夜場。一個人去好像有點怪。'],o:[['我陪妳。','……你說的喔。'],['哪一部？','不知道。午夜場放什麼，我就看什麼。'],['（不回）',null]]};
  S.WAKE='你應該睡了吧。';   /* G5 那一列：大二下第 6 週還不到 2 次＝00:45 這一則（不用回）*/
  const xc6=G=>done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video');
  S.nightStart=G=>done(G,'ev_xinci_second')||done(G,'ev_xinci_second_b1')||done(G,'ev_xinci_second_day')||!!F(G).XC_CALL1;
  /* 線關上：G7 兩次都沒答應、3-3 沒接（AA_548：舊的「G6 沒和好就關」拿掉——她們沒有吵過，慈 5 沒演到另外補一次）*/
  S.closed=function(G){ const f=F(G); if(f.XC_CALL1_MISS!=null) return true;
    if(f.XC_G7_1&&f.XC_G7_1!=='go'&&f.XC_G7_2&&f.XC_G7_2!=='go'&&!f.XC_SAMEDAY) return true;
    if(sent(G,'xc_g7_2')&&!f.XC_SAMEDAY){ const d2=f.XC_G7_DAY2; if(d2!=null&&eDay(G)>d2+1) return true; }
    return false; };
  S.weekOf=d=>{ const wd=CALENDAR.dateOf(d).wd%7; return d-((wd+6)%7); };   /* 那一週的週一 */
  S.nightSlot=function(d){ const mon=S.weekOf(d), wk=Math.round(mon/7), wd=(wk%2===0)?3:0, day=wd===3?mon+2:mon+6, h=0.5+((mon*7+3)%5)*0.25; return {mon,day,h}; };   /* 一週週三、一週週日；00:30～01:30 */
  const rec=G=>{ const f=F(G); return f.XCN&&typeof f.XCN==='object'?f.XCN:(f.XCN={a:0,b:0,l:0}); };
  S.nightPick=function(G){ const f=F(G), R=rec(G);
    if(f['dating_'+XC]===true) return {k:'L'+((R.l|0)%S.NIGHT_L.length+1),m:[S.NIGHT_L[(R.l|0)%S.NIGHT_L.length]],o:null,L:true};
    if(!S.CFG_MENTION_DONE(G)&&y(G)>=3&&typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(XC)>=4) return Object.assign({mention:true},S.MENTION);
    const B=!!f.XC5_RECONCILE, list=B?S.NIGHT_B:S.NIGHT_A, key=B?'b':'a';
    for(let i=0;i<list.length;i++){ const x=list[((R[key]|0)+i)%list.length]; if(x.after6&&!xc6(G)) continue; if(x.noAfter6&&xc6(G)) continue; return Object.assign({adv:i+1,key},x); }
    return null; };
  S.CFG_MENTION_DONE=G=>sent(G,'xcn_wish')||(typeof DATE!=='undefined'&&DATE.log&&!!DATE.log(G,XC).wishKnown);
  const y=G=>{ const v=year(G); return v==null?0:v; };
  const year=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(eDay(G)):null; const m=t&&/^Y(\d)/.exec(t.id); if(m) return +m[1]; const t2=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(eDay(G)+40)||CALENDAR.termOf(eDay(G)-40):null, m2=t2&&/^Y(\d)/.exec(t2.id); return m2?+m2[1]:null; };   /* 寒暑假算下一學期（往前後找）*/
  S.night=function(G){ const f=F(G); if(!law(G)||!hasP()||!contact(G)||!S.nightStart(G)||S.closed(G)) return; if(typeof STORY!=='undefined'&&STORY.mainDay&&eDay(G)>(TD('Y4S2',16,7)||1e9)) return;
    const sl=S.nightSlot(eDay(G)); if(eDay(G)!==sl.day||!(now(G)>=T(sl.day,sl.h)&&now(G)<T(sl.day,sl.h)+1)) return; const tag='xcn_'+sl.mon; if(sent(G,tag)||f.XCN_WISH_WK===sl.mon) return;
    const st=f.XCN_START!=null?f.XCN_START:(f.XCN_START=eDay(G)); if(eDay(G)<=st) return;   /* 慈 3 那一晚以後才開始 */
    const x=S.nightPick(G); if(!x) return; const R=rec(G), tg=x.mention?'xcn_wish':tag;
    const M=x.m.map(P);
    if(x.o){ M[M.length-1].ask={id:x.mention?'xcn_wish':tag,until:T(sl.day,8),opts:x.o.map(([t,r])=>r==null?{t,post:false,noCount:true}:{t,say:[{from:XC,text:r}]})}; }
    if(!x.mention){ const prev=(G.msgs||[]).filter(m=>m.ask&&/^xcn_\d/.test(m.ask.id)).pop(); if(prev&&prev.ans==null) f.XCN_MISS=(f.XCN_MISS|0)+1; }   /* 8-3：上一則沒回＝連續沒回 +1 */
    PHONE.at(G,sl.day,sl.h,M,tg); if(x.mention){ if(typeof DATE!=='undefined'&&DATE.knowWish) DATE.knowWish(G,XC); f.XCN_WISH_WK=sl.mon; }   /* 那一週用 mention 代替（不佔順序）*/
    else if(x.L) R.l=(R.l|0)+1; else R[x.key]=(R[x.key]|0)+x.adv; };
  /* 大二下第 6 週還不到 2 次：週三 00:45「你應該睡了吧。」（不用回） */
  S.wake=function(G){ const f=F(G), d=TD('Y2S2',6,3); if(!law(G)||!hasP()||!contact(G)||!S.nightStart(G)||S.closed(G)||!due(G,d,0.75,1)||sent(G,'xcn_wake')||(f.XC_NIGHT|0)>=2) return; PHONE.at(G,d,0.75,[P(S.WAKE)],'xcn_wake'); };
  /* 30 分鐘內回＝XC_NIGHT +1 */
  S.onAnswer=function(G,m,o){ if(m&&m.ask&&m.ask.id==='xc_blank_again'){ try{ S.onBlank(G,m,o); }catch(e){ console.warn('XCROM.onBlank',e); } return; }
    if(!m||!m.ask||!/^xcn_/.test(m.ask.id)||!o||o.noCount) return; const sentAt=T(m.day,m.h), at=now(G); F(G).XCN_MISS=0; if(at-sentAt<=0.5+1e-6){ const f=F(G); f.XC_NIGHT=(f.XC_NIGHT|0)+1; } };
  S.phone=function(G){ if(!S.ON) return; for(const f of [S.g3Remind,S.blankAgain,S.g7,S.call1,S.night,S.wake,S.anKnows,S.repairExpire,S.cold]){ try{ f(G); }catch(e){ console.warn('XCROM.phone',e); } } };
  S.EVENTS=[S.EV_G2,S.EV_G6,S.EV_SAMEDAY,S.EV_CALL1];
  /* ---------- 心願那一場：午夜場（AA_537b 8-2，企劃線 86659bbc1；DATE_WISH 的格式，同沛珊 D06）----------
     mention 不放在這裡（在半夜訊息，S.MENTION）：見面時不說。herInvite：交往前第 5 階以上＋XC_BLANK、兩個人都單身（交往中可以），一學期一次，週五 00:40 傳、約週六 22:30 出發（23:30 開演；DATE.MIDNIGHT）。
     互動點只有 D04 的大廳、小吃（分鐘數、費用照 D04 一般約會），電影在互動點之後（fixedAfter）。演完記 XC_MIDNIGHT_DAY（隔天睡到十點）*/
  const ME=t=>({who:XC,text:t}), NR=t=>({who:'narr',text:t});
  const OTHERS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'].map(id=>'dating_'+id);
  S.WISH_EV={ id:'wish_'+XC, loc:'D04', title:'午夜場', source:'AA_537b 8-2', char:XC,
    wish:'她每個禮拜六晚上都在西門町看七點那一場，一個人。她想看一次午夜場，可是一個人去，散場以後沒有捷運，她會覺得怪。',
    rule:'慈 6 以後（XC_BLANK，G8）才約；兩個人都單身才約（她只接受一對一）；交往以後也可以去，算心願完成。',
    record:{flag:'WISH_DONE_'+XC,memory:{tag:'XC_MIDNIGHT',text:'西門町的午夜場，散場以後沒有捷運'},album:'午夜場的票根兩張，日期印的是星期日（過了十二點）'},
    herInvite:{if:{dateStage:{min:5},flags:['XC_BLANK'],notFlags:OTHERS},rule:'AA_537b 8-2',perTerm:1,message:{weekday:[5],time:[40/60,50/60]},dateWeekday:[6],dateTime:22.5,
      lines:[ME('明天晚上，西門町的午夜場。'),ME('……我提前一天問了。你可以說不。')],accept:[ME('好。我買票。你不要遲到，午夜場不等人。')],decline:[ME('好。那我自己去。……不對，我不會自己去。')]},
    playerInvite:{known:[ME('午夜場？……你記得。'),ME('好。散場以後沒有捷運，你要想好怎麼回去。')],unknown:[ME('西門町，晚上那一場？……你怎麼知道我想去。'),ME('好。')]},
    arrive:{narr:'十一點半的西門町。店都還亮著，街上的人比白天少一半。',lines:[ME('我每個禮拜六都來這裡看電影。……都是晚上七點那一場。'),ME('午夜場，第一次。')]},
    hotspots:{
      'D04.lobby':{name:'電影院大廳（選午夜場的片）',minutes:20,cost:0,like:'like',lines:[ME('午夜場只有兩部。一部恐怖片，一部我沒聽過。')],
        choices:[{t:'「看恐怖片。」',reply:[ME('好。……我先說，我會閉眼睛。')]},{t:'「看沒聽過的那部。」',reply:[ME('好。不知道結局的比較好看。……我以前不會這樣說。')]},{t:'「妳選。」',reply:[ME('我選了，你會不會覺得無聊。……算了，我選。')]}]},
      'D04.snack':{name:'開演前的小吃攤（先買宵夜）',minutes:20,cost:80,like:'like',lines:[ME('散場是兩點。那時候什麼都關了。'),ME('所以要先吃。這是計畫。')],
        choices:[{t:'「妳連這個都排了。」',reply:[ME('……嗯。可是只排到這裡。後面沒有排。')]},{t:'「我請。」',reply:[ME('好。下次換我。……我會記得是哪一次。')]}]} },
    fixedAfter:{lines:[]},
    closing:{title:'午夜場',lines:[NR('（午夜場散場，捷運已經沒了。你們走到西門站外面等計程車。）'),ME('電影普通。'),ME('……可是我會記得。')],
      choices:[{t:'「我也是。」',reply:[ME('嗯。')]},{t:'「下次再來。」',reply:[ME('好。下次不是午夜場也可以。')]},{t:'（陪她等車）',reply:[NR('（計程車來了。她上車以前，回頭看了你一眼。）')]}]} };
  S.wireWish=function(){   /* 記憶 XC_MIDNIGHT 的名稱在 social3d.js MEMORY_LABEL */
    if(typeof WISH!=='undefined'&&WISH.record&&!WISH.record._xc){ const r0=WISH.record; WISH.record=Object.assign(function(G,t,ev){ const r=r0.apply(this,arguments); try{ if(t&&t.who===XC&&G&&G.flags) G.flags.XC_MIDNIGHT_DAY=G.day;   /* 這一個照 G.day（還沒睡＝還是前一天）：story3d.js S.lateWake 睡覺時用 G.day 比 */ }catch(e){} return r; },{_xc:true}); } };
  /* ===================== 交往以後（AA_548 第 7 節＋AA_537 5-3）=====================
     ①你自己先說＝接受：和她說話的選單多「（自己跟她講<她>的事）」，當場說（STORY.TALK_OPTS）；記 XC_TOLD、ROM.tellBy（之後她知道、算你說的）
     ②她自己發現、你沒說過（ROM 記她知道、來源不是你）＝下次走到她旁邊演分手兩句、ROM.end（XC_FOUND＝第幾次、那一天）；挽回（一次，AA_537 5-5）的觸發 AA 還沒給，先不做
     ③以安知道（5-3）：交往後第一週，以安有聯絡方式、沒在和祐廷交往＝一則私訊 */
  const dating=G=>F(G)['dating_'+XC]===true;
  const nm=id=>typeof SOCIAL!=='undefined'?(SOCIAL.npcName?SOCIAL.npcName(id):(SOCIAL.displayName?SOCIAL.displayName(id):id)):id;   /* 真名（同 multirel3d.js）：交往中的人一定認識 */
  S.TELL_AFTER=['我要知道是誰。……知道了，我才排得出來。','你跟她約的那幾天，先告訴我。我排別的。'];
  S.FOUND=['我沒有問你，是因為我以為你會說。','……我們到這裡就好。'];
  S.AN_KNOWS=['芯慈跟我說了。她自己來跟我說的。','我很高興。是真的。'];
  S.tellAfterOpt=p=>'（自己跟她講'+((typeof MREL!=='undefined'&&MREL.BASE&&MREL.BASE[p])||nm(p))+'的事）';   /* 名字同 multirel3d.js 的「（下次見面，自己跟她講…的事）」（MREL.BASE：以安、芷若…）*/
  S.talkOpts=function(G,id){ if(!S.ON||id!==XC||!dating(G)) return []; const h=S.hidden(G).filter(p=>!S.foundOut(G).includes(p)); if(!h.length) return [];
    return [{t:S.tellAfterOpt(h[0]),priv:true,privKey:'xc_tell',run:async GM=>{ for(const t of S.TELL_AFTER) await GM.say({charId:XC,name:nm(XC)},t); S.tell(GM.G); }}]; };
  S.foundDue=G=>S.ON&&law(G)&&dating(G)&&S.foundOut(G).length>0;
  S.EV_FOUND={ id:'ev_xc_found', title:'', participants:[XC], location:'any', trigger:'auto', once:false, near:{npc:XC,r:3}, background:'blur',
    prereq:{custom:G=>S.foundDue(G)},
    dialogue:[ {speaker:XC,text:S.FOUND[0]},{speaker:XC,text:S.FOUND[1]} ],
    after:G=>{ const f=F(G); if(typeof ROM!=='undefined'&&ROM.end) ROM.end(G,XC,'found'); else f['dating_'+XC]=false; f.XC_FOUND={n:((f.XC_FOUND&&f.XC_FOUND.n)|0)+1,day:eDay(G)}; } };
  S.EVENTS.push(S.EV_FOUND);
  S.startDay=G=>{ const f=F(G), c=f.confessed&&f.confessed[XC]; if(c!=null) return c; if(dating(G)&&f.XC_DATING_DAY==null) f.XC_DATING_DAY=eDay(G); return f.XC_DATING_DAY; };
  S.anKnows=function(G){ if(!law(G)||!dating(G)||sent(G,'xc_an_knows')||F(G)['dating_'+AN]===true) return; const d0=S.startDay(G); if(d0==null||eDay(G)<d0+1||eDay(G)>d0+7) return;
    if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,AN)) return; if(eH(G)<21) return;
    PHONE.at(G,eDay(G),eH(G),S.AN_KNOWS.map(t=>({th:'p:'+AN,from:AN,text:t})),'xc_an_knows'); };
  /* ===================== AA_548 第 8 節：她爸爸（8-1）、挽回（8-2）、冷落（8-3）===================== */
  const DKx=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const wd=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:-1;
  /* 8-1 她爸爸（取代 AA_537 5-4「誰最強」）：大四下 2029-04 的週五 17:30～18:00，法律系館A門口（同 ev_xc_dad 那一台車），交往中才演；演過一次就不再 */
  S.APR29=G=>{ const a=DKx('2029-04-01'), b=DKx('2029-04-30'); return a!=null&&b!=null&&eDay(G)>=a&&eDay(G)<=b; };
  S.EV_DAD2={ id:'ev_xc_dad2', title:'銀色的車', participants:[XC], location:'campus', trigger:'auto', once:true, time:[17.5,18], background:'blur', near:{x:34,z:-109,r:7},
    prereq:{custom:G=>S.ON&&law(G)&&dating(G)&&S.APR29(G)&&wd(eDay(G))===5&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))},
    dialogue:[ {speaker:'xinci_dad',name:'芯慈的爸爸',text:'這是上次那位同學？'},{speaker:XC,text:'嗯。……現在不只是同學了。'},
      {speaker:'xinci_dad',name:'芯慈的爸爸',text:'（笑）我知道。妳媽說了。'},{speaker:'xinci_dad',name:'芯慈的爸爸',text:'她說畢業要去國際所。我們很放心。……你呢？'},
      {choice:[{text:'「還在準備國考。」',goto:'a'},{text:'「還在想。」',goto:'b'},{text:'「她去哪，我都會在台北。」',goto:'c'}]},
      {label:'a'},{speaker:'xinci_dad',name:'芯慈的爸爸',text:'好。考完來事務所坐坐，我請你喝咖啡。'},{goto:'end'},
      {label:'b'},{speaker:'xinci_dad',name:'芯慈的爸爸',text:'還在想很好。我大四也還在想。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'（芯慈看了你一眼，耳朵有點紅。）'},{speaker:'xinci_dad',name:'芯慈的爸爸',text:'……好。'},
      {label:'end'},{speaker:XC,text:'……走吧。他等一下會問你喜歡吃什麼。我會說。'} ] };
  S.EVENTS.push(S.EV_DAD2);
  /* 8-2 挽回（一次）：她自己發現而分手（XC_FOUND n＝1）以後，你先和另一位結束、單身滿 30 天、畢業典禮（2029-06-02）以前 → 和她說話的選單多一個；
     之後 60 天內正式約會 3 次＋半夜訊息 30 分鐘內回 2 次 → 第三次約會結束時回到交往（ROM.start）；60 天沒滿＝當朋友，不能再挽回 */
  S.REPAIR_OPT='（跟她說，你已經結束了那一段）';
  S.REPAIR_OPEN=['……我知道。以安說了。','我需要時間。我會自己決定要多久。'];
  S.REPAIR_YES=['我排好了。','……這次，你什麼都先告訴我。'];
  S.REPAIR_NO='我想好了。我們當朋友就好。';
  S.lastEndOther=G=>{ const R=(F(G).romance)||{}; let d=null; for(const id in R){ if(id===XC) continue; for(const h of (R[id].history||[])) if(h.ev==='end'&&h.day!=null&&(d==null||h.day>d)) d=h.day; } return d; };
  S.repairDue=function(G){ const f=F(G), fo=f.XC_FOUND; if(!S.ON||!law(G)||!fo||fo.n!==1||f.XC_REPAIR||dating(G)||S.othersDating(G).length) return false;
    const e=S.lastEndOther(G), grad=DKx('2029-06-02'); return e!=null&&eDay(G)>=e+30&&(grad==null||eDay(G)<grad); };
  S.repairOpts=function(G,id){ if(id!==XC||!S.repairDue(G)) return [];
    return [{t:S.REPAIR_OPT,priv:true,privKey:'xc_repair',run:async GM=>{ const G2=GM.G; for(const t of S.REPAIR_OPEN) await GM.say({charId:XC,name:nm(XC)},t);
      F(G2).XC_REPAIR={state:'wait',day:G2.day,d0:typeof DATE!=='undefined'&&DATE.log?(DATE.log(G2,XC).count|0):0,n0:F(G2).XC_NIGHT|0}; }}]; };
  S.repairProgress=G=>{ const r=F(G).XC_REPAIR; if(!r) return null; return {dates:(typeof DATE!=='undefined'&&DATE.log?(DATE.log(G,XC).count|0):0)-r.d0,nights:(F(G).XC_NIGHT|0)-r.n0}; };
  /* 第三次約會結束時（DATE.settle／settleOvernight 之後：一般、快速、心願、兩天一夜都經過；這一次已經算進 count，BB-B 10-31：原本接在 closeLine，快速約會和心願場不經過）*/
  S.repairClose=async function(GM,t,res){ const G=GM.G, r=F(G).XC_REPAIR; if(!r||r.state!=='wait'||!t||t.who!==XC||eDay(G)>r.day+60) return; if(res&&res.counted===false) return; const p=S.repairProgress(G); if(p.dates<3||p.nights<2) return;
    for(const x of S.REPAIR_YES) await GM.say({charId:XC,name:nm(XC)},x); r.state='done'; r.doneDay=eDay(G); if(typeof ROM!=='undefined'&&ROM.start) ROM.start(G,XC); else F(G)['dating_'+XC]=true; };
  S.repairExpire=function(G){ const r=F(G).XC_REPAIR; if(!r||r.state!=='wait'||eDay(G)<r.day+60||eH(G)<21||sent(G,'xc_repair_no')) return; r.state='friend'; PHONE.at(G,eDay(G),eH(G),[P(S.REPAIR_NO)],'xc_repair_no'); };
  /* 8-3 冷落：交往中連續 28 天沒有正式約會、或她的半夜訊息連續 5 則沒回；一學期最多一次；00:40 一則（不用回），不會因為冷落分手 */
  S.COLD='你最近很忙。我不是在怪你，我只是先說出來，免得我自己亂想。';
  S.cold=function(G){ const f=F(G); if(!law(G)||!dating(G)||!contact(G)) return; const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(eDay(G)):null, tk=t?t.id:'x';
    if((f.XC_COLD||{})[tk]!=null) return; const h=eH(G); if(!(h>=40/60&&h<1.5)) return;
    const L=typeof DATE!=='undefined'&&DATE.log?DATE.log(G,XC):{}, lastDate=L.last&&L.last.day!=null?L.last.day:null, d0=Math.max(S.startDay(G)||0,lastDate||0);
    if(!(eDay(G)-d0>=28||(f.XCN_MISS|0)>=5)) return; (f.XC_COLD||(f.XC_COLD={}))[tk]=eDay(G); f.XCN_MISS=0; PHONE.at(G,eDay(G),h,[P(S.COLD)],'xc_cold_'+tk); };
  /* ---------- 接線（載入時一次）---------- */
  /* 打開／關掉整條線：DATE.HEROINES、事件、心願事件一起加或拿掉 */
  S.setOn=function(v){ S.ON=!!v;
    if(typeof DATE!=='undefined'&&Array.isArray(DATE.HEROINES)){ const i=DATE.HEROINES.indexOf(XC); if(S.ON&&i<0) DATE.HEROINES.push(XC); if(!S.ON&&i>=0) DATE.HEROINES.splice(i,1); }
    if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS){ const k=STORY_EVENTS.findIndex(x=>x.id===e.id); if(S.ON&&k<0) STORY_EVENTS.push(e); if(!S.ON&&k>=0) STORY_EVENTS.splice(k,1); }
    if(typeof DATE_WISH!=='undefined'&&DATE_WISH.events){ if(S.ON) DATE_WISH.events[XC]=S.WISH_EV; else if(DATE_WISH.events[XC]===S.WISH_EV) delete DATE_WISH.events[XC]; }
    return S.ON; };
  S.wire=function(){ if(S._wired) return; S._wired=true;
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k));
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id));   /* 交往以後自己跟她講（AA_548 第 7 節）*/
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)) STORY.TALK_OPTS.push((G,id)=>S.repairOpts(G,id));   /* 8-2 挽回 */
    if(typeof DATE!=='undefined') for(const k of ['settle','settleOvernight']){ const c0=DATE[k]; if(!c0||c0._xc) continue; DATE[k]=Object.assign(async function(GM,t){ const r=await c0.apply(this,arguments); try{ if(S.ON) await S.repairClose(GM,t,r); }catch(e){ console.warn('XCROM.repairClose',e); } return r; },{_xc:true}); }   /* 8-2 第三次約會結束時 */
    S.wireWish(); S.wireSched(); S.setOn(S.ON); };
  /* AA_548 新加的兩個地方要有人在（只在線打開、條件成立時；放在最前面＝蓋過同時段的一般作息）：3-1 巷口家常菜、G6 補一次的總圖三樓 */
  S.SCHED=[
    [XC,{days:[1,2,3,4,5],from:18,to:19.5,zone:'l118_home',act:'eat',terms:['Y2S1'],weeks:[3],noHoliday:true,if:{custom:G=>S.ON&&!S.g2Done(G)},label:'在巷口家常菜吃飯',note:'AA_548 3-1：G2 補問'}],
    [XC,{days:[1,2,3],from:18,to:21,zone:'library',act:'read',terms:['Y3S2'],weeks:[3],if:{custom:G=>S.ON&&!F(G).XC5_RECONCILE},note:'AA_548 第 2 節：G6 補一次（和以安對民訴考古題）'}],
    [AN,{days:[1,2,3],from:18,to:21,zone:'library',act:'read',terms:['Y3S2'],weeks:[3],if:{custom:G=>S.ON&&!F(G).XC5_RECONCILE},note:'AA_548 第 2 節：G6 補一次（和芯慈對民訴考古題）'}],
    [XC,{days:[5],from:17.5,to:18,zone:'campus',act:'linger',at:[35,-108.4,0],terms:['Y4S2'],label:'在法律系館A門口',if:{custom:G=>S.ON&&dating(G)&&S.APR29(G)&&!done(G,'ev_xc_dad2')},note:'AA_548 8-1：她爸爸來接（2029-04 的週五）'}] ];
  S.wireSched=function(){ if(typeof CHARACTERS==='undefined') return; for(const [id,e] of S.SCHED){ const c=CHARACTERS[id]; if(!c) continue; c.daily_schedule=c.daily_schedule||[]; if(!c.daily_schedule.includes(e)) c.daily_schedule.unshift(e); } };
  S.wire();
  return S;
})();
