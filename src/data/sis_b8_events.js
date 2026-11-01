/* ===== 學姊第八批：大二整年＋兩個暑假（AA_394，企劃線 e81a1afe1；任務 SIS-B8-L-1023）的台詞與事件 =====
   她碩一、祐廷的直屬學姊：選課、找資料、考古題、助教、論文。台詞照稿一字不改（D100、D109；不數件數 AA_398）。接線在 src/sis_b8_3d.js。 */
'use strict';
const SISB8_LINES={
  /* 第 1 節：8/12（三）21:00 約 → 8/14（五）15:00 Café */
  courseAsk:['選課系統下禮拜開。','週五下午三點，Café。課表帶來，我幫你看。'], courseYes:'好。', courseDone:'我已經排好了。', courseDoneR:'那帶來給我看。排好的最需要看。',
  courseNoT:'那天不行。', courseNo:'好。截圖傳給我。', courseNoLater:'債總選周老師那班。他會點人，你會被逼著想。',
  /* 2-2：11/4（三）21:00 約 → 11/6（五）12:20 公館的自助餐 */
  lunchAsk:['週五中午有空嗎。直屬要請一次飯。','系上的規矩，不是我想的。……也有一點是我想的。'], lunchYes:'好。', lunchNoT:'那天不行。', lunchNo:'好。下次。',
  /* 第 4 節：7/20（二）21:00 約 → 7/22（四）15:00 研究室；不行＝7/25 她傳 */
  ch1Ask:['論文第一章寫完了。','週四下午三點，研究室。幫我讀。你不是做這個題目的，剛好。'], ch1Yes:'好。', ch1Q:'我看得懂嗎？', ch1QR:'看不懂的地方，就是我要改的地方。',
  ch1NoT:'那天不行。', ch1No:'好。我寄給你，看不懂的劃起來。', ch1Mail:'收到了。你劃的三個地方，我改了兩個。' };

const SISB8_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB8!=='undefined'?SISB8:null;
  const dt={custom:G=>!!X()&&X().dating(G)}, SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const rel=o=>({consequences:{rel:{[ID]:o}}});
  return [
    /* ---------- 第 1 節：2026-08-14（五）15:00 兩點半 Café：大二的選課 ---------- */
    { id:'ev_sis_course_y2', title:'大二的選課', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'兩點半 Café',bg:'cafe'},
        N('（她把你的課表印出來，用紅筆在上面畫。）'),
        SIS('債總選周老師那班。他會點人，你會被逼著想。'),
        SIS('星期五早上那堂通識拿掉。你大一的出席紀錄，我在家族群組看過。'),
        {choice:[{text:'「那堂很好過。」',goto:'a'},{text:'「妳大二修了什麼？」',goto:'b'}]},
        {label:'a'},SIS('好過，可是你起不來。……我說錯了嗎？'),ME('……沒有。'),{goto:'c'},
        {label:'b'},SIS('跟你差不多。……我大二的課表比你滿，我那時候不知道要留時間給自己。'),
        {label:'c'},N('（她把紅筆蓋起來，課表推回給你。）'),
        SIS('剩下的你自己決定。我只看我看得出來的。'),
        Object.assign({set:{SIS_COURSE_Y2:true}},rel({fam:2})) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'course'); } },
    /* ---------- 2-1：大二上第 5～6 週的週三 19:30 以後，法圖：找判決（說話前接演）---------- */
    { id:'ev_sis_db_taught', title:'找判決', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她的筆電開著法學資料庫，你從後面經過。）'),
        SIS('你們刑分的報告要找判決吧。……坐。'),
        SIS('不要一次搜一整頁。先找一個你看得懂的，再看它前面那一審、後面那一審。'),
        N('（她示範了一次。三個視窗並排，她的游標在中間那份停了很久。）'),
        {choice:[{text:'「為什麼要看前後兩審？」',goto:'a'},{text:'（照她的方法找一份）',goto:'b'}]},
        {label:'a'},SIS('一份判決只是結果。前後放在一起，才看得出來誰在哪裡改變了想法。'),{goto:'c'},
        {label:'b'},N('（你找到第二份的時候，她點了一下頭，回去寫自己的東西。）'),
        {label:'c'},Object.assign({set:{SIS_DB_TAUGHT:true}},rel({fam:1,trust:2})) ] },
    /* ---------- 2-2：2026-11-06（五）12:20 公館的自助餐：直屬的午餐（沒有底圖：gongguan_buffet 先顯示公館街景）---------- */
    { id:'ev_sis_lunch_y2', title:'直屬的午餐', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'公館・自助餐',bg:'gongguan'},
        N('（她夾菜很快，三樣青菜、一塊魚，排隊的時候已經算好價錢。）'),
        SIS('大二到現在，哪一科最難？'),
        {choice:[{text:'「債總。」',goto:'a'},{text:'「都還好。」',set:{SIS15_ALLOK:true},goto:'b'}]},   /* AA_518 第 3 節第 2 點：選「都還好。」記 SIS15_ALLOK（2026-11-16 起第一次找她說話那一句，src/sis_b15_3d.js）*/
        {label:'a'},SIS('對。債總是第一個讓人覺得自己不會讀書的科目。……過了就好了。'),{goto:'c'},
        {label:'b'},SIS('期中考完再告訴我一次。'),
        {label:'c'},N('（結帳的時候她已經付好了。）'),
        {unless:dt,speaker:ID,text:'我大一的時候，我的學姊也請過我。'},{if:dt,speaker:ID,text:'……下次你請。',set:{SIS15_YOUPAY:true}},   /* AA_470 4-3：祐廷不會當別人的直屬（直屬學弟那條作廢，AA_208）——原句「下次你當直屬的時候，記得也要請。」換掉；交往版照舊。AA_518 第 3 節第 8 點：交往版記 SIS15_YOUPAY（大二上期末飯的收尾，termend_lines.js）*/
        Object.assign({set:{SIS_LUNCH_Y2:true}},rel({fam:2,comf:2})) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'lunch'); } },
    /* ---------- 2-3：大二上第 14 週（AA_386 1-2 還沒演＝第 15 週）週三 19:30 以後，法圖：助教的考卷（她碩一當大一民總的課堂助教）---------- */
    { id:'ev_sis_ta_papers', title:'助教的考卷', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她面前兩疊考卷，紅筆、藍筆各一支。）'),
        SIS('你幫我看一下。不是看對錯，對錯我看。'),
        SIS('這兩份，哪一份你讀得比較順？'),
        N('（她把兩張答案卷遮掉名字，推過來。）'),
        {choice:[{text:'「左邊。」',goto:'a'},{text:'「右邊。」',goto:'b'}]},
        {label:'a'},SIS('左邊分數比較低。……可是我也覺得左邊好讀。我再想一下。'),{goto:'c'},
        {label:'b'},SIS('嗯。右邊寫得比較像在跟人講話。'),
        {label:'c'},SIS('謝謝。……這不算洩題，你們大二早就考過了。'),
        Object.assign({set:{SIS_TA_PAPERS:true}},rel({trust:1,comf:1})) ] },
    /* ---------- 3-1：大二下第 3 週週三 19:30 以後，法圖：那張圖（她論文讀到經濟學的論文；祐廷念過一年經濟）---------- */
    { id:'ev_sis_econ_graph', title:'那張圖', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她把筆電轉過來。螢幕上是一張曲線圖。）'),
        SIS('你念過經濟。這張圖，我看了二十分鐘。'),
        {choice:[{text:'（講給她聽：橫軸是什麼、曲線往哪裡移）',if:{custom:G=>!!X()&&X().econFull(G)},goto:'a'},{text:'「我也忘得差不多了。」',goto:'b'}]},
        {label:'a'},N('（你講了五分鐘。她在筆記本上畫了一次，畫錯，又畫一次。）'),SIS('好。我懂了。……我欠你一杯咖啡。'),Object.assign({set:{SIS_ECON_GRAPH:'taught'}},rel({trust:2})),{end:true},
        {label:'b'},SIS('那一起看。'),N('（你們看了十分鐘，你想起來一半。她自己想通了另一半。）'),Object.assign({set:{SIS_ECON_GRAPH:'together'}},rel({trust:2})) ] },
    /* ---------- 3-1 教她的那一版：之後第一次在 Café 找她說話 ---------- */
    { id:'ev_sis_econ_latte', title:'上次的', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（桌上多一杯熱拿鐵。她說：『上次的。』）'),{set:{SIS_ECON_LATTE:true}} ] },
    /* ---------- 3-2：大二下第 7 週週三 19:30 以後，法圖：她大二的筆記 ---------- */
    { id:'ev_sis_old_notes', title:'她大二的筆記', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她從包包拿出一本很舊的活頁夾。）'),
        SIS('我大二債各的筆記。字很醜。'),
        SIS('第三章有錯，我用紅筆改過了。紅的那一行，不要背藍的那一行。'),
        {choice:[{text:'「妳的字不醜。」',goto:'a'},{text:'「考完還妳。」',goto:'b'}]},
        {label:'a'},SIS('你還沒翻到第五章。'),{goto:'c'},
        {label:'b'},SIS('不用還。……傳給你下一個直屬。'),
        {label:'c'},Object.assign({set:{SIS_OLD_NOTES:true},mem:[{npc:ID,tag:'SIS_OLD_NOTES',note:''}]},rel({fam:1})) ] },
    /* ---------- 3-3：大二下第 14 週週三 21:30 以後，法圖：熱水（大一上她幫你裝過熱水，這次反過來）---------- */
    { id:'ev_sis_hot_water_back', title:'熱水', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她趴在桌上。保溫瓶倒在旁邊，空的。）'),
        {choice:[{text:'（拿她的保溫瓶去飲水機裝熱水）',goto:'a'},{text:'（輕輕敲一下桌子）',goto:'b'}]},
        {label:'a'},N('（你回來的時候她已經坐起來了。你把保溫瓶放在她手邊。）'),SIS('……熱水。'),SIS('謝謝。我以為我放了三包茶，原來我只裝了茶包，沒有裝水。'),
        {if:dt,speaker:null,text:'（她把你的手拉過去，在手背上寫了一個『謝』，用手指。）'},
        Object.assign({set:{SIS_HOT_WATER_BACK:'water'}},rel({comf:3,npcRom:1})),{end:true},
        {label:'b'},SIS('……我沒睡。我在想第二節。'),N('（她的臉上有一條袖子壓出來的印子。）'),{set:{SIS_HOT_WATER_BACK:'knock'}} ] },
    /* ---------- 第 4 節：2027-07-22（四）15:00 霖澤館研究室：外行人讀一章 ---------- */
    { id:'ev_sis_ch1_read', title:'外行人讀一章', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'法律系館A・研究室',bg:'dark'},
        N('（研究室只剩她一個人，冷氣很冷。她給你一份印好的稿子和一支鉛筆。）'),
        SIS('看不懂的地方畫線。不要客氣。'),
        N('（你讀了四十分鐘，畫了三條線。她一條一條看。）'),
        {choice:[{text:'「第二頁那段，我讀了三次。」',goto:'a'},{text:'「其他的都看得懂。」',goto:'b'}]},
        {label:'a'},SIS('……那段我也寫了三次。'),SIS('好。我知道問題在哪了。'),{goto:'c'},
        {label:'b'},SIS('看得懂不夠。……你想讀下去嗎？'),ME('想。'),SIS('好。'),
        {label:'c'},Object.assign({set:{SIS_CH1_READ:'went'}},rel({trust:2})) ],
      outingMissed:G=>{ const x=X(); if(x) x.missed(G,'ch1'); } } ];
})();
for(const e of SISB8_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
