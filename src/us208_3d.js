/* ===== 208 的週末（AA_412 第 3 節，AA-B 2026-10-23 18:1x，第①級；D109 AA 定稿；台詞照原文、不改字）=====
   條件：美國路線、和學姊交往中、US2（9/13）以後（USL.c208Open 的「US2 以後」：F.US2 有值，或過了 9/13）；
         週六、日 14:00～21:00 她在 C 棟 208（USL.c208Open：扣掉芝加哥 11/11～12、初雪那晚的小教堂台階；挽回中門關著＝不演）。
   怎麼演：進 208（社區「上樓（C 棟 208）」→ us_shared）以後，先演下面還沒演過、今天在日期範圍裡的第一場；一個週末（週六、日）最多一場（G.flags.US208_WK＝那個週六）；
         過了範圍沒去的那一場就不演（不補、不扣分）。演完照常可以和她說話（閒聊階梯、招呼：這裡不動）。
     3-1 備忘錄 9/16～9/24　3-2 滷肉 9/23～10/1　3-3 剪報 10/14～10/22（聽過 S2-L5＝多一句旁白）　3-4 練習 10/21～10/29
     3-5 多出來的一個小時 只有 11/5（冬令時間那天）　3-6 植物 11/18～12/3　3-7 你坐那裡就好 12/9～12/10（演過 3-6＝多一句旁白）
   關係：每場記一個記憶（第 3-8 節；人物面板的名稱在 social3d.js 的 MEMORY_LABEL），不另外加數值。事件標題＝筆記本那一行（EVENTS.run 記進筆記本的日誌）。
   背景：照 US2（ev_us2_kitchen）：人就在 3D 的 208 裡，background 'blur'＝模糊的 208 當背景、不換圖、不出地點字幕。
     （AA_412 寫的 us_shared_kitchen 只是區域的出生點名字，OUT.BG 沒有這張圖：當 bg 用會變成黑底——ev_usl_thanks 現在就是這樣，另外回報）
   她說話框的名字：交往中自動是「書瑀」（SOCIAL.npcName，AA_411）。
   掛勾：STORY.TICKS（人在 us_shared、空下來、有該演的那一場就演），不改 us_life3d.js。測試：node tests/aa412_us_unit.js
   AA_454 第 1 節（AA-B 2026-10-25 03:5x，企劃線 eaa98aaa7）：快轉在週末 14:00 有停、畫面上什麼都沒有，一路快轉七場全部錯過——週末 14:00 她私訊一則要回的（S.dmPhone，每一場的那一句＝SCENES 的 dm）：
     「我過去。」＝出遊「C 棟 208」，出發就換到 208 演那一場（OUT.STAGE，S.stage）；「今天不行。」＝她「好。」，週日 14:00 再一次「今天也在 208。」；週日也說不行＝這個週末不演；沒回＝照現在。
     存檔 G.flags.US208_DM＝這個週末傳過了（那個週六）、US208_NO＝週日說不行的那個週末（那個週六；只是紀錄：AA-B 04:12「這個週末就不演」＝不再傳私訊，自己走過去照演）；舊存檔沒有＝沒傳過。測試：node tests/aa454_us_unit.js
   BUG-US-WKND-EMPTYSTOP-1025：USL.nextStop 的週末 14:00 停點問 S.stopAt（只停在她那天會傳私訊的時候）。測試：node tests/us_wknd_stop_unit.js
   AA_516 第 8 節第 1 點、第 3 點（企劃線 3cd10909b → d6f8621ac，SIS-B14-AAFIX-1028）：4-1 9/2 吃過她的咖哩（SIS14_US_CURRY）的，「之後第一次有吃東西的 208 場景」多一句旁白、一次（BOWL，SIS14_BOWL）：
     先算 9/13 US2（r2y4a_events.js ev_us2_kitchen，「（她把麵分到兩個碗。）」後面）；沒演到＝這裡 3-2 滷肉，接在第一句旁白後面；七場的其他六場（沒吃東西）不放。測試：node tests/aa516_sis_b14_unit.js */
'use strict';
const US208=(function(){
  const S={}, S5='heroine_05';
  if(typeof STORY==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const dk={}; const D=k=>{ if(k in dk) return dk[k]; return dk[k]=STORY.dayOfKey?STORY.dayOfKey(k):null; };
  const hh=G=>((G.hour%24)+24)%24;
  const dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+S5]===true||!!(R[S5]&&R[S5].status==='dating'); };
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const isUS=G=>!!G&&!!G.flags&&(G.stage||'law')==='law'&&!!STORY.route&&STORY.route(G)==='US';
  const sis=t=>({speaker:S5,text:t}), nar=t=>({speaker:null,text:t});
  const IF=(fn,l)=>Object.assign({if:{custom:fn}},l);
  const mem=tag=>({mem:[{npc:S5,tag,note:''}]});
  /* AA_516 第 8 節第 1 點、第 3 點（企劃線 3cd10909b → d6f8621ac；SIS-B14-AAFIX-1028）：4-1 9/2 208 的咖哩她說「……下次你用我的碗。」（SIS14_US_CURRY，src/sis_b14_3d.js）＝
     之後第一次有吃東西的 208 場景多一句旁白，一次（記 SIS14_BOWL；條件 SISB14.bowlDue：吃過咖哩、還沒演過這一句）。第 3 點：只放有吃東西的——
     先算 9/13 US2（r2y4a_events.js ev_us2_kitchen：選「那就寫妳。」那一支、「（她把麵分到兩個碗。）」後面，同一句另一行）；沒演到（沒去 US2、選了另外兩支）＝3-2 滷肉，
     接在第一句旁白「（還沒進門就聞到了……）」後面；3-1 看作業那一類（其他六場）不放。us_blank3d.js 的「（你認得那包八角。）」（patchLurou）接在這一句後面（S.BOWL 認這一行）*/
  const BOWL=Object.assign(IF(G=>typeof SISB14!=='undefined'&&!!SISB14.bowlDue&&SISB14.bowlDue(G),nar('（她把自己的碗放在你面前，換她用你上次帶來的那一個。）')),{set:{SIS14_BOWL:true},aa516:true});
  /* 3-3：聽過她大一下那一層（閒聊階梯 S2-L5「她爸把剪報放在她書桌上」，記憶 SIS4_CLIPPINGS；過場演過的 ladSeen 也算）*/
  S.heardClip=G=>(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(S5,'SIS4_CLIPPINGS'))||!!(G&&G.social&&G.social.ladSeen&&G.social.ladSeen['S2-L5']!=null);

  /* ---------------- 七場（第 3-1～3-7 節）；dm＝AA_454 第 1 節週末 14:00 她私訊的那一句（照稿的表；不搶那一場的第一句）---------------- */
  S.SCENES=[
    {n:'3-1',ev:'ev_us208_memo',from:'2028-09-16',to:'2028-09-24',tag:'US208_MEMO',label:'書瑀幫你看 Legal Writing 的作業',dm:'我在 208。門沒鎖。',dialogue:[
      nar('（門沒鎖。她坐在沙發上，腿上放著筆電。）'),
      sis('Legal Writing 的作業寫完了嗎？'),
      sis('拿來。我看一下。'),
      nar('（她拿鉛筆在你印出來的那兩頁上畫線。畫得很輕，擦得掉。）'),
      sis('第一段太長了。你的教授說得對。'),
      sis('這裡。你想說的是這一句，可是你把它放在最後面。'),
      {choice:[{text:'「那要搬到前面嗎？」',goto:'a'},{text:'「妳英文寫得比我好。」',goto:'b'}]},
      {label:'a'},sis('你自己搬。我只畫線。'),nar('（她把鉛筆遞給你。）'),{goto:'e'},
      {label:'b'},sis('沒有。我只是被退過。'),nar('（她看了一眼桌上那份被退回的報告。上面的紅字比你的多。）'),
      {label:'e'},mem('US208_MEMO') ]},
    {n:'3-2',ev:'ev_us208_lurou',from:'2028-09-23',to:'2028-10-01',tag:'US208_LUROU',label:'書瑀煮了有一點焦的滷肉',dm:'我在煮東西。……第一次煮這個。',dialogue:[
      nar('（還沒進門就聞到了。醬油、八角，還有一點焦味。）'),BOWL,   /* AA_516 第 8 節第 3 點：碗那一句接在第一句旁白後面（us_blank3d.js 的「（你認得那包八角。）」再接在它後面）*/
      sis('亞洲超市買得到八角。冰糖沒有，我用一般的糖。'),
      sis('……所以有一點焦。'),
      nar('（她的小鍋子在爐子上，蓋子一直被頂起來。室友從房間探出頭，用英文問這是什麼味道，可不可以吃一碗。）'),
      sis('（對室友）It\'s my mom\'s recipe.'),
      sis('（小聲，對你）我媽的不會焦。'),
      {choice:[{text:'「很香。」',goto:'a'},{text:'「下次放冰糖。」',goto:'b'}]},
      {label:'a'},sis('香是香。吃了再說。'),{goto:'e'},
      {label:'b'},sis('這裡買不到。'),nar('（她翻開計畫本，在十二月底的格子裡寫了兩個字：冰糖。）'),
      {label:'e'},mem('US208_LUROU') ]},
    {n:'3-3',ev:'ev_us208_clipping',from:'2028-10-14',to:'2028-10-22',tag:'US208_CLIPPING',label:'書瑀的爸爸寄了一張剪報到美國',dm:'臺灣寄來的東西到了。',dialogue:[
      nar('（沙發上放著一個從臺灣寄來的牛皮紙信封，郵票貼了一整排。）'),
      sis('我爸寄的。'),
      sis('一張剪報。法律扶助的新聞。……郵資比報紙貴。'),
      nar('（信封裡只有那一張剪報，沒有信。剪報的邊剪得很整齊。）'),
      IF(G=>S.heardClip(G),nar('（你想起她說過，她爸以前會把報紙剪下來，放在她的書桌上。）')),
      sis('他還是一個字都沒寫。'),
      {choice:[{text:'「妳要回他嗎？」',goto:'a'},{text:'「他在等妳回去。」',goto:'b'}]},
      {label:'a'},sis('回了。我拍照傳給他，說收到了。'),nar('（她把手機轉過來給你看。她爸只回了一個字：好。）'),{goto:'e'},
      {label:'b'},sis('……嗯。'),nar('（她把剪報夾進那本從臺灣帶來的、大一的民總。）'),
      {label:'e'},mem('US208_CLIPPING') ]},
    {n:'3-4',ev:'ev_us208_rehearsal',from:'2028-10-21',to:'2028-10-29',tag:'US208_REHEARSAL',label:'聽書瑀練習英文報告',dm:'下午在 208。你來的時候先敲門。',dialogue:[
      nar('（她站在客廳中間，手上拿著幾張小卡。看到你進來，把卡片翻過去。）'),
      sis('下禮拜三研討課，我要報告。二十分鐘，英文。'),
      sis('你坐那裡。哪裡聽不懂就舉手。'),
      nar('（她開始講。你在第二句就舉手了。）'),
      sis('……哪裡？'),
      {choice:[{text:'「沒有，只是想試試看。」',goto:'a'},{text:'「Legal aid 妳念得太快。」',goto:'b'}]},
      {label:'a'},sis('手放下。'),nar('（她從第一句重新開始。這一次你沒有舉手，一直聽到最後。）'),{goto:'e'},
      {label:'b'},sis('……真的？'),nar('（她在卡片上那個字的旁邊畫了一條線。之後每講到那個字，她都慢一點。）'),
      {label:'e'},sis('好。這樣可以。'),sis('冰箱裡有飲料。你自己拿。'),mem('US208_REHEARSAL') ]},
    {n:'3-5',ev:'ev_us208_extra_hour',from:'2028-11-05',to:'2028-11-05',tag:'US208_EXTRA_HOUR',label:'冬令時間那天，計畫本空了一格',dm:'冬令時間。手機自己改了。……你過來嗎。',dialogue:[   /* 只有這一天；11/5 沒去 208 就不演 */
      nar('（今天開始冬令時間。手機自己把時間往回撥了一個小時。）'),
      sis('今天多一個小時。'),
      nar('（她的計畫本攤在桌上。今天那一格，什麼都沒寫。）'),
      sis('本來想拿來寫論文。……後來沒有寫上去。'),
      {choice:[{text:'「那拿來做什麼？」',goto:'a'},{text:'「拿來睡覺。」',goto:'b'}]},
      {label:'a'},sis('不知道。'),nar('（她把計畫本闔起來。）'),sis('坐著吧。'),nar('（你們坐在沙發上，看窗外的天比昨天早黑。誰都沒有去看時間。）'),{goto:'e'},
      {label:'b'},sis('……也可以。'),nar('（她真的靠在沙發上睡著了。毯子是你幫她蓋的。）'),
      {label:'e'},mem('US208_EXTRA_HOUR') ]},
    {n:'3-6',ev:'ev_us208_plant',from:'2028-11-18',to:'2028-12-03',tag:'US208_PLANT',label:'書瑀在救客廳那盆植物',dm:'客廳那盆植物，我在救它。',dialogue:[
      nar('（客廳那盆快乾掉的植物，被搬到了窗邊。旁邊放著一個量杯。）'),
      sis('室友說它九月就這樣了。'),
      sis('我查了。是水澆太多。'),
      nar('（她把量杯裡的水倒掉一半，才澆下去。）'),
      {choice:[{text:'「救得回來嗎？」',goto:'a'},{text:'「妳連植物都排時間。」',goto:'b'}]},
      {label:'a'},sis('不知道。我只顧到十二月。'),sis('之後交給室友。我寫在冰箱上了。'),{goto:'e'},
      {label:'b'},sis('沒有排。'),sis('……好，有排。星期六。'),
      {label:'e'},mem('US208_PLANT') ]},
    {n:'3-7',ev:'ev_us208_lastweek',from:'2028-12-09',to:'2028-12-10',tag:'US208_LASTWEEK',label:'期末那個週末，坐在 208 的沙發上讀書',dm:'我在寫報告。你要來的話，帶你自己的書。',dialogue:[
      nar('（客廳的桌上堆滿了影印的資料。她在寫期末的報告，沒有抬頭。）'),
      sis('你坐那裡就好。'),
      sis('……有人在，我寫得比較快。'),
      nar('（你在沙發上讀你的期末。兩個小時，她只說了一句話。）'),
      sis('幫我倒水。熱的。'),
      IF(G=>done(G,'ev_us208_plant'),nar('（窗邊那盆植物長出了一片新的葉子，很小。她沒有提，你也沒有。）')),   /* 演過 3-6 */
      {choice:[{text:'「寫完了嗎？」',goto:'a'},{text:'（不問，繼續讀）',goto:'b'}]},
      {label:'a'},sis('還沒。……今天的寫完了。'),{goto:'e'},
      {label:'b'},nar('（過了一會兒，她起來倒水，把你的杯子也倒滿了。）'),
      {label:'e'},mem('US208_LASTWEEK') ]} ];
  S.BOWL=BOWL;   /* us_blank3d.js 的 patchLurou 用（「（你認得那包八角。）」接在這一句後面）*/
  /* 事件（trigger manual：只有這裡叫；標題＝筆記本那一行）*/
  S.EV=S.SCENES.map(s=>({id:s.ev,title:s.label,participants:[S5],location:'us_shared',trigger:'manual',once:true,background:'blur',dialogue:s.dialogue,
    beforeOuting:G=>{ if(G&&G.flags) G.flags.US208_WK=S.wk(G); }}));   /* AA_454 1：回「我過去。」的出遊（OUT.go）演之前先記這個週末（同 S.tick）*/
  for(const e of S.EV) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  /* 人物面板的記憶名稱（第 3-8 節）登記在 social3d.js 的 MEMORY_LABEL（和 label 同一句；人物面板的測試只讀那裡）*/

  /* ---------------- 什麼時候演 ---------------- */
  S.wk=G=>G.weekday===0?G.day-1:G.day;   /* 這個週末＝那個週六（週日往前一天）*/
  S.us2Past=G=>!!(G.flags&&G.flags.US2)||G.day>D('2028-09-13');   /* 「演過 US2（9/13）」：同 USL.c208Open 的「US2 以後」（挽回中沒還鍋子、之後才在一起的也算，不卡住）*/
  S.due=function(G){ if(!G||!G.flags||!isUS(G)||typeof USL==='undefined'||!USL.here||!USL.here(G)) return null;
    if(!dating(G)||!S.us2Past(G)) return null;
    const w=G.weekday, h=hh(G); if(!(w===6||w===0)||h<14||h>=21) return null;
    if(USL.c208Open&&!USL.c208Open(G)) return null;   /* 她不在 208（芝加哥、初雪那晚、12/16 以後）*/
    if(G.flags.US208_WK===S.wk(G)) return null;   /* 這個週末演過一場了 */
    return S.SCENES.find(s=>!done(G,s.ev)&&G.day>=D(s.from)&&G.day<=D(s.to))||null; };   /* 還沒演過、今天在範圍裡的第一場 */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['us208_3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||G.zone!=='us_shared'||!free(GM)) return false; const s=S.due(G); if(!s||typeof EVENTS==='undefined') return false;
    const e=STORY_EVENTS.find(x=>x.id===s.ev); if(!e) return false; G.flags.US208_WK=S.wk(G); S.dmDone(G);
    busy=true; if(GM.sceneBegin) GM.sceneBegin(); Promise.resolve().then(()=>EVENTS.run(e,{noTitle:true})).catch(x=>console.warn('US208',x)).finally(()=>{ busy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; };   /* 決定開演的那一刻就鎖住（STUCK-HARDEN-1027，同 invites3d.js S.autoStart）：延後開演的空檔裡，玩家按的「說話」、同一格的 EVENTS.tick 都進不來；演完放開再自動存檔 */
  S.isBusy=()=>busy;
  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));

  /* ---------------- AA_454 第 1 節：週末 14:00 她私訊（要回的）----------------
     起因：快轉在週末 14:00 有停（USL.nextStop），停下來畫面上什麼都沒有，一路快轉的玩家七場全部錯過。條件同 S.due（該演的那一場、她在 208、這個週末還沒演）。
     這個週末的第一則（週六 14:00；週六沒有該演的＝週日，例 3-5 只有 11/5（日））＝那一場的 dm；最後一則要回：
       「我過去。」＝她「嗯。」（AA-B 04:12，七場共用）→ 出遊「C 棟 208」（回的當下 15 分鐘後、最早 14:30；快轉停在出發前（USL.nextStop 算出遊））→ 出發就換到 208 演那一場（S.stage）。
       「今天不行。」＝她「好。」；週六說的＝週日 14:00 再傳一次「今天也在 208。」（同樣兩個選項）；週日說的＝這個週末不再傳（US208_NO）；自己走過去照演（AA-B 04:12：說了兩次不行又自己走過去＝改主意了）。
       沒回＝照現在（自己走過去也會演；那一則就不用回了：S.dmDone）。週六去過的（US208_WK）週日不傳。回的是哪一個看手機的回覆紀錄（ans）。*/
  S.DM_SUN='今天也在 208。'; S.DM_YES='我過去。'; S.DM_YES_RE='嗯。'; S.DM_NO='今天不行。'; S.DM_NO_RE='好。'; S.DM_UNTIL=20.5;   /* 回覆的期限、最晚出發 20:30（她 21:00 離開 208）*/
  const now=G=>G.day*24+G.hour, T=(d,h)=>d*24+h, qc=x=>Math.ceil(x*4-1e-6)/4;
  const md=d=>{ const k=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).key:''; return k?k.slice(5,7)+k.slice(8,10):String(d); };
  S.askId=d=>'us208_ask_'+md(d); S.dmTag=d=>'us208_dm_'+md(d); S.outId=d=>'us208_'+md(d);   /* d＝傳的那一天 */
  /* d 那天（星期 w）她要傳的那一句；不傳＝null。S.dmPhone 和快轉的停點（S.stopAt）共用，兩邊不會對不起來 */
  const dmLine=(G,d,w,s)=>{ const wk=w===0?d-1:d; if(PHONE.sent(G,S.dmTag(d))) return null;
    if(G.flags.US208_DM!==wk) return s.dm;   /* 這個週末的第一則：那一場的那一句 */
    if(w===0){ const m=PHONE.byAsk(G,S.askId(wk)); if(m&&m.ans===1) return S.DM_SUN; }   /* 週六回「今天不行。」：週日再一次（一個週末最多一次）*/
    return null; };
  S.dmPhone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!(G.weekday===6||G.weekday===0)) return; const F=G.flags, d=G.day, wk=S.wk(G), s=S.due(G); if(!s) return;
    if(hh(G)<S.DM_UNTIL){ const t=dmLine(G,d,G.weekday,s);
      if(t){ const no={t:S.DM_NO,say:[{from:S5,text:S.DM_NO_RE}]}; if(G.weekday===0) no.set={US208_NO:wk};
        PHONE.at(G,d,Math.max(14,hh(G)),[{th:'p:'+S5,from:S5,text:t,ask:{id:S.askId(d),until:T(d,S.DM_UNTIL),opts:[{t:S.DM_YES,say:[{from:S5,text:S.DM_YES_RE}]},no]}}],S.dmTag(d)); F.US208_DM=wk; } }
    const m=PHONE.byAsk(G,S.askId(d));
    if(m&&m.ans===0&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,S.outId(d))&&hh(G)<S.DM_UNTIL){ const h=Math.max(14.5,qc(hh(G)+0.25));   /* 「我過去。」＝排出遊（演的是排的當下該演的那一場）*/
      OUT.plan(G,{id:S.outId(d),ev:s.ev,day:d,h,late:Math.max(0.25,S.DM_UNTIL-h),place:'C 棟 208',title:'C 棟 208',travel:'走路 約 5 分鐘',travelH:1/12,back:'回到社區。'}); } };
  /* BUG-US-WKND-EMPTYSTOP-1025（BB-B BB_218 R36 附註③）：快轉的週末 14:00 停點（USL.nextStop）只停在她那時候真的會傳私訊的那一天——
     d 那天 14:00 有該演的那一場（S.due：她在 208、這個週末還沒演）、那天還沒傳，而且是這個週末的第一則、或週六回了「今天不行。」的週日（同 S.dmPhone）。
     原本交往中每個週六、日 14:00 都停：週六去過的週日、沒有該演的週末（10/7～8、11/4）、七場都演完以後，停下來什麼都沒有。*/
  S.stopAt=function(G,d){ if(!G||!G.flags||typeof PHONE==='undefined'||d==null) return false;
    const w=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?(x=>x===7?0:x)(CALENDAR.dateOf(d).wd):((G.weekday+d-G.day)%7+7)%7; if(!(w===6||w===0)) return false;
    const s=S.due(Object.assign({},G,{day:d,weekday:w,hour:14})); return !!s&&!!dmLine(G,d,w,s); };
  /* 自己走進 208 先演了（S.tick）：這個週末還沒回的那一則不用回了（期限設成現在）、排了的出遊記 done（不再問「出發」，不演兩次）*/
  S.dmDone=function(G){ const wk=S.wk(G);
    for(const d of [wk,wk+1]){ const m=typeof PHONE!=='undefined'?PHONE.byAsk(G,S.askId(d)):null; if(m&&m.ask&&m.ans==null) m.ask.until=now(G)-0.01;
      const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,S.outId(d)):null; if(q&&q.state==='planned') q.state='done'; } };
  /* 出發＝換到 C 棟 208 演（OUT.STAGE，同 us_blank3d.js 的竹葉、圖書館）：站在進門的地方（同社區「上樓（C 棟 208）」），她照作息在客廳（USL.populate → sisSync），畫面用模糊的 3D；演完回到原本的地方 */
  S.stage=async function(GM,q,ev){ if(!q||!/^us208_/.test(String(q.id||''))||!ev||!S.SCENES.some(x=>x.ev===ev.id)) return null; const G=GM.G, E=GM.E, P=E&&E.player;
    if(!G||!P||!P.obj||!GM.enter||!isUS(G)||typeof USL==='undefined'||!USL.here||!USL.here(G)||P.riding||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES.us_shared||!Z3.ZONES[G.zone]||(typeof OUT!=='undefined'&&OUT.fromHome)) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const sp=Object.assign({x:0,z:2,yaw:Math.PI},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN.us_shared)||{});
    await GM.enter('us_shared',{x:sp.x,z:sp.z,yaw:sp.yaw||0},{noFade:true,deferStory:true,noAutosave:true});
    let fin=false;
    return {restore:async()=>{ if(fin) return; fin=true; if(P.seat&&GM.standUp) GM.standUp(P); await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.dmPhone(G));
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT._us208Stage){ OUT.STAGE.push((GM,q,ev)=>S.stage(GM,q,ev)); OUT._us208Stage=true; }
  return S;
})();
