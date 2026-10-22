// 室內正式模型（room GLB）的天花板：單面、朝下（LAWWW2 2026-10-22）——不需要瀏覽器。
// 為什麼：室內鏡頭雙指可以拉到 6 m、往上拖到俯角 1.05（engine3d.js），鏡頭高度最多到 6.85 m；天花板雙面的話，鏡頭在天花板上面時畫面是一大片白
//   （118 巷九間店、日本宿舍房間、霖澤館 202／3F／4F、萬才館多功能教室、研討室 A 原本都是雙面、朝上：日本宿舍房間天花板 2.5 m、預設鏡頭 2.84 m，一進門就看到天花板的上面）。
//   單面朝下：從下面看得到、鏡頭在上面時看得穿（和 zones3d.js room() 的天花板、溫州街店家、便利商店一樣）。
// 檢查（每一份 GLB）：
//   ①天花板（材質名字結尾 ceiling、kceiling、ceiling_boards，那個材質最上面 0.3 m 以內的三角形：一盞茶屋的天花板木板也用在 0.82 m 高的檯面）都是單面、每個三角形朝下；
//   ②天花板那一層（最低的天花板高度往上）沒有雙面的「一大片」水平面：單一三角形 > 3.5 m²、長寬都超過 1.5 m（天花板最小的一一八茶飲一片 6 m²；
//     燈具、牆頂、鋁框是細長條，霖澤館 3F／4F 電梯井的頂蓋 2.9 m² 是實心量體的剖面，不算）。
// 用法：node tests/room_ceiling_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..'), DIR='assets/models/env/second_ai/';
const GLBS=['l118_dian','l118_self','l118_tea','l118_home','l118_cafe2','l118_pasta','l118_korea','l118_omu','l118_noodle2',
  'jp_room','linze_202','linze_3f','linze_4f','wancai_multi','wancai_sema',
  'wz_print_interior','wz_lin_interior','wz_teishoku_interior','wz_brunch_interior','wz_teahouse_interior','cvs_interior','cafe_interior','noodle_interior','bookstore_interior','dorm_interior','dorm_room4'];
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 讀 GLB：每個網格節點（套上節點的位移、旋轉、縮放）的三角形、材質名字、單雙面 */
function glb(rel){ const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const acc=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], ct=a.componentType, cs={5126:4,5125:4,5123:2,5121:1}[ct], st=bv.byteStride||nc*cs, out=[];
    for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++){ const p=o+k*st+c*cs; out.push(ct===5126?bin.readFloatLE(p):ct===5125?bin.readUInt32LE(p):ct===5123?bin.readUInt16LE(p):bin.readUInt8(p)); } return out; };
  const mul=(A,B)=>{ const C=new Array(16).fill(0); for(let r=0;r<4;r++) for(let c=0;c<4;c++) for(let k=0;k<4;k++) C[c*4+r]+=A[k*4+r]*B[c*4+k]; return C; };   /* 4×4、column-major（glTF）*/
  const trs=nd=>{ if(nd.matrix) return nd.matrix; const [x,y,z,w]=nd.rotation||[0,0,0,1], [sx,sy,sz]=nd.scale||[1,1,1], [tx,ty,tz]=nd.translation||[0,0,0];
    return [(1-2*(y*y+z*z))*sx,(2*(x*y+z*w))*sx,(2*(x*z-y*w))*sx,0,(2*(x*y-z*w))*sy,(1-2*(x*x+z*z))*sy,(2*(y*z+x*w))*sy,0,(2*(x*z+y*w))*sz,(2*(y*z-x*w))*sz,(1-2*(x*x+y*y))*sz,0,tx,ty,tz,1]; };
  const tris=[];
  const walk=(i,M)=>{ const nd=j.nodes[i], W=mul(M,trs(nd));
    if(nd.mesh!=null) for(const pr of j.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION), I=pr.indices!=null?acc(pr.indices):[...Array(P.length/3).keys()], m=pr.material!=null?j.materials[pr.material]:{};
      const v=k=>{ const x=P[k*3], y=P[k*3+1], z=P[k*3+2]; return [W[0]*x+W[4]*y+W[8]*z+W[12], W[1]*x+W[5]*y+W[9]*z+W[13], W[2]*x+W[6]*y+W[10]*z+W[14]]; };
      for(let t=0;t<I.length;t+=3) tris.push({a:v(I[t]),b:v(I[t+1]),c:v(I[t+2]),mat:m.name||'',ds:!!m.doubleSided,node:nd.name||''}); }
    for(const c of nd.children||[]) walk(c,W); };
  for(const r of j.scenes[j.scene||0].nodes) walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  return tris; }
const nrm=t=>{ const u=[t.b[0]-t.a[0],t.b[1]-t.a[1],t.b[2]-t.a[2]], w=[t.c[0]-t.a[0],t.c[1]-t.a[1],t.c[2]-t.a[2]], n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]], l=Math.hypot(...n)||1; return {n:n.map(q=>q/l),area:l/2}; };
for(const id of GLBS){ const rel=DIR+id+'.glb';
  if(!fs.existsSync(path.join(ROOT,rel))){ check(id+'：有正式模型',false,rel); continue; }
  const T=glb(rel), cm=T.filter(t=>/ceiling(_boards)?$/.test(t.mat)), top={}; for(const t of cm) top[t.mat]=Math.max(top[t.mat]||-1e9,t.a[1],t.b[1],t.c[1]);
  const ce=cm.filter(t=>Math.min(t.a[1],t.b[1],t.c[1])>=top[t.mat]-0.3);
  if(!ce.length){ check(id+'：有天花板（材質名字結尾 ceiling、ceiling_boards）',false); continue; }
  const bad=ce.filter(t=>t.ds||nrm(t).n[1]>-0.99), mats=[...new Set(ce.map(t=>t.mat+(t.ds?'（雙面）':'')))];
  check(id+'：天花板單面、朝下',bad.length===0,bad.length?(bad.length+'／'+ce.length+' 個三角形不是；'+mats.join('、')):mats.join('、'));
  const H=Math.min(...ce.map(t=>Math.min(t.a[1],t.b[1],t.c[1])));
  let mx=0, who=''; for(const t of T){ if(!t.ds||Math.min(t.a[1],t.b[1],t.c[1])<H-0.02) continue; const {n,area}=nrm(t), ex=Math.max(t.a[0],t.b[0],t.c[0])-Math.min(t.a[0],t.b[0],t.c[0]), ez=Math.max(t.a[2],t.b[2],t.c[2])-Math.min(t.a[2],t.b[2],t.c[2]); if(Math.abs(n[1])>0.97&&Math.min(ex,ez)>1.5&&area>mx){ mx=area; who=t.node+'／'+t.mat+' '+ex.toFixed(2)+'×'+ez.toFixed(2)+' m'; } }
  check(id+'：天花板那一層沒有雙面的一大片水平面（單一三角形 ≤ 3.5 m²，長寬都超過 1.5 m 的才算）',mx<=3.5,'天花板 '+H.toFixed(2)+' m；最大一片 '+mx.toFixed(2)+' m²'+(who?'（'+who+'）':'')); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
