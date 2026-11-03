// 溫州街小公園的貓：不懸空、會自己醒來／回去睡、會走過來蹭腳（WZ-CAT-FLOAT-RUB-1103／USER_WANTS X186；使用者 11-03「懸空的橘貓」「要會動吧」「會走過來蹭」）。
// 檢查：
//   A. 趴在老樹圓椅上的貓整隻在座面上、底部貼座面——座面從 wz_park.glb 的 park_wood 量、貓從 wz_cat.glb 的 CAT_lie 頂點量（用真的溫州街區域建出來、真的放模型的程式）。
//   B. 下雨／寒流在涼亭石桌底下：不插進石桌底座（park3_props 量）、不碰到石凳、底部貼涼亭地台。
//   C. 醒著、睡著不是只在進溫州街那一刻判斷：06:48 進公園、到了 09:00 貓會醒來走；17:30 以後走回圓椅前、趴上去；趴著的時候會呼吸。
//   D. 蹭腳：玩家站著不動 3 秒 → 貓走到腳邊 → 沿著腳邊繞（半圈以上）→ 坐在旁邊；貓的中心一直在玩家碰撞半徑＋貓半寬以外；玩家一動就停；冷卻；機率沒中、坐著、劇情在演、晚上都不蹭。
// 不需要瀏覽器。用法：node tests/wz_cat_float_rub_unit.js
//   改前對照：WZ_OLD_SRC=<資料夾> node tests/wz_cat_float_rub_unit.js（那個資料夾裡的 src/zones3d.js、src/wzcat3d.js 取代目前的）
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
  /* ===== A. 晚上 22:00：趴在圓椅上 ===== */
  await enter(mkG(22)); { const V=lieVerts(), b=V.length?box(V):null, E=0.006;
    check('A1. 晚上公園有趴著的貓（CAT_lie 看得到）',V.length>100,V.length+' 個頂點');
    if(b){ const inZ=b.z0>=SEAT.z0-E&&b.z1<=SEAT.z1+E, inX=b.x0>=SEAT.x0-E&&b.x1<=SEAT.x1+E;
      check('A2. 整隻在座面上（徑向 z '+f3(b.z0)+'～'+f3(b.z1)+' 在座面 '+f3(SEAT.z0)+'～'+f3(SEAT.z1)+' 裡；沿著圓椅 x '+f3(b.x0)+'～'+f3(b.x1)+'）',inZ&&inX);
      check('A3. 底部貼座面（貓的底 '+f3(b.y0)+'、座面頂 '+f3(SEAT.top)+'，差 5 mm 以內）',Math.abs(b.y0-SEAT.top)<=0.005); }
    const it=E3.interactables.find(q=>q.park==='cat'); check('A4. 「摸摸」的互動點照舊在圓椅外（26, 22.85）、從步道站得到的地方摸得到（1.4 m 內有站得住的點）',!!it&&Math.abs(it.x-26)<1e-6&&Math.abs(it.z-22.85)<1e-6&&(()=>{ for(let dx=-1.3;dx<=1.3;dx+=0.1) for(let dz=-1.3;dz<=1.3;dz+=0.1) if(dx*dx+dz*dz<=1.35*1.35&&E3.canStand(it.x+dx,it.z+dz,0.32,0)) return true; return false; })());
    let br=null; const lo=catG().getObjectByName('CAT_lie'); const top=lo&&lo.parent; if(top){ const ys=[]; for(let i=0;i<40;i++){ zone.update&&zone.update(0.1,E3); ys.push(top.scale.y); } br=[Math.min(...ys),Math.max(...ys)]; }
    check('A5. 趴著會呼吸（整隻上下起伏：scale.y 在 4 秒裡有變化）',!!br&&br[1]-br[0]>0.02,br&&br.map(f3).join('～')); }
  /* ===== B. 下雨、寒流：石桌底下 ===== */
  for(const [nm,G,pose] of [['下雨',mkG(9,{weather:'rain'}),'CAT_lie'],['寒流（2028-12-12）',mkG(22,{day:dayOf('2028-12-12')}),'CAT_curl']]){ await enter(G); const V=lieVerts();
    const vis=[]; catG().traverse(o=>{ if(o.isMesh&&/^CAT_(lie|curl)$/.test(o.name)){ let ok=true; for(let p=o;p&&p!==zone.group;p=p.parent) if(!p.visible) ok=false; if(ok) vis.push(o.name); } });
    const bad=V.filter(v=>{ const r=Math.hypot(v[0]-pav.x,v[2]-pav.z); return r<pedR(v[1])+0.005; }), b=V.length?box(V):null, rmax=V.length?Math.max(...V.map(v=>Math.hypot(v[0]-pav.x,v[2]-pav.z))):0;
    const st=stool.v.filter(v=>v[1]>0.14&&v[1]<0.6), hitStool=V.filter(v=>st.some(s=>Math.abs(s[0]-v[0])<0.01&&Math.abs(s[2]-v[2])<0.01&&s[1]>v[1]-0.05)).length;
    check('B1. '+nm+'：石桌底下是 '+pose+'、不插進石桌底座（插進去的頂點 '+bad.length+'）、不碰到石凳（最遠 '+f3(rmax)+' m；石凳內緣約 0.74）',vis.includes(pose)&&V.length>100&&!bad.length&&rmax<0.72&&!hitStool);
    check('B2. '+nm+'：底部貼涼亭地台（貓的底 '+(b?f3(b.y0):'?')+'、地台 0.14）',!!b&&Math.abs(b.y0-0.14)<=0.006); }
  /* ===== C. 時間到了自己醒來、回去睡 ===== */
  await enter(mkG(6.8)); { for(let i=0;i<20;i++) zone.update(0.1,E3); const s0=WZCAT.state(); GAME.G.hour=9;
    const seen=new Set(); let moved=0, prev=null; for(let i=0;i<1200;i++){ zone.update(0.1,E3); const s=WZCAT.state(); if(!s) break; seen.add(s.state); if(prev) moved+=Math.hypot(s.x-prev.x,s.z-prev.z); prev=s; }
    check('C1. 06:48 進公園（貓趴著睡）、到了 09:00：貓醒來、站起來、在公園裡走',!!s0&&s0.state==='sleep'&&['rise','look','walk'].every(k=>seen.has(k))&&moved>1,JSON.stringify({s0:s0&&s0.state,seen:[...seen],moved:+moved.toFixed(2)}));
    const lv=lieVerts(); check('C1. 醒來以後圓椅上沒有趴著的貓（不會兩隻）',!lv.length);
    E3.player.obj.position.set(26,0,6); GAME.G.hour=17.6; let s=null; for(let i=0;i<4000;i++){ zone.update(0.1,E3); s=WZCAT.state(); if(s&&s.state==='sleep') break; }
    const V=lieVerts(), b=V.length?box(V):null;
    check('C2. 17:36：貓走回圓椅前、趴到圓椅上（state sleep；趴的位置在座面上）',!!s&&s.state==='sleep'&&s.lie==='bench'&&!!b&&b.z0>=SEAT.z0-0.006&&b.z1<=SEAT.z1+0.006&&Math.abs(b.y0-SEAT.top)<=0.005,JSON.stringify(s)); }
  /* ===== D. 蹭腳 ===== */
  await enter(mkG(10)); { const c=WZCAT._cat&&WZCAT._cat(); check('D0. 白天 10:00：WZCAT 接手（走路的貓）',!!c&&c.state!=='sleep');
    if(c&&WZCAT.RUB){ let r=0.3; c.rnd=()=>r;   /* 0.3：中籤（<0.55）、順時針、繞 1.3 圈的半圈…、繞完坐在旁邊 */
      const P=E3.player.obj.position, PR=0.33, CATW=0.108; P.set(26,0,24.4); c.state='look'; c.t=99; c.rubCd=0; c.anchor=null;
      const log=[]; let minD=9, tRub=-1, tApp=-1, maxV=0, pv=null, itOK=true, yOK=true, rubD=[];
      for(let i=0;i<600;i++){ zone.update(0.1,E3); const s=WZCAT.state(), o=c.obj.position, d=Math.hypot(o.x-P.x,o.z-P.z); minD=Math.min(minD,d); if(pv){ maxV=Math.max(maxV,Math.hypot(o.x-pv.x,o.z-pv.z)/0.1); } pv={x:o.x,z:o.z};
        if(Math.abs(c.it.x-o.x)>1e-9||Math.abs(c.it.z-o.z)>1e-9) itOK=false; if(Math.abs(o.y-E3.heightAt(o.x,o.z,0))>1e-6) yOK=false;
        if(tApp<0&&s.state==='approach') tApp=i*0.1; if(tRub<0&&s.state==='rub') tRub=i*0.1; if(s.state==='rub') rubD.push(d); log.push(s.state); if(tRub>=0&&s.state==='sit') break; }
      const sw=c.rub?c.rub.swept:null, last=WZCAT.state();
      check('D1. 玩家站著不動 3 秒：貓走過來（approach 在 3.0～3.5 秒開始）',tApp>=3.0&&tApp<=3.5,'approach @'+tApp+'s');
      check('D2. 走到腳邊開始繞（rub）；繞的時候離玩家中心 '+(rubD.length?f3(Math.min(...rubD))+'～'+f3(Math.max(...rubD)):'?')+' m（貼著腳邊）',tRub>tApp&&rubD.length>20&&Math.min(...rubD)>=0.42&&Math.max(...rubD)<=0.6);
      check('D3. 貓的中心一直在玩家碰撞半徑＋貓半寬（'+(PR+CATW).toFixed(2)+' m）以外（最近 '+f3(minD)+'）、速度不超過 0.32 m/s（'+maxV.toFixed(3)+'）、高度貼地、「摸摸」跟著貓',minD>=PR+CATW&&maxV<=0.3201&&yOK&&itOK);
      const nRub=log.filter(s=>s==='rub').length; check('D4. 繞了半圈以上（'+(nRub*0.1).toFixed(1)+' 秒）、繞完坐在玩家旁邊（sit）',nRub*0.1*0.16/0.44>=Math.PI-0.05&&last.state==='sit'&&Math.hypot(c.obj.position.x-P.x,c.obj.position.z-P.z)<0.6,JSON.stringify(last));
      /* 冷卻：坐在旁邊、玩家繼續站著 → 45 秒內不再蹭 */
      let again=false; for(let i=0;i<200;i++){ zone.update(0.1,E3); if(['approach','rub'].includes(c.state)) again=true; } check('D5. 蹭完冷卻：玩家繼續站著 20 秒，不會馬上再蹭',!again);
      /* 玩家一動就停 */
      c.state='look'; c.t=99; c.rubCd=0; c.anchor=null; c.rolled=false; c.obj.position.set(26.0,0,23.3); P.set(26,0,24.4); let mid=null;
      for(let i=0;i<300;i++){ zone.update(0.1,E3); if(c.state==='rub'&&c.rub&&c.rub.swept>0.5){ mid=i; break; } }
      P.set(26.6,0,24.4); zone.update(0.1,E3); const sA=c.state, pA={x:c.obj.position.x,z:c.obj.position.z}; P.set(27.2,0,24.6); for(let i=0;i<10;i++){ zone.update(0.1,E3); P.x+=0.05; }
      check('D6. 繞到一半玩家一走：貓馬上停下來（look）、不再跟著繞',mid!=null&&sA==='look'&&Math.hypot(c.obj.position.x-pA.x,c.obj.position.z-pA.z)<0.05,JSON.stringify({mid,sA}));
      /* 沒中籤、坐著、劇情在演、晚上：不蹭 */
      const tryRub=(setup,n)=>{ c.state='look'; c.t=99; c.rubCd=0; c.anchor=null; c.rolled=false; c.obj.position.set(26.0,0,23.3); P.set(26,0,24.4); setup(); let hit=false; for(let i=0;i<(n||80);i++){ zone.update(0.1,E3); if(['approach','rub'].includes(c.state)) hit=true; } return hit; };
      r=0.9; const miss=tryRub(()=>{}); r=0.3;
      check('D7. 沒中籤（45%）：不蹭，而且 20 秒內不再擲',!miss&&c.rubCd>10);
      const sat=tryRub(()=>{ E3.player.seat={x:26,z:24.4}; E3.player.frozen=true; }); E3.player.seat=null; E3.player.frozen=false;
      const bz=tryRub(()=>{ E3.player.busy=true; }); E3.player.busy=false;
      check('D8. 玩家坐著、劇情在演（玩家忙）：不蹭',!sat&&!bz);
      GAME.G.hour=19; const night=tryRub(()=>{},200); GAME.G.hour=10;
      check('D9. 晚上 19:00（貓要回去睡）：不蹭',!night); }
    else check('D1. WZCAT 有蹭腳（WZCAT.RUB）',false); }
  delete global.GAME;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
