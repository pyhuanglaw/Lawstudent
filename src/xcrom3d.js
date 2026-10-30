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
  /* 第 2 節：和以安分開以後（G10），之前已經過了 G3、G4 的玩家，當晚 01:10 她多一則（意思留給玩家去想；這條線就不開了）。G10 的開關關掉＝不傳 */
  S.AN_BREAK=['今天的劇很難看。','我看完了。'];
  S.anBreak=function(G){ const f=F(G); if(!law(G)||!S.CFG.noAnEx||!f['EX_'+AN]||sent(G,'xc_an_break')||!contact(G)) return;
    const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,AN):null, H0=R&&Array.isArray(R.history)?R.history.filter(h=>h&&h.ev==='end'):[], e=H0[H0.length-1]; if(!e||e.day==null) return;
    const g=S.gates(G); if(!g.G3||!g.G4) return; const d=e.day+1, h=1+10/60; if(now(G)<T(d,h)-24||now(G)>T(d,h)+48) return;
    PHONE.at(G,d,h,S.AN_BREAK.map(P),'xc_an_break'); };
  /* ---------- G5 半夜訊息（AA_537 第 1 節「G5 的訊息從哪裡來」、AA_537b 第 9 節 8acf3b308）----------
     慈 3（或 3-3 電話）以後每週一則：週三或週日（一週週三、一週週日輪流）00:30～01:30；照順序輪、用完從頭（八則一輪＝同一則八週內不重複）。
     A＝慈 5 以前、B＝慈 5（和以安和好）以後；B3 慈 6 以後不傳（她改輔系了）、B8 要慈 6 以後。交往以後換 L 層（AA_537 5-2）。
     30 分鐘內回任何一個選項＝XC_NIGHT +1（PHONE.ON_ANSWER）；沒回不扣分。快轉停在這一則（不是 quiet）。線關上（G6 沒過、G7 兩次沒答應、3-3 沒接）以後不傳。
     心願 mention（AA_537b 8-2）：大三上起、交往前第 4 階以上的第一則，那一週用 mention 代替（不佔順序）。 */
  const B_=(t,o)=>({t:o[0],r:o[1]});
  S.NIGHT_A=[
    {k:'A1',m:['你還沒睡吧。','我把民法的筆記重抄了一次。第一次抄的，字太醜。'],o:[['多醜？','醜到我自己看不懂。'],['妳的字已經很工整了。','那是你沒看過第一版。'],['快睡。','抄完這頁。']]},
    {k:'A2',m:['我在看劇。女主角一直在等一個人回訊息。','……我覺得她應該先睡。'],o:[['那妳呢？','我在看劇，不算等。'],['哪一部？','說了你也不會看。……好啦，我傳給你。'],['她會等到嗎？','還剩四集。我等一下告訴你。']]},
    {k:'A3',m:['今天經濟學的小考，我第二名。','不用安慰我。我只是說出來。'],o:[['第二名很好啊。','大家都這樣說。'],['第一名是誰？','不是以安。她沒修這堂。……我為什麼要講這個。'],['嗯。','……謝謝。這樣剛好。']]},
    {k:'A4',m:['我爸又問我，寒假要不要去事務所。','我說要考慮。這是我第一次跟他說要考慮。'],o:[['那妳想去嗎？','不知道。這是第一次不知道。'],['考慮很好啊。','嗯。他聽起來不覺得好。'],['去看看也沒關係。','你講得好像很簡單。……可能真的很簡單。']]},
    {k:'A5',m:['最後一班捷運，我跑到月台，門剛好關上。','……結果下一班才是最後一班。'],o:[['所以有趕上？','有。我白跑了。'],['妳也會用跑的？','會。很少。'],['到家說一聲。','到了。……你怎麼還沒睡。']]},
    {k:'A6',m:['你還沒睡吧。','我發現我的筆記，有一半是寫給別人看的。'],o:[['寫給誰？','不知道。寫給想像中會來借的人。'],['那另一半？','另一半是寫給以後的我。她比較好說話。'],['我就是來借的那個。','嗯。你是真的那個。']]},
    {k:'A7',m:['我在看第八集。','男主角說：「我沒有在比，是你一直在比。」','……我把它暫停了。'],o:[['妳在比嗎？','……晚安。'],['繼續看啊。','等一下。我想一下再看。'],['這句很好。','這句很爛。可是很準。']]},
    {k:'A8',m:['今天在總圖，以安坐我斜對面。','我們都沒抬頭。……兩個小時。'],o:[['妳們都在讀書。','嗯。我們很會讀書。'],['要不要跟她說話？','說什麼。'],['誰贏了？','沒有比。……好，有一點。']]} ];
  S.NIGHT_B=[
    {k:'B1',m:['你還沒睡吧。','以安今天傳了一張補習班的舊照片給我。我們兩個站最旁邊。'],o:[['好懷念？','好醜。兩個都是。'],['妳們現在好多了。','嗯。好一點了。'],['傳給我看。','不要。']]},
    {k:'B2',m:['我今天沒有排讀書，去西門町看了一部電影。七點那一場。','一個人。'],o:[['好看嗎？','普通。可是我坐到字幕跑完。'],['下次叫我。','……我會考慮。'],['一個人也很好。','嗯。我也這麼覺得。只是說出來有點奇怪。']]},
    {k:'B3',noAfter6:true,m:['經濟系那邊的課，我這學期少修了一門。','我爸還不知道。'],o:[['什麼時候要說？','等我想好怎麼說。可能要很久。'],['妳想好了嗎？','想好了。只是還沒說。'],['這是妳的事。','嗯。……謝謝你這樣說。']]},
    {k:'B4',m:['你還沒睡吧。','我在算一題，算了三次，三次答案都不一樣。','我決定去睡。'],o:[['明天再算。','好。明天的我比較聰明。'],['哪一題？','說了你也睡不著。晚安。'],['第四次會對。','你根本不知道。……好，第四次。']]},
    {k:'B5',m:['巷口那家今天換了新菜。','我點了。……還可以。'],o:[['是什麼？','三杯杏鮑菇。下次你點。'],['下次也換。','不一定。今天只是剛好。'],['好吃嗎？','還可以。……還可以的意思是好吃。']]},
    {k:'B6',m:['你還沒睡吧。','我把明天要穿的衣服排好了。排了三套。'],o:[['明天有什麼事？','沒有。這就是問題。'],['選中間那套。','你又沒看到。……好，中間那套。'],['快睡。','三套都很好。好，睡。']]},
    {k:'B7',m:['期末考完，我想去一個沒有排的地方。','還沒想到是哪裡。'],o:[['陽明山？','可以考慮。……你看，我又在排了。'],['到時候再說。','嗯。到時候再說。這句話我很少說。'],['我想到再跟妳說。','好。我等。']]},
    {k:'B8',after6:true,m:['今天以安問我，大四要不要一起讀書。','我說好。說完才發現，我沒有想第二名的事。'],o:[['那很好。','嗯。很好。'],['妳們會一起考第一。','……那是什麼意思。好，我懂。'],['我也可以一起嗎？','你要先問以安。……我說好。']]} ];
  S.NIGHT_L=['我在看劇。你要不要也打開，我們一起按播放。','今天的筆記我多寫了一頁。不是給你的。好吧，有一段是。','我發現我現在吃飯不太提前約了。你有發現嗎。','你睡了嗎。沒睡的話，回我一個字就好。',
    '今天以安問我最近怎麼樣。我說很好。我說的是真的。','巷口家常菜的老闆娘問你是誰。我說是常客。','我把週三下午寫成『空白』。你看到不要改。','晚安。這是今天第二次說。'];   /* AA_537 5-2：交往以後，她 00:30 以後才傳，句子完整（msg3d.js ROMANTIC 另外加）*/
  S.MENTION={k:'wish',m:['我想看一次午夜場。一個人去好像有點怪。'],o:[['我陪妳。','……你說的喔。'],['哪一部？','不知道。午夜場放什麼，我就看什麼。'],['（不回）',null]]};
  S.WAKE='你應該睡了吧。';   /* G5 那一列：大二下第 6 週還不到 2 次＝00:45 這一則（不用回）*/
  const xc6=G=>done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video');
  S.nightStart=G=>done(G,'ev_xinci_second')||done(G,'ev_xinci_second_b1')||done(G,'ev_xinci_second_day')||!!F(G).XC_CALL1;
  /* 線關上：G6 沒過（慈 5 那一週過了還沒和好）、G7 兩次都沒答應、3-3 沒接 */
  S.closed=function(G){ const f=F(G); if(f.XC_CALL1_MISS!=null) return true;
    if(!f.XC5_RECONCILE){ const d=TD('Y3S1',14,1); if(d!=null&&G.day>=d) return true; }
    if(f.XC_G7_1&&f.XC_G7_1!=='go'&&f.XC_G7_2&&f.XC_G7_2!=='go'&&!f.XC_SAMEDAY) return true;
    if(sent(G,'xc_g7_2')&&!f.XC_SAMEDAY){ const d2=f.XC_G7_DAY2; if(d2!=null&&G.day>d2+1) return true; }
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
  const year=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; const m=t&&/^Y(\d)/.exec(t.id); if(m) return +m[1]; const t2=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day+40)||CALENDAR.termOf(G.day-40):null, m2=t2&&/^Y(\d)/.exec(t2.id); return m2?+m2[1]:null; };   /* 寒暑假算下一學期（往前後找）*/
  S.night=function(G){ const f=F(G); if(!law(G)||!hasP()||!contact(G)||!S.nightStart(G)||S.closed(G)) return; if(typeof STORY!=='undefined'&&STORY.mainDay&&G.day>(TD('Y4S2',16,7)||1e9)) return;
    const sl=S.nightSlot(G.day); if(G.day!==sl.day||!(now(G)>=T(sl.day,sl.h)&&now(G)<T(sl.day,sl.h)+1)) return; const tag='xcn_'+sl.mon; if(sent(G,tag)||f.XCN_WISH_WK===sl.mon) return;
    const st=f.XCN_START!=null?f.XCN_START:(f.XCN_START=G.day); if(G.day<=st) return;   /* 慈 3 那一晚以後才開始 */
    const x=S.nightPick(G); if(!x) return; const R=rec(G), tg=x.mention?'xcn_wish':tag;
    const M=x.m.map(P);
    if(x.o){ M[M.length-1].ask={id:x.mention?'xcn_wish':tag,until:T(sl.day,8),opts:x.o.map(([t,r])=>r==null?{t,post:false,noCount:true}:{t,say:[{from:XC,text:r}]})}; }
    PHONE.at(G,sl.day,sl.h,M,tg); if(x.mention){ if(typeof DATE!=='undefined'&&DATE.knowWish) DATE.knowWish(G,XC); f.XCN_WISH_WK=sl.mon; }   /* 那一週用 mention 代替（不佔順序）*/
    else if(x.L) R.l=(R.l|0)+1; else R[x.key]=(R[x.key]|0)+x.adv; };
  /* 大二下第 6 週還不到 2 次：週三 00:45「你應該睡了吧。」（不用回） */
  S.wake=function(G){ const f=F(G), d=TD('Y2S2',6,3); if(!law(G)||!hasP()||!contact(G)||!S.nightStart(G)||S.closed(G)||!due(G,d,0.75,1)||sent(G,'xcn_wake')||(f.XC_NIGHT|0)>=2) return; PHONE.at(G,d,0.75,[P(S.WAKE)],'xcn_wake'); };
  /* 30 分鐘內回＝XC_NIGHT +1 */
  S.onAnswer=function(G,m,o){ if(!m||!m.ask||!/^xcn_/.test(m.ask.id)||!o||o.noCount) return; const sentAt=T(m.day,m.h), at=now(G); if(at-sentAt<=0.5+1e-6){ const f=F(G); f.XC_NIGHT=(f.XC_NIGHT|0)+1; } };
  S.phone=function(G){ for(const f of [S.g3Remind,S.blankAgain,S.g7,S.call1,S.anBreak,S.night,S.wake]){ try{ f(G); }catch(e){ console.warn('XCROM.phone',e); } } };
  S.EVENTS=[S.EV_G2,S.EV_SAMEDAY,S.EV_CALL1];
  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){ if(S._wired) return; S._wired=true;
    if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); };
  S.wire();
  return S;
})();
