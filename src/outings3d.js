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
  /* 2D 背景（AA_112 3-1：政大四個＋停車場；河濱和子晴的河堤夜景共用）：image 是圖片路徑，還沒有圖＝null（深色底＋地點字幕）*/
  S.BG={ car:{label:'車上',image:null}, nccu_gate:{label:'政大・校門口',image:null}, nccu_food:{label:'政大・山下的小吃街',image:null}, nccu_river:{label:'政大・河堤',image:null},
    nccu_lib:{label:'政大・圖書館',image:null}, nccu_park:{label:'政大・停車場',image:null}, riverside:{label:'河濱',image:null}, dorm_roof:{label:'宿舍頂樓',image:null}, video:{label:'視訊',image:null}, gongguan_luwei:{label:'公館・滷味攤',image:null},
    ntu_soc:{label:'台大・社科院門口',image:null}, ntu_linze:{label:'台大・霖澤館前',image:null}, ntu_avenue:{label:'台大・椰林大道',image:null},
    trip_sea:{label:'海邊',image:null}, trip_oldtown:{label:'老街',image:null}, trip_mountain:{label:'山上',image:null},
    chiayi_living:{label:'嘉義・老家的客廳',image:null}, chiayi_balcony:{label:'嘉義・老家的陽台',image:null},
    wenzhou_tutoring:{label:'溫州街・課輔班門口',image:null}, yongkang_curry:{label:'永康街・咖哩店',image:null},
    gongguan_cinema:{label:'公館・二輪戲院',image:null}, soymilk_shop:{label:'豆漿店',image:null} };   /* 春假 K8 的三個目的地（BB_96 9-5；交接包 v2 C9）、嘉義老家（AA_12 主線 2；C2）：圖還沒有＝深色底＋地點字幕 */   /* K2 可昕來台大（BB_95 9-3 的最小版本：依序換 2D 背景；之後可以換成遊戲校園的畫面）*/
  S.bg=id=>{ const b=S.BG[id]; return b&&b.image?{image:b.image}:'dark'; };
  S.rec=G=>{ if(!Array.isArray(G.outings)) G.outings=[]; return G.outings; };
  S.get=(G,id)=>S.rec(G).find(q=>q.id===id)||null;
  /* 排一個出遊；同一個 id 只排一次（讀檔、重進區域不會重複）*/
  S.plan=function(G,o){ const L=S.rec(G); if(L.some(q=>q.id===o.id)) return false; L.push(Object.assign({state:'planned',ask:null,travelH:0.5},o)); return true; };
  const t=(day,h)=>day*24+h;
  /* 該問了：該出發的時間（約好的時間減車程）前 15 分鐘起、約好的時間後 45 分鐘內；「晚一點」之後等到 ask 那個時間 */
  S.due=function(G){ const now=t(G.day,G.hour); return S.rec(G).find(q=>q.state==='planned'&&now>=t(q.day,q.h)-(q.travelH||0)-0.25&&now<=t(q.day,q.h)+0.75&&(q.ask==null||now>=q.ask))||null; };
  /* 過了時間（後 45 分鐘以上）還沒出發＝missed */
  S.expire=function(G){ const now=t(G.day,G.hour), out=[]; for(const q of S.rec(G)) if(q.state==='planned'&&now>t(q.day,q.h)+0.75){ q.state='missed'; out.push(q); } return out; };
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
  S.go=async function(GM,q){ const G=GM.G, ev=evOf(q.ev); q.state='done'; if(!ev||typeof EVENTS==='undefined') return false;
    await GM.fade(true); if(GM.titleCard) await GM.titleCard(q.title,q.travel||'',2400);
    const arrive=Math.max(t(G.day,G.hour)+(q.travelH||0), t(q.day,q.h)); G.day=Math.floor(arrive/24); G.hour=arrive-G.day*24; if(GM.updateHUD) GM.updateHUD();
    if(typeof ADV!=='undefined'){ ADV.begin({background:ev.background||'dark'}); }
    await GM.fade(false); if(typeof ev.beforeOuting==='function') await ev.beforeOuting(G,GM,q);   /* 演之前在同一個畫面先做的事（例：可昕的視訊讀書先選讀哪一科，BB_95 9-5）*/
    await EVENTS.run(ev); if(typeof ev.afterOuting==='function') await ev.afterOuting(G,GM,q);   /* 演完以後在同一個畫面接著做的事（例：可昕的視訊之後發成績單）*/
    await GM.fade(true); GM.advance(ev.hours||2); await GM.fade(false); if(GM.caption) GM.caption('',q.back||'回到台大。',2400);
    if(GM.autosave) GM.autosave(); return true; };
  return S;
})();
