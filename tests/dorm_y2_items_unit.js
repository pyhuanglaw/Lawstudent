// 大二房間拆箱的物件（主線 3；dorm_y2_items.glb，LAWWW2-C 899f9bcd，AA_208 7-1）——不需要瀏覽器。
// 檢查：GLB 節點與 manifest；312 才放、紙箱那一塊擋導航（座位照樣走得到）；搬進來那一刻就是 312；傳單釘在軟木板上；拆箱一件一件出現、拆完換壓平的紙箱。用法：node tests/dorm_y2_items_unit.js
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
const glb=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/dorm_y2_items.glb')); const J=JSON.parse(glb.slice(20,20+glb.readUInt32LE(12)).toString()); const NN=J.nodes.map(n=>n.name);
const ITEMS=['film','pick','civ','report','noodle','duty','green','sticky','y1_ferris','y1_album'];
check('1. GLB 有軟木板 WALL_left_Y2_BOARD、ITEM_（'+ITEMS.join('、')+'）、Y2_BOXES_CLOSED／OPEN；manifest bldg.dorm_y2_items（lazy）',NN.includes('WALL_left_Y2_BOARD')&&ITEMS.every(k=>NN.includes('ITEM_'+k))&&NN.includes('Y2_BOXES_CLOSED')&&NN.includes('Y2_BOXES_OPEN')&&!!ASSETS.manifest['bldg.dorm_y2_items']&&ASSETS.manifest['bldg.dorm_y2_items'].lazy===true,ITEMS.filter(k=>!NN.includes('ITEM_'+k)).join(' '));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const build=G=>{ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.dorm.build(E); delete global.GAME; return z; };
const BOX=[(-1.80-1.12)/2,(-0.88-0.36)/2];
{ const z0=build({stage:'law',flags:{},day:300}), z2=build({stage:'law',flags:{ROOM_Y2:365},day:370}), zm=build({stage:'law',flags:{ROOM_Y2_MOVING:true},day:365}), z3=build({stage:'law',flags:{ROOM_Y2:365,ROOM_Y3:700},day:720});
  check('2. 大一 203：紙箱那一塊走得到；大二 312（拆完或搬進來那一刻）擋住；大三 507 也擋（1A-03：大二的東西、紙箱帶到 507）',z0.nav.free(BOX[0],BOX[1])&&!z2.nav.free(BOX[0],BOX[1])&&!zm.nav.free(BOX[0],BOX[1])&&!z3.nav.free(BOX[0],BOX[1]));
  const U=DORM_ROOM.units.find(u=>u.id==='L2'); check('2. 312：祐廷的座位走得到（座位前的點沒被紙箱擋）',z2.nav.free(U.seat_approach[0],U.seat_approach[1]));
  const pv=z=>(z.wins||[]).map(w=>w.userData&&w.userData.pview).filter(Boolean);
  check('3. 搬進來那一刻（ROOM_Y2_MOVING）：房間已經是 312（窗景 dorm_room312、擺設 312）',zm.dormSetKey==='312'&&pv(zm).length>0&&pv(zm).every(v=>v==='dorm_room312'),zm.dormSetKey+' '+pv(zm).join());
  const fl=z=>z.group.getObjectByName('dorm_flyer'); const fs0=U.wall_spot_by_desk;
  check('4. 社團傳單：312 往房間多 2 cm（釘在軟木板上），203 照舊貼牆',!!fl(z2)&&Math.abs(fl(z2).position.x-(fs0.x+0.02))<1e-6&&Math.abs(fl(z0).position.x-fs0.x)<1e-6); }
{ const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), hm=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8'), zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  const a=st.indexOf('S.roomY2InDorm=async'), b=st.indexOf('S.unboxY2=async');
  check('5. 兩條搬家的路（宿舍、家裡）都在進房間之前設 ROOM_Y2_MOVING',/G\.flags\.ROOM_Y2_MOVING=true; if\(GM\.enter\)/.test(st.slice(a,b))&&/G\.flags\.ROOM_Y2_MOVING=true; if\(GM\.enter\)/.test(hm));
  const u=st.slice(b,st.indexOf('async function roomItems'));
  check('5. 拆箱：先封好的紙箱、拿一件出現一件（ROOM_Y2_ITEMS）、拆完換壓平的紙箱、清掉 ROOM_Y2_MOVING',/F\.ROOM_Y2_ITEMS=shown/.test(u)&&/vis\(\{shown:\[\],boxes:'closed'\}\)/.test(u)&&/shown\.push\(r\[0\]\); vis\(\{shown:shown\.slice\(\)\}\)/.test(u)&&/delete F\.ROOM_Y2_MOVING; vis\(\{boxes:'open'\}\)/.test(u));
  check('5. 大一的摩天輪票根 y1_3、河堤相簿 y1_4 對到 ITEM_y1_ferris、ITEM_y1_album（ROOM_ITEMS 的順序）',/y1_3'\?'ITEM_y1_ferris'/.test(zs)&&/y1_4'\?'ITEM_y1_album'/.test(zs)&&/摩天輪的票根/.test(JSON.stringify(st.match(/const ROOM_ITEMS=\[.*\];/)[0].split('],[')[3]))&&/河堤/.test(st.match(/const ROOM_ITEMS=\[.*\];/)[0].split('],[')[4])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
