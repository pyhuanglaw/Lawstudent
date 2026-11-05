/* ===== 新生南路的一層小店（大步球鞋 xs_dabu、好拍運動 xs_haopai）=====
   企劃：AA_620 第 1、2 節（大步 11:00～22:00；好拍 12:00～21:00、週日休）、AA_615（新生南路那一排）。
   排程：LAWWW-C 11-05 04:51 使用者 P0（D141）佇列第 6（XS-SHOPS-REST-1105 ②③）：第 1 版能走進去、能逛、能坐就進遊戲。
   - 室內：CC〔帳號 A 的建模子代理〕的 GLB（tools/blender/env_second/bb_support/dabu_interior.py v2b、haopai_interior.py v2b；
     配置 src/data/dabu_layout.js、haopai_layout.js，Blender 和遊戲共用）。載入前、載入失敗時：Z3.room 的牆、地板，家具的色塊（D38 ③）。
   - 一層、一張導航格（0.1 m）；家具的阻擋照配置的 blocks。牆照 GLB 的 dir 淡出（attachRoomGLB）；GLOW_ 空節點合成一個光暈網格（照開燈切白天／晚上）。
   - 座位照配置的 seats（座面高的照 CHAR.SIT_TOP 抬高）；互動點（試穿、看看、買東西、穿線…）XSS.INTERACT(id)：台詞 LAWWW 照 AA_620 接（這裡不放空按鈕，和同弦、山嵐一樣）。
   - 進出：新生南路「進大步球鞋」「進好拍運動」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 店門內 1.6 m、面向店裡；店門「離開…」→ 騎樓、店門外面、面向馬路。
   - 營業時間：src/data/places.js 的 xs_dabu、xs_haopai（接線 patch），story3d.js 店門照開放時間擋。
   測試：node tests/xsshop_unit.js */
'use strict';
const XSS=(function(){
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  const SHOPS={
    dabu:{zone:'xs_dabu',name:'大步球鞋',lay:()=>typeof DABU_LAYOUT!=='undefined'?DABU_LAYOUT:null,glbKey:'bldg.xs_dabu',
      source:'CC〔帳號 A 的建模子代理〕tools/blender/env_second/bb_support/dabu_interior.py v2b，照使用者的參考圖 dabu_int.webp',floor:'#cfa77a',
      extra:[[-2.34,-5.05,2.72,1.9],[-1.5,-3.5,0.2,0.2]]},   /* 隔間牆後面的倉庫（x −3.7～−0.98、z −6～−4.1；配置 partition：模型裡封起來）：本來就進不去，站得住的格子擋起來（不然是走不到的小孤島）；
                                        長凳 B 尾端、毛巾桶、鞋拔中間的一個點 (−1.5, −3.5)：站得住、四周都站不住（跑步一步 0.4 m 會跳進去），擋起來 */
    haopai:{zone:'xs_haopai',name:'好拍運動',lay:()=>typeof HAOPAI_LAYOUT!=='undefined'?HAOPAI_LAYOUT.haopai:null,glbKey:'bldg.xs_haopai',
      source:'CC〔帳號 A 的建模子代理〕tools/blender/env_second/bb_support/haopai_interior.py v2b，照使用者的參考圖 haopai_int.webp',floor:'#d6c9ae',
      extra:[[1.45,-1.05,0.6,0.4]]}   /* 特價桶（x 0.74～1.22）和右牆、後段鐵架中間的縫（x 1.3～1.4、z −0.9）：站得住兩點、出不來（v9.3 #31），擋起來；旁邊走道照舊 */
  };
  /* 店門：正面（+z）、門的 x 照配置；出口的互動點在門內 0.4 m、半徑 1.0；進來站在門內 1.6 m（在出口範圍外面）、面向店裡 */
  const exitOf=L=>({x:L.front.door.x,z:+(L.d/2-0.4).toFixed(2),r:1.0});
  const enterOf=L=>({x:L.front.door.x,z:+(L.d/2-1.6).toFixed(2),yaw:Math.PI});
  /* 新生南路那一邊（src/data/xinsheng_layout.js）：店門的互動點在 (facade.x＋0.9, door.z)、半徑 1.4；走出來站在它外面 1.7 m、騎樓裡、面向馬路（+x）*/
  function streetOut(id){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id===id);
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:0; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  const seatH=(L,s)=>s.h!=null?s.h:(L.seatH!=null?L.seatH:0.45);
  const liftOf=h=>{ const top=(typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45; return h>0.6?+(h-top).toFixed(3):0; };   /* 高腳凳（座面 0.72）：抬高；一般的長凳、圓凳照引擎的坐姿 */

  function build(E,id){ const C=SHOPS[id], L=C.lay(), IN=Object.assign({lv:0},enterOf(L)), EX=exitOf(L);
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:L.wallColor||'#e8dccb',floorTex:W3.stoneTex(C.floor),windows:false,spawn:IN});
    const g=z.group, fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g.children.slice()){ if(o.isLight) continue; g.remove(o); fb.add(o); } g.add(fb);
    // 導航：家具（牆由 room() 擋）
    for(const b of L.blocks) z.nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); for(const b of (C.extra||[])) z.nav.blockRect(b[0],b[1],b[2],b[3],0,0); z.nav._cm=null;
    // 備用模型：家具的色塊
    { const bin=new TK.Bin(), wood=M('#c99f6e'), wall=M('#d8d0c2'); for(const b of L.blocks){ const tall=Math.max(b[2],b[3])>2.5||b[2]*b[3]>2.5, h=tall?2.4:0.9; bin.add(tall?wall:wood,TK.boxG(b[2],h,b[3]),b[0],h/2,b[1]); } bin.build(fb); }
    z.spawn=IN; z.bounds={w:L.w,d:L.d};
    // 燈（暖色；GLOW_ 光暈晚上亮）
    const lamps=[], glowMeshes=[]; const lamp=(x,y,zz,on,off,dist)=>{ const l=new THREE.PointLight(0xffd8ae,off,dist||9,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g.add(l); lamps.push(l); };
    lamp(0,L.h-0.5,-L.d/4,2.8,1.8,9); lamp(0,L.h-0.5,L.d/4,2.8,1.8,9);
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); z._lampsOn=!!on; for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; for(const gm of glowMeshes) if(gm&&gm.material) gm.material.emissiveIntensity=on?1:0; };
    // 座位
    z.seats=[]; for(const s of (L.seats||[])){ const seat={x:s.x,z:s.z,yaw:s.yaw,lv:0}; const lf=liftOf(seatH(L,s)); if(lf) seat.lift=lf;
      z.seats.push(Object.assign({kind:'shop',table:s.bench||null},seat)); E.interactables.push({x:s.x,z:s.z,radius:0.8,lv:0,label:s.label||'坐下',seat,shop:id}); }
    // 出口：店門（新生南路）
    E.interactables.push({x:EX.x,z:EX.z,radius:EX.r,lv:0,label:'離開'+C.name,exit:{to:'xinsheng',spawn:streetOut(id)}});
    // 正式模型
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest[C.glbKey]) ASSETS.loadOne(C.glbKey).then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const glb=c.scene.clone(true); Z3.attachRoomGLB(z,g,fb,glb);
      if(typeof Z3.glowBatch==='function'){ const gl=[]; glb.traverse(o=>{ if(o.userData&&o.userData.glow) gl.push(o); });
        if(gl.length){ const gm=Z3.glowBatch(E,g,glb,gl,C.zone+'_glows',2.5); if(gm&&gm.material) gm.material.emissiveIntensity=z._lampsOn===false?0:1; glowMeshes.push(gm); } }
      if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }).catch(e=>console.warn(C.name+'正式模型載入失敗，用備用模型',e));
    return z; }

  const INTERACT=id=>{ const L=SHOPS[id]&&SHOPS[id].lay(); return L?(L.interact||[]).map(q=>Object.assign({lv:0},q)):[]; };
  for(const id of Object.keys(SHOPS)){ const C=SHOPS[id], L0=C.lay();
    if(typeof ASSETS!=='undefined'&&L0) ASSETS.manifest[C.glbKey]={url:L0.glb,type:'building',lazy:true,source:C.source,license:'本作'};
    if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES[C.zone]={id:C.zone,name:C.name,indoor:true,camDist:4.0,build(E){ return build(E,id); }}; }
  return {SHOPS,build,streetOut,exitOf,enterOf,liftOf,INTERACT};
})();
