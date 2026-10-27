// 桃園機場出境、入境大廳 GLB 單面（PERF-SINGLESIDE-GLB-1025 第六份，LAWWW2-C 2026-10-27）——不需要瀏覽器，讀 GLB。
//   同一頁全部改單面的上限：出境大廳 +53～61%（test_shots/singleside_glb_1025/README.md）。
//   1. airport_dep、airport_arr 除了玻璃、霧面玻璃（GLOW_ap_frosted，半透明）都單面；它們照舊雙面；
//   2. 窗外的景（GLOW_ap_outside_m／_night_m，一片）補了反面（從大廳裡面看得到）；
//   3. 盆栽葉子（ap_leaf_small，葉片卡）補了反面；
//   4. 沒有裡外相反的薄零件（單面會從外面看到背面）。
// 修改前 FAIL。用法：node tests/singleside_airport_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(n){ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], off=(bv.byteOffset||0)+(a.byteOffset||0), k={SCALAR:1,VEC3:3}[a.type], T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    return new T(bin.buffer.slice(bin.byteOffset+off, bin.byteOffset+off+a.count*k*T.BYTES_PER_ELEMENT)); };
  const prims=[]; for(const nd of J.nodes){ if(nd.mesh==null) continue; for(const p of J.meshes[nd.mesh].primitives) prims.push({mat:J.materials[p.material].name, p}); }
  let info={}; try{ info=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.json'),'utf8')); }catch(e){}
  return {J, acc, prims, mats:J.materials, info}; }
function paired(G,re){ let ok=0, nt=0; const seen=new Set(); for(const x of G.prims){ if(!re.test(x.mat)||seen.has(x.p)) continue; seen.add(x.p); const p=x.p, P=G.acc(p.attributes.POSITION), I=p.indices!=null?G.acc(p.indices):null, n=(I?I.length:P.length/3)/3;
    const key=k=>{ const v=I?I[k]:k; return P[v*3].toFixed(4)+','+P[v*3+1].toFixed(4)+','+P[v*3+2].toFixed(4); }; const set=new Set(), tri=[];
    for(let t=0;t<n;t++){ const a=key(t*3), b=key(t*3+1), c=key(t*3+2); tri.push([a,b,c]); set.add([a,b,c].join('|')); }
    for(const [a,b,c] of tri) if([[a,c,b],[c,b,a],[b,a,c]].some(r=>set.has(r.join('|')))) ok++; nt+=n; } return [ok,nt]; }
function insideOut(G){ const out={}; const seen=new Set();
  for(const nd of G.J.nodes){ if(nd.mesh==null||seen.has(nd.mesh)) continue; seen.add(nd.mesh);
    for(const p of G.J.meshes[nd.mesh].primitives){ const mn=G.mats[p.material].name; if(/glass/.test(mn)) continue; const P=G.acc(p.attributes.POSITION), I=p.indices!=null?G.acc(p.indices):null, nt=(I?I.length:P.length/3)/3;
      const V=k=>I?I[k]:k, key=v=>P[v*3].toFixed(4)+','+P[v*3+1].toFixed(4)+','+P[v*3+2].toFixed(4); const par=Array.from({length:nt},(_,i)=>i), find=x=>{ while(par[x]!==x){ par[x]=par[par[x]]; x=par[x]; } return x; };
      const ed=new Map(); for(let t=0;t<nt;t++){ const ks=[0,1,2].map(e=>key(V(t*3+e))); for(let e=0;e<3;e++){ const a=ks[e], c=ks[(e+1)%3]; if(a===c) continue; const k=a<c?a+'|'+c:c+'|'+a; if(!ed.has(k)) ed.set(k,[]); ed.get(k).push([t,a<c]); } }
      const bad=new Set(); for(const l of ed.values()){ if(l.length===2&&l[0][1]!==l[1][1]){ const ra=find(l[0][0]), rb=find(l[1][0]); if(ra!==rb) par[ra]=rb; } else l.forEach(([t])=>bad.add(t)); }
      const badr=new Set([...bad].map(find)), comp=new Map();
      for(let t=0;t<nt;t++){ const r=find(t); if(badr.has(r)) continue; const c=comp.get(r)||{v:0,mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]}; comp.set(r,c); const q=[0,1,2].map(e=>{ const v=V(t*3+e); return [P[v*3],P[v*3+1],P[v*3+2]]; });
        c.v+=(q[0][0]*(q[1][1]*q[2][2]-q[1][2]*q[2][1])-q[0][1]*(q[1][0]*q[2][2]-q[1][2]*q[2][0])+q[0][2]*(q[1][0]*q[2][1]-q[1][1]*q[2][0]))/6; for(const w of q) for(let k=0;k<3;k++){ c.mn[k]=Math.min(c.mn[k],w[k]); c.mx[k]=Math.max(c.mx[k],w[k]); } }
      for(const c of comp.values()){ const d=Math.min(...c.mx.map((v,k)=>v-c.mn[k])); if(c.v<-1e-6&&d>=1e-3&&d<1) out[mn]=(out[mn]||0)+1; } } }
  return out; }

for(const k of ['airport_dep','airport_arr']){ const G=load(k);
  const ds=G.mats.filter(m=>m.doubleSided&&!/glass|frosted/.test(m.name)).map(m=>m.name), kp=G.mats.filter(m=>/glass|frosted/.test(m.name));
  check('1. '+k+'：除了玻璃、霧面玻璃都單面（'+G.mats.length+' 個材質）；它們照舊雙面', !ds.length&&kp.length>0&&kp.every(m=>m.doubleSided), ds.length?'雙面：'+ds.join('、'):kp.map(m=>m.name).join('、'));
  const [vo,vn]=paired(G,/^GLOW_ap_outside(_night)?_m$/);
  check('2. '+k+'：窗外的景補了反面', vn>0&&vo>=vn*0.5, vo+'/'+vn);
  const [lo,ln]=paired(G,/^ap_leaf_small$/);
  check('3. '+k+'：盆栽葉子補了反面', ln>0&&lo>=ln*0.5, lo+'/'+ln);
  const o=insideOut(G);
  check('4. '+k+'：沒有裡外相反的薄零件', !Object.keys(o).length, JSON.stringify(o)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
