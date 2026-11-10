// 男一舍外觀照官網照片改（NTU-REF-1110 ③，LAWWW2 帳號 A 11-10；X223／D136；docs/art-rebuild/second_ai/ntu_ref_keep_change_1110.md）——不需要瀏覽器（D131），讀 GLB。
// 官網照片（docs/story_planning/ref_images/buildings/README.md 男一舍一列）：灰色清水混凝土、樓梯塔開圓窗、正門水平混凝土雨遮；原本是米灰小口馬賽克＋鏤空花磚樓梯間（依文字的遊戲化設計）。
// 檢查：
//   1 外牆 m1_wall 的貼圖是清水模（socsci_formwork），不再是馬賽克（rounded_square_tiled_wall）；沒有鏤空花磚 m1_breeze
//   2 正面中間的樓梯塔有圓窗：每層一個（二～五樓）＋屋頂出口一個＝5 個（D136：數量、位置不照抄），玻璃是暗的頂點色
//   3 樓層照舊 5 層（AA-C 10-21 J1：房號 507）：頂 ≥ 16 m
// 修改前（開發分支 74da28ca9）：1、2 FAIL。用法：node tests/ntu_ref_male1_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_male1.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(28+jl);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  const arr=new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); const k=a.normalized?(a.componentType===5123?65535:255):1; return {n,count:a.count,get:(i,j)=>arr[i*n+j]/k}; };
const mats=J.materials.map(m=>m.name), imgOf=mn=>{ const m=J.materials.find(q=>q.name===mn), t=m&&m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture; if(!t) return ''; const tx=J.textures[t.index], src=tx.source!=null?tx.source:Object.values(tx.extensions||{})[0].source; return (J.images[src]||{}).name||''; };
const wi=imgOf('m1_wall');
check('1 外牆是清水模（socsci_formwork）、沒有馬賽克、沒有鏤空花磚', /socsci_formwork/.test(wi)&&!/rounded_square/.test(wi)&&!mats.includes('m1_breeze'), '外牆貼圖 '+wi+'；材質 '+mats.join('、'));
/* 樓梯塔正面（男一舍 (20,68) 轉 π：正面在世界 z≈61，x≈20）：頂點色很暗的圓形玻璃，照高度分群 */
let ys=[], hi=-1e9;
for(const nd of J.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0];
  for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION); for(let i=0;i<P.count;i++) hi=Math.max(hi,P.get(i,1)+t[1]);
    if(!pr.attributes.COLOR_0) continue; const C=acc(pr.attributes.COLOR_0);
    for(let i=0;i<P.count;i++){ const x=P.get(i,0)+t[0], y=P.get(i,1)+t[1], z=P.get(i,2)+t[2]; if(Math.abs(x-20)<0.6&&z>60.8&&z<61.0&&C.get(i,0)<0.06&&C.get(i,1)<0.06) ys.push(y); } } }
ys.sort((a,b)=>a-b); const groups=[]; for(const y of ys){ if(!groups.length||y-groups[groups.length-1][groups[groups.length-1].length-1]>0.6) groups.push([y]); else groups[groups.length-1].push(y); }
check('2 樓梯塔有 5 個圓窗（二～五樓各一、屋頂出口一個），玻璃是暗的', groups.length===5&&groups.every(g=>g.length>=16), groups.length+' 個：中心 '+groups.map(g=>((g[0]+g[g.length-1])/2).toFixed(2)).join('、'));
check('3 照舊 5 層（頂 ≥ 16 m）', hi>=16, '頂 '+hi.toFixed(2)+' m');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
