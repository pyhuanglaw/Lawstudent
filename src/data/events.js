/* ===== STORY EVENT DATA PACK v1（schema 見 STORY_EVENT_SCHEMA.md）
   trigger: 'auto'（條件成立且玩家在 near 範圍）/ 'interact'（與 participants[0] 對話時）/ 'enter'（進入區域時）
   對話行：{speaker, text, expression, position} / {choice:[{text,hint,consequences,goto,next,set,mem,rel,choiceKey,value}]} / {legal:{context,by,pick|qid,chorus}} / {label} / {goto} / {if} / {set,mem,rel,note,advance}
   所有人物與故事皆為虛構。 ===== */
'use strict';
/* 群戲「只有認識的人在場」（交接包 v1 交付清單第 0 節第 1 點）：if:EV_KNOWS('id')／if:EV_KNOWS('a','b')＝都認識了（STORY.knows：FIRST_MET；Alison met_yu；阿哲開場就熟）*/
const EV_KNOWS=(...ids)=>({custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G))});
/* 柏翰×沛珊那一段（大一下第 7 週起的 partner、4/15 期中晚餐公開、大二上第 6 週分手、ps_split_group）：認識沛珊、而且沒有和她交往（AA_374 第 11 項）*/
const PS_BH={custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_peishan',G)&&!(G.flags&&G.flags.dating_classmate_peishan)};
const PS_DT=G=>!!(G.flags&&G.flags.dating_classmate_peishan);   /* 和祐廷交往中（AA_409）*/
const PS_DT_BH=G=>PS_DT(G)&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_bohan',G);   /* 交往中、認識柏翰＝期中晚餐柏翰算麵錢三句（AA_245 第 1 節、AA_409 c42a0dd3）*/
const PS_TOLD=G=>typeof ROM!=='undefined'&&!!ROM.knowsOf&&(ROM.knowsOf(G,'zhe','classmate_peishan')||ROM.knowsOf(G,'yu','classmate_peishan'));   /* 麵店團已經知道（之前別的事件公開過）*/
const PS_NOBH={custom:G=>!!(G.flags&&G.flags.dating_classmate_peishan)&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_bohan',G)};   /* AA_245（企劃線 2af03a63）：沛珊和柏翰沒在一起（玩家和沛珊交往中，AA_374 第 11 項同一個條件）、認識柏翰＝期中晚餐換柏翰自己的三句 */
/* 沛珊說分手的那一件（AA_374 第 18 項）：看過 P3（ev_peishan_decision）而且有點熟以上＝原本的兩句；沒看過 P3、或還不熟＝短的兩句（附錄 B E6）*/
const PS_SPLIT_FULL={custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_peishan_decision)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('classmate_peishan'))};
/* 沛珊 P2（ev_peishan_doubt）在大一下開學（2026-02-23）以後才演：「…比坐在霖澤館這半年都自在。」；大一上（含寒假）照原句「這一個多月」（AA_373 #24）*/
const PS_DOUBT_Y2=G=>{ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; return !!R&&G.day>=R.from; };   /* AA_373 第 6-2 節第 10 題（企劃線 bdab2f42）：大二上（12/17 以前）才第一次演＝「比坐在霖澤館這一年多都自在。」*/
const PS_DOUBT_Y1S2=G=>{ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return !!R&&G.day>=R.from&&!PS_DOUBT_Y2(G); };
/* 可昕來看模 5（BB_97 9-19）：交往中、第 9 週回她「模擬法庭。第 10 週比賽，妳要來嗎？」（KX_MOOT_TOLD）、比賽在週末或平日 18:00 以後（平日白天她有課）*/
/* 她知不知道祐廷現在和可昕交往（knowsGF；BB_191 9-4 #3～#6）：台大角色的台詞、選項、條件讀這個，不讀 dating_kexin */
const GFN=(G,id)=>typeof ROM!=='undefined'&&ROM.gfNow?ROM.gfNow(G,id):!!(G.flags&&G.flags.dating_kexin);
const GF=id=>({custom:G=>GFN(G,id)});
const ZR_CUP_NOTE_P=0.1;   /* AA_207 §3-3：芷若紙杯上的電影場景，第一次（記 zhiruoCupNote 那次）一定出，之後偶爾一次＝這個機率 */
const KAI_LATE_BEDS=G=>{ const b=typeof STORY!=='undefined'&&STORY.r203Beds?STORY.r203Beds(G):null; return b==null?'both':b; };   /* AA_502 第 6 節第 8 點（AA-C 2026-10-28）：ev_dorm_late_kai 四人房那一行照當下誰在上舖（STORY.r203Beds：both／zhe／bohan／none）；不是 203 四人房的時期＝照原本（兩個都睡了）*/
const KAI_LATE_BUG=G=>!(G.flags&&G.flags.KAI_BUG_TOLD)||(((G.events&&G.events.done&&G.events.done.ev_dorm_late_kai)|0)%2===0);   /* AA_207 附錄 §2（阿凱半夜，隨機重播）：開頭兩句輪流——「bug 追到第三小時」講過（KAI_BUG_TOLD）以後，奇數次換「在等編譯，你先洗澡。」；還沒講過 bug 的照舊（選項「什麼 bug？」要接得上）*/
const KX_MOOT_CAME=G=>{ const F=G.flags||{}; if(!F.dating_kexin||F.KX_MOOT_TOLD!==true) return false; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:6; return wd>=6||(G.hour%24)>=18; };
/* Alison 語 2 的最後一個徵兆（交接包 v2 C18、AA_40 語 2 的表）：吉他社的社課後、麵店散場後的騎樓兩個地方共用同一段 */
const YU2_Q=arcade=>[ {speaker:'yu',expression:'neutral',text:'欸，阿哲是不是對每個人都這麼好？'},
  {choice:[{text:'「對每個人都好。」',set:{YU2_PICK:'everyone'},goto:'a'},{text:'「對妳比較好。」',set:{YU2_PICK:'you'},goto:'b'},{text:'「妳自己問他。」',set:{YU2_PICK:'ask'},goto:'c'}]},
  {label:'a'},{speaker:'yu',expression:'neutral',text:'……喔。'},{speaker:null,text:arcade?'她低頭滑手機。':'她低頭調弦。'},{speaker:'yu',expression:'neutral',text:'也是啦。'},{goto:'end'},
  {label:'b'},{speaker:null,text:arcade?'她停住，然後很大聲地哼了一段成發要彈的旋律。':'她停住，然後很大聲地彈了一個和弦。'},{speaker:'yu',expression:'embarrassed',text:'欸你很煩！'},{goto:'end'},
  {label:'c'},{speaker:'yu',expression:'neutral',text:'我才不要。'},{speaker:null,text:'她想了一下。'},{speaker:'yu',expression:'smile',text:'……再看看啦。'},   /* AA_313 5-4（AA_389 第 6 點：照逐場表）：不用「……好啦」反轉 */
  {label:'end'},{mem:[{npc:'yu',tag:'ASKED_ABOUT_ZHE',note:'她問：阿哲是不是對每個人都這麼好？'}]} ];
const YU2_QUESTION=YU2_Q(false);   /* 騎樓版她沒有背吉他（AA 50da3a9）：「調弦」換成「滑手機」、「彈了一個和弦」換成「哼了一段成發要彈的旋律」，台詞不變 */
/* 重訪日 1 的選項（交接包 v2 C20 第 3 節的表）：只從玩家真的經歷過的事裡出，最多三個（照表的順序），再加一個一定有的「每天都差不多。可是我很喜歡。」
   那場演講（C13 的 B4：B4_ATTENDED／出席紀錄）、成發拍手（BB_96 Q5 的 CLAPPED）都已接：有經歷過才會出現 */
const REVISIT_Y1_OPTS=[
  {k:'retake',t:'「重修的第一堂，坐回同一間教室。」',ok:G=>{ const A=G.courses&&G.courses.attend||{}; return ((A.econ_principles_1|0)+(A.econ_principles_2|0))>0; }},
  {k:'bbq',t:'「中秋烤肉，借來的烤肉架。」',ok:G=>!!(G.events&&G.events.done&&G.events.done.ev_mid_autumn_bbq)},
  {k:'noodle',t:'「麵店的第一碗。」',ok:G=>G.flags.noodleTableDay!=null||(Array.isArray(G.flags.ndlDays)&&G.flags.ndlDays.length>0)},
  {k:'appeal',t:'「幫以安室友寫申訴。」',ok:G=>!!G.flags.AN_APPEAL},
  {k:'rain',t:'「那天下雨，總圖門口。」',ok:G=>G.flags.rain_umbrella!=null},
  {k:'lecture',t:'「那場演講。」',ok:G=>typeof STORY!=='undefined'&&!!STORY.kxB4Told&&STORY.kxB4Told(G)},   /* AA_373 #17（AA_313 #30）：她的回應是「你說講者最後問的那一題…」——只給 5/7 在手機回過她「講者最後問：『…』」的玩家（聽完 B4 才有那個選項）；沒回的不出。原本看出席紀錄（AA_140 G49）*/
  {k:'show',t:'「成發那天，我負責拍手。」',ok:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','CLAPPED')} ];
const REVISIT_Y1_SHOWN=G=>REVISIT_Y1_OPTS.filter(o=>o.ok(G)).slice(0,3).map(o=>o.k);
/* 迎新的第 3 題（AA_177 第 9 節）：第二天 whyLaw 的鍵（舊存檔的 hero→help、ok／family／unknown→own：STORY.whyLawKey）*/
const WHY_KEY=G=>typeof STORY!=='undefined'&&STORY.whyLawKey?STORY.whyLawKey(G.flags):null;
const MENTOR_WHY_TEXT={curious:'小時候遇到事情就去翻民法。翻得到，看不懂。',econ:'我先念了一個多月經濟。還是想念這個。',help:'想幫身邊的人把事情弄清楚。',own:'還在找怎麼說。但這是我自己選的。'};
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
/* 跨年大一的頂樓（AA_204 2-3、2-5，企劃線 27711a39）：ev_nye_roof（直接到頂樓）和 ev_nye_dinner（吃飯以後一起去）共用 */
const NYE_AT=(G,id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.has||!SOCIAL.has(id,'FIRST_MET')) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(min); };
const NYE_AN=G=>!!(G.flags&&G.flags.dating_heroine_01)||NYE_AT(G,'heroine_01','FRIEND');   /* 以安 FRIEND 以上（交往中一定是）才上頂樓 */
const NYE_XC=G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('classmate_xinci','FIRST_MET');   /* 芯慈在場（認識才寫她）*/
const NYE_KAI=G=>NYE_AT(G,'kai','FAMILIAR');   /* 阿凱有點熟以上才上頂樓（BB_171 第 3 節、AA_432 4-6）*/
/* 大一跨年走「一起去信義區」那條（ev_nye_dinner 選「一起去」→ 搭捷運回頂樓，NYE_Y1＝roof）、而且以安也在（NYE_Y1_AN，在 ev_nye_dinner 記）：大二頂樓她說「去年這時候還在捷運上。」（AA_313 4-3）*/
const NYE_Y1_MRT=G=>!!(G.events&&G.events.done&&G.events.done.ev_nye_dinner)&&!!G.flags&&G.flags.NYE_Y1==='roof'&&!!G.flags.NYE_Y1_AN;
const NYE_ROOF_Y1=[
  {speaker:null,text:'（十一點四十，男生宿舍頂樓。風很大。信義區那邊的天空，亮了一塊。）'},
  {speaker:'classmate_bohan',text:'還有十八分鐘。'},
  {speaker:'yu',text:'好冷好冷好冷。'},
  {speaker:null,text:'（阿哲從樓梯間上來，手上抱著幾罐熱飲。）'},
  {speaker:'zhe',text:'樓下販賣機買的。只剩這種。'},
  /* 阿凱（AA_432 4-6；BB_171 第 3 節：有點熟以上才上頂樓，23:50 提一袋鹹酥雞上來，倒數完回房間打電動）*/
  {if:{custom:G=>NYE_KAI(G)},speaker:null,text:'（23:50，阿凱提著一袋鹹酥雞上來。）'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'所以你們都在這。'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'鹹酥雞，自己拿。'},
  /* 和可昕選了頂樓（BB_95 9-7）：她的視訊——AA_313 第 2 節第 16 列：「零點前一分鐘」打來，排在群戲倒數之前（原本在零點之後）*/
  {unless:{custom:G=>!!(G.flags.KX_NYE&&G.flags.KX_NYE[1]==='roof')},goto:'nye_r_after_kx'},
  {speaker:null,text:'零點前一分鐘，可昕打視訊來。你走到頂樓的角落接。'},
  {speaker:'kexin',expression:'smile',text:'三、二、一——'},
  {speaker:null,text:'訊號慢了一秒，她的「新年快樂」晚到。'},
  {speaker:'kexin',expression:'smile',text:'……你那邊卡了一秒啦。新年快樂。'},
  {speaker:null,text:'你轉告阿哲。阿哲對著天空喊——'},
  {if:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'可昕新年快樂！'},
  {unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'zhe',expression:'laugh',text:'政大的那位，新年快樂！'},
  {label:'nye_r_after_kx'},
  {speaker:null,text:'（倒數是 Alison 起的頭，數到三，大家才跟上。）'},
  {speaker:null,text:'（零點。很遠的地方，煙火亮了。只看得到上半截。）'},
  {speaker:'zhe',expression:'laugh',text:'……我們就說有看到。'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'好，我回去打了。'},   /* AA_432 4-6：倒數完 */
  /* 和語彤交往中（2-5）：00:01 她打電話來 */
  {unless:{flags:['dating_heroine_03']},goto:'nye_r_after_yt'},
  {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},
  {speaker:'heroine_03',text:'新年快樂。'},
  {speaker:'heroine_03',text:'你們在頂樓喔？好吵。'},
  {speaker:null,text:'（她那邊很安靜，只聽得到電視的聲音。）'},
  {choice:[{text:'「幫我跟阿姨說新年快樂。」',goto:'nye_r_yt_a'},{text:'「妳們在看什麼？」',goto:'nye_r_yt_b'}]},
  {label:'nye_r_yt_a'},{speaker:'heroine_03',text:'好。'},{speaker:null,text:'（電話那頭，她媽媽的聲音：『新年快樂喔！』）'},{set:{YT_NYE_CALL_Y1:true}},{goto:'nye_r_after_yt'},
  {label:'nye_r_yt_b'},{speaker:'heroine_03',text:'跨年晚會。我媽在跟著唱。'},{set:{YT_NYE_CALL_Y1:true}},
  {label:'nye_r_after_yt'},
  {choice:[{text:'「新年快樂。」',goto:'nye_r_hny'},{text:'（把手機舉起來拍一張）',goto:'nye_r_photo'}]},
  {label:'nye_r_hny'},{speaker:'yu',text:'新年快樂！！'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'新年快樂。'},{goto:'nye_r_down'},
  {label:'nye_r_photo'},{speaker:null,text:'（拍到的是一片黑，和一點點亮的地方。）'},{set:{NYE_Y1_PHOTO:true}},
  {label:'nye_r_down'},
  {speaker:'classmate_bohan',text:'我回房間了。'},
  {speaker:'yu',text:'我要去趕捷運！'},
  {if:{custom:G=>NYE_AN(G)&&!G.flags.dating_heroine_01},speaker:'heroine_01',text:'我也回去了。'},
  {if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'明天早上我要去跑步。你要不要一起？'},   /* 和以安交往中（2-5）*/
  {if:{flags:['dating_heroine_01']},choice:[{text:'「六點？」',goto:'nye_r_an_a'},{text:'「我想睡到中午。」',goto:'nye_r_an_b'}]},
  {label:'nye_r_an_a'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'七點。元旦，晚一點。'},{if:{flags:['dating_heroine_01']},set:{AN_RUN_NY_Y1:true}},{if:{flags:['dating_heroine_01']},goto:'nye_r_last'},
  {label:'nye_r_an_b'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'好。那我自己去。'},
  {label:'nye_r_last'},
  {speaker:null,text:'（大家一個一個下樓。阿哲最後一個，把空罐子都收走了。）'},
  {set:{NYE_Y1:'roof',NYE_DONE:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1}}},{if:{custom:G=>NYE_AN(G)},rel:{heroine_01:{fam:1}}},{if:{custom:G=>NYE_KAI(G)},rel:{kai:{fam:1}}} ];   /* 在場的人熟悉 +1（阿凱：AA_432 4-6 上頂樓的玩家）*/
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
/* 聖誕交換禮物（A20）：可能在場的七個人（AA_71 2-6）；在場＝玩家認識的；祐廷抽到誰的：明軒和 Alison 都在時 Alison 的玩偶已經是明軒的，盡量不和抽到祐廷禮物的是同一個人 */
const XMAS_WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];
const XMAS_HERE=G=>typeof STORY==='undefined'||!STORY.knows?[]:XMAS_WHO.filter(id=>STORY.knows(id,G));
/* 明軒抽到 Alison 的玩偶（AA 的「和祐廷無關的一句」）＝明軒和 Alison 都在、抽到祐廷禮物的不是明軒（是明軒的話，他抽到的是祐廷的，Alison 的玩偶祐廷也抽得到）*/
const XMAS_MX_YU=G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('yu')&&G.flags.XMAS_TO!=='classmate_mingxuan'; };
const XMAS_FROM_POOL=G=>{ const h=XMAS_HERE(G); const p=h.filter(id=>!(id==='yu'&&XMAS_MX_YU(G))); const q=p.filter(id=>id!==G.flags.XMAS_TO); return q.length?q:p; };
/* 可昕自己讀書時傳的書桌照片（BB_95 9-5：婉拒、沒回、沒接）*/
const KX_DESK_PHOTO=[{th:'p:kexin',from:'kexin',text:'📷（她的書桌）'},{th:'p:kexin',from:'kexin',text:'我自己讀了。你欠我一次。'}];   /* 照片照舊（她說了「讀完傳照片給你」，宿舍的書桌；AA_503 d13ab3ab7 第 12 節第 2 點）。動態第 8 則（src/data/feed_y1s1.js kx8）是 1/24 寒假在家的另一張 */
/* 學姊的熱水（AA_261 第 3 節 16919f86）：兩次共用的場面，first＝她的第一句 */
function SIS_STUDY_OK(G){ return !!(G.flags&&G.flags.SIS_STUDY); }   /* 一起念書解鎖了（ev_sis_study_invite 記 SIS_STUDY，src/sis_grad3d.js）：不用數值門檻（AA_284 2-3 最後一行；原本熟悉 ≥40、信任 ≥25＋SIS_W1）*/
function SIS_HOT_WATER(first){ return [
  {speaker:null,text:'（九點四十分，閉館的廣播響了。自習室的燈一盞一盞關掉。她站在走廊的飲水機前面，手上是空的保溫瓶，沒有按。）'},
  {speaker:'heroine_05',text:first},{speaker:'heroine_05',text:'……算完就不想算了。'},
  {choice:[{text:'「我去幫妳裝熱水。」',set:{HOT_WATER:true},goto:'hot'},{text:'「我請妳喝一罐。」',goto:'can'}]},
  {label:'hot'},{speaker:null,text:'（你接過保溫瓶。飲水機的熱水出得很慢，你等了一下。）'},{speaker:null,text:'（她接過去，兩手抱著。）'},{speaker:'heroine_05',text:'……好燙。'},
  {speaker:null,text:'（她笑出聲音。你很久沒看過她這樣笑。）'},{cg:'cg_hot_water_heroine05'},
  {if:{memory:[{npc:'heroine_05',tag:'HELPED'}]},speaker:'heroine_05',text:'上次是黑咖啡。……這次換熱水。'},
  {speaker:'heroine_05',text:'謝謝。明天八點，一樣的位子。'},{goto:'end'},
  {label:'can'},{speaker:null,text:'（她看了一下販賣機，按了最便宜的那一罐。）'},{speaker:'heroine_05',text:'……不用。我自己來。'},{speaker:null,text:'（她投了硬幣。罐子掉下來的聲音，在走廊很響。）'},{speaker:'heroine_05',text:'明天八點。'},
  {label:'end'} ]; }
/* 麵店團群組的補救（AA_496 第 9 節第 3 點；第 4 節「只在大一上 ev_zhe_long_table 建立，錯過的人到 2030 年才被加進去」）：大一上錯過哲 1、還不在麵店團的人，
   大一下第 2 週起（之後的學期也算）。兩個入口（ev_zhe_group_late、ev_zhe_group_late_talk）共用這個條件，演過其中一個（記 noodleTableDay）兩個都關 */
const ZHE_GROUP_LATE=G=>{ const F=G.flags||{}, DN=(G.events&&G.events.done)||{}; if((G.stage||'law')!=='law'||F.noodleTableDay!=null||DN.ev_zhe_long_table||DN.ev_zhe_group_late||DN.ev_zhe_group_late_talk) return false;
  if(typeof PHONE!=='undefined'&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')) return false;
  const d=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',2,1):null; return d!=null&&G.day>=d; };
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
      {label:'end'},   /* AA_313 4-4：最後一行旁白「（她會記得今天。）」刪掉（旁白不替她下結論）*/
      {unless:{flagIs:{rain_umbrella:'cvs'}},consequences:{memo:'雨天在總圖門口遇到陳語彤'}},
      {if:{flagIs:{rain_umbrella:'cvs'}},consequences:{memo:{t:'雨天在總圖門口遇到一個借傘的女生',named:'雨天在總圖門口遇到陳語彤',who:'heroine_03'}}} ],   /* AA_372 第 4 項：「便利商店應該有賣。」那一版她沒報名字＝「遇到一個借傘的女生」；之後拿到她的聯絡方式（報了名字）日誌才換成「陳語彤」（STORY.memoText）*/
    consequences:{goal:'自由行動'}, despawn:20, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='route'; n.waypoints=[[70,-2.5],[40,-2.5],[30,-6]]; n.pauseAt=false; n.talk=null; } } },
  // 沒下雨的另一種初遇
  /* AA_313 4-4：那行是旁白（原本 speaker:'player'，對話框會變成「祐廷：祐廷看了一下手機……」）；選「點個頭就走」直接結束、不記 FIRST_MET（noMeet：開場不替她記認識，
     另外兩個選項才 meet、接她的自我介紹）——之後還能在雨天的總圖門口、麵店第一次認識她 */
  { id:'ev_library_door_phone', title:'總圖門口', participants:['heroine_03'], noMeet:['heroine_03'], location:'campus', near:{x:81,z:0,r:6}, trigger:'auto', time:[17,22], not_weather:'rain', day_min:3, once:true, random_weight:20, prereq:{notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, spawn:{npc:'heroine_03',at:{x:79.5,z:3.2},pose:'idle'}, background:'blur',
    dialogue:[ {speaker:null,text:'總圖門口有個女生一直在看手機，看一眼、收起來、再看一眼。'},{speaker:'heroine_03',expression:'neutral',text:'……不好意思，現在幾點？'},{speaker:null,text:'你看了一下手機，告訴她時間。'},{speaker:'heroine_03',expression:'tired',text:'她又遲到了。高中同學，每次都這樣。'},{choice:[{text:'「要不要先進去等？裡面有冷氣。」',consequences:{meet:'heroine_03',rel:{heroine_03:{fam:4,comf:3}}}},{text:'「妳是社會系的？我好像在三樓看過妳。」',consequences:{meet:'heroine_03',rel:{heroine_03:{fam:5}},mem:[{npc:'heroine_03',tag:'PLAYER_ASKED_QUESTION'}]}},{text:'（點個頭就走）',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{speaker:'heroine_03',expression:'smile',text:'陳語彤。……你是法律系的吧。你們系的人走路都很快。'} ], despawn:30, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='idle'; n.talk=null; } } },
  // 麵店：語彤在幫忙（她阿姨的店）
  /* 語彤的聯絡方式（AA_70 第 2 節、AA_124 1-7，第②級，2026-10-14）：雨天的總圖門口之後，在麵店遇到她（AA_11 事件 2）——她把手機推過來：「傘的事。……你的聯絡方式。」
     雨天把傘給她（HELPED）：「我還你傘的時候要找你。」（她三年都沒還）；其他：「下次下雨的時候找你。」。沒有雨天、已經有聯絡方式的不說（錯過的到「有點熟」可以當面交換）。
     「很少在這裡看到你。」（AA_358 2-6：原本「圖書館那天之後就沒再看到你。」，在麵店認識她的玩家沒有圖書館那天）只給兩種傘的記憶都沒有的人（notMemory；原本 unless 的兩個記憶要同時有才跳過，撐傘或給傘的人會連問兩句）。*/
  /* 學姊 W1 第一次見面（AA_218 17-3，使用者 07:5x 批准；開頭句「台階」與 Café 版 2dc7f23d；機制 BB-C 798e9b14／BB_122 ★-7）：祐廷先開口、她不會叫住他；只一次。
     地點：總圖門口的台階（作息 9/4～9/29 平日 12:10～12:50，characters.js）或 Café（靠窗的位子）；9/4 分直屬以前不演（還不知道她是直屬）。閱覽室與其他地方：talkSis 一行旁白。
     記 SIS_W1、met_sis、FIRST_MET（只有 W1 記）、rel +3（和舊的初遇一樣）。台階版說完她走進總圖 */
  /* AA_379 第 1 節（企劃線 6a105a4d；使用者 10-21 23:1x 試玩卡關「我在圖書館看到學姊 結果圖書館不能講話 這樣要怎麼觸發認識」、23:2x「就直接可以說話就好」）：
     閱覽室（library）、總圖大廳二樓自習區（library_hall）找她說話也直接演這一場（沒有選項）；開頭、最後一句換閱覽室版，中間照台階版一字不改；記號一樣 */
  { id:'ev_sis_w1', title:'直屬學姊', participants:['heroine_05'], location:['campus','cafe','library','library_hall'], trigger:'interact', priority:9, once:true, background:'blur', term:['Y1S1','Y1S2'],   /* AA_376 #19：大一的初識事件，限大一（大一沒觸發就不演；「法律系大一」）*/
    prereq:{custom:G=>{ const F=G.flags; if(F.met_sis||F.SIS_W1||(G.stage||'law')!=='law'||typeof STORY==='undefined'||G.day<STORY.dayOfKey('2025-09-04')) return false;
      if(G.zone==='campus'){ const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj; return !!P&&Math.hypot(P.position.x-83,P.position.z-3)<8; }   /* 校園只在總圖門口的台階那裡 */
      return G.zone==='cafe'||G.zone==='library'||G.zone==='library_hall'; }},
    dialogue:[ {if:{custom:G=>G.zone==='campus'},speaker:null,text:'（她坐在總圖門口的台階上看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='cafe'},speaker:null,text:'（她坐在靠窗的位子看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library'},speaker:null,text:'（她坐在靠窗的位子讀書，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library_hall'},speaker:null,text:'（她坐在長桌的一角讀書，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>typeof STORY==='undefined'||!STORY.sisZhishuOut||STORY.sisZhishuOut(G)},speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {unless:{custom:G=>typeof STORY==='undefined'||!STORY.sisZhishuOut||STORY.sisZhishuOut(G)},speaker:'player',text:'學姊好，我是{name}，法律系大一。'},   /* AA_372 第 12 項：9/4 21:00 Kevin 公布直屬以前遇到她（台階 12:10～12:50、Café 19～21 點）不說「直屬學弟」*/
      {speaker:'heroine_05',expression:'neutral',text:'（抬頭）喔，hi。'},
      {speaker:'heroine_05',expression:'neutral',text:'開學還習慣嗎？'},
      {speaker:'player',text:'還可以。'},
      {speaker:'heroine_05',expression:'neutral',text:'民法你選哪個老師？'},
      {speaker:'player',text:'周老師。'},
      {speaker:'heroine_05',expression:'smile',text:'周老師很熱門耶，要很早去佔位置喔。'},
      {speaker:'player',text:'真的，前一堂課就要去佔了。'},
      {unless:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:'heroine_05',expression:'smile',text:'（笑了一下）對，就是這樣。我要去圖書館了，有問題再私訊我。'},
      {if:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:'heroine_05',expression:'smile',text:'（笑了一下）對，就是這樣。有問題再私訊我。'} ],   /* 她已經在圖書館（AA_379 1-2）；演完她繼續讀書 */
    consequences:{flags:{met_sis:true,SIS_W1:true}},
    after:(G,GM,npcs)=>{ if(GM.rel) GM.rel('sis',3); const n=npcs&&npcs[0]; if(n&&G.zone==='campus'){ n.beh='route'; n.waypoints=[[86.4,1.2]]; n.pauseAt=false; n.talk=null; if(GM.despawnLater) GM.despawnLater(n,6); } } },
  /* W1 的晚到版（AA_379 第 4 節，企劃線 992b58da；AA 10-22 03:19 定，BB 03:16 讀碼：會記 met_sis 的 W1、家聚、社博都在大一，大一沒找過她的玩家永遠認識不到學姊）：
     大一下結束以後（暑假也算）到 2029-06-01，第一次在 Café、法圖、閱覽室、總圖大廳自習區找她說話。記號同 W1（met_sis、SIS_W1、FIRST_MET、+3），另外記 SIS_W1_LATE；演完她繼續讀書 */
  /* AA_523 6-6（企劃線 0d7b5388b）：照第一次見面那一年換（SOCIAL.playerYear：放假照上一個學期）——大二以前「大一太忙了。」（原本）、大三「之前一直沒遇到。」、大四「四年都沒遇到。」；
     標題「晚了一年／兩年／三年」（title 用 getter，事件開演那一刻照那一年算）*/
  { id:'ev_sis_w1_late', get title(){ let y=2; try{ if(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear) y=SOCIAL.playerYear(); }catch(e){ y=2; } return '直屬學姊（晚了'+(y>=4?'三':(y===3?'兩':'一'))+'年）'; }, participants:['heroine_05'], location:['cafe','lawlib','library','library_hall'], trigger:'interact', priority:9, once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; if(F.met_sis||F.SIS_W1||(G.stage||'law')!=='law'||typeof STORY==='undefined'||typeof CALENDAR==='undefined'||!CALENDAR.termDays) return false;
      const R=CALENDAR.termDays('Y1S2'), last=STORY.dayOfKey('2029-06-01'); return !!R&&last!=null&&G.day>R.to&&G.day<=last; }},
    dialogue:[ {if:{custom:G=>G.zone==='cafe'},speaker:null,text:'（她坐在靠窗的位子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='lawlib'},speaker:null,text:'（她坐在法圖最裡面那張桌子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library'},speaker:null,text:'（她坐在靠窗的位子讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library_hall'},speaker:null,text:'（她坐在長桌的一角讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {speaker:'heroine_05',expression:'neutral',text:'（抬頭）……{name}。'},
      {speaker:'heroine_05',expression:'neutral',text:'家族群組裡的那個名字。家聚你一次都沒來。'},
      {speaker:'heroine_05',expression:'neutral',text:'我還以為，你是不需要學姊的那種人。'},
      {choice:[{text:'「大一太忙了。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)<=2},goto:'w1l_a'},{text:'「之前一直沒遇到。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)===3},goto:'w1l_a3',aa523:true},{text:'「四年都沒遇到。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)>=4},goto:'w1l_a4',aa523:true},{text:'「我不知道去哪裡找學姊。」',goto:'w1l_b'}]},
      {label:'w1l_a'},{speaker:'heroine_05',expression:'neutral',text:'嗯。大一都很忙。……我也是。'},{goto:'w1l_c'},
      {label:'w1l_a3'},{speaker:'heroine_05',expression:'neutral',text:'嗯。……現在遇到了。',aa523:true},{goto:'w1l_c'},
      {label:'w1l_a4'},{speaker:'heroine_05',expression:'neutral',text:'……那還來得及。我六月才畢業。',aa523:true},{goto:'w1l_c'},
      {label:'w1l_b'},{speaker:'heroine_05',expression:'neutral',text:'晚上我大多在 Café 或法圖。……不難找。'},
      {label:'w1l_c'},
      {speaker:'heroine_05',expression:'neutral',text:'溫書瑀。現在在念研究所。'},
      {speaker:'heroine_05',expression:'smile',text:'以後有問題，私訊我。……這次記得問。'} ],
    consequences:{flags:{met_sis:true,SIS_W1:true,SIS_W1_LATE:true}},
    after:(G,GM)=>{ if(GM.rel) GM.rel('sis',3); } },
  /* 學姊 W1 到社博之間的接觸 ②③（AA_218 17-6，使用者 10:2x 批准；AA-C e4a8ba67 選 (a)）：
     ② 第 2 週週三 9/10 刑總下課的霖澤館走廊（要 W1、家族群組 9/8 揪過家聚）；不在場就延到週四 9/11 民總下課；再沒遇到就不演。選項只影響下一句、不記。
     ③ 9/12（五）19:00 家聚（公館巷子裡的簡餐店，出遊；story3d.js 排的）：去了記 SIS_FAM_DINNER；還沒做過 W1 的在這裡第一次見到她＝也算 W1（SIS_W1、met_sis、FIRST_MET；和社博的合併版同一個做法，LAWWW-C 定、已請 BB-C 看）*/
  { id:'ev_sis_fam_hall', title:'週五家聚你會來嗎', participants:['heroine_05'], location:'any', trigger:'class', afterClass:'crim_gen1', term:['Y1S1'], weeks:[2], weekday:[3], once:true, priority:6, background:'blur',
    prereq:{flags:['SIS_W1'],custom:G=>!G.flags.SIS_FAM_HALL&&typeof PHONE!=='undefined'&&PHONE.sent(G,'sis_fam_inv')},
    dialogue:[ {speaker:null,text:'（霖澤館的走廊。下課的人往樓梯擠，學姊從另一頭走過來。）'},{speaker:'player',text:'學姊。'},
      {speaker:'heroine_05',expression:'neutral',text:'喔，學弟。剛下課喔？'},{speaker:'player',text:'對，刑總。'},{speaker:'heroine_05',expression:'neutral',text:'週五家聚你會來嗎？'},
      {choice:[{text:'「會啊。」',goto:'a'},{text:'「還不確定。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_05',expression:'smile',text:'好，那週五見。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'可以的話就來啦，大家都會來。'},
      {label:'end'},{speaker:'heroine_05',expression:'neutral',text:'我先去圖書館了，掰掰。'},{set:{SIS_FAM_HALL:true}} ] },
  { id:'ev_sis_fam_hall2', title:'週五家聚你會來嗎', participants:['heroine_05'], location:'any', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[2], weekday:[4], once:true, priority:6, background:'blur',
    prereq:{flags:['SIS_W1'],custom:G=>!G.flags.SIS_FAM_HALL&&typeof PHONE!=='undefined'&&PHONE.sent(G,'sis_fam_inv')},
    dialogue:[ {speaker:null,text:'（霖澤館的走廊。下課的人往樓梯擠，學姊從另一頭走過來。）'},{speaker:'player',text:'學姊。'},
      {speaker:'heroine_05',expression:'neutral',text:'喔，學弟。剛下課喔？'},{speaker:'player',text:'對，民總。'},{speaker:'heroine_05',expression:'neutral',text:'週五家聚你會來嗎？'},
      {choice:[{text:'「會啊。」',goto:'a'},{text:'「還不確定。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_05',expression:'smile',text:'好，那週五見。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'可以的話就來啦，大家都會來。'},
      {label:'end'},{speaker:'heroine_05',expression:'neutral',text:'我先去圖書館了，掰掰。'},{set:{SIS_FAM_HALL:true}} ] },
  { id:'ev_sis_fam_dinner', title:'家聚', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'公館・巷子裡的簡餐店'},{speaker:null,text:'（長桌坐了七八個人，大一到大四都有。）'},
      {speaker:'Kevin',text:'來來來，學弟坐這邊。介紹一下，這是我們家的大一，{name}。'},
      {speaker:null,text:'（大家：「嗨——」溫書瑀坐在對面，朝你點了一下頭。）'},
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。我是妳的直屬。'},   /* 沒做過 W1：祐廷先開口（AA_218 17-1；AA-C 15:59 台詞，BB-C 審口氣中）*/
      {unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我知道。名單上看過你的名字。'},
      {unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我是溫書瑀。課的事可以問我。'},
      {speaker:'Kevin',text:'書瑀學姊很厲害喔，憲法傳奇，張老師給她 95。'},
      {speaker:'heroine_05',expression:'annoyed',text:'你可以不要每年都講這個嗎。'},
      {speaker:'Kevin',text:'要啊，這是我們家的傳統。'},
      {speaker:null,text:'（大家笑。菜上來了。）'},
      {speaker:null,text:'（吃完在店門口，她說要回家念書，先走了。）'},
      {speaker:'heroine_05',expression:'neutral',text:'我先回去了，你們慢慢聊。'},
      {set:{SIS_FAM_DINNER:true}},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true,_W1_AT_DINNER:true}} ],
    after:(G,GM)=>{ if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('heroine_05','FIRST_MET')) SOCIAL.remember('heroine_05','FIRST_MET','家聚'); } },
  /* 社團博覽會・法服的攤位（AA_218 17-3 社博，使用者 07:5x 批准；AA-C 09:50：做過 W1＝主版本、沒做過＝合併版。17-6 的 ④ 9/16 私訊是強制演出，所以做過 W1 的人到社博時一定有 ②～④ 至少一次＝主版本前提成立；家聚第一次見到她的也算 W1）。
     社博那天（新局 9/6（六）10:00～16:00、舊局 9/30、10/1；AA_485 3-2）椰林大道法服的帳篷（src/clubfair3d.js 的互動點；服務台的選單選法服也演這一段）。只一次，記 SIS_CLUB_EXPO；祐廷直接寫報名表＝加入法服（lawclub、CLUB_lawclub_study）。
     社博搬到 9/6 以後在家聚（9/12）、9/16 私訊之前：做過 W1（9/3）＝主版本、沒做過＝合併版，兩條都接得上（AA_485 3-2）；私訊問過「問社博」的照主版本（AA_485 第 4 節，SIS_MSG_EXPO）。
     合併版同時算 W1（SIS_W1、met_sis、FIRST_MET、學姊 +3）。「學姐」「學長」是背景社員，不取名 */
  /* 學姊 A5-1 新版 C1（BB_188 @05571a45 原文，使用者 10:3x 對 LAWWW-C「通過」；實作照 AA_218 17-13 第 3、5 點）：她研究所放榜（3/23，SIS_RESULT_OUT）以後，
     2026-04-08（三）16:30 法學院圖書館外的台階；玩家不在校內就延到下一個週三 16:30（跳過考試週＝大一下第 8～9 週），最晚第 15 週。B 發生過（9/3 加好友）才有；不必交往、沒有好感門檻。
     祐廷說完「……等一下。我高二校慶好像被問過。」以後插播回想 A（BB_188 A 十項回覆版），演完回到台階。CG BCG-49 還沒有：先用操場的一般背景。記 SIS_FESTIVAL_MET（C2 讀）*/
  { id:'ev_sis_c1_festival', title:'高二的校慶', participants:['heroine_05'], location:['campus','linze','classroom','wancai','library','library_hall','lawlib','soclib','boya','putong','gym','gym_b1','gym_arena'], trigger:'auto', term:['Y1S2'], weeks:[7,10,11,12,13,14,15], weekday:[3], time:[16.5,18], once:true, priority:7, background:'blur',
    prereq:{flags:['SIS_CONTACTED','SIS_RESULT_OUT','met_sis'],custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey('2026-04-08')},   /* AA_518 4-12：要見過她（met_sis）；只加過好友、沒見過的玩家不會被她當熟人叫住 */
    dialogue:[ {scene:'臺大・法學院圖書館外的台階',bg:'ntu_linze'},{speaker:null,text:'（你走過法學院圖書館外面的台階，學姊坐在最上面一階，旁邊放著一杯咖啡。）'},
      {speaker:'heroine_05',expression:'neutral',text:'你下學期通識選好了嗎？'},
      {speaker:'player',text:'還沒。有推薦的嗎？'},
      {speaker:'heroine_05',expression:'smile',text:'我大一修過一門，還滿好玩的。期末要分組做訪談，還要錄影。'},
      {speaker:'heroine_05',expression:'neutral',text:'我們那組回我高中，校慶那天去找學弟妹，問有沒有人願意之後配合我們錄影。'},
      {speaker:'player',text:'妳高中就是我高中啊。'},
      {speaker:'heroine_05',expression:'neutral',text:'對啊。'},
      {speaker:'player',text:'……等一下。我高二校慶好像被問過。一群大學生，說他們是台大法律的，要錄影、要約好幾次。'},
      {scene:'回想・高二上的校慶',bg:'camp_school'},
      {speaker:null,text:'（高二上，校慶。操場邊排滿攤位，很吵。你手上一碗剉冰，煉乳快要和紅豆化在一起。）'},
      {speaker:null,text:'（三、四個大學生走過來。後面一個長頭髮的女生拿著筆記本，翻開的那頁已經寫了好幾個電話。）'},
      {speaker:'組員',text:'學弟，不好意思打擾一下。我們是台大法律系的，在做通識課的作業。'},
      {speaker:'組員',text:'想找願意之後配合我們訪談的同學，要錄影，大概會約幾次。'},
      {speaker:'player',text:'……要錄影喔。'},
      {speaker:'player',text:'（低頭挖了一口冰）嗯……我想一下。'},
      {speaker:'另一個組員',text:'沒關係，你可以先考慮。留個電話給我們？之後排好時間再打給你。'},
      {speaker:'player',text:'喔，好。'},
      {speaker:null,text:'（你一邊挖冰，一邊把號碼念出來。後面那個女生低頭抄進筆記本。）'},
      {speaker:'溫書瑀',text:'不好意思，最後四個數字再念一次？'},   /* 回想裡不用現在的立繪（她那時長髮放下來、沒綁；BCG-49 之後補）：字串名字、不對到 heroine_05 */
      {speaker:null,text:'（你又念了一次。冰滴到手上，你換一隻手拿。）'},
      {speaker:'組員',text:'好，謝謝學弟！'},
      {speaker:null,text:'（他們往下一攤走。你低頭繼續吃冰。冰已經化掉一半了。）'},
      {scene:'臺大・法學院圖書館外的台階',bg:'ntu_linze'},
      {speaker:'heroine_05',expression:'surprised',text:'真的假的？你高二是哪一年？'},
      {speaker:'player',text:'高二上。……那時候妳大一。'},
      {speaker:'heroine_05',expression:'neutral',text:'那就是我們啊。'},
      {speaker:'player',text:'真的假的。'},
      {speaker:'heroine_05',expression:'smile',text:'不然誰會這麼巧。我們那天問了十幾組。'},
      {speaker:'heroine_05',expression:'neutral',text:'你那時候有答應嗎？'},
      {speaker:'player',text:'我在吃冰，說要想一下。他們叫我留電話，我就留了。後來也沒人打來。'},
      {speaker:'heroine_05',expression:'neutral',text:'我們後來好像一個都沒打。……抱歉。'},
      {speaker:'player',text:'所以那天妳也在。'},
      {speaker:'heroine_05',expression:'neutral',text:'應該在。可是我完全不記得你。'},
      {speaker:'player',text:'我也沒看到妳的臉。我一直在看我的冰。'},
      {choice:[{text:'「我們那時候就見過了耶。」',goto:'met'},{text:'「妳那時候長什麼樣子？」',goto:'look'},{text:'「早知道那天就好好看一下。」',goto:'see'}]},
      {label:'met'},{speaker:'heroine_05',expression:'smile',text:'對啊。好神奇。'},{goto:'end'},
      {label:'look'},{speaker:'heroine_05',expression:'neutral',text:'頭髮放下來，沒綁。你呢？'},{speaker:'player',text:'……金色的。'},{speaker:'heroine_05',expression:'surprised',text:'金色？'},{speaker:null,text:'（她笑到停不下來。）'},{goto:'end'},
      {label:'see'},{speaker:'heroine_05',expression:'neutral',text:'看了也不會記得啦。'},{speaker:'heroine_05',expression:'smile',text:'……不過真的很巧。'},
      {label:'end'},{set:{SIS_FESTIVAL_MET:true}} ],
    after:G=>{ if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'sis_hs_festival','高二的校慶','camp_school'); } },   /* Life Album 收「高二的校慶」（AA_218 17-13 第 5 點；BCG-49 還沒有圖，先用操場）*/
  /* C2 她家搬家（BB_188 C2 ①，AA_218 15-7、17-13 第 4 點）：只有和她交往中、C1 演過（SIS_FESTIVAL_MET）才演，日子是 STORY.sisC2Day（7/11 已交往＝當天；之後才交往＝隔 3 天以上的第一個週六）。
     2D 只演她：她的房間（沒有背景圖，暗底）。之後的私訊在 story3d.js（sis_c2_msg，照片＋三個選項）。
     那天沒演到（暑假快轉、整天在外面）：之後第一個能演的時候補，第一句換成「搬家後還有幾箱沒拆。」（AA 給的另一句；LAWWW 只是讓它不會整個錯過）*/
  { id:'ev_sis_c2_room', title:'筆記本', participants:[],   /* 只演她、祐廷不在場：不算期末的「一起在場」*/ location:'any', trigger:'auto', time:[15,23], once:true, priority:7, background:'dark',
    prereq:{flags:['dating_heroine_05','SIS_FESTIVAL_MET'],custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.sisC2Day?STORY.sisC2Day(G):null; return d!=null&&G.day>=d; }},
    dialogue:[ {scene:'溫學姊的房間'},
      {if:{custom:G=>G.day===STORY.dayOfKey('2026-07-11')},speaker:null,text:'（家裡要搬家。她的房間地上好幾個紙箱，一半已經封起來。）'},
      {unless:{custom:G=>G.day===STORY.dayOfKey('2026-07-11')},speaker:null,text:'（搬家後還有幾箱沒拆。）'},
      {speaker:null,text:'（書架最下面一層，一本封面有點皺的筆記本。大一的通識課。她翻開，停在一頁，笑了一下，拿起手機拍照。）'} ],
    after:G=>{ G.flags.SIS_C2_ROOM=G.day; G.flags.SIS_C2_H=Math.min(23.5,Math.max(16,(G.hour%24)+0.25)); if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'sis_notebook','筆記本那一頁',''); } },   /* Life Album 收「筆記本那一頁」（BB_188 C2）：號碼不能看得清楚，先不放圖 */
  /* 公館的補習班門口：平日 18:00～18:30，Kevin 去上班前招呼一次（AA_241 9-2；BB_198 大一寒假那列 d142d98d：大一寒假每個玩家都有、日本那週 1/24～1/31 除外；大二寒假起只給沒報 C04W 的；一個假期一次；VAC.kevinDoor）*/
  { id:'ev_kevin_cram_door', title:'補習班門口', participants:[], location:'gongguan', trigger:'auto', weekday:[1,2,3,4,5], time:[18,18.5], priority:3, background:'blur',
    prereq:{custom:G=>typeof VAC!=='undefined'&&!!VAC.kevinDoor&&!!VAC.kevinDoor(G)},
    dialogue:[ {speaker:'Kevin',text:'學弟！路過喔？我要上班了，下次聊。',unless:{custom:G=>!!G.flags.KEVIN_DOOR&&Object.keys(G.flags.KEVIN_DOOR).length>0}},
      {speaker:'Kevin',text:'又是你。……真的不報一下？',if:{custom:G=>!!G.flags.KEVIN_DOOR&&Object.keys(G.flags.KEVIN_DOOR).length>0}} ],   /* 第二個假期以後換這一句 */
    after:G=>{ const k=typeof VAC!=='undefined'&&VAC.kevinDoor?VAC.kevinDoor(G):null; if(k) (G.flags.KEVIN_DOOR||(G.flags.KEVIN_DOOR={}))[k]=G.day; } },
  /* 子晴問阿凱（AA_218 17-11 @5063fbaf 台詞；BB_191 9-7 觸發）：上課日 17:00 資工系下課問的（romance3d.js zqAskTick 記 ZQ_ASK_KAI_D、寫 knowsGF.heroine_04 told_by:kai），
     那晚玩家第一次睡覺時演給玩家看（睡覺觸發；字卡「17:00　資工系館」、暗底：走廊的圖還沒有）。祐廷不在場、不知道（ytKnows 不變）*/
  { id:'ev_zq_ask_kai', title:'你室友有女朋友嗎', participants:[],   /* 祐廷不在場：不放 participants（會被算成認識、期末的「一起在場」）；立繪照每一句的 speaker */ location:'any', trigger:'sleep', once:true, priority:6, background:'dark', sleepCard:['17:00','資工系館'],
    prereq:{custom:G=>G.flags.ZQ_ASK_KAI_D!=null&&G.day>=G.flags.ZQ_ASK_KAI_D},
    dialogue:[ {scene:'資工系館・走廊'},
      {speaker:'heroine_04',expression:'neutral',text:'欸，你室友……有女朋友嗎？'},
      {speaker:'kai',text:'有啊，政大的。怎樣？'},
      {speaker:'heroine_04',expression:'smile',text:'沒有啊，問問。'} ] },
  { id:'ev_sis_club_expo', title:'社團博覽會・法服', participants:['heroine_05'], location:'campus', trigger:'manual', once:true, background:'blur',
    prereq:{custom:G=>!G.flags.SIS_CLUB_EXPO},
    dialogue:[ {speaker:null,text:'（椰林大道上一整排帳篷。你走到法服的攤位前。）'},
      {speaker:'學姐',text:'學弟，要不要聽一下？我們是法律服務社——'},
      {if:{flags:['SIS_MSG_EXPO']},unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true,_EXPO_MERGED:true}},   /* MSG-SIS-EARLY-1027（AA_485 第 4 節）：私訊問過「問社博」的玩家照「見過」那一條，不另外加句子；這裡第一次見到她＝也算 W1（同合併版）*/
      {if:{flags:['SIS_W1']},goto:'main'},
      {speaker:null,text:'（帳篷前面站著一個綁馬尾的人，手上拿著一疊傳單。你認得她——家族群組大頭貼上那個學姊。）'},
      {speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {speaker:'heroine_05',expression:'neutral',text:'喔，hi。'},
      {speaker:'heroine_05',expression:'neutral',text:'（對旁邊的學姐）這我直屬學弟，我來跟他講。'},
      {set:{SIS_W1:true,met_sis:true,_EXPO_MERGED:true}},{goto:'common'},
      {label:'main'},{speaker:null,text:'（站在帳篷前面那個綁馬尾的人轉過來，看到你。）'},
      {speaker:'heroine_05',expression:'surprised',text:'學弟？'},
      {speaker:'heroine_05',expression:'neutral',text:'這我直屬學弟，我來跟他講。'},
      {label:'common'},{speaker:'學長',text:'喔，學弟，她是我們前任社長。'},
      {speaker:'heroine_05',expression:'neutral',text:'以前的事了啦。我現在大四，在準備研究所，已經不是社長了。'},
      {speaker:'heroine_05',expression:'smile',text:'不過法服真的很不錯。每兩個禮拜會有一個禮拜六有法律服務，民眾會來問問題，學長姐會帶你。'},
      {speaker:null,text:'（你直接拿起報名表寫了名字。）'},
      {speaker:'heroine_05',expression:'smile',text:'這麼快？……好啊，歡迎。'} ],
    consequences:{flags:{SIS_CLUB_EXPO:true,lawclub:true,CLUB_lawclub_study:true}},
    after:(G,GM)=>{ if(G.flags._EXPO_MERGED){ delete G.flags._EXPO_MERGED; if(GM.rel) GM.rel('sis',3); } } },
  { id:'ev_noodle_yutong', title:'阿鳳麵店', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:5, once:true, prereq:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, background:'blur',   /* AA_186 第 6 節 A（AA-B 19:1x：不改字的修正照做）：只演一次——原本 cooldown 2 天，每兩天重演一次初見、擋掉她的閒聊階梯 */
    dialogue:[ {speaker:'heroine_03',expression:'surprised',text:'……你？'},{speaker:'heroine_03',expression:'neutral',text:'這是我阿姨的店。二、四晚上我來幫忙。'},{if:{memory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'}]},speaker:'heroine_03',expression:'smile',text:'說好要還你一把傘，我還沒買。你還記得那天嗎？雨大到看不見校門。'},{if:{memory:[{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'smile',text:'你的傘我帶來了，放在櫃台後面。……那天你到底有沒有淋濕？'},{if:{notMemory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'},{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'neutral',text:'很少在這裡看到你。你都幾點吃飯？'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:null,text:'（她把手機推過來。）'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'傘的事。……你的聯絡方式。'},{if:{events:['ev_rain_library_door'],memory:[{npc:'heroine_03',tag:'HELPED'}]},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'我還你傘的時候要找你。',consequences:{contact:'heroine_03'}},{if:{events:['ev_rain_library_door']},unless:{custom:G=>(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03'))||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','HELPED'))},speaker:'heroine_03',expression:'neutral',text:'下次下雨的時候找你。',consequences:{contact:'heroine_03'}},{choice:[{text:'「乾麵，加滷蛋。」',consequences:{rel:{heroine_03:{fam:3,comf:2}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL',note:'她端來的乾麵'}],money:-75,energy:20,advance:0.5}},{text:'「妳阿姨的店？那妳從小就在公館？」',consequences:{rel:{heroine_03:{fam:4,trust:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'她從小在麵店長大'}]},goto:'family'},{text:'「今天忙嗎？我改天再來。」',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{goto:'end'},{label:'family'},{speaker:'heroine_03',expression:'thinking',text:'嗯。我媽身體不太好，我阿姨一個人顧不來。'},{speaker:'heroine_03',expression:'neutral',text:'這個我從小就做了。……乾麵？要不要加蛋？'},{speaker:'player',text:'好，加蛋。'},{set:{},rel:{heroine_03:{comf:3}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL'}],advance:0.5},{label:'end'},{speaker:'heroine_03',expression:'smile',text:'慢慢吃。碗放著就好。'} ] },
  // ────────────────────────────────────────── 芷若：咖啡廳店員／通識課
  { id:'ev_cafe_barista_zhiruo', title:'兩點半的店員', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:5, cooldown_days:1, background:'blur',
    prereq:{custom:G=>!(typeof STORY!=='undefined'&&STORY.zrNoShift&&STORY.zrNoShift(G))},   /* AA_375 第 1 項：2027-06-04～09-02 她不上班（在 Café 是客人），和她說話不是點餐 */
    /* 芷若 Z1（BB_95 2-2，交接包 v1，2026-10-14）：點餐次數 CAFE_VISITS（每次點餐 +1；BB_90 芷若支線用同一個）。
       第 1 次才自我介紹（「林芷若，外文二」只說這一次）；已經在經原分組（ev_zhiruo_ge_group）認識的，第 1 次也不說名字；第 2～4 次「老樣子？」（SHARED_SECRET 的開場優先）；
       第 5 次起不問、直接做第一次點的東西（zhiruoFirstOrder；第一次點的東西也寫在 SHARED_MEAL 的備註）；第 5 次給集點卡和店裡的聯絡方式（加了：zhiruoShopContactDay，手機 4-2 照這一天排）。
       舊存檔（點過、沒有計數）：讀檔時補成 1（game3d.js 的 migrate）。
       好朋友以上（SOCIAL.friendLevel＝CLOSE_FRIEND）：點餐之後多一句旁白「紙杯上多了一行字……」——AA_207 §3-3：只有第一次（還沒有 zhiruoCupNote）一定出，之後每次 ZR_CUP_NOTE_P（十分之一）的機率；（BB_120 1-2「固定的改變：點單」，2026-10-14 和 LAWWW 對齊：開場照 Z1、不另寫一套）；
       她只寫場景、不寫台詞原文；記 zhiruoCupNote（尾聲桌上「芷若寫字的紙杯」從這裡開始）。*/
    dialogue:[ {if:{flagNum:{CAFE_VISITS:{max:0}}},unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'歡迎光臨——喔，法律系的？要喝什麼，慢慢看。'},{if:{flagNum:{CAFE_VISITS:{max:0}},memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'啊，經原那組的。今天喝什麼？'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'又來了。今天要「老樣子」嗎？我記得你的。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}}},unless:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'老樣子？'},{if:{flagNum:{CAFE_VISITS:{min:4}}},goto:'auto'},{choice:[{text:'「拿鐵。妳怎麼知道我是法律系？」',consequences:{rel:{heroine_02:{fam:4,comf:2}},money:-120,energy:10,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'拿鐵'}},goto:'how'},{text:'「手沖。妳推薦哪一支？」',consequences:{rel:{heroine_02:{fam:4,resp:3}},money:-150,energy:12,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'手沖'}},goto:'rec'},{text:'「檸檬塔。然後——妳是外文系的？」',unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},consequences:{rel:{heroine_02:{fam:5,trust:3}},money:-110,energy:14,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'檸檬塔'}},goto:'dept'},{text:'「只是看看。」',consequences:{rel:{heroine_02:{fam:1}}},end:true}]},{goto:'end'},{label:'how'},{speaker:'heroine_02',expression:'smile',text:'你背包上的識別證。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文系的。這裡平日晚上都在，一、三、五中午也在。你想念書的話，窗邊那桌最安靜。'},{goto:'end'},{label:'rec'},{speaker:'heroine_02',expression:'thinking',text:'今天的是衣索比亞，有點像……早場電影散場、走出戲院的那種早上。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。外文系的，看太多電影。林芷若。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。'},{goto:'end'},{label:'dept'},{speaker:'heroine_02',expression:'surprised',text:'……你怎麼知道？'},{speaker:'player',text:'櫃台後面那本《電影理論》。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'好，你贏了。林芷若，外文系的。要不要一起修下學期的「法律與電影」？聽說老師會放一部陪審團吵一整晚的老片。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'好，你贏了。要不要一起修下學期的「法律與電影」？聽說老師會放一部陪審團吵一整晚的老片。'},{set:{zhiruo_film_invite:true},mem:[{npc:'heroine_02',tag:'INVITED_CLUB',note:'邀你修法律與電影'}]},{goto:'end'},
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
      {label:'treat_wrong'},{consequences:{money:-120}},{speaker:null,text:'她笑出來：'},{speaker:'heroine_02',expression:'laugh',text:'我不喝這個啦。'},{speaker:'heroine_02',expression:'smile',text:'……算了，謝謝。我喝。'},
      {label:'after_treat'},{call:(G,GM)=>typeof FAV!=='undefined'&&FAV.cafe?FAV.cafe(GM):null},   /* 子晴在店裡：12～2 月看到她的杯子、也幫她點（AA_410，src/foodfav3d.js）*/
      {if:{custom:G=>G.flags.Z5_NEXT==='mine'&&!G.flags.Z5_MINE_ASKED&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},set:{Z5_MINE_ASKED:true},speaker:'heroine_02',expression:'smile',text:'你挑好了嗎？'},{if:{custom:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&SOCIAL.friendLevel('heroine_02')==='CLOSE_FRIEND'&&(!G.flags.zhiruoCupNote||Math.random()<ZR_CUP_NOTE_P)},set:{zhiruoCupNote:true},speaker:null,text:'（紙杯上多了一行字，寫的是一部電影裡的一個場景。）'},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'拿鐵'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了拿鐵'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'手沖'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了手沖'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'檸檬塔'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了檸檬塔'}]},{speaker:'heroine_02',expression:'smile',text:'杯子放著就好，慢慢來。'} ] },
  /* AA_120 7-5 第 3 項（BB 2026-10-13 的最小改字；已知資訊矛盾）：芷若的經原在週五、和祐廷同一堂，週二、週四在傅鐘附近是剛下外文系的課。經原那個選項要有 Z2（ev_zhiruo_ge_group）之後才有 */
  /* AA 2026-10-13 P1-2：傅鐘這段是「已經認識」的日常（她直接講下課的事），要先見過芷若（兩點半或經原分組）；沒見過時在傅鐘找她說話只有旁白（story3d.js 的 talkCharacter），也不會變成第一次見面 */
  { id:'ev_zhiruo_bell', title:'傅鐘旁邊', participants:['heroine_02'], location:'campus', trigger:'interact', priority:3, cooldown_days:1, prereq:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'smile',text:'剛下外文系的課。今天一句詩翻了一整堂。'},{choice:[{text:'「週五的經原，妳聽得懂供給曲線嗎？」',if:{events:['ev_zhiruo_ge_group'],custom:G=>typeof STORY!=='undefined'&&!!STORY.termAt&&STORY.termAt(G.day)==='Y1S1'},consequences:{rel:{heroine_02:{fam:3,comf:3}}},goto:'ge'},{text:'「妳上完課都在這裡發呆？」',consequences:{rel:{heroine_02:{fam:3}}}},{text:'「妳的交換申請交了嗎？」',if:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},unless:{events:['ev_zhiruo_applied']},consequences:{rel:{heroine_02:{trust:4}}},goto:'ex'}]},{speaker:'heroine_02',expression:'smile',text:'對啊。下一堂三點，懶得走。'},{goto:'end'},{label:'ge'},{speaker:'heroine_02',expression:'smile',text:'圖我看得懂啦，是老師講太快。'},{speaker:'heroine_02',expression:'neutral',text:'上週那張圖我只抄到一半，下次借我看。'},{goto:'end'},{label:'ex'},{speaker:'heroine_02',expression:'embarrassed',text:'……還沒。你不要每次都問這個。'},{speaker:'heroine_02',expression:'serious',text:'我會交。這週。大概。'},{mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'催她交交換申請'}]},{label:'end'} ] },
  /* 芷若 Z4「十點的電話」（BB_96 3-4，交接包 v2；原本的「週末的咖啡廳」改寫）：原本在 Café 週末——她週末不在 Café（週六 14–18 在溫州街），走不到；
     也拿掉企劃組禁用的「我跟你講一件事，你不要跟別人說」、「家裡的事比較重要吧」的 comf:-3（不扣分）。改成大一下第 12 週以後的週六 14～18、溫州街、有點熟以上、只一次。
     交往中：台詞照舊（週六下午街上的偶遇，朋友之間講家裡的事），第一個選項只有 trust:8（沒有 aff）。三個選項都記 SHARED_SECRET（note 不同）＋ Z4_PICK（大二 Z7 回來講第三個選項那一句）*/
  /* 芷若 Z3「妳自己喝什麼」（BB_96 3-1，交接包 v2）：大一下第 3 週起的平日 21:40～22:00（她晚班到 22:00）、Café、和她有點熟以上、只一次。交往中也一樣（店員和客人）。
     店裡只剩祐廷：其他客人 21:40 起身走出去、21:40～22:00 不生成（story3d.js 的 S.z3Pending）；還有客人沒走、或有人跟著你（同行、邀約）時不開始（S.cafeOthers），那天就是平常的點餐。
     沒有選項（問出那一句就是選擇）。「你是——」不說完。記憶 ASKED_HER_DRINK 的名稱、備註、手機筆記、人物資料都不寫她喝什麼（驗收；tests/v2_bb96_z3_unit.js 檢查）。
     表情：surprised →（停久一點）neutral → embarrassed → smile。之後的點餐多一個「也幫芷若點一杯」（ev_cafe_barista_zhiruo 的 treat）*/
  /* AA_207 #4（AA_313 6-5 第 6 點）：「我在這裡兩年」「你室友還活著嗎」「半夜的阿凱」只在大一（term Y1S1、Y1S2；大二阿凱不是室友）*/
  { id:'ev_zhiruo_own_drink', title:'妳自己喝什麼', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:8, once:true, weekday:[1,2,3,4,5], time:[21+40/60,22], term:['Y1S1','Y1S2'],
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
      {speaker:'heroine_02',expression:'embarrassed',text:'很怪吧。'},{speaker:'heroine_02',expression:'smile',text:'加一點苦的，比較不會那麼甜。'},
      {speaker:'heroine_02',expression:'smile',text:'……不要笑。'} ],
    consequences:{mem:[{npc:'heroine_02',tag:'ASKED_HER_DRINK',note:'她下班前'}]} },
  { id:'ev_zhiruo_secret', title:'十點的電話', participants:['heroine_02'], location:'wenzhou', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[11,12,13,14,15], weekday:[6], time:[14,18], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'neutral',text:'週六我都在溫州街。這裡的人不會問我週末在幹嘛。'},
      {speaker:'heroine_02',expression:'thinking',text:'交換的申請，我拖了兩個月。不是懶。'},
      {speaker:'heroine_02',expression:'neutral',text:'我媽每天晚上十點打給我。講店裡的事。'},
      {speaker:'heroine_02',expression:'neutral',text:'誰來印考卷、哪一台又卡紙。'},
      {speaker:'heroine_02',expression:'thinking',text:'我去英國的話，那邊是下午三點。'},
      {speaker:'heroine_02',expression:'neutral',text:'……她十點要打給誰？'},
      {choice:[{text:'「妳想去嗎？」',unless:GF('heroine_02'),set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8,aff:3}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「妳想去嗎？」',if:GF('heroine_02'),set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「先交件再說，錄取了再煩惱。」',set:{Z4_PICK:'apply'},consequences:{rel:{heroine_02:{trust:5,resp:4}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：先交件再說'}]},goto:'do'},
        {text:'「家裡的事比較重要吧。」',set:{Z4_PICK:'family'},consequences:{rel:{heroine_02:{trust:2}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你說家裡的事比較重要'}]},goto:'fam'}]},
      {label:'want'},{speaker:null,text:'她沉默很久。'},{speaker:'heroine_02',expression:'neutral',text:'……想。'},{speaker:null,text:'她用手指捲頭髮，捲了三圈。'},{speaker:'heroine_02',expression:'smile',text:'好可怕。說出來就變成真的了。'},{goto:'end'},
      {label:'do'},{speaker:'heroine_02',expression:'smile',text:'你講得好簡單喔。'},/* AA_209 附錄B §2 */{speaker:null,text:'她笑了。'},{speaker:'heroine_02',expression:'smile',text:'……可是你說得對。'},{goto:'end'},
      {label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'嗯。'},{speaker:null,text:'她點頭。'},{speaker:'heroine_02',expression:'neutral',text:'我也這樣跟自己說了兩個月。'},
      {label:'end'} ] },
  // ────────────────────────────────────────── 子晴：室友的同學、吉他社
  { id:'ev_zhiruo_ge_final', title:'期末的短片', participants:[], location:['dorm','campus','putong'], trigger:'enter', term:['Y1S1'], once:true, prereq:{flags:['ge_group_zhiruo'],custom:G=>{ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=16; }}, background:'freeze',   /* BB_95 2-4 期末：旁白一行帶過（AA_108 第 4 節 #27：不排「第一個」）；16 週制：期末週＝第 16 週（原本第 18 週，AA_198 大一上「必搬」）*/
    dialogue:[ {speaker:null,text:'三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'} ] },
  { id:'ev_kai_mentions_ziqing', title:'室友的同學', participants:['kai'], location:'dorm', trigger:'interact', priority:6, once:true, minWeek:{term:'Y1S1',week:4},   /* BB_170 第 18 列：改看週次（第 4 週起；原本 day_min 6）。BB_95 2-3：落在第 4 週（9/22 週一＝第 6 天），社團博覽會（第 5 週）之前；台詞全部保留 */ time:[18,26], prereq:{notMemory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* 已經認識子晴就不用轉述（BB 6-1）*/
    dialogue:[ {speaker:'kai',expression:'smile',text:'欸，我們系有個學姊，高子晴，吉他社的。她說社團缺人，問我有沒有朋友想來。'},{speaker:'kai',expression:'neutral',text:'我說我室友法律系，她說什麼系都可以，來吃東西也行。'},{choice:[{text:'「什麼時候？」',consequences:{flags:{guitar_invite:true},rel:{heroine_04:{fam:2}},goal:'吉他社：第 5 週起，週一、週三 19:00，萬才館一樓多功能教室'},goto:'when'},{text:'「我不會彈吉他。」',consequences:{flags:{guitar_invite:true}},goto:'no'},{text:'「你去就好。」',consequences:{rel:{kai:{fam:-1}}},end:true}]},{label:'when'},{speaker:'kai',expression:'smile',text:'第五週開始，週一、週三晚上七點，在萬才館一樓的多功能教室。她說不用會彈。'},{goto:'end'},{label:'no'},{speaker:'kai',expression:'laugh',text:'她說一年級的沒有人會。週一、週三晚上七點，萬才館。'},{label:'end'} ] },
  /* AA_110 6-8 (a)（AA 暫定）：還沒認識子晴的玩家第一次去吉他社社課，社課一開始自動播這一段的初遇（classes3d.js 的 clubEvent）；之後玩家自己去找她才播「又來了」，最多一週一次（冷卻 1 → 7 天）；
     「阿凱說妳系上第一名」那個選項寫 ARGUED_ABOUT_CAREER（她的劇情點）：整個存檔只出現一次。台詞不動。 */
  { id:'ev_ziqing_club', title:'吉他社', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:5, cooldown_days:7, background:'blur',
    dialogue:[ {if:{flags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'你是阿凱的室友？法律系那個？'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'laugh',text:'欸！你真的來了！'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'smile',text:'學姊，他是我拉來的。'},   /* AA_156 1-2：Alison 在社課（作息）、只有 Alison 的入口才說；子晴的台詞一字不動 */
      {if:{notFlags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'新人？……法律系的？坐那邊，零食自己拿。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'laugh',text:'我高子晴，資工系的。先講好：我們社團沒有人會彈，都是來吃東西的。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'neutral',text:'今天系上有程式比賽，一半的人跑去了，所以人很少。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},stamp:['guitarFirstDay']},{if:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'又來了。今天要學 C 和弦還是要吃洋芋片？'},{choice:[{text:'「教我一個和弦。」',consequences:{rel:{heroine_04:{fam:5,comf:3}},mem:[{npc:'heroine_04',tag:'INVITED_CLUB'}],energy:-4,advance:1},goto:'chord'},{text:'「上次那個程式比賽，妳怎麼沒去？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},unless:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]},consequences:{rel:{heroine_04:{fam:3}},mem:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER',note:'問她為什麼不比賽'}]},goto:'why'},{text:'「妳們平常都在幹嘛？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'what'}]},{label:'chord'},{speaker:'heroine_04',expression:'laugh',text:'手指這樣——不對，那是 F，你會痛死。C。壓好。'},{speaker:null,text:'一個小時後你會了一個和弦，還有手指上兩條紅痕。'},{goto:'end'},{label:'why'},{speaker:'heroine_04',expression:'serious',text:'因為大家都覺得我該去。我爸最覺得。'},{speaker:'heroine_04',expression:'neutral',text:'我週末不想再寫程式給評審看。'},{speaker:'heroine_04',expression:'smile',text:'C 和弦再按一次。手指不要放。'},{goto:'end'},{label:'what'},{speaker:'heroine_04',expression:'smile',text:'吃東西、彈錯、笑別人彈錯。成發的時候你負責拍手就好。'},{label:'end'} ] },
  // ────────────────────────────────────────── 溫學姊：法服讀書會（刑訴）＋ 法研所
  /* AA_110 6-8 (a)（AA 暫定）：這個事件就是法服讀書會本身——時間對齊活動（週三 19:00，原本 18:48）、地點研討室 A：玩家在研討室 A 門口參加讀書會（ACTIVITIES 的 lawclub_study）時
     第一次播整段（classes3d.js 的 clubEvent；trigger 'activity'＝不會因為走進萬才館就自己開始），第二次以後只有旁白＋題庫兩三題。學姊研究計畫那段（GRAD_SCHOOL_DISCUSSION）只有一次。台詞不動。 */
  { id:'ev_studygroup_wed', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'法服讀書會', participants:['heroine_05','classmate_bohan'], location:'wancai', trigger:'activity', weekday:[3], time:[19,21], cooldown_days:6, prereq:{flags:['lawclub']}, background:'blur', player_seat:null,
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）學姊每次都說沒關係，然後每次都點人。'},{legal:{context:'study',by:'heroine_05',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'thinking',text:'（舉手，停了一下）……我們為什麼要背這個？'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'smile',text:'（笑）好。這是一個答案。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'heroine_05',expression:'neutral',text:'……好問題。下週回答。'},{unless:{flags:['PEISHAN_ASKED_WHY']},set:{PEISHAN_ASKED_WHY:true,peishanAskedNow:true},stamp:['peishanAskedDay']},{legal:{context:'study',by:'heroine_05',pick:{section:'訊問、自白、緘默權'}}},{legal:{context:'study',by:'heroine_05',pick:{}}},{speaker:'heroine_05',expression:'tired',text:'今天先到這裡。……我二月要交大專生研究計畫。你們大三就會知道那是什麼東西。'},{choice:[{text:'「研究計畫是什麼？」',consequences:{grad:{bump:'學姊提到研究計畫',field:'公法'},rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「學姊為什麼想念研究所？」',consequences:{grad:{bump:'問學姊為什麼念研究所'},rel:{heroine_05:{trust:4}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'why'},{text:'（收書包）',consequences:{rel:{heroine_05:{fam:1}}},goto:'end'}]},{label:'grad'},{speaker:'heroine_05',expression:'serious',text:'一份你想研究什麼、為什麼、怎麼做的文件。教授看那個決定要不要你。'},{speaker:'heroine_05',expression:'thinking',text:'大部分人寫不出「為什麼」。'},{goto:'end'},{label:'why'},{speaker:'heroine_05',expression:'thinking',text:'……這個問題最近有人問我第三次了。'},{speaker:'heroine_05',expression:'neutral',text:'以前我會說「因為我對公法有興趣」。現在我會說：先不要問我。'},{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'她不確定為什麼念研究所'}]},{label:'end'},{speaker:null,text:'散會時，學姊把你的筆記還給你，裡面夾了一張便條：「一，論點不清。二，引用錯頁。三，字太醜。」'},{if:{flags:['peishanAskedNow']},unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。法律一。剛剛那個問題是我問的。',meet:'classmate_peishan'},{set:{peishanAskedNow:false},stamp:['studyGroupFirstDay']} ],   /* BB_95 2-5：沛珊 P1（第一次一起出席；PEISHAN_ASKED_WHY 給 ev_studygroup_p1b）、F-W1 便條、散會後 22:30 讀書會群組的訊息（phoneRules）；「大專生研究計畫」的時程需查證 */
    consequences:{mem:[{npc:'heroine_05',tag:'STUDIED_TOGETHER',note:'法服讀書會'},{npc:'classmate_bohan',tag:'STUDIED_TOGETHER'}],rel:{classmate_bohan:{fam:4}},advance:1.5,energy:-8,memo:'參加了法服讀書會（刑訴）'} },
  // ────────────────────────────────────────── 林教授：刑事訴訟法（週二 10:20）
  { id:'ev_class_crimpro', retired:'AA_376 #2（企劃線 69aa3b0c，AA 定）：v7 舊課堂，課表系統已經有刑訴（9:10 開始）；沒有 once、每週二重演（期中考當天、第 9 週沒課也演）——停用，定義留給舊存檔', term:['Y3S1'], minWeek:{term:'Y3S1',week:2}, title:'刑事訴訟法', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], cooldown_days:6, background:'freeze', mainSide:'right', player_seat:[1,3],
    dialogue:[ {speaker:null,text:'霖澤館二樓。林教授把判決影本放在講台上，聲音不大，但沒有人講話。'},{speaker:'prof_lin',expression:'neutral',text:'「上週我們談了刑事訴訟的目的。有人以為就是『把壞人抓到』——今天我們從被告的位置看一次。」'},{legal:{context:'class',by:'prof_lin',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{speaker:'prof_lin',expression:'neutral',text:'「下一個問題比較實務。警察局的訊問室裡發生的事，法院要怎麼看？」'},{legal:{context:'class',by:'prof_lin',pick:{section:'訊問、自白、緘默權'}}},{speaker:'prof_lin',expression:'smile',text:'「這兩題會出現在期中。不是威脅，是預告。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她每學期都這樣說，然後真的出。'} ],
    consequences:{mem:[{npc:'classmate_bohan',tag:'SHARED_CLASS'},{npc:'prof_lin',tag:'SHARED_CLASS'}],rel:{classmate_bohan:{fam:3}},advance:1.7,energy:-6,memo:'上了刑事訴訟法',flags:{crimpro_attended:true}} },
  // ────────────────────────────────────────── 許教授：研究所的種子（辦公時間）
  /* AA_522 第 2 節（企劃線 fcc93126e，AA-C 定稿；NPC-STORY2-1028）：照祐廷的年級（SOCIAL.playerYear，放假照上一個學期；大五算大四）——第一次見面的自我介紹、之後的招呼、題目都照年級。
     每題問一次（記 XU_ASKED＝{年級:[題]}；舊存檔：大一那兩題有 prof_xu 的 GRAD_SCHOOL_DISCUSSION／book_xu 筆記＝問過），那一年的問題問完就不觸發，下一年有新的。
     地點、冷卻照舊（萬才館，3 天）。大三「溫書瑀學姊是老師的學生？」要認識學姊。許教授只講讀法、比較法、研究所，不講實體法。新題目的教授紀錄照現有的辦公時間題（office +2）。
     第 8 節（f36dfe3cf）：他每週一 14:00～16:00 在萬才館，四個年級都在（story3d.js 的 S.PROF_OFFICE；上他課的那幾天下課後照現有）；和學姊交往中，大三那一題換「學姊的論文，老師覺得怎麼樣？」*/
  ...(()=>{ const XY=G=>Math.max(1,Math.min(4,typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear()|0:1)),
      XQ={1:['grad','book'],2:['germany','long'],3:['grad3','sis'],4:['judg']},
      xAsked=(G,y,k)=>{ const A=G.flags&&G.flags.XU_ASKED, L=A&&typeof A==='object'&&Array.isArray(A[y])?A[y]:[]; if(L.includes(k)) return true;
        if(y===1&&k==='grad') return typeof SOCIAL!=='undefined'&&SOCIAL.has('prof_xu','GRAD_SCHOOL_DISCUSSION'); if(y===1&&k==='book') return Array.isArray(G.notes)&&G.notes.some(n=>n&&n.id==='book_xu'); return false; },
      xOk=k=>k!=='sis'||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FIRST_MET')),   /* 認識學姊才有 */
      xCan=(G,k)=>{ const y=XY(G); return (XQ[y]||[]).includes(k)&&xOk(k)&&!xAsked(G,y,k); },
      xLeft=G=>{ const y=XY(G); return (XQ[y]||[]).filter(k=>xOk(k)&&!xAsked(G,y,k)).length; },
      xMark=(G,k)=>{ const y=XY(G), F=G.flags; if(!F.XU_ASKED||typeof F.XU_ASKED!=='object') F.XU_ASKED={}; const L=Array.isArray(F.XU_ASKED[y])?F.XU_ASKED[y]:(F.XU_ASKED[y]=[]); if(!L.includes(k)) L.push(k); },
      MET=y=>({memory:[{npc:'prof_xu',tag:'FIRST_MET'}],custom:G=>XY(G)===y}), CU=f=>({custom:f}), UN={memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},
      GSD={memory:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]};
    return [
  { id:'ev_prof_xu_office', title:'許教授', participants:['prof_xu'], location:'wancai', trigger:'interact', priority:5, cooldown_days:3, background:'blur', prereq:{custom:G=>xLeft(G)>0},
    dialogue:[ {unless:UN,if:CU(G=>XY(G)===1),speaker:'prof_xu',expression:'neutral',text:'一年級的？我是許志遠，教行政法，你們大二會遇到我。'},{unless:UN,if:CU(G=>XY(G)===2),speaker:'prof_xu',expression:'neutral',text:'許志遠。行政法是我教的。……你坐在哪一排？'},{unless:UN,if:CU(G=>XY(G)>=3),speaker:'prof_xu',expression:'neutral',text:'許志遠。教公法的。你們這屆我教過。'},
      {if:MET(1),speaker:'prof_xu',expression:'neutral',text:'又是你。有問題？'},{if:MET(2),speaker:'prof_xu',expression:'neutral',text:'行政法的學生。有問題？'},{if:MET(3),speaker:'prof_xu',expression:'neutral',text:'大三了，民訴、刑訴都很重。還來？'},{if:MET(4),speaker:'prof_xu',expression:'neutral',text:'快畢業了。有問題？'},
      {choice:[{text:'「老師，法研所是在做什麼的？」',if:CU(G=>xCan(G,'grad')),consequences:{grad:{bump:'問許教授法研所'},prof:{prof_xu:{kind:'office',delta:2,note:'問法研所'}},mem:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「老師推薦一本一年級可以讀的書嗎？」',if:CU(G=>xCan(G,'book')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'book_xu',title:'許教授推薦的書','body':'《法學方法論》入門——「先學會問問題，再學答案」。'}},goto:'book'},
        {text:'「老師上課一直講德國，為什麼？」',if:CU(G=>xCan(G,'germany')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問比較法'}}},goto:'germany'},{text:'「行政法的考試為什麼那麼長？」',if:CU(G=>xCan(G,'long')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問考試'}}},goto:'long'},
        {text:'「大三要開始想研究所了嗎？」',if:CU(G=>xCan(G,'grad3')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問研究所'}}},goto:'grad3'},{text:'「溫書瑀學姊是老師的學生？」',if:CU(G=>xCan(G,'sis')),unless:{flags:['dating_heroine_05']},consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問學姊'}}},goto:'sis'},
        {text:'「學姊的論文，老師覺得怎麼樣？」',if:{flags:['dating_heroine_05'],custom:G=>xCan(G,'sis')},consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問學姊的論文'}}},goto:'sisd'},   /* AA_522 第 8 節第 2 點（f36dfe3cf）：和學姊交往中，大三那一題換這個問法（同一題：記 sis，問過一種就不再出另一種）；沒交往、認識她的照上一個 */
        {text:'「判決要從哪裡開始讀？」',if:CU(G=>xCan(G,'judg')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問判決'}}},goto:'judg'},{text:'「沒事，路過。」',end:true}]},
      {label:'grad'},{call:G=>xMark(G,'grad')},{speaker:'prof_xu',expression:'thinking',text:'「讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。」'},{speaker:'prof_xu',expression:'smile',text:'「你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。」'},{goto:'end'},{label:'book'},{call:G=>xMark(G,'book')},{speaker:'prof_xu',expression:'neutral',text:'「先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。」'},{goto:'end'},
      {label:'germany'},{call:G=>xMark(G,'germany')},{speaker:'prof_xu',expression:'neutral',text:'我們很多制度是從那邊學來的。'},{speaker:'prof_xu',expression:'thinking',text:'看別人怎麼想同一個問題，比較看得出自己的問題在哪。'},{goto:'end'},
      {label:'long'},{call:G=>xMark(G,'long')},{speaker:'prof_xu',expression:'neutral',text:'因為行政法本來就長。'},{speaker:'prof_xu',expression:'smile',text:'……我出題目的時候，也覺得太長。'},{goto:'end'},
      {label:'grad3'},{call:G=>xMark(G,'grad3')},{speaker:'prof_xu',expression:'thinking',text:'想，但不要急著決定。'},{if:GSD,speaker:'prof_xu',expression:'neutral',text:'你大一來的時候，我說過：哪堂課讓你下課還在想，記得那是什麼課。……現在是哪一門？'},{unless:GSD,speaker:'prof_xu',expression:'neutral',text:'哪堂課讓你下課還在想，記得那是什麼課。……現在是哪一門？'},{speaker:null,text:'（你想了一下，說了一門課。他點點頭，沒有追問。）'},{goto:'end'},
      {label:'sis'},{call:G=>xMark(G,'sis')},{speaker:'prof_xu',expression:'neutral',text:'她是我指導的。'},{speaker:'prof_xu',expression:'neutral',text:'她的題目，讓她自己跟你說。'},{goto:'end'},
      {label:'sisd'},{call:G=>xMark(G,'sis')},{speaker:'prof_xu',expression:'neutral',text:'這個問題，你應該問她。'},{speaker:'prof_xu',expression:'neutral',text:'……她自己知道寫得好不好。'},{goto:'end'},
      {label:'judg'},{call:G=>xMark(G,'judg')},{speaker:'prof_xu',expression:'neutral',text:'從事實。很多人跳過事實，直接讀理由。'},{speaker:'prof_xu',expression:'neutral',text:'那樣讀，看不懂法官為什麼那樣寫。'},
      {label:'end'} ] } ]; })(),
  // ────────────────────────────────────────── 熟同學：小事件
  { id:'ev_xinci_notes', title:'借筆記', participants:['classmate_xinci'], location:['classroom','library'], trigger:'interact', priority:4, once:true, term:['Y1S1'], cooldown_days:3, background:'blur', minWeek:{term:'Y1S1',week:7},   /* AA_195 4-7 A9：交接包 v1 的位置（「我上週民總請假」）。AA_372 第 3 項：一次性的事件，只演一次、限大一上（原本每 3 天重演，大一下以後還在說「上週民總請假」；舊存檔演過的不再演）*/
    dialogue:[ {unless:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]},speaker:'classmate_xinci',expression:'neutral',text:'你是……周老師點過的那個？我吳芯慈。同班。'},{speaker:'classmate_xinci',expression:'thinking',text:'我上週民總請假，你筆記可以借我看一下嗎？我明天還你。'},{choice:[{text:'「可以，給。」',consequences:{rel:{classmate_xinci:{fam:5,trust:4}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},goto:'yes'},{text:'「我的筆記很亂，妳確定？」',consequences:{rel:{classmate_xinci:{fam:3}}},goto:'messy'},{text:'「不太方便，我自己要用。」',consequences:{rel:{classmate_xinci:{fam:1,trust:-2}},mem:[{npc:'classmate_xinci',tag:'REFUSED_HELP'}]},goto:'no'}]},{label:'yes'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。……我會重新排版再還你，你不要介意。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'messy'},{speaker:'classmate_xinci',expression:'laugh',text:'越亂越好，我喜歡整理。'},{rel:{classmate_xinci:{fam:2,trust:2}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'no'},{speaker:'classmate_xinci',expression:'neutral',text:'好。沒關係。'},{speaker:null,text:'她轉向另一個同學。你不確定她有沒有把這件事記下來。'},{label:'end'} ] },
  /* 交接包 v1 A5 的週次：第 7 週（期中考前）起才問考古題（v1 稽核：原本沒有週次限制）*/
  { id:'ev_bohan_kaogu', title:'考古題', participants:['classmate_bohan'], location:['library','classroom'], trigger:'interact', priority:4, once:true, term:['Y1S1'], cooldown_days:2, background:'blur', minWeek:{term:'Y1S1',week:7},   /* AA_372 第 3 項：只演一次、限大一上 */
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。你有周老師前年的考古題嗎？'},{if:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'你來得正好。我在看刑總的題目，有一題我跟班上的芯慈吵了半小時。'},{speaker:'classmate_bohan',expression:'thinking',text:'……我覺得我念得太少。你一天念幾小時？'},{choice:[{text:'「兩、三小時吧。」',consequences:{rel:{classmate_bohan:{fam:3,comf:2}}}},{text:'「看心情。」',consequences:{rel:{classmate_bohan:{fam:2,resp:-1}}}},{text:'「你已經是全班最認真的了。」',consequences:{rel:{classmate_bohan:{fam:4,trust:3}},mem:[{npc:'classmate_bohan',tag:'HELPED',note:'安慰他'}]}}]},{speaker:'classmate_bohan',expression:'neutral',text:'嗯。……好。'} ] },
  /* 沛珊 P2：為什麼念法律（BB_95 第 2-8 節完整版；使用者 2026-10-14 解除大一上交接包暫緩、AA 轉達）：只發生一次（once）；第一個選項換成 BB 寫好的（祐廷念法律是自己選的）；結尾不再用模板句、三個分支各說一次；週三晚上在萬才館（讀書會那天）才提讀書會。三個選項的數值、選項三的記憶照舊（記憶的備註照 BB_95 改成「她在想別的路」）*/
  { id:'ev_peishan_doubt', title:'為什麼念法律', participants:['classmate_peishan'], location:['library','wancai','campus'], trigger:'interact', priority:4, once:true, cooldown_days:3, background:'blur', minWeek:{term:'Y1S1',week:6},   /* BB_170 第 10 列：第 6 週起（BB_95 一覽表）；沒去宿營的玩家這裡是認識她的備用入口 */
    dialogue:[ {unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。'},{speaker:'classmate_peishan',expression:'thinking',text:'欸，你為什麼會來念法律？……除了考上以外。'},{choice:[{text:'「我想知道事情『應該』怎麼處理。」',consequences:{rel:{classmate_peishan:{fam:3,comf:3}}},goto:'should'},{text:'「想幫人。」',consequences:{rel:{classmate_peishan:{fam:3,resp:2}}},goto:'help'},{text:'「妳呢？」',consequences:{rel:{classmate_peishan:{fam:4,trust:3}},mem:[{npc:'classmate_peishan',tag:'IMPORTANT_CONVERSATION',note:'她在想別的路'}]},goto:'her'}]},{label:'should'},{speaker:'classmate_peishan',expression:'thinking',text:'應該喔。……那是誰決定什麼叫應該？老師嗎？'},{goto:'end'},{label:'help'},{speaker:'classmate_peishan',expression:'thinking',text:'幫人喔。……可是社工系也可以幫人吧？'},{goto:'end'},{label:'her'},{unless:{custom:G=>PS_DOUBT_Y1S2(G)||PS_DOUBT_Y2(G)},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這一個多月都自在。'},{if:{custom:PS_DOUBT_Y1S2},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這半年都自在。'},{if:{custom:PS_DOUBT_Y2},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在霖澤館這一年多都自在。'},{speaker:'classmate_peishan',expression:'neutral',text:'……我還沒跟家裡說。'},{text:'她停了一下。'},{speaker:'classmate_peishan',expression:'thinking',text:'好奇怪。講出來以後，聲音比我想的還大。'},{label:'end'},{text:'她把書包背起來。'},{unless:{custom:G=>G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我要去上課了。'},{if:{custom:G=>G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我先回去了。'},{speaker:'classmate_peishan',expression:'smile',text:'剛剛那個問題，你想到再跟我說。'} ] },
  { id:'ev_zhe_dinner', title:'公館吃什麼', participants:['zhe'], location:['campus','gongguan'], trigger:'interact', priority:2, time:[17,20], cooldown_days:1, random_weight:0.7, background:'blur', term:['Y1S1'], once:true,   /* AA_313 5-3（AA_389 第 6 點：照逐場表）：原本沒有 once、term，四年天天同一句 */
    dialogue:[ {speaker:'zhe',expression:'smile',text:'晚餐吃什麼？我在麵店、滷味、便利商店之間掙扎二十分鐘了。'},{choice:[{text:'「麵店。」',consequences:{rel:{zhe:{fam:2}},mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'一起去麵店'}],goal:'公館 阿鳳麵店'}},{text:'「我還有東西要讀，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]}},{text:'「便利商店，快。」',consequences:{rel:{zhe:{fam:1}}}}]},{speaker:'zhe',expression:'laugh',text:'好啦。走。'} ] },
  { id:'ev_mingxuan_ball', title:'系籃', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:3, once:true, term:['Y1S1'], cooldown_days:2, background:'blur', minWeek:{term:'Y1S1',week:2}, prereq:{flags:['classDone']},   /* BB_170 第 17 列：9/4 民總以後（「他說你上課很敢講」）、第 2 週起。AA_372 第 3 項：只演一次、限大一上（原本每 2 天「欸，宿營兩人三腳那個…」）*/
    dialogue:[ {if:{flags:['MX_CAMP_PAIR']},speaker:'classmate_mingxuan',expression:'smile',text:'欸，宿營兩人三腳那個。你也來打球喔？'},{if:{custom:G=>!!G.flags.CAMP_Y1&&!G.flags.MX_CAMP_PAIR},speaker:'classmate_mingxuan',expression:'smile',text:'欸，你也來打球喔？'},   /* AA_205 6-14⑧：新局宿營同隊三天、兩人三腳沒和他一組 */
      {if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1},speaker:'classmate_mingxuan',expression:'neutral',text:'欸，你是電影那堂有選到的那個？'},{if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1&&typeof STORY!=='undefined'&&G.day<STORY.dayOfKey('2025-09-15')},speaker:'classmate_mingxuan',expression:'neutral',text:'我還在等有人退，大概沒望了。'},{if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1&&typeof STORY!=='undefined'&&G.day>=STORY.dayOfKey('2025-09-15')},speaker:'classmate_mingxuan',expression:'neutral',text:'我後來沒加到，去修別的了。'},   /* BB_168 3-1 接回來（9/15 加選截止前後兩版）；有 MX_CAMP_PAIR 只用宿營那句（BB_177 第 12 節）*/   /* BB_177 第 12 節（宿營兩人三腳和他一組）*/
      {unless:{memory:[{npc:'classmate_mingxuan',tag:'FIRST_MET'}]},speaker:'classmate_mingxuan',expression:'smile',text:'江明軒。阿哲的隊友。他說你們同班。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'週五練球缺人，來不來？不會打也可以，來當經理。'},{choice:[{text:'「好。」',consequences:{rel:{classmate_mingxuan:{fam:4,comf:3},zhe:{fam:2}},flags:{ball_invite:true}}},{text:'「我運動白痴。」',consequences:{rel:{classmate_mingxuan:{fam:2}}}},{text:'「你上課都不抄筆記喔？」',if:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'}},consequences:{rel:{classmate_mingxuan:{fam:3,trust:2}}},goto:'study'}]},{goto:'end'},{label:'study'},{speaker:'classmate_mingxuan',expression:'smile',text:'抄啊。回家就不想看了。'},{label:'end'} ] },
  // ────────────────────────────────────────── 生活小事件（auto / enter）
  { id:'ev_rain_no_umbrella', title:'下雨了', participants:[], location:'campus', trigger:'enter', weather:'rain', day_min:3, cooldown_days:2, random_weight:0.6, background:'freeze',
    dialogue:[ {speaker:null,text:'走出建築的瞬間，雨。你的傘在宿舍的桌上。'},{choice:[{text:'跑去便利商店買一把（150 元）',consequences:{money:-150,energy:-3,memo:'買了第三把傘'}},{text:'淋回去',consequences:{energy:-8,memo:'淋雨'}},{text:'在屋簷下等十分鐘',consequences:{advance:0.2}}]} ] },
  { id:'ev_library_outlet', title:'插座', participants:[], location:'library', trigger:'seat', time:[13,21],   /* 坐下才演（原本走進閱覽室就演：還沒坐下就「問旁邊的人能不能分一格」，使用者 2026-10-16）*/ day_min:3, cooldown_days:3, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'閱覽室裡每一個靠插座的位子都有人。有人把充電線拉到桌子中央，像在宣示主權。'},{choice:[{text:'問旁邊的人能不能分一格',consequences:{energy:-1},goto:'ask'},{text:'算了，用電池',consequences:{}}]},{label:'ask'},{speaker:null,text:'對方看了你一眼，把充電線往旁邊挪了三公分。'} ] },
  // ────────────────────────────────────────── 交接包 v1 第 4 批（BB_95 第 3 節：新事件）
  /* 方奕廷 F1：黃金葛（BB_95 3-1）。他平日 12–13 在校園走走（characters.js 的日程）；和他說話就觸發，只一次。植物知識需查證（BB）。
     之後：宿舍書桌旁多一盆黃金葛（POTHOS；story3d.js 的 dormItems、pothosScene：每週澆一次就夠，沒澆也不會枯，只是不長大——v1 只有一個大小）*/
  { id:'ev_fangyt_pothos', title:'黃金葛', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:6, weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur', term:['Y1S1','Y1S2'],   /* AA_376 #19：限大一（「你是隔壁房的吧」）*/
    dialogue:[ {unless:{memory:[{npc:'npc_fangyt',tag:'FIRST_MET'}]},speaker:'npc_fangyt',expression:'neutral',text:'你是住我隔壁那間的吧？我方奕廷，森林系二年級。'},{speaker:'npc_fangyt',expression:'neutral',text:'我經過的時候看到，你們房間沒有綠色的東西。'},{speaker:'npc_fangyt',expression:'smile',text:'（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'莖節會長氣根，所以可以水耕，也可以土耕，而且——'},{speaker:'npc_fangyt',expression:'neutral',text:'……總之，很好養。忘記澆也不會死。'},{speaker:'npc_fangyt',expression:'smile',text:'跟你室友一樣。'},
      {choice:[{text:'「謝謝學長。」',goto:'thanks'},{text:'「我會養死。」',goto:'die'},{text:'「你袋子裡還有幾盆？」',goto:'bag'}]},
      {label:'thanks'},{speaker:'npc_fangyt',expression:'smile',text:'不用啦。我種太多了，房間放不下。'},{goto:'end'},
      {label:'die'},{speaker:'npc_fangyt',expression:'neutral',text:'不會。我說過了，它很難死。'},{goto:'end'},
      {label:'bag'},{speaker:'npc_fangyt',expression:'laugh',text:'（笑）七盆。整層樓都要有。'},
      {label:'end'},{speaker:'npc_fangyt',expression:'neutral',text:'死掉的話傳照片給我。'} ],
    consequences:{flags:{POTHOS:true},stamp:['pothosDay'],contact:'npc_fangyt'} },   /* BB_95 4-4：送盆栽時留了聯絡方式（之後「新葉。你的。」用）*/
  /* 阿凱 K1：凌晨三點的螢幕（BB_95 3-2）。睡覺觸發（trigger:'sleep'：story3d.js 的 sleepNow 在睡著之後、天亮之前演，畫面是凌晨三點的房間）：
     大一上第 3～4 週、平日晚上、隔天早上真的有課（「你明天第一堂就有課」只在隔天有早上的課時出現：這裡直接當條件；BB 2026-10-14 把「早八」改成「第一堂」，654f5dd）、只一次。
     三個選項都會換鍵盤，不懲罰：說了＝隔天晚上（ev_kai_keyboard_quiet）；蓋棉被、戴耳塞＝一週後他自己發現（ev_kai_dark_circles），再隔天換。現有的「法無明文」（ev_dorm_late_kai）保留 */
  { id:'ev_kai_late_screen', title:'凌晨三點的螢幕', participants:['kai'], location:'dorm', trigger:'sleep', term:['Y1S1'], weeks:[2,3], weekday:[0,1,2,3,4], time:[17.5,27], once:true, background:'blur',   /* BB_170 第 8、9、20 列：住進來的前兩週＝第 2～3 週；day_min 3 換成 introDone；已經換過靜音鍵盤（K-D3／K-D5）的不再演 */
    prereq:{flags:['introDone'],notMemory:[{npc:'kai',tag:'KAI_QUIET_KEYBOARD'}],custom:G=>typeof CLS!=='undefined'&&CLS.dayItems(G,G.day+1).some(it=>!it.exam&&it.t0<12)},   /* introDone、靜音鍵盤：BB_170 */
    dialogue:[ {speaker:null,text:'凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'},{if:{flags:['DORM_FOUR']},speaker:null,text:'（阿哲已經睡了，柏翰戴著耳塞。）'},   /* 四人房（AA_208 2-4）*/
      {choice:[{text:'「阿凱，我明天第一堂有課。」',set:{kaiScreenChoice:0},goto:'said'},{text:'（翻身，用棉被蓋住頭）',set:{kaiScreenChoice:1},end:true},{text:'（戴耳塞）',set:{kaiScreenChoice:2},end:true}]},
      {label:'said'},{speaker:'kai',expression:'neutral',text:'（頭沒回）……喔。'} ],
    consequences:{stamp:['kaiScreenDay']} },
  /* K1 之後（蓋棉被、戴耳塞）：一週後的晚上，阿凱自己發現。要在房間裡（他的日程 18–32 在宿舍）*/
  { id:'ev_kai_dark_circles', title:'黑眼圈', participants:['kai'], location:'dorm', trigger:'enter', npcPresent:'kai', time:[18,27], once:true, background:'blur',
    prereq:{flagIs:{kaiScreenChoice:[1,2]},custom:G=>G.flags.kaiScreenDay!=null&&G.day>=G.flags.kaiScreenDay+7},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'你黑眼圈好重欸，是不是我昨天太吵？'} ],
    consequences:{stamp:['kaiDarkDay']} },
  /* K1 之後換鍵盤：說了「我明天第一堂有課」的隔天晚上；或黑眼圈的隔天晚上。書桌下的盒子可以看（story3d.js 的 kaiBoxScene：看了才記 HELPED）*/
  { id:'ev_kai_keyboard_quiet', title:'安靜的鍵盤', participants:[], location:'dorm', trigger:'enter', time:[18,27], once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; return (F.kaiScreenChoice===0&&F.kaiScreenDay!=null&&G.day>=F.kaiScreenDay+1)||(F.kaiDarkDay!=null&&G.day>=F.kaiDarkDay+1); }},
    dialogue:[ {speaker:null,text:'螢幕調暗了，鍵盤換成很安靜的一把。'} ],
    consequences:{flags:{KAI_SILENT_KB:true}} },
  /* 讀書會的下一週：學姊的回答（BB_95 3-4）：P1（讀書會上沛珊問「我們為什麼要背這個？」）之後 7 天內的下一次讀書會，讀書會一開始就演（classes3d.js 的 clubEvent；
     沛珊在場、只一次）。學姊四年主題「條列越來越短」的第一個伏筆（BB_90 第 2b 節）。SIS_ANSWERED_WHY：大二上 P3 她決定重考時會讀。
     隔週沒來的玩家沒有這一場：之後第一次去讀書會，沛珊小聲說一句（ev_studygroup_p1b_missed）。舊存檔沒有 P1 的日期（peishanAskedDay）＝當作沒來 */
  { id:'ev_studygroup_p1b', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'學姊的回答', participants:['heroine_05','classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'上週的問題。我想了一週。三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，因為會考。'},{speaker:'heroine_05',expression:'neutral',text:'二，因為背了，才有東西可以吵。'},{speaker:'heroine_05',expression:'neutral',text:'三……'},{speaker:null,text:'她停住。'},
      {speaker:'heroine_05',expression:'neutral',text:'三我還在想。今天讀刑訴。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}},
      {speaker:'classmate_peishan',expression:'thinking',text:'（小聲）她第一次沒講完三件。'} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  { id:'ev_studygroup_p1b_missed', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'法服讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],notEvents:['ev_studygroup_p1b'],custom:G=>{ const d=G.flags.peishanAskedDay; return d==null||G.day-d>7; }}, background:'blur',
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（小聲）學姊上週回答了。她說她還在想。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  /* 沛珊 P1／P1b 搬到以安的公法讀書會（方案 A；使用者 07:5x；機制 BB_191 §8-7；台詞 AA_222 bb83443d）。classes3d.js 的 clubEvent 在公法讀書會那一次挑：
     P1＝大一上第 11～16 週（沒遇到的：大一下第 7 週以前第一次去讀書會也可以）、已認識沛珊、只一次；記 PEISHAN_ASKED_WHY、peishanAskedDay。
     P1b＝7 天內的下一次讀書會、以安回答，記 PS_WHY_ANSWERED。沒來那一次：沒有獨立場面（AA_222：沛珊之後在閒聊階梯 P-L3 帶一句）*/
  { id:'ev_peishan_why_plg', title:'為什麼要背', participants:['classmate_peishan','heroine_01'], location:'wancai', trigger:'activity', once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],notFlags:['PEISHAN_ASKED_WHY'],custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&((t.id==='Y1S1'&&t.week>=11&&t.week<=16)||(t.id==='Y1S2'&&t.week<=7)); }},
    dialogue:[ {speaker:null,text:'（大家在背基本權的審查標準。白板上寫滿了「目的」「手段」「必要」。）'},
      {speaker:'classmate_peishan',expression:'thinking',text:'（舉手，停了一下）……我們為什麼要背這個？'},
      {speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},
      {speaker:null,text:'（有人笑出來。）'},
      {speaker:'heroine_01',expression:'thinking',text:'（想了一下）這個我下次回答妳。我想一下怎麼講比較清楚。'},
      {set:{PEISHAN_ASKED_WHY:true},stamp:['peishanAskedDay']} ] },
  { id:'ev_peishan_why_answer_plg', title:'以安的回答', participants:['heroine_01','classmate_peishan'], location:'wancai', trigger:'activity', once:true, background:'blur',
    prereq:{flags:['PEISHAN_ASKED_WHY'],notFlags:['PS_WHY_ANSWERED','SIS_ANSWERED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'上禮拜沛珊問的，為什麼要背審查標準。'},
      {speaker:'heroine_01',expression:'thinking',text:'我想了一下。不背的話，討論的時候只能說「我覺得不合理」，可是講不出哪裡不合理。'},
      {speaker:'heroine_01',expression:'neutral',text:'背起來，至少大家吵的時候用的是同一套話。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'……好，這樣我可以接受。'},
      {speaker:'heroine_01',expression:'smile',text:'那今天讀比例原則。'} ],
    consequences:{flags:{PS_WHY_ANSWERED:true}} },
  /* 沛珊 P2b：溫州街的三段論（BB_95 3-5）：P2（ev_peishan_doubt）之後、大一上第 6～7 週（期中前），平日 16–19 在總圖和她說話（她的日程本來就在總圖）。
     交往中（v1 一開始都是）：「去外面講」（總圖門口的階梯），她不說「我請你」（AA_112 8-1）；單身：「去 Café？我請你。」。ADV 背景（Café 窗邊、總圖門口的階梯）還沒有，先用目前畫面。
     法律說明 BB-B 審過（BB_115 L442；BB_161 第 3 節）。「我小時候翻民法」只用 AA_12 的原意（翻得到、看不懂）。影響：筆記的第一頁第一次改寫（NOTE_PAGE1，AA_12 0-3 第 3 點；措辭需法律審查）、沛珊記憶 NOT_FOR_ME */
  { id:'ev_peishan_syllogism', title:'三段論', participants:['classmate_peishan'], location:['library','library_hall'], trigger:'interact', priority:5, weekday:[1,2,3,4,5], time:[16,19], term:['Y1S1'], weeks:[6,7], once:true, prereq:{events:['ev_peishan_doubt']}, background:'blur',
    dialogue:[ {if:GF('classmate_peishan'),speaker:'classmate_peishan',expression:'neutral',text:'總圖不能講話。去外面講。'},{unless:GF('classmate_peishan'),speaker:'classmate_peishan',expression:'smile',text:'總圖不能講話。去 Café？我請你。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'老師說法律的推理是三段論。大前提是法條，小前提是事實，結論是……把事實放進法條。'},
      {speaker:'player',text:'（在紙上畫了三個框）所以先找規則，再看這件事符不符合，最後才說結果。'},{speaker:'player',text:'……我小時候翻民法，就是少了中間那一步。'},
      {speaker:'classmate_peishan',expression:'smile',text:'（看著那三個框）你講得很開心耶。'},{speaker:'classmate_peishan',expression:'thinking',text:'我聽完的感覺是，人被放進一個框裡。'},{speaker:'classmate_peishan',expression:'thinking',text:'……我是不是不適合念這個。'},
      {choice:[{text:'「框是用來想清楚的，不是用來關人的。」',goto:'frame'},{text:'「妳可以不喜歡。」',goto:'dislike'},{text:'「我們再寫一題。」',goto:'again'}]},
      {label:'frame'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。'},{speaker:null,text:'她想了很久。'},{speaker:'classmate_peishan',expression:'thinking',text:'我懂你的意思。可是我比較想知道框外面的人在想什麼。'},{goto:'end'},
      {label:'dislike'},{speaker:'classmate_peishan',expression:'surprised',text:'……可以不喜歡？'},{speaker:null,text:'她重複一次，好像第一次聽到有這個選項。'},{speaker:'classmate_peishan',expression:'smile',text:'好，我先記著。'},{goto:'end'},
      {label:'again'},{speaker:null,text:'兩人又寫了一題。她寫得很好。'},{speaker:'classmate_peishan',expression:'thinking',text:'我寫得出來。可是寫的時候一點都不想寫。'},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_peishan',tag:'NOT_FOR_ME',note:'三段論那天'}],flags:{NOTE_PAGE1:1},toast:'📓 筆記的第一頁：你改寫了一行'} },
  /* 明軒 M1：公車站的筆記（BB_95 3-6，v1 版）：週二、週四 21–22 點，他家教完剛下公車，在公館騎樓的公車站把民總筆記畫完（characters.js 的日程：linger）。
     和他至少 ACQUAINTANCE、大一上第 7 週（期中前一週）起、只一次。SAW_HIM_STUDY：期中後麵店團的聚餐（A15）阿哲說「明軒從來不念書」時多一個選項。
     解鎖他的聯絡方式；「公館一百元以內」的店家清單（BB_70 F-M1）那晚 23:00 私訊、進筆記本（地圖上的小標先不做）。公車站的長椅還沒有（站著）——環境細節那一批（D70） */
  /* AA_497 4-1：M1 多一個入口＝總圖 B1 二十四小時自習室，週二、四 22:00～23:30，大一上第 7 週～大一下第 16 週（ev_mingxuan_notes_b1，src/sup497_3d.js 照這一場組）；兩個入口只演一個 */
  { id:'ev_mingxuan_notes', title:'公車站的筆記', participants:['classmate_mingxuan'], location:'gongguan', trigger:'interact', priority:6, weekday:[2,4], time:[21,22], term:['Y1S1'], once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'},custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.week>=7&&!(G.events&&G.events.done&&G.events.done.ev_mingxuan_notes_b1); }}, background:'blur',
    dialogue:[ {speaker:null,text:'明軒戴著耳機，膝蓋上攤著民總的筆記，三種顏色的螢光筆。'},{speaker:null,text:'他看到你，把筆記蓋起來。'},{speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你沒看到。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（笑）我在看漫畫啦。'},
      {choice:[{text:'「我什麼都沒看到。」',goto:'nothing'},{text:'「你從哪裡回來？」',goto:'where'},{text:'（坐到他旁邊，也拿出筆記）',goto:'sit'}]},
      {label:'nothing'},{speaker:'classmate_mingxuan',expression:'smile',text:'很好。'},{speaker:null,text:'他把筆記打開，繼續畫。'},{speaker:null,text:'走到校門口。'},{speaker:'classmate_mingxuan',expression:'smile',text:'我先回宿舍了。'},{goto:'end'},
      {label:'where'},{speaker:'classmate_mingxuan',expression:'neutral',text:'……家教。三個。'},{speaker:null,text:'他看馬路。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我爸的店最近生意不太好，我多接一點。'},{speaker:null,text:'然後轉回來，笑了。'},{speaker:'classmate_mingxuan',expression:'smile',text:'好，這個話題結束。你要不要看漫畫？'},{mem:[{npc:'classmate_mingxuan',tag:'SHARED_SECRET',note:'他多接了家教'}]},{goto:'end'},
      {label:'sit'},{speaker:null,text:'兩個人一路沒講話。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'你的螢光筆只有一種顏色？很可憐耶。'},{speaker:null,text:'他給你一支綠色的。'},{set:{GREEN_HIGHLIGHTER:true}},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],contact:'classmate_mingxuan',stamp:['MX_M1_DAY'],memo:'在公館的公車站遇到明軒'} },   /* MX_M1_DAY：那晚 23:00 他傳「公館一百元以內」的清單（story3d.js phoneRules 'mx_fm1'，BB_70 F-M1）*/
  /* 校慶：法服的法律問答攤（BB_95 3-7）：大一上第 11 週週六（11/15，校慶日期需查證）10–12 點，走近椰林大道上法服的帳篷（zones3d.js：校慶那天擺出社團博覽會的同一排帳篷；
     學姊的日程那兩小時站在攤前）。沒加入法服的玩家經過也會被她叫住；攤位上還有阿嬤和法服的人，不是兩個人單獨相處。主線不會主動把玩家帶過去（BB_90 第 1 節）。
     阿嬤的問題只引導到「先溝通、再來法服」，不給法律結論、不引用條號（需法律審查；學生不能獨立給法律意見）。
     小插曲（都可以沒有）：芷若——有她的聯絡方式、FAMILIAR 以上：手機問一題（學姊從旁邊看到螢幕）；子晴——INVITED_CLUB：吉他社群組傳攤位照片（story3d.js 的 phoneRules）*/
  { id:'ev_sis_festival_booth', title:'法律問答攤', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[11], weekday:[6], time:[10,12], once:true, npcPresent:'heroine_05', near:{x:-17.8,z:13.0,r:4.5}, background:'blur', prereq:{flags:['met_sis']},   /* AA_207 附錄 §2：還沒見過她的玩家，陌生學姊不會直接叫人顧攤 */
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'你。過來。'},{speaker:'heroine_05',expression:'neutral',text:'幫我顧十分鐘。不會的不要亂答，叫我就好。'},
      {speaker:'阿嬤',text:'少年仔，隔壁的樹長到我家這邊，我可以自己剪嗎？'},
      {choice:[{text:'「阿嬤，我幫妳問學姊。」',consequences:{rel:{heroine_05:{fam:2}}},goto:'ask'},{text:'（翻民總的筆記）',consequences:{rel:{heroine_05:{fam:2}}},goto:'notes'},{text:'「我也還不會，我們一起查。」',consequences:{rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'HELPED',note:'一起幫阿嬤查'}]},goto:'search'}]},
      {label:'ask'},{speaker:'heroine_05',expression:'neutral',text:'阿嬤，先跟鄰居講，請他剪。講了一直沒剪，兩週後的週六早上，九點到十二點，來萬才館。值班的學長姊會幫妳看。'},{goto:'side'},
      {label:'notes'},{speaker:null,text:'翻了半天找不到。學姊探頭。'},{speaker:'heroine_05',expression:'neutral',text:'那是物權。你們大二才上。'},{speaker:'阿嬤',text:'物權是什麼？'},{speaker:'heroine_05',expression:'neutral',text:'……阿嬤，下一次值班，週六早上來。'},{goto:'side'},
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
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。我是妳的直屬。'},{unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我知道。群組裡那個名字。'},   /* AA_470 5-1：還沒認識她的（沒有 SIS_W1）兩句，演完記 met_sis、SIS_W1（同 9/12 家聚 ev_sis_fam_dinner）*/
      {speaker:null,text:'她坐下，從包包拿出一個資料夾。'},{speaker:'heroine_05',expression:'neutral',text:'周老師歷年的考古題。我整理過，錯的地方用紅筆改了。'},{speaker:'heroine_05',expression:'neutral',text:'下學期的書，開學前我會分。書上標紅的地方是修法了，自己查新的。'},{speaker:'heroine_05',expression:'neutral',text:'……還有——'},   /* AA_398 第 4 列 */
      {speaker:'Kevin 學長',text:'還有傳統！直屬學姊要講一個自己大一的糗事！'},{speaker:'heroine_05',expression:'neutral',text:'……'},{speaker:'heroine_05',expression:'neutral',text:'我大一第一次被點名，老師問什麼是「善意第三人」。我說：心地善良的第三人。'},{speaker:'heroine_05',expression:'neutral',text:'老師說：「那心地不好的第三人，是不是就不用保護了？」'},
      {speaker:null,text:'全桌笑。她也笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'其實「善意」在法律上是「不知道」的意思。下學期你們就會學到。'},
      {choice:[{text:'「民總第一堂我就被周老師點到，手心都是汗。」',unless:{flagIs:{classAnswer:'absent'}},consequences:{rel:{heroine_05:{comf:3}}},goto:'called'},{text:'「學姊在群組為什麼都只回『收到』？」',if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law')},consequences:{rel:{heroine_05:{fam:3}}},set:{SIS_NO_STICKER:true},goto:'sticker'},{text:'（默默把考古題資料夾收進書包）',consequences:{rel:{heroine_05:{resp:2}}},goto:'folder'}]},
      {label:'called'},{speaker:'heroine_05',expression:'smile',text:'那一題大家都會卡。你有回答就很好了。'},{goto:'end'},
      {label:'sticker'},{speaker:'heroine_05',expression:'neutral',text:'因為收到了。'},{speaker:'Kevin 學長',text:'她連過年都回收到。'},{speaker:'heroine_05',expression:'neutral',text:'……不然要回什麼？'},{speaker:'Kevin 學長',text:'貼圖啊！'},{speaker:'heroine_05',expression:'neutral',text:'我沒有貼圖。'},{goto:'end'},
      {label:'folder'},{speaker:null,text:'學姊看了一眼。'},{speaker:'heroine_05',expression:'neutral',text:'資料夾回去再看。現在吃麵。'},{speaker:'Kevin 學長',text:'學姊說吃麵耶！'},
      {label:'end'},{speaker:'heroine_05',expression:'smile',text:'下學期的書，我會留給你。'},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true}} ],
    consequences:{mem:[{npc:'heroine_05',tag:'SHARED_MEAL',note:'家族聚餐'}],stamp:['familyDinnerDay'],memo:'直屬家族聚餐（阿鳳麵店）'} },
  /* 哲 1：不用約，來就有人（AA_40 哲 1；交付清單 A9）：大一上第 4 週週四起（遊戲裡的第二個週四），週二、週四傍晚在阿鳳麵店遇到阿哲（他的日程 17:30–20:30）——
     第 4 週週四沒去的玩家，順延到之後第一次在麵店遇到他（BB_95 第 5 節第 4 點：不能永久錯過）；只一次。麵店的長桌從這裡開始：
     阿哲建「麵店團」群組（AA_70 2-3），之後每個上課週的週二、週四 17:30 他在群組裡揪（story3d.js 的 phoneRules）。阿姨＝麵店的老闆娘（店員是路人模型，沒有名字）*/
  { id:'ev_zhe_long_table', title:'不用約，來就有人', participants:['zhe'], location:'noodle', trigger:'auto', near:{npc:'zhe',r:6}, term:['Y1S1'], weekday:[2,4], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S1',STORY.week1Start&&STORY.week1Start(G)?2:4,4)},   /* A13（AA_195 4-7）：開學改 9/1 的局是第 2 週週四（9/11，遊戲裡的第二個週四）；舊局照舊第 4 週週四（第 2 週在第 1 天以前，提早會撞到主線第二天的麵店）*/
    dialogue:[ {speaker:'zhe',expression:'smile',text:'（把兩張桌子併起來）阿姨，我們以後週二週四都來。'},{speaker:'阿姨',text:'你們？你們是誰？'},
      {speaker:'zhe',expression:'laugh',text:'法律系一年級。現在是四個，之後會更多。'},{speaker:'zhe',expression:'smile',text:'（對你）規矩很簡單：週二週四，麵店。不用約，來就有人。'} ],
    consequences:{stamp:['noodleTableDay']} },
  /* 麵店團群組的補救（AA_496 第 9 節第 3 點，NPC-STORY-1028）：錯過哲 1 的人（ZHE_GROUP_LATE），大一下第 2 週起第一次在麵店遇到阿哲（同哲 1：麵店、阿哲在旁邊 6 m 內），
     或和阿哲說話、有點熟以上（下一個事件）：阿哲當面一句（當面說的，有標點：口氣表），然後照長桌那一場的做法加進麵店團——記 noodleTableDay（story3d.js 的 phoneRules 加群組、
     阿哲兩則規矩、之後的揪、期末最後一頓都照它）；NDL_LATE_ADD＝群組早就有了，系統訊息寫「把你加進了」，不寫「建立了」。只一次 */
  { id:'ev_zhe_group_late', title:'麵店團', participants:['zhe'], location:'noodle', trigger:'auto', near:{npc:'zhe',r:6}, once:true, background:'blur',
    prereq:{custom:G=>ZHE_GROUP_LATE(G)},
    dialogue:[ {speaker:'zhe',text:'欸，你還沒進群組？我拉你。'} ],
    consequences:{stamp:['noodleTableDay'],flags:{NDL_LATE_ADD:true}} },
  { id:'ev_zhe_group_late_talk', title:'麵店團', participants:['zhe'], location:'any', trigger:'interact', priority:6, once:true, background:'blur',
    prereq:{stage:{npc:'zhe',min:'FAMILIAR'},custom:G=>ZHE_GROUP_LATE(G)},   /* 有點熟以上＝SOCIAL.STAGES 的 FAMILIAR 起算（AA_497 開頭）*/
    dialogue:[ {speaker:'zhe',text:'欸，你還沒進群組？我拉你。'} ],
    consequences:{stamp:['noodleTableDay'],flags:{NDL_LATE_ADD:true}} },
  /* 語 1：傅鐘旁邊的早餐（AA_40 語 1；交付清單 A10）：大一上第 3～5 週的早上，Alison 坐在傅鐘旁邊的長椅（她的日程：平日上課前 08:20～09:05，AA_156 第 4 節；原本 9:30–12:00），找她說話時；
     要先認識她（第一次說話是 talkYu 的自我介紹），而且不是認識的同一天（自我介紹已經講過三個社團）；只一次。
     「坐下來一起吃」記憶 BREAKFAST_YU（之後早上經過傅鐘她會先揮手：AA_118，之後再做）。吉他社的入口之一（另一個是阿凱）*/
  { id:'ev_yu_breakfast', title:'傅鐘旁邊的早餐', participants:['yu'], location:'campus', trigger:'interact', priority:6, term:['Y1S1'], weeks:[2,3,4,5], time:[8+20/60,9+5/60], once:true, background:'blur',   /* A14（AA_195 4-7）：第 2～5 週（舊局的第 2 週在第 1 天以前，等於照舊）*/
    prereq:{flags:['met_yu'],custom:G=>G.flags.metYuDay==null||G.flags.metYuDay<G.day},
    dialogue:[ {speaker:'yu',expression:'smile',text:'欸，你要不要坐？'},{speaker:'yu',expression:'neutral',text:'我一個人吃很怪。……太安靜了。我不喜歡安靜。'},
      {speaker:'yu',expression:'smile',text:'對了，你都這麼早經過喔？我是板橋的車太早到。'},   /* AA_313 5-4：第一次見面剛推過三個社團，這裡不再推一次（選項「三個社團不會累嗎？」照留）*/
      {choice:[{text:'（坐下來一起吃）',consequences:{mem:[{npc:'yu',tag:'BREAKFAST_YU',note:''}],flags:{YU_CLUB_INVITE:true},advance:0.25},goto:'sit'},{text:'「我上課要遲到了。」',goto:'rush'},{text:'「辯論社不會累嗎？」',goto:'tired'}]},   /* AA_497 3-8：這個選項拿掉「三個社團」四個字、換成辯論社（她自我介紹說過；列給 AA 看）*/
      {label:'sit'},{speaker:null,text:'她講了十五分鐘，關於三個社團。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'yu')},speaker:'yu',expression:'smile',text:'欸你有沒有群組？沒有？我拉你。',consequences:{contact:'yu'}},{speaker:'yu',expression:'smile',text:'明天你也會經過嗎？'},{goto:'end'},   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-4）*/
      {label:'rush'},{speaker:'yu',expression:'smile',text:'喔，好！'},{speaker:null,text:'她揮手。等你走遠，她把耳機戴上。'},{goto:'end'},
      {label:'tired'},{speaker:'yu',expression:'laugh',text:'累啊。'},{speaker:'yu',expression:'smile',text:'可是累就不會想東想西。'},
      {label:'end'} ],
    after:(G,GM)=>{ if(G.flags.YU_CLUB_INVITE&&GM.addNote) GM.addNote('yu_club_guitar','吉他社（Alison 說的）','第 5 週起，週一、週三 19:00，萬才館一樓多功能教室。'); } },   /* AA_156 1-1：只有「坐下來一起吃」那一支有時間地點（她講了十五分鐘三個社團）；不設 guitar_invite（那是阿凱跟子晴提過你）*/
  /* 以安的報告分工（交接包 v1 第 3 節，AA 2026-10-14 補台詞；交付清單 A12；AA_113 9-1「分組報告是合作」）：大一上第 4 週週四民總下課後（第 4 週沒去上課的話，第 5 週那堂）——
     classes3d.js 的 afterClassEvent：那堂課上完就在教室裡接著演（afterClass＝課的 id；trigger 'class' 不會被別的地方觸發）。
     條件：第二天和以安一起度過下午（Café 或總圖：afternoonDone，cafeView 兩邊都有）；沒有的玩家沒有這一段，以安自己寫。舊存檔已經演過「報告的結論」（她自己寫完了）的也沒有。
     「好，一起寫。」＝記憶 REPORT_PARTNER、照第二天的看法分工；「我已經有組了。」不扣分。之後：沒有一起寫的，她寫完在總圖給你看（ev_an_report_followup）；第 6 週報告發回來兩種都接得上 */
  { id:'ev_an_report_split', title:'民總的報告', participants:['heroine_01'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[4,5], weekday:[4], once:true, npcPresent:'heroine_01', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_followup']},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（把講義收好）民總的報告，兩人一組。我還沒找人。'},
      /* AA_313 第 0 節（X70）：「你那天講的」是第二天 Café 那段——錯過的玩家（沒有 cafeView）換一句：上課回答過（classAnswer）／兩個都沒有 */
      {if:{custom:G=>!!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'neutral',text:'你那天講的，我想放進去。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)&&!!(G.flags&&G.flags.classAnswer)},speaker:'heroine_01',expression:'neutral',text:'你上課回答的那題，我想放進去。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)&&!(G.flags&&G.flags.classAnswer)},speaker:'heroine_01',expression:'neutral',text:'你要不要跟我一組？'},
      {choice:[{text:'「好，一起寫。」',consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'民總'}]},goto:'yes'},{text:'「我已經有組了。」',goto:'no'}]},
      {label:'yes'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'那結論你寫。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'smile',text:'那反方你寫。'},
      {if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'那判斷標準你寫，你比我會講。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'smile',text:'好。那分工我來排。'},{goto:'end'},   /* AA_313 第 0 節：沒有 cafeView 的玩家 A／B／C 三句都不出 */
      {label:'no'},{speaker:'heroine_01',expression:'neutral',text:'好。那我自己寫，寫完給你看。'},
      {label:'end'} ] },
  /* 迎新（交接包 v1 A11：AA_71 2-1＋沛珊 P0 BB_95 3-3）：參加法律系迎新的活動時演（src/data/activities.js 的 welcome_y1s1：第 4 週週六傅鐘前；classes3d.js 的 attendActivity 讀活動的 event）。
     只有認識的人在場（交付清單第 0 節第 1 點）：Alison、柏翰沒見過就跳過那兩句；以安見過才算在場（說了經濟系那一年，她記得 KNOWS_ECON_YEAR）。
     自我介紹由玩家選說多少（不能替玩家說出經濟系那一年，AA_12 0-4）：只有「念過一年經濟」設 ECON_PAST_SHARED='full'；「大一歲」不設；說過的事不會變成沒說過（重修經原已經說過的照舊）。
     沛珊 P0：大地遊戲同一組、「奇怪的問題」只在這裡一次；記 FIRST_MET（participants）＋聯絡方式（迎新的群組）。第一句、「輪到你。」、大地遊戲那句是 LAWWW 加的場景說明（AA_355 第 2 節：AA 看過、照用）*/
  /* 民總報告分組的補救（AA_160 3-4 C、R3，AA-B 2026-10-16 寫的台詞）：第 4、5 週民總都沒去、分組事件沒演過——第 6 週起第一次在教室或總圖遇到以安，
     她說把你寫進她那組了；記同一個 REPORT_PARTNER（備註 assigned_absent）＋REPORT_PARTNER_LATE，後面讀 REPORT_PARTNER 的事件照常接。分組是事實、不是玩家經歷的場面（R4）*/
  { id:'ev_an_report_split_late', title:'民總的報告（分組那天你沒來）', participants:['heroine_01'], location:['classroom','library','library_hall'], trigger:'auto', near:{npc:'heroine_01',r:5}, term:['Y1S1'], weeks:[6,7,8,9,10,11,12,13,14,15], once:true, keep:'must', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'民總的報告，老師分組那天你沒來。'},{speaker:'heroine_01',expression:'smile',text:'我把你寫在我這組了。……不用謝。剩下的人裡，你最不會遲交。'} ],
    consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'分組那天沒來，以安把你寫進她那組'}],flags:{REPORT_PARTNER_LATE:'assigned_absent'}} },
  { id:'ev_welcome_y1s1', title:'迎新', participants:['classmate_peishan'], location:'campus', trigger:'activity', once:true, background:'blur',   /* 不寫 term：8/31 在大一上開學前（AA_310），日期由 activities.js welcome_y1s1 管 */
    dialogue:[ {speaker:null,text:'星期天上午，傅鐘前面，法律系的迎新。下午就是開學典禮。學長姊帶隊，大家先輪流自我介紹。'},   /* AA_310 第 1 節：8/31（日）上午 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'Alison 自我介紹講了三分鐘她的三個社團。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',expression:'neutral',text:'（小聲）她剛剛講了四個。'},
      {speaker:null,text:'輪到你。'},
      {choice:[{text:'「我叫{name}，臺北人。」',goto:'game'},{text:'「我比大家大一歲。」',goto:'older'},{text:'「我二十歲。念過經濟系，一個多月。」',goto:'econ'}]},
      /* AA_313 5-3、5-4：說了「哥」就記 ZHE_CALLS_GE（之後阿哲照這個叫）；還不認識阿哲、Alison 的（8/31 迎新在宿營、開學以前）說話的人寫「旁邊一個男生」「前面一個女生」*/
      {label:'older'},{if:EV_KNOWS('zhe'),speaker:'zhe',expression:'laugh',text:'那我們叫你哥？'},{unless:EV_KNOWS('zhe'),speaker:'旁邊一個男生',text:'那我們叫你哥？'},{speaker:'player',text:'不要。'},{set:{ZHE_CALLS_GE:true}},{goto:'game'},
      {label:'econ'},{set:{ECON_PAST_SHARED:'full',ZHE_CALLS_GE:true}},{if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','FIRST_MET')},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'迎新的自我介紹：你說念過經濟系'}]},
      {speaker:null,text:'全場「喔——」。'},{if:EV_KNOWS('zhe'),speaker:'zhe',expression:'laugh',text:'哥！'},{unless:EV_KNOWS('zhe'),speaker:'旁邊一個男生',text:'哥！'},
      /* 「為什麼重考？」（AA_224 2-c；AA-C 2026-10-17 Q3）：宿營夜談沒問過的（WHY_RETAKE_ASKED），Alison 補問一次；選「大一歲」不問 */
      {if:{flags:['WHY_RETAKE_ASKED']},goto:'game'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'欸，為什麼重考？'},{unless:EV_KNOWS('yu'),speaker:'前面一個女生',text:'欸，為什麼重考？'},{set:{WHY_RETAKE_ASKED:true}},
      {if:{flagIs:{E24C_REASON:'honest'}},goto:'why_h'},
      {speaker:'player',text:'本來就想念法律。第一次沒考上。'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'好，懂了。'},{unless:EV_KNOWS('yu'),speaker:'前面一個女生',text:'好，懂了。'},{goto:'game'},
      {label:'why_h'},{speaker:'player',text:'第一次社會考壞了，差四分。先去念了一個多月的經濟。'},{if:EV_KNOWS('zhe'),speaker:'zhe',expression:'neutral',text:'差四分喔……那真的很煩。'},{unless:EV_KNOWS('zhe'),speaker:'旁邊一個男生',text:'差四分喔……那真的很煩。'},
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
      {speaker:'kexin',expression:'smile',text:'上次是搬東西，不算。今天才是真的政大。我是今天的導遊。'},   /* AA_313 第 2 節第 5 列：8/30 搬宿舍那天已經來過、在山下吃過（原本「暑假那次學校沒人，不算。」）*/
      {speaker:'kexin',expression:'smile',text:'我在這裡念了{flag:kxTourWeeks|三}個禮拜，所以比你懂這裡{flag:kxTourWeeks|三}個禮拜。'},   /* AA 審 9-1 第 2 點：K1 延後時照實際的週數（排出遊時記下：story3d.js）*/
      {speaker:null,text:'她指了左邊、右邊、後面。'},
      {speaker:'kexin',expression:'laugh',text:'法學院。山。也是山。政大的地圖重點就是：山。'},
      {speaker:'kexin',expression:'teasing',text:'山下那條街，你想吃哪一家？……先說，每一家我都吃過了。'},
      {choice:[{text:'「跟妳點一樣的。」',goto:'s1'},{text:'「妳推薦哪一家？」',goto:'s2'},{text:'「妳先點，我請。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'laugh',text:'那你要吃很辣喔。……好，等一下下山就去。'},{goto:'food'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。'},{goto:'food'},   /* AA_372 第 7 項：她才開學兩個禮拜 */
      {label:'s3'},{speaker:'kexin',expression:'smile',text:'……你答得太快了。我會點很多喔。'},{speaker:null,text:'她先走進校門。'},
      {label:'food'},{scene:'政大・山下的小吃街',bg:'nccu_food'},
      {choice:[{text:'（吃她推薦的）',set:{K1_ORDER:'hers'},goto:'o1'},{text:'（自己挑一家）',set:{K1_ORDER:'mine'},goto:'o2'},{text:'「妳幫我點。」',set:{K1_ORDER:'let_her'},goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好，信任導遊。'},{speaker:null,text:'（她點了兩碗。和搬宿舍那天同一家。）'},{goto:'park'},   /* AA_313 第 2 節第 5 列：原本「她點了兩碗酸辣湯餃。」和 8/30 同一句 */
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'你挑的那家，我還沒吃過。……好，今天換你當導遊。'},{goto:'park'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'讓我點的人，第三次老闆就會記得你。'},
      {label:'park'},{scene:'政大・校門口',bg:'nccu_gate'},   /* 原本是停車場；政大只做主要校園＋宿舍（使用者 10-16），AA_137 7-1：她送你到校門口，台詞照用 */
      {speaker:'kexin',expression:'smile',text:'下次你來，我們吃山下那家。'} ],   /* AA_372 第 7 項：「選宵夜」8/30 講過、大一下「我們的日子」又講一次；第 6 節第 7 題（企劃線 7fca0df5）：後面的「……這是分工，不是命令。」拿掉（分工的前情已經不在）*/
    consequences:{flags:{NCCU_VISITED:true},mem:[{npc:'kexin',tag:'OUR_SHOP_FIRST',note:'政大山下的小吃街'}],memo:'開學後第一次去政大'} },   /* AA_313 第 2 節第 5 列：8/30 搬宿舍是第一次 */
  /* 可昕 K1b 予樂說：及格（BB_95 9-2）：K1 之後第 6～8 週，她在平日下午傳「明天晚上有空嗎？……」（story3d.js 的 phoneRules）；答應＝隔天 19:30、晚一點＝21:00 去政大（出遊）。
     流程照 AA_112 第 12 節：校門 → 山下的小吃街（予樂先到；予樂的第一句三選一＝YL_IMPRESSION）→ 可昕到了 → 河堤（假設題，玩笑、不給結論）→ 圖書館 → 停車場（約下一次）；
     （2026-10-16 AA_137 7-1：政大只做主要校園＋宿舍——河堤→校園裡的路、圖書館→自強十舍樓下、停車場→校門；台詞不改）
     隔天中午她傳予樂的紙條照片「及格。」（phoneRules）。「這週不行」：她自己去，予樂的第一句延到第一次見面（予樂戴紙巾皇冠的照片 AA_503 改成可昕的動態第 3 則，去沒去都出，src/feed3d.js）。
     旁白「可昕到了……」「她在桌下踢你一下……」、圖書館那一句、停車場的兩個選項之後沒有回應，是照 BB 的流程寫成的；BB-B 看過（e0e7a359，第①級）：小吃街加予樂口頭禪那句、宿舍樓下改成讀自己的書、校門加兩句 */
  { id:'ev_kexin_yule_pass', title:'予樂說：及格', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'停車場只剩最邊邊的一格。'},
      {phone:'kexin',text:'再十分鐘！你先去山下那間，幫我點酸辣湯餃。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:'予樂',text:'你就是那個……開車的？'},
      {speaker:'予樂',text:'我問你，台大法律系是不是都很難聊？'},
      {choice:[{text:'「司機兼男朋友。」',set:{YL_IMPRESSION:'funny'},goto:'y1'},{text:'「是。所以我來政大聊。」',set:{YL_IMPRESSION:'honest'},goto:'y2'},{text:'「妳好，我是{name}。」',set:{YL_IMPRESSION:'polite'},goto:'y3'}]},
      {label:'y1'},{speaker:'予樂',text:'好。司機。……坐吧，湯餃快好了。'},{goto:'arrive'},
      {label:'y2'},{speaker:'予樂',text:'……可以，你很老實。'},{goto:'arrive'},
      {label:'y3'},{speaker:'予樂',text:'好客氣。可昕，他好客氣。'},
      {label:'arrive'},{speaker:null,text:'可昕到了。桌上聊報告、老師、學校的八卦。'},{speaker:null,text:'予樂學她們老師的口頭禪，你接了一句，全桌都笑了。'},{speaker:null,text:'（她在桌下踢了你一下，自己也在笑。）'},
      {scene:'政大・校園裡的路',bg:'nccu_campus'},   /* AA_137 7-1：原本是河堤 → 政大主要校園的路（散步）；假設題照用 */
      {speaker:'kexin',expression:'teasing',text:'予樂說要借你的筆記。我說要先問你。'},
      {choice:[{text:'「好啊，哪一科？」',goto:'r1'},{text:'「借吧，反正她看不懂。」',goto:'r2'},{text:'（笑）',goto:'r3'}]},
      {label:'r1'},{speaker:'kexin',expression:'smile',text:'民總。……她說你的字比我的好認。'},{goto:'lib'},
      {label:'r2'},{speaker:'kexin',expression:'teasing',text:'……這句我會轉告她。'},{goto:'lib'},
      {label:'r3'},{speaker:'kexin',expression:'laugh',text:'你笑了。我當你答應了。'},
      {label:'lib'},{scene:'政大・宿舍樓下',bg:'nccu_dorm'},   /* AA_137 7-1：原本是圖書館 → 自強十舍樓下的長椅（不進宿舍）；台詞照用 */
      {speaker:null,text:'宿舍樓下的長椅。她說要寫完一段報告，你坐在旁邊讀自己的書。'},
      {speaker:'kexin',expression:'neutral',text:'你翻頁好大聲。'},
      {scene:'政大・校門口',bg:'nccu_gate'},   /* AA_137 7-1：原本是停車場 → 校門（約下一次）*/
      {speaker:null,text:'校門口。她送你到這裡。'},{speaker:'kexin',expression:'neutral',text:'……下次呢？'},   /* BB-B e0e7a359（第①級）：換了背景先有人開口，再出選項 */
      {choice:[{text:'「週末換妳來台大？」',if:{notEvents:['ev_kexin_visits_ntu']},set:{KX_NTU_ASKED:true},goto:'p1'},{text:'「報告寫完傳訊息給我。」',goto:'p2'}]},   /* AA_313 第 2 節第 7 列：K2（她回台大）演過以後「週末換妳來台大？」不出 */
      {label:'p1'},{speaker:'kexin',expression:'smile',text:'好。我先問品妤那天在不在。'},{goto:'pend'},   /* AA_313 第 2 節第 7 列：原本「好。我先去找品妤，再去抓你。」和 K2 私訊幾乎同一句 */
      {label:'p2'},{speaker:'kexin',expression:'smile',text:'好。寫不完也會跟你說。'},
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
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤，Alison 負責吃。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤。'},
      {cg:'cg_midautumn_riverside'},   /* CG-14 中秋的河濱（BB 2026-10-14 ART_APPROVED）：去烤肉的玩家都有，從這一句起 */
      {speaker:null,text:'你被分到顧火。火一直熄。'},
      {if:{flags:['ZHE_CALLS_GE']},goto:'ge_after'},   /* AA_195 4-9（CAMP-FIX-614 程式 7）：到中秋烤肉還沒有「哥」的玩家（夜談選「跟你們一樣啦」），阿哲問同一段；選項、效果同夜談 */
      {speaker:'zhe',text:'欸，明軒說你比我們大一屆？'},   /* AA_372 第 10 項：宿營時明軒問過一字不差的同一句 */
      {choice:[{text:'「我大一歲。」',goto:'ge_old'},{text:'「我念過一個多月經濟，重考的。」',unless:{custom:G=>G.flags.ECON_PAST_SHARED==='full'},goto:'ge_econ'},{text:'「我不是說過了嗎？」',if:{custom:G=>G.flags.ECON_PAST_SHARED==='full'},goto:'ge_said'},{text:'「跟你們一樣啦。」',goto:'ge_same'}]},
      {label:'ge_old'},{speaker:'zhe',text:'那我們叫你哥？'},{speaker:'player',text:'不要。'},{speaker:'zhe',text:'（把剛烤好的那串遞給你）哥，這串給你。'},{set:{ZHE_CALLS_GE:true}},{goto:'ge_after'},   /* AA-B 02:13：烤肉版不說「晚安」*/
      {label:'ge_econ'},{speaker:'zhe',text:'真假！那你是學長欸。'},{speaker:'zhe',text:'……不對，哥。'},{set:{ZHE_CALLS_GE:true,ECON_PAST_SHARED:'full'}},{goto:'ge_after'},
      {label:'ge_said'},{speaker:'zhe',text:'對齁。哥。'},{set:{ZHE_CALLS_GE:true}},{goto:'ge_after'},
      {label:'ge_same'},{speaker:'zhe',text:'好喔。'},
      {label:'ge_after'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:null,text:'以安帶了一張「烤肉時間表」。'},
      /* YT-BBQ-WHY-1027（AA_486 第 2 節，企劃線 cd824bf41；使用者 10-27「為什麼中秋烤肉會有語彤是法律系還是?」）：原本一句「語彤帶了阿姨醃的肉。全場最好吃。」換三行，交代社會系的她怎麼會在這裡 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'語彤也來了，提著一盒阿姨醃的肉。阿哲在麵店揪人那天，阿姨在旁邊聽到了。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'阿姨叫我拿來的。她說常來吃麵的，都算自己人。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'阿姨醃的肉，全場最好吃。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰帶了考古題，被沒收了。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},set:{BBQ_BOHAN_SEIZED:true}},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:null,text:'隔壁房的方奕廷也來了，一直在講河邊的植物。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'阿姨醃的肉被搶光了。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'zhe',expression:'laugh',text:'可以叫阿姨開一個烤肉的菜單嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'不行。她會真的開。'},
      {unless:{flags:['KX_BBQ_COME']},goto:'end'},
      {speaker:null,text:'可昕來了。'},
      {choice:[{text:'「這是可昕，我女朋友。」',set:{KX_INTRO:'gf'},goto:'i1'},{text:'「她會出題考你們。」',set:{KX_INTRO:'quiz'},goto:'i2'},{text:'「讓她說我們怎麼認識的。」',set:{KX_INTRO:'story'},goto:'i3'}]},
      {label:'i1'},{speaker:'zhe',expression:'smile',text:'哪間學校的？'},{speaker:'kexin',expression:'smile',text:'政大的。考古題可以交換。'},{goto:'joke'},
      {label:'i2'},{speaker:'kexin',expression:'teasing',text:'刑總第一題。準備好了嗎？'},{speaker:'zhe',expression:'laugh',text:'我拒絕回答。'},{goto:'joke'},
      {label:'i3'},{speaker:'kexin',expression:'smile',text:'杜可昕。政大法律。我們以前是經濟系的同學。……後來一起重考。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'known'},
      {speaker:'zhe',expression:'surprised',text:'等一下。經濟系？重考？'},{speaker:'player',text:'……嗯。念了一個多月。'},
      {set:{ECON_PAST_SHARED:'full'}},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},mem:[{npc:'heroine_01',tag:'KNOWS_ECON_YEAR',note:'中秋烤肉：可昕說了你們以前是經濟系的同學'}]},{goto:'joke'},
      {label:'known'},{speaker:'zhe',expression:'laugh',text:'喔——就是那一年。'},
      {label:'joke'},{speaker:null,text:'之後阿哲和她比冷笑話。'},
      {choice:[{text:'（阿哲贏）',set:{KX_JOKE:'zhe'},goto:'zw'},{text:'（可昕贏）',set:{KX_JOKE:'kexin'},goto:'kw'}]},
      {label:'zw'},{speaker:'kexin',expression:'smile',text:'好，我回去練。'},{goto:'end'},
      {label:'kw'},{speaker:'kexin',expression:'laugh',text:'我練過。不要問跟誰。'},   /* AA_305 第 9 節 */
      {label:'end'} ],
    consequences:{flags:{MIDAUTUMN_Y1:true},stamp:['bbqDay'],memo:'中秋烤肉（河濱）'},
    after:(G)=>{ if(G.flags.KX_BBQ_COME) G.flags.KX_MET_NOODLE_TEAM=true; if(typeof ROM!=='undefined'&&ROM.k3Tell) ROM.k3Tell(G); } },   /* KX_MET_NOODLE_TEAM 只給可昕那邊用；選①「這是可昕，我女朋友。」＝在場的人 knowsGF（BB_191 9-4 #2）*/
  /* 以安新 3 宿舍的規則（交付清單 A14；交接包_v1 第 3 節、AA_113 事件 3）：祐廷不在，轉述。麵店團群組的訊息在 story3d.js 的 phoneRules（第 7 週週二晚上）；
     沒有加入麵店團群組的玩家，改成沛珊當面說同樣的內容（第 7 週起找她說話；要認識她）。只記旗標 AN_DORM_RULES（聽說，不寫成玩家在場）*/
  { id:'ev_an_dorm_rules_peishan', title:'宿舍的規則', participants:['classmate_peishan'], location:'any', trigger:'interact', priority:3, term:['Y1S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],custom:G=>{ if(G.flags.AN_DORM_RULES||typeof STORY==='undefined'||!STORY.termDay) return false; const g=G.phone&&G.phone.groups&&G.phone.groups.noodle_team; return !(g&&g.day<=STORY.termDay('Y1S1',7,2))&&G.day>=STORY.termDay('Y1S1',7,1); }},
    dialogue:[ {speaker:'classmate_peishan',expression:'thinking',text:'欸，你們宿舍規則有人全部讀完嗎？'},{speaker:'classmate_peishan',expression:'neutral',text:'我聽說以安讀完了，還寫了三頁意見。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'} ],
    consequences:{flags:{AN_DORM_RULES:'peishan'}} },
  /* G1 考完試走出教室（交付清單 A15：AA_13 G1）：大一上民總期中考考完，在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'mid'）；一定會發生。
     只有認識的人在場：柏翰沒見過＝第一句變成旁白（有人在問第二題）、他和芯慈的那段（和祐廷無關的一句）兩個人都認識才有；Alison、明軒、以安沒見過就跳過。
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
  { id:'ev_bohan_score', title:'你考幾分', participants:['classmate_bohan'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[10,11], carryTo:15, once:true, background:'blur',   /* AA_294 ②：第 10～11 週沒去民總，延到下一次出席（到第 15 週）*/
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。'},
      {speaker:'classmate_bohan',expression:'serious',text:'你民總幾分？'},
      {speaker:'classmate_bohan',expression:'neutral',text:'我問了十四個人。你是第十五個。'},
      {choice:[{text:'（告訴他分數）',goto:'tell'},{text:'「不想說。」',set:{BOHAN_SCORE:'no'},goto:'no'},{text:'「你考幾分？」',set:{BOHAN_SCORE:'asked'},consequences:{mem:[{npc:'classmate_bohan',tag:'ASKED_BACK',note:'期中放榜'}]},goto:'back'}]},
      {label:'tell'},{speaker:null,text:'你說了分數。'},
      {if:{custom:G=>typeof CLS!=='undefined'&&CLS.gradeOf(((CLS.rec(G)||{}).prep||{}).civ_general||0)==='很好'},goto:'hi'},
      {set:{BOHAN_SCORE:'lower'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他低）'}]},
      {speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他也寫進手機的備忘錄。'},{goto:'end'},
      {label:'hi'},{set:{BOHAN_SCORE:'higher'}},{mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'期中放榜，告訴他民總的分數（比他高）'}]},
      {speaker:null,text:'他點頭，寫進手機的備忘錄。'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{goto:'end'},
      {label:'no'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'他沒有生氣，只是把「15」改成「14」。'},{goto:'end'},
      {label:'back'},{speaker:null,text:'他停了一下。'},{speaker:'classmate_bohan',expression:'neutral',text:'……八十一。第六。'},{speaker:null,text:'第一次有人反問他。'},
      {label:'end'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_bohan')},speaker:'classmate_bohan',expression:'neutral',text:'考古題我晚上傳給你。',consequences:{contact:'classmate_bohan'}} ] },   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-5：期中放榜那天）。AA_372 第 16 項：8/29 起同寢，原本「你的聯絡方式。考古題要傳給你。」*/
  /* 考完的宵夜（交付清單 A15：AA_71 2-4、BB_95 3-6，AA 2026-10-14）：民總期中考那天晚上 20:30 公館滷味攤。公館有 3D 區域，滷味攤還沒有：先用出遊（轉場＋深色底，
     背景 gongguan_luwei 在 MISSING_EXTERNAL_ART）。誰揪：有麵店團群組＝阿哲在群組「考完了。滷味。」；沒有＝G1 結束時當面問。去不去由玩家選，不去不扣分。
     只有認識的人在場：明軒認識才有阿哲那句（考完當晚還沒有成績：「成績出來一定比我高」）；有 SAW_HIM_STUDY 多一個選項「……他有念啦。」→ 明軒瞪你一眼、請你一顆滷蛋；
     柏翰、芯慈、Alison 三個人都認識才有吵第三題那段。AA 的「小事」是條列，旁白照條列的字寫成句子 */
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
     （背景 noodle_table 在 MISSING_EXTERNAL_ART）。開頭不重複大一上（Alison、阿哲：認識 Alison 才有）；明軒的回聲（有 SAW_HIM_STUDY、認識明軒）——
     「（繼續吃麵）」是 LAWWW 照大一上「（繼續吃滷味）」加的選項字；接著沛珊和柏翰（BB_100 2-3：認識沛珊才有；旁白的「她」寫成「沛珊」）。
     沒去、在麵店團群組、認識沛珊：20:30 群組裡阿哲「……喔。」＋切成兩半的滷蛋照片，記「聽說」（HEARD_ABOUT）*/
  { id:'ev_midterm_walkout_y1s2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'crim_gen2', afterExam:'mid', term:['Y1S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {speaker:'zhe',expression:'laugh',text:'刑總二比上學期難好多，第三題我整題亂寫。'},   /* AA_209 附錄A §2 */
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:'zhe',expression:'smile',text:'晚上麵店，七點，來不來？'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID2:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID2:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','刑總二期中考'); } },
  { id:'ev_midterm_supper_y1s2', title:'考完的晚餐', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {if:EV_KNOWS('heroine_03'),speaker:null,text:'（阿姨的手腕綁著護腕。今天端麵的是語彤。）'},   /* AA_185 3-8：接得上語彤事件 4（阿姨扭到手）*/
      {unless:EV_KNOWS('heroine_03'),speaker:null,text:'（阿姨的手腕綁著護腕。今天端麵的是一個沒見過的女生。）'},   /* AA_373 #15：還沒認識語彤的玩家 */
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'今天不講考試。誰講誰請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'smile',text:'那第二題——'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'你請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'surprised',text:'我還沒講完！'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},goto:'mx'},{goto:'ps'},
      {label:'mx'},{speaker:'zhe',expression:'neutral',text:'明軒說他這次也沒念。'},
      {choice:[{text:'「……他有念。我看到了。」',set:{SUPPER2_MX:true},goto:'mx2'},{text:'（繼續吃麵）',goto:'ps'}]},
      {label:'mx2'},{speaker:null,text:'（他低頭吃了一口麵）'},{speaker:'classmate_mingxuan',expression:'laugh',text:'……好啦，這次我請。'},   /* AA_209 附錄B §2 */
      {label:'ps'},
      {if:{flags:['DORM_FOUR'],notFlags:['dating_classmate_peishan']},speaker:null,text:'（你想起柏翰這幾週都比較晚回 203。）'},   /* AA_209 第 4 節第 4 點（附錄 B 4-4 採用）：玩家住 203（四人房）才播 */
      {if:PS_BH,speaker:null,text:'柏翰幫沛珊把滷蛋切成兩半。'},   /* PS_BH：認識沛珊、沒有和她交往（AA_374 第 11 項：柏翰×沛珊那一段只在玩家沒有和沛珊交往時發生）*/
      {if:PS_BH,speaker:'zhe',expression:'surprised',text:'……喔。'},
      {if:PS_BH,speaker:null,text:'全桌安靜三秒。'},
      {if:PS_BH,speaker:'classmate_peishan',expression:'neutral',text:'對，我們在一起了。你們吃你們的。'},
      {if:PS_BH,speaker:'classmate_bohan',expression:'neutral',text:'上禮拜的事。'},
      {if:PS_BH,speaker:null,text:'（他把另一半滷蛋推回她碗裡。）'},
      /* AA_409 第 1 節（企劃線 86016b84；使用者 10-23 選擇題：沛珊大一上期末可以交往）：和祐廷交往中＝滷蛋夾一半給你；麵店團已經知道（ROM）＝一行旁白。接著柏翰算麵錢三句（AA_245 第 1 節；c42a0dd3 更正：兩個並存）*/
      {if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'（沛珊坐在你旁邊。她把碗裡的滷蛋夾了一半，放到你碗裡。）'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:'zhe',expression:'surprised',text:'……喔。'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'全桌安靜三秒。'},
      {if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:'classmate_peishan',expression:'neutral',text:'對。你們吃你們的。'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'（Alison 在桌子底下踢了阿哲一腳。）'},
      {if:{custom:G=>PS_DT(G)&&PS_TOLD(G)},speaker:null,text:'（沛珊把碗裡的滷蛋夾了一半，放到你碗裡。沒有人說話。）'},
      {if:{custom:PS_DT_BH},speaker:null,text:'（柏翰把每個人的麵錢算好，寫在餐巾紙上。）'},{if:{custom:PS_DT_BH},speaker:'classmate_bohan',expression:'neutral',text:'一個人一百一十五。阿哲你多一顆蛋，一百二十五。'},{if:{custom:PS_DT_BH},speaker:'zhe',expression:'neutral',text:'……你連這個都算。'},
      {call:async(G,GM)=>{ if(typeof MREL!=='undefined'&&MREL.ycSupper) await MREL.ycSupper(GM); }} ],   /* 沛珊和宥辰的第一次互動（AA_228 3-4 ①，台詞在 multirel_lines.js 的 YC.n1）*/   /* AA_409 第 1 節更正（企劃線 c42a0dd3）：滷蛋那幾行（或公開的那一行）之後接 AA_245 第 1 節柏翰算麵錢三句，兩個並存 */
    after:(G)=>{ if(!PS_DT(G)||typeof ROM==='undefined'||!ROM.learn) return; for(const x of ['zhe','yu','classmate_bohan','classmate_mingxuan']) if(typeof STORY==='undefined'||!STORY.knows||STORY.knows(x,G)) ROM.learn(G,x,'classmate_peishan','present'); },   /* 這一桌的人都知道了 */   /* AA_209 附錄A §2（2-1 第 5 節第 1 點：沛珊前一句接得上，不改）*/
    consequences:{stamp:['supperMid2Day'],memo:'考完的晚餐（阿鳳麵店長桌）'},
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||!PHONE.inGroup(G,'noodle_team')||typeof STORY==='undefined'||!STORY.knows('classmate_peishan',G)||(G.flags&&G.flags.dating_classmate_peishan)) return;   /* 和沛珊交往中：沒有柏翰那一段（AA_374 第 11 項）*/
      PHONE.at(G,q.day,Math.max(20.5,G.day===q.day?G.hour:0),[{th:'g:noodle_team',from:'zhe',text:'📷（一顆切成兩半的滷蛋）'},{th:'g:noodle_team',from:'zhe',text:'柏翰幫沛珊切的'},{th:'g:noodle_team',from:'zhe',text:'……他們在一起了'}],'zhe_supper_mid2_egg');   /* AA_373 #16：照交接包 v2（2026-10-16 改）——阿哲傳滷蛋照片，配「柏翰幫沛珊切的」「……他們在一起了」（原本只有「……喔。」看不出發生什麼事）*/
      if(typeof SOCIAL!=='undefined') SOCIAL.remember('classmate_peishan','HEARD_ABOUT','和柏翰在一起了（聽說）'); } },
  /* 經濟系的朋友（BB_96 第 10 節，BB 2026-10-14）——10-1 P4d「你怎麼又在這裡？」（大一下版）：重修經原（下）下課，普通教學館的走廊；第 2 週週五（3/6）。
     那天沒去上課的，延到下一個有去的週五（第 3～5、7 週；第 6 週週五是春假、第 8 週是期中考）；一直沒去就不發生。
     AA_294 ②（2026-10-18，企劃 b3ec8820）：不限第 2～5、7 週，這學期第一次出席經原下就演（考試週照舊不演：afterClass 不是考完的那一場）。
     例外（照舊）：在那之前已經在 10-3 見過阿勳（XUN_DAY）的玩家，照 AA-B 2026-10-16 的裁定走 SK03（ev_sk03_lunch：10-4「昨天那題我想通了。」＋P4d 的邀約句），不再演 P4d。
     阿勳（盧正勳，經濟系大二）、品妤（v1 K2 見過＝只點頭「你來了。」；沒見過＝先介紹自己）。兩個人還沒有 3D 人物，只有台詞（同 K2 的品妤）。
     通則（BB_105 2-1）：經濟系的朋友在法律系時期第一次出現，先加一句重新介紹；經濟系大一還沒實作，所有玩家都有阿勳那句。
     記 P4D_ANSWER（retake／good／long）、MET_XUN（法律系時期見過阿勳：之後的事件不再重新介紹）、MET_PINYU、ECON_HALLWAY_DAY（SK03 小福午餐從下一個週五開始）*/
  { id:'ev_econ_hallway', title:'你怎麼又在這裡？', participants:[], location:'any', trigger:'class', afterClass:'econ_principles_2', term:['Y1S2'], weekday:[5], once:true, background:'blur',
    prereq:{custom:G=>!G.flags.P4D_ANSWER&&G.flags.XUN_DAY==null},   /* P4D_ANSWER 只有這一場會記（演過了）；10-3 見過的走 SK03（上面）*/
    dialogue:[ {speaker:'阿勳',text:'……你怎麼又在這裡？'},
      /* 第二句（BB_96 10-1，BB-B 2026-10-16 2c67d4d7，AB-46）：已經聯絡過（MET_XUN：SK01 一律記；玩過經濟系那一年的也有）換成「法律系不是在對面嗎」；
         另外領過系外套（SOC_WRONG_BUILDING，SK02）＝「又走錯棟了？」；完全沒聯絡過的舊存檔照原本的重新介紹 */
      {if:{flags:['MET_XUN','SOC_WRONG_BUILDING']},speaker:'阿勳',text:'法律系不是在對面嗎。……又走錯棟了？'},
      {if:{flags:['MET_XUN']},unless:{flags:['SOC_WRONG_BUILDING']},speaker:'阿勳',text:'法律系不是在對面嗎。你跑來這裡做什麼？'},
      {unless:{flags:['MET_XUN']},speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'},
      {if:{flags:['MET_PINYU']},speaker:'品妤',text:'你來了。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},
      {choice:[{text:'「重修。」',set:{P4D_ANSWER:'retake'},goto:'r'},{text:'「我在法律系，很好。」',set:{P4D_ANSWER:'good'},goto:'g'},{text:'「說來話長。」',set:{P4D_ANSWER:'long'},goto:'l'}]},
      {label:'r'},{speaker:'阿勳',text:'重修。……你看起來比去年清醒。'},{goto:'end'},
      {label:'g'},{speaker:'阿勳',text:'看得出來。你走路變快了。'},{goto:'end'},
      {label:'l'},{speaker:'阿勳',text:'那下次說。'},
      {label:'end'},{speaker:'阿勳',text:'週五中午，我們在活大。你要來就來。'} ],   /* 大一下＝2026 春，小福已經拆了（AA_186 4-4）*/
    consequences:{flags:{MET_XUN:true,MET_PINYU:true},memo:'重修經原（下）下課，走廊上遇到經濟系那年的室友阿勳（盧正勳）'},
    after:G=>{ G.flags.ECON_HALLWAY_DAY=G.day; } },
  /* 經濟系的朋友（BB_96 10-2、BB_135 第 1 節，BB-B 2026-10-16 定稿）——SK03 週五的小福午餐：P4d 之後每個有課的週五，重修經原（下）下課，阿勳一句「小福。走不走？」，玩家選「一起去」／「今天不行」（不扣分，下週照問）。
     去了：第一次＝1-1；去過兩次以上的下一次＝1-3 芯慈走進小福（照 ECON_PAST_SHARED，記 ECON_LAW_BRIDGE）；其他＝1-2（一句旁白＋一句輪替，芯慈加入前／加入後兩組，不連續重複）；之後快轉到 13:00「午休結束。」。
     習慣記憶 meal:xiaofu:fri 每次 +1（after）。BB_135 的舞台說明改旁白。
     AA-B 2026-10-16 裁定：同一個週五的先後＝10-4 還債 ＞ 1-1 第一次 ＞ 1-3 芯慈 ＞ 1-2 平常（還債那天也是第一次去＝先 1-1，再接 10-4 三句；芯慈那一句只在 1-3 之後才有）；午餐後人留在原地。
     10-4 小福的還債（BB_96 10-4）：10-3 選「一起讀到閉館」（XUN_NIGHT）的玩家，第 11 週週五下課走廊阿勳先說「昨天那題我想通了。」；那天去了午餐＝還債；沒去＝「走啦」群組一張便當照片「欠你的，下週。」（story3d.js phoneRules），
     下一個去的週五照樣推過來（只發生一次，XUN_REPAID）*/
  { id:'ev_sk03_lunch', title:'週五的活大', participants:[], location:'any', trigger:'class', afterClass:'econ_principles_2', term:['Y1S2'], weekday:[5], background:'blur',
    prereq:{custom:G=>{ const F=G.flags; if(F.SK03_ASKED===G.day) return false; if(F.P4D_ANSWER) return F.ECON_HALLWAY_DAY!=null&&G.day>F.ECON_HALLWAY_DAY; if(F.MET_XUN&&F.XUN_DAY!=null&&G.day>F.XUN_DAY) return true;
      const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return !!t&&t.week>=8&&!(G.events&&G.events.done&&G.events.done.ev_econ_hallway); }},   /* BB_161 ⑱（AA-B 16:22 確認，BB-B 063ab633）：P4d 沒發生的玩家（第 2～7 週都沒去重修），之後第一次有去的週五下課在走廊直接遇到阿勳 */   /* AA-B 2026-10-16：只在 10-3 見過阿勳（沒有 P4d）的玩家也算重新認識，第 11 週週五起開 SK03 */
    dialogue:[ {if:{custom:G=>G.flags.SK03_HUODA===G.day},goto:'huoda'},   /* AA_350 R2：那個週五沒去經原下、12:00～13:00 下課選單選「先去吃飯→活大」（classes3d.js 的 CLS.sk03Huoda 記 SK03_HUODA）＝在活大演，開頭換一句、不出選項 */
      {if:{custom:G=>!!G.flags.XUN_NIGHT&&G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'昨天那題我想通了。'},   /* 10-4 走廊（第 11 週週五＝10-3 的隔天）*/
      {if:{custom:G=>!G.flags.P4D_ANSWER&&!G.flags.SK03_INV1&&!G.flags.MET_XUN},speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'},   /* ⑱ 走廊直接遇到：還沒見過＝10-1 那句完整的自我介紹（見過的照 P4d 的規則不重新介紹）*/
      {if:{custom:G=>!G.flags.P4D_ANSWER&&!G.flags.SK03_INV1},speaker:'阿勳',text:'週五中午，我們在活大。你要來就來。'},{unless:{custom:G=>!G.flags.P4D_ANSWER&&!G.flags.SK03_INV1},speaker:'阿勳',text:'活大。走不走？'},{set:{SK03_INV1:true,MET_XUN:true}},   /* 只在 10-3 見過的玩家第一次邀約照用 P4d 原句（AA-B）*/
      {choice:[{text:'「一起去」',consequences:{stamp:['SK03_LAST']},goto:'go'},{text:'「今天不行」',goto:'end'}]},
      /* 活大那一條（AA_350 R2）：阿勳已經坐在那裡；記的旗標和「一起去」一樣（SK03_INV1、MET_XUN、SK03_LAST），直接接 go 那一段（還債、第一次、芯慈的先後照舊）。選項兩個都有 goto，走廊那一條不會掉進來 */
      {label:'huoda'},{scene:'活大',bg:'xiaofu'},{speaker:'阿勳',text:'……你今天沒來上課。坐。'},{set:{SK03_INV1:true,MET_XUN:true}},{stamp:['SK03_LAST']},{goto:'go2'},
      {label:'go'},{scene:'活大',bg:'xiaofu'},
      {label:'go2'},
      {if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},unless:{flags:['SK03_FIRST']},goto:'first'},{if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},goto:'repay'},
      {unless:{flags:['SK03_FIRST']},goto:'first'},
      {if:{custom:G=>!G.flags.ECON_LAW_BRIDGE&&typeof EVENTS!=='undefined'&&EVENTS.habitCount({key:'meal:xiaofu:fri'})>=2},goto:'xinci'},
      {goto:'usual'},
      {label:'first'},{speaker:null,text:'週五的活大。阿勳占了靠窗的四人桌，品妤已經在吃了。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},   /* 品妤還沒見過（只在 10-3 見過阿勳的玩家）：照 v1 K2 的規則先介紹自己（AA-B）*/
      {speaker:'品妤',text:'重修生？你看起來很有覺悟。'},{speaker:'阿勳',text:'他去年也很有覺悟。只是方向不一樣。'},{speaker:'品妤',text:'……你講話還是一樣，不留情。'},   /* AA_305 第 9 節 */
      {set:{SK03_FIRST:true}},{if:{custom:G=>!!G.flags.XUN_NIGHT&&!G.flags.XUN_REPAID},goto:'repay'},{goto:'end'},
      {label:'repay'},{if:{custom:G=>G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'（把一個便當推過來）昨天那題的。還債。'},{unless:{custom:G=>G.flags.XUN_DAY!=null&&G.day===G.flags.XUN_DAY+1},speaker:'阿勳',text:'（把一個便當推過來）上週那題的。還債。'},   /* 延後一週：AA-B 改一個詞（第①級）*/{speaker:'品妤',text:'他從來沒請過我。'},{speaker:'阿勳',text:'妳又沒教過我統計。'},
      {set:{XUN_REPAID:true}},{goto:'end'},   /* AA_209 附錄A §2：芯慈分支最後一句（「……經濟系的人也會還債。」）刪 */
      {label:'xinci'},{speaker:null,text:'芯慈端著餐盤走進來，看見阿勳，停住了。'},
      {speaker:'classmate_xinci',text:'欸，你是統計課那個……'},/* AA_209 附錄A §2 */{speaker:'阿勳',text:'我。統計課坐第一排那個。'},{speaker:'classmate_xinci',text:'（看向你）你們認識？'},
      {choice:[{text:'「他是我以前的室友。」',if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x1'},{text:'「我們當過室友。」'/* AA_373 #4：和阿勳同寢只有一個多月（「念了一年經濟」是作廢設定）*/,unless:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x2'},{text:'（笑一笑帶過）',unless:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'x3'}]},
      {label:'x1'},{speaker:'classmate_xinci',text:'原來你們以前住同一間。'},{speaker:'classmate_xinci',text:'難怪你們講話有點像。'},{goto:'xend'},   /* AA_209 附錄A §2 */
      {label:'x2'},{speaker:'player',text:'他保齡球打得比我好太多了。'},   /* AA_305 第 9 節 */{speaker:'classmate_xinci',text:'那一年的事你之後要講給我聽。'},/* AA_209 附錄A §2 */{set:{ECON_PAST_SHARED:'full'}},{goto:'xend'},
      {label:'x3'},{speaker:'阿勳',text:'我們住過同一間。他沒說？'},{speaker:'classmate_xinci',text:'……他什麼都沒說。'},
      {label:'xend'},{speaker:'品妤',text:'好，多一個人。這桌要換大一點的。'},{speaker:'阿勳',text:'每週五，同一桌。'},{set:{ECON_LAW_BRIDGE:true}},{goto:'end'},
      {label:'usual'},{speaker:null,text:'週五的活大。品妤點的永遠是同一個便當，阿勳永遠在講統計。'},
      {if:{custom:G=>!G.flags.ECON_LAW_BRIDGE},goto:'pre'},{goto:'post'},
      {label:'pre'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===0},speaker:'阿勳',text:'統計這週講變異數。下週小考。'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'品妤',text:'你們法律系的期中考，也要背那麼多嗎？'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===2},speaker:'阿勳',text:'保齡球，這學期還欠我一場。'},{goto:'end'},   /* AA_305 第 9 節 */
      {label:'post'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===0},speaker:'classmate_xinci',text:'統計的筆記我帶來了。誰要先吵？'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'品妤',text:'芯慈，妳的雙主修還活著嗎？'},{if:{custom:G=>(G.flags.SK03_N|0)%3===1},speaker:'classmate_xinci',text:'活著。只是很累。'},
      {if:{custom:G=>(G.flags.SK03_N|0)%3===2},speaker:'阿勳',text:'法律系的，今天輪你請飲料。'},   /* AA_305 第 9 節 */
      {label:'end'} ],
    after:(G,GM)=>{ G.flags.SK03_ASKED=G.day; if(G.flags.SK03_LAST!==G.day) return; if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('meal:xiaofu:fri'); G.flags.SK03_N=(G.flags.SK03_N|0)+1;
      const h=G.hour%24; if(h<13&&GM.advance) GM.advance(13-h); if(GM.caption) GM.caption('','午休結束。',2400); } },
  /* SK03 1-4 沒去時（BB_135 1-4；AA-B 2026-10-16：第 8 週週五重修經原（下）期中考前、在重修教室，舞台說明「（考卷還沒發。）」）：沒有 ECON_LAW_BRIDGE 的玩家，芯慈說阿勳認識你。
     第 8 週沒去重修就延到下一個有去的週五（第 9、11 週…；不是考試的那幾週沒有「考卷還沒發。」）；整學期都沒去就沒有（ECON_LAW_BRIDGE 留到大二 SK09）。記 ECON_LAW_BRIDGE：之後的週五午餐芯慈已經在桌上 */
  /* P4 第二次大一＋P4c 坐過的位子（BB_105 第 3 節「P4 第二次大一」、P4c；AA_154 A51）：法律系第一次上重修的經濟學原理（大一上第 3 週週五，普通教學館 101＝P1 的同一間大教室），進教室、要開始上課時演。
     開頭 P4c 一句旁白（玩過經濟系大一的多半句，讀 P1 的座位 Y0_P1_SEAT；沒有值＝只有前半句）。ECON_PAST_SHARED 只升不降（none → half → full）：
     已經是 full＝阿哲知情的版本、不選；其他＝芯慈「你看起來好像來過這間教室。」三選一（① 升 full；② none 升 half、half 不變；③ 不變）。老師那兩句、B1 的旁白在課表第 1 週（syllabus）*/
  { id:'ev_p4_retake', title:'第二次大一', participants:['zhe','classmate_xinci'], location:'any', trigger:'class', beforeClass:'econ_principles_1', term:['Y1S1'], once:true, background:'blur',
    dialogue:[ {unless:{custom:G=>['xun','front','window'].includes(G.flags.Y0_P1_SEAT)},speaker:null,text:'這間教室，你一年前坐過。'},
      {if:{flagIs:{Y0_P1_SEAT:'xun'}},speaker:null,text:'這間教室，你一年前坐過。那時候你坐在阿勳旁邊。'},{if:{flagIs:{Y0_P1_SEAT:'front'}},speaker:null,text:'這間教室，你一年前坐過。那時候你坐在前排。'},
      {if:{flagIs:{Y0_P1_SEAT:'window'}},speaker:null,text:'這間教室，你一年前坐過。那時候你坐在靠窗。'},
      {speaker:'zhe',text:'這門課你選的？經濟學原理？'},{speaker:'player',text:'……我得修。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'known'},
      {speaker:'classmate_xinci',text:'你看起來好像來過這間教室。'},
      {choice:[{text:'「我念過一個多月。重考進來的。」',set:{ECON_PAST_SHARED:'full'},goto:'a'},{text:'「我自學過。」',goto:'b'},{text:'（笑一笑）',goto:'c'}]},
      {label:'a'},{speaker:'zhe',text:'所以你是留級生？'},{speaker:'player',text:'是重修生。'},{speaker:'classmate_xinci',text:'難怪。'},{goto:'end'},
      {label:'b'},{if:{custom:G=>G.flags.ECON_PAST_SHARED!=='half'},set:{ECON_PAST_SHARED:'half'}},{speaker:'classmate_xinci',text:'……自學的人不會知道這間教室的冷氣很冷。'},{goto:'end'},
      {label:'c'},{speaker:'zhe',text:'好神祕。我喜歡。'},{goto:'end'},
      {label:'known'},{speaker:'zhe',text:'對齁，你念過經濟。所以你是留級生？'},{speaker:'player',text:'是重修生。'},{speaker:'classmate_xinci',text:'那你來幫我看這題。'},
      {label:'end'} ] },
  /* P4b「你怎麼這麼熟？」（BB_105 P4b；台詞與機率 AA_154 A51）：大一上第 4、5、7 週經原下課，各 50%（同一週擲一次、最多一次）；ECON_PAST_SHARED 是 full 就不再觸發；觸發過記 P4B_SEEN（AA_40 慈 2 讀它）。
     「念過一年。重考進來的。」＝升 full；「……還好啦。」＝不變，芯慈照 half／none 說 BB_105 2-2 那一句（阿哲問的那週也是芯慈在旁邊說）*/
  { id:'ev_p4b_familiar', title:'你怎麼這麼熟？', participants:['classmate_xinci','zhe'], location:'any', trigger:'class', afterClass:'econ_principles_1', term:['Y1S1'], weeks:[4,5,7], background:'blur',
    prereq:{custom:G=>{ const F=G.flags, t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!t||F.ECON_PAST_SHARED==='full'||F.P4B_WK===t.week) return false;
      if(!F.P4B_ROLL||F.P4B_ROLL.wk!==t.week) F.P4B_ROLL={wk:t.week,hit:Math.random()<0.5}; return !!F.P4B_ROLL.hit; }},
    dialogue:[ {if:{custom:G=>(CALENDAR.termOf(G.day)||{}).week===4},speaker:'classmate_xinci',text:'你怎麼這麼熟？老師還沒講到的圖，你已經畫好了。'},
      {if:{custom:G=>(CALENDAR.termOf(G.day)||{}).week===5},speaker:'zhe',text:'欸，你怎麼都知道老師下一句要講什麼？'},
      {if:{custom:G=>(CALENDAR.termOf(G.day)||{}).week===7},speaker:'classmate_xinci',text:'期中考的範圍，你好像不用看。'},
      {choice:[{text:'「我念過一個多月。重考進來的。」',set:{ECON_PAST_SHARED:'full'},goto:'a'},{text:'「……還好啦。」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_xinci',text:'……難怪。那你來幫我看這題。'},{goto:'end'},
      {label:'b'},{if:{flagIs:{ECON_PAST_SHARED:'half'}},speaker:'classmate_xinci',text:'你不是自學的吧。……沒關係，不用說。'},{unless:{flagIs:{ECON_PAST_SHARED:'half'}},speaker:'classmate_xinci',text:'你一定念過。……沒關係，不用說。'},
      {label:'end'},{set:{P4B_SEEN:true}} ],
    after:G=>{ const t=CALENDAR.termOf(G.day); if(t) G.flags.P4B_WK=t.week; } },
  /* SK04 便利貼（BB_106 SK04；AA_154 A52）：法律系大一上第 3～16 週，週四上午大一英文（english_y1，共同教學館）。同一個座位下午是經濟系大二的統計學，唐睿坐；兩個人都不知道對方是誰。
     第一張（第 3～5 週第一次上課；AA_294 ②：沒去就到下一次出席，最晚第 12 週）三選一：回了（chair／law）才有之後的兩張和第 15 週的揭曉（那週沒來延到第 16 週；兩次都沒來就不揭曉）；不回＝不再出現。揭曉記 STICKY_NOTES（SK06、SK10 讀它）。
     之後的兩張回不回都可以，不影響揭曉。沒玩經濟系大一的玩家，唐睿多一句自我介紹 */
  ...(()=>{ const wk=G=>typeof CALENDAR!=='undefined'?(CALENDAR.termOf(G.day)||{}).week|0:0, on=G=>['chair','law'].includes(G.flags.SK04_REPLY);
    const base={ participants:[], location:'any', trigger:'class', beforeClass:'english_y1', term:['Y1S1'], once:true, background:'blur' };
    return [
      Object.assign({},base,{ id:'ev_sk04_note1', title:'便利貼', prereq:{custom:G=>{ const w=wk(G), w1=typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G); return (w1?w>=1:w>=3)&&w<=12&&!G.flags.SK04_REPLY; }},   /* AA_195 4-7 C：開學改 9/1 的局第 1 週起（舊局照舊第 3 週起）；AA_294 ②：下一次出席英文就出現，到第 12 週（原本第 1～3／3～5 週，沒去就沒有）*/
        dialogue:[ {speaker:null,text:'桌角貼著一張便利貼。'},{speaker:'便利貼',text:'這個位子的插座是壞的。'},
          {choice:[{text:'「椅子也是。」',set:{SK04_REPLY:'chair'}},{text:'「已報修。——法律系」',set:{SK04_REPLY:'law'}},{text:'（不回）',set:{SK04_REPLY:'none'}}]} ],
        after:G=>{ G.flags.SK04_WK=wk(G); G.flags.SK04_N=1; } }),
      Object.assign({},base,{ id:'ev_sk04_note2', title:'便利貼', prereq:{custom:G=>on(G)&&G.flags.SK04_N===1&&wk(G)>(G.flags.SK04_WK|0)&&wk(G)<=14},
        dialogue:[ {speaker:'便利貼',text:'統計好難。'},{choice:[{text:'「英文也是。」'},{text:'（不回）',set:{SK04_QUIET:true}}]} ],
        after:G=>{ G.flags.SK04_WK=wk(G); G.flags.SK04_N=2; } }),
      Object.assign({},base,{ id:'ev_sk04_note3', title:'便利貼', prereq:{custom:G=>on(G)&&G.flags.SK04_N===2&&!G.flags.SK04_QUIET&&wk(G)>(G.flags.SK04_WK|0)&&wk(G)<=14},
        dialogue:[ {speaker:'便利貼',text:'你們法律系也要考英文？'},{choice:[{text:'「我們什麼都要考。」'},{text:'（不回）'}]} ],
        after:G=>{ G.flags.SK04_WK=wk(G); G.flags.SK04_N=3; } }),
      Object.assign({},base,{ id:'ev_sk04_reveal', title:'是你？', participants:[], prereq:{custom:G=>{ const w=wk(G); return on(G)&&(w===15||w===16)&&!G.flags.STICKY_NOTES; }},
        dialogue:[ {speaker:'唐睿',text:'……是你？'},{speaker:'player',text:'……是你？'},
          {unless:{flags:['PLAYED_Y0']},speaker:'唐睿',text:'唐睿。全系最會講話的那個。……你真的忘了我？'},{set:{STICKY_NOTES:true,KNOWS_TANG:true}} ] }) ]; })(),
  /* SK01 對面的舊系館（BB_106 SK01，BB-B 2026-10-16 定稿 d5224961；AA_154 A52 ①）：法律系第 2 天（9/18 週四）民總下課、第二天的劇情結束以後，第一次站在霖澤館前
     （大一上第 3～6 週；社科圖開著、接下來 75 分鐘沒有課：STORY.sk01Ready）。阿勳兩則私訊（沒玩經濟系那一年的先多一則重新介紹）→
     「去社科圖」＝直接 2D（soc_library，社科院在對面不用走過去；一小時）／「先回宿舍」＝他回一個貼圖，第 4 天以後第一次經過法學院廣場，二樓的窗口揮手（ev_sk01_wave）。
     去不去都記 MET_XUN（法律系時期第一次聯絡：大一下的 P4d 換成已經聯絡過的開頭）、SK01_CHOICE（go／home）、SK01_DAY。玩過經濟系那一年的玩家多一句保齡球（R7 打過、沒打過都通）*/
  { id:'ev_sk01_soc', title:'對面的舊系館', participants:[], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[1,2,3,4,5,6],   /* AA_195 4-7 C：第 1～6 週（舊局第 3 週才開始，照樣到第 6 週）*/ once:true, background:'blur', near:{x:33,z:-97,r:10},
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.sk01Ready(G)},
    dialogue:[ {unless:{flags:['PLAYED_Y0']},phone:'econ_zhengxun',text:'是我，阿勳。你經濟系那年的室友。'},
      {phone:'econ_zhengxun',text:'你在對面喔？我在二樓看到你了。'},
      {phone:'econ_zhengxun',text:'下課來圖書館。我幫你佔位。你以前那一罐，我也買了。'},
      {choice:[{text:'（去社科圖）',set:{SK01_CHOICE:'go'},goto:'go'},{text:'（先回宿舍）',set:{SK01_CHOICE:'home'},goto:'home'}]},
      {label:'home'},{phone:'econ_zhengxun',text:'（貼圖）'},{goto:'end'},
      {label:'go'},{scene:'社科院圖書館・閱覽區',bg:'soc_library'},
      {speaker:null,text:'社科圖二樓，靠窗那一排。阿勳旁邊的位子上，壓著一本統計課本。'},
      {speaker:null,text:'桌上有一罐飲料。是你以前常喝的那一種。'},
      {speaker:'阿勳',text:'坐。課本是佔位用的，我沒在讀。'},
      {speaker:'player',text:'……你還記得。'},
      {speaker:'阿勳',text:'兩個月。看也看會了。'},   /* AA_372 第 9 項：經濟系只念一個多月、同房不到兩個月 */
      {if:{flags:['PLAYED_Y0']},speaker:'阿勳',text:'保齡球館，我還是每個週末去。……你來的話，就是兩個人。'},
      {speaker:'阿勳',text:'讀不下去就過來。這裡的位子，我很會佔。'},
      {advance:1},
      {label:'end'} ],
    consequences:{flags:{MET_XUN:true},stamp:['SK01_DAY'],memo:'經濟系那年的室友阿勳，在對面的社科院傳訊息來'} },
  /* SK01 選了「先回宿舍」：第 4 天以後第一次經過法學院廣場（霖澤館和萬才館之間；看得到社科院的正面），一句旁白（BB_106 SK01 定稿）*/
  { id:'ev_sk01_wave', title:'', participants:[], location:'campus', trigger:'auto', term:['Y1S1'], once:true, background:'blur', near:{x:61,z:-94,r:22}, time:[8.5,19.5],
    prereq:{custom:G=>G.flags.SK01_CHOICE==='home'&&G.flags.SK01_DAY!=null&&G.day>G.flags.SK01_DAY},   /* AA_195 4-7 C：SK01 的隔天以後（原本另外寫死 G.day>=4，開學改 9/1 以後第 4 天還在開學前）*/
    dialogue:[ {speaker:null,text:'社科院二樓的窗口，有人在對你揮手。是阿勳。……他揮完就轉身進去了。'} ] },
  /* SK02 你的系外套還在這裡（BB_106 SK02，BB-B 2026-10-16 定稿 d5224961；AA_154 A52 ②）：SK01 之後，大一上第 4～7 週平日 13:00～17:00（系辦開門），
     阿勳第 4 週週一 15:00 的私訊（story3d.js phoneRules 'sk02_dm'；SK01 比週一晚的，排在 SK01 隔天以後第一個平日）→ 走到社科院大樓的門口〔3D，東面正門〕→ 2D 系辦（soc_office）。
     三個選擇記 ECON_JACKET（wear／xun／closet）；領了外套就記 SOC_WRONG_BUILDING（經濟系那群之後說「走錯棟」）。①隔天起七天內下一次霖澤館的課，阿哲一句（ev_sk02_spy）；
     ②阿勳在旁邊（npcNear）當面說，不在＝旁白＋當晚 21:00 私訊（phoneRules 'sk02_gift'）。阿勳那句「真的重三倍」也只有他在旁邊才有（大一上他還沒有作息，實際上不會出現）。
     沒去：第 8 週週一以後回到男生宿舍門廳，櫃台的旁白＋阿勳的紙條（STORY.sk02W8，BB-B 66cf3ed4）；房間裡的外套三版在 story3d.js roomItemList */
  { id:'ev_sk02_jacket', title:'你的系外套還在這裡', participants:[], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[4,5,6,7], weekday:[1,2,3,4,5], time:[13,17], once:true, background:'blur', near:{x:16,z:-85,r:3.5},   /* 社科院大樓的正門（東面柱廊裡、朝小椰林道；src/data/socsci_layout.js 的 mainDoor (15.4,−85)；X75 搬到霖澤館西南以前是 (96,−50)）*/
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.sk02Open(G)},
    dialogue:[ {speaker:null,text:'你還記得哪一台電梯比較快。只是公告欄上，已經沒有一張是寫給你的。'},
      {scene:'經濟系系辦',bg:'soc_office'},
      {speaker:'系辦助理',text:'學號給我。……這個學號，不在我們系的名單上了耶。'},
      {speaker:'player',text:'我現在是法律系的。'},
      {speaker:'系辦助理',text:'……喔，那個轉系的。外套在這裡，等你快一年了。'},
      {if:{custom:G=>STORY.xunNear()&&!!G.flags.PLAYED_Y0},speaker:'阿勳',text:'家豪學長說得對。真的重三倍。'},
      {if:{custom:G=>STORY.xunNear()&&!G.flags.PLAYED_Y0},speaker:'阿勳',text:'……法律系的書，真的比較重。'},
      {choice:[{text:'（穿去霖澤館上課）',set:{ECON_JACKET:'wear'},goto:'end'},{text:'（送給阿勳）',set:{ECON_JACKET:'xun'},goto:'xun'},{text:'（收進衣櫃）',set:{ECON_JACKET:'closet'},goto:'end'}]},
      {label:'xun'},{if:{custom:()=>STORY.xunNear()},speaker:'阿勳',text:'我現在有兩件，輪流穿。'},
      {unless:{custom:()=>STORY.xunNear()},speaker:null,text:'你請系辦助理轉交給阿勳。'},{unless:{custom:()=>STORY.xunNear()},set:{SK02_GIFT_DM:true}},
      {label:'end'},{advance:0.25} ],
    consequences:{flags:{SOC_WRONG_BUILDING:true},stamp:['SK02_DAY'],memo:'去經濟系系辦領了去年開學訂的系外套'} },
  /* SK02 ①穿去霖澤館上課：領外套的隔天起七天內，下一次霖澤館（201）的課上課前，阿哲一句（AA_154 A52 ②）*/
  { id:'ev_sk02_spy', title:'', participants:['zhe'], location:'any', trigger:'class', beforeClass:it=>!!(it&&it.room&&it.room.zone==='classroom'), term:['Y1S1'], once:true, background:'blur',
    prereq:{custom:G=>G.flags.ECON_JACKET==='wear'&&G.flags.SK02_DAY!=null&&G.day>G.flags.SK02_DAY&&G.day<=G.flags.SK02_DAY+7},
    dialogue:[ {speaker:'阿哲',text:'你是經濟系派來的臥底嗎？'} ] },
  { id:'ev_sk03_xinci_class', title:'統計課那個人', participants:['classmate_xinci'], location:'any', trigger:'class', beforeClass:'econ_principles_2', term:['Y1S2'], weekday:[5], once:true, background:'blur',
    prereq:{custom:G=>{ if(!G.flags.P4D_ANSWER||G.flags.ECON_LAW_BRIDGE||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=8; }},
    dialogue:[ {if:{custom:G=>typeof CALENDAR!=='undefined'&&(CALENDAR.termOf(G.day)||{}).week===8},speaker:null,text:'考卷還沒發。'},
      {speaker:'classmate_xinci',text:'我們統計課那個人說他認識你。'},{speaker:'classmate_xinci',text:'盧正勳。他說你還欠他一場保齡球。'},   /* AA_305 第 9 節 */
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_xinci',text:'原來你們以前住同一間。'},/* AA_209 附錄A §2 */{unless:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_xinci',text:'你沒說過。……沒關係，不用說。'},
      {speaker:'classmate_xinci',text:'你們週五都在活大吃？那我下次可以一起嗎？'},{set:{ECON_LAW_BRIDGE:true}} ] },   /* AA_209 附錄A §2 */
  /* SK05 三閃，販賣機見（大一版；BB_135 第 2 節、BB_96 10-5、BB_106 SK05）：期末考週玩家閃三下（story3d.js phoneRules 的 23:00 訊息）→ 阿勳在法學院廣場的販賣機前（作息 SK05_GO），
     走到他旁邊（npcNear）才算「去」；只回訊息不算。記 SK05_Y1；大二、大三照 BB_106 SK05（之後做）。走到一半回頭＝23:45 阿勳傳「……你閃了三下又不來。」「明年再說。」（不扣分）*/
  { id:'ev_sk05_vending_y1', title:'三閃，販賣機見', participants:[], location:'campus', trigger:'auto', npcNear:'econ_zhengxun', time:[23,23.75], term:['Y1S2'], weeks:[16], once:true, background:'blur',
    prereq:{custom:G=>G.flags.SK05_GO===G.day},
    dialogue:[ {speaker:'阿勳',text:'法律系考試考什麼？'},{speaker:'player',text:'一題寫一整頁。要寫理由。'},{speaker:'阿勳',text:'一整頁？經濟系至少有標準答案。'},{speaker:'阿勳',text:'……好啦，不一定。'},
      {speaker:null,text:'他按了兩罐一樣的飲料，丟一罐給你。'},{speaker:'阿勳',text:'明年也閃三下。'},{set:{SK05_Y1:true,MET_XUN:true}} ] },
  /* ===== BB_106 法律系大一那幾件（企劃線 BB_106@71b3e6c3，AA-C 2026-10-18 審過＝可以實作；白名單 LAWWW-C 10-21 已登記）：SK06（V2-SK06）、SK07（V2-SK07）、
     日常 D1、D2（V1-B106-D1D2）、4-2 的球賽（V1-B106-42）。台詞照稿；舞台說明改成旁白的地方標在那一行；時間、條件的寫法在 story3d.js（S.sk06Open、S.b106d2Due、S.fdormGather、手機的 4-2）。
     經濟系的朋友在法律系時期第一次出現先加一句重新介紹（BB_105 2-1 通則；STORY.tangIntro、STORY.wlIntro）===== */
  /* SK06 特別感謝：法律系的路人：品妤私訊以後（大一下第 10 週週一 16:00），第 10～14 週週一、三、五 17:00～20:00（她週二、四在補習班）走到社科院大樓的門口＝2D 三樓的討論室（AA_145：classroom_small）。
     報告題目「學生宿舍要用抽籤，還是用拍賣？」；三選一：①用經濟學反問 ②用法律的角度（法律審查 BB_115 L419 無誤：只寫一般原則，不給結論）③找阿哲來。
     有 STICKY_NOTES（SK04）的玩家，桌上有一張唐睿的便利貼。去不去都記 SOC_ROAD_PERSON（之後唐睿叫他「路人」：D2、SK08）；沒去＝第 15 週週一 21:00 群組一則（story3d.js）*/
  { id:'ev_sk06_roadperson', title:'特別感謝：法律系的路人', participants:[], location:'campus', trigger:'auto', term:['Y1S2'], weeks:[10,11,12,13,14], weekday:[1,3,5], time:[17,20], once:true, background:'blur', near:{x:16,z:-85,r:3.5},   /* 社科院大樓的正門（同 SK02）*/
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.sk06Open&&STORY.sk06Open(G)},
    dialogue:[ {scene:'社科院・三樓的討論室',bg:'classroom_small'},
      {speaker:null,text:'白板上寫著報告題目：「學生宿舍要用抽籤，還是用拍賣？」'},   /* 舞台說明（白板、報告題目）改旁白 */
      {if:{flags:['STICKY_NOTES']},speaker:null,text:'討論室的桌上，有一張唐睿的便利貼。'},{if:{flags:['STICKY_NOTES']},speaker:'便利貼',text:'插座只有一個是好的。這次是真的。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},   /* 通則：品妤用 BB_96 10-1 那句（BB_105 2-1 寫「可昕的室友」，她們已經不是室友；給 AA 的問題）*/
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.tangIntro(G)},speaker:'唐睿',text:'唐睿。全系最會講話的那個。'},{set:{MET_TANG:true}},
      {speaker:'品妤',text:'教授要「法律的觀點」。所以我們需要一個法律系的。'},
      {speaker:'player',text:'所以我是被抽中的？'},
      {speaker:'品妤',text:'你是被拍賣的。得標價，一杯紅茶。'},
      {choice:[{text:'「先想想誰會被排擠：付不起的人。」',hint:'用經濟學反問',set:{SK06_CHOICE:'econ'},goto:'a'},{text:'「公立大學分配宿舍，要考慮平等，不能只看誰出得起錢。」',hint:'用法律的角度',set:{SK06_CHOICE:'law'},goto:'b'},{text:'「我找一個人來。」',set:{SK06_CHOICE:'zhe'},goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'……這是福利經濟學的問題。我們漏了。'},{goto:'end'},
      {label:'b'},{speaker:'品妤',text:'這句放最後一頁。'},{goto:'end'},
      {label:'c'},{speaker:'阿哲',text:'用猜拳。'},{speaker:'品妤',text:'……其實那是抽籤的一種。'},{speaker:null,text:'唐睿把猜拳寫進了附錄。'},
      {label:'end'},{speaker:null,text:'報告的最後一頁寫著：「特別感謝：法律系的路人」。'},   /* 「後續記憶」改旁白 */
      {set:{SOC_ROAD_PERSON:true}},{advance:1} ],
    consequences:{stamp:['SK06_DAY'],memo:'社科院的討論室：幫經濟系的報告寫「法律的觀點」那一頁'} },
  /* SK07 唐睿的即興劇：大一下第 14 週週一 21:00 唐睿在群組「給我一個觀眾。一個就好。」→ 排進行程：第 14 週週三 19:00 博雅的教室（出遊；即興劇社借來辦期末小演出，2D classroom_small，同 E18）。
     「觀眾給一個詞」三選一記 IMPROV_WORD（喊的詞，SK11 的主持詞會用）；③「長頸鹿的尾巴！」只有玩過經濟系大一、知道這個詞的人（PLAYED_Y0＋E12_ANSWER）。散場品妤一句。
     沒去＝當晚 21:30 品妤在群組傳影片。博雅前的海報（另一個觸發）還沒做：海報是場景的東西（D108 歸 LAWWW2）*/
  { id:'ev_sk07_improv', title:'唐睿的即興劇', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'博雅・教室',bg:'classroom_small'},
      {speaker:null,text:'即興劇社借了博雅的教室，辦期末的小演出。品妤坐在第一排，沒有表情。阿哲是被你拉來的。'},   /* 舞台說明（場景、人物）改旁白 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.tangIntro(G)},speaker:'唐睿',text:'唐睿。全系最會講話的那個。'},{set:{MET_TANG:true}},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},
      {speaker:null,text:'輪到「觀眾給一個詞」。'},
      {choice:[{text:'「善意第三人！」',set:{IMPROV_WORD:'善意第三人'},goto:'a'},{text:'「機會成本！」',set:{IMPROV_WORD:'機會成本'},goto:'b'},{text:'「長頸鹿的尾巴！」',if:{flags:['PLAYED_Y0','E12_ANSWER']},set:{IMPROV_WORD:'長頸鹿的尾巴'},goto:'c'}]},
      {label:'a'},{speaker:null,text:'唐睿演一個一直買到怪東西、每次都說「我不知道」的路人。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'唐睿演一個選不出午餐的人，演到活大的自助餐收攤。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'唐睿停了一下。'},{speaker:'唐睿',text:'……這個詞，有人用過了。'},{speaker:null,text:'然後還是演了一隻長頸鹿。'},
      {label:'end'},{speaker:'品妤',text:'他說是為了練膽量。我覺得是為了社辦的冷氣。'} ],
    consequences:{memo:'博雅的教室：唐睿的即興劇'},
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; const gid=PHONE.inGroup(G,'econ_friends')?'econ_friends':(PHONE.inGroup(G,'econ_class')?'econ_class':null); if(!gid) return; const T='g:'+gid;
      PHONE.at(G,q.day,Math.max(21.5,G.day===q.day?G.hour+0.02:0),[{th:T,from:'econ_pinyu',name:'品妤',text:'📹（一段影片）'},{th:T,from:'econ_pinyu',name:'品妤',text:'唐睿的即興劇，今天演一棵樹。演得很好。'}],'sk07_video'); } },
  /* 4-2 韋綸的球賽門票（大四下第 6 週）：選「走。」＝那個週六晚上用摘要帶過（出遊，must：那晚不能另排別的事）。摘要沒有旁白稿——只有出發的字卡、時間往後 3 小時（給 AA 的問題）；
     回來以後群組一張看台上的合照＋韋綸一句、記 WL_GAME（story3d.js 手機的 4-2）*/
  { id:'ev_b106_42_game', title:'球賽', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {speaker:null,text:'（球場的看台。韋綸一邊看球，一邊在手機上記數字。）'},
      {speaker:null,text:'（他們的隊每得一分，他就站起來喊「走啦！」，坐下來，再記一個數字。）'},
      {speaker:null,text:'（可昕坐在你旁邊。她看的不是球，是韋綸的手機。）',if:{flags:['WL_GAME_KX','dating_kexin']}} ] },   /* AA_383 第 4-1 節（企劃線 98516b51）：出發的字卡之後、時間往後 3 小時之前；和可昕交往中、她在群組說了要來（WL_GAME_KX：選「走。」那時候交往中）多最後一句。回來以後群組的合照、韋綸那句照舊 */
  /* BB_106 日常 D1 大一女舍門口的長椅：法律系大一，等要一起出門的以安（麵店團；週二麵店日 19:00 在女舍門口集合，STORY.fdormGather——D4b 同一個集合，給 AA 的問題）。
     18:30～19:00 人在長椅旁＝品妤來送東西給住大一女舍的直屬學妹，經過：「你又在等人？這次等誰？」。所有玩家都有「又」字（經濟系那年他在這裡等過人，劇情事實）。
     法律系時期第一次見到品妤（MET_PINYU 沒有）先加一句介紹。她那時候照作息不在學校（大一下週二晚上在補習班櫃台）就沒有。一次 */
  { id:'ev_b106_d1_bench', title:'', participants:[], location:'campus', trigger:'auto', near:{x:-93,z:54.26,r:3}, term:['Y1S1','Y1S2'], weekday:[2], time:[18.5,19], once:true, tier:'short', building:'fdorm', background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fdormGather&&STORY.fdormGather(G)&&!STORY.awayNow('econ_pinyu',G)},
    dialogue:[ {speaker:null,text:'品妤來送東西給住大一女舍的直屬學妹，經過長椅。'},   /* 舞台說明改旁白 */
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'曾品妤。經濟系，可昕以前的室友。'},{set:{MET_PINYU:true}},
      {speaker:'品妤',text:'你又在等人？這次等誰？'} ] },
  /* BB_106 日常 D2 社科院—霖澤館—博雅的偶遇表（規則在 story3d.js S.b106d2Due）：擲到的人照作息站在那裡（characters.js 的 b106d2），走到旁邊（npcNear）才說一句；每人每天一句、同一句只說一次。
     週五中午的活大＝SK03、期中期末前的博雅＝SK10、期末考週的販賣機＝SK05（各自的事件）；可昕和品妤在社科院門口那一列（交往中、她來台大的日子）還沒做：遊戲裡她來台大只有 2D 的出遊（給 AA 的問題）
     AA_521（0f4b48f20）：大一下起每人每學期 a、b 兩句（品妤 ev_b106d2_pinyu 一學期一句）——鍵、句子、品妤的事件在 src/econfr3d.js、src/data/econfr_lines.js（載入時接在這三個事件後面）*/
  { id:'ev_b106d2_weilun', title:'', participants:[], location:'campus', trigger:'auto', npcNear:'econ_weilun', nearDist:3, term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,2,3,4,5], time:[12,12+25/60], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'econ_weilun')},
    dialogue:[ {pick:{flag:'B106D2_K',from:G=>[STORY.b106d2Key(G,'econ_weilun')]}},
      {if:{custom:G=>STORY.wlIntro(G)},speaker:'韋綸',text:'韋綸！騎車的！'},{set:{MET_WEILUN:true}},
      {if:{flagIs:{B106D2_K:'wl_first'}},speaker:'韋綸',text:'欸！……喔你現在是法律系的。那也走啦！'},{if:{flagIs:{B106D2_K:'wl_first'}},set:{WL_SAID_LAW:true}},   /* 和 BB_105 P5 共用「說過了」的紀錄（AA_154 第 3 節）*/
      {if:{flagIs:{B106D2_K:'wl_go'}},speaker:'韋綸',text:'走啦！'},
      {if:{flagIs:{B106D2_K:'wl_bike'}},speaker:'韋綸',text:'走啦！……這台是我自己的。有發票。'} ],
    after:G=>{ STORY.b106d2Done(G,'econ_weilun',G.flags.B106D2_K); delete G.flags.B106D2_K; } },
  { id:'ev_b106d2_tang', title:'', participants:[], location:'campus', trigger:'auto', npcNear:'econ_tangrui', nearDist:3, term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,2,3,4,5], time:[15+20/60,15.75], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'econ_tangrui')},
    dialogue:[ {pick:{flag:'B106D2_K',from:G=>[STORY.b106d2Key(G,'econ_tangrui')]}},
      {if:{custom:G=>STORY.tangIntro(G)},speaker:'唐睿',text:'唐睿。全系最會講話的那個。'},{set:{MET_TANG:true}},
      {if:{flagIs:{B106D2_K:'tr_road'}},speaker:'唐睿',text:'路人！'},
      {if:{flagIs:{B106D2_K:'tr_wrong'}},speaker:'唐睿',text:'走錯棟的！'},
      {if:{flagIs:{B106D2_K:'tr_law'}},speaker:'唐睿',text:'法律系的！'} ],
    after:G=>{ STORY.b106d2Done(G,'econ_tangrui',G.flags.B106D2_K); delete G.flags.B106D2_K; } },
  { id:'ev_b106d2_xun', title:'', participants:[], location:'campus', trigger:'auto', npcNear:'econ_zhengxun', nearDist:3, term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,2,3,4,5], time:[15+20/60,15.75], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'econ_zhengxun')},
    dialogue:[ {pick:{flag:'B106D2_K',from:G=>[STORY.b106d2Key(G,'econ_zhengxun')]}},   /* AA_521：照鍵演（同韋綸、唐睿）；大一下起每學期的句子 src/econfr3d.js 接在後面 */
      {unless:{flags:['MET_XUN']},speaker:'阿勳',text:'盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'},   /* 通則：阿勳用 BB_96 10-1 那句 */
      {if:{flagIs:{B106D2_K:'xun_sched'}},speaker:'阿勳',text:'你們法律系的課表，是不是也很不合理？'},{set:{MET_XUN:true}} ],
    after:G=>{ STORY.b106d2Done(G,'econ_zhengxun',G.flags.B106D2_K||'xun_sched'); delete G.flags.B106D2_K; } },
  /* 語彤（AA 的角色；AA 2026-10-13 同意）：週一、五 17:20 社會系下課（週三 17:40 她在 118 巷，AA_320），社科院門口（社會系館旁）。照 ECON_PAST_SHARED：full＝「又回來看舊系館？」；none（沒說過）＝她知道一半，記 YT_KNOWS_ECON；
     half（說過自學）＝玩家選「我以前常來這棟借書。」（維持原本的說法）或「……其實我念過一個多月。」（升成 full，之後麵店團也知道——稿寫「念過一年」，同一列已經更正「念了一年」是作廢的設定；給 AA 的問題）。一次 */
  { id:'ev_b106d2_yutong', title:'', participants:['heroine_03'], location:'campus', trigger:'auto', npcNear:'heroine_03', nearDist:3, term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,5], time:[17+20/60,17+50/60], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'heroine_03')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','FIRST_MET')},
    dialogue:[ {speaker:'heroine_03',text:'你怎麼在我們這一區？'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'full'},{if:{flagIs:{ECON_PAST_SHARED:'half'}},goto:'half'},
      {speaker:'player',text:'我以前在這棟上過課。'},{speaker:'heroine_03',text:'……你以前是經濟系的？'},{speaker:'player',text:'念了一個多月。'},{set:{YT_KNOWS_ECON:true}},{goto:'end'},
      {label:'full'},{speaker:'heroine_03',text:'又回來看舊系館？'},{goto:'end'},
      {label:'half'},{choice:[{text:'「我以前常來這棟借書。」',goto:'end'},{text:'「……其實我念過一個多月。」',set:{ECON_PAST_SHARED:'full'},goto:'end'}]},
      {label:'end'} ],
    after:G=>STORY.b106d2Done(G,'heroine_03',null) },
  /* ===== BB_105 大一女舍門口（企劃線 BB_105@68a8479e，AA-C 2026-10-18 審過＝可以實作；白名單 LAWWW-C 10-21 已登記；V1-B105-D2）：D4、D4b（這裡）；D7 宿舍的人們、D9 法服的攤位在 src/crowd3d.js。
     祐廷不進女舍，場景只有門口（5-1）；晚上不排長戲 ===== */
  /* D4 一年後，再走到女舍門口（AA_289 5-4：讀書會第 10 週才開，改成沛珊把借的課堂筆記還給祐廷）：大一上第 4～8 週，12:00～21:00 走到大一女舍門口（長椅一帶）。
     要有沛珊的聯絡方式（第一句是她的私訊）、她在臺北（單數週末回台中）。旁白「一年前，你常在這裡等人。」只出現這一次（所有玩家都有：經濟系那年他和可昕交往、她住這裡，是劇情事實）。
     稿沒有寫怎麼約的（借筆記也沒有另外一場）：走到門口就演，當作已經說好（給 AA 的問題）。一次 */
  { id:'ev_b105_d4_notes', title:'一年後，再走到女舍門口', participants:['classmate_peishan'], portraitLater:true, location:'campus', trigger:'auto', near:{x:-93,z:56,r:5}, term:['Y1S1'], weeks:[4,5,6,7,8], time:[12,21], once:true, tier:'short', building:'fdorm', background:'blur',
    prereq:{custom:G=>typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')&&typeof STORY!=='undefined'&&!!STORY.freeNow&&STORY.freeNow('classmate_peishan',G)},   /* 她照作息沒有別的事（上課、總圖、118 巷的時候不演）*/
    dialogue:[ {phone:'classmate_peishan',text:'我下樓了！你等我一下下'},
      {speaker:null,text:'一年前，你常在這裡等人。'},
      {speaker:'classmate_peishan',text:'（下樓）對不起！你的筆記我找了一下……'},
      {speaker:'classmate_peishan',text:'在我手上。我自己拿著還在找。'},
      {speaker:'classmate_peishan',text:'謝謝你借我！第三章我抄完了。'} ],
    consequences:{memo:'大一女舍門口：沛珊還了借的筆記'} },
  /* D4b 以安準時下樓（背／短，大一上～大一下，可重複）：麵店團在大一女舍門口集合（STORY.fdormGather：週二麵店日 19:00；同一個集合 BB_106 日常 D1）——她一定是第一個下來的人。
     19:00～19:15 人在長椅旁：「七點。你們遲到兩分鐘。」。隔兩週才再一次（cooldown 14 天）*/
  { id:'ev_b105_d4b_on_time', title:'', participants:['heroine_01'], location:'campus', trigger:'auto', near:{x:-93,z:54.26,r:4}, term:['Y1S1','Y1S2'], weekday:[2], time:[19,19.25], cooldown_days:14, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fdormGather&&STORY.fdormGather(G)},
    dialogue:[ {speaker:'heroine_01',text:'七點。你們遲到兩分鐘。'} ] },
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
     以安揪人（週二在麵店團群組，story3d.js phoneRules）；以安、Alison、阿哲照作息在 101（characters.js），散場後以安、Alison 去博雅的圓桌。
     去不去看玩家週四有沒有走進博雅 101：坐下選「聽演講」＝這一段（之後快轉到 20:30）；坐著待到結束也算聽完（沒有這一段）；結束前走出 101＝中途離開（沒有這一段，之後以安說一句）。
     講者虛構、只講比例原則的方向，不給結論（BB_105 4-3）——BB-B 審過（BB_115 L482，BB_161 第 3 節）。（時間往前跳。）＝開場三句之後時鐘往前 45 分鐘（晚到的不跳）*/
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
     「好。」＝記 B5_GO（今天）：以安、Alison 照作息在博雅的圓桌（characters.js），玩家走過去才開始 B5（ev_b5_table）；
     「我約了人，先走。」＝以安「好。」Alison「明天群組見。」，記 LEFT_AFTER_B4（AA_115 的 left_after:B4；第 12 週以安好奇地問，不懲罰）*/
  { id:'ev_b4_after', title:'散場', participants:['heroine_01'], location:'boya', trigger:'auto', activity:'B4', activityPhase:'justEnded', once:true, background:'blur',
    prereq:{attended:['B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'要不要去小桌子整理一下？'},
      {choice:[{text:'「好。」',set:{B5_GO:true},goto:'go'},{text:'「我約了人，先走。」',set:{LEFT_AFTER_B4:true},goto:'leave'}]},
      {label:'go'},{goto:'end'},
      {label:'leave'},{speaker:'heroine_01',expression:'neutral',text:'好。'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'smile',text:'明天群組見。'},
      {label:'end'} ],
    after:G=>{ if(G.flags.B5_GO===true) G.flags.B5_GO=G.day; } },
  /* B5 小桌子（BB_105 4-5）：散場說「好。」的玩家，當晚走到博雅圓桌的以安旁邊（npcNear）才開始。先演 4-4「B4 演講之後」的四句，再寫便利貼（三選一，沒有對錯）。
     Alison：認識才在場（只有認識的人在場）；不認識 Alison＝她那兩句不演、便利貼是兩張（LAWWW 改的字，已告訴 BB）。
     記 B5_THOUGHT（ask_them／trade／where；B12 讀它）、B4_DISCUSSED（AA_115 的 discussed:B4）；以安的熟悉度＝參與事件的一般見面（不另加數字）。法律同 B4：BB-B 審過（BB_115 L482，BB_161 第 3 節）*/
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
      {if:EV_KNOWS('yu'),speaker:null,text:'她把三張便利貼並排貼在筆記本上：她的、Alison 的、你的。'},{unless:EV_KNOWS('yu'),speaker:null,text:'她把兩張便利貼並排貼在筆記本上：她的、你的。'},
      {speaker:'heroine_01',expression:'smile',text:'九點半了。我回宿舍讀刑總。'} ],
    consequences:{flags:{B4_DISCUSSED:true},mem:[{npc:'heroine_01',tag:'B5_STICKY',note:'演講完在博雅的小桌子，三個人各寫一張便利貼'}],memo:'博雅的小桌子：演講之後寫了一張便利貼'} },
  /* B4 中途離開（AA_115 第 2 節：attendedAny 但不是 attended）：之後第一次找以安說話（演講後兩週內）——「你後半場不在。最精彩的你錯過了。」*/
  { id:'ev_b4_partial_an', title:'後半場', participants:['heroine_01'], location:'any', trigger:'interact', priority:9, once:true, term:['Y1S2'], background:'blur',
    prereq:{custom:G=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny(G,'B4')&&!ACTIVITIES.attended(G,'B4')&&(()=>{ const d=ACTIVITIES.lastEnded(G,'B4'); return d!=null&&G.day-d<=14; })()},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'你後半場不在。最精彩的你錯過了。'} ] },
  /* B4 散場先走的玩家（AA_115 第 2 節 ②b：left_after:B4）：第 12 週週一憲法（下）下課，以安「你那天聽完就走了。你怎麼想？」——她是好奇，不是怪他；不懲罰（原文沒有玩家的回答，只有這一句；AA_209 附錄A §2 加兩個選項）*/
  { id:'ev_b4_left_an', title:'那天的演講', participants:['heroine_01'], location:'any', trigger:'class', afterClass:'const_2', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flags:['LEFT_AFTER_B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'heroine_01',expression:'thinking',text:'你那天聽完就走了。你怎麼想？'},
      {choice:[{text:'「最後那題有點難。」',goto:'hard'},{text:'「那天有事先走了。」',goto:'busy'}]},   /* AA_209 附錄A §2（第 6 節第 4 點：加兩個選項）*/
      {label:'hard'},{speaker:'heroine_01',expression:'neutral',text:'對吧，我們在小桌子那邊講到九點半。'},{goto:'end'},
      {label:'busy'},{speaker:'heroine_01',expression:'neutral',text:'沒關係，講者最後那題我有抄，要的話給你看。'},
      {label:'end'} ] },
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
  { id:'ev_peishan_table_later_club', retired:'BB_191 §8-7：法服沒有讀書會；只留週四進 201 的版本（ev_peishan_table_later_class）', title:'那張表', participants:['classmate_peishan'], location:'any', trigger:'activity', afterActivity:'lawclub_study', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* AA_294 ②（企劃 b3ec8820）：原本是第 12 週週四 12:00～13:20 走進 201（沒進去就沒有）→ 改成上債總一前（beforeClass），第 12 週沒去就延到下一次出席，到第 14 週；
     第 14 週還沒出席＝走信箱版（ev_peishan_table_mail 加 'later'）*/
  { id:'ev_peishan_table_later_class', title:'那張表', participants:['classmate_peishan'], location:'any', trigger:'class', beforeClass:'oblig_gen1', term:['Y1S2'], weeks:[12], carryTo:14, weekday:[4], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 「沒關係。」、沒去女舍（或沒回）（BB_96 3-7）：第 12 週週一起，回宿舍時信箱裡有那張表，附一張便條（旁白照 BB 的描述寫成句子）*/
  { id:'ev_peishan_table_mail', title:'信箱', participants:[], location:['dorm_hall','dorm'], trigger:'enter', term:['Y1S2'], once:true, background:'freeze',
    prereq:{notFlags:['PS_TABLE_GOT'],custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',12,1):null; const k=G.flags.PS_CANCEL;
      const late=k==='later'&&(()=>{ const d14=STORY.termDay('Y1S2',14,4); return d14!=null&&G.day>d14; })();   /* AA_294 ②：「改天再給我。」第 14 週還沒出席債總一＝也走信箱版（第 14 週週四過了）*/
      return d!=null&&G.day>=d&&(k==null||k==='ok'||late)&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_table_cancel'); }},
    dialogue:[ {speaker:null,text:'信箱裡有那張表，附一張便條：「對不起。這份有畫重點。」'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 假期活動的關鍵事件（AA_199；vac3d.js）：出遊的 2D；連續好幾天的（營隊、日本）整段在 beforeOuting（中間的日子跳過、手機照時間收）*/
  { id:'ev_vac_key', title:'假期活動', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.5, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof VAC!=='undefined') await VAC.outing(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof VAC!=='undefined'&&VAC.missed) VAC.missed(GM,q); } },
  /* 學期末的飯帶出的單日小活動（AA_251：C14 事務所參觀、C15 朋友約的單日小事；termend3d.js 的 dayOuting）*/
  /* VA-09 芯慈事務所樓下的午餐（AA_256 第 1 節；src/vac3d.js 的 va09Phone 排；她只有五十分鐘）*/
  { id:'ev_va09_lunch', title:'事務所樓下的午餐', participants:['classmate_xinci'], location:'any', trigger:'outing', once:true, background:'dark', hours:50/60,
    dialogue:[ {speaker:null,text:'（事務所那棟大樓的一樓，自助餐。芯慈的識別證反過來別在衣服上。）'},
      {speaker:'classmate_xinci',text:'我只有五十分鐘。……先拿菜。'},
      {speaker:null,text:'（她夾了三樣，每一樣都很少。）'},
      {speaker:'classmate_xinci',text:'事務所比我想的安靜。大部分的時間，大家都在打字。'},
      {speaker:'classmate_xinci',text:'（看了一下錶）還有十二分鐘。你吃慢一點沒關係，我先上去。'},
      {set:{VA09_LUNCH:'done'}} ] },
  /* 寒暑假去她的縣市（AA_276 第 5 節；src/hometown3d.js 演，台詞 src/data/hometown_lines.js）：hours＝回程的高鐵（高雄一個半小時、台中一小時）*/
  { id:'ev_hv_kx', title:'去高雄', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  { id:'ev_hv_ps', title:'去台中', participants:[], location:'any', trigger:'outing', background:'dark', hours:1, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  /* 沛珊大三、大四的學期中在台南（AA_282 第 3 節，hometown_lines.js 的台南那一組）：回程的高鐵約一小時四十分鐘 */
  { id:'ev_hv_ps_tn', title:'去台南', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.75, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  { id:'ev_te_day', title:'假期的一天', participants:[], location:'any', trigger:'outing', background:'dark', hours:2, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof TERMEND!=='undefined') await TERMEND.dayOuting(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof TERMEND!=='undefined'&&TERMEND.dayMissed) TERMEND.dayMissed(GM,q); } },
  /* 學期末的飯（BB_203；termend3d.js）：一對一，出遊的 2D；整段在 beforeOuting（開場、話題池、飯桌一句、收尾；心意的邀約接回家的路上）*/
  { id:'ev_termend_dinner', title:'學期末的飯', participants:[], location:'any', trigger:'outing', background:'dark', hours:2, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof TERMEND!=='undefined') await TERMEND.dinner(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof TERMEND!=='undefined'&&TERMEND.missed) TERMEND.missed(GM,q); } },
  /* 聖誕交換禮物（交付清單 A20：AA_71 2-6「大一的實作」，AA 2026-10-14 回 LAWWW）：第 17 週週三 12/24 中午 12:20～13:10 在霖澤館一樓；只有麵店團的玩家有（阿哲兩天前在群組揪，
     story3d.js 的 phoneRules），沒去不扣分。在場的人＝XMAS_WHO 裡玩家認識的（交付清單第 0 節第 1 條）。祐廷送什麼由玩家選（XMAS_GIFT）；
     抽到祐廷禮物的人（XMAS_TO）、祐廷抽到誰的（XMAS_FROM）從在場的人裡隨機挑（pick）；明軒和 Alison 都在、抽到祐廷禮物的不是明軒＝Alison 的玩偶是明軒抽到（「和祐廷無關的一句」），祐廷就抽不到；
     柏翰的考古題由以安沒收（以安在場才有那一句；旁白的「又」只給中秋烤肉看過沒收的玩家：MIDAUTUMN_Y1＋BBQ_BOHAN_SEIZED，AA 交付清單 A20）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT（AA_11 事件 16）。
     明軒的禮物（BB_95 3-6b，2026-10-14）：三色螢光筆；祐廷抽到＝「多買的。……我用不到啦。」＋（綠色螢光筆）「上次那支綠的還在嗎？……」或（SAW_HIM_STUDY）「……收好啦。」（BB_167 SC4 第 29 列，AA_207 §5），記道具 XMAS_HL3；
     別人抽到＝阿哲、明軒各一句。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  /* 16 週制（AA_198 第 2 節第 1 點、AA_204 第 1 節 @4048e3ec）：改到 12/24（三）18:30 麵店，照出遊（OUT：story3d.js 的 xmas_y1，開始後 15 分鐘還沒到＝沒去）；原本第 17 週週三中午霖澤館一樓 */
  { id:'ev_xmas_exchange', title:'聖誕交換禮物', participants:[], location:'any', trigger:'outing', once:true, keep:'fixed', background:'blur', hours:2,
    prereq:{custom:(G,GM)=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&XMAS_HERE(G).length>0},
    dialogue:[ {scene:'阿鳳麵店'},{speaker:null,text:'（麵店最裡面那張桌子。阿姨多拿了兩張椅子過來。）'},{if:{custom:G=>XMAS_HERE(G).includes('heroine_03')},speaker:null,text:'（語彤今天沒班，坐在客人這一邊。）'},{speaker:null,text:'（禮物先疊在桌子中間，吃完再抽。）'},
      {speaker:null,text:'你帶來的禮物是——'},
      {choice:[{text:'一本小筆記本',set:{XMAS_GIFT:'notebook'}},{text:'一包咖啡豆',set:{XMAS_GIFT:'coffee'}},{text:'一張手寫卡片',set:{XMAS_GIFT:'card'}}]},
      {pick:{flag:'XMAS_TO',from:G=>XMAS_HERE(G)}},
      {if:{flagIs:{XMAS_TO:'heroine_01'}},speaker:null,text:'抽到你禮物的是以安。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'notebook'}},speaker:'heroine_01',expression:'smile',text:'剛好。我的快用完了。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'coffee'}},speaker:'heroine_01',expression:'neutral',text:'我在 Café 都點茶。……開學以後會用到。謝謝。'},   /* AA_313 4-3：她每天下午在 Café 讀書，不說「不太喝咖啡」*/
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'card'}},speaker:'heroine_01',expression:'neutral',text:'字很工整。我收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03'}},speaker:null,text:'抽到你禮物的是語彤。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},speaker:'heroine_03',expression:'neutral',text:'嗯。……我還不知道要寫什麼。先收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'coffee'}},speaker:'heroine_03',expression:'neutral',text:'放店裡好了。阿姨會想喝喝看。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'card'}},speaker:'heroine_03',expression:'neutral',text:'嗯。回去再看。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},mem:[{npc:'heroine_03',tag:'GIFT_NOTEBOOK_YT',note:'聖誕交換禮物：抽到你送的筆記本，還不知道要寫什麼'}]},
      {if:{flagIs:{XMAS_TO:'zhe'}},speaker:null,text:'抽到你禮物的是阿哲。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'notebook'}},speaker:'zhe',expression:'laugh',text:'好，我拿來寫菜單。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'coffee'}},speaker:'zhe',expression:'neutral',text:'可以配滷味嗎？'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'card'}},speaker:'zhe',expression:'laugh',text:'你寫這麼多字，我會哭耶。……沒事啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan'}},speaker:null,text:'抽到你禮物的是柏翰。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'notebook'}},speaker:'classmate_bohan',expression:'neutral',text:'我拿來整理考古題。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'coffee'}},speaker:'classmate_bohan',expression:'neutral',text:'下學期很需要。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'card'}},speaker:'classmate_bohan',expression:'neutral',text:'……謝謝。我回去看。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci'}},speaker:null,text:'抽到你禮物的是芯慈。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'notebook'}},speaker:'classmate_xinci',expression:'neutral',text:'格線的嗎？……空白的也好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'coffee'}},speaker:'classmate_xinci',expression:'smile',text:'追劇的時候剛好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'card'}},speaker:'classmate_xinci',expression:'smile',text:'謝謝。你寫好多。'},
      {if:{flagIs:{XMAS_TO:'yu'}},speaker:null,text:'抽到你禮物的是 Alison。'},
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
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'neutral',text:'我自己也用這一款。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的禮物：一包阿姨的辣椒醬。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:'heroine_03',expression:'neutral',text:'很辣。不要一次吃完。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:null,text:'你抽到阿哲的禮物：一盒滷味。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:'zhe',expression:'laugh',text:'冷掉了，但很好吃。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的禮物：一疊考古題。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'},custom:G=>XMAS_HERE(G).includes('heroine_01')},speaker:'heroine_01',expression:'neutral',text:'沒收。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的禮物：一本空白的筆記本，第一頁的格線已經畫好了。'}   /* AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）：追劇減量，劇單換筆記本 */,
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:'classmate_xinci',expression:'smile',text:'十二部。看完跟我說。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:null,text:'你抽到 Alison 的禮物：一個巨大的玩偶。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:'yu',expression:'smile',text:'我一個人在家的時候抱的那種。……送你。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:null,text:'你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的。……我用不到啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan',GREEN_HIGHLIGHTER:true}},speaker:'classmate_mingxuan',expression:'smile',text:'上次那支綠的還在嗎？……這樣你有四種了。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'},memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>!G.flags.GREEN_HIGHLIGHTER},speaker:'classmate_mingxuan',expression:'embarrassed',text:'……收好啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},set:{XMAS_HL3:true}},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，又被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'zhe',expression:'laugh',text:'你送螢光筆？你？'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的啦。'},
      {if:{custom:G=>XMAS_MX_YU(G)},speaker:null,text:'明軒抽到 Alison 的巨大玩偶，揹著它去搭公車。'} ],
    consequences:{flags:{XMAS_Y1:true},memo:'聖誕交換禮物（麵店）'} },
  /* 颱風假 T1a「泡麵之夜」（BB_110 第 2 節、交付清單 B3，2026-10-14 第 2 級 AA×BB）：颱風假（calendar.js 的 TYPHOON：第 7 週週一）晚上 18–23 點在宿舍房間。
     阿凱囤了泡麵；隔壁的方奕廷抱著植物過來——玩家見過他才有和他有關的三句（交付清單第 0 節第 1 條：沒見過的人不出現）。
     「不可抗力」只當玩笑、沒有人下結論（BB 2026-10-14 法律查核，BB_115 L436）。「看情況。」記 SAID_DEPENDS（大二 F2 阿凱的聊天機器人多一句）。
     生活 CG BCG-18「颱風夜的泡麵」（BB 2026-10-14 ART_APPROVED）在方奕廷進來那一句出現、之後的台詞和選項都用同一張；沒見過他的玩家不放（圖裡有他，BB 同意）。
     跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_typhoon_noodles_y1', title:'颱風夜的泡麵', participants:['kai'], location:'dorm', trigger:'auto', term:['Y1S1'], weeks:[7], weekday:[1], time:[18,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'kai',expression:'laugh',text:'我上禮拜就囤了二十包。你看，有用吧。'},
      {if:{flags:['DORM_FOUR']},speaker:'classmate_bohan',expression:'neutral',text:'（在讀張教授寄來的講義）……第二十頁了。'},{if:{flags:['DORM_FOUR']},speaker:'zhe',expression:'smile',text:'（拿走一包泡麵）我出熱水。'},   /* 四人房（AA_208 2-3）：接群組 ty1_g3 柏翰「我讀到第十二頁」（10/12）——AA_372 第 17 項：隔天讀到第二十頁 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},cg:'cg_typhoon_noodles'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'（抱著一盆植物進來）放陽台會被吹倒，先放你們這邊一晚。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'kai',expression:'surprised',text:'……你帶一盆植物來吃泡麵？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'它不用吃啦，放角落就好。'},
      {speaker:'kai',expression:'smile',text:'欸，颱風天泡麵，算不算你們說的那個……不可抗力？'},
      {choice:[{text:'「算。所以你要分我。」',goto:'yes'},{text:'「不算。這是你自己囤的。」',goto:'no'},{text:'「看情況。」',goto:'dep'}]},
      {label:'yes'},{speaker:'kai',expression:'smile',text:'這個推論有問題，但我接受。'},{goto:'end'},
      {label:'no'},{speaker:'kai',expression:'sad',text:'你好無情。……拿去。'},{goto:'end'},
      {label:'dep'},{speaker:'kai',expression:'smile',text:'又來了。……好啦，拿去。'},{mem:[{npc:'kai',tag:'SAID_DEPENDS',note:'颱風夜的泡麵：「不可抗力？」「看情況。」'}]},
      {label:'end'} ],
    consequences:{flags:{TYPHOON_Y1:true},memo:'颱風假：宿舍的泡麵之夜'} },
  /* 跨年（交付清單 A21：交接包_v1 第 3 節、AA_71 2-7、BB_95 9-7）：12/31（16 週制：寒假裡，AA_204）。一週前可昕問「跨年要不要去人少的地方？」（story3d.js 的 phoneRules）：
     「好。」＝河堤（出遊，和 K1b 的河堤共用背景；回宿舍的路上麵店團群組傳頂樓的照片）；「我想在臺北跟麵店團跨年。」＝宿舍頂樓，零點前一分鐘她打視訊來（不扣分；她不在這裡和麵店團見面）。
     沒有回她、在麵店團群組裡的玩家照 AA 的群戲去頂樓（沒有視訊）。記 KX_NYE:{1:'river'|'roof'}（BB_107 第 13 節：節日每年一筆）*/
  { id:'ev_nye_river', title:'跨年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, kxAway:true,
    outingMissed:(G,GM,q)=>{ G.flags.KX_NYE=Object.assign({},G.flags.KX_NYE||{},{1:'missed'}); if(typeof STORY!=='undefined'&&STORY.kxNyeMissedCall) STORY.kxNyeMissedCall(G,1,q&&q.day!=null?q.day:G.day); },   /* AA_313 第 2 節第 15 列（2-3 B）：答應去高雄卻沒出發＝00:05 她打來（原本什麼都沒有）；KX_NYE[1]＝missed 同大二～大四 */   /* kxAway：結尾一個人在回程的高鐵上（AA_309 第 3 列，不接她的閒聊）*/   /* AA_276 第 3 節第 1 點：去高雄跨年；0.5 小時＋凌晨一點的高鐵回臺北 */
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},   /* 愛河邊跨年深夜（ART-KH-BUS，BB-C 23612343；原本暫用河濱 riverside）*/
      {speaker:null,text:'河堤上的人不多。煙火在很遠的地方，聲音晚了好幾秒才到。'},
      {speaker:'kexin',expression:'smile',text:'今年我們不去人多的地方。'},
      {speaker:'kexin',expression:'teasing',text:'明年你最想做什麼？……一件就好。'},
      {choice:[{text:'「每個禮拜都見到妳。」',goto:'a'},{text:'「把民總讀完。」',goto:'b'},{text:'「妳先說。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'……那我先說：新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'好無聊。'},{speaker:null,text:'她數到三。'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'smile',text:'明年的這個時候，也在這裡看。……新年快樂。'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'十分鐘。看完就回去。我媽說十二點半以前要到家。'},   /* AA_369 M5：期末考 12/15～12/19 已經考完，她 12/22 起在高雄放寒假 */
      {speaker:null,text:'（凌晨一點，加開的那班高鐵。你在車上睡著了。）'} ],
    consequences:{flags:{NYE_DONE:'river'},memo:'跨年：去高雄和可昕在愛河邊'} },
  /* 跨年大一（AA_204 第 2 節，企劃線 27711a39；AA_197 1-5）：12/26 阿哲揪（story3d.js）→「我去」＝19:00 麵店（ev_nye_dinner：吃飯 → 21:40 選 → 22:50 信義區管制線 → 23:40 頂樓）；
     「直接到頂樓」「再看看」、和可昕選頂樓＝23:40 頂樓（ev_nye_roof）。記 NYE_Y1：dinner／roof（河堤 river 在 ev_nye_river；沒去＝沒有值）。在場的人熟悉 +1。
     以安：FRIEND 以上（或交往中）才上頂樓；交往中 00:10 那句換成跑步（2-5）。語彤交往中：00:01 打電話來（在頂樓的在這裡演，其他的 story3d.js 排一通電話）*/
  { id:'ev_nye_roof', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {cg:'cg_nye_rooftop'},   /* CG-15 頂樓的跨年（BB 2026-10-14 ART_APPROVED）*/
      ...NYE_ROOF_Y1 ],
    consequences:{flags:{NYE_DONE:'roof',NYE_Y1:'roof'},memo:'跨年：宿舍頂樓'} },
  { id:'ev_nye_dinner', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'},
      {speaker:null,text:'（十二月三十一日，晚上七點。麵店比平常擠，阿姨把門口那張桌子也搬了進來。）'},   /* AA_519 1-1：不再寫「老闆娘」（旁白第一次寫「阿姨（阿鳳）」：src/sup519_3d.js S.narName）*/
      {speaker:'zhe',text:'先點小菜。豆干、海帶、滷蛋，還有什麼？'},
      {speaker:'yu',text:'我要乾麵。……不對，今天好冷，我要湯的。'},
      {speaker:'classmate_bohan',text:'十點半出發，到市府站差不多十一點。'},
      {speaker:'zhe',text:'好，就十點半。'},
      {advance:2.5},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（九點半，芯慈先站起來。）'},
      {if:{custom:G=>NYE_XC(G)&&NYE_AT(G,'classmate_xinci','FRIEND')},speaker:'classmate_xinci',text:'我先走了，家裡有事。你們拍照傳群組。'},
      {if:{custom:G=>NYE_XC(G)&&!NYE_AT(G,'classmate_xinci','FRIEND')},speaker:'classmate_xinci',text:'我先走了，家裡有事。'},
      {advance:1/6},
      {choice:[{text:'「一起去。」',goto:'go'},{text:'「我先回去了。」',goto:'home'}]},
      {label:'home'},{speaker:'zhe',text:'好，新年快樂！'},{set:{NYE_Y1:'dinner',NYE_DONE:'dinner'}},{goto:'end'},
      {label:'go'},
      {if:{custom:G=>!NYE_AN(G)},speaker:'heroine_01',text:'我先回宿舍了。新年快樂。'},
      {if:{custom:G=>NYE_AN(G)},set:{NYE_Y1_AN:true}},   /* 她跟大家一起去信義區（大二頂樓那句看這個，AA_313 4-3）*/   /* 以安 FRIEND 以上才一起去（1-5）*/
      {advance:1.1},{scene:'信義區',bg:'newyear_crowd'},
      {speaker:null,text:'（市府站一出來，人多到走不動。前面拉了管制線，穿背心的工作人員一直在喊：「這邊不能再過去了！」）'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:null,text:'（管制線那邊，明軒穿著工作背心，手上拿著擴音器。）'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:'classmate_mingxuan',text:'欸？你們也來喔。'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:'classmate_mingxuan',text:'前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。'},   /* AA_432 4-4：BB_171 3-1 的兩句定稿照用（原本 AA_204／AA_313 5-7「欸！你們也來喔！」「這邊真的過不去了啦。……我十二點半下班，你們先走。」）*/
      {unless:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:null,text:'（前面的人說，再過去要排一個小時。）'},
      {speaker:'zhe',text:'好喔。撤。'},   /* AA_437 第 9 節（明軒剛說過「頂樓看得比較清楚」）*/
      {speaker:'yu',text:'看得到嗎？'},
      {speaker:'zhe',text:'看得到一點。'},
      {speaker:null,text:'（你們又擠回捷運站。）'},
      {advance:0.83},{scene:'宿舍頂樓',bg:'dorm_roof'},{cg:'cg_nye_rooftop'},
      ...NYE_ROOF_Y1,
      {label:'end'} ],
    consequences:{memo:'跨年：麵店'} },
  /* 和語彤交往中、跨年不在頂樓（AA_204 2-5）：00:01 她打電話來（「在頂樓」那一句不說）*/
  { id:'ev_yt_nye_call_y1', title:'語彤的電話', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},
      {speaker:'heroine_03',text:'新年快樂。'},
      {speaker:null,text:'（她那邊很安靜，只聽得到電視的聲音。）'},
      {choice:[{text:'「幫我跟阿姨說新年快樂。」',goto:'a'},{text:'「妳們在看什麼？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',text:'好。'},{speaker:null,text:'（電話那頭，她媽媽的聲音：『新年快樂喔！』）'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'跨年晚會。我媽在跟著唱。'},
      {label:'end'},{set:{YT_NYE_CALL_Y1:true}} ] },
  /* 12/29（一）海邊一日遊（AA_204 第 3 節、AA_199 VA-03）：12/26 群組約、08:50 臺北車站集合（story3d.js）；海邊用約會底圖的海邊（不寫真實地名）。記 VA03_BEACH:'went'、VA03_SHOE；在場的人熟悉 +1 */
  { id:'ev_va03_beach', title:'海邊一日遊', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'海邊',bg:'d25_base_sunset'},
      {speaker:null,text:'（放寒假的第二個禮拜。下火車的時候，天陰陰的，風很大。）'},   /* 每年都用這句（AA_264 第 5 節第 4 點，7fa3660d：取代「十二月二十九日」「寒假的第一個禮拜一」）*/
      {speaker:'yu',text:'好冷！！'},
      {speaker:'zhe',text:'來都來了。'},
      {speaker:null,text:'（沙灘上幾乎沒有人。阿哲把鞋子脫了，踩到水，叫了一聲又跑回來。）'},
      {speaker:null,text:'（柏翰站在離浪最遠的地方，鞋子拿在手上。）'},   /* AA_313 5-5：同一週柏翰的精確數字太多 */
      {if:{custom:G=>!!G.flags.VA03_AN},speaker:'heroine_01',text:'你的鞋子。被浪捲走一隻了。'},
      {unless:{custom:G=>!!G.flags.VA03_AN},speaker:'yu',text:'欸你的鞋子！！'},
      {speaker:null,text:'（一隻鞋子在浪裡一上一下。）'},
      {choice:[{text:'（去幫他撿）',goto:'shoe'},{text:'（站在旁邊拍）',goto:'photo'}]},
      {label:'shoe'},{speaker:null,text:'（你撿回來的時候，褲管濕到膝蓋。）'},
      {if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥！'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'謝啦！'},{set:{VA03_SHOE:true}},{goto:'lunch'},
      {label:'photo'},{speaker:null,text:'（照片裡，阿哲單腳在沙灘上跳。）'},
      {label:'lunch'},
      {advance:3},
      {speaker:null,text:'（中午在附近找了一家海產店，大家分兩盤炸的。Alison 點了一碗熱湯，自己喝掉一半。）'},
      {speaker:'yu',text:'欸我們拍一張合照。'},
      {speaker:null,text:'（請路過的阿伯幫忙拍。拍了五張，每一張都有人在眨眼。）'},
      {advance:4},
      {speaker:null,text:'（回程的火車上，大家都睡著了。你醒來的時候，已經過了好幾站。）'},
      {set:{VA03_BEACH:'went'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1}}},{if:{custom:G=>!!G.flags.VA03_AN},rel:{heroine_01:{fam:1}}} ],
    consequences:{memo:'12/29 海邊一日遊'} },
  /* 2/20 阿哲「開學那天拿去給你們」（AA_204 第 4 節）：2/23 起第一次在教室或麵店遇到他 */
  { id:'ev_zhe_snack_y1', title:'', participants:['zhe'], location:['classroom','noodle'], trigger:'auto', term:['Y1S2'], once:true, background:'blur', near:{npc:'zhe',r:4},
    prereq:{custom:G=>typeof PHONE!=='undefined'&&PHONE.sent(G,'zhe_back_y1')&&!G.flags.ZHE_SNACK_Y1},
    dialogue:[ {speaker:'zhe',text:'拿去，我媽買太多了'},{set:{ZHE_SNACK_Y1:true}} ] },
  /* 期末最後一頓（交付清單 A22：AA_71 2-13）：這學期最後一科考完以後（classes3d.js 的 lastExamEnd），走進阿鳳麵店（傍晚到晚上）；麵店團才有（哲 1 之後）。只一次。
     「麵店團一定吃一頓」那句旁白照 2-13 的字；阿姨的一句原文 */
  { id:'ev_term_last_meal', title:'期末最後一頓', participants:[], location:'noodle', trigger:'enter', term:['Y1S1'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&STORY.classPhotoOk&&STORY.classPhotoOk(G)},cg:'cg_class_photo_y1'},   /* BCG-46 期末合照（BB_132 第 69 組；新畫面，不是新事件——拍完去麵店，AA_71 2-13）：其他八人裡至少五位 FRIEND 以上，相簿才存 */
      {speaker:null,text:'期末最後一科考完。麵店團一定吃一頓。'},{speaker:null,text:'阿姨多送了一盤小菜。'},{speaker:'阿姨',text:'考完了，吃好一點。'} ],
    consequences:{memo:'期末最後一頓（阿鳳麵店）'} },
  /* 學姊 W4：空的保溫瓶（交接包 v2、BB_96 2-5）：大一下第 8～9 週、總圖、平日 14～17（她的作息本來就在總圖）、有點熟以上、once。輕的一場：她不哭、不說累。
     選項 2 之後一週「保溫瓶上貼了一張便條：已裝滿」——遊戲沒有保溫瓶的模型，先沒有（之後做道具時補）*/
  /* BB_207 第 2 節（7b39f636）、AA_261 第 2 節（16919f86）：搬到大一上第 8～9 週（她準備研究所筆試的那一年）、法學院圖書館；旁白第一句「她在讀判決」→「她在寫考古題」，其他照原稿 */
  { id:'ev_sis_empty_flask', title:'空的保溫瓶', participants:['heroine_05'], location:'lawlib', trigger:'interact', priority:8, once:true, term:['Y1S1'], weeks:[8,9], weekday:[1,2,3,4,5], time:[14,17], prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:null,text:'她在寫考古題，左手拿著保溫瓶，喝了一口。又喝了一口。'},{speaker:null,text:'保溫瓶是空的。她已經對著空瓶喝了三次。'},
      {choice:[{text:'「學姊，妳的保溫瓶是空的。」',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'tell'},{text:'（去 Café 買一杯黑咖啡，放在她桌上）',consequences:{mem:[{npc:'heroine_05',tag:'HELPED',note:'空的保溫瓶，買了黑咖啡'}],stamp:['flaskCoffeeDay']},goto:'coffee'},{text:'（什麼都不說）',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'quiet'}]},
      {label:'tell'},{speaker:null,text:'（她低頭看，搖了一下。）'},{speaker:'heroine_05',expression:'surprised',text:'……喔。'},{speaker:'heroine_05',expression:'neutral',text:'我早上九點裝的。我以為我還沒喝完。'},{speaker:null,text:'（她笑出來。）'},{speaker:'heroine_05',expression:'smile',text:'這件事很蠢。你看到了，就算了。'},{goto:'end'},
      {label:'coffee'},{speaker:'heroine_05',expression:'surprised',text:'……你翹課？'},{speaker:'player',text:'下課了。'},{speaker:'heroine_05',expression:'smile',text:'……好。'},{speaker:null,text:'（她把咖啡倒進保溫瓶。）'},{goto:'end'},
      {label:'quiet'},{speaker:null,text:'（她自己發現，起身去裝水。）'},{speaker:'heroine_05',expression:'serious',text:'你看到了吧。'},{speaker:'player',text:'……沒有。'},{speaker:'heroine_05',expression:'smile',text:'說謊的時候，不要看別的地方。'},
      {label:'end'} ] },
  /* 明軒 F-M4 家教的弟弟（BB_96 3-2；AA_72 第 3 節；V2-B32＋SYS-13 最小版）：大一下第 3 週起、校園、平日 15:30～18:00（他的作息）、SAW_HIM_STUDY 或和他「熟悉」以上、只一次。
     「好。」＝JOB_TUTOR（每週一次的家教，story3d.js 排出遊 ev_tutor_lesson）；「我先想想。」＝名額留到月底：月底前一週他私訊再問，過了月底「名額給別人了。」。
     哪一天：答應的時候選週二或週四（AA_163 第 2 節①、BB_161 ⑪；TUTOR_WD，舊存檔沒有＝週二）；做多久、沒去那一週等照 AA_163 第 2 節（SYS-13）*/
  { id:'ev_mingxuan_tutor_intro', title:'家教的弟弟', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:6, once:true, term:['Y1S2'], weeks:[3,4,5,6,7,8,9,10,11,12,13,14,15], weekday:[1,2,3,4,5], time:[15.5,18], background:'blur',
    prereq:{any:[{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}]},{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}]},
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'欸，你要不要接一個家教？'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我學生的弟弟，國中，要補公民。我排不下了。'},{speaker:'narrator',text:'你想起公園公布欄的那張紙。',if:{custom:G=>typeof PARK!=='undefined'&&PARK.tutorAdEcho(G)}},   /* 看過小公園公布欄的家教廣告（AA_171 第 2 節；一般狀態 G.daily.park.sawTutorAd，只有這句旁白讀）*/
      {speaker:'classmate_mingxuan',expression:'neutral',text:'我們法律系教國中公民應該還行吧？'},/* AA_209 附錄B §2 */{speaker:'classmate_mingxuan',expression:'smile',text:'時薪我幫你談好了。不能比我低。'},
      {choice:[{text:'「好。」',set:{JOB_TUTOR:true},consequences:{stamp:['tutorFromDay']},goto:'y'},{text:'「我先想想。」',consequences:{stamp:['tutorThinkDay']},goto:'n'}]},
      {label:'y'},{speaker:'classmate_mingxuan',expression:'neutral',text:'你哪天方便？'},{choice:[{text:'「週二。」',set:{TUTOR_WD:2}},{text:'「週四。」',set:{TUTOR_WD:4}}]},   /* BB_161 ⑪、AA_163 第 2 節①：答應的時候選週二或週四（19:00～21:00）*/
      {speaker:'classmate_mingxuan',expression:'smile',text:'很好。第一堂我陪你去認門。'},{goto:'end'},
      {label:'n'},{speaker:'classmate_mingxuan',expression:'neutral',text:'好。名額幫你留到月底。'},
      {label:'end'} ] },
  /* 家教的一堂（SYS-13 最小版）：學生家的客廳（2D，圖還沒有）。第一堂：國中生的問題＋旁白（BB_96 3-2，旁白只用 AA_12 0-3 的原意）；
     第二堂：媽媽切的柳丁、你不好意思吃；第三堂：「你不吃，我媽會以為你不喜歡她。」（AA_72 3-3）；之後只有地點字幕。TUTOR_N＝上過幾堂 */
  { id:'ev_tutor_lesson', title:'家教', participants:[], location:'any', trigger:'outing', background:'dark', hours:2,   /* 約好的打工：次數用完也能去；去了那天晚上不能再開始別的主要活動（AA_163、AA_160 2-3）：slotFill 在下面的 after */
    dialogue:[ {scene:'學生家的客廳',bg:'tutor_home'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:'國中生',text:'老師，課本寫的跟我家發生的事不一樣，那要聽誰的？'},{if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:null,text:'你想起自己小時候，也是這樣翻書找答案。'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===1},speaker:null,text:'（學生的媽媽切了一盤柳丁。你不好意思吃。）'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:null,text:'（學生的媽媽又切了一盤柳丁。）'},{if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:'國中生',text:'你不吃，我媽會以為你不喜歡她。'} ],
    after:G=>{ G.flags.TUTOR_N=(G.flags.TUTOR_N|0)+1; if(typeof CLS!=='undefined'&&CLS.slotFill) CLS.slotFill(G,'ev'); } },   /* 原本有兩個 after，後一個蓋掉前一個（slotFill 沒跑，家教那晚沒佔時段）：合成一個 */
  /* 大一的回聲（BB_134 第 1 節第 4 點、附錄 BB_134a；台詞 BB_96 2-5、BB_108 第 1 節）——W4「已裝滿」便條：空的保溫瓶選了買黑咖啡的玩家，之後一週內在總圖走到學姊旁邊，一句旁白 */
  { id:'ev_sis_flask_full', title:'已裝滿', participants:[], location:'lawlib', trigger:'auto', npcNear:'heroine_05', once:true, background:'blur',
    prereq:{custom:G=>G.flags.flaskCoffeeDay!=null&&G.day>G.flags.flaskCoffeeDay&&G.day<=G.flags.flaskCoffeeDay+7},
    dialogue:[ {speaker:null,text:'（她的保溫瓶上貼了一張便條：「已裝滿」。）'} ] },
  /* 學姊「熱水」（BB_207 第 2 節 7b39f636、台詞 AA_261 第 3 節 16919f86）：大一上第 14～15 週（她準備 2026-02-02 研究所筆試），一起念書那晚 21:30～21:45 閉館前（法圖 21:45 閉館會請人出去；AA_284 1-1）、法圖自習室外的走廊；CG BCG-01 沿用。
     「一起念書」＝解鎖了（SIS_STUDY，AA_284 2-3；src/sis_grad3d.js），那晚她在法圖念到閉館（作息：大一上第 14～15 週週一～四 19～21:45 在法圖）、玩家也在法圖。
     「我去幫妳裝熱水。」＝HOT_WATER；演過空的保溫瓶、選了黑咖啡（HELPED）的「謝謝」前多一句。「我請妳喝一罐。」＝不記；第 16 週以前下一次一起念書的晚上同一個場面再一次（她的第一句「……又空了。」），第二次也沒選就結束 */
  { id:'ev_sis_hot_water', title:'熱水', participants:['heroine_05'], location:'lawlib', trigger:'auto', npcNear:'heroine_05', term:['Y1S1'], weeks:[14,15], weekday:[1,2,3,4], time:[21.5,21.75], once:true, priority:9, background:'blur',
    prereq:{custom:G=>SIS_STUDY_OK(G)},
    dialogue:SIS_HOT_WATER('我在算還剩幾天。'),
    consequences:{stamp:['sisHotWaterDay'],memo:'學姊的保溫瓶，熱水'} },
  { id:'ev_sis_hot_water_again', title:'熱水', participants:['heroine_05'], location:'lawlib', trigger:'auto', npcNear:'heroine_05', term:['Y1S1'], weeks:[14,15], weekday:[1,2,3,4], time:[21.5,21.75], once:true, priority:9, background:'blur',
    prereq:{custom:G=>SIS_STUDY_OK(G)&&G.flags.sisHotWaterDay!=null&&G.day>G.flags.sisHotWaterDay&&!G.flags.HOT_WATER},
    dialogue:SIS_HOT_WATER('……又空了。') },
  /* 阿凱 K2 的回聲（BB_108 第 1 節 KAI_JOINS_TEST）：K2 之後第二週的晚上回到房間——說好「下次測試我叫你一起」的玩家：「測試。你說好的。」三個小時；其他選項：他自己測，隔天說「你錯過了史上最難的一關」 */
  { id:'ev_kai_test_echo', title:'測試', participants:['kai'], location:'dorm', trigger:'enter', once:true, time:[18,23], background:'blur',
    prereq:{events:['ev_kai_engineer'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_kai_engineer; return d!=null&&G.day>=d+7&&G.day<=d+14; }},
    dialogue:[ {if:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'smile',text:'測試。你說好的。'},{if:{flags:['KAI_JOINS_TEST']},speaker:null,text:'（三個小時，你死了四十次；阿凱記下每一次。）',consequences:{advance:3}},
      {unless:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'tired',text:'你錯過了史上最難的一關。'} ] },
  /* 語彤 6：房東來過了（交接包 v2 C12；AA_11 事件 6）：大一下第 10 週以後，第一次在週二或週四晚上去麵店（同班圈固定儀式）；once；玩家一直沒去就不發生。
     流程 1～4 照 AA_11 的字寫成旁白；問的選項只在和語彤有 FIRST_MET 時出現（選項的字 AA 180c8ff 定：「剛剛那個人是誰？」／（不問，低頭吃麵））；問了才記 RENT_RUMOR */
  { id:'ev_yutong_landlord', title:'房東來過了', participants:['heroine_03'], location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true,
    term:['Y1S2'], weeks:[10,11,12,13,14,15], background:'freeze',   /* 只在大一下（AA_11：「事件 6 只在大一下去麵店時發生」）*/
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
    dialogue:[ {speaker:null,text:'（以安的桌上攤著兩份草稿，劃得很亂。）'},   /* AA_209 附錄A §2 */
      {speaker:'heroine_01',expression:'serious',text:'我室友被記點了。晚歸二十分鐘。'},
      {speaker:'heroine_01',expression:'neutral',text:'她陪隔壁寢的同學去急診。記點以前，沒有人問她那天發生什麼事。'},
      {speaker:'heroine_01',expression:'serious',text:'我在幫她寫申訴，寫了兩個版本。你可以幫我看哪裡講不通嗎？直接講沒關係。'},   /* AA_209 附錄A §2 */
      {speaker:'heroine_01',expression:'neutral',text:'一份說規定本身有問題，一份說規定沒問題，只是沒考慮到這種情況。'},   /* AA_209 附錄A §2 */
      {choice:[{text:'「寫第一份。規定錯了，就該改。」',consequences:{flags:{AN_APPEAL:'rule'}},goto:'rule'},{text:'「寫第二份。規定沒錯，是沒想到。」',consequences:{flags:{AN_APPEAL:'case'}},goto:'case'},
        {text:'「先寫一件事：記點以前，應該先問她。」',consequences:{flags:{AN_APPEAL:'ask'}},goto:'ask'},{text:'「我想先聽妳的。」',consequences:{flags:{AN_APPEAL:'listen'}},goto:'listen'}]},
      {label:'rule'},{speaker:'heroine_01',expression:'thinking',text:'可是門禁本身有道理吧？這樣寫，舍監一看就會擋。'},{speaker:'heroine_01',expression:'thinking',text:'要寫的話，你要證明它對每個人都不合理。'},/* AA_209 第 8 節第 3 點 */{speaker:null,text:'（她在第一份旁邊畫了一個問號。）'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'case'},{speaker:'heroine_01',expression:'smile',text:'我也比較想寫這份。那你挑挑看，哪裡會被打回來？'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'ask'},{speaker:null,text:'（她停住，在草稿最上面寫了一行。）'},/* AA_209 附錄A §2 */{speaker:'heroine_01',expression:'neutral',text:'先問。……對，要先問。'},{goto:'end'},
      {label:'listen'},{speaker:'heroine_01',expression:'neutral',text:'好，我先說。'},{speaker:'heroine_01',expression:'neutral',text:'我最討厭『規定就是規定』這種話。我家以前很多事都這樣，不解釋。'},   /* AA_209 附錄A §2（AA_194 第 1 節要補的那句）*/
      {label:'end'} ] },
  /* 以安「四年，四張」的第一張（交接包 v2 C7；AA_71 2-9「大一的台詞」）：大一下第 3 週週六上午，椰林大道的杜鵑開了（她那個上午在椰林大道：characters.js 的作息）。
     和她有點熟以上＝她請你拍；還不熟＝她請 Alison 拍、你在旁邊看到。芷若、子晴那兩句只給兩個人都認識的玩家（AA：和祐廷無關的一句）。
     旁白只用 AA 的字（「椰林大道的杜鵑開了」「拿著手機」「她把手機遞給你」「拍完她看了一下」「她請 Alison 拍」「芷若拿著手機在拍花」）。之後三年照 AA_71 2-9（大三、大四以後做）*/
  /* 沛珊和柏翰（交接包 v2 C21 第一個畫面；草稿第 3 節、BB_100 2-3，使用者 2026-10-13 定案：沛珊大一下和柏翰交往，玩家只看到一部分，沒有選項會讓他們在一起或分開）：
     大一下第 4 週法服讀書會結束（afterActivity，classes3d.js 的 afterActEvent）——她和柏翰一起走出萬才館，一路在爭下週誰報告哪一題；祐廷在後面收白板。只有畫面（旁白用原文的描述）。
     還沒認識沛珊的玩家沒有。第二個畫面（期中的麵店長桌）跟大一下期中的宵夜一起做 */
  { id:'ev_peishan_bohan_w4', title:'走出萬才館', participants:['classmate_peishan','classmate_bohan'], location:'wancai', trigger:'activity', afterActivity:'public_law_group',   /* BB_191 §8-7：大一下第 4 週週四公法讀書會散場（原本週三法服讀書會）*/ term:['Y1S2'], weeks:[4], once:true, prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]}, background:'blur',   /* AA_409 第 2 節：和她交往中＝她等你收白板那一版（原本 AA_245 第 3 節交往中不演）*/
    dialogue:[ {unless:{flags:['dating_classmate_peishan']},speaker:null,text:'（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）'},{unless:{flags:['dating_classmate_peishan']},speaker:null,text:'（你在後面收白板。）'},
      {if:{flags:['dating_classmate_peishan']},speaker:null,text:'（讀書會結束。你收白板的時候，沛珊站在門口等。）'},{if:{flags:['dating_classmate_peishan']},speaker:'classmate_peishan',text:'今天那一題，你講得很好。……我想多聽你講。'},{if:{flags:['dating_classmate_peishan']},speaker:null,text:'（你們一起走出萬才館。柏翰走在前面，一個人。）'} ] },
  /* 主線 2（交接包 v2 C2）：除夕（STORY.lunarNewYear 的前一天，2026-02-16）。固定節點：除夕 12:00 以後、人有空就演（auto，在哪裡都可以——家裡用 2D）；
     如果除夕還沒演就上床，睡覺時演（sleep）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。演完時間往後 2 小時。記全域旗標 FAMILY_LAND_Y1（teacher／ask／lawyer；大三主線 9、大二上物權第 7 週的回想讀它）*/
  { id:'ev_chiayi_land_y1', title:'親戚的土地資料', participants:[], location:'any', trigger:'auto', priority:9, time:[12,24], once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1&&(typeof HOME==='undefined'||!HOME.lawBreak||!HOME.lawBreak(G)||HOME.at(G))},   /* 16 週制寒假可以留宿舍（AA_197 1-2）：主線 2 在家演——人在宿舍的，17:00 回家以後才演 */
    dialogue:LAND_Y1, consequences:{advance:2} },
  { id:'ev_chiayi_land_y1_bed', title:'親戚的土地資料', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1&&!(G.events&&G.events.done&&G.events.done.ev_chiayi_land_y1)},
    dialogue:LAND_Y1 },
  /* 春假三選一（交接包 v2 C9；草稿第 3 節「春假」）——可昕 K8 開車旅行（BB_96 9-5）：第 5 週選了「和可昕開車旅行」＝4/3 早上 8:00 出遊（story3d.js 的 springChoose）。一天來回、不演住宿。
     車上的規則 → 目的地三選一（山上看星星只給第 6 週天文課有去的玩家：CLS.attendedWeek 'Y1S2:ge_y1s2:w6'，那一堂有同學說「連假的時候，我要去山上看星星。」）→ 到了（2D，依目的地）一題假設題、
     怎麼接都可以 → 回程（車上，晚上）。記 KX_TRIP:{Y1S2:'sea'|'oldtown'|'stars'}。旅行的照片（房間物件）：照片上寫的字照 BB-B 定稿，在 story3d.js 的房間物件 */
  { id:'ev_kexin_trip_spring_y1', title:'春假：開車旅行', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:13.5,   /* 07:40 政大校門接她 → 08:00 出發 … 晚上送她回政大、車開回家（AA_147 #1；台詞不改）*/
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'規則。我管音樂，你管方向。'},
      {speaker:'kexin',expression:'teasing',text:'誰都不能管對方的。……第三頁寫的，今天不算。目的地，現在決定。'},   /* AA_373 #11：她傳過「我做了行程表。第二頁是我想吃的，第三頁才是行程。」*/
      {choice:[{text:'海邊',set:{KX_TRIP_Y1S2:'sea'},goto:'d_sea'},{text:'別的城市的老街',set:{KX_TRIP_Y1S2:'oldtown'},goto:'d_old'},
        {text:'山上看星星',if:{custom:G=>typeof CLS!=='undefined'&&!!CLS.attendedWeek&&CLS.attendedWeek(G,'Y1S2:ge_y1s2:w6')},set:{KX_TRIP_Y1S2:'stars'},goto:'d_star'}]},
      {label:'d_sea'},{speaker:'kexin',expression:'smile',text:'好。我要把腳弄濕。'},{scene:'海邊',bg:'trip_sea'},
      {speaker:'kexin',expression:'teasing',text:'水好冰。你要不要下來？'},
      {choice:[{text:'「我在這裡看就好。」',goto:'s1'},{text:'「好，我下去。」',goto:'s2'},{text:'「妳腳濕了。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'smile',text:'好，那你幫我拿鞋子。'},{speaker:null,text:'她又往海走了兩步。'},{goto:'back'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'……真的很冰喔。'},{goto:'back'},
      {label:'s3'},{speaker:'kexin',expression:'teasing',text:'……對，濕了。好冰。'},/* AA_209 附錄B §2 */{goto:'back'},
      {label:'d_old'},{speaker:'kexin',expression:'smile',text:'每一家都說自己是老店。我們去查證。'},{scene:'老街',bg:'trip_oldtown'},
      {speaker:'kexin',expression:'teasing',text:'你想先吃哪一家？'},
      {choice:[{text:'「牆上照片最舊的那家。」',goto:'o1'},{text:'「人最多的那家。」',goto:'o2'},{text:'「都吃。」',goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好。這家的證據是牆上的照片，我信了。'},{goto:'back'},
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'那要排很久。……排就排。'},{goto:'back'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'好。那我們要多吃幾家。'},{goto:'back'},
      {label:'d_star'},{speaker:'kexin',expression:'teasing',text:'看星星？……你們這禮拜上了什麼課？好，我們去驗證。'},/* AA_373 #11：沒有人告訴過她通識課的事 */{scene:'山上',bg:'trip_mountain'},
      {speaker:'kexin',expression:'teasing',text:'今天的月亮好亮。……你上次認真看月亮，是什麼時候？'},
      {choice:[{text:'「中秋吧。」',goto:'m1'},{text:'「現在。」',goto:'m2'},{text:'「跟妳一起看的時候。」',goto:'m3'}]},
      {label:'m1'},{speaker:'kexin',expression:'teasing',text:'那是過節。不算。'},{goto:'back'},
      {label:'m2'},{speaker:'kexin',expression:'smile',text:'……好。那現在算第一次。'},{goto:'back'},
      {label:'m3'},{speaker:'kexin',expression:'smile',text:'好。那每天晚上都要一起看。'},
      {label:'back'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'我不睡。我要陪你開車。'},
      {cg:'cg_dont_sleep_kexin'},   /* BCG-29（BB 10-14 通過；cg_approved/README：放在「過了收費站」這句、三個目的地共用）*/
      {speaker:null,text:'過了收費站，她睡著了。音樂還是她選的。'} ],
    after:G=>{ const k=G.flags.KX_TRIP_Y1S2; if(k){ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; T.Y1S2=k; G.flags.KX_TRIP=T; } } },
  /* 春假麵店團那一趟（交接包 v2 C9；AA 71186c7）：4/3～4/4，住一晚民宿。地點「海邊的小鎮」（不寫真實地名；字幕「春假・海邊的小鎮」，背景 seaside_town 在 MISSING_EXTERNAL_ART）。
     旁白和台詞照 AA 的六句（括號裡的寫成旁白；「最後阿哲說：」拆成旁白＋他的台詞）；在場的是麵店團裡玩家認識的人（不認識 Alison：第五句只留「阿哲睡過頭」）。
     兩天一夜：演完以後 STORY.travelOvernight 把時間推到第二天傍晚（住在民宿那一晚不在宿舍，不演宿舍的夜晚事件）*/
  { id:'ev_noodle_trip_spring_y1', title:'春假・小旅行', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'春假・海邊的小鎮',bg:'seaside_town'},
      {speaker:null,text:'火車上，四個位子怎麼坐，討論了一整站。最後阿哲說：'},{speaker:'zhe',expression:'smile',text:'猜拳。'},
      {speaker:null,text:'到的第一天就下雨。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'好，下午改去室內的地方，我再排一下。'},   /* AA_209 附錄A §2 */
      {if:{flags:['dating_heroine_01']},speaker:'heroine_01',expression:'smile',text:'（她小聲對你說）你想去哪？我照你的排。'},   /* 和以安交往中（AA_71 2-10，AA-C e2bdcece；AA_216 大一下 #7）*/
      {speaker:null,text:'雨停的空檔，大家在堤防上排成一排拍照。'},
      {if:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭，Alison 在門外敲了五分鐘。'},{unless:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭。'},
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
     她自己的那一件：BB_167 4-3（4-2 附錄第 35 列，1376b5f8）改了句子：「我本來以為我們會一直吵架。」之後，做過 K6 互考（KX_K6_EXAM；舊存檔有 KX_QUIZ 也算）＝「結果都在吵考古題。」，沒有＝「結果都在吵我出的考題。」（AA_295）（AA-C 2026-10-17 04:36 確認保留分支）。記 REVISIT_Y1:{who:'kexin',pick}（大四主線 10 讀它）。
     冷戰（AA_112 第 6 節的裂縫）還沒有系統：目前交往中都算她能來。麵店團併桌、單身的版本不做（重訪日 2026-10-17 停用；AA_355 第 3 節）*/
  { id:'ev_revisit_y1_kexin', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:['kexin'], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{flags:['dating_kexin'],custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1},
    dialogue:[ {speaker:'kexin',expression:'smile',text:'（坐下）一年了欸。'},
      {speaker:'kexin',expression:'smile',text:'你這一年，哪一天印象最深？'},   /* BB_167 4-3：只改問法，八段回憶和她的回應照留（AA_192 的例外）*/
      REVISIT_Y1_CHOICE('k_'),
      {label:'k_retake'},{speaker:'kexin',expression:'smile',text:'一年前你也坐在那間教室。……這次你待到最後了。'},{goto:'mine'},
      {label:'k_bbq'},{if:{flags:['KX_MET_NOODLE_TEAM'],custom:G=>G.flags.KX_JOKE!=='zhe'},speaker:'kexin',expression:'teasing',text:'那天阿哲輸給我三個冷笑話。'},{if:{flags:['KX_MET_NOODLE_TEAM'],flagIs:{KX_JOKE:'zhe'}},speaker:'kexin',expression:'teasing',text:'那天我輸給阿哲。我回去練了。'},   /* AA_313 第 2 節第 30 列：中秋選「阿哲贏」（KX_JOKE='zhe'）的換句；可昕贏的照舊（她來過一定有 KX_JOKE）*/{unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'teasing',text:'我只看過照片。玉米還是我們系的好。'},{goto:'mine'},
      {label:'k_noodle'},{speaker:'kexin',expression:'smile',text:'你講了一整年的麵。開學帶我去。'},{goto:'mine'},
      {label:'k_appeal'},{speaker:'kexin',expression:'smile',text:'你們系的人，連宿舍的事都寫成申訴書。……我喜歡。'},{goto:'mine'},
      {label:'k_rain'},{speaker:'kexin',expression:'smile',text:'那天的雨很大。你後來有沒有感冒？'},{goto:'mine'},
      {label:'k_lecture'},{speaker:'kexin',expression:'smile',text:'你說講者最後問的那一題，我也想了很久。'},{goto:'mine'},
      {label:'k_show'},{speaker:'kexin',expression:'teasing',text:'你負責拍手喔？那你有拍到手痛嗎？'},{goto:'mine'},   /* SC4 #8 */
      {label:'k_daily'},{speaker:null,text:'她嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'……嗯，我也是。'},   /* SC4 #35 */
      {label:'mine'},{speaker:'kexin',expression:'smile',text:'我喔？我本來以為我們會一直吵架。'},{if:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果都在吵考古題。'},
      {unless:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果都在吵要吃哪一家。'} ],   /* AA_313 第 2 節第 30 列：她不出假設題了，沒做互考的玩家沒看過她出題（原本「結果都在吵我出的考題。」）*/   /* BB_167 4-3（SC4 #35）；分支照 BB_96 9-10 保留（AA-C 2026-10-17 04:36：BB_167 只改了考古題那一支，沒做互考的版本＝「結果都在吵我出的考題。」（AA_295 前是「假設題」），BB-C 審口氣中）*/
    after:G=>{ G.flags.REVISIT_Y1={who:'kexin',pick:G.flags.REVISIT_Y1_PICK||'daily'}; } },
  /* 重訪日 1——麵店團的群戲（AA_209 第 3 節，AA 分支 096136d2；使用者 AA_193 第 4 節：保留大一最後一天 18:00 的麵店聚會，拿掉「這一年最意外的一件事」）：
     6/12（五）期末最後一科考完，18:00 阿鳳麵店（17:00 阿哲在群組揪，story3d.js phoneRules）。不是輪流報告暑假計畫：有人接話、沒回答、先走。
     在場：阿哲、Alison、柏翰（麵店團）、語彤（幫忙端麵）；以安、芯慈認識才在；沛珊和柏翰交往中、玩家認識她才有她的那句旁白。
     記 REVISIT_Y1:{who:'noodle_team',pick:'none'}（原本的 8 個回憶選項拿掉，REVISIT_Y1_PICK 記 'none'）；在場的人熟悉 +1 */
  { id:'ev_revisit_y1_noodle', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:['zhe'], location:'noodle', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（期末最後一科考完。長桌已經併好了。）'},{speaker:null,text:'（阿姨多放了一碟燙青菜，說是煮多了。）'},   /* AA_519 1-3：送小菜的旁白第二處＝第 1 句（拆成兩句：前面那半句照舊）*/
      {speaker:'zhe',text:'欸暑假誰在臺北？我七月一號就回高雄了。'},
      {speaker:'yu',text:'我七月要去營隊當隊輔，兩個禮拜。'},
      {speaker:'yu',text:'誰要來探班？'},
      {speaker:null,text:'（沒有人回答。柏翰在滑手機。）'},
      {speaker:'classmate_bohan',text:'成績二十九號才出來。'},
      {speaker:'zhe',text:'你很掃興欸。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'我暑假想把民總再讀一次。'},
      {if:EV_KNOWS('heroine_01'),speaker:'yu',text:'妳考完第一天就講這個喔。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'classmate_xinci',text:'我爸問我暑假要不要去事務所幫忙。我還沒回他。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'zhe',text:'去啊，有冷氣。'},
      {speaker:null,text:'（語彤端著兩碗麵過來。）'},
      {speaker:'heroine_03',text:'誰的乾麵？'},
      {choice:[{text:'「我的。」',goto:'r1'},{text:'「我暑假應該都在臺北。」',goto:'r2'},{text:'（先吃麵）',goto:'rest'}]},
      {label:'r1'},{speaker:null,text:'（她把碗放下，又回廚房了。）'},{goto:'rest'},
      {label:'r2'},{speaker:'zhe',text:'好，那暑假麵店就靠你了。'},
      {label:'rest'},
      {if:EV_KNOWS('classmate_peishan'),speaker:null,text:'（沛珊坐在柏翰旁邊，把他碗裡的蔥挑到自己碗裡。）'},
      {speaker:'yu',text:'柏翰你暑假回新竹喔？'},
      {speaker:'classmate_bohan',text:'週四會上來。總圖。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:null,text:'（八點多，芯慈先站起來。）'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'classmate_xinci',text:'我先走了，明天要早起。成績出來再傳群組。'},
      {speaker:null,text:'（後來大家又坐了快一個小時。阿姨收碗的時候，桌上還剩半盤豆干。）'} ],
    after:G=>{ G.flags.REVISIT_Y1_PICK='none'; G.flags.REVISIT_Y1={who:'noodle_team',pick:'none'};
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) for(const id of ['zhe','yu','classmate_bohan','heroine_03','heroine_01','classmate_xinci','classmate_peishan']) if(typeof STORY==='undefined'||!STORY.knows||STORY.knows(id,G)) SOCIAL.adjust(id,{fam:1}); } },
  /* 重訪日 1——單身、不在麵店團的版本（AA 50da3a9、d1fa44f；BB_96 第 11 節 b7c89d1）：這一年最親近的人（STORY.revisitClosest：先看階段、再看熟悉；學姊、沛珊這時有伴侶，不算）。
     男生：窗邊雙人桌坐他，玩家說完他也說一件。女生：祐廷一個人坐窗邊，她 18:00 傳來訊息（story3d.js phoneRules），之後一樣有題目和選項。
     都還不到「有點熟」：一個人坐窗邊，題目寫在筆記本上；「這張桌子，從今天開始是你的位子。」（旁白照 AA 的描述寫成句子）。
     阿哲、以安、語彤、Alison、芯慈（AA 的人物）的台詞：AA 2100018（2026-10-14 補）。記 REVISIT_Y1:{who,pick} */
  { id:'ev_revisit_y1_single', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:[], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))},
    dialogue:[ {if:{custom:G=>STORY.revisitClosest(G).kind==='male'},goto:'q'},
      {speaker:null,text:'你一個人坐在窗邊。'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'你在筆記本上寫了一行。'},
      {label:'q'},   /* AA_209／BB_167 4-3：拿掉「這一年最意外的一件事」和 8 個回憶選項，改聊暑假、回不回家、打工 */
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_bohan'},goto:'bohan'},{if:{custom:G=>STORY.revisitClosest(G).id==='zhe'},goto:'zhe'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='kai'},goto:'kai'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_mingxuan'},goto:'mx'},{if:{custom:G=>STORY.revisitClosest(G).id==='npc_fangyt'},goto:'fy'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'這張桌子，從今天開始是你的位子。'},{goto:'end'},
      {label:'bohan'},{speaker:'classmate_bohan',expression:'neutral',text:'成績二十九號才出來。'},{speaker:'classmate_bohan',expression:'neutral',text:'我暑假回新竹，禮拜四會上來總圖。你要的話可以一起。'},{goto:'end'},   /* AA-B 02:23 */
      {label:'zhe'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'哥，我七月一號就回高雄了。'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'欸我七月一號就回高雄了。'},{speaker:'zhe',expression:'smile',text:'你暑假在臺北喔？那我回來再找你吃麵。'},{goto:'end'},
      {label:'kai'},{if:{custom:G=>!!G.flags.KAI_TAPE&&!(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel&&SOCIAL.friendLevel('kai')==='CLOSE_FRIEND')},goto:'kai1'},
      {speaker:'kai',expression:'neutral',text:'暑假你回家喔？'},{speaker:'kai',expression:'neutral',text:'我留在臺北，接了一個修電腦的打工。'},{goto:'end'},
      {label:'kai1'},{speaker:'kai',expression:'neutral',text:'暑假要搬了。地上那條膠帶，我拍了一張才撕。'},{goto:'end'},
      {label:'mx'},{speaker:'classmate_mingxuan',expression:'neutral',text:'暑假我接了兩個家教。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'哈哈，這樣就存得到錢了。'},{goto:'end'},
      {label:'fy'},{if:{flags:['POTHOS']},goto:'fy1'},{speaker:'npc_fangyt',expression:'neutral',text:'我暑假要上山做調查，兩個禮拜沒訊號。有事先傳，我下山再回。'},{goto:'end'},
      {label:'fy1'},{speaker:'npc_fangyt',expression:'neutral',text:'我暑假要上山做調查，兩個禮拜沒訊號。'},{speaker:'npc_fangyt',expression:'neutral',text:'黃金葛記得澆，一週一次就好。'},
      {label:'end'} ],
    after:G=>{ const c=STORY.revisitClosest(G); G.flags.REVISIT_Y1_PICK='none'; G.flags.REVISIT_Y1={who:c.id||'alone',pick:'none'}; } },
  /* 學姊 W5「她改的便條」（BB_96 2-6；交接包 v2）：大一下第 15 週週三（6/3，AA_198 第 5 節）的法服學期檢討會（activities.js 的 lawclub_review_y1s2）之後；前置 lawclub、法服讀書會去過 3 次以上、只一次。
     去了檢討會：會後接著演（afterActivity）；沒去的社員：第 17～18 週第一次在晚上走進萬才館（BB_161 ③），開頭兩句換成「（聽說這週的檢討會很安靜。）」「（你經過萬才館的研討室……）」其他照舊。流程的描述寫成旁白。
     記 NOTICED_HER（W8 的伏筆）／GAVE_HER_NOTE（寫了什麼記在備註；回收見 BB_108）*/
  { id:'ev_sis_sticky_notes', retired:'使用者 2026-10-17（AA_218 17-1，AA-C 07:18）：刪除 W5 便條——「大學誰會寫書狀；這種批鬥大會根本不符合她的個性」。舊存檔已經看過的旗標保留（NOTICED_HER、GAVE_HER_NOTE、記憶），不重播', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'activity', afterActivity:'lawclub_review_y1s2', term:['Y1S2'], weeks:[15], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>W5_OK(G)},
    dialogue:[ {speaker:null,text:'檢討會上，學姊對一年級的書狀列了十二條缺點，大家臉都很僵。'}].concat(W5_REST) },
  /* BB_161 ③：沒去檢討會的社員＝第 15～16 週第一次在晚上（18:00 以後）走進萬才館；開頭兩句換成 BB-B 新寫的，接著從「你的書狀上：……」照原文 */
  { id:'ev_sis_sticky_notes_late', retired:'使用者 2026-10-17（AA_218 17-1，AA-C 07:18）：刪除 W5 便條——「大學誰會寫書狀；這種批鬥大會根本不符合她的個性」。舊存檔已經看過的旗標保留（NOTICED_HER、GAVE_HER_NOTE、記憶），不重播', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'enter', term:['Y1S2'], weeks:[15,16], time:[18,23.5], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>{ if(!W5_OK(G)) return false; const r=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',15,3):null; if(r!=null&&G.day===r&&G.hour<21) return false; return !(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'lawclub_review_y1s2')); }},   /* 檢討會那天（第 17 週週三）21:00 以前還在開會 */
    dialogue:[ {speaker:null,text:'（聽說這週的檢討會很安靜。）'},{speaker:null,text:'（你經過萬才館的研討室。學姊一個人坐在裡面，在每份書狀上貼便條。）'}].concat(W5_REST.slice(1)) },
  /* 子晴 Q5「你負責拍手」（BB_96 4-4、AA_13 G3；交接包 v2）：大一下第 14 週週三的吉他社成發（activities.js 的 guitar_show_y1s2，去看就演）；認識子晴才有。
     演出中三選一（介面的動作）：拍手＝CLAPPED（她下台說的那句＋插座貓貼紙：雙方都單身、和她朋友以上＝直接貼在你的手機殼上，其他＝遞給你）／坐著聽完＝她點頭「你有來。」／先走＝隔天手機「你看到一半。後半比較好。」。
     沒去（收到邀請或是吉他社的人）：隔天手機「你沒來」（沒有標點）。記 ZQ_SHOW（clap／came／half／absent；大二 Q9 讀它）。BCG-11（舞台上她按錯和弦後對著麥克風笑）還沒有圖 */
  { id:'ev_ziqing_show', title:'你負責拍手', participants:['heroine_04'], location:'wancai', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:null,text:'（後台。）'},
      {speaker:'heroine_04',expression:'serious',text:'欸不是，我手在抖。'},
      {speaker:'heroine_04',expression:'neutral',text:'我寫程式從來不抖。'},
      {speaker:'heroine_04',expression:'embarrassed'},{speaker:null,text:'（第二首，她按錯一個和弦。全場安靜一秒。她自己先笑出來。）'},
      {cg:'cg_bug_fix_heroine04'},   /* BCG-11（BB_117：按錯和弦、她自己先笑出來、對著麥克風說話的那一秒；在場就看得到，拍不拍手都算）*/
      {speaker:'heroine_04',expression:'laugh',text:'（對著麥克風）這個 bug 我下次修。'},
      {speaker:null,text:'（全場笑。）'},
      {choice:[{text:'（拍手）',set:{ZQ_SHOW:'clap'},goto:'clap'},{text:'（坐著聽完）',set:{ZQ_SHOW:'came'},goto:'came'},{text:'（先走）',set:{ZQ_SHOW:'half'},goto:'end'}]},
      {label:'clap'},{speaker:'heroine_04',expression:'laugh',text:'我看到你了。你拍得超大聲。很丟臉。……謝啦。'},
      {if:{custom:G=>!GFN(G,'heroine_04')&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))},speaker:null,text:'（她把一張插座貓貼紙，直接貼在你的手機殼上。）'},
      {unless:{custom:G=>!GFN(G,'heroine_04')&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04'))},speaker:null,text:'（她遞給你一張插座貓貼紙。）'},
      {mem:[{npc:'heroine_04',tag:'CLAPPED',note:'大一下的吉他社成發：你拍手'}]},{goto:'end'},
      {label:'came'},{speaker:null,text:'（她下台經過，點個頭。）'},{speaker:'heroine_04',expression:'neutral',text:'你有來。'},
      {label:'end'} ] },
  /* 學姊 W2b 家族聚餐（BB_96 2-1；交接包 v2）：第 4 週週五 18:30 永康街的咖哩（出遊；家族群組回「去。」才排，story3d.js）。2D 背景「永康街・咖哩店」（虛構店名；圖還沒有）。
     有 SAID_TREAT_SIS：「二，飲料學弟請，咖哩我請。」「我不是在客氣喔。」；沒有：「二，今天我請。」「下次誰都不要遲到喔。」（「最後一句」照 W2c 的內容理解成「重點是」那一句；已請 BB 確認）。
     回了「我有。」（SAID_HAS_CAR）：結束時順路載三個人回學校（BB_97 2-9 的描述寫成旁白）。記 FAMILY_DINNER；有 SAID_TREAT_SIS 而且到場＝TREATED_FAMILY */
  { id:'ev_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'永康街・咖哩店',bg:'yongkang_curry'},
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。'},{unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'……我知道。家聚你都沒來。今天來了就好。'},   /* AA_470 5-1：還沒認識她的（沒有 SIS_W1）兩句，點菜之前（這一場沒有開場旁白：接在場景後面）；演完記 met_sis、SIS_W1 */
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）我要辣的。……飲料學弟請，咖哩我請。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）我要辣的。今天我請。'},
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'smile',text:'我不是在客氣喔。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'下次誰都不要遲到喔。'},
      {speaker:null,text:'Kevin 遲到七分鐘。'},
      {speaker:'heroine_05',expression:'neutral',text:'Kevin，下次的地方你選。'},
      {if:{flags:['SAID_HAS_CAR']},speaker:null,text:'家聚結束，你順路載三個人回學校。學姊坐後座，一路在問學弟妹下學期選什麼課。'},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true}} ],
    after:G=>{ if(typeof SOCIAL==='undefined') return; SOCIAL.remember('heroine_05','FAMILY_DINNER','永康街的咖哩'); if(G.flags.SAID_TREAT_SIS){ G.flags.TREATED_FAMILY=true; SOCIAL.remember('heroine_05','TREATED_FAMILY','說要請全家族飲料，真的請了'); } } },
  /* 沛珊 P3b「課輔班的下午」（BB_96 3-3，交接包 v2）：大一下第 5 週起，週二或週四 16:30–18:00 走進溫州街，P2（ev_peishan_doubt）之後、只一次。
     她不用在 3D 裡出現：直接換成 2D 背景「溫州街・課輔班門口」（圖還沒有＝深色底＋字幕）。第二個選項只給去過法服讀書會的玩家（CLUB_lawclub_study）。
     記 SAW_HER_TEACH（大二 P3「我要重考。去念教育」的伏筆；不寫成憂鬱或逃避）*/
  { id:'ev_peishan_tutoring', title:'課輔班的下午', participants:['classmate_peishan'], location:'wenzhou', trigger:'enter', term:['Y1S2'], weeks:[5,6,7,8,9,10,11,12,13,14,15], weekday:[2,4], time:[16.5,18], once:true, background:'dark',
    prereq:{events:['ev_peishan_doubt']},
    dialogue:[ {scene:'溫州街・課輔班門口',bg:'wenzhou_tutoring'},
      {speaker:null,text:'她帶著一群國小生從課輔班走出來，手上拿著一疊作業本。'},
      {speaker:'classmate_peishan',expression:'smile',text:'喔，是你。我在這裡當志工。一週兩天。'},   /* AA_373 #6：作息週二、四 16:00～18:00 在溫州街課輔班（characters.js）*/
      {speaker:null,text:'一個小孩拉她的衣角。她蹲下來聽他講完，站起來。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'……我在這裡的時候，不會看時間。'},
      /* BB_161 ④：第二個選項只給去過讀書會的玩家（出席紀錄，不是博覽會填表的 CLUB_lawclub_study）*/
      {choice:[{text:'「妳看起來很開心。」',goto:'a'},{text:'「讀書會最近比較少看到妳。」',if:{custom:G=>typeof ACTIVITIES!=='undefined'&&(ACTIVITIES.attendedAny(G,'public_law_group')||ACTIVITIES.attendedAny(G,'lawclub_study'))},goto:'b'},{text:'（幫她拿一半的作業本）',goto:'c'}]},
      {label:'a'},{speaker:'classmate_peishan',expression:'thinking',text:'有嗎。'},{speaker:null,text:'她想了一下。'},{speaker:'classmate_peishan',expression:'smile',text:'……有。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。我還是會去，只是比較少。'},{speaker:null,text:'她不躲這個問題。'},{speaker:'classmate_peishan',expression:'thinking',text:'我在找我比較想待的地方。'},{goto:'end'},
      {label:'c'},{speaker:'classmate_peishan',expression:'smile',text:'謝謝。……你走路很慢，跟小孩一樣。'},{speaker:null,text:'小孩們笑。'},
      {label:'end'},{mem:[{npc:'classmate_peishan',tag:'SAW_HER_TEACH',note:'溫州街的課輔班：她在當志工'}]} ] },
  /* Alison 語 2「剛好路過」（交接包 v2 C18；草稿第 3 節、AA_40 語 2）：大一下第 14～16 週，阿哲和 Alison 的三個徵兆。三個選項都不改變結果（大二上兩人在一起），只記 YU2_PICK（之後 Alison 怎麼跟祐廷說）。
     交往中的玩家也一樣（這是 Alison 和阿哲的事）。只有認識 Alison 的玩家有（met_yu）；阿哲開場就認識。
     「徵兆保證觸發」（AA_40 要開發組評估）的做法：
       ① 傅鐘的早餐：Alison 早上坐在傅鐘旁邊的長椅（她的作息：平日 08:20～09:05，AA_156 第 4 節），走到她附近就演（auto＋near，不用特地找她說話）；
       ② 麵店：麵店日（週二、週四）走進麵店就演一句旁白（麵店團才有）；
       ③ 最後一個（Alison 問祐廷）：吉他社的玩家在社課結束後（afterActivity），其他玩家在麵店散場後走到騎樓（公館，今天有在麵店）；
          要先看過 ① 或 ② 其中一個——所以看到 ③ 的玩家一定看過兩個以上；麵店團的玩家同一個晚上 ②＋③ 就湊齊。整個存檔只問一次（YU2_PICK）*/
  { id:'ev_yu_sign_soymilk', title:'剛好路過', participants:['yu','zhe'], location:'campus', trigger:'auto', near:{npc:'yu',r:4}, term:['Y1S2'], weeks:[13,14,15], weekday:[1,2,3,4,5], time:[8+20/60,9+5/60], once:true, background:'blur',
    prereq:{flags:['met_yu']},
    dialogue:[ {speaker:null,text:'阿哲出現，帶著兩杯豆漿。'},{speaker:'zhe',expression:'smile',text:'剛好路過。'},{speaker:'yu',expression:'neutral',text:'你宿舍又不在這邊。'},/* AA_209 附錄A §2（阿哲住 203，AA_208）*/{speaker:'zhe',expression:'neutral',text:'……剛好路過。'} ],
    consequences:{stamp:['yu2SoymilkDay']} },
  { id:'ev_yu_sign_seat', title:'她每次都坐阿哲旁邊', participants:['yu','zhe'], location:'noodle', trigger:'enter', term:['Y1S2'], weeks:[13,14,15], weekday:[2,4], time:[17.5,21], once:true, background:'freeze',
    prereq:{flags:['met_yu'],custom:G=>G.flags.noodleTableDay!=null&&typeof STORY!=='undefined'&&!!STORY.noodleDay&&STORY.noodleDay(G.day)},
    dialogue:[ {speaker:null,text:'Alison 每次都坐阿哲旁邊。'} ],
    consequences:{stamp:['yu2SeatDay']} },
  { id:'ev_yu_sign_question_club', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'wancai', trigger:'activity', afterActivity:'club_guitar', term:['Y1S2'], weeks:[13,14,15], once:true, background:'blur',
    prereq:{flags:['met_yu','CLUB_club_guitar'],custom:G=>!G.flags.YU2_PICK&&(G.flags.yu2SoymilkDay!=null||G.flags.yu2SeatDay!=null)},
    dialogue:YU2_QUESTION },
  { id:'ev_yu_sign_question_arcade', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'gongguan', trigger:'enter', term:['Y1S2'], weeks:[13,14,15], weekday:[2,4], time:[17.5,22], once:true, background:'blur',
    prereq:{flags:['met_yu'],custom:G=>{ const F=G.flags; return !F.YU2_PICK&&!F.CLUB_club_guitar&&(F.yu2SoymilkDay!=null||F.yu2SeatDay!=null)&&Array.isArray(F.ndlDays)&&F.ndlDays.includes(G.day); }},
    dialogue:YU2_Q(true) },
  /* 以安新 7 前半「和 Alison 吵架」（交接包 v2 C14；草稿第 3 節、AA_113 新 7）：2026-10-17 改到大一下第 12 週週四的公法讀書會（萬才館研討室；AA_238 5-3：阿哲換柏翰計時，CLS.clubEvent 挑）。原本是第 11 週週二晚上的麵店（麵店日）。台詞、選項照原文；好感數字原文沒有，不加。
     記 AN_YU_ARGUMENT（選了哪一個；之後新 8 可以用）。不在場的玩家：那個週四 22:00 Alison 在麵店團群組連發三則（AA_238 5-4；story3d.js phoneRules，記「聽說」）。
     法律：集會遊行「許可制／報備制」的爭論，只呈現兩邊的理由、不給結論——BB-B 審過（BB_115 L483，BB_161 第 3 節）（原本 LEGAL_REVIEW_REQUIRED）*/
  { id:'ev_an_yu_argument', title:'吵架', participants:['heroine_01','yu','classmate_bohan'], location:'wancai', trigger:'club', priority:9, once:true, term:['Y1S2'], weeks:[12], weekday:[4], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'},custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES.indexOf(SOCIAL.stage('yu'))>=SOCIAL.STAGES.indexOf('ACQUAINTANCE')}, background:'blur',   /* 法律審查：BB-B 第 27 批審過（BB_115 L483，集會遊行法 §8 許可制，以安只講區分、沒有結論；BB_161 第 3 節）。AA_178 ③：以安、Alison 都 ACQUAINTANCE 以上才演；不符合＝在麵店團群組的照樣收到兩則（story3d.js）*/
    dialogue:[ {speaker:'yu',expression:'serious',text:'上街要先申請？那還叫自由嗎？'},{speaker:'heroine_01',expression:'serious',text:'先分清楚。是要申請許可，還是讓人知道你要用哪一條路。'},
      {speaker:'yu',expression:'annoyed',text:'妳每次都先挑我用詞。'},{speaker:'heroine_01',expression:'neutral',text:'因為用詞不清楚，我們就會在吵兩件不一樣的事。'},{speaker:'classmate_bohan',expression:'neutral',text:'（看了一下手錶）妳們兩個講了十二分鐘了。每人十分鐘。'},   /* AA_238 5-3（原本麵店、阿哲「麵要坨了。」）*/
      {choice:[{text:'「我站 Alison。」',consequences:{flags:{AN_YU_ARGUMENT:'yu'}},goto:'yu'},{text:'「我站以安。」',consequences:{flags:{AN_YU_ARGUMENT:'an'}},goto:'an'},
        {text:'「妳們講的是同一件事的兩邊。」',consequences:{flags:{AN_YU_ARGUMENT:'both'}},goto:'both'},{text:'（先吃 Alison 帶的宵夜）',consequences:{flags:{AN_YU_ARGUMENT:'noodle'}},goto:'noodle'}]},
      {label:'yu'},{speaker:'yu',expression:'laugh',text:'看吧！'},{speaker:'heroine_01',expression:'neutral',text:'那你說說看，哪裡不對？'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'an'},{speaker:'heroine_01',expression:'neutral',text:'謝謝。'},{speaker:null,text:'（她轉回去跟 Alison 繼續講，聲音小了一點。）'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'both'},{speaker:null,text:'（兩個人同時轉過來看你。）'},{speaker:'yu',expression:'surprised',text:'……幹嘛突然這麼有道理。'},{goto:'end'},
      {label:'noodle'},{speaker:'classmate_bohan',expression:'neutral',text:'明智。……我也要一塊。'},
      {label:'end'} ] },
  /* 以安新 7 後半「公法讀書會第一次」（交接包 v2 C14）：活動「公法讀書會」（activities.js，大一下第 12 週起每週四 20:00，萬才館研討室 A；所有人都收到邀請，AA_115：不懲罰先走、沒去演講的人）。
     第一次去：白板（原文）；加入就每週四有一格（CLUB_public_law_group），記 PUBLIC_LAW_GROUP。不去也照常，之後還是會被邀 */
  { id:'ev_public_law_group', title:'公法讀書會', participants:['heroine_01','yu'], location:'wancai', trigger:'activity', term:['Y1S1','Y1S2'], once:true, background:'blur',   /* 大一上第 10 週開始（AA_218 17-4；BB_191 §8-1）；大一下才第一次來的也演 */
    dialogue:[ {speaker:null,text:'（研討室的白板上寫著「公法讀書會」。下面是以安的字：「每人十分鐘。」）'},{speaker:null,text:'（Alison 在旁邊補：「可以吃東西。」）'},{set:{PUBLIC_LAW_GROUP:true}} ] },
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
      {label:'water'},{speaker:null,text:'（中場你把一箱水搬到場邊。阿哲一口氣喝掉半瓶。）'},{speaker:'zhe',expression:'smile',text:'謝啦。'},{speaker:null,text:'（他把瓶子丟回給你，又跑回場上。）'},/* AA_209 第 8 節第 2 點 */   /* AA_209 附錄A §2 */
      {label:'end'} ] },
  { id:'ev_an_azalea_y1', title:'四年，四張', participants:['heroine_01'], location:'campus', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[3], weekday:[6], time:[10,12], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:null,text:'（椰林大道的杜鵑開了。以安拿著手機。）'},{speaker:'heroine_01',expression:'neutral',text:'我想每年都在這裡拍一張，拍到畢業。'},   /* AA_209 附錄A §2 */
      {unless:{stage:{npc:'heroine_01',min:'FAMILIAR'}},goto:'yu'},{if:{flags:['EX_heroine_01']},goto:'yu'},   /* 和她分開過的玩家照「不熟」的版本（AA_71，AA-C e2bdcece）*/
      {speaker:null,text:'（她把手機遞給你。）'},{speaker:'heroine_01',expression:'neutral',text:'你幫我拍。……不要叫我笑。'},{speaker:null,text:'（拍完她看了一下。）'},{speaker:'heroine_01',expression:'smile',text:'可以，花有拍到。謝謝。'},
      {if:{flags:['dating_heroine_01']},speaker:null,text:'（她拿回手機，也對著你按了一下。）'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',expression:'smile',text:'這張我自己留。'},   /* 交往中的第一張（AA_71，AA-C e2bdcece；AA_216 大一下 #6：照片裡還是只有她，兩個人入鏡留給第四張）*/
{set:{AZALEA_Y1:'player'}},{goto:'flowers'},   /* AA_209 附錄A §2 */
      {label:'yu'},{speaker:null,text:'（她請 Alison 拍。）'},{speaker:'yu',expression:'smile',text:'笑一個嘛！'},{speaker:'heroine_01',expression:'neutral',text:'不要。'},{set:{AZALEA_Y1:'yu'}},
      {label:'flowers'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'},{npc:'heroine_04',tag:'FIRST_MET'}]},goto:'end'},
      {speaker:null,text:'（芷若拿著手機在拍花。）'},{speaker:'heroine_04',expression:'smile',text:'妳也來拍喔？'},{speaker:'heroine_02',expression:'neutral',text:'嗯，今天沒班。'},   /* AA_209 2-1 第 5 節第 2 點（BB_167 SC3 #37）*/
      {label:'end'} ] },
  { id:'ev_an_dorm_appeal_result', title:'申訴的結果', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[7], prereq:{events:['ev_an_dorm_appeal'],custom:G=>!G.flags.AN_APPEAL_RESULT}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'smile',text:'點數減了一點。宿舍說，以後記點以前會先問。'},{speaker:'heroine_01',expression:'neutral',text:'最後用的是第二份，寫規定沒考慮到急診這種情況。'},   /* AA_209 附錄A §2（當面、手機 an_appeal_result 兩處一起換）*/
      {if:{flagIs:{AN_APPEAL:'ask'}},speaker:'heroine_01',expression:'smile',text:'你說要先問清楚的那句，我放在第一段了。'},{set:{AN_APPEAL_RESULT:'met'}} ] },   /* AA_209 附錄A §2 */
  /* 大一下的期末最後一頓（交接包 v2 C19：AA_71 2-13，同一段原文；只一次）。大一上那一個 id 不改（舊存檔 events.done 相容）*/
  { id:'ev_term_last_meal_y1s2', title:'期末最後一頓', participants:[], location:'noodle', trigger:'enter', term:['Y1S2'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S2','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {speaker:null,text:'（大一最後一科考完。長桌又併起來了。）'},{speaker:null,text:'（每個人的湯碗裡，都多了兩顆餛飩。）'},{speaker:'阿姨',text:'一年了。……今天的湯，算我的。'} ],   /* AA_519 1-3：送小菜第三處＝第 2 句；「吃好一點」只留大一上那一次 */   /* AA_467 第 1 節（企劃線 5bbd16ab1）：前三句換字（大一上 ev_term_last_meal 照舊）*/
    consequences:{memo:'大一下期末最後一頓（阿鳳麵店）'} },
  /* 可昕 K2 她第一次來台大（BB_95 9-3）：第 6 週週五 20:00 她傳「這次換我去台大。我先去找品妤，你四點來社科院門口。」（AA_313 第 2 節第 8 列），週六 16:00 在社科院門口（story3d.js 的 phoneRules；出遊）。
     最小版本（BB_95 第 9 節）：依序換背景——社科院門口（她和品妤；品妤第一次出現＝重新介紹自己，之前遇過＝「你來了。」）→ 霖澤館前（假設題三選一）→ 椰林大道（旁白帶過去公館吃晚餐）。
     K1 還沒去過＝分開時「下次換你來，我當導遊。」。沒去（不去了、過了時間）＝她傳兩個人在社科院門口的照片（outingMissed）。記 MET_PINYU */
  { id:'ev_kexin_visits_ntu', title:'她來台大找你',   /* AA_372 第 11 項：她在社科院念過一學期（原本「她第一次來台大」）*/ participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined') return; PHONE.at(G,G.day,Math.max(G.hour,q.h+1),[{th:'p:kexin',from:'kexin',text:'📷（她和品妤在社科院門口）'},{th:'p:kexin',from:'kexin',text:'我們等到五點。……你人呢。'}],'kx_ntu_photo'); },   /* AA_313 第 2 節第 8 列：男朋友放鴿子她會記著（原本「品妤說你們系館很好認，最高的那棟。」）；等到五點＝17:00 才傳（原本 16:45）*/
    dialogue:[ {scene:'台大・社科院門口',bg:'ntu_soc'},
      {speaker:null,text:'社科院門口，可昕和品妤已經在等你。'},
      {unless:{flags:['MET_PINYU']},speaker:'品妤',text:'好久不見。你現在每天都在對面那棟喔？'},
      {if:{flags:['MET_PINYU']},speaker:'品妤',text:'你來了。'},
      {speaker:'kexin',expression:'teasing',text:'我們的舊系館。……裡面的販賣機還是壞的。'},
      {scene:'台大・霖澤館前',bg:'ntu_linze'},{speaker:'品妤',expression:'neutral'},
      {speaker:'kexin',expression:'neutral',text:'霖澤館。以前每天從社科院看過來。……第一次走進來。'},   /* AA_372 第 11 項 */
      {speaker:'kexin',expression:'teasing',text:'你每天第一堂都從這個門進去？……遲到的時候也是？'},
      {choice:[{text:'「遲到走後門。」',goto:'a'},{text:'「今天沒有遲到。」',goto:'b'},{text:'「我沒有每天遲到。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'你連遲到都有路線。'},{goto:'e'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'……因為我在。'},{speaker:null,text:'她笑。'},{goto:'e'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'證據呢？'},
      {label:'e'},
      {scene:'台大・椰林大道',bg:'ntu_avenue'},{leave:'品妤'},   /* AA_147：霖澤館前品妤還在（在旁邊看手機＝立繪留著、不說話）；椰林大道她先走、剩兩人 */
      {speaker:null,text:'品妤先回去了。你們沿著椰林大道走出校門，在附近吃晚餐。'},   /* AA_313 第 2 節第 8 列：台大就在公館（原本「一路走到公館吃晚餐」）*/
      {unless:{events:['ev_kexin_tour_nccu']},speaker:'kexin',expression:'smile',text:'下次換你來，我當導遊。'} ],
    consequences:{flags:{MET_PINYU:true},memo:'可昕來台大找你'} },   /* AA_372 第 6 節第 9 題：日誌和標題一樣（原本「可昕第一次來台大」）*/
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
      {speaker:'kexin',expression:'teasing',text:'我的螢光筆沒水了。……你那邊的黃色借我。算了，你又遞不過來。'},
      {choice:[{text:'（回她）',goto:'r1'},{text:'（不回，繼續讀）',goto:'n1'}]},
      {label:'r1'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q1'},
      {label:'n1'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q1'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'你們期末考還剩幾科？我在算哪天可以見面。'},   /* AA_372 第 6 項：12/16 憲法期末 12/15 已經考完 */
      {choice:[{text:'（回她）',goto:'r2'},{text:'（不回，繼續讀）',goto:'n2'}]},
      {label:'r2'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q2'},
      {label:'n2'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q2'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'這是我今天第三杯咖啡。你不要跟我媽說。'},
      {choice:[{text:'（回她）',goto:'r3'},{text:'（不回，繼續讀）',goto:'n3'}]},
      {label:'r3'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q3'},
      {label:'n3'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q3'},
      {speaker:null,text:'半小時過去。'},
      {speaker:'kexin',expression:'teasing',text:'我眼睛快閉起來了。……你先不要掛。'},
      {choice:[{text:'（回她）',goto:'r4'},{text:'（不回，繼續讀）',goto:'n4'}]},
      {label:'r4'},{if:{notFlags:['kxVsA']},speaker:'kexin',expression:'smile',text:'你分心了。很好。'},{set:{kxVsA:true}},{goto:'q4'},
      {label:'n4'},{if:{notFlags:['kxVsN']},speaker:'kexin',expression:'smile',text:'你今天好認真。我有點寂寞。……繼續。'},{set:{kxVsN:true}},
      {label:'q4'} ],
    consequences:{mem:[{npc:'kexin',tag:'VIDEO_STUDY',note:'第一次'}],flags:{KX_VIDEO_DONE:true},memo:'和可昕視訊一起讀書'} },
  /* 第一份報告交出去的晚上（BB_95 9-6 改版；2026-10-15 BB-B：可昕生日改 4/24，這一晚不再是生日；AA_140 G01）：12/3（第 14 週週三）。id 不改（舊存檔）。
     前一晚她傳「明天交第一份期末報告……」；當天她的對話串多一則「祐廷的草稿」（「交出去了嗎？」23:59 前可以傳）；18:00 出遊提示「開車去政大」（story3d.js 的 phoneRules）。
     這是去的那一段：校門 → 山下的小吃街。「問予樂的。」只有見過予樂（K1b）才有；予樂見過：「好，我先走。司機，載好她。」；沒見過：她看了祐廷一眼才說「好，我先走。」。
     K1、K1b 都去過、K1 讓她點（K1_ORDER:'let_her'）＝第三次去，老闆記得點法。BCG-28（cg_birthday_kexin，十二月、冬裝，圖照用）放在「……你怎麼知道我幾點下課？」。
     記 KX_DEC3_VISIT（phoneRules 換成 KX_DEC3:{1:'visit'}）。遊戲裡 12/3 不再出現「生日」兩個字 */
  { id:'ev_kexin_birthday_y1', title:'第一份報告交出去的晚上', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'政大的晚上，山上的風比台大冷一點。'},
      {speaker:null,text:'她和一個同學下課走出來，看到車，停下來。'},
      {cg:'cg_birthday_kexin'},
      {speaker:'kexin',expression:'surprised',text:'……你怎麼知道我幾點下課？'},
      {choice:[{text:'「妳的課表在我手機裡。」',goto:'a'},{text:'「問予樂的。」',if:{events:['ev_kexin_yule_pass']},goto:'b'},{text:'「猜的。」',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那張是我開玩笑傳給你的。……你真的存了。'},{goto:'yl'},
      {label:'b'},{speaker:'予樂',text:'我什麼都沒說。'},{speaker:'kexin',expression:'teasing',text:'她說了。她每次說謊都先撥頭髮。'},{goto:'yl'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'猜錯的話，你要在這裡等多久？'},{speaker:'player',text:'等到猜對。'},{speaker:'kexin',expression:'smile',text:'……很會講欸。'},
      {label:'yl'},
      {if:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。司機，載好她。'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:null,text:'予樂看了你一眼，對可昕說：'},
      {unless:{events:['ev_kexin_yule_pass']},speaker:'予樂',text:'好，我先走。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {if:{flagIs:{K1_ORDER:'let_her'},events:['ev_kexin_tour_nccu','ev_kexin_yule_pass']},speaker:null,text:'老闆記得你的點法。'},
      {speaker:'kexin',expression:'smile',text:'今天本來是一個普通的週三。'},
      {speaker:'kexin',expression:'smile',text:'……你從台北開上來喔？山路晚上很暗欸。'},
      {speaker:'kexin',expression:'smile',text:'今天你點餐。'} ],
    consequences:{flags:{KX_DEC3_VISIT:true},memo:'第一份報告交出去的晚上（政大）'} },
  /* 可昕的生日（BB_96 9-7b；2026-10-15 BB-B：生日改 4/24，AA_137 第 1 節；AA_140 G01）：大一下第 9 週週五 4/24（期中考週）。做法和 12/3 同一套（story3d.js phoneRules）：
     早上行事曆「可昕生日」；草稿「生日快樂。」（23:59 前）；18:00 出遊提示；都沒做＝隔天早上只有「我等了一天。」。這是去的那一段（校門 → 山下那一家）。
     「我帶了另一個。」只給 12/3 去過政大的玩家（KX_DEC3[1]:'visit'）。BCG-45 放在蠟燭點著、她用手圍住火的那一拍：三個選項都會到這一拍（選三，她說完「規定」還是讓你點）。
     經濟系那年送過空白筆記本的（E18B_GIFT:'notebook'）她多一句。「我們的店」第三次以上、K1 讓她點的：老闆的那一句。記 KX_BDAY_VISIT（phoneRules 換成 KX_BDAY:{1:'visit'}）*/
  { id:'ev_kexin_birthday_y1s2', title:'她的生日', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'政大・校門口',bg:'nccu_gate'},
      {speaker:null,text:'四月底的政大，校門口那排流蘇開成白色的。風一吹，白色的花掉了一地。'},   /* AA_209 附錄B §2 */
      {speaker:null,text:'她站在校門口，手上一個便利商店的小蛋糕，蓋子上插著一根還沒點的蠟燭。'},
      {speaker:'kexin',expression:'smile',text:'予樂買的。她說「蠟燭要給司機點」，然後就跑了。'},
      {speaker:'kexin',expression:'smile',text:'（把打火機遞給你）風很大。你點，我擋。'},
      {choice:[{text:'（點蠟燭，她用手圍住火）',goto:'a'},{text:'「我帶了另一個。」',if:{custom:G=>!!(G.flags.KX_DEC3&&G.flags.KX_DEC3[1]==='visit')},goto:'b'},{text:'「先上車，車裡沒風。」',goto:'c'}]},
      {label:'a'},{cg:'cg_birthday_tassel_kexin'},{speaker:null,text:'火點著了。她的手被照得很亮。'},{speaker:'kexin',expression:'smile',text:'……好。現在許願。'},{goto:'wish'},
      {label:'b'},{speaker:'kexin',expression:'laugh',text:'兩個蛋糕？……好，我都會吃完。'},/* AA_209 附錄B §2 */{cg:'cg_birthday_tassel_kexin'},{goto:'wish'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'不行。在外面點。……車裡會有蠟燭的味道。'},{cg:'cg_birthday_tassel_kexin'},   /* AA_313 第 2 節第 26 列：不用規則裝可愛（原本「……這是規定。……我剛剛訂的規定。」）*/
      {label:'wish'},
      {speaker:'kexin',expression:'smile',text:'願望許好了。說出來就不準了。……走，下山。'},   /* AA_209 附錄B §2（原本兩句的三段條列換成這一句）；AA_313 第 2 節第 26 列：「今天你點餐。」和 12/3 同一句，換「……走，下山。」*/
      {if:{flagIs:{E18B_GIFT:'notebook'}},speaker:'kexin',expression:'smile',text:'那本筆記本，寫到第十二頁了。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},
      {if:{flags:['E18A_DOUHUA']},speaker:'kexin',expression:'smile',text:'你第一次跟我單獨吃的，是豆花。'},{if:{flags:['E18A_DOUHUA']},speaker:'kexin',expression:'teasing',text:'……今天不准點豆花。'},   /* 經濟系那年 12/3 單獨吃過豆花（BB_96 9-7b，BB-B a48d7f8a；第一句是 BB_104 8b-11a）。BB_161 ⑮：換到山下那一家的背景以後才說 */
      {if:{flagIs:{K1_ORDER:'let_her'},custom:G=>(G.flags.NCCU_FOOD_N|0)>=3},speaker:'老闆',text:'生日喔？今天的蔥多放一點。'} ],   /* BB_161 ⑯：實際在山下那一家吃過的次數（含今天；events3d.js 的 NCCU_FOOD_N，舊存檔照完成的事件補算）*/
    consequences:{flags:{KX_BDAY_VISIT:true},memo:'可昕的生日（政大，4/24）'} },
  /* 期末成績：寒假第一天晚上和可昕視訊一起打開（BB_95 9-8）。等的玩家：她數完以後成績單接著出來；先看的玩家：照樣一起打開。沒接（錯過、今天先不要）：成績隔天早上照常出來 */
  { id:'ev_kexin_grades_open', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {if:{custom:G=>typeof PHONE!=='undefined'&&!!PHONE.sent&&PHONE.sent(G,'kx_video_photo')},speaker:'kexin',expression:'teasing',text:'你欠我的那一次，用這個還。'},   /* AA_356 1-1：第 16 週視訊一起讀書沒到（書桌照片「你欠我一次」）的下文 */
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:'kexin',expression:'smile',text:'……都過了。好，這次才是真的放假。'} ],   /* AA-C 11:23（16 週制：1/5 已經放假兩週）*/
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S1) await CLS.showGrades(GM,'Y1S1'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S1) R.note.gradesDue='Y1S1'; } } },
  /* 9-9 大一下 together（AA_157 第 2 節；BB_139 2-1：照大一上兩句，只換「暑假」）：暑假第一天 21:00 視訊一起打開；沒接＝隔天早上照常發成績單 */
  { id:'ev_kexin_grades_open_y1s2', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {speaker:'kexin',expression:'smile',text:'……都過了。好，這下暑假真的開始了。'}   /* AA_209 附錄 B 第 4 節第 2 點（成績 6/29 才公布）*/ ],
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
      {label:'q'},{speaker:'kexin',expression:'teasing',text:'情人節我們不在同一個地方。……你今天做了什麼？'},
      {choice:[{text:'「讀民總。」',goto:'a1'},{text:'「傳訊息給妳。」',goto:'a2'},{text:'「我不知道。我想見妳。」',set:{KX_VDAY_SEE:true},goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'laugh',text:'……寒假還在讀民總的人，都這樣回答。'},{speaker:null,text:'她笑。'},{goto:'end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'那開學以後，我們補過一次。'},{goto:'end'},
      {label:'a3'},{speaker:null,text:'嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'開學第二個週末。我寫進行事曆了。'},   /* AA_373 #10：第一次「我們的日子」在第 2 週（3/2 她才傳；第一個週末 2/28～3/1 已經過了）*/
      {label:'end'},{speaker:'kexin',expression:'smile',text:'情人節快樂。臺北冷，穿厚一點。'} ],
    after:G=>{ const F=G.flags; F.KX_VDAY=Object.assign({},F.KX_VDAY||{},{1:'video'}); if(F._kxVwx){ F.KX_VDAY_WX=Object.assign({},F.KX_VDAY_WX||{},{1:F._kxVwx}); delete F._kxVwx; } } },
  /* 9-3 K5「我們的日子」的第一次（同一週選的那一天）：照選的方式見面，短。沒到：「我等了二十分鐘。……下週同一天。這次不要讓我等。」（只一次；AA_313 第 2 節第 22 列，原本「我等了一下。沒關係，下週同一天。」太溫和）。舞台說明改旁白 */
  { id:'ev_kexin_our_day', title:'我們的日子', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||PHONE.sent(G,'kx_our_day_miss')) return; PHONE.at(G,G.day,Math.max(G.hour,q.h+1),[{th:'p:kexin',from:'kexin',text:'我等了二十分鐘。……下週同一天。這次不要讓我等。'}],'kx_our_day_miss'); },
    dialogue:[ {if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='nccu'},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='ntu'},scene:'台大・社科院門口',bg:'ntu_soc'},
      {if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='mid'},scene:'公館',bg:'gongguan'},{if:{custom:G=>(G.flags.KX_OUR_DAY||{}).mode==='video'},scene:'視訊',bg:'video'},
      {speaker:null,text:'她把手機上的行事曆對著你。'},{speaker:'kexin',expression:'smile',text:'那一格我寫了『我們』。……『約會』兩個字太噁心了。'} ] },   /* AA_313 第 21 列（AA_389 第 4 點確認）：見面、視訊都通；原本「不是『約會』。是『我們』。」是同學期第二句「不是 X，是 Y」*/
  /* K5 之後每週的「我們的日子」（AA-B 2026-10-16 裁定）：一句地點字幕，接著 OUT.go 推進她的閒聊階梯（沒有新台詞）。
     第 5 週起第一次（K7 有準備東西的玩家）：字幕之後先說「你送的那個，我放在書桌上。」（只一次）。撞到別的出遊、選了別的＝「好，這週換一天。」；單純略過沒有台詞 */
  { id:'ev_kexin_our_day_wk', title:'我們的日子', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:2,
    beforeOuting:(G,GM,q)=>{ G.flags._kxODP=q&&q.odPlace||'video'; },
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||typeof OUT==='undefined') return; const other=OUT.rec(G).some(o=>o!==q&&o.state==='done'&&o.day===q.day&&!/^kx_od_/.test(o.id));
      if(!other) return; const F=G.flags, echo={understand:'上次是我改期，這次換你。好，改天。',ask:'你那天有事喔？好，改天。',/* AA_209 附錄B §2 */sulk:'我上次被你唸了。……好啦，我不唸你。'}[F.K6_RESPONSE];
      if(echo&&!F.KX_K6_ECHO){ F.KX_K6_ECHO=true; PHONE.at(G,G.day,Math.max(G.hour,q.h),[{th:'p:kexin',from:'kexin',text:echo}],'kx_od_swap_'+q.day); return; }   /* BB_161 ⑬：K6 之後第一次換一天＝照 K6_RESPONSE 回他（BB_96 9-6「之後」、BB_107 第 6 節），只一次 */
      PHONE.at(G,G.day,Math.max(G.hour,q.h),[{th:'p:kexin',from:'kexin',text:'好，這週換一天。'}],'kx_od_swap_'+q.day); },
    dialogue:[ {if:{flagIs:{_kxODP:'nccu'}},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{flagIs:{_kxODP:'ntu'}},scene:'台大・社科院門口',bg:'ntu_soc'},{if:{flagIs:{_kxODP:'gongguan'}},scene:'公館',bg:'gongguan'},
      {if:{flagIs:{_kxODP:'wenzhou'}},scene:'溫州街',bg:'wenzhou'},{if:{flagIs:{_kxODP:'river'}},scene:'河濱',bg:'riverside'},{if:{flagIs:{_kxODP:'video'}},scene:'視訊',bg:'video'},
      {if:{custom:G=>['ticket','planner'].includes(G.flags.K7_GIFT)&&!G.flags.KX_GIFT_DESK&&!!(G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]&&G.flags.KX_ANNIV[1]!=='missed')},speaker:'kexin',expression:'smile',text:'你送的那個，我放在書桌上。'},   /* AA_313 第 2 節第 22 列：只給票根、行事曆（湯餃放不了書桌）*/
      {if:{custom:G=>['ticket','planner'].includes(G.flags.K7_GIFT)&&!!(G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]&&G.flags.KX_ANNIV[1]!=='missed')},set:{KX_GIFT_DESK:true}} ] },
  /* K7 準備的東西（AA-B 2026-10-16 裁定）：3/21（六）21:00 系統提示一次、四選一、記 K7_GIFT；那時在睡覺或跳過的，3/22 起床時再問；3/22 18:00 前都沒選＝什麼都沒準備（她照「你人來了就好。」，不扣分；AA_209 附錄B §2） */
  { id:'ev_k7_gift_prep', title:'週年的準備', participants:[], location:'any', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ if(!G.flags.dating_kexin||!G.flags.KX_ANNIV_PLACE||G.flags.K7_GIFT!=null||typeof STORY==='undefined'||!STORY.dayOfKey) return false; const a1=STORY.dayOfKey(STORY.KX_ANNIV_DAY); return a1!=null&&((G.day===a1-1&&G.hour>=21)||(G.day===a1&&G.hour<18.5)); }},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey(STORY.KX_ANNIV_DAY)-1},speaker:null,text:'明天是週年。你準備的東西：'},{if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey(STORY.KX_ANNIV_DAY)},speaker:null,text:'今天是週年。你準備的東西：'},
      {choice:[{text:'摩天輪票根的影本，背面寫那天的日期',set:{K7_GIFT:'ticket'}},{text:'一本空白的行事曆，第一頁寫今天的日期',set:{K7_GIFT:'planner'}},{text:'山下那家的酸辣湯餃（外帶）',unless:{flagIs:{KX_ANNIV_PLACE:'shop'}},set:{K7_GIFT:'dumpling'}},{text:'什麼都沒準備',set:{K7_GIFT:'none'}}]} ] },   /* AA_313 第 2 節第 10 列：地點選政大山下＝湯餃那個選項不出（在同一家收到同一家的外帶）*/
  /* 9-4 K7 交往週年（2026-03-22）：出門前選準備的東西（K7_GIFT，AA-B 確認中的提案：出發前選）→ 她收到的反應 → 她的卡片第一頁的假設題 → 旁白。記 KX_ANNIV {1:place}。不做 CG。
     沒去（婉拒、沒到）：KX_ANNIV {1:'missed'}，當晚 21:00 她打來、卡片的照片「週年快樂。下次你準備。」隔天中午（AA_313 第 2 節第 10 列，ev_kexin_anniv_missed_call）。卡片之後變成宿舍的房間物件「她的週年卡片」（AA-B 2026-10-16：說明用卡片第一頁那句，story3d.js roomItemList）*/
  { id:'ev_kexin_anniversary_y1', title:'週年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G)=>{ if(G.flags.K7_GIFT==null) G.flags.K7_GIFT='none'; },   /* AA-B 2026-10-16：準備的東西在前一晚 21:00 選（ev_k7_gift_prep）；18:00 前都沒選＝什麼都沒準備 */
    outingMissed:(G,GM,q)=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:'missed'}); if(typeof STORY!=='undefined'&&STORY.kxAnnivMissed) STORY.kxAnnivMissed(G,1,q&&q.day!=null?q.day:G.day); },   /* AA_313 第 2 節第 10 列：當晚 21:00 她打來（2-3 A）、卡片的照片改到隔天中午（story3d.js S.kxAnnivMissed）*/
    dialogue:[ {if:{flagIs:{KX_ANNIV_PLACE:'wheel'}},scene:'摩天輪',bg:'ferris_wheel'},{if:{flagIs:{KX_ANNIV_PLACE:'shop'}},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{flagIs:{KX_ANNIV_PLACE:'river'}},scene:'河堤',bg:'riverside'},
      {if:{flagIs:{K7_GIFT:'ticket'}},goto:'g1'},{if:{flagIs:{K7_GIFT:'planner'}},goto:'g2'},{if:{flagIs:{K7_GIFT:'dumpling'}},goto:'g3'},{goto:'g4'},
      {label:'g1'},{speaker:null,text:'（她把票根翻到背面，看了那個日期很久。）'},{speaker:'kexin',expression:'surprised',text:'……原本那張呢？'},{speaker:'player',text:'夾在我書桌的桌墊下面。'},{speaker:'kexin',expression:'smile',text:'（笑了）好。那這張我收。'},{goto:'card'},   /* AA_306 附（可昕不出假設題）；AA_313 第 2 節第 10 列：票根在宿舍桌墊下（房間物件），原本「在我皮夾裡。」*/
      {label:'g2'},{speaker:'kexin',expression:'smile',text:'……這本我要用完。'},{goto:'card'},
      {label:'g3'},{speaker:'kexin',expression:'surprised',text:'這是禮物？'},{speaker:'player',text:'是。'},{speaker:'kexin',expression:'laugh',text:'……這是我收過最燙的禮物。'},{goto:'card'},
      {label:'g4'},{speaker:'kexin',expression:'smile',text:'你人來了就好。'},{speaker:null,text:'（她把卡片推過來）'},   /* AA_209 附錄B §2 */
      {label:'card'},{speaker:'kexin',expression:'teasing',text:'（把卡片翻到第一頁）那天在最高的地方，你說在一起吧。我說好。'},{speaker:'kexin',expression:'teasing',text:'那今天，是第幾圈？'},
      {choice:[{text:'「第一圈。」',goto:'c1'},{text:'「第三百六十五圈。」',goto:'c2'},{text:'「不用算。」',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'那我們還在最高點。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'surprised',text:'……你算過？'},{speaker:'player',text:'猜的。'},{speaker:'kexin',expression:'laugh',text:'猜得很準。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'smile',text:'好。那就一直轉。'},
      {label:'end'},{speaker:null,text:'後面幾頁，她說：『回去再看。』'} ],
    after:G=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:G.flags.KX_ANNIV_PLACE||'shop'}); } },
  /* K7 第二～四年（AA_224 2-c，AA-C ff3f2a4b；排程 story3d.js）：結構同第一年。準備的東西：前一晚 21:00 起、當天 18:30 前選，四選一照第一年，記 K7_GIFT_n（STORY.kxAnnivGiftYear 算第幾年）*/
  { id:'ev_k7_gift_prep_n', title:'週年的準備', participants:[], location:'any', trigger:'auto', background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.kxAnnivGiftYear&&STORY.kxAnnivGiftYear(G)>0},
    dialogue:[ {if:{custom:G=>STORY.kxAnnivGiftYear(G,true)>0},speaker:null,text:'明天是週年。你準備的東西：'},{unless:{custom:G=>STORY.kxAnnivGiftYear(G,true)>0},speaker:null,text:'今天是週年。你準備的東西：'},
      {choice:[{text:'摩天輪票根的影本，背面寫那天的日期',set:{_K7G:'ticket'}},{text:'一本空白的行事曆，第一頁寫「我們的日子」',set:{_K7G:'planner'}},{text:'山下那家的酸辣湯餃（外帶）',unless:{custom:G=>{ const n=STORY.kxAnnivGiftYear(G); return !!n&&G.flags['KX_ANNIV_PLACE_'+n]==='shop'; }},set:{_K7G:'dumpling'}},{text:'什麼都沒準備',set:{_K7G:'none'}}]} ],   /* AA_313 第 2 節第 10 列：那一年地點是政大山下＝湯餃不出 */
    after:G=>{ const n=STORY.kxAnnivGiftYear(G); if(n) G.flags['K7_GIFT_'+n]=G.flags._K7G||'none'; delete G.flags._K7G; } },
  /* K7 第二～四年的週年：地點（q.ap）、第幾年（q.year）由排程帶進來；她收到的反應照第一年；卡片換句：第二年「第二年。」、第三年「第三年。」（AA_259 (b) 第 5 點：原本「第三年。我們好像…」）、第四年「第四年。」（選項同第三年）、第五年「第五年。……明年的卡片，換你寫。」（自己的一組選項，AA_363 T1）、第六年卡片在祐廷手上（y6，AA_472 第 3 節；排程 story3d.js 的 n===6）。
     卡片第一頁「那天在最高的地方，你說在一起吧。我說好。」（AA_303 第 2 節 9）只在第一年。記 KX_ANNIV {n:地點}；沒去＝卡片的照片（同第一年），KX_ANNIV {n:'missed'} */
  { id:'ev_kexin_anniversary_yn', title:'週年', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:2.5,
    beforeOuting:(G,GM,q)=>{ const F=G.flags, n=(q&&q.year)||2; F._kxAY=n; F._kxAP=(q&&q.ap)||F['KX_ANNIV_PLACE_'+n]||'shop'; if(F['K7_GIFT_'+n]==null) F['K7_GIFT_'+n]='none'; F._kxAG=F['K7_GIFT_'+n];
      const pg=n-1===1?F.K7_GIFT:F['K7_GIFT_'+(n-1)], pr=F.KX_ANNIV&&F.KX_ANNIV[n-1]; F._kxAGR=['ticket','planner','dumpling'].includes(F._kxAG)&&pg===F._kxAG&&!!pr&&pr!=='missed'&&pr!=='video'; },   /* AA_313 第 2 節第 36 列：和前一年送一樣的（前一年有見到面、她收到了）＝換句 */
    outingMissed:(G,GM,q)=>{ const n=(q&&q.year)||2; G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{[n]:'missed'}); if(typeof STORY!=='undefined'&&STORY.kxAnnivMissed) STORY.kxAnnivMissed(G,n,q&&q.day!=null?q.day:G.day); },   /* AA_313 第 2 節第 36 列：同第一年（2-3 A）*/
    dialogue:[ {if:{flagIs:{_kxAP:'wheel'}},scene:'摩天輪',bg:'ferris_wheel'},{if:{flagIs:{_kxAP:'shop'}},scene:'政大・山下的小吃街',bg:'nccu_food'},{if:{flagIs:{_kxAP:'river'}},scene:'河堤',bg:'riverside'},
      /* 第五年（AA_357 3-2，2029-10-17）：地點之後兩句；第二句延畢（交換路線）和不延畢不同 */
      {if:{flagIs:{_kxAY:5}},speaker:'kexin',expression:'smile',text:'五年。我們認識的時候，你還在經濟系。'},
      {if:{flagIs:{_kxAY:5},custom:G=>typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G)},speaker:'kexin',expression:'smile',text:'……你一月拿證書。我們兩個，同一年開始。'},
      {if:{flagIs:{_kxAY:5},custom:G=>!(typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G))},speaker:'kexin',expression:'smile',text:'我十二月放榜。你八月考。……我們兩個，同一年開始。'},
      /* 第六年（AA_472 第 3 節，企劃線 1ebcf530e；2030-10-17）：地點之後一句；第五年選了「寫什麼？」（KX_ANNIV5_WHAT）的換一句 */
      {if:{flagIs:{_kxAY:6}},unless:{flags:['KX_ANNIV5_WHAT']},speaker:'kexin',expression:'smile',text:'六年。……今年是你寫。'},
      {if:{flagIs:{_kxAY:6},flags:['KX_ANNIV5_WHAT']},speaker:'kexin',expression:'smile',text:'六年。……你想好要寫什麼了嗎？'},
      {if:{flagIs:{_kxAG:'ticket'}},goto:'g1'},{if:{flagIs:{_kxAG:'planner'}},goto:'g2'},{if:{flagIs:{_kxAG:'dumpling'}},goto:'g3'},{goto:'g4'},
      {label:'g1'},{speaker:null,text:'（她把票根翻到背面，看了那個日期很久。）'},{if:{flags:['_kxAGR']},speaker:'kexin',expression:'smile',text:'……又一張。去年那張我還留著。'},{if:{flags:['_kxAGR']},goto:'card'},{speaker:'kexin',expression:'surprised',text:'……原本那張呢？'},{speaker:'player',text:'夾在我書桌的桌墊下面。'},{speaker:'kexin',expression:'smile',text:'（笑了）好。那這張我收。'},{goto:'card'},   /* AA_306 附（可昕不出假設題）；AA_313 第 2 節第 10 列：票根在宿舍桌墊下（房間物件），原本「在我皮夾裡。」*/
      {label:'g2'},{if:{flags:['_kxAGR']},speaker:'kexin',expression:'smile',text:'……去年那本我用完了。'},{unless:{flags:['_kxAGR']},speaker:'kexin',expression:'smile',text:'……這本我要用完。'},{goto:'card'},
      {label:'g3'},{if:{flags:['_kxAGR']},speaker:'kexin',expression:'smile',text:'又是這個。……好，我吃。'},{if:{flags:['_kxAGR']},goto:'card'},{speaker:'kexin',expression:'surprised',text:'這是禮物？'},{speaker:'player',text:'是。'},{speaker:'kexin',expression:'laugh',text:'……這是我收過最燙的禮物。'},{goto:'card'},
      {label:'g4'},{speaker:'kexin',expression:'smile',text:'你人來了就好。'},{unless:{flagIs:{_kxAY:6}},speaker:null,text:'（她把卡片推過來）'},   /* 第六年卡片在祐廷手上（卡片那一段換成 y6）：這一句不出 */
      {label:'card'},{if:{flagIs:{_kxAY:3}},goto:'y3'},{if:{flagIs:{_kxAY:4}},goto:'y4'},{if:{flagIs:{_kxAY:5}},goto:'y5'},{if:{flagIs:{_kxAY:6}},goto:'y6'},   /* 第五年：AA_363 T1（卡片第一頁一句＋自己的一組選項）；第六年：AA_472 第 3 節（卡片是祐廷寫的，不加選項）*/
      {speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第二年。'},
      {choice:[{text:'「明年也是。」',goto:'a1'},{text:'「時間好快。」',goto:'a2'},{text:'（握住她的手）',goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'teasing',text:'你說的喔。'},{goto:'end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'對啊。我還以為你會忘記。'},{speaker:'kexin',expression:'smile',text:'……你沒有。'},{goto:'end'},
      {label:'a3'},{speaker:null,text:'（她沒有說話。手握緊了一點。）'},{goto:'end'},
      /* 第五年（AA_363 T1）：接 3-2 開頭「我們兩個，同一年開始」；不用第三、四年那一組（那組回的是第三年「會一直轉下去」）。數值、旗標照第二～四年（都沒有）*/
      {label:'y5'},{unless:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第五年。……明年的卡片，換你寫。'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第五年。……明年的卡片，又換你寫。'},   /* AA_525 3-4：KX_CARD_MINE 的「又換你寫」*/
      {choice:[{text:'「好。」',goto:'d1'},{text:'「寫什麼？」',goto:'d2'},{text:'（把卡片收進外套口袋）',goto:'d3'}]},
      {label:'d1'},{speaker:'kexin',expression:'teasing',text:'你說的喔。……錯字我會圈起來。'},{goto:'end'},
      {label:'d2'},{set:{KX_ANNIV5_WHAT:true}},{speaker:'kexin',expression:'laugh',text:'你自己想。……你想五年了吧。'},{goto:'end'},   /* KX_ANNIV5_WHAT：第六年地點之後那一句換（AA_472 第 3 節）*/
      {label:'d3'},{speaker:null,text:'（她看著你收好，嘴角動了一下。）'},{goto:'end'},
      {label:'y3'},{speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第三年。'},{goto:'b0'},   /* AA_259 (b) 第 5 點 K13（AA_312 第 3 節 B-7）：第三年的卡片句、b0 選項與回覆 */
      /* 第四年（AA_378 #10，企劃線 5cd35678；照 BB_209 第 4 節、AA_224 2-c）：自己一組選項；原本接第三年那組（「會啊。」「轉到頭暈怎麼辦？」回的是第三年「會一直轉下去」）*/
      {label:'y4'},{unless:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。'},
      /* AA_525 3-4（K-5，企劃線 6081f725f）：第三年說「明年換我寫。」（KX_CARD_MINE）的，第四年（臺灣、日本路線；美國路線第四年是視訊，不改）換這三句，後面接現有的三個選項 */
      {if:{flags:['KX_CARD_MINE']},speaker:null,text:'（這一次，第一張卡片是你寫的。你把它推過去。）'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（翻開，讀完）……你的字。'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'第四年。……明年這一天，我們都畢業了。'},
      {choice:[{text:'「明年也一起過。」',goto:'c1'},{text:'「時間好快。」',goto:'c2'},{text:'（不說話，看著她）',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'好。寫進表格。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'smile',text:'對啊。四年前你還不知道政大怎麼走。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'teasing',text:'……幹嘛一直看。'},{goto:'end'},
      {label:'b0'},{choice:[{text:'「明年換我寫。」',goto:'b1'},{text:'「每年都寫這麼多？」',goto:'b2'},{text:'（不說話，看著她）',goto:'b3'}]},
      {label:'b1'},{speaker:'kexin',expression:'smile',text:'好。要手寫喔。'},{set:{KX_CARD_MINE:true}},{goto:'end'},   /* AA_525 3-4（K-5）：記 KX_CARD_MINE＝第四年的第一張卡片是祐廷寫的 */
      {label:'b2'},{speaker:'kexin',expression:'teasing',text:'你每年都只看第一頁。'},{goto:'end'},
      {label:'b3'},{speaker:'kexin',expression:'teasing',text:'……幹嘛一直看。'},
      {label:'end'},{speaker:null,text:'後面幾頁，她說：『回去再看。』'},{goto:'fin'},
      /* 第六年（AA_472 第 3 節）：卡片在你的外套口袋裡（第五年「明年的卡片，換你寫。」）；不加選項；數值、旗標照第二～五年（KX_ANNIV {6}）*/
      {label:'y6'},{speaker:null,text:'（這一次，卡片在你的外套口袋裡。你把它推過去。）'},{speaker:null,text:'（她翻開第一頁，看了很久。從包包拿出一支紅筆。）'},
      {speaker:'kexin',expression:'teasing',text:'（圈了一個字）……這個字寫錯了。'},{speaker:'kexin',expression:'smile',text:'留著。不要改。'},{speaker:null,text:'（她把卡片收進包包最裡面那一層。）'},
      {label:'fin'} ],
    after:G=>{ const F=G.flags, n=F._kxAY||2; F.KX_ANNIV=Object.assign({},F.KX_ANNIV||{},{[n]:F._kxAP||'shop'}); delete F._kxAY; delete F._kxAP; delete F._kxAG; delete F._kxAGR; } },
  /* K7 第四年他在美國（交換路線 US、那天在國外；STORY.kxAnnivVideo）：她那邊晚上九點、他那邊早上，視訊（AA_224 2-c）。不選地點與禮物。記 KX_ANNIV {4:'video'}；沒接＝{4:'missed'} */
  { id:'ev_kexin_anniversary_video', title:'週年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    outingMissed:(G)=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{4:'missed'}); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'週年快樂。你那邊是早上吧。'},{speaker:'kexin',expression:'neutral',text:'卡片我寄了，下禮拜才會到。'},{speaker:'kexin',expression:'smile',text:'……你回來我們再去一次摩天輪。'} ],
    after:G=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{4:'video'}); } },
  /* 答應去高雄跨年、沒出發（AA_313 第 2 節第 15、37 列，2-3 B）：00:05 她打來（演出來的電話；大一～大四共用，排程 story3d.js S.kxNyeMissedCall）*/
  { id:'ev_kexin_nye_missed_call', title:'可昕的電話', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:0.1,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。很吵，她那邊還有人在放煙火。）'},
      {speaker:'kexin',expression:'neutral',text:'你在哪。'},{speaker:'player',text:'……臺北。'},{speaker:'kexin',expression:'neutral',text:'我在愛河等到零點。'},{speaker:'kexin',expression:'neutral',text:'……新年快樂。我要回家了。'},
      {speaker:null,text:'（她掛掉了。）'} ] },
  /* 週年沒去（AA_313 第 2 節第 10、36 列，2-3 A：沒選地點、沒出發都用這段）：當晚 21:00 她打來（演出來的電話；排程 story3d.js S.kxAnnivMissed）。KX_ANNIV[n]='missed' 照舊；卡片的照片「週年快樂。下次你準備。」改到隔天中午 */
  { id:'ev_kexin_anniv_missed_call', title:'可昕的電話', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:0.1,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。她那邊很安靜。）'},
      {speaker:'kexin',expression:'neutral',text:'今天幾號。'},{speaker:'player',text:'……十七號。'},{speaker:'kexin',expression:'neutral',text:'嗯。'},{speaker:'kexin',expression:'neutral',text:'卡片我寫好了。我自己帶回去。'},
      {choice:[{text:'「對不起。我明天去找妳。」',goto:'a'},{text:'「我忘了。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'neutral',text:'……明天我有課。'},{speaker:null,text:'（她掛掉了。）'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'neutral',text:'……你忘了。'},{speaker:null,text:'（她掛掉了。）'},
      {label:'end'} ] },
  /* 9-6 K6 週日的兩校互考（政大山下或視訊）：三題對三題，題目內容不顯示（不寫法律結論）；玩家選出哪一種題目。記 KX_QUIZ {win,lose,draw}（四年累計，BB_107 K10、K25 讀它）。舞台說明改旁白 */
  { id:'ev_kexin_reschedule', title:'兩校互考', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE==='undefined'||PHONE.sent(G,'kx_quiz_miss')) return; PHONE.at(G,G.day,Math.max(G.hour,q.h+1),[{th:'p:kexin',from:'kexin',text:'📷（考古題）'},{th:'p:kexin',from:'kexin',text:'下次你逃不掉。'}],'kx_quiz_miss'); },
    dialogue:[ {if:{flagIs:{KX_QUIZ_MODE:'video'}},scene:'視訊',bg:'video'},{unless:{flagIs:{KX_QUIZ_MODE:'video'}},scene:'政大・山下的小吃街',bg:'nccu_food'},
      {speaker:null,text:'三題對三題。你出哪一種？'},
      {choice:[{text:'簡單的（上課講過的定義）',set:{_kxQ:'draw'},goto:'e'},{text:'中等的（課本後面的例題）',set:{_kxQ:'win'},goto:'m'},{text:'冷門的（某一說的少數見解）',set:{_kxQ:'lose'},goto:'h'}]},
      /* AA_373 第 6 節 6-1（企劃線 bdab2f42，AA 22:0x）：「平手。各付各的。」改「兩個都對。……走，山下那攤。」；視訊那一版照第 6-2 節第 8 題換成「……下次見面，山下那攤。」（同一個理由：人不在政大；這一句 LAWWW 照第 8 題推的，給 AA 的問題）*/
      {label:'e'},{unless:{flagIs:{KX_QUIZ_MODE:'video'}},speaker:'kexin',expression:'smile',text:'兩個都對。……走，山下那攤。'},{if:{flagIs:{KX_QUIZ_MODE:'video'}},speaker:'kexin',expression:'smile',text:'兩個都對。……下次見面，山下那攤。'},{goto:'end'},
      /* AA_373 #25（使用者 10-18：「她沒有在跟我比，你不要再把這個比較的東西放進來」）：不寫輸贏、誰請；互考本身照留（互相督促，AA_293 第 9 節）。
         「走，山下那攤。」視訊的那一版換成「……下次見面，山下那攤。」（AA_373 第 6-2 節第 8 題，企劃線 bdab2f42）。KX_QUIZ 照記（舊的計數，別的事件讀它）*/
      {label:'m'},{speaker:null,text:'她想了很久，答對一半。'},{speaker:'kexin',expression:'laugh',text:'……一半。回去我再讀一次。'},{unless:{flagIs:{KX_QUIZ_MODE:'video'}},speaker:'kexin',expression:'smile',text:'走，山下那攤。'},{if:{flagIs:{KX_QUIZ_MODE:'video'}},speaker:'kexin',expression:'smile',text:'……下次見面，山下那攤。'},{goto:'end'},
      {label:'h'},{speaker:'kexin',expression:'teasing',text:'犯規。冷門學說是犯規。'},{speaker:null,text:'（她把那一題劃掉。）'},{speaker:'kexin',expression:'teasing',text:'……下一題。'},
      {label:'end'} ],
    after:G=>{ const F=G.flags, k=F._kxQ; delete F._kxQ; F.KX_K6_EXAM=true; if(!k) return; const Q=F.KX_QUIZ=Object.assign({win:0,lose:0,draw:0},F.KX_QUIZ||{}); Q[k]=(Q[k]|0)+1; } },   /* KX_K6_EXAM：做過 K6 互考（重訪日 1 她那一句讀它，BB_96 9-10）*/
  { id:'ev_dorm_late_kai', title:'半夜', participants:['kai'], location:'dorm', trigger:'enter', time:[23.5,26], term:['Y1S1','Y1S2'], cooldown_days:2, random_weight:0.7, background:'blur', prereq:{flags:['introDone']},   /* BB_170 第 21 列：day_min 3 → introDone 以後；AA_209 第 4 節第 11 點：「什麼 bug？」那一段只播一次（KAI_BUG_TOLD），之後只剩另外兩個選項。AA_502 第 6 節第 8 點：23:30 以後（原本 23:00） */
    dialogue:[ {if:{flags:['DORM_FOUR'],custom:G=>KAI_LATE_BEDS(G)==='both'},speaker:null,text:'（阿哲和柏翰都上床了。柏翰戴著耳塞。）'},{if:{flags:['DORM_FOUR'],custom:G=>KAI_LATE_BEDS(G)==='zhe'},speaker:null,text:'（阿哲已經上床了。柏翰的床還是空的。）'},   /* AA_502 第 6 節第 8 點：照誰在床上（都不在＝不說；AA 沒寫只有柏翰的＝不說）；原本一律「（阿哲已經睡了，柏翰戴著耳塞。）」*/{if:{custom:KAI_LATE_BUG},speaker:'kai',expression:'neutral',text:'（頭沒回）欸，你回來了。我這個 bug 追到第三小時。'},{unless:{custom:KAI_LATE_BUG},speaker:'kai',expression:'neutral',text:'在等編譯，你先洗澡。'},   /* 四人房（AA_208 2-4）*/{choice:[{text:'「去睡啦。」',consequences:{rel:{kai:{fam:1,comf:1}}}},{text:'「什麼 bug？」',unless:{flags:['KAI_BUG_TOLD']},consequences:{rel:{kai:{fam:2,trust:1}},flags:{KAI_BUG_TOLD:true}},goto:'bug'},{text:'（戴上耳機）',consequences:{}}]},{goto:'end'},{label:'bug'},{speaker:'kai',expression:'tired',text:'一個值應該是 0 結果是 undefined。……你們法律系有這種東西嗎？'},{speaker:'player',text:'有。叫「法無明文」。'},{speaker:'kai',expression:'laugh',text:'（他笑了一聲，轉回去打字）好啦，你贏。'},{label:'end'} ] },
  /* VA-07 柏翰的週四總圖（AA_241 第 5 節，AA 定稿）：大一暑假第一次在週四的總圖和柏翰說話（ACQUAINTANCE 以上）演一次；「一起讀？」記 BOHAN_SUMMER_THU。
     之後的週四：短招呼（一週一次，接著照一般閒聊）。他在總圖的時間在 characters.js 的作息（STORY.bohanSummer）*/
  { id:'ev_va07_bohan_thu', title:'新竹到這裡', participants:['classmate_bohan'], location:'library', trigger:'interact', priority:8, once:true, weekday:[4], background:'blur',
    prereq:{stage:{npc:'classmate_bohan',min:'ACQUAINTANCE'},custom:G=>!!(typeof STORY!=='undefined'&&STORY.bohanSummer&&STORY.bohanSummer(G))},
    dialogue:[ {speaker:null,text:'（總圖三樓，柏翰坐在靠窗的位子。桌上放著客運的票根。）'},
      {speaker:'classmate_bohan',text:'新竹到這裡，一小時二十分。單程。'},{speaker:'classmate_bohan',text:'在家讀不下去。家裡冷氣太涼，我會睡著。'},
      {choice:[{text:'「每週都來？」',goto:'a'},{text:'「一起讀？」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_bohan',text:'每週四。九點到五點。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_bohan',text:'好。我的計時器五十分鐘響一次，你不要嚇到。'},{set:{BOHAN_SUMMER_THU:true}},
      {label:'end'} ] },
  { id:'ev_va07_bohan_thu_greet', title:'週四的招呼', participants:['classmate_bohan'], location:'library', trigger:'interact', priority:7, weekday:[4], cooldown_days:6, background:'blur',
    prereq:{events:['ev_va07_bohan_thu'],custom:G=>!!(typeof STORY!=='undefined'&&STORY.bohanSummer&&STORY.bohanSummer(G))&&(G.events.last||{}).ev_va07_bohan_thu!==G.day},
    dialogue:[ {speaker:null,text:'（他抬頭點了一下，指了指旁邊的位子。）'} ] },
  { id:'ev_library_closing', title:'閉館', participants:[], location:'library', trigger:'auto', time:[21.6,22.2], cooldown_days:1, background:'freeze',
    dialogue:[ {speaker:null,text:'「本館將於十分鐘後閉館——」廣播響起，整個閱覽室同時發出收東西的聲音。'} ], consequences:{goal:'總圖要閉館了'} },
  /* AA_498 2-9（AA-C 2026-10-28）：①「你確定在教室看過」只給在教室出現的人，其他人換成「在〈他的地點〉看過」（POOL.greetPlace：表上的地點）；
     ②pool_greeted 一次見面用完就清掉（原本設了就一直在，之後選「假裝看手機」也加熟悉）。對象＝這一區第一個看過三次（RECOGNIZABLE）、還沒打過招呼的（POOL.greetTarget，開場記下來、演完照同一個人）*/
  { id:'ev_pool_greet', title:'好像認識的人', participants:[], location:['campus','library'], trigger:'auto', time:[8,22], day_min:3, cooldown_days:1, random_weight:1.2, prereq:{custom:(G,GM)=>{ return Object.keys(GM.npc).some(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]); }}, background:'freeze',
    dialogue:[ {call:(G,GM)=>{ const P=typeof POOL!=='undefined'?POOL:null; G.flags.POOL_GREET_ID=(P&&P.greetTarget?P.greetTarget(G,GM):null)||Object.keys(GM.npc).find(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id])||null; G.flags.POOL_GREET_AT=P&&P.greetPlace?P.greetPlace(G,GM):'教室'; }},
      {speaker:null,text:'迎面走來一個人，你確定在{flag:POOL_GREET_AT|教室}看過。對方也放慢了一步。'},{choice:[{text:'點頭',consequences:{flags:{pool_greeted:true}}},{text:'假裝看手機',consequences:{}}]},{speaker:null,text:'（有些人就是這樣，從「好像認識」開始的。）'} ],
    after:(G,GM)=>{ const id=G.flags.POOL_GREET_ID||Object.keys(GM.npc).find(k=>k.startsWith('pool_')&&SOCIAL.reveal(k)==='RECOGNIZABLE'&&!G.flags['greet_'+k]); if(id){ G.flags['greet_'+id]=true; if(G.flags.pool_greeted) SOCIAL.adjust(id,{fam:3}); } delete G.flags.pool_greeted; delete G.flags.POOL_GREET_ID; delete G.flags.POOL_GREET_AT; } },
  { id:'ev_an_report_followup', title:'報告的結論', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['afternoonDone'],events:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]}, day_min:3, background:'blur',   /* 交接包 v1 A12 之後（LAWWW 2026-10-14；AA_355 第 2 節：AA 看過、照用）：報告分工問過、你說「我已經有組了」——她寫完在總圖給你看。一起寫的、沒有分工那一段的玩家沒有這一場 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）報告我寫完了。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'（小聲）結論用了那天你說的「無過失」。周老師如果打槍我，我就說是你的主意。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'（小聲）我把你說的「後果自己承擔」寫進反方。寫的時候一直想到你那天的表情。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'（小聲）「不能讓人因為一個手誤賠十倍」——我放在結論。'},{if:{custom:G=>!!(G.choices&&(G.choices.cafeView==='A'||G.choices.cafeView==='B'))},speaker:'heroine_01',expression:'neutral',text:'（小聲）……謝謝你那天陪我。'},
      {if:{custom:G=>!!(G.choices&&G.choices.cafeView)},choice:[{text:'「妳寫得出來，我只是坐在旁邊。」',consequences:{rel:{heroine_01:{comf:4,aff:2}},mem:[{npc:'heroine_01',tag:'HELPED_WITH_REPORT'}]}},{text:'「下次換我請。」',consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說下次換你請'}]}}]},
      /* AA_358 2-4（AA-C 2026-10-21 659d9d81）：拒絕咖啡廳（沒有 cafeView）的玩家沒有「那天」——換一句、換選項（數值照原本兩個選項；第一個不記「幫她寫報告」：沒有一起寫）*/
      {unless:{custom:G=>!!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'neutral',text:'（小聲）……寫完了，先給你看。'},
      {unless:{custom:G=>!!(G.choices&&G.choices.cafeView)},choice:[{text:'「妳寫得出來的。」',consequences:{rel:{heroine_01:{comf:4,aff:2}}}},{text:'「改天請妳喝咖啡。」',consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說改天請她喝咖啡'}]}}]},
      {speaker:'heroine_01',expression:'smile',text:'（小聲）好。'} ] },
  /* ---------- 經濟系那一年（stage:'econ'）----------
     ★E02 新生座談與迎新（使用者 2026-10-18 選擇題改名，AA_154 79932ed9；BB_104 第 8-1 節，BB 2026-10-14 審查通過「可以交」；AA_154 第 95 行）：2024-09-02（一）W1，開學典禮後自動演
     （固定核心：那一天把玩家帶到場）。社科院的大講堂 soc_hall → 系上的教室 soc_classroom（2D 背景，AA_173 第 1 節：社科院不做 3D 室內）；
     用一個經濟學名詞介紹自己，記 E02_WORD（'externality'／'equilibrium'／'invisible_hand'；BB_106 SK08、SK14 讀）。家豪學長、韋綸、唐睿還沒有人物資料，先用名字說話。
     時段（AA-B 定案 A，268d529d）：9/2 週一上午是經濟學原理（照上、不停課），下課以後 12:15～17:00 自動，演完時間到 15:00、人在社科院門口 */
  { id:'ev_y0_e02', stage:'econ', title:'新生座談與迎新', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[1], weekday:[1], time:[12.25,17], once:true, priority:9, background:'dark',
    dialogue:[ {scene:'社科院・大講堂｜新生座談',bg:'soc_hall'},{speaker:null,text:'系上的新生座談在社科院的大講堂。你坐在後面，旁邊的人在滑手機。'},{speaker:null,text:'座談結束。門口有個學長舉著牌子：『經濟系新生，這邊。』'},{scene:'社科院・系上的教室｜迎新',bg:'soc_classroom'},   /* BB_179 段 A E02 重寫（AA_203 2-1：只講名字和從哪裡來，只有可昕用名詞）；旁白：AA_203 #1、AA_200 7-3 散場、BB 建議旁白全部採用（AA-B 01:34）；祐廷「{name}，臺北。」（AA_200 7-2）*/
      {unless:{flags:['ECON_CAMP_OPEN']},speaker:'家豪學長',text:'我是宋家豪，大二，今天帶你們這一組。'},{unless:{flags:['ECON_CAMP_OPEN']},speaker:'家豪學長',text:'先輪一圈，講名字、從哪裡來就好。'},
      {if:{flags:['ECON_CAMP_OPEN']},speaker:'家豪學長',text:'宿營來過的，大部分都見過了。'},{if:{flags:['ECON_CAMP_OPEN']},speaker:'家豪學長',text:'沒來的，講名字、從哪裡來就好。'},   /* 第 7 組 7-3（AA_224 @4e3a7c2b）*/
      {unless:{flags:['ECON_CAMP_OPEN']},speaker:'韋綸',text:'邱韋綸，台中來的。我到現在還搞不清楚哪一棟是哪一棟。'},{if:{flags:['ECON_CAMP_OPEN']},speaker:'韋綸',text:'（他朝你揮手）欸，第三小隊的。'},{speaker:'家豪學長',text:'等一下帶你們走一圈。……社科圖三樓靠窗那張桌子，學長姊說坐過的都考上研究所。'},
      {speaker:'econ_pinyu',expression:'neutral',text:'曾品妤。'},{speaker:null,text:'（她講完就坐下了。下一個是你。）'},{speaker:'player',text:'{name}，臺北。'},
      {speaker:null,text:'（一個一個輪下去。大部分的人講完名字和縣市就坐下。）'},
      {unless:{flags:['ECON_CAMP_OPEN']},speaker:'kexin',expression:'neutral',text:'杜可昕。我是「邊際效用遞減」，早上經原老師講到的。'},{if:{flags:['ECON_CAMP_OPEN']},speaker:'kexin',expression:'neutral',text:'杜可昕。宿營第三小隊的。……我是「邊際效用遞減」，早上經原老師講到的。'},{speaker:'kexin',expression:'smile',text:'第一次見面最好玩，之後越來越普通。……不過我會越來越好玩啦。'},{speaker:null,text:'（有幾個人笑了。）'},
      {speaker:'家豪學長',text:'好，差不多了。零食在前面，自己拿。公館要吃什麼，之後問我，我有一本筆記。'},{speaker:null,text:'（學長在前面發零食。可昕拿了一包，坐到你旁邊。）'},
      {speaker:'kexin',expression:'neutral',text:'你剛剛只講名字喔？'},{speaker:'kexin',expression:'smile',text:'不然你也挑一個。'},
      {choice:[{text:'「我是『外部性』。我會影響到你們，但不用付錢。」',set:{E02_WORD:'externality'},goto:'ext'},{text:'「我是『均衡』。……我不知道為什麼。」',set:{E02_WORD:'equilibrium'},goto:'eq'},{text:'「我是『看不見的手』。」',set:{E02_WORD:'invisible_hand'},goto:'hand'}]},
      {label:'ext'},{speaker:'kexin',expression:'teasing',text:'外部性還沒教欸。'},{speaker:null,text:'（她翻開課本，在目錄找了一下。）'},{goto:'end'},
      {label:'eq'},{speaker:'kexin',expression:'teasing',text:'好，那你是均衡。'},{speaker:null,text:'（她把零食撕開，分了你一半。）'},{goto:'end'},
      {label:'hand'},{speaker:'kexin',expression:'teasing',text:'亞當斯密那個。這個我高中有聽過。'},
      {label:'end'},
      {speaker:'韋綸',text:'（走過來）欸，{name}，你是 412 的吧？我早上去看過，床架上貼的名字有你。'},{speaker:'韋綸',text:'我也是！我晚上才搬進去。'},{speaker:'唐睿',text:'（從後面探頭）412？那我們同一間。我也是晚上。'},   /* 四人房（AA_208、BB_179 第 8 節）*/
      {speaker:'家豪學長',text:'要走一圈的，跟我來！'},{speaker:null,text:'（可昕站起來，跟著大家往門口走。）'} ],
    consequences:{meet:['econ_pinyu']},
    after:(G,GM)=>{ if(G.hour%24<15) GM.advance(15-G.hour%24); if(G.zone!=='campus'&&GM.enter) GM.enter('campus',{x:15,z:-68.5,yaw:Math.PI/2}); } },
  /* P2 下課後的一群人（BB_105 第 137 行；AA_154 第 101 行）：Y0S1 第 3～5 週週四，初等會計學下課（普通教學館門口的腳踏車停放區）；第一次（之後的 P2b 另做）。
     選公館＝接 ★E05（同一天）；選別的、今天先回去、沒去＝E05 在 9/20（五）傍晚照自己的觸發（ev_y0_e05 的 auto 條件）。韋綸、唐睿還沒有人物資料，先用名字說話 */
  { id:'ev_y0_p2', stage:'econ', title:'下課後的一群人', participants:['kexin'], location:'any', trigger:'class', afterClass:'acct_y0', term:['Y0S1'], weeks:[3,4,5], background:'blur',
    prereq:{custom:G=>!G.flags.P2_PICK||G.flags.P2_PICK==='home'},   /* 去成一次就不再演；「今天先回去」的玩家下一次會計課下課再演一次（BB_105 P2「那下次！」＝P2b 補上第一次聚會），到第 5 週為止 */
    dialogue:[ {speaker:'韋綸',text:'走啦！'},{speaker:'econ_pinyu',expression:'neutral',text:'去哪？先說好，我只有一百五。'},{speaker:null,text:'（唐睿在旁邊講電話，朝你們比了一個 OK。）'},{speaker:'kexin',expression:'neutral',text:'（牽著腳踏車）你決定。'},
      {choice:[{text:'公館吃飯',set:{P2_PICK:'gongguan'},goto:'end'},{text:'河濱騎腳踏車',set:{P2_PICK:'river'},goto:'river'},{text:'總圖念書',set:{P2_PICK:'library'},goto:'lib'},{text:'「今天先回去。」',set:{P2_PICK:'home'},goto:'home'}]},
      {label:'river'},{speaker:null,text:'韋綸的鏈子掉了兩次。'},{speaker:'kexin',expression:'smile',text:'你那台要不要拿去修？我的也怪怪的，一起去。'},{goto:'end'},
      {label:'lib'},{speaker:null,text:'唐睿講了四十分鐘的話。'},{speaker:'econ_pinyu',expression:'neutral',text:'今天一頁都沒讀。'},{goto:'end'},
      {label:'home'},{speaker:'韋綸',text:'那下次！'},
      {label:'end'} ],
    consequences:{meet:['econ_pinyu']},
    after:(G,GM)=>{ const p=G.flags.P2_PICK; if(p==='gongguan'){ const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e05'); if(e&&typeof EVENTS!=='undefined'&&!(G.events&&G.events.done&&G.events.done.ev_y0_e05)) setTimeout(()=>{ void EVENTS.run(e); },0); } else if(p==='river'||p==='library') GM.advance(1.5); } },
  /* ★E05 鏈子掉了（BB_104 第 8-2 節；AA_154 第 102 行；AA_303 第 2 節 4 整段換：你幫她裝回鏈子、她還洗好的制服、請你喝飲料）：P2 選公館接著演。
     E05_OPEN 固定記 'fix'（E06／D2 讀它才會發；E06 第一句「你今天說要幫我修車，」待 AA 對新場景確認）。演完記 E05_DAY、E05_END（E06／D2 用）。
     原本 P2 選公館才有的「品妤挑了一家一百二十元吃到飽的……」隨整段替換拿掉 */
  { id:'ev_y0_e05', stage:'econ', title:'鏈子掉了', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[3], weekday:[5], time:[17,19.5], once:true, background:'blur',   /* P2 選公館＝P2 演完直接接（9/19）；其他＝9/20（五）17:00～19:30 自動（固定核心）*/
    dialogue:[ {speaker:null,text:'（可昕的腳踏車鏈子掉了，她蹲在路邊研究。車籃裡放著一件折好的制服。你的。）'},
      {speaker:'kexin',expression:'neutral',text:'（抬頭）……你會修嗎？'},
      {speaker:null,text:'（你蹲下來，把鏈子一節一節掛回齒輪上。手都是油。）'},{set:{E05_OPEN:'fix'}},
      {speaker:'kexin',expression:'smile',text:'（遞面紙）……謝謝。'},
      {speaker:'kexin',expression:'neutral',text:'（從車籃拿出制服）洗好了。'},
      {choice:[{text:'「妳真的洗了。」',goto:'w'},{text:'「下次再借妳穿。」',goto:'n'}]},
      {label:'w'},{speaker:'kexin',expression:'teasing',text:'當然。我又不是那種人。'},{goto:'end'},
      {label:'n'},{speaker:'kexin',expression:'embarrassed',text:'……誰要穿你的。'},{speaker:null,text:'（她把制服塞給你。）'},
      {label:'end'},{speaker:'kexin',expression:'smile',text:'走。我請你喝飲料。公館。'} ],
    after:(G,GM)=>{ GM.advance(1.5); G.flags.E05_DAY=G.day; G.flags.E05_END=G.hour%24; } },
  /* ★E08 中秋系烤（BB_153，AA-B 核對通過、數值照 BB 建議定案；AA_154 第 88 行、A3：中秋後的週六 9/21 17:00 河濱）：9/16 全班群組揪、9/21 16:00 韋綸私訊，回「好」＝出遊（story3d.js）。
     AA_305 第 4 節（使用者選「柚子帽」）：誰生火的三選一拿掉，換成柚子帽（戴上／拿著，不記旗標）；唐睿那頂留給品妤、品妤不要＝12/31 跨年接。月亮收租已經拿掉（AA_302 第 5 列）。數值：可昕熟悉 +2；品妤、阿勳 +1（韋綸、唐睿還沒有人物資料——AA_159 建好時補 +1）。
     participants 不放可昕：演完不接她的閒聊階梯（結尾是回宿舍的路上）*/
  { id:'ev_y0_e08', stage:'econ', title:'中秋系烤', participants:['econ_zhengxun','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'星期六傍晚。河濱的草地上，經濟系的人圍成好幾圈。'},
      {speaker:null,text:'烤肉架是系學會借來的。炭還是黑的。'},
      {speaker:null,text:'（韋綸抱著一顆柚子走過來。）'},   /* AA_305 第 4 節：柚子帽（誰生火的三選一、阿勳「熱力學。」、韋綸的報紙、唐睿分肉和盤子拿掉）*/
      {speaker:'韋綸',text:'中秋過了，柚子還沒吃完。我媽塞給我三顆。'},
      {speaker:null,text:'（他把柚子剝開，柚子皮整個拿下來，戴在阿勳頭上。）'},
      {speaker:null,text:'（阿勳沒有拿下來。他擺了三塊炭，劃了一根火柴。火一次就起來了。）'},
      {speaker:'econ_pinyu',text:'（拿起手機）不要動。……好，再一張。'},
      {speaker:null,text:'（唐睿把剩下的柚子皮一個一個修好，幫每個人都做了一頂。）'},
      {speaker:'唐睿',text:'（遞給你）你的。'},
      {choice:[{text:'（戴上）',goto:'y1'},{text:'「我拿著就好。」',goto:'y2'}]},
      {label:'y1'},{speaker:'econ_pinyu',text:'好，拍照。'},{goto:'hat'},
      {label:'y2'},{speaker:'唐睿',text:'拿著也算。'},
      {label:'hat'},{speaker:'唐睿',text:'最後一頂。（遞給品妤）'},{speaker:'econ_pinyu',text:'我不要。頭髮會黏。'},{speaker:null,text:'（唐睿就自己戴上了。他戴了一整晚。）'},   /* 唐睿喜歡品妤，只有品妤不知道（12/31 跨年接）*/
      {speaker:null,text:'肉烤好了，玉米烤焦了一面。'},{speaker:'econ_pinyu',text:'焦的那一面朝下放。拍照不會拍到。'},
      {speaker:null,text:'（天還亮的時候，可昕一直坐在唐睿旁邊。兩個人低著頭，看同一本筆記。）'},{speaker:null,text:'（你把玉米翻了一面。）'},   /* AA_293 第 3 節：E26「我以為妳喜歡唐睿」的伏筆 */
      {speaker:null,text:'八點多，月亮才從對岸的大樓後面出來。比中秋那天瘦一點。'},{speaker:null,text:'可昕拿著一串烤玉米，坐到你旁邊。'},
      {speaker:'kexin',expression:'smile',text:'（把那串玉米遞過來）焦的那一面我吃掉了。剩下的給你。'},   /* AA_302 第 5 列：假設題（月亮收租）拿掉 */
      {choice:[{text:'「這樣算分我嗎？」',goto:'m1'},{text:'「謝謝。」',goto:'m2'},{text:'（接過來，吃了一口）',goto:'m3'}]},
      {label:'m1'},{speaker:'kexin',expression:'embarrassed',text:'算。不要問。'},{goto:'end'},
      {label:'m2'},{speaker:'kexin',expression:'embarrassed',text:'……不客氣。'},{speaker:null,text:'（她轉過去看月亮。）'},{goto:'end'},
      {label:'m3'},{speaker:null,text:'（她看你吃，笑了一下。）'},
      {label:'end'},{speaker:null,text:'九點，大家把烤肉架抬回系學會的車上。'},{speaker:null,text:'（回宿舍的路上，你的衣服都是炭的味道。阿勳的頭髮是柚子的味道。）'},   /* AA_305 第 4 節 */
      {rel:{kexin:{fam:2},econ_pinyu:{fam:1},econ_zhengxun:{fam:1}}} ] },
  /* E07 社團博覽會（BB_104 8b-2；AA_154 第 100 行）：9/18（三）～9/20（五）10:00～17:00，窗口內第一次走到椰林大道的攤位那一排（帳篷照法律系那一次的位置，zones3d.js isFairDay）。
     劇社的即興（三個地點）→ 祐廷選社團（Y0_CLUB：guitar／hiking／badminton／none；BB_110 C2 讀它）→ 可昕的一句。沒去：可昕私訊（story3d.js）*/
  { id:'ev_y0_e07', stage:'econ', title:'社團博覽會', participants:['kexin'], location:'campus', near:{x:-3,z:14,r:20}, trigger:'auto', term:['Y0S1'], weeks:[3], weekday:[3,4,5], time:[10,17], once:true, background:'blur',
    dialogue:[ {speaker:'韋綸',text:'（手上已經有六張傳單）我每一攤都要看。'},
      {speaker:null,text:'（品妤在看每一攤貼的社費。）'},
      {speaker:'kexin',expression:'smile',text:'（從即興劇社的攤位探頭）你們過來，他們要演一段。'},
      {speaker:'劇社社員',text:'請給我們一個地點！'},
      {speaker:'kexin',expression:'neutral',text:'（看你）你說。'},
      {choice:[{text:'「總圖。」',goto:'a1'},{text:'「醉月湖。」',goto:'a2'},{text:'「經濟系的教室。」',goto:'a3'}]},
      {label:'a1'},{speaker:null,text:'兩個社員在總圖「小聲吵架」，演了三分鐘。可昕笑到蹲下。'},{goto:'club'},
      {label:'a2'},{speaker:null,text:'一個社員演一隻鵝，追著另一個人跑。'},{goto:'club'},
      {label:'a3'},{speaker:'劇社社員',text:'好，我們是兩條供給曲線。'},{speaker:null,text:'全場安靜。'},
      {label:'club'},{speaker:'kexin',expression:'smile',text:'我每一攤都看完了。一攤都不加。'},{speaker:'kexin',expression:'neutral',text:'你呢？'},
      {choice:[{text:'吉他社',set:{Y0_CLUB:'guitar'},goto:'c1'},{text:'登山社',set:{Y0_CLUB:'hiking'},goto:'c2'},{text:'羽球社',set:{Y0_CLUB:'badminton'},goto:'c3'},{text:'不參加',set:{Y0_CLUB:'none'},goto:'c4'}]},
      {label:'c1'},{speaker:'kexin',expression:'teasing',text:'好。那你以後彈一首給我聽。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'surprised',text:'你要去爬山？……記得帶伴手禮回來。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'teasing',text:'羽球社好像都早上練。你要早起了。'},{goto:'end'},
      {label:'c4'},{speaker:'kexin',expression:'smile',text:'也好。那我們兩個下課都很閒。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(0.5); } },
  /* ★可昕交往前的六段過場 T1～T6（AA_293 第 2 節，企劃 81d42881／9fecc202（T6 換期中考前）；使用者 10-18「足夠讓我跟可昕在一起嗎？我覺得可能會太跳躍」）：
     只在經濟系事件接事件演（trigger 'econff'，econff3d.js 的 STEPS）；手機那幾段在當時所在的地方用對話框演（D103：不用玩家自己開手機）。演完把閒聊階梯 K0 的同一層記成推進過（STORY.ladMark）*/
  ...(()=>{ const T=(id,title,dialogue,lad,bg)=>({ id, stage:'econ', title, participants:['kexin'], location:'any', trigger:'econff', once:true, background:bg||'blur', dialogue, after:G=>{ const L=typeof lad==='function'?lad(G):lad; if(L&&L.length&&typeof STORY!=='undefined'&&STORY.ladMark) STORY.ladMark(G,L); } });
    return [
    T('ev_y0_kt1','手機・可昕',[ {scene:'手機・可昕',bg:false},{speaker:'kexin',expression:'smile',text:'（照片：昨天那串玉米，焦的那一面朝上）'},{speaker:'kexin',expression:'teasing',text:'品妤說焦的朝下拍。我偏要朝上。'},   /* AA_302 第 6 列（接系烤的玉米）*/
      {choice:[{text:'「拍得很好。」',goto:'a'},{text:'「那串是我翻的。」',goto:'b'}]},{label:'a'},{speaker:'kexin',expression:'smile',text:'謝謝。下次換你烤。'},{goto:'w'},{label:'b'},{speaker:'kexin',expression:'teasing',text:'我知道。所以我拍了。'},
      {label:'w'},{if:{flags:['E02_WORD']},speaker:'kexin',expression:'teasing',text:'迎新那天你挑的那個經濟學名詞，我也查了。'},{if:{flags:['E02_WORD']},speaker:'kexin',expression:'laugh',text:'查完覺得你應該是在開玩笑。'},{if:{flags:['E02_WORD']},set:{KX0_LOOKED_UP:true}},
      {rel:{kexin:{fam:2}}} ],G=>G.flags.E02_WORD?['K0-L1']:[]),
    T('ev_y0_kt2','共同教學館・走廊',[ {scene:'共同教學館・走廊',bg:false},{speaker:null,text:'（微積分下課。可昕抱著小考考卷，在走廊上等你。）'},{speaker:'kexin',expression:'serious',text:'助教說，我的答案方向對了，只是走錯路。'},{speaker:'kexin',expression:'annoyed',text:'……整頁都算了，最後一步寫錯。氣死。'},
      {choice:[{text:'「方向對就好。」',goto:'a'},{text:'「哪一題？我看看。」',goto:'b'}]},{label:'a'},{speaker:'kexin',expression:'annoyed',text:'話是這樣說啦，分數還是被扣了。'},{goto:'e'},{label:'b'},{speaker:'kexin',expression:'laugh',text:'第四題。……你不說話了。你也錯在同一個地方？太好了。'},
      {label:'e'},{mem:[{npc:'kexin',tag:'KX0_WRONG_ROAD'}]},{rel:{kexin:{fam:2,trust:1}}} ],['K0-L5']),
    T('ev_y0_kt3','手機・可昕',[ {scene:'手機・可昕',bg:false},{speaker:'kexin',expression:'smile',text:'（照片：一隻耳環，是一片吐司。）'},{speaker:'kexin',expression:'teasing',text:'今天是吐司。昨天是骰子。'},{speaker:'kexin',expression:'laugh',text:'品妤說我的耳環是隨機變數。……我竟然沒辦法反駁。'},
      {choice:[{text:'「明天是什麼？」',goto:'a'},{text:'「吐司比較好看。」',goto:'b'}]},{label:'a'},{speaker:'kexin',expression:'smile',text:'不知道耶，看明天早上的心情。'},{goto:'e'},{label:'b'},{speaker:'kexin',expression:'smile',text:'真的假的？那我明天再戴吐司。'},
      {label:'e'},{mem:[{npc:'kexin',tag:'KX0_EARRINGS'}]},{rel:{kexin:{fam:2}}} ],['K0-L2']),
    T('ev_y0_kt4','共同教學館・走廊',[ {scene:'共同教學館・走廊',bg:false},{speaker:'kexin',expression:'teasing',text:'我發現你經原每次都坐同一個位子。'},{speaker:'kexin',expression:'laugh',text:'這叫路徑依賴。……我今天剛學的，先拿你來用。'},
      {choice:[{text:'「妳也每次坐同一個位子。」',goto:'a'},{text:'「那我明天換位子。」',goto:'b'}]},{label:'a'},{speaker:'kexin',expression:'teasing',text:'對啊。所以才會注意到你坐哪。'},{goto:'e'},{label:'b'},{speaker:'kexin',expression:'embarrassed',text:'不要啦，你換了我會很不習慣。'},
      {label:'e'},{speaker:null,text:'（走廊另一頭，唐睿舉著一本會計習題喊：「可昕！第三題！」）'},{speaker:null,text:'（她跑過去。兩個人頭靠著頭，看同一頁，笑得很大聲。）'},
      {mem:[{npc:'kexin',tag:'KX0_SAME_SEAT'}]},{set:{KX_TANG_SEEN:true}} ],['K0-L3']),
    Object.assign(T('ev_y0_kt5','宿舍 412',[ {scene:'宿舍 412',bg:false},{speaker:null,text:'（你回到宿舍。阿勳還在書桌前，沒有回頭。）'},{speaker:'econ_zhengxun',text:'可昕今天在社科院門口問我，你在哪。'},
      {choice:[{text:'「她是要找唐睿吧。」',goto:'a'},{text:'「然後呢？」',goto:'b'}]},{label:'a'},{speaker:'econ_zhengxun',text:'……她問的是你。'},{speaker:null,text:'（他把耳機戴回去。）'},{goto:'e'},{label:'b'},{speaker:'econ_zhengxun',text:'我說你在宿舍。她說喔。'},{speaker:'econ_zhengxun',text:'……她『喔』了很久。'},
      {label:'e'},{rel:{econ_zhengxun:{comf:1}}} ],[]),{participants:['econ_zhengxun']}),
    T('ev_y0_kt6','手機・可昕',[ {scene:'手機・可昕',bg:false},{speaker:'kexin',expression:'serious',text:'下下禮拜就期中考了。你經原讀到哪了？'},{speaker:'kexin',expression:'teasing',text:'……你不用回答。我猜還沒開始。'},
      {choice:[{text:'「我還沒開始。」',goto:'a'},{text:'「晚上傳訊息問妳。」',goto:'b'}]},{label:'a'},{speaker:'kexin',expression:'laugh',text:'我也還沒。好，那我們都先不要講。'},{goto:'e'},{label:'b'},{speaker:'kexin',expression:'smile',text:'現在就是晚上啊。……好啦，明天問。'},
      {label:'e'},{mem:[{npc:'kexin',tag:'KX0_CLASSROOM'}]},{rel:{kexin:{fam:2,comf:1}}} ],['K0-L8']) ]; })(),
  /* E09 小福的午餐：品妤的經濟效益（BB_104 8b-3；AA_154 第 102 行）：Y0S1 第 4 週平日中午（9/23～9/26；9/27 教師節連假），在校園裡就切到小福。可以錯過（沒去就沒有）；記憶：無 */
  { id:'ev_y0_e09', stage:'econ', title:'小福的午餐', participants:['econ_pinyu','kexin','econ_zhengxun'], location:'campus', trigger:'auto', term:['Y0S1'], weeks:[4], weekday:[1,2,3,4], time:[12.1,13.25], once:true, background:'blur',
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:'econ_pinyu',text:'（看你的餐盤）雞腿便當加紅茶，九十五喔。隔壁的滷肉飯才五十五。'},   /* BB_179 段A #58～#60：只留一句算錢 */
      {choice:[{text:'「雞腿的效用比較高。」',goto:'b1'},{text:'「下次換滷肉飯。」',goto:'b2'},{text:'「妳吃什麼？」',goto:'b3'}]},
      {label:'b1'},{speaker:'econ_pinyu',text:'好啦，你吃得開心就好。'},{goto:'end'},
      {label:'b2'},{speaker:'econ_pinyu',text:'不用為了我改。我只是說說。'},{speaker:'kexin',expression:'neutral',text:'她會一直說。'},{goto:'end'},
      {label:'b3'},{speaker:'econ_pinyu',text:'我自己帶便當。'},{speaker:null,text:'（她打開便當盒。可昕伸筷子夾走一塊蛋，品妤沒說話，把便當往自己那邊移了一點。）'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(0.75); GM.money&&GM.money(-95); } },
  /* T0a 泡麵之夜（BB_110 第 2 節；AA_154 第 93 行、A2）：經濟系大一上第 5 週颱風假（2024-09-30 週一，calendar.js 的 TYPHOON），白天到晚上在宿舍房間、阿勳在。
     韋綸全身濕推門進來；三個選項，肉燥那個記 Y0_SAUCE（第 8 週 XL-1 阿勳問「那罐肉燥還有嗎？」）。跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_y0_t0a', stage:'econ', title:'泡麵之夜', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[5], weekday:[1], time:[10,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'econ_zhengxun',text:'泡麵六包，我們三個。一人兩包，撐到明天應該夠。'},
      {speaker:'韋綸',text:'（推門進來，全身濕）外面風超大！要不要去看？'},
      {speaker:null,text:'你和阿勳同時說：「不要。」唐睿已經從上舖爬下來在找外套了。'},
      {speaker:'econ_zhengxun',text:'唐睿，坐下。'},
      {speaker:'韋綸',text:'好啦。那有泡麵嗎？'},
      {speaker:'econ_zhengxun',text:'（看了一下桌上）六包，四個人。……一人一包半。'},
      {choice:[{text:'把自己那包給韋綸',goto:'give'},{text:'提議猜拳',goto:'rps'},{text:'拿出週末從家裡帶來的一罐肉燥',set:{Y0_SAUCE:true},goto:'sauce'}]},
      {label:'give'},{speaker:'econ_zhengxun',text:'你自己不吃喔？'},{speaker:'韋綸',text:'（已經在拆包裝）他說不吃！'},{goto:'end'},
      {label:'rps'},{speaker:null,text:'阿勳連輸三把，說要改成五戰三勝。'},{goto:'end'},
      {label:'sauce'},{speaker:'econ_zhengxun',text:'肉燥？你怎麼不早講。'},
      {label:'end'} ],
    consequences:{memo:'颱風假：宿舍的泡麵之夜（經濟系那一年）'} },
  /* XL-1 阿勳一句（AA_154 第 107 行、A28；BB_110 T0a 的記憶）：泡麵之夜拿出肉燥的玩家（Y0_SAUCE），第 8 週第一次在宿舍遇到阿勳（他晚上在房間）*/
  { id:'ev_y0_xl1', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'那罐肉燥', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[8], time:[18,24], once:true, background:'blur',
    prereq:{custom:G=>!!(G.flags&&G.flags.Y0_SAUCE)},
    dialogue:[ {speaker:'econ_zhengxun',text:'那罐肉燥還有嗎？我期中需要它。'} ] },
  /* LIFE-LINE 第 4 組（AA_224 4-1、4-2 @31708531；機制 BB_188 A9-1）。兩件都是一定會發生的主線（新開局 CRAM_FREE_KNOWN 一定是 true）。
     在家＝home3d 的選單那一輪演（trigger:'home'）；不在家＝在外面自動演（auto）；同一段台詞兩個事件（同 E35 的做法）。睡著＝coreCallAt 叫醒（story3d.js）。
     4-1 小吵架：2024-12-12（四）22:00 電話，沒有選項；不另寫和好（隔天晚上補習班的私訊就過去了）。
     4-2 以前的補習班：2024-12-13（五）14:00 以後第一次（2D）；主任不出場對話。當晚 21:00 祐廷傳給可昕（story3d.js）。記 CRAM_FREE_KNOWN */
  ...(()=>{ const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null, atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const fight=[ {scene:'電話'},
      {speaker:'kexin',expression:'neutral',text:'我明天早上九點有小考。你剛剛傳了三則貓的影片。'},{speaker:'player',text:'好看嗎。'},
      {speaker:'kexin',expression:'annoyed',text:'……你休學在家，每天到底在幹嘛？'},{speaker:null,text:'（你沒有馬上回。）'},
      {speaker:'player',text:'睡覺。看影片。等妳下課。'},{speaker:'kexin',expression:'neutral',text:'我不是那個意思。'},{speaker:'player',text:'我知道。……妳去讀書。'},
      {set:{KX_FIGHT_1212:true}} ];
    const cram=[ {scene:'以前的補習班',bg:'cram_street'},
      {speaker:null,text:'十二月十三日下午，你在外面晃，晃到以前的補習班那條街。'},   /* AA_308 第 1 節：30 分鐘版也演（前一天的電話小吵架不演，所以不說「隔天」）*/
      {speaker:null,text:'高三那年，分科測驗前兩天的晚上，你在這裡傳紙條、鬧了一整節，被主任請出去。隔天去看考場，再隔天考試。'},   /* AA_368 L4（企劃線 e55fda50）：遊戲裡是 2024 年，已經沒有指考，別處都叫分科測驗 */
      {speaker:null,text:'你本來就有想過，要不要再考一次。……問問看而已。'},
      {speaker:null,text:'（騎樓下。玻璃門裡，主任站在櫃台旁邊講電話。）'},
      {speaker:null,text:'你走到對面的飲料店，點了一杯最便宜的，站在門口等。'},
      {speaker:null,text:'二十分鐘後，主任拿著外套出來，往捷運站的方向走，轉過街角。'},
      {speaker:null,text:'你又等了五分鐘。'},
      {speaker:null,text:'（你推門進去。櫃台的工作人員抬頭看你。）'},
      {speaker:'工作人員',text:'……你是{name}嗎？'},{speaker:'player',text:'……對。'},   /* AA_368 L5：玩家可以自己取名（原本寫死「祐廷」）*/
      {speaker:'工作人員',text:'主任走之前交代過，說你會來。'},{speaker:'player',text:'……'},
      {speaker:'工作人員',text:'你要問重考班對吧。我看一下你上次的成績。……你這樣可以免費。'},
      {choice:[{text:'「……他怎麼知道我會來？」',goto:'a'},{text:'「我只是來問問。」',goto:'b'},{text:'「主任還有說什麼嗎？」',goto:'c'}]},
      {label:'a'},{speaker:'工作人員',text:'他沒說。他只說你會來。'},{goto:'end'},
      {label:'b'},{speaker:'工作人員',text:'好。這是簡章。'},{goto:'end'},
      {label:'c'},{speaker:'工作人員',text:'沒有。就這一句。'},
      {label:'end'},{speaker:null,text:'（回去的捷運上，你把簡章翻了兩遍。）'},{speaker:null,text:'（然後你查了今年台大法律的錄取分數，看了很久。）'},
      {set:{CRAM_FREE_KNOWN:true}} ];
    const fightDue=G=>{ const d=D('2024-12-12'); return d!=null&&G.day===d&&G.hour>=22&&!G.flags.KX_FIGHT_1212&&!!G.flags.dating_kexin; };
    const cramDue=G=>{ const d=D('2024-12-13'); return d!=null&&G.day>=d&&G.day<=d+1&&(G.day>d||G.hour>=14)&&!G.flags.CRAM_FREE_KNOWN; };
    return [
      { id:'ev_y0_fight', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>fightDue(G)&&!atHome(G)}, dialogue:fight },
      { id:'ev_y0_fight_h', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:G=>fightDue(G)}, dialogue:fight },
      { id:'ev_y0_cram', stage:'econ', title:'以前的補習班', participants:[], location:'any', trigger:'auto', once:true, background:'dark', hours:2, prereq:{custom:G=>cramDue(G)&&!atHome(G)}, dialogue:cram, after:(G,GM)=>{ if(GM&&GM.advance) GM.advance(2); } },
      { id:'ev_y0_cram_h', stage:'econ', title:'以前的補習班', participants:[], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:G=>cramDue(G)}, dialogue:cram, after:(G,GM)=>{ if(GM&&GM.advance) GM.advance(2); } } ]; })(),
  /* AA_308 第 2 節 KH-RETAKE-PACING-1018（X54；使用者 10-20 選「12 月演出來＋1 月先透露」）：2025-01-08（三）18:30 公館吃麵，她先說國文報告（2D，麵店 noodle_table）。
     停點、不能快轉：在家的快轉（home3d.js y0Stop）每 15 分鐘看一次在家的事件，到 18:30 就停。在外面（3D）＝ev_y0_jan8，在家＝ev_y0_jan8_h；Y0_JAN8 記演過（兩個版本只演一次）。
     她 1/3、1/6 國文作業的兩則訊息照留（在這場之前）。表情照 AA_308 第 9 節 */
  ...(()=>{ const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null, atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const due=G=>{ const d=D('2025-01-08'); return d!=null&&G.day===d&&G.hour>=18.5&&!G.flags.Y0_JAN8; };
    const jan8=[ {scene:'公館・麵店',bg:'noodle_table'},
      {speaker:null,text:'（一月八日。期末考考完快三個禮拜了。她還沒回高雄，約你在公館吃麵。）'},   /* AA_368 M4（企劃線 e55fda50）：1/3、1/6 的私訊（一定收到）已經講過「整科就這一份」「不能補交」；12/20 到 1/8 是 19 天——不重講國文的事 */
      {speaker:'kexin',expression:'sad',text:'……葉老師那封信，我又看了一次。'},
      {speaker:'kexin',expression:'sad',text:'還是不能補交。'},
      {speaker:null,text:'（她用筷子把麵捲起來，又放下。）'},
      {choice:[{text:'「妳打算怎麼辦？」',goto:'j8a'},{text:'（等她說下去）',goto:'j8b'}]},
      {label:'j8a'},{speaker:'kexin',expression:'sad',text:'……還不知道。'},{goto:'j8c'},
      {label:'j8b'},{speaker:'kexin',expression:'sad',text:'整科就那一份。……我一直在想這件事。'},
      {label:'j8c'},{speaker:'player',text:'我十二月去問的那個重考班，簡章還在我桌上。'},
      {speaker:'kexin',expression:'surprised',text:'……你那天傳訊息，我以為你在開玩笑。'},
      {speaker:'player',text:'我也不知道是不是。'},
      {speaker:'kexin',expression:'smile',text:'先吃麵。麵要糊了。'},
      {speaker:null,text:'（那天晚上，誰都沒有說要怎樣。）'},
      {set:{Y0_JAN8:true}} ];
    return [
      { id:'ev_y0_jan8', stage:'econ', title:'公館吃麵', participants:[], location:'any', trigger:'auto', once:true, background:'dark', hours:1.5, prereq:{custom:G=>due(G)&&!atHome(G)}, dialogue:jan8, after:(G,GM)=>{ if(GM&&GM.advance) GM.advance(1.5); } },
      { id:'ev_y0_jan8_h', stage:'econ', title:'公館吃麵', participants:[], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:G=>due(G)}, dialogue:jan8, after:(G,GM)=>{ if(GM&&GM.advance) GM.advance(1.5); } } ]; })(),
  /* ★E21 除夕的電話（AA_224 3-10 @31708531＝BB_188 A2-1e，最後一句改；交往中的版本）：1/28（二）22:00 在臺北的家（寒假／在家模式的選單到這個時間就演，home3d.js；trigger:'home'）。
     她在外婆家、他在臺北的家（不在家＝在外面接，ev_y0_e21o）。記 E21_CALLED（兩個只演一個）。原本的 E21_ANSWER 不再寫。
     AA_303 第 2 節 14 整段換：她約你大年初三開車去高雄（兩個選項都記 KH_TRIP，高雄三天兩夜讀它）；阿嬤那段和 KX_THINK_LEAVE 的第三個選項拿掉 */
  ...(()=>{ const due=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-01-28'):null; return d!=null&&G.day===d&&G.hour>=22&&!G.flags.E21_CALLED; }, atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
  const lines=[ {scene:'臺北的家',bg:'home_living_cny'},   /* BG-DARK-70-1021（BB_220★）：除夕＝年夜飯的客廳（home_living_cny 只用在除夕）*/
      {speaker:null,text:'（電話。很吵。）'},
      {speaker:'kexin',expression:'neutral',text:'你等一下，我走到陽台。'},
      {speaker:'kexin',expression:'smile',text:'好了。……新年快樂。'},
      {speaker:'kexin',expression:'smile',text:'初三你要不要來高雄？開車來。我帶你去玩。'},
      {choice:[{text:'「好。」',set:{KH_TRIP:true},goto:'a'},{text:'「我媽會問我去哪。」',set:{KH_TRIP:true},goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那初三早上出發。到了打給我。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'說去找女朋友。……初三，不准遲到。'},
      {label:'end'},{set:{E21_CALLED:true}} ];
  return [ { id:'ev_y0_e21', stage:'econ', title:'除夕的電話', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:G=>due(G)}, dialogue:lines },
    { id:'ev_y0_e21o', stage:'econ', title:'除夕的電話', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>due(G)&&!atHome(G)}, dialogue:[{scene:'電話'}].concat(lines.slice(1)) } ]; })(),   /* AA_307 第 12 列：人在外面接，不出「臺北的家」字幕 */   /* 不在家（休學後可以出門）也會接到：在外面自動演 */
  /* ★E23 家裡的房間：看不懂的民法（BB_104 8b-15；AA_154 A15；AA_224 5-1 @31708531）：2/12（三）20:00，臺北的家，沒有選項（隔天 2/13 18:00 以前回到家也會演）；他住家裡了，沒有行李箱、不回宿舍。
     記 Y0_WINTER_DONE（舊流程的寒假模式用）。
     那本《民法》之後跟著搬到法律系的房間（房間物件「書架上的舊《民法》」已經有）*/
  { id:'ev_y0_e23', stage:'econ', title:'看不懂的民法', participants:[], location:'any', trigger:'home', once:true, background:'dark',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-02-12'):null; return d!=null&&((G.day===d&&G.hour>=20)||(G.day===d+1&&G.hour<18)); }},
    dialogue:[ {scene:'臺北的家',bg:'home_living'},{speaker:null,text:'（臺北的家，你的房間。書架最上面有一本舊《民法》。）'},
      {speaker:null,text:'小時候遇到事情，你就去翻這本書。'},{speaker:null,text:'你翻到中間。還是看不懂。'},
      {speaker:null,text:'（房門外，媽媽叫你吃飯。）'}   /* 原本「樓下」：臺北的家是一層樓的公寓（使用者 10-18 15:2x），LAWWW-C 暫改、AA 確認（HOME-ONEFLOOR-1018）*/,{speaker:null,text:'（你把書拿下來，放在書桌上。這次沒有放回去。）'},{set:{Y0_WINTER_DONE:true}} ] },
  /* T3 情人節的計算機（BB_112 T3；AA_154 第 224 行）：Y0S2 第 1 週平日中午的小福（照 T1 的掛法），唐睿、品妤都在。沒去＝2/21（五）21:00 群組品妤、韋綸（時間暫定，story3d.js）*/
  { id:'ev_y0_t3', retired:'AA_224 5-4（LIFE-LINE，2026-10-17）：他不在小福了，只有群組版（2/21 21:00）＋唐睿私訊。定義留給已經演過的舊存檔', stage:'econ', title:'情人節的計算機', participants:['econ_pinyu'], location:'campus', trigger:'auto', term:['Y0S2'], weeks:[1], weekday:[1,2,3,4,5], time:[12.1,13.25], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR==='undefined'||!CALENDAR.holiday(G.day)},
    dialogue:[ {scene:'小福',bg:'xiaofu'},{speaker:null,text:'（開學第一週。情人節是上週五，那時候還在放寒假。）'},
      {speaker:'唐睿',text:'（遞給品妤一個盒子）……情人節。這個給妳。'},{speaker:'econ_pinyu',text:'（打開）工程計算機。'},{speaker:'econ_pinyu',text:'謝謝。精算考試剛好用得到。這台很好。'},
      {speaker:'唐睿',text:'……對。考試。用得到。'},{leave:'econ_pinyu'},{speaker:null,text:'（品妤走了。）'},{speaker:'唐睿',text:'她以為是文具。'},{speaker:'player',text:'……那是文具。'},
      {choice:[{text:'「下次送花。」',goto:'a'},{text:'「她會用很久。」',goto:'b'},{text:'（拍拍他的肩）',goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'花不能按。'},{goto:'end'},
      {label:'b'},{speaker:'唐睿',text:'……那也算。'},{goto:'end'},
      {label:'c'},{speaker:'唐睿',text:'你不要同情我。……好啦，可以同情一點。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(0.5); } },
  /* ★E24b 法學緒論的第一堂（BB_104 8b-17；AA_154 第 225 行）：Y0S2 第 1 週週二 13:20 法學緒論（共同；選課結果一定有這門，courses.js law_intro）下課，黃教授在門口叫住你。記 E24B_HUANG（法律系黃教授「又是你」讀它）*/
  { id:'ev_y0_e24b', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'法學緒論的第一堂', participants:['prof_huang'], location:'any', trigger:'class', afterClass:'law_intro', term:['Y0S2'], weeks:[1], once:true, background:'blur',
    dialogue:[ {speaker:'prof_huang',text:'（在黑板寫「法律在哪裡？」）你們不用背法條。只要知道，法律在哪裡。'},{speaker:null,text:'（下課，她在門口叫住你。）'},
      {speaker:'prof_huang',text:'你是經濟系的？經濟系的人修這門課，通常想知道一件事。'},{speaker:'prof_huang',text:'你想知道什麼？'},
      {choice:[{text:'「規則是誰定的。」',goto:'a'},{text:'「我也不知道。」',goto:'b'},{text:'「我家有一本民法。」',goto:'c'}]},
      {label:'a'},{speaker:'prof_huang',text:'好問題。這學期你會一直問。'},{goto:'end'},
      {label:'b'},{speaker:'prof_huang',text:'那就先上課。知道了再告訴我。'},{goto:'end'},
      {label:'c'},{speaker:'prof_huang',text:'看得懂嗎？'},{speaker:'player',text:'看不懂。'},{speaker:'prof_huang',text:'那你來對地方了。'},
      {label:'end'},{set:{E24B_HUANG:true}} ] },
  /* ★E24b 偷偷旁聽法律系（BB_104 8b-17；AA_154 第 226 行）：2/26（三）上午（翹了微積分），固定的經過、沒有選項。這一版是當天早上自動的 2D 旁白（3D 走進霖澤館之後做），
     演完時間到 12:10、人在霖澤館的穿堂（走出穿堂時回頭看）。低馬尾的女生是背景（法律系的人這一年不對話）*/
  { id:'ev_y0_e24b2', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'偷偷旁聽', participants:[], location:'any', trigger:'auto', term:['Y0S2'], once:true, background:'dark',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-02-26'):null; return d!=null&&G.day===d&&G.hour>=7&&G.hour<10.5&&!!G.flags.E24B_HUANG; }},
    dialogue:[ {scene:'霖澤館'},{speaker:null,text:'（你翹了微積分，走進霖澤館。一間大教室，你坐最後一排。）'},
      {speaker:null,text:'（台上在講一個案子。前排一個綁低馬尾的女生舉手，說了一段話，大家都在抄。）'},
      {speaker:null,text:'（下課鐘響。你是第一個走的。沒有人認識你。）'},{speaker:null,text:'（走出穿堂時，你回頭看了一眼。）'} ],
    after:async(G,GM)=>{ if(G.hour<12+10/60) GM.advance(12+10/60-G.hour); if(GM.enter) await GM.enter('campus',{x:30.0,z:-107.4,yaw:Math.PI/2}); } },
  /* ★E24c 決定（AA_169 完整稿；AA_154 第 227 行）：3/13（四）22:00 宿舍頂樓（3D 頂樓還沒有：先用 dorm_roof 背景），祐廷一個人做的決定、整段不提可昕。
     邊界情況（AA_169）：22:00 不在男宿＝那天晚上第一次走進男宿時開始；22:00 以前先睡＝按下睡覺時先演（story3d.js 的 sleepNow 前面）。
     寫 E24C_REASON（understand／ought／unsaid；AA_12 0-2 讀它）；讀 XUN_KNEW（阿勳那句的原文兩個版本）；阿勳信任 +2 */
  { id:'ev_y0_e24c', retired:'AA_224 5-2（LIFE-LINE，2026-10-17）：3/13 頂樓一個人決定作廢；改成 2/13 23:00 阿勳的私訊（story3d.js）。定義留給已經演過的舊存檔', stage:'econ', title:'決定', participants:['econ_zhengxun'], location:'any', trigger:'auto', term:['Y0S2'], once:true, background:'dark',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-03-13'):null; if(d==null) return false; const h=G.hour; return (G.zone==='dorm'||G.zone==='dorm_hall')&&((G.day===d&&h>=22)||(G.day===d+1&&h<6)); }},
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {speaker:null,text:'星期四晚上十點，你睡不著，走上宿舍頂樓。'},{speaker:null,text:'風很大。對面那棟樓，還有幾扇窗是亮的。'},
      {speaker:null,text:'口袋裡是法學緒論的講義。黃教授上週那一段，你聽了兩遍。'},{speaker:null,text:'你想起寒假最後一天，在家裡翻開的那本民法。'},
      {speaker:null,text:'小時候看不懂。現在還是看不太懂。'},{speaker:null,text:'可是你想看懂。'},{speaker:null,text:'如果有人問你為什麼，你會怎麼說？'},
      {choice:[{text:'「我一直想回來，弄懂小時候看不懂的東西。」',set:{E24C_REASON:'understand'}},{text:'「經濟在問『會怎麼樣』，我比較想知道『應該怎麼樣』。」',set:{E24C_REASON:'ought'}},{text:'「說不清楚。……可是我知道。」',set:{E24C_REASON:'unsaid'}}]},
      {speaker:null,text:'你說出口，才發現自己已經決定了。'},{speaker:null,text:'鐵門被推開。阿勳拿著兩罐麥茶走上來。'},
      {speaker:'econ_zhengxun',text:'你不在床上。我以為你被風吹走了。'},{speaker:null,text:'他把一罐麥茶遞給你。'},{speaker:'player',text:'我要重考。法律。'},
      {unless:{flags:['XUN_KNEW']},speaker:'econ_zhengxun',text:'你確定？……好。你確定的樣子比較好看。'},
      {if:{flags:['XUN_KNEW']},speaker:'econ_zhengxun',text:'你確定了？……我早就看到那本書了。好。你確定的樣子比較好看。'},
      {speaker:'player',text:'你不問為什麼？'},{speaker:'econ_zhengxun',text:'你在這裡站了二十分鐘。答案應該已經很完整了。'},
      {speaker:null,text:'你們喝完那罐麥茶，才下樓。'},{speaker:null,text:'這件事，你還沒有告訴任何人。除了他。'},
      {rel:{econ_zhengxun:{trust:2}}} ] },
  /* ★E25「我想重考法律。」（BB_104 8-8、第 4 節「痕跡」；AA_154 A35）：3/19（三）19:45～20:15（晚到＝延到 21:30）醉月湖南岸步道走到她旁邊就演；21:30 還沒到＝帶到場（E25_FORCE，story3d.js）。
     「不是唐睿」只給 E19 直接問或開玩笑問的玩家。三個回答都是接受，記 E25_ANSWER（first_day／only_me／new_year）。回答之後她說一句「痕跡」（只說一句，順序：E19 直接問 ＞ E21 認真回答「好」 ＞
     常常主動約她（invite:kexin 5 次以上）＞ 都用玩笑帶過（E19、E21 都是玩笑）＞ E19 不問 ＞ 預設）。之後接 E26 摩天輪 */
  { id:'ev_y0_e25', retired:'AA_224 1-3（LIFE-LINE，2026-10-17）：告白併進 10/17 車上（ev_y0_e26），3/19 醉月湖這一場不再演。定義留給已經演過的舊存檔', stage:'econ', title:'我想重考法律', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S2'], once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; if(!F.E25_ASKED) return false; if(F.E25_FORCE) return true; const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-03-19'):null; if(G.day!==d||G.zone!=='campus'||G.hour<19.75||G.hour>=(F.E25_LATE?21.5:20.25)) return false;
      const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj; if(!P) return true; const dx=P.position.x+36, dz=P.position.z+98.5; return dx*dx+dz*dz<=25; }},
    dialogue:[ {if:{flags:['E25_FORCE']},speaker:null,text:'（你跑到醉月湖的時候，她還坐在那裡。）'},
      {speaker:'player',text:'我想重考。法律系。'},{speaker:'kexin',expression:'surprised',text:'……'},{speaker:'kexin',expression:'neutral',text:'你要離開經濟系。'},
      {speaker:'kexin',expression:'serious',text:'那我有一件事，現在不說，好像就沒機會了。'},
      {if:{flagIs:{E19_ASK:['direct','joke']}},speaker:'kexin',expression:'embarrassed',text:'我一直喜歡的是你。不是唐睿。從來都不是。'},
      {unless:{flagIs:{E19_ASK:['direct','joke']}},speaker:'kexin',expression:'embarrassed',text:'我一直喜歡的是你。從來都是。'},
      {speaker:'kexin',expression:'neutral',text:'你不用現在回答。可是你要知道。'},
      {choice:[{text:'「我也是。從迎新那天。」',set:{E25_ANSWER:'first_day'},goto:'a'},{text:'「……我以為只有我。」',set:{E25_ANSWER:'only_me'},goto:'b'},{text:'「那除夕那天，妳不是開玩笑。」',set:{E25_ANSWER:'new_year'},goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'surprised',text:'迎新那天？我那天說我是『邊際效用遞減』。'},{speaker:'player',text:'妳說妳會越來越好玩。'},{speaker:'kexin',expression:'smile',text:'……結果呢？'},{speaker:'player',text:'沒有遞減。'},{speaker:null,text:'她笑著打你的手臂。'},{goto:'t'},
      {label:'b'},{speaker:'kexin',expression:'neutral',text:'只有你什麼？'},{speaker:'player',text:'只有我在想。'},{speaker:'kexin',expression:'smile',text:'笨蛋。我們兩個一起想了半年，誰都沒說。'},{speaker:null,text:'她拉住你的袖子，沒有放。'},{goto:'t'},
      {label:'c'},{speaker:'kexin',expression:'thinking',text:'我是。也不是。'},{speaker:'kexin',expression:'serious',text:'如果你是因為氣氛才說好，那我寧可是開玩笑。'},{speaker:'player',text:'現在沒有氣氛。'},{speaker:'kexin',expression:'embarrassed',text:'……有。湖邊很有氣氛。'},
      {label:'t'},
      {if:{flagIs:{E19_ASK:'direct'}},speaker:'kexin',expression:'neutral',text:'你那時候問我是不是唐睿。我說不是。……然後你就沒有問下一句了。我等了一整個寒假。'},{if:{flagIs:{E19_ASK:'direct'}},goto:'end'},
      {if:{flagIs:{E21_ANSWER:'yes'}},speaker:'kexin',expression:'thinking',text:'除夕那天你說好。我嚇到了，所以先笑。我後來一直想，如果那時候我沒有笑——'},{if:{flagIs:{E21_ANSWER:'yes'}},goto:'end'},
      {if:{habit:{key:'invite:kexin',min:5}},speaker:'kexin',expression:'smile',text:'你約我的次數，我有在算。我是經濟系的。'},{if:{habit:{key:'invite:kexin',min:5}},goto:'end'},
      {if:{flagIs:{E19_ASK:'joke',E21_ANSWER:'joke'}},speaker:'kexin',expression:'laugh',text:'我們兩個是不是很笨？明明都知道。'},{if:{flagIs:{E19_ASK:'joke',E21_ANSWER:'joke'}},goto:'end'},
      {if:{flagIs:{E19_ASK:'none'}},speaker:'kexin',expression:'neutral',text:'你那陣子什麼都沒問，很有禮貌。我差點以為你不在乎。'},{if:{flagIs:{E19_ASK:'none'}},goto:'end'},
      {speaker:'kexin',expression:'neutral',text:'我想了一整個寒假，要怎麼跟你說。結果你先說了你要走。'},
      {label:'end'} ] },
  /* ★E26＝LIFE-LINE 第 1 組（AA_224 1-3、1-4 @e6c064a3；機制 BB_188 A9）：2024-10-17（休學那天）17:40 社科院門口車上（他開家裡的車來）→ 去吃飯（不演）→ 20:30 摩天輪 → 送她回去，回到宿舍快十一點（接 ev_y0_e30_note 便利貼）。
     取代舊 E19 誤會、E21 除夕「不然要在一起嗎」、E25 醉月湖告白、3/22 的摩天輪。三個回答都是接受，記 KX_CAR（camp／only_me／take_back）。
     這天開始交往：dating_kexin、Y0_DATING、KX_DATING_SINCE、E26_DAY（法律系房間的票根「兩個人開始交往的那一天」）。排程在 story3d.js（15:30 私訊之後的固定出遊 y0_e26）。
     「睡醒的時候。」AA_224 表格寫在她那一欄，照語意是祐廷的回答（她問「你那天一直在睡覺」）*/
  { id:'ev_y0_e26', stage:'econ', title:'車上', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:5.17, kxAway:true,   /* AA_309 第 2 列：17:40 到社科院門口（回家拿車鑰匙、跟媽媽說在那之前：econff3d.js 16:10 出發）→ 回到宿舍「快十一點」（22:50）。原本 17:40 才出發、19:10 才到，她等了兩個多小時。
     kxAway：結尾在 412、她不在（AA_309 第 3 列：可昕不在場的場景後面不接她的閒聊階梯，outings3d.js）*/
    dialogue:[ {speaker:null,text:'（你拿了車鑰匙出門。）'},   /* AA_308 第 4 節：到家、跟媽媽說在 ev_y0_e30 結尾 */
      {scene:'台大・社科院門口',bg:'car_night'},{speaker:null,text:'（社科院門口。她拉開車門坐進來。）'},
      {speaker:'kexin',expression:'smile',text:'所以你現在是自由人了。'},{speaker:'player',text:'……我跟妳說一件事。說完妳可以下車。'},
      {speaker:'kexin',expression:'surprised',text:'好恐怖。說。'},{speaker:'player',text:'我喜歡過妳。'},{speaker:'kexin',expression:'surprised',text:'「過」？'},
      {speaker:'player',text:'九月的時候。後來我以為妳喜歡唐睿，就算了。'},{speaker:'kexin',expression:'thinking',text:'唐睿？'},
      {if:{events:['ev_y0_e08']},speaker:'player',text:'中秋系烤那天，妳一直跟他講話。'},{if:{events:['ev_y0_e08']},speaker:'kexin',expression:'neutral',text:'他在問我會計作業。他問了一個晚上。'},   /* 使用者逐場確認過的原句：有去中秋系烤的玩家 */
      {if:{notEvents:['ev_y0_e08']},speaker:'player',text:'妳那陣子一直跟他講話。'},{if:{notEvents:['ev_y0_e08']},speaker:'kexin',expression:'neutral',text:'他在問我會計作業。他每次都問。'},   /* AA_358 2-3（AA-C 2026-10-21 659d9d81）：沒去中秋系烤的（當晚收過可昕「你沒來」）*/
      {speaker:'kexin',expression:'annoyed',text:'……你是不是很笨。'},{speaker:'player',text:'可能是。'},
      {speaker:'kexin',expression:'embarrassed',text:'我喜歡的是你。'},{if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_e14)},speaker:'kexin',expression:'embarrassed',text:'保齡球那天，我挑你的制服。……你都沒發現。'},   /* AA_303 第 2 節 9（從醉月湖搬來；保齡球演過才說）*/
      {speaker:'kexin',expression:'neutral',text:'你今天說你休學，我第一個想到的是：完了，他要跑了。'},
      {choice:[{text:'「其實從宿營那天就是了。」',set:{KX_CAR:'camp'},goto:'a'},{text:'「……我一直以為只有我。」',set:{KX_CAR:'only_me'},goto:'b'},{text:'「……不是『過』。是現在。」',set:{KX_CAR:'take_back'},goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'surprised',text:'宿營？你那天一直在睡覺。'},{speaker:'player',text:'睡醒的時候。'},{speaker:'kexin',expression:'smile',text:'……好。'},{goto:'t'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'笨。兩個都是。'},{goto:'t'},
      {label:'c'},{speaker:'kexin',expression:'embarrassed',text:'……嗯。'},{speaker:null,text:'（她轉過去看窗外，很久沒說話。）'},
      {label:'t'},{speaker:'kexin',expression:'neutral',text:'你晚上有事嗎？'},{speaker:'player',text:'……沒有。'},{speaker:'kexin',expression:'smile',text:'那去坐摩天輪。'},
      {scene:'摩天輪',bg:'ferris_wheel'},
      {speaker:null,text:'（摩天輪。到最高的時候，台北看起來好小。）'},{cg:'cg_ferris_wheel_kexin'},{speaker:'player',text:'……在一起吧。'},{speaker:'kexin',expression:'smile',text:'好。'},   /* BCG-06（BB 通過；ART-BB-READY-1017）；AA_303 第 2 節 9：最高點你說「在一起吧」（使用者 10-18，取代 AA_295 的不說話）*/
      {set:{Y0_DATING:true,dating_kexin:true,KX_DATING_SINCE:'2024-10-17'}},{stamp:['E26_DAY']},
      {speaker:null,text:'（你送她回女舍。回到 412，已經快十一點了。）'},{speaker:null,text:'（阿勳已經睡了。韋綸在上舖滑手機，唐睿還沒回來。沒有人問你去了哪裡。）'} ],   /* AA_305 第 5 節 */
    afterOuting:async(G,GM)=>{ if(GM.enter&&!G.flags.Y0_MOVED_OUT) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); } },   /* 回到宿舍（412）：接著是檯燈上的便利貼 */
  /* ★E27＝「一起重考吧」（AA_224 5-1 @31708531＝BB_188 A2-5＋A2-6；機制 BB_188 A9-1）：2025-02-13（四）可昕辦完休學，19:00 公館的水餃店（2D；固定出遊、沒有「不去」，story3d.js）。
     祐廷提出（三個說法都是他說的）；舊 E27「我不是因為你」併進來（她自己的理由）。CRAM_FREE_KNOWN 才有「那間補習班說我可以免費」那一段（新開局一定有）。
     記 RETAKE_TOGETHER、E27_DAY。不寫人生演講、哭著感謝、拯救、她為了他重考 */
  { id:'ev_y0_e27', stage:'econ', title:'一起重考吧', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'行政大樓',bg:'admin_office'},   /* AA_303 第 17 場（使用者 10-18：高雄的時候就討論了，我陪她辦完休學，就去吃飯）：休學原因、一起重考搬到 1/31～2/2 高雄（ev_y0_kh3）*/
      {speaker:null,text:'（二月十三日，行政大樓。你陪她來的。）'},{speaker:null,text:'（承辦人蓋了章，把收據推過去。）'},{speaker:'承辦人',text:'好了。'},
      {speaker:'kexin',expression:'tired',text:'……十五分鐘。跟你那時候一樣。'},
      {scene:'公館・水餃店',bg:'y0_dumpling'},{speaker:null,text:'（公館的水餃店。她點了二十顆。）'},
      {speaker:'kexin',expression:'smile',text:'從今天開始，我們兩個都是休學的人了。'},
      {choice:[{text:'「歡迎。」',goto:'a'},{text:'「明天去問補習班。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'laugh',text:'……一點都不想被歡迎。'},{speaker:null,text:'（她笑了。）'},{goto:'e'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'嗯。……先吃。'},
      {label:'e'},{set:{RETAKE_TOGETHER:true,E27B_PLAN:true}},{stamp:['E27_DAY']} ] },   /* 沒去高雄的舊存檔：一起重考、明天去問補習班照記 */
  /* ★高雄三天兩夜（AA_303 第 15 場，使用者 10-18 選擇題：「去高雄 3 天 2 夜……是在高雄才討論重考的」）：1/28 除夕電話約好（KH_TRIP）→ 1/31（初三）早上開車出發，2/2 晚上回臺北的家。
     原本 2/13 水餃店的休學原因和三選一搬來這裡；記 RETAKE_TOGETHER、E27B_PLAN（2/14 一起去問補習班）。背景：前兩天 kh_dome（美麗島站）、蓮池潭 kh_lotus_bench（BB-C b043f9bd；使用者 10-18「不要人物」＝純場景，不等人物 CG）。只在經濟系 30 分鐘版的停點演（econff3d.js STEPS2 h21）*/
  { id:'ev_y0_kh3', stage:'econ', title:'高雄三天兩夜', participants:['kexin'], location:'any', trigger:'econff', once:true, background:'dark',
    /* AA_308 第 3 節 KH-TRIP-MORE（X52；使用者 10-20 選「駁二＋大港橋、西子灣看夕陽、旗津」）：三天分場，每個地點一張場景字卡＋背景（新的五張 kh_xinjuejiang、kh_pier2、kh_ruifeng、kh_cijin、kh_sizihwan
       還沒有圖＝深色底＋地點字幕，BB 寫提示詞跟使用者要）；蓮池潭的國文報告兩句拿掉（1/8 公館說過了），換「國文那科，一定會被當。」；表情照第 9 節 */
    dialogue:[ {scene:'高雄・新崛江',bg:'kh_xinjuejiang'},
      {speaker:null,text:'（大年初三。你開了四個多小時的車到高雄。她在家樓下等你，一上車就說：「先去吃早午餐。」）'},
      {speaker:null,text:'（下午，新崛江的巷子裡全是人。她拉著你的袖子往前擠，手上已經拿著一杯。）'},
      {speaker:'kexin',expression:'smile',text:'這家一定要喝。我高中每天下課都來。'},
      {scene:'高雄・駁二、大港橋',bg:'kh_pier2'},{speaker:null,text:'（駁二。舊倉庫改的展場，一間一間逛過去。）'},{speaker:null,text:'（三點，大港橋開始轉。白色的橋慢慢轉開，讓船過去。）'},
      {speaker:'kexin',expression:'smile',text:'它下午會轉。我高一那年，第一次跟同學來看。'},   /* AA_368 L6（企劃線 e55fda50）：她 2021 年上高中，橋已經在了；轉幾次不寫死 */
      {choice:[{text:'「轉得好慢。」',goto:'k1'},{text:'（拍她的照片）',goto:'k2'}]},
      {label:'k1'},{speaker:'kexin',expression:'smile',text:'慢才好看。'},{goto:'k3'},
      {label:'k2'},{speaker:'kexin',expression:'embarrassed',text:'……拍好看一點。'},
      {label:'k3'},{scene:'高雄・瑞豐夜市',bg:'kh_ruifeng'},{speaker:null,text:'（晚上，瑞豐夜市。她每到一攤就停下來。）'},
      {speaker:'kexin',expression:'laugh',text:'這個你一定要吃。……那個也是。'},{speaker:null,text:'（你們吃到走不動。）'},
      {scene:'高雄・旗津',bg:'kh_cijin'},{speaker:null,text:'（第二天早上，搭渡輪去旗津。五分鐘就到了。）'},{speaker:null,text:'（你們租了一台雙人腳踏車。她坐後面，從頭到尾沒有踩。）'},
      {speaker:'kexin',expression:'teasing',text:'我在看風景。'},{speaker:null,text:'（中午吃海產。她把剝好的蝦放到你碗裡。）'},
      {scene:'高雄・西子灣',bg:'kh_sizihwan'},{speaker:null,text:'（傍晚，西子灣。你們坐在堤防上等夕陽。）'},
      {speaker:'kexin',expression:'sad',text:'……以前不開心的時候，我會一個人來這裡。'},{speaker:null,text:'（太陽掉進海裡。她沒有再說話。）'},
      {scene:'高雄・美麗島站',bg:'kh_dome'},{speaker:null,text:'（晚上，美麗島站。彩色的玻璃天花板下面，兩個人仰頭看了很久。）'},
      {scene:'高雄・蓮池潭',bg:'kh_lotus_bench'},{speaker:null,text:'（第三天下午，蓮池潭。風很大。你們坐在湖邊的椅子上。）'},
      {speaker:'kexin',expression:'serious',text:'成績下禮拜出來。'},{speaker:'kexin',expression:'sad',text:'國文那科，一定會被當。'},{speaker:'kexin',expression:'thinking',text:'我在想要不要休學。'},
      {choice:[{text:'「那我們都休學了，就一起重考吧。」',goto:'p1'},{text:'「我要再考一次。法律。……妳要不要一起？」',goto:'p2'},{text:'「一起考吧。兩個人一起讀，比一個人不會偷懶。」',goto:'p3'}]},
      {label:'p1'},{speaker:null,text:'（她停了一下。）'},{speaker:'kexin',expression:'surprised',text:'……你是說真的？'},{speaker:'player',text:'真的。'},{speaker:'kexin',expression:'smile',text:'好。'},{goto:'q'},
      {label:'p2'},{speaker:'kexin',expression:'teasing',text:'你十二月去補習班那天就想考了吧。'},{speaker:'player',text:'……嗯。'},{speaker:'kexin',expression:'smile',text:'好。一起。'},{goto:'q'},
      {label:'p3'},{speaker:'kexin',expression:'teasing',text:'你是說我會盯你。'},{speaker:'player',text:'對。'},{speaker:'kexin',expression:'smile',text:'……好。我盯你。'},
      {label:'q'},{speaker:'kexin',expression:'serious',text:'先說好。我考法律，不是因為你。'},{speaker:'kexin',expression:'teasing',text:'我寒假就在查了。你只是剛好先說。'},
      {speaker:'player',text:'那間補習班說我可以免費。'},{speaker:'kexin',expression:'surprised',text:'我呢？'},{speaker:'player',text:'……不知道。妳是自然組。'},{speaker:'kexin',expression:'smile',text:'那回台北，一起去問。'},
      {set:{RETAKE_TOGETHER:true,E27B_PLAN:true,KX_THINK_LEAVE:true,KH_TRIP_DONE:true}},{rel:{kexin:{trust:2,comf:2}}} ] },
  /* ★E27b 一起去問補習班（AA_272 8-2，52c73c73：櫃台進去幫她問、管理說沒有社會科分數不行、全年二十萬剩下十三萬；使用者 22:0x「2 月決定重考以後，兩個人一起再去問可昕能不能免費……去問重考班也要有劇情」）：2025-02-14（五）15:00 以前的補習班（同 12/13 那一間，主任不出場）；
     固定出遊、不能快轉；15:15 還沒出發＝可昕電話（story3d.js CORE_CALLS）。原本 E27 的三選一和結尾搬來這裡；記 CRAM_ASKED_TOGETHER。R1 照舊 2/15 */
  { id:'ev_y0_e27b', stage:'econ', title:'一起去問補習班', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'以前的補習班',bg:'cram_counter'},
      {speaker:null,text:'（同一個櫃台。上次那個工作人員認得你。）'},{speaker:'工作人員',text:'你決定來了？'},{speaker:'player',text:'我是來問她的。'},
      {speaker:'工作人員',text:'同學之前是哪一組？'},{speaker:'kexin',expression:'neutral',text:'自然組。……現在在臺大經濟。'},
      {speaker:'工作人員',text:'臺大經濟喔。（看了她的成績）國英數都很高耶。你們等一下，我去幫妳問。'},{speaker:null,text:'（工作人員走進後面的辦公室。你們在櫃台前站了快十分鐘。）'},
      {speaker:'工作人員',text:'不好意思。管理那邊說，沒有社會科的分數，就沒辦法。'},{speaker:'工作人員',text:'要上的話，全年班原本是二十萬。現在二月了，前面的課已經上掉一大半，剩下的算妳十三萬。'},   /* AA-C AA_304 第 9 列（使用者 10-18「不是同一間阿」：衝刺班是另一間）：「六月有一個月的衝刺班……到時候可以再來問。」拿掉 */
      
      {speaker:'kexin',expression:'neutral',text:'……好。謝謝。'},{speaker:null,text:'（你們走出來，在樓下的飲料店買了兩杯。）'},
      {speaker:'kexin',expression:'neutral',text:'十三萬。'},{speaker:'kexin',expression:'neutral',text:'你去上啊。你免費耶。'},
      {choice:[{text:'「那我也在家讀。」',goto:'h1'},{text:'「我們都在家讀，比較好約。」',goto:'h2'},{text:'「那我們都在家讀。社會我陪妳從頭讀。」',goto:'h3'}]},
      {label:'h1'},{speaker:'kexin',expression:'surprised',text:'……你確定？'},{speaker:'player',text:'確定。而且我進去，主任一定一直叫我報名。'},{speaker:'kexin',expression:'smile',text:'……好。在家讀。'},{goto:'r_end'},
      {label:'h2'},{speaker:'kexin',expression:'teasing',text:'約讀書。'},{speaker:'player',text:'約讀書。'},{speaker:'kexin',expression:'smile',text:'……好。'},{goto:'r_end'},
      {label:'h3'},{speaker:'kexin',expression:'teasing',text:'你社會考壞過耶。'},{speaker:'player',text:'所以我比較知道哪裡會壞。'},{speaker:'kexin',expression:'smile',text:'……好。'},
      {label:'r_end'},{speaker:'kexin',expression:'smile',text:'所以說好了。每天早上，比誰先坐到桌子前面。'},{speaker:'kexin',expression:'smile',text:'輸的人請早餐。……我不會輸。'},
      {speaker:null,text:'（走回捷運站的路上，每一家花店門口都排著人。今天二月十四日。）'},{speaker:'kexin',expression:'teasing',text:'（看了一眼）……我們情人節來問補習班。'},{speaker:'kexin',expression:'smile',text:'晚餐你請。'},   /* AA_449 1-1：兩個人第一個情人節 */
      {set:{CRAM_ASKED_TOGETHER:true}} ] },
  /* E28 告訴朋友（BB_153 E28 完整稿；AA_154 A20）：3/26（三）21:00 公館的宵夜（2D 出遊，背景 gongguan_luwei），22:00 結束。讀 E19_ASK 三個版本；品妤、阿勳自在 +1（韋綸、唐睿沒有人物資料）*/
  { id:'ev_y0_e28', retired:'AA_224 5-3（LIFE-LINE，2026-10-17）：3/26 宵夜攤作廢；改成 2/13 22:30 經濟系群組（story3d.js）。定義留給已經演過的舊存檔', stage:'econ', title:'告訴朋友', participants:['kexin','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'公館・宵夜攤',bg:'gongguan_luwei'},
      {speaker:null,text:'晚上九點。公館的宵夜攤，六個人擠一張圓桌。'},{speaker:null,text:'可昕在桌子底下踢了你一下。'},
      {speaker:'player',text:'我們有兩件事要說。'},{speaker:'kexin',expression:'embarrassed',text:'……第一件。我們在一起了。'},{speaker:'player',text:'第二件。我們要重考。法律。'},
      {speaker:null,text:'桌上安靜了三秒。'},{speaker:'韋綸',text:'兩個一起？……走啦！我陪你們——'},{speaker:'韋綸',text:'不對，我不考。我陪你們吃宵夜。'},
      {speaker:'econ_pinyu',text:'祐廷要辦休學吧。手續、學費，我幫你查。'},{speaker:'econ_pinyu',text:'可昕不用。她照常上課，晚上再念。'},{speaker:'econ_zhengxun',text:'……那保齡球誰陪我打。'},
      {if:{flagIs:{E19_ASK:'direct'}},speaker:'econ_pinyu',text:'所以寒假那時候你問她是不是唐睿？'},{if:{flagIs:{E19_ASK:'direct'}},speaker:'唐睿',text:'我？？'},
      {if:{flagIs:{E19_ASK:'joke'}},speaker:'kexin',expression:'teasing',text:'他寒假以為我喜歡唐睿。'},{if:{flagIs:{E19_ASK:'joke'}},speaker:'唐睿',text:'等一下，我？？'},
      {unless:{flagIs:{E19_ASK:['direct','joke']}},speaker:'唐睿',text:'你們什麼時候開始的？我怎麼完全不知道？'},{unless:{flagIs:{E19_ASK:['direct','joke']}},speaker:'econ_pinyu',text:'全系只有你不知道。'},{unless:{flagIs:{E19_ASK:['direct','joke']}},speaker:null,text:'全桌笑倒。'},
      {speaker:null,text:'唐睿笑得最大聲。笑完，他偷偷看了品妤一眼。'},{speaker:null,text:'品妤在算宵夜的錢，沒有看到。'},
      {speaker:'econ_pinyu',text:'今天的宵夜，你們兩個請。這是宣布的代價。'},{speaker:'kexin',expression:'laugh',text:'……妳這是命令。'},{speaker:'econ_pinyu',text:'對。'},
      {speaker:null,text:'可昕和你一起走回去，路上只說了一句。'},{speaker:'kexin',expression:'smile',text:'說出來了。'},
      {rel:{econ_pinyu:{comf:1},econ_zhengxun:{comf:1}}} ] },
  /* ★E30 辦休學的那天，朋友還在上課（AA_169 完整稿；AA_154 第 232 行；日期 AA_218 第 11 節：2024-10-17（四）；AA_224 1-1 @e6c064a3 加兩行旁白）：休學≠決定重考（決定在 2025-02，AA_224 第 5 組）。10/17（四）14:40 自動（在別的事件或出遊裡＝結束後馬上；15:10 以後就只剩「先走」）。
     寫 LEAVE_WEEK＝6、E30_WAITED；等他們下課＝阿勳、品妤熟悉 +1（韋綸、唐睿沒有人物資料）。先走的群組訊息在 story3d.js（15:12）*/
  { id:'ev_y0_e30', stage:'econ', title:'辦休學的那天', participants:['econ_zhengxun'], location:'any', trigger:'auto', term:['Y0S1'], once:true, background:'blur',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(STORY.Y0_LEAVE_DAY):null; return d!=null&&G.day===d&&G.hour>=14+40/60; }},
    dialogue:[ {scene:'行政大樓',bg:'admin_office'},{speaker:null,text:'星期四下午，行政大樓。你把申請書交出去。'},{speaker:null,text:'（承辦人蓋了章，把收據推過來。）'},{speaker:'承辦人',text:'好了。'},
      {speaker:null,text:'手續比你想的快。十五分鐘。'},{speaker:null,text:'（你沒有跟任何人說。）'},   /* AA_305 第 5 節（使用者：休學只告訴可昕）：走到普通教學館、窗外、等下課那段整段拿掉（韋綸、唐睿那幾句搬到 10/29 小福、10/31 搬家）；E30_WAITED 不再記 */
      {set:{LEAVE_WEEK:6}},
      /* 15:30 的電話（AA_296，D103：重要的事不能只用手機說——原本 story3d.js 的 y0_kx_leave 十則私訊）*/
      {scene:'電話',bg:'mrt_night'},{speaker:null,text:'（捷運上。你撥給她。響了兩聲。）'},{speaker:'player',text:'我今天去辦休學了。'},{speaker:'kexin',expression:'surprised',text:'……蛤？'},{speaker:'kexin',expression:'surprised',text:'今天？快期中考了耶。'},
      {speaker:'player',text:'就是因為快期中考了。我還是不想念書。'},{speaker:'player',text:'我覺得很完蛋。所以就去辦了。'},{speaker:'kexin',expression:'serious',text:'你現在在哪。'},{speaker:'player',text:'捷運上。要回家跟我媽說。'},
      {speaker:'kexin',expression:'serious',text:'你現在回來學校找我。我還有一堂，五點下課。社科院門口。'},{speaker:'player',text:'……我才剛休學。'},{speaker:'kexin',expression:'annoyed',text:'休學又不是不能進校門。'},{speaker:null,text:'（她掛掉了。）'},
      /* AA_308 第 4 節 E30-MOM（X46；使用者 10-20 選「媽媽不罵」）：電話之後、拿車鑰匙之前，回家跟媽媽說 */
      {scene:'臺北的家',bg:'home_living'},{speaker:null,text:'（臺北的家。媽媽坐在客廳的桌子前記帳。）'},{speaker:'player',text:'媽。我今天去辦休學了。'},{speaker:null,text:'（媽媽把筆放下。）'},
      {speaker:'媽媽',text:'……想好了？'},{speaker:'player',text:'想好了。'},{speaker:'媽媽',text:'（看了你一下）你從小就想念法律。'},{speaker:'player',text:'……嗯。'},
      {speaker:'player',text:'我想借車。'},{speaker:'媽媽',text:'鑰匙在老地方。開慢一點。'},
      {set:{Y0_KX_CALL:true,Y0_MOM_TOLD:true}} ],
    after:(G,GM)=>{ if(G.hour<15.5) GM.advance(15.5-G.hour);
      if(typeof ECONFF!=='undefined'&&ECONFF.on(G)&&!ECONFF.busy&&ECONFF.next(G)&&GM.fade){ ECONFF.busy=true; GM.fade(true); setTimeout(()=>{ ECONFF.advance(GM).catch(e=>console.warn('E30 chain',e)).finally(()=>{ ECONFF.busy=false; }); },520); } } },   /* 電話在 15:30。電話講完（「捷運上。要回家跟我媽說。」）不放回原本站的地方（使用者 10-18 14:3x：打完電話跳回遊戲、人在咖啡店）：黑幕直接接下一步；走 ECONFF 的那條路在 econff3d.js 的 chain。跟媽媽說那段在上面（AA_308 第 4 節 E30-MOM；AA_355 第 3 節）*/
  /* 休學以後第一次在社科院門口遇到經濟系的朋友（AA_224 第 3 組共同前提＝BB_188 A2-1b 阿勳那一句照用）：10 月下旬（10/20～10/31）走到社科院門口就演；之後不再提（大家不必每次驚訝） */
  { id:'ev_y0_soc_door', stage:'econ', title:'休學的來了', participants:['econ_zhengxun'], location:'campus', near:{x:14.1,z:-71.5,r:8}, trigger:'auto', term:['Y0S1'], time:[9,20], once:true, background:'blur',
    spawn:{npc:'econ_zhengxun',dist:1.6,pose:'idle'},
    prereq:{custom:G=>{ if(typeof STORY==='undefined'||!G.flags.LEAVE_WEEK) return false; const a=STORY.dayOfKey('2024-11-01'), b=STORY.dayOfKey('2024-11-15'); return a!=null&&G.day>=a&&G.day<=b; }},   /* AA_305：10/29 以前大家都不知道（10/29 小福唐睿問）、10/31 才搬走 → 11/1～11/15（原本 10/20～10/31）*/
    dialogue:[ {speaker:'econ_zhengxun',text:'休學的來了。'},{speaker:'econ_zhengxun',text:'……然後還交了女朋友。你休學是去修這個學分喔。'} ] },
  /* E30 當晚：檯燈上的便利貼（AA_169；BB_112 A3 原文）：休學那天（10/17）22:00 以後第一次在宿舍房間。E30_WAITED 的玩家多一行小字。記 Y0_STICKY（A3 跟著裝箱、R7 讀它）*/
  { id:'ev_y0_e30_note', stage:'econ', title:'便利貼', participants:[], location:'dorm', trigger:'auto', term:['Y0S1'], once:true, background:'blur',
    prereq:{custom:()=>false},   /* AA_305 第 5 節：拿掉（便利貼搬到 10/31 搬家那天，最後一箱上面，home3d.js moveOut）；id 留給舊存檔 */
    dialogue:[ {speaker:null,text:'檯燈上多了一張便利貼。阿勳的字。'},{speaker:'便利貼',text:'保齡球欠我一場。'},
      {if:{flags:['E30_WAITED']},speaker:null,text:'下面還有一行小字：「今天的下課，算你有來。」'},{set:{Y0_STICKY:true}} ] },
  /* ★10/29（二）12:10 小福：唐睿問「你什麼時候才要跟我們說？」（AA_305 第 6 節，使用者：休學只告訴可昕、照樣陪她上課，直到同學從高中同學那裡知道）。
     只在經濟系事件接事件的停點演（econff3d.js STEPS n:'x29'）；記 Y0_FRIENDS_KNOW、XF_ANSWER（week／nodiff／silent，只是紀錄）*/
  { id:'ev_y0_xiaofu', stage:'econ', title:'你什麼時候才要跟我們說？', participants:['econ_zhengxun','econ_pinyu','kexin'], location:'any', trigger:'econff', once:true, background:'xiaofu',
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:null,text:'（十月二十九日，中午。你又坐在可昕旁邊上完大一國文，六個人一起走到小福。）'},{speaker:null,text:'（品妤排便當，韋綸排麵，阿勳已經占好了位子。）'},
      {speaker:'唐睿',text:'（坐下來，筷子還沒拆）……欸，問你一件事。'},{speaker:'唐睿',text:'我高中參加過聯校的社團。裡面有一個人，跟你同一個高中。'},
      {speaker:'唐睿',text:'昨天他傳訊息問我：「你們系的{name}，是不是休學了？」'},{speaker:null,text:'（韋綸的麵停在半空中。阿勳抬起頭。）'},
      {speaker:'唐睿',text:'……你什麼時候才要跟我們說？'},
      {choice:[{text:'「……這個禮拜。」',set:{XF_ANSWER:'week'},goto:'a'},{text:'「我想說，你們不知道也沒差。」',set:{XF_ANSWER:'nodiff'},goto:'b'},{text:'（沒有說話）',set:{XF_ANSWER:'silent'},goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'今天星期二。……好，算你有要說。'},{goto:'d'},
      {label:'b'},{speaker:'唐睿',text:'有差。'},{goto:'d'},
      {label:'c'},{speaker:null,text:'（唐睿等了一下，才把筷子拆開。）'},
      {label:'d'},{speaker:'econ_pinyu',text:'（轉頭）妳也知道？'},{speaker:'kexin',expression:'embarrassed',text:'……他叫我不要說。'},
      {speaker:'econ_pinyu',text:'……好。那今天的筆記，我不借你了。你用不到。'},{speaker:'韋綸',text:'那你以後還會來社科院嗎？'},
      {speaker:'player',text:'會啊。宿舍住到月底。……之後我也會回來。'},{speaker:'econ_zhengxun',text:'（低頭吃飯）……月底。'},
      {speaker:null,text:'（他沒有再說話。那頓飯，他吃得很慢。）'},
      {set:{Y0_FRIENDS_KNOW:true}} ] },
  /* A3 搬出宿舍那天（BB_112 A3；AA_154 第 234 行、A23；日期 AA_218 第 11 節、AA_154 0b-1：2024-10-19（六））：10/19（六）在宿舍房間（09:00 以後；一整天都沒回宿舍＝20:00 以後在哪裡都演，劇情事實、一定會有）。
     阿勳幫你封箱；選要不要請他吃飯（請了＝小福的雞腿便當；沒請＝他自己去買、傳一張照片）。演完搬回臺北的家（HOME.moveOut：之後每天從家裡出發，AA_154 1-3b）；
     便利貼跟著搬（Y0_STICKY_HOME）。按鈕字是動作（企劃沒寫按鈕字）*/
  { id:'ev_y0_a3', stage:'econ', title:'搬出宿舍那天', participants:['econ_zhengxun'], location:'any', trigger:'auto', term:['Y0S1'], once:true, background:'blur',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(STORY.Y0_MOVE_DAY):null; return d!=null&&G.day>=d&&G.flags.LEAVE_WEEK===6&&!G.flags.Y0_MOVED_OUT&&((G.zone==='dorm'&&G.hour>=9)||G.hour>=20); }},   /* A46 ①：10/19 以後、還沒搬（當天沒演到，之後第一次符合就演；人在家＝home3d 的 S.a3FromHome 先帶回宿舍）*/
    dialogue:[ {speaker:null,text:'（十月三十一日，早上九點。宿舍可以住到今天。）'},   /* AA_305 第 7 節（使用者：宿舍住到月底，室友不知道；取代 10/19）。冷笑話三句拿掉（阿勳不講冷笑話）；便利貼搬到最後一箱（home3d.js moveOut）*/
      {speaker:'econ_zhengxun',text:'箱子我幫你封。你的膠帶貼得很醜。'},{speaker:null,text:'（他封好最後一箱，推給你。）'},{speaker:'econ_zhengxun',text:'保齡球那場，記得。'},
      {speaker:'韋綸',text:'（還在上舖，翻身）……有空回來玩喔。'},{speaker:null,text:'（唐睿幫你把箱子搬到樓下。）'},{speaker:'唐睿',text:'你說你會回來。那就不算走。'},
      {choice:[{text:'（請阿勳吃小福的雞腿便當）',set:{A3_TREAT:true},goto:'t'},{text:'（不請）',set:{A3_TREAT:false},goto:'n'}]},
      {label:'t'},{speaker:'econ_zhengxun',text:'雞腿便當？……那我不客氣了。'},{goto:'end'},
      {label:'n'},{phone:'econ_zhengxun',text:'📷（他自己買的便當）'},
      {label:'end'},{set:{Y0_STICKY:true}} ],
    after:(G,GM)=>{ if(typeof HOME!=='undefined'&&HOME.moveOut) HOME.moveOut(GM).catch(e=>console.warn('HOME.moveOut',e)); } },
  /* E18b 可昕的生日（BB_104 8b-11）：4/24（四）19:00 公館豆花店（2D 出遊），一群人一起。祐廷的禮物記 E18B_GIFT（notebook／douhua／group；沒去＝none，story3d.js）；
     送筆記本的玩家，法律系大一她生日那天多一句（已接，ev_kexin_birthday_y1s2）*/
  { id:'ev_y0_e18b', stage:'econ', title:'可昕的生日', participants:['kexin','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館・豆花店',bg:'gongguan_douhua'},
      {speaker:null,text:'（豆花店最裡面那張桌子。桌上有一個小蛋糕，是品妤帶來的。）'},
      {speaker:'kexin',expression:'smile',text:'（吹完蠟燭）好，許完了。'},{speaker:'韋綸',text:'許什麼？'},{speaker:'kexin',expression:'neutral',text:'講出來就不靈了。'},
      {speaker:'econ_pinyu',text:'那送禮物。一個一個來。'},
      {choice:[{text:'一本空白的筆記本',set:{E18B_GIFT:'notebook'},goto:'a'},{text:'請她吃一碗豆花',set:{E18B_GIFT:'douhua'},goto:'b'},{text:'跟大家合送',set:{E18B_GIFT:'group'},goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'空白的。（翻了幾頁）……好，這本拿來寫我們互考的題目。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'surprised',text:'豆花算禮物嗎？'},{speaker:'player',text:'算。我排了二十分鐘。'},{speaker:'kexin',expression:'laugh',text:'難怪你剛剛一直不見。'},{if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_r2)},speaker:'kexin',expression:'smile',text:'……欠的那一碗。好，扣掉。'},{goto:'end'},   /* AA_525 3-11：演過豆花賭注 ev_y0_r2（「所以你欠我一碗。」）的 */
      {label:'c'},{speaker:'econ_pinyu',text:'我們一起買的，大家都有出。'},{speaker:'kexin',expression:'smile',text:'謝謝大家。我回去再拆。'},
      {label:'end'} ] },
  /* E34＝R8 經濟學原理最後一堂的最後一句（BB_153 E34 完整稿；AA_154 第 244 行；BB_179 段 D、AA_203 #15）：5/26（一，16 週制第 15 週，AA_198 第 3 節；原本 6/2）11:50～12:15 在博雅（3D，101 外面的走廊）就演；12:15 以後＝沒去版（story3d.js）。
     不記旗標；阿勳信任 +1。魏老師只有聲音 */
  { id:'ev_y0_e34', retired:'AA_298 第 3 節（休學的人不會回台大：E34 拿掉），定義留給已經演過的舊存檔', stage:'econ', title:'最後一堂的最後一句', participants:['econ_zhengxun'], location:'boya', trigger:'auto', term:['Y0S2'], once:true, background:'blur',
    prereq:{custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(STORY.Y0_E34_DAY||'2025-05-26'):null; return d!=null&&G.day===d&&G.hour>=11+50/60&&G.hour<12.25; }},
    dialogue:[ {speaker:null,text:'星期一中午，你站在博雅一〇一的後門外。門沒有關緊。'},{speaker:null,text:'這是你沒修完的那門課。最後一堂。'},
      {speaker:'魏老師（聲音）',text:'……好，最後一句。'},{speaker:'魏老師（聲音）',text:'經濟學不會告訴你該選什麼。它告訴你，選了要付什麼。'},
      {speaker:null,text:'教室裡響起掌聲。你在門外，也拍了兩下。'},{speaker:null,text:'門開了。阿勳第一個走出來。'},
      {speaker:'econ_zhengxun',text:'你聽到了？……那你這學期也算上了一堂。'},
      {choice:[{text:'「我付得起嗎？」',goto:'a'},{text:'（點頭）',goto:'b'},{text:'「期末考加油。」',goto:'c'}]},
      {label:'a'},{speaker:'econ_zhengxun',text:'我哪知道。這要問你自己。'},{speaker:null,text:'（他先往樓梯走。）'},{goto:'end'},
      {label:'b'},{speaker:'econ_zhengxun',text:'嗯。'},{speaker:null,text:'（他先往樓梯走。）'},{goto:'end'},
      {label:'c'},{speaker:'econ_zhengxun',text:'你七月也是。'},
      {label:'end'},{speaker:null,text:'你們走下樓。外面的太陽很大。'},{speaker:'econ_zhengxun',text:'午餐。小福。'},{speaker:null,text:'一路上，他沒有問你下學期要做什麼。'},
      {rel:{econ_zhengxun:{trust:1}}} ],
    after:(G,GM)=>{ if(G.hour<12.5) GM.advance(12.5-G.hour); } },
  /* 重考期 R 系列（BB_112 第 4 節＋4-1 AB-38，BB-B 4380b0eb；AA_154 A39／A45；AA_224 第 6 組 @31708531：兩個人都休學，讀書的地方＝祐廷家的餐桌）。時間、窗口、沒去的照片在 story3d.js（rArrived、phoneRules）。
     讀書日：她到他家的餐桌（在家的選單那一輪演，trigger:'home'）＝ev_y0_r1（2/15，她搬來的第一天：AA_272 b16a0761，使用者「2/13 休學以後住我家」）／ev_y0_r5（4/2）／ev_y0_r2（第 8 週第一個讀書日）／ev_y0_rs（其他日子，一句輪流 S1～S5）；每天只一次（RT_KX）。
     R1 沒演到：「我發現我喜歡吵贏……」移到下一次（R1B）。玩樂日：ev_y0_r3／ev_y0_r6／ev_y0_rp（旁白一句輪流 P1～P6），habit retake:play。R4、R7 照日期 */
  ...(()=>{ const ST=()=>typeof STORY!=='undefined'?STORY:null, kxAt=k=>({custom:G=>{ const S=ST(); return !!S&&S.rArrived(G)&&S.rStudyKind(G)===k; }});
    const R1B=[{if:{custom:G=>!(G.events.done&&G.events.done.ev_y0_r1)&&!G.flags.R1_LINE},speaker:'kexin',expression:'tired',text:'我昨天想一題想到睡不著。等一下要跟你吵。'},{if:{custom:G=>!(G.events.done&&G.events.done.ev_y0_r1)&&!G.flags.R1_LINE},set:{R1_LINE:true}}];
    const study=(id,title,k,dialogue,once)=>({ id, stage:'econ', title, participants:['kexin'], location:'any', trigger:'home', once:once!==false, background:'blur', prereq:kxAt(k), dialogue, after:G=>{ G.flags.RT_KX=G.day; } });
    const play=(id,title,bg,hours,dialogue,after)=>({ id, stage:'econ', title, participants:['kexin'], location:'any', trigger:'outing', once:id!=='ev_y0_rp', background:'dark', hours, dialogue,
      after:(G,GM)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:play'); if(after) after(G,GM); } });
    const rsLines=[]; [['「你又比我早起。……今天早餐我請。」'],['（她放下包包）','「你讀到哪了？……三章？我才讀到第二章。」'],['「你的螢光筆快沒水了。我這支先借你。」'],['「我帶了兩杯飲料。你那杯是賄賂：等一下讓我先問問題。」'],['（她把包包放下，先趴在桌上一下。）','「……好，我可以了。」']]
      .forEach((L,i)=>{ for(const t of L){ const narr=/^（/.test(t); rsLines.push({if:{custom:G=>{ const S=ST(); return !!S&&S.rsPick(G)===i; }},speaker:narr?null:'kexin',...(narr?{}:{expression:'smile'}),text:narr?t:t.replace(/^「|」$/g,'')}); } });
    const rpLines=[{if:{custom:G=>!!G.flags.RP_TXT},speaker:null,text:'{flag:RP_TXT}'}];   /* 出門前（beforeOuting）選好那一句 */
    return [
      study('ev_y0_r1','互相出題的第一天','r1',[ {speaker:null,text:'（她搬來的第一天。你媽端了一盤水果出來，放下就回廚房了。）'},{scene:'祐廷家・你的房間',bg:'home_room_day'},{speaker:'kexin',expression:'teasing',text:'如果憲法是一間餐廳，第七條是什麼菜？'},
        {choice:[{text:'「白飯。每一桌都有，每個人拿到的一樣多。」',goto:'a'},{text:'「套餐。男女、宗教、種族、階級、黨派，都是同一份菜單。」',goto:'b'},{text:'「主廚推薦。主廚說了算。」',goto:'c'}]},
        {label:'a'},{speaker:'kexin',expression:'serious',text:'不行。平等不是每個人拿到一模一樣。'},{speaker:'kexin',expression:'smile',text:'牙齒不好的客人，那碗可以煮軟一點。只要有理由。'},{goto:'e'},
        {label:'b'},{speaker:'kexin',expression:'teasing',text:'條文背得很好。'},{speaker:'kexin',expression:'serious',text:'可是門口寫的那五種客人只是舉例。沒寫到的客人，也不能隨便被請出去。'},{goto:'e'},
        {label:'c'},{speaker:'kexin',expression:'serious',text:'錯。這家店最重要的規定：主廚不能因為客人是誰，就隨便決定上什麼菜。要有理由。'},
        {label:'e'},{speaker:null,text:'（她在筆記本上寫了一行，停了一下。）'},{speaker:'kexin',expression:'teasing',text:'第七條這題我還沒吵完喔。'},{speaker:'kexin',expression:'smile',text:'等一下吃飯繼續，你先不要去翻課本。'},{set:{R1_LINE:true}} ]),
      study('ev_y0_r5','一百天','r5',[ {scene:'祐廷家・你的房間',bg:'home_room_day'},{speaker:null,text:'牆上的倒數撕到一百。'},{speaker:'kexin',expression:'serious',text:'一百天。'},{speaker:'player',text:'妳在想什麼？'},
        {speaker:'kexin',expression:'thinking',text:'我們都考上的話——'},{speaker:null,text:'她停住。'},{speaker:'kexin',expression:'embarrassed',text:'不行，這個太早講。'}, ...R1B ]),
      study('ev_y0_r2','豆花賭注','r2',[ {scene:'祐廷家・你的房間',bg:'home_room_day'},{speaker:null,text:'錯一題請一碗。'},{speaker:'kexin',expression:'teasing',text:'你欠我四碗。'},{speaker:'player',text:'妳欠我三碗。'},{speaker:'kexin',expression:'laugh',text:'所以你欠我一碗。'},{speaker:'player',text:'……好啦。'}, ...R1B ]),
      Object.assign(study('ev_y0_rs','同一張桌子','s',[ {scene:'祐廷家・你的房間',bg:'home_room_day'}, ...rsLines, ...R1B ],false),{ after:G=>{ const S=ST(); if(S){ const i=S.rsPick(G); if(i>=0) S.rUse(G,'RS_USED',i); } G.flags.RT_KX=G.day; } }),
      play('ev_y0_r3','杜鵑花的散步','daan_park',3,[ {scene:'大安森林公園',bg:'daan_park'},   /* AA_298 第 3 節：休學後不回台大，改大安森林公園；假設題拿掉（AA_295）*/
        {speaker:null,text:'（大安森林公園。杜鵑花季快過了，靠捷運站那一排還開著。）'},
        {speaker:'kexin',expression:'smile',text:'今天不讀書。走到水池那邊，再走回來。'},
        {choice:[{text:'「好，慢慢走。」',goto:'a'},{text:'「拍一張照片？」',goto:'b'}]},
        {label:'a'},{speaker:null,text:'（你們走得很慢。到了水池，她站在欄杆邊看水裡的烏龜，看了很久。）'},{goto:'e'},
        {label:'b'},{speaker:'kexin',expression:'embarrassed',text:'拍花就好。……不要拍我。'},{speaker:null,text:'（照片裡，她還是走進來一半。）'},{goto:'e'},
        {label:'e'},{speaker:'kexin',expression:'smile',text:'好了。去吃東西。'} ]),
      play('ev_y0_r6','河濱的休息日','riverside',4,[ {scene:'河濱',bg:'riverside'},{speaker:null,text:'（騎到河濱，風從河面吹過來，有一點草的味道。）'},{speaker:'kexin',expression:'teasing',text:'今天不讀書。這是規定。'},{speaker:'player',text:'誰規定的？'},{speaker:'kexin',expression:'laugh',text:'我。剛剛。'},
        {speaker:null,text:'（她把手機收進包包，在草地上躺下來。）'},{speaker:'kexin',expression:'teasing',text:'你手機也收起來。'},{speaker:null,text:'（你也把手機收起來。你們躺到太陽快下山，才騎回去。）'} ]),
      Object.assign(play('ev_y0_rp','和可昕出門','dark',3,[ ...rpLines ]),{ beforeOuting:(G)=>{ const S=ST(); if(!S) return; const i=S.rpPick(G); G.flags.RP_LAST=i; G.flags.RP_TXT=i>=0?S.RP[i][2]:''; },
        after:(G)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:play'); const S=ST(), i=G.flags.RP_LAST; if(S&&i!=null&&i>=0) S.rUse(G,'RP_USED',i); } }),
      { id:'ev_y0_r4', retired:'AA_298 第 2 節（使用者「根本沒有模擬考」），定義留給已經演過的舊存檔', stage:'econ', title:'模擬考很爛的那一天', participants:['kexin'], location:'campus', trigger:'auto', term:['Y0S2'], once:true, background:'blur',
        prereq:{custom:G=>{ const S=ST(); if(!S) return false; const d=S.dayOfKey('2025-04-19'); if(G.day!==d||G.zone!=='campus'||G.hour<16||G.hour>=18) return false;
          const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj, A=S.R4_AT; if(!P) return true; const dx=P.position.x-A.x, dz=P.position.z-A.z; return dx*dx+dz*dz<=25; }},
        dialogue:[ {speaker:null,text:'（模擬考考完，她對完答案，坐在總圖外的台階上，把試題本捲成一根。）'},{speaker:'kexin',text:'我決定把分數當作抽象藝術。'},
          {choice:[{text:'「那我要收藏。開個價。」',set:{E32_COMFORT:'joke'},goto:'a'},{text:'（在她旁邊坐下，不說話）',set:{E32_COMFORT:'quiet'},goto:'b'},{text:'「是考爛了。可是錯的那幾題，剛好是我們還沒讀的那兩章。」',set:{E32_COMFORT:'truth'},goto:'c'}]},
          {label:'a'},{speaker:'kexin',text:'……非賣品。'},{speaker:null,text:'（她笑出來，把捲好的試題本塞進你的包包。）'},{speaker:'kexin',text:'好吧，送你。不要給別人看。'},{goto:'e'},
          {label:'b'},{speaker:null,text:'（你們坐在台階上，看總圖前面的人走來走去。）'},{speaker:null,text:'（過了很久，她把頭靠在你的肩膀上。）'},{speaker:'kexin',text:'……再坐五分鐘。'},{goto:'e'},
          {label:'c'},{speaker:'kexin',text:'……你真的很不會安慰人。'},{speaker:'kexin',text:'可是你說得對。'},{speaker:'kexin',text:'那兩章下禮拜讀。你畫架構，我出題。'},
          {label:'e'},{speaker:'kexin',text:'好。今天考爛了，明天再說。'},{speaker:'kexin',text:'走吧，我好餓。早上緊張到沒吃。'} ] },
      { id:'ev_y0_r7', stage:'econ', title:'保齡球再戰', participants:['econ_zhengxun','kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
        dialogue:[ {scene:'保齡球館',bg:'bowling'},{speaker:null,text:'（週六下午兩點，保齡球館。這次不換制服，輸的人請宵夜。）'},{speaker:'econ_zhengxun',text:'昨天那張照片，我存起來了。'},{speaker:'kexin',expression:'thinking',text:'你們兩個講話，好像在對暗號。'},
          {speaker:'econ_zhengxun',text:'他欠我一場保齡球。'},{speaker:null,text:'（第三局打完，你和可昕兩個人的分數加起來，還輸阿勳一個人。）'},{speaker:'kexin',expression:'teasing',text:'宵夜你請。……上次是我請的。'}/* AA_373 第 6-1 節（企劃線 bdab2f42）：不比分數，改輪流請 */,{speaker:'player',text:'……妳剛剛洗溝三次。'},
          {speaker:'kexin',expression:'serious',text:'那是戰術。'},{speaker:'econ_zhengxun',text:'（站在球道前面，回頭）這次看好。'},{speaker:null,text:'（十支瓶子一起倒下。可昕站起來拍手。）'} ] } ]; })(),
  /* 衝刺班（AA_224 6-4 @31708531；機制 BB_188 A9-3）：2025-06-09～07-09 每週一、三、五 19:00～22:00，祐廷和可昕一起去（AA_272 第 7 節：兩個人從家裡一起出門），另一間補習班，不是 12 月那間。
     第一次去＝三句旁白（沒有選項）；之後的晚上不演，時間跳過（像上課）。某一晚不去（「這次不去」）不扣任何東西。排程在 story3d.js（OUT y0_crm_<day>）*/
  { id:'ev_y0_cram_class', retired:'AA_298 第 1 節（衝刺班改每天 09:00～21:00、只停 retake_home 的長場景），定義留給舊存檔', stage:'econ', title:'衝刺班', participants:[], location:'any', trigger:'outing', once:false, background:'dark', hours:3,
    dialogue:[ {scene:'衝刺班',bg:'cram_class'},
      {unless:{flags:['CRAM_CLASS_SEEN']},speaker:null,text:'（另一間補習班。一間坐滿的教室，沒有人認識你們。）'},
      {unless:{flags:['CRAM_CLASS_SEEN']},speaker:null,text:'（你們挑了最後一排，兩個位子。）'},   /* AA_272 第 7 節（7050a1a0；使用者「我們……考前一個月去衝刺班」）：兩個人一起去，「半價」那句刪 */
      {set:{CRAM_CLASS_SEEN:true}} ] },
  /* ★E35 考試的前一晚（BB_104 8b-18；AA_154 A41；AA_224 6-5；AA_272 第 10 節 7975ffdf：住在一起以後）：7/10（四）21:00 在家裡演（2D，在家的選單那一輪；AA_303 第 2 節 24：在家裡、不下樓，背景 home_living）。
     不用邀約私訊（18:00 只記 E35_ASKED）；電話版拿掉。21:00 他不在家＝她傳「你在哪。明天要早起，早點回來。」（story3d.js），24:00 以前回到家就演同一段；都沒回家＝不演、E35_PLAN 不記。
     記 E35_PLAN（sea／sleep／shop）、E35_MET。ev_y0_e35 留著 id 給舊存檔（不會再觸發）*/
  ...(()=>{ const D=G=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-07-10'):null;
    const lines=[ {scene:'臺北的家',bg:'home_living'},   /* AA_303 第 2 節 24（原本 y0_home_street_night 家樓下）*/
      {speaker:null,text:'（她房間的門開著。她坐在床邊整理筆袋，准考證放在膝蓋上，翻過來又翻回去。）'},
      {speaker:'kexin',expression:'thinking',text:'准考證我看了第四次了。'},
      {speaker:null,text:'（她從筆袋拿出兩枝 2B 鉛筆，分一枝給你。）'},
      {speaker:'kexin',expression:'smile',text:'考完要去哪？先講好，我才睡得著。'},
      {choice:[{text:'「海邊。」',set:{E35_PLAN:'sea'},goto:'a'},{text:'「睡一整天。」',set:{E35_PLAN:'sleep'},goto:'b'},{text:'「妳選一家。」',set:{E35_PLAN:'shop'},goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'laugh',text:'海邊喔。那我帶一顆西瓜。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'laugh',text:'我也要睡。那天誰都不要叫我。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'thinking',text:'我選？……那我家巷子裡那家。我從國中吃到現在，每次都在排隊。'},   /* AA_368 H4（企劃線 e55fda50）：7/12 起她在高雄、日期卡寫他搭客運南下——原本「公館巷子裡那家」 */
      {label:'end'},{speaker:'kexin',expression:'smile',text:'好。去睡。明天要早起。'},
      {set:{E35_MET:true}},{set:{E35_DONE:true}} ];
    return [
      { id:'ev_y0_e35', stage:'econ', title:'考試的前一晚', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'blur',   /* 舊的電話版（AA_272 第 10 節拿掉）：不再觸發 */
        prereq:{custom:()=>false}, dialogue:lines },
      { id:'ev_y0_e35h', stage:'econ', title:'考試的前一晚', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark',   /* 21:00～24:00 在家 */
        prereq:{custom:G=>{ const F=G.flags; if(!F.E35_ASKED||F.E35_DONE) return false; return G.day===D(G)&&G.hour>=21&&G.hour<24; }},
        dialogue:lines } ]; })(),
  /* ★考試的兩天（AA_272 第 11 節 885c1c2b＋c8baae2b、117b6081；使用者 22:4x、22:5x）：都不能快轉（home3d.js Y0_FIXED 7/11）。
     11-1 7/11（五）考場（2D classroom_small）：她坐在他前面，互相加油；演完字卡「7/11～7/12　分科測驗」帶過兩天，直接到 7/12（六）19:00 臺北的家。
     11-2 7/12 晚上餐桌對答案（2D home_living）：他數學一百，她錯一題；記 MATH_100（只是紀錄）。
     ev_y0_exam1h＝在家（home3d.js 選單那一輪）；ev_y0_exam1＝人不在家（演完回家）*/
  ...(()=>{ const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
    const atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const due1=G=>{ const d=DK('2025-07-11'); return d!=null&&G.day===d&&G.hour>=7.5&&!!G.flags.dating_kexin&&!G.flags.EXAM1_DONE; };
    const due2=G=>{ const d=DK('2025-07-12'); return d!=null&&G.day===d&&G.hour>=19&&!!G.flags.EXAM1_DONE&&!G.flags.EXAM2_DONE; };
    const lines1=[ {scene:'考場',bg:'exam_hs_classroom'},   /* 高中教室、單人桌椅（AA_298 第 7 節；使用者生成 BB-C 0182b085）*/
      {speaker:null,text:'（考場在一間高中。教室門口貼著座位表。）'},
      {speaker:null,text:'（你的准考證號碼，和她的只差一號。五月報名那天，兩個人坐在餐桌兩邊，一人一台電腦，同時按下送出。）'},
      {speaker:null,text:'（單人的桌椅，一張一張隔開排好。）'},{speaker:null,text:'（她坐在你前面。）'},   /* 使用者 10-18：「重考的考場是高中教室，真正的高中教室，位置不會連在一起」「他在我前面」（AA_298 第 7 節）*/
      
      {speaker:'kexin',expression:'serious',text:'（回頭，小聲）……我手好冰。'},{speaker:'player',text:'我也是。'},
      {speaker:'kexin',expression:'smile',text:'加油。'},{speaker:'player',text:'加油。'},
      {speaker:null,text:'（鐘響。她轉回去，把筆放在准考證旁邊，排得很整齊。）'},
      {titleCard:'7/11～7/12',sub:'分科測驗'},{set:{EXAM1_DONE:true}} ];
    const after1=(G,GM)=>{ const d=DK('2025-07-12'); if(d!=null&&typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,d,19); if(!atHome(G)&&typeof HOME!=='undefined'&&HOME.go) void HOME.go(GM); };
    const lines2=[ {scene:'祐廷家・餐桌',bg:'home_living'},
      {speaker:null,text:'（晚上，補習班的解答出來了。兩個人坐在餐桌兩邊，一題一題對。）'},
      {speaker:null,text:'（數學對完，你又從第一題重新對了一次。）'},
      {speaker:null,text:'（全對。）'},
      {speaker:'kexin',expression:'annoyed',text:'數學我錯一題。'},   /* AA_308 第 10 節（使用者 10-20 選「只講她自己的」）：拿掉「……你數學一百？」「好像是。」，你全對只留在旁白 */{speaker:'kexin',expression:'sad',text:'……就一題。'},
      {speaker:'kexin',expression:'tired',text:'其他科明天再對。今天先這樣。'},
      {set:{MATH_100:true,EXAM2_DONE:true}} ];
    return [
      { id:'ev_y0_exam1h', stage:'econ', title:'考場', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:due1}, dialogue:lines1, after:after1 },
      { id:'ev_y0_exam1', stage:'econ', title:'考場', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>due1(G)&&!atHome(G)}, dialogue:lines1, after:after1 },
      { id:'ev_y0_exam2', stage:'econ', title:'對答案', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:due2}, dialogue:lines2 } ]; })(),
  /* ★成績公布那天（AA_272 第 4 節 4-2、4-3，c8baae2b；使用者 21:4x：她家在高雄、那天是公布分數、他在客運上心情不好、後來和好）：7/25（五），不能快轉。
     AA_303 第 2 節 26：成績八點公布、簡訊提早到（07:30），兩個人都收到；晚上和好拿掉「政大也是法律……」「……捷運不用一個小時……」兩句（在家版的 22:30 私訊同樣拿掉，story3d.js）。
     KH_GO＝'bus'（7/24 選「好。我搭半夜的客運下去。」，AA_371 第 4 題；原本「好。我搭早上的客運。」）：凌晨 02:30 在家（或在外面）就出發（AA_368 M7：夜班客運），一整天一段演完——07:30 客運上收到成績簡訊（SCORE_REPLY）→ 08:00 高雄客運站小吵架（KH_FIGHT）
       → 18:30 她的私訊 → 20:00 客運站外面的便利商店和好（KH_MADEUP）→ 21:00 的客運回臺北，約五小時，7/26 02:10 到家（AA_368 M7；原本 00:10）。
     KH_GO 不是 'bus'（在家查、沒回）：07:30 手機版（4-2 的訊息照用，客運的旁白拿掉；第三個選項「先不要講分數。晚上打給妳。」AA-C 0cc64ec7）；
       21:00 電話（AA_272 第 12 節 c0ee2822，KH_FIGHT；睡著＝21:00 叫醒）→ 22:30 她的私訊（story3d.js，KH_MADEUP）。肉粽、問車、九點客運只在客運版。
     底圖：客運車廂、高雄客運站（白天、晚上）還沒有，先用深色底＋地點字幕（LAWWW2 的任務）*/
  ...(()=>{ const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
    const atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const to=h=>({advance:G=>Math.max(0,h-G.hour)});
    const score=bus=>[
      bus?{speaker:null,text:'（早上七點半，國道上。成績八點公布，你算好八點到高雄。）'}:{speaker:null,text:'（早上七點半。成績的簡訊提早到了。）'},   /* AA_304 第 13 列（在家版）*/
      bus?{speaker:null,text:'（手機震了一下。成績的簡訊提早到了。）'}:null,
      {speaker:null,text:'（你查了自己的。比你想的高。）'},
      /* AA_308 第 7 節 KH-SCORE-TIMING（X60）：收到成績簡訊的時候補習班的落點還沒出來——落點表客運版在 10:00 早餐店（見面後）、在家版在 10:00 */
      {speaker:null,text:'（又震了一下。是她。她也收到了。）'},
      {phone:'kexin',text:'查到了。'},{phone:'kexin',text:'（截圖：她的成績）'},{phone:'kexin',text:'……你呢。'},
      {choice:[{text:'「（傳截圖給她。）」',set:{SCORE_REPLY:'shot'},goto:'s1'},{text:'「我的還好。」',set:{SCORE_REPLY:'fine'},goto:'s2'},{text:'「先不要講分數。我快到了。」',set:{SCORE_REPLY:'later'},goto:'s3',if:{custom:()=>bus}},{text:'「先不要講分數。晚上打給妳。」',set:{SCORE_REPLY:'later'},goto:'s3',unless:{custom:()=>bus}}]},
      {label:'s1'},{phone:'kexin',text:'好。'},{speaker:null,text:'（很久沒有下一則。）'},{goto:'s9'},
      {label:'s2'},bus?{phone:'kexin',text:'……好。等你到了再說。'}:{phone:'kexin',text:'……『還好』是幾分。傳給我。'},{goto:'s9'},   /* 客運版照 AA_308 第 7 節；在家版 AA-C 10-20 14:0x（07:30 還沒有落點表：她只是不讓他含糊帶過）*/
      {label:'s3'},{phone:'kexin',text:'嗯。'},
      {label:'s9'},
      bus?{speaker:null,text:'（你把手機蓋在腿上。窗外是一片一片的田。）'}:null,
      bus?{speaker:null,text:'（還有半個小時。）'}:null,   /* AA_304 第 14 列 */
      ].filter(Boolean);   /* 「（還有兩個小時。）」拿掉：七點半上車、八點到（AA_303 第 2 節 26）*/
    const busLines=[ {speaker:null,text:'（凌晨兩點半，你搭上南下的夜班客運。）'},   /* AA_368 M7（企劃線 e55fda50）：這一場原本 06:00 從家裡開始，客運不可能兩小時到高雄（1/31 他自己開車都要四個多小時）——改搭凌晨的夜班客運：02:30 停在家裡（快轉的日期卡「7/25（五）02:30 臺北的家」）、這一行旁白；7:30「國道上」那句不改 */
      to(7.5),{scene:'客運上',bg:'kh_bus_day'},...score(true),
      to(8),{scene:'高雄・客運站出口',bg:'kh_bus_station'},
      {scene:'高雄・客運站附近的早餐店',bg:'soymilk_shop'},{speaker:null,text:'（早餐店。她點了兩份蛋餅，說今天要慶祝，先吃再說。）'},   /* AA_308 第 7 節：見面以後才看到落點表 */
      to(10),{speaker:null,text:'（十點，手機震了一下。補習班傳來今年的落點預估表。）'},{speaker:null,text:'（你那個分數，在臺大法律那一格。她那個分數，在政大法律那一格。）'},{speaker:null,text:'（她也在看同一張表。兩個人都沒有說話。）'},
      {speaker:'kexin',expression:'sad',text:'……恭喜你。'},{speaker:'player',text:'……嗯。'},{speaker:'kexin',expression:'annoyed',text:'你可以高興一點。我又不會怎樣。'},{speaker:'player',text:'我沒有不高興。'},{speaker:'kexin',expression:'annoyed',text:'你從看到表到現在，都沒有看我。'},
      {choice:[{text:'「我只是在想，以後我們不在同一個學校了。」',set:{KH_FIGHT:'school'}},{text:'「妳那幾題，我們明明一起寫過。」',set:{KH_FIGHT:'questions'}},{text:'（沒有說話。）',set:{KH_FIGHT:'silent'}}]},
      {speaker:'kexin',expression:'annoyed',text:'……我知道我考不好。我不用你幫我難過。'},{speaker:'kexin',expression:'annoyed',text:'我先回家。你自己逛一下。'},{leave:'kexin'},
      {speaker:null,text:'（她走了。你在早餐店外面站了很久。）'},{speaker:null,text:'（那天你一個人在高雄走了一整天。哪裡都沒有進去。）'},   /* AA_304 第 14 列 */
      to(18.5),{phone:'kexin',text:'你回臺北的車幾點。'},{phoneMe:'kexin',text:'九點。'},{phone:'kexin',text:'我八點去車站。'},
      to(20),{scene:'高雄・客運站外面的便利商店',bg:'kh_store_night'},
      {speaker:'kexin',expression:'sad',text:'早上那樣，對不起。'},{speaker:'player',text:'我也是。我不知道要講什麼。'},
      {speaker:null,text:'（她把一袋東西塞給你。是她家巷口的肉粽，還是熱的。）'},
      {speaker:'kexin',expression:'smile',text:'車上吃。不要在車上難過。'},
      to(21),{speaker:null,text:'（九點的客運開了。你在車上把肉粽吃完。）'},
      {set:{KH_MADEUP:true,KH_DAY:'bus'}} ];
    const busAfter=(G,GM)=>{ if(G.hour<26+10/60) GM.advance(26+10/60-G.hour); if(!atHome(G)&&typeof HOME!=='undefined'&&HOME.go) void HOME.go(GM); };   /* AA_368 M7：九點的客運開了以後約五小時，7/26 02:10 到臺北的家（原本「三小時的客運，00:10」）*/
    const homeLines=[ to(7.5),{scene:'臺北的家'},...score(false),
      to(10),{speaker:null,text:'（十點，補習班傳來今年的落點預估表。你那個分數，在臺大法律那一格。）'},{speaker:null,text:'（她傳來一張截圖：同一張表，她把自己那一格圈起來。政大法律。）'},{speaker:null,text:'（考上的話，你在臺大，她在政大。以後不會每天坐在同一張桌子了。）'},   /* AA_308 第 7 節在家版：落點 10:00 才出來 */
      {set:{KH_DAY:'home'}} ];
    const callLines=[ {scene:'電話'},{speaker:null,text:'（電話接通。她那邊很安靜。）'},
      {speaker:'kexin',expression:'sad',text:'……恭喜你。'},{speaker:'player',text:'嗯。'},{speaker:'kexin',expression:'annoyed',text:'你可以高興一點。我又不會怎樣。'},{speaker:'player',text:'我沒有不高興。'},{speaker:'kexin',expression:'annoyed',text:'你從接起來到現在，都只說「嗯」。'},
      {choice:[{text:'「我只是在想，以後我們不在同一個學校了。」',set:{KH_FIGHT:'school'}},{text:'「妳那幾題，我們明明一起寫過。」',set:{KH_FIGHT:'questions'}},{text:'（沒有說話。）',set:{KH_FIGHT:'silent'}}]},
      {speaker:'kexin',expression:'annoyed',text:'……我知道我考不好。我不用你幫我難過。'},{speaker:'kexin',expression:'annoyed',text:'我先掛了。'},{speaker:null,text:'（電話斷了。你看著手機很久。）'},{set:{KH_CALL_DONE:true}} ];
    const callDue=G=>{ const d=DK('2025-07-25'); return d!=null&&G.day===d&&G.hour>=21&&G.flags.KH_DAY==='home'&&!G.flags.KH_CALL_DONE; };
    /* AA_304 第 15 列：在家版 22:30 和好改成她打回來的電話（原本是私訊；重要的事當面或演出來的電話）*/
    const madeLines=[ {scene:'電話'},{speaker:null,text:'（十點半。手機響了。是她。）'},
      {speaker:'kexin',expression:'sad',text:'剛剛那樣，對不起。'},{speaker:'player',text:'我也是。我不知道要講什麼。'},{speaker:null,text:'（電話兩邊都安靜了一下。）'},
      {speaker:'kexin',expression:'smile',text:'……早點睡。不要躺在床上難過。'},{speaker:'player',text:'妳也是。'},{set:{KH_MADEUP:true}} ];
    const madeDue=G=>{ const d=DK('2025-07-25'); return d!=null&&(G.day>d||(G.day===d&&G.hour>=22.5))&&G.day<=d+1&&!!G.flags.KH_CALL_DONE&&!G.flags.KH_MADEUP; };
    const d25=G=>{ const d=DK('2025-07-25'); return d!=null&&G.day===d&&!!G.flags.dating_kexin&&!G.flags.KH_DAY; };
    const busDue=G=>d25(G)&&G.hour>=2.5&&G.flags.KH_GO==='bus', homeDue=G=>d25(G)&&G.hour>=7.5&&G.flags.KH_GO!=='bus';   /* AA_368 M7：客運版 02:30 開始（原本 06:00）*/
    return [
      { id:'ev_y0_kh_bus_h', stage:'econ', title:'成績公布', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:busDue}, dialogue:busLines, after:busAfter },
      { id:'ev_y0_kh_bus', stage:'econ', title:'成績公布', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>busDue(G)&&!atHome(G)}, dialogue:busLines, after:busAfter },
      { id:'ev_y0_kh_home_h', stage:'econ', title:'成績公布', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:homeDue}, dialogue:homeLines },
      { id:'ev_y0_kh_home', stage:'econ', title:'成績公布', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'blur', prereq:{custom:G=>homeDue(G)&&!atHome(G)}, dialogue:homeLines },
      { id:'ev_y0_kh_call_h', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:callDue}, dialogue:callLines },
      { id:'ev_y0_kh_call', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>callDue(G)&&!atHome(G)}, dialogue:callLines },
      { id:'ev_y0_kh_madeup_h', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:madeDue}, dialogue:madeLines },
      { id:'ev_y0_kh_madeup', stage:'econ', title:'電話', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>madeDue(G)&&!atHome(G)}, dialogue:madeLines } ]; })(),
  /* ★E36 放榜（分發結果）8/13（三）：手機＋電話（AA_272 4-4，c8baae2b；取代 AA_224 6-6 的椰林大道見面）。10:00 兩句系統旁白照 AA_224 6-6（ev_y0_e36r／rh）；
     10:05 她的私訊在 story3d.js；20:00 電話（她在高雄）：「台大法律。恭喜你。真的。」→ 祐廷「只高 0.1。」→ 可昕「上了就是上了。」→ 祐廷「妳要不要回台大？」→ 她說了三個理由（AA_298 第 10 節、d744bf3d）→ E36_PACT
     → 最後一句「月底我就上去了。行李很多，你要載我。」（AA_304 第 18 列；接 8/30 E37 你開車載她搬宿舍）。「一點點不甘心」不用（7/25 說過）；BB_104 的「我差一點點」「消化」和路燈旁白拿掉（12-3）；電話裡三處改句（12-4 1fc61e52）。
     ev_y0_e36＝人不在家；ev_y0_e36h＝在臺北的家。22:00 經濟系群組四則在 story3d.js（E36n 宵夜改群組）；ev_y0_e36n 留著 id 給舊存檔（不會再觸發）*/
  ...(()=>{ const D=()=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-08-13'):null, atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const hab=k=>typeof EVENTS!=='undefined'&&EVENTS.habitCount?EVENTS.habitCount({key:'retake:'+k}):0;   /* E29 的旁白（AA_154 A49）：重考期讀書日、玩樂日哪邊多說哪一句，一樣多不說 */
    const lines=[ {scene:'電話'},
      {if:{custom:()=>hab('study')>hab('play')},speaker:null,text:'這半年，你幾乎每天都在念書。'},{if:{custom:()=>hab('play')>hab('study')},speaker:null,text:'這半年，你們很常騎去河堤。'},
      {speaker:'kexin',expression:'smile',text:'台大法律。恭喜你。真的。'},{speaker:'player',text:'只高 0.1。'},{speaker:'kexin',expression:'serious',text:'上了就是上了。'},   /* AA d744bf3d 更正（使用者「講話的人反了吧」）：「只高 0.1」照原本是祐廷說、可昕回；KX_CAR only_me 那兩句拿掉（AA_298 第 9 節；旗標照記，這裡不讀）*/
      {speaker:'player',text:'……妳要不要回台大？休學兩年內，都可以復學。'},{speaker:null,text:'（電話那頭安靜了一下。）'},   /* AA_298 第 10 節（使用者 10-18：她沒有在跟我比，不要再把比較的東西放進來）：「政大的山比較多……比你強壯」和 E36_REPLY 三選一拿掉 */
      {speaker:'kexin',expression:'thinking',text:'我想過。'},{speaker:'kexin',expression:'serious',text:'可是我也想念法律。'},{speaker:'kexin',expression:'embarrassed',text:'而且大家都知道，我們是休學去重考的。……這樣回去，有一點丟臉。'},{speaker:'kexin',expression:'sad',text:'回去經濟系，要一個人從大一開始。那時候的朋友都大二了，你也不在。'},
      {speaker:null,text:'（你想再說什麼，最後沒有說。之後，你也沒有再問過。）'},
      {label:'p'},{speaker:'kexin',expression:'sad',text:'九月以後，就不是同一張桌子了。'},
      {choice:[{text:'「每週一天。我們說好。」',set:{E36_PACT:'weekly'},goto:'w'},{text:'「到時候再說。」',set:{E36_PACT:'later'},goto:'l'},{text:'「妳想怎麼做？」',set:{E36_PACT:'ask'},goto:'q'}]},
      {label:'w'},{speaker:'kexin',expression:'smile',text:'……好。每週一天。'},{speaker:'kexin',expression:'teasing',text:'是哪一天，等我們都摸熟自己的課表再說。不准忘記。'},{goto:'e'},
      {label:'l'},{speaker:'kexin',expression:'neutral',text:'好。到時候再說。'},{speaker:null,text:'（她笑了一下。笑完，沒有馬上說話。）'},{speaker:'kexin',expression:'smile',text:'……你說的喔。'},{goto:'e'},
      {label:'q'},{speaker:null,text:'（她想了很久。）'},{speaker:'kexin',expression:'serious',text:'我不想每次都看誰剛好有空才見。'},{speaker:'kexin',expression:'thinking',text:'要固定哪一天，我還沒想好。你也想一下。'},
      {label:'e'},{speaker:'kexin',expression:'teasing',text:'月底我就上去了。行李很多，你要載我。'} ];   /* AA_304 第 18 列（8/30 你開車載她搬宿舍）*/
    const due=G=>{ const d=D(); return d!=null&&G.day===d&&G.hour>=20&&!!G.flags.E36_ASKED&&!(G.events.done&&(G.events.done.ev_y0_e36||G.events.done.ev_y0_e36h)); };
    const rdue=G=>{ const d=D(); return d!=null&&G.day===d&&G.hour>=10&&!G.flags.E36_RESULT; }, rlines=[ {speaker:null,text:'（八月十三日，早上十點。榜單公布了。）'},{speaker:null,text:'（臺大法律學系，財經法學組。你的名字在上面。）'},{speaker:null,text:'（分數只比那一組的錄取分數高 0.1。）'},{set:{E36_RESULT:true}} ];   /* AA_224 6-6：0.1 只出現在旁白和他那一句 */
    return [
      /* 白天看到結果（AA_154 A49：兩句系統旁白，接著可昕 10:05 的私訊）：ev_y0_e36r＝不在家；ev_y0_e36rh＝在臺北的家 */
      { id:'ev_y0_e36r', stage:'econ', title:'八月放榜', participants:[], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>rdue(G)&&!atHome(G)}, dialogue:rlines },
      { id:'ev_y0_e36rh', stage:'econ', title:'八月放榜', participants:[], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:rdue}, dialogue:[{scene:'臺北的家',bg:'home_room'}].concat(rlines) },   /* BB_216 B：在家看榜接 home_room */
      { id:'ev_y0_e36', stage:'econ', title:'放榜的電話', participants:['kexin'], location:'any', trigger:'auto', once:true, background:'blur', prereq:{custom:G=>due(G)&&!atHome(G)}, dialogue:lines },
      { id:'ev_y0_e36h', stage:'econ', title:'放榜的電話', participants:['kexin'], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:due}, dialogue:lines },
      { id:'ev_y0_e36n', stage:'econ', title:'放榜的宵夜', participants:[], location:'any', trigger:'chain', once:true, background:'dark', prereq:{custom:()=>false}, dialogue:[] } ]; })(),
  /* ★E37 第一次一起去政大（BB_104 8b-20；AA_154 A40）：8/30（六）14:00（2D 出遊）。AA_303 第 2 節「法律系 8/30」：改成你開家裡的車載她搬宿舍（導遊那句和三選一拿掉）；
     邀約私訊改「我明天坐高鐵上去。後天你載我搬宿舍。」（8/29 她坐高鐵到臺北、住你家一晚）。以下是原本 AA_206 2-3 的說明（後半「去年這個時候……」到最後照舊）：
     「繞了一圈」放在她回頭看宿舍、想到一年前的那一刻才說，三個分支都不加數值、沒有旗標；已經在山下的小吃街，不再寫「走到山下」，往公車站（AA_203 #18）。
     邀約、出發選單、14:15 的電話在 story3d.js；從家裡出發的演完回臺北的家（home3d.js）*/
  { id:'ev_y0_e37', stage:'any', kxAway:true,   /* kxAway：結尾「你一個人開車下山」（AA_309 第 3 列）*/   /* 選 1：8/29 轉進法律系以後的 8/30 也演（只由出遊觸發，once）*/ title:'第一次一起去政大', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:4,
    dialogue:[ {scene:'政大・宿舍',bg:'nccu_dorm_day'},{speaker:null,text:'（八月三十日。你開家裡的車，載她和兩個行李箱上山。）'},{speaker:null,text:'（政大的宿舍在山上。電梯很小，你們搬了三趟。）'},{speaker:'kexin',expression:'tired',text:'（擦汗）……好。這是我的床。'},
      {scene:'政大・山下的小吃街',bg:'nccu_food'},{speaker:null,text:'（山下的小吃街。她點了兩碗酸辣湯餃，說放榜那天晚上查政大附近的店，就想吃這家了。）'},{speaker:'kexin',expression:'smile',text:'以後你開車來找我。我負責選宵夜。'},   /* AA_368 L7（企劃線 e55fda50）：原本「說上次來看宿舍的時候就想吃了」；開頭「山下的小吃街。」保留 */
      {speaker:'kexin',expression:'thinking',text:'去年這個時候，我以為我九月會在臺大念大二。'},
      {choice:[{text:'「我也以為我會在經濟系。」',goto:'g1'},{text:'（等她說下去）',goto:'g2'},{text:'「現在呢？」',goto:'g3'}]},
      {label:'g1'},{speaker:'kexin',expression:'smile',text:'結果兩個人都繞了一圈。'},{speaker:null,text:'（她說完，往山上的宿舍走。你陪她走上去。）'},{goto:'h'},
      {label:'g2'},{speaker:'kexin',expression:'serious',text:'沒有後悔喔。只是有時候會想一下。'},{goto:'h'},
      {label:'g3'},{speaker:'kexin',expression:'teasing',text:'現在在想，湯餃要不要再買一份帶回去。'},
      {label:'h'},{speaker:null,text:'（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.e37Dorm?STORY.e37Dorm(G):!!(G.flags||{}).E37_LAW},speaker:null,text:'（你把車開回家，再搭捷運回宿舍。）'} ],   /* AA_307 第 6 列；最後一句＝從法律系開局的版本（X81，AA_303「法律系開局的 8/30」，AA-C bcb678e0）；AA_368 M8：改成 8/30 住在宿舍的人都有（經濟系路線 8/29 也搬進宿舍了，STORY.e37Dorm）*/
    afterOuting:(G,GM)=>{ if((typeof STORY!=='undefined'&&STORY.e37Dorm?STORY.e37Dorm(G):(G.flags||{}).E37_LAW)&&GM.advance) GM.advance(1); } },   /* 住在宿舍的（AA_368 M8；原本只有法律系開局）：開車回家、再搭捷運回宿舍——多 1 小時（14:00 到、回到宿舍 19:00 左右）；出發地點照舊（他先回家開車）*/
  /* E35 考完以後：7/19（六）摘要日（AA_154 A47；旁白 AA 寫）：E35_PLAN 有值才演；字卡「7/19（六）」＋一句旁白，接她考前一晚的回應；那一天用摘要帶過（演完到 20:00）。
     ev_y0_e35s＝人不在家；ev_y0_e35sh＝在臺北的家（home3d.js 選單那一輪）*/
  ...(()=>{ const due=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2025-07-19'):null; return d!=null&&G.day===d&&!!G.flags.E35_PLAN&&!G.flags.E35_SUM; };
    const atHome=G=>typeof HOME!=='undefined'&&HOME.at&&HOME.at(G);
    const lines=[ {scene:'7/19（六）',if:{flagIs:{E35_PLAN:'sleep'}},bg:'home_living'},{scene:'7/19（六）',if:{flagIs:{E35_PLAN:'sea'}},bg:'y0_sea_blue'},{scene:'7/19（六）',if:{flagIs:{E35_PLAN:'shop'}},bg:'y0_lane_shop'},   /* 背景照分支（BB-C 22bf4908、2fe51fcf）：sleep＝在家、sea＝晴天的海邊、shop＝巷子裡的小店 */
      {if:{flagIs:{E35_PLAN:'sea'}},speaker:null,text:'那天的海很藍。她真的帶了一顆西瓜，可是兩個人都沒有帶刀。'},
      {if:{flagIs:{E35_PLAN:'sleep'}},speaker:null,text:'雨下了一整天。你睡到下午三點，醒來的時候，她剛好傳來一張窗外下雨的照片。'},
      {if:{flagIs:{E35_PLAN:'shop'}},speaker:null,text:'巷子裡那家店很小。她點了兩份一樣的，說這樣才公平。'},{set:{E35_SUM:true}} ];
    const after=(G,GM)=>{ if(G.hour<20) GM.advance(20-G.hour); };
    return [ { id:'ev_y0_e35s', stage:'econ', title:'考完了', participants:[], location:'any', trigger:'auto', once:true, background:'dark', prereq:{custom:G=>due(G)&&!atHome(G)}, dialogue:lines, after },
             { id:'ev_y0_e35sh', stage:'econ', title:'考完了', participants:[], location:'any', trigger:'home', once:true, background:'dark', prereq:{custom:due}, dialogue:lines, after } ]; })(),
  /* XL-2 阿勳一句（表叔；BB_110 F1 的回聲，AA_154 A28、A43）：Y0S2 第 1 週第一次在宿舍遇到阿勳（和 XL-1 同一套），F1 選了「轉給表叔」（Y0_UNCLE）才說 */
  { id:'ev_y0_xl2', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'表叔的變異數', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S2'], weeks:[1], time:[18,24], once:true, background:'blur',
    prereq:{custom:G=>!!(G.flags&&G.flags.Y0_UNCLE)},
    dialogue:[ {speaker:'econ_zhengxun',text:'表叔今年給了兩倍。我的模型壞了。'} ] },
  /* P1b 會計作業：平衡不了的那一行（BB_105 P1b；AA_154 第 96、105 行）：會計課下課後的走廊，兩種輪流——第 1 次（10/3，第 5 週；和誰對答案）、第 2 次（10/17，第 7 週，有韋綸）。
     同一堂課下課 P2 還要演（「今天先回去」的玩家）的話 P2 先（afterClass 一堂只演一件）；第 1 次沒趕上第 5 週就在第 7 週，那樣第 2 次就沒有 */
  /* AA_272 第 13 節（d9aa4d9f，BB_214 第 3 節：第 6 週週四是國慶）：weeks 改 [4,5]（9/26、10/3）；同一堂下課 P2 也要演的話，先演 P1b1（教室裡對作業），再接 P2（門口被揪）——classFirst＋next_event */
  { id:'ev_y0_p1b1', stage:'econ', title:'平衡不了的那一行', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'class', afterClass:'acct_y0', classFirst:true, next_event:'ev_y0_p2', term:['Y0S1'], weeks:[4,5], once:true, background:'blur',
    dialogue:[ {speaker:'econ_pinyu',text:'（翻作業）借貸不平衡。差一百元。'},
      {speaker:'econ_zhengxun',text:'（看了一眼）你把折舊記成收入了。'},
      {choice:[{text:'和阿勳對',goto:'x'},{text:'和品妤對',goto:'p'},{text:'自己再算一次',goto:'s'}]},
      {label:'x'},{speaker:null,text:'阿勳只指了第五行。你就懂了。'},{goto:'end'},
      {label:'p'},{speaker:'econ_pinyu',text:'差一百。你從最後一行往回對，比較快。'},{goto:'end'},
      {label:'s'},{speaker:null,text:'（算到第三次，平了。）'},{speaker:'econ_pinyu',text:'恭喜，你花了二十分鐘。'},
      {label:'end'} ],
    consequences:{stamp:['P1B1_DAY']} },
  { id:'ev_y0_p1b2', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'平衡不了的那一行（二）', participants:['econ_zhengxun'], location:'any', trigger:'class', afterClass:'acct_y0', term:['Y0S1'], weeks:[7], once:true, background:'blur',
    prereq:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_p1b1)&&G.flags.P1B1_DAY!==G.day},
    dialogue:[ {speaker:'韋綸',text:'我的平衡了！'},{speaker:'econ_zhengxun',text:'（看了一眼）……你兩邊都寫零。'} ] },
  /* T1 全系的秘密（BB_112 T1；AA_154 第 111 行）：Y0S1 第 5～6 週平日中午在校園，切到小福（E09 之後的那幾週；9/30 颱風假、10/10 國慶沒有）。記 KNOWS_TANG（法律系 BB_106 4-2① 的選項讀它）。
     沒去：沒有這件，第一次聽說在 T2（唐睿自己說漏嘴，ev_y0_t2）*/
  { id:'ev_y0_t1', stage:'econ', title:'全系的秘密', participants:['econ_pinyu'], location:'campus', trigger:'auto', term:['Y0S1'], weeks:[5,6], weekday:[1,2,3,4,5], time:[12.1,13.25], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR==='undefined'||!CALENDAR.holiday(G.day)},
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:'韋綸',text:'（壓低聲音）你知道唐睿喜歡品妤嗎？'},
      {speaker:'player',text:'……不知道。'},
      {speaker:'韋綸',text:'全系都知道。只有品妤不知道。'},
      {speaker:'韋綸',text:'欸，她來了。'},
      {speaker:'econ_pinyu',text:'（端著餐盤走過來）你們在講什麼？'},
      {speaker:'韋綸',text:'在講……經濟學。'},
      {speaker:'econ_pinyu',text:'（坐下）經濟學喔。那你們繼續，我吃我的。'},
      {set:{KNOWS_TANG:true}} ],
    after:(G,GM)=>{ GM.advance(0.5); } },
  /* A1 凌晨兩點的微積分（BB_112 A1；AA_154 第 119 行）：Y0S1 第 7 週平日的深夜（10/15 群組聚會、10/16 E10 那兩晚除外），在宿舍房間、阿勳在。
     「我覺得很好。數字有溫度。」記 XUN_WARM（法律系大三 SK13 多一句）。沒去：期中考完（11/1 以後）門上的紙條（ev_y0_a1_note）*/
  { id:'ev_y0_a1', stage:'econ', title:'凌晨兩點的微積分', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[2], time:[24.5,26], once:true, background:'blur',
    dialogue:[ {speaker:'econ_zhengxun',text:'你那題，答案是零。'},
      {speaker:'player',text:'你怎麼知道我在寫哪一題？'},
      {speaker:'econ_zhengxun',text:'你在第四題卡半小時了。我一直聽到你嘆氣。'},
      {speaker:'econ_zhengxun',text:'（把椅子轉過來）我教你。十分鐘。'},
      {speaker:null,text:'（四十分鐘後。）'},
      {speaker:'econ_zhengxun',text:'（伸懶腰）我其實滿喜歡算這種的。算出來那一下很爽。'},
      {speaker:'econ_zhengxun',text:'……很怪吧。'},
      {choice:[{text:'「我覺得不怪。」',set:{XUN_WARM:true},goto:'w'},{text:'「你以後會一直念經濟嗎？」',goto:'q'},{text:'「十分鐘是四十分鐘。」',goto:'t'}]},
      {label:'w'},{speaker:'econ_zhengxun',text:'你也是怪人。'},{goto:'end'},
      {label:'q'},{speaker:'econ_zhengxun',text:'會吧。我也沒想過別的。'},{goto:'end'},
      {label:'t'},{speaker:'econ_zhengxun',text:'是你一直問下去的。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(2/3); } },
  { id:'ev_y0_a1_note', retired:'AA-C 2026-10-17 07:28 Q2：刪除（10/19 退宿以後不會回 412）。定義留給已經演過的舊存檔', stage:'econ', title:'門上的紙條', participants:[], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[9,10,11], once:true, background:'blur',
    prereq:{custom:G=>!(G.events&&G.events.done&&G.events.done.ev_y0_a1)&&typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(G.day).key>='2024-11-01'&&(CALENDAR.dateOf(G.day).key>'2024-11-01'||G.hour>=12)},
    dialogue:[ {speaker:null,text:'期中考完，阿勳在門上貼了一張紙：「第四題，答案是零。」'} ] },
  /* B2 小桌子的午後（BB_105 B2、4-4；AA_154 第 112 行）：Y0S1 第 6～7 週週一（10/7、10/14；第 5 週颱風停課）經原下課後，在博雅的自習區（101 旁小桌）坐下，可昕自己走過來。
     讀書或聊天都可以；她一點二十有課。和總圖那次（E10，她約的）是兩件不同的事。熟悉度上升不加數字（AA_355 第 2 節照用；30 分鐘版不演這一場）*/
  { id:'ev_y0_b2', stage:'econ', title:'小桌子的午後', participants:['kexin'], location:'boya', trigger:'seat', seatRoom:'study', term:['Y0S1'], weeks:[6,7], weekday:[1], time:[12.1,13.25], once:true, background:'blur',
    dialogue:[ {speaker:'kexin',expression:'neutral',text:'這裡有人嗎？'},
      {speaker:'kexin',expression:'smile',text:'……沒有人的話，我坐了。我一點二十才有課，還有一個小時。'},
      {speaker:'kexin',expression:'neutral',text:'你在讀經原？'},
      {speaker:'kexin',expression:'teasing',text:'上禮拜那題彈性你會嗎？我算出來是負的，不知道是不是錯了。'},
      {choice:[{text:'讀書',goto:'r'},{text:'聊天',goto:'c'}]},
      {label:'r'},{speaker:null,text:'她安靜地讀了十分鐘，然後把一張紙條推過來：「我讀不下去了。你呢？」'},{set:{B2_PICK:'read'}},{goto:'end'},
      {label:'c'},{speaker:null,text:'四十分鐘過去，誰都沒有翻頁。'},{set:{B2_PICK:'chat'}},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(G.flags.B2_PICK==='chat'?2/3:1/6); } },
  /* C1 即興劇社的熱身（BB_110 第 3 節；AA_154 第 113 行）：Y0S1 第 6 週晚上（10/10 除外），可昕邀（story3d.js：17:30 私訊，回好＝出遊 19:00 博雅借用的教室）。不管 E07 選了什麼都可以去。
     記 IMPROV_LINE＝祐廷接的那一句（E18 小公演可昕接住它）。沒去：22:00 可昕「今天唐睿演了一隻企鵝。大家笑到練不下去。」（BB_179 段 E M4）
     說話人標籤「即興劇社社長」、下面吉他社那一場「吉他社社長」：原本都寫「社長」，和法服共用（AA_496 第 9 節第 6 點：寫全名）*/
  { id:'ev_y0_c1', retired:'AA_293 第 1 節（使用者 10-18 選擇題：可昕不加社團、劇社的戲拿掉），定義留給已經演過的舊存檔', stage:'econ', title:'即興劇社的熱身', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'博雅・借用的教室',bg:'classroom_small'},
      {speaker:'即興劇社社長',text:'熱身。規則只有一個：對方說什麼，你都說「對，而且——」。'},
      {speaker:'唐睿',text:'（對{name}）我是一隻迷路的企鵝。'},
      {speaker:'player',text:'對，而且……'},
      {choice:[{text:'「而且你迷路的地方是公館。」',set:{IMPROV_LINE:'而且你迷路的地方是公館。'},goto:'a'},{text:'「而且我是來接你的計程車。」',set:{IMPROV_LINE:'而且我是來接你的計程車。'},goto:'b'},{text:'「而且……你欠我錢。」',set:{IMPROV_LINE:'而且……你欠我錢。'},goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'對，而且公館的企鵝都要排隊吃豆花。'},{goto:'end'},
      {label:'b'},{speaker:'唐睿',text:'對，而且我沒帶錢——等一下。'},{goto:'end'},
      {label:'c'},{speaker:'唐睿',text:'對，而且——（停住）——等一下，我欠你多少？'},{speaker:null,text:'全場笑。'},
      {label:'end'},{speaker:'kexin',expression:'smile',text:'（小聲）你接得比我想的好。'},
      {speaker:'即興劇社社長',text:'新來的，下次練習是週四晚上，可昕知道在哪。'} ] },
  /* 10/15（二）的群組聚會（AA_154 2-1b，AA-B 3828a4dd；第②級、送 BB-B 審）：17:30 群組兩則（story3d.js），17:30～19:15 出發選單「公館 19:00：經濟系的聚會」；去了＝出遊 19:00→22:20。
     不重演 P2（地點固定公館）；先桌遊（19:00～22:00）後夜市（到 22:20），BB-B 審稿後的順序（AA_154 92e541a9）。寫 E10_EVE:'went'（E10 第一句讀它）；兩個選項都只有可昕熟悉度 +1；夜市 −100（桌遊錢唐睿出）*/
  { id:'ev_y0_gather', stage:'econ', title:'經濟系的聚會', participants:['econ_zhengxun','econ_pinyu'], location:'any', trigger:'outing', once:true, background:'dark', hours:3+1/3,
    dialogue:[ {scene:'公館',bg:'gongguan'},
      {speaker:null,text:'（公館。下禮拜就是期中考。）'},   /* AA_368 L1（企劃線 e55fda50）：10/15 演，原本「期中考前的最後一個晚上」*/
      {speaker:'韋綸',text:'今天不准聊期中喔。誰聊到，今晚的桌遊錢他出。'},
      {scene:'公館・桌遊店',bg:'boardgame_gg'},{speaker:null,text:'（六個人擠進一家桌遊店。一個人一小時五十元。）'},
      {speaker:'econ_pinyu',text:'（看了一下錢包）三個小時的話，剛好。'},
      {speaker:null,text:'（第三局。可昕一直在看你的牌。）'},
      {choice:[{text:'「妳在看我的牌。」',goto:'a'},{text:'（假裝沒看到）',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'teasing',text:'我在看你的表情。牌我早就猜到了。'},{goto:'c'},
      {label:'b'},{speaker:null,text:'（那一局她贏了。）'},{speaker:'kexin',expression:'smile',text:'你讓我？……下次不用讓。'},
      {label:'c'},{rel:{kexin:{fam:1}}},
      {speaker:'唐睿',text:'我講一件不是期中的事喔——'},
      {speaker:null,text:'（他講的那件事，講到最後還是微積分。）'},
      {speaker:'韋綸',text:'唐睿請客！'},
      {scene:'公館',bg:'gongguan'},{speaker:null,text:'（六個人在夜市吃了一圈。十點二十，大家在公館的路口散了。）'},
      {speaker:null,text:'（阿勳說他要回去讀微積分。韋綸載品妤回宿舍。唐睿說他明天早八。）'},{speaker:null,text:'（路口只剩你們兩個。）'},{speaker:'kexin',expression:'embarrassed',text:'我還不想回去。'},   /* AA_293 第 4 節：散了以後她留下來；AA_303 第 2 節 7：便利商店門口吃宵夜（原本的兩選一拿掉）*/
      {speaker:'kexin',expression:'laugh',text:'……我餓了。剛剛在夜市都在講話。'},
      {speaker:null,text:'（巷口的便利商店，門口有一張小鐵桌。她買了關東煮，你買了兩瓶熱的。）'},
      {speaker:null,text:'（沒有人提期中。她把蘿蔔分你一半。）'},
      {speaker:null,text:'（十一點半，她說：「好，這次真的要回去了。」）'},{speaker:null,text:'（她走進女舍以前，回頭揮了一下手。）'},{set:{KX_STAYED:true}},{rel:{kexin:{comf:2}}},
      {set:{E10_EVE:'went'}} ],
    afterOuting:(G,GM)=>{ if(GM.money) GM.money(-100); } },
  /* ★E10「我們去總圖念書吧」——其實沒念多少（BB_104 8b-4；AA_154 第 117 行；固定核心）：10/15 22:30 可昕私訊邀（story3d.js），回「好。」＝10/16 晚上走進總圖三樓（library）就開始。
     第一句旁白照前一晚有沒有去群組聚會（E10_EVE＝'went'；10/15 的聚會一律是「群組裡一整晚都在聊天」——AA_355 第 2 節照用，30 分鐘版不演那幾場）。邀約那則已經在手機上，事件從「隔天晚上，總圖三樓」開始。
     E10_STUDY：先念書＝'study'；漫畫、字典＝'chat'。不答應、或 20:30 還沒到＝小福那一版（ev_y0_e10b）*/
  { id:'ev_y0_e10', stage:'econ', title:'去總圖念書', participants:['kexin'], location:'library', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[3], time:[18.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>G.flags.E10_GO==='yes'&&!G.flags.E10_STUDY},
    dialogue:[ {if:{flagIs:{E10_EVE:'went'}},speaker:null,text:'（前一天晚上，一群人在公館玩到很晚。回宿舍的路上，可昕傳來訊息。）'},
      {unless:{flagIs:{E10_EVE:'went'}},speaker:null,text:'（前一天晚上，群組裡一整晚都在聊天。）'},
      {speaker:null,text:'（隔天晚上，總圖三樓。她坐你對面，攤開微積分，看了五分鐘。）'},
      {speaker:'kexin',expression:'neutral',text:'（小聲）這題我看了五分鐘，還在第一行。'},
      {speaker:'kexin',expression:'neutral',text:'（小聲）你晚餐吃了沒？'},
      {choice:[{text:'「先念書。」',set:{E10_STUDY:'study'},goto:'s'},{text:'「還沒。」',set:{E10_STUDY:'chat'},goto:'m'},{text:'「吃了。妳沒吃喔？」',set:{E10_STUDY:'chat'},goto:'d'}]},
      {label:'s'},{speaker:null,text:'她點頭，低頭寫。一個小時後，你發現筆記的邊角多了一隻長頸鹿。'},{goto:'end'},
      {label:'m'},{speaker:'kexin',expression:'smile',text:'我也還沒。那再撐一下，九點去吃。'},{goto:'end'},
      {label:'d'},{speaker:'kexin',expression:'neutral',text:'只吃了一個飯糰。（她把微積分闔起來一半）好，再念半小時。'},
      {label:'end'},{speaker:null,text:'（九點。你們幾乎沒念到。）'},
      {speaker:'kexin',expression:'smile',text:'（已經在收筆袋）小福還開著。走吧。'} ],
    after:(G,GM)=>{ if(G.hour%24<21) GM.advance(21-G.hour%24); } },
  { id:'ev_y0_e10b', stage:'econ', title:'小福', participants:['kexin'], location:'any', trigger:'auto', term:['Y0S1'], weeks:[7], weekday:[3], time:[20.5,23.5], once:true, background:'blur',
    prereq:{custom:G=>!G.flags.E10_STUDY&&!!G.flags.E10_ASKED},
    dialogue:[ {scene:'小福',bg:'xiaofu'},
      {speaker:null,text:'你去小福買宵夜，在門口碰到她。她抱著一疊講義。'},
      {speaker:'kexin',expression:'smile',text:'欸，你也來買宵夜。'},
      {speaker:'kexin',expression:'neutral',text:'我一個人在總圖念到剛剛。……念不太進去。'},
      {set:{E10_STUDY:'chat'}} ] },
  /* E11 期中考：考完走出普通教學館（BB_104 8b-5；AA_154 第 122 行）：Y0S1 第 9 週最後一科＝10/31（四）下午的初等會計（考場在普通；AA_154 寫 11/1，週五沒有考試——已問 AA-B）。考試一定會考，沒有沒去版。記憶：無 */
  { id:'ev_y0_e11', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'期中考後', participants:['econ_zhengxun','econ_pinyu','kexin'], location:'any', trigger:'class', afterClass:'acct_y0', afterExam:'mid', term:['Y0S1'], weeks:[9], once:true, background:'blur',
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
     19:45～20:15 走到湖邊她的位置（南岸步道）就演。記 E12_ANSWER（chair／hand／cat；E18 讀它）。20:15 還沒到＝20:30 手機版（同樣三句、三個接法，一定要回；AA_295 拿掉第一句「假設……」）*/
  { id:'ev_y0_e12', stage:'econ', title:'長頸鹿的尾巴', participants:['kexin'], location:'campus', near:{x:-36,z:-98.5,r:5}, trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[3], time:[17.5,18], once:true, background:'blur',
    prereq:{custom:G=>!!G.flags.E12_ASKED&&!G.flags.E12_ANSWER},
    dialogue:[ {speaker:null,text:'（傍晚。她剛上完體育課，你們坐在醉月湖邊的椅子上。湖對面的燈一盞一盞亮起來。）'},   /* AA_303 第 2 節 12 整段換：只是坐在湖邊聊天、剛好聊到長頸鹿；保齡球照片那段搬到 E26 */
      {speaker:'kexin',expression:'neutral',text:'休學的人，今天做了什麼？'},
      {choice:[{text:'「睡到中午。」',goto:'d1'},{text:'「去書店站了一下午。」',goto:'d2'}]},
      {label:'d1'},{speaker:'kexin',expression:'smile',text:'……好羨慕。'},{goto:'d9'},
      {label:'d2'},{speaker:'kexin',expression:'neutral',text:'看什麼？'},{speaker:'player',text:'……法律的。'},{speaker:'kexin',expression:'neutral',text:'喔。'},
      {label:'d9'},{speaker:null,text:'（湖邊有一隻鷺鷥，腳很長，站著不動。）'},
      {speaker:'kexin',expression:'neutral',text:'牠的腳好長。'},
      {speaker:'kexin',expression:'smile',text:'……我小時候在動物園，看長頸鹿看了一整個下午。'},
      {speaker:'kexin',expression:'smile',text:'我最喜歡牠的尾巴。尾端有一撮毛，可以趕蒼蠅。'},
      {choice:[{text:'「妳怎麼知道？」',set:{E12_ANSWER:'how'},goto:'t1'},{text:'「拉花那隻，尾巴也沒畫。」',if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_l5a)},set:{E12_ANSWER:'latte'},goto:'t2'},{text:'「我要第三隻手，幫妳拿尾巴。」',set:{E12_ANSWER:'hand'},goto:'t3'}]},   /* 拉花那句：10/12 長頸鹿拉花（ev_y0_l5a）去過才有；E12_ANSWER＝hand 照舊給法律系「我還在等你的第三隻手。」*/
      {label:'t1'},{speaker:'kexin',expression:'teasing',text:'看了一整個下午啊。'},{goto:'end'},
      {label:'t2'},{speaker:'kexin',expression:'teasing',text:'對。所以它是馬。'},{goto:'end'},
      {label:'t3'},{speaker:'kexin',expression:'laugh',text:'（愣了一下，笑出來）……你在講什麼。'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'好冷。走吧。'} ] },
  /* ★E14 保齡球館：交換穿高中制服（BB_104 8-5；AA_154 第 130 行、A33；固定核心）：11/14 21:00 群組約（story3d.js；品妤那句是 AA 暫定）、出發選單 11/15 19:00；
     開始後 15 分鐘還沒出發＝韋綸打電話（AA 暫定句）→ 直接進出遊。只用文字，不做制服 CG。沒有旗標 */
  { id:'ev_y0_e14', stage:'econ', title:'保齡球館', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'保齡球館',bg:'bowling'},{speaker:null,text:'（第一次班聚。品妤在群組說，每個人帶一件高中制服，抽籤交換穿。）'},   /* AA_302 第 1 列：群組邀約可以跳過，先交代 */
      {speaker:'econ_pinyu',text:'都帶了吧？來，抽籤。'},   /* AA_309 第 4 列：旁白講過帶高中制服，不重複 */
      {speaker:'kexin',expression:'neutral',text:'我不抽。'},
      {speaker:'kexin',expression:'smile',text:'（拿起{name}的那一件）我要這件。'},
      {speaker:'player',text:'……為什麼？'},
      {speaker:'kexin',expression:'teasing',text:'這件比較好看。'},
      {speaker:'econ_pinyu',text:'不能自己挑。要抽。'},{speaker:'kexin',expression:'smile',text:'我沒有抽。所以沒有違規。'},   /* AA_224 3-2 */
      {speaker:null,text:'（阿勳打出全倒。那時沒有人在看。）'},
      {choice:[{text:'「這件妳穿太大了。」',goto:'a'},{text:'「那我穿妳的？」',goto:'b'},{text:'（拿起手機拍照）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'（甩了一下太長的袖子）剛好。'},{goto:'end'},
      {label:'b'},{speaker:'econ_pinyu',text:'她的你穿不下。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'laugh',text:'（比了一個勝利手勢）拍好看一點喔。'},
      {label:'end'},{speaker:null,text:'（打完第三局，她還穿著。）'},{speaker:'kexin',expression:'smile',text:'洗好再還你。'},   /* AA_303 第 2 節 3：整晚穿著不還（三個選項都接）*/
      {speaker:'econ_zhengxun',text:'（收球的時候）全倒沒人看到。下次跟你單挑，你要看。'},   /* AA_305 第 3 節 */
      {speaker:null,text:'手機裡多了一張照片。她穿著你的高中制服，袖子太長，正在比一個勝利手勢。'} ] },
  /* E17 校慶園遊會：經濟系的拍賣攤（BB_104 8b-9；AA_154 第 127 行、A36）：分兩段。
     前半＝11/8（五）19:00 社科院系學會辦公室備料（2D 出遊到 21:00；12:30 群組約＋出發選單，story3d.js）；
     後半＝11/9（六）10:00～16:00 走到椰林的經濟系攤位（帳篷，zones3d.js isFairDay）。前一晚沒去也演後半（開頭換成白板那句＋「你昨天沒來，所以今天你喊。」，BB-B 定稿 AA_154 76eed22b）。兩天都沒去＝18:00 群組照片 */
  { id:'ev_y0_e17a', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'備料', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'社科院・系學會辦公室',bg:'soc_office'},
      {speaker:'econ_pinyu',text:'珍奶一杯成本二十八。要賣多少？'},
      {speaker:'kexin',expression:'neutral',text:'不定價。用荷蘭式拍賣：從一百往下喊，有人說要就成交。'},
      {speaker:'econ_zhengxun',text:'……第一杯會賣得很貴。'},
      {speaker:'kexin',expression:'smile',text:'對。那是給最想喝的人。'} ] },
  { id:'ev_y0_e17', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'經濟系的拍賣攤', participants:['econ_pinyu','kexin'], location:'campus', near:{x:-3,z:14,r:20}, trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[6], time:[10,16], once:true, background:'blur',
    dialogue:[ {if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_e17a)},speaker:null,text:'（校慶當天。攤位前排了人。可昕把擴音器交給你。）'},
      {if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_e17a)},speaker:'kexin',expression:'teasing',text:'你喊。從一百開始。'},
      {unless:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_e17a)},speaker:null,text:'（校慶當天。經濟系的攤位前排了人。白板上寫著：珍奶，荷蘭式拍賣，從一百往下喊。）'},
      {unless:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_y0_e17a)},speaker:'kexin',expression:'teasing',text:'你昨天沒來，所以今天你喊。從一百開始。'},
      {choice:[{text:'一百、九十、八十……',goto:'a'},{text:'一百、五十！',goto:'b'},{text:'交給可昕喊',goto:'c'}]},
      {label:'a'},{speaker:null,text:'第一杯在七十元成交。'},{speaker:'econ_pinyu',text:'比成本多四十二。很好。'},{goto:'end'},
      {label:'b'},{speaker:'econ_pinyu',text:'你少賺了四十九元。'},{speaker:'kexin',expression:'laugh',text:'可是大家笑了。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'她喊得像在拍賣名畫。第一杯九十五元，買的人是唐睿。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(1); } },
  /* E15 經濟系宿營（BB_104 8b-7；AA_154 第 130 行；可以錯過）：11/22（五）12:00 社科院門口集合（出發選單，story3d.js；邀約句不另寫：30 分鐘版不演這一場，AA_355 第 3 節）→ 山邊的青年活動中心，三天兩夜，11/24（日）16:00 回學校。
     第三小隊（祐廷、可昕、阿勳、韋綸，小隊輔家豪學長）。去了：字卡＋CG＋三句旁白（AA_154 A54）。沒去：週日群組大合照＋阿勳私訊 */
  { id:'ev_y0_e15', stage:'econ', title:'經濟系宿營', participants:['econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:1/60,   /* hours：OUT.go 演完還會往後推（0 會被當成 2 小時）；afterOuting 已經把時間放到週日 16:00 */
    dialogue:[ {titleCard:'11 月 22 日～24 日',sub:'經濟系宿營'},{scene:'青年活動中心',bg:'econ_camp'},{cg:'cg_econ_camp'},   /* AA_154 A54（使用者 10-16 23:4x：經濟系的宿營用 CG 帶過）：字卡 → CG（七個人自己拍的合照，BB-B BCG-47，使用者通過）→ 三句旁白；夜遊三選一、寢室冷笑話拿掉 */
      {speaker:null,text:'（經濟系的宿營，山邊的青年活動中心。第三小隊：你、可昕、阿勳、韋綸，小隊輔是家豪學長。）'},
      {speaker:null,text:'（三天裡，夜遊只有一支手電筒，大地遊戲你們拿了倒數第二。）'},   /* AA_305 第 1 節：「晚會上唐睿演了一條需求曲線」拿掉 */
      {speaker:null,text:'（週日早上，你們七個在活動中心門口自己拍了一張合照。）'} ],
    afterOuting:(G,GM,q)=>{ if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,q.day+2,16); G.flags.E15_WENT=true; } },
  /* E18 即興劇社的小公演（BB_104 8b-10；AA_154 第 131 行、A36；可以錯過）：11/28 21:00 可昕私訊（有 Y0_EXTRA＝唐睿私訊臨時演員六點半到）＋出發選單「博雅 19:00：即興劇小公演」（story3d.js）。
     A36 寫「走進借用教室就演」（3D）；博雅還沒有指定的借用教室，C1 也是 2D，所以先用 2D 出遊（背景 classroom_small）。她接的是 IMPROV_LINE，沒有就 E12_ANSWER。沒去：隔天唐睿傳影片 */
  { id:'ev_y0_e18', retired:'AA_293 第 1 節（使用者 10-18 選擇題：劇社的戲拿掉），定義留給已經演過的舊存檔', stage:'econ', title:'即興劇小公演', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'博雅・借用的教室',bg:'classroom_small'},
      {if:{flags:['Y0_EXTRA']},speaker:null,text:'你在台上演一棵樹，站在台邊不動。'},
      {speaker:null,text:'（四十張椅子。燈關掉，只開講台的燈。）'},
      {speaker:'唐睿',text:'（主持）接下來，請觀眾給我們一句台詞！'},
      {unless:{flags:['Y0_EXTRA']},speaker:null,text:'（很多人在喊。可昕在台上看著觀眾席，指了你。）'},
      {unless:{flags:['Y0_EXTRA']},speaker:'kexin',expression:'teasing',text:'那個人剛剛說的那一句。'},
      {if:{flags:['Y0_EXTRA']},speaker:'kexin',expression:'teasing',text:'（指著台邊的你）那棵樹剛剛偷偷說的那一句。'},
      {if:{flagIs:{IMPROV_LINE:'而且你迷路的地方是公館。'}},speaker:'kexin',expression:'smile',text:'迷路的企鵝到了公館，排隊吃豆花。排到的時候，牠不想回南極了。'},
      {if:{flagIs:{IMPROV_LINE:'而且我是來接你的計程車。'}},speaker:'kexin',expression:'smile',text:'計程車停在企鵝旁邊。司機說：『南極？跳表要算到明年。』'},
      {if:{flagIs:{IMPROV_LINE:'而且……你欠我錢。'}},speaker:'kexin',expression:'smile',text:'企鵝欠了一筆錢。牠說：『我用冰塊還。』債主說：『冰塊會融。』'},
      {if:{custom:G=>!G.flags.IMPROV_LINE&&G.flags.E12_ANSWER==='chair'},speaker:'kexin',expression:'smile',text:'全校只有一張有洞的椅子。今天，它終於等到主人了。'},
      {if:{custom:G=>!G.flags.IMPROV_LINE&&G.flags.E12_ANSWER==='hand'},speaker:'kexin',expression:'smile',text:'我多了一條尾巴。旁邊的人多了一隻手，專門幫我拿尾巴。'},
      {if:{custom:G=>!G.flags.IMPROV_LINE&&G.flags.E12_ANSWER==='cat'},speaker:'kexin',expression:'smile',text:'這條尾巴不是貓的。貓的太常見了。今天它負責趕蒼蠅。'},
      {if:{flags:['Y0_EXTRA']},speaker:'唐睿',text:'你是今天最好的一棵樹。'},
      {speaker:'唐睿',text:'（散場後）你那句很好接。……你們排練過？'},
      {choice:[{text:'「沒有。」',goto:'a'},{text:'「她很會接。」',goto:'b'},{text:'（只是笑）',goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'那更可怕。'},{goto:'end'},
      {label:'b'},{speaker:'唐睿',text:'她什麼都接得住。……你上次那顆直球也是。'},   /* AA_224 3-3：車上那一段，唐睿是後來聽說的 */{goto:'end'},
      {label:'c'},{speaker:'唐睿',text:'好啦，我不問了。'},
      {label:'end'} ] },
  /* E18a 豆花（AA_224 3-4 @31708531；原本 BB_104 8b-11a）：12/3（二）21:30 可昕私訊兩則＋出發選單「總圖門口 22:00」（story3d.js）；他不能進總圖，在門口演，接著公館的豆花店。
     已經在交往（不是第一次兩個人吃宵夜）。記 E18A_DOUHUA（法律系 4/24 她的生日那一句讀它）。沒去不記 */
  { id:'ev_y0_e18a', stage:'econ', title:'豆花', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'總圖門口',bg:'library_gate_night'},{speaker:null,text:'（總圖門口。十點，她是最後幾個出來的。）'},
      {speaker:'kexin',expression:'smile',text:'你真的來了。休學的人很閒耶。'},
      {scene:'公館・豆花店',bg:'gongguan_douhua'},{speaker:null,text:'（公館的豆花店，兩碗。）'},
      {speaker:'kexin',expression:'neutral',text:'你沒休學的話，現在會在裡面陪我讀嗎？'},
      {speaker:'kexin',expression:'smile',text:'……不要回答。豆花要冷了。'},
      {choice:[{text:'「會。坐妳對面，一直睡。」',goto:'a'},{text:'「不會。我會在宿舍睡覺。」',goto:'b'},{text:'（吃豆花，不回答）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'好答案。很像你。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'neutral',text:'……誠實。所以要謝謝你休學。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'teasing',text:'你很會不回答。這是一種才能。'},
      {label:'end'},{set:{E18A_DOUHUA:true}} ] },
  /* E16 經濟學原理的分組報告：囚犯困境（BB_104 8b-8；AA_154 第 133、134 行）：第 15 週（12/9）經原下課在博雅小桌分工（E16_ROLE：slides／report／stage）；
     第 16 週（12/16）經原那堂上台報告（角色那一句＋報告結束＋魏教授）。寫報告的玩家 12/15 23:00 可昕私訊兩則（story3d.js）。第 16 週翹課＝品妤群組一句、E16_ROLE:'absent' */
  { id:'ev_y0_e16a', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'分組', participants:['econ_pinyu','kexin'], location:'any', trigger:'class', afterClass:'econ_principles_y0', term:['Y0S1'], weeks:[15], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（第 15 週，經原教到囚犯困境。下課後，四個人在博雅的小桌子。）'},
      {speaker:'econ_pinyu',text:'下週上台：囚犯困境。我們分一下工。'},
      {speaker:'韋綸',text:'我負責……（手機響了）我先接一下。'},
      {speaker:null,text:'（韋綸消失了。）'},
      {speaker:'kexin',expression:'neutral',text:'好。我們來設計一個機制：最晚交的人，請宵夜。'},
      {speaker:'econ_pinyu',text:'重複賽局。很好，我喜歡。'},
      {speaker:'kexin',expression:'neutral',text:'（看你）你要做哪一塊？'},
      {choice:[{text:'做簡報',set:{E16_ROLE:'slides'}},{text:'寫報告',set:{E16_ROLE:'report'}},{text:'上台',set:{E16_ROLE:'stage'}}]} ] },
  { id:'ev_y0_e16b', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'分組報告', participants:['kexin'], location:'any', trigger:'class', afterClass:'econ_principles_y0', term:['Y0S1'], weeks:[16], once:true, background:'blur',
    dialogue:[ {if:{flagIs:{E16_ROLE:'report'}},speaker:null,text:'韋綸那段由你補。'},
      {if:{flagIs:{E16_ROLE:'slides'}},speaker:null,text:'簡報最後一頁，可昕偷放了一隻長頸鹿。脖子畫太短了。'},
      {if:{flagIs:{E16_ROLE:'stage'}},speaker:null,text:'魏教授問了最難的一題。台下的可昕比了一個「慢慢來」。'},
      {speaker:null,text:'（報告結束。韋綸最晚交，請了大家宵夜。）'},
      {speaker:'魏教授',text:'（看完簡報）這一組四個人，只有一個背叛。比例不錯。'} ] },
  /* E20 聖誕交換禮物（BB_153，AA-B 核對通過、數值定案；AA_154 第 137 行、A36）：12/23 21:00 品妤群組、12/25 17:00 韋綸＋品妤（story3d.js）、出發選單 12/25 19:00 公館火鍋（15 分鐘沒出發＝沒去）。
     公館沒有 3D 的火鍋店，照 A36 用 2D 出遊；去了錢 −500（禮物 200＋火鍋 300）、品妤阿勳 +1、可昕自在 +2（韋綸、唐睿還沒有人物資料）。拿到哪一個禮物不記。
     GIRAFFE_KEYCHAIN 去不去都一定拿到：沒去＝12/26 第一次經過社科院門口（ev_y0_e20b），18:00 以前沒經過＝20:00 私訊、隔天早上拿到 */
  { id:'ev_y0_e20', stage:'econ', title:'聖誕交換禮物', participants:['econ_pinyu','econ_zhengxun'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
      {speaker:null,text:'十二月二十五日，晚上七點。放寒假第三天，大家都還沒回家。'},
      {speaker:null,text:'公館的火鍋店。品妤訂的位子，剛好六個人。'},
      {speaker:'econ_pinyu',text:'（脫掉補習班的外套）湯底我點好了，可以續三次。'},
      {speaker:'唐睿',text:'先交換禮物再吃，不然韋綸會先吃完。'},
      {speaker:'韋綸',text:'（已經在下肉）我只是先試一下湯。'},
      {speaker:null,text:'桌子中間疊著六個包好的禮物。你帶的是一盒暖暖包。'},
      {speaker:'econ_pinyu',text:'抽籤太慢。一個人拿一個，看形狀猜。不能拿自己的。'},
      {choice:[{text:'「扁扁的、方方的那個。」',set:{_e20g:'book'},goto:'g1'},{text:'「小小一盒、會沙沙響的那個。」',set:{_e20g:'cards'},goto:'g2'},{text:'「圓圓的、一搖就響的那個。」',set:{_e20g:'bell'},goto:'g3'}]},
      {label:'g1'},{speaker:'econ_pinyu',text:'記帳本。每一筆都要記，今天的火鍋也算。'},{speaker:'econ_pinyu',text:'第一頁的格子我畫好了。'},{goto:'warm'},
      {label:'g2'},{speaker:'econ_zhengxun',text:'撲克牌。寒假教你算牌。'},{goto:'warm'},
      {label:'g3'},{speaker:'韋綸',text:'腳踏車鈴！裝上去，騎車的時候一直按！'},{speaker:'韋綸',text:'我自己的上個月掉了，所以買了兩個。'},
      {label:'warm'},{speaker:'econ_pinyu',text:'（拆開）暖暖包。十二包？'},
      {speaker:'econ_pinyu',text:'我收下了。'},
      {unless:{flagIs:{_e20g:'book'}},speaker:null,text:'（記帳本在唐睿手上。他翻了兩頁，收進背包。）'},
      {speaker:null,text:'阿勳拆開他的，是可昕的禮物。一隻小小的長頸鹿鑰匙圈，脖子短短的。'},
      {speaker:'kexin',expression:'neutral',text:'買的時候就這樣。不是我弄斷的。'},
      {speaker:'econ_zhengxun',text:'我掛在檯燈上。'},
      {speaker:null,text:'湯續到第三次，大家都說吃不下了。韋綸又點了一盤肉。'},
      {scene:'火鍋店門口',bg:'hotpot_door'},
      {speaker:'kexin',expression:'neutral',text:'欸。這個。'},
      {speaker:null,text:'她把一隻一模一樣的長頸鹿，塞進你手裡。'},
      {speaker:'kexin',expression:'smile',text:'本來就兩隻一組。'},
      {speaker:null,text:'你把它掛在家裡的鑰匙上。'},
      {speaker:'econ_pinyu',text:'好，解散。到了在群組講一聲。'},
      {set:{GIRAFFE_KEYCHAIN:true,_e20g:null}},{rel:{econ_pinyu:{fam:1},econ_zhengxun:{fam:1},kexin:{comf:2}}} ],
    afterOuting:(G,GM)=>{ if(GM.money) GM.money(-500); } },
  /* E20b（AA_224 3-5）：他不在社科院門口出現了——12/26～12/28 第一次走進公館就演（她在捷運出口等他）；12/28 20:00 以前沒去公館＝私訊、放家裡信箱（story3d.js）*/
  { id:'ev_y0_e20b', stage:'econ', title:'你的份', participants:['kexin'], location:'gongguan', trigger:'auto', once:true, background:'blur',   /* 16 週制：12/26～12/28 已經是寒假，學期條件拿掉（日子在 custom 裡）*/
    prereq:{custom:G=>{ if(G.flags.GIRAFFE_KEYCHAIN||(G.events&&G.events.done&&G.events.done.ev_y0_e20)||typeof STORY==='undefined') return false; const a=STORY.dayOfKey('2024-12-26'), b=STORY.dayOfKey('2024-12-28'); return a!=null&&G.day>=a&&(G.day<b||(G.day===b&&G.hour<20)); }},
    dialogue:[ {scene:'公館・捷運出口',bg:false},{speaker:'kexin',expression:'neutral',text:'你昨天沒來。'},
      {speaker:null,text:'她把一個小東西塞進你手裡。一隻長頸鹿鑰匙圈，脖子短短的。'},
      {speaker:'kexin',expression:'smile',text:'你的份。'},
      {set:{GIRAFFE_KEYCHAIN:true}} ] },
  /* C2 祐廷自己的社團（BB_110 第 3 節；AA_154 第 123 行、A7、A37）：照 E07 選的社團（Y0_CLUB），第 10 週社課當天 12:30 社團群組一則＋出發選單（story3d.js）。
     吉他社 11/4（一）19:00 萬才館一樓（3D：走進萬才館就演，出發選單帶到門口）；登山社 11/5（二）19:00 行前會（2D 出遊）；羽球社 11/7（四）19:00 新體一樓（3D）。
     「不參加」＝11/5 21:00 唐睿私訊問要不要當臨時演員（Y0_EXTRA，E18 讀它）。15 分鐘沒到＝沒去，沒有沒去版 */
  { id:'ev_y0_c2_guitar', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，C2 刪除（不提前到 10/17 以前，AA_355 第 3 節）。定義留給已經演過的舊存檔', stage:'econ', title:'吉他社的第一堂', participants:[], location:'wancai', trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[1], time:[18.75,19.25], once:true, background:'blur',
    prereq:{custom:G=>G.flags.Y0_CLUB==='guitar'},
    dialogue:[ {speaker:'吉他社社長',text:'今天只教一個和弦。C。三根手指，按到聲音乾淨為止。'},
      {speaker:'player',text:'（彈）……'},
      {speaker:'吉他社社長',text:'很好。這是 C 和弦的遠房親戚。'},
      {speaker:'韋綸',text:'（從門口探頭）吉他社！走啦，騎腳踏車！'},
      {speaker:'吉他社社長',text:'他是誰？'},
      {speaker:'player',text:'……我們系的。'},
      {choice:[{text:'留下來練到按出來',set:{Y0_GUITAR_C:true},goto:'a'},{text:'跟韋綸去騎腳踏車',goto:'b'},{text:'問社長：「怎麼知道自己適不適合？」',goto:'c'}]},
      {label:'a'},{speaker:'吉他社社長',text:'好。你是今天最晚走的人。'},{goto:'end'},
      {label:'b'},{speaker:'吉他社社長',text:'下次再來。C 和弦不會跑。'},{goto:'end'},
      {label:'c'},{speaker:'吉他社社長',text:'按三個月就知道了。我按了三年，還不知道。'},
      {label:'end'} ],
    after:(G,GM)=>{ GM.advance(1.5); } },
  { id:'ev_y0_c2_hiking', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，C2 刪除（不提前到 10/17 以前，AA_355 第 3 節）。定義留給已經演過的舊存檔', stage:'econ', title:'登山社的行前會', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'登山社・行前會'},
      {speaker:'學長',text:'背包裡最重要的是什麼？'},
      {speaker:null,text:'大家說水、外套、手電筒。'},
      {speaker:'學長',text:'垃圾袋。'} ] },
  { id:'ev_y0_c2_badminton', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，C2 刪除（不提前到 10/17 以前，AA_355 第 3 節）。定義留給已經演過的舊存檔', stage:'econ', title:'羽球社的第一次', participants:[], location:'gym', trigger:'auto', term:['Y0S1'], weeks:[10], weekday:[4], time:[18.75,19.25], once:true, background:'blur',
    prereq:{custom:G=>G.flags.Y0_CLUB==='badminton'},
    dialogue:[ {speaker:'學姊',text:'羽球最重要的是，不要打到自己的頭。'},
      {speaker:null,text:'三分鐘後，你打到自己的頭。'} ],
    after:(G,GM)=>{ GM.advance(1.5); } },
  /* E22 期末考週（BB_104 8b-13；AA_154 A38）：12/22（日）20:00 經濟系群組（韋綸、品妤，BB-B 草稿、AA-B 照用）＋出發選單「總圖 B1 22:00：期末通宵」（story3d.js）。
     總圖 B1 的 24 小時自習室還沒有 3D：2D 出遊（底圖 ntu_lib_b1，BB-B d4540129）。01:00 演；02:00 收東西回宿舍、晚歸登記。隔天 12/23 是經原期末考。沒去：01:00 群組照片 */
  { id:'ev_y0_e22', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'期末通宵', participants:['econ_pinyu','econ_zhengxun','kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1/60,
    beforeOuting:(G,GM)=>{ if(G.hour<25) GM.advance(25-G.hour); },
    dialogue:[ {scene:'總圖 B1・24 小時自習室',bg:'ntu_lib_b1'},
      {speaker:null,text:'（凌晨一點，總圖 B1 的自習室。整排的桌子都有人，只聽得到翻頁和鍵盤的聲音。）'},
      {speaker:'econ_pinyu',text:'（看你和可昕交換的筆記）你們兩個的筆記，經濟效益是零。'},
      {speaker:'econ_pinyu',text:'一個畫長頸鹿，一個畫箭頭。'},
      {speaker:'kexin',expression:'neutral',text:'箭頭是重點。'},
      {speaker:'econ_pinyu',text:'箭頭指向長頸鹿。'},
      {speaker:'econ_zhengxun',text:'（沒抬頭）第七章會考。第八章不會。'},
      {speaker:'韋綸',text:'你怎麼知道？'},
      {speaker:'econ_zhengxun',text:'……機率。'},
      {choice:[{text:'相信阿勳，讀第七章',goto:'a'},{text:'兩章都讀',goto:'b'},{text:'去買宵夜給大家',goto:'c'}]},
      {label:'a'},{speaker:null,text:'考出來了。阿勳只說：「機率。」'},{goto:'end'},
      {label:'b'},{speaker:null,text:'第八章沒考。'},{speaker:'kexin',expression:'smile',text:'你的保險買太多了。'},{goto:'end'},
      {label:'c'},{speaker:'econ_pinyu',text:'這是今晚唯一有效率的事。'},
      {label:'end'},{speaker:null,text:'（兩點，大家收東西。你走回宿舍，在舍監室登記晚歸。）'} ],
    afterOuting:async(G,GM)=>{ if(G.hour<26) GM.advance(26-G.hour); if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); } },
  /* E21a 跨年（AA_224 3-6 @31708531，交往中的版本；16 週制 12/31 已經放假九天，不提會計考試、改講他的書：AA-C 2026-10-17 定稿，AA_235 5-6）：12/31（二）19:00 經濟系群組四則（多一則韋綸「祐廷你在家讀你的。十一點來總圖門口接我們。」，story3d.js）＋出發選單「總圖門口 23:00：跨年」。
     他不能進總圖：在門口接他們。記 E21A_WENT。演完回家。沒去：00:05 群組人潮照片＋可昕私訊 */
  { id:'ev_y0_e21a', stage:'econ', title:'跨年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'市府站・出口',bg:'newyear_crowd'},{speaker:null,text:'（十一點，市府站。人已經多到要排隊出站。）'},
      {speaker:'韋綸',text:'跨年還有一個小時。走啦！'},
      {speaker:'econ_pinyu',text:'人好多。'},
      {speaker:'唐睿',text:'我查過了，平常走過去十五分鐘。今天要四十。'},{speaker:'韋綸',text:'那現在走剛好！'},
      {scene:'信義區',bg:'newyear_crowd'},
      {speaker:null,text:'（唐睿一直站在品妤後面，幫她擋人。品妤沒有發現。）'},   /* AA_305 第 8 節（接 9/21 系烤唐睿那頂柚子帽）*/
      {speaker:null,text:'（信義區的人潮。可昕把手塞進你的外套口袋。）'},   /* AA_303 第 2 節 13：倒數完說新年快樂就好（「我怕走散」和兩選一拿掉）*/
      {speaker:null,text:'（倒數。煙火。大家一起喊：「新年快樂！」）'},
      {speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {speaker:'player',text:'新年快樂。'},
      {set:{E21A_WENT:true}} ] },
  /* E22b 法律入門書（AA_224 3-7 @31708531）：不綁期末、不在總圖——2024-12-20（五）17:00，12/13 補習班以後；出發選單「公館 17:00：等可昕下課」（公館的咖啡店，2D；story3d.js）。
     書是家附近的市立圖書館借的；畫面不出現書名。E22B_TOLD：true（「我想考。」）／false（「先看看而已。」）；沒去不記（E27 讀它）*/
  { id:'ev_y0_e22b', stage:'econ', title:'法律入門書', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館・咖啡店',bg:'gongguan'},
      {speaker:null,text:'（家附近的市立圖書館借的。法律入門書。你在公館的咖啡店等她下課，翻到第三章。）'},
      {speaker:null,text:'（她坐下來，看了一眼封面。）'},
      {speaker:'kexin',expression:'neutral',text:'……你上禮拜說「還不知道」。'},
      {choice:[{text:'「我想考。」',set:{E22B_TOLD:true},goto:'t'},{text:'「先看看而已。」',set:{E22B_TOLD:false},goto:'f'}]},
      {label:'t'},{speaker:'kexin',expression:'smile',text:'……好。我不問了。等你想說完整的再說。'},{goto:'end'},
      {label:'f'},{speaker:'kexin',expression:'neutral',text:'先看看的書，你拿得很緊。'},{speaker:null,text:'（她沒有再問。）'},
      {label:'end'} ] },
  /* ★E19 誤會（BB_104 8-6、第 3-1 節 E19 那一列；AA_154 第 139 行、A33、A34；固定核心）：1/2（四）會計考完，群組韋綸約（story3d.js）＋出發選單 19:00；19:15 沒出發＝韋綸打電話直接進出遊。
     E19_ASK：direct／joke／none（E25、E28 讀它）。開頭三句旁白與品妤那句取自 BB_104 第 3-1 節 E19 那一列的描述（等 BB-B 確認或給定稿）；不問的版本她之後傳一則（story3d.js） */
  { id:'ev_y0_e19', retired:'AA_224 1-3（LIFE-LINE，2026-10-17）：「以為她喜歡唐睿」併進 10/17 車上（ev_y0_e26），寒假前的聚餐不再單獨演。定義留給已經演過的舊存檔', stage:'econ', title:'誤會', participants:['econ_pinyu','kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'公館'},
      {speaker:null,text:'（公館的聚餐。考完了，桌上的菜一盤一盤上來。）'},   /* 開頭：BB-B 定稿（BB_104，6d59df01）*/
      {speaker:null,text:'（可昕和唐睿聊劇社，聊到整桌都在聽。唐睿學了一段即興，她笑到筷子掉了。）'},
      {speaker:'econ_pinyu',text:'（夾菜，沒有看你）可昕說她喜歡很會講話的人。'},
      {speaker:'econ_pinyu',text:'……我只是轉述。'},
      {speaker:null,text:'（九點多，唐睿說明天一早要排練，先走了。）'},
      {choice:[{text:'「妳是不是喜歡唐睿？」',set:{E19_ASK:'direct'},goto:'d'},{text:'「唐睿很會講話喔。」',set:{E19_ASK:'joke'},goto:'j'},{text:'（什麼都不問）',set:{E19_ASK:'none'},goto:'n'}]},
      {label:'d'},{speaker:'kexin',expression:'neutral',text:'……你覺得呢？'},
      {speaker:'player',text:'我在問妳。'},
      {speaker:'kexin',expression:'serious',text:'……不是唐睿。'},
      {speaker:'player',text:'那——'},
      {speaker:'kexin',expression:'neutral',text:'（她自己站起來）我要趕捷運了。寒假快樂。'},
      {speaker:null,text:'誤會解開了一半。另一半，你沒有問。'},{goto:'end'},
      {label:'j'},{speaker:'kexin',expression:'annoyed',text:'對啊。比某些人會。'},{goto:'end'},
      {label:'n'},
      {label:'end'} ] },
  /* A2 室友的抽屜（BB_112 A2；AA_154 第 140 行、A14）：1/5（日）20:00 以後在宿舍房間，收行李回家過寒假之前；E22b 發生過（E22B_TOLD 有值）。
     「我可能會想很久。」記 XUN_KNEW（E24c 阿勳那句換）。沒有 E22b 就沒有 */
  { id:'ev_y0_a2', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'室友的抽屜', participants:['econ_zhengxun'], location:'dorm', trigger:'auto', term:['Y0S1'], weeks:[18], weekday:[0], time:[20,23.5], once:true, background:'blur',
    prereq:{custom:G=>G.flags.E22B_TOLD!==undefined&&G.flags.E22B_TOLD!==null},
    dialogue:[ {speaker:'econ_zhengxun',text:'（拿起他桌上的書）《法學入門》。'},
      {speaker:'econ_zhengxun',text:'你讀這本的表情，跟我讀經原一樣。'},
      {speaker:'player',text:'……什麼表情？'},
      {speaker:'econ_zhengxun',text:'好像找到東西了。'},
      {choice:[{text:'「只是好奇。」',goto:'a'},{text:'「我可能會想很久。」',set:{XUN_KNEW:true},goto:'b'},{text:'（不說話，把書收起來）',goto:'c'}]},
      {label:'a'},{speaker:'econ_zhengxun',text:'好。'},{speaker:null,text:'他把書放回去，放得很正。'},{goto:'end'},
      {label:'b'},{speaker:'econ_zhengxun',text:'那就想很久。我在。'},{goto:'end'},
      {label:'c'},{speaker:'econ_zhengxun',text:'你收書的速度，也是。'},{speaker:null,text:'他笑了一下，沒有再問。'},
      {label:'end'} ] },
  /* L5a 長頸鹿拉花（BB_110 L5a；AA_154 A8、A42）：只有 10/12（六）：10/11（五）21:00 經濟系群組可昕約＋出發選單「兩點半 Café 14:00」（14:15 還沒到＝沒去；story3d.js）；
     13:45～14:15 走進 Café 就演。店員是芷若（外文一、剛開始打工）：事件把她放到櫃台，名字只顯示「店員」，不自我介紹、不記 FIRST_MET、不給聯絡方式（法律系 Z1 才算第一次說話）。
     玩家點什麼記 Y0_CAFE_ORDER（熱拿鐵／冰美式／熱可可；Z1 的回聲之後做）。沒去＝10/12 16:00 群組品妤的照片＋可昕一句（story3d.js）*/
  { id:'ev_y0_l5a', stage:'econ', title:'長頸鹿拉花', participants:['kexin'], location:'cafe', trigger:'auto', term:['Y0S1'], weeks:[6], weekday:[6], time:[13.75,14.8], once:true, background:'blur',   /* 出發選單開到 14:15、從家裡要 30 分鐘：到店最晚約 14:45（BB_214 第 4 節）*/
    spawn:{npc:'heroine_02',at:{x:-2.5,z:-5.15},pose:'idle'}, despawn:3, hideClerks:true,   /* 吧檯只留芷若；店員那兩句用芷若的立繪、名字照樣「店員」（使用者 10-18：「咖啡店的店員你放到唐睿」——原本店員沒有立繪，畫面留著上一句唐睿的；BUG-LATTE-CLERK-1018）*/
    dialogue:[ {speaker:null,text:'（溫州街的 Café。可昕說這間的拉花會畫長頸鹿，拉了大家來驗證。）'},{speaker:null,text:'店員是一個戴眼鏡的女生。她把每個人點的寫在一張小紙上。'},
      {choice:[{text:'熱拿鐵',set:{Y0_CAFE_ORDER:'熱拿鐵'}},{text:'冰美式',set:{Y0_CAFE_ORDER:'冰美式'}},{text:'熱可可',set:{Y0_CAFE_ORDER:'熱可可'}}]},
      {speaker:'kexin',expression:'smile',text:'可以畫長頸鹿嗎？'},{speaker:null,text:'她想了一下。'},{speaker:'heroine_02',name:'店員',text:'……我試試看。'},
      {speaker:null,text:'畫出來的長頸鹿脖子很短。'},{speaker:'唐睿',text:'這是馬。'},{speaker:'heroine_02',name:'店員',text:'這是很努力的長頸鹿。'},
      {speaker:null,text:'可昕笑到把湯匙掉在地上。'} ] },
  /* T2 唐睿的練習（BB_112 T2；AA_154 第 127 行）：Y0S1 第 10～13 週週一經濟學原理真的上完，走出教室時唐睿在隔壁借用的劇社教室叫住你（afterClass，每次 50%，一次；E18 11/29 以後不再觸發；STORY.t2Due）。
     沒玩過 T1（沒有 KNOWS_TANG）的玩家，唐睿說漏嘴那一句接在第一句後面（位置待 BB-B 確認）；演完都記 KNOWS_TANG；「繼續演品妤」＝TANG_REHEARSAL（大四 4-2① 的回聲）*/
  { id:'ev_y0_t2', retired:'AA_218 第 11 節、AA_154 0b-2（2026-10-17）：祐廷 2024-10-17 休學，這件刪除。定義留給已經演過的舊存檔', stage:'econ', title:'唐睿的練習', participants:[], location:'any', trigger:'class', afterClass:'econ_principles_y0', term:['Y0S1'], weeks:[10,11,12,13], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.t2Due&&STORY.t2Due(G)},
    dialogue:[ {speaker:'唐睿',text:'你來得剛好。站那裡。你是品妤。'},
      {unless:{flags:['KNOWS_TANG']},speaker:'唐睿',text:'……不對，你忘記我剛剛說的。'},
      {speaker:'player',text:'……我是誰？'},{speaker:'唐睿',text:'即興。你現在是品妤。我要練習。'},{speaker:'唐睿',text:'（深呼吸）品妤，我想跟妳說一件事——'},
      {speaker:'econ_pinyu',text:'（從門口探頭）你們在演什麼？'},{speaker:'唐睿',text:'……即興劇。主題是「一個人和他的影子」。'},{speaker:'econ_pinyu',text:'你的影子比較高。'},
      {leave:'econ_pinyu'},{speaker:null,text:'（品妤走了。）'},{speaker:'唐睿',text:'……她說我比較矮。'},
      {choice:[{text:'「你可以直接跟她說。」',goto:'a'},{text:'「我覺得她知道。」',goto:'b'},{text:'（繼續演品妤）「你想說什麼？」',goto:'c'}]},
      {label:'a'},{speaker:'唐睿',text:'直接？直接不是即興。直接是……直接。'},{speaker:null,text:'他想了很久。'},{speaker:'唐睿',text:'我再練一下。'},{goto:'end'},
      {label:'b'},{speaker:'唐睿',text:'真的？'},{speaker:'player',text:'假的。'},{speaker:'唐睿',text:'……你好壞。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'唐睿愣住，然後笑了。'},{speaker:'唐睿',text:'……我忘詞了。即興的人也會忘詞。'},{set:{TANG_REHEARSAL:true}},
      {label:'end'},{set:{KNOWS_TANG:true}} ] },
  /* P2b 門口有人在揪（AA_154 2-5a；台詞 BB_105 P2b，BB-B 定稿 6d59df01；背景、可重複）：P2 演過以後，Y0S1 第 6～16 週（期中考週除外）、Y0S2 第 1～5 週的週四，初等會計真的上完；
     每週擲一次 40%、同一週最多一次；那天已經約了別的出遊不揪（STORY.p2bDue）。韋綸一句（4 句輪流、不連續重複）→「跟去。」／「今天先回去。」（韋綸「那下次！」）。
     跟去＝旁白（5 句輪流）＋經濟系朋友熟悉度各 +1；結束時間照類型（food 19:30、river 17:00、night 21:00／21:30，中間跳過；STORY.P2B_END）。
     river：11/7（W10 週四）固定是韋綸的腳踏車（AA_154 2-5b：那天一定揪、一定 river）；Y0S1 其他 river 的第一次接 L5b 牽著車的巷子（BB_110）；腳踏車演過以後散場接 E13③。
     E13 大家走了以後（BB_104 8b-6）：W10 起（含 Y0S2），那一類還沒演過，散場多一個選擇「先回去了。」／「（陪大家走到最後）」：food＝①公館的路口、night＝②女舍門口、river＝③河濱（STORY.p2bE13）。
     記 P2B_COUNT（跟去的次數）。錢、回宿舍在 after。放在事件表最後：同一堂會計課有固定事件（P1b 等）時先演固定的 */
  /* AA_272 第 13 節（d9aa4d9f）：改成經濟學原理下課（週一上午）、第 6～7 週（10/7、10/14），兩次都揪；P2 去成、和 P2 都選「今天先回去」的玩家都開（跟去＝照第一次聚會進「走啦」）。
     韋綸那句改「經原終於下課了。誰要出去？」（AA-C 2beb591f），四句照常輪替 */
  { id:'ev_y0_p2b', stage:'econ', title:'門口有人在揪', participants:['kexin'], location:'any', trigger:'class', afterClass:'econ_principles_y0', term:['Y0S1'], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.p2bDue&&STORY.p2bDue(G)},
    dialogue:[ {pick:{flag:'P2B_LN',from:G=>[0,1,2,3].filter(i=>i!==G.flags.P2B_LAST)}},
      {if:{flagIs:{P2B_LN:0}},speaker:'韋綸',text:'下課了！今天不要直接回宿舍啦。'},
      {if:{flagIs:{P2B_LN:1}},speaker:'韋綸',text:'經原終於下課了。誰要出去？'},
      {if:{flagIs:{P2B_LN:2}},speaker:'韋綸',text:'我問過了，大家都有空。……好啦，我還沒問。'},
      {if:{flagIs:{P2B_LN:3}},speaker:'韋綸',text:'我今天什麼都不想讀了。誰要跟？'},
      {choice:[{text:'「跟去。」',set:{P2B_GO:true},goto:'go'},{text:'「今天先回去。」',set:{P2B_GO:false},goto:'home'}]},
      {label:'home'},{speaker:'韋綸',text:'那下次！'},{goto:'end'},
      {label:'go'},{pick:{flag:'P2B_K',from:G=>[typeof STORY!=='undefined'&&STORY.p2bBikeNow&&STORY.p2bBikeNow(G)?1:(+G.flags.P2B_COUNT||0)%5]}},
      {if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.p2bBikeNow&&STORY.p2bBikeNow(G)},goto:'bike'},
      {if:{flagIs:{P2B_K:0}},speaker:null,text:'公館的滷味攤。可昕每一樣都夾一點，阿勳只夾豆干。品妤吃到一半先走了，要去打工。'},
      {if:{flagIs:{P2B_K:1}},speaker:null,text:'騎腳踏車到河濱。韋綸騎最前面，一直回頭喊『快一點！』，結果騎錯了一個出口。'},
      {if:{flagIs:{P2B_K:2}},speaker:null,text:'大家去總圖讀到九點。阿勳讀完了一章；韋綸睡著了一次，醒來說：『我在想事情。』'},
      {if:{flagIs:{P2B_K:3}},speaker:null,text:'先各自去讀書，晚上八點在公館夜市集合。唐睿一邊排隊一邊即興，前面的阿姨笑到忘了點餐。'},
      {if:{flagIs:{P2B_K:4}},speaker:null,text:'晚上在宿舍交誼廳打牌。阿勳說他不會，然後贏了五把。唐睿：『你不是說你不會？』'},
      {rel:{kexin:{fam:1},econ_zhengxun:{fam:1}}},{if:{custom:G=>[0,1].includes(G.flags.P2B_K)},rel:{econ_pinyu:{fam:1}}},   /* 品妤週四 18～22 打工（PY0-L2）：只有滷味（先走）、河濱在場才算（BB_179 第 4 節第 6 點）*/
      {advance:G=>typeof STORY!=='undefined'&&STORY.P2B_END?STORY.P2B_END[G.flags.P2B_K]-G.hour:0},
      {if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.p2bL5b&&STORY.p2bL5b(G)},goto:'l5b'},
      {label:'e13q'},
      {if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.p2bE13&&STORY.p2bE13(G)},choice:[{text:'「先回去了。」',goto:'end'},{text:'（陪大家走到最後）',set:{P2B_E13:true},goto:'e13'}]},
      {goto:'end'},
      {label:'l5b'},{scene:'溫州街'},{speaker:null,text:'溫州街的巷子太窄，腳踏車要牽著走。'},{speaker:'韋綸',text:'這條巷子很適合拍電影。'},{speaker:'econ_pinyu',text:'你又沒拍過電影。'},
      {choice:[{text:'「拍什麼？」',goto:'l5b_a'},{text:'「先找路出去」',goto:'l5b_b'}]},
      {label:'l5b_a'},{speaker:'韋綸',text:'騎腳踏車去淡水的那種！……結局我還沒想好。'},{goto:'l5b_end'},
      {label:'l5b_b'},{speaker:'econ_zhengxun',text:'（已經走到前面）這邊可以出去。'},
      {label:'l5b_end'},{set:{L5B_DONE:true}},{goto:'end'},   /* L5b：只是聊天，沒有旗標（L5B_DONE 只記演過）*/
      /* 韋綸的腳踏車（BB_112 第 3 節；祐廷的三句 AA_154 2-5b，BB-B 法律審查 7cf231c3）：11/7 的 river 換成這一段；去總圖查（三選一只差時間）＝時間前進一小時 */
      {label:'bike'},{scene:'椰林大道',bg:'ntu_avenue'},{speaker:'陌生人',text:'這台是我的。上個月被偷的。'},{speaker:'韋綸',text:'我上週在網路上買的！跟一個人買的！'},{speaker:'陌生人',text:'車架下面有我刻的字。你看。'},
      {speaker:null,text:'（真的有。）'},{speaker:'韋綸',text:'……{name}，你不是在看法律的書嗎？'},
      {scene:'總圖'},{choice:[{text:'「買賣」',goto:'bk1'},{text:'「所有權」',goto:'bk2'},{text:'「從目錄翻」',goto:'bk3'}]},
      {label:'bk1'},{speaker:null,text:'（翻了四十分鐘才繞到所有權那一章）'},{goto:'bk_found'},
      {label:'bk2'},{speaker:null,text:'（十五分鐘就找到）'},{goto:'bk_found'},
      {label:'bk3'},{speaker:null,text:'（半小時）'},
      {label:'bk_found'},{speaker:null,text:'你第一次知道，翻法律要先知道翻哪裡。'},{advance:1},
      {scene:'椰林大道',bg:'ntu_avenue'},{speaker:null,text:'你把查到的，用自己的話說了三件事。'},
      {speaker:'player',text:'被偷的東西，就算你是花錢買的，原主在被偷以後兩年內都可以要回去。'},   /* LEGAL_REVIEW_REQUIRED（這一句和下一句有法律內容；BB-B 審過 7cf231c3，改字要再審）*/
      {speaker:'player',text:'可是你可以去找賣你的人。他賣的不是自己的東西，要負責。對話和交易紀錄都留著。'},
      {speaker:'player',text:'先不要吵。跟他說清楚，大家留聯絡方式。要的話，一起去派出所。'},
      {speaker:'韋綸',text:'……所以我要還。'},{speaker:'player',text:'要還。可是你可以去找賣你的人。'},{speaker:'韋綸',text:'（看著車很久）好。走啦，陪我去派出所。'},{speaker:'陌生人',text:'……謝謝你們。很少人會這樣。'},
      {speaker:null,text:'答案不是韋綸想聽的。可是他知道下一步要做什麼了。'},
      {set:{WL_BIKE:true,BIKE_LOOKED_UP:true,WL_BIKE_SEEN:true}},{rel:{kexin:{fam:1},econ_pinyu:{fam:1},econ_zhengxun:{fam:1}}},{goto:'end'},
      {label:'e13'},{if:{flagIs:{P2B_K:0}},goto:'e13a'},{if:{flagIs:{P2B_K:1}},goto:'e13c'},{goto:'e13b'},
      {label:'e13a'},{scene:'公館的路口'},{speaker:'kexin',expression:'neutral',text:'紅燈九十秒。'},{speaker:'kexin',expression:'thinking',text:'……你等一下要回宿舍讀書嗎？'},
      {choice:[{text:'「要。期中快到了。」',goto:'a1'},{text:'「不想回去。」',goto:'a2'},{text:'「妳呢？」',goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'smile',text:'很實用。……很像你。'},{goto:'a_end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'我也是。'},{goto:'a_end'},
      {label:'a3'},{speaker:'kexin',expression:'thinking',text:'我要回去洗衣服。……你笑什麼。'},
      {label:'a_end'},{set:{E13_FOOD:true}},{goto:'end'},
      {label:'e13b'},{scene:'女舍門口',bg:'girls_dorm_gate'},{speaker:'kexin',expression:'neutral',text:'我到了。'},{speaker:'kexin',expression:'neutral',text:'你每次都最後一個走。'},{speaker:'kexin',expression:'smile',text:'……我發現了。只是沒說。'},
      {choice:[{text:'「順路而已。」',goto:'b1'},{text:'「我喜歡走路。」',goto:'b2'},{text:'（揮手）',goto:'b3'}]},
      {label:'b1'},{speaker:'kexin',expression:'smile',text:'男宿在另一邊。'},{goto:'b_end'},
      {label:'b2'},{speaker:'kexin',expression:'smile',text:'好。那下次走遠一點。'},{goto:'b_end'},
      {label:'b3'},{speaker:null,text:'她在門口也揮了一下，才進去。'},
      {label:'b_end'},{set:{E13_NIGHT:true}},{goto:'end'},
      {label:'e13c'},{scene:'河濱',bg:'riverside'},{speaker:'kexin',expression:'thinking',text:'你第一次在這裡騎車，是什麼時候？'},
      {choice:[{text:'「妳鏈子掉的那天。」',goto:'c1'},{text:'「國中。騎很慢。」',goto:'c2'},{text:'「妳先說。」',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'laugh',text:'那是我的第一次，不是你的。……好，聽你的。'},{goto:'c_end'},   /* AA_373 第 6-1 節（企劃線 bdab2f42）：「……好，算你贏。」改「……好，聽你的。」*/
      {label:'c2'},{speaker:'kexin',expression:'smile',text:'那你現在也很慢。'},{goto:'c_end'},
      {label:'c3'},{speaker:'kexin',expression:'smile',text:'上個月。鏈子掉的那次。'},
      {label:'c_end'},{set:{E13_RIVER:true}},
      {label:'end'} ],
    after:(G,GM)=>{ const F=G.flags; if(typeof STORY!=='undefined'&&STORY.p2bSeen) STORY.p2bSeen(G); else F.P2B_SEEN=true; if(F.P2B_LN!=null) F.P2B_LAST=F.P2B_LN;
      if(F.P2B_GO){ F.P2B_COUNT=(+F.P2B_COUNT||0)+1; if(F.P2B_K===0||F.P2B_K===3) GM.money(-Math.min(80,Math.max(0,G.money|0)));
        if(F.P2B_E13&&typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('invite:kexin');
        if(GM.enter){ if(G.hour%24>=20.5) GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); else if(G.zone!=='campus') GM.enter('campus',{x:15,z:-68.5,yaw:Math.PI/2}); } }
      F.P2B_GO=null; F.P2B_E13=null; F.P2B_K=null; } },
  /* D7（交接包 v3 第 8～9 週）：G1 考完走出教室（大二上版，AA_143 1-4）＋語彤事件 10 期中考那一週（AA_11 事件 10、AA_177 第 5 節）。
     G1：刑法分則期中考考完，在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'mid'）；有去考才有、翹考＝沒有；只有認識的人；考題只說「第三題」。
     語彤 10：大二上第 10 週起，週二或週四 20:45～21:15 在麵店（打烊的時候）、和語彤「朋友」以上；大二上沒遇到延到大二下，大二下結束還沒遇到＝不演。
       那週去過麵店、阿姨說過扭到手（yutong_hospital，大一下事件 4）的玩家第一句換一句；「我那週有注意到妳的位子空著。」只有大一下期中那兩週真的去過總圖才有（Y1_MID_LIB，story3d.js onEnter 記；舊存檔看習慣記錄）*/
  { id:'ev_midterm_walkout_y2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'crim_spec', afterExam:'mid', term:['Y2S1'], once:true, background:'blur',
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'第三題我寫了一整面，寫完才發現是第二題的答案。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'第四題時間不夠，我最後一段沒寫。'}   /* AA_428 §2 第 2 點：換成 AA_211 3-3（原本 AA_313 5-5「大家都考幾分？……不對，大家覺得考得怎樣？」：問句沒有選項可以回、自己改口）*/,
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'考完的題目，不要對答案。改不了。'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（說完，她自己翻開課本查了一題。）'} ] },
  { id:'ev_yutong_midterm_week', title:'期中考那一週', participants:['heroine_03'], location:'noodle', trigger:'auto', term:['Y1S2'], weekday:[2,4], time:[20.75,21.25], once:true,   /* AA_374 第 9 項：只在大一下（第 10 週起）、和 ev_yutong_thanks 互斥；大一下沒演到就不補（原本 Y2S1、Y2S2）*/
    prereq:{stage:{npc:'heroine_03',min:'FRIEND'},notEvents:['ev_yutong_thanks'],custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.id==='Y1S2'&&t.week>=10; }},
    spawn:{npc:'heroine_03',at:{x:2.6,z:-3.6},pose:'idle'}, background:'blur',
    dialogue:[ {unless:{flags:['yutong_hospital']},speaker:'heroine_03',expression:'neutral',text:'大一期中考那週，你有沒有發現我不在圖書館？'},
      {if:{flags:['yutong_hospital']},speaker:'heroine_03',expression:'neutral',text:'你那週來過麵店，阿姨跟你講了吧。'},
      {speaker:'heroine_03',expression:'neutral',text:'阿姨扭到手。我每天顧店到打烊，在櫃台念社會學理論。客人都在看我念書。'},
      {speaker:'heroine_03',expression:'smile',text:'後來那科是我考最好的一科。很好笑。'},
      {choice:[{text:'「我那週有注意到妳的位子空著。」',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.y1MidLib&&STORY.y1MidLib(G)},goto:'seen'},{text:'「妳那時候為什麼不說？」',goto:'why'}]},
      {label:'seen'},{speaker:'heroine_03',expression:'neutral',text:'……你有注意到。'},{mem:[{npc:'heroine_03',tag:'NOTICED_EMPTY_SEAT',note:'大一下期中那週，他注意到她在總圖的位子空著'}]},{goto:'end'},
      {label:'why'},{speaker:'heroine_03',expression:'neutral',text:'說了你要來幫我顧店嗎？'},{speaker:'player',text:'……可以啊。'},{speaker:'heroine_03',expression:'smile',text:'你連蔥都不會切。'},
      {label:'end'} ] },
  /* D8（交接包 v3 第 10 週）：校慶法服問答攤大二版（AA_71 2-5，BB 法律查核過：民法 §797、§798；台詞裡沒有人直接說出答案）＋哲 2 三種幫法（AA_40、AA_177 第 5 節）。
     校慶：11/14（六）10:00～16:00 椰林大道同一排攤位、加入法服才在攤位裡（沒加入的＝下面的路過版 ev_fair_booth_y2_pass，AA-B 682d911f；AA_355 1-2 另給的一句旁白版和它重複——AA_355 第 5 節第 5 題（2f1aaa22）：照現在、不換）；阿嬤第一句看大一有沒有遇過她（ev_sis_festival_booth）；
       三選一結果一樣；學姊（和她「有點熟」以上）在攤位後面那一句；記 GRANDMA_TREE_Y2（大四校慶的回聲，交接包 v5 第 3b 節）。
     哲 2：手機與出發選單在 story3d.js phoneRules（v3 D8）；2D 背景 ntu_court_night（ART-BG-COURT，沒有圖時是深色底＋字幕）。三個選項都不是錯的，不扣分 */
  { id:'ev_fair_booth_y2', title:'法律問答攤（大二）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G)}, background:'blur',   /* 學姊大二以後不回法服（BB_194 §14；AA-C 01:2x）：不出現、她那句拿掉 */
    dialogue:[ {if:{events:['ev_sis_festival_booth']},speaker:'阿嬤',text:'少年欸，去年那棵樹，你記得嗎？'},
      {unless:{events:['ev_sis_festival_booth']},speaker:'阿嬤',text:'少年欸，去年你們這攤有個學姊，幫我看過樹的事。'},
      {speaker:'阿嬤',text:'我照你們學姊講的，先去跟隔壁講。他拖了兩個月才剪。'},{speaker:'阿嬤',text:'剪了以後，長得更好。現在又伸過來了。'},{speaker:'阿嬤',text:'還掉了一堆芭樂在我家。我可以吃嗎？'},
      {choice:[{text:'「芭樂是自己掉下來的，還是還長在樹上？」',set:{GRANDMA_Y2_ASK:'fruit'}},{text:'「樹枝伸過來，有擋到妳什麼嗎？」',set:{GRANDMA_Y2_ASK:'block'}},{text:'「這次妳跟隔壁講了嗎？」',set:{GRANDMA_Y2_ASK:'talk'}}]},
      {speaker:'阿嬤',text:'掉下來的有，樹上的也有。'},{speaker:'阿嬤',text:'樹枝擋到我曬衣服。'},{speaker:'阿嬤',text:'這次……還沒跟隔壁講。'},   /* AA-B 682d911f：原本的旁白改成阿嬤自己的三句 */
      {speaker:'player',text:'這幾件，答案不一樣。我寫下來。'},{speaker:'player',text:'下週六早上，值班的學長姊會在萬才館一樓。'},   /* AA_428 §2 第 4 點：11/14 是第 10 週，下一次值班 11/21＝下週六 */
      {speaker:'阿嬤',text:'好啦。這顆給你們。'},{speaker:null,text:'（一顆掉下來的芭樂）'},{set:{GRANDMA_TREE_Y2:'asked'}} ] },
  /* 沒加入法服：路過的版本（AA-B 682d911f，AA_71 2-5）：11/14 10:00～16:00 走到攤位附近，沒有選項。記 GRANDMA_TREE_Y2:'heard'（大四阿嬤那句兩種都成立）。
     顧攤的改柏翰（AA-C 2026-10-18 01:2x：語彤不加入法服、學姊大二以後不回法服；柏翰大二是法服社長，AA_71 原稿也是他）：語彤的兩句改由柏翰說、字不變；學姊不出現 */
  { id:'ev_fair_booth_y2_pass', title:'法律問答攤（路過）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&!STORY.fafuMember(G)&&!(G.events&&G.events.done&&G.events.done.ev_fair_booth_y2)}, background:'blur',
    dialogue:[ {speaker:null,text:'（法服的攤位前，一個阿嬤在說話。顧攤的是柏翰。）'},
      {speaker:'阿嬤',text:'掉下來的有，樹上的也有。'},{speaker:'阿嬤',text:'樹枝擋到我曬衣服。'},{speaker:'阿嬤',text:'這次……還沒跟隔壁講。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'阿嬤，這三件要分開問，我先記下來。'},{speaker:'classmate_bohan',expression:'neutral',text:'下週六早上，萬才館一樓，有學長姊值班。'},   /* AA_428 §2 第 4 點 */
      {speaker:'阿嬤',text:'好啦。這顆給你們。'},
      {set:{GRANDMA_TREE_Y2:'heard'}} ] },
  { id:'ev_zhe_court_y2', title:'籃球場', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'ntu_court_night', hours:1,
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'（籃球場，一個人投籃）教授說，期末再沒過，我就要重修。'},{speaker:'zhe',expression:'neutral',text:'重修的時間跟練球撞。'},{speaker:'zhe',expression:'smile',text:'（投進）……沒事啦。'},
      {choice:[{text:'「我筆記借你。」',set:{ZHE2:'notes',LENT_NOTES_Y2:true},consequences:{mem:[{npc:'zhe',tag:'LENT_NOTES_Y2',note:''}]},goto:'n'},
        {text:'「我陪你念。週二週四，麵店念完再吃。」',set:{ZHE2:'study',STUDIED_WITH_ZHE:true},consequences:{mem:[{npc:'zhe',tag:'STUDIED_WITH_ZHE',note:'大二上陪他念民法，週二週四麵店念完再吃'}]},goto:'s'},
        {text:'「這個你要自己來。」',set:{ZHE2:'self'},goto:'f'}]},
      {label:'n'},{speaker:'zhe',expression:'laugh',text:'你的筆記？……字好醜。'},{speaker:null,text:'他還是收下了。'},{goto:'end'},
      {label:'s'},{speaker:'zhe',expression:'surprised',text:'你要陪我念？'},{speaker:null,text:'他停了一下。'},{speaker:'zhe',expression:'smile',text:'……好。我請。'},{goto:'end'},
      {label:'f'},{speaker:'zhe',expression:'neutral',text:'嗯。我知道。'},{speaker:null,text:'他又投了一球。'},{speaker:'zhe',expression:'neutral',text:'……你講話跟我爸一樣。'},
      {label:'end'} ] },
  { id:'ev_zhe_court_skip', title:'上次沒事啦', participants:['zhe'], location:'noodle', trigger:'auto', term:['Y2S1'], once:true, npcPresent:'zhe', background:'blur',
    prereq:{custom:G=>{ const F=G.flags||{}, d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2026-11-17'):null; return d!=null&&G.day>=d&&!!F.ZHE2_ASKED&&!F.ZHE2; }},
    dialogue:[ {speaker:'zhe',expression:'smile',text:'上次沒事啦。'},{set:{ZHE2:'none'}} ] },
  /* D9 以安新 10「家教學生的家（一）」（交接包 v3 第 3b 節、AA_177 4-8；BB 法律查核過：哪一種補助、救濟程序都不說）：12/1（二）麵店，麵店團的時段 17:30～20:30；
     祐廷不在現場（那個家的事他只聽說）。認識語彤＝她在店裡（週二晚上她在幫忙）說社工那一句、選項多「法服週六有值班。」；不認識＝Alison 說法服那句。記 AN_TUTOR_FAMILY:1；沒到＝沒有 */
  { id:'ev_an_tutor_family_1', title:'家教學生的家', participants:['heroine_01'], location:'noodle', trigger:'auto', term:['Y2S1'], weekday:[2], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-12-01')&&!!STORY.knows&&STORY.knows('heroine_01',G)},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我家教的學生，家裡申請了一個補助，被駁回了。'},{speaker:'heroine_01',expression:'thinking',text:'我想幫忙。可是我不是律師，我不該說超過我會的。'},
      {if:EV_KNOWS('heroine_03'),speaker:'heroine_01',expression:'neutral',text:'社會系的人，申請被駁回的家庭，通常第一個找誰？'},{if:EV_KNOWS('heroine_03'),speaker:'heroine_03',expression:'neutral',text:'通常先找社工吧，我們課上是這樣講的。'},
      {unless:EV_KNOWS('heroine_03'),if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'法服週六有值班啊。'},{unless:EV_KNOWS('heroine_03'),if:EV_KNOWS('yu'),speaker:'heroine_01',expression:'neutral',text:'我知道。我想先知道我不該說什麼。'},
      {choice:[{text:'「法服週六有值班。」',if:EV_KNOWS('heroine_03'),set:{AN10_PICK:'fafu'},goto:'a'},{text:'「妳可以先陪他們看駁回的理由。」',set:{AN10_PICK:'reason'},goto:'b'},{text:'「妳已經在幫了。」',set:{AN10_PICK:'help'},goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',expression:'neutral',text:'我知道。我想先知道我不該說什麼。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',expression:'thinking',text:'看理由。……對，先看理由。還有寫期限的那一段。'},{speaker:null,text:'（她拿出手機記下來。）'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',expression:'neutral',text:'這不算。'},{speaker:null,text:'她停了一下。'},{speaker:'heroine_01',expression:'smile',text:'……好，算一點。'},
      {label:'end'},{set:{AN_TUTOR_FAMILY:1}} ] },
  /* D10 慈 3「第二名」（AA_40、AA_177 第 5 節：寫成芯慈的作息）：大二上第 14～18 週，週一到週四的深夜（隔天 00:15～00:45）她在溫州街的便利商店，第一次遇到就演；
     第 15 週以後沒遇到＝不演（AA_243 #20：16 週制改第 12～15 週）。記 XINCI_SECOND（慈 4 的背景；主線 4 xc_drama「那部劇大結局了」在這之後）*/
  /* AA_497 2-3：多一個地點＝總圖 B1 二十四小時自習室 00:00～00:15（ev_xinci_second_b1，src/sup497_3d.js 照這一場組：前兩句換、「十二點半了」）；
     兩個地點只演一個；第 11 週週一 00:20 有她聯絡方式的收到提示；第 15 週還沒演＝大二下第 2 週她約 Café 演白天版（ev_xinci_second_day）*/
  { id:'ev_xinci_second', title:'第二名', participants:['classmate_xinci'], location:'cvs', trigger:'auto', term:['Y2S1'], weeks:[12,13,14,15], weekday:[1,2,3,4], time:[0.25,0.75], once:true, near:{npc:'classmate_xinci',r:4}, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_xinci',G)&&!(G.events&&G.events.done&&(G.events.done.ev_xinci_second_b1||G.events.done.ev_xinci_second_day))},
    dialogue:[ {speaker:null,text:'（芯慈在買咖啡，手機在放韓劇，沒有關聲音。）'},{speaker:null,text:'（她背包還背著，手機上是叫車的畫面。）'},   /* AA_313 5-6：她住永和、通勤，半夜在溫州街要交代 */
      {speaker:'classmate_xinci',expression:'neutral',text:'（把手機轉靜音）這部很重要，真的。'},{speaker:'classmate_xinci',expression:'neutral',text:'每天就這半小時，沒有人會問我考幾分。'},
      {speaker:'classmate_xinci',expression:'thinking',text:'（停了一下）你知道我高中跟沈以安補同一家補習班嗎。她在台中，我在永和。'},
      {speaker:'classmate_xinci',expression:'neutral',text:'聯合模考的排名貼在牆上。她第一，我第二。三年。'},
      {speaker:'classmate_xinci',expression:'neutral',text:'她不記得我。開學第一天，她跟我說「妳好，我是沈以安」。很客氣。'},
      {if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'neutral',text:'（很平靜）我借你的筆記，是想知道第一名以外的人，筆記怎麼寫。……你的比我想的好。'},
      {unless:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'neutral',text:'我在總圖看過你寫筆記。……你寫得比我想的整齊。'},   /* AA_374 第 10 項：沒借過她筆記的玩家 */
      {choice:[{text:'「妳有跟她說過嗎？」',goto:'a'},{text:'「這部劇在演什麼？」',goto:'b'},{text:'「第二名也很厲害。」',goto:'c'}]},
      {label:'a'},{speaker:'classmate_xinci',expression:'neutral',text:'說什麼？『妳好，我是三年的第二名』？'},{speaker:null,text:'她笑，很短。'},{speaker:'classmate_xinci',expression:'neutral',text:'不要。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'她眼睛亮起來，講了十分鐘的劇情。然後停住：'},{speaker:'classmate_xinci',expression:'laugh',text:'啊。我講太多了。'},{speaker:null,text:'她看了一下時間。'},{speaker:'classmate_xinci',expression:'neutral',text:'十二點四十了，我要回去了，明天早八。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'她把咖啡蓋子蓋好。'},{speaker:'classmate_xinci',expression:'thinking',text:'……我知道啦。'},{speaker:null,text:'（她拿起咖啡，揮了一下手就走了。）'},   /* AA_428 §2 第 5 點：拿掉第一句「我知道。」、不用「好啦，我知道」改口的收法 */
      {label:'end'},{mem:[{npc:'classmate_xinci',tag:'XINCI_SECOND',note:'凌晨的便利商店'}]} ] },
  /* 沛珊說她和柏翰分開了（AA_185 3-2；台詞 BB_100 2-3）：大二上第 6 週（P3 之後的第一個上課日起），週一到週五 12:10～12:40 霖澤館二樓走廊，她在窗邊等柏翰下課，走過去就演；沒有選項。
     沒遇到＝第 6 週週五 21:00 麵店團群組她自己說（story3d.js phoneRules）。都記 HEARD_PS_SPLIT；也是她伴侶期間的 endEvent（characters.js）*/
  /* AA_374 第 18 項（AA_211 附錄第 373 行、附錄 B E6）：和 ev_peishan_bohan_split 合併成這一件——看過 P3（ev_peishan_decision）、有點熟以上＝原本兩句（先說分開了，AA_313 6-5 第 11 點）；
     沒看過 P3、或還不熟＝「跟你說一下，我跟柏翰分開了。」「我們都還好，讀書會照常。」。合併的那一件也記 PEISHAN_BOHAN_SPLIT、日誌（原本 ev_peishan_bohan_split 的後果）；
     第 11 項：和沛珊交往中的玩家沒有這一件（也沒有柏翰那一段）*/
  { id:'ev_peishan_split', title:'我們上週分開了', participants:['classmate_peishan'], location:'linze', trigger:'auto', term:['Y2S1'], weeks:[6], weekday:[1,2,3,4,5], time:[12+10/60,12+40/60], once:true, near:{npc:'classmate_peishan',r:3.5}, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],notEvents:['ev_peishan_bohan_split'],notFlags:['dating_classmate_peishan']},   /* 舊存檔已經演過 ev_peishan_bohan_split 的不再演 */
    dialogue:[ {if:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'我們上週分開了。我自己說的。'},{if:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'},
      {unless:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'跟你說一下，我跟柏翰分開了。'},{unless:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'我們都還好，讀書會照常。'},
      {set:{HEARD_PS_SPLIT:true}} ],
    consequences:{flags:{PEISHAN_BOHAN_SPLIT:true},memo:'沛珊說她和柏翰分開了'} },
  /* 交換說明會（主線 8，大二下第 4 週 3/18 12:20；AA_177 4-2、AA_143 2-3、AA_30 大二下、BB_105 B9）：坐在博雅 101 選「聽說明會」才演（activities.js EXPO_Y2）。
     以安坐第一排（AA_30：「日本。我國中就決定了。」）；你坐哪一區＝EXPO_COUNTRY（日本／美國／台灣；大三上填志願表那天的旁白讀它，AA_30 場景 0）；
     散場柏翰和以安那三句（大二版，AA_143 2-3）只給兩個人都認識的玩家。明軒、采蓁（BB_137 2-3，企劃線 a047e5feb）：明軒在門口兩句（認識明軒）；選區以後——日本＝采蓁兩句（修過日文、日文班認識，
     BBPACK.tookJp＋JP_MET）、美國／台灣＝明軒一句（認識明軒）。沒修日文的「日本那一區，以安已經坐在第一排。」不放（開頭已經有以安坐第一排那一句）；選項的字照遊戲原本的（坐到…那一區）*/
  { id:'ev_exchange_expo_y2', title:'交換學生甄選說明會', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ {if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'我想去。……交換要先存錢，我算過了。'},{if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'要再多教兩個家教學生。'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安坐在第一排。）'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'日本。我國中就決定了。'},
      {choice:[{text:'（坐到日本那一區）',set:{EXPO_COUNTRY:'日本'}},{text:'（坐到美國那一區）',set:{EXPO_COUNTRY:'美國'}},{text:'（坐到台灣那一區）',set:{EXPO_COUNTRY:'台灣'}}]},
      {if:{flagIs:{EXPO_COUNTRY:'日本'},custom:G=>!!(G.flags&&G.flags.JP_MET)&&typeof BBPACK!=='undefined'&&BBPACK.tookJp(G)},speaker:'采蓁',text:'欸，日文課的！你也想去日本？'},
      {if:{flagIs:{EXPO_COUNTRY:'日本'},custom:G=>!!(G.flags&&G.flags.JP_MET)&&typeof BBPACK!=='undefined'&&BBPACK.tookJp(G)},speaker:'采蓁',text:'獸醫系走不開。……可是看看也好。'},
      {if:{flagIs:{EXPO_COUNTRY:'美國'},custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_mingxuan',G)},speaker:'classmate_mingxuan',text:'美國區。……我坐這裡，不代表付得起。'},
      {if:{flagIs:{EXPO_COUNTRY:'台灣'},custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_mingxuan',G)},speaker:'classmate_mingxuan',text:'你只是來聽聽？……我也是。聽聽不用錢。'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'交換要成績多少？'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'heroine_01',expression:'neutral',text:'簡章第三頁有寫，我等一下傳給你。'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'好。'} ],   /* AA_255 第 4 節第 7 點（附錄 A：原本「我查過了。你夠。」「……我是問妳。」是收尾梗、以安替人打分；AA_375 第 4 節提醒）*/
    consequences:{memo:'博雅 101：交換學生甄選說明會'} },
  /* 學姊上榜的家族聚餐（BB_97 2-7b；大二下第 5 週週五 3/26 19:00；家族群組 Kevin 揪、「去。」才排出遊，story3d.js）：有 FAMILY_DINNER 記憶＝永康街那家咖哩，沒有＝公館。
     她的話（AA_398：不數件數）：最後那句看 ASKED_TELL_ME（BB_108 第 1 節）*/
  { id:'ev_sis_results_dinner', title:'學姊上榜聚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER')},scene:'永康街・咖哩店',bg:'yongkang_curry'},{unless:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER')},scene:'公館',bg:'gongguan'},
      {speaker:'heroine_05',expression:'smile',text:'謝謝大家。……這次的題目，是我自己選的。'},
      {if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','ASKED_TELL_ME')},speaker:'heroine_05',expression:'smile',text:'有人叫我考得怎樣都要說。我說了。下次換他。'},
      {unless:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','ASKED_TELL_ME')},speaker:'heroine_05',expression:'neutral',text:'還有，今天我請。不要跟我搶。'} ],
    consequences:{memo:'學姊上榜的家族聚餐'} },
  /* 沛珊 P4 交接讀書會（BB_97 4-3；大二下第 1 週週三的法服讀書會，只在這一週；classes3d.js 的 clubEvent）：她休學重考前最後一次；交出去的是每週的題目整理（讀書會本身由研究所學長姐帶）。
     「我接。」只給大一去過法服讀書會 5 次以上的玩家＝STUDYGROUP_LEADER；不說話＝柏翰接（不設）。沒去的：那晚 21:30 讀書會群組她的最後一則（story3d.js）*/
  { id:'ev_peishan_handover', title:'期末前的讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[15], weekday:[4], once:true, background:'blur',   /* BB_191 §8-7：公法讀書會（週四）；「我接。」＝大一去公法讀書會 5 次以上。BB_205 第 2 節（64aaaa82）：搬到 2026-12-17（大二上第 15 週週四）*/
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'下學期的題目，我想換人整理。我一個人出的都太簡單。'},   /* AA_281 第 4 節（使用者 10-18：她什麼都不說，大家放假後才知道她休學）*/{speaker:'classmate_peishan',expression:'neutral',text:'每週的題目整理……（看柏翰，又看你）誰要接？'},
      {speaker:'classmate_peishan',expression:'serious',text:'只有一個條件：不要變成比分數的地方。'},
      {choice:[{text:'「我接。」',if:{custom:G=>typeof STORY!=='undefined'&&STORY.plgY1Count&&STORY.plgY1Count(G)>=5},set:{STUDYGROUP_LEADER:true}},{text:'（不說話）'}]} ] },
  /* 柏翰 翰 3 分數表（AA_40、AA_177 第 5 節；柏翰接題目整理的版本）：第二次聚會＝大二下第 2 週週三 3/3 的讀書會，白板上多了一張分數表；可以去找他談，或什麼都不做（都不改變翰 4）。
     沒去讀書會＝沒有。一個月後（第 6 週起第一次去讀書會）：來對題目的人從八個變四個。祐廷接的版本：3/3 21:00 柏翰在全班群組貼分布圖（story3d.js）*/
  { id:'ev_bohan_scores', title:'分數表', participants:['classmate_bohan'], location:'wancai', trigger:'club', term:['Y2S2'], weeks:[2], weekday:[4], once:true, background:'blur',   /* 公法讀書會（週四，BB_191 §8-7）*/
    prereq:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}],custom:G=>!G.flags.STUDYGROUP_LEADER},
    dialogue:[ {speaker:null,text:'（白板上多了一張表：每個人上週讀了幾頁。）'}/* AA_375 第 23 項：第 1 週沒有小考 */,{speaker:'classmate_bohan',expression:'neutral',text:'這樣比較有效率。'},{speaker:null,text:'（以安看了白板一眼，沒說話，繼續發講義。）'},   /* AA_222：以安不出聲 */
      {choice:[{text:'「讀書會不是比分數的地方吧。」',set:{HAN3_TALKED:true},goto:'talk'},{text:'（什麼都不做）'}]},{goto:'end'},
      {label:'talk'},{speaker:'classmate_bohan',expression:'neutral',text:'她不來了。這樣大家比較知道自己差多少。'},{label:'end'} ] },   /* AA_255／AA_281 */
  { id:'ev_bohan_scores_month', title:'讀書會', participants:[], location:'wancai', trigger:'club', term:['Y2S2'], weeks:[6,7,8,9,10,11,12,13,14,15], weekday:[4], once:true, background:'blur',
    prereq:{custom:G=>!G.flags.STUDYGROUP_LEADER},
    dialogue:[ {speaker:null,text:'（來對題目的人從八個變四個。）'} ] },
  /* 沛珊 P4b 在 Café 的那一次（BB_97 4-4、AA_177 第 8 節②）：第 8 週週六 4/17，12:30 她傳「總圖滿了。兩點半，靠窗。」（story3d.js）→ 13:00～15:00 走進 Café 就演；可以錯過。
     只有兩個人的版本（祐廷在和別人交往、她也知道＝小組版，照舊在總圖，沒有這一次）。CG BCG-35 放在她把便條推過來的那一拍 */
  { id:'ev_peishan_cafe_42', title:'今天念了 42 頁', participants:['classmate_peishan'], location:'cafe', trigger:'auto', once:true, term:['Y2S2'], time:[13,15], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-04-17')&&!G.flags.PS_P4B_GROUP&&!!(G.msgs&&G.msgs.some(m=>m.tag==='ps_p4b_cafe'))},
    spawn:{npc:'classmate_peishan',dist:1.6,pose:'idle'},
    dialogue:[ {cg:'cg_cafe_42pages_peishan'},{speaker:null,text:'（她把便條推過來：「今天念了 42 頁。你呢？」）'} ] },
  /* ===== 模擬法庭（大二下；V3-D16、V3-B07）：系內比賽，每個大二生都參加；祐廷、以安、柏翰同一組（賣家）是劇情事實（AA_177 4-7）。台詞 AA_96 4-3、AA_143 第 3 節（AA-B ee2c901d）、學姊 BB_97 2-6。
     模 1 抽籤 2/25（四）12:20～13:10 霖澤館 201（走進教室就演；學姊玩家到場時一定在）；沒到＝13:30 以安私訊兩則（story3d.js）。
     模 2／3／4：activities.js moot_2～4（門口參加）。模 5 比賽 5/1（六）09:30 201，固定核心：09:45 還沒到＝以安打電話、帶到場。模 6 當晚 19:00 麵店（出遊）。
     準備分（AA_143 3-2）：MOOT_BIKE_SHOP（模 2 機車行）＋MOOT_THIRD（模 3 第三種寫法）＋MOOT_DRILL（模 4 有去）＋MOOT_TOGETHER（第 8～10 週一起準備）；≥3 贏 */
  { id:'ev_moot_1', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'抽籤', participants:[], location:'classroom', trigger:'auto', term:['Y2S2'], time:[12+20/60,13+10/60], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-02-25')},
    dialogue:[ {unless:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'沈以安。分工表我先畫了。'},{unless:EV_KNOWS('heroine_01'),mem:[{npc:'heroine_01',tag:'FIRST_MET',note:'模擬法庭抽籤，同一組'}]},
      {unless:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'許柏翰。……考古題沒有這一題。'},{unless:EV_KNOWS('classmate_bohan'),mem:[{npc:'classmate_bohan',tag:'FIRST_MET',note:'模擬法庭抽籤，同一組'}]},
      {speaker:null,text:'（抽到賣家。）'},{speaker:'classmate_bohan',expression:'neutral',text:'……我們要替說『二手的本來就這樣』的人說話？'},{speaker:null,text:'（以安已經在手帳上畫分工表。）'},
      {speaker:'heroine_05',expression:'neutral',text:'三件事。一，先不要討厭你的當事人。二，找他說的話裡對的地方。三，今天先回家睡覺。'},{set:{MOOT_1:true}} ] },
  { id:'ev_moot_2', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'找資料', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我先列計畫。'},{speaker:'classmate_bohan',expression:'neutral',text:'我先背。'},
      {choice:[{text:'「我先去問機車行老闆。」',goto:'bike'},{text:'「我跟柏翰一起背。」',goto:'mem'},{text:'「我照以安的分工表做。」',goto:'plan'}]},
      {label:'bike'},{speaker:'heroine_01',expression:'surprised',text:'你去問機車行老闆？'},{speaker:'player',text:'當事人會說的話，我想先聽一次。'},
        {speaker:'heroine_01',expression:'neutral',text:'（寫進手帳）……這個我沒想到。理由欄我先空著，你回來填。'},
        {scene:'公館・機車行'},{speaker:null,text:'（公館巷子裡的機車行。地上都是機油，老闆蹲著在換輪胎。）'},{speaker:null,text:'（你問二手車通常怎麼賣。他沒抬頭。）'},
        {speaker:'機車行老闆',text:'二手車喔，看人騎的。'},{speaker:'機車行老闆',text:'同一台車，給騎很兇的人騎一年，比給阿伯騎五年還舊。'},{set:{MOOT_BIKE_SHOP:true}},{goto:'end'},
      {label:'mem'},{speaker:'classmate_bohan',expression:'neutral',text:'……你確定？我一天背四十頁。'},{speaker:null,text:'（那天晚上，你背到第十二頁就睡著了。）'},{goto:'end'},
      {label:'plan'},{speaker:'heroine_01',expression:'neutral',text:'好。你負責第三段的資料。'},{speaker:null,text:'（你在法圖找到兩本書，兩本都被借走了。）'},
      {label:'end'} ] },
  { id:'ev_moot_3', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'吵架', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'classmate_bohan',expression:'serious',text:'照考試的寫法比較安全。'},{speaker:'heroine_01',expression:'serious',text:'照考試的寫法，評審會睡著。'},
      {choice:[{text:'「先寫當事人那天知道什麼。評審要先聽到人。」',goto:'an'},{text:'「照考試的格式，至少不會錯。」',goto:'han'},
        {text:'「第一段照考試的格式。第二段，放機車行老闆說的話。」',if:{flags:['MOOT_BIKE_SHOP']},goto:'third'},{text:'「第一段照考試的格式。第二段，講當事人那天的事。」',unless:{flags:['MOOT_BIKE_SHOP']},goto:'third'}]},
      {label:'an'},{speaker:'heroine_01',expression:'smile',text:'……謝謝。'},{speaker:'classmate_bohan',expression:'neutral',text:'（沉默三秒）好。那考試的寫法，放附錄。'},{goto:'end'},
      {label:'han'},{speaker:'classmate_bohan',expression:'neutral',text:'對吧。'},{speaker:'heroine_01',expression:'neutral',text:'（把手帳闔起來）好。……我去買飲料。'},{speaker:null,text:'（她回來的時候，買了三杯。）'},{goto:'end'},
      {label:'third'},{speaker:'以安、柏翰',text:'……可以。'},{speaker:'heroine_01',expression:'smile',text:'這樣兩個人都不用讓。'},   /* AA_426 第 5 節（企劃線 967b4273a）：原本「理由：兩個人都不用讓。」，AA_143 第 229 行已改 */{speaker:'classmate_bohan',expression:'neutral',text:'……我還是覺得附錄比較安全。'},{set:{MOOT_THIRD:true}},
      {label:'end'} ] },
  { id:'ev_moot_4', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'最長的十秒', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'smile',text:'一件事。我前陣子放榜了，心情很好。所以今天會問得比較兇。'},
      {speaker:null,text:'（學姊問到第三題，三個人都答不出來。）'},{speaker:null,text:'（研討室安靜了十秒。然後學姊笑了。）'},
      {speaker:'heroine_05',expression:'smile',text:'重點是——你們剛剛那段沉默，在真的法庭裡是最長的十秒。'},{set:{MOOT_DRILL:true}} ] },
  /* 模 5 比賽（固定核心，AA_176 R4）：5/1（六）09:30 起在 201 就演；09:45 還沒到＝以安打電話「你在哪？……十點開庭。」→ 黑幕＋「你一路跑上霖澤館二樓。」（在哪裡都演）。
     開庭前五句（AA_143 3-3）→ 學姊「一件事。你們準備好了。」→ 結辯三選一（故事版要 MOOT_BIKE_SHOP）→ 輸贏照準備分（STORY.mootScore）。散場阿哲當面約晚上麵店（模 6，story3d.js 排出遊）*/
  { id:'ev_moot_5', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'比賽那天', participants:[], location:'any', trigger:'auto', term:['Y2S2'], time:[9.5,13], once:true, priority:10, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-05-01')&&(G.zone==='classroom'||(G.hour%24)>=9.75)},
    dialogue:[ {unless:{custom:G=>G.zone==='classroom'},speaker:'heroine_01',expression:'serious',text:'你在哪？……十點開庭。'},{unless:{custom:G=>G.zone==='classroom'},speaker:null,text:'（你一路跑上霖澤館二樓。）'},
      {scene:'霖澤館 201'},{speaker:null,text:'（霖澤館 201 的桌子排成兩邊。對面是芯慈那隊。）'},
      {speaker:'classmate_xinci',expression:'neutral',text:'（隔著走道，小聲）你們的分工表，我看到了。很漂亮。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她在心理戰。'},
      {speaker:'heroine_01',expression:'neutral',text:'（小聲）她在說真話。她的分工表比我的漂亮。'},{speaker:'法官',text:'請賣方代理人陳述。'},
      {speaker:'heroine_05',expression:'neutral',text:'一件事。你們準備好了。'},
      {choice:[{text:'（講契約那天，雙方各自知道什麼）',set:{MOOT_CLOSE:'reason'},goto:'r'},{text:'（講我的當事人不是壞人）',set:{MOOT_CLOSE:'gentle'},goto:'g'},{text:'（講機車行老闆說的話）',if:{flags:['MOOT_BIKE_SHOP']},set:{MOOT_CLOSE:'story'},goto:'s'}]},
      {label:'r'},{speaker:'player',text:'契約寫的是『二手』，沒有寫『無瑕疵』。我們請評審看的，是雙方在簽約那一天，各自知道什麼。'},{goto:'end'},
      {label:'g'},{speaker:'player',text:'我的當事人不是壞人。他只是以為『二手』這兩個字，可以說明一切。'},{goto:'end'},
      {label:'s'},{speaker:'player',text:'我去問過機車行的老闆。他說，每一台二手車，都有上一個主人留下的習慣。我的當事人賣的，是他騎了七年的車。'},
      {label:'end'},{advance:2},
      /* 可昕的部分（BB_97 9-19）：交往中、第 9 週告訴她日期、比賽在週末或平日晚上＝她坐最後一排；散場只有這一句（不搶學姊、以安、柏翰的台詞）*/
      {if:{custom:G=>KX_MOOT_CAME(G)},speaker:'kexin',expression:'teasing',text:'你第二個爭點講得比第一個好。第一個你在發抖。'} ],
    after:(G,GM)=>{ const sc=typeof STORY!=='undefined'&&STORY.mootScore?STORY.mootScore(G):0; G.flags.MOOT_SCORE=sc; G.flags.MOOT_WIN=sc>=3; G.flags.MOOT_DAY=G.day;
      if(G.flags.dating_kexin) G.flags.KX_MOOT=KX_MOOT_CAME(G)?'came':(G.flags.KX_MOOT_TOLD===true?'call':'photo');   /* BB_97 9-19：came／call（說了、她有課）／photo（沒說：粉專的照片）——story3d.js phoneRules 發 call、photo 的訊息 */
      if(GM&&GM.memo) GM.memo(sc>=3?'模擬法庭：你們準備得夠，結辯也站得住。':'模擬法庭：芯慈那隊準備得比你們多一步。'); } },
  /* 模 6 結果之後（當晚 19:00 麵店，出遊；可以錯過＝21:30 群組照片）：輸＝阿哲分滷味、學姊「這是最好的輸法」、以安手帳；贏＝芯慈「你們第三段很好」、學姊收評分表（BB_97 2-6）*/
  { id:'ev_moot_6', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'結果之後', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'阿鳳麵店'},
      {unless:{flags:['MOOT_WIN']},speaker:null,text:'（阿哲把外帶的滷味分給大家。）'},
      {unless:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'你們輸給了一個準備得比你們好的隊伍。這是最好的輸法。'},
      {unless:{flags:['MOOT_WIN']},speaker:null,text:'（以安在手帳上寫：「計畫以外：輸了也很開心。」）'},
      {if:{flags:['MOOT_WIN']},speaker:'classmate_xinci',expression:'smile',text:'你們第三段很好。……我們下次會贏。'},
      {if:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'……好。'},{if:{flags:['MOOT_WIN']},speaker:null,text:'（她把評分表摺起來收進包包。）'},
      {if:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'這張我要留著。……我帶的第一個隊伍。'},
      /* 可昕在場（BB_97 9-19，KX_MOOT 'came'）：輸、贏都一樣，只有這一句 */
      {if:{flagIs:{KX_MOOT:'came'}},speaker:null,text:'（可昕把自己那份滷味的豆干夾給你。）'},{if:{flagIs:{KX_MOOT:'came'}},speaker:'kexin',expression:'teasing',text:'發抖的人要補充。'} ],
    consequences:{memo:'模擬法庭之後的麵店'} },
  /* D11 系籃（大二上，AA_143 1-5、AA_177 4-4）＋語 3「在一起」（AA_40）：12/18（五）21:00 麵店團群組阿哲揪 → 出發選單「新體育館 12/19 14:00」→ 2D（新體育館室內 3D 做好以前，用 2D＋旁白）；
     祐廷坐觀眾席三選一（拍手、記分、送水；大二版的字 AA-B c2f1c5aa）；記 WATCHED_GAME_Y2；明軒的句子等 BB-B（AB-59）；以安、Alison 在觀眾席（AA_143 1-5 的描述）。
     賽後 18:30～21:00 走進麵店＝語 3（Alison 坐到你對面）。系籃和賽後麵店都沒去：22:00 認識 Alison＝她私訊三則；不認識、在麵店團＝阿哲的照片（story3d.js phoneRules）*/
  { id:'ev_zhe_game_y2', title:'系籃比賽（大二）', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'新體育館'},{speaker:null,text:'（系籃比賽。阿哲、明軒上場。）'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安坐在觀眾席第一排。）'},{if:EV_KNOWS('yu'),speaker:null,text:'（Alison 拿著自己寫的加油板。）'},{if:EV_KNOWS('yu'),speaker:null,text:'（Alison 的加油板上寫著：『17 號，不要犯規。』）'},
      {choice:[{text:'（負責拍手）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你拍手'}]},goto:'clap'},{text:'（記分）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你記分'}]},goto:'score'},{text:'（送水）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你送水'}]},goto:'water'}]},   /* 大二版（AA-B c2f1c5aa，AA_143 1-5）*/
      {label:'clap'},{speaker:null,text:'你在觀眾席拍到手掌發紅。阿哲進球，先轉身指 Alison 的加油板，才指你：'},{speaker:'zhe',expression:'laugh',text:'有沒有看到！'},{goto:'end'},
      {label:'score'},{speaker:null,text:'你坐到記分台，今年一次都沒翻錯。'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'（在觀眾席喊）十七號四犯了！'},{goto:'end'},
      {label:'water'},{speaker:null,text:'中場你把一箱水搬到場邊。阿哲拿了兩瓶，一瓶丟給明軒：'},{speaker:'zhe',expression:'smile',text:'謝啦。'},   /* AA_374 第 16 項（AA_211 第 151 行、BB_181 #3）：「後勤部長」的前情已經改掉 */
        {speaker:'classmate_mingxuan',expression:'laugh',text:'（接住水）謝啦。'},{speaker:'classmate_mingxuan',expression:'smile',text:'這瓶 CP 值最高。……免費的。'},   /* 明軒（BB_97 4-7，BB-B a3b9d427，AB-59）*/
      {label:'end'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（擦汗）我上場六分鐘，摸到球三次。……賺很大。'}   /* AA_313 5-1 第 14 點、5-7：一場只用一次「CP 值」*/,{set:{Y2_BALL_SEEN:true}} ] },
  { id:'ev_yu_together', title:'在一起', participants:['yu'], location:'noodle', trigger:'auto', term:['Y2S1'], weekday:[6], time:[18.5,21], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-12-19')&&!!STORY.knows&&STORY.knows('yu',G)}, spawn:{npc:'yu',at:{x:-0.8,z:0.6},pose:'idle'},
    dialogue:[ {speaker:'yu',expression:'embarrassed',text:'（坐到你對面，壓低聲音）欸，跟你說一件事。你不要叫。'},{speaker:'yu',expression:'embarrassed',text:'我跟阿哲在一起了。'},
      /* AA_497 3-2：語 2 的選擇有後果——「他說『沒事啦，就在一起啊』」那一句前面照 YU2_PICK 多一句（沒有 YU2_PICK＝照舊）*/
      {if:{flagIs:{YU2_PICK:'everyone'}},speaker:'yu',text:'你說他對每個人都好。我後來偷偷看了一個禮拜。……對我比較多。'},
      {if:{flagIs:{YU2_PICK:'you'}},speaker:'yu',text:'你說他對我比較好。我回去想了一整個晚上。'},
      {if:{flagIs:{YU2_PICK:'ask'}},speaker:'yu',text:'你叫我自己問他。我就問了。'},
      {speaker:'yu',expression:'laugh',text:'（看了一眼正在跟阿姨點菜的阿哲）他說「沒事啦，就在一起啊」。哪有人這樣告白的。'},{speaker:'yu',expression:'smile',text:'反正就這樣。以後週二、四吃完，他說要陪我走去捷運站。'},{speaker:null,text:'（阿哲端著兩碗麵走過來，她馬上坐正。）'},
      {mem:[{npc:'yu',tag:'IMPORTANT_CONVERSATION',note:'系籃賽後的麵店：她和阿哲在一起了'}]},{set:{YU_ZHE_TOLD:'here'}} ] },
  /* 語 3 沒去系籃、麵店的人（AA_313 5-1 第 4 點）：12/19 22:00 Alison 打電話來（接起來）；沒接＝麵店團群組阿哲的照片 */
  { id:'ev_yu_together_call', title:'Alison 的電話', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')){ G.flags.YU_ZHE_TOLD=G.flags.YU_ZHE_TOLD||'photo'; PHONE.at(G,q.day,22.25,[{th:'g:noodle_team',from:'zhe',text:'📷（麵店的長桌。Alison 比了一個 YA。）'}],'y2_yu_told'); } },
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。她那邊很吵，有人在唱歌。）'},
      {speaker:'yu',text:'欸欸欸你今天怎麼沒來！'},{speaker:'yu',text:'……跟你說一件事。我跟阿哲在一起了。'},
      {if:{flagIs:{YU2_PICK:'everyone'}},speaker:'yu',text:'你說他對每個人都好。我後來偷偷看了一個禮拜。……對我比較多。'},   /* AA_497 3-2：電話版接在「我跟阿哲在一起了。」之後 */
      {if:{flagIs:{YU2_PICK:'you'}},speaker:'yu',text:'你說他對我比較好。我回去想了一整個晚上。'},
      {if:{flagIs:{YU2_PICK:'ask'}},speaker:'yu',text:'你叫我自己問他。我就問了。'},
      {speaker:'yu',text:'你不要笑。我聽得到。'},
      {choice:[{text:'「恭喜。」',goto:'a'},{text:'「我早就知道了。」',goto:'b'}]},
      {label:'a'},{speaker:'yu',text:'謝謝！！……阿哲在旁邊，他叫你明天來麵店。'},{goto:'end'},
      {label:'b'},{speaker:'yu',text:'騙人。……你真的知道？'},
      {label:'end'},{mem:[{npc:'yu',tag:'IMPORTANT_CONVERSATION',note:'她打電話來：她和阿哲在一起了'}]},{set:{YU_ZHE_TOLD:'call'}} ] },
  /* D12（交接包 v3 第 16～18 週；AA_143 1-6～1-8、AA_177 第 6 節的日子）：聖誕交換禮物 12/17（四）12:20 霖澤館一樓（AA_313 第 4-1 節第 8 點：原本 12/24＝第 16 週期末考週，提早一週；AA_177 改成中午，晚上是可昕排的行程，不衝突）、
     跨年 12/31（四）23:50 宿舍頂樓十分鐘、期末最後一頓（最後一科考完那天 19:00 麵店）。邀約、出發選單、沒去的照片在 story3d.js（v3 群戲那張表）。
     聖誕：阿哲和 Alison 第一次一起出現、買了一樣的保溫杯；祐廷抽到的禮物看抽到誰（在場、認識的人隨機一位）*/
  { id:'ev_y2_xmas', title:'聖誕交換禮物（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'霖澤館一樓'},
      {if:EV_KNOWS('yu'),speaker:null,text:'（阿哲先到。五分鐘後 Alison 也到了。）'},   /* AA_313 5-3（AA_389 第 6 點：照逐場表）：改 12/17 以後他們 12/19 才在一起——還沒在一起、剛好買一樣 */
      {speaker:'拆到的人',text:'……為什麼有兩個一樣的保溫杯？'},{if:EV_KNOWS('yu'),speaker:'阿哲、Alison',text:'不是我們。'},{unless:EV_KNOWS('yu'),speaker:'zhe',expression:'laugh',text:'不是我們。'},
      {pick:{flag:'Y2_XMAS_FROM',from:G=>{ const k=id=>typeof STORY!=='undefined'&&STORY.knows&&STORY.knows(id,G); return ['heroine_01','heroine_03','classmate_xinci','classmate_bohan','zhe'].filter(k); }}},
      {if:{flagIs:{Y2_XMAS_FROM:'heroine_01'}},speaker:null,text:'你抽到以安的：一本空白手帳。'},{if:{flagIs:{Y2_XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'smile',text:'跟我用的同一款。你不用寫得很整齊。'},   /* AA_313 4-3（理由欄不當收尾小句）。AA_428 §2 第 8 點「聖誕以安用 AA_416」：AA_416 的以安聖誕是單獨約會那兩欄（fest_events.js），團體交換禮物這一句 AA_416 沒有寫（開頭：團體事件保留），照現行 */
      {if:{flagIs:{Y2_XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的：一包阿姨的滷包。'},
      {if:{flagIs:{Y2_XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的：一組螢光筆。'},
      {if:{flagIs:{Y2_XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的：考古題索引卡。'},
      {if:{custom:G=>G.flags.Y2_XMAS_FROM==='zhe'&&!(typeof STORY!=='undefined'&&STORY.knows&&STORY.knows('yu',G))},speaker:null,text:'你抽到阿哲的：一個保溫杯。'},
      {if:{custom:G=>G.flags.Y2_XMAS_FROM==='zhe'&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('yu',G)},speaker:null,text:'你抽到阿哲的：一個保溫杯。Alison 送的那個，一模一樣。'} ] },   /* AA_374 第 15 項（AA_211 4-4）：不認識 Alison 的也聽得懂 */
  /* 跨年大二（AA_210 第 1 節＋第 5 節，AA-C 881ed505；16 週制 12/31 在寒假第 4 天）：23:30 頂樓，人少了兩個（阿哲和 Alison 去信義區）；以安 FRIEND 以上（交往中一定）在場；
     「新年快樂。」／（拍一張傳到群組）＝NYE_Y2_PHOTO；00:10 散；和以安交往中：下樓那段（1-6）。記 NYE_Y2＝'roof'，在場的人熟悉 +1 */
  { id:'ev_y2_newyear', title:'跨年（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},{speaker:null,text:'（十一點半。頂樓只有幾個人。）'},
      {speaker:'classmate_bohan',text:'樓梯間的燈壞了，下去的時候小心。'},
      {if:{custom:G=>NYE_AN(G)&&NYE_Y1_MRT(G)},speaker:'heroine_01',text:'去年這時候還在捷運上。'},{if:{custom:G=>NYE_AN(G)&&!NYE_Y1_MRT(G)},speaker:'heroine_01',text:'今年風比較小。'},{if:{custom:G=>NYE_AN(G)},speaker:'classmate_bohan',text:'今年不用擠。'},   /* AA_313 4-3：「還在捷運上」只給大一走「一起去信義區」那條、而且她也在的人（NYE_Y1_MRT）；直接上頂樓、去年她不在的換「今年風比較小。」*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:null,text:'（十一點五十九分，手機響了。可昕打視訊來。）'},   /* 可昕交往中、選了頂樓（AA_210 5-2 視訊〔在頂樓〕）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:'kexin',expression:'smile',text:'讓我看一下頂樓。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:null,text:'（她那邊的煙火聲，比畫面慢了一秒。）'},   /* AA_313 第 2 節第 37 列：頂樓版不要連著兩次「零點」的旁白（群戲那句照留）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。……好，你們繼續。我掛了。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},set:{KX_NYE_VIDEO_Y2:true}},
      {speaker:null,text:'（零點。很遠的地方亮了一下。今年也只看得到上半截。）'},
      {choice:[{text:'「新年快樂。」',goto:'hny'},{text:'（拍一張傳到群組）',goto:'photo'}]},
      {label:'hny'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'新年快樂。'},{speaker:null,text:'（柏翰點了一下頭。）'},{goto:'end'},
      {label:'photo'},{set:{NYE_Y2_PHOTO:true}},
      {label:'end'},{speaker:'classmate_bohan',text:'我回去了。'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'我也回去了。'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:null,text:'（樓梯間的燈還是壞的。柏翰走在前面，已經轉過彎了。）'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:'heroine_01',text:'……手給我。'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:'heroine_01',text:'看不到台階。……你走慢一點。'},   /* AA_313 4-3 */
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:null,text:'（一直走到你住的那一層，她才放開。）'},
      {set:{NYE_Y2:'roof'}},{rel:{classmate_bohan:{fam:1}}},{if:{custom:G=>NYE_AN(G)},rel:{heroine_01:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大二）'} },
  /* 可昕（交往中）大二～大四的跨年（AA_210 5-2，AA-C 881ed505／28ac4ea3；寒假她在高雄，AA_276）：去高雄＝ev_kx_nye_river_y2～y4（照大一 ev_nye_river；高鐵 2980 出發時扣）；
     留在臺北＝23:59 她打視訊（ev_kx_nye_video_y2～y4，「接起來」；大二在頂樓的版本接在 ev_y2_newyear 裡）。台詞一字照 5-2
     AA_467 第 2 節（企劃線 5bbd16ab1）：大三、大四的零點那句、結尾那句換成那一年的事（大二照舊）*/
  { id:'ev_kx_nye_river_y2', title:'跨年（大二・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, kxAway:true,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她站在橋下等你，手插在外套口袋裡。）'},
      {if:{custom:G=>(G.flags.KX_NYE||{})[1]==='river'},speaker:'kexin',expression:'teasing',text:'第二年了。你認得路了吧。'},{if:{custom:G=>(G.flags.KX_NYE||{})[1]!=='river'},speaker:'kexin',expression:'smile',text:'這邊人比較少。我小時候都在這裡看。'},
      {speaker:null,text:'（零點。煙火在河的另一邊。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'（牽她的手）',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'embarrassed',text:'……嗯。新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（她沒有看你，但手沒有抽回去。）'},
      {label:'end'},{speaker:null,text:'（凌晨一點，加開的那班高鐵。）'},{set:{KX_NYE_DONE:2}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大二）'} },
  { id:'ev_kx_nye_river_y3', title:'跨年（大三・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, kxAway:true,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她帶了兩個暖暖包，一個塞進你的外套口袋。）'},{speaker:'kexin',expression:'smile',text:'今年比去年冷。'},
      {speaker:null,text:'（零點。煙火一放，你口袋裡的暖暖包還是熱的。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「暖暖包還妳。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'嗯。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'不用。那個本來就是你的。'},
      {label:'end'},{speaker:null,text:'（凌晨一點的高鐵。暖暖包到台中才冷掉。）'},{set:{KX_NYE_DONE:3}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大三）'} },
  { id:'ev_kx_nye_river_y4', title:'跨年（大四・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, kxAway:true,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她已經占好了位置，就在橋旁邊。）'},{speaker:'kexin',expression:'laugh',text:'這個位置我從國中就想占。今年終於占到。'},
      {speaker:null,text:'（零點。煙火就在橋的正上方。這個位置，真的看得最清楚。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「明年也來。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'……你先考完再說。'},
      {label:'end'},{speaker:null,text:'（凌晨一點的高鐵。手機亮了一下，是她：「到了說。」）'},{set:{KX_NYE_DONE:4}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大四）'} },
  { id:'ev_kx_nye_video_y2', title:'可昕的視訊（大二跨年）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:null,text:'（十一點五十九分，手機響了。可昕打視訊來。）'},{speaker:'kexin',expression:'smile',text:'你在房間喔？……那我們一起看電視的倒數。'},
      {speaker:null,text:'（零點。她那邊的煙火聲，比畫面慢了一秒。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。……好，去睡。我掛了。'} ] },
  { id:'ev_kx_nye_video_y3', title:'可昕的視訊（大三跨年）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{speaker:'kexin',expression:'teasing',text:'我數到零就掛。'},   /* AA_313 第 2 節第 43 列：他一個人，拿掉「你們繼續。」*/
      {speaker:null,text:'（她那邊的倒數，晚了一秒。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'} ] },
  { id:'ev_kx_nye_video_y4', title:'可昕的視訊（大四跨年）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{speaker:'kexin',expression:'smile',text:'你那邊好冷的樣子。……外套拉起來。'},
      {speaker:null,text:'（零點。兩邊的煙火，一大一小。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'} ] },
  /* 跨年大三（AA_210 第 2 節＋第 5 節：刪美國路線那句、學姊那行；2027-12-31 寒假第 5 天）：出國前最後一次，大家都不提；以安、芯慈都來（芯慈第一次上頂樓）；
     倒數照大一（Alison 起頭）；00:10 散；和以安交往中＝她留下來「你排一下。」；可昕交往中選視訊＝23:59 視訊接在這一場（5-2 大三）。NYE_Y3＝'roof' */
  /* 1A-02（AA_315 第 3 節；台詞照 AA_253 第 3、4 節，不改字）：大三上第 10 週，同時和以安、學姊交往，兩人都不知道（STORY.twoHeartsDue）——
     ev_an_sis_meet_lawlib：2027-11-10（三）那晚祐廷睡著以後演（trigger 'sleep'；祐廷不在場，participants 不放人；2D「法圖長桌・夜」還沒有＝深色底，MISSING_EXTERNAL_ART），
       演完兩邊 ROM.learn、TWO_HEARTS_MET；
     ev_two_hearts_cafe：11/11 22:00 兩則私訊、22:30 兩點半 Café（出遊 must：只能「出發」，STORY.phoneRules 排），進 Café 就演；只有「學姊。」／「以安。」，
       沒被選的那位分手（STORY.twoHeartsPick：ROM.end、by her），被選的那位之後第一次說話時記得一次（STORY.twoHeartsEcho）。路線在 11/18 12:00 照選的那位定（routeDecide）。*/
  { id:'ev_an_sis_meet_lawlib', title:'法學院圖書館，週三晚上', participants:[], location:'any', trigger:'sleep', priority:8, once:true, background:'dark', sleepCard:['週三晚上','法學院圖書館'],
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.twoHeartsDue&&STORY.twoHeartsDue(G)}, after:(G)=>{ if(typeof STORY!=='undefined'&&STORY.twoHeartsMet) STORY.twoHeartsMet(G); },
    dialogue:[ {speaker:null,text:'（週三晚上的法學院圖書館。長桌只剩一個位子，以安坐下，對面的人在看一本很厚的書。）'},
      {speaker:'heroine_01',expression:'neutral',text:'……不好意思，可以借一下六法嗎？我的忘在宿舍。'},
      {speaker:'heroine_05',expression:'neutral',text:'可以。……第幾條？'},
      {speaker:'heroine_01',expression:'neutral',text:'行政程序法。'},
      {speaker:null,text:'（學姊把六法推過去，看了一眼她的筆記。）'},
      {speaker:'heroine_05',expression:'neutral',text:'妳在準備交換？'},
      {speaker:'heroine_01',expression:'neutral',text:'日檢。我要去日本。學姊呢？'},
      {speaker:'heroine_05',expression:'neutral',text:'明年夏天，美國。'},
      {speaker:'heroine_01',expression:'neutral',text:'……我男朋友也在想交換。他還沒決定去哪裡。'},
      {speaker:'heroine_05',expression:'neutral',text:'我男朋友也是。'},
      {speaker:null,text:'（兩個人都停了一下。）'},
      {speaker:'heroine_01',expression:'serious',text:'他叫什麼名字？'},
      {speaker:null,text:'（學姊說了你的名字。以安把六法闔上，推回去。）'},
      {speaker:'heroine_01',expression:'serious',text:'……謝謝學姊。我想先回去了。'},
      {speaker:'heroine_05',expression:'serious',text:'等一下。'},
      {speaker:'heroine_05',expression:'serious',text:'我們明天一起找他。'} ] },
  { id:'ev_two_hearts_cafe', title:'兩點半 Café，打烊後', participants:['heroine_05','heroine_01'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.twoHeartsCafeDue&&STORY.twoHeartsCafeDue(G)}, after:(G,GM)=>{ if(typeof STORY!=='undefined'&&STORY.twoHeartsPick) STORY.twoHeartsPick(G,GM); },
    dialogue:[ {speaker:null,text:'（學姊和以安坐在同一張桌子的兩邊。你走進去的時候，她們同時抬頭。）'},
      {speaker:'heroine_05',expression:'serious',text:'坐。'},
      {speaker:'heroine_01',expression:'serious',text:'我們昨天在法圖認識的。'},
      {speaker:'heroine_05',expression:'serious',text:'我們不吵。也不想聽你解釋為什麼。'},
      {speaker:'heroine_01',expression:'serious',text:'你只要選一個。'},
      {speaker:null,text:'（店裡很安靜。吧台的冰箱一直在響。）'},
      {choice:[{text:'「學姊。」',unless:{flags:['dating_heroine_05']},set:{TWO_HEARTS_PICK:'heroine_05'},goto:'sis'},{text:'「書瑀。」',if:{flags:['dating_heroine_05']},set:{TWO_HEARTS_PICK:'heroine_05'},goto:'sis'},{text:'「以安。」',set:{TWO_HEARTS_PICK:'heroine_01'},goto:'an'}]},   /* AA_350 R7（裁定 12）：交往當天起祐廷說出口的「學姊。」→「書瑀。」（這一場兩個都在交往中）*/
      {label:'sis'},{speaker:'heroine_01',expression:'serious',text:'……好。'},
      {speaker:'heroine_01',expression:'serious',text:'（站起來，把椅子推回去）理由我不用聽了。'},
      {speaker:null,text:'（她走出去的時候，門上的鈴響了一聲。）'},
      {speaker:'heroine_05',expression:'neutral',text:'……我們也先回去。明天再說。'},{goto:'end'},
      {label:'an'},{speaker:'heroine_05',expression:'serious',text:'……好。'},
      {speaker:'heroine_05',expression:'serious',text:'（把外套拿起來）那就這樣。'},
      {speaker:'heroine_05',expression:'serious',text:'志願表的事，你自己決定。不要因為今天。'},
      {speaker:null,text:'（她走出去。門上的鈴響了一聲。）'},
      {speaker:'heroine_01',expression:'neutral',text:'……我們走吧。我不想在這裡待太久。'},
      {label:'end'} ] },
  { id:'ev_y3_newyear', title:'跨年（大三）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},{speaker:null,text:'（十一點半。阿哲和 Alison 已經在了，地上放著一袋鹹酥雞。）'},
      /* AA_313 5-6：以安、芯慈的句子要認識才有（大一跨年的 NYE_AN、NYE_XC 那樣；芯慈照結尾 rel 的 NYE_XC）*/
      {if:EV_KNOWS('heroine_01'),speaker:'yu',text:'以安，妳行李收了嗎？'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'還沒。三月才走。'},{if:EV_KNOWS('heroine_01'),speaker:'yu',text:'那也快了耶。'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'嗯。我列了一張清單，還沒開始收。'},
      {if:{custom:G=>G.flags.EXCHANGE_ROUTE==='JP'},speaker:'zhe',text:'你跟以安同一班喔？'},{if:{custom:G=>G.flags.EXCHANGE_ROUTE==='JP'},speaker:'player',text:'對。'},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（十一點五十，芯慈從樓梯間上來，還有點喘。）'},{if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'捷運好多人。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:'kexin',expression:'teasing',text:'我數到零就掛。你們繼續。'},
      {speaker:null,text:'（倒數是 Alison 起的頭，數到三，大家才跟上。）'},{speaker:null,text:'（零點。煙火照樣只看得到上半截。鹹酥雞的袋子被風吹得沙沙響。）'},   /* 5-6（d5cf5589）*/
      /* AA_313 第 2 節第 43 列：她的倒數、「新年快樂。」排在群戲零點之後（23:59 打來、「我數到零就掛。你們繼續。」照舊在前）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:null,text:'（她那邊的倒數，晚了一秒。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},set:{KX_NYE_VIDEO_Y3:true}},
      {if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'我要趕捷運。'},{if:{custom:G=>!G.flags.dating_heroine_01&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('heroine_01',G)},speaker:'heroine_01',text:'我也回去了。'},{speaker:'zhe',text:'下禮拜吃飯喔。'},
      {unless:{flags:['dating_heroine_01']},goto:'y3_end'},
      {speaker:null,text:'（大家下樓以後，她還站在欄杆邊。）'},{speaker:'heroine_01',text:'三月以前，我週末都空著。'},{speaker:'heroine_01',text:'你排一下。'},
      {speaker:null,text:'（她把圍巾拉高，跟你一起下樓。）'},
      {choice:[{text:'「好。」',goto:'y3_an_a'},{text:'「妳不是最會排嗎？」',goto:'y3_an_b'}]},
      {label:'y3_an_a'},{speaker:'heroine_01',text:'排好傳給我。'},{goto:'y3_end'},
      {label:'y3_an_b'},{speaker:'heroine_01',text:'這次換你。'},
      {label:'y3_end'},
      {set:{NYE_Y3:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1},heroine_01:{fam:1}}},{if:{custom:G=>NYE_XC(G)},rel:{classmate_xinci:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大三）'} },
  /* 跨年大四（AA_210 第 3 節＋第 5 節；2028-12-31 寒假第 7 天）：芯慈最早到、野餐墊；〔選了考研究所、推甄沒上〕單字卡（Y4_PATH／Y4_PUSH 由大四的升學路線設定，AA_181 2-4）；
     倒數芯慈起頭；00:10 散；和以安交往中「明天中午一起吃飯？」；可昕交往中選視訊＝23:59 視訊接在這一場（5-2 大四）。NYE_Y4＝'roof' */
  { id:'ev_y4_newyear', title:'跨年（大四）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},   /* AA_313 第 674 行：芯慈的句子要認識才有（同大三 NYE_XC）；不認識＝沒有她開頭那三行和倒數那一行 */
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（十一點半。芯慈比你們都早到，已經把野餐墊鋪好了。）'},
      {if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'去年我就覺得這裡很冷。'},{if:{custom:G=>NYE_XC(G)},speaker:'zhe',text:'每年都冷。'},{speaker:'yu',text:'今年看得到嗎？'},{speaker:'zhe',text:'看得到一點。'},
      {if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:null,text:'（你口袋裡有一疊單字卡。二月三號考試。）'},{if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'classmate_bohan',text:'帶了？'},
      {if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'player',text:'帶了。'},{if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'classmate_bohan',text:'今天先不要看。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:'kexin',expression:'smile',text:'你們那邊好冷的樣子。……外套拉起來。'},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（倒數是芯慈起的頭，比電視早了一秒。）'},
      /* AA_313 第 2 節第 47 列：同大三，她的零點、「新年快樂。」排在群戲倒數之後 */
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:null,text:'（零點。兩邊的煙火，一大一小。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},set:{KX_NYE_VIDEO_Y4:true}},
      {speaker:'zhe',text:'回去睡覺。'},{speaker:'yu',text:'我要趕捷運！'},
      {unless:{flags:['dating_heroine_01']},goto:'y4_end'},
      {speaker:'heroine_01',text:'明天中午一起吃飯？'},
      {choice:[{text:'「好。」',goto:'y4_an_a'},{text:'「我想睡到下午。」',goto:'y4_an_b'}]},
      {label:'y4_an_a'},{speaker:'heroine_01',text:'十二點，宿舍樓下。'},{goto:'y4_end'},
      {label:'y4_an_b'},{speaker:'heroine_01',text:'那一點。'},
      {label:'y4_end'},
      {set:{NYE_Y4:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1},heroine_01:{fam:1}}},{if:{custom:G=>NYE_XC(G)},rel:{classmate_xinci:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大四）'} },
  /* 和語彤交往中（AA_210 3-6）：00:01 她打電話來（在家陪媽媽）*/
  { id:'ev_yt_nye_call_y4', title:'語彤的電話（大四跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:'heroine_03',text:'新年快樂。'},{speaker:'heroine_03',text:'我媽在旁邊。她說新年快樂。'},{speaker:null,text:'（電話那頭，電視的倒數還沒播完。）'},
      {choice:[{text:'「幫我跟阿姨說新年快樂。」',goto:'a'},{text:'「妳們在看什麼？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',text:'好。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'不知道。她轉到哪台就看哪台。'},
      {label:'end'},{set:{YT_NYE_CALL_Y4:true}} ] },
  /* 芷若在英國的跨年（AA_210 5-3＋5-7，b4e48e0d；英國比臺灣慢 8 小時）：交往中＝12/31 23:59 她先傳、1/1 08:00 視訊（接起來／先不接；沒接＝08:30 一則，不扣分）；
     朋友、好朋友（含曖昧）＝1/1 08:00 私訊；認識、有點熟不收（5-7 第 2 點）。S.zrNye 排 */
  { id:'ev_zr_nye_video_y3', title:'芷若的視訊（大三跨年）', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.at(G,q.day,8.5,[{th:'p:heroine_02',from:'heroine_02',text:'沒關係。你那邊早上了，可能還在睡。新年快樂。'}],'zr_nye_miss_y3'); },
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:'heroine_02',text:'你那邊已經是早上了。'},{speaker:'heroine_02',text:'我這邊剛好跨年。外面在放煙火，你聽得到嗎？'},
      {speaker:null,text:'（她把手機轉向窗外。很遠的地方有煙火，聲音比畫面慢了一點。）'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「妳那邊冷嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',text:'新年快樂。……你那邊八個小時以前就說過了吧。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'冷。可是外面好多人，沒那麼冷。'},
      {label:'end'},{speaker:'heroine_02',text:'我要去睡了。你去吃早餐。'},{speaker:null,text:'（畫面停在她揮手的那一格，才斷掉。）'},{set:{ZR_NYE_VIDEO_Y3:true}} ] },
  /* AA_468 第 1 節（企劃線 cd2dc7646）：大四照表換字（開頭、選項照舊；含沒接的 08:30 那一則）；大三照舊 */
  { id:'ev_zr_nye_video_y4', title:'芷若的視訊（大四跨年）', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.at(G,q.day,8.5,[{th:'p:heroine_02',from:'heroine_02',text:'睡吧。新年快樂。……醒了再說。'}],'zr_nye_miss_y4'); },
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:'heroine_02',text:'臺灣的年你跨完了。換我。'},
      {speaker:null,text:'（她把手機轉向窗外。今年的煙火近一點，是從河對岸放的。）'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「妳那邊冷嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',text:'新年快樂。……第二年了，我還是比你晚。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'冷。今年我有買手套了。'},
      {label:'end'},{speaker:'heroine_02',text:'我要去睡了。……八月就回去了。'},{speaker:null,text:'（畫面斷掉以前，她把手機轉回窗外，讓你多看了一秒煙火。）'},{set:{ZR_NYE_VIDEO_Y4:true}} ] },
  /* 和語彤交往中，大三跨年（AA_313 第 4-1 節第 13 點，照大二、大四的格式）：00:01 她打電話來（店裡提早收）*/
  { id:'ev_yt_nye_call_y3', title:'語彤的電話（大三跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。她那邊很安靜。）'},{speaker:'heroine_03',text:'……新年快樂。'},{speaker:'heroine_03',text:'店裡今天提早收。阿姨說跨年沒有人吃麵。'},{speaker:'heroine_03',text:'你那邊好吵。……好，你去看。我掛了。'},
      {set:{YT_NYE_CALL_Y3:true}} ] },
  /* 和語彤交往中（AA_210 1-6）：00:01 她打電話來（收完店回家陪媽媽；在頂樓也可以接）*/
  { id:'ev_yt_nye_call_y2', title:'語彤的電話（大二跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},{speaker:'heroine_03',text:'新年快樂。'},{speaker:'heroine_03',text:'我媽十點就睡了。我一個人看倒數。'},
      {speaker:null,text:'（電話那頭，電視的聲音開得很小。）'},
      {choice:[{text:'「妳一個人看？」',goto:'a'},{text:'「下次一起看。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',text:'現在沒有了。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'……嗯。'},{speaker:null,text:'（她沒有掛電話。你也沒有。）'},
      {label:'end'},{set:{YT_NYE_CALL_Y2:true}} ] },
  { id:'ev_term_last_meal_y2s1', title:'期末最後一頓（大二上）', participants:[], location:'noodle', trigger:'enter', term:['Y2S1'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y2S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h)); }},
    dialogue:[ {speaker:null,text:'（大二上最後一科考完。長桌的位子，大家已經不用講就會坐。）'},{speaker:null,text:'（桌上多了一碟小黃瓜。沒有人點。）'},{if:{custom:G=>G.weather==='rain'||G.weather==='typhoon'},speaker:'阿姨',text:'吃完再走。外面在下雨。'},{unless:{custom:G=>G.weather==='rain'||G.weather==='typhoon'},speaker:'阿姨',text:'吃完再走。'},   /* AA_519 1-3：送小菜第四處＝第 3 句；「吃好一點」換掉（不下雨的那一版：「吃完再走。」）*/   /* AA_467 第 1 節（企劃線 5bbd16ab1）：前三句換字，後面三句照舊 */
      {if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_yu_together)||!!G.flags.YU_ZHE_TOLD},speaker:null,text:'（Alison 和阿哲坐在一起。）'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安在手帳上寫：「大二上：完成」。）'},
      {if:EV_KNOWS('heroine_03'),speaker:'heroine_03',expression:'smile',text:'今天阿姨叫我坐下來吃。'} ],
    consequences:{memo:'期末最後一頓（大二上）'} },
  /* ===================== 大二（交接包 v3）=====================
     D24 社團博覽會大二版（AA_170 第 1 節，AA-B 2026-10-16；第②級）：2026-09-12（六）10:00～16:00（AA_485 3-2；原本 09-16（三）、09-17（四）11:00～17:00），椰林大道同一排攤位（大一 club_expo_y1s1 的 spot），
     窗口內第一次走到攤位那一排。站哪一攤照大一加入的社團（CLUB_<id>）；加入不只一個＝選單選；站一個小時（不扣時段次數）。都沒加入＝走過、柏翰遞傳單（AA_358 2-5：原本語彤，她不進法服）。
     記 Y2_EXPO_BOOTH（攤位 id／'none'）、Y2_EXPO_SENIOR（第一次被叫學長；AA 寫的「記憶」，存成旗標）；在場、認識的同社團的人熟悉 +1。
     只有認識的人說話（AA_143 通則）；子晴、學姊的句子是 BB-B 補的（BB_157 第 1 節）*/
  ...(()=>{ const knows=id=>G=>typeof STORY!=='undefined'&&STORY.knows(id,G), B=v=>({flagIs:{Y2_EXPO_BOOTH:v}}), C=id=>G=>!!G.flags['CLUB_'+id];
    const CLUBS=['lawclub_study','club_guitar','club_debate','club_hiking','dept_basketball'], NAME={lawclub_study:'法服',club_guitar:'吉他社',club_debate:'辯論社',club_hiking:'登山社',dept_basketball:'系籃'};
    const DATES=['2026-09-12'];   /* CLUBFAIR-REAL-1027（AA_485 3-2）：照實際，開學第一週的週六、一天 10:00～16:00（原本 9/16、9/17 11:00～17:00）*/
    return [{ id:'ev_y2_club_expo', title:'社團博覽會（大二）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], time:[10,16], once:true, background:'blur', near:{x:-39,z:0,r:53},
      prereq:{custom:G=>typeof CALENDAR!=='undefined'&&DATES.includes(CALENDAR.dateOf(G.day).key)&&(()=>{ const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj.position; return !P||(Math.abs(P.z)<=12.5&&P.x>=-91&&P.x<=13); })()},   /* 走到攤位那一排＝椰林大道 x −91～13、|z|≤12.5（傅鐘那兩頂的前面 z 11.5 也算；LAWWW2 36 頂沿大道兩邊，CLUBFAIR-REAL-1027；原本傅鐘旁 (-13.5,13.6) 半徑 5）*/
      dialogue:[ {unless:{custom:G=>!!G.flags.CLUB_DOOR&&!G.flags.FAIR_JOIN},speaker:null,text:'去年，你站在這一排攤位前面填表。'},
        {if:{custom:G=>!!G.flags.CLUB_DOOR&&!G.flags.FAIR_JOIN},speaker:null,text:'去年，你是在社課的門口填的表。'},   /* AA_491 B：大一沒在社博填表、在社課填的（clubfair3d.js 的 CLUB_DOOR、FAIR_JOIN）*/
        {if:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},speaker:null,text:'今年，你站在攤位後面。'},
        {unless:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},set:{Y2_EXPO_BOOTH:'none'}},{unless:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},goto:'none'},   /* 帶 goto 的那一行不會執行 set，分兩行 */
        {choice:CLUBS.map(c=>({text:'（在'+NAME[c]+'的攤位站一個小時）',if:{custom:C(c)},set:{Y2_EXPO_BOOTH:c}}))},
        {advance:1},
        {if:B('lawclub_study'),goto:'L'},{if:B('club_guitar'),goto:'GT'},{if:B('club_debate'),goto:'DB'},{if:B('club_hiking'),goto:'HK'},{if:B('dept_basketball'),goto:'BK'},{goto:'end'},
        /* 法服 */
        {label:'L'},{speaker:'新生',text:'學長，法服是做什麼的？'},
        {choice:[{text:'「幫人看法律問題。」',goto:'L1'},{text:'「有人來問問題，我們先聽他把事情講完，再找條文。」',goto:'L2'}]},
        {label:'L1'},{speaker:'新生',text:'那你很厲害耶。'},{speaker:null,text:'你想說「我只是坐在旁邊做紀錄」，最後沒說。'},{goto:'end'},
        {label:'L2'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'攤位後面，柏翰抬頭看了你一眼。'},{if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'……順序對了。'},   /* AA_374 第 6 項：學姊大二起是碩一、不回法服（S.fafuSisHere=false、口氣表 0-3）——拿掉，換大二的法服社長柏翰 */
        {goto:'end'},   /* AB65-3（AA_211 附錄 A 語彤一列、第 1 節第 4 點；AA_193 第 5 節正式拿掉的回聲）：原本語彤（AA_358 2-5 換柏翰）點破「是學姊的」那一句刪掉 */
        /* 吉他社 */
        {label:'GT'},{if:{custom:knows('yu')},speaker:'yu',text:'欸{name}你負責發傳單！對了你會彈哪首？……三個和弦也行啦。'}   /* AA_313 5-4（AA_389 第 6 點：照逐場表）：不寫死玩家名字、不用「……好啦我知道」反轉 */,
        {speaker:'新生',text:'學長，完全沒碰過可以嗎？'},{speaker:'player',text:'可以。我去年也是。'},
        {if:{custom:knows('heroine_04')},speaker:'heroine_04',text:'可以啊，我們社一半的人進來都不會。'},{if:{custom:knows('heroine_04')},speaker:'heroine_04',text:'先填表，第一次社課教 C 和弦。'},{goto:'end'},
        /* 辯論社 */
        {label:'DB'},{speaker:'新生',text:'學長，辯論社要很會講話嗎？'},{speaker:'player',text:'還好，我進去以前也很怕上台。'},{goto:'end'},
        /* 登山社 */
        {label:'HK'},{speaker:'新生',text:'學長，爬山會很累嗎？'},{speaker:'player',text:'會啊，我第一次爬完腿痠三天。'},{goto:'end'},
        /* 系籃 */
        {label:'BK'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥，你站這裡。身高夠，看起來很會打。'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'欸，你站這裡。身高夠，看起來很會打。'},   /* AA_374 第 7 項：沒有「哥」的玩家（宿營夜談選「跟你們一樣啦」、中秋也沒問）*/{speaker:'新生',text:'學長，系籃要每天練嗎？'},
        {speaker:'zhe',text:'不用每天啦，週五晚上練一次。'},{speaker:'新生',text:'那我可以先去看看嗎？'},{speaker:'zhe',text:'可以啊，球場在醉月湖旁邊。'},
        {label:'end'},{speaker:null,text:'一個小時，有人叫了你四次「學長」。'},{speaker:null,text:'第一次，你回頭找是誰在叫別人。'},{goto:'fin'},
        /* 都沒加入 */
        {label:'none'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'（你只是走過。法服的攤位後面，柏翰在發傳單。）'},{unless:{custom:knows('classmate_bohan')},speaker:null,text:'你只是走過。'},   /* AA_358 2-5：語彤換柏翰；不認識柏翰照現在 */
        {if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'法服的傳單，週六有值班。'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'（他遞一張給你，又想起來，你不是新生。）'},{if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'……那你幫我拿給大一的。'},
        {label:'fin'} ],
      after:(G,GM)=>{ const F=G.flags, b=F.Y2_EXPO_BOOTH; if(b&&b!=='none'){ F.Y2_EXPO_SENIOR=true; const here={lawclub_study:['classmate_bohan'],club_guitar:['yu','heroine_04'],dept_basketball:['zhe']}[b]||[];   /* 法服攤位：語彤換柏翰（AA_358 2-5）；學姊不在攤位（AA_374 第 6 項：熟悉 +1 只給柏翰）*/
          if(typeof SOCIAL!=='undefined') for(const id of here) if(typeof STORY==='undefined'||STORY.knows(id,G)) SOCIAL.adjust(id,{fam:1}); } } }]; })(),
  /* D3 開學第一頓（AA_143 1-1；日期、邀約、沒去照 AA_177 第 3 節第 1 項、第 6 節）：9/17（四）19:00 阿鳳麵店長桌（2D 出遊）；當天 17:00 阿哲在麵店團群組（不在群組的私訊）；
     19:15 還沒出發＝沒去，21:30 群組一張照片（story3d.js phoneRules 'y2_first_meal'）。只有認識的人說話 */
  { id:'ev_y2_first_meal', title:'開學第一頓', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（暑假以後第一次，長桌又併起來了。）'},   /* AA_428 §2 第 1 點：9/17（四）不是開學第一晚；scene 後面、阿哲第一句前面 */
      {speaker:'zhe',text:'大二了，要有學長的樣子。'},{speaker:'zhe',text:'（三秒後）阿姨，大碗。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:'heroine_01',text:'我把大家的課表排在一起了，週四晚上大家都沒課。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',text:'（端麵過來）阿姨說開學，每碗多一顆滷蛋。'},
      {choice:[{text:'「行政法妳選哪一班？」',if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},goto:'a'},{text:'「先吃。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_01',text:'許老師那班，聽說他很愛點人。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（阿哲已經開始吃了。）'},
      {label:'end'} ],
    consequences:{flags:{Y2_FIRST_MEAL:true},memo:'大二的開學第一頓（阿鳳麵店）'} },
  /* D3 中秋烤肉（大二版；AA_143 1-2；AA_177 第 6 節）：9/25（五）18:00 公館的河濱；前一晚 9/24 21:00 阿哲在麵店團群組（不在群組的私訊）；
     沒去＝21:30 群組一張照片。祐廷負責借烤肉架：兩個架子、少一支夾子。只有認識的人說話；記 MIDAUTUMN_Y2 */
  { id:'ev_y2_midautumn', title:'中秋烤肉（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:'zhe',text:'夾子呢？'},{speaker:'player',text:'……兩個架子，一支夾子。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',text:'那輪流，一人夾十分鐘。'},
      /* AA_428 §2 第 2 點：以安「我贊成。這樣公平。」刪掉（照 AA_211 3-2「以安這場不說話」）*/
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'（Alison 已經拿筷子在翻肉了。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_xinci',G)},speaker:'classmate_xinci',text:'左邊火比較大，肉先放左邊。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'（語彤從袋子裡拿出一罐阿姨的醬。）'},
      {choice:[{text:'「我去便利商店買一支夾子。」',set:{MA_Y2_TONGS:'buy'},goto:'a'},{text:'「用筷子就好。」',set:{MA_Y2_TONGS:'chop'},goto:'b'}]},
      {label:'a'},{speaker:null,text:'（回來時，大家已經用筷子烤完第一輪。）'},{speaker:'zhe',text:'你回來了喔，第一輪吃完了。'},{goto:'end'},
      {label:'b'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'對嘛。'},
      {label:'end'},
      /* 可昕的那一段（AA_325 2-Y2-04；BB_97 9-17）：交往中、大一 K3 她來過（KX_MET_NOODLE_TEAM），炭第二輪才到；冷笑話照 KX_JOKE；選了用筷子的才有筷子三句（取代假設題，裁定 #5）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM},speaker:null,text:'（她到的時候，炭已經是第二輪了。她提著一袋玉米。）'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'zhe',expression:'laugh',text:'冷笑話，第二回合。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE&&G.flags.KX_JOKE!=='zhe'},speaker:'kexin',expression:'smile',text:'好。今年我帶了新的。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.KX_JOKE==='zhe'},speaker:'kexin',expression:'smile',text:'去年輸你。今年我帶了新的。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'kexin',expression:'teasing',text:'月亮為什麼中秋特別圓？……因為它也吃了月餅。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'zhe',text:'……妳有練。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:'kexin',expression:'teasing',text:'（看了一眼烤肉架）……你們在用筷子烤？'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:'zhe',text:'借烤肉架的人，只借到一支夾子。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:null,text:'（她看了你一眼，把玉米放上架子，用筷子翻。）'} ],
    consequences:{flags:{MIDAUTUMN_Y2:true},memo:'大二的中秋烤肉（河濱）'} },
  /* D3 迎新（大二版，小隊輔；AA_143 1-3、AA_177 第 6、9 節；AA_310 第 2 節改到開學前）：9/6（日）14:00 社科院旁的草地（2D 出遊；AA_177 第 9 節：先做 2D，三個背景配三題，3D 帶隊之後再做）。
     邀約：9/4（五）21:00 系學會在「法律系（全班）」群組（law_class）；沒去＝9/6 21:30 同一個群組一張照片。開頭旁白用 AA 寫的照片說明。
     三題：前兩題各兩個選項、都是好答案（只記 MENTOR_STYLE）；第 3 題「為什麼念法律？」四個短版，第二天選的那一句（whyLaw）排第一，四個都可以選；記 MENTOR_WHY、筆記「我認識的人：迎新的學弟妹」。
     收尾：阿哲（另一隊的小隊輔）在傅鐘下喊口號（沒有傅鐘的 2D 背景：椰林大道）。*/
  { id:'ev_y2_welcome', title:'迎新（小隊輔）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'社科院旁的草地',bg:'ntu_soc'},{speaker:null,text:'（一群新生圍成一圈，手上拿著名牌。）'},
      {speaker:'新生',text:'學長，大一要先念什麼？'},{choice:[{text:'「民總。」',set:{MENTOR_STYLE_Q1:'civil'}},{text:'「先認識人。」',set:{MENTOR_STYLE_Q1:'people'}}]},
      {scene:'椰林大道',bg:'ntu_avenue'},
      {speaker:'新生',text:'法律系會很難交朋友嗎？'},{choice:[{text:'「去麵店就好。」',set:{MENTOR_STYLE_Q2:'noodle'}},{text:'「不會，你看我。」',set:{MENTOR_STYLE_Q2:'me'}}]},
      {scene:'霖澤館前',bg:'ntu_linze'},
      {speaker:'新生',text:'為什麼念法律？'},
      {choice:[{text:'「小時候遇到事情就去翻民法。翻得到，看不懂。」',if:{custom:G=>WHY_KEY(G)==='curious'},set:{MENTOR_WHY:'curious'},goto:'why'},
        {text:'「我先念了一個多月經濟。還是想念這個。」',if:{custom:G=>WHY_KEY(G)==='econ'},set:{MENTOR_WHY:'econ'},goto:'why'},
        {text:'「想幫身邊的人把事情弄清楚。」',if:{custom:G=>WHY_KEY(G)==='help'},set:{MENTOR_WHY:'help'},goto:'why'},
        {text:'「還在找怎麼說。但這是我自己選的。」',if:{custom:G=>WHY_KEY(G)==='own'},set:{MENTOR_WHY:'own'},goto:'why'},
        {text:'「小時候遇到事情就去翻民法。翻得到，看不懂。」',unless:{custom:G=>WHY_KEY(G)==='curious'},set:{MENTOR_WHY:'curious'},goto:'why'},
        {text:'「我先念了一個多月經濟。還是想念這個。」',unless:{custom:G=>WHY_KEY(G)==='econ'},set:{MENTOR_WHY:'econ'},goto:'why'},
        {text:'「想幫身邊的人把事情弄清楚。」',unless:{custom:G=>WHY_KEY(G)==='help'},set:{MENTOR_WHY:'help'},goto:'why'},
        {text:'「還在找怎麼說。但這是我自己選的。」',unless:{custom:G=>WHY_KEY(G)==='own'},set:{MENTOR_WHY:'own'},goto:'why'}]},
      {label:'why'},{speaker:'新生',text:'……學長，那我還有四年可以想。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},scene:'椰林大道・傅鐘下',bg:'ntu_avenue'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},speaker:'zhe',text:'我們這隊的口號是：吃飽！'},   /* AA_313 5-3：「大碗」只留大二開學第一頓那一次 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},speaker:'新生',text:'……學長，我們的口號是什麼？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},choice:[{text:'「沒有口號。」',set:{MENTOR_SLOGAN:'none'}},{text:'「……也是大碗。」',set:{MENTOR_SLOGAN:'bowl'}}]} ],
    after:(G,GM)=>{ const F=G.flags; F.MENTOR_STYLE={q1:F.MENTOR_STYLE_Q1||null,q2:F.MENTOR_STYLE_Q2||null}; delete F.MENTOR_STYLE_Q1; delete F.MENTOR_STYLE_Q2;
      const t=MENTOR_WHY_TEXT[F.MENTOR_WHY]; if(t&&GM&&GM.addNote) GM.addNote('mentor_why','我認識的人：迎新的學弟妹','學弟問我為什麼念法律。我說：『'+t+'』'); },
    consequences:{flags:{Y2_WELCOME:true},memo:'大二的迎新（小隊輔）'} },
  /* 學姊 W6 交接（BB_97 2-1，BB-B 定稿）：大二上第 1～2 週週三的法服讀書會（萬才館研討室 A，classes3d.js clubEvent 先演這件）；法服社員（lawclub）、只一次。新社長柏翰。
     流程裡的「大家笑了……她也笑了。」用 BB 的字當旁白。沒加入法服的、到第 2 週都沒去的社員：家族群組 Kevin「學姊卸任了！」學姊「收到。」（story3d.js phoneRules 'sis_handover_group'）*/
  { id:'ev_sis_handover', retired:'BB_191 §7-3：學姊在祐廷大一時已經是前任社長（BB_122 ★-5），這場交接刪；定義留給已經演過的舊存檔', title:'交接', participants:['heroine_05'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[6,7], weekday:[3], once:true, background:'blur',   /* BB-B 75c1b2b1（AA_185 3-1）：社長交接定在大二上第 6 週週三的法服讀書會，到第 7 週為止（第 1～5 週學姊還是社長）*/
    prereq:{custom:G=>!!(G.flags.lawclub||G.flags.CLUB_lawclub_study)},
    dialogue:[ {speaker:'heroine_05',text:'交接三件事。'},{speaker:'heroine_05',text:'一，週六的值班表在雲端。'},{speaker:'heroine_05',text:'二，指導律師的聯絡方式在資料夾。'},{speaker:'heroine_05',text:'三……'},
      {speaker:null,text:'（三個人在等她。）'},{speaker:'heroine_05',text:'……三，我想不起來了。'},
      {speaker:null,text:'大家笑了，以為她在開玩笑。她也笑了。'},{speaker:null,text:'你看見她的手在找保溫瓶。'} ],
    consequences:{flags:{SIS_HANDOVER_SEEN:true},memo:'學姊在法服交接（新社長：柏翰）'} },
  /* 子晴 Q7 實驗室的信（BB_97 3-1，BB-B 定稿）：大二上第 3 週的吉他社社課（萬才館多功能教室，週一或週三 19–21；classes3d.js clubEvent 先演這件）、和她有點熟以上、只一次。
     三個選項都記 LAB_LETTER；「接妳爸的電話。」是 Q8 的伏筆（LAB_LETTER 的備註）*/
  { id:'ev_ziqing_lab_letter', title:'實驗室的信', participants:['heroine_04'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[3], once:true, background:'blur',
    prereq:{stage:{npc:'heroine_04',min:'FAMILIAR'}},
    dialogue:[ {speaker:'heroine_04',expression:'neutral',text:'（把手機蓋在桌上）教授寄信。叫我進他的實驗室。'},
      {speaker:'heroine_04',expression:'neutral',text:'說我是系上十年來最適合做 AI 的人。'},
      {speaker:'heroine_04',expression:'thinking',text:'（手機又震了）……然後我爸打來。教授是他的高中同學。'},
      {speaker:'heroine_04',expression:'thinking',text:'所以我不知道，教授是覺得我很強，還是我爸叫他寫的。'},
      {speaker:'heroine_04',expression:'neutral',text:'……好，這題我不會。你是法律系的，你幫我判。'},
      {choice:[{text:'「妳想進實驗室嗎？」',goto:'a'},{text:'「不管是哪一個，妳都很強。」',goto:'b'},{text:'「接妳爸的電話。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_04',expression:'thinking',text:'……不想。'},{speaker:null,text:'她想了很久。'},{speaker:'heroine_04',expression:'neutral',text:'可是不進去的話，我要怎麼回？他是我爸的同學欸。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'問她想不想進實驗室'}]},{goto:'end'},
      {label:'b'},{speaker:null,text:'她沉默，然後很快地說：'},{speaker:'heroine_04',expression:'embarrassed',text:'好，C 和弦，你按給我看。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'說她不管怎樣都很強'}]},{goto:'end'},
      {label:'c'},{speaker:'heroine_04',expression:'annoyed',text:'不要。'},{speaker:null,text:'她把手機調成靜音。'},{speaker:'heroine_04',expression:'neutral',text:'……改天講給你聽。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'叫她接爸爸的電話'}]},{set:{LAB_LETTER_DAD:true}},
      {label:'end'} ] },
  /* 沛珊 P3 我要重考（BB_97 4-2，BB-B 定稿；CG BCG-16）：大二上第 5 週平日 12–13 下課時，霖澤館走廊（備案：校園的霖澤館前）、前置 P2 或 P2b、和她有點熟以上、只一次。
     她走過來（spawn）。開頭照 NOT_FOR_ME；有 SIS_ANSWERED_WHY 多一句；第三個選項記 MIRROR_PEISHAN（ECON_PAST_SHARED＝full 的玩家她換一句）。三個選項都不改變她的決定 */
  /* P3「我要重考」只對交往中的玩家（AA_281 第 4 節 B-5，使用者 10-18：她什麼都不說；交往中的才知道）*/
  { id:'ev_peishan_decision', title:'我要重考', participants:['classmate_peishan'], location:['linze','campus'], trigger:'auto', term:['Y2S1'], weeks:[5], weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    spawn:{npc:'classmate_peishan',dist:2.2},
    prereq:{stage:{npc:'classmate_peishan',min:'FAMILIAR'},flags:['dating_classmate_peishan'],custom:G=>{ const d=G.events&&G.events.done||{}; if(!(d.ev_peishan_doubt||d.ev_peishan_syllogism)) return false; if(G.zone==='linze') return true;
      const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj?GAME.E.player.obj.position:null; return !!P&&Math.hypot(P.x-33,P.z+97)<25; }},   /* 校園：霖澤館前 25 m 內 */
    dialogue:[ {if:{memory:[{npc:'classmate_peishan',tag:'NOT_FOR_ME'}]},speaker:'classmate_peishan',expression:'neutral',text:'你記得我說過框的事嗎？……我想了一年。'},
      {unless:{memory:[{npc:'classmate_peishan',tag:'NOT_FOR_ME'}]},speaker:'classmate_peishan',expression:'neutral',text:'我想了很久，到底要不要繼續念法律。'},
      {if:{flags:['SIS_ANSWERED_WHY']},speaker:'classmate_peishan',expression:'neutral',text:'學姊那時候說她還在想。……我好像想好了。'},
      {cg:'cg_peishan_decision'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我決定了。我要重考。去念教育。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'……我還沒跟我爸媽說。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'你覺得呢？'},
      {choice:[{text:'「妳想去就去。」',goto:'a'},{text:'「妳爸媽會怎麼想？」',goto:'b'},{text:'「我也重考過。考完就不怕了。」',goto:'c'}]},
      {label:'a'},{speaker:null,text:'她點頭。'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。考試這件事不難。'},{speaker:'classmate_peishan',expression:'thinking',text:'難的是回家，跟我爸媽講。'},{goto:'end'},   /* AA_428 §2 第 8 點：#a 現行版有後來的來源（AA_313 6-4 換掉 SC4 原句「難的是星期六回家，站在那張榜單前面。」）＝照現行；SC4 #23 的改稿「嗯。考試我不怕。」「我比較怕星期六回家要怎麼開口。」不換 */
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'我爸會不講話。我媽會一直問我以後要做什麼。'},{speaker:'classmate_peishan',expression:'smile',text:'……我會說我想當老師。她應該會再問三次。'},{goto:'end'},
      {label:'c'},{unless:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_peishan',expression:'surprised',text:'……你重考過？'},{unless:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:null,text:'她眼睛亮起來。'},
      {unless:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_peishan',expression:'smile',text:'那你要教我。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},speaker:'classmate_peishan',expression:'smile',text:'你說過你重考過。那你要教我。'},
      {mem:[{npc:'classmate_peishan',tag:'MIRROR_PEISHAN',note:'大二說她要重考的那天'}]},
      {label:'end'} ],
    consequences:{flags:{PEISHAN_RETAKE:true},memo:'沛珊說她要重考，去念教育'} },
  /* 學姊 W7「妳自己相信這個題目嗎」（BB_97 2-2，BB-B 定稿；位置照 AA_146／AA_140 G08 統一在霖澤館）：大二上第 6～9 週平日 15–17，經過霖澤館（教授研究室走廊，2D「研究室門口」背景還沒有＝深色底）；
     和學姊有點熟以上、只一次。玩家在門外聽到；兩個選項都接「我要回總圖了。」；記 HEARD_PROF_XU（W8 讀它換一句，不是前置）*/
  { id:'ev_sis_prof_xu_door', retired:'BB_207 第 1 節＋AA_261 第 1 節（7b39f636／16919f86）：W7 綁推甄的研究計畫，推甄整段取消，作廢；定義留給已經演過的舊存檔', title:'妳自己相信這個題目嗎', participants:['heroine_05','prof_xu'], location:'linze', trigger:'auto', term:['Y2S1'], weeks:[6,7,8,9], weekday:[1,2,3,4,5], time:[15,17], once:true, background:'dark',
    prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}},
    dialogue:[ {scene:'霖澤館・研究室門口',bg:'prof_door'},
      {speaker:'prof_xu',expression:'serious',text:'書瑀，你的研究計畫寫得很完整。'},
      {speaker:'prof_xu',expression:'serious',text:'可是我讀不出來，你為什麼要做這個題目。'},
      {speaker:'prof_xu',expression:'serious',text:'……你自己相信這個題目嗎？'},
      {speaker:null,text:'（很久的沉默）'},
      {speaker:'heroine_05',expression:'serious',text:'重點是，這個題目推甄會過。'},
      {speaker:'prof_xu',expression:'serious',text:'那不是我問的問題。'},
      {speaker:null,text:'她走出研究室，看到門外的你。'},
      {speaker:'heroine_05',expression:'neutral',text:'……你聽到了。'},{speaker:'heroine_05',expression:'neutral',text:'沒事。我改一改就好。'},
      {choice:[{text:'（讓開）'},{text:'（陪她走到樓梯口）'}]},
      {speaker:'heroine_05',expression:'neutral',text:'我要回總圖了。'},
      {mem:[{npc:'heroine_05',tag:'HEARD_PROF_XU',note:'在研究室門外聽到許教授問她'}]} ] },
  /* 沛珊和柏翰分開了（BB_100 2-3，BB-B；交接包 v3 第 6 週）：P3 之後的那一週（大二上第 6 週）平日 12–13，霖澤館走廊（備案：霖澤館前 25 m）；只聽她說，沒有選項 */
  /* AA_374 第 18 項：合併進 ev_peishan_split（同一件事只演一次、台詞照那一件）——這一件不再演；id 留著（舊存檔 events.done 有它的：ev_peishan_split、ps_split_group、手機的「還好嗎」照舊認得）*/
  { id:'ev_peishan_bohan_split', title:'', participants:['classmate_peishan'], location:['linze','campus'], trigger:'auto', term:['Y2S1'], weeks:[6], weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    spawn:{npc:'classmate_peishan',dist:2.2},
    prereq:{custom:()=>false},   /* 不用 retired：retired 會把舊存檔日誌裡這一件的備註藏起來（events3d.js）*/
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我們上週分開了。我自己說的。'} ],
    consequences:{flags:{PEISHAN_BOHAN_SPLIT:true},memo:'沛珊說她和柏翰分開了'} },
  /* 柏翰 翰 2 考古題小組（AA_40 翰 2；時間地點照 AA_177 第 5 節）：大二上第 7 週平日 18～21，總圖三樓（閱覽區，他的作息），翰 1 說出分數而且比他高（BOHAN_SCORE higher）的玩家走到他旁邊。
     選「好。」＝小組每週六 16:00～18:00，總圖 B1 討論室（出發選單，story3d.js 'bohan_group_<day>'）；第三次的旁白「你第一次在意一個數字。」。沒被邀請的：第 7～8 週第一次在麵店，阿哲一句（ev_bohan_group_heard）*/
  { id:'ev_bohan_exam_group', title:'考古題小組', participants:['classmate_bohan'], location:'library', trigger:'auto', term:['Y2S1'], weeks:[7], weekday:[1,2,3,4,5], time:[18,21], once:true, background:'blur', near:{npc:'classmate_bohan',r:3},
    prereq:{custom:G=>G.flags.BOHAN_SCORE==='higher'},
    dialogue:[ {speaker:'classmate_bohan',expression:'neutral',text:'我在組一個考古題小組。四個人。每週對答案，算分。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'以安說不要。她說她週四有讀書會。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'（看手機的備忘錄）你分數夠。你要不要來。'},
      {choice:[{text:'「好。」',set:{BOHAN_GROUP:'yes'},goto:'y'},{text:'「不了。」',set:{BOHAN_GROUP:'no'},goto:'n'},{text:'「分數不夠的人呢？」',set:{BOHAN_GROUP:'ask'},goto:'q'}]},
      {label:'y'},{speaker:null,text:'小組每週六下午，總圖 B1 的討論室。對答案、算分、排名。'},{goto:'end'},
      {label:'n'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{speaker:null,text:'（他把你的名字劃掉。）'},{goto:'end'},
      {label:'q'},{speaker:null,text:'他愣住。'},{speaker:'classmate_bohan',expression:'neutral',text:'……分數不夠，就跟不上。'},{speaker:null,text:'他自己聽到這句話，臉色變了一下。'},{mem:[{npc:'classmate_bohan',tag:'ASKED_LOW_SCORE',note:''}]},
      {label:'end'} ],
    after:G=>{ if(G.flags.BOHAN_GROUP==='yes') G.flags.BOHAN_GROUP_DAY=G.day; } },
  { id:'ev_bohan_group_session', title:'考古題小組', participants:[], location:'any', trigger:'outing', background:'dark', hours:2,
    dialogue:[ {scene:'總圖 B1・討論室',bg:'library_b1'},
      {if:{custom:G=>!(G.flags.BOHAN_GROUP_N|0)},speaker:null,text:'（四個人，一張考古題。柏翰按下手機的計時器。）'},   /* AB65-3（AA_211 附錄 A 第 3 節第 7 點）：第一次補一句旁白 */
      {if:{custom:G=>(G.flags.BOHAN_GROUP_N|0)===2},speaker:null,text:'（第二次對完答案，柏翰把分數寫在白板上。你發現自己先找的是自己的名字。）'} ],
    after:G=>{ G.flags.BOHAN_GROUP_N=(G.flags.BOHAN_GROUP_N|0)+1; } },
  { id:'ev_bohan_group_heard', title:'', participants:['zhe'], location:'noodle', trigger:'auto', term:['Y2S1'], weeks:[7,8], once:true, background:'blur', near:{npc:'zhe',r:4},
    prereq:{custom:G=>G.flags.BOHAN_SCORE!=='higher'},
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'柏翰組了一個菁英小組。我沒被邀。'} ] },
  /* 以安新 8 讀書會的規則太多（交接包 v3 3b，AA；後半照 AA_140 G13、AA_177 撞期 #2）：大二上第 7 週週四 20:00 的公法讀書會（萬才館研討室，classes3d.js clubEvent 先演這件），加入過的玩家在場（PUBLIC_LAW_GROUP）。
     沒加入的、在麵店團：Alison 在群組傳撕掉一半的規則＋以安一句（記「聽說」）。後半：同一週週六 14:00 期中前的補讀（以安在群組約、出發選單）＝人回來了（CG-2，檔案還沒有）；記 PLG_RULES。
     沒去後半、在群組的玩家看 Alison 傳的照片（CG-2b：Alison 在群組傳的照片＋三則，src/y2r2_3d.js，AA_343 E2；AA_355 第 3 節）*/
  { id:'ev_plg_rules', title:'讀書會的規則太多', participants:['heroine_01'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[7], weekday:[4], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'研討室的白板旁邊貼著一張 A4：〈公法讀書會規則〉，十二條。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'三週前十個人，今天三個。'},
      {speaker:'heroine_01',expression:'neutral',text:'規則是為了讓大家講得完。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'（把下半張撕下來）那就留講得完的那一半。'},
      {choice:[{text:'「留三條就好。」',goto:'a'},{text:'「十二條都有理由，可是沒人記得住。」',goto:'b'},{text:'「我覺得十二條很好。」',goto:'c'}]},
      {label:'a'},{speaker:null,text:'以安想了一下，在白板寫：「一、每人十分鐘。二、離題可以，要拉回來。三、不准賴。」'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'第三條一定要留嗎？'},{speaker:'heroine_01',expression:'neutral',text:'一定。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',expression:'thinking',text:'……好啦，我自己也記不住十二條。'},{speaker:null,text:'她寫下同樣的三條。'},{goto:'end'},
      {label:'c'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'你是她那邊的？'},{speaker:'heroine_01',expression:'smile',text:'（嘴角動了一下）謝謝。……可是人都走了。'},{speaker:null,text:'她還是重寫成三條。'},
      {label:'end'} ],
    consequences:{flags:{PLG_RULES_SEEN:true},memo:'以安的讀書會規則從十二條變三條'} },
  { id:'ev_plg_rules_after', title:'人回來了', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'萬才館・研討室',bg:'wancai_seminar'},
      {speaker:null,text:'人回來了。八個人。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰也來了，攤開一本貼滿便利貼的書。'},
      {cg:'cg_plg_rules'},
      {speaker:'heroine_01',expression:'neutral',text:'（回頭看長桌，白板上三行字）……好。開始。每人十分鐘。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'（舉著撕下來的半張紙）這張我要裱框。'} ],
    consequences:{flags:{PLG_RULES:true},memo:'公法讀書會的週六補讀：人回來了'} },
  /* 颱風假 T2（BB_110，法律系大二上第 7 週週一 2026-10-19；calendar.js TYPHOON）：前一晚 20:30 新聞（story3d.js phoneRules，照大一的做法）。
     T2b 照常上課的喜劇（行政法）：當天早上九點線上會議的通知——9:00～12:00 人醒著時演（在哪裡都可以，手機＋線上）；三個選項；進去聽＝許教授 XU_TYPHOON（兩週內的行政法課前一句，ev_y2_xu_typhoon_front）。
     T2a 泡麵之夜（第二個房間）：當天 21:00 以後人在宿舍房間（宿舍之間的訪客規定需查證，BB 寫「不行的話改在交誼廳」，先照房間）；阿凱的訊息、祐廷的回覆照 BB 的稿；三個選項（拍照傳給方奕廷要認識他）。
     2026-10-28 AA_519 第 9 節第 1 點（企劃線 169130daf）：這一場阿凱帶的換成一袋滷味——標題「滷味之夜」、訊息、遞毛巾那一句、方奕廷的照片、記憶簿一起換；最後一句旁白「各分到一包」子代理照同樣的意思改「各分到一些」（一袋滷味分不出包）；
     開頭「阿哲已經在煮第二包了」是阿哲自己的（AA_313 5-3），照留 */
  { id:'ev_y2_typhoon_xu', title:'照常上課的喜劇', participants:['prof_xu'], location:'any', trigger:'auto', term:['Y2S1'], time:[9,12], once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-10-19')&&(G.stage||'law')==='law'},
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（早上九點，線上會議的通知）'},
      {speaker:'prof_xu',expression:'serious',text:'今天停課，所以這不是上課。'},
      {speaker:'prof_xu',expression:'serious',text:'這是自願的討論。德國的颱風比較少，我們比較一下。'},
      {speaker:null,text:'（畫面上：許教授、穿著襯衫的柏翰、芯慈。）'},
      {choice:[{text:'（進去聽）',goto:'a'},{text:'（不進去，繼續睡）',goto:'b'},{text:'（私訊柏翰「你為什麼穿襯衫」）',goto:'c'}]},
      {label:'a'},{speaker:'prof_xu',expression:'serious',text:'很好。你對德國的颱風有興趣嗎？'},{speaker:'player',text:'德國有颱風嗎？'},{speaker:'prof_xu',expression:'serious',text:'沒有。這就是重點。'},
      {mem:[{npc:'prof_xu',tag:'XU_TYPHOON',note:''}]},{goto:'end'},
      {label:'b'},{phone:'classmate_bohan',text:'教授點名了，我說你可能在睡覺。'},{goto:'end'},
      {label:'c'},{phoneMe:'classmate_bohan',text:'你為什麼穿襯衫'},{phone:'classmate_bohan',text:'因為是上課。'},{phoneMe:'classmate_bohan',text:'教授說不是上課。'},{phone:'classmate_bohan',text:'他也穿襯衫。'},
      {label:'end'} ] },
  { id:'ev_y2_xu_typhoon_front', title:'', participants:['prof_xu'], location:'any', trigger:'class', beforeClass:'admin_law', term:['Y2S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'prof_xu',tag:'XU_TYPHOON'}],custom:G=>typeof STORY!=='undefined'&&G.day>=STORY.dayOfKey('2026-11-09')&&G.day<=STORY.dayOfKey('2026-11-15')},   /* AA_374 第 13 項：期中考後第一堂（11/2 期中考；第 10 週 11/9 那一堂）；原本 10/20～11/2，只會在期中考那天出 */
    dialogue:[ {speaker:'prof_xu',expression:'serious',text:'颱風那天來討論的同學，今天坐前面。'} ] },
  { id:'ev_y2_typhoon_kai', title:'滷味之夜', participants:['kai'], location:'dorm', trigger:'auto', term:['Y2S1'], time:[21,24], once:true, background:'blur',   /* AA_519 第 9 節第 1 點：標題「泡麵之夜」→「滷味之夜」（id 不改：舊存檔的 events.done）*/
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-10-19')&&!!G.flags.ROOM_Y2},
    dialogue:[ {speaker:null,text:'（柏翰在讀許教授的講義。阿哲已經在煮第二包了。）'},   /* AA_313 5-3：大二阿哲、柏翰是 312 的室友，颱風天也在房間 */
      {phone:'kai',text:'我要過去'},{phoneMe:'kai',text:'外面在下雨'},
      {phone:'kai',text:'下雨又怎樣 滷味我都買了'},   /* AA_519 第 9 節第 1 點（原本「下雨又怎樣 泡麵我都買了」）*/
      {phone:'kai',text:'就當這週的宵夜提早'},{phoneMe:'kai',text:'今天是週一'},{phone:'kai',text:'所以咧 颱風天誰管星期幾'},
      {advance:1/3},{speaker:null,text:'（二十分鐘後，阿凱全身濕，站在門口，手上這次是一袋滷味。）'},   /* AA_519 5-3：颱風夜不要三年同一個畫面（大一照原句；大三 r2y3a_events.js 是兩杯熱豆漿）*/
      {choice:[{text:'（遞毛巾）',goto:'a'},{text:'「你可以傳訊息就好。」',goto:'b'},{text:'（拍照傳給方奕廷）',if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},goto:'c'}]},
      {label:'a'},{speaker:'kai',text:'先擦頭啦，滷味又不會跑。'},{goto:'end'},   /* AA_519 第 9 節第 1 點（原本「先擦箱子啦，泡麵濕掉就完了。」）*/
      {label:'b'},{speaker:'kai',text:'傳訊息你又不會下來。'},{goto:'end'},
      {label:'c'},{phoneMe:'npc_fangyt',text:'📷（全身濕的阿凱，手上一袋滷味）'},   /* AA_519 第 9 節第 1 點：方奕廷的照片（原本「抱著一箱泡麵」）*/
      {phone:'npc_fangyt',text:'他真的出門了？'},{phone:'npc_fangyt',text:'颱風天欸'},
      {label:'end'},{speaker:null,text:'（阿哲和柏翰也各分到一些。學弟說他不吃辣。）'} ],   /* AB65-3（AA_211 第 2 節【室友】）；AA_519 第 9 節第 1 點「其他泡麵照同樣的意思改」：原本「各分到一包」，一袋滷味分不出包＝子代理改「各分到一些」 */
    consequences:{flags:{TYPHOON_Y2_KAI:true},memo:'颱風假，阿凱帶了一袋滷味來'} },   /* AA_519 第 9 節第 1 點：記憶簿（原本「颱風假，阿凱抱著一箱泡麵來」）*/
  /* 阿凱 K3 的週日宵夜（BB_97 4-1 場面，BB-B 2026-10-16）：宿舍旁的滷味攤（晚上、騎樓下、折疊桌；背景和公館滷味攤共用、字幕換掉）。
     第一次＝夾好的三樣＋三個選項＋「下週日一樣喔。」（AA_428 §2 第 8 點）；第二次以後＝一句旁白＋阿凱輪流一句（筆電那句只在大二上第 13 週 F2 之後）；時間快轉到 00:00。
     story3d.js 的 phoneRules 'kai_sup_<day>' 出發選單。記 habit kai_supper，365 天內 3 次以上＝阿凱 SUNDAY_SUPPER */
  { id:'ev_kai_sunday_supper', title:'週日宵夜', participants:['kai'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍旁的滷味攤',bg:'gongguan_luwei'},
      {if:{custom:G=>!(G.flags.KAI_SUP_N>0)},goto:'first'},
      {speaker:null,text:'（週日晚上，滷味攤。阿凱的籃子永遠比你的滿。）'},
      {pick:{flag:'KAI_SUP_LINE',from:G=>{ const tid=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):((typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day))||{}).id, y2s1=tid==='Y2S1'||!tid;   /* AA_519 5-2（企劃線 d75cd0228）：大二上（含寒假）照舊三句輪，「新室友」那句只出一次、第二次起換「我說話很多，他說還好。」；大二下起換成三句新的輪 */
        const L=y2s1?['今天我多夾了一顆貢丸。',G.flags.KAI_SUP_ROOMIE!=null?'我說話很多，他說還好。':'新室友說我話很多。……真的很多嗎？','這週你們考什麼？……算了，先吃。']:['新室友說我話很多。……他現在也話很多了。','今天的貢丸我數了，比上次少一顆。','下學期我要投實習。……你們法律系的，實習要穿西裝嗎？'];
        const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, f2=t&&(t.id!=='Y2S1'||t.week>=13); if(y2s1&&f2&&G.flags.KAI_F2==='went') L.push('（打開筆電）你看，我的作業會頂嘴了。');   /* AA_328：只給 F2 去過的玩家（大二上；大二下起換成那三句，作業頂嘴的事在資工系館前 AA_519 5-1）*/ const n=(G.flags.KAI_SUP_N|0)-1, s=L[((n%L.length)+L.length)%L.length]; if(s==='新室友說我話很多。……真的很多嗎？') G.flags.KAI_SUP_ROOMIE=G.day; return [s]; }}},
      {speaker:'kai',text:'{flag:KAI_SUP_LINE}'},{goto:'end'},
      {label:'first'},{speaker:null,text:'（週日晚上十一點，宿舍旁的滷味攤。阿凱已經夾好兩籃。）'},
      {speaker:'kai',text:'你的我幫你夾了。豆干、海帶、王子麵。'},{speaker:'kai',text:'你大一每次都點這三樣，對吧？'},
      {choice:[{text:'「你新室友怎麼樣？」',goto:'a'},{text:'「今天的滷味好吃嗎？」',goto:'b'},{text:'（先吃）',goto:'c'}]},
      {label:'a'},{speaker:'kai',text:'十點就睡。'},{speaker:'kai',text:'……我還不習慣有人那麼早關燈。'},{goto:'f_end'},
      {label:'b'},{speaker:'kai',text:'普通啦。'},{speaker:null,text:'（他又從你籃子夾走一塊豆干）'},{goto:'f_end'},
      {label:'c'},{speaker:null,text:'（他講了二十分鐘新室友的鬧鐘。你一句都沒插話，他好像很滿意。）'},
      {label:'f_end'},{speaker:'kai',text:'下週日一樣喔。'},   /* AA_428 §2 第 8 點：收尾照 BB_167 SC4 #13（原本 AA_335 T3「下週日，同一時間。我先去排。」）*/
      {label:'end'},{advance:G=>Math.max(0,24-G.hour)} ],
    after:(G,GM)=>{ const F=G.flags; F.KAI_SUP_N=(F.KAI_SUP_N|0)+1; F.KAI_SUP_LAST=G.day-(G.hour<1?1:0); if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('kai_supper');
      if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('kai','SUNDAY_SUPPER')&&typeof EVENTS!=='undefined'&&EVENTS.habitCount&&EVENTS.habitCount({key:'kai_supper',withinDays:365})>=3) SOCIAL.remember('kai','SUNDAY_SUPPER','大二的週日宵夜'); } },
  /* D4 語彤事件 7 法服的第一次值班（AA_11 事件 7；AA_177 第 2 節、4-6）：大二上第 3 週週六 9/26 9:00～12:00 萬才館一樓的法服民眾服務。玩家在場（走到圓桌旁）才看得到。
     流程第 2、3 點用 AA 的字當旁白；記 YT_DUTY_SEEN、語彤 SHARED_CLASS（法服）。不在場的玩家：ev_y2_yt_duty_heard */
  { id:'ev_y2_yt_duty', retired:'AA_325 2-Y2-01（AA_11 舊事件 7 已刪、AA_255 第 4 節第 2 點）：換成大二第一次值班之後的麵店閒聊 ev_yt_shift_chat（src/y2r2_3d.js）', title:'法服的第一次值班', participants:['heroine_03'], location:'wancai', trigger:'auto', term:['Y2S1'], time:[9,12], once:true, background:'blur', near:{x:0.5,z:2.2,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.ytFafu&&STORY.ytFafu(G)&&G.day===STORY.dayOfKey('2026-09-26')&&!(typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&(GAME.E.player.lv|0)!==0)},   /* 一樓（二樓迴廊往下看不算）*/
    dialogue:[ {speaker:'heroine_05',text:'這位是社會系的語彤，她會幫我們做初談。'},
      {speaker:null,text:'一位阿伯來諮詢，講了十分鐘還講不到重點；法律系的人都在翻六法。'},
      {speaker:'阿伯',text:'我就是要問那個……那個房子……我兒子……'},
      {speaker:null,text:'語彤倒了一杯水，只問了一個問題。'},
      {speaker:'heroine_03',expression:'neutral',text:'阿伯，你今天來，是擔心你兒子，還是擔心房子？'},
      {speaker:'阿伯',text:'（停很久，笑了）……我兒子啦。房子是藉口。'},
      {speaker:'heroine_05',text:'（散會後）妳剛剛那一句，我們法律系的人學三年都問不出來。'},
      {speaker:'heroine_03',expression:'neutral',text:'嗯。我只是常在麵店聽人講話。'},
      {choice:[{text:'「妳怎麼知道要問那個？」',goto:'a'},{text:'「妳應該轉法律系。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',expression:'thinking',text:'他一直在看門口。他兒子在外面等他。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',expression:'smile',text:'不要。你們都在翻書，沒有人在看他。'},
      {label:'end'},{mem:[{npc:'heroine_03',tag:'SHARED_CLASS',note:'法服的第一次值班'}]} ],
    consequences:{flags:{YT_DUTY_SEEN:true,YT_LEGALAID_Y2:true},memo:'語彤第一次在法服值班'} },
  /* 不在場、和語彤「有點熟」以上（AA_177 4-6）：大二上第 4 週第一次在麵店遇到她（她的班），她轉述兩句（AA_160 R4，記 heard＝YT_DUTY_HEARD）*/
  { id:'ev_y2_yt_duty_heard', retired:'AA_325 2-Y2-01：YT_DUTY_HEARD 改由 ev_yt_shift_chat 記', title:'', participants:['heroine_03'], location:'noodle', trigger:'auto', term:['Y2S1'], weeks:[4], once:true, background:'blur', near:{npc:'heroine_03',r:4},
    prereq:{stage:{npc:'heroine_03',min:'FAMILIAR'},custom:G=>!G.flags.YT_DUTY_SEEN&&typeof STORY!=='undefined'&&!!STORY.ytFafu&&STORY.ytFafu(G)},   /* 語彤不在法服（AA_255）：不播 */
    dialogue:[ {speaker:'heroine_03',expression:'neutral',text:'上週六第一次值班。有一個阿伯，講了十分鐘才講到他兒子。'},
      {speaker:'heroine_03',expression:'neutral',text:'……我只問了一句。'} ],
    consequences:{flags:{YT_DUTY_HEARD:true},memo:'聽語彤說了她第一次在法服值班'} },
];
// 同一人物的一般閒聊（沒有事件可觸發時）。一句可以是字串，或 {t:'台詞', if:{條件，和事件的 if 一樣}}；story3d.js 的 S.smallTalk 輪流說、一天一句
/* 閒聊（S.smallTalk）：一句可以是字串，或 {t, 條件}。條件（AA_120 2-2，2026-10-13）：if／unless（EVENTS.cond）、term（學期）、week:[a,b]（學期第幾週）、
   location（區域）、time:[a,b]、weekday、once（true＝一輩子一次；'term'＝每學期一次）。條件照 AA_120 第 1、2 節（第①級：只加條件、不改字）；
   改字（第 5 節：柏翰「二十一天」、芯慈「經濟系」、黃教授「電影」、Alison 的內層引號）等使用者批准，字先不動。 */
const SMALLTALK={
  heroine_02:[{t:'「今天的豆子很酸，我不推。」',location:'cafe'},'「你有看過《進城的那一週》嗎？沒有？那我們沒得聊了——開玩笑。」',{t:'「外文系的期中是報告，法律系呢？……我聽說你們要寫到手斷掉。」',week:[6,9]}],
  heroine_03:['「……嗯。」',{t:'「三樓靠窗的燈壞了，你知道嗎。」',location:'library'},{t:'「我阿姨問你什麼時候再來。」',if:{events:['ev_noodle_yutong']}}],
  heroine_04:[{t:'「你手指好了沒？」',term:['Y1S2'],if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}]}},{t:'「阿凱說他昨天又寫到四點。你們那間到底幾點關燈？」',term:['Y1S1','Y1S2'],if:{events:['ev_ziqing_club']}},{t:'「阿凱說他昨天又寫到四點。你看到他，叫他去睡。」',term:['Y2S1','Y2S2','Y3S1','Y3S2'],if:{events:['ev_ziqing_club']}},   /* BB_166 1-3：阿凱就是祐廷的室友、大二起不同房 */
              {t:'「期末成發你要來。」',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}],stage:{npc:'heroine_04',min:'FAMILIAR'}},term:['Y1S2','Y2S2'],week:[10,13]}],   /* 手指痛＝學過和弦；成發在大一下、大二下第 14 週（AA_120 第 1 節、BB_96 4-4）。大二下的成發（Q9）還沒做，先只在大一下說（BB_134 1-8，AA-B 2026-10-16：先關，和 Q9 一起做時把 'Y2S2' 加回來）——AA_325 2-Y2-19 做了 Q9，'Y2S2' 加回來 */
  heroine_05:[{t:'「判決要看事實，不要只背結論。」',term:['Y1S1','Y1S2']},{t:'「總圖三樓靠窗那排，九點前就滿了。」',term:['Y1S1']},{t:'「……我沒事。只是沒睡。」',if:{stage:{npc:'heroine_05',min:'FAMILIAR'}}}],
  classmate_bohan:['「我在寫考古題，第二題卡住了。」',{t:'「期中還有{n}天，我排了一份進度表，要的話傳你。」',midterm:[7,14],once:'term'}],   /* AA_209 附錄A §2 */   /* AA_120 7-1 第 1 項：{n}＝到這學期第一個期中考時段的天數（照課表和日曆，story3d.js 的 smallTalk），7～14 天才說、每學期一次 */
  classmate_xinci:[{t:'「筆記我還你了，你有收到嗎？」',if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},once:true},/* AA_120 7-1 第 2 項：雙主修三個版本照她知道多少（ECON_PAST_SHARED）；到了雙主修事件就不再說 */
    {t:'「雙主修要多修好多學分，我排了好幾種課表，每一種都好滿。」',/* AA_209 附錄A §2 */term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double']},unless:{flagIs:{ECON_PAST_SHARED:['full','half']}}},
    {t:'「你說你自學過一點經濟。個經和總經，你覺得哪一個比較會卡住人？我排課表就卡在這一格。」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'half'}}},
    {t:'「你念過經濟系，我只問一件事：經濟系的期中，會不會跟法律系的撞在同一週？」',term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double'],flagIs:{ECON_PAST_SHARED:'full'}}}],
  /* 明軒、宥辰的閒聊（AA_497 4-5、1-10，企劃線 7a38216ca）：取代原本兩句撐四年；每句一次（once）、照學期（term）；說完以後的一句旁白在 STORY.SMALL_AFTER（src/sup497_3d.js）。
     原句：「阿哲說週五練球。」只限大一；「你看起來很累。睡飽比較重要。」照原本的條件（前一晚很晚睡、當天第一次）；宥辰的兩句照原本的條件（8～13 點／DJ 那段之前），稿上那一句沒有「bar」照稿 */
  classmate_mingxuan:[{t:'「阿哲說週五練球。」',term:['Y1S1','Y1S2'],once:true},{t:'「你看起來很累。睡飽比較重要。」',if:{lateNight:true},once:true,prio:1},
    {t:'「家教那個學生期中考進步了。他媽媽塞給我一袋柳丁。」',term:['Y1S2'],once:true},{t:'「這學期家教多接了一個。週六早上，小學五年級，很吵。」',term:['Y2S1'],once:true},
    {t:'「系籃新來的學弟很高。阿哲說他是秘密武器。他不會投籃。」',term:['Y2S2'],once:true},{t:'「德文課在晚上。下課走出來，公館的店都要關了。」',term:['Y3S1'],once:true},
    {t:'「冠軍賽那天，我是抱著獎盃去家教的。學生說我很臭。」',term:['Y3S2'],if:{custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>STORY.dayOfKey('2028-04-29')},once:true},   /* M3 之後（冠軍賽 2028-04-29）*/
    {t:'「德文的冠詞有三個。我背了一學期，現在只確定一個。」',term:['Y4S1'],once:true},{t:'「我爸說畢業典禮要上來。他說要關店一天。」',term:['Y4S2'],once:true}],
  classmate_youchen:[{t:'「……現在幾點？我昨天四點才睡。」',time:[8,13],once:true},{t:'「公館那間週五我放歌，來嗎？」',if:{notEvents:['ev_youchen_dj']},once:true},
    {t:'「期中考前一週我會出現。這是我和學分的約定。」',term:['Y1S2'],once:true},{t:'「你有沒有發現，霖澤館的電梯門關起來之前，會停一下。」',term:['Y2S1'],once:true},
    {t:'「重修的教室在一樓。我到的時候，門還沒開。」',term:['Y2S2'],once:true},
    {t:'「立群背刑訴是用唱的。我幫他錄起來，現在全班在傳。」',term:['Y3S1'],if:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},{t:'「刑訴的筆記有人用唱的背。你要聽嗎。很難聽。」',term:['Y3S1'],unless:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},   /* 認識詹立群才說；沒認識的照 BB_113 */
    {t:'「立群唱的刑訴，學弟妹拿去用了。他假裝很生氣，其實很開心。」',term:['Y3S2'],if:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},
    {t:'「實習的公司在西門町。下班走出來，整條街都是別人的歌。」',term:['Y4S1'],once:true},{t:'「畢業以後應該不用再早起了。……這四年我好像也沒早起過。」',term:['Y4S2'],once:true}],
  classmate_peishan:[{t:'「我今天旁聽了倫理學。」',term:['Y1S1','Y1S2','Y2S1']}/* AA_259 (b) 第 5 點：只到大二上 */,{t:'「萬才館的研討室，下午都沒人。你可以去那裡讀書。」',if:{notFlags:['lawclub']}}],   /* AA_369 第 4 節：法服沒有週三讀書會（口氣表 0-3）*/
  npc_fangyt:[{t:'「下週去溪頭。……第一次上山，我帶了太多襪子。」',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day<STORY.dayOfKey('2026-09-01')}},{t:'「這學期去奧萬大。樣區要自己找。」',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day>=STORY.dayOfKey('2026-09-01')&&G.day<STORY.dayOfKey('2027-09-01')}},
    {t:'「畢業專題的樣區在嘉義。……我可能會留在那邊。」',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day>=STORY.dayOfKey('2027-09-01')&&G.day<STORY.dayOfKey('2028-07-01')}},   /* AA_519 第 6 節：原本「森林系的野外實習，下週去溪頭。」每學期一次同一句，改成照學年（大一、大二、大三；大四以後不說：AA_357 2-2 第 6 點，2028-07 起他在嘉義）*/{t:'「芷若跟你講過我嗎？她高中就這樣，什麼都不講。」',if:{events:['ev_fangyt_hint']}}],   /* 第二句在 Z6（BB_96 3-6，大一下）之後才說；Z6 還沒做，先不說（BB 2026-10-13）*/
  npc_huangxh:[],   /* AA_519 4-1（企劃線 d75cd0228）：原本一句撐四年，改成照學年一年兩句（「語彤最近很累」只在大一、大二；src/data/aa519_lines.js hxh.years，src/sup519_3d.js 登記 STORY.SMALL_DAILY）*/
  npc_ta_chen:[],   /* AA_519 2-2（企劃線 d75cd0228）：原本兩句撐四年，改成照學年一年兩句（src/data/aa519_lines.js ta.years，src/sup519_3d.js 登記 STORY.SMALL_DAILY）*/
  prof_zhou:[{t:'「有問題可以來研究室。週四下課以後我都在。」',term:['Y1S1','Y1S2','Y2S1']},{t:'「大四了。你們這一屆，我從民總教到專題。」',term:['Y4S2']}]/* AA_522 1-1：研究室是週四他的課下課以後；只在他有課的學期說（其他學期沒有句子＝聊兩句天氣；story3d.js talkProf 同一句同一份學期）。第 9 節第 2 點（a3ea3918e）：大四下他的課在週一、週四沒有研究室，換「大四了……」、不邀研究室 */,prof_lin:['「判決要整個讀，不要只讀結論。」'],prof_zhang:[{t:'「講義第三十頁，自己回去看。」',if:{course:{const_1:{min:1}}}}],prof_wu:[{t:'「這個概念我們下週再講兩小時。」',if:{course:{crim_gen1:{min:1}}},term:['Y1S1','Y1S2','Y2S1']}],prof_huang:['「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」'],   /* AA_120 7-1 第 4 項：那是書不是電影（AA_522 第 4 節：她只在經濟系那年教法學緒論，這句沒有「上過她的課以後」的條件）*/prof_xu:[{t:'「行政法大二再說。先把民總讀好。」',if:{course:{admin_law:{max:0}}},term:['Y1S1','Y1S2']}]/* AA_375 第 20 項：只在大一說 */,prof_tsai:['「民訴的題目很長，因為人生很長。」'],prof_chen:['「國際法的新聞，每天都有。只是大部分人不知道那是國際法。」']/* AA_522 第 4 節：他沒有開課、沒有研究室事件，不說「來研究室聊」*/,
  kai:[{t:'「所以那個賣家可以告嗎？……不能？那法律系在幹嘛。」',if:{flags:['classDone']}},{t:'「宿舍網路又斷了。你們有教這個嗎？」',location:'dorm',if:{notFlags:['GRADUATED']}}],   /* AA_357 2-2 第 2 點：畢業以後不說 */
  zhe:[{t:'「系籃週五練球，來坐也可以。」',term:['Y1S1','Y1S2','Y2S1','Y2S2'],if:{notFlags:['ball_invite','GRADUATED']}},{t:'「這季我是隊長。週五你來記分。」',term:['Y3S1','Y3S2','Y4S1','Y4S2'],if:{notFlags:['GRADUATED']}},   /* AA_313 5-3：系籃那句到大二下，大三起他是隊長 */{t:'「總圖 B1 的冷氣，比去年冷。」',if:{flags:['GRADUATED']}},'「公館那家滷味晚上十點後半價。」'],   /* AA_357 2-2：畢業以後系籃那句換成總圖 B1 的冷氣 */
  yu:[{t:'「辯論社下週辯『網拍標錯價要不要出貨』。」',term:['Y1S1'],week:[4,6],once:true,if:{flags:['classDone']}},   /* AA_120 7-1 第 5 項：引號；辯論社第 5 週開始，第 4～6 週說「下週」才對 */'「溫州街的貓你有看到嗎？」'],
  /* AA_120 7-2（使用者 2026-10-13 批准）：20 位不熟同學各三句，整個存檔各只說一次；第 3 句要對方說過心事（SHARED_SECRET）以後。說完以後只點頭或短招呼（story3d.js 的 smallTalk）。台詞【虛構】 */
  pool_1:[{t:'「我在看一本推理小說，兇手是律師。……我還沒看完，你不要猜。」',once:true},{t:'「總圖那一區的推理小說，我大概看完一半了。剩下那一半都被借走。」',once:true},{t:'「我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？」',once:true,if:{memory:[{npc:'pool_1',tag:'SHARED_SECRET'}]}}],
  pool_2:[{t:'「財金系的報告都在算錢，法律系的報告都在算誰要賠錢。差不多。」',once:true},{t:'「我這學期修了二十五學分。不要學我。」',once:true},{t:'「我在學日文。五十音背了三次，第三次終於記住了。」',once:true,if:{memory:[{npc:'pool_2',tag:'SHARED_SECRET'}]}}],
  pool_3:[{t:'「台北的豆花太甜了。……好啦，是台南的太甜，台北的剛好。」',once:true},{t:'「我媽又寄了一箱虱目魚丸上來。冰箱塞不下，你要不要分一點？」',once:true},{t:'「每次搭高鐵回台南，過了嘉義就開始想吃早餐。」',once:true,if:{memory:[{npc:'pool_3',tag:'SHARED_SECRET'}]}}],
  pool_4:[{t:'「系學會又要辦活動了。你有什麼想玩的，可以跟我說。」',once:true},{t:'「活動組就是：大家在玩的時候，我在數人數。」',once:true},{t:'「書記官的考試科目，我偷偷查過了。你不要說出去。」',once:true,if:{memory:[{npc:'pool_4',tag:'SHARED_SECRET'}]}}],
  pool_5:[{t:'「社辦的吉他有一把斷了一根弦，大家都假裝沒看到。」',once:true},{t:'「我們社課有一半的時間在吃東西，另一半在找誰帶了撥片。」',once:true},{t:'「上次社辦有一隻蟑螂，我在走廊站了二十分鐘。不要笑。」',once:true,if:{memory:[{npc:'pool_5',tag:'SHARED_SECRET'}]}}],
  pool_6:[{t:'「椰林大道下午四點的光最好看。你下次經過可以看一下。」',once:true},{t:'「系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。」',once:true},{t:'「上次那張醉月湖的照片，我拿去投比賽。沒得獎，可是我很開心。」',once:true,if:{memory:[{npc:'pool_6',tag:'SHARED_SECRET'}]}}],
  pool_7:[{t:'「我六點就到傅鐘旁邊吃早餐了。那時候的校園很安靜，你應該來看一次。」',once:true},{t:'「早起的祕訣是早睡。……好，我知道這不算祕訣。」',once:true},{t:'「我想當律師，可是我還不知道要幫誰。你呢？」',once:true,if:{memory:[{npc:'pool_7',tag:'SHARED_SECRET'}]}}],
  pool_8:[{t:'「辯論最難的是計時器響的時候閉嘴。我每次都多講半句。」',once:true},{t:'「下次辯論賽我當計時。……對，我每次都當計時。」',once:true},{t:'「上台之前我都要去洗三次手。今天洗了四次。」',once:true,if:{memory:[{npc:'pool_8',tag:'SHARED_SECRET'}]}}],
  pool_9:[{t:'「我最近在聽一個講冷知識的 podcast。昨天那集在講醬油。」',once:true},{t:'「窗邊這個位子下午很曬，可是我還是會坐這裡。」',once:true},{t:'「我在查國外的研究所。查了一個月，還沒跟我媽講。」',once:true,if:{memory:[{npc:'pool_9',tag:'SHARED_SECRET'}]}}],
  pool_10:[{t:'「冠廷學長說，讀書不要只畫重點，要問自己為什麼。他說了三次。」',once:true},{t:'「助教的研究室有一台很好喝的咖啡機。這是我知道的唯一祕密。」',once:true},{t:'「我想念研究所。……現在講這個好像太早了，對吧？」',once:true,if:{memory:[{npc:'pool_10',tag:'SHARED_SECRET'}]}}],
  pool_11:[{t:'「吉他袋很重。可是背著它走在路上，會覺得自己很會彈。」',once:true},{t:'「萬才館那邊晚上很安靜，彈錯也沒人聽到。」',once:true},{t:'「上次跟你說我不會換和弦……我昨天換成功了一次。只有一次。」',once:true,if:{memory:[{npc:'pool_11',tag:'SHARED_SECRET'}]}}],
  pool_12:[{t:'「系籃的水是我買的，毛巾是我洗的，比分是我記的。球是他們打的。」',once:true},{t:'「系服我有三件。這樣早上不用想要穿什麼。」',once:true},{t:'「翹課那幾次，我是去球場幫大家占位子。……好啦，也有一次是睡過頭。」',once:true,if:{memory:[{npc:'pool_12',tag:'SHARED_SECRET'}]}}],
  pool_13:[{t:'「廣播社這週的節目在講校園裡的貓。你有推薦的貓嗎？」',once:true},{t:'「錄音的時候最怕咳嗽。剪掉一聲要花十分鐘。」',once:true},{t:'「上次跟你說我想跑司法新聞。……我現在看新聞，都會先想記者有沒有把判決講錯。」',once:true,if:{memory:[{npc:'pool_13',tag:'SHARED_SECRET'}]}}],
  pool_14:[{t:'「從校門騎到總圖，我的紀錄是一分四十秒。不要學，很危險。」',once:true},{t:'「腳踏車社週末要騎去河堤。來的話記得帶水。」',once:true},{t:'「我一章讀十分鐘，可是隔天就忘了。所以我現在一章讀三次。」',once:true,if:{memory:[{npc:'pool_14',tag:'SHARED_SECRET'}]}}],
  pool_15:[{t:'「哲學系的課上了一學期，我學到的是：問題比答案多。」',once:true},{t:'「讀書會上我問了一個問題，大家安靜了五秒。我很喜歡那五秒。」',once:true},{t:'「我最後沒轉系。法律也在問『為什麼』，只是問得比較慢。」',once:true,if:{memory:[{npc:'pool_15',tag:'SHARED_SECRET'}]}}],
  pool_16:[{t:'「有人說我混音太吵。他說得對，可是我不改。」',once:true},{t:'「週五晚上公館那間，我偶爾去幫忙搬音響。」',once:true},{t:'「我背法條是配節奏的。……你不要叫我唱，我會害羞。」',once:true,if:{memory:[{npc:'pool_16',tag:'SHARED_SECRET'}]}}],
  pool_17:[{t:'「我的筆記借出去之前都會先拍照。上次有一本回來的時候多了咖啡漬。」',once:true},{t:'「考前一週，我的筆記會被借走五次。我自己都要排隊。」',once:true},{t:'「考前我都睡不著。所以才一直寫筆記，寫下來比較不怕。」',once:true,if:{memory:[{npc:'pool_17',tag:'SHARED_SECRET'}]}}],
  pool_18:[{t:'「早上的課我都坐最後一排。前二十分鐘，我還在開機。」',once:true},{t:'「刑法的案例很像推理小說，只是兇手都先寫好了。」',once:true},{t:'「大家說我刑法很強。其實我每次考前都怕得要命。」',once:true,if:{memory:[{npc:'pool_18',tag:'SHARED_SECRET'}]}}],
  pool_19:[{t:'「我去旁聽社工系的課。有時候跟法律系在講同一件事，只是用不同的字。」',once:true},{t:'「週末我在社福中心當志工。有個小朋友問我『法律可以保護我嗎』，我還不會回答。」',once:true},{t:'「我家以前也被社工幫過。所以我想站在另一邊看看。」',once:true,if:{memory:[{npc:'pool_19',tag:'SHARED_SECRET'}]}}],
  pool_20:[{t:'「法服的攤位每年都擺在同一個位置。因為那裡有插座。」',once:true},{t:'「法服的器材是我管的。延長線、名牌、那台很老的影印機。影印機最難管。」',once:true},{t:'「當幹部是抽籤抽到的。……可是我現在不想交出去了。」',once:true,if:{memory:[{npc:'pool_20',tag:'SHARED_SECRET'}]}}],
};

// ══════════════════════════════════════ 事件包 v1.1：女主角 arc、教授、同學、生活小事、考試、研究所
const STORY_EVENTS_V11=[
  // ── 小安 arc ──
  { id:'ev_an_library_study', title:'總圖的早上', term:['Y1S1'], participants:['heroine_01'], location:'library', trigger:'interact', priority:6, cooldown_days:2, max_times:2, day_min:3,   /* AA_186 第 6 節 A：最多兩次（第二次的新開場句等使用者確認口語準則）*/   /* 交接包 v1 第 1 節（AA 2026-10-14）：大一沒有刑訴，選項改刑總；兩個選項都是大一上的課 → 只在大一上 */ prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）這裡有位子。你要讀什麼？'},{choice:[{text:'「民總。周老師說錯誤那段後面才會講。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀民總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「刑總。吳老師說期中會考。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀刑總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「我只是來吹冷氣。」',consequences:{rel:{heroine_01:{fam:1}}},goto:'ac'}]},{label:'study'},{speaker:null,text:'一個半小時。她翻頁的速度是你的兩倍，但每二十分鐘會停下來看窗外一次。'},{if:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}]},speaker:'heroine_01',expression:'smile',text:'（小聲）比咖啡廳安靜吧。……但那天比較好玩。'},{goto:'end'},{label:'ac'},{speaker:'heroine_01',expression:'annoyed',text:'（小聲）那你去三樓，那邊冷氣比較強。'},{label:'end'} ] },
  { id:'ev_an_report_feedback', title:'報告發回來了', participants:['heroine_01'], location:['campus','library','cafe'], trigger:'interact', priority:8, once:true, day_min:9, prereq:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}],custom:G=>typeof STORY==='undefined'||!STORY.termDay||G.day>=STORY.termDay('Y1S1',6,1)}, background:'blur',   /* 交付清單 A4：第 6 週（報告交出去之後）；舊存檔過了第 6 週的照舊 */
    dialogue:[ {speaker:'heroine_01',expression:'surprised',text:'報告發回來了。周老師在我的結論旁邊寫了一行字。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'laugh',text:'「無過失的判斷標準寫得好。」——所以我說了，是你的主意，他信了。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'「兩邊的利益都有看到。」……那是你那天講的。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'「反方意見比正方精彩。」——那段是照你講的寫的。'},{choice:[{text:'「下次也一起寫。」',if:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「下次一起寫。」',unless:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'約好下次一起寫報告'}]}},{text:'「那是妳寫的，不是我。」',consequences:{rel:{heroine_01:{resp:4,fam:2}}}}]},{speaker:'heroine_01',expression:'smile',text:'……嗯。'} ] },
  { id:'ev_an_mother', title:'書記官的女兒', retired:'D60（使用者 2026-10-14）：以安新版——母親是法官，停用書記官的舊事件。定義留著：已經演過的舊存檔（events.done、TALKED_FAMILY 記憶）照樣讀得到', participants:['heroine_01'], location:'campus', trigger:'interact', priority:7, once:true, time:[17.5,20.5], prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我媽今天打來，問我期中考幾分。還沒考。'},{speaker:'heroine_01',expression:'thinking',text:'她是書記官。從我小學開始，她每天回家都會講法院發生什麼事——誰哭、誰吵、誰被帶走。'},{speaker:'heroine_01',expression:'serious',text:'我念法律，一半是因為她。另一半是想知道，坐在那個位置上的人，到底看得到什麼。'},{choice:[{text:'「妳現在看到什麼？」',consequences:{rel:{heroine_01:{trust:7,aff:4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'see'},{text:'「妳可以不用一直想這個。」',consequences:{rel:{heroine_01:{comf:5,trust:3}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'rest'},{text:'「書記官很穩定啊。」',consequences:{rel:{heroine_01:{comf:-4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'你說書記官很穩定'}]},goto:'stable'}]},{label:'see'},{speaker:'heroine_01',expression:'sad',text:'……看到很多人不是壞人，只是沒有人幫他們把話講清楚。'},{speaker:'heroine_01',expression:'smile',text:'謝謝你問。大家都只問我成績。'},{goto:'end'},{label:'rest'},{speaker:'heroine_01',expression:'tired',text:'我知道。……可是不想的時候，就不知道為什麼要念這些。'},{goto:'end'},{label:'stable'},{speaker:'heroine_01',expression:'annoyed',text:'……我媽也這樣說。'},{speaker:null,text:'她沒有再說話。你們並肩走了一段，她在傅鐘前面說要回宿舍。'},{label:'end'} ] },
  // ── 芷若 arc ──
  /* 阿哲初遇（AA_195 4-8，AA-B d5b5d188；台詞是 AA 的）：只限開學改 9/1 的局、還沒認識阿哲。9/1（一）憲法第一堂開始前，在 201 坐下以後；
     那天沒遇到（沒去、上課以後才進教室）改 9/3（三）刑總第一堂前（第二句換）。兩堂都沒遇到，9/4 campusMorning 演初遇版（story3d.js zheW1Morning）。
     「念過經濟系」留給 P4（9/5）、「叫你哥」留給迎新，這一場不提。阿哲從玩家後面那一排出現（spawn dist −1.1）*/
  { id:'ev_zhe_w1_meet', title:'第一堂課前', participants:['zhe'], location:'classroom', trigger:'seat', time:[7,9+10/60], once:true, background:'blur', spawn:{npc:'zhe',dist:-1.1,pose:'idle'},
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&!G.flags.ZHE_W1_DORM&&(!G.flags.MET_ZHE||(STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')))&&(G.day===STORY.dayOfKey('2025-09-01')||G.day===STORY.dayOfKey('2025-09-03'))},   /* 宿營認識的（CAMP-L1）：演宿營版（AA_205 6-2：已經認識，不換名字、不加熟悉）*/
    dialogue:[ {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:null,text:'（你坐下沒多久，後面的人用筆輕輕戳了一下你的肩膀。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:null,text:'（你坐下沒多久，有人把書包放到你旁邊的位子。）'},
      {if:{custom:G=>(G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe'))(G)&&G.flags.ZHE_CALLS_GE},speaker:'zhe',expression:'smile',text:'哥，早。'},
      {if:{custom:G=>(G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe'))(G)&&!G.flags.ZHE_CALLS_GE},speaker:'zhe',expression:'smile',text:'欸，早。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:'zhe',expression:'neutral',text:'你知道這附近中午都吃什麼嗎？我昨天在公館繞了半小時，最後吃便利商店。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},goto:'ask'},
      {speaker:'zhe',expression:'smile',text:'欸，不好意思，你知道這附近中午都吃什麼嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},speaker:'zhe',expression:'neutral',text:'我高雄上來的，昨天在公館繞了半小時，最後吃便利商店。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},speaker:'zhe',expression:'neutral',text:'我高雄上來的，這幾天中午都在便利商店解決。'},
      {label:'ask'},{choice:[{text:'「校門對面那排有一間麵店，便宜，份量也夠。」',consequences:{flags:{ZHE_W1_NOODLE:true}},goto:'noodle'},{text:'「往捷運站那邊走，店比較多。」',goto:'mrt'},{text:'「我也還在找。」',goto:'still'}]},
      {label:'noodle'},{speaker:'zhe',expression:'smile',text:'麵店喔，好。在哪？'},{speaker:null,text:'（你跟他講了大概的位置，他打進手機裡。）'},{goto:'name'},
      {label:'mrt'},{speaker:'zhe',expression:'neutral',text:'昨天就是在那邊繞的……好，我再去一次。'},{goto:'name'},
      {label:'still'},{speaker:'zhe',expression:'neutral',text:'好喔，那我中午再問問看別人。'},
      {label:'name'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},goto:'bell'},{speaker:'zhe',expression:'smile',text:'我阿哲。張哲維。'},{speaker:'player',text:'{name}。'},
      {label:'bell'},{speaker:null,text:'（老師走進來，教室安靜下來。阿哲把手機收進口袋。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},set:{MET_ZHE:true,ZHE_W1_CAMP:true}},{if:{custom:G=>!!G.flags.ZHE_W1_CAMP},goto:'end'},
      {set:{MET_ZHE:true},consequences:{rel:{zhe:{fam:1}}}},{label:'end'} ] },
  /* 四人房（AA_208 2-2；使用者 00:5x）：阿哲也住 203，9/1 第一堂課的早上在宿舍約一起走（取代教室裡的宿營版）。三個選項和回應照 AA_195 4-8、ZHE_W1_NOODLE 照記；不換名字、不加熟悉（宿營已經認識）*/
  { id:'ev_zhe_w1_dorm', title:'第一堂課的早上', participants:['zhe'], location:'dorm', trigger:'auto', time:[6,10], once:true, background:'blur', spawn:{npc:'zhe',dist:1.4,pose:'idle'},
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&!!G.flags.DORM_FOUR&&!G.flags.ZHE_W1_CAMP&&G.day===STORY.dayOfKey('2025-09-01')},
    dialogue:[ {speaker:null,text:'（早上，柏翰的床已經整理好了，人不在。）'},
      {if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'哥，你第一堂什麼？'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'欸，你第一堂什麼？'},
      {speaker:'player',text:'憲法。'},{speaker:'zhe',expression:'smile',text:'我也是。一起走。'},{speaker:'zhe',expression:'neutral',text:'中午吃什麼？我這三天都吃便利商店。'},
      {choice:[{text:'「校門對面那排有一間麵店，便宜，份量也夠。」',consequences:{flags:{ZHE_W1_NOODLE:true}},goto:'noodle'},{text:'「往捷運站那邊走，店比較多。」',goto:'mrt'},{text:'「我也還在找。」',goto:'still'}]},
      {label:'noodle'},{speaker:'zhe',expression:'smile',text:'麵店喔，好。在哪？'},{speaker:null,text:'（你跟他講了大概的位置，他打進手機裡。）'},{goto:'end'},
      {label:'mrt'},{speaker:'zhe',expression:'neutral',text:'昨天就是在那邊繞的……好，我再去一次。'},{goto:'end'},
      {label:'still'},{speaker:'zhe',expression:'neutral',text:'好喔，那我中午再問問看別人。'},
      {label:'end'},{set:{MET_ZHE:true,ZHE_W1_CAMP:true,ZHE_W1_DORM:true}} ] },
  /* 到教室（AA_208 2-2）：柏翰坐第一排正中間 */
  { id:'ev_bohan_w1_front', title:'第一排', participants:[], location:'classroom', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>!!G.flags.ZHE_W1_DORM&&typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},
    dialogue:[ {speaker:null,text:'（柏翰坐在第一排正中間，已經在看課本了。）'} ] },
  /* 9/2（二）國文第一堂：沛珊找教室（BB_168 2-1；BB_177 第 10 節：宿營認識的一律用已認識版、不記 PS_W1_SEEN）。上課前（beforeClass）演、下課接借筆記；不加數值、不出法律題目 */
  { id:'ev_ps_w1_room', title:'找教室', participants:['classmate_peishan'], location:'any', trigger:'class', beforeClass:'chinese_y1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&G.day===STORY.dayOfKey('2025-09-02')},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&((STORY.metAtCamp&&STORY.metAtCamp(G,'classmate_peishan'))||(G.flags&&G.flags.welcomeDay!=null))},goto:'camp'},   /* 宿營認識、或 8/31 迎新認識（welcomeDay，AA_310 第 1 節）：走「已認識」那一段 */
      {speaker:'classmate_peishan',expression:'neutral',text:'（拿著手機，對照門口的教室號碼）不好意思，請問這間是大一國文嗎？法律系那班。'},
      {choice:[{text:'「對。」',goto:'u1'},{text:'「我也在找，應該是這間。」',goto:'u2'}]},
      {label:'u1'},{speaker:'classmate_peishan',expression:'smile',text:'喔好，謝謝。'},{speaker:null,text:'（她進去，坐在你斜前面那排。）'},{goto:'useen'},
      {label:'u2'},{speaker:'classmate_peishan',expression:'smile',text:'那我們一起進去好了，錯了一起出來。'},{speaker:null,text:'（她先推門。）'},
      {label:'useen'},{set:{PS_W1_SEEN:true}},{goto:'end'},
      {label:'camp'},{speaker:'classmate_peishan',expression:'smile',text:'（在門口看到你，走過來）欸，{name}。你也是這間嗎？'},{speaker:'classmate_peishan',expression:'neutral',text:'我剛剛跑去另一棟，走錯了。'},
      {choice:[{text:'「對，這間。」',goto:'c1'},{text:'「我也差點走錯。」',goto:'c2'}]},
      {label:'c1'},{speaker:'classmate_peishan',expression:'smile',text:'好，那我跟你進去。'},{goto:'end'},
      {label:'c2'},{speaker:'classmate_peishan',expression:'neutral',text:'這邊的門牌好小。'},{speaker:null,text:'（她先推門。）'},
      {label:'end'} ] },
  { id:'ev_ps_w1_notes', title:'最後那段', participants:['classmate_peishan'], location:'any', trigger:'class', afterClass:'chinese_y1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-02')&&!!(G.events&&G.events.done&&G.events.done.ev_ps_w1_room)},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（轉過來）剛剛最後那段你有抄到嗎？他講好快。'},
      {choice:[{text:'「有，你要拍嗎？」',goto:'a'},{text:'「我也沒抄完。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（她拍了兩張。）'},{speaker:'classmate_peishan',expression:'smile',text:'謝謝。我下次會抄快一點。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'那我去問前面那個人。'},{speaker:null,text:'（她真的去問了。）'},
      {label:'end'} ] },
  /* 9/2（二）下午通識「電影與敘事」第一堂門口：明軒碰運氣（BB_168 3-1；114 學年起沒有人工加簽）。宿營認識的：第一句換成點個頭（BB_177 第 12 節），其餘照舊。記 MX_W1_SEEN，不算認識、不加數值 */
  { id:'ev_mx_w1_addclass', title:'通識第一堂門口', participants:['classmate_mingxuan'], location:'any', trigger:'class', beforeClass:'ge_film_y1s1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&G.day===STORY.dayOfKey('2025-09-02')},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'classmate_mingxuan')},goto:'camp'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'（站在門口看手機上的選課結果，看到你要進去）這堂你有選到喔？'},{goto:'ask'},
      {label:'camp'},{speaker:'classmate_mingxuan',expression:'neutral',text:'（點個頭）欸。你也加這門？'},
      {label:'ask'},{choice:[{text:'「有，運氣好。」',goto:'yes'},{text:'（點頭，進教室）',goto:'nod'}]},
      {label:'yes'},{speaker:'classmate_mingxuan',expression:'smile',text:'好好喔。我沒抽到。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'想說來第一堂看看，說不定有人退。'},
      {speaker:null,text:'（上課鐘響，老師走到門口。）'},{speaker:'老師',text:'這堂人數已經滿了。沒選到的同學，加選期間有人退就有機會，不用在門口等。'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'……好吧。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我去看另一堂，下一節的。'},{speaker:null,text:'（他走了。）'},{goto:'end'},
      {label:'nod'},{speaker:null,text:'（他往旁邊讓了一下，又低頭看手機。）'},
      {label:'end'},{set:{MX_W1_SEEN:true}} ] },
  { id:'ev_zhiruo_ge_group', title:'經原分組', participants:['heroine_02'], location:'putong', term:['Y1S1'], trigger:'auto', near:{npc:'heroine_02',r:5}, time:[12.1,13], weekday:[5], once:true, minWeek:{term:'Y1S1',week:4}, background:'blur',   /* AA_195 4-7 A4：看週次（第 4 週週五起；原本 day_min 10，主線第一天提早以後會跑到 9/12）。AA_120 7-5 第 2 項：使用者已定 Z2 在重修的經原第 4 週週五（AA_110 1-5）——只改觸發：大一上、週五經原下課後、普通教學館、第 4 週起（2025-09-26＝第 10 天）；對話不動 */   /* 可以是第一次見面（BB 6-1、AA_120 3-1）：還沒見過的話她先報名字 */
    dialogue:[ {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'surprised',text:'欸，是你。你也修經原喔？'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'neutral',text:'不好意思，你是法律系的嗎？剛剛點名有聽到。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。'},{speaker:'heroine_02',expression:'smile',text:'剛剛分組，我們那組缺一個人。要不要？期末報告是「一件你覺得不合理的定價」。'},{choice:[{text:'「好。網拍標錯價算不算？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:6,resp:3}},flags:{ge_group_zhiruo:true}},goto:'price'},{text:'「我報告很爛，妳確定？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:5,comf:3}},flags:{ge_group_zhiruo:true}}},{text:'「我已經有組了。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE'}]},end:true}]},{goto:'join'},{label:'price'},{speaker:'heroine_02',expression:'surprised',text:'標錯價喔？我看過那種新聞。原來你們上課會講這個。'},{speaker:'heroine_02',expression:'smile',text:'……好，這個可以拍成短片。我剪片。你負責講。'},{label:'join'},{speaker:'heroine_02',expression:'smile',text:'好，那我把你拉進群組，報告的事群組講。'},{stamp:['geGroupDay']} ] },   /* BB_95 2-4：「網拍標錯價」之後的接點（法律說法需法律審查：遊戲裡只當報告題目、不給結論）；加入小組群組（geGroupDay，phoneRules）*/
  /* 芷若 Z5 邀約（BB_96 3-5，交接包 v2 改）：大一下第 12～15 週（BB_161 ②）的週五 19–22 在 Café（她週五晚上的班；週六不在）、Z4（ev_zhiruo_secret）之後、有點熟以上、只一次。
     單身：照原文兩句；交往中（AA_108 第 5 節）：改成多人——「……方奕廷也去。……你要來嗎？」，數字沒有 aff。「早場我起不來。」不扣分：「好。那下次有午場再說。」（記 zrDeclineDay；三週後的週六＝午場 ev_zhiruo_matinee，BB_96 3-5b）。
     「幾點？」或劇透那一條都算答應：zhiruo_film_date＋zhiruoFilmDay（隔天週六 10:00 的早場＝出遊 ev_zhiruo_early_show，story3d.js 排）*/
  { id:'ev_zhiruo_film_night', title:'週末看片', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[12,13,14,15], weekday:[5],   /* BB_161 ②：Z4 之後的週五，第 12～15 週（原本只有第 12～13 週，Z4 晚一週就整條沒了）*/ time:[19,22], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],events:['ev_zhiruo_secret']}, background:'blur',
    dialogue:[ {unless:GF('heroine_02'),speaker:'heroine_02',expression:'smile',text:'明天我沒班，要去看《進城的那一週》重映，早場。'},   /* AA_209 附錄B §2 */
      {unless:GF('heroine_02'),speaker:'heroine_02',expression:'embarrassed',text:'……你要不要一起？不來也沒關係啦。'},   /* AA_209 附錄B §2 */
      {if:GF('heroine_02'),speaker:'heroine_02',expression:'smile',text:'明天我沒班。我要去看《進城的那一週》的重映，早場。方奕廷也去。……你要來嗎？'},   /* AA_209 附錄B §2（交往中的版本「店休」也改成「我沒班」）*/
      {choice:[{text:'「幾點？」',unless:GF('heroine_02'),consequences:{rel:{heroine_02:{aff:6,fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「幾點？」',if:GF('heroine_02'),consequences:{rel:{heroine_02:{fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》（三個人）'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「早場我起不來。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE',note:'看片邀約（她說下次有午場再說）'}],stamp:['zrDeclineDay']},goto:'no'},
        {text:'「我看過了。結局是——」',consequences:{rel:{heroine_02:{comf:2}}},goto:'spoil'}]},
      {label:'yes'},{speaker:'heroine_02',expression:'smile',text:'十點。公館的那間。你遲到我就自己進去。'},{goto:'end'},
      {label:'no'},{speaker:'heroine_02',expression:'neutral',text:'好。那下次有午場再說。'},{goto:'end'},
      {label:'spoil'},{speaker:'heroine_02',expression:'annoyed',text:'不准講！'},{speaker:'heroine_02',expression:'laugh',text:'……好啦，那部電影沒有結局可以劇透。你這樣算答應了嗎？'},
      {unless:GF('heroine_02'),set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{aff:4,fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》'}]},
      {if:GF('heroine_02'),set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》（三個人）'}]},{label:'end'} ] },
  /* 芷若 Z5 早場（BB_96 3-5 的新事件 ev_zhiruo_early_show；交接包 v2）：週五答應以後，週六 10:00（出遊）。2D「公館・二輪戲院」（虛構）→ 2D「豆漿店」。台詞照原文；表情 sad 改 thinking。
     單身：兩個人，記 WATCHED_FILM（方奕廷 Z6 的前置）；交往中：三個人（方奕廷），最後問「哪一個爸爸？」的是方奕廷，記 WATCHED_FILM_GROUP（不觸發 Z6）；不出 CG。
     三個「下次」記 Z5_NEXT（hers／mine／roommate；兩週內的回聲：片單、Café 點餐「你挑好了嗎？」、阿凱來 Café）。電影票根（房間物件）：BB_96 3-5c（story3d.js 的 roomItemList）；CG 候選（戲院門口，她拿著兩張票根）還沒有 */
  { id:'ev_zhiruo_early_show', title:'《進城的那一週》的早場', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,   /* 09:40 碰面 → 約 12:40 回來（10:00～12:00 電影、豆漿店）。戲院門口碰面那一拍：BB-B c86cd8cf（BCG-21 cg_two_tickets_heroine02）*/
    dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
      {unless:GF('heroine_02'),speaker:null,text:'九點四十，巷子裡的二輪戲院。她已經到了。'},{unless:GF('heroine_02'),cg:'cg_two_tickets_heroine02'},
      {unless:GF('heroine_02'),speaker:'heroine_02',expression:'smile',text:'（把兩張票舉到臉旁邊）早。……票我先買了。'},{unless:GF('heroine_02'),speaker:'heroine_02',expression:'smile',text:'早場的人比較少。我喜歡。'},
      {if:GF('heroine_02'),speaker:'heroine_02',expression:'neutral',text:'（看了一下手錶）方奕廷已經進去了。……他坐倒數第三排。我教的。'},   /* 戲院門口碰面那一拍（BB_96 3-5，BB-B c86cd8cf）：雙方單身＝BCG-21 疊在這一拍；交往中三個人、不出 CG */
      {scene:'豆漿店',bg:'soymilk_shop'},
      {speaker:'heroine_02',expression:'thinking',text:'我每次看都在想，那個媽媽進城看小孩，大家都很忙。'},
      {speaker:'heroine_02',expression:'thinking',text:'最後對她最好的，是一個不是她小孩的人。'},
      {speaker:'heroine_02',expression:'thinking',text:'……我在想，我媽會不會也是這樣。'},
      {speaker:'heroine_02',expression:'thinking',text:'我在台北，對每個客人都很好。'},
      {speaker:'heroine_02',expression:'smile',text:'（喝豆漿）好了，太沉重了。'},
      {speaker:'heroine_02',expression:'smile',text:'你覺得那個老闆，像不像演爸爸的那個演員？'},
      {unless:GF('heroine_02'),speaker:'player',text:'誰？'},
      {if:GF('heroine_02'),speaker:'npc_fangyt',expression:'neutral',text:'哪一個爸爸？'},
      {speaker:'heroine_02',expression:'smile',text:'……沒事。下次帶你看別部。'},
      {choice:[{text:'「下次妳挑。」',set:{Z5_NEXT:'hers'},goto:'h'},{text:'「下次我挑。」',set:{Z5_NEXT:'mine'},goto:'m'},{text:'「我下次帶我室友來。」',set:{Z5_NEXT:'roommate'},goto:'r'}]},
      {label:'h'},{speaker:'heroine_02',expression:'smile',text:'好。我列一張表給你。很長。'},{goto:'end'},
      {label:'m'},{speaker:'heroine_02',expression:'laugh',text:'你？你看過幾部電影？'},{speaker:null,text:'她笑。'},{speaker:'heroine_02',expression:'smile',text:'……好，你挑。我不笑你。大概。'},{goto:'end'},
      {label:'r'},{speaker:'heroine_02',expression:'neutral',text:'……好。'},
      {label:'end'} ],
    after:G=>{ G.flags.zhiruoFilmSeenDay=G.day; if(typeof SOCIAL==='undefined') return; const d=GFN(G,'heroine_02'); SOCIAL.remember('heroine_02',d?'WATCHED_FILM_GROUP':'WATCHED_FILM',d?'《進城的那一週》的早場（三個人）':'《進城的那一週》的早場'); } },
  /* Z5 的回聲「我下次帶我室友來」（BB_96 3-5）：早場之後兩週內走進 Café，阿凱真的來了一次（只一次）*/
  { id:'ev_kai_cafe_film', title:'聽說這裡有電影', participants:['kai','heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>G.flags.Z5_NEXT==='roommate'&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'聽說這裡有電影。'},{speaker:'heroine_02',expression:'neutral',text:'……這裡是咖啡廳。'} ] },
  /* 芷若的午場（BB_96 3-5b，BB-B 2026-10-16 補；Z5 被拒絕的後續）：Z5 選「早場我起不來。」（zrDeclineDay）之後第 3 週的週六 09:30 她傳訊息（story3d.js），「起得來。」＝11:40 公館二輪戲院（出遊）。
     散場（13:30，和 Z5 共用背景）兩個選項：「那下午要做什麼？」comf 3／「下次我早場起得來。」trust 3、ZR_EARLY_PROMISE（大二 Z7 的回聲）。
     單身：WATCHED_FILM（同 Z5 兩人版：Z6、BB_113 照樣出現）＋aff 3；交往中、她也知道（同 Z5 讀 knowsGF）：三個人、WATCHED_FILM_GROUP。ZR_MATINEE_SEEN＝房間的票根是午場那一張 */
  { id:'ev_zhiruo_matinee', title:'《父親的午後》的午場', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,   /* 11:40 開演 → 13:30 散場 → 走到溫州街約 14:00 */
    dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
      {speaker:null,text:'散場的時候，外面還是白天。'},
      {if:GF('heroine_02'),speaker:'npc_fangyt',text:'午場出來太陽還在。我每次都覺得被騙。'},{if:GF('heroine_02'),speaker:'heroine_02',expression:'smile',text:'……我也是。'},
      {speaker:'heroine_02',expression:'thinking',text:'（瞇起眼睛）午場最可惜的就是這個。'},
      {speaker:'heroine_02',expression:'thinking',text:'演了兩個小時，出來太陽還是一樣大。'},
      {speaker:'heroine_02',expression:'smile',text:'……可是也有好處。看完，還有一整個下午。'},
      {choice:[{text:'「那下午要做什麼？」',consequences:{rel:{heroine_02:{comf:3}}},goto:'a'},{text:'「下次我早場起得來。」',consequences:{rel:{heroine_02:{trust:3}},flags:{ZR_EARLY_PROMISE:true}},goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',expression:'smile',text:'我兩點要去溫州街。……還有半小時。你決定。'},
      {unless:GF('heroine_02'),speaker:null,text:'你們沿著新生南路慢慢走到溫州街。她一路在講剛剛那個父親說的話，講到一半停下來。'},
      {if:GF('heroine_02'),speaker:null,text:'你們三個人走到溫州街。她一路在講剛剛那個父親說的話，講到一半停下來。'},
      {speaker:'heroine_02',expression:'laugh',text:'……我講太多了。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',expression:'smile',text:'真的？那下次是早場。你說的，我記下來了。'},
      {label:'end'},{speaker:'heroine_02',expression:'smile',text:'今天這部，叫《父親的午後》。你不用記片名。記得是午場就好。'},{set:{ZR_MATINEE_SEEN:true}} ],
    after:G=>{ if(typeof SOCIAL==='undefined') return; const d=!!GFN(G,'heroine_02'); SOCIAL.remember('heroine_02',d?'WATCHED_FILM_GROUP':'WATCHED_FILM',d?'《父親的午後》的午場（三個人）':'《父親的午後》的午場'); if(!d) SOCIAL.adjust('heroine_02',{aff:3}); } },
  /* 方奕廷 Z6「隔壁房的人記得的事」（BB_96 3-6；交接包 v2）：大一下第 13～15 週（AA_243 #50：16 週制）平日 12–13 在校園找他說話；前置 WATCHED_FILM（兩個人看的那一版）、玩家沒有在交往、只一次。記 FANG_HINT */
  { id:'ev_fangyt_hint', title:'隔壁房的人記得的事', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[13,14,15], weekday:[1,2,3,4,5], time:[12,13], background:'blur',
    prereq:{memory:[{npc:'heroine_02',tag:'WATCHED_FILM'}],custom:G=>!GFN(G,'heroine_02')},
    dialogue:[ {speaker:'npc_fangyt',expression:'neutral',text:'你最近常去兩點半喔？'},   /* AA_209 2-1 第 4 列（BB_180；取代 AA_209 第 2 節和附錄 B 的版本）*/
      {speaker:'npc_fangyt',expression:'neutral',text:'我跟芷若高中同校。她那時候就常一個人去看二輪。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'好，我先去上課了。'},
      {mem:[{npc:'npc_fangyt',tag:'FANG_HINT',note:''}]} ] },
  /* 芷若 Z7「23:59」（BB_97 3-4，2026-10-16 18:2x 最終版：使用者「不要出現『交了』沒有上下文的台詞」；V3-B18）：外文系交換申請截止 2026-12-10（四）（AA-B b95cea49）。
     那晚 23:59 她私訊三則（英國那一間、十一點五十九分、下次你來店裡再說；story3d.js；祐廷有伴侶而且她知道＝沒有這三則，AA_112 8-1）。
     截止之後第一次走進 Café 就演，到大二上結束（第 16 週）都可以（原本七天）；開頭分「收到深夜訊息／沒收到」兩版。「妳跟妳媽說了嗎？」＝當晚 22:15 再一則（所以只在 22:00 以前演）。
     大二上結束都沒去：寒假第一天 21:00 一則；之後 Z7b（1/28，story3d.js）。之後 ev_zhiruo_bell 的「妳的交換申請交了嗎？」不再出現 */
  { id:'ev_zhiruo_applied', title:'她交件了', participants:['heroine_02'], location:'cafe', trigger:'auto', priority:9, once:true, term:['Y2S1'], time:[11,22], background:'blur',
    prereq:{events:['ev_zhiruo_secret'],memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],custom:G=>{ if(typeof STORY==='undefined'||!STORY.dayOfKey) return false; const d=STORY.dayOfKey('2026-12-10'); return d!=null&&G.day>d; }},
    spawn:{npc:'heroine_02',dist:1.6,pose:'idle'},
    dialogue:[ {if:{custom:G=>!!(G.msgs&&G.msgs.some(m=>m.tag==='zr_z7_msg'))},speaker:'heroine_02',expression:'neutral',text:'（看到你，放下手上的杯子）那天晚上那則，你看到了吧。'},
      {unless:{custom:G=>!!(G.msgs&&G.msgs.some(m=>m.tag==='zr_z7_msg'))},speaker:'heroine_02',expression:'neutral',text:'（看到你，放下手上的杯子）交換申請，我交了。截止那天晚上，英國那一間。'},
      {speaker:'heroine_02',expression:'serious',text:'十一點五十九分。我差一分鐘，就不交了。'},
      {speaker:'heroine_02',expression:'embarrassed',text:'交完手在抖，抖到十二點半。'},
      {speaker:'heroine_02',expression:'thinking',text:'如果沒錄取，就永遠不用跟我媽說。……很膽小吧。'},
      {choice:[{text:'「不會。」',consequences:{rel:{heroine_02:{trust:5,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你說「不會」'}]},goto:'no'},
        {text:'「妳跟妳媽說了嗎？」',set:{ZR_Z7_MOM:true},consequences:{rel:{heroine_02:{trust:4,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你問她跟媽媽說了沒'}]},goto:'mom'},
        {text:'「妳那時候說的家裡……」',if:{flagIs:{Z4_PICK:'family'}},consequences:{rel:{heroine_02:{trust:6}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請：她算過時差，媽媽十點打來接得到'}]},goto:'fam'}]},
      {label:'no'},{unless:{custom:G=>typeof ROM!=='undefined'&&ROM.knows(G,'heroine_02').length>0},speaker:'heroine_02',expression:'embarrassed',text:'……你說的喔。'},
        {if:{custom:G=>typeof ROM!=='undefined'&&ROM.knows(G,'heroine_02').length>0},speaker:'heroine_02',expression:'smile',text:'……嗯。謝謝。'},{goto:'end'},
      {label:'mom'},{speaker:'heroine_02',expression:'neutral',text:'還沒。今天十點，她會打來。'},{goto:'end'},
      {label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'你那時候說家裡比較重要。'},{speaker:'heroine_02',expression:'neutral',text:'我後來算了一下。她十點打來，英國那邊是下午兩、三點。'},{speaker:'heroine_02',expression:'smile',text:'我那個時間沒課。……接得到。'},   /* AA_360 第 3 節（第②級，採 BB_167 E1）：她自己去算時差，回答 Z4「她十點要打給誰」；「兩、三點」＝英國冬天、夏天差一小時（她在那邊一整年）。原本兩句「……我想了很久。」「後來我發現，我就是家裡的一部分。我去，家也跟著我去。」作廢 */
      {label:'end'},{speaker:'heroine_02',expression:'smile',text:'今天的咖啡我請。'} ],
    consequences:{stamp:['zrAppliedDay']} },
  // ── 語彤 arc ──
  { id:'ev_yutong_customer', title:'麵店的糾紛', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:9, once:true, minWeek:{term:'Y1S1',week:15}, term:['Y1S1','Y1S2'],   /* 只在大一（大一上第 15 週～大一下第 16 週；AA_140 G47 AA-B 裁定：沒觸發就不演，大二的事件 7 不依賴它）*/   /* 交接包 v1 A6 的週次：第 15 週起（v1 稽核：原本沒有下限）*/ prereq:{memory:[{npc:'heroine_03',tag:'SHARED_MEAL'}],custom:G=>{ if(typeof STORY==='undefined'||!STORY.fafuSat) return true; const f=STORY.fafuSat(G.day); return !!f&&f.wk<=1; }}, background:'blur',   /* AA-B 2026-10-16（G47 邊界）：下一個法服值班的週六在這週或下週才演；更遠（例如期中考週、寒假前）就先等，等到值班週六進到兩週內 */
    /* 語彤事件 3 改寫版（AA_11 事件 3；交接包 v1 第 1 節，2026-10-14）：大一的祐廷誠實地「不知道」。不出任何法律題目、不給錄音證據的法律結論。
       選「我知道誰會知道」：祐廷第一次私訊學姊（yutongAskSisDay），學姊當晚 22:30 回（BB_95 4-3），截圖轉給語彤：「……法服是什麼？」（大二她加入法服的伏筆；story3d.js 的 phoneRules）。
       裝懂：她記得（BLUFFED；大二第一次在麵店會問「這次你會說不知道嗎？」——AA_236 A4：語彤不加入法服）。結果三種都一樣：阿姨週六去了法服（ev_yutong_customer_after）*/
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
    dialogue:[ {speaker:null,text:'阿姨那個週六早上去了法服。值班的學長姐幫她把那天的進貨單、發票、監視器的時間整理好。'},{speaker:null,text:'客人看到阿姨準備得這麼齊，就沒有再來了。'} ] },
  /* 博雅小桌的常客（AA_178 ⑤；AA_115 L77、L93）：大一下第 11～12 週，這兩週內第三天在博雅小桌坐下，鄰座不具名的常客一句；只一次、不記旗標 */
  { id:'ev_y1_boya_regular', title:'你又在這裡', participants:[], location:'boya', trigger:'seat', seatRoom:'study', term:['Y1S2'], weeks:[11,12], once:true, background:'blur',
    prereq:{custom:G=>{ const S=typeof STORY!=='undefined'?STORY:null, a=S&&S.termDay?S.termDay('Y1S2',11,1):null; if(a==null) return false; const H=G.habits&&G.habits['seat:boya:study']; return !!H&&(H.days||[]).filter(d=>d>=a&&d<=a+13).length>=3; }},
    dialogue:[ {speaker:'鄰座的常客',text:'你又在這裡。'} ] },
  { id:'ev_yutong_absent', title:'她今天沒來', term:['Y1S2'], weeks:[8,9], participants:['heroine_03'],   /* 交接包 v2（AA_11 事件 4）：大一下期中這兩週的週二、週四晚上；原因改輕＝阿姨扭到手腕（旗標名 yutong_hospital 不改，相容）；AA_178 ①：阿姨兩句的說話人＝阿姨、只在大一下 */ location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true, day_min:8, prereq:{memory:[{npc:'heroine_03',tag:'TALKED_FAMILY'}]}, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台後面沒有語彤。阿姨右手包著護腕，用左手撈麵。'},{speaker:'阿姨',text:'手扭到了，這禮拜都是她在顧，顧到打烊。今天我叫她先回去睡。'},{unless:{flags:['dating_heroine_03']},speaker:'阿姨',text:'你是她同學喔？她喔，累了也不會講。'},/* AA_209 附錄A §2 */
      {if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'（看了你一下）你是語彤那個喔。'},{if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'她沒跟你講齁。她說講了你一定會跑來幫忙。'},{if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'你吃你的。她問的話，就說你自己看到的。'},   /* AA_313 4-4（「不要跟別人說」模板的變形）*/{if:{flags:['dating_heroine_03']},set:{YT_AUNT_KNOWS:true}},   /* 阿姨知道（1B-03 事件 9 讀，AA_316）*/   /* 交往中的版本（AA_11 事件 4，AA-C 2026-10-17 e2bdcece；AA_215／AA_216 大一下 #3：大一就可能交往）*/
      {set:{yutong_hospital:true}},{unless:{flags:['dating_heroine_03']},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨扭到手腕，那週她顧店到打烊'}]},{if:{flags:['dating_heroine_03']},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨扭到手腕，那週她顧店到打烊；阿姨說她怕你來幫忙'}]} ] },
  { id:'ev_yutong_thanks', title:'圖書館三樓', term:['Y1S2'], participants:['heroine_03'],   /* 交接包 v1：大一下以後才觸發（AA_11 事件 5 延後）；AA_259 第 4 節第 4 點：收到大二上，不要大三才觸發；AA_374 第 9 項：只在大一下（大二上用現在式講不對）、和 ev_yutong_midterm_week 互斥 */ location:'library', trigger:'interact', priority:9, once:true, time:[21,22], prereq:{flags:['yutong_hospital'],notEvents:['ev_yutong_midterm_week']}, background:'blur',   /* AA_178 ②＋AA_177：麵店 21:00 打烊以後、總圖閉館以前（「店收了才來的」）*/
    dialogue:[ {speaker:'heroine_03',expression:'tired',text:'……阿姨跟你講了吧。'},{if:{flags:['dating_heroine_03']},speaker:'heroine_03',expression:'neutral',text:'我叫她不要講的。'},{speaker:'heroine_03',expression:'neutral',text:'她每次都這樣。沒事，手腕扭到而已。'},{choice:[{text:'（什麼都不問，把自己的筆記推過去）',consequences:{rel:{heroine_03:{comf:8,trust:5,aff:3}},mem:[{npc:'heroine_03',tag:'HELPED',note:'什麼都沒問，把筆記給她'}]},goto:'notes'},{text:'「妳可以講。講完就算了。」',consequences:{rel:{heroine_03:{trust:6,comf:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'你說她可以講'}]},goto:'talk'},{text:'「妳看起來很累，回去睡吧。」',consequences:{rel:{heroine_03:{comf:2}}},goto:'sleep'}]},{label:'notes'},{speaker:'heroine_03',expression:'surprised',text:'……'},{speaker:null,text:'（她看了一下，把筆記拉到自己面前。）'},{speaker:'heroine_03',expression:'smile',text:'這頁我抄一下就還你。'},/* AA_209 附錄A §2 */{goto:'end'},{label:'talk'},{speaker:'heroine_03',expression:'sad',text:'講了也沒用啦，她的手又不會比較快好。'},/* AA_209 附錄A §2 */{goto:'end'},{label:'sleep'},{speaker:'heroine_03',expression:'neutral',text:'店收了才來的。這裡比較安靜。'},{label:'end'},
      {if:{flags:['dating_heroine_03']},speaker:null,text:'（她把書推到一邊，趴在桌上。）'},{if:{flags:['dating_heroine_03']},speaker:'heroine_03',expression:'tired',text:'閉館的時候叫我。'} ] },   /* 交往中的版本（AA_11 事件 5，AA-C e2bdcece；AA_216 大一下 #4）*/
  // ── 子晴 arc ──
  { id:'ev_ziqing_gongguan_night', title:'公館的晚上', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:6, once:true, time:[21,25], term:['Y1S1','Y1S2'], prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* AA_207 §6（AA-B 2026-10-23）：開場「你怎麼這麼晚還在公館？」（原本問他明天是不是有課那一句；「欸不是」每學期合計上限 2，所以不加）。Q3（BB_95 2-7；BB-B 75c1b2b1）：整個事件只一次，之後宵夜不再有拍照 */
    dialogue:[ {speaker:'heroine_04',expression:'laugh',text:'你怎麼這麼晚還在公館？'},{speaker:'heroine_04',expression:'smile',text:'我剛從網咖出來，打了三小時。你室友還活著嗎？他三天沒回訊息。'},{choice:[{text:'「活著。在追 bug。」',consequences:{rel:{heroine_04:{fam:3,comf:2},kai:{fam:1}}}},{text:'「妳們資工系的都不睡覺？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'sleep'},{text:'「要不要吃宵夜？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},consequences:{rel:{heroine_04:{fam:4,comf:4}},mem:[{npc:'heroine_04',tag:'SHARED_MEAL',note:'公館宵夜'}],money:-80,energy:8,advance:0.6},goto:'food'}]},{goto:'end'},{label:'sleep'},{speaker:'heroine_04',expression:'laugh',text:'睡覺是弱者的行為。……我下午睡了四小時。'},{goto:'end'},{label:'food'},{if:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。阿凱也在，他在排隊。'},{unless:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。巷子裡那家開到兩點。'},{speaker:null,text:'她點的東西是你的三倍。'},{unless:{flags:['ZIQING_MAKING_SOMETHING']},goto:'photo'},{goto:'end'},{label:'photo'},{speaker:null,text:'滷味點完，她拿手機拍了一張照片。'},{speaker:'player',text:'拍什麼？'},{speaker:'heroine_04',expression:'neutral',text:'素材。我在做一個東西。……你不要問。'},{speaker:'heroine_04',expression:'thinking',text:'（三秒後）你可以問一點點。'},{speaker:'heroine_04',expression:'embarrassed',text:'……不行，還是不要問。'},{if:{flags:['dating_kexin']},speaker:'kai',expression:'smile',text:'她每次都拍，從來不給看。'},{set:{ZIQING_MAKING_SOMETHING:true}},{label:'end'} ] },   /* BB_95 2-7：交往中（AA_112 8-1：不放兩個人單獨的夜晚約會型場面）阿凱也在、三個人一起吃；拍照只一次（ZIQING_MAKING_SOMETHING，大一下 Q6 的伏筆）*/
  /* 子晴 Q6「測試我的遊戲。現在。」（BB_96 4-2 改門檻與台詞，交接包 v2）：原本前置要 FRIEND，沒有事件會讓她到朋友，永遠走不到 →
     Q4（CONTEST_DAY）或 Q5（CLAPPED）任一發生過＋有點熟以上；大一下第 11 週以後、週一三晚上吉他社的時段（萬才館；交往中的玩家也是社課時段，旁邊還有社員）。
     Q4 沒遇到的玩家，Q5（第 14 週成發）之後才會有。記 PLAYTESTED（新）；第三個選項 FIRST_BUG（第 5 節「插座修好了」）。表情 serious → laugh（第一次 embarrassed 留給 Q5）。
     id 不改：舊存檔演過的不再演。好感數字、所有玩家都在社課時段、找插座的三句旁白：BB b395706（2026-10-14 補）*/
  { id:'ev_ziqing_secret_game', title:'她在做的東西', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[11,12,13,14,15], weekday:[1,3], time:[19,21],
    prereq:{stage:{npc:'heroine_04',min:'FAMILIAR'},custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','CONTEST_DAY')||SOCIAL.has('heroine_04','CLAPPED'))}, background:'blur',
    dialogue:[ {speaker:'heroine_04',expression:'serious',text:'（把筆電轉過來）欸，你幫我玩一下，現在。'},{speaker:'heroine_04',expression:'serious',text:'一隻在校園裡找插座的貓，我做半年了。'},{speaker:'heroine_04',expression:'neutral',text:'還沒給別人玩過。阿凱看過，可是他是工程師，不算。'},   /* AA_209 附錄B §2 */
      {speaker:null,text:'（你接過筆電。一隻灰白色的小貓，脖子掛著一支沒電的手機。）'},{speaker:null,text:'（你點了三個地方：文學院的走廊、霖澤館的穿堂、總圖二樓靠窗那排。）'},{speaker:null,text:'（最後一個插座，貓坐下來，手機上的電池滿了。剛好三十秒。）'},
      {choice:[{text:'「貓為什麼要找插座？」',consequences:{rel:{heroine_04:{fam:5,comf:5,aff:3}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'cat'},
        {text:'「這比比賽有用多了。」',if:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'better'},
        {text:'「這比我想的好玩。」',unless:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'better'},
        {text:'「總圖二樓靠窗那排的插座是壞的。」',consequences:{rel:{heroine_04:{trust:6,resp:5}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}],flags:{FIRST_BUG:true}},goto:'bug'}]},
      {label:'cat'},{speaker:'heroine_04',expression:'serious',text:'因為牠的手機沒電了。'},{speaker:'heroine_04',expression:'laugh'},{speaker:null,text:'（她說得很認真，然後自己笑到趴在桌上。）'},{goto:'end'},
      {label:'better'},{unless:GF('heroine_04'),speaker:'heroine_04',expression:'smile',text:'……真的？那第二關做好，你再幫我玩。'}   /* AA_525 1-2：原句「那你下禮拜再來，幫我玩第二關。」（之後是 2026-06-27 期末鉤子的 zq_play）*/,{if:GF('heroine_04'),speaker:'heroine_04',expression:'smile',text:'好，那我把它做完。做完你再玩一次。'},{goto:'end'},
      {label:'bug'},{speaker:null,text:'（她愣住，打開程式碼。）'},{speaker:'heroine_04',expression:'surprised',text:'……真的假的。我加進去。'},
      {label:'end'} ] },
  /* 阿凱 K2「工程師也是人」（BB_96 4-3，交接包 v2，新事件）：子晴 Q6 之後第一個在宿舍和他說話的晚上（他 18 點以後都在宿舍）；兩週內沒說到話就不演。
     原稿最後一句「算了。反正名單上不會有我。」刪掉（BB：太消沉）。三個選項各記一個旗標／記憶，之後的 K4（BB_98）、BB_108 回收；好感數字 BB b6b21d6 補 */
  { id:'ev_kai_engineer', title:'工程師也是人', participants:['kai'], location:'dorm', trigger:'interact', priority:7, once:true, time:[18,26],
    prereq:{events:['ev_ziqing_secret_game'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_ziqing_secret_game; return d!=null&&G.day-d<=14; }}, background:'blur',
    dialogue:[ {speaker:'kai',expression:'neutral',text:'她跟我說，我是工程師，不算玩家。'},{speaker:'kai',expression:'tired',text:'……工程師也是人啊。'},
      {choice:[{text:'「你要跟她說。」',consequences:{rel:{kai:{fam:2,trust:2}},flags:{TOLD_KAI_TELL_HER:true}},goto:'tell'},
        {text:'「你想被寫進去嗎？」',consequences:{rel:{kai:{trust:4,comf:2}},mem:[{npc:'kai',tag:'KAI_WANTS_CREDIT',note:''}]},goto:'want'},
        {text:'「下次測試我叫你一起。」',consequences:{rel:{kai:{fam:3,comf:3}},flags:{KAI_JOINS_TEST:true}},goto:'join'}]},
      {label:'tell'},{speaker:'kai',expression:'neutral',text:'說什麼，「請把我寫進去」？很遜。'},{goto:'end'},
      {label:'want'},{speaker:null,text:'（他想了很久。）'},{speaker:'kai',expression:'neutral',text:'……想。'},{goto:'end'},
      {label:'join'},{speaker:'kai',expression:'smile',text:'好。'},{speaker:null,text:'（他轉回螢幕，打字變快了。）'},
      {label:'end'} ] },
  /* 子晴 Q4 比賽那天（BB_96 4-1 改寫，交接包 v2）：她週六的作息在公館（13–16），原本放在 Café 走不到 → 公館騎樓的長椅、只在比賽那一個週六（大一下第 8 週的週六，
     第 8～9 週之間）、前置 v1 Q2 問過比賽（ARGUED_ABOUT_CAREER）；三個選項都沒有正解（刪掉「有一點。但明年還有。」comf −2）；記 CONTEST_DAY（Q6 的前置之一）。
     id 不改：舊存檔在 Café 演過的不再演。錢（BB 382e9e2）：便利商店的罐裝咖啡一罐 −35（舊版 Café 的第四杯 −120）；選「陪她喝第四罐」的玩家自己也喝了一罐，再 −35 */
  /* 子晴 Q4（BB_96 4-1，BB-B 4ab575c7；AA_140 G05）：週六 15～18 點（她 14:00 起床、15:00 以後才出門）。
     AA_360 第 4 節（第②級，使用者 10-17 回 BB-LOGIC-16）：只有比賽那個週六（第 8 週）；原本錯過延到第 9 週週六「我上週六也坐在這裡」那一版拿掉——她不會為了祐廷再坐一次。
     錯過的玩家：第 9～11 週第一次和她說話，開頭多她一句（CONTEST_HEARD，story3d.js 的 S.contestHeard）。舊存檔演過第 9 週那一版的照舊（記憶的備註照舊） */
  { id:'ev_ziqing_contest_day', title:'比賽那天', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[8], weekday:[6], time:[15,18], prereq:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]}, background:'blur',
    dialogue:[ {speaker:null,text:'（她坐在騎樓的長椅，旁邊三個空的咖啡罐。）'},
      {speaker:'heroine_04',expression:'tired',text:'……今天是那個比賽。系上的人現在都在會場。'},{speaker:'heroine_04',expression:'tired',text:'我在這裡喝第三罐咖啡。'},
      {speaker:'heroine_04',expression:'neutral',text:'你說，我是不是很爛。'},
      {choice:[{text:'「妳不想去，就不是爛。」',consequences:{rel:{heroine_04:{trust:8,comf:4}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'brave'},
        {text:'「現在去還來得及嗎？」',consequences:{rel:{heroine_04:{resp:4,trust:3}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'late'},
        {text:'（陪她喝第四罐）',consequences:{rel:{heroine_04:{comf:7}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}],money:-35},goto:'drink'}]},
      {label:'brave'},{speaker:'heroine_04',expression:'smile',text:'……你這樣講，好像我很勇敢。'},{speaker:null,text:'（她笑。）'},{speaker:'heroine_04',expression:'laugh',text:'我只是怕輸。'},{goto:'end'},
      {label:'late'},{speaker:'heroine_04',expression:'tired',text:'來不及了。第一輪已經結束了。'},{speaker:null,text:'（她把手機蓋在長椅上。）'},{speaker:'heroine_04',expression:'laugh',text:'……好爽。好爛。兩個都有。'},{goto:'end'},
      {label:'drink'},{speaker:'heroine_04',expression:'smile',text:'欸不是，你也喝？'},{speaker:'player',text:'嗯。'},{speaker:'heroine_04',expression:'smile',text:'……你很奇怪。'},{speaker:null,text:'（她第一次沒有吐槽下去。）'},
      {label:'end'},{speaker:'heroine_04',expression:'smile',text:'……第四罐。你請。'} ], consequences:{money:-35} },
  // ── 溫學姊 arc ──
  /* W8「今天先不改了」（BB_97 2-3 完整替換舊的「她撐不住的那天」；AA_177 第 8 節①）：大二上第 12 週她在 Café 的每一晚（週一、二、四 19～22），走到她旁邊就開始。
     前置：和她「朋友」以上，或有 NOTICED_HER／HELPED／GAVE_HER_NOTE 其中一個；HEARD_PROF_XU 不是前置（沒有的人「許老師說得對」換成「今天被問了一句話，我答不出來」）。
     四個選項都出必要 CG「熱水」（BCG-01，BB 第二版通過）；不崩潰、不哭、不寫「不想念法律」；表情 tired → smile。後面讀 W8 的條件改讀「第 12 週以後」（STORY.sisW8）。
     沒演到的玩家（不熟或沒到）：11/27（五）21:00 讀書會群組她請假、Kevin 在家族群組問（story3d.js phoneRules）*/
  { id:'ev_sis_collapse', retired:'BB_207 第 1 節（AA_218 第 8 節）：W8 作廢，熱水（BCG-01）移到大一上的 ev_sis_hot_water；定義留給已經演過的舊存檔', title:'今天先不改了', participants:['heroine_05'], location:'cafe', trigger:'auto', term:['Y2S1'], weeks:[12], weekday:[1,2,4], time:[19,22], once:true, priority:10, near:{npc:'heroine_05',r:3.5},
    prereq:{custom:G=>{ if(typeof SOCIAL==='undefined') return false; const r=G.social&&G.social.rel&&G.social.rel.heroine_05; return !!(r&&r.fam>=40&&r.trust>=25)||['NOTICED_HER','HELPED','GAVE_HER_NOTE'].some(t=>SOCIAL.has('heroine_05',t)); }}, background:'blur', cg_id:'cg_hot_water_heroine05',   /* 「朋友」看實際的數值：friendLevel 在 W8 以前把學姊壓在「有點熟」（BB_120 1-1 的台詞上限），不能拿來當 W8 的前置 */
    dialogue:[ {speaker:null,text:'（吧檯旁的單人座。研究計畫攤開，紅筆劃了半頁。保溫瓶是空的。）'},
      {speaker:'heroine_05',expression:'tired',text:'你怎麼會在這。'},{speaker:'heroine_05',expression:'tired',text:'……坐吧。我剛好想要一個不是法服的人。'},
      {if:{memory:[{npc:'heroine_05',tag:'HEARD_PROF_XU'}]},speaker:'heroine_05',expression:'tired',text:'我改了七次。許老師說得對。'},
      {unless:{memory:[{npc:'heroine_05',tag:'HEARD_PROF_XU'}]},speaker:'heroine_05',expression:'tired',text:'我改了七次。今天被問了一句話，我答不出來。'},
      {speaker:'heroine_05',expression:'tired',text:'我選這個題目，是因為它會過。'},{speaker:'heroine_05',expression:'tired',text:'我從高中開始，每一步都選會過的。'},
      {speaker:'heroine_05',expression:'tired',text:'三件事。一，這份計畫今天要改完。二……'},
      {speaker:'heroine_05',expression:'tired',text:'（停住，看著空的保溫瓶）……二，我好像有點累。'},
      {speaker:'heroine_05',expression:'neutral',text:'三，我想試一件從來沒做過的事：今天先不改了。'},
      {choice:[{text:'「那妳想做什麼？」',consequences:{rel:{heroine_05:{trust:9}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她說「不知道」的感覺還不錯'}]},set:{SIS_W8:'what'},goto:'a'},
        {text:'「學姊，妳只是累了。」',consequences:{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'「我只是累了。這句話我以前不讓自己說。」'}]},set:{SIS_W8:'tired'},goto:'b'},
        {text:'「今天不要改了。」',consequences:{mem:[{npc:'heroine_05',tag:'TOLD_HER_STOP',note:''}]},set:{SIS_W8:'stop'},goto:'c'},
        {text:'（把她的保溫瓶拿去吧檯，裝滿熱水，不是咖啡）',consequences:{mem:[{npc:'heroine_05',tag:'HELPED',note:'保溫瓶裝了熱水'}]},set:{SIS_W8:'water',HOT_WATER:true},goto:'d'}]},
      {label:'a'},{speaker:null,text:'她想了很久。'},{speaker:'heroine_05',expression:'neutral',text:'……我不知道。'},{speaker:null,text:'然後笑了。'},{speaker:'heroine_05',expression:'smile',text:'說『不知道』的感覺，還不錯。'},{goto:'cg'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'對。'},{speaker:null,text:'她點頭。'},{speaker:'heroine_05',expression:'smile',text:'我只是累了。這句話我以前不讓自己說。'},{goto:'cg'},
      {label:'c'},{speaker:'heroine_05',expression:'smile',text:'我剛剛就這樣說了。'},{speaker:null,text:'她把計畫闔上。'},{speaker:'heroine_05',expression:'neutral',text:'……我要回家了。你也早點回去。'},{goto:'cg'},
      {label:'d'},{speaker:null,text:'她喝了一口，愣住。'},{speaker:'heroine_05',expression:'surprised',text:'……是熱水。'},{speaker:'player',text:'嗯。'},{speaker:null,text:'她雙手抱著保溫瓶，笑了。'},{speaker:'heroine_05',expression:'smile',text:'好。今天就喝這個。'},
      {label:'cg'},{cg:'cg_hot_water_heroine05'},
      {speaker:'heroine_05',expression:'smile',text:'明天我還是會列三件事。'},{speaker:'heroine_05',expression:'smile',text:'今天，先列到二。'} ] },
  /* W9「她沒有去面試」（BB_97 2-4；AA_177 第 8 節③）：11/28（六）9:00～10:00 總圖門口的台階（她這一天的作息），和她「有點熟」以上；所有玩家都是偶遇、沒有訊息；
     沒遇到＝沒有這一場（寒假 M2 照樣發生）。記 SKIPPED_INTERVIEW（之後的回聲讀，不是 M2 的前置）。立繪：面試的西裝 heroine_05/formal（LAWWW2-B 4e812ce5、BB-B ART_APPROVED，每句 outfit:'formal'）*/
  { id:'ev_sis_skip_interview', retired:'BB_207 第 1 節：推甄整段取消，W9 作廢；定義留給已經演過的舊存檔', title:'她沒有去面試', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[12], weekday:[6], time:[9,10], once:true, near:{npc:'heroine_05',r:4},
    prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',outfit:'formal',expression:'serious',text:'面試九點半。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我八點就到了。在門口站了二十分鐘，然後走來這裡。'},
      {speaker:'heroine_05',outfit:'formal',expression:'serious',text:'（看著進出總圖的人）我從來沒有不去過任何一件事。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'第一次沒做完一件事。像少穿了一隻鞋。'},
      {choice:[{text:'「現在去還來得及。」',goto:'a'},{text:'「那就不要去。」',goto:'b'},{text:'「我要進去念書。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我知道。'},{speaker:null,text:'她沒有動。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我在等自己想去。等了二十分鐘，沒有等到。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'你說得好簡單。'},{speaker:null,text:'她笑了。'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'……可是好像真的這麼簡單。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'她站起來：'},{speaker:'heroine_05',outfit:'formal',expression:'neutral',text:'我也進去。'},{speaker:null,text:'她坐在閱覽室另一排。九點半，她看了一下手錶，把手錶拿下來，放進口袋。'},
      {label:'end'},{speaker:'heroine_05',outfit:'formal',expression:'neutral',text:'我會再考一次。一般考試，二月。'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'這次，我要先想好為什麼。'},
      {mem:[{npc:'heroine_05',tag:'SKIPPED_INTERVIEW',note:'11/28 她沒有進面試的門'}]} ] },
  { id:'ev_sis_office_together', title:'許教授的研究室', participants:['heroine_05','prof_xu'], location:'wancai', trigger:'interact', priority:8, once:true, prereq:{memory:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}],grad:{min:'CURIOUS'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'我等一下要去許老師那邊。你要跟嗎？他喜歡大學部的來問笨問題。'},{choice:[{text:'「好。」',consequences:{grad:{bump:'跟學姊去許教授研究室',field:'公法'},prof:{prof_xu:{kind:'office',delta:3,note:'跟溫書瑀來研究室'}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'一起去研究室'},{npc:'prof_xu',tag:'FIRST_MET'}]},goto:'go'},{text:'「我還沒準備好問問題。」',consequences:{rel:{heroine_05:{fam:1}}},end:true}]},{label:'go'},{speaker:'prof_xu',expression:'neutral',text:'書瑀，這位是？……大學部的。你為什麼來？'},{choice:[{text:'「想知道研究所在做什麼。」',consequences:{prof:{prof_xu:{kind:'research',delta:2}}}},{text:'「學姊叫我來的。」',consequences:{prof:{prof_xu:{kind:'office',delta:1}}}}]},{speaker:'prof_xu',expression:'smile',text:'好。研究所在做的事就是：找到一個你不問會睡不著的問題。你有嗎？'},{speaker:'player',text:'……還沒有。'},{speaker:'prof_xu',expression:'neutral',text:'那就先上課。有了再來。'},{speaker:'heroine_05',expression:'smile',text:'（小聲）他對你算客氣了。'} ] },
  // ── 教授 ──
  /* AA_522（企劃線 fcc93126e，AA-C 定稿；NPC-STORY2-1028）：教授的研究室照學期換。
     第 1 節周教授（ev_prof_zhou_office）：萬才館週四 15:12～16:30、冷卻 6 天照舊；大一上、大一下、大二上（AA_376 #19：大三不演）。每學期的題目各問一次（記 ZHOU_ASKED＝{學期:[題]}；
       舊存檔：大一上原本的兩題有 zhou_88／zhou_book 筆記＝問過），那學期問完就不觸發（不留只剩「沒事。」的選單）；推薦書只有大一上。招呼一次一句，上面的先（1-2 的表）。
       新的民法五題（表見代理、價目表、無因管理、債務不履行三種、消滅時效）都是 LEGAL_REVIEW_REQUIRED，審過才算定稿；筆記內文稿上只寫了 zhou_169，其他四則用周教授那兩句原文。
       1-3 大四下：專題下課後 15:12～16:30 去萬才館研究室，一次（ZHOU_ASKED.Y4S2）；記 mem ZHOU_Y4。他週一下課後在萬才館＝課表（CLS.profWhere）。
         第 8 節第 4 點（f36dfe3cf）：第 10 週專題（「回顧大一的案例」）下課的時候他說一句「{name}，下課來研究室一趟。」（ev_prof_zhou_y4_call）；那天 15:12～16:30 去就演，
         沒去的，第 11～13 週的週一同一時段去也演（原本只有第 11 週週一那一天、沒有提示）。
     第 3 節林教授：3-1 下課後（ev_prof_lin_after）開頭照第幾次輪四種（第五次起從頭）、最後一句第一次照舊、之後「下週見。」（第幾次＝G.events.done，演到第 n 次時是 n−1）；
       3-2 研究室（ev_prof_lin_office，新）：大三上週二 14:00～16:30 萬才館、冷卻 7 天、最多三次、要先演過 3-1；她那個時間在萬才館＝story3d.js 的 S.PROF_OFFICE；題庫抽題照 3-1（使用者提供的刑訴題庫）；
       最後一句照第幾次；第三句以後選了刑事判決研討的，大四上第一次上那堂課旁白一句（ev_prof_lin_nod）。新題目、研究室的教授紀錄照現有的辦公時間題（office +2）*/
  ...(()=>{ const TT=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, TID=G=>{ const t=TT(G); return t?t.id:null; }, WK=G=>{ const t=TT(G); return t?t.week|0:0; },
      NOTE=(G,id)=>Array.isArray(G.notes)&&G.notes.some(n=>n&&n.id===id), ZNOTES=G=>Array.isArray(G.notes)&&G.notes.some(n=>n&&/^zhou_/.test(String(n.id))),
      ZQ={Y1S1:['q88','book','agency'],Y1S2:['offer','gestio'],Y2S1:['types','prescr'],Y4S2:['y4']}, ZOLD={q88:'zhou_88',book:'zhou_book'},
      zAsked=(G,t,k)=>{ const A=G.flags&&G.flags.ZHOU_ASKED, L=A&&typeof A==='object'&&Array.isArray(A[t])?A[t]:[]; return L.includes(k)||(t==='Y1S1'&&!!ZOLD[k]&&NOTE(G,ZOLD[k])); },
      zCan=(G,k)=>{ const t=TID(G); return !!t&&(ZQ[t]||[]).includes(k)&&!zAsked(G,t,k); },
      zLeft=G=>{ const t=TID(G); return (ZQ[t]||[]).filter(k=>!zAsked(G,t,k)).length; },
      zMark=(G,k)=>{ const t=TID(G), F=G.flags; if(!t) return; if(!F.ZHOU_ASKED||typeof F.ZHOU_ASKED!=='object') F.ZHOU_ASKED={}; const L=Array.isArray(F.ZHOU_ASKED[t])?F.ZHOU_ASKED[t]:(F.ZHOU_ASKED[t]=[]); if(!L.includes(k)) L.push(k); },
      zY4=G=>TID(G)==='Y4S2',
      zFirst=(G,t)=>{ if(TID(G)!==t) return false; const l=G.events&&G.events.last&&G.events.last.ev_prof_zhou_office; if(l==null) return true; const lt=typeof CALENDAR!=='undefined'?CALENDAR.termOf(l):null; return !lt||lt.id!==t; },   /* 這學期第一次來（演完才記 last）*/
      zGreet=G=>G.flags&&G.flags.classAnswerPlus?'plus':(zFirst(G,'Y1S2')?'y1s2':(zFirst(G,'Y2S1')?'y2s1':'else')),
      CU=f=>({custom:f}), Z=(t,ex)=>({speaker:'prof_zhou',expression:ex||'neutral',text:t}), ZOFF=n=>({prof:{prof_zhou:{kind:'office',delta:2,note:n}}}),
      LA=G=>(G.events&&G.events.done&&G.events.done.ev_prof_lin_after)|0, LO=G=>(G.events&&G.events.done&&G.events.done.ev_prof_lin_office)|0,
      L=(t,ex)=>({speaker:'prof_lin',expression:ex||'neutral',text:t}),
      BGD=()=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg('prof_door'):'blur';   /* AA_522 第 7 節：周教授、林教授研究室的 2D 背景共用 prof_door（研究室門口；getter：圖後來才登錄也拿得到）*/
    return [
    { id:'ev_prof_zhou_office', title:'周教授的研究室', participants:['prof_zhou'], location:'wancai', trigger:'interact', priority:6, cooldown_days:6, weekday:[1,4], time:[15.2,16.5], get background(){ return BGD(); }, term:['Y1S1','Y1S2','Y2S1','Y4S2'],   /* AA_376 #19：大三不演；大四下只有 1-3 那一次（週一）*/
      prereq:CU(G=>zY4(G)?(G.weekday===1&&WK(G)>=10&&WK(G)<=13&&zLeft(G)>0):(G.weekday===4&&zLeft(G)>0&&!(typeof STORY!=='undefined'&&STORY.civ1Week&&STORY.civ1Week(G)))),   /* 1-3：第 10～13 週的週一（第 8 節第 4 點）；第 9 節第 1 點（a3ea3918e）：民總第一堂那一週（週一～週日，STORY.civ1Week；這個檔比 story3d.js 早載入，執行時才看）不演，先說 talkProf 那兩句，下一個週四開始 */
      dialogue:[ {if:CU(zY4),goto:'y4'},
        Object.assign({if:CU(G=>zGreet(G)==='plus')},Z('「你上次答得不錯。有問題？」')),Object.assign({if:CU(G=>zGreet(G)==='y1s2')},Z('債總了。民總讀完了嗎？')),Object.assign({if:CU(G=>zGreet(G)==='y2s1')},Z('債總二上完，你們大四才會再遇到我。有問題？')),Object.assign({if:CU(G=>zGreet(G)==='else')},Z('「有問題就問。沒問題就回去讀。」')),
        {choice:[{text:'「老師，錯誤的『無過失』要怎麼判斷？」',if:CU(G=>zCan(G,'q88')),consequences:{prof:{prof_zhou:{kind:'office',delta:3,note:'問無過失'}},note:{id:'zhou_88',title:'周教授：無過失的判斷','body':'看表意人有沒有「合理的注意可能」：能不能發現、有沒有時間改、金額落差多大。'},knowledge:{qid:null}},goto:'q'},{text:'「老師推薦一本書？」',if:CU(G=>zCan(G,'book')),consequences:{prof:{prof_zhou:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'zhou_book',title:'周教授推薦','body':'老師推薦的那本民法總則教科書——「先讀例題，再讀本文」。'}},goto:'book'},
          {text:'「老師，代理人自己越權簽約，本人要負責嗎？」',if:CU(G=>zCan(G,'agency')),consequences:Object.assign(ZOFF('問越權代理'),{note:{id:'zhou_169',title:'周教授：越權代理',body:'本人自己的行為讓人相信有代理權、或知道有人以他的名義卻不反對，要負責；對方明知或可得而知就不保護。'}}),goto:'agency'},
          {text:'「店家寄價目表給我，我回信說要買，契約成立了嗎？」',if:CU(G=>zCan(G,'offer')),consequences:Object.assign(ZOFF('問價目表'),{note:{id:'zhou_154',title:'周教授：價目表',body:'寄價目表，法律上不當作要約。你回信說要買，那一封才是要約。店家回你『好』，契約才成立。'}}),goto:'offer'},
          {text:'「室友出國，我幫他繳了電費。可以跟他要回來嗎？」',if:CU(G=>zCan(G,'gestio')),consequences:Object.assign(ZOFF('問無因管理'),{note:{id:'zhou_176',title:'周教授：幫室友繳電費',body:'他沒有拜託你，你也沒有義務。這叫無因管理。繳電費對他有利，也不違反他的意思。你付的錢，可以請他還。'}}),goto:'gestio'},
          {text:'「債務不履行到底有幾種？」',if:CU(G=>zCan(G,'types')),consequences:Object.assign(ZOFF('問債務不履行'),{note:{id:'zhou_types',title:'周教授：三種債務不履行',body:'給付不能、給付遲延、不完全給付。三種的效果不一樣。考試不會問你有幾種。會給你一個故事，問你是哪一種。'}}),goto:'types'},
          {text:'「借錢的人十幾年沒還，還要得回來嗎？」',if:CU(G=>zCan(G,'prescr')),consequences:Object.assign(ZOFF('問時效'),{note:{id:'zhou_125',title:'周教授：時效',body:'請求權的消滅時效，一般是十五年。時效完成以後，對方可以拒絕給付。可以拒絕，債還在。他自己還了，就不能說他不知道時效過了，再要回去。'}}),goto:'prescr'},
          {text:'「沒事。」',end:true}]},
        {label:'q'},{call:G=>zMark(G,'q88')},Z('「好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。」','smile'),{goto:'end'},{label:'book'},{call:G=>zMark(G,'book')},Z('「一年級不用讀太多。一本，讀三遍。」'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一上：表見代理；台詞沒寫條號）*/
        {label:'agency'},{call:G=>zMark(G,'agency')},Z('看本人自己做了什麼。他有沒有讓別人以為那個人有代理權？明明知道有人用他的名義，他有沒有出來反對？'),Z('還要看對方。對方明知道沒有代理權，或是稍微注意一下就會知道，就不保護。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一下債總一：價目表不是要約；台詞沒寫條號）*/
        {label:'offer'},{call:G=>zMark(G,'offer')},Z('寄價目表，法律上不當作要約。你回信說要買，那一封才是要約。'),Z('店家回你『好』，契約才成立。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一下債總一：無因管理的費用償還；台詞沒寫條號）*/
        {label:'gestio'},{call:G=>zMark(G,'gestio')},Z('他沒有拜託你，你也沒有義務。這叫無因管理。'),Z('繳電費對他有利，也不違反他的意思。你付的錢，可以請他還。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大二上債總二：債務不履行的三種；台詞沒寫條號）*/
        {label:'types'},{call:G=>zMark(G,'types')},Z('給付不能、給付遲延、不完全給付。三種的效果不一樣。'),Z('考試不會問你有幾種。會給你一個故事，問你是哪一種。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大二上債總二：消滅時效十五年、時效完成以後的給付；台詞沒寫條號）*/
        {label:'prescr'},{call:G=>zMark(G,'prescr')},Z('請求權的消滅時效，一般是十五年。時效完成以後，對方可以拒絕給付。'),Z('可以拒絕，債還在。他自己還了，就不能說他不知道時效過了，再要回去。'),{goto:'end'},
        /* 1-3 大四下：有 zhou_88（大一問過錯誤的無過失）＝問現在會怎麼答；一則 zhou_* 筆記都沒有＝「四年了，你才來我研究室。」；兩種都接最後兩句 */
        {label:'y4'},{call:G=>zMark(G,'y4')},Z('（他翻了一下你的專題大綱。）'),
        Object.assign({if:CU(G=>NOTE(G,'zhou_88'))},Z('你大一問過我，錯誤的「無過失」怎麼判斷。現在你會怎麼答？')),
        {if:CU(G=>NOTE(G,'zhou_88')),choice:[{text:'「看他有沒有合理注意的可能。」',goto:'y4a'},{text:'「看情況。」',goto:'y4b'},{text:'「我還是不太確定。」',goto:'y4c'}]},
        Object.assign({if:CU(G=>!ZNOTES(G))},Z('四年了，你才來我研究室。')),{goto:'y4z'},
        {label:'y4a'},Z('對。你那時候是用問的。','smile'),{goto:'y4z'},{label:'y4b'},Z('……法律系四年，你學會了這三個字。'),{goto:'y4z'},{label:'y4c'},Z('很好。不確定的人比較會去查。','smile'),
        {label:'y4z'},Z('專題的題目，挑一個你大一就想不通的。'),Z('想不通，才寫得下去。'),{consequences:ZOFF('大四去研究室'),mem:[{npc:'prof_zhou',tag:'ZHOU_Y4'}]},   /* 人物面板的名稱「大四去了周教授的研究室」在 social3d.js MEMORY_LABEL（不另寫備註，免得重複）*/
        {label:'end'} ] },
    /* 1-3 的提示（AA_522 第 8 節第 4 點，f36dfe3cf）：大四下第 10 週專題（「回顧大一的案例」）真的上完、下課的時候周教授一句（classes3d.js afterClassEvent；翹課沒有）。
       研究室那一場還沒演才說（同一學期只有這一堂；一次）*/
    { id:'ev_prof_zhou_y4_call', title:'專題下課', participants:['prof_zhou'], location:'any', trigger:'class', afterClass:'legal_research', term:['Y4S2'], weeks:[10], once:true, background:'blur', prereq:CU(G=>zY4(G)&&zLeft(G)>0),
      dialogue:[ Z('{name}，下課來研究室一趟。') ] },
    { id:'ev_prof_lin_after', term:['Y3S1'], title:'下課後', participants:['prof_lin'], location:'classroom', trigger:'interact', priority:6, cooldown_days:6, weekday:[2], time:[11.8,12.6], background:'blur',
      dialogue:[ Object.assign({if:CU(G=>LA(G)%4===0)},L('「你剛剛那題——」','smile')),Object.assign({if:CU(G=>LA(G)%4===1)},L('你上課皺眉頭的那一題——','smile')),Object.assign({if:CU(G=>LA(G)%4===2)},L('剛剛那個證人的例子——','smile')),Object.assign({if:CU(G=>LA(G)%4===3)},L('你筆記抄到一半停下來的地方——','smile')),
        {if:{knowledge:[{qid:'Q001',min:'confused'}]},speaker:'prof_lin',expression:'neutral',text:'「很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。」'},{legal:{context:'classmate',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},
        Object.assign({if:CU(G=>LA(G)===0)},L('「來研究室也可以。週二下午。」')),Object.assign({unless:CU(G=>LA(G)===0)},L('下週見。')) ], consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'下課後問問題'}}} },
    { id:'ev_prof_lin_office', term:['Y3S1'], title:'林教授的研究室', participants:['prof_lin'], location:'wancai', trigger:'interact', priority:6, cooldown_days:7, max_times:3, weekday:[2], time:[14,16.5], get background(){ return BGD(); }, prereq:{events:['ev_prof_lin_after']},
      dialogue:[ L('你來了。'),Object.assign({if:CU(G=>LO(G)===0)},L('上次下課你問的那題，我回去又想了一下。')),{legal:{context:'office',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},
        Object.assign({if:CU(G=>LO(G)===0)},L('我念書的時候也讀不懂判決。後來讀到一份寫錯的，對照著看，才讀懂其他的。')),Object.assign({if:CU(G=>LO(G)===1)},L('無罪判決要讀到最後。最後那幾段，通常寫得最小心。')),Object.assign({if:CU(G=>LO(G)>=2)},L('你大四如果選判決研討，我們還會見面。不選也沒關係。','smile')) ],
      consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'研究室問問題'}}} },
    { id:'ev_prof_lin_nod', title:'', participants:[], location:'any', trigger:'class', beforeClass:'crim_judgment_sem', term:['Y4S1'], once:true, background:'blur', prereq:CU(G=>LO(G)>=3),   /* 3-2 第三句（「我們還會見面」）說過、選了刑事判決研討：第一次上那堂課（翹掉的不算；舊存檔沒有＝不演）*/
      dialogue:[ {speaker:'prof_lin',expression:'neutral'},{speaker:null,text:'（她看到你，點了一下頭。）'} ] } ]; })(),
  // ── 同學 ──
  { id:'ev_zhe_ball', title:'系籃練球', participants:['zhe'], location:'campus', trigger:'interact', priority:5, weekday:[5], time:[16.5,18.5], cooldown_days:6, term:['Y1S1','Y1S2'], prereq:{flags:['ball_invite'],custom:G=>{ const l=G.events&&G.events.last&&G.events.last.ev_zhe_ball; if(l==null||typeof CALENDAR==='undefined') return true; const a=CALENDAR.termOf(l), b=CALENDAR.termOf(G.day); return !a||!b||a.id!==b.id; }}, background:'blur',   /* AA_313 5-1 第 3 點＋5-3：只在大一、每學期一次（原本冷卻 6 天、四年每週重演）*/
    dialogue:[ {speaker:'zhe',expression:'smile',text:'來了？明軒在場上等。你當經理，記分。'},{choice:[{text:'「記分可以。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（記分）'},{npc:'classmate_mingxuan',tag:'SHARED_CLASS',note:'系籃練球'}],rel:{zhe:{fam:5,comf:4},classmate_mingxuan:{fam:5}},energy:-10,advance:1.5,memo:'去系籃當了一次記分員'}},{text:'「我上場。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（上場被電）'}],rel:{zhe:{fam:6,comf:5},classmate_mingxuan:{fam:6,resp:2}},energy:-22,advance:1.5,memo:'系籃練球被電了一小時'}},{text:'「今天不行。」',consequences:{mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]},end:true}]},{speaker:'zhe',expression:'laugh',text:'結束一起吃麵。'} ] },
  /* 宥辰的 DJ（AA_497 1-11）：第一次照現在全文；第二次以後只演第二句起（第一句本來就只給還沒認識的人），最後一句「考前我就會消失，別找我」照順序輪流換成三句
     （G.events.done 在演完才加：演第 n 次的時候是 n−1）。「去。」＝交換聯絡方式（1-4「DJ 那段答應去」收得到週五的歌）*/
  { id:'ev_youchen_dj', title:'週五晚上', participants:['classmate_youchen'], location:'gongguan', trigger:'interact', priority:6, weekday:[5], time:[21,26], cooldown_days:6, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_youchen',tag:'FIRST_MET'}]},speaker:'classmate_youchen',expression:'smile',text:'你……民總同班的？賴宥辰。你大概沒看過我，我通常在睡覺。'},{speaker:'classmate_youchen',expression:'smile',text:'我十一點在巷子裡那間放歌。來嗎？不用錢，法律系的算朋友價。'},{choice:[{text:'「去。」',consequences:{rel:{classmate_youchen:{fam:6,comf:4}},mem:[{npc:'classmate_youchen',tag:'SHARED_MEAL',note:'去聽他放歌'}],energy:-8,advance:2,memo:'去聽宥辰放歌到凌晨',contact:'classmate_youchen'}},{text:'「明天要早起。」',consequences:{rel:{classmate_youchen:{fam:2}}}}]},
      {unless:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_youchen_dj)},speaker:'classmate_youchen',expression:'laugh',text:'考前我就會消失，別找我。'},
      {if:{custom:G=>((G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0)%3===1},speaker:'classmate_youchen',expression:'smile',text:'這週的歌比較慢。適合下雨。'},
      {if:{custom:G=>((G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0)%3===2},speaker:'classmate_youchen',expression:'laugh',text:'你又來了。阿姨說你是常客。'},
      {if:{custom:G=>{ const n=(G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0; return n>0&&n%3===0; }},speaker:'classmate_youchen',expression:'smile',text:'明天早上的課，你幫我看一下有沒有點名。'} ] },
  { id:'ev_xinci_double', title:'雙主修', participants:['classmate_xinci'], location:'library', trigger:'interact', priority:6, once:true, term:['Y1S2'], weeks:[6,7], prereq:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]}, background:'blur',   /* AA_120 7-1 第 3 項：大一下第 6～7 週（2026-03-30～04-12），期中前；債總週四、經原週五。AA_185 3-11：不需要慈 1（借筆記）——認識她就有（祐廷大一下都在重修經原）；沒有慈 1 的玩家第一句換成「……你也在重修經原？」*/
    dialogue:[ {speaker:null,text:'（總圖裡，她壓低聲音。）'},/* AA_209 附錄A §2：開頭一句旁白，其他的（小聲）×11 拿掉 */{if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'tired',text:'經濟的期中在債總的隔天。兩科我都還沒念完……我可能要放棄一科。'},{unless:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'surprised',text:'你也有修經原喔？我在後面看到你。'}/* AA_209 附錄A §2 */,{choice:[{text:'「放經濟。妳民法比較強。」',consequences:{rel:{classmate_xinci:{trust:4,resp:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你建議她放經濟'}]}},{text:'「兩科都考，考爛也是經驗。」',consequences:{rel:{classmate_xinci:{fam:3,comf:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你說兩科都考'}]}},{text:'「妳為什麼要雙主修？」',consequences:{rel:{classmate_xinci:{trust:5,fam:3}},mem:[{npc:'classmate_xinci',tag:'TALKED_FAMILY',note:'雙主修是家裡要的'}]},goto:'why'},{text:'「經濟那科我陪妳看。」',goto:'econ'}]},{goto:'end'},{label:'why'},{speaker:'classmate_xinci',expression:'neutral',text:'我爸說法律系畢業沒有第二專長會餓死。他是會計師。'},{goto:'end'},
      /* 交接包 v2 第 3 節（慈 2 的新選項）：祐廷也在重修經原（下），所有玩家都有；「第三章」不寫是個體還是總體；以安不在場，KNOWS_ECON_YEAR 不變 */
      {label:'econ'},{if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'ec_full'},{if:{flagIs:{ECON_PAST_SHARED:'half'}},goto:'ec_half'},
      {if:{flags:['P4B_SEEN']},speaker:'classmate_xinci',expression:'neutral',text:'上次問你，你只笑。這次是第三章，你總要說了吧。'},{unless:{flags:['P4B_SEEN']},speaker:'classmate_xinci',expression:'surprised',text:'……你怎麼這麼熟？'},
      {choice:[{text:'「念過。一個多月。」',goto:'ec_told'},{text:'「自學過一點。」',goto:'ec_self'},{text:'「第三章我也還在念。」',goto:'ec_not'}]},
      {label:'ec_told'},{speaker:'classmate_xinci',expression:'smile',text:'我就知道。'},{set:{ECON_PAST_SHARED:'full'}},{goto:'ec_together'},
      {label:'ec_self'},{set:{ECON_PAST_SHARED:'half'}},{goto:'ec_half'},
      {label:'ec_not'},{speaker:'classmate_xinci',expression:'neutral',text:'……好，不說也行。'},{goto:'ec_together'},
      {label:'ec_full'},{speaker:'classmate_xinci',expression:'neutral',text:'你念過的那一個多月，第三章有教嗎？'},{speaker:'player',text:'有教到。我那時候沒聽懂。'},{speaker:'classmate_xinci',expression:'smile',text:'沒關係，我也沒聽懂。等一下一起問老師。'}/* AA_209 第 8 節第 7 點 */,{goto:'ec_together'},
      {label:'ec_half'},{speaker:'classmate_xinci',expression:'neutral',text:'自學的人，第三章懂嗎？'},{speaker:'player',text:'懂一半。'},{speaker:'classmate_xinci',expression:'smile',text:'好，那你懂的那一半先講。'}/* AA_209 附錄A §2 */,
      {label:'ec_together'},{speaker:null,text:'（你們在總圖對經濟題。她列式子，你畫圖。）'},{mem:[{npc:'classmate_xinci',tag:'ECON_TOGETHER',note:'在總圖'}]},
      {label:'end'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。我要繼續讀了。'} ] },
  { id:'ev_mingxuan_money', title:'家裡的事', off:'交接包 v1 關閉（BB_95 2-9；改寫版在之後的交接包）', participants:['classmate_mingxuan'], location:['campus','gongguan'], trigger:'interact', priority:7, once:true, term:['Y1S1','Y1S2'],   /* AA_207 §3-4：「下學期」只在大一 */ prereq:{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'我下學期家教可能要再多接。家裡……嗯。'},{speaker:'classmate_mingxuan',expression:'smile',text:'只是球可能要少打一點。'},{choice:[{text:'「系辦有工讀，我幫你問。」',consequences:{rel:{classmate_mingxuan:{trust:6,fam:4}},mem:[{npc:'classmate_mingxuan',tag:'HELPED',note:'幫他問工讀'}],flags:{mingxuan_job_ask:true}}},{text:'「阿哲知道嗎？」',consequences:{rel:{classmate_mingxuan:{fam:3}},mem:[{npc:'classmate_mingxuan',tag:'TALKED_FAMILY'}]}},{text:'「加油。」',consequences:{rel:{classmate_mingxuan:{fam:1}}}}]},{speaker:'classmate_mingxuan',expression:'smile',text:'嗯，謝了。'} ] },
  // ── 生活小事 ──
  { id:'ev_wrong_coffee', title:'咖啡買錯', participants:[], location:'cafe', trigger:'enter', day_min:3, cooldown_days:4, random_weight:0.35, background:'freeze',
    dialogue:[ {speaker:null,text:'你點了拿鐵，拿到的是手沖。店員說「啊」，然後看著你。'},{choice:[{text:'「沒關係，這杯也好。」',consequences:{energy:5,memo:'喝了一杯不是自己點的咖啡'}},{text:'「我點的是拿鐵。」',consequences:{advance:0.15}}]} ] },
  { id:'ev_almost_late', title:'快遲到', participants:[], location:'campus', trigger:'enter', weekday:[2], time:[9.9,10.25], day_min:3, cooldown_days:6, background:'freeze',
    dialogue:[ {speaker:null,text:'等一下還有課。你看了一眼手機，開始用走的假裝自己沒有在跑。'} ], consequences:{goal:'霖澤館：上課'} },   /* AA_372 第 14 項：大一上週二沒有 10:20 的課（原本「十點二十的課。」）*/
  { id:'ev_course_selection', title:'選課結果', participants:[], location:'dorm', trigger:'enter', day_min:5, once:true, time:[7,12], background:'freeze',
    dialogue:[ {speaker:null,text:'選課結果出來了。通識「城市與散步」——沒選上。備取十七。'},{choice:[{text:'沒選到的那堂，等第二階段有人退選，再上網加加看。',consequences:{flags:{ge_walk_waitlist:true},memo:'通識「城市與散步」備取，等第二階段退選'}},{text:'算了，下學期再選。',consequences:{memo:'通識「城市與散步」沒選上，下學期再選'}}]} ] },   /* 交接包 v1 第 1 節：祐廷本來就要重修經原（必修），不設 ge_econ */
  /* AA_356 第 2 節：選「我明天拿來。」＝隔天以後第一次進總圖還書、罰款變四十元（原本欠著不用付，當場繳的反而吃虧）；欠著的時候不再跳逾期 */
  { id:'ev_book_return', title:'還書', participants:[], location:['library_hall','library'], trigger:'enter', background:'freeze', prereq:{custom:G=>!!(G.flags&&G.flags.book_overdue)&&G.day>(G.flags.book_overdue_day|0)},
    dialogue:[ {speaker:null,text:'（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）',consequences:{money:-40},set:{book_overdue:false}} ] },
  { id:'ev_forgot_book', title:'忘記還書', retired:true,   /* BUG-BOOK-OVERDUE-1023（使用者 10-23 08:3x「為什麼莫名其妙一直圖書館借書逾期」）：遊戲沒有借書，這一則每 7 天在 3F 閱覽區隨機跳＝沒借過也一直逾期。先關掉；有借書系統再接（問 AA）。ev_book_return 留著，舊存檔欠著的還得掉 */
    participants:[], location:'library', trigger:'enter', day_min:6, cooldown_days:7, random_weight:0.4, background:'freeze', prereq:{custom:G=>!(G.flags&&G.flags.book_overdue)},
    dialogue:[ {speaker:null,text:'櫃台叫住你：「同學，你有一本《民法總則》逾期三天。」'},{choice:[{text:'繳罰款（30 元）',consequences:{money:-30}},{text:'「我明天拿來。」',consequences:{flags:{book_overdue:true},stamp:'book_overdue_day'}}]} ] },
  { id:'ev_midnight_snack', title:'考前宵夜', participants:['zhe'], location:'dorm', trigger:'enter', weeks:[7,8], term:['Y1S1','Y1S2'],   /* AA_313 5-1 第 3 點：只在大一（四年都會重演）*/   /* AA_195 4-7 A5：期中前（第 7～8 週）；期末前那次等 16 週制（E 類）*/ time:[22,24.5], cooldown_days:5, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'手機震了一下。阿哲：「宵夜 滷味攤 現在 明軒也在」'},{choice:[{text:'「來了。」',consequences:{mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'考前宵夜'}],rel:{zhe:{fam:3,comf:3}},energy:-6,money:-90,advance:1,memo:'考前跟阿哲他們去吃宵夜'},goto:'came'},{text:'「我明天要上台報告，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE',note:'考前宵夜'}]},goto:'end'},{text:'「我晚點去找你們。」',consequences:{rel:{zhe:{fam:1}},advance:0.5},goto:'end'}]},
      {label:'came'},{speaker:null,text:'（你們在夜市口站著吃完鹹酥雞，十二點才回宿舍。）'},   /* AA_313 5-1 第 3 點：選「來了。」以後原本什麼都沒有 */
      {label:'end'} ] },
  { id:'ev_bike_flat', title:'腳踏車沒氣', participants:[], location:'campus', trigger:'enter', day_min:4, cooldown_days:6, random_weight:0.3, time:[7,20], background:'freeze',
    dialogue:[ {speaker:null,text:'腳踏車架旁邊有人蹲著看自己的後輪。沒氣。他抬頭看你，像在問你有沒有打氣筒。'},{choice:[{text:'「校門口有打氣筒。」',consequences:{energy:-1}},{text:'（假裝沒看到）',consequences:{}}]} ] },
  // ── 考試：刑訴小考（第三週起的週二）──
  { id:'ev_quiz_crimpro', retired:'AA_376 #2（企劃線 69aa3b0c，AA 定）：v7 舊課堂，課表系統已經有刑訴（9:10 開始）；沒有 once、每週二重演（期中考當天、第 9 週沒課也演）——停用，定義留給舊存檔', term:['Y3S1'], title:'刑訴小考', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], day_min:13, cooldown_days:13, prereq:{flags:['crimpro_attended']}, background:'freeze', mainSide:'right', player_seat:[1,3], priority:20,
    dialogue:[ {speaker:'prof_lin',expression:'neutral',text:'「今天先小考。三題，不算分，但我會記得誰寫對。」'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她說不算分的時候，都很算分。'},{legal:{context:'quiz',by:'prof_lin',pick:{prefer:'confused'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{section:'強制處分'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{},quiet:true}},{speaker:'prof_lin',expression:'smile',text:'「收卷。下週講強制處分。」'} ],
    consequences:{advance:1.7,energy:-8,memo:'刑訴小考',flags:{crimpro_quiz_done:true}} },
  // ── 研究所：說明會 ──
  { id:'ev_grad_info_session', title:'法研所說明會', participants:['npc_ta_chen','heroine_05'], location:'wancai', trigger:'enter', weekday:[5], time:[14.8,16.2], day_min:5, once:true, background:'blur', term:['Y1S1','Y1S2'], prereq:{flags:['met_sis']},   /* AA_376 #19：限大一（「我是碩二的陳冠廷」「一年級的也可以留下來聽」）；AA_518 4-12：要見過她（met_sis，同 C1）*/
    dialogue:[ {speaker:null,text:'萬才館大廳擺了二十張椅子。海報：「法律學研究所 招生說明會」。坐了七個人，大部分是大三。'},{speaker:'npc_ta_chen',expression:'neutral',text:'我是碩二的陳冠廷，刑事法組。先講結論：研究所不是延長大學，是換一種讀法。'},{speaker:'heroine_05',expression:'serious',text:'一年級的也可以留下來聽，不會有人趕你。'},{speaker:'npc_ta_chen',expression:'thinking',text:'筆試考申論，口試問你的研究計畫。最常被問倒的問題是：你為什麼要研究這個？'},{choice:[{text:'留下來聽完',consequences:{grad:{bump:'聽了法研所說明會'},advance:1,energy:-4,mem:[{npc:'npc_ta_chen',tag:'FIRST_MET'},{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'說明會'}],memo:'聽了法研所說明會'}},{text:'聽十分鐘就走',consequences:{advance:0.2}}]} ] },
  /* W3（BB_96 2-3，交接包 v2）：落在大一下第 5 週以後（她會在讀書會後給）；台詞、選項照舊；debate 的三個選項多記 W3_STANCE（no／diff／unsure；W3b 第一次的開頭用）*/
  { id:'ev_grad_reading', title:'學姊給的文章', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:7, once:true, prereq:{grad:{min:'CONSIDERING'},custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S2',5,1)}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'你真的在想研究所？……好。這篇。三十頁。讀完再來找我，我們吵一次。'},{set:{grad_reading:true},note:{id:'grad_reading',title:'學姊給的文章','body':'一篇公法的期刊論文。三十頁。讀書時可以選「讀研究所準備的文章」，讀三次才算讀完。'}},{speaker:'heroine_05',expression:'smile',text:'不要用螢光筆。用鉛筆，寫你不同意的地方。'},{if:{custom:G=>typeof FAMXMAS!=='undefined'&&FAMXMAS.hasPencil(G)},speaker:'heroine_05',text:'用我給你的那支。'} ],   /* AA_406 第 4 節：大一家族聖誕拿到那支刻名字的鉛筆的 */ consequences:{mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'給你一篇文章'}]} },
  { id:'ev_grad_debate', title:'和溫學姊吵一次', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, prereq:{flags:['grad_read_done']}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'讀完了？好。第二節，作者說比例原則在這個案型「只能」這樣用。你同意嗎？'},
      {choice:[
        {text:'「不同意。他把『必要性』直接跳過了。」',hint:'你的鉛筆字',set:{W3_STANCE:'no'},rel:{heroine_05:{resp:6,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'跟她吵了必要性審查'}],goto:'agree_no'},
        {text:'「同意，但理由跟他寫的不一樣。」',set:{W3_STANCE:'diff'},rel:{heroine_05:{resp:4,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'同意結論、不同意理由'}],goto:'agree_diff'},
        {text:'「老實說，我不確定我讀懂了。」',set:{W3_STANCE:'unsure'},rel:{heroine_05:{trust:4,fam:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'承認沒讀懂'}],goto:'unsure'} ]},
      {label:'agree_no'},{speaker:'heroine_05',expression:'smile',text:'……對。他跳過了。我第一次讀的時候沒看出來，是許老師指出來的。'},{speaker:'heroine_05',expression:'serious',text:'下次見面，這一段你來講。'},/* AA_209 附錄B §2 */{consequences:{prof:{prof_xu:{kind:'research',delta:1,note:'學姊提到你讀了那篇文章'}}}},{goto:'end'},
      {label:'agree_diff'},{speaker:'heroine_05',expression:'thinking',text:'講你的理由。'},{speaker:null,text:'（你講了十分鐘。她中間打斷你三次。）'},{speaker:'heroine_05',expression:'smile',text:'三次裡有一次你是對的。這樣就夠了。'},{goto:'end'},
      {label:'unsure'},{speaker:'heroine_05',expression:'neutral',text:'那你比大部分人誠實。大部分人會假裝懂，然後在口試的時候被問倒。'},{speaker:'heroine_05',expression:'smile',text:'再讀一次。這次我陪你讀第二節。'},{consequences:{advance:1}},
      {label:'end'},{speaker:'heroine_05',expression:'tired',text:'……我自己的研究計畫還沒改完。走了。'} ],
    consequences:{grad:{bump:'和學姊為一篇文章吵了一次',field:'公法'}} }
];
Array.prototype.push.apply(STORY_EVENTS,STORY_EVENTS_V11);
/* ===== 1A-06～1A-15（AA_317、AA_318；AA-C 2026-10-20 定稿，第②級，台詞不改字；e75ebc69 的兩處更正已照改）=====
   大三寒假到大四畢業、搬走。日期、在哪裡演、旗標的流程在 src/story3d.js 的「1A-06～1A-15」那一段；這裡只放台詞。
   ev_sister_hotpot（出遊，1A-06）、ev_family_land_y3／_bed（在家／睡著，1A-07）、ev_y4_path／_again（1A-08，story3d.js 叫）、
   ev_r1_jetlag（1A-10，story3d.js 叫）、ev_grad_envelope／_bed（1A-12 晚上的信封）。家人（姊姊、大伯、媽媽）沒有立繪＝compact。
   測試：tests/sister_hotpot_unit.js、land_data2_unit.js、jetlag_unit.js、grad_family_unit.js */
const Y4_EVENTS=(function(){
  const R=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null, JP=G=>R(G)==='JP', US=G=>R(G)==='US', TW=G=>!JP(G)&&!US(G);   /* 台灣路線＝不是 JP、也不是 US（未決定也算）*/
  const fam=id=>typeof STORY!=='undefined'&&!!STORY.y4Fam&&STORY.y4Fam(id), all=(...ids)=>()=>ids.every(fam);   /* AA_30 3-4：只有 FAMILIAR 以上的人到場或被提到 */
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  /* 1A-06 主線 7「姊姊」（AA_317 第 2 節）：1/12 19:00 公館火鍋店；交換的回答照 EXCHANGE_ROUTE；選項②只給 careerLean C；SISTER_TALK */
  const HOTPOT=[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
    {speaker:null,text:'（一月的公館。火鍋店的玻璃起了一層霧。姊姊已經到了，鍋子點好了，兩個人一鍋。）'},
    {speaker:null,text:'（你走進來的時候，她看了一下手機上的時間。）'},
    {speaker:'姊姊',text:'你們法律系的都走這麼快喔？'},
    {speaker:'姊姊',text:'交換的表，你選了哪裡？'},
    {if:{custom:JP},speaker:'player',text:'日本。三月底出發。'},{if:{custom:JP},speaker:'姊姊',text:'三月。……那過年要多吃一點。'},
    {if:{custom:US},speaker:'player',text:'美國。大四上。'},{if:{custom:US},speaker:'姊姊',text:'八月。那還有一個暑假。'},
    {if:{custom:TW},speaker:'player',text:'沒填。留在臺灣。'},{if:{custom:TW},speaker:'姊姊',text:'留下來也是選了一個。'},
    {speaker:'姊姊',text:'我念歷史的時候，親戚說「念那個以後要幹嘛」。我念到研究所又休學。去補習班教書。現在在出版社。'},
    {speaker:'姊姊',text:'你也換過一次。經濟念一個多月就休學，說要重考。……媽那陣子都睡不好，只是沒跟你說。'},
    {speaker:'姊姊',text:'結果你看。你自己選的，你就念得下去。'},
    {speaker:'姊姊',text:'你從小遇到事情就去翻那本書。……你知道嗎，那時候我覺得你很怪。現在覺得還好。'},
    {choice:[{text:'「妳後悔換方向嗎？」',set:{SISTER_TALK:'regret'},goto:'st_regret'},
      {text:'「我在想畢業以後要不要做法律以外的事。」',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.careerLean&&STORY.careerLean(G).top==='C'},set:{SISTER_TALK:'other'},goto:'st_other'},
      {text:'「我還在找我要幹嘛。」',set:{SISTER_TALK:'search'},goto:'st_search'}]},
    {label:'st_regret'},{speaker:'姊姊',text:'沒有。後悔完還是要吃飯。'},{goto:'st_end'},
    {label:'st_other'},{speaker:'姊姊',text:'那你喜歡什麼？……不用現在講。你換過一次，你知道換方向不會怎樣。爸媽那邊我來。'},{goto:'st_end'},
    {label:'st_search'},{speaker:'姊姊',text:'我二十六歲也還在找。你急什麼。'},
    {label:'st_end'},
    {speaker:null,text:'（鍋底剩一點湯。她把最後一片肉夾到你碗裡。）'},
    {speaker:'姊姊',text:'過年見。'} ];
  /* 1A-07 主線 9「親戚的土地資料（二）」（AA_317 第 2 節；照主線 2 LAND_Y1 的寫法）：主線 2 沒演（沒有 FAMILY_LAND_Y1）＝「又」拿掉、大伯多一句；陽台兩版 */
  const L1=G=>!!(G.flags&&G.flags.FAMILY_LAND_Y1);
  const LAND_Y3=[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
    {if:{custom:L1},speaker:null,text:'（大年初一。客廳的桌上擺著年糕和瓜子。大伯又從公事包裡拿出一疊影印的謄本。）'},
    {unless:{custom:L1},speaker:null,text:'（大年初一。客廳的桌上擺著年糕和瓜子。大伯從公事包裡拿出一疊影印的謄本。）'},
    {speaker:'大伯',text:'{name}，那塊地，十四個人變十六個了。'},
    {unless:{custom:L1},speaker:'大伯',text:'你阿公留下來的那塊地。'},
    {speaker:null,text:'（你翻開謄本。這次看得懂了。）'},
    {speaker:null,text:'（你看得懂了。共有、分割、找不到的繼承人。）'},
    {speaker:null,text:'（可是你也看得懂，卡住的不是法律。）'},
    {speaker:null,text:'（是十六個人，十年沒有坐在同一張桌子上。）'},
    {choice:[{text:'「大伯，我幫你們找一個律師，先把大家約出來。」',set:{FAMILY_LAND_Y3:'lawyer'},goto:'l3_lawyer'},
      {text:'「這個要先把繼承人找齊。我先列一張，再請代書確認。」',set:{FAMILY_LAND_Y3:'list'},goto:'l3_list'},
      {text:'「大伯，你們要不要先吃一頓飯？」',set:{FAMILY_LAND_Y3:'meal'},goto:'l3_meal'}]},   /* 三個都一定出現，不加傾向分數（AA_315 1A-01 第 4 節）*/
    {label:'l3_lawyer'},{speaker:'大伯',text:'……約得出來的話，十年前就約了。'},{speaker:null,text:'（他停了一下。）'},{speaker:'大伯',text:'好。你找。'},{goto:'l3_end'},
    {label:'l3_list'},{speaker:'大伯',text:'列一張？'},{speaker:null,text:'（他把謄本推過來。）'},{speaker:'大伯',text:'好。你列。電話我給你。'},{goto:'l3_end'},
    {label:'l3_meal'},{speaker:null,text:'（全桌笑。）'},{speaker:'大伯',text:'這孩子念法律念到變哲學家。'},{speaker:null,text:'（媽媽在旁邊說：「他說得對啊。」）'},
    {label:'l3_end'},
    {scene:'臺北・家裡的陽台',bg:'home_balcony'},
    {speaker:null,text:'（下午，姊姊在陽台剝橘子。）'},
    {if:{custom:L1},speaker:'姊姊',text:'大一那年，你翻得到、看不懂。'},{if:{custom:L1},speaker:'姊姊',text:'現在看得懂了。……看得懂，比較累吧。'},
    {unless:{custom:L1},speaker:'姊姊',text:'你現在看得懂那種東西了喔。'},{unless:{custom:L1},speaker:'姊姊',text:'……看得懂，比較累吧。'} ];
  const CNY=G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&(G.stage||'law')==='law'&&G.day===STORY.dayOfKey('2028-01-26')&&!(G.flags&&G.flags.FAMILY_LAND_Y3);   /* 大三寒假大年初一；三條路線同一天（日本 3/25、美國 8/2 才出發）*/
  /* 1A-08「大四要怎麼過？」（AA_317 第 2 節）：宿舍版（台灣、美國路線）、在家版（日本路線 8/5 返台那晚）；一定要選；Y4_PATH、Y4_PATH_DAY。
     台灣、美國路線那晚人在家裡（週末回家）＝只有「（大四，要怎麼過？）」那一句（宿舍那兩句不合）；10/16 再問一次（ev_y4_path_again）也只有那一句 */
  const PATH_Q=[ {choice:[{text:'「準備國考。律師，可以的話司法官也考。」',set:{Y4_PATH:'bar'},goto:'p_bar'},{text:'「準備研究所。」',set:{Y4_PATH:'grad'},goto:'p_grad'},
      {text:'「先不考。去實習，或做別的事。」',set:{Y4_PATH:'other'},goto:'p_other'},{text:'「還沒決定。」',set:{Y4_PATH:'undecided'},goto:'p_und'}]},
    {label:'p_bar'},{speaker:null,text:'（你在桌曆上，把每個禮拜二、四的晚上圈起來。）'},{goto:'p_end'},
    {label:'p_grad'},{unless:{custom:JP},speaker:null,text:'（你打開系上的網頁，找推甄的簡章。十月報名。）'},{if:{custom:JP},speaker:null,text:'（你查了一下。交換回來要多念一學期，推甄趕不上。筆試在後年二月。）'},{goto:'p_end'},
    {label:'p_other'},{speaker:null,text:'（你把國考的簡章收進抽屜最下面，沒有丟。）'},{goto:'p_end'},
    {label:'p_und'},{speaker:null,text:'（你把四個選項寫在便利貼上，貼在檯燈旁邊。）'},
    {label:'p_end'} ];
  const homeBg=G=>JP(G)||atHome(G);
  const PATH=[ {if:{custom:homeBg},scene:'臺北・你的房間',bg:'home_room_night'},
    {if:{custom:G=>!homeBg(G)},speaker:null,text:'（最後一科考完。宿舍很安靜，隔壁在收行李。）'},{if:{custom:G=>!homeBg(G)},speaker:null,text:'（你在書桌前坐了很久。）'},
    {if:{custom:JP},speaker:null,text:'（日本的行李還沒拆完。客廳傳來電視的聲音。）'},{if:{custom:JP},speaker:null,text:'（一個月以後就大四了。）'},
    {speaker:null,text:'（大四，要怎麼過？）'} ].concat(PATH_Q);
  const PATH_AGAIN=[ {if:{custom:atHome},scene:'臺北・你的房間',bg:'home_room_night'},{speaker:null,text:'（大四，要怎麼過？）'} ].concat(PATH_Q);
  /* 1A-10 R1「時差」（AA_318 第 2 節＋e75ebc69 芯慈兩句）：每一段要說話的人、被問到的人都 FAMILIAR 以上（不熟的人不到場、句子跳過）；語彤那三句：日本路線對祐廷、台灣路線對以安；
     台灣路線多「這半年」四選一（只出經歷過的）；子晴晚到（以安、子晴都熟）；芷若那句（芷若、子晴都熟）；芯慈（XINCI_FIRST＝慈 6，AA_326，還沒做＝不出現）。到場的人熟悉度 +1；R1_SEEN 'table' */
  const XC=G=>!!(G.flags&&G.flags.XINCI_FIRST)&&fam('classmate_xinci')&&fam('heroine_01');
  const R1=[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
    {speaker:'zhe',text:'欸，你們回來了。'},
    {if:{custom:all('heroine_01','yu')},speaker:'heroine_01',text:'阿哲，Alison 呢？她不是每次都坐你旁邊？'},
    {if:{custom:all('heroine_01','yu')},speaker:'zhe',text:'她在看電影。一個人。'},
    {if:{custom:all('heroine_01','yu')},speaker:'heroine_01',text:'……一個人？'},
    {if:{custom:all('heroine_01','yu')},speaker:'zhe',text:'（很得意）她現在會一個人去看電影了。看完會打給我講劇情。講兩個小時。'},
    {if:{custom:all('heroine_01','yu')},speaker:'yu',text:'（剛好進門）我聽到我的名字了。（坐到阿哲旁邊）那部超好看，你們都要去看。'},
    {if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'heroine_03',text:'你曬黑了。'},{if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'player',text:'日本的夏天。'},{if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'heroine_03',text:'那就是吃太多。'},
    {if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_03',text:'妳曬黑了。'},{if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_01',text:'日本的夏天。'},{if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_03',text:'那就是吃太多。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_01',text:'語彤，妳上學期都在幹嘛？'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_03',text:'（從背包拿出一本很厚的筆記）訪問了二十三個老闆。……阿姨是第二十三個。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_01',text:'給我看。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_03',text:'吃麵先。'},
    {if:{custom:XC},speaker:null,text:'（芯慈坐到以安旁邊，先開口。）'},{if:{custom:XC},speaker:'classmate_xinci',text:'我跟妳說一部劇。'},{if:{custom:XC},speaker:'heroine_01',text:'……好。妳說。'},
    {unless:{custom:G=>TW(G)&&fam('yu')},goto:'r1_late'},
    {speaker:'yu',text:'欸，你一直在臺灣。這半年發生什麼事？'},
    {choice:[{text:'「語彤每個禮拜四都去市場訪問。我跟過幾次。」',if:{custom:G=>!!G.flags.YT_T1},goto:'r1_yt'},   /* 1B-13 週四的田野（AA_322 YT_T1）*/
      {text:'「子晴的發表會，最後一關有人打過了。」',if:{custom:G=>!!G.flags.ATTENDED_SHOW},goto:'r1_zq'},   /* 1B-15 Q12（AA_322 ATTENDED_SHOW）*/
      {text:'「芷若回來半年，九月又去英國了。這次是念研究所。」',if:{custom:()=>fam('heroine_02')},goto:'r1_zr'},
      {text:'「（先聽大家講）」',goto:'r1_listen'}]},
    {label:'r1_yt'},{speaker:'heroine_03',text:'……你只會站在旁邊吃東西。'},{goto:'r1_late'},
    {label:'r1_zq'},{if:{custom:()=>fam('heroine_01')},speaker:'heroine_01',text:'誰？'},{speaker:'player',text:'……她自己講比較好。'},{goto:'r1_late'},
    {label:'r1_zr'},{speaker:'yu',text:'又？'},{speaker:'zhe',text:'她是去念書，不是去旅行。'},{goto:'r1_late'},
    {label:'r1_listen'},{speaker:null,text:'（你把筷子拿起來，讓別人先說。）'},
    {label:'r1_late'},
    {unless:{custom:all('heroine_04','heroine_01')},goto:'r1_end'},
    {speaker:null,text:'（長桌還有一個空位。過了半小時，門口有人喘著氣。）'},{advance:0.5},
    {speaker:'heroine_04',text:'欸不是，我下班了。（坐下，第一句就問以安）日本的貓胖嗎？'},
    {speaker:'heroine_01',text:'……胖。'},
    {if:{custom:()=>fam('heroine_02')},speaker:'heroine_04',text:'（低頭看手機）喔對，芷若說英國在下雨。她每次都這樣說。'},
    {label:'r1_end'},
    {advance:G=>Math.max(0,21-(G.hour%24))},
    {speaker:null,text:'（九點。）'},{speaker:null,text:'（阿姨把滷蛋切成兩半，一人一半。）'},   /* AA_519 1-3：送小菜第五處＝第 4 句（「九點。」照舊，拆成兩句）*/
    {speaker:'zhe',text:'下禮拜四，一樣。'},
    {set:{R1_SEEN:'table'}},{rel:{zhe:{fam:1}}},
    {if:{custom:()=>fam('heroine_01')},rel:{heroine_01:{fam:1}}},{if:{custom:()=>fam('yu')},rel:{yu:{fam:1}}},{if:{custom:()=>fam('heroine_03')},rel:{heroine_03:{fam:1}}},
    {if:{custom:all('heroine_04','heroine_01')},rel:{heroine_04:{fam:1}}},{if:{custom:XC},rel:{classmate_xinci:{fam:1}}} ];
  /* 1A-12 主線 12 晚上的信封（AA_318 第 2 節）：讀 FAMILY_LAND_Y3（1A-07）；最後夾進舊《民法》 */
  const ENVELOPE=[ {speaker:null,text:'（晚上，你打開大伯的信封。）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'lawyer'}},speaker:null,text:'（一張名片。背面是大伯的字：「律師找到了。他說你介紹的，所以算便宜一點。」）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'list'}},speaker:null,text:'（你大三寒假列的那張繼承人名單。大伯在上面打了十六個勾，最下面寫：「都找到了。」）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'meal'}},speaker:null,text:'（一張餐廳的訂位單。十六個人。日期是下個月。）'},
    {unless:{flagIs:{FAMILY_LAND_Y3:['lawyer','list','meal']}},speaker:null,text:'（那塊地最新的謄本。大伯在上面寫了一句：「十六個。慢慢來。」）'},
    {speaker:null,text:'（你把它放回信封裡，夾進舊《民法》。）'} ];
  const envDue=G=>typeof STORY!=='undefined'&&!!STORY.gradEnvelopeDue&&STORY.gradEnvelopeDue(G);
  return [
    { id:'ev_sister_hotpot', title:'姊姊', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2, dialogue:HOTPOT,
      outingMissed:G=>{ if(typeof PHONE!=='undefined'&&typeof STORY!=='undefined') PHONE.at(G,STORY.dayOfKey('2028-01-12'),19.75,[{th:'p:sister',from:'sister',name:'姊姊',text:'好。那過年見。'}],'y3_sis_hotpot_miss'); } },   /* 答應了沒到：19:45（AA_180 2-7）*/
    { id:'ev_family_land_y3', title:'親戚的土地資料（二）', participants:[], location:'any', trigger:'home', priority:9, time:[7,18], once:true, background:'dark',
      prereq:{custom:CNY}, dialogue:LAND_Y3, consequences:{advance:2} },   /* 在家的第一個時段（home3d.js 的寒假選單：起床後第一輪就演）*/
    { id:'ev_family_land_y3_bed', title:'親戚的土地資料（二）', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'dark', sleepCard:['大年初一','臺北的家'],
      prereq:{custom:G=>CNY(G)&&!(G.events&&G.events.done&&G.events.done.ev_family_land_y3)}, dialogue:LAND_Y3 },   /* 那天白天都不在家：睡著時演（同主線 2 的 _bed）*/
    { id:'ev_y4_path', title:'大四要怎麼過？', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:PATH, consequences:{stamp:['Y4_PATH_DAY']} },
    { id:'ev_y4_path_again', title:'大四要怎麼過？', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:PATH_AGAIN },
    { id:'ev_r1_jetlag', title:'時差', participants:[], location:'any', trigger:'manual', once:true, background:'dark', dialogue:R1 },
    { id:'ev_grad_envelope', title:'大伯的信封', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:ENVELOPE },
    { id:'ev_grad_envelope_bed', title:'大伯的信封', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'blur',
      prereq:{custom:G=>envDue(G)}, dialogue:ENVELOPE } ];   /* 22:00 以後沒回到房間就睡著（例：凌晨 2:30 走回宿舍）：睡著時演 */
})();
Array.prototype.push.apply(STORY_EVENTS,Y4_EVENTS);
/* AA_402（企劃線 235cf61ac；AA_389 第 8 點）：柏翰、芯慈大二起每學期兩句閒聊（取代 AA_313 5-1 第 15 點的閒聊階梯）；每句 once，條件照稿的「條件」欄（柏翰大二是法服社長＝固定設定，那一句不另加條件） */
{ const after=k=>({custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey(k)}), notJP={custom:G=>!(G.flags&&G.flags.EXCHANGE_ROUTE==='JP')};
  SMALLTALK.classmate_bohan.push(
    {t:'「法服的值班表，我排到十二月了。」',term:['Y2S1'],once:true},
    {t:'「這學期我週三晚上空出來了。要讀書的話，可以找我。」',term:['Y2S1'],week:[7,99],once:true,unless:{custom:G=>{ if(G.flags&&G.flags.dating_classmate_peishan) return true; const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'classmate_peishan'):null, y=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return !!(R&&R.sinceDay!=null&&y&&R.sinceDay<=y.to); }}},   /* AA_409 第 3 節：只給柏翰和沛珊真的交往過的玩家（大一下和祐廷交往的沒有）*/
    {t:'「法服這學期的個案，比上學期多一倍。」',term:['Y2S2'],once:true},
    {t:'「你下學期修幾學分。我在看要不要多修一門。」',term:['Y2S2'],week:[12,99],once:true},
    {t:'「社長交出去了。週六早上我還是會去。習慣了。」',term:['Y3S1'],once:true},
    {t:'「四樓樓梯間，下午兩點以後就沒有人了。」',term:['Y3S1'],if:{events:['ev_bohan_third_floor']},once:true},
    {t:'「推甄的書面資料，我寫到第四版了。」',term:['Y3S2'],once:true},
    {t:'「暑假我不回新竹。總圖暑假也開。」',term:['Y3S2'],week:[13,99],once:true},
    {t:'「面試的問題，我準備了四十題。」',term:['Y4S1'],week:[5,8],once:true},
    {t:'「推甄上了。……我媽在電話裡哭了，我沒有。」',term:['Y4S1'],week:[12,99],once:true},
    {t:'「國考讀書會的考古題，我排到七月了。」',term:['Y4S2'],if:after('2029-03-01'),once:true},
    {t:'「研究所九月開學。國考在那之前。時間剛好。」',term:['Y4S2'],once:true});
  SMALLTALK.classmate_xinci.push(
    {t:'「經濟系的課跟法律系的撞了一堂，我改修晚上那一班。」',term:['Y2S1'],if:{events:['ev_xinci_double']},once:true},
    {t:'「我每天早上七點的公車。永和過來要四十分鐘。」',term:['Y2S1'],if:{notEvents:['ev_xinci_double']},once:true},
    {t:'「上禮拜的筆記我做了兩份，一份給以安。……她沒有要，是我自己給的。」',term:['Y2S1'],once:true},
    {t:'「週四晚上我借了一間討論室。你要來的話，我多印一份。」',term:['Y2S2'],once:true},
    {t:'「期末考完那天晚上，有空嗎？我先問，你不用現在回答。」',term:['Y2S2'],week:[13,99],once:true},
    {t:'「我爸說寒假可以去事務所幫忙。……我還沒決定。」',term:['Y3S1'],once:true},
    {t:'「以安的交換，你知道她選哪裡嗎？……我只是問。」',term:['Y3S1'],week:[8,12],once:true},
    {t:'「以安不在，她的位子一直空著。我想把書放上去，又沒放。」',term:['Y3S2'],if:{custom:G=>after('2028-03-25').custom(G)&&notJP.custom(G)},once:true},   /* 以安去日本以後；日本路線的祐廷這時也不在。AA_497 2-9：她本來就坐第一排，原本的「以安不在，第一排的位子我坐了。……沒有比較好。」換成這一句 */
    {t:'「暑假我在我爸的事務所。九點到六點，跟上班一樣。」',term:['Y3S2'],week:[13,99],once:true},
    {t:'「國考跟研究所，我兩個都報了。本來想先實習再說的。」',term:['Y4S1'],once:true},   /* AA_497 2-9：取代「國考跟研究所，我兩個都報了。」（接上大三上「先實習再決定」）*/
    /* AA_497 2-9 追劇減量：大二以後一學期最多一次、保留慈 3、慈 6、R1、尾聲各一句——大四上 R1（「我跟妳說一部劇。」）那一學期的「我最近在追一部日劇。……」拿掉（閒聊池那一句換成下表）*/
    {t:'「畢業典禮那天，我媽要請假。她說要坐第一排。」',term:['Y4S2'],week:[10,99],once:true},
    {t:'「國考那天，我叫我媽不要來。……她說她會在外面等。」',term:['Y4S2'],if:after('2029-06-01'),once:true},
    /* AA_497 2-9 新閒聊（企劃線 7a38216ca）：每句一次；大三下、大四下兩句要有 XC5_RECONCILE；句子用完以後的旁白在 STORY.SMALL_AFTER（src/sup497_3d.js）*/
    {t:'「永和到這裡要換一次車。我在車上可以看完一章。」',term:['Y2S2'],once:true},
    {t:'「這學期雙主修的課沒有撞堂。……我把那一格空下來了。」',term:['Y3S1'],once:true},
    {t:'「以安的手帳跟我用的是同一款。我們兩個都沒說。」',term:['Y3S2'],if:{flags:['XC5_RECONCILE']},once:true},
    {t:'「最後一堂課，我坐第一排。以安坐我旁邊。」',term:['Y4S2'],if:{flags:['XC5_RECONCILE']},once:true}); }
/* AA_403（企劃線 720f32472；AA_389 第 9 點）：ev_grad_debate 選了「不同意」（W3_STANCE 'no'），學姊說「下次見面，這一段你來講。」的兌現——
   演完至少 3 天以後，在總圖、萬才館、Café 找她說話先演（同 ev_grad_debate 的 interact）；只一次；大二上結束以後不演 */
STORY_EVENTS.push({ id:'ev_grad_debate_teach', title:'這一段你來講', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, background:'blur',
  prereq:{custom:G=>{ const F=G.flags||{}, L=(G.events&&G.events.last)||{}, end=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null;
    return F.W3_STANCE==='no'&&L.ev_grad_debate!=null&&G.day>=L.ev_grad_debate+3&&!!end&&G.day<=end.to; }},
  dialogue:[ {speaker:null,text:'（她把那篇文章攤開在第二節。你上次用鉛筆寫的字，旁邊多了幾個她的問號。）'},
    {speaker:'heroine_05',text:'上次說好的。這一段，你講給我聽。'},{speaker:'heroine_05',text:'當我沒讀過。'},
    {choice:[{text:'「先講他想保護什麼，再講他跳過哪一步。」',goto:'o'},{text:'「直接講他跳過的那一步。」',goto:'d'}]},
    {label:'o'},{speaker:null,text:'（你講了八分鐘。她一次都沒有打斷。）'},{speaker:'heroine_05',text:'……順序對了。'},{speaker:'heroine_05',text:'我第一次講給許老師聽的時候，是先講他錯在哪。老師說，那樣聽的人會先想反駁。'},{set:{W3_TAUGHT:'order'}},{goto:'e'},
    {label:'d'},{speaker:null,text:'（你三分鐘就講完了。）'},{speaker:'heroine_05',text:'快。'},{speaker:'heroine_05',text:'……可是聽的人會問：那他為什麼要跳？下次你先想好這一題。'},{set:{W3_TAUGHT:'direct'}},
    {label:'e'},{speaker:null,text:'（她用鉛筆在你的字旁邊，把一個問號擦掉了。）'},{speaker:'heroine_05',text:'好。文章你留著。'},
    {if:{custom:G=>!!(G.flags&&G.flags.dating_heroine_05)},speaker:null,text:'（她把文章推過來的時候，手指在你的鉛筆字上停了一下。）'},
    {mem:[{npc:'heroine_05',tag:'W3_TAUGHT',note:''}]},{consequences:{rel:{heroine_05:{resp:4,fam:2}}}} ] });
