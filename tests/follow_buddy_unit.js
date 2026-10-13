// 跟著人走（engine3d.js 的 followStep：follow 跟玩家、buddy 路人跟同伴）——不需要瀏覽器。
// 2026-10-13 使用者試玩：「高子晴背著吉他在地圖上跑步，一直被牆卡住」——跟同伴走的人原本只會直線追（只有不同層才找路），中間有建築就一直撞。
// 檢查：在遊戲真正的校園裡找幾組「直線被建築擋住、繞路走得到」的兩點：同伴站在一邊，跟的人從另一邊出發，60 秒內走到同伴旁邊、沒有卡住；
//       直線看得到的時候照舊直線跟（不找路）。修改前：跟的人撞在建築上不動（第 2 項失敗）。用法：node tests/follow_buddy_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.error=()=>{}; const warn=console.warn; console.warn=()=>{};
const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const srcs=[...idx.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>/^(lib\/three|src\/(people3d|assets3d|world3d|engine3d|townkit3d|campuskit3d|zones3d|building3d|lawlib3d|teach3d|library3d|wancai3d|soclib3d)|src\/data\/\w+_layout)/.test(f));
for(const f of srcs){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,speed:0};
check('有 E.followStep',typeof E.followStep==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const nav=E.levels?E.levels[0]:E.nav; const ent=(x,zz)=>({obj:{position:new THREE.Vector3(x,0,zz),rotation:{y:0}},radius:0.32,lv:0,speed:0,pose:'idle'});
// 找「直線被擋住、繞路走得到（路線比直線長 1.3 倍以上）」的兩點（固定種子，結果每次一樣）
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }; const pairs=[];
for(let k=0;k<4000&&pairs.length<6;k++){ const ax=-110+rnd()*220, az=-60+rnd()*120, bx=ax+(rnd()-0.5)*40, bz=az+(rnd()-0.5)*40;
  if(!E.canStand(ax,az,0.33,0)||!E.canStand(bx,bz,0.33,0)) continue; if(Math.hypot(bx-ax,bz-az)<12) continue; if(nav.losR(ax,az,bx,bz,0.3)) continue;
  const p=E.pathTo(ax,az,0,bx,bz,0); if(!p||!p.length) continue; let L=0, px=ax, pz=az; for(const q of p){ L+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; } if(L<Math.hypot(bx-ax,bz-az)*1.3||L>70) continue; pairs.push([ax,az,bx,bz,L]); }
check('校園裡找到直線被建築擋住、繞路走得到的幾組位置',pairs.length>=4,pairs.length+' 組');
const bad=[]; for(const [ax,az,bx,bz,L] of pairs){ const lead=ent(bx,bz), b=ent(ax,az); b.beh='buddy'; b.buddy=lead; b.side=1; b.followOff=0.9;
  /* 同伴沒在走的時候，跟的人走到同伴身邊那一點（右側 0.9 m）的 1.7 m 內就停（followStep 原本的規則）：離同伴 2.7 m 內就算到了 */
  let t=0, best=1e9; const dt=1/30; while(t<60){ E.followStep(b,dt); t+=dt; const d=Math.hypot(b.obj.position.x-bx,b.obj.position.z-bz); best=Math.min(best,d); if(d<2.7) break; }
  if(best>=2.7) bad.push(`(${ax.toFixed(0)},${az.toFixed(0)})→(${bx.toFixed(0)},${bz.toFixed(0)}) 繞路 ${L.toFixed(0)} m，最近 ${best.toFixed(1)} m、停在 (${b.obj.position.x.toFixed(1)},${b.obj.position.z.toFixed(1)})`); }
check('跟同伴走：中間有建築時繞路，60 秒內走到同伴旁邊（2.7 m 內），不會撞在建築上不動',pairs.length&&!bad.length,bad.slice(0,3).join(' | '));
// 對照（舊做法＝只直線追）：把「看不看得到」強制當成看得到，同樣幾組位置裡跟的人會撞在建築上，走不到同伴旁邊——證明上面那幾組真的需要繞路
{ const keep=nav.losR; nav.losR=()=>true; let stuck=0; for(const [ax,az,bx,bz] of pairs){ const lead=ent(bx,bz), b=ent(ax,az); b.beh='buddy'; b.buddy=lead; b.side=1; b.followOff=0.9; let t=0, best=1e9; while(t<60){ E.followStep(b,1/30); t+=1/30; best=Math.min(best,Math.hypot(b.obj.position.x-bx,b.obj.position.z-bz)); if(best<2.7) break; } if(best>=2.7) stuck++; }
  nav.losR=keep; check('（對照）只直線追的話，這幾組大多會卡在建築上（使用者看到的情形）',stuck>=Math.ceil(pairs.length/2),stuck+'/'+pairs.length+' 組卡住'); }
// 看得到的時候照舊直線跟（不找路）
{ let a=null; for(let k=0;k<2000&&!a;k++){ const x=-100+rnd()*200, zz=-50+rnd()*100; if(E.canStand(x,zz,0.33,0)&&E.canStand(x+8,zz,0.33,0)&&nav.losR(x,zz,x+8,zz,0.4)) a=[x,zz]; }
  const lead=ent(a[0]+8,a[1]), b=ent(a[0],a[1]); b.beh='buddy'; b.buddy=lead; b.side=1; E.followStep(b,1/30);
  check('直線看得到：照舊直線跟（沒有找路）',!b.path&&b.obj.position.x>a[0],JSON.stringify([a,b.obj.position.x])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
