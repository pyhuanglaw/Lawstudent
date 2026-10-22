// 溫州街小公園：誰幾點在、走進公園的一句、點路人的一句（AA_283，企劃線 8b312c12，AA-C 定稿；DL-13／AA283-PARK-1021）——不需要瀏覽器。
// 照 AA_283 第 4 節：
//   1. 平日、週末、寒暑假、下雨各看一次：表上的人在、時段外的人不在（PARK.groups 的表＋在 Node 裡建出真正的溫州街，CROWD 照時段放的 3D 路人：人數、位置站得住、坐的位子、玩家的位子空著）；
//      國定假日照週末、校定停課日（運動會）照平日；下雨一個人都沒有、貓在涼亭的石桌底下（象棋的互動點藏起來）；大三上第 9 週路人照常、只有貓不在。
//   2. 走進公園的旁白：一天第一次走進去才播、照當時的時段（重疊照表上面那一列）；同一天第二次走進去不播；和 AA_171 7b 那一句不同一天播兩句（兩個方向都擋）。
//   3. 點路人：一個人一天一次（說完就不能再點、出去再進來也一樣、隔天又可以）；同一種人輪流說、不連續重複（12～2 月阿嬤多一句）；玩家取名麻糬時孩子那句換句；
//      學生、情侶只有旁白；下象棋的阿伯＝AA_171 的下一盤；不記關係。
//   4. 大三起週二、週四 17:00 的課輔班：老師不取名（沒有沛珊）、走在最後面；從入口 B 那一側排成一排走到入口 A。
// 修改前：沒有 PARK.groups（第 0 項就失敗）。用法：node tests/wz_park_people_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/wzpark3d.js','src/crowd3d.js'];
const _warn=console.warn; console.warn=()=>{};   /* 正式模型在 Node 裡載不到（用套件的外觀）：不印 */
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR|PARK|CROWD)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0. 有 PARK.groups、entryLine、entryTick、tap、bindTap；CROWD 有小公園的人（wzpark_*）',typeof PARK!=='undefined'&&['groups','entryLine','entryTick','tap','bindTap','tapPick'].every(k=>typeof PARK[k]==='function')&&typeof CROWD!=='undefined'&&CROWD.SPOTS.some(s=>/^wzpark_/.test(s.id)));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const termDay=(id,wk,wd)=>{ for(let d=-400;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===wk&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const mk=(day,hour,o)=>Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,flags:{},daily:{},zone:'wenzhou',weather:'clear'},o||{});
const ids=(G,h)=>PARK.groupsAt(G,h).map(g=>g.id).join(',');
const TUE=dayOf('2025-10-07'), WED=dayOf('2025-10-08'), SAT=dayOf('2025-10-11'), NATDAY=dayOf('2025-10-10'), SPORTS=dayOf('2025-11-21'), WINTER=dayOf('2026-01-20'), SUMMER=dayOf('2026-07-14'), DEC=dayOf('2025-12-16');
const Y3W9=termDay('Y3S1',9,2), Y3TUE=termDay('Y3S1',5,2), Y3THU=termDay('Y3S1',5,4);
(async()=>{
// ===================== 1. 誰幾點在（第 1 節的表）=====================
{ const G=mk(TUE,0); const want=[[6.5,'am'],[7.5,'am,dog'],[8.5,'dog,chess'],[9.5,'chess'],[11.5,''],[12.5,'office'],[14,''],[16,'kids'],[17.1,'kids,tutor'],[17.6,''],[18.5,'walk'],[21,'night'],[23,''],[5,'']];
  const got=want.map(([h])=>ids(G,h)); check('1. 平日（週二，學期中）：06 晨運、07 遛狗、08 象棋、12 上班族、15:30 孩子、17:00 課輔班、18 散步、20 學生情侶；時段外沒有人',want.every(([h,w],i)=>got[i]===w),want.map(([h],i)=>h+'→'+(got[i]||'無')).join(' ')); }
check('1. 週三 17:10：只有孩子（課輔班只有週二、週四）',ids(mk(WED,0),17.1)==='kids',ids(mk(WED,0),17.1));
check('1. 週四 17:10：課輔班',ids(mk(dayOf('2025-10-09'),0),17.1)==='kids,tutor');
{ const G=mk(SAT,0); const got=[[10.5,'chess,kids'],[12.5,'picnic,kids'],[16,'kids'],[17.1,'kids'],[17.6,''],[9.5,'chess']].map(([h,w])=>[h,w,ids(G,h)]);
  check('1. 週末：中午換成一家人野餐（沒有上班族）、孩子提早到 10:00～17:30、沒有課輔班',got.every(q=>q[1]===q[2]),got.map(q=>q[0]+'→'+(q[2]||'無')).join(' ')); }
check('1. 國定假日（10/10 週五）照週末：中午一家人、10:30 有孩子',ids(mk(NATDAY,0),12.5)==='picnic,kids'&&ids(mk(NATDAY,0),10.5)==='chess,kids');
check('1. 校定停課日（11/21 運動會，週五）國小、上班的人照常：中午上班族、10:30 沒有孩子',ids(mk(SPORTS,0),12.5)==='office'&&ids(mk(SPORTS,0),10.5)==='chess');
for(const [nm,d] of [['寒假（1/20 週二）',WINTER],['暑假（7/14 週二）',SUMMER]]){ const G=mk(d,0); const got=[[9.5,'chess,kids'],[11.5,''],[12.5,'office'],[15.2,'kids'],[16.5,'kids'],[17.1,''],[18.5,'walk']].map(([h,w])=>[h,w,ids(G,h)]);
  check('1. '+nm+'：孩子 09:00～11:00、15:00～17:00；週二也沒有課輔班；上班族照常',PARK.onBreak(G)&&got.every(q=>q[1]===q[2]),got.map(q=>q[0]+'→'+(q[2]||'無')).join(' ')); }
{ const G=mk(TUE,0,{weather:'rain'}); const any=[6.5,7.5,8.5,12.5,16,17.1,18.5,21].some(h=>PARK.groupsAt(G,h).length); check('1. 下雨：一個人都沒有（每個時段）',!any&&PARK.catUnder(G)); }
{ const G=mk(Y3W9,0); check('1. 大三上第 9 週（週二）：貓不見，路人照常（和平常的週二一樣，有課輔班）',PARK.catLost(G)&&[6.5,7.5,8.5,12.5,16,17.1,18.5,21].map(h=>ids(G,h)).join('|')===[6.5,7.5,8.5,12.5,16,17.1,18.5,21].map(h=>ids(mk(TUE,0),h)).join('|')&&!PARK.catUnder(mk(Y3W9,0,{weather:'rain'}))); }
// ===================== 3D：真正的溫州街＋CROWD =====================
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,name:'',sex:i%2===0?'f':'m',height:i%2===0?1.6:1.72})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.wenzhou.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
E.player={obj:{position:new THREE.Vector3(26,0,0),rotation:{y:0}},radius:0.32,lv:0}; E.camera=null;
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const L=WZ_PARK_LAYOUT, treeSeats=L.seats.filter(s=>/老樹下的圓椅/.test(s.label)), swings=L.seats.filter(s=>s.kind==='swing').sort((a,b)=>a.x-b.x);
const mkGM=(G,log)=>({G,E,hourRate:1/150,sceneBegin(){},sceneEnd(){},face(){},caption:(w,t)=>{ if(log) log.cap.push(t); },say:async(w,t)=>{ if(log) log.say.push((w&&w.name?w.name+'：':'')+t); },toast(t){ if(log) log.toast.push(t); },advance(h){ G.hour+=h; },choose:async o=>o.length-1});
const park=()=>E.npcs.filter(n=>/^wzpark_/.test(n.crowd||''));
const by=id=>park().filter(n=>n.crowd==='wzpark_'+id);
const enter=G=>{ for(const n of E.npcs.slice()) E.removeNPC(n); CROWD.enter(mkGM(G),'wenzhou'); return park(); };
const pos=n=>[n.obj.position.x,n.obj.position.z];
const near=(a,b,r)=>Math.hypot(a[0]-b[0],a[1]-b[1])<(r||0.4);
{ const bad=[]; for(const d of [TUE,WED,SAT,WINTER,Y3TUE]) for(const h of [6.5,7.5,8.5,10.5,12.5,16,17.1,18.5,21]){ enter(mk(d,h)); for(const n of park()){ const p=pos(n); if(n.hidden) continue; if(n.seat) continue; if(!E.canStand(p[0],p[1],0.3,0)) bad.push(n.crowdKey+' ('+p.map(v=>v.toFixed(2))+')'); } }
  check('1. 3D：平日、週末、寒假、大三的每個時段，站著、走著的人都站得住（不在遊戲場、涼亭的桌子、樹圍座椅、花籬裡）',!bad.length,bad.slice(0,4).join(' | ')); }
{ const dup=[]; for(const d of [TUE,SAT,WINTER,Y3TUE]) for(const h of [7.5,8.5,10.5,12.5,16,17.1,21]){ enter(mk(d,h)); const sp=park().map(n=>n.obj.userData.spec.id); if(new Set(sp).size!==sp.length) dup.push(d+'@'+h); }
  check('1. 3D：同時在公園裡的人路人編號都不一樣（一樣的編號＝一模一樣的人）',!dup.length,dup.join(',')); }
{ enter(mk(TUE,6.5)); const am=by('am'); check('1. 3D 06:30：晨運的阿伯阿嬤 4～6 人（環狀步道、健身器材），沒有別人',am.length>=4&&am.length<=6&&park().length===am.length&&am.every(n=>n.crowdRole==='am_f'||n.crowdRole==='am_m')&&am.some(n=>n.crowdRole==='am_f')&&am.some(n=>n.crowdRole==='am_m'),am.length+' 人 '+am.map(n=>n.crowdRole).join(',')); }
{ STORY.CROWD_X=2; enter(mk(TUE,6.5)); const n2=by('am').length; delete STORY.CROWD_X; enter(mk(TUE,6.5)); check('1. 3D：人數照表，不跟著路人加倍（STORY.CROWD_X）',n2===by('am').length&&n2<=6,n2+' / '+by('am').length); }
{ enter(mk(TUE,8.5)); const dog=by('dog'), ch=by('chess'); const play=ch.filter(n=>n.crowdRole==='chess_play'), watch=ch.filter(n=>n.crowdRole==='chess_watch'); const stools=L.seats.filter(s=>/涼亭的石凳/.test(s.label));
  check('1. 3D 08:30：遛狗的人 1～2（繞環狀步道走）；象棋：兩個阿伯坐在兩張石凳上、旁邊 1～2 個站著看（都是男的）',dog.length>=1&&dog.length<=2&&dog.every(n=>n.beh==='route'&&n.waypoints&&n.waypoints.length===12&&!n.frozen)&&play.length===2&&stools.every(s=>play.some(n=>n.seat&&near([n.seat.x,n.seat.z],[s.x,s.z],0.05)))&&watch.length>=1&&watch.length<=2&&ch.every(n=>n.obj.userData.spec.sex==='m'),
    'dog '+dog.length+' chess '+play.length+'+'+watch.length); }
{ const seatsFree=()=>treeSeats.every(s=>!E.npcs.some(n=>n.seat&&near([n.seat.x,n.seat.z],[s.x,s.z],0.45)));
  enter(mk(TUE,12.5)); const off=by('noon'); check('1. 3D 平日 12:30：上班族兩個坐樹下圓椅（男的）；玩家的三個圓椅位子空著',off.length===2&&off.every(n=>n.crowdRole==='office'&&n.seat&&n.pose==='sit'&&n.obj.userData.spec.sex==='m')&&seatsFree(),off.length+' 人');
  enter(mk(SAT,12.5)); const fam=by('noon'); check('1. 3D 週末 12:30：一家人 3～4（大人兩個坐樹下圓椅、孩子在旁邊跑，比大人矮）；玩家的位子空著',fam.length>=3&&fam.length<=4&&fam.filter(n=>n.seat).length===2&&fam.filter(n=>!n.seat).every(n=>n.beh==='wander'&&n.obj.userData.spec.height<1.4)&&seatsFree(),fam.length+' 人'); }
{ enter(mk(TUE,16)); const k=by('kids'); const gma=k.find(n=>n.crowdRole==='grandma'), kids=k.filter(n=>n.crowdRole==='kid'); const gs=L.seats.find(s=>/看孩子玩/.test(s.label));
  check('1. 3D 平日 16:00：放學的孩子＋帶孫子的阿嬤 3～5；阿嬤坐「看孩子玩」的長椅，孩子坐鞦韆、在遊戲場旁邊跑（身高 1.2～1.35 m）',k.length>=3&&k.length<=5&&!!gma&&gma.seat&&near([gma.seat.x,gma.seat.z],[gs.x,gs.z],0.05)&&kids.length===k.length-1&&kids.every(n=>n.obj.userData.spec.height>=1.2&&n.obj.userData.spec.height<=1.35)&&kids.some(n=>n.seat&&near([n.seat.x,n.seat.z],[swings[0].x,swings[0].z],0.05)),k.length+' 人');
  const sk=kids.find(n=>n.seat); check('1. 3D：坐鞦韆的孩子抬到座面（0.48 m；縮小的人坐姿只有 0.47×身高/1.75）',!!sk&&Math.abs(sk.seat.lift-(0.48-0.47*sk.obj.userData.spec.height/1.75))<0.002&&Math.abs(sk.obj.position.y-(E.heightAt(sk.seat.x,sk.seat.z,0)+sk.seat.lift))<0.01,sk&&sk.seat.lift);
  enter(mk(WINTER,16.5)); check('1. 3D 寒假 16:30：孩子在',by('kids').length>=3); enter(mk(WINTER,17.1)); check('1. 3D 寒假週二 17:10：沒有課輔班、孩子也回家了',!park().length,park().map(n=>n.crowd).join(',')); }
{ enter(mk(TUE,18.5)); const w=by('walk'); check('1. 3D 18:30：散步的人 2～4（都是她，繞老樹走）',w.length>=2&&w.length<=4&&w.every(n=>n.beh==='route'&&n.obj.userData.spec.sex==='f'),w.length+' 人'); }
{ enter(mk(TUE,21)); const nt=by('night'); const onB=nt.filter(n=>n.seat&&near([n.seat.x,n.seat.z],[swings[1].x,swings[1].z],0.05)), onA=E.npcs.filter(n=>n.seat&&near([n.seat.x,n.seat.z],[swings[0].x,swings[0].z],0.45));
  check('1. 3D 21:00：學生、情侶 2～4；一個坐東邊的鞦韆，西邊的鞦韆空著給玩家（AA_171 第 4 節）',nt.length>=2&&nt.length<=4&&onB.length===1&&!onA.length&&nt.every(n=>n.crowdRole==='night'),nt.length+' 人'); }
{ enter(mk(TUE,23)); const a=park().length; enter(mk(TUE,5)); const b=park().length; enter(mk(TUE,8.5,{weather:'rain'})); const c=park().length; enter(mk(SAT,16,{weather:'rain'})); const d=park().length;
  check('1. 3D：23:00、05:00 只有貓（沒有人）；下雨（平日 08:30、週末 16:00）一個人都沒有',a+b+c+d===0,[a,b,c,d].join(',')); }
{ const g1=CROWD.group(mk(TUE,16),CROWD.SPOTS.find(s=>s.id==='wzpark_kids'),{key:'kids',t0:15.5,t1:17.5,n:[3,5]}), g2=CROWD.group(mk(TUE,16.4),CROWD.SPOTS.find(s=>s.id==='wzpark_kids'),{key:'kids',t0:15.5,t1:17.5,n:[3,5]});
  check('1. 3D：同一天同一時段是同一批人（出去再進來一樣）',JSON.stringify(g1)===JSON.stringify(g2)); }
{ /* 繞老樹走的路線：每一段都沿著環狀步道（不繞到樹下暖燈的另一邊）、照引擎真正的移動走得完 */
  const bad=[]; for(const [id,h] of [['walk',18.5],['dog',7.5]]){ const sp=CROWD.SPOTS.find(s=>s.id==='wzpark_'+id), G=mk(TUE,h); const lp=CROWD.group(G,sp,CROWD.slotAt(G,sp))[0].waypoints;
    for(let i=0;i<lp.length;i++){ const a=lp[i], b=lp[(i+1)%lp.length], p=E.pathTo(a[0],a[1],0,b[0],b[1],0); let len=0, px=a[0], pz=a[1]; for(const q of (p||[])){ len+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; } const w=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:1.05});
      if(!p||len>2||!w.ok) bad.push(id+' '+i+'：'+(p?len.toFixed(2)+' m':'走不到')+(w.ok?'':' '+w.reason)); } }
  check('1. 3D：散步、遛狗繞老樹的 12 段都沿著環狀步道（每段 2 m 以內）、走得完',!bad.length,bad.join(' | ')); }
{ /* 時段換了：坐著的站起來、繞圈的停下來，走出公園（不是瞬間消失）；時間跳了：直接重排 */
  const G=mk(TUE,12.9); enter(G); const gm=mkGM(G); CROWD.tick(gm,2); G.hour=13.01; CROWD.tick(gm,2); const lv=by('noon');
  check('1. 3D 13:00 午休結束：上班族站起來、走向入口 A（有路線、標記離開；圓椅的位子空出來）',lv.length===2&&lv.every(n=>n.leaving&&!n.seat&&n.path&&n.path.length&&n.beh==='idle'),lv.map(n=>!!n.leaving+'/'+(n.path?n.path.length:0)).join(' '));
  G.hour=16; CROWD.tick(gm,2); check('1. 3D 跳過時間到 16:00：直接重排（上班族不在、孩子在）',!by('noon').length&&by('kids').length>=3); }
// ===================== 下雨：貓在涼亭的石桌底下、沒有人下象棋 =====================
{ const build=G=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; const zz=Z3.ZONES.wenzhou.build(E); delete global.GAME; return zz; };
  const pav=L.items.find(i=>i.kind==='pavilion'), ring=L.items.find(i=>i.kind==='ring_bench');
  const Gr=mk(TUE,9,{weather:'rain'}); const zr=build(Gr); const cr=E.interactables.find(i=>i.park==='cat'), chr=E.interactables.find(i=>i.park==='chess'); global.GAME={G:Gr}; const hidR=chr&&chr.hidden; delete global.GAME; const catG=zr.group.getObjectByName('wz_cat');
  check('1. 下雨：貓的互動點在涼亭的石桌底下、貓放低到涼亭的地台（0.14 m）；象棋的互動點藏起來；PARK.interact 象棋＝沒有人',!!cr&&Math.hypot(cr.x-pav.x,cr.z-pav.z)<0.5&&!!catG&&Math.abs(catG.position.y-(0.14-0.45))<1e-6&&hidR===true&&(await PARK.interact(mkGM(Gr),{park:'chess'}))==='closed',cr&&('('+cr.x+','+cr.z+') y '+(catG&&catG.position.y)));
  const reach=(i,from)=>{ const R=i.radius-0.05, pts=[]; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; if(E.canStand(i.x+dx,i.z+dz,0.32,0)) pts.push([i.x+dx,i.z+dz]); } pts.sort((a,b)=>Math.hypot(a[0]-from[0],a[1]-from[1])-Math.hypot(b[0]-from[0],b[1]-from[1])); for(const q of pts.slice(0,30)) if(E.simWalk(from[0],from[1],q[0],q[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}).ok) return true; return false; };
  check('1. 下雨：石桌底下的貓摸得到（旁邊站得住、從主巷走得到）',!!cr&&reach(cr,[26,0]));
  const Gc=mk(TUE,9); build(Gc); const cc=E.interactables.find(i=>i.park==='cat'), chc=E.interactables.find(i=>i.park==='chess'); global.GAME={G:Gc}; const hidC=chc&&chc.hidden; delete global.GAME;
  check('1. 晴天：貓照舊在圓椅北邊、象棋照舊',!!cc&&Math.abs(cc.x-ring.x)<1e-6&&cc.z>ring.z+1&&hidC===false);
  const Gl=mk(Y3W9,9,{weather:'rain'}); build(Gl); check('1. 大三上第 9 週下雨：貓不見（石桌底下也沒有）',!E.interactables.some(i=>i.park==='cat'));
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; const z2=Z3.ZONES.wenzhou.build(E); E.zone=z2; E.nav=z2.nav; }
// ===================== 2. 走進公園的一句 =====================
const OUT=[26,0], IN=[26,8], IN_B=[10,19];
const walkIn=(G,log,pts)=>{ const gm=mkGM(G,log); for(const p of (pts||[OUT,IN])){ E.player.obj.position.set(p[0],0,p[1]); PARK.entryTick(gm); } return log.cap.slice(); };
const L0=()=>({cap:[],say:[],toast:[]});
{ PARK._wasIn=null; const G=mk(TUE,6.5); const a=walkIn(G,L0()), b=walkIn(G,L0()); G.day=TUE+1; G.hour=6.5; const c=walkIn(G,L0());
  check('2. 06:30 走進公園：「阿嬤們在甩手，數到一百就換一隻。」；同一天第二次走進去不播；隔天又播',a.join()==='阿嬤們在甩手，數到一百就換一隻。'&&!b.length&&c.length===1,[a,b,c].map(x=>x.join('')||'（無）').join(' / ')); }
{ const one=(G)=>{ PARK._wasIn=null; return walkIn(G,L0()).join('')||'（無）'; };
  const rows=[['07:30（晨運和遛狗重疊：照上面那一列）',mk(TUE,7.5),PARK.ENTRY.am],['08:30（遛狗和象棋重疊：照上面那一列）',mk(TUE,8.5),PARK.ENTRY.dog],['10:00',mk(TUE,10),PARK.ENTRY.chess],['平日 12:30',mk(TUE,12.5),PARK.ENTRY.office],['週末 12:30',mk(SAT,12.5),PARK.ENTRY.picnic],
    ['平日 16:00',mk(TUE,16),PARK.ENTRY.kids],['週二 17:05（課輔班那二十分鐘）',mk(TUE,17+1/12),PARK.ENTRY.tutor],['週三 17:05',mk(WED,17+1/12),PARK.ENTRY.kids],['18:30',mk(TUE,18.5),PARK.ENTRY.walk],['21:00',mk(TUE,21),PARK.ENTRY.night],
    ['22:30（還沒取名）',mk(TUE,22.5),'公園沒有人。圓椅上只剩那隻貓。'],['23:30（取名所長）',mk(TUE,23.5,{daily:{park:{catName:'所長'}}}),'公園沒有人。圓椅上只剩所長。'],['過了午夜 01:00（G.hour 25）',mk(TUE,25),'公園沒有人。圓椅上只剩那隻貓。'],
    ['下雨',mk(TUE,10,{weather:'rain'}),PARK.ENTRY.rain],['寒假 09:30（象棋在孩子上面）',mk(WINTER,9.5),PARK.ENTRY.chess],['寒假 15:15',mk(WINTER,15.25),PARK.ENTRY.kids]];
  const bad=rows.filter(([nm,G,w])=>one(G)!==w); check('2. 照當時的時段播那一句（'+rows.length+' 種情況）',!bad.length,bad.map(([nm,G,w])=>nm+'：'+one(G)).join(' | '));
  const lost=[['08:30',mk(Y3W9,8.5),PARK.ENTRY.chess],['23:00',mk(Y3W9,23),'（無）'],['下雨',mk(Y3W9,10,{weather:'rain'}),'（無）'],['16:00',mk(Y3W9,16),PARK.ENTRY.kids]];
  const bl=lost.filter(([nm,G,w])=>one(G)!==w); check('2. 大三上第 9 週（貓不見）：提到貓的不播（08:30 改成象棋那句、23:00 和下雨不播）、其他照常',!bl.length,bl.map(([nm,G,w])=>nm+'：'+one(G)).join(' | ')); }
{ PARK._wasIn=null; const G=mk(TUE,14); const a=walkIn(G,L0()); G.hour=16; const b=walkIn(G,L0()); const c=walkIn(G,L0());
  check('2. 平日 14:00 走進去（那個時段沒有人）不播、也不算掉；16:00 再走進去播孩子那句；之後不播',!a.length&&b.join()===PARK.ENTRY.kids&&!c.length,[a,b,c].map(x=>x.join('')||'（無）').join(' / ')); }
{ PARK._wasIn=null; const G=mk(TUE,6.5); const a=walkIn(G,L0(),[[5.8,16],IN_B]); check('2. 從入口 B（北巷）走進來也算',a.join()===PARK.ENTRY.am,a.join('')); }
{ PARK._wasIn=null; const G=mk(TUE,8.5); const a=walkIn(G,L0(),[[26,4.8],[30,3]]); check('2. 只在主巷走過入口 A（沒有走進去）不播',!a.length); }
{ /* 和 AA_171 7b（story3d.js AMBIENT 的 park）不同一天播兩句 */
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=st.match(/key:'park',from:16,to:21,lines:(G=>\{.*?\})\}\];/); let f=null; try{ f=m&&eval('(PARK=>'+m[1]+')')(PARK); }catch(e){}
  PARK._wasIn=null; const G=mk(TUE,16.5); const before=f&&f(G); walkIn(G,L0()); const after=f&&f(G);
  check('2. 走進公園那句播過了：7b「老樹下的圓椅上有隻貓在睡覺……」當天不播',!!f&&Array.isArray(before)&&after===null,m?'':'找不到 7b');
  PARK._wasIn=null; const G2=mk(TUE,17.75); G2.flags.amb={['park'+TUE]:true}; const c=walkIn(G2,L0()); G2.hour=18.5; const c2=walkIn(G2,L0());
  check('2. 7b 那句今天播過了：走進公園那句當天不播（換時段再走進去也不播）',!c.length&&!c2.length);
  check('2. 下雨（貓在涼亭的石桌底下、公園沒有人）：7b 不播',!!f&&f(mk(TUE,17,{weather:'rain'}))===null);
  const ix=st.indexOf('PARK.entryTick(GM)'), ia=st.indexOf('for(const a of AMBIENT)'); check('2. story3d.js 的 S.tick 每一格叫 PARK.entryTick，而且在環境事件（7b）前面',ix>0&&ia>0&&ix<ia); }
{ PARK._wasIn=null; const G=mk(TUE,6.5,{daily:{}}); delete G.daily; const a=walkIn(G,L0()); check('2. 舊存檔（沒有 G.daily）：照樣播，之後記 entryDay',a.length===1&&G.daily.park.entryDay===TUE); }
// ===================== 3. 點路人 =====================
const tapSay=async(G,role,key,n)=>{ const lg=L0(); await PARK.tap(mkGM(G,lg),n||null,key,role); return lg.say; };
{ const G=mk(TUE,6.5); const n={}, lg=L0(); PARK.bindTap(mkGM(G,lg),n,{key:'k1',role:'am_m'}); const lbl=n.talkLabel; await n.talk(n); const s1=lg.say.slice();
  const again=await tapSay(G,'am_m','k1'); const n2={}; PARK.bindTap(mkGM(G),n2,{key:'k1',role:'am_m'});
  G.day=TUE+1; const n3={}; PARK.bindTap(mkGM(G),n3,{key:'k1',role:'am_m'});
  check('3. 點晨運的阿伯：「（他甩著手，對你點了一下頭。）」（旁白）；說完按鈕不見；同一天再點、重新放一次（出去再進來）都不能點；隔天又可以',lbl==='打招呼'&&s1.join()==='（他甩著手，對你點了一下頭。）'&&n.talk===null&&!again.length&&n2.talk===null&&typeof n3.talk==='function',JSON.stringify([lbl,s1,again,!!n2.talk,!!n3.talk])); }
{ const G=mk(TUE,6.5); const out=[]; for(let i=0;i<5;i++) out.push((await tapSay(G,'am_f','a'+i)).join(''));
  const Gw=mk(DEC,6.5); const ow=[]; for(let i=0;i<4;i++) ow.push((await tapSay(Gw,'am_f','w'+i)).join(''));
  const noRep=L=>L.every((t,i)=>i===0||t!==L[i-1]);
  check('3. 晨運的阿嬤輪流說、不連續重複（10 月兩句；12～2 月多一句「今天冷，手要甩久一點。」）',out.join('|')==='晨運的阿嬤：少年仔，這麼早？|晨運的阿嬤：你們讀書的，要多動。|晨運的阿嬤：少年仔，這麼早？|晨運的阿嬤：你們讀書的，要多動。|晨運的阿嬤：少年仔，這麼早？'&&noRep(out)&&ow.join('|')==='晨運的阿嬤：少年仔，這麼早？|晨運的阿嬤：你們讀書的，要多動。|晨運的阿嬤：今天冷，手要甩久一點。|晨運的阿嬤：少年仔，這麼早？'&&noRep(ow),out.join('|')+' ／ '+ow.join('|'));
  const Gs=mk(dayOf('2026-03-03'),6.5,{daily:{park:{pplLast:{am_f:2}}}}); const sp=(await tapSay(Gs,'am_f','s1')).join(''); check('3. 2 月說了第三句、3 月沒有那一句：接著從第一句說（不卡住、不重複）',sp==='晨運的阿嬤：少年仔，這麼早？',sp); }
{ const kid=async catName=>{ const G=mk(TUE,16,{daily:{park:catName?{catName}:{}}}); const a=await tapSay(G,'kid','c1'), b=await tapSay(G,'kid','c2'); return [a.join(''),b.join('')]; };
  const none=await kid(null), mochi=await kid('麻糬'), boss=await kid('所長');
  check('3. 放學的孩子：「哥哥，你要盪鞦韆要排隊喔。」→「你知道那隻貓叫什麼嗎？……我們都叫牠麻糬。」',none.join('|')==='放學的孩子：哥哥，你要盪鞦韆要排隊喔。|放學的孩子：你知道那隻貓叫什麼嗎？……我們都叫牠麻糬。',none.join('|'));
  check('3. 玩家取名麻糬：換成「我們都叫牠麻糬。……你也是？」；取名所長照原句',mochi[1]==='放學的孩子：我們都叫牠麻糬。……你也是？'&&boss[1]==='放學的孩子：你知道那隻貓叫什麼嗎？……我們都叫牠麻糬。',mochi[1]+' ／ '+boss[1]);
  const wk=(await tapSay(mk(SAT,11),'kid','w1')).join(''); check('3. 週末的孩子不是「放學的」（對話框寫「孩子」）',wk==='孩子：哥哥，你要盪鞦韆要排隊喔。',wk); }
{ const G=mk(TUE,12.5); const rows=[['dog','遛狗的人：牠不咬人啦，牠只是想看貓。'],['chess_watch','圍觀象棋的：看就好，不要講話。'],['office','（他對你點了一下頭，繼續吃便當。）'],['grandma','帶孫子的阿嬤：孫子啦。他媽媽六點才下班。'],
    ['tutor','課輔班的老師：不好意思，借過一下。|（孩子在後面跟著說「借過——」）'],['walker','（她點點頭，繼續走她的第三圈。）'],['night','你決定不要打擾他們。']];
  const bad=[]; let i=0; for(const [r,w] of rows){ const s=(await tapSay(G,r,'r'+(i++))).join('|'); if(s!==w) bad.push(r+'：'+s); }
  const d2=(await tapSay(G,'dog','d2')).join(''); check('3. 每一種人說的（照第 3 節原文；括號＝旁白）；遛狗的人第二個說「早！」',!bad.length&&d2==='遛狗的人：早！',bad.join(' | ')||d2); }
{ const G=mk(TUE,9); const lg=L0(); const gm=mkGM(G,lg); const n={}; PARK.bindTap(gm,n,{key:'p1',role:'chess_play'}); const lbl=n.talkLabel; await n.talk(n); const n2={}, n3={}; PARK.bindTap(gm,n2,{key:'f1',role:'family'}); PARK.bindTap(gm,n3,{key:'t1',role:'tutor_kid'});
  check('3. 下象棋的阿伯＝AA_171 第 3 節的下一盤（「年輕人，紅的給你。」）、可以一直下；一家人、課輔班的孩子不能點',lbl==='下象棋'&&lg.say[0]==='阿伯：年輕人，紅的給你。'&&typeof n.talk==='function'&&n2.talk==null&&n3.talk==null,JSON.stringify([lbl,lg.say])); }
{ const G=mk(TUE,21); const keys=Object.keys(G).sort().join(); for(const r of ['am_f','dog','kid','night','tutor']) await tapSay(G,r,'z'+r); const P=G.daily.park;
  check('3. 不記關係：只動 G.daily.park 的 pplDay、pplDone、pplLast（沒有 social、rel、flags 的新東西）',Object.keys(G).sort().join()===keys&&!Object.keys(G.flags).length&&P.pplDay===TUE&&P.pplDone.length===5&&typeof P.pplLast==='object'); }
{ /* 3D 的人：點了說一句、說完不能再點；出去再進來，同一個人還是不能點 */
  const G=mk(TUE,6.5); enter(G); const gm=mkGM(G,L0()); const am=by('am'); const t0=am.filter(n=>typeof n.talk==='function'&&n.talkLabel==='打招呼').length; const first=am[0]; await first.talk(first); const k=first.crowdKey;
  for(const n of E.npcs.slice()) E.removeNPC(n); CROWD.enter(gm,'wenzhou'); const again=by('am').find(n=>n.crowdKey===k), other=by('am').filter(n=>n.crowdKey!==k);
  check('3. 3D：晨運的人都能點（「打招呼」）；點過的那一個說完就不能點，出去再進來還是不能點，其他人可以',t0===am.length&&first.talk===null&&!!again&&again.talk==null&&other.every(n=>typeof n.talk==='function'),t0+'/'+am.length);
  enter(mk(TUE,21)); const nt=by('night'); check('3. 3D：學生、情侶點了只有旁白「你決定不要打擾他們。」',nt.every(n=>n.talkLabel==='打招呼')&&(await (async()=>{ const lg=L0(); await PARK.tap(mkGM(mk(TUE,21),lg),nt[0],nt[0].crowdKey,nt[0].crowdRole); return lg.say.join(); })())==='你決定不要打擾他們。');
  enter(mk(TUE,8.5)); const pl=by('chess').filter(n=>n.crowdRole==='chess_play'); check('3. 3D：涼亭下棋的兩個阿伯點了是「下象棋」',pl.length===2&&pl.every(n=>n.talkLabel==='下象棋')); }
// ===================== 4. 課輔班（大三起週二、週四 17:00）=====================
{ const G=mk(Y3TUE,17); const gs=PARK.groupsAt(G,17.05); const g=gs.find(q=>q.id==='tutor'); const G4=mk(Y3THU,17.05);
  const str=JSON.stringify(PARK.TAP)+JSON.stringify(PARK.ENTRY)+JSON.stringify(PARK.groups(G));
  check('4. 大三上週二、週四 17:00～17:20：課輔班的孩子 6～8 跟著不取名的老師（對話框「課輔班的老師」）；表、台詞、旁白裡都沒有沛珊',!!g&&g.n[0]===6&&g.n[1]===8&&PARK.groupsAt(G4).some(q=>q.id==='tutor')&&PARK.whoOf(G,'tutor')==='課輔班的老師'&&!/沛珊|peishan/.test(str)); }
{ const G=mk(Y3TUE,17.001); enter(G); const t=by('tutor'); const teacher=t.filter(n=>n.crowdRole==='tutor'), kids=t.filter(n=>n.crowdRole==='tutor_kid'); const sp=CROWD.SPOTS.find(s=>s.id==='wzpark_tutor'); const R=CROWD.passRoute(E,sp);
  const specs=t.map(n=>n.obj.userData.spec);
  check('4. 3D 大三週二 17:00：6～8 人（老師一個、在最後面出發）；都是無名路人（沒有名字、不是沛珊的模型）',t.length>=6&&t.length<=8&&teacher.length===1&&kids.length===t.length-1&&specs.every(s=>/^x\d+$/.test(s.id)&&!s.name&&!/peishan/.test(s.model||''))&&t.every(n=>!n.name)&&kids.every(n=>n.obj.userData.spec.height<1.4),t.length+' 人');
  const pend=CROWD.pend.filter(q=>t.includes(q.n)); const tq=pend.find(q=>q.n===teacher[0]);
  check('4. 3D：一個一個出發（第一個已經在走、其他人照順序等），老師最後一個',t.filter(n=>!n.hidden&&n.path&&n.path.length).length===1&&!!tq&&pend.every(q=>q.h<=tq.h)&&pend.length===t.length-1,pend.map(q=>(q.n.crowdRole==='tutor'?'T':'k')+q.h.toFixed(3)).join(' '));
  check('4. 3D：路線走到入口 A 外面（主巷）；入口 B 現在走不進主園區（遊戲場的導航阻擋），改從遊戲場東邊出發（B 步道打通以後自動從入口 B 進來）',!!R&&near(R.to,[26,3],0.01)&&R.len>10&&(R.viaB?near(R.pts[0],[6.2,19],0.01):near(R.pts[0],[18.5,19],0.01))&&R.pts.slice(1,-1).every(q=>PARK.inPark(q[0],q[1])||q[1]<5.3),(R&&(R.viaB?'入口 B':'遊戲場東邊')+' 長 '+R.len.toFixed(1)+' m'));
  const gm=mkGM(G); G.hour=17.05; CROWD.tick(gm,0.016); const walking=t.filter(n=>!n.hidden&&n.path&&n.path.length).length;
  check('4. 3D：時間往前走，等著的人照順序出發',walking>=4,walking+' 人在走');
  G.hour=17.09; CROWD.tick(gm,2); const t2=by('tutor'); const vis=t2.filter(n=>!n.hidden); const dists=vis.map(n=>{ const p=pos(n); let best=1e9; for(let i=0;i<R.pts.length-1;i++){ const a=R.pts[i], b=R.pts[i+1]; const L2=(b[0]-a[0])**2+(b[1]-a[1])**2||1; const u=Math.max(0,Math.min(1,((p[0]-a[0])*(b[0]-a[0])+(p[1]-a[1])*(b[1]-a[1]))/L2)); best=Math.min(best,Math.hypot(p[0]-a[0]-u*(b[0]-a[0]),p[1]-a[1]-u*(b[1]-a[1]))); } return best; });
  check('4. 3D 跳過時間到 17:05 進來：照已經過了多久，放在路線走到一半的地方（排成一排、老師在後面）',vis.length>=5&&dists.every(d=>d<0.05)&&vis.every(n=>n.path&&n.path.length),vis.length+' 人、離路線最遠 '+Math.max(...dists).toFixed(2)+' m');
  G.hour=17.6; CROWD.tick(gm,2); check('4. 3D 17:36：課輔班已經走過去了（沒有人、沒有等著的）',!by('tutor').length&&!CROWD.pend.length); }
{ enter(mk(Y3W9,17.05)); check('4. 3D 大三上第 9 週（貓不見）週二：課輔班照常',by('tutor').length>=6); enter(mk(TUE,17.05,{weather:'rain'})); check('4. 3D 下雨的週二：沒有課輔班',!by('tutor').length); }
console.warn=_warn;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
