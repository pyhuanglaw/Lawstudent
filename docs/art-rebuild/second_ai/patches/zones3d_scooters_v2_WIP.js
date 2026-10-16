  /* 機車 v2（LAWWW2-B，tools/blender/env_second/scooters_v2.py；使用者 2026-10-16：「機車都只是同個模板換顏色，太假了……路上不會全部都一樣，不要只改顏色」）：
     scooter.glb 有 12 款（節點 scooter_<代號>：國民通勤兩款、運動型、電動、復古圓弧、50cc 舊款、大型速克達、方塊越野、彎樑、外送箱、掛安全帽、機車罩）＋每款一個遠處用的簡化版 scooter_<代號>_lod1；
     節點的 extras（userData）：weight＝街上的比例、palette＝這一型常見的車殼顏色。
     每台照自己的位置挑一款（照 weight）、從那一款的配色挑顏色（位置算的雜湊：每次進來都一樣）；
     每一段（公館照 grp、溫州街照位置每 20 m 一段、路的兩側分開）合成一個網格、一個材質（頂點色；粗糙度／金屬度用 3×1 的查表貼圖：車殼／塑膠橡膠／金屬），
     外面包 THREE.LOD：離鏡頭 SC_LOD_D 公尺以外換簡化版（約 600 個三角形）。看不到的那一段整段剔除。
     沒有新節點（舊的 scooter.glb）時照舊用 scooter_a／scooter_b（attachWzScootersAB）。 */
  const SC_LOD_D=16;
  let scMat=null;
  function scooterMat(){ if(scMat) return scMat;
    const d=new Uint8Array([0,82,0,255, 0,140,0,255, 0,82,115,255]);   /* G＝粗糙度（0.32／0.55／0.32）、B＝金屬度（0／0／0.45）：和 GLB 的三個材質一樣 */
    const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat); t.needsUpdate=true;
    scMat=new THREE.MeshStandardMaterial({vertexColors:true,roughnessMap:t,metalnessMap:t,roughness:1,metalness:1}); scMat.name='scooter_merged'; return scMat; }
  function scMerge(items,center){   /* items：[{node, M4（這台車的世界矩陣，已轉成車頭朝 +x）, color}] → 一個 BufferGeometry（位置相對 center） */
    const P=[],N=[],C=[],U=[],I=[]; let base=0; const v=new THREE.Vector3(), n=new THREE.Vector3(), nm=new THREE.Matrix3(), col=new THREE.Color(), M=new THREE.Matrix4(), inv=new THREE.Matrix4(), loc=new THREE.Matrix4();
    for(const it of items){ inv.copy(it.node.matrixWorld).invert(); col.set(it.color);
      it.node.traverse(o=>{ if(!o.isMesh) return; const g=o.geometry, mn=o.material.name, slot=mn==='scooter_paint'?0:mn==='scooter_metal'?2:1;
        M.multiplyMatrices(it.M4,loc.multiplyMatrices(inv,o.matrixWorld)); nm.getNormalMatrix(M);
        const pa=g.attributes.position, na=g.attributes.normal, ca=g.attributes.color, u=(slot+0.5)/3, mc=o.material.color;
        for(let k=0;k<pa.count;k++){ v.fromBufferAttribute(pa,k).applyMatrix4(M); P.push(v.x-center.x,v.y-center.y,v.z-center.z); n.fromBufferAttribute(na,k).applyMatrix3(nm).normalize(); N.push(n.x,n.y,n.z);
          if(slot===0) C.push(col.r,col.g,col.b); else if(ca) C.push(ca.getX(k),ca.getY(k),ca.getZ(k)); else C.push(mc.r,mc.g,mc.b); U.push(u,0.5); }
        if(g.index){ const ix=g.index; for(let k=0;k<ix.count;k++) I.push(base+ix.getX(k)); } else for(let k=0;k<pa.count;k++) I.push(base+k);
        base+=pa.count; }); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));
    geo.setIndex(base>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1)); geo.computeBoundingSphere(); return geo; }
  function attachWzScooters(g,scG,list,root,name){ if(!list.length) return 0; root.updateMatrixWorld(true);
    const V=[]; root.traverse(o=>{ const m=/^scooter_(S\w+)$/.exec(o.name); if(!m||/_lod1$/.test(o.name)||!o.userData||!(o.userData.weight>0)) return; let pal=[]; try{ pal=JSON.parse(o.userData.palette||'[]'); }catch(e){}
      V.push({code:m[1],node:o,lod:root.getObjectByName(o.name+'_lod1')||o,w:+o.userData.weight,pal}); });
    if(!V.length) return attachWzScootersAB(g,scG,list,root,name);
    const W=V.reduce((a,b)=>a+b.w,0), fix=new THREE.Matrix4().makeRotationY(-Math.PI/2), out=new THREE.Group(); out.name=name||'wz_scooters_glb';
    const hash=(x,z,k)=>{ const t=Math.sin(x*12.9898+z*78.233+k*37.719)*43758.5453; return t-Math.floor(t); };
    const grps=new Map(), pick={};
    list.forEach(s=>{ s.o.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(s.o.matrixWorld); const gk=s.grp||(Math.floor((p.x+100)/20)+(p.z<0?'n':'s'));
      let r=hash(p.x,p.z,1)*W, v=V[V.length-1]; for(const c of V){ if((r-=c.w)<=0){ v=c; break; } }
      const col=v.pal.length?v.pal[Math.floor(hash(p.x,p.z,2)*v.pal.length)]:s.color; pick[v.code]=(pick[v.code]||0)+1;
      if(!grps.has(gk)) grps.set(gk,[]); grps.get(gk).push({p,v,col,M4:new THREE.Matrix4().multiplyMatrices(s.o.matrixWorld,fix)}); });
    for(const [gk,L] of grps){ const c=new THREE.Vector3(); L.forEach(e=>c.add(e.p)); c.divideScalar(L.length);
      const near=new THREE.Mesh(scMerge(L.map(e=>({node:e.v.node,M4:e.M4,color:e.col})),c),scooterMat()), far=new THREE.Mesh(scMerge(L.map(e=>({node:e.v.lod,M4:e.M4,color:e.col})),c),scooterMat());
      for(const m of [near,far]){ m.castShadow=false; m.receiveShadow=true; }
      const lod=new THREE.LOD(); lod.position.copy(c); lod.addLevel(near,0); lod.addLevel(far,SC_LOD_D); lod.name='scooters_'+gk; lod.userData.scGroup=gk; out.add(lod); }
    out.userData.scPick=pick;   /* 每一款擺了幾台（測試、截圖紀錄用） */
    scooterShadows(out,list,fix); scG.visible=false; g.add(out); return list.length; }
  /* 影子：機車不進陰影那一輪，改成每台車底下一片柔和的影子貼片（全部一個 InstancedMesh、一次 draw call） */
  function scooterShadows(out,list,fix){ const tex=W3.canvasTex('wzScooterBlob',64,64,(x,w,h)=>{ const gr=x.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2); gr.addColorStop(0,'rgba(0,0,0,0.6)'); gr.addColorStop(0.55,'rgba(0,0,0,0.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.clearRect(0,0,w,h); x.fillStyle=gr; x.fillRect(0,0,w,h); });
    const geo=new THREE.PlaneGeometry(2.05,0.8); geo.rotateX(-Math.PI/2); geo.translate(0,0.012,0); const bl=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:tex,color:0x000000,transparent:true,depthWrite:false}),list.length); const M4=new THREE.Matrix4();
    list.forEach((s,i)=>{ M4.multiplyMatrices(s.o.matrixWorld,fix); bl.setMatrixAt(i,M4); }); bl.instanceMatrix.needsUpdate=true; bl.computeBoundingSphere(); bl.name='wz_scooter_shadows'; out.add(bl); }
