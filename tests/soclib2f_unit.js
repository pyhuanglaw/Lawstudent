// 社科院圖書館東側館（soclib_2f：一樓門廳＋樓梯＋電梯＋影印休息區、二樓自習室、討論室、洗手間；SOCLIB-2F-1104，LAWWW2-C 2026-11-04）的導航（不需要瀏覽器）：
// 在 Node 裡建出遊戲真正的閱覽室（soclib）與東側館（soclib_2f），用引擎真正的找路（E.pathTo）＋移動碰撞（E.simWalk：人物半徑 0.32 m、dt 1/30 與 0.1、走路與跑步）檢查：
//   閱覽室：東牆有「往 2F 自習室、討論室」、走得到；從東側館回來的位置站得住、離門超過門的半徑（一出來不會又跳出來）
//   東側館：入口 → A 跑（往南）→ 平台 → B 跑（往北）→ 二樓走廊（第 1 層、高 4.2）；二樓 → 一樓；跑步＋低幀率；B 跑頂端在第 0 層站不住（一樓門廳不能直接走上去）
//          每一個座位（自習室 36、靠窗 13、討論室 12）「坐下」走得到的位置（GAME.seatApproach 的規則）；老位子＝靠窗北往南第三個
//          每一個互動點旁邊站得住、走得到；電梯門關著不能走進車廂、開著可以；兩層的電梯運鏡位置是空的、和車廂之間沒有牆
//          牆和導航一致：牆的中心線上站不住（門的開口除外）；兩層沒有走不出去的小孤島
// 這是模擬（證明路走得通、高度對），不是真實玩家流程（真實流程要在電腦上跑瀏覽器，D131）。
// 用法：node tests/soclib2f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/soclib2f_layout.js','src/soclib2f3d.js','src/data/calendar.js','src/data/places.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|SL3|SL2|LINZE_LAYOUT|CLASSROOM_LAYOUT|SOCLIB_LAYOUT|SOCLIB2F_LAYOUT|SOCSCI_LAYOUT|CALENDAR|PLACES|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };   /* 走路 1.8 m/s＋跑步 4.8 m/s、低幀率 */
const fmt=r=>JSON.stringify(r).slice(0,220);
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||1,1.2), lv=it.lv|0; if(stand(it.x,it.z,lv)) return [it.x,it.z,lv]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,lv)) return [x,z,lv]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=seat.lv|0; for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,lv,0.3)) return [x,z,lv]; } return null; }   /* GAME.seatApproach 的規則（tests/nav_soclib_unit.js 同一套）*/
const L=SOCLIB2F_LAYOUT, Y1=L.floors[1].y;

// ---------- 閱覽室：東牆的門 ----------
{ const z=loadZone('soclib'); const door=E.interactables.find(i=>i.exit&&i.exit.to==='soclib_2f');
  check('閱覽室東牆有「往 2F 自習室、討論室」（exit → soclib_2f）',!!door,door?`(${door.x},${door.z}) ${door.label}`:'沒有');
  if(door){ const p=standNear(door); check('門口站得住',!!p,JSON.stringify(p));
    const EN=SOCLIB_LAYOUT.entrance.spawn; const r=walk([EN.x,EN.z,0],p); check('閱覽室入口 → 東牆的門（模擬走路、跑步＋低幀率）',r.ok,fmt(r));
    const H=SL2.HALL(); check('從東側館回來的位置站得住、離門超過門的半徑（一出來不會又跳出「往 2F」）',stand(H.x,H.z,0)&&Math.hypot(H.x-door.x,H.z-door.z)>door.radius,`(${H.x},${H.z}) 距離 ${Math.hypot(H.x-door.x,H.z-door.z).toFixed(2)}、半徑 ${door.radius}`);
    const r2=walk([H.x,H.z,0],[EN.x,EN.z,0]); check('回來的位置 → 閱覽室入口',r2.ok,fmt(r2));
    check('門的畫面跟著東牆淡出（winParts：鏡頭在牆外時藏起來）',(z.winParts||[]).some(w=>w.obj&&w.obj.name==='SOCLIB_EAST_DOOR'),`winParts ${(z.winParts||[]).length}`); } }

// ---------- 東側館 ----------
{ const t0=Date.now(); const z=loadZone('soclib_2f'); console.log(`（東側館建好：${((Date.now()-t0)/1000).toFixed(1)} 秒；互動點 ${E.interactables.length}、鏡頭碰撞 ${E.colliders.length}）`);
  const N0=z.levels[0], N1=z.levels[1], S=L.stair, A=S.A, B=S.B, LD=S.landing;
  check('兩層導航格（第 1 層地板 4.2）、同尺寸同原點',z.levels.length===2&&N1.y0===Y1&&N0.cols===N1.cols&&N0.rows===N1.rows&&N0.ox===N1.ox&&N0.oz===N1.oz);
  const EN=L.entrance.spawn, ex=E.interactables.find(i=>i.exit&&i.exit.to==='soclib');
  check('入口出生點站得住、離「回閱覽室」超過半徑',stand(EN.x,EN.z,0)&&!!ex&&Math.hypot(EN.x-ex.x,EN.z-ex.z)>ex.radius,ex?`距離 ${Math.hypot(EN.x-ex.x,EN.z-ex.z).toFixed(2)}`:'');
  check('回閱覽室的出生點＝閱覽室東牆的門內',!!ex&&ex.exit.spawn.x===L.hall.spawn.x&&ex.exit.spawn.z===L.hall.spawn.z);
  // 高度
  const H0=(x,zz)=>N0.heightAt(x,zz), H1=(x,zz)=>N1.heightAt(x,zz), V0=(x,zz)=>N0.visualHeightAt(x,zz), V1=(x,zz)=>N1.visualHeightAt(x,zz);
  const ax=(A.x0+A.x1)/2, bx=(B.x0+B.x1)/2;
  check('門廳 0、平台 2.1、二樓走廊 4.2',H0(0,-8)===0&&Math.abs(H0(-6,0)-LD.y)<1e-6&&H1(0,-6.4)===Y1,`${H0(0,-8)} / ${H0(-6,0)} / ${H1(0,-6.4)}`);
  let bad=[]; for(let k=0;k<A.risers;k++){ const zz=A.z0+(k+0.5)*S.tread, want=(k+1)*S.rise; if(Math.abs(V0(ax,zz)-want)>1e-6) bad.push(`A${k} ${V0(ax,zz).toFixed(3)}≠${want.toFixed(3)}`); }
  for(let k=0;k<B.risers;k++){ const zz=B.z1-(k+0.5)*S.tread, want=LD.y+(k+1)*S.rise; if(Math.abs(V0(bx,zz)-want)>1e-6||Math.abs(V1(bx,zz)-want)>1e-6) bad.push(`B${k} ${V0(bx,zz).toFixed(3)}/${V1(bx,zz).toFixed(3)}≠${want.toFixed(3)}`); }
  check('樓梯每一階畫面上的高度＝畫出來的台階（A 跑往南 13 階、B 跑往北 13 階，每階 16.2 cm；B 跑兩層相同）',!bad.length,bad.slice(0,3).join(' | '));
  check('B 跑在兩層的連續高度相同（換層的地方）',[-4.4,-3.2,-2.0].every(zz=>Math.abs(H0(bx,zz)-H1(bx,zz))<1e-9));
  check('B 跑最上面一排在第 0 層站不住（一樓門廳不能直接走上 4 m 高的地方）、在第 1 層站得住',!stand(bx,-4.8,0,0.3)&&stand(bx,-4.6,1,0.3));
  check('兩跑中間的牆站不住',!stand(-6.0,-3.0,0,0.2));
  // 上下樓
  const lobby=[0,-8,0], cor2=[0,-6.4,1];
  let r=walk(lobby,cor2); check('一樓門廳 → A 跑 → 平台 → B 跑 → 二樓走廊（模擬走路、跑步＋低幀率；第 1 層、高 4.2）',r.ok,fmt(r));
  const p=E.pathTo(lobby[0],lobby[1],0,cor2[0],cor2[1],1); check('這條路經過樓梯、最後在第 1 層',!!p&&p.some(q=>q[0]<A.x1&&q[1]>A.z0)&&p[p.length-1][2]===1);
  r=walk(cor2,lobby); check('二樓走廊 → 樓梯往下 → 一樓門廳（回到第 0 層）',r.ok,fmt(r));
  r=sim(cor2,lobby,1/30); check('走到的高度：一樓 0',r.ok&&Math.abs(r.y)<0.05&&r.lv===0,fmt(r));
  r=sim(lobby,cor2,1/30); check('走到的高度：二樓 4.2',r.ok&&Math.abs(r.y-Y1)<0.05&&r.lv===1,fmt(r));
  r=walk([EN.x,EN.z,0],[3.0,5.0,1]); check('入口 → 二樓自習室中間（從北面的玻璃門進去）',r.ok,fmt(r));
  // 座位
  const seats=z.seats||[]; const nk=k=>seats.filter(s=>s.kind===k).length;
  check('座位：自習室長桌 36、靠窗 13、討論室 12（自習室 49 位：AA_669「約 40～60 位」）',nk('study')===36&&nk('window')===13&&nk('discuss')===12,`${nk('study')}/${nk('window')}/${nk('discuss')}`);
  const old=SL2.oldSeat(), olds=seats.filter(s=>s.old); const win=seats.filter(s=>s.kind==='window').sort((a,b)=>a.z-b.z);
  check('老位子：只有一個、是靠窗那排北往南第三個（AA_669 第 6 節）',olds.length===1&&!!old&&win[2]&&win[2].old===true&&old.x===win[2].x&&old.z===win[2].z,old?`(${old.x},${old.z})`:'');
  const miss=[]; for(const s of seats){ const a=approach(s); if(!a){ miss.push(`站不住 ${s.kind}(${s.x},${s.z})`); continue; } const rr=sim(cor2,a,1/30); if(!rr.ok) miss.push(`走不到 ${s.kind}(${s.x},${s.z}) ${rr.reason}`); }
  check('每一個座位「坐下」走得到的位置（GAME.seatApproach 的規則；從二樓走廊）',!miss.length,`${seats.length} 個；${miss.slice(0,4).join(' | ')}`);
  const sit=E.interactables.filter(i=>i.seat&&i.seat.kind); check('每一個座位都有「坐下」的互動點（自習室、靠窗的 study:true；討論室不是）',sit.length===seats.length&&sit.every(i=>!!i.study===(i.seat.kind!=='discuss')));
  // 互動點
  const bad2=[]; for(const it of E.interactables){ if(it.seat&&it.seat.kind) continue; const q=standNear(it); if(!q){ bad2.push(`站不住 ${it.label}(${it.x.toFixed(1)},${it.z.toFixed(1)},${it.lv})`); continue; } const rr=sim([EN.x,EN.z,0],q,1/30); if(!rr.ok) bad2.push(`走不到 ${it.label} ${rr.reason}`); }
  check('每一個互動點旁邊站得住、從入口走得到（洗手間、研究小間、書庫、置物櫃、公告欄、飲水機、預約螢幕、白板、影印機、長椅、電梯…）',!bad2.length,`${E.interactables.length} 個；${bad2.slice(0,4).join(' | ')}`);
  const lab=s=>E.interactables.some(i=>i.label===s); check('有男廁、女廁、飲水機、置物櫃、公告欄、三間討論室的預約螢幕、兩層電梯',lab('男廁')&&lab('女廁')&&lab('看飲水機')&&lab('看置物櫃')&&lab('看公告欄')&&['討論室 1','討論室 2','討論室 3'].every(n=>lab('看預約螢幕（'+n+'）'))&&E.interactables.filter(i=>i.elevator).length===2);
  const wcs=E.interactables.filter(i=>i.label==='男廁'||i.label==='女廁'), wat=E.interactables.find(i=>i.label==='看飲水機'); check('洗手間在樓梯旁邊（離 B 跑頂端 ≤ 3 m）、飲水機在兩扇門中間',wcs.length===2&&wcs.every(w=>Math.hypot(w.x-bx,w.z-B.z0)<=3.2)&&!!wat&&wat.x>Math.min(...wcs.map(w=>w.x))&&wat.x<Math.max(...wcs.map(w=>w.x)),wcs.map(w=>`${w.label}(${w.x},${w.z})`).join(' '));
  // 電梯
  const el=z.elev; const inside=[el.cx,el.cz-0.15];
  check('電梯門關著：車廂裡站不住（兩層）',!stand(inside[0],inside[1],0,0.3)&&!stand(inside[0],inside[1],1,0.3));
  el.isOpen=true; el.lv=0; el.setCells(); check('電梯在一樓、門開著：一樓車廂裡站得住、從門廳走得進去；二樓照樣站不住',stand(inside[0],inside[1],0,0.3)&&!stand(inside[0],inside[1],1,0.3)&&sim(lobby,[inside[0],inside[1],0],1/30).ok);
  el.lv=1; el.setCells(); check('電梯在二樓、門開著：二樓車廂裡站得住、從二樓走廊走得進去',stand(inside[0],inside[1],1,0.3)&&sim(cor2,[inside[0],inside[1],1],1/30).ok);
  el.isOpen=false; el.lv=0; el.setCells();
  check('車廂的側面、後面不能走進去（井道四周一圈擋住）',[[L.elevator.x0-0.2,el.cz],[L.elevator.x1+0.2,el.cz],[el.cx,L.elevator.z1+0.2]].every(([x,zz])=>!stand(x,zz,0,0.3)&&!stand(x,zz,1,0.3)));
  const call=[el.cx,L.elevator.callZ]; check('叫電梯的位置兩層都站得住',stand(call[0],call[1],0)&&stand(call[0],call[1],1));
  /* 運鏡（game3d.js elevatorRide）：E.cinematic(V(cx−3.4, y+2.6, cz+4.2), V(cx, y+1.2, cz))——那一點要在走得到的地方（不在牆裡、房間外），和車廂之間沒有實心的牆 */
  const segX=(p0,p1,w)=>{ const [ax_,az_]=p0, [bx_,bz_]=p1, cx_=w.x0, cz_=w.z0, dx_=w.x1, dz_=w.z1; const d=(bx_-ax_)*(dz_-cz_)-(bz_-az_)*(dx_-cx_); if(Math.abs(d)<1e-9) return false; const t=((cx_-ax_)*(dz_-cz_)-(cz_-az_)*(dx_-cx_))/d, u=((cx_-ax_)*(bz_-az_)-(cz_-az_)*(bx_-ax_))/d; return t>0&&t<1&&u>=-0.1&&u<=1.1; };
  for(const lv of [0,1]){ const cam=[el.cx-3.4,el.cz+4.2], car=[el.cx,el.cz]; const inRoom=(lv?L.free1:L.free0).some(r=>cam[0]>r[0]&&cam[0]<r[2]&&cam[1]>r[1]&&cam[1]<r[3]);   /* 鏡頭在 2.6 m 高：下面是桌子也沒關係，要的是在房間裡、不在牆裡 */
    const hit=L.walls.filter(w=>(w.lv===lv||w.lv===2)&&w.kind!=='glass'&&w.kind!=='rail'&&segX(cam,car,w));
    check(`電梯運鏡（第 ${lv} 層）：鏡頭的位置在房間裡（不在牆裡、房間外）、和車廂之間沒有實心的牆（玻璃隔間可以）`,inRoom&&!hit.length,`鏡頭 (${cam.map(v=>v.toFixed(1))})；擋到 ${hit.map(w=>`${w.kind}(${w.x0},${w.z0})-(${w.x1},${w.z1})`).join(' ')}`); }
  // 牆 ↔ 導航
  const wallBad=[]; for(const w of L.walls){ if(w.kind==='rail') continue; const len=Math.hypot(w.x1-w.x0,w.z1-w.z0); for(let t=0.2;t<len-0.19;t+=0.4){ const x=w.x0+(w.x1-w.x0)*t/len, zz=w.z0+(w.z1-w.z0)*t/len; if(L.openings.some(o=>Math.hypot(o.x-x,o.z-zz)<o.w/2+0.05)) continue;
      for(const lv of (w.lv===2?[0,1]:[w.lv])){ if(stand(x,zz,lv,0.05)) wallBad.push(`${w.kind}(${x.toFixed(1)},${zz.toFixed(1)},${lv})`); } } }
  check('牆、玻璃隔間的中心線上站不住（門的開口除外）：導航和畫面的牆一致',!wallBad.length,wallBad.slice(0,6).join(' '));
  // 小孤島（站得住的格子都連得到入口／二樓走廊；電梯車廂的格子除外）
  for(const lv of [0,1]){ const n=lv?N1:N0, cm=n.clearMask(), seen=new Uint8Array(n.cols*n.rows); const st=n.toCell(...(lv?[cor2[0],cor2[1]]:[lobby[0],lobby[1]])); const q=[n.idx(st[0],st[1])]; seen[q[0]]=1;
    while(q.length){ const i=q.pop(), cx_=i%n.cols, cz_=(i/n.cols)|0; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=cx_+dx, nz=cz_+dz; if(nx<0||nz<0||nx>=n.cols||nz>=n.rows) continue; const j=n.idx(nx,nz); if(seen[j]||!cm[j]) continue; seen[j]=1; q.push(j); } }
    const isl=[]; for(let i=0;i<cm.length;i++) if(cm[i]&&!seen[i]){ const [x,zz]=n.toWorld(i%n.cols,(i/n.cols)|0); isl.push(`(${x.toFixed(1)},${zz.toFixed(1)})`); }
    check(`第 ${lv} 層沒有小孤島（人站得住的格子都連得到${lv?'二樓走廊（樓梯下半段在第 0 層，另外算）':'一樓門廳'}）`,!isl.length||(lv===1&&isl.every(s=>{ const m=/\(([-\d.]+),([-\d.]+)\)/.exec(s); return +m[1]>B.x0-0.01&&+m[1]<B.x1+0.01; })),`${isl.length} 格 ${isl.slice(0,6).join(' ')}`); }
  /* 背景人物散步路線的建議（README「給 LAWWW-C」第 1 點）：一樓門廳 → 電梯前 → 影印區 → 樓梯下 → 二樓走廊 → 南北向走廊 → 自習室 → 電梯廳 → 下樓回門廳 */
  const ROUTE=SL2.WALK_ROUTE, rbad=[]; for(let i=0;i<ROUTE.length-1;i++){ const a=ROUTE[i], b=ROUTE[i+1]; if(!stand(a[0],a[1],a[2])){ rbad.push(`站不住 (${a})`); continue; } const rr=walk(a,b); if(!rr.ok) rbad.push(`(${a})→(${b}) ${rr.reason}`); }
  check('建議的散步路線每一點站得住、每一段走得到（走路、跑步＋低幀率）',ROUTE.length>=8&&!rbad.length,rbad.slice(0,3).join(' | '));
  check('二樓樓板給鏡頭用（zone.slabs，扣掉樓梯間和電梯井）',Array.isArray(z.slabs)&&z.slabs.length>=3&&z.slabs.every(s=>s.lv===1&&Math.abs(s.y-Y1)<1e-9)&&!z.slabs.some(s=>s.x0<-6&&s.x1>-6&&s.z0<-2&&s.z1>-2)&&!z.slabs.some(s=>s.x0<el.cx&&s.x1>el.cx&&s.z0<el.cz&&s.z1>el.cz),`${(z.slabs||[]).length} 塊`);
  check('室內的牆、玻璃隔間是鏡頭碰撞（E.colliders）',E.colliders.length>=20,`${E.colliders.length}`);
  check('外牆會淡出（zone.walls 有方向）',z.walls.length>=8&&z.walls.every(w=>w.userData.dir&&w.userData.dir.isVector3),`${z.walls.length}`);
}
console.log(fails?`\n${fails} 項失敗`:'\nALL PASS'); process.exit(fails?1:0);
