// 教學館室內的跟隨鏡頭不會跑到隔間牆後面（2026-10-13 LAWWW2 審查 P1，claude/second-ai-env-art c5e2170）——不需要瀏覽器。
// 原本室內沒有鏡頭碰撞，隔間牆只做「玩家附近網點透空」：鏡頭跑到牆後面時整個畫面是那面牆（LAWWW2 量到：博雅 1F 18%／2F 25%、普通 33／36%、共同 24／32%）。
// 做法（src/engine3d.js 的 followCam、src/teach3d.js 的 camColliders）：鏡頭對玩家那一層的隔間牆做碰撞，拉近到牆前、拉近時抬高。
// 這裡在 Node 建出遊戲真正的三棟（程序化備用模型＝和正式模型同一份配置），每一層 0.5 m 一點（人站得住、不在關著的房間）、8 個方向，
// 照引擎的跟隨鏡頭（室內 camDist 4.6、俯角 0.38）算鏡頭位置，看「頭 → 鏡頭」有沒有穿過同一層的隔間牆（門洞不算；門洞上面 2.4 m 以上的門楣算）。
// 同一個測試也用修改前的公式（沒有隔間牆碰撞）跑一次：三棟一定要量得到被擋住的方向（證明這個測試抓得到這個 bug）。
// 另外檢查：入口的門框跟著南牆淡出（在淡出清單 zone.walls 裡）；戶外的鏡頭碰撞照舊（建築碰撞盒，最近 0.7 m）。
// 用法：node tests/teach_cam_walls_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; let tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true); return z; }
check('引擎有 E.followCam（跟隨鏡頭的位置＋碰撞）',typeof E.followCam==='function');
/* 牆扣掉門洞的線段（和 teach3d.js 的 wallSegs 同一個規則）；門洞 */
function wallLines(L,lv){ const out=[], gaps=[]; for(const w of L.walls){ if((w.lv|0)!==lv) continue; const horiz=Math.abs(w.z0-w.z1)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
  const gs=(w.gaps||[]).map(g=>[Math.min(g[0],g[1]),Math.max(g[0],g[1])]).sort((p,q)=>p[0]-q[0]); let a=a0; for(const [g0,g1] of gs){ if(g0>a) out.push(horiz?[a,w.z0,g0,w.z0]:[w.x0,a,w.x0,g0]); a=Math.max(a,g1); gaps.push(horiz?[g0,w.z0,g1,w.z0]:[w.x0,g0,w.x0,g1]); } if(a<a1) out.push(horiz?[a,w.z0,a1,w.z0]:[w.x0,a,w.x0,a1]); } return {lines:out,gaps}; }
function crossT(ax,az,bx,bz,s){ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return -1; const t=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den, e=0.05/Math.max(1e-6,Math.hypot(q[0],q[1])); return (t>0&&t<1&&u>-e&&u<1+e)?t:-1; }   /* 牆的兩端多算 5 cm（不是照比例：14 m 長的牆不能多出 0.3 m）*/
function distSeg(px,pz,s){ const [ax,az,bx,bz]=s; const vx=bx-ax, vz=bz-az, L2=vx*vx+vz*vz; let t=L2?((px-ax)*vx+(pz-az)*vz)/L2:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(px-ax-t*vx,pz-az-t*vz); }
/* 頭 → 鏡頭被擋住：穿過牆（門洞以外），或從門洞穿過去但那裡的高度在門楣（地板＋2.4 m）以上 */
function blocked(head,cam,W,floorY){ for(const s of W.lines) if(crossT(head.x,head.z,cam.x,cam.z,s)>=0) return true;
  for(const g of W.gaps){ const t=crossT(head.x,head.z,cam.x,cam.z,g); if(t>=0&&head.y+(cam.y-head.y)*t>floorY+2.4) return true; } return false; }
const oldCam=(tgt,yaw,pitch,dist)=>new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),Math.sin(pitch)*dist+0.2,Math.cos(yaw)*dist*Math.cos(pitch)).add(tgt);
const REPORT={};
for(const id of ['boya','putong','gongtong']){ const z=loadZone(id), L=z.layout; tag='['+L.name+'] '; const dist=Z3.ZONES[id].camDist||4.6, pitch=0.38; REPORT[id]={};
  check('鏡頭碰撞用的隔間牆：每一層都有（zone.camCols）',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length>0&&(L.walls.some(w=>w.lv===1)?z.camCols[1]&&z.camCols[1].length>0:true),z.camCols?z.camCols.map(a=>a?a.length:0).join('/'):'沒有');
  /* 入口門框：在淡出清單裡（鏡頭在南牆外、牆淡出時門框一起淡出）*/
  { const EN=L.entrance, D=L.D; const fr=(z.walls||[]).filter(w=>Math.abs(w.position.z-(D/2-0.12))<0.02&&w.position.y<3);
    check('入口門框（左右兩根＋上面一根）在淡出清單裡，跟著南牆淡出',fr.length>=3,fr.length+' 個');
    const cam={position:new THREE.Vector3((EN.a0+EN.a1)/2,2.6,D/2+3.5)}; z.fadeWalls(cam); check('鏡頭在南牆外（剛進門）：門框是淡的（不透明度 < 0.5）',fr.length>0&&fr.every(w=>w.material.opacity<0.5),fr.map(w=>w.material.opacity).join(',')); }
  for(const fl of L.floors){ const lv=fl.lv|0, W=wallLines(L,lv), closed=(L.rooms||[]).filter(r=>r.kind==='closed'&&(r.lv|0)===lv);
    let n=0, bad=0, badOld=0, near=0, ex=null; E.player.lv=lv;
    for(let x=-L.W/2+0.6; x<=L.W/2-0.6; x+=0.5) for(let zz=-L.D/2+0.6; zz<=L.D/2-0.6; zz+=0.5){
      if(closed.some(r=>x>r.x0&&x<r.x1&&zz>r.z0&&zz<r.z1)) continue; if(!E.canStand(x,zz,0.32,lv)) continue;
      const fy=E.heightAt(x,zz,lv); if(lv===1&&fy<fl.y-0.05) continue; if(lv===0&&fy>0.05) continue;   /* 樓梯上的點另外算（兩層共用）*/
      const tgt=new THREE.Vector3(x,fy+1.45,zz);
      for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++;
        if(blocked(tgt,oldCam(tgt,yaw,pitch,dist),W,fy)) badOld++;
        const cam=new THREE.Vector3(); const r=E.followCam?E.followCam(tgt,yaw,pitch,dist,lv,cam):(cam.copy(oldCam(tgt,yaw,pitch,dist)),{dist});
        if(blocked(tgt,cam,W,fy)){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:+yaw.toFixed(2),cam:[+cam.x.toFixed(2),+cam.y.toFixed(2),+cam.z.toFixed(2)]}; }
        if(r.dist<1.2) near++; } }
    const pOld=+(100*badOld/Math.max(1,n)).toFixed(1), pNew=+(100*bad/Math.max(1,n)).toFixed(1); REPORT[id][fl.name]={samples:n,before:pOld+'%',after:pNew+'%',closeUp:(100*near/Math.max(1,n)).toFixed(1)+'%'};
    check(fl.name+'：修改前的公式量得到被牆擋住的方向（測試抓得到這個 bug）',badOld>0,`${pOld}%（${badOld}/${n}）`);
    check(fl.name+'：跟隨鏡頭不會跑到隔間牆後面（頭 → 鏡頭沒有穿過牆或門楣）',bad===0,`${pNew}%（${bad}/${n}）`+(ex?' 例：'+JSON.stringify(ex):'')); } }
/* 戶外照舊：建築碰撞盒（E.colliders）最近 0.7 m、不抬高 */
{ tag='[戶外] '; E.zone={}; E.colliders=[]; const box=new THREE.Mesh(new THREE.BoxGeometry(2,6,2),new THREE.MeshBasicMaterial()); box.position.set(0,3,3); box.updateMatrixWorld(true); E.colliders.push(box);
  const tgt=new THREE.Vector3(0,1.45,0), cam=new THREE.Vector3(); const r=E.followCam(tgt,0,0.22,6,0,cam);
  const d0=new THREE.Vector3(0,Math.sin(0.22)*6+0.2,Math.cos(0.22)*6).normalize(), hd=2/d0.z, want=tgt.clone().addScaledVector(d0,Math.max(0.7,hd-0.35));   /* 盒子的前面在 z=2 */
  check('建築碰撞盒：沿著原本的視線拉近到牆前 0.35 m、不抬高（和以前一樣）',!r.inner&&Math.abs(r.dist-(hd-0.35))<1e-6&&cam.distanceTo(want)<1e-6,JSON.stringify(r)+' 鏡頭 '+cam.toArray().map(v=>v.toFixed(2)).join(',')); }
console.log(JSON.stringify(REPORT));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
