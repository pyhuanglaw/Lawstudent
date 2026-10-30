// 多樓層建築的導航（第一層＋第二層，不需要瀏覽器；v9.4 第一批，D36）：在 Node 裡建出遊戲真正的區域（校園、霖澤館、201 階梯教室），
// 用引擎真正的找路（E.pathTo）＋移動碰撞（stepEntity，模擬時間 dt=1/30 與 0.1，人物半徑 0.32 m）走每一段路：
//   校園：廣場 → 前台階 → 穿堂 → 大廳門口；穿堂 → 後台階 → 後面的小廣場；穿堂裡站得住、高度 0.9
//   霖澤館：入口 → 大廳 → 樓梯 → 二樓 → 201 教室門；二樓 → 樓梯 → 入口；電梯門關著不能走進車廂、門開著可以
//   201 教室：門口（最上面）→ 每一個座位（48 個）「坐下」走到的位置（GAME.seatApproach 的規則：椅子後面 0.6 m、同一排的平台）→ 回到門口
//   萬才館室內（第三階段，D42）：一樓大廳的舊座標（劇情、社團、助教、舊存檔）站得住、走得到；入口 → 樓梯（往南爬）→ 二樓門廳；二樓 → 一樓；電梯；二樓的邊不能跳下去
//   總圖大廳（D43）：入口 → 閘門 → 帝國式大樓梯 → 二樓自習區／東側；二樓 → 一樓；跑步＋低幀率；電梯（含往閱覽室的樓層）；座位、劇情座位；閱覽室的電梯與樓梯間
// 這是模擬（證明路走得通、高度對），不是真實玩家流程；真實流程在 tests/flow_linze_floors.py。
// 用法：node tests/nav_buildings_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
// 跑步（點的地方超過 16 m 時玩家用跑的，4.1 m/s）＋低幀率（dt 0.1，手機或模擬器卡的時候）：一步 0.41 m。2026-10-11 萬才館大樓梯真實流程：走下樓梯停在最下面一兩階
//（轉折點前後來回跳、換層時拿畫面上一階一階的高度比，跨一大步就換不回地面那一層）。走路速度、30 fps 都抓不到
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:4.1}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const fmt=(r)=>JSON.stringify(r).slice(0,220);
// ---------- 校園：穿堂 ----------
{ const t0=Date.now(); const z=loadZone('campus'); console.log(`（校園建好：${((Date.now()-t0)/1000).toFixed(1)} 秒）`);
  const door=E.interactables.find(i=>i.label==='進入法律系館A'); check('校園有「進入霖澤館」（穿堂西側的大廳入口）',!!door,door?`(${door.x.toFixed(1)},${door.z.toFixed(1)})`:'');
  const H=(x,z)=>E.nav.heightAt(x,z);
  check('穿堂地坪高 0.9 m、前台階從地面連續斜上（最下面一階的邊緣＝地面）、廣場 0',Math.abs(H(34,-110)-0.9)<1e-6&&Math.abs(H(34,-100.49))<0.02&&Math.abs(H(34,-101.7)-0.47)<0.06&&H(34,-96)===0,`穿堂 ${H(34,-110)}、台階底 ${H(34,-100.49).toFixed(3)}、台階中 ${H(34,-101.7).toFixed(3)}、廣場 ${H(34,-96)}`);
  check('穿堂裡站得住（中間、柱子之間）',E.canStand(34,-110,0.32,0)&&E.canStand(31,-112,0.32,0)&&E.canStand(37,-106,0.32,0));
  check('穿堂的柱子站不住',!E.canStand(27.6,-112,0.32,0)&&!E.canStand(40.4,-112,0.32,0));
  let r=both([34,-94],[door.x+0.6,door.z]); check('廣場 → 前台階 → 穿堂 → 大廳門口（模擬走路）',r.ok&&Math.abs(r.y-0.9)<0.05,fmt(r));
  r=both([34,-108],[34,-125.5]); check('穿堂 → 後台階 → 後面的小廣場（穿過建築）',r.ok&&Math.abs(r.y)<0.05,fmt(r));
  r=both([34,-125.5],[26,-90]); check('後面的小廣場 → 穿堂 → 前台階 → 霖澤館前（第二天劇情的出生點）',r.ok,fmt(r));
  const B=B3.CAMPUS_DOOR; check('從大廳出來的位置站得住、離大廳門口 ≥ 1.8 m（不會一出來就跳出「進入霖澤館」）',E.canStand(B.x,B.z,0.32,0)&&Math.hypot(B.x-door.x,B.z-door.z)>=1.8,`(${B.x},${B.z}) 距離 ${Math.hypot(B.x-door.x,B.z-door.z).toFixed(2)}`);
  check('穿堂的地面可以點（點地面移動的透明地板）',(z.walkMeshes||[]).length>=4,`${(z.walkMeshes||[]).length} 片`);
  r=both([34,-94],[93.8,-98.6]); check('萬才館入口照樣走得到（沒被改壞）',r.ok,fmt(r));
  // ---------- 萬才館大樓梯（第二階段：可以走上去；兩層導航格）----------
  { const wb=z.buildings.find(b=>b.userData.ck&&b.userData.ck.wancai), W=wb&&wb.userData.ck.wancai, bx=88, bz=-112; const L1=z.levels&&z.levels[1];
    check('校園：兩層導航格（第 1 層＝萬才館樓梯頂端平台＋弧形陽台，高 3.63 m）',!!W&&!!L1&&z.levels.length===2&&Math.abs(L1.y0-W.PF)<1e-9,W?`PF=${W.PF}`:'沒有 ck.wancai');
    const SX=bx+W.SX, Z0=bz+W.z0, H0=(x,zz)=>z.levels[0].heightAt(x,zz), H1=(x,zz)=>L1.heightAt(x,zz), V0=(x,zz)=>z.levels[0].visualHeightAt(x,zz), V1=(x,zz)=>L1.visualHeightAt(x,zz);
    let bad=[]; for(let k=0;k<W.NS;k++){ const zc=Z0+(k+0.5)*W.TR, want=(W.NS-k)*W.RS; for(const dx of [0,-1.2,1.2]){ const h0=V0(SX+dx,zc), h1=V1(SX+dx,zc), c0=H0(SX+dx,zc), c1=H1(SX+dx,zc); if(Math.abs(h0-want)>1e-6||Math.abs(h1-want)>1e-6) bad.push(`第${k}階 dx=${dx}：畫面 ${h0.toFixed(3)}/${h1.toFixed(3)}≠${want.toFixed(3)}`); if(Math.abs(c0-want)>W.RS*0.6||Math.abs(c1-c0)>1e-9) bad.push(`第${k}階 dx=${dx}：連續高度 ${c0.toFixed(3)}/${c1.toFixed(3)} 和踏面差超過半階`); } }
    check('樓梯每一階畫面上的高度＝畫出來的台階（踏面中心，兩層相同；從頂端往下 22 階、每階 16.5 cm）；碰撞用的連續高度和踏面差不到半階',!bad.length,bad.slice(0,3).join(' | '));
    check('樓梯底下是地面、樓梯外側（石牆外面）是地面',H0(SX,Z0+W.L+0.3)===0&&H0(SX+6.5,Z0+3)===0);
    check('最下面幾階往外張開的地方也有台階的高度（人物不會浮在空中）',Math.abs(V0(SX+(W.hw(1)+0.3),Z0+W.L-0.15)-W.RS)<1e-6,`h=${V0(SX+(W.hw(1)+0.3),Z0+W.L-0.15)}`);
    check('石牆盡頭旁邊高的地方，往外是走不下去的邊（不能從 1 m 高的台階側面直接走到地面）',!E.canStand(SX+3.45,Z0+5.5,0.32,0),`連續高度 ${H0(SX+3.45,Z0+5.5).toFixed(2)}、畫面 ${V0(SX+3.45,Z0+5.5).toFixed(2)}`);
    check('樓梯中間站得住（第 0 層、第 1 層都是）',E.canStand(SX,Z0+W.L/2,0.32,0)&&E.canStand(SX,Z0+W.L/2,0.32,1));
    check('兩側石牆站不住',!E.canStand(SX-(W.hw(0.3)+0.26),Z0+0.3*W.L,0.3,0)&&!E.canStand(SX+(W.hw(0.3)+0.26),Z0+0.3*W.L,0.3,0));
    check('平台在地面那一層是實心的（站不住）、在第 1 層站得住',!E.canStand(SX,Z0-2,0.32,0)&&E.canStand(SX,Z0-2,0.32,1));
    const balc=[bx+5,bz+W.d/2+1.6]; check('陽台在第 1 層站得住、高 3.63；陽台正下方（一樓入口）在地面那一層站得住、高 0',E.canStand(balc[0],balc[1],0.32,1)&&Math.abs(H1(...balc)-W.PF)<1e-9&&E.canStand(balc[0],balc[1],0.32,0)&&H0(...balc)===0);
    check('陽台欄杆外面、平台以外的地方在第 1 層站不住（不能從陽台跳下去）',!E.canStand(bx+5,bz+W.bzf(5)+0.4,0.3,1)&&!E.canStand(bx+5,-80,0.3,1)&&!E.canStand(SX+W.hw(1)+1.5,Z0+W.L+1,0.3,1));
    const plaza=[SX,Z0+W.L+5,0], top=[balc[0],balc[1],1];
    r=both(plaza,top); check('廣場 → 大樓梯（一階一階）→ 平台 → 陽台（模擬走路，不瞬移；第 1 層、高 3.63）',r.ok&&r.lv===1&&Math.abs(r.y-W.PF)<0.05,fmt(r));
    const p=E.pathTo(plaza[0],plaza[1],0,top[0],top[1],1); check('這條路經過大樓梯、在樓梯上換到第 1 層',!!p&&p.some(q=>q[1]>Z0&&q[1]<Z0+W.L&&Math.abs(q[0]-SX)<W.hw(1))&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
    r=both(top,plaza); check('陽台 → 平台 → 大樓梯往下 → 廣場（回到地面那一層、高 0）',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
    r=run(top,[SX,Z0+W.L+5.5,0]); check('跑步＋低幀率（4.1 m/s、dt 0.1）：陽台 → 大樓梯往下 → 廣場（真實流程：停在最下面一兩階）',r.ok,fmt(r));
    r=run([SX,Z0+W.L+5.5,0],top); check('跑步＋低幀率：廣場 → 大樓梯往上 → 陽台',r.ok,fmt(r));
    r=both([SX,Z0+W.L/2,0],top); check('從樓梯中間（地面那一層）往上走到陽台',r.ok&&r.lv===1,fmt(r));
    const d2=E.interactables.find(i=>i.exit&&i.exit.to==='wancai'&&i.lv===1), d1=E.interactables.find(i=>i.label==='進入法律系館B');
    check('二樓入口在第 1 層、進到萬才館室內二樓（第三階段，D42）；一樓入口在地面那一層',!!d2&&d2.exit.spawn.lv===1&&!!d1&&d1.lv===0&&d1.exit.spawn.lv===undefined,d2&&JSON.stringify(d2.exit));
    const back=WC3.CAMPUS_2F; check('從萬才館二樓出來的位置（平台，第 1 層）站得住、離二樓入口 ≥ 半徑＋0.3（不會一出來就又跳出進門按鈕）',E.canStand(back.x,back.z,0.32,1)&&Math.hypot(back.x-d2.x,back.z-d2.z)>=d2.radius+0.3,`(${back.x},${back.z}) 距離 ${Math.hypot(back.x-d2.x,back.z-d2.z).toFixed(2)}`);
    r=both(plaza,[d2.x,d2.z+0.3,1]); check('二樓入口走得到（平台）',r.ok&&r.lv===1,fmt(r));
    r=both(top,[93.8,-98.6,0]); check('陽台 → 下樓梯 → 繞到陽台下面的一樓入口',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
    r=both([93.8,-98.4,0],[34,-98,0]); check('從萬才館一樓出來（陽台前）走回霖澤館前：路線經過大樓梯下面往外張開的地方，不會卡在石牆盡頭旁邊（reachability_all 抓到的）',r.ok&&Math.abs(r.y)<0.05,fmt(r));
    const walk=(z.walkMeshes||[]).filter(m=>m.userData.walkLv===1); check('平台＋陽台的地面可以點（點地面移動，第 1 層）',walk.length>=1,`${walk.length} 片`);
    // 找路的時間（兩層之後每次找路的格子數加倍；暫存陣列重用）：校門 → 霖澤館、宿舍 → 萬才館一樓入口，各 20 次
    const t1=Date.now(); let okN=0; for(let i=0;i<20;i++){ if(E.pathTo(-120,0,0,34,-98,0)) okN++; if(E.pathTo(20,56,0,93.8,-98.6,0)) okN++; } const ms=(Date.now()-t1)/40;
    check('校園長距離找路還是找得到（兩層）',okN===40,`平均每次 ${ms.toFixed(1)} ms（Node）`); }
}
// ---------- 霖澤館室內 ----------
{ const z=loadZone('linze'); const L=LINZE_LAYOUT; const sp=z.spawn; const IT=E.interactables;
  check('霖澤館：兩層導航格、二樓地板 4.2',z.levels.length===2&&z.levels[1].y0===4.2);
  check('入口出生點站得住（一樓）',E.canStand(sp.x,sp.z,0.32,0));
  const c201=IT.find(i=>i.exit&&i.exit.to==='classroom'); check('二樓有「進入 201 階梯教室」',!!c201&&c201.lv===1,c201&&c201.label);
  let r=both([sp.x,sp.z,0],[c201.x,c201.z+0.3,1]); check('入口 → 大廳 → 樓梯 → 二樓 → 201 教室門口（模擬走路，不瞬移）',r.ok&&r.lv===1&&Math.abs(r.y-4.2)<0.05,fmt(r));
  const p=E.pathTo(sp.x,sp.z,0,c201.x,c201.z+0.3,1); check('這條路經過樓梯（第一跑、平台、第二跑），在樓梯上換到二樓',!!p&&p.some(q=>q[0]<-5.6&&q[1]>1.5&&q[1]<5)&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
  r=both([c201.x,c201.z+0.3,1],[sp.x,sp.z,0]); check('二樓 → 樓梯 → 一樓入口',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
  r=run([sp.x,sp.z,0],[c201.x,c201.z+0.3,1]); check('跑步＋低幀率（4.1 m/s、dt 0.1）：入口 → 樓梯 → 二樓 201 門口',r.ok,fmt(r));
  r=run([c201.x,c201.z+0.3,1],[sp.x,sp.z,0]); check('跑步＋低幀率：二樓 → 樓梯 → 一樓入口',r.ok,fmt(r));
  const ex=IT.find(i=>i.exit&&i.exit.to==='campus'); r=both([sp.x,sp.z,0],[ex.x,ex.z,0]); check('一樓「走出霖澤館」站得到',r.ok,fmt(r));
  for(const d of L.doors){ const it=IT.find(i=>i.label.indexOf(d.label)>=0); const st=it&&[it.x,it.z+0.2,d.lv]; const rr=it&&both([sp.x,sp.z,0],st); check(`門「${d.label}」（${d.lv+1}F）走得到`,!!rr&&rr.ok,fmt(rr)); }
  const el=z.elev; const inside=[el.cx,el.inZ];
  check('電梯：門關著時車廂裡站不住（一樓、二樓都是）',!E.canStand(inside[0],inside[1],0.3,0)&&!E.canStand(inside[0],inside[1],0.3,1));
  el.isOpen=true; el.lv=0; el.setCells(); r=both([el.cx,el.outZ,0],[inside[0],inside[1],0]); check('電梯在一樓、門開著：從一樓走得進車廂',r.ok&&r.lv===0,fmt(r)); check('（同時二樓那邊還是進不去）',!E.canStand(inside[0],inside[1],0.3,1));
  el.lv=1; el.setCells(); r=both([inside[0],inside[1],1],[el.cx,el.outZ,1]); check('電梯到二樓、門開著：從車廂走得出去到二樓迴廊',r.ok&&r.lv===1&&Math.abs(r.y-4.2)<0.05,fmt(r));
  el.isOpen=false; el.lv=0; el.setCells();
  check('二樓迴廊邊（中庭）不能直接跳下一樓',!E.canStand(0,-2.6,0.32,1));
  for(const f of L.furniture){ if(f.type==='board') continue; } }
// ---------- 萬才館室內（第三階段：兩層樓，D42）----------
{ const z=loadZone('wancai'); const L=WANCAI_LAYOUT, Y1=L.floors[1].y, IT=E.interactables, H0=(x,zz)=>z.levels[0].heightAt(x,zz);
  check('萬才館：兩層導航格、二樓地板 4.2',z.levels.length===2&&z.levels[1].y0===Y1);
  // 一樓沿用 v9.3 的大廳：舊的座標都還站得住、在地面、從入口走得到（src/story3d.js 的劇情站位、CLUB_SPOTS、TA_SPOT；舊存檔）
  const OLD=[[0,6,'出生點'],[0,5,'從校園進來'],[4,-5,'溫學姊（下午）'],[-5,1.2,'教授'],[-3,3.6,'社團／溫學姊（週三）'],[3,3.6,'社團'],[0,4.6,'社團'],[-6,0.5,'社團'],[6,0.5,'社團'],[-1.5,-2.5,'社團'],[2.6,-4.5,'助教']];
  let bad=OLD.filter(([x,zz])=>!E.canStand(x,zz,0.32,0)||H0(x,zz)!==0); check('一樓：v9.3 大廳的座標都還站得住、在地面（劇情、社團、助教、舊存檔）',!bad.length,bad.map(o=>o[2]+'('+o[0]+','+o[1]+')').join('、'));
  bad=[]; for(const [x,zz,n] of OLD){ const r=both([0,5,0],[x,zz,0]); if(!r.ok) bad.push(n+' '+fmt(r)); } check('一樓：從入口走得到這些位置',!bad.length,bad.slice(0,3).join(' | '));
  const ex1=IT.find(i=>i.exit&&i.exit.to==='campus'&&i.lv===0), ex2=IT.find(i=>i.exit&&i.exit.to==='campus'&&i.lv===1);
  check('一樓「離開萬才館」（回到陽台下的一樓入口前面，和 v9.3 一樣）、二樓「走出去」（回到大樓梯頂端的平台，校園第 1 層）',!!ex1&&!!ex2&&ex1.x===0&&Math.abs(ex1.z-6.6)<1e-9&&ex1.exit.spawn.x===93.8&&ex1.exit.spawn.z===-98.4&&ex2.exit.spawn.lv===1,JSON.stringify([ex1&&ex1.exit.spawn,ex2&&ex2.exit.spawn]));
  const US=L.upperDoor.spawn; check('從平台進來的位置（二樓門廳）站得住、離「走出去」≥ 半徑＋0.3',E.canStand(US.x,US.z,0.32,1)&&Math.hypot(US.x-ex2.x,US.z-ex2.z)>=ex2.radius+0.3,`距離 ${Math.hypot(US.x-ex2.x,US.z-ex2.z).toFixed(2)}`);
  check('樓梯（往南爬）：最下面在北邊 0 m、中間平台 2.18 m、最上面 4.2 m',Math.abs(H0(-8,-3.39))<0.02&&Math.abs(H0(-8,1.0)-2.184)<1e-6&&Math.abs(H0(-8,4.95)-Y1)<1e-6,`${H0(-8,-3.39).toFixed(3)} / ${H0(-8,1.0)} / ${H0(-8,4.95)}`);
  let r=both([0,5,0],[US.x,US.z,1]); check('一樓入口 → 大廳 → 樓梯 → 二樓門廳（模擬走路，不瞬移）',r.ok&&r.lv===1&&Math.abs(r.y-Y1)<0.05,fmt(r));
  const p=E.pathTo(0,5,0,US.x,US.z,1); check('這條路經過樓梯（第一跑、平台、第二跑），在樓梯上換到二樓',!!p&&p.some(q=>q[0]<-7.1&&q[1]>-3.4&&q[1]<5)&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
  r=both([US.x,US.z,1],[0,6,0]); check('二樓門廳 → 樓梯往下 → 一樓出口',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
  r=run([0,5,0],[US.x,US.z,1]); check('跑步＋低幀率（4.1 m/s、dt 0.1）：一樓入口 → 樓梯 → 二樓門廳',r.ok,fmt(r));
  r=run([US.x,US.z,1],[0,6,0]); check('跑步＋低幀率：二樓門廳 → 樓梯往下 → 一樓出口',r.ok,fmt(r));
  r=both([US.x,US.z,1],[ex2.x,ex2.z-0.3,1]); check('二樓「走出去」的門口走得到',r.ok&&r.lv===1,fmt(r));
  for(const d of L.doors){ const it=IT.find(i=>i.label===d.label); const rr=it&&both([0,5,0],[it.x,it.z+0.2,d.lv]); check(`門「${d.label}」（${d.lv+1}F）走得到、按下去是看得懂的說明`,!!rr&&rr.ok&&!!it.look&&it.lv===d.lv,fmt(rr)); }
  const bb=IT.find(i=>i.notice==='lawclub'); r=bb&&both([0,5,0],[bb.x,bb.z,0]); check('公告欄（法律服務社招募）還在一樓 (6,-5.6)、走得到',!!bb&&bb.x===6&&Math.abs(bb.z+5.6)<1e-9&&bb.lv===0&&r.ok,fmt(r));
  const seats=IT.filter(i=>i.seat); check('兩張沙發都能坐（一樓，位置和 v9.3 一樣）',seats.length===2&&seats.every(s=>s.lv===0)&&seats.some(s=>s.seat.x===-5&&s.seat.z===2)&&seats.some(s=>s.seat.x===5&&s.seat.z===2));
  const el=z.elev; const inside=[el.cx,el.inZ];
  check('電梯：門關著時車廂裡站不住（一樓、二樓都是）',!E.canStand(inside[0],inside[1],0.3,0)&&!E.canStand(inside[0],inside[1],0.3,1));
  el.isOpen=true; el.lv=0; el.setCells(); r=both([el.cx,el.outZ,0],[inside[0],inside[1],0]); check('電梯在一樓、門開著：從大廳走得進車廂',r.ok&&r.lv===0,fmt(r)); check('（同時二樓那邊還是進不去）',!E.canStand(inside[0],inside[1],0.3,1));
  el.lv=1; el.setCells(); r=both([inside[0],inside[1],1],[el.cx,el.outZ,1]); check('電梯到二樓、門開著：從車廂走得出去到二樓走廊',r.ok&&r.lv===1&&Math.abs(r.y-Y1)<0.05,fmt(r));
  el.isOpen=false; el.lv=0; el.setCells();
  r=both([el.cx,el.outZ,1],[US.x,US.z,1]); check('二樓走廊 → 西側迴廊 → 門廳（不用下樓）',r.ok&&r.lv===1,fmt(r));
  const calls=IT.filter(i=>i.elevator); check('兩層都有「搭電梯」',calls.length===2&&calls.some(c=>c.lv===0)&&calls.some(c=>c.lv===1));
  check('二樓走廊邊（中庭）、迴廊邊（中庭）、樓梯井邊不能直接跳下一樓',!E.canStand(0,-1.4,0.3,1)&&!E.canStand(-4.7,2,0.3,1)&&!E.canStand(-7.8,-1.0,0.3,1));
  /* 樓梯頂端後面、二樓門廳底下的角落：v9.5 以前整塊擋起來（進不去）；2026-10-13 起是法律學院圖書館的門前（D46，使用者「萬才館一樓進去左手邊就是法律系圖書館」），
     要走得進去。還是要成立的：人不會貼進樓梯最上面一階的端面（0.3 m 內站不住）、不能從樓梯頂端直接走下去（tests/nav_lawlib_unit.js 檢查路要繞樓梯）*/
  check('一樓：樓梯東側有欄杆，不能從側面跨上樓梯；樓梯頂端後面的角落（法律學院圖書館門前）站得住，但離樓梯端面 0.3 m 內站不住',!E.canStand(-7.0,1.0,0.3,0)&&!E.canStand(-8.0,5.2,0.3,0)&&E.canStand(-8.0,5.9,0.3,0));
  check('點地面：一樓地板、二樓地板、樓梯都打得到',['0','1'].every(lv=>z.walkMeshes.some(m=>String(m.userData.walkLv|0)===lv))&&z.walkMeshes.length>=8,`${z.walkMeshes.length} 片`); }
// ---------- 總圖大廳（總圖第一階段：大廳＋大樓梯＋二樓自習區，D43）----------
{ const z=loadZone('library_hall'); const L=LIBRARY_LAYOUT, Y1=L.floors[1].y, IT=E.interactables, H0=(x,zz)=>z.levels[0].heightAt(x,zz), H1=(x,zz)=>z.levels[1].heightAt(x,zz);
  { const CO=L.core, U=L.upper, GT=L.gates; let worst=9, at=null; for(const [cx,cz] of [[-CO.x1,U.band.z1],[CO.x1,U.band.z1],[-CO.x1,GT.z],[CO.x1,GT.z]]) for(let a=0;a<32;a++){ const ang=a/32*Math.PI*2; for(let d=0.2;d<=1.2;d+=0.02){ const x=cx+Math.cos(ang)*d, zz=cz+Math.sin(ang)*d; if(z.levels[0].clear(x,zz,0.33)){ if(d<worst){ worst=d; at=[cx,cz,a]; } break; } } }
    check('總圖：中庭四角的柱子（半徑 0.3、柱座 0.36）：玩家（0.33）站得到的位置離柱子中心至少 0.5 m，不會穿進柱子（使用者 2026-10-16 截圖）',worst>=0.5,'最近 '+worst.toFixed(2)+' '+JSON.stringify(at)); }
check('總圖：兩層、二樓 5.0',z.levels.length===2&&z.levels[1].y0===Y1);
const EN=L.entrance.spawn; check('總圖：入口出生點站得住',E.canStand(EN.x,EN.z,0.32,0)&&H0(EN.x,EN.z)===0);
{ const ex=IT.find(i=>i.label==='離開總圖'); check('總圖：入口出生點離「離開總圖」≥ 半徑＋0.3（一進來不會就跳出離開的按鈕）',!!ex&&Math.hypot(EN.x-ex.x,EN.z-ex.z)>=ex.radius+0.3,ex&&`距離 ${Math.hypot(EN.x-ex.x,EN.z-ex.z).toFixed(2)}、半徑 ${ex.radius}`); }
check('總圖：高度：中間最下 0、平台 2.5、兩側最上 5.0',Math.abs(H0(0,-0.62))<0.03&&Math.abs(H0(0,-6)-2.5)<1e-6&&Math.abs(H0(-2.6,-0.65)-Y1)<0.02&&Math.abs(H1(2.6,-0.65)-Y1)<0.02,[H0(0,-0.62),H0(0,-6),H0(-2.6,-0.65),H1(2.6,-0.65)].map(v=>v.toFixed(3)).join(' '));
const W2=[-8.6,1.5,1], E2=[8.0,-5.0,1], SD=L.stairDoor.spawn;
let r=both([EN.x,EN.z,0],W2); check('總圖：入口 → 大樓梯 → 二樓西側自習區',r.ok&&r.lv===1&&Math.abs(r.y-Y1)<0.05,fmt(r));
let p=E.pathTo(EN.x,EN.z,0,W2[0],W2[1],1); console.log('  path',JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
r=both([EN.x,EN.z,0],E2); check('總圖：入口 → 大樓梯 → 二樓東側',r.ok&&r.lv===1,fmt(r));
r=both(W2,[EN.x,EN.z,0]); check('總圖：二樓西側 → 大樓梯 → 入口',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
r=both(W2,[SD.x,SD.z,1]); check('總圖：二樓西側 → 連廊 → 東側樓梯間門口（不用下樓）',r.ok&&r.lv===1,fmt(r));
r=run([EN.x,EN.z,0],W2); check('總圖：跑步＋低幀率：入口 → 二樓西側',r.ok,fmt(r));
r=run(W2,[EN.x,EN.z,0]); check('總圖：跑步＋低幀率：二樓西側 → 入口',r.ok,fmt(r));
r=run([EN.x,EN.z,0],E2); check('總圖：跑步＋低幀率：入口 → 二樓東側',r.ok,fmt(r));
r=run(E2,[EN.x,EN.z,0]); check('總圖：跑步＋低幀率：二樓東側 → 入口',r.ok,fmt(r));
check('總圖：二樓：中庭上方、中間那一跑上方、樓梯外側欄杆站不住',!E.canStand(0,3,0.3,1)&&!E.canStand(0,-1.0,0.3,1)&&!E.canStand(-3.6,-3,0.3,1)&&!E.canStand(-5.2,4,0.3,1));
check('總圖：二樓：兩翼、連廊站得住',E.canStand(-8.6,1.5,0.3,1)&&E.canStand(0,0.4,0.3,1)&&E.canStand(-4.4,-3,0.3,1)&&E.canStand(8,6,0.3,1));
check('總圖：一樓：核心實心、兩側那一跑最上面那一排從大廳進不去；連廊下面站得住',!E.canStand(-4.4,-3,0.3,0)&&!E.canStand(-2.6,-0.6,0.3,0)&&E.canStand(0,0.2,0.3,0)&&E.canStand(-2.6,0.2,0.3,0));
for(const [x0,x1] of [[0,0],[-3.6,-3.6],[3.6,3.6],[-2.0,-2.0]]){ r=both([x0,7.4,0],[x1,3.0,0]); check(`總圖：閘門：x=${x0} 那一道走得過去`,r.ok,fmt(r)); }
// 互動點
let bad=[]; for(const it of IT){ if(it.elevator) continue; const lv=it.lv|0; const t=E.nav.nearestFree?null:null; const target=[it.x,it.z,lv]; let ok=E.canStand(it.x,it.z,0.3,lv); let rr=null; if(!ok){ // 互動點本身在家具上：找半徑內站得住的點
    let best=null; for(let a=0;a<16&&!best;a++){ for(const d of [0.6,0.9,1.2]){ const x=it.x+Math.sin(a*Math.PI/8)*d, zz=it.z+Math.cos(a*Math.PI/8)*d; if(d<=it.radius&&E.canStand(x,zz,0.3,lv)){ best=[x,zz,lv]; break; } } } if(best){ target[0]=best[0]; target[1]=best[1]; ok=true; } }
  if(ok){ rr=both([EN.x,EN.z,0],target); ok=rr.ok&&(rr.lv|0)===lv; } if(!ok) bad.push(`${it.label}(${it.x.toFixed(1)},${it.z.toFixed(1)},${lv}) ${fmt(rr)}`); }
check(`總圖：互動點都走得到（${IT.length} 個）`,!bad.length,bad.slice(0,5).join(' | '));
// 座位：椅子後面 0.6 m
bad=[]; for(const s of z.seats){ const ap=[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6]; const st=E.canStand(ap[0],ap[1],0.3,1); const rr=st?both([EN.x,EN.z,0],[ap[0],ap[1],1]):{ok:false,reason:'站不住'}; if(!rr.ok) bad.push(`(${s.x.toFixed(2)},${s.z.toFixed(2)}) ${fmt(rr)}`); }
check(`總圖：二樓自習區 ${z.seats.length} 個座位：椅子後面站得住、走得到`,!bad.length,bad.slice(0,4).join(' | '));
const sA=z.seats[0], sB=z.seats[1]; check('總圖：劇情座位（小安「總圖的下午」）：西側靠窗那一張長桌、面對面',sA&&sB&&sA.x<-9.9&&sA.lv===1&&Math.abs(sA.x-sB.x)<1e-6&&sA.yaw===0&&Math.abs(sB.yaw-Math.PI)<1e-6,JSON.stringify([sA,sB]));
r=both([0,0.4,1],[sA.x,sA.z-0.7,1]); const r2=both([0,0.4,1],[sB.x,sB.z+0.7,1]); check('總圖：劇情：從連廊走到兩個座位旁邊（libraryScene 的 walkTo）',r.ok&&r2.ok,fmt(r)+' '+fmt(r2));
// 電梯
const el=z.elev; const inside=[el.cx,el.inZ];
check('總圖：電梯：門關著時車廂裡站不住',!E.canStand(inside[0],inside[1],0.3,0)&&!E.canStand(inside[0],inside[1],0.3,1));
el.isOpen=true; el.lv=0; el.setCells(); r=both([el.cx,el.outZ,0],[inside[0],inside[1],0]); check('總圖：電梯一樓門開著：走得進車廂',r.ok,fmt(r));
el.lv=1; el.setCells(); r=both([inside[0],inside[1],1],[el.cx,el.outZ,1]); check('總圖：電梯二樓門開著：走得出去',r.ok&&r.lv===1,fmt(r)); el.isOpen=false; el.lv=0; el.setCells();
r=both([EN.x,EN.z,0],[el.cx,el.outZ,0]); check('總圖：一樓：入口 → 電梯門口',r.ok,fmt(r));
check('總圖：電梯的樓層：1F、2F、3F 閱覽區（別的區域）、4F 關著、5F 書庫（別的區域，CLOSED-SPACES-1023 第 3 項）、6F 關著',el.floors.length===6&&el.floors[2].zone==='library'&&!!el.floors[2].spawn&&el.floors[3].open===false&&el.floors[4].zone==='library_stacks'&&el.floors[4].open&&!!el.floors[4].spawn&&el.floors[5].open===false,JSON.stringify(el.floors.map(f=>[f.label,f.lv,f.zone||''])));
// 搭電梯進來（從閱覽室）：車廂停在那一層、人在車廂裡站得住
E.interactables=[]; E.spawnHint={x:10.4,z:-1.65,lv:1,elev:true}; const z2=Z3.ZONES.library_hall.build(E); E.zone=z2; E.levels=z2.levels; E.nav=z2.nav; for(const n of E.levels) n._cm=null; E.spawnHint=null;
check('總圖：從閱覽室搭電梯到二樓：車廂在二樓、車廂裡站得住（出生點不會被移走）',z2.elev.lv===1&&E.canStand(10.4,-1.65,0.3,1),`lv=${z2.elev.lv}`);
// 閱覽室
const zr=loadZone('library'); const IR=E.interactables; const sx=IR.find(i=>i.exit&&i.exit.to==='library_hall'); const ec=IR.find(i=>i.elevator);
check('總圖：閱覽室：前面的門是樓梯間（回到大廳二樓東側）、東側有電梯',!!sx&&sx.exit.spawn.lv===1&&!!ec&&!!zr.elev,sx&&JSON.stringify(sx.exit));
check('總圖：閱覽室的座位照舊（36 個、劇情用的 seats[2] 等不變）',zr.seats.length===36,`${zr.seats.length}`);
r=both([0,7,0],[ec.x,ec.z,0]); check('總圖：閱覽室：入口 → 電梯門口',r.ok,fmt(r));
const er=zr.elev; er.isOpen=true; er.setCells(); r=both([er.cx,er.outZ,0],[er.cx,er.inZ,0]); check('總圖：閱覽室電梯門開著：走得進車廂',r.ok,fmt(r)); er.isOpen=false; er.setCells();
check('總圖：閱覽室電梯：1F、2F（大廳區域）、3F（這裡）、4F 關著、5F 書庫（別的區域）、6F 關著',er.floors.length===6&&er.floors[0].zone==='library_hall'&&er.floors[2].lv===0&&!er.floors[2].zone&&er.floors[3].open===false&&er.floors[4].zone==='library_stacks'&&!!er.floors[4].spawn&&er.floors[5].open===false,JSON.stringify(er.floors.map(f=>[f.label,f.lv,f.zone||''])));
bad=[]; for(const s of zr.seats){ const ap=[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6]; if(!E.canStand(ap[0],ap[1],0.3,0)) bad.push(`(${s.x},${s.z})`); } check('總圖：閱覽室：座位後面還是站得住（加了電梯沒擋到）',!bad.length,bad.join(' ')); }
// ---------- 男生宿舍（宿舍走廊，D44）：大門 → 門廳 → 走廊 → 雙跑樓梯 → 二樓走廊 → 自己的房門；房間的出口 → 二樓走廊 ----------
{ const z=loadZone('dorm_hall'); const L=DORM_LAYOUT, Y1=L.floors[1].y, IT=E.interactables, H0=(x,zz)=>z.levels[0].heightAt(x,zz), H1=(x,zz)=>z.levels[1].heightAt(x,zz), S=L.stair;
check('宿舍：兩層、二樓 3.6',z.levels.length===2&&z.levels[1].y0===Y1);
const EN=L.entrance.spawn, HM=L.home.spawn; check('宿舍：大門出生點、房門外的出生點站得住',E.canStand(EN.x,EN.z,0.32,0)&&E.canStand(HM.x,HM.z,0.32,1)&&Math.abs(H1(HM.x,HM.z)-Y1)<1e-6);
const ex=IT.find(i=>i.label==='離開宿舍'), hd=IT.find(i=>i.exit&&i.exit.to==='dorm');
check('宿舍：出生點離「離開宿舍」、房門外離「回房間」≥ 半徑＋0.3（一進來不會就跳出離開的按鈕）',!!ex&&!!hd&&Math.hypot(EN.x-ex.x,EN.z-ex.z)>=ex.radius+0.3&&Math.hypot(HM.x-hd.x,HM.z-hd.z)>=hd.radius+0.3,ex&&hd&&`${Math.hypot(EN.x-ex.x,EN.z-ex.z).toFixed(2)}／${Math.hypot(HM.x-hd.x,HM.z-hd.z).toFixed(2)}`);
const ax=(S.A.x0+S.A.x1)/2, bx=(S.B.x0+S.B.x1)/2;
{ const za=S.A.z1-0.14, zb=S.B.z1-0.07; check('宿舍：高度：A 跑最下面一階 ≈0.16、平台 1.8、B 跑最上面 3.6（兩層相同）、走廊 0／3.6',Math.abs(H0(ax,za)-0.16)<0.17&&Math.abs(H0(0,-5.2)-1.8)<1e-6&&Math.abs(H0(bx,zb)-Y1)<0.02&&Math.abs(H1(bx,zb)-Y1)<0.02&&H0(0,0)===0&&Math.abs(H1(0,0)-Y1)<1e-6,[H0(ax,za),H0(0,-5.2),H0(bx,zb),H1(bx,zb)].map(v=>v.toFixed(3)).join(' ')); }
const W2=[-9.5,0,1], E2=[11,0,1], HOME=[HM.x,HM.z,1];
let r=both([EN.x,EN.z,0],HOME); check('宿舍：大門 → 門廳 → 走廊 → 樓梯 → 二樓 → 自己的房門前',r.ok&&r.lv===1&&Math.abs(r.y-Y1)<0.05,fmt(r));
r=both(HOME,[EN.x,EN.z,0]); check('宿舍：房門前 → 樓梯 → 一樓 → 大門',r.ok&&r.lv===0&&Math.abs(r.y)<0.05,fmt(r));
r=both(HOME,W2); const r2=both(HOME,E2); check('宿舍：二樓走廊兩端都走得到（不用下樓）',r.ok&&r.lv===1&&r2.ok&&r2.lv===1,fmt(r)+' '+fmt(r2));
r=run([EN.x,EN.z,0],HOME); check('宿舍：跑步＋低幀率：大門 → 房門前',r.ok,fmt(r));
r=run(HOME,[EN.x,EN.z,0]); check('宿舍：跑步＋低幀率：房門前 → 大門',r.ok,fmt(r));
check('宿舍：二樓：A 跑上方、樓梯間外、寢室裡站不住',!E.canStand(ax,-2.5,0.3,1)&&!E.canStand(-6,-4,0.3,1)&&!E.canStand(6,4,0.3,1)&&!E.canStand(0,-5.2,0.3,1));
check('宿舍：一樓：寢室裡、B 跑最上面那一排從一樓走廊進不去、兩跑中間的牆站不住',!E.canStand(-8,-4,0.3,0)&&!E.canStand(bx,-1.4,0.3,0)&&!E.canStand(0.2,-3,0.3,0));
check('宿舍：一樓：走廊、門廳、交誼廳站得住',E.canStand(-12,0,0.3,0)&&E.canStand(12,0,0.3,0)&&E.canStand(0,4,0.3,0)&&E.canStand(7,6,0.3,0));
let bad=[]; for(const it of IT){ const lv=it.lv|0; const target=[it.x,it.z,lv]; let ok=E.canStand(it.x,it.z,0.3,lv); let rr=null; if(!ok){ let best=null; for(let a=0;a<16&&!best;a++){ for(const d of [0.6,0.9,1.2]){ const x=it.x+Math.sin(a*Math.PI/8)*d, zz=it.z+Math.cos(a*Math.PI/8)*d; if(d<=it.radius&&E.canStand(x,zz,0.3,lv)){ best=[x,zz,lv]; break; } } } if(best){ target[0]=best[0]; target[1]=best[1]; ok=true; } }
  if(ok){ rr=both([EN.x,EN.z,0],target); ok=rr.ok&&(rr.lv|0)===lv; } if(!ok) bad.push(`${it.label}(${it.x.toFixed(1)},${it.z.toFixed(1)},${lv}) ${fmt(rr)}`); }
check(`宿舍：互動點都走得到（${IT.length} 個）`,!bad.length,bad.slice(0,5).join(' | '));
bad=[]; for(const s of z.seats){ const ap=[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6]; const st=E.canStand(ap[0],ap[1],0.3,s.lv|0); const rr=st?both([EN.x,EN.z,0],[ap[0],ap[1],s.lv|0]):{ok:false,reason:'站不住'}; if(!rr.ok) bad.push(`(${s.x.toFixed(2)},${s.z.toFixed(2)}) ${fmt(rr)}`); }
check(`宿舍：交誼廳長桌 ${z.seats.length} 個座位：椅子後面站得住、走得到`,z.seats.length>=4&&!bad.length,bad.slice(0,4).join(' | '));
check('宿舍：走廊兩側的牆是鏡頭碰撞',E.colliders.length>=6,`${E.colliders.length} 個`);
// 房間（dorm）的出口 → 二樓走廊
const zr=loadZone('dorm'); const out=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall'); check('宿舍：房間的「走出房間」→ 二樓走廊（第 1 層、房門外）',!!out&&out.exit.spawn.lv===1&&Math.abs(out.exit.spawn.x-HM.x)<1e-6,out&&JSON.stringify(out.exit));
check('宿舍：房間裡的床、書桌、睡覺照舊',!!E.interactables.find(i=>i.sleep)&&!!E.interactables.find(i=>i.deskStudy));
// 四人房（DORM-LOFT-L，DORM_ROOM）：每個互動點範圍內站得住、從門口走得到；書桌座位的走近點（ap）走得到；四組床桌、洗手間擋住；房間中間的走道走得通
{ const R=DORM_ROOM, me=R.units.find(u=>u.id===R.player_unit); const sp=[R.room.spawn[0],R.room.spawn[1],0]; let bad=[];
  for(const it of E.interactables){ let pt=null; if(E.canStand(it.x,it.z,0.3,0)) pt=[it.x,it.z]; for(let a=0;a<16&&!pt;a++) for(const d of [0.3,0.5,0.7,0.9]){ const x=it.x+Math.sin(a*Math.PI/8)*d, zz=it.z+Math.cos(a*Math.PI/8)*d; if(d<it.radius&&E.canStand(x,zz,0.3,0)){ pt=[x,zz]; break; } }
    const rr=pt?both(sp,[pt[0],pt[1],0]):{ok:false,reason:'範圍內站不住'}; if(!rr.ok) bad.push(it.label+' '+fmt(rr)); }
  check('四人房：互動點（'+E.interactables.length+' 個：書桌、睡覺、出口、房間物件）範圍內站得住、從門口走得到',E.interactables.length>=4&&!bad.length,bad.join(' | '));
  const desk=E.interactables.find(i=>i.deskStudy); check('四人房：玩家的書桌是 '+R.player_unit+'、走近點 ap 站得住也走得到',!!desk&&Math.abs(desk.seat.x-me.seat.x)<1e-6&&E.canStand(desk.seat.ap[0],desk.seat.ap[1],0.3,0)&&both(sp,[desk.seat.ap[0],desk.seat.ap[1],0]).ok);
  const sl=E.interactables.find(i=>i.sleep); check('四人房：睡覺在梯子前（'+me.sleep+'）',!!sl&&Math.abs(sl.x-me.sleep[0])<1e-6&&Math.abs(sl.z-me.sleep[1])<1e-6);
  check('四人房：四組床桌、洗手間擋住；房間中間、窗前、兩邊書桌前站得住',R.units.every(u=>!E.nav.free((u.block.x[0]+u.block.x[1])/2,(u.block.z[0]+u.block.z[1])/2))&&!E.nav.free(1.75,2.4)&&[[0,0],[0,-2.6],[-1.5,-0.1],[1.5,-0.1],[1.5,-2.5],[-1.5,-2.5]].every(p=>E.canStand(p[0],p[1],0.3,0)));
  check('四人房：z.spots（黃金葛、盒子、三盆植物、房間物件、背包）都在走得到的地方附近（0.7 m 內站得住）',Object.entries(zr.spots||{}).every(([k,p])=>{ for(let a=0;a<16;a++) for(const d of [0,0.3,0.5,0.7]){ const x=p[0]+Math.sin(a*Math.PI/8)*d, zz=p[1]+Math.cos(a*Math.PI/8)*d; if(E.canStand(x,zz,0.3,0)&&both(sp,[x,zz,0]).ok) return true; } return false; }),JSON.stringify(zr.spots));
  check('四人房：年份 sets（法律系 203、經濟系 412）照旗標',typeof zr.dormSet==='function'&&zr.dormSetKey==='203'); }
// 每一年的房間（AA_208 第 7、8 節，取代 AA_183 的 112／218／105；房號只是門牌，都在走廊樓上那一層）：203 → 312（用 204 那扇門）→ 507（201 那扇）→ 409（202 那扇）；經濟系 412（門用大一的）
// 2026-10-20 SCN-V4-01／SCN-V5-01：原本大三 218、大四 105（一樓），和字卡「五樓 507 號房」「四樓 409 號房」對不上——修改前這兩項 FAIL
{ const HS=DM3.HOMES, hm=f=>DM3.homeOf({stage:'law',flags:f}); check('宿舍：房號照年份：大一 203、ROOM_Y2 312、ROOM_Y3 507、ROOM_Y4 409、經濟系 412；都在樓上那一層',hm({}).plate==='203'&&hm({ROOM_Y2:5}).plate==='312'&&hm({ROOM_Y2:5,ROOM_Y3:9}).plate==='507'&&hm({ROOM_Y2:5,ROOM_Y3:9,ROOM_Y4:12}).plate==='409'&&DM3.homeOf({stage:'econ',flags:{}}).plate==='412'&&[{},{ROOM_Y2:5},{ROOM_Y3:9},{ROOM_Y4:12}].every(f=>hm(f).lv===1));
  check('宿舍：樓層照房號（指路的字幕、樓梯口的指標用）：203 二樓、312 三樓、507 五樓、409 四樓、經濟系 412 四樓',hm({}).floorZh==='二樓'&&hm({ROOM_Y2:5}).floorZh==='三樓'&&hm({ROOM_Y3:9}).floorZh==='五樓'&&hm({ROOM_Y3:9,ROOM_Y4:12}).floorZh==='四樓'&&DM3.homeOf({stage:'econ',flags:{}}).floorZh==='四樓',JSON.stringify([{},{ROOM_Y2:5},{ROOM_Y3:9},{ROOM_Y4:12}].map(f=>hm(f).floorZh)));
  check('宿舍：大一的房門照舊（DORM_LAYOUT.home 的位置）',hm({}).x===L.home.x&&hm({}).lv===L.home.lv&&JSON.stringify(hm({}).spawn)===JSON.stringify(L.home.spawn));
  loadZone('dorm_hall'); let bad2=[]; for(const k of Object.keys(HS)){ const h=HS[k], sp={x:h.x,z:0.4,lv:h.lv}; if(!E.canStand(sp.x,sp.z,0.32,sp.lv)){ bad2.push(k+' 站不住'); continue; } let rr=both([EN.x,EN.z,0],[sp.x,sp.z,sp.lv]); if(!rr.ok||(rr.lv|0)!==sp.lv) bad2.push(k+' 去 '+fmt(rr)); rr=both([sp.x,sp.z,sp.lv],[EN.x,EN.z,0]); if(!rr.ok) bad2.push(k+' 回 '+fmt(rr)); }
  check('宿舍：四個房間的門口站得住、從大門走得到、走得回大門',!bad2.length,bad2.join(' | '));
  const G0=global.GAME; global.GAME={G:{stage:'law',flags:{ROOM_Y2:5}}}; loadZone('dorm_hall'); const I2=E.interactables, hd2=I2.find(i=>i.exit&&i.exit.to==='dorm');
  check('宿舍：大二：「回房間（312）」在二樓 204 那扇門口；204 的門換成自己的；原本 203 那扇變成關著的寢室（門牌整層照 312 排：311）',!!hd2&&hd2.label==='回房間（312）'&&(hd2.lv|0)===1&&Math.abs(hd2.x-HS.y2.x)<1e-6&&!I2.some(i=>/^20\d 寢室/.test(i.label||''))&&I2.some(i=>i.label==='311 寢室'&&i.look),hd2&&JSON.stringify([hd2.label,hd2.lv,hd2.x]));
  { const lv1=I2.filter(i=>(i.lv|0)===1&&/^\d{3} 寢室$/.test(i.label||'')).map(i=>i.label.slice(0,3)).sort(), lv0=I2.filter(i=>(i.lv|0)===0&&/^\d{3} 寢室$/.test(i.label||'')).map(i=>i.label.slice(0,3)).sort();
    check('宿舍：大二：同一層的門牌都是 3 開頭（309～316，2026-10-18 使用者：同一層不是同一個號碼開頭）；一樓照舊 1 開頭',lv1.length>=6&&lv1.every(n=>n[0]==='3')&&lv0.length&&lv0.every(n=>n[0]==='1'),JSON.stringify({lv1,lv0})); }
  global.GAME={G:{stage:'econ',flags:{}}}; loadZone('dorm_hall'); { const I4=E.interactables, h4=I4.find(i=>i.exit&&i.exit.to==='dorm'), lv1=I4.filter(i=>(i.lv|0)===1&&/^\d{3} 寢室$/.test(i.label||'')).map(i=>i.label.slice(0,3)).sort();
    check('宿舍：經濟系：「回房間（412）」、同一層的門牌 410～417、沒有 2 開頭（使用者：「我經濟系宿舍 4 開頭，對面 2 開頭」）',!!h4&&h4.label==='回房間（412）'&&JSON.stringify(lv1)===JSON.stringify(['410','411','413','414','415','416','417']),JSON.stringify({h:h4&&h4.label,lv1})); }
  /* 大三 507、大四 409（SCN-V4-01／SCN-V5-01）：自己的門在樓上那一層、同一層整排 5 開頭／4 開頭、一樓樓梯口的指標寫 5F／4F（大一、大二照舊 2F／3F）*/
  const signTexts=z=>{ const out=[]; z.group.traverse(o=>{ if(/^sign_/.test(o.name||'')) out.push(o.name.slice(5)); }); return out; };
  for(const [f,plate,lead,want,sign,y] of [[{ROOM_Y2:5,ROOM_Y3:9},'507','5',['508','509','510','511','512','513','514'],'樓梯 5F ↑','y3'],[{ROOM_Y2:5,ROOM_Y3:9,ROOM_Y4:12},'409','4',['408','410','411','412','413','414','415'],'樓梯 4F ↑','y4']]){
    global.GAME={G:{stage:'law',flags:f}}; const zh=loadZone('dorm_hall'), I5=E.interactables, h5=I5.find(i=>i.exit&&i.exit.to==='dorm'), lv1=I5.filter(i=>(i.lv|0)===1&&/^\d{3} 寢室$/.test(i.label||'')).map(i=>i.label.slice(0,3)).sort(), lv0=I5.filter(i=>(i.lv|0)===0&&/^\d{3} 寢室$/.test(i.label||'')).map(i=>i.label.slice(0,3)).sort(), st=signTexts(zh);
    check(`宿舍：${plate}：「回房間（${plate}）」在樓上那一層、${HS[y].rep} 那扇門口；同一層的門牌 ${want[0]}～${want[want.length-1]}（都是 ${lead} 開頭）、一樓照舊 1 開頭；一樓樓梯口「${sign}」`,!!h5&&h5.label==='回房間（'+plate+'）'&&(h5.lv|0)===1&&Math.abs(h5.x-HS[y].x)<1e-6&&JSON.stringify(lv1)===JSON.stringify(want)&&lv0.length&&lv0.every(n=>n[0]==='1')&&st.includes(sign)&&!st.includes('樓梯 2F ↑'),JSON.stringify({h:h5&&h5.label,lv1,lv0,st})); }
  /* AA_345 J1：大三 507（五樓）——從一樓走上樓梯、換到樓上那一層時，一句轉場旁白「（爬了四層樓梯。五樓的走廊比樓下暗一點。）」（修改前 FAIL）*/
  { const UP='（爬了四層樓梯。五樓的走廊比樓下暗一點。）', caps=[], climb=(z,seq)=>{ caps.length=0; for(const lv of seq){ E.player.lv=lv; if(z.update) z.update(1/30,E); } return caps.filter(t=>t===UP).length; };
    const GG=f=>({G:{stage:'law',flags:f},D:{active:false},caption:(w,t)=>caps.push(t)});
    global.GAME=GG({ROOM_Y2:5,ROOM_Y3:9}); const z3=loadZone('dorm_hall'); const n1=climb(z3,[0,0,1,1,1]), n2=climb(z3,[1,0,0,1]); const zr3=loadZone('dorm_hall'), n0=climb(zr3,[1,1,0]);
    global.GAME.D.active=true; const zd=loadZone('dorm_hall'), nd=climb(zd,[0,1]); global.GAME.D.active=false;
    const ny=[]; for(const f of [{},{ROOM_Y2:5},{ROOM_Y2:5,ROOM_Y3:9,ROOM_Y4:12}]){ global.GAME=GG(f); ny.push(climb(loadZone('dorm_hall'),[0,1])); }
    check('宿舍：大三 507：從一樓走上樓上那一層，一句轉場旁白「'+UP+'」（每次從一樓上去都說；從房間出來就在樓上的不說；對話進行中不說）；大一 203、大二 312、大四 409 沒有（AA_345 J1）',n1===1&&n2===1&&n0===0&&nd===0&&ny.every(x=>x===0)&&DM3.Y3_UP===UP,JSON.stringify({n1,n2,n0,nd,ny})); }
  global.GAME={G:{stage:'law',flags:{}}}; check('宿舍：大一：一樓樓梯口照舊「樓梯 2F ↑」',signTexts(loadZone('dorm_hall')).includes('樓梯 2F ↑'));
  global.GAME={G:{stage:'law',flags:{ROOM_Y2:5}}};
  check('宿舍：大二：門口離「回房間」≥ 半徑＋0.3',!!hd2&&Math.hypot(HS.y2.x-hd2.x,0.4-hd2.z)>=hd2.radius+0.3);
  loadZone('dorm'); const out2=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall'); check('宿舍：大二：房間的「走出房間」→ 二樓 312 門口',!!out2&&out2.exit.spawn.lv===1&&Math.abs(out2.exit.spawn.x-HS.y2.x)<1e-6,out2&&JSON.stringify(out2.exit.spawn));
  global.GAME={G:{stage:'law',flags:{}}}; loadZone('dorm'); const G1=global.GAME.G; G1.flags.ROOM_Y2=5; DM3.fixRoomExit(E,G1); const out3=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall'); check('宿舍：人在房間裡搬（主線 3）：出口就地改成 312',!!out3&&out3.exit.spawn.lv===1&&Math.abs(out3.exit.spawn.x-HS.y2.x)<1e-6);
  global.GAME=G0; } }
// ---------- 點樓梯走完一跑（任務 #42）：每一跑樓梯（點地面的透明斜面）兩端站得住、上下走得通 ----------
for(const id of ['linze','wancai','library_hall','dorm_hall']){ const z=loadZone(id); const ms=z.walkMeshes.filter(m=>m.userData.stairEnds); const bad=[];
  for(const m of ms){ const [a,b]=m.userData.stairEnds; for(const e of [a,b]) if(!E.canStand(e.x,e.z,0.32,e.lv)) bad.push('站不住 '+JSON.stringify(e)); const r=both([a.x,a.z,a.lv],[b.x,b.z,b.lv]); if(!r.ok||(r.lv|0)!==b.lv) bad.push('往上 '+fmt(r)); const r2=both([b.x,b.z,b.lv],[a.x,a.z,a.lv]); if(!r2.ok||(r2.lv|0)!==a.lv) bad.push('往下 '+fmt(r2)); }
  check(`${id}：點樓梯走完一跑——${ms.length} 跑樓梯的兩端站得住、上下走得通（下面那一端比上面那一端低）`,ms.length>=2&&!bad.length&&ms.every(m=>{ const [a,b]=m.userData.stairEnds; return E.heightAt(a.x,a.z,a.lv)<E.heightAt(b.x,b.z,b.lv); }),bad.slice(0,3).join(' | ')); }
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
// ---------- 校園擺帳篷的日子（AA_177 第 10 節：大一 2025-11-15；大二起照各年的校慶，「每年 11/15」只留給大一）----------
{ const F=Z3.fairDayKey; check('帳篷：大一校慶 2025-11-15、大二博覽會 9/12（CLUBFAIR-REAL-1027，AA_485 3-2：原本 9/16～17）、校慶 2026-11-14、大三 2027-11-13、大四 2028-11-11 擺；9/16、9/17 不擺',['2025-11-15','2026-09-12','2026-11-14','2027-11-13','2028-11-11'].every(k=>F(k,false,[]))&&!F('2026-09-16',false,[])&&!F('2026-09-17',false,[]));
  check('帳篷：2026-11-15、2027-11-15、2028-11-15 不擺（11/15 只留給大一）',!F('2026-11-15',false,[])&&!F('2027-11-15',false,[])&&!F('2028-11-15',false,[]));
  check('帳篷：經濟系那一年的博覽會、校慶只在經濟系擺；大一博覽會照 activities 的日子',F('2024-11-09',true,[])&&!F('2024-11-09',false,[])&&F('2025-09-30',false,['2025-09-30'])&&!F('2025-09-30',false,[])); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
