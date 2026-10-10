/* ===== 人物隨身配件（PROPS）：後背包、帆布托特包、細框眼鏡、銀色小耳環、咖啡廳圍裙、吉他袋、判決節錄資料夾 =====
   掛在 VRM 的骨頭上（VRoid 骨頭在 rest pose 沒有旋轉，模型檔空間：+x＝角色右側、-x＝左側、-z＝前方、+z＝後方）。
   形狀用圓角、斜面、布料貼圖做成「看得出是什麼」的物件，不是方塊；顏色與 Character Bible 一致。
   角色資料：CHARACTERS[id].char3d.props = ['backpack'...]；遊戲中可用 CHAR.setProp(人物, 'apron', true/false) 切換（例：芷若在咖啡廳工作時才穿圍裙）。 */
'use strict';
const PROPS = (function(){
  const cache={};
  function canvasTex(key,w,h,fn){ if(cache['t'+key]) return cache['t'+key]; const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); fn(x,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.RepeatWrapping; cache['t'+key]=t; return t; }
  // 和 MToon 人物接近的卡通明暗（三段漸層）
  function gradTex(){ if(cache.grad) return cache.grad; const d=new Uint8Array([90,170,255]); const t=new THREE.DataTexture(d,3,1,THREE.RedFormat); t.minFilter=t.magFilter=THREE.NearestFilter; t.needsUpdate=true; cache.grad=t; return t; }
  function fabric(key,base,o){ o=o||{}; return canvasTex('fab'+key+base,128,128,(x,w,h)=>{ x.fillStyle=base; x.fillRect(0,0,w,h); for(let i=0;i<1600;i++){ x.fillStyle=Math.random()<0.5?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'; x.fillRect(Math.random()*w,Math.random()*h,1,1+Math.random()*2); } if(o.weave){ x.strokeStyle='rgba(0,0,0,0.06)'; for(let i=0;i<w;i+=3){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,h); x.stroke(); } } if(o.zip){ x.strokeStyle='rgba(20,20,20,0.6)'; x.lineWidth=2; x.beginPath(); x.moveTo(8,o.zip); x.quadraticCurveTo(w/2,o.zip-14,w-8,o.zip); x.stroke(); } if(o.patch){ x.fillStyle=o.patch; x.fillRect(w*0.38,h*0.58,w*0.24,h*0.12); } }); }
  function mat(key,color,map,o){ const k='m'+key+color; if(cache[k]) return cache[k]; /* 有布紋貼圖時，貼圖本身已經是這個顏色：材質顏色用白色，否則顏色會乘兩次（深色的吉他袋、後背包變成全黑剪影） */ const m=new THREE.MeshToonMaterial(Object.assign({color:new THREE.Color(map?'#ffffff':color),map:map||null,gradientMap:gradTex()},o||{})); cache[k]=m; return m; }
  // 圓角方塊：先做細分方塊，再把頂點往內縮後沿法線推出（corner radius r）
  function roundBox(w,h,d,r,seg){ seg=seg||4; const g=new THREE.BoxGeometry(w,h,d,seg,seg,seg); const p=g.attributes.position; const v=new THREE.Vector3(), c=new THREE.Vector3(); const hw=w/2-r, hh=h/2-r, hd=d/2-r; for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(Math.max(-hw,Math.min(hw,v.x)),Math.max(-hh,Math.min(hh,v.y)),Math.max(-hd,Math.min(hd,v.z))); const n=v.clone().sub(c); if(n.lengthSq()<1e-10) continue; n.normalize().multiplyScalar(r); p.setXYZ(i,c.x+n.x,c.y+n.y,c.z+n.z); } g.computeVertexNormals(); return g; }
  function tube(points,r,col){ const curve=new THREE.CatmullRomCurve3(points.map(q=>new THREE.Vector3(q[0],q[1],q[2]))); return new THREE.Mesh(new THREE.TubeGeometry(curve,24,r,6,false),col); }
  function strapBand(points,w,col){ // 扁平背帶：沿曲線的細長扁管
    const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(q=>new THREE.Vector3(q[0],q[1],q[2]))),28,w,4,false); g.scale(1,1,1); return new THREE.Mesh(g,col); }

  // ---- 後背包（祐廷：深灰黑；語彤：黑）----
  function backpack(o){ o=o||{}; const g=new THREE.Group(); const base=o.color||'#2c2e33'; const body=mat('bp',base,fabric('bp',base,{zip:34,patch:o.patch||null})); const dark=mat('bpd',shadeHex(base,0.7));
    const b=new THREE.Mesh(roundBox(0.30,0.40,0.14,0.05,5),body); b.position.set(0,-0.06,0.15); g.add(b);
    const pk=new THREE.Mesh(roundBox(0.24,0.17,0.06,0.03,4),body); pk.position.set(0,-0.15,0.235); g.add(pk);
    const top=tube([[-0.04,0.14,0.14],[0,0.17,0.14],[0.04,0.14,0.14]],0.008,dark); g.add(top);
    for(const s of [-1,1]){ g.add(strapBand([[s*0.08,0.12,0.09],[s*0.1,0.16,0.02],[s*0.11,0.14,-0.07],[s*0.12,0.02,-0.1],[s*0.12,-0.12,-0.05],[s*0.1,-0.2,0.08]],0.012,dark)); }
    return g; }
  // ---- 帆布托特包（沈以安：米白帆布，掛右肩，包身貼著右腰）----
  // 包身是「軟布袋」：細分方塊，厚度往邊緣收（中間鼓、邊緣扁），底部略寬；背帶從包口兩側繞過右肩
  function tote(o){ o=o||{}; const g=new THREE.Group(); const base=o.color||'#ece3d2'; const cv=mat('tote',base,fabric('tote',base,{weave:true}));
    const W=0.31, H=0.34, D=0.07; const geo=new THREE.BoxGeometry(W,H,D,10,10,2); const p=geo.attributes.position;
    // 帆布袋要軟：上緣在兩條提帶之間往下垂、底部被裝的東西撐得比較鼓、下方兩角是圓的、布面有幾道淺皺褶（舊版是完美長方形，看起來像紙板）
    for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i); const u=x/(W/2), v=(y+H/2)/H; const puff=Math.max(0.12,(1-u*u*0.85)*(0.42+0.58*Math.sin(Math.PI*Math.min(1,v*1.05)))*(1.12-0.25*v));
      let nx=x*(1+0.07*(1-v))+Math.sign(x)*0.006*Math.sin(Math.PI*v), ny=y; if(v>0.82) ny-=0.022*(1-u*u)*((v-0.82)/0.18);
      const cu=Math.max(0,Math.abs(u)-0.72)/0.28, cb=Math.max(0,0.16-v)/0.16, k=cu*cb; if(k>0){ nx-=Math.sign(x)*0.022*k; ny+=0.02*k; }
      const crease=0.0035*Math.sin(u*5.2+v*3.1)+0.0025*Math.sin(v*9.0-u*2.0)+0.004*Math.exp(-Math.pow((u*0.8+v-0.75)/0.08,2));
      p.setXYZ(i,nx,ny,z*puff+Math.sign(z)*crease); }
    geo.computeVertexNormals(); const bag=new THREE.Mesh(geo,cv); bag.position.set(0.165,-0.5,0.035); bag.rotation.set(0,-0.25,0.04); g.add(bag);
    const strap=mat('totes',shadeHex(base,0.86)); for(const dz of [-0.022,0.022]) g.add(strapBand([[0.12+dz*0.4,-0.34,0.04+dz],[0.135,-0.16,0.02+dz*0.8],[0.145,0.04,0.0+dz*0.6],[0.135,0.155,0.01+dz*0.4],[0.11,0.17,0.035]],0.009,strap));
    return g; }
  // ---- 細框眼鏡（林芷若）----
  function glasses(o){ o=o||{}; const g=new THREE.Group(); const m=mat('gl',o.color||'#3a302a',null); const lw=0.05, lh=0.036, r=0.012, t=0.0028;
    function ring(cx){ const s=new THREE.Shape(); const x0=cx-lw/2, y0=-lh/2; s.moveTo(x0+r,y0); s.lineTo(x0+lw-r,y0); s.quadraticCurveTo(x0+lw,y0,x0+lw,y0+r); s.lineTo(x0+lw,y0+lh-r); s.quadraticCurveTo(x0+lw,y0+lh,x0+lw-r,y0+lh); s.lineTo(x0+r,y0+lh); s.quadraticCurveTo(x0,y0+lh,x0,y0+lh-r); s.lineTo(x0,y0+r); s.quadraticCurveTo(x0,y0,x0+r,y0); const hole=new THREE.Path(); const i=t; hole.moveTo(x0+r,y0+i); hole.lineTo(x0+lw-r,y0+i); hole.quadraticCurveTo(x0+lw-i,y0+i,x0+lw-i,y0+r); hole.lineTo(x0+lw-i,y0+lh-r); hole.quadraticCurveTo(x0+lw-i,y0+lh-i,x0+lw-r,y0+lh-i); hole.lineTo(x0+r,y0+lh-i); hole.quadraticCurveTo(x0+i,y0+lh-i,x0+i,y0+lh-r); hole.lineTo(x0+i,y0+r); hole.quadraticCurveTo(x0+i,y0+i,x0+r,y0+i); s.holes.push(hole); return new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:0.002,bevelEnabled:false}),m); }
    const sep=o.ipd||0.084; g.add(ring(-sep/2)); g.add(ring(sep/2));
    const bridge=tube([[-sep/2+lw/2,0.006,0.001],[0,0.012,-0.004],[sep/2-lw/2,0.006,0.001]],0.0015,m); g.add(bridge);
    // 鏡腳往耳朵（後方）：整組最後轉 180°，所以這裡往 -z 畫（舊版往 +z，轉完變成從臉前面伸出去，側面看得到兩根細線）
    for(const s of [-1,1]) g.add(tube([[s*(sep/2+lw/2),0.008,-0.001],[s*(sep/2+lw/2+0.006),0.008,-0.03],[s*(sep/2+lw/2+0.004),0.0,-0.1]],0.0016,m));
    const lens=new THREE.MeshBasicMaterial({color:0xdde8ef,transparent:true,opacity:0.12,depthWrite:false}); for(const cx of [-sep/2,sep/2]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(lw-0.006,lh-0.006),lens); p.position.set(cx,0,0.001); g.add(p); }
    g.rotation.y=Math.PI; // 模型檔空間前方是 -z：鏡片正面朝 -z
    return g; }
  // ---- 銀色小耳環 ----
  function earrings(o){ const g=new THREE.Group(); const m=new THREE.MeshStandardMaterial({color:0xd9dde2,metalness:0.9,roughness:0.25}); for(const s of [-1,1]){ const hoop=new THREE.Mesh(new THREE.TorusGeometry(0.006,0.0013,6,14),m); hoop.position.set(s*(o.dx||0.074),-0.012,0); hoop.rotation.y=Math.PI/2; g.add(hoop); const stud=new THREE.Mesh(new THREE.SphereGeometry(0.0025,8,6),m); stud.position.set(s*(o.dx||0.074),-0.004,0); g.add(stud); } return g; }
  // ---- 咖啡廳圍裙（林芷若工作時）----
  function apron(o){ o=o||{}; const g=new THREE.Group(); const base=o.color||'#6b4a34'; const cv=mat('apron',base,fabric('apron',base,{weave:true})); cv.side=THREE.DoubleSide;
    const geo=new THREE.CylinderGeometry(0.175,0.21,0.62,16,4,true,Math.PI-0.85,1.7); const ap=new THREE.Mesh(geo,cv); ap.position.set(0,-0.2,0); g.add(ap); // 圍在身體前方（-z）
    const bib=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.16,0.24,12,2,true,Math.PI-0.6,1.2),cv); bib.position.set(0,0.2,0); g.add(bib);
    const pocket=new THREE.Mesh(roundBox(0.18,0.08,0.008,0.003,2),mat('apronp',shadeHex(base,0.85))); pocket.position.set(0,-0.14,-0.205); g.add(pocket);
    const tie=mat('aprt',shadeHex(base,0.8)); g.add(tube([[-0.12,0.3,-0.07],[-0.07,0.42,-0.02],[0,0.47,0.04],[0.07,0.42,-0.02],[0.12,0.3,-0.07]],0.006,tie)); g.add(tube([[-0.19,0.08,-0.05],[-0.17,0.08,0.08],[0,0.08,0.15],[0.17,0.08,0.08],[0.19,0.08,-0.05]],0.006,tie));
    return g; }
  // ---- 吉他袋（高子晴：黑色，背在背上）----
  function guitarBag(o){ o=o||{}; const g=new THREE.Group(); const base=o.color||'#1e1f22'; const cv=mat('gtr',base,fabric('gtr',base,{zip:20}));
    const s=new THREE.Shape(); s.moveTo(0,-0.5); s.bezierCurveTo(0.2,-0.5,0.21,-0.3,0.15,-0.2); s.bezierCurveTo(0.11,-0.14,0.16,-0.04,0.12,0.06); s.lineTo(0.05,0.12); s.lineTo(0.045,0.5); s.lineTo(-0.045,0.5); s.lineTo(-0.05,0.12); s.lineTo(-0.12,0.06); s.bezierCurveTo(-0.16,-0.04,-0.11,-0.14,-0.15,-0.2); s.bezierCurveTo(-0.21,-0.3,-0.2,-0.5,0,-0.5);
    const geo=new THREE.ExtrudeGeometry(s,{depth:0.09,bevelEnabled:true,bevelThickness:0.025,bevelSize:0.02,bevelSegments:3,curveSegments:10}); geo.translate(0,0,-0.045);
    const bag=new THREE.Mesh(geo,cv); bag.position.set(0.02,-0.12,0.2); bag.rotation.z=-0.18; g.add(bag);
    const dark=mat('gtrs','#121214'); g.add(strapBand([[0.12,0.13,0.12],[0.12,0.16,0.0],[0.11,0.1,-0.11],[-0.02,-0.12,-0.13],[-0.15,-0.32,-0.04],[-0.13,-0.4,0.14]],0.012,dark));
    return g; }
  // ---- 判決節錄資料夾（溫書瑀：深藍資料夾＋白紙）----
  function folder(o){ o=o||{}; const g=new THREE.Group(); const cv=mat('fold',o.color||'#24324a',null); const f=new THREE.Mesh(roundBox(0.31,0.012,0.23,0.004,2),cv); g.add(f); const paper=new THREE.Mesh(new THREE.BoxGeometry(0.29,0.008,0.215),mat('paper','#f4f1ea',null)); paper.position.set(0.004,0.004,0.006); g.add(paper); return g; }

  // ---- 髮圈（溫書瑀的低馬尾：綁點在後頸，位置由 tools/vroid_build.py 的 low_ponytail 算出）----
  function hairtie(o){ o=o||{}; const g=new THREE.Group(); const m=mat('htie',o.color||'#2a1d17',null); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.019,0.0065,8,20),m); ring.rotation.x=Math.PI/2-0.25; ring.scale.set(1.15,1,0.85); g.add(ring); return g; }

  function shadeHex(hex,f){ const c=new THREE.Color(hex); c.multiplyScalar(f); return '#'+c.getHexString(); }
  // 掛到哪根骨頭、位置（模型檔空間、相對骨頭）
  const DEF={
    backpack:{bone:'upperChest',make:backpack,pos:[0,0,0]},
    tote:{bone:'upperChest',make:tote,pos:[0,0,0]},
    glasses:{bone:'head',make:glasses,eyes:true},
    earrings:{bone:'head',make:earrings,ears:true},
    apron:{bone:'spine',make:apron,pos:[0,0,0],hidden:true},
    guitar:{bone:'upperChest',make:guitarBag,pos:[0,0,0]},
    folder:{bone:'leftHand',make:folder,pos:[-0.09,-0.02,0.0],rot:[0,0,0]},
    hairtie:{bone:'head',make:hairtie,pos:[0,-0.025,0.116]},
  };
  // 依骨頭與眼睛位置把配件掛上去；回傳 {name: object}
  function attach(vrm,list,opts){ opts=opts||{}; const out={}; const H=vrm.humanoid; for(const item of list){ const name=typeof item==='string'?item:item.name; const d=DEF[name]; if(!d) continue; const bone=H.getRawBoneNode(d.bone)||H.getRawBoneNode('chest')||H.getRawBoneNode('head'); if(!bone) continue; const o=d.make(typeof item==='object'?item:{}); o.name='prop:'+name; o.traverse(m=>{ if(m.isMesh){ m.castShadow=!!opts.shadow; m.frustumCulled=false; } });
      if(d.eyes||d.ears){ const eL=H.getRawBoneNode('leftEye'), eR=H.getRawBoneNode('rightEye'); bone.updateWorldMatrix(true,false); const inv=new THREE.Matrix4().copy(bone.matrixWorld).invert(); const a=new THREE.Vector3(), b=new THREE.Vector3(); if(eL&&eR){ eL.getWorldPosition(a); eR.getWorldPosition(b); a.applyMatrix4(inv); b.applyMatrix4(inv); } else { a.set(-0.03,0.06,-0.03); b.set(0.03,0.06,-0.03); } const mid=a.clone().add(b).multiplyScalar(0.5); const s=1/Math.max(1e-4,new THREE.Vector3().setFromMatrixScale(bone.matrixWorld).x); if(d.eyes){ o.position.set(mid.x,mid.y-0.002*s,mid.z-0.068*s); o.scale.setScalar(s); } else { o.position.set(mid.x,mid.y-0.045*s,mid.z+0.035*s); o.scale.setScalar(s); } /* VRoid 的眼睛骨頭在眼球中心，臉表面在前面約 6 cm（模型檔空間前方是 -z）：眼鏡要放在臉前面才看得到 */ }
      else { const p=d.pos||[0,0,0]; o.position.set(p[0],p[1],p[2]); if(d.rot) o.rotation.set(d.rot[0],d.rot[1],d.rot[2]); }
      if(d.hidden&&!(typeof item==='object'&&item.show)) o.visible=false;
      bone.add(o); out[name]=o; }
    return out; }
  function detach(props){ for(const k in props){ const o=props[k]; if(o&&o.parent) o.parent.remove(o); } }
  return {attach,detach,DEF};
})();
