// 美國：C 棟 208 臥室 C＝學姊的房間（AA_399 第 8 節；LAWWW-B 10-24 任務 #82 第七間；LAWWW2-B 2026-10-24）——不需要瀏覽器。
//   1. 區域、正式模型登記了（Z3.ZONES.us_bed_c、bldg.us_bed_c；模型＝tools/blender/env_second/us_bed_c.py）
//   2. 開放時段（Z3.roomGlbOpen）：交往中（flags.dating_heroine_05 或 romance.heroine_05.status＝dating）、週六日 14～21；其他時間關
//   3. 合租戶走道的臥室 C 門：開的時候只有「敲門（臥室 C）」、其他時間照舊「臥室 C」（門關著）；臥室 A、B 的門不受影響
//   4. 回走道的落點＝門的互動點、站得住（合租戶的導航）
//   5. 引擎真正的導航（E.simWalk）：書桌、窗外、書架、出口從門口走得到；玩家的位置站得住、走得到；她坐在書桌前（面向窗）
//   6. 窗景照美國篇的季節換（us3d.js 的 usSeasonKey）：us_bed_c_summer／autumn／bare／snow，八張窗景圖都在
// 修改前：沒有 us_bed_c（第 1 項就失敗）。用法：node tests/us_bed_c_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const GAME_G={v:{day:30,hour:15,flags:{},stage:'law'}}; global.GAME={get G(){ return GAME_G.v; }};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/characters.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|PORTRAIT_ONLY|ROOM_GLB_LAYOUTS|US3|US_\w+_LAYOUT|AIRPORT_T2_LAYOUT|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const L=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS.us_bed_c:null;
check('1. 區域、正式模型登記了（us_bed_c、bldg.us_bed_c）', !!L&&!!Z3.ZONES.us_bed_c&&!!ASSETS.manifest['bldg.us_bed_c']&&/us_bed_c\.glb$/.test(ASSETS.manifest['bldg.us_bed_c'].url));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=key=>{ for(let d=-400;d<3000;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };
const WD=(from,wd)=>{ for(let d=DAY(from);d<DAY(from)+7;d++) if(CALENDAR.dateOf(d).wd===wd) return d; return null; };   // from 那一週的週幾（1＝週一…7＝週日）
const DATING={dating_heroine_05:true}, ROM={romance:{heroine_05:{status:'dating'}}};
const G=(day,hour,flags)=>({day,hour,flags:Object.assign({},flags||{}),stage:'law'}); const op=(day,h,f)=>Z3.roomGlbOpen('us_bed_c',G(day,h,f));
const SAT=WD('2028-09-11',6), SUN=WD('2028-09-11',7), WED=WD('2028-09-11',3);
check('2. 交往中、週六 14:00、17:30、20:30 開；週日 15:00 開', op(SAT,14,DATING)&&op(SAT,17.5,DATING)&&op(SAT,20.5,DATING)&&op(SUN,15,DATING), CALENDAR.dateOf(SAT).key);
check('2. 同一天 13:30、21:00、晚上 23:00 關；週三下午關', !op(SAT,13.5,DATING)&&!op(SAT,21,DATING)&&!op(SAT,23,DATING)&&!op(WED,15,DATING));
check('2. 沒有交往：週六下午也關；交往紀錄（romance.heroine_05.status＝dating）也算', !op(SAT,15,{})&&!op(SAT,15,{dating_heroine_05:false})&&op(SAT,15,ROM));
const D=US_SHARED_LAYOUT.doors.find(d=>d.id==='bedC');
{ const B=L.back_spawn; const at=()=>E.interactables.filter(i=>Math.abs(i.x-B.x)<0.01&&Math.abs(i.z-B.z)<0.01&&(i.lv|0)===0); const vis=its=>its.filter(i=>!i.hidden).map(i=>i.label);
  GAME_G.v=G(SAT,15,DATING); loadZone('us_shared'); const its=at(); const a=vis(its); GAME_G.v=G(WED,15,DATING); const b=vis(its); GAME_G.v=G(SAT,15,{}); const c=vis(its);
  check('3. 開的時候只有「敲門（臥室 C）」', a.length===1&&a[0]==='敲門（臥室 C）', a.join('、'));
  check('3. 週三、沒有交往只有原本的「臥室 C」（門關著）', b.length===1&&b[0]===D.label&&c.length===1&&c[0]===D.label&&its.find(i=>i.label===D.label).look===D.closed, b.join('、')+'／'+c.join('、'));
  const en=its.find(i=>i.exit); check('3. 進去的落點＝配置的 spawn', !!en&&en.exit.to==='us_bed_c'&&Math.abs(en.exit.spawn.x-L.spawn.x)<1e-6&&Math.abs(en.exit.spawn.z-L.spawn.z)<1e-6);
  check('4. 回走道的落點（back_spawn）＝門的互動點、站得住', its.length===2&&(B.lv|0)===0&&E.canStand(B.x,B.z,0.3,0), JSON.stringify(B));
  const ab=['bedA','bedB'].map(id=>US_SHARED_LAYOUT.doors.find(d=>d.id===id)); const others=ab.map(d=>E.interactables.find(i=>i.label===d.label&&!i.exit));
  check('3. 臥室 A、B 的門照舊關著（只有門上的字）', others.every((i,k)=>!!i&&!i.hidden&&i.look===ab[k].closed)&&!E.interactables.some(i=>i.exit&&/bed[AB]/.test(i.exit.to||''))); }
{ GAME_G.v=G(SAT,15,DATING); const z=loadZone('us_bed_c'); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  const reachNear=(x,zz,r)=>{ for(let rr=0;rr<=r;rr+=0.2) for(let k=0;k<12;k++){ const px=x+rr*Math.cos(k*Math.PI/6), pz=zz+rr*Math.sin(k*Math.PI/6); if(E.canStand(px,pz,0.3,0)&&walk(sp,[px,pz]).ok) return true; } return false; };
  check('5. 出生點站得住、不在出口範圍裡', E.canStand(sp[0],sp[1],0.3,0)&&Math.hypot(sp[0]-L.exits[0].x,sp[1]-L.exits[0].z)>L.exits[0].r);
  const bad=[]; for(const q of L.interact) if(!reachNear(q.x,q.z,q.r)) bad.push(q.label);
  if(!reachNear(L.exits[0].x,L.exits[0].z,L.exits[0].r)) bad.push('出口');
  check('5. 她的書桌、窗外、書架、出口都從門口走得到', !bad.length&&L.interact.length===3, bad.join('、'));
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='us_shared'); check('4. 「離開房間」的落點＝back_spawn', !!ex&&ex.label==='離開房間'&&ex.exit.spawn&&Math.abs(ex.exit.spawn.x-L.back_spawn.x)<1e-6&&Math.abs(ex.exit.spawn.z-L.back_spawn.z)<1e-6);
  const S=L.spots; check('5. 玩家的位置站得住、走得到', E.canStand(S.player.x,S.player.z,0.3,0)&&reachNear(S.player.x,S.player.z,0.3));
  const desk=L.blocks.find(b=>b.why==='desk'), chair=L.blocks.find(b=>b.why==='chair');
  check('5. 她坐在書桌前的椅子上、面向窗（+x）', S.sis.act==='sit'&&S.sis.x>chair.x0&&S.sis.x<chair.x1&&S.sis.z>chair.z0&&S.sis.z<chair.z1&&Math.abs(Math.sin(S.sis.yaw)-1)<1e-3&&desk.x0>S.sis.x&&L.windows.wall==='right'); }
{ const keys=[['2028-09-16','summer'],['2028-10-21','autumn'],['2028-11-18','bare'],['2028-12-09','snow']]; const got=[];
  for(const [k] of keys){ GAME_G.v=G(DAY(k),15,DATING); const z=loadZone('us_bed_c'); got.push((z.wins&&z.wins[0]&&z.wins[0].userData.pview)||'-'); }
  check('6. 窗景照季節換（9/16 夏、10/21 秋、11/18 初冬、12/9 雪）', got.join(',')===keys.map(q=>'us_bed_c_'+q[1]).join(','), got.join(','));
  const miss=[]; for(const [,s] of keys) for(const t of ['day','night']){ const f='assets/models/env/views/us_bed_c_'+s+'_'+t+'.webp'; if(!fs.existsSync(path.join(ROOT,f))) miss.push(f); }
  check('6. 八張窗景圖都在（us_bed_c_<季節>_{day,night}.webp）', !miss.length, miss.join('、')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
