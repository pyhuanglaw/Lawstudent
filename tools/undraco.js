// 離線把 Draco 壓縮的 glTF 解碼成未壓縮 GLB（Node）。用法：node tools/undraco.js in.gltf out.glb
const fs=require('fs'); const path=require('path');
const DracoDecoderModule=require('/home/claude/assets_src/draco/javascript/draco_decoder_gltf.js');
const [,, inPath, outPath]=process.argv;
const COMP={5120:{T:Int8Array,s:1},5121:{T:Uint8Array,s:1},5122:{T:Int16Array,s:2},5123:{T:Uint16Array,s:2},5125:{T:Uint32Array,s:4},5126:{T:Float32Array,s:4}};
const NCOMP={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
function loadBuffers(j,dir){ return j.buffers.map(b=>{ if(b.uri&&b.uri.startsWith('data:')){ return Buffer.from(b.uri.split(',')[1],'base64'); } return fs.readFileSync(path.join(dir,b.uri)); }); }
DracoDecoderModule({}).then(mod=>{
  const j=JSON.parse(fs.readFileSync(inPath,'utf8')); const bufs=loadBuffers(j,path.dirname(inPath));
  const out=[]; let outLen=0; const newBVs=[]; const newAccs=[];
  const push=(bytes,target)=>{ while(outLen%4){ out.push(Buffer.alloc(1)); outLen++; } const bv={buffer:0,byteOffset:outLen,byteLength:bytes.length}; if(target) bv.target=target; out.push(Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength)); outLen+=bytes.length; newBVs.push(bv); return newBVs.length-1; };
  // 先複製非 draco 的 accessor（例如動畫、未壓縮的網格）
  const accMap=new Map();
  const copyAcc=(ai)=>{ if(accMap.has(ai)) return accMap.get(ai); const a=Object.assign({},j.accessors[ai]); if(a.bufferView!==undefined){ const bv=j.bufferViews[a.bufferView]; const src=bufs[bv.buffer]; const bytes=new Uint8Array(src.buffer,src.byteOffset+(bv.byteOffset||0),bv.byteLength); const nb=push(new Uint8Array(bytes),bv.target); a.bufferView=nb; if(bv.byteStride) newBVs[nb].byteStride=bv.byteStride; } newAccs.push(a); accMap.set(ai,newAccs.length-1); return newAccs.length-1; };
  const decoder=new mod.Decoder();
  for(const mesh of j.meshes||[]){ for(const prim of mesh.primitives){ const ext=prim.extensions&&prim.extensions.KHR_draco_mesh_compression; if(!ext){ for(const k in prim.attributes) prim.attributes[k]=copyAcc(prim.attributes[k]); if(prim.indices!==undefined) prim.indices=copyAcc(prim.indices); continue; }
      const bv=j.bufferViews[ext.bufferView]; const src=bufs[bv.buffer]; const data=new Uint8Array(src.buffer,src.byteOffset+(bv.byteOffset||0),bv.byteLength);
      const buf=new mod.DecoderBuffer(); buf.Init(data,data.length); const type=decoder.GetEncodedGeometryType(buf); if(type!==mod.TRIANGULAR_MESH) throw new Error('not a mesh'); const dm=new mod.Mesh(); const st=decoder.DecodeBufferToMesh(buf,dm); if(!st.ok()) throw new Error('decode failed '+st.error_msg()); const numFaces=dm.num_faces(), numPoints=dm.num_points();
      // 索引
      { const n=numFaces*3; const bytes=n*4; const ptr=mod._malloc(bytes); decoder.GetTrianglesUInt32Array(dm,bytes,ptr); const idx=new Uint32Array(mod.HEAPU32.buffer,ptr,n).slice(); mod._free(ptr); const oldAcc=j.accessors[prim.indices]; const nb=push(new Uint8Array(idx.buffer),34963); newAccs.push({bufferView:nb,componentType:5125,count:n,type:'SCALAR',max:[Math.max(...idx)],min:[Math.min(...idx)]}); prim.indices=newAccs.length-1; }
      // 屬性
      for(const sem in ext.attributes){ const id=ext.attributes[sem]; const attr=decoder.GetAttributeByUniqueId(dm,id); const nc=attr.num_components(); const oldAcc=j.accessors[prim.attributes[sem]]; const ct=oldAcc.componentType; const C=COMP[ct]; const dt={5120:mod.DT_INT8,5121:mod.DT_UINT8,5122:mod.DT_INT16,5123:mod.DT_UINT16,5125:mod.DT_UINT32,5126:mod.DT_FLOAT32}[ct]; const n=numPoints*nc; const bytes=n*C.s; const ptr=mod._malloc(bytes); decoder.GetAttributeDataArrayForAllPoints(dm,attr,dt,bytes,ptr); const arr=new C.T(mod.HEAPU8.buffer,ptr,n).slice(); mod._free(ptr); const nb=push(new Uint8Array(arr.buffer),34962); const acc={bufferView:nb,componentType:ct,count:numPoints,type:oldAcc.type}; if(oldAcc.normalized) acc.normalized=true; if(sem==='POSITION'){ const mn=[Infinity,Infinity,Infinity], mx=[-Infinity,-Infinity,-Infinity]; for(let i=0;i<numPoints;i++) for(let c=0;c<3;c++){ const v=arr[i*3+c]; if(v<mn[c]) mn[c]=v; if(v>mx[c]) mx[c]=v; } acc.min=mn; acc.max=mx; } newAccs.push(acc); prim.attributes[sem]=newAccs.length-1; }
      delete prim.extensions.KHR_draco_mesh_compression; if(!Object.keys(prim.extensions).length) delete prim.extensions; mod.destroy(dm); mod.destroy(buf); } }
  // 圖片（若有 data uri 影像，保留為 data uri）
  const outJ=Object.assign({},j,{accessors:newAccs,bufferViews:newBVs,buffers:[{byteLength:outLen}]}); delete outJ.extensionsRequired; if(outJ.extensionsUsed){ outJ.extensionsUsed=outJ.extensionsUsed.filter(e=>e!=='KHR_draco_mesh_compression'); if(!outJ.extensionsUsed.length) delete outJ.extensionsUsed; }
  // animations / skins 的 accessor 也要複製
  for(const an of outJ.animations||[]){ for(const s of an.samplers){ s.input=copyAcc(s.input); s.output=copyAcc(s.output); } }
  for(const sk of outJ.skins||[]){ if(sk.inverseBindMatrices!==undefined) sk.inverseBindMatrices=copyAcc(sk.inverseBindMatrices); }
  outJ.accessors=newAccs; outJ.bufferViews=newBVs; outJ.buffers=[{byteLength:outLen}];
  let js=Buffer.from(JSON.stringify(outJ)); while(js.length%4) js=Buffer.concat([js,Buffer.from(' ')]); let bin=Buffer.concat(out); while(bin.length%4) bin=Buffer.concat([bin,Buffer.alloc(1)]);
  const header=Buffer.alloc(12); header.writeUInt32LE(0x46546C67,0); header.writeUInt32LE(2,4); header.writeUInt32LE(12+8+js.length+8+bin.length,8);
  const ch1=Buffer.alloc(8); ch1.writeUInt32LE(js.length,0); ch1.writeUInt32LE(0x4E4F534A,4); const ch2=Buffer.alloc(8); ch2.writeUInt32LE(bin.length,0); ch2.writeUInt32LE(0x004E4942,4);
  fs.writeFileSync(outPath,Buffer.concat([header,ch1,js,ch2,bin])); console.log('ok',outPath,(12+8+js.length+8+bin.length)/1024|0,'KB');
}).catch(e=>{ console.error('ERR',e); process.exit(1); });
