// 美國超市街：擋住玩家的金屬桿（站牌柱、燈桿、號誌桿、公車亭的框）網點透空（US-PATROL-1021）——不需要瀏覽器。
// LAWWW2 10-22 巡場景（佇列 j14，開發分支 c617b2e0）：從社區搭公車來，下車的地方 (−22.6, 12.9)、面向北，鏡頭在後面（南），
//   站牌柱 (−22.6, 14.9) 剛好在鏡頭和人中間——一根直的柱子把人切成兩半。
// 做法：src/us3d.js 的 SEE_MATS（區域 id → 材質名字的規則）：正式模型接上時，outdoorZone 把那些材質標 userData.seeThrough、E.patchSeeThrough
//   （和台灣的電線桿、行道樹同一套 engine3d.js updateSeeThrough）；超市街用 /^usms_vc_metal$/（模型匯出時金屬的純色材質都轉成這一個頂點色材質）。
// 這裡在 Node 建出超市街，正式模型換成假的（每一種材質一個小網格）；另外讀真的 GLB，確認站牌柱的頂點在 usms_vc_metal 裡、
//   下車點往北看的鏡頭線真的穿過站牌柱（重現巡場景看到的）。
// 用法：node tests/us_ms_seethru_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const MATS=['usms_vc_metal','usms_vc','usms_vc_gloss','usms_brick','usms_stucco','usms_asphalt','usms_glass','usms_leaf_tree_a','usms_tree_core','GLOW_usms_lamp'];
function fakeModel(){ const g=new THREE.Group(); for(const n of MATS){ const m=new THREE.MeshStandardMaterial({name:n}); const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),m); me.name=n; g.add(me); } return g; }
let pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.us_market_street'){ const p=Promise.resolve({scene:fakeModel()}); pend.push(p); return p; } return new Promise(()=>{}); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
global.GAME={G:{hour:15,weather:'clear',flags:{},zone:'us_market_street'}};
(async()=>{
  check('有超市街（US_MARKET_STREET 配置）、E.patchSeeThrough',!!Z3.ZONES.us_market_street&&typeof E.patchSeeThrough==='function');
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.us_market_street.build(E); z.def=Z3.ZONES.us_market_street; E.zone=z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) mats[o.material.name]=o.material; });
  check('正式模型接上了（假的模型）',MATS.every(n=>!!mats[n]),Object.keys(mats).length+' 種材質');
  check('金屬桿（usms_vc_metal）網點透空：標了 seeThrough、patch 過 shader',!!(mats.usms_vc_metal&&mats.usms_vc_metal.userData.seeThrough&&mats.usms_vc_metal.userData._st));
  const others=MATS.filter(n=>n!=='usms_vc_metal'&&mats[n]&&mats[n].userData.seeThrough);
  check('其他材質不透空（牆、柏油、玻璃、樹、燈）',others.length===0,others.join('、'));
  /* 真的 GLB：站牌柱在 usms_vc_metal 裡；下車點往北的鏡頭線穿過站牌柱 */
  const L=US_MARKET_STREET_LAYOUT, bs=L.props.find(p=>p.type==='bus_sign'), sp=L.spawn_bus;
  const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_market_street.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const names=j.materials.map(m=>m.name); let near=0;
  for(const nd of j.nodes){ if(nd.mesh==null) continue; for(const pr of j.meshes[nd.mesh].primitives){ if(names[pr.material]!=='usms_vc_metal') continue; const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
    for(let k=0;k<a.count;k++){ const x=bin.readFloatLE(o+k*st), y=bin.readFloatLE(o+k*st+4), zz=bin.readFloatLE(o+k*st+8); if(Math.hypot(x-bs.x,zz-bs.z)<0.12&&y>-0.01&&y<3.05) near++; } } }
  check(`GLB：站牌柱 (${bs.x}, ${bs.z}) 的頂點在 usms_vc_metal 裡`,near>=16,near+' 個頂點');
  const tgt=new THREE.Vector3(sp.x,1.45,sp.z), cam=new THREE.Vector3(); E.followCam(tgt,0,0.38,z.def.camDist||6.0,0,cam);   /* 鏡頭在南（+z，站在人的後面：下車面向北）*/
  const t=(bs.z-tgt.z)/(cam.z-tgt.z), x=tgt.x+(cam.x-tgt.x)*t, y=tgt.y+(cam.y-tgt.y)*t;
  check(`下車點 (${sp.x}, ${sp.z})・鏡頭在南（人的後面）：鏡頭線穿過站牌柱（巡場景看到的）`,t>0&&t<1&&Math.abs(x-bs.x)<0.15&&y<3.0,`穿過 z ${bs.z} 時 x ${x.toFixed(2)}、高 ${y.toFixed(2)} m`);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
