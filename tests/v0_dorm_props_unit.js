// 經濟系那一年的宿舍小物件（V0-ART-DORM：AA-B 製作、LAWWW2-B 驗收 f2bebf72）——不需要瀏覽器。
// 檢查：manifest；紙箱狀態照 E01 的旗標（開場在床上、先睡在床尾到隔天晚上拆完、拆完不見）；經濟系才放（法律系的 203 沒有）；story3d 的 E01 在四個時間點換紙箱。用法：node tests/v0_dorm_props_unit.js
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
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/aa_support/v0_dorm_props.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString()); const NN=J.nodes.map(n=>n.name);
check('1. GLB 有 BOXES_ONBED、BOXES_BED、BOXES_FOOT、BOOK_ECON（還有 XUN_DESK、XUN_BOWLING）；manifest bldg.v0_dorm_props（lazy）',['BOXES_ONBED','BOXES_BED','BOXES_FOOT','BOOK_ECON','XUN_DESK','XUN_BOWLING'].every(k=>NN.includes(k))&&!!ASSETS.manifest['bldg.v0_dorm_props']&&ASSETS.manifest['bldg.v0_dorm_props'].lazy===true);
const V=Z3.v0BoxFromFlags; check('2. 紙箱狀態：還沒過開學那晚＝床上；先睡＝床尾（隔天晚上拆完以前）；先睡又拆完、或當晚拆完＝不見',V({})==='onbed'&&V({E01_NIGHT:'sleep'})==='foot'&&V({E01_NIGHT:'sleep',E01_BOXES:true})==='none'&&V({E01_NIGHT:'unpack'})==='none');
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const build=G=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.dorm.build(E); delete global.GAME; return z; };
{ const z=build({stage:'econ',flags:{},day:-15}); const g=z.group.getObjectByName('v0_dorm_props'); check('3. 經濟系：房間裡有 v0_dorm_props（dyn，不參加合併）、setV0Box、目前狀態＝床上',!!g&&g.userData.dyn===true&&typeof z.setV0Box==='function'&&z.v0Box==='onbed');
  const z2=build({stage:'law',flags:{},day:20}); check('3. 法律系（203）：沒有這些小物件；setV0Box 是空函式',!z2.group.getObjectByName('v0_dorm_props')&&typeof z2.setV0Box==='function'); }
  { const pv=z=>(z.wins||[]).map(w=>w.userData&&w.userData.pview).filter(Boolean); const ze=build({stage:'econ',flags:{},day:-15}), zl=build({stage:'law',flags:{},day:20});
    check('4. 窗景（ART-V0-DORM）：經濟系 412＝dorm_room412、法律系 203＝dorm_room；兩張圖都在',pv(ze).length>0&&pv(ze).every(v=>v==='dorm_room412')&&pv(zl).length>0&&pv(zl).every(v=>v==='dorm_room')&&['day','night'].every(t=>fs.existsSync(path.join(ROOT,'assets/models/env/views/dorm_room412_'+t+'.webp'))),JSON.stringify([pv(ze),pv(zl)])); }
  { const zl=build({stage:'law',flags:{POTHOS:true},day:20}), ze=build({stage:'econ',flags:{},day:-15});
    check('5. 黃金葛（ART-04）：大小規則 0～5→S1、6～19→S2、20～39→S3、40→S4',[0,5,6,19,20,39,40,99].map(Z3.pothosSize).join()==='1,1,2,2,3,3,4,4');
    check('5. 法律系房間有 setPothos；沒拿到（off）不建模型；經濟系不載入',typeof zl.setPothos==='function'&&(zl.setPothos(false,0),!zl.group.getObjectByName('dorm_pothos'))&&(ze.setPothos(true,3),!ze.group.getObjectByName('dorm_pothos')));
    zl.setPothos(true,7); check('5. 拿到了：建 dorm_pothos 群組（dyn，模型載入後放到 L2 書桌）、狀態 S2',!!zl.group.getObjectByName('dorm_pothos')&&zl.pothosState==='S2'&&zl.group.getObjectByName('dorm_pothos').userData.dyn===true);
    check('5. 資產在 manifest、GLB 檔在 repo',!!ASSETS.manifest['bldg.pothos']&&fs.existsSync(path.join(ROOT,ASSETS.manifest['bldg.pothos'].url))); }
{ const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const i1=st.indexOf("v0Box(GM,'onbed')"), i2=st.indexOf("v0Box(GM,'bed')"), i3=st.indexOf("v0Box(GM,'foot')"), i4=st.indexOf("F.E01_NIGHT='unpack'; v0Box(GM,'none')"), i5=st.indexOf("F.E412_MOVEIN=true; if(box) v0Box(GM,'none')");   /* 9/2 晚上：先睡的玩家箱子拆完（AA_208 起和韋綸、唐睿搬進來同一段）*/
  check('4. E01：開場床上 → 22:00 床邊地上 → 先睡推到床尾／拆完不見 → 隔天晚上拆完不見（story3d.js 的順序）',i1>0&&i2>i1&&i3>i2&&i4>i3&&i5>i4); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
