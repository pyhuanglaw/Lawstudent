// 轉角唱片：鏡頭高過天花板時樑、冷氣、投射燈、店名飾板藏起來；同一面牆的東西一起淡出（CORNER-CEIL-1107／CORNER-FADE-1107，LAWWW2-B 11-07；
//   BB-B 16:04 判 e66781d1f：P2「天花板切掉的時候，樑、燈盒、招牌要跟著藏起來」、P3「鏡頭在東側時右牆整組淡出，只剩 WALL_right_pothos_rack_alpha 沒跟著」）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js、zones3d.js、配置和正式模型 bb_support/corner.glb，建出真正的 corner_records 區域：
//   ① 模型載好以後，區域有「貼著天花板的東西」清單（CEIL_ 網格＋ceilHide 的店名飾板）：樑、冷氣、投射燈（instancing）、飾板都在裡面
//   ② 鏡頭 2.0 m（天花板下面）：都看得到；鏡頭 4.5 m（天花板上面）：都藏起來；回到 2.0 m 又看得到
//   ③ 鏡頭在店裡東側、鐵架上面（x 3.2、高 4.2，玩家在店中間）：右牆的每一個零件（牆、鐵架、黃金葛架、架上的機器）都淡出
//   ④ 鏡頭在店中間（x 1.5）：右牆的零件都不淡出（不會只淡出一部分）
// 修改前（開發分支 03e92c411）：① ② ③ FAIL。用法：node tests/corner_ceil_1107_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/yangyang_layout.js','src/data/corner_layout.js','src/data/lane118_layout.js','src/zones3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const m=ASSETS.manifest['bldg.corner_interior']; if(!m||!Z3.ZONES.corner_records){ check('轉角唱片的區域、正式模型登錄都在', false); console.log('FAILED '+fails); process.exit(1); }
  window.ASSET_DATA=window.ASSET_DATA||{}; window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64');
  global.GAME={G:{zone:'corner_records',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.corner_records.build(E); E.zone=z; E.scene.add(z.group);
  for(let i=0;i<100&&!z.formal;i++) await sleep(100);
  if(!z.formal){ check('正式模型載入了', false); console.log('FAILED '+fails); process.exit(1); }
  z.group.updateMatrixWorld(true);
  const L=z.ceilHideList||[], names=L.map(o=>o.name).join(' ');
  check('① 有貼著天花板的東西清單：樑、冷氣、投射燈、店名飾板', L.length>=6&&/CEIL_beams/.test(names)&&/CEIL_ac/.test(names)&&/CEIL_spot/.test(names)&&/TOP_logo/.test(names), L.length+' 個：'+names);
  const vis=()=>L.map(o=>o.visible);
  const cam=y=>({camera:{position:new THREE.Vector3(1,y,0)}});
  if(z.update){ z.update(0.016,cam(2.0)); const a=vis(); z.update(0.016,cam(4.5)); const b=vis(); z.update(0.016,cam(2.0)); const c=vis();
    check('② 鏡頭 2.0 m 看得到、4.5 m 藏起來、回到 2.0 m 又看得到', L.length>0&&a.every(v=>v)&&b.every(v=>!v)&&c.every(v=>v), '天花板 '+(z.ceilTop||'?')+' m；2.0：'+a.filter(v=>v).length+'／'+L.length+'、4.5：'+b.filter(v=>v).length+'、再 2.0：'+c.filter(v=>v).length); }
  else check('② 區域有每格的 update（藏天花板上的東西）', false);
  const R=z.walls.filter(w=>/^WALL_right_/.test(w.name||'')), pp=new THREE.Vector3(0,0,0);
  const fadeAt=x=>{ const c=new THREE.PerspectiveCamera(); c.position.set(x,4.2,0); z.fadeWalls(c,pp); return R.filter(w=>w.material.opacity<0.5).map(w=>w.name); };
  const f3=fadeAt(3.2), f15=fadeAt(1.5), miss=R.filter(w=>!f3.includes(w.name)).map(w=>w.name);
  check('③ 鏡頭在鐵架上面（x 3.2）：右牆每一個零件都淡出（含黃金葛架、架上的機器）', R.length>=10&&!miss.length&&f3.some(n=>/pothos/.test(n))&&f3.some(n=>/_inst$/.test(n)), f3.length+'／'+R.length+(miss.length?' 沒淡出：'+miss.join('、'):''));
  check('④ 鏡頭在店中間（x 1.5）：右牆的零件都不淡出', R.length>0&&!f15.length, f15.join('、'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
