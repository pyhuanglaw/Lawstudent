// 室內 GLB 單面（PERF-SINGLESIDE-GLB-1025，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   遊戲把室內的 WALL_* 牆設成 transparent 才能淡出（attachFormal／attachRoomGLB），材質又是雙面：three.js 雙面又半透明要畫兩次。
//   同一頁全部改單面的上限：社科圖 2.25→3.3、總圖大廳 1.9→2.95、便利商店 3.5→4.8。lib2.single_side 匯出：
//   1. 社科圖、總圖大廳、便利商店的材質除了玻璃都是單面（glTF doubleSided false）；玻璃照舊雙面；
//   2. 開口的零件補了反面（每個三角形都有反過來的分身）：總圖的葉片卡（室內樹、盆栽）、樓梯踏面；社科圖的天井、竹子；便利商店的牆面；
//   3. 原本就單面的天花板（朝下：鏡頭超過天花板高度時看得穿，剖面視角）沒有補朝上的那一面——第一次試便利商店，從高處看整片擋住；
//   4. 背面看不到的沒有補：社科圖的書、便利商店架上的商品（三角形數和改前一樣）。
// 修改前 FAIL。用法：node tests/singleside_interiors_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function load(rel){ const b=fs.readFileSync(path.join(ROOT,rel)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], off=(bv.byteOffset||0)+(a.byteOffset||0), n={SCALAR:1,VEC3:3}[a.type], T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
    return new T(bin.buffer.slice(bin.byteOffset+off, bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const prims=[]; for(const n of J.nodes){ if(n.mesh==null) continue; for(const p of J.meshes[n.mesh].primitives) prims.push({node:n.name||'', mat:J.materials[p.material].name, p}); }
  return {J, acc, prims, mats:J.materials}; }
function paired(G,mre){ let ok=0, nt=0; for(const x of G.prims){ if(!mre.test(x.mat)) continue; const p=x.p, P=G.acc(p.attributes.POSITION), I=p.indices!=null?G.acc(p.indices):null, n=(I?I.length:P.length/3)/3;
    const key=k=>{ const v=I?I[k]:k; return P[v*3].toFixed(4)+','+P[v*3+1].toFixed(4)+','+P[v*3+2].toFixed(4); }; const set=new Set(), tri=[];
    for(let t=0;t<n;t++){ const a=key(t*3), b=key(t*3+1), c=key(t*3+2); tri.push([a,b,c]); set.add([a,b,c].join('|')); }
    for(const [a,b,c] of tri) if([[a,c,b],[c,b,a],[b,a,c]].some(r=>set.has(r.join('|')))) ok++; nt+=n; } return [ok,nt]; }
const tris=(G,mre)=>{ let t=0; for(const x of G.prims) if(mre.test(x.mat)) t+=(x.p.indices!=null?G.J.accessors[x.p.indices].count:G.J.accessors[x.p.attributes.POSITION].count)/3; return t; };
const GL={ soclib:load('assets/models/env/second_ai/soclib_interior.glb'), library:load('assets/models/env/library_interior.glb'), cvs:load('assets/models/env/second_ai/cvs_interior.glb') };

for(const [k,G] of Object.entries(GL)){ const ds=G.mats.filter(m=>m.doubleSided&&!/glass/.test(m.name)).map(m=>m.name), gl=G.mats.filter(m=>/glass/.test(m.name));
  check('1. '+k+'：除了玻璃都單面（'+G.mats.length+' 個材質）；玻璃照舊雙面', !ds.length&&gl.every(m=>m.doubleSided), ds.length?'雙面：'+ds.slice(0,8).join(' '):gl.map(m=>m.name).join(' ')); }
const P2=[['總圖 葉片卡',GL.library,/^lb_leaf_/],['總圖 樓梯踏面',GL.library,/^lb_step$/],['社科圖 天井',GL.soclib,/^soclib_lightwell$/],['便利商店 牆面',GL.cvs,/^cvs_wall$/]];
const r2=P2.map(([n,G,re])=>{ const [ok,nt]=paired(G,re); return [n,ok,nt]; });
check('2. 開口的零件有反面（至少一半的三角形有反過來的分身；封閉的部分不需要）', r2.every(([,ok,nt])=>nt>0&&ok>=nt*0.5), r2.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
const [cok,cnt]=paired(GL.cvs,/^cvs_ceiling$/), ceil=GL.cvs.mats.find(m=>m.name==='cvs_ceiling');
check('3. 便利商店的天花板沒有補朝上的那一面（照舊單面朝下，高處看得穿）', ceil&&!ceil.doubleSided&&cnt>0&&cok===0, 'cvs_ceiling '+cok+'/'+cnt);
check('4. 社科圖的書、便利商店的商品沒有補反面（三角形數和改前一樣：44,362、47,172）', tris(GL.soclib,/^soclib_books$/)===44362&&tris(GL.cvs,/^cvs_goods_atlas$/)===47172, tris(GL.soclib,/^soclib_books$/)+' / '+tris(GL.cvs,/^cvs_goods_atlas$/));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
