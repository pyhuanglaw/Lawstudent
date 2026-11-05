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
    const c=L.cell, al=v=>(Math.floor(v/c+1e-9)-0.5)*c, BR=L.bridge, ext=BR?BR.len+0.8:0; const mk=()=>new E3.NavGrid(W+3,D+3+ext,c,al(-W/2-1),al(-D/2-1-ext));   /* 有空橋（普通二樓往北）：格子往北多 len+0.8 m */ const nav0=mk(), nav1=mk().setFloor(Y1); const navs=[nav0,nav1];
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
    /* 空橋（2026-10-16，使用者試玩回報「空橋是一扇門」；LAWWW2-B skybridge.glb）：北牆的門洞（1.8 m）＋橋面（x ±half）；兩端各 flat 公尺的平台、中間緩坡升 rise（沒有台階）*/
    if(BR){ const bx=BR.x, z0=BR.z, hw=BR.doorW/2, xa=bx-BR.half-0.2, xb=bx+BR.half+0.2; nav1.freeRect(bx-hw+0.05,z0-0.3,bx+hw-0.05,z0+0.35); nav1.freeRect(bx-BR.half+0.05,z0-BR.len+0.1,bx+BR.half-0.05,z0-0.25);
      nav1.addSurf({x0:xa,x1:xb,z0:z0-BR.len+BR.flat,z1:z0-BR.flat,axis:'z',ya:Y1+BR.rise,yb:Y1}); nav1.addSurf({x0:xa,x1:xb,z0:z0-BR.len-0.4,z1:z0-BR.len+BR.flat,y:Y1+BR.rise}); }
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
    const BR=L.bridge;
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){
      if(BR&&grp===fb1){ const a=BR.x-BR.doorW/2, b=BR.x+BR.doorW/2, nd=new THREE.Vector3(0,0,1); wall((-W/2+a)/2,-D/2,a+W/2,h,y,0,nd,outer,grp); wall((b+W/2)/2,-D/2,W/2-b,h,y,0,nd,outer,grp); wall(BR.x,-D/2,BR.doorW,h-BR.clear,y+BR.clear,0,nd,outer,grp); }   /* 二樓北牆：往空橋的門洞 */
      else wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),outer,grp);
      wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),outer,grp); wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),outer,grp); }
    wall(0,D/2,W,RY-Y1,Y1,0,new THREE.Vector3(0,0,-1),outer,fb1);
    for(const [a,b] of [[-W/2,EN.a0],[EN.a1,W/2]]) wall((a+b)/2,D/2,b-a,Y1,0,0,new THREE.Vector3(0,0,-1),outer,fb0);
    wall((EN.a0+EN.a1)/2,D/2,EN.a1-EN.a0,Y1-2.6,2.6,0,new THREE.Vector3(0,0,-1),outer,fb0);
    /* 入口門框跟著南牆淡出（2026-10-13 LAWWW2 審查：剛進門時鏡頭在南牆外、牆淡出了、門框沒有，前景一大條黑色）*/
    { const fm=MAT.frame(); const fr=(w,h,x,y)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,0.16),fm.clone()); ms.material.transparent=true; ms.position.set(x,y,D/2-0.12); ms.userData.dir=new THREE.Vector3(0,0,-1); ms.userData.noMerge=true; fb0.add(ms); walls.push(ms); };
      for(const x of [EN.a0,EN.a1]) fr(0.1,2.65,x,1.325); fr(EN.a1-EN.a0,0.1,(EN.a0+EN.a1)/2,2.6); }
    /* 往空橋的玻璃門（博雅二樓南牆，linkDoor）：門框跟著牆淡出；按門口的互動＝走上空橋（落在普通教學館區域的空橋上，要走過整條空橋）*/
    for(const r of L.rooms){ const ld=r.linkDoor; if(!ld) continue; const yb=L.floors[r.lv|0].y, sgn=ld.z>0?1:-1, zz=sgn*(D/2-0.12), dir=new THREE.Vector3(0,0,-sgn), grp=r.lv?fb1:fb0, fm=MAT.frame();
      const pc=(w,h,x,y)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,0.16),fm.clone()); ms.material.transparent=true; ms.position.set(x,y,zz); ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); };
      for(const x of [ld.x-ld.w/2,ld.x+ld.w/2]) pc(0.1,2.45,x,yb+1.225); pc(ld.w,0.1,ld.x,yb+2.4);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(ld.w-0.1,2.35),MAT.glass()); gl.position.set(ld.x,yb+1.175,zz-sgn*0.02); if(sgn>0) gl.rotation.y=Math.PI; grp.add(gl); }
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
    /* 高的家具也擋鏡頭（LAWWW2 CAMERA_WALLS §1(2)：普通 1F 門廳，鏡頭被牆拉近、抬高後停在公告欄的雨遮正上方 0.22 m，畫面一大塊深色）：
       公告欄（W3.bulletin 和正式模型同尺寸：寬 2.6、高 2.5、雨遮往前凸 0.35 m）；講座資訊螢幕貼在牆上（牆已經擋），不另外加 */
    /* 空橋：二樓北牆（門洞兩側＋門楣）、橋的兩側、博雅那一端的牆與門廳的後牆——鏡頭留在橋裡面（外面是空的）*/
    const BR=L.bridge; if(BR){ const a=BR.x-BR.doorW/2, b=BR.x+BR.doorW/2, z0=BR.z, za=z0-BR.len, hw=BR.outerW/2, yt=Y1+BR.rise+3.6;
      box(1,true,-L.W/2,a,z0,Y1,RY); box(1,true,b,L.W/2,z0,Y1,RY); box(1,true,a,b,z0,Y1+BR.clear,RY);
      box(1,false,za,z0,BR.x-hw+0.1,Y1-0.5,yt); box(1,false,za,z0,BR.x+hw-0.1,Y1-0.5,yt);
      box(1,true,BR.x-hw-1.5,a,za-0.12,Y1,yt); box(1,true,b,BR.x+hw+1.5,za-0.12,Y1,yt); box(1,true,a,b,za-0.12,Y1+BR.rise+BR.clear,yt); box(1,true,a-0.5,b+0.5,za-2.45,Y1,yt); }
    for(const bd of (L.boards||[])){ if(bd.style==='screen') continue; const lv=bd.lv|0, m=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.5,0.5),inv);
      m.position.set(bd.x+Math.sin(bd.ry)*0.1,(lv?Y1:0)+1.25,bd.z+Math.cos(bd.ry)*0.1); m.rotation.y=bd.ry; m.userData.noMerge=true; m.userData.camFurn='bulletin'; g.add(m); (out[lv]=out[lv]||[]).push(m); }
    return out; }
  /* ---- 正式家具模組（LAWWW2 furniture_study.glb；VISUAL_REVIEW（second_ai）第 23 節）----
     大廳的自習雙人桌（0.9×0.6、兩張椅子離桌心 0.55）、圓桌（Ø1.0、四張椅子離桌心 0.8）：配置的尺寸對得上才換，每種一個 InstancedMesh；載入前、載入失敗照樣是程序化備用。
     椅子垂直放大到椅面 0.485 m：遊戲的坐姿（character3d.js 坐下時往下 0.47 m）是照 Z3.chair 的椅面高度調的，正式椅子的椅面 0.454 m，不放大的話人會浮在椅面上 3 公分。
     階梯教室的講堂椅（座距 0.52、排距 1.0）等 R2 的配置（使用者 2026-10-14：保留 R2、不要沒測試就放大整棟），現在的 6 排配置（座距約 0.73、排距 2.0）照舊用備用模型 */
  const FURN_KEY='prop.furniture_study', CHAIR_FIT=0.485/0.454, LECT_DESK_TOP=0.75;
  function furnModule(t){ const near=(a,b,e)=>Math.abs(a-b)<(e||0.02), seats=t.seats||[];
    if(t.shape==='round') return near(t.r,0.5)&&seats.length&&seats.every(s=>near(Math.hypot(s.x-t.x,s.z-t.z),0.8,0.03))?{mod:'round_table',ry:0}:null;
    const ry=near(t.w,0.6)&&near(t.d,0.9)?Math.PI/2:(near(t.w,0.9)&&near(t.d,0.6)?0:null);   /* 模組是 0.9（x）×0.6（z）、椅子在 z 的兩側；配置的桌子長邊南北向（0.6×0.9、椅子在東西兩側）＝整組轉 90° */
    if(ry===null||!seats.length||!seats.every(s=>near(Math.hypot(s.x-t.x,s.z-t.z),0.55,0.03))) return null; return {mod:'study_table2',ry}; }
  function furnitureGLB(zone,swap,items){ if(!items.length||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[FURN_KEY]) return;
    ASSETS.loadOne(FURN_KEY).then(c=>{ const mesh={}; c.scene.traverse(o=>{ if(o.isMesh) mesh[o.name]=o; }); if(!mesh.study_chair||items.some(it=>!mesh[it.mod])) return;
      const Mx=new THREE.Matrix4(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3(), S=new THREE.Vector3();
      for(let lv=0;lv<swap.length;lv++){ const fb=swap[lv]; if(!fb||!fb.parent) continue; const its=items.filter(it=>it.lv===lv); if(!its.length) continue;
        const out=new THREE.Group(); out.name='furniture_glb'; const put=(name,list,fn)=>{ const im=new THREE.InstancedMesh(mesh[name].geometry,mesh[name].material,list.length); list.forEach((q,i)=>{ fn(q); Mx.compose(V,Q,S); im.setMatrixAt(i,Mx); });
          im.instanceMatrix.needsUpdate=true; im.castShadow=false; im.receiveShadow=true; im.computeBoundingSphere(); im.name=name; out.add(im); };
        for(const mod of [...new Set(its.map(it=>it.mod))]) put(mod,its.filter(it=>it.mod===mod),it=>{ V.set(it.x,0,it.z); Q.setFromAxisAngle(UP,it.ry); S.set(1,1,1); });
        const chairs=its.flatMap(it=>it.seats), chairM=st=>{ V.set(st.x,0,st.z); Q.setFromAxisAngle(UP,st.yaw||0); S.set(1,CHAIR_FIT,1); };   /* 椅子：座位點＝椅面中心、坐的人面向 +z（和座位 yaw 同一個方向）*/
        if(mesh.study_chair_lod1){ const mk=name=>{ const im=new THREE.InstancedMesh(mesh[name].geometry,mesh[name].material,chairs.length); im.count=0; im.castShadow=false; im.receiveShadow=true; im.name=name; out.add(im); return im; };
          (zone.chairLods=zone.chairLods||[]).push({out,near:mk('study_chair'),far:mk('study_chair_lod1'),list:chairs.map(st=>{ chairM(st); return {x:st.x,z:st.z,m:new THREE.Matrix4().compose(V,Q,S),near:true}; }),done:false}); }
        else put('study_chair',chairs,chairM);
        fb.parent.add(out); fb.visible=false; }
      if(zone.chairLods&&!zone.chairLodHook){ zone.chairLodHook=true; const prev=zone.update; zone.update=function(dt,E){ if(prev) prev.call(this,dt,E); chairLod(zone,E); }; }
      zone.furnGLB=true; }).catch(e=>{ console.warn('furniture_study（照樣用備用模型）',e); }); }
  /* 自習椅 10 m 外換 study_chair_lod1（72 個三角形；完整版 1,020）——PERF-PATROL-ECON-1025（LAWWW2-B 2026-10-25，LAWWW-B 同意）：博雅大廳 32 張椅子在鏡頭裡，雙面完整版一共 3.3 萬個三角形。
     離鏡頭 10 m 外換、9.5 m 內換回來（邊界上不會一直換）；有變動才重填。測試：node tests/teach_perf_econ_unit.js */
  /* 燈（PERF-PATROL-ECON-1025 ③，LAWWW2-B 2026-10-25，LAWWW-B 同意先試）：配置的燈（每棟 9 盞＋空橋 2 盞）當「燈位」，真的光源只有 3 盞，跟著玩家換到最近的 3 個燈位（照 3D 距離：照到玩家附近最亮的就是最近的那幾盞；試過同一層優先，二樓晚上人物變暗——一樓的燈原本隔著樓板照到人）；
     換的時候先淡出、再淡入（各 0.4 秒），不會一下子亮暗。光源數固定（shader 不重編）；白天／晚上的亮度照燈位的 on／off（onLamps）。
     博雅大廳往北：9 盞 1.55 fps、3 盞 2.3（全關 2.55）；離玩家遠的燈本來就只照到牆後的教室（點光源不擋牆）。測試：node tests/teach_perf_econ_unit.js */
  const LIGHT_K=3, LIGHT_FADE=0.4;
  function lightPool(zone,g,lights){ if(lights.length<=LIGHT_K) return;
    const spots=lights.map(l=>{ if(l.parent) l.parent.remove(l); return {p:l.position.clone(),on:l.userData.on,off:l.userData.off,dist:l.distance,decay:l.decay,color:l.color.clone()}; }); lights.length=0;
    const slots=[]; for(let i=0;i<LIGHT_K;i++){ const l=new THREE.PointLight(0xfff4e6,0,16,2); l.name='teach_light_'+i; g.add(l); slots.push({l,s:null,k:0}); }
    zone.lightPool={spots,slots,on:false,first:true}; zone.onLamps=function(on){ zone.lightPool.on=!!on; lightStep(zone,0,null); };
    const prev=zone.update; zone.update=function(dt,E){ if(prev) prev.call(this,dt,E); lightStep(zone,dt,E); }; }
  function lightStep(zone,dt,E){ const P=zone.lightPool, pl=E&&E.player&&E.player.obj;
    if(pl){ const want=P.spots.map(s=>({s,d:s.p.distanceTo(pl.position)})).sort((a,b)=>a.d-b.d).slice(0,LIGHT_K).map(o=>o.s), st=P.first?1:Math.min(1,(dt||0)/LIGHT_FADE);
      for(const sl of P.slots){ if(!sl.s) continue; if(want.indexOf(sl.s)<0){ sl.k=Math.max(0,sl.k-st); if(sl.k<=0) sl.s=null; } else sl.k=Math.min(1,sl.k+st); }
      for(const s of want){ if(P.slots.some(sl=>sl.s===s)) continue; const f=P.slots.find(sl=>!sl.s); if(!f) break; f.s=s; f.k=P.first?1:0; f.l.position.copy(s.p); f.l.distance=s.dist; f.l.decay=s.decay; f.l.color.copy(s.color); }
      P.first=false; }
    for(const sl of P.slots) sl.l.intensity=sl.s?sl.k*(P.on?sl.s.on:sl.s.off):0; }
  const CHAIR_LOD_D=10, CHAIR_LOD_BACK=9.5, _cP=new THREE.Vector3();
  function chairLod(zone,E){ const cam=E&&E.camera; if(!cam) return;
    for(const L of zone.chairLods){ let ch=!L.done; L.out.updateWorldMatrix(true,false);
      for(const c of L.list){ const d=_cP.set(c.x,0,c.z).applyMatrix4(L.out.matrixWorld).distanceTo(cam.position), nr=c.near?d<=CHAIR_LOD_D:d<CHAIR_LOD_BACK; if(nr!==c.near){ c.near=nr; ch=true; } }
      if(!ch) continue; L.done=true; let a=0, b=0; for(const c of L.list){ if(c.near) L.near.setMatrixAt(a++,c.m); else L.far.setMatrixAt(b++,c.m); }
      L.near.count=a; L.far.count=b; for(const im of [L.near,L.far]){ im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere(); } } }
  /* ---- 關著的房間的門（ART-02：共同教學館沒有正式室內殼，洗手間、203 的門原本是一塊木板）：換成 furniture_study.glb 的門框＋關著的門片＋門牌 ----
     模組的約定：原點＝門洞中心的地面、z＝0 是牆的中心面、+z＝走廊；門洞 1.2×2.4、牆厚 0.2。這裡的牆沒有開口（關著的房間導航本來就擋著，鏡頭碰撞照牆算），
     所以門片貼在走廊那一面（中心離牆心 0.1245，比牆面凸 2 mm）、門框整個往走廊移 0.0475（門片比門框的飾條凹進去 1.5 cm，看起來像嵌在門框裡）；門牌在門的右邊、貼牆面（不移）。
     只換寬 1.2 m 的門（模組的門洞）；放在備用模型群組（fb0／fb1）裡：博雅、普通的正式室內殼載入後跟著整組藏起來（殼裡有自己的門）。載入前、載入失敗照舊是木板 */
  const DOOR_W=1.2, DOOR_FRAME_DZ=0.0475, DOOR_LEAF_DZ=0.1245;
  function plateTex(text){ return W3.canvasTex('doorplate_'+text,256,112,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#2b2f33'; x.textAlign='center'; x.textBaseline='middle'; let fs=58; x.font='bold '+fs+'px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif';
    while(fs>24&&x.measureText(text).width>w-24){ fs-=4; x.font='bold '+fs+'px "Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif'; } x.fillText(text,w/2,h/2+2); }); }
  function doorsGLB(zone,fbs,doorFb,items,Y1){ if(!items.length||typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[FURN_KEY]) return;
    ASSETS.loadOne(FURN_KEY).then(c=>{ const mesh={}; c.scene.traverse(o=>{ if(o.isMesh) mesh[o.name]=o; }); if(!mesh.door_frame||!mesh.door_leaf_closed||!mesh.door_plate) return;
      const Mx=new THREE.Matrix4(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3(), S1=new THREE.Vector3(1,1,1);
      for(let lv=0;lv<2;lv++){ const its=items.filter(it=>it.lv===lv); if(!its.length||!fbs[lv]) continue; const y=lv?Y1:0, out=new THREE.Group(); out.name='doors_glb';
        for(const [name,dz] of [['door_frame',DOOR_FRAME_DZ],['door_leaf_closed',DOOR_LEAF_DZ],['door_plate',0]]){ const im=new THREE.InstancedMesh(mesh[name].geometry,mesh[name].material,its.length);
          its.forEach((it,i)=>{ V.set(it.x,y,it.z+it.out*dz); Q.setFromAxisAngle(UP,it.out>0?0:Math.PI); Mx.compose(V,Q,S1); im.setMatrixAt(i,Mx); });
          im.instanceMatrix.needsUpdate=true; im.castShadow=false; im.receiveShadow=true; im.computeBoundingSphere(); im.name=name; out.add(im); }
        for(const it of its){ if(!it.text) continue; const m=new THREE.Mesh(new THREE.PlaneGeometry(0.25,0.11),new THREE.MeshStandardMaterial({map:plateTex(it.text),transparent:true,depthWrite:false,roughness:0.8}));   /* 門牌的字：門右邊 0.89 m、高 1.625 m，貼在門牌面上 */
          m.position.set(it.x+(it.out>0?0.89:-0.89),y+1.625,it.z+it.out*0.1155); m.rotation.y=it.out>0?0:Math.PI; m.name='door_plate_text'; out.add(m); }
        fbs[lv].add(out); if(doorFb[lv]) doorFb[lv].visible=false; }
      zone.doorsGLB=true; }).catch(e=>{ console.warn('furniture_study 的門（照樣用木板）',e); }); }
  // ---- 家具（備用）＋互動點 ----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin(); const bins=[b0,b1];
    /* 桌椅、長椅、公告欄、講堂椅（grpOf）放在備用模型群組（fb0／fb1）外面的 fu0／fu1：正式室內模型（ASSETS 'bldg.<id>_interior'，B3.attachFormal）載入後會藏起 fb0／fb1，
       桌椅要留著（正式模型只有殼和固定設備：黑板、講桌、階梯教室的平台、沙發、關著的門；LAWWW2-C 2026-10-18 ART-EXT-TEACH）。原本是 fb0 和 fb1 裡的 up1 */
    const fu0=new THREE.Group(), fu1=new THREE.Group(); fu0.name='furniture0'; fu1.name='furniture1'; fu1.position.y=Y1; fu0.userData.dyn=true; fu1.userData.dyn=true; lv0.add(fu0); lv1.add(fu1); const up1=fu1; const grpOf=lv=>lv?fu1:fu0; const dummy={blockRect(){}};
    const doorBins=[new TK.Bin(),new TK.Bin()], doorItems=[];   /* 關著的門的木板（備用）：一層一組，換成門模組時整組藏起來 */
    // 教室：黑板、講桌、學生桌；互動：看教室（門口）
    for(const r of L.rooms){ const y=r.lv?Y1:0, bb=bins[r.lv];
      /* 關著的房間：門板在 doorZ 那一道牆的外側（走廊那一側），門口的說明在牆外 0.9 m（原本一律放在 z0 那一側：洗手間的門口說明跑到建築外面、走不到）*/
      if(r.kind==='closed'){ const dz=r.doorZ!=null?r.doorZ:r.z0, out=Math.abs(dz-r.z1)<1e-6?1:-1; const dx=(r.door[0]+r.door[1])/2, dw=r.door[1]-r.door[0];
        if(Math.abs(dw-DOOR_W)<0.02){ doorBins[r.lv|0].add(MAT.woodD(),TK.boxG(dw-0.1,2.3,0.06),dx,y+1.15,dz+out*0.13); doorItems.push({lv:r.lv|0,x:dx,z:dz,out,text:r.plate||String(r.label||'').replace(/（.*?）/g,'').trim()}); }   /* 載入門模組以後藏起來（doorsGLB）*/
        else bb.add(MAT.woodD(),TK.boxG(dw-0.1,2.3,0.06),dx,y+1.15,dz+out*0.13);
        /* link：門後面是通到別棟的空橋（普通二樓 ⇄ 博雅二樓，方案 A）——按了就走過去（區域切換、落在對面那棟的二樓）；其他關著的房間：門口的說明 */
        /* 有正式房間的關著的房間（ROOM_GLB_LAYOUTS 的 host_door＝{zone:這一棟, id:房號}；博雅 203＝AA_399 第 10 節 SK07 那一晚）：開放時段內門口是「進入」、時段外照舊是門上的字（兩個不會同時出現）*/
        const RK=!r.link&&typeof ROOM_GLB_LAYOUTS!=='undefined'&&Z3.roomGlbGate?Object.keys(ROOM_GLB_LAYOUTS).find(k=>{ const h=ROOM_GLB_LAYOUTS[k].host_door; return h&&h.zone===L.id&&h.id===r.id&&Z3.ZONES[k]; }):null;
        if(RK){ const R=ROOM_GLB_LAYOUTS[RK]; IT.push(Z3.roomGlbGate({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:R.host_door.label||('進入 '+R.name),exit:{to:RK,spawn:Object.assign({},R.spawn)},gate:RK},false)); IT.push(Z3.roomGlbGate({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:r.label,look:r.look,gate:RK},true)); continue; }
        if(r.link) IT.push({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:r.link.label,exit:{to:r.link.to,spawn:Object.assign({},r.link.spawn)}}); else IT.push({x:dx,z:dz+out*0.9,radius:1.0,lv:r.lv,label:r.label,look:r.look}); continue; }
      if(r.kind==='passage'){ if(r.link&&r.linkDoor) IT.push({x:r.linkDoor.x,z:(r.linkDoor.z>0?1:-1)*(L.D/2-0.6),radius:0.8,lv:r.lv,label:r.link.label,exit:{to:r.link.to,spawn:Object.assign({},r.link.spawn)}}); continue; }   /* 打開的通道（往空橋）：沒有門板；博雅那一端的玻璃門＝走上空橋 */
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
    /* 尺寸對得上正式家具模組的桌子（自習雙人桌、圓桌，furnModule）：備用模型放進 swap 群組，正式模組載入以後整組藏起來（furnitureGLB）*/
    const swap=[null,null], swapItems=[]; const swapGrp=lv=>swap[lv]||(swap[lv]=(()=>{ const s=new THREE.Group(); s.name='furniture_fallback'; grpOf(lv).add(s); return s; })());
    for(const g of (L.groups||[])){ const bb=bins[g.lv], y0=g.lv?Y1:0;
      for(const t of (g.tables||[])){ const fm=furnModule(t), grp=fm?swapGrp(g.lv):grpOf(g.lv); if(fm) swapItems.push({lv:g.lv|0,x:t.x,z:t.z,ry:fm.ry,mod:fm.mod,seats:t.seats});
        if(t.shape==='round'){ const h=t.h||0.74; const top=new THREE.Mesh(new THREE.CylinderGeometry(t.r,t.r,0.04,18),M('#d9cdb8',{rough:0.5})); top.position.set(t.x,h,t.z); top.userData.furn=true; grp.add(top); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.16,h-0.02,10),M('#3a3f46')); leg.position.set(t.x,(h-0.02)/2,t.z); leg.userData.furn=true; grp.add(leg); }
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
      IT.push({x:bd.x+Math.sin(bd.ry)*0.9,z:bd.z+Math.cos(bd.ry)*0.9,radius:1.0,lv:bd.lv,label:bd.label,board:true,get look(){ return bd.look+(typeof ACTIVITIES!=='undefined'&&typeof GAME!=='undefined'&&GAME.G?'　'+ACTIVITIES.posterText(GAME.G,bd.zoneFilter?L.id:undefined):''); }}); }   /* 公告欄：照活動資料（src/data/activities.js）列出這幾天的演講與活動；zoneFilter＝只列這棟的 */   /* 公告欄：照活動資料（src/data/activities.js）列出這幾天的演講與活動 */
    for(const sg of (L.signs||[])){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.w*0.16),new THREE.MeshBasicMaterial({map:TK.signTex(sg.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(sg.x,sg.y,sg.z); sp.rotation.y=sg.ry||0; (sg.lv?lv1:lv0).add(sp); }
    { const S=L.stair; const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.38),new THREE.MeshBasicMaterial({map:TK.signTex(S.sign,{bg:'#5a2a22',color:'#f3efe4'})})); sp.position.set((S.B.x0+S.B.x1)/2,Y1+2.3,S.B.z1+0.02); lv1.add(sp);
      const up3={x:(S.B.x0+S.B.x1)/2,z:S.B.z1+0.5,radius:0.8,lv:1,label:'往 3F',look:'往 3F 的樓梯口拉著一條鍊子：「整修中，暫停開放」。'};
      const R3=L.id==='gongtong'&&typeof ROOM_GLB_LAYOUTS!=='undefined'&&ROOM_GLB_LAYOUTS.gongtong_3f&&Z3.ZONES.gongtong_3f&&Z3.roomGlbGate?ROOM_GLB_LAYOUTS.gongtong_3f:null;   /* 共同教學館 3F 考場（AA_399 第 9 節；rooms_glb3d.js）：只有考試那天鍊子拿掉、可以上去，其他時間照舊 */
      if(R3){ up3.gate='gongtong_3f'; Z3.roomGlbGate(up3,true); IT.push(Z3.roomGlbGate({x:up3.x,z:up3.z,radius:0.8,lv:1,label:'上 3F（考場）',exit:{to:'gongtong_3f',spawn:Object.assign({},R3.spawn)},gate:'gongtong_3f'},false)); }
      IT.push(up3); }
    // 座位
    const seats=zone.seats=seatsOf(L);
    for(const st of seats){ if((st.kind==='class'||st.kind==='lounge'||st.kind==='study')&&!(L.groups||[]).some(g=>g.id===st.room)) Z3.chair(grpOf(st.lv),st.x,st.z,st.yaw,st.kind==='class'?'#5a6470':'#8a6a4a');
      const label=st.kind==='class'||st.kind==='lecture'?'坐下':(st.label||(st.kind==='study'?'坐下讀書（自習區）':(st.kind==='lounge'?'坐下（休息區）':'坐下')));
      /* 階梯教室：互動點在椅子後面 0.35 m（玩家站在那一排椅子後面的走道上；半徑小一點，旁邊的位子不會搶），帶高度（別排的不算）*/
      if(st.kind==='lecture'){ IT.push({x:st.x-Math.sin(st.yaw)*0.35,z:st.z-Math.cos(st.yaw)*0.35,y:st.y,radius:0.62,lv:st.lv,label,seat:st,study:true}); continue; }
      /* 沙發：從正前方走過去坐（前面 0.5 m 還在沙發的範圍裡，站得住的地方在前面 0.8 m 左右）——互動點往前 0.4 m，站在沙發前就出現「坐在沙發上」*/
      if(st.kind==='sofa'){ IT.push({x:st.x+Math.sin(st.yaw)*0.4,z:st.z+Math.cos(st.yaw)*0.4,radius:0.75,lv:st.lv,label,seat:st,study:true}); continue; }
      IT.push({x:st.x,z:st.z,radius:0.8,lv:st.lv,label,seat:st,study:st.kind!=='bench'}); }
    mergeFurniture(fu0); mergeFurniture(fu1);   /* 2026-10-13 LAWWW2 審查：博雅空著每個畫面 570–810 次 draw call——每張椅子、桌子各自是網格 */
    for(const s of swap) if(s) mergeFurniture(s); furnitureGLB(zone,swap,swapItems);
    b0.build(fb0); b1.build(fb1);
    const doorFb=[fb0,fb1].map((fb,lv)=>{ if(!doorItems.some(it=>it.lv===lv)) return null; const gd=new THREE.Group(); gd.name='door_fallback'; fb.add(gd); doorBins[lv].build(gd); return gd; });
    doorsGLB(zone,[fb0,fb1],doorFb,doorItems,Y1); return seats; }
  /* 一層的桌椅（Z3.desk／Z3.chair、小圓桌，userData.furn）合成每種材質一個網格：位置、樣子不變，只是少畫很多次。座位、導航、互動點是資料，不受影響 */
  function mergeFurniture(grp){ const fs=grp.children.filter(o=>o.userData&&o.userData.furn); if(fs.length<2) return; const tmp=new THREE.Group(); grp.add(tmp); for(const o of fs) tmp.add(o); const m=W3.mergeGroup(tmp); grp.remove(tmp); m.name='furniture'; grp.add(m);
    tmp.traverse(o=>{ if(o.isMesh&&o.geometry) o.geometry.dispose(); }); }

  // ---- 階梯教室（備用模型）：每排的平台、兩側走道的台階（每排兩階）、前緣收邊、長桌、椅子、講桌、黑板、投影幕；門口的「看看」；點地面用的平面 ----
  function buildLecture(L,r,grp,bb,IT,lvGrp,zone){ const MAT=B3.MAT, Y=L.floors[r.lv].y, up=r.stage==='S'?-1:1, dummy={blockRect(){}};
    /* 長桌、椅子（備用）放在自己的群組：正式室內模型有階梯教室的桌椅（SEATPANS）時整組藏起來（BOYA-LM-1030，LAWWW2-B 10-30；博思 teach_interior.py）*/
    const lf=new THREE.Group(); lf.name='lecture_furniture'; grp.add(lf); (zone.lectFurn=zone.lectFurn||[]).push(lf);
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
      { const dk=Z3.desk(lf,dummy,sx,q.deskZ,0,sw,r.deskD,'#3b3330'); dk.position.y=q.y-(0.77-LECT_DESK_TOP); }   /* 桌面在那一排的平台上 0.75 m（Z3.desk 的桌面 0.77）：和正式的講堂桌板、替身抄筆記的手、桌上小物同一個高度 */
      const wp=new THREE.Mesh(new THREE.PlaneGeometry(wx1-wx0,zb-za),new THREE.MeshBasicMaterial({visible:false})); wp.rotation.x=-Math.PI/2; wp.position.set((wx0+wx1)/2,Y+q.y+0.01,(za+zb)/2); wp.userData.walkLv=r.lv; wp.userData.dyn=true; lvGrp.add(wp); zone.walkMeshes.push(wp); }
    for(const st of r.seats){ const c=Z3.chair(lf,st.x,st.z,st.yaw,'#8a5f3c'); c.position.y=st.y; }
    mergeFurniture(lf);
    if(r.lectern){ const lc=r.lectern; bb.add(MAT.wood(),TK.boxG(lc.w,1.05,lc.d),lc.x,Y+0.525,lc.z); bb.add(MAT.woodD(),TK.boxG(lc.w+0.1,0.05,lc.d+0.1),lc.x,Y+1.075,lc.z); }
    const wz=up<0?r.z1:r.z0;   // 講台那一面牆
    if(r.board){ const b=r.board; bb.add(TK.std({color:0x2f4a3a,roughness:0.6}),TK.boxG(b.w,b.y1-b.y0,0.04),b.x,Y+(b.y0+b.y1)/2,wz+up*0.03); bb.add(MAT.frame(),TK.boxG(b.w+0.1,0.05,0.09),b.x,Y+b.y0-0.02,wz+up*0.06); }
    if(r.screen){ const sc=r.screen; const p=new THREE.Mesh(new THREE.PlaneGeometry(sc.w,sc.y1-sc.y0),new THREE.MeshBasicMaterial({color:0xf2f0ea})); p.position.set(sc.x,(sc.y0+sc.y1)/2,wz+up*0.12); p.rotation.y=up<0?Math.PI:0; grp.add(p); bb.add(MAT.frame(),TK.boxG(sc.w+0.2,0.1,0.12),sc.x,Y+sc.y1+0.05,wz+up*0.12); }
    if(r.door){ const d=r.door, mid=(d.a0+d.a1)/2, o={W:[-0.6,0],E:[0.6,0],N:[0,-0.6],S:[0,0.6]}[d.wall]||[0,0], vert=d.wall==='W'||d.wall==='E';   // 門外（走廊、大廳那一側）
      IT.push({x:(vert?d.x:mid)+o[0],z:(vert?mid:d.z)+o[1],radius:0.9,lv:r.lv,label:r.lookLabel,room:r.id,look:r.look}); } }
  /* ---- 空橋（普通二樓 → 北邊的博雅二樓；2026-10-16）：正式模型 LAWWW2-B skybridge.glb（原點＝普通那一端門口中心的地板、往北 len 公尺）；
     載入前、載入失敗用程序化備用（橋面、矮牆、玻璃、屋頂）。點得到的橋面（點地移動）、兩側窗外的景、燈；博雅那一端有一小段門廳（看得到門裡面是亮的），
     走到門口按「進博雅教學館」才換區域（落在博雅的空橋通道裡）。高度和導航同一組數字（L.bridge）---- */
  function buildBridge(E,L,lv1,walkMeshes,zone,outs,lights){ const BR=L.bridge; if(!BR) return; const Y1=L.floors[BR.lv].y, bx=BR.x, z0=BR.z, len=BR.len, R=BR.rise, F=BR.flat, MAT=B3.MAT;
    const fb=new THREE.Group(); fb.name='bridge_fallback'; lv1.add(fb); const hw=BR.outerW/2;
    const floorM=M('#cfc8ba',{rough:0.7}); const za=z0-len, zs0=z0-len+F, zs1=z0-F, d=zs1-zs0, tilt=Math.atan2(R,d);
    const plane=(w,dd,x,y,z,rx,m,vis)=>{ const p=new THREE.Mesh(new THREE.PlaneGeometry(w,dd),m); p.position.set(x,y,z); p.rotation.x=rx; return p; };
    // 備用模型：橋面（兩段平台＋緩坡）、樓板、矮牆、玻璃、屋頂
    fb.add(plane(2*hw-0.3,F,bx,Y1+0.004,z0-F/2,-Math.PI/2,floorM)); fb.add(plane(2*hw-0.3,Math.hypot(d,R),bx,Y1+R/2+0.004,(zs0+zs1)/2,-Math.PI/2+tilt,floorM)); fb.add(plane(2*hw-0.3,F,bx,Y1+R+0.004,za+F/2,-Math.PI/2,floorM));
    const bin=new TK.Bin(); bin.add(MAT.plaster(),TK.boxG(2*hw,0.45,len,1.2),bx,Y1-0.23,z0-len/2); bin.add(MAT.plaster(),TK.boxG(2*hw+0.2,0.2,len,1.2),bx,Y1+3.55,z0-len/2);
    for(const sx of [-1,1]) bin.add(MAT.plaster(),TK.boxG(0.15,1.5,len,1.2),bx+sx*(hw-0.1),Y1+0.75,z0-len/2); bin.build(fb);
    for(const sx of [-1,1]){ const g=new THREE.Mesh(new THREE.PlaneGeometry(len,2.0),MAT.glass()); g.position.set(bx+sx*(hw-0.1),Y1+2.5,z0-len/2); g.rotation.y=Math.PI/2; fb.add(g); }
    // 點得到的橋面（看不見；點地移動、點一下走過去）
    for(const [w,dd,y,z,rx] of [[2*BR.half,F,Y1,z0-F/2,-Math.PI/2],[2*BR.half,Math.hypot(d,R),Y1+R/2,(zs0+zs1)/2,-Math.PI/2+tilt],[2*BR.half,F,Y1+R,za+F/2,-Math.PI/2]]){ const m=plane(w,dd,bx,y+0.01,z,rx,new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.userData.walkLv=BR.lv; m.userData.dyn=true; lv1.add(m); walkMeshes.push(m); }
    // 博雅那一端：南牆（門洞＝空橋的寬）＋門裡面一小段亮的門廳（只是看得到，走不進去；按門口的互動才換到博雅）
    { const yb=Y1+R, wm=M('#d9d5cb'), inM=M('#ece6da'), vb=new TK.Bin(), dw=BR.doorW;
      for(const sx of [-1,1]) vb.add(wm,TK.boxG(3.0,4.0,0.25,1.2),bx+sx*(dw/2+1.5),yb+1.6,za-0.12); vb.add(wm,TK.boxG(dw,4.0-BR.clear,0.25,1.2),bx,yb+BR.clear+(4.0-BR.clear)/2-0.4,za-0.12);
      for(const sx of [-1,1]) vb.add(inM,TK.boxG(0.15,3.0,2.2,1.2),bx+sx*(dw/2+0.4),yb+1.5,za-1.35); vb.add(inM,TK.boxG(dw+1.0,3.0,0.15,1.2),bx,yb+1.5,za-2.45); vb.build(lv1); lv1.add(plane(dw+1.0,2.4,bx,yb+3.0,za-1.35,Math.PI/2,MAT.plaster()));   /* 門廳的天花板只有朝下的一面（2026-10-20 LAWWW2-C：從博雅走過來，鏡頭剛好在門廳天花板上面，原本的方盒從上面看是一整片灰白、看不到人）*/
      lv1.add(plane(dw+0.8,2.3,bx,yb+0.004,za-1.35,-Math.PI/2,floorM)); }
    // 兩側窗外的景、燈
    for(const sx of [-1,1]){ const p=B3.outView('east',null,len+1.5,14,bx+sx*7,Y1+2.0,z0-len/2-0.75,-sx*Math.PI/2,20,lv1); outs.push(p); }
    { const l=new THREE.PointLight(0xfff4e6,3,14,2); l.position.set(bx,Y1+3.0,z0-len/2); l.userData.on=5; l.userData.off=3; zone.group.add(l); lights.push(l);
      const l2=new THREE.PointLight(0xfff4e6,2,6,2); l2.position.set(bx,Y1+R+2.6,za-1.3); l2.userData.on=3; l2.userData.off=2; zone.group.add(l2); lights.push(l2); }
    E.interactables.push({x:bx,z:za+0.45,radius:0.8,lv:BR.lv,label:BR.label,exit:{to:BR.to,spawn:Object.assign({},BR.spawn)}});
    if(BR.glb&&typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.manifest[BR.glb]) ASSETS.loadOne(BR.glb).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const sc=c.scene.clone(true); sc.position.set(bx,Y1,z0); sc.traverse(o=>{ if(o.isMesh){ o.receiveShadow=true; o.userData.dyn=true; } }); lv1.add(sc); fb.visible=false; zone.bridgeGLB=true; }).catch(e=>console.warn('空橋正式模型載入失敗，用備用模型',e)); }
  /* ---- 往空橋的開口外面（博雅二樓南牆 linkDoor）：放同一座空橋的正式模型，只是看得到（2026-10-20 LAWWW2-C，使用者「連通道可以走 只是要經過一個門 跟現實不符」）：
     站在博雅二樓往南看，開口外面就是整條空橋、盡頭是普通的門；按開口的互動照舊換區域（落在普通那一邊的空橋上）。
     位置照對面那棟的 L.bridge：空橋模型的原點在普通那一端的門口地板（往 −z 走 len 到博雅那一端、地板高 rise）---- */
  function buildLinkView(E,L,lv1,zone){ for(const r of L.rooms){ const ld=r.linkDoor; if(!ld||!r.link||!LAYOUTS[r.link.to]) continue; let BR=null; try{ BR=LAYOUTS[r.link.to]().bridge; }catch(e){ continue; } if(!BR||!BR.glb) continue;   /* 對面那棟的配置沒載入（只載一棟的單元測試）就不放 */
      const yb=L.floors[r.lv|0].y, sgn=ld.z>0?1:-1, ox=ld.x, oy=yb-BR.rise, oz=ld.z+sgn*BR.len;
      { const p=new THREE.Mesh(new THREE.PlaneGeometry(BR.doorW+1.2,3.0),M('#ece6da')); p.position.set(ox,oy+1.5,oz+sgn*0.6); if(sgn<0) p.rotation.y=Math.PI; p.rotation.y+=Math.PI; lv1.add(p); }   /* 盡頭（普通的門裡面）：一面亮的牆 */
      if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.manifest[BR.glb]) ASSETS.loadOne(BR.glb).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const sc=c.scene.clone(true); sc.position.set(ox,oy,oz); if(sgn<0) sc.rotation.y=Math.PI; sc.traverse(o=>{ if(o.isMesh){ o.receiveShadow=true; o.userData.dyn=true; } }); lv1.add(sc); }).catch(e=>console.warn('空橋（從博雅看出去）載入失敗',e)); } }
  // ---- 窗外的景（B3.outView；照片還沒拍的用程序化的景）----
  function windowViews(L,lv0,lv1,outs){ const W=L.W, D=L.D, T=L.wallT;
    for(const w of L.windows){ const grp=w.lv?lv1:lv0, a=(w.a0+w.a1)/2, len=w.a1-w.a0, h=w.y1-w.y0, yc=(w.y0+w.y1)/2-(w.lv?L.floors[1].y:0);
      const z=w.wall==='S'?D/2-T/2-0.03:-D/2+T/2+0.03, ry=w.wall==='S'?Math.PI:0; const p=B3.outView(w.wall==='S'?'south':'east',w.photo,len,h,a,(w.lv?L.floors[1].y:0)+yc,z,ry,20,grp); const U=p.material&&p.material.uniforms; if(w.photoWide&&U&&U.sxy) U.sxy.value.set(0.5,1); outs.push(p); } }   /* photoWide：照片水平約 127°（4:1，tools/blender/env_second/shots/teach_views.py），長窗斜著看不會跑出照片的左右邊 */
  // ---- 區域 ----
  function makeZone(id){ return { id, get name(){ return LAYOUTS[id]().name; }, indoor:true, camDist:4.6, build(E){ const L=LAYOUTS[id](), W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], slabs=[], outs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const innerM=M('#ece6da'); innerM.userData.seeThrough=true;   /* 隔間、走廊牆擋住鏡頭時網點透空 */
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},seeThru:true,layout:L,
      fadeWalls(cam){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position);   /* 正式模型的牆（B3.attachFormal）頂點是世界座標、position 是原點：用包圍盒中心 */ const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs) B3.setOutView(o,h,weather,night); },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; },
      roomAt(x,z,lv){ for(const r of L.rooms){ if((r.lv|0)!==(lv|0)) continue; if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1) return r.id; } for(const a of (L.areas||[])){ if((a.lv|0)===(lv|0)&&x>a.x0&&x<a.x1&&z>a.z0&&z<a.z1) return a.id; } return 'hall'; },   /* 房間 → 範圍（areas）→ 大廳 */
      spaceAt(x,z,lv){ for(const r of L.rooms){ if((r.lv|0)!==(lv|0)) continue; if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1) return r.id; } return 'public'; } };   /* 同一個空間嗎：關起來的房間各自一間，走廊、門廳、自習區這些開放的地方算同一個（events3d.js「在她附近」用）*/
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs,innerM); buildFurniture(E,L,lv0,lv1,fb0,fb1,zone); windowViews(L,lv0,lv1,outs);
    const lights=[]; buildBridge(E,L,lv1,walkMeshes,zone,outs,lights); buildLinkView(E,L,lv1,zone);
    zone.camCols=camColliders(L,g);   /* 跟隨鏡頭撞到隔間牆就拉近（LAWWW2 審查 P1）*/
    // 樓梯可以點的面（點一跑樓梯＝走完那一跑，engine3d.js 任務 #42）
    for(const s of [ss.a,ss.ld,ss.b,ss.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.top)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      const ax=(S.A.x0+S.A.x1)/2, bx=(S.B.x0+S.B.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===ss.a) m.userData.stairEnds=[{x:ax,z:S.A.z1+0.5,lv:0},{x:ax,z:ldz,lv:0}]; if(s===ss.b) m.userData.stairEnds=[{x:bx,z:ldz,lv:0},{x:bx,z:S.B.z1+0.6,lv:1}]; }
    for(const [x,y,z,on,off] of L.lights){ const l=new THREE.PointLight(0xfff4e6,off,16,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    lightPool(zone,g,lights);
    zone.teacherSpots={}; for(const r of L.rooms){ const lc=r.lectern; if(!lc||r.stage!=='S') continue; const bx=r.board?r.board.x:(r.x0+r.x1)/2, sx=bx<lc.x?-1:1;   /* 階梯教室（講台在南邊）：老師站在講桌靠黑板中間那一側、面向座位（-z）；story3d.js 的作息（CLS.profWhere）用 */
      zone.teacherSpots[r.id]={x:lc.x+sx*(lc.w/2+0.45),z:lc.z+0.2,yaw:Math.PI,lv:r.lv|0}; }
    /* 室內正式模型（LAWWW2-C teach_interior.py → ASSETS 'bldg.<id>_interior'；普通、博雅，2026-10-18 ART-EXT-TEACH）：和法圖、萬才館同一套接法（B3.attachFormal：L0_root／L1_root、WALL_*）；
       隔間牆（tb_partition）擋住鏡頭時照樣網點透空。導航、座位、互動點、桌椅都不變；載入前、載入失敗照舊是備用模型 */
    zone.formal=false; { const GK='bldg.'+id+'_interior'; if(typeof ASSETS!=='undefined'&&ASSETS.manifest&&ASSETS.manifest[GK]) ASSETS.loadOne(GK).then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true);
      B3.attachFormal(zone,root,fb0,fb1,lv0,lv1,walls,walkMeshes);
      /* 階梯教室的長桌、翻椅在正式模型裡（BOYA-LM-1030，LAWWW2-B 10-30；SEATPANS＝所有椅面一個網格）：藏起備用的方塊桌椅；沒有人坐的椅面掀起來（Z3.seatFold，和法律系館A 201 同一套）*/
      if(lv0.getObjectByName('SEATPANS')){ for(const f of zone.lectFurn||[]) f.visible=false; if(Z3.seatFold) Z3.seatFold(zone,lv0); }
      for(const r of [lv0,lv1]) r.traverse(o=>{ if(o.isMesh&&o.material&&/^tb_partition/.test(o.material.name||'')&&!o.material.userData.seeThrough){ o.material.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(o.material); } });
    }).catch(e=>console.warn(L.name+' 室內正式模型載入失敗，用備用模型',e)); }
    const EN=L.entrance; E.interactables.push({x:EN.exit.x,z:EN.exit.z,radius:EN.exit.r,lv:0,label:'走出'+L.name,exit:{to:'campus',spawn:EN.campus?Object.assign({},EN.campus):undefined}});   /* campus 還沒定（博雅：校園的位置等使用者決定）＝校園的預設出生點 */
    return zone; } }; }
  const ZONES={ gongtong:makeZone('gongtong') }; if(typeof BOYA_LAYOUT!=='undefined') ZONES.boya=makeZone('boya'); if(typeof PUTONG_LAYOUT!=='undefined') ZONES.putong=makeZone('putong');
  return {ZONES,stairSurfs,buildNav,seatsOf,LAYOUTS,furnModule,CHAIR_FIT,LECT_DESK_TOP};
})();
for(const k in TB3.ZONES) Z3.ZONES[k]=TB3.ZONES[k];
