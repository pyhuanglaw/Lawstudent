// 洋洋鹹酥雞、轉角唱片的窗外補上公館街景（LAWWW2-B 11-07；LAWWW-B 15:35「兩間的 GLB 都沒有窗外的景（view card），從店裡看玻璃外面是空的，烘的時候順便看要不要補一張（照 afar 的做法）」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js、zones3d.js、兩間的配置和正式模型，建出真正的區域：
//   ① 每間的白天、晚上照片都在，長寬比＝窗景卡 16 × 6.5 m
//   ② 模型裡有窗景卡：名字有 VIEW、在店面玻璃外 2.5 m（照 afar）、寬 16 m、跟著前牆淡出（extras.dir 0,0,−1）、沒有第二套 UV（不吃光照貼圖）
//   ③ 白天（14:00）：窗景卡換成白天那一張、不調暗
//   ④ 晚上（21:00）：換成晚上那一張、不調暗；回到白天換回來
// 修改前（開發分支 03e92c411）：① ② ③ ④ FAIL（沒有照片、模型沒有窗景卡）。用法：node tests/gg_views_1107_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/yangyang_layout.js','src/data/corner_layout.js','src/data/lane118_layout.js','src/zones3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, A='assets/models/env/second_ai/bb_support/';
const SHOPS=[{zone:'yangyang',key:'bldg.yangyang_interior',img:'yangyang',glb:'yangyang_interior',front:5.5},{zone:'corner_records',key:'bldg.corner_interior',img:'corner',glb:'corner',front:5.75}];
const webpSize=f=>{ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16); if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } return null; };
(async()=>{
  for(const s of SHOPS){ const fs2=['day','night'].map(t=>path.join(ROOT,A+s.img+'_view_'+t+'.webp')), sz=fs2.map(f=>fs.existsSync(f)?webpSize(f):null);
    check('① '+s.img+'：白天、晚上兩張都在、長寬比≈'+(16/6.5).toFixed(2), sz.every(q=>q&&Math.abs(q[0]/q[1]-16/6.5)<0.03), JSON.stringify(sz));
    const p=path.join(ROOT,A+s.glb+'.glb'), b=fs.readFileSync(p), J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8'));
    const cards=J.nodes.filter(n=>/VIEW/.test(n.name||'')&&n.mesh!=null), c=cards[0];
    const pr=c&&J.meshes[c.mesh].primitives[0], a=pr&&J.accessors[pr.attributes.POSITION];
    check('② '+s.img+'：模型裡有窗景卡、在玻璃外 2.5 m、寬 16 m、跟著前牆淡出、沒有第二套 UV',
      !!c&&/^WALL_front_VIEW_/.test(c.name)&&Math.abs(a.min[2]-(s.front+2.5))<0.05&&Math.abs(a.max[0]-a.min[0]-16)<0.05&&JSON.stringify((c.extras||{}).dir)==='[0,0,-1]'&&pr.attributes.TEXCOORD_1==null,
      c?c.name+' z '+a.min[2].toFixed(2)+' 寬 '+(a.max[0]-a.min[0]).toFixed(2)+' dir '+JSON.stringify((c.extras||{}).dir):'沒有窗景卡'); }
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const s of SHOPS){ const m=MAN[s.key]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const build=async id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
    let mat=null; for(let i=0;i<80&&!mat;i++){ await sleep(100); z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) for(const m of [].concat(o.material)) mat=mat||m; }); } return {z,mat}; };
  const src=m=>(m&&m.map&&m.map.userData&&m.map.userData.url)||'';   /* zones3d.js 換上的照片在 texture.userData.url 記網址 */
  for(const s of SHOPS){
    if(!Z3.ZONES[s.zone]){ check(s.img+' 的區域在', false); continue; }
    global.GAME={G:{zone:s.zone,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
    const {z,mat}=await build(s.zone);
    if(!mat||!z.applyTime){ check('③ '+s.img+' 的窗景卡接上了', false, mat?'沒有 applyTime':'區域裡沒有窗景卡'); continue; }
    z.applyTime(14,'clear'); const d=src(mat);
    check('③ '+s.img+' 白天：換成 '+s.img+'_view_day.webp、不調暗', new RegExp(s.img+'_view_day\\.webp$').test(d)&&mat.color.r===1, d+' color '+mat.color.r);
    z.applyTime(21,'clear'); const n=src(mat);
    check('④ '+s.img+' 晚上：換成 '+s.img+'_view_night.webp、不調暗', new RegExp(s.img+'_view_night\\.webp$').test(n)&&mat.color.r===1, n+' color '+mat.color.r);
    z.applyTime(14,'clear'); check('④ '+s.img+' 回到白天換回白天那一張', new RegExp(s.img+'_view_day\\.webp$').test(src(mat)), src(mat));
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
