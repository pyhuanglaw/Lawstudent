/* ===== 3D 角色：程序化 Q 版人物（三頭身），toon 材質＋反向外殼描邊，程序動畫 ===== */
'use strict';
const C3 = (function(){
  const gradCache={};
  function toonGradient(steps){ steps=steps||3; if(gradCache[steps]) return gradCache[steps]; const data=new Uint8Array(steps*4); for(let i=0;i<steps;i++){ const v=Math.round(168+ (i/(steps-1))*87); data[i*4]=v; data[i*4+1]=v; data[i*4+2]=v; data[i*4+3]=255; } const tex=new THREE.DataTexture(data,steps,1,THREE.RGBAFormat); tex.minFilter=THREE.NearestFilter; tex.magFilter=THREE.NearestFilter; tex.needsUpdate=true; gradCache[steps]=tex; return tex; }
  const matCache={};
  function mat(color,opts){ opts=opts||{}; const key=color+'|'+JSON.stringify(opts); if(matCache[key]) return matCache[key]; const m=new THREE.MeshToonMaterial(Object.assign({color:new THREE.Color(color),gradientMap:toonGradient(3)},opts)); matCache[key]=m; return m; }
  const outlineMat=new THREE.MeshBasicMaterial({color:0x3a2a1e,side:THREE.BackSide});
  function outline(mesh,scale){ const o=new THREE.Mesh(mesh.geometry,outlineMat); o.scale.setScalar(scale||1.045); o.renderOrder=-1; mesh.add(o); return o; }
  const geoCache={};
  function G(key,fn){ if(!geoCache[key]) geoCache[key]=fn(); return geoCache[key]; }
  function lathe(points,segs){ return new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(p[0],p[1])),segs||14); }
  // ---- 臉部貼圖（畫布）----
  function faceTexture(kind,opt){ const c=document.createElement('canvas'); c.width=128; c.height=128; const x=c.getContext('2d'); x.clearRect(0,0,128,128);
    if(kind==='eye'){ const iris=opt.iris||'#5a3a2a'; const w=opt.closed?0:1; x.fillStyle='#fffdfb'; x.beginPath(); x.ellipse(64,64,44,40*w+2,0,0,Math.PI*2); x.fill(); x.save(); x.beginPath(); x.ellipse(64,64,44,40*w+2,0,0,Math.PI*2); x.clip(); x.fillStyle=iris; x.beginPath(); x.ellipse(64,68,30,34,0,0,Math.PI*2); x.fill(); x.fillStyle=shade(iris,0.35); x.beginPath(); x.ellipse(64,72,22,26,0,0,Math.PI*2); x.fill(); x.fillStyle='#1f1714'; x.beginPath(); x.ellipse(64,72,12,15,0,0,Math.PI*2); x.fill(); x.fillStyle='#fff'; x.beginPath(); x.ellipse(52,52,10,12,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(255,255,255,.75)'; x.beginPath(); x.ellipse(76,84,5,6,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(60,40,30,.25)'; x.fillRect(0,0,128,24); x.restore(); x.strokeStyle='#2d1e16'; x.lineWidth=9; x.lineCap='round'; x.beginPath(); x.moveTo(20,50); x.quadraticCurveTo(64,10,108,50); x.stroke(); x.lineWidth=4; x.beginPath(); x.moveTo(28,96); x.quadraticCurveTo(64,116,100,96); x.stroke(); if(opt.lash){ x.lineWidth=7; x.beginPath(); x.moveTo(104,52); x.lineTo(118,40); x.stroke(); } }
    if(kind==='eyeClosed'){ x.strokeStyle='#2d1e16'; x.lineWidth=9; x.lineCap='round'; x.beginPath(); if(opt.happy){ x.moveTo(20,72); x.quadraticCurveTo(64,30,108,72); } else { x.moveTo(20,64); x.quadraticCurveTo(64,84,108,64); } x.stroke(); }
    if(kind==='brow'){ x.strokeStyle=opt.color||'#2d1e16'; x.lineWidth=10; x.lineCap='round'; x.beginPath(); if(opt.worried){ x.moveTo(20,70); x.quadraticCurveTo(64,50,108,64); } else if(opt.up){ x.moveTo(20,74); x.quadraticCurveTo(64,36,108,74); } else { x.moveTo(20,72); x.quadraticCurveTo(64,52,108,66); } x.stroke(); }
    if(kind==='mouth'){ x.strokeStyle='#8c3b47'; x.lineWidth=7; x.lineCap='round'; x.beginPath(); const e=opt.expr||'normal'; if(e==='smile'||e==='shy'){ x.moveTo(30,56); x.quadraticCurveTo(64,88,98,56); x.stroke(); } else if(e==='laugh'){ x.moveTo(26,50); x.quadraticCurveTo(64,110,102,50); x.closePath(); x.fillStyle='#8c3b47'; x.fill(); x.stroke(); x.fillStyle='#fff'; x.fillRect(40,52,48,10); } else if(e==='surprise'){ x.ellipse(64,64,16,22,0,0,Math.PI*2); x.fillStyle='#8c3b47'; x.fill(); x.stroke(); } else if(e==='worried'){ x.moveTo(34,70); x.quadraticCurveTo(50,52,64,66); x.quadraticCurveTo(78,80,94,64); x.stroke(); } else { x.moveTo(40,62); x.quadraticCurveTo(64,74,88,62); x.stroke(); } }
    if(kind==='blush'){ const g=x.createRadialGradient(64,64,4,64,64,56); g.addColorStop(0,'rgba(235,110,110,'+(opt.a||0.35)+')'); g.addColorStop(1,'rgba(235,110,110,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=2; return t; }
  function shade(hex,amt){ const c=new THREE.Color(hex); c.multiplyScalar(1-amt); return '#'+c.getHexString(); }
  const texCache={};
  function faceTex(kind,opt){ const key=kind+JSON.stringify(opt||{}); if(!texCache[key]) texCache[key]=faceTexture(kind,opt||{}); return texCache[key]; }
  function decal(tex,w,h){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,alphaTest:0.02})); m.renderOrder=2; return m; }

  // ---- 建立角色 ----
  // spec: {skin,hair,hairStyle,iris,top:{style,color,inner},bottom:{style,color},shoes,acc:{glasses,bag,bagColor,cap,capColor,cup},lash}
  function build(spec){
    const S=1; const root=new THREE.Group(); root.name='char';
    const SK=spec.skin||'#f7dcc6', HC=spec.hair||'#3b2a1e', TC=spec.top.color, BC=spec.bottom.color, SH=spec.shoes||'#f4f1ea';
    const skinM=mat(SK), hairM=mat(HC), topM=mat(TC), botM=mat(BC), shoeM=mat(SH), innerM=mat(spec.top.inner||'#ffffff');
    const H=1.56; // 總高
    const parts={};
    // 骨盆
    const pelvis=new THREE.Group(); pelvis.position.y=0.62; root.add(pelvis); parts.pelvis=pelvis;
    // 腿
    const legLen=0.62;
    const mkLeg=(side)=>{ const hip=new THREE.Group(); hip.position.set(side*0.11,0,0); pelvis.add(hip);
      const thighGeo=G('thigh',()=>lathe([[0.001,0],[0.085,0],[0.09,-0.16],[0.075,-0.32],[0.001,-0.33]],12));
      const thigh=new THREE.Mesh(thighGeo, spec.bottom.style==='skirt'||spec.bottom.style==='shorts'?skinM:botM); hip.add(thigh); outline(thigh,1.06);
      const knee=new THREE.Group(); knee.position.y=-0.31; hip.add(knee);
      const shinGeo=G('shin',()=>lathe([[0.001,0],[0.075,0],[0.07,-0.16],[0.06,-0.28],[0.001,-0.29]],12));
      const shin=new THREE.Mesh(shinGeo, spec.bottom.style==='pants'?botM:skinM); knee.add(shin); outline(shin,1.06);
      const foot=new THREE.Group(); foot.position.y=-0.28; knee.add(foot);
      const shoeGeo=G('shoe',()=>{ const g=new THREE.BoxGeometry(0.15,0.09,0.24,2,2,3); return g; });
      const shoe=new THREE.Mesh(shoeGeo,shoeM); shoe.position.set(0,-0.045,0.03); foot.add(shoe); outline(shoe,1.06);
      const sole=new THREE.Mesh(new THREE.BoxGeometry(0.155,0.02,0.245),mat('#ffffff')); sole.position.set(0,-0.085,0.03); foot.add(sole);
      return {hip,knee,foot}; };
    parts.legL=mkLeg(-1); parts.legR=mkLeg(1);
    if(spec.bottom.style==='skirt'){ const sk=new THREE.Mesh(G('skirt',()=>lathe([[0.001,0.02],[0.2,0.02],[0.24,-0.12],[0.27,-0.24],[0.001,-0.24]],18)),botM); sk.position.y=0.02; pelvis.add(sk); outline(sk,1.04); parts.skirt=sk; }
    if(spec.bottom.style==='shorts'){ const sh=new THREE.Mesh(G('shorts',()=>lathe([[0.001,0.02],[0.2,0.02],[0.22,-0.1],[0.22,-0.17],[0.001,-0.17]],18)),botM); sh.position.y=0.02; pelvis.add(sh); outline(sh,1.04); }
    // 軀幹
    const torso=new THREE.Group(); torso.position.y=0.02; pelvis.add(torso); parts.torso=torso;
    const torsoGeo=G('torso',()=>lathe([[0.001,0],[0.19,0],[0.2,0.1],[0.21,0.25],[0.23,0.38],[0.2,0.44],[0.09,0.47],[0.001,0.47]],18));
    const tm=new THREE.Mesh(torsoGeo,topM); torso.add(tm); outline(tm,1.045); parts.torsoMesh=tm;
    if(spec.top.style==='shirt'||spec.top.style==='cardigan'||spec.top.style==='vest'){ const strip=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.34,0.06),innerM); strip.position.set(0,0.24,0.2); torso.add(strip); }
    if(spec.top.style==='hoodie'){ const hood=new THREE.Mesh(G('hood',()=>new THREE.TorusGeometry(0.16,0.07,8,16,Math.PI)),mat(shade(TC,0.15))); hood.position.set(0,0.44,-0.08); hood.rotation.x=Math.PI/2; hood.rotation.z=Math.PI; torso.add(hood); outline(hood,1.06); const pocket=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.1,0.04),mat(shade(TC,0.12))); pocket.position.set(0,0.09,0.2); torso.add(pocket); }
    if(spec.top.style==='apron'){ const ap=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.36,0.03),mat(spec.top.apron||'#2f5d50')); ap.position.set(0,0.18,0.215); torso.add(ap); outline(ap,1.03); }
    // 頸與頭
    const neck=new THREE.Group(); neck.position.y=0.46; torso.add(neck); parts.neck=neck;
    const neckM=new THREE.Mesh(G('neck',()=>new THREE.CylinderGeometry(0.06,0.07,0.1,10)),mat(shade(SK,0.1))); neckM.position.y=0.03; neck.add(neckM);
    const head=new THREE.Group(); head.position.y=0.08; neck.add(head); parts.head=head;
    const headGeo=G('head',()=>{ const g=new THREE.SphereGeometry(0.27,24,18); g.scale(1,1.06,0.98); g.translate(0,0.25,0); return g; });
    const hm=new THREE.Mesh(headGeo,skinM); head.add(hm); outline(hm,1.035); parts.headMesh=hm;
    // 耳
    for(const s of [-1,1]){ const ear=new THREE.Mesh(G('ear',()=>{ const g=new THREE.SphereGeometry(0.05,10,8); g.scale(0.5,1,0.8); return g; }),skinM); ear.position.set(s*0.265,0.25,0.01); head.add(ear); }
    // 臉部貼片
    const iris=spec.iris||'#5a3a2a';
    const face=new THREE.Group(); face.position.set(0,0.25,0); head.add(face); parts.face=face;
    const eyeW=0.105, eyeH=0.1;
    const mkEye=(side)=>{ const g=new THREE.Group(); const open=decal(faceTex('eye',{iris,lash:!!spec.lash}),eyeW,eyeH); const closed=decal(faceTex('eyeClosed',{}),eyeW,eyeH); const happy=decal(faceTex('eyeClosed',{happy:true}),eyeW,eyeH); closed.visible=false; happy.visible=false; g.add(open,closed,happy); g.position.set(side*0.095,-0.005,0.255); g.rotation.y=side*0.28; g.userData={open,closed,happy}; if(side<0){ open.scale.x=-1; } face.add(g); return g; };
    parts.eyeL=mkEye(-1); parts.eyeR=mkEye(1);
    const mkBrow=(side)=>{ const b=decal(faceTex('brow',{color:shade(HC,0.1)}),0.11,0.05); b.position.set(side*0.095,0.075,0.262); b.rotation.y=side*0.28; if(side<0) b.scale.x=-1; face.add(b); return b; };
    parts.browL=mkBrow(-1); parts.browR=mkBrow(1);
    const mouth=decal(faceTex('mouth',{expr:'normal'}),0.13,0.08); mouth.position.set(0,-0.105,0.268); face.add(mouth); parts.mouth=mouth;
    for(const s of [-1,1]){ const bl=decal(faceTex('blush',{a:0.32}),0.11,0.08); bl.position.set(s*0.15,-0.06,0.235); bl.rotation.y=s*0.6; face.add(bl); }
    const nose=new THREE.Mesh(G('nose',()=>new THREE.SphereGeometry(0.018,8,6)),mat(shade(SK,0.12))); nose.position.set(0,-0.045,0.272); face.add(nose);
    // 頭髮
    buildHair(head,spec,hairM);
    // 手臂
    const mkArm=(side)=>{ const sh=new THREE.Group(); sh.position.set(side*0.235,0.4,0); torso.add(sh);
      const upGeo=G('upperArm',()=>lathe([[0.001,0.02],[0.06,0.02],[0.062,-0.1],[0.055,-0.22],[0.001,-0.23]],10));
      const longSleeve=['hoodie','shirt','cardigan'].includes(spec.top.style);
      const up=new THREE.Mesh(upGeo,topM); sh.add(up); outline(up,1.08);
      const elbow=new THREE.Group(); elbow.position.y=-0.21; sh.add(elbow);
      const foreGeo=G('forearm',()=>lathe([[0.001,0.02],[0.052,0.02],[0.05,-0.1],[0.045,-0.2],[0.001,-0.21]],10));
      const fore=new THREE.Mesh(foreGeo,longSleeve?topM:skinM); elbow.add(fore); outline(fore,1.08);
      const hand=new THREE.Mesh(G('hand',()=>new THREE.SphereGeometry(0.055,10,8)),skinM); hand.position.y=-0.22; elbow.add(hand); outline(hand,1.08);
      sh.rotation.z=side*0.12; return {sh,elbow,hand}; };
    parts.armL=mkArm(-1); parts.armR=mkArm(1);
    // 配件
    const acc=spec.acc||{};
    if(acc.glasses){ const gm=new THREE.MeshBasicMaterial({color:0x35303c}); for(const s of [-1,1]){ const ring=new THREE.Mesh(G('lens',()=>new THREE.TorusGeometry(0.058,0.007,6,20)),gm); ring.position.set(s*0.098,0.245,0.262); ring.rotation.y=s*0.25; head.add(ring); const lens=new THREE.Mesh(G('lensGlass',()=>new THREE.CircleGeometry(0.055,16)),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.14})); lens.position.copy(ring.position); lens.rotation.y=ring.rotation.y; head.add(lens); } const bridge=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.008,0.008),gm); bridge.position.set(0,0.25,0.268); head.add(bridge); for(const s of [-1,1]){ const temple=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.008,0.22),gm); temple.position.set(s*0.245,0.25,0.12); head.add(temple); } }
    if(acc.bag==='backpack'){ const bp=new THREE.Mesh(G('backpack',()=>new THREE.BoxGeometry(0.28,0.3,0.14,2,2,2)),mat(acc.bagColor||'#3b3f4a')); bp.position.set(0,0.24,-0.25); torso.add(bp); outline(bp,1.04); const lid=new THREE.Mesh(new THREE.BoxGeometry(0.29,0.1,0.15),mat(shade(acc.bagColor||'#3b3f4a',0.2))); lid.position.set(0,0.35,-0.25); torso.add(lid); }
    if(acc.bag==='tote'){ const tb=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.24,0.08),mat(acc.bagColor||'#d9d3c6')); tb.position.set(0.26,-0.02,-0.02); torso.add(tb); outline(tb,1.04); const strap=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.5,0.02),mat(acc.bagColor||'#d9d3c6')); strap.position.set(0.09,0.26,0.16); strap.rotation.z=-0.5; torso.add(strap); }
    if(acc.cap){ const cap=new THREE.Mesh(G('cap',()=>{ const g=new THREE.SphereGeometry(0.29,20,12,0,Math.PI*2,0,Math.PI/2); g.scale(1,0.8,1); return g; }),mat(acc.capColor||'#2e3a55')); cap.position.y=0.27; head.add(cap); outline(cap,1.03); const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.02,16,1,false,-Math.PI/2,Math.PI),mat(acc.capColor||'#2e3a55')); brim.position.set(0,0.3,0.2); head.add(brim); }
    // 影子
    const shadow=new THREE.Mesh(G('blob',()=>new THREE.CircleGeometry(0.38,20)),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.22,depthWrite:false})); shadow.rotation.x=-Math.PI/2; shadow.position.y=0.015; root.add(shadow); parts.shadow=shadow;
    root.userData.parts=parts; root.userData.spec=spec; root.userData.anim={pose:'idle',t:Math.random()*10,phase:0,blink:0,expr:'normal'};
    return root;
  }
  function buildHair(head,spec,hairM){
    const hs=spec.hairStyle||'short'; const g=new THREE.Group(); g.position.y=0.25; head.add(g);
    const add=(mesh,ol)=>{ g.add(mesh); outline(mesh,ol||1.035); return mesh; };
    // 髮帽：覆蓋頭頂與後腦
    const capGeo=G('hairCap',()=>{ const s=new THREE.SphereGeometry(0.295,24,18,0,Math.PI*2,0,Math.PI*0.5); s.scale(1,1.02,1); return s; });
    const cap=add(new THREE.Mesh(capGeo,hairM)); cap.rotation.x=-0.32; cap.position.y=0.02;
    // 瀏海
    const bangGeo=G('bang_'+hs,()=>{ const shape=new THREE.Shape(); const w=0.24; shape.moveTo(-w,0); shape.lineTo(w,0);
      if(hs==='part'){ shape.quadraticCurveTo(0.2,-0.08,0.13,-0.05); shape.quadraticCurveTo(0.06,-0.08,0.02,-0.16); shape.lineTo(-0.02,-0.16); shape.quadraticCurveTo(-0.06,-0.08,-0.13,-0.05); shape.quadraticCurveTo(-0.2,-0.08,-w,0); }
      else if(hs==='curly'){ for(let i=0;i<5;i++){ const x=w-i*(2*w/4); shape.absarc(x,-0.04,0.06,0,Math.PI,false); } shape.lineTo(-w,0); }
      else if(hs==='short'){ shape.quadraticCurveTo(0.17,-0.12,0.1,-0.07); shape.quadraticCurveTo(0.03,-0.13,-0.03,-0.07); shape.quadraticCurveTo(-0.1,-0.14,-0.17,-0.07); shape.quadraticCurveTo(-0.22,-0.1,-w,0); }
      else { shape.quadraticCurveTo(0.2,-0.12,0.14,-0.1); shape.quadraticCurveTo(0.08,-0.16,0.02,-0.1); shape.quadraticCurveTo(-0.04,-0.16,-0.1,-0.1); shape.quadraticCurveTo(-0.16,-0.14,-w,0); }
      shape.closePath(); const geo=new THREE.ExtrudeGeometry(shape,{depth:0.05,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.015,bevelSegments:2}); // 弧形包住額頭
      const pos=geo.attributes.position; for(let i=0;i<pos.count;i++){ const x=pos.getX(i), z=pos.getZ(i); const r=0.27; const ang=x/0.27; pos.setX(i,Math.sin(ang)*(r+z)); pos.setZ(i,Math.cos(ang)*(r+z)-0.0); } geo.computeVertexNormals(); return geo; });
    const bang=add(new THREE.Mesh(bangGeo,hairM),1.03); bang.position.set(0,0.24,0.0); bang.rotation.x=0.18; bang.scale.set(1,0.8,1);
    // 兩側與後方
    if(hs==='bob'||hs==='long'){ const len=hs==='long'?0.78:0.4; for(const s of [-1,1]){ const lock=add(new THREE.Mesh(G('lock_'+hs,()=>lathe([[0.001,0],[0.05,0],[0.058,-len*0.5],[0.045,-len],[0.001,-len]],10)),hairM),1.05); lock.position.set(s*0.255,0.1,0.04); lock.rotation.z=s*0.1; } const back=add(new THREE.Mesh(G('backHalf',()=>new THREE.SphereGeometry(0.3,24,12,Math.PI,Math.PI,0,Math.PI*0.5)),hairM),1.03); back.position.set(0,0.0,-0.01); const fall=add(new THREE.Mesh(G('fall_'+hs,()=>new THREE.CylinderGeometry(0.3,0.22,len,20,1,true,Math.PI*0.5,Math.PI)),hairM),1.03); fall.position.set(0,-len/2,-0.01); }
    if(hs==='pony'){ const tail=add(new THREE.Mesh(G('pony',()=>lathe([[0.001,0],[0.06,0],[0.085,-0.14],[0.06,-0.32],[0.001,-0.36]],12)),hairM),1.05); tail.position.set(0,0.12,-0.27); tail.rotation.x=0.35; const tie=new THREE.Mesh(new THREE.TorusGeometry(0.06,0.015,6,12),mat('#8c3b47')); tie.position.set(0,0.14,-0.28); tie.rotation.x=Math.PI/2; g.add(tie); }
    if(hs==='curly'){ for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; const puff=add(new THREE.Mesh(G('puff',()=>new THREE.SphereGeometry(0.1,10,8)),hairM),1.05); puff.position.set(Math.sin(a)*0.26,0.06+Math.cos(a*2)*0.03,Math.cos(a)*0.24-0.02); } }
    if(hs==='short'){ for(const s of [-1,1]){ const side=add(new THREE.Mesh(G('sideburn',()=>lathe([[0.001,0],[0.035,0],[0.03,-0.1],[0.001,-0.11]],8)),hairM),1.06); side.position.set(s*0.255,0.1,0.06); } }
    return g;
  }
  // ---- 表情 ----
  function setExpr(ch,expr){ const p=ch.userData.parts; ch.userData.anim.expr=expr; p.mouth.material.map=faceTex('mouth',{expr}); p.mouth.material.needsUpdate=true; const worried=expr==='worried', up=expr==='surprise'; for(const b of [p.browL,p.browR]){ b.material.map=faceTex('brow',{color:shade(ch.userData.spec.hair,0.1),worried,up}); b.material.needsUpdate=true; } for(const e of [p.eyeL,p.eyeR]){ const u=e.userData; u.open.visible=expr!=='laugh'; u.happy.visible=expr==='laugh'; u.closed.visible=false; } }
  // ---- 動畫 ----
  const V=new THREE.Vector3();
  function animate(ch,dt,state){ const a=ch.userData.anim; const p=ch.userData.parts; a.t+=dt; const pose=state.pose||'idle'; const speed=state.speed||0;
    // 眨眼
    a.blink-=dt; if(a.blink<=0){ a.blink=2.5+Math.random()*3.5; a.blinkT=0.12; } if(a.blinkT>0){ a.blinkT-=dt; if(a.expr!=='laugh'){ for(const e of [p.eyeL,p.eyeR]){ e.userData.open.visible=false; e.userData.closed.visible=true; } } } else if(a.expr!=='laugh'){ for(const e of [p.eyeL,p.eyeR]){ e.userData.open.visible=true; e.userData.closed.visible=false; } }
    const L=p.legL,R=p.legR,AL=p.armL,AR=p.armR;
    const set=(o,x,y,z)=>{ o.rotation.x=x; o.rotation.y=y||0; o.rotation.z=z||0; };
    if(pose==='walk'||pose==='run'){ const run=pose==='run'; const freq=run?2.6:2.0; a.phase+=dt*Math.PI*2*freq*Math.max(0.6,speed/(run?4.5:1.6)); const s=Math.sin(a.phase), c=Math.cos(a.phase); const amp=run?0.9:0.55;
      set(L.hip,s*amp,0,0); set(R.hip,-s*amp,0,0); L.knee.rotation.x=Math.max(0,-c)*(run?1.4:0.9)+0.05; R.knee.rotation.x=Math.max(0,c)*(run?1.4:0.9)+0.05; L.foot.rotation.x=-L.knee.rotation.x*0.3; R.foot.rotation.x=-R.knee.rotation.x*0.3;
      set(AL.sh,-s*amp*0.8,0,0.12); set(AR.sh,s*amp*0.8,0,-0.12); AL.elbow.rotation.x=-(run?1.2:0.5)-Math.max(0,s)*0.3; AR.elbow.rotation.x=-(run?1.2:0.5)-Math.max(0,-s)*0.3; if(run){ AL.sh.rotation.z=0.3; AR.sh.rotation.z=-0.3; }
      p.pelvis.position.y=0.62+Math.abs(c)*(run?0.05:0.025); p.torso.rotation.x=run?0.18:0.05; p.torso.rotation.y=s*0.05; p.head.rotation.x=-(run?0.1:0.02); p.pelvis.rotation.z=s*0.03; }
    else if(pose==='sit'||pose==='read'){ set(L.hip,-1.45,0,-0.05); set(R.hip,-1.45,0,0.05); L.knee.rotation.x=1.5; R.knee.rotation.x=1.5; L.foot.rotation.x=0; R.foot.rotation.x=0; p.pelvis.position.y=0.62-0.32; p.torso.rotation.x=0.04; p.torso.rotation.y=0; p.pelvis.rotation.z=0;
      if(pose==='read'){ set(AL.sh,-1.05,0.25,0.35); set(AR.sh,-1.05,-0.25,-0.35); AL.elbow.rotation.x=-1.05; AR.elbow.rotation.x=-1.05; p.head.rotation.x=0.35+Math.sin(a.t*0.8)*0.02; } else { set(AL.sh,-0.35,0,0.15); set(AR.sh,-0.35,0,-0.15); AL.elbow.rotation.x=-0.9; AR.elbow.rotation.x=-0.9; p.head.rotation.x=Math.sin(a.t*0.7)*0.03; } }
    else if(pose==='talk'){ set(L.hip,0,0,-0.03); set(R.hip,0,0,0.03); L.knee.rotation.x=0.05; R.knee.rotation.x=0.05; const g=Math.sin(a.t*3)*0.15; set(AL.sh,-0.4+g,0,0.2); set(AR.sh,-0.1,0,-0.12); AL.elbow.rotation.x=-1.3; AR.elbow.rotation.x=-0.5; p.pelvis.position.y=0.62; p.torso.rotation.x=0.03+Math.sin(a.t*1.5)*0.02; p.torso.rotation.y=Math.sin(a.t*1.2)*0.04; p.head.rotation.x=Math.sin(a.t*1.5)*0.04; p.head.rotation.y=Math.sin(a.t*0.9)*0.06; p.pelvis.rotation.z=0; }
    else { // idle
      const br=Math.sin(a.t*1.6); set(L.hip,0,0,-0.03); set(R.hip,0,0,0.03); L.knee.rotation.x=0.05; R.knee.rotation.x=0.05; L.foot.rotation.x=0; R.foot.rotation.x=0; set(AL.sh,br*0.02,0,0.14); set(AR.sh,-br*0.02,0,-0.14); AL.elbow.rotation.x=-0.25; AR.elbow.rotation.x=-0.25; p.pelvis.position.y=0.62; p.torso.rotation.x=0.02+br*0.012; p.torso.rotation.y=0; p.pelvis.rotation.z=0; p.head.rotation.x=br*0.015; p.head.rotation.y=Math.sin(a.t*0.35)*0.12; }
    if(state.lookAt){ V.copy(state.lookAt).sub(ch.position); const ang=Math.atan2(V.x,V.z)-ch.rotation.y; let d=((ang+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; d=Math.max(-0.7,Math.min(0.7,d)); p.head.rotation.y=d; }
    a.pose=pose;
  }
  return {build,animate,setExpr,mat,outline,toonGradient,faceTex,shade,lathe,G};
})();
