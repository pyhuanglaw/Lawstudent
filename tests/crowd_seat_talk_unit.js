// CROWD-NO-DOOR-1103（使用者 2026-11-03 試玩：「教室外面可以不要有一坨人嗎」；AA 選 (a)）——不需要瀏覽器。
// 在 Node 建出遊戲真正的博雅、普通、共同教學館，用課表（classes3d.js）、人流（crowd3d.js）、AA_495 的句子（crowd_depts.js）檢查：
//   1. 教室門口沒有一坨人：上課前 20 分鐘到開始後 2 分鐘、下課到下課後 12 分鐘，沒有人站在教室門口 3 m 內不動（走過去、坐著、正走出建築的不算）；
//      同學從建築大門直接走進教室坐下、下課從座位直接走出建築（博雅 101 大一國文、普通 101 電影與敘事、共同 102 日文）。
//   2. AA_495 第 3、4 節（原本教室門口的對話）搬進教室：坐在玩家前一排或旁邊（同一排）的同學說，字照舊、名字照那一組的系；
//      上課前＝提早坐下、轉暗等到上課時間以後、老師開口以前；下課後＝下課轉暗回來以後；說話的人都坐在座位上、同一排、左右離玩家 3.2 m 以內；
//      第 6 組（三個人）＝同一排的三個人；法律系必修（經濟學原理，普通 101）都是「法律系的學生」；選修（日文）沒有。
//   3. 一段一天一次（G.flags.deptTalkDay）：聽過的同一天不再出；說話的人在轉暗的時候坐好（不在玩家眼前出現在座位上）。
// 修改前（開發分支 895dca6b3）：第 1 項 FAIL（門口等的人、下課聊天的人）、第 2、3 項 FAIL（沒有 CROWD.seatTalkPrep，上課時沒有那幾句）。
// 用法：node tests/crowd_seat_talk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
let seed=4242; Math.random=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
const GL=/^[A-Z][A-Z0-9_]+$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/data/crowd_depts.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,lawStart:()=>dayOf('2025-08-31'),mainD1:()=>dayOf('2025-09-04')};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let faded=false, popped=[];   /* 沒轉暗的時候坐進座位的人（加進來或挪過去）＝在玩家眼前出現在座位上 */
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; if(!faded&&n.seat&&(n.pose==='sit'||n.pose==='read')) popped.push(n); E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function enter(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:(z.spawn&&z.spawn.lv)|0,seat:null}; E.camera=null; return z; }
let VIS=0, said=[];
const mkGM=G=>({G,E,enterN:++VIS,D:{active:false},say:async(who,t)=>{ said.push({who:who?who.name:null,obj:who&&who.obj||null,t,faded}); },choose:async()=>0,fade:async on=>{ faded=!!on; },advance:h=>{ G.hour+=h; },energy(){},caption(){},sceneBegin(){},sceneEnd(){},autosave(){},setGoal(){},toast(){},sleep:async()=>{},hourRate:1/150,
  sitAt:(n,st)=>{ if(!faded&&n!==E.player&&n.seat!==st) popped.push(n); n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; },seatApproach:st=>CROWD.seatSide(E,st)});
const arriveAll=()=>{ for(const n of E.npcs.slice()) if(n.path&&n.path.length){ const p=n.path[n.path.length-1]; E.placeAt(n,p[0],p[1],p[2]!=null?p[2]:n.lv); n.path=null; const f=n.onArrive; n.onArrive=null; if(f) f(n); } };
const mkG=(day,h,zone,o)=>Object.assign({day,hour:h,zone,flags:{},weekday:CALENDAR.dateOf(day).wd%7,stage:'law',weather:'clear'},o||{});
const findCls=(term,id,week)=>{ for(let d=-420;d<1700;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term||t.week!==week) continue; const G=mkG(d,12,'campus',term[1]==='0'?{stage:'econ'}:{}); const it=CLS.dayItems(G).find(q=>q.c.id===id); if(it) return {day:d,it}; } return null; };
/* 教室門口：layout 的 waitSpots（原本等的人站的地方）＋教室的門 */
const LAYS={boya:BOYA_LAYOUT,putong:PUTONG_LAYOUT,gongtong:GONGTONG_LAYOUT};
function doorPts(zone,room){ const L=LAYS[zone], out=[]; for(const w of (L.waitSpots||[])) if(w.room===room) out.push({x:w.x,z:w.z,lv:w.lv|0});
  const r=L.rooms.find(q=>q.id===room); if(r){ if(r.kind==='lecture'&&r.door){ const d=r.door, m=(d.a0+d.a1)/2; out.push(d.wall==='W'||d.wall==='E'?{x:d.x,z:m,lv:r.lv|0}:{x:m,z:d.z,lv:r.lv|0}); }
    else if(r.doorFront){ out.push({x:(r.doorFront[0]+r.doorFront[1])/2,z:r.doorZ!=null?r.doorZ:-0.4,lv:r.lv|0}); } } return out; }
/* 站著不動的人（不是走路中、不是坐著、不是正在走出建築的）*/
const idleNear=(pts)=>E.npcs.filter(n=>!n.seat&&!n.seatTarget&&!(n.path&&n.path.length)&&!n.leaving&&!n.clsTeacher&&!n.tSpot&&pts.some(p=>(n.lv|0)===p.lv&&Math.hypot(n.obj.position.x-p.x,n.obj.position.z-p.z)<3));
// ---------- 1. 教室門口沒有一坨人 ----------
function doorWatch(term,id,week){ const f=findCls(term,id,week); if(!f) return {err:'找不到 '+id}; const it=f.it, zone=it.room.zone, room=it.room.room, pts=doorPts(zone,room); enter(zone);
  const G=mkG(f.day,it.t0-20/60,zone,term[1]==='0'?{stage:'econ'}:{}), GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,zone);
  const bad=[], walkIn=new Set(), walkOut=new Set(); let atEnter=idleNear(pts).length;
  const step=(h,tag)=>{ G.hour=h; CROWD.tick(GM,2); CLS.syncRooms(GM); for(const n of E.npcs){ if(n.clsStudent&&n.path&&n.path.length&&!n.leaving) walkIn.add(n); if(n.leaving&&n.crowd==='cls') walkOut.add(n); }
    const k=idleNear(pts).length; if(k) bad.push(tag+':'+k); arriveAll(); const k2=idleNear(pts).length; if(k2) bad.push(tag+'+:'+k2); };
  for(let m=-19;m<=2;m++) step(it.t0+m/60,'前'+m);
  G.hour=it.t1-1/60; CLS.syncRooms(GM,{full:true,instant:true}); CROWD.enter(GM,zone); arriveAll();   /* 坐著上課（下課前一分鐘）*/
  for(let m=0;m<=12;m++) step(it.t1+m/60,'後'+m);
  const ex=CLS.entryPoint(E);
  return {it,atEnter,bad,walkIn:walkIn.size,walkOut:walkOut.size,ex}; }
for(const [term,id,week,nm] of [['Y1S1','chinese_y1',3,'博雅 101 大一國文'],['Y1S1','ge_film_y1s1',3,'普通 101 電影與敘事'],['Y1S1','econ_principles_1',3,'普通 101 經濟學原理（法律系必修）'],['Y2S1','japanese_1',3,'共同 102 日文']]){
  const r=doorWatch(term,id,week);
  check('1. '+nm+'：上課前 20 分鐘到開始後 2 分鐘、下課後 12 分鐘，教室門口 3 m 內沒有站著不動的人',!r.err&&r.atEnter===0&&!r.bad.length,r.err||('進來時 '+r.atEnter+' 人；'+(r.bad.slice(0,6).join(' ')||'沒有')));
  check('1. '+nm+'：同學從建築大門走進教室坐下、下課從座位走出建築',!r.err&&r.walkIn>=3&&r.walkOut>=3,r.err||('走進來 '+r.walkIn+'、走出去 '+r.walkOut)); }
// ---------- 2、3. 上課的時候，前一排或旁邊的同學說原本門口的那一段 ----------
const D=CROWD_DEPTS, conv=(sec,n)=>D[sec].find(x=>x.n===n);
const stepsOf=(c,names)=>c.d.split('／').map(s=>{ const m=s.match(/^([ABC])：([\s\S]*)$/); return {who:names['ABC'.indexOf(m[1])],t:m[2]}; });
/* 玩家的位子：那一間中間那一排（前面還有一排）、中間的位子 */
function mySeat(z,room){ const sts=z.seats.filter(q=>q.room===room&&(q.kind==='class'||q.kind==='lecture')); const rows=[...new Set(sts.map(q=>q.row))].sort((a,b)=>a-b), r=rows[Math.floor(rows.length/2)];
  const inRow=sts.filter(q=>q.row===r).sort((a,b)=>a.col-b.col); return inRow[Math.floor(inRow.length/2)]; }
/* 前一排、同一排（照座位的朝向算：前面＝老師那一邊）*/
function rel(p,q){ const fx=Math.sin(p.yaw||0), fz=Math.cos(p.yaw||0), dx=q.x-p.x, dz=q.z-p.z; return {f:dx*fx+dz*fz,l:dx*fz-dz*fx}; }
async function attendAt(term,id,week,early,o){ o=o||{}; const f=findCls(term,id,week); const it=f.it, zone=it.room.zone, room=it.room.room; const z=enter(zone);
  const G=mkG(f.day,it.t0-(early!=null?early:25)/60,zone,term[1]==='0'?{stage:'econ'}:{}); if(o.flags) Object.assign(G.flags,o.flags); const GM=mkGM(G); CLS.syncRooms(GM,{instant:true}); CROWD.enter(GM,zone);
  const st=mySeat(z,room), ap=CROWD.seatSide(E,st); E.player.obj.position.set(ap[0],0,ap[1]); E.player.lv=st.lv|0; GM.sitAt(E.player,st); E.player.seat=st;
  said=[]; popped=[]; faded=false; await CLS.attend(GM,it,{inScene:true}); const out={it,G,GM,st,said:said.slice(),popped:popped.slice()}; E.player.seat=null; return out; }
/* 那一段在 said 裡（連續、照順序）＋說話的人 */
function findTalk(r,sec,ns,ph){ for(const n of ns){ const c=conv(sec,n); if(!c) continue; const names=sec==='LAW'?c.d.split('／').map(()=>'法律系的學生'):c.who.map(x=>x+'系的學生'), want=stepsOf(c,names);
    for(let i=0;i+want.length<=r.said.length;i++){ if(want.every((w,k)=>r.said[i+k].t===w.t&&r.said[i+k].who===w.who)) return {c,i,lines:r.said.slice(i,i+want.length)}; } } return null; }
function seatedOk(r,lines){ const objs=[...new Set(lines.map(s=>s.obj))], ppl=objs.map(o=>E.npcs.find(n=>n.obj===o)); if(ppl.some(n=>!n||!n.seat)) return {ok:false,why:'說話的人沒有坐在座位上'};
  const R=ppl.map(n=>rel(r.st,n.seat)), sameRow=R.every(q=>Math.abs(q.f-R[0].f)<0.3), front=R[0].f>0.3, beside=Math.abs(R[0].f)<0.3;
  const near=R.every(q=>Math.abs(q.l)<=3.2&&(beside?Math.abs(q.l)>0.2:true)), room=ppl.every(n=>n.seat.room===r.st.room&&(n.seat.lv|0)===(r.st.lv|0));
  const frontRow=front&&!r.zSeats.some(q=>q.room===r.st.room&&(q.lv|0)===(r.st.lv|0)&&rel(r.st,q).f>0.3&&rel(r.st,q).f<R[0].f-0.3);   /* 「前一排」：中間沒有別排 */
  return {ok:ppl.length>=2&&sameRow&&(frontRow||beside)&&near&&room,n:ppl.length,why:J({sameRow,front:frontRow,beside,near,room,f:R.map(q=>+q.f.toFixed(2)),l:R.map(q=>+q.l.toFixed(2))})}; }
(async()=>{
const has=typeof CROWD.seatTalkPrep==='function'&&typeof CROWD.seatTalkPlay==='function';
check('2. crowd3d.js：CROWD.seatTalkPrep、CROWD.seatTalkPlay（教室裡的對話）',has);
const one=async(name,term,id,week,sec,ns,ph,o)=>{ const r=await attendAt(term,id,week,(o&&o.early),o); r.zSeats=E.zone.seats; const t=findTalk(r,sec,ns,ph), L0=(CLS.content(r.it)||{}).line, first=L0?r.said.findIndex(s=>typeof s.t==='string'&&s.t.endsWith(L0)):-1;   /* 老師的那一句（沒有 3D 老師：「○○老師：」開頭）*/
  const prof=r.said.findIndex(s=>/^（你在座位上等/.test(s.t)), bye=r.said.length;   /* 下課：上課最後一句之後 */
  const sat=t?seatedOk(r,t.lines):{ok:false,why:'沒有那一段'};
  const when=!t?false:(ph==='pre'?(t.i>prof&&(first<0||t.i<first)&&!t.lines[0].faded):(first>=0&&t.i>first&&!t.lines[0].faded));
  check(name,!!t&&sat.ok&&when&&(!(o&&o.n)||sat.n===o.n),(t?'第 '+t.c.n+' 組 ':'')+sat.why+(t?' 位置 '+t.i+'／老師 '+first:''));
  return {r,t}; };
{ const {r,t}=await one('2. 通識（電影與敘事，普通 101）第 3 週，提早 25 分鐘坐下：轉暗等到上課以後、老師開口以前，前一排或旁邊同一排的兩個同學說第 3 或第 4 組（字照稿、名字照那一組的系）','Y1S1','ge_film_y1s1',3,'GE',[3,4],'pre');
  check('3. 一段一天一次：聽完記 G.flags.deptTalkDay；同一天再坐一次，那一段不再出',!!t&&r.G.flags.deptTalkDay&&r.G.flags.deptTalkDay['g'+t.c.n]===r.G.day&&(()=>{ if(!has) return false; const p=CROWD.seatTalkPrep(mkGM(r.G),r.it,'pre'); return !p||p.id!=='g'+t.c.n; })(),t?J(r.G.flags.deptTalkDay):'');
  check('3. 說話的人在轉暗的時候坐好（沒有人在玩家眼前出現在座位上）',!!t&&!r.popped.length,'眼前出現 '+r.popped.length+' 人');
  const t2=findTalk(r,'GE',[8,10],'post'); check('2. 同一堂下課後（轉暗回來以後）：第 8 或第 10 組，也是前一排或旁邊的同學',!!t2&&seatedOk(r,t2.lines).ok&&!t2.lines[0].faded&&t2.i>t.i,t2?'第 '+t2.c.n+' 組 '+seatedOk(r,t2.lines).why:'沒有'); }
await one('2. 第 1 週上課前：第 1 或第 2 組','Y1S1','ge_film_y1s1',1,'GE',[1,2],'pre');
await one('2. 第 6 週上課前：第 6 組三個人（電機、獸醫、法律）坐同一排','Y1S1','ge_film_y1s1',6,'GE',[6],'pre',{n:3});
await one('2. 第 14 週下課後：第 9 組（報告我做簡報）','Y1S1','ge_film_y1s1',14,'GE',[9],'post');
await one('2. 法律系必修（經濟學原理，普通 101）第 3 週上課前：第 2 組，兩個人都是「法律系的學生」','Y1S1','econ_principles_1',3,'LAW',[2],'pre');
await one('2. 法律系必修第 3 週下課後：第 3 或第 5 組','Y1S1','econ_principles_1',3,'LAW',[3,5],'post');
await one('2. 大一國文（博雅 101 階梯教室）第 3 週上課前：前一排或旁邊的同學說第 3 節的通識那一組','Y1S1','chinese_y1',3,'GE',[4],'pre');
{ const r=await attendAt('Y1S1','ge_film_y1s1',3,0); const t=findTalk(r,'GE',[3,4],'pre');
  check('2. 開始的時候才坐下（沒有轉暗等上課）：沒有上課前那一段（和原本一樣，上課前的對話只在等上課的時候）',!t&&has,t?'有第 '+t.c.n+' 組':''); }
{ const r=await attendAt('Y2S1','japanese_1',3); const any=r.said.some(s=>/系的學生$/.test(s.who||''));
  check('2. 選修（日文，共同 102）：沒有那幾段（照舊）',!any&&has,J(r.said.filter(s=>s.who).map(s=>s.who))); }
{ const JR_D=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-CALENDAR.tOf(1))/86400000)+1; }; /* AA 11-03：法律系必修課前的「平常」l2 每週最多一次（同一週聽過就不再演，下週再有）*/
  const D=JR_D('2025-09-17'), wd=CALENDAR.dateOf(D).wd, mon=D-(wd-1), mk=(day,heard)=>({G:{day,zone:'puton',flags:{deptTalkDay:{l2:heard}}},enterN:day});
  const L=[{n:2}], p1=CROWD.deptTalkPick(mk(mon+2,mon),'law:pre',L,'l'), p2=CROWD.deptTalkPick(mk(mon+7,mon),'law:pre',L,'l');
  check('9. l2 每週最多一次：同一週（週一聽過、週三）不演；下週一照演（AA 11-03）',!p1&&!!p2,J([p1,p2])); }
console.warn=warn0; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
