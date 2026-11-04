// 體育課在體育館裡上（BUG-PE-DOOR-2D-1103；使用者 11-03 22:5x 截圖：「體育課上課 用對話呈現？體育館都已經建立好了」「然後背景是校園？」）——不需要瀏覽器。用法：node tests/pe_in_gym_unit.js
//   校園體育館門口「進去上課」＝走進體育館（gym）、站到球場中圈前面，再上課，背景是館內 3D（freeze），不是校園的模糊背景；館內中圈「體育課集合」也一樣。修改前 1、2 FAIL。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}}; global.STORY={extraSpec:i=>({id:'x'+i})};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.boya.build(E);   /* 大一國文在博雅教學館 101（AA_103 第 8 節；方案 A 之前暫時在共同 101）*/ E.zone=z; E.levels=z.levels; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
E.addNPC=n=>{ E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const MON=dayOf('2025-09-22');   /* 週一 pm2：大一上體育（pe_y1s1）*/
(async()=>{
  const it0=(()=>{ for(const h of [13.3,13.4,13.5,14,14.5,15.2,15.5]){ const x=CLS.liveDoor({day:MON,hour:h,zone:'campus',flags:{},weekday:1},'gym'); if(x&&CLS.status({day:MON,hour:h,zone:'campus',flags:{},weekday:1},x)==='open') return {x,h}; } return null; })();
  check('0. 週一下午有一堂可以上的體育課（門口 gym）',!!it0,it0&&it0.x.c.id+'@'+it0.h);
  if(!it0){ console.log('FAILED'); process.exit(1); }
  const G={day:MON,hour:it0.h,zone:'campus',flags:{},weekday:1}, calls=[];
  const GM={G,E:E3,sceneBegin(){},sceneEnd(){},choose:async()=>0,toast(){},caption(){},enter:async(z,sp)=>{ calls.push(['enter',z,sp]); G.zone=z; }};
  const att0=CLS.attend; CLS.attend=async(gm,it,o)=>{ calls.push(['attend',it.c.id,o]); };
  Z3.ZONES.gym=Z3.ZONES.gym||{build(){}};
  await CLS.doorInteract(GM,'gym');
  const en=calls.find(c=>c[0]==='enter'), at=calls.find(c=>c[0]==='attend');
  check('1. 門口「進去上課」：先走進體育館（gym），站在球場中圈前面',!!en&&en[1]==='gym'&&Math.abs(en[2].x-0)<1&&en[2].z<0&&en[2].z>-4,JSON.stringify(calls));
  check('2. 然後上課，帶 inGym（背景用館內 3D，不是校園模糊背景）',!!at&&at[2].inGym===true&&calls.indexOf(en)<calls.indexOf(at),JSON.stringify(calls));
  CLS.attend=att0;
  const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8'), gsrc=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8');
  check('3. attend：inGym＝ADV 背景 freeze（看得到館內）',/const dBg=door&&o\.inGym\?'freeze'/.test(src));
  check('4. 館內中圈「體育課集合」也帶 inGym',/CLS\.attend\(GM,it,\{door:true,inGym:true\}\)/.test(gsrc));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
