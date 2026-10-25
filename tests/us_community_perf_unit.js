// 美國社區西邊出口往西變慢（US-COMMUNITY-WEST-PERF-1025，LAWWW2-B 2026-10-25；LAWWW-B 派工）——不需要瀏覽器，讀 GLB。
//   v9.10.9 加了出口外的街道、公車站、對面的平房以後，從出口往西看 SwiftShader 6.1 → 3.8 fps（BB 量的）。
//   量出來不是樹、房子（各自拿掉都在誤差內），是地面：草地、柏油、水泥是雙面的薄板（底面也畫一次、再被頂面蓋掉），
//   出口外的草地（60 m × 120 m）、社區的草地整片墊在馬路、人行道、停車場的柏油底下（同一個地方畫兩層）。
//   1. 地面材質（草地、柏油、水泥、標線，含季節換裝的）是單面（glTF doubleSided 是 false）；
//   2. 草地的頂面不和停車場、出口車道、出口外的馬路和兩邊人行道重疊（三角形對矩形裁切，重疊面積 < 0.01 m²）；
//   3. 該有草地的地方還有：對面的前院、這一側人行道和社區之間、社區南邊的草坪、停車場北邊。
// 修改前 FAIL。用法：node tests/us_community_perf_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const buf=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_community.glb')), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), bin0=20+jl+8;
const LY=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_community.layout.json'),'utf8')), BD=LY.bounds, LOT=LY.lot, OX=BD.x0;
const acc=(ai,k)=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||k*4, out=[];
  for(let i=0;i<a.count;i++){ const r=[]; for(let j=0;j<k;j++) r.push(buf.readFloatLE(off+i*st+j*4)); out.push(r); } return out; };
const idx=ai=>{ const a=J.accessors[ai], v=J.bufferViews[a.bufferView], off=bin0+(v.byteOffset||0)+(a.byteOffset||0), sz=a.componentType===5125?4:2, out=[];
  for(let i=0;i<a.count;i++) out.push(sz===4?buf.readUInt32LE(off+i*4):buf.readUInt16LE(off+i*2)); return out; };
// 1. 單面
const GROUND=/^usc_(grass|asphalt|concrete|line_paint|line_yellow)(__S_[a-z]+)?$/;
const gm=J.materials.filter(m=>GROUND.test(m.name)), ds=gm.filter(m=>m.doubleSided);
check('1. 地面材質都是單面（'+gm.length+' 個，含季節換裝）', gm.length>=9&&ds.length===0, ds.length?'雙面：'+ds.map(m=>m.name).join(' '):gm.map(m=>m.name).join(' '));
// 草地的頂面（朝上、高度 −0.02）
const tops=[];
for(const n of J.nodes){ if(n.mesh==null) continue; const t=n.translation||[0,0,0];
  for(const pr of J.meshes[n.mesh].primitives){ if(J.materials[pr.material].name!=='usc_grass') continue;
    const P=acc(pr.attributes.POSITION,3).map(p=>[p[0]+t[0],p[1]+t[1],p[2]+t[2]]), I=pr.indices!=null?idx(pr.indices):P.map((_,i)=>i);
    for(let k=0;k<I.length;k+=3){ const a=P[I[k]], b=P[I[k+1]], c=P[I[k+2]]; if([a,b,c].every(p=>Math.abs(p[1]+0.02)<0.005)) tops.push([[a[0],a[2]],[b[0],b[2]],[c[0],c[2]]]); } } }
check('2. 讀得到草地的頂面', tops.length>0, tops.length+' 個三角形');
// 三角形 ∩ 矩形 的面積（Sutherland–Hodgman）
function clipArea(tri,x0,x1,z0,z1){ let poly=tri.slice();
  const edges=[[p=>p[0]>=x0,(p,q)=>{ const t=(x0-p[0])/(q[0]-p[0]); return [x0,p[1]+t*(q[1]-p[1])]; }],[p=>p[0]<=x1,(p,q)=>{ const t=(x1-p[0])/(q[0]-p[0]); return [x1,p[1]+t*(q[1]-p[1])]; }],
    [p=>p[1]>=z0,(p,q)=>{ const t=(z0-p[1])/(q[1]-p[1]); return [p[0]+t*(q[0]-p[0]),z0]; }],[p=>p[1]<=z1,(p,q)=>{ const t=(z1-p[1])/(q[1]-p[1]); return [p[0]+t*(q[0]-p[0]),z1]; }]];
  for(const [inside,cut] of edges){ const out=[]; for(let i=0;i<poly.length;i++){ const p=poly[i], q=poly[(i+1)%poly.length]; const pi=inside(p), qi=inside(q);
      if(pi) out.push(p); if(pi!==qi) out.push(cut(p,q)); } poly=out; if(!poly.length) return 0; }
  let s=0; for(let i=0;i<poly.length;i++){ const p=poly[i], q=poly[(i+1)%poly.length]; s+=p[0]*q[1]-q[0]*p[1]; } return Math.abs(s)/2; }
const overlap=(x0,x1,z0,z1)=>tops.reduce((s,t)=>s+clipArea(t,x0,x1,z0,z1),0);
{ const a=overlap(LOT.x0,LOT.x1,LOT.z0,LOT.z1); check('2. 草地不墊在停車場底下', a<0.01, a.toFixed(2)+' m²'); }
{ const a=overlap(OX,LOT.x0,-3.6,3.6); check('2. 草地不墊在出口車道底下', a<0.01, a.toFixed(2)+' m²'); }
{ const a=overlap(OX-14.8,OX-3.2,-60,60); check('2. 草地不墊在出口外的馬路、兩邊人行道底下', a<0.01, a.toFixed(2)+' m²'); }
{ const a=overlap(OX-3.2,OX,-3.6,3.6); check('2. 草地不墊在出口外接到馬路的那一段車道底下', a<0.01, a.toFixed(2)+' m²'); }
// 3. 該有草地的地方
const covered=(x,z)=>overlap(x-0.05,x+0.05,z-0.05,z+0.05)>0.0099;   // 10 cm 見方整塊都有草地（加總：點可能剛好在兩個三角形的對角線上）
for(const [nm,x,z] of [['對面的前院',OX-20,10],['這一側人行道和社區之間',OX-1.5,12],['社區南邊的草坪',0,20],['停車場北邊',0,-20],['停車場西邊（車道旁）',OX+3,-6],['停車場東邊',LOT.x1+5,0]])
  check('3. 還有草地：'+nm+'（'+x+', '+z+'）', covered(x,z));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
