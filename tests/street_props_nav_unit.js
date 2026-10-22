// 街景正式模型（溫州街、公館、118 巷）門口的雜物，人貼牆走會不會穿過去（ART-WZ0，LAWWW2 2026-10-21）——不需要瀏覽器。
// tools/blender/env_second/wz_street.py 建模時把地上雜物的腳印寫進 <模型>.props.json（世界座標 [minx,minz,maxx,maxz]、高度）。
// 這裡在 Node 建出遊戲的區域，用引擎的做法取樣「人站得到的地方」（canStand：半徑 0.3 m 的圓碰不到擋住的格子），
// 看人的身體和雜物最多重疊多少；超過 2 cm 算穿模（門口凸出牆面的盆栽、紙箱，牆外就是人走的地方）。
// 修法：zones3d.js 的 WZ_PROP_BLOCKS／GG_PROP_BLOCKS（模型接上時才擋；blockRect 加 pad 半格），或在 Blender 把東西移進門廊（建築的導航阻擋範圍內）。
// 也檢查：阻擋是模型接上以後才加的（套件備用模型沒有這些雜物；先擋會變成看不見的牆）。
// 用法：node tests/street_props_nav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
// 街景正式模型：當作已經載好（空的場景），讓區域的接法跑完（雜物的導航阻擋是模型接上時才加的）；其他模型不載
const STREET_GLB={wenzhou:'bldg.wenzhou_street',gongguan:'bldg.gongguan_shops',lane118:'bldg.lane118_street'};
if(typeof ASSETS!=='undefined') ASSETS.loadOne=k=>Object.values(STREET_GLB).includes(k)?Promise.resolve({scene:new THREE.Group()}):new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const SETS=[['wenzhou','wenzhou_street'],['gongguan','gongguan_shops'],['lane118','lane118_street']];
let tested=0;
(async()=>{
for(const [zid,glb] of SETS){ const f=path.join(ROOT,'assets/models/env/second_ai',glb+'.props.json'); if(!fs.existsSync(f)) continue;
  const props=JSON.parse(fs.readFileSync(f,'utf8')).props||[]; if(!props.length){ console.log(`（${glb}：沒有地上的雜物）`); continue; } tested++;
  global.GAME={G:{hour:15,weather:'clear',flags:{},zone:zid}}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES[zid].build(E), nav=z.nav||E.nav; E.zone=z; z.def=Z3.ZONES[zid];
  // 模型的 .then 要等 E.zone 是這個區域（區域接法裡的 E.zone!==zone 檢查）；套件階段先記下可走的格數，接上以後再比
  const free0=nav.b.reduce((n,v)=>n+(v?0:1),0); await new Promise(r=>setTimeout(r,0)); const free1=nav.b.reduce((n,v)=>n+(v?0:1),0);
  const blocked=(x,zz)=>{ const [cx,cz]=nav.toCell(x,zz); return cx<0||cz<0||cx>=nav.cols||cz>=nav.rows||!!nav.b[cz*nav.cols+cx]; };
  const R=0.3, canStand=(x,zz)=>{ if(blocked(x,zz)) return false; for(let a=0;a<16;a++){ const t=a/16*Math.PI*2; if(blocked(x+Math.cos(t)*R,zz+Math.sin(t)*R)) return false; } return true; };
  const bad=[];
  for(const p of props){ const r=p.rect; let worst=0, at=null;
    for(let x=r[0]-0.5;x<=r[2]+0.5;x+=0.05) for(let zz=r[1]-0.5;zz<=r[3]+0.5;zz+=0.05){ if(!canStand(x,zz)) continue; const dx=Math.max(r[0]-x,0,x-r[2]), dz=Math.max(r[1]-zz,0,zz-r[3]); const ov=R-Math.hypot(dx,dz); if(ov>worst){ worst=ov; at=[+x.toFixed(2),+zz.toFixed(2)]; } }
    if(worst>0.02) bad.push(`${p.tag} 在 (${((r[0]+r[2])/2).toFixed(1)}, ${((r[1]+r[3])/2).toFixed(1)})：人站在 ${JSON.stringify(at)} 身體重疊 ${(worst*100).toFixed(0)} cm`); }
  check(`${zid}：${props.length} 個地上雜物，人貼牆走不會穿過去（重疊 ≤ 2 cm）`,!bad.length,bad.join('；'));
  check(`${zid}：雜物的阻擋是模型接上以後才加（套件備用模型沒有這些雜物，不能先擋）`,free1<free0,`可走的格子 ${free0} → ${free1}`); }
check('至少檢查了一份街景模型的雜物',tested>0);
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})();
