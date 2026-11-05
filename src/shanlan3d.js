/* ===== 山嵐書店（新生南路那一排、校園側門對面的兩層書店；區域 xs_shanlan）=====
   企劃：AA_613 第 3 節（店名原創「山嵐書店」；營業 11:00～22:00，週五、週六到 23:00）、AA_615 第 1、2 節（放在新生南路那一排）。
   排程：LAWWW-C 11-05 04:2x 使用者 P0（D141）佇列第 2（ART-SHANLAN-BOOKSTORE-1103）：第 1 版能走進去、能坐、看起來像樣就進遊戲。
   - 室內：AA 子代理的 shanlan.glb v5（tools/blender/env_second/aa_support/shanlan_interior.py＋v2～v4 fill；配置 src/data/shanlan_layout.js，Blender 和遊戲共用）。
     載入前、載入失敗時：Z3.room 的牆、地板，家具、樓梯、二樓樓板的色塊（D38 ③）。
   - 兩層導航（D36）：第 0 層＝一樓（y 0）、第 1 層＝二樓（y 4.2）。樓梯沿西牆，從一樓南邊（z 7.62）往北爬到二樓（z 0.9）：
     25 階×0.168 m、踏面 0.28（約 32°；人物半徑 0.32 m 內高度差 0.20，D38 第 4 點：真的走得上去）。
     上半段兩層共用（和木曜日、宿舍同一個做法：上樓過了一半換到第 1 層、下樓過了一半換回第 0 層）；一樓這一層從樓梯頂走不出去。
     挑空（西南角 x −7～−1.5、z 0.9～9）二樓沒有地板，邊上是玻璃欄杆。
   - 正式模型一顆：L2_ 開頭（extras level 1）的網格、二樓的光暈搬到二樓那一組（levelGroups：人在一樓、鏡頭拉高過二樓地板時二樓整層藏起來＝剖面視角）；
     WALL_* 兩層共用，照 GLB 的 extras.dir 淡出。二樓樓板寫在 slabs（人在樓梯上時鏡頭不穿過樓板）。
   - 座位 16：一樓靠窗長椅 3、二樓靠窗長椅 5、二樓兩張閱讀桌 8（「坐下看書」；D118 不是讀書打卡，所以不給 study）。
   - 坐地板看書（floorSit 10：二樓 8、一樓 2）、互動點 7（看看新書平台×2、雜誌、文具、結帳、法律書、看看二樓）：姿勢、選單、旁白 LAWWW 照 AA_613 接
     （SH3.FLOOR_SIT、SH3.INTERACT；這裡不放空按鈕，和同弦、木曜日、南洋一樣）。
   - 進出：新生南路「進山嵐書店」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 店門內、面向店裡；店門「離開山嵐書店」→ 騎樓、店門外面、面向馬路。
   - 營業時間：src/data/places.js 的 xs_shanlan（接線 patch）；AA_613 沒寫颱風天，先不關。
   測試：node tests/shanlan_unit.js */
'use strict';
const SH3=(function(){
  const ZONE='xs_shanlan';
  const LAY=()=>typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  /* 新生南路那一邊（src/data/xinsheng_layout.js）：店門的互動點在 (facade.x＋0.9, door.z)、半徑 1.4；走出來站在它外面 1.7 m、騎樓裡、面向馬路（+x）*/
  function streetOut(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='shanlan');
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:10.2; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  // 樓梯：一條連續斜面（碰撞、找路），畫面上一階一階（tread／rise／low；engine3d.js visualHeightAt）。z0＝北邊（上面，4.2）、z1＝南邊（下面，0）
  function stairSurf(L){ const S=L.stairs; return {x0:S.x-S.w/2+0.02,x1:S.x+S.w/2-0.02,z0:+(S.z-S.len/2).toFixed(3),z1:+(S.z+S.len/2).toFixed(3),axis:'z',ya:S.ya,yb:S.yb,tread:S.tread,rise:S.rise,low:'z1'}; }

  // ---- 導航：兩層同尺寸、同原點（D36）；cell 0.1 ----
  function buildNav(L,nav0){ const S=L.stairs, st=stairSurf(L), yU=L.levels[1].y, W=L.w, D=L.d, zMid=S.z;   /* zMid：樓梯中間（z 4.26）——上半段兩層共用 */
    const nav1=new E3.NavGrid(nav0.w,nav0.h,nav0.cell,nav0.ox,nav0.oz);
    nav1.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4); nav1.setFloor(yU);
    // 一樓：家具（第 0 筆是樓梯的範圍：接成斜面，不擋）
    L.blocks.forEach((b,i)=>{ if(i===0) return; nav0.blockRect(b[0],b[1],b[2],b[3],0,0.05); });
    nav0.blockRect(4.4,8.2,0.5,0.6,0,0);   /* 店門東邊：大盆栽 (3.9, 8.5)、靠窗長椅 (5.3, 7.4)、正面玻璃中間的小縫——站得住 9 點、四周都站不住（跑步一步 0.4 m 會跳進去），擋起來（ISLAND-SWEEP-1105）*/
    nav0.freeRect(st.x0,st.z0,st.x1,st.z1); nav0.addSurf(Object.assign({},st));
    nav0.blockRect(S.x+S.w/2+0.05,(st.z0+st.z1)/2,0.14,st.z1-st.z0,0);   // 樓梯東側的實木側板＋玻璃欄杆：從旁邊上不去
    nav0.blockRect(S.x,st.z0-0.25,S.w,0.42,0);                           // 樓梯頂端北邊的一樓地板（高度差 4.2）：一樓這一層從樓梯頂走不出去，走到上面一定換到第 1 層
    // 二樓：挑空、家具、欄杆；樓梯上半段（兩層共用）
    for(const h of (L.holes||[])) nav1.blockRect(h[0],h[1],h[2],h[3],0,0);
    for(const b of ((L.levelBlocks&&L.levelBlocks[1])||[])) nav1.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    nav1.freeRect(st.x0,st.z0,st.x1,zMid); nav1.addSurf(Object.assign({},st));
    nav0._cm=null; nav1._cm=null; return {nav1,st}; }

  // ---- 備用模型（正式模型載入前、失敗時）：家具、樓梯一階一階、二樓樓板的色塊 ----
  function fallback(L,fb0,fb1){ const st=stairSurf(L), S=L.stairs, yU=L.levels[1].y, b=new TK.Bin(), b1=new TK.Bin();
    const woodM=M('#c99f6e'), stepM=M('#d2ad7e'), slabM=M('#c49b6c');
    L.blocks.forEach((q,i)=>{ if(i===0) return; const h=q[2]*q[3]>3?2.4:0.9; b.add(woodM,TK.boxG(q[2],h,q[3]),q[0],h/2,q[1]); });
    for(let k=1;k<=S.n-1;k++) b.add(stepM,TK.boxG(st.x1-st.x0,k*S.rise,S.tread),(st.x0+st.x1)/2,k*S.rise/2,st.z1-(k-0.5)*S.tread);
    b.build(fb0);
    const VO=L.void; for(const [x0,x1,z0,z1] of [[-L.w/2,L.w/2,-L.d/2,VO.z0],[VO.x1,L.w/2,VO.z0,L.d/2]]) b1.add(slabM,TK.boxG(x1-x0,0.25,z1-z0),(x0+x1)/2,yU-0.125,(z0+z1)/2);
    for(const q of ((L.levelBlocks&&L.levelBlocks[1])||[])){ const h=q[2]*q[3]>3?2.1:0.9; b1.add(woodM,TK.boxG(q[2],h,q[3]),q[0],yU+h/2,q[1]); }
    b1.build(fb1); }

  /* 正式模型的二樓：L2_ 開頭（extras level 1）的網格、在二樓高度的光暈（GLOW_）搬到二樓那一組（保留世界座標）*/
  function splitLevels(root,g1,yU){ root.updateMatrixWorld(true); g1.updateMatrixWorld(true); const mv=[], v=new THREE.Vector3();
    root.traverse(o=>{ if(o===root) return; const up=/^L2_/.test(o.name||'')||(o.userData&&o.userData.level===1)||(/^GLOW_/.test(o.name||'')&&o.getWorldPosition(v).y>=yU-0.3); if(up) mv.push(o); });
    for(const o of mv) if(o.parent) g1.attach(o); return mv.length; }

  const zone={ id:ZONE, name:'山嵐書店', indoor:true, camDist:4.2, build(E){ const L=LAY(), S=L.stairs, yU=L.levels[1].y;
    const IN=Object.assign({lv:0},L.enterAt||{x:0.8,z:7.5,yaw:Math.PI});
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:'#d7bf98',floorTex:W3.stoneTex('#c49b6c'),windows:false,spawn:IN});
    // 一樓那一組＝room() 的群組（牆、地板、天花板的備用模型搬進 fb0）；二樓那一組另外建
    const g0=z.group; g0.name='L1'; const fb0=new THREE.Group(); fb0.name='fallback0'; fb0.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb0.add(o); } g0.add(fb0);
    const g1=new THREE.Group(); g1.name='L2'; g1.userData.dyn=true; const fb1=new THREE.Group(); fb1.name='fallback1'; fb1.userData.dyn=true; g1.add(fb1);
    fallback(L,fb0,fb1);
    const root=new THREE.Group(); root.add(g0); root.add(g1); z.group=root;
    if(z.ceilLight) z.ceilLight.position.set(0.5,3.6,1.0);   /* room() 的頂燈原本在 h−0.3（8.1 m，二樓天花板下）：搬到一樓 */
    const {nav1,st}=buildNav(L,z.nav);
    z.levels=[z.nav,nav1]; z.levelGroups=[{group:g0,y:0},{group:g1,y:yU}]; z.spawn=IN; z.bounds={w:L.w,d:L.d}; z.camMaxY=L.h-0.15;
    const VO=L.void; z.slabs=[{lv:1,x0:-L.w/2,x1:L.w/2,z0:-L.d/2,z1:VO.z0,y:yU,t:0.25},{lv:1,x0:VO.x1,x1:L.w/2,z0:VO.z0,z1:L.d/2,y:yU,t:0.25}];   /* 二樓樓板（挑空以外）：人在樓梯上時鏡頭不穿過樓板（engine3d.js slabClip）*/
    // 樓梯可以點的面（點地面移動；點在樓梯上＝走到那裡）
    { const len=Math.hypot(st.z1-st.z0,st.ya-st.yb), m=new THREE.Mesh(new THREE.PlaneGeometry(st.x1-st.x0,len),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
      m.position.set((st.x0+st.x1)/2,(st.ya+st.yb)/2+0.01,(st.z0+st.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(st.ya-st.yb,st.z1-st.z0); m.userData.walkLv=0; m.userData.dyn=true;
      m.userData.stairEnds=[{x:S.x,z:st.z1-0.1,lv:0},{x:S.x,z:st.z0-0.25,lv:1}]; g0.add(m); z.walkMeshes=(z.walkMeshes||[]).concat([m]); }
    // 燈（暖色；燈具的材質自己發光、GLOW_ 合成光暈）：一樓兩盞＋挑空下的大燈籠，二樓兩盞
    const lamps=[], glowMeshes=[]; const lamp=(g,x,y,zz,on,off,dist)=>{ const l=new THREE.PointLight(0xffd2a0,off,dist||10,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g.add(l); lamps.push(l); };
    lamp(g0,1.8,3.5,-4.5,3.6,2.0,11); lamp(g0,-3.3,2.6,4.6,2.4,1.3,7); lamp(g1,1.0,7.7,-3.5,4.0,2.2,11); lamp(g1,2.6,7.7,5.4,3.2,1.8,9);
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); z._lampsOn=!!on; for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; for(const gm of glowMeshes) if(gm&&gm.material) gm.material.emissiveIntensity=on?1:0; };
    // 座位：靠窗長椅（一樓 3、二樓 5）、二樓閱讀桌 8
    z.seats=[]; for(const s of L.seats){ const lv=s.lv|0, seat={x:s.x,z:s.z,yaw:s.yaw,lv};
      z.seats.push(Object.assign({kind:'shop',table:s.table||null},seat)); E.interactables.push({x:s.x,z:s.z,radius:0.8,lv,label:s.label||'坐下',seat,shop:'shanlan'}); }
    // 出口：店門（新生南路）
    const ex=L.exit||{x:0.8,z:8.65,r:1.0,label:'離開山嵐書店'};
    E.interactables.push({x:ex.x,z:ex.z,radius:ex.r||1.0,lv:0,label:ex.label||'離開山嵐書店',exit:{to:'xinsheng',spawn:streetOut()}});
    // 正式模型
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_shanlan']) ASSETS.loadOne('bldg.xs_shanlan').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const glb=c.scene.clone(true); Z3.attachRoomGLB(z,g0,fb0,glb); splitLevels(glb,g1,yU); fb1.visible=false;
      if(typeof Z3.glowBatch==='function') for(const [g,nm] of [[g0,'xs_shanlan_glows1'],[g1,'xs_shanlan_glows2']]){ const gl=[]; (g===g0?glb:g1).traverse(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
        if(gl.length){ const gm=Z3.glowBatch(E,g,root,gl,nm,2.5); if(gm&&gm.material) gm.material.emissiveIntensity=z._lampsOn===false?0:1; glowMeshes.push(gm); } }
      if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }).catch(e=>console.warn('山嵐書店正式模型載入失敗，用備用模型',e));
    return z; } };

  if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.xs_shanlan']={url:'assets/models/env/second_ai/aa_support/shanlan.glb',type:'building',lazy:true,source:'AA 子代理（臨時支援 LAWWW2）tools/blender/env_second/aa_support/shanlan_interior.py v5，照使用者的參考圖 shanlan_int.webp',license:'本作'};
  const INTERACT=()=>{ const L=LAY(); return L?L.interact.map(q=>Object.assign({},q)):[]; };
  const FLOOR_SIT=()=>{ const L=LAY(); return L?L.floorSit.map(q=>Object.assign({},q)):[]; };
  return {ZONE,zone,streetOut,stairSurf,buildNav,splitLevels,INTERACT,FLOOR_SIT};
})();
if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xs_shanlan=SH3.zone;
