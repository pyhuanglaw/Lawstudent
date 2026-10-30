// 霖澤館大廳的光照貼圖（LINZE-LOBBY-V2-1028，LAWWW2-C 2026-10-28；不需要瀏覽器）：
//   1. 正式模型（assets/models/env/linze_interior.glb）的內容：場景 extras.lightmap 指到的兩張貼圖在 repo 裡、L0_root／L1_root 在、地板和牆有第二套 UV（TEXCOORD_1）、發光的燈面沒有（照舊即時光）。
//   2. src/building3d.js 的 attachFormal 接光照貼圖（Z3.roomLightmap）：用假的 GLB（ASSETS.loadOne 換掉）走遊戲真正的 B3.linze 建區域流程——
//      有第二套 UV 的材質接 lightMap、外牆的材質是複製以後才接（clone 不會帶 onBeforeCompile）、天花板不再加 TK.bounce（亮度已經烘焙進去）、
//      沒有第二套 UV 的不動、zone.update 照時段換白天／晚上那張（12 點 0、20 點 1、17:48 一半）。
//   3. 沒有 extras.lightmap 的 GLB（萬才館室內也走 attachFormal）：照舊——天花板 TK.bounce、沒有 lightMap。
//   4. 快取的 GLB 進兩次（LOBBY-REENTRY-1028，BB-C 10-28 10:0x：大廳第二次進去地板沒紋理、沙發長椅不見）：遊戲真正的流程每次 c.scene.clone(true)＝材質共用；
//      第二次接光照貼圖不能再包一層 onBeforeCompile（包兩層＝uniform 宣告兩次、shader 編不過、網格不畫）；第二次進去的 zone.update 照時段改到 shader 用的那一組 uniform。
//      修改前（只拿掉 zones3d.js 的改動，4bd186657）：第 4 段 FAIL 1（lmNight 宣告 2 次）；修改後 ALL PASS。
// 用法：node tests/linze_lightmap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};

// ---- 1. 正式模型的內容（只讀 GLB 的 JSON，不解貼圖）----
const GLB='assets/models/env/linze_interior.glb';
{ const b=fs.readFileSync(path.join(ROOT,GLB)); const jl=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+jl).toString('utf8'));
  const lm=J.scenes&&J.scenes[J.scene|0]&&J.scenes[J.scene|0].extras&&J.scenes[J.scene|0].extras.lightmap;
  check('GLB 場景有 extras.lightmap', !!(lm&&lm.day&&lm.night&&lm.intensity>0), JSON.stringify(lm));
  if(lm) for(const k of ['day','night']) check('光照貼圖檔案在 repo 裡：'+lm[k], fs.existsSync(path.join(ROOT,lm[k])), fs.existsSync(path.join(ROOT,lm[k]))?(fs.statSync(path.join(ROOT,lm[k])).size+' bytes'):'');
  const names=J.nodes.map(n=>n.name);
  check('L0_root、L1_root 在', names.includes('L0_root')&&names.includes('L1_root'));
  const uv1=n=>{ const m=J.meshes[n.mesh]; return m.primitives.every(p=>'TEXCOORD_1' in p.attributes); };
  const node=nm=>J.nodes.find(n=>n.name===nm&&'mesh' in n);
  for(const nm of ['L0_floor','L1_floor','L0_WALL_W','L1_WALL_W','L1_ceiling','L0_granite_step']){ const n=node(nm); check('有第二套 UV：'+nm, !!(n&&uv1(n))); }
  for(const nm of ['L1_light_panel','L0_lz_leaf_dark']){ const n=node(nm); check('沒有第二套 UV（照舊即時光）：'+nm, !!(n&&!uv1(n))); }
  const withUv1=J.nodes.filter(n=>'mesh' in n&&uv1(n)).length; check('有第二套 UV 的網格不少於 40 個', withUv1>=40, withUv1+' 個');
}

// ---- 2.／3. attachFormal 接光照貼圖（假的 GLB，走遊戲真正的建區域流程）----
function fakeGLB(withLM){
  const root=new THREE.Group(); root.name='LinzeInterior';
  if(withLM) root.userData.lightmap={day:'assets/models/env/linze_interior_lm_day.webp',night:'assets/models/env/linze_interior_lm_night.webp',intensity:Math.PI*2};
  const r0=new THREE.Group(); r0.name='L0_root'; const r1=new THREE.Group(); r1.name='L1_root'; root.add(r0); root.add(r1);
  const geo=(uv1)=>{ const g=new THREE.PlaneGeometry(2,2); if(uv1) g.setAttribute('uv1',g.attributes.uv.clone()); return g; };
  const mesh=(name,matName,uv1,parent,ud)=>{ const m=new THREE.Mesh(geo(uv1),new THREE.MeshStandardMaterial({name:matName})); m.name=name; Object.assign(m.userData,ud||{}); parent.add(m); return m; };
  mesh('L0_floor','stone_floor',true,r0); mesh('L0_WALL_W','plaster',true,r0,{dir:[1,0,0]}); mesh('L1_ceiling','ceiling',true,r1); mesh('L1_light_panel','light_panel',false,r1); mesh('L1_floor','stone_floor2',true,r1);
  return root; }
async function build(withLM){
  const orig=ASSETS.loadOne; const root=fakeGLB(withLM);
  ASSETS.loadOne=(k)=>k==='bldg.linze_interior'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.linze.build(E); E.zone=z; await new Promise(r=>setTimeout(r,0)); ASSETS.loadOne=orig; return z; }
const find=(z,nm)=>{ let o=null; z.group.traverse(c=>{ if(!o&&c.name===nm&&c.isMesh) o=c; }); return o; };
(async()=>{
  check('Z3.roomLightmap 有匯出（building3d.js 用）', typeof Z3.roomLightmap==='function');
  { const z=await build(true);
    check('正式模型接上（zone.formal）', z.formal===true);
    check('接光照貼圖的材質數（地板兩個、外牆、天花板＝4）', z.formalInfo&&z.formalInfo.lightmapped===4, JSON.stringify(z.formalInfo));
    const fl=find(z,'L0_floor'), w=find(z,'L0_WALL_W'), c=find(z,'L1_ceiling'), lp=find(z,'L1_light_panel');
    check('地板：lightMap、強度 2π、第二套 UV 的通道', !!(fl&&fl.material.lightMap&&Math.abs(fl.material.lightMapIntensity-Math.PI*2)<1e-6&&fl.material.lightMap.channel===1));
    check('外牆：材質複製過（淡出用）而且接上 lightMap（複製以後才接）', !!(w&&w.material.transparent&&w.material.lightMap&&/roomLM/.test(w.material.customProgramCacheKey())));
    check('天花板：接上 lightMap、沒有另外加 TK.bounce', !!(c&&c.material.lightMap&&!c.material.userData.bounce));
    check('燈面（沒有第二套 UV）：不接', !!(lp&&!lp.material.lightMap));
    // 時段：拿 onBeforeCompile 放進 shader 的 uniform，看 zone.update 照時間改
    const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; fl.material.onBeforeCompile(sh,null);
    check('shader：晚上那張、混合比例、方向光倍率三個 uniform', !!(sh.uniforms.lmNight&&sh.uniforms.lmMix&&sh.uniforms.lmDirK)&&/lmMix/.test(sh.fragmentShader));
    const at=h=>{ z.update(1/30,{hour:h}); return +sh.uniforms.lmMix.value.toFixed(3); };
    check('12:00 用白天那張（0）', at(12)===0, ''+at(12)); check('20:00 用晚上那張（1）', at(20)===1, ''+at(20)); check('17:48 一半', at(17.8)===0.5, ''+at(17.8));
    check('zone.update 照舊更新電梯（原本的 update 有接著呼叫）', (()=>{ let called=false; const u=z.elev.update; z.elev.update=function(dt){ called=true; return u.call(this,dt); }; z.update(1/30,{hour:12}); z.elev.update=u; return called; })());
  }
  /* 4. 快取的 GLB 進兩次：同一個 root（ASSETS 快取），building3d 每次 clone(true) */
  { const root=fakeGLB(true), orig=ASSETS.loadOne; ASSETS.loadOne=(k)=>k==='bldg.linze_interior'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
    const enter=async()=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.linze.build(E); E.zone=z; await new Promise(r=>setTimeout(r,0)); return z; };
    const z1=await enter(), z2=await enter(); ASSETS.loadOne=orig;
    const f1=find(z1,'L0_floor'), f2=find(z2,'L0_floor'), shared=!!(f1&&f2&&f1.material===f2.material);
    const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; if(f2) f2.material.onBeforeCompile(sh,null);
    const decl=(sh.fragmentShader.match(/uniform sampler2D lmNight/g)||[]).length;
    check('4. 快取的 GLB 進兩次：地板材質共用（clone(true)）、第二次也接上 lightMap', shared&&!!f2.material.lightMap&&z2.formalInfo&&z2.formalInfo.lightmapped===4, JSON.stringify({shared,lm:z2.formalInfo&&z2.formalInfo.lightmapped}));
    check('4. 第二次進去 onBeforeCompile 只包一層：lmNight 只宣告一次（兩次＝shader 編不過、網格不畫）', decl===1, decl+' 次');
    z2.update(1/30,{hour:20.5}); const n=sh.uniforms.lmMix&&sh.uniforms.lmMix.value; z2.update(1/30,{hour:12}); const d=sh.uniforms.lmMix&&sh.uniforms.lmMix.value;
    check('4. 第二次進去的 zone.update 照時段改到 shader 用的那一組（20:30＝1、12:00＝0）', n===1&&d===0, JSON.stringify({n,d}));
  }
  { const z=await build(false);
    const c=find(z,'L1_ceiling'), fl=find(z,'L0_floor');
    check('沒有 extras.lightmap：天花板照舊 TK.bounce', !!(c&&c.material.userData.bounce));
    check('沒有 extras.lightmap：地板沒有 lightMap、formalInfo 沒有 lightmapped', !!(fl&&!fl.material.lightMap&&z.formalInfo&&z.formalInfo.lightmapped===undefined));
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
