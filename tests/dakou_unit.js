/* 大口漢堡（xs_dakou，兩層樓；XS-SHOPS-REST-1105 ①，LAWWW2-C 11-05）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   ① 區域有登記、兩顆正式模型（BB 的 dakou_1f v2b、dakou_2f v2）在 ASSETS
   ② 兩層導航同尺寸、同原點；二樓地板 3.6；進來的位置站得住、在「離開大口漢堡」的範圍外面
   ③ 樓梯：畫面上第 k 階高 0.1714k、斜面從 0 爬到 3.6；坡度（人物半徑內的高度差 < 0.24）；一樓 GLB 的 20 個踏面和導航一樣高（讀 GLB）
   ④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）；二樓 → 下樓 → 一樓店門（換回第 0 層）；找路經過樓梯
   ⑤ 一樓：17 個座位（高腳吧台 7、雙人桌 10）、點餐、自助點餐、取餐、回收餐盤走得到；高腳椅照座面抬高
   ⑥ 二樓：62 個座位（全部「讀書」）、插座、看書架走得到；79 個「坐下」按鈕都帶樓層
   ⑦ 擋得住：二樓樓梯口的洞站不住；一樓這一層從樓梯頂、樓梯側邊走不出去；廚房、員工通道、櫃檯後面進不去
   ⑧ 新生南路：「進大口漢堡」→ xs_dakou；從店裡出來的點站得住、在店門互動點的範圍外面、走得回店門
   ⑨ 正式模型：一樓 GLB 的東西都在一樓（y ≤ 3.6），二樓 GLB 的都在二樓（y ≥ 3.5）；兩顆的 WALL_* 網格都拿得到 dir（自己的或上層節點的）
   ⑩ 沒有小孤島：兩層每 0.1 m 站得住的點，從進來的位置（一樓）、樓梯口（二樓）都走得到（v9.3 #31）
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131）。用法：node tests/dakou_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=DAKOU_LAYOUT.shop, S=L.stairs, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,220);
/* 座位的走近點：GAME.seatApproach 的候選（前 0.5、後 0.6、左右 0.55、後 0.7、0.75、前 0.8、後 0.9），站得住、在「坐下」的範圍（0.8 m）裡 */
const seatAps=(s,n,lv)=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw);
  return [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8]].map(([dx,dz])=>[s.x+dx,s.z+dz,lv]).filter(a=>n.clear(a[0],a[1],0.3)); };
// 互動點（在家具前面）：半徑 0.9 內找站得住、走得到的點
const nearOk=(q,from,n,lv)=>{ for(let r=0;r<=0.9;r+=0.1) for(let a=0;a<6.28;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(n.clear(x,zz,0.3)&&walk(from,[x,zz,lv]).ok) return true; } return false; };

// ① 登記
const man=k=>ASSETS.manifest[k]&&fs.existsSync(path.join(ROOT,ASSETS.manifest[k].url));
check('① Z3.ZONES 有 xs_dakou；ASSETS 有兩顆正式模型 bldg.xs_dakou_1f、bldg.xs_dakou_2f（BB）',!!Z3.ZONES.xs_dakou&&man('bldg.xs_dakou_1f')&&man('bldg.xs_dakou_2f'));
// ② 兩層、進來的位置
const z=loadZone('xs_dakou'), [n0,n1]=z.levels, yU=L.levels[1].y, IN=[z.spawn.x,z.spawn.z,0];
const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
check('② 兩層導航同尺寸、同原點；二樓地板 3.6；levelGroups 兩組；slabs 三塊',z.levels.length===2&&n0.cols===n1.cols&&n0.rows===n1.rows&&n0.ox===n1.ox&&n0.oz===n1.oz&&Math.abs(n1.y0-yU)<1e-6&&z.levelGroups.length===2&&z.levelGroups[1].y===yU&&z.slabs.length===3);
check('② 進來的位置站得住、在「離開大口漢堡」的範圍外面',n0.clear(IN[0],IN[1],0.3)&&!!ex&&Math.hypot(IN[0]-ex.x,IN[1]-ex.z)>ex.radius+0.1,`(${IN[0]}, ${IN[1]})，離出口 ${ex?Math.hypot(IN[0]-ex.x,IN[1]-ex.z).toFixed(2):'—'} m`);
check('② 店門「離開大口漢堡」從進來的位置走得到',!!ex&&nearOk({x:ex.x,z:ex.z},IN,n0,0));
// ③ 樓梯
const st=DK3.stairSurf(L);
{ let okv=true, bad=''; for(let k=1;k<S.n;k++){ const zz=st.z1-(k-0.5)*S.tread, v=n0.visualHeightAt?n0.visualHeightAt(S.x,zz):null; if(v!==null&&Math.abs(v-k*S.rise)>0.011){ okv=false; bad=`第 ${k} 階 ${v.toFixed(3)}`; break; } }
  const h0=n0.heightAt(S.x,st.z1-0.02), h1=n1.heightAt(S.x,st.z0+0.02), hl=n1.heightAt(S.x,st.z0-0.3);
  check('③ 樓梯：第 k 階畫面上高 0.1714k、斜面從 0 爬到 3.6、樓梯口（二樓）3.6',okv&&h0<0.05&&Math.abs(h1-yU)<0.05&&Math.abs(hl-yU)<1e-6,`底 ${h0.toFixed(2)}、頂 ${h1.toFixed(2)}、樓梯口 ${hl.toFixed(2)}${bad?'｜'+bad:''}`);
  const slope=Math.atan2(S.ya-S.yb,st.z1-st.z0), dh=0.32*Math.tan(slope);
  check('③ 樓梯的坡度：人物半徑 0.32 m 內高度差 < 0.24（引擎 clear() 的上限 0.25）',dh<0.24,(slope*180/Math.PI).toFixed(1)+'°、'+dh.toFixed(3)+' m'); }
// 讀 GLB 的頂點（glTF 座標＝遊戲座標；節點的平移、縮放、旋轉照實算）
function glbVerts(key){ const G=path.join(ROOT,ASSETS.manifest[key].url), b=fs.readFileSync(G), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), stv=v.byteStride||12, out=[]; for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(o+k*stv),bin.readFloatLE(o+k*stv+4),bin.readFloatLE(o+k*stv+8)]); return out; };
  const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));
  const mat=i=>{ const n=J.nodes[i], m=new THREE.Matrix4(); if(n.matrix) m.fromArray(n.matrix); else m.compose(new THREE.Vector3().fromArray(n.translation||[0,0,0]),new THREE.Quaternion().fromArray(n.rotation||[0,0,0,1]),new THREE.Vector3().fromArray(n.scale||[1,1,1])); return par[i]!=null?mat(par[i]).multiply(m):m; };
  const out=[]; J.nodes.forEach((n,i)=>{ if(n.mesh==null) return; const M=mat(i), v=new THREE.Vector3(), inst=n.extensions&&n.extensions.EXT_mesh_gpu_instancing; const P=[];
    for(const p of J.meshes[n.mesh].primitives) for(const q of acc(p.attributes.POSITION)) P.push(q);
    const Ts=inst&&inst.attributes&&inst.attributes.TRANSLATION!=null?acc(inst.attributes.TRANSLATION):[[0,0,0]];
    let lo=1e9, hi=-1e9; for(const t of Ts) for(const q of P){ v.fromArray(q).add(new THREE.Vector3().fromArray(t)).applyMatrix4(M); lo=Math.min(lo,v.y); hi=Math.max(hi,v.y); }
    out.push({name:n.name,i,lo,hi,mat:J.meshes[n.mesh].primitives.map(p=>J.materials[p.material]&&J.materials[p.material].name),pts:inst?null:P.map(q=>v.fromArray(q).applyMatrix4(M).toArray())}); });
  return {J,par,nodes:out}; }
// ③ 一樓 GLB 的踏面和導航一樣高（樓梯範圍裡，第 k 階那一段最高的點＝k×0.1714；人走在樓梯上不浮起來、不陷進去）
{ const G1=glbVerts('bldg.xs_dakou_1f'); const V=[]; for(const n of G1.nodes) if(n.pts&&!/^WALL_|^GLOW_|^NIGHT_/.test(n.name)) for(const p of n.pts) V.push(p);
  const sel=V.filter(v=>v[0]>st.x0+0.3&&v[0]<st.x1+0.15&&v[2]>st.z0&&v[2]<st.z1+0.05&&v[1]>0.05&&v[1]<S.ya+0.1); let worst=0, found=0;
  for(let k=1;k<S.n;k++){ const za=st.z1-k*S.tread, zb=st.z1-(k-1)*S.tread, pts=sel.filter(v=>v[2]>=za-0.03&&v[2]<=zb+0.03&&v[1]<=k*S.rise+0.06); if(!pts.length) continue; found++; worst=Math.max(worst,Math.abs(Math.max(...pts.map(v=>v[1]))-k*S.rise)); }
  check(`③ 一樓 GLB 的 ${S.n-1} 個踏面和導航一樣高（差 ≤ 0.02 m）`,found===S.n-1&&worst<=0.02,`找到 ${found} 個、最大差 ${worst.toFixed(3)} m`); }
// ④ 上下樓
const TOP=[S.x,st.z0-0.45,1];   // 二樓樓梯口
let r=walk(IN,TOP); check('④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）',r.ok,fmt(r));
r=walk(TOP,[0,6.0,0]); check('④ 二樓樓梯口 → 下樓 → 一樓店門（換回第 0 層）',r.ok,fmt(r));
{ const p=E.pathTo(IN[0],IN[1],0,-1.0,-3.0,1); check('④ 一樓到二樓的找路經過樓梯（不會直接穿過樓板）',!!p&&p.length>0&&p.some(q=>{ const x=Array.isArray(q)?q[0]:q.x, zz=Array.isArray(q)?q[1]:q.z; return x>st.x0-0.1&&x<st.x1+0.1&&zz>st.z0&&zz<st.z1; })); }
// ⑤ 一樓
{ const s0=L.floor1.seats, bad=[]; for(const s of s0) if(!seatAps(s,n0,0).some(a=>walk(IN,a).ok)) bad.push(`(${s.x},${s.z})`);
  const it0=DK3.INTERACT().filter(q=>q.lv===0), bad2=it0.filter(q=>!nearOk(q,IN,n0,0)).map(q=>q.kind+`(${q.x},${q.z})`);
  check(`⑤ 一樓：${s0.length} 個座位、${it0.length} 個互動點（${it0.map(q=>q.kind).join('、')}）都走得到`,s0.length===17&&it0.length===4&&!bad.length&&!bad2.length,[bad.join(' '),bad2.join(' ')].filter(Boolean).join('｜'));
  const hs=E.interactables.filter(q=>q.seat&&q.lv===0&&q.seat.lift), lift=DK3.STOOL_TOP-CHAR_SIT();
  check('⑤ 一樓 7 張高腳椅照座面（0.795 m）抬高，其他不抬',hs.length===7&&hs.every(q=>Math.abs(q.seat.lift-lift)<0.002&&q.x<-5),`${hs.length} 張、抬 ${hs[0]?hs[0].seat.lift:'—'} m`); }
function CHAR_SIT(){ return (typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.45; }
// ⑥ 二樓
{ const s1=L.floor2.seats, bad=[]; for(const s of s1) if(!seatAps(s,n1,1).some(a=>walk(TOP,a).ok)) bad.push(`${s.label}(${s.x},${s.z})`);
  const it1=DK3.INTERACT().filter(q=>q.lv===1), bad2=it1.filter(q=>!nearOk(q,TOP,n1,1)).map(q=>q.kind+`(${q.x},${q.z})`);
  check(`⑥ 二樓：${s1.length} 個座位、${it1.length} 個互動點（${it1.map(q=>q.kind).join('、')}）都走得到`,s1.length===62&&it1.length===3&&!bad.length&&!bad2.length,[bad.join(' '),bad2.join(' ')].filter(Boolean).join('｜'));
  const seats=E.interactables.filter(q=>q.seat), up=seats.filter(q=>q.lv===1);
  check('⑥ 79 個「坐下」按鈕都帶樓層；二樓 62 個都可以讀書、座位高度 3.6；插座吧台 14 張高腳椅抬高',seats.length===79&&seats.every(q=>q.lv===q.seat.lv)&&up.length===62&&up.every(q=>q.study&&q.seat.y===yU)&&up.filter(q=>q.seat.lift).length===14); }
// ⑦ 擋得住
{ const H=L.stairHole;
  check('⑦ 二樓樓梯口的洞（樓梯下半段的上面）站不住',!n1.clear(S.x,3.0,0.2)&&!n1.clear(S.x,2.0,0.2)&&!n1.clear(H.x0+0.2,3.6,0.1));
  check('⑦ 一樓這一層：樓梯頂北邊、樓梯西側（高處）站不住；樓梯上站得住',!n0.clear(S.x,st.z0-0.2,0.2)&&!n0.clear(S.x-S.w/2-0.05,0.5,0.1)&&n0.clear(S.x,2.5,0.3));
  const inside=[[-1.4,-6.2,'廚房'],[4.0,-6.0,'員工通道'],[-1.5,-4.9,'櫃檯後面'],[5.3,-0.35,'樓梯下的儲藏室（一樓地面高度）']], bad=[];
  for(const [x,zz,nm] of inside){ const ok=nm.startsWith('樓梯下')?n0.heightAt(x,zz)>1.5:!n0.clear(x,zz,0.3); if(!ok) bad.push(nm); }
  check('⑦ 一樓：廚房、員工通道、櫃檯後面進不去；樓梯下面是樓梯的高處（不是一樓地面）',!bad.length,bad.join('、')); }
// ⑧ 新生南路
{ const out=ex.exit.spawn; const zs=loadZone('xinsheng'); const door=E.interactables.find(q=>q.exit&&q.exit.to==='xs_dakou');
  check('⑧ 新生南路：「進大口漢堡」→ xs_dakou',!!door&&/^進大口漢堡/.test(door.label),door?door.label:'沒有');
  const ok=!!door&&zs.nav.clear(out.x,out.z,0.3)&&Math.hypot(out.x-door.x,out.z-door.z)>door.radius+0.1&&walk([out.x,out.z,0],[door.x+0.5,door.z,0]).ok;
  check('⑧ 從店裡出來站在騎樓：站得住、在店門互動點的範圍外面、走得回店門',ok,`(${out.x}, ${out.z})${door?'，離店門 '+Math.hypot(out.x-door.x,out.z-door.z).toFixed(2)+' m（範圍 '+door.radius+'）':''}`); }
// ⑨ 正式模型分兩層、牆有方向
{ const G1=glbVerts('bldg.xs_dakou_1f'), G2=glbVerts('bldg.xs_dakou_2f');
  /* 樓梯間（stairHole 外擴 0.15 m）本來就兩層高：一樓 GLB 的樓梯扶手、玻璃欄杆往上到二樓，二樓 GLB 的樓梯間牆面、欄杆往下垂——照位置判斷，其他地方一樓的不能高過二樓地板、二樓的不能低過二樓地板 */
  const H=L.stairHole, inWell=p=>p[0]>=H.x0-0.15&&p[0]<=H.x1+0.15&&p[2]>=H.z0-0.15&&p[2]<=H.z1+0.15;
  const outOf=(G,test)=>G.nodes.filter(n=>!/^NIGHT_/.test(n.name)).map(n=>{ if(!n.pts) return test([0,n.hi,0])||test([0,n.lo,0])?n.name+'（instancing）':null; const k=n.pts.filter(p=>!inWell(p)&&test(p)).length; return k?n.name+' '+k:null; }).filter(Boolean);
  const bad1=outOf(G1,p=>p[1]>yU+0.05), bad2=outOf(G2,p=>p[1]<yU-0.1);
  check(`⑨ 一樓 GLB ${G1.nodes.length} 個網格在一樓（≤ 3.65）、二樓 GLB ${G2.nodes.length} 個在二樓（≥ 3.5）；兩層高的只在樓梯間`,!bad1.length&&!bad2.length,[bad1.join(' '),bad2.join(' ')].filter(Boolean).join('｜'));
  const dirOf=(G,i)=>{ for(let k=i;k!=null;k=G.par[k]){ const e=G.J.nodes[k].extras; if(e&&Array.isArray(e.dir)) return e.dir; } return null; };
  const walls=[...G1.nodes.map(n=>[G1,n]),...G2.nodes.map(n=>[G2,n])].filter(([G,n])=>/^WALL_/.test(n.name)&&n.name!=='WALL_BANDS'), badW=walls.filter(([G,n])=>!dirOf(G,n.i)).map(([G,n])=>n.name);
  const src=fs.readFileSync(path.join(ROOT,'src/dakou3d.js'),'utf8');
  check(`⑨ 兩顆的 WALL_ 網格 ${walls.length} 塊都拿得到 dir（上層節點的，zones3d.js wallDirOf）；WALL_BANDS（跨兩面牆的矮護牆、沒有 dir）dakou3d.js 改名不淡出；夜景卡 NIGHT_ 兩顆各 2 張`,walls.length>=16&&/o\.name==='WALL_BANDS'\) o\.name='DK_BANDS'/.test(src)&&!badW.length&&G1.nodes.filter(n=>/^NIGHT_/.test(n.name)).length===2&&G2.nodes.filter(n=>/^NIGHT_/.test(n.name)).length===2,badW.join(' ')); }
// ⑩ 沒有小孤島（站得住、走不到的點：滑進去就出不來）
{ loadZone('xs_dakou'); const res=[];
  for(const [lv,n,from] of [[0,n0,IN],[1,n1,TOP]]){ const pts=[]; for(let x=-L.w/2+0.3;x<=L.w/2-0.3;x+=0.1) for(let zz=-L.d/2+0.3;zz<=L.d/2-0.3;zz+=0.1) if(n.clear(x,zz,0.32)) pts.push([+x.toFixed(2),+zz.toFixed(2)]);
    const key=p=>p[0].toFixed(1)+','+p[1].toFixed(1), set=new Map(pts.map(p=>[key(p),p])), seen=new Set(); const start=pts.reduce((b,p)=>Math.hypot(p[0]-from[0],p[1]-from[1])<Math.hypot(b[0]-from[0],b[1]-from[1])?p:b,pts[0]);
    const q=[start]; seen.add(key(start)); while(q.length){ const p=q.pop(); for(const [dx,dz] of [[0.1,0],[-0.1,0],[0,0.1],[0,-0.1]]){ const k=(p[0]+dx).toFixed(1)+','+(p[1]+dz).toFixed(1); if(set.has(k)&&!seen.has(k)){ seen.add(k); q.push(set.get(k)); } } }
    /* 樓梯：一樓這一層上半段和二樓相連（換層），二樓這一層下半段沒有地板——兩層之間靠樓梯連起來的，從另一層的 BFS 也算走得到 */
    res.push({lv,n,pts,seen,key}); }
  const onStair=p=>p[0]>st.x0-0.05&&p[0]<st.x1+0.05&&p[1]>st.z0-0.05&&p[1]<st.z1+0.05;
  const isl=[]; for(const R of res){ const other=res[1-R.lv]; for(const p of R.pts){ const k=R.key(p); if(R.seen.has(k)) continue; if(onStair(p)&&other.seen.has(k)) continue; isl.push(`L${R.lv}(${p[0]},${p[1]})`); } }
  check(`⑩ 沒有小孤島：一樓 ${res[0].pts.length} 點、二樓 ${res[1].pts.length} 點，站得住的都從進來的位置、樓梯口連得到`,!isl.length,isl.slice(0,12).join(' ')+(isl.length>12?` …共 ${isl.length}`:'')); }
// ⑪ 名字、營業時間（接線 patch 的 places.js；還沒套 patch 的分支照「略過」印出來，不算失敗）
if(PLACES.names&&PLACES.names.xs_dakou){ check('⑪ 名字「大口漢堡」；24 小時（店門不擋）',PLACES.names.xs_dakou==='大口漢堡'&&PLACES.isOpen('xs_dakou',3,1)&&PLACES.isOpen('xs_dakou',15,2)); }
else console.log('略過 ⑪ 名字：places.js 還沒有 xs_dakou（接線 patch 沒套）');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
