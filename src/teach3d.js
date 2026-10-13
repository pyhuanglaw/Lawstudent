/* ===== 公共教學館模板（D55 第二階段；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 2 節）=====
   一個模組蓋所有的教學館（共同教學館、博雅教學館；之後普通用同一套），配置寫在 layout JSON（src/data/gongtong_layout.js、boya_layout.js，
   產生器 tools/layout/*_gen.py）；LAWWW2 的 Blender 正式模型讀同一份，兩邊的位置一定一致。
   配置的元件：rooms（classroom 平面教室、lecture 階梯教室、closed 關著的房間）、groups（公共空間：桌子、椅子、沙發）、areas（roomAt 用的範圍）、
   lounge／study（共同教學館的舊寫法，照樣支援）、benches、boards（style:'screen'＝講座資訊螢幕）、signs、windows、lights、stair。
   **室內沒有查證**：大廳、走廊、普通教室、樓梯、休息區、自習區是可替換的模板，不宣稱和真實建築相同。
   - 兩層（1F、2F）；U 形樓梯（A 跑從走廊往北爬到平台，B 跑往南爬回二樓走廊；B 跑與最上面一階兩層共用，D36）。
   - 房間在同一個區域裡（不是各自一個區域）：看得到人從走廊走進教室、下課走出來。
   - 教室座位、休息區、自習區、長椅都可以坐（坐下讀書、坐一下）；關著的房間有門、互動寫清楚（不用隱形牆）；三樓以上「整修中」。
   - 牆、隔間擋住鏡頭時網點透空（zone.seeThru）。正式模型還沒有：用程序化備用模型（BLOCKOUT）。 */
'use strict';
const TB3=(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const LAYOUTS={ gongtong:()=>GONGTONG_LAYOUT, boya:()=>BOYA_LAYOUT, putong:()=>PUTONG_LAYOUT };
  // ---- 樓梯的高度（法圖 lawlib3d.js 的做法；這裡 A 跑往北爬：最下面一階在南邊 z1）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, A=S.A, B=S.B, LD=S.landing;
    if(S.dir==='N') return { a:{x0:A.x0,x1:A.x1,z0:A.z0+t/2,z1:A.z1,axis:'z',ya:A.risers*r,yb:0,tread:t,rise:r,low:'z1'},
      ld:{x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:A.z0+t/2,y:LD.y},
      b:{x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1-t/2,axis:'z',ya:LD.y,yb:LD.y+B.risers*r,tread:t,rise:r,low:'z0'},
      top:{x0:B.x0,x1:B.x1,z0:B.z1-t/2,z1:B.z1,y:LD.y+B.risers*r} };
    return LL3.stairSurfs(L); }
  // ---- 座位：教室、休息區、自習區、長椅 ----
  function seatsOf(L){ const out=[]; for(const r of L.rooms) for(const s of (r.seats||[])) out.push(Object.assign({kind:r.kind==='lecture'?'lecture':'class'},s,s.y!=null?{y:s.y+L.floors[s.lv|0].y}:{}));   /* 階梯教室的座位有高度（那一排的平台，絕對高度）*/
    for(const s of (L.lounge?L.lounge.seats:[])) out.push(Object.assign({kind:'lounge'},s));
    for(const t of (L.study?L.study.tables:[])) for(const s of t.seats) out.push(Object.assign({kind:'study'},s));
    for(const b of (L.benches||[])) out.push({x:b.x+Math.sin(b.ry)*0.06,z:b.z+Math.cos(b.ry)*0.06,yaw:b.ry,lv:b.lv,kind:'bench',label:b.label,room:'hall'});
    /* 公共空間（博雅一樓的沙發區、自習小桌、討論桌）：桌子的椅子＋沙發上的位子 */
    for(const g of (L.groups||[])){ for(const t of (g.tables||[])) for(const st of t.seats) out.push(Object.assign({kind:g.kind,label:g.seatLabel,room:g.id,lv:g.lv},st));
      for(const so of (g.sofas||[])) for(let i=0;i<so.seats;i++){ const ox=-so.len/2+so.len*(i+0.5)/so.seats, oz=0.08, c=Math.cos(so.ry), sn=Math.sin(so.ry); out.push({x:+(so.x+ox*c+oz*sn).toFixed(3),z:+(so.z-ox*sn+oz*c).toFixed(3),yaw:so.ry,lv:g.lv,kind:'sofa',label:g.seatLabel,room:g.id}); } }
    return out; }
  const wallSegs=w=>{ const horiz=Math.abs(w.z0-w.z1)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1); const gs=(w.gaps||[]).slice().sort((p,q)=>p[0]-q[0]); const out=[]; let a=a0; for(const [g0,g1] of gs){ if(g0>a) out.push([a,g0]); a=Math.max(a,g1); } if(a<a1) out.push([a,a1]); return {horiz,segs:out}; };
  // ---- 導航：兩層 ----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, A=S.A, B=S.B, LD=S.landing; const ss=stairSurfs(L);
    /* 格子中心要落在格子大小的倍數上（配置裡的牆都在 0.4 的倍數）：原本 z 方向的格子中心在 0.4k+0.2，橫的牆（走廊牆 z=-0.4、2.4）壓在格子邊界上、一格都擋不到，人可以直接穿牆走進教室（2026-10-13 發現，tests/nav_teach_unit.js「牆擋得住」）*/
    const c=L.cell, al=v=>(Math.floor(v/c+1e-9)-0.5)*c; const mk=()=>new E3.NavGrid(W+3,D+3,c,al(-W/2-1),al(-D/2-1)); const nav0=mk(), nav1=mk().setFloor(Y1); const navs=[nav0,nav1];
    nav0.blockOutside(-W/2+0.3,-D/2+0.3,W/2-0.3,D/2-0.3);
    nav1.fillBlocked();
    // 二樓走得到的地方：整層，扣掉樓梯井（A 跑、平台、兩跑中間的牆）；B 跑最上面接到走廊
    nav1.freeRect(-W/2+0.3,-D/2+0.3,W/2-0.3,D/2-0.3); nav1.blockRect((S.well.x0+B.x0)/2,(S.well.z0+S.well.z1)/2,B.x0-S.well.x0,S.well.z1-S.well.z0,0,0); nav1.blockRect((LD.x0+LD.x1)/2,(LD.z0+A.z0)/2,LD.x1-LD.x0,A.z0-LD.z0,0,0);
    nav1.blockRect((S.well.x0+S.well.x1)/2,(-D/2+LD.z0)/2,S.well.x1-S.well.x0,LD.z0+D/2,0,0);   /* 平台北邊的空間（一、二樓都不能走；二樓那一條比人窄，擋起來免得變成走不出去的小孤島）*/
    for(const s of [ss.a,ss.ld,ss.b,ss.top]) nav0.addSurf(Object.assign({},s));
    nav1.addSurf(Object.assign({},ss.b)); nav1.addSurf(Object.assign({},ss.top));
    nav0.blockRect((S.midWall.x0+S.midWall.x1)/2,(A.z0+A.z1)/2,S.midWall.x1-S.midWall.x0,A.z1-A.z0,0);   // 兩跑中間的牆
    nav0.blockRect((S.well.x0+S.well.x1)/2,(-D/2+LD.z0)/2,S.well.x1-S.well.x0,LD.z0+D/2,0,0);            // 平台北邊（牆後面的空間）
    // 牆（門洞打開）、欄杆
    for(const w of L.walls){ const nav=navs[w.lv]; const {horiz,segs}=wallSegs(w); for(const [a,b] of segs){ if(horiz) nav.blockRect((a+b)/2,w.z0,b-a,0.2,0,0); else nav.blockRect(w.x0,(a+b)/2,0.2,b-a,0,0); } }
    for(const r of (L.rails||[])) navs[r.lv].blockRect((r.x0+r.x1)/2,r.z0,Math.abs(r.x1-r.x0)||0.2,Math.abs(r.z1-r.z0)||0.2,0,0);
    // 房間：關著的整間擋起來；教室的講桌、學生桌（椅子不擋：坐的時候走到椅子旁）
    for(const r of L.rooms){ const nav=navs[r.lv]; if(r.kind==='closed'){ nav.blockRect((r.x0+r.x1)/2,(r.z0+r.z1)/2,r.x1-r.x0,r.z1-r.z0,0,0); continue; }
      if(r.teacher) nav.blockRect(r.teacher.x,r.teacher.z,r.teacher.w,r.teacher.d,0,0.02);
      for(const d of (r.desks||[])) nav.blockRect(d.x,d.z,d.w,d.d,0,0.02);
      for(const st of (r.seats||[])) if(r.kind==='classroom') nav.blockRect(st.x,st.z,0.46,0.46,0,0); }   /* 教室的椅子也擋（不能穿過椅子）*/
    for(const t of (L.lounge?L.lounge.tables:[])) navs[L.lounge.lv].blockCircle(t.x,t.z,t.r+0.08);
    for(const t of (L.study?L.study.tables:[])) navs[L.study.lv].blockRect(t.x,t.z,t.w,t.d,0,0.02);
    /* 自習區、休息區、教室的椅子都擋（使用者 2026-10-13 驗收：「自習桌不會讓玩家穿過椅子」）：坐的時候從旁邊或後面走到椅子邊（GAME.seatApproach）再坐上去。
       平面教室的排距 2.0 m（1.6 m 時擋了椅子以後一半的位子走不到）*/
    for(const st of [...(L.lounge?L.lounge.seats:[]),...(L.study?L.study.tables.flatMap(t=>t.seats):[])]) navs[st.lv|0].blockRect(st.x,st.z,0.46,0.46,0,0);
    for(const g of (L.groups||[])){ const nav=navs[g.lv]; for(const t of (g.tables||[])){ if(t.shape==='round') nav.blockCircle(t.x,t.z,t.r+0.08); else nav.blockRect(t.x,t.z,t.w,t.d,0,0.02); for(const st of t.seats) nav.blockRect(st.x,st.z,0.46,0.46,0,0); }
      for(const so of (g.sofas||[])) nav.blockRect(so.x,so.z,so.len,0.8,so.ry,0); }   /* 公共空間的桌子、椅子、沙發都擋（不能穿過椅子）*/
    /* 階梯教室（共 101…）：每排一個平台（座位區）；兩側走道每排前半是兩階（連續的斜面給碰撞、找路，畫面上一階一階）、後半是平的；長桌、椅子、講桌擋住。
       排與排的高低差 0.3 m（大於人物半徑內允許的 0.25 m）：只能從兩側走道上下，不能跨過桌椅；椅子後面那一條（前緣往後 1.6 m）是走道 */
    for(const r of L.rooms){ if(r.kind!=='lecture') continue; const nav=navs[r.lv], Y=L.floors[r.lv].y, up=r.stage==='S'?-1:1;
      for(const q of r.rowsData){ const za=Math.min(q.front,q.back), zb=Math.max(q.front,q.back), sa=Math.min(q.front,q.stepEnd), sb=Math.max(q.front,q.stepEnd), fa=Math.min(q.stepEnd,q.back), fb=Math.max(q.stepEnd,q.back), half=(q.y-q.yPrev)/2;
        nav.addSurf({x0:r.seatX0,x1:r.seatX1,z0:za,z1:zb,y:Y+q.y});
        for(const [a0,a1] of r.aisles){ nav.addSurf(up<0?{x0:a0,x1:a1,z0:sa,z1:sb,axis:'z',ya:Y+q.y,yb:Y+q.yPrev,tread:r.stepD,rise:half,low:'z1'}:{x0:a0,x1:a1,z0:sa,z1:sb,axis:'z',ya:Y+q.yPrev,yb:Y+q.y,tread:r.stepD,rise:half,low:'z0'}); nav.addSurf({x0:a0,x1:a1,z0:fa,z1:fb,y:Y+q.y}); }
        nav.blockRect((r.seatX0+r.seatX1)/2,q.deskZ,r.seatX1-r.seatX0,r.deskD,0,0.02); }
      for(const st of r.seats) nav.blockRect(st.x,st.z,0.46,0.46,0,0);
      if(r.lectern) nav.blockRect(r.lectern.x,r.lectern.z,r.lectern.w,r.lectern.d,0,0.05); }
    for(const b of (L.benches||[])) navs[b.lv].blockRect(b.x,b.z,Math.abs(Math.sin(b.ry))>0.5?0.6:1.5,Math.abs(Math.sin(b.ry))>0.5?1.5:0.6,0,0);
    for(const b of (L.boards||[])) navs[b.lv].blockRect(b.x,b.z,Math.abs(Math.sin(b.ry))>0.5?0.2:b.w,Math.abs(Math.sin(b.ry))>0.5?b.w:0.2,0,0);
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }
  // ---- 程序化備用模型（BLOCKOUT）----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs,innerM){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, S=L.stair, A=S.A, B=S.B, LD=S.landing, MAT=B3.MAT;
    const b0=new TK.Bin(), b1=new TK.Bin(); const bins=[b0,b1];
    const floorM=(base,w,d)=>{ const t=W3.stoneTex(base).clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:t,roughness:0.75}); };
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),floorM('#cfc8ba',W,D)); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f); }
    // 二樓樓板（扣掉樓梯井 x well.x0..B.x0、z well.z0..well.z1；平台以北照樣有板）
    const WL=S.well; const qs=[{x0:-W/2,x1:W/2,z0:WL.z1,z1:D/2},{x0:-W/2,x1:WL.x0,z0:-D/2,z1:WL.z1},{x0:WL.x1,x1:W/2,z0:-D/2,z1:WL.z1},{x0:WL.x0,x1:WL.x1,z0:-D/2,z1:WL.z0},{x0:B.x0,x1:B.x1,z0:B.z1,z1:WL.z1}];
    const f2=floorM('#c9c2b4',W,D);
    for(const q of qs){ if(q.x1-q.x0<0.05||q.z1-q.z0<0.05) continue; b1.add(MAT.plaster(),TK.boxG(q.x1-q.x0,ST,q.z1-q.z0,1.2),(q.x0+q.x1)/2,Y1-ST/2,(q.z0+q.z1)/2);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(q.x1-q.x0,q.z1-q.z0),f2); f.rotation.x=-Math.PI/2; f.position.set((q.x0+q.x1)/2,Y1+0.004,(q.z0+q.z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f);
      slabs.push(Object.assign({lv:1,y:Y1,t:ST},q)); }
    // 樓梯（磨石子踏階，實心到地面）
    const stone=MAT.graniteD(), r=S.rise, t=S.tread;
    for(let k=0;k<A.risers;k++){ const top=(k+1)*r; b0.add(stone,TK.boxG(A.x1-A.x0,top,t,2.4),(A.x0+A.x1)/2,top/2,A.z1-k*t-t/2); }
    b0.add(stone,TK.boxG(LD.x1-LD.x0,LD.y,LD.z1-LD.z0,2.4),(LD.x0+LD.x1)/2,LD.y/2,(LD.z0+LD.z1)/2);
    for(let j=0;j<B.risers;j++){ const top=LD.y+(j+1)*r; b0.add(stone,TK.boxG(B.x1-B.x0,top,t,2.4),(B.x0+B.x1)/2,top/2,B.z0+j*t+t/2); }
    { const mw=S.midWall; b0.add(innerM,TK.boxG(mw.x1-mw.x0,Y1+0.9,A.z1-A.z0,1.2),(mw.x0+mw.x1)/2,(Y1+0.9)/2,(A.z0+A.z1)/2); }
    for(const rl of (L.rails||[])){ const len=Math.abs(rl.x1-rl.x0)||Math.abs(rl.z1-rl.z0); b1.add(MAT.steel(),TK.boxG(Math.abs(rl.x1-rl.x0)||0.05,0.05,Math.abs(rl.z1-rl.z0)||0.05),(rl.x0+rl.x1)/2,Y1+1.0,(rl.z0+rl.z1)/2); const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.9),MAT.glass()); gp.position.set((rl.x0+rl.x1)/2,Y1+0.5,(rl.z0+rl.z1)/2); if(Math.abs(rl.z1-rl.z0)>0.01) gp.rotation.y=Math.PI/2; gp.userData.noMerge=true; lv1.add(gp); }
    // 內牆（隔間、走廊牆；門洞上方有門楣）
    for(const w of L.walls){ const bb=bins[w.lv], y=w.lv?Y1:0, h=(w.lv?RY-Y1:L.ceil0); const {horiz,segs}=wallSegs(w);
      for(const [a,b] of segs){ if(b-a<0.05) continue; if(horiz) bb.add(innerM,TK.boxG(b-a,h,0.2,1.2),(a+b)/2,y+h/2,w.z0); else bb.add(innerM,TK.boxG(0.2,h,b-a,1.2),w.x0,y+h/2,(a+b)/2); }
      for(const [g0,g1] of (w.gaps||[])){ if(h<=2.4) continue; if(horiz) bb.add(innerM,TK.boxG(g1-g0,h-2.4,0.2),(g0+g1)/2,y+2.4+(h-2.4)/2,w.z0); else bb.add(innerM,TK.boxG(0.2,h-2.4,g1-g0),w.x0,y+2.4+(h-2.4)/2,(g0+g1)/2); } }
    // 外牆（兩層，一層一塊：剖面視角藏二樓時一起藏；擋住鏡頭時淡出）
    const wall=(x,z,w,h,y,ry,dir,m,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const outer=M('#e9e3d8'); const EN=L.entrance;
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){ wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),outer,grp); wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),outer,grp); wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),outer,grp); }
    wall(0,D/2,W,RY-Y1,Y1,0,new THREE.Vector3(0,0,-1),outer,fb1);
    for(const [a,b] of [[-W/2,EN.a0],[EN.a1,W/2]]) wall((a+b)/2,D/2,b-a,Y1,0,0,new THREE.Vector3(0,0,-1),outer,fb0);
    wall((EN.a0+EN.a1)/2,D/2,EN.a1-EN.a0,Y1-2.6,2.6,0,new THREE.Vector3(0,0,-1),outer,fb0);
    /* 入口門框跟著南牆淡出（2026-10-13 LAWWW2 審查：剛進門時鏡頭在南牆外、牆淡出了、門框沒有，前景一大條黑色）*/
    { const fm=MAT.frame(); const fr=(w,h,x,y)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,0.16),fm.clone()); ms.material.transparent=true; ms.position.set(x,y,D/2-0.12); ms.userData.dir=new THREE.Vector3(0,0,-1); ms.userData.noMerge=true; fb0.add(ms); walls.push(ms); };
      for(const x of [EN.a0,EN.a1]) fr(0.1,2.65,x,1.325); fr(EN.a1-EN.a0,0.1,(EN.a0+EN.a1)/2,2.6); }
    // 窗框（景在牆的內側）
    for(const w of L.windows){ const bb=bins[w.lv], n=w.n, len=w.a1-w.a0, zz=w.wall==='S'?D/2-T/2-0.06:-D/2+T/2+0.06; for(let i=0;i<=n;i++) bb.add(MAT.frame(),TK.boxG(0.06,w.y1-w.y0,0.06),w.a0+len*i/n,(w.y0+w.y1)/2,zz); for(const y of [w.y0,w.y1]) bb.add(MAT.frame(),TK.boxG(len,0.08,0.08),(w.a0+w.a1)/2,y,zz); }
    // 天花板
    { const c0=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c0.rotation.x=Math.PI/2; c0.position.y=L.ceil0; fb0.add(c0);
      const c1=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c1.rotation.x=Math.PI/2; c1.position.y=RY; fb1.add(c1);
      const LP=L.lightPanels||{xs:[-9.6,-6.0,-1.2,1.2,6.0,9.6],zs:[-5.2,-2.0,1.0,4.6]}; for(const [lv,y] of [[0,L.ceil0],[1,RY]]) for(const x of LP.xs) for(const z of LP.zs){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.3),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(x,y-0.01,z); (lv?fb1:fb0).add(p); } }
    b0.build(fb0); b1.build(fb1); }
  /* 鏡頭碰撞用的隔間牆（engine3d.js 的 followCam，只看玩家那一層）：看不見的盒子，和導航、模型同一份 L.walls——門洞不擋，門楣（2.4 m 以上）擋 */
  function camColliders(L,g){ const Y1=L.floors[1].y, RY=L.roofY, inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[[],[]];
    const box=(lv,horiz,a,b,c,y0,y1)=>{ a-=0.06; b+=0.06;   /* 兩端各多 6 cm：視線剛好擦過牆的端點時照樣擋得到（只差一點點就算沒打到）*/ const m=new THREE.Mesh(new THREE.BoxGeometry(horiz?b-a:0.24,y1-y0,horiz?0.24:b-a),inv); m.position.set(horiz?(a+b)/2:c,(y0+y1)/2,horiz?c:(a+b)/2); m.userData.noMerge=true; g.add(m); (out[lv]=out[lv]||[]).push(m); };
    for(const w of L.walls){ const lv=w.lv|0, y=lv?Y1:0, h=(lv?RY-Y1:L.ceil0); const {horiz,segs}=wallSegs(w); const c=horiz?w.z0:w.x0;
      for(const [a,b] of segs){ if(b-a>=0.05) box(lv,horiz,a,b,c,y,y+h); } if(h>2.4) for(const [g0,g1] of (w.gaps||[])) box(lv,horiz,Math.min(g0,g1),Math.max(g0,g1),c,y+2.4,y+h); }
    return out; }
  // ---- 家具（備用）＋互動點 ----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin(); const bins=[b0,b1];
    const up1=new THREE.Group(); up1.position.y=Y1; fb1.add(up1); const grpOf=lv=>lv?up1:fb0; const dummy={blockRect(){}};
    // 教室：黑板、講桌、學生桌；互動：看教室（門口）
    for(const r of L.rooms){ const y=r.lv?Y1:0, bb=bins[r.lv];
      /* 關著的房間：門板在 doorZ 那一道牆的外側（走廊那一側），門口的說明在牆外 0.9 m（原本一律放在 z0 那一側：洗手間的門口說明跑到建築外面、走不到）*/
      if(r.kind==='closed'){ const dz=r.doorZ!=null?r.doorZ:r.z0, out=Math.abs(dz-r.z1)<1e-6?1:-1; const dx=(r.door[0]+r.door[1])/2; bb.add(MAT.woodD(),TK.boxG(r.door[1]-r.door[0]-0.1,2.3,0.06),dx,y+1.15,dz+out*0.13);
        /* link：門後面是通到別棟的空橋（普通二樓 ⇄ 博雅二樓，方案 A）——按了就走過去（區域切換、落在對面那棟的二樓）；其他關著的房間：門口的說明 */
        if(r.link) IT.push({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:r.link.label,exit:{to:r.link.to,spawn:Object.assign({},r.link.spawn)}}); else IT.push({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:r.label,look:r.look}); continue; }
      if(r.kind==='lecture'){ buildLecture(L,r,grpOf(r.lv),bb,IT,r.lv?lv1:lv0,zone); continue; }
      if(r.kind!=='classroom') continue;
      const s=r.board==='W'?1:-1; bb.add(M('#2f4a3a',{rough:0.6}),TK.boxG(0.04,1.2,r.blackboard.len),r.blackboard.x,y+1.6,r.blackboard.z); bb.add(MAT.frame(),TK.boxG(0.06,0.08,r.blackboard.len+0.1),r.blackboard.x+s*0.02,y+0.98,r.blackboard.z);
      bb.add(MAT.woodD(),TK.boxG(r.teacher.w,0.95,r.teacher.d),r.teacher.x,y+0.475,r.teacher.z);
      for(const d of r.desks) Z3.desk(grpOf(r.lv),dummy,d.x,d.z,Math.PI/2,d.d,d.w,'#c9b48f');
      const door=r.doorFront, dz=r.doorZ!=null?r.doorZ:-0.4, ins=(r.z0+r.z1)/2<dz?-1:1; IT.push({x:(door[0]+door[1])/2,z:dz+ins*0.55,radius:0.9,lv:r.lv,label:r.lookLabel||('看看'+r.label+' 教室'),room:r.id,look:r.look||('共同 '+r.id+'：一般教室，黑板、講桌、兩人一張的桌子。門邊的課表每學期換一次。')}); }
    // 休息區：小圓桌；自習區：小桌子
    if(L.lounge) for(const t of L.lounge.tables){ const g=grpOf(L.lounge.lv); const top=new THREE.Mesh(new THREE.CylinderGeometry(t.r,t.r,0.04,18),M('#d9cdb8',{rough:0.5})); top.position.set(t.x,0.74,t.z); top.userData.furn=true; g.add(top); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.18,0.72,10),M('#3a3f46')); leg.position.set(t.x,0.36,t.z); leg.userData.furn=true; g.add(leg); }
    if(L.study) for(const t of L.study.tables) Z3.desk(grpOf(L.study.lv),dummy,t.x,t.z,0,t.w,t.d,'#b08a62','wood');
    // 公共空間（備用模型）：長桌／小桌（木頭）、小圓桌、椅子、沙發（坐墊＋靠背＋扶手）
    for(const g of (L.groups||[])){ const grp=grpOf(g.lv), bb=bins[g.lv], y0=g.lv?Y1:0;
      for(const t of (g.tables||[])){ if(t.shape==='round'){ const h=t.h||0.74; const top=new THREE.Mesh(new THREE.CylinderGeometry(t.r,t.r,0.04,18),M('#d9cdb8',{rough:0.5})); top.position.set(t.x,h,t.z); top.userData.furn=true; grp.add(top); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.16,h-0.02,10),M('#3a3f46')); leg.position.set(t.x,(h-0.02)/2,t.z); leg.userData.furn=true; grp.add(leg); }
        else Z3.desk(grp,dummy,t.x,t.z,0,t.w,t.d,g.deskColor||(g.id==='discuss'?'#c9b48f':'#b08a62'),'wood');
        for(const st of t.seats) Z3.chair(grp,st.x,st.z,st.yaw,g.chairColor||(g.id==='discuss'?'#5a6470':'#8a6a4a')); }   /* chairColor／deskColor：配置可以指定（博雅的圓桌區用灰藍色椅子）*/
      for(const so of (g.sofas||[])){ const c=Math.cos(so.ry), sn=Math.sin(so.ry), at=(ox,oz)=>[so.x+ox*c+oz*sn,so.z-ox*sn+oz*c], sm=MAT.sofa();
        { const [x,z]=at(0,0.05); bb.add(sm,TK.boxG(so.len,0.42,0.7),x,y0+0.21,z,so.ry); } { const [x,z]=at(0,-0.3); bb.add(sm,TK.boxG(so.len,0.8,0.2),x,y0+0.4,z,so.ry); }
        for(const sx of [-1,1]){ const [x,z]=at(sx*(so.len/2+0.08),-0.02); bb.add(sm,TK.boxG(0.16,0.6,0.76),x,y0+0.3,z,so.ry); } } }
    // 長椅、公告欄、指標
    for(const b of (L.benches||[])){ const bench=W3.formalBench?W3.formalBench():null; if(bench){ bench.position.set(b.x,0,b.z); bench.rotation.y=b.ry; grpOf(b.lv).add(bench); } else bins[b.lv].add(MAT.wood(),TK.boxG(1.5,0.45,0.45),b.x,(b.lv?Y1:0)+0.225,b.z,b.ry); }
    for(const bd of (L.boards||[])){ if(bd.style==='screen'){ const sw=bd.w, sh=bd.w*0.6, y0=(bd.lv?Y1:0)+1.25; bins[bd.lv].add(MAT.frame(),TK.boxG(sw+0.08,sh+0.08,0.06),bd.x,y0+sh/2,bd.z,bd.ry);   /* 講座資訊螢幕：深色面板＋發光的字 */
        const sp=new THREE.Mesh(new THREE.PlaneGeometry(sw,sh),new THREE.MeshBasicMaterial({map:TK.signTex('講座資訊　LECTURES & EVENTS',{bg:'#10213a',color:'#e8f0ff'})})); sp.position.set(bd.x+Math.sin(bd.ry)*0.035,(bd.lv?Y1:0)+1.25+sh/2,bd.z+Math.cos(bd.ry)*0.035); sp.rotation.y=bd.ry; (bd.lv?lv1:lv0).add(sp); }
      else { const bb=W3.bulletin(); bb.position.set(bd.x,0,bd.z); bb.rotation.y=bd.ry; grpOf(bd.lv).add(bb); }
      IT.push({x:bd.x+Math.sin(bd.ry)*0.9,z:bd.z+Math.cos(bd.ry)*0.9,radius:1.0,lv:bd.lv,label:bd.label,board:true,get look(){ return bd.look+(typeof ACTIVITIES!=='undefined'&&typeof GAME!=='undefined'&&GAME.G?'　'+ACTIVITIES.posterText(GAME.G,bd.zoneFilter?L.id:undefined):''); }}); }   /* 公告欄：照活動資料（src/data/activities.js；內容等 AA、BB）列出這幾天的演講與活動；zoneFilter＝只列這棟的 */   /* 公告欄：照活動資料（src/data/activities.js；內容等 AA、BB）列出這幾天的演講與活動 */
    for(const sg of (L.signs||[])){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.w*0.16),new THREE.MeshBasicMaterial({map:TK.signTex(sg.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(sg.x,sg.y,sg.z); sp.rotation.y=sg.ry||0; (sg.lv?lv1:lv0).add(sp); }
    { const S=L.stair; const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.38),new THREE.MeshBasicMaterial({map:TK.signTex(S.sign,{bg:'#5a2a22',color:'#f3efe4'})})); sp.position.set((S.B.x0+S.B.x1)/2,Y1+2.3,S.B.z1+0.02); lv1.add(sp);
      IT.push({x:(S.B.x0+S.B.x1)/2,z:S.B.z1+0.5,radius:0.8,lv:1,label:'往 3F',look:'往 3F 的樓梯口拉著一條鍊子：「整修中，暫停開放」。'}); }
    // 座位
    const seats=zone.seats=seatsOf(L);
    for(const st of seats){ if((st.kind==='class'||st.kind==='lounge'||st.kind==='study')&&!(L.groups||[]).some(g=>g.id===st.room)) Z3.chair(grpOf(st.lv),st.x,st.z,st.yaw,st.kind==='class'?'#5a6470':'#8a6a4a');
      const label=st.kind==='class'||st.kind==='lecture'?'坐下':(st.label||(st.kind==='study'?'坐下讀書（自習區）':(st.kind==='lounge'?'坐下（休息區）':'坐下')));
      /* 階梯教室：互動點在椅子後面 0.35 m（玩家站在那一排椅子後面的走道上；半徑小一點，旁邊的位子不會搶），帶高度（別排的不算）*/
      if(st.kind==='lecture'){ IT.push({x:st.x-Math.sin(st.yaw)*0.35,z:st.z-Math.cos(st.yaw)*0.35,y:st.y,radius:0.62,lv:st.lv,label,seat:st,study:true}); continue; }
      /* 沙發：從正前方走過去坐（前面 0.5 m 還在沙發的範圍裡，站得住的地方在前面 0.8 m 左右）——互動點往前 0.4 m，站在沙發前就出現「坐在沙發上」*/
      if(st.kind==='sofa'){ IT.push({x:st.x+Math.sin(st.yaw)*0.4,z:st.z+Math.cos(st.yaw)*0.4,radius:0.75,lv:st.lv,label,seat:st,study:true}); continue; }
      IT.push({x:st.x,z:st.z,radius:0.8,lv:st.lv,label,seat:st,study:st.kind!=='bench'}); }
    mergeFurniture(fb0); mergeFurniture(up1);   /* 2026-10-13 LAWWW2 審查：博雅空著每個畫面 570–810 次 draw call——每張椅子、桌子各自是網格 */
    b0.build(fb0); b1.build(fb1); return seats; }
  /* 一層的桌椅（Z3.desk／Z3.chair、小圓桌，userData.furn）合成每種材質一個網格：位置、樣子不變，只是少畫很多次。座位、導航、互動點是資料，不受影響 */
  function mergeFurniture(grp){ const fs=grp.children.filter(o=>o.userData&&o.userData.furn); if(fs.length<2) return; const tmp=new THREE.Group(); grp.add(tmp); for(const o of fs) tmp.add(o); const m=W3.mergeGroup(tmp); grp.remove(tmp); m.name='furniture'; grp.add(m);
    tmp.traverse(o=>{ if(o.isMesh&&o.geometry) o.geometry.dispose(); }); }

  // ---- 階梯教室（備用模型）：每排的平台、兩側走道的台階（每排兩階）、前緣收邊、長桌、椅子、講桌、黑板、投影幕；門口的「看看」；點地面用的平面 ----
  function buildLecture(L,r,grp,bb,IT,lvGrp,zone){ const MAT=B3.MAT, Y=L.floors[r.lv].y, up=r.stage==='S'?-1:1, dummy={blockRect(){}};
    const platM=TK.std({map:W3.stoneTex('#c4c2bd'),roughness:0.8}), riserM=TK.std({color:0x8f8b84,roughness:0.85}), noseM=TK.std({color:0x55595e,roughness:0.6}), stepM=TK.std({color:0xd8d2c4,roughness:0.7});
    const sw=r.seatX1-r.seatX0, sx=(r.seatX0+r.seatX1)/2, wx0=Math.min(...r.aisles.map(a=>a[0])), wx1=Math.max(...r.aisles.map(a=>a[1]));
    for(const q of r.rowsData){ const za=Math.min(q.front,q.back), zb=Math.max(q.front,q.back), half=(q.y-q.yPrev)/2;
      bb.add(platM,TK.boxG(sw,q.y,zb-za,2.4),sx,Y+q.y/2,(za+zb)/2);                                    // 座位區的平台
      bb.add(riserM,TK.boxG(sw,q.y-q.yPrev,0.02),sx,Y+(q.y+q.yPrev)/2,q.front-up*0.011);               // 前緣的豎板（深一點，看得出一階）
      bb.add(noseM,TK.boxG(wx1-wx0,0.035,0.05),(wx0+wx1)/2,Y+q.y-0.0175,q.front+up*0.025);             // 前緣收邊
      for(const [a0,a1] of r.aisles){ const aw=a1-a0, ac=(a0+a1)/2, z1=q.front+up*r.stepD, fa=Math.min(q.stepEnd,q.back), fb=Math.max(q.stepEnd,q.back);   // 走道：兩階＋平的一段
        bb.add(platM,TK.boxG(aw,q.yPrev+half,r.stepD,2.4),ac,Y+(q.yPrev+half)/2,q.front+up*r.stepD/2);
        bb.add(platM,TK.boxG(aw,q.y,r.stepD,2.4),ac,Y+q.y/2,q.front+up*r.stepD*1.5);
        bb.add(platM,TK.boxG(aw,q.y,fb-fa,2.4),ac,Y+q.y/2,(fa+fb)/2);
        for(const [zz,yy] of [[q.front,q.yPrev+half],[z1,q.y]]) bb.add(stepM,TK.boxG(aw,0.02,0.06),ac,Y+yy+0.005,zz+up*0.03); }   // 每一階前緣的止滑條
      { const dk=Z3.desk(grp,dummy,sx,q.deskZ,0,sw,r.deskD,'#3b3330'); dk.position.y=q.y; }
      const wp=new THREE.Mesh(new THREE.PlaneGeometry(wx1-wx0,zb-za),new THREE.MeshBasicMaterial({visible:false})); wp.rotation.x=-Math.PI/2; wp.position.set((wx0+wx1)/2,Y+q.y+0.01,(za+zb)/2); wp.userData.walkLv=r.lv; wp.userData.dyn=true; lvGrp.add(wp); zone.walkMeshes.push(wp); }
    for(const st of r.seats){ const c=Z3.chair(grp,st.x,st.z,st.yaw,'#8a5f3c'); c.position.y=st.y; }
    if(r.lectern){ const lc=r.lectern; bb.add(MAT.wood(),TK.boxG(lc.w,1.05,lc.d),lc.x,Y+0.525,lc.z); bb.add(MAT.woodD(),TK.boxG(lc.w+0.1,0.05,lc.d+0.1),lc.x,Y+1.075,lc.z); }
    const wz=up<0?r.z1:r.z0;   // 講台那一面牆
    if(r.board){ const b=r.board; bb.add(TK.std({color:0x2f4a3a,roughness:0.6}),TK.boxG(b.w,b.y1-b.y0,0.04),b.x,Y+(b.y0+b.y1)/2,wz+up*0.03); bb.add(MAT.frame(),TK.boxG(b.w+0.1,0.05,0.09),b.x,Y+b.y0-0.02,wz+up*0.06); }
    if(r.screen){ const sc=r.screen; const p=new THREE.Mesh(new THREE.PlaneGeometry(sc.w,sc.y1-sc.y0),new THREE.MeshBasicMaterial({color:0xf2f0ea})); p.position.set(sc.x,(sc.y0+sc.y1)/2,wz+up*0.12); p.rotation.y=up<0?Math.PI:0; grp.add(p); bb.add(MAT.frame(),TK.boxG(sc.w+0.2,0.1,0.12),sc.x,Y+sc.y1+0.05,wz+up*0.12); }
    if(r.door){ const d=r.door, mid=(d.a0+d.a1)/2, o={W:[-0.6,0],E:[0.6,0],N:[0,-0.6],S:[0,0.6]}[d.wall]||[0,0], vert=d.wall==='W'||d.wall==='E';   // 門外（走廊、大廳那一側）
      IT.push({x:(vert?d.x:mid)+o[0],z:(vert?mid:d.z)+o[1],radius:0.9,lv:r.lv,label:r.lookLabel,room:r.id,look:r.look}); } }
  // ---- 窗外的景（B3.outView；照片還沒拍的用程序化的景）----
  function windowViews(L,lv0,lv1,outs){ const W=L.W, D=L.D, T=L.wallT;
    for(const w of L.windows){ const grp=w.lv?lv1:lv0, a=(w.a0+w.a1)/2, len=w.a1-w.a0, h=w.y1-w.y0, yc=(w.y0+w.y1)/2-(w.lv?L.floors[1].y:0);
      const z=w.wall==='S'?D/2-T/2-0.03:-D/2+T/2+0.03, ry=w.wall==='S'?Math.PI:0; const p=B3.outView(w.wall==='S'?'south':'east',w.photo,len,h,a,(w.lv?L.floors[1].y:0)+yc,z,ry,20,grp); outs.push(p); } }
  // ---- 區域 ----
  function makeZone(id){ return { id, get name(){ return LAYOUTS[id]().name; }, indoor:true, camDist:4.6, build(E){ const L=LAYOUTS[id](), W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], slabs=[], outs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const innerM=M('#ece6da'); innerM.userData.seeThrough=true;   /* 隔間、走廊牆擋住鏡頭時網點透空 */
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},seeThru:true,layout:L,
      fadeWalls(cam){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=18.6); for(const o of outs) B3.setOutView(o,h,weather,night); },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; },
      roomAt(x,z,lv){ for(const r of L.rooms){ if((r.lv|0)!==(lv|0)) continue; if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1) return r.id; } for(const a of (L.areas||[])){ if((a.lv|0)===(lv|0)&&x>a.x0&&x<a.x1&&z>a.z0&&z<a.z1) return a.id; } return 'hall'; } };   /* 房間 → 範圍（areas）→ 大廳 */
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs,innerM); buildFurniture(E,L,lv0,lv1,fb0,fb1,zone); windowViews(L,lv0,lv1,outs);
    zone.camCols=camColliders(L,g);   /* 跟隨鏡頭撞到隔間牆就拉近（LAWWW2 審查 P1）*/
    // 樓梯可以點的面（點一跑樓梯＝走完那一跑，engine3d.js 任務 #42）
    for(const s of [ss.a,ss.ld,ss.b,ss.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.top)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      const ax=(S.A.x0+S.A.x1)/2, bx=(S.B.x0+S.B.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===ss.a) m.userData.stairEnds=[{x:ax,z:S.A.z1+0.5,lv:0},{x:ax,z:ldz,lv:0}]; if(s===ss.b) m.userData.stairEnds=[{x:bx,z:ldz,lv:0},{x:bx,z:S.B.z1+0.6,lv:1}]; }
    const lights=[]; for(const [x,y,z,on,off] of L.lights){ const l=new THREE.PointLight(0xfff4e6,off,16,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    const EN=L.entrance; E.interactables.push({x:EN.exit.x,z:EN.exit.z,radius:EN.exit.r,lv:0,label:'走出'+L.name,exit:{to:'campus',spawn:EN.campus?Object.assign({},EN.campus):undefined}});   /* campus 還沒定（博雅：校園的位置等使用者決定）＝校園的預設出生點 */
    return zone; } }; }
  const ZONES={ gongtong:makeZone('gongtong') }; if(typeof BOYA_LAYOUT!=='undefined') ZONES.boya=makeZone('boya'); if(typeof PUTONG_LAYOUT!=='undefined') ZONES.putong=makeZone('putong');
  return {ZONES,stairSurfs,buildNav,seatsOf,LAYOUTS};
})();
for(const k in TB3.ZONES) Z3.ZONES[k]=TB3.ZONES[k];
