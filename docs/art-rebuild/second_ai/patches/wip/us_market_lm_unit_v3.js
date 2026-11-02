// 美國草原超市（us_market）正式模型的光照貼圖＋窗景照時段變暗（INTERIOR-AAA-REVIEW-1028，LAWWW2 帳號 A 2026-11-02）——不需要瀏覽器。
// us3d.js 的 us_market 區域沒有走 attachRoomGLB（正式模型沒有會淡出的牆），光照貼圖另外用 Z3.roomLightmap 接。這支檢查：
//   ①extras.lightmap 的白天、晚上兩張都在
//   ②地板、天花板（鋼承板）、牆有第二套 UV（TEXCOORD_1）：沒有的話吃不到光照貼圖
//   ③商品、價格條、層板、水果、桁架、風管、發光面、冷藏櫃內層板、收銀台檯面不烘（--nolm／--hide）：沒有第二套 UV，照舊即時光
//   ④（實際建區域）載入正式模型以後真的接上光照貼圖：用 GLB 根節點 userData.lightmap 的那一份；車道號碼牌（paintPlate 換成自己的材質）也跟著晚上變暗
//   ⑤（實際建區域）窗景 usm_outside_view 照時段變暗（viewTint）、不算在整天都亮的燈裡——原本晚上 20:30 窗外停車場還是白天
//   ⑥GLB 裡只有 usm_outside_view 用 GLOW_usm_outside（別的東西用到同一個材質的話，⑤會連它一起調暗）
// ④⑤ 在 Node 照遊戲的程式建出 us_market 區域，正式模型換成一個假的場景（有第二套 UV 的地板、窗景、LED、車道號碼牌，根節點帶 lightmap）：
//   11-02 審查用改壞的程式試過——只比對原始碼文字的舊寫法抓不到（呼叫寫在 if(false) 裡、窗景比對材質名稱而不是節點名稱都照樣 PASS）。
// 用法：node tests/us_market_lm_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/us_market.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
const files=lm?['day','night'].map(k=>lm[k]):[];
check('① 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
const uv1=nm=>{ const nd=j.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; return j.meshes[nd.mesh].primitives.every(p=>p.attributes.TEXCOORD_1!=null); };
const want=['usm_floor','usm_deck','WALL_usm_walls'], got=want.map(k=>[k,uv1(k)]);
check('② 地板、天花板、牆有第二套 UV',got.every(([,v])=>v===true),JSON.stringify(got));
const live=['usm_products','usm_price','usm_shelves','usm_fruit_apple','usm_joists','usm_ducts','GLOW_usm_leds','usm_case_back','usm_checkout_top'].map(k=>[k,uv1(k)]);
check('③ 商品、價格條、層板、水果、桁架、風管、LED 發光面、冷藏櫃內層板、收銀台檯面沒有第二套 UV（照舊即時光）',live.every(([,v])=>v===false),JSON.stringify(live));
{ const users=j.nodes.filter(nd=>nd.mesh!=null&&j.meshes[nd.mesh].primitives.some(p=>p.material!=null&&(j.materials[p.material].name||'')==='GLOW_usm_outside')).map(nd=>nd.name);
  check('⑥ GLB 裡只有 usm_outside_view 用 GLOW_usm_outside',users.length===1&&users[0]==='usm_outside_view',users.join(',')); }

// ---- ④⑤：照遊戲的程式建出區域（同 us_market_cam_unit.js 的做法），正式模型換成假的場景 ----
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'us_market'}};
const SPEC=lm||{day:'assets/models/env/second_ai/us_market_lm_day.webp',night:'assets/models/env/second_ai/us_market_lm_night.webp',intensity:Math.PI*2};   /* 假場景照樣帶 lightmap：程式的部分和 GLB 有沒有烘焙分開檢查 */
function fakeGLB(){ const root=new THREE.Group(); root.userData.lightmap={day:SPEC.day,night:SPEC.night,intensity:SPEC.intensity};
  const mk=(name,mat,withUV1)=>{ const g=new THREE.PlaneGeometry(1,1); if(withUV1) g.setAttribute('uv1',g.attributes.uv.clone()); const m=new THREE.Mesh(g,mat); m.name=name; root.add(m); return m; };
  mk('usm_floor',new THREE.MeshStandardMaterial({name:'usm_floor'}),true);
  mk('usm_outside_view',new THREE.MeshStandardMaterial({name:'GLOW_usm_outside',emissive:new THREE.Color(1,1,1),emissiveIntensity:1}),false);
  mk('GLOW_usm_leds',new THREE.MeshStandardMaterial({name:'GLOW_usm_leds',emissive:new THREE.Color(1,1,1),emissiveIntensity:1}),false);
  mk('PLATE_FACE_lane_1',new THREE.MeshStandardMaterial({name:'usm_price_strip'}),false);
  return {scene:root}; }
const has=k=>!!(ASSETS.manifest&&ASSETS.manifest[k]);
if(!has('bldg.us_market')) ASSETS.manifest['bldg.us_market']={url:REL,type:'building',lazy:true};
let built=null; ASSETS.loadOne=k=>k==='bldg.us_market'?Promise.resolve(fakeGLB()):new Promise(()=>{});
const origClone=THREE.Group.prototype.clone;
(async()=>{
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.us_market.build(E); E.zone=z; built=z;
  for(let k=0;k<20&&!z.formal;k++) await new Promise(r=>setTimeout(r,10));
  const root=z.group.children.find(o=>o.getObjectByName&&o.getObjectByName('usm_floor'));
  const floor=root&&root.getObjectByName('usm_floor'), view=root&&root.getObjectByName('usm_outside_view'), leds=root&&root.getObjectByName('GLOW_usm_leds'), plate=root&&root.getObjectByName('PLATE_FACE_lane_1');
  check('④ 載入正式模型以後地板接上光照貼圖（z.lightmapped>0、地板材質有 lightMap）',!!z.formal&&!!floor&&!!floor.material.lightMap&&(z.lightmapped|0)>0,'formal '+z.formal+'、lightmapped '+z.lightmapped);
  check('④ 用的是 GLB 根節點 userData.lightmap 的那一份（強度一樣）',!!floor&&Math.abs((floor.material.lightMapIntensity||0)-SPEC.intensity)<1e-6,floor&&floor.material.lightMapIntensity);
  const pk=plate&&plate.material.customProgramCacheKey?plate.material.customProgramCacheKey():'';
  check('④ 車道號碼牌（paintPlate 換過的材質）也包了晚上變暗（roomLightmap 在 paintPlate 後面）',/roomRT/.test(pk),pk);
  z.applyTime(14,'clear'); const d=view?view.material.color.getHexString():null;
  z.applyTime(20.5,'clear'); const nt=view?view.material.color.getHexString():null, ledI=leds?leds.material.emissiveIntensity:null;
  check('⑤ 窗景 14:00 原色、20:30 變暗（viewTint）',d==='ffffff'&&!!nt&&nt!=='ffffff',d+' → '+nt);
  check('⑤ LED 發光面照舊整天都亮（20:30 發光強度沒有被調）',ledI!=null&&ledI>0.99,ledI);
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
