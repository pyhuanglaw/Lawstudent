/* ===== 學姊第十五批：學校裡的平常日子（AA_518，企劃線 973dd1b74；任務 SIS-B15-1028、SIS-LEAD-1021、D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109）。接線在 src/sis_b15_3d.js。
   改在現有檔的句子、條件（第 3 節記旗標的三處、第 4 節十五處）寫在各自的檔，那幾行都帶 aa518 或在註解寫「AA_518」（tests/aa518_sis_b15_unit.js 逐句對稿）：
     sis_b8_events.js 11/6 午餐（「都還好。」記 SIS15_ALLOK、交往版「……下次你請。」記 SIS15_YOUPAY）、sis_y2y3_events.js 3/15 電話（「我現在過去。」記 SIS15_LUNCH_GO）、
     termend_lines.js 大二上女朋友版的收尾兩行（3-8）；第 4 節：feed_y2s2.js／feed3d.js（4-1）、privtalk3d.js（4-1）、tools/ladder/import_ladder.py→ladder.js（4-2、4-15）、vac3d.js（4-2）、
     characters.js（4-3、4-9、4-14）、feed_y3s2.js（4-4）、feed_y3s1.js（4-5）、sis_y2y3_events.js（4-6）、termend_lines.js（4-7、4-8、4-10、4-11）、events.js（4-12）、heroine_circle.js（4-13）、closed3d.js（4-14）。
   說話的人：她的 id（交往中 SOCIAL.displayName 自己會換成「書瑀」，AA_411 第 2 節）；家族的學妹＝family_junior「佳穎」（AA_497 第 8 節第 5 點）；Kevin 照 sis_b12／b13 寫 'Kevin'。 */
'use strict';
const SISB15_LINES={
  /* 第 2 節 四次有演出來的：前一天 21:00 家族群組 Kevin 揪（稿沒寫揪的那一句：照 AA_470 12-4 Kevin 那一句「每週四晚上七點 法圖討論室 學姊帶」——子代理解讀，請 AA 定），回「去。」才演；
     沒在家族群組、和她 FAMILIAR 以上的：她私訊「明天讀書會。」（回覆鍵同群組「去。」）*/
  studyAsk:'每週四晚上七點 法圖討論室 學姊帶', studyDm:'明天讀書會。', go:'去。',
  /* 2-3 3/16 九點 家族群組（Kevin）*/
  late:'學姊今天遲到十分鐘 我拍下來了',
  /* 第 3 節第 1 點：6/1（四）21:00 Kevin 揪 → 6/3（六）10:30 霖澤館門口；國考那天 2028-08-26（六）臺灣 08:00 家族群組。k＝Kevin、s＝學姊 */
  gradAsk:'禮拜六畢業典禮 A館門口拍照 家族都來',
  barCheer:[['s','Kevin。'],['s','今天。……集氣。'],['k','學姊！！！！']],
  /* 第 3 節第 3 點：2028-03-15 21:30 家族群組（所有群組成員）*/
  usUp:[['s','美國那邊，上了。'],['s','八月走。'],['k','學姊！！！！！']],
  /* 第 3 節第 5 點：臺灣路線交往中 2028-09-10、11-12（日）20:00 她的私訊多一個選項 */
  photoOpt:'（傳一張照片給她）',
  photos:[{k:'noodle',t:'（麵店的長桌）',r:'阿姨有沒有問我。'},{k:'avenue',t:'（椰影大道）',r:'葉子還是綠的吧。這邊已經黃了。',r11:['葉子還是綠的吧。','這邊已經沒有葉子了。']},{k:'plan',t:'（你的計畫本）',r:'這一頁太滿了。……睡覺那一格呢。'}],   /* r11：11/12 那一次（稿：「這邊已經沒有葉子了。」換掉後半句；兩段照稿的字接起來，子代理解讀）*/
  /* 第 3 節第 9 點：2026-06-19（五）22:00 家族群組 */
  hotpot:['（照片：火鍋店的長桌，學姊坐在最旁邊，碗裡只有青菜）','學姊只吃菜 我們吃了九盤肉'],
  /* 第 3 節第 10 點：臺灣路線交往中 7/26（三）21:10 她私訊 */
  sendoff:'八月二號。七點，我家巷口。', sendoffYes:'好。', sendoffNo:'我那天沒辦法。', sendoffNoRep:'好。……那我自己去。',
  /* 1-9 房間物件（稿只寫了物件；「看」的那一句稿沒寫：用物件括號裡的字，子代理解讀）*/
  books:['學姊的三本書（每一本都畫了線）','（每一本都畫了線）'] };

const SISB15_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB15!=='undefined'?SISB15:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), KEV=t=>({speaker:'Kevin',text:t}), JUN=t=>({speaker:'family_junior',name:'佳穎',text:t});
  const dt={custom:G=>!!X()&&X().dating(G)};   /* A：交往中 */
  const noW1={flags:['SIS_W1']};
  const metEnd={unless:noW1,set:{SIS_W1:true,met_sis:true}};   /* D（沒見過她）來的：這一場就是認識她（FIRST_MET 由 EVENTS.run 記；同 sis_b13 13-2、13-7）*/
  /* 第 1 節：3D 走到她在的地方（位置觸發）；那一天、那個時段、她在那裡、走近她（同一層 r m 內；1-8 要走進討論室）；一次（G.events.done）*/
  const Y1=(o,lines)=>({id:o.id,title:o.title,participants:[ID],location:o.location,trigger:'auto',once:true,time:o.time,near:{npc:ID,r:o.r||3},background:'blur',
    prereq:{custom:(G,GM)=>!!X()&&X().y1Ok(G,o.id,GM)},dialogue:lines});
  /* 第 2 節：四次讀書會（出遊；法圖討論室 19:00～21:00）*/
  const ST=(n,title,lines)=>({ id:'ev_sis15_study_'+n, title, participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[{scene:'法圖・討論室',bg:'law_library'}].concat(lines,[{set:{['SIS15_STUDY_'+n]:true}},metEnd]) });
  return [
    /* ---------- 1-1 筆試前兩週（大一寒假 2026-01-14 週三 14:00～17:00，總圖寒假閱覽區）---------- */
    Y1({id:'ev_sis15_flask',title:'空的保溫瓶',location:'library',time:[14,17]},[
      N('（她坐在靠窗那排，桌上攤著三本書，旁邊一個空的保溫瓶。看到你，她把保溫瓶推過來一點。）'),
      SIS('幫我看一下東西。……我去裝熱水。'),
      N('（她回來的時候，你還坐在旁邊。）'),
      SIS('謝謝。考試前，連裝熱水都要算時間。'),
      {choice:[{text:'「考什麼？」',goto:'a'},{text:'「妳一定可以。」',goto:'b'}]},
      {label:'a'},SIS('研究所。……兩個禮拜以後。'),{goto:'e'},
      {label:'b'},SIS('嗯。……你期末考完了吧。換你讀別的。'),
      {label:'e'} ]),   /* A：不適用（這時還不可能交往）*/
    /* ---------- 1-2 等放榜（大一下第 2 週 2026-03-04 週三 19:00～21:00，法圖）---------- */
    Y1({id:'ev_sis15_novel',title:'等放榜',location:'lawlib',time:[19,21]},[
      N('（她在法圖最裡面那張桌子，讀的是一本小說。書皮包起來了。）'),
      SIS('考完了，不知道要讀什麼。'),
      SIS('……等放榜的時候，讀小說最好。看不出來我在等。'),
      {choice:[{text:'「什麼小說？」',goto:'a'},{text:'「放榜是哪一天？」',goto:'b'}]},
      {label:'a'},SIS('不告訴你。……書皮包著，就是不想讓人知道。'),{goto:'e'},
      {label:'b'},SIS('二十三號。……你不要記。'),
      {label:'e'} ]),
    /* ---------- 1-3 游完泳等開門（大一暑假 2026-08-31 週一 08:45～09:00，總圖門口的台階；characters.js 那一天的作息）---------- */
    Y1({id:'ev_sis15_swim',title:'游完泳等開門',location:'campus',time:[8.75,9],r:4},[
      N('（總圖還沒開門。她坐在門口的台階上，頭髮是濕的，旁邊一個游泳包。）'),
      SIS('游完了，等開門。'),
      Object.assign({if:dt},N('（她把游泳包往旁邊挪，讓你坐）')),Object.assign({if:dt},SIS('坐。還有十分鐘。')),   /* A 多一句（放在第一句後面：稿沒寫位置，子代理解讀）*/
      SIS('下禮拜開始，我就是碩一了。……感覺跟昨天一樣。'),
      {choice:[{text:'「研究所會不一樣嗎？」',goto:'a'},{text:'「妳每天都游？」',goto:'b'}]},
      {label:'a'},SIS('讀的東西一樣。坐的位子會換。'),{goto:'e'},
      {label:'b'},SIS('週一到週四。週五起不來。'),
      {label:'e'} ]),
    /* ---------- 1-4 池上回來（大二寒假 2027-01-27 週三 14:00～17:00，總圖）---------- */
    Y1({id:'ev_sis15_chishang',title:'池上回來',location:'library',time:[14,17]},[
      N('（她的桌上放著一張明信片，背面是一片沒有東西的稻田。）'),
      SIS('池上。……上禮拜去的。'),
      SIS('想看一個什麼都沒有的地方。看完了，回來讀書。'),
      {choice:[{text:'「那邊真的什麼都沒有？」',goto:'a'},{text:'「明信片寫給誰？」',goto:'b'}]},
      {label:'a'},SIS('有風。還有一台腳踏車，是租的。'),{goto:'e'},
      {label:'b'},SIS('寫給我自己。……回來才收到，有點好笑。'),
      {label:'e'},Object.assign({if:dt},SIS('你沒去過吧。')) ]),   /* A 多一句（不約，不留懸著的話）*/
    /* ---------- 1-5 搬家前（大二下第 1 週 2027-02-24 週三 19:00～21:00，法圖）---------- */
    Y1({id:'ev_sis15_move',title:'搬家前',location:'lawlib',time:[19,21]},[
      SIS('下個月搬家。'),
      SIS('……箱子還沒開始裝。書最多。'),
      {choice:[{text:'「我幫妳搬。」',goto:'a'},{text:'「搬去哪？」',goto:'b'}]},
      {label:'a'},SIS('Kevin 說他要來。……他會搬一半，然後坐下來說他累了。'),{goto:'e'},
      {label:'b'},SIS('遠一點的地方。一個人住。'),
      {label:'e'} ]),
    /* ---------- 1-6 第一章（大二暑假 2027-07-07 週三 19:00～21:00，法圖）---------- */
    Y1({id:'ev_sis15_ch1',title:'第一章',location:'lawlib',time:[19,21]},[
      N('（她在印出來的稿子上，用紅筆劃掉一整段。）'),
      SIS('第一章的第一段。……今天又劃掉了。'),
      {choice:[{text:'「哪裡不好？」',goto:'a'},{text:'「先寫後面的？」',goto:'b'}]},
      {label:'a'},SIS('太像在說服自己。……教授說的。他說得對。'),{goto:'e'},
      {label:'b'},SIS('不行。第一段不對，後面都會歪。'),
      {label:'e'} ]),
    /* ---------- 1-7 演習課的題目（大二暑假尾 2027-08-25 週三 19:00～21:00，法圖）---------- */
    Y1({id:'ev_sis15_drill',title:'演習課的題目',location:'lawlib',time:[19,21]},[
      SIS('下學期的演習課，我還在帶。'),
      SIS('學弟妹問的問題，一年比一年難。……我在先想他們會問什麼。'),
      {choice:[{text:'「他們會問什麼？」',goto:'a'},{text:'「妳帶得很好。」',goto:'b'}]},
      {label:'a'},SIS('「這會考嗎？」……這一題我答得最快。'),{goto:'e'},
      {label:'b'},SIS('你沒上過我的課。……好，謝謝。'),
      {label:'e'} ]),
    /* ---------- 1-8 面試前一週（大三寒假 2028-01-19 週三 19:00～21:00，法圖討論室：她一個人；characters.js 那一天在討論室 A）---------- */
    Y1({id:'ev_sis15_interview',title:'面試前一週',location:'lawlib',time:[19,21]},[
      N('（討論室的門沒關好。她一個人，對著窗戶，小聲地用英文講自我介紹。）'),
      N('（她講到一半停下來，看到你。）'),
      SIS('……你聽到了？'),
      {choice:[{text:'「再講一次。」',goto:'a'},{text:'「我聽不太懂。」',goto:'b'}]},
      {label:'a'},N('（她講了一次，這次沒有停。）'),SIS('……好。可以了。'),{goto:'e'},
      {label:'b'},SIS('那就對了。……他們聽得懂就好。'),
      {label:'e'} ]),
    /* ---------- 1-9 清研究室（大三暑假 2028-06-28 週三 19:00～21:00，霖澤館 5F 研究室；那一晚她在研究室，4F 刷卡門晚上開，src/lab5f3d.js）---------- */
    Y1({id:'ev_sis15_lab_clear',title:'清研究室',location:'linze_5f',time:[19,21]},[
      N('（研究室的地上排著四個紙箱。她在把書一本一本放進去。）'),
      SIS('出國前，研究室要清空。……書比我想的多。'),
      {choice:[{text:'「我幫妳。」',goto:'a'},{text:'「這些都要帶去美國？」',goto:'b'}]},
      {label:'a'},N('（你們裝了一個小時。她把最後一箱封起來，抽出三本放在桌上。）'),SIS('這三本，你要的話拿去。我畫過線的。'),{set:{SIS15_BOOKS3:true},advance:1},{goto:'e'},   /* 房間多一個物件（src/sis_b15_3d.js：STORY.ROOM_EXTRA）；裝了一個小時＝時間往前一小時 */
      {label:'b'},SIS('帶不走。放家裡。……放我自己的家。'),
      {label:'e'} ]),

    /* ---------- 第 2 節：週四 19:00～21:00 法圖討論室，3D 走進去她說一句（輪流；認識以上、一天一次）---------- */
    { id:'ev_sis15_board', title:'家族讀書會', participants:[ID], location:'lawlib', trigger:'auto', weekday:[4], time:[19,21], cooldown_days:1, near:{npc:ID,r:3}, background:'blur',
      prereq:{custom:(G,GM)=>!!X()&&X().boardOk(G,GM)},
      dialogue:[ Object.assign({if:{custom:G=>!!X()&&X().boardIx(G)===0}},SIS('今天的題目在白板上。')),
        Object.assign({if:{custom:G=>!!X()&&X().boardIx(G)===1}},SIS('坐。題目自己看。')),
        Object.assign({if:{custom:G=>!!X()&&X().boardIx(G)===2}},SIS('佳穎，你先講。……好，換人。')),
        {inc:{SIS15_BOARD_N:1}} ] },
    /* ---------- 2-1 2027-10-21（四）：限制行為能力（民法第 12、13、75、79 條；只講到效力未定）---------- */
    ST(1,'家族讀書會：限制行為能力',[
      N('（法圖討論室。白板上寫著一行字：「十七歲，自己買了一台二手機車。契約有效嗎？」）'),
      SIS('佳穎。'),
      JUN('……無效？'),
      SIS('再想一次。他十七歲。七歲以下的，才是無效。'),
      JUN('那……要問爸媽？'),
      SIS('對。爸媽承認了，才有效。不承認，就沒有。'),
      N('（她在白板上寫下「效力未定」四個字，圈起來。）'),
      {choice:[{text:'「效力未定。」',goto:'a'},{text:'「十八歲就成年了。」',goto:'b'}]},
      {label:'a'},SIS('嗯。你大一的時候，這題錯過嗎。'),{goto:'e'},
      {label:'b'},SIS('對。以前是二十歲。……這題考古題的答案，有幾份是舊的。小心。'),
      {label:'e'} ]),
    /* ---------- 2-2 2027-12-09（四）：出題的人 ---------- */
    ST(2,'家族讀書會：出題的人',[
      N('（白板上是一題債總的題目，箭頭畫得滿滿的。）'),
      JUN('學姊，這題是妳出的嗎？'),
      SIS('嗯。'),
      JUN('……很難。'),
      SIS('嗯。我自己錯了三次，才出得出來。'),
      {choice:[{text:'「妳錯在哪？」',goto:'a'},{text:'（抄題目）',goto:'b'}]},
      {label:'a'},SIS('第二個箭頭。……你自己找。'),{goto:'e'},
      {label:'b'},N('（她看了你一眼，沒有說話，把白板往你那邊轉了一點。）'),
      {label:'e'} ]),
    /* ---------- 2-3 2028-03-16（四）：她遲到（前一天 3/15 她收到美國的信；Kevin 九點那一則在家族群組，src/sis_b15_3d.js）---------- */
    ST(3,'家族讀書會：她遲到',[
      N('（七點十分，她才推門進來。這是第一次。）'),
      SIS('……抱歉。昨天沒睡好。'),
      {choice:[{text:'「發生什麼事？」',goto:'a'},{text:'（不問）',goto:'b'}]},
      {label:'a'},SIS('……群組看到了吧。美國那邊。'),{goto:'e'},
      {label:'b'},N('（那一晚的題目，她講得比平常快。）'),
      {label:'e'} ]),
    /* ---------- 2-4 2028-05-11（四）：交棒前（7/13 最後一次 ev_sis_fam_study_last 照舊）---------- */
    ST(4,'家族讀書會：交棒前',[
      SIS('七月以後，我不在。'),
      SIS('讀書會給佳穎帶。……題目我先出好十週的。'),
      JUN('十週！？'),
      SIS('一週一題。很少了。'),
      {choice:[{text:'「學姊會在美國看嗎？」',goto:'a'},{text:'「佳穎可以的。」',goto:'b'}]},
      {label:'a'},SIS('她會拍白板。……我看得到。'),{goto:'e'},
      {label:'b'},JUN('……學長不要害我。'),SIS('可以的。'),
      {label:'e'} ]),

    /* ---------- 第 3 節第 1 點：6/3（六）10:30 霖澤館門口，家族合照（Kevin 6/1 21:00 揪、回「去。」；出遊）---------- */
    { id:'ev_sis15_kv_grad', title:'法律系館A門口的合照', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'法律系館A門口',bg:'ntu_linze'},
        N('（法律系館A門口。Kevin 穿著學士服，一直在調學士帽。佳穎在旁邊拿著花。）'),
        KEV('學姊！站中間！'),
        SIS('……你是主角。'),
        N('（最後她站在 Kevin 旁邊。快門按下去的時候，她伸手把 Kevin 歪掉的帽子扶正。）'),
        {set:{SIS15_KV_GRAD:true}},metEnd ] },
    /* ---------- 第 3 節第 4 點：3/16（四）12:20 霖澤館 5F 研究室，兩個便當（交往中、3/15 電話選「我現在過去。」；出遊 1 小時）---------- */
    { id:'ev_sis15_lunch0316', title:'兩個便當', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'法律系館A・研究室',bg:'linze_prof_hall'},   /* 地點、背景照 ev_sis_lab_desk */
        N('（研究室。她的桌上放著兩個便當，筷子已經拆好了。）'),
        SIS('說好中午。'),
        SIS('……昨天那通，我講完才發現自己的手在抖。'),
        {choice:[{text:'「現在還抖嗎？」',goto:'a'},{text:'（把她的便當蓋子打開）',goto:'b'}]},
        {label:'a'},N('（她把手伸出來給你看。）'),SIS('不抖了。吃飯。'),{goto:'e'},
        {label:'b'},SIS('……謝謝。'),
        {label:'e'},{set:{SIS15_LUNCH_0316:true}} ] },
    /* ---------- 第 3 節第 6 點：之後第一個下雨天 17:00 總圖門口（3D，走近時的旁白；一次）---------- */
    { id:'ev_sis15_umbrella', title:'兩把傘', participants:[ID], location:'campus', trigger:'auto', once:true, weekday:[1,2,3,4,5], time:[17,17.5], weather:'rain', near:{npc:ID,r:4}, background:'blur',
      prereq:{custom:G=>!!X()&&X().umbrellaOk(G)},
      dialogue:[ N('（她手上拿著兩把傘。一把遞給你。）'),SIS('說好的。') ] },
    /* ---------- 第 3 節第 7 點：之後第一次週三晚上在法圖找她（3D，走近時的旁白；一次）---------- */
    { id:'ev_sis15_coat', title:'兩件外套', participants:[ID], location:'lawlib', trigger:'auto', once:true, weekday:[3], time:[19,21], near:{npc:ID,r:3}, background:'blur',
      prereq:{custom:G=>!!X()&&X().coatOk(G)},
      dialogue:[ N('（她的包包裡多帶了一件外套，遞給你。）'),SIS('法圖冷。說好的。') ] },
    /* ---------- 第 3 節第 2 點：2026-11-16 起第一次在 3D 和她說話（說話前接演，src/sis_b15_3d.js S.preTalk；這一筆只放台詞，不會自己觸發）---------- */
    { id:'ev_sis15_midterm', title:'都還好嗎', participants:[ID], location:'any', trigger:'manual', once:true,
      dialogue:[ SIS('期中考完了。……再說一次，都還好嗎？'),
        {choice:[{text:'「這次是真的還好。」',goto:'a'},{text:'「其實不太好。」',goto:'b'}]},
        {label:'a'},SIS('好。'),{goto:'e'},
        {label:'b'},SIS('……說來聽聽。'),N('（你講了二十分鐘，她都在聽，沒有打斷。）'),{advance:1/3},   /* 講了二十分鐘＝時間往前 20 分鐘 */
        {label:'e'} ] } ];
})();
for(const e of SISB15_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
