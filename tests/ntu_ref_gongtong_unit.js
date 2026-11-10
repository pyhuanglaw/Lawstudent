// 共同教學館：紅磚舊館＋米色粉刷翼樓（NTU-REF-1110 ③-2，LAWWW2 帳號 A 11-10；X223／D136）——不需要瀏覽器（D131），讀 GLB。
// 依據：使用者 11-04 14:03 的照片（docs/story_planning/ref_images/buildings/common_teaching_1104/README.md：紅磚舊館、上層高拱窗；米色（淺黃）粉刷的翼樓）、
//   校園地圖「共同三松：共同教室的紅磚與拱窗」。原本整棟土黃十三溝面磚（依文字的設計）。
// 檢查：
//   1 沒有 gt_wall 了；牆分成 gt_brick（紅磚）和 gt_wing_plaster（米色粉刷）
//   2 紅磚都在東半部（面的中心世界 x ≥ −3.19：三、四樓那一段＝舊館），米色粉刷都在西翼（x < −3.1）；兩邊都有一定面積
// 修改前（開發分支 74da28ca9）：1、2 FAIL。用法：node tests/ntu_ref_gongtong_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_gongtong.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(28+jl);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
const mats=J.materials.map(m=>m.name), R={};
for(const nd of J.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0];
  for(const pr of J.meshes[nd.mesh].primitives){ const nm=mats[pr.material]; if(!/^gt_(brick|wing_plaster|wall)$/.test(nm)) continue; const P=acc(pr.attributes.POSITION), I=acc(pr.indices); const r=R[nm]||(R[nm]={area:0,xmin:1e9,xmax:-1e9});
    for(let i=0;i<I.length;i+=3){ const p=[0,1,2].map(k=>[P[I[i+k]*3]+t[0],P[I[i+k]*3+1]+t[1],P[I[i+k]*3+2]+t[2]]); const cx=(p[0][0]+p[1][0]+p[2][0])/3;
      const u=p[1].map((v,k)=>v-p[0][k]), w=p[2].map((v,k)=>v-p[0][k]), c=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]]; r.area+=Math.hypot(...c)/2; r.xmin=Math.min(r.xmin,cx); r.xmax=Math.max(r.xmax,cx); } } }
check('1 牆分成紅磚 gt_brick、米色粉刷 gt_wing_plaster（沒有 gt_wall）', !mats.includes('gt_wall')&&!!R.gt_brick&&!!R.gt_wing_plaster, '材質 '+mats.join('、'));
const B=R.gt_brick||{}, W=R.gt_wing_plaster||{};
check('2 紅磚在東半部（舊館；面的中心 x ≥ −3.19，拆成三角形後最多跨過交界 0.4 m：x ≥ −3.6）、米色粉刷在西翼（x < −3.1），各有 ≥ 150 m²', B.xmin>=-3.6&&W.xmax<-3.1&&B.area>=150&&W.area>=150, R.gt_brick?`紅磚 x ${B.xmin.toFixed(2)}～${B.xmax.toFixed(2)}、${B.area.toFixed(0)} m²；粉刷 x ${W.xmin.toFixed(2)}～${W.xmax.toFixed(2)}、${W.area.toFixed(0)} m²`:'沒有');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
