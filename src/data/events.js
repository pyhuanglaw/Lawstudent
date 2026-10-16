/* ===== STORY EVENT DATA PACK v1（schema 見 STORY_EVENT_SCHEMA.md）
   trigger: 'auto'（條件成立且玩家在 near 範圍）/ 'interact'（與 participants[0] 對話時）/ 'enter'（進入區域時）
   對話行：{speaker, text, expression, position} / {choice:[{text,hint,consequences,goto,next,set,mem,rel,choiceKey,value}]} / {legal:{context,by,pick|qid,chorus}} / {label} / {goto} / {if} / {set,mem,rel,note,advance}
   所有人物與故事皆為虛構。 ===== */
'use strict';
/* 群戲「只有認識的人在場」（交接包 v1 交付清單第 0 節第 1 點）：if:EV_KNOWS('id')／if:EV_KNOWS('a','b')＝都認識了（STORY.knows：FIRST_MET；小語 met_yu；阿哲開場就熟）*/
const EV_KNOWS=(...ids)=>({custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G))});
/* 小語 語 2 的最後一個徵兆（交接包 v2 C18、AA_40 語 2 的表）：吉他社的社課後、麵店散場後的騎樓兩個地方共用同一段 */
const YU2_Q=arcade=>[ {speaker:'yu',expression:'neutral',text:'欸，阿哲是不是對每個人都這麼好？'},
  {choice:[{text:'「對每個人都好。」',set:{YU2_PICK:'everyone'},goto:'a'},{text:'「對妳比較好。」',set:{YU2_PICK:'you'},goto:'b'},{text:'「妳自己問他。」',set:{YU2_PICK:'ask'},goto:'c'}]},
  {label:'a'},{speaker:'yu',expression:'neutral',text:'……喔。'},{speaker:null,text:arcade?'她低頭滑手機。':'她低頭調弦。'},{speaker:'yu',expression:'neutral',text:'也是啦。'},{goto:'end'},
  {label:'b'},{speaker:null,text:arcade?'她停住，然後很大聲地哼了一段成發要彈的旋律。':'她停住，然後很大聲地彈了一個和弦。'},{speaker:'yu',expression:'embarrassed',text:'欸你很煩！'},{goto:'end'},
  {label:'c'},{speaker:'yu',expression:'neutral',text:'我才不要。'},{speaker:null,text:'她想了一下。'},{speaker:'yu',expression:'smile',text:'……好啦，我會問。'},
  {label:'end'},{mem:[{npc:'yu',tag:'ASKED_ABOUT_ZHE',note:'她問：阿哲是不是對每個人都這麼好？'}]} ];
const YU2_QUESTION=YU2_Q(false);   /* 騎樓版她沒有背吉他（AA 50da3a9）：「調弦」換成「滑手機」、「彈了一個和弦」換成「哼了一段成發要彈的旋律」，台詞不變 */
/* 重訪日 1 的選項（交接包 v2 C20 第 3 節的表）：只從玩家真的經歷過的事裡出，最多三個（照表的順序），再加一個一定有的「每天都差不多。可是我很喜歡。」
   那場演講（C13 的 B4）、成發拍手（BB_96 Q5 的 CLAPPED）還沒做：做的時候記 B4_ATTENDED、CLAPPED，這裡就會出現 */
const REVISIT_Y1_OPTS=[
  {k:'retake',t:'「重修的第一堂，坐回同一間教室。」',ok:G=>{ const A=G.courses&&G.courses.attend||{}; return ((A.econ_principles_1|0)+(A.econ_principles_2|0))>0; }},
  {k:'bbq',t:'「中秋烤肉，借來的烤肉架。」',ok:G=>!!(G.events&&G.events.done&&G.events.done.ev_mid_autumn_bbq)},
  {k:'noodle',t:'「麵店的第一碗。」',ok:G=>G.flags.noodleTableDay!=null||(Array.isArray(G.flags.ndlDays)&&G.flags.ndlDays.length>0)},
  {k:'appeal',t:'「幫以安室友寫申訴。」',ok:G=>!!G.flags.AN_APPEAL},
  {k:'rain',t:'「那天下雨，總圖門口。」',ok:G=>G.flags.rain_umbrella!=null},
  {k:'lecture',t:'「那場演講。」',ok:G=>!!G.flags.B4_ATTENDED||(typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attended&&ACTIVITIES.attended(G,'B4'))},   /* AA_140 G49：看出席紀錄（坐著聽到結束、沒選「聽演講」的也算聽完）*/
  {k:'show',t:'「成發那天，我負責拍手。」',ok:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','CLAPPED')} ];
const REVISIT_Y1_SHOWN=G=>REVISIT_Y1_OPTS.filter(o=>o.ok(G)).slice(0,3).map(o=>o.k);
/* 學姊 W5（BB_96 2-6）：法服讀書會去過 3 次以上、還沒演過（兩個版本共用一次）；後半段兩個版本相同 */
const W5_OK=G=>{ const A=G.acts&&G.acts.att||{}; const n=Object.keys(A).filter(k=>k.indexOf('lawclub_study@')===0).length; const D=G.events&&G.events.done||{}; return n>=3&&!D.ev_sis_sticky_notes&&!D.ev_sis_sticky_notes_late; };
const W5_REST=[ {speaker:null,text:'會後你回萬才館拿忘記的東西，看到她一個人坐著，在每份書狀上貼便條。'},
  {speaker:null,text:'（你的書狀上：「第三段的事實整理很好。我剛剛沒說。」）'},
  {speaker:'heroine_05',expression:'serious',text:'（沒有抬頭）檢討會上講缺點，便條上講優點。'},
  {speaker:'heroine_05',expression:'neutral',text:'缺點要在大家面前講，大家才會改。'},
  {speaker:'heroine_05',expression:'neutral',text:'優點要私下講，才不會被當成客套。'},
  {speaker:'heroine_05',expression:'thinking',text:'……我以前的學姊也是這樣對我。'},
  {choice:[{text:'「學姊，有沒有人給妳便條？」',goto:'q'},{text:'（撕一張她的便條紙，寫了貼在她的筆記本上）',goto:'w'},{text:'「謝謝學姊。」（拿了書狀就走）',goto:'t'}]},
  {label:'q'},{speaker:null,text:'她停下筆。'},{speaker:'heroine_05',expression:'neutral',text:'……社長沒有人改。'},{speaker:null,text:'她笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'重點是，這樣比較快。'},
    {mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'問她有沒有人給她便條'}]},{goto:'end'},
  {label:'w'},{choice:[{text:'「今天的檢討很清楚。我剛剛沒說。」',set:{W5_NOTE:'clear'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：今天的檢討很清楚。我剛剛沒說。'}]},
      {text:'「學姊辛苦了。」',set:{W5_NOTE:'thanks'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：學姊辛苦了。'}]},
      {text:'（畫一個笑臉）',set:{W5_NOTE:'smile'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：畫了一個笑臉'}]}]},
    {speaker:null,text:'她看了很久。'},{speaker:'heroine_05',expression:'smile',text:'……你學得很快。'},{goto:'end'},
  {label:'t'},{speaker:'heroine_05',expression:'neutral',text:'嗯。下學期見。'},
  {label:'end'} ];
/* 主線 2 親戚的土地資料（一）（交接包 v2 C2；AA_12 主線 2）：除夕在臺北家裡（2D；2026-10-14 使用者：祐廷是臺北人，原本是嘉義老家）。台詞照原文；流程的描述（一桌親戚、拿出謄本、全桌安靜、姊姊憋笑）寫成旁白；
   「祐廷（旁白）」那一句是他心裡的話＝旁白。不寫真實地號或任何真實資料；共有土地怎麼處理不給答案（法律審查：祐廷大一什麼都不說也可以） */
const LAND_Y1=[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
  {speaker:null,text:'除夕。臺北家裡的客廳，一桌親戚。'},
  {speaker:null,text:'大伯從公事包裡拿出一疊影印的土地謄本。'},
  {speaker:'大伯',text:'{name}念台大法律喔？你不是從小就在看法律？來來來，你幫大伯看一下這個。'},
  {speaker:null,text:'全桌安靜，看著你。'},
  {speaker:'大伯',text:'這塊地是你阿公留下來的，現在登記十四個人，有人要賣、有人不要。這怎麼辦？'},
  {speaker:null,text:'你看了三秒。第一頁就是看不懂的地號。'},
  {speaker:null,text:'小時候我也是這樣，翻得到，看不懂。不一樣的是，現在我知道要先問什麼：這塊地是誰的、他們之間是什麼關係、大家想要什麼。'},
  {speaker:'媽媽',text:'他才大一啦，你不要嚇他。'},
  {speaker:'大伯',text:'大一也是法律系啊。'},
  {speaker:null,text:'姊姊在旁邊憋笑。'},
  {speaker:'姊姊',text:'（小聲）歡迎來到法律系的第一個寒假。'},
  {choice:[{text:'「大伯，我回去問老師。」',set:{FAMILY_LAND_Y1:'teacher'},goto:'t'},{text:'「我現在還看不懂。可是我知道要先問哪幾件事。」',set:{FAMILY_LAND_Y1:'ask'},goto:'a'},{text:'「這要找律師。」',set:{FAMILY_LAND_Y1:'lawyer'},goto:'l'}]},
  {label:'t'},{speaker:null,text:'大伯很高興。'},{speaker:'大伯',text:'好好好，台大的老師！'},{goto:'end'},
  {label:'a'},{speaker:null,text:'你問了三個問題：誰的、什麼關係、大家想要什麼。'},{speaker:null,text:'大伯答到一半，自己說：'},{speaker:'大伯',text:'……原來我們家連誰想賣都沒講清楚。'},{speaker:null,text:'全桌笑。'},
  {scene:'臺北・家裡的陽台',bg:'home_balcony'},{speaker:'姊姊',text:'你從小遇到事情就去翻那本書。現在你會問問題了。'},{goto:'end'},
  {label:'l'},{speaker:'大伯',text:'找律師要錢啊，你不就是嗎？'},
  {label:'end'} ];
const REVISIT_Y1_CHOICE=(pre)=>({choice:REVISIT_Y1_OPTS.map(o=>({text:o.t,if:{custom:G=>REVISIT_Y1_SHOWN(G).includes(o.k)},set:{REVISIT_Y1_PICK:o.k},goto:pre+o.k}))
  .concat([{text:'「每天都差不多。可是我很喜歡。」',set:{REVISIT_Y1_PICK:'daily'},goto:pre+'daily'}])});
/* 聖誕交換禮物（A20）：可能在場的七個人（AA_71 2-6）；在場＝玩家認識的；祐廷抽到誰的：明軒和小語都在時小語的玩偶已經是明軒的，盡量不和抽到祐廷禮物的是同一個人 */
const XMAS_WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];
const XMAS_HERE=G=>typeof STORY==='undefined'||!STORY.knows?[]:XMAS_WHO.filter(id=>STORY.knows(id,G));
/* 明軒抽到小語的玩偶（AA 的「和祐廷無關的一句」）＝明軒和小語都在、抽到祐廷禮物的不是明軒（是明軒的話，他抽到的是祐廷的，小語的玩偶祐廷也抽得到）*/
const XMAS_MX_YU=G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('yu')&&G.flags.XMAS_TO!=='classmate_mingxuan'; };
const XMAS_FROM_POOL=G=>{ const h=XMAS_HERE(G); const p=h.filter(id=>!(id==='yu'&&XMAS_MX_YU(G))); const q=p.filter(id=>id!==G.flags.XMAS_TO); return q.length?q:p; };
/* 可昕自己讀書時傳的書桌照片（BB_95 9-5：婉拒、沒回、沒接）*/
const KX_DESK_PHOTO=[{th:'p:kexin',from:'kexin',text:'📷（她的書桌）'},{th:'p:kexin',from:'kexin',text:'我自己讀了。你欠我一次。'}];
const STORY_EVENTS=[
  // ────────────────────────────────────────── 語彤：雨天圖書館門口（Vertical Slice）
  /* AA_140 G06（2026-10-16）：週二、週四 17:30～20:30 語彤在麵店（AA_110 6-3），這個時段不觸發；台詞不改 */
  { id:'ev_rain_library_door', title:'雨天的總圖門口', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:7}, trigger:'auto', time:[18,23], weather:'rain', day_min:3, once:true, prereq:{custom:G=>!([2,4].includes(G.weekday)&&(G.hour%24)>=17.5&&(G.hour%24)<20.5),notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]},   /* AA_120 7-5 第 1 項：不下雨的版本（ev_library_door_phone）認識以後，下雨天不再演一次初遇；對話一個字都不動 */
    spawn:{npc:'heroine_03',at:{x:80.5,z:2.6},pose:'idle'}, background:'blur', cg_id:'cg_library_rain_heroine03',
    dialogue:[
      {speaker:null,text:'總圖門口的屋簷下站著一個人。雨很大，她看著雨，沒有要走的意思。'},
      {speaker:'heroine_03',expression:'neutral',text:'……'},
      {speaker:'heroine_03',expression:'neutral',text:'……我沒帶傘。'},
      {speaker:null,text:'你在圖書館看過她幾次。社會系的樣子，總是坐在靠窗那排，很安靜。'},
      {choice:[
        {text:'「一起走吧。」',hint:'你有傘',consequences:{mem:[{npc:'heroine_03',tag:'SHARED_UMBRELLA',note:'雨天總圖門口'},{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:8,comf:6,trust:4}},flags:{rain_umbrella:'share'}},goto:'share'},
        {text:'「我的給妳，我等等搭車。」',consequences:{mem:[{npc:'heroine_03',tag:'HELPED',note:'把傘給她'},{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:6,trust:7,resp:4}},flags:{rain_umbrella:'give'},energy:-6},goto:'give'},
        {text:'「便利商店應該有賣。」',consequences:{mem:[{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:3}},flags:{rain_umbrella:'cvs'}},goto:'cvs'},
        {text:'「我也沒帶。」',consequences:{mem:[{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:4,comf:3}},flags:{rain_umbrella:'none'}},goto:'none'} ]},
      {label:'share'},
      {speaker:'heroine_03',expression:'surprised',text:'……可以嗎？'},
      {speaker:'player',text:'反正我也要往校門走。'},
      {speaker:'heroine_03',expression:'smile',text:'嗯。'},
      {speaker:null,text:'一把傘兩個人，走到椰林大道的時候你的左肩已經濕了。她一路沒說話，到校門口才開口。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。社會系。……你是法律系的吧，我看過你在三樓。'},
      {speaker:'heroine_03',expression:'smile',text:'謝謝。改天還你一把傘。'},
      {goto:'end'},
      {label:'give'},
      {speaker:'heroine_03',expression:'surprised',text:'那你怎麼辦？'},
      {speaker:'player',text:'公車站就在對面。'},
      {speaker:'heroine_03',expression:'thinking',text:'……你會濕掉。'},
      {speaker:null,text:'她接過傘，看了你三秒，像在決定要不要記住你的臉。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。傘我會還。你哪一系？'},
      {goto:'end'},
      {label:'cvs'},
      {speaker:'heroine_03',expression:'neutral',text:'……嗯。我知道。'},
      {speaker:null,text:'她沒有動。你忽然意識到她不是不知道便利商店在哪。'},
      {speaker:'heroine_03',expression:'tired',text:'今天不想再花錢了。'},
      {speaker:null,text:'你們在屋簷下站了一會。雨小了一點，她說了聲謝謝就走進雨裡。'},
      {goto:'end'},
      {label:'none'},
      {speaker:'heroine_03',expression:'smile',text:'……那我們兩個都很慘。'},
      {speaker:null,text:'她笑了一下，很短。你們並肩看了十分鐘的雨，聊了圖書館三樓哪一排的燈最亮。'},
      {speaker:'heroine_03',expression:'neutral',text:'我叫陳語彤。社會系的。你呢？'},
      {label:'end'},
      {speaker:null,text:'（她會記得今天。）'} ],
    consequences:{memo:'雨天在總圖門口遇到陳語彤',goal:'自由行動'}, despawn:20, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='route'; n.waypoints=[[70,-2.5],[40,-2.5],[30,-6]]; n.pauseAt=false; n.talk=null; } } },
  // 沒下雨的另一種初遇
  { id:'ev_library_door_phone', title:'總圖門口', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:6}, trigger:'auto', time:[17,22], not_weather:'rain', day_min:3, once:true, random_weight:20, prereq:{notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, spawn:{npc:'heroine_03',at:{x:79.5,z:3.2},pose:'idle'}, background:'blur',
    dialogue:[ {speaker:null,text:'總圖門口有個女生一直在看手機，看一眼、收起來、再看一眼。'},{speaker:'heroine_03',expression:'neutral',text:'……不好意思，現在幾點？'},{speaker:'player',text:'{name}看了一下手機，告訴她時間。'},{speaker:'heroine_03',expression:'tired',text:'她又遲到了。高中同學，每次都這樣。'},{choice:[{text:'「要不要先進去等？裡面有冷氣。」',consequences:{rel:{heroine_03:{fam:4,comf:3}}}},{text:'「妳是社會系的？我好像在三樓看過妳。」',consequences:{rel:{heroine_03:{fam:5}},mem:[{npc:'heroine_03',tag:'PLAYER_ASKED_QUESTION'}]}},{text:'（點個頭就走）',consequences:{rel:{heroine_03:{fam:1}}}}]},{speaker:'heroine_03',expression:'smile',text:'陳語彤。……你是法律系的吧。你們系的人走路都很快。'} ], despawn:30, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='idle'; n.talk=null; } } },
  // 麵店：語彤在幫忙（她阿姨的店）
  /* 語彤的聯絡方式（AA_70 第 2 節、AA_124 1-7，第②級，2026-10-14）：雨天的總圖門口之後，在麵店遇到她（AA_11 事件 2）——她把手機推過來：「傘的事。……你的聯絡方式。」
     雨天把傘給她（HELPED）：「我還你傘的時候要找你。」（她三年都沒還）；其他：「下次下雨的時候找你。」。沒有雨天、已經有聯絡方式的不說（錯過的到「有點熟」可以當面交換）。
     「圖書館那天之後就沒再看到你。」只給兩種傘的記憶都沒有的人（notMemory；原本 unless 的兩個記憶要同時有才跳過，撐傘或給傘的人會連問兩句）。*/
  { id:'ev_noodle_yutong', title:'阿鳳麵店', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:5, prereq:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, cooldown_days:2, background:'blur',
    dialogue:[ {speaker:'heroine_03',expression:'surprised',text:'……你？'},{speaker:'heroine_03',expression:'neutral',text:'這是我阿姨的店。二、四晚上我來幫忙。'},{if:{memory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'}]},speaker:'heroine_03',expression:'smile',text:'傘還在我這。你還記得那天嗎？雨大到看不見校門。'},{if:{memory:[{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'smile',text:'你的傘我帶來了，放在櫃台後面。……那天你到底有沒有淋濕？'},{if:{notMemory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'},{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'neutral',text:'圖書館那天之後就沒再看到你。你都幾點去？'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:null,text:'（她把手機推過來。）'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'傘的事。……你的聯絡方式。'},{if:{events:['ev_rain_library_door'],memory:[{npc:'heroine_03',tag:'HELPED'}]},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'我還你傘的時候要找你。',consequences:{contact:'heroine_03'}},{if:{events:['ev_rain_library_door']},unless:{custom:G=>(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03'))||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','HELPED'))},speaker:'heroine_03',expression:'neutral',text:'下次下雨的時候找你。',consequences:{contact:'heroine_03'}},{choice:[{text:'「乾麵，加滷蛋。」',consequences:{rel:{heroine_03:{fam:3,comf:2}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL',note:'她端來的乾麵'}],money:-75,energy:20,advance:0.5}},{text:'「妳阿姨的店？那妳從小就在公館？」',consequences:{rel:{heroine_03:{fam:4,trust:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'她從小在麵店長大'}]},goto:'family'},{text:'「今天忙嗎？我改天再來。」',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{goto:'end'},{label:'family'},{speaker:'heroine_03',expression:'thinking',text:'嗯。我媽身體不太好，我阿姨一個人顧不來。'},{speaker:'heroine_03',expression:'neutral',text:'……你不用那個表情。我從小就在這裡剝蒜頭，習慣了。乾麵？'},{speaker:'player',text:'乾麵。加滷蛋。'},{set:{},rel:{heroine_03:{comf:3}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL'}],advance:0.5},{label:'end'},{speaker:'heroine_03',expression:'smile',text:'慢慢吃。碗放著就好。'} ] },
  // ────────────────────────────────────────── 芷若：咖啡廳店員／通識課
  { id:'ev_cafe_barista_zhiruo', title:'兩點半的店員', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:5, cooldown_days:1, background:'blur',
    /* 芷若 Z1（BB_95 2-2，交接包 v1，2026-10-14）：點餐次數 CAFE_VISITS（每次點餐 +1；BB_90 芷若支線用同一個）。
       第 1 次才自我介紹（「林芷若，外文二」只說這一次）；已經在經原分組（ev_zhiruo_ge_group）認識的，第 1 次也不說名字；第 2～4 次「老樣子？」（SHARED_SECRET 的開場優先）；
       第 5 次起不問、直接做第一次點的東西（zhiruoFirstOrder；第一次點的東西也寫在 SHARED_MEAL 的備註）；第 5 次給集點卡和店裡的聯絡方式（加了：zhiruoShopContactDay，手機 4-2 照這一天排）。
       舊存檔（點過、沒有計數）：讀檔時補成 1（game3d.js 的 migrate）。
       好朋友以上（SOCIAL.friendLevel＝CLOSE_FRIEND）：開場和點餐之後多一句旁白「紙杯上多了一行字……」（BB_120 1-2「固定的改變：點單」，2026-10-14 和 LAWWW 對齊：開場照 Z1、不另寫一套）；
       她只寫場景、不寫台詞原文；記 zhiruoCupNote（尾聲桌上「芷若寫字的紙杯」從這裡開始）。*/
    dialogue:[ {if:{flagNum:{CAFE_VISITS:{max:0}}},unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'歡迎光臨——喔，法律系的。你們系的人點餐都像在念條文。'},{if:{flagNum:{CAFE_VISITS:{max:0}},memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'……經原那組的。法律系的。你們系的人點餐都像在念條文。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'又來了。今天要「老樣子」嗎？我記得你的。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}}},unless:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'老樣子？'},{if:{flagNum:{CAFE_VISITS:{min:4}}},goto:'auto'},{choice:[{text:'「拿鐵。妳怎麼知道我是法律系？」',consequences:{rel:{heroine_02:{fam:4,comf:2}},money:-120,energy:10,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'拿鐵'}},goto:'how'},{text:'「手沖。妳推薦哪一支？」',consequences:{rel:{heroine_02:{fam:4,resp:3}},money:-150,energy:12,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'手沖'}},goto:'rec'},{text:'「檸檬塔。然後——妳是外文系的？」',unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},consequences:{rel:{heroine_02:{fam:5,trust:3}},money:-110,energy:14,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'檸檬塔'}},goto:'dept'},{text:'「只是看看。」',consequences:{rel:{heroine_02:{fam:1}}},end:true}]},{goto:'end'},{label:'how'},{speaker:'heroine_02',expression:'laugh',text:'你背包上掛著法學院的識別證啊，福爾摩斯。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。這裡一、三、五下午和晚上。你想念書的話，窗邊那桌最安靜。'},{goto:'end'},{label:'rec'},{speaker:'heroine_02',expression:'thinking',text:'今天的是衣索比亞，有點像……看《愛在黎明破曉時》那種早上。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。外文系的，看太多電影。林芷若。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。'},{goto:'end'},{label:'dept'},{speaker:'heroine_02',expression:'surprised',text:'……你怎麼知道？'},{speaker:'player',text:'櫃台後面那本《電影理論》。'},{speaker:'heroine_02',expression:'smile',text:'好，你贏了。林芷若，外文二。要不要一起修下學期的「法律與電影」？聽說老師會放《十二怒漢》。'},{set:{zhiruo_film_invite:true},mem:[{npc:'heroine_02',tag:'INVITED_CLUB',note:'邀你修法律與電影'}]},{goto:'end'},
      {label:'auto'},{unless:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'{flag:zhiruoFirstOrder|拿鐵}。……我已經在做了。'},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'檸檬塔。……我已經在切了。'},{if:{flagIs:{zhiruoFirstOrder:'手沖'}},consequences:{rel:{heroine_02:{fam:3}},money:-150,energy:12,advance:0.15}},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},consequences:{rel:{heroine_02:{fam:3}},money:-110,energy:14,advance:0.15}},{unless:{flagIs:{zhiruoFirstOrder:['手沖','檸檬塔']}},consequences:{rel:{heroine_02:{fam:3}},money:-120,energy:10,advance:0.15}},{inc:{CAFE_VISITS:1}},{if:{flagNum:{CAFE_VISITS:{max:5}}},goto:'card'},{goto:'end'},
      {label:'card'},{speaker:null,text:'她遞過來一張集點卡。集十點送一杯——前四次她也補蓋了，蓋到第五格。'},{speaker:null,text:'卡片背面寫著店裡的聯絡方式：「點餐可以先傳。」'},{choice:[{text:'（加店裡的帳號）',consequences:{stamp:['zhiruoShopContactDay'],memo:'加了兩點半的帳號（點餐可以先傳）'}},{text:'（把卡片收進錢包）'}]},
      {label:'end'},
      /* 芷若 Z3 之後（BB_96 3-1）：點完自己的，多一個「也幫芷若點一杯」→ 飲料（拿鐵／美式／熱可可／紅茶）→ 要不要加一份濃縮。
         點對（熱可可＋加濃縮）：REMEMBERED_HER（之後就不再問）；點錯：她笑出來、不扣分（下次還可以再點）。兩個「加不加」選項畫面一樣，選飲料時看不出對錯。
         「（就這樣）」「不加」是選項的字（LAWWW 加的介面字，已告訴 BB）；她那杯照拿鐵的價錢 120 */
      {if:{memory:[{npc:'heroine_02',tag:'ASKED_HER_DRINK'}]},unless:{memory:[{npc:'heroine_02',tag:'REMEMBERED_HER'}]},goto:'treat_ask'},{goto:'after_treat'},
      {label:'treat_ask'},{choice:[{text:'也幫芷若點一杯',goto:'treat'},{text:'（就這樣）',goto:'after_treat'}]},
      {label:'treat'},{choice:[{text:'拿鐵',goto:'treat_shot'},{text:'美式',goto:'treat_shot'},{text:'熱可可',goto:'treat_cocoa'},{text:'紅茶',goto:'treat_shot'}]},
      {label:'treat_cocoa'},{choice:[{text:'加一份濃縮',goto:'treat_right'},{text:'不加',goto:'treat_wrong'}]},
      {label:'treat_shot'},{choice:[{text:'加一份濃縮',goto:'treat_wrong'},{text:'不加',goto:'treat_wrong'}]},
      {label:'treat_right'},{consequences:{money:-120}},{speaker:null,text:'她把杯子放下，很久以後說：'},{speaker:'heroine_02',expression:'neutral',text:'……你記得。'},{mem:[{npc:'heroine_02',tag:'REMEMBERED_HER',note:'幫她點了那一杯'}]},{goto:'after_treat'},
      {label:'treat_wrong'},{consequences:{money:-120}},{speaker:null,text:'她笑出來：'},{speaker:'heroine_02',expression:'laugh',text:'這是別人會點的。……不過今天，我喝這杯。'},
      {label:'after_treat'},{if:{custom:G=>G.flags.Z5_NEXT==='mine'&&!G.flags.Z5_MINE_ASKED&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},set:{Z5_MINE_ASKED:true},speaker:'heroine_02',expression:'smile',text:'你挑好了嗎？'},{if:{custom:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&SOCIAL.friendLevel('heroine_02')==='CLOSE_FRIEND'},set:{zhiruoCupNote:true},speaker:null,text:'（紙杯上多了一行字，寫的是一部電影裡的一個場景。）'},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'拿鐵'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了拿鐵'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'手沖'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了手沖'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'檸檬塔'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了檸檬塔'}]},{speaker:'heroine_02',expression:'smile',text:'杯子放著就好，慢慢來。'} ] },
  /* AA_120 7-5 第 3 項（BB 2026-10-13 的最小改字；已知資訊矛盾）：芷若的經原在週五、和祐廷同一堂，週二、週四在傅鐘附近是剛下外文系的課。經原那個選項要有 Z2（ev_zhiruo_ge_group）之後才有 */
  /* AA 2026-10-13 P1-2：傅鐘這段是「已經認識」的日常（她直接講下課的事），要先見過芷若（兩點半或經原分組）；沒見過時在傅鐘找她說話只有旁白（story3d.js 的 talkCharacter），也不會變成第一次見面 */
  { id:'ev_zhiruo_bell', title:'傅鐘旁邊', participants:['heroine_02'], location:'campus', trigger:'interact', priority:3, cooldown_days:1, prereq:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'smile',text:'剛下外文系的課。今天一句詩翻了一整堂。'},{choice:[{text:'「週五的經原，妳聽得懂供給曲線嗎？」',if:{events:['ev_zhiruo_ge_group']},consequences:{rel:{heroine_02:{fam:3,comf:3}}}},{text:'「妳上完課都在這裡發呆？」',consequences:{rel:{heroine_02:{fam:3}}}},{text:'「妳的交換申請交了嗎？」',if:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},consequences:{rel:{heroine_02:{trust:4}}},goto:'ex'}]},{speaker:'heroine_02',expression:'laugh',text:'發呆是下課最重要的部分。'},{goto:'end'},{label:'ex'},{speaker:'heroine_02',expression:'embarrassed',text:'……還沒。你不要每次都問這個。'},{speaker:'heroine_02',expression:'serious',text:'我會交。這週。大概。'},{mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'催她交交換申請'}]},{label:'end'} ] },
  /* 芷若 Z4「十點的電話」（BB_96 3-4，交接包 v2；原本的「週末的咖啡廳」改寫）：原本在 Café 週末——她週末不在 Café（週六 14–18 在溫州街），走不到；
     也拿掉企劃組禁用的「我跟你講一件事，你不要跟別人說」、「家裡的事比較重要吧」的 comf:-3（不扣分）。改成大一下第 12 週以後的週六 14～18、溫州街、有點熟以上、只一次。
     交往中：台詞照舊（週六下午街上的偶遇，朋友之間講家裡的事），第一個選項只有 trust:8（沒有 aff）。三個選項都記 SHARED_SECRET（note 不同）＋ Z4_PICK（大二 Z7 回來講第三個選項那一句）*/
  /* 芷若 Z3「妳自己喝什麼」（BB_96 3-1，交接包 v2）：大一下第 3 週起的平日 21:40～22:00（她晚班到 22:00）、Café、和她有點熟以上、只一次。交往中也一樣（店員和客人）。
     店裡只剩祐廷：其他客人 21:40 起身走出去、21:40～22:00 不生成（story3d.js 的 S.z3Pending）；還有客人沒走、或有人跟著你（同行、邀約）時不開始（S.cafeOthers），那天就是平常的點餐。
     沒有選項（問出那一句就是選擇）。「你是——」不說完。記憶 ASKED_HER_DRINK 的名稱、備註、手機筆記、人物資料都不寫她喝什麼（驗收；tests/v2_bb96_z3_unit.js 檢查）。
     表情：surprised →（停久一點）neutral → embarrassed → smile。之後的點餐多一個「也幫芷若點一杯」（ev_cafe_barista_zhiruo 的 treat）*/
  { id:'ev_zhiruo_own_drink', title:'妳自己喝什麼', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:8, once:true, weekday:[1,2,3,4,5], time:[21+40/60,22],
    prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:(G,GM)=>{ if(typeof STORY==='undefined'||!STORY.termDay) return false; const d0=STORY.termDay('Y1S2',3,1); return d0!=null&&G.day>=d0&&!G.flags.companion&&!(STORY.cafeOthers&&STORY.cafeOthers(GM).length); }}, background:'blur',
    dialogue:[ {speaker:null,text:'（她在擦吧檯。機器已經關了。）'},
      {speaker:'heroine_02',expression:'smile',text:'最後一杯了喔。老樣子？'},
      {speaker:'player',text:'……妳自己都喝什麼？'},
      {speaker:null,text:'（她擦吧檯的手停住了。）'},
      {speaker:'heroine_02',expression:'surprised',text:'……（很久）我在這裡兩年。'},
      {speaker:'heroine_02',expression:'neutral',text:'你是——'},
      {speaker:null,text:'（她停住，搖頭，笑了一下。）'},
      {speaker:'heroine_02',expression:'neutral',text:'熱可可。加一份濃縮。'},
      {cg:'cg_own_drink_heroine02'},   /* BCG-04（BB_117：她說完「熱可可。加一份濃縮。」之後、「不要笑」之前；BB-B 檢查通過）*/
      {speaker:'heroine_02',expression:'embarrassed',text:'很幼稚吧。小孩子的飲料加大人的東西。'},
      {speaker:'heroine_02',expression:'smile',text:'……不要笑。'} ],
    consequences:{mem:[{npc:'heroine_02',tag:'ASKED_HER_DRINK',note:'她下班前，你問她自己都喝什麼'}]} },
  { id:'ev_zhiruo_secret', title:'十點的電話', participants:['heroine_02'], location:'wenzhou', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[12,13,14,15,16,17,18], weekday:[6], time:[14,18], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'neutral',text:'週六我都在溫州街。這裡的人不會問我週末在幹嘛。'},
      {speaker:'heroine_02',expression:'thinking',text:'交換的申請，我拖了兩個月。不是懶。'},
      {speaker:'heroine_02',expression:'neutral',text:'我媽每天晚上十點打給我。講店裡的事。'},
      {speaker:'heroine_02',expression:'neutral',text:'誰來印考卷、哪一台又卡紙。'},
      {speaker:'heroine_02',expression:'thinking',text:'我去英國的話，那邊是下午三點。'},
      {speaker:'heroine_02',expression:'neutral',text:'……她十點要打給誰？'},
      {choice:[{text:'「妳想去嗎？」',unless:{flags:['dating_kexin']},set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8,aff:3}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「妳想去嗎？」',if:{flags:['dating_kexin']},set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「先交件再說，錄取了再煩惱。」',set:{Z4_PICK:'apply'},consequences:{rel:{heroine_02:{trust:5,resp:4}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：先交件再說'}]},goto:'do'},
        {text:'「家裡的事比較重要吧。」',set:{Z4_PICK:'family'},consequences:{rel:{heroine_02:{trust:2}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你說家裡的事比較重要'}]},goto:'fam'}]},
      {label:'want'},{speaker:null,text:'她沉默很久。'},{speaker:'heroine_02',expression:'neutral',text:'……想。'},{speaker:null,text:'她用手指捲頭髮，捲了三圈。'},{speaker:'heroine_02',expression:'smile',text:'好可怕。說出來就變成真的了。'},{goto:'end'},
      {label:'do'},{speaker:'heroine_02',expression:'smile',text:'你們法律系都這樣講話嗎？'},{speaker:null,text:'她笑了。'},{speaker:'heroine_02',expression:'smile',text:'……可是你說得對。'},{goto:'end'},
      {label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'嗯。'},{speaker:null,text:'她點頭。'},{speaker:'heroine_02',expression:'neutral',text:'我也這樣跟自己說了兩個月。'},
      {label:'end'} ] },
  // ────────────────────────────────────────── 子晴：室友的同學、吉他社
  { id:'ev_zhiruo_ge_final', title:'期末的短片', participants:[], location:['dorm','campus','putong'], trigger:'enter', term:['Y1S1'], once:true, prereq:{flags:['ge_group_zhiruo'],custom:G=>{ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=18; }}, background:'freeze',   /* BB_95 2-4 期末：旁白一行帶過（AA_108 第 4 節 #27：不排「第一個」）*/
    dialogue:[ {speaker:null,text:'三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'} ] },
  { id:'ev_kai_mentions_ziqing', title:'室友的同學', participants:['kai'], location:'dorm', trigger:'interact', priority:6, once:true, day_min:6,   /* BB_95 2-3：落在第 4 週（9/22 週一＝第 6 天），社團博覽會（第 5 週）之前；台詞全部保留 */ time:[18,26], prereq:{notMemory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* 已經認識子晴就不用轉述（BB 6-1）*/
    dialogue:[ {speaker:'kai',expression:'smile',text:'欸，我們系有個學姊，高子晴，吉他社的。她說社團缺人，問我有沒有朋友想來。'},{speaker:'kai',expression:'neutral',text:'我說我室友是法律系的，她說「法律系也可以啊，只要不會告我們」。'},{choice:[{text:'「什麼時候？」',consequences:{flags:{guitar_invite:true},rel:{heroine_04:{fam:2}},goal:'吉他社：第 5 週起，週一、週三 19:00，萬才館一樓多功能教室'},goto:'when'},{text:'「我不會彈吉他。」',consequences:{flags:{guitar_invite:true}},goto:'no'},{text:'「你去就好。」',consequences:{rel:{kai:{fam:-1}}},end:true}]},{label:'when'},{speaker:'kai',expression:'smile',text:'第五週開始，週一、週三晚上七點，在萬才館一樓的多功能教室。她說不用會彈。'},{goto:'end'},{label:'no'},{speaker:'kai',expression:'laugh',text:'她說一年級的沒有人會。週一、週三晚上七點，萬才館。'},{label:'end'} ] },
  /* AA_110 6-8 (a)（AA 暫定）：還沒認識子晴的玩家第一次去吉他社社課，社課一開始自動播這一段的初遇（classes3d.js 的 clubEvent）；之後玩家自己去找她才播「又來了」，最多一週一次（冷卻 1 → 7 天）；
     「阿凱說妳系上第一名」那個選項寫 ARGUED_ABOUT_CAREER（她的劇情點）：整個存檔只出現一次。台詞不動。 */
  { id:'ev_ziqing_club', title:'吉他社', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:5, cooldown_days:7, background:'blur',
    dialogue:[ {if:{flags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'欸不是，你就是阿凱的室友？法律系那個？'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'laugh',text:'欸！你真的來了！'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'smile',text:'學姊，他是我拉來的。'},   /* AA_156 1-2：小語在社課（作息）、只有小語的入口才說；子晴的台詞一字不動 */
      {if:{notFlags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'新人？……法律系的？放心，我們社團沒有人會告人。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'laugh',text:'我高子晴。資工二。先講好：我們社團沒有人會彈，都是來吃東西的。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'neutral',text:'今天系上有程式比賽。我沒去。我來這裡彈吉他。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},stamp:['guitarFirstDay']},{if:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'又來了。今天要學 C 和弦還是要吃洋芋片？'},{choice:[{text:'「教我一個和弦。」',consequences:{rel:{heroine_04:{fam:5,comf:3}},mem:[{npc:'heroine_04',tag:'INVITED_CLUB'}],energy:-4,advance:1},goto:'chord'},{text:'「為什麼不去比賽？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},unless:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]},consequences:{rel:{heroine_04:{fam:3}},mem:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER',note:'問她為什麼不比賽'}]},goto:'why'},{text:'「妳們平常都在幹嘛？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'what'}]},{label:'chord'},{speaker:'heroine_04',expression:'laugh',text:'手指這樣——不對，那是 F，你會痛死。C。壓好。'},{speaker:null,text:'一個小時後你會了一個和弦，還有手指上兩條紅痕。'},{goto:'end'},{label:'why'},{speaker:'heroine_04',expression:'serious',text:'因為那是別人覺得我「應該」去的地方。我家已經有一個「應該」了，我不想再多一個。'},{speaker:'heroine_04',expression:'smile',text:'C 和弦再按一次。手指不要放。'},{goto:'end'},{label:'what'},{speaker:'heroine_04',expression:'smile',text:'吃東西、彈錯、笑別人彈錯。期末有成發，到時候你負責拍手。'},{label:'end'} ] },
  // ────────────────────────────────────────── 溫學姊：法服讀書會（刑訴）＋ 法研所
  /* AA_110 6-8 (a)（AA 暫定）：這個事件就是法服讀書會本身——時間對齊活動（週三 19:00，原本 18:48）、地點研討室 A：玩家在研討室 A 門口參加讀書會（ACTIVITIES 的 lawclub_study）時
     第一次播整段（classes3d.js 的 clubEvent；trigger 'activity'＝不會因為走進萬才館就自己開始），第二次以後只有旁白＋題庫兩三題。學姊研究計畫那段（GRAD_SCHOOL_DISCUSSION）只有一次。台詞不動。 */
  { id:'ev_studygroup_wed', title:'法服讀書會', participants:['heroine_05','classmate_bohan'], location:'wancai', trigger:'activity', weekday:[3], time:[19,21], cooldown_days:6, prereq:{flags:['lawclub']}, background:'blur', player_seat:null,
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）學姊每次都說沒關係，然後每次都點人。'},{legal:{context:'study',by:'heroine_05',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'thinking',text:'（舉手，停了一下）……我們為什麼要背這個？'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'smile',text:'（笑）好。這是一個答案。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'heroine_05',expression:'neutral',text:'……好問題。下週回答。'},{unless:{flags:['PEISHAN_ASKED_WHY']},set:{PEISHAN_ASKED_WHY:true,peishanAskedNow:true},stamp:['peishanAskedDay']},{legal:{context:'study',by:'heroine_05',pick:{section:'訊問、自白、緘默權'}}},{legal:{context:'study',by:'heroine_05',pick:{}}},{speaker:'heroine_05',expression:'tired',text:'今天先到這裡。……我二月要交大專生研究計畫。你們大三就會知道那是什麼東西。'},{choice:[{text:'「研究計畫是什麼？」',consequences:{grad:{bump:'學姊提到研究計畫',field:'公法'},rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「學姊為什麼想念研究所？」',consequences:{grad:{bump:'問學姊為什麼念研究所'},rel:{heroine_05:{trust:4}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'why'},{text:'（收書包）',consequences:{rel:{heroine_05:{fam:1}}},goto:'end'}]},{label:'grad'},{speaker:'heroine_05',expression:'serious',text:'一份你想研究什麼、為什麼、怎麼做的文件。教授看那個決定要不要你。'},{speaker:'heroine_05',expression:'thinking',text:'大部分人寫不出「為什麼」。'},{goto:'end'},{label:'why'},{speaker:'heroine_05',expression:'thinking',text:'……這個問題最近有人問我第三次了。'},{speaker:'heroine_05',expression:'neutral',text:'以前我會說「因為我對公法有興趣」。現在我會說：先不要問我。'},{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'她不確定為什麼念研究所'}]},{label:'end'},{speaker:null,text:'散會時，學姊把你的筆記還給你，裡面夾了一張便條：「一，論點不清。二，引用錯頁。三，字太醜。」'},{if:{flags:['peishanAskedNow']},unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。法律一。剛剛那個問題是我問的。',meet:'classmate_peishan'},{set:{peishanAskedNow:false},stamp:['studyGroupFirstDay']} ],   /* BB_95 2-5：沛珊 P1（第一次一起出席；PEISHAN_ASKED_WHY 給 ev_studygroup_p1b）、F-W1 便條、散會後 22:30 讀書會群組的訊息（phoneRules）；「大專生研究計畫」的時程需查證 */
    consequences:{mem:[{npc:'heroine_05',tag:'STUDIED_TOGETHER',note:'法服讀書會'},{npc:'classmate_bohan',tag:'STUDIED_TOGETHER'}],rel:{classmate_bohan:{fam:4}},advance:1.5,energy:-8,memo:'參加了法服讀書會（刑訴）'} },
  // ────────────────────────────────────────── 林教授：刑事訴訟法（週二 10:20）
  { id:'ev_class_crimpro', term:['Y3S1'], title:'刑事訴訟法', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], cooldown_days:6, background:'freeze', mainSide:'right', player_seat:[1,3],
    dialogue:[ {speaker:null,text:'霖澤館二樓。林教授把判決影本放在講台上，聲音不大，但沒有人講話。'},{speaker:'prof_lin',expression:'neutral',text:'「上週我們談了刑事訴訟的目的。有人以為就是『把壞人抓到』——今天我們從被告的位置看一次。」'},{legal:{context:'class',by:'prof_lin',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{speaker:'prof_lin',expression:'neutral',text:'「下一個問題比較實務。警察局的訊問室裡發生的事，法院要怎麼看？」'},{legal:{context:'class',by:'prof_lin',pick:{section:'訊問、自白、緘默權'}}},{speaker:'prof_lin',expression:'smile',text:'「這兩題會出現在期中。不是威脅，是預告。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她每學期都這樣說，然後真的出。'} ],
    consequences:{mem:[{npc:'classmate_bohan',tag:'SHARED_CLASS'},{npc:'prof_lin',tag:'SHARED_CLASS'}],rel:{classmate_bohan:{fam:3}},advance:1.7,energy:-6,memo:'上了刑事訴訟法',flags:{crimpro_attended:true}} },
  // ────────────────────────────────────────── 許教授：研究所的種子（辦公時間）
  { id:'ev_prof_xu_office', title:'許教授', participants:['prof_xu'], location:'wancai', trigger:'interact', priority:5, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},speaker:'prof_xu',expression:'neutral',text:'一年級的？我是許志遠，教行政法，你們大二會遇到我。'},{if:{memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},speaker:'prof_xu',expression:'neutral',text:'又是你。有問題？'},{choice:[{text:'「老師，法研所是在做什麼的？」',consequences:{grad:{bump:'問許教授法研所'},prof:{prof_xu:{kind:'office',delta:2,note:'問法研所'}},mem:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「老師推薦一本一年級可以讀的書嗎？」',consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'book_xu',title:'許教授推薦的書','body':'《法學方法論》入門——「先學會問問題，再學答案」。'}},goto:'book'},{text:'「沒事，路過。」',end:true}]},{label:'grad'},{speaker:'prof_xu',expression:'thinking',text:'「讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。」'},{speaker:'prof_xu',expression:'smile',text:'「你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。」'},{goto:'end'},{label:'book'},{speaker:'prof_xu',expression:'neutral',text:'「先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。」'},{label:'end'} ] },
  // ────────────────────────────────────────── 熟同學：小事件
  { id:'ev_xinci_notes', title:'借筆記', participants:['classmate_xinci'], location:['classroom','library'], trigger:'interact', priority:4, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]},speaker:'classmate_xinci',expression:'neutral',text:'你是……周老師點過的那個？我吳芯慈。同班。'},{speaker:'classmate_xinci',expression:'thinking',text:'我上週民總請假，你筆記可以借我看一下嗎？我明天還你。'},{choice:[{text:'「可以，給。」',consequences:{rel:{classmate_xinci:{fam:5,trust:4}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},goto:'yes'},{text:'「我的筆記很亂，妳確定？」',consequences:{rel:{classmate_xinci:{fam:3}}},goto:'messy'},{text:'「不太方便，我自己要用。」',consequences:{rel:{classmate_xinci:{fam:1,trust:-2}},mem:[{npc:'classmate_xinci',tag:'REFUSED_HELP'}]},goto:'no'}]},{label:'yes'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。……我會重新排版再還你，你不要介意。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'messy'},{speaker:'classmate_xinci',expression:'laugh',text:'越亂越好，我喜歡整理。'},{rel:{classmate_xinci:{fam:2,trust:2}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'no'},{speaker:'classmate_xinci',expression:'neutral',text:'好。沒關係。'},{speaker:null,text:'她轉向另一個同學。你不確定她有沒有把這件事記下來。'},{label:'end'} ] },
  /* 交接包 v1 A5 的週次：第 7 週（期中考前）起才問考古題（v1 稽核：原本沒有週次限制）*/
  { id:'ev_bohan_kaogu', title:'考古題', participants:['classmate_bohan'], location:['library','classroom'], trigger:'interact', priority:4, cooldown_days:2, background:'blur', minWeek:{term:'Y1S1',week:7},
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。你有周老師前年的考古題嗎？'},{if:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'你來得正好。我在看刑總的題目，有一題我跟芯慈吵了半小時。'},{speaker:'classmate_bohan',expression:'thinking',text:'……我覺得我念得太少。你一天念幾小時？'},{choice:[{text:'「兩、三小時吧。」',consequences:{rel:{classmate_bohan:{fam:3,comf:2}}}},{text:'「看心情。」',consequences:{rel:{classmate_bohan:{fam:2,resp:-1}}}},{text:'「你已經是全班最認真的了。」',consequences:{rel:{classmate_bohan:{fam:4,trust:3}},mem:[{npc:'classmate_bohan',tag:'HELPED',note:'安慰他'}]}}]},{speaker:'classmate_bohan',expression:'neutral',text:'嗯。……好。'} ] },
  /* 沛珊 P2：為什麼念法律（BB_95 第 2-8 節完整版；使用者 2026-10-14 解除大一上交接包暫緩、AA 轉達）：只發生一次（once）；第一個選項換成 BB 寫好的（祐廷念法律是自己選的）；結尾不再用模板句、三個分支各說一次；週三晚上在萬才館（讀書會那天）才提讀書會。三個選項的數值、選項三的記憶照舊（記憶的備註照 BB_95 改成「她在想別的路」）*/
  { id:'ev_peishan_doubt', title:'為什麼念法律', participants:['classmate_peishan'], location:['library','wancai','campus'], trigger:'interact', priority:4, once:true, cooldown_days:3, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。'},{unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},if:{custom:G=>G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5},speaker:'classmate_peishan',expression:'neutral',text:'你也在等讀書會？……不是。好。'},{speaker:'classmate_peishan',expression:'thinking',text:'你為什麼念法律？……這個問題很普通。我想聽普通以外的答案。'},{choice:[{text:'「我想知道事情『應該』怎麼處理。」',consequences:{rel:{classmate_peishan:{fam:3,comf:3}}},goto:'should'},{text:'「想幫人。」',consequences:{rel:{classmate_peishan:{fam:3,resp:2}}},goto:'help'},{text:'「妳呢？」',consequences:{rel:{classmate_peishan:{fam:4,trust:3}},mem:[{npc:'classmate_peishan',tag:'IMPORTANT_CONVERSATION',note:'她在想別的路'}]},goto:'her'}]},{label:'should'},{speaker:'classmate_peishan',expression:'thinking',text:'應該。'},{text:'她重複一次。'},{speaker:'classmate_peishan',expression:'smile',text:'我喜歡這個詞。……可是我常常想，是誰說的應該。'},{goto:'end'},{label:'help'},{speaker:'classmate_peishan',expression:'thinking',text:'我以前也這樣說。後來發現想幫人的方法很多，不一定要背條文。'},{goto:'end'},{label:'her'},{speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館兩個月都自在。'},{speaker:'classmate_peishan',expression:'neutral',text:'……我還沒跟家裡說。'},{text:'她停了一下。'},{speaker:'classmate_peishan',expression:'thinking',text:'好奇怪。我第一次講出來，聲音比我想的還大。'},{label:'end'},{text:'她把書包背起來。'},{if:{custom:G=>G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5},speaker:'classmate_peishan',expression:'neutral',text:'讀書會要開始了。'},{unless:{custom:G=>(G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5)||G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我要去上課了。'},{if:{custom:G=>!(G.zone==='wancai'&&G.weekday===3&&G.hour>=17.5)&&(G.hour%24>=18||G.hour>=24)},speaker:'classmate_peishan',expression:'neutral',text:'我先回去了。'},{speaker:'classmate_peishan',expression:'smile',text:'剛剛那個問題，當作我們兩個都還在找。'} ] },
  { id:'ev_zhe_dinner', title:'公館吃什麼', participants:['zhe'], location:['campus','gongguan'], trigger:'interact', priority:2, time:[17,20], cooldown_days:1, random_weight:0.7, background:'blur',
    dialogue:[ {speaker:'zhe',expression:'smile',text:'公館吃什麼？我在麵店、滷味、便利商店之間掙扎二十分鐘了。'},{choice:[{text:'「麵店。」',consequences:{rel:{zhe:{fam:2}},mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'一起去麵店'}],goal:'公館 阿鳳麵店'}},{text:'「我還有東西要讀，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]}},{text:'「便利商店，快。」',consequences:{rel:{zhe:{fam:1}}}}]},{speaker:'zhe',expression:'laugh',text:'好啦。走。'} ] },
  { id:'ev_mingxuan_ball', title:'系籃', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:3, cooldown_days:2, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_mingxuan',tag:'FIRST_MET'}]},speaker:'classmate_mingxuan',expression:'smile',text:'江明軒。阿哲的隊友。他說你上課很敢講。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'週五練球缺人，來不來？不會打也可以，來當經理。'},{choice:[{text:'「好。」',consequences:{rel:{classmate_mingxuan:{fam:4,comf:3},zhe:{fam:2}},flags:{ball_invite:true}}},{text:'「我運動白痴。」',consequences:{rel:{classmate_mingxuan:{fam:2}}}},{text:'「你看起來都沒在念書，成績怎麼那麼好？」',if:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'}},consequences:{rel:{classmate_mingxuan:{fam:3,trust:2}}},goto:'study'}]},{goto:'end'},{label:'study'},{speaker:'classmate_mingxuan',expression:'laugh',text:'上課專心，回家不念。……還有我沒錢補習，只好上課專心。'},{label:'end'} ] },
  // ────────────────────────────────────────── 生活小事件（auto / enter）
  { id:'ev_rain_no_umbrella', title:'下雨了', participants:[], location:'campus', trigger:'enter', weather:'rain', day_min:3, cooldown_days:2, random_weight:0.6, background:'freeze',
    dialogue:[ {speaker:null,text:'走出建築的瞬間，雨。你的傘在宿舍的桌上。'},{choice:[{text:'跑去便利商店買一把（150 元）',consequences:{money:-150,energy:-3,memo:'買了第三把傘'}},{text:'淋回去',consequences:{energy:-8,memo:'淋雨'}},{text:'在屋簷下等十分鐘',consequences:{advance:0.2}}]} ] },
  { id:'ev_library_outlet', title:'插座', participants:[], location:'library', trigger:'enter', time:[13,21], day_min:3, cooldown_days:3, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'閱覽室裡每一個靠插座的位子都有人。有人把充電線拉到桌子中央，像在宣示主權。'},{choice:[{text:'問旁邊的人能不能分一格',consequences:{energy:-1},goto:'ask'},{text:'算了，用電池',consequences:{}}]},{label:'ask'},{speaker:null,text:'對方看了你一眼，把充電線往旁邊挪了三公分。'} ] },
  // ────────────────────────────────────────── 交接包 v1 第 4 批（BB_95 第 3 節：新事件）
  /* 方奕廷 F1：黃金葛（BB_95 3-1）。他平日 12–13 在校園走走（characters.js 的日程）；和他說話就觸發，只一次。植物知識需查證（BB）。
     之後：宿舍書桌旁多一盆黃金葛（POTHOS；story3d.js 的 dormItems、pothosScene：每週澆一次就夠，沒澆也不會枯，只是不長大——v1 只有一個大小）*/
  { id:'ev_fangyt_pothos', title:'黃金葛', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:6, weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    dialogue:[ {speaker:'npc_fangyt',expression:'neutral',text:'你是隔壁房的吧。我經過的時候看到，你們房間沒有綠色的東西。'},{speaker:'npc_fangyt',expression:'smile',text:'（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'莖節會長氣根，所以可以水耕，也可以土耕，而且——'},{speaker:'npc_fangyt',expression:'neutral',text:'……總之，很好養。忘記澆也不會死。'},{speaker:'npc_fangyt',expression:'smile',text:'跟你室友一樣。'},
      {choice:[{text:'「謝謝學長。」',goto:'thanks'},{text:'「我會養死。」',goto:'die'},{text:'「你袋子裡還有幾盆？」',goto:'bag'}]},
      {label:'thanks'},{speaker:'npc_fangyt',expression:'smile',text:'不用謝。它比較需要謝謝你。'},{goto:'end'},
      {label:'die'},{speaker:'npc_fangyt',expression:'neutral',text:'不會。我說過了，它很難死。'},{goto:'end'},
      {label:'bag'},{speaker:'npc_fangyt',expression:'laugh',text:'（笑）七盆。整層樓都要有。'},
      {label:'end'},{speaker:'npc_fangyt',expression:'neutral',text:'死掉的話傳照片給我。'} ],
    consequences:{flags:{POTHOS:true},stamp:['pothosDay'],contact:'npc_fangyt'} },   /* BB_95 4-4：送盆栽時留了聯絡方式（之後「新葉。你的。」用）*/
  /* 阿凱 K1：凌晨三點的螢幕（BB_95 3-2）。睡覺觸發（trigger:'sleep'：story3d.js 的 sleepNow 在睡著之後、天亮之前演，畫面是凌晨三點的房間）：
     大一上第 3～4 週、平日晚上、隔天早上真的有課（「你明天第一堂就有課」只在隔天有早上的課時出現：這裡直接當條件；BB 2026-10-14 把「早八」改成「第一堂」，654f5dd）、只一次。
     三個選項都會換鍵盤，不懲罰：說了＝隔天晚上（ev_kai_keyboard_quiet）；蓋棉被、戴耳塞＝一週後他自己發現（ev_kai_dark_circles），再隔天換。現有的「法無明文」（ev_dorm_late_kai）保留 */
  { id:'ev_kai_late_screen', title:'凌晨三點的螢幕', participants:['kai'], location:'dorm', trigger:'sleep', term:['Y1S1'], weeks:[3,4], weekday:[1,2,3,4,5], time:[17.5,27], day_min:3, once:true, background:'blur',
    prereq:{custom:G=>typeof CLS!=='undefined'&&CLS.dayItems(G,G.day+1).some(it=>!it.exam&&it.t0<12)},
    dialogue:[ {speaker:null,text:'凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'},
      {choice:[{text:'「阿凱，我明天第一堂有課。」',set:{kaiScreenChoice:0},goto:'said'},{text:'（翻身，用棉被蓋住頭）',set:{kaiScreenChoice:1},end:true},{text:'（戴耳塞）',set:{kaiScreenChoice:2},end:true}]},
      {label:'said'},{speaker:'kai',expression:'neutral',text:'（頭沒回）……喔。'} ],
    consequences:{stamp:['kaiScreenDay']} },
  /* K1 之後（蓋棉被、戴耳塞）：一週後的晚上，阿凱自己發現。要在房間裡（他的日程 18–32 在宿舍）*/
  { id:'ev_kai_dark_circles', title:'黑眼圈', participants:['kai'], location:'dorm', trigger:'enter', npcPresent:'kai', time:[18,27], once:true, background:'blur',
    prereq:{flagIs:{kaiScreenChoice:[1,2]},custom:G=>G.flags.kaiScreenDay!=null&&G.day>=G.flags.kaiScreenDay+7},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'你黑眼圈好重，是我嗎。'} ],
    consequences:{stamp:['kaiDarkDay']} },
  /* K1 之後換鍵盤：說了「我明天第一堂有課」的隔天晚上；或黑眼圈的隔天晚上。書桌下的盒子可以看（story3d.js 的 kaiBoxScene：看了才記 HELPED）*/
  { id:'ev_kai_keyboard_quiet', title:'安靜的鍵盤', participants:[], location:'dorm', trigger:'enter', time:[18,27], once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; return (F.kaiScreenChoice===0&&F.kaiScreenDay!=null&&G.day>=F.kaiScreenDay+1)||(F.kaiDarkDay!=null&&G.day>=F.kaiDarkDay+1); }},
    dialogue:[ {speaker:null,text:'螢幕調暗了，鍵盤換成很安靜的一把。'} ],
    consequences:{flags:{KAI_SILENT_KB:true}} },
  /* 讀書會的下一週：學姊的回答（BB_95 3-4）：P1（讀書會上沛珊問「我們為什麼要背這個？」）之後 7 天內的下一次讀書會，讀書會一開始就演（classes3d.js 的 clubEvent；
     沛珊在場、只一次）。學姊四年主題「條列越來越短」的第一個伏筆（BB_90 第 2b 節）。SIS_ANSWERED_WHY：大二上 P3 她決定重考時會讀。
     隔週沒來的玩家沒有這一場：之後第一次去讀書會，沛珊小聲說一句（ev_studygroup_p1b_missed）。舊存檔沒有 P1 的日期（peishanAskedDay）＝當作沒來 */
  { id:'ev_studygroup_p1b', title:'學姊的回答', participants:['heroine_05','classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'上週的問題。我想了一週。三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，因為會考。'},{speaker:'heroine_05',expression:'neutral',text:'二，因為背了，才有東西可以吵。'},{speaker:'heroine_05',expression:'neutral',text:'三……'},{speaker:null,text:'她停住。'},
      {speaker:'heroine_05',expression:'neutral',text:'三我還在想。今天讀刑訴。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}},
      {speaker:'classmate_peishan',expression:'thinking',text:'（小聲）她第一次沒講完三件。'} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  { id:'ev_studygroup_p1b_missed', title:'法服讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],notEvents:['ev_studygroup_p1b'],custom:G=>{ const d=G.flags.peishanAskedDay; return d==null||G.day-d>7; }}, background:'blur',
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（小聲）學姊上週回答了。她說她還在想。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  /* 沛珊 P2b：溫州街的三段論（BB_95 3-5）：P2（ev_peishan_doubt）之後、大一上第 6～7 週（期中前），平日 16–19 在總圖和她說話（她的日程本來就在總圖）。
     交往中（v1 一開始都是）：「去外面講」（總圖門口的階梯），她不說「我請你」（AA_112 8-1）；單身：「去 Café？我請你。」。ADV 背景（Café 窗邊、總圖門口的階梯）還沒有，先用目前畫面。
     法律說明需法律審查（LEGAL_REVIEW_REQUIRED）。「我小時候翻民法」只用 AA_12 的原意（翻得到、看不懂）。影響：筆記的第一頁第一次改寫（NOTE_PAGE1，AA_12 0-3 第 3 點；措辭需法律審查）、沛珊記憶 NOT_FOR_ME */
  { id:'ev_peishan_syllogism', title:'三段論', participants:['classmate_peishan'], location:['library','library_hall'], trigger:'interact', priority:5, weekday:[1,2,3,4,5], time:[16,19], term:['Y1S1'], weeks:[6,7], once:true, prereq:{events:['ev_peishan_doubt']}, background:'blur',
    dialogue:[ {if:{flags:['dating_kexin']},speaker:'classmate_peishan',expression:'neutral',text:'總圖不能講話。去外面講。'},{unless:{flags:['dating_kexin']},speaker:'classmate_peishan',expression:'smile',text:'總圖不能講話。去 Café？我請你。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'老師說法律的推理是三段論。大前提是法條，小前提是事實，結論是……把事實放進法條。'},
      {speaker:'player',text:'（在紙上畫了三個框）所以先找規則，再看這件事符不符合，最後才說結果。'},{speaker:'player',text:'……我小時候翻民法，就是少了中間那一步。'},
      {speaker:'classmate_peishan',expression:'smile',text:'（看著那三個框）你講得很開心耶。'},{speaker:'classmate_peishan',expression:'thinking',text:'我聽完的感覺是，人被放進一個框裡。'},{speaker:'classmate_peishan',expression:'thinking',text:'……我是不是不適合念這個。'},
      {choice:[{text:'「框是用來想清楚的，不是用來關人的。」',goto:'frame'},{text:'「妳可以不喜歡。」',goto:'dislike'},{text:'「我們再寫一題。」',goto:'again'}]},
      {label:'frame'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。'},{speaker:null,text:'她想了很久。'},{speaker:'classmate_peishan',expression:'thinking',text:'我懂你的意思。可是我比較想知道框外面的人在想什麼。'},{goto:'end'},
      {label:'dislike'},{speaker:'classmate_peishan',expression:'surprised',text:'……可以不喜歡？'},{speaker:null,text:'她重複一次，好像第一次聽到有這個選項。'},{speaker:'classmate_peishan',expression:'smile',text:'好，我先記著。'},{goto:'end'},
      {label:'again'},{speaker:null,text:'兩人又寫了一題。她寫得很好。'},{speaker:'classmate_peishan',expression:'thinking',text:'我寫得出來。可是我不想寫。好奇怪。'},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_peishan',tag:'NOT_FOR_ME',note:'三段論那天'}],flags:{NOTE_PAGE1:1},toast:'📓 筆記的第一頁：你改寫了一行'} },
  /* 明軒 M1：公車站的筆記（BB_95 3-6，v1 版）：週二、週四 21–22 點，他家教完剛下公車，在公館騎樓的公車站把民總筆記畫完（characters.js 的日程：linger）。
     和他至少 ACQUAINTANCE、大一上第 7 週（期中前一週）起、只一次。SAW_HIM_STUDY：期中後麵店團的聚餐（A15）阿哲說「明軒從來不念書」時多一個選項。
     解鎖他的聯絡方式；「公館一百元以內」的店家清單（地圖小標，BB_70 F-M1）還沒做。公車站的長椅還沒有（站著）——環境細節那一批（D70） */
  { id:'ev_mingxuan_notes', title:'公車站的筆記', participants:['classmate_mingxuan'], location:'gongguan', trigger:'interact', priority:6, weekday:[2,4], time:[21,22], term:['Y1S1'], once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'},custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.week>=7; }}, background:'blur',
    dialogue:[ {speaker:null,text:'明軒戴著耳機，膝蓋上攤著民總的筆記，三種顏色的螢光筆。'},{speaker:null,text:'他看到你，把筆記蓋起來。'},{speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你沒看到。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（笑）我是說，你什麼都沒看到喔。我是在看漫畫。'},
      {choice:[{text:'「我什麼都沒看到。」',goto:'nothing'},{text:'「你從哪裡回來？」',goto:'where'},{text:'（坐到他旁邊，也拿出筆記）',goto:'sit'}]},
      {label:'nothing'},{speaker:'classmate_mingxuan',expression:'smile',text:'很好。'},{speaker:null,text:'他把筆記打開，繼續畫。'},{speaker:null,text:'走到校門口。'},{speaker:'classmate_mingxuan',expression:'smile',text:'明天見。你什麼都沒看到。'},{goto:'end'},
      {label:'where'},{speaker:'classmate_mingxuan',expression:'neutral',text:'……家教。三個。'},{speaker:null,text:'他看馬路。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我爸的店最近比較忙不過來，我多接一點。'},{speaker:null,text:'然後轉回來，笑了。'},{speaker:'classmate_mingxuan',expression:'smile',text:'好，這個話題結束。你要不要看漫畫？'},{mem:[{npc:'classmate_mingxuan',tag:'SHARED_SECRET',note:'他多接了家教'}]},{goto:'end'},
      {label:'sit'},{speaker:null,text:'兩個人一路沒講話。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'你的螢光筆只有一種顏色？很可憐耶。'},{speaker:null,text:'他給你一支綠色的。'},{set:{GREEN_HIGHLIGHTER:true}},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],contact:'classmate_mingxuan',memo:'在公館的公車站遇到明軒'} },
  /* 校慶：法服的法律問答攤（BB_95 3-7）：大一上第 11 週週六（11/15，校慶日期需查證）10–12 點，走近椰林大道上法服的帳篷（zones3d.js：校慶那天擺出社團博覽會的同一排帳篷；
     學姊的日程那兩小時站在攤前）。沒加入法服的玩家經過也會被她叫住；攤位上還有阿嬤和法服的人，不是兩個人單獨相處。主線不會主動把玩家帶過去（BB_90 第 1 節）。
     阿嬤的問題只引導到「先溝通、再來法服」，不給法律結論、不引用條號（需法律審查；學生不能獨立給法律意見）。
     小插曲（都可以沒有）：芷若——有她的聯絡方式、FAMILIAR 以上：手機問一題（學姊從旁邊看到螢幕）；子晴——INVITED_CLUB：吉他社群組傳攤位照片（story3d.js 的 phoneRules）*/
  { id:'ev_sis_festival_booth', title:'法律問答攤', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[11], weekday:[6], time:[10,12], once:true, npcPresent:'heroine_05', near:{x:-17.8,z:13.0,r:4.5}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'你。過來。'},{speaker:'heroine_05',expression:'neutral',text:'兩件事。一，顧十分鐘。二，不會的不要亂答，叫我。'},
      {speaker:'阿嬤',text:'少年仔，隔壁的樹長到我家這邊，我可以自己剪嗎？'},
      {choice:[{text:'「阿嬤，我幫妳問學姊。」',consequences:{rel:{heroine_05:{fam:2}}},goto:'ask'},{text:'（翻民總的筆記）',consequences:{rel:{heroine_05:{fam:2}}},goto:'notes'},{text:'「我也還不會，我們一起查。」',consequences:{rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'HELPED',note:'一起幫阿嬤查'}]},goto:'search'}]},
      {label:'ask'},{speaker:'heroine_05',expression:'neutral',text:'阿嬤，先跟鄰居講，請他剪。講了一直沒剪，兩週後的週六早上，九點到十二點，來萬才館。我們一起看。'},{goto:'side'},
      {label:'notes'},{speaker:null,text:'翻了半天找不到。學姊探頭。'},{speaker:'heroine_05',expression:'neutral',text:'那是物權。你們大二才上。'},{speaker:'阿嬤',text:'物權是什麼？'},{speaker:'heroine_05',expression:'neutral',text:'……阿嬤，下一次值班，週六早上來。'},{speaker:null,text:'原來法律是分科的。'},{goto:'side'},
      {label:'search'},{speaker:null,text:'你和阿嬤用手機一起查。學姊在旁邊看完。'},{speaker:'heroine_05',expression:'smile',text:'……還可以。'},
      {label:'side'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'聽說你在顧法律問答攤。問一題：電影裡偷看別人的信，算犯罪嗎。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'（從旁邊看到螢幕）哪部電影？'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'……很多部。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'那要一部一部看。'} ],
    consequences:{stamp:['festivalBoothDay'],memo:'校慶，在法服的攤位顧了十分鐘'} },
  /* 學姊 M1：家族聚餐（BB_95 3-8）：大一上第 14 週週五 18:18–19:00 在公館（學姊週五 18:30–20:30 本來就在公館），阿鳳麵店。ADV 背景（麵店）先用目前畫面。
     前一週 Kevin 在家族群組約（phoneRules）；當晚 22:30 學姊在群組訂正考古題；沒去的玩家：Kevin 貼資料夾照片、學姊說書會留給學弟（phoneRules）。
     「善意」的說明需法律審查。三個選項都有 SHARED_MEAL；問「收到」那一題設 SIS_NO_STICKER（同一學期的跨年夜，她第一次在群組貼貼圖，BB_108）。
     第一個選項接第二天的課堂（被周老師點名）；那天沒去上課的玩家沒有這個選項；第二個選項要在家族群組裡（看得到她都回「收到」） */
  { id:'ev_sis_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'gongguan', trigger:'auto', term:['Y1S1'], weeks:[14], weekday:[5], time:[18,19.5], once:true, background:'blur',   /* 窗口放寬到 18:00～19:30（AA_160 3-4 B 表、BB_95 3-8）*/
    dialogue:[ {if:{custom:G=>G.hour%24<18.5},speaker:null,text:'你先到了。麵店的阿姨把你們那一桌的椅子擺好。'},{speaker:null,text:'18:31。她跑進來，有點喘。'},{speaker:'heroine_05',expression:'surprised',text:'抱歉。抱歉。……抱歉，我遲到了。'},{speaker:'Kevin 學長',text:'一分鐘。學姊，一分鐘。'},{speaker:'heroine_05',expression:'neutral',text:'一分鐘也是遲到。'},
      {speaker:null,text:'她坐下，從包包拿出一個資料夾。'},{speaker:'heroine_05',expression:'neutral',text:'三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，周老師歷年的考古題。我整理過，錯的地方用紅筆改了。'},{speaker:'heroine_05',expression:'neutral',text:'二，下學期的書，開學前我會分。書上標紅的地方是修法了，自己查新的。'},{speaker:'heroine_05',expression:'neutral',text:'三——'},
      {speaker:'Kevin 學長',text:'三是傳統！直屬學姊要講一個自己大一的糗事！'},{speaker:'heroine_05',expression:'neutral',text:'……'},{speaker:'heroine_05',expression:'neutral',text:'我大一第一次被點名，老師問什麼是「善意第三人」。我說：心地善良的第三人。'},{speaker:'heroine_05',expression:'neutral',text:'老師說：「那心地不好的第三人，是不是就不用保護了？」'},
      {speaker:null,text:'全桌笑。她也笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'重點是，「善意」在法律上是「不知道」的意思。下學期你們就會學到。'},
      {choice:[{text:'「我第三週被周老師點名。到現在還記得那時候手心的汗。」',unless:{flagIs:{classAnswer:'absent'}},consequences:{rel:{heroine_05:{comf:3}}},goto:'called'},{text:'「學姊在群組為什麼都只回『收到』？」',if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law')},consequences:{rel:{heroine_05:{fam:3}}},set:{SIS_NO_STICKER:true},goto:'sticker'},{text:'（默默把考古題資料夾收進書包）',consequences:{rel:{heroine_05:{resp:2}}},goto:'folder'}]},
      {label:'called'},{speaker:'heroine_05',expression:'smile',text:'那一題大家都會卡。重點是你有回答。'},{goto:'end'},
      {label:'sticker'},{speaker:'heroine_05',expression:'neutral',text:'因為收到了。'},{speaker:'Kevin 學長',text:'她連過年都回收到。'},{speaker:'heroine_05',expression:'neutral',text:'……不然要回什麼？'},{speaker:'Kevin 學長',text:'貼圖啊！'},{speaker:'heroine_05',expression:'neutral',text:'我沒有貼圖。'},{goto:'end'},
      {label:'folder'},{speaker:null,text:'學姊看了一眼。'},{speaker:'heroine_05',expression:'neutral',text:'資料夾回去再看。現在吃麵。'},{speaker:'Kevin 學長',text:'學姊說吃麵耶！'},
      {label:'end'},{speaker:'heroine_05',expression:'smile',text:'下學期的書，我會留給你。'} ],
    consequences:{mem:[{npc:'heroine_05',tag:'SHARED_MEAL',note:'家族聚餐'}],stamp:['familyDinnerDay'],memo:'直屬家族聚餐（阿鳳麵店）'} },
  /* 哲 1：不用約，來就有人（AA_40 哲 1；交付清單 A9）：大一上第 4 週週四起（遊戲裡的第二個週四），週二、週四傍晚在阿鳳麵店遇到阿哲（他的日程 17:30–20:30）——
     第 4 週週四沒去的玩家，順延到之後第一次在麵店遇到他（BB_95 第 5 節第 4 點：不能永久錯過）；只一次。麵店的長桌從這裡開始：
     阿哲建「麵店團」群組（AA_70 2-3），之後每個上課週的週二、週四 17:30 他在群組裡揪（story3d.js 的 phoneRules）。阿姨＝麵店的老闆娘（店員是路人模型，沒有名字）*/
  { id:'ev_zhe_long_table', title:'不用約，來就有人', participants:['zhe'], location:'noodle', trigger:'auto', near:{npc:'zhe',r:6}, term:['Y1S1'], weekday:[2,4], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S1',4,4)},
    dialogue:[ {speaker:'zhe',expression:'smile',text:'（把兩張桌子併起來）阿姨，我們以後週二週四都來。'},{speaker:'阿姨',text:'你們？你們是誰？'},
      {speaker:'zhe',expression:'laugh',text:'法律系一年級。現在是四個，之後會更多。'},{speaker:'zhe',expression:'smile',text:'（對你）規矩很簡單：週二週四，麵店。不用約，來就有人。'} ],
    consequences:{stamp:['noodleTableDay']} },
  /* 語 1：傅鐘旁邊的早餐（AA_40 語 1；交付清單 A10）：大一上第 3～5 週的早上，小語坐在傅鐘旁邊的長椅（她的日程 9:30–12:00），找她說話時；
     要先認識她（第一次說話是 talkYu 的自我介紹），而且不是認識的同一天（自我介紹已經講過三個社團）；只一次。
     「坐下來一起吃」記憶 BREAKFAST_YU（之後早上經過傅鐘她會先揮手：AA_118，之後再做）。吉他社的入口之一（另一個是阿凱）*/
  { id:'ev_yu_breakfast', title:'傅鐘旁邊的早餐', participants:['yu'], location:'campus', trigger:'interact', priority:6, term:['Y1S1'], weeks:[3,4,5], time:[9.5,12], once:true, background:'blur',
    prereq:{flags:['met_yu'],custom:G=>G.flags.metYuDay==null||G.flags.metYuDay<G.day},
    dialogue:[ {speaker:'yu',expression:'smile',text:'欸，你要不要坐？'},{speaker:'yu',expression:'neutral',text:'我一個人吃很怪。……不是怪，是很安靜。我不喜歡安靜。'},
      {speaker:'yu',expression:'smile',text:'對了，你有參加社團嗎？我有三個。你要不要加一個？吉他社缺人，辯論社也缺人，系學會永遠缺人。'},
      {choice:[{text:'（坐下來一起吃）',consequences:{mem:[{npc:'yu',tag:'BREAKFAST_YU',note:'傅鐘旁邊的早餐'}],flags:{YU_CLUB_INVITE:true},advance:0.25},goto:'sit'},{text:'「我上課要遲到了。」',goto:'rush'},{text:'「三個社團不會累嗎？」',goto:'tired'}]},
      {label:'sit'},{speaker:null,text:'她講了十五分鐘，關於三個社團。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'yu')},speaker:'yu',expression:'smile',text:'欸你有沒有群組？沒有？我拉你。',consequences:{contact:'yu'}},{speaker:'yu',expression:'smile',text:'明天你也會經過嗎？'},{goto:'end'},   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-4）*/
      {label:'rush'},{speaker:'yu',expression:'smile',text:'喔，好！'},{speaker:null,text:'她揮手。等你走遠，她把耳機戴上。'},{goto:'end'},
      {label:'tired'},{speaker:'yu',expression:'laugh',text:'累啊。'},{speaker:'yu',expression:'smile',text:'可是累就不會想東想西。'},
      {label:'end'} ],
    after:(G,GM)=>{ if(G.flags.YU_CLUB_INVITE&&GM.addNote) GM.addNote('yu_club_guitar','吉他社（小語說的）','第 5 週起，週一、週三 19:00，萬才館一樓多功能教室。'); } },   /* AA_156 1-1：只有「坐下來一起吃」那一支有時間地點（她講了十五分鐘三個社團）；不設 guitar_invite（那是阿凱跟子晴提過你）*/
  /* 以安的報告分工（交接包 v1 第 3 節，AA 2026-10-14 補台詞；交付清單 A12；AA_113 9-1「分組報告是合作」）：大一上第 4 週週四民總下課後（第 4 週沒去上課的話，第 5 週那堂）——
     classes3d.js 的 afterClassEvent：那堂課上完就在教室裡接著演（afterClass＝課的 id；trigger 'class' 不會被別的地方觸發）。
     條件：第二天和以安一起度過下午（Café 或總圖：afternoonDone，cafeView 兩邊都有）；沒有的玩家沒有這一段，以安自己寫。舊存檔已經演過「報告的結論」（她自己寫完了）的也沒有。
     「好，一起寫。」＝記憶 REPORT_PARTNER、照第二天的看法分工；「我已經有組了。」不扣分。之後：沒有一起寫的，她寫完在總圖給你看（ev_an_report_followup）；第 6 週報告發回來兩種都接得上 */
  { id:'ev_an_report_split', title:'民總的報告', participants:['heroine_01'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[4,5], weekday:[4], once:true, npcPresent:'heroine_01', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_followup']},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（把講義收好）民總的報告，兩人一組。我還沒找人。'},{speaker:'heroine_01',expression:'neutral',text:'你那天講的，我想放進去。'},
      {choice:[{text:'「好，一起寫。」',consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'民總報告一起寫'}]},goto:'yes'},{text:'「我已經有組了。」',goto:'no'}]},
      {label:'yes'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'那結論你寫。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'smile',text:'那反方你寫。'},
      {if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'那判斷標準你寫，你比我會講。'},{goto:'end'},
      {label:'no'},{speaker:'heroine_01',expression:'neutral',text:'好。那我自己寫，寫完給你看。'},
      {label:'end'} ] },
  /* 迎新（交接包 v1 A11：AA_71 2-1＋沛珊 P0 BB_95 3-3）：參加法律系迎新的活動時演（src/data/activities.js 的 welcome_y1s1：第 4 週週六傅鐘前；classes3d.js 的 attendActivity 讀活動的 event）。
     只有認識的人在場（交付清單第 0 節第 1 點）：小語、柏翰沒見過就跳過那兩句；以安見過才算在場（說了經濟系那一年，她記得 KNOWS_ECON_YEAR）。
     自我介紹由玩家選說多少（不能替玩家說出經濟系那一年，AA_12 0-4）：只有「念過一年經濟」設 ECON_PAST_SHARED='full'；「大一歲」不設；說過的事不會變成沒說過（重修經原已經說過的照舊）。
     沛珊 P0：大地遊戲同一組、「奇怪的問題」只在這裡一次；記 FIRST_MET（participants）＋聯絡方式（迎新的群組）。第一句、「輪到你。」、大地遊戲那句是 LAWWW 加的場景說明（等 AA 看）*/
  /* 民總報告分組的補救（AA_160 3-4 C、R3，AA-B 2026-10-16 寫的台詞）：第 4、5 週民總都沒去、分組事件沒演過——第 6 週起第一次在教室或總圖遇到以安，
     她說把你寫進她那組了；記同一個 REPORT_PARTNER（備註 assigned_absent）＋REPORT_PARTNER_LATE，後面讀 REPORT_PARTNER 的事件照常接。分組是事實、不是玩家經歷的場面（R4）*/
  { id:'ev_an_report_split_late', title:'民總的報告（分組那天你沒來）', participants:['heroine_01'], location:['classroom','library','library_hall'], trigger:'auto', near:{npc:'heroine_01',r:5}, term:['Y1S1'], weeks:[6,7,8,9,10,11,12,13,14,15,16], once:true, keep:'must', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'民總的報告，老師分組那天你沒來。'},{speaker:'heroine_01',expression:'smile',text:'我把你寫在我這組了。……不用謝。理由：剩下的人裡，你最不會遲交。'} ],
    consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'分組那天沒來，以安把你寫進她那組'}],flags:{REPORT_PARTNER_LATE:'assigned_absent'}} },
  { id:'ev_welcome_y1s1', title:'迎新', participants:['classmate_peishan'], location:'campus', trigger:'activity', term:['Y1S1'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'傅鐘前面，法律系的迎新。學長姊帶隊，大家先輪流自我介紹。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'小語自我介紹講了三分鐘她的三個社團。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',expression:'neutral',text:'（小聲）她剛剛講了四個。'},
      {speaker:null,text:'輪到你。'},
      {choice:[{text:'「我叫{name}，臺北人。」',goto:'game'},{text:'「我比大家大一歲。」',goto:'older'},{text:'「我二十歲。念過一年經濟。」',goto:'econ'}]},
      {label:'older'},{speaker:'zhe',expression:'laugh',text:'那我們叫你哥？'},{speaker:'player',text:'不要。'},{goto:'game'},
      {label:'econ'},{set:{ECON_PAST_SHARED:'full'}},{if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','FIRST_MET')},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'迎新的自我介紹：你說念過一年經濟'}]},
      {speaker:null,text:'全場「喔——」。'},{speaker:'zhe',expression:'laugh',text:'哥！'},
      {label:'game'},{speaker:null,text:'大地遊戲，你和沛珊同一組。最後一關：用一句話說為什麼念法律。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我可以問一個奇怪的問題嗎。……如果答不出來，可以算過關嗎？'},
      {choice:[{text:'（替她答）「她想知道法律外面還有什麼。」',goto:'answer'},{text:'「我也還在找。」',goto:'search'}]},
      {label:'answer'},{speaker:null,text:'她看了你一眼。'},{speaker:'classmate_peishan',expression:'surprised',text:'……你怎麼知道。'},{speaker:null,text:'關主讓你們過了。'},{goto:'end'},
      {label:'search'},{speaker:'classmate_peishan',expression:'smile',text:'好。那我們兩個都還在找。'},
      {label:'end'} ],
    consequences:{contact:'classmate_peishan',stamp:['welcomeDay']} },
  /* 可昕 K1 導遊：第一次開車去政大（BB_95 9-1）：出遊事件（trigger 'outing'：src/outings3d.js 在約好的時間問「出發」，出發才演）；政大的 2D 背景還沒有圖（深色底＋地點字幕）。
     影子那一題三個選項都不記憶（BB 2026-10-14）；小吃街記 K1_ORDER（hers／mine／let_her）；記憶 OUR_SHOP_FIRST；NCCU_VISITED。只一次。
     v1 不放經濟系大一的回聲（「上次是假裝的導遊。這次是真的。」）*/
  { id:'ev_kexin_tour_nccu', title:'導遊', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'校門口。她在揮手，只戴一邊的耳環，今天是一隻小長頸鹿。'},   /* BB_95 9-1（2026-10-16 BB-B 定稿）：所有玩家都是長頸鹿（她的識別物，和 BCG-27 一致）；「小骰子」作廢 */
      {cg:'cg_tour_guide_kexin'},   /* BCG-27「我是今天的導遊」：放在含「我是今天的導遊」的那一句（BB_95 9-1、BB_117 第 4d 節）*/
      {speaker:'kexin',expression:'smile',text:'暑假那次學校沒人，不算。今天才是真的政大。我是今天的導遊。'},   /* AA_140 3-5 F（2026-10-16）：同意 BB-B 的句子（和經濟系那年 E37 的暑假那一次不矛盾）*/
      {speaker:'kexin',expression:'smile',text:'我在這裡念了{flag:kxTourWeeks|三}個禮拜，所以比你懂這裡{flag:kxTourWeeks|三}個禮拜。'},   /* AA 審 9-1 第 2 點：K1 延後時照實際的週數（排出遊時記下：story3d.js）*/
      {speaker:null,text:'她指了左邊、右邊、後面。'},
      {speaker:'kexin',expression:'laugh',text:'法學院。山。也是山。政大的地圖重點就是：山。'},
      {speaker:'kexin',expression:'teasing',text:'假設你的影子先到政大，它可以幫你點餐嗎？'},
      {choice:[{text:'「可以，它跟我點一樣的。」',goto:'s1'},{text:'「不行，影子不會講話。」',goto:'s2'},{text:'「它會先幫妳點。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'laugh',text:'那它也要付錢。……好，影子請客。'},{goto:'food'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'那它比你安靜。我考慮一下要帶哪一個。'},{goto:'food'},
      {label:'s3'},{speaker:'kexin',expression:'smile',text:'……這題你答得太快了。'},{speaker:null,text:'她先走進校門。'},
      {label:'food'},{scene:'政大・山下的小吃街',bg:'nccu_food'},
      {choice:[{text:'（吃她推薦的）',set:{K1_ORDER:'hers'},goto:'o1'},{text:'（自己挑一家）',set:{K1_ORDER:'mine'},goto:'o2'},{text:'「妳幫我點。」',set:{K1_ORDER:'let_her'},goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好，信任導遊。'},{speaker:null,text:'她點了兩碗酸辣湯餃。'},{goto:'park'},
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'你挑的那家，我還沒吃過。……好，今天換你當導遊。'},{goto:'park'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'讓我點的人，第三次老闆就會記得你。'},
      {label:'park'},{scene:'政大・校門口',bg:'nccu_gate'},   /* 原本是停車場；政大只做主要校園＋宿舍（使用者 10-16），AA_137 7-1：她送你到校門口，台詞照用 */
      {speaker:'kexin',expression:'smile',text:'以後你開車來找我，我負責選宵夜。'},
      {speaker:'kexin',expression:'neutral',text:'……這是分工，不是命令。'} ],
    consequences:{flags:{NCCU_VISITED:true},mem:[{npc:'kexin',tag:'OUR_SHOP_FIRST',note:'政大山下的小吃街'}],memo:'第一次去政大：可昕當導遊'} },
  /* 可昕 K1b 予樂說：及格（BB_95 9-2）：K1 之後第 6～8 週，她在平日下午傳「明天晚上有空嗎？……」（story3d.js 的 phoneRules）；答應＝隔天 19:30、晚一點＝21:00 去政大（出遊）。
     流程照 AA_112 第 12 節：校門 → 山下的小吃街（予樂先到；予樂的第一句三選一＝YL_IMPRESSION）→ 可昕到了 → 河堤（假設題，玩笑、不給結論）→ 圖書館 → 停車場（約下一次）；
     （2026-10-16 AA_137 7-1：政大只做主要校園＋宿舍——河堤→校園裡的路、圖書館→自強十舍樓下、停車場→校門；台詞不改）
     隔天中午她傳予樂的紙條照片「及格。」（phoneRules）。「這週不行」：她自己去，隔天傳予樂戴紙巾皇冠的照片，予樂的第一句延到第一次見面。
     旁白「可昕到了……」「她在桌下踢你一下……」、圖書館那一句、停車場的兩個選項之後沒有回應，是照 BB 的流程寫成的（等 BB 看）*/
  { id:'ev_kexin_yule_pass', title:'予樂說：及格', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'停車場只剩最邊邊的一格。'},
      {phone:'kexin',text:'再十分鐘！你先去山下那間，幫我點酸辣湯餃。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:'予樂',text:'你就是那個……開車的？'},
      {speaker:'予樂',text:'我問你，台大法律系是不是都很難聊？'},
      {choice:[{text:'「司機兼男朋友。」',set:{YL_IMPRESSION:'funny'},goto:'y1'},{text:'「是。所以我來政大聊。」',set:{YL_IMPRESSION:'honest'},goto:'y2'},{text:'「妳好，我是{name}。」',set:{YL_IMPRESSION:'polite'},goto:'y3'}]},
      {label:'y1'},{speaker:'予樂',text:'好。司機。我記住了。'},{goto:'arrive'},
      {label:'y2'},{speaker:'予樂',text:'……可以，你很老實。'},{goto:'arrive'},
      {label:'y3'},{speaker:'予樂',text:'好客氣。可昕，他好客氣。'},
      {label:'arrive'},{speaker:null,text:'可昕到了。桌上聊報告、老師、學校的八卦。'},{speaker:null,text:'她在桌下踢你一下——意思是「你剛剛那句很好笑」。'},
      {scene:'政大・校園裡的路',bg:'nccu_campus'},   /* AA_137 7-1：原本是河堤 → 政大主要校園的路（散步）；假設題照用 */
      {speaker:'kexin',expression:'teasing',text:'假設我把你的筆記借給予樂，算無權處分嗎？'},
      {choice:[{text:'「要先問我。」',goto:'r1'},{text:'「借吧，反正她看不懂。」',goto:'r2'},{text:'（笑）',goto:'r3'}]},
      {label:'r1'},{speaker:'kexin',expression:'smile',text:'好。我現在問了：可以嗎？'},{goto:'lib'},
      {label:'r2'},{speaker:'kexin',expression:'teasing',text:'……這句我會轉告她。'},{goto:'lib'},
      {label:'r3'},{speaker:'kexin',expression:'laugh',text:'笑也是一種回答。我當你答應了。'},
      {label:'lib'},{scene:'政大・宿舍樓下',bg:'nccu_dorm'},   /* AA_137 7-1：原本是圖書館 → 自強十舍樓下的長椅（不進宿舍）；台詞照用 */
      {speaker:null,text:'她要寫完一段報告。你坐下來一起讀。'},
      {speaker:'kexin',expression:'neutral',text:'你翻頁好大聲。'},
      {scene:'政大・校門口',bg:'nccu_gate'},   /* AA_137 7-1：原本是停車場 → 校門（約下一次）*/
      {choice:[{text:'「週末換妳來台大？」',set:{KX_NTU_ASKED:true},goto:'p1'},{text:'「明天考完傳訊息給我。」',goto:'p2'}]},
      {label:'p1'},{speaker:'kexin',expression:'smile',text:'好。我先去找品妤，再去抓你。'},{goto:'pend'},
      {label:'p2'},{speaker:'kexin',expression:'teasing',text:'好。考爛了也要傳。'},
      {label:'pend'} ],
    consequences:{stamp:['yulePassDay'],memo:'在政大見到予樂'} },
  /* 中秋烤肉（交付清單 A13：AA_71 2-2、AA_109 7-3）＋可昕 K3 第一次見麵店團（BB_95 9-4）：大一上第 5 週週六 15:00 河濱（出遊；阿哲在麵店團群組、沒有群組的私訊揪，story3d.js）。
     只有認識的人在場（交付清單第 0 節第 1 點）：AA 的「小事」每一句看那個人認識了沒；語彤不在就沒有阿姨醃的肉那一段。可昕：前一天她問，回「來我們這邊」才來（KX_BBQ_COME）。
     介紹她三選一（BB 2026-10-14）：只有第三個、而且原本不是 full 才把 ECON_PAST_SHARED 升成 full（以安在場加 KNOWS_ECON_YEAR）；之後阿哲和她比冷笑話，玩家選誰贏。
     AA 的「小事」是條列，旁白照條列的字寫成句子。AA 2026-10-14：沒有麵店團群組的玩家第一句是「大家借了」；加「你被分到顧火。火一直熄。」；
     只記 MIDAUTUMN_Y1，不加數值、不記 SHARED_MEAL */
  { id:'ev_mid_autumn_bbq', title:'中秋烤肉', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。麵店團借了一個烤肉架。'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。大家借了一個烤肉架。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤，小語負責吃。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤。'},
      {cg:'cg_midautumn_riverside'},   /* CG-14 中秋的河濱（BB 2026-10-14 ART_APPROVED）：去烤肉的玩家都有，從這一句起 */
      {speaker:null,text:'你被分到顧火。火一直熄。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:null,text:'以安帶了一張「烤肉時間表」。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'語彤帶了阿姨醃的肉。全場最好吃。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰帶了考古題，被沒收了。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},set:{BBQ_BOHAN_SEIZED:true}},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:null,text:'隔壁房的方奕廷也來了，一直在講河邊的植物。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'阿姨醃的肉被搶光了。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'zhe',expression:'laugh',text:'可以叫阿姨開一個烤肉的菜單嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'不行。她會真的開。'},
      {unless:{flags:['KX_BBQ_COME']},goto:'end'},
      {speaker:null,text:'可昕來了。'},
      {choice:[{text:'「這是可昕，我女朋友。」',set:{KX_INTRO:'gf'},goto:'i1'},{text:'「她會出題考你們。」',set:{KX_INTRO:'quiz'},goto:'i2'},{text:'「讓她說我們怎麼認識的。」',set:{KX_INTRO:'story'},goto:'i3'}]},
      {label:'i1'},{speaker:'zhe',expression:'smile',text:'哪間學校的？'},{speaker:'kexin',expression:'smile',text:'政大的。考古題可以交換。'},{goto:'joke'},
      {label:'i2'},{speaker:'kexin',expression:'teasing',text:'是假設題。假設你是一塊烤肉——'},{speaker:'zhe',expression:'laugh',text:'我拒絕回答。'},{goto:'joke'},
      {label:'i3'},{speaker:'kexin',expression:'smile',text:'杜可昕。政大法律。我們以前是經濟系的同學。……他重考的時候，坐我對面。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'known'},
      {speaker:'zhe',expression:'surprised',text:'等一下。經濟系？重考？'},{speaker:'player',text:'……嗯。一年。'},
      {set:{ECON_PAST_SHARED:'full'}},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'中秋烤肉：可昕說了你們以前是經濟系的同學'}]},{goto:'joke'},
      {label:'known'},{speaker:'zhe',expression:'laugh',text:'喔——就是那一年。'},
      {label:'joke'},{speaker:null,text:'之後阿哲和她比冷笑話。'},
      {choice:[{text:'（阿哲贏）',set:{KX_JOKE:'zhe'},goto:'zw'},{text:'（可昕贏）',set:{KX_JOKE:'kexin'},goto:'kw'}]},
      {label:'zw'},{speaker:'kexin',expression:'smile',text:'好，我回去練。'},{goto:'end'},
      {label:'kw'},{speaker:'kexin',expression:'laugh',text:'我練過。經濟系有一個人，冷笑話講到全營地睡著。'},
      {label:'end'} ],
    consequences:{flags:{MIDAUTUMN_Y1:true},stamp:['bbqDay'],memo:'中秋烤肉（河濱）'},
    after:(G)=>{ if(G.flags.KX_BBQ_COME) G.flags.KX_MET_NOODLE_TEAM=true; } },
  /* 以安新 3 宿舍的規則（交付清單 A14；交接包_v1 第 3 節、AA_113 事件 3）：祐廷不在，轉述。麵店團群組的訊息在 story3d.js 的 phoneRules（第 7 週週二晚上）；
     沒有加入麵店團群組的玩家，改成沛珊當面說同樣的內容（第 7 週起找她說話；要認識她）。只記旗標 AN_DORM_RULES（聽說，不寫成玩家在場）*/
  { id:'ev_an_dorm_rules_peishan', title:'宿舍的規則', participants:['classmate_peishan'], location:'any', trigger:'interact', priority:3, term:['Y1S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],custom:G=>{ if(G.flags.AN_DORM_RULES||typeof STORY==='undefined'||!STORY.termDay) return false; const g=G.phone&&G.phone.groups&&G.phone.groups.noodle_team; return !(g&&g.day<=STORY.termDay('Y1S1',7,2))&&G.day>=STORY.termDay('Y1S1',7,1); }},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'} ],
    consequences:{flags:{AN_DORM_RULES:'peishan'}} },
  /* G1 考完試走出教室（交付清單 A15：AA_13 G1）：大一上民總期中考考完，在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'mid'）；一定會發生。
     只有認識的人在場：柏翰沒見過＝第一句變成旁白（有人在問第二題）、他和芯慈的那段（和祐廷無關的一句）兩個人都認識才有；小語、明軒、以安沒見過就跳過。
     第一個選項要第一天讀過案例（readCase 不是 none）。只改變誰跟你走；記憶 SHARED_CLASS（在場、認識的同學）。考題不出題庫，只說「第二題」*/
  { id:'ev_midterm_walkout', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'civ_general', afterExam:'mid', term:['Y1S1'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'第二題，你們是寫要約之引誘還是要約？'},
      {unless:EV_KNOWS('classmate_bohan'),speaker:null,text:'有人在問：第二題，是寫要約之引誘還是要約？'},
      {speaker:'zhe',expression:'surprised',text:'……有第二題？'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'我寫要約。我覺得是要約。（停）完了，我寫要約。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'（小聲）我寫引誘，然後補了一段反對意見。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'反對意見誰的？'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'我自己的。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'……可以這樣寫嗎？'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',expression:'neutral',text:'不要對了啦，去吃飯。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'（從教室出來，把筆收進筆袋）對答案沒有用。考完了就是考完了。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'……我寫引誘。'},
      {choice:[{text:'「我寫引誘，第二天那個案子就是這個。」',unless:{flagIs:{readCase:['none',undefined]}},set:{G1_PICK:'case'},goto:'c1'},{text:'「我寫要約。」',set:{G1_PICK:'offer'},goto:'c2'},{text:'「去吃飯。」',set:{G1_PICK:'eat'},goto:'c3'}]},
      {label:'c1'},{if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'surprised',text:'你也讀了判決？'},{goto:'end'},
      {label:'c2'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'同一國的！'},{goto:'end'},
      {label:'c3'},{if:EV_KNOWS('classmate_mingxuan'),speaker:'阿哲、明軒',text:'走！'},{unless:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'走！'},
      {label:'end'},
      /* 考完的宵夜（A15，AA 2026-10-14）：沒有麵店團群組的玩家，阿哲當面問；有群組的在群組揪（story3d.js 的 phoneRules）*/
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:'zhe',expression:'smile',text:'晚上滷味，來不來？'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID1:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID1:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','民總期中考'); } },
  /* 翰 1 你考幾分（交付清單 A16：AA_40 翰 1，接 ev_bohan_kaogu；AA 2026-10-14）：大一上期中放榜——第 10 週的民總下課（第 10 週沒去上課的話第 11 週那堂），霖澤館走廊。
     遊戲不顯示分數（AA_104 第 10 節）：「（告訴他分數）」只有旁白「你說了分數。」，比他高／低照民總的準備程度（很好＝比他高，不錯以下＝比他低：CLS.gradeOf）。
     記憶 TOLD_SCORE（備註寫比他高／低；分數高於他的玩家，大二的翰 2 會被邀請）、ASKED_BACK（翰 4 多一句）；BOHAN_SCORE：higher／lower／no（「不想說。」翰 2 不邀請）。
     沒見過他：先用 ev_bohan_kaogu 的自我介紹那句 */
  { id:'ev_bohan_score', title:'你考幾分', participants:['classmate_bohan'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[10,11], once:true, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。'},
      {speaker:'classmate_bohan',expression:'serious',text:'你民總幾分？'},
      {speaker:'classmate_bohan',expression:'neutral',text:'我問了十四個人。你是第十五個。'},
      {choice:[{text:'（告訴他分數）',goto:'tell'},{text:'「不想說。」',set:{BOHAN_SCORE:'no'},goto:'no'},{text:'「你考幾分？」',set:{BOHAN_SCORE:'asked'},consequences:{mem:[{npc:'classmate_bohan',tag:'ASKED_BACK',note:'期中放榜，反問他考幾分'}]},goto:'back'}]},
      {label:'tell'},{speaker:null,text:'你說了分數。'},
      {if:{custom:G=>typeof CLS!=='undefined'&&CLS.gradeOf(((CLS.rec(G)||{}).prep||{}).civ_general||0)==='很好'},goto:'hi'},
      {set:{BOHAN_SCORE:'lower'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他低）'}]},
      {speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他也寫進手機的備忘錄。'},{goto:'end'},
      {label:'hi'},{set:{BOHAN_SCORE:'higher'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他高）'}]},
      {speaker:null,text:'他點頭，寫進手機的備忘錄。'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{goto:'end'},
      {label:'no'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他沒有生氣，只是把「15」改成「14」。'},{goto:'end'},
      {label:'back'},{speaker:null,text:'他停了一下。'},{speaker:'classmate_bohan',expression:'neutral',text:'……八十一。第六。'},{speaker:null,text:'第一次有人反問他。'},
      {label:'end'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_bohan')},speaker:'classmate_bohan',expression:'neutral',text:'你的聯絡方式。考古題要傳給你。',consequences:{contact:'classmate_bohan'}} ] },   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-5：期中放榜那天）*/
  /* 考完的宵夜（交付清單 A15：AA_71 2-4、BB_95 3-6，AA 2026-10-14）：民總期中考那天晚上 20:30 公館滷味攤。公館有 3D 區域，滷味攤還沒有：先用出遊（轉場＋深色底，
     背景 gongguan_luwei 在 MISSING_EXTERNAL_ART）。誰揪：有麵店團群組＝阿哲在群組「考完了。滷味。」；沒有＝G1 結束時當面問。去不去由玩家選，不去不扣分。
     只有認識的人在場：明軒認識才有阿哲那句（考完當晚還沒有成績：「成績出來一定比我高」）；有 SAW_HIM_STUDY 多一個選項「……他有念啦。」→ 明軒瞪你一眼、請你一顆滷蛋；
     柏翰、芯慈、小語三個人都認識才有吵第三題那段。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  { id:'ev_midterm_supper', title:'考完的宵夜', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館・滷味攤',bg:'gongguan_luwei'},
      {speaker:null,text:'公館的滷味攤前，大家在對答案。'},
      {speaker:null,text:'有人只想吃，不想對：「不要跟我講第二題。」'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'明軒從來不念書，成績出來一定比我高。我恨他。'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},choice:[{text:'「……他有念啦。」',set:{SUPPER_MX_EGG:true},goto:'egg'},{text:'（繼續吃滷味）',goto:'tri'}]},
      {goto:'tri'},
      {label:'egg'},{speaker:null,text:'明軒瞪了你一眼。'},{speaker:null,text:'然後請你一顆滷蛋。'},
      {label:'tri'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:null,text:'柏翰和芯慈為了第三題的答案吵到滷味都冷了。'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:'yu',expression:'neutral',text:'你們兩個要不要結婚。'},
      {if:EV_KNOWS('classmate_bohan','classmate_xinci','yu'),speaker:'柏翰、芯慈',text:'不要。'} ],
    consequences:{stamp:['supperMid1Day'],memo:'考完的宵夜（公館滷味攤）'} },
  /* 期中考完（大一下，交接包 v2 C11、C21 第二個畫面；AA 2026-10-14 64ceb70）：刑總二期中考那天（第 8 週週三 4/15，上午考完）。
     G1 大一下版：旁白沿用大一上，加阿哲那句，沒有選項；沒有麵店團群組的玩家，最後阿哲當面問晚上的麵店（「去。」才排）。
     晚上 19:00 阿鳳麵店長桌（考完的晚餐；大一上是公館滷味，這次換地方）：出遊（到時候問要不要去，不去不扣分）；麵店有 3D 區域，長桌這一幕先用 2D 底＋字幕
     （背景 noodle_table 在 MISSING_EXTERNAL_ART）。開頭不重複大一上（小語、阿哲：認識小語才有）；明軒的回聲（有 SAW_HIM_STUDY、認識明軒）——
     「（繼續吃麵）」是 LAWWW 照大一上「（繼續吃滷味）」加的選項字；接著沛珊和柏翰（BB_100 2-3：認識沛珊才有；旁白的「她」寫成「沛珊」）。
     沒去、在麵店團群組、認識沛珊：20:30 群組裡阿哲「……喔。」＋切成兩半的滷蛋照片，記「聽說」（HEARD_ABOUT）*/
  { id:'ev_midterm_walkout_y1s2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'crim_gen2', afterExam:'mid', term:['Y1S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {speaker:'zhe',expression:'laugh',text:'刑總二比刑總一難。我說的是我的分數。'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:'zhe',expression:'smile',text:'晚上麵店，七點，來不來？'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID2:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID2:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','刑總二期中考'); } },
  { id:'ev_midterm_supper_y1s2', title:'考完的晚餐', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'今天不講考試。誰講誰請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'smile',text:'那第二題——'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'你請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'surprised',text:'我還沒講完！'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},goto:'mx'},{goto:'ps'},
      {label:'mx'},{speaker:'zhe',expression:'neutral',text:'明軒說他這次也沒念。'},
      {choice:[{text:'「……他有念。我看到了。」',set:{SUPPER2_MX:true},goto:'mx2'},{text:'（繼續吃麵）',goto:'ps'}]},
      {label:'mx2'},{speaker:'classmate_mingxuan',expression:'laugh',text:'……哈哈。這次換我請。'},
      {label:'ps'},
      {if:EV_KNOWS('classmate_peishan'),speaker:null,text:'柏翰幫沛珊把滷蛋切成兩半。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'zhe',expression:'surprised',text:'……喔。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:null,text:'全桌安靜三秒。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'classmate_peishan',expression:'neutral',text:'對，我們在一起了。你們吃你們的。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'classmate_bohan',expression:'neutral',text:'（推了一下眼鏡）……這題沒有考古題。'} ],
    consequences:{stamp:['supperMid2Day'],memo:'考完的晚餐（阿鳳麵店長桌）'},
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||!PHONE.inGroup(G,'noodle_team')||typeof STORY==='undefined'||!STORY.knows('classmate_peishan',G)) return;
      PHONE.at(G,q.day,Math.max(20.5,G.day===q.day?G.hour:0),[{th:'g:noodle_team',from:'zhe',text:'……喔。'},{th:'g:noodle_team',from:'zhe',text:'📷（一顆切成兩半的滷蛋）'}],'zhe_supper_mid2_egg');
      if(typeof SOCIAL!=='undefined') SOCIAL.remember('classmate_peishan','HEARD_ABOUT','和柏翰在一起了（聽說）'); } },
  /* 經濟系的朋友（BB_96 第 10 節，BB 2026-10-14）——10-1 P4d「你怎麼又在這裡？」（大一下版）：重修經原（下）下課，普通教學館的走廊；第 2 週週五（3/6）。
     那天沒去上課的，延到下一個有去的週五（第 3～5、7 週；第 6 週週五是春假、第 8 週是期中考）；一直沒去就不發生。
     阿勳（盧正勳，經濟系大二）、品妤（v1 K2 見過＝只點頭「你來了。」；沒見過＝先介紹自己）。兩個人還沒有 3D 人物，只有台詞（同 K2 的品妤）。
     通則（BB_105 2-1）：經濟系的朋友在法律系時期第一次出現，先加一句重新介紹；經濟系大一還沒實作，所有玩家都有阿勳那句。
     記 P4D_ANSWER（retake／good／long）、MET_XUN（法律系時期見過阿勳：之後的事件不再重新介紹）、MET_PINYU、ECON_HALLWAY_DAY（SK03 小福午餐從下一個週五開始）*/
  { id:'ev_econ_hallway', title:'你怎麼又在這裡？', participants:[], location:'any', trigger:'class', afterClass:'econ_principles_2', term:['Y1S2'], weeks:[2,3,4,5,7], weekday:[5], once:true, background:'blur',
    dialogue:[ {speaker:'阿勳',text:'……你怎麼又在這裡？'},
      {speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'},
      {if:{flags:['MET_PINYU']},speaker:'品妤',text:'你來了。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},
      {choice:[{text:'「重修。」',set:{P4D_ANSWER:'retake'},goto:'r'},{text:'「我在法律系，很好。」',set:{P4D_ANSWER:'good'},goto:'g'},{text:'「說來話長。」',set:{P4D_ANSWER:'long'},goto:'l'}]},
      {label:'r'},{speaker:'阿勳',text:'重修。……你看起來比去年清醒。'},{goto:'end'},
      {label:'g'},{speaker:'阿勳',text:'看得出來。你走路變快了。'},{goto:'end'},
      {label:'l'},{speaker:'阿勳',text:'那下次說。'},
      {label:'end'},{speaker:'阿勳',text:'週五中午，我們在小福。你要來就來。'} ],
    consequences:{flags:{MET_XUN:true,MET_PINYU:true},memo:'重修經原（下）下課，走廊上遇到經濟系那年的室友阿勳（盧正勳）'},
    after:G=>{ G.flags.ECON_HALLWAY_DAY=G.day; } },
  /* 經濟系的朋友（BB_96 10-2、BB_135 第 1 節，BB-B 2026-10-16 定稿）——SK03 週五的小福午餐：P4d 之後每個有課的週五，重修經原（下）下課，阿勳一句「小福。走不走？」，玩家選「一起去」／「今天不行」（不扣分，下週照問）。
     去了：第一次＝1-1；去過兩次以上的下一次＝1-3 芯慈走進小福（照 ECON_PAST_SHARED，記 ECON_LAW_BRIDGE）；其他＝1-2（一句旁白＋一句輪替，芯慈加入前／加入後兩組，不連續重複）；之後快轉到 13:00「午休結束。」。
     習慣記憶 meal:xiaofu:fri 每次 +1（after）。BB_135 的舞台說明改旁白。
     AA-B 2026-10-16 裁定：同一個週五的先後＝10-4 還債 ＞ 1-1 第一次 ＞ 1-3 芯慈 ＞ 1-2 平常（還債那天也是第一次去＝先 1-1，再接 10-4 三句；芯慈那一句只在 1-3 之後才有）；午餐後人留在原地。
     10-4 小福的還債（BB_96 10-4）：10-3 選「一起讀到閉館」（XUN_NIGHT）的玩家，第 11 週週五下課走廊阿勳先說「昨天那題我想通了。」；那天去了午餐＝還債；沒去＝「走啦」群組一張便當照片「欠你的，下週。」（story3d.js phoneRules），
     下一個去的週五照樣推過來（只發生一次，XUN_REPAID）*/
  { id:'ev_sk03_lunch', title:'週五的小福', participants:[], location:'any', trigger:'class', afterClass:'econ_principles_2', term:['Y1S2'], weekday:[5], background:'blur',
    prereq:{custom:G=>{ const F=G.flags; if(F.SK03_ASKED===G.day) return false; if(F.P4D_ANSWER) return F.ECON_HALLWAY_DAY!=null&&G.day>F.ECON_HALLWAY_DAY; return !!F.MET_XUN&&F.XUN_DAY!=null&&G.day>F.XUN_DAY; }},   /* AA-B 2026-10-16：只在 10-3 見過阿勳（沒有 P4d）的玩家也算重新認識，第 11 週週五起開 SK03 */
    dialogue:[ {if:{custom:G=>!!G.flags.XUN_NIGHT&&G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'昨天那題我想通了。'},   /* 10-4 走廊（第 11 週週五＝10-3 的隔天）*/
      {if:{custom:G=>!G.flags.P4D_ANSWER&&!G.flags.SK03_INV1},speaker:'阿勳',text:'週五中午，我們在小福。你要來就來。'},{unless:{custom:G=>!G.flags.P4D_ANSWER&&!G.flags.SK03_INV1},speaker:'阿勳',text:'小福。走不走？'},{set:{SK03_INV1:true}},   /* 只在 10-3 見過的玩家第一次邀約照用 P4d 原句（AA-B）*/
      {choice:[{text:'「一起去」',consequences:{stamp:['SK03_LAST']},goto:'go'},{text:'「今天不行」',goto:'end'}]},
      {label:'go'},{scene:'小福',bg:'xiaofu'},
      {if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},unless:{flags:['SK03_FIRST']},goto:'first'},{if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},goto:'repay'},
      {unless:{flags:['SK03_FIRST']},goto:'first'},
      {if:{custom:G=>!G.flags.ECON_LAW_BRIDGE&&typeof EVENTS!=='undefined'&&EVENTS.habitCount({key:'meal:xiaofu:fri'})>=2},goto:'xinci'},
      {goto:'usual'},
      {label:'first'},{speaker:null,text:'週五的小福。阿勳占了靠窗的四人桌，品妤已經在吃了。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},   /* 品妤還沒見過（只在 10-3 見過阿勳的玩家）：照 v1 K2 的規則先介紹自己（AA-B）*/
      {speaker:'品妤',text:'重修生？你看起來很有覺悟。'},{speaker:'阿勳',text:'他去年也很有覺悟。只是方向不一樣。'},{speaker:'品妤',text:'……經濟系的冷笑話，還是你最多。'},
      {set:{SK03_FIRST:true}},{if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},goto:'repay'},{goto:'end'},
      {label:'repay'},{if:{custom:G=>G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'（把一個便當推過來）昨天那題的。還債。'},{unless:{custom:G=>G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'（把一個便當推過來）上週那題的。還債。'},   /* 延後一週：AA-B 改一個詞（第①級）*/{speaker:'品妤',text:'他從來沒請過我。'},{speaker:'阿勳',text:'妳又沒教過我統計。'},
      {if:{flags:['ECON_LAW_BRIDGE']},speaker:'classmate_xinci',text:'……經濟系的人也會還債。'},{set:{XUN_REPAID:true}},{goto:'end'},
      {label:'xinci'},{speaker:null,text:'芯慈端著餐盤走進來，看見阿勳，停住了。'},
      {speaker:'classmate_xinci',text:'……你。統計課冷笑話很多的那個人。'},{speaker:'阿勳',text:'我。統計課唯一會笑的那個人。'},{speaker:'classmate_xinci',text:'（看向你）你們認識？'},
      {choice:[{text:'「他是我以前的室友。」',if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x1'},{text:'「我們一起住過一年。」',unless:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x2'},{text:'（笑一笑帶過）',unless:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x3'}]},
      {label:'x1'},{speaker:'classmate_xinci',text:'……原來是你室友。'},{speaker:'classmate_xinci',text:'難怪他的冷笑話跟你的一樣冷。'},{goto:'xend'},
      {label:'x2'},{speaker:'player',text:'他每天講一個冷笑話。'},{speaker:'classmate_xinci',text:'我要聽那一年的全部。'},{set:{ECON_PAST_SHARED:'full'}},{goto:'xend'},
      {label:'x3'},{speaker:'阿勳',text:'我們住過同一間。他沒說？'},{speaker:'classmate_xinci',text:'……他什麼都沒說。'},
      {label:'xend'},{speaker:'品妤',text:'好，多一個人。這桌要換大一點的。'},{speaker:'阿勳',text:'每週五，同一桌。'},{set:{ECON_LAW_BRIDGE:true}},{goto:'end'},
      {label:'usual'},{speaker:null,text:'週五的小福。品妤點的永遠是同一個便當，阿勳永遠在講統計。'},
      {if:{custom:G=>!G.flags.ECON_LAW_BRIDGE},goto:'pre'},{goto:'post'},
      {label:'pre'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===0},speaker:'阿勳',text:'統計這週講變異數。我的人生也是。'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'品妤',text:'你們法律系的期中考，也要背那麼多嗎？'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===2},speaker:'阿勳',text:'今天的冷笑話我想好了。……算了，下週。'},{goto:'end'},
      {label:'post'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===0},speaker:'classmate_xinci',text:'統計的筆記我帶來了。誰要先吵？'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'品妤',text:'芯慈，妳的雙主修還活著嗎？'},{if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'classmate_xinci',text:'活著。只是很累。'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===2},speaker:'阿勳',text:'法律系的，今天輪你講冷笑話。'},
      {label:'end'} ],
    after:(G,GM)=>{ G.flags.SK03_ASKED=G.day; if(G.flags.SK03_LAST!==G.day) return; if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('meal:xiaofu:fri'); G.flags.SK03_N=(G.flags.SK03_N|0)+1;
      const h=G.hour%24; if(h<13&&GM.advance) GM.advance(13-h); if(GM.caption) GM.caption('','午休結束。',2400); } },
  /* SK03 1-4 沒去時（BB_135 1-4；AA-B 2026-10-16：第 8 週週五重修經原（下）期中考前、在重修教室，舞台說明「（考卷還沒發。）」）：沒有 ECON_LAW_BRIDGE 的玩家，芯慈說阿勳認識你。
     第 8 週沒去重修就延到下一個有去的週五（第 9、11 週…；不是考試的那幾週沒有「考卷還沒發。」）；整學期都沒去就沒有（ECON_LAW_BRIDGE 留到大二 SK09）。記 ECON_LAW_BRIDGE：之後的週五午餐芯慈已經在桌上 */
  { id:'ev_sk03_xinci_class', title:'統計課那個人', participants:['classmate_xinci'], location:'any', trigger:'class', beforeClass:'econ_principles_2', term:['Y1S2'], weekday:[5], once:true, background:'blur',
    prereq:{custom:G=>{ if(!G.flags.P4D_ANSWER||G.flags.ECON_LAW_BRIDGE||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=8; }},
    dialogue:[ {if:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===8},speaker:null,text:'考卷還沒發。'},
      {speaker:'classmate_xinci',text:'我們統計課那個人說他認識你。'},{speaker:'classmate_xinci',text:'盧正勳。他說你以前每天講一個冷笑話。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_xinci',text:'……原來是你室友。'},{unless:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_xinci',text:'你沒說過。……沒關係，不用說。'},
      {speaker:'classmate_xinci',text:'下次週五，帶我去小福。'},{set:{ECON_LAW_BRIDGE:true}} ] },
  /* SK05 三閃，販賣機見（大一版；BB_135 第 2 節、BB_96 10-5、BB_106 SK05）：期末考週玩家閃三下（story3d.js phoneRules 的 23:00 訊息）→ 阿勳在法學院廣場的販賣機前（作息 SK05_GO），
     走到他旁邊（npcNear）才算「去」；只回訊息不算。記 SK05_Y1；大二、大三照 BB_106 SK05（之後做）。走到一半回頭＝23:45 阿勳傳「……你閃了三下又不來。」「明年再說。」（不扣分）*/
  { id:'ev_sk05_vending_y1', title:'三閃，販賣機見', participants:[], location:'campus', trigger:'auto', npcNear:'econ_zhengxun', time:[23,23.75], term:['Y1S2'], weeks:[17,18], once:true, background:'blur',
    prereq:{custom:G=>G.flags.SK05_GO===G.day},
    dialogue:[ {speaker:'阿勳',text:'法律系考試考什麼？'},{speaker:'player',text:'一題寫一整頁。要寫理由。'},{speaker:'阿勳',text:'一整頁？經濟系至少有標準答案。'},{speaker:'阿勳',text:'……好啦，不一定。'},
      {speaker:null,text:'他按了兩罐一樣的飲料，丟一罐給你。'},{speaker:'阿勳',text:'明年也閃三下。'},{set:{SK05_Y1:true,MET_XUN:true}} ] },
  /* V2-C13 可玩切片：共同教學館的阿勳（BB_96 10-3、AA_115 選擇④）：大一下第 11 週週四 20:48 以後，阿勳在共同教學館二樓自習區讀統計（AA_155 作息，沒見過也在）；走到他旁邊（npcNear）才開始。
     還沒在法律系時期見過他的玩家（沒有 MET_XUN）先說 10-1 那句。三個選項記 AA_115 的 xun_study:night／xun_met:Y1S2／xun_study:pact＝XUN_NIGHT／XUN_MET_Y1S2／XUN_PACT（XUN_DAY＝這一天）。
     一起讀到閉館：之後時間到 23:00（after）。之後：xun_met＝「走啦」群組一句（AA_157）；pact＝阿勳私訊行程表；night＝隔天週五走廊、小福還債（10-4，ev_sk03_lunch）。不在場的人（沛珊、以安）不知道：不寫進她們的記憶 */
  { id:'ev_xun_gongtong', title:'共同教學館的阿勳', participants:[], location:'gongtong', trigger:'auto', npcNear:'econ_zhengxun', time:[20.8,23], term:['Y1S2'], weeks:[11], weekday:[4], once:true, background:'blur',
    dialogue:[ {unless:{flags:['MET_XUN']},speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'},
      {speaker:'阿勳',text:'（抬頭）法律系的也來共同讀書？你們不是有自己的館？'},{speaker:'阿勳',text:'統計。這題的信賴區間我算了三次，三次答案都不一樣。'},
      {choice:[{text:'一起讀到閉館',set:{XUN_NIGHT:true},goto:'n'},{text:'聊兩句就走',set:{XUN_MET_Y1S2:true},goto:'m'},{text:'「期末考一起讀？」',set:{XUN_PACT:true},goto:'p'}]},
      {label:'n'},{speaker:null,text:'23:00 閉館的音樂響起。'},{speaker:'阿勳',text:'你一頁都沒讀到你自己的。'},{speaker:'阿勳',text:'……謝了。'},{goto:'end'},
      {label:'m'},{speaker:'阿勳',text:'好。法律系的去忙。'},{goto:'end'},
      {label:'p'},{speaker:'阿勳',text:'你們期末也是那兩週吧？……好，我把行程傳給你。'},
      {label:'end'},{set:{MET_XUN:true}} ],
    after:(G,GM)=>{ G.flags.XUN_DAY=G.day; if(G.flags.XUN_NIGHT){ const hh=G.hour%24; if(hh<23&&GM.advance) GM.advance(23-hh); } } },
  /* 可玩切片（交接包 v2 C13；AA_115 第 1、2 節、BB_105 4-5）——B4 博雅午後講座「政府可以為了大家，限制一個人嗎？」：第 11 週週四 19:00～20:30 博雅 101（activities.js 的 B4）。
     以安揪人（週二在麵店團群組，story3d.js phoneRules）；以安、小語、阿哲照作息在 101（characters.js），散場後以安、小語去博雅的圓桌。
     去不去看玩家週四有沒有走進博雅 101：坐下選「聽演講」＝這一段（之後快轉到 20:30）；坐著待到結束也算聽完（沒有這一段）；結束前走出 101＝中途離開（沒有這一段，之後以安說一句）。
     講者虛構、只講比例原則的方向，不給結論（BB_105 4-3）——LEGAL_REVIEW_REQUIRED（BB 確認前不發布）。（時間往前跳。）＝開場三句之後時鐘往前 45 分鐘（晚到的不跳）*/
  { id:'ev_b4_lecture', title:'政府可以為了大家，限制一個人嗎？', participants:[], location:'boya', trigger:'activity', once:true, background:'blur', 
    dialogue:[ {speaker:null,text:'講者是一位頭髮花白的老師，說話很慢。'},
      {speaker:'講者',text:'政府要限制一個人，要有理由，而且要用最小的手段。'},
      {speaker:'講者',text:'可是「最小」，是誰來量的？'},
      {if:{custom:G=>(G.hour%24)<19.5},advance:0.75},
      {speaker:'講者',text:'最後一個問題，我留給你們。'},
      {speaker:'講者',text:'被限制的那個人，最後可以去哪裡？'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'掌聲。以安把最後那一句抄了兩次。'},{unless:EV_KNOWS('heroine_01'),speaker:null,text:'掌聲。'} ],
    consequences:{memo:'博雅 101 聽演講：「政府可以為了大家，限制一個人嗎？」'} },
  /* B4 散場（20:30 起 20 分鐘內，activityPhase justEnded）：聽完的玩家（attended:B4，中途離開的不算）、認識以安——以安「要不要去小桌子整理一下？」
     「好。」＝記 B5_GO（今天）：以安、小語照作息在博雅的圓桌（characters.js），玩家走過去才開始 B5（ev_b5_table）；
     「我約了人，先走。」＝以安「好。」小語「明天群組見。」，記 LEFT_AFTER_B4（AA_115 的 left_after:B4；第 12 週以安好奇地問，不懲罰）*/
  { id:'ev_b4_after', title:'散場', participants:['heroine_01'], location:'boya', trigger:'auto', activity:'B4', activityPhase:'justEnded', once:true, background:'blur',
    prereq:{attended:['B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'要不要去小桌子整理一下？'},
      {choice:[{text:'「好。」',set:{B5_GO:true},goto:'go'},{text:'「我約了人，先走。」',set:{LEFT_AFTER_B4:true},goto:'leave'}]},
      {label:'go'},{goto:'end'},
      {label:'leave'},{speaker:'heroine_01',expression:'neutral',text:'好。'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'smile',text:'明天群組見。'},
      {label:'end'} ],
    after:G=>{ if(G.flags.B5_GO===true) G.flags.B5_GO=G.day; } },
  /* B5 小桌子（BB_105 4-5）：散場說「好。」的玩家，當晚走到博雅圓桌的以安旁邊（npcNear）才開始。先演 4-4「B4 演講之後」的四句，再寫便利貼（三選一，沒有對錯）。
     小語：認識才在場（只有認識的人在場）；不認識小語＝她那兩句不演、便利貼是兩張（LAWWW 改的字，已告訴 BB）。
     記 B5_THOUGHT（ask_them／trade／where；B12 讀它）、B4_DISCUSSED（AA_115 的 discussed:B4）；以安的熟悉度＝參與事件的一般見面（不另加數字）。法律同 B4：LEGAL_REVIEW_REQUIRED */
  { id:'ev_b5_table', title:'小桌子', participants:['heroine_01'], location:'boya', trigger:'auto', npcNear:'heroine_01', time:[20.5,21.5], once:true, background:'blur', 
    prereq:{custom:G=>{ if(G.flags.B5_GO!==G.day) return false; const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf('heroine_01'):null;   /* 她坐到圓桌才開始（小桌子）：散場時坐在她旁邊的話，不在 101 就先演；走不到圓桌（roomFail）就在原地（2026-10-14 story3d.js roomMove）*/
      return !n||(!n.roomGo&&(!!(n.seat&&n.seat.room==='round')||!!n.roomFail)); }},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'他說，限制自由要用最小的手段。'},
      {speaker:'heroine_01',expression:'thinking',text:'可是「最小」，是對誰來說最小？'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'對整個社會吧？'},
      {speaker:'heroine_01',expression:'neutral',text:'……對那個被限制的人呢？'},
      {speaker:'heroine_01',expression:'neutral',text:'（把便利貼推過來）你呢？寫一句。不用對。'},
      {choice:[{text:'「最小，要問被限制的人。」',set:{B5_THOUGHT:'ask_them'},goto:'t1'},{text:'「最小，要看大家換到了什麼。」',set:{B5_THOUGHT:'trade'},goto:'t2'},{text:'「我還不知道。我想知道他最後去了哪裡。」',set:{B5_THOUGHT:'where'},goto:'t3'}]},
      {label:'t1'},{speaker:'heroine_01',expression:'thinking',text:'那他說『全部都太多』呢？'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'那就……再問一次？'},{goto:'end'},
      {label:'t2'},{speaker:'heroine_01',expression:'neutral',text:'好。那換到的東西，要誰來證明？'},{goto:'end'},
      {label:'t3'},{speaker:'heroine_01',expression:'neutral',text:'……那就是講者最後那一題。'},
      {label:'end'},
      {if:EV_KNOWS('yu'),speaker:null,text:'她把三張便利貼並排貼在筆記本上：她的、小語的、你的。'},{unless:EV_KNOWS('yu'),speaker:null,text:'她把兩張便利貼並排貼在筆記本上：她的、你的。'},
      {speaker:'heroine_01',expression:'smile',text:'九點半了。我回宿舍讀刑總。'} ],
    consequences:{flags:{B4_DISCUSSED:true},mem:[{npc:'heroine_01',tag:'B5_STICKY',note:'演講完在博雅的小桌子，三個人各寫一張便利貼'}],memo:'博雅的小桌子：演講之後寫了一張便利貼'} },
  /* B4 中途離開（AA_115 第 2 節：attendedAny 但不是 attended）：之後第一次找以安說話（演講後兩週內）——「你後半場不在。最精彩的你錯過了。」*/
  { id:'ev_b4_partial_an', title:'後半場', participants:['heroine_01'], location:'any', trigger:'interact', priority:9, once:true, term:['Y1S2'], background:'blur',
    prereq:{custom:G=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny(G,'B4')&&!ACTIVITIES.attended(G,'B4')&&(()=>{ const d=ACTIVITIES.lastEnded(G,'B4'); return d!=null&&G.day-d<=14; })()},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'你後半場不在。最精彩的你錯過了。'} ] },
  /* B4 散場先走的玩家（AA_115 第 2 節 ②b：left_after:B4）：第 12 週週一憲法（下）下課，以安「你那天聽完就走了。你怎麼想？」——她是好奇，不是怪他；不懲罰（原文沒有玩家的回答，只有這一句）*/
  { id:'ev_b4_left_an', title:'那天的演講', participants:['heroine_01'], location:'any', trigger:'class', afterClass:'const_2', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flags:['LEFT_AFTER_B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'heroine_01',expression:'thinking',text:'你那天聽完就走了。你怎麼想？'} ] },
  /* 可玩切片的選擇③（AA_115 第 1、2 節；BB_96 3-7）——沛珊的那張表：有沛珊聯絡方式的玩家，週二中午她私訊「刑總二未遂那一章，我做了一張表……週四演講完，來女舍門口拿？」（story3d.js phoneRules）；
     週四 20:40 她傳「對不起。課輔班的作業還沒改完……今天下不去了。」（所有人都收到）。玩家這時候在大一女舍門口的長椅附近＝這一段：手機上她的兩句（只顯示，手機裡已經有），三選一。
     玩家和她的回覆在演完以後照順序寫進手機（after）。「那我等妳十分鐘。」＝十分鐘後她真的下來（她的台詞照 BB）。朋友之間的一張筆記表，沒有「我請你」。記 PS_CANCEL（ok／waited／later）、拿到表＝PS_TABLE_GOT */
  { id:'ev_peishan_table_bench', title:'女舍門口', participants:[], location:'campus', trigger:'auto', near:{x:-93,z:54.26,r:3}, term:['Y1S2'], weeks:[11], weekday:[4], time:[20+40/60,21.5], once:true, background:'blur',
    prereq:{custom:G=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,'classmate_peishan')},
    dialogue:[ {speaker:'沛珊（手機）',text:'對不起。課輔班的作業還沒改完，明天要發回去。'},{speaker:'沛珊（手機）',text:'今天下不去了。'},
      {choice:[{text:'「沒關係。」',set:{PS_CANCEL:'ok'},goto:'ok'},{text:'「那我等妳十分鐘。」',set:{PS_CANCEL:'waited'},goto:'wait'},{text:'「改天再給我。」',set:{PS_CANCEL:'later'},goto:'later'}]},
      {label:'ok'},{speaker:'沛珊（手機）',text:'……好。週一前給你。'},{goto:'end'},
      {label:'wait'},{advance:1/6},{speaker:null,text:'十分鐘後她真的下來了，外套沒拉好，手上拿著紅筆。'},
      {speaker:'classmate_peishan',expression:'surprised',text:'你真的在等。'},{speaker:'classmate_peishan',expression:'neutral',text:'表給你。第二頁我還沒畫完。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'……我上去了。還有十二本。'},{set:{PS_TABLE_GOT:true}},{goto:'end'},
      {label:'later'},{speaker:'沛珊（手機）',text:'（貼圖：敬禮）'},
      {label:'end'} ],
    after:G=>{ if(typeof PHONE==='undefined') return; const th='p:classmate_peishan', me=t=>PHONE.post(G,{th,from:'player',who:null,text:t}), ps=t=>PHONE.post(G,{th,from:'classmate_peishan',text:t});
      const k=G.flags.PS_CANCEL; if(k==='ok'){ me('沒關係。'); ps('……好。週一前給你。'); } else if(k==='waited') me('那我等妳十分鐘。'); else if(k==='later'){ me('改天再給我。'); ps('（貼圖：敬禮）'); } } },
  /* 「改天再給我。」（BB_96 3-7）：第 12 週週三法服讀書會散場（afterActivity）她把表拿給他；不是法服的玩家（或那天沒去）：第 12 週週四進 201 上課前 */
  { id:'ev_peishan_table_later_club', title:'那張表', participants:['classmate_peishan'], location:'any', trigger:'activity', afterActivity:'lawclub_study', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  { id:'ev_peishan_table_later_class', title:'那張表', participants:['classmate_peishan'], location:'classroom', trigger:'enter', term:['Y1S2'], weeks:[12], weekday:[4], time:[12,13+20/60], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 「沒關係。」、沒去女舍（或沒回）（BB_96 3-7）：第 12 週週一起，回宿舍時信箱裡有那張表，附一張便條（旁白照 BB 的描述寫成句子）*/
  { id:'ev_peishan_table_mail', title:'信箱', participants:[], location:['dorm_hall','dorm'], trigger:'enter', term:['Y1S2'], once:true, background:'freeze',
    prereq:{notFlags:['PS_TABLE_GOT'],custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',12,1):null; const k=G.flags.PS_CANCEL;
      return d!=null&&G.day>=d&&(k==null||k==='ok')&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_table_cancel'); }},
    dialogue:[ {speaker:null,text:'信箱裡有那張表，附一張便條：「對不起。這份有畫重點。」'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 聖誕交換禮物（交付清單 A20：AA_71 2-6「大一的實作」，AA 2026-10-14 回 LAWWW）：第 17 週週三 12/24 中午 12:20～13:10 在霖澤館一樓；只有麵店團的玩家有（阿哲兩天前在群組揪，
     story3d.js 的 phoneRules），沒去不扣分。在場的人＝XMAS_WHO 裡玩家認識的（交付清單第 0 節第 1 條）。祐廷送什麼由玩家選（XMAS_GIFT）；
     抽到祐廷禮物的人（XMAS_TO）、祐廷抽到誰的（XMAS_FROM）從在場的人裡隨機挑（pick）；明軒和小語都在、抽到祐廷禮物的不是明軒＝小語的玩偶是明軒抽到（「和祐廷無關的一句」），祐廷就抽不到；
     柏翰的考古題由以安沒收（以安在場才有那一句；旁白的「又」只給中秋烤肉看過沒收的玩家：MIDAUTUMN_Y1＋BBQ_BOHAN_SEIZED，AA 交付清單 A20）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT（AA_11 事件 16）。
     明軒的禮物（BB_95 3-6b，2026-10-14）：三色螢光筆；祐廷抽到＝「多買的。……我用不到啦。」＋（綠色螢光筆）「上次那支綠的還在嗎？……」或（SAW_HIM_STUDY）「……你什麼都沒看到。」，記道具 XMAS_HL3；
     別人抽到＝阿哲、明軒各一句。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  { id:'ev_xmas_exchange', title:'聖誕交換禮物', participants:[], location:'linze', trigger:'auto', term:['Y1S1'], weeks:[17], weekday:[3], time:[12+10/60,13+40/60], once:true, keep:'fixed', background:'blur',   /* 窗口放寬到 12:10～13:40（AA_160 3-4 B，AA-B 10-16 第一級條件小修）*/
    prereq:{custom:(G,GM)=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&!(GM&&GM.E&&GM.E.player&&(GM.E.player.lv|0)!==0)&&XMAS_HERE(G).length>0},
    dialogue:[ {speaker:null,text:'抽籤交換禮物。'},{speaker:null,text:'每個人的禮物都很像他們自己。'},
      {speaker:null,text:'你帶來的禮物是——'},
      {choice:[{text:'一本小筆記本',set:{XMAS_GIFT:'notebook'}},{text:'一包咖啡豆',set:{XMAS_GIFT:'coffee'}},{text:'一張手寫卡片',set:{XMAS_GIFT:'card'}}]},
      {pick:{flag:'XMAS_TO',from:G=>XMAS_HERE(G)}},
      {if:{flagIs:{XMAS_TO:'heroine_01'}},speaker:null,text:'抽到你禮物的是以安。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'notebook'}},speaker:'heroine_01',expression:'smile',text:'剛好。手帳的理由欄不夠寫了。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'coffee'}},speaker:'heroine_01',expression:'neutral',text:'我不喝咖啡。……期末會喝。好。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'card'}},speaker:'heroine_01',expression:'neutral',text:'字很工整。我收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03'}},speaker:null,text:'抽到你禮物的是語彤。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},speaker:'heroine_03',expression:'neutral',text:'嗯。……我還不知道要寫什麼。先收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'coffee'}},speaker:'heroine_03',expression:'neutral',text:'我帶去店裡。阿姨會好奇。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'card'}},speaker:'heroine_03',expression:'neutral',text:'嗯。我會看兩次。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},mem:[{npc:'heroine_03',tag:'GIFT_NOTEBOOK_YT',note:'聖誕交換禮物：抽到你送的筆記本，還不知道要寫什麼'}]},
      {if:{flagIs:{XMAS_TO:'zhe'}},speaker:null,text:'抽到你禮物的是阿哲。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'notebook'}},speaker:'zhe',expression:'laugh',text:'好，我拿來寫菜單。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'coffee'}},speaker:'zhe',expression:'neutral',text:'可以配滷味嗎？'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'card'}},speaker:'zhe',expression:'laugh',text:'你寫這麼多字，我會哭耶。……沒事啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan'}},speaker:null,text:'抽到你禮物的是柏翰。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'notebook'}},speaker:'classmate_bohan',expression:'neutral',text:'我拿來整理考古題。……這次不會被沒收吧。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'coffee'}},speaker:'classmate_bohan',expression:'neutral',text:'期末很需要。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'card'}},speaker:'classmate_bohan',expression:'neutral',text:'……沒有人寫卡片給我過。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci'}},speaker:null,text:'抽到你禮物的是芯慈。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'notebook'}},speaker:'classmate_xinci',expression:'neutral',text:'格線的嗎？……空白的也好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'coffee'}},speaker:'classmate_xinci',expression:'smile',text:'追劇的時候剛好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'card'}},speaker:'classmate_xinci',expression:'smile',text:'你寫得比我整齊。……騙你的，我比較整齊。'},
      {if:{flagIs:{XMAS_TO:'yu'}},speaker:null,text:'抽到你禮物的是小語。'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'notebook'}},speaker:'yu',expression:'laugh',text:'我要拿來寫三個社團的行事曆！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'coffee'}},speaker:'yu',expression:'laugh',text:'我拿去社辦泡給大家喝！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'card'}},speaker:'yu',expression:'laugh',text:'卡片！我要貼在牆上！'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan'}},speaker:null,text:'抽到你禮物的是明軒。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:'classmate_mingxuan',expression:'neutral',text:'……我不念書的。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:null,text:'他很快把它收進書包。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'coffee'}},speaker:'classmate_mingxuan',expression:'neutral',text:'家教的時候喝。謝啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'card'}},speaker:'classmate_mingxuan',expression:'neutral',text:'卡片喔。……我帶回家。'},
      {pick:{flag:'XMAS_FROM',from:G=>XMAS_FROM_POOL(G)}},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:null,text:'你抽到以安的禮物：一本空白的手帳。'},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'neutral',text:'一頁行程，一頁理由欄。理由要自己寫。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的禮物：一包阿姨的辣椒醬。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:'heroine_03',expression:'neutral',text:'很辣。不要一次吃完。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:null,text:'你抽到阿哲的禮物：一盒滷味。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:'zhe',expression:'laugh',text:'冷掉了，但很好吃。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的禮物：一疊考古題。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'},custom:G=>XMAS_HERE(G).includes('heroine_01')},speaker:'heroine_01',expression:'neutral',text:'沒收。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的禮物：一張劇單。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:'classmate_xinci',expression:'smile',text:'十二部。看完跟我說。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:null,text:'你抽到小語的禮物：一個巨大的玩偶。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:'yu',expression:'smile',text:'我一個人在家的時候抱的那種。……送你。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:null,text:'你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的。……我用不到啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan',GREEN_HIGHLIGHTER:true}},speaker:'classmate_mingxuan',expression:'smile',text:'上次那支綠的還在嗎？……這樣你有四種了。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'},memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>!G.flags.GREEN_HIGHLIGHTER},speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你什麼都沒看到。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},set:{XMAS_HL3:true}},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，又被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'zhe',expression:'laugh',text:'你送螢光筆？你？'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的啦。'},
      {if:{custom:G=>XMAS_MX_YU(G)},speaker:null,text:'明軒抽到小語的巨大玩偶，揹著它去搭公車。'} ],
    consequences:{flags:{XMAS_Y1:true},memo:'聖誕交換禮物（霖澤館一樓）'} },
  /* 颱風假 T1a「泡麵之夜」（BB_110 第 2 節、交付清單 B3，2026-10-14 第 2 級 AA×BB）：颱風假（calendar.js 的 TYPHOON：第 7 週週一）晚上 18–23 點在宿舍房間。
     阿凱囤了泡麵；隔壁的方奕廷抱著植物過來——玩家見過他才有和他有關的三句（交付清單第 0 節第 1 條：沒見過的人不出現）。
     「不可抗力」只當玩笑、沒有人下結論（BB 2026-10-14 法律查核，BB_115 L436）。「看情況。」記 SAID_DEPENDS（大二 F2 阿凱的聊天機器人多一句）。
     生活 CG BCG-18「颱風夜的泡麵」（BB 2026-10-14 ART_APPROVED）在方奕廷進來那一句出現、之後的台詞和選項都用同一張；沒見過他的玩家不放（圖裡有他，BB 同意）。
     跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_typhoon_noodles_y1', title:'颱風夜的泡麵', participants:['kai'], location:'dorm', trigger:'auto', term:['Y1S1'], weeks:[7], weekday:[1], time:[18,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'kai',expression:'laugh',text:'我囤了二十包。這是我人生最正確的決定。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},cg:'cg_typhoon_noodles'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'（抱著一盆植物進來）它在陽台會死。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'kai',expression:'surprised',text:'……你帶一盆植物來吃泡麵？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'它不吃。它看。'},
      {speaker:'kai',expression:'smile',text:'法律系的，颱風天泡麵算不算「不可抗力」？'},
      {choice:[{text:'「算。所以你要分我。」',goto:'yes'},{text:'「不算。這是你自己囤的。」',goto:'no'},{text:'「看情況。」',goto:'dep'}]},
      {label:'yes'},{speaker:'kai',expression:'smile',text:'這個推論有問題，但我接受。'},{goto:'end'},
      {label:'no'},{speaker:'kai',expression:'sad',text:'你好無情。……拿去。'},{goto:'end'},
      {label:'dep'},{speaker:'kai',expression:'laugh',text:'你們法律系每次都這樣。'},{mem:[{npc:'kai',tag:'SAID_DEPENDS',note:'颱風夜的泡麵：「不可抗力？」「看情況。」'}]},
      {label:'end'} ],
    consequences:{flags:{TYPHOON_Y1:true},memo:'颱風假：宿舍的泡麵之夜'} },
  /* 跨年（交付清單 A21：交接包_v1 第 3 節、AA_71 2-7、BB_95 9-7）：第 18 週 12/31（期末考中間）。一週前可昕問「跨年要不要去人少的地方？」（story3d.js 的 phoneRules）：
     「好。」＝河堤（出遊，和 K1b 的河堤共用背景；回宿舍的路上麵店團群組傳頂樓的照片）；「我答應麵店團要去頂樓了。」＝宿舍頂樓，零點前一分鐘她打視訊來（不扣分；她不在這裡和麵店團見面）。
     沒有回她、在麵店團群組裡的玩家照 AA 的群戲去頂樓（沒有視訊）。記 KX_NYE:{1:'river'|'roof'}（BB_107 第 13 節：節日每年一筆）*/
  { id:'ev_nye_river', title:'跨年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'河堤',bg:'riverside'},   /* AA_137 7-1：跨年的河堤不是政大，用河濱的背景（和 K1b 共用不再成立）*/
      {speaker:null,text:'河堤上的人不多。煙火在很遠的地方，聲音晚了好幾秒才到。'},
      {speaker:'kexin',expression:'smile',text:'今年我們不去人多的地方。'},
      {speaker:'kexin',expression:'teasing',text:'假設煙火的聲音永遠晚幾秒，那我們聽到的最後一聲，是今年的還是明年的？'},
      {choice:[{text:'「今年的。」',goto:'a'},{text:'「明年的。」',goto:'b'},{text:'「妳的問題比煙火難。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那我先說：新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'那我們再等幾秒。'},{speaker:null,text:'她數到三。'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'smile',text:'那就不要回答。新年快樂。'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'十分鐘。然後回去念書。我們都還有考試。'} ],
    consequences:{flags:{NYE_DONE:'river'},memo:'跨年：和可昕在河堤'} },
  { id:'ev_nye_roof', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {cg:'cg_nye_rooftop'},   /* CG-15 頂樓的跨年（BB 2026-10-14 ART_APPROVED）：第一句旁白起；可昕的視訊排在這張之後；河堤版（ev_nye_river）不放 */
      {speaker:null,text:'大家本來想去看煙火，最後發現人太多，跑回宿舍頂樓看遠方的煙火。'},
      {speaker:'zhe',expression:'laugh',text:'我們就說有看到。'},
      {unless:{custom:G=>!!(G.flags.KX_NYE&&G.flags.KX_NYE[1]==='roof')},goto:'end'},
      {speaker:null,text:'零點前一分鐘，可昕打視訊來。你走到頂樓的角落接。'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:null,text:'訊號慢了一秒，她的「新年快樂」晚到。'},
      {speaker:'kexin',expression:'smile',text:'……我們的新年差一秒。明年再對時。'},
      {speaker:null,text:'你轉告阿哲。阿哲對著天空喊——'},
      {if:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'可昕新年快樂！'},
      {unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'政大的那位，新年快樂！'},
      {label:'end'} ],
    consequences:{flags:{NYE_DONE:'roof'},memo:'跨年：宿舍頂樓'} },
  /* 期末最後一頓（交付清單 A22：AA_71 2-13）：這學期最後一科考完以後（classes3d.js 的 lastExamEnd），走進阿鳳麵店（傍晚到晚上）；麵店團才有（哲 1 之後）。只一次。
     「麵店團一定吃一頓」那句旁白照 2-13 的字；阿姨的一句原文 */
  { id:'ev_term_last_meal', title:'期末最後一頓', participants:[], location:'noodle', trigger:'enter', term:['Y1S1'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {speaker:null,text:'期末最後一科考完。麵店團一定吃一頓。'},{speaker:null,text:'阿姨多送了一盤小菜。'},{speaker:'阿姨',text:'考完了，吃好一點。'} ],
    consequences:{memo:'期末最後一頓（阿鳳麵店）'} },
  /* 學姊 W4：空的保溫瓶（交接包 v2、BB_96 2-5）：大一下第 8～9 週、總圖、平日 14～17（她的作息本來就在總圖）、有點熟以上、once。輕的一場：她不哭、不說累。
     選項 2 之後一週「保溫瓶上貼了一張便條：已裝滿」——遊戲沒有保溫瓶的模型，先沒有（之後做道具時補）*/
  { id:'ev_sis_empty_flask', title:'空的保溫瓶', participants:['heroine_05'], location:'library', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[8,9], weekday:[1,2,3,4,5], time:[14,17], prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:null,text:'她在讀判決，左手拿著保溫瓶，喝了一口。又喝了一口。'},{speaker:null,text:'保溫瓶是空的。她已經對著空瓶喝了三次。'},
      {choice:[{text:'「學姊，妳的保溫瓶是空的。」',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'tell'},{text:'（去 Café 買一杯黑咖啡，放在她桌上）',consequences:{mem:[{npc:'heroine_05',tag:'HELPED',note:'空的保溫瓶，買了黑咖啡'}],stamp:['flaskCoffeeDay']},goto:'coffee'},{text:'（什麼都不說）',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'quiet'}]},
      {label:'tell'},{speaker:null,text:'（她低頭看，搖了一下。）'},{speaker:'heroine_05',expression:'surprised',text:'……喔。'},{speaker:'heroine_05',expression:'neutral',text:'我早上九點裝的。我以為我還沒喝完。'},{speaker:null,text:'（她笑出來。）'},{speaker:'heroine_05',expression:'smile',text:'這件事很蠢。你看到了，就算了。'},{goto:'end'},
      {label:'coffee'},{speaker:'heroine_05',expression:'surprised',text:'……你翹課？'},{speaker:'player',text:'下課了。'},{speaker:'heroine_05',expression:'smile',text:'……好。'},{speaker:null,text:'（她把咖啡倒進保溫瓶。）'},{goto:'end'},
      {label:'quiet'},{speaker:null,text:'（她自己發現，起身去裝水。）'},{speaker:'heroine_05',expression:'serious',text:'你看到了吧。'},{speaker:'player',text:'……沒有。'},{speaker:'heroine_05',expression:'smile',text:'說謊的時候，不要看別的地方。'},
      {label:'end'} ] },
  /* 明軒 F-M4 家教的弟弟（BB_96 3-2；AA_72 第 3 節；V2-B32＋SYS-13 最小版）：大一下第 3 週起、校園、平日 15:30～18:00（他的作息）、SAW_HIM_STUDY 或和他「熟悉」以上、只一次。
     「好。」＝JOB_TUTOR（每週一次的家教，story3d.js 排出遊 ev_tutor_lesson）；「我先想想。」＝名額留到月底：月底前一週他私訊再問，過了月底「名額給別人了。」。
     哪一天（週二或週四）、做多久、沒去那一週、「為什麼要念書」的選項：待 AA-B（2026-10-16 問）；先排週二 19:00～21:00 */
  { id:'ev_mingxuan_tutor_intro', title:'家教的弟弟', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:6, once:true, term:['Y1S2'], weeks:[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], weekday:[1,2,3,4,5], time:[15.5,18], background:'blur',
    prereq:{any:[{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}]},{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}]},
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'欸，你要不要接一個家教？'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我學生的弟弟，國中，要補公民。我排不下了。'},{speaker:'narrator',text:'你想起公園公布欄的那張紙。',if:{custom:G=>typeof PARK!=='undefined'&&PARK.tutorAdEcho(G)}},   /* 看過小公園公布欄的家教廣告（AA_171 第 2 節；一般狀態 G.daily.park.sawTutorAd，只有這句旁白讀）*/
      {speaker:'classmate_mingxuan',expression:'neutral',text:'你們法律系教公民應該沒問題吧？'},{speaker:'classmate_mingxuan',expression:'smile',text:'時薪我幫你談好了。不能比我低。'},
      {choice:[{text:'「好。」',set:{JOB_TUTOR:true},consequences:{stamp:['tutorFromDay']},goto:'y'},{text:'「我先想想。」',consequences:{stamp:['tutorThinkDay']},goto:'n'}]},
      {label:'y'},{speaker:'classmate_mingxuan',expression:'smile',text:'很好。第一堂我陪你去認門。'},{goto:'end'},
      {label:'n'},{speaker:'classmate_mingxuan',expression:'neutral',text:'好。名額幫你留到月底。'},
      {label:'end'} ] },
  /* 家教的一堂（SYS-13 最小版）：學生家的客廳（2D，圖還沒有）。第一堂：國中生的問題＋旁白（BB_96 3-2，旁白只用 AA_12 0-3 的原意）；
     第二堂：媽媽切的柳丁、你不好意思吃；第三堂：「你不吃，我媽會以為你不喜歡她。」（AA_72 3-3）；之後只有地點字幕。TUTOR_N＝上過幾堂 */
  { id:'ev_tutor_lesson', title:'家教', participants:[], location:'any', trigger:'outing', background:'dark', hours:2, after:G=>{ if(typeof CLS!=='undefined'&&CLS.slotFill) CLS.slotFill(G,'ev'); },   /* 約好的打工：次數用完也能去；去了那天晚上不能再開始別的主要活動（AA_163、AA_160 2-3）*/
    dialogue:[ {scene:'學生家的客廳',bg:'tutor_home'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:'國中生',text:'老師，課本寫的跟我家發生的事不一樣，那要聽誰的？'},{if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:null,text:'你想起自己小時候，也是這樣翻書找答案。'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===1},speaker:null,text:'（學生的媽媽切了一盤柳丁。你不好意思吃。）'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:null,text:'（學生的媽媽又切了一盤柳丁。）'},{if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:'國中生',text:'你不吃，我媽會以為你不喜歡她。'} ],
    after:G=>{ G.flags.TUTOR_N=(G.flags.TUTOR_N|0)+1; } },
  /* 大一的回聲（BB_134 第 1 節第 4 點、附錄 BB_134a；台詞 BB_96 2-5、BB_108 第 1 節）——W4「已裝滿」便條：空的保溫瓶選了買黑咖啡的玩家，之後一週內在總圖走到學姊旁邊，一句旁白 */
  { id:'ev_sis_flask_full', title:'已裝滿', participants:[], location:'library', trigger:'auto', npcNear:'heroine_05', once:true, background:'blur',
    prereq:{custom:G=>G.flags.flaskCoffeeDay!=null&&G.day>G.flags.flaskCoffeeDay&&G.day<=G.flags.flaskCoffeeDay+7},
    dialogue:[ {speaker:null,text:'（她的保溫瓶上貼了一張便條：「已裝滿」。）'} ] },
  /* 阿凱 K2 的回聲（BB_108 第 1 節 KAI_JOINS_TEST）：K2 之後第二週的晚上回到房間——說好「下次測試我叫你一起」的玩家：「測試。你說好的。」三個小時；其他選項：他自己測，隔天說「你錯過了史上最難的一關」 */
  { id:'ev_kai_test_echo', title:'測試', participants:['kai'], location:'dorm', trigger:'enter', once:true, time:[18,23], background:'blur',
    prereq:{events:['ev_kai_engineer'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_kai_engineer; return d!=null&&G.day>=d+7&&G.day<=d+14; }},
    dialogue:[ {if:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'smile',text:'測試。你說好的。'},{if:{flags:['KAI_JOINS_TEST']},speaker:null,text:'（三個小時，你死了四十次；阿凱記下每一次。）',consequences:{advance:3}},
      {unless:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'tired',text:'你錯過了史上最難的一關。'} ] },
  /* 語彤 6：房東來過了（交接包 v2 C12；AA_11 事件 6）：大一下第 10 週以後，第一次在週二或週四晚上去麵店（同班圈固定儀式）；once；玩家一直沒去就不發生。
     流程 1～4 照 AA_11 的字寫成旁白；問的選項只在和語彤有 FIRST_MET 時出現（選項的字 AA 180c8ff 定：「剛剛那個人是誰？」／（不問，低頭吃麵））；問了才記 RENT_RUMOR */
  { id:'ev_yutong_landlord', title:'房東來過了', participants:['heroine_03'], location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true,
    term:['Y1S2'], weeks:[10,11,12,13,14,15,16,17,18], background:'freeze',   /* 只在大一下（AA_11：「事件 6 只在大一下去麵店時發生」）*/
    dialogue:[ {speaker:null,text:'一個穿西裝的中年人拿著捲尺量店面的寬度，跟阿姨講了幾句就走。'},{speaker:null,text:'阿姨把湯勺放下，站著不動，然後又拿起來。'},
      {speaker:'zhe',expression:'neutral',text:'（小聲）那誰？'},{speaker:null,text:'語彤端麵過來。'},{speaker:'阿姨',text:'沒事啦，房東的朋友，來看房子。'},
      {speaker:null,text:'（語彤放下碗）'},{speaker:'heroine_03',expression:'neutral',text:'……嗯。'},
      {unless:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]},goto:'end'},
      {choice:[{text:'「剛剛那個人是誰？」',goto:'ask'},{text:'（不問，低頭吃麵）',goto:'end'}]},   /* 選項字 AA 180c8ff（玩家說的話）；只有問了才記 RENT_RUMOR */
      {label:'ask'},{speaker:'heroine_03',expression:'neutral',text:'房東想把整棟賣掉。還沒確定。……你吃你的。'},{mem:[{npc:'heroine_03',tag:'RENT_RUMOR',note:'房東想把整棟賣掉，還沒確定'}]},
      {label:'end'} ] },
  /* 以安新 5：舍友的記點申訴（交接包 v2 C8；草稿第 3 節、AA_113 新 5；法律台詞 BB 2026-10-14 查核無誤：學校的內部程序，不寫成行政程序法直接適用）：
     大一下第 5 週平日晚上 19～22 在總圖（她那週的作息），認識以上；四個選項記 AN_APPEAL。結果在第 7 週：總圖見到她就當面說，週五晚上還沒見到就傳訊息（story3d phoneRules）；
     沒遇到的玩家第 7 週在麵店團群組看到一句（聽說）*/
  { id:'ev_an_dorm_appeal', title:'舍友的記點申訴', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[5], weekday:[1,2,3,4,5], time:[19,22], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:null,text:'以安的桌上攤著兩份草稿，理由欄寫得密密麻麻。'},
      {speaker:'heroine_01',expression:'serious',text:'我室友被記點了。晚歸二十分鐘。'},
      {speaker:'heroine_01',expression:'neutral',text:'她陪隔壁寢的同學去急診。記點以前，沒有人問她那天發生什麼事。'},
      {speaker:'heroine_01',expression:'serious',text:'申訴我幫她寫。你幫我讀。然後站另一邊，反駁我。'},
      {speaker:'heroine_01',expression:'neutral',text:'第一份寫：這條規定錯了。第二份寫：規定沒錯，是它沒想到這種情況。'},
      {choice:[{text:'「寫第一份。規定錯了，就該改。」',consequences:{flags:{AN_APPEAL:'rule'}},goto:'rule'},{text:'「寫第二份。規定沒錯，是沒想到。」',consequences:{flags:{AN_APPEAL:'case'}},goto:'case'},
        {text:'「先寫一件事：記點以前，應該先問她。」',consequences:{flags:{AN_APPEAL:'ask'}},goto:'ask'},{text:'「我想先聽妳的。」',consequences:{flags:{AN_APPEAL:'listen'}},goto:'listen'}]},
      {label:'rule'},{speaker:'heroine_01',expression:'thinking',text:'那你要證明它對每個人都錯。……門禁本身沒有道理嗎？'},{speaker:null,text:'（她在第一份旁邊畫了一個問號。）'},{goto:'end'},
      {label:'case'},{speaker:'heroine_01',expression:'smile',text:'我也是這樣想。……所以我才要你反駁我。不准賴。'},{goto:'end'},
      {label:'ask'},{speaker:null,text:'（她停住，把這句抄進理由欄的第一行。）'},{speaker:'heroine_01',expression:'neutral',text:'先問。……對，要先問。'},{goto:'end'},
      {label:'listen'},{speaker:'heroine_01',expression:'neutral',text:'好，我先說。說完你一定要反駁。'},
      {label:'end'} ] },
  /* 以安「四年，四張」的第一張（交接包 v2 C7；AA_71 2-9「大一的台詞」）：大一下第 3 週週六上午，椰林大道的杜鵑開了（她那個上午在椰林大道：characters.js 的作息）。
     和她有點熟以上＝她請你拍；還不熟＝她請小語拍、你在旁邊看到。芷若、子晴那兩句只給兩個人都認識的玩家（AA：和祐廷無關的一句）。
     旁白只用 AA 的字（「椰林大道的杜鵑開了」「拿著手機」「她把手機遞給你」「拍完她看了一下」「她請小語拍」「芷若拿著手機在拍花」）。之後三年照 AA_71 2-9（大三、大四以後做）*/
  /* 沛珊和柏翰（交接包 v2 C21 第一個畫面；草稿第 3 節、BB_100 2-3，使用者 2026-10-13 定案：沛珊大一下和柏翰交往，玩家只看到一部分，沒有選項會讓他們在一起或分開）：
     大一下第 4 週法服讀書會結束（afterActivity，classes3d.js 的 afterActEvent）——她和柏翰一起走出萬才館，一路在爭下週誰報告哪一題；祐廷在後面收白板。只有畫面（旁白用原文的描述）。
     還沒認識沛珊的玩家沒有。第二個畫面（期中的麵店長桌）跟大一下期中的宵夜一起做 */
  { id:'ev_peishan_bohan_w4', title:'走出萬才館', participants:['classmate_peishan','classmate_bohan'], location:'wancai', trigger:'activity', afterActivity:'lawclub_study', term:['Y1S2'], weeks:[4], once:true, prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:null,text:'（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）'},{speaker:null,text:'（你在後面收白板。）'} ] },
  /* 主線 2（交接包 v2 C2）：除夕（STORY.lunarNewYear 的前一天，2026-02-16）。固定節點：除夕 12:00 以後、人有空就演（auto，在哪裡都可以——家裡用 2D）；
     如果除夕還沒演就上床，睡覺時演（sleep）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。演完時間往後 2 小時。記全域旗標 FAMILY_LAND_Y1（teacher／ask／lawyer；大三主線 9、大二上物權第 7 週的回想讀它）*/
  { id:'ev_chiayi_land_y1', title:'親戚的土地資料', participants:[], location:'any', trigger:'auto', priority:9, time:[12,24], once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1},
    dialogue:LAND_Y1, consequences:{advance:2} },
  { id:'ev_chiayi_land_y1_bed', title:'親戚的土地資料', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1&&!(G.events&&G.events.done&&G.events.done.ev_chiayi_land_y1)},
    dialogue:LAND_Y1 },
  /* 春假三選一（交接包 v2 C9；草稿第 3 節「春假」）——可昕 K8 開車旅行（BB_96 9-5）：第 5 週選了「和可昕開車旅行」＝4/3 早上 8:00 出遊（story3d.js 的 springChoose）。一天來回、不演住宿。
     車上的規則 → 目的地三選一（山上看星星只給第 6 週天文課有去的玩家：CLS.attendedWeek 'Y1S2:ge_y1s2:w6'，那一堂有同學說「連假的時候，我要去山上看星星。」）→ 到了（2D，依目的地）一題假設題、
     怎麼接都可以 → 回程（車上，晚上）。記 KX_TRIP:{Y1S2:'sea'|'oldtown'|'stars'}。旅行的照片（房間物件）：照片上寫什麼等 BB */
  { id:'ev_kexin_trip_spring_y1', title:'春假：開車旅行', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:13.5,   /* 07:40 政大校門接她 → 08:00 出發 … 晚上送她回政大、車開回家（AA_147 #1；台詞不改）*/
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'規則。我管音樂，你管方向。'},
      {speaker:'kexin',expression:'teasing',text:'誰都不能管對方的。……目的地，現在決定。'},
      {choice:[{text:'海邊',set:{KX_TRIP_Y1S2:'sea'},goto:'d_sea'},{text:'別的城市的老街',set:{KX_TRIP_Y1S2:'oldtown'},goto:'d_old'},
        {text:'山上看星星',if:{custom:G=>typeof CLS!=='undefined'&&!!CLS.attendedWeek&&CLS.attendedWeek(G,'Y1S2:ge_y1s2:w6')},set:{KX_TRIP_Y1S2:'stars'},goto:'d_star'}]},
      {label:'d_sea'},{speaker:'kexin',expression:'smile',text:'好。我要把腳弄濕。'},{scene:'海邊',bg:'trip_sea'},
      {speaker:'kexin',expression:'teasing',text:'假設海浪一直說同一句話，它想說什麼？'},
      {choice:[{text:'「回來。」',goto:'s1'},{text:'「再來一次。」',goto:'s2'},{text:'「妳腳濕了。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'smile',text:'好，等一下就回來。'},{speaker:null,text:'她又往海走了兩步。'},{goto:'back'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'好，再來一次。'},{goto:'back'},
      {label:'s3'},{speaker:'kexin',expression:'teasing',text:'……這不是答案，是事實。'},{goto:'back'},
      {label:'d_old'},{speaker:'kexin',expression:'smile',text:'每一家都說自己是老店。我們去查證。'},{scene:'老街',bg:'trip_oldtown'},
      {speaker:'kexin',expression:'teasing',text:'假設這條街每一家都說自己最老，誰要負責證明？'},
      {choice:[{text:'「說的人。」',goto:'o1'},{text:'「吃的人。」',goto:'o2'},{text:'「不用證明，好吃就好。」',goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好。這家的證據是牆上的照片，我信了。'},{goto:'back'},
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'那我們要多吃幾家。'},{goto:'back'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'這個法官太好收買了。'},{goto:'back'},
      {label:'d_star'},{speaker:'kexin',expression:'teasing',text:'你們通識課的人說的？好，我們去驗證。'},{scene:'山上',bg:'trip_mountain'},
      {speaker:'kexin',expression:'teasing',text:'假設月亮是我們兩個共有的，誰負責初一，誰負責十五？'},
      {choice:[{text:'「我負責初一。」',goto:'m1'},{text:'「妳負責十五。」',goto:'m2'},{text:'「一起負責。」',goto:'m3'}]},
      {label:'m1'},{speaker:'kexin',expression:'teasing',text:'初一看不到月亮。你好狡猾。'},{goto:'back'},
      {label:'m2'},{speaker:'kexin',expression:'smile',text:'最亮的那天給我？……成交。'},{goto:'back'},
      {label:'m3'},{speaker:'kexin',expression:'smile',text:'好。那每天晚上都要一起看。'},
      {label:'back'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'我不睡。我要陪你開車。'},
      {speaker:null,text:'過了收費站，她睡著了。音樂還是她選的。'} ],
    after:G=>{ const k=G.flags.KX_TRIP_Y1S2; if(k){ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; T.Y1S2=k; G.flags.KX_TRIP=T; } } },
  /* 春假麵店團那一趟（交接包 v2 C9；AA 71186c7）：4/3～4/4，住一晚民宿。地點「海邊的小鎮」（不寫真實地名；字幕「春假・海邊的小鎮」，背景 seaside_town 在 MISSING_EXTERNAL_ART）。
     旁白和台詞照 AA 的六句（括號裡的寫成旁白；「最後阿哲說：」拆成旁白＋他的台詞）；在場的是麵店團裡玩家認識的人（不認識小語：第五句只留「阿哲睡過頭」）。
     兩天一夜：演完以後 STORY.travelOvernight 把時間推到第二天傍晚（住在民宿那一晚不在宿舍，不演宿舍的夜晚事件）*/
  { id:'ev_noodle_trip_spring_y1', title:'春假・小旅行', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'春假・海邊的小鎮',bg:'seaside_town'},
      {speaker:null,text:'火車上，四個位子怎麼坐，討論了一整站。最後阿哲說：'},{speaker:'zhe',expression:'smile',text:'猜拳。'},
      {speaker:null,text:'到的第一天就下雨。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'……好。行程表第二版。理由欄寫『雨』。'},
      {speaker:null,text:'雨停的空檔，大家在堤防上排成一排拍照。'},
      {if:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭，小語在門外敲了五分鐘。'},{unless:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭。'},
      {speaker:null,text:'民宿老闆很熱情，每個人多拿了一顆茶葉蛋。'} ],
    consequences:{memo:'春假：和麵店團去海邊的小鎮（兩天一夜）'},
    afterOuting:async(G,GM,q)=>{ if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,q.day+1,16.5); } },
  /* 春假留在宿舍（交接包 v2 C9）：選了留在宿舍的玩家，4/3 白天走進宿舍時出現一次（AA 71186c7）*/
  { id:'ev_spring_dorm_empty_y1', title:'春假', participants:[], location:['dorm','dorm_hall'], trigger:'enter', once:true, background:'freeze',
    prereq:{custom:G=>G.flags.SPRING_Y1==='dorm'&&typeof STORY!=='undefined'&&!!STORY.springDays&&G.day===STORY.springDays().d0&&G.hour>=6&&G.hour<18},
    dialogue:[ {speaker:null,text:'宿舍變得很空。'} ] },
  /* 重訪日 1（交接包 v2 C20；草稿第 3 節、AA_12）——可昕的版本（BB_96 9-10）：大一最後一天（第 18 週最後一天，STORY.revisitDay），交往中的玩家
     她中午傳「最後一天。你說的那張桌子，我六點到。」（story3d.js phoneRules），18:00 以後人在兩點半 Café 就演（auto；早到的等到六點）。
     題目、選項照第 3 節的表（REVISIT_Y1_OPTS：只出經歷過的事，最多三個＋一定有的那一個）；她的回應照 BB 的表；中秋烤肉看 K3 有沒有來（KX_MET_NOODLE_TEAM）；
     她自己的那一件：做過 K6 互考（KX_K6_EXAM，ev_kexin_quiz 演完時記；舊存檔有 KX_QUIZ 也算）是「考古題」，沒有是「假設題的答案」。記 REVISIT_Y1:{who:'kexin',pick}（大四主線 10 讀它）。
     冷戰（AA_112 第 6 節的裂縫）還沒有系統：目前交往中都算她能來。麵店團併桌、單身的版本：邀約的台詞等 AA（已問）*/
  { id:'ev_revisit_y1_kexin', title:'重訪日', participants:['kexin'], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], weeks:[18], time:[18,22], once:true, background:'blur',
    prereq:{flags:['dating_kexin'],custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1},
    dialogue:[ {speaker:'kexin',expression:'smile',text:'（坐下，手放在桌上）假設這張桌子，記得每一個坐過的人。'},
      {speaker:'kexin',expression:'teasing',text:'它會記得你今年最意外的一件事嗎？說吧。'},
      REVISIT_Y1_CHOICE('k_'),
      {label:'k_retake'},{speaker:'kexin',expression:'smile',text:'一年前你也坐在那間教室。……這次你待到最後了。'},{goto:'mine'},
      {label:'k_bbq'},{if:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'teasing',text:'那天阿哲輸給我三個冷笑話。'},{unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'teasing',text:'我只看過照片。玉米還是我們系的好。'},{goto:'mine'},
      {label:'k_noodle'},{speaker:'kexin',expression:'smile',text:'你講了一整年的麵。暑假帶我去。'},{goto:'mine'},
      {label:'k_appeal'},{speaker:'kexin',expression:'smile',text:'你們系的人，連宿舍的事都寫成申訴書。……我喜歡。'},{goto:'mine'},
      {label:'k_rain'},{speaker:'kexin',expression:'smile',text:'那天的雨很大。你後來有沒有感冒？'},{goto:'mine'},
      {label:'k_lecture'},{speaker:'kexin',expression:'smile',text:'你說講者最後問的那一題，我也想了很久。'},{goto:'mine'},
      {label:'k_show'},{speaker:'kexin',expression:'teasing',text:'拍手也算參加。……你一定拍得很用力。'},{goto:'mine'},
      {label:'k_daily'},{speaker:null,text:'她嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'……這題答得太好。我要記下來。'},
      {label:'mine'},{speaker:'kexin',expression:'smile',text:'我的最意外？我以為我們會常常吵架。'},
      {if:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果我們吵最多的，是考古題。'},
      {unless:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果我們吵最多的，是假設題的答案。'} ],
    after:G=>{ G.flags.REVISIT_Y1={who:'kexin',pick:G.flags.REVISIT_Y1_PICK||'daily'}; } },
  /* 重訪日 1（交接包 v2 C20）——麵店團併桌的版本（AA 50da3a9：沒有和可昕交往、在麵店團）：17:00 阿哲在群組「學期最後一天。兩點半，六點，併桌。」（story3d.js phoneRules）。
     題目（AA 草稿第 3 節的原句，寫成旁白）→ 玩家的選項（REVISIT_Y1_OPTS）→ 麵店團回一句（一般：阿哲「……好。這個可以。」；「麵店的第一碗。」：阿哲「那碗是我推薦的。」；
     「每天都差不多。」：小語「……這個最好。」）→ 他們也各說一件（只讓認識的人說；阿哲那句要去過麵店——LAWWW 加的條件，問 AA）。記 REVISIT_Y1:{who:'noodle_team',pick} */
  { id:'ev_revisit_y1_noodle', title:'重訪日', participants:['zhe'], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], weeks:[18], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},
    dialogue:[ {speaker:null,text:'這一年，你最意外的一件事是什麼？'},
      REVISIT_Y1_CHOICE('n_'),
      {label:'n_noodle'},{speaker:'zhe',expression:'laugh',text:'那碗是我推薦的。'},{goto:'theirs'},
      {label:'n_daily'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'smile',text:'……這個最好。'},{unless:EV_KNOWS('yu'),speaker:'zhe',expression:'smile',text:'……好。這個可以。'},{goto:'theirs'},
      {label:'n_retake'},{label:'n_bbq'},{label:'n_appeal'},{label:'n_rain'},{label:'n_lecture'},{label:'n_show'},{speaker:'zhe',expression:'smile',text:'……好。這個可以。'},
      {label:'theirs'},
      {if:{custom:G=>G.flags.noodleTableDay!=null||(Array.isArray(G.flags.ndlDays)&&G.flags.ndlDays.length>0)},speaker:'zhe',expression:'smile',text:'我最意外的是，你真的每個禮拜二、四都來。'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'我最意外的是我跟以安吵完還開了讀書會。'} ],
    after:G=>{ G.flags.REVISIT_Y1={who:'noodle_team',pick:G.flags.REVISIT_Y1_PICK||'daily'}; } },
  /* 重訪日 1——單身、不在麵店團的版本（AA 50da3a9、d1fa44f；BB_96 第 11 節 b7c89d1）：這一年最親近的人（STORY.revisitClosest：先看階段、再看熟悉；學姊、沛珊這時有伴侶，不算）。
     男生：窗邊雙人桌坐他，玩家說完他也說一件。女生：祐廷一個人坐窗邊，她 18:00 傳來訊息（story3d.js phoneRules），之後一樣有題目和選項。
     都還不到「有點熟」：一個人坐窗邊，題目寫在筆記本上；「這張桌子，從今天開始是你的位子。」（旁白照 AA 的描述寫成句子）。
     阿哲、以安、語彤、小語、芯慈（AA 的人物）的台詞：AA 2100018（2026-10-14 補）。記 REVISIT_Y1:{who,pick} */
  { id:'ev_revisit_y1_single', title:'重訪日', participants:[], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], weeks:[18], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))},
    dialogue:[ {if:{custom:G=>STORY.revisitClosest(G).kind==='male'},goto:'q'},
      {speaker:null,text:'你一個人坐在窗邊。'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'你在筆記本上寫了一行。'},
      {label:'q'},{speaker:null,text:'這一年，你最意外的一件事是什麼？'},
      REVISIT_Y1_CHOICE('s_'),
      {label:'s_retake'},{label:'s_bbq'},{label:'s_noodle'},{label:'s_appeal'},{label:'s_rain'},{label:'s_lecture'},{label:'s_show'},{label:'s_daily'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_bohan'},goto:'bohan'},{if:{custom:G=>STORY.revisitClosest(G).id==='kai'},goto:'kai'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_mingxuan'},goto:'mx'},{if:{custom:G=>STORY.revisitClosest(G).id==='npc_fangyt'},goto:'fy'},{if:{custom:G=>STORY.revisitClosest(G).id==='zhe'},goto:'zhe'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'這張桌子，從今天開始是你的位子。'},{goto:'end'},
      {label:'bohan'},{speaker:'classmate_bohan',expression:'neutral',text:'我最意外的是……'},{speaker:'classmate_bohan',expression:'neutral',text:'（推了一下眼鏡）這一題，沒有考古題。'},{goto:'end'},
      {label:'kai'},{if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel&&SOCIAL.friendLevel('kai')==='CLOSE_FRIEND'},goto:'kai2'},
      {speaker:'kai',expression:'neutral',text:'我最意外的是……那條膠帶。'},{speaker:'kai',expression:'smile',text:'我寫了『無條件入境』，結果是我一直在出境。'},{speaker:'kai',expression:'smile',text:'……去你那邊拿零食。'},{goto:'end'},
      {label:'kai2'},{speaker:'kai',expression:'neutral',text:'我最意外的是……膠帶是我自己撕的。'},{speaker:'kai',expression:'smile',text:'本來以為會貼四年。'},{goto:'end'},
      {label:'mx'},{speaker:'classmate_mingxuan',expression:'laugh',text:'哈哈，我最意外的是……'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我第一次走進一家店，沒有先算 CP 值。'},{speaker:'classmate_mingxuan',expression:'smile',text:'……就是這裡。'},{goto:'end'},
      {label:'zhe'},{speaker:'zhe',expression:'smile',text:'我最意外的喔……'},{speaker:'zhe',expression:'laugh',text:'我以為大學很難交朋友。結果一個學期，我認識了一整間麵店。'},{goto:'end'},
      {label:'fy'},{speaker:'npc_fangyt',expression:'neutral',text:'我最意外的是……你的黃金葛長得比我的好。'},{speaker:'npc_fangyt',expression:'neutral',text:'……我回去查了原因。是窗戶的方向。'},
      {label:'end'} ],
    after:G=>{ const c=STORY.revisitClosest(G); G.flags.REVISIT_Y1={who:c.id||'alone',pick:G.flags.REVISIT_Y1_PICK||'daily'}; } },
  /* 學姊 W5「她改的便條」（BB_96 2-6；交接包 v2）：大一下第 17 週週三的法服學期檢討會（activities.js 的 lawclub_review_y1s2）之後；前置 lawclub、法服讀書會去過 3 次以上、只一次。
     去了檢討會：會後接著演（afterActivity）；沒去的社員：那天晚上 21:00 以後走進萬才館，第一句旁白換成「聽說今天的檢討會很安靜。」其他照舊。流程的描述寫成旁白。
     記 NOTICED_HER（W8 的伏筆）／GAVE_HER_NOTE（寫了什麼記在備註；回收見 BB_108）*/
  { id:'ev_sis_sticky_notes', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'activity', afterActivity:'lawclub_review_y1s2', term:['Y1S2'], weeks:[17], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>W5_OK(G)},
    dialogue:[ {speaker:null,text:'檢討會上，學姊對一年級的書狀列了十二條缺點，大家臉都很僵。'}].concat(W5_REST) },
  { id:'ev_sis_sticky_notes_late', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'enter', term:['Y1S2'], weeks:[17], weekday:[3], time:[21,23.5], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>W5_OK(G)&&!(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attended(G,'lawclub_review_y1s2',G.day))},
    dialogue:[ {speaker:null,text:'聽說今天的檢討會很安靜。'}].concat(W5_REST) },
  /* 子晴 Q5「你負責拍手」（BB_96 4-4、AA_13 G3；交接包 v2）：大一下第 14 週週三的吉他社成發（activities.js 的 guitar_show_y1s2，去看就演）；認識子晴才有。
     演出中三選一（介面的動作）：拍手＝CLAPPED（她下台說的那句＋插座貓貼紙：雙方都單身、和她朋友以上＝直接貼在你的手機殼上，其他＝遞給你）／坐著聽完＝她點頭「你有來。」／先走＝隔天手機「你看到一半。後半比較好。」。
     沒去（收到邀請或是吉他社的人）：隔天手機「你沒來」（沒有標點）。記 ZQ_SHOW（clap／came／half／absent；大二 Q9 讀它）。BCG-11（舞台上她按錯和弦後對著麥克風笑）還沒有圖 */
  { id:'ev_ziqing_show', title:'你負責拍手', participants:['heroine_04'], location:'wancai', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:null,text:'（後台。）'},
      {speaker:'heroine_04',expression:'embarrassed',text:'欸不是，我手在抖。'},
      {speaker:'heroine_04',expression:'neutral',text:'我寫程式從來不抖。'},
      {speaker:null,text:'（第二首，她按錯一個和弦。全場安靜一秒。她自己先笑出來。）'},
      {cg:'cg_bug_fix_heroine04'},   /* BCG-11（BB_117：按錯和弦、她自己先笑出來、對著麥克風說話的那一秒；在場就看得到，拍不拍手都算）*/
      {speaker:'heroine_04',expression:'laugh',text:'（對著麥克風）這個 bug 我下次修。'},
      {speaker:null,text:'（全場笑。）'},
      {choice:[{text:'（拍手）',set:{ZQ_SHOW:'clap'},goto:'clap'},{text:'（坐著聽完）',set:{ZQ_SHOW:'came'},goto:'came'},{text:'（先走）',set:{ZQ_SHOW:'half'},goto:'end'}]},
      {label:'clap'},{speaker:'heroine_04',expression:'laugh',text:'我看到你了。你拍得超大聲。很丟臉。……謝啦。'},
      {if:{custom:G=>!G.flags.dating_kexin&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))},speaker:null,text:'（她把一張插座貓貼紙，直接貼在你的手機殼上。）'},
      {unless:{custom:G=>!G.flags.dating_kexin&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))},speaker:null,text:'（她遞給你一張插座貓貼紙。）'},
      {mem:[{npc:'heroine_04',tag:'CLAPPED',note:'大一下的吉他社成發：你拍手'}]},{goto:'end'},
      {label:'came'},{speaker:null,text:'（她下台經過，點個頭。）'},{speaker:'heroine_04',expression:'neutral',text:'你有來。'},
      {label:'end'} ] },
  /* 學姊 W2b 家族聚餐（BB_96 2-1；交接包 v2）：第 4 週週五 18:30 永康街的咖哩（出遊；家族群組回「去。」才排，story3d.js）。2D 背景「永康街・咖哩店」（虛構店名；圖還沒有）。
     有 SAID_TREAT_SIS：「二，飲料學弟請，咖哩我請。」「重點是，這不是客套。」；沒有：「二，今天我請。」「重點是，下次誰都不要遲到。」（「最後一句」照 W2c 的內容理解成「重點是」那一句；已請 BB 確認）。
     回了「我有。」（SAID_HAS_CAR）：結束時順路載三個人回學校（BB_97 2-9 的描述寫成旁白）。記 FAMILY_DINNER；有 SAID_TREAT_SIS 而且到場＝TREATED_FAMILY */
  { id:'ev_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'永康街・咖哩店',bg:'yongkang_curry'},
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）兩件事。一，我要辣的。二，飲料學弟請，咖哩我請。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）兩件事。一，我要辣的。二，今天我請。'},
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'smile',text:'重點是，這不是客套。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'重點是，下次誰都不要遲到。'},
      {speaker:null,text:'Kevin 遲到七分鐘。'},
      {speaker:'heroine_05',expression:'neutral',text:'Kevin，下次的地方你選。'},
      {if:{flags:['SAID_HAS_CAR']},speaker:null,text:'家聚結束，你順路載三個人回學校。學姊坐後座，一路在講下學期的家族讀書會。'} ],
    after:G=>{ if(typeof SOCIAL==='undefined') return; SOCIAL.remember('heroine_05','FAMILY_DINNER','永康街的咖哩'); if(G.flags.SAID_TREAT_SIS){ G.flags.TREATED_FAMILY=true; SOCIAL.remember('heroine_05','TREATED_FAMILY','說要請全家族飲料，真的請了'); } } },
  /* 沛珊 P3b「課輔班的下午」（BB_96 3-3，交接包 v2）：大一下第 5 週起，週二或週四 16:30–18:00 走進溫州街，P2（ev_peishan_doubt）之後、只一次。
     她不用在 3D 裡出現：直接換成 2D 背景「溫州街・課輔班門口」（圖還沒有＝深色底＋字幕）。第二個選項只給去過法服讀書會的玩家（CLUB_lawclub_study）。
     記 SAW_HER_TEACH（大二 P3「我要重考。去念教育」的伏筆；不寫成憂鬱或逃避）*/
  { id:'ev_peishan_tutoring', title:'課輔班的下午', participants:['classmate_peishan'], location:'wenzhou', trigger:'enter', term:['Y1S2'], weeks:[5,6,7,8,9,10,11,12,13,14,15,16,17,18], weekday:[2,4], time:[16.5,18], once:true, background:'dark',
    prereq:{events:['ev_peishan_doubt']},
    dialogue:[ {scene:'溫州街・課輔班門口',bg:'wenzhou_tutoring'},
      {speaker:null,text:'她帶著一群國小生從課輔班走出來，手上拿著一疊作業本。'},
      {speaker:'classmate_peishan',expression:'smile',text:'喔，是你。我在這裡當志工。一週三天。'},
      {speaker:null,text:'一個小孩拉她的衣角。她蹲下來聽他講完，站起來。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'……我在這裡的時候，不會看時間。'},
      {choice:[{text:'「妳看起來很開心。」',goto:'a'},{text:'「讀書會最近比較少看到妳。」',if:{flags:['CLUB_lawclub_study']},goto:'b'},{text:'（幫她拿一半的作業本）',goto:'c'}]},
      {label:'a'},{speaker:'classmate_peishan',expression:'thinking',text:'有嗎。'},{speaker:null,text:'她想了一下。'},{speaker:'classmate_peishan',expression:'smile',text:'……有。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。我還是會去，只是比較少。'},{speaker:null,text:'她不躲這個問題。'},{speaker:'classmate_peishan',expression:'thinking',text:'我在找我比較想待的地方。'},{goto:'end'},
      {label:'c'},{speaker:'classmate_peishan',expression:'smile',text:'謝謝。……你走路很慢，跟小孩一樣。'},{speaker:null,text:'小孩們笑。'},
      {label:'end'},{mem:[{npc:'classmate_peishan',tag:'SAW_HER_TEACH',note:'溫州街的課輔班：她在當志工'}]} ] },
  /* 小語 語 2「剛好路過」（交接包 v2 C18；草稿第 3 節、AA_40 語 2）：大一下第 14～16 週，阿哲和小語的三個徵兆。三個選項都不改變結果（大二上兩人在一起），只記 YU2_PICK（之後小語怎麼跟祐廷說）。
     交往中的玩家也一樣（這是小語和阿哲的事）。只有認識小語的玩家有（met_yu）；阿哲開場就認識。
     「徵兆保證觸發」（AA_40 要開發組評估）的做法：
       ① 傅鐘的早餐：小語早上坐在傅鐘旁邊的長椅（她的作息 9:30–12:00），走到她附近就演（auto＋near，不用特地找她說話）；
       ② 麵店：麵店日（週二、週四）走進麵店就演一句旁白（麵店團才有）；
       ③ 最後一個（小語問祐廷）：吉他社的玩家在社課結束後（afterActivity），其他玩家在麵店散場後走到騎樓（公館，今天有在麵店）；
          要先看過 ① 或 ② 其中一個——所以看到 ③ 的玩家一定看過兩個以上；麵店團的玩家同一個晚上 ②＋③ 就湊齊。整個存檔只問一次（YU2_PICK）*/
  { id:'ev_yu_sign_soymilk', title:'剛好路過', participants:['yu','zhe'], location:'campus', trigger:'auto', near:{npc:'yu',r:4}, term:['Y1S2'], weeks:[14,15,16], weekday:[1,2,3,4,5], time:[9.5,12], once:true, background:'blur',
    prereq:{flags:['met_yu']},
    dialogue:[ {speaker:null,text:'阿哲出現，帶著兩杯豆漿。'},{speaker:'zhe',expression:'smile',text:'剛好路過。'},{speaker:'yu',expression:'neutral',text:'你住公館。'},{speaker:'zhe',expression:'neutral',text:'……剛好路過。'} ],
    consequences:{stamp:['yu2SoymilkDay']} },
  { id:'ev_yu_sign_seat', title:'她每次都坐阿哲旁邊', participants:['yu','zhe'], location:'noodle', trigger:'enter', term:['Y1S2'], weeks:[14,15,16], weekday:[2,4], time:[17.5,21], once:true, background:'freeze',
    prereq:{flags:['met_yu'],custom:G=>G.flags.noodleTableDay!=null&&typeof STORY!=='undefined'&&!!STORY.noodleDay&&STORY.noodleDay(G.day)},
    dialogue:[ {speaker:null,text:'小語每次都坐阿哲旁邊。'} ],
    consequences:{stamp:['yu2SeatDay']} },
  { id:'ev_yu_sign_question_club', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'wancai', trigger:'activity', afterActivity:'club_guitar', term:['Y1S2'], weeks:[14,15,16], once:true, background:'blur',
    prereq:{flags:['met_yu','CLUB_club_guitar'],custom:G=>!G.flags.YU2_PICK&&(G.flags.yu2SoymilkDay!=null||G.flags.yu2SeatDay!=null)},
    dialogue:YU2_QUESTION },
  { id:'ev_yu_sign_question_arcade', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'gongguan', trigger:'enter', term:['Y1S2'], weeks:[14,15,16], weekday:[2,4], time:[17.5,22], once:true, background:'blur',
    prereq:{flags:['met_yu'],custom:G=>{ const F=G.flags; return !F.YU2_PICK&&!F.CLUB_club_guitar&&(F.yu2SoymilkDay!=null||F.yu2SeatDay!=null)&&Array.isArray(F.ndlDays)&&F.ndlDays.includes(G.day); }},
    dialogue:YU2_Q(true) },
  /* 以安新 7 前半「和小語吵架」（交接包 v2 C14；草稿第 3 節、AA_113 新 7）：大一下第 11 週週二晚上的麵店（麵店日）。台詞、選項照原文；好感數字原文沒有，不加。
     記 AN_YU_ARGUMENT（選了哪一個；之後新 8 可以用）。不在場的玩家：小語在麵店團群組說「我跟以安吵架了。」「……吵得很好。」（story3d.js phoneRules，記「聽說」）。
     法律：集會遊行「許可制／報備制」的爭論，只呈現兩邊的理由、不給結論——LEGAL_REVIEW_REQUIRED（BB 查核前不發布；legal_review 欄位給發布檢查用）*/
  { id:'ev_an_yu_argument', title:'吵架', participants:['heroine_01','yu','zhe'], location:'noodle', trigger:'enter', priority:9, once:true, term:['Y1S2'], weeks:[11], weekday:[2], time:[17.5,21], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur', legal_review:'REQUIRED',
    dialogue:[ {speaker:'yu',expression:'serious',text:'上街要先申請？那還叫自由嗎？'},{speaker:'heroine_01',expression:'serious',text:'先分清楚。是要申請許可，還是讓人知道你要用哪一條路。'},
      {speaker:'yu',expression:'annoyed',text:'妳好冷。'},{speaker:'heroine_01',expression:'neutral',text:'妳沒有結構。'},{speaker:'zhe',expression:'neutral',text:'麵要坨了。'},
      {choice:[{text:'「我站小語。」',consequences:{flags:{AN_YU_ARGUMENT:'yu'}},goto:'yu'},{text:'「我站以安。」',consequences:{flags:{AN_YU_ARGUMENT:'an'}},goto:'an'},
        {text:'「妳們講的是同一件事的兩邊。」',consequences:{flags:{AN_YU_ARGUMENT:'both'}},goto:'both'},{text:'（先吃麵）',consequences:{flags:{AN_YU_ARGUMENT:'noodle'}},goto:'noodle'}]},
      {label:'yu'},{speaker:'yu',expression:'laugh',text:'看吧！'},{speaker:'heroine_01',expression:'neutral',text:'理由？……不准賴。'},{goto:'end'},
      {label:'an'},{speaker:'heroine_01',expression:'neutral',text:'謝謝。理由？'},{speaker:'yu',expression:'surprised',text:'你們兩個好可怕。'},{goto:'end'},
      {label:'both'},{speaker:null,text:'（兩個人同時轉過來看你。）'},{speaker:'yu',expression:'surprised',text:'……幹嘛突然這麼有道理。'},{goto:'end'},
      {label:'noodle'},{speaker:'zhe',expression:'smile',text:'明智。'},
      {label:'end'} ] },
  /* 以安新 7 後半「公法讀書會第一次」（交接包 v2 C14）：活動「公法讀書會」（activities.js，大一下第 12 週起每週四 20:00，萬才館研討室 A；所有人都收到邀請，AA_115：不懲罰先走、沒去演講的人）。
     第一次去：白板（原文）；加入就每週四有一格（CLUB_public_law_group），記 PUBLIC_LAW_GROUP。不去也照常，之後還是會被邀 */
  { id:'ev_public_law_group', title:'公法讀書會', participants:['heroine_01','yu'], location:'wancai', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（研討室的白板上寫著「公法讀書會」。下面是以安的字：「每人十分鐘。」）'},{speaker:null,text:'（小語在旁邊補：「可以吃東西。」）'},{set:{PUBLIC_LAW_GROUP:true}} ] },
  /* 法四學長姊畢業（交接包 v2 C17；AA_71 2-12「大一：法四學長姊畢業」，寫成慶祝）：大一下第 15 週週六 10～15 在校園（和 ev_sis_festival_booth 同樣的做法：在校園就演）；
     學士帽丟上天、學長請你拍照。法服群組、家族群組那兩則在 story3d.js 的 phoneRules。旁白只用 AA 的字 */
  { id:'ev_grad_seniors_y1', title:'學長姊畢業', participants:[], location:'campus', trigger:'auto', term:['Y1S2'], weeks:[15], weekday:[6], time:[10,15], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（椰林大道。學士帽丟上天。）'},{speaker:null,text:'（一位學長把手機塞給你。）'},{speaker:'學長',text:'學弟，幫我們拍一張！'},{speaker:null,text:'（拍完。）'},{speaker:'學長',text:'謝啦！三年後換你。'} ] },
  /* 大一的系籃比賽（交接包 v2 C16；AA_71 2-11）：活動「系籃比賽」（activities.js，大一下第 14 週週六 14～16，球場）去看就演；阿哲上場，你選拍手、記分、送水，各一段（原文）；
     都記一筆小記憶 WATCHED_GAME（記在阿哲身上）。旁白只用 AA 的字。好感數字原文沒有，不加 */
  { id:'ev_zhe_game_y1', title:'系籃比賽', participants:['zhe'], location:'campus', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（系籃比賽。阿哲上場。）'},
      {choice:[{text:'（拍手）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你拍手'}]},goto:'clap'},{text:'（記分）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你記分'}]},goto:'score'},{text:'（送水）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你送水'}]},goto:'water'}]},
      {label:'clap'},{speaker:null,text:'（你在觀眾席拍到手掌發紅。阿哲進球，轉身指著你。）'},{speaker:'zhe',expression:'laugh',text:'有聽到！'},{goto:'end'},
      {label:'score'},{speaker:null,text:'（你坐到記分台，翻牌翻錯一次，裁判看了你一眼。）'},{speaker:'zhe',expression:'smile',text:'沒事啦，多兩分給對面，算我們請客。'},{goto:'end'},
      {label:'water'},{speaker:null,text:'（中場你把一箱水搬到場邊。阿哲一口氣喝掉半瓶。）'},{speaker:'zhe',expression:'smile',text:'你是我們的後勤部長。'},
      {label:'end'} ] },
  { id:'ev_an_azalea_y1', title:'四年，四張', participants:['heroine_01'], location:'campus', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[3], weekday:[6], time:[10,12], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:null,text:'（椰林大道的杜鵑開了。以安拿著手機。）'},{speaker:'heroine_01',expression:'neutral',text:'每年同一個位置拍一張。四年，四張。'},
      {unless:{stage:{npc:'heroine_01',min:'FAMILIAR'}},goto:'yu'},
      {speaker:null,text:'（她把手機遞給你。）'},{speaker:'heroine_01',expression:'neutral',text:'你幫我拍。……不要叫我笑。'},{speaker:null,text:'（拍完她看了一下。）'},{speaker:'heroine_01',expression:'smile',text:'可以。理由：杜鵑在畫面裡，我也在。'},{set:{AZALEA_Y1:'player'}},{goto:'flowers'},
      {label:'yu'},{speaker:null,text:'（她請小語拍。）'},{speaker:'yu',expression:'smile',text:'笑一個嘛！'},{speaker:'heroine_01',expression:'neutral',text:'不要。'},{set:{AZALEA_Y1:'yu'}},
      {label:'flowers'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'},{npc:'heroine_04',tag:'FIRST_MET'}]},goto:'end'},
      {speaker:null,text:'（芷若拿著手機在拍花。）'},{speaker:'heroine_04',expression:'smile',text:'妳拍花？妳平常不是都在看人嗎？'},{speaker:'heroine_02',expression:'neutral',text:'花不會點餐。今天想休息。'},
      {label:'end'} ] },
  { id:'ev_an_dorm_appeal_result', title:'申訴的結果', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[7], prereq:{events:['ev_an_dorm_appeal'],custom:G=>!G.flags.AN_APPEAL_RESULT}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'smile',text:'點數減了一點。宿舍說，以後記點以前會先問。'},{speaker:'heroine_01',expression:'neutral',text:'我本來想證明規定是錯的。後來發現規定沒錯，是它沒想到這種情況。'},
      {if:{flagIs:{AN_APPEAL:'ask'}},speaker:'heroine_01',expression:'smile',text:'你說的那一句，我放在第一段。'},{set:{AN_APPEAL_RESULT:'met'}} ] },
  /* 大一下的期末最後一頓（交接包 v2 C19：AA_71 2-13，同一段原文；只一次）。大一上那一個 id 不改（舊存檔 events.done 相容）*/
  { id:'ev_term_last_meal_y1s2', title:'期末最後一頓', participants:[], location:'noodle', trigger:'enter', term:['Y1S2'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S2','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {speaker:null,text:'期末最後一科考完。麵店團一定吃一頓。'},{speaker:null,text:'阿姨多送了一盤小菜。'},{speaker:'阿姨',text:'考完了，吃好一點。'} ],
    consequences:{memo:'大一下期末最後一頓（阿鳳麵店）'} },
  /* 可昕 K2 她第一次來台大（BB_95 9-3）：第 6 週週五 20:00 她傳「這次換我去台大。我先去找品妤，再去霖澤館抓你。」，週六 16:00 在社科院門口（story3d.js 的 phoneRules；出遊）。
     最小版本（BB_95 第 9 節）：依序換背景——社科院門口（她和品妤；品妤第一次出現＝重新介紹自己，之前遇過＝「你來了。」）→ 霖澤館前（假設題三選一）→ 椰林大道（旁白帶過去公館吃晚餐）。
     K1 還沒去過＝分開時「下次換你來，我當導遊。」。沒去（不去了、過了時間）＝她傳兩個人在社科院門口的照片（outingMissed）。記 MET_PINYU */
  { id:'ev_kexin_visits_ntu', title:'她第一次來台大', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; PHONE.at(G,G.day,Math.max(G.hour,q.h+0.75),[{th:'p:kexin',from:'kexin',text:'📷（她和品妤在社科院門口）'},{th:'p:kexin',from:'kexin',text:'品妤說你們系館很好認，最高的那棟。'}],'kx_ntu_photo'); },
    dialogue:[ {scene:'台大・社科院門口',bg:'ntu_soc'},
      {speaker:null,text:'社科院門口，可昕和品妤已經在等你。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。……一個暑假沒見，你不會忘了吧。'},
      {if:{flags:['MET_PINYU']},speaker:'品妤',text:'你來了。'},
      {speaker:'kexin',expression:'teasing',text:'這是我的舊系館。你的新系館在對面，我知道。'},
      {scene:'台大・霖澤館前',bg:'ntu_linze'},{speaker:'品妤',expression:'neutral'},
      {speaker:'kexin',expression:'neutral',text:'所以這就是你每天說的霖澤館。……比照片高。'},
      {speaker:'kexin',expression:'teasing',text:'假設霖澤館會說話，它看到你每天第一堂遲到，第一句會說什麼？'},
      {choice:[{text:'「又是你。」',goto:'a'},{text:'「今天也辛苦了。」',goto:'b'},{text:'「我沒有每天遲到。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'對，它一定很熟你。'},{goto:'e'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'……你對建築物比對我溫柔。'},{speaker:null,text:'她笑。'},{goto:'e'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'它會說：『證據呢？』'},
      {label:'e'},
      {scene:'台大・椰林大道',bg:'ntu_avenue'},{leave:'品妤'},   /* AA_147：霖澤館前品妤還在（在旁邊看手機＝立繪留著、不說話）；椰林大道她先走、剩兩人 */
      {speaker:null,text:'品妤先回去了。你們沿著椰林大道，一路走到公館吃晚餐。'},
      {unless:{events:['ev_kexin_tour_nccu']},speaker:'kexin',expression:'smile',text:'下次換你來，我當導遊。'} ],
    consequences:{flags:{MET_PINYU:true},memo:'可昕第一次來台大'} },
  /* 可昕 K4 第一次視訊一起讀書（BB_95 9-5）：第 16 週週二 20:00 她問（story3d.js 的 phoneRules）；「好，九點開。」＝當天 21:00 視訊（出遊：接起來）。
     開始前先選讀哪一科（和自學一樣算進期末準備：兩個小時＝兩次）；每半小時她出一題假設題（照順序，玩笑，不給結論），回她＝「你分心了。很好。」、
     不回＝「你今天好認真。我有點寂寞。……繼續。」（各自第一次才說，不重複）。沒接、今天先不要＝23:00 她傳書桌的照片（outingMissed）。記 VIDEO_STUDY（AA_112 第 6 節：和見面一樣算數）*/
  { id:'ev_kexin_video_study', title:'視訊一起讀書', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    beforeOuting:async(G,GM)=>{ G.flags.kxVideoCourse=null; if(typeof CLS==='undefined'||!CLS.studyPick) return; await GM.say(null,'今天讀哪一科？'); const r=await CLS.studyPick(GM); if(r&&r.course) G.flags.kxVideoCourse=r.course.id; },
    afterOuting:async(G,GM)=>{ const c=G.flags.kxVideoCourse; if(c&&typeof CLS!=='undefined'){ const R=CLS.rec(G); R.prep[c]=(R.prep[c]||0)+1; }   /* 第二個小時（studyPick 已經算了第一個小時）*/
      if(GM.energy) GM.energy(-16); if(G.stats) G.stats.study=(G.stats.study||0)+2; },
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; const late=G.day>q.day||G.hour>=23; PHONE.at(G,late?G.day:q.day,late?G.hour:23,KX_DESK_PHOTO,'kx_video_photo'); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'視訊接通。各讀各的。'},
      {speaker:'kexin',expression:'teasing',text:'假設你的螢光筆會說話，它會說你畫太多了嗎？'},
      {choice:[{text:'（回她）',goto:'r1'},{text:'（不回，繼續讀）',goto:'n1'}]},
      {label:'r1'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q1'},
      {label:'n1'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q1'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設期末考可以帶一個人進去，但他不能講話。你帶誰？'},
      {choice:[{text:'（回她）',goto:'r2'},{text:'（不回，繼續讀）',goto:'n2'}]},
      {label:'r2'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q2'},
      {label:'n2'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q2'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設咖啡有法律人格，你喝它算不算……算了，你讀你的。'},
      {choice:[{text:'（回她）',goto:'r3'},{text:'（不回，繼續讀）',goto:'n3'}]},
      {label:'r3'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q3'},
      {label:'n3'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q3'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'假設我們現在同時睡著，誰會先發現？'},
      {choice:[{text:'（回她）',goto:'r4'},{text:'（不回，繼續讀）',goto:'n4'}]},
      {label:'r4'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q4'},
      {label:'n4'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q4'} ],
    consequences:{mem:[{npc:'kexin',tag:'VIDEO_STUDY',note:'第一次視訊一起讀書'}],flags:{KX_VIDEO_DONE:true},memo:'和可昕視訊一起讀書'} },
  /* 第一份報告交出去的晚上（BB_95 9-6 改版；2026-10-15 BB-B：可昕生日改 4/24，這一晚不再是生日；AA_140 G01）：12/3（第 14 週週三）。id 不改（舊存檔）。
     前一晚她傳「明天交第一份期末報告……」；當天她的對話串多一則「祐廷的草稿」（「交出去了嗎？」23:59 前可以傳）；18:00 出遊提示「開車去政大」（story3d.js 的 phoneRules）。
     這是去的那一段：校門 → 山下的小吃街。「問予樂的。」只有見過予樂（K1b）才有；予樂見過：「好，我先走。司機，載好她。」；沒見過：她看了祐廷一眼才說「好，我先走。」。
     K1、K1b 都去過、K1 讓她點（K1_ORDER:'let_her'）＝第三次去，老闆記得點法。BCG-28（cg_birthday_kexin，十二月、冬裝，圖照用）放在「……你怎麼知道我幾點下課？」。
     記 KX_DEC3_VISIT（phoneRules 換成 KX_DEC3:{1:'visit'}）。遊戲裡 12/3 不再出現「生日」兩個字 */
  { id:'ev_kexin_birthday_y1', title:'第一份報告交出去的晚上', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'政大的晚上，山上的風比台大冷一點。'},
      {speaker:null,text:'她和予樂下課走出來，看到車，停下來。'},
      {cg:'cg_birthday_kexin'},
      {speaker:'kexin',expression:'surprised',text:'……你怎麼知道我幾點下課？'},
      {choice:[{text:'「妳的課表在我手機裡。」',goto:'a'},{text:'「問予樂的。」',if:{events:['ev_kexin_yule_pass']},goto:'b'},{text:'「猜的。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那張是我開玩笑傳給你的。……你真的存了。'},{goto:'yl'},
      {label:'b'},{speaker:'予樂',text:'我什麼都沒說。'},{speaker:'kexin',expression:'teasing',text:'她說了。她每次說謊都先撥頭髮。'},{goto:'yl'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'假設你猜錯了，你要在這裡等多久？'},{speaker:'player',text:'等到猜對。'},{speaker:'kexin',expression:'smile',text:'……這題算你過。'},
      {label:'yl'},
      {if:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。司機，載好她。'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:null,text:'予樂看了你一眼，對可昕說：'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {if:{flagIs:{K1_ORDER:'let_her'},events:['ev_kexin_tour_nccu','ev_kexin_yule_pass']},speaker:null,text:'老闆記得你的點法。'},
      {speaker:'kexin',expression:'smile',text:'假設今天是一個普通的週三。'},
      {speaker:'kexin',expression:'smile',text:'……你開車上山，就不普通了。'},
      {speaker:'kexin',expression:'smile',text:'今天你點餐。'} ],
    consequences:{flags:{KX_DEC3_VISIT:true},memo:'第一份報告交出去的晚上（政大）'} },
  /* 可昕的生日（BB_96 9-7b；2026-10-15 BB-B：生日改 4/24，AA_137 第 1 節；AA_140 G01）：大一下第 9 週週五 4/24（期中考週）。做法和 12/3 同一套（story3d.js phoneRules）：
     早上行事曆「可昕生日」；草稿「生日快樂。」（23:59 前）；18:00 出遊提示；都沒做＝隔天早上只有「我等了一天。」。這是去的那一段（校門 → 山下那一家）。
     「我帶了另一個。」只給 12/3 去過政大的玩家（KX_DEC3[1]:'visit'）。BCG-45 放在蠟燭點著、她用手圍住火的那一拍：三個選項都會到這一拍（選三，她說完「規定」還是讓你點）。
     經濟系那年送過空白筆記本的（E18B_GIFT:'notebook'）她多一句。「我們的店」第三次以上、K1 讓她點的：老闆的那一句。記 KX_BDAY_VISIT（phoneRules 換成 KX_BDAY:{1:'visit'}）*/
  { id:'ev_kexin_birthday_y1s2', title:'她的生日', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'四月底的政大，校門口那排流蘇開成白色的。風一吹，像下雪。'},
      {speaker:null,text:'她站在校門口，手上一個便利商店的小蛋糕，蓋子上插著一根還沒點的蠟燭。'},
      {speaker:'kexin',expression:'smile',text:'予樂買的。她說「蠟燭要給司機點」，然後就跑了。'},
      {speaker:'kexin',expression:'smile',text:'（把打火機遞給你）風很大。你點，我擋。'},
      {choice:[{text:'（點蠟燭，她用手圍住火）',goto:'a'},{text:'「我帶了另一個。」',if:{custom:G=>!!(G.flags.KX_DEC3&&G.flags.KX_DEC3[1]==='visit')},goto:'b'},{text:'「先上車，車裡沒風。」',goto:'c'}]},
      {label:'a'},{cg:'cg_birthday_tassel_kexin'},{speaker:null,text:'火點著了。她的手被照得很亮。'},{speaker:'kexin',expression:'smile',text:'……好。現在許願。'},{goto:'wish'},
      {label:'b'},{speaker:'kexin',expression:'laugh',text:'兩個蛋糕。假設我都吃完——不要假設，我會吃完。'},{cg:'cg_birthday_tassel_kexin'},{goto:'wish'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'不行。生日蠟燭要在外面點，這是規定。……我剛剛訂的規定。'},{cg:'cg_birthday_tassel_kexin'},
      {label:'wish'},
      {speaker:'kexin',expression:'smile',text:'生日願望有三個。第一個：明年也這樣。第二個：不能說。'},
      {speaker:'kexin',expression:'smile',text:'第三個……今天你點餐。'},
      {if:{flagIs:{E18B_GIFT:'notebook'}},speaker:'kexin',expression:'smile',text:'那本筆記本，寫到第十二頁了。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {if:{flagIs:{K1_ORDER:'let_her'},custom:G=>['ev_kexin_tour_nccu','ev_kexin_yule_pass','ev_kexin_birthday_y1'].filter(id=>G.events&&G.events.done&&G.events.done[id]).length>=2},speaker:'老闆',text:'生日喔？今天的蔥多放一點。'} ],
    consequences:{flags:{KX_BDAY_VISIT:true},memo:'可昕的生日（政大，4/24）'} },
  /* 期末成績：寒假第一天晚上和可昕視訊一起打開（BB_95 9-8）。等的玩家：她數完以後成績單接著出來；先看的玩家：照樣一起打開。沒接（錯過、今天先不要）：成績隔天早上照常出來 */
  { id:'ev_kexin_grades_open', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:'kexin',expression:'smile',text:'……都過了。好，寒假開始。'} ],
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S1) await CLS.showGrades(GM,'Y1S1'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S1) R.note.gradesDue='Y1S1'; } } },
  /* 9-9 大一下 together（AA_157 第 2 節；BB_139 2-1：照大一上兩句，只換「暑假」）：暑假第一天 21:00 視訊一起打開；沒接＝隔天早上照常發成績單 */
  { id:'ev_kexin_grades_open_y1s2', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:'kexin',expression:'smile',text:'……都過了。好，暑假開始。'} ],
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S2) await CLS.showGrades(GM,'Y1S2'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S2) R.note.gradesDue='Y1S2'; } } },
  /* 可昕的大一下（BB_96 第 9 節，BB 2026-10-14）——9-1 情人節：寒假 2/14 20:00 視訊（她先問天氣）。記 KX_VDAY:{1:'video'|'missed'}、KX_VDAY_WX:{1:'sunny'|'rain'|'window'}；
     選「我不知道。我想見妳。」記 KX_VDAY_SEE（K5 她多一句，9-3）。沒接：窗戶的照片＋「你那邊的天氣，我自己查了。情人節快樂。」，不扣分、不追問。舞台說明改旁白 */
  { id:'ev_kexin_valentine_y1', title:'情人節', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    outingMissed:(G,GM,q)=>{ G.flags.KX_VDAY=Object.assign({},G.flags.KX_VDAY||{},{1:'missed'}); if(typeof PHONE==='undefined') return; const late=G.day>q.day||G.hour>=21;
      PHONE.at(G,late?G.day:q.day,late?G.hour:21,[{th:'p:kexin',from:'kexin',text:'📷（她的窗戶）'},{th:'p:kexin',from:'kexin',text:'你那邊的天氣，我自己查了。情人節快樂。'}],'kx_vday1_photo'); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'你那邊的天氣？'},
      {choice:[{text:'「晴天。很冷。」',set:{_kxVwx:'sunny'},goto:'w1'},{text:'「下雨。」',set:{_kxVwx:'rain'},goto:'w2'},{text:'（把鏡頭轉向窗外）',set:{_kxVwx:'window'},goto:'w3'}]},
      {label:'w1'},{speaker:'kexin',expression:'smile',text:'臺北的冷是濕的，我這邊是乾的。……加起來剛好。'},{goto:'q'},
      {label:'w2'},{speaker:'kexin',expression:'laugh',text:'我這邊也是。那是同一片雨。……氣象不是這樣講的。算了。'},{goto:'q'},
      {label:'w3'},{speaker:null,text:'她也把手機轉向她的窗戶。'},{speaker:'kexin',expression:'smile',text:'交換。'},
      {label:'q'},{speaker:'kexin',expression:'teasing',text:'今天的假設題。假設情人節是一份契約，我們都沒簽，它還有效嗎？'},
      {choice:[{text:'「有效。我們用行動同意了。」',goto:'a1'},{text:'「無效。我們沒簽。」',goto:'a2'},{text:'「我不知道。我想見妳。」',set:{KX_VDAY_SEE:true},goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'laugh',text:'……寒假還在讀民總的人，回答都這樣。'},{speaker:null,text:'她笑。'},{goto:'end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'好。那開學以後，我們簽一份。'},{goto:'end'},
      {label:'a3'},{speaker:null,text:'嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'開學第一個週末。我寫進行事曆了。'},
      {label:'end'},{speaker:'kexin',expression:'smile',text:'情人節快樂。臺北冷，穿厚一點。'} ],
    after:G=>{ const F=G.flags; F.KX_VDAY=Object.assign({},F.KX_VDAY||{},{1:'video'}); if(F._kxVwx){ F.KX_VDAY_WX=Object.assign({},F.KX_VDAY_WX||{},{1:F._kxVwx}); delete F._kxVwx; } } },
  /* 9-3 K5「我們的日子」的第一次（同一週選的那一天）：照選的方式見面，短。沒到：「我等了一下。沒關係，下週同一天。」（只一次）。舞台說明改旁白 */
  { id:'ev_kexin_our_day', title:'我們的日子', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||PHONE.sent(G,'kx_our_day_miss')) return; PHONE.at(G,G.day,Math.max(G.hour,q.h+1),[{th:'p:kexin',from:'kexin',text:'我等了一下。沒關係，下週同一天。'}],'kx_our_day_miss'); },
    dialogue:[ {if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='nccu'},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='ntu'},scene:'台大・社科院門口',bg:'ntu_soc'},
      {if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='mid'},scene:'公館',bg:'gongguan'},{if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='video'},scene:'視訊',bg:'video'},
      {speaker:null,text:'她把手機給你看。'},{speaker:'kexin',expression:'smile',text:'我們的行事曆，那一格我寫了字。'},{speaker:'kexin',expression:'smile',text:'不是「約會」。是「我們」。'} ] },
  /* K5 之後每週的「我們的日子」（AA-B 2026-10-16 裁定）：一句地點字幕，接著 OUT.go 推進她的閒聊階梯（沒有新台詞）。
     第 5 週起第一次（K7 有準備東西的玩家）：字幕之後先說「你送的那個，我放在書桌上。」（只一次）。撞到別的出遊、選了別的＝「好，這週換一天。」；單純略過沒有台詞 */
  { id:'ev_kexin_our_day_wk', title:'我們的日子', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:2,
    beforeOuting:(G,GM,q)=>{ G.flags._kxODP=q&&q.odPlace||'video'; },
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||typeof OUT==='undefined') return; const other=OUT.rec(G).some(o=>o!==q&&o.state==='done'&&o.day===q.day&&!/^kx_od_/.test(o.id));
      if(other) PHONE.at(G,G.day,Math.max(G.hour,q.h),[{th:'p:kexin',from:'kexin',text:'好，這週換一天。'}],'kx_od_swap_'+q.day); },
    dialogue:[ {if:{flagIs:{_kxODP:'nccu'}},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{flagIs:{_kxODP:'ntu'}},scene:'台大・社科院門口',bg:'ntu_soc'},{if:{flagIs:{_kxODP:'gongguan'}},scene:'公館',bg:'gongguan'},
      {if:{flagIs:{_kxODP:'wenzhou'}},scene:'溫州街',bg:'wenzhou'},{if:{flagIs:{_kxODP:'river'}},scene:'河濱',bg:'riverside'},{if:{flagIs:{_kxODP:'video'}},scene:'視訊',bg:'video'},
      {if:{custom:G=>!!G.flags.K7_GIFT&&G.flags.K7_GIFT!=='none'&&!G.flags.KX_GIFT_DESK&&!!(G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]&&G.flags.KX_ANNIV[1]!=='missed')},speaker:'kexin',expression:'smile',text:'你送的那個，我放在書桌上。'},
      {if:{custom:G=>!!G.flags.K7_GIFT&&G.flags.K7_GIFT!=='none'&&!!(G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]&&G.flags.KX_ANNIV[1]!=='missed')},set:{KX_GIFT_DESK:true}} ] },
  /* K7 準備的東西（AA-B 2026-10-16 裁定）：3/21（六）21:00 系統提示一次、四選一、記 K7_GIFT；那時在睡覺或跳過的，3/22 起床時再問；3/22 18:00 前都沒選＝什麼都沒準備（她照「你人來了。……這題我放水一次。」，不扣分） */
  { id:'ev_k7_gift_prep', title:'週年的準備', participants:[], location:'any', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ if(!G.flags.dating_kexin||!G.flags.KX_ANNIV_PLACE||G.flags.K7_GIFT!=null||typeof STORY==='undefined'||!STORY.dayOfKey) return false; const a1=STORY.dayOfKey('2026-03-22'); return a1!=null&&((G.day===a1-1&&G.hour>=21)||(G.day===a1&&G.hour<18)); }},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-03-22')-1},speaker:null,text:'明天是週年。你準備的東西：'},{if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-03-22')},speaker:null,text:'今天是週年。你準備的東西：'},
      {choice:[{text:'摩天輪票根的影本，背面寫一題假設題',set:{K7_GIFT:'ticket'}},{text:'一本空白的行事曆，第一頁寫「我們的日子」',set:{K7_GIFT:'planner'}},{text:'山下那家的酸辣湯餃（外帶）',set:{K7_GIFT:'dumpling'}},{text:'什麼都沒準備',set:{K7_GIFT:'none'}}]} ] },
  /* 9-4 K7 交往週年（2026-03-22）：出門前選準備的東西（K7_GIFT，AA-B 確認中的提案：出發前選）→ 她收到的反應 → 她的卡片第一頁的假設題 → 旁白。記 KX_ANNIV {1:place}。不做 CG。
     沒去（婉拒、沒到）：卡片的照片「週年快樂。下次你準備。」、KX_ANNIV {1:'missed'}。卡片之後變成宿舍的房間物件「她的週年卡片」（AA-B 2026-10-16：說明用卡片第一頁那句，story3d.js roomItemList）*/
  { id:'ev_kexin_anniversary_y1', title:'週年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G)=>{ if(G.flags.K7_GIFT==null) G.flags.K7_GIFT='none'; },   /* AA-B 2026-10-16：準備的東西在前一晚 21:00 選（ev_k7_gift_prep）；18:00 前都沒選＝什麼都沒準備 */
    outingMissed:(G,GM,q)=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:'missed'}); if(typeof PHONE==='undefined'||PHONE.sent(G,'kx_anniv_photo')) return; PHONE.at(G,G.day,Math.max(G.hour,19),[{th:'p:kexin',from:'kexin',text:'📷（一張卡片）'},{th:'p:kexin',from:'kexin',text:'週年快樂。下次你準備。'}],'kx_anniv_photo'); },
    dialogue:[ {if:{flagIs:{KX_ANNIV_PLACE:'wheel'}},scene:'摩天輪',bg:'ferris_wheel'},{if:{flagIs:{KX_ANNIV_PLACE:'shop'}},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{flagIs:{KX_ANNIV_PLACE:'river'}},scene:'河堤',bg:'riverside'},
      {if:{flagIs:{K7_GIFT:'ticket'}},goto:'g1'},{if:{flagIs:{K7_GIFT:'planner'}},goto:'g2'},{if:{flagIs:{K7_GIFT:'dumpling'}},goto:'g3'},{goto:'g4'},
      {label:'g1'},{speaker:null,text:'她念背面那題，笑出來。'},{speaker:'kexin',expression:'laugh',text:'你學我。'},{goto:'card'},
      {label:'g2'},{speaker:'kexin',expression:'smile',text:'……這本我要用完。'},{goto:'card'},
      {label:'g3'},{speaker:'kexin',expression:'surprised',text:'這是禮物？'},{speaker:'player',text:'是。'},{speaker:'kexin',expression:'laugh',text:'……這是我收過最燙的禮物。'},{goto:'card'},
      {label:'g4'},{speaker:'kexin',expression:'smile',text:'你人來了。……這題我放水一次。'},
      {label:'card'},{speaker:'kexin',expression:'teasing',text:'（把卡片翻到第一頁）假設我們從最高點開始交往。'},{speaker:'kexin',expression:'teasing',text:'那今天，是第幾圈？'},
      {choice:[{text:'「第一圈。」',goto:'c1'},{text:'「第三百六十五圈。」',goto:'c2'},{text:'「不用算。」',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'那我們還在最高點。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'surprised',text:'……你算過？'},{speaker:'player',text:'猜的。'},{speaker:'kexin',expression:'laugh',text:'猜得很準。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'smile',text:'好。那就一直轉。'},
      {label:'end'},{speaker:null,text:'後面幾頁，她說：『回去再看。』'} ],
    after:G=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:G.flags.KX_ANNIV_PLACE||'shop'}); } },
  /* 9-6 K6 週日的兩校互考（政大山下或視訊）：三題對三題，題目內容不顯示（不寫法律結論）；玩家選出哪一種題目。記 KX_QUIZ {win,lose,draw}（四年累計，BB_107 K10、K25 讀它）。舞台說明改旁白 */
  { id:'ev_kexin_reschedule', title:'兩校互考', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||PHONE.sent(G,'kx_quiz_miss')) return; PHONE.at(G,G.day,Math.max(G.hour,q.h+1),[{th:'p:kexin',from:'kexin',text:'📷（考古題）'},{th:'p:kexin',from:'kexin',text:'下次你逃不掉。'}],'kx_quiz_miss'); },
    dialogue:[ {if:{flagIs:{KX_QUIZ_MODE:'video'}},scene:'視訊',bg:'video'},{unless:{flagIs:{KX_QUIZ_MODE:'video'}},scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:null,text:'三題對三題。你出哪一種？'},
      {choice:[{text:'簡單的（上課講過的定義）',set:{_kxQ:'draw'},goto:'e'},{text:'中等的（課本後面的例題）',set:{_kxQ:'win'},goto:'m'},{text:'冷門的（某一說的少數見解）',set:{_kxQ:'lose'},goto:'h'}]},
      {label:'e'},{speaker:'kexin',expression:'smile',text:'平手。各付各的。'},{goto:'end'},
      {label:'m'},{speaker:null,text:'她想了很久，答對一半。'},{speaker:'kexin',expression:'laugh',text:'……好，你贏。我請。'},{goto:'end'},
      {label:'h'},{speaker:'kexin',expression:'teasing',text:'犯規。冷門學說是犯規。'},{speaker:null,text:'她判你輸。'},{speaker:'kexin',expression:'teasing',text:'你請。'},
      {label:'end'} ],
    after:G=>{ const F=G.flags, k=F._kxQ; delete F._kxQ; F.KX_K6_EXAM=true; if(!k) return; const Q=F.KX_QUIZ=Object.assign({win:0,lose:0,draw:0},F.KX_QUIZ||{}); Q[k]=(Q[k]|0)+1; } },   /* KX_K6_EXAM：做過 K6 互考（重訪日 1 她那一句讀它，BB_96 9-10）*/
  { id:'ev_dorm_late_kai', title:'半夜', participants:['kai'], location:'dorm', trigger:'enter', time:[23,26], day_min:3, cooldown_days:2, random_weight:0.7, background:'blur',
    dialogue:[ {speaker:'kai',expression:'neutral',text:'（頭沒回）欸，你回來了。我這個 bug 追到第三小時。'},{choice:[{text:'「去睡啦。」',consequences:{rel:{kai:{fam:1,comf:1}}}},{text:'「什麼 bug？」',consequences:{rel:{kai:{fam:2,trust:1}}},goto:'bug'},{text:'（戴上耳機）',consequences:{}}]},{goto:'end'},{label:'bug'},{speaker:'kai',expression:'tired',text:'一個值應該是 0 結果是 undefined。……你們法律系有這種東西嗎？'},{speaker:'player',text:'有。叫「法無明文」。'},{speaker:'kai',expression:'laugh',text:'幹，好爛。'},{label:'end'} ] },
  { id:'ev_library_closing', title:'閉館', participants:[], location:'library', trigger:'auto', time:[21.6,22.2], cooldown_days:1, background:'freeze',
    dialogue:[ {speaker:null,text:'「本館將於十分鐘後閉館——」廣播響起，整個閱覽室同時發出收東西的聲音。'} ], consequences:{goal:'總圖要閉館了'} },
  { id:'ev_pool_greet', title:'好像認識的人', participants:[], location:['campus','library'], trigger:'auto', time:[8,22], day_min:3, cooldown_days:1, random_weight:1.2, prereq:{custom:(G,GM)=>{ return Object.keys(GM.npc).some(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]); }}, background:'freeze',
    dialogue:[ {speaker:null,text:'迎面走來一個人，你確定在教室看過。對方也放慢了一步。'},{choice:[{text:'點頭',consequences:{flags:{pool_greeted:true}}},{text:'假裝看手機',consequences:{}}]},{speaker:null,text:'（有些人就是這樣，從「好像認識」開始的。）'} ], after:(G,GM)=>{ for(const id in GM.npc){ if(id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]){ G.flags['greet_'+id]=true; if(G.flags.pool_greeted){ SOCIAL.adjust(id,{fam:3}); } break; } } } },
  { id:'ev_an_report_followup', title:'報告的結論', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['afternoonDone'],events:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]}, day_min:3, background:'blur',   /* 交接包 v1 A12 之後（LAWWW 2026-10-14，等 AA 確認）：報告分工問過、你說「我已經有組了」——她寫完在總圖給你看。一起寫的、沒有分工那一段的玩家沒有這一場 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）報告我寫完了。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'（小聲）結論用了那天你說的「無過失」。周老師如果打槍我，我就說是你的主意。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'（小聲）我把你說的「後果自己承擔」寫進反方。寫的時候一直想到你那天的表情。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'（小聲）「不能讓人因為一個手誤賠十倍」——我放在結論。'},{unless:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'neutral',text:'（小聲）……謝謝你那天陪我。'},{choice:[{text:'「妳寫得出來，我只是坐在旁邊。」',consequences:{rel:{heroine_01:{comf:4,aff:2}},mem:[{npc:'heroine_01',tag:'HELPED_WITH_REPORT'}]}},{text:'「下次換我請。」',consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說下次換你請'}]}}]},{speaker:'heroine_01',expression:'smile',text:'（小聲）好。'} ] },
  /* ---------- 經濟系那一年（stage:'econ'）----------
     ★E02 開學典禮與迎新（BB_104 第 8-1 節，BB 2026-10-14 審查通過「可以交」；AA_154 第 95 行）：2024-09-02（一）W1，開學典禮後自動演
     （固定核心：那一天把玩家帶到場）。社科院的大講堂 soc_hall → 系上的教室 soc_classroom（2D 背景，AA_173 第 1 節：社科院不做 3D 室內）；
     用一個經濟學名詞介紹自己，記 E02_WORD（'externality'／'equilibrium'／'invisible_hand'；BB_106 SK08、SK14 讀）。家豪學長、韋綸、唐睿還沒有人物資料，先用名字說話。
     時段（AA-B 定案 A，268d529d）：9/2 週一上午是經濟學原理（照上、不停課），下課以後 12:15～17:00 自動，演完時間到 15:00、人在社科院門口 */
  { id:'ev_y0_e02', stage:'econ', title:'開學典禮與迎新', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[1], weekday:[1], time:[12.25,17], once:true, priority:9, background:'dark',
    dialogue:[ {scene:'社科院・大講堂｜開學典禮',bg:'soc_hall'},{speaker:null,text:'開學典禮在社科院的大講堂。前面坐的人，都穿得比平常整齊一點。'},{speaker:null,text:'典禮結束。門口有個學長舉著牌子：『經濟系新生，這邊。』'},{scene:'社科院・系上的教室｜迎新',bg:'soc_classroom'},   /* 兩句旁白：AA-B 定案（268d529d，AA_154）*/
      {speaker:'家豪學長',text:'規則很簡單。用一個經濟學名詞介紹自己。不會的就亂講。'},{speaker:'韋綸',text:'我是……「供給」！我很多！什麼都很多！'},
      {speaker:'econ_pinyu',expression:'neutral',text:'我是「機會成本」。跟我說話，你就失去了做別的事的機會。'},{speaker:'唐睿',text:'我是「沉沒成本」。我已經講了三分鐘，所以我不能停。'},{speaker:'家豪學長',text:'唐睿，你才講了五秒。'},
      {speaker:'kexin',expression:'neutral',text:'我是「邊際效用遞減」。'},{speaker:'kexin',expression:'neutral',text:'第一次見面最好玩，之後越來越普通。'},{speaker:'kexin',expression:'smile',text:'……開玩笑的。我會越來越好玩。'},
      {choice:[{text:'「我是『外部性』。我會影響到你們，但不用付錢。」',set:{E02_WORD:'externality'},goto:'ext'},{text:'「我是『均衡』。……我不知道為什麼。」',set:{E02_WORD:'equilibrium'},goto:'eq'},{text:'「我是『看不見的手』。」',set:{E02_WORD:'invisible_hand'},goto:'hand'}]},
      {label:'ext'},{speaker:'kexin',expression:'teasing',text:'那我們要跟你收費。'},{goto:'end'},
      {label:'eq'},{speaker:'kexin',expression:'teasing',text:'均衡？你看起來很不穩定。'},{goto:'end'},
      {label:'hand'},{speaker:'kexin',expression:'teasing',text:'所以你等一下拿零食，我們都看不到？'},
      {label:'end'} ],
    consequences:{meet:['econ_pinyu']},
    after:(G,GM)=>{ if(G.hour%24<15) GM.advance(15-G.hour%24); if(G.zone!=='campus'&&GM.enter) GM.enter('campus',{x:97.0,z:-66.5,yaw:-Math.PI/2}); } },
  /* P2 下課後的一群人（BB_105 第 137 行；AA_154 第 101 行）：Y0S1 第 3～5 週週四，初等會計學下課（普通教學館門口的腳踏車停放區）；第一次（之後的 P2b 另做）。
     選公館＝接 ★E05（同一天）；選別的、今天先回去、沒去＝E05 在 9/20（五）傍晚照自己的觸發（ev_y0_e05 的 auto 條件）。韋綸、唐睿還沒有人物資料，先用名字說話 */
  { id:'ev_y0_p2', stage:'econ', title:'下課後的一群人', participants:['kexin'], location:'any', trigger:'class', afterClass:'acct_y0', term:['Y0S1'], weeks:[3,4,5], background:'blur',
    prereq:{custom:G=>!G.flags.P2_PICK||G.flags.P2_PICK==='home'},   /* 去成一次就不再演；「今天先回去」的玩家下一次會計課下課再演一次（BB_105 P2「那下次！」＝P2b 補上第一次聚會），到第 5 週為止 */
    dialogue:[ {speaker:'韋綸',text:'走啦！'},{speaker:'econ_pinyu',expression:'neutral',text:'去哪？先說好，我只有一百五。'},{speaker:'唐睿',text:'我有兩百，但要留五十給明天。'},{speaker:'kexin',expression:'neutral',text:'（牽著腳踏車）你決定。'},
      {choice:[{text:'公館吃飯',set:{P2_PICK:'gongguan'},goto:'end'},{text:'河濱騎腳踏車',set:{P2_PICK:'river'},goto:'river'},{text:'總圖念書',set:{P2_PICK:'library'},goto:'lib'},{text:'「今天先回去。」',set:{P2_PICK:'home'},goto:'home'}]},
      {label:'river'},{speaker:null,text:'韋綸的鏈子掉了兩次。'},{speaker:'kexin',expression:'smile',text:'你的車，跟我的一起去修。'},{goto:'end'},
      {label:'lib'},{speaker:null,text:'唐睿講了四十分鐘的話。'},{speaker:'econ_pinyu',expression:'neutral',text:'今天的產出是零。'},{goto:'end'},
      {label:'home'},{speaker:'韋綸',text:'那下次！'},
      {label:'end'} ],
    consequences:{meet:['econ_pinyu']},
    after:(G,GM)=>{ const p=G.flags.P2_PICK; if(p==='gongguan'){ const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e05'); if(e&&typeof EVENTS!=='undefined'&&!(G.events&&G.events.done&&G.events.done.ev_y0_e05)) setTimeout(()=>{ void EVENTS.run(e); },0); } else if(p==='river'||p==='library') GM.advance(1.5); } },
  /* ★E05「要我載妳嗎？」（BB_104 第 8-2 節；AA_154 第 102 行）：P2 選公館接著演；三種開口記 E05_OPEN（'carry'／'fix'／'steady'），E06 讀它。
     演完記 E05_DAY、E05_END（E06／D2 用）。公館那一頓（P2 原文）在後面 */
  { id:'ev_y0_e05', stage:'econ', title:'要我載妳嗎？', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[3], weekday:[5], time:[17,19.5], once:true, background:'blur',   /* P2 選公館＝P2 演完直接接（9/19）；其他＝9/20（五）17:00～19:30 自動（固定核心）*/
    dialogue:[ {speaker:null,text:'（可昕的腳踏車鏈子掉了，她蹲在路邊研究。）'},
      {choice:[{text:'「要我載妳嗎？」',set:{E05_OPEN:'carry'},goto:'carry'},{text:'「要不要我幫妳修？」',set:{E05_OPEN:'fix'},goto:'fix'},{text:'「我車很穩。」',set:{E05_OPEN:'steady'},goto:'steady'}]},
      {label:'carry'},{speaker:'kexin',expression:'teasing',text:'你確定？載我的成本很高喔。'},{speaker:'kexin',expression:'teasing',text:'我會一路問你問題。'},{speaker:'kexin',expression:'smile',text:'……而且雙載違規。我自己牽。你陪我走。'},{goto:'end'},
      {label:'fix'},{speaker:'kexin',expression:'surprised',text:'你會修？'},{speaker:'player',text:'不會。'},{speaker:'kexin',expression:'smile',text:'那你是來陪我的。'},{goto:'end'},
      {label:'steady'},{speaker:'kexin',expression:'teasing',text:'穩不穩，要看坐後面的人。'},
      {label:'end'},{if:{flagIs:{P2_PICK:'gongguan'}},speaker:null,text:'品妤挑了一家一百二十元吃到飽的。阿勳吃了四碗白飯。'} ],
    after:(G,GM)=>{ GM.advance(1.5); G.flags.E05_DAY=G.day; G.flags.E05_END=G.hour%24; } },
  /* ★E08 中秋系烤（BB_153，AA-B 核對通過、數值照 BB 建議定案；AA_154 第 88 行、A3：中秋後的週六 9/21 17:00 河濱）：9/16 全班群組揪、9/21 16:00 韋綸私訊，回「好」＝出遊（story3d.js）。
     誰生火、月亮收租的回答都不記（BB_104）。數值：可昕熟悉 +2；品妤、阿勳 +1（韋綸、唐睿還沒有人物資料——AA_159 建好時補 +1）。
     participants 不放可昕：演完不接她的閒聊階梯（結尾是回宿舍的路上）*/
  { id:'ev_y0_e08', stage:'econ', title:'中秋系烤', participants:['econ_zhengxun','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'星期六傍晚。河濱的草地上，經濟系的人圍成好幾圈。'},
      {speaker:null,text:'烤肉架是系學會借來的。炭還是黑的。'},
      {speaker:'韋綸',text:'走啦！誰要生火？'},
      {speaker:'econ_pinyu',text:'生火的人先吃。這叫誘因設計。'},
      {speaker:'唐睿',text:'我負責分肉。誰不吃什麼，我都記得。'},
      {choice:[{text:'「阿勳來。」',goto:'f1'},{text:'「韋綸來。」',goto:'f2'},{text:'「我來。」',goto:'f3'}]},
      {label:'f1'},{speaker:null,text:'阿勳擺了三塊炭，劃了一根火柴。火一次就起來了。'},{speaker:'econ_zhengxun',text:'熱力學。'},{speaker:'韋綸',text:'……我帶了一整包報紙耶。'},{goto:'meat'},
      {label:'f2'},{speaker:null,text:'火起來的那一秒，韋綸的瀏海也捲起來了。'},{speaker:'韋綸',text:'沒事！走啦！……有沒有人聞到頭髮的味道？'},{speaker:'econ_pinyu',text:'有。是你的。'},{goto:'meat'},
      {label:'f3'},{speaker:'kexin',text:'假設我們把報紙捲成一根一根的——'},{speaker:'kexin',text:'……假設我們再搧大力一點——'},{speaker:null,text:'她每出一個主意，火就小一點。'},{speaker:null,text:'最後是阿勳接手的。他只說了一句。'},{speaker:'econ_zhengxun',text:'熱力學。'},
      {label:'meat'},{speaker:null,text:'肉烤好了，玉米烤焦了一面。'},{speaker:'econ_pinyu',text:'焦的那一面朝下放。拍照不會拍到。'},{speaker:null,text:'唐睿把每個人的盤子都放對了。沒有人拿到不吃的東西。'},
      {speaker:null,text:'八點多，月亮才從對岸的大樓後面出來。比中秋那天瘦一點。'},{speaker:null,text:'可昕拿著一串烤玉米，坐到你旁邊。'},
      {speaker:'kexin',text:'如果月亮收租，我們要付多少？'},
      {choice:[{text:'「照坪數算？」',goto:'m1'},{text:'「照了一整晚，應該很貴。」',goto:'m2'},{text:'「中秋過了，應該打折。」',goto:'m3'}]},
      {label:'m1'},{speaker:'kexin',text:'那地球很虧。我們整顆都被照到了。'},{goto:'end'},
      {label:'m2'},{speaker:'kexin',text:'那今天只付一半。她遲到了。'},{goto:'end'},
      {label:'m3'},{speaker:'kexin',text:'……你很適合念經濟。'},
      {label:'end'},{speaker:null,text:'九點，大家把烤肉架抬回系學會的車上。'},{speaker:null,text:'回宿舍的路上，你的衣服都是炭的味道。'},
      {rel:{kexin:{fam:2},econ_pinyu:{fam:1},econ_zhengxun:{fam:1}}} ] },
  /* E07 社團博覽會（BB_104 8b-2；AA_154 第 100 行）：9/18（三）～9/20（五）10:00～17:00，窗口內第一次走到椰林大道的攤位那一排（帳篷照法律系那一次的位置，zones3d.js isFairDay）。
     劇社的即興（三個地點）→ 祐廷選社團（Y0_CLUB：guitar／hiking／badminton／none；BB_110 C2 讀它）→ 可昕的一句。沒去：可昕私訊（story3d.js）*/
  { id:'ev_y0_e07', stage:'econ', title:'社團博覽會', participants:['kexin'], location:'campus', near:{x:-3,z:14,r:20}, trigger:'auto', term:['Y0S1'], weeks:[3], weekday:[3,4,5], time:[10,17], once:true, background:'blur',
    dialogue:[ {speaker:'韋綸',text:'（手上已經有六張傳單）走啦！全部都去看看！'},
      {speaker:'econ_pinyu',text:'一週三小時，一學期四十八小時。社團很貴。'},
      {speaker:'kexin',expression:'smile',text:'（從即興劇社的攤位探頭）你們過來，他們要演一段。'},
      {speaker:'劇社社員',text:'請給我們一個地點！'},
      {speaker:'kexin',expression:'neutral',text:'（看你）你說。'},
      {choice:[{text:'「總圖。」',goto:'a1'},{text:'「醉月湖。」',goto:'a2'},{text:'「經濟系的教室。」',goto:'a3'}]},
      {label:'a1'},{speaker:null,text:'兩個社員在總圖「小聲吵架」，演了三分鐘。可昕笑到蹲下。'},{goto:'club'},
      {label:'a2'},{speaker:null,text:'一個社員演一隻鵝，追著另一個人跑。'},{goto:'club'},
      {label:'a3'},{speaker:'劇社社員',text:'好，我們是兩條供給曲線。'},{speaker:null,text:'全場安靜。'},
      {label:'club'},{speaker:'kexin',expression:'smile',text:'我要加這個社。你呢？'},
      {choice:[{text:'吉他社',set:{Y0_CLUB:'guitar'},goto:'c1'},{text:'登山社',set:{Y0_CLUB:'hiking'},goto:'c2'},{text:'羽球社',set:{Y0_CLUB:'badminton'},goto:'c3'},{text:'不參加',set:{Y0_CLUB:'none'},goto:'c4'}]},
      {label:'c1'},{speaker:'kexin',text:'好。那你以後要彈一首給劇社配樂。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',text:'你要去爬山？……記得帶伴手禮回來。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',text:'羽球社的人都很早起。你可以嗎？'},{goto:'end'},
      {label:'c4'},{speaker:'kexin',text:'也好。那你週五晚上都有空了。……我是說大家。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(0.5); } },
  /* E09 小福的午餐：品妤的經濟效益（BB_104 8b-3；AA_154 第 102 行）：Y0S1 第 4 週平日中午（9/23～9/26；9/27 教師節連假），在校園裡就切到小福。可以錯過（沒去就沒有）；記憶：無 */
  { id:'ev_y0_e09', stage:'econ', title:'小福的午餐', participants:['econ_pinyu','kexin','econ_zhengxun'], location:'campus', trigger:'auto', term:['Y0S1'], weeks:[4], weekday:[1,2,3,4], time:[12.1,13.25], once:true, background:'blur',
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:'econ_pinyu',text:'（看你的餐盤）雞腿便當加紅茶，九十五元。'},
      {speaker:'econ_pinyu',text:'隔壁的滷肉飯只要五十五。你剛剛放棄了什麼？'},
      {speaker:'econ_zhengxun',text:'……四十元。'},
      {speaker:'kexin',expression:'smile',text:'還有放棄了跟我們吃一樣的東西。'},
      {choice:[{text:'「雞腿的效用比較高。」',goto:'b1'},{text:'「下次換滷肉飯。」',goto:'b2'},{text:'「妳吃什麼？」',goto:'b3'}]},
      {label:'b1'},{speaker:'econ_pinyu',text:'好，理性選擇。這個系你待得下去。'},{goto:'end'},
      {label:'b2'},{speaker:'econ_pinyu',text:'不用為了我改。我只是說說。'},{speaker:'kexin',text:'她會一直說。'},{goto:'end'},
      {label:'b3'},{speaker:'econ_pinyu',text:'自己帶便當，零元。'},{speaker:'kexin',text:'她媽媽做的，不算零元。'},{speaker:'econ_pinyu',text:'……邊際成本是零。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(0.75); GM.money&&GM.money(-95); } },
  /* T0a 泡麵之夜（BB_110 第 2 節；AA_154 第 93 行、A2）：經濟系大一上第 5 週颱風假（2024-09-30 週一，calendar.js 的 TYPHOON），白天到晚上在宿舍房間、阿勳在。
     韋綸全身濕推門進來；三個選項，肉燥那個記 Y0_SAUCE（第 8 週 XL-1 阿勳問「那罐肉燥還有嗎？」）。跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_y0_t0a', stage:'econ', title:'泡麵之夜', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[5], weekday:[1], time:[10,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'econ_zhengxun',text:'我們有六包泡麵、三個人、一個颱風。'},
      {speaker:'econ_zhengxun',text:'第三包會比第一包難吃。這叫邊際效用遞減。'},
      {speaker:'韋綸',text:'（推門進來，全身濕）走啦！去看風！'},
      {speaker:null,text:'阿勳、祐廷：不要。'},
      {speaker:'韋綸',text:'……那有泡麵嗎？'},
      {speaker:'econ_zhengxun',text:'現在是六包、四個人。我要重算。'},
      {choice:[{text:'把自己那包給韋綸',goto:'give'},{text:'提議猜拳',goto:'rps'},{text:'拿出週末從家裡帶來的一罐肉燥',set:{Y0_SAUCE:true},goto:'sauce'}]},
      {label:'give'},{speaker:'econ_zhengxun',text:'你的效用函數有問題。'},{speaker:'韋綸',text:'他的效用函數很好！'},{goto:'end'},
      {label:'rps'},{speaker:null,text:'阿勳輸了三次，第四次說：「這不是機率，是颱風。」'},{goto:'end'},
      {label:'sauce'},{speaker:'econ_zhengxun',text:'……這改變了整個模型。'},
      {label:'end'} ],
    consequences:{memo:'颱風假：宿舍的泡麵之夜（經濟系那一年）'} },
  /* XL-1 阿勳一句（AA_154 第 107 行、A28；BB_110 T0a 的記憶）：泡麵之夜拿出肉燥的玩家（Y0_SAUCE），第 8 週第一次在宿舍遇到阿勳（他晚上在房間）*/
  { id:'ev_y0_xl1', stage:'econ', title:'那罐肉燥', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[8], time:[18,24], once:true, background:'blur',
    prereq:{custom:G=>!!(G.flags&&G.flags.Y0_SAUCE)},
    dialogue:[ {speaker:'econ_zhengxun',text:'那罐肉燥還有嗎？我期中需要它。'} ] },
  /* P1b 會計作業：平衡不了的那一行（BB_105 P1b；AA_154 第 96、105 行）：會計課下課後的走廊，兩種輪流——第 1 次（10/3，第 5 週；和誰對答案）、第 2 次（10/17，第 7 週，有韋綸）。
     同一堂課下課 P2 還要演（「今天先回去」的玩家）的話 P2 先（afterClass 一堂只演一件）；第 1 次沒趕上第 5 週就在第 7 週，那樣第 2 次就沒有 */
  { id:'ev_y0_p1b1', stage:'econ', title:'平衡不了的那一行', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'class', afterClass:'acct_y0', term:['Y0S1'], weeks:[5,6,7], once:true, background:'blur',
    dialogue:[ {speaker:'econ_pinyu',text:'（翻作業）借貸不平衡。差一百元。'},
      {speaker:'econ_zhengxun',text:'……你把折舊記成收入了。'},
      {choice:[{text:'和阿勳對',goto:'x'},{text:'和品妤對',goto:'p'},{text:'自己再算一次',goto:'s'}]},
      {label:'x'},{speaker:null,text:'阿勳只指了第五行。你就懂了。'},{goto:'end'},
      {label:'p'},{speaker:'econ_pinyu',text:'差一百元，就是差三杯紅茶。去找。'},{goto:'end'},
      {label:'s'},{speaker:null,text:'（算到第三次，平了。）'},{speaker:'econ_pinyu',text:'恭喜，你花了二十分鐘。'},
      {label:'end'} ],
    consequences:{stamp:['P1B1_DAY']} },
  { id:'ev_y0_p1b2', stage:'econ', title:'平衡不了的那一行（二）', participants:['econ_zhengxun'], location:'any', trigger:'class', afterClass:'acct_y0', term:['Y0S1'], weeks:[7], once:true, background:'blur',
    prereq:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_p1b1)&&G.flags.P1B1_DAY!==G.day},
    dialogue:[ {speaker:'韋綸',text:'我的平衡了！'},{speaker:'econ_zhengxun',text:'（看了一眼）……你兩邊都寫零。'} ] },
  /* T1 全系的秘密（BB_112 T1；AA_154 第 111 行）：Y0S1 第 5～6 週平日中午在校園，切到小福（E09 之後的那幾週；9/30 颱風假、10/10 國慶沒有）。記 KNOWS_TANG（法律系 BB_106 4-2① 的選項讀它）。
     沒去：沒有這件，第一次聽說在 T2（唐睿自己說漏嘴，還沒做）*/
  { id:'ev_y0_t1', stage:'econ', title:'全系的秘密', participants:['econ_pinyu'], location:'campus', trigger:'auto', term:['Y0S1'], weeks:[5,6], weekday:[1,2,3,4,5], time:[12.1,13.25], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR==='undefined'||!CALENDAR.holiday(G.day)},
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:'韋綸',text:'（壓低聲音）你知道唐睿喜歡品妤嗎？'},
      {speaker:'player',text:'……不知道。'},
      {speaker:'韋綸',text:'全系都知道。只有品妤不知道。'},
      {speaker:'韋綸',text:'所以現在你也是全系了。'},
      {speaker:'econ_pinyu',text:'（端著餐盤走過來）你們在講什麼？'},
      {speaker:'韋綸',text:'在講……經濟學。'},
      {speaker:'econ_pinyu',text:'你們兩個的對話，經濟效益是零。'},
      {set:{KNOWS_TANG:true}} ],
    after:(G,GM)=>{ GM.advance(0.5); } },
  /* A1 凌晨兩點的微積分（BB_112 A1；AA_154 第 119 行）：Y0S1 第 7 週平日的深夜（10/15 群組聚會、10/16 E10 那兩晚除外），在宿舍房間、阿勳在。
     「我覺得很好。數字有溫度。」記 XUN_WARM（法律系大三 SK13 多一句）。沒去：期中考完（11/1 以後）門上的紙條（ev_y0_a1_note）*/
  { id:'ev_y0_a1', stage:'econ', title:'凌晨兩點的微積分', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[1,4,5], time:[24,27], once:true, background:'blur',
    dialogue:[ {speaker:'econ_zhengxun',text:'你那題，答案是零。'},
      {speaker:'player',text:'你怎麼知道我在寫哪一題？'},
      {speaker:'econ_zhengxun',text:'你嘆氣的方式，是第四題的嘆氣。'},
      {speaker:'econ_zhengxun',text:'（把椅子轉過來）我教你。十分鐘。'},
      {speaker:null,text:'（四十分鐘後。）'},
      {speaker:'econ_zhengxun',text:'經濟是我唯一覺得數字有溫度的東西。'},
      {speaker:'econ_zhengxun',text:'……這句話不要寫進你的筆記。很丟臉。'},
      {choice:[{text:'「我覺得很好。數字有溫度。」',set:{XUN_WARM:true},goto:'w'},{text:'「你以後會一直念經濟嗎？」',goto:'q'},{text:'「十分鐘是四十分鐘。」',goto:'t'}]},
      {label:'w'},{speaker:'econ_zhengxun',text:'……你也是怪人。'},{goto:'end'},
      {label:'q'},{speaker:'econ_zhengxun',text:'會。我想不到別的。……不對，是不想想別的。'},{goto:'end'},
      {label:'t'},{speaker:'econ_zhengxun',text:'經濟系的十分鐘。邊際的。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(2/3); } },
  { id:'ev_y0_a1_note', stage:'econ', title:'門上的紙條', participants:[], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[9,10,11], once:true, background:'blur',
    prereq:{custom:G=>!(G.events&&G.events.done&&G.events.done.ev_y0_a1)&&typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(G.day).key>='2024-11-01'&&(CALENDAR.dateOf(G.day).key>'2024-11-01'||G.hour>=12)},
    dialogue:[ {speaker:null,text:'期中考完，阿勳在門上貼了一張紙：「第四題，答案是零。」'} ] },
  /* B2 小桌子的午後（BB_105 B2、4-4；AA_154 第 112 行）：Y0S1 第 6～7 週週一（10/7、10/14；第 5 週颱風停課）經原下課後，在博雅的自習區（101 旁小桌）坐下，可昕自己走過來。
     讀書或聊天都可以；她一點二十有課。和總圖那次（E10，她約的）是兩件不同的事。熟悉度上升沒有給數字（等 AA-B）：先不加 */
  { id:'ev_y0_b2', stage:'econ', title:'小桌子的午後', participants:['kexin'], location:'boya', trigger:'seat', seatRoom:'study', term:['Y0S1'], weeks:[6,7], weekday:[1], time:[12.1,13.25], once:true, background:'blur',
    dialogue:[ {speaker:'kexin',expression:'neutral',text:'這裡有人嗎？'},
      {speaker:'kexin',expression:'smile',text:'……沒有人的話，我坐了。我一點二十才有課，還有一個小時。'},
      {speaker:'kexin',expression:'neutral',text:'你在讀經原？'},
      {speaker:'kexin',expression:'teasing',text:'假設，供給曲線會害羞。它會往哪裡移？'},
      {choice:[{text:'讀書',goto:'r'},{text:'聊天',goto:'c'}]},
      {label:'r'},{speaker:null,text:'她安靜地讀了十分鐘，然後把一張紙條推過來：「我讀不下去了。你呢？」'},{set:{B2_PICK:'read'}},{goto:'end'},
      {label:'c'},{speaker:null,text:'四十分鐘過去，誰都沒有翻頁。'},{set:{B2_PICK:'chat'}},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(G.flags.B2_PICK==='chat'?2/3:1/6); } },
  /* C1 即興劇社的熱身（BB_110 第 3 節；AA_154 第 113 行）：Y0S1 第 6 週晚上（10/10 除外），可昕邀（story3d.js：17:30 私訊，回好＝出遊 19:00 博雅借用的教室）。不管 E07 選了什麼都可以去。
     記 IMPROV_LINE＝祐廷接的那一句（E18 小公演可昕接住它）。沒去：22:00 可昕「你錯過了一隻企鵝。」*/
  { id:'ev_y0_c1', stage:'econ', title:'即興劇社的熱身', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'博雅・借用的教室',bg:'classroom_small'},
      {speaker:'社長',text:'熱身。規則只有一個：對方說什麼，你都說「對，而且——」。'},
      {speaker:'唐睿',text:'（對祐廷）我是一隻迷路的企鵝。'},
      {speaker:'player',text:'對，而且……'},
      {choice:[{text:'「而且你迷路的地方是公館。」',set:{IMPROV_LINE:'而且你迷路的地方是公館。'},goto:'a'},{text:'「而且我是來接你的計程車。」',set:{IMPROV_LINE:'而且我是來接你的計程車。'},goto:'b'},{text:'「而且……你欠我錢。」',set:{IMPROV_LINE:'而且……你欠我錢。'},goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'對，而且公館的企鵝都要排隊吃豆花。'},{goto:'end'},
      {label:'b'},{speaker:'唐睿',text:'對，而且我沒帶錢——等一下。'},{goto:'end'},
      {label:'c'},{speaker:'唐睿',text:'對，而且——（停住）——這不是熱身，這是討債。'},{speaker:null,text:'全場笑。'},
      {label:'end'},{speaker:'kexin',expression:'smile',text:'（小聲）你接得比我想的好。'},
      {speaker:'社長',text:'新來的，下次還來嗎？'} ] },
  /* 10/15（二）的群組聚會（AA_154 2-1b，AA-B 3828a4dd；第②級、送 BB-B 審）：17:30 群組兩則（story3d.js），17:30～19:15 出發選單「公館 19:00：經濟系的聚會」；去了＝出遊 19:00→22:20。
     不重演 P2（地點固定公館）。寫 E10_EVE:'went'（E10 第一句讀它）；兩個選項都只有可昕熟悉度 +1；夜市 −100（桌遊錢唐睿出）*/
  { id:'ev_y0_gather', stage:'econ', title:'經濟系的聚會', participants:['econ_zhengxun','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:3+1/3,
    dialogue:[ {scene:'公館'},
      {speaker:null,text:'（公館。期中考前的最後一個晚上。）'},
      {speaker:'韋綸',text:'今天不准聊期中。誰聊到，今晚的桌遊錢他出。'},
      {speaker:null,text:'（夜市吃了一圈，五個人擠進一家桌遊店。一個人一小時五十元。）'},
      {speaker:'econ_zhengxun',text:'三個小時，一個人一百五。'},
      {speaker:'econ_pinyu',text:'（看了一下錢包）……剛好。'},
      {speaker:null,text:'（第三局。可昕一直在看你的牌。）'},
      {choice:[{text:'「妳在看我的牌。」',goto:'a'},{text:'（假裝沒看到）',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'teasing',text:'我在看你的表情。牌我早就猜到了。'},{goto:'c'},
      {label:'b'},{speaker:null,text:'（那一局她贏了。）'},{speaker:'kexin',expression:'smile',text:'你讓我？……下次不用讓。'},
      {label:'c'},{rel:{kexin:{fam:1}}},
      {speaker:'唐睿',text:'我講一件不是期中的事喔——'},
      {speaker:null,text:'（他講的那件事，講到最後還是微積分。）'},
      {speaker:'韋綸',text:'唐睿請客！'},
      {speaker:'econ_pinyu',text:'我的一百五保住了。'},
      {speaker:null,text:'（十點二十，大家在公館的路口散了。）'},
      {set:{E10_EVE:'went'}} ],
    afterOuting:(G,GM)=>{ if(GM.money) GM.money(-100); } },
  /* ★E10「我們去總圖念書吧」——其實沒念多少（BB_104 8b-4；AA_154 第 117 行；固定核心）：10/15 22:30 可昕私訊邀（story3d.js），回「好。」＝10/16 晚上走進總圖三樓（library）就開始。
     第一句旁白照前一晚有沒有去群組聚會（E10_EVE＝'went'；10/15 的聚會等 AA-B 給內容，現在一律是「群組裡一整晚都在聊天」）。邀約那則已經在手機上，事件從「隔天晚上，總圖三樓」開始。
     E10_STUDY：先念書＝'study'；漫畫、字典＝'chat'。不答應、或 20:30 還沒到＝小福那一版（ev_y0_e10b）*/
  { id:'ev_y0_e10', stage:'econ', title:'去總圖念書', participants:['kexin'], location:'library', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[3], time:[18.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>G.flags.E10_GO==='yes'&&!G.flags.E10_STUDY},
    dialogue:[ {if:{flagIs:{E10_EVE:'went'}},speaker:null,text:'（前一天晚上，一群人在公館玩到很晚。回宿舍的路上，可昕傳來訊息。）'},
      {unless:{flagIs:{E10_EVE:'went'}},speaker:null,text:'（前一天晚上，群組裡一整晚都在聊天。）'},
      {speaker:null,text:'（隔天晚上，總圖三樓。她坐你對面，攤開微積分，看了五分鐘。）'},
      {speaker:'kexin',expression:'teasing',text:'（小聲）假設總圖的書都會說話。哪一本最吵？'},
      {choice:[{text:'「先念書。」',set:{E10_STUDY:'study'},goto:'s'},{text:'「漫畫。」',set:{E10_STUDY:'chat'},goto:'m'},{text:'「字典。」',set:{E10_STUDY:'chat'},goto:'d'}]},
      {label:'s'},{speaker:null,text:'她點頭，低頭寫。一個小時後，你發現筆記的邊角多了一隻長頸鹿。'},{goto:'end'},
      {label:'m'},{speaker:'kexin',expression:'smile',text:'它們本來就在說話。這題不算。'},{goto:'end'},
      {label:'d'},{speaker:'kexin',expression:'neutral',text:'不對。字典什麼都知道，所以最安靜。'},
      {label:'end'},{speaker:null,text:'（九點。你們幾乎沒念到。）'},
      {speaker:'kexin',expression:'smile',text:'去小福吧。念書的成本，要用點心補。'} ],
    after:(G,GM)=>{ if(G.hour%24<21) GM.advance(21-G.hour%24); } },
  { id:'ev_y0_e10b', stage:'econ', title:'小福', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[3], time:[20.5,23.5], once:true, background:'blur',
    prereq:{custom:G=>!G.flags.E10_STUDY&&!!G.flags.E10_ASKED},
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:'kexin',expression:'smile',text:'你不念書，我也不念了。'},
      {set:{E10_STUDY:'chat'}} ] },
  /* E11 期中考：考完走出普通教學館（BB_104 8b-5；AA_154 第 122 行）：Y0S1 第 9 週最後一科＝10/31（四）下午的初等會計（考場在普通；AA_154 寫 11/1，週五沒有考試——已問 AA-B）。考試一定會考，沒有沒去版。記憶：無 */
  { id:'ev_y0_e11', stage:'econ', title:'期中考後', participants:['econ_zhengxun','econ_pinyu','kexin'], location:'any', trigger:'class', afterClass:'acct_y0', afterExam:'mid', term:['Y0S1'], weeks:[9], once:true, background:'blur',
    dialogue:[ {speaker:'韋綸',text:'我第三題寫了一整頁。'},
      {speaker:'econ_zhengxun',text:'第三題的答案是零。'},
      {speaker:null,text:'（全體沉默。）'},
      {speaker:'econ_pinyu',text:'……我寫了一百二十。'},
      {speaker:'唐睿',text:'我寫了一個故事。'},
      {speaker:'kexin',expression:'neutral',text:'（看你）你寫什麼？'},
      {choice:[{text:'「零。」',goto:'z'},{text:'「我寫了一整頁。」',goto:'p'},{text:'「我不記得了。」',goto:'n'}]},
      {label:'z'},{speaker:null,text:'阿勳和你擊掌。'},{speaker:'kexin',expression:'smile',text:'……你們兩個是同一國的。'},{goto:'end'},
      {label:'p'},{speaker:'韋綸',text:'（抱住你）兄弟！'},{goto:'end'},
      {label:'n'},{speaker:'kexin',expression:'smile',text:'好。那我們都不記得。去吃宵夜。'},
      {label:'end'} ] },
  /* ★E12 長頸鹿的尾巴（BB_104 8-4；AA_154 第 124 行、A32；固定核心）：11/6 17:30 可昕私訊約（story3d.js；句子暫定，BB-B 定稿只換字）、出發選單「醉月湖 20:00」（只帶到湖邊）；
     19:45～20:15 走到湖邊她的位置（南岸步道）就演。記 E12_ANSWER（chair／hand／cat；E18 讀它）。20:15 還沒到＝20:30 手機版（同樣四句、三個接法，一定要回）*/
  { id:'ev_y0_e12', stage:'econ', title:'長頸鹿的尾巴', participants:['kexin'], location:'campus', near:{x:-36,z:-98.5,r:5}, trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[3], time:[19.75,20.25], once:true, background:'blur',
    prereq:{custom:G=>!!G.flags.E12_ASKED&&!G.flags.E12_ANSWER},
    dialogue:[ {speaker:'kexin',expression:'neutral',text:'假設，你可以多一個身體部位。你要什麼？'},
      {speaker:'kexin',expression:'smile',text:'我要長頸鹿的尾巴。'},
      {speaker:'kexin',expression:'neutral',text:'不是脖子。是尾巴。牠的尾巴尾端有一撮毛，可以趕蒼蠅。'},
      {speaker:'kexin',expression:'teasing',text:'而且我想知道，有尾巴的人怎麼坐椅子。'},
      {choice:[{text:'「那上課要訂特別的椅子。」',set:{E12_ANSWER:'chair'},goto:'c'},{text:'「我要第三隻手，幫妳拿尾巴。」',set:{E12_ANSWER:'hand'},goto:'h'},{text:'「為什麼不是貓的？」',set:{E12_ANSWER:'cat'},goto:'t'}]},
      {label:'c'},{speaker:'kexin',expression:'laugh',text:'對！所以學校要多一筆預算。你們經濟系的，算一下。'},{goto:'end'},
      {label:'h'},{speaker:'kexin',expression:'surprise',text:'……這是我聽過最好的回答。'},{goto:'end'},
      {label:'t'},{speaker:'kexin',expression:'neutral',text:'貓的太常見了。我想要一個大家都沒想過的東西。'},
      {label:'end'} ] },
  /* ★E14 保齡球館：交換穿高中制服（BB_104 8-5；AA_154 第 130 行、A33；固定核心）：11/14 21:00 群組約（story3d.js；品妤那句是 AA 暫定）、出發選單 11/15 19:00；
     開始後 15 分鐘還沒出發＝韋綸打電話（AA 暫定句）→ 直接進出遊。只用文字，不做制服 CG。沒有旗標 */
  { id:'ev_y0_e14', stage:'econ', title:'保齡球館', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'保齡球館',bg:'bowling'},
      {speaker:'econ_pinyu',text:'大家都帶了吧？高中制服。抽籤交換。'},
      {speaker:'kexin',expression:'neutral',text:'我不抽。'},
      {speaker:'kexin',expression:'smile',text:'（拿起祐廷的那一件）我要這件。'},
      {speaker:'player',text:'……為什麼？'},
      {speaker:'kexin',expression:'teasing',text:'你的學號繡在上面。我想知道當你是什麼感覺。'},
      {speaker:'econ_zhengxun',text:'（打出全倒，沒有人看到）'},
      {choice:[{text:'「這件妳穿太大了。」',goto:'a'},{text:'「那我穿妳的？」',goto:'b'},{text:'（拿起手機拍照）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'這樣比較好。可以藏東西。'},{goto:'end'},
      {label:'b'},{speaker:'econ_pinyu',text:'她的你穿不下。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'laugh',text:'拍好看一點。這是證據。'},
      {label:'end'},{speaker:null,text:'手機裡多了一張照片。她穿著你高中的外套，袖子太長，正在比一個勝利手勢。'} ] },
  /* E17 校慶園遊會：經濟系的拍賣攤（BB_104 8b-9；AA_154 第 127 行）：11/9（六）白天，走到椰林大道的攤位那一排就演（前一晚系學會那段是開場的旁白）。
     可以錯過：沒去＝當天 18:00 群組一張照片＋品妤一句（story3d.js）。沒有旗標 */
  { id:'ev_y0_e17', stage:'econ', title:'經濟系的拍賣攤', participants:['econ_pinyu','econ_zhengxun','kexin'], location:'campus', near:{x:-3,z:14,r:20}, trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[6], time:[10,17], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（前一晚，社科院的系學會辦公室。）'},
      {speaker:'econ_pinyu',text:'珍奶一杯成本二十八。要賣多少？'},
      {speaker:'kexin',expression:'neutral',text:'不定價。用荷蘭式拍賣：從一百往下喊，有人說要就成交。'},
      {speaker:'econ_zhengxun',text:'……第一杯會賣得很貴。'},
      {speaker:'kexin',expression:'smile',text:'對。那是給最想喝的人。'},
      {speaker:null,text:'（校慶當天。攤位前排了人。可昕把擴音器交給你。）'},
      {speaker:'kexin',expression:'teasing',text:'你喊。從一百開始。'},
      {choice:[{text:'一百、九十、八十……',goto:'a'},{text:'一百、五十！',goto:'b'},{text:'交給可昕喊',goto:'c'}]},
      {label:'a'},{speaker:null,text:'第一杯在七十元成交。'},{speaker:'econ_pinyu',text:'比成本多四十二。很好。'},{goto:'end'},
      {label:'b'},{speaker:'econ_pinyu',text:'你少賺了四十九元。'},{speaker:'kexin',expression:'laugh',text:'可是大家笑了。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'她喊得像在拍賣名畫。第一杯九十五元，買的人是唐睿。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(1); } },
];
// 同一人物的一般閒聊（沒有事件可觸發時）。一句可以是字串，或 {t:'台詞', if:{條件，和事件的 if 一樣}}；story3d.js 的 S.smallTalk 輪流說、一天一句
/* 閒聊（S.smallTalk）：一句可以是字串，或 {t, 條件}。條件（AA_120 2-2，2026-10-13）：if／unless（EVENTS.cond）、term（學期）、week:[a,b]（學期第幾週）、
   location（區域）、time:[a,b]、weekday、once（true＝一輩子一次；'term'＝每學期一次）。條件照 AA_120 第 1、2 節（第①級：只加條件、不改字）；
   改字（第 5 節：柏翰「二十一天」、芯慈「經濟系」、黃教授「電影」、小語的內層引號）等使用者批准，字先不動。 */
const SMALLTALK={
  heroine_02:[{t:'「今天的豆子很酸，我不推。」',location:'cafe'},'「你有看過《東京物語》嗎？沒有？那我們沒得聊了——開玩笑。」',{t:'「外文系的期中是報告，法律系呢？……我聽說你們要寫到手斷掉。」',week:[6,9]}],
  heroine_03:['「……嗯。」',{t:'「三樓靠窗的燈壞了，你知道嗎。」',location:'library'},{t:'「我阿姨說你上次的麵沒吃完。」',if:{events:['ev_noodle_yutong']}}],
  heroine_04:[{t:'「欸不是，你手指好了沒？」',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}]}},{t:'「阿凱昨天又通宵，你室友要看好他。」',if:{events:['ev_ziqing_club']}},
              {t:'「期末成發你要來。這不是問句。」',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}],stage:{npc:'heroine_04',min:'FAMILIAR'}},term:['Y1S2'],week:[10,13]}],   /* 手指痛＝學過和弦；成發在大一下、大二下第 14 週（AA_120 第 1 節、BB_96 4-4）。大二下的成發（Q9）還沒做，先只在大一下說（BB_134 1-8，AA-B 2026-10-16：先關，和 Q9 一起做時把 'Y2S2' 加回來）*/
  heroine_05:['「判決要看事實，不要只背結論。」',{t:'「法服週三晚上。來不來都可以，先來看一次。」',if:{notFlags:['lawclub']}},{t:'「……我沒事。只是沒睡。」',if:{stage:{npc:'heroine_05',min:'FAMILIAR'}}}],
  classmate_bohan:['「你有看今天的判決嗎？」',{t:'「我算過了，離第一科期中考還有{n}天。……我不是在倒數，是在排進度。」',midterm:[7,14],once:'term'}],   /* AA_120 7-1 第 1 項：{n}＝到這學期第一個期中考時段的天數（照課表和日曆，story3d.js 的 smallTalk），7～14 天才說、每學期一次 */
  classmate_xinci:[{t:'「筆記我還你了，你有收到嗎？」',if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},once:true},/* AA_120 7-1 第 2 項：雙主修三個版本照她知道多少（ECON_PAST_SHARED）；到了雙主修事件就不再說 */
    {t:'「雙主修經濟要多修好多學分。我把每學期排了三個版本……每一版都排得進去，每一版都沒有睡覺的時間。」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double']},unless:{flagIs:{ECON_PAST_SHARED:['full','half']}}},
    {t:'「你說你自學過一點經濟。個經和總經，你覺得哪一個比較會卡住人？我排課表就卡在這一格。」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'half'}}},
    {t:'「你念過一年經濟系，我只問一件事：經濟系的期中，會不會跟法律系的撞在同一週？」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'full'}}}],
  classmate_mingxuan:['「阿哲說週五練球。」',{t:'「你看起來很累。睡飽比較重要。」',if:{lateNight:true},once:'week',prio:1}],
  classmate_youchen:[{t:'「……現在幾點？我昨天四點才睡。」',time:[8,13]},{t:'「公館那間 bar 週五我放歌，來嗎？」',if:{notEvents:['ev_youchen_dj']}}],
  classmate_peishan:['「我今天旁聽了倫理學。」',{t:'「讀書會週三，萬才館。」',if:{notFlags:['lawclub']}}],
  npc_fangyt:[{t:'「森林系的野外實習，下週去溪頭。」',once:'term'},{t:'「芷若跟你講過我嗎？她高中就這樣，什麼都不講。」',if:{events:['ev_fangyt_z6']}}],   /* 第二句在 Z6（BB_96 3-6，大一下）之後才說；Z6 還沒做，先不說（BB 2026-10-13）*/
  npc_huangxh:['「心理系的統計比你們的民法可怕。」',{t:'「語彤最近很累，你有注意到嗎？」',if:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}}],
  npc_ta_chen:['「論文寫到第三章。……別問我第四章。」',{t:'「林老師的考題，看判決就對了。」',term:['Y2S2','Y3S1']}],
  prof_zhou:['「有問題就來研究室。法律不是背的，是想的。」'],prof_lin:['「判決要整個讀，不要只讀結論。」'],prof_zhang:[{t:'「講義第三十頁，自己回去看。」',if:{course:{const_1:{min:1}}}}],prof_wu:[{t:'「這個概念我們下週再講兩小時。」',if:{course:{crim_gen1:{min:1}}},term:['Y1S1','Y1S2','Y2S1']}],prof_huang:['「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」'],   /* AA_120 7-1 第 4 項：那是書不是電影；上過她的課以後 */prof_xu:[{t:'「行政法大二再說。先把民總讀好。」',if:{course:{admin_law:{max:0}}}}],prof_tsai:['「民訴的題目很長，因為人生很長。」'],prof_chen:['「國際法的新聞，每天都有。有興趣可以來研究室聊。」'],
  kai:[{t:'「所以那個賣家可以告嗎？……不能？那法律系在幹嘛。」',if:{flags:['classDone']}},{t:'「宿舍網路又斷了。你們有教這個嗎？」',location:'dorm'}],
  zhe:[{t:'「系籃週五練球，來坐也可以。」',if:{notFlags:['ball_invite']}},'「公館那家滷味晚上十點後半價。」'],
  yu:[{t:'「辯論社下週辯『網拍標錯價要不要出貨』。」',term:['Y1S1'],week:[4,6],once:true,if:{flags:['classDone']}},   /* AA_120 7-1 第 5 項：引號；辯論社第 5 週開始，第 4～6 週說「下週」才對 */'「溫州街的貓你有看到嗎？」'],
  /* AA_120 7-2（使用者 2026-10-13 批准）：20 位不熟同學各三句，整個存檔各只說一次；第 3 句要對方說過心事（SHARED_SECRET）以後。說完以後只點頭或短招呼（story3d.js 的 smallTalk）。台詞【虛構】 */
  pool_1:[{t:'「我在看一本推理小說，兇手是律師。……我還沒看完，你不要猜。」',once:true},{t:'「總圖那一區的推理小說，我大概看完一半了。剩下那一半都被借走。」',once:true},{t:'「我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？」',once:true,if:{memory:[{npc:'pool_1',tag:'SHARED_SECRET'}]}}],
  pool_2:[{t:'「財金系的報告都在算錢，法律系的報告都在算誰要賠錢。差不多。」',once:true},{t:'「我這學期修了二十五學分。不要學我。」',once:true},{t:'「我在學日文。五十音背了三次，第三次終於記住了。」',once:true,if:{memory:[{npc:'pool_2',tag:'SHARED_SECRET'}]}}],
  pool_3:[{t:'「台北的豆花太甜了。……好啦，是台南的太甜，台北的剛好。」',once:true},{t:'「我媽又寄了一箱虱目魚丸上來。冰箱塞不下，你要不要分一點？」',once:true},{t:'「每次搭高鐵回台南，過了嘉義就開始想吃早餐。」',once:true,if:{memory:[{npc:'pool_3',tag:'SHARED_SECRET'}]}}],
  pool_4:[{t:'「系學會又要辦活動了。你有什麼想玩的，可以跟我說。」',once:true},{t:'「活動組就是：大家在玩的時候，我在數人數。」',once:true},{t:'「書記官的考試科目，我偷偷查過了。你不要說出去。」',once:true,if:{memory:[{npc:'pool_4',tag:'SHARED_SECRET'}]}}],
  pool_5:[{t:'「社辦的吉他有一把斷了一根弦，大家都假裝沒看到。」',once:true},{t:'「我們社課有一半的時間在吃東西，另一半在找誰帶了撥片。」',once:true},{t:'「上次社辦有一隻蟑螂，我在走廊站了二十分鐘。不要笑。」',once:true,if:{memory:[{npc:'pool_5',tag:'SHARED_SECRET'}]}}],
  pool_6:[{t:'「椰林大道下午四點的光最好看。你下次經過可以看一下。」',once:true},{t:'「系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。」',once:true},{t:'「上次那張醉月湖的照片，我拿去投比賽。沒得獎，可是我很開心。」',once:true,if:{memory:[{npc:'pool_6',tag:'SHARED_SECRET'}]}}],
  pool_7:[{t:'「我六點就到傅鐘旁邊吃早餐了。那時候的校園很安靜，你應該來看一次。」',once:true},{t:'「早起的祕訣是早睡。……好，我知道這不算祕訣。」',once:true},{t:'「我想當律師，可是我還不知道要幫誰。你呢？」',once:true,if:{memory:[{npc:'pool_7',tag:'SHARED_SECRET'}]}}],
  pool_8:[{t:'「辯論最難的不是反駁，是計時器響的時候閉嘴。」',once:true},{t:'「下次辯論賽我當計時。……對，我每次都當計時。」',once:true},{t:'「上台之前我都要去洗三次手。今天洗了四次。」',once:true,if:{memory:[{npc:'pool_8',tag:'SHARED_SECRET'}]}}],
  pool_9:[{t:'「我最近在聽一個講冷知識的 podcast。昨天那集在講醬油。」',once:true},{t:'「窗邊這個位子下午很曬，可是我還是會坐這裡。」',once:true},{t:'「我在查國外的研究所。查了一個月，還沒跟我媽講。」',once:true,if:{memory:[{npc:'pool_9',tag:'SHARED_SECRET'}]}}],
  pool_10:[{t:'「冠廷學長說，讀書不要只畫重點，要問自己為什麼。他說了三次。」',once:true},{t:'「助教的研究室有一台很好喝的咖啡機。這是我知道的唯一祕密。」',once:true},{t:'「我想念研究所。……現在講這個好像太早了，對吧？」',once:true,if:{memory:[{npc:'pool_10',tag:'SHARED_SECRET'}]}}],
  pool_11:[{t:'「吉他袋很重。可是背著它走在路上，會覺得自己很會彈。」',once:true},{t:'「萬才館那邊晚上很安靜，彈錯也沒人聽到。」',once:true},{t:'「上次跟你說我不會換和弦……我昨天換成功了一次。只有一次。」',once:true,if:{memory:[{npc:'pool_11',tag:'SHARED_SECRET'}]}}],
  pool_12:[{t:'「系籃的水是我買的，毛巾是我洗的，比分是我記的。球是他們打的。」',once:true},{t:'「系服我有三件。不是因為愛系，是因為不用想要穿什麼。」',once:true},{t:'「翹課那幾次，我是去球場幫大家占位子。……好啦，也有一次是睡過頭。」',once:true,if:{memory:[{npc:'pool_12',tag:'SHARED_SECRET'}]}}],
  pool_13:[{t:'「廣播社這週的節目在講校園裡的貓。你有推薦的貓嗎？」',once:true},{t:'「錄音的時候最怕咳嗽。剪掉一聲要花十分鐘。」',once:true},{t:'「上次跟你說我想跑司法新聞。……我現在看新聞，都會先想記者有沒有把判決講錯。」',once:true,if:{memory:[{npc:'pool_13',tag:'SHARED_SECRET'}]}}],
  pool_14:[{t:'「從校門騎到總圖，我的紀錄是一分四十秒。不要學，很危險。」',once:true},{t:'「腳踏車社週末要騎去河堤。來的話記得帶水。」',once:true},{t:'「我一章讀十分鐘，可是隔天就忘了。所以我現在一章讀三次。」',once:true,if:{memory:[{npc:'pool_14',tag:'SHARED_SECRET'}]}}],
  pool_15:[{t:'「哲學系的課上了一學期，我學到的是：問題比答案多。」',once:true},{t:'「讀書會上我問了一個問題，大家安靜了五秒。我很喜歡那五秒。」',once:true},{t:'「我最後沒轉系。法律也在問『為什麼』，只是問得比較慢。」',once:true,if:{memory:[{npc:'pool_15',tag:'SHARED_SECRET'}]}}],
  pool_16:[{t:'「宥辰說我混音太吵。他說得對，可是我不改。」',once:true},{t:'「週五晚上公館那間，我偶爾去幫忙搬音響。」',once:true},{t:'「我背法條是配節奏的。……你不要叫我唱，我會害羞。」',once:true,if:{memory:[{npc:'pool_16',tag:'SHARED_SECRET'}]}}],
  pool_17:[{t:'「我的筆記借出去之前都會先拍照。上次有一本回來的時候多了咖啡漬。」',once:true},{t:'「考前一週，我的筆記會被借走五次。我自己都要排隊。」',once:true},{t:'「考前我都睡不著。所以才一直寫筆記，寫下來比較不怕。」',once:true,if:{memory:[{npc:'pool_17',tag:'SHARED_SECRET'}]}}],
  pool_18:[{t:'「早上的課我都坐最後一排。不是不想聽，是要給自己一點時間開機。」',once:true},{t:'「刑法的案例很像推理小說，只是兇手都先寫好了。」',once:true},{t:'「大家說我刑法很強。其實我每次考前都怕得要命。」',once:true,if:{memory:[{npc:'pool_18',tag:'SHARED_SECRET'}]}}],
  pool_19:[{t:'「我去旁聽社工系的課。有時候跟法律系在講同一件事，只是用不同的字。」',once:true},{t:'「週末我在社福中心當志工。有個小朋友問我『法律可以保護我嗎』，我還不會回答。」',once:true},{t:'「我家以前也被社工幫過。所以我想站在另一邊看看。」',once:true,if:{memory:[{npc:'pool_19',tag:'SHARED_SECRET'}]}}],
  pool_20:[{t:'「法服的攤位每年都擺在同一個位置。不是因為傳統，是因為那裡有插座。」',once:true},{t:'「法服的器材是我管的。延長線、名牌、那台很老的影印機。影印機最難管。」',once:true},{t:'「當幹部是抽籤抽到的。……可是我現在不想交出去了。」',once:true,if:{memory:[{npc:'pool_20',tag:'SHARED_SECRET'}]}}],
};

// ══════════════════════════════════════ 事件包 v1.1：女主角 arc、教授、同學、生活小事、考試、研究所
const STORY_EVENTS_V11=[
  // ── 小安 arc ──
  { id:'ev_an_library_study', title:'總圖的早上', term:['Y1S1'], participants:['heroine_01'], location:'library', trigger:'interact', priority:6, cooldown_days:2, day_min:3,   /* 交接包 v1 第 1 節（AA 2026-10-14）：大一沒有刑訴，選項改刑總；兩個選項都是大一上的課 → 只在大一上 */ prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）這裡有位子。你要讀什麼？'},{choice:[{text:'「民總。周老師下週要講錯誤。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀民總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「刑總。吳老師說期中會考。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀刑總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「我只是來吹冷氣。」',consequences:{rel:{heroine_01:{fam:1}}},goto:'ac'}]},{label:'study'},{speaker:null,text:'一個半小時。她翻頁的速度是你的兩倍，但每二十分鐘會停下來看窗外一次。'},{if:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}]},speaker:'heroine_01',expression:'smile',text:'（小聲）比咖啡廳安靜吧。……但那天比較好玩。'},{goto:'end'},{label:'ac'},{speaker:'heroine_01',expression:'annoyed',text:'（小聲）那你去三樓，那邊冷氣比較強。'},{label:'end'} ] },
  { id:'ev_an_report_feedback', title:'報告發回來了', participants:['heroine_01'], location:['campus','library','cafe'], trigger:'interact', priority:8, once:true, day_min:9, prereq:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}],custom:G=>typeof STORY==='undefined'||!STORY.termDay||G.day>=STORY.termDay('Y1S1',6,1)}, background:'blur',   /* 交付清單 A4：第 6 週（報告交出去之後）；舊存檔過了第 6 週的照舊 */
    dialogue:[ {speaker:'heroine_01',expression:'surprised',text:'報告發回來了。周老師在我的結論旁邊寫了一行字。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'laugh',text:'「無過失的判斷標準寫得好。」——所以我說了，是你的主意，他信了。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'「兩邊的利益都有看到。」……那是你那天講的。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'「反方意見比正方精彩。」——那段是照你講的寫的。'},{choice:[{text:'「下次也一起寫。」',if:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「下次一起寫。」',unless:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「那是妳寫的，不是我。」',consequences:{rel:{heroine_01:{resp:4,fam:2}}}}]},{speaker:'heroine_01',expression:'smile',text:'……嗯。'} ] },
  { id:'ev_an_mother', title:'書記官的女兒', retired:'D60（使用者 2026-10-14）：以安新版——母親是法官，停用書記官的舊事件。定義留著：已經演過的舊存檔（events.done、TALKED_FAMILY 記憶）照樣讀得到', participants:['heroine_01'], location:'campus', trigger:'interact', priority:7, once:true, time:[17.5,20.5], prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我媽今天打來，問我期中考幾分。還沒考。'},{speaker:'heroine_01',expression:'thinking',text:'她是書記官。從我小學開始，她每天回家都會講法院發生什麼事——誰哭、誰吵、誰被帶走。'},{speaker:'heroine_01',expression:'serious',text:'我念法律，一半是因為她。另一半是想知道，坐在那個位置上的人，到底看得到什麼。'},{choice:[{text:'「妳現在看到什麼？」',consequences:{rel:{heroine_01:{trust:7,aff:4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'see'},{text:'「妳可以不用一直想這個。」',consequences:{rel:{heroine_01:{comf:5,trust:3}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'rest'},{text:'「書記官很穩定啊。」',consequences:{rel:{heroine_01:{comf:-4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'你說書記官很穩定'}]},goto:'stable'}]},{label:'see'},{speaker:'heroine_01',expression:'sad',text:'……看到很多人不是壞人，只是沒有人幫他們把話講清楚。'},{speaker:'heroine_01',expression:'smile',text:'謝謝你問。大家都只問我成績。'},{goto:'end'},{label:'rest'},{speaker:'heroine_01',expression:'tired',text:'我知道。……可是不想的時候，就不知道為什麼要念這些。'},{goto:'end'},{label:'stable'},{speaker:'heroine_01',expression:'annoyed',text:'……我媽也這樣說。'},{speaker:null,text:'她沒有再說話。你們並肩走了一段，她在傅鐘前面說要回宿舍。'},{label:'end'} ] },
  // ── 芷若 arc ──
  { id:'ev_zhiruo_ge_group', title:'經原分組', participants:['heroine_02'], location:'putong', term:['Y1S1'], trigger:'auto', near:{npc:'heroine_02',r:5}, time:[12.1,13], weekday:[5], once:true, day_min:10, background:'blur',   /* AA_120 7-5 第 2 項：使用者已定 Z2 在重修的經原第 4 週週五（AA_110 1-5）——只改觸發：大一上、週五經原下課後、普通教學館、第 4 週起（2025-09-26＝第 10 天）；對話不動 */   /* 可以是第一次見面（BB 6-1、AA_120 3-1）：還沒見過的話她先報名字 */
    dialogue:[ {speaker:'heroine_02',expression:'surprised',text:'欸！法律系！你也修「經濟學原理」？'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。'},{speaker:'heroine_02',expression:'smile',text:'剛剛分組，我們那組缺一個人。要不要？期末報告是「一件你覺得不合理的定價」。'},{choice:[{text:'「好。網拍標錯價算不算？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:6,resp:3}},flags:{ge_group_zhiruo:true}},goto:'price'},{text:'「我報告很爛，妳確定？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:5,comf:3}},flags:{ge_group_zhiruo:true}}},{text:'「我已經有組了。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE'}]},end:true}]},{goto:'join'},{label:'price'},{speaker:'heroine_02',expression:'surprised',text:'（眼睛一亮）一千元的相機那種？你們法律系上課講這個？'},{speaker:'heroine_02',expression:'smile',text:'……好，這個可以拍成短片。我剪片。你負責講。'},{label:'join'},{speaker:'heroine_02',expression:'laugh',text:'太好了。組員裡有一個法律系的，老師會怕我們。'},{stamp:['geGroupDay']} ] },   /* BB_95 2-4：「網拍標錯價」之後的接點（法律說法需法律審查：遊戲裡只當報告題目、不給結論）；加入小組群組（geGroupDay，phoneRules）*/
  /* 芷若 Z5 邀約（BB_96 3-5，交接包 v2 改）：大一下第 12～13 週的週五 19–22 在 Café（她週五晚上的班；週六不在）、Z4（ev_zhiruo_secret）之後、有點熟以上、只一次。
     單身：照原文兩句；交往中（AA_108 第 5 節）：改成多人——「……方奕廷也去。……你要來嗎？」，數字沒有 aff。「早場我起不來。」不扣分：「好。那下次有午場再說。」（午場的邀約照 BB_108，之後做）。
     「幾點？」或劇透那一條都算答應：zhiruo_film_date＋zhiruoFilmDay（隔天週六 10:00 的早場＝出遊 ev_zhiruo_early_show，story3d.js 排）*/
  { id:'ev_zhiruo_film_night', title:'週末看片', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[12,13], weekday:[5], time:[19,22], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],events:['ev_zhiruo_secret']}, background:'blur',
    dialogue:[ {unless:{flags:['dating_kexin']},speaker:'heroine_02',expression:'smile',text:'明天店休。我要一個人去看《東京物語》的重映，早場。'},
      {unless:{flags:['dating_kexin']},speaker:'heroine_02',expression:'embarrassed',text:'……「一個人」是說本來。你要來嗎？不來也沒關係，真的。'},
      {if:{flags:['dating_kexin']},speaker:'heroine_02',expression:'smile',text:'明天店休。我要去看《東京物語》的重映，早場。方奕廷也去。……你要來嗎？'},
      {choice:[{text:'「幾點？」',unless:{flags:['dating_kexin']},consequences:{rel:{heroine_02:{aff:6,fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「幾點？」',if:{flags:['dating_kexin']},consequences:{rel:{heroine_02:{fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》（三個人）'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「早場我起不來。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE',note:'看片邀約（她說下次有午場再說）'}]},goto:'no'},
        {text:'「我看過了。結局是——」',consequences:{rel:{heroine_02:{comf:2}}},goto:'spoil'}]},
      {label:'yes'},{speaker:'heroine_02',expression:'smile',text:'十點。公館的那間。你遲到我就自己進去。'},{goto:'end'},
      {label:'no'},{speaker:'heroine_02',expression:'neutral',text:'好。那下次有午場再說。'},{goto:'end'},
      {label:'spoil'},{speaker:'heroine_02',expression:'annoyed',text:'不准講！'},{speaker:'heroine_02',expression:'laugh',text:'……好啦，那部電影沒有結局可以劇透。你這樣算答應了嗎？'},
      {unless:{flags:['dating_kexin']},set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{aff:4,fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》'}]},
      {if:{flags:['dating_kexin']},set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《東京物語》（三個人）'}]},{label:'end'} ] },
  /* 芷若 Z5 早場（BB_96 3-5 的新事件 ev_zhiruo_early_show；交接包 v2）：週五答應以後，週六 10:00（出遊）。2D「公館・二輪戲院」（虛構）→ 2D「豆漿店」。台詞照原文；表情 sad 改 thinking。
     單身：兩個人，記 WATCHED_FILM（方奕廷 Z6 的前置）；交往中：三個人（方奕廷），最後問「笠智眾是誰？」的是方奕廷，記 WATCHED_FILM_GROUP（不觸發 Z6）；不出 CG。
     三個「下次」記 Z5_NEXT（hers／mine／roommate；兩週內的回聲：片單、Café 點餐「你挑好了嗎？」、阿凱來 Café）。電影票根（房間物件）的字等 BB；CG 候選（戲院門口，她拿著兩張票根）還沒有 */
  { id:'ev_zhiruo_early_show', title:'東京物語的早場', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,   /* 09:40 碰面 → 約 12:40 回來（10:00～12:00 電影、豆漿店）。戲院門口碰面那一拍：BB-B c86cd8cf（BCG-21 cg_two_tickets_heroine02）*/
    dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
      {unless:{flags:['dating_kexin']},speaker:null,text:'九點四十，巷子裡的二輪戲院。她已經到了。'},{unless:{flags:['dating_kexin']},cg:'cg_two_tickets_heroine02'},
      {unless:{flags:['dating_kexin']},speaker:'heroine_02',expression:'smile',text:'（把兩張票舉到臉旁邊）早。……票我先買了。'},{unless:{flags:['dating_kexin']},speaker:'heroine_02',expression:'smile',text:'早場的人比較少。我喜歡。'},
      {if:{flags:['dating_kexin']},speaker:'heroine_02',expression:'neutral',text:'（看了一下手錶）方奕廷已經進去了。……他坐倒數第三排。我教的。'},   /* 戲院門口碰面那一拍（BB_96 3-5，BB-B c86cd8cf）：雙方單身＝BCG-21 疊在這一拍；交往中三個人、不出 CG */
      {scene:'豆漿店',bg:'soymilk_shop'},
      {speaker:'heroine_02',expression:'thinking',text:'我每次看都在想，那個媽媽到東京看小孩，大家都很忙。'},
      {speaker:'heroine_02',expression:'thinking',text:'最後對她最好的，是一個不是她小孩的人。'},
      {speaker:'heroine_02',expression:'thinking',text:'……我在想，我媽會不會也是這樣。'},
      {speaker:'heroine_02',expression:'thinking',text:'我在台北，對每個客人都很好。'},
      {speaker:'heroine_02',expression:'smile',text:'（喝豆漿）好了，太沉重了。'},
      {speaker:'heroine_02',expression:'smile',text:'你覺得那個老闆，像不像笠智眾？'},
      {unless:{flags:['dating_kexin']},speaker:'player',text:'誰？'},
      {if:{flags:['dating_kexin']},speaker:'npc_fangyt',expression:'neutral',text:'笠智眾是誰？'},
      {speaker:'heroine_02',expression:'smile',text:'……沒事。下次帶你看別部。'},
      {choice:[{text:'「下次妳挑。」',set:{Z5_NEXT:'hers'},goto:'h'},{text:'「下次我挑。」',set:{Z5_NEXT:'mine'},goto:'m'},{text:'「我下次帶我室友來。」',set:{Z5_NEXT:'roommate'},goto:'r'}]},
      {label:'h'},{speaker:'heroine_02',expression:'smile',text:'好。我列一張表給你。很長。'},{goto:'end'},
      {label:'m'},{speaker:'heroine_02',expression:'laugh',text:'你？你看過幾部電影？'},{speaker:null,text:'她笑。'},{speaker:'heroine_02',expression:'smile',text:'……好，你挑。我不笑你。大概。'},{goto:'end'},
      {label:'r'},{speaker:'heroine_02',expression:'neutral',text:'……好。'},
      {label:'end'} ],
    after:G=>{ G.flags.zhiruoFilmSeenDay=G.day; if(typeof SOCIAL==='undefined') return; const d=!!G.flags.dating_kexin; SOCIAL.remember('heroine_02',d?'WATCHED_FILM_GROUP':'WATCHED_FILM',d?'《東京物語》的早場（三個人）':'《東京物語》的早場'); } },
  /* Z5 的回聲「我下次帶我室友來」（BB_96 3-5）：早場之後兩週內走進 Café，阿凱真的來了一次（只一次）*/
  { id:'ev_kai_cafe_film', title:'聽說這裡有電影', participants:['kai','heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>G.flags.Z5_NEXT==='roommate'&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'聽說這裡有電影。'},{speaker:'heroine_02',expression:'neutral',text:'……這裡是咖啡廳。'} ] },
  /* 方奕廷 Z6「隔壁房的人記得的事」（BB_96 3-6；交接包 v2）：大一下第 16～18 週（第 17 週左右）平日 12–13 在校園找他說話；前置 WATCHED_FILM（兩個人看的那一版）、玩家沒有在交往、只一次。記 FANG_HINT */
  { id:'ev_fangyt_hint', title:'隔壁房的人記得的事', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[16,17,18], weekday:[1,2,3,4,5], time:[12,13], background:'blur',
    prereq:{memory:[{npc:'heroine_02',tag:'WATCHED_FILM'}],custom:G=>!G.flags.dating_kexin},
    dialogue:[ {speaker:'npc_fangyt',expression:'neutral',text:'你最近常去兩點半？'},
      {speaker:'npc_fangyt',expression:'neutral',text:'芷若跟我高中同班。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'她高中每天放學都去看二輪電影。一個人。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'她都不跟人講。我是有一次剛好在戲院遇到她。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'（停了一下）……她喜歡小津。你如果要約她，不要約好萊塢的。'},
      {speaker:'npc_fangyt',expression:'smile',text:'我不是叫你約她。我只是說。'},
      {mem:[{npc:'npc_fangyt',tag:'FANG_HINT',note:'他說了芷若高中的事'}]} ] },
  /* 芷若 Z7 舊版：沒有學期限制，大一下就可能觸發（她交換申請是大二的事）。BB_134 1-8、AA-B 2026-10-16：先關（off），V3-B18 照新版改寫時再開 */
  { id:'ev_zhiruo_applied', off:true, title:'她交件了', participants:['heroine_02'], location:['cafe','campus'], trigger:'interact', priority:9, once:true, day_min:6, prereq:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],events:['ev_zhiruo_secret']}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'serious',text:'我交了。交換申請。昨天晚上十一點五十九分。'},{speaker:'heroine_02',expression:'embarrassed',text:'交完手在抖。跟我媽還沒說。'},{choice:[{text:'「恭喜。錄取再煩惱。」',consequences:{rel:{heroine_02:{trust:5,resp:3}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你說恭喜'}]}},{text:'「什麼時候跟家裡說？」',consequences:{rel:{heroine_02:{trust:4,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你問家裡'}]},goto:'fam'}]},{goto:'end'},{label:'fam'},{speaker:'heroine_02',expression:'thinking',text:'錄取通知來的那天。如果沒錄取，就永遠不用說。……很懦弱吧。'},{speaker:'player',text:'不會。'},{label:'end'},{speaker:'heroine_02',expression:'smile',text:'謝謝。今天的咖啡我請。'} ] },
  // ── 語彤 arc ──
  { id:'ev_yutong_customer', title:'麵店的糾紛', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:9, once:true, minWeek:{term:'Y1S1',week:15}, term:['Y1S1','Y1S2'],   /* 只在大一（大一上第 15 週～大一下第 18 週；AA_140 G47 AA-B 裁定：沒觸發就不演，大二的事件 7 不依賴它）*/   /* 交接包 v1 A6 的週次：第 15 週起（v1 稽核：原本沒有下限）*/ prereq:{memory:[{npc:'heroine_03',tag:'SHARED_MEAL'}],custom:G=>{ if(typeof STORY==='undefined'||!STORY.fafuSat) return true; const f=STORY.fafuSat(G.day); return !!f&&f.wk<=1; }}, background:'blur',   /* AA-B 2026-10-16（G47 邊界）：下一個法服值班的週六在這週或下週才演；更遠（例如期中考週、寒假前）就先等，等到值班週六進到兩週內 */
    /* 語彤事件 3 改寫版（AA_11 事件 3；交接包 v1 第 1 節，2026-10-14）：大一的祐廷誠實地「不知道」。不出任何法律題目、不給錄音證據的法律結論。
       選「我知道誰會知道」：祐廷第一次私訊學姊（yutongAskSisDay），學姊當晚 22:30 回（BB_95 4-3），截圖轉給語彤：「……法服是什麼？」（大二她加入法服的伏筆；story3d.js 的 phoneRules）。
       裝懂：她記得（BLUFFED；大二在法服第一次看到玩家時會問「這次你會說不知道嗎？」）。結果三種都一樣：阿姨週三去了法服（ev_yutong_customer_after）*/
    dialogue:[ {speaker:'heroine_03',expression:'serious',text:'……你是法律系的，我問你一件事。'},{speaker:'heroine_03',expression:'neutral',text:'上週有客人說他在我們店吃壞肚子，要我阿姨賠三萬。'},{speaker:'heroine_03',expression:'neutral',text:'他還錄了跟我阿姨吵架的聲音，說要拿去告。'},{speaker:'heroine_03',expression:'thinking',text:'我阿姨嚇到睡不著。那個錄音……他自己偷錄的，可以用嗎？'},
      {choice:[{text:'「我不知道。我才大一。但我知道誰會知道。」',consequences:{rel:{heroine_03:{trust:8,resp:5,fam:4}},mem:[{npc:'heroine_03',tag:'HELPED',note:'幫阿姨問了法服的學姊'}],stamp:['yutongAskSisDay']},goto:'know'},{text:'「這種人通常只是嚇人。」',consequences:{rel:{heroine_03:{fam:3,trust:2}},mem:[{npc:'heroine_03',tag:'HELPED',note:'說客人只是嚇人'}]},goto:'scare'},{text:'「我覺得不能用吧……」',consequences:{rel:{heroine_03:{fam:2,trust:2}},mem:[{npc:'heroine_03',tag:'BLUFFED',note:'錄音的事裝懂，被她看出來'}]},goto:'bluff'}]},
      {label:'know'},{speaker:null,text:'你拿出手機，傳訊息給溫學姊。'},{goto:'end'},
      {label:'scare'},{speaker:'heroine_03',expression:'neutral',text:'嗯。我阿姨也這樣說。可是她還是睡不著。'},{goto:'end'},
      {label:'bluff'},{speaker:null,text:'語彤看了你三秒。'},{speaker:'heroine_03',expression:'serious',text:'你剛剛停頓了。'},{speaker:'player',text:'……對，我不知道。'},{speaker:'heroine_03',expression:'neutral',text:'嗯。那你一開始就說不知道就好。'},
      {label:'end'},{speaker:'heroine_03',expression:'smile',text:'今天的麵不用錢。……阿姨問的話，我就說你洗了碗。'} ], consequences:{money:0,stamp:['yutongCustomerDay']} },
  /* 語彤事件 3 之後：學姊的回覆，在麵店當面給她看（沒有她的聯絡方式時；有的話是手機截圖，story3d.js 的 phoneRules）*/
  { id:'ev_yutong_fwd', title:'學姊的回覆', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:10, once:true, prereq:{flags:['yutongFwdInPerson']}, background:'blur',
    dialogue:[ {speaker:null,text:'你把學姊的回覆給語彤看。'},{speaker:'heroine_03',expression:'thinking',text:'……法服是什麼？'} ] },
  /* 語彤事件 3 的結果（AA_11：三種選擇都一樣）：那一週的週三之後，第一次走進麵店 */
  { id:'ev_yutong_customer_after', title:'阿姨去了法服', participants:[], location:'noodle', trigger:'enter', once:true, prereq:{events:['ev_yutong_customer'],custom:G=>{ const d=G.flags.yutongCustomerDay; if(d==null||typeof CALENDAR==='undefined') return false; const f=typeof STORY!=='undefined'&&STORY.fafuSat?STORY.fafuSat(d):null, w=CALENDAR.dateOf(d).wd%7, sat=f?f.day:d+(((6-w)+7)%7||7); return G.day>sat; }}   /* 法服方案 A（AA_132 F2，使用者 2026-10-15）：阿姨「那個週六早上」去了法服——之後才出現（原本週三）。G47：是下一個「值班的」週六（單週、第 3 週起、考試週停）*/, background:'freeze',
    dialogue:[ {speaker:null,text:'阿姨那個週六早上去了法服。溫學姊幫她把那天的進貨單、發票、監視器的時間整理好。'},{speaker:null,text:'客人看到阿姨準備得這麼齊，就沒有再來了。'} ] },
  { id:'ev_yutong_absent', title:'她今天沒來', term:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], weeks:[8,9], participants:['heroine_03'],   /* 交接包 v2（AA_11 事件 4）：大一下期中這兩週的週二、週四晚上；原因改輕＝阿姨扭到手腕（旗標名 yutong_hospital 不改，相容）*/ location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true, day_min:8, prereq:{memory:[{npc:'heroine_03',tag:'TALKED_FAMILY'}]}, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台後面沒有語彤。阿姨右手包著護腕，用左手撈麵。'},{speaker:null,text:'阿姨：「手扭到了，這禮拜都是她在顧，顧到打烊。今天我叫她先回去睡。」'},{speaker:null,text:'「那孩子什麼都不講。你是她同學？下次叫她不要什麼都自己扛。」'},{set:{yutong_hospital:true},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨扭到手腕，那週她顧店到打烊'}]} ] },
  { id:'ev_yutong_thanks', title:'圖書館三樓', term:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], participants:['heroine_03'],   /* 交接包 v1：大一下以後才觸發（AA_11 事件 5 延後） */ location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['yutong_hospital']}, background:'blur',
    dialogue:[ {speaker:'heroine_03',expression:'tired',text:'……阿姨跟你講了吧。'},{speaker:'heroine_03',expression:'neutral',text:'她每次都這樣。沒事，手腕扭到而已。'},{choice:[{text:'（什麼都不問，把自己的筆記推過去）',consequences:{rel:{heroine_03:{comf:8,trust:5,aff:3}},mem:[{npc:'heroine_03',tag:'HELPED',note:'什麼都沒問，把筆記給她'}]},goto:'notes'},{text:'「妳可以講。我不會跟別人說。」',consequences:{rel:{heroine_03:{trust:6,comf:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'你說她可以講'}]},goto:'talk'},{text:'「妳看起來很累，回去睡吧。」',consequences:{rel:{heroine_03:{comf:2}}},goto:'sleep'}]},{label:'notes'},{speaker:'heroine_03',expression:'surprised',text:'……'},{speaker:'heroine_03',expression:'smile',text:'你的字很醜。……謝謝。'},{goto:'end'},{label:'talk'},{speaker:'heroine_03',expression:'sad',text:'講了阿姨的手也不會快一點好。……但謝謝。'},{goto:'end'},{label:'sleep'},{speaker:'heroine_03',expression:'neutral',text:'店收了才來的。這裡比較安靜。'},{label:'end'} ] },
  // ── 子晴 arc ──
  { id:'ev_ziqing_gongguan_night', title:'公館的晚上', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:6, cooldown_days:2, time:[21,25], prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'laugh',text:'欸不是，你怎麼這麼晚在這？法律系不是都早睡？'},{speaker:'heroine_04',expression:'smile',text:'我剛從網咖出來。不是打遊戲——好啦是打遊戲。你室友還活著嗎？他三天沒回訊息。'},{choice:[{text:'「活著。在追 bug。」',consequences:{rel:{heroine_04:{fam:3,comf:2},kai:{fam:1}}}},{text:'「妳們資工系的都不睡覺？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'sleep'},{text:'「要不要吃宵夜？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},consequences:{rel:{heroine_04:{fam:4,comf:4}},mem:[{npc:'heroine_04',tag:'SHARED_MEAL',note:'公館宵夜'}],money:-80,energy:8,advance:0.6},goto:'food'}]},{goto:'end'},{label:'sleep'},{speaker:'heroine_04',expression:'laugh',text:'睡覺是弱者的行為——騙你的，我下午睡了四小時。'},{goto:'end'},{label:'food'},{if:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。阿凱也在，他在排隊。'},{unless:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。我知道一家十點後半價的。'},{speaker:null,text:'她點的東西是你的三倍。'},{unless:{flags:['ZIQING_MAKING_SOMETHING']},goto:'photo'},{goto:'end'},{label:'photo'},{speaker:null,text:'滷味點完，她拿手機拍了一張照片。'},{speaker:'player',text:'拍什麼？'},{speaker:'heroine_04',expression:'neutral',text:'素材。我在做一個東西。……你不要問。'},{speaker:'heroine_04',expression:'thinking',text:'（三秒後）你可以問一點點。'},{speaker:'heroine_04',expression:'embarrassed',text:'……不行，還是不要問。'},{if:{flags:['dating_kexin']},speaker:'kai',expression:'smile',text:'她每次都拍，從來不給看。'},{set:{ZIQING_MAKING_SOMETHING:true}},{label:'end'} ] },   /* BB_95 2-7：交往中（AA_112 8-1：不放兩個人單獨的夜晚約會型場面）阿凱也在、三個人一起吃；拍照只一次（ZIQING_MAKING_SOMETHING，大一下 Q6 的伏筆）*/
  /* 子晴 Q6「測試我的遊戲。現在。」（BB_96 4-2 改門檻與台詞，交接包 v2）：原本前置要 FRIEND，沒有事件會讓她到朋友，永遠走不到 →
     Q4（CONTEST_DAY）或 Q5（CLAPPED）任一發生過＋有點熟以上；大一下第 11 週以後、週一三晚上吉他社的時段（萬才館；交往中的玩家也是社課時段，旁邊還有社員）。
     Q4 沒遇到的玩家，Q5（第 14 週成發）之後才會有。記 PLAYTESTED（新）；第三個選項 FIRST_BUG（第 5 節「插座修好了」）。表情 serious → laugh（第一次 embarrassed 留給 Q5）。
     id 不改：舊存檔演過的不再演。好感數字、所有玩家都在社課時段、找插座的三句旁白：BB b395706（2026-10-14 補）*/
  { id:'ev_ziqing_secret_game', title:'她在做的東西', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[11,12,13,14,15,16,17,18], weekday:[1,3], time:[19,21],
    prereq:{stage:{npc:'heroine_04',min:'FAMILIAR'},custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','CONTEST_DAY')||SOCIAL.has('heroine_04','CLAPPED'))}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'serious',text:'（把筆電轉過來）測試我的遊戲。現在。'},{speaker:'heroine_04',expression:'serious',text:'一隻在校園裡找插座的貓。做了半年。'},{speaker:'heroine_04',expression:'neutral',text:'沒有人知道。……除了阿凱。他是工程師，不算。'},
      {speaker:null,text:'（你接過筆電。一隻灰白色的小貓，脖子掛著一支沒電的手機。）'},{speaker:null,text:'（你點了三個地方：文學院的走廊、霖澤館的穿堂、總圖二樓靠窗那排。）'},{speaker:null,text:'（最後一個插座，貓坐下來，手機上的電池滿了。剛好三十秒。）'},
      {choice:[{text:'「貓為什麼要找插座？」',consequences:{rel:{heroine_04:{fam:5,comf:5,aff:3}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:'測試她做的遊戲'}]},goto:'cat'},
        {text:'「這比比賽有用多了。」',if:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:'測試她做的遊戲'}]},goto:'better'},
        {text:'「這比我想的好玩。」',unless:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:'測試她做的遊戲'}]},goto:'better'},
        {text:'「總圖二樓靠窗那排的插座是壞的。」',consequences:{rel:{heroine_04:{trust:6,resp:5}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:'測試她做的遊戲'}],flags:{FIRST_BUG:true}},goto:'bug'}]},
      {label:'cat'},{speaker:'heroine_04',expression:'serious',text:'因為牠的手機沒電了。'},{speaker:null,text:'（她說得很認真，然後自己笑到趴在桌上。）'},{goto:'end'},
      {label:'better'},{unless:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'你不要突然講這種話，我會當真。'},{if:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'你不要突然講這種話。我會真的把它做完。'},{goto:'end'},
      {label:'bug'},{speaker:null,text:'（她愣住，打開程式碼。）'},{speaker:'heroine_04',expression:'surprised',text:'……真的假的。我加進去。'},
      {label:'end'} ] },
  /* 阿凱 K2「工程師也是人」（BB_96 4-3，交接包 v2，新事件）：子晴 Q6 之後第一個在宿舍和他說話的晚上（他 18 點以後都在宿舍）；兩週內沒說到話就不演。
     原稿最後一句「算了。反正名單上不會有我。」刪掉（BB：太消沉）。三個選項各記一個旗標／記憶，之後的 K4（BB_98）、BB_108 回收；好感數字 BB b6b21d6 補 */
  { id:'ev_kai_engineer', title:'工程師也是人', participants:['kai'], location:'dorm', trigger:'interact', priority:7, once:true, time:[18,26],
    prereq:{events:['ev_ziqing_secret_game'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_ziqing_secret_game; return d!=null&&G.day-d<=14; }}, background:'blur',
    dialogue:[ {speaker:'kai',expression:'neutral',text:'她跟我說，我是工程師，不算玩家。'},{speaker:'kai',expression:'tired',text:'……工程師也是人啊。'},
      {choice:[{text:'「你要跟她說。」',consequences:{rel:{kai:{fam:2,trust:2}},flags:{TOLD_KAI_TELL_HER:true}},goto:'tell'},
        {text:'「你想被寫進去嗎？」',consequences:{rel:{kai:{trust:4,comf:2}},mem:[{npc:'kai',tag:'KAI_WANTS_CREDIT',note:'他想被寫進她的遊戲'}]},goto:'want'},
        {text:'「下次測試我叫你一起。」',consequences:{rel:{kai:{fam:3,comf:3}},flags:{KAI_JOINS_TEST:true}},goto:'join'}]},
      {label:'tell'},{speaker:'kai',expression:'neutral',text:'說什麼，「請把我寫進去」？很遜。'},{goto:'end'},
      {label:'want'},{speaker:null,text:'（他想了很久。）'},{speaker:'kai',expression:'neutral',text:'……想。'},{goto:'end'},
      {label:'join'},{speaker:'kai',expression:'smile',text:'好。'},{speaker:null,text:'（他轉回螢幕，打字變快了。）'},
      {label:'end'} ] },
  /* 子晴 Q4 比賽那天（BB_96 4-1 改寫，交接包 v2）：她週六的作息在公館（13–16），原本放在 Café 走不到 → 公館騎樓的長椅、只在比賽那一個週六（大一下第 8 週的週六，
     第 8～9 週之間）、前置 v1 Q2 問過比賽（ARGUED_ABOUT_CAREER）；三個選項都沒有正解（刪掉「有一點。但明年還有。」comf −2）；記 CONTEST_DAY（Q6 的前置之一）。
     id 不改：舊存檔在 Café 演過的不再演。錢（BB 382e9e2）：便利商店的罐裝咖啡一罐 −35（舊版 Café 的第四杯 −120）；選「陪她喝第四罐」的玩家自己也喝了一罐，再 −35 */
  /* 子晴 Q4（BB_96 4-1，BB-B 4ab575c7；AA_140 G05）：週六 15～18 點（她 14:00 起床、15:00 以後才出門）；錯過比賽那個週六（第 8 週）延到下一個週六（第 9 週），台詞換成「上週六是那個比賽」那一版；再錯過就不再延 */
  { id:'ev_ziqing_contest_day', title:'比賽那天', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[8,9], weekday:[6], time:[15,18], prereq:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]}, background:'blur',
    dialogue:[ {unless:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},speaker:null,text:'（她坐在騎樓的長椅，旁邊三個空的咖啡罐。）'},
      {unless:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},speaker:'heroine_04',expression:'tired',text:'……今天是那個比賽。系上的人現在都在會場。'},{unless:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},speaker:'heroine_04',expression:'tired',text:'我在這裡喝第三罐咖啡。'},
      {if:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},speaker:'heroine_04',expression:'tired',text:'……上週六是那個比賽。系上的人都回來了，大家在群組裡貼獎狀。'},{if:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},speaker:'heroine_04',expression:'tired',text:'我上週六也坐在這裡。喝了三罐咖啡。'},
      {speaker:'heroine_04',expression:'neutral',text:'你說，我是不是很爛。'},
      {choice:[{text:'「妳不想去，就不是爛。」',consequences:{rel:{heroine_04:{trust:8,comf:4}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'brave'},
        {text:'「現在去還來得及嗎？」',unless:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},consequences:{rel:{heroine_04:{resp:4,trust:3}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'late'},
        {text:'「妳後來有點開群組嗎？」',if:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===9},consequences:{rel:{heroine_04:{resp:4,trust:3}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽的下一個週六，公館騎樓'}]},goto:'late9'},
        {text:'（陪她喝第四罐）',consequences:{rel:{heroine_04:{comf:7}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}],money:-35},goto:'drink'}]},
      {label:'brave'},{speaker:'heroine_04',expression:'smile',text:'……你這樣講，好像我很勇敢。'},{speaker:null,text:'（她笑。）'},{speaker:'heroine_04',expression:'laugh',text:'我只是怕輸。'},{goto:'end'},
      {label:'late'},{speaker:'heroine_04',expression:'tired',text:'來不及了。第一輪已經結束了。'},{speaker:null,text:'（她把手機蓋在長椅上。）'},{speaker:'heroine_04',expression:'laugh',text:'……好爽。好爛。兩個都有。'},{goto:'end'},
      {label:'late9'},{speaker:'heroine_04',expression:'laugh',text:'沒有。……通知有九十九則，我一則都沒點。好爽。好爛。兩個都有。'},{goto:'end'},
      {label:'drink'},{speaker:'heroine_04',expression:'smile',text:'欸不是，你也喝？'},{speaker:'player',text:'嗯。'},{speaker:'heroine_04',expression:'smile',text:'……你很奇怪。'},{speaker:null,text:'（她第一次沒有吐槽下去。）'},
      {label:'end'},{speaker:'heroine_04',expression:'smile',text:'……第四罐。你請。'} ], consequences:{money:-35} },
  // ── 溫學姊 arc ──
  { id:'ev_sis_collapse', title:'她撐不住的那天', off:'交接包 v1 關閉（改寫版在之後的交接包）', participants:['heroine_05'], location:'cafe', trigger:'interact', priority:10, once:true, time:[20,24], prereq:{stage:{npc:'heroine_05',min:'FRIEND'},memory:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'tired',text:'……你來得剛好。或者剛不好。'},{speaker:'heroine_05',expression:'sad',text:'研究計畫被退回來。許老師說「你自己不相信這個題目」。他說對了。'},{speaker:'heroine_05',expression:'serious',text:'我做了三年法服、社長、公法組……然後我今天在這裡想，我是不是根本不想念法律。'},{choice:[{text:'「那妳想做什麼？」',consequences:{rel:{heroine_05:{trust:9,aff:4,comf:5}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她不確定要不要繼續念法律'}]},goto:'what'},{text:'「休息一天再想。」',consequences:{rel:{heroine_05:{comf:6,trust:4}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她不確定要不要繼續念法律'}]},goto:'rest'},{text:'「學姊，妳只是累了。」',consequences:{rel:{heroine_05:{comf:-3,trust:2}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'你說她只是累了'}]},goto:'tired'}]},{label:'what'},{speaker:'heroine_05',expression:'thinking',text:'……我不知道。這是三年來第一次有人問我這個，而不是問我「下一步」。'},{goto:'end'},{label:'rest'},{speaker:'heroine_05',expression:'tired',text:'我不會休息。……好吧，一天。'},{goto:'end'},{label:'tired'},{speaker:'heroine_05',expression:'annoyed',text:'每個人都這樣說。'},{speaker:'heroine_05',expression:'sad',text:'……對不起。你沒有錯。'},{label:'end'},{speaker:'heroine_05',expression:'neutral',text:'不要跟法服的人講。我明天還是社長。'} ] },
  { id:'ev_sis_office_together', title:'許教授的研究室', participants:['heroine_05','prof_xu'], location:'wancai', trigger:'interact', priority:8, once:true, prereq:{memory:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}],grad:{min:'CURIOUS'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'我等一下要去許老師那邊。你要跟嗎？他喜歡一年級的問笨問題。'},{choice:[{text:'「好。」',consequences:{grad:{bump:'跟學姊去許教授研究室',field:'公法'},prof:{prof_xu:{kind:'office',delta:3,note:'跟溫書瑀來研究室'}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'一起去研究室'},{npc:'prof_xu',tag:'FIRST_MET'}]},goto:'go'},{text:'「我還沒準備好問問題。」',consequences:{rel:{heroine_05:{fam:1}}},end:true}]},{label:'go'},{speaker:'prof_xu',expression:'neutral',text:'「書瑀，這位是？……一年級。你為什麼來？」'},{choice:[{text:'「想知道研究所在做什麼。」',consequences:{prof:{prof_xu:{kind:'research',delta:2}}}},{text:'「學姊叫我來的。」',consequences:{prof:{prof_xu:{kind:'office',delta:1}}}}]},{speaker:'prof_xu',expression:'smile',text:'「好。研究所在做的事就是：找到一個你不問會睡不著的問題。你有嗎？」'},{speaker:'player',text:'……還沒有。'},{speaker:'prof_xu',expression:'neutral',text:'「那就先上課。有了再來。」'},{speaker:'heroine_05',expression:'smile',text:'（小聲）他對你算客氣了。'} ] },
  // ── 教授 ──
  { id:'ev_prof_zhou_office', title:'周教授的研究室', participants:['prof_zhou'], location:'wancai', trigger:'interact', priority:6, cooldown_days:6, weekday:[4], time:[15.2,16.5], background:'blur',
    dialogue:[ {if:{flags:['classAnswerPlus']},speaker:'prof_zhou',expression:'neutral',text:'「你上次答得不錯。有問題？」'},{unless:{flags:['classAnswerPlus']},speaker:'prof_zhou',expression:'neutral',text:'「有問題就問。沒問題就回去讀。」'},{choice:[{text:'「老師，錯誤的『無過失』要怎麼判斷？」',consequences:{prof:{prof_zhou:{kind:'office',delta:3,note:'問無過失'}},note:{id:'zhou_88',title:'周教授：無過失的判斷','body':'看表意人有沒有「合理的注意可能」：能不能發現、有沒有時間改、金額落差多大。'},knowledge:{qid:null}},goto:'q'},{text:'「老師推薦一本書？」',consequences:{prof:{prof_zhou:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'zhou_book',title:'周教授推薦','body':'老師推薦的那本民法總則教科書——「先讀例題，再讀本文」。'}},goto:'book'},{text:'「沒事。」',end:true}]},{label:'q'},{speaker:'prof_zhou',expression:'smile',text:'「好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。」'},{goto:'end'},{label:'book'},{speaker:'prof_zhou',expression:'neutral',text:'「一年級不用讀太多。一本，讀三遍。」'},{label:'end'} ] },
  { id:'ev_prof_lin_after', term:['Y3S1'], title:'下課後', participants:['prof_lin'], location:'classroom', trigger:'interact', priority:6, cooldown_days:6, weekday:[2], time:[11.8,12.6], background:'blur',
    dialogue:[ {speaker:'prof_lin',expression:'smile',text:'「你剛剛那題——」'},{if:{knowledge:[{qid:'Q001',min:'confused'}]},speaker:'prof_lin',expression:'neutral',text:'「很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。」'},{legal:{context:'classmate',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},{speaker:'prof_lin',expression:'neutral',text:'「來研究室也可以。週二下午。」'} ], consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'下課後問問題'}}} },
  // ── 同學 ──
  { id:'ev_zhe_ball', title:'系籃練球', participants:['zhe'], location:'campus', trigger:'interact', priority:5, weekday:[5], time:[16.5,18.5], cooldown_days:6, prereq:{flags:['ball_invite']}, background:'blur',
    dialogue:[ {speaker:'zhe',expression:'smile',text:'來了？明軒在場上等。你當經理，記分。'},{choice:[{text:'「記分可以。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（記分）'},{npc:'classmate_mingxuan',tag:'SHARED_CLASS',note:'系籃練球'}],rel:{zhe:{fam:5,comf:4},classmate_mingxuan:{fam:5}},energy:-10,advance:1.5,memo:'去系籃當了一次記分員'}},{text:'「我上場。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（上場被電）'}],rel:{zhe:{fam:6,comf:5},classmate_mingxuan:{fam:6,resp:2}},energy:-22,advance:1.5,memo:'系籃練球被電了一小時'}},{text:'「今天不行。」',consequences:{mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]},end:true}]},{speaker:'zhe',expression:'laugh',text:'結束去公館吃麵，我請。'} ] },
  { id:'ev_youchen_dj', title:'週五晚上', participants:['classmate_youchen'], location:'gongguan', trigger:'interact', priority:6, weekday:[5], time:[21,26], cooldown_days:6, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_youchen',tag:'FIRST_MET'}]},speaker:'classmate_youchen',expression:'smile',text:'你……民總同班的？賴宥辰。你大概沒看過我，我通常在睡覺。'},{speaker:'classmate_youchen',expression:'smile',text:'我十一點在巷子裡那間放歌。來嗎？不用錢，法律系的算朋友價。'},{choice:[{text:'「去。」',consequences:{rel:{classmate_youchen:{fam:6,comf:4}},mem:[{npc:'classmate_youchen',tag:'SHARED_MEAL',note:'去聽他放歌'}],energy:-8,advance:2,memo:'去聽宥辰放歌到凌晨'}},{text:'「明天要早起。」',consequences:{rel:{classmate_youchen:{fam:2}}}}]},{speaker:'classmate_youchen',expression:'laugh',text:'考前我就會消失，別找我。'} ] },
  { id:'ev_xinci_double', title:'雙主修', participants:['classmate_xinci'], location:'library', trigger:'interact', priority:6, once:true, term:['Y1S2'], day_min:195, day_max:208, prereq:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]}, background:'blur',   /* AA_120 7-1 第 3 項：大一下第 6～7 週（2026-03-30～04-12），期中前；債總週四、經原週五 */
    dialogue:[ {speaker:'classmate_xinci',expression:'tired',text:'（小聲）經濟的期中在債總的隔天。兩科我都還沒念完……我可能要放棄一科。'},{choice:[{text:'「放經濟。妳民法比較強。」',consequences:{rel:{classmate_xinci:{trust:4,resp:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你建議她放經濟'}]}},{text:'「兩科都考，考爛也是經驗。」',consequences:{rel:{classmate_xinci:{fam:3,comf:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你說兩科都考'}]}},{text:'「妳為什麼要雙主修？」',consequences:{rel:{classmate_xinci:{trust:5,fam:3}},mem:[{npc:'classmate_xinci',tag:'TALKED_FAMILY',note:'雙主修是家裡要的'}]},goto:'why'},{text:'「經濟那科我陪妳看。」',goto:'econ'}]},{goto:'end'},{label:'why'},{speaker:'classmate_xinci',expression:'neutral',text:'（小聲）我爸說法律系畢業沒有第二專長會餓死。他是會計師。'},{goto:'end'},
      /* 交接包 v2 第 3 節（慈 2 的新選項）：祐廷也在重修經原（下），所有玩家都有；「第三章」不寫是個體還是總體；以安不在場，KNOWS_ECON_YEAR 不變 */
      {label:'econ'},{if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'ec_full'},{if:{flagIs:{ECON_PAST_SHARED:'half'}},goto:'ec_half'},
      {if:{flags:['P4B_SEEN']},speaker:'classmate_xinci',expression:'neutral',text:'（小聲）上次問你，你只笑。這次是第三章，你總要說了吧。'},{unless:{flags:['P4B_SEEN']},speaker:'classmate_xinci',expression:'surprised',text:'（小聲）……你怎麼這麼熟？'},
      {choice:[{text:'「念過一年。」',goto:'ec_told'},{text:'「自學過一點。」',goto:'ec_self'},{text:'「第三章我也還在念。」',goto:'ec_not'}]},
      {label:'ec_told'},{speaker:'classmate_xinci',expression:'smile',text:'（小聲）我就知道。'},{set:{ECON_PAST_SHARED:'full'}},{goto:'ec_together'},
      {label:'ec_self'},{set:{ECON_PAST_SHARED:'half'}},{goto:'ec_half'},
      {label:'ec_not'},{speaker:'classmate_xinci',expression:'neutral',text:'（小聲）……好，不說也行。'},{goto:'ec_together'},
      {label:'ec_full'},{speaker:'classmate_xinci',expression:'neutral',text:'（小聲）你念過的那一年，第三章有教嗎？'},{speaker:'player',text:'有。我那時候沒聽懂。'},{speaker:'classmate_xinci',expression:'smile',text:'（小聲）那這次一起懂。'},{goto:'ec_together'},
      {label:'ec_half'},{speaker:'classmate_xinci',expression:'neutral',text:'（小聲）自學的人，第三章懂嗎？'},{speaker:'player',text:'懂一半。'},{speaker:'classmate_xinci',expression:'smile',text:'（小聲）一半也好。'},
      {label:'ec_together'},{speaker:null,text:'（你們在總圖對經濟題。她列式子，你畫圖。）'},{mem:[{npc:'classmate_xinci',tag:'ECON_TOGETHER',note:'在總圖一起對經濟題'}]},
      {label:'end'},{speaker:'classmate_xinci',expression:'smile',text:'（小聲）謝謝。我要繼續讀了。'} ] },
  { id:'ev_mingxuan_money', title:'家裡的事', off:'交接包 v1 關閉（BB_95 2-9；改寫版在之後的交接包）', participants:['classmate_mingxuan'], location:['campus','gongguan'], trigger:'interact', priority:7, once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'我下學期可能要去打工。家裡……嗯。'},{speaker:'classmate_mingxuan',expression:'smile',text:'不用那個表情，我又不是要休學。只是球可能不打了。'},{choice:[{text:'「法服有工讀，我問學姊。」',consequences:{rel:{classmate_mingxuan:{trust:6,fam:4}},mem:[{npc:'classmate_mingxuan',tag:'HELPED',note:'幫他問工讀'}],flags:{mingxuan_job_ask:true}}},{text:'「阿哲知道嗎？」',consequences:{rel:{classmate_mingxuan:{fam:3}},mem:[{npc:'classmate_mingxuan',tag:'TALKED_FAMILY'}]}},{text:'「加油。」',consequences:{rel:{classmate_mingxuan:{fam:1}}}}]},{speaker:'classmate_mingxuan',expression:'smile',text:'……嗯。謝了。不要跟阿哲講，他會請我吃一個月的麵。'} ] },
  // ── 生活小事 ──
  { id:'ev_wrong_coffee', title:'咖啡買錯', participants:[], location:'cafe', trigger:'enter', day_min:3, cooldown_days:4, random_weight:0.35, background:'freeze',
    dialogue:[ {speaker:null,text:'你點了拿鐵，拿到的是手沖。店員說「啊」，然後看著你。'},{choice:[{text:'「沒關係，這杯也好。」',consequences:{energy:5,memo:'喝了一杯不是自己點的咖啡'}},{text:'「我點的是拿鐵。」',consequences:{advance:0.15}}]} ] },
  { id:'ev_almost_late', title:'快遲到', participants:[], location:'campus', trigger:'enter', weekday:[2], time:[9.9,10.25], day_min:3, cooldown_days:6, background:'freeze',
    dialogue:[ {speaker:null,text:'十點二十的課。你看了一眼手機，開始用走的假裝自己沒有在跑。'} ], consequences:{goal:'霖澤館：上課'} },
  { id:'ev_course_selection', title:'選課結果', participants:[], location:'dorm', trigger:'enter', day_min:5, once:true, time:[7,12], background:'freeze',
    dialogue:[ {speaker:null,text:'選課結果出來了。通識「城市與散步」——沒選上。備取十七。'},{choice:[{text:'加簽。下週去教室堵老師。',consequences:{flags:{ge_walk_waitlist:true},memo:'通識「城市與散步」備取，打算加簽'}},{text:'算了，下學期再選。',consequences:{memo:'通識「城市與散步」沒選上，下學期再選'}}]} ] },   /* 交接包 v1 第 1 節：祐廷本來就要重修經原（必修），不設 ge_econ */
  { id:'ev_forgot_book', title:'忘記還書', participants:[], location:'library', trigger:'enter', day_min:6, cooldown_days:7, random_weight:0.4, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台叫住你：「同學，你有一本《民法總則》逾期三天。」'},{choice:[{text:'繳罰款（30 元）',consequences:{money:-30}},{text:'「我明天拿來。」',consequences:{flags:{book_overdue:true}}}]} ] },
  { id:'ev_midnight_snack', title:'考前宵夜', participants:['zhe'], location:'dorm', trigger:'enter', day_min:10, time:[22,24.5], cooldown_days:5, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'手機震了一下。阿哲：「宵夜。公館。現在。明軒也在。」'},{choice:[{text:'「來了。」',consequences:{mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'考前宵夜'}],rel:{zhe:{fam:3,comf:3}},energy:-6,money:-90,advance:1,memo:'考前跟阿哲他們去吃宵夜'}},{text:'「我明天要上台報告，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE',note:'考前宵夜'}]}},{text:'「我晚點去找你們。」',consequences:{rel:{zhe:{fam:1}},advance:0.5}}]} ] },
  { id:'ev_bike_flat', title:'腳踏車沒氣', participants:[], location:'campus', trigger:'enter', day_min:4, cooldown_days:6, random_weight:0.3, time:[7,20], background:'freeze',
    dialogue:[ {speaker:null,text:'腳踏車架旁邊有人蹲著看自己的後輪。沒氣。他抬頭看你，像在問你有沒有打氣筒。'},{choice:[{text:'「校門口有打氣筒。」',consequences:{energy:-1}},{text:'（假裝沒看到）',consequences:{}}]} ] },
  // ── 考試：刑訴小考（第三週起的週二）──
  { id:'ev_quiz_crimpro', term:['Y3S1'], title:'刑訴小考', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], day_min:13, cooldown_days:13, prereq:{flags:['crimpro_attended']}, background:'freeze', mainSide:'right', player_seat:[1,3], priority:20,
    dialogue:[ {speaker:'prof_lin',expression:'neutral',text:'「今天先小考。三題，不算分，但我會記得誰寫對。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她說不算分的時候，都很算分。'},{legal:{context:'quiz',by:'prof_lin',pick:{prefer:'confused'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{section:'強制處分'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{},quiet:true}},{speaker:'prof_lin',expression:'smile',text:'「收卷。下週講強制處分。」'} ],
    consequences:{advance:1.7,energy:-8,memo:'刑訴小考',flags:{crimpro_quiz_done:true}} },
  // ── 研究所：說明會 ──
  { id:'ev_grad_info_session', title:'法研所說明會', participants:['npc_ta_chen','heroine_05'], location:'wancai', trigger:'enter', weekday:[5], time:[14.8,16.2], day_min:5, once:true, background:'blur',
    dialogue:[ {speaker:null,text:'萬才館大廳擺了二十張椅子。海報：「法律學研究所 招生說明會」。坐了七個人，大部分是大三。'},{speaker:'npc_ta_chen',expression:'neutral',text:'「我是碩二的陳冠廷，刑事法組。先講結論：研究所不是延長大學，是換一種讀法。」'},{speaker:'heroine_05',expression:'serious',text:'「一年級的也可以留下來聽，不會有人趕你。」'},{speaker:'npc_ta_chen',expression:'thinking',text:'「筆試考申論，口試問你的研究計畫。最常被問倒的問題是：你為什麼要研究這個？」'},{choice:[{text:'留下來聽完',consequences:{grad:{bump:'聽了法研所說明會'},advance:1,energy:-4,mem:[{npc:'npc_ta_chen',tag:'FIRST_MET'},{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'說明會'}],memo:'聽了法研所說明會'}},{text:'聽十分鐘就走',consequences:{advance:0.2}}]} ] },
  /* W3（BB_96 2-3，交接包 v2）：落在大一下第 5 週以後（她會在讀書會後給）；台詞、選項照舊；debate 的三個選項多記 W3_STANCE（no／diff／unsure；W3b 第一次的開頭用）*/
  { id:'ev_grad_reading', title:'學姊給的文章', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:7, once:true, prereq:{grad:{min:'CONSIDERING'},custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S2',5,1)}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'你真的在想研究所？……好。這篇。三十頁。讀完再來找我，我們吵一次。'},{set:{grad_reading:true},note:{id:'grad_reading',title:'學姊給的文章','body':'一篇公法的期刊論文。三十頁。讀書時可以選「讀研究所準備的文章」，讀三次才算讀完。'}},{speaker:'heroine_05',expression:'smile',text:'不要用螢光筆。用鉛筆，寫你不同意的地方。'} ], consequences:{mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'給你一篇文章'}]} },
  { id:'ev_grad_debate', title:'和溫學姊吵一次', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, prereq:{flags:['grad_read_done']}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'讀完了？好。第二節，作者說比例原則在這個案型「只能」這樣用。你同意嗎？'},
      {choice:[
        {text:'「不同意。他把『必要性』直接跳過了。」',hint:'你的鉛筆字',set:{W3_STANCE:'no'},rel:{heroine_05:{resp:6,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'跟她吵了必要性審查'}],goto:'agree_no'},
        {text:'「同意，但理由跟他寫的不一樣。」',set:{W3_STANCE:'diff'},rel:{heroine_05:{resp:4,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'同意結論、不同意理由'}],goto:'agree_diff'},
        {text:'「老實說，我不確定我讀懂了。」',set:{W3_STANCE:'unsure'},rel:{heroine_05:{trust:4,fam:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'承認沒讀懂'}],goto:'unsure'} ]},
      {label:'agree_no'},{speaker:'heroine_05',expression:'smile',text:'……對。他跳過了。我第一次讀的時候沒看出來，是許老師指出來的。'},{speaker:'heroine_05',expression:'serious',text:'研究所就是這樣：找作者跳過的那一步，然後自己補。你可以。'},{consequences:{prof:{prof_xu:{kind:'research',delta:1,note:'學姊提到你讀了那篇文章'}}}},{goto:'end'},
      {label:'agree_diff'},{speaker:'heroine_05',expression:'thinking',text:'講你的理由。'},{speaker:'player',text:'（你講了十分鐘。她中間打斷你三次。）'},{speaker:'heroine_05',expression:'smile',text:'三次裡有一次你是對的。第一年能這樣就夠了。'},{goto:'end'},
      {label:'unsure'},{speaker:'heroine_05',expression:'neutral',text:'那你比大部分人誠實。大部分人會假裝懂，然後在口試的時候被問倒。'},{speaker:'heroine_05',expression:'smile',text:'再讀一次。這次我陪你讀第二節。'},{consequences:{advance:1}},
      {label:'end'},{speaker:'heroine_05',expression:'tired',text:'……我自己的研究計畫還沒改完。走了。'} ],
    consequences:{grad:{bump:'和學姊為一篇文章吵了一次',field:'公法'}} }
];
Array.prototype.push.apply(STORY_EVENTS,STORY_EVENTS_V11);
