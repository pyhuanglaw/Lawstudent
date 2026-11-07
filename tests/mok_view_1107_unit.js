// 木曜日（wz_mokuyobi，溫州街 B4 二樓）臨街窗往外看換成溫州街的街景（WINVIEW-AUDIT 木曜日，LAWWW2-B 11-07；使用者 11-05 07:4x「應該很多店面看出去的街景都不對吧」）——不需要瀏覽器（D131）。
// 原本窗景卡（WALL_front_VIEW_mok_window_view）是一張手繪的樹（mok_view），白天晚上同一張、晚上也亮著。
// 在 Node 載入遊戲的 three.js、zones3d.js、mokuyobi3d.js 和正式模型 mokuyobi.glb，建出真正的區域：
//   ① 照片都在（白天、晚上），長寬比＝窗景卡（14 × 6.5）
//   ② 白天（14:00）：窗景卡換成白天那一張、不調暗
//   ③ 晚上（21:00）：換成晚上那一張、不調暗；回到白天換回來
//   ④ 不再是手繪的樹（mok_view）
//   ⑤ 樓梯 GLB 門外那一張街景卡（mks_street_view，一樓鐵門外）不動
// 修改前（開發分支 77195b12a）：① ② ③ ④ FAIL。用法：node tests/mok_view_1107_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, A='assets/models/env/second_ai/aa_support/', IMG='mokuyobi_view', AR=14/6.5;
const webpSize=f=>{ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16); if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } return null; };
(async()=>{
  { const sz=['day','night'].map(t=>{ const f=path.join(ROOT,A+IMG+'_'+t+'.webp'); return fs.existsSync(f)?webpSize(f):null; });
    check('① '+IMG+'：白天、晚上兩張都在、長寬比≈'+AR.toFixed(2)+'（窗景卡 14 × 6.5）', sz.every(q=>q&&Math.abs(q[0]/q[1]-AR)<0.03), JSON.stringify(sz)); }
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ['bldg.wz_mokuyobi_interior','bldg.wz_mokuyobi_stair']){ const m=MAN[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const src=m=>(m&&m.map&&m.map.userData&&m.map.userData.url)||'';
  global.GAME={G:{zone:'wz_mokuyobi',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.wz_mokuyobi.build(E); E.zone=z; E.scene.add(z.group);
  let ok=false; for(let i=0;i<150&&!ok;i++){ await sleep(100); z.group.traverse(o=>{ if(o.isMesh&&/mok_window_view/.test(o.name)) ok=true; }); } await sleep(300);
  let m=null, st=null; z.group.traverse(o=>{ if(!o.isMesh) return; if(!m&&/mok_window_view/.test(o.name)) m=[].concat(o.material)[0]; if(!st&&/mks_street_view/.test(o.name)) st=[].concat(o.material)[0]; });
  if(!m||!z.applyTime){ check('窗景卡接上了（正式模型 mokuyobi.glb 載入）', false, m?'沒有 applyTime':'沒有 mok_window_view'); }
  else {
    z.applyTime(14,'clear'); const d=src(m);
    check('② 白天：換成白天那一張、不調暗', d.endsWith(IMG+'_day.webp')&&m.color.r===1, (d||'（模型原本的圖）')+' color '+m.color.r);
    z.applyTime(21,'clear'); const n=src(m);
    check('③ 晚上：換成晚上那一張、不調暗', n.endsWith(IMG+'_night.webp')&&m.color.r===1, (n||'（模型原本的圖）')+' color '+m.color.r);
    z.applyTime(14,'clear'); check('③ 回到白天換回來', src(m).endsWith(IMG+'_day.webp'), src(m)||'（模型原本的圖）');
    check('④ 不再是手繪的樹（mok_view）', !!src(m)&&!/mok_view/.test(src(m)), src(m)||((m.map&&m.map.name)||'模型的圖')); }
  check('⑤ 一樓鐵門外的街景卡（樓梯 GLB 的 mks_street_view）不動', !st||(st!==m&&!/mokuyobi_view/.test(src(st))), st?((st.map&&st.map.name)||'模型的圖'):'樓梯模型沒載到（只檢查窗景卡）');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
