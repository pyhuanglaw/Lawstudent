/* ===== 多樓層建築（v9.4 第一階段，D36）：霖澤館室內——一樓大廳、直跑樓梯、玻璃電梯、二樓迴廊 =====
   使用者 2026-10-10：「遊戲不是只有漂亮的建築外觀，而是一個玩家真的能自由探索、進出建築、走樓梯、搭電梯、到不同樓層上課與生活的 3D 大學世界。」
   配置：src/data/linze_layout.js（Blender 正式模型 tools/blender/linze_interior.py 讀同一份，兩邊的位置一定一致）。
   導航：兩層 NavGrid（1F y=0、2F y=4.2）；樓梯的第二跑與最上一階兩層共用（引擎走到那裡自動換層）；
         電梯車廂的格子只有「車廂在這一層、門開著」才能走。剖面視角：zone.levelGroups（引擎 updateLevelVis）。
   畫面：正式模型（ASSETS 'bldg.linze_interior'，GLB）載入成功就換掉這裡的程序化備用模型；電梯車廂、門照樣用這裡的（要動）。 */
'use strict';
const B3=(function(){
  const LAYOUT=()=>LINZE_LAYOUT;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  // ---- 材質（程序化備用：照片的灰色花崗石、淺灰地磚、白色天花板、不鏽鋼、玻璃）----
  const graniteTex=(base,key)=>W3.canvasTex('b3gran_'+(key||base),256,256,(x,w,h)=>{ x.fillStyle=base; x.fillRect(0,0,w,h); let s=11; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<5200;i++){ const v=r(); x.fillStyle=v<0.45?'rgba(40,40,42,0.22)':(v<0.8?'rgba(255,255,255,0.20)':'rgba(120,96,80,0.18)'); const z=0.8+r()*1.6; x.fillRect(r()*w,r()*h,z,z); } x.fillStyle='rgba(60,60,60,0.25)'; x.fillRect(0,0,w,1.2); x.fillRect(0,0,1.2,h); });
  const floorTileTex=()=>W3.canvasTex('b3floor',256,256,(x,w,h)=>{ x.fillStyle='#c9c7c2'; x.fillRect(0,0,w,h); let s=23; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<4;i++) for(let j=0;j<4;j++){ const v=0.94+r()*0.1; x.fillStyle='rgba('+((201*v)|0)+','+((199*v)|0)+','+((194*v)|0)+',1)'; x.fillRect(i*64+1,j*64+1,62,62); } for(let i=0;i<3000;i++){ x.fillStyle=r()<0.5?'rgba(70,70,70,0.10)':'rgba(255,255,255,0.12)'; x.fillRect(r()*w,r()*h,1.3,1.3); } x.fillStyle='rgba(120,118,112,0.55)'; for(let k=0;k<=4;k++){ x.fillRect(k*64,0,1.2,h); x.fillRect(0,k*64,w,1.2); } });
  const ceilTex=()=>W3.canvasTex('b3ceil',128,128,(x,w,h)=>{ x.fillStyle='#f2f1ec'; x.fillRect(0,0,w,h); x.fillStyle='#cfcdc6'; for(const v of [0,63,64,127]){ x.fillRect(v,0,1,h); x.fillRect(0,v,w,1); } });
  const mat=(key,make)=>TK.M('b3_'+key,make);
  const MAT={
    granite:()=>mat('granite',()=>TK.std({map:graniteTex('#a9a7a2'),roughness:0.75})),
    graniteD:()=>mat('graniteD',()=>TK.std({map:graniteTex('#8f8d89','d'),roughness:0.75})),
    floor:()=>mat('floor',()=>TK.std({map:floorTileTex(),roughness:0.55})),
    plaster:()=>mat('plaster',()=>TK.std({map:TK.plasterTex('#ece8e0','b3p'),roughness:0.95})),
    wood:()=>mat('wood',()=>TK.std({color:0x8a5f3c,roughness:0.6})),
    woodD:()=>mat('woodD',()=>TK.std({color:0x4f3524,roughness:0.65})),
    steel:()=>mat('steel',()=>TK.std({color:0xc9ccd0,roughness:0.3,metalness:0.6})),
    frame:()=>mat('frame',()=>TK.std({color:0x3a3d40,roughness:0.5})),
    glass:()=>mat('glass',()=>TK.std({color:0xbcd3da,roughness:0.08,metalness:0.1,transparent:true,opacity:0.24,depthWrite:false,side:THREE.DoubleSide})),
    sofa:()=>mat('sofa',()=>TK.std({color:0x5d6670,roughness:0.95})),
    plant:()=>mat('plant',()=>TK.std({color:0x4f7a46,roughness:0.9})),
    ceil:()=>mat('ceil',()=>{ const t=ceilTex().clone(); t.needsUpdate=true; t.repeat.set(16/1.2,14/1.2); t.wrapS=t.wrapT=THREE.RepeatWrapping; return new THREE.MeshStandardMaterial({map:t,color:0xffffff,roughness:0.95,emissive:0x8a8a86,emissiveMap:t,emissiveIntensity:1.0,side:THREE.FrontSide}); }),
    lightPanel:()=>mat('lightPanel',()=>new THREE.MeshBasicMaterial({color:0xfff6e4})),
  };
  // 窗外的景（程序化）：南面＝法學院廣場與樹；東面＝穿堂（灰色花崗石柱、對面的玻璃牆）
  const outsideTex=(kind,night)=>W3.canvasTex('b3out_'+kind+(night?'N':''),512,256,(x,w,h)=>{ const g=x.createLinearGradient(0,0,0,h); if(night){ g.addColorStop(0,'#0e1528'); g.addColorStop(1,'#2a3350'); } else { g.addColorStop(0,'#9cc2e0'); g.addColorStop(1,'#e2ecef'); } x.fillStyle=g; x.fillRect(0,0,w,h);
    if(kind==='south'){ x.fillStyle=night?'#1b2a22':'#5f8a55'; for(let i=0;i<9;i++){ const cx=i*60+20, r=40+((i*37)%25); x.beginPath(); x.arc(cx,h*0.52,r,0,Math.PI*2); x.fill(); } x.fillStyle=night?'#3a3c40':'#b9b6ae'; x.fillRect(0,h*0.68,w,h*0.32); if(night){ x.fillStyle='rgba(255,214,150,0.8)'; for(const lx of [80,250,420]) x.fillRect(lx,h*0.55,4,4); } }
    else { x.fillStyle=night?'#2c2d30':'#a4a29d'; x.fillRect(0,h*0.08,w,h*0.92); x.fillStyle=night?'#3b3d42':'#8e8c88'; for(const cx of [60,250,440]) x.fillRect(cx,h*0.08,46,h*0.92); x.fillStyle=night?'rgba(255,220,170,0.5)':'rgba(190,210,218,0.8)'; x.fillRect(120,h*0.3,110,h*0.6); x.fillRect(310,h*0.3,110,h*0.6); } });
  /* 玻璃帷幕外的景（2026-10-11 使用者「窗景都很假」）：遊戲裡校園的畫面（W3.viewPhoto，tools/shots/window_views.py）＋視差材質（W3.windowMat）；
     平面放大（往下蓋過地面、往上蓋過屋頂、左右多 20 m）：原本斜著看或從樓梯往下看，會從平面邊緣和玻璃底下的縫看到天空。
     平面中心高度＝拍照的鏡頭高度（照片的地平線）；照片還沒載入就用原本程序化的 outsideTex。萬才館（src/wancai3d.js）也用這兩個函式 */
  function outView(kind,photo,w,h,x,yc,z,ry,depth,grp){ const m=W3.windowMat(depth); const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m); p.position.set(x,yc,z); p.rotation.y=ry; p.userData.outside=kind; p.userData.photo=photo; setOutView(p,11,'sunny',false); grp.add(p); return p; }
  function setOutView(o,h,weather,night){ const ph=W3.viewPhoto(o.userData.photo,night); W3.setWindowView(o.material,o.userData.photo,night,outsideTex(o.userData.outside,night),ph?W3.photoTint(h,weather==='rain'):0xffffff,ph&&W3.photoFade?W3.photoFade(h):0); }

  // ---- 樓梯的高度：從最下面那一階的邊緣（和地面／平台同高）連續斜上到最上面那一階踏面的中心（接縫沒有落差；
  //      踏面邊緣和斜面最多差半階 8.4 cm，腳的高度之後用 IK 補）。第一版的斜面在接縫有 8.4 cm 落差，加上坡度超過人物允許的高低差，走到樓梯底就卡住（tests/nav_buildings_unit.js 抓到）----
  function stairSurfs(L){ const S=L.stair, r=S.rise, t=S.tread, F1=S.flight1, LD=S.landing, F2=S.flight2, n1=F1.risers, n2=F2.risers;
    return { f1:{x0:S.x0,x1:S.x1,z0:F1.z0+t/2,z1:F1.z1,axis:'z',ya:n1*r,yb:0,tread:t,rise:r,low:'z1'},
      ld:{x0:S.x0,x1:S.x1,z0:LD.z0,z1:F1.z0+t/2,y:LD.y},
      f2:{x0:S.x0,x1:S.x1,z0:F2.z0+t/2,z1:F2.z1,axis:'z',ya:LD.y+n2*r,yb:LD.y,tread:t,rise:r,low:'z1'},
      top:{x0:S.x0,x1:S.x1,z0:F2.z0,z1:F2.z0+t/2,y:LD.y+n2*r} }; }

  // ---- 程序化備用模型（正式模型載入前／失敗時）----
  function buildFallback(L,lv0,lv1,walls,walkMeshes,slabs){ const W=L.W, D=L.D, Y1=L.floors[1].y, RY=L.roofY, T=L.wallT, S=L.stair, G=L.gallery;
    const b0=new TK.Bin(), b1=new TK.Bin();
    // 1F 地板
    { const fm=MAT.floor(); const t=fm.map; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(W/2.4,D/2.4); const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D),fm); f.rotation.x=-Math.PI/2; f.receiveShadow=true; f.userData.walkLv=0; lv0.add(f); walkMeshes.push(f); }
    // 樓梯：每一階一塊花崗石（實心到地面）、平台、第二跑；東側玻璃欄板＋不鏽鋼扶手
    const steps=(zb,base,n,ymax)=>{ for(let k=0;k<n;k++){ const top=base+(k+1)*S.rise, z1=zb-k*S.tread, z0=z1-S.tread; b0.add(MAT.graniteD(),TK.boxG(S.x1-S.x0,top,S.tread,2.4),(S.x0+S.x1)/2,top/2,(z0+z1)/2); } };
    steps(S.flight1.z1,0,S.flight1.risers); b0.add(MAT.graniteD(),TK.boxG(S.x1-S.x0,S.landing.y,S.landing.z1-S.landing.z0,2.4),(S.x0+S.x1)/2,S.landing.y/2,(S.landing.z0+S.landing.z1)/2); steps(S.flight2.z1,S.landing.y,S.flight2.risers);
    { const rx=S.railX+0.02, pts=[[S.flight1.z1,0.0],[S.flight1.z0,S.landing.y],[S.landing.z0,S.landing.y],[S.flight2.z0,Y1]]; for(let i=0;i<pts.length-1;i++){ const [za,ya]=pts[i], [zb,yb]=pts[i+1]; const len=Math.hypot(za-zb,ya-yb), ang=Math.atan2(yb-ya,za-zb);
        const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,0.95),MAT.glass()); gp.position.set(rx,(ya+yb)/2+0.55,(za+zb)/2); gp.rotation.set(0,Math.PI/2,0); gp.rotateZ(ang); gp.userData.noMerge=true; lv0.add(gp);
        const hr=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,len,8),MAT.steel()); hr.position.set(rx,(ya+yb)/2+1.02,(za+zb)/2); hr.rotation.x=Math.PI/2+(za>zb?-1:1)*0; hr.lookAt(rx,yb+1.02,zb); hr.rotateX(Math.PI/2); lv0.add(hr); } }
    // 樓梯可以點的面（點地面移動）
    { const surf=stairSurfs(L); for(const s of [surf.f1,surf.ld,surf.f2,surf.top]){ const w=s.x1-s.x0, d=s.z1-s.z0; const ya=s.y!==undefined?s.y:s.ya, yb=s.y!==undefined?s.y:s.yb; const g=new THREE.PlaneGeometry(w,Math.hypot(d,ya-yb)); const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({visible:false})); m.position.set((s.x0+s.x1)/2,(ya+yb)/2+0.01,(s.z0+s.z1)/2); m.rotation.x=-Math.PI/2+Math.atan2(ya-yb,d); m.userData.walkLv=s===surf.f2||s===surf.top?1:0; lv0.add(m); walkMeshes.push(m);
        /* 點在一跑樓梯上＝走完這一跑（engine3d.js；任務 #42）：[下面那一端, 上面那一端]；樓梯往北爬 */
        const S=L.stair, sx=(S.x0+S.x1)/2, ldz=(S.landing.z0+S.landing.z1)/2; if(s===surf.f1) m.userData.stairEnds=[{x:sx,z:S.flight1.z1+0.6,lv:0},{x:sx,z:ldz,lv:0}]; if(s===surf.f2) m.userData.stairEnds=[{x:sx,z:ldz,lv:0},{x:sx,z:S.flight2.z0-0.8,lv:1}]; } }
    // 二樓迴廊樓板（下面是一樓北側的天花板）、地板、玻璃欄杆
    b1.add(MAT.plaster(),TK.boxG(W,G.slabT,G.z1-(-D/2),1.2),0,Y1-G.slabT/2,(G.z1+(-D/2))/2); if(slabs) slabs.push(...slabPieces({x0:-W/2,x1:W/2,z0:-D/2,z1:G.z1},[L.elevator],{lv:1,y:Y1,t:G.slabT}));   /* 鏡頭不穿過樓板（engine3d.js 的 slabClip） */
    { const fm=MAT.floor(); const f=new THREE.Mesh(new THREE.PlaneGeometry(W,G.z1+D/2),fm.clone()); f.material.map=fm.map.clone(); f.material.map.needsUpdate=true; f.material.map.repeat.set(W/2.4,(G.z1+D/2)/2.4); f.rotation.x=-Math.PI/2; f.position.set(0,Y1+0.004,(G.z1-D/2)/2); f.receiveShadow=true; f.userData.walkLv=1; lv1.add(f); walkMeshes.push(f); }
    const EL=L.elevator; for(const [x0,x1] of [[S.x1+0.1,EL.x0-0.05],[EL.x1+0.05,W/2]]){ const len=x1-x0; if(len<=0.1) continue; const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,1.0),MAT.glass()); gp.position.set((x0+x1)/2,Y1+0.55,G.railZ); lv1.add(gp); b1.add(MAT.steel(),new THREE.BoxGeometry(len,0.06,0.08),(x0+x1)/2,Y1+1.06,G.railZ); b1.add(MAT.steel(),new THREE.BoxGeometry(len,0.12,0.06),(x0+x1)/2,Y1+0.06,G.railZ); }
    // 外牆：北（花崗石，兩層高）、西（白牆＋木作踢腳）、東（一樓玻璃門面＋上面花崗石）、南（兩層樓高的玻璃帷幕＋直櫺）
    const wall=(x,z,w,h,y,ry,dir,m,lvGroup)=>{ const ms=new THREE.Mesh(TK.boxG(w,h,T,2.4),m.clone()); ms.material.transparent=true; ms.position.set(x,y+h/2,z); ms.rotation.y=ry; ms.userData.dir=dir; ms.userData.noMerge=true; lvGroup.add(ms); walls.push(ms); return ms; };
    wall(0,-D/2,W,Y1,0,0,new THREE.Vector3(0,0,1),MAT.granite(),lv0); wall(0,-D/2,W,RY-Y1,Y1,0,new THREE.Vector3(0,0,1),MAT.granite(),lv1);
    wall(-W/2,0,D,Y1,0,Math.PI/2,new THREE.Vector3(1,0,0),MAT.plaster(),lv0); wall(-W/2,0,D,RY-Y1,Y1,Math.PI/2,new THREE.Vector3(1,0,0),MAT.plaster(),lv1);
    wall(W/2,0,D,RY-Y1,Y1,Math.PI/2,new THREE.Vector3(-1,0,0),MAT.granite(),lv1);
    // 東面一樓：玻璃＋入口自動門（z 2.6–5.4）＋直櫺；窗外是穿堂
    { const gh=Y1-0.3; const gp=new THREE.Mesh(new THREE.PlaneGeometry(D,gh),MAT.glass()); gp.position.set(W/2,gh/2,0); gp.rotation.y=-Math.PI/2; lv0.add(gp); for(let z=-D/2;z<=D/2+0.01;z+=1.75) b0.add(MAT.frame(),TK.boxG(0.1,gh,0.12),W/2-0.04,gh/2,z); b0.add(MAT.frame(),TK.boxG(0.12,0.12,D),W/2-0.04,2.9,0); b0.add(MAT.granite(),TK.boxG(0.3,0.3,D),W/2,gh+0.15,0);
      outView('east','linze_east',D+40,18,W/2+2.2,2.1,0,-Math.PI/2,20,lv0); }
    // 南面：兩層樓高的玻璃帷幕（照片「左邊兩層樓高的玻璃大廳」）
    { const gh=RY-0.4; const gp=new THREE.Mesh(new THREE.PlaneGeometry(W,gh),MAT.glass()); gp.position.set(0,gh/2,D/2); gp.rotation.y=Math.PI; lv0.add(gp); for(let x=-W/2;x<=W/2+0.01;x+=W/8) b0.add(MAT.frame(),TK.boxG(0.12,gh,0.14),x,gh/2,D/2-0.05); for(const y of [2.9,Y1,Y1+2.9]) b0.add(MAT.frame(),TK.boxG(W,0.12,0.14),0,y,D/2-0.05);
      outView('south','linze_south',W+40,20,0,2.3,D/2+3.0,Math.PI,25,lv0); }
    // 天花板（單面朝下：鏡頭在上面時看不到，剖面視角）＋燈板
    { const c=new THREE.Mesh(new THREE.PlaneGeometry(W,D),MAT.ceil()); c.rotation.x=Math.PI/2; c.position.y=RY; lv1.add(c); for(let i=0;i<4;i++) for(let j=0;j<3;j++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.6),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(-6+i*4,RY-0.01,-4+j*4.6); lv1.add(p); }
      for(let i=0;i<5;i++) for(const z of [-6.0,-4.2]){ const p=new THREE.Mesh(new THREE.CircleGeometry(0.12,12),MAT.lightPanel()); p.rotation.x=Math.PI/2; p.position.set(-6+i*3,Y1-G.slabT-0.005,z); lv1.add(p); } }
    b0.build(lv0); b1.build(lv1); }

  // ---- 門、告示、家具（程序化；正式模型也會有，這裡的只在沒有正式模型時顯示）----
  function buildDoors(L,lv0,lv1,keep0,keep1){ const D=L.D, Y1=L.floors[1].y; const b0=new TK.Bin(), b1=new TK.Bin();   /* 門框、門片＝備用模型；門牌（中文字）一直顯示（正式模型沒有字）*/
    for(const d of L.doors){ const g=d.lv?keep1:keep0, b=d.lv?b1:b0, y=d.lv?Y1:0, z=-D/2+L.wallT/2+0.02, open=!d.closed;
      b.add(MAT.frame(),TK.boxG(1.5,2.5,0.1),d.x,y+1.25,z); b.add(open?MAT.woodD():MAT.wood(),TK.boxG(1.3,2.35,0.06),d.x,y+1.18,z+0.05);
      const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.35),new THREE.MeshBasicMaterial({map:TK.signTex(d.label,{bg:'#f4f2ec',fg:'#2b2b2b'})})); sg.position.set(d.x,y+2.85,z+0.16); g.add(sg); }
    b0.build(lv0); b1.build(lv1); }
  function buildFurniture(L,lv0,lv1,nav0,nav1,keep0){ const Y1=L.floors[1].y; const b0=new TK.Bin(), b1=new TK.Bin();
    for(const f of L.furniture){ const b=f.lv?b1:b0, y=f.lv?Y1:0, nav=f.lv?nav1:nav0, ry=f.ry||0;
      if(f.type==='counter'){ b.add(MAT.wood(),TK.boxG(f.w,1.0,f.d),f.x,y+0.5,f.z); b.add(MAT.graniteD(),TK.boxG(f.w+0.1,0.05,f.d+0.1),f.x,y+1.02,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.1); }
      else if(f.type==='sofa'){ const c=Math.cos(ry), s=Math.sin(ry); b.add(MAT.sofa(),TK.boxG(f.w,0.42,f.d),f.x,y+0.21,f.z,ry); b.add(MAT.sofa(),TK.boxG(f.w,0.45,0.18),f.x-s*(f.d/2-0.09),y+0.6,f.z-c*(f.d/2-0.09),ry); nav.blockRect(f.x,f.z,f.w,f.d,ry,0.05); }
      else if(f.type==='planter'){ b.add(MAT.graniteD(),new THREE.CylinderGeometry(f.r,f.r*0.9,0.6,16),f.x,y+0.3,f.z); b.add(MAT.plant(),new THREE.IcosahedronGeometry(f.r*1.25,1),f.x,y+1.15,f.z); nav.blockCircle(f.x,f.z,f.r+0.1); }
      else if(f.type==='bench'){ b.add(MAT.wood(),TK.boxG(f.w,0.06,f.d),f.x,y+0.45,f.z); for(const sx of [-1,1]) b.add(MAT.steel(),TK.boxG(0.06,0.43,f.d*0.9),f.x+sx*(f.w/2-0.12),y+0.215,f.z); nav.blockRect(f.x,f.z,f.w,f.d,0,0.05); }
      else if(f.type==='prop'){ const n=f.nav||[f.x,f.z,f.w,f.d], h=f.h||1; b.add(MAT.wood(),TK.boxG(n[2],h,n[3]),n[0],y+h/2,n[1]); nav.blockRect(n[0],n[1],n[2],n[3],0,0.05); }   /* 大廳第二版的擺設（展示櫃、飲水機、回收桶、傘架、小圓桌；LINZE-LOBBY-V2-1028，LAWWW2-C）：備用模型一個方塊、導航擋 nav（或 w×d）；正式模型照 kind 做 */
      else if(f.type==='board'){ const tx=W3.canvasTex('b3board',512,256,(x,w,h)=>{ x.fillStyle='#24303a'; x.fillRect(0,0,w,h); x.fillStyle='#f3efe4'; x.font='bold 34px "Noto Sans TC",sans-serif'; x.fillText('法律系館A 樓層簡介',24,52); x.font='24px "Noto Sans TC",sans-serif'; x.fillText('1F　大廳｜101 教室｜法律學院辦公室',24,104); x.fillText('2F　201 階梯教室｜202 教室',24,146); x.fillText('3F 討論區｜4F 自習討論區｜5F–8F 研究室',24,188); x.fillStyle='#d6a425'; x.fillText('↑ 樓梯在大廳西側　電梯在中庭',24,232); });
        const bd=new THREE.Mesh(new THREE.PlaneGeometry(f.w,f.w/2),new THREE.MeshBasicMaterial({map:tx})); bd.position.set(f.x,y+1.65,f.z+0.01); keep0.add(bd); b.add(MAT.frame(),TK.boxG(f.w+0.1,f.w/2+0.1,0.04),f.x,y+1.65,f.z-0.03); } }
    b0.build(lv0); b1.build(lv1); }
  const g0=(lv0,lv1,k)=>k?lv1:lv0;

  // ---- 玻璃電梯（中庭裡）：井道、車廂、車門＋各層的層門、樓層燈號 ----
  function buildElevator(L,g,nav0,nav1,zone){ const EL=L.elevator, Y=L.floors.map(f=>f.y), RY=L.roofY, base=EL.base||1;   /* base：第 0 層是幾樓（總圖閱覽室的電梯在 3F）；nav1 可以沒有（只有一層的區域）*/
    const grp=new THREE.Group(); grp.userData.dyn=true; grp.name='elevator'; g.add(grp);
    const cx=(EL.x0+EL.x1)/2, cz=(EL.z0+EL.z1)/2, w=EL.x1-EL.x0, d=EL.z1-EL.z0;
    // 井道：四根不鏽鋼角柱、東西南三面玻璃、頂上機房
    const sb=new TK.Bin(); for(const [x,z] of [[EL.x0-0.08,EL.z0-0.08],[EL.x1+0.08,EL.z0-0.08],[EL.x0-0.08,EL.z1+0.08],[EL.x1+0.08,EL.z1+0.08]]) sb.add(MAT.steel(),TK.boxG(0.14,RY,0.14),x,RY/2,z);
    for(const y of Y) sb.add(MAT.steel(),TK.boxG(w+0.3,0.12,0.12),cx,y-0.06,EL.z0-0.08); sb.add(MAT.frame(),TK.boxG(w+0.4,0.5,d+0.4),cx,RY-0.25,cz); sb.build(grp);
    for(const [x,z,ry,len] of [[EL.x0-0.08,cz,Math.PI/2,d],[EL.x1+0.08,cz,Math.PI/2,d],[cx,EL.z1+0.08,0,w]]){ const gp=new THREE.Mesh(new THREE.PlaneGeometry(len,RY-0.5),MAT.glass()); gp.position.set(x,(RY-0.5)/2,z); gp.rotation.y=ry; grp.add(gp); }
    // 車廂
    const car=new THREE.Group(); car.name='ELEV_CAR'; grp.add(car); const cb=new TK.Bin();
    cb.add(MAT.graniteD(),TK.boxG(w-0.1,0.12,d-0.1),cx,-0.045,cz);   /* 車廂地板頂面高出樓板 1.5 cm：原本頂面剛好在 y=0，和樓板（Blender 模型的地板）同一個平面，手機上一直閃（使用者 2026-10-16 總圖電梯）*/ for(const [bw,bd,bx,bz] of [[w-0.1,0.08,cx,EL.z0+0.09],[w-0.1,0.08,cx,EL.z1-0.09],[0.08,d-0.1,EL.x0+0.09,cz],[0.08,d-0.1,EL.x1-0.09,cz]]) cb.add(MAT.frame(),TK.boxG(bw,0.1,bd),bx,2.55,bz);   /* 車廂頂只有四邊的框（玻璃電梯；原本一整塊深色頂板：鏡頭在車廂上方時整塊擋住玩家，總圖大廳從電梯走出來的那一刻）*/ cb.add(MAT.steel(),TK.boxG(w-0.2,0.04,0.04),cx,0.95,EL.z1-0.12); for(const sx of [-1,1]) cb.add(MAT.steel(),TK.boxG(0.04,0.04,d-0.3),cx+sx*(w/2-0.12),0.95,cz);
    for(const [x,z] of [[EL.x0+0.03,EL.z0+0.03],[EL.x1-0.03,EL.z0+0.03],[EL.x0+0.03,EL.z1-0.03],[EL.x1-0.03,EL.z1-0.03]]) cb.add(MAT.frame(),TK.boxG(0.06,2.5,0.06),x,1.25,z); cb.build(car);
    const lp=new THREE.Mesh(new THREE.PlaneGeometry(w-0.5,d-0.6),MAT.lightPanel()); lp.rotation.x=Math.PI/2; lp.position.set(cx,2.49,cz); car.add(lp);
    // 車門（兩扇，往兩側滑開）＋每一層的層門
    const doorW=(EL.doorX1-EL.doorX0)/2, dm=new THREE.MeshStandardMaterial({color:0xa9b8bf,roughness:0.15,metalness:0.4,transparent:true,opacity:0.55});
    const mkDoors=(parent,z,y)=>{ const out=[]; for(const sx of [-1,1]){ const p=new THREE.Mesh(new THREE.BoxGeometry(doorW,2.3,0.04),dm); p.position.set(cx+sx*doorW/2,y+1.15,z); parent.add(p); out.push({m:p,sx}); } return out; };
    const carDoors=mkDoors(car,EL.doorZ+0.06,0); const landDoors=Y.map(y=>mkDoors(grp,EL.doorZ-0.04,y));
    // 樓層燈號（每一層門口上方）
    const ind=Y.map((y,k)=>{ const c=document.createElement('canvas'); c.width=64; c.height=32; const t=new THREE.CanvasTexture(c); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.21),new THREE.MeshBasicMaterial({map:t})); m.position.set(cx,y+2.65,EL.doorZ-0.09); m.rotation.y=Math.PI; grp.add(m); return {c,t}; });
    const drawInd=(n)=>{ for(const {c,t} of ind){ const x=c.getContext('2d'); x.fillStyle='#101418'; x.fillRect(0,0,64,32); x.fillStyle='#ffb347'; x.font='bold 24px sans-serif'; x.textAlign='center'; x.fillText(n+'F',32,25); t.needsUpdate=true; } };
    // 車廂裡的導航格（動態）：車廂在這一層而且門開著才能走
    const cells=[]; for(let cz2=0;cz2<nav0.rows;cz2++) for(let cx2=0;cx2<nav0.cols;cx2++){ const [x,z]=nav0.toWorld(cx2,cz2); if(x>EL.x0+0.1&&x<EL.x1-0.1&&z>EL.z0+0.1&&z<EL.z1-0.05) cells.push(nav0.idx(cx2,cz2)); }
    const navs=[nav0,nav1].filter(Boolean);
    const el={lv:0,y:Y[0],isOpen:false,cx,cz:cz,inZ:cz-0.15,outZ:EL.callZ,floors:EL.floors,floorY:Y,tweens:[],car,base};
    el.setCells=()=>{ navs.forEach((n,k)=>{ const free=el.isOpen&&el.lv===k; for(const i of cells) n.b[i]=free?0:1; n._cm=null; }); };
    const setDoor=(k)=>{ for(const p of carDoors) p.m.position.x=cx+p.sx*(doorW/2+k*doorW*0.92); landDoors.forEach((ds,f)=>{ const kk=f===el.lv?k:0; for(const p of ds) p.m.position.x=cx+p.sx*(doorW/2+kk*doorW*0.92); }); };
    const tween=(dur,fn)=>new Promise(res=>el.tweens.push({t:0,dur,fn,res}));
    el.open=()=>tween(0.9,k=>setDoor(k)).then(()=>{ el.isOpen=true; el.setCells(); });
    el.close=()=>{ el.isOpen=false; el.setCells(); return tween(0.9,k=>setDoor(1-k)); };
    el.travel=(lv,rider,onStep)=>{ const y0=el.y, y1=Y[lv]; const dur=2.4+Math.abs(y1-y0)*0.4; return tween(dur,k=>{ const e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2; const y=y0+(y1-y0)*e; el.y=y; car.position.y=y-Y[0]; if(rider) rider.obj.position.y=y; let fk=0; for(let i=1;i<Y.length;i++) if(y>=(Y[i-1]+Y[i])/2) fk=i; drawInd(base+fk); if(onStep) onStep(y); }).then(()=>{ el.lv=lv; el.y=y1; el.setCells(); drawInd(lv+base); }); };
    /* 往「別的區域」的樓層（總圖：大廳 ⇄ 3F 閱覽區）：車廂往上／往下走一段、燈號一層一層跳到那一層，之後換區域（game3d.js 的 elevatorRide）*/
    el.leave=(num,rider,onStep)=>{ const n0=el.lv+base, dir=num>n0?1:-1, y0=el.y, dy=dir*Math.min(3.0,1.5*Math.abs(num-n0)); const dur=2.6+Math.abs(num-n0)*0.5; return tween(dur,k=>{ const e=k*k; const y=y0+dy*e; car.position.y=y-Y[0]; if(rider) rider.obj.position.y=y; drawInd(n0+Math.round((num-n0)*Math.min(1,k*1.15))); if(onStep) onStep(y); }); };
    /* 換區域之後：車廂停在玩家那一層、人在車廂裡；hold＝先讓車廂的格子可以走（出生點在車廂裡，門之後才打開）*/
    el.placeAt=(lv,hold)=>{ el.lv=lv; el.y=Y[lv]; car.position.y=Y[lv]-Y[0]; drawInd(lv+base); if(hold){ el.isOpen=true; } el.setCells(); };
    el.update=(dt)=>{ for(const tw of el.tweens.slice()){ tw.t+=dt; const k=Math.min(1,tw.t/tw.dur); tw.fn(k); if(k>=1){ el.tweens.splice(el.tweens.indexOf(tw),1); tw.res(); } } };
    /* 鏡頭碰撞（BUG-CAM-ELEV，使用者 2026-10-16 閱覽室電梯：車廂裡鏡頭退到井道玻璃外、穿出房間，畫面一片橘紅）：井道沒有門的三面（東、西、北玻璃）
       放看不見的碰撞盒，交給 engine3d.js 的 followCam 當隔間牆（zone.elevCams；和 zone.camCols 一起查）——車廂裡鏡頭拉近、抬高，從上面看車廂 */
    if(zone){ const inv=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}); zone.elevCams=zone.elevCams||[];
      for(const [x,z,bw,bd] of [[EL.x0-0.08,cz,0.24,d+0.4],[EL.x1+0.08,cz,0.24,d+0.4],[cx,EL.z1+0.08,w+0.4,0.24]]){ const m=new THREE.Mesh(new THREE.BoxGeometry(bw,RY,bd),inv); m.position.set(x,RY/2,z); m.name='ELEV_CAMCOL'; m.userData.dyn=true; grp.add(m); zone.elevCams.push(m); } }
    setDoor(0); drawInd(base); el.setCells(); return el; }

  // ---- 區域 ----
  const CAMPUS_DOOR={x:30.0,z:-107.4,yaw:Math.PI/2};   // 校園：從大廳走出來站在穿堂裡（西側玻璃門往東 2 m，面向東；離門的互動點 2 m，不會一出來就跳出「進入霖澤館」）
  const linze={ id:'linze', name:'法律系館A', indoor:true, camDist:4.4, build(E){ const L=LAYOUT(), W=L.W, D=L.D, Y1=L.floors[1].y, S=L.stair, G=L.gallery, EL=L.elevator;
    const g=new THREE.Group(); const lv0=new THREE.Group(), lv1=new THREE.Group(); lv0.name='L0'; lv1.name='L1'; lv0.userData.dyn=true; lv1.userData.dyn=true; g.add(lv0); g.add(lv1);
    // 導航：兩層
    const nav0=new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1), nav1=new E3.NavGrid(W+2,D+2,L.cell,-W/2-1,-D/2-1).setFloor(Y1);
    const ix0=-W/2+0.4, ix1=W/2-0.4, iz0=-D/2+0.4, iz1=D/2-0.4; nav0.blockOutside(ix0,iz0,ix1,iz1);
    const ss=stairSurfs(L); for(const s of [ss.f1,ss.ld,ss.f2,ss.top]) nav0.addSurf(Object.assign({},s));
    nav0.blockRect(S.railX,(G.z1+S.flight1.z1)/2-0.15,0.2,S.flight1.z1-G.z1-0.3,0);                   // 樓梯東側欄杆（第一跑最下面留開口）
    nav1.fillBlocked(); nav1.freeRect(ix0,G.z0,ix1,G.z1); nav1.freeRect(S.x0,S.flight2.z0,S.x1,S.flight2.z1); nav1.addSurf(Object.assign({},ss.f2)); nav1.addSurf(Object.assign({},ss.top));
    nav1.blockRect(S.railX,(S.flight2.z0+S.flight2.z1)/2+0.2,0.2,S.flight2.z1-S.flight2.z0,0);
    for(const n of [nav0]){ n.blockRect(EL.x0-0.1,(EL.z0+EL.z1)/2,0.2,EL.z1-EL.z0+0.2,0); n.blockRect(EL.x1+0.1,(EL.z0+EL.z1)/2,0.2,EL.z1-EL.z0+0.2,0); n.blockRect((EL.x0+EL.x1)/2,EL.z1+0.1,EL.x1-EL.x0+0.4,0.2,0); }   // 井道玻璃（東、西、南）
    // 畫面（程序化備用）
    const walls=[], walkMeshes=[], slabs=[]; const fb=new THREE.Group(); fb.name='fallback'; const fb0=new THREE.Group(), fb1=new THREE.Group(); fb0.userData.dyn=true; fb1.userData.dyn=true; lv0.add(fb0); lv1.add(fb1);
    buildFallback(L,fb0,fb1,walls,walkMeshes,slabs); buildDoors(L,fb0,fb1,lv0,lv1); buildFurniture(L,fb0,fb1,nav0,nav1,lv0);
    for(const o of fb0.children.slice()) if(o.userData&&o.userData.outside){ fb0.remove(o); lv0.add(o); }   /* 窗外的景一直顯示 */
    const zone={group:g,nav:nav0,levels:[nav0,nav1],levelGroups:[{group:lv0,y:0},{group:lv1,y:Y1}],walkMeshes,walls,slabs,spawn:Object.assign({},L.entrance.spawn),bounds:{w:W,d:D},camMaxY:3.4,cool:true,
      fadeWalls(cam,pp){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      applyTime(h,weather){ const night=(h%24<6||h%24>=19.2); g.traverse(o=>{ if(o.userData&&o.userData.outside) setOutView(o,h,weather,night); }); },
      onLamps(on){} };
    zone.elev=buildElevator(L,g,nav0,nav1,zone);
    zone.update=function(dt){ zone.elev.update(dt); };
    const light=new THREE.PointLight(0xfff0d8,10,26,2); light.position.set(0,6.5,1.5); g.add(light);
    // 互動點
    const IT=E.interactables, EN=L.entrance;
    IT.push({x:EN.exitX,z:EN.exitZ,radius:1.4,lv:0,label:'走出法律系館A',exit:{to:'campus',spawn:Object.assign({},CAMPUS_DOOR)}});
    for(const d of L.doors){ const it={x:d.x,z:-D/2+0.75,radius:1.15,lv:d.lv,label:d.to?('進入 '+d.label):d.label}; if(d.to) it.exit={to:d.to,spawn:d.spawn?Object.assign({},d.spawn):{x:0,z:7.0,yaw:Math.PI}};   /* d.spawn：門自己帶出生點（2F 樓梯間 → 3F 的樓梯間門口）；沒有的照舊（201 教室）*/ else it.look=d.closed;
      if(d.to&&d.gate&&Z3.roomGlbGate){ it.gate=d.gate; Z3.roomGlbGate(it,false); IT.push(Z3.roomGlbGate({x:it.x,z:it.z,radius:it.radius,lv:d.lv,label:d.label,look:d.closed,gate:d.gate},true)); }   /* 有開放時段的房間（rooms_glb3d.js；系辦）：時段內「進入…」、時段外照舊是門上的字 */
      IT.push(it); }
    const bd=L.furniture.find(f=>f.type==='board'); if(bd) IT.push({x:bd.x,z:bd.z+0.9,radius:1.0,lv:0,label:'看樓層簡介',look:'法律系館A 樓層簡介：1F 大廳、101 教室、法律學院辦公室；2F 201 階梯教室、202 教室；3F 學生討論區、301、302 教室；4F 自習討論區、401 教室、402 研討室；5F–8F 研究室（教職員）。樓梯在大廳西側，電梯在中庭。'});
    for(const f of L.floors) IT.push({x:zone.elev.cx,z:EL.callZ,radius:1.0,lv:f.lv,label:'搭電梯',elevator:true});
    // 正式模型（GLB）：載入成功就藏起程序化備用模型（導航、互動點不變）
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.linze_interior']){ ASSETS.loadOne('bldg.linze_interior').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attachFormal(zone,c.scene.clone(true),fb0,fb1,lv0,lv1,walls,walkMeshes); }).catch(e=>console.warn('霖澤館正式模型載入失敗，用程序化備用模型',e)); }
    return zone; } };
  // 正式模型：節點名稱的約定（tools/blender/linze_interior.py）——L0_*（一樓）、L1_*（二樓）、WALK_L0／WALK_L1（點地面的面，不畫）、WALL_*（會淡出的外牆）
  function attachFormal(zone,root,fb0,fb1,lv0,lv1,walls,walkMeshes){ const r0=root.getObjectByName('L0_root'), r1=root.getObjectByName('L1_root'); if(!r0||!r1) throw new Error('GLB 少了 L0_root／L1_root');
    const LMS=root.userData&&root.userData.lightmap;   /* 光照貼圖（GLB 的 extras.lightmap；霖澤館大廳 tools/blender/env_second/lightbake/bake_linze_lobby.sh，LINZE-LOBBY-V2-1028）*/
    root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; if(o.material&&/ceiling/.test(o.material.name)&&typeof TK!=='undefined'&&!LMS) TK.bounce(o.material,0.5,0.5); } });   /* 天花板：地面反射上來的光（有光照貼圖時已經烘焙進去，不另外加）*/
    lv0.add(r0); lv1.add(r1); r0.updateMatrixWorld(true); r1.updateMatrixWorld(true);
    const nw=[]; for(const r of [r0,r1]) r.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)){ o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[0,0,1]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); nw.push(o); } });
    /* 點地面用的地板照樣用程序化的（同一份配置），但要先搬出備用模型的群組：E.screenToFloor 只打「整條父節點都看得到」的地板，
       原本留在 fb0／fb1 裡跟著藏起來，正式模型載入後點樓梯踏面會打到第 0 層的平面（落在樓梯後面很遠的地方），點地面走不上樓梯（2026-10-10，flow_linze_floors）。
       看得到的地板（備用模型的一樓、二樓地板）換成不畫的材質：只給點地面用（Mesh.raycast 不看 material.visible）*/
    const hid=new THREE.MeshBasicMaterial({visible:false});
    for(const m of walkMeshes){ let p=m.parent; while(p&&p!==fb0&&p!==fb1) p=p.parent; if(!p) continue; if(!m.material||m.material.visible!==false) m.material=hid; m.userData.dyn=true; (p===fb0?lv0:lv1).attach(m); }
    fb0.visible=false; fb1.visible=false; walls.length=0; for(const w of nw) walls.push(w);
    zone.formal=true; zone.formalInfo={walls:nw.length};
    /* 光照貼圖最後才接：外牆的材質上面才複製過（clone 不會帶 onBeforeCompile）；兩層樓已經搬出 root，所以兩層一起走 */
    if(LMS&&typeof Z3!=='undefined'&&Z3.roomLightmap) zone.formalInfo.lightmapped=Z3.roomLightmap(zone,{traverse:f=>{ r0.traverse(f); r1.traverse(f); }},LMS); }
  /* 給鏡頭用的樓板範圍（engine3d.js 的 slabClip）：一塊長方形扣掉電梯井（電梯車廂穿過樓板，鏡頭看車廂裡的人時不能把井當成樓板）。只是資料，畫面不變 */
  function slabPieces(r,holes,extra){ let parts=[{x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1}]; for(const h of holes||[]){ if(!h) continue; const next=[]; for(const q of parts){ if(h.x1<=q.x0||h.x0>=q.x1||h.z1<=q.z0||h.z0>=q.z1){ next.push(q); continue; }
      if(h.z0>q.z0) next.push({x0:q.x0,x1:q.x1,z0:q.z0,z1:h.z0}); if(h.z1<q.z1) next.push({x0:q.x0,x1:q.x1,z0:h.z1,z1:q.z1}); const z0=Math.max(q.z0,h.z0), z1=Math.min(q.z1,h.z1); if(h.x0>q.x0) next.push({x0:q.x0,x1:h.x0,z0,z1}); if(h.x1<q.x1) next.push({x0:h.x1,x1:q.x1,z0,z1}); } parts=next; }
    return parts.map(q=>Object.assign({},extra,q)); }
  return {linze,stairSurfs,CAMPUS_DOOR,MAT,outsideTex,outView,setOutView,buildDoors,buildElevator,attachFormal,slabPieces};   /* 萬才館室內（src/wancai3d.js）共用：材質、窗外的景、門、電梯、正式模型的接法 */
})();
Z3.ZONES.linze=B3.linze;
