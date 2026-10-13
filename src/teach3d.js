/* ===== 公共教學館模板（D55 第二階段；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 2 節）=====
   一個模組蓋所有的教學館（第一棟：共同教學館；之後普通、博雅用同一套），配置寫在 layout JSON（src/data/gongtong_layout.js，
   產生器 tools/layout/gongtong_layout_gen.py）；LAWWW2 的 Blender 正式模型讀同一份，兩邊的位置一定一致。
   **室內沒有查證**：大廳、走廊、普通教室、樓梯、休息區、自習區是可替換的模板，不宣稱和真實建築相同。
   - 兩層（1F、2F）；U 形樓梯（A 跑從走廊往北爬到平台，B 跑往南爬回二樓走廊；B 跑與最上面一階兩層共用，D36）。
   - 房間在同一個區域裡（不是各自一個區域）：看得到人從走廊走進教室、下課走出來。
   - 教室座位、休息區、自習區、長椅都可以坐（坐下讀書、坐一下）；關著的房間有門、互動寫清楚（不用隱形牆）；三樓以上「整修中」。
   - 牆、隔間擋住鏡頭時網點透空（zone.seeThru）。正式模型還沒有：用程序化備用模型（BLOCKOUT）。 */
'use strict';
const TB3=(function(){
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const LAYOUTS={ gongtong:()=>GONGTONG_LAYOUT };
  // ---- 樓梯的高度（法圖 lawlib3d.js 的做法；這裡 A 跑往北爬：最下面一階在南邊 z1）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, A=S.A, B=S.B, LD=S.landing;
    if(S.dir==='N') return { a:{x0:A.x0,x1:A.x1,z0:A.z0+t/2,z1:A.z1,axis:'z',ya:A.risers*r,yb:0,tread:t,rise:r,low:'z1'},
      ld:{x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:A.z0+t/2,y:LD.y},
      b:{x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1-t/2,axis:'z',ya:LD.y,yb:LD.y+B.risers*r,tread:t,rise:r,low:'z0'},
      top:{x0:B.x0,x1:B.x1,z0:B.z1-t/2,z1:B.z1,y:LD.y+B.risers*r} };
    return LL3.stairSurfs(L); }
  // ---- 座位：教室、休息區、自習區、長椅 ----
  function seatsOf(L){ const out=[]; for(const r of L.rooms) for(const s of (r.seats||[])) out.push(Object.assign({kind:'class'},s));
    for(const s of (L.lounge?L.lounge.seats:[])) out.push(Object.assign({kind:'lounge'},s));
    for(const t of (L.study?L.study.tables:[])) for(const s of t.seats) out.push(Object.assign({kind:'study'},s));
    for(const b of (L.benches||[])) out.push({x:b.x+Math.sin(b.ry)*0.06,z:b.z+Math.cos(b.ry)*0.06,yaw:b.ry,lv:b.lv,kind:'bench',label:b.label,room:'hall'});
    return out; }
  const wallSegs=w=>{ const horiz=Math.abs(w.z0-w.z1)<1e-6, a0=horiz?Math.min(w.x0,w.x1):Math.min(w.z0,w.z1), a1=horiz?Math.max(w.x0,w.x1):Math.max(w.z0,w.z1); const gs=(w.gaps||[]).slice().sort((p,q)=>p[0]-q[0]); const out=[]; let a=a0; for(const [g0,g1] of gs){ if(g0>a) out.push([a,g0]); a=Math.max(a,g1); } if(a<a1) out.push([a,a1]); return {horiz,segs:out}; };
  // ---- 導航：兩層 ----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, A=S.A, B=S.B, LD=S.landing; const ss=stairSurfs(L);
    const mk=()=>new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1); const nav0=mk(), nav1=mk().setFloor(Y1); const navs=[nav0,nav1];
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
      for(const d of (r.desks||[])) nav.blockRect(d.x,d.z,d.w,d.d,0,0.02); }
    for(const t of (L.lounge?L.lounge.tables:[])) navs[L.lounge.lv].blockCircle(t.x,t.z,t.r+0.08);
    for(const t of (L.study?L.study.tables:[])) navs[L.study.lv].blockRect(t.x,t.z,t.w,t.d,0,0.02);
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
    for(const x of [EN.a0,EN.a1]) b0.add(MAT.frame(),TK.boxG(0.1,2.65,0.16),x,1.325,D/2-0.12); b0.add(MAT.frame(),TK.boxG(EN.a1-EN.a0,0.1,0.16),(EN.a0+EN.a1)/2,2.6,D/2-0.12);
    // 窗框（景在牆的內側）
    for(const w of L.windows){ const bb=bins[w.lv], n=w.n, len=w.a1-w.a0, zz=w.wall==='S'?D/2-T/2-0.06:-D/2+T/2+0.06; for(let i=0;i<=n;i++) bb.add(MAT.frame(),TK.boxG(0.06,w.y1-w.y0,0.06),w.a0+len*i/n,(w.y0+w.y1)/2,zz); for(const y of [w.y0,w.y1]) bb.add(MAT.frame(),TK.boxG(len,0.08,0.08),(w.a0+w.a1)/2,y,zz); }
    // 天花板
    { const c0=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c0.rotation.x=Math.PI/2; c0.position.y=L.ceil0; fb0.add(c0);
      const c1=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c1.rotation.x=Math.PI/2; c1.position.y=RY; fb1.add(c1);
      for(const [lv,y] of [[0,L.ceil0],[1,RY]]) for(const x of [-9.6,-6.0,-1.2,1.2,6.0,9.6]) for(const z of [-5.2,-2.0,1.0,4.6]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.3),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(x,y-0.01,z); (lv?fb1:fb0).add(p); } }
    b0.build(fb0); b1.build(fb1); }
  // ---- 家具（備用）＋互動點 ----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin(); const bins=[b0,b1];
    const up1=new THREE.Group(); up1.position.y=Y1; fb1.add(up1); const grpOf=lv=>lv?up1:fb0; const dummy={blockRect(){}};
    // 教室：黑板、講桌、學生桌；互動：看教室（門口）
    for(const r of L.rooms){ const y=r.lv?Y1:0, bb=bins[r.lv];
      if(r.kind==='closed'){ const dz=r.z0; const dx=(r.door[0]+r.door[1])/2; bb.add(MAT.woodD(),TK.boxG(r.door[1]-r.door[0]-0.1,2.3,0.06),dx,y+1.15,dz-0.13); IT.push({x:dx,z:dz-0.9,radius:1.0,lv:r.lv,label:r.label,look:r.look}); continue; }
      if(r.kind!=='classroom') continue;
      const s=r.board==='W'?1:-1; bb.add(M('#2f4a3a',{rough:0.6}),TK.boxG(0.04,1.2,r.blackboard.len),r.blackboard.x,y+1.6,r.blackboard.z); bb.add(MAT.frame(),TK.boxG(0.06,0.08,r.blackboard.len+0.1),r.blackboard.x+s*0.02,y+0.98,r.blackboard.z);
      bb.add(MAT.woodD(),TK.boxG(r.teacher.w,0.95,r.teacher.d),r.teacher.x,y+0.475,r.teacher.z);
      for(const d of r.desks) Z3.desk(grpOf(r.lv),dummy,d.x,d.z,Math.PI/2,d.d,d.w,'#c9b48f');
      const door=r.doorFront; IT.push({x:(door[0]+door[1])/2,z:-0.95,radius:0.9,lv:r.lv,label:'看看'+r.label+' 教室',room:r.id,look:'共同 '+r.id+'：一般教室，黑板、講桌、兩人一張的桌子。門邊的課表每學期換一次。'}); }
    // 休息區：小圓桌；自習區：小桌子
    if(L.lounge) for(const t of L.lounge.tables){ const g=grpOf(L.lounge.lv); const top=new THREE.Mesh(new THREE.CylinderGeometry(t.r,t.r,0.04,18),M('#d9cdb8',{rough:0.5})); top.position.set(t.x,0.74,t.z); g.add(top); const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.18,0.72,10),M('#3a3f46')); leg.position.set(t.x,0.36,t.z); g.add(leg); }
    if(L.study) for(const t of L.study.tables) Z3.desk(grpOf(L.study.lv),dummy,t.x,t.z,0,t.w,t.d,'#b08a62','wood');
    // 長椅、公告欄、指標
    for(const b of (L.benches||[])){ const bench=W3.formalBench?W3.formalBench():null; if(bench){ bench.position.set(b.x,0,b.z); bench.rotation.y=b.ry; grpOf(b.lv).add(bench); } else bins[b.lv].add(MAT.wood(),TK.boxG(1.5,0.45,0.45),b.x,(b.lv?Y1:0)+0.225,b.z,b.ry); }
    for(const bd of (L.boards||[])){ const bb=W3.bulletin(); bb.position.set(bd.x,0,bd.z); bb.rotation.y=bd.ry; grpOf(bd.lv).add(bb); IT.push({x:bd.x+Math.sin(bd.ry)*0.9,z:bd.z+Math.cos(bd.ry)*0.9,radius:1.0,lv:bd.lv,label:bd.label,look:bd.look,board:true}); }
    for(const sg of (L.signs||[])){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(sg.w,sg.w*0.16),new THREE.MeshBasicMaterial({map:TK.signTex(sg.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(sg.x,sg.y,sg.z); sp.rotation.y=sg.ry||0; (sg.lv?lv1:lv0).add(sp); }
    { const S=L.stair; const sp=new THREE.Mesh(new THREE.PlaneGeometry(2.4,0.38),new THREE.MeshBasicMaterial({map:TK.signTex(S.sign,{bg:'#5a2a22',color:'#f3efe4'})})); sp.position.set((S.B.x0+S.B.x1)/2,Y1+2.3,S.B.z1+0.02); lv1.add(sp);
      IT.push({x:(S.B.x0+S.B.x1)/2,z:S.B.z1+0.5,radius:0.8,lv:1,label:'往 3F',look:'往 3F 的樓梯口拉著一條鍊子：「整修中，暫停開放」。'}); }
    // 座位
    const seats=zone.seats=seatsOf(L);
    for(const st of seats){ if(st.kind==='class'||st.kind==='lounge'||st.kind==='study') Z3.chair(grpOf(st.lv),st.x,st.z,st.yaw,st.kind==='class'?'#5a6470':'#8a6a4a');
      const label=st.kind==='class'?'坐下':(st.kind==='study'?'坐下讀書（自習區）':(st.kind==='lounge'?'坐下（休息區）':(st.label||'坐下')));
      IT.push({x:st.x,z:st.z,radius:0.8,lv:st.lv,label,seat:st,study:st.kind!=='bench'}); }
    b0.build(fb0); b1.build(fb1); return seats; }
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
      roomAt(x,z,lv){ for(const r of L.rooms){ if((r.lv|0)!==(lv|0)) continue; if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1) return r.id; } if(L.study&&(lv|0)===L.study.lv&&z>2.4&&x<-3.6) return 'study'; if(L.lounge&&(lv|0)===L.lounge.lv&&z>2.4&&x<-3.6) return 'lounge'; return z>-0.4&&z<2.4?'corridor':'hall'; } };
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs,innerM); buildFurniture(E,L,lv0,lv1,fb0,fb1,zone); windowViews(L,lv0,lv1,outs);
    // 樓梯可以點的面（點一跑樓梯＝走完那一跑，engine3d.js 任務 #42）
    for(const s of [ss.a,ss.ld,ss.b,ss.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.top)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      const ax=(S.A.x0+S.A.x1)/2, bx=(S.B.x0+S.B.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===ss.a) m.userData.stairEnds=[{x:ax,z:S.A.z1+0.5,lv:0},{x:ax,z:ldz,lv:0}]; if(s===ss.b) m.userData.stairEnds=[{x:bx,z:ldz,lv:0},{x:bx,z:S.B.z1+0.6,lv:1}]; }
    const lights=[]; for(const [x,y,z,on,off] of L.lights){ const l=new THREE.PointLight(0xfff4e6,off,16,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    const EN=L.entrance; E.interactables.push({x:EN.exit.x,z:EN.exit.z,radius:EN.exit.r,lv:0,label:'走出'+L.name,exit:{to:'campus',spawn:Object.assign({},EN.campus)}});
    return zone; } }; }
  const ZONES={ gongtong:makeZone('gongtong') };
  return {ZONES,stairSurfs,buildNav,seatsOf,LAYOUTS};
})();
for(const k in TB3.ZONES) Z3.ZONES[k]=TB3.ZONES[k];
