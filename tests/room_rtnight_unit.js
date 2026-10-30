// 有光照貼圖的房間晚上：沒有第二套 UV 的東西跟著暗、只在白天發光的材質（天窗）晚上不亮（RT-NIGHT-1028，LAWWW2-C 2026-10-28；不需要瀏覽器）。
// 為什麼：晚上那張光照貼圖比白天暗很多（只剩燈），沒烘焙的細小零件、頂點色的小東西照舊吃即時光（半球光只從 1.2 降到 0.95），晚上比旁邊亮 2～3 倍。
// 檢查（Z3.roomLightmap，src/zones3d.js；假的房間：有第二套 UV 的地板、沒有的小東西、會發光的燈罩）：
//   1. 地板接光照貼圖；小東西沒接光照貼圖，shader 在半球光、方向光後面乘 rtK；燈罩（emissive）不動。
//   2. rtK：12:00＝1、20:00＝晚上的值（Node 讀不到貼圖像素：RT_NIGHT_DEF 0.55）、17:48（換貼圖的中間）在兩者之間。
//   3. 同一批材質再進一次（快取的 GLB 每次 clone，材質共用）：不再包一層（rtK 只宣告一次），兩次的 rtK 都照時段。
//   4. 回傳值（接光照貼圖的材質數）不把小東西算進去。
//   5. 只在白天發光的材質（GLB 的 extras.lightmap.dayEmit；總圖大廳的天窗，烘焙時只有白天那一張發光）：12:00 照原本亮、20:00 發光降到 4%、顏色換成暗的夜空；
//      再進一次不會越乘越暗；不包 rtK；GLB 沒寫 dayEmit 的（之前交的房間）晚上照舊亮。
// 用法：node tests/room_rtnight_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

const floorM=new THREE.MeshStandardMaterial({name:'floor'}), propM=new THREE.MeshStandardMaterial({name:'prop_vc'}), lampM=new THREE.MeshStandardMaterial({name:'lampshade',emissive:new THREE.Color(1,0.9,0.7),emissiveIntensity:1.2});
function room(){ const r=new THREE.Group(); const g=new THREE.PlaneGeometry(4,4); g.setAttribute('uv1',g.attributes.uv.clone());
  r.add(new THREE.Mesh(g,floorM)); r.add(new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3),propM)); r.add(new THREE.Mesh(new THREE.SphereGeometry(0.2),lampM)); return r; }
const SPEC={day:'assets/models/env/classroom_201_lm_day.webp',night:'assets/models/env/classroom_201_lm_night.webp',intensity:Math.PI*2};
const compile=m=>{ const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n#include <lights_fragment_end>\n'}; m.onBeforeCompile(sh,null); return sh; };

const z1={}; const n1=Z3.roomLightmap(z1,room(),SPEC);
check('1. 地板接光照貼圖', !!floorM.lightMap);
check('1. 小東西沒有光照貼圖', !propM.lightMap);
const sp=compile(propM);
check('1. 小東西的 shader：rtK 乘在半球光、方向光後面', /lights_fragment_maps>\nirradiance \*= rtK; reflectedLight\.directDiffuse \*= rtK; reflectedLight\.directSpecular \*= rtK;/.test(sp.fragmentShader)&&!!sp.uniforms.rtK, sp.fragmentShader.split('\n').slice(0,4).join(' | '));
check('1. 燈罩（emissive）不動', !lampM.onBeforeCompile||!/rtK/.test(compile(lampM).fragmentShader));
check('1. 地板的 shader 沒有 rtK（光照貼圖本身就有晚上那張）', !/rtK/.test(compile(floorM).fragmentShader));
const at=(z,h)=>{ z.update(1/30,{hour:h}); return sp.uniforms.rtK?+sp.uniforms.rtK.value.toFixed(3):NaN; };
const d=at(z1,12), n=at(z1,20), m=at(z1,17.8);
check('2. rtK：12:00＝1、20:00＝晚上的值、17:48 在中間', d===1&&Math.abs(n-z1.rtNight)<1e-3&&n<1&&m<1&&m>n, JSON.stringify({d,n,m,rtNight:z1.rtNight}));
check('4. 回傳的接光照貼圖材質數只算地板', n1===1&&z1.lightmapped===1&&z1.rtWired===1, JSON.stringify({n1,lightmapped:z1.lightmapped,rtWired:z1.rtWired}));

const z2={}; Z3.roomLightmap(z2,room(),SPEC); const sp2=compile(propM);
check('3. 再進一次不再包一層（rtK 只宣告一次）', (sp2.fragmentShader.match(/uniform float rtK;/g)||[]).length===1&&(sp2.fragmentShader.match(/irradiance \*= rtK/g)||[]).length===1);
const rk=()=>sp2.uniforms.rtK?sp2.uniforms.rtK.value:NaN;
z2.update(1/30,{hour:20}); check('3. 第二次進去，晚上照樣暗', rk()<1, String(rk()));
z2.update(1/30,{hour:12}); check('3. 第二次進去，白天回到 1', rk()===1);
const skyM=new THREE.MeshStandardMaterial({name:'lb_skylight',color:new THREE.Color(0.9,0.94,0.97),emissive:new THREE.Color(0.91,0.95,0.97),emissiveIntensity:1});
function room2(){ const r=room(); r.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),skyM)); return r; }
const SPEC2=Object.assign({},SPEC,{dayEmit:['lb_skylight']}), lum=c=>c.r+c.g+c.b;
const z3={}; Z3.roomLightmap(z3,room2(),SPEC2);
z3.update(1/30,{hour:12}); const dI=skyM.emissiveIntensity, dC=lum(skyM.color);
z3.update(1/30,{hour:20}); const nI=skyM.emissiveIntensity, nC=lum(skyM.color);
check('5. 天窗：12:00 照原本亮、20:00 發光 4%、顏色變暗', Math.abs(dI-1)<1e-6&&Math.abs(nI-0.04)<1e-6&&dC>2.5&&nC<0.3, JSON.stringify({dI,nI:+nI.toFixed(3),dC:+dC.toFixed(2),nC:+nC.toFixed(2),dayEmit:z3.dayEmit}));
check('5. 天窗不包 rtK、z.dayEmit＝1', !/rtK/.test(compile(skyM).fragmentShader||'')&&z3.dayEmit===1);
const z4={}; Z3.roomLightmap(z4,room2(),SPEC2); z4.update(1/30,{hour:20}); z4.update(1/30,{hour:12});
check('5. 晚上離開、再進去：白天回到原本的亮度（不會越乘越暗）', Math.abs(skyM.emissiveIntensity-1)<1e-6&&Math.abs(lum(skyM.color)-dC)<1e-6, String(skyM.emissiveIntensity));
const skyO=new THREE.MeshStandardMaterial({name:'lb_skylight_old',emissive:new THREE.Color(1,1,1),emissiveIntensity:1}), r5=room(); r5.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),skyO));
const z5={}; Z3.roomLightmap(z5,r5,SPEC); z5.update(1/30,{hour:20});
check('5. GLB 沒寫 dayEmit：晚上照舊亮（之前交的房間不受影響）', skyO.emissiveIntensity===1&&z5.dayEmit===0);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
