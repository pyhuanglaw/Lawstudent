// V0-A6：經濟系那一年社科院門口的一句（AA_173 第 1 節）——不需要瀏覽器。用法：node tests/v0_a6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=G=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; delete global.GAME; return z; };
build({stage:'econ',flags:{},day:-15}); const it=E.interactables.find(i=>i.label==='社會科學院');
check('1. 經濟系：社科院門口「社會科學院」→「經濟系的系辦在這棟。今天沒有要來的事。」',!!it&&it.look==='經濟系的系辦在這棟。今天沒有要來的事。');
const lib=E.interactables.find(i=>i.label==='進入社科院圖書館'); check('1. 和「進入社科院圖書館」的範圍不重疊（兩個按鈕各自出現）',!!lib&&Math.hypot(it.x-lib.x,it.z-lib.z)>it.radius+lib.radius);
let ok=false; for(let dx=-1.3;dx<=1.3&&!ok;dx+=0.1) for(let dz=-1.3;dz<=1.3&&!ok;dz+=0.1){ if(dx*dx+dz*dz>1.69) continue; const x=it.x+dx, zz=it.z+dz; if(E.canStand(x,zz,0.32,0)&&E.simWalk(80,-70,x,zz,{lv0:0,lv1:0,dt:0.1,speed:4.1}).ok) ok=true; }
check('2. 範圍內站得住、從法學院廣場走得到',ok);
build({stage:'law',flags:{},day:20}); check('3. 法律系的那幾年沒有這個互動點（照舊）',!E.interactables.some(i=>i.label==='社會科學院'));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
