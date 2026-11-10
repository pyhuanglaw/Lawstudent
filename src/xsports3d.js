/* ===== 新生運動廣場（新生南路那一排的兩層運動用品店；區域 xs_xsports）=====
   企劃：AA_620 第 1、2 節（一般運動用品、系隊球衣訂做；11:00～22:00；二樓牆上掛附近學校系隊的球衣樣品）、3-2、3-4。
   排程：LAWWW-C 11-05 04:51 使用者 P0（D141）：大口漢堡、大步、好拍接完以後直接做 v1（能走進去、能逛、看起來像樣）。
   - 室內：CC〔帳號 A 的建模子代理〕的 xinsheng_sports.glb v3c（tools/blender/env_second/bb_support/xinsheng_sports_interior.py；
     配置 src/data/xinsheng_sports_layout.js v3，Blender 和遊戲共用；CC_43）。載入前、載入失敗時：Z3.room 的牆、地板，家具、樓梯、二樓樓板的色塊（D38 ③）。
   - 兩層導航（D36）：第 0 層＝一樓（y 0）、第 1 層＝二樓夾層（y 3.75，只有後段 z −3.6～0 那一條）。樓梯 x 2.5～4.0，從一樓 z 3.3 往北爬到二樓 z −2.055：
     21 階×0.1786 m、踏面 0.255 m（約 35°；人物半徑 0.32 m 內高度差 0.22，D38 第 4 點：真的走得上去）。
     上半段兩層共用（和山嵐、大口漢堡一樣）；一樓這一層從樓梯頂、側邊走不出去（兩側是牆）。二樓這一層：整張擋起來，只開配置的 walk 範圍（夾層、樓梯口）；
     夾層前緣（z 0）、樓梯洞兩邊（x 2.5、4.0）是玻璃欄杆。前段 z 0～8 是兩層樓高的挑空。
   - 正式模型一顆：L1_ 開頭、WALL_*_L1_*、在二樓高度的 GLOW_ 搬到二樓那一組（levelGroups：人在一樓、鏡頭拉高過二樓地板時二樓那一組藏起來＝剖面視角）。
     WALL_* 照 GLB 的 dir 淡出；二樓樓板寫在 slabs（人在樓梯上時鏡頭不穿過樓板）。
   - 座位：一樓試穿椅、二樓裁縫車前的圓凳（配置的 seats）。互動點（看看球架、球鞋、買東西、系隊球衣、系服訂做）XP3.INTERACT：台詞 LAWWW 照 AA_620 接。
   - 進出：新生南路「進新生運動廣場」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 店門內、面向店裡；店門「離開新生運動廣場」→ 騎樓、面向馬路。
   - 營業時間：src/data/places.js 的 xs_xsports（接線 patch），story3d.js 店門照開放時間擋。
   測試：node tests/xsports_unit.js */
'use strict';
const XP3=(function(){
  const ZONE='xs_xsports';
  const LAY=()=>typeof XINSHENG_SPORTS_LAYOUT!=='undefined'?XINSHENG_SPORTS_LAYOUT:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  const exitOf=L=>({x:L.front.door.x,z:+(L.d/2-0.4).toFixed(2),r:1.0,label:'離開新生運動廣場'});
  const enterOf=L=>({x:L.front.door.x,z:+(L.d/2-1.6).toFixed(2),yaw:Math.PI});
  function streetOut(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='xsports');
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:-33; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  function stairSurf(L){ const S=L.stairs; return {x0:S.x0+0.02,x1:S.x1-0.02,z0:S.z0,z1:S.z1,axis:'z',ya:S.ya,yb:S.yb,tread:S.tread,rise:S.rise,low:'z1'}; }
  const yUof=L=>L.levelY[1];
  /* 家具中間站得住、走不到的小角落（v9.3 #31：跑步一步 0.4 m 會跳進去、出不來）——擋起來（tests/xsports_unit.js ⑦）：
     一樓：中間斜衣架 A、圓形衣架、水壺雙面架圍起來的一塊（x −0.6～0、z 1.8～3.5；三邊的縫都不到 0.64 m）；球鞋展示台和夾層下貨架中間 (−1.55, −1.4)；
           樓梯西牆、柱子、右邊貨架中間那一條 (x 2.2、z −2～−0.8)。
     二樓：東邊衣架前面到欄杆那一條（x 4.5～6.2、z −0.8～−0.4；西邊是樓梯洞的欄杆、東邊到牆不到 0.64 m）；裁縫圓凳、衣架、樣衣間中間 (5.55, −2.0)。 */
  const POCKETS=[[[-0.3,2.65,0.8,2.0],[-1.55,-1.4,0.3,0.2],[2.2,-1.4,0.3,1.5]],[[5.35,-0.6,1.9,0.5],[5.55,-2.0,0.3,0.4]]];

  // ---- 導航：兩層同尺寸、同原點（D36）；cell 0.1 ----
  function buildNav(L,nav0){ const S=L.stairs, st=stairSurf(L), yU=yUof(L), H=L.slab.hole, W=L.w, D=L.d, zMid=S.z;   /* zMid：樓梯中間（z 0.62）——上半段兩层共用 */
    const nav1=new E3.NavGrid(nav0.w,nav0.h,nav0.cell,nav0.ox,nav0.oz);
    nav1.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4); nav1.setFloor(yU);
    // 一樓：家具、樓梯兩側的牆（配置）；樓梯接成斜面
    for(const b of L.levels[0].blocks) nav0.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    for(const b of POCKETS[0]) nav0.blockRect(b[0],b[1],b[2],b[3],0,0);
    nav0.freeRect(st.x0,st.z0,st.x1,st.z1); nav0.addSurf(Object.assign({},st));
    nav0.blockRect(S.x,st.z0-0.25,S.w,0.42,0);   // 樓梯頂端北邊的一樓（樓梯底下封起來；高度差 3.75）：一樓這一層從樓梯頂走不出去，走到上面一定換到第 1 層
    // 二樓：整張擋起來，只開 walk（夾層、樓梯口；牆邊照 room 的邊界），樓梯洞不開
    nav1.blockRect(0,0,W+2,D+2,0,0);
    const cx=v=>Math.max(-W/2+0.4,Math.min(W/2-0.4,v));
    for(const [x0,z0,x1,z1] of L.levels[1].walk){ if(x0>=H.x0-1e-6&&x1<=H.x1+1e-6&&z1>H.z1) continue;   /* 樓梯那一塊（x 2.5～4.0、z −2.055～3.3）：下面照樓梯另外開 */
      nav1.freeRect(cx(x0),Math.max(L.upperBack+0.05,z0),cx(x1),Math.min(L.levels[1].railZ-0.05,z1)); }
    for(const b of L.levels[1].blocks) nav1.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    for(const b of POCKETS[1]) nav1.blockRect(b[0],b[1],b[2],b[3],0,0);
    nav1.blockRect(H.x0-0.06,(H.z0+H.z1)/2,0.12,H.z1-H.z0,0); nav1.blockRect(H.x1+0.06,(H.z0+H.z1)/2,0.12,H.z1-H.z0,0);   // 樓梯洞兩邊的玻璃欄杆
    nav1.freeRect(st.x0,st.z0,st.x1,zMid); nav1.addSurf(Object.assign({},st));
    nav0._cm=null; nav1._cm=null; return {nav1,st}; }
  function slabsOf(L){ const H=L.slab.hole, yU=yUof(L), w2=L.w/2, t=L.slab.top-L.slab.bottom;
    return [{lv:1,x0:-w2,x1:H.x0,z0:L.slab.z0,z1:L.slab.z1,y:yU,t},{lv:1,x0:H.x1,x1:w2,z0:L.slab.z0,z1:L.slab.z1,y:yU,t},{lv:1,x0:H.x0,x1:H.x1,z0:L.slab.z0,z1:H.z0,y:yU,t}]; }

  // ---- 備用模型 ----
  function fallback(L,fb0,fb1){ const st=stairSurf(L), S=L.stairs, yU=yUof(L), b=new TK.Bin(), b1=new TK.Bin(), wood=M('#c99f6e'), step=M('#b19e8c'), slab=M('#d6cbb8');
    for(const q of L.levels[0].blocks){ const tall=q[2]*q[3]>2.5||Math.max(q[2],q[3])>4, h=tall?2.2:1.4; b.add(wood,TK.boxG(q[2],h,q[3]),q[0],h/2,q[1]); }
    for(let k=1;k<=S.risers-1;k++) b.add(step,TK.boxG(st.x1-st.x0,k*S.rise,S.tread),(st.x0+st.x1)/2,k*S.rise/2,st.z1-(k-0.5)*S.tread);
    b.build(fb0);
    for(const s of slabsOf(L)) b1.add(slab,TK.boxG(s.x1-s.x0,s.t,s.z1-s.z0),(s.x0+s.x1)/2,yU-s.t/2,(s.z0+s.z1)/2);
    for(const q of L.levels[1].blocks){ const h=0.9; b1.add(wood,TK.boxG(q[2],h,q[3]),q[0],yU+h/2,q[1]); }
    b1.build(fb1); }
  /* 正式模型的二樓：L1_、WALL_*_L1_*、在二樓高度的 GLOW_ 搬到二樓那一組（保留世界座標）*/
  function splitLevels(root,g1,yU){ root.updateMatrixWorld(true); g1.updateMatrixWorld(true); const mv=[], v=new THREE.Vector3();
    root.traverse(o=>{ if(o===root) return; const n=o.name||''; const up=/^L1_/.test(n)||/^WALL_[a-z]+_L1_/.test(n)||(/^GLOW_/.test(n)&&o.getWorldPosition(v).y>=yU-0.3); if(up&&!mv.some(p=>{ for(let q=o.parent;q;q=q.parent) if(q===p) return true; return false; })) mv.push(o); });
    for(const o of mv) if(o.parent) g1.attach(o); return mv.length; }

  const zone={ id:ZONE, name:'新生運動廣場', indoor:true, camDist:4.4, build(E){ const L=LAY(), S=L.stairs, yU=yUof(L), IN=Object.assign({lv:0},enterOf(L)), EX=exitOf(L);
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.hTotal,cell:0.1,warm:true,wallColor:L.wallColor||'#d9ccb8',floorTex:W3.stoneTex('#d9ccb0'),windows:false,spawn:IN});
    const g0=z.group; g0.name='L1'; const fb0=new THREE.Group(); fb0.name='fallback0'; fb0.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb0.add(o); } g0.add(fb0);
    const g1=new THREE.Group(); g1.name='L2'; g1.userData.dyn=true; const fb1=new THREE.Group(); fb1.name='fallback1'; fb1.userData.dyn=true; g1.add(fb1);
    fallback(L,fb0,fb1);
    const root=new THREE.Group(); root.add(g0); root.add(g1); z.group=root;
    if(z.ceilLight) z.ceilLight.position.set(0,3.2,2.0);
    const {nav1,st}=buildNav(L,z.nav);
    z.levels=[z.nav,nav1]; z.levelGroups=[{group:g0,y:0},{group:g1,y:yU}]; z.spawn=IN; z.bounds={w:L.w,d:L.d}; z.camMaxY=L.hTotal-0.15; z.slabs=slabsOf(L);
    { const len=Math.hypot(st.z1-st.z0,st.ya-st.yb), m=new THREE.Mesh(new THREE.PlaneGeometry(st.x1-st.x0,len),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
      m.position.set((st.x0+st.x1)/2,(st.ya+st.yb)/2+0.01,(st.z0+st.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(st.yb-st.ya,st.z1-st.z0);   /* 斜的方向：ya 在 z0、yb 在 z1（addSurf axis z）。原本寫成 ya−yb，斜反了，只有中間那一階點得準（TEA-SUNKEN-TAP-1105 掃到，tests/stair_tap_unit.js）*/ m.userData.walkLv=0; m.userData.dyn=true;
      m.userData.stairEnds=[{x:S.x,z:st.z1-0.1,lv:0},{x:S.x,z:st.z0-0.25,lv:1}]; g0.add(m); z.walkMeshes=(z.walkMeshes||[]).concat([m]); }
    // 燈：挑空（前段）兩盞、夾層下一盞、二樓一盞；日光燈的材質自己發光、GLOW_ 光暈晚上亮
    const lamps=[], glowMeshes=[]; const lamp=(g,x,y,zz,on,off,dist)=>{ const l=new THREE.PointLight(0xfff1dc,off,dist||11,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g.add(l); lamps.push(l); };
    lamp(g0,-2.5,5.5,4.0,3.6,2.4,13); lamp(g0,2.0,3.1,-3.5,2.6,1.8,10); lamp(g1,-2.0,6.8,-1.8,3.0,2.0,10);
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); z._lampsOn=!!on; for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; for(const gm of glowMeshes) if(gm&&gm.material) gm.material.emissiveIntensity=on?1:0; };
    // 座位
    z.seats=[]; for(const s of (L.seats||[])){ const lv=s.lv|0, seat={x:s.x,z:s.z,yaw:s.yaw,lv}; if(lv===1) seat.y=yU;
      const staff=s.kind==='stool';   /* 裁縫車前的圓凳：店員用（配置「可以不開放」）——只給 NPC，玩家不出「坐」（四周被裁縫桌、衣架、樣衣間圍住，走近點站不住）*/
      z.seats.push(Object.assign({kind:'shop',table:null},seat,staff?{npcOnly:true}:{})); if(staff) continue; E.interactables.push({x:s.x,z:s.z,radius:0.8,lv,label:s.label||'坐下',seat,shop:'xsports'}); }
    // 出口
    E.interactables.push({x:EX.x,z:EX.z,radius:EX.r,lv:0,label:EX.label,exit:{to:'xinsheng',spawn:streetOut()}});
    // 正式模型
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_xsports']) ASSETS.loadOne('bldg.xs_xsports').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const glb=c.scene.clone(true); Z3.attachRoomGLB(z,g0,fb0,glb); splitLevels(glb,g1,yU); fb1.visible=false;
      if(typeof Z3.glowBatch==='function') for(const [g,nm] of [[g0,'xs_xsports_glows1'],[g1,'xs_xsports_glows2']]){ const gl=[]; (g===g0?glb:g1).traverse(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
        if(gl.length){ const gm=Z3.glowBatch(E,g,root,gl,nm,2.5); if(gm&&gm.material) gm.material.emissiveIntensity=z._lampsOn===false?0:1; glowMeshes.push(gm); } }
      if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }).catch(e=>console.warn('新生運動廣場正式模型載入失敗，用備用模型',e));
    return z; } };

  if(typeof ASSETS!=='undefined') ASSETS.manifest['bldg.xs_xsports']={url:'assets/models/env/second_ai/bb_support/xinsheng_sports.glb',type:'building',lazy:true,source:'CC〔帳號 A 的建模子代理〕tools/blender/env_second/bb_support/xinsheng_sports_interior.py v3c，照使用者的參考圖 xinsheng_sports_int.webp（CC_43）',license:'本作'};
  const INTERACT=()=>{ const L=LAY(); return L?L.interact.map(q=>Object.assign({lv:0},q)):[]; };
  return {ZONE,zone,streetOut,stairSurf,buildNav,slabsOf,splitLevels,exitOf,enterOf,INTERACT};
})();
if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xs_xsports=XP3.zone;
