/* ===== 事件包第 2 輪之三（前半）：大四上、美國交換、大四寒假（AA_327 2-Y4-01～29；AA-C 2026-10-20 定稿 e284d601，第②級，台詞照原文、不改字）=====
   這裡是台詞（用事件系統演的段落）；什麼時候演、手機、出遊、美國路線的整串流程在 src/r2y4a3d.js（R2Y4A）。2-Y4-30 作廢不做；2-Y4-31～61 是另一個事件包。
   美國路線（2-Y4-16～22，先做）：
     16 US1 抵達：ev_us1_arrive（巴士站，交往中／挽回中）→ ev_us1_market（草原超市）→ ev_us1_asian（竹葉亞洲超市）→ ev_us1_door（公寓 214 門口）→ ev_us1_mom（21:30 打給媽媽）
     17 US2：ev_us2_kitchen（交往中：坐到 C 棟 208 窗口的高腳椅＝開始）、ev_us2_repair（挽回中：19:00 前後還鍋子）
     18 芝加哥：ev_us_chicago（11/11）＋ev_us_chicago2（11/12 博物館、回程）　19 US3：ev_us3_lake　20 初雪：ev_us_first_snow（交往中）、ev_us_snow_repair（挽回中）
     21 會所晚餐：ev_us_club_dinner　22 離開：ev_us_leave → 交往中 ev_sf1、ev_sf_photo17、ev_sf2、ev_sf_photo19、ev_sf3、ev_sf_photo21／挽回中 ev_us_bloom16、18、20、ev_us_bus21 → ev_us_return（桃園）→ ev_us_home
   大四上（臺灣這邊）：01 ev_y4_welcome　02 ev_y4_typhoon_noodle　03 ev_y4_midautumn　04 ev_y4_path_again（換台詞）　05 ev_yt_essay　06 ev_push_interview、ev_bh_dinner　07 ev_fair_booth_y4（_pass）
     08 ev_plg_handover　09 ev_yt_share_time　10 ev_y4_xmas　11 明信片資料 R2Y4A_EVENTS.PC2　12 ev_back_home_cafe　13 ev_kexin_study_really（_lib、_us）　14 ev_kexin_two_directions　15 ev_kexin_intern_result
   大四寒假：23 ev_sis_pickup　24 ev_kexin_xmas_y4　25 只有手機　26 ev_kexin_trip_winter_y4　27 ev_grad_exam、ev_grad_exam_after　28 ev_kexin_lunar_eve_y4_call　29 ev_kexin_valentine_y4
   「交往中」＝當天 dating_heroine_05；「挽回中」＝分開了、還沒重新開始（AA_327 美國路線的共通）。何俊朗 1～5 是第 3 輪（還沒有）：MET_LONG 沒有＝他的句子照 AA 寫的「沒有 MET_LONG」那一版。
   CG：CG_REGISTRY 有才放（hasCG）；BCG-14、BCG-32、BCG-23 要重畫（BB_183 1-4、1-5、1-7：舊圖是冬天、二月的窗外、結冰的湖），AA_327 寫「重畫以前不放」；
     BCG-34 接機（AA_345 F2）：登錄的是夏天版（白襯衫），12/23 是冬天，冬天版（BB_184）通過以前不放——
     重畫的圖登錄時在 CG_REGISTRY 那一列加 redrawn:true（或從下面的 REDRAW 拿掉）才放。測試：node tests/r2y4a_events_unit.js */
'use strict';
const R2Y4A_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const REDRAW=['cg_bus_station_heroine05','cg_us_kitchen_heroine05','cg_frozen_lake_heroine05','cg_airport_pickup_heroine05'];
  const cgOK=id=>hasCG(id)&&(!REDRAW.includes(id)||CG_REGISTRY[id].redrawn===true);
  const CG=id=>({if:{custom:()=>cgOK(id)},cg:id});
  const S5='heroine_05';
  const LONG=G=>!!(G.flags&&G.flags.MET_LONG)||has('npc_long','MET_LONG');   /* 何俊朗 1 演過（AA_80；第 3 輪）；記憶也算（AA_370 M3：R3 版記的是記憶）*/
  const sis=t=>({speaker:S5,text:t}), nar=t=>({speaker:null,text:t}), me=t=>({speaker:'player',text:t});
  const IF=(fn,l)=>Object.assign({if:{custom:fn}},l), UN=(fn,l)=>Object.assign({unless:{custom:fn}},l);
  /* 日文（下）第 10 週那一堂「『大丈夫』不一定是沒事」（BB_105 G6）：有去、沒有記缺席 */
  const G6=G=>{ if(typeof STORY==='undefined'||!STORY.termDay||typeof CLS==='undefined'||!CLS.rec) return false; const d=STORY.termDay('Y2S2',10,1); if(d==null) return false; const R=CLS.rec(G), k=d+':japanese_2:pm1'; return !!(R.done&&R.done[k])&&!(R.abs&&R.abs[k]); };
  const EV=[];

  /* ---- 2-Y4-16 US1 抵達（AA_261 5-2、BB_98 2-7；AA_291 第 2 節的時刻）：19:00 布魯明頓長途巴士站。US1＝'together'／'alone'（r2y4a3d.js 抵達那一刻照交往狀態記）---- */
  EV.push({ id:'ev_us1_arrive', title:'抵達', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'布魯明頓・長途巴士站',bg:'us_bus_station'},
      {if:{flagIs:{US1:'together'}},goto:'t'},
      nar('（下了巴士，她拿了自己的行李就往前走。走了幾步，停下來。）'),
      sis('超市在那邊。……你自己會找吧。'),
      {end:true},
      {label:'t'},CG('cg_bus_station_heroine05'),   /* BCG-14：第一句旁白出現，到「走吧，先去超市。」收起（場景換到超市）*/
      nar('（長途巴士在傍晚停下來。她先下車，在行李艙前面等你。頭髮沒有綁。你第一次看到她不綁頭髮。）'),
      sis('十九個小時。……我在飛機上把論文第三章看完了。'),
      sis('這裡太陽九點才下山。'),
      sis('走吧，先去超市。你那裡什麼都沒有。') ] });
  EV.push({ id:'ev_us1_market', title:'草原超市', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ sis('這裡的雞蛋要自己看日期。我出發前查過了。'),
      nar('（結完帳，她指了指馬路對面。一間小小的店，招牌上有中文。）'),
      sis('對面那間也去一下。') ] });
  EV.push({ id:'ev_us1_asian', title:'竹葉亞洲超市', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ nar('（亞洲超市。她在泡麵那一排停了很久，拿了一包台灣的泡麵，貴三倍。）'),
      sis('……我在研究室常吃這一種。') ] });   /* AA_450 1-1：原「……這個不算浪費。這是鄉愁。」（口氣表 0-3 禁的「不算 X，這是 Y」）*/
  EV.push({ id:'ev_us1_door', title:'公寓 214', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',   /* 二樓的戶外樓梯平台；她不進門；BB_98 2-7 原句拿掉編號（裁定第 6 點）*/
    dialogue:[ sis('你一個人一戶？……有客廳，還有自己的廚房。'),
      sis('我住 C 棟，三個人合租。廚房是共用的，冰箱上貼了一張輪值表。'),
      sis('冷氣不要開太強，會很乾。垃圾星期四收。'),
      sis('……有事打給我。同一個社區，走路五分鐘。') ] });
  EV.push({ id:'ev_us1_mom', title:'打給媽媽', participants:[], location:'any', trigger:'manual', once:true, background:'blur',   /* 21:30，所有美國路線（AA_291 4-1）*/
    dialogue:[ nar('（行李箱上貼著媽媽的便條：「到了打電話。不管幾點。」）'),
      nar('（你打給媽媽。台灣是早上九點半，她說她剛好醒了。）'),
      {set:{US1_MOM:true}} ] });

  /* ---- 2-Y4-17 US2 退回的報告（C 棟 208 廚房；溫書瑀_角色企劃 US2、BB_98 2-8、BB_217）：交往中＝9/13 18:30～19:30 坐到窗口外側的高腳椅（usShared:'bar'）就開始 ---- */
  const US2_DAY=G=>{ const d=D('2028-09-13'), hh=((G.hour%24)+24)%24; return d!=null&&G.day===d&&hh>=18.5&&hh<19.5; };
  const onBar=GM=>{ const P=GM&&GM.E&&GM.E.player; return !!(P&&P.seat&&P.seat.lift>0); };   /* 高腳椅（us3d.js：椅面 0.76，seat.lift＝0.31；合租戶只有吧台的高腳椅有 lift）*/
  /* AA_516 第 8 節第 1 點、第 3 點、第 4 點（企劃線 3cd10909b → d6f8621ac → 913802344 第 8 節第 4 點；SIS-B14-AAFIX-1028）：4-1 9/2 208 的咖哩她說「……下次你用我的碗。」（SIS14_US_CURRY，src/sis_b14_3d.js）＝
     之後第一次「有吃東西的」208 場景多一句旁白，一次（記 SIS14_BOWL；條件 SISB14.bowlDue）。先算這一場（9/13 US2），三支都出（第 4 點）：
     「那就寫妳。」接在「（她把麵分到兩個碗。）」後面（第 3 點）；「先吃麵。」在「（你們隔著窗口吃完泡麵。）」前面；「書瑀，休息一下。」在「……休息完再改。先吃麵。」後面。
     沒演到 US2 才是 3-2 滷肉（src/us208_3d.js 的 BOWL，兩支選項會合的地方（label e 後面，盛出來吃的時候；第 5 點 ca08e848c））；4-2 煎蛋不算（盤子，不是碗）。
     字和 us208_3d.js 那一行相同（這個檔先載入，引用不到那邊）；aa516：tests/aa516_sis_b14_unit.js 逐句對稿用 */
  const BOWL=Object.assign(IF(G=>typeof SISB14!=='undefined'&&!!SISB14.bowlDue&&SISB14.bowlDue(G),nar('（她把自己的碗放在你面前，換她用你上次帶來的那一個。）')),{set:{SIS14_BOWL:true},aa516:true});
  EV.push({ id:'ev_us2_kitchen', title:'退回的報告', participants:[S5], location:'us_shared', trigger:'seat', once:true, background:'blur',
    prereq:{custom:(G,GM)=>typeof STORY!=='undefined'&&STORY.route(G)==='US'&&dating(G,S5)&&!G.flags.US2&&US2_DAY(G)&&onBar(GM)},
    dialogue:[ nar('（她在煮泡麵，兩包。）'),
      sis('我的報告被退回了。'),
      sis('教授說：「妳的論點很清楚，但我讀不到妳。」'),
      CG('cg_us_kitchen_heroine05'),   /* BCG-32（窗外要改成夏末，BB_183 1-5）*/
      sis('（笑出來）……被說中了。'),
      sis('不過這次我知道要怎麼改了。'),
      sis('泡麵要不要。我煮了兩包。本來想說吃兩包，現在剛好一人一包。'),
      {choice:[{text:'「那就寫妳。」',goto:'a'},{text:'「先吃麵。」',goto:'b'},{text:'「書瑀，休息一下。」',goto:'c'}]},   /* 第三個照使用者 10-17「交往當天起叫書瑀」（AA_243 第 5 節第 6 題）*/
      {label:'a'},sis('對。'),nar('（她把麵分到兩個碗。）'),BOWL,sis('我要寫法服那兩年遇到的人。週六早上，那些拿著存證信函來問的阿伯阿姨。'),nar('（她拿出手機記下來。）'),sis('第一段有了。'),{goto:'end'},   /* BOWL：AA_516 第 8 節第 3 點（上面）*/
      {label:'b'},sis('……好。'),BOWL,nar('（你們隔著窗口吃完泡麵。）'),sis('評價？'),me('很鹹。'),sis('我也覺得。這是我在美國學會的第一道菜。'),{goto:'end'},   /* BOWL：AA_516 第 8 節第 4 點，「（你們隔著窗口吃完泡麵。）」前面 */
      {label:'c'},sis('……休息完再改。先吃麵。'),BOWL,   /* BOWL：AA_516 第 8 節第 4 點，「……休息完再改。先吃麵。」後面 */
      {label:'end'},{set:{US2:'there'}} ] });
  /* 挽回中（AA_253 §6 第 2 步原句）：她沒有約他；19:00 前後他去 C 棟還向她室友借的鍋子（r2y4a3d.js：人在社區就帶到 C 棟）。選「還沒。」＝REPAIR +1（after）*/
  EV.push({ id:'ev_us2_repair', title:'退回的報告', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ nar('（你去 C 棟還上個禮拜跟她室友借的鍋子。廚房朝客廳的窗口開著，她站在爐子前面，水還沒滾。你把鍋子放在窗口的吧台上。）'),   /* AA_452 1-3：交代鍋子是哪來的 */
      CG('cg_us_kitchen_heroine05'),   /* BCG-32 接這一句 */
      sis('……報告被退了。教授說：「妳的論點很清楚，但我讀不到妳。」'),
      nar('（水滾了。她把麵放進去，放了兩人份，又拿出一把。）'),
      sis('……你吃過了嗎？'),
      {choice:[{text:'「還沒。」',set:{US2_STAYED:true},goto:'a'},{text:'「吃過了。」',goto:'b'}]},
      {label:'a'},nar('（她把那一把麵放回鍋子裡。你在窗口外的高腳椅坐下。）'),{goto:'end'},
      {label:'b'},sis('好。'),nar('（她煮了一人份。）'),
      {label:'end'},{set:{US2:'repair'}} ],
    after:G=>{ if(G.flags.US2_STAYED&&typeof R2Y4A!=='undefined') R2Y4A.repairAdd(G,'us2'); } });

  /* ---- 2-Y4-18 芝加哥的週末（BB_98 2-9；D47：芝加哥用圖片）：11/11 07:00 出發（出遊），兩天＝兩段（第二天在 afterOuting 接 ev_us_chicago2）---- */
  EV.push({ id:'ev_us_chicago', title:'芝加哥的週末', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {if:{custom:LONG},goto:'chi0'},   /* AA_451 1-1：沒見過他的（8/14 迎新、9/8 下課都沒去），11/3 學姊說「我們一起認識他」——在巴士上認識（MET_LONG＋LONG_CHI）；之後的句子照有見過的版本 */
      nar('（巴士上，坐在你們前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）'),
      {speaker:'何俊朗',text:'臺灣來的？我聽你們講話聽出來的。'},
      {speaker:'何俊朗',text:'香港。何俊朗。叫我 Long 就好。'},
      me('{name}。'),
      nar('（學姊點了一下頭，報了自己的名字。他轉回去以前，把手機上一家披薩店的地址給你們看。）'),
      {set:{MET_LONG:true,LONG_CHI:true}},
      {label:'chi0'},{scene:'芝加哥',bg:'chicago_lake'},
      nar('（她排了一張行程表，每一格都有時間。第一個景點就遲到二十分鐘：巴士誤點。）'),
      nar('（她看著行程表，然後把它摺起來，放進口袋。）'),
      CG('cg_chicago_heroine05'),   /* BCG-17（何俊朗只畫背影）*/
      sis('……今天不照表。'),
      nar('（一路上，何俊朗說了好幾次「還好」：巴士、披薩、湖邊的風。每一次聽起來都不一樣。）'),   /* AA_345 F10：不寫成他的台詞，一句旁白接學姊那句。沒見過他的在上面巴士上認識了（AA_451 1-1；原本 AA_370 L1 的「同行的人」版不再用）*/
      sis('「還好」是好還是不好？'),
      me('看情況。'),
      sis('……法律系的回答。'),
      IF(G6,me('……像日文的「大丈夫」。要看前面那一句。')),IF(G6,sis('你修過日文？')),IF(G6,me('修過兩學期。')),IF(G6,sis('……好。那你負責翻譯他。')) ],
    afterOuting:async(G,GM)=>{ if(typeof R2Y4A!=='undefined') await R2Y4A.chicagoDay2(GM); },
    outingMissed:G=>{ if(typeof R2Y4A!=='undefined') R2Y4A.chicagoMissed(G,true); } });
  EV.push({ id:'ev_us_chicago2', title:'芝加哥的週末', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'芝加哥・博物館',bg:'chicago_dino'},
      nar('（她讀完每一塊說明牌。）'),
      IF(LONG,{speaker:'何俊朗',text:'妳每一塊都要讀？'}),UN(LONG,nar('（同行的人問她：「妳每一塊都要讀？」）')),   /* 裁定第 15 點 */
      sis('……我只是想讀完。'),
      sis('（看了一眼後面還有二十塊）……好。我跳過一塊。'),
      IF(G=>dating(G,S5),nar('（回程的巴士上，她睡著了。行程表還在她的外套口袋裡。）')),
      UN(G=>dating(G,S5),nar('（晚上回程的巴士上，兩個人隔一排坐。）')),
      {mem:[{npc:S5,tag:'CHICAGO_TRIP',note:''}]} ] });

  /* ---- 2-Y4-19 US3 感恩節的湖邊（溫書瑀_角色企劃 US3；AA_253 §6 第 3 步）：11/23 09:00 會所門口 → 湖邊（出遊）---- */
  EV.push({ id:'ev_us3_lake', title:'感恩節的湖邊', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'湖邊',bg:'us_lake'},
      {unless:{custom:G=>dating(G,S5)},goto:'r'},
      {if:{memory:[{npc:S5,tag:'CHICAGO_TRIP'}]},speaker:S5,text:'上次在芝加哥，我把行程表摺起來了。這次乾脆不寫。'},
      sis('放假要做的事，我寫在備忘錄了。'),
      nar('（她把手機給你看。備忘錄上只有一行：「睡到自然醒」。）'),
      sis('其他的想不到。'),
      me('穿暖。不要帶筆電。'),
      sis('（愣住，然後笑出來）……你在管我。'),
      sis('好。那再加一行：看雪。'),   /* AA_398 第 31 列 */
      CG('cg_frozen_lake_heroine05'),   /* BCG-23（要改圖：湖水沒結冰、岸邊有薄雪，BB_183 1-7）*/
      sis('（打字，停了一下，又加兩個字）跟你。'),
      {set:{US3:'two'}},{end:true},
      {label:'r'},
      IF(LONG,nar('（湖邊。何俊朗和其他人走在前面。她放慢腳步，走到你旁邊。）')),UN(LONG,nar('（湖邊。大家走在前面。她放慢腳步，走到你旁邊。）')),   /* AA_452 1-4：群組約的是「大家」*/
      sis('分手那天，你沒有解釋。'),
      sis('我後來想，那樣比較好。你解釋的話，我可能會信。'),
      sis('……我不想因為信了一個解釋，再跟你在一起。'),
      {choice:[{text:'「那妳想因為什麼？」',set:{US3_HEARD:true},goto:'r1'},{text:'「對不起。」',goto:'r2'}]},
      {label:'r1'},sis('……因為你在這裡這三個月的樣子。'),{goto:'r3'},
      {label:'r2'},sis('我知道。你說過了。'),
      {label:'r3'},{set:{US3:'repair'}} ],
    after:G=>{ if(G.flags.US3_HEARD&&G.flags.US3==='repair'&&typeof R2Y4A!=='undefined') R2Y4A.repairAdd(G,'us3'); },
    outingMissed:G=>{ if(typeof R2Y4A!=='undefined') R2Y4A.lakeMissed(G); } });

  /* ---- 2-Y4-20 US4 初雪：小教堂的台階（AA_254 第 8 節；挽回中 AA_253 §6 第 4 步）。這不是告白（BB_203 第 3 節）---- */
  const SNOW_END=[ nar('（回公寓以前，她翻開計畫本，在 12 月 2 日那一格寫了一個字。）'),me('寫什麼？'),sis('不給你看。'),nar('（她把計畫本闔起來。那一格寫的是「雪」。）') ];   /* 「回宿舍」改「回公寓」（裁定第 14 點）*/
  EV.push({ id:'ev_us_first_snow', title:'初雪', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'小教堂前的台階',bg:'dark'},
      {if:{flags:['US_SNOW_LATE']},speaker:null,text:'（你還是去了。雪下得很小，她坐在台階最上面一階。）'},   /* 20:30 以後、21:30 還沒到＝帶到場 */
      {if:{flags:['SIS14_COAT']},speaker:null,text:'（你穿著那件外套。她也是。）',aa516:true},   /* AA_516 4-3（企劃線 a9b87c588）：SU-L7「好。週六。」那一趟買了外套（src/sis_b14_3d.js）＝開頭多一句 */
      nar('（她坐在台階最上面一階，旁邊放著兩杯熱可可。你坐下的時候，她把一杯推過來。）'),
      sis('剛買的。……還燙。'),
      nar('（雪開始下。一開始很小，落在杯蓋上就化了。）'),
      me('妳還好嗎？'),
      sis('還好。'),
      nar('（她喝了一口。雪落在她的帽子上，沒有化。）'),
      {choice:[{text:'（再問一次）「妳還好嗎？」',goto:'a'},{text:'（不問了）',goto:'b'}]},
      {label:'a'},sis('……你怎麼會問第二次。'),
      sis('不太好。論文回去還要改兩章。我不知道碩三畢不畢得了業。'),
      sis('還有……我其實不知道自己為什麼要念研究所。以前有人問，我都說「先不要問我」。'),
      CG('cg_snow_steps_heroine05'),   /* BCG-09 */
      nar('（她把頭靠在你的肩膀上。雪積在兩個人的帽子上。）'),
      {set:{SIS_ASKED_TWICE:true}},{goto:'end'},
      {label:'b'},CG('cg_snow_steps_heroine05'),
      nar('（你們沒有再說話。她靠過來，雪積在兩個人的帽子上。）'),
      {set:{US_SNOW_QUIET:true}},
      {label:'end'} ].concat(SNOW_END,[{set:{US_SNOW:'together'}}]) });
  /* 挽回中：REPAIR ≥ 3、分手以後沒有再說謊（BB_204 第 4 節的對照）＝「這次我先說」→ 重新交往；沒到只演前三句 */
  const REP_OK=G=>typeof R2Y4A!=='undefined'&&R2Y4A.repairOK(G);
  EV.push({ id:'ev_us_snow_repair', title:'初雪', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'小教堂前的台階',bg:'dark'},
      nar('（下雪了。學姊坐在小教堂前面的台階上，沒有撐傘。）'),
      sis('你看。'),
      sis('……我在臺灣，從來沒看過雪。'),
      {if:{custom:REP_OK},goto:'ok'},
      sis('……回去吧，會冷。'),
      {set:{US_SNOW:'cold'}},{end:true},
      {label:'ok'},
      sis('如果你還想的話，我們重新開始。這次我先說。'),
      {choice:[{text:'「好。」'},{text:'「……我還想。」'}]},
      CG('cg_snow_steps_heroine05'),
      nar('（她往旁邊挪了一點，讓出半階台階。你坐下來。雪積在兩個人的帽子上。）'),   /* AA_452 第 4 節（企劃線 2c75de1bc）：選完她要有反應，接交往中那一段計畫本「雪」 */
      ...SNOW_END,
      {set:{US_SNOW:'restart'}} ],
    after:G=>{ if(G.flags.US_SNOW==='restart'&&typeof R2Y4A!=='undefined') R2Y4A.restart(G); } });

  /* ---- 2-Y4-21 會所晚餐（BB_98 2-8、10-1；AA_262 第 5 節第 6 件）：12/14 19:00 社區會所（usClub:'door' 或出遊）。交往中、挽回中台詞一樣 ---- */
  const DISH=(k,t)=>[IF(G=>G.flags.US_CLUB_DISH===k&&LONG(G),{speaker:'何俊朗',text:t}),IF(G=>G.flags.US_CLUB_DISH===k&&!LONG(G),{speaker:'學姊的室友',text:t})];
  EV.push({ id:'ev_us_club_dinner', title:'會所晚餐', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'會所・交誼廳',bg:'us_club_lounge'},
      nar('（會所的交誼廳，兩張長桌併在一起。每個人帶來的菜擺成一排，有一半是泡麵做的。）')]
      .concat(DISH('egg','這是什麼？……好香。'),DISH('noodle','你把最後一包拿出來了？'),DISH('plates','……謝謝。盤子剛好不夠。'),
      [ nar('（學姊坐在長桌的另一頭，最後一個拿起杯子。）'),
        nar('（她舉杯。）'),
        CG('cg_last_dinner_heroine05'),   /* BCG-33（圖不改；標題是 CG 的名字、不是台詞）*/
        sis('……謝謝你們這一學期。'),
        {set:{US_CLUB_DINNER:'went'}} ]),
    outingMissed:G=>{ if(typeof R2Y4A!=='undefined') R2Y4A.clubMissed(G); } });

  /* ---- 2-Y4-22 離開、舊金山、12/23 回臺灣（AA_291 2-2、第 5 節；BB_183 第 5 節；AA_253 9-2；AA_144 X2）---- */
  EV.push({ id:'ev_us_leave', title:'離開', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ {if:{flags:['SIS14_BOOK4']},speaker:null,text:'（你的背包裡多了一本她的書。比你自己的三本都重。）',aa516:true},   /* AA_516 4-5（企劃線 a9b87c588）：SU-L8 選「那這次超重什麼？」（她回「第四本你幫我拿。」，src/sis_b14_3d.js 記 SIS14_BOOK4）＝開頭多一句 */
      {unless:{custom:LONG},goto:'n'},
      nar('（天還沒亮。何俊朗拖著兩個行李箱，背包上的奶茶杯鑰匙圈在晃。）'),
      {speaker:'何俊朗',text:'我的飛機比你早。……香港見？'},
      {choice:[{text:'「香港見。」',goto:'a'},{text:'「還好。」',goto:'b'}]},
      {label:'a'},{speaker:'何俊朗',text:'我帶你去吃。說好了。'},{goto:'e'},
      {label:'b'},UN(G=>!!G.flags.LONG_CHI,{speaker:'何俊朗',text:'……你又來了。'}),IF(G=>!!G.flags.LONG_CHI,{speaker:'何俊朗',text:'……還好？你學我。'}),nar('（他笑了一下，上了車。）'),{goto:'e'},   /* AA_451 1-1：芝加哥才認識的（LONG_CHI），說「還好」的是他自己 */
      {label:'n'},nar('（天還沒亮。社區門口停著機場巴士。）'),
      {label:'e'},{set:{US_LEFT:true}} ] });
  EV.push({ id:'ev_sf1', title:'舊金山', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'舊金山',bg:'trip_hotel_twin'},
      nar('（她坐在靠窗的那張床上，打開計畫本。新的一頁，最上面寫「舊金山」，下面是空的。）'),
      sis('以前出門，我會先把每一天都排好。'),
      sis('……這一頁我不寫。'),
      sis('這一週，你排。'),
      {choice:[{text:'「第一天：睡到自然醒。」',goto:'a'},{text:'「我們一天排一件就好。」',goto:'b'},{text:'「妳也排一件。」',goto:'c'}]},
      {label:'a'},sis('……這也算行程嗎。'),sis('好。算。'),nar('（她在那一頁寫下：「第一天：睡到自然醒。」然後把筆蓋起來。）'),   /* AA_398 第 32 列 */{goto:'e'},
      {label:'b'},sis('一天一件。'),nar('（她想了一下）'),sis('……那五天，五件。剛好。'),{goto:'e'},
      {label:'c'},sis('我？'),nar('（她看著空白頁很久）'),sis('……一件。最後一天，寄一張明信片回台灣。給家族。'),
      {label:'e'} ] });
  EV.push({ id:'ev_sf2', title:'霧裡的大橋', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'霧裡的大橋',bg:'sf_bridge_fog'},
      nar('（大橋的另一頭被霧吃掉了，只看得到最近的兩根橋塔。風很冷。）'),
      sis('看不到另一頭。'),
      {if:{custom:()=>hasCG('cg_sf_bridge_fog_heroine05')},cg:'cg_sf_bridge_fog_heroine05'},   /* BCG-48（使用者 10-17 批准；生成狀態照 BB_184）*/
      sis('……走得過去嗎。'),
      {choice:[{text:'「走過去就看得到了。」',goto:'a'},{text:'「那我們走到一半就好。」',goto:'b'},{text:'（不說話，牽她的手）',goto:'c'}]},
      {label:'a'},sis('嗯。'),nar('（她先走。走了幾步回頭。）'),sis('你也要走。'),{goto:'e'},
      {label:'b'},sis('一半。'),nar('（她笑了）'),sis('……好。走到第二根橋塔。'),{goto:'e'},
      {label:'c'},nar('（她沒有說話，手沒有抽開。走到第二根橋塔，霧散了一點。）'),sis('……另一頭在那裡。'),
      {label:'e'} ] });
  EV.push({ id:'ev_sf3', title:'老書店', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'老書店',bg:'sf_bookstore'},
      nar('（二樓靠窗有一張舊椅子。她拿了一本詩集，坐下來就沒有再站起來。）'),
      sis('這不是法律書。'),
      sis('……你可以去逛。我在這裡。'),
      {choice:[{text:'「我也坐這裡。」',goto:'a'},{text:'「我去逛一圈再回來。」',goto:'b'}]},
      {label:'a'},nar('（她把詩集翻到一半推過來。）'),sis('你讀左邊，我讀右邊。'),{goto:'e'},
      {label:'b'},nar('（回來的時候她睡著了，詩集蓋在腿上。你沒有叫她。）'),
      {label:'e'},nar('（她買了那本詩集。）') ] });
  const PHOTO=(id,photo,line)=>({ id, title:'舊金山', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark', dialogue:[ {scene:'舊金山',bg:false},nar('📷（'+photo+'）'),sis(line) ] });   /* 摘要日的照片（手機相簿；BB_183 5-3，12/19 那句改字見裁定第 10 點）*/
  EV.push(PHOTO('ev_sf_photo17','旅館窗外的坡道和叮噹車的電纜','睡到自然醒。……十點。我已經很努力了。'),
          PHOTO('ev_sf_photo19','碼頭邊的一碗蛤蜊湯（麵包碗）','好喝。……比我想的好喝。'),
          PHOTO('ev_sf_photo21','郵筒前，她手上一張明信片（字看不到）','寄給家族了。Kevin 收到會說我終於寫超過三句。'));
  const BLOOM=(id,t)=>({ id, title:'布魯明頓', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:[ nar(t) ] });   /* 挽回中、挽回不成：三個摘要日（AA_291 2-2）*/
  EV.push(BLOOM('ev_us_bloom16','（社區很安靜。你把冰箱裡剩下的東西煮成一鍋。）'),
          BLOOM('ev_us_bloom18','（你去會所把借的書還了。交誼廳的聖誕樹還亮著，沒有人。）'),
          BLOOM('ev_us_bloom20','（行李箱合上了。你坐在上面，才拉得上拉鍊。）'),
          BLOOM('ev_us_bus21','（學姊也在這一班，坐在前面。）'));
  /* 12/23 05:40 桃園，入境大廳（AA_253 9-2 美國欄第一列＋BB_183 5-4；媽媽一個人來接，裁定第 8、9 點）；挽回不成＝她先走了 */
  EV.push({ id:'ev_us_return', title:'回到臺灣', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'桃園機場・入境大廳',bg:'airport_arrival'},
      {unless:{custom:G=>dating(G,S5)},goto:'n'},
      nar('（自動門一打開，你們兩個同時把外套脫了。）'),
      sis('十二月的臺北，還是比那邊熱。'),
      {unless:{flagIs:{US1:'together'}},goto:'m0'},   /* AA_370 M5：8/2 一起出發（交往中）媽媽已經塞鳳梨酥給她、她說過「謝謝阿姨」——不是第一次見面 */
      nar('（媽媽先看到你，再看到你旁邊的人。她笑了一下。）'),
      sis('阿姨好。……上次的鳳梨酥，很好吃。'),
      {goto:'m1'},
      {label:'m0'},   /* 8/2 出發那天還沒在交往（挽回中、後來重新開始）：媽媽第一次見到她（原句）*/
      nar('（媽媽先看到你，再看到你旁邊的人。）'),
      sis('伯母好。……我是書瑀。'),
      {label:'m1'},
      sis('（小聲）我搭捷運就好。'),
      {speaker:'媽媽',text:'一起走啦，順路。'},
      sis('……好。謝謝。'),
      {scene:'車上',bg:'car_morning'},
      nar('（車上她坐後座，一路很安靜。到她家巷口下車前，對著前座說。）'),
      sis('謝謝載我。'),
      sis('……他在美國很照顧我。'),
      sis('下次我會帶伴手禮來。'),
      {phone:S5,text:'……第二句是反的。是我照顧你。'},   /* 下車以後她傳 */
      {set:{CAME_BACK_TOGETHER:true}},{end:true},
      {label:'n'},nar('（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）'),nar('（出口，媽媽在揮手。）') ] });   /* AA_452 1-5：12/10 媽媽說要來接 */
  EV.push({ id:'ev_us_home', title:'臺北的家', participants:[], location:'any', trigger:'manual', once:true, background:'dark',   /* 上午（AA_144 X2；兩種玩家都有）*/
    dialogue:[ {scene:'臺北・家裡',bg:'home_living_day'},
      nar('（九點。廚房裡有粥的味道。你回來了。）'),   /* AA_370 M5：媽媽 05:40 就接到人了，九點這句是旁白（AA_291 第 5 節；原「媽媽：你回來了。」）*/
      nar('（房間打掃過了。桌上多了一盒你小時候的模型。）') ] });

  /* ===================== 大四上（臺灣這邊；美國路線人在美國＝只有照片）===================== */
  const here=id=>G=>knows(id,G);
  const notUS=G=>!(typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='US');
  /* ---- 2-Y4-01 迎新（大四版）：2028-09-02（六）13:00 社科院旁的草地（出遊；8/31 21:00 系學會在「法律系（全班）」群組）---- */
  EV.push({ id:'ev_y4_welcome', title:'迎新（大四版）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'社科院旁的草地',bg:'ntu_soc'},
      nar('（新生排隊領名牌。一個學弟問你萬才館怎麼走。）'),
      {speaker:'系學會的人',text:'學長，你帶他過去好了。'},
      {scene:'椰林大道',bg:'ntu_avenue'},
      nar('（你帶他走過椰林大道。他一直回頭看傅鐘。）'),
      {speaker:'新生',text:'學長，大四會很忙嗎？'},
      {choice:[{text:'「忙。可是還是會去吃麵。」',goto:'a'},{text:'「看你想做什麼。」',goto:'b'},{text:'（指著萬才館）「先記得這棟就好。」',goto:'c'}]},
      {label:'a'},{speaker:'新生',text:'吃麵？'},nar('（你往公館的方向指了一下。）'),{goto:'e'},
      {label:'b'},{speaker:'新生',text:'……我還不知道想做什麼。'},me('那先念民總。'),{goto:'e'},
      {label:'c'},nar('（他把萬才館拍了一張照片。）'),
      {label:'e'},nar('（萬才館門口。他說了謝謝，跑回草地。）'),
      {set:{WELCOME_Y4:'went'}} ] });

  /* ---- 2-Y4-02 颱風假 T4a 泡麵之夜（BB_110；AA_253 第 8 節）：9/17（日）21:00 起人在宿舍 409（停課公告、T4b 停課的信在 r2y4a3d.js）---- */
  const BH='classmate_bohan';
  EV.push({ id:'ev_y4_typhoon_noodle', title:'颱風夜', participants:[BH], location:'dorm', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ const d=D('2028-09-17'); return d!=null&&G.day===d&&G.hour>=21&&notUS(G); }},
    dialogue:[ nar('（颱風夜，宿舍停電前，柏翰把兩碗泡麵放在書桌上。）'),
      {speaker:BH,text:'熱水只剩這些。一人一碗。'},
      {speaker:BH,text:'……我算過，停電的話，手機還能撐四個小時。'},
      {choice:[{text:'「兩碗不夠。我去便利商店。」',goto:'a'},{text:'「我打給阿凱。」',goto:'b'},{text:'（坐下來吃）',goto:'c'}]},
      {label:'a'},{if:{flags:['JOB_CVS']},goto:'a2'},nar('（貨架上只剩海鮮口味。）'),{goto:'e'},   /* 做過便利商店夜班（AA_289 3-4；打工系統還沒有：JOB_CVS 先當作沒有）*/
      {label:'a2'},nar('（店長在櫃台下面留了三碗。）'),{speaker:'店長',text:'今年要三碗吧？'},{goto:'e'},
      {label:'b'},{speaker:'阿凱（電話）',text:'我還有二十包。你大一吃掉的那些，我補回來了。'},nar('（十分鐘後，他抱著一箱泡麵上樓。）'),{goto:'e'},
      {label:'c'},nar('（你們各吃一碗。十點，燈真的熄了。柏翰把手機的手電筒對著天花板。）'),
      {label:'e'},{set:{TYPHOON_Y4:'noodle'}} ] });

  /* ---- 2-Y4-03 中秋烤肉（大四版）：10/3（二）18:00～21:00 公館河濱（出遊；10/2 21:00 阿哲在麵店團群組）---- */
  const KX_TEAM=G=>dating(G,'kexin')&&!!G.flags.KX_MET_NOODLE_TEAM;
  EV.push({ id:'ev_y4_midautumn', title:'中秋烤肉（大四）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      nar('（河濱。兩個烤肉架，一支夾子。）'),
      IF(G=>knows('yu',G)&&done(G,'ev_y2_midautumn'),{speaker:'yu',text:'又來了。'}),
      IF(G=>knows('yu',G)&&!done(G,'ev_y2_midautumn'),{speaker:'yu',text:'……兩個架子，一支夾子？'}),
      IF(here('heroine_03'),{speaker:'heroine_03',text:'阿姨今年醃了兩倍。她說你們最後一年了。'}),
      IF(here(BH),{speaker:BH,text:'夾子排班。一人十分鐘。'}),
      IF(here('heroine_01'),{speaker:'heroine_01',text:'……我贊成。'}),   /* 大四只說「……我贊成。」（裁定第 4 點）*/
      IF(KX_TEAM,{speaker:'zhe',text:'可昕，冷笑話，最後一回合。'}),IF(KX_TEAM,{speaker:'kexin',expression:'laugh',text:'……今年我認輸。我只想吃。'}),IF(KX_TEAM,{speaker:'zhe',text:'可昕認輸了！大家記下來！'}),
      {advance:G=>Math.max(0,21-(((G.hour%24)+24)%24))},
      {speaker:'zhe',text:'明年還是要回來烤。'},
      {choice:[{text:'「好。」',goto:'a'},{text:'「明年大家都在讀書吧。」',goto:'b'}]},
      {label:'a'},{speaker:'zhe',text:'說好了喔。'},{goto:'e'},
      {label:'b'},{speaker:'zhe',text:'讀書也要吃飯。'},
      {label:'e'},{set:{MIDAUTUMN_Y4:'went'}} ] });

  /* ---- 2-Y4-07 校慶園遊會（大四版）：11/11（六）10:00～16:00 椰林大道法服問答攤（同大二的位置）---- */
  const GT=G=>['asked','heard'].includes(G.flags.GRANDMA_TREE_Y2);
  const FAIR={ location:'campus', trigger:'auto', term:['Y4S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5}, background:'blur' };
  EV.push(Object.assign({ id:'ev_fair_booth_y4', title:'法律問答攤（大四）', participants:[],
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G)&&notUS(G)},
    dialogue:[ nar('（中午，一個阿嬤提著一袋芭樂，直接走到攤位前面。）'),
      {speaker:'阿嬤',text:'少年欸，這袋是從隔壁掉過來的。'},
      IF(GT,{speaker:'阿嬤',text:'法律說是我的。給你們。'}),UN(GT,{speaker:'阿嬤',text:'給你們。不用登記。'}),
      {choice:[{text:'「阿嬤，隔壁後來有講嗎？」',goto:'a'},{text:'（收下）「謝謝阿嬤。」',goto:'b'}]},
      {label:'a'},{speaker:'阿嬤',text:'有啦。掉過來的給我，樹枝他自己剪。'},{goto:'e'},
      {label:'b'},nar('（她揮揮手，往下一個攤位走。）'),
      {label:'e'},{set:{GRANDMA_Y4:'booth'}} ] },FAIR));
  EV.push(Object.assign({ id:'ev_fair_booth_y4_pass', title:'法律問答攤（路過）', participants:[],
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&!STORY.fafuMember(G)&&notUS(G)&&!done(G,'ev_fair_booth_y4')},
    dialogue:[ nar('（法服的攤位前，一個阿嬤把一袋芭樂放在桌上。顧攤的學弟妹不知道該不該收。）'),
      IF(GT,{speaker:'阿嬤',text:'法律說是我的。給你們。'}),UN(GT,{speaker:'阿嬤',text:'給你們。不用登記。'}),
      {set:{GRANDMA_Y4:'pass'}} ] },FAIR));

  /* ---- 2-Y4-08 以安新 19 讀書會交棒：11/30（四）20:00 公法讀書會（大四上第 13 週；activities.js 加了 Y4S1）——去過 3 次以上、那晚有去＝這一場（classes3d.js clubEvent）---- */
  const PLG3=G=>{ const A=(G.acts&&G.acts.att)||{}; let n=0; for(const k in A) if(k.indexOf('public_law_group@')===0&&(A[k]&&(A[k].end||'full')==='full')) n++; return n>=3; };
  EV.push({ id:'ev_plg_handover', title:'讀書會交棒', participants:['heroine_01'], location:'any', trigger:'manual', clubEvent:'public_law_group', once:true, background:'blur',
    prereq:{custom:G=>{ const d=D('2028-11-30'); return d!=null&&G.day===d&&PLG3(G); }},
    dialogue:[ nar('（白板上原本有三條規則。以安拿起板擦，擦到只剩一條：「說理由。」）'),
      nar('（她把白板筆交給學弟。）'),
      IF(here('yu'),{speaker:'yu',text:'妳以前有十條。'}),
      {speaker:'heroine_01',text:'留一條就好，其他的他們自己會加。'},
      {speaker:'heroine_01',text:'（對學弟妹）規則只有一條。例外，要說理由。'},   /* 以安大四上唯一一次說出口的「理由」（AA_262 2-4）*/
      {choice:[{text:'（拍一張白板的照片）',mem:[{npc:'heroine_01',tag:'PLG_LAST_RULE',note:''}],goto:'e'},{text:'（什麼都不說，鼓掌）',goto:'b'}]},
      {label:'b'},nar('（學弟妹跟著鼓掌。以安轉過去看白板，沒有回頭。）'),
      {label:'e'},{set:{PLG_HANDOVER:'there'}} ] });

  /* ---- 2-Y4-10 聖誕交換禮物（大四版）：12/22（五）19:00 阿鳳麵店（出遊；12/21 21:00 阿哲在麵店團群組）---- */
  const XW=['heroine_01','zhe',BH,'yu','heroine_03','classmate_xinci'], XHERE=G=>XW.filter(id=>knows(id,G));
  const ITEM={notebook:'一本小筆記本',coffee:'一包咖啡豆',card:'一張手寫卡片'}, Y1G=G=>!!ITEM[G.flags.XMAS_GIFT];   /* 大一帶過的（ev_xmas_exchange 的 XMAS_GIFT）*/
  const TO=(id,t)=>({if:{flagIs:{XMAS_Y4_TO:id}},speaker:id,text:t});
  EV.push({ id:'ev_y4_xmas', title:'聖誕交換禮物（大四）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'},
      nar('（麵店最裡面那張桌子。禮物疊在中間，吃完再抽。）'),
      {choice:[{text:'一本小筆記本',set:{XMAS_GIFT_Y4:'notebook'}},{text:'一包咖啡豆',set:{XMAS_GIFT_Y4:'coffee'}},{text:'一張手寫卡片',set:{XMAS_GIFT_Y4:'card'}}]},   /* 這次帶什麼（同大一）*/
      nar('（抽完，大家一起打開。）'),
      IF(here('heroine_01'),{speaker:'heroine_01',text:'（手上是一本空白手帳）……這是我會送的那種。'}),
      IF(here('zhe'),{speaker:'zhe',text:'滷味。……我常買的那家。'}),
      IF(G=>knows(BH,G)&&knows('heroine_01',G),{speaker:'heroine_01',text:'沒收。'}),   /* 柏翰拿到考古題、以安在場 */
      IF(here('yu'),{speaker:'yu',text:'（抱著一個巨大的玩偶）這是詛咒吧。'}),
      {pick:{flag:'XMAS_Y4_TO',from:XHERE}},   /* 抽到他禮物的人（在場、認識的人隨機一位）*/
      TO('heroine_01','我收著。'),TO('heroine_03','嗯。'),TO('zhe','好，我帶回宿舍。'),TO(BH,'謝謝。'),TO('classmate_xinci','謝謝。……我會用。'),TO('yu','我要拍照！'),
      IF(Y1G,{pick:{flag:'XMAS_Y4_SAME',from:G=>[ITEM[G.flags.XMAS_GIFT]]}}),
      IF(Y1G,nar('（你抽到的是{flag:XMAS_Y4_SAME}。和你三年前帶來的那一個，幾乎一樣。）')),
      UN(Y1G,nar('（你抽到一罐辣椒醬。）')),UN(Y1G,IF(here('heroine_03'),{speaker:'heroine_03',text:'阿姨的。……不要一次吃完。'})),
      nar('（阿姨多放了一碟燙青菜，說是煮多了。）'),   /* AA_519 1-3：送小菜第八處＝回到第 1 句 */
      {speaker:'阿姨',text:'最後一個冬天的期末。……吃完再走。'},   /* AA_519 1-3：「吃好一點」只留大一上那一次 */
      {set:{XMAS_Y4:'went'}} ] });

  /* ---- 2-Y4-05 語彤 15b〈公館的時間〉（AA_11）：系刊 10/16 出刊；10/17、10/24（二）17:30～20:30 她在麵店的班（FAMILIAR 以上）；沒見到＝總圖三樓期刊架（r2y4a3d.js）---- */
  const YT='heroine_03', yt=t=>({speaker:YT,text:t});
  const YT_DAYS=['2028-10-17','2028-10-24'];
  EV.push({ id:'ev_yt_essay', title:'公館的時間', participants:[YT], location:'noodle', trigger:'auto', once:true, time:[17.5,20.5], background:'blur',
    prereq:{stage:{npc:YT,min:'FAMILIAR'},custom:G=>YT_DAYS.some(k=>D(k)===G.day)&&(!G.flags.YT_ESSAY||G.flags.YT_ESSAY==='shelf')&&notUS(G)},   /* 先翻過期刊架（shelf）的，那兩個班照樣遇得到她 */
    dialogue:[ yt('系刊登了。我沒有寫阿姨是我阿姨。'),
      yt('最後一段寫的是一家麵店。你讀到的時候，不要在我面前讀。'),
      {choice:[{text:'（當著她的面讀）',goto:'a'},{text:'（回家再讀）',goto:'b'}]},
      {label:'a'},nar('（她轉身去倒水。）'),
      nar('（第一段是水源市場賣菜的阿嬤：「她五十年沒有放過假。」中間是續約那天，一個老客人說的話。）'),
      nar('（最後一段是一家麵店。老闆娘每天四點起來熬湯，從來不坐下來吃。）'),
      nar('（你抬頭的時候，她已經倒好水，站在別桌旁邊。）'),
      {set:{YT_ESSAY:'front'}},{end:true},
      {label:'b'},{set:{YT_ESSAY:'home'},stamp:['YT_ESSAY_DAY']} ] });   /* 隔天 21:00「讀了嗎」（r2y4a3d.js）*/

  /* ---- 2-Y4-06 推甄（AA_181 2-4；AA_40 翰 5）：10/26 10:00 面試（萬才館二樓；09:50 還沒到＝帶到場）、11/24 18:30 柏翰的晚餐。便條、放榜、群組在 r2y4a3d.js ---- */
  const BH4=G=>!!G.flags.BH4_DONE;   /* 翰 4 發生過（postgrad3d.js 也讀這個）*/
  EV.push({ id:'ev_push_interview', title:'推甄面試', participants:[BH], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ {if:{flags:['PUSH_RAN']},speaker:null,text:'（你一路跑上二樓。）'},
      IF(BH4,{speaker:BH,text:'他們問我為什麼。……我說，我是真的想知道。'}),
      UN(BH4,{speaker:BH,text:'答完了。最後我多說了一句：我喜歡這一科。'}),
      {scene:'萬才館二樓',bg:'wancai_seminar'},
      nar('（十五分鐘。最後一題是：你為什麼想研究這個？）'),
      {set:{PUSH_INTERVIEW:true}} ] });
  const PASS=G=>G.flags.Y4_PUSH==='pass', bh=t=>({speaker:BH,text:t});
  EV.push({ id:'ev_bh_dinner', title:'柏翰的晚餐', participants:[BH], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'},
      nar('（週五的麵店，長桌空著。你們坐在角落那張兩人桌。）'),
      bh('（看著菜單）我請。你點貴一點的。'),
      bh('……最貴的是一百一。我查過了。'),
      {unless:{custom:PASS},goto:'f'},
      bh('面試的時候，我說完，有一個教授點頭。'),
      bh('我出來以後一直在想，他點頭是什麼意思。'),
      {choice:[{text:'「意思是你答得很好。」',goto:'p1'},{text:'「你可以去問他。」',goto:'p2'},{text:'（夾一顆滷蛋給他）',goto:'p3'}]},
      {label:'p1'},bh('……嗯。我也這樣想。只是想聽別人說。'),{goto:'e'},
      {label:'p2'},bh('開學再問。他會是我的老師。'),{goto:'e'},
      {label:'p3'},bh('……我說我請。'),nar('（他還是吃了。）'),{goto:'e'},
      {label:'f'},bh('二月的筆試，考古題我整理好了。十年份。'),
      bh('我整理的時候，本來就印了兩份。'),
      {choice:[{text:'「謝謝。」',goto:'f1'},{text:'「十年份太多了。」',goto:'f2'}]},
      {label:'f1'},bh('嗯。'),{goto:'e'},
      {label:'f2'},bh('那先讀五年。'),
      {label:'e'},nar('（他付了錢。走出麵店的時候，他說：「下次換你請。」）'),
      {set:{BH_DINNER:'went'}} ],
    outingMissed:G=>{ G.flags.BH_DINNER='missed'; const d=D('2028-11-24'); if(typeof PHONE!=='undefined'&&d!=null) PHONE.at(G,d,19.5,[{th:'p:'+BH,from:BH,text:'我先吃了。……下次還是我請。'}],'y4_bh_dinner_missed'); } });

  /* ---- 2-Y4-15 可昕：放榜那一週，她的實習（BB_99 9-5）：她打來的電話（演出來）；KX_INTERN_CALL＝'pass'／'fail'（r2y4a3d.js 排）。
     2029-03-22 研究所筆試放榜那一通（推甄沒上、後來筆試的玩家；r2y4a3d.js 記 KX_INTERN_EXAM）：她 11/24 已經說過實習上了，這一通換 AA_345 F9 的字、沒有隔天那則 ---- */
  const KX='kexin', kx=t=>({speaker:KX,text:t}), EXAM=G=>!!G.flags.KX_INTERN_EXAM;
  EV.push({ id:'ev_kexin_intern_result', title:'放榜那一天', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,   /* OUT 的電話（call:true；r2y4a3d.js 排在放榜那天 15:30）*/
    dialogue:[ {scene:'電話'},
      {if:{flagIs:{KX_INTERN_CALL:'fail'}},goto:'f'},
      kx('結果出來了吧。你先說。'),
      nar('（你說上了。）'),
      UN(EXAM,kx('我事務所的實習也上了。那今天宵夜誰請？')),IF(EXAM,kx('……好。這次換你的上了。那今天宵夜誰請？')),
      {choice:[{text:'「我請。」',goto:'a'},{text:'「各付各的。」',goto:'b'}]},
      {label:'a'},kx('好。山下那家。'),{goto:'e'},
      {label:'b'},kx('……好啦。'),{goto:'e'},
      {label:'f'},kx('你的，先說你的。'),
      nar('（你說沒上。）'),
      UN(EXAM,kx('……好。二月還有一次。')),   /* 推甄沒上那一通：她不提自己的，隔天 21:00 才傳（那一則記 KX_INTERN）*/
      IF(EXAM,kx('……好。今天宵夜我請。不准說不要。')),   /* 3/22 筆試也沒上（「二月還有一次」已經不成立）*/
      {end:true},
      {label:'e'},{set:{KX_INTERN:true}} ] });

  /* ---- 2-Y4-09 語彤事件 16「分一點時間」（AA_11）：12/21（四）17:15～18:45 總圖三樓；沒到延到 12/28（美國路線只有 12/28）---- */
  const FN=G=>has(YT,'FIELD_NOTES_IDEA');
  EV.push({ id:'ev_yt_share_time', title:'分一點時間', participants:[YT], location:'library', trigger:'auto', once:true, time:[17.25,18.75], background:'blur',
    prereq:{custom:G=>{ const a=D('2028-12-21'), b=D('2028-12-28'); return knows(YT,G)&&!G.flags.YT16&&(G.day===a||G.day===b); }},
    dialogue:[ IF(FN,nar('（她把一本寫滿的筆記本推過來。）')),UN(FN,nar('（她把一疊印出來的初稿推過來。）')),
      yt('我可以給你看一個東西嗎。'),
      yt('這本不是作業，也不是幫阿姨寫的。是我自己想寫的。'),
      {if:{memory:[{npc:YT,tag:'GIFT_NOTEBOOK_YT'}]},speaker:YT,text:'這本是聖誕節抽到的。……寫滿了。'},
      {choice:[{text:'（讀完）「我想看下一本。」',set:{YT_NOTES_NEXT:true},goto:'a'},{text:'（讀完）「這本以後要做什麼？」',goto:'b'}]},
      {label:'a'},yt('……下一本還沒寫。'),yt('寫了再說。'),{goto:'e'},
      {label:'b'},yt('畢業專題。老師說可以再寫長一點。'),
      {label:'e'},IF(G=>dating(G,YT),nar('（她把筆記收回去，換到你旁邊的位子坐。不是斜對面。）')),
      {set:{YT16:'seen'}} ] });

  /* ---- 2-Y4-12 主線 8「回來」：新店員記得點法（AA_185 1-2、BB_99 3-2）：日本路線 9/4 起、美國路線 12/24 起第一次走進兩點半 Café ---- */
  const REG=G=>(+G.flags.CAFE_VISITS||0)>=3, Z11=G=>done(G,'ev_zhiruo_no_sugar');
  /* AA_378 #4（企劃線 5cd35678）：日本路線 8/5 就回國，8/6～9/2 芷若還在 Café（Z11 到 8/26 都演得到）——那段時間進過 Café 的，9/4 不再當成「剛回來」：
     新店員的點法照現在的條件、「……芷若姊走以前交代的。她說你的第一杯一定要點對。」、旁白「（她已經去英國了。店裡其他的都還在。）」。8 月沒進過的照現在。進過＝G.habits 的 place:cafe:<時段> 在那幾天有記 */
  const AUG=G=>{ if(!(typeof STORY!=='undefined'&&STORY.route&&STORY.route(G)==='JP')) return false; const a=D('2028-08-06'), b=D('2028-09-02'), H=G.habits||{};
    for(const k in H){ if(!/^place:cafe:/.test(k)||/:with:/.test(k)) continue; if(((H[k]&&H[k].days)||[]).some(d=>d>=a&&d<=b)) return true; } return false; };
  EV.push({ id:'ev_back_home_cafe', title:'回來', participants:[], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>{ const r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null, d=r==='JP'?D('2028-09-04'):r==='US'?D('2028-12-24'):null; return d!=null&&G.day>=d&&!G.flags.BACK_HOME; }},
    dialogue:[ IF(G=>(AUG(G)||REG(G))&&Z11(G),{speaker:'新店員',text:'熱拿鐵，不加糖？'}),IF(G=>(AUG(G)||REG(G))&&!Z11(G),{speaker:'新店員',text:'熱拿鐵，少糖？'}),   /* 看過 Z11 換「不加糖」（裁定第 17 點）*/
      IF(AUG,{speaker:'新店員',text:'……芷若姊走以前交代的。她說你的第一杯一定要點對。'}),
      IF(G=>!AUG(G)&&REG(G),{speaker:'新店員',text:'……芷若姊交代的。她說你回來那天，第一杯一定要點對。'}),
      IF(G=>!AUG(G)&&!REG(G),{speaker:'新店員',text:'你是……法律系的那位？'}),IF(G=>!AUG(G)&&!REG(G),{speaker:'新店員',text:'芷若姊說，你回來的話要跟你說一聲：歡迎回來。'}),
      IF(AUG,nar('（她已經去英國了。店裡其他的都還在。）')),UN(AUG,nar('（半年。大家都還在。）')),
      {stamp:['BACK_HOME']} ] });

  /* ===================== 可昕（大四上、寒假；和可昕交往中。邀約、出遊、沒去在 r2y4a3d.js）===================== */
  const KXD=G=>dating(G,KX), hh=G=>((G.hour%24)+24)%24;
  const E10=v=>G=>G.flags.E10_STUDY===v;   /* 經濟系那一年 E10 總圖（先念書＝'study'、漫畫字典＝'chat'；沒玩經濟系的沒有）*/
  const K21_ECHO=[ IF(E10('chat'),kx('大一那次在總圖，我們都沒讀。')),IF(E10('study'),kx('大一那次在總圖，你有讀。我還在你筆記上畫了長頸鹿。')) ];
  const K21_PICK=third=>[ {choice:[{text:'「現在可以聊天了？」',goto:'k1'},{text:'「下週同一天？」',goto:'k2'},{text:third,goto:'k3'}]},
    {label:'k1'},kx('可以。……先去吃東西，我餓了。'),{goto:'ke'},
    {label:'k2'},kx('好。寫進表格。'),{goto:'ke'},
    {label:'k3'},kx('……你整頁都畫了。那等於沒畫。'),
    {label:'ke'},{set:{KX_STUDY_PLAN:'went'}} ];
  const TO16={advance:G=>Math.max(0,16-hh(G))};   /* 讀到 16:00（9/23 14:00～16:00）*/
  /* ---- 2-Y4-13 K21「約讀書，而且真的有讀」（BB_99 9-2、9-0b；裁定第 18 點）：9/23（六）14:00 政大（出遊）／總圖（3D：goto 到閱覽室，這裡的 auto 演）；美國路線＝視訊（當地 09:00）---- */
  EV.push({ id:'ev_kexin_study_really', title:'約讀書，而且真的有讀', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:2/3,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.k21Missed(G,q); },
    dialogue:[ {scene:'政大・宿舍樓下',bg:'nccu_dorm'},nar('（兩個小時，沒有人說話。她只推過來一張便條：「先讀完。」）'),TO16 ].concat(K21_ECHO,K21_PICK('（給她看自己畫滿重點的那一頁）')) });
  EV.push({ id:'ev_kexin_study_really_lib', title:'約讀書，而且真的有讀', participants:[KX], location:['library','library_hall'], trigger:'auto', once:true, time:[13.75,15], background:'blur',
    prereq:{custom:G=>{ const d=D('2028-09-23'); return d!=null&&G.day===d&&KXD(G)&&G.flags.KX_K21_AT==='lib'&&!G.flags.KX_STUDY_PLAN; }},
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.k21Missed(G,q); },
    dialogue:[ nar('（兩個小時，沒有人說話。她只推過來一張便條：「先讀完。」）'),TO16 ].concat(K21_ECHO,K21_PICK('（給她看自己畫滿重點的那一頁）')) });
  EV.push({ id:'ev_kexin_study_really_us', title:'約讀書，而且真的有讀', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.k21Missed(G,q); },
    dialogue:[ {scene:'視訊',bg:'video'},nar('（兩個小時，視訊開著，兩邊都沒有人說話。）'),kx('（把便條舉到鏡頭前）先讀完。'),{advance:2} ].concat(K21_ECHO,K21_PICK('（把自己畫滿重點的那一頁舉到鏡頭前）')) });   /* AA_345 F3 定稿 */

  /* ---- 2-Y4-14 K22「兩個方向的讀書會」（BB_99 9-6）：11/14（二）19:00 政大；美國路線、沒去＝r2y4a3d.js 一則 ---- */
  const SJ_MET=G=>has(KX,'ENC_D13_KX')||has(KX,'ENC_D09_KX')||!!G.flags.KX_NCCU_FRIENDS;   /* 見過邵鈞（淡水 D13、貓空 D09 的偶遇；大二的電影夜，y2r2_3d.js 同一條）*/
  EV.push({ id:'ev_kexin_two_directions', title:'兩個方向的讀書會', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:2/3,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.k22Missed(G); },
    dialogue:[ {scene:'政大・宿舍樓下',bg:'nccu_dorm'},
      UN(SJ_MET,kx('這是邵鈞，考古題有目錄的那個。')),
      nar('（邵鈞說他從大一就知道自己要當法官。）'),
      {advance:G=>Math.max(0,21-hh(G))},   /* 讀完以後（讀書會 19:00～21:00）*/
      kx('他想當那個判的人。'),
      kx('我比較想當那個幫人講話的人。'),
      {choice:[{text:'「妳會很適合。」',goto:'a'},{text:'「兩種都需要。」',goto:'b'},{text:'（點頭，不說話）',goto:'c'}]},
      {label:'a'},kx('你每次都這樣說。……好啦，謝謝。'),{goto:'e'},
      {label:'b'},kx('對。所以邵鈞和我是好朋友。'),{goto:'e'},
      {label:'c'},nar('（她把筆記收進包包。）'),kx('……走吧，山下那家還開著。'),
      {label:'e'},{set:{KX_DIRECTION:true}} ] });

  /* ---- 2-Y4-24 可昕「聖誕，讀到打烊」（BB_99 9-9；裁定第 21 點）：12/25（一）19:00 政大山下的咖啡店（沒有底圖＝深色底＋字幕）→ 自強十舍樓下 ---- */
  const usR=G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='US';
  const PLAN=G=>!!G.flags.KX_STUDY_PLAN;
  const merge=(G,k,v)=>{ G.flags[k]=Object.assign({},(G.flags[k]&&typeof G.flags[k]==='object')?G.flags[k]:{},v); };
  EV.push({ id:'ev_kexin_xmas_y4', title:'聖誕，讀到打烊', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:2/3,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.kxXmasMissed(G); },
    dialogue:[ {scene:'政大山下・咖啡店',bg:'dark'},
      IF(usR,kx('你的時差還沒調回來吧。……那今天讀到打烊，剛好。')),   /* 美國路線（12/23 已經回來）*/
      {advance:G=>Math.max(0,22-hh(G))},
      nar('（兩個人讀到店員開始收椅子。走出來，山上的風。）'),
      {scene:'政大・宿舍樓下',bg:'nccu_dorm'},
      kx('……冷死了。'),
      kx('聖誕快樂。今天讀了幾頁，不要說。今天不算。'),
      {choice:[{text:'「聖誕快樂。」',goto:'a'},{text:'（把圍巾給她）',goto:'b'}]},
      {label:'a'},kx('嗯。……明天我回高雄。'),{goto:'e'},
      {label:'b'},kx('……你的圍巾很醜。'),nar('（她還是圍上了。）'),
      {label:'e'},
      IF(PLAN,nar('（共用的讀書計畫表，12/25 那一格多了一行：「聖誕快樂」。旁邊畫了一隻長頸鹿。）')),   /* 她的禮物（AA_345 F3 定稿）*/
      UN(PLAN,nar('（她給你一張卡片。上面畫了一隻長頸鹿。）')) ],
    after:G=>{ merge(G,'KX_XMAS',{4:'study'}); } });

  /* ---- 2-Y4-26 KH「最後一個寒假的旅行」（BB_99 9-12、10-3；AA_276；裁定第 22 點）：1/6（六）高鐵 07:00 → 08:35 左營，她開車去高雄的海邊；傍晚左營站 ---- */
  const TRIPPED=G=>{ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; return Object.keys(T).some(k=>k!=='Y4WIN'&&T[k]&&T[k]!=='missed')||!!G.flags.KX_TRIP_Y1S2; };   /* 一起旅行過（KX_TRIP 有一個假期不是 missed）*/
  EV.push({ id:'ev_kexin_trip_winter_y4', title:'最後一個寒假的旅行', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:1.6, kxAway:true,
    beforeOuting:(G,GM)=>{ const C=typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES.kexin:null, fare=(C&&C.fare)||2980; if(GM&&GM.money) GM.money(-fare,'交通'); },   /* 高鐵來回照 AA_276 扣（同大二 2-Y2-10）*/
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.khMissed(G); },
    dialogue:[ {scene:'高雄・左營站',bg:'kh_station'},
      nar('（她靠在一台舊舊的家用車旁邊。）'),
      kx('上車。……音樂你管。'),
      {scene:'車上',bg:'car_morning'},
      IF(TRIPPED,kx('第一次去的時候，我管音樂，你管方向。')),IF(TRIPPED,kx('今年交換。')),
      UN(TRIPPED,kx('我們沒有「第一次去的地方」。……那今天就是。')),
      {scene:'高雄・海邊',bg:'trip_sea'},
      kx('到了。今天你說要做什麼，就做什麼。'),
      {choice:[{text:'「走到那個堤防的盡頭。」',goto:'a'},{text:'「找一家沒吃過的。」',goto:'b'},{text:'「坐著就好。」',goto:'c'}]},
      {label:'a'},kx('好。走慢一點，我鞋子穿錯了。'),{goto:'e'},
      {label:'b'},kx('這附近我都吃過。……好，那找一家我也沒吃過的。'),{goto:'e'},
      {label:'c'},kx('……你很無聊。'),nar('（她還是坐下來了。一個小時，兩個人都沒說話。）'),
      {label:'e'},
      {advance:G=>Math.max(0,17-hh(G))},   /* 傍晚 */
      {scene:'高雄・左營站',bg:'dark'},
      kx('回去讀書。……二月十四號，視訊。') ],
    after:G=>{ merge(G,'KX_TRIP',{Y4WIN:'kaohsiung'}); const F=G.flags; (F.HV_LAST||(F.HV_LAST={})).kexin=G.day; } });

  /* ---- 2-Y4-28 除夕（裁定第 23 點）：選「打給妳。」＝電話三句（OUT call:true）---- */
  EV.push({ id:'ev_kexin_lunar_eve_y4_call', title:'除夕的電話', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,
    dialogue:[ {scene:'電話'},
      nar('（鞭炮聲。）'),   /* AA_327「三句：鞭炮聲、……」；AA_345 F3：「（鞭炮聲。）」可以 */
      kx('新年快樂。'),
      kx('……我阿嬤在叫我。你也去陪你媽。') ] });

  /* ---- 2-Y4-29 情人節，讀書計畫表（BB_99 9-14）：2/14（三）21:00 視訊。天氣和上一次她問的回答（KX_VDAY_WX）一樣＝那一句照差幾年換（AA_345 F5）：
     大三的情人節（r2y3a，2-Y3-24）沒有問天氣＝比上一次有問的那一年：大二（大部分玩家）「跟前年一樣。」、大一「跟大一那年一樣。」（有 [3] 的照 BB_99 原句「跟去年一樣。」）---- */
  const VPY=G=>{ const W=G.flags.KX_VDAY_WX||{}; for(const y of [3,2,1]) if(W[y]!=null) return y; return null; };   /* 上一次有問天氣的那一年 */
  const VPREV=G=>{ const y=VPY(G), W=G.flags.KX_VDAY_WX||{}, V=G.flags.KX_VDAY||{}; return y==null||V[y]==='missed'?null:W[y]; };
  const VSAME=G=>!!G.flags._y4Vwx&&VPREV(G)===G.flags._y4Vwx, VSY=y=>G=>VSAME(G)&&VPY(G)===y;
  EV.push({ id:'ev_kexin_valentine_y4', title:'情人節，讀書計畫表', participants:[KX], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.vdayMissed(G,q); },
    dialogue:[ {scene:'視訊',bg:'video'},
      kx('你那邊天氣怎樣？'),
      {choice:[{text:'「冷。」',set:{_y4Vwx:'cold'}},{text:'「下雨。」',set:{_y4Vwx:'rain'}},{text:'「還好。」',set:{_y4Vwx:'ok'}}]},
      IF(VSY(3),kx('跟去年一樣。')),IF(VSY(2),kx('跟前年一樣。')),IF(VSY(1),kx('跟大一那年一樣。')),UN(VSAME,kx('……高雄今天二十五度。')),
      IF(PLAN,kx('情人節禮物。我們那張表，我重排了。')),UN(PLAN,kx('情人節禮物。讀書計畫表。')),
      kx('兩個人的格子排在一起。考完以前，都照這張。'),
      nar('（畫面：每天晚上十點那一格，兩欄都寫著「通話」。）') ],
    after:G=>{ const F=G.flags; merge(G,'KX_VDAY',{4:'video'}); if(F._y4Vwx){ merge(G,'KX_VDAY_WX',{4:F._y4Vwx}); delete F._y4Vwx; } } });

  /* ---- 2-Y4-23 學姊 M7 接機（BB_99 2-1、10-1 第 1 項；AA 審稿 #1：大四下唯一一次說出口的條列，照 BB_99 原句）：12/23（六）20:30 桃園機場入境大廳（出遊）。
     版本 SIS_PICKUP_V（r2y4a3d.js 12/20 排）：'family' 家族共乘（Kevin、學妹同車）、'two' 兩個人、'lover' 戀人版。
     入境大廳的旁白（AA_345 F2 新寫）：兩個人版一句、戀人版兩句；BCG-34 只給兩個人、戀人版，冬天版通過（REDRAW 那一列 redrawn:true）才放，旁白照留、CG 加在第一句之後 ---- */
  const PV=v=>G=>G.flags.SIS_PICKUP_V===v, PV2=G=>['two','lover'].includes(G.flags.SIS_PICKUP_V);
  EV.push({ id:'ev_sis_pickup', title:'接機', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    outingMissed:(G,GM,q)=>{ if(typeof R2Y4A!=='undefined') R2Y4A.pickupMissed(G); },
    dialogue:[ {scene:'桃園機場・入境大廳',bg:'airport_arrival'},
      IF(PV('two'),nar('（她推著行李推車走出來。看到你，停了一下。）')),
      IF(G=>PV('lover')(G)&&!!G.flags.SIS14_RIGHT,Object.assign(nar('（你站在出口的右邊。）'),{aa516:true})),   /* AA_516 第 8 節第 2 點（企劃線 3cd10909b）：12/17 最後一通視訊 h9 選「我會去接妳。」（她「出口那邊，你站右邊。我出來先看右邊。」，SIS14_RIGHT）＝戀人版第一句旁白前面多一句，接「她一出來就看到你。」（CG 通過沒通過都一樣）*/
      IF(G=>PV('lover')(G)&&!cgOK('cg_airport_pickup_heroine05'),nar('（她一出來就看到你。推車停在原地，她走過來，抱住你。）')),   /* 冬天版還沒通過：照一句、不放 CG（AA_350 N4）*/
      IF(G=>PV('lover')(G)&&cgOK('cg_airport_pickup_heroine05'),nar('（她一出來就看到你。推車停在原地。）')),   /* 冬天版通過：第一句拆成兩句，CG 夾在中間（AA_350 N4）*/
      {if:{custom:G=>PV2(G)&&cgOK('cg_airport_pickup_heroine05')},cg:'cg_airport_pickup_heroine05'},   /* BCG-34（冬天版）：她走出來、看到你的那一拍 */
      IF(G=>PV('lover')(G)&&cgOK('cg_airport_pickup_heroine05'),nar('（她走過來，抱住你。）')),
      IF(PV('lover'),nar('（很久，她才放開。）')),
      /* AA_512 6-1（企劃線 c444f0757）：日本路線視訊的三句在戀人版兌現（ev_sis_jp_video 選的時候記 SIS_JP_COAT、SIS_JP_FIRST；兩個人版、家族共乘、那一通沒接的都不加）。
         (a) 外套：J3「咬了一口外套。」＋交往版的便條（SIS_JP_NOTE_GF）；aa512：tests/aa512_sis_b13_unit.js 對稿 */
      IF(G=>PV('lover')(G)&&!!G.flags.SIS_JP_COAT,Object.assign(nar('（你穿的是三月她塞進你背包的那件外套。）'),{aa512:true})),
      IF(G=>PV('lover')(G)&&!!G.flags.SIS_JP_COAT,Object.assign(nar('（她退開一步，拉起你的袖口，翻過來看。）'),{aa512:true})),
      IF(G=>PV('lover')(G)&&!!G.flags.SIS_JP_COAT,Object.assign(sis('……鹿咬的是這裡。'),{aa512:true})),
      IF(G=>PV('lover')(G)&&!!G.flags.SIS_JP_COAT,Object.assign(nar('（袖口內側，一排很淡的齒痕。你自己都忘了是哪一邊。）'),{aa512:true})),
      {scene:'車上',bg:'car_night'},
      {if:{custom:G=>!!G.flags.REPLIED_US0||has(S5,'REPLIED_US0')},speaker:S5,text:'我剛到美國那天，你回得很快。……謝謝。'},
      {unless:{custom:G=>!!G.flags.SIS_MAPLE&&G.flags.SIS_MAPLE_MSG==='got'},goto:'mp_e'},   /* AA_395 2-2：有書籤、傳過「書籤收到了。」的才有下面這一段 */
      sis('書籤，你有用嗎。'),{choice:[{text:'「有。」',goto:'mp_e'},{text:'「捨不得用。」',goto:'mp_b'}]},
      {label:'mp_b'},sis('……用啊。不然寄它幹嘛。'),{label:'mp_e'},
      IF(G=>has(S5,'DROVE_HER'),sis('這次我一直講。你可以轉頭。')),UN(G=>has(S5,'DROVE_HER'),sis('我一直講。你可以轉頭。')),
      sis('……不行，看前面。'),
      sis('美國的雞蛋，很難吃。圖書館的咖啡機，很難喝。'),
      sis('我想吃滷肉飯。現在。'),
      IF(G=>PV('lover')(G)&&G.flags.SIS_JP_FIRST==='secret',Object.assign(sis('……七月說要保密的，就是這個。'),{aa512:true})),   /* AA_512 6-1 (b)：J4「妳決定。」（先保密）*/
      IF(PV('family'),{speaker:'Kevin',text:'學姊妳今天話好多！'}),   /* Kevin 在後座 */
      IF(PV('lover'),sis('……還有，我想你。')),   /* AA_398 第 35 列 */
      {choice:[{text:'「下交流道找一家。」',goto:'a'},{text:'「先回家睡覺。」',goto:'b'},{text:'「公館那家？」',unless:{custom:G=>PV('lover')(G)&&G.flags.SIS_JP_FIRST==='noodle'},goto:'c'},
        {text:'「麵店？說好的。」',if:{custom:G=>PV('lover')(G)&&G.flags.SIS_JP_FIRST==='noodle'},goto:'nd',aa512:true}]},   /* AA_512 6-1 (c)：J4「麵店。」（第一天就去）＝第三個選項換成這一個；其他兩個照舊 */
      {label:'a'},nar('（交流道下面的小店，十點還開著。她吃得很快，一句話都沒說。）'),{goto:'e'},
      {label:'b'},sis('……好。明天。明天一定。'),{set:{SIS_PICKUP_TMR:true}},{goto:'e'},   /* 隔天她傳「滷肉飯。今天。不要再說明天。」（r2y4a3d.js；AA_398 第 36 列）*/
      {label:'c'},sis('對。就那家。'),nar('（你們開回公館。店快打烊了，老闆多給了一碗湯。）'),{goto:'e'},
      {label:'nd'},Object.assign(sis('……對。第一天。'),{aa512:true}),Object.assign(nar('（你們開回公館。麵店的鐵門拉下一半，阿姨看到你，又把門拉上去。）'),{aa512:true}),
      Object.assign(nar('（阿姨端了兩碗麵，又多放一碗滷肉飯在她面前。她先吃滷肉飯。）'),{aa512:true}),
      {label:'e'},{mem:[{npc:S5,tag:'PICKED_HER_UP',note:''}]} ],
    after:G=>{ G.flags.SIS_PICKUP=G.flags.SIS_PICKUP_V||'family'; } });

  /* ---- 2-Y4-27 研究所筆試（AA_181 2-4；AA_185 0-3：沒有題目，看準備）：2/3（六）09:00 教學館（3D 校園的共同教學館門口；08:50 還沒到＝帶到場，r2y4a3d.js）---- */
  const AN='heroine_01', an=t=>({speaker:AN,text:t});
  const AN_FAM=G=>knows(AN,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(AN))>=SOCIAL.STAGES.indexOf('FAMILIAR');
  EV.push({ id:'ev_grad_exam', title:'研究所筆試', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ IF(AN_FAM,nar('（教學館門口，以安在看考場的配置圖。）')),
      IF(AN_FAM,an('你在三樓。我在二樓。')),IF(AN_FAM,an('……考完，門口。')),
      {scene:'考場',bg:'dark'},
      nar('（兩節。第二節最後一題，你寫到鐘響。）'),
      {set:{GRAD_EXAM_2029:true}} ] });
  EV.push({ id:'ev_grad_exam_after', title:'研究所筆試', participants:[AN], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ an('考完了。……先吃麵。') ] });   /* 12:30 門口（和以安 FAMILIAR 以上）*/

  /* ---- 2-Y4-11 芷若第二輪明信片（BB_99 3-1、10-2；AA_262 附錄 B ZR1～ZR6）：每月一張，中午以後在宿舍（美國路線九～十二月在公寓 214）。r2y4a3d.js 放、讀、回寄 ---- */
  EV.PC2={
    first:{seen:'（明信片又開始寄來了。這次的字比較小，寫得比較多。）',none:'（信箱裡有一張明信片。英國的郵戳。）'},   /* 第一張的開頭旁白：大三收過第一輪（POSTCARDS）／沒收過 */
    cards:[ {key:'2028-09-22',m:9,text:['到英國了。宿舍窗戶看出去，是一棵很大的樹。','我還不知道它叫什麼。'],gf:'熱可可在這裡叫 hot chocolate。加濃縮，他們看我的表情很奇怪。'},
      {key:'2028-10-20',m:10,text:['這次我知道要帶雨衣了。','班上有一個人跟我一樣，看電影會坐倒數第三排。','我們沒有講話，但每週都坐同一排。']},
      {key:'2028-11-17',m:11,text:['又到四點就天黑的時候了。去年很不習慣，今年還好。','我開始在下午看電影。出來的時候，像看了兩場。']},
      {key:'2028-12-15',m:12,text:['我在寫一篇關於『一個人看電影』的報告。','教授說題目很小。我說，小的我才寫得完。'],us:'你也在國外。我們今天都不在家。',back:['（背面最後一行）','麵店生日快樂。']},
      {key:'2029-01-05',m:1,text:['寒假我沒有回去。宿舍剩我和一個管理員。','她請我喝茶。英國的茶要加牛奶，我加了。……還好。']},
      {key:'2029-02-19',m:2,text:['今天下雪。很小，落地就不見了。','我拍了照，可是照片裡什麼都沒有。']},
      {key:'2029-03-16',m:3,text:['我開始存錢了。','回去以後，我想開一間很小的戲院。四十個座位就好。']},
      {key:'2029-04-20',m:4,text:['論文開始寫了。題目還是很小。','每天寫五百字，寫完去公園坐一下。'],fy:'（四月那張的最後一行，是另一種筆跡：「這棵樹叫英國櫟。……他說的。」）'},   /* 方奕廷那條路（ZR_FY）：同一張上另一種筆跡（BB_99 沒寫哪一個月，AA 放四月；旁白一句照 AA_345 F3 定稿）*/
      {key:'2029-05-18',m:5,text:['這裡五月很亮，晚上九點天還沒黑。','我把窗簾拉起來看電影。']},
      {key:'2029-06-15',m:6,text:['快結束了。我開始打包。','最難打包的是電影票根。比衣服還多。'],until:'2029-06-28'} ],
    replies:[ {id:'rain',t:'台北也下雨了。我帶了傘。',next:'你說台北下雨。這裡也是。我們今天一樣。'},
      {id:'row',t:'那一排的同學，今天也坐那裡嗎？',next:'他今天沒來。那一排只剩我。……還好。'},
      {id:'light',t:'Café 下午的光，還是一樣。',next:'你說光還是一樣。……窗邊那個位子，現在誰坐？'},
      {id:'ticket',t:'妳的戲院，我要第一張票。',next:'好。第一張給你。……開幕那天要來。',fromCard:'2029-03-16'} ],   /* 第四個三月那張以後才有；和芷若分開過的不出 */
    usAsk:'給我你在那邊的地址。英國寄到美國要多久，我想試試看。' };   /* 美國路線：八月她傳訊息要地址（AA_370 M1：r2y4a3d.js 8/20 那則拿掉，只發 us_life_events.js 的 8/10 那則；字留著）*/

  return EV;
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y4A_EVENTS);
/* ---- 2-Y4-04「大四要怎麼過？」再問一次（AA_327；AA_317 1A-08 只寫了「會再問」）：events.js 的 ev_y4_path_again 換成這一版的台詞（觸發照 story3d.js S.y4Path2Due：10/16 21:00 起宿舍 409／美國公寓 214，當地時間）。
   第二次又選④＝Y4_PATH 'other'＋Y4_PATH_TWICE（照③走）；選完記 Y4_PATH_DAY（隔天 09:00 姊姊那一則在 r2y4a3d.js）---- */
(function(){ const e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x.id==='ev_y4_path_again'):null; if(!e) return;
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null, home=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const US=G=>route(G)==='US', ABR=G=>route(G)==='JP'||route(G)==='US', nar=t=>({speaker:null,text:t});
  e.dialogue=[ {if:{custom:home},scene:'臺北・你的房間',bg:'home_room_night'},
    {if:{custom:G=>US(G)&&!home(G)},speaker:null,text:'（檯燈旁邊的便利貼，從臺北帶到這裡。四個選項，一個都沒劃掉。）'},
    {if:{custom:G=>!US(G)&&!home(G)},speaker:null,text:'（便利貼還貼在檯燈旁邊。四個選項，一個都沒劃掉。）'},
    nar('（大四，要怎麼過？）'),
    {choice:[{text:'「準備國考。律師，可以的話司法官也考。」',set:{Y4_PATH:'bar'},goto:'p_bar'},{text:'「準備研究所。」',set:{Y4_PATH:'grad'},goto:'p_grad'},
      {text:'「先不考。去實習，或做別的事。」',set:{Y4_PATH:'other'},goto:'p_other'},{text:'「還沒決定。」',set:{Y4_PATH:'other',Y4_PATH_TWICE:true},goto:'p_und'}]},
    {label:'p_bar'},nar('（你在桌曆上，把每個禮拜二、四的晚上圈起來。）'),{goto:'p_end'},
    {label:'p_grad'},{unless:{custom:ABR},speaker:null,text:'（你打開系上的網頁。推甄的面試在十月底。）'},{if:{custom:ABR},speaker:null,text:'（你查了一下。交換回來要多念一學期，推甄趕不上。筆試在後年二月。）'},{goto:'p_end'},
    {label:'p_other'},nar('（你把國考的簡章收進抽屜最下面，沒有丟。）'),{goto:'p_end'},
    {label:'p_und'},nar('（你決定先不決定。）'),
    {label:'p_end'} ];
  e.consequences={stamp:['Y4_PATH_DAY']}; e.r2y4a=true; })();
