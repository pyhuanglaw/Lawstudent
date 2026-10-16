/* ===== 出遊：離開 3D 地圖的約（交接包 v1 第 7 批；BB_95 第 9 節「沒有這些系統時的最小版本」、AA_112 第 3、4 節）=====
   政大、河濱這些地方沒有可以走的 3D 區域。流程：手機答應（PHONE 的回覆）→ 排進 G.outings → 時間到了（前 15 分鐘起、後 45 分鐘內，不在劇情、對話裡）
   在該出發的時間（約好的時間減車程）前 15 分鐘起問「出發」→ 轉場（標題卡：開車約 30 分鐘，2～3 秒）→ 演那個事件（STORY_EVENTS 裡 trigger:'outing' 的事件；一串場景：每一段 {scene:'地點', bg:'背景 id'}，
   2D 背景還沒有圖時用深色底——MISSING_EXTERNAL_ART）→ 演完回到原本的地方，時間照事件的 hours 往後（從抵達的時間算）。
   「晚一點」：20 分鐘後再問；「不去了」或過了時間：missed，不扣分（事件的 outingMissed 決定要不要補，例如傳一張照片）。
   存檔 G.outings＝[{id, ev, day, h, place, title, travel, travelH, state:'planned'|'done'|'missed', ask}]（舊存檔沒有＝空的）。
   測試：node tests/v1_batch7_unit.js */
'use strict';
const OUT=(function(){
  const S={};
  /* 2D 背景（AA_112 3-1：政大四個＋停車場；河濱和子晴的河堤夜景共用）：image 是圖片路徑，還沒有圖＝null（深色底＋地點字幕）。
     home_living＝平常週末回家的客廳（還沒有圖）；home_living_cny＝除夕的年夜飯（BB-B 第 25 組，桌上是年夜飯、牆上中國結，只用在除夕）。
     政大只做主要校園＋宿舍（自強十舍）（使用者 2026-10-16 對 LAWWW2-B）：河堤、圖書館、停車場不做，那幾幕照 AA_137 7-1 改到校門、校園裡的路、宿舍樓下 */
  S.BG={ car:{label:'車上',image:null}, nccu_gate:{label:'政大・校門口',image:'assets/bg/nccu_gate.webp'}, nccu_food:{label:'政大・山下的小吃街',image:'assets/bg/nccu_food.webp'}, nccu_dorm:{label:'政大・宿舍樓下',image:null}, nccu_campus:{label:'政大・校園裡的路',image:'assets/bg/nccu_campus.webp'},
    riverside:{label:'河濱',image:'assets/bg/riverside.webp'}, dorm_roof:{label:'宿舍頂樓',image:'assets/bg/dorm_roof.webp'}, video:{label:'視訊',image:'assets/bg/video.webp'}, gongguan_luwei:{label:'公館・滷味攤',image:'assets/bg/gongguan_luwei.webp'},
    ntu_soc:{label:'台大・社科院門口',image:'assets/bg/ntu_soc.webp'}, ferris_wheel:{label:'摩天輪',image:'assets/bg/ferris_wheel.webp'}, gongguan:{label:'公館',image:null}, wenzhou:{label:'溫州街',image:null}, ntu_linze:{label:'台大・霖澤館前',image:'assets/bg/ntu_linze.webp'}, ntu_avenue:{label:'台大・椰林大道',image:'assets/bg/ntu_avenue.webp'},
    trip_sea:{label:'海邊',image:null}, trip_oldtown:{label:'老街',image:null}, trip_mountain:{label:'山上',image:'assets/bg/trip_mountain.webp'},
    home_living:{label:'臺北・家裡的客廳',image:'assets/bg/home_living.webp'}, home_living_day:{label:'臺北・家裡的客廳',image:'assets/bg/home_living_day.webp'}, home_living_cny:{label:'臺北・家裡的客廳（除夕）',image:'assets/bg/home_living_cny.webp'}, home_balcony:{label:'臺北・家裡的陽台',image:'assets/bg/home_balcony.webp'}, home_room:{label:'臺北・家裡的房間',image:'assets/bg/home_room.webp'},
    econ_camp:{label:'宿營・青年活動中心',image:'assets/bg/econ_camp.webp'}, econ_camp_room:{label:'宿營・八人寢室',image:'assets/bg/econ_camp_room.webp'}, gongguan_douhua:{label:'公館・豆花店',image:'assets/bg/gongguan_douhua.webp'}, gongguan_hotpot:{label:'公館・火鍋店',image:'assets/bg/gongguan_hotpot.webp'}, newyear_crowd:{label:'跨年的人潮',image:'assets/bg/newyear_crowd.webp'}, soc_library:{label:'社科院圖書館・閱覽區',image:'assets/bg/soc_library.webp'}, soc_office:{label:'經濟系系辦',image:'assets/bg/soc_office.webp'}, classroom_small:{label:'小教室',image:'assets/bg/classroom_small.webp'},
    wenzhou_tutoring:{label:'溫州街・課輔班門口',image:'assets/bg/wenzhou_tutoring.webp'}, yongkang_curry:{label:'永康街・咖哩店',image:null},
    gongguan_cinema:{label:'公館・二輪戲院',image:null}, soymilk_shop:{label:'豆漿店',image:'assets/bg/soymilk_shop.webp'}, tutor_home:{label:'學生家的客廳',image:'assets/bg/tutor_home.webp'},
    noodle_table:{label:'阿鳳麵店・長桌',image:'assets/bg/noodle_table.webp'}, soc_hall:{label:'社科院・大講堂',image:'assets/bg/soc_hall.webp'}, soc_classroom:{label:'社科院・系上的教室',image:'assets/bg/soc_classroom.webp'}, xiaofu:{label:'小福',image:'assets/bg/xiaofu.webp'}, girls_dorm_gate:{label:'女生宿舍門口',image:'assets/bg/girls_dorm_gate.webp'}, bowling:{label:'保齡球館',image:'assets/bg/bowling.webp'}, seaside_town:{label:'春假・海邊的小鎮',image:null},
    d04_base_night:{label:'西門町',image:'assets/bg/d04_base_night.webp'}, d06_base_day:{label:'北美館',image:'assets/bg/d06_base_day.webp'}, d12_base_sunset:{label:'大稻埕',image:'assets/bg/d12_base_sunset.webp'}, d13_base_sunset:{label:'淡水',image:'assets/bg/d13_base_sunset.webp'} };   /* 期中考完的晚餐（交接包 v2 C11、C21）：麵店有 3D 區域，長桌這一幕先用 2D 底 */   /* 春假 K8 的三個目的地（BB_96 9-5；交接包 v2 C9）、嘉義老家（AA_12 主線 2；C2）：圖還沒有＝深色底＋地點字幕 */   /* K2 可昕來台大（BB_95 9-3 的最小版本：依序換 2D 背景；之後可以換成遊戲校園的畫面）*/
  S.BG.ntu_court_night={label:'台大・新體育館旁的籃球場（晚上）',image:'assets/bg/ntu_court_night.webp'};   /* 哲 2（AA_177 第 5 節）：ART-BG-COURT 派給 LAWWW2-B，圖來了填 assets/bg/ntu_court_night.webp */
  S.BG.car_morning={label:'車上（早上）',image:'assets/bg/car_morning.webp'}; S.BG.car_night={label:'車上（晚上）',image:'assets/bg/car_night.webp'}; S.BG.car_rain={label:'車上（雨天）',image:'assets/bg/car_rain.webp'};   /* BG-08（LAWWW2-B 702a2838）*/
  /* 車上：照當時的天氣、時間挑一張（下雨＝雨天、18:00～05:59＝晚上、其他＝早上）；事件要固定哪一張就直接寫 car_morning／car_night／car_rain */
  const carVariant=()=>{ const G=typeof GAME!=='undefined'?GAME.G:null; if(!G) return 'car_morning'; if(G.weather==='rain') return 'car_rain'; const h=G.hour%24; return (h>=18||h<6)?'car_night':'car_morning'; };
  S.bg=id=>{ if(id==='car') id=carVariant(); const b=S.BG[id]; return b&&b.image?{image:b.image}:'dark'; };
  S.rec=G=>{ if(!Array.isArray(G.outings)) G.outings=[]; return G.outings; };
  S.get=(G,id)=>S.rec(G).find(q=>q.id===id)||null;
  /* 排一個出遊；同一個 id 只排一次（讀檔、重進區域不會重複）*/
  S.plan=function(G,o){ const L=S.rec(G); if(L.some(q=>q.id===o.id)) return false; L.push(Object.assign({state:'planned',ask:null,travelH:0.5},o)); return true; };
  const t=(day,h)=>day*24+h;
  /* 該問了：該出發的時間（約好的時間減車程）前 15 分鐘起、約好的時間後 45 分鐘內；「晚一點」之後等到 ask 那個時間 */
  const lateEnd=q=>t(q.day,q.h)+(q.late!=null?q.late:0.75);   /* late：開始後多久還能出發（小時；預設 45 分鐘。AA_154 2-1b 的聚會是 15 分鐘）*/
  /* 休學以後住在家裡（經濟系 Y0_MOVED_OUT，AA_154 1-3b、A46 ②）：所有出遊、約好的見面（含只帶到校園某處的 goto）從家裡出發＝捷運＋公車 約 30 分鐘、0.5 小時；問要不要出發的時間跟著提早。視訊不用出門 */
  const baseHome=G=>typeof HOME!=='undefined'&&HOME.baseMode&&HOME.baseMode(G)&&HOME.at&&HOME.at(G);
  S.trip=(G,q,fromHome)=>(fromHome||baseHome(G))&&q.verb!=='接起來'&&q.place!=='視訊'?((q.travelH||0)>0.5?{travelH:q.travelH,travel:q.travel||''}:{travelH:0.5,travel:'捷運＋公車 約 30 分鐘'}):{travelH:q.travelH||0,travel:q.travel||''};   /* 比 30 分鐘遠的（例：政大 40 分鐘，A40）照原本的 */
  const running=new Set();   /* 正在演的那一個（不存檔）：演完才標 done，演的途中不能再被叫出來 */
  S.due=function(G){ const now=t(G.day,G.hour); return S.rec(G).find(q=>q.state==='planned'&&!running.has(q.id)&&now>=t(q.day,q.h)-S.trip(G,q).travelH-0.25&&now<=lateEnd(q)&&(q.ask==null||now>=q.ask))||null; };
  /* 過了時間（後 45 分鐘以上）還沒出發＝missed */
  S.expire=function(G){ const now=t(G.day,G.hour), out=[]; for(const q of S.rec(G)) if(q.state==='planned'&&now>lateEnd(q)){ q.state='missed'; out.push(q); } return out; };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  S.onMissed=function(GM,q){ const ev=evOf(q.ev); if(ev&&typeof ev.outingMissed==='function'){ try{ ev.outingMissed(GM.G,GM,q); }catch(e){ console.warn('outingMissed',q.id,e); } } };
  /* 每 0.5 秒（story3d.js 的 S.tick；劇情、對話進行中 S.tick 不會呼叫）*/
  let busy=false;
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G) return null; for(const q of S.expire(G)) S.onMissed(GM,q);
    const q=S.due(G); if(!q) return null; busy=true; return S.prompt(GM,q).finally(()=>{ busy=false; }); };
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  S.prompt=async function(GM,q){ const G=GM.G; let k=1; GM.sceneBegin();
    try{ k=await GM.choose([{t:(q.verb||'出發')+'：'+q.title,hint:q.place+'　'+hm(q.h)+(q.travel?'　'+q.travel:'')},{t:'晚一點（20 分鐘後再提醒）'},{t:q.no||'不去了'}]); } finally { GM.sceneEnd(); }   /* verb：視訊是「接起來」；no：「不去了」以外的說法 */
    if(k===1){ q.ask=t(G.day,G.hour)+1/3; return 'later'; }
    if(k!==0){ q.state='missed'; S.onMissed(GM,q); return 'no'; }
    await S.go(GM,q); return 'go'; };
  /* 出發：轉場 → 抵達（不早於約好的時間）→ 演事件（深色底開始，避免看到原本的 3D 畫面）→ 時間往後 → 回到原本的地方 */
  S.go=async function(GM,q,o){ const G=GM.G, ev=evOf(q.ev), tr=S.trip(G,q,o&&o.fromHome);   /* o.fromHome：從家裡的選單出發（選單先把「在家」關掉了）*/
    if(!q.goto&&ev&&typeof EVENTS!=='undefined'){ if(GM.autosave) GM.autosave(); running.add(q.id); } else q.state='done';   /* 出發前先存一次（使用者 2026-10-16：去政大找可昕跳回標題、自動存檔在出發前很久，要一直重來）；演完才標 done */
    if(q.goto){ await GM.fade(true); if(GM.titleCard) await GM.titleCard(q.title,tr.travel,2400); const arrive=Math.max(t(G.day,G.hour)+tr.travelH, t(q.day,q.h)-(q.early||0)); G.day=Math.floor(arrive/24); G.hour=arrive-G.day*24; if(GM.updateHUD) GM.updateHUD();
      if(GM.enter) await GM.enter(q.goto.zone,{x:q.goto.x,z:q.goto.z,yaw:q.goto.yaw||0,lv:q.goto.lv|0}); await GM.fade(false); if(GM.autosave) GM.autosave(); return true; }   /* goto：只帶到那個地點（3D 的事件在那裡等，例：v0 E12 醉月湖；AA_154 A32）；early＝比 h 早幾小時到 */
    if(!ev||typeof EVENTS==='undefined') return false;
    await GM.fade(true); if(GM.titleCard) await GM.titleCard(q.title,tr.travel,2400);
    const arrive=q.arrived?t(G.day,G.hour):Math.max(t(G.day,G.hour)+tr.travelH, t(q.day,q.h)); G.day=Math.floor(arrive/24); G.hour=arrive-G.day*24; if(GM.updateHUD) GM.updateHUD();
    q.arrived=true; if(GM.autosave) GM.autosave();   /* 到了再存一次：中途被踢回標題，讀檔就是到了那裡、重新演這一段（不用再搭一次車）*/
    if(typeof ADV!=='undefined'){ ADV.begin({background:ev.background||'dark'}); }
    await GM.fade(false); if(typeof ev.beforeOuting==='function') await ev.beforeOuting(G,GM,q);   /* 演之前在同一個畫面先做的事（例：可昕的視訊讀書先選讀哪一科，BB_95 9-5）*/
    try{ await EVENTS.run(ev); } finally { running.delete(q.id); } q.state='done'; delete q.arrived; if(typeof ev.afterOuting==='function') await ev.afterOuting(G,GM,q);   /* 演完以後在同一個畫面接著做的事（例：可昕的視訊之後發成績單）*/
    if((ev.participants||[]).includes('kexin')&&typeof STORY!=='undefined'&&STORY.neededMiss) await STORY.neededMiss(GM,{name:SOCIAL.displayName('kexin'),charId:'kexin'},'kexin');   /* 主線 4：上週的訊息沒回，見面的時候帶過一句（BB_97 11-2）*/
    if((ev.participants||[]).includes('kexin')&&typeof STORY!=='undefined'&&STORY.ladNext){ const md=q.verb==='接起來'||q.place==='視訊'?'video':'meet', st=STORY.ladNext(G,'kexin',md);   /* 可昕的閒聊階梯（BB_130：只在見面／視訊推進，路上不推進）：演完那一段接著聊一層；今天推進過或條件不到就不聊（不用短招呼）*/
      if(st) await STORY.ladPlay(GM,{name:SOCIAL.displayName('kexin'),charId:'kexin'},'kexin',st); }
    await GM.fade(true); GM.advance(ev.hours||2); await GM.fade(false); if(GM.caption&&!(o&&o.fromHome&&typeof HOME!=='undefined'&&(HOME.livesHome?HOME.livesHome(G):HOME.baseMode&&HOME.baseMode(G)))) GM.caption('',q.back||'回到台大。',2400);   /* 休學後從家裡出發的：回家（home3d.js 的選單接著）*/
    if(GM.autosave) GM.autosave(); return true; };
  return S;
})();
