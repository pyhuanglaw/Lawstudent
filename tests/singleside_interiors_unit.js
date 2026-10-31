// 室內 GLB 單面（PERF-SINGLESIDE-GLB-1025，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   遊戲把室內的 WALL_* 牆設成 transparent 才能淡出（attachFormal／attachRoomGLB），材質又是雙面：three.js 雙面又半透明要畫兩次。
//   同一頁全部改單面的上限：社科圖 2.25→3.3、總圖大廳 1.9→2.95、便利商店 3.5→4.8。lib2.single_side 匯出：
//   1. 社科圖、總圖大廳、便利商店的材質除了玻璃都是單面（glTF doubleSided false）；玻璃照舊雙面；
//   2. 開口的零件補了反面（每個三角形都有反過來的分身）：總圖的葉片卡（室內樹、盆栽）；社科圖的天井、竹子；便利商店的牆面；
//      （便利商店的牆面原本也在這裡：INTERIOR-AAA 光照烘焙（10-31）烘焙前拿掉了反面，改成 2c 檢查留下來的朝店裡。）
//      （總圖的樓梯踏面原本也在這裡：LIB-HALL-LM-1028 大樓梯改成每階一塊實心石材，烘焙前也拿掉了有光照貼圖的物件的反面——踏面現在是封閉的零件，不需要反面。）
//   2b. 社科圖的天井（SOCLIB-LM-1030 光照烘焙以後）：有光照貼圖的物件烘焙前拿掉反面（bake_room.py 的 drop_backfaces：反面的光照貼圖是黑的），
//      留下來的要是從閱覽室看得到的那一面——井壁朝井裡、井口收邊朝下；朝外、朝上的那一面在天花板上面，看不到。拿錯一面，從下面看天窗整圈井壁不見。
//   3. 原本就單面的天花板（朝下：鏡頭超過天花板高度時看得穿，剖面視角）沒有補朝上的那一面——第一次試便利商店，從高處看整片擋住；
//   4. 背面看不到的沒有補：社科圖的書、便利商店架上的商品（三角形數和改前一樣；便利商店只多端架促銷牌的背面 8 個）；
//   5. 便利商店端架的 4 張促銷牌有背面（BB-B 10-25：材質改單面以後，從貨架另一頭看促銷牌整片不見；只給促銷牌補一片反面，商品貼圖集照舊單面）。
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
const P2=[['總圖 葉片卡',GL.library,/^lb_leaf_/]];   /* 便利商店的牆面：光照烘焙以後拿掉反面（見 2c）*/
const r2=P2.map(([n,G,re])=>{ const [ok,nt]=paired(G,re); return [n,ok,nt]; });
check('2. 開口的零件有反面（至少一半的三角形有反過來的分身；封閉的部分不需要）', r2.every(([,ok,nt])=>nt>0&&ok>=nt*0.5), r2.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
{ const sl=fs.readFileSync(path.join(ROOT,'src/data/soclib_layout.js'),'utf8'), SK=JSON.parse(sl.slice(sl.indexOf('{',sl.indexOf('SOCLIB_LAYOUT')),sl.lastIndexOf('}')+1)).skylights;
  let wallIn=0, wallOut=0, down=0, up=0, far=0;
  for(const x of GL.soclib.prims){ if(x.mat!=='soclib_lightwell') continue; const p=x.p, P=GL.soclib.acc(p.attributes.POSITION), I=p.indices!=null?GL.soclib.acc(p.indices):null, n=(I?I.length:P.length/3)/3, v=(t,k)=>{ const i=I?I[t*3+k]:t*3+k; return [P[i*3],P[i*3+1],P[i*3+2]]; };
    for(let t=0;t<n;t++){ const a=v(t,0), b=v(t,1), c=v(t,2), u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], nm=[u[1]*w[2]-u[2]*w[1], u[2]*w[0]-u[0]*w[2], u[0]*w[1]-u[1]*w[0]], cx=(a[0]+b[0]+c[0])/3, cz=(a[2]+b[2]+c[2])/3;
      const s_=SK.reduce((m,q)=>Math.hypot(cx-q.x,cz-q.z)<Math.hypot(cx-m.x,cz-m.z)?q:m, SK[0]); if(Math.hypot(cx-s_.x,cz-s_.z)>s_.r+0.3){ far++; continue; }
      if(Math.abs(nm[1])>0.5*Math.hypot(nm[0],nm[1],nm[2])){ if(nm[1]<0) down++; else up++; } else if(nm[0]*(cx-s_.x)+nm[2]*(cz-s_.z)<0) wallIn++; else wallOut++; } }
  const [ok,nt]=paired(GL.soclib,/^soclib_lightwell$/);
  check('2b. 社科圖的天井（光照烘焙以後拿掉反面）：留下來的是看得到的那一面（井壁朝井裡、井口收邊朝下）、'+SK.length+' 個天窗', nt>0&&ok===0&&wallIn>0&&down>0&&!wallOut&&!up&&!far, '井壁朝裡 '+wallIn+'、朝外 '+wallOut+'；收邊朝下 '+down+'、朝上 '+up+'；離天窗太遠 '+far+'；有反面 '+ok+'/'+nt); }
{ let inA=0, outA=0;   /* 2c. 便利商店的牆面（INTERIOR-AAA 光照烘焙 10-31，bake_cvs.sh）：烘焙前拿掉有光照貼圖的物件的反面（bake_room.py 的 drop_backfaces：反面的光照貼圖是黑的）。
     牆是 12 cm 厚的方盒：牆裡面那一面（x=±5.88、z=±4.38）要朝店裡——拿錯一面，進店裡整面牆不見。牆外那一面、門窗洞的側面照舊（鏡頭在牆外時牆本來就淡出） */
  for(const x of GL.cvs.prims){ if(x.mat!=='cvs_wall') continue; const p=x.p, P=GL.cvs.acc(p.attributes.POSITION), I=p.indices!=null?GL.cvs.acc(p.indices):null, n=(I?I.length:P.length/3)/3, v=(t,k)=>{ const i=I?I[t*3+k]:t*3+k; return [P[i*3],P[i*3+1],P[i*3+2]]; };
    for(let t=0;t<n;t++){ const a=v(t,0), b=v(t,1), c=v(t,2), u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], nm=[u[1]*w[2]-u[2]*w[1], u[2]*w[0]-u[0]*w[2], u[0]*w[1]-u[1]*w[0]], ar=Math.hypot(...nm)/2, cx=(a[0]+b[0]+c[0])/3, cz=(a[2]+b[2]+c[2])/3;
      const onX=Math.abs(Math.abs(cx)-5.88)<0.02&&Math.abs(nm[0])>Math.abs(nm[2]), onZ=Math.abs(Math.abs(cz)-4.38)<0.02&&Math.abs(nm[2])>Math.abs(nm[0]); if(!onX&&!onZ) continue;
      if((onX?nm[0]*cx:nm[2]*cz)<0) inA+=ar; else outA+=ar; } }
  const [ok]=paired(GL.cvs,/^cvs_wall$/), lm=!!((GL.cvs.J.scenes[0].extras||{}).lightmap);
  check('2c. 便利商店的牆面（光照烘焙以後拿掉反面）：牆裡面那一面都朝店裡', lm&&ok===0&&inA>100&&outA<0.01, '有光照貼圖 '+lm+'；朝店裡 '+inA.toFixed(1)+' m²、朝外 '+outA.toFixed(1)+' m²；還有反面的 '+ok); }
const [cok,cnt]=paired(GL.cvs,/^cvs_ceiling$/), ceil=GL.cvs.mats.find(m=>m.name==='cvs_ceiling');
check('3. 便利商店的天花板沒有補朝上的那一面（照舊單面朝下，高處看得穿）', ceil&&!ceil.doubleSided&&cnt>0&&cok===0, 'cvs_ceiling '+cok+'/'+cnt);
check('4. 社科圖的書、便利商店的商品沒有補反面（三角形數：44,362、47,172＋促銷牌背面 8）', tris(GL.soclib,/^soclib_books$/)===44362&&tris(GL.cvs,/^cvs_goods_atlas$/)===47180, tris(GL.soclib,/^soclib_books$/)+' / '+tris(GL.cvs,/^cvs_goods_atlas$/));
{ const [ok,nt]=paired(GL.cvs,/^cvs_goods_atlas$/); check('5. 便利商店端架的 4 張促銷牌有背面（前後各 8 個三角形互為反面；其他商品沒有）', ok===16, ok+'/'+nt); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
