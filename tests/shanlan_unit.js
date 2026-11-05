/* 山嵐書店（xs_shanlan，兩層樓；ART-SHANLAN-BOOKSTORE-1103，LAWWW2-C 11-05）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   ① 區域有登記、正式模型（AA 的 v5）在 ASSETS
   ② 兩層導航同尺寸、同原點；二樓地板 4.2；進來的位置站得住、在「離開山嵐書店」的範圍外面
   ③ 樓梯：畫面上第 k 階高 0.168k、斜面從 0 爬到 4.2；坡度（人物半徑內的高度差 < 0.24）；正式模型的 24 個踏面和導航一樣高（讀 GLB）
   ④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）；二樓 → 下樓 → 一樓店門（換回第 0 層）
   ⑤ 一樓：三張靠窗長椅、新書平台、雜誌牆、文具、結帳、兩個坐地板的位置走得到
   ⑥ 二樓：五張靠窗長椅、兩張閱讀桌八個位子、八個坐地板的位置、法律書、看看二樓走得到
   ⑦ 擋得住：二樓的挑空站不住；一樓這一層從樓梯頂、樓梯側邊走不出去；一樓走不到二樓的地板（一定要走樓梯）
   ⑧ 新生南路：「進山嵐書店」→ xs_shanlan；從店裡出來的點站得住、在店門互動點的範圍外面、走得回店門
   ⑨ 正式模型分兩層：L2_ 開頭的網格在二樓（比一樓天花板低的只能是垂到挑空的植物）；一樓那一組高過二樓地板的，只能在挑空、牆邊、貫穿兩層的柱子；WALL_* 都有 extras.dir
      （已知、先將就：二樓兩盆大盆栽被合進一樓的網格，測試照位置列出來、不算失敗；其他位置出現就 FAIL）
   ⑩ 營業時間（AA_613：11:00～22:00，週五、週六到 23:00）：接線 patch 套上以後才有，沒套就略過
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131）。用法：node tests/shanlan_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/shanlan_layout.js','src/shanlan3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=SHANLAN_LAYOUT, S=L.stairs, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,220);
// 座位的走近點（GAME.seatApproach 的候選：前 0.5、後 0.6、左右 0.55…，站得住、在按鈕範圍 0.85 m 裡）
const seatAps=(s,n)=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw), lv=s.lv|0;
  return [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[fx*0.8,fz*0.8]].map(([dx,dz])=>[s.x+dx,s.z+dz,lv]).filter(a=>n.clear(a[0],a[1],0.3)); };
/* 坐地板的位置（floorSit）：背靠書架 0.35 m、面向走道（yaw），人坐下去的點本來就貼著書架、不是站的地方。
   走近點＝面向的方向（走道那邊）0.5～0.8 m、左右 0.5 m，站得住（姿勢、坐下去的動作 LAWWW 做）*/
const fsAps=(q,n)=>{ const fx=Math.sin(q.yaw), fz=Math.cos(q.yaw), lv=q.lv|0; return [[fx*0.5,fz*0.5],[fx*0.65,fz*0.65],[fx*0.8,fz*0.8],[fz*0.5,-fx*0.5],[-fz*0.5,fx*0.5]].map(([dx,dz])=>[q.x+dx,q.z+dz,lv]).filter(a=>n.clear(a[0],a[1],0.3)); };
// 互動點（在家具前面）：半徑 0.9 內找站得住、走得到的點
const nearOk=(q,from,n)=>{ const lv=q.lv|0; for(let r=0;r<=0.9;r+=0.1) for(let a=0;a<6.28;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(n.clear(x,zz,0.3)&&walk(from,[x,zz,lv]).ok) return true; } return false; };

// ① 登記
check('① Z3.ZONES 有 xs_shanlan；ASSETS 有正式模型 bldg.xs_shanlan（AA v5）',!!Z3.ZONES.xs_shanlan&&!!ASSETS.manifest['bldg.xs_shanlan']&&fs.existsSync(path.join(ROOT,ASSETS.manifest['bldg.xs_shanlan'].url)));
// ② 兩層、進來的位置
const z=loadZone('xs_shanlan'), [n0,n1]=z.levels, yU=L.levels[1].y, IN=[z.spawn.x,z.spawn.z,0];
const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
check('② 兩層導航同尺寸、同原點；二樓地板 4.2；levelGroups 兩組',z.levels.length===2&&n0.cols===n1.cols&&n0.rows===n1.rows&&n0.ox===n1.ox&&n0.oz===n1.oz&&Math.abs(n1.y0-yU)<1e-6&&z.levelGroups.length===2&&z.levelGroups[1].y===yU);
check('② 進來的位置站得住、在「離開山嵐書店」的範圍外面',n0.clear(IN[0],IN[1],0.3)&&!!ex&&Math.hypot(IN[0]-ex.x,IN[1]-ex.z)>ex.radius+0.1,`(${IN[0]}, ${IN[1]})，離出口 ${ex?Math.hypot(IN[0]-ex.x,IN[1]-ex.z).toFixed(2):'—'} m`);
// ③ 樓梯
{ const st=SH3.stairSurf(L); let okv=true, bad=''; for(let k=1;k<S.n;k++){ const zz=st.z1-(k-0.5)*S.tread, v=n0.visualHeightAt?n0.visualHeightAt(S.x,zz):null; if(v!==null&&Math.abs(v-k*S.rise)>0.011){ okv=false; bad=`第 ${k} 階 ${v.toFixed(3)}`; break; } }
  const h0=n0.heightAt(S.x,st.z1-0.02), h1=n1.heightAt(S.x,st.z0+0.02), hl=n1.heightAt(S.x,st.z0-0.3);
  check('③ 樓梯：第 k 階畫面上高 0.168k、斜面從 0 爬到 4.2、樓梯口（二樓）4.2',okv&&h0<0.05&&Math.abs(h1-yU)<0.05&&Math.abs(hl-yU)<1e-6,`底 ${h0.toFixed(2)}、頂 ${h1.toFixed(2)}、樓梯口 ${hl.toFixed(2)}${bad?'｜'+bad:''}`);
  const slope=Math.atan2(S.ya-S.yb,st.z1-st.z0), dh=0.32*Math.tan(slope);
  check('③ 樓梯的坡度：人物半徑 0.32 m 內高度差 < 0.24（引擎 clear() 的上限 0.25）',dh<0.24,(slope*180/Math.PI).toFixed(1)+'°、'+dh.toFixed(3)+' m'); }
// ③ 正式模型的踏面和導航一樣高（讀 GLB 的頂點：樓梯範圍裡，第 k 階那一段最高的點＝k×0.168；人走在樓梯上不浮起來、不陷進去）
{ const G=path.join(ROOT,ASSETS.manifest['bldg.xs_shanlan'].url), b=fs.readFileSync(G), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||12, out=[]; for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(o+k*st),bin.readFloatLE(o+k*st+4),bin.readFloatLE(o+k*st+8)]); return out; };
  const st=SH3.stairSurf(L), V=[]; for(const n of J.nodes){ if(n.mesh==null||!/^shl_wood$/.test(n.name)) continue; for(const p of J.meshes[n.mesh].primitives) for(const v of acc(p.attributes.POSITION)) V.push(v); }
  const sel=V.filter(v=>v[0]>st.x0-0.08&&v[0]<st.x1+0.08&&v[2]>st.z0&&v[2]<st.z1+0.05&&v[1]>0.05&&v[1]<S.ya+0.1); let worst=0, found=0;
  for(let k=1;k<S.n;k++){ const za=st.z1-k*S.tread, zb=st.z1-(k-1)*S.tread, pts=sel.filter(v=>v[2]>=za-0.03&&v[2]<=zb+0.03&&v[1]<=k*S.rise+0.06); if(!pts.length) continue; found++; worst=Math.max(worst,Math.abs(Math.max(...pts.map(v=>v[1]))-k*S.rise)); }
  check(`③ 正式模型的 ${S.n-1} 個踏面和導航一樣高（shl_wood；差 ≤ 0.02 m）`,found===S.n-1&&worst<=0.02,`找到 ${found} 個、最大差 ${worst.toFixed(3)} m`); }
// ④ 上下樓
const TOP=[S.x,S.z-S.len/2-0.35,1];   // 二樓樓梯口
let r=walk(IN,TOP); check('④ 一樓店門 → 爬樓梯 → 二樓樓梯口（換到第 1 層）',r.ok,fmt(r));
r=walk(TOP,[ex.x,ex.z-0.4,0]); check('④ 二樓樓梯口 → 下樓 → 一樓店門（換回第 0 層）',r.ok,fmt(r));
{ const p=E.pathTo(IN[0],IN[1],0,3.0,-5.0,1); check('④ 一樓到二樓的找路經過樓梯（不會直接穿過樓板）',!!p&&p.length>0); }
// ⑤ 一樓
{ const s0=L.seats.filter(s=>(s.lv|0)===0), bad=[]; for(const s of s0) if(!seatAps(s,n0).some(a=>walk(IN,a).ok)) bad.push(`(${s.x},${s.z})`);
  const it0=L.interact.filter(q=>(q.lv|0)===0), bad2=it0.filter(q=>!nearOk(q,IN,n0)).map(q=>q.kind+`(${q.x},${q.z})`);
  const fs0=L.floorSit.filter(q=>(q.lv|0)===0), bad3=fs0.filter(q=>!fsAps(q,n0).some(a=>walk(IN,a).ok)).map(q=>`(${q.x},${q.z})`);
  check(`⑤ 一樓：${s0.length} 張靠窗長椅、${it0.length} 個互動點、${fs0.length} 個坐地板的位置都走得到`,s0.length===3&&!bad.length&&!bad2.length&&!bad3.length,[bad.join(' '),bad2.join(' '),bad3.join(' ')].filter(Boolean).join('｜')); }
// ⑥ 二樓
{ const s1=L.seats.filter(s=>(s.lv|0)===1), bad=[]; for(const s of s1) if(!seatAps(s,n1).some(a=>walk(TOP,a).ok)) bad.push(`${s.label}(${s.x},${s.z})`);
  const it1=L.interact.filter(q=>(q.lv|0)===1), bad2=it1.filter(q=>!nearOk(q,TOP,n1)).map(q=>q.kind+`(${q.x},${q.z})`);
  const fs1=L.floorSit.filter(q=>(q.lv|0)===1), bad3=fs1.filter(q=>!fsAps(q,n1).some(a=>walk(TOP,a).ok)).map(q=>`${q.section}(${q.x},${q.z})`);
  check(`⑥ 二樓：${s1.length} 個座位（長椅 5、閱讀桌 8）、${it1.length} 個互動點、${fs1.length} 個坐地板的位置都走得到`,s1.length===13&&!bad.length&&!bad2.length&&!bad3.length,[bad.join(' '),bad2.join(' '),bad3.join(' ')].filter(Boolean).join('｜'));
  const seats=E.interactables.filter(q=>q.seat); check('⑥ 16 個「坐下」按鈕都帶樓層（座位的 lv 和按鈕一樣）',seats.length===16&&seats.every(q=>q.lv===q.seat.lv)); }
// ⑦ 擋得住
{ const st=SH3.stairSurf(L);
  check('⑦ 二樓的挑空（新書平台上面、靠窗那一段）站不住',!n1.clear(-3.3,4.6,0.3)&&!n1.clear(-4.0,8.0,0.3)&&!n1.clear(-2.0,2.0,0.3));
  check('⑦ 一樓這一層：樓梯頂北邊、樓梯側邊（高處）站不住；樓梯上站得住',!n0.clear(S.x,st.z0-0.2,0.2)&&!n0.clear(S.x+S.w/2+0.05,2.5,0.1)&&n0.clear(S.x,5.0,0.3));
  check('⑦ 一樓（第 0 層）在二樓的位置站不住的地方：二樓樓梯口的高度在一樓是 0（不同層），一樓找不到直接上二樓的路',n0.heightAt(0,-5)<0.01&&n1.heightAt(0,-5)>4.1); }
// ⑧ 新生南路
{ const out=ex.exit.spawn; const zs=loadZone('xinsheng'); const door=E.interactables.find(q=>q.exit&&q.exit.to==='xs_shanlan');
  check('⑧ 新生南路：「進山嵐書店」→ xs_shanlan',!!door&&/^進山嵐書店/.test(door.label),door?door.label:'沒有');
  const ok=!!door&&zs.nav.clear(out.x,out.z,0.3)&&Math.hypot(out.x-door.x,out.z-door.z)>door.radius+0.1&&walk([out.x,out.z,0],[door.x+0.5,door.z,0]).ok;
  check('⑧ 從店裡出來站在騎樓：站得住、在店門互動點的範圍外面、走得回店門',ok,`(${out.x}, ${out.z})${door?'，離店門 '+Math.hypot(out.x-door.x,out.z-door.z).toFixed(2)+' m（範圍 '+door.radius+'）':''}`); }
// ⑨ 正式模型分兩層（讀 GLB 的頂點；glTF 座標＝遊戲座標）
{ const G=path.join(ROOT,ASSETS.manifest['bldg.xs_shanlan'].url), b=fs.readFileSync(G), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||12, out=[]; for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(o+k*st),bin.readFloatLE(o+k*st+4),bin.readFloatLE(o+k*st+8)]); return out; };
  const VO=L.void, inVoid=(x,zz,m)=>x>=VO.x0-m&&x<=VO.x1+m&&zz>=VO.z0-m&&zz<=VO.z1+m, atWall=(x,zz)=>Math.abs(x)>=L.w/2-0.15||Math.abs(zz)>=L.d/2-0.15;
  const cols=L.items.filter(q=>q.kind==='column'), atCol=(x,zz)=>cols.some(c=>Math.abs(x-c.x)<=0.3&&Math.abs(zz-c.z)<=0.3);
  /* 已知（先將就，D141）：二樓那兩盆大盆栽（levelBlocks[1] 的 (−1.15, 1.6)、(6.5, 1.6)）被合進一樓的網格 shl_vc／shl_vcg——人在一樓、鏡頭拉高時會浮在半空。要 AA 在 Blender 改成 L2_ 開頭 */
  const KNOWN=[[-1.15,1.6],[6.5,1.6]], known=(x,zz)=>KNOWN.some(([kx,kz])=>Math.abs(x-kx)<=0.45&&Math.abs(zz-kz)<=0.45);
  const badU=[], badL=[], knownL=new Set(); let nU=0, nL=0;
  for(const n of J.nodes){ if(n.mesh==null||/^WALL_|^GLOW_/.test(n.name||'')) continue; const t=n.translation||[0,0,0], up=/^L2_/.test(n.name); up?nU++:nL++; let bad=0, kn=0;
    for(const p of J.meshes[n.mesh].primitives) for(const v of acc(p.attributes.POSITION)){ const x=v[0]+t[0], y=v[1]+t[1], zz=v[2]+t[2];
      if(up){ if(y<3.9&&!inVoid(x,zz,0.5)) bad++; }                                         // 二樓的東西：比一樓天花板低的只能是垂到挑空裡的（黃金葛）
      else if(y>4.3&&!inVoid(x,zz,0.4)&&!atWall(x,zz)&&!atCol(x,zz)){ if(known(x,zz)) kn++; else bad++; } }   // 一樓那一組：高過二樓地板的只能是挑空裡的（樓梯、書牆、欄杆）、牆邊、貫穿兩層的柱子
    if(bad) (up?badU:badL).push(n.name+' '+bad); if(kn) knownL.add(n.name); }
  const walls=J.nodes.filter(n=>/^WALL_/.test(n.name||'')), badW=walls.filter(n=>!(n.extras&&Array.isArray(n.extras.dir))).map(n=>n.name);
  check(`⑨ 正式模型分兩層：L2_ ${nU} 個網格在二樓（只有垂到挑空的黃金葛比較低）；一樓 ${nL} 個網格高過二樓地板的只在挑空、牆邊、柱子；WALL_ ${walls.length} 塊都有 extras.dir`,nU>=8&&!badU.length&&!badL.length&&walls.length>=8&&!badW.length,
    [badU.join(' '),badL.join(' '),badW.join(' ')].filter(Boolean).join('｜')+(knownL.size?`（已知、先將就：二樓兩盆大盆栽在一樓的網格 ${[...knownL].join('、')}）`:'')); }
// ⑩ 營業時間（接線 patch 的 places.js、story3d.js；還沒套 patch 的分支照「略過」印出來，不算失敗）
if(PLACES.hours&&PLACES.hours.xs_shanlan){ const o=(h,d)=>PLACES.isOpen('xs_shanlan',h,d);
  /* day：遊戲第 1 天＝2028-09-01（週五）→ 第 3 天週日、第 7 天週四、第 1 天週五（calendar.js）；用 CALENDAR 算星期，不寫死 */
  const wd=d=>CALENDAR.dateOf(d).wd; let thu=1, fri=1; while(wd(thu)!==4) thu++; while(wd(fri)!==5) fri++;
  const ok=!o(10.9,thu)&&o(11,thu)&&o(21.9,thu)&&!o(22.1,thu)&&o(22.5,fri)&&!o(23.1,fri)&&PLACES.names.xs_shanlan==='山嵐書店';
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), gate=/it\.exit\.to==='xs_shanlan'&&!PLACES\.isOpen\('xs_shanlan'/.test(st);
  check('⑩ 營業時間：週四 11:00 開、22:00 關；週五開到 23:00；名字「山嵐書店」；story3d.js 店門照開放時間擋',ok&&gate,PLACES.closedText('xs_shanlan',10,thu)+(gate?'':'｜story3d.js 沒有店門擋')); }
else console.log('略過 ⑩ 營業時間：places.js 還沒有 xs_shanlan（接線 patch 沒套）');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
