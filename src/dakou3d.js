/* ===== 大口漢堡（新生南路南邊路口、24 小時的兩層速食店；區域 xs_dakou）=====
   企劃：AA_621（24 小時；考試那兩週是大家念書的地方；一樓點餐、取餐、高腳桌，二樓學生自習區）、AA_615（放在新生南路那一排、南邊路口）。
   排程：LAWWW-C 11-05 04:51 使用者 P0（D141）佇列第 6（XS-SHOPS-REST-1105 ①）：第 1 版能走進去、能坐、看起來像樣就進遊戲。
   - 室內：BB〔帳號 A〕的兩顆 GLB（tools/blender/env_second/bb_support/dakou_interior.py --floor 1|2；配置 src/data/dakou_layout.js v3，Blender 和遊戲共用）。
     一樓 v2b（dakou_1f.glb）、二樓 v2（dakou_2f.glb）；兩顆都用絕對高度（二樓的地板就在 y 3.6）。
     載入前、載入失敗時：Z3.room 的牆、地板，家具、樓梯、二樓樓板的色塊（D38 ③）。
   - 兩層導航（D36）：第 0 層＝一樓（y 0）、第 1 層＝二樓（y 3.6）。樓梯靠東牆，從一樓 z 4.0 往北爬到二樓 z −1.6：
     21 階×0.1714 m、踏面 0.28（約 31°；人物半徑 0.32 m 內高度差 0.20，D38 第 4 點：真的走得上去）。
     上半段兩層共用（和山嵐、木曜日、宿舍同一個做法：上樓過了一半換到第 1 層、下樓過了一半換回第 0 層）；一樓這一層從樓梯頂、樓梯側邊走不出去。
     二樓樓梯口那一塊（stairHole）沒有地板，邊上是玻璃欄杆。樓梯下面（一樓 z −1.6～0.9）是關著的儲藏室：在樓梯底下，一樓這一層照樓梯的斜面算，不另外擋。
   - 正式模型：一樓那一組＝dakou_1f、二樓那一組＝dakou_2f（levelGroups：人在一樓、鏡頭拉高過二樓地板時二樓整層藏起來＝剖面視角）；
     兩顆的 WALL_* 都照 GLB 的 dir（寫在上層空節點，zones3d.js 的 wallDirOf 沿用）淡出。二樓樓板寫在 slabs（人在樓梯上時鏡頭不穿過樓板）。
   - 窗外：BB 的夜景卡 NIGHT_FRONT／NIGHT_WEST（模型裡的發光貼圖）晚上才顯示；白天藏起來（窗外暗，先將就）。
   - 座位 79：一樓 17（靠窗高腳吧台 7、雙人桌 10）、二樓 62（DAKOU_SEATS2()；全部可以讀書，AA_621「照兩點半的 studySession，可以待到天亮」）。
     高腳椅（座面 0.795 m）照 CHAR.SIT_TOP 抬高。
   - 互動點（點餐、自助點餐、取餐、回收餐盤、插座、看書架）：DK3.INTERACT，台詞、點餐 LAWWW 接（和同弦、山嵐一樣，這裡不放空按鈕）；上下樓就走樓梯。
   - 進出：新生南路「進大口漢堡」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 店門內、面向櫃檯；店門「離開大口漢堡」→ 騎樓、店門外面、面向馬路。
   - 營業時間：24 小時（AA_621），店門不擋（接線 patch 只加名字和說明）。
   測試：node tests/dakou_unit.js */
'use strict';
const DK3=(function(){
  const ZONE='xs_dakou';
  const LAY=()=>typeof DAKOU_LAYOUT!=='undefined'?DAKOU_LAYOUT.shop:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  const EXIT={x:0.0,z:7.6,r:1.0,label:'離開大口漢堡'}, ENTER={x:0.0,z:6.4,yaw:Math.PI};   /* 店門在正面（+z）中間 x 0、寬 1.8；進來站在門內 1.6 m、面向櫃檯（配置的 exit、enterAt 留給這裡填）*/
  const STOOL_TOP=0.795;   /* 高腳椅的座面（dakou_interior.py 的 stool：椅墊在 0.72、厚 0.075）*/
  /* 新生南路那一邊（src/data/xinsheng_layout.js）：店門的互動點在 (facade.x＋0.9, door.z)、半徑 1.4；走出來站在它外面 1.7 m、騎樓裡、面向馬路（+x）*/
  function streetOut(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='dakou');
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:40.4; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  // 樓梯：一條連續斜面（碰撞、找路），畫面上一階一階（tread／rise／low）。z0＝北邊（上面，3.6）、z1＝南邊（下面，0）
  function stairSurf(L){ const S=L.stairs; return {x0:S.x-S.w/2+0.02,x1:S.x+S.w/2-0.02,z0:+(S.z-S.len/2).toFixed(3),z1:+(S.z+S.len/2).toFixed(3),axis:'z',ya:S.ya,yb:S.yb,tread:S.tread,rise:S.rise,low:'z1'}; }
  const inHole=(L,b)=>{ const H=L.stairHole; return b[0]>H.x0&&b[0]<H.x1&&b[1]>H.z0&&b[1]<H.z1; };   /* 樓梯下面的儲藏室：在樓梯的範圍裡（一樓這一層照斜面算）*/

  // ---- 導航：兩層同尺寸、同原點（D36）；cell 0.1 ----
  function buildNav(L,nav0){ const S=L.stairs, st=stairSurf(L), yU=L.levels[1].y, H=L.stairHole, W=L.w, D=L.d, zMid=S.z;   /* zMid：樓梯中間（z 1.2）——上半段兩層共用 */
    const nav1=new E3.NavGrid(nav0.w,nav0.h,nav0.cell,nav0.ox,nav0.oz);
    nav1.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4); nav1.setFloor(yU);
    // 一樓：家具（樓梯範圍裡的儲藏室不擋：那裡是樓梯的斜面）
    for(const b of L.floor1.blocks){ if(inHole(L,b)) continue; nav0.blockRect(b[0],b[1],b[2],b[3],0,0.05); }
    nav0.freeRect(st.x0,st.z0,st.x1,st.z1); nav0.addSurf(Object.assign({},st));
    nav0.blockRect(S.x-S.w/2-0.05,(st.z0+st.z1)/2,0.14,st.z1-st.z0,0);   // 樓梯西側的側板（東側是牆）：從旁邊上不去
    nav0.blockRect(S.x,st.z0-0.25,S.w,0.42,0);                           // 樓梯頂端北邊的一樓（員工通道後面、關著；高度差 3.6）：一樓這一層從樓梯頂走不出去，走到上面一定換到第 1 層
    // 二樓：樓梯口挖洞、家具、欄杆；樓梯上半段（兩層共用）
    nav1.blockRect((H.x0+H.x1)/2,(H.z0+H.z1)/2,H.x1-H.x0,H.z1-H.z0,0,0);
    for(const b of L.floor2.blocks) nav1.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    nav1.freeRect(st.x0,st.z0,st.x1,zMid); nav1.addSurf(Object.assign({},st));
    nav0._cm=null; nav1._cm=null; return {nav1,st}; }
  /* 二樓樓板（樓梯口以外）：人在樓梯上時鏡頭不穿過樓板（engine3d.js slabClip）*/
  function slabsOf(L){ const H=L.stairHole, yU=L.levels[1].y, w2=L.w/2, d2=L.d/2;
    return [{lv:1,x0:-w2,x1:H.x0,z0:-d2,z1:d2,y:yU,t:0.2},{lv:1,x0:H.x0,x1:w2,z0:-d2,z1:H.z0,y:yU,t:0.2},{lv:1,x0:H.x0,x1:w2,z0:H.z1,z1:d2,y:yU,t:0.2}]; }

  // ---- 備用模型（正式模型載入前、失敗時）：家具、樓梯一階一階、二樓樓板的色塊 ----
  function fallback(L,fb0,fb1){ const st=stairSurf(L), S=L.stairs, yU=L.levels[1].y, b=new TK.Bin(), b1=new TK.Bin();
    const woodM=M('#c99f6e'), stepM=M('#e6e0d6'), slabM=M('#d8d2c6'), ctrM=M('#2f3d63');
    for(const q of L.floor1.blocks){ if(inHole(L,q)) continue; const big=q[2]*q[3]>3, h=big?2.4:(q[2]>3?1.05:0.75); b.add(big?slabM:(q[2]>3?ctrM:woodM),TK.boxG(q[2],h,q[3]),q[0],h/2,q[1]); }
    for(let k=1;k<=S.n-1;k++) b.add(stepM,TK.boxG(st.x1-st.x0,k*S.rise,S.tread),(st.x0+st.x1)/2,k*S.rise/2,st.z1-(k-0.5)*S.tread);
    b.build(fb0);
    for(const s of slabsOf(L)) b1.add(slabM,TK.boxG(s.x1-s.x0,0.2,s.z1-s.z0),(s.x0+s.x1)/2,yU-0.1,(s.z0+s.z1)/2);
    for(const q of L.floor2.blocks){ if(q[2]<0.1||q[3]<0.1) continue; const h=q[2]*q[3]>3?0.75:0.75; b1.add(woodM,TK.boxG(q[2],h,q[3]),q[0],yU+h/2,q[1]); }
    b1.build(fb1); }

  const zone={ id:ZONE, name:'大口漢堡', indoor:true, camDist:4.2, build(E){ const L=LAY(), S=L.stairs, yU=L.levels[1].y;
    const IN=Object.assign({lv:0},ENTER);
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.levels[1].y+L.levels[1].h,cell:0.1,warm:true,wallColor:'#e8c492',floorTex:W3.stoneTex('#d8d4cc'),windows:false,spawn:IN});
    // 一樓那一組＝room() 的群組（牆、地板、天花板的備用模型搬進 fb0）；二樓那一組另外建
    const g0=z.group; g0.name='L1'; const fb0=new THREE.Group(); fb0.name='fallback0'; fb0.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb0.add(o); } g0.add(fb0);
    const g1=new THREE.Group(); g1.name='L2'; g1.userData.dyn=true; const fb1=new THREE.Group(); fb1.name='fallback1'; fb1.userData.dyn=true; g1.add(fb1);
    fallback(L,fb0,fb1);
    const root=new THREE.Group(); root.add(g0); root.add(g1); z.group=root;
    if(z.ceilLight) z.ceilLight.position.set(0,3.2,1.0);   /* room() 的頂燈原本在 h−0.3（6.9 m，二樓天花板下）：搬到一樓 */
    const {nav1,st}=buildNav(L,z.nav);
    z.levels=[z.nav,nav1]; z.levelGroups=[{group:g0,y:0},{group:g1,y:yU}]; z.spawn=IN; z.bounds={w:L.w,d:L.d}; z.camMaxY=yU+L.levels[1].h-0.15;
    z.slabs=slabsOf(L);
    // 樓梯可以點的面（點地面移動；點在樓梯上＝走到那裡）
    { const len=Math.hypot(st.z1-st.z0,st.ya-st.yb), m=new THREE.Mesh(new THREE.PlaneGeometry(st.x1-st.x0,len),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
      m.position.set((st.x0+st.x1)/2,(st.ya+st.yb)/2+0.01,(st.z0+st.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(st.yb-st.ya,st.z1-st.z0);   /* 斜的方向：ya 在 z0、yb 在 z1（addSurf axis z）。原本寫成 ya−yb，斜反了，只有中間那一階點得準（TEA-SUNKEN-TAP-1105 掃到，tests/stair_tap_unit.js）*/ m.userData.walkLv=0; m.userData.dyn=true;
      m.userData.stairEnds=[{x:S.x,z:st.z1-0.1,lv:0},{x:S.x,z:st.z0-0.25,lv:1}]; g0.add(m); z.walkMeshes=(z.walkMeshes||[]).concat([m]); }
    // 燈（暖色，約 3000K；燈板、吊燈的材質自己發光）：一樓櫃檯前、座位區，二樓長桌、四人桌
    const lamps=[]; const lamp=(g,x,y,zz,on,off,dist)=>{ const l=new THREE.PointLight(0xffd2a0,off,dist||10,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g.add(l); lamps.push(l); };
    lamp(g0,-1.2,3.1,-2.0,3.2,2.2,10); lamp(g0,1.0,3.1,4.6,2.8,1.9,9); lamp(g1,-1.0,6.9,-2.8,3.4,2.2,10); lamp(g1,0.6,6.9,4.0,3.0,2.0,10);
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); z._lampsOn=!!on; for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    // 窗外的夜景卡（BB 的 NIGHT_FRONT／NIGHT_WEST）：晚上才顯示
    const nightCards=[]; let lastNight=null; const setNight=n=>{ if(n===lastNight) return; lastNight=n; for(const o of nightCards) o.visible=n; };
    const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); const hh=((h%24)+24)%24; setNight(hh<5.6||hh>=18.6); };
    // 座位：一樓 17、二樓 62（二樓全部可以讀書）
    const lift=()=>+(STOOL_TOP-((typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45)).toFixed(3);
    const high=s=>!!s.high||/有插座/.test(s.label||'');
    z.seats=[];
    for(const [lv,list] of [[0,L.floor1.seats],[1,L.floor2.seats]]) for(const s of list){ const seat={x:s.x,z:s.z,yaw:s.yaw,lv}; if(lv===1) seat.y=yU; if(high(s)) seat.lift=lift();
      z.seats.push(Object.assign({kind:'shop',table:s.table||null},seat)); const it={x:s.x,z:s.z,radius:0.8,lv,label:s.label||'坐下',seat,shop:'dakou'}; if(lv===1) it.study=true; E.interactables.push(it); }
    // 出口：店門（新生南路）
    E.interactables.push({x:EXIT.x,z:EXIT.z,radius:EXIT.r,lv:0,label:EXIT.label,exit:{to:'xinsheng',spawn:streetOut()}});
    // 正式模型：兩顆 GLB 先放進同一個 root 給 attachRoomGLB（牆的淡出清單只能建一次），二樓那一顆再搬到二樓那一組（保留世界座標）
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_dakou_1f']) Promise.all([ASSETS.loadOne('bldg.xs_dakou_1f'),ASSETS.loadOne('bldg.xs_dakou_2f').catch(()=>null)]).then(([c1,c2])=>{ if(!c1||!c1.scene||E.zone!==z) return;
      const both=new THREE.Group(); both.name='xs_dakou_glb'; const s1=c1.scene.clone(true); both.add(s1); const s2=c2&&c2.scene?c2.scene.clone(true):null; if(s2) both.add(s2);
      for(const s of [s1,s2]) if(s) s.traverse(o=>{ if(/^NIGHT_/.test(o.name||'')) nightCards.push(o); if(o.name==='WALL_BANDS') o.name='DK_BANDS'; });   /* WALL_BANDS（一樓東西兩面牆的深藍護牆＋橘線，0～1.08 m）：一個網格跨兩面牆、沒有 dir——不放進淡出清單（矮，不擋人）*/
      Z3.attachRoomGLB(z,g0,fb0,both); if(s2){ g1.attach(s2); fb1.visible=false; }
      lastNight=null; if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); else setNight(false); }).catch(e=>console.warn('大口漢堡正式模型載入失敗，用備用模型',e));
    return z; } };

  if(typeof ASSETS!=='undefined'){
    ASSETS.manifest['bldg.xs_dakou_1f']={url:'assets/models/env/second_ai/bb_support/dakou_1f.glb',type:'building',lazy:true,source:'BB〔帳號 A〕tools/blender/env_second/bb_support/dakou_interior.py --floor 1（v2b），照使用者的參考圖 dakou_ext.webp',license:'本作'};
    ASSETS.manifest['bldg.xs_dakou_2f']={url:'assets/models/env/second_ai/bb_support/dakou_2f.glb',type:'building',lazy:true,source:'BB〔帳號 A〕tools/blender/env_second/bb_support/dakou_interior.py --floor 2（v2），照使用者的參考圖 dakou_2f.webp',license:'本作'}; }
  const INTERACT=()=>{ const L=LAY(); if(!L) return []; const out=[]; for(const [lv,f] of [[0,L.floor1],[1,L.floor2]]) for(const q of f.interact) if(!/^stairs_/.test(q.kind)&&q.kind!=='clerk') out.push(Object.assign({lv},q)); return out; };
  return {ZONE,zone,streetOut,stairSurf,buildNav,slabsOf,INTERACT,EXIT,ENTER,STOOL_TOP};
})();
if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xs_dakou=DK3.zone;
