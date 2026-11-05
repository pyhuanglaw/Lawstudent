// 替身的遠近跟著玩家換（BUG-03，使用者 10-15 第 17 項「博雅 101 國文課……很多人固定在那邊，披頭散髮很可怕」）——不需要瀏覽器。
// 原因：src/classes3d.js 的 figPlace 放替身那一刻照玩家位置選 LOD0／_lod1（7 m），之後不換。玩家在門口時整班都是 _lod1（約 350 個三角形：臉糊成一塊、頭髮一塊塊），
//   走到座位旁邊、坐下，旁邊的替身還是 _lod1。修正：每種外型一個 LOD0、一個 _lod1 的 InstancedMesh，figTick 照玩家現在的位置重排（6.5／7.5 m 兩個門檻，不來回換）。
// 檢查（博雅 101，上課坐一半）：①玩家在門口：遠的替身是 _lod1（和原本一樣）②走到一個 _lod1 替身旁邊（0.9 m）＋figTick：那個位子換成 LOD0（修改前 FAIL）
//   ③桌上小物跟著換 ④走回門口：換回 _lod1（修改前 FAIL：②沒換）⑤ 6.5～7.5 m 之間不換 ⑥每次重排替身總數＝替身坐的位子數、每個位子剛好一個（不多、不少、不重複）
//   ⑦下課時空的 InstancedMesh（這一邊沒有人）不算「看得到」：鏡頭看著區域原點、看不到替身 → 整組拿掉
// 用法：node tests/seated_figures_lod_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js','src/data/calendar.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR|CALENDAR|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
/* 引擎的 addNPC／removeNPC 要用到渲染場景（Node 裡沒有）：換成只記錄名單的版本（和 indoor_crowd_unit 一樣）*/
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},lv:0,radius:0.32}; return z; }
/* 替身、桌上小物：用小方塊代替（名稱和 seated_figures.glb、desk_props.glb 一樣；_lod1 是遠處版）*/
const fake=new THREE.Group(); for(const b of ['npc_f1','npc_m1']) for(const p of ['listen','write']) for(const c of [0,1]) for(const l of ['','_lod1']){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.2,0.4),new THREE.MeshBasicMaterial()); m.name='fig_'+b+'_'+p+'_c'+c+l; fake.add(m); }
const fakeP=new THREE.Group(); for(const s of ['lset_laptop','lset_book','lset_code','lset_write','lset_phone']) for(const l of ['','_lod1']){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.05,0.2),new THREE.MeshBasicMaterial()); m.name=s+l; fakeP.add(m); }
ASSETS.loadOne=k=>k==='prop.seated_figures'?Promise.resolve({scene:fake}):(k==='prop.desk_props'?Promise.resolve({scene:fakeP}):Promise.reject(new Error('no '+k)));
global.CHAR=Object.assign(global.CHAR||{},{build:()=>new THREE.Object3D(),setExpr(){},release(){}}); global.STORY={extraSpec:i=>({id:'x'+i})};
let G={day:30,hour:10,zone:'boya',weekday:2,flags:{}}; const GM={get G(){ return G; },E,toast(){},caption(){}};
const live=[]; CLS.liveIn=()=>live.slice();
const tick=()=>new Promise(r=>setTimeout(r,0));
const M=new THREE.Matrix4(), P=new THREE.Vector3(), Q=new THREE.Quaternion(), S3=new THREE.Vector3();
const list=grp=>{ const out=[]; for(const im of grp.children) for(let i=0;i<im.count;i++){ im.getMatrixAt(i,M); M.decompose(P,Q,S3); out.push({k:im.name,desk:/^desk:/.test(im.name),lod1:/_lod1$/.test(im.name),x:+P.x.toFixed(3),z:+P.z.toFixed(3)}); } return out; };
const at=(L,q,desk)=>L.filter(f=>f.desk===!!desk&&Math.abs(f.x-q.x)<1e-3&&Math.abs(f.z-q.z)<1e-3);
(async()=>{
  const z=loadZone('boya'); const seats=z.seats.filter(q=>q.room==='101'&&(q.kind==='class'||q.kind==='lecture'));
  live.push({key:'c1:101',room:{room:'101'}}); CLS.syncRooms(GM,{instant:true}); await tick(); await tick(); await tick();
  const grp=z.levelGroups[0].group.getObjectByName('seated_figures:c1:101'); const taken=seats.filter(q=>q.taken==='c1:101');
  check('前提：替身放好了（'+taken.length+' 個位子）',!!grp&&taken.length>0);
  if(!grp){ console.log('FAILED'); process.exit(1); }
  const door={x:E.player.obj.position.x,z:E.player.obj.position.z};
  const whole=(L,name)=>{ const f=L.filter(q=>!q.desk); const ok=f.length===taken.length&&taken.every(q=>at(L,q).length===1); check('⑥ '+name+'：替身 '+f.length+' 個＝位子 '+taken.length+' 個，每個位子剛好一個',ok); };
  let L=list(grp); const far=taken.filter(q=>Math.hypot(q.x-door.x,q.z-door.z)>8).sort((a,b)=>Math.hypot(b.x-door.x,b.z-door.z)-Math.hypot(a.x-door.x,a.z-door.z));
  const q=far[0];
  check('① 玩家在門口 ('+door.x+','+door.z+')：離門口 8 m 以上的替身是 _lod1（和原本一樣）',far.length>0&&far.every(s=>at(L,s).every(f=>f.lod1)),far.length+' 個');
  whole(L,'門口');
  E.player.obj.position.set(q.x,q.y||0,q.z+0.9); CLS.figTick(GM); L=list(grp);
  check('② 走到 _lod1 替身旁邊（0.9 m）＋figTick：那個位子換成 LOD0',at(L,q).length===1&&!at(L,q)[0].lod1,JSON.stringify(at(L,q)));
  const dk=at(L,q,true); check('③ 那個位子的桌上小物也換成 LOD0',dk.length===1&&!dk[0].lod1,JSON.stringify(dk));
  const nearAll=taken.filter(s=>Math.hypot(s.x-q.x,s.z-q.z+0.9)<6.4); check('② 玩家 6.4 m 內的替身全部 LOD0（'+nearAll.length+' 個）',nearAll.every(s=>at(L,s).every(f=>!f.lod1)));
  whole(L,'走到旁邊');
  E.player.obj.position.set(door.x,0,door.z); CLS.figTick(GM); L=list(grp);
  check('④ 走回門口：那個位子換回 _lod1',at(L,q).length===1&&at(L,q)[0].lod1,JSON.stringify(at(L,q)));
  whole(L,'走回門口');
  // ⑤ 兩個門檻之間不換：現在是 _lod1 的位子，玩家站在 7.0 m → 不換；換成 LOD0 以後退到 7.0 m → 不換回
  const dir=(s,d)=>{ E.player.obj.position.set(s.x,0,s.z+d); CLS.figTick(GM); return at(list(grp),s)[0]; };
  check('⑤ _lod1 的位子，玩家走到 7.0 m：照舊 _lod1',dir(q,7.0).lod1===true);
  check('⑤ 走到 6.4 m：換成 LOD0',dir(q,6.4).lod1===false);
  check('⑤ 退回 7.0 m：照舊 LOD0（7.5 m 以外才換回）',dir(q,7.0).lod1===false);
  check('⑤ 退到 7.6 m：換回 _lod1',dir(q,7.6).lod1===true);
  whole(list(grp),'來回之後');
  // ⑦ 下課：玩家回到門口（LOD0 那幾個 InstancedMesh 是空的），鏡頭看著區域原點、看不到任何替身 → 整組拿掉（空的 InstancedMesh 包圍球半徑 −1，不能算「看得到」）
  E.player.obj.position.set(door.x,0,door.z); CLS.figTick(GM); L=list(grp);
  const empty=grp.children.filter(im=>im.count===0); check('⑦ 前提：玩家在門口時 LOD0 那幾個 InstancedMesh 是空的（'+empty.length+' 個），而且不畫（visible＝false）',empty.length>0&&empty.every(im=>!im.visible));
  const cam=new THREE.PerspectiveCamera(60,844/390,0.1,200); E.camera=cam; cam.position.set(-4,0.3,0); cam.lookAt(10,0.3,0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  { const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)); grp.updateMatrixWorld(true);
    const real=grp.children.filter(im=>im.count>0&&fr.intersectsSphere(im.boundingSphere.clone().applyMatrix4(im.matrixWorld))); check('⑦ 前提：這個鏡頭看不到任何替身',real.length===0,real.map(im=>im.name).join(','));
    const ghost=empty.filter(im=>fr.intersectsSphere(im.boundingSphere.clone().applyMatrix4(im.matrixWorld))); check('⑦ 前提：區域原點在畫面裡（空的包圍球會被當成看得到）',ghost.length>0,ghost.length+' 個'); }
  live.length=0; G.hour=10.1; CLS.syncRooms(GM); CLS.figTick(GM);
  check('⑦ 下課、看不到替身：整組拿掉、位子空出來（空的 InstancedMesh 不算看得到）',CLS.figState().length===0&&!grp.parent&&!seats.some(q=>q.taken),JSON.stringify(CLS.figState()));

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
