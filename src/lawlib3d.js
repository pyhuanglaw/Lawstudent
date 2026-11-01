/* ===== 萬才館 法律學院圖書館（D46；2026-10-13）：一樓櫃台、自習區、影印室、兩間討論室；U 形樓梯；二樓藏書（書架、期刊、閱覽桌）=====
   使用者 2026-10-11：「萬才館一樓進去左手邊就是法律系圖書館，裡面自己有樓梯，有兩層樓；1 樓主要是櫃檯、自習區、影印室、兩間可以借用的討論室（小的）；2 樓比較多是藏書。」
   配置：src/data/lawlib_layout.js（Blender 正式模型 tools/blender/lawlib_interior.py 讀同一份，兩邊的位置一定一致）。
   區域：萬才館一樓大廳西南角的門（src/data/wancai_layout.js 的 lawlibDoor）→ lawlib（這個檔案，兩層導航）。開放時間在 src/data/places.js（story3d.js 擋門、大地圖、入口名牌讀同一份）。
   導航：兩層 NavGrid（1F y=0、2F y=4.2）；U 形樓梯：A 跑（往南爬到靠南牆的平台）只在第 0 層，B 跑（往北爬回二樓）和最上面一階兩層共用（D36）。
   書架之間的走道很窄：鏡頭被書架擋住時，書架在玩家周圍變成網點透空（engine3d.js 的「樹幹透視」，zone.seeThru 讓室內也用；只作用在書架、書的材質）。
   畫面：程序化備用模型（正式模型載入前、載入失敗時）；正式模型（ASSETS 'bldg.lawlib_interior'）載入後由 B3.attachFormal 換掉（L0_root／L1_root、WALL_*）。 */
'use strict';
const LL3=(function(){
  const LAYOUT=()=>LAWLIB_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const HALL={x:-7.0,z:5.9,yaw:Math.PI/2,lv:0};   // 回萬才館大廳：站在圖書館門口（大廳西南角）往東，離門的互動點 1.4 m（不會一出來就跳出「法律學院圖書館」）；大廳最南邊站得住的是 z≈6.08

  // ---- 樓梯的高度：A 跑往南爬（最下面一階在北邊）、B 跑往北爬回二樓；連續斜面給碰撞與找路，畫面上一階一階（tread／rise／low）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, A=S.A, B=S.B, LD=S.landing;
    return { a:{x0:A.x0,x1:A.x1,z0:A.z0,z1:A.z1-t/2,axis:'z',ya:0,yb:A.risers*r,tread:t,rise:r,low:'z0'},
      ld:{x0:LD.x0,x1:LD.x1,z0:A.z1-t/2,z1:LD.z1,y:LD.y},
      b:{x0:B.x0,x1:B.x1,z0:B.z0+t/2,z1:B.z1,axis:'z',ya:LD.y+B.risers*r,yb:LD.y,tread:t,rise:r,low:'z1'},
      top:{x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z0+t/2,y:LD.y+B.risers*r} }; }

  // ---- 座位：每張桌子兩側各 n 個（北側面向南 yaw 0、南側面向北 yaw π；離桌邊 0.35 m）；閱覽隔間面向南邊的窗 ----
  function seatsOf(L){ const out=[];
    for(const t of L.tables){ for(let i=0;i<t.n;i++){ const x=t.x-t.w/2+t.w*(i+0.5)/t.n; for(const s of [-1,1]) out.push({x:+x.toFixed(3),z:+(t.z+s*(t.d/2+0.35)).toFixed(3),yaw:s<0?0:Math.PI,lv:t.lv,table:t.id}); } }
    for(const r of L.rooms){ if(r.kind!=='discussion') continue; const T=r.table; for(const z of r.seatZ) for(const s of [-1,1]) out.push({x:+(T.x+s*(T.w/2+0.35)).toFixed(3),z,yaw:s<0?Math.PI/2:-Math.PI/2,lv:0,table:r.id,room:r.id}); }   /* room：討論室裡的活動（法律資料怎麼查，AA_110 6-3）坐下時可以參加 */   /* 討論室的桌子南北向：西側面向東、東側面向西 */
    const C=L.carrels, cw=(C.x1-C.x0)/C.n; for(let i=0;i<C.n;i++) out.push({x:+(C.x0+cw*(i+0.5)).toFixed(3),z:C.chairZ,yaw:0,lv:C.lv,table:'carrel',carrel:true});
    return out; }

  // ---- 導航：兩層 ----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, A=S.A, B=S.B, FZ=L.frontZ;
    const mk=()=>new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1); const nav0=mk(), nav1=mk().setFloor(Y1); const ss=stairSurfs(L);
    // 一樓
    nav0.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);
    for(const s of [ss.a,ss.ld,ss.b,ss.top]) nav0.addSurf(Object.assign({},s));
    nav0.blockRect((S.midWall.x0+S.midWall.x1)/2,(A.z0+A.z1)/2,S.midWall.x1-S.midWall.x0,A.z1-A.z0,0);   // 兩跑中間的牆（B 跑的側面）
    // 北側的房間：前牆一排（門洞打開）、隔間牆、館員辦公室（關著，整間擋起來）
    nav0.blockRect(0,FZ,W,0.2,0); for(const r of L.rooms) if(r.kind!=='office') nav0.freeRect(r.door[0],FZ,r.door[1],FZ);
    for(const px of L.partitions) nav0.blockRect(px,(-D/2+FZ)/2,0.2,FZ+D/2,0);
    for(const r of L.rooms){ if(r.kind==='office') nav0.blockRect((r.x0+r.x1)/2,(-D/2+FZ)/2,r.x1-r.x0,FZ+D/2,0);
      if(r.table) nav0.blockRect(r.table.x,r.table.z,r.table.w,r.table.d,0,0.05);
      if(r.copiers){ for(const cx of r.copiers) nav0.blockRect(cx,-D/2+0.45,0.65,0.6,0,0.02); nav0.blockRect(r.x0+0.25,-5.6,0.4,0.8,0,0); } }   /* 影印機、加值機的小櫃子 */
    // 櫃台＋館員的工作區（整塊擋起來）、入口的防盜感應門柱
    { const SA=L.staffArea; nav0.blockRect((SA.x0+SA.x1)/2,(SA.z0+SA.z1)/2,SA.x1-SA.x0,SA.z1-SA.z0,0); }
    for(const [x,z] of L.gates) nav0.blockRect(x,z,0.1,0.5,0);
    // 閱覽隔間（桌子＋椅子那一排）
    { const C=L.carrels; nav0.blockRect((C.x0+C.x1)/2,(C.chairZ-0.2+C.z1)/2,C.x1-C.x0,C.z1-C.chairZ+0.2,0); }
    // 二樓：先整層擋起來，再開出北邊（書庫、期刊區）、東南（閱覽區）、B 跑
    nav1.fillBlocked(); nav1.freeRect(-W/2+0.4,-D/2+0.4,W/2-0.4,S.well.z0-0.2); nav1.freeRect(S.rail2X+0.5,S.well.z0+0.2,W/2-0.4,D/2-0.4);
    nav1.freeRect(B.x0,S.well.z0,B.x1,B.z1); nav1.addSurf(Object.assign({},ss.b)); nav1.addSurf(Object.assign({},ss.top));
    // 桌子（兩層）、書架、展示架、推車、植物
    for(const t of L.tables) (t.lv?nav1:nav0).blockRect(t.x,t.z,t.w,t.d,0,0.05);
    for(const s of L.shelves){ const nav=s.lv?nav1:nav0; if(s.kind==='range') nav.blockRect(s.x,(s.z0+s.z1)/2,0.5,s.z1-s.z0,0); else nav.blockRect((s.x0+s.x1)/2,(s.z0+s.z1)/2,s.x1-s.x0,s.z1-s.z0,0); }
    for(const f of L.furniture){ const nav=f.lv?nav1:nav0;
      if(f.type==='newbooks') nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); else if(f.type==='opac') nav.blockRect(f.x,f.z,0.5,0.5,0); else if(f.type==='cart') nav.blockRect(f.x,f.z,0.9,0.45,f.ry||0,0); else if(f.type==='stool') nav.blockCircle(f.x,f.z,0.22); else if(f.type==='plant') nav.blockCircle(f.x,f.z,f.r+0.1); }
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 窗外的景：B3.outView（遊戲裡拍的校園畫面＋視差）。備用模型的牆沒有洞：景貼在牆的內側（窗戶的大小）；正式模型的牆有窗洞：景搬到牆外（fpos）、放大 ----
  function windowViews(L,lv0,lv1,outs){ const W=L.W, D=L.D, T=L.wallT;
    for(const w of L.windows){ const grp=w.lv?lv1:lv0, a=(w.a0+w.a1)/2, len=w.a1-w.a0, h=w.y1-w.y0, yc=(w.y0+w.y1)/2;
      let x,z,ry,fx,fz; if(w.wall==='S'){ x=a; z=D/2-T/2-0.03; ry=Math.PI; fx=a; fz=D/2+0.6; } else if(w.wall==='N'){ x=a; z=-D/2+T/2+0.03; ry=0; fx=a; fz=-D/2-0.6; } else { x=-W/2+T/2+0.03; z=a; ry=Math.PI/2; fx=-W/2-0.6; fz=a; }
      const p=B3.outView(w.wall==='S'?'south':'east',w.photo,len,h,x,yc,z,ry,20,grp); p.userData.fpos=new THREE.Vector3(fx,yc,fz); p.userData.fsize=[len+3,h+2.4]; outs.push(p); } }

  // ---- 程序化備用模型 ----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, S=L.stair, A=S.A, B=S.B, LD=S.landing, WL=S.well, MAT=B3.MAT, FZ=L.frontZ;
    const b0=new TK.Bin(), b1=new TK.Bin();
    const floorM=(base,w,d)=>{ const t=W3.stoneTex(base).clone(); t.needsUpdate=true; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:t,roughness:0.75}); };
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),floorM('#d8cdb8',W,D)); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f); }
    // 二樓樓板（扣掉樓梯井）：板子的底面是一樓的天花板；二樓地毯
    const carpet=M('#7d8890',{rough:0.95});
    for(const q of [{x0:-W/2,x1:W/2,z0:-D/2,z1:WL.z0},{x0:WL.x1,x1:W/2,z0:WL.z0,z1:D/2}]){ b1.add(MAT.plaster(),TK.boxG(q.x1-q.x0,ST,q.z1-q.z0,1.2),(q.x0+q.x1)/2,Y1-ST/2,(q.z0+q.z1)/2);
      const f=new THREE.Mesh(new THREE.PlaneGeometry(q.x1-q.x0,q.z1-q.z0),carpet); f.rotation.x=-Math.PI/2; f.position.set((q.x0+q.x1)/2,Y1+0.004,(q.z0+q.z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f);
      slabs.push(Object.assign({lv:1,y:Y1,t:ST},q)); }   /* 鏡頭不穿過樓板（engine3d.js 的 slabClip）*/
    // 樓梯：A 跑每一階一塊石材（實心到地面）、平台（實心）、B 跑（實心到地面：B 跑底下是實心的，側面是木作的牆）
    const stone=MAT.graniteD(), r=S.rise, t=S.tread;
    for(let k=0;k<A.risers;k++){ const top=(k+1)*r; b0.add(stone,TK.boxG(A.x1-A.x0,top,t,2.4),(A.x0+A.x1)/2,top/2,A.z0+k*t+t/2); }
    b0.add(stone,TK.boxG(LD.x1-LD.x0,LD.y,LD.z1-LD.z0,2.4),(LD.x0+LD.x1)/2,LD.y/2,(LD.z0+LD.z1)/2);
    for(let j=0;j<B.risers;j++){ const top=LD.y+(j+1)*r, zb=B.z1-j*t; b0.add(stone,TK.boxG(B.x1-B.x0,top,t,2.4),(B.x0+B.x1)/2,top/2,zb-t/2); }
    { const mw=S.midWall; for(let j=0;j<B.risers;j++){ const top=LD.y+(j+1)*r+0.9, zb=B.z1-j*t; b0.add(MAT.woodD(),TK.boxG(mw.x1-mw.x0,top,t,1.2),(mw.x0+mw.x1)/2,top/2,zb-t/2); } }   /* 兩跑中間的牆：B 跑的側面，高出 B 的踏面 0.9 m（欄杆高度）*/
    b0.add(MAT.woodD(),TK.boxG(0.06,Y1,WL.z1-B.z0,1.2),B.x1+0.03,Y1/2,(B.z0+WL.z1)/2);   // B 跑東側（面對自習區）：木作的牆，到二樓地板
    b0.add(MAT.woodD(),TK.boxG(B.x1-B.x0+0.06,Y1-0.02,0.06,1.2),(B.x0+B.x1)/2+0.03,(Y1-0.02)/2,B.z0-0.03);   // B 跑北端（最上面一階的端面）
    // 欄杆：玻璃欄板＋不鏽鋼扶手
    const rail=(grp,pts,x,along)=>{ for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(zb-za,yb-ya); if(len<0.05) continue;
        const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.95),MAT.glass()); const mid=new THREE.Vector3(along==='z'?x:(za+zb)/2,(ya+yb)/2+0.55,along==='z'?(za+zb)/2:x);
        gp.position.copy(mid); if(along==='z'){ gp.rotation.set(0,Math.PI/2,0); gp.rotateZ(-Math.atan2(yb-ya,zb-za)); } else gp.rotateZ(Math.atan2(yb-ya,zb-za)); gp.userData.noMerge=true; grp.add(gp);
        const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,len,8),MAT.steel()); hr.position.copy(mid).add(new THREE.Vector3(0,0.47,0)); hr.lookAt(along==='z'?x:zb,yb+1.02,along==='z'?zb:x); hr.rotateX(Math.PI/2); grp.add(hr); } };
    rail(lv1,[[WL.x0,Y1],[S.midWall.x1,Y1]],WL.z0,'x');                 // 二樓：樓梯井北邊（A 跑上方）
    rail(lv1,[[B.z0,Y1],[WL.z1,Y1]],S.rail2X,'z');                      // 二樓：樓梯井東邊（自習區那一側）
    { const hr=(x,pts,grp)=>{ for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(zb-za,yb-ya); const m=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,len,8),MAT.steel()); m.position.set(x,(ya+yb)/2+0.9,(za+zb)/2); m.lookAt(x,yb+0.9,zb); m.rotateX(Math.PI/2); grp.add(m); } };
      hr(-W/2+T/2+0.06,[[A.z0,0],[A.z1,LD.y],[WL.z1-0.1,LD.y]],lv0); hr(S.midWall.x0-0.04,[[A.z0,0],[A.z1,LD.y]],lv0); }   /* A 跑兩側的扶手（牆上） */
    // 北側房間：前牆（討論室＝玻璃＋上下實牆、影印室與辦公室＝實牆）、隔間牆
    const wallM=M('#ece6da');
    for(const rm of L.rooms){ const x0=rm.x0, x1=rm.x1, dz=FZ; const segs=rm.kind==='office'?[[x0,x1]]:[[x0,rm.door[0]],[rm.door[1],x1]];
      for(const [a,b] of segs){ if(b-a<0.05) continue; if(rm.kind==='discussion'){ b0.add(MAT.frame(),TK.boxG(b-a,0.9,0.2),(a+b)/2,0.45,dz); b0.add(MAT.frame(),TK.boxG(b-a,0.5,0.2),(a+b)/2,L.ceil0-0.25,dz); const gp=new THREE.Mesh(new THREE.PlaneGeometry(b-a,L.ceil0-1.4),MAT.glass()); gp.position.set((a+b)/2,0.9+(L.ceil0-1.4)/2,dz); gp.userData.noMerge=true; lv0.add(gp); }
        else b0.add(wallM,TK.boxG(b-a,L.ceil0,0.2),(a+b)/2,L.ceil0/2,dz); }
      if(rm.kind!=='office') b0.add(wallM,TK.boxG(rm.door[1]-rm.door[0],L.ceil0-2.4,0.2),(rm.door[0]+rm.door[1])/2,2.4+(L.ceil0-2.4)/2,dz);
      else b0.add(MAT.woodD(),TK.boxG(rm.door[1]-rm.door[0]-0.2,2.3,0.06),(rm.door[0]+rm.door[1])/2,1.15,dz+0.13); }
    for(const px of L.partitions) b0.add(wallM,TK.boxG(0.2,L.ceil0,FZ+D/2),px,L.ceil0/2,(-D/2+FZ)/2);
    // 外牆（兩層，一層一塊：剖面視角藏二樓時一起藏；擋住鏡頭時淡出）
    const wall=(x,z,w,h,y,ry,dir,m,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const outer=M('#efe9df');
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){ wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),outer,grp); wall(0,D/2,W,h,y,0,new THREE.Vector3(0,0,-1),outer,grp); wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),outer,grp); }
    { const E0=L.entrance; for(const [grp,y,h] of [[fb1,Y1,RY-Y1]]) wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),outer,grp);   /* 東牆一樓：入口的門洞兩側＋門楣 */
      const segs=[[-D/2,E0.z0],[E0.z1,D/2]]; for(const [a,b] of segs) wall(W/2,(a+b)/2,b-a,Y1,0,Math.PI/2,new THREE.Vector3(-1,0,0),outer,fb0); wall(W/2,(E0.z0+E0.z1)/2,E0.z1-E0.z0,Y1-2.5,2.5,Math.PI/2,new THREE.Vector3(-1,0,0),outer,fb0);
      b0.add(MAT.frame(),TK.boxG(0.16,2.55,0.1),W/2-0.12,1.275,E0.z0); b0.add(MAT.frame(),TK.boxG(0.16,2.55,0.1),W/2-0.12,1.275,E0.z1); b0.add(MAT.frame(),TK.boxG(0.16,0.1,E0.z1-E0.z0),W/2-0.12,2.5,(E0.z0+E0.z1)/2);
      for(const sz of [-1,1]){ const gd=new THREE.Mesh(new THREE.PlaneGeometry((E0.z1-E0.z0)/2-0.05,2.35),MAT.glass()); gd.position.set(W/2-0.3,1.2,(E0.z0+E0.z1)/2+sz*((E0.z1-E0.z0)/4+0.35)); gd.rotation.y=Math.PI/2+sz*1.1; gd.userData.noMerge=true; lv0.add(gd); } }   /* 玻璃門片（開著，往內推開） */
    // 窗框（景在牆的內側，見 windowViews）
    for(const w of L.windows){ const bb=w.lv?b1:b0, n=w.n, len=w.a1-w.a0; for(let i=0;i<=n;i++){ const a=w.a0+len*i/n; if(w.wall==='W') bb.add(MAT.frame(),TK.boxG(0.06,w.y1-w.y0,0.06),-W/2+T/2+0.06,(w.y0+w.y1)/2,a); else bb.add(MAT.frame(),TK.boxG(0.06,w.y1-w.y0,0.06),a,(w.y0+w.y1)/2,w.wall==='S'?D/2-T/2-0.06:-D/2+T/2+0.06); }
      for(const y of [w.y0,w.y1]){ if(w.wall==='W') bb.add(MAT.frame(),TK.boxG(0.08,0.08,len),-W/2+T/2+0.06,y,(w.a0+w.a1)/2); else bb.add(MAT.frame(),TK.boxG(len,0.08,0.08),(w.a0+w.a1)/2,y,w.wall==='S'?D/2-T/2-0.06:-D/2+T/2+0.06); } }
    // 天花板：一樓（輕鋼架＋燈）、二樓（屋頂）
    { const c0=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c0.rotation.x=Math.PI/2; c0.position.y=L.ceil0; fb0.add(c0);
      const c1=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c1.rotation.x=Math.PI/2; c1.position.y=RY; fb1.add(c1);
      for(const [x,z] of [[-1.4,-2.0],[1.0,-2.0],[-1.4,2.0],[1.0,2.0],[4.6,-1.0],[4.6,5.8],[-5.4,-1.4],[0.8,5.6]]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.6),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(x,L.ceil0-0.01,z); fb0.add(p); }
      for(const x of [-1.6,0.0,1.6,3.2,5.4]) for(const z of [-4.4,-0.2]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(0.2,3.2),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(x,RY-0.01,z); fb1.add(p); } }
    b0.build(fb0); b1.build(fb1); }

  // ---- 家具（程序化備用）＋互動點 ----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables, D=L.D; const b0=new TK.Bin(), b1=new TK.Bin();
    const up1=new THREE.Group(); up1.position.y=Y1; fb1.add(up1);   /* 二樓的桌椅（Z3.desk／chair 以地面為準） */
    const dummy={blockRect(){}};   /* 導航在 buildNav 裡擋了 */
    const books=W3.canvasTex('llBooks',256,64,(c,w,h)=>{ const cols=['#5a1f24','#1f3350','#2f4a3a','#3a2f2a','#6b5a3a','#8c3b47','#d9d3c6','#283a52']; let s=5; const rr=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; c.fillStyle='#2a2420'; c.fillRect(0,0,w,h); let x=0; while(x<w){ const bw=4+rr()*7, bh=h*(0.62+rr()*0.38); c.fillStyle=cols[(rr()*cols.length)|0]; c.fillRect(x,h-bh,bw,bh); x+=bw+1; } });
    const bookM=new THREE.MeshStandardMaterial({map:books,roughness:0.8}); bookM.userData.seeThrough=true; const shelfM=M('#9aa0a6',{rough:0.55}); shelfM.userData.seeThrough=true; const endM=M('#6b4a33',{rough:0.6}); endM.userData.seeThrough=true;
    // 書架：雙面（range）、靠牆（wall）、期刊展示架（display）
    for(const s of L.shelves){ const grp=s.lv?lv1:lv0, y=s.lv?Y1:0, g=new THREE.Group(); grp.add(g); const sb=new TK.Bin();
      if(s.kind==='range'){ const len=s.z1-s.z0, cz=(s.z0+s.z1)/2; sb.add(shelfM,TK.boxG(0.5,s.h,len,1.2),s.x,y+s.h/2,cz,0,{noShadow:true}); for(const zz of [s.z0,s.z1]) sb.add(endM,TK.boxG(0.54,s.h+0.04,0.03),s.x,y+s.h/2,zz);
        for(let k=0;k<s.levels;k++){ const yy=y+0.12+k*(s.h-0.2)/s.levels; for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(len-0.06,(s.h-0.2)/s.levels-0.04),bookM); p.position.set(s.x+sx*0.252,yy+((s.h-0.2)/s.levels)/2,cz); p.rotation.y=sx*Math.PI/2; g.add(p); } } }
      else { const w=s.x1-s.x0, d=s.z1-s.z0, cx=(s.x0+s.x1)/2, cz=(s.z0+s.z1)/2; sb.add(shelfM,TK.boxG(w,s.h,d,1.2),cx,y+s.h/2,cz,0,{noShadow:true});
        const ry={E:Math.PI/2,W:-Math.PI/2,S:0,N:Math.PI}[s.face], along=(s.face==='E'||s.face==='W')?d:w, n=s.levels||4;
        for(let k=0;k<n;k++){ const yy=y+0.12+k*(s.h-0.2)/n; const p=new THREE.Mesh(new THREE.PlaneGeometry(along-0.06,(s.h-0.2)/n-0.04),s.kind==='display'?M(['#e8e2d4','#c9b48a','#9fb3c4'][k%3]):bookM); const off=0.01+((s.face==='E'||s.face==='W')?w:d)/2;
          p.position.set(cx+(s.face==='E'?off:s.face==='W'?-off:0),yy+((s.h-0.2)/n)/2,cz+(s.face==='S'?off:s.face==='N'?-off:0)); p.rotation.y=ry; g.add(p); } }
      sb.build(g);
      if(s.sign){ const sp=new THREE.Mesh(s.signW?new THREE.PlaneGeometry(s.signW,s.signW/4):new THREE.PlaneGeometry(Math.max(1.0,s.sign.length*0.17),0.22),   /* signW：書架端的分類牌固定寬（書架間距 1.6 m，照字數算會互相重疊；字由 signTex 自動縮）*/ new THREE.MeshBasicMaterial({map:TK.signTex(s.sign,{bg:'#24303a',color:'#f3efe4'})}));
        if(s.kind==='range'){ sp.position.set(s.x,y+s.h+0.16,s.z1+0.03); } else { const ry={E:Math.PI/2,W:-Math.PI/2,S:0,N:Math.PI}[s.face]; const off=((s.face==='E'||s.face==='W')?(s.x1-s.x0):(s.z1-s.z0))/2+0.02; sp.position.set((s.x0+s.x1)/2+(s.face==='E'?off:s.face==='W'?-off:0),y+s.h+0.16,(s.z0+s.z1)/2+(s.face==='S'?off:s.face==='N'?-off:0)); sp.rotation.y=ry; }
        grp.add(sp); }
      if(s.it) IT.push(Object.assign({x:s.it.x,z:s.it.z,radius:1.1,lv:s.lv,label:'看書架：'+(s.sign||''),look:s.look},s.sign==='參考書'?{flag:'readReserve'}:{})); }   /* 看過指定參考書＝開學待辦的「教科書」那一項（AA_110 6-4：或在法律學院圖書館看指定參考書）*/
    // 桌子、椅子、座位
    const seats=zone.seats=seatsOf(L);
    for(const tb of L.tables){ const g=tb.lv?up1:fb0; Z3.desk(g,dummy,tb.x,tb.z,0,tb.w,tb.d,'#b08a62','wood');
      if(tb.lamps) for(let i=0;i<tb.n;i++){ const sx=tb.x-tb.w/2+tb.w*(i+0.5)/tb.n; const lamp=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.3,6),M('#c9a24f')); lamp.position.set(sx,0.92,tb.z); fb0.add(lamp); const sh=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.14,12,1,true),M('#2f5d50',{rough:0.5})); sh.position.set(sx,1.08,tb.z); fb0.add(sh); } }
    for(const rm of L.rooms) if(rm.table) Z3.desk(fb0,dummy,rm.table.x,rm.table.z,0,rm.table.w,rm.table.d,'#d8d2c4');
    { const C=L.carrels, cw=(C.x1-C.x0)/C.n; for(let i=0;i<C.n;i++){ const cx=C.x0+cw*(i+0.5); b0.add(MAT.wood(),TK.boxG(cw-0.06,0.04,C.z1-C.z0),cx,0.74,(C.z0+C.z1)/2); for(const sx of [-1,1]) b0.add(MAT.woodD(),TK.boxG(0.03,1.2,C.z1-C.z0),cx+sx*(cw/2-0.02),0.6,(C.z0+C.z1)/2); } }
    for(const st of seats){ const g=st.lv?up1:fb0; Z3.chair(g,st.x,st.z,st.yaw,st.table&&st.table.startsWith('disc')?'#3e4a5c':'#8a6a4a');
      const label=st.carrel?'坐下讀書（靠窗）':(st.table.startsWith('disc')?'坐下（討論室）':'坐下讀書'); IT.push({x:st.x,z:st.z,radius:0.8,lv:st.lv,label,seat:st,study:true}); }
    // 櫃台、館員工作區
    { const C=L.counter, SA=L.staffArea; b0.add(MAT.wood(),TK.boxG(C.x1-C.x0,1.05,C.z1-C.z0),(C.x0+C.x1)/2,0.525,(C.z0+C.z1)/2); b0.add(MAT.granite(),TK.boxG(C.x1-C.x0+0.06,0.05,C.z1-C.z0+0.08),(C.x0+C.x1)/2,1.075,(C.z0+C.z1)/2);
      b0.add(MAT.woodD(),TK.boxG(SA.x1-SA.x0,1.2,SA.sortZ1-SA.sortZ0),(SA.x0+SA.x1)/2,0.6,(SA.sortZ0+SA.sortZ1)/2); b0.add(MAT.woodD(),TK.boxG(0.2,1.1,SA.z1-SA.sortZ1),SA.x0+0.1,0.55,(SA.sortZ1+SA.z1)/2);
      b0.add(M('#2b2f33',{rough:0.4}),TK.boxG(0.5,0.32,0.04),C.x0+1.4,1.32,C.z0+0.2); b0.add(M('#2b2f33',{rough:0.4}),TK.boxG(0.5,0.32,0.04),C.x0+2.6,1.32,C.z0+0.2);
      { const look='櫃台：借書、還書、借討論室都在這裡辦。館員正把一疊還回來的書一本一本掃條碼，抬頭說：「還書放旁邊的還書口就好。」';   /* 服務學習（一）在這裡報到（AA_110 6-1；classes3d.js 的 DOORS.lawlib_desk）：有報到時段時多一個「報到」，沒有時照舊是說明 */
        IT.push(Object.assign({x:C.it.x,z:C.it.z,radius:C.it.r,lv:0,label:'櫃台',look},typeof CLS!=='undefined'&&CLS.DOORS&&CLS.DOORS.lawlib_desk?{door:'lawlib_desk',onInteract:()=>CLS.doorInteract(GAME,'lawlib_desk',{look})}:{})); } }
    // 防盜感應門柱
    for(const [x,z] of L.gates){ b0.add(M('#c9ccd0',{rough:0.35}),TK.boxG(0.08,1.55,0.5),x,0.775,z); }
    // 房間：影印機、白板、看房間的互動點
    for(const rm of L.rooms){ if(rm.copiers){ for(const cx of rm.copiers){ b0.add(M('#e6e4de',{rough:0.5}),TK.boxG(0.65,1.0,0.6),cx,0.5,-D/2+0.45); b0.add(M('#3a3d40',{rough:0.5}),TK.boxG(0.6,0.12,0.5),cx,1.06,-D/2+0.45); } IT.push({x:rm.it.x,z:rm.it.z,radius:rm.it.r,lv:0,label:'影印',look:rm.look}); }
      if(rm.kind==='office') IT.push({x:(rm.door[0]+rm.door[1])/2,z:L.frontZ+0.75,radius:1.0,lv:0,label:rm.label,look:rm.look}); }
    for(const f of L.furniture){ const b=f.lv?b1:b0, y=f.lv?Y1:0;
      if(f.type==='whiteboard'){ b.add(M('#f4f4f0',{rough:0.3}),(f.face==='E'||f.face==='W')?TK.boxG(0.04,1.0,f.w):TK.boxG(f.w,1.0,0.04),f.x,y+1.5,f.z); const rm=L.rooms.find(q=>q.id===f.room); if(rm) IT.push({x:(rm.door[0]+rm.door[1])/2,z:L.frontZ-0.6,radius:0.6,lv:0,label:'看看'+rm.label,look:rm.look}); }   /* 看房間的互動點在門進來的地方（桌子南北向擺；白板在側牆——2026-10-13 LAWWW2 回報原本在北牆會擋到北窗）*/
      else if(f.type==='newbooks'){ b.add(MAT.woodD(),TK.boxG(f.w,0.85,f.d),f.x,y+0.425,f.z); for(let i=0;i<6;i++) b.add(M(['#5a1f24','#1f3350','#d9d3c6','#2f4a3a','#c9a24f','#8c3b47'][i]),TK.boxG(0.17,0.24,0.03),f.x-f.w/2+0.2+i*0.28,y+0.97,f.z+(i%2?0.15:-0.1),0.15*(i-2.5)); IT.push({x:f.x,z:f.z+f.d/2+0.7,radius:1.1,lv:f.lv,label:'看新書展示',look:f.look}); }
      else if(f.type==='opac'){ b.add(M('#3a3d40',{rough:0.5}),TK.boxG(0.4,1.05,0.35),f.x,y+0.525,f.z); b.add(M('#20262c',{rough:0.3}),TK.boxG(0.42,0.3,0.05),f.x,y+1.25,f.z-0.12,0,{rx:-0.3}); IT.push({x:f.x,z:f.z-0.75,radius:0.75,lv:f.lv,label:'館藏查詢',look:L.opacLook}); }
      else if(f.type==='notice'){ const bb=W3.bulletin(); bb.position.set(f.x,y,f.z+0.06); lv0.add(bb); IT.push({x:f.x,z:f.z+0.9,radius:1.0,lv:f.lv,label:'看公告',look:f.look}); }
      else if(f.type==='cart'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=f.ry||0; const sb=new TK.Bin(); sb.add(M('#9aa0a6',{rough:0.5}),TK.boxG(0.9,0.04,0.45),0,0.35,0); sb.add(M('#9aa0a6',{rough:0.5}),TK.boxG(0.9,0.04,0.45),0,0.8,0); sb.add(bookM,TK.planeG(0.84,0.3),0,0.55,0.23); sb.build(g); (f.lv?fb1:fb0).add(g); }
      else if(f.type==='stool'){ b.add(M('#4a6c8c',{rough:0.6}),new THREE.CylinderGeometry(0.2,0.24,0.42,14),f.x,y+0.21,f.z); }
      else if(f.type==='plant'){ b.add(MAT.graniteD(),new THREE.CylinderGeometry(f.r,f.r*0.85,0.5,14),f.x,y+0.25,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.3,1),f.x,y+1.05,f.z); } }
    // 安全梯的門（二樓東牆，關著）
    { const EM=L.emergency; b1.add(MAT.frame(),TK.boxG(0.1,2.3,1.1),EM.x-0.06,Y1+1.15,EM.z); b1.add(M('#7a8288',{rough:0.4}),TK.boxG(0.04,2.15,0.95),EM.x-0.12,Y1+1.1,EM.z); IT.push({x:EM.x-0.7,z:EM.z,radius:1.0,lv:EM.lv,label:EM.label,look:EM.look}); }
    b0.build(fb0); b1.build(fb1);
    // 指標（中文字一直顯示：正式模型沒有字）
    for(const s of L.signs){ const y=(s.lv?Y1:0)+s.y; const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.16),new THREE.MeshBasicMaterial({map:TK.signTex(s.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(s.x,y,s.z); sp.rotation.y=s.ry||0; (s.lv?lv1:lv0).add(sp); }
    return seats; }

  // ---- 區域 ----
  const lawlib={ id:'lawlib', name:'法律學院圖書館', indoor:true, camDist:4.4, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], slabs=[], outs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},seeThru:true,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs) B3.setOutView(o,h,weather,night); },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; } };
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,slabs); buildFurniture(E,L,lv0,lv1,fb0,fb1,zone); windowViews(L,lv0,lv1,outs);
    // 樓梯可以點的面（點地面移動；一直在，正式模型載入後也用這幾片）
    for(const s of [ss.a,ss.ld,ss.b,ss.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.top)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      /* 點在一跑樓梯上＝走完這一跑（engine3d.js；任務 #42）：[下面那一端, 上面那一端] */
      const ax=(S.A.x0+S.A.x1)/2, bx=(S.B.x0+S.B.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===ss.a) m.userData.stairEnds=[{x:ax,z:S.A.z0-0.6,lv:0},{x:ax,z:ldz,lv:0}]; if(s===ss.b) m.userData.stairEnds=[{x:bx,z:ldz,lv:0},{x:bx,z:S.B.z0-0.6,lv:1}]; }
    const lights=[]; for(const [x,y,z,on,off] of L.lights){ const l=new THREE.PointLight(0xfff0d8,off,18,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    // 互動點（每一個都標樓層）
    const IT=E.interactables, EN=L.entrance;
    IT.push({x:EN.exit.x,z:EN.exit.z,radius:EN.exit.r,lv:0,label:'回法律系館B大廳',exit:{to:'wancai',spawn:Object.assign({},HALL)}});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）；書架和書的材質加上網點透空（擋住鏡頭時）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.lawlib_interior']){ ASSETS.loadOne('bldg.lawlib_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const root=c.scene.clone(true);
      B3.attachFormal(zone,root,fb0,fb1,lv0,lv1,walls,walkMeshes);
      root.traverse(o=>{ if(o.isMesh&&o.material){ for(const m of (Array.isArray(o.material)?o.material:[o.material])){ if(/^ll_(shelf|book|endpanel|journal)/.test(m.name||'')){ m.userData.seeThrough=true; if(E.patchSeeThrough) E.patchSeeThrough(m); } } } });
      for(const o of outs){ o.position.copy(o.userData.fpos); const [fw,fh]=o.userData.fsize; o.scale.set(fw/o.geometry.parameters.width,fh/o.geometry.parameters.height,1); } }).catch(e=>console.warn('法律學院圖書館正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };
  return {lawlib,stairSurfs,buildNav,seatsOf,HALL};
})();
Z3.ZONES.lawlib=LL3.lawlib;
