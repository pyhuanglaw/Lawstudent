/* ===== 總圖書館大廳（總圖第一階段，D43）：一樓大廳＋中央大樓梯（帝國式：中間一跑上到平台、兩側兩跑折返）＋電梯＋二樓自習區 =====
   使用者需求 21：「將相同系統擴展到萬才館、總圖與主要建築，實作電梯和其他樓層」「圖書館可進入閱讀區、自習區」。
   配置：src/data/library_layout.js（Blender 正式模型 tools/blender/library_interior.py 讀同一份，兩邊的位置一定一致）。
   區域：校園的總圖門口 → library_hall（這個檔案，兩層導航）→ 二樓東側的樓梯間或電梯「3F 閱覽區」→ library（zones3d.js 現有的閱覽室，
         座標、座位、劇情人物位置都不動；閱覽室的出口改成樓梯間、多一部電梯回大廳）。
   劇情對照：小安的「總圖的下午」寫的是「二樓靠牆的長桌」→ 二樓自習區西側的長桌（zone.seats[0]、[1]）；陳語彤說「我看過你在三樓」、
         事件「圖書館三樓」→ 閱覽室在三樓。
   導航：兩層 NavGrid（1F y=0、2F y=5.0）；三跑樓梯和平台兩層共用（D36）；電梯照霖澤館（B3.buildElevator），多一個「別的區域」的樓層（3F 閱覽區）。
   畫面：程序化備用模型（正式模型載入前、載入失敗時）；正式模型（ASSETS 'bldg.library_interior'）載入後由 B3.attachFormal 換掉。 */
'use strict';
const LB3=(function(){
  const LAYOUT=()=>LIBRARY_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const CAMPUS={x:80,z:0,yaw:-Math.PI/2};        // 從總圖出去：門廊前面（和舊的「離開圖書館」一樣）
  const riseOf=L=>L.floors[1].y/(L.stair.center.risers+L.stair.side.risers);   // 1F→2F 30 階，一階 16.7 cm

  // ---- 樓梯的高度：中間那一跑往北（−z）爬、兩側往南（+z）爬回二樓；連續斜面給碰撞與找路，畫面上一階一階（tread／rise／low）----
  function stairSurfs(L){ const S=L.stair, r=riseOf(L), t=S.tread, C=S.center, LD=S.landing, SD=S.side, nc=C.risers, ns=SD.risers;
    const c={x0:C.x0,x1:C.x1,z0:C.z0+t/2,z1:C.z1,axis:'z',ya:nc*r,yb:0,tread:t,rise:r,low:'z1'};
    const ldc={x0:C.x0,x1:C.x1,z0:C.z0,z1:C.z0+t/2,y:LD.y};                       // 中間那一跑最上面一階（和平台同高）的後半
    const ld={x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:LD.z1,y:LD.y};
    const sides=S.sides.map(sd=>({x0:sd.x0,x1:sd.x1,z0:SD.z0,z1:SD.z1-t/2,axis:'z',ya:LD.y,yb:LD.y+ns*r,tread:t,rise:r,low:'z0'}));
    const tops=S.sides.map(sd=>({x0:sd.x0,x1:sd.x1,z0:SD.z1-t/2,z1:SD.z1,y:LD.y+ns*r}));
    return {c,ldc,ld,sides,tops,all:[ld,ldc,c].concat(sides,tops)}; }

  // ---- 導航：兩層 ----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, C=S.center, SD=S.side, CO=L.core, U=L.upper, EL=L.elevator, V=L.vestibule, GT=L.gates;
    const mk=()=>new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1); const nav0=mk(), nav1=mk().setFloor(Y1); const ss=stairSurfs(L);
    // 一樓
    nav0.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);
    for(const s of ss.all) nav0.addSurf(Object.assign({},s));
    for(const sx of [-1,1]){ const sd=S.sides[sx<0?0:1];
      nav0.blockRect(sx*(S.railX-0.2+CO.x1+0.1)/2,(CO.z0+CO.z1)/2,CO.x1+0.1-(S.railX-0.2),CO.z1-CO.z0+0.04,0);   // 樓梯外側的實心核心（兩側一樓：書架牆）＋外側欄杆那一排
      nav0.blockRect((sd.x0+sd.x1)/2,SD.z1,sd.x1-sd.x0,0.3,0);                 // 兩側那一跑的最上面一階（5 m 高）面向大廳的那一排：第 0 層走到這裡要換到第 1 層，不能從大廳直接走進去
      nav0.blockRect(sx*(C.x1+S.sides[1].x0)/2,(C.z0+C.z1)/2,S.sides[1].x0-C.x1,C.z1-C.z0+0.04,0); }   // 中間那一跑和兩側之間的矮牆
    for(const [x,z] of [[-CO.x1,U.band.z1],[CO.x1,U.band.z1],[-CO.x1,GT.z],[CO.x1,GT.z]]) nav0.blockCircle(x,z,0.62);   // 中庭四角的柱子：柱座半徑 0.36＋半格（0.5 m 格子只看格子中心；原本 0.35 只擋到一兩格，斜著走會穿進柱子，使用者 2026-10-16 截圖）
    for(const sx of [-1,1]) nav0.blockRect(sx*V.x1,(V.z0+V.z1)/2,0.24,V.z1-V.z0+0.1,0);   // 門廳兩側的牆
    for(const px of GT.posts) nav0.blockRect(px,GT.z,GT.postW,GT.postD,0);                 // 入口閘門
    { const ep=GT.posts[GT.posts.length-1]; for(const sx of [-1,1]) nav0.blockRect(sx*(ep+V.x1)/2,GT.z,V.x1-ep,0.24,0); }
    // 二樓：先整層擋起來，再開出連廊、兩翼、兩側那一跑
    nav1.fillBlocked(); for(const a of [U.band].concat(U.wings)) nav1.freeRect(a.x0,a.z0,a.x1,a.z1);
    for(let i=0;i<S.sides.length;i++){ const sd=S.sides[i]; nav1.freeRect(sd.x0,SD.z0,sd.x1,SD.z1); nav1.addSurf(Object.assign({},ss.sides[i])); nav1.addSurf(Object.assign({},ss.tops[i])); }
    for(const sx of [-1,1]){ nav1.blockRect(sx*S.railX,(CO.z0+SD.z1-0.2)/2,0.3,SD.z1-0.2-CO.z0,0);     // 兩翼靠樓梯那一邊的欄杆（最上面那一排留開口：樓梯上來接連廊）
      nav1.blockRect(sx*U.band.x1,(U.band.z1+D/2)/2,0.3,D/2-U.band.z1,0); }                              // 兩翼靠中庭那一邊的欄杆
    nav1.blockRect(0,SD.z1,2*S.sides[1].x0+0.04,0.3,0);                                                   // 連廊北邊（中間那一跑上方）的欄杆
    nav1.blockRect(0,U.band.z1,U.band.x1-U.band.x0+0.04,0.3,0);                                           // 連廊南邊（中庭上方）的欄杆
    for(const nav of [nav0,nav1]){ nav.blockRect(EL.x0-0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect(EL.x1+0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect((EL.x0+EL.x1)/2,EL.z1+0.1,EL.x1-EL.x0+0.44,0.24,0); }   // 電梯井道玻璃（西、東、南）
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 窗外的景（程序化）：校園的樹、椰子樹、遠處的系館；晚上是路燈 ----
  const outsideTex=(night)=>W3.canvasTex('lbout'+(night?'N':''),512,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); if(night){ g.addColorStop(0,'#0e1528'); g.addColorStop(1,'#2a3350'); } else { g.addColorStop(0,'#9cc2e0'); g.addColorStop(1,'#e8eef0'); } x.fillStyle=g; x.fillRect(0,0,w,h);
    x.fillStyle=night?'#3a3530':'#b99a82'; x.fillRect(300,h*0.34,180,h*0.4); x.fillStyle=night?'rgba(255,220,160,0.7)':'#e7ddcc'; for(let i=0;i<6;i++) x.fillRect(312+i*28,h*0.42,14,h*0.12);
    x.fillStyle=night?'#1b2a22':'#5f8a55'; for(let i=0;i<8;i++){ const cx=i*70+10, r=34+((i*29)%22); x.beginPath(); x.arc(cx,h*0.6,r,0,Math.PI*2); x.fill(); }
    x.fillStyle=night?'#2a2c30':'#bcb8ae'; x.fillRect(0,h*0.74,w,h*0.26); if(night){ x.fillStyle='rgba(255,214,150,0.85)'; for(const lx of [60,230,400]) x.fillRect(lx,h*0.6,4,4); } });

  /* 窗外的景（正式）：遊戲裡校園實際的畫面——從總圖門口往西拍椰林大道（avenue，正面玻璃）、從總圖南側拍草地與系館（lawn，側窗、平台的大窗）；
     白天 11:00、晚上 20:30，1024×512（tools/shots/library_views.py 用 fast_shots.py 拍；改了總圖附近或椰林大道可以重拍）。
     已經是調過色的畫面：不再做一次色調映射（toneMapped=false）。載不到（例如 claude.ai artifact 版沒有這些檔案）就用上面程序化畫的 */
  const VIEW_URL='assets/models/env/library_view_';
  function viewOf(kind,night){ return W3.viewPhoto(kind,night,VIEW_URL); }   /* 和其他窗景同一個快取（W3.viewPhoto；換區域時釋放）*/
  /* 窗的長寬比和景（2:1）不一樣：在平面的 UV 上裁一塊（不拉長）；fx＝橫向裁哪裡（0 左、1 右），一排側窗依序往右，合起來像一張全景 */
  function cropUV(geo,a,fx){ const uv=geo.attributes.uv; let uw=1, vh=1; if(a<2) uw=a/2; else vh=2/a; const u0=(1-uw)*fx, v0=(1-vh)*0.5; for(let i=0;i<uv.count;i++) uv.setXY(i,u0+uv.getX(i)*uw,v0+uv.getY(i)*vh); uv.needsUpdate=true; }

  /* 有景深的窗景（ART-LIB-VIEW-1018，使用者 10-18「總圖窗景很假」；LAWWW2-C）：
     原本：每一扇窗一張平面貼圖，景貼在窗上，走動時景跟著窗一起動；照片是很早以前拍的，裡面還是方盒建築、7 m 高往下看。
     現在：一面牆一張大平面（窗洞以外被正式模型的牆擋住），用 W3.windowMat 的視差——景在窗外 depth 公尺遠的地方，走動、上下樓時前後關係對；
     照片重拍（tools/shots/library_views.py：視線高度、水平和垂直都是 90°，1024×1024；sxy＝(1, 0.5)）：
       正面玻璃＝從總圖門口往西的椰林大道（depth 35）；側窗、平台的大窗＝總圖紅磚側翼和中庭草地（depth 14）。
     只在正式模型載入後用（備用模型的牆沒有窗洞） */
  function parallaxViews(zone,L,lv0,lv1){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, LD=L.stair.landing, V=L.vestibule; const PO=zone.pOuts=[];
    const mk=(w,h,x,y,z,ry,grp,kind,depth)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),W3.windowMat(depth)); m.material.uniforms.sxy.value.set(1,0.5); m.position.set(x,y,z);   /* 照片水平、垂直都是 90°（1:1）*/ m.rotation.y=ry; m.userData.view=kind; m.userData.libOut=true; grp.add(m); PO.push(m); };
    mk(D+2,3.6,-W/2-0.35,2.3,0,Math.PI/2,lv0,'lawn',14); mk(D+2,3.6,-W/2-0.35,Y1+2.2,0,Math.PI/2,lv1,'lawn',14);   // 西側一排窗（一樓、二樓）
    { const gw=LD.x1-LD.x0+2, gh=RY-LD.y+1; mk(gw,gh,0,LD.y+1.0+gh/2-1,-D/2-0.6,0,lv0,'lawn',14); }                   // 大樓梯平台後面的大窗
    mk(V.x1-V.x0+12,RY*2+4,0,2.0,D/2+1.2,Math.PI,lv0,'avenue',35);                                                     // 正面的玻璃帷幕
    if(zone.applyTime&&typeof GAME!=='undefined'&&GAME.G) zone.applyTime(GAME.G.hour,GAME.G.weather); }

  // ---- 程序化備用模型 ----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,slabs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, S=L.stair, C=S.center, SD=S.side, LD=S.landing, CO=L.core, U=L.upper, V=L.vestibule, MAT=B3.MAT, r=riseOf(L), t=S.tread;
    const b0=new TK.Bin(), b1=new TK.Bin();
    const floorM=(w,d)=>{ const tx=W3.stoneTex('#e3d9c6').clone(); tx.needsUpdate=true; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:tx,roughness:0.65}); };
    { const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),floorM(W,D)); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; fb0.add(f); walkMeshes.push(f); }
    // 二樓樓板（連廊、兩翼）：板子的底面就是一樓的天花板
    /* 東翼的樓板讓出電梯井（玻璃井道，車廂上下穿過二樓；2026-10-11 v9.5 審查：原本樓板整塊蓋住井口——車廂上下時被樓板擋住，車廂不在二樓時井口像一片走不過去的地板）。
       Blender 正式模型（tools/blender/library_interior.py）用同一個規則挖洞；鏡頭用的樓板範圍（slabs）也一樣 */
    const slab=(a)=>{ for(const q of B3.slabPieces(a,[L.elevator])){ b1.add(MAT.plaster(),TK.boxG(q.x1-q.x0,ST,q.z1-q.z0,1.2),(q.x0+q.x1)/2,Y1-ST/2,(q.z0+q.z1)/2);
        const f=new THREE.Mesh(new THREE.PlaneGeometry(q.x1-q.x0,q.z1-q.z0),floorM(q.x1-q.x0,q.z1-q.z0)); f.rotation.x=-Math.PI/2; f.position.set((q.x0+q.x1)/2,Y1+0.004,(q.z0+q.z1)/2); f.receiveShadow=true; f.userData.walkLv=1; fb1.add(f); walkMeshes.push(f); }
      if(slabs) slabs.push(...B3.slabPieces(a,[L.elevator],{lv:1,y:Y1,t:ST})); };   /* 鏡頭不穿過樓板（engine3d.js 的 slabClip） */
    { const EL=L.elevator; const f=new THREE.Mesh(new THREE.PlaneGeometry(EL.x1-EL.x0,EL.z1-EL.z0),new THREE.MeshBasicMaterial({visible:false})); f.rotation.x=-Math.PI/2; f.position.set((EL.x0+EL.x1)/2,Y1+0.004,(EL.z0+EL.z1)/2); f.userData.walkLv=1; f.userData.dyn=true; lv1.add(f); walkMeshes.push(f); }   /* 井口：點地面用（不畫）；車廂在二樓、門開著才走得進去（導航決定） */
    slab(U.band); for(const a of U.wings){ const b=Object.assign({},a); if(b.z0<U.band.z0&&b.z1>U.band.z0-0.01&&Math.abs(b.x1)<CO.x1+0.01) b.z1=U.band.z0; slab(b); }
    // 樓梯：每一階一塊石材（實心到地面）、平台（實心）、兩側那一跑和中間那一跑之間的矮牆（一階一階）、外側的實心核心（一樓）
    const stone=MAT.graniteD();
    for(let k=0;k<C.risers;k++){ const top=(k+1)*r, z1=C.z1-k*t; b0.add(stone,TK.boxG(C.x1-C.x0,top,t,2.4),(C.x0+C.x1)/2,top/2,z1-t/2); }
    b0.add(stone,TK.boxG(LD.x1-LD.x0,LD.y,LD.z1-LD.z0,2.4),(LD.x0+LD.x1)/2,LD.y/2,(LD.z0+LD.z1)/2);
    /* 兩側那一跑：懸空的樓梯（踏階＋斜的樓梯板），底下是花台與室內樹（走不進去：導航上那裡是樓梯的格子，高度接不上；前緣 0.8 m 高的石材花台擋著）*/
    const slope=Math.atan2(Y1-LD.y,SD.z1-SD.z0), slen=Math.hypot(Y1-LD.y,SD.z1-SD.z0);
    for(const sd of S.sides){ const cx=(sd.x0+sd.x1)/2, w=sd.x1-sd.x0;
      for(let k=0;k<SD.risers;k++){ const top=LD.y+(k+1)*r, z0=SD.z0+k*t; b0.add(stone,TK.boxG(w,r+0.02,t,2.4),cx,top-(r+0.02)/2,z0+t/2); }
      b0.add(MAT.plaster(),TK.boxG(w,0.32,slen,1.2),cx,(LD.y+Y1)/2-0.16,(SD.z0+SD.z1)/2,0,{rx:-slope});
      b0.add(MAT.graniteD(),TK.boxG(w-0.1,0.8,0.7,2.4),cx,0.4,SD.z1-0.4); b0.add(MAT.graniteD(),TK.boxG(w-0.1,0.45,SD.z1-SD.z0-0.8,2.4),cx,0.225,(SD.z0+SD.z1-0.75)/2);
      for(const [pz,ph,pr] of [[SD.z1-1.4,2.6,0.75],[SD.z0+1.6,1.5,0.55]]){ b0.add(MAT.woodD(),new THREE.CylinderGeometry(0.05,0.05,ph*0.7,8),cx,0.45+ph*0.35,pz); b0.add(MAT.plant(),new THREE.IcosahedronGeometry(pr,1),cx,0.45+ph*0.7+pr*0.5,pz); }
      for(let j=0;j<5;j++) b0.add(MAT.plant(),new THREE.IcosahedronGeometry(0.26,1),sd.x0+0.3+j*(w-0.6)/4,0.95,SD.z1-0.4); }
    for(const sx of [-1,1]) b0.add(MAT.plaster(),TK.boxG(CO.x1-S.railX+0.1,Y1-ST,CO.z1-CO.z0,1.2),sx*(S.railX-0.1+CO.x1)/2,(Y1-ST)/2,(CO.z0+CO.z1)/2);
    // 欄杆：玻璃欄板＋不鏽鋼扶手（樓梯兩側外緣、平台、二樓的連廊與兩翼）
    const rail=(grp,pts,x,along)=>{ for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(zb-za,yb-ya); if(len<0.05) continue;
        const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.95),MAT.glass()); const mid=new THREE.Vector3(along==='z'?x:(za+zb)/2,(ya+yb)/2+0.55,along==='z'?(za+zb)/2:x);
        gp.position.copy(mid); if(along==='z'){ gp.rotation.set(0,Math.PI/2,0); gp.rotateZ(-Math.atan2(yb-ya,zb-za)); } else gp.rotateZ(Math.atan2(yb-ya,zb-za)); gp.userData.noMerge=true; grp.add(gp);
        const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,len,8),MAT.steel()); hr.position.copy(mid).add(new THREE.Vector3(0,0.47,0)); hr.lookAt(along==='z'?x:zb,yb+1.02,along==='z'?zb:x); hr.rotateX(Math.PI/2); grp.add(hr); } };
    for(const sx of [-1,1]){ rail(lv0,[[C.z1,0],[C.z0,LD.y]],sx*(C.x1+0.03),'z'); rail(lv0,[[SD.z0,LD.y],[SD.z1,Y1]],sx*(S.sides[1].x0-0.03),'z');   // 中間那一跑兩側、兩側那一跑靠中間那一側（中間空著，看得到樓梯底下的植栽）
      rail(lv0,[[LD.z0,LD.y],[SD.z0,LD.y],[SD.z1,Y1]],sx*(S.railX-0.05),'z');                // 樓梯外緣（平台→兩側那一跑）
      rail(lv1,[[CO.z0,Y1],[SD.z1-0.3,Y1]],sx*(S.railX+0.02),'z'); rail(lv1,[[U.band.z1,Y1],[D/2,Y1]],sx*U.band.x1,'z'); }   // 兩翼的邊
    rail(lv1,[[-S.sides[1].x0,Y1],[S.sides[1].x0,Y1]],SD.z1,'x'); rail(lv1,[[U.band.x0,Y1],[U.band.x1,Y1]],U.band.z1,'x');   // 連廊北邊、南邊
    rail(lv0,[[LD.x0,LD.y],[LD.x1,LD.y]],LD.z0+0.05,'x');   /* 平台靠北牆那一邊（窗台） */
    // 柱子（中庭四角）
    for(const [x,z] of [[-CO.x1,U.band.z1],[CO.x1,U.band.z1],[-CO.x1,L.gates.z],[CO.x1,L.gates.z]]){ b0.add(M('#d9cbb0'),new THREE.CylinderGeometry(0.3,0.3,Y1-ST,16),x,(Y1-ST)/2,z); b1.add(M('#d9cbb0'),new THREE.CylinderGeometry(0.26,0.26,RY-Y1,16),x,Y1+(RY-Y1)/2,z); }
    // 外牆：北、西、東（兩層，一層一塊）、南面兩翼；正面中間＝挑高的玻璃帷幕（門廳）；北牆平台上方的大窗、西牆的窗（窗外的景）
    const wall=(x,z,w,h,y,ry,dir,m,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const wallM=M('#ece4d6');
    for(const [grp,y,h] of [[fb0,0,Y1],[fb1,Y1,RY-Y1]]){
      wall(0,-D/2,W,h,y,0,new THREE.Vector3(0,0,1),wallM,grp); wall(-W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(1,0,0),wallM,grp); wall(W/2,0,D,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),wallM,grp);
      for(const sx of [-1,1]) wall(sx*(V.x1+W/2)/2,D/2,W/2-V.x1,h,y,0,new THREE.Vector3(0,0,-1),wallM,grp); }
    /* 窗外的景：備用模型的牆沒有洞，景貼在牆的內側；正式模型的牆有窗洞，景搬到牆外面（fpos）、放大一點（斜著看也蓋得住窗洞）*/
    const outPlane=(w,h,x,y,z,ry,grp,fpos,kind,fx)=>{ const geo=new THREE.PlaneGeometry(w,h); cropUV(geo,w/h,fx==null?0.5:fx); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:outsideTex(false)})); m.position.set(x,y,z); m.rotation.y=ry; m.userData.libOut=true; m.userData.view=kind||'lawn'; if(fpos) m.userData.fpos=fpos; grp.add(m); outs.push(m); return m; };
    for(const [grp,y0] of [[lv0,1.1],[lv1,Y1+1.0]]) for(let z=-7.2;z<=7.3;z+=2.4){ if(grp===lv0&&L.b1Door&&Math.abs(z-L.b1Door.z)<0.1) continue;   /* 一樓 z −2.4 那一扇換成往 B1 的樓梯間門 */ outPlane(1.6,2.4,-W/2+T/2+0.02,y0+1.2,z,Math.PI/2,grp,new THREE.Vector3(-W/2-0.5,y0+1.2,z),'lawn',(7.2-z)/14.4); (grp===lv0?b0:b1).add(MAT.frame(),TK.boxG(0.08,2.56,1.76),-W/2+T/2+0.03,y0+1.2,z); }
    { const gw=LD.x1-LD.x0-0.6, gh=RY-LD.y-1.6; outPlane(gw,gh,0,LD.y+1.0+gh/2,-D/2+T/2+0.02,0,lv0,new THREE.Vector3(0,LD.y+1.0+gh/2,-D/2-0.6)); for(let x=-gw/2;x<=gw/2+0.01;x+=gw/4) b0.add(MAT.frame(),TK.boxG(0.1,gh,0.1),x,LD.y+1.0+gh/2,-D/2+T/2+0.05); for(const y of [LD.y+1.0,LD.y+1.0+gh/2,LD.y+1.0+gh]) b0.add(MAT.frame(),TK.boxG(gw,0.1,0.1),0,y,-D/2+T/2+0.05); }
    { const gw=V.x1-V.x0, gh=RY-0.2; const gp=new THREE.Mesh(new THREE.PlaneGeometry(gw,gh),MAT.glass()); gp.position.set(0,gh/2,D/2-0.02); gp.rotation.y=Math.PI; lv0.add(gp);
      for(let x=V.x0;x<=V.x1+0.01;x+=gw/6) b0.add(MAT.frame(),TK.boxG(0.12,gh,0.14),x,gh/2,D/2-0.06); for(const y of [3.0,Y1,Y1+2.4,gh]) b0.add(MAT.frame(),TK.boxG(gw,0.12,0.14),0,y,D/2-0.06);
      outPlane(gw+8,RY+2,0,RY/2,D/2+3.0,Math.PI,lv0,null,'avenue'); }
    // 門廳兩側的牆（一樓、3 m 高，木作）、館員辦公室的牆
    for(const sx of [-1,1]) b0.add(MAT.woodD(),TK.boxG(0.2,3.0,V.z1-V.z0),sx*V.x1,1.5,(V.z0+V.z1)/2);
    // 天花板：屋頂（9.6 m，中庭上方是天窗）＋一樓兩翼的嵌燈（二樓樓板底面）
    { const c=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c.rotation.x=Math.PI/2; c.position.y=RY; fb1.add(c);
      const sky=new THREE.Mesh(new THREE.PlaneGeometry(V.x1-V.x0-0.6,D/2-U.band.z1-0.8),new THREE.MeshBasicMaterial({color:0xeaf3f8})); sky.rotation.x=Math.PI/2; sky.position.set(0,RY-0.02,(U.band.z1+D/2)/2); fb1.add(sky);
      for(const sx of [-1,1]) for(let i=0;i<2;i++) for(let j=0;j<4;j++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.6),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(sx*(7.2+i*3.2),RY-0.01,-6.4+j*4.2); fb1.add(p); }
      for(const sx of [-1,1]) for(let i=0;i<2;i++) for(let j=0;j<5;j++){ const p=new THREE.Mesh(new THREE.CircleGeometry(0.13,12),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(sx*(7.0+i*3.2),Y1-ST-0.005,-7.2+j*3.6); fb0.add(p); } }
    b0.build(fb0); b1.build(fb1); }

  // ---- 家具（程序化）----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin(); const seats=zone.seats=[];
    const up1=new THREE.Group(); up1.position.y=Y1; fb1.add(up1);   /* 二樓的桌椅（Z3.desk／chair 以地面為準） */
    const books=W3.canvasTex('lbBooks',256,64,(c,w,h)=>{ const cols=['#2f5d50','#8c3b47','#e0b95b','#4a6c8c','#7b6a5a','#c46a4a','#d9d3c6']; let s=3; const rr=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; c.fillStyle='#3a2a20'; c.fillRect(0,0,w,h); let x=0; while(x<w){ const bw=5+rr()*8, bh=h*(0.6+rr()*0.4); c.fillStyle=cols[(rr()*cols.length)|0]; c.fillRect(x,h-bh,bw,bh); x+=bw+1; } });
    const bookM=new THREE.MeshStandardMaterial({map:books,roughness:0.8});
    const shelfRow=(b,x,y,z,w,ry)=>{ const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry||0; const sb=new TK.Bin(); sb.add(MAT.woodD(),TK.boxG(w,2.2,0.4),0,1.1,0); for(const yy of [0.15,0.68,1.21,1.74]){ sb.add(bookM,TK.planeG(w-0.1,0.42),0,yy+0.24,0.205,0,{noShadow:true}); } sb.build(g); return g; };
    for(const f of L.furniture){ const b=f.lv?b1:b0, y=f.lv?Y1:0, nav=f.lv?nav1:nav0, ry=f.ry||0, fb=f.lv?fb1:fb0;
      if(f.type==='lockers'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(M('#8c9196',{rough:0.5}),TK.boxG(f.w,1.9,f.d),0,0.95,0); for(let i=0;i<8;i++) for(let j=0;j<4;j++) sb.add(M('#6b7075',{rough:0.5}),TK.boxG(0.04,0.04,0.02),-f.w/2+0.2+i*(f.w-0.4)/7,0.3+j*0.45,f.d/2+0.01); sb.build(g); fb.add(g); nav.blockRect(f.x,f.z,f.w,f.d,ry,0.05);
        IT.push({x:f.x+Math.sin(ry)*0.9,z:f.z+Math.cos(ry)*0.9,radius:1.2,lv:f.lv,label:'看置物櫃',look:'置物櫃：投十元硬幣，閉館前要取回。大包包不能帶進自習區。'}); }
      else if(f.type==='returnBox'){ b.add(M('#3e5a48',{rough:0.6}),TK.boxG(0.7,1.1,0.6),f.x,y+0.55,f.z,ry); IT.push({x:f.x+Math.sin(ry)*0.9,z:f.z+Math.cos(ry)*0.9,radius:1.0,lv:f.lv,label:'看還書箱',look:'還書箱：閉館的時間也可以還書，隔天早上館員會處理。'}); nav.blockRect(f.x,f.z,0.7,0.6,ry,0.1); }
      else if(f.type==='notice'){ const bb=W3.bulletin(); bb.position.set(f.x,y,f.z); bb.rotation.y=ry; fb.add(bb); nav.blockRect(f.x,f.z,2.4,0.4,ry,0); IT.push({x:f.x+Math.sin(ry)*1.0,z:f.z+Math.cos(ry)*1.0,radius:1.4,lv:f.lv,label:'看公告',look:'公告：開放時間 8:00–22:00，期中考週延長到 24:00。一樓西側有新書展「城市與記憶」。二樓自習區請保持安靜。'}); }
      else if(f.type==='desk'){ b.add(MAT.wood(),TK.boxG(f.w,1.05,f.d),f.x,y+0.525,f.z); b.add(MAT.granite(),TK.boxG(f.w+0.1,0.05,f.d+0.1),f.x,y+1.07,f.z); b.add(MAT.woodD(),TK.boxG(f.w,0.8,0.5),f.x,y+0.4,f.z+f.d/2+0.45);
        nav.blockRect(f.x-0.2,f.z+0.5,f.w+1.4,1.8,0,0); IT.push({x:f.x,z:f.z-f.d/2-0.75,radius:1.3,lv:f.lv,label:'服務台',look:'服務台：借書、還書、預約、館際合作都在這裡辦。館員抬頭看了你一眼，又低頭繼續處理一疊還回來的書。'}); }
      else if(f.type==='copier'){ const n=f.nav; nav.blockRect(n[0],n[1],n[2],n[3],0,0.05);   /* 影印機（NPC-STORY-1028，LAWWW2-C）：導航一直擋；畫面先放一個方塊（不放在 fb：正式大廳模型載好會藏 fb），影印機的正式模型 ASSETS 'bldg.library_copier' 載好換掉 */
        const host=f.lv?lv1:lv0, cb=new THREE.Mesh(new THREE.BoxGeometry(0.6,1.0,0.62),M('#e3e0d6',{rough:0.5})); cb.position.set(f.x,y+0.5,f.z); cb.rotation.y=ry; cb.castShadow=cb.receiveShadow=true; host.add(cb);
        if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.library_copier']) ASSETS.loadOne('bldg.library_copier').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; const r=c.scene.clone(true); r.position.set(f.x,y,f.z); r.rotation.y=ry; r.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); host.add(r); cb.visible=false; }).catch(e=>console.warn('影印機正式模型載入失敗，用方塊',e)); }
      else if(f.type==='partition'){ b.add(MAT.woodD(),TK.boxG(f.w+0.05,1.2,f.d),f.x,y+0.6,f.z); }
      else if(f.type==='officeWall'){ const w=f.x1-f.x0; b.add(MAT.plaster(),TK.boxG(w,Y1-L.slabT,0.2,1.2),(f.x0+f.x1)/2,y+(Y1-L.slabT)/2,f.z); nav.blockRect((f.x0+f.x1)/2,(f.z+L.D/2)/2,w+0.1,L.D/2-f.z+0.1,0,0); }
      else if(f.type==='display'){ b.add(MAT.woodD(),TK.boxG(f.w,0.8,f.d),f.x,y+0.4,f.z); for(let i=0;i<5;i++) b.add(M(['#c46a4a','#4a6c8c','#e0b95b','#2f5d50','#d9d3c6'][i]),TK.boxG(0.22,0.03,0.3),f.x-f.w/2+0.3+i*0.45,y+0.82,f.z+(i%2?0.15:-0.15),0.2*(i-2));
        nav.blockRect(f.x,f.z,f.w,f.d,0,0.1); IT.push({x:f.x+f.w/2+0.8,z:f.z,radius:1.2,lv:f.lv,label:'看新書展示',look:'新書展「城市與記憶」：台北的老街、拆掉的市場、一本寫溫州街日式宿舍的散文集。'}); }
      else if(f.type==='sofa'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); const fab=M('#5d6a74',{rough:0.85}), fab2=M('#4b5862',{rough:0.85}), lg=M('#3a2a20',{rough:0.6});
        sb.add(fab2,new THREE.BoxGeometry(2.2,0.22,0.86),0,0.19,0); for(const sx of [-0.49,0.49]) sb.add(fab,new THREE.BoxGeometry(0.96,0.14,0.66),sx,0.37,0.08); sb.add(fab2,new THREE.BoxGeometry(2.0,0.52,0.2),0,0.56,-0.33,0,{rx:-0.08}); for(const sx of [-1,1]) sb.add(fab2,new THREE.BoxGeometry(0.16,0.34,0.86),sx*1.02,0.43,0); for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) sb.add(lg,new THREE.BoxGeometry(0.06,0.08,0.06),lx*1.0,0.04,lz*0.36); sb.build(sg);
        nav.blockRect(f.x,f.z,2.2,0.9,ry,0.1); if(f.seat) IT.push({x:f.x+Math.sin(ry)*0.7,z:f.z+Math.cos(ry)*0.7,radius:1.2,lv:f.lv,label:'坐在沙發上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); }
      else if(f.type==='armchair'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); const fab=M('#7a5a46',{rough:0.85});
        sb.add(fab,new THREE.BoxGeometry(0.8,0.36,0.78),0,0.2,0); sb.add(fab,new THREE.BoxGeometry(0.8,0.5,0.16),0,0.6,-0.32); for(const sx of [-1,1]) sb.add(fab,new THREE.BoxGeometry(0.14,0.24,0.78),sx*0.33,0.48,0); sb.build(sg);
        nav.blockRect(f.x,f.z,0.8,0.8,ry,0.05); if(f.seat) IT.push({x:f.x+Math.sin(ry)*0.75,z:f.z+Math.cos(ry)*0.75,radius:1.0,lv:f.lv,label:'坐在單人沙發上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); }
      else if(f.type==='racks'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(MAT.woodD(),TK.boxG(f.w,1.6,f.d),0,0.8,0); for(let i=0;i<6;i++) for(let j=0;j<3;j++) sb.add(M(j%2?'#efeae0':'#dcd6c8'),TK.planeG(0.5,0.34),-f.w/2+0.35+i*(f.w-0.7)/5,0.35+j*0.48,f.d/2+0.01,0,{noShadow:true}); sb.build(g); fb.add(g);
        nav.blockRect(f.x,f.z,f.w,f.d,ry,0.05); IT.push({x:f.x+Math.sin(ry)*1.0,z:f.z+Math.cos(ry)*1.0,radius:1.3,lv:f.lv,label:'看期刊報紙',look:'期刊報紙區：今天的報紙、這個月的雜誌。有一份法律期刊的封面是「AI 與著作權」。'}); }
      else if(f.type==='coreShelf'){ fb.add(shelfRow(b,f.x,y,f.z,f.w,ry)); nav.blockRect(f.x,f.z,f.w,0.4,ry,0.05); }
      else if(f.type==='shelf'){ fb.add(shelfRow(b,f.x,y,f.z,f.w,ry)); nav.blockRect(f.x,f.z,f.w,0.4,ry,0.05); }
      else if(f.type==='planter'){ b.add(MAT.graniteD(),new THREE.CylinderGeometry(f.r,f.r*0.9,0.6,16),f.x,y+0.3,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.25,1),f.x,y+1.15,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }
      else if(f.type==='studyTable'){ Z3.desk(up1,nav1,f.x,f.z,0,f.w,1.0,'#c9a57a','wood'); const n=f.seats||4;
        for(let i=0;i<n;i++){ const sx=f.x-f.w/2+f.w*(i+0.5)/n;
          const lamp=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.32,6),M('#c9a24f')); lamp.position.set(sx,Y1+0.92,f.z); fb1.add(lamp); const sh=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.16,12,1,true),M('#2f5d50',{rough:0.5})); sh.position.set(sx,Y1+1.1,f.z); fb1.add(sh);
          for(const s of [-1,1]){ const cz=f.z+s*0.8, yaw=s>0?Math.PI:0; Z3.chair(up1,sx,cz,yaw,'#5c3a21'); const seat={x:sx,z:cz,yaw,lv:1}; seats.push(seat); if((i+(s>0?1:0))%2===0) IT.push({x:sx,z:cz,radius:0.9,lv:1,label:'坐下讀書',seat,study:true}); } } } }
    b0.build(fb0); b1.build(fb1);
    // 門（關著：看得懂的說明）
    for(const d of L.doors){ const y=d.lv?L.floors[1].y:0, g=d.lv?fb1:fb0, ry=d.ry||0; const dg=new THREE.Group(); dg.position.set(d.x,y,d.z); dg.rotation.y=ry; const db=new TK.Bin(); db.add(MAT.frame(),TK.boxG(1.5,2.5,0.1),0,1.25,0); db.add(MAT.wood(),TK.boxG(1.3,2.35,0.06),0,1.18,0.05); db.build(dg); g.add(dg);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.35),new THREE.MeshBasicMaterial({map:TK.signTex(d.label,{bg:'#f4f2ec',fg:'#2b2b2b'})})); sg.position.set(0,2.85,0.16); dg.add(sg); (d.lv?lv1:lv0).attach(sg);
      const R=d.to&&typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS[d.to]:null;   /* 正式房間（rooms_glb3d.js 照 host_door 設 d.to、d.spawn：多媒體中心，AA_399 第 12 節）：出入口，標籤用 host_door.label */
      if(R&&typeof Z3!=='undefined'&&Z3.ZONES[d.to]){ IT.push({x:d.x+Math.sin(ry)*0.75,z:d.z+Math.cos(ry)*0.75,radius:1.0,lv:d.lv,label:(R.host_door&&R.host_door.label)||d.label,exit:{to:d.to,spawn:Object.assign({},d.spawn||R.spawn)}}); continue; }
      const goes=d.to&&typeof Z3!=='undefined'&&Z3.ZONES[d.to]&&typeof LIBRARY_UPPER_LAYOUTS!=='undefined'&&LIBRARY_UPPER_LAYOUTS.carrels;   /* 研究小間（CLOSED-SPACES-1023 第 3 項，src/library_upper3d.js）：門通到那個區域、站在研究小間的門廳 */
      IT.push(goes?{x:d.x+Math.sin(ry)*0.75,z:d.z+Math.cos(ry)*0.75,radius:1.0,lv:d.lv,label:d.label,exit:{to:d.to,spawn:Object.assign({},LIBRARY_UPPER_LAYOUTS.carrels.spawn)}}:{x:d.x+Math.sin(ry)*0.75,z:d.z+Math.cos(ry)*0.75,radius:1.15,lv:d.lv,label:d.label,look:d.closed}); }
    // 樓梯間的門（往 3F 閱覽區）
    { const SDR=L.stairDoor, y=L.floors[1].y; const dg=new THREE.Group(); dg.position.set(SDR.x,y,SDR.z); dg.rotation.y=-Math.PI/2; const db=new TK.Bin(); db.add(MAT.frame(),TK.boxG(1.6,2.6,0.12),0,1.3,0); db.add(M('#7a8288',{rough:0.4}),TK.boxG(1.4,2.45,0.06),0,1.22,0.06); db.build(dg); fb1.add(dg);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.4),new THREE.MeshBasicMaterial({map:TK.signTex('樓梯間　3F 閱覽區 ↑',{bg:'#2f5d50',color:'#ffffff'})})); sg.position.set(0,2.95,0.16); dg.add(sg); lv1.attach(sg); }
    // 樓梯間的門（往 B1，一樓西牆；CLOSED-SPACES-1023 第 2 項，LAWWW2-B 10-23）：門上的字在 signs
    if(L.b1Door){ const BD=L.b1Door; const dg=new THREE.Group(); dg.position.set(BD.x,0,BD.z); dg.rotation.y=Math.PI/2; const db=new TK.Bin(); db.add(MAT.frame(),TK.boxG(BD.w+0.2,2.4,0.12),0,1.2,0); db.add(M('#7a8288',{rough:0.4}),TK.boxG(BD.w,2.3,0.06),0,1.15,0.06); db.build(dg); fb0.add(dg); }
    // 指標（中文字一直顯示：正式模型沒有字）
    for(const s of L.signs){ const y=(s.lv?L.floors[1].y:0)+s.y; const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.18),new THREE.MeshBasicMaterial({map:TK.signTex(s.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(s.x,y,s.z); sp.rotation.y=s.ry||0; (s.lv?lv1:lv0).add(sp); }
    // 樓層簡介（大樓梯旁邊）
    { const tx=W3.canvasTex('lbboard',512,256,(x,w,h)=>{ x.fillStyle='#24303a'; x.fillRect(0,0,w,h); x.fillStyle='#f3efe4'; x.font='bold 34px "Noto Sans TC",sans-serif'; x.fillText('總圖書館 樓層簡介',24,52); x.font='24px "Noto Sans TC",sans-serif'; x.fillText('1F　大廳｜服務台｜期刊報紙｜新書展示',24,100); x.fillText('2F　自習區｜研究小間',24,138); x.fillText('3F　閱覽區（東側樓梯間、電梯）',24,176); x.fillText(L.stacks?'4F–6F　書庫（5F 開放，搭電梯）':'4F–6F　書庫（整理中）',24,214); if(L.b1Door) x.fillText('B1　自習室｜討論室｜影印（西側樓梯）',24,246); });
      const bd=new THREE.Mesh(new THREE.PlaneGeometry(1.8,0.9),new THREE.MeshBasicMaterial({map:tx})); bd.position.set(-3.2,1.6,-0.48); lv0.add(bd);
      IT.push({x:-3.2,z:0.35,radius:1.0,lv:0,label:'看樓層簡介',look:'總圖書館 樓層簡介：1F 大廳、服務台、期刊報紙、新書展示；2F 自習區、研究小間；3F 閱覽區（從二樓東側的樓梯間，或搭電梯）；'+(L.stacks?'5F 書庫是自然科學（搭電梯；4F、6F 這學期整理中）。':'4F–6F 書庫（這學期整理中）。')+(L.b1Door?'B1 是 24 小時自習室、討論室、影印中心（一樓西側的樓梯間下去）。':'')+'中間的大樓梯上二樓。'}); } }

  // ---- 電梯的樓層：「別的區域」的樓層（3F 閱覽區）帶出生點（車廂裡面，門關著）----
  function elevSpawn(EL,lv){ return {x:(EL.x0+EL.x1)/2,z:(EL.z0+EL.z1)/2-0.15,yaw:Math.PI,lv:lv|0,elev:true}; }
  /* 樓層在別的區域：出生點在那個區域的電梯車廂裡（閱覽室、大廳、5F 書庫各一部；書庫是 CLOSED-SPACES-1023 第 3 項）*/
  function zoneElev(L,z){ return z==='library'?L.reading.elevator:(z==='library_stacks'&&L.stacks?L.stacks.elevator:L.elevator); }
  function hallFloors(L){ return L.elevator.floors.map((f,i)=>Object.assign({num:i+1},f,f.zone?{spawn:elevSpawn(zoneElev(L,f.zone),f.zone==='library'?0:f.lv)}:{})); }
  function readingFloors(L){ return L.reading.elevator.floors.map((f,i)=>Object.assign({num:i+1},f,f.zone?{spawn:elevSpawn(zoneElev(L,f.zone),f.lv)}:{})); }

  // ---- 區域 ----
  const library_hall={ id:'library_hall', name:'總圖書館 大廳', indoor:true, camDist:4.8, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y, EL=L.elevator;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], outs=[], slabs=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},camMaxY:3.6,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs){ const v=viewOf(o.userData.view,night), want=v||outsideTex(night); if(o.material.map!==want){ o.material.map=want; o.material.toneMapped=!v; o.material.needsUpdate=true; } }
        for(const o of (zone.pOuts||[])){ const v=viewOf(o.userData.view,night), u=o.material.uniforms; u.map.value=v||outsideTex(night); u.photo.value=v?1:0; u.tint.value.set(v?W3.photoTint(h,weather==='rain'):0xffffff); const v2=(v&&!night&&W3.photoFade&&W3.photoFade(h)>0)?viewOf(o.userData.view,true):null; if(u.xf){ u.map2.value=v2; u.near2.value=0; u.xf.value=v2?W3.photoFade(h):0; } } },   /* 有景深的窗景（parallaxViews）*/
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; } };
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,slabs); buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone);
    // 劇情：小安「總圖的下午」坐的那一桌（二樓西側、靠窗的那一張長桌，面對面的兩個座位）
    { const s=zone.seats, T=L.furniture.find(f=>f.type==='studyTable'&&f.z>0); const row=(zz)=>s.filter(q=>Math.abs(q.z-zz)<0.05).sort((p,q)=>p.x-q.x)[0];
      const a=T&&row(T.z-0.8), b2=T&&row(T.z+0.8); if(a&&b2){ s.splice(s.indexOf(a),1); s.splice(s.indexOf(b2),1); s.unshift(a,b2); } }   /* seats[0]：玩家（−z 那一側，面向 +z）、seats[1]：小安（對面）；和閱覽室 seats 的排法一樣 */
    // 樓梯可以點的面（點地面移動；一直在，正式模型載入後也用這幾片）
    for(const s of ss.all){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:(s.low==='z1'?s.ya:s.ya), yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(ss.sides.indexOf(s)>=0||ss.tops.indexOf(s)>=0)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
      /* 點在一跑樓梯上＝走完這一跑（engine3d.js；任務 #42）：[下面那一端, 上面那一端] */
      const LD=L.stair.landing, ldz=(LD.z0+LD.z1)/2; if(s===ss.c) m.userData.stairEnds=[{x:0,z:s.z1+0.6,lv:0},{x:0,z:ldz,lv:0}]; const si=ss.sides.indexOf(s); if(si>=0){ const sx=(s.x0+s.x1)/2; m.userData.stairEnds=[{x:sx,z:ldz,lv:0},{x:sx,z:L.stair.side.z1+0.6,lv:1}]; } }
    zone.elev=B3.buildElevator(Object.assign({},L,{elevator:Object.assign({},EL,{floors:hallFloors(L)})}),g,nav0,nav1,zone);
    { const sh=E.spawnHint; if(sh&&sh.elev) zone.elev.placeAt(Math.max(0,Math.min(1,sh.lv|0)),true); }   /* 從閱覽室搭電梯下來：車廂停在那一層、人在車廂裡（門之後才打開） */
    zone.update=function(dt){ zone.elev.update(dt); };
    const lights=[]; for(const [x,y,z,on,off] of [[0,8.6,4.6,16,10],[0,6.6,-4.0,10,6],[-8.6,8.6,0,9,6],[8.6,8.6,0,9,6],[-8.6,3.8,0,7,4],[8.6,3.8,0,7,4]]){ const l=new THREE.PointLight(0xfff0d8,off,22,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    // 互動點（每一個都標樓層）
    const IT=E.interactables, EN=L.entrance, SDR=L.stairDoor;
    IT.push({x:EN.x,z:EN.exitZ,radius:1.4,lv:0,label:'離開總圖',exit:{to:'campus',spawn:Object.assign({},CAMPUS)}});   /* 進來的出生點離出口 1.7 m：一進來不會就跳出「離開總圖」*/
    IT.push({x:SDR.x-0.7,z:SDR.z,radius:1.0,lv:1,label:SDR.label,exit:{to:'library',spawn:Object.assign({},L.reading.spawnFromStairs)}});
    if(L.b1Door&&typeof LIBRARY_B1_LAYOUT!=='undefined'){ const BD=L.b1Door, sp=LIBRARY_B1_LAYOUT.stairs.spawn; IT.push({x:BD.x+0.55,z:BD.z,radius:0.8,lv:0,label:BD.label,exit:{to:'library_b1',spawn:{x:sp.x,z:sp.z,yaw:sp.yaw}}}); }   /* 往 B1（src/library_b1_3d.js）：站到 B1 樓梯間的門前 */
    for(const lv of [0,1]) IT.push({x:zone.elev.cx,z:EL.callZ,radius:1.0,lv,label:'搭電梯',elevator:true});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.library_interior']){ ASSETS.loadOne('bldg.library_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; B3.attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes); for(const o of outs) o.visible=false;   /* 正式模型的牆有窗洞：改用有景深的窗景（下面），原本一扇窗一張平面貼圖的藏起來（載入失敗時照舊用它們）*/
      parallaxViews(zone,L,lv0,lv1); }).catch(e=>console.warn('總圖大廳正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };

  // ---- 閱覽室（zones3d.js 的 library）加的東西：電梯（東側）、樓梯間的出口 ----
  function readingExtras(E,zone){ const L=LAYOUT(), R=L.reading.elevator; const nav=zone.nav;
    nav.blockRect(R.x0-0.1,(R.z0+R.z1)/2,0.24,R.z1-R.z0+0.2,0); nav.blockRect(R.x1+0.1,(R.z0+R.z1)/2,0.24,R.z1-R.z0+0.2,0); nav.blockRect((R.x0+R.x1)/2,R.z1+0.1,R.x1-R.x0+0.44,0.24,0);
    const RL={floors:[{lv:0,y:0}],roofY:4.0,elevator:Object.assign({},R,{floors:readingFloors(L)})};
    zone.elev=B3.buildElevator(RL,zone.group,nav,null,zone);
    { const sh=E.spawnHint; if(sh&&sh.elev) zone.elev.placeAt(0,true); }
    const up=zone.update; zone.update=function(dt){ if(up) up(dt); zone.elev.update(dt); };
    E.interactables.push({x:zone.elev.cx,z:R.callZ,radius:1.0,label:'搭電梯',elevator:true});
    return zone; }

  return {library_hall,readingExtras,stairSurfs,buildNav,CAMPUS,riseOf,hallFloors,readingFloors};   /* hallFloors／readingFloors：tests/library_upper_unit.js 查電梯的樓層 */
})();
Z3.ZONES.library_hall=LB3.library_hall;
