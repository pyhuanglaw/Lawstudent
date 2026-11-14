/* ===== 木曜日 Mokuyōbi（溫州街 B4 老公寓二樓的咖啡廳；區域 wz_mokuyobi）=====
   企劃：AA_617（使用者 11-03 已同意）、AA_618（台詞）。室內 AA（mokuyobi.glb，SCENE_RULES 第 12 節照參考圖，LAWWW2 11-03 驗收 MODEL_READY）；
   一樓的樓梯、鐵門、外觀、這個區域：LAWWW2（ART-MOKUYOBI-1103）。配置 src/data/mokuyobi_layout.js（AA 的室內和 LAWWW2 的樓梯讀同一份）。
   - 兩層導航（D36）：第 0 層＝一樓（樓梯口、門檻，y 0）、第 1 層＝二樓店內（y 3.2，老公寓的一樓高；溫州街外觀的 GH 3.4 只差在看不到的樓板裡）；
     樓梯 16 階×0.2 m、踏面 0.294 m（約 34°，D38 第 4 點：真的走得上去；引擎人物半徑 0.32 m 內高度差 ≤ 0.25 m，最陡約 38°），兩層共用；平台（二樓）只有第 1 層、門檻只有第 0 層。
   - 店內用 Z3.room（和 wzShop 同一套：牆淡出、天花板、燈、正式模型的接法 attachRoomGLB），整組抬到 y 3.2；樓梯間的牆、門外的街景卡也照時段、鏡頭淡出。
   - 座位 24 席都可以讀書（AA_617：「木曜日要很適合念書」）；點餐、看書櫃、唱片機、海報（配置的 interact）由 LAWWW 照 AA_618 接，這裡不放空按鈕。
   - 從溫州街 B4 的鐵門（37 號）進來；走出來站在 B4 門口的人行道上。
   - 正式模型：bldg.wz_mokuyobi_interior（AA，tools/blender/env_second/aa_support/mokuyobi_interior.py）、bldg.wz_mokuyobi_stair（LAWWW2，tools/blender/env_second/mokuyobi_stair.py）；
     載入前、載入失敗時：店內是 room() 的牆、家具色塊；樓梯是一階一階的色塊（D38 ③）。
   測試：node tests/mokuyobi_unit.js */
'use strict';
const MOK3=(function(){
  const LAY=()=>MOKUYOBI_LAYOUT;
  const Y1=MOKUYOBI_LAYOUT.stairWell.rise;        // 二樓地板（＝樓梯的總高，3.2）
  const CX=11.15, CZ=-12.25;                      // 區域座標 → 溫州街世界座標：x＋CX、z＋CZ（B4 的門在本地 −2.6 → 世界 7.4；臨街的牆內面 z 7.0 → 世界 −5.25）
  const DOOR_WZ={x:7.4,z:-4.55};                  // 溫州街上「上二樓」的互動點（人行道，B4 鐵門前）
  const OUT={x:7.4,z:-2.85,yaw:0};                // 走出來：B4 門口外的巷子，面向巷子（+z）；離「上二樓」1.7 m，在它的範圍（1.4）外面（tests/spawn_exit_unit.js）
  const IN={x:-3.75,z:5.4,yaw:Math.PI,lv:0};      // 走進來：樓梯第五、六階，面向北（往上爬）；離門口的「離開木曜日」1.35 m，在它的範圍（1.0）外面（tests/spawn_exit_unit.js）
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));

  // ---- 樓梯：一條連續斜面（碰撞、找路），畫面上一階一階（tread／rise／low；engine3d.js visualHeightAt）----
  function stairSurf(L){ const S=L.stairWell, zb=L.d/2-0.05;
    return {x0:S.x0+0.02,x1:S.x1-0.02,z0:S.top,z1:zb,axis:'z',ya:S.rise,yb:0,tread:S.tread,rise:S.rise/S.risers,low:'z1'}; }

  // ---- 導航：兩層同尺寸、同原點（D36）；cell 0.1：樓梯間兩面牆（x −4.5、−3.0）剛好落在格線上（0.2 的格子會讓東邊隔間牆往樓梯裡多擋 5 cm，找路貼著牆走就卡住）----
  function buildNav(L,nav1){ const S=L.stairWell, st=stairSurf(L), zf=L.d/2;
    const nav0=new E3.NavGrid(nav1.w,nav1.h,nav1.cell,nav1.ox,nav1.oz);
    nav0.fillBlocked(); nav0.freeRect(st.x0,S.top,st.x1,zf-0.02); nav0.addSurf(Object.assign({},st));          // 一樓：樓梯＋門檻（平台不在這一層：走到最上面一定換到第 1 層）
    nav1.setFloor(Y1);
    nav1.freeRect(st.x0,S.z0+0.06,st.x1,(S.top+st.z1)/2); nav1.addSurf(Object.assign({},st));                // 二樓：平台＋樓梯的上半段（room() 的牆內 0.4 m 擋住了，重新打開）；
    { const mid=(S.top+st.z1)/2; nav1.blockRect((S.x0+S.x1)/2,(mid+zf)/2,S.x1-S.x0,zf-mid,0); }   /* BUG-MOKUYOBI-STAIR-STUCK-1111 下樓那一側（BB 11-11 PC：線上版 30 趟卡 3 次、停在 z 5.2～6.1 還是第 1 層）：樓梯下半段在第 1 層原本沒擋（家具第 0 筆＝樓梯開口跳過、room() 只擋牆內 0.4 m），第 1 層一路延伸到樓梯底——人下樓一直留在第 1 層。照下面那行註解的本意把下半段在第 1 層擋起來：走到一半一定換回第 0 層 */
                                                                                                            // 下半段只在第 0 層：下樓的人走到一半一定換回第 0 層（和宿舍 B 跑同一個做法），走到門口才是一樓
    const d=S.door, dz0=d.z-d.w/2, dz1=d.z+d.w/2;
    nav1.blockRect(S.x1+0.05,(dz1+zf)/2,0.1,zf-dz1,0);                                                         // 東邊隔間牆（x −3.0～−2.9，門洞以南）
    nav1.blockRect(S.x1+0.05,(S.z0-0.1+dz0)/2,0.1,dz0-S.z0+0.1,0);                                            // 東邊隔間牆（門洞以北那一小段）
    nav1.blockRect((S.x0+S.x1+0.1)/2,S.z0-0.05,S.x1-S.x0+0.1,0.12,0);                                         // 北邊隔間牆（平台的北緣）
    L.blocks.forEach((b,i)=>{ if(i===0) return; nav1.blockRect(b[0],b[1],b[2],b[3],0,0.05); });               // 家具（第 0 筆是樓梯開口：上面已經接成樓梯）
    /* MOKU-PLANT-CORNER-1111（LAWWW2 11-11；BB V25_STAIR_run10、線上 779 也卡）：店門南邊的衣帽架 (−2.7,2.75)、落地植物 (−2.15,3.75)、樓梯間東邊隔間牆 (x −2.9)、
       隔間牆前的書櫃 (z 4.1～6.5) 圍出兩條比人窄的縫（植物北邊 0.45 m、植物西邊 0.4 m；人要 0.64 m）：導航格是空的、人站不進去，
       只有兩條縫接角那一格 (−2.54,3.33) 剛好站得住＝小孤島（滑進去以後往哪個方向推都出不來，40 秒）；縫口 (−2.49,3.04) 往樓梯推也卡。
       兩條縫補成阻擋（只有導航，模型不動）：A 植物北邊（x −2.9～−1.9、z 2.95～3.5）、B 植物西邊（x −2.9～−2.4、z 3.45～4.1）。
       同一次掃出來的另一個（nav_islands 的掃法）：西牆書櫃和 table 3（−3, 0.6）之間、樓梯間北牆前 (−3.75, 1.0) 一小塊（z 0.95～1.1；北邊被桌子、南邊被牆夾住，跑步一步大時跳得進去）——一起擋起來 C。
       測試：node tests/mokuyobi_plant_corner_1111_unit.js */
    for(const [x0,x1,z0,z1] of [[-2.9,-1.9,2.95,3.5],[-2.9,-2.4,3.45,4.1],[-4.0,-3.4,0.95,1.1]]) nav1.blockRect((x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,0);
    nav0._cm=null; nav1._cm=null; return {nav0,st}; }

  // ---- 樓梯的備用模型（正式模型載入前、失敗時）：一階一階的色塊＋兩側的牆 ----
  function stairFallback(L,fb){ const S=L.stairWell, st=stairSurf(L), R=st.rise, T=st.tread, n=S.risers, zb=st.z1, b=new TK.Bin();
    const stepM=M('#a7a59a'), wallM=M('#e2d4b6'), dadoM=M('#9bb39a');
    for(let k=1;k<n;k++) b.add(stepM,TK.boxG(S.x1-S.x0-0.1,k*R,T),(S.x0+S.x1)/2,k*R/2,zb-(k-0.5)*T);
    for(const [x,w] of [[S.x0-0.07,0.14],[S.x1+0.05,0.1]]){ b.add(dadoM,TK.boxG(w,Y1,L.d/2-S.z0),x,Y1/2,(S.z0+L.d/2)/2); }
    b.build(fb); }

  // ---- 正式模型的牆（樓梯 GLB）：和 attachRoomGLB 同一套（材質複製、透明、朝向、淡出判斷點）----
  function prepWalls(root){ const out=[]; root.updateMatrixWorld(true);
    root.traverse(o=>{ if(!o.isMesh||!/WALL_/.test(o.name)) return; o.material=o.material.clone(); o.material.transparent=true; const d=o.userData.dir||[0,0,1]; o.userData.dir=new THREE.Vector3(d[0],d[1],d[2]);
      o.geometry.computeBoundingBox(); o.userData.center=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); out.push(o); });
    return out; }

  const zone={ id:'wz_mokuyobi', name:'木曜日', indoor:true, camDist:3.4, build(E){ const L=LAY(), S=L.stairWell;
    // 二樓店內：Z3.room（牆、天花板、燈、淡出），整組抬到 y 3.2
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:L.wallColor,floorTex:W3.stoneTex('#d3c4a7'),windows:false,spawn:Object.assign({},IN)});
    const g1=z.group; g1.position.y=Y1; g1.name='L1';
    const fb1=new THREE.Group(); fb1.name='fallback1'; fb1.userData.dyn=true; for(const o of g1.children.slice()){ if(o.isLight) continue; g1.remove(o); fb1.add(o); } g1.add(fb1);
    const fbM=M('#a88b6a'); L.blocks.forEach((b,i)=>{ if(i===0) return; const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],0.85,b[3]),fbM); m.position.set(b[0],0.425,b[1]); fb1.add(m); });
    // 一樓：樓梯間
    const g0=new THREE.Group(); g0.name='L0'; g0.userData.dyn=true; const fb0=new THREE.Group(); fb0.name='fallback0'; fb0.userData.dyn=true; g0.add(fb0); stairFallback(L,fb0);
    const root=new THREE.Group(); root.add(g0); root.add(g1); z.group=root;
    if(Z3.roomBackdrop){ const bd=Z3.roomBackdrop(root,L.w,L.d,Y1+L.h,7,0,0); if(bd) bd.name='mok_backdrop'; }   /* MOKU-STAIR-VOID-1112（LAWWW2 自查 11-12）：一樓樓梯間只有 1.2 m 寬，跟隨鏡頭一定在牆外——兩邊露出牆外面米白的空底和一截天空。兩層樓外面包一圈暗色的殼（和 202、多功能教室一樣；二樓臨街窗有窗景板 mok_window_view，在殼裡面）*/
    const {nav0,st}=buildNav(L,z.nav);
    z.levels=[nav0,z.nav]; z.levelGroups=[{group:g0,y:0},{group:g1,y:Y1}]; z.nav=nav0; z.spawn=Object.assign({},IN); z.bounds={w:L.w,d:L.d}; z.camMaxY=L.h-0.15;
    z.cornerSlip=true;   /* MOKU-PLANT-CORNER-1111：玩家推進家具外角（植物東南角往樓梯斜推）時往旁邊讓開、繞過去（engine3d.js stepEntity 的 cornerSlip；只有開了的區域）*/
    z.slabs=[{lv:1,x0:S.x1,x1:L.w/2,z0:-L.d/2,z1:L.d/2,y:Y1,t:0.2},{lv:1,x0:-L.w/2,x1:S.x1,z0:-L.d/2,z1:S.top,y:Y1,t:0.2}];   /* 二樓地板（樓梯開口以外）：人在樓梯上時鏡頭不穿過樓板（engine3d.js slabClip）*/
    // 樓梯可以點的面（點地面移動；點在樓梯上＝走到那裡）
    { const len=Math.hypot(st.z1-st.z0,st.ya-st.yb), m=new THREE.Mesh(new THREE.PlaneGeometry(st.x1-st.x0,len),new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}));
      m.position.set((st.x0+st.x1)/2,(st.ya+st.yb)/2+0.01,(st.z0+st.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(st.yb-st.ya,st.z1-st.z0);   /* 斜的方向：ya 在 z0、yb 在 z1（addSurf axis z）。原本寫成 ya−yb，斜反了，只有中間那一階點得準（TEA-SUNKEN-TAP-1105 掃到，tests/stair_tap_unit.js）*/ m.userData.walkLv=0; m.userData.dyn=true;
      m.userData.stairEnds=[{x:(st.x0+st.x1)/2,z:st.z1-0.1,lv:0},{x:(st.x0+st.x1)/2,z:(S.z0+S.top)/2,lv:1}]; g0.add(m); z.walkMeshes=(z.walkMeshes||[]).concat([m]); }
    // 樓梯間的燈（一樓門口、樓梯中段）
    const lamps=[]; for(const [x,y,zz,on,off] of [[-3.75,2.55,6.35,3.2,1.6],[-3.75,4.5,4.5,3.2,1.6]]){ const l=new THREE.PointLight(0xffd9a0,off,6,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g0.add(l); lamps.push(l); }
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    // 門外的街景卡：晚上調暗（樓梯 GLB 的 WALL_front_VIEW）
    let viewMat=null; const at=z.applyTime; z.applyTime=function(h,w){ if(at) at.call(this,h,w); if(viewMat){ const night=(h%24<6||h%24>=18.8); viewMat.color.setScalar(night?0.16:1); viewMat.emissiveIntensity=night?0.12:0.35; } };
    // 互動點：座位（都在二樓）、離開（一樓門檻）
    z.seats=[]; for(const s of L.seats){ const lift=s.seatH&&s.seatH>0.6?+(s.seatH-((typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45)).toFixed(2):0, seat=Object.assign({x:s.x,z:s.z,yaw:s.yaw,lv:1},lift?{lift}:{},s.ap?{ap:s.ap.slice()}:{});   /* ap：沙發前面是矮桌，從指定的地方走近（和 Café 的沙發一樣）*/
      z.seats.push(Object.assign({table:s.table,kind:'shop'},seat)); E.interactables.push({x:s.x,z:s.z,radius:0.9,lv:1,label:s.label||'坐下',seat,shop:'mokuyobi',study:!!s.canStudy}); }
    E.interactables.push({x:IN.x,z:L.d/2-0.25,radius:1.0,lv:0,label:'離開木曜日',exit:{to:'wenzhou',spawn:Object.assign({},OUT)}});
    // 正式模型：店內（AA）放在二樓那一組、樓梯（LAWWW2）放在一樓那一組
    let stairWalls=[]; const reWalls=()=>{ for(const w of stairWalls) if(z.walls.indexOf(w)<0) z.walls.push(w); };
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_mokuyobi_interior']) ASSETS.loadOne('bldg.wz_mokuyobi_interior').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      root.updateMatrixWorld(true); const r1=c.scene.clone(true); Z3.attachRoomGLB(z,g1,fb1,r1); if(Z3.wzViewSwap) Z3.wzViewSwap(z,r1,'mokuyobi'); reWalls(); })   /* 窗外換成溫州街街景照片（WINVIEW-AUDIT 木曜日，LAWWW2-B 11-07；Z3.WZ_VIEW.mokuyobi）*/.catch(e=>console.warn('木曜日室內正式模型載入失敗，用備用模型',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.wz_mokuyobi_stair']) ASSETS.loadOne('bldg.wz_mokuyobi_stair').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const r=c.scene.clone(true); r.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; if(/VIEW/.test(o.name)) viewMat=o.material; } }); g0.add(r); root.updateMatrixWorld(true);
      stairWalls=prepWalls(r); if(viewMat&&stairWalls.length){ const v=stairWalls.find(o=>/VIEW/.test(o.name)); if(v) viewMat=v.material; } fb0.visible=false; reWalls(); if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12); }).catch(e=>console.warn('木曜日樓梯正式模型載入失敗，用備用模型',e));
    return z; } };

  if(typeof ASSETS!=='undefined'){
    ASSETS.manifest['bldg.wz_mokuyobi_interior']={url:'assets/models/env/second_ai/aa_support/mokuyobi.glb',type:'building',lazy:true,source:'AA（臨時支援 LAWWW2）tools/blender/env_second/aa_support/mokuyobi_interior.py；樓梯間 v3c LAWWW2',license:'本作'};
    ASSETS.manifest['bldg.wz_mokuyobi_stair']={url:'assets/models/env/second_ai/mokuyobi_stair.glb',type:'building',lazy:true,source:'LAWWW2 tools/blender/env_second/mokuyobi_stair.py',license:'本作'}; }
  return {zone,stairSurf,buildNav,Y1,CX,CZ,DOOR_WZ,OUT,IN};
})();
Z3.ZONES.wz_mokuyobi=MOK3.zone;
