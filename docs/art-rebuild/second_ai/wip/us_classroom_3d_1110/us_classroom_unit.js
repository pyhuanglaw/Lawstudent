// 美國教室 Room 120 的 3D 區域（US-CLASSROOM-3D-1110，AA_740；LAWWW2 帳號 A 2026-11-10）：不需要瀏覽器。
// 在 Node 照 index.html 的順序載入程式，建出遊戲真正的區域 us_classroom，用引擎真正的移動模擬（E.simWalk，dt 1/30、0.1，跑步 4.1 m/s）檢查：
//   1. 註冊：Z3.ZONES.us_classroom、US_CLASSROOM.SPAWN；6 排×8 席＝48 個座位，一排高 30 cm（照 201）；48 個「坐下」
//   2. 走得到：門口（最上面）站得住；每個座位「坐下」前站的位置（椅子後面 0.6 m、同一排的平台）站得住、從門口走得到；講台、報告的站位走得到
//   3. 出口：「離開教室」回到 us_campus 的 spawn_class_out（台階下）；出口互動點從座位走得到
//   4. 座位照 AA_740 第 2 節：Introduction 玩家第 3 排右邊靠走道、韓國同學正後方、約 30 人坐前 5 排；Comparative 玩家第 1 排中間偏右、
//      德國同學（第 4 次以前第 2 排最右、之後玩家左邊）、巴西第 1 排最左、日本第 2 排玩家左後方、只坐前 2 排；Legal Writing 玩家第 2 排中間、
//      舊序章人物己（見過：玩家右邊；沒見過：玩家正前方）、約 12 人、只坐前 2 排；路人不坐有名字的人的位子；教室裡沒有學姊
//      期中／期末報告：玩家和德國同學站在講桌兩邊、教授坐第 1 排最右邊（Comparative 的路人不坐那裡）
//   5. 正式模型：manifest、zone_assets、GLB 檔；GLB 的座位（SEATPANS）和配置的 48 個座位一一對得上；房間大小和配置一樣；地毯不是深色木地板（D112）；
//      窗景四季白天／晚上 8 張都在
// 這是模擬（證明路走得通、資料對），不是真實玩家流程；畫面請 CC 拍（D131）。
// 用法：node tests/us_classroom_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const inHtml=f=>html.includes('src="'+f+'?')||html.includes('src="'+f+'"');
check('index.html 載入 src/data/us_classroom_layout.js、src/us_classroom3d.js（在 us3d.js 後面）',inHtml('src/data/us_classroom_layout.js')&&inHtml('src/us_classroom3d.js')&&html.indexOf('src/us3d.js')<html.indexOf('src/us_classroom3d.js'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_classroom_layout.js','src/us_classroom3d.js'];
for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ check('檔案 '+f,false,'沒有這個檔'); continue; } let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r.ok?r:Object.assign({run:true},r); };
const fmt=r=>JSON.stringify(r).slice(0,200);
const ok=typeof Z3!=='undefined'&&Z3.ZONES&&!!Z3.ZONES.us_classroom&&typeof US_CLASSROOM!=='undefined';
check('1. 區域註冊：Z3.ZONES.us_classroom、US_CLASSROOM.SPAWN',ok&&!!US_CLASSROOM.SPAWN);
if(!ok){ console.log(`FAILED: ${fails}`); process.exit(1); }
const C=US_CLASSROOM_LAYOUT, z=loadZone('us_classroom'), S=z.seats, IT=E.interactables, sp=z.spawn;
check('1. 6 排 × 8 席＝48 個座位、每排高 30 cm、面向講台',S.length===48&&S.every(s=>Math.abs(s.y-0.3*(s.row+1))<1e-6&&Math.abs(s.yaw-Math.PI)<1e-6),`${S.length} 個座位`);
check('1. 48 個「坐下」',IT.filter(i=>i.seat&&i.label==='坐下').length===48);
// ---------- 2. 走得到 ----------
check('2. 門口（最上面）站得住、高 1.8 m；SPAWN 和區域的出生點一樣',E.canStand(sp.x,sp.z,0.32,0)&&Math.abs(E.nav.heightAt(sp.x,sp.z)-1.8)<1e-6&&Math.abs(US_CLASSROOM.SPAWN.x-sp.x)<1e-6&&Math.abs(US_CLASSROOM.SPAWN.z-sp.z)<1e-6,`h=${E.nav.heightAt(sp.x,sp.z)}`);
{ const bad=[]; for(const s of S){ const ap=[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6]; const st=E.canStand(ap[0],ap[1],0.3,0), hOK=Math.abs(E.nav.heightAt(ap[0],ap[1])-s.y)<=0.2; const r=st&&hOK?both([sp.x,sp.z],ap):{ok:false,reason:st?'高度不對':'站不住'}; if(!r.ok||Math.abs((r.y||0)-s.y)>0.05) bad.push(`第${s.row+1}排第${s.col+1}個 ${fmt(r)}`); }
  check('2. 48 個座位：椅子後面 0.6 m（坐下前站的位置）站得住、在同一排的平台上、從門口走得到',!bad.length,bad.slice(0,4).join(' | ')); }
{ const ts=z.teacherSpot; check('2. 教授站的位置（講桌和白板之間）站得住、地面高度',E.canStand(ts.x,ts.z,0.32,0)&&E.nav.heightAt(ts.x,ts.z)===0);
  const r=both([sp.x,sp.z],[ts.x,ts.z]); check('2. 從門口走兩側走道下到講台',r.ok&&Math.abs(r.y)<0.05,fmt(r));
  const w=z.teacherWalk; check('2. 教授來回走的兩端站得住、走得通（AA_740：講桌和白板之間來回）',w.length>=2&&w.every(p=>E.canStand(p.x,p.z,0.32,0))&&both([w[0].x,w[0].z],[w[1].x,w[1].z]).ok);
  const P=z.present; const rp=both([sp.x,sp.z],[P.player.x,P.player.z]), rq=both([sp.x,sp.z],[P.partner.x,P.partner.z]);
  check('2. 報告的站位：玩家、德國同學各站講桌一邊（講桌兩側、地面、面向同學）、走得到',rp.ok&&rq.ok&&Math.abs(P.player.z-C.lectern.z)<0.5&&Math.abs(P.partner.z-C.lectern.z)<0.5&&P.player.x<C.lectern.x-C.lectern.w/2&&P.partner.x>C.lectern.x+C.lectern.w/2&&Math.abs(P.player.yaw)<1e-6&&Math.abs(P.partner.yaw)<1e-6,fmt(rp)+' '+fmt(rq));
  const ex=z.examProf; check('2. 期末考監考的教授位置站得住',!!ex&&E.canStand(ex.x,ex.z,0.32,0)); }
// ---------- 3. 出口 ----------
{ const out=IT.filter(i=>i.exit); const o=out[0]; const L=US_CAMPUS_LAYOUT.spawn_class_out;
  check('3. 只有一個出口「離開教室」→ us_campus 的 spawn_class_out（台階下）',out.length===1&&o.label==='離開教室'&&o.exit.to==='us_campus'&&Math.abs(o.exit.spawn.x-L.x)<1e-6&&Math.abs(o.exit.spawn.z-L.z)<1e-6,o&&JSON.stringify(o.exit));
  const s=z.seatOf('intro','player'); const r=both([s.x,s.z+0.6],[o.x,o.z]); check('3. 從座位走回門口「離開教室」',r.ok,fmt(r));
  check('3. 進來站在門口：出生點在「離開教室」的範圍裡（和 201 一樣，回頭就能出去）',Math.hypot(sp.x-o.x,sp.z-o.z)<=o.radius); }
// ---------- 4. 座位照 AA_740 ----------
const rc=s=>s?[s.row,s.col]:null, eq=(a,b)=>!!a&&!!b&&a[0]===b[0]&&a[1]===b[1];
const right=7, left=0;   // 面向講台的右邊＝+x（第 8 個）
{ const p=z.seatOf('intro','player'), k=z.seatOf('intro','korean'), o=z.others('intro');
  check('4. Introduction：玩家第 3 排右邊靠走道；韓國同學第 4 排玩家正後方',eq(rc(p),[2,right])&&eq(rc(k),[3,right])&&p.x>0,JSON.stringify([rc(p),rc(k)]));
  const all=[p,k].concat(o); check('4. Introduction：約 30 人、坐前 5 排、坐得散（每排都有人、沒有重複的位子）',all.length>=26&&all.length<=32&&all.every(s=>s.row<=4)&&new Set(all.map(s=>s.row*8+s.col)).size===all.length&&[0,1,2,3,4].every(r=>all.some(s=>s.row===r)),`${all.length} 人`); }
{ const p=z.seatOf('comp','player'), gb=z.seatOf('comp','german_before'), ga=z.seatOf('comp','german_after'), br=z.seatOf('comp','brazil'), jp=z.seatOf('comp','japan'), o=z.others('comp');
  check('4. Comparative：玩家第 1 排中間偏右',p&&p.row===0&&p.x>0&&p.x<3,JSON.stringify(rc(p)));
  check('4. Comparative：德國同學第 4 次以前第 2 排最右邊、之後坐玩家左邊（同一排、隔壁、−x）',eq(rc(gb),[1,right])&&ga&&ga.row===p.row&&ga.col===p.col-1);
  check('4. Comparative：巴西同學第 1 排最左；日本同學第 2 排、玩家左後方',eq(rc(br),[0,left])&&jp&&jp.row===1&&jp.col<p.col);
  const named=[p,gb,ga,br,jp]; const clash=o.filter(s=>named.some(n=>n===s));
  check('4. Comparative：約 16 人、只坐前 2 排、路人不坐有名字的人的位子（德國同學前後兩個位子都空著）',o.length+4>=13&&o.length+4<=17&&o.concat(named).every(s=>s.row<=1)&&!clash.length&&new Set(o).size===o.length,`${o.length+4} 人、撞位 ${clash.length}`);
  const ps=z.present.professorSeat; check('4. 期中／期末報告：教授坐第 1 排最右邊，Comparative 的路人和有名字的人都不坐那裡',eq(rc(ps),[0,right])&&!o.includes(ps)&&!named.includes(ps)); }
{ const p=z.seatOf('lw','player'), m=z.seatOf('lw','long_met'), u=z.seatOf('lw','long_unmet'), o=z.others('lw');
  check('4. Legal Writing：玩家第 2 排中間；舊序章人物己見過＝玩家右邊（+x 隔壁）、沒見過＝玩家正前方（第 1 排）',p&&p.row===1&&(p.col===3||p.col===4)&&m&&m.row===p.row&&m.col===p.col+1&&u&&u.row===0&&u.col===p.col,JSON.stringify([rc(p),rc(m),rc(u)]));
  check('4. Legal Writing：約 12 人、只坐前 2 排、路人不坐舊序章人物己兩個可能的位子',o.length+2>=10&&o.length+2<=13&&o.concat([p,m,u]).every(s=>s.row<=1)&&!o.includes(m)&&!o.includes(u)&&!o.includes(p),`${o.length+2} 人`); }
{ const keys=Object.values(C.seatPlan).flatMap(v=>Object.keys(v)); check('4. 教室裡沒有學姊（AA_740：研討課是她自己的課，不在這間演）',!keys.some(k=>/senior|xuejie|wen|heroine|sis/i.test(k)),keys.join(',')); }
// ---------- 5. 正式模型 ----------
{ const m=ASSETS.manifest['bldg.us_classroom']; const glb=m&&path.join(ROOT,m.url);
  check('5. ASSETS.manifest 有 bldg.us_classroom（type building、有來源與授權）',!!m&&m.type==='building'&&!!m.source&&!!m.license&&fs.existsSync(glb),m&&m.url);
  const zaSrc=fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8'); const ZA=JSON.parse(zaSrc.slice(zaSrc.indexOf('{'),zaSrc.lastIndexOf('}')+1));
  const za=ZA.us_classroom||(ZA.zones&&ZA.zones.us_classroom); check('5. zone_assets 的 us_classroom 有 bldg.us_classroom（預先載入）',Array.isArray(za)&&za.includes('bldg.us_classroom'),JSON.stringify(za));
  if(m&&fs.existsSync(glb)){ const b=fs.readFileSync(glb); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const bin=b.slice(20+n+8);
    const node=J.nodes.find(x=>x.name==='SEATPANS'); let pts=[];
    if(node&&node.mesh!=null){ for(const pr of J.meshes[node.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView]; const off=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12; for(let i=0;i<a.count;i++){ const q=off+i*st; pts.push([bin.readFloatLE(q),bin.readFloatLE(q+4),bin.readFloatLE(q+8)]); } } }
    const t=node&&node.translation||[0,0,0]; pts=pts.map(p=>[p[0]+t[0],p[1]+t[1],p[2]+t[2]]);
    const miss=[]; for(const s of S){ const near=pts.filter(p=>Math.abs(p[0]-s.x)<0.3&&Math.abs(p[2]-s.z)<0.35); const top=near.length?Math.max(...near.map(p=>p[1])):null; if(top==null||top<s.y+0.3||top>s.y+0.6) miss.push(`第${s.row+1}排第${s.col+1}個 ${top==null?'沒有椅面':'椅面高 '+(top-s.y).toFixed(2)}`); }
    check('5. GLB：48 張椅子的椅面在配置的座位上（離地 0.3～0.6 m）',!!node&&!miss.length,miss.slice(0,4).join(' | '));
    const xs=pts.map(p=>p[0]); const N=48; check('5. GLB：椅面頂點分成 48 張（左右範圍在教室裡）',pts.length>0&&Math.min(...xs)>-C.W/2&&Math.max(...xs)<C.W/2&&S.every(s=>pts.some(p=>Math.hypot(p[0]-s.x,p[2]-s.z)<0.35))&&N===S.length);
    const fl=J.materials.find(x=>x.name==='cls_floor'); const bc=fl&&fl.pbrMetallicRoughness&&fl.pbrMetallicRoughness.baseColorFactor;
    check('5. GLB：地毯（cls_floor）在、不是深色木地板（D112）：材質名不是木頭、有貼圖或底色偏灰藍',!!fl&&!/wood|oak|floorboard/i.test(JSON.stringify(fl))&&(!bc||bc[2]>=bc[0]),bc?JSON.stringify(bc):'用貼圖');
    // 房間的範圍：天花板與牆的頂點不超出配置的 W×D×H（容許牆厚 0.4）
    const box=nm=>{ const nd=J.nodes.find(x=>x.name===nm); if(!nd||nd.mesh==null) return null; let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9]; for(const pr of J.meshes[nd.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION]; if(a.min&&a.max){ for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],a.min[k]); hi[k]=Math.max(hi[k],a.max[k]); } } } return {lo,hi}; };
    const bx=['WALL_N','WALL_S','WALL_E','WALL_W','ceiling'].map(box).filter(Boolean); const lo=[0,1,2].map(k=>Math.min(...bx.map(b=>b.lo[k]))), hi=[0,1,2].map(k=>Math.max(...bx.map(b=>b.hi[k])));
    check('5. GLB：牆、天花板圍出的房間和配置的大小一樣（W×D×H，誤差 0.4 m）',bx.length===5&&Math.abs(lo[0]+C.W/2)<0.4&&Math.abs(hi[0]-C.W/2)<0.4&&Math.abs(lo[2]+C.D/2)<0.4&&Math.abs(hi[2]-C.D/2)<0.4&&Math.abs(hi[1]-C.H)<0.4,JSON.stringify([lo.map(v=>+v.toFixed(2)),hi.map(v=>+v.toFixed(2))])); }
  const views=['summer','autumn','bare','snow'].flatMap(s=>['day','night'].map(t=>`assets/models/env/views/us_cls120_${s}_${t}.webp`)); const missing=views.filter(v=>!fs.existsSync(path.join(ROOT,v)));
  check('5. 窗景：四季（summer／autumn／bare／snow）白天、晚上 8 張都在（窗外看的是美國校園的正式模型）',!missing.length,missing.join(' '));
  check('5. 窗景照日子換：區域用 US3.usSeasonKey()',US_CLASSROOM.viewKind()===('us_cls120_'+US3.usSeasonKey())); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
