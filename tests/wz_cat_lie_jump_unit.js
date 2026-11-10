// 溫州街橘貓：有骨架的趴姿、跳上／跳下圓椅（X186，LAWWW2 帳號 A 11-10；USER_WANTS X186「趴著、跳上跳下還沒接」）——不需要瀏覽器（D131）。
// LAWWW2 f22ef5dcd 在 wz_cat.glb 做了 cat_lie_idle、cat_jump_down、cat_jump_up，程式原本只接了 cat_rub／cat_rub_r。這一版 wzcat3d.js：
//   GLB 有 cat_lie_idle：睡的時候用走路那一隻（有骨架）趴在原地播 cat_lie_idle，不換成沒有骨架的 CAT_lie；有 cat_jump_down／up：從圓椅跳下來、跳上去。
// 檢查（用真的溫州街區域；假的貓 GLB＝wz_cat_float_rub_unit 那一個，加上三個片段）：
//   1 晚上 22:00 進公園：貓趴在圓椅的座面上（走路那一隻、看得到；高度＝座面）、播 cat_lie_idle；沒有 CAT_lie 靜態模型
//   2 06:48 進公園、到 09:00：在座面上轉向外（jturn）→ 跳下來（jdown，播 cat_jump_down，跳的時候高度不被壓回地面）→ 落在前方 0.35 m 的地上 → 走到圓椅前
//   3 17:36：走到座面前 0.30 m（prejump）→ 轉向座面（jupturn）→ 跳上去（jup，播 cat_jump_up）→ 落在趴的位置（座面上）、播 cat_lie_idle、慢慢轉到趴的方向
//   4 白天 hold('lie')（劇情要貓趴在圓椅上）：趴在圓椅上、播 cat_lie_idle；release：回到 hold 前的位置繼續
//   5 沒有這三個片段（舊 GLB）照舊：wz_cat_float_rub_unit 全部（同一個檔案的假 GLB 沒有這三段）
// 修改前（開發分支 437a9fe4d）：1～4 FAIL。用法：node tests/wz_cat_lie_jump_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), OLD=process.env.WZ_OLD_SRC||'';
const readSrc=f=>{ const o=OLD&&path.join(OLD,f); return fs.readFileSync(o&&fs.existsSync(o)?o:path.join(ROOT,f),'utf8'); };
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=readSrc(f); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{});
vm.runInThisContext(readSrc('src/wzpark3d.js').replace(/^const PARK\s*=/m,'global.PARK='),{filename:'src/wzpark3d.js'});
vm.runInThisContext(readSrc('src/wzcat3d.js').replace(/^const WZCAT\s*=/m,'global.WZCAT='),{filename:'src/wzcat3d.js'}); global.fetch=()=>Promise.reject(new Error('no fetch'));
console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* ---- GLB 頂點（只讀 POSITION，節點沒有變換；稀疏的 morph 不讀）---- */
function glb(f){ const b=fs.readFileSync(path.join(ROOT,f)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const pos=nm=>{ const n=J.nodes.find(q=>q.name===nm); if(!n||n.mesh==null) return null; const out=[]; for(const p of J.meshes[n.mesh].primitives){ const a=J.accessors[p.attributes.POSITION], bv=J.bufferViews[a.bufferView], st=bv.byteStride||12, off=(bv.byteOffset||0)+(a.byteOffset||0);
    for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(off+k*st),bin.readFloatLE(off+k*st+4),bin.readFloatLE(off+k*st+8)]); } return {node:n,v:out}; };
  return {J,pos}; }
const PK=glb('assets/models/env/second_ai/wz_park.glb'), CT=glb('assets/models/env/second_ai/aa_support/wz_cat.glb');
const L=WZ_PARK_LAYOUT, ring=L.items.find(i=>i.kind==='ring_bench'), pav=L.items.find(i=>i.kind==='pavilion');
/* 座面：park_wood 在老樹正北那一片（x ±0.6、頂面 0.44 以上）*/
const wood=PK.pos('park_wood'), seatV=wood.v.filter(v=>Math.abs(v[0]-ring.x)<0.6&&v[2]>ring.z+0.9&&v[2]<ring.z+1.6&&v[1]>0.44);
const SEAT={z0:Math.min(...seatV.map(v=>v[2])),z1:Math.max(...seatV.map(v=>v[2])),x0:Math.min(...seatV.map(v=>v[0])),x1:Math.max(...seatV.map(v=>v[0])),top:Math.max(...seatV.map(v=>v[1]))};
check('A0. 座面（wz_park.glb 量）：正北那一片 z '+SEAT.z0.toFixed(3)+'～'+SEAT.z1.toFixed(3)+'、頂面 '+SEAT.top.toFixed(3)+'（節點沒有變換）',seatV.length>8&&!wood.node.translation&&!wood.node.rotation&&Math.abs(SEAT.top-0.45)<0.005);
/* 石桌底座（park3.001，涼亭中間）：各高度的半徑 */
const tbl=PK.pos('park3.001'), TB=[[0.14,0.2],[0.2,0.3],[0.3,0.5],[0.5,0.7]].map(([a,b])=>{ const r=tbl.v.filter(v=>v[1]>=a&&v[1]<b&&Math.hypot(v[0]-pav.x,v[2]-pav.z)<0.6).map(v=>Math.hypot(v[0]-pav.x,v[2]-pav.z)); return {a,b,r:r.length?Math.max(...r):0}; });
const stool=PK.pos('park3'); const pedR=y=>{ for(const t of TB) if(y>=t.a&&y<t.b) return t.r; return 0; };
check('B0. 石桌（park3_props 量）：底座半徑 '+TB.map(t=>t.r.toFixed(2)).join('／')+'（地台 0.14 起）',TB[0].r>0.2&&TB[0].r<0.3);
/* ---- 假的貓 GLB：姿勢的頂點是真的（CAT_lie、CAT_curl），走路的骨架網格、動畫片段是空的 ---- */
const fakeGLB=()=>{ const sc=new THREE.Group(); const mat=new THREE.MeshStandardMaterial({name:'cat_fur'});
  for(const p of ['sit','lie','curl']){ const g=new THREE.BufferGeometry(), src=CT.pos('CAT_'+p); if(src) g.setAttribute('position',new THREE.Float32BufferAttribute(src.v.flat(),3)); const m=new THREE.Mesh(g,mat); m.name='CAT_'+p; m.position.x={sit:-0.6,lie:0,curl:1.2}[p]; sc.add(m);
    for(const k of ['tag','bandage']){ const a=new THREE.Mesh(new THREE.BufferGeometry(),mat); a.name='CAT_'+p+'_'+k; m.add(a); } }
  const w=new THREE.Group(); w.name='CAT_walk'; w.position.x=0.6; const body=new THREE.Mesh(new THREE.BufferGeometry(),mat); body.name='CAT_walk_mesh'; body.morphTargetDictionary={fat:0}; body.morphTargetInfluences=[0]; w.add(body);
  for(const k of ['tag','bandage']){ const a=new THREE.Mesh(new THREE.BufferGeometry(),mat); a.name='CAT_walk_'+k; w.add(a); } sc.add(w);
  return {scene:sc,animations:['cat_walk','cat_idle','cat_sit','cat_sit_idle'].map(n=>new THREE.AnimationClip(n,n==='cat_walk'?1:(n==='cat_sit'?0.75:4),[]))}; };
const FAKE=fakeGLB(); ASSETS.loadOne=k=>k==='bldg.wz_cat'?Promise.resolve(FAKE):Promise.reject(new Error('test: not loaded'));
const dayOf=k=>{ for(let d=-420;d<2200;d++) if(CALENDAR.dateOf(d).key===k) return d; return null; };
global.STORY={dayOfKey:dayOf};   /* PARK 的寒流、收養日期照 STORY.dayOfKey（story3d.js 同一個做法）*/
const mkG=(h,o)=>Object.assign({day:dayOf('2025-10-15'),hour:h,weather:'sunny',flags:{},daily:{}},o||{});
const tick=()=>new Promise(r=>setTimeout(r,0));
let scene=null, zone=null;
async function enter(G){ global.GAME={G,E:E3}; E3.interactables=[]; E3.colliders=[]; E3.lampGlows=[]; E3.seats=[]; E3.npcs=[]; E3.spawnHint=null;
  zone=Z3.ZONES.wenzhou.build(E3); E3.zone=zone; E3.nav=zone.nav; E3.levels=zone.levels||null; scene=new THREE.Scene(); scene.add(zone.group);
  E3.player={obj:new THREE.Object3D(),busy:false,radius:0.32,lv:0,seat:null,frozen:false}; E3.player.obj.position.set(26,0,6); scene.add(E3.player.obj);
  for(let i=0;i<5;i++) await tick(); scene.updateMatrixWorld(true); return zone; }
const catG=()=>zone.group.getObjectByName('wz_cat');
/* 看得到的趴姿（CAT_lie／CAT_curl）的世界座標頂點 */
function lieVerts(){ const out=[]; scene.updateMatrixWorld(true); catG().traverse(o=>{ if(!o.isMesh||!/^CAT_(lie|curl)$/.test(o.name)) return; for(let p=o;p&&p!==zone.group;p=p.parent) if(!p.visible) return; const a=o.geometry.attributes.position; if(!a) return; const v=new THREE.Vector3();
  for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld); out.push([v.x,v.y,v.z]); } }); return out; }
const box=V=>({x0:Math.min(...V.map(v=>v[0])),x1:Math.max(...V.map(v=>v[0])),y0:Math.min(...V.map(v=>v[1])),y1:Math.max(...V.map(v=>v[1])),z0:Math.min(...V.map(v=>v[2])),z1:Math.max(...V.map(v=>v[2]))});
const f3=v=>v.toFixed(3);
(async()=>{
  for(const [n,d] of [['cat_lie_idle',4],['cat_jump_down',0.8],['cat_jump_up',0.8],['cat_rub',2]]) FAKE.animations.push(new THREE.AnimationClip(n,d,[]));
  const L0=Z3.wzCatSpot?Z3.wzCatSpot(L,'bench','lie'):null;
  const st=()=>WZCAT.state(), C=()=>WZCAT._cat&&WZCAT._cat();
  /* 1 晚上 */
  await enter(mkG(22)); { for(let i=0;i<10;i++) zone.update(0.1,E3); const s=st(), c=C(), o=c&&c.obj;
    const ok=!!c&&s.state==='sleep'&&s.lie==='bench'&&c.lieAnim&&o.visible&&s.clip==='cat_lie_idle'&&!lieVerts().length&&!!L0&&Math.abs(o.position.y-L0.y)<0.002&&Math.hypot(o.position.x-L0.x,o.position.z-L0.z)<0.01;
    check('1 晚上：走路那一隻趴在圓椅座面上、播 cat_lie_idle；沒有靜態的 CAT_lie', ok, JSON.stringify({s:s&&{state:s.state,lie:s.lie,clip:s.clip},y:o&&f3(o.position.y),L0:L0&&[f3(L0.x),f3(L0.y),f3(L0.z)],static:lieVerts().length})); }
  /* 2 早上醒來跳下來 */
  await enter(mkG(6.8)); { for(let i=0;i<10;i++) zone.update(0.1,E3); const c=C(); GAME.G.hour=9; const seq=[]; let maxYjump=-1, land=null, clipDown=false, prevState=null;
    for(let i=0;i<600;i++){ zone.update(0.1,E3); const s=st(); if(!s) break; if(seq[seq.length-1]!==s.state) seq.push(s.state); const o=c.obj;
      if(s.state==='jturn'||s.state==='jdown'){ maxYjump=Math.max(maxYjump,o.position.y); if(s.clip==='cat_jump_down') clipDown=true; }
      if(prevState==='jdown'&&s.state!=='jdown'&&!land) land={x:o.position.x,y:o.position.y,z:o.position.z}; prevState=s.state; if(s.state==='sit'&&seq.includes('walk')) break; }
    const iJ=seq.indexOf('jturn'), iD=seq.indexOf('jdown'), iW=seq.indexOf('walk');
    const okLand=!!land&&!!L0&&Math.abs(land.y)<0.01&&Math.abs(land.z-(L0.z+0.35))<0.03&&Math.abs(land.x-L0.x)<0.03;
    const end=c.obj.position, okEnd=Math.hypot(end.x-26,end.z-23.3)<0.1;
    check('2 早上：轉向外 → 跳下來（cat_jump_down；跳的時候高度留在座面）→ 落在前方 0.35 m 的地上 → 走到圓椅前', iJ>=0&&iD>iJ&&iW>iD&&clipDown&&Math.abs(maxYjump-(L0?L0.y:0.45))<0.01&&okLand&&okEnd,
      JSON.stringify({seq,clipDown,maxYjump:f3(maxYjump),land:land&&[f3(land.x),f3(land.y),f3(land.z)],end:[f3(end.x),f3(end.z)]})); }
  /* 3 傍晚跳上去 */
  { const c=C(); E3.player.obj.position.set(26,0,6); GAME.G.hour=17.6; const seq=[]; let pre=null, clipUp=false, upY=[]; let s=null;
    for(let i=0;i<4000;i++){ zone.update(0.1,E3); s=st(); if(!s) break; if(seq[seq.length-1]!==s.state){ seq.push(s.state); if(s.state==='jupturn') pre={x:c.obj.position.x,z:c.obj.position.z}; }
      if(s.state==='jup'){ upY.push(c.obj.position.y); if(s.clip==='cat_jump_up') clipUp=true; } if(s.state==='sleep'&&seq.includes('jup')) break; }
    for(let i=0;i<30;i++) zone.update(0.1,E3); s=st(); const o=c.obj; let dy=o.rotation.y-(L0?L0.yaw:0); dy=Math.atan2(Math.sin(dy),Math.cos(dy));
    const okPre=!!pre&&!!L0&&Math.abs(pre.z-(L0.z+0.30))<0.03&&Math.abs(pre.x-L0.x)<0.05;
    const okLie=!!L0&&s.state==='sleep'&&s.lie==='bench'&&c.lieAnim&&s.clip==='cat_lie_idle'&&Math.abs(o.position.y-L0.y)<0.002&&Math.hypot(o.position.x-L0.x,o.position.z-L0.z)<0.01&&Math.abs(dy)<0.05&&!lieVerts().length;
    check('3 傍晚：走到座面前 0.30 m → 轉向座面 → 跳上去（cat_jump_up）→ 落在趴的位置、播 cat_lie_idle、轉到趴的方向', seq.includes('prejump')&&seq.indexOf('jupturn')>seq.indexOf('prejump')&&seq.indexOf('jup')>seq.indexOf('jupturn')&&clipUp&&upY.every(y=>Math.abs(y)<0.01)&&okPre&&okLie,
      JSON.stringify({seq:seq.slice(-6),clipUp,pre:pre&&[f3(pre.x),f3(pre.z)],pos:[f3(o.position.x),f3(o.position.y),f3(o.position.z)],dyaw:f3(dy),clip:s.clip})); }
  /* 4 白天 hold／release */
  await enter(mkG(10)); { for(let i=0;i<30;i++) zone.update(0.1,E3); const c=C(), o=c.obj, P={x:o.position.x,z:o.position.z};
    WZCAT.hold('lie'); for(let i=0;i<10;i++) zone.update(0.1,E3); const s1=st(), onBench=!!L0&&Math.abs(o.position.y-L0.y)<0.002&&c.lieAnim&&s1.clip==='cat_lie_idle'&&s1.state==='sleep';
    WZCAT.release(); zone.update(0.1,E3); const back=Math.hypot(o.position.x-P.x,o.position.z-P.z)<0.05&&Math.abs(o.position.y)<0.01&&!c.lieAnim;
    check('4 白天 hold：趴在圓椅上（cat_lie_idle）；release：回到 hold 前的位置', onBench&&back, JSON.stringify({onBench,back,P:[f3(P.x),f3(P.z)],now:[f3(o.position.x),f3(o.position.y),f3(o.position.z)]})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
