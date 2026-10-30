// 萬才館室內的光照貼圖（WANCAI-LM-1028，LAWWW2-C 2026-10-28；不需要瀏覽器）：
//   1. 正式模型（assets/models/env/wancai_interior.glb）：場景 extras.lightmap 指到的兩張貼圖在 repo 裡、L0_root／L1_root 在、地板和牆有第二套 UV（TEXCOORD_1）、發光面沒有。
//   2. 萬才館真正的建區域流程（src/wancai3d.js → B3.attachFormal；霖澤館大廳 LINZE-LOBBY-V2-1028 加的接法），ASSETS.loadOne 換成讀這個 GLB 的 JSON 做的假場景：
//      有第二套 UV 的材質接上 lightMap、zone.update 照時段換白天／晚上那張、電梯照舊更新。
//   3. 大廳的擺設（wancai_layout.js 的 prop）擋住導航；出生點、劇情和社團站位照舊站得住。
// 用法：node tests/wancai_lightmap_unit.js
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

// ---- 1. 正式模型的內容（只讀 GLB 的 JSON）----
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/wancai_interior.glb')); const J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
const lm=J.scenes[J.scene|0].extras&&J.scenes[J.scene|0].extras.lightmap;
check('GLB 場景有 extras.lightmap', !!(lm&&lm.day&&lm.night&&lm.intensity>0), JSON.stringify(lm));
if(lm) for(const k of ['day','night']) check('光照貼圖檔案在 repo 裡：'+lm[k], fs.existsSync(path.join(ROOT,lm[k])));
const names=J.nodes.map(n=>n.name); check('L0_root、L1_root 在', names.includes('L0_root')&&names.includes('L1_root'));
const uv1=n=>J.meshes[n.mesh].primitives.every(p=>'TEXCOORD_1' in p.attributes);
const node=nm=>J.nodes.find(n=>n.name===nm&&'mesh' in n);
for(const nm of ['L0_floor','L1_ceiling','L0_wc_step']){ const n=node(nm); check('有第二套 UV：'+nm, !!(n&&uv1(n))); }
const l1floor=J.nodes.find(n=>'mesh' in n&&/^L1_wc_terrazzo/.test(n.name||'')); check('有第二套 UV：二樓地板（'+(l1floor&&l1floor.name)+'）', !!(l1floor&&uv1(l1floor)));
for(const nm of ['L0_wc_light_panel','L1_wc_light_panel']){ const n=node(nm); if(n) check('沒有第二套 UV（照舊即時光）：'+nm, !uv1(n)); }
const withUv1=J.nodes.filter(n=>'mesh' in n&&uv1(n)).length; check('有第二套 UV 的網格不少於 40 個', withUv1>=40, withUv1+' 個');

// ---- 2. 萬才館真正的建區域流程（假場景：照 GLB 的節點名、材質名、有沒有第二套 UV 做，幾何是小平面）----
function fakeFromGLB(){
  const root=new THREE.Group(); root.name=J.scenes[J.scene|0].name||'scene'; if(lm) root.userData.lightmap=Object.assign({},lm);
  const build=(i,parent)=>{ const n=J.nodes[i]; let o;
    if('mesh' in n){ const prim=J.meshes[n.mesh].primitives[0]; const g=new THREE.PlaneGeometry(1,1); if('TEXCOORD_1' in prim.attributes) g.setAttribute('uv1',g.attributes.uv.clone());
      o=new THREE.Mesh(g,new THREE.MeshStandardMaterial({name:J.materials[prim.material].name})); }
    else o=new THREE.Group();
    o.name=n.name||''; Object.assign(o.userData,n.extras||{}); parent.add(o); for(const c of n.children||[]) build(c,o); };
  for(const i of J.scenes[J.scene|0].nodes) build(i,root); return root; }
(async()=>{
  const orig=ASSETS.loadOne; const root=fakeFromGLB();
  ASSETS.loadOne=(k)=>k==='bldg.wancai_interior'?Promise.resolve({scene:root}):orig.call(ASSETS,k);
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.wancai.build(E); E.zone=z; await new Promise(r=>setTimeout(r,0)); ASSETS.loadOne=orig;
  check('正式模型接上（zone.formal）', z.formal===true);
  const nmat=z.formalInfo&&z.formalInfo.lightmapped; check('接光照貼圖的材質不少於 15 個', nmat>=15, JSON.stringify(z.formalInfo));
  let fl=null; z.group.traverse(o=>{ if(!fl&&o.isMesh&&o.name==='L0_floor') fl=o; });
  check('一樓地板：lightMap、強度 2π', !!(fl&&fl.material.lightMap&&Math.abs(fl.material.lightMapIntensity-Math.PI*2)<1e-6));
  const sh={uniforms:{},fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_maps>\n'}; fl.material.onBeforeCompile(sh,null);
  const at=h=>{ z.update(1/30,{hour:h}); return +sh.uniforms.lmMix.value.toFixed(3); };
  check('12:00 白天那張、20:00 晚上那張', at(12)===0&&at(20)===1, at(12)+'/'+at(20));
  check('電梯照舊更新', (()=>{ let called=false; const u=z.elev.update; z.elev.update=function(dt){ called=true; return u.call(this,dt); }; z.update(1/30,{hour:12}); z.elev.update=u; return called; })());
  const props=WANCAI_LAYOUT.furniture.filter(f=>f.type==='prop'), n0=z.levels[0], stuck=props.filter(f=>{ const c=f.nav||[f.x,f.z]; return n0.free(c[0],c[1]); });
  check('大廳的擺設擋住導航（wancai3d.js 的 prop：展示櫃、飲水機、回收桶、傘架、小圓桌）', props.length>=6&&stuck.length===0, props.length+' 筆'+(stuck.length?'；站得上去的：'+stuck.map(f=>f.kind+'('+f.x+','+f.z+')').join('、'):''));
  const spots=[[0,5],[0,6],[2.6,-4.5],[-1.5,-2.5],[3,3.6],[-3,3.6],[-6,0.5],[6,0.5],[0,4.6]], bad=spots.filter(([x,y])=>!n0.free(x,y));
  check('出生點、劇情和社團站位照舊站得住', bad.length===0, bad.length?JSON.stringify(bad):spots.length+' 個');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
