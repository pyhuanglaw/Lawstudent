// 日和、燒臘、林家乾麵的正式模型玻璃外面接回視差窗景（WINVIEW-AUDIT-1105 第三包，LAWWW2-C 11-05；使用者 07:4x「應該很多店面看出去的街景都不對吧」）——不需要瀏覽器（D131）。
// 在 Node 建出真正的區域、載入正式模型（cvs_interior、shaola_interior、wz_lin_interior）：
//   ① 有視差窗（VIEWPANE_*，W3.windowMat），用的照片名字對（日和從公館進來＝cvs、從溫州街進來＝cvs_wz；燒臘＝noodle；林家＝wz_lin），照片檔在
//   ② 視差窗在正式模型的正面玻璃外面、蓋住整片玻璃（x、y 都蓋到）、面向店裡（林家沒有玻璃：整面開著，照配置 front.open 的開口、前牆 z＝d/2）
//   ③ 放在 z.wins（房間換白天／晚上）和 z.winParts（鏡頭在牆外時跟著前牆藏）；換時段不出錯、會把照片設進材質
//   ④ 模型裡已經有窗景卡的店不加（頁間）
// 修改前（開發分支 f4be7869a）：① ② ③ FAIL（正式模型載入後窗跟著備用房間藏起來，燒臘沒有窗）。用法：node tests/shop_viewpanes_1105_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/shaola_layout.js','src/data/lane118_layout.js','src/zones3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest;
window.ASSET_DATA=window.ASSET_DATA||{};
for(const k of Object.keys(MAN)) if(/^bldg\.(cvs_interior|shaola_interior|yejian_interior)/.test(k)){ const m=MAN[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
if(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT.lin&&fs.existsSync(path.join(ROOT,WZ_SHOPS_LAYOUT.lin.glb))) window.ASSET_DATA[WZ_SHOPS_LAYOUT.lin.glb]=fs.readFileSync(path.join(ROOT,WZ_SHOPS_LAYOUT.lin.glb)).toString('base64');
if(typeof SHAOLA_LAYOUT!=='undefined'&&SHAOLA_LAYOUT.shop) { const u=SHAOLA_LAYOUT.shop.glb; if(u&&fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const build=async(id,flags)=>{ global.GAME={G:{zone:id,day:30,hour:14,flags:flags||{},money:5000,weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group);
  let glb=false; for(let i=0;i<100&&!glb;i++){ await sleep(100); const fb=z.group.children.find(c=>c.name==='fallback'); glb=!!fb&&fb.visible===false; } await sleep(300); z.group.updateMatrixWorld(true); return z; };
const glassBox=z=>{ const b=new THREE.Box3(), t=new THREE.Box3(); let any=false; z.group.traverseVisible(o=>{ if(!o.isMesh) return; const mn=(([].concat(o.material)[0])||{}).name||''; if(!/glass/i.test(mn+' '+(o.name||''))||!/front/i.test(o.name||'')) return; t.setFromObject(o); if(t.max.z-t.min.z>0.8) return; b.union(t); any=true; }); return any?b:null; };
(async()=>{
  const CASES=[{id:'cvs',flags:{},kind:'cvs',name:'日和（從公館進來）'},{id:'cvs',flags:{CVS_FROM:'wenzhou'},kind:'cvs_wz',name:'日和（從溫州街進來）'},{id:'noodle',flags:{},kind:'noodle',name:'燒臘'},{id:'wz_lin',flags:{},kind:'wz_lin',name:'林家乾麵'}];
  for(const c of CASES){ const z=await build(c.id,c.flags); const panes=[]; z.group.traverseVisible(o=>{ if(o.isMesh&&/^VIEWPANE_/.test(o.name||'')) panes.push(o); });
    const p=panes[0], files=['day','night'].map(t=>path.join(ROOT,'assets/models/env/views/'+c.kind+'_'+t+'.webp'));
    check('① '+c.name+'：有視差窗、照片是 '+c.kind+'、照片檔在', panes.length>0&&!!p.material.uniforms&&p.userData.pview===c.kind&&files.every(f=>fs.existsSync(f)), panes.length+' 片 '+(p?p.userData.pview:''));
    if(!p){ fails+=2; continue; }
    const LL=c.id==='wz_lin'&&WZ_SHOPS_LAYOUT.lin, gb=LL?new THREE.Box3(new THREE.Vector3(LL.front.open[0],0.1,LL.d/2-0.1),new THREE.Vector3(LL.front.open[1],2.6,LL.d/2)):glassBox(z), pb=new THREE.Box3().setFromObject(p), nrm=new THREE.Vector3(0,0,1).applyQuaternion(p.getWorldQuaternion(new THREE.Quaternion()));
    check('② '+c.name+'：在正面玻璃外面、蓋住整片玻璃、面向店裡', !!gb&&pb.min.z>gb.max.z-0.001&&pb.min.x<=gb.min.x+0.05&&pb.max.x>=gb.max.x-0.05&&pb.min.y<=gb.min.y+0.05&&pb.max.y>=gb.max.y-0.05&&nrm.z<-0.99,
      gb?('玻璃 x '+gb.min.x.toFixed(2)+'～'+gb.max.x.toFixed(2)+' y '+gb.min.y.toFixed(2)+'～'+gb.max.y.toFixed(2)+' z ≤'+gb.max.z.toFixed(2)+'｜窗 x '+pb.min.x.toFixed(2)+'～'+pb.max.x.toFixed(2)+' y '+pb.min.y.toFixed(2)+'～'+pb.max.y.toFixed(2)+' z '+pb.min.z.toFixed(2)):'找不到正面玻璃');
    const inWins=(z.wins||[]).includes(p), part=(z.winParts||[]).find(q=>q.obj===p); let ok=true; try{ z.applyTime(14,'clear'); z.applyTime(21,'clear'); z.applyTime(14,'rain'); }catch(e){ ok=false; }
    check('③ '+c.name+'：在 z.wins、z.winParts（朝店裡）、換時段不出錯', inWins&&!!part&&part.dir.z<-0.99&&ok&&p.material.uniforms.map.value!=null, 'wins '+inWins+' part '+!!part+' applyTime '+ok);
    E.scene.remove(z.group); }
  if(Z3.ZONES.bookstore){ const z=await build('bookstore',{}); let n=0; z.group.traverse(o=>{ if(o.isMesh&&/^VIEWPANE_/.test(o.name||'')) n++; }); check('④ 頁間（模型有窗景卡）不加視差窗', n===0, n+' 片'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
