// 遠處座位的替身（src/classes3d.js 的 figPlace／figRemove／figTick；LAWWW2 167fc2d 的 seated_figures.glb）——不需要瀏覽器。
// 使用者 2026-10-13（經 LAWWW2 轉達）：「101 要有遠處座位的低成本坐姿人物、近處少量 NPC；不要先做 400 個完整 3D NPC」。
// 檢查（博雅 101，66 個位子，上課坐一半＝33 人）：完整人物照舊最多 16 個；其餘 17 個位子放替身（每種外型一個 InstancedMesh、位置＝座位、朝向＝座位 yaw）；
//   替身和完整人物不坐同一個位子；替身的位子玩家不能坐（沒有「坐下」）；下課後玩家看著那一區時替身還在，轉開以後整組拿掉、位子空出來；
//   換區域、時間跳過直接拿掉；小教室（40 個位子以下）不放替身。修改前沒有替身（第 2 項以後都會失敗）。
// 用法：node tests/seated_figures_unit.js
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
/* 替身模型：用小方塊代替（名稱和 seated_figures.glb 一樣：fig_<底模>_<姿勢>_c<配色>、_lod1）*/
const fake=new THREE.Group(); for(const b of ['npc_f1','npc_m1']) for(const p of ['listen','write']) for(const c of [0,1]) for(const l of ['','_lod1']){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.4,1.2,0.4),new THREE.MeshBasicMaterial()); m.name='fig_'+b+'_'+p+'_c'+c+l; fake.add(m); }
let loads=0; ASSETS.loadOne=k=>{ loads++; return k==='prop.seated_figures'?Promise.resolve({scene:fake}):Promise.reject(new Error('no '+k)); };
global.CHAR=Object.assign(global.CHAR||{},{build:()=>new THREE.Object3D(),setExpr(){},release(){}}); global.STORY={extraSpec:i=>({id:'x'+i})};
let G={day:30,hour:10,zone:'boya',weekday:2,flags:{}}; const GM={get G(){ return G; },E,toast(){},caption(){}};
const live=[]; CLS.liveIn=()=>live.slice();
const tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
  const z=loadZone('boya'); const seats=z.seats.filter(q=>q.room==='101'&&(q.kind==='class'||q.kind==='lecture'));
  check('博雅 101：40 個位子以上（大的階梯教室）',seats.length>=40,seats.length+' 個');
  live.push({key:'c1:101',room:{room:'101'}}); CLS.syncRooms(GM,{instant:true}); await tick(); await tick();
  const studs=E.npcs.filter(n=>n.clsStudent), st=CLS.figState(), want=Math.round(seats.length*0.5);
  check('上課：完整人物 16 個、替身 '+(want-16)+' 個（共坐一半）',studs.length===16&&st.length===1&&st[0].n===want-16&&st[0].loaded,JSON.stringify({studs:studs.length,st}));
  const grp=E.zone.levelGroups[0].group.getObjectByName('seated_figures:c1:101'); const ims=grp?grp.children:[];
  const inst=[]; const M=new THREE.Matrix4(), P=new THREE.Vector3(), Q=new THREE.Quaternion(), S3=new THREE.Vector3();
  for(const im of ims) for(let i=0;i<im.count;i++){ im.getMatrixAt(i,M); M.decompose(P,Q,S3); inst.push({x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),yaw:new THREE.Euler().setFromQuaternion(Q).y}); }
  const taken=seats.filter(q=>q.taken==='c1:101');
  const okPos=inst.length===taken.length&&inst.every(p=>taken.some(q=>Math.abs(q.x-p.x)<0.01&&Math.abs(q.z-p.z)<0.01&&Math.abs((q.y||0)-p.y)<0.01&&Math.abs(Math.atan2(Math.sin((q.yaw||0)-p.yaw),Math.cos((q.yaw||0)-p.yaw)))<0.01));
  check('替身放在那一層的群組；每個替身的位置、高度、朝向＝座位（同一個原點、+z 朝講台）',!!grp&&okPos,`${inst.length} 個替身、${taken.length} 個位子`);
  check('替身和完整人物不坐同一個位子',taken.every(q=>!studs.some(n=>n.seat&&Math.hypot(n.seat.x-q.x,n.seat.z-q.z)<0.35)));
  { const lod1=new Set(fake.children.filter(m=>/_lod1$/.test(m.name)).map(m=>m.geometry)); check('每種外型一個 InstancedMesh；離玩家 7 m 以外的用 LOD1',ims.length>0&&ims.every(im=>im.isInstancedMesh)&&ims.some(im=>lod1.has(im.geometry)),ims.length+' 個、LOD1 '+ims.filter(im=>lod1.has(im.geometry)).length+' 個'); }
  { const q=taken[0], it=E.interactables.find(i=>i.seat===q); E.player.obj.position.set(it.x,q.y||0,it.z); E.player.lv=q.lv|0; const b=E.nearestInteractable();
    check('替身坐的位子：玩家站在旁邊不會出現它的「坐下」',!b||b.seat!==q,b&&b.label); }
  // 下課：看著那一區 → 替身還在；轉開 → 整組拿掉、位子空出來
  const cam=new THREE.PerspectiveCamera(60,844/390,0.1,200); E.camera=cam; const c=taken[0];
  cam.position.set(c.x,(c.y||0)+1.6,c.z+6); cam.lookAt(c.x,(c.y||0)+0.8,c.z); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  live.length=0; G.hour=10.1; CLS.syncRooms(GM); CLS.figTick(GM);
  check('下課、玩家看著那一區：替身沒有在眼前消失（標成要離開）',CLS.figState().length===1&&CLS.figState()[0].leaving&&!!grp.parent);
  cam.lookAt(c.x,(c.y||0)+0.8,c.z+60); cam.updateMatrixWorld(); CLS.figTick(GM);
  check('轉開以後：整組拿掉、位子空出來（沒有 taken）',CLS.figState().length===0&&!grp.parent&&!seats.some(q=>q.taken),JSON.stringify(CLS.figState()));
  // 時間跳過：直接拿掉
  live.push({key:'c2:101',room:{room:'101'}}); CLS.syncRooms(GM,{instant:true}); await tick(); await tick(); live.length=0; G.hour=13; CLS.syncRooms(GM);
  check('時間跳過（下一次同步隔了 0.6 小時以上）：替身直接拿掉',CLS.figState().length===0&&!seats.some(q=>q.taken),JSON.stringify(CLS.figState()));
  // 小教室：不放替身
  { const z2=loadZone('boya'); const small=z2.seats.filter(q=>q.room==='201'); G.hour=15; live.length=0; live.push({key:'c3:201',room:{room:'201'}}); CLS.syncRooms(GM,{instant:true}); await tick();
    check('小教室（201，'+small.length+' 個位子）：不放替身',CLS.figState().length===0,JSON.stringify(CLS.figState())); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
