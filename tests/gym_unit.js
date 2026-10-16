// 新體育館第一階段（LAWWW2-B 4d19c88d：gym_layout.js v2＋gym_interior.glb）接進遊戲——不需要瀏覽器。
// 檢查：校園體育館門口走得進來（DOORS.gym.enter）；出生點站得住、出口走得到、一進來不會先看到「離開」；大廳和球場之間只能從三個開口過（中間走閘門）；
//       看台、服務台、樓梯口擋住；座位、互動點（服務台、開館時間、樓梯口、體育課集合、公告欄、樓層指引）都走得到、按鈕真的出現；回校園的落點站得住。用法：node tests/gym_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return z; }
check('1. 有 gym 區域；校園的體育館門口走得進來（DOORS.gym.enter＝gym）；manifest 有正式模型',!!Z3.ZONES.gym&&CLS.DOORS.gym.enter==='gym'&&!!ASSETS.manifest['bldg.gym_interior']&&fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gym_interior.glb')));
const z=loadZone('gym'), Ly=GYM_LAYOUT; const sp=[z.spawn.x,z.spawn.z]; const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const ex=E.interactables.find(i=>i.exit&&i.exit.to==='campus');
check('2. 出生點站得住；出口「離開體育館」走得到；一進來不在出口的範圍裡',E.canStand(sp[0],sp[1],0.32,0)&&!!ex&&Math.hypot(ex.x-sp[0],ex.z-sp[1])>ex.radius,ex&&JSON.stringify([ex.x,ex.z,ex.radius]));
check('3. 大廳和球場之間：牆走不過（x −15、−5、5、15）；三個開口站得住（x −10、10；中間閘門的通道 x −0.8、0.4）',![-15,-5,5,15].some(x=>E.canStand(x,11,0.1,0))&&[[-10,11],[10,11]].every(p=>E.canStand(p[0],p[1],0.32,0))&&[-0.8,0.4].every(x=>E.canStand(x,12.6,0.25,0)));
{ const a=walk(sp,[0,-4]), b=walk(sp,[-10,-12]), c=walk([0,-4],[-13.4,17.2]); check('3. 從大廳走得到球場中圈、西北的羽球場；從球場走回大廳的販賣機前面',a.ok&&b.ok&&c.ok,[a,b,c].map(r=>r.reason||'ok').join(',')); }
check('4. 看台、服務台、往 3F／B1 的樓梯口擋住；羽球網柱擋住、網子本身不擋（上課時同學會穿過場地）',!E.canStand(0,-17.6,0.1,0)&&!E.canStand(11,15.6,0.1,0)&&!E.canStand(-18,15.3,0.1,0)&&!E.canStand(18,15.1,0.1,0)&&!E.canStand(-3.1,-11.2,0.02,0)&&E.canStand(0,-11.2,0.32,0));
const shows=i=>{ const R=i.radius-0.05; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(!E.canStand(x,zz,0.32,0)) continue;
  let best=null, bd=1e9; for(const q of E.interactables){ const d=Math.hypot(q.x-x,q.z-zz); if(d<=q.radius&&d<bd){ bd=d; best=q; } } if(best===i&&walk(sp,[x,zz]).ok) return true; } return false; };
const want=['服務台','看開館時間','往 3F 的樓梯（今天不開放）','往 B1 的樓梯（今天不開放）','體育課集合','看公告欄','看樓層指引'];
const its=want.map(l=>E.interactables.find(i=>i.label===l)); const bad=want.filter((l,k)=>!its[k]||!shows(its[k]));
check('5. 互動點都有、走得到、按鈕真的出現（不被別的蓋過）：'+want.join('、'),!bad.length,bad.join('、'));
check('5. 看的互動點都有說明字（設施的說明，不是劇情）；打羽球、販賣機、直飲台還沒開',its.filter(i=>i&&i.look).length===6&&!E.interactables.some(i=>/打羽球|販賣機|直飲台/.test(i.label||'')));
const seats=E.interactables.filter(i=>i.seat); const badS=seats.filter(i=>!shows(i)).map(i=>i.label+'('+i.x+','+i.z+')');
check('6. 座位 '+seats.length+' 個（大廳長椅、看台、場邊長椅）都走得到、按鈕出現；看台的位子坐在看台的高度',seats.length===Ly.seats.length&&!badS.length&&seats.filter(i=>i.label==='坐在看台').every(i=>i.seat.y===0.45),badS.join('、'));
{ const zc=loadZone('campus'); check('7. 回校園的落點 (74,58.0) 站得住、走得到體育館門口',E.canStand(74,58.0,0.32,0)&&E.simWalk(74,58.0,74,59.0,{lv0:0,lv1:0,dt:0.1,speed:4.1}).ok); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
