// 社科院圖書館（辜先生紀念圖書館一樓，D56 社科院第①步，2026-10-13）的導航（不需要瀏覽器）：在 Node 裡建出遊戲真正的校園與圖書館，
// 用引擎真正的找路（E.pathTo）＋移動碰撞（E.simWalk：人物半徑 0.32 m、dt 1/30 與 0.1、走路與跑步）檢查：
//   校園：新社科院（ART-01；X75 搬到霖澤館西南、轉 180°）圖書館北牆（中庭那一面）有「進入社科院圖書館」（一樓）、新外觀的導航（圖書館、大樓站不住，中庭、柱廊、往小椰林道的步道走得到）、鏡頭碰撞、中庭長椅、旁邊站得住、從霖澤館前／萬才館門口／總圖門口走得到；從圖書館出來的位置站得住、離門夠遠（不會一出來又跳出按鈕）；社科院原本的位置是一棟沒有名字的系館；
//   圖書館：弧形書架的導航阻擋和書架的位置對得上（配置 nav.rects 的 ry 是 three.js 的方向，blockRect 要傳 −ry——用錯方向的版本這一項會失敗，下面也驗證這件事）；
//          林間書房（弧形書架圍著柱子）從缺口走得進去；閘門只能從三個通道過、欄杆和服務台後面站不住；
//          每一個座位「坐下」走得到的位置（GAME.seatApproach 的規則）、每一個互動點、背景人物的散步路線都走得到；出口、快速前往的落點站得住。
// 這是模擬（證明路走得通），不是真實玩家流程；真實流程在 tests/flow_soclib.py。
// 用法：node tests/nav_soclib_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js',
  'src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/calendar.js','src/data/places.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|CALENDAR|PLACES|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };   /* 走路 1.8 m/s＋跑步 4.8 m/s、低幀率（v9.5 的速度）*/
const fmt=r=>JSON.stringify(r).slice(0,200);
const stand=(x,z,r)=>E.canStand(x,z,r==null?0.32:r,0);
function standNear(it){ const R=Math.min(it.radius||1,1.2); if(stand(it.x,it.z)) return [it.x,it.z]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z)) return [x,z]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,0.3)) return [x,z]; } return null; }   /* GAME.seatApproach 的規則 */
const L=SOCLIB_LAYOUT;

// ---------- 校園：社科院正面的門 ----------
{ const z=loadZone('campus'); const door=E.interactables.find(i=>i.exit&&i.exit.to==='soclib');
  check('校園：新社科院（ART-01，X75 搬到霖澤館西南）圖書館北牆有「進入社科院圖書館」（一樓、門在 x≈11、z=-65.7，中庭那一面）',!!door&&door.lv===0&&Math.abs(door.x-11)<0.5&&Math.abs(door.z+65.7)<0.5,door?`(${door.x},${door.z}) lv${door.lv} ${door.label}`:'沒有');
  if(door){ const nd=standNear(door); check('門的互動點旁邊站得住（按得到）',!!nd,JSON.stringify(nd));
    const C=SL3.CAMPUS; check('從圖書館出來的位置站得住、離門的互動點 ≥ 半徑＋0.2 m（一出來不會又跳出按鈕）',stand(C.x,C.z)&&Math.hypot(C.x-door.x,C.z-door.z)>=door.radius+0.2,`(${C.x},${C.z}) 距離 ${Math.hypot(C.x-door.x,C.z-door.z).toFixed(2)}`);
    check('出來時面向北（中庭；人物面向 (sin yaw, cos yaw)）',Math.abs(Math.sin(C.yaw))<1e-6&&Math.abs(Math.cos(C.yaw)+1)<1e-6,`yaw ${C.yaw}`);
    if(nd){ for(const [nm,p] of [['霖澤館前',[34,-98]],['萬才館門口（出來的位置）',[93.8,-98.4]],['總圖門口',[80,0]]]){ const r=walk(p,nd); check(`從${nm}走到社科院圖書館的門（走路、跑步＋低幀率）`,r.ok,fmt(r)); }
      const r=walk([C.x,C.z],[34,-98]); check('從社科院圖書館出來走回霖澤館前',r.ok,fmt(r)); } }
  check('大地圖有「社會科學院」的地名',PLACES.landmarks.campus.some(q=>q[0]==='社會科學院'));
  /* 新社科院的導航（src/data/socsci_layout.js，LAWWW2 campus_socsci.json；X75 搬家、轉 180°）：圖書館、大樓站不住；中庭、大樓一樓東面與南面的柱廊、往小椰林道的步道站得住、走得到；萬才館東南（社科院原本的位置）照舊走得到 */
  const SX=SOCSCI_LAYOUT; check('socsci_layout：22 個阻擋、1 個樹穴、3 個鏡頭碰撞、4 張長椅',SX.rects.length===22&&SX.circles.length===1&&SX.cams.length===3&&SX.benches.length===4);
  const blocked=[[2,-54,'圖書館中間'],[15,-45,'圖書館東南角裡面'],[-11,-63,'圖書館西北角裡面'],[1,-86,'大樓一樓大廳裡面'],[-10.8,-66.4,'樹穴'],[112,-62,'社科院原本的位置：沒有名字的系館']].filter(([x,z])=>stand(x,z));
  check('圖書館、大樓、樹穴、原本位置的系館站不住',!blocked.length,JSON.stringify(blocked));
  const open_=[[2,-71,'中庭中間'],[12,-71,'中庭東邊'],[15.7,-85,'大樓東面柱廊（正門）'],[2,-78.1,'大樓南面柱廊'],[21,-66.5,'小椰林道往中庭的步道'],[21,-85,'法學院廣場往大樓正門的步道'],[97,-95,'萬才館東南（社科院原本的位置旁邊；x≥100、z≤-84 照舊是北側邊界）'],[93,-75,'往萬才館的小路'],[98,-60,'z=-60 那條路的東端（原本位置的系館門口）']].filter(([x,z])=>!stand(x,z));
  check('中庭、柱廊、往小椰林道的步道、萬才館東南站得住',!open_.length,JSON.stringify(open_));
  for(const [nm,p] of [['大樓正門（東面）',[SX.mainDoor.x+0.3,SX.mainDoor.z]],['大樓面中庭的入口',[SX.courtDoor.x,SX.courtDoor.z+0.4]],['中庭',[2,-71]]]){ const r=walk([34,-98],p); check(`從霖澤館前走到${nm}（走路、跑步＋低幀率）`,r.ok,fmt(r)); }
  { const r=walk([30,-40],[2,-71]); check('從小椰林道走進社科院的中庭（走路、跑步＋低幀率）',r.ok,fmt(r)); }
  const old7=[0,1,2,3,4,5,6].map(i=>[96,-90+i*6]).filter(([x,z])=>z>-70&&z<-58&&!stand(x,z));
  check('舊的 7 根白色圓柱拿掉了（中庭那一段站得住）',!old7.length,JSON.stringify(old7));
  const cams=E.colliders.filter(m=>{ const p=m.position; return p.x>-14&&p.x<18&&p.z>-94&&p.z<-42; });
  check('鏡頭碰撞：圖書館、大樓懸挑以上、大樓一樓各一個（X75 的新位置）',cams.length===3,cams.map(m=>`(${m.position.x.toFixed(1)},${m.position.y.toFixed(1)},${m.position.z.toFixed(1)})`).join(' '));
  const sb=z.seats.filter(q=>q.label==='坐在社科院中庭的長椅'); check('中庭四張長椅可以坐（坐下走得到的位置站得住）',sb.length===4&&sb.every(q=>!!approach(q)),JSON.stringify(sb.map(q=>[q.x,q.z,+q.yaw.toFixed(2)])));
  const fbk=E.scene.children.length>=0&&z.group.children.find(o=>o.userData&&o.userData.ckTag==='soc'); check('備用量體標 ckTag soc（正式模型載入後藏起來）、不參加靜態合併',!!fbk&&fbk.userData.dyn===true); }

// ---------- 圖書館 ----------
{ const t0=Date.now(); const z=loadZone('soclib'); console.log(`（圖書館建好：${((Date.now()-t0)/1000).toFixed(2)} 秒，互動點 ${E.interactables.length} 個、座位 ${z.seats.length} 個）`);
  const nav=z.nav, sp=L.entrance.spawn, EX=E.interactables.find(i=>i.exit&&i.exit.to==='campus');
  check('一層導航（沒有樓層）、座位 65 個（長桌 24、窗邊 33、閱報區 8），每個都有 x、z、yaw、lv 0',!z.levels&&z.seats.length===65&&z.seats.filter(s=>s.kind==='table').length===24&&z.seats.filter(s=>s.kind==='window').length===33&&z.seats.filter(s=>s.kind==='lounge').length===8&&z.seats.every(s=>isFinite(s.x)&&isFinite(s.z)&&isFinite(s.yaw)&&s.lv===0));
  check('入口的出生點站得住、離「離開圖書館」≥ 半徑＋0.2 m（一進來不會就跳出離開）',stand(sp.x,sp.z)&&!!EX&&Math.hypot(EX.x-sp.x,EX.z-sp.z)>=EX.radius+0.2,EX?`距離 ${Math.hypot(EX.x-sp.x,EX.z-sp.z).toFixed(2)}`:'沒有出口');
  check('出口的互動點旁邊站得住、出口回到校園社科院正面（SL3.CAMPUS）',!!EX&&!!standNear(EX)&&EX.exit.spawn.x===SL3.CAMPUS.x&&EX.exit.spawn.z===SL3.CAMPUS.z);
  // 弧形書架：人走不過書架——沿著每一座弧取點，從弧的內側 0.6 m 直線走到外側 0.6 m，路上一定有站不住的地方（NavGrid.losR，人物半徑 0.32）
  const arcs=L.furniture.filter(f=>f.type==='arcShelf');
  const leaks=(n)=>{ const out=[]; for(const f of arcs){ const N=16; for(let k=1;k<N;k++){ const a=f.a0+(f.a1-f.a0)*k/N, c=Math.cos(a), s=Math.sin(a); const x0=f.cx+(f.r-0.6)*c, z0=f.cz+(f.r-0.6)*s, x1=f.cx+(f.r+0.6)*c, z1=f.cz+(f.r+0.6)*s; if(n.losR(x0,z0,x1,z1,0.32)) out.push(`(${f.cx},${f.cz}) r${f.r} ${(a*180/Math.PI).toFixed(0)}°`); } } return out; };
  let bad=leaks(nav); check(`弧形書架（${arcs.length} 座）人走不過去（從內側直線走到外側，路上一定被擋住）`,!bad.length,bad.slice(0,6).join(' | '));
  /* 方向：弧形書架每一段的導航方塊要沿著弧的切線（blockRect 的本地 x 軸＝(cos rot, sin rot)）。記下 SL3.buildNav 真正傳給 blockRect 的值來檢查；
     （測試本身）把配置的 ry 直接當 rot（方向相反）的話，大部分的段會轉錯（只有剛好在正東西南北的段看不出來）*/
  { const calls=[]; SL3.buildNav(L,{blockRect:(...a)=>calls.push(a),blockCircle(){}}); const arcCalls=[]; for(const c of calls){ const f=arcs.find(f=>Math.abs(Math.hypot(c[0]-f.cx,c[1]-f.cz)-f.r)<0.02); if(f) arcCalls.push([c,f]); }
    const misal=(useRy)=>arcCalls.filter(([c,f])=>{ const rot=useRy?-c[4]:c[4], a=Math.atan2(c[1]-f.cz,c[0]-f.cx); const tx=-Math.sin(a), tz=Math.cos(a); return Math.abs(Math.cos(rot)*tz-Math.sin(rot)*tx)>0.05; }).length;   /* useRy：c[4]＝−ry，所以 −c[4]＝配置的 ry */
    check(`弧形書架的導航方塊（${arcCalls.length} 段）都沿著弧的切線（SL3.buildNav 傳給 blockRect 的方向）`,arcCalls.length>=30&&misal(false)===0,`轉錯 ${misal(false)} 段`);
    check('（測試本身）如果直接用配置的 ry 當 blockRect 的方向，上一項會失敗',misal(true)>arcCalls.length/2,`會轉錯 ${misal(true)}／${arcCalls.length} 段`); }
  // 林間書房：缺口朝走道，從入口走得進去、站在柱子旁邊
  const gv=SL3.groves(L); check('四個林間書房（弧形書架圍著一根樹狀柱）',gv.length===4,gv.map(g=>`(${g.f.cx},${g.f.cz})`).join(' '));
  bad=[]; for(const g of gv){ const p=[g.x,g.z]; if(!stand(p[0],p[1])){ bad.push(`(${g.f.cx},${g.f.cz}) 缺口裡站不住`); continue; } const r=walk([sp.x,sp.z],p); if(!r.ok) bad.push(`(${g.f.cx},${g.f.cz}) 走不進去 ${fmt(r).slice(0,80)}`); }
  check('每個林間書房都從缺口走得進去（站在柱子旁邊）',!bad.length,bad.join(' | '));
  // 閘門：三個通道過得去；欄杆、門柱、服務台、館員區站不住
  const G=L.gates, lanes=[]; for(let i=0;i<G.posts.length-1;i++) lanes.push((G.posts[i]+G.posts[i+1])/2);
  bad=[]; for(const lx of lanes){ const r=walk([sp.x,sp.z],[lx,G.z-1.6]); if(!r.ok) bad.push(`x=${lx}：${fmt(r).slice(0,80)}`); }
  check(`閘門的 ${lanes.length} 個通道都過得去（入口 → 閘門裡面）`,!bad.length,bad.join(' | '));
  { const blockedPts=[[-13.0,G.z],[-12.2,G.z],[-5.4,G.z],[-4.9,G.z],...G.posts.map(x=>[x,G.z])]; const st=blockedPts.filter(p=>stand(p[0],p[1],0.3)); check('閘門兩邊的玻璃欄杆、門柱站不住（不能從旁邊繞進去）',!st.length,JSON.stringify(st)); }
  { const dk=L.desk; const st=[[(dk.x0+dk.x1)/2,(dk.z0+dk.z1)/2],[(dk.x0+dk.x1)/2,9.6],[dk.x0+0.3,9.8]].filter(p=>stand(p[0],p[1],0.3)); check('服務台、館員區（矮隔板裡面）站不住',!st.length,JSON.stringify(st)); }
  { const r=sim([sp.x,sp.z],[-9,6.2],1/30,1.8); check('入口 → 閘門 → 館內（模擬走路，真的穿過閘門）',r.ok,fmt(r)); }
  // 柱子、長桌站不住
  { const st=L.columns.filter(c=>stand(c.x,c.z,0.1)).map(c=>[c.x,c.z]); check('樹狀柱站不住（20 支）',L.columns.length===20&&!st.length,JSON.stringify(st)); }
  { const st=L.furniture.filter(f=>f.type==='readingTable').filter(f=>stand(f.x,f.z,0.1)); check('閱覽長桌站不住',!st.length); }
  // 座位：每一個「坐下」走得到的位置（seatApproach 的規則）、從入口走得到
  bad=[]; for(const st of z.seats){ const ap=approach(st); if(!ap){ bad.push(`${st.kind}(${st.x},${st.z}) 旁邊站不住`); continue; } const r=sim([sp.x,sp.z],ap,0.1,1.8); if(!r.ok) bad.push(`${st.kind}(${st.x},${st.z}) 走不到 ${fmt(r).slice(0,80)}`); }
  check(`每一個座位（${z.seats.length} 個）旁邊站得住、從入口走得到（坐下時走過去的位置）`,!bad.length,bad.slice(0,4).join(' | '));
  /* 站在那裡就看得到「坐下」按鈕：站位要在座位互動點的範圍內（2026-10-14 v9.6 回歸：北側長桌後 0.6 m 碰到椅背，舊規則跳到 0.9 m，比按鈕範圍 0.8 m 遠——這一項在舊規則會失敗）*/
  bad=[]; for(const st of z.seats){ const ap=approach(st), it=E.interactables.find(i=>i.seat===st); if(!ap||!it) continue; const d=Math.hypot(ap[0]-it.x,ap[1]-it.z); if(d>(it.radius||0.8)-0.04) bad.push(`${st.kind}(${st.x},${st.z}) 站位離按鈕 ${d.toFixed(2)} m＞${it.radius}`); }
  check('每一個座位的站位都在「坐下」按鈕的範圍內（站在那裡就看得到按鈕）',!bad.length,bad.slice(0,4).join(' | '));
  // 互動點（座位以外）
  bad=[]; let n=0; for(const it of E.interactables){ if(it.seat) continue; n++; const nd=standNear(it); if(!nd){ bad.push(`${it.label}：旁邊站不住`); continue; } const r=sim([sp.x,sp.z],nd,0.1,1.8); if(!r.ok) bad.push(`${it.label}：${fmt(r).slice(0,80)}`); }
  check(`每一個互動點（座位以外 ${n} 個：出口、服務台、查詢、新書、期刊、書架、林間書房、還書箱）旁邊站得住、走得到`,!bad.length,bad.slice(0,5).join(' | '));
  const nolv=E.interactables.filter(i=>i.lv===undefined).map(i=>i.label); check('每一個互動點都標了樓層（lv 0）',!nolv.length,nolv.join(','));
  // 背景人物的散步路線（src/story3d.js）：每一點站得住、一點一點走得到
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=src.match(/zoneId==='soclib'[\s\S]*?GM\.spawnExtra\(extraSpec\(xi\+\+\),(\[\[[^\n]*?\]\]),\{\}\)/); const wps=m?JSON.parse(m[1]):null;
    check('story3d.js 有社科院圖書館的散步路線',!!wps&&wps.length>=4,m?m[1].slice(0,80):'沒找到');
    if(wps){ bad=[]; for(let i=0;i<wps.length;i++){ const a=wps[i], b=wps[(i+1)%wps.length]; if(!stand(a[0],a[1])) bad.push(`第 ${i} 點 (${a[0]},${a[1]}) 站不住`); const r=sim([a[0],a[1]],[b[0],b[1]],0.1,1.45); if(!r.ok) bad.push(`第 ${i}→${(i+1)%wps.length} 段：${fmt(r).slice(0,60)}`); }
      check('散步路線每一點站得住、每一段走得到（繞一圈回到入口）',!bad.length,bad.slice(0,4).join(' | ')); } }
  // 快速前往
  { const q=PLACES.quickList().find(e=>e[0]==='soclib'); check('快速前往有「社科院圖書館」，落點＝入口、站得住',!!q&&q[2]&&q[2].x===sp.x&&q[2].z===sp.z&&stand(q[2].x,q[2].z),JSON.stringify(q)); check('地點名稱、開學就知道的地方（大地圖、快速前往清單）',PLACES.names.soclib==='社科院圖書館'&&!!PLACES.known0.soclib); }
}
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
