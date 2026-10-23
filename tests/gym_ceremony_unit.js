// 新體育館 3F 主球場：開學典禮、畢業典禮的布置（SET-CEREMONY-1023；AA_399 第 4 節、A16；LAWWW2-B 10-23）——不需要瀏覽器。
// 檢查：配置（日子、學院分區、站位）；GY3.ceremonyDay；平常的日子場地照舊；典禮那天椅子區、舞台擋住、三條走道和場地四周走得到、法律學院走道邊的座位走得到；
//       「看主球場」換典禮的句子；正式模型有學院的牌子；gym3d.js 典禮那天打開舞台＋典禮。
// 修改前：第 1 項 FAIL（沒有 days／sections）。用法：node tests/gym_ceremony_unit.js
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
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return z; }
const walk=(a,b,o)=>E.simWalk(a[0],a[1],b[0],b[1],Object.assign({lv0:0,lv1:0,dt:0.1,speed:4.1},o||{}));
// ---------- 典禮的布置（SET-CEREMONY-1023）----------
const CER=GYM_LAYOUT.arena.sets.ceremony, A=GYM_LAYOUT.arena;
const dayOf=key=>{ for(let d=-60;d<2200;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };
const dOpen=dayOf('2025-08-31'), dGrad=dayOf('2029-06-02'), dPlain=dayOf('2025-10-15');
const cfgOk=!!(CER.days&&CER.sections&&CER.spots&&CER.lawSeats&&GY3.ceremonyDay);
check('1. 配置：典禮的日子（2025-08-31 開學、2029-06-02 畢業）、十二個學院分區（法律學院一區）、站位（玩家、以安、阿哲、Alison、家人三位、入口）',
  cfgOk&&CER.days['2025-08-31']==='open'&&CER.days['2029-06-02']==='grad'&&CER.sections.length===12&&CER.sections.filter(s=>s.law&&s.name==='法律學院').length===1
  &&['me','an','zhe','alison','entry','aisle'].every(k=>CER.spots[k]&&isFinite(CER.spots[k].x))&&CER.spots.family.length===3);
if(!cfgOk){ console.log('\n1 FAIL（後面的檢查要典禮的配置）'); process.exit(1); }
check('2. GY3.ceremonyDay：開學典禮那天 open、畢業典禮那天 grad、平常的日子 null', GY3.ceremonyDay({day:dOpen})==='open'&&GY3.ceremonyDay({day:dGrad})==='grad'&&GY3.ceremonyDay({day:dPlain})===null, [dOpen,dGrad,dPlain].join('／'));
const inLaw=(x,z)=>{ const s=CER.sections.find(q=>q.law); return x>=s.x0-0.01&&x<=s.x1+0.01&&z>=s.z0-0.01&&z<=s.z1+0.01; };
check('3. 玩家、以安、阿哲、Alison 都在法律學院那一區的椅子上（椅子的格點），玩家在走道邊', ['me','an','zhe','alison'].every(k=>inLaw(CER.spots[k].x,CER.spots[k].z))&&Math.abs(CER.spots.me.x-CER.lawSeats.x)<1e-6
  &&['me','an','zhe','alison'].every(k=>{ const p=CER.spots[k]; return Math.abs(((p.x-CER.chairs.x[0])/CER.chairs.pitch[0])-Math.round((p.x-CER.chairs.x[0])/CER.chairs.pitch[0]))<1e-6&&Math.abs(((p.z-CER.chairs.z[0])/CER.chairs.pitch[1])-Math.round((p.z-CER.chairs.z[0])/CER.chairs.pitch[1]))<1e-6; }));
// 平常的日子：場地整片走得到、沒有典禮的座位
global.GAME={G:{day:dPlain,hour:10,flags:{}}};
{ const z=loadZone('gym_arena'), sp=[z.spawn.x,z.spawn.z]; const r=walk(sp,[4.0,-0.95]);
  check('4. 平常的日子：沒有打開（ceremonyOn 空）、場地中間（法律學院那一區的位置）走得到、沒有「坐下（法律學院）」', !z.ceremonyOn&&r.ok&&!E.interactables.some(i=>/法律學院/.test(i.label||''))); }
// 典禮那天
for(const [nm,d] of [['開學典禮',dOpen],['畢業典禮',dGrad]]){ global.GAME={G:{day:d,hour:13,flags:{}}};
  const z=loadZone('gym_arena'), sp=[z.spawn.x,z.spawn.z], S=CER.spots;
  const law=E.interactables.filter(i=>i.seat&&/法律學院/.test(i.label||'')), bad=law.filter(i=>!walk(sp,[i.x,i.z]).ok);
  check('5. '+nm+'：ceremonyOn、法律學院走道邊的座位 '+CER.lawSeats.z.length+' 個都走得到（走近點在中間走道）', !!z.ceremonyOn&&law.length===CER.lawSeats.z.length&&!bad.length, z.ceremonyOn+'；'+JSON.stringify(bad.map(i=>[i.x,i.z])));
  const chairPts=[[4.3,-0.95],[-4.38,2.2],[12.36,8.5],[-13.06,-10.4],[S.an.x,S.an.z]], stage=[[0,-18.6],[10.6,-18.0]];
  check('6. '+nm+'：椅子區、舞台（含兩側的樓梯）走不進去', chairPts.every(p=>!E.canStand(p[0],p[1],0.1,0))&&stage.every(p=>!E.canStand(p[0],p[1],0.1,0)));
  const aisles=[[0,-12.0],[0,12.5],[8.9,0.1],[-8.9,0.1],[S.entry.x,S.entry.z],[S.aisle.x,S.aisle.z],[-20.5,15.5],[20.5,-14.0]], badA=aisles.filter(p=>!walk(sp,p).ok);
  check('7. '+nm+'：三條走道、入口、場地四周（椅子區外面）走得到', !badA.length, JSON.stringify(badA));
  const pr=GY3.arenaLook('arena_look',GAME.G,z,0); check('8. '+nm+'：「看主球場」換成典禮的那一句', /折疊椅/.test(pr), pr); }
// 正式模型：牌子在典禮的布置裡；gym3d.js 典禮那天打開舞台＋典禮
{ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_arena.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8'));
  const idx=n=>J.nodes.findIndex(q=>q.name===n), cer=J.nodes[idx('SET_CEREMONY')]||{}; const kids=(cer.children||[]).map(i=>J.nodes[i].name);
  check('9. gym_arena.glb：SET_CEREMONY 底下有學院的牌子（SET_CEREMONY_signs、signposts）', kids.includes('SET_CEREMONY_signs')&&kids.includes('SET_CEREMONY_signposts'), kids.filter(k=>/sign/.test(k)).join('、'));
  const g=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8');
  check('10. gym3d.js：典禮那天 SET_STAGE、SET_CEREMONY 打開，其他布置照舊藏著', /o\.visible=!!z\.ceremonyOn&&\(o\.name==='SET_STAGE'\|\|o\.name==='SET_CEREMONY'\)/.test(g)); }
console.log(fails?('\n'+fails+' FAIL'):'\nALL PASS'); process.exit(fails?1:0);
