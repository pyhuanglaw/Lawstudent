// 118 巷吧台高腳椅的座位帶 lift（LAWWW2 2026-10-22）——不需要瀏覽器。
//   lane118_shops.py 的吧台高腳椅（chair 'bar'，座面 0.76 m）原本座位沒寫 lift：GAME.sitAt 用一般椅子的高度（0.45 m），人坐進凳子裡、凳面穿過大腿。
//   1. 配置（src/data/l118_shop_layouts.js，tools/lane118/gen_shop_layouts.py 由 layout.json 產生）：一一八茶飲 2（等飲料的高腳椅）、咖啡館 4（窗邊）、
//      義大利麵 6、蛋包飯 5（吧台）個座位都有 lift 0.31（0.76 − 0.45）；其他座位沒有；
//   2. 區域（src/l118_shops3d.js）：區域座位、坐下按鈕的 seat 都帶 lift。
// 修改前：1、2 都 FAIL。用法：node tests/l118_bar_lift_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
for(const [f,n] of [['src/data/lane118_layout.js','LANE118_LAYOUT'],['src/data/l118_shop_layouts.js','L118_SHOP_LAYOUTS'],['src/l118_shops3d.js','L118S']])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='),{filename:f});
const EXPECT={tea:2,cafe2:4,pasta:6,omu:5};
for(const [id,n] of Object.entries(EXPECT)){ const L=L118_SHOP_LAYOUTS[id]; const hi=L.seats.filter(s=>s.lift);
  check('1. '+L.name+'：吧台高腳椅 '+n+' 個座位帶 lift 0.31', hi.length===n&&hi.every(s=>Math.abs(s.lift-0.31)<1e-6), hi.length+' 個'); }
{ const o=Object.keys(L118_SHOP_LAYOUTS).filter(i=>!EXPECT[i]).flatMap(i=>L118_SHOP_LAYOUTS[i].seats.filter(s=>s.lift).map(()=>i)); check('1. 其他店的座位沒有 lift', o.length===0, o.join(' ')); }
for(const id of Object.keys(EXPECT)){ loadZone('l118_'+id); const L=L118_SHOP_LAYOUTS[id]; const hi=L.seats.filter(s=>s.lift);
  const zs=hi.map(s=>(E.zone.seats||[]).find(q=>q.x===s.x&&q.z===s.z)), is=hi.map(s=>E.interactables.find(i=>i.seat&&i.seat.x===s.x&&i.seat.z===s.z));
  check('2. '+L.name+'：區域座位、坐下按鈕的 seat 帶 lift', hi.length>0&&zs.every(q=>q&&q.lift===0.31)&&is.every(i=>i&&i.seat.lift===0.31), '區域 '+zs.map(q=>q&&q.lift).join(',')+'；按鈕 '+is.map(i=>i&&i.seat.lift).join(',')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
