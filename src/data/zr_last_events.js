/* ===== 芷若：出國前的最後一場（2028-08-26）——台詞與事件（AA_387 定稿，企劃線 608b9adc；AA 2026-10-22 回 LAWWW；任務 BB119-Y4-1017、USER_WANTS D53）=====
   台詞照 AA_387 一字不改（D100、D109；白名單 docs/handoff/story_import_allow.json）。條件、手機、出遊、結果、房間物件在 src/zr_last3d.js（ZRLAST）。
   第 2 節：8/24（四）21:00 她私訊（ZRLAST_LINES.ask）、兩個回覆；第 3、4 節：8/26（六）19:30 公館二輪戲院（ev_zhiruo_last_screening，出遊 2.5 小時）；
   第 5 節：當晚 23:00 兩版、交往的 9/1（五）21:00；第 6 節：房間物件「她的票根」；第 7 節：說好了沒到（19:45、22:00）。
   方奕廷那一段（第 8 節）的拒絕版在 src/data/r2y3b_events.js 的 ev_zhiruo_f3_cafe、判斷在 src/zrzq3d.js 的 S.f3Sync。
   測試：node tests/aa387_zr_last_unit.js */
'use strict';
const ZRLAST_LINES={
  /* 第 2 節：8/24（四）21:00 她私訊；回覆按鈕（祐廷的字）和她回的那一句；回覆到 8/25（五）18:00，沒回＝18:00 傳「不行」那一句 */
  ask:['週六晚上七點半，二輪戲院。我出國前的最後一場。','……票的事你不用管。'],
  yesT:'好。', yes:'嗯。……不要遲到。片頭很短。',
  noT:'那天不行。', no:'好。……那我一個人看完它。',
  /* 第 5 節：8/26 23:00（交往＝wait／先收著＝keep）；交往的多一則 9/1（五）21:00 */
  nightWait:['到家了。','票根不要弄丟。……寄放的，要還。'],
  nightKeep:['到家了。','今天謝謝你。……片子很好看。'],
  fly:['明天早上的飛機。','……到了打給你。一年，從明天開始算。'],
  /* 第 7 節：回「好」但 19:45 還沒到 */
  late:'要開演了。……我先進去。', after:'散場了。票根我先收著。',
  /* 第 6 節：房間物件［名稱, 說明］（宿舍書桌「看看房間裡的東西」）*/
  room:['她的票根','（二輪戲院的票根。《候鳥》，最後一場。背面是她的鉛筆字：「熱可可＋濃縮。」「先寄放在你這裡。」）'],
  /* 第 10 節 A1：先收著的（ZR_LAST keep），她回國以後（2029-09-01 起）在 Café 上班，祐廷第一次走進 Café；條件不到的＝hiNo、no 兩句 */
  again:{n0:'（她在吧檯後面。看到你，停了一下。）',hi:'……好久不見。',ask:'票根，還在嗎？',me:'還在。',take:'寄放的，要拿回來了。……還是，你要一直收著？',keepT:'「我一直收著。」',giveT:'「還給妳。」',
    keepN:'（她做了一杯熱可可，加了一份濃縮，推到你面前。）',keep:'……那這杯，也是你的。',giveN:'（你把票根放在吧檯上。她把它夾進牆上班表的夾板裡。）',give:'……謝謝你幫我收了一年。',hiNo:'好久不見。',no:'……票根，你留著就好。'},
  /* 第 10 節 A4：她因為祐廷拒絕方奕廷（ZR_F3_NO），F3＋2 天 21:00 方奕廷給祐廷兩則（接到他電話的才傳）*/
  fang:['她說不行。','我一個人去看了。……片子很好。'] };
const ZRLAST_EVENTS=(function(){
  const ZR='heroine_02', N=t=>({speaker:null,text:t}), Z=t=>({speaker:ZR,text:t});
  const X=()=>typeof ZRLAST!=='undefined'?ZRLAST:null;
  const ASKED={memory:[{npc:ZR,tag:'ASKED_HER_DRINK'}]};   /* 問過她喝什麼（Z3）*/
  const Y=t=>({speaker:'player',text:t}), A=ZRLAST_LINES.again, OK={custom:G=>{ const x=X(); return !!x&&x.againOk(G); }};   /* 第 10 節 A1：第 1 節第 3、5、6 點照當時算 */
  const ZR_KNOWS={custom:G=>{ const x=X(); return !!x&&!!x.knowsOther&&x.knowsOther(G); }};   /* AA_474 3b：她知道祐廷正在和別人交往（MREL.knownOthers，沒有 OPEN_OK）*/
  return [
    /* ---------- 第 3、4 節：8/26（六）19:30 公館二輪戲院（2D 底圖 gongguan_cinema；散場的騎樓同一張底圖）---------- */
    { id:'ev_zhiruo_last_screening', title:'出國前的最後一場', participants:[ZR], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
        N('（二輪戲院的最後一場。觀眾不到十個人。她坐在第七排靠走道，旁邊的位子放著她的外套。）'),
        Z('（把外套拿起來）……你的。'),
        N('（今天放的是一部很老的片子，《候鳥》。燈暗下來以前，她一直在看手上的兩張票根。）'),
        N('（片子演到最後一段，她小聲說了一句。）'),
        Z('這一段，我看過四次。每次都在這裡哭。'),
        Z('……今天不會。'),
        N('（燈亮的時候，她在擦眼睛。）'),
        Z('……我說了今天不會。'),
        /* 第 4 節：票根 */
        N('（散場了。騎樓下，她把兩張票根分開，一張放進自己的口袋，一張遞給你。）'),
        Z('這張是你的。'),
        N('（票根背面有字。她的字，鉛筆寫的。）'),
        N('熱可可＋濃縮。'),   /* 背面（遊戲疊字；說話人空白）：疊字還沒做，先用一行顯示（同 r2y3b_events.js 手帳上的字）*/
        N('先寄放在你這裡。'),
        Object.assign(N('（是她自己的點法。）'),{if:ASKED}),   /* 問過她喝什麼的 */
        Object.assign(N('（是她的點法。她在吧檯後面做給自己喝的那一杯。）'),{unless:ASKED}),   /* 沒問過的 */
        N('（你抬頭的時候，她看著騎樓外面，沒有看你。）'),
        Z('……一年。'),
        {if:ZR_KNOWS,call:async(G,GM)=>{ const x=X(); if(x) await x.knowBefore(GM); }},   /* AA_474 3b：她知道祐廷正在和別人交往＝「我等妳回來。」之前先演她的知情對話（三問）；交往＝wait、其他＝keep */
        {goto:'wk',if:{custom:G=>(G.flags||{}).ZR_LAST_KNOW==='yes'}},{goto:'k',if:{custom:G=>{ const v=(G.flags||{}).ZR_LAST_KNOW; return !!v&&v!=='yes'; }}},
        {choice:[{text:'「我等妳回來。」',set:{ZR_LAST:'wait'},goto:'w'},{text:'「我先收著。」',set:{ZR_LAST:'keep'},goto:'k'}]},   /* 沒有「還沒」*/
        {label:'wk'},Y('我等妳回來。'),   /* AA_481 3-1：知情對話答應以後，跳 w 以前祐廷自動說一句（不是選項），「一年。……你說的喔。」才接得上 */
        {label:'w'},N('（她轉過來，把口袋裡那一張票根拿出來，和你那張對在一起。）'),Z('一年。……你說的喔。'),{goto:'end'},   /* 交往（她 9/2 出發，直接開始遠距）：ZRLAST.result */
        {label:'k'},Z('好。……那就先收著。'),N('（她笑了一下，把自己那一張放回口袋。）'),   /* 朋友＝學期末心意邀約的「讓我想想」：ZRLAST.result */
        {label:'end'},N('（她往捷運站走。走到路口，回頭揮了一下手。）'),
        {mem:[{npc:ZR,tag:'ZR_LAST_SCREENING',note:''}]} ],
      after:G=>{ const x=X(); if(x) x.result(G); },
      outingMissed:G=>{ const x=X(); if(x) x.missed(G); } },   /* 第 7 節：說好了沒到（不去了、過了 19:45）*/
    /* ---------- 第 10 節 A1：「我先收著」的第二次（2029-09-01 起，她在 Café 上班，祐廷第一次走進 Café；同 ev_zhiruo_back_ex 的做法）---------- */
    { id:'ev_zhiruo_ticket_again', title:'票根', participants:[ZR], location:'cafe', trigger:'enter', once:true, background:'blur',
      prereq:{custom:G=>{ const x=X(); return !!x&&x.againDue(G); }},
      dialogue:[ {goto:'no',unless:OK},
        N(A.n0),Z(A.hi),Z(A.ask),Y(A.me),Z(A.take),
        {choice:[{text:A.keepT,set:{ZR_LAST2:'back'},goto:'k'},{text:A.giveT,set:{ZR_LAST2:'closed'},goto:'g'}]},
        {label:'k'},N(A.keepN),Z(A.keep),{goto:'end'},   /* 交往（ROM.start）：ZRLAST.againResult */
        {label:'g'},N(A.giveN),Z(A.give),{goto:'end'},   /* 朋友，之後照一般規則；房間物件拿掉 */
        {label:'no'},Z(A.hiNo),Z(A.no),{set:{ZR_LAST2:'wait'}},   /* 條件不到（祐廷有交往對象等）：沒有選項，票根留在房間 */
        {label:'end'} ],
      after:G=>{ const x=X(); if(x) x.againResult(G); } } ];
})();
for(const e of ZRLAST_EVENTS){ if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
