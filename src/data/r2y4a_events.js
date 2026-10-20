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
  const US=[];

  /* ---- 2-Y4-16 US1 抵達（AA_261 5-2、BB_98 2-7；AA_291 第 2 節的時刻）：19:00 布魯明頓長途巴士站。US1＝'together'／'alone'（r2y4a3d.js 抵達那一刻照交往狀態記）---- */
  US.push({ id:'ev_us1_arrive', title:'抵達', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
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
  US.push({ id:'ev_us1_market', title:'草原超市', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ sis('這裡的雞蛋要自己看日期。我出發前查過了。'),
      nar('（結完帳，她指了指馬路對面。一間小小的店，招牌上有中文。）'),
      sis('對面那間也去一下。') ] });
  US.push({ id:'ev_us1_asian', title:'竹葉亞洲超市', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ nar('（亞洲超市。她在泡麵那一排停了很久，拿了一包台灣的泡麵，貴三倍。）'),
      sis('……這個不算浪費。這是鄉愁。') ] });
  US.push({ id:'ev_us1_door', title:'公寓 214', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',   /* 二樓的戶外樓梯平台；她不進門；BB_98 2-7 原句拿掉編號（裁定第 6 點）*/
    dialogue:[ sis('你一個人一戶？……有客廳，還有自己的廚房。'),
      sis('我住 C 棟，三個人合租。廚房是共用的，冰箱上貼了一張輪值表。'),
      sis('冷氣不要開太強，會很乾。垃圾星期四收。'),
      sis('……有事打給我。同一個社區，走路五分鐘。') ] });
  US.push({ id:'ev_us1_mom', title:'打給媽媽', participants:[], location:'any', trigger:'manual', once:true, background:'blur',   /* 21:30，所有美國路線（AA_291 4-1）*/
    dialogue:[ nar('（行李箱上貼著媽媽的便條：「到了打電話。不管幾點。」）'),
      nar('（你打給媽媽。台灣是早上九點半，她說她剛好醒了。）'),
      {set:{US1_MOM:true}} ] });

  /* ---- 2-Y4-17 US2 退回的報告（C 棟 208 廚房；溫書瑀_角色企劃 US2、BB_98 2-8、BB_217）：交往中＝9/13 18:30～19:30 坐到窗口外側的高腳椅（usShared:'bar'）就開始 ---- */
  const US2_DAY=G=>{ const d=D('2028-09-13'), hh=((G.hour%24)+24)%24; return d!=null&&G.day===d&&hh>=18.5&&hh<19.5; };
  const onBar=GM=>{ const P=GM&&GM.E&&GM.E.player; return !!(P&&P.seat&&P.seat.lift>0); };   /* 高腳椅（us3d.js：椅面 0.76，seat.lift＝0.31；合租戶只有吧台的高腳椅有 lift）*/
  US.push({ id:'ev_us2_kitchen', title:'退回的報告', participants:[S5], location:'us_shared', trigger:'seat', once:true, background:'blur',
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
  US.push({ id:'ev_us2_repair', title:'退回的報告', participants:[S5], location:'any', trigger:'manual', once:true, background:'blur',
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
  US.push({ id:'ev_us_chicago', title:'芝加哥的週末', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
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
  US.push({ id:'ev_us_chicago2', title:'芝加哥的週末', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'芝加哥・博物館',bg:'chicago_dino'},
      nar('（她讀完每一塊說明牌。）'),
      IF(LONG,{speaker:'何俊朗',text:'妳每一塊都要讀？'}),UN(LONG,nar('（同行的人問她：「妳每一塊都要讀？」）')),   /* 裁定第 15 點 */
      sis('……我只是想讀完。'),
      sis('（看了一眼後面還有二十塊）……好。我跳過一塊。'),
      IF(G=>dating(G,S5),nar('（回程的巴士上，她睡著了。行程表還在她的外套口袋裡。）')),
      UN(G=>dating(G,S5),nar('（晚上回程的巴士上，兩個人隔一排坐。）')),
      {mem:[{npc:S5,tag:'CHICAGO_TRIP',note:'芝加哥的週末'}]} ] });

  /* ---- 2-Y4-19 US3 感恩節的湖邊（溫書瑀_角色企劃 US3；AA_253 §6 第 3 步）：11/23 09:00 會所門口 → 湖邊（出遊）---- */
  US.push({ id:'ev_us3_lake', title:'感恩節的湖邊', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
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
  US.push({ id:'ev_us_first_snow', title:'初雪', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
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
  US.push({ id:'ev_us_snow_repair', title:'初雪', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
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
  US.push({ id:'ev_us_club_dinner', title:'會所晚餐', participants:[S5], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
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
  US.push({ id:'ev_us_leave', title:'離開', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ {unless:{custom:LONG},goto:'n'},
      nar('（天還沒亮。何俊朗拖著兩個行李箱，背包上的奶茶杯鑰匙圈在晃。）'),
      {speaker:'何俊朗',text:'我的飛機比你早。……香港見？'},
      {choice:[{text:'「香港見。」',goto:'a'},{text:'「還好。」',goto:'b'}]},
      {label:'a'},{speaker:'何俊朗',text:'我帶你去吃。說好了。'},{goto:'e'},
      {label:'b'},{speaker:'何俊朗',text:'……你又來了。'},nar('（他笑了一下，上了車。）'),{goto:'e'},
      {label:'n'},nar('（天還沒亮。社區門口停著機場巴士。）'),
      {label:'e'},{set:{US_LEFT:true}} ] });
  US.push({ id:'ev_sf1', title:'舊金山', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
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
  US.push({ id:'ev_sf2', title:'霧裡的大橋', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
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
  US.push({ id:'ev_sf3', title:'老書店', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
    dialogue:[ {scene:'老書店',bg:'sf_bookstore'},
      nar('（二樓靠窗有一張舊椅子。她拿了一本詩集，坐下來就沒有再站起來。）'),
      sis('這不是法律書。'),
      sis('……你可以去逛。我在這裡。'),
      {choice:[{text:'「我也坐這裡。」',goto:'a'},{text:'「我去逛一圈再回來。」',goto:'b'}]},
      {label:'a'},nar('（她把詩集翻到一半推過來。）'),sis('你讀左邊，我讀右邊。'),{goto:'e'},
      {label:'b'},nar('（回來的時候她睡著了，詩集蓋在腿上。你沒有叫她。）'),
      {label:'e'},nar('（她買了那本詩集。）') ] });
  const PHOTO=(id,photo,line)=>({ id, title:'舊金山', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark', dialogue:[ {scene:'舊金山',bg:false},nar('📷（'+photo+'）'),sis(line) ] });   /* 摘要日的照片（手機相簿；BB_183 5-3，12/19 那句改字見裁定第 10 點）*/
  US.push(PHOTO('ev_sf_photo17','旅館窗外的坡道和叮噹車的電纜','睡到自然醒。……十點。我已經很努力了。'),
          PHOTO('ev_sf_photo19','碼頭邊的一碗蛤蜊湯（麵包碗）','好喝。……比我想的好喝。'),
          PHOTO('ev_sf_photo21','郵筒前，她手上一張明信片（字看不到）','寄給家族了。Kevin 收到會說我終於寫超過三句。'));
  const BLOOM=(id,t)=>({ id, title:'布魯明頓', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:[ nar(t) ] });   /* 挽回中、挽回不成：三個摘要日（AA_291 2-2）*/
  US.push(BLOOM('ev_us_bloom16','（社區很安靜。你把冰箱裡剩下的東西煮成一鍋。）'),
          BLOOM('ev_us_bloom18','（你去會所把借的書還了。交誼廳的聖誕樹還亮著，沒有人。）'),
          BLOOM('ev_us_bloom20','（行李箱合上了。你坐在上面，才拉得上拉鍊。）'),
          BLOOM('ev_us_bus21','（學姊也在這一班，坐在前面。）'));
  /* 12/23 05:40 桃園，入境大廳（AA_253 9-2 美國欄第一列＋BB_183 5-4；媽媽一個人來接，裁定第 8、9 點）；挽回不成＝她先走了 */
  US.push({ id:'ev_us_return', title:'回到臺灣', participants:[S5], location:'any', trigger:'manual', once:true, background:'dark',
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
  US.push({ id:'ev_us_home', title:'臺北的家', participants:[], location:'any', trigger:'manual', once:true, background:'dark',   /* 上午（AA_144 X2；兩種玩家都有）*/
    dialogue:[ {scene:'臺北・家裡',bg:'home_living_day'},
      {speaker:'媽媽',text:'你回來了。'},
      nar('（房間打掃過了。桌上多了一盒你小時候的模型。）') ] });

  return US;
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y4A_EVENTS);
