// SHOP-DINERS-1103（USER_WANTS X187；使用者 2026-11-03 附 10/18 週六 18:22 溫州街「巷子裡定食」的截圖：店裡只有店長、座位全空——「店內都沒有人 幾乎所有店」「好詭異」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的店（公館：阿鳳麵店、日日便利、舊路書房；溫州街：半熟、一盞、林家乾麵、巷子裡定食、阿德影印；118 巷九間），照進店（CROWD.enter）檢查：
//   1. 營業時間內有客人：每一家在自己的尖峰（吃飯的店晚餐 18:30）有人；吃飯的店晚餐、午餐坐滿約三成半到六成；使用者截圖那一刻（巷子裡定食 10/18 週六 18:22）有人在吃。
//   2. 人數照時段：吃飯的店下午、晚上（尖峰以外）比尖峰少、不到兩成五；打烊（公休日、兩段中間、颱風假、麵店過年店休）一個人都沒有。
//   3. 同一天同一時段出去再進來：同一批人、同一些位子（D55）；換一天換人。
//   4. 玩家的位子：沒坐下時至少兩個空位，有兩人座的店至少留一組面對面的兩人座整天空著；玩家先坐了的位子沒有客人坐上去；
//      劇情的位子：阿鳳麵店中間那張桌（玩家、阿哲、麵店團）不排；麵店團常客的日子 17:30～19:00 麵店不排。
//   5. 一間店同時最多 10 位（書店、便利商店 6、影印店 2、一一八茶飲 3）；兩個客人不坐同一個位子。
//   6. 坐著的：坐在區域真正的座位上、方向照座位、旁邊站得起來；站著的：站得住、面向架子或櫃台（前面 0.75 m 是架子）、不站在出口、點餐這些按鈕上。
//   7. 有名字的人後來走進來、空位不夠時：一桌客人吃完先走（S.shopTrim），空位回到兩個以上。
//   8. 有人跟著你（companion）：客人少一半左右。
//   9. 慢讀咖啡：一個人的有人看書（read）、有人用筆電（腿上 laptop_lap）；一桌兩個人的轉頭看對方。
//  10. 待在店裡時間到了新來的客人從門口走進來（走過去的路上那個位子算有人：seatTarget）；兩點半 Café 不在這一套裡（S.cafeCustomers 照舊）。
// 修改前：CROWD 沒有店的客人（第 1 項就 FAIL：每一家 0 人）。用法：node tests/shop_diners_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; }};
let NDL=()=>false;
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,dayOfKey:dayOf,noodleDay:d=>NDL(d)};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js',
  'src/data/lane118_shops.js','src/data/lane118_props.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/calendar.js','src/data/places.js','src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/noodle_closed3d.js','src/crowd3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（座位、導航不靠模型）*/
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const mkG=(d,h,o)=>Object.assign({day:typeof d==='string'?dayOf(d):d,hour:h,flags:{},stage:'law'},o||{});
let GM=null;
function enter(id,G,o){ o=o||{}; GAME.G=G; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id;
  GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }};
  if(o.playerSeat) E.player.seat=o.playerSeat(z);
  if(o.before) o.before(GM,z);
  CROWD.enter(GM,id); return z; }
const SHOP_ZONES=['noodle','cvs','bookstore','wz_brunch','wz_teahouse','wz_lin','wz_teishoku','wz_print','l118_dian','l118_self','l118_tea','l118_home','l118_cafe2','l118_pasta','l118_korea','l118_omu','l118_noodle2'];
const MEAL=['noodle','wz_lin','wz_teishoku','l118_dian','l118_self','l118_home','l118_pasta','l118_korea','l118_omu','l118_noodle2'];
const PEAK={wz_brunch:10.5,wz_teahouse:15,l118_cafe2:15,l118_tea:12.5,wz_print:12.5};
/* 舊版沒有這幾個函式（改前也要跑得完、照實 FAIL）*/
const seatBusy=(E,st)=>CROWD.seatBusy?CROWD.seatBusy(E,st):(E.npcs.some(m=>m.seat&&Math.hypot(m.seat.x-st.x,m.seat.z-st.z)<0.4)||(!!E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.4));
const shopFree=E=>((E.zone&&E.zone.seats)||[]).filter(st=>!seatBusy(E,st)).length;
const shopNeed=E=>CROWD.shopNeed?CROWD.shopNeed(E):2;
const ppl=()=>E.npcs.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd));
const defOf=z=>CROWD.SHOPS&&CROWD.SHOPS.find(d=>d.zone===z);
const open=(z,G)=>{ const d=defOf(z); return !!d&&CROWD.shopWindows(d,G).some(([a,b])=>G.hour>=a&&G.hour<b); };
const DAYS=[]; for(let d=dayOf('2025-09-22');DAYS.length<15;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)) DAYS.push(d);
/* 每一家、每一天、每個時刻：開門的天數、平均人數、平均坐滿幾成、最多幾位 */
const stat=(z,h,days,o)=>{ let nOpen=0, sum=0, occ=0, mx=0; for(const d of days||DAYS){ const G=mkG(d,h,o&&o.G); if(o&&o.anyOpen===false){} else if(!open(z,G)) continue; nOpen++; const zz=enter(z,G); const n=ppl().length; sum+=n; mx=Math.max(mx,n); const S=(zz.seats||[]).length; occ+=S?n/S:0; }
  return {nOpen,avg:nOpen?sum/nOpen:0,occ:nOpen?occ/nOpen:0,mx}; };
// ---------- 1. 營業時間內有客人 ----------
{ const bad=[], info=[]; for(const z of SHOP_ZONES){ const h=PEAK[z]||18.5, s=stat(z,h); info.push(z+' '+s.avg.toFixed(1)); if(!s.nOpen||s.avg<1) bad.push(z+'（'+h+' 點，開門 '+s.nOpen+' 天，平均 '+s.avg.toFixed(2)+' 位）'); }
  check('1. 每一家店在自己的尖峰有客人（吃飯的店晚餐 18:30；半熟 10:30、一盞和慢讀咖啡 15:00、一一八茶飲和影印店 12:30）',!bad.length,bad.length?bad.join('、'):info.join('、')); }
{ const bad=[], info=[]; for(const z of MEAL) for(const h of [12.5,18.5]){ const s=stat(z,h); if(!s.nOpen) continue; info.push(z+'@'+h+'='+s.occ.toFixed(2)); if(s.occ<0.28||s.occ>0.65) bad.push(z+'@'+h+' '+s.occ.toFixed(2)); }
  check('1. 吃飯的店午餐（12:30）、晚餐（18:30）平均坐滿約三成到六成（大店最多 10 位）',!bad.length,(bad.length?'不對：'+bad.join('、')+'｜':'')+info.slice(0,8).join(' ')); }
{ const z=enter('wz_teishoku',mkG('2025-10-18',18+22/60)); const n=ppl(), sat=n.filter(m=>m.seat&&m.pose==='sit');
  check('1. 使用者截圖那一刻：巷子裡定食 10/18（週六）18:22 有客人坐在位子上吃',sat.length>=3,'客人 '+n.length+' 位（坐著 '+sat.length+'）'); }
// ---------- 2. 人數照時段、打烊沒有人 ----------
{ const bad=[], info=[]; for(const z of MEAL){ const pk=Math.max(stat(z,12.5).occ,stat(z,18.5).occ); for(const h of [15.5,20.25,10.25]){ const s=stat(z,h); if(!s.nOpen) continue; info.push(z+'@'+h+'='+s.occ.toFixed(2)); if(!(s.occ<pk&&s.occ<=0.25)) bad.push(z+'@'+h+' '+s.occ.toFixed(2)+'（尖峰 '+pk.toFixed(2)+'）'); } }
  check('2. 吃飯的店尖峰以外（下午、晚上、早上開門時）比尖峰少、不到兩成五',!bad.length,bad.length?bad.join('、'):info.slice(0,6).join(' ')); }
{ const cases=[['wz_teishoku','2025-10-14',18.5,'週二公休'],['wz_teishoku','2025-10-15',15.5,'兩段中間'],['wz_teishoku','2025-10-15',21,'打烊'],['wz_lin','2025-10-13',12.5,'週一公休'],['l118_pasta','2025-10-15',12.5,'週三公休'],
    ['l118_dian','2025-10-15',15.5,'兩段中間'],['l118_cafe2','2025-10-15',19,'18:00 關'],['wz_brunch','2025-10-15',16,'15:00 關'],['wz_teahouse','2025-10-14',15,'週二公休'],['bookstore','2025-10-15',22.5,'書店晚上'],['noodle','2025-10-15',15.5,'麵店下午'],['wz_print','2025-10-19',12.5,'週日公休']];
  const ty=(()=>{ for(let d=1;d<1500;d++) if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return d; return null; })();
  if(ty!=null){ cases.push(['wz_teishoku',ty,18.5,'颱風假']); cases.push(['l118_korea',ty,12.5,'颱風假']); }
  const cny=dayOf('2026-02-17')-3; cases.push(['noodle',cny,12.5,'麵店過年店休']);
  const bad=[]; for(const [z,d,h,why] of cases){ enter(z,mkG(d,h)); if(ppl().length) bad.push(z+' '+why+' '+ppl().length+' 位'); }
  check('2. 打烊沒有人（公休日、兩段中間、打烊以後、颱風假、麵店過年店休）',!bad.length,bad.length?bad.join('、'):cases.length+' 個情境'+(ty==null?'（日曆沒有颱風假）':'')); }
// ---------- 3. 同一天同一時段同一批人 ----------
{ const sig=()=>ppl().map(n=>n.crowdKey+'@'+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)+':'+(n.obj.userData.spec&&n.obj.userData.spec.id)).sort().join('|');
  const bad=[]; for(const z of ['wz_teishoku','l118_korea','bookstore','cvs']){ const G=mkG('2025-10-16',PEAK[z]||18.5); enter(z,G); const a=sig(); enter(z,mkG('2025-10-16',PEAK[z]||18.5)); const b=sig(); enter(z,mkG('2025-10-17',PEAK[z]||18.5)); const c=sig(); if(!a||a!==b||a===c) bad.push(z); }
  check('3. 同一天同一時段出去再進來：同一批人、同一些位子、同一個外觀；換一天換人',!bad.length,bad.join('、')); }
// ---------- 4、5、6：掃很多天、很多時刻 ----------
const HS=[8,10.5,11.75,12.5,13.25,15,17.6,18.5,19.25,20.25,22.5];
const SCAN_DAYS=DAYS.slice(0,8).concat([dayOf('2025-10-18'),dayOf('2025-10-19'),dayOf('2026-01-28'),dayOf('2026-07-15')]);
const KCAP={bookstore:6,cvs:6,wz_print:2,l118_tea:3};
{ const freeBad=[], pairBad=[], capBad=[], dupBad=[], seatBad=[], standBad=[], keepBad=[]; let nSeat=0, nStand=0;
  for(const z of SHOP_ZONES){ const def=defOf(z); if(!def){ capBad.push(z+' 沒有'); continue; } const hasFace=def.units.some(u=>u.kind==='face')&&!def.noKeep;
    for(const d of SCAN_DAYS) for(const h of HS){ const G=mkG(d,h), zz=enter(z,G), P=ppl(), seats=zz.seats||[];
      const busy=st=>seatBusy(E,st); const free=seats.filter(st=>!busy(st));
      if(seats.length&&free.length<shopNeed(E)) freeBad.push(z+' d'+d+'@'+h+' 空位 '+free.length);
      if(hasFace){ const plan=CROWD.shopPlan(def,G), u=def.units[plan.keep]; if(plan.keep<0||!u||u.kind!=='face') keepBad.push(z+' 沒有留兩人座'); else { if(plan.units[plan.keep].length) keepBad.push(z+' 留的那一組有客人'); const ok=u.seats.every(q=>{ const st=seats.find(s=>Math.hypot(s.x-q.x,s.z-q.z)<0.12); return st&&!busy(st); }); if(!ok) pairBad.push(z+' d'+d+'@'+h); } }
      if(P.length>Math.min(10,KCAP[z]||10)) capBad.push(z+' d'+d+'@'+h+' '+P.length+' 位');
      const ss=P.filter(n=>n.seat).map(n=>n.seat.x.toFixed(2)+','+n.seat.z.toFixed(2)); if(new Set(ss).size!==ss.length) dupBad.push(z+' d'+d+'@'+h);
      for(const n of P){ const o=n.obj.position;
        if(n.seat){ nSeat++; const st=seats.find(s=>s===n.seat); if(!st) seatBad.push(z+' 不是區域的座位'); else if(Math.abs(Math.atan2(Math.sin(n.obj.rotation.y-(st.yaw||0)),Math.cos(n.obj.rotation.y-(st.yaw||0))))>0.01) seatBad.push(z+' 方向不對'); else if(!CROWD.seatSide(E,st)) seatBad.push(z+' 旁邊站不起來'); else if(Math.hypot(o.x-st.x,o.z-st.z)>0.01) seatBad.push(z+' 沒坐在位子上'); continue; }
        nStand++; if(!E.canStand(o.x,o.z,0.3,0)) standBad.push(z+' 站不住 '+o.x.toFixed(2)+','+o.z.toFixed(2));
        const y=n.obj.rotation.y, fx=o.x+Math.sin(y)*0.75, fz=o.z+Math.cos(y)*0.75; if(E.canStand(fx,fz,0.05,0)) standBad.push(z+' 沒有面向架子 '+o.x.toFixed(2)+','+o.z.toFixed(2));
        for(const i of E.interactables){ if(i.seat||i.hidden) continue; if(Math.hypot(i.x-o.x,i.z-o.z)<(i.exit?1.0:0.45)) standBad.push(z+' 站在「'+i.label+'」上'); } } } }
  const u=a=>[...new Set(a)].slice(0,5).join('、');
  check('4. 玩家沒坐下：每一間店、每一個時刻至少兩個空位（一一八茶飲兩張高腳椅：一個）',!freeBad.length,u(freeBad));
  check('4. 有兩人座的店每天留一組面對面的兩人座整天沒有客人（和她一起坐：invites3d.js pairSeats）',!keepBad.length&&!pairBad.length,u(keepBad.concat(pairBad)));
  check('5. 一間店同時最多 10 位（書店、便利商店 6、影印店 2、一一八茶飲 3）',!capBad.length,u(capBad));
  check('5. 兩個客人不坐同一個位子',!dupBad.length,u(dupBad));
  check('6. 坐著的：區域真正的座位、方向照座位、旁邊站得起來',!seatBad.length&&nSeat>100,u(seatBad)+'（坐著 '+nSeat+' 人次）');
  check('6. 站著的：站得住、面向架子或櫃台、不站在出口和按鈕上',!standBad.length&&nStand>50,u(standBad)+'（站著 '+nStand+' 人次）'); }
// ---------- 4. 玩家先坐的位子、劇情的位子 ----------
{ const bad=[]; for(const z of ['wz_teishoku','l118_korea','wz_lin','l118_cafe2']) for(const d of DAYS.slice(0,6)) for(const h of [12.5,15,18.5]){ let mine=null;
    enter(z,mkG(d,h),{playerSeat:zz=>{ mine=zz.seats[3]; return mine; }}); if(ppl().some(n=>n.seat&&Math.hypot(n.seat.x-mine.x,n.seat.z-mine.z)<0.4)) bad.push(z+' d'+d+'@'+h); }
  check('4. 玩家先坐了的位子沒有客人坐上去',!bad.length,bad.slice(0,4).join('、')); }
{ let mid=0, any=0; for(const d of SCAN_DAYS) for(const h of [11.5,12,12.5,13,13.5,17.2,18,18.5,19.5,20.5]){ enter('noodle',mkG(d,h)); any+=ppl().length; mid+=ppl().filter(n=>n.seat&&Math.abs(n.seat.x)<0.5).length; }
  NDL=()=>true; let reg=0, ok=0; for(const d of DAYS) for(const h of [17.6,18,18.5,18.9]){ enter('noodle',mkG(d,h)); reg+=ppl().length; } for(const d of DAYS){ enter('noodle',mkG(d,12.5)); ok+=ppl().length; } NDL=()=>false;
  check('4. 阿鳳麵店中間那張桌（玩家、阿哲、麵店團）不排客人',any>0&&mid===0,'客人 '+any+' 人次、中間那張 '+mid);
  check('4. 麵店團常客的日子 17:30～19:00 麵店不排（他們自己的固定客人）；中午照排',reg===0&&ok>0,'17:30～19:00 '+reg+' 人次、中午 '+ok); }
// ---------- 7. 有名字的人走進來、空位不夠：一桌客人先走 ----------
{ const G=mkG('2025-10-16',18.5), zz=enter('wz_teishoku',G), before=ppl().length; let added=0;
  for(const st of zz.seats){ if(seatBusy(E,st)) continue; if(shopFree(E)<=1) break; const o=new THREE.Group(); o.position.set(st.x,0,st.z); E.addNPC({obj:o,name:'同學',charId:'x'+added,seat:st,pose:'sit'}); added++; }   /* 照作息來的同學坐掉空位，剩一個 */
  const f0=shopFree(E); CROWD.tick(GM,1.6); const gone=ppl().filter(n=>n.leaving), f1=shopFree(E);
  CROWD.tick(GM,1.6); const again=ppl().filter(n=>!n.leaving).length;
  check('7. 有名字的人坐掉空位、剩不到兩個：一桌客人先起身走出去，空位回到兩個以上；不會又坐回去',before>0&&f0<2&&gone.length>=1&&f1>=2&&again===before-gone.length,'客人 '+before+'、同學坐了 '+added+'、空位 '+f0+' → '+f1+'、走的 '+gone.length); }
// ---------- 8. 有人跟著你：少一半左右 ----------
{ let a=0, b=0; for(const z of ['wz_teishoku','l118_korea','l118_noodle2','wz_lin']) for(const d of DAYS){ for(const h of [12.5,18.5]){ enter(z,mkG(d,h)); a+=ppl().length; enter(z,mkG(d,h,{flags:{companion:'heroine_01'}})); b+=ppl().length; } }
  check('8. 有人跟著你（companion）：客人少一半左右',a>0&&b<=a*0.7&&b>0,'平常 '+a+'、有人跟著 '+b+' 人次'); }
// ---------- 9. 慢讀咖啡、兩個人一桌 ----------
{ let read=0, lap=0, sit=0, pair=0, lookOk=0; for(const d of DAYS) for(const h of [10.5,13,15,16.5]){ enter('l118_cafe2',mkG(d,h)); for(const n of ppl()){ if(n.pose==='read') read++; else if(n.obj.userData.propOn&&n.obj.userData.propOn.laptop_lap) lap++; else sit++; } }
  for(const d of DAYS){ enter('wz_teishoku',mkG(d,18.5)); const L=CROWD.live; for(const id in L){ const ns=L[id].npcs; if(ns.length===2){ pair++; if(ns[0].lookAt===ns[1].obj.position&&ns[1].lookAt===ns[0].obj.position) lookOk++; } } }
  check('9. 慢讀咖啡：有人看書（read）、有人用筆電（腿上 laptop_lap）、有人坐著',read>0&&lap>0&&sit>0,'看書 '+read+'、筆電 '+lap+'、坐著 '+sit);
  check('9. 一桌兩個人一起來的：轉頭看對方（聊天）',pair>0&&lookOk===pair,pair+' 桌、轉頭 '+lookOk); }
// ---------- 10. 待在店裡：新來的客人從門口走進來；Café 不在這一套 ----------
{ const G=mkG('2025-10-16',11.0), zz=enter('l118_korea',G); const n0=ppl().length; let walked=null;
  for(let i=0;i<60&&!walked;i++){ G.hour+=0.03; CROWD.tick(GM,1.6); walked=ppl().find(n=>n.seatTarget&&!n.seat); }
  const d=walked&&walked.obj.position, def=defOf('l118_korea');
  check('10. 待在店裡時間到了：新來的客人從門口走進來（走過去的路上那個位子算有人）',!!walked&&Math.hypot(d.x-def.door[0],d.z-def.door[1])<0.6&&seatBusy(E,walked.seatTarget),'11:00 起 '+n0+' 位'+(walked?'，'+G.hour.toFixed(2)+' 有人從門口進來':'，沒有人走進來'));
  check('10. 兩點半 Café 不在這一套（照舊 story3d.js 的 S.cafeCustomers）',!CROWD.SPOTS.some(s=>s.zone==='cafe'&&s.shop)); }
console.log(fails?('\n'+fails+' 項 FAIL'):'\n全部 PASS'); process.exit(fails?1:0);
