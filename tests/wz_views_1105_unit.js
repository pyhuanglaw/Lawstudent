// 溫州街小路、日常失速窗外換成溫州街的街景（WINVIEW-AUDIT-1105，LAWWW2-C 11-05；使用者 07:4x「應該很多店面看出去的街景都不對吧」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js、zones3d.js、配置和正式模型 komichi.glb、daily_offbeat.glb，建出真正的區域：
//   ① 照片都在（小路、日常失速前窗各 1 組），長寬比＝窗景卡（小路 14 × 5.5、日常失速 14 × 6.5）
//   ② 白天（14:00）：窗景卡換成自己那一張白天的、不調暗
//   ⑤ 日常失速右窗（朝北，地圖外）是同一片樹（11-13 起換成抽出來的 offbeat_view_right_*，晚上有夜版：WINVIEW-AUDIT-1105 LAWWW2-C），和前窗分開（各自一份材質）
//   ③ 晚上（21:00）：換成晚上那一張、不調暗；回到白天換回來
//   ④ 不再是木曜日的樹（mok_view）
// 修改前（開發分支 12cb1426c）：全部 FAIL（窗景卡是 mok_view；日常失速前後兩塊共用一個材質）。用法：node tests/wz_views_1105_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lane118_layout.js','src/zones3d.js','src/wzcat3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, A='assets/models/env/second_ai/aa_support/';
const webpSize=f=>{ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16); if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff]; if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; } return null; };
const CARDS=[{zone:'wz_teishoku',mesh:/VIEW/,img:'komichi_view',ar:14/5.5},{zone:'wz_offbeat',mesh:/WALL_front_VIEW/,img:'offbeat_view_front',ar:14/6.5}];
(async()=>{
  for(const c of CARDS){ const sz=['day','night'].map(t=>{ const f=path.join(ROOT,A+c.img+'_'+t+'.webp'); return fs.existsSync(f)?webpSize(f):null; });
    check('① '+c.img+'：白天、晚上兩張都在、長寬比≈'+c.ar.toFixed(2), sz.every(q=>q&&Math.abs(q[0]/q[1]-c.ar)<0.03), JSON.stringify(sz)); }
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of Object.keys(MAN)) if(/^bldg\.wz_(teishoku|offbeat)_interior$|^bldg\.wz_cat$/.test(k)){ const m=MAN[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  for(const u of [WZ_SHOPS_LAYOUT.teishoku&&WZ_SHOPS_LAYOUT.teishoku.glb,DAILY_OFFBEAT_LAYOUT.glb]) if(u&&fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64');   /* 小路的模型在區域建起來時才登錄（wzGlbKey 的 _v4）：照網址先放 */
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const src=m=>(m&&m.map&&m.map.userData&&m.map.userData.url)||'';
  const built={};
  for(const id of ['wz_teishoku','wz_offbeat']){ global.GAME={G:{zone:id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
    let ok=false; for(let i=0;i<100&&!ok;i++){ await sleep(100); z.group.traverse(o=>{ if(o.isMesh&&/VIEW/.test(o.name)) ok=true; }); } await sleep(200); built[id]=z; }
  const mats={};
  for(const c of CARDS){ const z=built[c.zone]; let m=null; z.group.traverse(o=>{ if(!m&&o.isMesh&&c.mesh.test(o.name)) m=[].concat(o.material)[0]; }); mats[c.img]=m;
    if(!m||!z.applyTime){ check(c.img+' 的窗景卡接上了', false); continue; }
    z.applyTime(14,'clear'); const d=src(m);
    check('② '+c.img+' 白天：換成自己那一張、不調暗', d.endsWith(c.img+'_day.webp')&&m.color.r===1, d+' color '+m.color.r);
    z.applyTime(21,'clear'); const n=src(m);
    check('③ '+c.img+' 晚上：換成晚上那一張、不調暗', n.endsWith(c.img+'_night.webp')&&m.color.r===1, n+' color '+m.color.r);
    z.applyTime(14,'clear'); check('③ '+c.img+' 回到白天換回來', src(m).endsWith(c.img+'_day.webp'), src(m));
    check('④ '+c.img+' 不再是木曜日的樹', !!src(m)&&!/mok_view/.test(src(m))); }
  { const z=built.wz_offbeat; let r=null; z.group.traverse(o=>{ if(!r&&o.isMesh&&/WALL_right_VIEW/.test(o.name)) r=[].concat(o.material)[0]; });
    check('⑤ 日常失速右窗是自己的樹（offbeat_view_right，不是前窗那張）、和前窗不是同一份材質', !!r&&r!==mats.offbeat_view_front&&!/offbeat_view_front/.test(src(r)), r?(src(r)||((r.map&&r.map.name)||'模型的圖')):'沒有右窗'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
