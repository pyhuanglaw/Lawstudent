// 美國室內 GLB 單面（PERF-SINGLESIDE-GLB-1025 第四份，LAWWW2-B 2026-10-25）——不需要瀏覽器，讀 GLB。
//   同一頁全部改單面的上限：公寓 2.0→3.05、C 棟 208 1.85→2.9、法圖 3.6→5.3／5.0→7.5、亞洲超市 2.85→4.15、C 棟臥室 4.9→6.2（Z3.attachRoomGLB 把 WALL_* 設成 transparent，雙面又半透明要畫兩次）。
//   1. us_apartment、us_shared、us_lawlib、us_asian_market、us_bed_c 除了玻璃都單面；玻璃照舊雙面；
//      遊戲照名字接手、網格不動的零件，只有它們在用的材質照舊雙面：亞洲超市門外的景（usam_view，一片、正面朝外——第一次改單面，從店裡看整片不見）、公寓和 C 棟的門牌（usa_plate）；
//   2. 開口的零件補了反面（每個三角形都有反過來的分身）：法圖的鐵絲雕塑、亞洲超市的層架、公寓的窗簾、C 棟臥室的版畫；
//      2b：有光照貼圖的（10-31 起亞洲超市的層架、公寓的窗簾）烘焙時拿掉了反面，改檢查烘過、沒有反面；
//   3. 原本就單面的天花板（朝下：鏡頭超過天花板高度時看得穿）沒有補朝上的那一面：公寓、C 棟 208、C 棟臥室；
//   4. 家具都在（公寓 33 件、C 棟 208 37 件——匯出時少了 aa_support／bb_support 的道具組，腳本會安靜地跳過，第一次在舊的測試樹匯出 C 棟 208 只剩 1.2 萬個三角形）；
//   5. 沒有裡外相反的薄零件（封閉、方向一致、體積是負的、有一邊 1 mm～1 m；單面會從外面看到背面）。
// 修改前 FAIL。用法：node tests/singleside_us_unit.js
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
const GL={ us_apartment:load('us_apartment'), us_shared:load('us_shared'), us_lawlib:load('us_lawlib'), us_asian_market:load('us_asian_market'), us_bed_c:load('us_bed_c') };
const KEEP2={us_apartment:/^usa_plate$/, us_shared:/^usa_plate$/, us_asian_market:/^usam_view$/};
for(const [k,G] of Object.entries(GL)){ const kp=KEEP2[k], ds=G.mats.filter(m=>m.doubleSided&&!/glass/.test(m.name)&&!(kp&&kp.test(m.name))).map(m=>m.name), gl=G.mats.filter(m=>/glass/.test(m.name)), kk=kp?G.mats.filter(m=>kp.test(m.name)):[];
  check('1. '+k+'：除了玻璃'+(kp?'、'+kp.source.replace(/[\^$]/g,''):'')+'都單面（'+G.mats.length+' 個材質）；玻璃'+(kp?'和它':'')+'照舊雙面', !ds.length&&gl.length>0&&gl.every(m=>m.doubleSided)&&kk.every(m=>m.doubleSided)&&(!kp||kk.length===1), ds.length?'雙面：'+ds.slice(0,8).join(' '):gl.concat(kk).map(m=>m.name+(m.doubleSided?'':'(單面)')).join(' ')); }
check('1. 亞洲超市門外的景（usam_view）還在', GL.us_asian_market.J.nodes.some(nd=>nd.name==='usam_view'&&nd.mesh!=null));
const P2=[['法圖 鐵絲雕塑',GL.us_lawlib,/^usll_wire_sculpture$/],['亞洲超市 層架',GL.us_asian_market,/^usam_shelf$/],['公寓 窗簾',GL.us_apartment,/^usa_curtain$/],['C 棟臥室 版畫',GL.us_bed_c,/^us_bed_c_print$/]];
/* 2b（INTERIOR-AAA 美國室內光照烘焙，LAWWW2-B 10-31；和 singleside_gym_unit 的 2b 同一個做法）：有光照貼圖的零件（亞洲超市的層架、公寓的窗簾）烘焙時拿掉了疊在一起的反面
   （不拿掉的話光一出去就打到反面，整面烘成全黑；bake_room.py 留朝房間的那一面）——這種零件改檢查：有第二套 UV（烘過）、沒有反面。沒有烘的照舊檢查有反面 */
const lmOf=(G,re)=>{ const ps=G.prims.filter(x=>re.test(x.mat)); return ps.length>0&&ps.every(x=>x.p.attributes.TEXCOORD_1!=null); };
const r2=P2.map(([n,G,re])=>{ const [ok,nt]=paired(G,re); return [n,ok,nt,lmOf(G,re)]; });
const r2a=r2.filter(x=>!x[3]), r2b=r2.filter(x=>x[3]);
check('2. 開口的零件有反面（至少一半的三角形有反過來的分身）', r2a.length>0&&r2a.every(([,ok,nt])=>nt>0&&ok>=nt*0.5), r2a.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
check('2b. 有光照貼圖的開口零件：烘過（第二套 UV）、疊在一起的反面拿掉了', r2b.every(([,ok,nt])=>nt>0&&ok===0), r2b.length?r2b.map(([n,ok,nt])=>n+' 反面 '+ok+'/'+nt).join('  '):'（沒有烘過的）');
const P3=[['公寓 天花板',GL.us_apartment,'usa_ceiling'],['C 棟 208 天花板',GL.us_shared,'usa_ceiling'],['C 棟臥室 天花板',GL.us_bed_c,'us_bed_c_ceiling']];
const r3=P3.map(([n,G,m])=>{ const [ok,nt]=paired(G,new RegExp('^'+m+'$')); const mm=G.mats.find(x=>x.name===m); return [n,ok,nt,mm&&!mm.doubleSided]; });
check('3. 原本就單面的天花板沒有補朝上的面（照舊單面）', r3.every(([,ok,nt,ss])=>nt>0&&ok===0&&ss), r3.map(([n,ok,nt])=>n+' '+ok+'/'+nt).join('  '));
check('4. 家具都在：公寓 33 件、C 棟 208 37 件', GL.us_apartment.info.furniture===33&&GL.us_shared.info.furniture===37, 'us_apartment '+GL.us_apartment.info.furniture+'、us_shared '+GL.us_shared.info.furniture);
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
