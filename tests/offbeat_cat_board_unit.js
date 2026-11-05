// 日常失速：店長（貓）趴在椅子上、東牆佈告欄的標題牌不再閃（OFFBEAT-CAT-BOARD-1105，LAWWW2-C 11-05；使用者 06:5x「沒看到貓」「首都帝大學生社團&活動那塊牌子一直閃」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js／CHAR、zones3d.js、日常失速的正式模型 daily_offbeat.glb 和貓的模型 wz_cat.glb，建出真正的 wz_offbeat 區域：
//   ① 有貓：OFFBEAT_CAT（wz_cat.glb 的趴姿 CAT_lie）在配置的 cat_chair (2.45, 0.15) 上面；身體的底不低於坐墊（0.523 m）、不高過坐墊 4 cm；不穿過椅背、桌子
//   ② 「看看店長／摸摸店長」的互動點（配置 interact kind cat；offbeat_sys3d.js 照這一筆推）離貓 ≤ 0.8 m（站在互動點看得到、摸得到）；貓會呼吸（WZCAT 的 breathers，區域 update 有接）
//   ③ 佈告欄：從店裡往東牆打（標題牌、傳單那一片，y 1.0～2.5、z 0.55～4.55），印刷品（WALL_right_dof_print）和軟木板（WALL_right_dof_wood）前後差 < 1.1 mm 的點＝0；標題牌在板面前面 ≥ 3 mm
// 修改前（開發分支 2dd9d1bd9）：① ② FAIL（沒有貓）；③ 標題牌和板面同一平面（210 點差 0 mm）。用法：node tests/offbeat_cat_board_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lane118_layout.js','src/zones3d.js','src/wzcat3d.js']) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, r3=v=>+(+v).toFixed(3);
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{};
  for(const k of ['bldg.wz_offbeat_interior','bldg.wz_cat']){ const m=MAN[k]; if(m&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
  global.GAME={G:{zone:'wz_offbeat',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}};
  if(!Z3.ZONES.wz_offbeat){ check('wz_offbeat 區域存在',false); console.log('FAILED '+fails); process.exit(1); }
  const z=Z3.ZONES.wz_offbeat.build(E); E.zone=z; E.nav=z.nav; E.scene.add(z.group);
  for(let i=0;i<80&&!z.offbeatCat;i++) await sleep(100); z.group.updateMatrixWorld(true);
  const L=DAILY_OFFBEAT_LAYOUT, ch=L.items.find(q=>q.kind==='cat_chair'), cat=z.offbeatCat;
  // ① 貓
  check('① 有貓（OFFBEAT_CAT，wz_cat.glb 的趴姿）', !!cat&&!!cat.getObjectByName('CAT_lie')&&cat.getObjectByName('CAT_lie').visible, cat?cat.name:'沒有');
  let root=null; z.group.traverse(o=>{ if(!root&&o.getObjectByName&&o!==z.group&&o.getObjectByName('WALL_right_dof_print')) root=o; });
  if(cat){ const bb=new THREE.Box3(); cat.traverse(o=>{ if(o.isMesh&&o.visible){ o.geometry.computeBoundingBox(); bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
    const c=bb.getCenter(new THREE.Vector3());
    check('① 貓在空椅子上（離 cat_chair 中心 ≤ 0.08 m）', Math.hypot(c.x-ch.x,c.z-ch.z)<=0.08, `中心 (${r3(c.x)}, ${r3(c.z)})、椅子 (${ch.x}, ${ch.z})`);
    check('① 身體的底在坐墊上（0.523～0.563 m）', bb.min.y>=0.515&&bb.min.y<=0.563, '底 '+r3(bb.min.y)+' m');
    /* 穿模：往貓的身體範圍裡打幾條直線，貓以外的東西（椅背、桌子）在貓的盒子裡面＝穿過去 */
    let hit=0, tot=0; if(root){ const others=[]; root.traverse(o=>{ if(o.isMesh) others.push(o); }); const box=bb.clone().expandByScalar(-0.02);
      for(let x=box.min.x;x<=box.max.x;x+=0.04) for(let zz=box.min.z;zz<=box.max.z;zz+=0.04){ tot++; const r=new THREE.Raycaster(new THREE.Vector3(x,box.max.y+0.3,zz),new THREE.Vector3(0,-1,0)); const h=r.intersectObjects(others,false).find(q=>q.point.y>box.min.y+0.02&&q.point.y<box.max.y); if(h) hit++; } }
    check('① 椅背、桌子不穿過貓的身體（往下打的線，貓的盒子裡打到別的東西）', !!root&&hit===0, `${hit}／${tot} 條`); }
  // ② 互動點、呼吸
  const it=(L.interact||[]).find(q=>q.kind==='cat'), cp=cat?cat.position:null;   /* 互動點由 offbeat_sys3d.js 照配置的 interact（kind cat）推進去 */
  check('② 「看看店長／摸摸店長」的互動點離貓 ≤ 0.8 m', !!it&&!!cp&&Math.hypot(it.x-cp.x,it.z-cp.z)<=0.8, it?`(${it.x}, ${it.z}) 距 ${cp?r3(Math.hypot(it.x-cp.x,it.z-cp.z)):'—'}`:'沒有互動點');
  if(cat&&typeof z.update==='function'){ const s0=cat.scale.y; for(let i=0;i<30;i++) z.update(1/30,E); check('② 貓會呼吸（區域 update 動 WZCAT 的 breathers）', Math.abs(cat.scale.y-s0)>1e-5, `scale.y ${r3(s0)}→${(cat.scale.y).toFixed(4)}`); } else check('② 貓會呼吸', false, '沒有 z.update');
  // ③ 佈告欄
  if(!root){ check('③ 正式模型載入了', false); }
  else { root.updateMatrixWorld(true); const close={pw:0,ww:0}; let titleGap=9;
    for(let y=1.0;y<=2.5;y+=0.05) for(let zz=0.55;zz<=4.55;zz+=0.05){ const r=new THREE.Raycaster(new THREE.Vector3(4.0,y,zz),new THREE.Vector3(1,0,0)); const h=r.intersectObject(root,true).filter(q=>q.point.x>5.3&&q.point.x<5.6);
      for(let i=0;i+1<h.length;i++){ const a=h[i].object.name, b=h[i+1].object.name, d=h[i+1].point.x-h[i].point.x; if(d<0.0011&&/dof_print/.test(a+b)&&/dof_(wood|print)/.test(a)&&/dof_(wood|print)/.test(b)) close.pw++; }
      if(y>=2.15&&y<=2.45&&zz>=1.85&&zz<=3.25){ const pi=h.findIndex(q=>/dof_print/.test(q.object.name)), wi=h.findIndex(q=>/dof_wood/.test(q.object.name)); if(pi>=0&&wi>pi) titleGap=Math.min(titleGap,h[wi].point.x-h[pi].point.x); } }
    check('③ 佈告欄：印刷品和軟木板（或兩張印刷品）前後差 < 1.1 mm 的點＝0', close.pw===0, close.pw+' 點');
    check('③ 標題牌「首都帝大學生社團＆活動」在板面前面 ≥ 3 mm', titleGap>=0.003&&titleGap<1, (titleGap*1000).toFixed(1)+' mm'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
