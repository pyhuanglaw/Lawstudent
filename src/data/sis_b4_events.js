/* ===== 學姊第四批：直屬學姊替你看路、交往中的節日、重新開始（AA_386，企劃線 e848154a；AA 2026-10-22 定稿；任務 AA386-SIS-BATCH4-1022；使用者 10-21 22:5x「學姊才是真正的女主角」）=====
   台詞照 AA_386 一字不改（SISB4_LINES、SISB4_EVENTS）。說話前接演、手機、出遊、重新開始的條件在 src/sis_b4_3d.js。
   第 1 節（說話前接演；熟悉以上；一般、交往中都演）：1-1 ev_sis_adv_grad（大一下第 6～12 週）　1-2 ev_sis_adv_exch（大二上第 12～15 週）
     1-3 ev_sis_adv_pick（2027-11-13～11-17；交往中＝「飛機畫一架就好」那一版）　1-4 ev_sis_adv_y4（大三下第 10～14 週；日本路線不演）
   第 3 節（只有交往中；她自己約；劇情出遊，不算正式校外約會）：3-1 ev_sis_xmas_y2（2026-12-24 22:00 兩點半 Café 門口）　3-2 ev_sis_xmas_y3（2027-12-24 21:00 研究室）
     3-4 ev_sis_vday_y2（2027-02-14 14:00 臺北植物園）　3-5 ev_sis_vday_y3（2028-02-14 10:00 公館捷運站 → 公車上 → 終點站）　3-6 ev_sis_vday_y4（2029-02-14 22:30 電話）
     （3-3 在 src/data/termend_lines.js 學姊交往版大四上那一桌。）
   第 4 節 4-1 ev_sis_three_conditions（說話前接演；分開過的玩家）；4-2 答應的台詞在 src/data/confess_lines.js。
   第 2 節（AA_379 2-6 一般版那一句）在 src/data/sis_y2y3_events.js。
   測試：node tests/aa386_sis_batch4_unit.js */
'use strict';
const SISB4_LINES={
  /* 3-1 聖誕夜・Café 門口：12/23（三）21:00 私訊；沒來＝12/24 22:20 */
  x2Ask:['明天晚上十點，Café 門口。','十五分鐘就好。'], x2Yes:'好。', x2NoT:'明天晚上不行。', x2No:'好。',
  x2Missed:['📷（Café 門口，兩個紙杯）','熱水我喝完了。兩杯。'],
  /* 3-2 聖誕夜・研究室的小樹：12/24（五）20:30 私訊；沒來＝21:30 */
  x3Ask:['九點，研究室。','……今天只有我。'], x3Yes:'好。', x3NoT:'今天晚上不行。', x3No:'好。',
  x3Missed:['📷（研究室門口的桌上，一棵很小的聖誕樹）','學妹的。我幫她顧。'],
  /* 3-3 備援（企劃線 d0468be4）：那一頓往後讓、不在 12/24 吃的，2028-12-24（日）21:00 她私訊（交往中、3-2 有來）；最後一句美國路線換 x3bUs */
  x3b:['今天是二十四號。','去年在研究室說的。……剛回來一天。'], x3bMe:'我做到了。', x3bUs:'我們做到了。',
  /* 3-4 情人節・植物園：2027-02-13（六）21:00 私訊；沒來＝2/14 17:00 */
  v2Ask:['明天下午兩點，植物園門口。','我想走一走。不讀書的那種。'], v2Yes:'好。', v2NoT:'明天不行。', v2No:'好。我自己去。',
  v2Missed:['📷（荷花池，只有水）','走完了。荷花池，下次再看。'],
  /* AA_392 第 6 節（企劃線 e81a1afe1）：荷花池（2027 夏天）——交往中、大二寒假情人節植物園約過的（來了或沒來都算）*/
  lotusAsk:['荷花開了。','週六早上九點，植物園。早上開得比較好。'], lotusYes:'好。', lotusNoT:'那天不行。', lotusNo:'好。我拍給你看。', lotusMissed:['📷（荷花池，開了幾朵）'],
  /* 3-5 情人節・她寒假那一天的假：2028-02-13（日）21:00 私訊；沒來＝2/14 15:00 */
  v3Ask:['明天是我寒假那一天的假。','早上十點，公館捷運站二號出口。其他的沒排。'], v3Yes:'好。', v3NoT:'明天不行。', v3No:'好。那一格先空著。',
  v3Missed:['📷（一碗湯圓）','坐到終點站了。有湯圓。'],
  /* 3-6 情人節・陽台的電話：2029-02-14（三）22:30；沒接＝22:40 */
  v4Missed:['情人節快樂。','我在陽台吹風。……你早點睡。'] };
const SISB4_EVENTS=(function(){
  const ID='heroine_05';
  const romR=G=>((G&&G.flags&&G.flags.romance)||{})[ID]||null;
  const dating=G=>{ const F=(G&&G.flags)||{}, R=romR(G); return F['dating_'+ID]===true||!!(R&&R.status==='dating'); };
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const dt={custom:G=>dating(G)}, SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const X=()=>typeof SISB4!=='undefined'?SISB4:null;
  const mem=(tag,rel)=>Object.assign({mem:[{npc:ID,tag,note:''}]},rel?{rel:{[ID]:rel}}:{});
  /* 第 3 節的好感（AA_126 7-2）：聖誕單獨見面 熟悉 +4、自在 +4、她的戀愛 +4；情人節（交往中）+3／+6／+5、這學期的裂縫 -1（after）；電話那一場 +2／+3／+3 */
  const XMAS={fam:4,comf:4,npcRom:4}, VDAY={fam:3,comf:6,npcRom:5}, CALL={fam:2,comf:3,npcRom:3};
  const crack=G=>{ const x=X(); if(x&&x.crackDown) x.crackDown(G); };
  /* ---------- 1-1 「研究所會等你」（大一下第 6～12 週）---------- */
  const GRAD=[ {unless:dt,speaker:'player',text:'學姊是什麼時候開始準備研究所的？'}, {if:dt,speaker:'player',text:'妳是什麼時候開始準備研究所的？'},
    SIS('大三。'),
    SIS('……現在想起來，太早了。大三那一年，我的計畫本上沒有一格是空的。'),
    SIS('重點是，先把大學念完。研究所會等你。'),
    {choice:[{text:'「那學姊後悔嗎？」',unless:dt,goto:'gr_a'},{text:'「妳後悔嗎？」',if:dt,goto:'gr_a'},{text:'「我還沒想那麼遠。」',goto:'gr_b'}]},
    {label:'gr_a'},SIS('不後悔。'),SIS('……可是如果重來，我會留幾格空的。'),{goto:'gr_c'},
    {label:'gr_b'},SIS('嗯。這樣很好。'),SIS('想好了再來問我。'),
    {label:'gr_c'},{if:dt,speaker:null,text:'（她翻開計畫本給你看。這個禮拜六那一格，只寫了你的名字。）'},{if:dt,speaker:ID,text:'以前這一格，我會排滿。'},
    mem('SIS_ADV_GRAD',{fam:2,trust:1}) ];
  /* ---------- 1-2 「晚半年會怎樣？」（大二上第 12～15 週；她碩一）---------- */
  const EXCH=[ N('（你的包包裡露出一張傳單：「交換學生甄選說明會」。她看到了。）'),
    {unless:dt,speaker:'player',text:'學姊大學有去交換嗎？'}, {if:dt,speaker:'player',text:'妳大學有去交換嗎？'},
    SIS('沒有。我算過，會晚半年。'),
    SIS('晚半年畢業，晚半年考研究所。後面每一件事，都晚半年。'),
    SIS('……現在想想，晚半年會怎樣？'),
    N('（她問完，自己也沒有回答。）'),
    {choice:[{text:'「好像也不會怎樣。」',set:{SIS_ADV_EXCH:'same'},goto:'ex_a'},{text:'「學姊現在還可以去啊。」',unless:dt,set:{SIS_ADV_EXCH:'go'},goto:'ex_b'},{text:'「妳現在還可以去啊。」',if:dt,set:{SIS_ADV_EXCH:'go'},goto:'ex_b'}]},
    {label:'ex_a'},SIS('嗯。'),SIS('……我那時候覺得，會怎樣。'),{goto:'ex_c'},
    {label:'ex_b'},SIS('研究生也可以申請。……我查過。'),SIS('只是查過。'),
    {label:'ex_c'},SIS('傳單收好。大三上就要填志願了。'),
    mem('SIS_ADV_EXCH',{fam:2,trust:1}) ];
  /* ---------- 1-3 志願表（AA_398 第 23～25 列：不數件數）（2027-11-13～11-17；交往中＝11/18 那一刻會走美國，這場只是把那張志願表演出來）---------- */
  const PICK=[ {if:dt,goto:'pk_d'},
    SIS('志願表，寫了嗎？'),
    ME('還沒。禮拜四中午截止。'),
    SIS('選你想學的地方。'),
    SIS('……選了，就不要一直回頭看。'),
    {choice:[{text:'「學姊自己呢？做到了嗎？」',goto:'pk_a'},{text:'「如果我選了留在臺灣呢？」',goto:'pk_b'}]},
    {label:'pk_a'},SIS('前面那句做到了。'),SIS('後面那句，我還在練。'),{goto:'pk_end'},
    {label:'pk_b'},SIS('那也是選。'),SIS('……一樣，不要回頭看。'),{goto:'pk_end'},
    {label:'pk_d'},SIS('志願表，寫了嗎？'),
    N('（你把手機上的志願表給她看。第一志願，是她要去的那間學校。）'),
    SIS('……嗯。'),
    SIS('那計畫本上，飛機畫一架就好。'),
    {choice:[{text:'「本來要畫幾架？」',goto:'pk_c'},{text:'「妳沒有要交代我什麼？」',goto:'pk_e'}]},
    {label:'pk_c'},SIS('兩架。你的，我的。'),SIS('……我畫飛機很醜。一架就夠了。'),{goto:'pk_end'},
    {label:'pk_e'},SIS('本來有。……選你想學的，選了不要回頭看。'),SIS('可是你已經選了。不用說。'),
    {label:'pk_end'},mem('SIS_ADV_PICK',{fam:2,trust:2}) ];
  /* ---------- 1-4 「你的大四，你自己排」（大三下第 10～14 週；她碩二）：選項只是聊，不記路線 ---------- */
  const Y4=[ SIS('你大四要做什麼，想了嗎？'),
    {choice:[{text:'「還在想。」',goto:'y4_a'},{text:'「大概知道。」',goto:'y4_b'}]},
    {label:'y4_a'},SIS('還在想，也是一種排法。'),{goto:'y4_c'},
    {label:'y4_b'},SIS('嗯。不用跟我說。先跟自己說。'),
    {label:'y4_c'},SIS('你的大四，你自己排。我只幫你看。'),
    SIS('排之前先睡飽。排好的，一個禮拜看一次就好。'),
    SIS('……不要讓別人替你寫。'),
    N('（她說這句的時候，看的是自己的計畫本。）'),   /* AA_398 第 26 列 */
    {if:{custom:G=>dating(G)&&route(G)==='US'},speaker:ID,text:'到了那邊，拿給我看。'},
    {if:{custom:G=>dating(G)&&route(G)!=='US'},speaker:ID,text:'八月以後，拍照傳給我。我在那邊也看得到。'},   /* 臺灣路線（日本路線這時在日本，不演）*/
    mem('SIS_ADV_Y4',{fam:2,trust:1}) ];
  /* ---------- 4-1 她要的時間（AA_398 第 45、46 列；原「她的三件事」，事件 id 不改）（BB_122 9-2）：記 SIS_REBUILD（那天）；不改關係數值 ---------- */
  const caught=G=>{ const R=romR(G); return !!R&&R.status==='friend_after_catch'; };
  const THREE=[
    {if:{custom:G=>caught(G)},speaker:ID,text:'我不要再從別人那裡聽到你的事。'},   /* 被發現退回朋友的 */
    {unless:{custom:G=>caught(G)},speaker:ID,text:'有事先跟我說。不要讓我自己猜。'},   /* 其他分開的 */
    SIS('還有，我要時間。等到我說好的那天。'),   /* AA_512 6-3（企劃線 c444f0757）：禁用句型（口氣表 0-3「不是X，是Y」）改字；原「還有，我要時間。不是一週，是我說好的那天。」；記憶面板「她說：等她說好的那天」不用改 */
    SIS('……其他的，我還沒想好。想好了告訴你。'),
    {choice:[{text:'「好。」',goto:'tc_a'},{text:'「我等妳。」',goto:'tc_b'}]},
    {label:'tc_a'},SIS('嗯。'),{goto:'tc_end'},
    {label:'tc_b'},SIS('……不要說得那麼好聽。等就是了。'),
    {label:'tc_end'},Object.assign({stamp:['SIS_REBUILD']},mem('SIS_REBUILD')) ];
  return [
    /* ---------- 3-1 2026-12-24（四）22:00 兩點半 Café 門口（Café 門口的夜景沒有底圖：深色底＋地點字幕）---------- */
    { id:'ev_sis_xmas_y2', title:'聖誕夜', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'兩點半 Café 門口',bg:'dark'},
        N('（Café 的燈一盞一盞關掉。她站在門口，手上拿著兩個紙杯。）'),
        SIS('熱水。加了一點蜂蜜。'),
        SIS('……今天聖誕節，算特別的。'),
        {if:{custom:G=>typeof FAMXMAS!=='undefined'&&FAMXMAS.gave(G)},goto:'x_first'},   /* AA_406 第 4 節：大一家族聖誕送過她禮物的——她先拿紙袋出來，再收你的螢光筆 */
        N('（你把準備好的禮物給她。一盒綠色螢光筆。）'),
        SIS('……你怎麼知道我的用完了。'),
        N('（她把螢光筆收進大衣口袋，沒有放進包包。然後拿出一個紙袋。）'),
        SIS('明年的計畫本。第一頁我寫了。回去再看。'),{goto:'x_ch'},
        {label:'x_first'},N('（她拿出一個紙袋。）'),SIS('去年是你先送。今年換我先拿出來。'),SIS('明年的計畫本。第一頁我寫了。回去再看。'),
        N('（你把準備好的禮物給她。一盒綠色螢光筆。）'),SIS('……你怎麼知道我的用完了。'),N('（她把螢光筆收進大衣口袋，沒有放進包包。）'),
        {label:'x_ch'},
        {choice:[{text:'（現在打開）',goto:'x_open'},{text:'（收好，回去再看）',goto:'x_keep'}]},
        {label:'x_open'},N('（第一頁只有一行：「1/1　早上不要排事情。睡飽。」）'),SIS('……我說回去再看。'),SIS('十五分鐘到了。'),N('（她說十五分鐘到了，可是沒有走。）'),{goto:'x_end'},
        {label:'x_keep'},SIS('嗯。'),SIS('十五分鐘到了。'),N('（她說十五分鐘到了，可是沒有走。）'),N('（回到宿舍，你打開第一頁。只有一行：「1/1　早上不要排事情。睡飽。」）'),   /* 選了「收好」的，最後多一句旁白 */
        {label:'x_end'},Object.assign({set:{SIS_XMAS_Y2:'there'}},mem('SIS_XMAS_Y2',XMAS)) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'xmas_y2'); } },
    /* ---------- 3-2 2027-12-24（五）21:00 霖澤館・研究室（同 ev_sis_plan_lab：研究室的走廊底圖＋字幕）---------- */
    { id:'ev_sis_xmas_y3', title:'聖誕夜', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'霖澤館・研究室',bg:'linze_prof_hall'},
        N('（研究室只剩她一個人。門口她那張桌上，放著一棵手掌大的聖誕樹，燈一閃一閃。）'),
        SIS('隔壁的學妹放的。她回家了，叫我幫她顧。'),
        SIS('……樹要怎麼顧。'),
        {choice:[{text:'（把大燈關掉，只留樹的燈）',goto:'t_a'},{text:'（坐在她旁邊，看她寫論文）',goto:'t_b'}]},
        {label:'t_a'},SIS('這樣看不到字。'),SIS('……好。五分鐘。'),{goto:'t_c'},
        {label:'t_b'},N('（她寫了三行，刪了兩行。）'),SIS('你在旁邊，我刪得比較快。'),
        {label:'t_c'},{if:{flagIs:{SIS_XMAS_Y2:'there'}},speaker:ID,text:'去年是 Café 門口。今年是研究室。'},   /* 去年 3-1 有來的 */
        {unless:{custom:G=>route(G)==='US'},speaker:ID,text:'如果三月的信是好消息，明年的今天，我剛回來一天。'},
        {if:{custom:G=>route(G)==='US'},speaker:ID,text:'……明年的今天，我們剛回來一天。'},   /* 美國路線 */
        SIS('十二月二十三號的飛機。……我先查好了。'),
        N('（你要走的時候，她沒有關那棵樹的燈。）'),
        Object.assign({set:{SIS_XMAS_Y3:'there'}},mem('SIS_XMAS_Y3',XMAS)) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'xmas_y3'); } },
    /* ---------- 3-4 2027-02-14（日）14:00 臺北植物園（大二寒假；植物園沒有底圖：深色底＋地點字幕）---------- */
    { id:'ev_sis_vday_y2', title:'情人節', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
      dialogue:[ {scene:'臺北植物園',bg:'dark'},
        N('（植物園分成很多區，每一區門口都有一塊說明牌。她每一塊都停下來讀，大概一分鐘。）'),
        SIS('一區一分鐘。'),
        SIS('……這樣才走得完。'),
        {choice:[{text:'（在一棵樹下面停了很久）',goto:'v_a'},{text:'「妳最喜歡哪一區？」',goto:'v_b'}]},
        {label:'v_a'},N('（她走到下一區，又走回來，站在你旁邊。）'),SIS('……超過一分鐘了。'),SIS('沒關係。今天不算時間。'),{goto:'v_c'},
        {label:'v_b'},SIS('荷花池。'),SIS('二月沒有荷花，只有水。'),SIS('……我喜歡看什麼都還沒長出來的時候。'),
        {label:'v_c'},N('（出來的時候天已經暗了。她在計畫本二月十四號那一格寫了「植物園」，後面又加了三個字：「兩個人」。）'),
        Object.assign({set:{SIS_VDAY_Y2:'went'}},mem('SIS_VDAY_Y2',VDAY)) ],
      after:G=>crack(G),
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'vday_y2'); } },
    /* ---------- AA_392 第 6 節：2027-07-03（六）09:00 植物園・荷花池（沒有底圖：botanical_lotus 先顯示暗底，BB 跟使用者要圖）---------- */
    { id:'ev_sis_lotus', title:'荷花池', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'植物園・荷花池',bg:'botanical_lotus'},
        N('（整片都是葉子，花不多，開了幾朵。）'),
        SIS('二月的時候，這裡只有水。'),
        {choice:[{text:'「妳說妳喜歡什麼都還沒長出來的時候。」',if:{flagIs:{SIS_VDAY_Y2:'went'}},goto:'l_a'},{text:'「上次我沒來。」',unless:{flagIs:{SIS_VDAY_Y2:'went'}},goto:'l_b'},{text:'（拍一張）',goto:'l_c'}]},
        {label:'l_a'},SIS('嗯。'),N('（她看了一下）'),SIS('長出來也不錯。'),{goto:'l_end'},
        {label:'l_b'},SIS('所以這次是補的。……你遲到四個月。'),{goto:'l_end'},
        {label:'l_c'},SIS('我也拍了。我們拍的是同一朵。'),
        {label:'l_end'},{set:{SIS_LOTUS:'went'},consequences:{rel:{[ID]:{fam:2,comf:3,npcRom:2}}}} ],   /* 熟悉 +2、自在 +3、她的戀愛 +2 */
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'lotus'); } },
    /* ---------- 3-5 2028-02-14（一）10:00 公館捷運站 → 公車上 → 終點站；時間推到 15:00 左右 ---------- */
    { id:'ev_sis_vday_y3', title:'情人節', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:5,
      dialogue:[ {scene:'公館捷運站',bg:'gongguan'},
        N('（她站在出口，手上沒有計畫本。）'),
        SIS('今天沒帶。放在家裡了。'),
        SIS('第一班來的公車，我們就上去。坐到最後一站。'),
        {scene:'公車上',bg:'dark'},
        N('（她一開始看著窗外，小聲念站名。念到第七站，就不念了。）'),
        {choice:[{text:'（拿出手機查終點站）',goto:'b_a'},{text:'（陪她看窗外）',goto:'b_b'}]},
        {label:'b_a'},SIS('不要查。'),SIS('……今天不要查。'),{goto:'b_c'},
        {label:'b_b'},N('（過了一個隧道，她的頭靠在你肩膀上。）'),
        {label:'b_c'},{scene:'終點站',bg:'country_road'},
        N('（終點站在山腳下。站牌旁邊有一家賣湯圓的小店，只有兩張桌子。）'),
        SIS('……情人節吃湯圓。'),
        SIS('我記一下。明年不要再這樣排。'),
        N('（她說不要再這樣排，可是一直在笑。）'),
        SIS('回去以後，那一格，我要畫一個勾。'),
        Object.assign({set:{SIS_VDAY_Y3:'went'}},mem('SIS_VDAY_Y3',VDAY)) ],
      after:G=>crack(G),
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'vday_y3'); } },
    /* ---------- 3-6 2029-02-14（三）22:30 她打來（大年初二；電話場景）---------- */
    { id:'ev_sis_vday_y4', title:'情人節', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
      dialogue:[ {scene:'電話'},
        SIS('我爸剛去睡。我在陽台。'),
        SIS('……情人節快樂。'),
        {if:{flagIs:{SIS_VDAY_Y3:'went'}},speaker:ID,text:'去年那家湯圓，我前幾天又想到。'},   /* 3-5 有去的多兩句 */
        {if:{flagIs:{SIS_VDAY_Y3:'went'}},speaker:ID,text:'……想不起來那一站叫什麼。'},
        SIS('今年的二月十四號，我什麼都沒排。'),
        SIS('……過年，一直在吃。'),
        {choice:[{text:'「開學以後，我們再補一天。」',set:{SIS_VDAY_MAKEUP:true},goto:'p_a',aa523:true},{text:'（陪她在電話裡待著）',goto:'p_b'}]},   /* AA_523 5-3（企劃線 0d7b5388b）：選「再補一天」記 SIS_VDAY_MAKEUP＝4/27 21:00 她放假那則換成她寫好的那一天（src/sis_b16_3d.js S.dayOffMakeup）*/
        {label:'p_a'},SIS('嗯。……那一天我來寫。'),{goto:'p_c'},
        {label:'p_b'},N('（她沒有掛。你聽著她那邊的風聲，和客廳沒關的電視。過了五分鐘，她才說：）'),SIS('好。我進去了。'),
        {label:'p_c'},Object.assign({set:{SIS_VDAY_Y4:'call'}},mem('SIS_VDAY_Y4',CALL)) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'vday_y4'); } },
    /* ---------- 說話前接演的五段（src/sis_b4_3d.js 的 preTalk 用 EVENTS.runLines 演；這幾筆只放台詞，不會自己觸發）---------- */
    { id:'ev_sis_adv_grad', title:'研究所會等你', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:GRAD },
    { id:'ev_sis_adv_exch', title:'晚半年會怎樣？', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:EXCH },
    { id:'ev_sis_adv_pick', title:'志願表', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:PICK },
    { id:'ev_sis_adv_y4', title:'你的大四，你自己排', participants:[ID], location:'any', trigger:'manual', once:true, dialogue:Y4 },
    { id:'ev_sis_three_conditions', title:'她要的時間', participants:[ID], location:'any', trigger:'manual', dialogue:THREE } ];   /* 這一次分開演一次（再分開一次＝再演一次，sis_b4_3d.js rebuildDue；BB_122 9-5 她永遠保留攻略可能）*/
})();
for(const e of SISB4_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
