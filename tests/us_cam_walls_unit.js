// 美國公寓、C 棟 208 的跟隨鏡頭不會跑到牆後面（BUG-CAM-C208-1021，BB_218 artrev2 57／58／62／77／78）——不需要瀏覽器。
// BB 量到的：樓梯平台 (0.4, 4) 鏡頭在北跑進屋裡（隔著南牆；第一版修好以後遊戲內 57 還是轉到屋裡、貼著南牆比牆頂高一點——外牆的壁板高到 3.0 m，牆只算到 2.6 m 抓不到）、鏡頭在西被平台西端的牆擋住；一進門 (−1, 2.2) 鏡頭在東、廚房 (−2.6, 1.9) 鏡頭在南／東，整個畫面是一面牆。
// 做法（src/us3d.js 的 aptCamCols）：和教學館同一套——zone.camCols 交給 engine3d.js 的 followCam（擋到就拉近、抬高）、autoSwing（轉向空的那一邊）。
// 這裡在 Node 建出遊戲真正的兩戶（程序化備用模型＝和正式模型同一份配置），每 0.4 m 一點（人站得住）、8 個方向，照引擎的跟隨鏡頭（camDist 3.6、俯角 0.38）算鏡頭位置，
// 看「頭 → 鏡頭」有沒有穿過牆：牆照配置自己算（不是拿 camCols 來量），關著的門、窗算牆；開著的大門、廚房門、陽台門、吧台窗口（窗台到窗楣之間）不算；門楣以上算。
// 同一個測試也用修改前的公式（沒有牆的碰撞）跑一次：一定要量得到被擋住的方向（證明這個測試抓得到這個 bug）。BB 的五個位置另外跑 3 秒的自動轉開。
// 用法：node tests/us_cam_walls_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（牆、導航和備用模型同一份配置）
let fails=0, tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true); return z; }
/* 配置的牆 → 會擋鏡頭的部分：{p:[x0,z0,x1,z1], y0, y1}（照 us_shared_layout.js 的寫法；和 us3d.js 的 aptCamCols 分開寫，才算獨立的量法）*/
function solidParts(L,H){ const out=[]; const seg=(w,a,b,y0,y1)=>{ if(b-a<0.01||y1-y0<0.01) return; out.push({p:w.axis==='x'?[a,w.at,b,w.at]:[w.at,a,w.at,b],y0,y1}); };
  /* 外牆（N、S、E、W）外面的壁板高到 H+0.4（us_apartment.py 的 OUTER；整面一片，從外面看得到）——鏡頭在屋裡比牆頂高的時候，視線照樣被它和牆頂擋住 */
  for(const w of L.walls[0].list){ const lo=Math.min(w.from,w.to), hi=Math.max(w.from,w.to), open=[], Hw=/^[NSEW]$/.test(w.id||'')?H+0.4:H;
    for(const o of (w.open||[])){ const a=Math.min(o[0],o[1]), b=Math.max(o[0],o[1]), kind=o[2]||'';
      const d=L.doors.find(q=>{ const u=w.axis==='x'?q.x:q.z, c=w.axis==='x'?q.z:q.x; return Math.abs(c-w.at)<0.15&&u>a-0.05&&u<b+0.05; });
      const thru=kind==='passThrough'||(d?(!d.closed||d.openDoor):!/window/i.test(kind));   /* 關著的門、窗：牆（openDoor＋closed＝門開著、closed 只是門口「看」的字：祐廷單人戶 v3 的衣物間、衛浴）*/
      if(thru) open.push({a,b,y0:kind==='passThrough'?(w.sill||0):0,y1:w.head||2.05}); }
    open.sort((p,q)=>p.a-q.a); let a=lo; for(const p of open){ seg(w,a,p.a,0,Hw); seg(w,p.a,p.b,0,p.y0); seg(w,p.a,p.b,p.y1,Hw); a=p.b; } seg(w,a,hi,0,Hw); }
  const BW=L.breezeway; if(BW) out.push({p:[BW.x0,BW.z0,BW.x0,BW.z1],y0:0,y1:2.85});
  return out; }
/* 頭 → 鏡頭穿過擋鏡頭的牆：水平線段相交（牆的兩端各縮 3 cm：擦過端點不算），交點的高度在那一段牆的範圍內 */
function crossT(ax,az,bx,bz,s){ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return -1;
  const t=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den, e=0.03/Math.max(1e-6,Math.hypot(q[0],q[1])); return (t>0&&t<1&&u>e&&u<1-e)?t:-1; }
function blocked(head,cam,parts){ for(const s of parts){ const t=crossT(head.x,head.z,cam.x,cam.z,s.p); if(t<0) continue; const y=head.y+(cam.y-head.y)*t; if(y>s.y0+0.02&&y<s.y1-0.02) return s; } return null; }
const oldCam=(tgt,yaw,pitch,dist)=>new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),Math.sin(pitch)*dist+0.2,Math.cos(yaw)*dist*Math.cos(pitch)).add(tgt);
check('引擎有 E.followCam、E.autoSwing',typeof E.followCam==='function'&&typeof E.autoSwing==='function');
const PITCH=0.38, DT=1/30, hz=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const REPORT={};
for(const id of ['us_shared','us_apartment']){ const z=loadZone(id), L=id==='us_shared'?US_SHARED_LAYOUT:z.layout||null; tag='['+id+'] ';
  const LL=L||(typeof US_APARTMENT_LAYOUT!=='undefined'?US_APARTMENT_LAYOUT:null); if(!LL){ check('找得到配置',false); continue; }
  const H=LL.ceilY||2.6, parts=solidParts(LL,H), dist=Z3.ZONES[id].camDist||3.6;
  check('鏡頭碰撞用的牆（zone.camCols[0]）',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length>10,z.camCols&&z.camCols[0]?z.camCols[0].length+' 塊':'沒有');
  let n=0, bad=0, badOld=0, near=0, ex=null;
  for(let x=-5.0;x<=5.0;x+=0.4) for(let zz=-5.0;zz<=5.0;zz+=0.4){ if(!E.canStand(x,zz,0.32,0)) continue; const tgt=new THREE.Vector3(x,1.45,zz);
    for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++; if(blocked(tgt,oldCam(tgt,yaw,PITCH,dist),parts)) badOld++;
      const cam=new THREE.Vector3(), r=E.followCam(tgt,yaw,PITCH,dist,0,cam); if(r.dist<1.2) near++;
      const hit=blocked(tgt,cam,parts); if(hit){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:+yaw.toFixed(2),cam:cam.toArray().map(v=>+v.toFixed(2)),wall:hit.p}; } } }
  const pOld=+(100*badOld/Math.max(1,n)).toFixed(1), pNew=+(100*bad/Math.max(1,n)).toFixed(1); REPORT[id]={samples:n,before:pOld+'%',after:pNew+'%',closeUp:(100*near/Math.max(1,n)).toFixed(1)+'%'};
  check('修改前的公式量得到被牆擋住的方向（測試抓得到這個 bug）',badOld>0,`${pOld}%（${badOld}/${n}）`);
  check('跟隨鏡頭不會跑到牆後面（頭 → 鏡頭沒有穿過牆、關著的門、窗、門楣）',bad===0,`${pNew}%（${bad}/${n}）`+(ex?' 例：'+JSON.stringify(ex):''));
  if(id!=='us_shared') continue;
  /* BB_218 的五個位置（artrev2 57、58、62、77／101、78／102）：沒轉開前被牆擋住（測試重現得到）；3 秒內自動轉開：不穿牆、鏡頭水平離頭 ≥ 1.0 m、沒有左右來回 */
  const CASES=[['平台・鏡頭在北（57）',0.4,4.0,Math.PI],['平台・鏡頭在西（58）',0.4,4.0,-Math.PI/2],['一進門・鏡頭在東（62）',-1.0,2.2,Math.PI/2],['廚房・鏡頭在南（77）',-2.6,1.9,0],['廚房・鏡頭在東（78）',-2.6,1.9,Math.PI/2]];
  for(const [name,x,zz,yaw] of CASES){ const P=E.player; P.obj.position.set(x,0,zz); P.obj.rotation.y=yaw+Math.PI; P.seat=null; P.pose='idle';
    const C=E.cam={yaw,pitch:PITCH,dist,distTarget:dist,target:new THREE.Vector3(x,1.45,zz),mode:'follow',manualT:0,dragging:false,ctl:false,swing:0,swingAcc:0};
    const was=blocked(C.target,oldCam(C.target,yaw,PITCH,dist),parts); const cam=new THREE.Vector3(); let flips=0, last=0;
    for(let i=0;i<90;i++){ const r=E.followCam(C.target,C.yaw,PITCH,dist,0,cam); const st=E.autoSwing(C,P,PITCH,r,DT); if(st&&last&&Math.sign(st)!==Math.sign(last)) flips++; if(st) last=st; }
    E.followCam(C.target,C.yaw,PITCH,dist,0,cam); const hit=blocked(C.target,cam,parts), h=hz(cam,C.target);
    REPORT[name]={before:was?'穿牆':'沒穿牆',after:{horiz:+h.toFixed(2),up:+(cam.y-C.target.y).toFixed(2),turned:Math.round((C.yaw-yaw)*180/Math.PI)}};
    check(name+'：修改前的鏡頭在牆後面（重現得到 BB 的畫面）',!!was);
    check(name+'：3 秒內轉開——不穿牆、鏡頭水平離頭 ≥ 1.0 m、沒有左右來回',!hit&&h>=1.0&&flips===0,`水平 ${h.toFixed(2)} m、比頭高 ${(cam.y-C.target.y).toFixed(2)} m、轉了 ${Math.round((C.yaw-yaw)*180/Math.PI)}°、來回 ${flips} 次`); }
}
tag=''; console.log(JSON.stringify(REPORT,null,1));
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
