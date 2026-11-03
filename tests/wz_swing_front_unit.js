// 溫州街小公園的鞦韆從正面按得到「盪鞦韆」（BUG-SWING-FRONT-1103：CC 在 ffeec06e0 找到、BB 轉 LAWWW2）。
// 鞦韆的座位搬到座板上（BUG-SWING-SEAT）以後互動點跟著座位，鞦韆 A 正面最近站得住的點離互動點 1.35 m＞radius 1.3，只能從架子後面按。
// 檢查兩座鞦韆：正面（z 比座位小）有站得住的點在互動範圍－0.05 m 內、而且站在那裡「最近的互動」就是它；座位（坐下的位置）照舊在座板上。
// 修正前鞦韆 A 這一項會失敗。用法：node tests/wz_swing_front_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const lvOf=(it)=>(E.levels&&it.lv!==undefined)?(it.lv|0):0;
function touchable(it){ const r=(it.radius||1.5)-0.05, lv=lvOf(it), P=E.player; if(E.levels) E.setLv(P,lv); else P.lv=0; const c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,lv)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [d,x,z] of c){ P.obj.position.set(x,E.heightAt?E.heightAt(x,z,lv):0,z); if(E.nearestInteractable()===it) return [x,z,lv]; } return null; }
const z=loadZone('wenzhou'); if(E.fitSeatRadius) E.fitSeatRadius();
const SW=E.interactables.filter(it=>it.park==='swing');
check('0. 溫州街有兩座鞦韆的互動',SW.length===2,String(SW.length));
const L=WZ_PARK_LAYOUT, seats=L.seats.filter(s=>s.kind==='swing');
for(const [i,it] of SW.entries()){ const r=(it.radius||1.5)-0.05, P=E.player; P.lv=0; let best=null;
  for(let dz=-r;dz<=0.001;dz+=0.05) for(let dx=-r;dx<=r+1e-6;dx+=0.05){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, zz=it.z+dz; if(zz>=it.seat.z-0.3) continue; if(!E.canStand(x,zz,0.32,0)) continue;
    P.obj.position.set(x,0,zz); if(E.nearestInteractable()!==it) continue; if(!best||d<best[0]) best=[d,x,zz]; }
  check((i+1)+'. 鞦韆 '+'AB'[i]+'（座位 '+it.seat.x+','+it.seat.z+'）正面按得到「盪鞦韆」',!!best,best?'站 ('+best[1].toFixed(2)+','+best[2].toFixed(2)+') 離互動點 '+best[0].toFixed(2)+' m':'正面沒有點');
  const s=seats[i]; check((i+1)+'b. 坐下的位置照舊在座板上（layout seats）',s&&it.seat.x===s.x&&it.seat.z===s.z,JSON.stringify(it.seat)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
