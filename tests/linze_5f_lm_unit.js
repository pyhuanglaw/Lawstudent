// 霖澤館 5F 的光照烘焙（INTERIOR-AAA-REVIEW-1028 P1；LAWWW2-B 2026-11-07；tools/blender/env_second/lightbake/bake_linze_5f.sh）——不需要瀏覽器。
//   1. GLB 有 extras.lightmap：白天、晚上、全關（dark）三張的檔都在
//   2. 地板、天花板、牆、腰牆、收邊條有第二套 UV（烘焙）；燈管、研究室的燈和檯燈（LAB_）、「口試中」牌、頂點色的小東西、金屬、螢幕、玻璃、木條沒有（照舊即時光）
//   3. 沒有材質同時給「有第二套 UV」和「沒有」的網格用（遊戲把光照貼圖接在材質上）
//   4. 淡出的牆節點、LAB_tubes、LAB_SIS_LAMP、WALL_P3_EXAM_SIGN 都在（linze_upper3d.js 照名字開關）
//   5. 研究室的燈（LZUP.labLights）：不是全開（'sis'／'off'）→ z.lightsOff(1)（換到全關那一張）；全開 → z.lightsOff(0)；
//      學姊的檯燈在 lightsOff 之後才設（roomDarkMap 會把區域的點光源調暗）：'sis' 2.6、'all' 0.6、'off' 0；沒有 lightsOff 的舊 GLB 不出錯
// 修改前：GLB 沒有 extras.lightmap（第 1 項失敗）；linze_upper3d.js 沒叫 lightsOff（第 5 項失敗）。用法：node tests/linze_5f_lm_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/linze_5f.glb')), J=JSON.parse(buf.slice(20,20+buf.readUInt32LE(12)).toString('utf8'));
const l=((J.scenes[0].extras||{}).lightmap)||null;
check('1. extras.lightmap 白天、晚上、全關的貼圖都在', !!l&&exists(l.day)&&exists(l.night)&&exists(l.dark)&&l.intensity>0, l?[l.day,l.night,l.dark].join('、'):'沒有');
if(l){ const ms=J.nodes.filter(n=>n.mesh!=null).map(n=>({name:n.name, prims:J.meshes[n.mesh].primitives.map(p=>({uv1:p.attributes.TEXCOORD_1!=null, mat:p.material!=null?J.materials[p.material].name:null}))}));
  const BAKE=/^(linze_5f_(floorm|ceiling)|WALL_[NESW]_(wall|wain|trim)|WALL_P\d_(wall|wain))$/, LIVE=/(_tubes|^LAB_|EXAM_SIGN|_props|_metal|_steel|_screens|glass|_slat|fridgelight)/;
  const bake=ms.filter(m=>BAKE.test(m.name)), noUV=bake.filter(m=>!m.prims.every(p=>p.uv1)).map(m=>m.name);
  check('2. 地板、天花板、牆、腰牆、收邊條有第二套 UV（'+bake.length+' 個）', bake.length>=12&&!noUV.length, noUV.join('、'));
  const live=ms.filter(m=>LIVE.test(m.name)), bad=live.filter(m=>m.prims.some(p=>p.uv1)).map(m=>m.name);
  check('2. 燈、LAB_、口試中、小東西、金屬、螢幕、玻璃、木條沒有第二套 UV（'+live.length+' 個）', live.length>=8&&!bad.length, bad.join('、'));
  const w=new Set(), wo=new Set(); for(const m of ms) for(const p of m.prims) (p.uv1?w:wo).add(p.mat); const both=[...w].filter(x=>wo.has(x));
  check('3. 沒有材質同時給有／沒有第二套 UV 的網格', !both.length, both.join('、'));
  const names=new Set(J.nodes.map(n=>n.name)), miss=['WALL_N_wall','WALL_E_wall','WALL_S_wall','WALL_W_wall','LAB_tubes','LAB_SIS_LAMP','WALL_P3_EXAM_SIGN'].filter(n=>!names.has(n));
  check('4. 淡出的牆節點、LAB_tubes、LAB_SIS_LAMP、WALL_P3_EXAM_SIGN 都在', !miss.length, miss.join('、')); }
// 5. linze_upper3d.js 的 apply5（區域建起來：假的 THREE、Z3.room，和 tests/linze_5f_unit.js 同一套）
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0}}) }; global.STORY={ extraSpec:i=>({i}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|LINZE_LAYOUT|LINZE_UPPER_LAYOUTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/linze_layout.js','src/data/linze_upper_layouts.js','src/linze_upper3d.js']) load(f);
const mkV=()=>({x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; },copy(){ return this; },addScaledVector(){ return this; },fromArray(){ return this; },applyMatrix4(){ return this; }});
global.THREE={Group:function(){ this.children=[]; this.add=o=>this.children.push(o); this.remove=()=>{}; this.position=mkV(); this.rotation=mkV(); this.userData={}; },
  Mesh:function(){ this.position=mkV(); this.rotation=mkV(); this.userData={}; }, PlaneGeometry:function(){}, BoxGeometry:function(){}, PointLight:function(c,i){ this.isPointLight=true; this.intensity=i; this.position=mkV(); this.userData={}; }};
global.W3={stoneTex:()=>({})}; global.ASSETS.loadOne=()=>new Promise(()=>{});
global.E3={NavGrid:function(W,D,cs,ox,oz){ this.cs=cs; this.cols=Math.ceil(W/cs); this.rows=Math.ceil(D/cs); this.b=new Uint8Array(this.cols*this.rows); this.blockOutside=()=>{}; this.blockRect=()=>{}; this.cellOf=()=>[0,0]; }};
global.Z3.room=(E,o)=>{ const g=new THREE.Group(); return {group:g,walls:[],winParts:[],onLamps(){},applyTime(){}}; };
const E={interactables:[], applyTime(){}, hour:21, lampsOn:true}; const z=Z3.ZONES.linze_5f.build(E); E.zone=z; global.GAME={E};
const L5=LINZE_UPPER_LAYOUTS['5f'], lp=(L5.spots&&L5.spots.sis_lamp)||{x:-5.85,y:1.15,z:6.15};   /* 學姊的檯燈：配置的 spots.sis_lamp 那一點的點光 */
const pls=[]; const walk=o=>{ if(!o) return; if(o.isPointLight) pls.push(o); for(const c of o.children||[]) walk(c); }; walk(z.group);
const sl=pls.find(o=>Math.abs(o.position.x-lp.x)<1e-6&&Math.abs(o.position.z-lp.z)<1e-6)||null;
check('5. 5F 建起來有學姊檯燈的點光（light5.sl）', !!sl);
if(sl&&typeof LZUP==='object'){
  // 沒有 lightsOff（舊的 GLB、正式模型還沒載好）：照舊不出錯
  let err=null; try{ LZUP.labLights('off'); LZUP.labLights('all'); }catch(e){ err=e.message; }
  check('5. 沒有 z.lightsOff（舊 GLB）時 labLights 不出錯', !err, err||'');
  // 有 lightsOff（roomDarkMap）：記下叫的值；照 roomDarkMap 把點光源調暗（intensity＝i0×(1−0.9k)）
  const calls=[]; z.lightsOff=k=>{ calls.push(k); if(sl.userData.i0==null) sl.userData.i0=sl.intensity; sl.intensity=sl.userData.i0*(1-0.9*k); };
  const run=m=>{ calls.length=0; LZUP.labLights(m); return {k:calls[calls.length-1], sl:sl.intensity}; };
  const a=run('off'), b=run('sis'), c=run('all');
  check("5. 'off' → lightsOff(1)、檯燈 0", a.k===1&&a.sl===0, JSON.stringify(a));
  check("5. 'sis' → lightsOff(1)、檯燈照舊 2.6（lightsOff 之後才設）", b.k===1&&b.sl===2.6, JSON.stringify(b));
  check("5. 'all' → lightsOff(0)、檯燈 0.6", c.k===0&&c.sl===0.6, JSON.stringify(c));
} else check('5. LZUP 在', false);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
