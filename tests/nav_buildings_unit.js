// 多樓層建築的導航（第一層＋第二層，不需要瀏覽器；v9.4 第一批，D36）：在 Node 裡建出遊戲真正的區域（校園、霖澤館、201 階梯教室），
// 用引擎真正的找路（E.pathTo）＋移動碰撞（stepEntity，模擬時間 dt=1/30 與 0.1，人物半徑 0.32 m）走每一段路：
//   校園：廣場 → 前台階 → 穿堂 → 大廳門口；穿堂 → 後台階 → 後面的小廣場；穿堂裡站得住、高度 0.9
//   霖澤館：入口 → 大廳 → 樓梯 → 二樓 → 201 教室門；二樓 → 樓梯 → 入口；電梯門關著不能走進車廂、門開著可以
//   201 教室：門口（最上面）→ 每一個座位（48 個）「坐下」走到的位置（GAME.seatApproach 的規則：椅子後面 0.6 m、同一排的平台）→ 回到門口
// 這是模擬（證明路走得通、高度對），不是真實玩家流程；真實流程在 tests/flow_linze_floors.py。
// 用法：node tests/nav_buildings_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
const fmt=(r)=>JSON.stringify(r).slice(0,220);
// ---------- 校園：穿堂 ----------
{ const t0=Date.now(); const z=loadZone('campus'); console.log(`（校園建好：${((Date.now()-t0)/1000).toFixed(1)} 秒）`);
  const door=E.interactables.find(i=>i.label==='進入霖澤館'); check('校園有「進入霖澤館」（穿堂西側的大廳入口）',!!door,door?`(${door.x.toFixed(1)},${door.z.toFixed(1)})`:'');
  const H=(x,z)=>E.nav.heightAt(x,z);
  check('穿堂地坪高 0.9 m、前台階從地面連續斜上（最下面一階的邊緣＝地面）、廣場 0',Math.abs(H(34,-110)-0.9)<1e-6&&Math.abs(H(34,-100.49))<0.02&&Math.abs(H(34,-101.7)-0.47)<0.06&&H(34,-96)===0,`穿堂 ${H(34,-110)}、台階底 ${H(34,-100.49).toFixed(3)}、台階中 ${H(34,-101.7).toFixed(3)}、廣場 ${H(34,-96)}`);
  check('穿堂裡站得住（中間、柱子之間）',E.canStand(34,-110,0.32,0)&&E.canStand(31,-112,0.32,0)&&E.canStand(37,-106,0.32,0));
  check('穿堂的柱子站不住',!E.canStand(27.6,-112,0.32,0)&&!E.canStand(40.4,-112,0.32,0));
  let r=both([34,-94],[door.x+0.6,door.z]); check('廣場 → 前台階 → 穿堂 → 大廳門口（模擬走路）',r.ok&&Math.abs(r.y-0.9)<0.05,fmt(r));
  r=both([34,-108],[34,-125.5]); check('穿堂 → 後台階 → 後面的小廣場（穿過建築）',r.ok&&Math.abs(r.y)<0.05,fmt(r));
  r=both([34,-125.5],[26,-90]); check('後面的小廣場 → 穿堂 → 前台階 → 霖澤館前（第二天劇情的出生點）',r.ok,fmt(r));
  const B=B3.CAMPUS_DOOR; check('從大廳出來的位置站得住、離大廳門口 ≥ 1.8 m（不會一出來就跳出「進入霖澤館」）',E.canStand(B.x,B.z,0.32,0)&&Math.hypot(B.x-door.x,B.z-door.z)>=1.8,`(${B.x},${B.z}) 距離 ${Math.hypot(B.x-door.x,B.z-door.z).toFixed(2)}`);
  check('穿堂的地面可以點（點地面移動的透明地板）',(z.walkMeshes||[]).length>=4,`${(z.walkMeshes||[]).length} 片`);
  r=both([34,-94],[93.8,-98.6]); check('萬才館入口照樣走得到（沒被改壞）',r.ok,fmt(r)); }
// ---------- 霖澤館室內 ----------
{ const z=loadZone('linze'); const L=LINZE_LAYOUT; const sp=z.spawn; const IT=E.interactables;
  check('霖澤館：兩層導航格、二樓地板 4.2',z.levels.length===2&&z.levels[1].y0===4.2);
  check('入口出生點站得住（一樓）',E.canStand(sp.x,sp.z,0.32,0));
  const c201=IT.find(i=>i.exit&&i.exit.to==='classroom'); check('二樓有「進入 201 階梯教室」',!!c201&&c201.lv===1,c201&&c201.label);
  let r=both([sp.x,sp.z,0],[c201.x,c201.z+0.3,1]); check('入口 → 大廳 → 樓梯 → 二樓 → 201 教室門口（模擬走路，不瞬移）',r.ok&&r.lv===1&&Math.abs(r.y-4.2)<0.05,fmt(r));
  const p=E.pathTo(sp.x,sp.z,0,c201.x,c201.z+0.3,1); check('這條路經過樓梯（第一跑、平台、第二跑），在樓梯上換到二樓',!!p&&p.some(q=>q[0]<-5.6&&q[1]>1.5&&q[1]<5)&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
  r=both([c201.x,c201.z+0.3,1],[sp.x,sp.z,0]); check('二樓 → 樓梯 → 一樓入口',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
  const ex=IT.find(i=>i.exit&&i.exit.to==='campus'); r=both([sp.x,sp.z,0],[ex.x,ex.z,0]); check('一樓「走出霖澤館」站得到',r.ok,fmt(r));
  for(const d of L.doors){ const it=IT.find(i=>i.label.indexOf(d.label)>=0); const st=it&&[it.x,it.z+0.2,d.lv]; const rr=it&&both([sp.x,sp.z,0],st); check(`門「${d.label}」（${d.lv+1}F）走得到`,!!rr&&rr.ok,fmt(rr)); }
  const el=z.elev; const inside=[el.cx,el.inZ];
  check('電梯：門關著時車廂裡站不住（一樓、二樓都是）',!E.canStand(inside[0],inside[1],0.3,0)&&!E.canStand(inside[0],inside[1],0.3,1));
  el.isOpen=true; el.lv=0; el.setCells(); r=both([el.cx,el.outZ,0],[inside[0],inside[1],0]); check('電梯在一樓、門開著：從一樓走得進車廂',r.ok&&r.lv===0,fmt(r)); check('（同時二樓那邊還是進不去）',!E.canStand(inside[0],inside[1],0.3,1));
  el.lv=1; el.setCells(); r=both([inside[0],inside[1],1],[el.cx,el.outZ,1]); check('電梯到二樓、門開著：從車廂走得出去到二樓迴廊',r.ok&&r.lv===1&&Math.abs(r.y-4.2)<0.05,fmt(r));
  el.isOpen=false; el.lv=0; el.setCells();
  check('二樓迴廊邊（中庭）不能直接跳下一樓',!E.canStand(0,-2.6,0.32,1));
  for(const f of L.furniture){ if(f.type==='board') continue; } }
// ---------- 201 階梯教室 ----------
{ const z=loadZone('classroom'); const sp=z.spawn; const S=z.seats; const IT=E.interactables;
  check('階梯教室：6 排 × 8 個座位、每排高 30 cm',S.length===48&&S.every(s=>Math.abs(s.y-0.3*(s.row+1))<1e-6),`${S.length} 個座位`);
  check('48 個座位都有「坐下」',IT.filter(i=>i.seat).length===48);
  check('門口（最上面）站得住、高 1.8 m',E.canStand(sp.x,sp.z,0.32,0)&&Math.abs(E.nav.heightAt(sp.x,sp.z)-1.8)<1e-6,`h=${E.nav.heightAt(sp.x,sp.z)}`);
  let bad=[]; for(const s of S){ const ap=[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6]; const st=E.canStand(ap[0],ap[1],0.3,0), hOK=Math.abs(E.nav.heightAt(ap[0],ap[1])-s.y)<=0.2; const r=st&&hOK?both([sp.x,sp.z,0],[ap[0],ap[1],0]):{ok:false,reason:st?'高度不對':'站不住'}; if(!r.ok||Math.abs((r.y||0)-s.y)>0.05) bad.push(`第${s.row}排第${s.col}個 ${fmt(r)}`); }
  check('48 個座位：椅子後面 0.6 m（坐下前站的位置）站得住、在同一排的平台上、從門口走得到',!bad.length,bad.slice(0,4).join(' | '));
  const s13=S.find(s=>s.row===1&&s.col===3); let r=both([sp.x,sp.z,0],[s13.x,s13.z+0.6,0]); check('上課劇情：從門口走到第 1 排第 3 個座位後面（classScene 的 walkTo）',r.ok&&Math.abs(r.y-0.6)<0.05,fmt(r));
  r=both([s13.x,s13.z+0.6,0],[0,7.7,0]); check('坐完回到門口「離開教室」',r.ok,fmt(r));
  const ts=z.teacherSpot; check('老師站的位置（講台）站得住、地面高度',E.canStand(ts.x,ts.z,0.32,0)&&E.nav.heightAt(ts.x,ts.z)===0);
  r=both([sp.x,sp.z,0],[ts.x+1.5,ts.z+0.6,0]); check('從門口走樓梯（兩側走道）下到講台',r.ok&&Math.abs(r.y)<0.05,fmt(r)); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
