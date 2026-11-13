/* ===== 望月台停車場：開車出發（DRIVE-PICKUP-1105 第二步；AA_704 第 2 節 @55a1c5a53，使用者 11-05 08:0x 選「走去新月台停車場取車」、11:1x「走去開車不是真的要花時間 主要就是讓玩家真的知道現在是開車」、11:1x 寒暑假住家裡）=====
   選了開車出發（出遊 OUT 的 q.car：校外約會 date3d.js 開車那幾趟、她的節日開車去她的城市 fest3d.js、以安語彤寒假開車去台中 an_yt_hol3d.js）、而且是從宿舍出發：
   1. 出發選單（OUT.prompt、DATE.prompt、DATE.early、手機的「到下一個約會地點」onetap3d.js）選「出發」＝不直接出發：目標改成走到望月台停車場（GAME.setGoal 帶目的地，地圖指路）。
      走過去不另外花時間（照一般走路；DATE.CAR_PICK_H＝0），走路的那一趟不再跳出發選單（OUT.due 看 CARLOT.walking）。
   2. 校園（zone campus）停車場空的那一格旁邊（Z3.XSG.carSpot.stand）有「開車出發」：出發的時間窗（和 OUT.due 一樣：該出發前 15 分鐘起、最晚能出發的時間以前）、或已經選了出發的那一趟才看得到；
      按下去＝照原本的出發（OUT.go：轉場、第一次的取車旁白、抵達、演、回程）。騎著車按＝先下車（game3d.js doInteract）；下雨照樣能出發。
   3. 一起去的人（校外約會）：約見面的地點是望月台停車場入口（照校園邀約的做法：她從出發時間前 15 分鐘起在入口等；你先到，她之後從小廣場那邊走過來）；
      你走到車旁邊她走過來；按「開車出發」時她還沒到車旁邊＝等她走過來（最多幾秒），沒生出來（不在校園）也照樣出發。
   4. 回程：停回停車場——人在車旁邊（離太遠就放回車旁邊），走回宿舍；不另出字（回程字幕照原本「回到首都帝大。」）。
   5. 從家出發（DATE.fromHomeOn：法律系寒暑假、舊序章那一年、畢業後住家裡；人在家 HOME.at）、人在國外、沒有停車場的配置（Z3.XSG 沒有）＝照原本直接出發（OUT.carHome、S.need）。
   6. 錯過：選了出發卻一直沒走到車旁邊，過了最晚能出發的時間＝照原本的錯過（OUT.expire；校外約會 DATE.tick 記 missed）；校外約會晚了 60 分鐘以上＝不給按，跳回原本的「改時間／今天不去了」（DATE.prompt）。
   存檔：q.lot＝{for:選出發時約好的時間（改時間以後作廢）, at}；G.flags.CARLOT_GOAL＝選出發以前的目標（出發、錯過以後放回去）。測試：node tests/drive_pickup2_unit.js */
'use strict';
const CARLOT=(function(){
  const S={};
  S.LABEL='開車出發';   /* AA_704 第 2 節原字（按鈕）*/
  S.GOAL='到望月台停車場開車出發';   /* 目標列的字：介面字，待 AA 確認 */
  S.GOAL_NAME='望月台停車場';   /* 導航的目的地名稱（AA_704 第 1 節的名字）*/
  S.WAIT_MS=8000;   /* 按下去的時候她還在走過來：最多等這麼久 */
  const now=G=>G.day*24+(G.hour||0);
  /* 停車場：Z3.XSG.park（[x0,z0,x1,z1]）、空的那一格 carSpot（zones3d.js 建校園時填；還沒建＝照同一個算法）。gate＝停車場入口（東北角、接小廣場那條通道的南端）；walkIn＝她走過來的起點（小廣場那一側）；her＝她在車另一邊等 */
  S.spot=function(){ const X=typeof Z3!=='undefined'&&Z3?Z3.XSG:null; if(!X||!Array.isArray(X.park)) return null; const P=X.park;
    const c=X.carSpot||{x:P[0]+2.5+2*2.6,z:P[1]+2.7,ry:Math.PI,stand:{x:P[0]+2.5+2*2.6+1.6,z:P[1]+5.8}}, st=c.stand||{x:c.x+1.6,z:c.z+3.1};
    return {x:c.x,z:c.z,stand:{x:st.x,z:st.z},her:{x:c.x-1.6,z:st.z},gate:{x:P[2]-1.3,z:P[1]+6.4,yaw:Math.PI},walkIn:{x:P[2]-0.75,z:P[1]-1.5}}; };
  /* 這一趟要不要走去停車場：開車、還沒出發、不是從家出發、人不在國外、有停車場 */
  S.need=function(G,q,o){ if(!G||!q||!q.car||q.state!=='planned'||q.arrived||q.goto||q.camp) return false;
    if(typeof OUT==='undefined'||(OUT.carHome&&OUT.carHome(G,q,o))) return false;
    if(typeof DATE!=='undefined'&&DATE.playerAbroad&&DATE.playerAbroad(G,G.day)) return false;
    return !!S.spot(); };
  const lotOk=q=>!!(q&&q.lot&&q.lot.for===q.day*24+q.h);   /* 改時間（q.h 變了）＝作廢 */
  const tripOf=(G,q)=>q&&q.dateTrip&&typeof DATE!=='undefined'&&DATE.trip?DATE.trip(G,q.dateTrip):null;
  /* 校外約會的「趕不上」（DATE.prompt：出發時間過了 60 分鐘以上）、兩天一夜她第一天不能來：不給按，讓 DATE.prompt 交代 */
  const dateHold=(G,q)=>{ if(!q.dateTrip) return false; const t=tripOf(G,q); if(!t) return true; if(t.kind==='overnight'&&DATE.stillOn&&!DATE.stillOn(G,t).ok) return true; return !q.arrived&&now(G)-(t.day*24+t.depart)>1; };
  const inWindow=(G,q)=>{ const n=now(G), tr=OUT.trip?OUT.trip(G,q):{travelH:q.travelH||0}; return n>=q.day*24+q.h-(tr.travelH||0)-0.25&&n<=OUT.lateEnd(q); };
  /* 選了出發、正走去停車場（OUT.due 不再問）*/
  S.walking=function(G,q){ return lotOk(q)&&S.need(G,q)&&!dateHold(G,q)&&now(G)<=OUT.lateEnd(q); };
  /* 現在按得到「開車出發」的那一趟 */
  S.due=function(G){ if(!G||typeof OUT==='undefined'||!OUT.rec||!OUT.lateEnd) return null;
    return OUT.rec(G).find(q=>q.state==='planned'&&!(OUT.isRunning&&OUT.isRunning(q.id))&&S.need(G,q)&&!dateHold(G,q)&&(lotOk(q)?now(G)<=OUT.lateEnd(q):inWindow(G,q)))||null; };
  /* 選了出發：記下來、目標指到停車場（走過去不另外花時間）*/
  S.toLot=function(GM,q){ const G=GM.G, sp=S.spot(); if(!sp) return false; const F=G.flags||(G.flags={});
    if(G.goal!==S.GOAL) F.CARLOT_GOAL=[G.goal==null?null:G.goal,G.goalDest==null?null:G.goalDest];
    q.lot={for:q.day*24+q.h,at:+now(G).toFixed(3)};
    if(GM.setGoal) GM.setGoal(S.GOAL,{zone:'campus',x:sp.stand.x,z:sp.stand.z,r:1.6,name:S.GOAL_NAME});
    return true; };
  S.goalBack=function(GM){ const G=GM.G, F=G.flags||{}; if(G.goal!==S.GOAL){ delete F.CARLOT_GOAL; return; } const pv=F.CARLOT_GOAL; delete F.CARLOT_GOAL;
    if(pv&&pv[0]!=null&&pv[0]!==S.GOAL&&GM.setGoal) GM.setGoal(pv[0],pv[1]); else if(typeof CLS!=='undefined'&&CLS.setGoal) CLS.setGoal(GM); else if(GM.setGoal) GM.setGoal('—'); };
  /* 她走到車旁邊（按下去的時候還在路上：等一下）*/
  const walkTo=(GM,n,p,ms)=>new Promise(res=>{ const E=GM.E; let done=false; const fin=()=>{ if(done) return; done=true; res(); }; if(!E||!E.moveTo||!E.moveTo(n,p.x,p.z,fin,0)) fin(); else setTimeout(fin,ms); });
  S.herToCar=async function(GM,q,t){ const G=GM.G, sp=S.spot(); if(!sp||G.zone!=='campus'||!GM.spawnCharacter||!t) return null; let n=GM.npc&&GM.npc[t.who];
    if(!n){ n=GM.spawnCharacter(t.who,sp.gate.x,sp.gate.z,{pose:'idle',yaw:sp.gate.yaw}); if(!n) return null; n.carLot=q.id; }
    if(n.carLot!==q.id||n.carAtCar) return n;
    GM.sceneBegin(); try{ n.frozen=false; n.carGo='car'; await walkTo(GM,n,sp.her,S.WAIT_MS); n.carGo=null; n.carAtCar=true; } finally { GM.sceneEnd(); } return n; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['carlot3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  /* 按「開車出發」：照原本的出發（OUT.go）；回來停回停車場 */
  S.press=async function(GM,q){ const G=GM.G; if(busy) return false; q=q||S.due(G); if(!q) return false; busy=true;
    try{ const t=tripOf(GM.G,q); if(q.dateTrip&&!t){ delete q.lot; S.goalBack(GM); return !!(typeof DATE!=='undefined'&&await DATE.prompt(GM,q)); }
      if(t){ try{ await S.herToCar(GM,q,t); }catch(e){ console.warn('CARLOT.herToCar',e); } t.departed=true; t.status='going'; }
      delete q.lot; S.goalBack(GM);
      let ok=false; try{ ok=await OUT.go(GM,q); } finally { S.parkBack(GM,q); } return ok; }
    finally { busy=false; } };
  /* 回程：停回停車場（人放回車旁邊；一起去的人不留在停車場）*/
  S.parkBack=function(GM,q){ const G=GM.G, E=GM.E; for(const id of Object.keys(GM.npc||{})){ const n=GM.npc[id]; if(n&&n.carLot===q.id&&GM.removeNPC) GM.removeNPC(id); }
    const sp=S.spot(); if(!sp||G.zone!=='campus'||!E||!E.player||!E.player.obj) return; const P=E.player.obj.position;
    if(Math.hypot(P.x-sp.stand.x,P.z-sp.stand.z)>4){ P.x=sp.stand.x; P.z=sp.stand.z; E.player.lv=0; E.player.path=null; E.player.target=null; } };
  /* 每 0.5 秒（STORY.TICKS）：她在入口等／走過來、走到車旁邊；錯過、出發以後把目標放回去 */
  S.tick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||busy) return false;
    const q=S.due(G), walk=!!q&&lotOk(q);
    if(!walk&&G.goal===S.GOAL) S.goalBack(GM);
    for(const id of Object.keys(GM.npc||{})){ const n=GM.npc[id]; if(n&&n.carLot&&(!walk||q.id!==n.carLot||G.zone!=='campus')&&GM.removeNPC) GM.removeNPC(id); }
    if(!walk||!q.dateTrip||G.zone!=='campus'||!GM.spawnCharacter) return false;
    const t=tripOf(G,q); if(!t||now(G)<t.day*24+t.depart-0.25) return false;   /* 她從出發時間前 15 分鐘起在入口（同校園邀約 INV.entryFor）*/
    const sp=S.spot(), P=E.player.obj.position; let n=GM.npc&&GM.npc[t.who];
    if(!n){ const near=Math.hypot(P.x-sp.gate.x,P.z-sp.gate.z)<25, from=near?sp.walkIn:sp.gate;   /* 你先到（在附近看得到）＝她從小廣場那邊走過來；她先到＝在入口等 */
      n=GM.spawnCharacter(t.who,from.x,from.z,{pose:'idle',yaw:sp.gate.yaw}); if(!n) return false; n.carLot=q.id;
      if(near&&E.moveTo){ n.carGo='gate'; if(!E.moveTo(n,sp.gate.x,sp.gate.z,()=>{ n.carGo=null; n.obj.rotation.y=sp.gate.yaw; },0)) n.carGo=null; }
      return false; }
    if(n.carLot===q.id&&!n.carGo&&!n.carAtCar&&Math.hypot(P.x-sp.stand.x,P.z-sp.stand.z)<6&&E.moveTo){ n.carGo='car'; if(!E.moveTo(n,sp.her.x,sp.her.z,()=>{ n.carGo=null; n.carAtCar=true; },0)){ n.carGo=null; n.carAtCar=true; } }   /* 你走到車旁邊：她跟著走過來 */
    return false; };
  /* 校園：車旁邊的「開車出發」（STORY.populate 之後；看不到的時候 hidden）*/
  S.populate=function(zoneId,GM){ if(zoneId!=='campus'||!GM||!GM.E) return null; const sp=S.spot(); if(!sp) return null;
    const it={x:sp.stand.x,z:sp.stand.z,radius:1.4,lv:0,label:S.LABEL,carLot:true,get hidden(){ return !S.due(GM.G); },get mark(){ return !this.hidden; },onInteract:()=>S.press(GM)};
    GM.E.interactables.push(it); return it; };
  if(typeof STORY!=='undefined'){
    if(STORY.populate&&!STORY._carLotPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('CARLOT.populate',e); } return r; }; STORY._carLotPop=true; }
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ return S.tick(GM); }catch(e){ console.warn('CARLOT.tick',e); return false; } }); }
  return S;
})();
