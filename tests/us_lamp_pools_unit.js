// 美國戶外區域的路燈地面光圈（US-MS-NIGHT-1021，LAWWW2 2026-10-21）——不需要瀏覽器。
// 超市街 20:00 的遊戲內截圖：停車場燈桿、路燈只有燈頭亮，地上一片黑（溫州街、校園的路燈都有地面光圈）。
// 做法（src/us3d.js 的 outdoorZone）：區域定義的 lampPools(L) 給燈頭位置，鋪地面光圈，交給 E.lampGlows（和溫州街、校園同一套：入夜才開）。
// 檢查：在 Node 建出超市街、公寓社區、美國校園（10-24 加），數光圈、看位置（燈頭照 Blender 腳本：停車場燈桿每支兩個燈頭、桿子前後 1.1 m；眼鏡蛇頭路燈往馬路 2.75 m；社區路燈往 +z 0.9 m）、
// 白天藏著、E.setLamps(true) 才出現、引擎合併靜態網格（P3.mergeStatic）以後還在。
// 用法：node tests/us_lamp_pools_unit.js（要有超市街：patches/us_market_street.diff）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（光圈和備用模型用同一份配置）
let fails=0, tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
global.GAME={G:{hour:15,weather:'clear',flags:{},zone:'us_market_street'}};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; z.group.updateMatrixWorld(true); return z; }
const MSL=typeof US_MARKET_STREET_LAYOUT!=='undefined'?US_MARKET_STREET_LAYOUT:null;
check('有超市街（US_MARKET_STREET_LAYOUT、Z3.ZONES.us_market_street）',!!MSL&&!!Z3.ZONES.us_market_street);
const CASES=[];
if(MSL) CASES.push(['us_market_street',[].concat(...MSL.poles.map(p=>[[p.x,p.z-1.1],[p.x,p.z+1.1]]),MSL.props.filter(t=>t.type==='street_lamp').map(t=>[t.x+Math.sin(t.yaw)*2.75,t.z+Math.cos(t.yaw)*2.75]))]);
CASES.push(['us_outside',US_COMMUNITY_LAYOUT.props.filter(t=>t.type==='lamp').map(t=>[t.x,t.z+0.9])]);
// 美國校園（LAWWW2-B 美國路線巡查 10-24）：綠色高路燈、黑鐵燈柱的燈頭在柱子正上方；大門台階前的小廣場一圈（門兩側的壁燈）
{ const CL=US_CAMPUS_LAYOUT, F=CL.forecourt; CASES.push(['us_campus',CL.props.filter(t=>t.type==='lamp_green'||t.type==='lamp').map(t=>[t.x,t.z]).concat([[(F.x0+F.x1)/2,(F.z0+F.z1)/2]])]); }
for(const [id,heads] of CASES){ tag='['+id+'] '; const z=loadZone(id);
  const pools=E.lampGlows.filter(o=>o.name==='lamp_pool');
  check(`每個燈頭一圈光圈（${heads.length} 個燈頭）`,pools.length===heads.length,`${pools.length} 圈`);
  let worst=0; for(const [hx,hz] of heads){ let best=1e9; for(const p of pools){ const v=new THREE.Vector3(); p.getWorldPosition(v); best=Math.min(best,Math.hypot(v.x-hx,v.z-hz)); } worst=Math.max(worst,best); }
  check('光圈在燈頭正下方（每個燈頭最近的光圈 < 5 cm）',pools.length>0&&worst<0.05,`最遠 ${(worst*100).toFixed(1)} cm`);
  check('光圈平放在地上（y 0.02～0.1、朝上）',pools.length>0&&pools.every(p=>{ const v=new THREE.Vector3(); p.getWorldPosition(v); return v.y>0.02&&v.y<0.1&&Math.abs(p.rotation.x+Math.PI/2)<1e-6; }));
  check('白天藏著',pools.length>0&&pools.every(p=>!p.visible));
  E.setLamps(true); const on=pools.every(p=>p.visible); E.setLamps(false); const off=pools.every(p=>!p.visible);
  check('入夜（E.setLamps(true)）出現、天亮藏回去',pools.length>0&&on&&off);
  if(P3.mergeStatic){ P3.mergeStatic(z.group); const still=pools.every(p=>!!p.parent&&p.parent.name==='lamp_pools'); check('引擎合併靜態網格以後光圈還在（自己的 dyn 群組）',pools.length>0&&still); }
}
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
