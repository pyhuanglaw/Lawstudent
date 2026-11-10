/* 新生南路街兩頭的遠景（XS-FARVIEW-1105，LAWWW2-B 11-07；使用者 11-05「新生南路側門 遠景太假」：一排方盒、路口外面平的）——不需要瀏覽器（D131）。
   在 Node 建出新生南路區域、載入正式模型 xinsheng_street.glb、xinsheng_far.glb，從上往下打射線：
   ① 街往兩頭接下去：z ±130 的車道、兩側人行道打到的是路面／人行道（不是區域外的平地 y −0.02）
   ② 兩頭兩側有樓（西側店面那一排、南端東側）、店面後面一排高樓（從街上看得到屋頂線上面多一層）
   ③ 兩個路口：橫向的路上沒有樓（北端往西、南端兩邊），路口中間是路面；校園的草地停在南端路口前（不蓋到路）
   ④ 正式遠景模型接上以後 zone.noSkylineCity＝true（引擎不畫城市剪影圓筒，圓筒在校園那一側正好落在校園裡＝「一排方盒」）
   ⑤ 導航不變：格子大小、走得到的格數和改之前一樣（遠景走不到）
   ⑥ 遠景加的網格數（draw call 的上限）
   修改前（開發分支 79214e4e1）：① ② ③ ④ FAIL。用法：node tests/xs_farview_unit.js */
const {ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
{ const ce=document.createElement; document.createElement=n=>{ const c=ce(n); if(n==='canvas'){ const g=c.getContext; c.getContext=()=>{ const x=g.call(c); return new Proxy(x,{get:(o,k)=>k==='measureText'?()=>({width:10}):o[k]}); }; } return c; }; }
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js']) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ['bldg.xinsheng_street','bldg.xinsheng_far']){ const m=ASSETS.manifest[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; global.GAME={G:{zone:'xinsheng',day:30,hour:14,flags:{},weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.xinsheng.build(E); E.zone=z; E.scene.add(z.group); const g=z.group;
  const has=n=>{ let f=false; g.traverse(o=>{ if(o.name===n) f=true; }); return f; };
  for(let i=0;i<200&&!(has('xinsheng_far_glb')&&has('xinsheng_street_glb'));i++) await sleep(100);
  check('0 兩顆正式模型都接上了（xinsheng_street_glb、xinsheng_far_glb）', has('xinsheng_far_glb')&&has('xinsheng_street_glb'));
  g.updateMatrixWorld(true);
  const vis=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const inside=(o,n)=>{ for(let p=o;p;p=p.parent) if(p.name===n) return true; return false; };
  const rc=new THREE.Raycaster(); const down=new THREE.Vector3(0,-1,0);
  const top=(x,zz,noTrees)=>{ rc.set(new THREE.Vector3(x,80,zz),down); rc.far=100; const h=rc.intersectObject(g,true).filter(q=>q.object.isMesh&&vis(q.object)&&!(q.object.material&&q.object.material.visible===false)&&!(noTrees&&(inside(q.object,'xs_far_trees')||/lamp|sig_/.test((q.object.material&&q.object.material.name)||'')))); return h[0]?{y:+(80-h[0].distance).toFixed(2),o:h[0].object}:null; };
  const nm=o=>{ const a=[]; for(let p=o;p&&p!==g;p=p.parent) if(p.name) a.push(p.name); return a.slice(0,3).join('<'); };
  // ① 街往兩頭接下去
  { const bad=[]; for(const zz of [-130,-160,130,160]) for(const [x,lo,hi,lab] of [[-3,-0.01,0.05,'車道'],[-10,0.005,0.05,'西側人行道'],[11,0.005,0.05,'東側人行道']]){ const t=top(x,zz,true); if(!t||t.y<lo||t.y>hi) bad.push(lab+'@'+zz+'='+(t?t.y+' '+nm(t.o):'沒打到')); }
    check('① z ±130、±160 的車道、兩側人行道都有（不是區域外的平地）', !bad.length, bad.join('；')); }
  // ② 兩側有樓、後排高樓
  { const row=(x,z0,z1,minY)=>{ let n=0,k=0,lo=1e9; for(let zz=z0;zz<=z1;zz+=4){ k++; const t=top(x,zz,true); if(t&&t.y>=minY&&inside(t.o,'xinsheng_far_glb')){ n++; lo=Math.min(lo,t.y); } } return {f:n/k,n,k}; };
    const R2=[['西側北段',row(-19,-176,-104,9)],['西側南段',row(-19,94,176,9)],['南端東側',row(19,94,176,9)],['店面後排',row(-45,-80,70,18)],['後排北段',row(-45,-176,-104,18)],['後排南段',row(-45,94,176,18)]];
    const bad=R2.filter(([l,r])=>r.f<0.7); check('② 兩頭兩側有樓、店面後面一排 6 層以上的樓（每 4 m 打一點，七成以上打到遠景模型的屋頂）', !bad.length, R2.map(([l,r])=>l+' '+r.n+'/'+r.k).join('、')); }
  // ③ 路口
  { const bad=[]; for(const [x,zz,lab] of [[-40,-92,'北端往西'],[-90,-92,'北端往西遠處'],[-40,82,'南端往西'],[40,82,'南端往東'],[0,-92,'北端路口中間'],[0,82,'南端路口中間']]){ const t=top(x,zz); if(!t||t.y>0.05||!/xs_far_road_arm/.test(nm(t.o))) bad.push(lab+'('+x+','+zz+')='+(t?t.y+' '+nm(t.o):'沒打到')); }
    check('③ 兩個路口：橫向的路上沒有樓、打到的是橫向的路面（校園草地沒有蓋到南端的路）', !bad.length, bad.join('；')); }
  // ④
  check('④ 遠景模型接上以後 zone.noSkylineCity（不畫城市剪影圓筒）', z.noSkylineCity===true, String(z.noSkylineCity));
  // ⑤ 導航
  { let open=0; for(const v of z.nav.b) if(!v) open++; const L=XINSHENG_LAYOUT.nav; check('⑤ 導航不變（格子 '+z.nav.cols+'×'+z.nav.rows+'、走得到 '+open+' 格；改之前一樣）', z.nav.cols===Math.round(L.w/L.cell)&&z.nav.rows===Math.round(L.d/L.cell)&&open===NAV_OPEN, 'open '+open+' 應為 '+NAV_OPEN); }
  // ⑥ 網格數
  { let ext=0, far=0; g.traverse(o=>{ if(!o.isMesh) return; if(inside(o,'xs_far_ext')) ext++; if(inside(o,'xinsheng_far_glb')) far++; });
    check('⑥ 遠景加的網格：地面、樹、路燈 ≤ 40、樓房模型 ≤ 40（各自合併）', ext<=40&&far<=40, '地面等 '+ext+'、樓房 '+far); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
var NAV_OPEN=10513;   // 改之前（開發分支 79214e4e1）同一個區域走得到的格數
