// 美國公寓（祐廷的單人戶 us_apartment、學姊她們的 C 棟合租戶 us_shared）外牆的壁板有沒有在窗、門的地方挖洞（LAWWW2-B 2026-10-31）——不需要瀏覽器，讀 GLB。
// 找到的經過：美國公寓光照烘焙，白天屋裡幾乎沒有天光；查下去是外牆外面那一層壁板（WALL_<面>_siding）整面一片，沒有照牆的開口挖洞——
//   北牆的兩扇窗、陽台玻璃門，從屋裡看出去看到的是自己壁板的背面（一條一條的色帶），做好的窗外景（usa_view：對面的公寓、樹林）整個被擋住；
//   南牆的大門從門外的平台看是一片壁板（走得過去：等於穿牆）。
// 修法：us_apartment.py 的壁板照牆的開口（窗：0.9～2.1 m、門：0～2.05 m）分段，開口的地方不做。
// 檢查（兩個 GLB 各一次）：外牆（N、S、W、E）每個開口的中心點，壁板沒有三角形蓋住；壁板還在（開口以外的地方有）。
// 用法：node tests/us_apt_siding_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function layout(file,name){ const src=fs.readFileSync(path.join(ROOT,file),'utf8'), k='const '+name+'=', i=src.lastIndexOf(k); return JSON.parse(src.slice(i+k.length).trim().replace(/;\s*$/,'')); }
function sidingTris(glb,nodeName){ const b=fs.readFileSync(path.join(ROOT,glb)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), bin=b.slice(20+n+8);
  const nd=j.nodes.find(x=>x.name===nodeName); if(!nd||nd.mesh==null) return null; const t=nd.translation||[0,0,0], out=[];
  for(const p of j.meshes[nd.mesh].primitives){ const a=j.accessors[p.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
    const V=k=>[0,1,2].map(c=>bin.readFloatLE(o+k*st+c*4)+t[c]);
    const ia=j.accessors[p.indices], ib=j.bufferViews[ia.bufferView], io=(ib.byteOffset||0)+(ia.byteOffset||0), sz={5125:4,5123:2,5121:1}[ia.componentType];
    const I=k=>sz===4?bin.readUInt32LE(io+k*4):sz===2?bin.readUInt16LE(io+k*2):bin.readUInt8(io+k);
    for(let k=0;k<ia.count;k+=3) out.push([V(I(k)),V(I(k+1)),V(I(k+2))]); }
  return out; }
// 點 (u,v) 在三角形（投影到牆面：u＝沿牆、v＝高）裡
function inTri(u,v,tr,axis){ const P=tr.map(q=>axis==='x'?[q[0],q[1]]:[q[2],q[1]]); const s=(a,b,c)=>(a[0]-c[0])*(b[1]-c[1])-(b[0]-c[0])*(a[1]-c[1]);
  const p=[u,v], d1=s(p,P[0],P[1]), d2=s(p,P[1],P[2]), d3=s(p,P[2],P[0]); const neg=d1<0||d2<0||d3<0, pos=d1>0||d2>0||d3>0; return !(neg&&pos); }
for(const [glb,lf,ln,label] of [['assets/models/env/second_ai/us_apartment.glb','src/data/us_apartment_layout.js','US_APARTMENT_LAYOUT','單人戶'],['assets/models/env/second_ai/us_shared.glb','src/data/us_shared_layout.js','US_SHARED_LAYOUT','C 棟合租戶']]){
  const L=layout(lf,ln); let n=0; const bad=[], miss=[];
  for(const w of L.walls[0].list){ if(!/^[NSWE]$/.test(w.id)) continue; const tris=sidingTris(glb,'WALL_'+w.id+'_siding'); if(!tris||!tris.length){ miss.push(w.id); continue; }
    for(const [a,b,kind] of (w.open||[])){ n++; const u=(a+b)/2, v=kind==='window'?1.5:1.0; if(tris.some(tr=>inTri(u,v,tr,w.axis))) bad.push(w.id+' '+kind+' @'+u.toFixed(2)); }
    const solid=(w.from+((w.open||[])[0]||[w.to])[0])/2; if(!tris.some(tr=>inTri(solid,1.0,tr,w.axis))) miss.push(w.id+'（開口以外沒有壁板）'); }
  check(label+'：外牆的窗、門（'+n+' 個開口）壁板都有挖洞',n>=4&&!bad.length,bad.join('；'));
  check(label+'：四面外牆的壁板還在',!miss.length,miss.join('；')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
