// 點地面點到人過不去的地方：不要一直原地走（v9.7 回歸 LAWWW2 2026-10-14 回報）——不需要瀏覽器。
// 201 階梯教室：人站在第 4 排平台 (-2, 3.43)，點第 5 排長桌邊上的 (-2.01, 3.83)（人的半徑 0.33 m，中心最多到 z≈3.50），
// 舊做法：路線一直留著、pose 一直是 walk、位置不動（玩家看到靠著桌子原地走），要點別的地方或推搖桿才停。
// 檢查（engine3d.js 的 E.playerPathStep，E.update 每幀用它）：
//   1. （對照）舊做法 E.stallStop=false：低幀率（每幀 0.1 秒）走 4 秒，路線還在、人沒動＝原地走（重現回報）
//   2. 新做法：1.5 秒（遊戲時間）幾乎沒有前進就放掉路線、站好（pose 交給 E.update 換成 idle）
//   3. 走得到的地方照常走到（教室走道、平台上）；4. 劇情的 walkTo（有 onArrive）不套這條規則（它有自己的 4 秒保底）
// 修改前沒有 E.playerPathStep（第 0 項失敗）。用法：node tests/tap_stall_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.error=()=>{}; console.warn=()=>{};
const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const srcs=[...idx.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>/^(lib\/three|src\/(people3d|assets3d|world3d|engine3d|townkit3d|campuskit3d|zones3d|building3d|lawlib3d|teach3d|library3d|wancai3d|soclib3d)|src\/data\/\w+_layout)/.test(f));
for(const f of srcs){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
check('0. 有 E.playerPathStep（E.update 沿路線走用的同一個函式）',typeof E.playerPathStep==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const z=Z3.ZONES.classroom.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const mkP=(x,zz,lv)=>({obj:{position:new THREE.Vector3(x,0,zz),rotation:{y:0}},radius:0.32,lv:lv|0,speed:0,pose:'idle',path:null,onArrive:null,busy:false});
const P=mkP(-2,3.43,0); E.player=P; if(E.settleY) try{ E.settleY(P); }catch(e){}
/* 跑 secs 秒（遊戲時間）；E.update 裡沒在走的那一幀會把 walk 換成 idle，這裡照做 */
const walk=(ent,secs,dt)=>{ dt=dt||0.1; const p0={x:ent.obj.position.x,z:ent.obj.position.z}; let t=0, walkT=0, stopT=null;
  while(t<secs){ if(!ent.path){ stopT=stopT==null?t:stopT; break; } const mv=E.playerPathStep(ent,dt); if(!mv&&(ent.pose==='walk'||ent.pose==='run')) ent.pose='idle'; if(mv) walkT+=dt; t+=dt; }
  if(!ent.path&&stopT==null) stopT=t;
  return {moved:+Math.hypot(ent.obj.position.x-p0.x,ent.obj.position.z-p0.z).toFixed(3),path:ent.path?ent.path.length:0,pose:ent.pose,walkT:+walkT.toFixed(2),stopT:stopT==null?null:+stopT.toFixed(2),at:[+ent.obj.position.x.toFixed(2),+ent.obj.position.z.toFixed(2)]}; };
/* 回報的那一條路線（LAWWW2 log：路線還剩 [[-2,3.7],[-2.01,3.83]]）*/
const tapLine=()=>[[-2,3.7],[-2.01,3.83]];
check('201：(-2, 3.43) 站得住、(-2, 3.7) 人的半徑過不去（第 5 排長桌）',E.canStand(-2,3.43,0.3,0)&&!E.canStand(-2,3.7,0.32,0),JSON.stringify({a:E.canStand(-2,3.43,0.3,0),b:E.canStand(-2,3.7,0.32,0)}));
{ E.stallStop=false; Object.assign(P.obj.position,{x:-2,z:3.43}); P.path=tapLine(); P.pose='idle'; const r=walk(P,4);
  check('1. （對照）舊做法：低幀率走 4 秒，路線還在、一直在走、幾乎沒動（靠著桌子原地走）',r.path>0&&r.walkT>=3.9&&r.moved<0.15,JSON.stringify(r)); }
{ E.stallStop=true; Object.assign(P.obj.position,{x:-2,z:3.43}); P.path=tapLine(); P.pose='idle'; P._stall=0; const r=walk(P,4);
  check('2. 新做法：1.5 秒左右（遊戲時間）放掉路線、站好（不再原地走）',r.path===0&&r.stopT!=null&&r.stopT<=1.8&&r.pose==='idle'&&r.moved<0.15,JSON.stringify(r));
  P.path=tapLine(); P._stall=0; const r2=walk(P,4,1/60); check('2. 60 fps 也一樣（1.5 秒）',r2.path===0&&r2.stopT<=1.6,JSON.stringify(r2)); }
{ /* 走得到的地方照常走到：走道上往前走、平台上橫著走 */ const C=CLASSROOM_LAYOUT; const ax=(C.aisleX0+C.aisleX1)/2;
  const pts=[]; for(let zz=-4;zz<=6;zz+=0.25) for(let x=-8;x<=8;x+=0.25) if(E.canStand(x,zz,0.36,0)) pts.push([x,zz]);
  let ok=0, bad=[]; const pairs=[]; for(let k=0;k<pts.length&&pairs.length<12;k+=Math.max(1,Math.floor(pts.length/40))){ const a=pts[k], b=pts[(k*7+13)%pts.length]; if(Math.hypot(a[0]-b[0],a[1]-b[1])<2) continue; pairs.push([a,b]); }
  for(const [a,b] of pairs){ const Q=mkP(a[0],a[1],0); if(!E.moveTo(Q,b[0],b[1],null,0)) continue; const r=walk(Q,40); const d=Math.hypot(Q.obj.position.x-b[0],Q.obj.position.z-b[1]); if(r.path===0&&d<0.6) ok++; else bad.push(JSON.stringify({a,b,r,d:+d.toFixed(2)})); }
  check('3. 走得到的地方照常走到（教室裡 '+pairs.length+' 組點地面的路線）',pairs.length>=8&&!bad.length,ok+'/'+pairs.length+' '+bad.slice(0,2).join(' | ')); }
{ /* 劇情的 walkTo：有 onArrive，不放掉（GM.walkTo 自己 4 秒後放到目的地）*/ Object.assign(P.obj.position,{x:-2,z:3.43}); P.path=tapLine(); P._stall=0; let arrived=false; P.onArrive=()=>{ arrived=true; }; const r=walk(P,4);
  check('4. 劇情的 walkTo（有 onArrive）不套這條規則：路線留著，交給它自己的保底',r.path>0&&!arrived,JSON.stringify(r)); P.onArrive=null; P.path=null; }
{ const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'); check('E.update 沿路線走用 pathStep（同一個函式）',/else if\(P\.path\) moving=pathStep\(P,dt\);/.test(src)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
