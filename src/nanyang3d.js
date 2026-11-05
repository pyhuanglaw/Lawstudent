/* ===== 南洋戲院（新生南路那一排的二輪戲院；區域 xs_nanyang＝大廳、xs_nanyang_hall＝1 廳）=====
   企劃：AA_615 第 3、4 節（使用者 11-03「也要遇到在電影院打工的同學 遇到玩家送爆米花」「不是有電影情節嗎 怎麼沒有電影院阿」；AA 定稿 D109）；
   LAWWW-C 11-05 03:35 排 ART-NANYANG-CINEMA-1103（P1，X178；D108 場景程式歸 LAWWW2）。
   - 室內：BB（帳號 A／C）照使用者的參考圖做的大廳 v5b（nanyang_lobby.glb）、1 廳 v2（nanyang_hall.glb；斜地板寫在配置）；配置 src/data/nanyang_layout.js（和 Blender 共用）。
     載入前、載入失敗時：Z3.room 的牆、地板、家具色塊（D38 ③）。
   - 進出：新生南路上的「進南洋戲院（二輪戲院）」（src/xinsheng3d.js：店門找 Z3.ZONES['xs_'+id]）→ 大廳入口裡面、面向後牆；
     大廳入口的「出去（新生南路）」→ 騎樓、戲院門口外面、面向馬路。
     大廳後牆右邊那組開著的門「進 1 廳」→ 1 廳的門口；1 廳的「回大廳」→ 大廳那組門前面。
   - 1 廳的地板前低後高（門那一頭 y 0，往銀幕每一排降 0.12 m，第一排前面到舞台 y −0.96）：導航加兩塊面（斜面＋前面平的），人走過去照高度上下；
     座位（每一排靠右走道那一張「坐下看電影」）帶那一排的地板高度 y（和階梯教室一樣），走近點在右邊走道上（ap）。
   - 爆米花櫃檯、Alison 站的位置、黑板架「今日放映」、海報、銀幕、騎樓的售票口：選單和台詞 LAWWW 照 AA_615 接（這裡不放空按鈕，和同弦一樣）；
     位置在 NY3.INTERACT（大廳）、NY3.HALL_INTERACT（1 廳）、NY3.CLERK（Alison 打工時站的地方）、NY3.TICKET（新生南路上的售票口）。
   - 開演（AA_615：坐下＝看電影，轉暗、時間過去）：NY3.houseLights(on) 把 1 廳的場燈關掉／打開（銀幕、走道地燈、太平門照亮）——LAWWW 演完再開。
   - 營業 09:30～24:00：src/data/places.js 的 xs_nanyang（AA_615 沒寫颱風天，先不關；要關就加進 typhoonShops）；新生南路的店門照開放時間擋＝story3d.js（接線 patch）。
   測試：node tests/nanyang_unit.js */
'use strict';
const NY3=(function(){
  const ZL='xs_nanyang', ZH='xs_nanyang_hall';
  const LAY=()=>typeof NANYANG_LAYOUT!=='undefined'?NANYANG_LAYOUT:null;
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85},o||{}));
  const SIT_TOP=()=>(typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.47;
  /* 新生南路那一邊（src/data/xinsheng_layout.js）：店門的互動點在 (facade.x＋0.9, door.z)、半徑 1.4；走出來站在它外面 1.7 m、騎樓裡、面向馬路（+x）*/
  function streetOut(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='nanyang');
    const fx=XL?XL.facade.x:-16.5, dz=q?q.door.z:25.3; return {x:+(fx+0.9+1.7).toFixed(2),z:dz,yaw:Math.PI/2}; }
  /* BB 的兩顆 GLB 的 WALL_*（會淡出的牆）沒有帶 extras.dir（往室內的法線），遊戲會全部當成朝 +z；1 廳的 front／back 命名也和位置相反（back 在 +z）。
     照每一塊在房間裡的位置補：離哪一面牆近，dir 就朝房間裡（不動 GLB） */
  function wallDirs(root,W,D){ root.updateMatrixWorld(true); root.traverse(o=>{ if(!o.isMesh||!/WALL_/.test(o.name)||(o.userData&&o.userData.dir)) return;
    o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld);
    const fx=Math.abs(c.x)/(W/2), fz=Math.abs(c.z)/(D/2); o.userData.dir=fx>fz?[c.x>0?-1:1,0,0]:[0,0,c.z>0?-1:1]; }); }
  /* 正式模型、光暈（燈具材質自己發光）、即時光：同弦那一套 */
  function attachFormal(E,z,g0,fb,key,W,D,label){
    if(typeof ASSETS==='undefined'||!ASSETS.manifest[key]) return;
    ASSETS.loadOne(key).then(c=>{ if(!c||!c.scene||E.zone!==z) return; const root=c.scene.clone(true); wallDirs(root,W,D); Z3.attachRoomGLB(z,g0,fb,root);
      if(z.applyTime&&typeof GAME!=='undefined'&&GAME.G) z.applyTime(GAME.G.hour||12,GAME.G.weather); }).catch(e=>console.warn(label+'正式模型載入失敗，用備用模型',e)); }
  function lampsOf(z,list){ const lamps=[]; for(const [x,y,zz,on,off,dist] of list){ const l=new THREE.PointLight(0xffc98a,off,dist||9,2); l.position.set(x,y,zz); l.userData.on=on; l.userData.off=off; z.group.add(l); lamps.push(l); }
    const onL=z.onLamps; z.onLamps=function(on){ if(onL) onL.call(this,on); for(const l of lamps) l.intensity=on?l.userData.on:l.userData.off; }; return lamps; }

  // ---------------- 大廳 ----------------
  const lobby={ id:ZL, name:'南洋戲院', indoor:true, camDist:4.0, build(E){ const L=LAY().lobby;
    const IN=Object.assign({},L.enterAt||{x:0,z:5.2,yaw:Math.PI});
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:'#c8864a',floorTex:W3.stoneTex('#76161a'),windows:false,spawn:IN});
    const g0=z.group, fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    const nav=z.nav; for(const b of L.blocks) nav.blockRect(b[0],b[1],b[2],b[3],0,0.05); nav._cm=null;
    { const fbM=M('#5e1418'); for(const b of L.blocks){ const h=b[2]*b[3]>3?1.1:0.9; const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],h,b[3]),fbM); m.position.set(b[0],h/2,b[1]); fb.add(m); } }   /* 備用：櫃檯、售票亭背牆、長椅的色塊 */
    z.bounds={w:L.w,d:L.d}; z.camMaxY=L.h-0.15;
    // 燈（暗暖黃：吊燈三盞＋櫃檯；其他燈具的材質自己發光）——之後烘焙光照貼圖時照配置的 lights
    lampsOf(z,[[0.4,3.0,-3.2,3.2,1.8],[0.4,3.0,0.2,3.2,1.8],[0.4,3.0,3.6,3.0,1.6],[-3.2,2.4,-2.6,2.6,1.4,7]]);
    // 座位：右牆兩張木條長椅（座面約 0.45）「坐下等開演」
    z.seats=[]; for(const s of L.seats){ const seat={x:s.x,z:s.z,yaw:s.yaw,lv:0}; z.seats.push(Object.assign({kind:'shop',nanyang:'bench'},seat)); E.interactables.push({x:s.x,z:s.z,radius:0.8,lv:0,label:s.label||'坐下',seat,shop:'nanyang',nanyang:'bench'}); }
    // 出口：入口的玻璃門（新生南路）；後牆右邊那組開著的門＝1 廳
    const ex=L.exit; E.interactables.push({x:ex.x,z:ex.z,radius:ex.r||0.8,lv:0,label:ex.label,exit:{to:'xinsheng',spawn:streetOut()}});
    const hd=L.interact.find(q=>q.kind==='hall'); E.interactables.push({x:hd.x,z:hd.z,radius:0.9,lv:0,label:hd.label||'進 1 廳',exit:{to:ZH,spawn:Object.assign({},LAY().hall.enterAt)}});
    attachFormal(E,z,g0,fb,'bldg.xs_nanyang',L.w,L.d,'南洋戲院大廳');
    return z; } };

  // ---------------- 1 廳 ----------------
  let hallZone=null;
  const hall={ id:ZH, name:'南洋戲院 1 廳', indoor:true, camDist:4.4, build(E){ const L=LAY().hall, sl=L.slope;
    const IN=Object.assign({},L.enterAt);
    const z=Z3.room(E,{w:L.w,d:L.d,h:L.h,cell:0.1,warm:true,wallColor:'#a87c50',floorTex:W3.stoneTex('#76161a'),windows:false,spawn:IN});
    const g0=z.group, fb=new THREE.Group(); fb.name='fallback'; fb.userData.dyn=true; for(const o of g0.children.slice()){ if(o.isLight) continue; g0.remove(o); fb.add(o); } g0.add(fb);
    const nav=z.nav; for(const b of L.blocks) nav.blockRect(b[0],b[1],b[2],b[3],0,0.05);
    // 斜地板（配置的 slope：z ≥ z0 平的 y0、z ≤ z1 平的 y1、中間一整片斜面）：後加的面先算
    nav.addSurf({x0:-L.w/2,x1:L.w/2,z0:sl.z1,z1:sl.z0,axis:'z',ya:sl.y1,yb:sl.y0});
    nav.addSurf({x0:-L.w/2,x1:L.w/2,z0:-L.d/2,z1:sl.z1,y:sl.y1});
    nav._cm=null;
    /* 可以點的地面（點地移動）：門口那一段平的、中間的斜面、第一排前面到舞台平的。沒有這三片時 E.screenToFloor 退回 y 0 的平面，
       點斜地板的落點會往後偏（CC-C 13700be8f：點 z −4.6 走到 −1.19，差 3.41 m；手機玩家前排坐不到。NANYANG-HALL-WALKMESH-1105，tests/nanyang_tap_unit.js）*/
    { const wmM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide}), W=L.w, D=L.d, ws=[];
      const flat=(z0,z1,y)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(W,z1-z0),wmM); m.rotation.x=-Math.PI/2; m.position.set(0,y+0.01,(z0+z1)/2); return m; };
      ws.push(flat(sl.z0,D/2,sl.y0)); ws.push(flat(-D/2,sl.z1,sl.y1));
      { const len=Math.hypot(sl.z0-sl.z1,sl.y0-sl.y1), m=new THREE.Mesh(new THREE.PlaneGeometry(W,len),wmM); m.position.set(0,(sl.y0+sl.y1)/2+0.01,(sl.z0+sl.z1)/2); m.rotation.x=-Math.PI/2-Math.atan2(sl.y0-sl.y1,sl.z0-sl.z1); ws.push(m); }   /* 北邊（z1，舞台那一頭）低、南邊（z0，門口）高 */
      for(const m of ws){ m.userData.walkLv=0; m.userData.dyn=true; g0.add(m); } z.walkMeshes=(z.walkMeshes||[]).concat(ws); }
    { const fbM=M('#7a1c1c'); for(const b of L.blocks){ const zc=b[1], y=L.floorY(zc), h=0.95; const m=new THREE.Mesh(new THREE.BoxGeometry(b[2],h,b[3]),fbM); m.position.set(b[0],y+h/2,zc); fb.add(m); } }   /* 備用：一排一排座位、舞台的色塊（照斜地板的高度）*/
    z.bounds={w:L.w,d:L.d}; z.camMaxY=L.h-0.15;
    // 燈：場燈（兩側壁燈的位置）＋銀幕前一盞很弱的；開演時場燈關掉（NY3.houseLights）
    const house=lampsOf(z,[[-4.6,2.9,0.0,2.2,1.2,10],[4.6,2.9,0.0,2.2,1.2,10],[0,3.2,5.6,1.8,1.0,9]]), screen=lampsOf(z,[[0,1.6,-6.2,0.9,0.6,10]]);
    z.house=house; z.screenLight=screen;
    // 座位：每一排靠右走道那一張（座面約 0.45＝SIT_TOP，不抬高），y＝那一排的地板高度；走近點在右邊走道上
    z.seats=[]; for(const s of L.seats){ const seat={x:s.x,z:s.z,y:s.y,yaw:s.yaw,lv:0,ap:[s.approach.x,s.approach.z]};
      z.seats.push(Object.assign({kind:'cinema',row:s.row},seat)); E.interactables.push({x:s.approach.x-0.35,z:s.z,radius:0.75,lv:0,label:s.label||'坐下看電影',seat,cinema:true,row:s.row}); }
    // 出口：往大廳的門
    const back=L.interact.find(q=>q.kind==='lobby'), lb=LAY().lobby, hd=lb.interact.find(q=>q.kind==='hall');
    E.interactables.push({x:back.x,z:back.z,radius:0.8,lv:0,label:back.label||'回大廳',exit:{to:ZL,spawn:Object.assign({},lb.hallOut||{x:hd.x,z:hd.z+1.3,yaw:0})}});
    attachFormal(E,z,g0,fb,'bldg.xs_nanyang_hall',L.w,L.d,'南洋戲院 1 廳');
    hallZone=z; return z; } };
  /* 開演：場燈關掉（只剩銀幕、走道地燈、太平門）；演完再開。不在 1 廳就不動 */
  function houseLights(on){ const z=hallZone; if(!z||typeof E3==='undefined'||E3.zone!==z) return false; for(const l of z.house) l.intensity=on?l.userData.on:0; for(const l of z.screenLight) l.intensity=on?l.userData.off:l.userData.on*1.4; return true; }

  if(typeof ASSETS!=='undefined'){
    ASSETS.manifest['bldg.xs_nanyang']={url:'assets/models/env/second_ai/bb_support/nanyang_lobby.glb',type:'building',lazy:true,source:'BB（tools/blender/env_second/bb_support/nanyang_interior.py v5b，照使用者的參考圖 nanyang_lobby.webp）',license:'本作'};
    ASSETS.manifest['bldg.xs_nanyang_hall']={url:'assets/models/env/second_ai/bb_support/nanyang_hall.glb',type:'building',lazy:true,source:'BB（tools/blender/env_second/bb_support/nanyang_hall.py v2）',license:'本作'}; }
  const INTERACT=()=>{ const L=LAY(); return L?L.lobby.interact.filter(q=>q.kind!=='hall'&&q.kind!=='clerk').map(q=>Object.assign({},q)):[]; };
  const HALL_INTERACT=()=>{ const L=LAY(); return L?L.hall.interact.filter(q=>q.kind!=='lobby').map(q=>Object.assign({},q)):[]; };
  return {ZL,ZH,lobby,hall,streetOut,wallDirs,houseLights,INTERACT,HALL_INTERACT,
    get CLERK(){ const L=LAY(), c=L&&L.lobby.interact.find(q=>q.kind==='clerk'); return c?{x:c.x,z:c.z,yaw:c.yaw}:null; },
    get TICKET(){ const XL=typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT:null, q=XL&&XL.shops.find(s=>s.id==='nanyang'); return q&&q.ticket?{x:+(XL.facade.x+0.9).toFixed(2),z:q.ticket.z,yaw:-Math.PI/2}:null; }};
})();
if(typeof Z3!=='undefined'&&Z3.ZONES){ Z3.ZONES.xs_nanyang=NY3.lobby; Z3.ZONES.xs_nanyang_hall=NY3.hall; }
