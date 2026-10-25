// 體育館三個室內 GLB 單面（PERF-SINGLESIDE-GLB-1025 第二份，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   同一頁全部改單面的上限：3F 主球場 1.55→2.3、1F 大廳 3.6→4.6、B1 5.0→6.0（Z3.attachRoomGLB 把 WALL_* 設成 transparent，雙面又半透明要畫兩次）。
//   1. gym_interior、gym_b1、gym_arena 除了玻璃都單面；玻璃照舊雙面；
//   2. 開口的零件補了反面（每個三角形都有反過來的分身）：主球場的看台踢面、盆栽葉片卡；B1 的盆栽葉片卡；大廳的石牆；
//   3. 原本就單面的天花板、屋頂（朝下：鏡頭超過天花板高度時看得穿）沒有補朝上的那一面；
//   4. B1 的器材（gym_b1_props.glb 22 件）、櫃台置物櫃（gym_b1_entry.glb 8 件）都在——匯出時少了這兩個檔，腳本會安靜地跳過（第一次重匯就少了 1.7 萬個三角形）；
//   5. 沒有裡外相反的薄零件（封閉、方向一致、體積是負的、有一邊 1 mm～1 m）：主球場的欄杆收邊、樓梯防滑條、門板、大廳的鐵盒子原本是反的，
//      雙面時看不出來，單面會從外面看到背面（第一次試主球場，看台前緣那條深色收邊變細）——匯出時翻成朝外。
// 修改前 FAIL。用法：node tests/singleside_gym_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(n){ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], off=(bv.byteOffset||0)+(a.byteOffset||0), k={SCALAR:1,VEC3:3}[a.type], T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    return new T(bin.buffer.slice(bin.byteOffset+off, bin.byteOffset+off+a.count*k*T.BYTES_PER_ELEMENT)); };
  const prims=[]; for(const nd of J.nodes){ if(nd.mesh==null) continue; for(const p of J.meshes[nd.mesh].primitives) prims.push({mat:J.materials[p.material].name, p}); }
  return {J, acc, prims, mats:J.materials, info:JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/'+n+'.json'),'utf8'))}; }
function paired(G,re){ let ok=0, nt=0; for(const x of G.prims){ if(!re.test(x.mat)) continue; const p=x.p, P=G.acc(p.attributes.POSITION), I=p.indices!=null?G.acc(p.indices):null, n=(I?I.length:P.length/3)/3;
    const key=k=>{ const v=I?I[k]:k; return P[v*3].toFixed(4)+','+P[v*3+1].toFixed(4)+','+P[v*3+2].toFixed(4); }; const set=new Set(), tri=[];
    for(let t=0;t<n;t++){ const a=key(t*3), b=key(t*3+1), c=key(t*3+2); tri.push([a,b,c]); set.add([a,b,c].join('|')); }
    for(const [a,b,c] of tri) if([[a,c,b],[c,b,a],[b,a,c]].some(r=>set.has(r.join('|')))) ok++; nt+=n; } return [ok,nt]; }
const GL={ gym_interior:load('gym_interior'), gym_b1:load('gym_b1'), gym_arena:load('gym_arena') };
for(const [k,G] of Object.entries(GL)){ const ds=G.mats.filter(m=>m.doubleSided&&!/glass/.test(m.name)).map(m=>m.name), gl=G.mats.filter(m=>/glass/.test(m.name));
  check('1. '+k+'：除了玻璃都單面（'+G.mats.length+' 個材質）；玻璃照舊雙面', !ds.length&&gl.length>0&&gl.every(m=>m.doubleSided), ds.length?'雙面：'+ds.slice(0,8).join(' '):gl.map(m=>m.name).join(' ')); }
const P2=[['主球場 看台踢面',GL.gym_arena,/^arena_riser$/],['主球場 葉片卡',GL.gym_arena,/^arena_pl_leaf_/],['B1 葉片卡',GL.gym_b1,/^b1_pl_leaf_/],['大廳 石牆',GL.gym_interior,/^gym_stone_wall$/]];
const r2=P2.map(([n,G,re])=>{ const [ok,nt]=paired(G,re); return [n,ok,nt]; });
check('2. 開口的零件有反面（至少一半的三角形有反過來的分身）', r2.every(([,ok,nt])=>nt>0&&ok>=nt*0.5), r2.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
const P3=[['大廳 天花板',GL.gym_interior,'gym_ceiling_lobby'],['大廳 屋頂',GL.gym_interior,'gym_roof_deck'],['B1 天花板',GL.gym_b1,'b1_ceiling'],['B1 泳池天花板',GL.gym_b1,'b1_ceiling_pool'],['B1 輕鋼架天花板',GL.gym_b1,'b1_ceiling_tile'],['主球場 屋頂',GL.gym_arena,'arena_roof']];
const r3=P3.map(([n,G,m])=>{ const [ok,nt]=paired(G,new RegExp('^'+m+'$')); const mm=G.mats.find(x=>x.name===m); return [n,ok,nt,mm&&!mm.doubleSided]; });
check('3. 原本就單面的天花板、屋頂沒有補朝上的面（照舊單面）', r3.every(([,ok,nt,ss])=>nt>0&&ok===0&&ss), r3.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
check('4. B1 的器材 22 件、櫃台置物櫃 8 件都在', GL.gym_b1.info.equipment===22&&GL.gym_b1.info.entryProps===8, 'equipment '+GL.gym_b1.info.equipment+'、entryProps '+GL.gym_b1.info.entryProps);
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
const io=Object.entries(GL).map(([k,G])=>[k,insideOut(G)]);
check('5. 沒有裡外相反的薄零件（單面會看到背面）', io.every(([,o])=>!Object.keys(o).length), io.map(([k,o])=>k+' '+JSON.stringify(o)).join('  '));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
