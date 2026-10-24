// 芷若第二輪明信片（r2y4a3d.js pc2Place）放的位置玩家拿得到（BB-B 10-23 RELEASE-9106-TEST 第 5 項 FY_PC）——不需要瀏覽器。
//   在 Node 裡建出遊戲真正的區域（宿舍 409／507／312／203、美國公寓），放明信片，然後在明信片範圍內找站得住的點：
//   要有一個點離明信片 0.7 m 以內、而且明信片是最近的互動點（E.nearestInteractable：不會被「坐在書桌前」蓋掉），而且從出生點走得到（E.simWalk）。
//   舊版 x=d.x-0.35：大四 409 的書桌靠西牆，明信片被推進書桌和牆中間，最近只站得到 0.78 m（這支測試在舊版 409 會 FAIL；下面也直接驗舊位置拿不到）。
// 用法：node tests/postcard_reach_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js','src/data/us_layouts.js','src/us3d.js','src/r2y4a3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
/* 站在明信片範圍內、按鈕是「明信片」、從出生點走得到的點 */
function grab(it,sp){ const P=E.player.obj.position, out=[]; for(let dz=-0.65;dz<=0.65+1e-6;dz+=0.05) for(let dx=-0.65;dx<=0.65+1e-6;dx+=0.05){ const x=it.x+dx, z=it.z+dz; if(Math.hypot(dx,dz)>=0.7||!E.canStand(x,z,0.32,0)) continue; P.set(x,0,z); if(E.nearestInteractable()===it) out.push([Math.hypot(dx,dz),x,z]); }
  out.sort((a,b)=>a[0]-b[0]); for(const q of out.slice(0,8)){ const r=E.simWalk(sp.x,sp.z,q[1],q[2],{lv0:0,lv1:0,dt:1/30}); if(r.ok) return {ok:true,at:[+q[1].toFixed(2),+q[2].toFixed(2)],d:+q[0].toFixed(2)}; } return {ok:false,n:out.length}; }
R2Y4A.pc2Pending=G=>[{key:'t',zone:G.zone}];
const place=zone=>{ const GM={G:{zone,flags:{},day:0,hour:12},E}; E.interactables=E.interactables.filter(i=>!i.zrPostcard2); R2Y4A.pc2Place(GM); return E.interactables.find(i=>i.zrPostcard2); };
for(const [label,flags] of [['大四 409',{ROOM_Y4:1}],['大三 507',{ROOM_Y3:1}],['大二 312',{ROOM_Y2:1}],['大一 203',{}]]){
  global.GAME={G:{stage:'law',flags,day:0}}; const z=loadZone('dorm'); const d=E.interactables.find(i=>i.deskStudy), it=place('dorm'), sp=z.spawn||{x:0,z:0};
  const r=it?grab(it,sp):{ok:false}; check(`宿舍 ${label}：明信片拿得到（站得到、最近的是明信片、走得到）`,!!d&&r.ok,JSON.stringify({desk:d&&[+d.x.toFixed(2),+d.z.toFixed(2)],pc:it&&[+it.x.toFixed(2),+it.z.toFixed(2)],r}));
  if(label==='大四 409'&&d){ const old={x:d.x-0.35,z:d.z+0.35,radius:0.7,label:'明信片',zrPostcard2:true}; E.interactables=E.interactables.filter(i=>!i.zrPostcard2); E.interactables.push(old); const r0=grab(old,sp);
    check('宿舍 大四 409：舊位置（d.x-0.35）拿不到——證明這支測試抓得到 BB 回報的問題',!r0.ok,JSON.stringify(r0)); E.interactables=E.interactables.filter(i=>i!==old); } }
{ global.GAME={G:{stage:'law',flags:{},day:0}}; const z=loadZone('us_apartment'), it=place('us_apartment'), sp=z.spawn||{x:0,z:0}; const r=it?grab(it,sp):{ok:false};
  check('美國公寓：明信片拿得到',r.ok,JSON.stringify({pc:it&&[+it.x.toFixed(2),+it.z.toFixed(2)],r})); }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
