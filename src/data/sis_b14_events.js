/* ===== 學姊第十四批：她在美國的五個月（AA_516，企劃線 a9b87c588 → cf7d5fa94 第 7 節 → 3cd10909b 第 8 節 → d6f8621ac 第 8 節第 3 點 → 913802344 第 8 節第 4 點；任務 SIS-B14-1028、SIS-B14-AAFIX-1028、SIS-LEAD-1021、D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109）。接線在 src/sis_b14_3d.js。
   改在現有事件裡的句子寫在各自的檔，那幾行都帶 aa516:true（tests/aa516_sis_b14_unit.js 逐句對稿用；遊戲不讀這個欄位）：
     第 1 節：r2y4b_events.js g6（1-1）、r2y4a3d.js 12/20 戀人版私訊的截圖（1-2，R2Y4A.PICKUP_SHOT）、r2y4b_events.js 大峽谷才交往的第一次視訊開頭（1-3）、
       y34b3d.js 家族群組三句（1-8～1-10）；
     2-2 h1～h9：r2y4b_events.js ev_sis_video_gf；第 3 節 t4～t7：r2y4b_events.js ev_sis_video；
     4-3 初雪那一句：r2y4a_events.js ev_us_first_snow；4-5 離開那天那一句：r2y4a_events.js ev_us_leave；
     第 5 節 9/2 交換生群組：src/data/us_blank_lines.js 的 GRP（照那張表的格式補一列）；
     第 8 節（3cd10909b）：第 1 點那一句旁白（第 3 點 d6f8621ac、第 4 點 913802344 定位置）在 r2y4a_events.js ev_us2_kitchen（三支各一行）和 src/us208_3d.js 3-2 滷肉（兩支選項會合的地方（label e 後面，盛出來吃的時候；第 5 點 ca08e848c））的 BOWL、
       第 2 點 h9 記 SIS14_RIGHT 在 r2y4b_events.js、那一句旁白在 r2y4a_events.js ev_sis_pickup。
   說話的人：她的 id（交往中 SOCIAL.displayName 自己會換成「書瑀」，AA_411 第 2 節）。 */
'use strict';
const SISB14_LINES={
  /* 2-1 8/3（四）22:00 那一通沒接（22:30 還沒接）：22:40 私訊 */
  callMiss:'打了。你在忙。……群組見。',
  /* 2-3 等你考完（有 10/25 那則便條、到那時還沒自己傳訊息給她）：交往中 10/26（四）13:00＝她那邊 01:00；朋友 21:00＝她那邊早上 */
  examGf:['考完了嗎。','……我這邊一點。說好等的。'],
  examGfOpts:[{t:'考完了。',r:'好。……那我去睡了。'},{t:'還不知道考得怎樣。',r:'不知道是對的。……睡了。'}],
  examFriend:['考完了嗎。'],
  examFriendOpts:[{t:'考完了。',r:'嗯。辛苦了。'},{t:'還不知道考得怎樣。',r:'嗯。辛苦了。'}],
  /* 2-5 鍋子那一句的兌現（h5 選「好吃嗎？」）：12/30（六）21:00 私訊，回「好。」才演 */
  curryHome:'明天中午，我家。……鍋子洗好了。', curryHomeGo:'好。',
  /* 4-1 美國路線交往中 9/1（五）21:00（當地）私訊 → 9/2（六）14:00 208 */
  usCurry:['第一週，活下來了。','明天下午，208。我煮咖哩。'],
  usCurryOpts:[{t:'好。',r:'兩點。帶碗，我這邊只有一個。'},{t:'我帶什麼？',r:'碗。我這邊只有一個。'}],
  /* 4-2 SU-L6「明天早上我來煮。」隔天 07:00 沒到：07:15 私訊 */
  eggsMiss:['三顆。吃完了。','……第四顆留給你。'],
  /* 4-3 有 SIS14_COAT 的 12/2 初雪開頭（r2y4a_events.js ev_us_first_snow，這裡只是對照）*/
  snowCoat:'（你穿著那件外套。她也是。）',
  /* 4-5 SU-L8「第四本你幫我拿。」12/16 離開那天開頭（r2y4a_events.js ev_us_leave，這裡只是對照）*/
  leaveBook:'（你的背包裡多了一本她的書。比你自己的三本都重。）',
  /* 1-3 大峽谷才交往的第一次女朋友視訊開頭（r2y4b_events.js，這裡只是對照）*/
  canyonOpen:'峽谷回來以後，第一次這樣打給你。',
  /* 第 8 節第 1 點 有 SIS14_US_CURRY 的，之後第一次有吃東西的 208 場景（第 3、4 點：9/13 US2 三支都有，沒演到＝3-2 滷肉兩支選項會合的地方（label e 後面，盛出來吃的時候；第 5 點 ca08e848c）；4-2 煎蛋不算；r2y4a_events.js、src/us208_3d.js 的 BOWL，這裡只是對照）*/
  bowl:'（她把自己的碗放在你面前，換她用你上次帶來的那一個。）',
  /* 第 8 節第 2 點 h9 選「我會去接妳。」（SIS14_RIGHT）的 12/23 接機戀人版第一句旁白前面（r2y4a_events.js ev_sis_pickup，這裡只是對照）*/
  right:'（你站在出口的右邊。）' };

const SISB14_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB14!=='undefined'?SISB14:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t});
  return [
    /* ---------- 2-1 8/3（四）22:00 那一通電話（臺灣路線、8/2 送機或在機場等她、那時交往中；兌現「到了先在群組說，再打給你。」）---------- */
    { id:'ev_sis14_call0803', title:'到了，打給你', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'電話',bg:'dark'},
        N('（電話接起來，那邊有很大的風聲。）'),
        SIS('……我在宿舍外面。裡面收訊不好。'),
        SIS('到了。說好的，打給你。'),
        SIS('群組那張照片，天空真的那麼大。'),
        {choice:[{text:'「累嗎？」',goto:'a'},{text:'「那邊怎麼樣？」',goto:'b'},{text:'（聽她那邊的風）',goto:'c'}]},
        {label:'a'},SIS('累。……可是睡不著。這邊才早上十點。'),{goto:'e'},
        {label:'b'},SIS('什麼都很大。超市、車、杯子。'),{goto:'e'},
        {label:'c'},N('（你們都沒有說話。風很大。）'),
        {label:'e'},SIS('下週日開始，每個禮拜打。……這是第一通，不算。'),
        {set:{SIS14_CALL0803:true}} ],   /* 通話多久稿沒寫：算 30 分鐘（LAWWW 排）*/
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.callMissed(G); } },   /* 22:30 還沒接：22:40 私訊 */
    /* ---------- 2-5 12/31（日）12:00 她家的咖哩（h5 選「好吃嗎？」、交往中；照 AA_512 13-2 的地點、底圖，只有兩個人；出遊 2 小時）---------- */
    { id:'ev_sis14_curry_home', title:'家裡的鍋子', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'學姊的新家',bg:'sis_new_home'},
        N('（她家的廚房。鍋子是厚的那一個，她一直攪，沒有回頭。）'),
        SIS('家裡的鍋子，不會黏。'),
        SIS('……我在那邊攪了四十分鐘的時候，就在想這一天。'),
        {choice:[{text:'「好吃。」',goto:'a'},{text:'（再一碗）',goto:'b'}]},
        {label:'a'},SIS('嗯。你說的，我比較信。'),{goto:'e'},   /* AA_512 13-2「……你說的，我比較信。」的回聲；沒演過 13-2 的一樣說（稿 2-5）*/
        {label:'b'},SIS('鍋子在那邊。……自己盛。'),
        {label:'e'},{set:{SIS14_CURRY_HOME:true}} ] },
    /* ---------- 4-1 美國路線交往中 9/2（六）14:00 208 的咖哩（開學第一週，出遊 2 小時；2D C 棟 208）---------- */
    { id:'ev_sis14_us_curry', title:'208 的咖哩', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'C 棟 208',bg:'us_shared_kitchen'},
        N('（208 的廚房很小，鍋子是她從臺灣帶來的那一個。）'),
        SIS('行李超重兩公斤，就是它。'),   /* 接 SU-L8「來的時候超重兩公斤，是那個鍋子」：這裡先說，SU-L8 照舊（稿 4-1）*/
        N('（咖哩很好吃。你帶來的碗比她的大。）'),
        SIS('……下次你用我的碗。'),
        {set:{SIS14_US_CURRY:true}} ] },
    /* ---------- 4-2 SU-L6「明天早上我來煮。」→ 隔天 07:00 208 的廚房（遲到 10 分鐘內算到）---------- */
    { id:'ev_sis14_eggs', title:'十八顆蛋', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'C 棟 208',bg:'us_shared_kitchen'},
        N('（七點。蛋盒已經放在流理台上。她坐在高腳椅上，看著你。）'),
        SIS('煮吧。'),
        {choice:[{text:'（煎蛋）',goto:'a'},{text:'（炒蛋）',goto:'b'}]},
        {label:'a'},SIS('……邊邊焦了。我喜歡焦的。'),{goto:'e'},
        {label:'b'},SIS('這是炒蛋，還是蛋花？……好吃。'),
        {label:'e'},N('（十八顆蛋，少了四顆。）'),
        {set:{SIS14_EGGS:true}} ],   /* 早餐多久稿沒寫：算 1 小時（LAWWW 排）*/
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.eggsMissed(G,q); } },   /* 沒到：07:15 私訊 */
    /* ---------- 4-3 SU-L7「好。週六。」→ 那個週六 10:00 草原超市旁邊那家店（2D，出遊 1.5 小時）---------- */
    { id:'ev_sis14_coat', title:'外套', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'草原超市旁邊那家店',bg:'us_coat_shop'},
        N('（外套掛滿一整面牆。）'),
        SIS('這件。……不要，太長。這件。'),
        N('（她挑了三件，你試了三件。最後買的是第一件。）'),
        SIS('第一件。我一開始就知道。'),
        N('（結帳的時候，她手上也多了一件。）'),
        SIS('……我的也舊了。順便。'),   /* AA_516 第 7 節第 1 點（cf7d5fa94）：選「好。週六。」的玩家沒聽過她說「我的也換」 */
        {set:{SIS14_COAT:true}} ] },   /* 外套的錢稿沒寫：不扣（LAWWW 定）*/
    /* ---------- 4-4 第四十天選「我過去。」→ 當晚 22:30（當地）C 棟門口（2D，出遊 0.5 小時，不用移動）---------- */
    { id:'ev_sis14_day40', title:'兩把傘', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'C 棟門口',bg:'us_c_door'},
        N('（你到的時候，她站在 C 棟門口，手上拿著兩把傘。雨不大。）'),
        SIS('……我說帶傘。'),
        N('（你兩手空空。）'),
        SIS('好。這一把給你。'),
        N('（你們站在門口。她看著雨。）'),
        SIS('家裡樓下那家早餐店，下雨的時候，會把桌子收進去一半。'),
        N('（雨停了。她沒有說要進去。又站了一下。）'),
        {set:{SIS14_DAY40_WENT:true}} ] } ];
})();
for(const e of SISB14_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
