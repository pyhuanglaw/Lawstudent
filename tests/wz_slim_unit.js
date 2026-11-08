// 溫州街主模型縮小（PERF-COLD-RT，LAWWW2-B 2026-11-07；tools/blender/env_second/glb_slim.py，wz_street.py 匯出後自動做）——不需要瀏覽器。
// 起因：CC-B PERF_COLD_RT（4G 20 Mbps）第一次進溫州街，慢在下載 wenzhou_street.glb（13.6 MB），下載完到載好只差 0.6～2.2 s。
//   1. 檔案 ≤ 10.5 MB；extensionsRequired 有 KHR_mesh_quantization（法線 8 位元要它）
//   2. 法線：要轉的都是 8 位元（normalized BYTE）；拿掉法線的只有不受光的材質（KHR_materials_unlit）
//   3. 頂點色：都不是 32 位元浮點（0～255 或 16 位元，normalized）
//   4. 遊戲會改幾何的板面（PLATE_FACE_／SIGN_FACE_／VSIGN_FACE_／INTERIOR_FACE_：zones3d.js wzSplitQuadU、wzAtlasFaces 會切塊、合成網格）一點都沒轉：位置、法線、UV 都是浮點
//   5. 位置都是浮點（位置沒量化：量化要改節點的變換，招牌、門牌照幾何大小畫字）
//   6. three.js 的 GLTFLoader 解得開（貼圖先拿掉：node 裡載不到圖）：每個網格都有位置；沒有法線的都是 MeshBasicMaterial；法線是 Int8 normalized 的幾何數量對得上
// 修改前：13.6 MB、法線是浮點（第 1、2 項失敗）。用法：node tests/wz_slim_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILE=path.join(ROOT,'assets/models/env/second_ai/wenzhou_street.glb');
const buf=fs.readFileSync(FILE), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8'));
const FACE=/^(PLATE_FACE_|V?SIGN_FACE_|INTERIOR_FACE_)/;
const unlit=new Set((J.materials||[]).map((m,i)=>m.extensions&&m.extensions.KHR_materials_unlit?i:-1).filter(i=>i>=0));
const faceMesh=new Set(J.nodes.filter(n=>n.mesh!=null&&FACE.test(n.name||'')).map(n=>n.mesh));
check('1. 檔案 ≤ 10.5 MB', buf.length<=10.5e6, (buf.length/1e6).toFixed(2)+' MB');
check('1. extensionsRequired 有 KHR_mesh_quantization', (J.extensionsRequired||[]).includes('KHR_mesh_quantization')&&(J.extensionsUsed||[]).includes('KHR_mesh_quantization'));
const A=i=>J.accessors[i]; let nI8=0, nF=0, badN=[], dropBad=[], badC=[], faceBad=[], posBad=[];
J.meshes.forEach((m,mi)=>m.primitives.forEach(p=>{ const at=p.attributes, face=faceMesh.has(mi);
  if(A(at.POSITION).componentType!==5126) posBad.push(m.name);
  if(face){ for(const k of ['POSITION','NORMAL','TEXCOORD_0']) if(at[k]!=null&&A(at[k]).componentType!==5126) faceBad.push(m.name+' '+k); return; }
  if(at.NORMAL==null){ if(!unlit.has(p.material)) dropBad.push(m.name); }
  else { const a=A(at.NORMAL); if(a.componentType===5120&&a.normalized) nI8++; else nF++; }
  if(at.COLOR_0!=null&&A(at.COLOR_0).componentType===5126) badC.push(m.name); }));
check('2. 法線轉成 8 位元（normalized BYTE）', nI8>=60, nI8+' 個 8 位元、'+nF+' 個浮點（和板面以外的網格共用、不能轉的）');
check('2. 拿掉法線的都是不受光的材質', !dropBad.length, dropBad.join('、'));
check('3. 頂點色都不是 32 位元浮點', !badC.length, badC.join('、'));
check('4. 板面（'+faceMesh.size+' 個網格）的位置、法線、UV 都是浮點', faceMesh.size>=3&&!faceBad.length, faceBad.join('、'));
check('5. 位置都是浮點', !posBad.length, posBad.join('、'));
// 6. GLTFLoader（貼圖拿掉）
global.window=global; global.self=global; global.navigator={userAgent:'node'}; global.document={createElementNS:()=>({style:{}}),createElement:()=>({style:{},getContext:()=>null})};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (THREE|THREE_JSM)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
const J2=JSON.parse(JSON.stringify(J)); for(const m of J2.materials||[]){ const pb=m.pbrMetallicRoughness||{}; for(const k of Object.keys(pb)) if(/Texture$/.test(k)) delete pb[k]; for(const k of ['normalTexture','emissiveTexture','occlusionTexture']) delete m[k]; }
delete J2.textures; delete J2.images; delete J2.samplers; J2.extensionsUsed=(J2.extensionsUsed||[]).filter(e=>e!=='EXT_texture_webp'); J2.extensionsRequired=(J2.extensionsRequired||[]).filter(e=>e!=='EXT_texture_webp');
let js=Buffer.from(JSON.stringify(J2),'utf8'); js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]); const rest=buf.slice(20+jl), hdr=Buffer.alloc(20);
hdr.write('glTF',0); hdr.writeUInt32LE(2,4); hdr.writeUInt32LE(20+js.length+rest.length,8); hdr.writeUInt32LE(js.length,12); hdr.write('JSON',16); const glb=Buffer.concat([hdr,js,rest]);
const warn=console.warn; console.warn=()=>{};
new THREE_JSM.GLTFLoader.GLTFLoader().parse(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.length),'',g=>{ console.warn=warn; let n=0, noPos=0, noN=[], i8=0;
    g.scene.traverse(o=>{ if(!o.isMesh) return; n++; const at=o.geometry.attributes; if(!at.position) noPos++; if(!at.normal&&!o.material.isMeshBasicMaterial) noN.push(o.name); if(at.normal&&at.normal.normalized&&at.normal.array instanceof Int8Array) i8++; });
    check('6. GLTFLoader 解得開：'+n+' 個網格都有位置', n>=90&&!noPos, 'noPos '+noPos);
    check('6. 沒有法線的都是 MeshBasicMaterial', !noN.length, noN.join('、'));
    check('6. 法線是 Int8 normalized 的網格 ≥ 60', i8>=60, ''+i8);
    console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0); },
  e=>{ console.warn=warn; check('6. GLTFLoader 解得開', false, String(e&&e.message||e)); console.log('FAILED '+fails); process.exit(1); });
