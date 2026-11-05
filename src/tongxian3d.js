/* ===== 同弦樂器（新生南路那一排的二樓吉他行；區域 xs_tongxian）=====
   企劃：AA_619 第 1 節（使用者 11-03「安排一家吉他店」「吉他社……要買吉他」；AA 定稿 D109，企劃線 22a6c4d43）；LAWWW-C 11-05 00:43Z 派 GUITAR-SHOP-ZONE-1105（X196，D108 場景程式歸 LAWWW2）。
   - 店內：CC（帳號 A）的 tongxian.glb v4d（照使用者的參考圖；配置 src/data/tongxian_layout.js，和 Blender 共用）；樓梯間的樓梯、地板的樓梯口：LAWWW2-C（tools/blender/env_second/tongxian_stair.py、glb_floor_hole.py）。
     載入前、載入失敗時：Z3.room 的牆、地板、家具色塊（D38 ③）。
   - 進出：新生南路上的「進同弦樂器（吉他行（二樓））」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 站在店門內（樓梯上來的平台旁邊）；
     店門（樓梯間東牆上的門）的「下樓（回新生南路）」→ 騎樓的樓梯口外面、面向馬路。樓梯看得到、不用走（進出都在平台旁邊的門口）。
   - 座位：兩張試琴椅「試彈」（座面 0.6 m）、櫃台前的木凳「坐下」（0.66 m）——lift＝座面－CHAR.SIT_TOP（和 Café 的吧台一樣）。
   - 「看看」（吉他牆、烏克麗麗）、「買東西」（櫃台）：選單和台詞 LAWWW 照 AA_619 第 1、4 節接（這裡不放空按鈕，和木曜日一樣）；點的位置、id、label 在 TX3.INTERACT（＝配置的 interact）。
     老闆站的位置：TX3.OWNER（配置的 npc.owner：櫃台後面）。
   - 營業：12:00～21:30、週一公休、颱風天關（AA_619）：src/data/places.js 的 hours.xs_tongxian、typhoonShops（places.js 在 index.html 裡比這個檔晚載入，所以寫在那裡）。
     新生南路的店門照開放時間擋（story3d.js 的 onInteract，和溫州街的店同一句 PLACES.closedText）；打烊時人還在店裡「請你出來」＝LAWWW（照 mokuyobi_sys3d.js）。
   測試：node tests/tongxian_unit.js */
'use strict';
const TX3=(function(){
  const ZONE='xs_tongxian';
  const LAY=()=>typeof TONGXIAN_LAYOUT!=='undefined'?TONGXIAN_LAYOUT.shop:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  const SIT_TOP=()=>(typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.47;
  /* 新生南路那一邊（src/data/xinsheng_layout.js）：店門的互動點在 (facade.x＋0.9, door.z)、半徑 1.4；走出來站在它外面 1.7 m、騎樓裡、面向馬路（+x）*/
  function streetOut(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='tongxian');
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:-7.2; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  const zone={ id:ZONE, name:'同弦樂器', indoor:true, camDist:3.6, build(E){ const L=LAY();
    const IN=Object.assign({},L.enterAt||L.spawn);
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:L.wallColor||'#ecdfca',floorTex:W3.stoneTex('#c9a780'),windows:false,spawn:IN});
    const g0=z.group, fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    // 導航：配置的 blocks＝[x 中心, z 中心, 寬, 深]（家具、櫃台、樓梯間）；外牆由 room() 擋（牆內 0.4 m）
    const nav=z.nav; for(const b of L.blocks) nav.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    { const d=L.door; nav.freeRect(-1.0,d.z0+0.07,0.68,L.d/2-0.2); }   /* 店門內那一條（開著的門片貼著 z 4.2、工作桌 x 0.75 以東）：room() 離牆 0.4 m 擋住以後只剩 0.5 m、人（直徑 0.64）過不去；放寬到離南牆 0.2 m、門片的北邊不加寬（CC 的 walkNote：店門進來往東、再往北）*/
    nav._cm=null;
    { const fbM=M('#a88b6a'); for(const b of L.blocks){ const h=b[2]*b[3]>3?2.6:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],h,b[3]),fbM); m.position.set(b[0],h/2,b[1]); fb.add(m); } }   /* 備用：家具色塊（樓梯間那一塊做成牆的高度）*/
    z.bounds={w:L.w,d:L.d}; z.camMaxY=L.h-0.15;
    // 燈：店的吊燈、樓梯間（正式模型的燈罩照 GLOW_ 合成光暈）
    const lamps=[]; for(const [x,y,zz,on,off] of [[-1.65,2.5,-4.15,4,2.2],[1.2,2.9,-1.5,5,3],[0.6,2.9,2.8,4,2.4],[-2.2,2.9,3.0,2.2,1.2]]){ const l=new THREE.PointLight(0xffe2b8,off,8,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; g0.add(l); lamps.push(l); }
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; };
    // 座位（試琴椅、櫃台前的木凳）
    z.seats=[]; for(const s of L.seats){ const lift=s.seatH&&s.seatH>0.5?+(s.seatH-SIT_TOP()).toFixed(2):0, seat=Object.assign({x:s.x,z:s.z,yaw:s.yaw,lv:0},lift?{lift}:{});
      z.seats.push(Object.assign({kind:'shop',tongxian:s.id||null},seat)); E.interactables.push({x:s.x,z:s.z,radius:0.8,lv:0,label:s.label||'坐下',seat,shop:'tongxian',tongxian:s.id||null}); }
    // 出口：店門（樓梯間東牆上的門）
    const ex=L.exit||{x:-0.9,z:(L.door.z0+L.door.z1)/2,r:0.8,label:'下樓（回新生南路）'};
    E.interactables.push({x:ex.x,z:ex.z,radius:ex.r||0.8,lv:0,label:ex.label||'下樓（回新生南路）',exit:{to:'xinsheng',spawn:streetOut()}});
    // 正式模型：店內（CC）＋樓梯間（LAWWW2），同一個座標
    const glows=[]; let gMesh=null; const glowUp=()=>{ if(!glows.length||typeof Z3.glowBatch!=='function') return; if(gMesh&&gMesh.parent) gMesh.parent.remove(gMesh);
      gMesh=Z3.glowBatch(E,g0,g0,glows,'xs_tongxian_glows',2.5); if(gMesh&&gMesh.material) gMesh.material.emissiveIntensity=z._lampsOn===false?0:1; };
    const onL2=z.onLamps; z.onLamps=function(on){ onL2.call(this,on); z._lampsOn=!!on; if(gMesh&&gMesh.material) gMesh.material.emissiveIntensity=on?1:0; };
    const take=root=>{ root.traverseVisible(o=>{ if(o.userData&&o.userData.glow) glows.push(o); }); };
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_tongxian']) ASSETS.loadOne('bldg.xs_tongxian').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const root=c.scene.clone(true); Z3.attachRoomGLB(z,g0,fb,root); take(root); glowUp(); if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }).catch(e=>console.warn('同弦樂器室內正式模型載入失敗，用備用模型',e));
    if(typeof ASSETS!=='undefined'&&ASSETS.manifest['bldg.xs_tongxian_stair']) ASSETS.loadOne('bldg.xs_tongxian_stair').then(c=>{ if(!c||!c.scene||E.zone!==z) return;
      const r=c.scene.clone(true); r.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=true; } }); g0.add(r); r.updateMatrixWorld(true); take(r); glowUp(); }).catch(e=>console.warn('同弦樂器樓梯間正式模型載入失敗',e));
    return z; } };
  if(typeof ASSETS!=='undefined'){
    ASSETS.manifest['bldg.xs_tongxian']={url:'assets/models/env/second_ai/bb_support/tongxian.glb',type:'building',lazy:true,source:'CC（帳號 A）tools/blender/env_second/bb_support/tongxian_interior.py v4d；樓梯口挖洞 LAWWW2-C tools/blender/env_second/glb_floor_hole.py',license:'本作'};
    ASSETS.manifest['bldg.xs_tongxian_stair']={url:'assets/models/env/second_ai/tongxian_stair.glb',type:'building',lazy:true,source:'LAWWW2-C tools/blender/env_second/tongxian_stair.py',license:'本作'}; }
  const INTERACT=()=>{ const L=LAY(); return L?L.interact.map(q=>Object.assign({},q)):[]; };
  return {ZONE,zone,streetOut,INTERACT,get OWNER(){ const L=LAY(); return L&&L.npc?Object.assign({},L.npc.owner):null; }};
})();
if(typeof Z3!=='undefined'&&Z3.ZONES) Z3.ZONES.xs_tongxian=TX3.zone;
