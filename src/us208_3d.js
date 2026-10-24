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
   掛勾：STORY.TICKS（人在 us_shared、空下來、有該演的那一場就演），不改 us_life3d.js。測試：node tests/aa412_us_unit.js */
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
  /* 3-3：聽過她大一下那一層（閒聊階梯 S2-L5「她爸把剪報放在她書桌上」，記憶 SIS4_CLIPPINGS；過場演過的 ladSeen 也算）*/
  S.heardClip=G=>(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(S5,'SIS4_CLIPPINGS'))||!!(G&&G.social&&G.social.ladSeen&&G.social.ladSeen['S2-L5']!=null);

  /* ---------------- 七場（第 3-1～3-7 節）---------------- */
  S.SCENES=[
    {n:'3-1',ev:'ev_us208_memo',from:'2028-09-16',to:'2028-09-24',tag:'US208_MEMO',label:'書瑀幫你看 Legal Writing 的作業',dialogue:[
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
    {n:'3-2',ev:'ev_us208_lurou',from:'2028-09-23',to:'2028-10-01',tag:'US208_LUROU',label:'書瑀煮了有一點焦的滷肉',dialogue:[
      nar('（還沒進門就聞到了。醬油、八角，還有一點焦味。）'),
      sis('亞洲超市買得到八角。冰糖沒有，我用一般的糖。'),
      sis('……所以有一點焦。'),
      nar('（她的小鍋子在爐子上，蓋子一直被頂起來。室友從房間探出頭，用英文問這是什麼味道，可不可以吃一碗。）'),
      sis('（對室友）It\'s my mom\'s recipe.'),
      sis('（小聲，對你）我媽的不會焦。'),
      {choice:[{text:'「很香。」',goto:'a'},{text:'「下次放冰糖。」',goto:'b'}]},
      {label:'a'},sis('香是香。吃了再說。'),{goto:'e'},
      {label:'b'},sis('這裡買不到。'),nar('（她翻開計畫本，在十二月底的格子裡寫了兩個字：冰糖。）'),
      {label:'e'},mem('US208_LUROU') ]},
    {n:'3-3',ev:'ev_us208_clipping',from:'2028-10-14',to:'2028-10-22',tag:'US208_CLIPPING',label:'書瑀的爸爸寄了一張剪報到美國',dialogue:[
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
    {n:'3-4',ev:'ev_us208_rehearsal',from:'2028-10-21',to:'2028-10-29',tag:'US208_REHEARSAL',label:'聽書瑀練習英文報告',dialogue:[
      nar('（她站在客廳中間，手上拿著幾張小卡。看到你進來，把卡片翻過去。）'),
      sis('下禮拜三研討課，我要報告。二十分鐘，英文。'),
      sis('你坐那裡。哪裡聽不懂就舉手。'),
      nar('（她開始講。你在第二句就舉手了。）'),
      sis('……哪裡？'),
      {choice:[{text:'「沒有，只是想試試看。」',goto:'a'},{text:'「Legal aid 妳念得太快。」',goto:'b'}]},
      {label:'a'},sis('手放下。'),nar('（她從第一句重新開始。這一次你沒有舉手，一直聽到最後。）'),{goto:'e'},
      {label:'b'},sis('……真的？'),nar('（她在卡片上那個字的旁邊畫了一條線。之後每講到那個字，她都慢一點。）'),
      {label:'e'},sis('好。這樣可以。'),sis('冰箱裡有飲料。你自己拿。'),mem('US208_REHEARSAL') ]},
    {n:'3-5',ev:'ev_us208_extra_hour',from:'2028-11-05',to:'2028-11-05',tag:'US208_EXTRA_HOUR',label:'冬令時間那天，計畫本空了一格',dialogue:[   /* 只有這一天；11/5 沒去 208 就不演 */
      nar('（今天開始冬令時間。手機自己把時間往回撥了一個小時。）'),
      sis('今天多一個小時。'),
      nar('（她的計畫本攤在桌上。今天那一格，什麼都沒寫。）'),
      sis('本來想拿來寫論文。……後來沒有寫上去。'),
      {choice:[{text:'「那拿來做什麼？」',goto:'a'},{text:'「拿來睡覺。」',goto:'b'}]},
      {label:'a'},sis('不知道。'),nar('（她把計畫本闔起來。）'),sis('坐著吧。'),nar('（你們坐在沙發上，看窗外的天比昨天早黑。誰都沒有去看時間。）'),{goto:'e'},
      {label:'b'},sis('……也可以。'),nar('（她真的靠在沙發上睡著了。毯子是你幫她蓋的。）'),
      {label:'e'},mem('US208_EXTRA_HOUR') ]},
    {n:'3-6',ev:'ev_us208_plant',from:'2028-11-18',to:'2028-12-03',tag:'US208_PLANT',label:'書瑀在救客廳那盆植物',dialogue:[
      nar('（客廳那盆快乾掉的植物，被搬到了窗邊。旁邊放著一個量杯。）'),
      sis('室友說它九月就這樣了。'),
      sis('我查了。是水澆太多，不是太少。'),
      nar('（她把量杯裡的水倒掉一半，才澆下去。）'),
      {choice:[{text:'「救得回來嗎？」',goto:'a'},{text:'「妳連植物都排時間。」',goto:'b'}]},
      {label:'a'},sis('不知道。我只顧到十二月。'),sis('之後交給室友。我寫在冰箱上了。'),{goto:'e'},
      {label:'b'},sis('沒有排。'),sis('……好，有排。星期六。'),
      {label:'e'},mem('US208_PLANT') ]},
    {n:'3-7',ev:'ev_us208_lastweek',from:'2028-12-09',to:'2028-12-10',tag:'US208_LASTWEEK',label:'期末那個週末，坐在 208 的沙發上讀書',dialogue:[
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
  /* 事件（trigger manual：只有這裡叫；標題＝筆記本那一行）*/
  S.EV=S.SCENES.map(s=>({id:s.ev,title:s.label,participants:[S5],location:'us_shared',trigger:'manual',once:true,background:'blur',dialogue:s.dialogue}));
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
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||G.zone!=='us_shared'||!free(GM)) return false; const s=S.due(G); if(!s||typeof EVENTS==='undefined') return false;
    const e=STORY_EVENTS.find(x=>x.id===s.ev); if(!e) return false; G.flags.US208_WK=S.wk(G);
    busy=true; Promise.resolve().then(()=>EVENTS.run(e,{noTitle:true})).catch(x=>console.warn('US208',x)).finally(()=>{ busy=false; }); return true; };
  S.isBusy=()=>busy;
  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  return S;
})();
