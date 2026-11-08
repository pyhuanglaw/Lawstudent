// AA_613（AA613-OPENING-ACTS-1103，src/aa613_3d.js）的人站的位置——不需要瀏覽器（D131）。
//   ① 社博那天：阿哲在晨思鐘（S.SPOT.bell）、系籃攤位旁邊（booth）、沛珊和芯慈在合唱團攤位前面（ps、xc）站得住、從大道中間走得到；
//      晨思鐘的觸發圈（S.BELL_R）圈得到從大道走過去站得住的點；一起走到系籃攤位那一段（阿哲 bell→booth、玩家 bell→攤位的互動點）走得到；
//      站的人不擋攤位的互動點（離互動點 ≥ 0.9 m）、不擋拿傳單的新生的路（ROUTES，z ±1.4 以內）。
//   ② 萬才館一樓大廳：芯慈在法圖門口（S.SPOT.door）站得住、從大廳門口走得到、離法圖的門（互動點）在 S.DOOR_R 以內。
// 用法：node tests/aa613_spots_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/club_fair_expo_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const DATES={}; let dd=0; const day=k=>{ if(DATES[k]==null) DATES[k]=++dd; return DATES[k]; };
global.CALENDAR={dateOf:d=>({key:Object.keys(DATES).find(k=>DATES[k]===d)||'2025-01-01'})};
global.ACTIVITIES={list:[{id:'club_expo_y1s1',dates:['2025-09-06']}],on:(a,d)=>(a.dates||[]).includes(CALENDAR.dateOf(d).key)};
global.GAME={G:{day:day('2025-09-06'),flags:{}}}; global.STORY={isEcon:()=>false};
for(const f of ['src/data/club_fair.js','src/aa613_3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (CLUB_FAIR|AA613)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const J=JSON.stringify, R=0.32, SP=AA613.SPOT, CF=CLUB_FAIR;
const stand=(p,lv)=>E.canStand(p[0],p[1],R,lv|0);
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[3]|0,lv1:b[3]|0,dt});   /* SPOT＝[x, z, 轉向, 層] */ if(!r||!r.ok) return Object.assign({dt},r||{}); } return {ok:true}; };
const fmt=r=>J(r).slice(0,200);
/* ① 校園（社博那天）*/
loadZone('campus');
const mid=[-37,0], fb=CF.POS.basketball, fc=CF.POS.choir;
for(const k of ['bell','booth','ps','xc']){ const p=SP[k], r=walk(mid,p); check('① '+k+' '+J(p.slice(0,2))+' 站得住、從大道中間走得到',stand(p)&&r.ok,fmt(r)); }
{ const r1=walk(SP.bell,SP.booth), r2=walk(SP.bell,[fb.x,fb.z]); check('① 一起走到系籃攤位：阿哲 晨思鐘→攤位旁邊、玩家 晨思鐘→攤位的互動點都走得到',r1.ok&&r2.ok,fmt([r1,r2])); }
{ const near=[]; for(let x=-42;x<=-31;x+=0.5) for(let z=8;z<=20;z+=0.5) if(Math.hypot(x-SP.bell[0],z-SP.bell[1])<=AA613.BELL_R&&E.canStand(x,z,R,0)) near.push([x,z]);
  const fromAve=near.filter(p=>walk(mid,p).ok); check('① 晨思鐘的觸發圈（半徑 '+AA613.BELL_R+' m）裡有從大道走得到的點（'+fromAve.length+' 個）',fromAve.length>=10); }
check('① 站的人不擋攤位的互動點（離系籃、合唱團的互動點都 ≥ 0.9 m）',Math.hypot(SP.booth[0]-fb.x,SP.booth[1]-fb.z)>=0.9&&Math.hypot(SP.ps[0]-fc.x,SP.ps[1]-fc.z)>=0.9&&Math.hypot(SP.xc[0]-fc.x,SP.xc[1]-fc.z)>=0.9);
check('① 不擋拿傳單的新生（大道中間 z ±1.4 以內）',['bell','booth','ps','xc'].every(k=>Math.abs(SP[k][1])>1.4+0.6));
/* ② 萬才館一樓大廳 */
loadZone('wancai');
{ const L=WANCAI_LAYOUT, sp=L.entrance.spawn, it=L.lawlibDoor.it, p=SP.door, r=walk([sp.x,sp.z],p);
  check('② 芯慈在法圖門口 '+J(p.slice(0,2))+' 站得住、從大廳門口走得到',stand(p)&&r.ok,fmt(r));
  const near=[]; for(let x=-9;x<=-4;x+=0.25) for(let z=3;z<=7;z+=0.25) if(Math.hypot(x-p[0],z-p[1])<=AA613.DOOR_R&&E.canStand(x,z,R,0)&&Math.hypot(x-it.x,z-it.z)<=it.r+0.6) near.push([x,z]);
  check('② 走到法圖的門前（互動點旁邊）就在她旁邊（S.DOOR_R＝'+AA613.DOOR_R+' m 以內，'+near.length+' 個點）',near.length>=1&&Math.hypot(p[0]-it.x,p[1]-it.z)<=AA613.DOOR_R+it.r); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
