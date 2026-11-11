/* BUG-MOKUYOBI-STAIR-STUCK-1111（BB 11-11 PC 三次重現，cc-local L118D_H_B_r2 run.log 第 54～64 行）：木曜日樓梯頂 (−3.35, 2.876) lv0，
   搖桿往二樓店裡 (0, 0.9) 斜著推 20 秒不動；往下退 1 m 再上才上得去。
   原因：斜著推時完整的一步撞到東邊隔間牆，引擎只拿「完整那一步」試換層；沿牆滑的那一步（只有 z）在第 0 層站不住、在第 1 層站得住，卻沒試換層。
   這支：在 Node 建出真的木曜日區域，用引擎真的 stepEntity 照搖桿一步一步推（不是找路），
   1 BB 那一點、那個方向：60 步以內換到第 1 層、離開樓梯頂（走路／跑步 × dt 1/30／0.1）
   2 樓梯上左、中、右三個 x × 往北、往東北、往西北推：都上得到第 1 層（每個 30 秒以內）
   3 反過來：二樓平台往南推下樓，換回第 0 層、走到一樓（沒有卡在樓梯頂）
   4 換層沒有穿牆：整個過程每一步都站在那一層站得住的地方
   修改前（開發分支 2d3e3abc8）：1 FAIL（停在 z≈2.88、lv 0）。用法：node tests/mokuyobi_stair_top_1111_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); const cerr=console.error, cwarn=console.warn; console.warn=()=>{}; console.error=()=>{};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=MOKUYOBI_LAYOUT, S=L.stairWell, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.wz_mokuyobi.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
if(!E.stepEntity){ console.log("（修改前沒有 E.stepEntity）"); }
check('0. 引擎有 E.stepEntity、木曜日兩層',typeof E.stepEntity==='function'&&E.levels.length===2);
const R=0.32;
function push(x,zz,lv,dir,{sp=E.SPD.walk,dt=1/30,secs=30,until}){ const ent={obj:{position:new THREE.Vector3(x,0,zz),rotation:{y:0}},radius:R,lv}; let bad=0;
  const d=Math.hypot(dir[0],dir[1]), dx=dir[0]/d, dz=dir[1]/d; const N=Math.ceil(secs/dt);
  for(let i=0;i<N;i++){ E.stepEntity(ent,dx,dz,sp,dt); const o=ent.obj.position; if(!E.levels[ent.lv|0].clear(o.x,o.z,R-0.02)) bad++; if(until(ent)) return {ok:true,steps:i+1,lv:ent.lv,x:+o.x.toFixed(2),z:+o.z.toFixed(2),bad}; }
  const o=ent.obj.position; return {ok:false,lv:ent.lv,x:+o.x.toFixed(2),z:+o.z.toFixed(2),bad}; }
const MODES=[[E.SPD.walk,1/30,'走 30fps'],[E.SPD.walk,0.1,'走 10fps'],[E.SPD.run,1/30,'跑 30fps'],[E.SPD.run,0.1,'跑 10fps']];
const upDone=e=>(e.lv|0)===1&&e.obj.position.z<S.top-0.05;
{ const out=[]; let allBad=0; for(const [sp,dt,tag] of MODES){ const r=push(-3.35,2.876,0,[0-(-3.35),0.9-2.876],{sp,dt,secs:3,until:upDone}); out.push(tag+':'+(r.ok?r.steps+'步':'卡 '+JSON.stringify(r))); if(!r.ok) allBad++; }
  check('1. BB 那一點 (−3.35, 2.876) lv0、搖桿往店裡 (0, 0.9) 推：3 秒內換到第 1 層、上到平台（走／跑 × 30／10 fps）',!allBad,out.join('｜')); }
{ const xs=[S.x0+0.02+R+0.01,(S.x0+S.x1)/2,S.x1-0.02-R-0.01], dirs=[[0,-1,'北'],[1,-1,'東北'],[-1,-1,'西北']], out=[]; let bad=0;
  for(const x of xs) for(const [dx,dz,tag] of dirs) for(const [sp,dt,mt] of MODES){ const r=push(x,5.4,0,[dx,dz],{sp,dt,secs:30,until:upDone}); if(!r.ok||r.bad){ bad++; out.push(x.toFixed(2)+tag+mt+':'+JSON.stringify(r)); } }
  check('2. 樓梯上左、中、右 × 往北、東北、西北推 × 走／跑 × 30／10 fps：都上得到第 1 層平台、每一步都站得住（'+xs.length*dirs.length*MODES.length+' 趟）',!bad,out.slice(0,4).join('｜')); }
{ const out=[]; let bad=0; for(const x of [-4.1,-3.75,-3.36]) for(const [sp,dt,mt] of MODES){ const r=push(x,(S.z0+S.top)/2,1,[0,1],{sp,dt,secs:30,until:e=>(e.lv|0)===0&&e.obj.position.z>5.5}); if(!r.ok||r.bad){ bad++; out.push(x+mt+':'+JSON.stringify(r)); } }
  check('3. 二樓平台往南推下樓：換回第 0 層、走到一樓（左中右 × 走跑 × 30／10 fps）',!bad,out.slice(0,4).join('｜')); }
console.warn=cwarn; console.error=cerr;
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
