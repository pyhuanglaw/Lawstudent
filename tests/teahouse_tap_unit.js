// 一盞茶屋：點下沉地板的落點（TEA-SUNKEN-TAP-1105，LAWWW2-C 11-05；BB-C TAPSCAN 06:4x 在 Node 掃到、LAWWW-C 插隊）——不需要瀏覽器（D131）。
// 點地移動是 E.screenToFloor（engine3d.js）：區域有 zone.walkMeshes 就打那幾片（看得到的），打不到才用玩家那一層的地板高度（y0）那個平面。
// 一盞的前院 −0.42、玄關前的石板土間 −0.24、玄關 −0.12、緣側前的沓脫石是斜的；v9.10.20 沒有可點面，點前院會落到點的位置後面（退回 y 0 平面）。
// 這裡照 E.screenToFloor 的算法，從跟隨鏡頭（室內 dist 4.0、pitch 0.38）四個方向，對每一個站得住的點（每 0.2 m）打：
//   ① 有可點面、都是第 0 層、看得到（父節點都 visible）
//   ② 前院、土間、玄關、沓脫石（高度不是 0 的地方）：落點水平差 ≤ 0.3 m、高度差 ≤ 0.05 m（被地板的邊擋住、畫面上看不到的點不算；射線離地板不到 5 cm 的另外列出最大偏差，不擋）
//   ③ 室內（高度 0）也照舊：落點水平差 ≤ 0.3 m（從屋裡朝前院點室內地板，不能穿過去打到前院那一片）
//   ④ 可點面的高度＝導航格的高度（nav.heightAt；離高度交界 0.25 m 以外的點）
// 修改前（開發分支 d64b75c20，zones3d.js teaYard 沒有 walkMeshes）：① ② ④ FAIL。用法：node tests/teahouse_tap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
global.GAME={G:{zone:'wz_teahouse',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
const z=Z3.ZONES.wz_teahouse.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.nav._cm=null; const N=E.nav;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
z.group.updateMatrixWorld(true);
const wm=z.walkMeshes||[], vis=wm.filter(m=>{ for(let o=m;o;o=o.parent){ if(!o.visible) return false; } return true; });
check('① 一盞有可以點的地面（zone.walkMeshes）、都是第 0 層、看得到', wm.length>0&&vis.length===wm.length&&wm.every(m=>(m.userData.walkLv|0)===0), `${wm.length} 片`);
/* E.screenToFloor 的算法：先打看得到的 walkMeshes，打不到就用玩家那一層的 y0 平面 */
function tapAt(cam,tgt){ const ray=new THREE.Raycaster(cam.clone(),tgt.clone().sub(cam).normalize()); ray.near=0; ray.far=Infinity;
  if(vis.length){ const hits=ray.intersectObjects(vis,false); if(hits.length) return hits[0].point; }
  const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-(N.y0||0)), hit=new THREE.Vector3(); return ray.ray.intersectPlane(pl,hit)?hit:null; }
const DIST=4.0, PITCH=0.38, LOOKY=1.2;   /* 室內的跟隨鏡頭（engine3d.js：distTarget＝camDist 4.0、pitch 0.38；看玩家胸口附近）*/
const pts=[]; for(let x=-4.55;x<=4.6;x+=0.2) for(let zz=-4.95;zz<=9.8;zz+=0.2){ if(E.canStand(x,zz,0.32,0)) pts.push([r2(x),r2(zz)]); }
/* 看不到的點不算：射線在到達目標前就被地板的高度擋住（例：從屋裡往南看，緣側邊緣下 0.42 m 的前院那一條，被緣側的邊擋住；遊戲畫面上也點不到）*/
/* 貼地的不算在 ② 的合格線裡、另外列出來：射線離地板不到 5 cm（例：站在緣側往南、順著沓脫石往下點，射線幾乎和石階一樣斜），落點會停在前面一點 */
const clear=(cam,t)=>{ let c=9; for(let k=1;k<120;k++){ const f=k/120, x=cam.x+(t.x-cam.x)*f, y=cam.y+(t.y-cam.y)*f, zz=cam.z+(t.z-cam.z)*f; if(Math.hypot(x-t.x,zz-t.z)<0.12) break; c=Math.min(c,y-N.heightAt(x,zz)); } return c; };
const hidden=(cam,t)=>clear(cam,t)<-0.005;
const lowBad=[], flatBad=[]; let nLow=0, nFlat=0, worst=0, nHid=0, nGraze=0, grazeMax=0;
for(const [x,zz] of pts){ const y=N.heightAt(x,zz), low=Math.abs(y)>0.005; if(low) nLow++; else nFlat++;
  for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){
    /* 玩家站在離點 2.5 m 的地方（朝點走過去之前），鏡頭在玩家身後 DIST、抬高 pitch */
    const px=x-2.5*Math.sin(yaw), pz=zz-2.5*Math.cos(yaw), py=N.heightAt(px,pz);
    const cam=new THREE.Vector3(px-DIST*Math.cos(PITCH)*Math.sin(yaw), py+LOOKY+DIST*Math.sin(PITCH), pz-DIST*Math.cos(PITCH)*Math.cos(yaw));
    const t=new THREE.Vector3(x,y,zz); const cl=clear(cam,t); if(cl<-0.005){ nHid++; continue; } const h=tapAt(cam,t), d=h?Math.hypot(h.x-x,h.z-zz):99, dy=h?Math.abs(h.y-0.01-y):99;
    if(low&&cl<0.05){ nGraze++; grazeMax=Math.max(grazeMax,d); continue; } if(low){ worst=Math.max(worst,d); if(!(d<=0.3&&dy<=0.05)) lowBad.push([d,`(${x},${zz}) yaw${r2(yaw)} 偏 ${r2(d)} dy ${r2(dy)}`]); } else if(!(d<=0.3)) flatBad.push(`(${x},${zz}) 偏 ${r2(d)}`); } }
check('② 前院、土間、玄關、沓脫石：落點水平差 ≤ 0.3 m、高度差 ≤ 0.05 m', nLow>100&&!lowBad.length, `${nLow} 點×4 方向（被地板邊擋住、看不到的 ${nHid} 次不算；射線貼地 5 cm 以內的 ${nGraze} 次另計，最大偏 ${r2(grazeMax)} m），不合格 ${lowBad.length}，最大 ${r2(worst)} m；`+lowBad.sort((a,b)=>b[0]-a[0]).slice(0,12).map(a=>a[1]).join('、'));
check('③ 室內（高度 0）照舊：落點水平差 ≤ 0.3 m', nFlat>100&&!flatBad.length, `${nFlat} 點×4 方向，不合格 ${flatBad.length}；`+flatBad.slice(0,4).join('、'));
{ const down=(x,zz)=>{ const r=new THREE.Raycaster(new THREE.Vector3(x,5,zz),new THREE.Vector3(0,-1,0)); const h=r.intersectObjects(vis,false); return h.length?h[0].point.y-0.01:null; };
  const near=(x,zz)=>{ const y=N.heightAt(x,zz); for(const [dx,dz] of [[0.25,0],[-0.25,0],[0,0.25],[0,-0.25]]) if(Math.abs(N.heightAt(x+dx,zz+dz)-y)>0.005) return true; return false; };
  const sl=pts.filter(([x,zz])=>!near(x,zz)), bad=sl.filter(([x,zz])=>{ const y=down(x,zz); return y==null||Math.abs(y-N.heightAt(x,zz))>0.02; });
  const sample=[[-3.0,9.0],[-3.2,5.6],[-3.3,4.4],[1.0,6.2],[0,0]].map(([x,zz])=>`(${x},${zz}) ${down(x,zz)==null?'—':r2(down(x,zz))}／${r2(N.heightAt(x,zz))}`);
  check('④ 可點面的高度＝導航格的高度（離高度交界 0.25 m 以外）', !bad.length, `${sl.length} 點，不合格 ${bad.length}；`+sample.join('；')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
