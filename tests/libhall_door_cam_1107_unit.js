// 總圖大廳一進門，鏡頭卡在玻璃門框後（CAM-LIBHALL-DOOR-1107，LAWWW-B 11-07 16:13 派工，LAWWW2-B 修）——不需要瀏覽器（D131）。
// 原因：從校園進大廳，出生點在門廳 (0, 6.6)、面向北，鏡頭在背後往南退 4.8 m（俯角 0.38）→ 停在 z 約 11，在正面玻璃帷幕（z 8.9～9.0）外面；
//   帷幕的直櫺、橫櫺、玻璃、自動門五金和整棟的框合成同一個網格（正式模型 L0_frame／L0_glass／L0_vcm），不跟著南牆淡出（只有兩側實牆 WALL_S0E／S0W 會），
//   所以一進門畫面就是隔著門框看人。門廳裡往門口走、回頭看門口也一樣。
// 做法（src/library_hall_v2.js 的 camCols）：門廳寬（x ±5.2）、到屋頂高的一塊看不見的板子 CAMCOL_facade，放在帷幕的位置，交給 engine3d.js 的 followCam 當隔間牆：
//   鏡頭停在玻璃內側（拉近時抬高、autoSwing 照舊），和台階書牆、柱子同一套。
// 檢查（在 Node 建出遊戲真正的總圖大廳，照引擎的跟隨鏡頭算鏡頭位置）：
//   ① camCols 兩層都有 CAMCOL_facade：看不見、不參加合併、涵蓋門廳的寬度、在帷幕的位置
//   ② 一進門（出生點、鏡頭在背後）：鏡頭在玻璃內側（z < 8.85），離頭至少 1.5 m（不是頭頂特寫），高度在 4 m 以下
//      「修改前」＝同一個引擎、把 CAMCOL_facade 拿掉：鏡頭在帷幕外面（證明測試抓得到）
//   ③ 門廳裡每一個站得住的地方、鏡頭朝南的三個方向（正南、±45°）：鏡頭都在玻璃內側；修改前有在外面的
//   ④ 門廳以外（大廳裡面 z < 4）鏡頭和修改前一模一樣（板子只影響門口）
// 用法：node tests/libhall_door_cam_1107_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
{ const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ if(k==='bldg.library_interior'||k==='bldg.library_hall_v2') return Promise.reject(new Error('node')); return lo.apply(this,arguments); }; }
const L=LIBRARY_LAYOUT;
if(L.version!==2){ check('總圖大廳是第二版（LIB-INTERIOR-1102）', false, 'version '+L.version); console.log('FAILED '+fails); process.exit(1); }
const z=Z3.ZONES.library_hall.build(E); E.zone=z; E.levels=z.levels; E.nav=z.nav; for(const n of E.levels) n._cm=null;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true);
const V=L.vestibule, B=L.bounds, SP=L.entrance.spawn, DIST=Z3.ZONES.library_hall.camDist||4.8, PITCH=0.38, GLASS=B.z1-0.1;   /* 帷幕內側：正式模型的框 z 8.90～9.02 */
const cols0=(z.camCols||[])[0]||[], cols1=(z.camCols||[])[1]||[];
const F0=cols0.find(m=>m.name==='CAMCOL_facade'), F1=cols1.find(m=>m.name==='CAMCOL_facade');
{ const b=new THREE.Box3().setFromObject(F0||new THREE.Object3D());
  check('① camCols 第 0、1 層都有正面玻璃帷幕的板子：看不見、不參加合併、涵蓋門廳寬度（x ±5.2）、在帷幕的位置（z 8.9～9.0）、到屋頂',
    !!F0&&!!F1&&F0.material.visible===false&&F0.userData.noMerge&&b.min.x<=V.x0+0.01&&b.max.x>=V.x1-0.01&&b.min.z>=B.z1-0.15&&b.max.z<=B.z1+0.05&&b.min.y<=0.01&&b.max.y>=L.roofY-0.01,
    F0?`x ${b.min.x.toFixed(2)}～${b.max.x.toFixed(2)}、z ${b.min.z.toFixed(2)}～${b.max.z.toFixed(2)}、y ${b.min.y.toFixed(2)}～${b.max.y.toFixed(2)}`:'沒有（第 0 層：'+cols0.map(m=>m.name).join('+')+'）'); }
const keep=z.camCols;
const camNow=(t,yaw,lv,out)=>{ z._lcAll=null; return E.followCam(t,yaw,PITCH,DIST,lv,out); };
const camBefore=(t,yaw,lv,out)=>{ z.camCols=keep.map(a=>{ const r=a.filter(m=>m.name!=='CAMCOL_facade'); r.thin=r.slice(); return r; }); z._lcAll=null; const r=E.followCam(t,yaw,PITCH,DIST,lv,out); z.camCols=keep; z._lcAll=null; return r; };
{ E.player.lv=SP.lv|0; const fy=E.heightAt(SP.x,SP.z,SP.lv|0), t=new THREE.Vector3(SP.x,fy+1.45,SP.z), yaw=(SP.yaw||0)+Math.PI;   /* 進區域時鏡頭在人背後：E.enterZone 的 cam.yaw＝spawn.yaw＋π */
  const c=new THREE.Vector3(), o=new THREE.Vector3(); const r=camNow(t,yaw,SP.lv|0,c); camBefore(t,yaw,SP.lv|0,o);
  const d=t.distanceTo(c);
  check('② 修改前：一進門鏡頭在玻璃帷幕外面（測試抓得到）', o.z>B.z1, `鏡頭 (${o.toArray().map(v=>v.toFixed(2)).join(', ')})`);
  check('② 一進門（出生點、鏡頭在背後）：鏡頭在玻璃內側、離頭 1.5 m 以上、高度 4 m 以下', c.z<GLASS-0.05&&d>=1.5&&c.y<4,
    `鏡頭 (${c.toArray().map(v=>v.toFixed(2)).join(', ')})、離頭 ${d.toFixed(2)} m、inner ${r.inner}`); }
{ let n=0,bad=0,badOld=0,ex=null; E.player.lv=0;
  for(let x=V.x0+0.4;x<=V.x1-0.4;x+=0.4) for(let zz=V.z0+0.2;zz<=V.z1-0.3;zz+=0.3){ if(!E.canStand(x,zz,0.32,0)) continue; const fy=E.heightAt(x,zz,0); if(fy>0.05) continue;
    const t=new THREE.Vector3(x,fy+1.45,zz);
    for(const off of [-Math.PI/4,0,Math.PI/4]){ const yaw=off; n++; const c=new THREE.Vector3(), o=new THREE.Vector3(); camNow(t,yaw,0,c); camBefore(t,yaw,0,o);
      if(c.z>=GLASS-0.05&&Math.abs(c.x)<V.x1){ bad++; if(!ex) ex={x:+x.toFixed(2),z:+zz.toFixed(2),yaw:+yaw.toFixed(2),cam:c.toArray().map(v=>+v.toFixed(2))}; }
      if(o.z>=GLASS-0.05&&Math.abs(o.x)<V.x1) badOld++; } }
  check('③ 修改前：門廳裡鏡頭朝南時有在帷幕外面的（測試抓得到）', badOld>0, `${badOld}/${n}`);
  check('③ 門廳裡每一個站得住的地方、鏡頭朝南（正南、±45°）：鏡頭都在玻璃內側', n>20&&bad===0, `${bad}/${n}`+(ex?' 例：'+JSON.stringify(ex):'')); }
{ let n=0,diff=0,ex=null; const NB=L.navBox;
  for(const lv of [0,1]){ E.player.lv=lv;
    for(let x=NB.x0+0.5;x<=NB.x1-0.5;x+=0.7) for(let zz=NB.z0+0.3;zz<=Math.min(NB.z1-0.3,4);zz+=0.7){ if(!E.canStand(x,zz,0.32,lv)) continue; const fy=E.heightAt(x,zz,lv); const t=new THREE.Vector3(x,fy+1.45,zz);
      for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++; const c=new THREE.Vector3(), o=new THREE.Vector3(); camNow(t,yaw,lv,c); camBefore(t,yaw,lv,o); if(c.distanceTo(o)>1e-6){ diff++; if(!ex) ex={lv,x:+x.toFixed(2),z:+zz.toFixed(2),yaw:+yaw.toFixed(2)}; } } } }
  check('④ 門廳以外（z < 4，兩層）鏡頭和修改前一模一樣', n>200&&diff===0, `不一樣 ${diff}/${n}`+(ex?' 例：'+JSON.stringify(ex):'')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
