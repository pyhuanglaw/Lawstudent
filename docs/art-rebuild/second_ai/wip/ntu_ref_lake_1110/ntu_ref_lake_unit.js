// 映月湖（醉月湖）照官網照片改（NTU-REF-1110 ③-3，LAWWW2 帳號 A 11-10；X223／D136）——不需要瀏覽器（D131）。
// 官網照片（docs/story_planning/ref_images/buildings/README.md 醉月湖一列）：六角亭、綠色琉璃瓦；湖邊垂柳、紅色木欄杆。原本：深灰瓦頂、木色欄杆、沒有垂柳。
// 檢查：
//   1 GLB：亭子的瓦是綠色琉璃瓦（campus_lake.py 的顏色、光滑：粗糙度 ≤ 0.4）；木棧道的欄杆是紅漆（lake_boardwalk_red）
//   2 GLB：三棵垂柳（樹幹、葉片卡；葉片卡透明裁切 MASK），樹幹都在湖岸裡面（水裡，導航本來就擋住）、離木棧道和湖心亭都 ≥ 3 m
//   3 遊戲（校園＋假的湖模型，走 attachLakeGLB）：垂柳的葉片卡不投影、alphaTest ≥ 0.5、雙面；樹幹、葉片都標了網點透空
// 修改前（開發分支 74da28ca9）：1、2、3 FAIL。用法：node tests/ntu_ref_lake_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{});
const SETS={library:'總圖',admin:'行政大樓',arts:'文學院',hist:'校史館'};
const GF=path.join(ROOT,'assets/models/env/second_ai/campus_lake.glb'), gb=fs.readFileSync(GF), GJ=JSON.parse(gb.slice(20,20+gb.readUInt32LE(12)).toString('utf8'));
const PYL=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/campus_lake.py'),'utf8');
const tile=GJ.materials.find(m=>m.name==='lk_roof_tile'), rough=tile&&tile.pbrMetallicRoughness?(tile.pbrMetallicRoughness.roughnessFactor!=null?tile.pbrMetallicRoughness.roughnessFactor:1):1;
const nodeNames=GJ.nodes.map(n=>n.name||'');
check('1 綠色琉璃瓦（#3f7a4f、粗糙度 ≤ 0.4）、木棧道紅漆欄杆', /'lk_roof_tile',[^\n]*target='#3f7a4f'/.test(PYL)&&rough<=0.4&&nodeNames.includes('lake_boardwalk_red'), '瓦的粗糙度 '+rough+'；欄杆 '+nodeNames.includes('lake_boardwalk_red'));
const info=JSON.parse(fs.readFileSync(GF.replace(/\.glb$/,'.json'),'utf8')), W=info.willows||[], PV=(info.pavilion||{}).center||[-3,0.6], BWd=info.boardwalk||{x:[-4.15,-1.85],z:[2.9,13.4]};
const rad=t=>1+0.10*Math.sin(3*t+0.6)+0.05*Math.cos(5*t+1.3), inside=([x,z])=>{ const t=Math.atan2(z/9.2,x/16.5); const r=Math.hypot(x/16.5,z/9.2); return r<rad(t); };
const dBox=([x,z])=>Math.hypot(Math.max(BWd.x[0]-x,0,x-BWd.x[1]),Math.max(BWd.z[0]-z,0,z-BWd.z[1]));
const leafM=GJ.materials.find(m=>m.name==='lk_willow_leaf');
const okW=W.length===3&&W.every(p=>inside(p)&&dBox(p)>=3&&Math.hypot(p[0]-PV[0],p[1]-PV[1])>=3)&&nodeNames.includes('lake_willow_bark')&&nodeNames.includes('lake_willow_willow')&&!!leafM&&leafM.alphaMode==='MASK';
check('2 三棵垂柳：樹幹在湖岸裡面、離木棧道和湖心亭 ≥ 3 m；葉片卡 MASK', okW, 'willows '+JSON.stringify(W)+'；葉片 '+(leafM?leafM.alphaMode:'沒有'));
function fakeLake(){ const g=new THREE.Group(); for(const nm of ['lake_willow_bark','lake_willow_willow','lake_pavilion_tile','lake_rim_stone']){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm.replace('lake_','lk_')})); me.name=nm; g.add(me); } return g; }
const pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.campus_lake'){ const p=Promise.resolve({scene:fakeLake()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'campus'}};
(async()=>{ const z=Z3.ZONES.campus.build(E); E.zone=z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  let bark=null, leaf=null; z.group.traverse(o=>{ if(o.name==='lake_willow_bark') bark=o; if(o.name==='lake_willow_willow') leaf=o; });
  const ok=!!bark&&!!leaf&&!leaf.castShadow&&leaf.material.alphaTest>=0.5&&leaf.material.side===THREE.DoubleSide&&!!leaf.material.userData.seeThrough&&!!bark.material.userData.seeThrough;
  check('3 遊戲：垂柳葉片不投影、alphaTest ≥ 0.5、雙面；樹幹、葉片網點透空', ok, leaf?`投影 ${leaf.castShadow}、alphaTest ${leaf.material.alphaTest}、雙面 ${leaf.material.side===THREE.DoubleSide}、透空 葉 ${!!leaf.material.userData.seeThrough} 幹 ${!!(bark&&bark.material.userData.seeThrough)}`:'湖的模型沒接上');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
