// 慢輪單車、阿德影印的窗外接上視差窗景（WINVIEW-AUDIT-1105 第四包，LAWWW2-C 11-05；使用者 07:4x「應該很多店面看出去的街景都不對吧」）——不需要瀏覽器（D131）。
// 兩間原本沒有窗景照片：慢輪的備用房間有窗、沒設照片（看到的是程序化的假街景），正式模型載入後整個藏起來（玻璃外面只剩天空）；阿德的室內窗外也是天空。
// 在 Node 建出真正的區域、載入正式模型（bike_interior、ade）：
//   ① 有視差窗（VIEWPANE_*，W3.windowMat），照片是 bikeshop／wz_print、照片檔在
//   ② 視差窗在正面玻璃外面、蓋住整片玻璃、面向店裡
//   ③ 視差窗的中心＝照片拍的位置（照片是從平面中心用 90° 水平視角拍的；差太多窗外的東西會偏、大小不對）
//   ④ 放在 z.wins、z.winParts（朝店裡），換時段不出錯、照片設進材質
// 修改前：① FAIL（沒有視差窗）。用法：node tests/shop_viewpanes2_1105_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/bike_layout.js','src/data/lane118_layout.js','src/zones3d.js','src/bike3d.js','src/bikeshop3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
window.ASSET_DATA=window.ASSET_DATA||{};
for(const u of [WZ_SHOPS_LAYOUT.print.glb, typeof BIKE_LAYOUT!=='undefined'&&BIKE_LAYOUT.bike&&BIKE_LAYOUT.bike.glb]) if(u&&fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64');
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=async id=>{ global.GAME={G:{zone:id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
  let glb=false; for(let i=0;i<100&&!glb;i++){ await sleep(100); const fb=z.group.children.find(c=>c.name==='fallback'); glb=!!fb&&fb.visible===false; } await sleep(300); z.group.updateMatrixWorld(true); return {z,glb}; };
/* 正面的玻璃：材質或名字有 glass、在前牆附近（z ≥ d/2 − 0.6）、薄的 */
const glassBox=(z,d)=>{ const b=new THREE.Box3(), t=new THREE.Box3(); let any=false; z.group.traverseVisible(o=>{ if(!o.isMesh||/^VIEWPANE_/.test(o.name||'')) return; const mn=(([].concat(o.material)[0])||{}).name||''; if(!/glass/i.test(mn+' '+(o.name||''))) return; t.setFromObject(o); if(t.max.z-t.min.z>0.8||t.max.z<d/2-0.6) return; b.union(t); any=true; }); return any?b:null; };
(async()=>{
  /* 照片拍的位置（區域座標；Blender 的鏡頭換算回來）：
     慢輪＝公館 (0.0875, 1.7, 21.39) → 店內 (0.2125, 1.7, 6.61)；阿德＝溫州街 (−8.0, 1.45, 4.4) → 店內 (0, 1.45, 5.2) */
  const CASES=[{id:'bikeshop',kind:'bikeshop',name:'慢輪單車',d:()=>BIKE_LAYOUT.bike.d,eye:[0.2125,1.7,6.61]},{id:'wz_print',kind:'wz_print',name:'阿德影印',d:()=>WZ_SHOPS_LAYOUT.print.d,eye:[0,1.45,5.2]}];
  for(const c of CASES){ if(!Z3.ZONES[c.id]){ check('① '+c.name+'：區域在', false); fails+=3; continue; }
    const {z,glb}=await build(c.id); const panes=[]; z.group.traverseVisible(o=>{ if(o.isMesh&&/^VIEWPANE_/.test(o.name||'')) panes.push(o); });
    const p=panes[0], files=['day','night'].map(t=>path.join(ROOT,'assets/models/env/views/'+c.kind+'_'+t+'.webp'));
    check('① '+c.name+'：正式模型載入、有視差窗、照片是 '+c.kind+'、照片檔在', glb&&panes.length===1&&!!p.material.uniforms&&p.userData.pview===c.kind&&files.every(f=>fs.existsSync(f)), 'glb '+glb+'｜'+panes.length+' 片 '+(p?p.userData.pview:''));
    if(!p){ fails+=3; E.scene.remove(z.group); continue; }
    const gb=glassBox(z,c.d()), pb=new THREE.Box3().setFromObject(p), nrm=new THREE.Vector3(0,0,1).applyQuaternion(p.getWorldQuaternion(new THREE.Quaternion()));
    check('② '+c.name+'：在正面玻璃外面、蓋住整片玻璃、面向店裡', !!gb&&pb.min.z>gb.max.z-0.001&&pb.min.x<=gb.min.x+0.05&&pb.max.x>=gb.max.x-0.05&&pb.min.y<=gb.min.y+0.05&&pb.max.y>=gb.max.y-0.05&&nrm.z<-0.99,
      gb?('玻璃 x '+gb.min.x.toFixed(2)+'～'+gb.max.x.toFixed(2)+' y '+gb.min.y.toFixed(2)+'～'+gb.max.y.toFixed(2)+' z ≤'+gb.max.z.toFixed(2)+'｜窗 x '+pb.min.x.toFixed(2)+'～'+pb.max.x.toFixed(2)+' y '+pb.min.y.toFixed(2)+'～'+pb.max.y.toFixed(2)+' z '+pb.min.z.toFixed(2)):'找不到正面玻璃');
    const ctr=p.getWorldPosition(new THREE.Vector3()), dd=ctr.distanceTo(new THREE.Vector3(...c.eye));
    check('③ '+c.name+'：視差窗中心＝照片拍的位置（差 ≤ 0.15 m）', dd<=0.15, '窗 ('+ctr.x.toFixed(2)+', '+ctr.y.toFixed(2)+', '+ctr.z.toFixed(2)+')｜照片 ('+c.eye.join(', ')+')｜差 '+dd.toFixed(2)+' m');
    const inWins=(z.wins||[]).includes(p), part=(z.winParts||[]).find(q=>q.obj===p); let ok=true; try{ z.applyTime(14,'clear'); z.applyTime(21,'clear'); z.applyTime(14,'rain'); }catch(e){ ok=false; console.log(e.stack); }
    check('④ '+c.name+'：在 z.wins、z.winParts（朝店裡）、換時段不出錯', inWins&&!!part&&part.dir.z<-0.99&&ok&&p.material.uniforms.map.value!=null, 'wins '+inWins+' part '+!!part+' applyTime '+ok);
    E.scene.remove(z.group); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
