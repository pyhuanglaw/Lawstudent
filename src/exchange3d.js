/* 交換的最小可玩流程（使用者 2026-10-17 21:3x，D99 第三優先）：申請交換 → 出發 → 抵達美國 → 進入公寓 → 外出 → 回公寓睡覺 → 推進隔天。
   使用者：「先用現有素材或臨時場景也可以，不要再讓美術成為系統開發的前置條件。」
   - 路線：不讓玩家選（1A-02，AA_315；BB_204）——志願表截止 2027-11-18 12:00 照交往狀態定（STORY.routeDecide：學姊＝美國、以安＝日本、其他＝留在臺灣）。原本宿舍房間的「交換申請（志願表）」四選一拿掉了。
   - 出發：美國路線 2028-08-02（STORY.ROUTE_DATES.US.dep）早上 6:00 以後，人在哪裡都先演：字卡 → 桃園機場出境大廳 → 「登機」→ 字卡（飛行）→ 抵達美國公寓社區。
   - 美國：公寓（床「睡覺」＝和宿舍一樣的睡覺選單；「出門」）、社區（「回公寓」）。在美國的時候台灣的課不排（classes3d.js dayItems）、凌晨 2:30 走回公寓睡（story3d.js forceHome）、
     手機「地點」只列公寓和社區（game3d.js）。時間＝當地時間（手機的台灣時差另外照 STORY.tzOffset）。
   - 場景：LAWWW2-C 的正式區域（src/us3d.js：airport_dep、airport_arr、us_outside、us_apartment、us_shared、us_market、us_asian_market；2026-10-17 3bff5ef4 接進來）載入後同名蓋過這裡的臨時場景（這個檔先載入，正式的後載入）。
     還沒接的互動（現在照區域自己的預設：進門、看告示）：usShared（US2 的爐子、冰箱、高腳椅）、usClub（會所）、usMarket（採買）、airportBoard（寒暑假出國）。
   - 返台（1A-09，AA_318）：當地 12/22 06:00 以後（人在美國）→ 字卡（飛行）→ 臺灣 12/23 18:00 → STORY.roomY4FromAirport（不回家，直接去宿舍 409、拆箱）。
   - 還沒有的（之後照 AA、BB 的規格接）：志願表、送機、US0～US4、美國的課、出遊、人物。測試：node tests/exch_min_unit.js、tests/room_y4_unit.js */
'use strict';
const EXCH=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h;
  const US_ZONES=['us_apartment','us_outside','us_shared','us_market','us_asian_market','us_campus','us_lawlib'];   /* 美國校園、法學院圖書館（LAWWW2-C US-CAMPUS-WIRE-1018）也算在美國 */   /* LAWWW2-C 的正式區域（src/us3d.js 3bff5ef4）：C 棟 208、大超市、對面的亞洲超市也算在美國 */
  S.US_ZONES=US_ZONES;
  S.inUS=G=>!!G&&US_ZONES.includes(G.zone);
  /* ---------- 申請：沒有選單了（1A-02；路線在 STORY.routeDecide）---------- */
  S.applyOpen=()=>false;
  /* ---------- 出發 ---------- */
  S.departAt=function(G){ if(!G||!G.flags||G.flags.US_DEPARTED||typeof STORY==='undefined'||STORY.route(G)!=='US') return null; const d=DK(STORY.ROUTE_DATES.US.dep); return d==null?null:T(d,6); };
  S.departDue=function(G){ const t=S.departAt(G); return t!=null&&T(G.day,G.hour)>=t&&!G.flags.US_ARRIVED; };
  S.depart=async function(GM){ const G=GM.G, F=G.flags; if(!S.departDue(G)) return false; F.US_DEPARTED=true; GM.sceneBegin();
    try{ if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ HOME.rec(G).at=false; } if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
      await GM.fade(true); const d=CALENDAR.dateOf(G.day); if(GM.titleCard) await GM.titleCard(d.y+' 年 '+d.m+' 月 '+d.d+' 日','出發｜桃園機場第二航廈',2400);
      if(G.hour<13){ G.hour=13; if(GM.E) GM.E.hour=G.hour; } }
    finally{ GM.sceneEnd(); }
    await GM.enter('airport_dep',S.SPAWN.airport_dep); if(GM.autosave) GM.autosave(); return true; };
  /* 登機：飛行 16 小時（含轉機），印第安納夏令時間比台灣慢 12 小時 → 同一天晚上抵達 */
  S.fly=async function(GM){ const G=GM.G, F=G.flags; GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('飛往美國','芝加哥轉機到印第安納　約 16 小時',2600);
      const tz=12, h=G.hour+16-tz; G.hour=h; if(GM.E) GM.E.hour=G.hour; F.US_ARRIVED=true; F.US_ARRIVED_DAY=G.day;
      if(GM.titleCard) await GM.titleCard('抵達','美國印第安納　當地時間 '+Math.floor(h)+':'+String(Math.round((h%1)*60)).padStart(2,'0'),2200); }
    finally{ GM.sceneEnd(); }
    await GM.enter('us_outside',S.SPAWN.us_outside); if(GM.toast) GM.toast('公寓在社區的另一頭。',3000); if(GM.autosave) GM.autosave(); return true; };
  /* ---------- 返台（美國路線 2028-12-23；AA_318 1A-09、AA_144 X3、AA_291 第 5 節）：當地 12/22 06:00 以後、人在美國 → 字卡 → 臺灣 12/23 18:00 抵達 → 直接去宿舍 409 ---------- */
  S.returnAt=function(G){ if(!G||!G.flags||!G.flags.US_ARRIVED||G.flags.US_RETURNED!=null||typeof STORY==='undefined'||STORY.route(G)!=='US') return null; const d=DK(STORY.ROUTE_DATES.US.ret); return d==null?null:T(d-1,6); };
  S.returnDue=function(G){ const t=S.returnAt(G); return t!=null&&S.inUS(G)&&T(G.day,G.hour)>=t; };
  S.returnHome=async function(GM){ const G=GM.G, F=G.flags; if(!S.returnDue(G)) return false; const d=DK(STORY.ROUTE_DATES.US.ret); F.US_RETURNED=d; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard('飛回臺灣','芝加哥轉機到桃園　約 16 小時',2600);
      if(STORY.travelOvernight) STORY.travelOvernight(GM,d,18); if(GM.titleCard) await GM.titleCard('抵達','桃園機場　臺灣時間 18:00',2200); }   /* 時間換回臺灣時間（日期往後到 12/23）*/
    finally{ GM.sceneEnd(); }
    if(STORY.roomY4FromAirport) return STORY.roomY4FromAirport(GM);
    await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); if(GM.autosave) GM.autosave(); return true; };
  /* ---------- 互動、每幀 ---------- */
  S.interact=async function(GM,it){ if(it.exchFly){ await S.fly(GM); return true; } return false; };
  S.tick=function(GM){ const G=GM.G, E=GM.E; if(!G||!G.flags) return false;
    if(S.departDue(G)&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))){ void S.depart(GM); return true; }   /* 在家的在 home3d.js 的 loop 裡 */
    if(S.returnDue(G)){ void S.returnHome(GM); return true; }   /* 美國路線返台（1A-09）*/
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
