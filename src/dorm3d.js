/* ===== 男生宿舍（宿舍走廊，D44）：一樓門廳＋交誼廳＋走廊、雙跑樓梯、二樓走廊（自己的房門）=====
   使用者需求 21 第 3 點：「宿舍可進入房間、走廊，並與床、書桌互動」。
   配置：src/data/dorm_layout.js（Blender 正式模型 tools/blender/dorm_hall.py 讀同一份，兩邊的位置一定一致）。
   區域：校園的宿舍門口 → dorm_hall（這個檔案，兩層導航）→ 二樓走廊北側的 203 → dorm（zones3d.js 現有的「宿舍 房間」：
         座標、床、書桌、阿凱的位置、劇情都不動；房間的出口改成走出來站在二樓走廊、自己的房門前）。
   劇情：第一天開場、睡覺、半夜被送回宿舍（S.forceHome）照舊直接在房間裡；這個區域只多了平常進出時走的走廊與樓梯。
   導航：兩層 NavGrid（1F y=0、2F y=3.6）；A 跑、平台、B 跑兩層共用（D36）；寢室都關著（門口有看得懂的說明），導航上是擋住的。
   鏡頭：走廊只有 2.4 m 寬——走廊兩側的牆是鏡頭碰撞（E.colliders），鏡頭留在走廊裡；外牆（兩端、門廳正面、樓梯間北牆）擋住時淡出。
   畫面：程序化備用模型（正式模型載入前、載入失敗時）；正式模型（ASSETS 'bldg.dorm_hall'）載入後由 B3.attachFormal 換掉。 */
'use strict';
const DM3=(function(){
  const LAYOUT=()=>DORM_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  const CAMPUS={x:20,z:54,yaw:Math.PI};      // 走出宿舍大門：門廊前面（和原本房間的「離開宿舍」一樣）
  const ROOM={x:0,z:2.4,yaw:Math.PI};        // 進房間：房門內側（dorm 區域原本的出生點）
  const riseOf=L=>L.floors[1].y/(L.stair.A.risers+L.stair.B.risers);   // 1F→2F 22 階，一階 16.4 cm

  // ---- 樓梯的高度：A 跑往北（−z）爬到平台、B 跑往南（+z）爬回二樓；連續斜面給碰撞與找路，畫面上一階一階（tread／rise／low）----
  function stairSurfs(L){ const S=L.stair, r=riseOf(L), t=S.tread, A=S.A, B=S.B, LD=S.landing;
    const a={x0:A.x0,x1:A.x1,z0:A.z0+t/2,z1:A.z1,axis:'z',ya:A.risers*r,yb:0,tread:t,rise:r,low:'z1'};
    const atop={x0:A.x0,x1:A.x1,z0:A.z0,z1:A.z0+t/2,y:LD.y};                                // A 跑最上面一階（和平台同高）的後半
    const ld={x0:LD.x0,x1:LD.x1,z0:LD.z0,z1:LD.z1,y:LD.y};
    const b={x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1-t/2,axis:'z',ya:LD.y,yb:LD.y+B.risers*r,tread:t,rise:r,low:'z0'};
    const btop={x0:B.x0,x1:B.x1,z0:B.z1-t/2,z1:B.z1,y:LD.y+B.risers*r};
    return {a,atop,ld,b,btop,all:[ld,atop,a,b,btop]}; }

  // ---- 導航：兩層（先整層擋起來，再開出走得到的地方）----
  function buildNav(L){ const W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, B=S.B, MW=S.midWall, CO=L.corridor, LB=L.lobby, LG=L.lounge;
    const mk=()=>new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1); const nav0=mk(), nav1=mk().setFloor(Y1); const ss=stairSurfs(L);
    // 一樓：走廊、門廳＋交誼廳、樓梯（A 跑、平台、B 跑）
    nav0.fillBlocked(); for(const a of [CO,LB,LG,{x0:S.A.x0,x1:B.x1,z0:S.landing.z0,z1:CO.z0}]) nav0.freeRect(a.x0,a.z0,a.x1,a.z1);
    for(const s of ss.all) nav0.addSurf(Object.assign({},s));
    nav0.blockRect((MW.x0+MW.x1)/2,(S.A.z0+CO.z0)/2,MW.x1-MW.x0,CO.z0-S.A.z0,0);   // 兩跑中間的矮牆
    nav0.blockRect((B.x0+B.x1)/2,B.z1-0.2,B.x1-B.x0,0.4,0);                       // B 跑最上面那一排（約 3.4 m 高）面向一樓走廊：第 0 層走到這裡之前要換到第 1 層，不能從一樓走廊直接走進去
    // 二樓：走廊、B 跑（從平台上來）
    nav1.fillBlocked(); nav1.freeRect(CO.x0,CO.z0,CO.x1,CO.z1); nav1.freeRect(B.x0,B.z0,B.x1,B.z1); nav1.addSurf(Object.assign({},ss.b)); nav1.addSurf(Object.assign({},ss.btop));
    nav0._cm=null; nav1._cm=null; return {nav0,nav1,ss}; }

  // ---- 窗外的景（程序化）：舟山路的行道樹、對面的系館、機車；晚上是路燈 ----
  const outsideTex=(night)=>W3.canvasTex('dmout'+(night?'N':''),512,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); if(night){ g.addColorStop(0,'#0e1528'); g.addColorStop(1,'#2a3350'); } else { g.addColorStop(0,'#a8c8e2'); g.addColorStop(1,'#e8eef0'); } x.fillStyle=g; x.fillRect(0,0,w,h);
    x.fillStyle=night?'#3a3530':'#c9bba4'; x.fillRect(40,h*0.3,200,h*0.45); x.fillRect(300,h*0.36,170,h*0.4); x.fillStyle=night?'rgba(255,220,160,0.7)':'#eee5d4'; for(let i=0;i<7;i++){ x.fillRect(52+i*26,h*0.38,12,h*0.08); x.fillRect(52+i*26,h*0.52,12,h*0.08); } for(let i=0;i<6;i++) x.fillRect(312+i*26,h*0.45,12,h*0.1);
    x.fillStyle=night?'#1b2a22':'#5f8a55'; for(let i=0;i<7;i++){ const cx=i*80+20, r=30+((i*29)%20); x.beginPath(); x.arc(cx,h*0.62,r,0,Math.PI*2); x.fill(); }
    x.fillStyle=night?'#2a2c30':'#9a9a96'; x.fillRect(0,h*0.78,w,h*0.22); if(night){ x.fillStyle='rgba(255,214,150,0.85)'; for(const lx of [80,260,440]) x.fillRect(lx,h*0.58,4,4); } });

  /* 窗外的景（正式）：遊戲裡校園實際的畫面（tools/shots/dorm_views.py：road＝從宿舍門口往北、side＝從宿舍東端往東；白天 11:00、晚上 20:30，1024×512）。
     已經調過色：不再做一次色調映射。載不到（claude.ai artifact 版沒有這些檔案）就用上面程序化畫的（和總圖大廳同一套做法） */
  const VIEW_URL='assets/models/env/dorm_view_', viewTex={};
  function viewOf(kind,night){ const k=kind+(night?'_night':'_day'); if(!(k in viewTex)){ viewTex[k]=null; try{ new THREE.TextureLoader().load(VIEW_URL+k+'.webp',t=>{ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; viewTex[k]=t; },undefined,()=>{ viewTex[k]=false; }); }catch(e){ viewTex[k]=false; } } return viewTex[k]||null; }
  function cropUV(geo,a,fx){ const uv=geo.attributes.uv; let uw=1, vh=1; if(a<2) uw=a/2; else vh=2/a; const u0=(1-uw)*fx, v0=(1-vh)*0.5; for(let i=0;i<uv.count;i++) uv.setXY(i,u0+uv.getX(i)*uw,v0+uv.getY(i)*vh); uv.needsUpdate=true; }   /* 窗的長寬比和景（2:1）不一樣：在 UV 上裁一塊，不拉長 */

  // ---- 程序化備用模型 ----
  function buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,cols){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, ST=L.slabT, S=L.stair, A=S.A, B=S.B, LD=S.landing, MW=S.midWall, WL=S.well, CO=L.corridor, LB=L.lobby, LG=L.lounge, MAT=B3.MAT, r=riseOf(L), t=S.tread;
    const b0=new TK.Bin(), b1=new TK.Bin(); const H0=Y1-ST, H1=RY-Y1;   // 一樓、二樓的淨高
    const floorM=(w,d)=>{ const tx=W3.stoneTex('#d8d2c4').clone(); tx.needsUpdate=true; tx.wrapS=tx.wrapT=THREE.RepeatWrapping; tx.repeat.set(w/2,d/2); return new THREE.MeshStandardMaterial({map:tx,roughness:0.6}); };
    const floor=(a,y,lv,grp)=>{ const f=new THREE.Mesh(new THREE.PlaneGeometry(a.x1-a.x0,a.z1-a.z0),floorM(a.x1-a.x0,a.z1-a.z0)); f.rotation.x=-Math.PI/2; f.position.set((a.x0+a.x1)/2,y+0.004,(a.z0+a.z1)/2); f.receiveShadow=true; f.userData.walkLv=lv; grp.add(f); walkMeshes.push(f); };
    floor({x0:CO.x0,x1:CO.x1,z0:CO.z0,z1:LB.z1},0,0,fb0); floor(CO,Y1,1,fb1);
    // 牆：下半段淺灰綠的腰牆、上半段白牆（台灣宿舍常見）；走廊兩側的牆＝鏡頭碰撞
    const dado=M('#aab5aa',{rough:0.7}), wallM=MAT.plaster();
    const iwall=(b,x0,x1,z0,z1,y,h)=>{ const w=Math.max(x1-x0,0.2), d=Math.max(z1-z0,0.2); b.add(wallM,TK.boxG(w,h,d,1.2),(x0+x1)/2,y+h/2,(z0+z1)/2); b.add(dado,TK.boxG(w+0.02,1.1,d+0.02),(x0+x1)/2,y+0.55,(z0+z1)/2);
      const c=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); c.position.set((x0+x1)/2,y+h/2,(z0+z1)/2); c.userData.dyn=true; cols.push(c); };
    const oWall=(x,z,w,h,y,ry,dir,grp)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),wallM.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; grp.add(ms); walls.push(ms); return ms; };
    const hz=T/2;
    // 一樓：走廊北牆（樓梯間的 A 跑入口空著）、南牆西段、門廳西牆、樓梯間的牆（東西兩側到二樓天花板）
    iwall(b0,CO.x0,WL.x0,CO.z0-hz,CO.z0+hz,0,H0); iwall(b0,MW.x0,CO.x1,CO.z0-hz,CO.z0+hz,0,H0);
    iwall(b0,CO.x0,LB.x0,CO.z1-hz,CO.z1+hz,0,H0); iwall(b0,LB.x0-hz,LB.x0+hz,CO.z1,LB.z1,0,H0);
    for(const x of [WL.x0,WL.x1]){ b0.add(wallM,TK.boxG(T,RY,WL.z1-WL.z0,1.2),x,RY/2,(WL.z0+WL.z1)/2); }
    // 二樓：走廊北牆（樓梯間空著：A 跑上方是欄杆、B 跑上來的開口）、南牆
    iwall(b1,CO.x0,WL.x0,CO.z0-hz,CO.z0+hz,Y1,H1); iwall(b1,WL.x1,CO.x1,CO.z0-hz,CO.z0+hz,Y1,H1); iwall(b1,CO.x0,CO.x1,CO.z1-hz,CO.z1+hz,Y1,H1);
    // 外牆（擋住鏡頭時淡出）：兩端、樓梯間北牆、門廳＋交誼廳正面
    for(const [grp,y,h,z0,z1] of [[fb0,0,H0,CO.z0,LB.z1],[fb1,Y1,H1,CO.z0,CO.z1]]){
      oWall(CO.x0,(z0+z1)/2,z1-z0,h,y,Math.PI/2,new THREE.Vector3(1,0,0),grp); oWall(CO.x1,(z0+z1)/2,z1-z0,h,y,Math.PI/2,new THREE.Vector3(-1,0,0),grp); }
    oWall(0,WL.z0,WL.x1-WL.x0,RY,0,0,new THREE.Vector3(0,0,1),fb0);
    for(const [x0,x1] of [[LB.x0,-1.0],[1.0,LG.x1]]) oWall((x0+x1)/2,LB.z1,x1-x0,H0,0,0,new THREE.Vector3(0,0,-1),fb0);
    // 大門（玻璃門＋上方的橫窗）
    { const gp=new THREE.Mesh(new THREE.PlaneGeometry(2.0,2.4),MAT.glass()); gp.position.set(0,1.2,LB.z1-0.02); gp.rotation.y=Math.PI; lv0.add(gp); for(const x of [-1,0,1]) b0.add(MAT.frame(),TK.boxG(0.08,2.5,0.12),x,1.25,LB.z1-0.04); b0.add(MAT.frame(),TK.boxG(2.1,0.1,0.14),0,2.45,LB.z1-0.04); }
    // 樓梯：A 跑每一階實心到地面、平台實心、B 跑懸在儲藏室上面（踏階＋斜的樓梯板）、兩跑中間的矮牆
    const stair=M('#bcb5a8',{rough:0.6}), nose=MAT.frame();
    for(let k=0;k<A.risers;k++){ const top=(k+1)*r, z1=A.z1-k*t; b0.add(stair,TK.boxG(A.x1-A.x0,top,t,1.2),(A.x0+A.x1)/2,top/2,z1-t/2); b0.add(nose,TK.boxG(A.x1-A.x0,0.015,0.04),(A.x0+A.x1)/2,top-0.005,z1-0.02); }
    b0.add(stair,TK.boxG(LD.x1-LD.x0,LD.y,LD.z1-LD.z0,1.2),(LD.x0+LD.x1)/2,LD.y/2,(LD.z0+LD.z1)/2);
    { const slope=Math.atan2(Y1-LD.y,B.z1-B.z0), slen=Math.hypot(Y1-LD.y,B.z1-B.z0), cx=(B.x0+B.x1)/2, w=B.x1-B.x0;
      for(let k=0;k<B.risers;k++){ const top=LD.y+(k+1)*r, z0=B.z0+k*t; b0.add(stair,TK.boxG(w,r+0.02,t,1.2),cx,top-(r+0.02)/2,z0+t/2); b0.add(nose,TK.boxG(w,0.015,0.04),cx,top-0.005,z0+0.02); }
      b0.add(wallM,TK.boxG(w,0.24,slen,1.2),cx,(LD.y+Y1)/2-0.14,(B.z0+B.z1)/2,0,{rx:-slope});
      { const mh=Y1+1.0; b0.add(wallM,TK.boxG(MW.x1-MW.x0,mh,B.z1-B.z0,1.2),(MW.x0+MW.x1)/2,mh/2,(B.z0+B.z1)/2);   // 兩跑中間的實心牆（到二樓地板再高 1 m：台灣宿舍常見的雙跑樓梯）；也是鏡頭碰撞
        const c=new THREE.Mesh(new THREE.BoxGeometry(MW.x1-MW.x0,mh,B.z1-B.z0),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})); c.position.set((MW.x0+MW.x1)/2,mh/2,(B.z0+B.z1)/2); c.userData.dyn=true; cols.push(c); } }
    // 欄杆：A 跑外側、B 跑外側的扶手（牆上），二樓 A 跑上方的欄杆
    const steel=MAT.steel(); const hand=(pts,x)=>{ for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(zb-za,yb-ya), mid=new THREE.Vector3(x,(ya+yb)/2+0.9,(za+zb)/2); const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,len,8),steel); hr.position.copy(mid); hr.lookAt(x,yb+0.9,zb); hr.rotateX(Math.PI/2); lv0.add(hr); } };
    hand([[A.z1,0],[A.z0,LD.y]],A.x0+0.06); hand([[B.z0,LD.y],[B.z1,Y1]],B.x1-0.06); hand([[A.z1,0],[A.z0,LD.y]],MW.x0-0.03); hand([[B.z0,LD.y],[B.z1,Y1]],MW.x1+0.03);
    { const x0=WL.x0, x1=MW.x1, z=CO.z0; b1.add(steel,TK.boxG(x1-x0,0.05,0.05),(x0+x1)/2,Y1+1.05,z); for(let x=x0+0.1;x<=x1;x+=0.12) b1.add(steel,TK.boxG(0.02,1.0,0.02),x,Y1+0.5,z); }
    // 窗（窗外的景）：兩端的走廊窗（一樓西端、二樓兩端；一樓東端是側門）、交誼廳正面三扇、樓梯平台的窗
    const outPlane=(w,h,x,y,z,ry,grp,fpos,kind,fx)=>{ const geo=new THREE.PlaneGeometry(w,h); cropUV(geo,w/h,fx==null?0.5:fx); const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:outsideTex(false)})); m.position.set(x,y,z); m.rotation.y=ry; m.userData.dmOut=true; m.userData.view=kind||'side'; if(fpos) m.userData.fpos=fpos; grp.add(m); outs.push(m); return m; };
    const winX=(grp,b,x,y0,s)=>{ outPlane(1.6,1.5,x+s*0.12,y0+0.75,0,s>0?-Math.PI/2:Math.PI/2,grp,new THREE.Vector3(x-s*0.6,y0+0.75,0)); b.add(MAT.frame(),TK.boxG(0.08,1.6,1.7),x+s*0.13,y0+0.75,0); };
    winX(lv0,b0,CO.x0,1.0,1); winX(lv1,b1,CO.x0,Y1+1.0,1); winX(lv1,b1,CO.x1,Y1+1.0,-1);
    for(const x of [8.4,11.4]){ outPlane(2.0,1.5,x,1.75,LB.z1-0.12,Math.PI,lv0,new THREE.Vector3(x,1.75,LB.z1+0.6),'road',0.25+(x-8.4)/6); b0.add(MAT.frame(),TK.boxG(2.1,1.6,0.08),x,1.75,LB.z1-0.13); }
    outPlane(1.8,1.5,0,LD.y+1.65,WL.z0+0.12,0,lv0,new THREE.Vector3(0,LD.y+1.65,WL.z0-0.6)); b0.add(MAT.frame(),TK.boxG(1.9,1.6,0.08),0,LD.y+1.65,WL.z0+0.13);
    outPlane(2.0,2.4,0,1.2,LB.z1+0.5,Math.PI,lv0,null,'road',0.5);   // 大門外面
    // 天花板＋日光燈
    { const tube=MAT.lightPanel(); const ceil=(a,y,grp)=>{ const c=new THREE.Mesh(new THREE.PlaneGeometry(a.x1-a.x0,a.z1-a.z0),M('#f2f0ea')); c.rotation.x=Math.PI/2; c.position.set((a.x0+a.x1)/2,y,(a.z0+a.z1)/2); grp.add(c); };
      ceil({x0:CO.x0,x1:CO.x1,z0:CO.z0,z1:LB.z1},H0,fb0); ceil(CO,RY,fb1); ceil(WL,RY,fb0);
      for(let x=-12;x<=12.1;x+=3){ b0.add(tube,TK.boxG(1.2,0.04,0.12),x,H0-0.03,0); b1.add(tube,TK.boxG(1.2,0.04,0.12),x,RY-0.03,0); }
      for(const [x,z] of [[0,4.5],[5,3.5],[9,4.5],[12,3.0]]) b0.add(tube,TK.boxG(1.2,0.04,0.12),x,H0-0.03,z); }
    b0.build(fb0); b1.build(fb1); }

  // ---- 門（寢室、洗衣間、舍監室、側門：關著，看得懂的說明）＋自己的房門 ----
  function doorAt(L,d){ const CO=L.corridor, off=L.wallT/2+0.02; if(d.side==='N') return {x:d.x,z:CO.z0+off,ry:0}; if(d.side==='S') return {x:d.x,z:CO.z1-off,ry:Math.PI}; if(d.side==='E') return {x:CO.x1-off,z:0,ry:-Math.PI/2}; return {x:CO.x0+off,z:0,ry:Math.PI/2}; }
  function buildDoors(E,L,lv0,lv1,fb0,fb1){ const MAT=B3.MAT, IT=E.interactables, Y1=L.floors[1].y; const doorM=M('#7f8b80',{rough:0.55});
    const one=(d,home)=>{ const p=doorAt(L,d), y=d.lv?Y1:0, fb=d.lv?fb1:fb0; const dg=new THREE.Group(); dg.position.set(p.x,y,p.z); dg.rotation.y=p.ry; const db=new TK.Bin();
      db.add(MAT.frame(),TK.boxG(1.05,2.2,0.08),0,1.1,0); db.add(home?M('#8a6a4a',{rough:0.55}):doorM,TK.boxG(0.9,2.1,0.05),0,1.05,0.04); db.add(MAT.steel(),TK.boxG(0.12,0.03,0.05),0.32,1.0,0.08); db.build(dg); fb.add(dg);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.16),new THREE.MeshBasicMaterial({map:TK.signTex(d.plate,{bg:'#f4f2ec',fg:'#2b2b2b'})})); sg.position.set(0,1.85,0.08); dg.add(sg); (d.lv?lv1:lv0).attach(sg);
      return p; };
    const H=homeOf(typeof GAME!=='undefined'&&GAME.G);
    /* 同一層的門牌照自己房間的號碼排（2026-10-18 使用者：「同一層樓為什麼不是同一個號碼開頭？我經濟系宿舍 4 開頭、對面 2 開頭」）：
       自己的房號開頭和那一層原本的開頭（一樓 1、二樓 2）不一樣時（經濟系 412、大二 312），那一層的門牌整排平移——
       經濟系 410～417（412 在原本 203 的位置）、大二 309～316、大三 507～514（507 在原本 201 的位置）、大四 408～415（409 在原本 202 的位置）；大一 203 照舊 */
    const base=+(H.rep?((L.doors.find(q=>q.id===H.rep)||{}).plate||'203'):'203'), hn=+H.plate, shift=String(hn)[0]!==String(base)[0]?hn-base:0;
    const ren=d=>{ if(!shift||(d.lv|0)!==(H.lv|0)||!/^\d{3}$/.test(d.plate||'')) return d; const np=String(+d.plate+shift), rp=t=>typeof t==='string'?t.split(d.plate).join(np):t; return Object.assign({},d,{plate:np,label:rp(d.label),closed:rp(d.closed)}); };
    for(const d0 of L.doors.concat(H.key!=='y1'?[OLD_HOME]:[])){ if(d0.id===H.rep) continue; const d=ren(d0); const p=one(d,false), at={x:p.x+Math.sin(p.ry)*0.75,z:p.z+Math.cos(p.ry)*0.75,radius:1.0,lv:d.lv};
      /* 有正式房間的門（rooms_glb3d.js 照 ROOM_GLB_LAYOUTS 的 host_door 設 d.to；洗衣間、205＝AA_399 第 11 節）：出入口；有開放時段（d.gate）的，時段外照舊是門上的字（兩個不會同時出現）*/
      if(d.to&&Z3.ZONES[d.to]){ const R=typeof ROOM_GLB_LAYOUTS!=='undefined'?ROOM_GLB_LAYOUTS[d.to]:null, en=Object.assign({},at,{label:(R&&R.host_door&&R.host_door.label)||('進入 '+d.label),exit:{to:d.to,spawn:Object.assign({},d.spawn)}});
        if(d.gate&&Z3.roomGlbGate){ en.gate=d.gate; IT.push(Z3.roomGlbGate(en,false)); IT.push(Z3.roomGlbGate(Object.assign({},at,{label:d.label,look:d.closed,gate:d.gate}),true)); } else IT.push(en); continue; }
      IT.push(Object.assign(at,{label:d.label,look:d.closed})); }
    one({x:H.x,lv:H.lv,side:'N',plate:H.plate},true);
    // 房門口的小東西：鞋架、阿凱掛在門把上的耳機袋（一看就知道是自己的房間）
    { const y=H.lv?Y1:0, z=L.corridor.z0+0.25; const b=new TK.Bin(); b.add(M('#3a3f46',{rough:0.6}),TK.boxG(0.7,0.36,0.26),H.x+0.95,y+0.18,z); b.add(M('#e9e4da'),TK.boxG(0.26,0.08,0.11),H.x+0.8,y+0.4,z); b.add(M('#4a6c8c'),TK.boxG(0.26,0.08,0.11),H.x+1.1,y+0.4,z); b.build(H.lv?fb1:fb0); } }
  /* 每一年的房間（AA_208 第 7、8 節；取代 AA_183 的 112／218／105）：同一個宿舍模型，換一扇門。大一 203 → 大二 312（三樓，主線 3）→ 大三 507（五樓，主線 5）→ 大四 409（四樓，主線 10）。
     走廊模型只有兩層：樓上那一層（lv 1）當成自己住的那一樓——門牌整排照自己的房號排（buildDoors 的 shift）、樓梯口的指標寫那一樓（buildFurniture 的 signs）。
     大三 507 用二樓最西邊 201 那扇門、大四 409 用 202 那扇（每一年走到不同的門口；SCN-V4-01／SCN-V5-01，2026-10-20 LAWWW-C 的美術子代理：原本 218、105 是作廢的 AA_183 房號，和字卡「五樓 507 號房」對不上）。
     經濟系那一年住 412（AA_168 第 5 節；故事上是另一棟樓），門的位置用大一的。房號只是門牌：換到的那一扇原本的寢室門（rep）不放，203 搬走以後變成一般關著的門。
     房間裡面（dorm 區域）沿用同一個；窗外照樓層（zones3d.js dormView、tools/blender/env_second/dorm_back_view.py）。 */
  const HOMES={y1:{plate:'203',x:5.5,lv:1,rep:null},y2:{plate:'312',x:11.15,lv:1,rep:'r204'},y3:{plate:'507',x:-10.9,lv:1,rep:'r201'},y4:{plate:'409',x:-5.25,lv:1,rep:'r202'}};
  /* 大三 507（五樓）：走廊模型只有兩層，從一樓走上樓梯、換到樓上那一層的時候接一句轉場旁白（AA_345 J1 新寫；房號不改，外觀加到五層是 LAWWW2 的事）*/
  const Y3_UP='（爬了四層樓梯。五樓的走廊比樓下暗一點。）';
  /* 自己住的那一樓（中文數字）：樓上那一層的門牌第一個數字（203→二、312→三、507→五、409→四、經濟系 412→四）；住一樓（lv 0）＝一 */
  const FLOOR_ZH=['','一','二','三','四','五','六','七','八','九'];
  function homeFloor(h){ const d=h&&h.lv?+String(h.plate||'2')[0]:1; return d>=1&&d<=9?d:2; }
  const OLD_HOME={id:'r203',lv:1,x:5.5,side:'N',label:'203 寢室',plate:'203',closed:'203 寢室。門關著。'};
  function homeOf(G){ const F=(G&&G.flags)||{}, econ=!!G&&G.stage==='econ'; const key=econ?'y1':F.ROOM_Y4?'y4':F.ROOM_Y3?'y3':F.ROOM_Y2?'y2':'y1'; const h=Object.assign({key},HOMES[key]); if(econ) h.plate='412';
    h.label='回房間（'+h.plate+'）'; h.spawn={x:h.x,z:0.4,lv:h.lv,yaw:0}; h.floor=homeFloor(h); h.floorZh=FLOOR_ZH[h.floor]+'樓'; return h; }
  /* 房間（dorm 區域）的「走出房間」：出去站在自己那一扇門前。搬了房間（主線 3）以後，人還在房間裡，就地改出口 */
  function fixRoomExit(E,G){ if(!E||!E.interactables) return; for(const it of E.interactables) if(it.exit&&it.exit.to==='dorm_hall') it.exit.spawn=Object.assign({},homeOf(G).spawn); }

  // ---- 家具（程序化）----
  function buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone){ const Y1=L.floors[1].y, MAT=B3.MAT, IT=E.interactables; const b0=new TK.Bin(), b1=new TK.Bin(); const seats=zone.seats=[];
    for(const f of L.furniture){ const b=f.lv?b1:b0, y=f.lv?Y1:0, nav=f.lv?nav1:nav0, ry=f.ry||0, fb=f.lv?fb1:fb0, fx=Math.sin(ry), fz=Math.cos(ry);
      if(f.type==='wardenWindow'){ b.add(MAT.frame(),TK.boxG(0.1,1.0,f.w+0.1),f.x+0.02,y+1.55,f.z); const gp=new THREE.Mesh(new THREE.PlaneGeometry(f.w,0.9),MAT.glass()); gp.position.set(f.x+0.06,y+1.55,f.z); gp.rotation.y=Math.PI/2; fb.add(gp); b.add(MAT.wood(),TK.boxG(0.4,0.05,f.w),f.x+0.2,y+1.02,f.z);
        IT.push({x:f.x+0.85,z:f.z,radius:1.1,lv:f.lv,label:'舍監室窗口',look:'舍監室窗口：簽收包裹、借鑰匙、訪客登記。值班的工讀生抬頭看了你一眼：「同學，晚上十二點門禁喔。」'}); }
      else if(f.type==='mailboxes'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(M('#8c9196',{rough:0.45}),TK.boxG(f.w,1.5,0.32),0,0.95,0); for(let i=0;i<8;i++) for(let j=0;j<5;j++) sb.add(M('#6b7075',{rough:0.45}),TK.boxG(0.24,0.03,0.02),-f.w/2+0.15+i*(f.w-0.3)/7,0.35+j*0.27,0.17); sb.build(g); fb.add(g); nav.blockRect(f.x,f.z,f.w,0.32,ry,0.05);
        IT.push({x:f.x+fx*0.9,z:f.z+fz*0.9,radius:1.1,lv:f.lv,label:'看信箱',look:'你的信箱裡只有一張披薩店的傳單，和宿舍會費的繳費通知。'}); }
      else if(f.type==='notice'){ const bb=W3.bulletin(); bb.position.set(f.x,y,f.z); bb.rotation.y=ry; fb.add(bb); nav.blockRect(f.x,f.z,2.4,0.3,ry,0); IT.push({x:f.x+fx*0.8,z:f.z+fz*0.8,radius:1.2,lv:f.lv,label:'看宿舍公告',look:'宿舍公告：門禁 24:00，晚歸請到舍監室登記。週六早上九點消防演練。洗衣間的三號烘衣機故障，報修中。'}); }
      else if(f.type==='sofa'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); const fab=M('#6c6455',{rough:0.85}), fab2=M('#5b5447',{rough:0.85});
        sb.add(fab2,new THREE.BoxGeometry(2.2,0.22,0.86),0,0.19,0); for(const sx of [-0.49,0.49]) sb.add(fab,new THREE.BoxGeometry(0.96,0.14,0.66),sx,0.37,0.08); sb.add(fab2,new THREE.BoxGeometry(2.0,0.52,0.2),0,0.56,-0.33); for(const sx of [-1,1]) sb.add(fab2,new THREE.BoxGeometry(0.16,0.34,0.86),sx*1.02,0.43,0); sb.build(sg);
        nav.blockRect(f.x,f.z,2.2,0.9,ry,0.1); if(f.seat) IT.push({x:f.x+fx*0.7,z:f.z+fz*0.7,radius:1.2,lv:f.lv,label:'坐在沙發上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); }
      else if(f.type==='coffeeTable'){ b.add(MAT.woodD(),TK.boxG(f.w,0.42,f.d),f.x,y+0.21,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); }
      else if(f.type==='tv'){ b.add(M('#1d1f22',{rough:0.3}),TK.boxG(0.08,0.95,f.w),f.x,y+1.6,f.z); b.add(M('#3a3f46'),TK.boxG(0.4,0.5,1.4),f.x-0.12,y+0.25,f.z); nav.blockRect(f.x-0.12,f.z,0.45,1.5,0,0.05);
        IT.push({x:f.x-1.2,z:f.z,radius:1.2,lv:f.lv,label:'看電視',look:'電視在播午間新聞：颱風路徑、捷運新線的施工進度。沒有人在看。'}); }
      else if(f.type==='vending'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(); sb.add(M('#c8ccd0',{rough:0.4}),TK.boxG(1.0,1.85,0.75),0,0.925,0); sb.add(M('#cfe4ee',{rough:0.1}),TK.boxG(0.62,1.1,0.02),-0.1,1.15,0.38); for(let j=0;j<4;j++) for(let i=0;i<5;i++) sb.add(M(['#c0392b','#2e86c1','#f1c40f','#27ae60','#e67e22'][(i+j)%5]),TK.boxG(0.07,0.14,0.04),-0.34+i*0.12,0.72+j*0.27,0.36); sb.build(g); fb.add(g); nav.blockRect(f.x,f.z,1.0,0.75,ry,0.05);
        IT.push({x:f.x+fx*0.9,z:f.z+fz*0.9,radius:1.0,lv:f.lv,label:'看自動販賣機',look:'自動販賣機：茶、咖啡、運動飲料，一罐 25 元。最上面一排的奶茶已經賣完了。'}); }
      else if(f.type==='water'){ b.add(M('#e4e6e8',{rough:0.4}),TK.boxG(0.4,1.25,0.4),f.x,y+0.625,f.z); b.add(M('#3a6ea5',{rough:0.3}),TK.boxG(0.3,0.06,0.02),f.x,y+1.0,f.z+(f.z<0?0.21:-0.21)); nav.blockRect(f.x,f.z,0.45,0.45,0,0.05);
        IT.push({x:f.x+fx*0.8,z:f.z+fz*0.8,radius:0.9,lv:f.lv,label:'看飲水機',look:'飲水機：熱水、溫水、冰水。旁邊貼著「請自備杯子」。'}); }
      else if(f.type==='fridge'){ b.add(M('#e9e7e2',{rough:0.5}),TK.boxG(0.66,1.72,0.66),f.x,y+0.86,f.z); b.add(M('#8a9096',{rough:0.38}),TK.boxG(0.03,0.34,0.03),f.x-0.27,y+1.35,f.z+(f.z<0?0.36:-0.36)); nav.blockRect(f.x,f.z,0.72,0.72,0,0.05); }   /* 交誼廳的公用冰箱（NPC-POOL-ART-1028，LAWWW2-C 10-28；正式模型 tools/blender/dorm_hall.py 的 fridge）：pool3d.js 家齊「把箱子放進交誼廳的冰箱」(7.3, 6.7) 的實體 */
      else if(f.type==='longTable'){ const n=f.seats||2; b.add(MAT.wood(),TK.boxG(f.w,0.05,f.d),f.x,y+0.74,f.z); for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) b.add(MAT.frame(),TK.boxG(0.05,0.72,0.05),f.x+lx*(f.w/2-0.1),y+0.36,f.z+lz*(f.d/2-0.1)); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05);
        for(let i=0;i<n;i++){ const sx=f.x-f.w/2+f.w*(i+0.5)/n; for(const s of [-1,1]){ const cz=f.z+s*(f.d/2+0.38), yaw=s>0?Math.PI:0; Z3.chair(fb,sx,cz,yaw,'#3a3f46'); const seat={x:sx,z:cz,yaw,lv:f.lv}; seats.push(seat); IT.push({x:sx,z:cz,radius:0.8,lv:f.lv,label:'坐下',seat}); } } }
      else if(f.type==='planter'){ b.add(M('#8c7f6e',{rough:0.8}),new THREE.CylinderGeometry(f.r,f.r*0.85,0.5,14),f.x,y+0.25,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.3,1),f.x,y+0.95,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }
      else if(f.type==='bins'){ const g=new THREE.Group(); g.position.set(f.x,y,f.z); g.rotation.y=ry; const sb=new TK.Bin(), bw=(f.w-0.08)/3; ['#3a3f46','#2f8a4e','#2e6fb0'].forEach((c,k)=>sb.add(M(c,{rough:0.6}),TK.boxG(bw,0.82,0.42),-f.w/2+bw/2+k*(bw+0.04),0.41,0)); sb.build(g); fb.add(g); nav.blockRect(f.x,f.z,f.w,0.45,ry,0.05); }   /* 資源回收桶三個（一般、紙類、寶特瓶・鐵鋁罐；ART-DORM-LOUNGE-1021）：備用模型是三個色塊，正式模型 tools/blender/dorm_hall.py */
      else if(f.type==='bench'){ const sg=new THREE.Group(); sg.position.set(f.x,y,f.z); sg.rotation.y=ry; fb.add(sg); const sb=new TK.Bin(); sb.add(MAT.wood(),TK.boxG(f.w,0.05,f.d),0,0.45,0); for(const sx of [-1,1]) sb.add(MAT.steel(),TK.boxG(0.05,0.43,f.d*0.9),sx*(f.w/2-0.12),0.215,0); sb.build(sg); nav.blockRect(f.x,f.z,f.w,f.d,ry,0.05);
        if(f.seat) IT.push({x:f.x+fx*0.65,z:f.z+fz*0.65,radius:0.9,lv:f.lv,label:'坐在長椅上',seat:{x:f.x,z:f.z,yaw:ry,lv:f.lv}}); } }
    b0.build(fb0); b1.build(fb1);
    // 指標（中文字一直顯示：正式模型沒有字）。一樓樓梯口的「2F」寫自己住的那一樓（樓上那一層的門牌整排照房號排：312 → 3F、409 → 4F、507 → 5F、經濟系 412 → 4F）
    const HF=homeOf(typeof GAME!=='undefined'&&GAME.G), upF=HF.lv?HF.floor:2;
    for(const s of L.signs){ const y=(s.lv?Y1:0)+s.y, text=(s.lv|0)===0&&upF!==2?s.text.replace('2F',upF+'F'):s.text; const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.22),new THREE.MeshBasicMaterial({map:TK.signTex(text,{bg:'#2f5d50',color:'#f3efe4'})})); sp.position.set(s.x,y,s.z); sp.rotation.y=s.ry||0; sp.name='sign_'+text; (s.lv?lv1:lv0).add(sp); } }

  // ---- 區域 ----
  const dorm_hall={ id:'dorm_hall', name:'男生宿舍', indoor:true, camDist:3.6, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    const {nav0,nav1,ss}=buildNav(L);
    const walls=[], walkMeshes=[], outs=[], cols=[]; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.name='fallback0'; fb1.name='fallback1'; fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},camMaxY:3.0,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); for(const o of outs){ const v=viewOf(o.userData.view,night), want=v||outsideTex(night); if(o.material.map!==want){ o.material.map=want; o.material.toneMapped=!v; o.material.needsUpdate=true; } } },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; },
      /* 每一幀（engine3d.js）：玩家從一樓（第 0 層）換到樓上那一層（第 1 層）、大三住 507 ＝ Y3_UP（每次從一樓上去都說；從房間出來就在樓上的不說；對話、劇情進行中不說）*/
      update(dt,E){ const lv=E&&E.player?(E.player.lv|0):0, prev=this._plv; this._plv=lv; if(prev!==0||lv!==1) return;
        const GA=typeof GAME!=='undefined'?GAME:null, G=GA&&GA.G; if(!G||homeOf(G).key!=='y3'||(GA.D&&GA.D.active)||(typeof EVENTS!=='undefined'&&EVENTS.running)) return; if(GA.caption) GA.caption('',Y3_UP,4200); } };
    buildFallback(L,lv0,lv1,fb0,fb1,walls,walkMeshes,outs,cols); buildDoors(E,L,lv0,lv1,fb0,fb1); buildFurniture(E,L,lv0,lv1,fb0,fb1,nav0,nav1,zone);
    // 走廊兩側的牆是鏡頭碰撞：放在樓層群組外面（正式模型載入後備用模型藏起來，碰撞還在）
    for(const c of cols){ g.add(c); E.colliders.push(c); }
    // 樓梯可以點的面（點地面移動；正式模型載入後也用這幾片）：點在一跑樓梯上＝走完這一跑（engine3d.js 的 stairEnds；任務 #42）
    { const S=L.stair, LD=S.landing, ldz=(LD.z0+LD.z1)/2, CO=L.corridor;
      for(const s of ss.all){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const m=new THREE.Mesh(new THREE.PlaneGeometry(w,Math.hypot(d,yb-ya)),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
        m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(yb-ya,d); m.userData.walkLv=(s===ss.b||s===ss.btop)?1:0; m.userData.dyn=true; lv0.add(m); walkMeshes.push(m);
        if(s===ss.a) m.userData.stairEnds=[{x:(S.A.x0+S.A.x1)/2,z:CO.z0+0.6,lv:0},{x:(S.A.x0+S.A.x1)/2,z:ldz,lv:0}];
        if(s===ss.b) m.userData.stairEnds=[{x:(S.B.x0+S.B.x1)/2,z:ldz,lv:0},{x:(S.B.x0+S.B.x1)/2,z:CO.z0+0.6,lv:1}]; } }
    const lights=[]; for(const [x,y,z,on,off] of [[-8,2.9,0,5,3],[0,2.9,0,5,3],[8,2.9,2.5,6,4],[0,2.9,5,5,3],[-8,6.5,0,5,3],[0,6.5,0,5,3],[8,6.5,0,5,3],[0,5.2,-4,4,2]]){ const l=new THREE.PointLight(0xf6f4ee,off,14,2); l.position.set(x,y,z); l.userData.on=on; l.userData.off=off; g.add(l); lights.push(l); }
    // 互動點（每一個都標樓層）
    const IT=E.interactables, EN=L.entrance, H=homeOf(typeof GAME!=='undefined'&&GAME.G);
    IT.push({x:EN.x,z:EN.exitZ,radius:1.3,lv:0,label:'離開宿舍',exit:{to:'campus',spawn:Object.assign({},CAMPUS)}});
    IT.push({x:H.x,z:L.corridor.z0+0.45,radius:0.75,lv:H.lv,label:H.label,exit:{to:'dorm',spawn:Object.assign({},ROOM)}});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點、鏡頭碰撞不變）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.dorm_hall']){ ASSETS.loadOne('bldg.dorm_hall').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; B3.attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes); for(const o of outs){ if(o.userData.fpos){ o.position.copy(o.userData.fpos); o.scale.setScalar(1.7); } } }).catch(e=>console.warn('宿舍走廊正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };

  return {dorm_hall,stairSurfs,buildNav,CAMPUS,ROOM,riseOf,homeOf,fixRoomExit,HOMES,Y3_UP};
})();
Z3.ZONES.dorm_hall=DM3.dorm_hall;
