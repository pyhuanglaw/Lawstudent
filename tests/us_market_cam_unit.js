// 美國的兩間超市：一進門鏡頭不會在店外隔著黑色門框往裡看（US-PATROL-1021）——不需要瀏覽器。
// LAWWW2 10-22 巡場景（佇列 j14，開發分支 c617b2e0）看到的：
//   草原超市 us_market：入口 IN 門內 (13.5, 13.6)、面向北，鏡頭在南（camDist 5 m），退到正面玻璃（z 16）外面 2.6 m，
//     隔著門框、門楣往裡看——畫面上橫著兩條黑帶、人只剩腳。
//   竹葉亞洲超市 us_asian_market：鏡頭可以退到牆外 1.5 m（四面牆各自淡出），但正面的玻璃框、門合併在 usam_black 裡、不是 WALL_ 節點，牆淡出了框還在。
// 做法：
//   草原超市：src/us3d.js 的 usmCamCols——四面外牆當跟隨鏡頭的牆（zone.camCols，和公寓、教學館、機場同一套）。
//   亞洲超市：tools/blender/env_second/us_asian_market.py 把正面的玻璃、框、門改成 WALL_S_glass／WALL_S_mullions／WALL_S_door（props dir 同南牆），
//     Z3.attachRoomGLB 讓它們和南牆一起淡出（玻璃、玻璃門半透明：當窗的零件，牆淡出時一起藏）。
// 這裡在 Node 建出遊戲真正的草原超市，每 1 m 一點（人站得住）、8 個方向，照引擎的跟隨鏡頭（camDist 5.0、俯角 0.38）算鏡頭位置，
// 看「頭 → 鏡頭」有沒有穿過外牆：牆照配置的範圍自己算（不是拿 camCols 來量）。同一個測試也用修改前的公式（沒有牆的碰撞）跑一次：
// 一定要量得到被擋住的方向（證明這個測試抓得到這個 bug）。亞洲超市讀 GLB 的節點名字和 dir。
// 用法：node tests/us_market_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入：鏡頭的牆和導航不靠模型 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:15,weather:'clear',flags:{},zone:'us_market'}};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true); return z; }
function crossT(ax,az,bx,bz,s){ const [cx,cz,dx,dz]=s; const r=[bx-ax,bz-az], q=[dx-cx,dz-cz]; const den=r[0]*q[1]-r[1]*q[0]; if(Math.abs(den)<1e-9) return -1;
  const t=((cx-ax)*q[1]-(cz-az)*q[0])/den, u=((cx-ax)*r[1]-(cz-az)*r[0])/den; return (t>0&&t<1&&u>=0&&u<=1)?t:-1; }
function blocked(head,cam,walls){ for(const s of walls) if(crossT(head.x,head.z,cam.x,cam.z,s)>=0) return s; return null; }
const oldCam=(tgt,yaw,pitch,dist)=>new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(pitch),Math.sin(pitch)*dist+0.2,Math.cos(yaw)*dist*Math.cos(pitch)).add(tgt);
check('引擎有 E.followCam、Z3.ZONES.us_market',typeof E.followCam==='function'&&!!Z3.ZONES.us_market);
const PITCH=0.38, PI=Math.PI;
{ const z=loadZone('us_market'), L=US_MARKET_LAYOUT, Bd=L.bounds, dist=Z3.ZONES.us_market.camDist||3.8, H=L.h||6.4;
  const walls=[[Bd.x0,Bd.z0,Bd.x1,Bd.z0],[Bd.x0,Bd.z1,Bd.x1,Bd.z1],[Bd.x0,Bd.z0,Bd.x0,Bd.z1],[Bd.x1,Bd.z0,Bd.x1,Bd.z1]];   /* 四面外牆（正面 z1＝玻璃，門洞也算：鏡頭不必出去）*/
  check('配置：正面玻璃就在範圍的 z1（z '+L.storefront.z+'）',Math.abs(L.storefront.z-Bd.z1)<1e-6);
  check('鏡頭碰撞用的牆（zone.camCols[0]）四面',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length===4,z.camCols&&z.camCols[0]?z.camCols[0].length+' 塊':'沒有');
  let n=0, bad=0, badOld=0, ex=null, hiCam=0;
  for(let x=Bd.x0+0.5;x<=Bd.x1-0.5;x+=1.0) for(let zz=Bd.z0+0.5;zz<=Bd.z1-0.5;zz+=1.0){ if(!E.canStand(x,zz,0.32,0)) continue; const tgt=new THREE.Vector3(x,1.45,zz);
    for(let k=0;k<8;k++){ const yaw=k*PI/4; n++; if(blocked(tgt,oldCam(tgt,yaw,PITCH,dist),walls)) badOld++;
      const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,dist,0,cam); hiCam=Math.max(hiCam,cam.y); if(blocked(tgt,cam,walls)){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:+yaw.toFixed(2),cam:cam.toArray().map(v=>+v.toFixed(2))}; } } }
  check('修改前的公式量得到被擋住的方向（測試抓得到這個 bug）',badOld>0,`${(100*badOld/Math.max(1,n)).toFixed(1)}%（${badOld}/${n}）`);
  check('跟隨鏡頭不會退到外牆外面',bad===0,`${(100*bad/Math.max(1,n)).toFixed(1)}%（${bad}/${n}）`+(ex?' 例：'+JSON.stringify(ex):''));
  check('拉近、抬高以後鏡頭還在天花板下面（'+H+' m）',hiCam<H-0.3,'最高 '+hiCam.toFixed(2)+' m');
  /* 巡場景的那一張：入口 IN 門內、面向北、鏡頭在南 */
  const sp=L.spawn, tgt=new THREE.Vector3(sp.x,1.45,sp.z), camYaw=sp.yaw+PI, cam=new THREE.Vector3(); const was=!!blocked(tgt,oldCam(tgt,camYaw,PITCH,dist),walls); const r=E.followCam(tgt,camYaw,PITCH,dist,0,cam);
  check(`一進門 (${sp.x}, ${sp.z})・鏡頭在南：修改前在正面玻璃外面、修改後在店裡`,was&&!blocked(tgt,cam,walls)&&cam.z<Bd.z1,`修改前${was?'在店外':'在店裡'}；鏡頭離頭 ${r.dist.toFixed(2)} m、z ${cam.z.toFixed(2)}、高 ${cam.y.toFixed(2)} m`);
  /* 出口 OUT 門內也一樣 */
  const X=L.exit, t2=new THREE.Vector3(X.x,1.45,X.z-1.2), c2=new THREE.Vector3(); E.followCam(t2,0,PITCH,dist,0,c2);
  check(`出口 (${X.x}, ${(X.z-1.2).toFixed(1)})・鏡頭在南：在店裡`,!blocked(t2,c2,walls)&&c2.z<Bd.z1,`z ${c2.z.toFixed(2)}`); }
/* 亞洲超市：正面的玻璃、框、門是南面牆的節點（WALL_S_*，extras.dir 同南牆 [0,0,-1]）、不合併進別的網格 */
{ const p=path.join(ROOT,'assets/models/env/second_ai/us_asian_market.glb'), b=fs.readFileSync(p), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
  const nodes={}; for(const nd of j.nodes) if(nd.name) nodes[nd.name]=nd;
  const want=['WALL_S_glass','WALL_S_mullions','WALL_S_door','WALL_S_wall'], dirOk=nm=>nodes[nm]&&nodes[nm].extras&&JSON.stringify(nodes[nm].extras.dir)===JSON.stringify([0,0,-1]);
  check('亞洲超市 GLB：正面的玻璃、框、門是南面牆的節點，dir 和南牆一樣',want.every(dirOk),want.map(nm=>nm+(dirOk(nm)?' ✓':' ✗')).join('、'));
  check('亞洲超市 GLB：舊的名字（usam_storefront_glass、DOOR_usam）不在了',!nodes.usam_storefront_glass&&!nodes.DOOR_usam); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
