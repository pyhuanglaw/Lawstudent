/* ===== 學姊第十批：交往中的跨年、除夕；前任；畢業以後的朋友（AA_396，企劃線 e81a1afe1；任務 SIS-B10-L-1023）的台詞與事件 =====
   台詞照稿一字不改（D100、D109；不數件數 AA_398）。接線在 src/sis_b10_3d.js。 */
'use strict';
const SISB10_LINES={
  /* 第 1 節：交往中的跨年——私訊、選項、她的回覆；k＝date（去找她）／roof（頂樓＋零點電話）*/
  nye:{2:{nye:'2026-12-31',ask:'2026-12-24',L:['三十一號晚上，你有事嗎。'],opts:[{t:'阿哲他們揪頂樓。',k:'roof',r:'好。那你去。零點我打給你。'},{t:'沒有。',k:'date',r:'十一點半，醉月湖。人比較少。'}],
      out:{h:23.5,place:'醉月湖',title:'跨年：醉月湖',travel:'走路 約 10 分鐘',travelH:1/6}},
    3:{nye:'2027-12-31',ask:'2027-12-24',L:['三十一號我要寫交換的讀書計畫，會寫到很晚。','……十一點以後有空。'],opts:[{t:'我去頂樓。妳寫完打給我。',k:'roof',r:'好。'},{t:'我去找妳。',k:'date',r:'十一點十五分，總圖前面。'}],
      out:{h:23.25,place:'總圖前',title:'跨年：總圖前',travel:'走路 約 10 分鐘',travelH:1/6}},
    4:{nye:'2028-12-31',ask:'2028-12-26',L:['三十一號，我時差應該調好了。','……應該。'],opts:[{t:'我去頂樓。零點打給妳。',k:'roof',r:'好。我會醒著。'},{t:'我去妳家附近找妳。',k:'date',r:'十一點四十，巷口的便利商店。我傳位置給你。'}],
      out:{h:23+40/60,place:'學姊家的巷口',title:'跨年：學姊家的巷口',travel:'捷運 約 30 分鐘',travelH:0.5}}},
  nyeCallMissed:'新年快樂。', nyeDateMissed:['新年快樂。……我先回去了。'],
  /* 第 2 節：除夕 21:30 的電話；沒接 21:40 */
  cnyMissed:['新年快樂。……我先進去了。'],
  /* 第 3 節 3-4：2028-08-01 21:00（前任）*/
  exLast:{L:['明天走了。','……你也保重。'],opts:[{t:'一路順風。',r:'謝謝。'},{t:'到了說一聲。',r:'群組會說。'}]} };

const SISB10_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB10!=='undefined'?SISB10:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const rel=o=>({consequences:{rel:{[ID]:o}}});
  const C=f=>({custom:G=>!!X()&&f(G,X())});
  return [
    /* ---------- 1-1 大二 2026-12-31 23:30 醉月湖 ---------- */
    { id:'ev_sis_nye_y2', title:'跨年：醉月湖', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.75,
      dialogue:[ {scene:'醉月湖',bg:'zuiyue_night'},
        N('（湖邊沒有幾個人。遠遠的，聽得到椰林大道那邊有人在倒數。）'),
        SIS('我每年這時候都在家，寫明年的計畫本。'),SIS('今年寫到一半就出來了。'),
        {choice:[{text:'「寫到哪裡？」',set:{SIS_NYE_PLAN_Q:true},goto:'a'},{text:'（陪她看湖）',goto:'b'}]},   /* AA_512 第 2 節第 8 點：記 SIS_NYE_PLAN_Q（2029-01-31「明天二月了。」兌現，src/sis_b13_3d.js S.feb）*/
        {label:'a'},SIS('一月。……二月以後，等你一起排。'),{goto:'c'},
        {label:'b'},N('（湖心亭的燈映在水上。她把手放進你外套的口袋。）'),
        {label:'c'},N('（遠處有人在喊「新年快樂」。她看了一下手機的時間，才開口。）'),SIS('新年快樂。'),
        {set:{SIS_NYE_DONE:2}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.nyeDateMissed(G,2,q); } },
    /* ---------- 1-2 大三 2027-12-31 23:15 總圖前 ---------- */
    { id:'ev_sis_nye_y3', title:'跨年：總圖前', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.75,
      dialogue:[ {scene:'總圖・門口',bg:'ntu_library_night'},
        N('（總圖的燈已經關了，只剩門口那兩盞。她穿著很厚的外套，手上拿著一杯便利商店的熱飲。）'),
        SIS('讀書計畫寫完了。英文的。'),SIS('寫到最後一段，要寫為什麼想去。……那段寫了很久。'),
        {choice:[{text:'「寫了什麼？」',goto:'a'},{text:'「寄出去了嗎？」',goto:'b'}]},
        {label:'a'},SIS('不告訴你。'),SIS('……寫完了，就不想再看一次。'),{goto:'c'},
        {label:'b'},SIS('還沒。十一點五十九分寄。'),SIS('……我想讓它是今年的事。'),
        {label:'c'},N('（椰林大道那頭，有人在放仙女棒。）'),SIS('新年快樂。'),N('（她把熱飲換到另一隻手，空出來的那隻，放進你的手裡。）'),
        {set:{SIS_NYE_DONE:3}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.nyeDateMissed(G,3,q); } },
    /* ---------- 1-3 大四 2028-12-31 23:40 她家的巷口 ---------- */
    { id:'ev_sis_nye_y4', title:'跨年：學姊家的巷口', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:0.75,
      dialogue:[ {scene:'巷口的便利商店前',bg:'alley_conv_night'},
        N('（她穿著睡衣，外面套了一件很厚的外套。）'),
        SIS('我十點就睡著了。鬧鐘設十一點半。'),SIS('……時差沒有調好。'),
        {choice:[{text:'「要不要回去睡？」',goto:'a'},{text:'「那件外套好醜。」',goto:'b'}]},
        {label:'a'},SIS('不要。……十二點過了再睡。'),{goto:'c'},
        {label:'b'},{if:C(G=>G.flags.SIS_MAPLE_MSG==='cold'),speaker:ID,text:'我說過很醜。'},{if:C(G=>G.flags.SIS_MAPLE_MSG==='cold'),speaker:ID,text:'……很暖。'},
        {unless:C(G=>G.flags.SIS_MAPLE_MSG==='cold'),speaker:ID,text:'美國買的。……很暖，所以醜一點沒關係。'},
        {label:'c'},N('（樓上有一戶人家的電視在倒數。她跟著小聲數，數到一，抬頭看你。）'),
        {unless:C((G,x)=>x.route(G)==='US'),speaker:ID,text:'新年快樂。……今年在同一個時區了。'},{if:C((G,x)=>x.route(G)==='US'),speaker:ID,text:'新年快樂。……臺灣比較暖。'},
        {set:{SIS_NYE_DONE:4}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.nyeDateMissed(G,4,q); } },
    /* ---------- 第 1 節 零點電話（選頂樓的；大四是祐廷打過去）---------- */
    { id:'ev_sis_nye_call', title:'零點的電話', participants:[ID], location:'any', trigger:'outing', background:'dark', hours:0.1,
      dialogue:[ {scene:'電話'},
        {if:C((G,x)=>x.callYear(G)===2),goto:'y2'},{if:C((G,x)=>x.callYear(G)===3),goto:'y3'},
        SIS('……喂。我醒著。'),SIS('新年快樂。你們那邊好吵。好，你回去。'),{goto:'e'},
        {label:'y2'},SIS('新年快樂。……你們那邊好吵。'),SIS('我在寫明年的計畫本。好，你回去。'),{goto:'e'},
        {label:'y3'},SIS('新年快樂。讀書計畫寄出去了。'),SIS('……十一點五十九分寄的。'),
        {label:'e'} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.nyeCallMissed(G,q); } },
    /* ---------- 第 2 節：交往中的除夕電話（21:30）---------- */
    { id:'ev_sis_cny_call', title:'除夕的電話', participants:[ID], location:'any', trigger:'outing', background:'dark', hours:0.25,
      dialogue:[ {scene:'電話'},
        {if:C((G,x)=>x.cnyYear(G)===2028),goto:'y28'},{if:C((G,x)=>x.cnyYear(G)===2029),goto:'y29'},
        SIS('我在陽台。裡面在打麻將，我被趕出來了。'),SIS('……我不會打，只會算台。他們說我算太快，不好玩。'),
        {choice:[{text:'「妳家幾個人？」',goto:'a27'},{text:'「新年快樂。」',goto:'b27'}]},
        {label:'a27'},SIS('十二個。今年多一個，表姊的小孩。……一直哭。'),{goto:'e27'},
        {label:'b27'},SIS('還沒到十二點。'),SIS('……好，新年快樂。'),
        {label:'e27'},SIS('我進去了。我媽在叫。'),{goto:'end'},
        {label:'y28'},SIS('我媽問我，如果去交換，過年回不回來。'),SIS('我說十二月就回來了。她算了一下，說那就好。'),   /* 3/15 才放榜，這時候說的是「如果」（AA_396 2-2）*/
        {choice:[{text:'「我也算過了。」',goto:'a28'},{text:'「妳會想家嗎？」',set:{SIS_ASKED_HOME_CNY:true},goto:'b28'}]},   /* AA_512 第 2 節第 6 點（稿寫「醉月湖那場」，這一句實際在 2028 除夕的電話）：記 SIS_ASKED_HOME_CNY，第四十天那一週的視訊開頭兌現（r2y4b_events.js）*/
        {label:'a28'},SIS('……你算了什麼。'),ME('十二月二十三號。'),SIS('嗯。我也是算這一天。'),{goto:'end'},
        {label:'b28'},SIS('不知道。我沒有離開這麼久過。'),SIS('……到時候再告訴你。'),{goto:'end'},
        {label:'y29'},SIS('（照片：一盤水餃）'),SIS('我包的。'),SIS('……最醜的那顆是我包的。不用找，你看得出來。'),
        {choice:[{text:'「最左邊那顆？」',goto:'a29'},{text:'「看起來都一樣。」',goto:'b29'}]},
        {label:'a29'},SIS('……你看得出來。'),{goto:'e29'},
        {label:'b29'},SIS('你在說謊。……謝謝。'),
        {label:'e29'},SIS('明年，你來包一顆。'),
        {label:'end'},rel({comf:1,npcRom:1}) ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.cnyMissed(G,q); } },
    /* ---------- 第 3 節：前任（四場；3-4 是私訊）---------- */
    { id:'ev_sis_ex_1', title:'還東西', participants:[ID], location:'lawlib', trigger:'manual', once:true, background:'blur',
      dialogue:[ {scene:'法圖・二樓',bg:'law_library'},
        N('（她看到你，停了一下，從包包拿出一個牛皮紙袋。）'),SIS('你的東西。一直在我那裡。'),N('（紙袋裡是你的筆記本，還有一支你以為弄丟的筆。）'),
        {choice:[{text:'「謝謝。」',goto:'a'},{text:'「妳最近好嗎？」',goto:'b'}]},
        {label:'a'},SIS('嗯。'),{goto:'c'},
        {label:'b'},SIS('在寫論文。'),SIS('……你也好好念。'),
        {label:'c'},N('（她回到自己的位子。整個晚上，她沒有再抬頭。）') ] },
    { id:'ev_sis_ex_2', title:'Café 的椅子', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ {scene:'兩點半 Café',bg:'cafe_night'},
        N('（她在老位子。對面的椅子上放著她的包包。）'),N('（她看到你，點了一下頭。包包沒有拿起來。）'),
        {choice:[{text:'（坐到吧檯）',goto:'a'},{text:'（走過去打招呼）',goto:'b'}]},
        {label:'a'},N('（你在吧檯坐了一個小時。十點，她收好書，經過你旁邊。）'),SIS('……回去小心。'),{goto:'c'},
        {label:'b'},SIS('嗯。我在趕一章。'),N('（你回到吧檯。十點，她先走了。）'),
        {label:'c'},{set:{SIS_EX_CAFE:true}} ] },
    { id:'ev_sis_ex_3', title:'樓梯間', participants:[ID], location:'linze', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她從樓上下來，抱著一疊影印稿。看到你，腳步慢了一點。）'),SIS('……最近好嗎。'),
        {choice:[{text:'「還好。」',goto:'a'},{text:'「不太好。」',goto:'b'}]},
        {label:'a'},SIS('嗯。那就好。'),{goto:'c'},
        {label:'b'},N('（她停了一下。）'),SIS('要吃飯，要睡覺。'),SIS('……不要學我以前那樣。'),
        {label:'c'},N('（她往下走。到轉角的時候，回頭看了一下，沒有說話。）') ] },
    /* ---------- 第 4 節：畢業以後的朋友，每季一次 Café（說話前接演）---------- */
    { id:'ev_sis_pg_q1', title:'上班三個月', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她換了一個新的包包。筆電旁邊放著一張識別證，背面朝上。）'),SIS('你也還在來。'),SIS('上班以後，晚上反而比較有時間。……很奇怪。'),
        {choice:[{text:'「工作還好嗎？」',goto:'a'},{text:'「計畫本還在用嗎？」',goto:'b'}]},
        {label:'a'},SIS('每天都在寫報告，寫為什麼有人找不到律師。'),SIS('……寫完會有人看。這一點跟論文不一樣。'),{goto:'c'},
        {label:'b'},N('（她從包包拿出來，翻到十月。週末的格子都是空的。）'),SIS('週末我不排了。……在試。'),
        {label:'c'},SIS('好。我把這段看完。你坐。'),Object.assign({set:{SIS_PG_Q:1}},rel({fam:1,comf:1})) ] },
    { id:'ev_sis_pg_q2', title:'雨天', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（外面在下雨。她的桌腳靠著兩把傘。）'),
        {if:{flagIs:{SIS_Y3S2_RAIN:'buy'}},speaker:ID,text:'我現在都帶兩把。……說過的。'},
        {if:{flagIs:{SIS_Y3S2_RAIN:'share'}},speaker:ID,text:'今天這一頁我有看。……寫的是「Café，帶傘」。'},
        {unless:C(G=>!!G.flags.SIS_Y3S2_RAIN),speaker:ID,text:'下雨天，這裡人比較少。'},
        {choice:[{text:'「過年回家嗎？」',goto:'a'},{text:'「最近累嗎？」',goto:'b'}]},
        {label:'a'},SIS('回。我媽說今年要我包水餃。'),SIS('……我包得很醜。'),{goto:'c'},
        {label:'b'},SIS('十二月結案，很累。一月比較好。'),
        {label:'c'},Object.assign({set:{SIS_PG_Q:2}},rel({fam:1,comf:1})) ] },
    { id:'ev_sis_pg_q3', title:'改別人的報告', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她在改一份東西。紅筆。不是她的字。）'),SIS('單位裡來了一個新人。他的報告我在改。'),SIS('……我以前改你的筆記，你是不是很討厭。'),
        {choice:[{text:'「有一點。」',goto:'a'},{text:'「沒有，很有用。」',goto:'b'}]},
        {label:'a'},SIS('嗯。'),SIS('……現在改他的，我改得比較少。'),{goto:'c'},
        {label:'b'},SIS('那我以前改太少了。'),
        {label:'c'},Object.assign({set:{SIS_PG_Q:3}},rel({fam:1,comf:1})) ] },
    { id:'ev_sis_pg_q4', title:'熱水', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（Café 的熱水壺又換了一個。她倒了兩杯，推一杯過來。）'),SIS('熱水。不是咖啡。'),SIS('你們畢業一年多了。我每次來，都還是坐這裡。'),
        {choice:[{text:'「下次換個位子？」',goto:'a'},{text:'（坐下）',goto:'b'}]},
        {label:'a'},SIS('不要。這個位子看得到門口。'),{goto:'c'},
        {label:'b'},N('（你們坐到十點。她先收好書，等你收完才一起走。）'),
        {label:'c'},Object.assign({set:{SIS_PG_Q:4}},rel({fam:1,comf:1})) ] } ];
})();
for(const e of SISB10_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
