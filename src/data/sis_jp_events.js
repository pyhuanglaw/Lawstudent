/* ===== 學姊第七批：日本路線（AA_393，企劃線 SIS-B7-1023；任務 SIS-B7-L-1023）的台詞與事件 =====
   台詞照稿一字不改（D100、D109；不數件數 AA_398）。接線在 src/sis_jp3d.js。 */
'use strict';
const SISJP_LINES={
  /* 第 1 節：3/22 21:00 提示、3/24 09:00 沒去的照片 */
  hint:'明天晚上我在 Café。你禮拜六走，對吧。',
  notePhoto:['📷（一張手寫的便條：那邊三月還冷。外套不要收進行李箱最下面。）','昨天沒遇到。照片也算。'],
  /* 第 2 節：在日本的四個多月，她兩週一則（臺灣週一 20:00） */
  msgs:[{day:'2028-04-03',L:['（照片：Café 的熱水壺）','換新的了。按一次就出水。']},
    {day:'2028-04-17',L:['（照片：電腦螢幕，論文第三章，第一頁）','第三章。……說好拍給你看。']}   /* AA_508 0-2 第 3 點（31a4c4002）：對齊 S6-L2（第二章旁邊「好」）和 AA_258（2029 年還在寫第三章）*/,
    {day:'2028-05-01',L:['（照片：椰影大道，杜鵑已經謝了，只剩葉子）','杜鵑謝了。你那邊的櫻花也謝了吧。']},
    {day:'2028-05-15',L:['（照片：研究室桌上一盒抹茶餅乾）','學妹從京都帶回來的。看到京都兩個字，就想到你在那邊。']},
    {day:'2028-05-29',L:['（照片：法圖討論室的白板，寫滿了字）','讀書會還在。Kevin 說要讀到考前一個月。']},   /* AA_490 4-2（企劃線 a4f530c11）：只換第二句（原句「讀書會還在，柏翰在帶。……他比我凶。」和 12-4、12-6 對不上：家族讀書會是她帶、柏翰不在直屬家族）；照片照舊。
       AA_539 1-5（企劃線 c9f6dd6cb）：讀書會最後一次是 7/13、國考是 8/26，AA_490 的「Kevin 說考完國考才算結束。」再換成這一句 */
    {day:'2028-06-12',L:['（照片：期末考週的總圖門口，一整排機車）','你們期末考週。你不在，總圖一樣擠。']},
    {day:'2028-06-26',L:['（照片：計畫本七月那一頁，排得很滿）','七月排滿了。八月二號那一格，只寫了一個『走』。']},
    {day:'2028-07-10',L:['（照片：研究小間的窗，外面是午後的雷陣雨）','七月每天三點下雨。第三章寫到一半。'],tag:'sisjp_m_0710'},   /* AA_470 4-5：6/26 和 7/24 之間空了四週；tag 另外取（後面那一則照舊 sisjp_m_7，舊存檔傳過的不會再傳）*/
    {day:'2028-07-24',L:['（照片：打開的行李箱，裡面只有一件外套）','收了三天。只收了一件。'],tag:'sisjp_m_7'}],
  /* 第 3 節：7/31 21:00 約、8/1 視訊；「可能在外面」＝8/1 21:00 文字版；沒接＝21:20 */
  eveAsk:'明天晚上九點，視訊。你那邊十點。', eveYes:'好。', eveNoT:'我那天可能在外面。', eveNo:'好。那我傳訊息。',
  eveText:['好。我要去把第三箱收完。','📷（行李箱，上面放著那件外套）'], eveMissed:'明天早上的飛機。十二月見。',
  /* 第 5 節：交往中四組視訊沒接 */
  vMissed:'你在忙。下次。' };

const SISJP_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISJP!=='undefined'?SISJP:null;
  const dt={custom:G=>!!X()&&X().dating(G)}, SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t});
  const E=[
    /* ---------- 第 1 節：2028-03-23（四）19:30～21:30 兩點半 Café，說話前接演（SISJP.preTalk）---------- */
    { id:'ev_sis_jp_note', title:'出發前一晚以前', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她坐在窗邊的老位子。桌上除了筆電，還有一張已經寫好的便條。）'),
        SIS('明天是以安的餞行，我知道。所以今天。'),
        N('（她把便條推過來。）'),
        {unless:dt,speaker:null,text:'（便條只有一句：「那邊三月還冷。外套不要收進行李箱最下面。」）'},
        {if:dt,speaker:null,text:'（便條只有一句：「那邊三月還冷。外套我放了一件在你背包裡，不要問。」）'},
        SIS('到了在群組說一聲。'),
        SIS('……我四月中寫到第三章，拍給你看。這是我自己要做到的。'),   /* AA_509 0-2 第 1 點（691a26400）：大三下在寫第三章（4/17 照片第三章第一頁）*/
        {choice:[{text:'「寫不完呢？」',goto:'a'},{text:'「妳也要照顧自己。」',goto:'b'}]},
        {label:'a'},SIS('寫不完你會知道，因為我不會拍。'),{goto:'c'},
        {label:'b'},SIS('我在臺灣。……要照顧自己的是你。'),
        {label:'c'},{if:dt,speaker:null,text:'（走到路口，她把你的圍巾拉好，才轉身走。）'},
        N('（九點半，她把筆電闔上。）'),
        SIS('走吧。我也要回去了。'),
        {if:dt,set:{SIS_JP_NOTE_GF:true}},
        {set:{SIS_JP_NOTE:true},consequences:{rel:{[ID]:{fam:2,comf:2}}}} ] },
    /* ---------- 第 3 節：2028-08-01（二）21:00 臺灣／22:00 日本，她出發前一晚的視訊 ---------- */
    { id:'ev_sis_jp_eve', title:'錯開的三天', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'視訊',bg:'video'},
        N('（她背後是打包到一半的房間，床上攤著兩個行李箱。）'),
        SIS('明天早上的飛機。'),
        SIS('你五號回來，我二號走。錯開三天。'),
        {if:dt,speaker:ID,text:'……我算過了。晚一個禮拜走，就碰得到。'},
        {if:dt,speaker:ID,text:'可是論文的時間是排好的。我不想改。'},
        {choice:[{text:'「十二月見。」',goto:'a'},{text:'「到了傳訊息給我。」',goto:'b'},{text:'「行李收完了嗎？」',goto:'c'},{text:'「我知道。」',if:dt,goto:'d'}]},
        {label:'a'},SIS('十二月二十三號。……到時候群組會說。'),{goto:'e'},
        {label:'b'},SIS('會。群組先，然後你。'),{goto:'e'},
        {label:'c'},SIS('收了兩箱。第三箱是書，我還在想要帶哪幾本。'),{goto:'e'},
        {label:'d'},SIS('嗯。……謝謝你知道。'),
        {label:'e'},SIS('好。我要去把第三箱收完。'),
        N('（她關掉視訊以前，又把鏡頭轉到行李箱上，讓你看了一眼。上面放著那件外套。）'),
        {set:{SIS_JP_EVE:'video'},consequences:{rel:{[ID]:{fam:1,comf:2}}}},
        {if:dt,consequences:{rel:{[ID]:{npcRom:2}}}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.eveMissed(G,q); } },
    /* ---------- 第 5 節：交往中四組視訊（臺灣週日 21:00／日本 22:00；4/9、5/7、6/18、7/16）---------- */
    { id:'ev_sis_jp_video', title:'視訊', participants:[ID], location:'any', trigger:'outing', background:'dark', hours:0.5,
      dialogue:[ {scene:'視訊',bg:'video'},
        {if:{custom:G=>!!X()&&X().vSet(G)===1},goto:'j2'},{if:{custom:G=>!!X()&&X().vSet(G)===2},goto:'j3'},{if:{custom:G=>!!X()&&X().vSet(G)===3},goto:'j4'},
        SIS('你房間給我看。'),N('（你把手機轉一圈。）'),SIS('……比你宿舍乾淨。'),
        {choice:[{text:'「剛整理過。」',goto:'j1a'},{text:'「日本的房間都這樣。」',goto:'j1b'}]},
        {label:'j1a'},SIS('為了視訊整理的。我看得出來。'),{goto:'end'},
        {label:'j1b'},SIS('那我也想住日本的房間。'),{goto:'end'},
        {label:'j2'},SIS('第三章被教授退回來一半。'),SIS('我沒有難過。……有一點。'),
        {choice:[{text:'「哪一半？」',goto:'j2a'},{text:'（陪她安靜一下）',goto:'j2b'}]},
        {label:'j2a'},SIS('後半。他說太像在說服自己。……他說得對。'),{goto:'end'},
        {label:'j2b'},N('（你們都沒有說話。她那邊的電風扇在轉。）'),SIS('好了。我去改。'),{goto:'end'},
        {label:'j3'},SIS('以安說你們上個週末去奈良。群組有照片。'),SIS('鹿有沒有咬你。'),
        {choice:[{text:'「咬了一口外套。」',goto:'j3a'},{text:'「沒有，牠們很乖。」',goto:'j3b'}]},
        {label:'j3a'},{unless:{flags:['SIS_JP_NOTE_GF']},speaker:ID,text:'外套還好嗎。'},{unless:{flags:['SIS_JP_NOTE_GF']},goto:'end'},
        {set:{SIS_JP_COAT:true}},   /* AA_512 6-1（企劃線 c444f0757）：交往版便條＋「咬了一口外套。」＝12/23 接機戀人版看袖口（r2y4a_events.js ev_sis_pickup (a)）*/
        SIS('……那件外套？'),{speaker:'player',text:'那件。'},SIS('回來我看一下。'),{goto:'end'},
        {label:'j3b'},SIS('照片裡那隻看起來不乖。'),{goto:'end'},
        {label:'j4'},SIS('我在想，十二月回來要先吃什麼。'),SIS('你推薦一家。'),
        {choice:[{text:'「麵店。」',set:{SIS_JP_FIRST:'noodle'},goto:'j4a'},{text:'「妳決定。」',set:{SIS_JP_FIRST:'secret'},goto:'j4b'}]},   /* AA_512 6-1：記 SIS_JP_FIRST（12/23 接機戀人版 (b)(c)）*/
        {label:'j4a'},SIS('好。第一天就去。'),{goto:'end'},
        {label:'j4b'},SIS('那我十二月再告訴你。……先保密。'),
        {label:'end'},{consequences:{rel:{[ID]:{comf:2,npcRom:1}}}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.vMissed(G,q); } } ];
  return E;
})();
for(const e of SISJP_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
