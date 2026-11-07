const fs=require('fs'),vm=require('vm'),path=require('path'); const ROOT=process.argv[2];
global.window=global; global.self=global; global.navigator={userAgent:'node'}; global.document={createElementNS:()=>({style:{}}),createElement:()=>({style:{},getContext:()=>null})};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (THREE|THREE_JSM)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
const L=new THREE_JSM.GLTFLoader.GLTFLoader();
const load=p=>new Promise((res,rej)=>{ const b=fs.readFileSync(p); L.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'',res,rej); });
(async()=>{ const A=await load(process.argv[3]), B=await load(process.argv[4]);
  const meshes=g=>{ const m={}; g.scene.traverse(o=>{ if(o.isMesh){ let k=o.name, i=1; while(m[k]) k=o.name+'#'+(i++); m[k]=o; } }); return m; };
  const ma=meshes(A), mb=meshes(B); let n=0, posDiff=0, nAng=0, cErr=0, types={}, missing=[], noN=0;
  const v=new THREE.Vector3(), w=new THREE.Vector3(), c1=new THREE.Color(), c2=new THREE.Color();
  for(const k in ma){ const a=ma[k], b=mb[k]; if(!b){ missing.push(k); continue; } n++;
    const pa=a.geometry.attributes.position, pb=b.geometry.attributes.position; for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i); w.fromBufferAttribute(pb,i); posDiff=Math.max(posDiff,v.distanceTo(w)); }
    const na=a.geometry.attributes.normal, nb=b.geometry.attributes.normal; if(na&&!nb){ noN++; if(!b.material.isMeshBasicMaterial) missing.push('normal 拿掉但不是 unlit：'+k); }
    if(na&&nb){ types['normal '+nb.array.constructor.name+(nb.normalized?' norm':'')]=(types['normal '+nb.array.constructor.name+(nb.normalized?' norm':'')]||0)+1; for(let i=0;i<na.count;i++){ v.fromBufferAttribute(na,i).normalize(); w.fromBufferAttribute(nb,i).normalize(); nAng=Math.max(nAng,Math.acos(Math.min(1,Math.max(-1,v.dot(w))))*180/Math.PI); } }
    const ca=a.geometry.attributes.color, cb=b.geometry.attributes.color; if(ca&&cb){ types['color '+cb.array.constructor.name]=(types['color '+cb.array.constructor.name]||0)+1; for(let i=0;i<ca.count;i++){ c1.fromBufferAttribute(ca,i).convertLinearToSRGB(); c2.fromBufferAttribute(cb,i).convertLinearToSRGB(); cErr=Math.max(cErr,Math.abs(c1.r-c2.r),Math.abs(c1.g-c2.g),Math.abs(c1.b-c2.b)); } }
    if(a.material.vertexColors!==b.material.vertexColors) missing.push('vertexColors 不同：'+k); }
  console.log(JSON.stringify({meshes:n, missing, posDiff, normalMaxDeg:+nAng.toFixed(3), colorMaxSrgb255:+(cErr*255).toFixed(3), unlitNoNormal:noN, types}));
})().catch(e=>{ console.error('PARSE FAIL',e); process.exit(1); });
