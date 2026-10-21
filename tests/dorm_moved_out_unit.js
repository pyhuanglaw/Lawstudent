// AA_363 T7-3：畢業後宿舍期滿退宿（1A-15 的 MOVED_OUT）以後，3D 校園的宿舍門口進不去；按了只看到「（宿舍門口。門禁卡已經還了。）」——不需要瀏覽器。
// 用 v0_a6_unit.js 的做法在 Node 裡蓋校園（zones3d.js 的 campus.build 讀 GAME.G）。修改前：退宿以後門口照樣是「回宿舍」（exit 到 dorm_hall），第 1、2 項 FAIL。
// 用法：node tests/dorm_moved_out_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/dorm_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|DORM_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=G=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.campus.build(E); E.zone=z; delete global.GAME; return z; };
const near=it=>Math.hypot(it.x-20,it.z-59.6)<0.01;   /* 男一舍門口（zones3d.js 的出口 x:20 z:59.6）*/
const LOOK='（宿舍門口。門禁卡已經還了。）';
const door=G=>{ build(G); return E.interactables.filter(near); };
{ const L=door({stage:'law',flags:{GRADUATED:1380,MOVED_OUT:1406,HOME_AFTER:'home'},day:1420});
  check('1. 退宿以後（MOVED_OUT，住臺北的家）：宿舍門口不能進去——沒有往宿舍的出口，只有「看」：「（宿舍門口。門禁卡已經還了。）」',L.length===1&&!L[0].exit&&L[0].look===LOOK&&!E.interactables.some(i=>i.exit&&(i.exit.to==='dorm_hall'||i.exit.to==='dorm')),JSON.stringify(L.map(i=>[i.label,i.look,i.exit&&i.exit.to]))); }
{ const L=door({stage:'law',flags:{GRADUATED:1380,MOVED_OUT:1406,HOME_AFTER:'gongguan'},day:1420});
  check('2. 住公館套房的（也退宿了）：一樣只能看',L.length===1&&!L[0].exit&&L[0].look===LOOK,JSON.stringify(L.map(i=>[i.label,i.look]))); }
{ const a=door({stage:'law',flags:{},day:20}), b=door({stage:'law',flags:{GRADUATED:1380},day:1390}), c=door({stage:'law',flags:{MOVED_OUT:false},day:1390});
  const ok=x=>x.length===1&&!!x[0].exit&&x[0].exit.to==='dorm_hall'&&x[0].label==='回宿舍'&&!x[0].look;
  check('3. 還沒退宿（在學、畢業了還沒到 6/28、MOVED_OUT false）：照舊「回宿舍」進得去',ok(a)&&ok(b)&&ok(c),JSON.stringify([a,b,c].map(x=>x.map(i=>[i.label,i.exit&&i.exit.to])))); }
{ const L=door({stage:'law',flags:{GRADUATED:1380,MOVED_OUT:1406,HOME_AFTER:'home'},day:1420}), it=L[0]; let ok=false;
  for(let dx=-2.4;dx<=2.4&&!ok;dx+=0.2) for(let dz=-2.4;dz<=2.4&&!ok;dz+=0.2){ if(dx*dx+dz*dz>it.radius*it.radius) continue; if(E.canStand(it.x+dx,it.z+dz,0.32,0)) ok=true; }
  check('4. 「看」的範圍和原本的門口一樣（半徑 '+(it&&it.radius)+'），站得到',!!it&&it.radius===2.6&&ok); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
