// 萬才館研討室 A、B 的光照烘焙（INTERIOR-AAA-REVIEW-1028 P1；LAWWW2-B 2026-11-07；tools/blender/env_second/lightbake/bake_wancai_sem.sh）——不需要瀏覽器。
//   1. 兩個 GLB 有 extras.lightmap（白天、晚上的貼圖檔都在）；B 另外有 sets.interview（推甄面試那一套家具烘的兩張，和平常那兩張不同檔）
//   2. 地板、天花板、牆、腰牆有第二套 UV（烘焙）；燈管、頂點色的小東西、金屬件、書、B 兩套家具沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用：遊戲把光照貼圖接在材質上，沒有第二套 UV 的網格會讀到錯的地方（bake_room.py 會複製一份 _rt）
//   4. 淡出的牆節點都在；B 的 SET_CONSULT、SET_INTERVIEW 都在、底下有東西
//   5. 遊戲（rooms_glb3d.js）：B 平常的日子用平常那一張、2028-10-26 用面試那一張；再回到平常的日子換回來；快取的 GLB 沒被改；A 沒有 sets，照原本那一張
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）；只換 GLB、不加 rooms_glb3d.js 的 pickLM：第 5 項面試那天失敗。用法：node tests/wancai_sem_lm_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|ROOM_GLB_LAYOUTS|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }

const GAME_G={v:null}; global.GAME={get G(){ return GAME_G.v; }};   /* rooms_glb3d.js、wancai3d.js 的門讀 GAME.G */
const DAY=key=>{ for(let d=1;d<2000;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; };

const glb=id=>{ const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+id+'.glb')); return JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8')); };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const J={wancai_sema:glb('wancai_sema'), wancai_semb:glb('wancai_semb')};
const LM={}; for(const id in J) LM[id]=(J[id].scenes[0].extras||{}).lightmap||null;
// 1
for(const id in J){ const l=LM[id]; check('1. '+id+'：extras.lightmap 白天、晚上的貼圖都在', !!l&&exists(l.day)&&exists(l.night)&&l.intensity>0, l?l.day+'／'+l.night:'沒有'); }
{ const l=LM.wancai_semb, v=l&&l.sets&&l.sets.interview; check('1. wancai_semb：sets.interview 兩張都在、和平常那兩張不同檔', !!v&&exists(v.day)&&exists(v.night)&&v.day!==l.day&&v.night!==l.night, v?v.day+'／'+v.night:'沒有'); }
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 2、3、4
const meshes=j=>j.nodes.filter(n=>n.mesh!=null).map(n=>({name:n.name, prims:j.meshes[n.mesh].primitives.map(p=>({uv1:p.attributes.TEXCOORD_1!=null, mat:p.material!=null?j.materials[p.material].name:null}))}));
const BAKE=/(_floorm|_ceiling|^WALL_[NESW]_(wall|wain)|^WALL_[NESW]_trim)$/, LIVE=/(_tubes|_glowpanel|_props|_metal|^WALL_E_books|_consult_|_interview_|_glass)/;
for(const id in J){ const ms=meshes(J[id]);
  const noUV=ms.filter(m=>BAKE.test(m.name)&&!m.prims.every(p=>p.uv1)).map(m=>m.name), nb=ms.filter(m=>BAKE.test(m.name)).length;
  check('2. '+id+'：地板、天花板、牆、腰牆、收邊條有第二套 UV（'+nb+' 個）', nb>=10&&!noUV.length, noUV.join('、'));
  const live=ms.filter(m=>LIVE.test(m.name)), bad=live.filter(m=>m.prims.some(p=>p.uv1)).map(m=>m.name);
  check('2. '+id+'：燈管、小東西、金屬件、書、玻璃'+(id==='wancai_semb'?'、兩套家具':'')+'沒有第二套 UV（'+live.length+' 個）', live.length>=5&&!bad.length, bad.join('、'));
  const withUV=new Set(), without=new Set(); for(const m of ms) for(const p of m.prims) (p.uv1?withUV:without).add(p.mat);
  const both=[...withUV].filter(x=>without.has(x));
  check('3. '+id+'：沒有材質同時給有／沒有第二套 UV 的網格', !both.length, both.join('、'));
  const names=new Set(J[id].nodes.map(n=>n.name)), miss=['WALL_N_wall','WALL_E_wall','WALL_S_wall','WALL_W_wall'].filter(n=>!names.has(n));
  check('4. '+id+'：淡出的牆節點都在', !miss.length, miss.join('、')); }
{ const j=J.wancai_semb, sets=['SET_CONSULT','SET_INTERVIEW'].map(n=>j.nodes.find(q=>q.name===n));
  check('4. wancai_semb：SET_CONSULT、SET_INTERVIEW 都在、底下有東西', sets.every(s=>s&&(s.children||[]).length>=4), sets.map(s=>s?s.name+' '+(s.children||[]).length:'沒有').join('、')); }
// 5. 遊戲接哪一張：ASSETS.loadOne 換成「場景帶這個 GLB 的 extras」，Z3.attachRoomGLB 換成記下它看到的 extras.lightmap
(async()=>{
  const cache={}; ASSETS.loadOne=k=>{ const id=k.replace(/^bldg\./,''); if(!J[id]) return Promise.reject(new Error('no '+k)); if(!cache[id]){ const s=new THREE.Group(); s.userData=JSON.parse(JSON.stringify(J[id].scenes[0].extras)); cache[id]={scene:s}; } return Promise.resolve(cache[id]); };
  const seen=[]; const at0=Z3.attachRoomGLB; Z3.attachRoomGLB=(z,g0,fb,root)=>{ seen.push(root.userData.lightmap); };
  const tick=()=>new Promise(r=>setTimeout(r,0));
  const G=(day,hour)=>({day,hour,flags:{},stage:'law'});
  const T=CALENDAR.termDays('Y2S1'); let odd=null; for(let d=T.from;d<=T.to&&odd==null;d++){ if(CALENDAR.dateOf(d).wd===6&&CALENDAR.termOf(d).week%2===1) odd=d; }
  const iv=DAY('2028-10-26'), l=LM.wancai_semb;
  const enter=async(id,day)=>{ GAME_G.v=G(day,10); seen.length=0; loadZone(id); await tick(); await tick(); return seen[0]||null; };
  let a=await enter('wancai_semb',odd);
  check('5. wancai_semb 平常的日子（'+CALENDAR.dateOf(odd).key+'，'+Z3.roomGlbSet('wancai_semb',G(odd,10))+'）：平常那一張', !!a&&a.day===l.day&&a.night===l.night, a&&a.day);
  a=await enter('wancai_semb',iv);
  check('5. wancai_semb 2028-10-26（'+Z3.roomGlbSet('wancai_semb',G(iv,10))+'）：面試那一張', !!a&&a.day===l.sets.interview.day&&a.night===l.sets.interview.night&&a.intensity===l.intensity, a&&a.day);
  a=await enter('wancai_semb',odd);
  check('5. 再回到平常的日子：換回平常那一張', !!a&&a.day===l.day, a&&a.day);
  check('5. 快取的 GLB 沒被改（還是平常那一張）', cache.wancai_semb.scene.userData.lightmap.day===l.day);
  a=await enter('wancai_sema',odd);
  check('5. wancai_sema（沒有 sets）：照原本那一張', !!a&&a.day===LM.wancai_sema.day, a&&a.day);
  Z3.attachRoomGLB=at0;
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
