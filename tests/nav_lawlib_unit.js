// 法律學院圖書館（D46，2026-10-13）的導航（不需要瀏覽器）：在 Node 裡建出遊戲真正的區域（萬才館大廳、圖書館），
// 用引擎真正的找路（E.pathTo）＋移動碰撞（E.simWalk：stepEntity、人物半徑 0.32 m、dt 1/30 與 0.1、走路與跑步）檢查：
//   萬才館大廳：圖書館的門在西南角（進門左手邊）、從大廳入口走得到；從圖書館出來的位置站得住；樓梯最上面一階不能直接走下到門前的凹處（4.2 m）
//   圖書館：入口 → 櫃台 → 自習區 → 每一個座位「坐下」走得到的位置（GAME.seatApproach 的規則）→ 討論室、影印室走得進去
//          → A 跑 → 平台 → B 跑 → 二樓（第 1 層、4.2 m）→ 每一排書架的書架端 → 二樓閱覽桌 → 走回一樓入口；跑步＋低幀率上下樓
//          櫃台後面、館員辦公室、樓梯井（二樓的邊）站不住；每一個互動點都走得到（同一層）
// 這是模擬（證明路走得通、高度對），不是真實玩家流程；真實流程在 tests/flow_lawlib.py。
// 用法：node tests/nav_lawlib_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=sim(a,b,dt,4.8); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };   /* 跑步 4.8 m/s（v9.5 起）＋低幀率：一步 0.48 m */
const fmt=(r)=>JSON.stringify(r).slice(0,220);
const L=LAWLIB_LAYOUT, WL=WANCAI_LAYOUT;
// GAME.seatApproach 的規則（game3d.js）：座位前 0.5、後 0.6、兩側 0.55、前 0.8、後 0.9，第一個站得住而且走得到的
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(E.canStand(x,z,0.3,seat.lv|0)) return [x,z,seat.lv|0]; } return null; }
// 互動點附近（半徑內）站得住的點：先試正中間，再一圈一圈往外
function standNear(it){ const lv=it.lv|0, R=Math.min(it.radius||1,1.2); if(E.canStand(it.x,it.z,0.32,lv)) return [it.x,it.z,lv]; for(let r=0.2;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(E.canStand(x,z,0.32,lv)) return [x,z,lv]; } return null; }

// ---------- 萬才館大廳：圖書館的門 ----------
{ const z=loadZone('wancai'); const door=E.interactables.find(i=>i.exit&&i.exit.to==='lawlib');
  check('萬才館大廳有往法律學院圖書館的門（一樓、西南角＝大廳入口進來的左手邊）',!!door&&door.lv===0&&door.x<-7&&door.z>5,door?`(${door.x},${door.z}) lv${door.lv}`:'沒有');
  const H=LL3.HALL; check('從圖書館出來的位置站得住、離門的互動點 ≥ 1.3 m（不會一出來就又跳出「法律學院圖書館」）',E.canStand(H.x,H.z,0.32,0)&&Math.hypot(H.x-door.x,H.z-door.z)>=1.3,`(${H.x},${H.z}) 距離 ${Math.hypot(H.x-door.x,H.z-door.z).toFixed(2)}`);
  const sp=WL.entrance.spawn; let r=both([sp.x,sp.z,0],[H.x,H.z,0]); check('大廳入口（進門的出生點）→ 左手邊的圖書館門前（模擬走路）',r.ok&&r.lv===0,fmt(r));
  const nd=standNear(door); check('門的互動點旁邊站得住（按得到「法律學院圖書館」）',!!nd,JSON.stringify(nd));
  // 大樓梯：舊的路照樣走得通（入口 → 樓梯 → 二樓門廳）；盆栽搬到西北角之後樓梯底下照樣過得去
  const UD=WL.upperDoor; r=both([sp.x,sp.z,0],[UD.spawn.x,UD.spawn.z,1]); check('大廳入口 → 大樓梯（往南爬）→ 二樓門廳（照舊）',r.ok&&r.lv===1,fmt(r));
  r=both([UD.spawn.x,UD.spawn.z,1],[H.x,H.z,0]); check('二樓門廳 → 大樓梯往下 → 一樓 → 圖書館門前',r.ok&&r.lv===0,fmt(r));
  // 樓梯最上面一階（4.2 m，第 0 層也有這一排）和門前凹處的地面（0 m）接不上：不能直接走下去
  const S=WL.stair, F2=S.flight2, topZ=F2.z1-0.1; const sx=(S.x0+S.x1)/2;
  check('樓梯最上面一階的南邊（門前凹處，高 0）站得住的地方離樓梯端面 ≥ 0.3 m（人不會穿進樓梯）',!E.canStand(sx,F2.z1+0.2,0.32,0)&&E.canStand(sx,F2.z1+0.75,0.32,0),`站 z=${(F2.z1+0.2).toFixed(2)}：${E.canStand(sx,F2.z1+0.2,0.32,0)}、z=${(F2.z1+0.75).toFixed(2)}：${E.canStand(sx,F2.z1+0.75,0.32,0)}`);
  const p=E.pathTo(sx,topZ,0,sx,F2.z1+0.9,0); let L2=0; if(p){ let px=sx, pz=topZ; for(const q of p){ L2+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; } }
  check('從樓梯最上面一階到正下方的門前：路要繞樓梯走（> 12 m），不能直接跳下去',!p||L2>12,p?`路長 ${L2.toFixed(1)} m`:'找不到路（也可以）');
  // 大廳的舊座標（劇情、社團、助教、舊存檔）照樣站得住
  const old=[[0,5],[-3,3.6],[3,3.6],[0,4.6],[-6,0.5],[6,0.5],[-1.5,-2.5],[2.6,-4.5],[4,-5],[-5,1.2],[-3,3.6]]; const bad=old.filter(([x,zz])=>!E.canStand(x,zz,0.3,0));
  check('大廳的舊座標（劇情站位、社團、助教）照樣站得住',!bad.length,JSON.stringify(bad)); }

// ---------- 法律學院圖書館 ----------
{ const t0=Date.now(); const z=loadZone('lawlib'); console.log(`（圖書館建好：${((Date.now()-t0)/1000).toFixed(2)} 秒，互動點 ${E.interactables.length} 個、座位 ${z.seats.length} 個）`);
  const sp=L.entrance.spawn, EX=E.interactables.find(i=>i.exit&&i.exit.to==='wancai');
  check('兩層導航格（1F 0、2F 4.2）',z.levels.length===2&&z.levels[1].y0===4.2);
  check('入口的出生點站得住、離「回萬才館大廳」≥ 1.2 m（一進來不會就跳出離開）',E.canStand(sp.x,sp.z,0.32,0)&&!!EX&&Math.hypot(EX.x-sp.x,EX.z-sp.z)>=EX.radius+0.2,EX?`距離 ${Math.hypot(EX.x-sp.x,EX.z-sp.z).toFixed(2)}`:'沒有出口');
  check('出口的互動點旁邊站得住',!!standNear(EX));
  const H0=(x,zz)=>z.levels[0].heightAt(x,zz), H1=(x,zz)=>z.levels[1].heightAt(x,zz), V0=(x,zz)=>z.levels[0].visualHeightAt(x,zz);
  const S=L.stair, A=S.A, B=S.B, LD=S.landing, ax=(A.x0+A.x1)/2, bx=(B.x0+B.x1)/2;
  check('樓梯高度：A 跑最下面一階的邊緣＝地面、平台 2.184、B 跑最上面一階 4.2（兩層相同）',Math.abs(H0(ax,A.z0+0.01))<0.02&&Math.abs(H0(ax,(LD.z0+LD.z1)/2)-LD.y)<1e-6&&Math.abs(H0(bx,B.z0+0.05)-4.2)<1e-6&&Math.abs(H1(bx,B.z0+0.05)-4.2)<1e-6,
    `A 底 ${H0(ax,A.z0+0.01).toFixed(3)}、平台 ${H0(ax,(LD.z0+LD.z1)/2)}、B 頂 ${H0(bx,B.z0+0.05)}/${H1(bx,B.z0+0.05)}`);
  let bad=[]; for(let k=0;k<A.risers;k++){ const zc=A.z0+(k+0.5)*S.tread, want=(k+1)*S.rise; if(Math.abs(V0(ax,zc)-want)>1e-6) bad.push(`A${k}:${V0(ax,zc).toFixed(3)}≠${want.toFixed(3)}`); }
  for(let j=0;j<B.risers;j++){ const zc=B.z1-(j+0.5)*S.tread, want=LD.y+(j+1)*S.rise; if(Math.abs(V0(bx,zc)-want)>1e-6) bad.push(`B${j}:${V0(bx,zc).toFixed(3)}≠${want.toFixed(3)}`); }
  check('每一階畫面上的高度＝畫出來的台階（A 13 階、B 12 階，每階 16.8 cm）',!bad.length,bad.slice(0,4).join(' | '));
  // 一樓
  const ctr=E.interactables.find(i=>i.label==='櫃台'); let r=both([sp.x,sp.z,0],[ctr.x,ctr.z,0]); check('入口 → 防盜感應門 → 櫃台前',r.ok,fmt(r));
  const SA=L.staffArea; check('櫃台後面（館員的工作區）站不住',!E.canStand((SA.x0+SA.x1)/2,3.2,0.3,0)&&!E.canStand(4.0,3.0,0.3,0));
  const off=L.rooms.find(q=>q.kind==='office'); check('館員辦公室進不去（門關著）',!E.canStand((off.x0+off.x1)/2,-6.2,0.3,0));
  for(const rm of L.rooms.filter(q=>q.kind!=='office')){ const inside=[(rm.door[0]+rm.door[1])/2,-5.0,0]; r=both([sp.x,sp.z,0],inside); check(`${rm.label}走得進去（門洞 ${(rm.door[1]-rm.door[0]).toFixed(1)} m）`,r.ok,fmt(r)); }
  check('房間的前牆（門洞以外）擋得住：不能穿牆',!E.canStand(-3.0,L.frontZ,0.3,0)&&!E.canStand(2.6,L.frontZ,0.3,0)&&!E.canStand(-6.6,L.frontZ,0.3,0));
  // 座位：每一個「坐下」走得到的位置（seatApproach 的規則）
  const start=[[sp.x,sp.z,0],[1.0,4.0,1]];   /* 一樓從入口、二樓從東南閱覽區出發（E.simWalk 的步數上限照直線距離算，從一樓入口到二樓窗邊的直線很短、路很長）*/
  bad=[]; for(const st of z.seats){ const ap=approach(st); if(!ap){ bad.push(`${st.table}(${st.x},${st.z}) 旁邊站不住`); continue; } const rr=sim(start[st.lv|0],ap,0.1); if(!rr.ok) bad.push(`${st.table}(${st.x},${st.z}) 走不到 ${fmt(rr).slice(0,80)}`); }
  check(`每一個座位（${z.seats.length} 個）旁邊站得住、走得到（坐下時走過去的位置；一樓從入口、二樓從閱覽區）`,!bad.length,bad.slice(0,4).join(' | '));
  // 樓梯
  const top=[bx,B.z0-0.8,1], foot=[ax,A.z0-0.8,0];
  r=both([sp.x,sp.z,0],top); check('入口 → A 跑（往南爬）→ 平台 → B 跑（往北爬）→ 二樓（第 1 層、高 4.2）',r.ok&&r.lv===1&&Math.abs(r.y-4.2)<0.05,fmt(r));
  const p=E.pathTo(sp.x,sp.z,0,top[0],top[1],1); check('這條路經過 A 跑、平台、B 跑，在 B 跑上換到第 1 層',!!p&&p.some(q=>q[0]<A.x1&&q[1]>A.z0&&q[1]<A.z1)&&p.some(q=>q[1]>LD.z0)&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
  r=both(top,[sp.x,sp.z,0]); check('二樓 → B 跑往下 → 平台 → A 跑往下 → 一樓入口（第 0 層、高 0）',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
  r=run([sp.x,sp.z,0],[1.6,-1.8,1]); check('跑步＋低幀率（4.8 m/s、dt 0.1）：入口 → 樓梯 → 二樓書庫的中間走道',r.ok,fmt(r));
  r=run([1.6,-1.8,1],[sp.x,sp.z,0]); check('跑步＋低幀率：二樓書庫 → 樓梯往下 → 入口',r.ok,fmt(r));
  r=both(foot,[(LD.x0+LD.x1)/2,(LD.z0+LD.z1)/2,0]); check('A 跑底下 → 平台（停在半層）',r.ok&&Math.abs(r.y-LD.y)<0.05,fmt(r));
  // 二樓：樓梯井的邊不能跳下去、書架擋得住、走道走得通
  check('二樓樓梯井（A 跑上方、平台上方）站不住；井的東邊（欄杆）站不住',!E.canStand(ax,4.4,0.3,1)&&!E.canStand(ax,7.0,0.3,1)&&!E.canStand(-3.2,5.0,0.3,1));
  check('二樓東南閱覽區站得住',E.canStand(1.0,4.0,0.32,1)&&E.canStand(5.0,7.2,0.3,1));
  bad=[]; for(const s of L.shelves.filter(q=>q.lv===1&&q.kind==='range')){ if(E.canStand(s.x,(s.z0+s.z1)/2,0.3,1)) bad.push(s.id); }
  check('二樓的書架（雙面）站不住（不能穿過書架）',!bad.length,bad.join(','));
  const aisles=[-1.6,0.0,1.6,3.2]; bad=[]; for(const x of aisles){ const rr=both([x,1.9,1],[x,-6.0,1]); if(!rr.ok) bad.push(`x=${x}：${fmt(rr).slice(0,80)}`); }
  check('書架之間的走道（1.0 m）從南走到北、穿過中間的橫向走道',!bad.length,bad.join(' | '));
  // 每一個互動點都走得到（同一層：從那一層的一個起點）
  bad=[]; let n=0;
  for(const it of E.interactables){ if(it.seat) continue; n++; const lv=it.lv|0; const nd=standNear(it); if(!nd){ bad.push(`${it.label}：旁邊站不住`); continue; } const rr=sim(start[lv],nd,0.1); if(!rr.ok) bad.push(`${it.label}：${fmt(rr).slice(0,80)}`); }
  check(`每一個互動點（座位以外 ${n} 個：書架、櫃台、影印、白板、查詢、公告、出口、安全梯）旁邊站得住、走得到`,!bad.length,bad.slice(0,5).join(' | '));
  // 互動點有標樓層（多樓層：別層正上方、正下方的不會跳出來）
  const nolv=E.interactables.filter(i=>i.lv===undefined).map(i=>i.label); check('每一個互動點都標了樓層',!nolv.length,nolv.join(','));
  // 劇情與日程用的座位資料：每個座位都有 x、z、yaw、lv
  check('zone.seats 每個都有 x、z、yaw、lv（之後日程／劇情可以讓人坐在這裡）',z.seats.every(s=>isFinite(s.x)&&isFinite(s.z)&&isFinite(s.yaw)&&(s.lv===0||s.lv===1)));
  check('鏡頭用的樓板範圍（zone.slabs）不蓋住樓梯井',z.slabs.length>=2&&!z.slabs.some(s=>s.x0<S.well.x1-0.01&&s.x1>S.well.x0+0.01&&s.z0<S.well.z1-0.01&&s.z1>S.well.z0+0.01),JSON.stringify(z.slabs));
}
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
