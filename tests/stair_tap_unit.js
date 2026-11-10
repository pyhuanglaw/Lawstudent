// 兩層樓的店：點樓梯的落點（TEA-SUNKEN-TAP-1105 順手掃，LAWWW2-C 11-05；BB-C TAPSCAN 06:4x 列了這幾區）——不需要瀏覽器（D131）。
// 山嵐書店、大口漢堡、新生運動廣場、木曜日的樓梯都有一片看不到的可點面（zone.walkMeshes，點在樓梯上＝走到那裡）。
// 那一片的斜度寫反了（rotation.x 用 atan2(ya−yb, z1−z0)；addSurf 的 ya 在 z0、yb 在 z1，該是 yb−ya）：只有中間那一階對，越往兩端偏越多，
// 點樓梯下段會落到二樓高度的空中那一點、點上段會落到一樓地板下面（實際落點的水平位置也跟著錯）。
//   ① 每一區有樓梯的可點面、第 0 層
//   ② 樓梯上每一格（站得住、高度和那一層 y0 差 0.15 m 以上，兩層都掃）從正上方往下打：打得到、高度和導航格差 ≤ 0.12 m
//   ③ 從一樓樓梯口前 3 m 的跟隨鏡頭點樓梯中段、上段（照 E.screenToFloor：先打可點面，打不到用 y0 平面）：落點水平差 ≤ 0.4 m
// 修改前（開發分支 d64b75c20）：四區的 ② ③ FAIL。用法：node tests/stair_tap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/places.js',
  'src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/shanlan_layout.js','src/shanlan3d.js','src/data/dakou_layout.js','src/dakou3d.js','src/data/xinsheng_sports_layout.js','src/xsports3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))){ console.log('（沒有 '+f+'）'); continue; } let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; global.GAME={G:{day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}};
for(const id of ['xs_shanlan','xs_dakou','xs_xsports','wz_mokuyobi']){ if(!Z3.ZONES[id]){ check(id+' 區域存在',false); continue; }
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.group.updateMatrixWorld(true);
  const wm=(z.walkMeshes||[]).filter(m=>m.userData.stairEnds), N=z.levels||[z.nav];
  check(`① ${id} 有樓梯的可點面、第 0 層`, wm.length===1&&(wm[0].userData.walkLv|0)===0, `${wm.length} 片`);
  if(!wm.length) continue;
  let tot=0; const bad=[];
  N.forEach((n,k)=>{ for(let cz=0;cz<n.rows;cz++) for(let cx=0;cx<n.cols;cx++){ const [x,zz]=n.toWorld(cx,cz); if(!n.clear(x,zz,0.3)) continue; const y=n.heightAt(x,zz); if(Math.abs(y-n.y0)<=0.15) continue; tot++;
      const h=new THREE.Raycaster(new THREE.Vector3(x,y+3,zz),new THREE.Vector3(0,-1,0)).intersectObjects(wm,false); const hy=h.length?h[0].point.y-0.01:null; if(hy==null||Math.abs(hy-y)>0.12) bad.push(`第${k}層 (${r2(x)},${r2(zz)}) ${hy==null?'打不到':r2(hy)}／${r2(y)}`); } });
  check(`② ${id} 樓梯每一格從上往下打：高度和導航格差 ≤ 0.12 m`, tot>20&&!bad.length, `${tot} 格，不合格 ${bad.length}；`+bad.slice(0,3).join('、'));
  /* ③ 樓梯口前面的跟隨鏡頭：樓梯是往 −z 爬（z1 是一樓那一頭）還是往 +z，照高的那一頭定 */
  const n0=N[0], m=wm[0], bb=new THREE.Box3().setFromObject(m), x=(bb.min.x+bb.max.x)/2, zA=bb.min.z, zB=bb.max.z, yA=n0.heightAt(x,zA+0.05), yB=n0.heightAt(x,zB-0.05), lowZ=yA<yB?zA:zB, dir=yA<yB?1:-1;   /* dir：往高的那一頭是 +z 還是 −z */
  const cam=new THREE.Vector3(x,1.2+4.0*Math.sin(0.38),lowZ-dir*(3.0+4.0*Math.cos(0.38))), rows=[], bad3=[];
  for(const f of [0.25,0.5,0.75]){ const tz=lowZ+dir*f*(zB-zA), ty=n0.heightAt(x,tz), t=new THREE.Vector3(x,ty,tz), ray=new THREE.Raycaster(cam.clone(),t.clone().sub(cam).normalize());
    const h=ray.intersectObjects(wm,false); let p=h.length?h[0].point:null; if(!p){ const hit=new THREE.Vector3(); p=ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-n0.y0),hit)?hit:null; }
    const d=p?Math.hypot(p.x-x,p.z-tz):99; rows.push(`${Math.round(f*100)}%：差 ${r2(d)}`); if(d>0.4) bad3.push(f); }
  check(`③ ${id} 從一樓樓梯口前點樓梯 25／50／75%：落點水平差 ≤ 0.4 m`, !bad3.length, rows.join('；')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
