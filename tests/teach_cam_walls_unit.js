// 教學館室內的跟隨鏡頭不會跑到隔間牆後面（2026-10-13 LAWWW2 審查 P1，claude/second-ai-env-art c5e2170）——不需要瀏覽器。
// 原本室內沒有鏡頭碰撞，隔間牆只做「玩家附近網點透空」：鏡頭跑到牆後面時整個畫面是那面牆（LAWWW2 量到：博雅 1F 18%／2F 25%、普通 33／36%、共同 24／32%）。
// 做法（src/engine3d.js 的 followCam、src/teach3d.js 的 camColliders）：鏡頭對玩家那一層的隔間牆做碰撞，拉近到牆前、拉近時抬高。
// 這裡在 Node 建出遊戲真正的三棟（程序化備用模型＝和正式模型同一份配置），每一層 0.5 m 一點（人站得住、不在關著的房間）、8 個方向，
// 照引擎的跟隨鏡頭（室內 camDist 4.6、俯角 0.38）算鏡頭位置，看「頭 → 鏡頭」有沒有穿過同一層的隔間牆（門洞不算；門洞上面 2.4 m 以上的門楣算）。
// 同一個測試也用修改前的公式（沒有隔間牆碰撞）跑一次：三棟一定要量得到被擋住的方向（證明這個測試抓得到這個 bug）。
// 另外檢查：入口的門框跟著南牆淡出（在淡出清單 zone.walls 裡）；戶外的鏡頭碰撞照舊（建築碰撞盒，最近 0.7 m）。
// 第二輪（LAWWW2 CAMERA_WALLS §1，claude/second-ai-env-art；使用者轉達「鏡頭穿牆是最優先的共用技術問題」）：不穿牆之後，貼牆時鏡頭停在頭頂上方、畫面只剩頭頂和地板（10 個案例）；
//   普通 1F 門廳的公告欄不在鏡頭碰撞裡，鏡頭停在它的雨遮上方 0.22 m（畫面一大塊深色）。檢查 LAWWW2 的 10 個位置與方向：修改前的鏡頭真的貼在頭頂上方（測試重現得到）；
//   修改後沒在拖鏡頭時 3 秒內自動轉開（水平離頭 1.2 m 以上、不穿牆）、不會左右來回；拖著鏡頭、剛放開、坐著時不轉；推著搖桿時人的方向不跟著轉；公告欄擋鏡頭、轉開後鏡頭離公告欄 0.5 m 以上。
// 用法：node tests/teach_cam_walls_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
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
/* ---- 第二輪：貼牆時自動轉開（LAWWW2 的 10 個案例）＋公告欄 ---- */
{ const CASES=[['boya',1,16.1,1.6,0.7854,'boya_2F_1'],['boya',1,-5.4,-1.4,3.927,'boya_2F_2'],['boya',1,5.1,8.1,0.7854,'boya_2F_4'],['gongtong',1,11.1,1.6,0,'gongtong_2F_2'],['gongtong',1,4.1,0.1,3.927,'gongtong_2F_3'],
    ['gongtong',1,-4.4,0.1,3.927,'gongtong_2F_4'],['putong',0,16.1,1.1,0.7854,'putong_1F_1'],['putong',0,-3.4,7.1,3.927,'putong_1F_2'],['putong',1,-3.4,7.1,3.927,'putong_2F_1'],['putong',1,3.1,7.1,1.5708,'putong_2F_4']];
  const PITCH=0.38, DIST=4.6, DT=1/30;
  const hz=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  /* 跑 n 幀：每一幀照引擎的 updateCamera 算跟隨鏡頭、再讓 autoSwing 轉（修改前沒有 autoSwing：鏡頭不動）*/
  function sim(lv,x,zz,yaw,o){ o=o||{}; const P=E.player; P.lv=lv; const fy=E.heightAt(x,zz,lv); P.obj.position.set(x,fy,zz); P.obj.rotation.y=o.face!=null?o.face:yaw+Math.PI; P.seat=o.seat||null; P.pose=o.seat?'sit':'idle';
    const C=E.cam={yaw,pitch:PITCH,dist:DIST,distTarget:DIST,target:new THREE.Vector3(x,fy+1.45,zz),mode:'follow',manualT:o.manualT||0,dragging:!!o.dragging,ctl:!!o.ctl,swing:0,swingAcc:0};
    const cam=new THREE.Vector3(), r0=E.followCam(C.target,C.yaw,PITCH,DIST,lv,cam), cam0=cam.clone(); let flips=0, lastSt=0;
    for(let i=0;i<(o.frames!=null?o.frames:90);i++){ const r=E.followCam(C.target,C.yaw,PITCH,DIST,lv,cam); if(o.manualT) C.manualT=o.manualT; const st=E.autoSwing?E.autoSwing(C,P,PITCH,r,DT):0; if(st&&lastSt&&Math.sign(st)!==Math.sign(lastSt)) flips++; if(st) lastSt=st; }
    const r1=E.followCam(C.target,C.yaw,PITCH,DIST,lv,cam); return {d0:r0.dist,h0:hz(cam0,C.target),up0:cam0.y-C.target.y,d1:r1.dist,h1:hz(cam,C.target),up1:cam.y-C.target.y,cam:cam.clone(),tgt:C.target.clone(),fy,yaw0:yaw,yaw1:C.yaw,acc:C.swingAcc||0,flips}; }
  check('引擎有 E.autoSwing（貼牆時鏡頭自動轉開）',typeof E.autoSwing==='function');
  const R2={};
  for(const id of ['boya','gongtong','putong']){ const z=loadZone(id), L=z.layout; tag='['+L.name+'] ';
    for(const c of CASES.filter(c=>c[0]===id)){ const [ , lv,x,zz,yaw,name]=c, W=wallLines(L,lv), r=sim(lv,x,zz,yaw);
      R2[name]={before:{horiz:+r.h0.toFixed(2),up:+r.up0.toFixed(2)},after:{horiz:+r.h1.toFixed(2),up:+r.up1.toFixed(2),turned:+((r.yaw1-r.yaw0)*180/Math.PI).toFixed(0)}};
      check(name+'：沒轉開時鏡頭貼在頭頂上方（水平離頭 < 1.2 m；LAWWW2 量到 0.40–0.92 m）——測試重現得到',r.h0<1.2,`水平 ${r.h0.toFixed(2)} m、比頭高 ${r.up0.toFixed(2)} m`);
      check(name+'：3 秒內自動轉開——水平離頭 ≥ 1.2 m、頭 → 鏡頭沒有穿牆、沒有左右來回',r.h1>=1.2&&!blocked(r.tgt,r.cam,W,r.fy)&&r.flips===0,`水平 ${r.h1.toFixed(2)} m、比頭高 ${r.up1.toFixed(2)} m、轉了 ${((r.yaw1-r.yaw0)*180/Math.PI).toFixed(0)}°、來回 ${r.flips} 次`); }
    if(id==='putong'){ const c=CASES.find(q=>q[5]==='putong_1F_2'), [ , lv,x,zz,yaw]=c;
      const dr=sim(lv,x,zz,yaw,{dragging:true}); check('拖著鏡頭時不自動轉（putong_1F_2）',Math.abs(dr.yaw1-yaw)<1e-9,`轉了 ${((dr.yaw1-yaw)*180/Math.PI).toFixed(1)}°`);
      const mr=sim(lv,x,zz,yaw,{manualT:1.2}); check('剛放開鏡頭（1.5 秒內）不自動轉',Math.abs(mr.yaw1-yaw)<1e-9,`轉了 ${((mr.yaw1-yaw)*180/Math.PI).toFixed(1)}°`);
      const sr=sim(lv,x,zz,yaw,{seat:{x,z:zz}}); check('坐著時不自動轉',Math.abs(sr.yaw1-yaw)<1e-9,`轉了 ${((sr.yaw1-yaw)*180/Math.PI).toFixed(1)}°`);
      const cr=sim(lv,x,zz,yaw,{ctl:true}); check('推著搖桿時：鏡頭照樣轉開，但搖桿用的方向（yaw − swingAcc）不變——人不會被轉去撞牆',Math.abs(cr.yaw1-yaw)>0.3&&Math.abs((cr.yaw1-cr.acc)-yaw)<1e-9,`鏡頭轉了 ${((cr.yaw1-yaw)*180/Math.PI).toFixed(0)}°、搖桿方向差 ${(((cr.yaw1-cr.acc)-yaw)*180/Math.PI).toFixed(2)}°`);
      /* 公告欄（§1(2)）：照配置算公告欄的範圍（和模型同尺寸：寬 2.6、高 2.5、雨遮往前 0.35 m），修改前後用同一個範圍量 */
      const bd=L.boards.find(b=>b.style!=='screen'&&(b.lv|0)===lv), bc=new THREE.Vector3(bd.x+Math.sin(bd.ry)*0.1,(lv?L.floors[1].y:0)+1.25,bd.z+Math.cos(bd.ry)*0.1);
      const boxDist=p=>{ const dx=p.x-bc.x, dz=p.z-bc.z, c=Math.cos(bd.ry), s=Math.sin(bd.ry), lx=dx*c-dz*s, lz=dx*s+dz*c, ly=p.y-bc.y; const ex=Math.max(0,Math.abs(lx)-1.3), ey=Math.max(0,Math.abs(ly)-1.25), ez=Math.max(0,Math.abs(lz)-0.25); return Math.hypot(ex,ey,ez); };
      check('公告欄在鏡頭碰撞裡（zone.camCols，和隔間牆同一層）',(z.camCols[lv]||[]).some(m=>m.userData.camFurn==='bulletin'));
      const r0=sim(lv,x,zz,yaw,{frames:0}), r1=sim(lv,x,zz,yaw);
      check('putong_1F_2：修改前的鏡頭貼著公告欄（< 0.5 m）——測試重現得到（之後轉開）',boxDist(r0.cam)<0.5||!E.autoSwing,`離公告欄 ${boxDist(r0.cam).toFixed(2)} m`);
      check('putong_1F_2：轉開之後鏡頭離公告欄 ≥ 0.5 m',boxDist(r1.cam)>=0.5,`離公告欄 ${boxDist(r1.cam).toFixed(2)} m`); } }
  console.log(JSON.stringify(R2)); }
/* 戶外照舊：建築碰撞盒（E.colliders）最近 0.7 m、不抬高 */
{ tag='[戶外] '; E.zone={}; E.colliders=[]; const box=new THREE.Mesh(new THREE.BoxGeometry(2,6,2),new THREE.MeshBasicMaterial()); box.position.set(0,3,3); box.updateMatrixWorld(true); E.colliders.push(box);
  const tgt=new THREE.Vector3(0,1.45,0), cam=new THREE.Vector3(); const r=E.followCam(tgt,0,0.22,6,0,cam);
  const d0=new THREE.Vector3(0,Math.sin(0.22)*6+0.2,Math.cos(0.22)*6).normalize(), hd=2/d0.z, want=tgt.clone().addScaledVector(d0,Math.max(0.7,hd-0.35));   /* 盒子的前面在 z=2 */
  check('建築碰撞盒：沿著原本的視線拉近到牆前 0.35 m、不抬高（和以前一樣）',!r.inner&&Math.abs(r.dist-(hd-0.35))<1e-6&&cam.distanceTo(want)<1e-6,JSON.stringify(r)+' 鏡頭 '+cam.toArray().map(v=>v.toFixed(2)).join(',')); }
console.log(JSON.stringify(REPORT));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
