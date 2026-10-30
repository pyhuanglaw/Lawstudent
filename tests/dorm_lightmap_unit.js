// 宿舍房間（玩家的四人房：203／412／312／507／409）的光照貼圖（DORM203-LM-1030，LAWWW2-B 2026-10-30；不需要瀏覽器）。
// 為什麼：宿舍的正式模型原本靠 attachDormInterior 的補光（TK.bounce：牆、地板、木頭、床單加自發光）讓整間亮起來；
//   有光照貼圖以後燈、窗的光和床底下、牆角的暗都已經烘焙進去，再加自發光會整片發白、影子不見。
// 檢查（Z3.attachRoomGLB → Z3.attachDormInterior，和 zones3d.js 的 dorm 區域同一個順序；假的房間）：
//   1. 有光照貼圖：牆、地板、床單接光照貼圖，沒有補光（不是 bounce、emissive 是黑的）。
//   2. 沒有光照貼圖（舊的 GLB）：照舊補光（不影響以前的樣子）。烘焙工具複製給不烘物件的材質（名字後面 _rt：洗手間外牆的斷面）也照舊補光。
//   3. 頂點色的小東西（dorm_items）：自發光一點點（dormVcGlow）照舊；接在原本的 onBeforeCompile 後面、不蓋掉（RT-NIGHT-1028 的 rtK 也包在那裡）。
//   4. 再進一次（快取的 GLB 每次 clone、材質共用）：dorm_items 不會再包一層。
//   6. 熄燈（DORM-SLEEP-VISUAL-1030）：GLB 有 extras.lightmap.dark 時 z.lightsOff(k) 換到熄燈那張、燈管和房間的點光源跟著暗；再進一次不再包一層；沒有 dark 的房間不變。
//   5. 正式模型 assets/models/env/second_ai/dorm_room4.glb（換成這一包以後）：有 extras.lightmap；每一年不一樣的東西（Y203_…、ROOMMATE_KAI、NAMETAG_）
//      沒有第二套 UV（烘焙時不存在：同一張光照貼圖給五個年級用）；地板、牆、床桌組有。舊的 GLB 沒有 extras.lightmap 時這一項略過（不算失敗）。
// 用法：node tests/dorm_lightmap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(typeof k==='string'?(()=>{}):undefined)))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, body:{appendChild(){}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

const SPEC={day:'assets/models/env/second_ai/dorm_room4_lm_day.webp',night:'assets/models/env/second_ai/dorm_room4_lm_night.webp',intensity:Math.PI*2};
const mats=()=>({wall:new THREE.MeshStandardMaterial({name:'dorm_wall'}), floor:new THREE.MeshStandardMaterial({name:'dorm_floor'}), sheet:new THREE.MeshStandardMaterial({name:'seethru_dorm_sheet'}),
  items:new THREE.MeshStandardMaterial({name:'dorm_items',vertexColors:true})});
function room(M,lm){ const r=new THREE.Group(); const withUv1=g=>{ g.setAttribute('uv1',g.attributes.uv.clone()); return g; };
  const w=new THREE.Mesh(withUv1(new THREE.BoxGeometry(0.1,3,7)),M.wall); w.name='WALL_left_wall'; w.userData.dir=[1,0,0]; w.position.x=-2.95; r.add(w);
  const f=new THREE.Mesh(withUv1(new THREE.PlaneGeometry(6,7)),M.floor); f.name='dorm_floor'; r.add(f);
  const s=new THREE.Mesh(withUv1(new THREE.BoxGeometry(1,0.16,2)),M.sheet); s.name='LOFT_L2_sheet'; r.add(s);
  const it=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),M.items); it.name='Y203_YUTING_items'; r.add(it);
  if(lm) r.userData.lightmap=SPEC; return r; }
const attach=root=>{ const z={walls:[]}, g0=new THREE.Group(), fb=new THREE.Group(); g0.add(fb); Z3.attachRoomGLB(z,g0,fb,root); Z3.attachDormInterior(z,g0,root); return z; };
const compile=m=>{ const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n#include <emissivemap_fragment>\n',vertexShader:''}; if(m.onBeforeCompile) m.onBeforeCompile(sh,null); return sh; };
const wallOf=root=>{ let m=null; root.traverse(o=>{ if(o.name==='WALL_left_wall') m=o.material; }); return m; };   /* attachRoomGLB 會複製牆的材質（淡出用）*/
const black=c=>!c||(c.r===0&&c.g===0&&c.b===0);

// 1. 有光照貼圖
const A=mats(), rA=room(A,true); attach(rA); const wA=wallOf(rA);
check('1. 牆、地板、床單接光照貼圖', !!wA.lightMap&&!!A.floor.lightMap&&!!A.sheet.lightMap);
check('1. 不加補光（不是 bounce、emissive 黑的）', !wA.userData.bounce&&!A.floor.userData.bounce&&!A.sheet.userData.bounce&&black(wA.emissive)&&black(A.floor.emissive)&&black(A.sheet.emissive),
  JSON.stringify({wall:!!wA.userData.bounce,floor:!!A.floor.userData.bounce,sheet:!!A.sheet.userData.bounce}));
check('1. 床單照舊是上舖透視（seeThrough）', !!A.sheet.userData.seeThrough);
// 2. 沒有光照貼圖：照舊補光
const Bm=mats(), rB=room(Bm,false); attach(rB); const wB=wallOf(rB);
check('2. 沒有光照貼圖的 GLB：照舊補光', !!wB.userData.bounce&&!!Bm.floor.userData.bounce&&!!Bm.sheet.userData.bounce&&!wB.lightMap);
check('2. 烘焙工具複製給不烘物件的那一份（dorm_wall_rt，洗手間外牆斷面）：照舊補光', (()=>{ const M=mats(), r=room(M,true), rt=new THREE.MeshStandardMaterial({name:'dorm_wall_rt'}); const o=new THREE.Mesh(new THREE.BoxGeometry(2,3,0.1),rt); o.name='dorm_bath_outer'; r.add(o); attach(r); return !!rt.userData.bounce&&!rt.lightMap; })());
// 3. dorm_items：接在原本的後面
const C=mats(); C.items.onBeforeCompile=function(sh){ sh.fragmentShader='uniform float rtK;\n'+sh.fragmentShader; }; C.items.customProgramCacheKey=()=>'rt';
const rC=room(C,true); attach(rC); const sc=compile(C.items);
check('3. 小東西的自發光照舊（dormVcGlow）', /totalEmissiveRadiance \+= vColor\.rgb \* 0\.25/.test(sc.fragmentShader));
check('3. 原本的 onBeforeCompile 沒被蓋掉（rtK 還在）', /uniform float rtK;/.test(sc.fragmentShader));
check('3. 快取鍵兩個都有', /rt/.test(C.items.customProgramCacheKey())&&/dormVcGlow/.test(C.items.customProgramCacheKey()), C.items.customProgramCacheKey());
// 4. 再進一次
const rC2=room(C,true); attach(rC2); const sc2=compile(C.items);
check('4. 再進一次不再包一層', (sc2.fragmentShader.match(/vColor\.rgb \* 0\.25/g)||[]).length===1&&(sc2.fragmentShader.match(/uniform float rtK;/g)||[]).length===1);
// 6. 熄燈（DORM-SLEEP-VISUAL-1030）：GLB 有 extras.lightmap.dark → z.lightsOff(k)
const SPECD=Object.assign({},SPEC,{dark:'assets/models/env/second_ai/dorm_room4_lm_dark.webp'});
const attachG=(root)=>{ const z={walls:[]}, g0=new THREE.Group(), fb=new THREE.Group(); g0.add(fb); const pl=new THREE.PointLight(0xfff0d8,12,8,2); g0.add(pl); z.group=g0; Z3.attachRoomGLB(z,g0,fb,root); Z3.attachDormInterior(z,g0,root); return {z,pl}; };
const D=mats(), tube=new THREE.MeshStandardMaterial({name:'dorm_tube'}); const rD=room(D,false); rD.userData.lightmap=SPECD; const tm=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.4),tube); tm.name='dorm_tubes'; rD.add(tm);
const {z:zD,pl}=attachG(rD); const shD=compile(D.floor);
check('6. 有熄燈那張：z.lightsOff 存在、地板的 shader 三張混合', typeof zD.lightsOff==='function'&&/uniform sampler2D lmDark;/.test(shD.fragmentShader)&&/mix\( mix\( texture2D\( lightMap, vLightMapUv \), texture2D\( lmNight, vLightMapUv \), lmMix \), texture2D\( lmDark, vLightMapUv \), lmOff \)/.test(shD.fragmentShader));
const off=k=>{ if(typeof zD.lightsOff==='function') zD.lightsOff(k); };   /* 沒有 lightsOff（修改前）照樣跑完、判 FAIL */
const t0=tube.emissiveIntensity, p0=pl.intensity; off(1);
check('6. lightsOff(1)：換熄燈那張、燈管不亮、房間的點光源剩一成', shD.uniforms.lmOff&&shD.uniforms.lmOff.value===1&&tube.emissiveIntensity===0&&Math.abs(pl.intensity-p0*0.1)<1e-6, JSON.stringify({off:shD.uniforms.lmOff&&shD.uniforms.lmOff.value,t0,t:tube.emissiveIntensity,p0,p:pl.intensity}));
off(0); check('6. lightsOff(0)：回到原本', !!shD.uniforms.lmOff&&shD.uniforms.lmOff.value===0&&tube.emissiveIntensity===t0&&pl.intensity===p0);
off(1); const rD2=room(D,false); rD2.userData.lightmap=SPECD; const {z:zD2}=attachG(rD2); const shD2=compile(D.floor);
check('6. 再進一次：不再包一層、熄燈回到 0', (shD2.fragmentShader.match(/uniform sampler2D lmDark;/g)||[]).length===1&&!!shD2.uniforms.lmOff&&shD2.uniforms.lmOff.value===0&&typeof zD2.lightsOff==='function');
const N=mats(), rN=room(N,true), {z:zN}=attachG(rN);
check('6. 沒有熄燈那張的房間：沒有 lightsOff、shader 沒有 lmDark', zN.lightsOff===undefined&&!/lmDark/.test(compile(N.floor).fragmentShader));
// 5. 正式模型
const GLB=path.join(ROOT,'assets/models/env/second_ai/dorm_room4.glb');
const buf=fs.readFileSync(GLB), J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
const sceneLm=(J.scenes||[]).some(s=>s.extras&&s.extras.lightmap)||(J.nodes||[]).some(n=>n.extras&&n.extras.lightmap);
if(!sceneLm) console.log('SKIP 5. 正式模型還是沒有光照貼圖的版本（這一包的 dorm_room4.glb 還沒換上）');
else {
  const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>{ par[c]=i; }));
  const chain=i=>{ const a=[]; while(i!=null){ a.push(J.nodes[i].name||''); i=par[i]; } return a; };
  const hasUv1=n=>J.meshes[n.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null);
  const yr=[], base=[]; J.nodes.forEach((n,i)=>{ if(n.mesh==null) return; const c=chain(i); (c.some(s=>/^(Y203_|Y412_|Y312_|Y507_|Y409_|Y205_|ROOMMATE_|NAMETAG_)/.test(s))?yr:base).push({name:n.name,uv1:hasUv1(n)}); });
  const bad=yr.filter(o=>o.uv1).map(o=>o.name);
  check('5. 每一年不一樣的東西沒有第二套 UV（烘焙時不存在）', yr.length>20&&bad.length===0, yr.length+' 個'+(bad.length?'；有的：'+bad.slice(0,5).join('、'):''));
  const need=['dorm_floor','WALL_left_wall','WALL_back_wall','dorm_wood','dorm_frame_white','LOFT_L2_sheet','LOFT_R1_frame','BEDDING_L2_duvet','dorm_bathmat'];
  const miss=need.filter(n=>!base.some(o=>o.name===n&&o.uv1));
  check('5. 地板、牆、床桌組、上舖、被子、腳踏墊有第二套 UV', miss.length===0, miss.length?'沒有：'+miss.join('、'):'');
}
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
