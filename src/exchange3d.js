/* 交換的最小可玩流程（使用者 2026-10-17 21:3x，D99 第三優先）：申請交換 → 出發 → 抵達美國 → 進入公寓 → 外出 → 回公寓睡覺 → 推進隔天。
   使用者：「先用現有素材或臨時場景也可以，不要再讓美術成為系統開發的前置條件。」
   - 路線：不讓玩家選（1A-02，AA_315；BB_204）——志願表截止 2027-11-18 12:00 照交往狀態定（STORY.routeDecide：學姊＝美國、以安＝日本、其他＝留在臺灣）。原本宿舍房間的「交換申請（志願表）」四選一拿掉了。
   - 出發：美國路線 2028-08-02（STORY.ROUTE_DATES.US.dep）早上 6:00 以後，人在哪裡都先演：字卡 → 桃園機場出境大廳（07:00）→ 「登機」→ 字卡（09:30 起飛、舊金山轉機約 19 小時，AA_370 M4）→ 當地 16:30 抵達美國。
   - 美國：公寓（床「睡覺」＝和宿舍一樣的睡覺選單；「出門」）、社區（「回公寓」）。在美國的時候台灣的課不排（classes3d.js dayItems）、凌晨 2:30 走回公寓睡（story3d.js forceHome）、
     手機「地點」只列公寓和社區（game3d.js）。時間＝當地時間（手機的台灣時差另外照 STORY.tzOffset）。
   - 場景：LAWWW2-C 的正式區域（src/us3d.js：airport_dep、airport_arr、us_outside、us_apartment、us_shared、us_market、us_asian_market；2026-10-17 3bff5ef4 接進來）載入後同名蓋過這裡的臨時場景（這個檔先載入，正式的後載入）。
     還沒接的互動（現在照區域自己的預設：進門、看告示）：usShared（US2 的爐子、冰箱、高腳椅）、usClub（會所）、usMarket（採買）、airportBoard（寒暑假出國）。
   - 返台（1A-09，AA_318；AA-C bf349b96 更正；AA_340 S10）：當地 12/21 23:55 起飛（平常由 r2y4a3d.js 12/16 離開那一週帶過來；人在美國、過了這個時間＝保底）→ 字卡（舊金山起飛約 14 小時）→ 臺灣 12/23 清晨 05:40 落地、桃園入境大廳（airport_arr）→ 上午回家睡到下午 → 傍晚 STORY.roomY4FromAirport（從家裡出發，19:00 到 409、拆箱）。
   - 還沒有的（之後照 AA、BB 的規格接）：志願表、送機、US0～US4、美國的課、出遊、人物。測試：node tests/exch_min_unit.js、tests/room_y4_unit.js
   - E08（2026-10-27）：寒暑假出國、日本路線出發也走這個出境大廳（下面 S.airGo／S.airBoard；src/vac3d.js、src/y34b3d.js 登記 S.AIR）。測試：node tests/e08_airport_unit.js、tests/e08_hall_unit.js（AA_478） */
'use strict';
const EXCH=(function(){
  const S={};
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['exchange3d:_busy']=()=>{ S._busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h;
  const US_ZONES=['us_apartment','us_outside','us_shared','us_market','us_asian_market','us_campus','us_lawlib','us_market_street','us_lawlib_2f','us_bed_c'];   /* 法圖 2F 書庫、學姊的房間（臥室 C）也算在美國（LAWWW2-B 10-24）*/   /* 超市街（LAWWW2 US-MARKET-STREET 2026-10-21）也算在美國 */   /* 美國校園、法學院圖書館（LAWWW2-C US-CAMPUS-WIRE-1018）也算在美國 */   /* LAWWW2-C 的正式區域（src/us3d.js 3bff5ef4）：C 棟 208、大超市、對面的亞洲超市也算在美國 */
  S.US_ZONES=US_ZONES;
  S.inUS=G=>!!G&&US_ZONES.includes(G.zone);
  /* ---------- 申請：沒有選單了（1A-02；路線在 STORY.routeDecide）---------- */
  S.applyOpen=()=>false;
  /* ---------- 出發 ---------- */
  S.departAt=function(G){ if(!G||!G.flags||G.flags.US_DEPARTED||typeof STORY==='undefined'||STORY.route(G)!=='US') return null; const d=DK(STORY.ROUTE_DATES.US.dep); return d==null?null:T(d,6); };
  S.departDue=function(G){ const t=S.departAt(G); return t!=null&&T(G.day,G.hour)>=t&&!G.flags.US_ARRIVED; };
  S.depart=async function(GM){ const G=GM.G, F=G.flags; if(!S.departDue(G)) return false; S._busy=true; F.US_DEPARTED=true; GM.sceneBegin();
    try{ if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ HOME.rec(G).at=false; } if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
      await GM.fade(true); const d=CALENDAR.dateOf(G.day); if(GM.titleCard) await GM.titleCard(d.y+' 年 '+d.m+' 月 '+d.d+' 日','出發｜桃園機場第二航廈',2400);
      if(G.hour<S.AIRPORT_H){ G.hour=S.AIRPORT_H; if(GM.E) GM.E.hour=G.hour; } }   /* 07:00 到機場（AA_291 第 2 節；原本一律 13:00，AA_370 M4）*/
    finally{ GM.sceneEnd(); }
    try{ await GM.enter('airport_dep',S.SPAWN.airport_dep); F.US_AIRPORT_AT=T(G.day,G.hour); } finally { S._busy=false; } if(GM.autosave) GM.autosave(); return true; };   /* US_AIRPORT_AT：進出境大廳的時間，一個小時以後自動登機（AA_370 H2，S.tick）*/
  /* 登機（AA_291 第 2、7 節、AA_213；AA_370 M4）：臺灣 09:30 起飛、舊金山轉機、飛 19 小時；印第安納夏令時間比臺灣慢 12 小時（STORY.tzOffset）→ 同一天當地 16:30 落地（19:00 到巴士站＝r2y4a3d.js 的 US1）。
     進出境大廳就登機（H2：沒有「搭車離開」、一個小時自動登機）；09:30 以前登機的等到 09:30 起飛，舊存檔拖到更晚才登機的從登機那一刻算（字卡照 24 小時制寫，不會有「25:00」）*/
  S.AIRPORT_H=7; S.TAKEOFF_H=9.5; S.FLY_HOURS=19;
  S.fly=async function(GM){ const G=GM.G, F=G.flags; S._busy=true; try{ GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('飛往美國','舊金山轉機到印第安納　約 '+S.FLY_HOURS+' 小時',2600);
      const d0=DK(STORY.ROUTE_DATES.US.dep), t0=T(G.day,G.hour), tk=d0!=null?Math.max(t0,T(d0,S.TAKEOFF_H)):t0, tz=(STORY.tzOffset&&STORY.tzOffset(G,G.day))||-12;
      const h=tk+S.FLY_HOURS+tz-G.day*24; G.hour=h; if(GM.E) GM.E.hour=G.hour; F.US_ARRIVED=true; F.US_ARRIVED_DAY=G.day;   /* h 超過 24＝隔天凌晨（遊戲的慣例：睡覺才換日）*/
      const hm=Math.round((((h%24)+24)%24)*60); if(GM.titleCard) await GM.titleCard('抵達','美國印第安納　當地時間 '+String(Math.floor(hm/60)%24).padStart(2,'0')+':'+String(hm%60).padStart(2,'0'),2200); }
    finally{ GM.sceneEnd(); }
    if(typeof S.onArrive==='function'){ let r=false; try{ r=await S.onArrive(GM); }catch(e){ console.warn('EXCH.onArrive',e); } if(r){ if(GM.autosave) GM.autosave(); return true; } }   /* AA_327 2-Y4-16 US1（src/r2y4a3d.js）：巴士站 → 超市 → 公寓 */
    await GM.enter('us_outside',S.SPAWN.us_outside); if(GM.toast) GM.toast('公寓在社區的另一頭。',3000); if(GM.autosave) GM.autosave(); return true; } finally { S._busy=false; } };
  /* ---------- 返台（美國路線 2028-12-23；AA_318 1A-09、AA_144 X3、AA_291 第 5 節、AA_340 S10）：當地 12/21 23:55 以後、人在美國 → 字卡 → 臺灣 12/23 清晨 05:40 落地 → 回家 → 傍晚去宿舍 409 ---------- */
  S.returnAt=function(G){ if(!G||!G.flags||!G.flags.US_ARRIVED||G.flags.US_RETURNED!=null||typeof STORY==='undefined'||STORY.route(G)!=='US') return null; const d=DK(STORY.ROUTE_DATES.US.ret); return d==null?null:T(d-2,23+55/60); };   /* AA_340 S10：12/21 23:55 起飛（舊金山；沒交往的 17:00 印第安納波利斯起飛、轉同一班）。平常由 r2y4a3d.js 的 12/16 離開那一週帶過來（force），這裡是保底 */
  S.returnDue=function(G){ const t=S.returnAt(G); return t!=null&&S.inUS(G)&&T(G.day,G.hour)>=t; };
  S.returnHome=async function(GM,o){ const G=GM.G, F=G.flags; if(!(o&&o.force&&S.returnAt(G)!=null)&&!S.returnDue(G)) return false;   /* force：AA_327 2-Y4-22 舊金山／布魯明頓那一週演完、12/21 起飛（src/r2y4a3d.js）*/ const d=DK(STORY.ROUTE_DATES.US.ret); F.US_RETURNED=d; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard('飛回臺灣',(F.US_TRIP_MODE==='bloom'?'舊金山轉機':'舊金山起飛')+'　約 14 小時',2600);   /* AA_452 1-7：挽回中那天中午人還在布魯明頓＝轉機 */
      if(STORY.travelOvernight) STORY.travelOvernight(GM,d,5+40/60); if(GM.titleCard) await GM.titleCard('抵達','桃園機場　清晨 05:40',2200);
      if(typeof Z3==='undefined'||!Z3.ZONES||Z3.ZONES.airport_arr) await GM.enter('airport_arr',Object.assign({},(typeof US3!=='undefined'&&US3.SPAWN&&US3.SPAWN.airport_arr)||S.SPAWN.airport_arr||{x:0,z:0,yaw:Math.PI}),{noFade:true,deferStory:true,noAutosave:true});   /* AA_340 S10：落地在桃園第二航廈的入境大廳（us3d.js 的 airport_arr）；入境大廳那一段在 onLand（r2y4a3d.js）*/
      if(typeof S.onLand==='function'){ try{ await S.onLand(GM); }catch(e){ console.warn('EXCH.onLand',e); } }   /* AA_327 2-Y4-22：入境大廳、上午回家（src/r2y4a3d.js）*/   /* 時間換回臺灣時間（日期往後到 12/23）；AA-C bf349b96：舊金山 12/21 23:55 起飛、12/23 清晨 05:40 落地（AA_291 第 5 節、AA_327 2-Y4-22）*/
      if(G.hour<17.5&&GM.advance) GM.advance(17.5-G.hour); }   /* 上午回家睡到下午（入境大廳那一段是 AA_327 2-Y4-22，第 2 輪事件包）；傍晚從家裡出發，19:00 到 409（roomY4FromAirport 再 +1.5 小時）*/
    finally{ GM.sceneEnd(); }
    if(STORY.roomY4FromAirport) return STORY.roomY4FromAirport(GM);
    await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); if(GM.autosave) GM.autosave(); return true; };
  /* ---------- 寒暑假出國、日本路線出發也從 3D 的出境大廳走（E08；使用者 10-16 21:49「3d做機場 旅館 街景 這種都我給妳CG」、10-17 00:0x「機場的也是阿」）----------
     美國那一趟（上面 S.depart／S.fly）的做法給別的系統用：
       S.airGo(GM,rec)：（字卡：rec.card＝[標題, 小字]，沒有就不出）→ 出境大廳 airport_dep（同行的人 rec.with 跟在旁邊）→ G.flags.AIR_DEP＝{k, at:進大廳的時間, with, q…}；
       「登機」（us3d.js 出境大廳安檢入口的 airportBoard）或進大廳一個小時以後自動登機（同美國，AA_370 H2）→ S.airBoard → S.AIR[k].board(GM,rec)＝原本的流程接著演（2D）。
       S.AIR 由各系統登記：'vac'＝寒暑假出國（src/vac3d.js）、'jp'＝日本路線和以安一起出發（src/y34b3d.js）。S.AIR[k].hall(GM,rec)（有的話）＝進大廳就演的那一幕（演完才存檔）。
       rec.stand（S.airStand）＝站在大廳另一頭、不跟著走的人（日本路線挽回中的以安，AA_478 第 4 節）。S.AIR[k].resume(GM)（有的話）＝每一格先問：登機以後還在途中的存檔要不要接著演（S.tick）。
     等登機的時候：大廳的「搭車離開（回台北）」拿掉、不能用手機回臺北的家（同美國那一趟出發以後一定飛）；人不在大廳了（手機「地點」、讀到別的區域）＝直接登機。
     存檔：G.flags.AIR_DEP（沒有＝沒有要搭的飛機；舊存檔都沒有）。測試：node tests/e08_airport_unit.js */
  S.AIR={};
  S.airPending=G=>!!(G&&G.flags&&G.flags.AIR_DEP&&typeof G.flags.AIR_DEP==='object');
  S.airZoneOk=()=>typeof Z3==='undefined'||!Z3.ZONES||!!Z3.ZONES.airport_dep;   /* 沒有 Z3（單元測試）照 3D 的流程走；遊戲裡 us3d.js／上面的臨時場景一定有 */
  /* 同行的人在大廳跟著你（rec.with；不能搭話、不揮手；換區域就沒了，讀檔回到大廳再放一次）。
     rec.stand＝[{id, spot}]：站在大廳另一頭的人——不跟著走、不能搭話、不揮手（AA_478 第 4 節：日本路線挽回中的以安，站在另一排報到櫃台前）。
     spot 是 S.AIR_SPOT 的位置（照 us3d.js 的正式大廳 AIRPORT_T2_LAYOUT.dep；站不到（臨時場景、配置改了）＝不放，同原本完全不在）*/
  S.AIR_SPOT={ checkinA:{x:-22.0,z:2.6,yaw:-Math.PI/2} };   /* 報到島 A（x −31.2～−22.8）東側的櫃台前、排隊欄杆（x −21.2，z 到 3）的出口那一頭，面向櫃台：從正中間的入口、大廳南側看得到；離安檢入口、下車處都遠 */
  S.airMates=function(GM){ const G=GM.G, E=GM.E, rec=G.flags.AIR_DEP, W=rec&&Array.isArray(rec.with)?rec.with:[], St=rec&&Array.isArray(rec.stand)?rec.stand:[];
    if(!rec||(!W.length&&!St.length)||!GM.spawnCharacter||!E||!E.player) return 0; if(S._airMatesN===GM.enterN) return 0; S._airMatesN=GM.enterN;
    const P=E.player.obj.position, OFF=[[1.2,0.8],[-1.2,0.8],[0,1.6],[1.6,-0.4]]; let k=0;
    W.forEach((id,i)=>{ if(GM.npc&&GM.npc[id]) return; for(const [dx,dz] of OFF.slice(i)){ const x=P.x+dx, z=P.z+dz; if(E.canStand&&!E.canStand(x,z,0.3,0)) continue; const n=GM.spawnCharacter(id,x,z,{yaw:E.player.obj.rotation.y,talk:null,talkLabel:null,greet:false,beh:'follow',extra:{followOff:1.1+0.6*Math.floor(i/2),side:i%2?-1:1}}); if(n){ n.frozen=false; k++; } break; } });   /* 跟在旁邊（engine3d.js followStep）：第一個在右邊、第二個在左邊、第三個右邊遠一點 */
    St.forEach(s=>{ const p=s&&S.AIR_SPOT[s.spot]; if(!p||!s.id||(GM.npc&&GM.npc[s.id])) return; if(E.canStand&&!E.canStand(p.x,p.z,0.3,0)) return;
      const n=GM.spawnCharacter(s.id,p.x,p.z,{yaw:p.yaw,talk:null,talkLabel:null,greet:false,beh:'idle'}); if(n){ n.frozen=true; n.airStand=true; k++; } });   /* frozen：不走動、不轉身 */
    return k; };
  /* 演完大廳那一段才放站在另一頭的人（EVENTS.run 會把參與的人轉向玩家、鏡頭對著她：先放的話鏡頭會隔著整個大廳對過去）：記進 AIR_DEP（存檔、讀檔照放）*/
  S.airStand=function(GM,list){ const rec=GM&&GM.G&&GM.G.flags&&GM.G.flags.AIR_DEP; if(!rec||!Array.isArray(list)||!list.length) return 0; rec.stand=list.slice(); S._airMatesN=null; return S.airMates(GM); };
  /* 等登機：「搭車離開」拿掉（同美國那一趟，us3d.js 只在 US_DEPARTED 的時候不放）*/
  S.airHall=function(GM){ const E=GM.E; if(!E||!Array.isArray(E.interactables)) return; for(let i=E.interactables.length-1;i>=0;i--){ const it=E.interactables[i]; if(it&&it.exit&&!it.airportBoard&&!it.exchFly) E.interactables.splice(i,1); } S.airMates(GM); };
  S.airGo=async function(GM,rec){ const G=GM.G, F=G.flags; S._busy=true;
    try{ GM.sceneBegin();
      try{ if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) HOME.rec(G).at=false; if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
        await GM.fade(true); if(rec.card&&GM.titleCard) await GM.titleCard(rec.card[0],rec.card[1]||'',2400);
        if(rec.arrive!=null&&rec.arrive>T(G.day,G.hour)+1e-6){ const d=Math.floor(rec.arrive/24+1e-9); if(d>G.day){ G.day=d; if(GM.syncWeekday) GM.syncWeekday(); } G.hour=rec.arrive-G.day*24; if(GM.E) GM.E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); } }   /* 到機場的時間（同 OUT.go：出發的時間＋車程，不早於約好的時間）*/
      finally{ GM.sceneEnd(); }
      const r=Object.assign({},rec,{at:T(G.day,G.hour)}); delete r.card; delete r.arrive; delete r.noSave; F.AIR_DEP=r; S._airMatesN=null;
      await GM.enter('airport_dep',Object.assign({},S.SPAWN.airport_dep),{noAutosave:true}); S.airHall(GM);
      const A=S.AIR[r.k]; if(A&&typeof A.hall==='function'){ try{ await A.hall(GM,r); }catch(e){ console.warn('EXCH.airGo hall',r.k,e); } }   /* 進大廳就演的那一幕（S.AIR[k].hall；AA_478 第 2、3 節：C05、T02、C08 的「出發」、T03 的兩句，2D 疊在模糊的大廳上）：演的時候 _busy，不會自動登機 */
      if(!rec.noSave&&GM.autosave) GM.autosave(); }   /* 演完才存（讀檔不會再演一次）；noSave：進大廳以後馬上要演的（日本路線的報到櫃台那一段，演完 EVENTS.run 自己存）*/
    finally{ S._busy=false; }
    return true; };
  S.airBoard=async function(GM){ const G=GM.G, F=G.flags, rec=F.AIR_DEP; if(!S.airPending(G)||S._busy) return false; const A=S.AIR[rec.k]; F.AIR_DEP=null;   /* 先清掉：演到一半存檔、讀檔也不會再登機一次 */
    if(!A||typeof A.board!=='function'){ console.warn('EXCH.airBoard：沒有登記',rec.k); return false; }
    S._busy=true; try{ await A.board(GM,rec); } catch(e){ console.warn('EXCH.airBoard',rec.k,e); } finally{ S._busy=false; } return true; };
  S.airTick=function(GM){ const G=GM.G; if(!S.airPending(G)||S._busy||(GM.isEntering&&GM.isEntering())) return false;
    if(G.zone!=='airport_dep'||(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))){ void S.airBoard(GM); return true; }   /* 人不在大廳了：直接登機（同美國那一趟的舊存檔）*/
    S.airHall(GM);
    if(T(G.day,G.hour)>=(+G.flags.AIR_DEP.at||0)+1){ void S.airBoard(GM); return true; }   /* 進大廳一個小時以後自動登機（AA_370 H2 同一個做法）*/
    return false; };
  /* ---------- 互動、每幀 ---------- */
  S.interact=async function(GM,it){ if((it.exchFly||it.airportBoard)&&S.airPending(GM.G)){ await S.airBoard(GM); return true; }   /* 寒暑假出國、日本路線：安檢入口「登機」（E08）*/
    if(it.exchFly){ await S.fly(GM); return true; } return false; };
  S.tick=function(GM){ const G=GM.G, E=GM.E; if(!G||!G.flags) return false;
    if(!S._busy) for(const k in S.AIR){ const A=S.AIR[k]; if(A&&typeof A.resume==='function'&&A.resume(GM)) return true; }   /* 登機以後、還在途中存的檔（S.AIR[k].resume：寒暑假出國＝接著演那一趟，AA_478 第 7 節）*/
    if(S.airTick(GM)) return true;   /* 寒暑假出國、日本路線在出境大廳等登機（E08）*/
    if(S.departDue(G)&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))){ void S.depart(GM); return true; }   /* 在家的在 home3d.js 的 loop 裡 */
    if(S.returnDue(G)){ void S.returnHome(GM); return true; }   /* 美國路線返台（1A-09）*/
    { const F=G.flags; if(!S._busy&&F.US_DEPARTED&&!F.US_ARRIVED&&STORY.route(G)==='US'){   /* AA_370 H2：出發以後一定飛美國——原本出境大廳還有「搭車離開（回台北）」，搭了就永遠不會 US_ARRIVED（整學期人在臺北、系統當他在美國）*/
      if(G.zone!=='airport_dep'){ void S.fly(GM); return true; }   /* 舊存檔已經搭車回臺北了：直接登機 */
      if(F.US_AIRPORT_AT==null) F.US_AIRPORT_AT=T(G.day,G.hour); if(T(G.day,G.hour)>=F.US_AIRPORT_AT+1){ void S.fly(GM); return true; } } }   /* 時間到就自動登機：進出境大廳一個小時以後 */
    return false; };
  /* 手機「地點」：在美國的時候只有這兩個 */
  S.places=()=>[['us_apartment','公寓',S.SPAWN.us_apartment],['us_outside','公寓社區',S.SPAWN.us_outside]];
  /* ---------- 臨時場景（LAWWW2-C 的正式區域到了就換）---------- */
  S.SPAWN={airport_dep:{x:0,z:5,yaw:Math.PI},us_outside:{x:0,z:4,yaw:Math.PI},us_apartment:{x:0,z:2,yaw:Math.PI}};
  function tmpZone(id,name,o,fill){ return {id,name,indoor:true,camDist:4.2,tmp:true,build(E){ const z=Z3.room(E,Object.assign({spawn:S.SPAWN[id],floorTex:W3.stoneTex(o.floor)},o)); fill(E,z); return z; }}; }
  const airport=tmpZone('airport_dep','桃園機場第二航廈（臨時場景）',{w:24,d:14,h:5.5,wallColor:'#e9ecef',floor:'#d8dadc'},(E,z)=>{
    E.interactables.push({x:0,z:-5,radius:1.6,label:'登機：飛往美國',exchFly:true}); });
  const outside=tmpZone('us_outside','公寓社區（臨時場景）',{w:22,d:16,h:6,wallColor:'#cfd8c8',floor:'#bfc4b5'},(E,z)=>{
    E.interactables.push({x:0,z:-6.6,radius:1.5,label:'回公寓',exit:{to:'us_apartment',spawn:S.SPAWN.us_apartment}}); });
  const apartment=tmpZone('us_apartment','公寓（臨時場景）',{w:8,d:7,h:3,wallColor:'#efe8dc',floor:'#c9b79c'},(E,z)=>{
    const bed=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.45,2.0),new THREE.MeshStandardMaterial({color:'#dcd6ca',roughness:0.9})); bed.position.set(-2.8,0.225,-1.8); z.group.add(bed); z.nav.blockRect(-2.8,-1.8,1.0,2.0,0,0.1);
    E.interactables.push({x:-2.0,z:-1.8,radius:0.9,label:'睡覺',sleep:true});
    E.interactables.push({x:0,z:3.0,radius:1.2,label:'出門',exit:{to:'us_outside',spawn:S.SPAWN.us_outside}}); });
  if(typeof Z3!=='undefined'&&Z3.ZONES){ if(!Z3.ZONES.airport_dep) Z3.ZONES.airport_dep=airport; if(!Z3.ZONES.us_outside) Z3.ZONES.us_outside=outside; if(!Z3.ZONES.us_apartment) Z3.ZONES.us_apartment=apartment; }
  return S;
})();
