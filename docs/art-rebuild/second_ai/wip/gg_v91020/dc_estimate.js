// 公館 GLB 在 street_west／arcade 鏡頭的 draw call 估計（主畫面視錐＋陰影 ±22 m）。用法：node dc.js <devwt> <glb> [extraNoShadowRegex]
const fs=require('fs'), path=require('path'), vm=require('vm'); const ROOT=process.argv[2]; global.window=global; global.self=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8').replace(/^const (\w+)\s*=/m,'globalThis.$1='));
const b=fs.readFileSync(process.argv[3]), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], ct=a.componentType, cs={5126:4,5125:4,5123:2,5121:1,5122:2,5120:1}[ct], st=bv.byteStride||nc*cs, out=new Float32Array(a.count*nc);
  for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++){ const p=o+k*st+c*cs; out[k*nc+c]=ct===5126?bin.readFloatLE(p):ct===5125?bin.readUInt32LE(p):ct===5123?bin.readUInt16LE(p):ct===5122?bin.readInt16LE(p):ct===5120?bin.readInt8(p):bin.readUInt8(p); } return out; };
const NOSH=new RegExp('^(wz_menu_|wz_in_|wz_shop_notes|wz_shutter|cafe_int_|cafe_room_dark|cafe_curtain|ext_glass_lit|wz_room_lit|jp_shoji|cafe_leaf_|cafe_glass|cafe_win_glass|cafe_lampglass|cafe_bulb|cafe_books|cafe_vc_'+(process.argv[4]?'|'+process.argv[4]:'')+')');
const items=[];
const walk=(i,M)=>{ const nd=j.nodes[i]; const m=new THREE.Matrix4(); if(nd.matrix) m.fromArray(nd.matrix); else m.compose(new THREE.Vector3(...(nd.translation||[0,0,0])),new THREE.Quaternion(...(nd.rotation||[0,0,0,1])),new THREE.Vector3(...(nd.scale||[1,1,1])));
  const W=M.clone().multiply(m);
  if(nd.mesh!=null){ const inst=nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing;
    for(const pr of j.meshes[nd.mesh].primitives){ const a=j.accessors[pr.attributes.POSITION]; const bb=new THREE.Box3(new THREE.Vector3(...a.min),new THREE.Vector3(...a.max));
      let box; if(inst){ const T=acc(inst.attributes.TRANSLATION); box=new THREE.Box3(); for(let k=0;k<T.length;k+=3) box.union(bb.clone().translate(new THREE.Vector3(T[k],T[k+1],T[k+2]))); box.applyMatrix4(W); }
      else box=bb.clone().applyMatrix4(W);
      const mn=pr.material!=null?j.materials[pr.material].name:''; items.push({name:nd.name||'',mat:mn,box,inst:!!inst,tris:(pr.indices!=null?j.accessors[pr.indices].count:a.count)/3}); } }
  for(const c of nd.children||[]) walk(c,W); };
for(const r of j.scenes[j.scene||0].nodes) walk(r,new THREE.Matrix4());
// glTF 座標＝遊戲座標（Y 上）
const VIEWS={street_west:[[-22,1.7,11],[-62,4.5,19]],arcade:[[-18,1.6,20.6],[-34,2.2,20.6]],from_gate:[[2,1.7,-36],[-4,7,19]],lane:[[-71,1.7,9],[-71,5.5,32]]};
const P=[-30,14];
for(const [k,[e,l]] of Object.entries(VIEWS)){ const cam=new THREE.PerspectiveCamera(46,390/844,0.1,200); cam.position.set(...e); cam.lookAt(...l); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
  let main=0, sh=0; const mats={};
  const sbox=new THREE.Box3(new THREE.Vector3(P[0]-22,-50,P[1]-22),new THREE.Vector3(P[0]+22,200,P[1]+22));
  for(const it of items){ if(fr.intersectsBox(it.box)){ main++; mats[it.mat]=(mats[it.mat]||0)+1; }
    const cast=!it.inst&&!/FACE/.test(it.name)&&!/^NOSHADOW_/.test(it.name)&&!NOSH.test(it.mat); if(cast&&sbox.intersectsBox(it.box)) sh++; }
  if(process.env.V){ const cs={}; for(const it of items){ const cast=!it.inst&&!/FACE/.test(it.name)&&!/^NOSHADOW_/.test(it.name)&&!NOSH.test(it.mat); if(cast&&sbox.intersectsBox(it.box)) cs[it.mat]=(cs[it.mat]||0)+1; } console.log("SHADOW",JSON.stringify(cs)); }
  console.log(k,"main",main,'shadow',sh,'total',main+sh); if(process.env.V) console.log(JSON.stringify(mats)); }
