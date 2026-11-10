/* GLB 的 T 形接頭（LAWWW2-C 2026-11-05，LM-SEAM-GEO；RULES_2D_TO_3D.md 第 3 節「踩過的坑」）：
   一條三角形的邊中間夾著別的頂點（同一個網格或別的網格），自己卻沒有那個頂點——畫的時候兩邊的三角形邊對不齊，會露出一點一點的縫，
   看到後面的端面（光照烘焙以後是黑的）。方塊拼的牆（門洞上方那一塊、走廊牆接樓梯間的牆）最常見。
   用法：node tools/blender/env_second/glb_tjunctions.js <glb> [材質名稱的正規式，預設 plaster|dado] [輸出 json]
   輸出：牆的三角形數、頂點數、T 形接頭的點數，以及「哪個網格的邊 <- 哪個網格的頂點」各幾個。
   修法：Blender 匯出前把這些點插進邊裡（tools/blender/dorm_hall.py 的 conform_tjunctions）；只剩「頂在對角線上」的垂直相接是正常的（不是共平面的縫）。 */
const fs=require('fs');
const f=process.argv[2], matRe=new RegExp(process.argv[3]||'plaster|dado');
const d=fs.readFileSync(f), n=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+n).toString('utf8')), bo=20+n+8;
const rdA=(ai)=>{ const a=J.accessors[ai], bv=J.bufferViews[a.bufferView], comp={5126:4,5123:2,5125:4,5121:1}[a.componentType], nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], st=bv.byteStride||comp*nc, off=bo+(bv.byteOffset||0)+(a.byteOffset||0), out=[];
  for(let i=0;i<a.count;i++){ const row=[]; for(let c=0;c<nc;c++){ const o=off+i*st+c*comp; row.push(a.componentType===5126?d.readFloatLE(o):a.componentType===5123?d.readUInt16LE(o):a.componentType===5125?d.readUInt32LE(o):d.readUInt8(o)); } out.push(nc===1?row[0]:row); } return out; };
// world transform per node (translation/rotation/scale only, assume no deep hierarchy issues)
function mat4(nd){ if(nd.matrix) return nd.matrix; const t=nd.translation||[0,0,0], r=nd.rotation||[0,0,0,1], s=nd.scale||[1,1,1]; const [x,y,z,w]=r;
  const m=[1-2*(y*y+z*z),2*(x*y+z*w),2*(x*z-y*w),0, 2*(x*y-z*w),1-2*(x*x+z*z),2*(y*z+x*w),0, 2*(x*z+y*w),2*(y*z-x*w),1-2*(x*x+y*y),0, t[0],t[1],t[2],1];
  for(let i=0;i<3;i++) for(let j=0;j<3;j++) m[i*4+j]*=s[i]; return m; }
const mul=(a,b)=>{ const o=new Array(16).fill(0); for(let i=0;i<4;i++) for(let j=0;j<4;j++) for(let k=0;k<4;k++) o[i*4+j]+=a[k*4+j]*b[i*4+k]; return o; };
const ap=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const tris=[]; const verts=[];
function walk(ni, M){ const nd=J.nodes[ni]; const W=mul(M,mat4(nd));
  if(nd.mesh!=null && !(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const m=J.meshes[nd.mesh];
    for(const pr of m.primitives){ const mt=pr.material!=null?J.materials[pr.material].name:''; if(!matRe.test(mt)) continue; const P=rdA(pr.attributes.POSITION).map(p=>ap(W,p)), I=pr.indices!=null?rdA(pr.indices):P.map((_,i)=>i);
      const base=verts.length; for(const p of P) verts.push({p, mesh:m.name}); for(let i=0;i<I.length;i+=3) tris.push([base+I[i],base+I[i+1],base+I[i+2],m.name]); } }
  for(const c of (nd.children||[])) walk(c,W); }
const I4=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; for(const r of J.scenes[J.scene||0].nodes) walk(r,I4);
// spatial hash of vertices
const H=new Map(), cs=0.25, key=(x,y,z)=>Math.floor(x/cs)+','+Math.floor(y/cs)+','+Math.floor(z/cs);
verts.forEach((v,i)=>{ const k=key(...v.p); if(!H.has(k)) H.set(k,[]); H.get(k).push(i); });
const found=new Map(); const eps=1.5e-4;
for(const [a,b,c,mn] of tris){ for(const [i,j] of [[a,b],[b,c],[c,a]]){ const A=verts[i].p, B=verts[j].p, e=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], L=Math.hypot(...e); if(L<0.02) continue;
    const steps=Math.ceil(L/cs)+1; const seen=new Set();
    for(let s=0;s<=steps;s++){ const t=s/steps, q=[A[0]+e[0]*t,A[1]+e[1]*t,A[2]+e[2]*t];
      for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) for(let dz=-1;dz<=1;dz++){ const k=(Math.floor(q[0]/cs)+dx)+','+(Math.floor(q[1]/cs)+dy)+','+(Math.floor(q[2]/cs)+dz); const lst=H.get(k); if(!lst) continue;
        for(const vi of lst){ if(seen.has(vi)) continue; seen.add(vi); const P=verts[vi].p, w=[P[0]-A[0],P[1]-A[1],P[2]-A[2]], tt=(w[0]*e[0]+w[1]*e[1]+w[2]*e[2])/(L*L); if(tt<=1e-3||tt>=1-1e-3) continue;
          const pr=[A[0]+e[0]*tt-P[0],A[1]+e[1]*tt-P[1],A[2]+e[2]*tt-P[2]]; if(Math.hypot(...pr)<eps){ const kk=P.map(v=>v.toFixed(3)).join(','); if(!found.has(kk)) found.set(kk,{p:P, edgeMesh:mn, vMesh:verts[vi].mesh}); } } } } } }
const arr=[...found.values()];
console.log('wall tris',tris.length,'verts',verts.length,'T-junction points',arr.length);
const byPair={}; for(const t of arr){ const k=t.edgeMesh+' <- '+t.vMesh; byPair[k]=(byPair[k]||0)+1; }
console.log(Object.entries(byPair).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>v+'  '+k).join('\n'));
if(process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(arr.map(t=>({p:t.p.map(v=>+v.toFixed(3)),e:t.edgeMesh,v:t.vMesh}))));
