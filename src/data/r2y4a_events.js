/* ===== 事件包第 2 輪之三（前半）：大四上、美國交換、大四寒假（AA_327 2-Y4-01～29；AA-C 2026-10-20 定稿 e284d601，第②級，台詞照原文、不改字）=====
   這裡是台詞（用事件系統演的段落）；什麼時候演、手機、出遊、美國路線的整串流程在 src/r2y4a3d.js（R2Y4A）。2-Y4-30 作廢不做；2-Y4-31～61 是另一個事件包。
   美國路線（2-Y4-16～22，先做）：
     16 US1 抵達：ev_us1_arrive（巴士站，交往中／挽回中）→ ev_us1_market（草原超市）→ ev_us1_asian（竹葉亞洲超市）→ ev_us1_door（公寓 214 門口）→ ev_us1_mom（21:30 打給媽媽）
     17 US2：ev_us2_kitchen（交往中：坐到 C 棟 208 窗口的高腳椅＝開始）、ev_us2_repair（挽回中：19:00 前後還鍋子）
     18 芝加哥：ev_us_chicago（11/11）＋ev_us_chicago2（11/12 博物館、回程）　19 US3：ev_us3_lake　20 初雪：ev_us_first_snow（交往中）、ev_us_snow_repair（挽回中）
     21 會所晚餐：ev_us_club_dinner　22 離開：ev_us_leave → 交往中 ev_sf1、ev_sf_photo17、ev_sf2、ev_sf_photo19、ev_sf3、ev_sf_photo21／挽回中 ev_us_bloom16、18、20、ev_us_bus21 → ev_us_return（桃園）→ ev_us_home
   「交往中」＝當天 dating_heroine_05；「挽回中」＝分開了、還沒重新開始（AA_327 美國路線的共通）。何俊朗 1～5 是第 3 輪（還沒有）：MET_LONG 沒有＝他的句子照 AA 寫的「沒有 MET_LONG」那一版。
   CG：CG_REGISTRY 有才放（hasCG）；BCG-14、BCG-32、BCG-23 要重畫（BB_183 1-4、1-5、1-7：舊圖是冬天、二月的窗外、結冰的湖），AA_327 寫「重畫以前不放」——
     重畫的圖登錄時在 CG_REGISTRY 那一列加 redrawn:true（或從下面的 REDRAW 拿掉）才放。測試：node tests/r2y4a_events_unit.js */
'use strict';
const R2Y4A_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const REDRAW=['cg_bus_station_heroine05','cg_us_kitchen_heroine05','cg_frozen_lake_heroine05'];
  const cgOK=id=>hasCG(id)&&(!REDRAW.includes(id)||CG_REGISTRY[id].redrawn===true);
  const CG=id=>({if:{custom:()=>cgOK(id)},cg:id});
  const S5='heroine_05';
  const LONG=G=>!!(G.flags&&G.flags.MET_LONG);   /* 何俊朗 1 演過（AA_80；第 3 輪）*/
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
      sis('……這個不算浪費。這是鄉愁。') ] });
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
      {label:'a'},sis('對。'),nar('（她把麵分到兩個碗。）'),sis('我要寫法服那兩年遇到的人。週六早上，那些拿著存證信函來問的阿伯阿姨。'),nar('（她拿出手機記下來。）'),sis('第一段有了。'),{goto:'end'},
      {label:'b'},sis('……好。'),nar('（你們隔著窗口吃完泡麵。）'),sis('評價？'),me('很鹹。'),sis('我也覺得。這是我在美國學會的第一道菜。'),{goto:'end'},
      {label:'c'},sis('……休息完再改。先吃麵。'),
      {label:'end'},{set:{US2:'there'}} ] });
  /* 挽回中（AA_253 §6 第 2 步原句）：她沒有約他；19:00 前後他去 C 棟還向她室友借的鍋子（r2y4a3d.js：人在社區就帶到 C 棟）。選「還沒。」＝REPAIR +1（after）*/
  EV.push({ id:'ev_us2_repair', title:'退回的報告', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ nar('（C 棟，學姊合租那一戶。廚房朝客廳的窗口開著，她站在爐子前面，水還沒滾。你把鍋子放在窗口的吧台上。）'),
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
    dialogue:[ {scene:'芝加哥',bg:'chicago_lake'},
      nar('（她排了一張行程表，每一格都有時間。第一個景點就遲到二十分鐘：巴士誤點。）'),
      nar('（她看著行程表，然後把它摺起來，放進口袋。）'),
      CG('cg_chicago_heroine05'),   /* BCG-17（何俊朗只畫背影）*/
      sis('……今天不照表。'),
      IF(LONG,{speaker:'何俊朗',text:'還好。'}),UN(LONG,{speaker:'香港來的同學',text:'還好。'}),   /* 「何俊朗說了好幾次『還好』以後」：AA 只寫了這個說明，句子用他說的「還好」（要問 AA）*/
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
      {mem:[{npc:S5,tag:'CHICAGO_TRIP',note:'芝加哥的週末'}]} ] });

  /* ---- 2-Y4-19 US3 感恩節的湖邊（溫書瑀_角色企劃 US3；AA_253 §6 第 3 步）：11/23 09:00 會所門口 → 湖邊（出遊）---- */
  EV.push({ id:'ev_us3_lake', title:'感恩節的湖邊', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'湖邊',bg:'us_lake'},
      {unless:{custom:G=>dating(G,S5)},goto:'r'},
      {if:{memory:[{npc:S5,tag:'CHICAGO_TRIP'}]},speaker:S5,text:'上次在芝加哥，我把行程表摺起來了。這次乾脆不寫。'},
      sis('放假要做的事，我列了。'),
      nar('（她把手機給你看。上面寫著：一，睡到自然醒。二，不看信。三，）'),
      sis('第三件想不到。空白。'),
      me('兩件事。一，穿暖。二，不要帶筆電。'),
      sis('（愣住，然後笑出來）……那是我的句型。'),
      sis('好。第三件就寫：看雪。'),
      CG('cg_frozen_lake_heroine05'),   /* BCG-23（要改圖：湖水沒結冰、岸邊有薄雪，BB_183 1-7）*/
      sis('（打字，停了一下，又加兩個字）跟你。'),
      {set:{US3:'two'}},{end:true},
      {label:'r'},
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
    dialogue:[ {scene:'小教堂前的台階',bg:'us_chapel_steps'},
      {if:{flags:['US_SNOW_LATE']},speaker:null,text:'（你還是去了。雪下得很小，她坐在台階最上面一階。）'},   /* 20:30 以後、21:30 還沒到＝帶到場 */
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
    dialogue:[ {scene:'小教堂前的台階',bg:'us_chapel_steps'},
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
    dialogue:[ {unless:{custom:LONG},goto:'n'},
      nar('（天還沒亮。何俊朗拖著兩個行李箱，背包上的奶茶杯鑰匙圈在晃。）'),
      {speaker:'何俊朗',text:'我的飛機比你早。……香港見？'},
      {choice:[{text:'「香港見。」',goto:'a'},{text:'「還好。」',goto:'b'}]},
      {label:'a'},{speaker:'何俊朗',text:'我帶你去吃。說好了。'},{goto:'e'},
      {label:'b'},{speaker:'何俊朗',text:'……你又來了。'},nar('（他笑了一下，上了車。）'),{goto:'e'},
      {label:'n'},nar('（天還沒亮。社區門口停著機場巴士。）'),
      {label:'e'},{set:{US_LEFT:true}} ] });
  EV.push({ id:'ev_sf1', title:'舊金山', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'舊金山',bg:'trip_hotel_twin'},
      nar('（她坐在靠窗的那張床上，打開計畫本。新的一頁，最上面寫「舊金山」，下面是空的。）'),
      sis('以前出門，我會先寫三件事。'),
      sis('……這一頁我不寫。'),
      sis('這一週，你排。'),
      {choice:[{text:'「第一天：睡到自然醒。」',goto:'a'},{text:'「我們一天排一件就好。」',goto:'b'},{text:'「妳也排一件。」',goto:'c'}]},
      {label:'a'},sis('……這可以算一件事嗎。'),sis('好。算。'),nar('（她在那一頁寫下：「一，睡到自然醒。」然後把筆蓋起來。）'),{goto:'e'},
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
      nar('（媽媽先看到你，再看到你旁邊的人。）'),
      sis('伯母好。……我是書瑀。'),
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
      {label:'n'},nar('（你們同一班飛機回來。她坐在前面幾排，下飛機的時候，你看見她先走了。）') ] });
  EV.push({ id:'ev_us_home', title:'臺北的家', participants:[], location:'any', trigger:'manual', once:true, background:'dark',   /* 上午（AA_144 X2；兩種玩家都有）*/
    dialogue:[ {scene:'臺北・家裡',bg:'home_living_day'},
      {speaker:'媽媽',text:'你回來了。'},
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
      IF(KX_TEAM,{speaker:'zhe',text:'可昕，冷笑話，最後一回合。'}),IF(KX_TEAM,{speaker:'kexin',text:'……今年我認輸。我只想吃。'}),IF(KX_TEAM,{speaker:'zhe',text:'可昕認輸了！大家記下來！'}),
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
      {choice:[{text:'（拍一張白板的照片）',mem:[{npc:'heroine_01',tag:'PLG_LAST_RULE',note:'白板上只剩「說理由。」'}],goto:'e'},{text:'（什麼都不說，鼓掌）',goto:'b'}]},
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
      nar('（阿姨把剩下的小菜全部端過來。）'),
      {speaker:'阿姨',text:'考完了，吃好一點。'},
      {set:{XMAS_Y4:'went'}} ] });

  /* ---- 2-Y4-05 語彤 15b〈公館的時間〉（AA_11）：系刊 10/16 出刊；10/17、10/24（二）17:30～20:30 她在麵店的班（FAMILIAR 以上）；沒見到＝總圖三樓期刊架（r2y4a3d.js）---- */
  const YT='heroine_03', yt=t=>({speaker:YT,text:t});
  const YT_DAYS=['2028-10-17','2028-10-24'];
  EV.push({ id:'ev_yt_essay', title:'公館的時間', participants:[YT], location:'noodle', trigger:'auto', once:true, time:[17.5,20.5], background:'blur',
    prereq:{stage:{npc:YT,min:'FAMILIAR'},custom:G=>YT_DAYS.some(k=>D(k)===G.day)&&!G.flags.YT_ESSAY&&notUS(G)},
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
      {scene:'萬才館二樓',bg:'dark'},
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

  /* ---- 2-Y4-15 可昕：放榜那一週，她的實習（BB_99 9-5）：她打來的電話（演出來）；KX_INTERN_CALL＝'pass'／'fail'（r2y4a3d.js 排）---- */
  const KX='kexin', kx=t=>({speaker:KX,text:t});
  EV.push({ id:'ev_kexin_intern_result', title:'放榜那一天', participants:[KX], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'電話'},
      {if:{flagIs:{KX_INTERN_CALL:'fail'}},goto:'f'},
      kx('結果出來了吧。你先說。'),
      nar('（你說上了。）'),
      kx('我事務所的實習也上了。那今天宵夜誰請？'),
      {choice:[{text:'「我請。」',goto:'a'},{text:'「各付各的。」',goto:'b'}]},
      {label:'a'},kx('好。山下那家。'),{goto:'e'},
      {label:'b'},kx('……好啦。'),{goto:'e'},
      {label:'f'},kx('你的，先說你的。'),
      nar('（你說沒上。）'),
      kx('……好。二月還有一次。'),   /* 她不提自己的：隔天 21:00 才傳 */
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
  EV.push({ id:'ev_back_home_cafe', title:'回來', participants:[], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>{ const r=typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null, d=r==='JP'?D('2028-09-04'):r==='US'?D('2028-12-24'):null; return d!=null&&G.day>=d&&!G.flags.BACK_HOME; }},
    dialogue:[ IF(G=>REG(G)&&Z11(G),{speaker:'新店員',text:'熱拿鐵，不加糖？'}),IF(G=>REG(G)&&!Z11(G),{speaker:'新店員',text:'熱拿鐵，少糖？'}),   /* 看過 Z11 換「不加糖」（裁定第 17 點）*/
      IF(REG,{speaker:'新店員',text:'……芷若姊交代的。她說你回來那天，第一杯一定要點對。'}),
      UN(REG,{speaker:'新店員',text:'你是……法律系的那位？'}),UN(REG,{speaker:'新店員',text:'芷若姊說，你回來的話要跟你說一聲：歡迎回來。'}),
      nar('（半年。大家都還在。）'),
      {stamp:['BACK_HOME']} ] });

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
    {label:'p_other'},nar('（你把國考的簡章收進抽屜最下面。不是丟掉，是收起來。）'),{goto:'p_end'},
    {label:'p_und'},nar('（你決定先不決定。）'),
    {label:'p_end'} ];
  e.consequences={stamp:['Y4_PATH_DAY']}; e.r2y4a=true; })();
