/* ===== 萬才館室內兩層樓（萬才館第三階段，D42）：一樓大廳＋二樓（北側走廊、西側迴廊、西南門廳）、直跑樓梯、玻璃電梯 =====
   使用者需求 21：「將相同系統擴展到萬才館、總圖與主要建築，實作電梯和其他樓層。」
   配置：src/data/wancai_layout.js（Blender 正式模型 tools/blender/wancai_interior.py 讀同一份，兩邊的位置一定一致）。
   一樓沿用 v9.3 的大廳：柱子、沙發、圓桌、公告欄（法律服務社招募）、出口、劇情與社團站位的座標都不變（舊存檔照舊）。
   導航：兩層 NavGrid（1F y=0、2F y=4.2）；樓梯往南爬（最下面一階在北邊），第二跑＋最上一階兩層共用（和霖澤館同一套，D36）；
         電梯照霖澤館（B3.buildElevator：車廂在這一層、門開著才能走）。二樓西南門廳的門通到外面大樓梯頂端的平台（校園第 1 層）。
   畫面：程序化備用模型（正式模型載入前、載入失敗時）；正式模型（ASSETS 'bldg.wancai_interior'）載入後由 B3.attachFormal 換掉（L0_root／L1_root、WALL_*）。 */
'use strict';
const WC3=(function(){
  const LAYOUT=()=>WANCAI_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const CAMPUS_1F={x:93.8,z:-98.4,yaw:0};            // 從一樓出去：陽台下的一樓入口前面（和 v9.3 一樣）
  const CAMPUS_2F={x:87,z:-99.4,yaw:0,lv:1};          // 從二樓出去：大樓梯頂端的平台（校園第 1 層 3.63 m），離平台上的門 1.8 m（不會一出來就又跳出進門按鈕）

  // ---- 樓梯的高度（往 +z 爬）：從最下面那一階的邊緣（和地面同高）連續斜上到最上面那一階踏面的中心；畫面上一階一階（tread／rise／low）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, F1=S.flight1, LD=S.landing, F2=S.flight2, n1=F1.risers, n2=F2.risers;
    return { f1:{x0:S.x0,x1:S.x1,z0:F1.z0,z1:F1.z1-t/2,axis:'z',ya:0,yb:n1*r,tread:t,rise:r,low:'z0'},
      ld:{x0:S.x0,x1:S.x1,z0:F1.z1-t/2,z1:LD.z1,y:LD.y},
      f2:{x0:S.x0,x1:S.x1,z0:F2.z0,z1:F2.z1-t/2,axis:'z',ya:LD.y,yb:LD.y+n2*r,tread:t,rise:r,low:'z0'},
      top:{x0:S.x0,x1:S.x1,z0:F2.z1-t/2,z1:F2.z1,y:LD.y+n2*r} }; }

  // ---- 導航：兩層 ----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, U=L.upper, EL=L.elevator, F2=S.flight2;
    const nav0=new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1), nav1=new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1).setFloor(Y1);
    nav0.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);   // 和 v9.3 的大廳（room）一樣
    const ss=stairSurfs(L); for(const s of [ss.f1,ss.ld,ss.f2,ss.top]) nav0.addSurf(Object.assign({},s));
    nav0.blockRect(S.railX,(S.railZ0+F2.z1)/2,0.2,F2.z1-S.railZ0,0);                  // 樓梯東側欄杆（最下面留開口）
    /* 樓梯頂端後面、二樓門廳底下的角落：v9.5 以前整塊擋起來；2026-10-13 起是法律學院圖書館的門前（lawlibDoor），打開。
       樓梯最上面一階（第 0 層 4.2 m）和這裡的地面（0 m）高度接不上，找路、碰撞（NavGrid.clear 看高度）本來就不會從樓梯頂端走下來；tests/nav_lawlib_unit.js 檢查 */
    for(const [x,z,r] of L.columns) nav0.blockCircle(x,z,r+0.1);
    nav0.blockRect(EL.x0-0.1,(EL.z0+EL.z1)/2,0.2,EL.z1-EL.z0+0.2,0); nav0.blockRect(EL.x1+0.1,(EL.z0+EL.z1)/2,0.2,EL.z1-EL.z0+0.2,0); nav0.blockRect((EL.x0+EL.x1)/2,EL.z1+0.1,EL.x1-EL.x0+0.4,0.2,0);   // 電梯井道玻璃（東、西、南）
    // 二樓：先整層擋起來，再開出走廊、迴廊、門廳、樓梯第二跑、電梯門口
    nav1.fillBlocked(); for(const a of [U.corridor,U.gallery,U.foyer]) nav1.freeRect(a.x0,a.z0,a.x1,a.z1);
    nav1.freeRect(S.x0,F2.z0,S.x1,F2.z1); nav1.addSurf(Object.assign({},ss.f2)); nav1.addSurf(Object.assign({},ss.top));
    nav1.freeRect(EL.doorX0,U.corridor.z1,EL.doorX1,EL.z0+0.1);                        // 走廊 → 電梯門口（樓板邊和車廂之間的門檻）
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 程序化備用模型 ----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, S=L.stair, U=L.upper, F1=S.flight1, F2=S.flight2, LD=S.landing, MAT=B3.MAT;
    const b0=new TK.Bin(), b1=new TK.Bin();
    const floorM=(w,d)=>{ const t=W3.stoneTex('#e6dccb').clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:t,roughness:0.7}); };   /* 和 v9.3 的大廳同一種石材地板（貼圖複製一份：快取的貼圖別的區域也在用）*/
    // 地板：一樓（點地面也打這一片）、二樓（走廊、迴廊、門廳）
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),floorM(W,D)); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f); }
    const slab=(x0,z0,x1,z1)=>{ b1.add(MAT.plaster(),TK.boxG(x1-x0,U.slabT,z1-z0,1.2),(x0+x1)/2,Y1-U.slabT/2,(z0+z1)/2); if(slabs) slabs.push(...B3.slabPieces({x0,x1,z0,z1},[L.elevator],{lv:1,y:Y1,t:U.slabT}));   /* 鏡頭不穿過樓板（engine3d.js 的 slabClip） */
      const f=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),floorM(x1-x0,z1-z0)); f.rotation.x=-Math.PI/2; f.position.set((x0+x1)/2,Y1+0.004,(z0+z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f); };
    slab(-W/2,-D/2,W/2,U.slabEdge); slab(S.railX,U.slabEdge,U.railX,F2.z1); slab(-W/2,F2.z1,U.railX,D/2);
    // 柱子（一樓，撐著二樓樓板）
    for(const [x,z,r] of L.columns) b0.add(M('#d9cbb0'),new THREE.CylinderGeometry(r,r,Y1-U.slabT,16),x,(Y1-U.slabT)/2,z);
    // 樓梯：每一階一塊石材（實心到地面）、平台；東側玻璃欄板＋不鏽鋼扶手
    const steps=(z0,base,n)=>{ for(let k=0;k<n;k++){ const top=base+(k+1)*S.rise, za=z0+k*S.tread; b0.add(MAT.graniteD(),TK.boxG(S.x1-S.x0,top,S.tread,2.4),(S.x0+S.x1)/2,top/2,za+S.tread/2); } };
    steps(F1.z0,0,F1.risers); b0.add(MAT.graniteD(),TK.boxG(S.x1-S.x0,LD.y,LD.z1-LD.z0,2.4),(S.x0+S.x1)/2,LD.y/2,(LD.z0+LD.z1)/2); steps(F2.z0,LD.y,F2.risers);
    const rail=(grp,pts,x,along)=>{ for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(zb-za,yb-ya); if(len<0.05) continue;
        const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.95),MAT.glass()); const mid=new THREE.Vector3(along==='z'?x:(za+zb)/2,(ya+yb)/2+0.55,along==='z'?(za+zb)/2:x);
        gp.position.copy(mid); if(along==='z'){ gp.rotation.set(0,Math.PI/2,0); gp.rotateZ(-Math.atan2(yb-ya,zb-za)); }   /* 點的順序 z 由小到大；轉 y 90° 之後平面的 +x 朝 −z，往 +z 升高要轉負的角度 */ gp.userData.noMerge=true; grp.add(gp);
        const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,len,8),MAT.steel()); hr.position.copy(mid).add(new THREE.Vector3(0,0.47,0)); hr.lookAt(along==='z'?x:zb,yb+1.02,along==='z'?zb:x); hr.rotateX(Math.PI/2); grp.add(hr); } };
    rail(lv0,[[S.railZ0,0],[F1.z1,LD.y],[LD.z1,LD.y],[F2.z1,Y1]],S.railX+0.02,'z');
    // 二樓欄杆：樓梯井北邊、迴廊兩側、走廊南邊（電梯門口留開口）
    rail(lv1,[[U.slabEdge,Y1],[F2.z1,Y1]],S.railX,'z'); rail(lv1,[[U.slabEdge,Y1],[D/2,Y1]],U.railX,'z');
    rail(lv1,[[-W/2,Y1],[S.railX,Y1]],U.railZ,'x'); rail(lv1,[[U.railX,Y1],[L.elevator.doorX0-0.1,Y1]],U.railZ,'x'); rail(lv1,[[L.elevator.doorX1+0.1,Y1],[W/2,Y1]],U.railZ,'x');
    // 外牆：北、西、東（兩層，一層一塊：剖面視角藏二樓時一起藏）；南面＝西段實牆（二樓門）＋東段兩層樓高的玻璃帷幕
    const wall=(x,z,w,h,y,ry,dir,m,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const wallM=M('#eae1d3'); const FG=L.frontGlass;
    const LLD=L.lawlibDoor, lz0=LLD.z-LLD.w/2, lz1=LLD.z+LLD.w/2;
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){ wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),wallM,grp); if(grp===fb1) wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); else { wall(-W/2,(-D/2+lz0)/2,lz0+D/2,h,y,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); wall(-W/2,(lz1+D/2)/2,D/2-lz1,h,y,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); wall(-W/2,LLD.z,LLD.w,h-LLD.h,y+LLD.h,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); } wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),wallM,grp);
      wall((-W/2+FG.x0)/2,D/2,FG.x0+W/2,h,y,0,new THREE.Vector3(0,0,-1),wallM,grp); }
    { const gw=FG.x1-FG.x0, gh=RY-0.3, cx=(FG.x0+FG.x1)/2; const gp=new THREE.Mesh(new THREE.PlaneGeometry(gw,gh),MAT.glass()); gp.position.set(cx,gh/2,D/2); gp.rotation.y=Math.PI; lv0.add(gp);
      for(let x=FG.x0;x<=FG.x1+0.01;x+=gw/7) b0.add(MAT.frame(),TK.boxG(0.12,gh,0.14),x,gh/2,D/2-0.05); for(const y of [2.9,Y1,Y1+2.9]) b0.add(MAT.frame(),TK.boxG(gw,0.12,0.14),cx,y,D/2-0.05);
      B3.outView('south','wancai_south',gw+44,20,cx,2.6,D/2+3.0,Math.PI,20,lv0); }   /* 窗外的景：遊戲裡拍的大台階前廣場往南（社科院、黑森林），視差材質；見 building3d.js 的 outView */
    // 法律學院圖書館的門（一樓西牆南段）：門框、兩扇玻璃門、門上的木作名牌（字是遊戲裡畫的，正式模型一樣）
    { const LD=L.lawlibDoor, x=-W/2+0.12; b0.add(MAT.frame(),TK.boxG(0.14,LD.h+0.1,0.1),x,(LD.h+0.1)/2,LD.z-LD.w/2-0.05); b0.add(MAT.frame(),TK.boxG(0.14,LD.h+0.1,0.1),x,(LD.h+0.1)/2,LD.z+LD.w/2+0.05); b0.add(MAT.frame(),TK.boxG(0.14,0.1,LD.w+0.2),x,LD.h+0.05,LD.z);
      for(const sz of [-1,1]){ const gd=new THREE.Mesh(new THREE.PlaneGeometry(LD.w/2-0.04,LD.h-0.08),MAT.glass()); gd.position.set(x,(LD.h-0.08)/2+0.02,LD.z+sz*LD.w/4); gd.rotation.y=Math.PI/2; gd.userData.noMerge=true; lv0.add(gd); }
      b0.add(MAT.woodD(),TK.boxG(0.05,0.42,LD.w+0.9),-W/2+0.13,LD.h+0.42,LD.z); }
    // 二樓的門（西南門廳，通到外面的平台）：玻璃門＋門框
    { const UD=L.upperDoor; b1.add(MAT.frame(),TK.boxG(1.7,2.6,0.12),UD.x,Y1+1.3,D/2-0.12); const gd=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.4),MAT.glass()); gd.position.set(UD.x,Y1+1.2,D/2-0.2); gd.rotation.y=Math.PI; lv1.add(gd); }
    // 天花板：二樓走廊、迴廊、門廳的頂（8.4 m）＋燈；一樓的天花板就是二樓樓板的底面
    { const c=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c.rotation.x=Math.PI/2; c.position.y=RY; fb1.add(c); for(let i=0;i<4;i++) for(let j=0;j<3;j++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.6),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(-6+i*4,RY-0.01,-4.5+j*4.6); fb1.add(p); }
      for(let i=0;i<6;i++) for(const z of [-5.6,-3.4]){ const p=new THREE.Mesh(new THREE.CircleGeometry(0.12,12),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(-7.5+i*3,Y1-U.slabT-0.005,z); fb0.add(p); } }
    b0.build(fb0); b1.build(fb1); }

  // ---- 家具（程序化；沙發沿用 v9.3 第十七批的做法）、公告欄、樓層簡介 ----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin();
    for(const f of L.furniture){ const b=f.lv?b1:b0, y=f.lv?Y1:0, nav=f.lv?nav1:nav0, ry=f.ry||0, fb=f.lv?fb1:fb0;
      if(f.type==='sofa'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); const fab=M('#3e5a48',{rough:0.85}), fab2=M('#2f5d50',{rough:0.85}), lg=M('#3a2a20',{rough:0.6});
        sb.add(fab2,new THREE.BoxGeometry(2.2,0.22,0.86),0,0.19,0); for(const sx of [-0.49,0.49]) sb.add(fab,new THREE.BoxGeometry(0.96,0.14,0.66),sx,0.37,0.08); sb.add(fab2,new THREE.BoxGeometry(2.0,0.52,0.2),0,0.56,-0.33,0,{rx:-0.08}); for(const sx of [-1,1]) sb.add(fab2,new THREE.BoxGeometry(0.16,0.34,0.86),sx*1.02,0.43,0); for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) sb.add(lg,new THREE.BoxGeometry(0.06,0.08,0.06),lx*1.0,0.04,lz*0.36); sb.build(sg);
        nav.blockRect(f.x,f.z,2.2,0.9,ry,0.1); if(f.seat) IT.push({x:f.x+Math.sin(ry)*0.7,z:f.z+Math.cos(ry)*0.7,radius:1.2,lv:f.lv,label:'坐在沙發上',seat:{x:f.x,z:f.z,yaw:ry}}); }
      else if(f.type==='table'){ b.add(M('#c9a57a'),new THREE.CylinderGeometry(f.r,f.r,0.06,24),f.x,y+0.5,f.z); b.add(M('#4a4f55',{rough:0.45}),new THREE.CylinderGeometry(0.05,0.06,0.47,10),f.x,y+0.235,f.z); b.add(M('#4a4f55',{rough:0.45}),new THREE.CylinderGeometry(0.3,0.32,0.03,20),f.x,y+0.015,f.z); nav.blockCircle(f.x,f.z,f.r+0.05); }
      else if(f.type==='bulletin'){ const bb=W3.bulletin(); bb.position.set(f.x,y,f.z); lv0.add(bb); nav.blockRect(f.x,f.z,f.w,0.4,0); IT.push({x:f.x,z:f.z+1.0,radius:1.6,lv:f.lv,label:'看公告：法律服務社招募',notice:'lawclub'}); }
      else if(f.type==='board'){ const tx=W3.canvasTex('wc3board',512,256,(x,w,h)=>{ x.fillStyle='#24303a'; x.fillRect(0,0,w,h); x.fillStyle='#f3efe4'; x.font='bold 34px "Noto Sans TC",sans-serif'; x.fillText('萬才館 樓層簡介',24,50); x.font='22px "Noto Sans TC",sans-serif'; x.fillText('1F　大廳｜演講廳｜多功能教室',24,90); x.fillText('1F　法律學院圖書館（大廳西南角）',24,124); x.fillText('2F　研討室 A、B｜往外面的平台',24,158); x.fillText('3F–9F　研究室（刷學院識別證）',24,192); x.fillStyle='#d6a425'; x.fillText('↑ 樓梯在大廳西側　電梯在大廳東側',24,234); });
        const bd=new THREE.Mesh(new THREE.PlaneGeometry(f.w,f.w/2),new THREE.MeshBasicMaterial({map:tx})); bd.position.set(f.x,y+1.65,f.z+0.01); (f.lv?lv1:lv0).add(bd); b.add(MAT.frame(),TK.boxG(f.w+0.1,f.w/2+0.1,0.04),f.x,y+1.65,f.z-0.03);
        IT.push({x:f.x,z:f.z+0.9,radius:1.0,lv:f.lv,label:'看樓層簡介',look:'萬才館 樓層簡介：1F 大廳、演講廳、多功能教室，西南角（進門左手邊）是法律學院圖書館；2F 研討室 A、B，西南角的門通到外面大樓梯頂端的平台；3F–9F 研究室（要刷學院識別證）。樓梯在大廳西側，電梯在大廳東側。'}); }
      else if(f.type==='planter'){ b.add(MAT.graniteD(),new THREE.CylinderGeometry(f.r,f.r*0.9,0.6,16),f.x,y+0.3,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.25,1),f.x,y+1.15,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }
      else if(f.type==='bench'){ b.add(MAT.wood(),TK.boxG(f.w,0.06,f.d),f.x,y+0.45,f.z); for(const sx of [-1,1]) b.add(MAT.steel(),TK.boxG(0.06,0.43,f.d*0.9),f.x+sx*(f.w/2-0.12),y+0.215,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); } }
    b0.build(fb0); b1.build(fb1);
    const sp=W3.signPlane('演講廳 →',2.2,0.5,{color:'#3b2a1e'}); sp.position.set(-7,2.6,-L.D/2+0.15); lv0.add(sp); }   /* v9.3 的指標（演講廳的門在東邊 x=-2.5）*/

  // ---- 區域 ----
  const wancai={ id:'wancai', name:'萬才館 大廳', indoor:true, camDist:4.6, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y, EL=L.elevator;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1}=buildNav(L);
    const walls=[], walkMeshes=[], slabs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs); B3.buildDoors(L,fb0,fb1,lv0,lv1); buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1);
    // 樓梯可以點的面（點地面移動；一直在，正式模型載入後也用這幾片）
    { const ss=stairSurfs(L); for(const s of [ss.f1,ss.ld,ss.f2,ss.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.f2||s===ss.top)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      /* 點在一跑樓梯上＝走完這一跑（engine3d.js；任務 #42）：[下面那一端, 上面那一端]；樓梯往南爬 */
      const S=L.stair, sx=(S.x0+S.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===ss.f1) m.userData.stairEnds=[{x:sx,z:S.flight1.z0-0.6,lv:0},{x:sx,z:ldz,lv:0}]; if(s===ss.f2) m.userData.stairEnds=[{x:sx,z:ldz,lv:0},{x:sx,z:S.flight2.z1+0.6,lv:1}]; } }
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:{x:0,z:6,yaw:Math.PI,lv:0},bounds:{w:W,d:D},camMaxY:3.4,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); g.traverse(o=>{ if(o.userData&&o.userData.outside) B3.setOutView(o,h,weather,night); }); },
      onLamps(on){ light.intensity=on?18:11; } };
    zone.elev=B3.buildElevator(L,g,nav0,nav1,zone);
    zone.update=function(dt){ zone.elev.update(dt); };
    const light=new THREE.PointLight(0xfff0d8,11,30,2); light.position.set(0,6.4,0.5); g.add(light);
    // 互動點（每一個都標樓層：別層正上方、正下方的不會跳出來）
    const IT=E.interactables, EN=L.entrance, UD=L.upperDoor;
    IT.push({x:EN.x,z:EN.exitZ,radius:1.6,lv:0,label:'離開萬才館',exit:{to:'campus',spawn:Object.assign({},CAMPUS_1F)}});
    IT.push({x:UD.x,z:UD.z,radius:1.0,lv:1,label:'走出去（大樓梯平台）',exit:{to:'campus',spawn:Object.assign({},CAMPUS_2F)}});
    if(typeof LAWLIB_LAYOUT!=='undefined'){ const LD=L.lawlibDoor; IT.push({x:LD.it.x,z:LD.it.z,radius:LD.it.r,lv:0,label:LD.label,exit:{to:'lawlib',spawn:Object.assign({},LAWLIB_LAYOUT.entrance.spawn)}});   /* 法律學院圖書館（D46）：開放時間在 places.js，關門時 story3d.js 擋 */
      const sp=W3.signPlane('法律學院圖書館',1.9,0.36,{color:'#3b2a1e'}); sp.position.set(-W/2+0.17,LD.h+0.42,LD.z); sp.rotation.y=Math.PI/2; lv0.add(sp); }
    const gateHide=(it,shut)=>Z3.roomGlbGate?Z3.roomGlbGate(it,shut):it;   /* 有開放時段的房間（rooms_glb3d.js d.gate；研討室 B）：時段內出現「進入」、時段外照舊是門上的字 */
    for(const d of L.doors){ if(d.to){ const sem0=d.id==='seminarA'&&typeof CLS!=='undefined'&&CLS.DOORS&&CLS.DOORS.wancai_seminar, act0=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list.some(a=>a.zone==='wancai'&&a.room===d.id), o0={look:d.closed,door:sem0?'wancai_seminar':null};
        const it0=Object.assign({x:d.x,z:-D/2+0.75,radius:1.5,lv:d.lv,label:'進入 '+d.label,exit:{to:d.to,spawn:Object.assign({},d.spawn)}},(sem0||act0)?{onInteract:()=>{ if(CLS.roomDoorBusy&&CLS.roomDoorBusy(GAME,'wancai',d.id,o0)) void CLS.roomDoor(GAME,'wancai',d.id,o0); else void GAME.enter(d.to,Object.assign({},d.spawn)); }}:{});
        if(!d.gate){ IT.push(it0); continue; } it0.gate=d.gate; IT.push(gateHide(it0,false)); }   /* 走得進去的房間（LAWWW2-C 0a5cc70a：rooms_glb3d.js 把門接成出入口）：社課（吉他社在多功能教室；公法讀書會在研討室 A）、大四研討課的時間照舊在門口參加（classes3d.js roomDoor），其他時候走進去 */
      const sem=d.id==='seminarA'&&typeof CLS!=='undefined'&&CLS.DOORS&&CLS.DOORS.wancai_seminar;   /* 研討室 A：大四的研討課在這裡上（門口上課：classes3d.js 的 doorInteract；沒有課時照舊是說明）*/
      const act=typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list.some(a=>a.zone==='wancai'&&a.room===d.id);   /* 社課在這一間（多功能教室：吉他社；研討室 A：法服讀書會——AA_110 6-8）：門口參加（classes3d.js 的 roomDoor）。互動範圍 1.5 m（BUG-20：1.15 m 時走到門口有時沒出現按鈕；同一層相鄰的門相距 3.5～4.5 m，不重疊）*/
      const it1=Object.assign({x:d.x,z:-D/2+0.75,radius:1.5,lv:d.lv,label:d.label,look:d.closed},sem?{door:'wancai_seminar'}:{},(sem||act)?{onInteract:()=>CLS.roomDoor(GAME,'wancai',d.id,{look:d.closed,door:sem?'wancai_seminar':null})}:{}); if(d.to&&d.gate){ it1.gate=d.gate; gateHide(it1,true); } IT.push(it1); }
    for(const f of EL.floors) if(f.lv!==undefined) IT.push({x:zone.elev.cx,z:EL.callZ,radius:1.0,lv:f.lv,label:'搭電梯',elevator:true});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wancai_interior']){ ASSETS.loadOne('bldg.wancai_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; B3.attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes); }).catch(e=>console.warn('萬才館室內正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };
  return {wancai,stairSurfs,CAMPUS_1F,CAMPUS_2F};
})();
Z3.ZONES.wancai=WC3.wancai;
