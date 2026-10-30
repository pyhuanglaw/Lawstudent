// 博思教學館室內正式模型的階梯教室桌椅（BOYA-LM-1030，LAWWW2-B 2026-10-30）——不需要瀏覽器。
// teach_interior.py 把 101／102 的長桌、翻椅做進 boya_interior.glb；遊戲（teach3d.js）看到 SEATPANS 就藏起備用的方塊桌椅、用 Z3.seatFold 掀椅面。這支檢查模型和配置對得上：
//   ①節點：SEATPANS、LECT_<房號>_desk／_seat／_steel／_panel（不能被合併進大網格：遊戲用名字找）
//   ②翻椅：每個座位都分得到椅面頂點（zones3d.js seatFold 的分組規則：水平距離² < 0.2、高度在座位地面上 0.45 ± 0.3），每個椅面頂點都有座位（沒有分不到、轉不動的椅面）
//   ③長桌：每一排的桌面在那一排的平台上 0.75 m（teach3d.js LECT_DESK_TOP；替身抄筆記的手、桌上小物照這個高度）
//   ④光照貼圖：GLB 場景的 extras.lightmap 指到的白天、晚上兩張圖都在
// 用法：node tests/boya_lecture_glb_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), REL='assets/models/env/second_ai/boya_interior.glb';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/data/boya_layout.js'),'utf8'), L=JSON.parse(src.slice(src.indexOf('{',src.indexOf('BOYA_LAYOUT')),src.lastIndexOf('}')+1));
/* 讀 GLB：每個網格節點（套上節點的位移、旋轉、縮放）的頂點（世界座標）；場景的 extras */
const b=fs.readFileSync(path.join(ROOT,REL)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], st=bv.byteStride||nc*4, out=[];
  for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++) out.push(bin.readFloatLE(o+k*st+c*4)); return out; };
const mul=(A,B)=>{ const C=new Array(16).fill(0); for(let r=0;r<4;r++) for(let c=0;c<4;c++) for(let k=0;k<4;k++) C[c*4+r]+=A[k*4+r]*B[c*4+k]; return C; };
const trs=nd=>{ if(nd.matrix) return nd.matrix; const [x,y,z,w]=nd.rotation||[0,0,0,1], [sx,sy,sz]=nd.scale||[1,1,1], [tx,ty,tz]=nd.translation||[0,0,0];
  return [(1-2*(y*y+z*z))*sx,(2*(x*y+z*w))*sx,(2*(x*z-y*w))*sx,0,(2*(x*y-z*w))*sy,(1-2*(x*x+z*z))*sy,(2*(y*z+x*w))*sy,0,(2*(x*z+y*w))*sz,(2*(y*z-x*w))*sz,(1-2*(x*x+y*y))*sz,0,tx,ty,tz,1]; };
const V={};
const walk=(i,M)=>{ const nd=j.nodes[i], W=mul(M,trs(nd));
  if(nd.mesh!=null){ const out=V[nd.name]=V[nd.name]||[]; for(const pr of j.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION);
    for(let k=0;k<P.length;k+=3){ const x=P[k], y=P[k+1], z=P[k+2]; out.push([W[0]*x+W[4]*y+W[8]*z+W[12], W[1]*x+W[5]*y+W[9]*z+W[13], W[2]*x+W[6]*y+W[10]*z+W[14]]); } } }
  for(const c of nd.children||[]) walk(c,W); };
const sc=j.scenes[j.scene||0]; for(const r of sc.nodes) walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const LECT=L.rooms.filter(r=>r.kind==='lecture');
// ①
const want=['SEATPANS',...LECT.flatMap(r=>['desk','seat','steel','panel'].map(k=>'LECT_'+r.id+'_'+k))];
check('① 節點都在、沒有被合併（'+want.length+' 個）',want.every(k=>V[k]&&V[k].length),want.filter(k=>!V[k]).join('、')||want.join('、'));
// ②
const seats=LECT.flatMap(r=>r.seats.map(s=>({x:s.x,z:s.z,y:L.floors[s.lv|0].y+s.y,room:r.id}))), cnt=seats.map(()=>0); let orphan=0;
for(const v of V.SEATPANS||[]){ let bi=-1, bd=0.2; seats.forEach((s,k)=>{ const d=(v[0]-s.x)**2+(v[2]-s.z)**2; if(d<bd&&Math.abs(v[1]-s.y-0.45)<0.3){ bd=d; bi=k; } }); if(bi>=0) cnt[bi]++; else orphan++; }
const empty=cnt.filter(c=>c===0).length;
check('② 翻椅：'+seats.length+' 個座位都分得到椅面、每個椅面頂點都有座位',seats.length===132&&empty===0&&orphan===0&&(V.SEATPANS||[]).length>0,'沒有椅面的座位 '+empty+'、沒有座位的頂點 '+orphan+'、每個座位 '+Math.min(...cnt)+'～'+Math.max(...cnt)+' 個頂點');
// ③
const res=[]; for(const r of LECT){ const Y=L.floors[r.lv|0].y, D=V['LECT_'+r.id+'_desk']||[];
  for(const q of r.rowsData){ const z0=q.deskZ-r.deskD/2-0.01, z1=q.deskZ+r.deskD/2+0.01, ys=D.filter(v=>v[2]>=z0&&v[2]<=z1&&v[0]>=r.seatX0-0.01&&v[0]<=r.seatX1+0.01).map(v=>v[1]);
    res.push(ys.length?+(Math.max(...ys)-Y-q.y).toFixed(3):null); } }
check('③ 長桌：每一排的桌面在平台上 0.75 m（'+res.length+' 排）',res.length===LECT.reduce((a,r)=>a+r.rowsData.length,0)&&res.every(h=>h!==null&&Math.abs(h-0.75)<0.003),JSON.stringify(res));
// ④
const lm=sc.extras&&sc.extras.lightmap; const files=lm?['day','night'].map(k=>lm[k]||(lm.url?lm.url+'_'+k+'.webp':null)):[];
check('④ 光照貼圖：extras.lightmap 的白天、晚上兩張都在',!!lm&&files.length===2&&files.every(f=>f&&fs.existsSync(path.join(ROOT,f))),JSON.stringify(lm||null).slice(0,160));
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
