/* ===== 學姊第十六批：回臺灣以後的最後半年（2028-12-24～2029-06-30）（AA_523，企劃線 0d7b5388b；任務 SIS-B16-1028、SIS-LEAD-1021、D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109）。接線在 src/sis_b16_3d.js。
   改在現有檔的句子、條件寫在各自的檔，那幾行都帶 aa523:true 或在註解寫「AA_523」（tests/aa523_sis_b16_unit.js 逐句對稿）：
     第 5 節：r2y4b_events.js（g6b、h9b、h3b、t7b 選的時候記 SIS16_G6B／_H9B／_H3B／SIS16_T7B）、r2y4a_events.js 12/23 接機（5-1 外套兩句、5-2 回程車上一句）、
       sis_b4_events.js 2/14 電話「開學以後，我們再補一天。」記 SIS_VDAY_MAKEUP、r3_3d.js 4/27 21:00 那則（有 SIS_VDAY_MAKEUP＝這裡的 dayOffMakeup 三句、直接排河堤）、
       postgrad_lines.js／postgrad3d.js 6/2（研究室生日「修正本我陪妳改。」記 SIS16_REV_PROMISE；保溫瓶那一段最後兩句＝這裡的 thermosPhoto）；
     第 6 節：tools/ladder/import_ladder.py→ladder.js（6-1、6-2、6-10）、heard_lines.js（6-3）、termend_lines.js（6-4、6-13）、tools/story/import_pg_dates.py→pg_dates.js（6-5）、
       events.js（6-6）、heroine_asks3d.js（6-7～6-9）、sis_b13_events.js（6-11）、sis_b12_events.js（6-12）、fest_events.js（6-14）、story3d.js talkSis 問這裡的 winterLine（6-15）、
       r3_events.js 書桌夜的旁白（七句輪流）、postgrad3d.js（3-3 生日的家族群組）。
   說話的人：她的 id（交往中 SOCIAL.displayName 自己會換成「書瑀」，AA_411 第 2 節）；家族的學妹＝family_junior「佳穎」（AA_497 第 8 節第 5 點）；Kevin 照 sis_b12／b15 寫 'Kevin'；
   2-3 碩一的學妹沒有名字＝speaker '學妹'（同 r3_events.js「她爸爸」的寫法）。 */
'use strict';
const SISB16_LINES={
  /* 1-2 1/19（五）21:00 私訊（回「好。」排出遊；「明天不行。」→ 她一句，不排、不補）*/
  boxAsk:['美國寄的箱子到了。','明天下午，來幫我拆。'], boxYes:'好。', boxNo:'明天不行。', boxNoRep:'好。我先拆一半。',
  /* 1-3 3/28～4/11 書桌夜都沒去：4/15（日）21:00 私訊（也記 SIS16_JOB_A）*/
  jobDm:['研究單位那邊回信了。七月二號報到。','……本來想在研究室跟你說。'],
  /* 1-4 5/11（五）21:00 私訊 */
  swimAsk:['明天早上七點，新體育館。','你不用下水。看台有位子。'], swimYes:'好。', swimNo:'明天不行。', swimNoRep:'好。',
  /* 1-5 6/4（一）21:00 私訊（照畢業以後篇的出遊排）；沒到＝6/5 23:00 一則 */
  revDm:['明天晚上七點，研究室。','修正本。你說要陪的。'], revMiss:'我自己刪完了。',
  /* 2-1 2/16（五）21:00 私訊（期限 2/19 21:00）；沒到＝2/21 12:00；3/15 以前沒找她還書＝3/15 21:00 */
  bookAsk:'你下學期要的書，還沒說。',
  bookOpts:[{k:true,t:'有一本，我找了很久。',r:'書名傳給我。……禮拜二五點，總圖門口。'},{k:false,t:'我自己借就好。',r:'好。'}],
  bookMiss:'書放在 Café 櫃台。說是學姊放的就好。',
  bookDue:'書。', bookDueOpt:'明天還。', bookDueRep:'好。',
  /* 2-4 6/22（五）22:00 私訊 */
  returnAsk:['明天早上十點，法圖。','我借的書要全部還掉。……一個人搬不動。'], returnYes:'好。', returnNo:'明天不行。', returnNoRep:'好。我分兩趟。',
  /* 2-5 12/25（一）14:00 私訊（期限當天 18:00）*/
  dayCall:'白天了。', dayCallGo:'（打過去）', dayCallLater:'晚一點打。', dayCallLaterRep:'好。',
  /* 第 3 節 家族群組（k＝Kevin、s＝學姊、j＝佳穎）*/
  postcard:[['k','📷（一張美國寄來的明信片，郵戳是十一月）'],['k','學姊的明信片到了！'],['k','人比明信片早到'],['s','寄的時候說要十天。'],['k','背面是一題民法'],['j','我還以為是問候'],['s','問候在正面。']],   /* 3-1 1/10（三）21:00 */
  visitAsk:[['k','禮拜四讀書會 學姊說她要來旁聽'],['k','佳穎說她不緊張'],['j','我沒有說']],   /* 3-2 前一則：3/20（二）20:30 */
  bdayCD:{t:'生日快樂。',r:'謝謝。'},   /* 3-3 6/2 Kevin 19:30 那則：C、D 收到、沒有出遊，只能在群組回這一句（postgrad3d.js S.kevinItems）*/
  workEve:[['k','學姊下禮拜一上班了'],['k','要穿什麼去'],['s','衣服。'],['j','學姊加油'],['s','嗯。'],['s','讀書會的白板，照樣傳。']],   /* 3-4 6/29（五）21:00 */
  /* 5-3 有 SIS_VDAY_MAKEUP 的 4/27 21:00（r3_3d.js S.dayOff 問 SISB16.dayOffMakeup；不給選項，直接排 4/28 河堤 10:00）*/
  dayOffMakeup:['明天我不寫論文。','……二月說好要補的那一天。我寫好了。','河堤，十點。我騎很慢。'],
  /* 5-4 階梯 S7-L2 選「那現在還好嗎？」（SIS7_ASK_LATER）：5/28（一）22:00 私訊（21:00 群組＋交往中的私訊之後）*/
  askLater:['明天口試。','……你可以問了。'],
  askLaterOpts:[{t:'現在還好嗎？',r:'不好。……比四月好。'},{t:'早點睡。',r:'嗯。'}],
  /* 5-5 階梯 S7-L8 選「一起參加典禮。」（SIS7_PHOTO）：6/2 保溫瓶那一段最後多兩句（postgrad3d.js S.thermos；寫法同 POSTGRAD_LINES：[說話的人, 句子]）*/
  thermosPhoto:[['heroine_05','（拿出手機）……拍照。說好的。'],[null,'（照片裡，你們兩個都穿著借來的衣服。）']],
  /* 6-15 大四寒假（2028-12-25～2029-02-18）找她說話（沒有閒聊階梯的時候）：六句輪流（story3d.js talkSis 問 SISB16.winterLine）*/
  winter:['寒假的研究室只有我。暖氣是我開的。','第四章還有三節。……還有兩節。','行李箱還沒收完。','法圖寒假開得很短。我改去總圖。','早上去游泳。這邊的水比較冷。','陳助教說我變黑了。……我在美國都在室內。'],
  /* 6-10 大四上招呼（ladder.js 的 base，tools/ladder/import_ladder.py 疊上去）：12/23 回來以後說新的那一句、以前說美國那一句（條件在 src/sis_b16_3d.js：STORY.LADDER_GREET_IF）*/
  greetUS:'（她把保溫瓶遞過來）熱水。這邊的飲水機只有冰的。', greetBack:'（她把保溫瓶遞過來）……回來了。這邊的飲水機有熱水。',
  /* AA_531 7-3（企劃線 475f55fe6）：挽回中的美國招呼（遞保溫瓶只給交往中；條件在 src/sis_b16_3d.js）*/
  greetUSRepair:'這邊的飲水機只有冰的。我自己帶。' };

const SISB16_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB16!=='undefined'?SISB16:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), KEV=t=>({speaker:'Kevin',text:t}), JUN=t=>({speaker:'family_junior',name:'佳穎',text:t}), JR=t=>({speaker:'學妹',text:t});
  const dt={custom:G=>!!X()&&X().dating(G)};   /* A：交往中 */
  const F1=f=>({flags:[f]});
  return [
    /* ---------- 1-1 12/24（日）12:00 公館的滷肉飯（A；12/23 接機選「先回家睡覺。」、12/24 11:00 收到「滷肉飯。今天。不要再說明天。」以後排；沒到＝不補）---------- */
    { id:'ev_sis16_lurou', title:'滷肉飯', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'公館・那家滷肉飯',bg:'gongguan'},   /* 稿：公館的店有就用，沒有用深色底——公館的滷肉飯沒有店內的圖：用公館的街（隊排到騎樓外面），子代理解讀 */
        N('（公館。中午的滷肉飯，隊排到騎樓外面。）'),
        SIS('（點完）大碗。……再一顆滷蛋。'),
        N('（她吃了一半，停下來。）'),
        SIS('在美國，我每個禮拜都想一次這一碗。'),
        SIS('……味道一樣。好。'),
        {choice:[{text:'「我的滷蛋給妳。」',goto:'a'},{text:'（看她吃）',goto:'b'}]},
        {label:'a'},SIS('（接過去）……我不客氣了。'),{goto:'e'},
        {label:'b'},N('（她把整碗吃完，湯也喝了。）'),
        {label:'e'},SIS('晚上六點半，法圖旁邊。……那頓我會少吃一點。'),
        {set:{SIS16_LUROU:true}} ] },
    /* ---------- 1-2 1/20（六）14:00 美國寄回來的最後一箱（A，三條路線；1/19 21:00 私訊回「好。」；她的新家＝12/31 咖哩那一張 sis_new_home）---------- */
    { id:'ev_sis16_box', title:'美國寄回來的最後一箱', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'學姊的新家',bg:'sis_new_home'},
        N('（她家的客廳。地上一個紙箱，貼滿了海關的單子。）'),
        SIS('海運。十月寄的，今天才到。'),
        N('（她用鑰匙劃開膠帶。最上面是一疊論文的影印資料，下面是那本在美國用的計畫本。）'),
        SIS('（翻到最後一頁）……這裡。'),
        N('（最後一格寫著「回臺灣」。）'),
        Object.assign({if:{custom:G=>!!X()&&X().planNote(G)==='exit'}},N('（旁邊多了一行小字，是後來補的：「出口有人。」）')),   /* 臺灣、日本路線，接機是戀人版 */
        Object.assign({if:{custom:G=>!!X()&&X().planNote(G)==='us'}},N('（旁邊多了一行小字，是後來補的：「旁邊的人睡得比我好。」）')),   /* 美國路線（同一班回來）；其他（接機沒到、兩個人版、家族共乘）沒有 */
        N('（箱子裡還有兩個馬克杯，上面印著那間圖書館的名字。）'),
        SIS('一個給你。……我買了兩個。'),
        {choice:[{text:'（收下）',goto:'a'},{text:'「Shu，謝謝。」',if:F1('SIS16_H3B'),goto:'b'}]},   /* h3b（美國視訊選「Shu 很好聽。」，r2y4b_events.js 記 SIS16_H3B）的玩家多一個選項 */
        {label:'a'},N('（杯子很重。她把另一個放進廚房的櫃子。）'),{goto:'e'},
        {label:'b'},SIS('……（她沒有抬頭。）只准在這個房間。'),{set:{SIS16_SHU:true}},
        {label:'e'},
        Object.assign({if:F1('SIS16_COAT')},N('（她從椅背上拿起一件外套。）')),   /* g6b「外套。」、12/23 接機時借給她的（第 5 節第 1 點記 SIS16_COAT）*/
        Object.assign({if:F1('SIS16_COAT')},SIS('你的。洗過了。')),
        SIS('箱子空了。……晚上吃什麼。'),
        {set:{SIS16_BOX:true}} ] },
    /* ---------- 1-3 研究單位回信了（A；ev_sis_y4_desks 3/28 那一晚 again 那一段的輪流旁白換成這一段，一次；3/28 沒去＝之後第一個有去的週三（到 4/11）照演。
         r3_events.js 的書桌夜問 SISB16.jobDue、用 call 接演這一筆（EVENTS.runLines；這一筆只放台詞，不會自己觸發）---------- */
    { id:'ev_sis16_job', title:'研究單位的回信', participants:[ID], location:'any', trigger:'manual', once:true,
      dialogue:[ N('（十一點。她的手停在鍵盤上，很久沒有動。第四章縮到螢幕旁邊，前面開著一封信。）'),
        SIS('研究單位那邊，下午回信了。'),
        SIS('七月二號報到。……口試完一個多月。'),
        {choice:[{text:'「恭喜。」',goto:'a'},{text:'「妳想去嗎？」',goto:'b'},{text:'（走過去看那封信）',goto:'c'}]},
        {label:'a'},SIS('嗯。……我還沒跟我爸說。'),{goto:'e'},
        {label:'b'},SIS('想。那邊在做的事，我的論文寫了一半。'),{goto:'e'},
        {label:'c'},N('（信不長。最後一行寫著：七月二日報到。）'),SIS('……你看完了。那我就不用唸給你聽。'),
        {label:'e'},SIS('論文還是要先寫完。'),
        N('（她把信關掉，第四章回到螢幕上。）'),
        {set:{SIS16_JOB_A:'desk'}} ] },
    /* ---------- 1-4 5/12（六）07:00 看她游泳，然後她家樓下的早餐店（A；5/11 21:00 私訊回「好。」）。
         新體育館游泳池沒有 2D 背景＝gym_pool（BB 跟使用者要圖；src/sis_b16_3d.js 登記 image:null＝深色底）；新體育館門口：P17 是 3D（blur），沒有 2D 的圖＝深色底＋地點字幕；早餐店用現成的豆漿店 ---------- */
    { id:'ev_sis16_swim', title:'看她游泳', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'新體育館・游泳池',bg:'gym_pool'},
        N('（新體育館的游泳池。看台上只有你一個人。）'),
        N('（她在第四水道。到牆邊碰一下，轉身，再出發。）'),
        N('（游到第八趟，她攀在池邊，摘下泳鏡往看台看了一眼。）'),
        SIS('（隔著水面）……你真的來了。'),
        N('（她又游了兩趟才上來。）'),
        {scene:'新體育館門口',bg:'dark'},
        N('（新體育館門口。她的頭髮還在滴水。）'),
        SIS('美國的池子五十公尺。這裡二十五。……轉身轉到頭暈。'),
        SIS('走。我家樓下那家早餐店。'),
        {scene:'她家樓下的早餐店',bg:'soymilk_shop'},
        N('（她家樓下的早餐店。老闆娘看到她，愣了一下：「好久沒來了。」）'),
        SIS('……半年。'),
        Object.assign({if:{custom:G=>!!X()&&X().day40Shop(G)}},SIS('在美國想到的就是這一家。')),   /* 美國路線、第四十天的私訊選「想什麼？」（她回「家裡樓下那家早餐店。……很奇怪，平常我都沒吃。」）*/
        Object.assign({if:{custom:G=>!!X()&&X().day40Shop(G)}},SIS('……現在補。')),
        {choice:[{text:'「妳游得很快。」',goto:'a'},{text:'「頭髮還在滴水。」',goto:'b'}]},
        {label:'a'},SIS('沒有。是池子短。'),{goto:'e'},
        {label:'b'},SIS('七點半要到研究室。乾不了。'),
        {label:'e'},
        Object.assign({if:F1('SIS16_JOB_A')},SIS('七月以後，早上要上班。……游泳要改到晚上了。')),
        Object.assign({unless:F1('SIS16_JOB_A')},SIS('七月要去上班了。研究單位。……游泳要改到晚上了。')),   /* 第 1-3 節三種都沒收到（正常不會發生）*/
        {set:{SIS16_SWIM_A:true}} ] },
    /* ---------- 1-5 6/5（二）19:00 修正本（A；6/2 研究室生日選「修正本我陪妳改。」SIS16_REV_PROMISE；6/4 21:00 私訊；研究室 linze_prof_hall；到 23:00）---------- */
    { id:'ev_sis16_rev', title:'修正本', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
      dialogue:[ {scene:'法律系館A・研究室',bg:'linze_prof_hall'},
        N('（研究室。桌上攤著口試委員的意見，紅筆、藍筆、黃色的便利貼。）'),
        SIS('指導教授說要刪二十頁。我找了一個禮拜，找到十八頁。'),
        SIS('剩下兩頁，你幫我找。你不懂財經法，所以你看得出來哪裡讀起來累。'),
        {choice:[{text:'「第三章比較的那一段。」',goto:'a'},{text:'「美國那一節。」',goto:'b'},{text:'「我看不出來。都很好。」',goto:'c'}]},
        {label:'a'},SIS('……那一段我最喜歡。（停了一下）好。刪。'),{goto:'e'},
        {label:'b'},SIS('那一節是在美國寫的。……你說得對，太長了。'),{goto:'e'},
        {label:'c'},SIS('這不算幫忙。……好，我自己來。'),N('（十分鐘後，她刪了兩頁。）'),   /* 稿同一行的括號是旁白（十分鐘以後的事）：分成兩行，字照稿 */
        {label:'e'},N('（十一點。檔案存好。右下角的頁數是 122。）'),
        SIS('一百二十二頁。……這禮拜印。'),
        {set:{SIS16_REV:true}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.revMissed(G,q); } },   /* 沒到＝6/5 23:00「我自己刪完了。」*/
    /* ---------- 2-1 2/20（二）17:00 總圖門口，下學期要的書（B、C：演過 12-7、沒交往、不是前任；2/16 21:00 私訊選「有一本，我找了很久。」）---------- */
    { id:'ev_sis16_book', title:'下學期要的書', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'總圖門口',bg:'library_gate_day'},
        N('（總圖門口。她把一本很厚的書遞過來，封底貼著借期。）'),
        SIS('法圖的。用我的證借的，研究生可以借比較久。'),
        SIS('三月十五號以前還。……我會記得。'),
        N('（她把手機的計畫本打開，在三月十五號那一格寫了一個字：書。）'),
        {call:G=>{ const x=X(); if(x) x.bookGot(G,'gate'); }} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.bookMissed(G,q); } },   /* 沒到＝2/21 12:00 書放在 Café 櫃台 */
    /* ---------- 2-2 3/3～3/24 週六 10:00～12:00 受訪阿姨的那一段（B；她週六上午在校園：這四個週六坐在傅鐘旁邊的長椅〔characters.js〕；走到她旁邊先演，一次）---------- */
    { id:'ev_sis16_reader', title:'受訪的阿姨', participants:[ID], location:'campus', trigger:'auto', once:true, weekday:[6], time:[10,12], near:{npc:ID,r:3}, background:'blur',
      prereq:{custom:G=>!!X()&&X().readerOk(G)},
      dialogue:[ N('（週六上午。她坐在晨思鐘旁邊的長椅，膝蓋上放著幾張印出來的紙，紅筆咬在嘴裡。）'),
        SIS('……你來得剛好。'),
        SIS('讀一段給我聽。不用懂法律。讀完告訴我，你覺得這個人是什麼樣的人。'),
        N('（那一段沒有名字。一個開了二十年早餐店的人，一張借據，一個她說「那時候不懂」的簽名。）'),
        {choice:[{text:'「很努力的人。」',goto:'a'},{text:'「被騙的人。」',goto:'b'},{text:'「她自己會怎麼說？」',goto:'c'}]},
        {label:'a'},SIS('嗯。……她自己也會這樣說。'),{goto:'e'},
        {label:'b'},SIS('（把紅筆拿下來）……這一段要再改。她不會說自己被騙。她會說「那時候不懂」。'),{goto:'e'},
        {label:'c'},SIS('「那時候不懂。」……所以那一句，我原封不動放進去了。'),
        {label:'e'},SIS('下禮拜寄給她。她說要看自己那一段。'),
        SIS('這一段我改了很久。一開始寫得像判決書。'),
        SIS('……你剛剛讀的，是不像判決書的那一版。'),
        {set:{SIS16_READER:true}} ] },
    /* ---------- 2-3 3/26～4/13 平日 17:00～17:30 總圖門口，碩一的學妹（B、C：熟悉以上、沒交往、不是前任；她現有的作息；第一次走過去先演，一次；4/16～27 是 P15）---------- */
    { id:'ev_sis16_junior', title:'碩一的學妹', participants:[ID], location:'campus', trigger:'auto', once:true, weekday:[1,2,3,4,5], time:[17,17.5], near:{npc:ID,r:4}, background:'blur',
      prereq:{custom:G=>!!X()&&X().juniorOk(G)},
      dialogue:[ N('（總圖門口。她身邊站著一個抱著一疊書的女生，一直點頭。）'),
        JR('所以第一章先寫問題，不要先寫文獻？'),
        SIS('先寫問題。文獻寫不完。'),
        JR('好！謝謝學姊！（跑走）'),
        SIS('（看到你）……碩一的。她每天來問一題。'),
        {choice:[{text:'「妳以前也這樣問人嗎？」',goto:'a'},{text:'「她很幸運。」',goto:'b'}]},
        {label:'a'},SIS('沒有。我都自己查。……查三天的東西，其實問一句就好。'),{goto:'e'},
        {label:'b'},SIS('……她問的問題都很好。是她自己想出來的。'),
        {label:'e'},SIS('七月以後，她要去問別人了。'),
        {set:{SIS16_JUNIOR:true}} ] },
    /* ---------- 2-4 6/23（六）10:00 法圖門口，還書（A、B；6/22 22:00 私訊回「好。」；畢業以後篇）---------- */
    { id:'ev_sis16_return', title:'還書', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'法圖門口',bg:'law_library_gate'},
        N('（法圖門口。一台推車，上面三疊書。）'),
        SIS('學位證書要拿，借的書要先還完。'),
        N('（還書機一本一本吃進去。最後一本她拿在手上沒有放。一本舊的民法總則，書角都磨圓了。）'),
        SIS('這本我大一就借了。續借到系統說不能再續，就還，再借回來。'),
        SIS('……（放進還書機）好了。'),
        N('（機器嗶了一聲。）'),
        SIS('七月以後，我就不是學生了。法圖要換證才進得來。'),
        Object.assign({if:dt},N('（走出法圖，她回頭看了一下門口。）')),   /* A 多 */
        Object.assign({if:dt},SIS('……走吧。今天沒有要寫的東西。')),
        Object.assign({unless:dt},SIS('謝謝。……這種事，不好意思找家族。')),   /* B 多 */
        {set:{SIS16_RETURN:true}} ] },
    /* ---------- 2-5 12/25（一）白天的電話（B，臺灣、日本路線，美國那一通選「那換我打給妳。」SIS16_T7B；12/25 14:00 私訊選「（打過去）」）---------- */
    { id:'ev_sis16_day_call', title:'白天的電話', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
      dialogue:[ {scene:'電話'},
        SIS('……喂。現在是白天。'),
        SIS('我的身體還在美國的晚上。所以是真的醒著。'),
        SIS('……好。說完了。') ] },   /* 通話多久稿沒寫：算 15 分鐘 */
    /* ---------- 3-2 3/22（四）19:00～21:00 家族讀書會：她去旁聽（在家族群組、見過她〔met_sis〕、不是前任；A、B、C、12/28 才認識的 D 都可以；
         走到法圖討論室 A 先演，一次；和 AA_518 第 2 節同一間、同一個時段；2D 法圖討論室＝AA_518 第 2 節那一張 law_library）---------- */
    { id:'ev_sis16_study_visit', title:'家族讀書會：學姊旁聽', participants:[ID], location:'lawlib', trigger:'auto', once:true, weekday:[4], time:[19,21], near:{npc:ID,r:4}, background:'blur',
      prereq:{custom:(G,GM)=>!!X()&&X().visitOk(G,GM)},
      dialogue:[ {scene:'法圖・討論室',bg:'law_library'},
        N('（法圖討論室。佳穎站在白板前面，學姊坐在最後一排靠門的位子。）'),
        N('（Kevin 坐第一排，桌上是一疊國考的考古題。）'),
        JUN('今天的題目……（看了最後一排一眼）……學姊，妳不要看我。'),
        SIS('我在看白板。'),
        N('（題目是她大三出過的那一題，換了一個人、改了一個數字。佳穎講到一半卡住，看向最後一排。學姊沒有說話，只是把筆放下。）'),
        N('（佳穎自己接下去了。）'),
        JUN('（散會的時候）學姊，剛剛那樣可以嗎？'),
        SIS('可以。……比我那時候講得清楚。'),
        SIS('Kevin。'),
        KEV('在！'),
        SIS('八月。'),
        KEV('……知道。'),
        N('（走出討論室，學姊走在你旁邊。）'),
        SIS('在美國，白板的照片她每個禮拜都傳。我每張都有看。'),
        {choice:[{text:'「妳有回她嗎？」',goto:'a'},{text:'「她講得很好。」',goto:'b'}]},
        {label:'a'},SIS('……沒有。今天來，就是回了。'),{goto:'e'},
        {label:'b'},SIS('嗯。你跟她說。她會比較相信你。'),
        {label:'e'},{set:{SIS16_STUDY_VISIT:true}},
        {call:G=>{ const x=X(); if(x) x.visitRel(G); }} ] },   /* 熟悉 +3、安心 +1；12/28 才認識的 D 演完到「熟悉」*/
    /* ---------- 3-3 6/2 13:00～14:30 椰林大道，典禮上看她一眼（C：熟悉、在家族群組、不是前任；朋友以上的有保溫瓶那一段；旁白一句，一次）---------- */
    { id:'ev_sis16_ceremony', title:'典禮的人群裡', participants:[ID], location:'campus', trigger:'auto', once:true, time:[13,14.5], background:'blur',
      prereq:{custom:(G,GM)=>!!X()&&X().ceremonyOk(G,GM)},
      dialogue:[ N('（人群裡，她穿著碩士服，和 Kevin、佳穎在拍照。她看到你，抬了一下手。）') ] },
    /* ---------- 4-1 2/19～3/2 平日 17:00～17:30 總圖門口，一次（R：前任、美國路線、12/23 回來時沒在交往；沒有在走「4-1 她要的時間」；不推挽回；關係不加不減）---------- */
    { id:'ev_sis16_ex_door', title:'時差', participants:[ID], location:'campus', trigger:'auto', once:true, weekday:[1,2,3,4,5], time:[17,17.5], near:{npc:ID,r:4}, background:'blur',
      prereq:{custom:G=>!!X()&&X().exDoorOk(G)},
      dialogue:[ N('（總圖門口。她從研究小間出來，看到你，在台階上停了一下。）'),
        SIS('……你的時差，調好了嗎。'),
        {choice:[{text:'「調好了。」',goto:'a'},{text:'「還沒。」',goto:'b'},{text:'（點頭）',goto:'c'}]},
        {label:'a'},SIS('嗯。……我凌晨三點還是會醒。'),{goto:'e'},
        {label:'b'},SIS('我也是。凌晨三點。'),{goto:'e'},
        {label:'c'},N('（她也點了一下頭。）'),
        {label:'e'},SIS('回來那班飛機，你睡得比我好。'),
        N('（她把圍巾拉高，往捷運站走了。）'),
        {set:{SIS16_EX_DOOR:true}} ],
      after:(G,GM,npcs)=>{ const n=npcs&&npcs[0]; if(n&&G.zone==='campus'){ n.beh='route'; n.waypoints=[[70,1.2]]; n.pauseAt=false; n.talk=null; if(GM.despawnLater) GM.despawnLater(n,6); } } } ];   /* 往捷運站（大道往西）走了（同 W1 演完她走進總圖的做法）*/
})();
for(const e of SISB16_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
