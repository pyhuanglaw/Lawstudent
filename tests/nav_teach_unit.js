// 公共教學館模板（src/teach3d.js；D55 第二階段）的導航——不需要瀏覽器。第一棟：共同教學館（src/data/gongtong_layout.js）。
// 用引擎真正的找路＋移動碰撞（走路 30 fps、跑步＋低幀率）檢查：
//   進門的位置站得住、離出口夠遠（不會一進來就跳出「走出」）；走得到出口；
//   每一個座位（教室 64 個、休息區、自習區、長椅）的「坐下」位置（GAME.seatApproach 的規則）站得住、從大門走得到；
//   樓梯：大廳 → A 跑 → 平台 → B 跑 → 二樓走廊（高度一階一階、換到第 1 層）；二樓 → 一樓；
//   關著的房間（管理室、203、洗手間）走不進去；二樓的樓梯井掉不下去；
//   沒有「只有一點站得住」的小孤島（滑進去就出不來，v9.3 #31）；校園的出口位置站得住。
//   牆擋得住：每一道牆（門洞以外）上站不住、走廊到教室的路一定繞門（2026-10-13：導航格原點讓橫的牆壓在格子邊界上，人可以直接穿牆，這一項在那一版會失敗）；
//   共 101 階梯教室：五排平台一排比一排高 0.3 m、兩側走道每排兩階（畫面一階一階）；從大門走得到每一排的走道（高度對）；
//   從講台到座位一定經過兩側走道（不能跨過桌子、前緣的高低差站不上去）；椅子站不上去；座位的高度＝那一排的平台。
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
    for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, zz=st.z+dz; if(!E.canStand(x,zz,0.3,lv)) continue; if(st.y!=null&&Math.abs(E.heightAt(x,zz,lv)-st.y)>0.2) continue;   /* 階梯教室：要站在那一排的平台上（GAME.seatApproach 的規則）*/ const r=walk([SP.x,SP.z,0],[x,zz,lv]); if(r.ok){ ok=true; break; } why=r.reason||'走不到'; }
    if(ok) n++; else bad.push((st.room||st.kind)+'('+st.x+','+st.z+(lv?',2F':'')+')：'+why); }
  check('每一個座位旁邊站得住、從大門走得到（'+n+'/'+z.seats.length+'）',!bad.length,bad.slice(0,5).join(' | ')); }
// 樓梯
{ const H=(x,zz,lv)=>E.levels[lv].heightAt(x,zz); const S=L.stair, A=S.A, B=S.B;
  check('樓梯的高度：A 跑底 0、平台 2.184、B 跑頂 4.2（兩層共用）',Math.abs(H((A.x0+A.x1)/2,A.z1-0.05,0))<0.05&&Math.abs(H((A.x0+A.x1)/2,(S.landing.z0+S.landing.z1)/2,0)-2.184)<0.02&&Math.abs(H((B.x0+B.x1)/2,B.z1-0.05,1)-4.2)<0.05,
    [H((A.x0+A.x1)/2,A.z1-0.05,0).toFixed(2),H((A.x0+A.x1)/2,(S.landing.z0+S.landing.z1)/2,0).toFixed(2),H((B.x0+B.x1)/2,B.z1-0.05,1).toFixed(2)].join(' / '));
  let r=walk([SP.x,SP.z,0],[0,1.0,1]); check('大廳 → A 跑 → 平台 → B 跑 → 二樓走廊（第 1 層、4.2 m）',r.ok,JSON.stringify(r).slice(0,180));
  r=walk([-7.6,1.0,1],[SP.x,SP.z,0]); check('二樓走廊 → 樓梯 → 一樓大廳',r.ok,JSON.stringify(r).slice(0,180));
  r=walk([0,1.0,1],[-8.0,4.4,1]); check('二樓走廊 → 自習區（兩排桌子中間的走道）',r.ok,JSON.stringify(r).slice(0,160));
  check('二樓的樓梯井掉不下去（A 跑上方、平台上方站不住）',!E.canStand((A.x0+A.x1)/2,-2.4,0.32,1)&&!E.canStand(-1.6,(S.landing.z0+S.landing.z1)/2,0.32,1)); }
// 椅子（使用者 2026-10-13 驗收：「自習桌不會讓玩家穿過椅子」）：自習區、休息區的椅子站不上去（走不過去），但每個位子都坐得到（上面的座位檢查）
{ const ch=z.seats.filter(q=>q.kind==='study'||q.kind==='lounge'); const thru=ch.filter(q=>E.canStand(q.x,q.z,0.32,q.lv|0)); check('自習區、休息區的 '+ch.length+' 張椅子走不過去（不能穿過椅子）',ch.length>=10&&!thru.length,thru.map(q=>q.kind+'('+q.x+','+q.z+')').join(' ')); }
// 關著的房間、教室
{ const closed=L.rooms.filter(r=>r.kind==='closed'); const bad=closed.filter(r=>E.canStand((r.x0+r.x1)/2,(r.z0+r.z1)/2,0.32,r.lv)); check('關著的房間（203、洗手間）走不進去；門口有看得懂的說明',!bad.length&&closed.every(r=>E.interactables.some(i=>i.label===r.label&&i.look)),bad.map(r=>r.id).join(','));
  for(const id of ['102','201','202']){ const r=L.rooms.find(q=>q.id===id); const p=[(r.x0+r.x1)/2,-4.0,r.lv]; const w=walk([SP.x,SP.z,0],p); check('教室 '+id+'：從大門走得進去（走到中間的走道）',w.ok,JSON.stringify(w).slice(0,140)); } }
// 牆擋得住：每一道牆（門洞以外、離牆端 0.3 m 以內不算）上站不住；走廊 → 教室的路一定繞門（不是直線穿牆）
{ const bad=[]; for(const w of L.walls){ const horiz=Math.abs(w.z0-w.z1)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
    for(let a=a0+0.3;a<=a1-0.3+1e-6;a+=0.2){ if((w.gaps||[]).some(g=>a>g[0]-0.45&&a<g[1]+0.45)) continue; const x=horiz?a:w.x0, zz=horiz?w.z0:a; if(E.canStand(x,zz,0.3,w.lv)) bad.push(`(${x.toFixed(1)},${zz.toFixed(1)}${w.lv?',2F':''})`); } }
  check('牆擋得住：每一道牆（門洞以外）上都站不住',!bad.length,bad.length+' 個點：'+bad.slice(0,6).join(' '));
  const plen=p=>{ let d=0, px=null; for(const q of p){ if(px) d+=Math.hypot(q[0]-px[0],q[1]-px[1]); px=q; } return d; };
  for(const [lv,a,b,name] of [[0,[-7.6,1.0],[-7.6,-2.0],'一樓走廊 → 102'],[1,[-7.6,1.0],[-7.6,-2.0],'二樓走廊 → 201'],[1,[7.6,1.0],[7.6,-2.0],'二樓走廊 → 202']]){ const p=E.pathTo(a[0],a[1],lv,b[0],b[1],lv); const L0=p?plen([a,...p]):0, d=Math.hypot(b[0]-a[0],b[1]-a[1]);
    check(name+'：路線經過門口（不是直線穿牆）',p&&p.length>1&&L0>d*1.25,`直線 ${d.toFixed(1)} m、路線 ${L0.toFixed(1)} m`); }
  { const r=L.rooms.find(q=>q.kind==='lecture'), D0=r.door; const a=[2.0,3.0], b=[6.0,4.0]; const p=E.pathTo(a[0],a[1],r.lv,b[0],b[1],r.lv); const xs=[]; let q0=a; for(const q of (p||[])){ if((q0[0]-D0.x)*(q[0]-D0.x)<0){ const t=(D0.x-q0[0])/(q[0]-q0[0]); xs.push(+(q0[1]+(q[1]-q0[1])*t).toFixed(2)); } q0=q; }
    check('大廳 → 共 101 講台：路線從門口（z '+D0.a0+'～'+D0.a1+'）穿過西牆，不是直線穿牆',p&&xs.length===1&&xs[0]>D0.a0&&xs[0]<D0.a1,'穿過西牆的位置 z='+xs.join(',')); } }
// 共 101 階梯教室
{ const r=L.rooms.find(q=>q.kind==='lecture'); const up=r.stage==='S'?-1:1, sx=(r.seatX0+r.seatX1)/2, n0=E.levels[r.lv];
  const hs=r.rowsData.map(q=>+n0.heightAt(sx,q.front+up*1.6).toFixed(3)); check('共 101：五排平台一排比一排高 0.3 m（椅子後面的走道）',r.rowsData.length===5&&r.rowsData.every((q,i)=>Math.abs(hs[i]-0.3*(i+1))<0.01),hs.join(' / '));
  const ac=(r.aisles[0][0]+r.aisles[0][1])/2; const vs=r.rowsData.map(q=>[n0.visualHeightAt(ac,q.front+up*0.25),n0.visualHeightAt(ac,q.front+up*0.75),n0.visualHeightAt(ac,q.front+up*1.5)].map(v=>+v.toFixed(2)));
  check('共 101：兩側走道每排兩階（畫面上一階 0.15 m）、後半和那一排的平台一樣高',r.rowsData.every((q,i)=>Math.abs(vs[i][0]-(q.yPrev+0.15))<0.01&&Math.abs(vs[i][1]-q.y)<0.01&&Math.abs(vs[i][2]-q.y)<0.01),JSON.stringify(vs));
  const bad=[]; for(const q of r.rowsData){ const w=walk([SP.x,SP.z,0],[sx,q.front+up*1.55,r.lv]); const w1=E.simWalk(SP.x,SP.z,sx,q.front+up*1.55,{lv0:0,lv1:r.lv,dt:1/30,speed:1.8}); if(!w.ok||!w1.ok||Math.abs(w1.y-q.y)>0.05) bad.push('第 '+(q.r+1)+' 排：'+JSON.stringify(w).slice(0,100)+' 到達高度 '+w1.y); const b=walk([sx,q.front+up*1.55,r.lv],[SP.x,SP.z,0]); if(!b.ok) bad.push('第 '+(q.r+1)+' 排回大廳：'+JSON.stringify(b).slice(0,100)); }
  check('共 101：從大門走得到每一排椅子後面的走道（高度＝那一排）、走得回大廳',!bad.length,bad.slice(0,3).join(' | '));
  const p=E.pathTo(sx,(r.rowsData[0].front+r.z1)/2+0.3,r.lv,sx,r.rowsData[0].front+up*1.55,r.lv); const viaAisle=p&&p.some(q=>r.aisles.some(a=>q[0]>=a[0]-0.05&&q[0]<=a[1]+0.05&&Math.abs(q[1]-r.rowsData[0].front)<1.2));
  check('共 101：從講台到第 1 排的座位要繞到兩側走道（不能跨過桌子）',!!viaAisle,p?JSON.stringify(p.map(q=>[+q[0].toFixed(1),+q[1].toFixed(1)])):'no path');
  const edge=[]; for(const q of r.rowsData) for(let x=r.seatX0+0.4;x<r.seatX1-0.3;x+=0.5) for(const dz of [-0.12,0.12]) if(E.canStand(x,q.front+dz,0.3,r.lv)) edge.push(`(${x.toFixed(1)},${(q.front+dz).toFixed(2)})`);
  check('共 101：每一排前緣（高低差 0.3 m）上站不住',!edge.length,edge.slice(0,5).join(' '));
  const lec=z.seats.filter(q=>q.kind==='lecture'); check('共 101：40 個座位、高度＝那一排的平台、椅子站不上去',lec.length===40&&lec.every(q=>Math.abs(q.y-0.3*(q.row+1))<0.001)&&!lec.some(q=>E.canStand(q.x,q.z,0.3,q.lv|0)),lec.length+' 個');
  const wm=(z.walkMeshes||[]).filter(m=>m.userData.walkLv===r.lv&&m.position.y>0.2); check('共 101：每一排有點地面用的平面（點座位區會走到那一排）',wm.length>=5,wm.length+' 個'); }
// 小孤島：每一個站得住的格子都要能走到大廳（取樣，每 0.8 m）
{ const isl=[]; for(const lv of [0,1]){ for(let x=-L.W/2+0.6;x<L.W/2-0.4;x+=0.8) for(let zz=-L.D/2+0.6;zz<L.D/2-0.4;zz+=0.8){ if(!E.canStand(x,zz,0.32,lv)) continue; const p=E.pathTo(x,zz,lv,SP.x,SP.z,0); if(!p||!p.length) isl.push(`(${x.toFixed(1)},${zz.toFixed(1)}${lv?',2F':''})`); } }
  check('沒有走不回大廳的小孤島（每 0.8 m 取樣）',!isl.length,isl.slice(0,6).join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
