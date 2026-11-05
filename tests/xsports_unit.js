/* 新生運動廣場（xs_xsports，兩層：一樓＋後段夾層；XS-SPORTS-V1-1105，LAWWW2-C 11-05）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   ① 區域有登記、正式模型（CC 的 v3c）在 ASSETS
   ② 兩層導航同尺寸、同原點；二樓地板 3.75；進來的位置站得住、在「離開新生運動廣場」的範圍外面；店門走得到
   ③ 樓梯：畫面上第 k 階高 0.1786k、斜面從 0 爬到 3.75；坡度（人物半徑內的高度差 < 0.24）；GLB 的 20 個踏面和導航一樣高
   ④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）；二樓 → 下樓 → 一樓店門；找路經過樓梯
   ⑤ 座位、互動點（看看球架、球鞋、買東西、系隊球衣、系服訂做）走得到
   ⑥ 擋得住：二樓的挑空（前段）、倉庫（後牆後面）、樓梯洞站不住；一樓這一層從樓梯頂、樓梯側邊走不出去
   ⑦ 沒有小孤島（兩層每 0.1 m）
   ⑧ 新生南路：「進新生運動廣場」→ 區域；從店裡出來站得住、在店門互動點範圍外面、走得回店門
   ⑨ 正式模型：L1_／WALL_*_L1_* 的網格在二樓高度以上（二樓那一組）；L0_／WALL_*_L0_* 的不高過二樓地板（樓梯、挑空裡的東西除外）；WALL_* 都有 dir
   ⑩ 營業時間（AA_620：11:00～22:00）、店門擋：接線 patch 套上以後才有，沒套就略過
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131）。用法：node tests/xsports_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/xinsheng_sports_layout.js','src/xsports3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_SPORTS_LAYOUT, S=L.stairs, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,220);
const seatAps=(s,n,lv)=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw);
  return [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8]].map(([dx,dz])=>[s.x+dx,s.z+dz,lv]).filter(a=>n.clear(a[0],a[1],0.3)); };
const nearOk=(q,from,n,lv)=>{ for(let r=0;r<=0.9;r+=0.1) for(let a=0;a<6.28;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(n.clear(x,zz,0.3)&&walk(from,[x,zz,lv]).ok) return true; } return false; };

// ①
check('① Z3.ZONES 有 xs_xsports；ASSETS 有正式模型 bldg.xs_xsports（CC v3c）',!!Z3.ZONES.xs_xsports&&!!ASSETS.manifest['bldg.xs_xsports']&&fs.existsSync(path.join(ROOT,ASSETS.manifest['bldg.xs_xsports'].url)));
// ②
const z=loadZone('xs_xsports'), [n0,n1]=z.levels, yU=L.levelY[1], IN=[z.spawn.x,z.spawn.z,0], ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
check('② 兩層導航同尺寸、同原點；二樓地板 3.75；levelGroups 兩組；slabs 三塊',z.levels.length===2&&n0.cols===n1.cols&&n0.rows===n1.rows&&n0.ox===n1.ox&&Math.abs(n1.y0-yU)<1e-6&&z.levelGroups[1].y===yU&&z.slabs.length===3);
check('② 進來的位置站得住、在「離開新生運動廣場」的範圍外面；店門走得到',n0.clear(IN[0],IN[1],0.3)&&!!ex&&Math.hypot(IN[0]-ex.x,IN[1]-ex.z)>ex.radius+0.1&&nearOk(ex,IN,n0,0),`(${IN[0]}, ${IN[1]})`);
// ③
const st=XP3.stairSurf(L);
{ let okv=true, bad=''; for(let k=1;k<S.risers;k++){ const zz=st.z1-(k-0.5)*S.tread, v=n0.visualHeightAt?n0.visualHeightAt(S.x,zz):null; if(v!==null&&Math.abs(v-k*S.rise)>0.011){ okv=false; bad=`第 ${k} 階 ${v.toFixed(3)}`; break; } }
  const h0=n0.heightAt(S.x,st.z1-0.02), h1=n1.heightAt(S.x,st.z0+0.02), hl=n1.heightAt(S.x,st.z0-0.3);
  check('③ 樓梯：第 k 階畫面上高 0.1786k、斜面從 0 爬到 3.75、樓梯口（二樓）3.75',okv&&h0<0.05&&Math.abs(h1-yU)<0.05&&Math.abs(hl-yU)<1e-6,`底 ${h0.toFixed(2)}、頂 ${h1.toFixed(2)}、樓梯口 ${hl.toFixed(2)}${bad?'｜'+bad:''}`);
  const slope=Math.atan2(S.ya-S.yb,st.z1-st.z0), dh=0.32*Math.tan(slope);
  check('③ 樓梯的坡度：人物半徑 0.32 m 內高度差 < 0.24',dh<0.24,(slope*180/Math.PI).toFixed(1)+'°、'+dh.toFixed(3)+' m'); }
// 讀 GLB（節點的平移、旋轉、縮放照實算；instancing 只算外框）
function glb(){ const b=fs.readFileSync(path.join(ROOT,ASSETS.manifest['bldg.xs_xsports'].url)), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), stv=v.byteStride||12, out=[]; for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(o+k*stv),bin.readFloatLE(o+k*stv+4),bin.readFloatLE(o+k*stv+8)]); return out; };
  const par={}; J.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));
  const mat=i=>{ const n=J.nodes[i], m=new THREE.Matrix4(); if(n.matrix) m.fromArray(n.matrix); else m.compose(new THREE.Vector3().fromArray(n.translation||[0,0,0]),new THREE.Quaternion().fromArray(n.rotation||[0,0,0,1]),new THREE.Vector3().fromArray(n.scale||[1,1,1])); return par[i]!=null?mat(par[i]).multiply(m):m; };
  const nodes=[]; J.nodes.forEach((n,i)=>{ if(n.mesh==null) return; const M=mat(i), inst=n.extensions&&n.extensions.EXT_mesh_gpu_instancing, P=[]; for(const p of J.meshes[n.mesh].primitives) for(const q of acc(p.attributes.POSITION)) P.push(q);
    const Ts=inst&&inst.attributes&&inst.attributes.TRANSLATION!=null?acc(inst.attributes.TRANSLATION):[[0,0,0]]; const pts=[]; const v=new THREE.Vector3();
    for(const t of Ts) for(const q of P){ v.fromArray(q); if(inst) v.add(new THREE.Vector3().fromArray(t)); v.applyMatrix4(M); pts.push(v.toArray()); }
    nodes.push({name:n.name||'',i,pts}); });
  return {J,par,nodes}; }
const G=glb();
{ const V=[]; for(const n of G.nodes) if(n.name==='L0_xs_stone') for(const p of n.pts) V.push(p);   /* 踏面是石材（L0_xs_stone）；頂點在樓梯兩邊（x 2.5、4.0）*/
  const sel=V.filter(v=>v[0]>=S.x0-0.05&&v[0]<=S.x1+0.05&&v[2]>st.z0&&v[2]<st.z1+0.05&&v[1]>0.05&&v[1]<S.ya+0.1); let worst=0, found=0;
  for(let k=1;k<S.risers;k++){ const za=st.z1-k*S.tread, zb=st.z1-(k-1)*S.tread, pts=sel.filter(v=>v[2]>=za-0.03&&v[2]<=zb+0.03&&v[1]<=k*S.rise+0.06); if(!pts.length) continue; found++; worst=Math.max(worst,Math.abs(Math.max(...pts.map(v=>v[1]))-k*S.rise)); }
  check(`③ GLB 的 ${S.risers-1} 個踏面和導航一樣高（差 ≤ 0.02 m）`,found===S.risers-1&&worst<=0.02,`找到 ${found} 個、最大差 ${worst.toFixed(3)} m`); }
// ④
const TOP=[S.x,st.z0-0.45,1];
let r=walk(IN,TOP); check('④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）',r.ok,fmt(r));
r=walk(TOP,[0,6.0,0]); check('④ 二樓樓梯口 → 下樓 → 一樓店門（換回第 0 層）',r.ok,fmt(r));
{ const p=E.pathTo(IN[0],IN[1],0,-3.0,-2.0,1); check('④ 一樓到二樓的找路經過樓梯',!!p&&p.length>0&&p.some(q=>{ const x=Array.isArray(q)?q[0]:q.x, zz=Array.isArray(q)?q[1]:q.z; return x>st.x0-0.1&&x<st.x1+0.1&&zz>st.z0&&zz<st.z1; })); }
// ⑤
{ const bad=[], PS=L.seats.filter(s=>s.kind!=='stool'); for(const s of PS){ const lv=s.lv|0, n=lv?n1:n0, from=lv?TOP:IN; if(!seatAps(s,n,lv).some(a=>walk(from,a).ok)) bad.push(`${s.label}(${s.x},${s.z})`); }
  const it=XP3.INTERACT(), bad2=it.filter(q=>!nearOk(q,q.lv?TOP:IN,q.lv?n1:n0,q.lv|0)).map(q=>q.kind+`(${q.x},${q.z})`);
  const seats=E.interactables.filter(q=>q.seat);
  check(`⑤ ${PS.length} 個座位（裁縫車前的圓凳是店員的，只給 NPC）、${it.length} 個互動點（${it.map(q=>q.kind).join('、')}）都走得到；「坐下」按鈕帶樓層`,!bad.length&&!bad2.length&&it.length===5&&seats.length===PS.length&&PS.length===1&&seats.every(q=>q.lv===q.seat.lv),[bad.join(' '),bad2.join(' ')].filter(Boolean).join('｜')); }
// ⑥
{ check('⑥ 二樓：前段挑空（z 2、5）、倉庫（後牆後面 z −5）、樓梯洞兩邊的欄杆站不住；夾層上、樓梯口站得住',!n1.clear(-3,2,0.2)&&!n1.clear(0,5,0.2)&&!n1.clear(-3,-5,0.2)&&!n1.clear(S.x0-0.06,-1,0.1)&&!n1.clear(S.x1+0.06,-1,0.1)&&n1.clear(-3,-2.4,0.3)&&n1.clear(S.x,-3.0,0.3));
  check('⑥ 一樓這一層：樓梯頂北邊、樓梯兩側（高處）站不住；樓梯上站得住',!n0.clear(S.x,st.z0-0.2,0.2)&&!n0.clear(S.x0-0.06,-1,0.1)&&!n0.clear(S.x1+0.06,-1,0.1)&&n0.clear(S.x,1.5,0.3)); }
// ⑦
{ const res=[]; for(const [lv,n,from] of [[0,n0,IN],[1,n1,TOP]]){ const pts=[]; for(let x=-L.w/2+0.3;x<=L.w/2-0.3+1e-6;x+=0.1) for(let zz=-L.d/2+0.3;zz<=L.d/2-0.3+1e-6;zz+=0.1) if(n.clear(x,zz,0.32)) pts.push([+x.toFixed(1),+zz.toFixed(1)]);
    const key=p=>p[0].toFixed(1)+','+p[1].toFixed(1), set=new Map(pts.map(p=>[key(p),p])), seen=new Set(), start=pts.reduce((b,p)=>Math.hypot(p[0]-from[0],p[1]-from[1])<Math.hypot(b[0]-from[0],b[1]-from[1])?p:b,pts[0]);
    const q=[start]; seen.add(key(start)); while(q.length){ const p=q.pop(); for(const [dx,dz] of [[0.1,0],[-0.1,0],[0,0.1],[0,-0.1]]){ const k=(p[0]+dx).toFixed(1)+','+(p[1]+dz).toFixed(1); if(set.has(k)&&!seen.has(k)){ seen.add(k); q.push(set.get(k)); } } }
    res.push({lv,pts,seen,key}); }
  const onStair=p=>p[0]>st.x0-0.05&&p[0]<st.x1+0.05&&p[1]>st.z0-0.05&&p[1]<st.z1+0.05, isl=[];
  for(const R of res){ const O=res[1-R.lv]; for(const p of R.pts){ const k=R.key(p); if(R.seen.has(k)) continue; if(onStair(p)&&O.seen.has(k)) continue; isl.push(`L${R.lv}(${p[0]},${p[1]})`); } }
  check(`⑦ 沒有小孤島：一樓 ${res[0].pts.length} 點、二樓 ${res[1].pts.length} 點都從進來的位置、樓梯口連得到`,!isl.length,isl.slice(0,12).join(' ')+(isl.length>12?` …共 ${isl.length}`:'')); }
// ⑧
{ const out=ex.exit.spawn, zs=loadZone('xinsheng'), door=E.interactables.find(q=>q.exit&&q.exit.to==='xs_xsports');
  check('⑧ 新生南路：「進新生運動廣場」→ xs_xsports',!!door&&/^進新生運動廣場/.test(door.label),door?door.label:'沒有');
  const ok=!!door&&zs.nav.clear(out.x,out.z,0.3)&&Math.hypot(out.x-door.x,out.z-door.z)>door.radius+0.1&&walk([out.x,out.z,0],[door.x+0.5,door.z,0]).ok;
  check('⑧ 從店裡出來站在騎樓：站得住、在店門互動點的範圍外面、走得回店門',ok,`(${out.x}, ${out.z})`); }
// ⑨
{ const H=L.slab.hole, inWell=p=>p[0]>=H.x0-0.2&&p[0]<=H.x1+0.2&&p[2]>=S.z0-0.2&&p[2]<=S.z1+0.2, atrium=p=>p[2]>-0.1,   /* 挑空＋夾層前緣（前緣下面掛的主招牌，底 2.85 m，屬於二樓那一組）*/ wall=p=>Math.abs(p[0])>=L.w/2-0.25||Math.abs(p[2])>=L.d/2-0.25;
  const badU=[], badL=[];
  for(const n of G.nodes){ const up=/^L1_|^WALL_[a-z]+_L1_/.test(n.name), lo=/^L0_|^WALL_[a-z]+_L0_/.test(n.name); if(!up&&!lo) continue;
    const k=up?n.pts.filter(p=>p[1]<yU-0.35&&!inWell(p)&&!atrium(p)).length:n.pts.filter(p=>p[1]>yU+0.05&&!inWell(p)&&!atrium(p)&&!wall(p)).length; if(k) (up?badU:badL).push(n.name+' '+k); }
  const dirOf=i=>{ for(let k=i;k!=null;k=G.par[k]){ const e=G.J.nodes[k].extras; if(e&&Array.isArray(e.dir)) return e.dir; } return null; };
  const walls=G.nodes.filter(n=>/^WALL_/.test(n.name)), badW=walls.filter(n=>!dirOf(n.i)).map(n=>n.name);
  check(`⑨ 正式模型分兩層：夾層那一段（z < 0）二樓的網格在 3.4 m 以上、一樓的不高過 3.8 m（樓梯間、挑空、牆邊除外）；WALL_ ${walls.length} 塊都有 dir`,!badU.length&&!badL.length&&walls.length>=20&&!badW.length,[badU.join(' '),badL.join(' '),badW.join(' ')].filter(Boolean).join('｜')); }
// ⑩
if(PLACES.hours&&PLACES.hours.xs_xsports){ const o=(h,d)=>PLACES.isOpen('xs_xsports',h,d), wd=d=>CALENDAR.dateOf(d).wd; let thu=1; while(wd(thu)!==4) thu++;
  const ok=!o(10.9,thu)&&o(11,thu)&&o(21.9,thu)&&!o(22.1,thu)&&PLACES.names.xs_xsports==='新生運動廣場';
  const gate=/it\.exit\.to==='xs_xsports'&&!PLACES\.isOpen\('xs_xsports'/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'));
  check('⑩ 營業時間 11:00～22:00；名字；story3d.js 店門照開放時間擋',ok&&gate); }
else console.log('略過 ⑩ 營業時間：places.js 還沒有 xs_xsports（接線 patch 沒套）');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
