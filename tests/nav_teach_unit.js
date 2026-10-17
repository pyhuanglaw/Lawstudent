// 公共教學館模板（src/teach3d.js；D55）的導航——不需要瀏覽器。共同、博雅、普通教學館（src/data/*_layout.js）用同一套檢查。
// 用引擎真正的找路＋移動碰撞（走路 30 fps、跑步＋低幀率）檢查：
//   進門的位置站得住、離出口夠遠（不會一進來就跳出「走出」）；走得到出口；
//   每一個座位（教室、階梯教室、休息區、自習區、沙發、討論桌、長椅）的「坐下」位置（GAME.seatApproach 的規則：站得住、高度對）站得住、從大門走得到；
//   樓梯：大廳 → A 跑 → 平台 → B 跑 → 二樓（高度一階一階、換到第 1 層）；二樓 → 一樓；二樓的樓梯井掉不下去；
//   椅子、沙發站不上去（使用者 2026-10-13：「自習桌不會讓玩家穿過椅子」）；關著的房間走不進去、門口的說明走得到；
//   牆擋得住：每一道牆（門洞以外）上站不住、走廊到教室的路一定繞門（2026-10-13：導航格原點讓橫的牆壓在格子邊界上，人可以直接穿牆，這一項在那一版會失敗）；
//   階梯教室：平台一排比一排高 0.3 m、兩側走道每排兩階（畫面一階一階）；從大門走得到每一排的走道（高度對）；
//   從講台到座位一定經過兩側走道（不能跨過桌子、前緣的高低差站不上去）；座位的高度＝那一排的平台；門是唯一的入口；
//   沒有「只有一點站得住」的小孤島（滑進去就出不來，v9.3 #31）。
// 用法：node tests/nav_teach_unit.js [gongtong|boya|putong]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; let tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const plen=p=>{ let d=0, px=null; for(const q of p){ if(px) d+=Math.hypot(q[0]-px[0],q[1]-px[1]); px=q; } return d; };

function runZone(id,L,minSeats){ tag='['+L.name+'] '; const z=loadZone(id); const SP=L.entrance.spawn, EX=L.entrance.exit, Y1=L.floors[1].y;
  check('區域建得起來：兩層導航、'+(z.seats||[]).length+' 個座位',z.levels&&z.levels.length===2&&z.seats.length>=minSeats,(z.seats||[]).length+' 個');
  check('進門的位置站得住、離出口 > 出口半徑（不會一進來就跳出「走出」）',E.canStand(SP.x,SP.z,0.32,0)&&Math.hypot(SP.x-EX.x,SP.z-EX.z)>EX.r,`距離 ${Math.hypot(SP.x-EX.x,SP.z-EX.z).toFixed(2)}`);
  { const ex=E.interactables.find(i=>i.exit&&i.exit.to==='campus'); let p=null; for(let rr=0;rr<=ex.radius-0.05&&!p;rr+=0.1) for(let a=0;a<24;a++){ const x=ex.x+Math.cos(a/24*Math.PI*2)*rr, zz=ex.z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(x,zz,0.32,0)){ p=[x,zz]; break; } }
    const r=p?walk([SP.x,SP.z,0],[p[0],p[1],0]):{ok:false}; check('從大廳走得到出口（「走出'+L.name+'」）',r.ok,JSON.stringify(r).slice(0,160)); }
  // 座位：照 GAME.seatApproach 的候選位置（前 0.5、後 0.6、左右 0.55、前 0.8、後 0.9），至少一個站得住、高度對、走得到
  { const bad=[]; let n=0; for(const st of z.seats){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=st.lv|0; let ok=false, why='沒有站得住的位置';
      for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=st.x+dx, zz=st.z+dz; if(!E.canStand(x,zz,0.3,lv)) continue; if(st.y!=null&&Math.abs(E.heightAt(x,zz,lv)-st.y)>0.2) continue;   /* 階梯教室：要站在那一排的平台上（GAME.seatApproach 的規則）*/
        const r=walk([SP.x,SP.z,0],[x,zz,lv]); if(r.ok){ ok=true; break; } why=r.reason||'走不到'; }
      if(ok) n++; else bad.push((st.room||st.kind)+'('+st.x+','+st.z+(lv?',2F':'')+')：'+why); }
    check('每一個座位旁邊站得住、從大門走得到（'+n+'/'+z.seats.length+'）',!bad.length,bad.slice(0,5).join(' | ')); }
  // 坐下按鈕：每個座位，站在它的互動範圍裡、站得住、走得到的地方，最近的互動點就是它（不會被旁邊的位子、別的互動點搶走）——真的玩家看到按鈕才坐得下
  { const bad=[]; const P=E.player; for(const it of E.interactables.filter(i=>i.seat)){ const lv=it.lv|0; let ok=false;
      for(let rr=0;rr<it.radius-0.02&&!ok;rr+=0.1) for(let a=0;a<16&&!ok;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*rr, zz=it.z+Math.sin(a/16*Math.PI*2)*rr; if(!E.canStand(x,zz,0.3,lv)) continue;
        P.obj.position.set(x,E.heightAt(x,zz,lv),zz); P.lv=lv; if(E.nearestInteractable()!==it) continue; const p=E.pathTo(SP.x,SP.z,0,x,zz,lv); if(p&&p.length) ok=true; }
      if(!ok) bad.push(it.label+'('+it.seat.x+','+it.seat.z+(lv?',2F':'')+')'); }
    P.obj.position.set(0,0,0); P.lv=0; check('每個座位：站在旁邊會出現它的「坐下」按鈕（不會被旁邊的位子或別的互動點搶走）',!bad.length,bad.length+' 個：'+bad.slice(0,5).join(' | ')); }
  // 樓梯
  { const H=(x,zz,lv)=>E.levels[lv].heightAt(x,zz); const S=L.stair, A=S.A, B=S.B, LD=S.landing, bx=(B.x0+B.x1)/2;
    check('樓梯的高度：A 跑底 0、平台 '+LD.y+'、B 跑頂 '+Y1+'（兩層共用）',Math.abs(H((A.x0+A.x1)/2,A.z1-0.05,0))<0.05&&Math.abs(H((A.x0+A.x1)/2,(LD.z0+LD.z1)/2,0)-LD.y)<0.02&&Math.abs(H(bx,B.z1-0.05,1)-Y1)<0.05,
      [H((A.x0+A.x1)/2,A.z1-0.05,0).toFixed(2),H((A.x0+A.x1)/2,(LD.z0+LD.z1)/2,0).toFixed(2),H(bx,B.z1-0.05,1).toFixed(2)].join(' / '));
    const top=[bx,B.z1+1.2,1]; let r=walk([SP.x,SP.z,0],top); check('大廳 → A 跑 → 平台 → B 跑 → 二樓（第 1 層、'+Y1+' m）',r.ok,JSON.stringify(r).slice(0,180));
    r=walk(top,[SP.x,SP.z,0]); check('二樓 → 樓梯 → 一樓大廳',r.ok,JSON.stringify(r).slice(0,180));
    check('二樓的樓梯井掉不下去（A 跑上方、平台上方站不住）',!E.canStand((A.x0+A.x1)/2,(A.z0+A.z1)/2,0.32,1)&&!E.canStand((A.x0+LD.x1)/2,(LD.z0+LD.z1)/2,0.32,1)); }
  // 椅子、沙發（使用者 2026-10-13 驗收：「自習桌不會讓玩家穿過椅子」）：站不上去，但每個位子都坐得到（上面的座位檢查）
  { const ch=z.seats.filter(q=>q.kind!=='bench'); const thru=ch.filter(q=>E.canStand(q.x,q.z,0.32,q.lv|0)); check('教室、自習區、休息區、沙發、討論桌、階梯教室的 '+ch.length+' 張椅子都走不過去（不能穿過椅子）',ch.length>=10&&!thru.length,thru.slice(0,6).map(q=>q.kind+'('+q.x+','+q.z+')').join(' ')); }
  // 關著的房間：走不進去；門口的說明在走廊那一側、走得到
  { const closed=L.rooms.filter(r=>r.kind==='closed'); const bad=closed.filter(r=>E.canStand((r.x0+r.x1)/2,(r.z0+r.z1)/2,0.32,r.lv));
    const far=closed.filter(r=>{ const it=E.interactables.find(i=>(r.link?(i.exit&&i.label===r.link.label):(i.label===r.label&&i.look))&&(i.lv|0)===r.lv&&Math.abs(i.x-(r.door[0]+r.door[1])/2)<0.01);   /* 空橋（link）：門口是走過去的互動點 */ if(!it) return true; let ok=false; for(let a=0;a<16&&!ok;a++) for(const rr of [0,0.3,0.6]){ const x=it.x+Math.cos(a/16*Math.PI*2)*rr, zz=it.z+Math.sin(a/16*Math.PI*2)*rr; if(E.canStand(x,zz,0.3,r.lv)&&walk([SP.x,SP.z,0],[x,zz,r.lv]).ok){ ok=true; break; } } return !ok; });
    check('關著的房間（'+closed.map(r=>r.id).join('、')+'）走不進去；門口有看得懂的說明、走得到（不在建築外面）',!bad.length&&!far.length,bad.map(r=>r.id).join(',')+' 走不到說明：'+far.map(r=>r.id).join(',')); }
  // 平面教室：走得進去（中間的走道）；從走廊進去的路一定繞門
  for(const r of L.rooms.filter(q=>q.kind==='classroom')){ const cx=(r.x0+r.x1)/2, dz=r.doorZ!=null?r.doorZ:-0.4; const dzs=[...new Set(r.desks.map(d=>d.z))].sort((a,b)=>a-b); const p=[cx,(dzs[0]+dzs[dzs.length-1])/2,r.lv];   /* 兩排桌子中間的走道 */ const w=walk([SP.x,SP.z,0],p); check('教室 '+r.id+'：從大門走得進去（走到中間的走道）',w.ok,JSON.stringify(w).slice(0,140));
    const a=[cx,dz+1.4], b=[cx,dz-1.6]; const pt=E.pathTo(a[0],a[1],r.lv,b[0],b[1],r.lv); const L0=pt?plen([a,...pt]):0, d=Math.hypot(b[0]-a[0],b[1]-a[1]);
    check('教室 '+r.id+'：走廊 → 教室的路線經過門口（不是直線穿牆）',pt&&pt.length>1&&L0>d*1.25,`直線 ${d.toFixed(1)} m、路線 ${L0.toFixed(1)} m`); }
  // 牆擋得住：每一道牆（門洞以外、離牆端 0.3 m 以內不算）上站不住
  { const bad=[]; for(const w of L.walls){ const horiz=Math.abs(w.z0-w.z1)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1);
      for(let a=a0+0.3;a<=a1-0.3+1e-6;a+=0.2){ if((w.gaps||[]).some(g=>a>g[0]-0.45&&a<g[1]+0.45)) continue; const x=horiz?a:w.x0, zz=horiz?w.z0:a; if(E.canStand(x,zz,0.3,w.lv)) bad.push(`(${x.toFixed(1)},${zz.toFixed(1)}${w.lv?',2F':''})`); } }
    check('牆擋得住：每一道牆（門洞以外）上都站不住',!bad.length,bad.length+' 個點：'+bad.slice(0,6).join(' ')); }
  // 階梯教室
  for(const r of L.rooms.filter(q=>q.kind==='lecture')){ const up=r.stage==='S'?-1:1, sx=(r.seatX0+r.seatX1)/2, n0=E.levels[r.lv], nm=r.label||r.id, Yb=L.floors[r.lv].y;
    const hs=r.rowsData.map(q=>+(n0.heightAt(sx,q.front+up*1.6)-Yb).toFixed(3)); check(nm+'：'+r.rows+' 排平台一排比一排高 '+r.rise+' m（椅子後面的走道）',r.rowsData.length===r.rows&&r.rowsData.every((q,i)=>Math.abs(hs[i]-r.rise*(i+1))<0.01),hs.join(' / '));
    const vs=[]; let okSteps=true; for(const ai of r.aisles){ const ac=(ai[0]+ai[1])/2; for(const q of r.rowsData){ const v=[n0.visualHeightAt(ac,q.front+up*0.25),n0.visualHeightAt(ac,q.front+up*0.75),n0.visualHeightAt(ac,q.front+up*1.5)].map(t=>+(t-Yb).toFixed(2)); vs.push(v); if(!(Math.abs(v[0]-(q.yPrev+(q.y-q.yPrev)/2))<0.01&&Math.abs(v[1]-q.y)<0.01&&Math.abs(v[2]-q.y)<0.01)) okSteps=false; } }
    check(nm+'：兩側走道每排兩階（畫面上一階 '+(r.rise/2)+' m）、後半和那一排的平台一樣高',okSteps,JSON.stringify(vs.slice(0,r.rows)));
    const bad=[]; for(const q of r.rowsData){ const w=walk([SP.x,SP.z,0],[sx,q.front+up*1.55,r.lv]); const w1=E.simWalk(SP.x,SP.z,sx,q.front+up*1.55,{lv0:0,lv1:r.lv,dt:1/30,speed:1.8}); if(!w.ok||!w1.ok||Math.abs(w1.y-Yb-q.y)>0.05) bad.push('第 '+(q.r+1)+' 排：'+JSON.stringify(w).slice(0,100)+' 到達高度 '+w1.y); const b=walk([sx,q.front+up*1.55,r.lv],[SP.x,SP.z,0]); if(!b.ok) bad.push('第 '+(q.r+1)+' 排回大廳：'+JSON.stringify(b).slice(0,100)); }
    check(nm+'：從大門走得到每一排椅子後面的走道（高度＝那一排）、走得回大廳',!bad.length,bad.slice(0,3).join(' | '));
    const far=up<0?r.z1:r.z0, stz=(r.rowsData[0].front+far)/2; const p=E.pathTo(sx,stz,r.lv,sx,r.rowsData[0].front+up*1.55,r.lv); const viaAisle=p&&p.some(q=>r.aisles.some(a=>q[0]>=a[0]-0.05&&q[0]<=a[1]+0.05&&Math.abs(q[1]-r.rowsData[0].front)<1.2));
    check(nm+'：從講台到第 1 排的座位要繞到兩側走道（不能跨過桌子）',!!viaAisle,p?JSON.stringify(p.map(q=>[+q[0].toFixed(1),+q[1].toFixed(1)])):'no path');
    const edge=[]; for(const q of r.rowsData) for(let x=r.seatX0+0.4;x<r.seatX1-0.3;x+=0.5) for(const dz of [-0.12,0.12]) if(E.canStand(x,q.front+dz,0.3,r.lv)) edge.push(`(${x.toFixed(1)},${(q.front+dz).toFixed(2)})`);
    check(nm+'：每一排前緣（高低差 '+r.rise+' m）上站不住',!edge.length,edge.slice(0,5).join(' '));
    const lec=z.seats.filter(q=>q.kind==='lecture'&&q.room===r.id); check(nm+'：'+r.seats.length+' 個座位、高度＝那一排的平台',lec.length===r.seats.length&&lec.every(q=>Math.abs(q.y-Yb-r.rise*(q.row+1))<0.001),lec.length+' 個');
    const wm=(z.walkMeshes||[]).filter(m=>m.userData.walkLv===r.lv&&m.position.y>Yb+0.2&&m.position.x>r.x0&&m.position.x<r.x1); check(nm+'：每一排有點地面用的平面（點座位區會走到那一排）',wm.length>=r.rows,wm.length+' 個');
    // 門是唯一的入口：從門外斜著走到講台，穿過那道牆的位置一定在門洞裡
    { const D0=r.door, n=D0.wall==='W'?-1:1, mid=(D0.a0+D0.a1)/2; const a=[D0.x+n*1.6,mid-1.8], b=[D0.x-n*2.4,(r.rowsData[0].front+far)/2]; const pth=E.pathTo(a[0],a[1],r.lv,b[0],b[1],r.lv); const xs=[]; let q0=a; for(const q of (pth||[])){ if((q0[0]-D0.x)*(q[0]-D0.x)<0){ const t=(D0.x-q0[0])/(q[0]-q0[0]); xs.push(+(q0[1]+(q[1]-q0[1])*t).toFixed(2)); } q0=q; }
      check(nm+'：從大廳走到講台，路線從門口（z '+D0.a0+'～'+D0.a1+'）穿過牆，不是直線穿牆',pth&&xs.length===1&&xs[0]>D0.a0&&xs[0]<D0.a1,'穿過牆的位置 z='+xs.join(',')); } }
  // 小孤島：每一個站得住的格子都要能走到大廳（取樣，每 0.8 m）
  { const isl=[]; for(const lv of [0,1]){ for(let x=-L.W/2+0.6;x<L.W/2-0.4;x+=0.8) for(let zz=-L.D/2+0.6;zz<L.D/2-0.4;zz+=0.8){ if(!E.canStand(x,zz,0.32,lv)) continue; const p=E.pathTo(x,zz,lv,SP.x,SP.z,0); if(!p||!p.length) isl.push(`(${x.toFixed(1)},${zz.toFixed(1)}${lv?',2F':''})`); } }
    check('沒有走不回大廳的小孤島（每 0.8 m 取樣）',!isl.length,isl.slice(0,6).join(' ')); }
  return z; }

const only=process.argv[2];
if(!only||only==='gongtong'){ runZone('gongtong',GONGTONG_LAYOUT,70);
  const r=walk([0,1.0,1],[-8.0,4.4,1]); check('二樓走廊 → 自習區（兩排桌子中間的走道）',r.ok,JSON.stringify(r).slice(0,160)); }
if(!only||only==='boya'){ const z=runZone('boya',BOYA_LAYOUT,150); const L=BOYA_LAYOUT;
  // 博雅一樓的三處公共空間（查證：沙發、桌椅，供學生自習與討論）
  // 2026-10-13 第二版（LAWWW2 審查 c5e2170 第 3 節）：101 旁桌椅區＝雙人小桌兩列 × 六張、圓桌區兩張、窗邊沙發兩張
  const byRoom=k=>z.seats.filter(q=>q.room===k); check('一樓三處公共空間都有位子：自習區（雙人小桌）24、圓桌區 8、窗邊沙發 4',byRoom('study').length>=24&&byRoom('round').length>=8&&byRoom('sofa').length>=4,['study','round','sofa'].map(k=>k+' '+byRoom(k).length).join('、'));
  { const T={}; for(const q of z.seats.filter(q=>q.lv===0&&(q.room==='study'||q.room==='round'))){ (T[q.table]=T[q.table]||[]).push(q); }
    const bad=Object.entries(T).filter(([id,ss])=>{ if(id==='undefined') return true; if(id[0]==='d') return !(ss.length===2&&Math.abs(Math.abs(ss[0].yaw-ss[1].yaw)-Math.PI)<0.01&&Math.abs(ss[0].z-ss[1].z)<1e-6);   /* 雙人小桌：兩張椅子面對面 */
      if(id[0]==='r'){ if(ss.length!==4) return true; const t=BOYA_LAYOUT.groups.find(g=>g.id==='round').tables.find(q=>q.id===id); return !ss.every(q=>Math.abs(Math.atan2(t.x-q.x,t.z-q.z)-Math.atan2(Math.sin(q.yaw),Math.cos(q.yaw)))<0.01||Math.abs(Math.abs(Math.atan2(t.x-q.x,t.z-q.z)-Math.atan2(Math.sin(q.yaw),Math.cos(q.yaw)))-2*Math.PI)<0.01); }   /* 圓桌：四張椅子都面向桌子中心 */
      return true; });
    check('同一張桌子的座位有同一個 table（坐在一起＝npcNear、習慣記憶 table:）：雙人小桌兩張面對面、圓桌四張面向桌子中心',!bad.length&&Object.keys(T).length===14,Object.keys(T).length+' 張桌子；不對的：'+bad.map(b=>b[0]).join(',')); }
  check('roomAt：窗邊沙發、自習區、圓桌區、講座資訊角、二樓走廊、101、201 認得出來',z.roomAt(-3.7,8.0,0)==='sofa'&&z.roomAt(-2.4,0.0,0)==='study'&&z.roomAt(3.6,2.6,0)==='round'&&z.roomAt(0.4,-7.6,0)==='info'&&z.roomAt(-10,1,1)==='corridor'&&z.roomAt(-10,0,0)==='101'&&z.roomAt(-10,-5,1)==='201',
    [z.roomAt(-3.7,8.0,0),z.roomAt(-2.4,0.0,0),z.roomAt(3.6,2.6,0),z.roomAt(0.4,-7.6,0),z.roomAt(-10,1,1),z.roomAt(-10,0,0),z.roomAt(-10,-5,1)].join(','));
  // 動線：大門 → 講座資訊角、樓梯口、101／102 的門，路線都走得通（桌椅沒有擋住中間的走道）
  { const SP=L.entrance.spawn; const tgt=[[0.4,-7.4,0,'講座資訊角'],[2.9,-0.6,0,'樓梯口'],[-5.2,6.0,0,'101 門口'],[5.2,6.0,0,'102 門口']]; const bad=tgt.filter(t=>!walk([SP.x,SP.z,0],[t[0],t[1],t[2]]).ok).map(t=>t[3]);
    check('大門 → 講座資訊角、樓梯口、101／102 門口都走得到（桌椅沒有擋住走道）',!bad.length,bad.join('、')); }
  const scr=E.interactables.find(i=>i.board&&/講座資訊/.test(i.label)); check('講座資訊螢幕：有互動、走得到',!!scr&&walk([L.entrance.spawn.x,L.entrance.spawn.z,0],[scr.x,scr.z,0]).ok,scr&&scr.label); }
if(!only||only==='putong'){ const z=runZone('putong',PUTONG_LAYOUT,110);
  check('roomAt：走廊、門廳、101、103、201 認得出來',z.roomAt(0,0.2,0)==='corridor'&&z.roomAt(0,5,0)==='lobby'&&z.roomAt(-10,-4,0)==='101'&&z.roomAt(-10,4,0)==='103'&&z.roomAt(-10,-4,1)==='201',[z.roomAt(0,0.2,0),z.roomAt(0,5,0),z.roomAt(-10,-4,0),z.roomAt(-10,4,0),z.roomAt(-10,-4,1)].join(','));
  check('spaceAt（「在她附近」用）：走廊、門廳是同一個開放空間，101、103 各自一間',z.spaceAt(0,0.2,0)==='public'&&z.spaceAt(0,5,0)==='public'&&z.spaceAt(-10,-4,0)==='101'&&z.spaceAt(-10,4,0)==='103',[z.spaceAt(0,0.2,0),z.spaceAt(0,5,0),z.spaceAt(-10,-4,0),z.spaceAt(-10,4,0)].join(','));
  /* 空橋（2026-10-16 使用者試玩回報「空橋是一扇門」）：二樓走廊 → 通道 → 北牆門洞 → 走過整條空橋（緩坡升 0.6 m）→ 博雅那一端的門「進博雅教學館」→ 落在博雅二樓 */
  const BR=PUTONG_LAYOUT.bridge, br=E.interactables.find(i=>i.exit&&i.exit.to==='boya'); const sp=br&&br.exit&&br.exit.spawn;
  check('空橋的資料（L.bridge）在',!!BR&&BR.len>7&&Math.abs(BR.rise-(BOYA_LAYOUT.floors[1].y-PUTONG_LAYOUT.floors[1].y))<1e-6,BR&&JSON.stringify({len:BR.len,rise:BR.rise}));
  check('往博雅的門在空橋的另一端（不是二樓走廊上的一扇門）：「進博雅教學館」→ 落在博雅二樓',!!br&&br.lv===1&&br.exit.to==='boya'&&sp&&sp.lv===1&&br.z<BR.z-BR.len+1,br&&br.label+' '+JSON.stringify({x:br.x,z:br.z}));
  check('空橋另一端的門從一樓大廳走得到（上樓梯、二樓走廊、通道、走過整條空橋）',!!br&&walk([PUTONG_LAYOUT.entrance.spawn.x,PUTONG_LAYOUT.entrance.spawn.z,0],[br.x,br.z,1]).ok);
  { const hs=[]; for(let zz=BR.z-0.3;zz>=BR.z-BR.len+0.3;zz-=0.5) hs.push(+E.heightAt(BR.x,zz,1).toFixed(3)); const mono=hs.every((h,i)=>!i||h>=hs[i-1]-1e-6), stepMax=Math.max(...hs.slice(1).map((h,i)=>h-hs[i]));
    check('空橋的高度：從 4.2 慢慢升到 4.8（沒有台階：每 0.5 m 最多升 0.06 m）',Math.abs(hs[0]-PUTONG_LAYOUT.floors[1].y)<0.01&&Math.abs(hs[hs.length-1]-BOYA_LAYOUT.floors[1].y)<0.01&&mono&&stepMax<=0.06,hs.join(','));
    { const on=[-0.5,-2,-4,-6,-6.9].map(dz=>E.canStand(BR.x,BR.z+dz,0.32,1)), off=[E.canStand(BR.x+BR.half+0.4,BR.z-3,0.3,1),E.canStand(BR.x-BR.half-0.4,BR.z-3,0.3,1)];
    check('空橋的橋面站得住（中線）、兩側的玻璃外站不住',on.every(Boolean)&&!off.some(Boolean),JSON.stringify({on,off})); } }
  check('二樓北牆：門洞以外站不住（不能從牆穿出去）',!E.canStand(BR.x+BR.doorW/2+0.6,BR.z,0.3,1)&&!E.canStand(BR.x-BR.doorW/2-0.6,BR.z,0.3,1)&&!E.canStand(-10,BR.z-0.5,0.3,1)&&E.canStand(BR.x,BR.z,0.3,1));
  check('一樓不受影響：一樓北牆外站不住',!E.canStand(BR.x,BR.z-2,0.3,0)&&!E.canStand(BR.x,BR.z,0.3,0));
  /* 對面（博雅二樓）的落點：站得住，而且走得到博雅那邊回普通的空橋門口、一樓出口 */
  if(sp){ loadZone('boya'); const back=E.interactables.find(i=>i.exit&&i.exit.to==='putong');
    check('落在博雅二樓：離回普通的空橋門口 ≥ 半徑＋0.2 m（一走過來不會又跳出「走空橋到普通教學館」，2026-10-13 審查）',!!back&&Math.hypot(sp.x-back.x,sp.z-back.z)>=back.radius+0.2,back?`距離 ${Math.hypot(sp.x-back.x,sp.z-back.z).toFixed(2)}`:'');
    check('落在博雅二樓：站得住；回普通的空橋門口、博雅一樓出口都走得到',E.canStand(sp.x,sp.z,0.32,1)&&!!back&&walk([sp.x,sp.z,1],[back.x,back.z,1]).ok&&walk([sp.x,sp.z,1],[BOYA_LAYOUT.entrance.exit.x,BOYA_LAYOUT.entrance.exit.z-0.6,0]).ok,JSON.stringify(sp));
    const bs=back&&back.exit.spawn; loadZone('putong'); { const br2=E.interactables.find(i=>i.exit&&i.exit.to==='boya'); check('從博雅走回來：落點離普通的空橋門口 ≥ 半徑＋0.2 m',!!bs&&!!br2&&Math.hypot(bs.x-br2.x,bs.z-br2.z)>=br2.radius+0.2,bs&&br2?`距離 ${Math.hypot(bs.x-br2.x,bs.z-br2.z).toFixed(2)}`:''); }
    check('從博雅走回來：落在空橋博雅那一端（要走過整條空橋）、站得住、走得到普通一樓出口',!!bs&&bs.lv===1&&bs.z<BR.z-BR.len+2&&E.canStand(bs.x,bs.z,0.32,1)&&walk([bs.x,bs.z,1],[PUTONG_LAYOUT.entrance.exit.x,PUTONG_LAYOUT.entrance.exit.z-0.6,0]).ok,JSON.stringify(bs)); } }
/* 日程寫的站位（act:'linger' 的 at；AA 2026-10-13 P1-3：芷若經原 12:10 下課後在普通 101 門口的走廊）：站得住、不在教室裡、從大門走得到、從前一個時段的教室座位旁走得到 */
{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8').replace(/^const (CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS)\s*=/mg,'globalThis.$1='),{filename:'src/data/characters.js'});
  const LS={gongtong:GONGTONG_LAYOUT,boya:BOYA_LAYOUT,putong:PUTONG_LAYOUT}; let nSpots=0;
  for(const cid in CHARACTERS){ const sch=CHARACTERS[cid].daily_schedule||[]; for(const e of sch){ if(e.act!=='linger'||!LS[e.zone]||(only&&only!==e.zone)) continue; nSpots++;
    const z=loadZone(e.zone); tag='['+LS[e.zone].name+'] '; const [x,zz,,lv0]=e.at, lv=lv0|0, SP=LS[e.zone].entrance.spawn, rid=z.roomAt(x,zz,lv);
    check(cid+' 的站位 ('+x+','+zz+')：站得住、在公共空間（'+rid+'）、從大門走得到',E.canStand(x,zz,0.32,lv)&&['corridor','lobby','hall','lobby2'].includes(rid)&&walk([SP.x,SP.z,0],[x,zz,lv]).ok,rid);
    const prev=sch.find(q=>q.zone===e.zone&&q.room&&Math.abs(q.to-e.from)<1e-6&&q.days.some(d=>e.days.includes(d)));
    if(prev){ const bad=[]; let n=0; for(const st of (z.seats||[]).filter(q=>q.room===prev.room)){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), sl=st.lv|0; const ap=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55]].map(([dx,dz])=>[st.x+dx,st.z+dz]).find(([ax,az])=>E.canStand(ax,az,0.3,sl)); if(!ap) continue; n++; if(!walk([ap[0],ap[1],sl],[x,zz,lv]).ok) bad.push('('+st.x+','+st.z+')'); }
      check(cid+'：前一個時段（'+prev.room+'）的座位起身後都走得到站位（'+(n-bad.length)+'/'+n+'）',n>0&&!bad.length,bad.slice(0,5).join(' ')); } } }
  if(!only||only==='putong') check('至少有一個日程站位被檢查（芷若在普通）',nSpots>=1,String(nSpots)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
