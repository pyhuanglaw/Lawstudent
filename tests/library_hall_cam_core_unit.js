// 總圖大廳：跟隨鏡頭不會穿進中央大樓梯兩側的實心核心、兩側那一跑的下面（BUG-CAM-LIBHALL-CORE-1031，LAWWW2-B 2026-10-31；BB n31_lhcore）——不需要瀏覽器。
// 原本大廳沒有鏡頭碰撞（只有電梯井道）：玩家在核心東邊 (6.2,−2.6)、西邊 (−6.2,−3.2) 背對核心時，鏡頭退 4.8 m 穿過書架和灰泥牆，停在樓梯底下，
//   BB 量到 4 個方向玩家 0%（鏡頭 (2.10,3.43,−0.80)、(1.76,3.43,−2.20)、(−1.86,3.43,−2.25)、(−1.78,3.43,−2.75)）。
// 做法（src/library3d.js 的 coreCamCols）：核心兩塊（欄杆內側 → 書架外緣、高到二樓樓面）、兩側那一跑的下面（梯形斜塊）交給 engine3d.js 的 followCam 當隔間牆（zone.camCols），
//   擋到就拉近、抬高，autoSwing 轉向空的那一邊（和教學館、美國公寓同一套）；室內樹、盆栽的葉子網點透空（zone.seeThru、材質 seeThrough）。
// 這裡在 Node 建出遊戲真正的總圖大廳（程序化備用模型＝和正式模型同一份配置 src/data/library_layout.js），照引擎的跟隨鏡頭（camDist 4.8、俯角 0.38）算鏡頭位置，
//   看「頭 → 鏡頭」有沒有穿過實心的地方。「修改前」＝同一個引擎、把核心的碰撞盒拿掉（電梯井道照舊）：一定要量得到穿過去的方向（證明測試抓得到這個 bug）。
// 用法：node tests/library_hall_cam_core_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };   /* Node 沒有 fetch：正式模型載入失敗、用備用模型（預期的）*/
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.library_hall.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true);
const L=LIBRARY_LAYOUT, S=L.stair, CO=L.core, Y1=L.floors[1].y, DIST=Z3.ZONES.library_hall.camDist||4.8, PITCH=0.38, DT=1/30;

/* ---- 1. 碰撞盒 ---- */
const cols=(z.camCols||[])[0]||[], cols1=(z.camCols||[])[1]||[], byName=n=>cols.find(m=>m.name===n);
check('1. zone.camCols：第 0、1 層都有核心兩塊＋兩側那一跑的下面＋中庭四角的柱子（8 個）',cols.length===8&&cols1.length===8&&['CAMCOL_core_W','CAMCOL_core_E','CAMCOL_underStair_W','CAMCOL_underStair_E'].every(byName)&&cols.filter(m=>m.name==='CAMCOL_column').length===4,
  (z.camCols||[]).map(a=>a?a.map(m=>m.name).join('+'):'—').join(' / '));
{ const sh=L.furniture.find(f=>f.type==='coreShelf'&&f.x>0), b=new THREE.Box3().setFromObject(byName('CAMCOL_core_E')||new THREE.Object3D());
  check('1b. 東側核心的碰撞盒：x 從欄杆內側到書架外緣（導航阻擋的外緣）、z 涵蓋核心、高到二樓樓面',
    Math.abs(b.min.x-(S.railX-0.1-0.06))<0.01&&Math.abs(b.max.x-(sh.x+0.2+0.06))<0.01&&b.min.z<=CO.z0&&b.max.z>=CO.z1&&b.min.y<=0.01&&Math.abs(b.max.y-Y1)<0.01,
    `x ${b.min.x.toFixed(2)}～${b.max.x.toFixed(2)}、z ${b.min.z.toFixed(2)}～${b.max.z.toFixed(2)}、y ${b.min.y.toFixed(2)}～${b.max.y.toFixed(2)}`);
  check('1c. 碰撞盒看不見、不參加合併',cols.every(m=>m.material.visible===false&&m.userData.noMerge)); }

/* 實心的地方：核心兩塊（欄杆 → 書架外緣、二樓樓面以下）、兩側那一跑的下面（踏面以下）、中庭四角的柱子（一樓 r 0.3、二樓 0.26：量 0.26 以內）*/
const COLS=[[-CO.x1,L.upper.band.z1],[CO.x1,L.upper.band.z1],[-CO.x1,L.gates.z],[CO.x1,L.gates.z]];
const rx=S.railX-0.1, shX=L.furniture.find(f=>f.type==='coreShelf'&&f.x>0).x+0.2, ys=zz=>S.landing.y+(zz-S.side.z0)/(S.side.z1-S.side.z0)*(Y1-S.landing.y);
const sideX0=Math.min(Math.abs(S.sides[1].x0),Math.abs(S.sides[1].x1)), sideX1=Math.max(Math.abs(S.sides[1].x0),Math.abs(S.sides[1].x1));
const solid=p=>(Math.abs(p.x)>rx&&Math.abs(p.x)<shX&&p.z>CO.z0&&p.z<CO.z1&&p.y<Y1)||(Math.abs(p.x)>sideX0&&Math.abs(p.x)<sideX1&&p.z>S.side.z0&&p.z<S.side.z1&&p.y<ys(p.z)-0.02)||COLS.some(([cx,cz])=>Math.hypot(p.x-cx,p.z-cz)<0.26);
const through=(a,b)=>{ const n=Math.ceil(a.distanceTo(b)/0.02); for(let i=1;i<=n;i++) if(solid(a.clone().lerp(b,i/n))) return true; return false; };
/* 修改前＝同一個引擎、把核心的碰撞盒拿掉（電梯井道照舊）*/
const keep=z.camCols; function camNow(t,yaw,lv,out){ z._lcAll=null; return E.followCam(t,yaw,PITCH,DIST,lv,out); }
function camBefore(t,yaw,lv,out){ z.camCols=null; z._lcAll=null; const r=E.followCam(t,yaw,PITCH,DIST,lv,out); z.camCols=keep; z._lcAll=null; return r; }

/* ---- 2. 一樓大廳（地面上每 0.5 m、8 個方向）、樓梯和平台（每 0.25 m，第 0、1 層）、二樓樓面 ---- */
const REPORT={};
function sweep(name,lv,step,pick){ let n=0,bad=0,badOld=0,same=0,ex=null; E.player.lv=lv;
  for(let x=-L.W/2+0.5;x<=L.W/2-0.5;x+=step) for(let zz=-L.D/2+0.3;zz<=L.D/2-0.3;zz+=step){ if(!E.canStand(x,zz,0.32,lv)) continue; const fy=E.heightAt(x,zz,lv); if(!pick(x,zz,fy)) continue;
    const t=new THREE.Vector3(x,fy+1.45,zz);
    for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++; const c=new THREE.Vector3(), o=new THREE.Vector3(); camNow(t,yaw,lv,c); camBefore(t,yaw,lv,o);
      if(through(t,c)){ bad++; if(!ex) ex={x:+x.toFixed(2),z:+zz.toFixed(2),yaw:+yaw.toFixed(2),cam:c.toArray().map(v=>+v.toFixed(2))}; } if(through(t,o)) badOld++; if(c.distanceTo(o)<1e-6) same++; } }
  REPORT[name]={samples:n,before:badOld,after:bad,unchanged:same}; return {n,bad,badOld,same,ex}; }
const onStairs=(x,zz)=>Math.abs(x)<S.railX&&zz>CO.z0&&zz<CO.z1+0.05;
{ const r=sweep('1F 大廳',0,0.5,(x,zz,fy)=>fy<0.05&&!onStairs(x,zz));
  check('2a. 1F 大廳：修改前量得到鏡頭穿進核心（測試抓得到這個 bug）',r.badOld>0,`${r.badOld}/${r.n}（${(100*r.badOld/r.n).toFixed(1)}%）`);
  check('2b. 1F 大廳：頭 → 鏡頭沒有穿過核心、兩側那一跑的下面',r.bad===0,`${r.bad}/${r.n}`+(r.ex?' 例：'+JSON.stringify(r.ex):''));
  check('2c. 1F 大廳：離核心遠的地方鏡頭和修改前一樣（大部分方向沒變）',r.same>=r.n*0.6,`沒變 ${r.same}/${r.n}`); }
for(const lv of [0,1]){ const r=sweep('樓梯、平台（第 '+lv+' 層）',lv,0.25,(x,zz,fy)=>onStairs(x,zz)&&fy>0.05&&fy<Y1-0.05);
  check(`2d. 樓梯、平台（第 ${lv} 層）：修改前量得到穿過去的方向`,r.badOld>0,`${r.badOld}/${r.n}`);
  check(`2e. 樓梯、平台（第 ${lv} 層）：頭 → 鏡頭沒有穿過實心的地方`,r.bad===0,`${r.bad}/${r.n}`+(r.ex?' 例：'+JSON.stringify(r.ex):'')); }
{ const r=sweep('2F 樓面',1,0.5,(x,zz,fy)=>fy>Y1-0.05);
  check('2f. 2F 樓面：頭 → 鏡頭沒有穿過柱子（修改前量得到）',r.bad===0&&r.badOld>0,`修改前 ${r.badOld}、修改後 ${r.bad}/${r.n}`+(r.ex?' 例：'+JSON.stringify(r.ex):''));
  check('2g. 2F 樓面：除了柱子附近，鏡頭和修改前一樣（核心、樓梯下面的碰撞盒都在二樓樓面以下）',r.same>=r.n*0.97,`沒變 ${r.same}/${r.n}`); }

/* ---- 3. BB 的 4 個方向（n31_lhcore）：修改前鏡頭在 BB 量到的位置（穿進核心）；修改後 3 秒內轉開、看得到人 ---- */
const hz=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function sim(lv,x,zz,yaw){ const P=E.player; P.lv=lv; const fy=E.heightAt(x,zz,lv); P.obj.position.set(x,fy,zz); P.obj.rotation.y=yaw+Math.PI; P.seat=null; P.pose='idle';
  const C=E.cam={yaw,pitch:PITCH,dist:DIST,distTarget:DIST,target:new THREE.Vector3(x,fy+1.45,zz),mode:'follow',manualT:0,dragging:false,ctl:false,swing:0,swingAcc:0};
  const cam=new THREE.Vector3(); let flips=0, last=0; z._lcAll=null;
  for(let i=0;i<90;i++){ const r=E.followCam(C.target,C.yaw,PITCH,DIST,lv,cam); const st=E.autoSwing(C,P,PITCH,r,DT); if(st&&last&&Math.sign(st)!==Math.sign(last)) flips++; if(st) last=st; }
  const r1=E.followCam(C.target,C.yaw,PITCH,DIST,lv,cam); return {cam:cam.clone(),tgt:C.target.clone(),d:r1.dist,h:hz(cam,C.target),turned:(C.yaw-yaw)*180/Math.PI,flips}; }
const BB=[[6.2,-2.6,[2.10,3.43,-0.80]],[6.2,-2.6,[1.76,3.43,-2.20]],[-6.2,-3.2,[-1.86,3.43,-2.25]],[-6.2,-3.2,[-1.78,3.43,-2.75]]];
const R3={};
for(const [x,zz,bc] of BB){ const yaw=Math.atan2(bc[0]-x,bc[2]-zz), t=new THREE.Vector3(x,E.heightAt(x,zz,0)+1.45,zz), o=new THREE.Vector3(); E.player.lv=0; camBefore(t,yaw,0,o);
  const name=`(${x},${zz}) → 鏡頭 (${bc.join(',')})`, r=sim(0,x,zz,yaw);
  R3[name]={before:o.toArray().map(v=>+v.toFixed(2)),after:r.cam.toArray().map(v=>+v.toFixed(2)),horiz:+r.h.toFixed(2),turned:+r.turned.toFixed(0)};
  check('3a. BB '+name+'：修改前的鏡頭就在 BB 量到的位置、穿進核心（重現）',o.distanceTo(new THREE.Vector3(...bc))<0.15&&through(t,o),`修改前 ${o.toArray().map(v=>v.toFixed(2)).join(',')}`);
  check('3b. BB '+name+'：3 秒內轉開——水平離頭 ≥ 1.2 m、頭 → 鏡頭沒有穿過實心的地方、沒有左右來回',r.h>=1.2&&!through(r.tgt,r.cam)&&r.flips===0,
    `鏡頭 ${r.cam.toArray().map(v=>v.toFixed(2)).join(',')}、水平 ${r.h.toFixed(2)} m、轉了 ${r.turned.toFixed(0)}°、來回 ${r.flips} 次`); }

/* ---- 4. 室內樹、盆栽的葉子網點透空（正式模型載入時；Node 載不到 GLB，查程式和模型的材質）---- */
{ const src=fs.readFileSync(path.join(ROOT,'src/library3d.js'),'utf8');
  check('4a. library3d.js：正式模型載入後區域打開 seeThru、名字有 leaf 的材質標 seeThrough＋patchSeeThrough',/zone\.seeThru=true;\s*root\.traverse\([\s\S]{0,200}\/leaf\/\.test\(m\.name[\s\S]{0,120}m\.userData\.seeThrough=true;\s*if\(E\.patchSeeThrough\) E\.patchSeeThrough\(m\)/.test(src));
  const b=fs.readFileSync(path.join(ROOT,'assets/models/env/library_interior.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
  const leaf=j.materials.map(m=>m.name).filter(n_=>/leaf/.test(n_));
  check('4b. 正式模型 library_interior.glb 有葉子的材質（室內樹 lb_leaf_small、盆栽）',leaf.includes('lb_leaf_small')&&leaf.length>=3,leaf.join(', '));
  check('4c. 引擎有 E.patchSeeThrough（室內要區域 seeThru 才開）',typeof E.patchSeeThrough==='function'); }

console.log(JSON.stringify({sweep:REPORT,bb:R3}));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
