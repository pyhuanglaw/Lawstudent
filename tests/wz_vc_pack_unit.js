// 溫州街主模型：只差粗糙度、金屬度的頂點色材質合成一個（PERF-WZ-DC-1107，LAWWW2-B 2026-11-07；LAWWW-B 09:04「主模型 −13」）——不需要瀏覽器，讀 GLB。
//   原本五個頂點色材質（wz_vc_matte、wz_vc_metal 投影；cafe_vc_wz_matte／gloss／metal 不投影）只差粗糙度、金屬度，一個材質一次 draw call，
//   四段 wzx 每段霧面、金屬各一次，窗、冷氣這些 instancing 原型一個原型兩次。改成兩個打包材質（wz_vc_pack 投影、cafe_vc_wz_pack 不投影）：
//   粗糙度、金屬度從一張 48×16 的小貼圖讀（G＝粗糙度、B＝金屬度、取樣 NEAREST），每個面的 UV 放在它原本材質那一格的正中央。
//   1. 舊的五個頂點色材質都不在了；兩個打包材質用同一張貼圖、NEAREST 取樣；
//   2. 打包材質的每個三角形三個頂點 UV 一樣，而且落在三格之一的正中央（整個三角形讀同一個值，不會讀到隔壁格、不會有漸層）；
//   3. 每一格（霧面 0.85／亮面 0.35／金屬 0.45＋0.35）× 投影／不投影／instancing 的三角形數和改之前一樣（instancing 乘上實例數）——
//      同一個面讀到的粗糙度、金屬度和原本的材質一樣、影子照舊；
//   4. 頂點色的 primitive 28 → 16（含阿德影印兩種外觀 COPY_ 的；平常畫面主畫面少 10～12 次 draw call（看轉角是哪一種外觀）、影子那一輪少 1 次）。
// 修改前 FAIL（沒有打包材質）。實際的貼圖像素值（WebP 解出來）在 tools/blender/env_second/glb_vc_compare.py 檢查（差 ≤ 0.005）。
// 用法：node tests/wz_vc_pack_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/wenzhou_street.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8'));
const BIN=b.slice(20+jl+8), CT={5121:[1,'getUint8'],5123:[2,'getUint16'],5125:[4,'getUint32'],5126:[4,'getFloat32']}, NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
function acc(i){ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], [sz,fn]=CT[a.componentType], n=NC[a.type], st=bv.byteStride||sz*n, off=(bv.byteOffset||0)+(a.byteOffset||0);
  const dv=new DataView(BIN.buffer,BIN.byteOffset), out=[]; for(let k=0;k<a.count;k++){ const v=[]; for(let c=0;c<n;c++) v.push(dv[fn](off+k*st+c*sz,true)); out.push(n===1?v[0]:v); } return out; }
const M=J.materials, names=M.map(m=>m.name), OLD=['wz_vc_matte','wz_vc_metal','cafe_vc_wz_matte','cafe_vc_wz_gloss','cafe_vc_wz_metal'], PACK=['wz_vc_pack','cafe_vc_wz_pack'];
const pm=PACK.map(n=>M.find(m=>m.name===n)), tex=pm.map(m=>m&&m.pbrMetallicRoughness.metallicRoughnessTexture&&J.textures[m.pbrMetallicRoughness.metallicRoughnessTexture.index]);
const src=t=>t&&(t.source!=null?t.source:(t.extensions&&t.extensions.EXT_texture_webp||{}).source), smp=t=>t&&J.samplers[t.sampler]||{};
check('1. 舊的五個頂點色材質不在了、兩個打包材質用同一張貼圖、NEAREST 取樣', !OLD.some(n=>names.includes(n))&&pm.every(Boolean)&&tex.every(Boolean)&&src(tex[0])===src(tex[1])
  &&tex.every(t=>smp(t).magFilter===9728&&[9728,9984].includes(smp(t).minFilter))&&pm.every(m=>m.pbrMetallicRoughness.roughnessFactor==null&&m.pbrMetallicRoughness.metallicFactor==null),
  JSON.stringify({old:OLD.filter(n=>names.includes(n)), tex:tex.map(t=>t&&[src(t),smp(t)])}));
// 每個節點：上層有沒有 COPY_*_SHUT／SEASON_（平常藏起來）、是不是 instancing、實例數
const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));
const chain=i=>{ const s=[J.nodes[i].name||'']; while(par[i]!=null){ i=par[i]; s.push(J.nodes[i].name||''); } return s; };
const U=[1/6,1/2,5/6], CELL=['亮面','金屬','霧面'], cnt={}, add=(k,v)=>cnt[k]=(cnt[k]||0)+v; let badUV=0, uvInfo='', vcPrims=0;
J.nodes.forEach((n,ni)=>{ if(n.mesh==null) return; const ch=chain(ni), hidden=ch.some(c=>/^COPY_.*_SHUT$/.test(c)||/^SEASON_/.test(c)), ext=n.extensions&&n.extensions.EXT_mesh_gpu_instancing;
  const inst=ext?J.accessors[ext.attributes.TRANSLATION].count:0;
  for(const p of J.meshes[n.mesh].primitives){ const mn=M[p.material].name; if(!PACK.includes(mn)) continue; vcPrims++;
    const tc=p.attributes['TEXCOORD_'+((M[p.material].pbrMetallicRoughness.metallicRoughnessTexture||{}).texCoord||0)], uv=acc(tc), ix=p.indices!=null?acc(p.indices):uv.map((_,k)=>k);
    for(let t=0;t<ix.length;t+=3){ const a=uv[ix[t]], b2=uv[ix[t+1]], c=uv[ix[t+2]], k=U.findIndex(u=>Math.abs(a[0]-u)<1e-4);
      if(k<0||Math.abs(a[1]-0.5)>1e-4||[b2,c].some(q=>Math.abs(q[0]-a[0])>1e-6||Math.abs(q[1]-a[1])>1e-6)){ if(!badUV) uvInfo=n.name+' '+JSON.stringify([a,b2,c]); badUV++; continue; }
      add(CELL[k]+'｜'+(inst?'instancing':(mn==='wz_vc_pack'?'投影':'不投影'))+(hidden?'｜藏':''), inst||1); } } });
check('2. 打包材質每個三角形三個頂點 UV 一樣、落在一格的正中央', badUV===0, badUV?badUV+' 個不對，例如 '+uvInfo:'');
// 改之前（WZ_NOPACK=1 重建、和 repo 原本的 GLB 比過完全一樣）每一類的三角形數（instancing 乘實例數）
const WANT={'亮面｜不投影':1776,'亮面｜instancing':11040,'金屬｜不投影':13612,'金屬｜不投影｜藏':36,'金屬｜instancing':31200,'金屬｜投影':1928,'霧面｜不投影':21266,'霧面｜instancing':13320,'霧面｜投影':2054};   /* WZ-LIN-STREET-REF-1112（LAWWW2-C 11-12）：林家乾麵門口的紅、藍塑膠凳拿掉（金屬 13744→13612、霧面 21362→21266） */
const diff=Object.keys({...WANT,...cnt}).filter(k=>WANT[k]!==cnt[k]);
check('3. 每一格×投影／不投影／instancing 的三角形數和改之前一樣（同一個面讀到同一個粗糙度、金屬度，影子照舊）', !diff.length, diff.length?diff.map(k=>k+' 要 '+WANT[k]+' 實際 '+cnt[k]).join('；'):'');
check('4. 頂點色的 primitive 28 → 16（含 COPY_ 兩種外觀）', vcPrims===16, String(vcPrims));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
