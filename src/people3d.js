/* ===== 3D 人物（成人比例 1:7.5，寫實比例＋適度風格化）=====
   程序化建模：以 Lathe / 球體 / 擠出面組成人體、頭髮與服裝；程序動畫（待機、走路、跑步、坐、閱讀、談話）。 */
'use strict';
const P3 = (function(){
  // ---- 材質 ----
  const gradCache={};
  function grad(steps){ if(gradCache[steps]) return gradCache[steps]; const data=new Uint8Array(steps*4); for(let i=0;i<steps;i++){ const t=i/(steps-1); const v=Math.round(120+t*135); data[i*4]=data[i*4+1]=data[i*4+2]=v; data[i*4+3]=255; } const tex=new THREE.DataTexture(data,steps,1,THREE.RGBAFormat); tex.minFilter=tex.magFilter=THREE.NearestFilter; tex.needsUpdate=true; gradCache[steps]=tex; return tex; }
  const mcache={};
  function M(color,o){ o=o||{}; const key='m'+color+JSON.stringify(o); if(mcache[key]) return mcache[key]; let m; if(o.kind==='hair'){ m=new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:0.55,metalness:0.0}); } else if(o.kind==='skin'){ m=new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:0.75,metalness:0}); } else if(o.kind==='denim'){ m=new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:0.95,metalness:0}); } else { m=new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:o.rough!=null?o.rough:0.85,metalness:0}); } if(o.side) m.side=o.side; mcache[key]=m; return m; }
  function shade(hex,amt){ const c=new THREE.Color(hex); c.multiplyScalar(1-amt); return '#'+c.getHexString(); }
  function light(hex,amt){ const c=new THREE.Color(hex); c.lerp(new THREE.Color(1,1,1),amt); return '#'+c.getHexString(); }
  const gcache={};
  function G(key,fn){ if(!gcache[key]) gcache[key]=fn(); return gcache[key]; }
  function lathe(pts,segs,phiStart,phiLen){ const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),segs||20,phiStart||0,phiLen||Math.PI*2); return g; }
  function ellipsoid(rx,ry,rz,ws,hs){ const g=new THREE.SphereGeometry(1,ws||20,hs||16); g.scale(rx,ry,rz); return g; }
  function capsuleLimb(r1,r2,len,segs){ // 從 y=0 往下到 -len 的肢段，兩端圓
    const pts=[]; const n=6; for(let i=0;i<=n;i++){ const a=Math.PI/2*(1-i/n); pts.push([r1*Math.cos(a)*0.999+0.0005, r1*Math.sin(a)*0.35]); } pts.push([r1,-0.02]); pts.push([(r1*0.6+r2*0.4),-len*0.5]); pts.push([r2,-len+0.02]); for(let i=0;i<=n;i++){ const a=Math.PI/2*(i/n); pts.push([r2*Math.cos(a)*0.999+0.0005, -len-r2*Math.sin(a)*0.35]); } return lathe(pts,segs||14); }
  // ---- 臉部貼圖 ----
  const tcache={};
  function tex(key,w,h,fn){ if(tcache[key]) return tcache[key]; const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); fn(x,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; tcache[key]=t; return t; }
  function eyeTex(o){ return tex('eye'+JSON.stringify(o),256,128,(x,w,h)=>{ x.clearRect(0,0,w,h); const iris=o.iris||'#3a2a22'; const cy=64, cx=128; const ew=110, eh=o.wide?44:34;
      // 眼白（杏仁形）
      x.fillStyle='#fbf8f5'; x.beginPath(); x.moveTo(cx-ew,cy+4); x.quadraticCurveTo(cx-40,cy-eh-6,cx+30,cy-eh); x.quadraticCurveTo(cx+ew,cy-10,cx+ew,cy+6); x.quadraticCurveTo(cx+40,cy+eh,cx-30,cy+eh-4); x.quadraticCurveTo(cx-ew,cy+22,cx-ew,cy+4); x.closePath(); x.fill();
      x.save(); x.clip(); x.fillStyle=iris; x.beginPath(); x.ellipse(cx+8,cy+4,30,32,0,0,Math.PI*2); x.fill(); x.fillStyle=shade(iris,0.4); x.beginPath(); x.ellipse(cx+8,cy+6,22,24,0,0,Math.PI*2); x.fill(); x.fillStyle='#120c0a'; x.beginPath(); x.ellipse(cx+8,cy+6,11,13,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(255,255,255,0.9)'; x.beginPath(); x.ellipse(cx-2,cy-6,6,7,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(255,255,255,0.5)'; x.beginPath(); x.ellipse(cx+18,cy+16,3,3,0,0,Math.PI*2); x.fill(); x.fillStyle='rgba(60,40,30,0.35)'; x.fillRect(0,0,w,cy-eh+16); x.restore();
      // 上眼線與睫毛
      x.strokeStyle='#2a1a14'; x.lineWidth=o.lash?7:5; x.lineCap='round'; x.beginPath(); x.moveTo(cx-ew,cy+4); x.quadraticCurveTo(cx-40,cy-eh-6,cx+30,cy-eh); x.quadraticCurveTo(cx+ew,cy-10,cx+ew+2,cy+6); x.stroke(); x.lineWidth=2; x.strokeStyle='rgba(70,45,35,0.55)'; x.beginPath(); x.moveTo(cx-ew+10,cy+14); x.quadraticCurveTo(cx+20,cy+eh+2,cx+ew-6,cy+10); x.stroke(); if(o.lash){ x.strokeStyle='#2a1a14'; x.lineWidth=4; x.beginPath(); x.moveTo(cx+ew-4,cy); x.lineTo(cx+ew+14,cy-12); x.moveTo(cx+ew-24,cy-eh+4); x.lineTo(cx+ew-12,cy-eh-10); x.stroke(); }
      // 雙眼皮線
      x.strokeStyle='rgba(120,80,60,0.35)'; x.lineWidth=2; x.beginPath(); x.moveTo(cx-ew+20,cy-eh+2); x.quadraticCurveTo(cx-30,cy-eh-14,cx+40,cy-eh-8); x.stroke(); }); }
  function eyeClosedTex(o){ return tex('eyec'+JSON.stringify(o),256,128,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle='#2a1a14'; x.lineWidth=6; x.lineCap='round'; x.beginPath(); if(o.happy){ x.moveTo(20,74); x.quadraticCurveTo(128,26,236,74); } else { x.moveTo(20,66); x.quadraticCurveTo(128,88,236,64); } x.stroke(); }); }
  function browTex(o){ return tex('brow'+JSON.stringify(o),256,96,(x,w,h)=>{ x.clearRect(0,0,w,h); x.strokeStyle=o.color||'#2a1a14'; x.lineCap='round'; x.lineWidth=o.thick?16:11; x.beginPath(); if(o.worried){ x.moveTo(24,60); x.quadraticCurveTo(120,40,232,52); } else if(o.up){ x.moveTo(24,68); x.quadraticCurveTo(120,18,232,60); } else if(o.sharp){ x.moveTo(24,66); x.quadraticCurveTo(110,30,232,54); } else { x.moveTo(24,64); x.quadraticCurveTo(120,34,232,56); } x.stroke(); }); }
  function lipTex(o){ return tex('lip'+JSON.stringify(o),256,128,(x,w,h)=>{ x.clearRect(0,0,w,h); const col=o.color||'#b9736c'; x.fillStyle=col; x.strokeStyle=shade(col,0.35); x.lineWidth=3; const e=o.expr||'normal'; x.beginPath();
      if(e==='smile'||e==='shy'){ x.moveTo(40,62); x.quadraticCurveTo(128,40,216,62); x.quadraticCurveTo(128,112,40,62); x.closePath(); x.fill(); x.stroke(); x.strokeStyle='rgba(60,30,30,0.6)'; x.lineWidth=3; x.beginPath(); x.moveTo(44,62); x.quadraticCurveTo(128,72,212,62); x.stroke(); }
      else if(e==='laugh'){ x.moveTo(36,56); x.quadraticCurveTo(128,36,220,56); x.quadraticCurveTo(128,124,36,56); x.closePath(); x.fill(); x.stroke(); x.fillStyle='#fff'; x.beginPath(); x.moveTo(60,60); x.quadraticCurveTo(128,54,196,60); x.lineTo(190,72); x.quadraticCurveTo(128,80,66,72); x.closePath(); x.fill(); }
      else if(e==='surprise'){ x.ellipse(128,64,26,34,0,0,Math.PI*2); x.fill(); x.stroke(); x.fillStyle='#3a1a1a'; x.beginPath(); x.ellipse(128,68,14,20,0,0,Math.PI*2); x.fill(); }
      else if(e==='worried'){ x.moveTo(50,66); x.quadraticCurveTo(128,48,206,66); x.quadraticCurveTo(128,88,50,66); x.closePath(); x.fill(); x.stroke(); x.strokeStyle='rgba(60,30,30,0.6)'; x.beginPath(); x.moveTo(56,68); x.quadraticCurveTo(90,58,128,70); x.quadraticCurveTo(166,58,200,68); x.stroke(); }
      else { x.moveTo(48,64); x.quadraticCurveTo(128,44,208,64); x.quadraticCurveTo(128,90,48,64); x.closePath(); x.fill(); x.stroke(); x.strokeStyle='rgba(60,30,30,0.55)'; x.lineWidth=3; x.beginPath(); x.moveTo(52,64); x.quadraticCurveTo(128,74,204,64); x.stroke(); x.fillStyle='rgba(255,255,255,0.25)'; x.beginPath(); x.ellipse(128,76,30,6,0,0,Math.PI*2); x.fill(); } }); }
  function blushTex(a){ return tex('blush'+a,128,128,(x,w,h)=>{ const g=x.createRadialGradient(64,64,4,64,64,60); g.addColorStop(0,'rgba(225,120,110,'+a+')'); g.addColorStop(1,'rgba(225,120,110,0)'); x.fillStyle=g; x.fillRect(0,0,128,128); }); }
  function decal(t,w,h,order){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})); m.renderOrder=order||2; return m; }

  // ---- 選角規格 ----
  // 男主參考方向：高挑清爽、書卷氣；女主參考方向：俐落知性、有存在感。皆為原創設計。
  const CAST={
    hero_m:{ id:'hero_m', name:'', height:1.78, build:'slim', sex:'m', skin:'#f3d9c4', hair:{color:'#2a1d16',style:'softMid'}, face:{iris:'#3a2a22',brow:'soft',lash:false}, outfit:{top:{type:'shirtOpen',color:'#eef0f2',inner:'#d9dee5'},bottom:{type:'slacks',color:'#3a3f4a'},shoes:{type:'sneaker',color:'#f4f1ea',sole:'#e9e4d8'},bag:'shoulder',bagColor:'#4a4238'}, posture:{sway:0.02} },
    hero_f:{ id:'hero_f', name:'', height:1.68, build:'slim', sex:'f', skin:'#f6dcc9', hair:{color:'#2b1f1a',style:'ponyMid'}, face:{iris:'#3a2a22',brow:'sharp',lash:true}, outfit:{top:{type:'knit',color:'#c7b9a5',inner:'#ffffff'},bottom:{type:'wideLeg',color:'#2e3340'},shoes:{type:'loafer',color:'#3b2a1e',sole:'#2b2118'},bag:'tote',bagColor:'#3b2a1e'}, posture:{sway:0.015} },
    an:{ id:'an', name:'小安', height:1.62, build:'slim', sex:'f', skin:'#f5dccb', hair:{color:'#1f1613',style:'longStraight'}, face:{iris:'#2e211c',brow:'soft',lash:true,glasses:true}, outfit:{top:{type:'cardiganOpen',color:'#2f5d50',inner:'#f7f4ee'},bottom:{type:'skirtLong',color:'#2e3a55'},shoes:{type:'canvas',color:'#f7f7f4',sole:'#ffffff'},bag:'tote',bagColor:'#d9d3c6'}, posture:{sway:0.01} },
    zhe:{ id:'zhe', name:'阿哲', height:1.75, build:'athletic', sex:'m', skin:'#e6c3a4', hair:{color:'#3b2a1e',style:'shortTextured'}, face:{iris:'#3a2a22',brow:'thick',lash:false}, outfit:{top:{type:'tee',color:'#e0b95b',inner:'#e0b95b'},bottom:{type:'jeans',color:'#4a5a78'},shoes:{type:'sneaker',color:'#3a6fb0',sole:'#ffffff'},bag:'backpack',bagColor:'#3b3f4a'}, posture:{sway:0.03} },
    sis:{ id:'sis', name:'溫學姊', height:1.66, build:'slim', sex:'f', skin:'#f8e2d3', hair:{color:'#3b2a1e',style:'ponyLow'}, face:{iris:'#4a3020',brow:'sharp',lash:true}, outfit:{top:{type:'shirt',color:'#ffffff',inner:'#ffffff'},bottom:{type:'slacks',color:'#c9b28c'},shoes:{type:'loafer',color:'#8b5e3c',sole:'#5c3a21'},bag:null}, posture:{sway:0.01} },
    kai:{ id:'kai', name:'阿凱', height:1.72, build:'slim', sex:'m', skin:'#efd0b3', hair:{color:'#1f1a17',style:'shortClean'}, face:{iris:'#2e211c',brow:'soft',lash:false,glasses:true}, outfit:{top:{type:'hoodie',color:'#5a5a7a',inner:'#5a5a7a'},bottom:{type:'jeans',color:'#2b2b3a'},shoes:{type:'sneaker',color:'#2b2118',sole:'#ffffff'},bag:'backpack',bagColor:'#2b2b2b'}, posture:{sway:0.02} },
    yu:{ id:'yu', name:'小語', height:1.63, build:'slim', sex:'f', skin:'#f9e3d1', hair:{color:'#4b2e1e',style:'wavyMid'}, face:{iris:'#4a3020',brow:'soft',lash:true}, outfit:{top:{type:'tee',color:'#f7f4ee',inner:'#f7f4ee'},bottom:{type:'skirtMid',color:'#8c3b47'},shoes:{type:'canvas',color:'#f4f1ea',sole:'#ffffff'},bag:'shoulder',bagColor:'#3b2a1e'}, posture:{sway:0.025} },
  };
  function outfitPreset(spec,key){ /* 換裝：回傳新 outfit */ return spec; }

  // ---- 建模 ----
  function build(spec){
    const H=spec.height||1.72, k=H/1.75; // 比例係數
    const f=spec.sex==='f'; const slim=spec.build!=='athletic';
    const SK=spec.skin, skinM=M(SK,{kind:'skin'}), skinD=M(shade(SK,0.08),{kind:'skin'});
    const root=new THREE.Group(); root.name='human'; const P={};
    // 尺寸（依身高縮放）
    const hipY=0.93*k, kneeY=0.50*k, ankleY=0.075*k, shoulderY=1.455*k, neckY=1.50*k, headC=1.655*k;
    const shW=(f?0.185:0.21)*k, hipW=(f?0.17:0.16)*k;
    // 骨盆
    const pelvis=new THREE.Group(); pelvis.position.y=hipY; root.add(pelvis); P.pelvis=pelvis;
    // 軀幹（身體 + 衣服）
    const torso=new THREE.Group(); torso.position.y=0; pelvis.add(torso); P.torso=torso;
    const chest=new THREE.Group(); chest.position.y=0.22*k; torso.add(chest); P.chest=chest; // 胸椎關節
    // 身體本體（膚色，作為底層）
    const bodyProf=f? [[0.001,-0.02],[hipW,-0.02],[hipW*1.0,0.05],[0.125*k,0.15],[0.13*k,0.26],[0.16*k,0.36],[0.172*k,0.44],[0.155*k,0.52],[0.06*k,0.56],[0.001,0.56]] : [[0.001,-0.02],[hipW,-0.02],[0.16*k,0.05],[0.142*k,0.15],[0.15*k,0.26],[0.185*k,0.36],[0.2*k,0.44],[0.185*k,0.52],[0.07*k,0.56],[0.001,0.56]];
    const bodyGeo=lathe(bodyProf,22); bodyGeo.scale(1,1,f?0.72:0.7);
    const body=new THREE.Mesh(bodyGeo,skinM); torso.add(body);
    // 上衣
    const top=spec.outfit.top; const tc=top.color; const topM=M(tc,{rough:0.9}); const innerM=M(top.inner||'#fff',{rough:0.9});
    const shirtProf=f? [[0.001,-0.01],[hipW*1.05,-0.01],[hipW*1.05,0.05],[0.135*k,0.15],[0.14*k,0.26],[0.17*k,0.36],[0.185*k,0.44],[0.17*k,0.52],[0.075*k,0.565],[0.001,0.565]] : [[0.001,-0.01],[hipW*1.05,-0.01],[0.168*k,0.05],[0.152*k,0.15],[0.16*k,0.26],[0.195*k,0.36],[0.21*k,0.44],[0.195*k,0.52],[0.085*k,0.565],[0.001,0.565]];
    const mkShirt=(prof,mat,zs,phiS,phiL)=>{ const g=lathe(prof,24,phiS||0,phiL||Math.PI*2); g.scale(1,1,zs); const m=new THREE.Mesh(g,mat); m.material.side=THREE.DoubleSide; return m; };
    let shirt;
    if(top.type==='cardiganOpen'||top.type==='shirtOpen'||top.type==='jacket'){ // 內搭 + 開襟外層
      shirt=mkShirt(shirtProf,innerM,f?0.74:0.72); torso.add(shirt);
      const outerProf=shirtProf.map(p=>[p[0]*1.05+0.004,p[1]]); const gap=0.42*Math.PI; const outer=mkShirt(outerProf,topM,f?0.8:0.78,gap/2,Math.PI*2-gap); torso.add(outer);
      const collar=new THREE.Mesh(lathe([[0.058*k,0.555*k],[0.095*k,0.585*k],[0.105*k,0.56*k],[0.07*k,0.545*k]],20,Math.PI*0.12,Math.PI*1.76),topM); collar.geometry.scale(1,1,0.8); torso.add(collar);
    } else { shirt=mkShirt(shirtProf,topM,f?0.76:0.74); torso.add(shirt); if(top.type==='shirt'){ const collar=new THREE.Mesh(lathe([[0.058*k,0.555*k],[0.092*k,0.585*k],[0.1*k,0.56*k],[0.07*k,0.545*k]],20),topM); collar.geometry.scale(1,1,0.8); torso.add(collar); const placket=new THREE.Mesh(new THREE.BoxGeometry(0.03*k,0.38*k,0.006),M(shade(tc,0.06))); placket.position.set(0,0.35*k,(f?0.15:0.165)*k+0.004); torso.add(placket); } if(top.type==='hoodie'){ const hood=new THREE.Mesh(G('hood',()=>new THREE.TorusGeometry(0.11,0.045,8,16,Math.PI)),M(shade(tc,0.12))); hood.position.set(0,0.54*k,-0.05*k); hood.rotation.x=Math.PI/2; hood.rotation.z=Math.PI; hood.scale.setScalar(k); torso.add(hood); const pocket=new THREE.Mesh(new THREE.BoxGeometry(0.2*k,0.1*k,0.03),M(shade(tc,0.1))); pocket.position.set(0,0.1*k,(f?0.16:0.165)*k); torso.add(pocket); } }
    // 領口皮膚（V 領區）
    const neckSkin=new THREE.Mesh(new THREE.CylinderGeometry(0.052*k,0.06*k,0.1*k,14),skinD); neckSkin.position.y=0.58*k; torso.add(neckSkin);
    // 頭
    const neck=new THREE.Group(); neck.position.y=0.575*k; torso.add(neck); P.neck=neck;
    const head=new THREE.Group(); head.position.y=0.02*k; neck.add(head); P.head=head; // 頭部原點 ≈ 下巴上方
    const hr=0.105*k; const HC=0.115*k; const skull=new THREE.Mesh(headGeo(hr),skinM); skull.position.y=0.115*k; head.add(skull); P.skull=skull;
    for(const s of [-1,1]){ const ear=new THREE.Mesh(ellipsoid(0.011*k,0.028*k,0.018*k,10,8),skinM); ear.position.set(s*hr*0.93,0.1*k,-0.012*k); head.add(ear); }
    const nose=new THREE.Mesh(G('nose',()=>{ const g=new THREE.SphereGeometry(0.013,10,8); g.scale(0.75,1.0,1.1); return g; }),skinD); nose.position.set(0,0.065*k,headFrontZ(hr,0.065*k-HC)-0.002); nose.scale.setScalar(k); head.add(nose);
    // 五官貼片
    const face=spec.face||{}; const eyeW=0.042*k, eyeH=0.024*k; const eyeY=0.103*k; const fz=headFrontZ(hr,eyeY-HC)+0.003;
    const mkEye=(s)=>{ const g=new THREE.Group(); const open=decal(eyeTex({iris:face.iris,lash:!!face.lash}),eyeW,eyeH); const closed=decal(eyeClosedTex({}),eyeW,eyeH); const happy=decal(eyeClosedTex({happy:true}),eyeW,eyeH); closed.visible=happy.visible=false; g.add(open,closed,happy); g.position.set(s*0.037*k,eyeY,headFrontZ(hr,eyeY-HC)*0.93+0.004); g.rotation.y=s*0.36; if(s<0){ open.scale.x=-1; } g.userData={open,closed,happy}; head.add(g); return g; };
    P.eyeL=mkEye(-1); P.eyeR=mkEye(1);
    const browCol=shade(spec.hair.color,0.05);
    const mkBrow=(s)=>{ const b=decal(browTex({color:browCol,thick:face.brow==='thick',sharp:face.brow==='sharp'}),0.045*k,0.016*k,3); b.position.set(s*0.038*k,eyeY+0.026*k,headFrontZ(hr,eyeY+0.026*k-HC)*0.93+0.004); b.rotation.y=s*0.38; if(s<0) b.scale.x=-1; head.add(b); return b; };
    P.browL=mkBrow(-1); P.browR=mkBrow(1);
    const lips=decal(lipTex({expr:'normal',color:f?'#c27a78':'#b9756c'}),0.052*k,0.026*k,3); lips.position.set(0,0.03*k,headFrontZ(hr,0.03*k-HC)+0.004); lips.rotation.x=-0.25; head.add(lips); P.lips=lips;
    for(const s of [-1,1]){ const bl=decal(blushTex(0.2),0.06*k,0.04*k,1); bl.position.set(s*0.06*k,0.07*k,headFrontZ(hr,0.07*k-HC)*0.8+0.003); bl.rotation.y=s*0.8; head.add(bl); }
    if(face.glasses){ const gm=M('#35303c',{rough:0.4}); for(const s of [-1,1]){ const ring=new THREE.Mesh(G('gl',()=>new THREE.TorusGeometry(0.023,0.0025,6,22)),gm); ring.position.set(s*0.037*k,eyeY,headFrontZ(hr,eyeY-HC)+0.012); ring.rotation.y=s*0.2; ring.scale.setScalar(k); head.add(ring); const lens=new THREE.Mesh(G('glLens',()=>new THREE.CircleGeometry(0.022,16)),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12})); lens.position.copy(ring.position); lens.rotation.y=ring.rotation.y; lens.scale.setScalar(k); head.add(lens); const temple=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.004,0.11*k),gm); temple.position.set(s*0.098*k,eyeY,headFrontZ(hr,eyeY-HC)-0.05*k); head.add(temple); } const bridge=new THREE.Mesh(new THREE.BoxGeometry(0.026*k,0.004,0.004),gm); bridge.position.set(0,eyeY,headFrontZ(hr,eyeY-HC)+0.012); head.add(bridge); }
    // 頭髮
    buildHair(head,spec,hr,k);
    // 手臂
    const armL=0.30*k, foreL=0.27*k; const ar1=(f?0.043:0.048)*k, ar2=(f?0.036:0.04)*k, fr1=(f?0.035:0.04)*k, fr2=(f?0.026:0.03)*k;
    const longSleeve=['shirt','shirtOpen','cardiganOpen','jacket','hoodie','knit'].includes(top.type);
    const mkArm=(s)=>{ const sh=new THREE.Group(); sh.position.set(s*shW,0.29*k,0); chest.add(sh); const up=new THREE.Mesh(capsuleLimb(ar1*(longSleeve?1.15:1),ar2*(longSleeve?1.15:1),armL),longSleeve?topM:skinM); sh.add(up); const elbow=new THREE.Group(); elbow.position.y=-armL; sh.add(elbow); const fore=new THREE.Mesh(capsuleLimb(fr1*(longSleeve?1.12:1),fr2*(longSleeve?1.12:1),foreL),longSleeve?topM:skinM); elbow.add(fore); const wrist=new THREE.Group(); wrist.position.y=-foreL; elbow.add(wrist); const hand=new THREE.Mesh(G('hand',()=>{ const g=new THREE.BoxGeometry(0.042,0.09,0.02,2,3,1); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const y=p.getY(i); if(y<-0.03) p.setX(i,p.getX(i)*0.85); } g.computeVertexNormals(); return g; }),skinM); hand.position.y=-0.05*k; hand.scale.setScalar(k); wrist.add(hand); sh.rotation.z=s*0.08; return {sh,elbow,wrist,hand}; };
    P.armL=mkArm(-1); P.armR=mkArm(1);
    if(top.type==='cardiganOpen'||top.type==='shirtOpen'||top.type==='jacket'){ /* 肩線 */ const yoke=new THREE.Mesh(new THREE.BoxGeometry(shW*2+0.06,0.03,0.12*k),topM); yoke.position.set(0,0.545*k,-0.01); torso.add(yoke); }
    // 腿
    const bottom=spec.outfit.bottom; const bc=bottom.color; const botM=M(bc,{kind:bottom.type==='jeans'?'denim':'cloth'});
    const thighL=hipY-kneeY, calfL=kneeY-ankleY;
    const pantsThigh= bottom.type==='wideLeg'?1.35: bottom.type==='slacks'?1.12: bottom.type==='jeans'?1.08:1.0;
    const skirt= bottom.type==='skirtLong'||bottom.type==='skirtMid'; const shorts=bottom.type==='shorts';
    const mkLeg=(s)=>{ const hip=new THREE.Group(); hip.position.set(s*(f?0.085:0.09)*k,0.0,0); pelvis.add(hip); const tr1=(f?0.082:0.085)*k, tr2=(f?0.06:0.062)*k;
      const thigh=new THREE.Mesh(capsuleLimb(tr1*(skirt||shorts?1:pantsThigh),tr2*(skirt||shorts?1:pantsThigh),thighL+0.02),skirt||shorts?skinM:botM); hip.add(thigh);
      const knee=new THREE.Group(); knee.position.y=-thighL; hip.add(knee); const cr1=(f?0.058:0.06)*k, cr2=(f?0.036:0.038)*k;
      const calfCovered= !skirt&&!shorts; const calf=new THREE.Mesh(capsuleLimb(cr1*(calfCovered?(bottom.type==='wideLeg'?1.5:1.08):1),cr2*(calfCovered?(bottom.type==='wideLeg'?1.7:1.12):1),calfL+0.01),calfCovered?botM:skinM); knee.add(calf);
      if(bottom.type==='skirtMid'){ /* 膝下露腿 */ }
      const ankle=new THREE.Group(); ankle.position.y=-calfL; knee.add(ankle);
      const shoe=spec.outfit.shoes||{type:'sneaker',color:'#f4f1ea'}; const sm=M(shoe.color,{rough:0.7}); const soleM=M(shoe.sole||'#ffffff',{rough:0.9});
      const sg=G('shoe_'+shoe.type,()=>{ const g=new THREE.BoxGeometry(0.09,0.075,0.26,2,2,4); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); let nx=x, ny=y; if(z>0.08){ nx=x*0.82; ny=y*0.7-0.01; } if(z<-0.08){ nx=x*0.9; } if(y>0.02&&z>0.0) ny=y*0.85; p.setXYZ(i,nx,ny,z); } g.computeVertexNormals(); return g; });
      const shoeM=new THREE.Mesh(sg,sm); shoeM.position.set(0,-0.038*k,0.05*k); shoeM.scale.setScalar(k); ankle.add(shoeM); const sole=new THREE.Mesh(new THREE.BoxGeometry(0.092*k,0.018*k,0.265*k),soleM); sole.position.set(0,-0.072*k,0.05*k); ankle.add(sole);
      if(shoe.type==='loafer'){ shoeM.scale.set(k,0.85*k,k); }
      return {hip,knee,ankle,shoe:shoeM}; };
    P.legL=mkLeg(-1); P.legR=mkLeg(1);
    if(skirt){ const len= bottom.type==='skirtLong'?0.62*k:0.42*k; const sk=new THREE.Mesh(lathe([[0.001,0.02],[hipW*1.06,0.02],[hipW*1.12,-0.12*k],[hipW*1.35,-len*0.7],[hipW*1.5,-len],[0.001,-len]],24),M(bc,{rough:0.9,side:THREE.DoubleSide})); sk.geometry.scale(1,1,0.85); pelvis.add(sk); P.skirt=sk; }
    if(!skirt){ const belt=new THREE.Mesh(lathe([[0.001,0.02],[hipW*1.07,0.02],[hipW*1.07,-0.035*k],[0.001,-0.035*k]],24),M(shade(bc,0.25),{rough:0.8})); belt.geometry.scale(1,1,0.74); belt.position.y=0.01; pelvis.add(belt); }
    // 包包
    const bag=spec.outfit.bag; const bagC=spec.outfit.bagColor||'#3b3f4a';
    if(bag==='backpack'){ const bp=new THREE.Mesh(new THREE.BoxGeometry(0.28*k,0.34*k,0.13*k,2,2,2),M(bagC,{rough:0.9})); bp.position.set(0,0.3*k,-(f?0.15:0.16)*k-0.06*k); torso.add(bp); for(const s of [-1,1]){ const strap=new THREE.Mesh(new THREE.BoxGeometry(0.035*k,0.3*k,0.01),M(shade(bagC,0.15),{rough:0.9})); strap.position.set(s*0.085*k,0.4*k,(f?0.15:0.165)*k+0.01); strap.rotation.x=0.12; torso.add(strap); } }
    if(bag==='shoulder'){ const strap=new THREE.Mesh(new THREE.BoxGeometry(0.03*k,0.62*k,0.012),M(bagC,{rough:0.9})); strap.position.set(-0.03*k,0.28*k,(f?0.15:0.17)*k+0.008); strap.rotation.z=0.42; torso.add(strap); const bagM=new THREE.Mesh(new THREE.BoxGeometry(0.26*k,0.2*k,0.09*k),M(bagC,{rough:0.9})); bagM.position.set(0.2*k,-0.02*k,-0.02*k); torso.add(bagM); }
    if(bag==='tote'){ const strap=new THREE.Mesh(new THREE.BoxGeometry(0.03*k,0.5*k,0.012),M(bagC,{rough:0.9})); strap.position.set(0.16*k,0.3*k,(f?0.06:0.08)*k); strap.rotation.z=-0.15; torso.add(strap); const bagM=new THREE.Mesh(new THREE.BoxGeometry(0.3*k,0.3*k,0.07*k),M(bagC,{rough:0.95})); bagM.position.set(0.24*k,-0.08*k,0.0); torso.add(bagM); }
    // 影子
    const shadow=new THREE.Mesh(G('blob2',()=>new THREE.CircleGeometry(0.32,20)),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.22,depthWrite:false})); shadow.rotation.x=-Math.PI/2; shadow.position.y=0.012; root.add(shadow); P.shadow=shadow;
    root.userData={parts:P,spec,k,anim:{t:Math.random()*10,phase:Math.random()*6,blink:2,expr:'normal',pose:'idle',weight:0}};
    // 每個骨骼群組內的靜態網格合併（減少 draw call；不跨越會動的子群組）
    { const groups=[]; root.traverse(o=>{ if(o.isGroup&&!(o.userData&&o.userData.dyn)) groups.push(o); }); for(const g of groups) mergeStatic(g,{direct:true}); }
    root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=false; } });
    return root;
  }
  // ---- 頭型 ----
  function headGeo(hr){ const g=new THREE.SphereGeometry(hr,32,24); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const t=y/hr; let sx=1,sz=1; if(t<0){ const u=-t; sx=1-0.30*u*u; sz=1-0.16*u*u; } if(z<0) sz*=1.05; if(t>0.2&&z>0){ sz*=1-0.06*(t-0.2); } let nz=z*sz; if(t<-0.45&&z>0){ nz+=(-t-0.45)*0.14*hr; } p.setXYZ(i,x*sx,y*1.10,nz); } g.computeVertexNormals(); return g; }
  function headFrontZ(hr,yLocal){ const t=Math.max(-1,Math.min(1,yLocal/(hr*1.10))); const base=hr*Math.sqrt(Math.max(0,1-t*t)); let sz=1; if(t<0){ const u=-t; sz=1-0.16*u*u; } if(t>0.2) sz*=1-0.06*(t-0.2); let z=base*sz; if(t<-0.45) z+=(-t-0.45)*0.14*hr; return z; }
  // ---- 頭髮：以「髮片殼」組合（貼合頭顱、邊緣有髮尾波浪），避免塑膠頭盔與棒狀髮束 ----
  // 球面參數：phi=π/2 為正前方(+z)，phi=3π/2 為正後方；theta 從頭頂(0)向下
  function shell(hr,o){ const seg=32; const g=new THREE.SphereGeometry(hr*(o.r||1.07),seg,20,o.phiStart,o.phiLength,o.thetaStart||0,o.thetaLength); const p=g.attributes.position; const R=hr*(o.r||1.07); const thMax=(o.thetaStart||0)+o.thetaLength;
    for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const theta=Math.acos(Math.max(-1,Math.min(1,y/R))); const phi=Math.atan2(z,-x); const edge=Math.max(0,(theta-(thMax-0.35))/0.35); // 0..1 靠近下緣
      let dy=0,scale=1; if(edge>0){ const w=o.wave||3; const amp=(o.amp||0.03)*hr*(1+((o.ampSide||0)*Math.cos(phi))); dy=-edge*edge*amp*(0.5+0.5*Math.sin(phi*w+(o.waveOff||0))); scale=1+edge*0.02; }
      const bump=1+(o.noise||0.012)*Math.sin(phi*7+theta*9)*Math.cos(theta*5); p.setXYZ(i,x*scale*bump,(y+dy)*(o.yScale||1.12)*bump,z*scale*bump); }
    g.computeVertexNormals(); return g; }
  function buildHair(head,spec,hr,k){ const st=spec.hair.style; const col=spec.hair.color; const hm=M(col,{kind:'hair',side:THREE.DoubleSide}); const hm2=M(light(col,0.06),{kind:'hair',side:THREE.DoubleSide}); const g=new THREE.Group(); g.position.y=0.115*k; head.add(g);
    const add=(geo,mat,tilt,rotY,dy)=>{ const m=new THREE.Mesh(geo,mat); m.rotation.x=tilt||0; m.rotation.y=rotY||0; m.position.y=dy||0; m.castShadow=true; g.add(m); return m; };
    const FRONT=Math.PI/2, BACK=Math.PI*1.5, LEFT=Math.PI, RIGHT=0;
    // 髮帽：頭頂到後腦（前緣停在髮際線）
    add(shell(hr,{r:1.07,phiStart:0,phiLength:Math.PI*2,thetaLength:Math.PI*0.5,amp:0.02,wave:5}),hm,-0.32,0,0.01*k);
    if(st==='softMid'){ // 柔軟中長、微側分
      add(shell(hr,{r:1.1,phiStart:FRONT-0.95,phiLength:1.9,thetaStart:0.05,thetaLength:Math.PI*0.37,amp:0.16,wave:2.5,waveOff:0.8,ampSide:0.5,yScale:1.1}),hm2,-0.06,0.12,0.008*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.1,phiStart:(s<0?LEFT:RIGHT)-0.75,phiLength:1.5,thetaStart:0.3,thetaLength:Math.PI*0.4,amp:0.12,wave:3,yScale:1.1}),hm,-0.1,0,0); }
      add(shell(hr,{r:1.09,phiStart:BACK-1.1,phiLength:2.2,thetaStart:0.3,thetaLength:Math.PI*0.5,amp:0.1,wave:4,yScale:1.1}),hm,0.05,0,0); }
    else if(st==='chicBob'){ // 俐落短鮑伯、斜瀏海
      add(shell(hr,{r:1.11,phiStart:FRONT-1.0,phiLength:2.0,thetaStart:0.05,thetaLength:Math.PI*0.36,amp:0.3,wave:1.2,waveOff:1.9,ampSide:0.9,yScale:1.1}),hm2,-0.05,0.18,0.008*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.13,phiStart:(s<0?LEFT:RIGHT)-0.8,phiLength:1.6,thetaStart:0.25,thetaLength:Math.PI*0.62,amp:0.08,wave:2,yScale:1.12}),hm,-0.05,0,0); }
      add(shell(hr,{r:1.12,phiStart:BACK-1.2,phiLength:2.4,thetaStart:0.25,thetaLength:Math.PI*0.6,amp:0.06,wave:5,yScale:1.12}),hm,0.05,0,0); }
    else if(st==='ponyMid'){ // 女主：自然中長髮馬尾、額前與側邊碎髮
      add(shell(hr,{r:1.075,phiStart:FRONT-1.0,phiLength:2.0,thetaStart:0.05,thetaLength:Math.PI*0.34,amp:0.12,wave:2.2,waveOff:0.6,ampSide:0.45,yScale:1.1}),hm2,-0.06,0.1,0.006*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.07,phiStart:(s<0?LEFT:RIGHT)-0.7,phiLength:1.4,thetaStart:0.3,thetaLength:Math.PI*0.38,amp:0.03,wave:2,yScale:1.1}),hm,-0.1,0,0); }
      add(shell(hr,{r:1.07,phiStart:BACK-1.2,phiLength:2.4,thetaStart:0.3,thetaLength:Math.PI*0.46,amp:0.02,wave:4,yScale:1.1}),hm,0.05,0,0);
      // 側邊碎髮
      for(const s of [-1,1]){ for(let j=0;j<2;j++){ const fs=new THREE.Mesh(lathe([[0.001,0],[0.009*k,0],[0.011*k,-0.05*k],[0.005*k,-0.1*k],[0.001,-0.11*k]],8),j?hm:hm2); fs.position.set(s*hr*(0.9+j*0.03),hr*0.1-j*0.01*k,hr*(0.5-j*0.15)); fs.rotation.z=s*(0.1+j*0.06); fs.rotation.x=0.1; g.add(fs); } }
      // 馬尾：分段鏈（動畫時擺動）
      const pony=new THREE.Group(); pony.position.set(0,-hr*0.15,-hr*1.02); g.add(pony); const segs=[]; let parent=pony; const n=6; for(let i=0;i<n;i++){ const t=i/(n-1); const rad=(0.036-0.02*t)*k; const len=0.075*k; const segG=new THREE.Group(); parent.add(segG); const m=new THREE.Mesh(lathe([[0.001,0.01*k],[rad,0.005*k],[rad*0.95,-len*0.6],[rad*0.7,-len],[0.001,-len-0.01*k]],12),i%2?hm:hm2); m.scale.set(1,1,0.8); segG.add(m); segG.position.y= i===0?0:-len*0.92; segs.push(segG); parent=segG; }
      const tie=new THREE.Mesh(new THREE.TorusGeometry(0.03*k,0.007*k,6,16),M('#3b2a1e',{rough:0.7})); tie.position.set(0,-0.005,0); pony.add(tie);
      const tuft=new THREE.Mesh(lathe([[0.001,0],[0.04*k,0],[0.05*k,-0.03*k],[0.038*k,-0.06*k],[0.001,-0.07*k]],12),hm); tuft.position.set(0,0.02*k,0.01); tuft.scale.set(1,1,0.9); pony.add(tuft);
      pony.userData={segs,dyn:true}; head.userData.pony=pony; }
    else if(st==='longStraight'){ add(shell(hr,{r:1.09,phiStart:FRONT-0.9,phiLength:1.8,thetaStart:0.05,thetaLength:Math.PI*0.42,amp:0.14,wave:2,ampSide:0.2,yScale:1.1}),hm2,-0.06,0,0.005*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.12,phiStart:(s<0?LEFT:RIGHT)-0.7,phiLength:1.4,thetaStart:0.3,thetaLength:Math.PI*0.62,amp:0.04,wave:2,yScale:1.12}),hm,-0.05,0,0); }
      add(shell(hr,{r:1.1,phiStart:BACK-1.3,phiLength:2.6,thetaStart:0.3,thetaLength:Math.PI*0.62,amp:0.03,wave:4,yScale:1.12}),hm,0.05,0,0);
      const fall=new THREE.Mesh(lathe([[0.001,0],[hr*1.05,0],[hr*1.1,-0.14*k],[hr*1.0,-0.36*k],[hr*0.85,-0.5*k],[0.001,-0.52*k]],22,Math.PI*0.5,Math.PI),M(col,{kind:'hair',side:THREE.DoubleSide})); fall.position.set(0,-hr*0.05,-0.005); g.add(fall);
      for(const s of [-1,1]){ const fs=new THREE.Mesh(lathe([[0.001,0],[0.035*k,0],[0.04*k,-0.2*k],[0.025*k,-0.42*k],[0.001,-0.44*k]],12),hm); fs.position.set(s*hr*0.92,-hr*0.15,hr*0.35); fs.rotation.z=s*0.06; g.add(fs); } }
    else if(st==='shortTextured'){ add(shell(hr,{r:1.1,phiStart:FRONT-1.0,phiLength:2.0,thetaStart:0.02,thetaLength:Math.PI*0.36,amp:0.22,wave:6,noise:0.03,yScale:1.1}),hm2,-0.15,0,0.008*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.08,phiStart:(s<0?LEFT:RIGHT)-0.7,phiLength:1.4,thetaStart:0.25,thetaLength:Math.PI*0.32,amp:0.12,wave:5,noise:0.03,yScale:1.1}),hm,-0.1,0,0); }
      add(shell(hr,{r:1.08,phiStart:BACK-1.1,phiLength:2.2,thetaStart:0.25,thetaLength:Math.PI*0.42,amp:0.1,wave:6,noise:0.03,yScale:1.1}),hm,0.05,0,0); }
    else if(st==='shortClean'){ add(shell(hr,{r:1.08,phiStart:FRONT-0.9,phiLength:1.8,thetaStart:0.05,thetaLength:Math.PI*0.34,amp:0.1,wave:3,ampSide:0.3,yScale:1.1}),hm2,-0.1,0.1,0.006*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.07,phiStart:(s<0?LEFT:RIGHT)-0.7,phiLength:1.4,thetaStart:0.3,thetaLength:Math.PI*0.28,amp:0.05,wave:4,yScale:1.1}),hm,-0.1,0,0); }
      add(shell(hr,{r:1.07,phiStart:BACK-1.1,phiLength:2.2,thetaStart:0.3,thetaLength:Math.PI*0.4,amp:0.05,wave:5,yScale:1.1}),hm,0.05,0,0); }
    else if(st==='ponyLow'){ add(shell(hr,{r:1.09,phiStart:FRONT-0.95,phiLength:1.9,thetaStart:0.05,thetaLength:Math.PI*0.42,amp:0.2,wave:1.5,waveOff:1.2,ampSide:0.8,yScale:1.1}),hm2,-0.05,0.15,0.005*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.08,phiStart:(s<0?LEFT:RIGHT)-0.7,phiLength:1.4,thetaStart:0.3,thetaLength:Math.PI*0.4,amp:0.03,wave:2,yScale:1.1}),hm,-0.1,0,0); }
      add(shell(hr,{r:1.08,phiStart:BACK-1.2,phiLength:2.4,thetaStart:0.3,thetaLength:Math.PI*0.5,amp:0.03,wave:4,yScale:1.1}),hm,0.05,0,0);
      const tail=new THREE.Mesh(lathe([[0.001,0],[0.03*k,0],[0.042*k,-0.08*k],[0.038*k,-0.2*k],[0.02*k,-0.32*k],[0.001,-0.34*k]],12),hm); tail.position.set(0,-hr*0.35,-hr*1.0); tail.rotation.x=-0.45; g.add(tail); const tie=new THREE.Mesh(new THREE.TorusGeometry(0.03*k,0.006*k,6,14),M('#8c3b47')); tie.position.set(0,-hr*0.35,-hr*1.02); g.add(tie); }
    else if(st==='wavyMid'){ add(shell(hr,{r:1.1,phiStart:FRONT-0.95,phiLength:1.9,thetaStart:0.05,thetaLength:Math.PI*0.42,amp:0.16,wave:2.2,ampSide:0.3,yScale:1.1}),hm2,-0.05,0,0.005*k);
      for(const s of [-1,1]){ add(shell(hr,{r:1.14,phiStart:(s<0?LEFT:RIGHT)-0.75,phiLength:1.5,thetaStart:0.3,thetaLength:Math.PI*0.66,amp:0.14,wave:3,noise:0.03,yScale:1.16}),hm,-0.05,0,0); }
      add(shell(hr,{r:1.12,phiStart:BACK-1.25,phiLength:2.5,thetaStart:0.3,thetaLength:Math.PI*0.68,amp:0.12,wave:5,noise:0.03,yScale:1.16}),hm,0.05,0,0);
      for(const s of [-1,1]){ const fs=new THREE.Mesh(lathe([[0.001,0],[0.03*k,0],[0.036*k,-0.16*k],[0.022*k,-0.3*k],[0.001,-0.32*k]],12),hm2); fs.position.set(s*hr*0.95,-hr*0.2,hr*0.3); fs.rotation.z=s*0.08; g.add(fs); } }
    mergeStatic(g); return g;
  }

  // ---- 靜態網格合併（減少 draw call）：同材質、非動態子物件合併成單一 Mesh ----
  function mergeStatic(group,opts){ opts=opts||{}; group.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(group.matrixWorld).invert(); const byMat=new Map();
    group.traverse(o=>{ if(o===group) return; if(opts.direct&&o.parent!==group) return; if(!o.isMesh||o.isSprite||o.isPoints||o.isSkinnedMesh) return; if(!o.visible||!o.material||o.material.visible===false||Array.isArray(o.material)) return; let p=o; while(p&&p!==group){ if(p.userData&&p.userData.dyn) return; p=p.parent; } const g=o.geometry; if(!g||!g.attributes.position) return; const key=o.material.uuid+(o.castShadow?'s':'')+(o.receiveShadow?'r':''); let e=byMat.get(key); if(!e){ e={mat:o.material,items:[],cs:o.castShadow,rs:o.receiveShadow}; byMat.set(key,e); } e.items.push(o); });
    let merged=0; const m4=new THREE.Matrix4(); for(const e of byMat.values()){ if(e.items.length<(opts.min||2)) continue; let total=0; const parts=[]; for(const o of e.items){ const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); m4.multiplyMatrices(inv,o.matrixWorld); g.applyMatrix4(m4); parts.push(g); total+=g.attributes.position.count; }
      const hasCol=parts.some(g=>g.attributes.color); const colSize=hasCol?(parts.find(g=>g.attributes.color).attributes.color.itemSize):0; const pos=new Float32Array(total*3), nor=new Float32Array(total*3), uv=new Float32Array(total*2); const col=hasCol?new Float32Array(total*colSize).fill(1):null; let off=0; for(const g of parts){ const n=g.attributes.position.count; pos.set(g.attributes.position.array,off*3); if(g.attributes.normal) nor.set(g.attributes.normal.array,off*3); if(g.attributes.uv) uv.set(g.attributes.uv.array,off*2); if(col&&g.attributes.color){ const ca=g.attributes.color; if(ca.itemSize===colSize&&ca.array instanceof Float32Array) col.set(ca.array,off*colSize); else { for(let i=0;i<n;i++) for(let c=0;c<colSize;c++) col[(off+i)*colSize+c]=c<ca.itemSize?ca.getComponent(i,c):1; } } off+=n; g.dispose(); }
      const mg=new THREE.BufferGeometry(); mg.setAttribute('position',new THREE.BufferAttribute(pos,3)); mg.setAttribute('normal',new THREE.BufferAttribute(nor,3)); mg.setAttribute('uv',new THREE.BufferAttribute(uv,2)); if(col) mg.setAttribute('color',new THREE.BufferAttribute(col,colSize)); mg.computeBoundingSphere(); const m=new THREE.Mesh(mg,e.mat); m.castShadow=e.cs; m.receiveShadow=e.rs; m.userData.merged=true; group.add(m); for(const o of e.items) o.parent.remove(o); merged+=e.items.length; }
    return merged; }
  // ---- 表情 ----
  function setExpr(h,expr){ const P=h.userData.parts; h.userData.anim.expr=expr; const f=h.userData.spec.sex==='f'; P.lips.material.map=lipTex({expr,color:f?'#c27a78':'#b9756c'}); P.lips.material.needsUpdate=true; const worried=expr==='worried', up=expr==='surprise'; const bc=shade(h.userData.spec.hair.color,0.05); for(const b of [P.browL,P.browR]){ b.material.map=browTex({color:bc,thick:h.userData.spec.face.brow==='thick',sharp:h.userData.spec.face.brow==='sharp'&&!worried,worried,up}); b.material.needsUpdate=true; } for(const e of [P.eyeL,P.eyeR]){ const u=e.userData; u.open.visible=expr!=='laugh'; u.happy.visible=expr==='laugh'; u.closed.visible=false; } }
  // ---- 動畫 ----
  const V=new THREE.Vector3();
  function animate(h,dt,st){ const a=h.userData.anim, P=h.userData.parts, k=h.userData.k; a.t+=dt; const pose=st.pose||'idle'; const spd=st.speed||0;
    a.blink-=dt; if(a.blink<=0){ a.blink=2.8+Math.random()*3.2; a.blinkT=0.11; } if(a.blinkT>0){ a.blinkT-=dt; if(a.expr!=='laugh') for(const e of [P.eyeL,P.eyeR]){ e.userData.open.visible=false; e.userData.closed.visible=true; } } else if(a.expr!=='laugh') for(const e of [P.eyeL,P.eyeR]){ e.userData.open.visible=true; e.userData.closed.visible=false; }
    const L=P.legL,R=P.legR,AL=P.armL,AR=P.armR; const set=(o,x,y,z)=>{ o.rotation.x=x; o.rotation.y=y||0; o.rotation.z=z||0; };
    const hipY=0.93*k;
    if(pose==='walk'||pose==='run'){ const run=pose==='run'; const stride=run?1.0:0.62; const freq=(run?2.2:1.75)*Math.max(0.5,spd/(run?4.2:1.45)); a.phase+=dt*Math.PI*2*freq; const s=Math.sin(a.phase), c=Math.cos(a.phase);
      set(L.hip,s*stride,0,0.02); set(R.hip,-s*stride,0,-0.02); L.knee.rotation.x=Math.max(0,-c)*(run?1.6:0.95)*0.9+0.08; R.knee.rotation.x=Math.max(0,c)*(run?1.6:0.95)*0.9+0.08; L.ankle.rotation.x=-Math.max(0,-c)*0.35; R.ankle.rotation.x=-Math.max(0,c)*0.35;
      set(AL.sh,-s*stride*0.8,0,0.1); set(AR.sh,s*stride*0.8,0,-0.1); AL.elbow.rotation.x=-(run?1.3:0.35)-Math.max(0,s)*0.25; AR.elbow.rotation.x=-(run?1.3:0.35)-Math.max(0,-s)*0.25;
      P.pelvis.position.y=hipY+Math.abs(c)*(run?0.035:0.018); P.pelvis.rotation.z=s*0.035; P.pelvis.rotation.y=-s*0.06; P.torso.rotation.y=s*0.1; P.torso.rotation.x=run?0.15:0.03; P.chest.rotation.x=0; P.head.rotation.x=-(run?0.08:0.0); P.head.rotation.y=-s*0.03; P.head.rotation.z=0; }
    else if(pose==='sit'||pose==='read'){ set(L.hip,-1.5,0,-0.06); set(R.hip,-1.5,0,0.06); L.knee.rotation.x=1.45; R.knee.rotation.x=1.45; L.ankle.rotation.x=0; R.ankle.rotation.x=0; P.pelvis.position.y=hipY-0.43*k; P.pelvis.rotation.set(0,0,0); P.torso.rotation.set(0.05,0,0); P.chest.rotation.x=0;
      if(pose==='read'){ set(AL.sh,-0.9,0.35,0.25); set(AR.sh,-0.9,-0.35,-0.25); AL.elbow.rotation.x=-1.2; AR.elbow.rotation.x=-1.2; P.head.rotation.x=0.42+Math.sin(a.t*0.6)*0.02; P.head.rotation.y=0; } else { set(AL.sh,-0.3,0,0.12); set(AR.sh,-0.3,0,-0.12); AL.elbow.rotation.x=-1.1; AR.elbow.rotation.x=-1.1; P.head.rotation.x=Math.sin(a.t*0.7)*0.03; P.head.rotation.y=Math.sin(a.t*0.4)*0.15; } }
    else if(pose==='wave'){ set(L.hip,0.02,0,-0.04); set(R.hip,-0.03,0,0.06); L.knee.rotation.x=0.06; R.knee.rotation.x=0.1; L.ankle.rotation.x=0; R.ankle.rotation.x=0; const g=Math.sin(a.t*7); set(AL.sh,0.05,0,0.12); AL.elbow.rotation.x=-0.2; set(AR.sh,-2.7,0,-0.35+g*0.22); AR.elbow.rotation.x=-0.5-Math.abs(g)*0.25; P.pelvis.position.y=hipY; P.pelvis.rotation.set(0,0,0.02); P.torso.rotation.set(0.02,0,-0.03); P.head.rotation.x=-0.05; P.head.rotation.y=Math.sin(a.t*1.2)*0.05; P.head.rotation.z=0.06; }
    else if(pose==='talk'){ set(L.hip,0.02,0,-0.04); set(R.hip,-0.03,0,0.06); L.knee.rotation.x=0.06; R.knee.rotation.x=0.1; L.ankle.rotation.x=0; R.ankle.rotation.x=0; const g=Math.sin(a.t*2.2); set(AL.sh,-0.55+g*0.12,0.2,0.25); set(AR.sh,-0.05,0,-0.1); AL.elbow.rotation.x=-1.5+g*0.1; AR.elbow.rotation.x=-0.45; P.pelvis.position.y=hipY; P.pelvis.rotation.set(0,0,0.02); P.torso.rotation.set(0.02,Math.sin(a.t*1.1)*0.04,0); P.head.rotation.x=Math.sin(a.t*1.4)*0.04; P.head.rotation.y=Math.sin(a.t*0.8)*0.08; }
    else { // idle：重心在一腳、微呼吸、偶爾看四周
      const br=Math.sin(a.t*1.5); const w=Math.sin(a.t*0.22); set(L.hip,0.0,0,-0.03-w*0.02); set(R.hip,0.02,0,0.05+w*0.02); L.knee.rotation.x=0.04; R.knee.rotation.x=0.1; L.ankle.rotation.x=0; R.ankle.rotation.x=0; const pockets=st.handsPockets; set(AL.sh,pockets?0.15:br*0.015,pockets?0.4:0,0.12); set(AR.sh,pockets?0.15:-br*0.015,pockets?-0.4:0,-0.12); AL.elbow.rotation.x=pockets?-0.9:-0.18; AR.elbow.rotation.x=pockets?-0.9:-0.18; P.pelvis.position.y=hipY-0.006; P.pelvis.rotation.set(0,0,0.025+w*0.01); P.torso.rotation.set(0.01+br*0.008,0,-0.02); P.chest.rotation.x=br*0.008; P.head.rotation.x=br*0.01; P.head.rotation.y=Math.sin(a.t*0.3)*0.18; P.head.rotation.z=0.02; }
    if(st.lookAt){ V.copy(st.lookAt).sub(h.position); const ang=Math.atan2(V.x,V.z)-h.rotation.y; let d=((ang+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; d=Math.max(-0.75,Math.min(0.75,d)); P.head.rotation.y=d*0.8; P.torso.rotation.y=d*0.2; }
    const pony=P.head.userData.pony; if(pony){ const segs=pony.userData.segs; const sw=(pose==='walk'||pose==='run')?Math.sin(a.phase*1.0)*(pose==='run'?0.35:0.18):Math.sin(a.t*1.3)*0.03; const bob=(pose==='walk'||pose==='run')?Math.abs(Math.cos(a.phase))*(pose==='run'?0.5:0.22):0; pony.rotation.x=0.18+bob*0.35; for(let i=0;i<segs.length;i++){ const t=(i+1)/segs.length; segs[i].rotation.z=sw*t*0.5; segs[i].rotation.x=-0.02+0.06*t+bob*0.2*t; } }
    a.pose=pose; }
  return {CAST,build,animate,setExpr,M,G,lathe,shade,light,grad,mergeStatic};
})();
