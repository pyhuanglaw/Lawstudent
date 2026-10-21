// 溫州街兩點半 Café：正式外觀（cafe_exterior.glb）接上以後，套件的外觀與光暈藏起來，傍晚、晚上也不會再出現——不需要瀏覽器。
// 原本：attachCafeExterior 只把套件的網格、光暈設成看不見；TK.setNight 每次依時段重設光暈（TK.glowSprite）的 visible，
//       傍晚以後套件的光暈又出現，疊在正式外觀上（cafe_glb_integration「套件的 Café 外觀與光暈藏起來」17:30 量到 7 個；LAWWW2 2026-10-21）。
//       溫州街公寓（attachWenzhouModel）早就把藏起來的光暈日夜亮度設成 0，Café 漏了。
// 做法（src/zones3d.js attachCafeExterior）：和 attachWenzhouModel 一樣，藏起來的套件光暈日夜亮度都設成 0。
// 檢查：在 Node 建出溫州街，用一個假的正式外觀接上 Café，白天、傍晚、晚上（TK.setNight 0、0.05、0.5、1）數套件看得到的網格和光暈。
// 用法：node tests/cafe_kit_glow_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
(async()=>{
  /* 假的正式外觀：一個網格（attachCafeExterior 只需要一棵樹）；其他正式模型都不載入（套件外觀照舊） */
  const fake=new THREE.Group(); fake.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({name:'cafe_ext_wall'})));
  let pend=null; ASSETS.loadOne=k=>k==='bldg.cafe_exterior'?(pend=Promise.resolve({scene:fake})):new Promise(()=>{});
  if(!ASSETS.manifest['bldg.cafe_exterior']) ASSETS.manifest['bldg.cafe_exterior']={url:'x.glb',type:'building',lazy:true};
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.wenzhou.build(E); E.zone=z; await pend; await new Promise(r=>setTimeout(r,0));
  const cafe=z.group.children.find(o=>{ const f=o.userData&&o.userData.footprint; return f&&f.w===14&&f.d===13&&Math.abs(o.position.x-55.4)<0.05; });
  check('1. 找到 Café 的套件建築、正式外觀接上了',!!cafe&&!!cafe.userData.formal);
  if(!cafe){ console.log('FAILED'); process.exit(1); }
  const sprites=cafe.children.filter(o=>o.isSprite).length;
  const vis=()=>cafe.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible&&!o.userData.formalGlow).length;
  check('2. 接上的時候，套件的網格和光暈（'+sprites+' 個光暈）都藏起來',sprites>0&&vis()===0,'看得到 '+vis()+' 個');
  const got=[]; for(const k of [0,0.05,0.5,1]){ TK.setNight(k); got.push(vis()); }
  check('3. 白天、傍晚、晚上（TK.setNight 0、0.05、0.5、1）套件的光暈都不會再出現',got.every(n=>n===0),'看得到 '+got.join('、')+' 個');
  console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
