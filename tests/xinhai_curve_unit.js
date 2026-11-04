// 辛亥路往東南彎（LAW-RELAYOUT-1102 補充，BB 的驗收條件；官方地圖：過了霖澤館往東南、順著萬才館）：
//   1. 校園背景有辛亥路彎道（campusBackdrop 裡的 xinhai_curve_road：頂點橫跨 x 80～200、z −150～−60）；
//   2. 彎道＋東南段的路面、人行道、圍牆（離中線 ±15.4 m）上沒有玩家站得住的格子（全部是走不到的背景，導航不變）；
//   3. 萬才館背後那塊導航阻擋（本地 z −23.3～−11.3）的外緣＝東南段的校園側圍牆（離中線 15.4 m 以內 0.6 m）。
// 用法：node tests/xinhai_curve_unit.js
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
const z=loadZone('campus');
let far=null; E.scene.traverse(o=>{ if(o.name==='campusBackdrop') far=o; }); if(!far&&z.group) z.group.traverse(o=>{ if(o.name==='campusBackdrop') far=o; });
let ribbonOK=false; const rd=far&&far.getObjectByName('xinhai_curve_road'); if(rd){ rd.geometry.computeBoundingBox(); const b=rd.geometry.boundingBox; ribbonOK=b.min.x<85&&b.max.x>195&&b.min.z<-140&&b.max.z>-80; }
check('1. 背景有辛亥路彎道的路面（x 80～200、z −150～−60）',ribbonOK);
// 中線（和 zones3d.js 的 XH 同一個算法）
const WCX=94, WCZ=-96, WRY=-0.733, WCW=(lx,lz)=>[WCX+lx*Math.cos(WRY)+lz*Math.sin(WRY), WCZ-lx*Math.sin(WRY)+lz*Math.cos(WRY)];
const cz=-156, Q=WCW(0,-38.5), dx=Math.cos(WRY), dz=-Math.sin(WRY), th=Math.atan2(dz,dx), tt=(cz-Q[1])/dz, K=[Q[0]+tt*dx,cz], R=60, L=R*Math.tan(th/2), T1x=K[0]-L, C=[T1x,cz+R];
const pts=[]; for(let i=0;i<=14;i++){ const a=th*i/14; pts.push([C[0]+R*Math.sin(a),C[1]-R*Math.cos(a)]); } const T2=pts[pts.length-1]; for(let k=8;k<=232;k+=8) pts.push([T2[0]+dx*k,T2[1]+dz*k]);
let walk=[], n=0; for(let i=0;i+1<pts.length;i++){ const a=pts[i], b=pts[i+1], ux=b[0]-a[0], uz=b[1]-a[1], l=Math.hypot(ux,uz), nx=-uz/l, nz=ux/l;
  for(let s=0;s<l;s+=0.5) for(let o=-15.4;o<=15.4;o+=0.5){ const x=a[0]+ux*s/l+nx*o, zz=a[1]+uz*s/l+nz*o; n++; if(E.canStand(x,zz,0.32,0)) walk.push([x.toFixed(1),zz.toFixed(1)]); } }
check('2. 彎道＋東南段的路面、人行道、圍牆上沒有站得住的格子（檢查 '+n+' 點）',walk.length===0,JSON.stringify(walk.slice(0,6)));
const back=WCW(0,-23.3), dist=(x,zz)=>{ let m=1e9; for(let i=0;i+1<pts.length;i++){ const a=pts[i], b=pts[i+1], ux=b[0]-a[0], uz=b[1]-a[1], l2=ux*ux+uz*uz, q=Math.max(0,Math.min(1,((x-a[0])*ux+(zz-a[1])*uz)/l2)); m=Math.min(m,Math.hypot(x-a[0]-q*ux,zz-a[1]-q*uz)); } return m; };
check('3. 萬才館背後的阻擋外緣在校園側圍牆上（離中線 '+dist(back[0],back[1]).toFixed(2)+' m）',Math.abs(dist(back[0],back[1])-15.4)<0.6);
console.log('彎道起點 x '+T1x.toFixed(1)+'、轉角 ('+K[0].toFixed(1)+','+cz+')、東南段方向 '+(th*180/Math.PI).toFixed(1)+'°');
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
