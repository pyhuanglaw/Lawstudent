// 法圖討論室：講座日坐下以後鏡頭在東牆外（BUG-CAM-LAWLIB-DISCA-1108，BB-B 11-08 P2；LAWWW2-B 修，D108）——不需要瀏覽器（D131）。
// 現象（CC f40ffa537a AA613_cloud/eacc 02、05）：大一上講座日 15:30 坐討論室 A 的空位（−6.2, −6.8，面向東），整場講座鏡頭在 (−2.3, 3.21, −6.8)，
//   討論室 A 是 x −7.1～−3.7，鏡頭在東牆外 1.4 m（隔壁討論室 B 裡），畫面整張是隔間牆的米色、看不到人。
// 原因：法圖（src/lawlib3d.js）沒有 zone.camCols，跟隨鏡頭只撞 E.colliders（戶外建築），室內的隔間牆擋不住鏡頭；外牆會淡出，隔間牆不會。
// 做法：北側房間的隔間牆、前牆（門洞兩側、門楣、討論室的玻璃）放看不見的板子當 camCols[0]（和教學館同一套）。
// 檢查（在 Node 建出遊戲真正的法圖，照引擎的跟隨鏡頭算：距離＝區域的 camDist 4.4、室內俯角 0.38）：
//   ① camCols 第 0 層有三道隔間牆（−3.6、0、3.2）和前牆：看不見、不參加合併；第 1 層沒有（書架有網點透空）
//   ② CC 那一個畫面（討論室 A 西側 (−6.2, −6.8)、鏡頭在東邊）：修改前鏡頭在討論室 A 外面（測試抓得到）；修改後在討論室 A 裡面、天花板下面、離頭 1.2 m 以上
//   ③ 兩間討論室的八個座位、八個方向：頭到鏡頭這一段不穿過隔間牆、前牆（穿出北牆、西牆到建築外面可以：外牆本來就會淡出）；修改前有穿過去的
//   ④ 大廳（前牆以南 1 m 以外）鏡頭朝南（往大廳，不朝北側房間）時和修改前一模一樣
// 用法：node tests/lawlib_cam_disc_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
{ const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ if(k==='bldg.lawlib_interior') return Promise.reject(new Error('node')); return lo.apply(this,arguments); }; }
const L=LAWLIB_LAYOUT, D=L.D, FZ=L.frontZ, H=L.ceil0;
const z=Z3.ZONES.lawlib.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true);
const DIST=Z3.ZONES.lawlib.camDist||4.4, PITCH=0.38;   /* engine3d.js enterZone：室內俯角 0.38 */
const cols0=(z.camCols||[])[0]||[], cols1=(z.camCols||[])[1]||[];
{ const parts=cols0.filter(m=>m.name==='CAMCOL_part'), fronts=cols0.filter(m=>/^CAMCOL_(front|lintel)$/.test(m.name));
  const xs=parts.map(m=>+m.position.x.toFixed(2)).sort((a,b)=>a-b), ok=L.partitions.every(px=>xs.some(x=>Math.abs(x-px)<0.01));
  const inv=cols0.length>0&&cols0.every(m=>m.material.visible===false&&m.userData.noMerge);
  check('① camCols 第 0 層：三道隔間牆＋前牆（門洞兩側、門楣），看不見、不參加合併；第 1 層沒有', ok&&fronts.length>=7&&inv&&cols1.length===0,
    `隔間牆 x ${xs.join('、')}、前牆 ${fronts.length} 塊、第 1 層 ${cols1.length} 塊`); }
const keep=z.camCols;
const camNow=(t,yaw,out)=>{ z._lcAll=null; return E.followCam(t,yaw,PITCH,DIST,0,out); };
const camBefore=(t,yaw,out)=>{ z.camCols=null; z._lcAll=null; const r=E.followCam(t,yaw,PITCH,DIST,0,out); z.camCols=keep; z._lcAll=null; return r; };
const seats=LL3.seatsOf?LL3.seatsOf(L).filter(s=>s.room&&/^disc/.test(s.room)):[];
const roomOf=id=>L.rooms.find(r=>r.id===id);
const inside=(c,r)=>c.x>r.x0-0.02&&c.x<r.x1+0.02&&c.z>-D/2&&c.z<FZ-0.1&&c.y<H-0.05;
/* 頭 → 鏡頭這一段在建築裡面的部分都要在同一間房間裡（不穿過隔間牆、前牆）；穿出北牆、西牆到建築外面可以——外牆會淡出（法圖本來的剖面視角，zone.fadeWalls）*/
const stays=(t,c,r)=>{ if(c.y>=H-0.05&&Math.abs(c.x)<L.W/2&&Math.abs(c.z)<D/2) return false; for(let i=1;i<=60;i++){ const k=i/60, x=t.x+(c.x-t.x)*k, zz=t.z+(c.z-t.z)*k; if(Math.abs(x)>=L.W/2-0.1||Math.abs(zz)>=D/2-0.1) continue; if(!(x>r.x0-0.02&&x<r.x1+0.02&&zz<FZ-0.1)) return false; } return true; };
const f2=v=>v.toArray().map(a=>a.toFixed(2)).join(', ');
{ const A=roomOf('discA'), t=new THREE.Vector3(-6.2,1.45,-6.8), yaw=Math.PI/2;   /* CC：鏡頭在 (−2.3, 3.21, −6.8)＝玩家正東 */
  const c=new THREE.Vector3(), o=new THREE.Vector3(); const r=camNow(t,yaw,c); camBefore(t,yaw,o); const d=t.distanceTo(c);
  check('② 修改前：討論室 A 西側的座位、鏡頭在東邊＝鏡頭在討論室 A 外面（測試抓得到；CC 量到 (−2.3, 3.21, −6.8)）', o.x>A.x1, `鏡頭 (${f2(o)})`);
  check('② 修改後：鏡頭在討論室 A 裡面、天花板下面、離頭 1.2 m 以上', inside(c,A)&&d>=1.2, `鏡頭 (${f2(c)})、離頭 ${d.toFixed(2)} m、inner ${r.inner}`); }
{ let n=0,bad=0,badOld=0,ex=null,exOld=null;
  for(const s of seats){ const R=roomOf(s.room), t=new THREE.Vector3(s.x,1.45,s.z);
    for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++; const c=new THREE.Vector3(), o=new THREE.Vector3(); camNow(t,yaw,c); camBefore(t,yaw,o);
      if(!stays(t,c,R)){ bad++; if(!ex) ex={seat:[s.x,s.z],yaw:+yaw.toFixed(2),cam:c.toArray().map(v=>+v.toFixed(2))}; }
      if(!stays(t,o,R)){ badOld++; if(!exOld) exOld={seat:[s.x,s.z],yaw:+yaw.toFixed(2),cam:o.toArray().map(v=>+v.toFixed(2))}; } } }
  check('③ 修改前：討論室的座位有鏡頭穿過隔間牆、前牆的（測試抓得到）', badOld>0, `${badOld}/${n}`+(exOld?' 例：'+JSON.stringify(exOld):''));
  check('③ 兩間討論室的 8 個座位 × 8 個方向：頭到鏡頭這一段不穿過隔間牆、前牆（穿出外牆可以：外牆會淡出）', seats.length===8&&bad===0, `座位 ${seats.length} 個、跑出去 ${bad}/${n}`+(ex?' 例：'+JSON.stringify(ex):'')); }
{ let n=0,diff=0,ex=null;
  for(let x=-L.W/2+0.6;x<=L.W/2-0.6;x+=0.6) for(let zz=FZ+1;zz<=D/2-0.6;zz+=0.6){ if(!E.canStand(x,zz,0.32,0)) continue; const t=new THREE.Vector3(x,1.45,zz);
    for(const yaw of [-Math.PI/2,-Math.PI/4,0,Math.PI/4,Math.PI/2]){ n++; const c=new THREE.Vector3(), o=new THREE.Vector3(); camNow(t,yaw,c); camBefore(t,yaw,o); if(c.distanceTo(o)>1e-6){ diff++; if(!ex) ex={x:+x.toFixed(2),z:+zz.toFixed(2),yaw:+yaw.toFixed(2)}; } } }
  check('④ 大廳（前牆以南 1 m 以外）鏡頭朝南、東、西時和修改前一模一樣', n>100&&diff===0, `不一樣 ${diff}/${n}`+(ex?' 例：'+JSON.stringify(ex):'')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
