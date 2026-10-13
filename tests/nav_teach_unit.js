// 公共教學館模板（src/teach3d.js；D55 第二階段）的導航——不需要瀏覽器。第一棟：共同教學館（src/data/gongtong_layout.js）。
// 用引擎真正的找路＋移動碰撞（走路 30 fps、跑步＋低幀率）檢查：
//   進門的位置站得住、離出口夠遠（不會一進來就跳出「走出」）；走得到出口；
//   每一個座位（教室 64 個、休息區、自習區、長椅）的「坐下」位置（GAME.seatApproach 的規則）站得住、從大門走得到；
//   樓梯：大廳 → A 跑 → 平台 → B 跑 → 二樓走廊（高度一階一階、換到第 1 層）；二樓 → 一樓；
//   關著的房間（管理室、203、洗手間）走不進去；二樓的樓梯井掉不下去；
//   沒有「只有一點站得住」的小孤島（滑進去就出不來，v9.3 #31）；校園的出口位置站得住。
// 用法：node tests/nav_teach_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const z=loadZone('gongtong'); const L=GONGTONG_LAYOUT; const SP=L.entrance.spawn, EX=L.entrance.exit;
check('區域建得起來：兩層導航、'+(z.seats||[]).length+' 個座位',z.levels&&z.levels.length===2&&z.seats.length>=70,(z.seats||[]).length+' 個');
check('進門的位置站得住、離出口 > 出口半徑（不會一進來就跳出「走出共同教學館」）',E.canStand(SP.x,SP.z,0.32,0)&&Math.hypot(SP.x-EX.x,SP.z-EX.z)>EX.r,`距離 ${Math.hypot(SP.x-EX.x,SP.z-EX.z).toFixed(2)}`);
{ const ex=E.interactables.find(i=>i.exit&&i.exit.to==='campus'); let p=null; for(let rr=0;rr<=ex.radius-0.05&&!p;rr+=0.1) for(let a=0;a<24;a++){ const x=ex.x+Math.cos(a/24*Math.PI*2)*rr, zz=ex.z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(x,zz,0.32,0)){ p=[x,zz]; break; } }
  const r=p?walk([SP.x,SP.z,0],[p[0],p[1],0]):{ok:false}; check('從大廳走得到出口（「走出共同教學館」）',r.ok,JSON.stringify(r).slice(0,160)); }
// 座位：照 GAME.seatApproach 的候選位置（前 0.5、後 0.6、左右 0.55、前 0.8、後 0.9），至少一個站得住、高度對、走得到
{ const bad=[]; let n=0; for(const st of z.seats){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=st.lv|0; let ok=false, why='沒有站得住的位置';
    for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, zz=st.z+dz; if(!E.canStand(x,zz,0.3,lv)) continue; const r=walk([SP.x,SP.z,0],[x,zz,lv]); if(r.ok){ ok=true; break; } why=r.reason||'走不到'; }
    if(ok) n++; else bad.push((st.room||st.kind)+'('+st.x+','+st.z+(lv?',2F':'')+')：'+why); }
  check('每一個座位旁邊站得住、從大門走得到（'+n+'/'+z.seats.length+'）',!bad.length,bad.slice(0,5).join(' | ')); }
// 樓梯
{ const H=(x,zz,lv)=>E.levels[lv].heightAt(x,zz); const S=L.stair, A=S.A, B=S.B;
  check('樓梯的高度：A 跑底 0、平台 2.184、B 跑頂 4.2（兩層共用）',Math.abs(H((A.x0+A.x1)/2,A.z1-0.05,0))<0.05&&Math.abs(H((A.x0+A.x1)/2,(S.landing.z0+S.landing.z1)/2,0)-2.184)<0.02&&Math.abs(H((B.x0+B.x1)/2,B.z1-0.05,1)-4.2)<0.05,
    [H((A.x0+A.x1)/2,A.z1-0.05,0).toFixed(2),H((A.x0+A.x1)/2,(S.landing.z0+S.landing.z1)/2,0).toFixed(2),H((B.x0+B.x1)/2,B.z1-0.05,1).toFixed(2)].join(' / '));
  let r=walk([SP.x,SP.z,0],[0,1.0,1]); check('大廳 → A 跑 → 平台 → B 跑 → 二樓走廊（第 1 層、4.2 m）',r.ok,JSON.stringify(r).slice(0,180));
  r=walk([-7.6,1.0,1],[SP.x,SP.z,0]); check('二樓走廊 → 樓梯 → 一樓大廳',r.ok,JSON.stringify(r).slice(0,180));
  r=walk([0,1.0,1],[-8.0,4.2,1]); check('二樓走廊 → 自習區',r.ok,JSON.stringify(r).slice(0,160));
  check('二樓的樓梯井掉不下去（A 跑上方、平台上方站不住）',!E.canStand((A.x0+A.x1)/2,-2.4,0.32,1)&&!E.canStand(-1.6,(S.landing.z0+S.landing.z1)/2,0.32,1)); }
// 關著的房間、教室
{ const closed=L.rooms.filter(r=>r.kind==='closed'); const bad=closed.filter(r=>E.canStand((r.x0+r.x1)/2,(r.z0+r.z1)/2,0.32,r.lv)); check('關著的房間（管理室、203、洗手間）走不進去；門口有看得懂的說明',!bad.length&&closed.every(r=>E.interactables.some(i=>i.label===r.label&&i.look)),bad.map(r=>r.id).join(','));
  for(const id of ['101','102','201','202']){ const r=L.rooms.find(q=>q.id===id); const p=[(r.x0+r.x1)/2,-4.0,r.lv]; const w=walk([SP.x,SP.z,0],p); check('教室 '+id+'：從大門走得進去（走到中間的走道）',w.ok,JSON.stringify(w).slice(0,140)); } }
// 小孤島：每一個站得住的格子都要能走到大廳（取樣，每 0.8 m）
{ const isl=[]; for(const lv of [0,1]){ for(let x=-L.W/2+0.6;x<L.W/2-0.4;x+=0.8) for(let zz=-L.D/2+0.6;zz<L.D/2-0.4;zz+=0.8){ if(!E.canStand(x,zz,0.32,lv)) continue; const p=E.pathTo(x,zz,lv,SP.x,SP.z,0); if(!p||!p.length) isl.push(`(${x.toFixed(1)},${zz.toFixed(1)}${lv?',2F':''})`); } }
  check('沒有走不回大廳的小孤島（每 0.8 m 取樣）',!isl.length,isl.slice(0,6).join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
