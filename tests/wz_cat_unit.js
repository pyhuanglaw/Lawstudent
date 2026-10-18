// 溫州街的貓的正式模型（ART-WZ5，AA-B 製作、LAWWW2-B 驗收 6a05f12d；bldg.wz_cat）接進小公園——不需要瀏覽器。
// 檢查：GLB 有三個姿勢、名牌、繃帶、fat morph、老貓材質；Z3.wzCatModel 只留一個姿勢、照學期換樣子（大二上胖 1.0、大二下 0.5、大三起名牌、大三上第 10 週繃帶、大四老貓材質）；
//       小公園的貓放在 dyn 群組（不參加整區合併，正式模型載入後才能藏起套件的貓）；?nobldg／載入失敗照舊是套件的貓。用法：node tests/wz_cat_unit.js
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
process.on('unhandledRejection',()=>{}); vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/wzpark3d.js'),'utf8').replace(/^const PARK\s*=/m,'global.PARK='),{filename:'src/wzpark3d.js'}); global.fetch=()=>Promise.reject(new Error('no fetch'));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/aa_support/wz_cat.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString());
const NN=J.nodes.map(n=>n.name), MN=J.materials.map(m=>m.name);
const need=['CAT_sit','CAT_lie','CAT_walk','CAT_sit_tag','CAT_lie_tag','CAT_walk_tag','CAT_sit_bandage','CAT_lie_bandage','CAT_walk_bandage','CAT_fur_old_holder'];
check('1. GLB：三個姿勢、各自的名牌與繃帶、老貓材質的掛點都在；材質 cat_fur、cat_fur_old',need.every(k=>NN.includes(k))&&MN.includes('cat_fur')&&MN.includes('cat_fur_old'),need.filter(k=>!NN.includes(k)).join(','));
{ const cm=J.nodes.filter(n=>/^CAT_/.test(n.name)&&n.name!=='CAT_fur_old_holder'&&n.mesh!=null).map(n=>J.meshes[n.mesh]);
  check('1. 貓的每個網格（不含掛老貓材質的小節點）都有 morph target「fat」',cm.length===9&&cm.every(m=>(m.extras&&m.extras.targetNames||[]).includes('fat')),cm.length+' 個'); }
check('1. manifest：bldg.wz_cat（lazy，?nobldg 不載入、用套件的貓）',!!ASSETS.manifest['bldg.wz_cat']&&ASSETS.manifest['bldg.wz_cat'].lazy===true&&/aa_support\/wz_cat\.glb$/.test(ASSETS.manifest['bldg.wz_cat'].url));
/* 模擬 GLB 載入後的場景：同樣的名字、網格有 fat 的 morph、材質名稱一樣 */
const fur=new THREE.MeshStandardMaterial({name:'cat_fur'}), old=new THREE.MeshStandardMaterial({name:'cat_fur_old'});
const mesh=(name,mat)=>{ const m=new THREE.Mesh(new THREE.BufferGeometry(),mat||fur); m.name=name; m.morphTargetDictionary={fat:0}; m.morphTargetInfluences=[0]; return m; };
const mkRoot=()=>{ const r=new THREE.Group(); let x=0; for(const p of ['sit','lie','walk']){ const n=mesh('CAT_'+p); n.position.set(x,0,0); x+=0.6; n.add(mesh('CAT_'+p+'_tag')); n.add(mesh('CAT_'+p+'_bandage')); r.add(n); } const h=mesh('CAT_fur_old_holder',old); h.position.y=-1; r.add(h); return r; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const termDay=(id,wk)=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===wk) return d; } return null; };
const st=(id,wk)=>{ const r=Z3.wzCatModel(mkRoot(),{day:termDay(id,wk||5)},'lie'); const k=r.getObjectByName('CAT_lie'); const vis=n=>{ const o=r.getObjectByName(n); return !!o&&o.visible; };
  return {pose:['sit','lie','walk'].filter(p=>vis('CAT_'+p)),tag:vis('CAT_lie_tag'),band:vis('CAT_lie_bandage'),fat:k.morphTargetInfluences[0],old:k.material.name==='cat_fur_old',x:k.position.x,holder:vis('CAT_fur_old_holder')}; };
{ const a=st('Y1S1'); check('2. 大一：只留趴著的姿勢（位置歸零）、沒有名牌和繃帶、不胖、年輕的毛色',a.pose.join()==='lie'&&!a.tag&&!a.band&&a.fat===0&&!a.old&&a.x===0,JSON.stringify(a)); }
{ const a=st('Y2S1'), b=st('Y2S2'); check('3. 大二上 fat 1.0、大二下 0.5',a.fat===1&&b.fat===0.5,JSON.stringify([a.fat,b.fat])); }
{ const a=st('Y3S1',5), b=st('Y3S1',10), c=st('Y3S1',11), d=st('Y3S2'); check('4. 大三起有名牌；繃帶只有大三上第 10 週（找到以後那一週）',a.tag&&!a.band&&b.tag&&b.band&&!c.band&&d.tag&&!d.band,JSON.stringify([a,b,c].map(x=>[x.tag,x.band]))); }
{ const a=st('Y4S1'), b=st('Y3S2'); check('5. 大四換老貓的毛色（cat_fur_old）；掛材質的小節點不顯示',a.old&&!b.old&&!a.holder,JSON.stringify([a.old,b.old,a.holder])); }
{ global.GAME={G:{day:termDay('Y1S1',5),hour:16,flags:{},daily:{}}}; E3.interactables=[]; E3.colliders=[]; E3.lampGlows=[]; E3.seats=[]; E3.npcs=[]; const z=Z3.ZONES.wenzhou.build(E3);
  const cg=z.group.getObjectByName('wz_cat'); check('6. 小公園的貓在 dyn 群組 wz_cat 裡（套件的貓是備用，模型載入後藏起來）',!!cg&&cg.userData.dyn===true&&cg.children.length>=1);
  global.GAME.G.day=termDay('Y3S1',9); E3.interactables=[]; const z2=Z3.ZONES.wenzhou.build(E3); check('6. 大三上第 9 週（走失）沒有貓',!z2.group.getObjectByName('wz_cat')); delete global.GAME; }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
