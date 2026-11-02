/* ===== 總圖大廳第二版（LIB-INTERIOR-1102 一樓，LAWWW2 帳號 A 2026-11-02）=====
   使用者 11-02：08:58「舊有的空間配置 能用的就沿用 按造實際配置安排」＋1F 平面圖；09:01「總圖一樓」兩張照片：
     ① 中庭——深灰地毯走道、兩旁亮燈的木頭展示櫃，盡頭一整片木頭「台階書牆」（坐的大階梯＋中間走的樓梯，階梯立面是書架）上二樓，兩側二樓迴廊玻璃欄杆；
     ② 展演廳——半圓形、挑高兩層、一圈高窗、淺色木地板、弧形矮展示櫃、一圈弧形軌道燈。
   配置：src/data/library_layout.js 的 version 2（tools/blender/env_second/library_hall_v2_layout.py 產生）；
   正式模型：tools/blender/env_second/library_hall_v2.py → assets/models/env/second_ai/library_hall_v2.glb（bldg.library_hall_v2，這支自己登記）。
   這支只在 LIBRARY_LAYOUT.version===2 時接手 library_hall 的 build（src/library3d.js 開頭轉過來）；第一版（帝國式大樓梯）的程式照舊在 library3d.js。
   沿用第一版（LB3 匯出）：家具（buildFurniture：置物櫃、服務台、影印機、閘門旁的小擺設、二樓長桌＝小安「總圖的下午」的座位…）、電梯樓層、窗景照片。
   新的：台階書牆（中間走的那一跑兩層共用，和第一版兩側那一跑同一套：D36）、二樓北側連廊、展演廳（半圓）、一樓的四人桌／電腦桌／圓桌（座位）。 */
'use strict';
const LBV2=(function(){
  const LAYOUT=()=>LIBRARY_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  if(typeof ASSETS!=='undefined'&&ASSETS.manifest) ASSETS.manifest['bldg.library_hall_v2']={url:'assets/models/env/second_ai/library_hall_v2.glb',type:'building',lazy:true,
    source:'本作 Blender 腳本 tools/blender/env_second/library_hall_v2.py（總圖大廳第二版：台階書牆、展演廳、共享區、數位媒體區；配置 library_hall_v2_layout.py；照使用者 11-02 的 1F 平面圖與兩張照片，遊戲化設計、不是實測；貼圖 Poly Haven CC0）',license:'本作；貼圖 CC0'};

  // ---- 台階書牆：中間走的那一跑（連續斜面給找路與碰撞；畫面上一階一階：tread／rise／low）＋最上面半階（和二樓北側連廊同高）----
  function stairSurfs(L){ const B=L.bookstair, K=B.walk, Y1=L.floors[1].y, t=K.tread;
    const flight={x0:K.x0,x1:K.x1,z0:B.z0+t/2,z1:B.z1,axis:'z',ya:Y1,yb:0,tread:t,rise:K.rise,low:'z1'};
    const top={x0:K.x0,x1:K.x1,z0:B.z0,z1:B.z0+t/2,y:Y1};
    return {flight,top,all:[flight,top]}; }
  const inRot=(R,x,z,pad)=>z<=R.cz+1e-6&&Math.hypot(x-R.cx,z-R.cz)<=R.r-pad;

  // ---- 導航：兩層（範圍 navBox：大廳＋北牆外的展演廳）----
  function buildNav(L){ const B=L.bounds, NB=L.navBox, Y1=L.floors[1].y, BS=L.bookstair, K=BS.walk, U=L.upper, EL=L.elevator, V=L.vestibule, GT=L.gates, R=L.rotunda, T=L.wallT;
    const mk=()=>new E3.NavGrid(NB.x1-NB.x0,NB.z1-NB.z0,L.cell,NB.x0,NB.z0); const nav0=mk(), nav1=mk().setFloor(Y1); const ss=stairSurfs(L);
    // 一樓：大廳（長方形）＋展演廳（半圓），其他擋起來
    nav0.fillBlocked(); nav0.freeRect(B.x0+0.4,B.z0+0.4,B.x1-0.4,B.z1-0.4);
    for(let cz=0;cz<nav0.rows;cz++) for(let cx=0;cx<nav0.cols;cx++){ const [x,z]=nav0.toWorld(cx,cz); if(z>=B.z0+0.4) continue;
      const opening=x>R.open.x0+0.3&&x<R.open.x1-0.3&&z>=B.z0-0.3, room=z<B.z0-0.2&&inRot(R,x,z,0.35); if(opening||room) nav0.b[nav0.idx(cx,cz)]=0; }   /* 北牆（z −17）只在展演廳的開口那一段打通 */
    for(const s of ss.all) nav0.addSurf(Object.assign({},s));
    for(const sx of [-1,1]) nav0.blockRect(sx*(K.x1+BS.x1)/2,(BS.z0+BS.z1)/2,BS.x1-K.x1,BS.z1-BS.z0+0.04,0);   // 兩側坐的大階梯（一階 42 cm，走不上去）
    nav0.blockRect(0,BS.z0-0.15,BS.x1-BS.x0+0.04,0.3,0);                                                         // 台階背面（最上面一階後面是一樓的地面：5 m 落差）
    for(const [x,z] of [[-5.2,U.band.z1],[5.2,U.band.z1],[-5.2,GT.z],[5.2,GT.z],[-5.2,U.north.z1],[5.2,U.north.z1]]) nav0.blockCircle(x,z,0.62);   // 柱子（中庭四角＋北側連廊下面兩根）
    for(const sx of [-1,1]) nav0.blockRect(sx*V.x1,(V.z0+V.z1)/2,0.24,V.z1-V.z0+0.1,0);                          // 門廳兩側的牆
    for(const px of GT.posts) nav0.blockRect(px,GT.z,GT.postW,GT.postD,0);                                       // 入口閘門
    { const ep=GT.posts[GT.posts.length-1]; for(const sx of [-1,1]) nav0.blockRect(sx*(ep+V.x1)/2,GT.z,V.x1-ep,0.24,0); }
    // 二樓：先整層擋起來，再開出南側連廊、北側連廊、兩翼、台階中間那一跑
    nav1.fillBlocked(); for(const a of [U.band,U.north].concat(U.wings)) nav1.freeRect(a.x0,a.z0,a.x1,a.z1);
    nav1.freeRect(K.x0,BS.z0,K.x1,BS.z1); for(const s of ss.all) nav1.addSurf(Object.assign({},s));
    for(const r of L.rails){ const [x0,z0,x1,z1]=r, horiz=Math.abs(z1-z0)<1e-6; nav1.blockRect((x0+x1)/2,(z0+z1)/2,horiz?Math.abs(x1-x0)+0.04:0.3,horiz?0.3:Math.abs(z1-z0)+0.04,0); }
    nav1.freeRect(K.x0,U.north.z1-0.25,K.x1,U.north.z1+0.25);                                                     // 台階上來接北側連廊（欄杆在那裡開口）
    for(const [x,z] of [[-5.2,U.band.z1],[5.2,U.band.z1],[-5.2,GT.z],[5.2,GT.z],[-5.2,U.north.z1],[5.2,U.north.z1]]) nav1.blockCircle(x,z,(x>0&&z===U.north.z1)?0.2:0.38);   // 柱子一直到屋頂：二樓也擋（中庭四角＋北側連廊邊上）。二樓那一段細（r 0.26，一樓連柱座 0.36）：擋 0.38 就好——0.62 會把東側走道（x 3.7～5.2，1.5 m 寬）在柱子那裡擠到 0.7 m，走不過去；東北那一根在多媒體中心的牆線上（x 5.2），只擋它自己那一格
    for(const nav of [nav0,nav1]){ nav.blockRect(EL.x0-0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect(EL.x1+0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect((EL.x0+EL.x1)/2,EL.z1+0.1,EL.x1-EL.x0+0.44,0.24,0); }   // 電梯井道玻璃（和第一版一樣）
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 第二版的新家具：一樓四人桌、電腦桌、圓桌（有座位）、二樓雙面書架；其他照第一版的 buildFurniture ----
  function furniture2(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone){ const IT=E.interactables, seats=zone.seats||(zone.seats=[]); const b0=new TK.Bin(), b1=new TK.Bin();
    const up1=new THREE.Group(); up1.position.y=L.floors[1].y; fb1.add(up1);   /* 椅子放進備用群組（正式模型載入後跟著藏起來）；二樓的 Z3.chair 以地面為準 */
    for(const f of L.furniture){ const lv=f.lv|0, nav=lv?nav1:nav0, y=lv?L.floors[1].y:0, b=lv?b1:b0, fb=lv?fb1:fb0, grp=lv?up1:fb0;
      if(f.type==='groupTable'){ b.add(M('#c9a57a',{rough:0.6}),TK.boxG(f.w,0.05,f.d),f.x,y+0.73,f.z); b.add(M('#3a3f45',{rough:0.5}),TK.boxG(0.08,0.7,0.08),f.x,y+0.35,f.z);
        nav.blockRect(f.x,f.z,f.w+0.1,f.d+0.1,0,0);
        for(const s of [-1,1]) for(const dx of [-f.w/4,f.w/4]){ const cz=f.z+s*(f.d/2+0.42), yaw=s>0?Math.PI:0, seat={x:f.x+dx,z:cz,yaw,lv}; Z3.chair(grp,seat.x,cz,yaw,'#5d6a74'); seats.push(seat); IT.push({x:seat.x,z:cz,radius:0.8,lv,label:'坐下',seat}); } }
      else if(f.type==='pcDesk'){ b.add(M('#e4e0d8',{rough:0.6}),TK.boxG(f.w,0.04,f.d),f.x,y+0.74,f.z); for(let i=0;i<(f.seats||4);i++){ const sx=f.x-f.w/2+(i+0.5)*f.w/(f.seats||4); b.add(M('#202326',{rough:0.4}),TK.boxG(0.55,0.36,0.04),sx,y+1.0,f.z-f.d/2+0.12); }
        nav.blockRect(f.x,f.z,f.w+0.1,f.d+0.1,0,0);
        for(let i=0;i<(f.seats||4);i++){ const sx=f.x-f.w/2+(i+0.5)*f.w/(f.seats||4), cz=f.z+f.d/2+0.42, seat={x:sx,z:cz,yaw:Math.PI,lv}; Z3.chair(grp,sx,cz,Math.PI,'#2e3440'); seats.push(seat); IT.push({x:sx,z:cz,radius:0.8,lv,label:'坐下（用電腦）',seat}); } }
      else if(f.type==='stack'){ const d=f.d||0.62, h=f.h||2.1, cap=M(f.cap||'#888888',{rough:0.5});   /* 二樓的雙面書架（平面圖：西半邊中日韓文、東半邊西文）：備用模型＝木頭量體＋兩端色板 */
        b.add(B3.MAT.woodD(),TK.boxG(f.w,h,d),f.x,y+h/2,f.z); for(const e of [-1,1]) b.add(cap,TK.boxG(0.03,h,d+0.02),f.x+e*(f.w/2+0.015),y+h/2,f.z);
        nav.blockRect(f.x,f.z,f.w+0.06,d,0,0.05); }
      else if(f.type==='roundTable'){ b.add(M('#d8d2c6',{rough:0.6}),new THREE.CylinderGeometry(f.r,f.r,0.04,20),f.x,y+0.73,f.z); b.add(M('#3a3f45',{rough:0.5}),new THREE.CylinderGeometry(0.05,0.05,0.7,8),f.x,y+0.35,f.z);
        nav.blockCircle(f.x,f.z,f.r+0.25);
        for(let i=0;i<(f.seats||3);i++){ const a=i*2*Math.PI/(f.seats||3)+Math.PI/6, cx=f.x+Math.sin(a)*(f.r+0.45), cz=f.z+Math.cos(a)*(f.r+0.45), yaw=a+Math.PI, seat={x:cx,z:cz,yaw,lv}; Z3.chair(grp,cx,cz,yaw,'#7a5a46'); seats.push(seat); IT.push({x:cx,z:cz,radius:0.8,lv,label:'坐下',seat}); } } }
    b0.build(fb0); b1.build(fb1); }

  // ---- 程序化備用模型（正式模型載入前、載入失敗時）----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,slabs){ const B=L.bounds, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, BS=L.bookstair, K=BS.walk, SE=BS.seats, U=L.upper, V=L.vestibule, R=L.rotunda, MAT=B3.MAT;
    const b0=new TK.Bin(), b1=new TK.Bin(); const W=B.x1-B.x0, Dd=B.z1-B.z0, cz=(B.z0+B.z1)/2;
    const floorM=(w,d,c)=>{ const tx=W3.stoneTex(c||'#e3d9c6').clone(); tx.needsUpdate=true; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:tx,roughness:0.65}); };
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,Dd),floorM(W,Dd)); f.rotation.x=-Math.PI/2; f.position.set(0,0,cz); f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f);
      const rf=new THREE.Mesh(new THREE.CircleGeometry(R.r,32,0,Math.PI),floorM(2*R.r,R.r,'#d8c4a0')); rf.rotation.x=-Math.PI/2; rf.position.set(R.cx,0.002,R.cz); rf.userData.walkLv=0; fb0.add(rf); walkMeshes.push(rf);   /* 展演廳：淺色木地板 */
      const cp=new THREE.Mesh(new THREE.PlaneGeometry(5.2,V.z0-BS.z1),new THREE.MeshStandardMaterial({color:0x3e4247,roughness:0.95})); cp.rotation.x=-Math.PI/2; cp.position.set(0,0.004,(BS.z1+V.z0)/2); fb0.add(cp); }   /* 中庭的深灰地毯走道（照片 1：從閘門到台階）*/
    const slab=(a)=>{ for(const q of B3.slabPieces(a,[L.elevator])){ b1.add(MAT.plaster(),TK.boxG(q.x1-q.x0,ST,q.z1-q.z0,1.2),(q.x0+q.x1)/2,Y1-ST/2,(q.z0+q.z1)/2);
        const f=new THREE.Mesh(new THREE.PlaneGeometry(q.x1-q.x0,q.z1-q.z0),floorM(q.x1-q.x0,q.z1-q.z0)); f.rotation.x=-Math.PI/2; f.position.set((q.x0+q.x1)/2,Y1+0.004,(q.z0+q.z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f); }
      if(slabs) slabs.push(...B3.slabPieces(a,[L.elevator],{lv:1,y:Y1,t:ST})); };
    { const EL=L.elevator; const f=new THREE.Mesh(new THREE.PlaneGeometry(EL.x1-EL.x0,EL.z1-EL.z0),new THREE.MeshBasicMaterial({visible:false})); f.rotation.x=-Math.PI/2; f.position.set((EL.x0+EL.x1)/2,Y1+0.004,(EL.z0+EL.z1)/2); f.userData.walkLv=1; f.userData.dyn=true; lv1.add(f); walkMeshes.push(f); }
    for(const a of [U.band,U.north].concat(U.wings,U.closed||[])) slab(a);
    // 台階書牆：中間走的樓梯一階一塊（木頭）、兩側坐的大階梯一階一塊（立面是書架：深色）
    const wood=M('#b98a58',{rough:0.55}), woodD=M('#6b4a30',{rough:0.6}), Y=Y1;
    for(let k=0;k<K.risers;k++){ const top=(k+1)*K.rise, z1=BS.z1-k*K.tread; b0.add(wood,TK.boxG(K.x1-K.x0,top,K.tread),(K.x0+K.x1)/2,top/2,z1-K.tread/2); }
    for(const sx of [-1,1]) for(let k=0;k<SE.risers;k++){ const top=(k+1)*SE.rise, z1=BS.z1-k*SE.tread, xa=sx<0?BS.x0:K.x1, xb=sx<0?K.x0:BS.x1; b0.add(wood,TK.boxG(xb-xa,0.06,SE.tread),(xa+xb)/2,top-0.03,z1-SE.tread/2); b0.add(woodD,TK.boxG(xb-xa,top-0.06,SE.tread),(xa+xb)/2,(top-0.06)/2,z1-SE.tread/2); }
    // 欄杆：玻璃欄板（二樓的挑空邊）
    for(const r of L.rails){ const [x0,z0,x1,z1]=r, len=Math.hypot(x1-x0,z1-z0); if(len<0.05) continue; const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.95),MAT.glass()); gp.position.set((x0+x1)/2,Y+0.55,(z0+z1)/2); gp.rotation.y=-Math.atan2(z1-z0,x1-x0); gp.userData.noMerge=true; lv1.add(gp); b1.add(MAT.steel(),TK.boxG(len,0.05,0.05),(x0+x1)/2,Y+1.03,(z0+z1)/2,-Math.atan2(z1-z0,x1-x0)); }
    // 柱子
    for(const [x,z] of [[-5.2,U.band.z1],[5.2,U.band.z1],[-5.2,L.gates.z],[5.2,L.gates.z],[-5.2,U.north.z1],[5.2,U.north.z1]]){ b0.add(M('#d9cbb0'),new THREE.CylinderGeometry(0.3,0.3,Y1-ST,16),x,(Y1-ST)/2,z); b1.add(M('#d9cbb0'),new THREE.CylinderGeometry(0.26,0.26,RY-Y1,16),x,Y1+(RY-Y1)/2,z); }
    // 外牆（兩層一層一塊；淡出用 dir＝朝裡）＋展演廳的弧牆（一段一段）
    const wall=(x,z,w,h,y,ry,dir,m,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const wallM=M('#ece4d6');
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){
      for(const sx of [-1,1]) wall(sx*(R.open.x1+B.x1)/2,B.z0,B.x1-R.open.x1,h,y,0,new THREE.Vector3(0,0,1),wallM,grp);   // 北牆（中間是展演廳的開口）
      wall(B.x0,cz,Dd,h,y,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); wall(B.x1,cz,Dd,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),wallM,grp);
      for(const sx of [-1,1]) wall(sx*(V.x1+B.x1)/2,B.z1,B.x1-V.x1,h,y,0,new THREE.Vector3(0,0,-1),wallM,grp); }
    { const n=14; for(let i=0;i<n;i++){ const a0=Math.PI*i/n, a1=Math.PI*(i+1)/n, am=(a0+a1)/2, w=2*R.r*Math.sin(Math.PI/n/2)+0.05; const x=R.cx+Math.cos(am)*R.r, z=R.cz-Math.sin(am)*R.r;
      wall(x,z,w,RY,0,am+Math.PI/2,new THREE.Vector3(-Math.cos(am),0,Math.sin(am)),wallM,fb0); } }   /* 盒子的 x 軸轉 am+90° ＝弧的切線方向；dir＝朝圓心 */
    for(const sx of [-1,1]) b0.add(MAT.woodD(),TK.boxG(0.2,3.0,V.z1-V.z0),sx*V.x1,1.5,(V.z0+V.z1)/2);   // 門廳兩側的牆
    // 天花板（屋頂 9.6；展演廳一片半圓）
    { const c=new THREE.Mesh(new THREE.PlaneGeometry(W,Dd),MAT.ceil()); c.rotation.x=Math.PI/2; c.position.set(0,RY,cz); fb1.add(c);
      const rc=new THREE.Mesh(new THREE.CircleGeometry(R.r,32,Math.PI,Math.PI),MAT.ceil()); rc.rotation.x=Math.PI/2; rc.position.set(R.cx,RY,R.cz); fb1.add(rc); }   /* 下半圓（local y<0）轉 +90° 後在 z<cz（北邊）、面朝下 */
    // 窗外的景（備用模型：牆的內側貼一張）
    const outPlane=(w,h,x,y,z,ry,grp,kind)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:LB3.outsideTex(false)})); m.position.set(x,y,z); m.rotation.y=ry; m.userData.libOut=true; m.userData.view=kind||'lawn'; grp.add(m); outs.push(m); return m; };
    for(const [grp,y0] of [[lv0,1.1],[lv1,Y1+1.0]]) for(const z of L.windowsV2.xWallZ){ if(grp===lv0&&L.b1Door&&Math.abs(z-L.b1Door.z)<0.6) continue; outPlane(1.6,2.4,B.x0+T/2+0.02,y0+1.2,z,Math.PI/2,grp,'lawn'); }
    for(const deg of L.windowsV2.rotundaDeg){ const a=(90-deg)*Math.PI/180, x=R.cx+Math.cos(a)*(R.r-0.12), z=R.cz-Math.sin(a)*(R.r-0.12); outPlane(1.5,3.4,x,2.6,z,Math.atan2(-Math.cos(a),Math.sin(a)),lv0,'lawn'); }   /* 平面朝圓心（local +z → (−cos a, sin a)）*/
    { const gw=V.x1-V.x0, gh=RY-0.2; const gp=new THREE.Mesh(new THREE.PlaneGeometry(gw,gh),MAT.glass()); gp.position.set(0,gh/2,B.z1-0.02); gp.rotation.y=Math.PI; lv0.add(gp); outPlane(gw+8,RY+2,0,RY/2,B.z1+3.0,Math.PI,lv0,'avenue'); }
    b0.build(fb0); b1.build(fb1); }

  // ---- 有景深的窗景（正式模型載入後；牆有窗洞）：西、東兩排窗（兩層）、展演廳的高窗、正面的玻璃帷幕 ----
  function parallaxViews(zone,L,lv0,lv1){ const B=L.bounds, Y1=L.floors[1].y, RY=L.roofY, R=L.rotunda, V=L.vestibule, PO=zone.pOuts=[]; const Dd=B.z1-B.z0, cz=(B.z0+B.z1)/2;
    const mk=(w,h,x,y,z,ry,grp,kind,depth)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),W3.windowMat(depth)); m.material.uniforms.sxy.value.set(1,0.5); m.position.set(x,y,z); m.rotation.y=ry; m.userData.view=kind; m.userData.libOut=true; grp.add(m); PO.push(m); };
    for(const [sx,ry] of [[-1,Math.PI/2],[1,-Math.PI/2]]){ mk(Dd+2,3.6,sx*(B.x1+0.35),2.3,cz,ry,lv0,'lawn',14); mk(Dd+2,3.6,sx*(B.x1+0.35),Y1+2.2,cz,ry,lv1,'lawn',14); }
    for(const deg of L.windowsV2.rotundaDeg){ const a=(90-deg)*Math.PI/180, x=R.cx+Math.cos(a)*(R.r+0.6), z=R.cz-Math.sin(a)*(R.r+0.6); mk(2.6,RY+1,x,RY/2,z,Math.atan2(-Math.cos(a),Math.sin(a)),lv0,'lawn',14); }
    mk(V.x1-V.x0+12,RY*2+4,0,2.0,B.z1+1.2,Math.PI,lv0,'avenue',35);
    if(zone.applyTime&&typeof GAME!=='undefined'&&GAME.G) zone.applyTime(GAME.G.hour,GAME.G.weather); }

  // ---- 鏡頭碰撞：台階整塊（實心，頂面＝走的連續斜面）、柱子 ----
  function camCols(L,g){ const BS=L.bookstair, Y1=L.floors[1].y, inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), out=[];
    const x0=BS.x0-0.02, x1=BS.x1+0.02, za=BS.z1, zb=BS.z0, yb=Y1-0.05;   /* 低的一端 z1（南）y 0，高的一端 z0（北）y 5 */
    const P=[[x0,0,za],[x0,0,zb],[x0,yb,zb],[x0,0.02,za],[x1,0,za],[x1,0,zb],[x1,yb,zb],[x1,0.02,za]];
    const F=[[0,1,2],[0,2,3],[4,6,5],[4,7,6],[0,4,5],[0,5,1],[3,2,6],[3,6,7],[0,3,7],[0,7,4],[1,5,6],[1,6,2]], pos=[]; for(const f of F) for(const i of f) pos.push(...P[i]);
    const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); wg.computeVertexNormals();
    const w=new THREE.Mesh(wg,inv); w.name='CAMCOL_bookstair'; w.userData.noMerge=true; w.userData.dyn=true; g.add(w); out.push(w);
    const U=L.upper; for(const [x,z] of [[-5.2,U.band.z1],[5.2,U.band.z1],[-5.2,L.gates.z],[5.2,L.gates.z],[-5.2,U.north.z1],[5.2,U.north.z1]]){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,L.roofY,16),inv); c.position.set(x,L.roofY/2,z); c.name='CAMCOL_column'; c.userData.noMerge=true; c.userData.dyn=true; g.add(c); out.push(c); }
    out.thin=out.slice(); return out; }

  // ---- 區域 ----
  function build(E){ const L=LAYOUT(), B=L.bounds, Y1=L.floors[1].y, EL=L.elevator, BS=L.bookstair, R=L.rotunda;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], outs=[], slabs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const lights=[];
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:B.x1-B.x0,d:2*Math.max(-L.navBox.z0,L.navBox.z1)},camMaxY:3.6,version:2,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs){ const v=LB3.viewOf(o.userData.view,night), want=v||LB3.outsideTex(night); if(o.material.map!==want){ o.material.map=want; o.material.toneMapped=!v; o.material.needsUpdate=true; } }
        for(const o of (zone.pOuts||[])){ const v=LB3.viewOf(o.userData.view,night), u=o.material.uniforms; u.map.value=v||LB3.outsideTex(night); u.photo.value=v?1:0; u.tint.value.set(v?W3.photoTint(h,weather==='rain'):0xffffff); const v2=(v&&!night&&W3.photoFade&&W3.photoFade(h)>0)?LB3.viewOf(o.userData.view,true):null; if(u.xf){ u.map2.value=v2; u.near2.value=0; u.xf.value=v2?W3.photoFade(h):0; } } },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; } };
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,slabs);
    LB3.buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone); furniture2(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone);
    { const cc=camCols(L,g); zone.camCols=[cc,cc]; zone.camColsThick=cc; zone.camColsThin=cc.thin; }
    // 劇情：小安「總圖的下午」（二樓西翼、靠窗那一張長桌的面對面兩個座位）排在 seats 最前面——和第一版一樣
    { const s=zone.seats, T=L.furniture.find(f=>f.type==='studyTable'&&f.z>0); const row=(zz)=>s.filter(q=>Math.abs(q.z-zz)<0.05&&(q.lv|0)===1).sort((p,q)=>p.x-q.x)[0];
      const a=T&&row(T.z-0.8), b2=T&&row(T.z+0.8); if(a&&b2){ s.splice(s.indexOf(a),1); s.splice(s.indexOf(b2),1); s.unshift(a,b2); } }
    // 台階點得到（點地面移動）：點在走的那一跑＝走完這一跑（engine3d.js；任務 #42）
    for(const s of ss.all){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=s===ss.top?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      if(s===ss.flight) m.userData.stairEnds=[{x:0,z:BS.z1+0.6,lv:0},{x:0,z:(L.upper.north.z0+L.upper.north.z1)/2,lv:1}]; }
    zone.elev=B3.buildElevator(Object.assign({},L,{elevator:Object.assign({},EL,{floors:LB3.hallFloors(L)})}),g,nav0,nav1,zone);
    { const sh=E.spawnHint; if(sh&&sh.elev) zone.elev.placeAt(Math.max(0,Math.min(1,sh.lv|0)),true); }
    zone.update=function(dt){ zone.elev.update(dt); };
    for(const [x,y,z,on,off] of [[0,8.6,4.6,16,10],[0,7.0,-4.0,10,6],[0,8.0,-11.0,10,6],[-8.6,8.6,0,9,6],[8.6,8.6,0,9,6],[-8.6,3.8,0,7,4],[8.6,3.8,0,7,4],[-8.6,3.8,-12.6,7,4],[8.6,3.8,-12.6,7,4],[R.cx,7.5,R.cz-2.6,12,7]]){ const l=new THREE.PointLight(0xfff0d8,off,22,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    // 互動點（每一個都標樓層）——和第一版一樣
    const IT=E.interactables, EN=L.entrance, SDR=L.stairDoor;
    IT.push({x:EN.x,z:EN.exitZ,radius:1.4,lv:0,label:'離開總圖',exit:{to:'campus',spawn:Object.assign({},LB3.CAMPUS)}});
    IT.push({x:SDR.x-0.7,z:SDR.z,radius:1.0,lv:1,label:SDR.label,exit:{to:'library',spawn:Object.assign({},L.reading.spawnFromStairs)}});
    if(L.b1Door&&typeof LIBRARY_B1_LAYOUT!=='undefined'){ const BD=L.b1Door, sp=LIBRARY_B1_LAYOUT.stairs.spawn; IT.push({x:BD.x+0.55,z:BD.z,radius:0.8,lv:0,label:BD.label,exit:{to:'library_b1',spawn:{x:sp.x,z:sp.z,yaw:sp.yaw}}}); }
    for(const lv of [0,1]) IT.push({x:zone.elev.cx,z:EL.callZ,radius:1.0,lv,label:'搭電梯',elevator:true});
    IT.push({x:R.cx,z:R.cz-1.6,radius:1.6,lv:0,label:'看展演廳',look:'展演廳：半圓形的大廳挑高兩層，一圈高窗，弧形的展示櫃裡放著這學期的館藏特展。'});
    IT.push({x:0,z:BS.z1+0.9,radius:1.2,lv:0,label:'看台階書牆',look:'中庭的大階梯：中間走的樓梯上二樓，兩旁是可以坐的木頭階梯，每一階的立面都是書架。'});
    // 指標（中文字一直顯示：正式模型沒有字）——和第一版一樣
    for(const s of L.signs){ const y=(s.lv?Y1:0)+s.y; const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.18),new THREE.MeshBasicMaterial({map:TK.signTex(s.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(s.x,y,s.z); sp.rotation.y=s.ry||0; (s.lv?lv1:lv0).add(sp); }
    // 樓層簡介（入口閘門後面的立牌，面朝門口；第一版掛在大樓梯旁的核心書架上）：字是 canvas、架子在正式模型和備用模型各一份
    { const D=L.directory; if(D){ const tx=W3.canvasTex('lbboard2',512,256,(x,w,h)=>{ x.fillStyle='#24303a'; x.fillRect(0,0,w,h); x.fillStyle='#f3efe4'; x.font='bold 34px "Noto Sans TC",sans-serif'; x.fillText('總圖書館 樓層簡介',24,52); x.font='22px "Noto Sans TC",sans-serif';
        x.fillText('1F　大廳｜台階書牆｜展演廳｜共享區｜媒體區',24,100); x.fillText('2F　自習區｜研究小間',24,138); x.fillText('3F　閱覽區（東側樓梯間、電梯）',24,176); x.fillText(L.stacks?'4F–6F　書庫（5F 開放，搭電梯）':'4F–6F　書庫（整理中）',24,214); if(L.b1Door) x.fillText('B1　自習室｜討論室｜影印（西側樓梯）',24,246); });
        const bd=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.9),new THREE.MeshBasicMaterial({map:tx})); bd.position.set(D.x,1.6,D.z+0.032); lv0.add(bd);
        const stM=new THREE.MeshStandardMaterial({color:0x3a3d41,roughness:0.45}), st=new THREE.Mesh(new THREE.BoxGeometry(1.9,1.0,0.05),stM); st.position.set(D.x,1.6,D.z); fb0.add(st);
        for(const sx of [-0.85,0.85]){ const leg=new THREE.Mesh(new THREE.BoxGeometry(0.05,1.1,0.04),stM); leg.position.set(D.x+sx,0.55,D.z); fb0.add(leg); }
        nav0.blockRect(D.x,D.z,2.0,0.3,0); nav0._cm=null;
        IT.push({x:D.x,z:D.z+0.9,radius:1.0,lv:0,label:'看樓層簡介',look:'總圖書館 樓層簡介：1F 大廳、服務台、中庭的台階書牆、展演廳、多元共享區、數位媒體區；2F 自習區、研究小間；3F 閱覽區（從二樓東側的樓梯間，或搭電梯）；'+(L.stacks?'5F 書庫是自然科學（搭電梯；4F、6F 這學期整理中）。':'4F–6F 書庫（這學期整理中）。')+(L.b1Door?'B1 是 24 小時自習室、討論室、影印中心（一樓西側的樓梯間下去）。':'')+'中庭台階書牆中間的樓梯上二樓。'}); } }
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.library_hall_v2']){ ASSETS.loadOne('bldg.library_hall_v2').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true); B3.attachFormal(zone,root,fb0,fb1,lv0,lv1,walls,walkMeshes); for(const o of outs) o.visible=false;
      zone.seeThru=true; g.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||m.userData.seeThrough||!/leaf|lh2_books|lh2_shelf/.test(m.name||'')) continue; m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } });
      parallaxViews(zone,L,lv0,lv1); }).catch(e=>console.warn('總圖大廳第二版正式模型載入失敗，用程序化備用模型',e)); }
    return zone; }

  return {build,buildNav,stairSurfs};
})();
