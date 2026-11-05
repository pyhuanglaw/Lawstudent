/* 同弦樂器（xs_tongxian，新生南路二樓的吉他行；GUITAR-SHOP-ZONE-1105，LAWWW2-C 11-05）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路（E.pathTo）＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   ① 區域有登記、正式模型（CC 的店內、LAWWW2 的樓梯間）在 ASSETS
   ② 進來的位置（店門內）站得住、在出口「下樓（回新生南路）」的範圍外面
   ③ 店門 → 兩張試琴椅「試彈」、櫃台前的木凳（GAME.seatApproach 的候選點）；試琴椅、木凳照座面抬高（lift＝座面－SIT_TOP）
   ④ 店門 → 配置的互動點（吉他牆兩處、買東西、烏克麗麗、子晴 CG 的站位）、老闆站的位置（櫃台後面，從北端進去）
   ⑤ 店裡 → 出口；出口 → 新生南路，騎樓樓梯口外面、面向馬路
   ⑥ 樓梯間（門外的平台、樓梯）走不進去：樓梯看得到、人不走（進出都在門口）
   ⑦ 新生南路：「進同弦樂器（吉他行（二樓））」→ xs_tongxian；從店裡出來的點站得住、在店門互動點的範圍外面、走得到側門、走得回店門
   ⑧ 營業時間（AA_619）：週二～週日 12:00～21:30 開、週一公休、颱風天關（PLACES.isOpen／typhoonShops）
   ⑨ 正式模型：店內木地板不伸進樓梯間（tools/blender/env_second/glb_floor_hole.py）、是淺色（D112）；樓梯間的平台、樓梯口兩側是磨石子、不和木地板疊面；
      單面的牆正面朝樓梯間；樓梯間的 GLB 22 階對得上樓梯口
   ⑩ 接線：index.html 載入、店門照營業時間擋
   ⑪ 參考圖的排法（TONGXIAN-REF-1105，v4e）：camRef 左半邊有窗和試琴角、右半邊有吉他牆和玻璃展示櫃、看試琴角的視線沒有家具擋；
      走道上方的吊盆葉子離地 1.75 m 以上；店裡的零件都在房間裡（v4d 前兩項 FAIL；v4e 第一版第三項 FAIL）
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131 排到使用者的電腦）。用法：node tests/tongxian_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/tongxian_layout.js','src/tongxian3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=TONGXIAN_LAYOUT.shop, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
// ① 登記
check('① Z3.ZONES.xs_tongxian 有登記；ASSETS 有店內（CC）、樓梯間（LAWWW2）的正式模型',!!Z3.ZONES.xs_tongxian&&!!ASSETS.manifest['bldg.xs_tongxian']&&!!ASSETS.manifest['bldg.xs_tongxian_stair']);
const z=loadZone('xs_tongxian'), nav=z.nav, IN=[z.spawn.x,z.spawn.z];
const exIt=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
// ②
check('② 進來的位置（店門內）站得住、在「下樓（回新生南路）」的範圍外面',nav.clear(IN[0],IN[1],0.3)&&!!exIt&&Math.hypot(IN[0]-exIt.x,IN[1]-exIt.z)>exIt.radius+0.1,
  `(${IN.join(',')})，離出口 ${exIt?Math.hypot(IN[0]-exIt.x,IN[1]-exIt.z).toFixed(2):'—'} m（範圍 ${exIt?exIt.radius:'—'}）`);
// ③ 座位
const seatAps=s=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); return [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz]).filter(a=>Math.hypot(a[0]-s.x,a[1]-s.z)<=0.85&&nav.clear(a[0],a[1],0.3)); };
const seats=E.interactables.filter(q=>q.seat), badSeat=[];
for(const q of seats){ const aps=seatAps(q.seat); if(!aps.some(a=>walk(IN,a).ok)) badSeat.push(`${q.label}(${q.x},${q.z}) 候選點 ${aps.length} 個`); }
check(`③ 店門走得到 ${seats.length} 個座位的走近點（試琴椅兩張「試彈」、櫃台前的木凳）`,seats.length===3&&seats.filter(q=>q.label==='試彈').length===2&&!badSeat.length,badSeat.join('｜'));
const SIT=(typeof CHAR!=='undefined'&&CHAR.SIT_TOP)||0.47, liftOk=seats.every(q=>{ const s=L.seats.find(p=>p.id===q.tongxian); return s&&Math.abs((q.seat.lift||0)-(s.seatH-SIT))<0.011; });
check('③ 試琴椅（座面 0.6）、木凳（0.66）照座面抬高坐姿（lift＝座面－SIT_TOP '+SIT+'）',liftOk,seats.map(q=>q.label+' '+(q.seat.lift||0)).join('、'));
// ④ 互動點（配置）、老闆
/* 互動點：走到按鈕範圍（0.9 m，LAWWW 接按鈕時的半徑）裡、站得住（半徑 0.3）的一點就算到（按鈕本身可以在家具邊上：烏克麗麗在音箱架旁邊）；老闆站的位置本身要站得住、走得到 */
const near=(p,R)=>{ const out=nav.clear(p.x,p.z,0.3)?[[p.x,p.z]]:[]; for(const d of [0.3,0.5,0.7,0.85]){ if(d>R) continue; for(let a=0;a<16;a++){ const x=p.x+Math.cos(a*Math.PI/8)*d, zz=p.z+Math.sin(a*Math.PI/8)*d; if(nav.clear(x,zz,0.3)) out.push([x,zz]); } } return out; };
const pts=TX3.INTERACT().map(q=>({n:q.id+' '+q.label,x:q.x,z:q.z,R:0.9})).concat([{n:'老闆（櫃台後面）',x:TX3.OWNER.x,z:TX3.OWNER.z,R:0}]), badPt=[];
for(const p of pts){ const c=near(p,p.R); if(!c.length){ badPt.push(p.n+' 附近站不住'); continue; } if(!c.some(a=>walk(IN,a).ok)) badPt.push(p.n+' 走不到（候選 '+c.length+'）'); }
check(`④ 店門走得到配置的 ${pts.length-1} 個互動點（按鈕範圍 0.9 m 裡）、老闆站的位置（櫃台後面）`,!badPt.length,badPt.join('｜')||pts.map(p=>p.n.split(' ')[0]).join('、'));
// ⑤ 出口
{ const c=near({x:exIt.x,z:exIt.z},exIt.radius-0.05), r=c.map(a=>walk([0.4,-3.0],a)).find(q=>q.ok)||walk([0.4,-3.0],c[0]||[exIt.x,exIt.z]), so=TX3.streetOut();
  check('⑤ 店裡（窗前）走得到店門的「下樓（回新生南路）」（按鈕範圍裡）→ 新生南路騎樓的樓梯口外面、面向馬路',r.ok&&exIt.label==='下樓（回新生南路）'&&exIt.exit.spawn.x===so.x&&exIt.exit.spawn.z===so.z&&Math.abs(so.yaw-Math.PI/2)<1e-6,fmt(r)+' '+JSON.stringify(exIt.exit.spawn)); }
// ⑥ 樓梯間
{ const S=L.stair; const inside=[[-2.2,4.7],[-2.2,3.0],[-1.7,2.0],[-2.8,4.9]].filter(p=>nav.clear(p[0],p[1],0.2));
  check('⑥ 樓梯間（門外的平台、樓梯）站不住、走不進去（樓梯看得到、人不走）',!inside.length&&!walk(IN,[-2.2,4.7]).ok,inside.map(p=>p.join(',')).join('｜')); }
// ⑦ 新生南路那一端
{ const xz=loadZone('xinsheng'), xn=xz.nav, it=E.interactables.find(q=>q.exit&&q.exit.to==='xs_tongxian'), so=TX3.streetOut(), q=XINSHENG_LAYOUT.shops.find(s=>s.id==='tongxian');
  check('⑦ 新生南路的店門「進同弦樂器（吉他行（二樓））」→ xs_tongxian（室內做好了：「進」）',!!it&&/^進同弦樂器/.test(it.label)&&Math.abs(it.z-q.door.z)<0.01,it?it.label+` (${it.x},${it.z})`:'沒有');
  check('⑦ 從店裡出來的點站得住、在店門互動點的範圍外面（不會一出來就又看到「進」）',xn.clear(so.x,so.z,0.3)&&!!it&&Math.hypot(so.x-it.x,so.z-it.z)>it.radius+0.1,`(${so.x},${so.z})，離店門 ${it?Math.hypot(so.x-it.x,so.z-it.z).toFixed(2):'—'} m（範圍 ${it?it.radius:'—'}）`);
  const SG=XINSHENG_LAYOUT.sideGate.spawn, r1=walk([so.x,so.z],[SG.x,SG.z]), r2=walk([SG.x,SG.z],[it.x+0.3,it.z]);
  check('⑦ 出來以後走得到側門（回校園）；從側門走得回店門',r1.ok&&r2.ok,fmt(r1.ok?r2:r1)); }
// ⑧ 營業時間
{ const day=w=>{ for(let d=1;d<400;d++) if(CALENDAR.dateOf(d).wd===w&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d))) return d; return null; };
  const mon=day(1), tue=day(2), sun=day(7), op=(h,d)=>PLACES.isOpen('xs_tongxian',h,d);
  const ok=!op(13,mon)&&op(12,tue)&&op(21.4,tue)&&!op(21.5,tue)&&!op(11.9,tue)&&op(15,sun)&&PLACES.typhoonShops.includes('xs_tongxian')&&PLACES.names.xs_tongxian==='同弦樂器';
  let ty=null; if(CALENDAR.typhoon) for(let d=1;d<800&&ty==null;d++) if(CALENDAR.typhoon(d)&&CALENDAR.dateOf(d).wd!==1) ty=d;
  check('⑧ 營業時間：週二～週日 12:00～21:30、週一公休、颱風天關',ok&&(ty==null||!op(15,ty)),`週一 13:00 ${op(13,mon)}、週二 12:00 ${op(12,tue)}、21:24 ${op(21.4,tue)}、21:30 ${op(21.5,tue)}、11:54 ${op(11.9,tue)}、週日 15:00 ${op(15,sun)}、颱風天（第 ${ty} 天）15:00 ${ty==null?'—':op(15,ty)}；${PLACES.closedText('xs_tongxian',13,mon)}`); }
// ⑨ 正式模型
{ const glb=p=>{ const d=fs.readFileSync(path.join(ROOT,p)), n=d.readUInt32LE(12); return {J:JSON.parse(d.slice(20,20+n).toString('utf8')),d,bo:20+n+8}; };
  const rd=(G,ai)=>{ const a=G.J.accessors[ai], bv=G.J.bufferViews[a.bufferView], k={SCALAR:1,VEC2:2,VEC3:3}[a.type], cs={5126:4,5125:4,5123:2}[a.componentType], st=bv.byteStride||k*cs, off=G.bo+(bv.byteOffset||0)+(a.byteOffset||0), out=[];
      for(let i=0;i<a.count;i++){ const v=[]; for(let j=0;j<k;j++){ const o=off+i*st+j*cs; v.push(a.componentType===5126?G.d.readFloatLE(o):a.componentType===5125?G.d.readUInt32LE(o):G.d.readUInt16LE(o)); } out.push(k===1?v[0]:v); } return out; };
  const verts=(G,name)=>{ const m=G.J.meshes.find(q=>q.name===name), out=[]; if(!m) return out; for(const pr of m.primitives) out.push(...rd(G,pr.attributes.POSITION)); return out; };
  /* 三角形（世界座標＝GLB 座標，這兩個模型的節點沒有變換）：[a,b,c, 法線（照頂點順序，glTF 逆時針＝正面）, 材質是不是雙面] */
  const tris=(G,pred)=>{ const out=[]; for(const m of G.J.meshes){ if(pred&&!pred(m.name)) continue; for(const pr of m.primitives){ const P=rd(G,pr.attributes.POSITION), I=rd(G,pr.indices), dbl=!!(G.J.materials[pr.material]||{}).doubleSided;
      for(let i=0;i<I.length;i+=3){ const A=P[I[i]],B=P[I[i+1]],C=P[I[i+2]], u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]], n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], l=Math.hypot(...n)||1;
        out.push({A,B,C,n:n.map(q=>q/l),dbl,mesh:m.name}); } } } return out; };
  const inTri=(t,x,z)=>{ const s=(p,q,r)=>(p[0]-r[0])*(q[2]-r[2])-(q[0]-r[0])*(p[2]-r[2]), P=[x,0,z], d1=s(P,t.A,t.B), d2=s(P,t.B,t.C), d3=s(P,t.C,t.A); return !((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)); };
  const topAt=(T,x,z)=>T.some(t=>t.n[1]>0.99&&Math.abs(t.A[1])<1e-3&&Math.abs(t.B[1])<1e-3&&Math.abs(t.C[1])<1e-3&&inTri(t,x,z));   // 這一點上面有一片 y 0、朝上的面
  const shop=glb(ASSETS.manifest['bldg.xs_tongxian'].url), stair=glb(ASSETS.manifest['bldg.xs_tongxian_stair'].url), S_=L.stair, F=S_.flight, XW=-L.w/2, XE=S_.x1-S_.wall;
  const floorT=tris(shop,n=>n==='tx_floor'), stairT=tris(stair), stepT=tris(stair,n=>n==='txs_step');
  const grid=(x0,x1,z0,z1,n=9)=>{ const o=[]; for(let i=0;i<n;i++) for(let j=0;j<n;j++) o.push([x0+(x1-x0)*(i+0.5)/n, z0+(z1-z0)*(j+0.5)/n]); return o; };
  const inWell=(x,z)=>x>XW-1e-3&&x<S_.x1+1e-3&&z>S_.z0-1e-3&&z<S_.z1+1e-3, inOpen=(x,z)=>x>F.x0&&x<F.x1&&z>S_.z0&&z<F.zTop;
  const shopPts=grid(-L.w/2,L.w/2,-L.d/2,L.d/2,24).filter(p=>!inWell(p[0],p[1])), wellPts=grid(XW,S_.x1,S_.z0,S_.z1,16), landPts=wellPts.filter(p=>!inOpen(p[0],p[1])&&p[0]<XE-0.005), openPts=wellPts.filter(p=>inOpen(p[0],p[1]));
  check('⑨ 店內木地板（tx_floor）鋪滿店裡、樓梯間（x '+XW+'～'+S_.x1+'、z '+S_.z0+'～'+S_.z1+'）裡面沒有木地板',shopPts.every(p=>topAt(floorT,p[0],p[1]))&&!wellPts.some(p=>topAt(floorT,p[0],p[1])),`店裡 ${shopPts.filter(p=>topAt(floorT,p[0],p[1])).length}/${shopPts.length} 點、樓梯間有木地板 ${wellPts.filter(p=>topAt(floorT,p[0],p[1])).length} 點`);
  check('⑨ 樓梯間的平台、樓梯口兩側是磨石子（txs_step 的頂面 y 0），樓梯口空著；樓梯間的模型在店裡沒有 y 0 的朝上面（不和木地板疊面）',landPts.every(p=>topAt(stepT,p[0],p[1]))&&!openPts.some(p=>topAt(stairT,p[0],p[1]))&&!shopPts.some(p=>topAt(stairT,p[0],p[1])),
    `平台 ${landPts.filter(p=>topAt(stepT,p[0],p[1])).length}/${landPts.length}、樓梯口 ${openPts.filter(p=>topAt(stairT,p[0],p[1])).length}、店裡 ${shopPts.filter(p=>topAt(stairT,p[0],p[1])).length}`);
  /* D112：店內木地板的顏色貼圖（名字的色碼＝貼圖的平均色，tools/blender/env_second/glb_tint_image.py、b3lib img_adj 的做法）L* ≥ 72 */
  const mat=shop.J.materials[shop.J.meshes.find(m=>m.name==='tx_floor').primitives[0].material], ti=mat.pbrMetallicRoughness.baseColorTexture.index, tex=shop.J.textures[ti], im=shop.J.images[(tex.extensions&&tex.extensions.EXT_texture_webp||tex).source], hx=(im.name.match(/_([0-9a-f]{6})(?=_|$)/)||[])[1];
  const Ls=h=>{ const c=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v>0.04045?((v+0.055)/1.055)**2.4:v/12.92), Y=0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; return 116*Math.cbrt(Y)-16; };
  check('⑨ D112：店內木地板是淺色（貼圖平均色 L* ≥ 72）',!!hx&&Ls(hx)>=72,`${im.name}（#${hx}，L* ${hx?Ls(hx).toFixed(1):'?'}）`);
  /* 單面的牆（txs_wall、txs_dado）正面朝樓梯間：樓梯西側的牆、二樓樓梯間的西牆朝 +x，東側的牆朝 −x（v1 反了：遊戲裡從樓梯看不到牆）。
     量朝樓梯間那一面的面積：樓梯兩側各 ≥ 3 m²、二樓的西牆＝整面（樓梯間北牆到南牆 × 店高） */
  const ss=stairT.filter(t=>!t.dbl), on=(t,x)=>[t.A,t.B,t.C].every(p=>Math.abs(p[0]-x)<1e-3), area=t=>{ const u=[t.B[0]-t.A[0],t.B[1]-t.A[1],t.B[2]-t.A[2]], v=[t.C[0]-t.A[0],t.C[1]-t.A[1],t.C[2]-t.A[2]]; return Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])/2; };
  const aW=x=>ss.filter(t=>on(t,x)&&t.n[0]>0.99).reduce((a,t)=>a+area(t),0), aE=x=>ss.filter(t=>on(t,x)&&t.n[0]<-0.99).reduce((a,t)=>a+area(t),0);
  const a0=aW(F.x0), a1=aE(F.x1), aw=aW(XW), awNeed=(S_.z1-S_.z0)*L.h;
  check('⑨ 樓梯兩側的牆、二樓樓梯間的西牆（單面材質）正面朝樓梯間',a0>=3&&a1>=3&&aw>=awNeed*0.99,`朝樓梯間的面積：西側 ${a0.toFixed(2)}、東側 ${a1.toFixed(2)}、二樓西牆 ${aw.toFixed(2)}／${awNeed.toFixed(2)} m²`);
  /* 兩個 GLB 每個網格的索引都在自己的頂點數裡面（換地板網格時不能動到共用的索引：CC 的匯出把地板和吉他牆灰泥的方塊索引合成一個） */
  const badIdx=[]; for(const G of [shop,stair]) for(const m of G.J.meshes) for(const pr of m.primitives){ if(pr.indices==null) continue; const nv=G.J.accessors[pr.attributes.POSITION].count; if(rd(G,pr.indices).some(i=>i>=nv)) badIdx.push(m.name); }
  check('⑨ 兩個正式模型的每個網格，索引都在自己的頂點數裡面（GLB 沒有壞掉）',!badIdx.length,badIdx.join('、'));
  const ex=((stair.J.nodes.find(n=>n.extras&&n.extras.kind==='tongxian_stair')||{}).extras||{}), step=verts(stair,'txs_step'), tread=step.filter(p=>p[1]<-1e-3&&p[2]<F.zTop-1e-3);   /* 踏階：平台（z ≥ zTop）、樓梯口兩側的窄條（y 0）不算 */
  const N=ex.risers, R=4.2/(N||1), tops=[...new Set(tread.map(p=>p[1].toFixed(4)))].map(Number);   /* extras 的 rise 只有 4 位小數：照一樓高 4.2 ÷ 階數算 */
  let okSteps=N===22&&Math.abs(ex.rise*N-4.2)<0.01; for(let j=1;j<N&&okSteps;j++) if(!tops.some(y=>Math.abs(y+j*R)<0.002)) okSteps=false;
  check('⑨ 樓梯間 22 階、每階 '+(R||0).toFixed(3)+' m、從平台（y 0）到騎樓（−4.2）、寬照 flight（'+F.x0+'～'+F.x1+'）',okSteps&&tread.every(p=>p[0]>=F.x0-1e-3&&p[0]<=F.x1+1e-3),`踏面高 ${tops.length} 種、頂點 ${tread.length}`); }
// ⑪ 參考圖的構圖（D133，BB-C 02:08；v4e）：camRef 的鏡頭裡窗和試琴角在左半邊、吉他牆和玻璃展示櫃在右半邊；從眼睛到兩張試琴椅、音箱的視線沒有被家具（blocks）擋住
{ const C=L.camRef, hf=2*Math.atan(18/C.lens), yaw=Math.atan2(C.look[0]-C.eye[0],-(C.look[2]-C.eye[2]));   /* 水平視角（感光元件寬 36 mm）；yaw＝往東偏多少（看向 −z 為 0） */
  const ang=(x,zz)=>{ let a=Math.atan2(x-C.eye[0],-(zz-C.eye[2]))-yaw; while(a>Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; }, half=hf/2-0.02;
  const W=L.windows[0], left=[['窗',(W.x0+W.x1)/2,-L.d/2],...L.items.filter(i=>i.kind==='trial_stool').map(i=>['試琴椅',i.x,i.z]),...L.items.filter(i=>i.kind==='amp').map(i=>['音箱',i.x,i.z])];
  const ctr=L.items.find(i=>i.kind==='counter'), right=[['吉他牆',L.w/2,-3.0],['玻璃展示櫃',ctr.x,ctr.z-0.8]];
  const okL=left.every(([n,x,zz])=>{ const a=ang(x,zz); return a<0&&a>-half; }), okR=right.every(([n,x,zz])=>{ const a=ang(x,zz); return a>0&&a<half; });
  const segHit=(x0,z0,x1,z1,b)=>{ const hx=b[2]/2, hz=b[3]/2; for(let t=0.02;t<0.98;t+=0.01){ const x=x0+(x1-x0)*t, zz=z0+(z1-z0)*t; if(Math.abs(x-b[0])<hx&&Math.abs(zz-b[1])<hz) return true; } return false; };
  const targets=left.slice(1), own=(b,x,zz)=>Math.abs(b[0]-x)<0.4&&Math.abs(b[1]-zz)<0.4, blocked=targets.filter(([n,x,zz])=>L.blocks.some(b=>!own(b,x,zz)&&segHit(C.eye[0],C.eye[2],x,zz,b))).map(([n])=>n);
  check('⑪ 參考圖的構圖：camRef 左半邊有窗、試琴椅、音箱，右半邊有吉他牆、玻璃展示櫃；看試琴角的視線沒有家具擋',okL&&okR&&!blocked.length,
    left.concat(right).map(([n,x,zz])=>n+' '+(ang(x,zz)*180/Math.PI).toFixed(0)+'°').join('、')+'（視角 ±'+(hf*90/Math.PI).toFixed(0)+'°）'+(blocked.length?'；擋住：'+blocked.join('、'):''));
  /* 吊在走道上方的黃金葛：最低的葉子離地 1.75 m 以上（人走過去不會穿過葉子） */
  const hp=L.items.find(i=>i.kind==='hanging_plant'), d=fs.readFileSync(path.join(ROOT,ASSETS.manifest['bldg.xs_tongxian'].url)), n=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+n).toString('utf8')), bo=20+n+8;
  let low=Infinity; for(const m of J.meshes){ if(!/leaf/.test(m.name)) continue; for(const pr of m.primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], st=bv.byteStride||12, off=bo+(bv.byteOffset||0)+(a.byteOffset||0);
      for(let i=0;i<a.count;i++){ const x=d.readFloatLE(off+i*st), y=d.readFloatLE(off+i*st+4), zz=d.readFloatLE(off+i*st+8); if(Math.hypot(x-hp.x,zz-hp.z)<0.9&&y>1.0&&y<low) low=y; } } }
  check('⑪ 走道上方的吊盆黃金葛：最低的葉子離地 ≥ 1.75 m',low>=1.75&&low<hp.y,'最低 '+(low===Infinity?'—':low.toFixed(2))+' m');
  /* 店裡的零件都在房間裡：v4e 第一版把書架轉 90° 的時候，連吊燈的電線也轉到牆外（從天花板拉出一大片黑色三角形；用頂點數分新舊，bmesh 刪過頂點以後會錯）。
     北牆以南的頂點：x −3.3～3.3、y −0.05～3.25、z ≤ 5.3（牆的灰泥有厚度、窗外的景板在北牆外面，不算；instancing 的吉他是本地座標，不算） */
  const outB={}; for(const nd of J.nodes){ if(nd.mesh==null||(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)||nd.translation||nd.rotation||nd.scale||nd.matrix) continue; const m=J.meshes[nd.mesh]; if(/plaster/.test(m.name)) continue;
    for(const pr of m.primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], st=bv.byteStride||12, off=bo+(bv.byteOffset||0)+(a.byteOffset||0);
      for(let i=0;i<a.count;i++){ const x=d.readFloatLE(off+i*st), y=d.readFloatLE(off+i*st+4), zz=d.readFloatLE(off+i*st+8); if(zz>-5.3&&(Math.abs(x)>3.3||y<-0.05||y>3.25||zz>5.3)) outB[m.name]=(outB[m.name]||0)+1; } } }
  check('⑪ 店裡的零件都在房間裡（北牆以南：x ±3.3、y −0.05～3.25、z ≤ 5.3；牆的灰泥不算）',!Object.keys(outB).length,Object.keys(outB).length?'跑出去的頂點 '+JSON.stringify(outB):''); }
// ⑩ 接線（LAWWW 的檔，交件的 patch）：index.html 在新生南路後面載入這兩個檔；story3d.js 的店門照開放時間擋（溫州街的店同一句）；營業時間寫在 places.js
{ const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), pl=fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8');
  const a=idx.indexOf('src/xinsheng3d.js'), b=idx.indexOf('src/data/tongxian_layout.js'), c=idx.indexOf('src/tongxian3d.js');
  check('⑩ index.html 在 src/xinsheng3d.js 後面載入 tongxian_layout.js、tongxian3d.js',a>0&&b>a&&c>b);
  check('⑩ story3d.js 的店門照開放時間擋同弦（PLACES.closedText）；營業時間、名字、颱風天寫在 src/data/places.js',/it\.exit\.to==='xs_tongxian'&&!PLACES\.isOpen\('xs_tongxian'/.test(st)&&/xs_tongxian:\{shop:true/.test(pl)&&/typhoonShops:\[[^\]]*'xs_tongxian'/.test(pl)&&/xs_tongxian:'同弦樂器'/.test(pl)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
