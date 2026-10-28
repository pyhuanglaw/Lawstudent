/* ===== 學姊第十二批：三種玩家總檢查，大一暑假到大四寒假補七場（AA_470，企劃線 5f54b6545；任務 SIS-LEAD-1021、D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109；不數件數 AA_398）。接線在 src/sis_b12_3d.js。
   稱呼（AA_470 第 2 節）：「{稱呼}」＝熟悉叫「學弟」、朋友以上（或交往中）叫名字——寫成兩行（if／unless），同一句其他字不動；
   交往中祐廷的選項叫「妳」（同 sis_b4_events.js「學姊現在還可以去啊。」／「妳現在還可以去啊。」的做法）。 */
'use strict';
const SISB12_LINES={
  /* 12-1 演完第 21 天 21:00 私訊（不用回）*/
  cardBack:['書還了。三本。','你的借閱紀錄，沒有逾期。'],
  /* 12-2 大二的家族群組（四則；所有在家族群組的人；不用回）。k＝Kevin、s＝學姊、j＝家族的學妹 */
  fam2:[{day:'2026-09-07',h:21,L:[['k','新學期！！下禮拜新的學弟妹進群組'],['k','置頂的東西 老人們先整理一下'],['s','置頂的筆記我換過了。去年的錯字也改了。'],['k','學姊連錯字都改']]},
    {day:'2026-09-14',h:21,L:[['k','歡迎新學弟妹！！（貼圖）'],['k','上面那位是溫學姊 碩一 有問題問她 她回很快'],['j','學姊好🙏'],['s','學妹好。先問你們的直屬，問不到再問我。']]},
    /* AA_497 5-4：Kevin 的動物影片第 6 則（照原本的日期）換成他自己的事第 4 則；跟著影片的「學姊這次有看完嗎」「有。牠到最後都沒醒。」拿掉（講的是影片），「期中加油各位」「收到。」照留 */
    {day:'2026-10-26',h:21,L:[['k','家聚吃什麼 不要再吃咖哩了'],['k','期中加油各位'],['s','收到。']]}],
    /* AA_497 5-2：2027-03-08 學妹在家族群組問考古題那一段拿掉——Kevin 交棒以後（去了、沒去都一樣）佳穎改成私訊祐廷（src/sup497_3d.js kv_yz_ask）*/
  /* 12-3 大二寒假：1/12 21:00 群組（選項只給認識她、不是前任的）；沒回＝1/13 12:00；演完群組三句 */
  hotAsk:[['k','寒假還有誰在台北的'],['k','我回家第三天 已經被我媽唸兩次了'],['s','我在。']],
  hotYes:{t:'我也在。',say:[['k','那你們兩個去吃火鍋 幫我吃一份'],['s','……明天七點。去年聖誕節那家。'],['k','要拍照給我看'],['s','不要。']]},
  hotHint:'那天晚上有托福班',   /* 「我也在。」的小字：報了 C04W、1/13 晚上有課的（AA_490 4-1，企劃線 a4f530c11：和 C04W 托福寒假班照撞期處理）*/
  hotNone:[['k','好吧 那學姊幫大家吃一份'],['s','不要。']],
  hotAfter:[['s','（照片：兩個空的鍋子）'],['k','我的那份呢？？'],['s','吃掉了。']],
  /* 12-4 大三上：9/13 21:00 群組（選項所有人）；9/16 演完 21:40 群組 */
  studyAsk:[['k','大四了 國考倒數 家族讀書會開張！！'],['k','每週四晚上七點 法圖討論室 學姊帶'],['s','我只負責訂討論室。'],['k','還有出題'],['s','還有出題。']],
  studyOpts:[{t:'我去。',k:true},{t:'這週不行。',k:false}],
  studyHint:'那天晚上也是公法讀書會',   /* 「我去。」的小字：那一學期去過公法讀書會的（AA_490 第 3 節，企劃線 a4f530c11：和以安的公法讀書會同一晚，照撞期處理、不換日子）*/
  studyAfter:[['k','第一次讀書會 存活'],['k','（照片：擦乾淨的白板，角落寫著下週四的日期）']],
  /* 12-6a Kevin 畢業：6/3 13:00 群組（選項所有人）*/
  gradPost:[['k','（照片：學士服，站在霖澤館門口，比了一個 V）'],['k','我畢業了！！！'],['s','恭喜。'],['k','學姊 八月國考 妳幫我集氣一次就好'],['s','好。日子跟我說。']],   /* AA_497 5-4：「學姊多講兩個字」只留第一次（2026-03 學姊上榜），這裡第 4、5 則換掉 */
  gradOpt:{t:'學長恭喜！',say:[['k','學弟明年換你！！']]},
  /* 12-6b 讀書會最後一次：7/10 21:00 群組 */
  lastAsk:[['k','最後一次家族讀書會 這週四'],['k','學姊下個月就飛了 我下個月就考了'],['s','題目我出好了。']],
  lastOpts:[{t:'我去。',k:true},{t:'這週不行。',k:false}],
  lastJp:{t:'我在日本。',say:[['k','對齁 學弟在日本'],['s','題目傳給你。']]},
  /* 7/13 那天寒暑假出國中（AA_492 第 1 節，AA 分支 2a5b78ee3；和日本路線一樣給一個替代選項）：{國}＝那一趟「飛往〇〇」字卡的第一行去掉「飛往」（src/vac3d.js S.abroadDest）。Kevin 照他的寫法不加句號 */
  lastAway:{t:'我在{國}。',say:[['k','對齁 學弟在{國}'],['s','題目傳給你。']]},
  lastCancel:'行程取消：法圖・討論室（讀書會最後一次）。那天你在國外。',   /* 舊存檔：已經排好 7/13、後來才出國而取消的，取消那一刻手機系統提示（AA_492 第 1 節）*/
  /* 4-2 朋友版「另外一本，回來再看。」之後才交往的：下一次和她正式約會的結尾補演一次（AA_492 第 3 節；句子照 12-7 那兩版，旁白換成約會的場合；說話人照交往中的顯示「書瑀」）*/
  bookLate:{law:['（她的包包裡露出那本小說。書籤還在快一半的地方。）','回來以後開始看。……還沒看完。'],
    novel:['（她的包包裡是那本舊的刑訴，書背的膠帶換了新的。）','回來第一個禮拜翻完了。問號少了一點。']} };

const SISB12_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB12!=='undefined'?SISB12:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), KEV=t=>({speaker:'Kevin',text:t}), ME=t=>({speaker:'player',text:t});
  const dt={custom:G=>!!X()&&X().dating(G)}, up={custom:G=>!!X()&&X().nameUp(G)};   /* up：朋友以上或交往中＝叫名字 */
  const gx={custom:G=>typeof R3!=='undefined'&&!!R3.gradExam&&R3.gradExam(G)};   /* 考研究所的玩家（r3_3d.js S.gradExam）：1/8 她要過計畫、1/9 在研究室看過，12-7 不再問（AA_492 第 2 節）*/
  const mem=(tag,rel)=>({mem:[{npc:ID,tag,note:''}],rel:{[ID]:rel}});
  const noW1={flags:['SIS_W1']};
  return [
    /* ---------- 12-1 大一暑假：學生證（7/6～7/31 平日 9:00～17:00 總圖閱覽區，找她說話先演；src/sis_b12_3d.js S.preTalk）---------- */
    { id:'ev_sis_borrowed_card', title:'學生證', participants:[ID], location:'library', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（總圖三樓靠窗的位子。她面前疊著五本書，最上面夾著一張手寫的書單。）'),
        Object.assign({if:up},SIS('{name}。你的學生證，借我一下。')),Object.assign({unless:up},SIS('學弟。你的學生證，借我一下。')),
        N('（你還沒回答，她已經把借書單推過來，書名都寫好了。）'),
        SIS('我的學生證六月底停了。研究所的，九月才發。'),
        SIS('這三本，用你的名字借。到期以前我還。'),
        {choice:[{text:'「好。」',goto:'a'},{text:'「妳不是畢業了嗎？」',goto:'b'},{text:'「逾期算誰的？」',goto:'c'}]},
        {label:'a'},N('（她點了一下頭，把三本抽出來疊好。）'),{goto:'m'},
        {label:'b'},SIS('畢業了。書還是要讀。'),{goto:'m'},
        {label:'c'},SIS('算我的。……不會逾期。'),
        {label:'m'},N('（櫃台蓋完章，她把三本書抱在手上。最上面那本的書名，你只看得懂一半。）'),
        SIS('許老師開的書單。開學以前要讀完。'),
        SIS('你暑假讀什麼？'),
        {choice:[{text:'「還沒想。」',goto:'p'},{text:'「民法。」',goto:'q'},{text:'「什麼都不讀。」',goto:'r'}]},
        {label:'p'},SIS('那先睡飽。九月以後就沒有了。'),{goto:'e'},
        {label:'q'},SIS('哪一本。……那本可以。第三章慢慢讀。'),{goto:'e'},
        {label:'r'},SIS('……也可以。一個暑假而已。'),
        {label:'e'},N('（走到樓梯口，她把借書的收據折好，夾進計畫本八月那一頁。）'),
        mem('SIS_BORROWED_CARD',{fam:1,trust:1}) ] },
    /* ---------- 12-3 大二寒假：幫 Kevin 吃一份（1/13 19:00 公館的火鍋店，出遊）---------- */
    { id:'ev_sis_hotpot_y2', title:'幫 Kevin 吃一份', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
        N('（公館那家火鍋。去年聖誕節，家族坐的是裡面那張長桌。今天店員帶你們到靠窗的兩人桌。）'),
        SIS('Kevin 說要幫他吃一份。'),
        SIS('我們吃兩份就好。'),
        {if:{custom:G=>!!X()&&X().xmasWent(G)},speaker:null,text:'（她點了兩盤肉。去年聖誕節，她的碗裡只有白飯和青菜。）'},   /* 去過家族聖誕的（SIS_FAMXMAS_Y1，'missed'＝沒去不算）*/
        SIS('期末考得怎樣。'),
        {choice:[{text:'「還可以。」',goto:'a'},{text:'「有一科不太好。」',goto:'b'},{text:'「妳改的考卷改完了？」',if:{events:['ev_sis_ta_papers']},goto:'c'}]},   /* 第三個：演過 AA_394 2-3 助教的考卷 */
        {label:'a'},SIS('嗯。考完的就不講了。'),{goto:'m'},
        {label:'b'},SIS('哪一科。……開學去問老師你錯在哪裡。不用求分數，去問就好。'),{goto:'m'},
        {label:'c'},SIS('昨天改完。紅筆用完一支。'),
        {label:'m'},N('（湯滾了。她伸手把你那一鍋的火轉小。）'),
        SIS('Kevin 大一的時候，家聚吃到一半睡著。'),
        SIS('醒來以後說他在想事情。'),
        {choice:[{text:'「他現在也這樣嗎？」',goto:'p'},{text:'「學姊大一的時候呢？」',unless:dt,goto:'q'},{text:'「妳大一的時候呢？」',if:dt,goto:'q'},{text:'（笑出來）',goto:'r'}]},
        {label:'p'},SIS('現在他不睡。他講話。'),{goto:'e'},
        {label:'q'},SIS('我坐最旁邊，負責算錢。……算到現在。'),{goto:'e'},
        {label:'r'},N('（她沒有笑，夾了一塊肉放進你的鍋子。）'),
        {label:'e'},N('（結帳的時候，她拿手機拍了兩個空鍋子。）'),
        Object.assign({set:{SIS_HOTPOT_Y2:'went'}},mem('SIS_HOTPOT_Y2',{fam:2,comf:2})) ],
      afterOuting:(G,GM)=>{ if(X()) X().hotAfter(G); },   /* 演完：群組三句（src/sis_b12_3d.js）*/
      outingMissed:G=>{ if(G.flags.SIS_HOTPOT_Y2==null) G.flags.SIS_HOTPOT_Y2='missed'; } },   /* 回了「我也在。」沒到：錯過不補（AA_470 第 2 節）*/
    /* ---------- 12-4 大三上：家族讀書會的第一次（9/16（四）19:00 法圖討論室，出遊）---------- */
    { id:'ev_sis_fam_study', title:'家族讀書會', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:'法圖・討論室',bg:'law_library'},
        N('（法圖的討論室。白板上寫著今天的日期，下面一行小字：「九點半前離開」。Kevin、家族的學妹，還有兩個你叫不出名字的大四。）'),
        Object.assign({unless:noW1},ME('學姊好，我是{name}。我是妳的直屬。')),   /* 沒有 SIS_W1 的（還沒認識她）：同 9/12 家聚 ev_sis_fam_dinner 的做法 */
        Object.assign({unless:noW1},SIS('我知道。群組裡那個名字。……坐。')),
        SIS('今天一題。讀完再講。'),
        N('（她發下來一張 A4，題目只有四行。Kevin 讀到第二行就開始抓頭。）'),
        KEV('學姊，這題是陷阱吧。'),
        SIS('陷阱在你沒讀的那一行。'),
        {choice:[{text:'「先找爭點。」',goto:'a'},{text:'「先看條文。」',goto:'b'},{text:'「我也覺得是陷阱。」',goto:'c'}]},
        {label:'a'},SIS('找到幾個？……一個就夠，先寫那一個。'),{goto:'e'},
        {label:'b'},SIS('條文最後看。先看這個人要什麼。'),{goto:'e'},
        {label:'c'},SIS('（看了 Kevin 一眼）你們兩個坐一起。'),
        {label:'e'},N('（九點二十五分，她把白板擦乾淨。角落已經寫好下週四的日期。）'),
        SIS('題目我週三傳。'),
        Object.assign({set:{SIS_FAM_STUDY:'went'}},mem('SIS_FAM_STUDY',{fam:1,trust:1})),
        {unless:noW1,set:{SIS_W1:true,met_sis:true}} ],   /* 演完記 met_sis、SIS_W1（FIRST_MET 由 EVENTS.run 記）*/
      outingMissed:G=>{ if(G.flags.SIS_FAM_STUDY==null) G.flags.SIS_FAM_STUDY='missed'; } },
    /* ---------- 12-5 大三下（臺灣）：法圖的午休（2028-03-03～04-21 的週五 12:00～14:00、日本路線到 3/24——AA_490 第 1 節；找她說話先演；Kevin 同框）---------- */
    { id:'ev_sis_lawlib_kevin', title:'法圖的午休', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（法圖最裡面那張桌子。她對面坐著 Kevin，額頭貼在一疊考古題上。）'),
        KEV('學弟……救我。'),
        SIS('他沒事。他在休息。'),
        KEV('學姊，妳當年怎麼撐過來的。'),
        SIS('我沒有撐。（她把保溫瓶的蓋子轉開）……後來我學會睡覺。'),
        {choice:[{text:'「學姊以前不睡覺？」',unless:dt,goto:'a'},{text:'「妳以前不睡覺？」',if:dt,goto:'a'},{text:'「Kevin 學長加油。」',goto:'b'},{text:'「那我不吵你們。」',goto:'c'}]},
        {label:'a'},SIS('以前覺得睡覺很浪費。……後來倒下過一次。'),{goto:'m'},
        {label:'b'},KEV('學弟好溫暖。學姊妳學一下。'),SIS('加油。'),KEV('……謝謝喔。'),{goto:'m'},
        {label:'c'},SIS('不吵。坐。這裡有位子。'),
        {label:'m'},SIS('（看了你一眼）你大三下了。'),
        SIS('明年這個時候，坐在這裡的可能是你。'),
        {choice:[{text:'「我會記得睡覺。」',goto:'p'},{text:'「我還沒想要不要考。」',goto:'q'}]},
        {label:'p'},SIS('嗯。……我會檢查。'),{goto:'e'},
        {label:'q'},SIS('那先不要想。大四上再想也來得及。'),
        {label:'e'},N('（一點五十分，她收好計畫本，把 Kevin 叫醒。）'),
        SIS('兩點了。我去研究小間。'),
        KEV('學姊妳的研究小間有冷氣嗎'),
        SIS('有。不借你。'),
        mem('SIS_LAWLIB_KEVIN',{fam:1,comf:2}) ] },
    /* ---------- 12-6b 讀書會最後一次（7/13（四）19:00 法圖討論室，出遊）---------- */
    { id:'ev_sis_fam_study_last', title:'讀書會最後一次', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
      dialogue:[ {scene:'法圖・討論室',bg:'law_library'},
        N('（法圖的討論室。白板只寫了一題，下面沒有寫「九點半前離開」。）'),
        SIS('最後一題。寫完的先走。'),
        N('（九點，桌上只剩你和 Kevin。Kevin 寫完，把筆一丟，趴在桌上。）'),
        KEV('學姊，下學期誰帶？'),
        SIS('你考完就畢業了。你不用管。'),
        KEV('學弟他們那一屆啊。'),
        N('（她看了你一眼，沒有回答，把白板擦乾淨。）'),
        {choice:[{text:'「我可以訂討論室。」',set:{SIS_STUDY_ROOM:true},mem:[{npc:ID,tag:'SIS_STUDY_ROOM',note:''}],goto:'a'},{text:'「讀書會還要繼續嗎？」',goto:'b'},{text:'（幫她擦白板）',goto:'c'}]},
        {label:'a'},SIS('……好。題目我從那邊寄。'),{goto:'e'},
        {label:'b'},SIS('要不要，你們決定。'),{goto:'e'},
        {label:'c'},N('（她把板擦遞給你，自己去收桌上的考卷。）'),
        {label:'e'},N('（走出法圖，Kevin 說他要去吃宵夜。她說她要回家收行李。）'),
        Object.assign({unless:{custom:G=>!!X()&&X().usDating(G)}},SIS('八月二號。……群組會說。')),
        Object.assign({if:{custom:G=>!!X()&&X().usDating(G)}},SIS('八月二號。……你不用送，我們同一班。')),   /* 美國路線（交往中）：同一班飛機 */
        Object.assign({set:{SIS_FAM_STUDY_LAST:'went'}},mem('SIS_FAM_STUDY_LAST',{fam:1,comf:1})) ],
      outingMissed:G=>{ if(G.flags.SIS_FAM_STUDY_LAST==null) G.flags.SIS_FAM_STUDY_LAST='missed'; } },
    /* ---------- 12-7 大四寒假：空白的一月（1/2～2/8 週一、二、四 19:00～21:30 兩點半 Café，找她說話先演；朋友版）---------- */
    { id:'ev_sis_blank_jan', title:'空白的一月', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（兩點半 Café。她坐在老位子，桌上一杯熱水、一本新的計畫本。）'),
        Object.assign({if:up},SIS('{name}。坐。')),Object.assign({unless:up},SIS('學弟。坐。')),
        {if:gx,goto:'m'},   /* 考研究所的玩家不問選項一，直接接「接著」那一段（她翻開自己的計畫本）；選項二、「另外一本」、結尾照舊（AA_492 第 2 節）*/
        Object.assign({if:{flags:['SIS_PLAN_POSTED']}},SIS('十月那份讀書計畫。後來照著做了多少？')),   /* 十月在家族群組貼過讀書計畫（r3_3d.js r3_sis_plan_a）*/
        Object.assign({unless:{flags:['SIS_PLAN_POSTED']}},SIS('寒假你怎麼排的？')),
        {choice:[{text:'「大概一半。」',goto:'a'},{text:'「每一天都照做。」',goto:'b'},{text:'「沒照做。」',goto:'c'}]},
        {label:'a'},SIS('一半很多了。'),{goto:'m'},
        {label:'b'},SIS('……休息日呢。'),N('（你沒有回答。）'),SIS('那就是沒有。'),{goto:'m'},
        {label:'c'},SIS('嗯。至少你說實話。'),
        {label:'m'},N('（她把自己的計畫本翻開，推到你面前。一月那一頁，大部分格子是空的。）'),
        SIS('在美國，最後一格寫的是回臺灣。'),
        SIS('回來以後，這本一直空著。'),
        {choice:[{text:'「空著不好嗎？」',goto:'p'},{text:'「我幫妳寫一格？」',set:{SIS_BLANK_JAN_REST:true},goto:'q'},{text:'「美國好玩嗎？」',goto:'r'}]},
        {label:'p'},SIS('……我還在習慣。'),{goto:'bk'},
        {label:'q'},SIS('（看了你一眼）……寫什麼。'),N('（你在下個禮拜那一格寫了「休息」。她看了一下，沒有擦掉。）'),{goto:'bk'},
        {label:'r'},SIS('好玩。……照片你都看過了。'),
        {label:'bk'},   /* 4-2「另外一本，回來再看。」朋友版（AA_395 1-2 的 SIS_BOOK；both、沒演過的沒有這段）*/
        {if:{flagIs:{SIS_BOOK:'law'}},speaker:null,text:'（計畫本旁邊是那本小說。書籤還在快一半的地方。）',set:{SIS_BOOK_BACK:true}},{if:{flagIs:{SIS_BOOK:'law'}},speaker:ID,text:'回來以後開始看。……還沒看完。'},
        {if:{flagIs:{SIS_BOOK:'novel'}},speaker:null,text:'（計畫本旁邊是那本舊的刑訴，書背的膠帶換了新的。）',set:{SIS_BOOK_BACK:true}},   /* SIS_BOOK_BACK：「另外一本」演過了（交往以後的約會補演同一個記號，sis_b12_3d.js S.bookLate）*/{if:{flagIs:{SIS_BOOK:'novel'}},speaker:ID,text:'回來第一個禮拜翻完了。問號少了一點。'},
        SIS('下學期要的書，開學以前跟我說。法圖寒假開得很短。'),
        {if:{flags:['SIS_BLANK_JAN_REST']},speaker:null,text:'（她把計畫本收起來。那一格「休息」還在上面。）'},
        mem('SIS_BLANK_JAN',{comf:2,trust:1}) ] } ];
})();
for(const e of SISB12_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
