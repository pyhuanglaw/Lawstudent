// 公館青木、頁間、Daybreak 窗外換成公館的街景（WINVIEW-AUDIT-1105，LAWWW2-C 11-05；使用者 07:4x「應該很多店面看出去的街景都不對吧」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js、zones3d.js、三間的配置和正式模型，建出真正的區域：
//   ① 每間的白天、晚上照片都在，長寬比＝那一間窗景卡的寬 × 6.5 m（青木 17、頁間 14、Daybreak 15）
//   ② 白天（14:00）：窗景卡換成白天那一張、不調暗
//   ③ 晚上（21:00）：換成晚上那一張、不調暗；回到白天換回來
//   ④ 三間的窗景卡都不再是木曜日的樹（mok_view）
// 修改前（開發分支 12cb1426c）：① ② ③ FAIL。用法：node tests/gg_views_1105_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/lane118_layout.js','src/zones3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, A='assets/models/env/second_ai/aa_support/';
const SHOPS=[{zone:'aoki',key:'bldg.aoki_interior',img:'aoki',w:17},{zone:'bookstore',key:'bldg.yejian_interior',img:'yejian',w:14},{zone:'daybreak',key:'bldg.daybreak_interior',img:'daybreak',w:15}];
const webpSize=f=>{ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16); if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } return null; };
(async()=>{
  for(const s of SHOPS){ const fs2=['day','night'].map(t=>path.join(ROOT,A+s.img+'_view_'+t+'.webp')), sz=fs2.map(f=>fs.existsSync(f)?webpSize(f):null);
    check('① '+s.img+'：白天、晚上兩張都在、長寬比≈'+(s.w/6.5).toFixed(2), sz.every(q=>q&&Math.abs(q[0]/q[1]-s.w/6.5)<0.03), JSON.stringify(sz)); }
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const s of SHOPS){ const m=MAN[s.key]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const build=async id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
    let mat=null; for(let i=0;i<80&&!mat;i++){ await sleep(100); z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) for(const m of [].concat(o.material)) mat=mat||m; }); } return {z,mat}; };
  const src=m=>(m&&m.map&&m.map.userData&&m.map.userData.url)||'';   /* zones3d.js 換上的照片在 texture.userData.url 記網址 */
  for(const s of SHOPS){
    global.GAME={G:{zone:s.zone,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
    const {z,mat}=await build(s.zone);
    if(!mat||!z.applyTime){ check(s.img+' 的窗景卡接上了', false); continue; }
    const img0=mat.userData.ggMap0&&mat.userData.ggMap0.image, name0=(mat.userData.ggMap0&&mat.userData.ggMap0.name)||'';
    z.applyTime(14,'clear'); const d=src(mat);
    check('② '+s.img+' 白天：換成 '+s.img+'_view_day.webp、不調暗', new RegExp(s.img+'_view_day\\.webp$').test(d)&&mat.color.r===1, d+' color '+mat.color.r);
    z.applyTime(21,'clear'); const n=src(mat);
    check('③ '+s.img+' 晚上：換成 '+s.img+'_view_night.webp、不調暗', new RegExp(s.img+'_view_night\\.webp$').test(n)&&mat.color.r===1, n+' color '+mat.color.r);
    z.applyTime(14,'clear'); check('③ '+s.img+' 回到白天換回白天那一張', new RegExp(s.img+'_view_day\\.webp$').test(src(mat)), src(mat));
    check('④ '+s.img+' 的窗景卡不再是木曜日的樹', !/mok_view/.test(src(mat))&&!!src(mat), '原本 '+(name0||'(模型的圖)'));
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
