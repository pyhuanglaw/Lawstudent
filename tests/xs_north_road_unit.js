/* 新生南路往北那一段（校園北牆外，路口 x XSG.xh 往北）做成像樣的路（XS-NORTH-ROAD-1107，LAWWW2-B 2026-11-07；XS-GATE-NORTH-1105 先將就第 6 點：
   「往北那一段只是把對面的房子空出來。路面就是城市底色的柏油，沒有車道線、分隔島、行道樹」）
   ① 路的範圍（x XSG.xh ± 10.5、z −171～−258）從上往下打射線：沒有打到 12 m 以上的東西（房子不壓到車道、人行道）
   ② 兩側（x XSG.xh ± 19、z −216～−256）打得到房子（≥ 12 m 高的佔八成以上）：路不是直直通到空地
   ③ 路面：x XSG.xh、z −200 往下打，打到的是 xs_north_branch_road（不是城市底色的柏油）；有分隔島、車道線、兩側人行道
   ④ 路口北邊那一條斑馬線 16 m 寬（和車道一樣）
   修改前（開發 fa05ed8c5）：① ② ③ ④ FAIL。用法：node tests/xs_north_road_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 校園的正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=eval(T.match(/const files=(\[[^\]]+\])/)[1]);
for(const f of ['src/townkit3d.js','src/campuskit3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const warn=console.warn; console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
(async()=>{
  E.interactables=[]; E.colliders=[]; const cz=Z3.ZONES.campus.build(E); E.zone=cz; E.scene.add(cz.group); cz.group.updateMatrixWorld(true);
  const X=Z3.XSG.xh, far=cz.group.getObjectByName('campusBackdrop'), rc=new THREE.Raycaster(), down=new THREE.Vector3(0,-1,0);
  const meshes=[]; (far||cz.group).traverse(o=>{ if((o.isMesh||o.isInstancedMesh)&&o.visible!==false) meshes.push(o); });
  const top=(x,z)=>{ rc.set(new THREE.Vector3(x,80,z),down); rc.far=120; const h=rc.intersectObjects(meshes,false); return h.length?h[0]:null; };
  let tall=[], n=0; for(const dx of [-10.5,-6.5,6.5,10.5]) for(let z=-171;z>=-258;z-=4){ n++; const h=top(X+dx,z); if(h&&h.point.y>12) tall.push([dx,z,+h.point.y.toFixed(1)]); }
  check('① 路的範圍（± 10.5 m）沒有房子',tall.length===0,'打了 '+n+' 點，12 m 以上 '+tall.length+(tall.length?'（例：'+JSON.stringify(tall.slice(0,3))+'）':''));
  let side=0, sn=0; for(const dx of [-19,19]) for(let z=-216;z>=-256;z-=4){ sn++; const h=top(X+dx,z); if(h&&h.point.y>12) side++; }
  check('② 兩側有面向這條路的房子（≥ 12 m 佔八成以上）',side>=sn*0.8,side+'／'+sn);
  const h0=top(X+3,-200), road=far&&far.getObjectByName('xs_north_branch_road'), med=far&&far.getObjectByName('xs_north_branch_median'), lines=far&&far.getObjectByName('xs_north_branch_lines'); let walks=0; if(far) far.traverse(o=>{ if(o.name==='xs_north_branch_walk') walks++; });
  check('③ 往北那一段有路面（不是城市底色）、分隔島、車道線、兩側人行道',!!road&&!!h0&&h0.object===road&&!!med&&!!lines&&walks===2,'打到 '+(h0?(h0.object.name||'(沒有名字)')+' y '+h0.point.y.toFixed(3):'沒有')+'｜分隔島 '+!!med+' 車道線 '+!!lines+' 人行道 '+walks);
  const zb=far&&far.getObjectByName('zebra_xs_branch'); let zw=0; if(zb){ const b=new THREE.Box3().setFromObject(zb); zw=b.max.x-b.min.x; }
  check('④ 路口北邊的斑馬線 16 m 寬',Math.abs(zw-16)<0.6,'寬 '+zw.toFixed(1)+' m');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
