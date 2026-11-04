/* 換區的出生點不能落在那一區任何「出口」的互動半徑內（LAWWW 11-04 00:43 P2，D108；LAWWW2 11-04）。
   原本新生南路、木曜日有好幾個出生點離「回頭」的出口只有 0.15～1.6 m：玩家一出現，畫面上就是往回走的按鈕（例：一進木曜日就出「離開木曜日」）。
   萬才館的做法：出生點離互動點約 2.2 m（站在範圍外面，往前走一步才會碰到別的東西）。
   做法：在 Node 建出遊戲真正的區域（溫州街、新生南路、木曜日、校園），蒐集每個區域的出口（interactables 的 exit），
   每個「進到 A 區」的出口的 spawn，量它到 A 區每個出口互動點的水平距離（同一層），要大於那個出口的半徑＋0.2 m；出生點也要站得住（半徑 0.3）。
   用法：node tests/spawn_exit_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js'])];
// zones3d.js 要排在 xinsheng／mokuyobi 前面（和 index.html 一樣）；layout 要排在 zones3d 前面
const order=f=>f.startsWith('lib/')?0:(/wz_park_layout|wz_shops_layout/.test(f)?1:(f==='src/zones3d.js'?2:(/xinsheng|mokuyobi/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return {z,its:E.interactables.slice(),levels:E.levels}; }
const ZS=['wenzhou','xinsheng','wz_mokuyobi','campus'], Z={};
for(const id of ZS) Z[id]=loadZone(id);
const navOf=(id,lv)=>{ const q=Z[id]; return q.levels?q.levels[lv|0]:q.z.nav; };
// 進到這四區的每一個出口（從這四區出發的；校園是「往新生南路」的那一個）
const MARGIN=0.2;
for(const from of ZS) for(const it of Z[from].its){ if(!it.exit||!it.exit.spawn||!Z[it.exit.to]) continue; if(from==='campus'&&it.exit.to!=='xinsheng') continue;
  const to=it.exit.to, s=it.exit.spawn, lv=s.lv|0; const near=[];
  for(const q of Z[to].its){ if(!q.exit) continue; if(Z[to].levels&&q.lv!==undefined&&(q.lv|0)!==lv) continue; const d=Math.hypot(q.x-s.x,q.z-s.z), r=q.radius||1.8; if(d<r+MARGIN) near.push(`「${q.label}」${d.toFixed(2)} m（半徑 ${r}）`); }
  const n=navOf(to,lv), ok=n&&n.clear(s.x,s.z,0.3);
  check(`${from}「${it.label}」→ ${to} (${s.x.toFixed(2)}, ${s.z.toFixed(2)}${lv?'、第 '+lv+' 層':''})：不在任何出口的範圍內、站得住`,!near.length&&ok,(near.join('、')||'')+(ok?'':' 站不住')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
