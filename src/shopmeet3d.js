/* ===== 店員的進門招呼、吃飯時間在店裡遇到同學的第一句（SHOP-LIFE-AA826-1112；USER_WANTS X356 的後續；AA_826 企劃線 f231f0514）=====
   字：src/data/shop_meet_lines.js（SHOP_MEET_LINES，tools/shops/import_shop_meet.py 從 AA_826_shop_backfill_1.json 匯入）和花序原本的 src/data/flower_notes_text.js（AA_792 staff.greet）。
   **這支不寫任何一句台詞。** 人怎麼排進店裡在 src/shoplife3d.js（那一支照規定不能有台詞，所以說話的部分放這裡）；index.html 裡排在 shoplife3d.js 前面（它後面不能再放別的模組，別的測試鎖住了）。

   1 店員的進門招呼（S.greetTick，STORY.TICKS）——AA_826 staff_greet＋lawww_answers 第 2 點：
     哪幾間：山嵐書店 xs_shanlan、大步球鞋 xs_dabu、好拍運動 xs_haopai（老闆）、新生運動廣場 xs_xsports（AA_826 各三句）、花序 flower_notes（AA_792 staff.greet 三句，花藝師）。
       越好吃小館、客居雲南的進門句在 src/gg3shops3d.js（GG3.enterLine，原本那一套：G.flags.GG3_DOOR），這裡不重複做。
     什麼時候：走進店裡、店開著、店裡有店員（E.npcs 有 clerk：SHOPLIFE.placeClerk 或那間店自己放的）、沒有別的場景在演、今天這間還沒說過、不是約在這間店的那一趟（GG3.alone 同一把尺）。
     說哪一句：一天一次、三句輪流（稿 _meta：「進門招呼一天一次、三句輪流」）。記在 G.flags.SHOP_GREET＝{區域: [那天, 說過幾次]}；舊存檔沒有＝都還沒說過（從第一句開始），不用遷移。
       花序的三句和櫃檯買花前那一句是同一組（FNS.greet 輪流）：進門說了一句，到櫃檯就是下一句，不會連著聽到同一句。

   2 吃飯時間在店裡遇到同學的第一句（S.mealHello，STORY.PRE_TALK）——AA_826 meal_hello：
     誰：SHOPLIFE.sched 排進店裡吃飯的人（作息那一筆有 shopMeal、區域＝玩家現在這間店）；稿有句子的十位（以安、學姊、語彤、沛珊、柏翰、明軒、芯慈、阿哲、Alison、宥辰——宥辰 f231f0514 補的）。
     分手後的前任、還沒回到朋友（SHOPLIFE.exBlock；AA_826 meal_hello.note）＝SHOPLIFE 本來就不排她進店裡，這裡再擋一次（她照別的作息剛好在店裡也不說這一句）。
     條件：朋友以上（SOCIAL.stage ≥ FRIEND；稿 note：「朋友以上才出；還不認識的不出」）。還不認識的走 story3d.js 原本的認識那一場，輪不到 PRE_TALK。
     說哪一句：每人兩句輪流；學姊交往中（G.flags.dating_heroine_05）用 heroine_05_dating 那一組。（）包起來的那一句是旁白。說完照原本的「和他說話」繼續（PRE_TALK 後面那一串）。
     一次見面只說一次：記在 G.flags.SHOP_MEAL_HI＝{人物: [那天, 哪一餐, 說過幾次]}；同一天同一餐再點他＝不再說。舊存檔沒有＝都還沒說過。
   存檔：只多 G.flags.SHOP_GREET、SHOP_MEAL_HI（都有預設：沒有＝還沒發生）。
   測試：node tests/shop_meet_aa826_1112_unit.js */
'use strict';
const SHOPMEET=(function(){
  const S={};
  const X=()=>typeof SHOP_MEET_LINES!=='undefined'?SHOP_MEET_LINES:null;
  const FT=()=>typeof FLOWER_NOTES_TEXT!=='undefined'&&FLOWER_NOTES_TEXT&&FLOWER_NOTES_TEXT.staff?FLOWER_NOTES_TEXT.staff:null;
  const hr=G=>((((+G.hour||0)%24)+24)%24);
  const F_=G=>G.flags||(G.flags={});
  const obj=(F,k)=>{ const v=F[k]; if(!v||typeof v!=='object'||Array.isArray(v)) F[k]={}; return F[k]; };
  const narr=t=>/^（[\s\S]*）$/.test(t);
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, Dl=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(Dl&&(Dl.active||(Dl.busyDepth|0)>0)); };

  /* ---------- 1 店員的進門招呼 ---------- */
  S.FLOWER='flower_notes';
  /* 這間店的招呼：{who, lines}；沒有＝這裡不管 */
  S.greetOf=function(zone){ const D=X(); if(D&&D.staffGreet&&D.staffGreet[zone]) return D.staffGreet[zone];
    if(zone===S.FLOWER){ const T=FT(); if(T&&Array.isArray(T.greet)&&T.greet.length) return {who:T.who,lines:T.greet,flower:true}; } return null; };
  S.greetZones=function(){ const D=X(), out=D&&D.staffGreet?Object.keys(D.staffGreet):[]; if(S.greetOf(S.FLOWER)) out.push(S.FLOWER); return out; };
  S.isOpen=(k,G)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(k,G.hour,G.day);
  S.alone=(G,k)=>typeof GG3==='undefined'||!GG3.alone||GG3.alone(G,k);
  S.clerkHere=GM=>!!(GM&&GM.E&&(GM.E.npcs||[]).some(n=>n&&n.clerk));
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shopmeet3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.greetDue=function(GM){ const G=GM&&GM.G; if(!G||!S.greetOf(G.zone)||!S.isOpen(G.zone,G)||!S.clerkHere(GM)) return false; const r=G.flags&&G.flags.SHOP_GREET, v=r&&typeof r==='object'?r[G.zone]:null;
    if(Array.isArray(v)&&v[0]===G.day) return false; return S.alone(G,G.zone); };
  /* 這一次說哪一句（輪流；花序和櫃檯那一句共用 FNS.greet 的順序）*/
  S.greetPick=function(G,zone){ const g=S.greetOf(zone), r=obj(F_(G),'SHOP_GREET'), v=Array.isArray(r[zone])?r[zone]:[null,0], n=v[1]|0; r[zone]=[G.day,n+1];
    if(g.flower&&typeof FNS!=='undefined'&&FNS.greet) return FNS.greet(); return g.lines[n%g.lines.length]; };
  S.greet=async function(GM){ const G=GM.G, zone=G.zone, g=S.greetOf(zone), t=S.greetPick(G,zone);
    GM.sceneBegin(); try{ await GM.say({name:g.who},t); } finally { GM.sceneEnd(); } return t; };
  S.greetTick=function(GM){ const G=GM&&GM.G; if(!G||busy||GM.titleIdle||!S.greetOf(G.zone)) return false; if(!sceneFree(GM)||!S.greetDue(GM)) return false;
    busy=true; S.greet(GM).catch(e=>console.warn('SHOPMEET.greet',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 2 吃飯時間在店裡遇到同學的第一句 ---------- */
  S.MIN_STAGE='FRIEND';
  /* 他現在是不是 SHOPLIFE 排進這間店吃飯的（回那一餐的 id；不是＝null）*/
  S.mealSlot=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; let e=null; try{ e=STORY.schedEnt(c,G); }catch(err){ e=null; }
    return e&&e.shopMeal&&e.zone===G.zone?e.shopMeal:null; };
  S.friendUp=function(id){ if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!Array.isArray(SOCIAL.STAGES)) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(S.MIN_STAGE); };
  S.helloSet=function(G,id){ const D=X(), H=D&&D.mealHello&&D.mealHello[id]; if(!H) return null; return (H.dating&&G.flags&&G.flags['dating_'+id])?H.dating:H.base; };
  S.helloDue=function(G,id){ if(!G||!S.helloSet(G,id)) return null; if(typeof SHOPLIFE!=='undefined'&&SHOPLIFE.exBlock&&SHOPLIFE.exBlock(G,id)) return null;   /* 分手後的前任：不說（AA_826 meal_hello.note）*/ const slot=S.mealSlot(G,id); if(!slot||!S.friendUp(id)) return null; const r=G.flags&&G.flags.SHOP_MEAL_HI, v=r&&typeof r==='object'?r[id]:null;
    if(Array.isArray(v)&&v[0]===G.day&&v[1]===slot) return null; return slot; };
  S.mealHello=async function(GM,who,id){ const G=GM&&GM.G, slot=S.helloDue(G,id); if(!slot) return false; const L=S.helloSet(G,id), r=obj(F_(G),'SHOP_MEAL_HI'), n=Array.isArray(r[id])?(r[id][2]|0):0, t=L[n%L.length];
    r[id]=[G.day,slot,n+1]; await GM.say(narr(t)?null:who,t); return true; };

  /* ---------- 掛上去 ---------- */
  S.install=function(){ if(typeof STORY==='undefined'||!X()) return false;
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.greetTick)) STORY.TICKS.push(S.greetTick);
    if(Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.mealHello)) STORY.PRE_TALK.push(S.mealHello);
    return true; };
  S._reset=()=>{ busy=false; };
  S.install();
  return S;
})();
