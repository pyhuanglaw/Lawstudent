// 映月湖垂柳第 2 版（BB_255 P3「從上面看像枯樹：枝葉加密、加綠」；LAWWW2 帳號 A 11-10）——不需要瀏覽器（D131）。
// 第 1 版（NTU-REF-1110 ③-3）的葉片卡全部是垂直的：從上面看只看到卡的邊，樹冠是空的；貼圖的枝條、葉子也稀。檢查（讀 campus_lake.glb）：
//   1 從上面看樹冠蓋得住：三棵各自把葉片卡（lake_willow_willow）的三角形投影到地面，樹冠範圍（葉子頂點中心 2.2 m 內）蓋住 ≥ 50%
//   2 葉子貼圖（lk_willow_leaf；GLB 裡是 webp，數字讀 campus_lake.py 用 PIL 量了寫在 json 的 willow_tex）：不透明的部分 ≥ 45%、平均綠色比例 G／(R+G+B) ≥ 0.47
//   3 三角形數合理：垂柳葉片 ≤ 3,000、整顆 GLB ≤ 11,000
// 修改前（開發分支 99294fead，垂柳第 1 版）：1、2 FAIL。用法：node tests/lake_willow_crown_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lake.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
const view=i=>{ const v=J.bufferViews[i]; return bin.slice(v.byteOffset||0,(v.byteOffset||0)+v.byteLength); };
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3}[a.type], T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType], off=(v.byteOffset||0)+(a.byteOffset||0);
  return {arr:new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)),n}; };
const nd=J.nodes.find(q=>q.name==='lake_willow_willow'); const tris=[]; let tw=0;
if(nd){ const t=nd.translation||[0,0,0]; for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION).arr, I=pr.indices!=null?acc(pr.indices).arr:null, n=I?I.length:P.length/3;
  for(let k=0;k<n;k+=3){ const v=[0,1,2].map(j=>{ const q=I?I[k+j]:k+j; return [P[q*3]+t[0],P[q*3+1]+t[1],P[q*3+2]+t[2]]; }); tris.push(v); } tw+=n/3; } }
/* 1 從上面看：照 json 的三棵樹位置分群（離哪一棵的樹幹近就算哪一棵），樹冠中心＝葉子頂點的平均 */
const W=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lake.json'),'utf8')).willows||[];
const res=W.map(([wx,wz])=>{ const my=tris.filter(T=>{ const cx=(T[0][0]+T[1][0]+T[2][0])/3, cz=(T[0][2]+T[1][2]+T[2][2])/3; return W.every(([ox,oz])=>Math.hypot(cx-wx,cz-wz)<=Math.hypot(cx-ox,cz-oz)); });
  if(!my.length) return 0; let sx=0,sz=0,c=0; for(const T of my) for(const v of T){ sx+=v[0]; sz+=v[2]; c++; } const X=sx/c, Z=sz/c, R=2.2, h=0.1; let tot=0, cov=0;
  const inTri=(px,pz,T)=>{ const [a,b2,c2]=T, d=(b2[2]-c2[2])*(a[0]-c2[0])+(c2[0]-b2[0])*(a[2]-c2[2]); if(Math.abs(d)<1e-9) return false; const l1=((b2[2]-c2[2])*(px-c2[0])+(c2[0]-b2[0])*(pz-c2[2]))/d, l2=((c2[2]-a[2])*(px-c2[0])+(a[0]-c2[0])*(pz-c2[2]))/d; return l1>=0&&l2>=0&&l1+l2<=1; };
  for(let x=X-R;x<=X+R;x+=h) for(let z=Z-R;z<=Z+R;z+=h){ if(Math.hypot(x-X,z-Z)>R) continue; tot++; if(my.some(T=>inTri(x,z,T))) cov++; } return cov/tot; });
check('1 從上面看樹冠蓋得住：三棵各自 ≥ 50%', res.length===3&&res.every(r=>r>=0.5), res.map(r=>(r*100).toFixed(0)+'%').join('／'));
/* 2 葉子貼圖：GLB 裡嵌的是 webp（Node 解不開），campus_lake.py 產生貼圖時用 PIL 量了寫在 json 的 willow_tex（不透明的比例、平均綠色比例）；
     另外確認 GLB 真的有這張貼圖（lk_willow_leaf 的 baseColorTexture）、透明裁切 MASK */
const JS=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lake.json'),'utf8')), wt=JS.willow_tex||null;
const lm=(J.materials||[]).find(m=>m.name==='lk_willow_leaf'), hasTex=!!(lm&&lm.pbrMetallicRoughness&&lm.pbrMetallicRoughness.baseColorTexture)&&lm.alphaMode==='MASK';
check('2 葉子貼圖：不透明 ≥ 45%、平均綠色比例 ≥ 0.47（GLB 有這張貼圖、MASK）', hasTex&&!!wt&&wt.cover>=0.45&&wt.green>=0.47, wt?`不透明 ${(wt.cover*100).toFixed(1)}%、綠色比例 ${wt.green}`:'json 沒有 willow_tex（第 1 版）');
const all=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_lake.json'),'utf8')).tris;
check('3 三角形：垂柳葉片 ≤ 3,000、整顆 GLB ≤ 11,000', tw>0&&tw<=3000&&all<=11000, `葉片 ${tw}、整顆 ${all}`);
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
