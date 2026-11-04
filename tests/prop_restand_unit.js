// 正式模型載好才擋的雜物，擋好以後把站不住的玩家挪開（V7-RELOCATE-1104，BB-C 11-04 18:01）——不需要瀏覽器。
// v7 舊存檔讀進公館：出生點照「模型還沒載好」的導航格找，落在 (−8.75, 20.75)；一兩秒後公館店面的正式模型（bldg.gongguan_shops）載好，
//   propBlocks 擋上頁間門口的盆栽（GG_PROP_BLOCKS (−9.3, 21.5)），玩家就在擋住的格子旁邊、站不住（canStand 0.3 false，走得動）。
// 檢查：模型載好以後玩家挪到最近站得住的地方（移動 < 1 m）；本來就站得住的不動；坐著、在演的不動。修改前（a1d5f0eb2 以前的 zones3d.js）：第 1 項 FAIL。
// 用法：node tests/prop_restand_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const tick=()=>new Promise(r=>setTimeout(r,0)); const flush=async()=>{ for(let i=0;i<10;i++) await tick(); };
ASSETS.loadOne=k=>k==='bldg.gongguan_shops'?Promise.resolve({scene:new THREE.Group()}):Promise.reject(new Error('no '+k));
async function run(x,z,o){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; E.levels=null;
  E.player={obj:new THREE.Group(),lv:0,radius:0.32,busy:!!(o&&o.busy),seat:(o&&o.seat)||null}; E.player.obj.position.set(x,0,z);
  const zn=Z3.ZONES.gongguan.build(E); E.zone=zn; E.nav=zn.nav; zn.nav._cm=null;
  const before={stand:E.canStand(x,z,0.3)}; await flush(); const p=E.player.obj.position;
  return {before,after:{x:+p.x.toFixed(2),z:+p.z.toFixed(2),stand:E.canStand(p.x,p.z,0.3),moved:+Math.hypot(p.x-x,p.z-z).toFixed(2)},blocked:!E.nav.free(-9.25,21.1)}; }
(async()=>{
  check('0. 前提：ASSETS 有 bldg.gongguan_shops（公館店面的正式模型）',!!(ASSETS.manifest&&ASSETS.manifest['bldg.gongguan_shops']));
  const a=await run(-8.75,20.75);
  check('0. 前提：模型還沒載好時 (−8.75, 20.75) 站得住；載好以後頁間門口的盆栽擋上了',a.before.stand===true&&a.blocked===true,J(a));
  check('1. 模型載好以後：玩家挪到最近站得住的地方（移動 < 1 m）',a.after.stand===true&&a.after.moved>0&&a.after.moved<1,J(a.after));
  const b=await run(-20,19);
  check('2. 本來就站得住的地方：不動',b.before.stand===true&&b.after.moved===0&&b.after.stand===true,J(b.after));
  const c=await run(-8.75,20.75,{busy:true});
  check('3. 在演（busy）：不動（演完再說）',c.after.moved===0,J(c.after));
  const d=await run(-8.75,20.75,{seat:{x:-8.75,z:20.75}});
  check('3. 坐著：不動',d.after.moved===0,J(d.after));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
