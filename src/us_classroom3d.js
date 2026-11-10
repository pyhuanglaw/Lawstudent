/* ===== 美國交換：法學院一樓 Room 120 階梯教室（US-CLASSROOM-3D-1110，LAWWW2 帳號 A 2026-11-10；AA_740，D109；場景接線 D108）=====
   AA_740：三門課（Introduction 週一三 10:00、Comparative 週二四 13:00、Legal Writing 週五 09:00）共用這一間；照台灣的 201 做（6 排×8 席、一排高 30 cm、兩側走道、門在後面）。
   配置：src/data/us_classroom_layout.js（US_CLASSROOM_LAYOUT；Blender 正式模型 tools/blender/env_second/us_classroom.py 讀同一份）。
   這個檔只做「區域」：導航（每排的平台、走道台階）、48 個座位都能坐、離開教室回到 us_campus 台階下（spawn_class_out）、正式模型 bldg.us_classroom、窗景照季節換。
   劇情接線（一鍵上課淡入、classLines 字幕、門口「現在沒有課。」、期中期末的站位、誰坐哪）由 LAWWW 做；這裡給：
     z.seats（row／col／x／y／z／yaw，和 201 一樣）、z.seatOf(course,key)＝AA_740 第 2 節的座位（course：intro｜comp｜lw；key：player、korean、german_before…）、
     z.others(course)＝一般路人的座位、z.present（報告站位）、z.examProf、z.teacherSpot／z.teacherWalk、z.setBoard(title,l1,l2)（左邊白板上的字，深藍白板筆）。
   進來：us_campus 的「進教室」由 LAWWW 改成 exit:{to:'us_classroom',spawn:US_CLASSROOM.SPAWN}（有課的時候）；這個檔不改 us3d.js。
   程序化備用模型（D38 ③）：正式模型載入前、載入失敗時用（平台、長桌、椅子、白板的方塊）；載入後整組藏起來，導航、座位、互動點不變。
   測試：node tests/us_classroom_unit.js */
'use strict';
const US_CLASSROOM=(function(){
  const S={};
  const LAY=()=>typeof US_CLASSROOM_LAYOUT!=='undefined'?US_CLASSROOM_LAYOUT:null;
  const M=(c,o)=>P3.M(c,Object.assign({rough:0.85},o||{}));
  const crL=C=>{ const o={C,rows:C.rows,z0:C.rowZ0,depth:C.rowDepth,rise:C.rise,aisle:[C.aisleX0,C.aisleX1],cols:C.cols,colX:i=>C.colX0+i*C.colDX}; o.rowZ=r=>o.z0+r*o.depth; o.rowH=r=>r<0?0:o.rise*(r+1); return o; };
  /* 回到美國校園：法學院台階下（US_CAMPUS_LAYOUT.spawn_class_out） */
  const OUT=()=>{ const L=typeof US_CAMPUS_LAYOUT!=='undefined'?US_CAMPUS_LAYOUT:null; const s=L&&L.spawn_class_out; return s?{x:s.x,z:s.z,yaw:s.yaw}:{x:0,z:9.02,yaw:0}; };
  /* 窗景：照季節（us3d.js 的 usSeasonKey：summer／autumn／bare／snow），us_cls120_<季節>_{day,night}.webp（tools/blender/env_second/us_classroom_view.py） */
  const viewKind=()=>'us_cls120_'+((typeof US3!=='undefined'&&US3.usSeasonKey)?US3.usSeasonKey():'summer');
  S.viewKind=viewKind;
  S.zone={ id:'us_classroom', name:'Room 120 階梯教室', indoor:true, camDist:4.4, build(E){ const C=LAY(), CR=crL(C), W=C.W, D=C.D, H=C.H;
    const z=Z3.room(E,{w:W,d:D,h:H,cool:true,view:viewKind(),viewDepth:30,wallColor:'#ece8df',floorTex:W3.stoneTex('#7a8696'),spawn:{x:C.door.x,z:C.door.spawnZ,yaw:Math.PI},winWall:C.windows.wall,winXs:C.windows.xs,winY:C.windows.y});
    const g0=z.group, nav=z.nav;
    const g=new THREE.Group(); g.name='fallback'; g.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); g.add(o); } g0.add(g);
    const FZ=-D/2+0.1;
    // 兩塊白板（備用）＋左邊白板上的字（遊戲畫：正式模型的白板面在 z −8.545，字在前面 1.5 cm）、投影幕
    for(const k of ['board','board2']){ const b=C[k]; if(!b) continue; const m=new THREE.Mesh(new THREE.BoxGeometry(b.w,b.h,0.06),M('#f2f3f1',{rough:0.3})); m.position.set(b.x,b.y,FZ); g.add(m); }
    const B0=C.board, ink=new THREE.Mesh(new THREE.PlaneGeometry(B0.w,B0.h),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false})); ink.position.set(B0.x,B0.y,-D/2+0.155); ink.name='us_cls_board_ink'; g0.add(ink);
    z.setBoard=function(title,l1,l2){ const t=W3.canvasTex('usboard_'+title+'|'+l1+'|'+l2,1024,256,(x,w,h)=>{ x.clearRect(0,0,w,h); x.fillStyle='#22345e'; x.font='bold 46px "Noto Sans TC",sans-serif'; x.fillText(title||'',40,80); x.font='32px "Noto Sans TC",sans-serif'; if(l1) x.fillText(l1,40,150); if(l2) x.fillText(l2,40,210); }); ink.material.map=t; ink.material.needsUpdate=true; };
    z.setBoard('Comparative Constitutional Law','Judicial review: who decides?','Reading: pp. 112-140');
    { const sc=C.screen, s=new THREE.Mesh(new THREE.PlaneGeometry(sc.w,sc.h),new THREE.MeshBasicMaterial({color:0xf2f0ea})); s.position.set(sc.x,sc.y,FZ+0.04); g.add(s); }
    { const Lc=C.lectern, pb=new TK.Bin(); pb.add(TK.std({color:0xb08a60,roughness:0.6}),TK.boxG(Lc.w,Lc.h,Lc.d),Lc.x,Lc.h/2,Lc.z); pb.build(g); nav.blockRect(Lc.x,Lc.z,Lc.w+0.1,Lc.d+0.1,0,0.1); }
    // 六排座位的平台（每排高 30 cm）、兩側走道台階（每排兩階）：做法、尺寸和 201 一樣（zones3d.js 的 classroom）
    const plat=new TK.Bin(), platM=TK.std({map:W3.stoneTex('#7a8696'),roughness:0.9}), riserM=TK.std({color:0x8f8b84,roughness:0.85}); const walk=[]; z.seats=[];
    const A0=CR.aisle[0], A1=CR.aisle[1];
    for(let r=0;r<CR.rows;r++){ const z0=CR.rowZ(r), z1=r===CR.rows-1?D/2:z0+CR.depth, h=CR.rowH(r), hp=CR.rowH(r-1);
      plat.add(platM,TK.boxG(2*A0,h,z1-z0,2.4),0,h/2,(z0+z1)/2); plat.add(riserM,TK.boxG(2*A0,0.04,0.04),0,h-0.02,z0+0.02);
      nav.addSurf({x0:-A0,x1:A0,z0,z1,y:h});
      for(const sx of [-1,1]){ const xa=sx<0?-A1:A0, xb=sx<0?-A0:A1, xc=(xa+xb)/2, aw=xb-xa, st=C.aisleStepDepth;
        plat.add(platM,TK.boxG(aw,hp+0.15,st/2,2.4),xc,(hp+0.15)/2,z0+st/4); plat.add(platM,TK.boxG(aw,h,st/2,2.4),xc,h/2,z0+st*3/4); plat.add(platM,TK.boxG(aw,h,z1-z0-st,2.4),xc,h/2,(z0+st+z1)/2);
        nav.addSurf({x0:xa,x1:xb,z0,z1:z0+st,axis:'z',ya:hp,yb:h,tread:st/2,rise:0.15,low:'z0'}); nav.addSurf({x0:xa,x1:xb,z0:z0+st,z1,y:h});
        const wm=new THREE.Mesh(new THREE.PlaneGeometry(aw,Math.hypot(st,h-hp)),new THREE.MeshBasicMaterial({visible:false})); wm.position.set(xc,(hp+h)/2,z0+st/2); wm.rotation.x=-Math.PI/2+Math.atan2(h-hp,st); wm.userData.walkLv=0; wm.userData.dyn=true; g0.add(wm); walk.push(wm);
        const wf=new THREE.Mesh(new THREE.PlaneGeometry(aw,z1-z0-st),new THREE.MeshBasicMaterial({visible:false})); wf.rotation.x=-Math.PI/2; wf.position.set(xc,h+0.01,(z0+st+z1)/2); wf.userData.walkLv=0; wf.userData.dyn=true; g0.add(wf); walk.push(wf); }
      { const wp=new THREE.Mesh(new THREE.PlaneGeometry(2*A0,z1-z0),new THREE.MeshBasicMaterial({visible:false})); wp.rotation.x=-Math.PI/2; wp.position.set(0,h+0.01,(z0+z1)/2); wp.userData.walkLv=0; wp.userData.dyn=true; g0.add(wp); walk.push(wp); }
      { const dk=Z3.desk(g,nav,0,z0+C.desk.dz,0,C.desk.w,C.desk.d,'#c4a37a'); dk.position.y=h; }
      for(let i=0;i<CR.cols;i++){ const x=CR.colX(i), sz=z0+C.seat.dz; const c=Z3.chair(g,x,sz,Math.PI,'#b48d63'); c.position.y=h; z.seats.push({x,z:sz,y:h,yaw:Math.PI,row:r,col:i}); } }
    plat.build(g);
    { const fl=g.children.find(o=>o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&Math.abs(o.rotation.x+Math.PI/2)<1e-6&&o.position.y===0); if(fl){ fl.userData.walkLv=0; walk.push(fl); } }
    z.walkMeshes=walk; z.camMaxY=5.0; if(Z3.roomBackdrop) Z3.roomBackdrop(g0,W,D,H);
    // 座位互動：全部 48 個；離開教室回到美國校園（台階下）
    for(const s of z.seats) E.interactables.push({x:s.x,z:s.z+0.35,y:s.y,radius:0.62,label:'坐下',seat:s});
    E.interactables.push({x:C.door.x,z:C.door.exitZ,y:CR.rowH(CR.rows-1),radius:1.2,label:'離開教室',exit:{to:'us_campus',spawn:OUT()}});
    z.spawn={x:C.door.x,z:C.door.spawnZ,yaw:Math.PI};
    z.teacherSpot={x:C.teacher.x,z:C.teacher.z,yaw:0}; z.teacherWalk=(C.teacher.walk||[]).map(p=>({x:p[0],z:p[1]}));
    const P=C.present||{}; z.present={player:P.player&&Object.assign({},P.player),partner:P.partner&&Object.assign({},P.partner),professorSeat:P.professorSeat&&z.seats.find(s=>s.row===P.professorSeat[0]&&s.col===P.professorSeat[1])};
    z.examProf=C.exam&&C.exam.professor&&Object.assign({},C.exam.professor);
    const SP=C.seatPlan||{}, at=rc=>rc?z.seats.find(s=>s.row===rc[0]&&s.col===rc[1])||null:null;
    z.seatOf=(course,key)=>at(SP[course]&&SP[course][key]);
    z.others=course=>((SP[course]&&SP[course].others)||[]).map(at).filter(Boolean);
    P3.mergeStatic(g);
    /* 期末考（US-EXAM-PROPS-1110，LAWWW2 帳號 A 11-10；12/6 Introduction 開書考）：正式模型的 EXAM_PROPS 群組＝Introduction 有人坐的 30 個位子上的答案本、筆、攤開的書
       （玩家那本貼滿便利貼）＋講桌上一疊空白答案本。平常藏著；劇情那一場 z.setExam(true)、結束 z.setExam(false)。模型還沒載入時先記著，載入後照這個開關 */
    z.examOn=false; let examNode=null; z.setExam=on=>{ z.examOn=!!on; if(examNode) examNode.visible=z.examOn; };
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.us_classroom']) ASSETS.loadOne('bldg.us_classroom').then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); Z3.attachRoomGLB(z,g0,g,root);
      examNode=root.getObjectByName('EXAM_PROPS'); if(examNode) examNode.visible=z.examOn; }).catch(e=>console.warn('Room 120 正式模型載入失敗，用程序化備用模型',e));
    return z; } };
  S.SPAWN=(()=>{ const C=LAY(); return C?{x:C.door.x,z:C.door.spawnZ,yaw:Math.PI}:{x:0,z:7.4,yaw:Math.PI}; })();
  if(typeof Z3!=='undefined'&&Z3.ZONES&&LAY()) Z3.ZONES.us_classroom=S.zone;
  return S;
})();
