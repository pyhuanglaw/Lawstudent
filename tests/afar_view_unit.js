// afar café 窗外換成公館的街景（AFAR-VIEW-1105，LAWWW2-C 11-05；使用者 08:3x「AFAR看出去不太像公館」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js、zones3d.js、afar 的配置和正式模型 afar.glb，建出真正的 afar 區域：
//   ① 窗景照片兩張都在（afar_view_day.webp、afar_view_night.webp）、長寬比＝窗景卡 16 × 6.5 m（2.46）
//   ② 白天（14:00）：窗景卡（材質 afr_window_view）換成白天那一張、不調暗
//   ③ 晚上（21:00）：換成晚上那一張、不調暗；回到白天換回來
//   ④ 別的店不會換成 afar 的照片（頁間；WINVIEW-AUDIT-1105 起頁間有自己的照片 yejian_view_*，原本這一項是「頁間照舊調暗」）
// 修改前（開發分支 3574b5462）：① ② ③ FAIL（窗景卡是木曜日的樹 mok_view）。用法：node tests/afar_view_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/lane118_layout.js','src/zones3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest;
const DAY='assets/models/env/second_ai/aa_support/afar_view_day.webp', NIGHT='assets/models/env/second_ai/aa_support/afar_view_night.webp';
const webpSize=f=>{ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16); if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } return null; };
(async()=>{
  const have=[DAY,NIGHT].map(f=>fs.existsSync(path.join(ROOT,f))), sz=have.map((h,i)=>h?webpSize(path.join(ROOT,[DAY,NIGHT][i])):null);
  check('① 窗景照片白天、晚上兩張都在、長寬比≈2.46（窗景卡 16 × 6.5 m）', have.every(Boolean)&&sz.every(s=>s&&Math.abs(s[0]/s[1]-16/6.5)<0.03), JSON.stringify(sz));
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ['bldg.afar_interior','bldg.yejian_interior']){ const m=MAN[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const build=async id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
    let mat=null; for(let i=0;i<80&&!mat;i++){ await sleep(100); z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) for(const m of [].concat(o.material)) mat=mat||m; }); } return {z,mat}; };
  global.GAME={G:{zone:'afar',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  const {z,mat}=await build('afar');
  const src=m=>(m&&m.map&&m.map.userData&&m.map.userData.url)||'';   /* zones3d.js 換上的照片在 texture.userData.url 記網址 */
  if(!mat||!z.applyTime){ check('afar 的窗景卡接上了', false); console.log('FAILED '+fails); process.exit(1); }
  z.applyTime(14,'clear'); const d1=src(mat);
  check('② 白天：窗景卡換成 afar_view_day.webp、不調暗', /afar_view_day\.webp$/.test(d1)&&mat.color.r===1, d1+' color '+mat.color.r);
  z.applyTime(21,'clear'); const n1=src(mat);
  check('③ 晚上：換成 afar_view_night.webp、不調暗', /afar_view_night\.webp$/.test(n1)&&mat.color.r===1, n1+' color '+mat.color.r);
  z.applyTime(14,'clear'); check('③ 回到白天換回白天那一張', /afar_view_day\.webp$/.test(src(mat)), src(mat));
  const yj=Z3.ZONES.bookstore?await build('bookstore'):null;
  if(yj&&yj.mat&&yj.z.applyTime){ yj.z.applyTime(21,'clear'); check('④ 頁間的窗景卡不會換成 afar 的照片（WINVIEW-AUDIT-1105 起頁間有自己的 yejian_view_*）', !/afar_view/.test(src(yj.mat)), src(yj.mat)||('color '+yj.mat.color.r)); } else check('④ 頁間的窗景卡不會換成 afar 的照片', true, '（頁間沒有窗景卡，不用比）');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
