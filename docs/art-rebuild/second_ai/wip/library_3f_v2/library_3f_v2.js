/* ===== 總圖 3F 閱覽區第二版（LIB-3F-1102，LAWWW2 帳號 A 2026-11-02；WIP）=====
   使用者 11-02 08:58 的 3F 平面圖（docs/art-rebuild/second_ai/ref/lib1102_user/0858_plan_3f.jpg）：臺大人文庫（北側半圓）、討論室 344／346、
   無線上網區、現期期刊（中間）、人社西文／人社中文／科技西文／科技中文裝訂期刊、研究小間、考古題、指定參考書、四庫全書、參考書、兩面窗前的閱覽桌。
   配置：src/data/library_3f_layout.js（tools/blender/env_second/library_3f_v2_layout.py 產生）；正式模型：bldg.library_3f_v2（tools/blender/env_second/library_3f_v2.py）。
   這支只在 LIBRARY3F_LAYOUT.version===2 時接手 zones3d.js 的 library 區域（第一版 22×16 的閱覽室照舊留在 zones3d.js，沒載入這支就用它）。
   和大廳同一個外框（x −12～12、z −17～9）：東牆 z −6 是樓梯間（大廳二樓同一個位置的門），電梯和大廳同一個井（x 9.4～11.4、z −2.6～−0.4）。
   接手時把 LIBRARY_LAYOUT.reading 的 spawnFromStairs、elevator 換成第二版（大廳二樓的樓梯間門、電梯到 3F 的落點都讀這兩個）；第一版的值留在 reading.v1。
   劇情：seats 的順序照配置檔（seats[2]＝學姊，西側靠窗）；pool、課程導覽寫死的座標由 patch 改（對照表 LIBRARY3F_LAYOUT.seatMap）。 */
'use strict';
const L3F=(function(){
  const LAY=()=>(typeof LIBRARY3F_LAYOUT!=='undefined'&&LIBRARY3F_LAYOUT&&LIBRARY3F_LAYOUT.version===2)?LIBRARY3F_LAYOUT:null;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.9},o||{}));
  if(typeof ASSETS!=='undefined'&&ASSETS.manifest) ASSETS.manifest['bldg.library_3f_v2']={url:'assets/models/env/second_ai/library_3f_v2.glb',type:'building',lazy:true,
    source:'本作 Blender 腳本 tools/blender/env_second/library_3f_v2.py（總圖 3F 閱覽區第二版；配置 library_3f_v2_layout.py；照使用者 11-02 的 3F 平面圖，遊戲化設計、不是實測；貼圖 Poly Haven CC0）',license:'CC0（貼圖 Poly Haven）／本作'};
  // 第二版的樓梯間落點、電梯位置寫回 LIBRARY_LAYOUT.reading（大廳二樓的樓梯間門、電梯「3F 閱覽區」的落點、5F 書庫的電梯都讀這裡）
  (function(){ const L3=LAY(); if(!L3||typeof LIBRARY_LAYOUT==='undefined'||!LIBRARY_LAYOUT.reading) return; const R=LIBRARY_LAYOUT.reading; if(R.v1) return;
    R.v1={spawnFromStairs:Object.assign({},R.spawnFromStairs),elevator:Object.assign({},R.elevator)}; R.spawnFromStairs=Object.assign({},L3.spawnFromStairs); Object.assign(R.elevator,L3.elevator); })();

  const inRot=(R,x,z,pad)=>z<=R.cz+1e-6&&Math.hypot(x-R.cx,z-R.cz)<=R.r-pad;
  // ---- 導航：一層（範圍 navBox：閱覽區＋北牆外的人文庫）----
  function buildNav(L){ const B=L.bounds, NB=L.navBox, R=L.rotunda;
    const nav=new E3.NavGrid(NB.x1-NB.x0,NB.z1-NB.z0,0.4,NB.x0,NB.z0);
    nav.fillBlocked(); nav.freeRect(B.x0+0.4,B.z0+0.4,B.x1-0.4,B.z1-0.4);
    for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [x,z]=nav.toWorld(cx,cz); if(z>=B.z0+0.4) continue;
      const opening=x>R.open.x0+0.3&&x<R.open.x1-0.3&&z>=B.z0-0.3, room=z<B.z0-0.2&&inRot(R,x,z,0.35); if(opening||room) nav.b[nav.idx(cx,cz)]=0; }   /* 北牆只在人文庫的玻璃門那一段打通 */
    for(const f of L.furniture) blockFurn(nav,f);
    const RS=L.rotundaShelves||{r0:R.r-0.75}; for(let cz=0;cz<nav.rows;cz++) for(let cx=0;cx<nav.cols;cx++){ const [x,z]=nav.toWorld(cx,cz); if(z<B.z0-0.2&&Math.hypot(x-R.cx,z-R.cz)>RS.r0-0.1&&z<=R.cz) nav.b[nav.idx(cx,cz)]=1; }   /* 人文庫的弧形書牆 */
    nav.blockRect(R.cx,R.cz-2.2,1.6,0.9,0);   /* 人文庫中間的展示桌 */
    return nav; }
  function blockFurn(nav,f){ switch(f.type){
    case 'desk': case 'stack': case 'display': case 'wallShelf': case 'carrel': nav.blockRect(f.x,f.z,f.w+0.1,f.d+0.1,0); break;
    case 'roundTable': nav.blockCircle(f.x,f.z,f.r+0.1); break;
    case 'room': nav.blockRect((f.x0+f.x1)/2,(f.z0+f.z1)/2,f.x1-f.x0,f.z1-f.z0,0); break; } }

  // ---- 程序化備用模型（正式模型載入前、載入失敗時；D38 分類 ③）----
  function wallBox(fb,walls,x0,z0,x1,z1,h,dir,mat){ const w=Math.max(0.05,x1-x0), d=Math.max(0.05,z1-z0); const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat.clone()); m.material.transparent=true;
    m.position.set((x0+x1)/2,h/2,(z0+z1)/2); m.userData.dir=new THREE.Vector3(dir[0],0,dir[2]); m.userData.center=m.position.clone(); fb.add(m); walls.push(m); return m; }
  function fallback(L,g,fb,walls,walkMeshes){ const B=L.bounds, R=L.rotunda, H=L.h, T=0.2;
    const floorM=M('#cfc4b2',{rough:0.75}), carpetM=M('#5b6470',{rough:0.95}), wallM=M('#ece6da',{rough:0.85}), woodM=M('#a67b52',{rough:0.6}), shelfM=M('#7b5a3c',{rough:0.7}), glassM=new THREE.MeshStandardMaterial({color:0xbfd8e6,transparent:true,opacity:0.32,roughness:0.1});
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(B.x1-B.x0,B.z1-B.z0),floorM); fl.rotation.x=-Math.PI/2; fl.position.set((B.x0+B.x1)/2,0,(B.z0+B.z1)/2); fb.add(fl); walkMeshes.push(fl);
    const rf=new THREE.Mesh(new THREE.CircleGeometry(R.r,40,0,Math.PI),carpetM); rf.rotation.x=-Math.PI/2; rf.position.set(R.cx,0.004,R.cz); fb.add(rf); walkMeshes.push(rf);
    const ce=new THREE.Mesh(new THREE.PlaneGeometry(B.x1-B.x0,B.z1-B.z0),M('#f2efe8')); ce.rotation.x=Math.PI/2; ce.position.set((B.x0+B.x1)/2,H,(B.z0+B.z1)/2); fb.add(ce);
    // 外牆：北（人文庫門的兩邊）、南、西、東（樓梯間門、電梯門留開口）
    wallBox(fb,walls,B.x0,B.z0-T,R.open.x0,B.z0,H,[0,0,1],wallM); wallBox(fb,walls,R.open.x1,B.z0-T,B.x1,B.z0,H,[0,0,1],wallM);
    wallBox(fb,walls,B.x0,B.z1,B.x1,B.z1+T,H,[0,0,-1],wallM); wallBox(fb,walls,B.x0-T,B.z0,B.x0,B.z1,H,[1,0,0],wallM);
    const SD=L.stairDoor, EL=L.elevator; wallBox(fb,walls,B.x1,B.z0,B.x1+T,SD.z-SD.w/2,H,[-1,0,0],wallM); wallBox(fb,walls,B.x1,SD.z+SD.w/2,B.x1+T,B.z1,H,[-1,0,0],wallM);
    // 人文庫：弧牆（不淡出：在北牆外面；three.js 圓柱 x＝sinθ、z＝cosθ，θ π/2～3π/2＝北半邊）＋玻璃門
    const arc=new THREE.Mesh(new THREE.CylinderGeometry(R.r+0.1,R.r+0.1,H,40,1,true,Math.PI/2,Math.PI),M('#e6dccb',{side:THREE.BackSide})); arc.position.set(R.cx,H/2,R.cz); fb.add(arc);
    const door=new THREE.Mesh(new THREE.PlaneGeometry(R.open.x1-R.open.x0,2.4),glassM); door.position.set(R.cx,1.2,B.z0-0.02); fb.add(door);
    // 家具
    for(const f of L.furniture){ const add=(w,h,d,x,y,z,mat)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); fb.add(m); return m; };
      if(f.type==='desk'){ add(f.w,0.05,f.d,f.x,f.h-0.025,f.z,woodM); add(f.w-0.1,f.h-0.05,0.05,f.x,(f.h-0.05)/2,f.z,woodM); }
      else if(f.type==='stack'||f.type==='display'||f.type==='wallShelf'){ add(f.w,f.h,f.d,f.x,f.h/2,f.z,shelfM); if(f.cap){ const cm=M(f.cap); if(f.w>f.d){ add(0.04,f.h,f.d+0.02,f.x-f.w/2,f.h/2,f.z,cm); add(0.04,f.h,f.d+0.02,f.x+f.w/2,f.h/2,f.z,cm); } else { add(f.w+0.02,f.h,0.04,f.x,f.h/2,f.z-f.d/2,cm); add(f.w+0.02,f.h,0.04,f.x,f.h/2,f.z+f.d/2,cm); } } }
      else if(f.type==='roundTable'){ const t=new THREE.Mesh(new THREE.CylinderGeometry(f.r,f.r,0.04,20),woodM); t.position.set(f.x,0.72,f.z); fb.add(t); add(0.08,0.7,0.08,f.x,0.35,f.z,shelfM); }
      else if(f.type==='carrel'){ add(f.w,2.4,0.08,f.x,1.2,f.z-f.d/2,wallM); add(0.08,2.4,f.d,f.x-f.w/2,1.2,f.z,wallM); add(f.w*0.6,2.1,0.05,f.x,1.05,f.z-f.d/2-0.03,M('#8a6a4a')); }
      else if(f.type==='room'){ const w=f.x1-f.x0, d=f.z1-f.z0; add(w,2.6,0.06,(f.x0+f.x1)/2,1.3,f.z1,glassM); add(0.06,2.6,d,f.x0,1.3,(f.z0+f.z1)/2,wallM); add(0.06,2.6,d,f.x1,1.3,(f.z0+f.z1)/2,wallM); } }
    // 椅子（座位）
    const chM=M('#9a6a3e',{rough:0.6}); for(const s of L.seats){ const c=new THREE.Group(); const a=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.05,0.42),chM); a.position.y=0.45; c.add(a); const bk=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.5,0.04),chM); bk.position.set(0,0.72,-0.2); c.add(bk); c.position.set(s.x,0,s.z); c.rotation.y=s.yaw; fb.add(c); }
    return {glassM}; }

  // ---- 區域 ----
  function build(E){ const L=LAY(), B=L.bounds, R=L.rotunda, H=L.h;
    const g=new THREE.Group(), fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; g.add(fb);
    const nav=buildNav(L); const walls=[], walkMeshes=[], lights=[];
    const zone={group:g,nav,walls,walkMeshes,spawn:Object.assign({},L.spawnFromStairs),bounds:{w:B.x1-B.x0,d:2*Math.max(-L.navBox.z0,L.navBox.z1)},camMaxY:3.4,version:2,cool:true,
      fadeWalls(cam){ for(const w of walls){ const toCam=new THREE.Vector3().subVectors(cam.position,w.userData.center||w.position); const facing=toCam.dot(w.userData.dir)>0; w.material.opacity=facing?1:0.12; w.material.depthWrite=facing; } },
      onLamps(on){ for(const l of lights) l.intensity=on?l.userData.on:l.userData.off; } };
    fallback(L,g,fb,walls,walkMeshes);
    // 窗外的景（遊戲裡拍的照片＋視差，W3.windowMat；第一版 3F 也是 views/library_3f）：每一扇窗外面一片，窗的位置照配置（Blender 開的窗洞同一份）
    const WN=L.windows, wins=[]; if(WN&&typeof W3!=='undefined'&&W3.windowMat){ const ww=2*WN.hw, wh=WN.y1-WN.y0, wy=(WN.y0+WN.y1)/2;
      const add=(x,z,ry)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh),W3.windowMat(45)); m.position.set(x,wy,z); m.rotation.y=ry; m.userData.dyn=true; g.add(m); wins.push(m); };
      for(const z of WN.west) add(B.x0-0.16,z,Math.PI/2); for(const z of WN.east) add(B.x1+0.16,z,-Math.PI/2); for(const x of WN.south) add(x,B.z1+0.16,Math.PI); }
    let night0=null; zone.applyTime=function(h){ const night=(h%24<6||h%24>=19.2); if(night===night0) return; night0=night; for(const w of wins) W3.setWindowView(w.material,'library_3f',night,null,0xffffff); };
    zone.applyTime(12);
    for(const [x,z] of [[-6,-12],[6,-12],[-6,-3],[6,-3],[-6,5],[6,5],[0,-19.5]]){ const l=new THREE.PointLight(0xfff2dc,6,16,2); l.position.set(x,H-0.4,z); l.userData.on=10; l.userData.off=6; g.add(l); lights.push(l); }
    // 座位：順序照配置（seats[2]＝學姊）
    zone.seats=L.seats.map(s=>({x:s.x,z:s.z,yaw:s.yaw}));
    for(const s of zone.seats) E.interactables.push({x:s.x,z:s.z,radius:0.9,label:'坐下讀書',seat:s,study:true});
    // 樓梯間（東牆）：下樓到大廳二樓
    const SD=L.stairDoor; E.interactables.push({x:SD.x-0.6,z:SD.z,radius:1.2,label:'樓梯間：下樓（2F 自習區、1F 大廳）',exit:{to:'library_hall',spawn:Object.assign({},LIBRARY_LAYOUT.stairDoor.spawn)}});
    // 電梯（和大廳同一個井）：讀寫回去的 LIBRARY_LAYOUT.reading.elevator（樓層照第一版：1F／2F 大廳、3F 這裡、5F 書庫）
    { const EL=LIBRARY_LAYOUT.reading.elevator; nav.blockRect(EL.x0-0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect(EL.x1+0.1,(EL.z0+EL.z1)/2,0.24,EL.z1-EL.z0+0.2,0); nav.blockRect((EL.x0+EL.x1)/2,EL.z1+0.1,EL.x1-EL.x0+0.44,0.24,0);
      const RL={floors:[{lv:0,y:0}],roofY:H,elevator:Object.assign({},EL,{floors:LB3.readingFloors(LIBRARY_LAYOUT)})};
      zone.elev=B3.buildElevator(RL,g,nav,null,zone); { const sh=E.spawnHint; if(sh&&sh.elev) zone.elev.placeAt(0,true); }
      zone.update=function(dt){ zone.elev.update(dt); }; E.interactables.push({x:zone.elev.cx,z:EL.callZ,radius:1.0,label:'搭電梯',elevator:true}); }
    // 關著的房間：討論室 344／346、研究小間（看得懂的說明，D36）
    for(const f of L.furniture){ if(f.type==='room') E.interactables.push({x:(f.x0+f.x1)/2,z:f.z1+0.7,radius:1.0,label:f.label,look:f.label+'。門上貼著「請上網預約，憑學生證開門」，今天的時段都被借走了。'});
      if(f.type==='carrel') E.interactables.push({x:f.x,z:f.z-f.d/2-0.7,radius:0.8,label:f.label,look:f.label+'：要上網預約，兩個人以上才能借。玻璃上貼著今天的預約表，排滿了。'}); }
    E.interactables.push({x:R.cx,z:B.z0+0.9,radius:1.4,label:'看臺大人文庫',look:'臺大人文庫：半圓形的房間，一圈書牆放的是臺大老師、校友寫的書。'});
    // 指標（中文字：正式模型沒有字）
    for(const s of L.signs){ const sp=new THREE.Mesh(new THREE.PlaneGeometry(s.w,s.w*0.18),new THREE.MeshBasicMaterial({map:TK.signTex(s.text,{bg:'#24303a',color:'#f3efe4'})})); sp.position.set(s.x,s.y,s.z); sp.rotation.y=s.ry||0; g.add(sp); }
    // 正式模型
    zone.formal=false; if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.library_3f_v2']){ ASSETS.loadOne('bldg.library_3f_v2').then(c=>{ if(!c||!c.scene||E.zone!==zone) return; attach(zone,c.scene.clone(true),fb,walls,walkMeshes,E); zone.formal=true; }).catch(e=>console.warn('總圖 3F 第二版正式模型載入失敗，用程序化備用模型',e)); }
    return zone; }
  function attach(zone,root,fb,walls,walkMeshes,E){ const LMS=root.userData&&root.userData.lightmap;
    root.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; if(o.material&&/ceiling/.test(o.material.name)&&typeof TK!=='undefined'&&!LMS) TK.bounce(o.material,0.5,0.5); } });
    zone.group.add(root); root.updateMatrixWorld(true); const nw=[];
    root.traverse(o=>{ if(o.isMesh&&/WALL_/.test(o.name)){ o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[0,0,1]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]); o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); nw.push(o); } });
    const hid=new THREE.MeshBasicMaterial({visible:false}); for(const m of walkMeshes){ m.material=hid; m.userData.dyn=true; zone.group.attach(m); }
    fb.visible=false; walls.length=0; for(const w of nw) walls.push(w);
    /* 書架（2.1 m 高）擋住玩家時網點透空（engine3d.js 的樹幹透視；大廳第二版的書架同一套）*/
    zone.seeThru=true; root.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(!m||m.userData.seeThrough||!/l3_books|l3_vcm|l3_walnut/.test(m.name||'')) continue; m.userData.seeThrough=true; if(E&&E.patchSeeThrough) E.patchSeeThrough(m); } });
    /* 光照貼圖最後才接（GLB 的 extras.lightmap；tools/blender/env_second/lightbake/bake_library_3f_v2.sh）：外牆的材質上面才複製過（clone 不會帶 onBeforeCompile），書架的透空也先包好（roomLightmap 會接著呼叫前一個 onBeforeCompile）*/
    if(LMS&&typeof Z3!=='undefined'&&Z3.roomLightmap) zone.lightmappedN=Z3.roomLightmap(zone,root,LMS); }

  // 接手 zones3d.js 的 library（第二版的配置有載入才換）
  if(LAY()&&typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES.library){ const Z=Z3.ZONES.library; Z.buildV1=Z.build; Z.build=build; Z.name='總圖書館 3F 閱覽區'; }
  return {build,buildNav,active:()=>!!LAY()};
})();
