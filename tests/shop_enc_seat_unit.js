// SHOP-ENCOUNTER-1103／SHOP-DINERS-1103：店裡的位子和路人句（遊戲真正的店：公館、溫州街、118 巷、兩點半 Café）——不需要瀏覽器。
//   1. 坐著的店（半熟、林家、定食、燒臘）：進店時 SHOPENC.enter 用 CROWD.shopSeatPick 找位子、shopSeatTake 預約——路人客人不坐那個位子（原本會有人坐的日子、時段也一樣），也不坐留給玩家的那一組。
//   2. 站著的店（舊路書房、日日便利、阿德影印）：挑一個架子、櫃台前的地方（shopStandTake）——路人不站那裡；不站在出口、按鈕上；同一天同一時段再進來同一個地方。
//   3. 兩點半 Café：不坐學姊的位子（5）、吧檯、沙發、今天的客人坐的位子。
//   4. SHOPENC.after：朋友的按鈕「和○○打招呼」；宋知寧站在書架前（「看二手書架」，女生的路人底模），第二次以後「和知寧說話」。
//   5. 路人句：吃飯的店兩人一桌點了聽一句（兩個人都可以點、同一組）、一個人吃飯的不說；書店站著的人「（小聲）」；便利商店只有排隊結帳的人說；影印店、茶屋不說；按鈕最後才算（yieldIt）。
//      點了：說話的人寫「路人」；同一位客人一天同一句；同一句一天內（不同店也一樣）不重複。
//   6. 一起坐（AA_641 第 5 節）：玩家坐在她旁邊的空位（2.2 m 以內、沒有人坐、不是她的、不是預約給別人的），時間走 30 分鐘、旁白以後站起來；旁邊沒有空位就站著（照樣 30 分鐘）。
// 修改前：沒有 SHOPENC、CROWD.shopStandTake（第 1 項就 FAIL）。用法：node tests/shop_enc_seat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; }};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m',i}),CROWD_X:2,dayOfKey:dayOf,noodleDay:()=>false,SCHED_X:[]};
global.SOCIAL={displayName:id=>({classmate_mingxuan:'明軒',classmate_xinci:'芯慈',kai:'阿凱'})[id]||id};
let NPC={}; global.EVENTS={npcOf:id=>NPC[id]||null,running:false};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js',
  'src/data/lane118_shops.js','src/data/lane118_props.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/calendar.js','src/data/places.js','src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/noodle_closed3d.js','src/crowd3d.js','src/data/shop_enc.js','src/shopenc3d.js'];
let miss=null; for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ miss=f; continue; } let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 SHOPENC（enter、after、bindDiners、hear）和 CROWD.shopStandTake／shopStandReserved',!miss&&typeof SHOPENC!=='undefined'&&typeof CROWD.shopStandTake==='function'&&typeof CROWD.shopStandReserved==='function'&&['enter','after','bindDiners','hear'].every(k=>typeof SHOPENC[k]==='function'),miss?'缺 '+miss:'');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const mkG=(d,h,o)=>Object.assign({day:typeof d==='string'?dayOf(d):d,hour:h,flags:{},stage:'law',daily:{}},o||{});
let GM=null; const SAYS=[];
function build(id,G){ GAME.G=G; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id;
  GM={G,E,hourRate:1/150,npc:{},D:{active:false},sceneBegin(){},sceneEnd(){},face(){},say:async(w,t)=>{ SAYS.push((w?(w.name||'')+'：':'')+t); },fade:async()=>{},advance:h=>{ G.hour+=h; },standUp:n=>{ n.seat=null; n.pose='idle'; n.frozen=false; },sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }};
  return z; }
/* 進店：SHOPENC 先決定（測試直接寫好今天這個時段是誰）→ 路人客人（CROWD.enter）→ 照作息的人（這裡用假的：坐到預約的位子）→ SHOPENC.after */
function enter(id,G,who){ for(const k in CROWD.shopRes) delete CROWD.shopRes[k]; for(const k in CROWD.shopStandRes) delete CROWD.shopStandRes[k];
  const z=build(id,G); NPC={}; if(who){ const R=SHOPENC.rec(G); const k=SHOPENC.key(G,id); if(!R.dec[k]) R.dec[k]={who,spot:id}; R.who[who]=k; }
  const d=who?SHOPENC.enter(GM,id):null; CROWD.enter(GM,id); return {z,d}; }
const ppl=()=>E.npcs.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd));
const near=(q,x,z,r)=>!!q&&Math.hypot(q.x-x,q.z-z)<(r||0.4);
const DAYS=[]; for(let d=dayOf('2025-09-22');DAYS.length<12;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)&&!CALENDAR.termOf(d).exam) DAYS.push(d);
const SATS=[]; for(let d=dayOf('2025-09-27');SATS.length<8;d+=7) if(CALENDAR.termOf(d)&&!CALENDAR.termOf(d).exam) SATS.push(d);
// ---------- 1. 坐著的店 ----------
{ const bad=[], info=[]; let n=0;
  for(const [z,who,hs,days] of [['wz_brunch','classmate_xinci',[10.25,11.5],SATS],['wz_lin','classmate_mingxuan',[18.25,18.5],DAYS],['wz_teishoku','heroine_05',[12.5,13.25],DAYS],['noodle','zhe',[18.25,19.25],DAYS]]){
    for(const d of days) for(const h of hs){ const G=mkG(d,h); const r=enter(z,G,who); if(!r.d||!r.d.place||!r.d.place.seat){ bad.push(z+' 沒有位子 '+d+'@'+h+' '+JSON.stringify(r.d)); continue; } n++;
      const s=r.d.place.seat; if(ppl().some(m=>near(m.seat,s.x,s.z)||near(m.seatTarget,s.x,s.z))) bad.push(z+' 路人坐了預約的位子 '+d+'@'+h);
      const st=r.z.seats.find(q=>near(q,s.x,s.z,0.12)); if(!st) bad.push(z+' 預約的不是店裡的座位'); else if(!CROWD.shopReserved(z,st,G)) bad.push(z+' 沒有預約');
      const def=CROWD.SHOP_ZONES[z], pl=CROWD.shopPlan(def,G), keep=pl.keep>=0?def.units[pl.keep].seats:[]; if(keep.some(q=>near(q,s.x,s.z,0.12))) bad.push(z+' 坐了留給玩家的那一組'); } info.push(z); }
  check('1. 半熟、林家、定食、燒臘：朋友的位子預約了，路人客人不坐、也不是留給玩家的那一組（'+n+' 次）',!bad.length&&n>=60,bad.slice(0,4).join('；'));
  /* 原本那個位子有路人坐的日子：預約以後就沒有（拿 shop_diners 第 11 項的同一套比較）*/
  let had=0, freed=0; for(const d of DAYS) for(const h of [12.5,13,18.5]){ const G=mkG(d,h); build('wz_teishoku',G); for(const k in CROWD.shopRes) delete CROWD.shopRes[k]; CROWD.enter(GM,'wz_teishoku'); const pick=CROWD.shopSeatPick(GM); if(!pick) continue;
    const G2=mkG(d,h); const r=enter('wz_teishoku',G2,'heroine_05'); const s=r.d&&r.d.place&&r.d.place.seat; if(!s) continue; const G3=mkG(d,h); build('wz_teishoku',G3); for(const k in CROWD.shopRes) delete CROWD.shopRes[k]; CROWD.enter(GM,'wz_teishoku');
    if(ppl().some(m=>near(m.seat,s.x,s.z))){ had++; const G4=mkG(d,h); enter('wz_teishoku',G4,'heroine_05'); if(!ppl().some(m=>near(m.seat,s.x,s.z))) freed++; } }
  check('1. 沒有預約時路人會坐的那個位子（'+had+' 次），預約以後一次都沒有人坐',had===freed,had+'/'+freed);
  const G=mkG(SATS[0],10.5); const r1=enter('wz_brunch',G,'classmate_xinci'); const s1=JSON.stringify(r1.d.place); const r2=enter('wz_brunch',G,'classmate_xinci'); check('1. 同一天同一時段再進來：同一個位子',JSON.stringify(r2.d.place)===s1);
  const Gp=mkG(SATS[0],10.5); build('wz_brunch',Gp); const st=E.zone.seats[3]; E.player.seat=st; const R=SHOPENC.rec(Gp), k=SHOPENC.key(Gp,'wz_brunch'); R.dec[k]={who:'classmate_xinci',spot:'wz_brunch'}; const d=SHOPENC.enter(GM,'wz_brunch'); check('1. 玩家坐著的位子不給她',!!d.place&&!near(d.place.seat,st.x,st.z,0.12)); }
// ---------- 2. 站著的店 ----------
{ const bad=[]; let n=0;
  for(const [z,who,hs,days] of [['bookstore','classmate_mingxuan',[11.25,12.5,13.5],SATS],['cvs','kai',[23.25,24.5],DAYS],['wz_print','classmate_bohan',[19.25,20.5],DAYS]]){
    for(const d of days) for(const h of hs){ const G=mkG(d,h); const r=enter(z,G,who); const p=r.d&&r.d.place&&r.d.place.stand; if(!p){ bad.push(z+' 沒有站的地方'); continue; } n++;
      if(ppl().some(m=>!m.seat&&Math.hypot(m.obj.position.x-p[0],m.obj.position.z-p[1])<0.45)) bad.push(z+' 路人站在她的位置 '+d+'@'+h);
      if(E.interactables.some(i=>!i.seat&&!i.hidden&&Math.hypot(i.x-p[0],i.z-p[1])<(i.exit?1.0:0.45))) bad.push(z+' 站在按鈕上');
      if(!E.canStand(p[0],p[1],0.3,0)) bad.push(z+' 站不住'); if(!CROWD.shopStandReserved(z,p[0],p[1],G)) bad.push(z+' 沒有預約'); } }
  check('2. 書店、便利商店、影印店：站在架子、櫃台前面，路人不站那裡、不在按鈕上、站得住（'+n+' 次）',!bad.length&&n>=40,bad.slice(0,4).join('；'));
  const pay=CROWD.SHOP_ZONES.cvs.units.find(u=>u.kind==='pay').stand; const G=mkG(DAYS[0],23.5); const r=enter('cvs',G,'kai'); check('2. 便利商店不站排隊結帳那一格（留給結帳的客人）',!!r.d.place.stand&&Math.hypot(r.d.place.stand[0]-pay[0],r.d.place.stand[1]-pay[1])>0.3);
  const Gn=mkG(DAYS[0]+1,23.5); check('2. 隔天站的預約自動失效',!CROWD.shopStandReserved('cvs',r.d.place.stand[0],r.d.place.stand[1],Gn)); }
// ---------- 3. 兩點半 Café ----------
{ const bad=[]; for(const d of SATS) for(const h of [14.25,15.5,16.5]){ global.STORY.cafeCustomers=()=>[0,2]; const G=mkG(d,h); const z=build('cafe',G); for(const k in CROWD.shopRes) delete CROWD.shopRes[k];
    const R=SHOPENC.rec(G), k=SHOPENC.key(G,'cafe'); R.dec[k]={who:'heroine_01',spot:'cafe'}; const dd=SHOPENC.enter(GM,'cafe'); const s=dd.place&&dd.place.seat; if(!s){ bad.push('沒有位子'); continue; }
    const i=z.seats.findIndex(q=>near(q,s.x,s.z,0.12)); const q=z.seats[i]; if(i===5||i===0||i===2||q.bar||q.sofa) bad.push('坐了 '+i+(q.bar?' 吧檯':'')+(q.sofa?' 沙發':'')); if(!CROWD.shopReserved('cafe',q,G)) bad.push('沒有預約'); }
  check('3. Café：不坐學姊的位子（5）、吧檯、沙發、今天客人的位子（0、2）；有預約',!bad.length,bad.join('；')); delete global.STORY.cafeCustomers; }
// ---------- 4. SHOPENC.after ----------
{ const G=mkG(SATS[0],15), r=enter('bookstore',G,'npc_songzn'); SHOPENC.after(GM,'bookstore'); const zn=E.npcs.find(n=>n.shopZn);
  check('4. 宋知寧站在書架前（預約的那一點）、按鈕「看二手書架」、女生的路人底模、17:00 走',!!zn&&Math.hypot(zn.obj.position.x-r.d.place.stand[0],zn.obj.position.z-r.d.place.stand[1])<0.01&&zn.talkLabel==='看二手書架'&&zn.obj.userData.spec.sex==='f'&&zn.until===17&&typeof zn.talk==='function');
  SHOPENC.after(GM,'bookstore'); check('4. 再叫一次不會多一個',E.npcs.filter(n=>n.shopZn).length===1);
  const G2=mkG(SATS[1],15,{flags:{SHOP_ZN_MET:true}}); enter('bookstore',G2,'npc_songzn'); SHOPENC.after(GM,'bookstore'); const z2=E.npcs.find(n=>n.shopZn); check('4. 認識以後：名字「知寧」、按鈕「和知寧說話」',!!z2&&z2.name==='知寧'&&z2.talkLabel==='和知寧說話');
  const G3=mkG(SATS[0],12); enter('bookstore',G3,'classmate_mingxuan'); NPC.classmate_mingxuan={name:'明軒',talkLabel:'和明軒說話'}; SHOPENC.after(GM,'bookstore'); check('4. 朋友的按鈕：「和明軒打招呼」',NPC.classmate_mingxuan.talkLabel==='和明軒打招呼'&&NPC.classmate_mingxuan.shopEnc===true); }
// ---------- 5. 路人句 ----------
(async()=>{
  { let pairs=0, singles=0, bad=[]; for(const d of DAYS.slice(0,6)) for(const z of ['wz_teishoku','wz_lin','l118_korea','l118_home']){ const G=mkG(d,12.5); enter(z,G); const by={};
      for(const n of ppl()){ (by[n.crowd]||(by[n.crowd]=[])).push(n); }
      for(const id in by){ const L=by[id]; if(L.length===2){ pairs++; if(!(L.every(m=>m.talkLabel==='聽一句'&&m.yieldIt))) bad.push(z+' 兩人一桌沒有「聽一句」'); } else { singles++; if(L.some(m=>m.talk)) bad.push(z+' 一個人吃飯的也說'); } } }
    check('5. 吃飯的店：兩人一桌兩個人都可以點（聽一句、yieldIt）；一個人吃飯的不說（'+pairs+' 桌兩人、'+singles+' 組一人）',!bad.length&&pairs>=10,bad.slice(0,3).join('；')); }
  { const G=mkG(DAYS[0],12.5); enter('wz_teishoku',G); const tb=ppl().filter(n=>n.talk); const a=tb[0], b=tb.find(m=>m!==a&&m.crowd===a.crowd); SAYS.length=0; await a.talk(); const first=SAYS.slice(); SAYS.length=0; await b.talk(); const second=SAYS.slice();
    const dine=SHOP_ENC.hear.dine.map(q=>q.pair.map(x=>'路人：'+x[1]).join('|'));
    check('5. 點一桌：照 A／B 講完那一組（說話的人「路人」）；點同一桌另一個人是同一組',first.length>=2&&dine.includes(first.join('|'))&&first.join()===second.join(),JSON.stringify(first));
    const used=new Set([first.join('|')]); let dup=false, n=1; for(const z of ['wz_lin','l118_korea','l118_home','l118_omu','l118_dian','l118_self']){ G.zone=z; enter(z,G); const by={}; for(const m of ppl()) if(m.talk) (by[m.crowd]||(by[m.crowd]=m)); for(const id in by){ SAYS.length=0; await by[id].talk(); if(!SAYS.length) continue; n++; const k=SAYS.join('|'); if(used.has(k)) dup=true; used.add(k); } }
    check('5. 同一天換店再點：不重複（'+n+' 桌、8 組用完就不說）',!dup&&n<=8); }
  { const G=mkG(SATS[0],12.5); enter('bookstore',G); const st=ppl(); const q=SHOP_ENC.hear.quiet.slice(0,6); SAYS.length=0; for(const m of st) if(m.talk) await m.talk(); const got=SAYS.map(s=>s.replace(/^路人：/,''));
    check('5. 書店站著的客人：「（小聲）」第 1～6 句、不重複',st.length>0&&got.length>0&&got.every(t=>q.includes(t))&&new Set(got).size===got.length,JSON.stringify(got));
    let G2=null, pay=[], shelf=[]; for(const d of DAYS) for(const h of [12,12.5,13,18,18.5,19]){ if(pay.length) break; G2=mkG(d,h); enter('cvs',G2); pay=ppl().filter(m=>m.crowdRole==='shop_pay'); shelf=ppl().filter(m=>m.crowdRole==='shop_stand'); }
    check('5. 便利商店：只有排隊結帳的人說（貨架前面的不說）',pay.length>0&&shelf.length>0&&shelf.every(m=>!m.talk)&&pay.every(m=>m.talkLabel==='聽一句'),pay.length+'/'+shelf.length);
    if(pay.length){ SAYS.length=0; await pay[0].talk(); check('5. 結帳那一句是 AA_640 第 ③ 節的',SAYS.length===1&&SHOP_ENC.hear.cvs.includes(SAYS[0].replace(/^路人：/,'')),JSON.stringify(SAYS)); }
    const G3=mkG(DAYS[0],12.5); enter('wz_print',G3); check('5. 影印店的客人不說',ppl().every(m=>!m.talk));
    const G4=mkG(DAYS[0]+2,15); enter('wz_teahouse',G4); check('5. 一盞的客人不說',ppl().every(m=>!m.talk)); }
  { const G=mkG(SATS[0],15); enter('l118_cafe2',G); const c=ppl().filter(m=>m.talk); SAYS.length=0; for(const m of c) await m.talk(); const Q=SHOP_ENC.hear.quiet, ok=[Q[1],Q[2],Q[3],Q[4],Q[6]];
    check('5. 慢讀咖啡：Café 的那五句（第 2～5、7）',SAYS.length>0&&SAYS.every(s=>ok.includes(s.replace(/^路人：/,''))),JSON.stringify(SAYS));
    const n=c[0]; if(n){ SAYS.length=0; await n.talk(); const a=SAYS.join(); SAYS.length=0; await n.talk(); check('5. 同一位客人再點一次：同一句',a===SAYS.join()&&!!a); } }
  // ---------- 6. 一起坐 ----------
  { const row=SHOP_ENC.rows.find(r=>r.who==='classmate_xinci'&&r.spot==='wz_brunch'), bad=[]; let n=0, stood=0;
    for(const d of SATS) for(const h of [10.25,11.5]){ const G=mkG(d,h); const r=enter('wz_brunch',G,'classmate_xinci'); const s=r.d&&r.d.place&&r.d.place.seat; if(!s) continue;
      const her={seat:E.zone.seats.find(q=>near(q,s.x,s.z,0.12)),obj:{position:new THREE.Vector3(s.x,0,s.z)},lv:0}; let sat=null; const sit0=GM.sitAt; GM.sitAt=(e,st)=>{ sat=st; sit0(e,st); };
      SAYS.length=0; const h0=G.hour; const st=await SHOPENC.sitTogether(GM,row,her); GM.sitAt=sit0; n++;
      if(Math.abs(G.hour-h0-0.5)>1e-9) bad.push('時間沒走 30 分鐘'); if(SAYS[SAYS.length-1]!==SHOP_ENC.aa641.joinLine) bad.push('沒有旁白');
      if(!st){ stood++; continue; } if(sat!==st) bad.push('沒坐下'); if(E.player.seat) bad.push('沒站起來');
      const dd=Math.hypot(st.x-s.x,st.z-s.z); if(dd<0.2||dd>=2.2) bad.push('不在旁邊 '+dd.toFixed(2)); if(ppl().some(m=>near(m.seat,st.x,st.z)||near(m.seatTarget,st.x,st.z))) bad.push('坐到路人的位子'); }
    check('6. 一起坐（半熟，'+n+' 次、站著 '+stood+' 次）：坐在她旁邊 2.2 m 以內的空位（不是她的、不是路人的）、30 分鐘、旁白、站起來',!bad.length&&n>=8&&stood<n,bad.slice(0,4).join('；'));
    const G=mkG(SATS[0],10.25); const r=enter('wz_brunch',G,'classmate_xinci'); const s=r.d.place.seat; for(const q of E.zone.seats) if(!near(q,s.x,s.z,0.12)) q.taken=true;
    const her={seat:E.zone.seats.find(q=>near(q,s.x,s.z,0.12)),obj:{position:new THREE.Vector3(s.x,0,s.z)},lv:0}; const h0=G.hour; const st=await SHOPENC.sitTogether(GM,row,her); for(const q of E.zone.seats) delete q.taken;
    check('6. 旁邊沒有空位：站著（不坐別人的位子），照樣走 30 分鐘',st===null&&!E.player.seat&&Math.abs(G.hour-h0-0.5)<1e-9); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
