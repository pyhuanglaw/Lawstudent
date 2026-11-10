// 南洋戲院大廳：四張長椅的位子「坐下等開演」坐得下（NANYANG-BENCH-SIT-1105，LAWWW2-C 11-05；BB-C 06:45 BB_255：電腦上 #2、#3 沒按鈕，擋玩）——不需要瀏覽器（D131）。
// 點座位＝GM.seatApproach（game3d.js）挑走近點：先挑「在這張的按鈕範圍內（radius − 0.05）、而且最近的『坐下』就是這一張」的候選點；一個都沒有才退回範圍外的點（走到那裡沒有按鈕）。
// 這裡照 seatApproach 的候選點（座位前 0.5、後 0.6、左右 0.55、後 0.7／0.75、前 0.8、後 0.9）和挑法，檢查每一張：
//   ① 至少一個候選點：站得住、在範圍內、最近的座位按鈕是這一張
//   ② 站在那一點，E.nearestInteractable()（畫面上的按鈕）就是這一張「坐下等開演」
//   ③ game3d.js 的候選點清單還是這一組（改了要一起改這支測試）
// 修改前（開發分支 05ddf1e08，範圍 0.8）：四張的 ① ② FAIL（站得住的候選點只有前 0.8 m，剛好在範圍外）。用法：node tests/nanyang_bench_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''}; process.on('unhandledRejection',()=>{}); console.warn=()=>{};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/nanyang_layout.js','src/nanyang3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.xs_nanyang.build(E); E.zone=z; E.nav=z.nav; E.levels=z.levels||null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
check('③ game3d.js seatApproach 的候選點清單和這支測試一樣', src.includes('[fx*0.5,fz*0.5,0],[-fx*0.6,-fz*0.6,0],[fz*0.55,-fx*0.55,0],[-fz*0.55,fx*0.55,0],[-fx*0.7,-fz*0.7,0.1],[-fx*0.75,-fz*0.75,0.2],[fx*0.8,fz*0.8,0.5],[-fx*0.9,-fz*0.9,0.5]'));
const benches=E.interactables.filter(q=>q.nanyang==='bench'), sp=z.spawn;
check('四張長椅的位子都有「坐下等開演」', benches.length===4, benches.length+' 個');
for(const it of benches){ const s=it.seat, fx=Math.sin(s.yaw), fz=Math.cos(s.yaw), reach=(it.radius||1.8)-0.05;
  const own=(x,zz)=>{ const d0=Math.hypot(x-it.x,zz-it.z); return !E.interactables.some(q=>q!==it&&q.seat&&Math.hypot(x-q.x,zz-q.z)<d0-1e-6); };
  const cands=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[r2(s.x+dx),r2(s.z+dz)]);
  const good=cands.filter(([x,zz])=>E.canStand(x,zz,0.3,0)&&Math.hypot(x-it.x,zz-it.z)<=reach&&own(x,zz)&&E.simWalk(sp.x,sp.z,x,zz,{dt:1/30}).ok);
  check(`① (${s.x}, ${s.z})：有站得住、走得到、在範圍內、最近的就是這一張的走近點`, good.length>0, good.length?JSON.stringify(good[0]):'站得住的候選點：'+JSON.stringify(cands.filter(([x,zz])=>E.canStand(x,zz,0.3,0)))+' 範圍 '+it.radius);
  if(good.length){ E.player.obj.position.set(good[0][0],0,good[0][1]); const n=E.nearestInteractable(); check(`② (${s.x}, ${s.z})：站在走近點，畫面上的按鈕就是這一張「坐下等開演」`, n===it, n?n.label+'@'+n.x+','+n.z:'沒有按鈕'); } }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
