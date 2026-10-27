// 美國公寓 v3（使用者 2026-10-27「美國交換學生我租的地方 有一個小的WALKIN CLOSET 不是衣櫃 然後床旁邊是書桌再旁邊是洗手間 洗手間有浴缸」，LAWWW2-C）——不需要瀏覽器。
// 在 Node 裡建出遊戲真正的 us_apartment（src/data/us_layouts.js＋src/us3d.js），用引擎真正的找路＋移動碰撞（E.simWalk）：
//   1. 衣物間是走得進去的小房間（walk-in closet）：從臥室走得進去、站得住；不是一個關著的門（衣櫃）；裡面有吊衣桿區（配置 closetRods）；
//   2. 床、書桌、洗手間同一側、照這個順序：書桌貼在床邊（靠東牆），洗手間的門就在書桌旁邊；
//   3. 洗手間有浴缸，門開著：走得到洗手間門口（站得住），站在那裡看得到浴缸（中間沒有牆）；
//   4. 坐書桌、睡覺、看衣物間、看衛浴的互動點都走得到（「看」的字照舊是 AA 寫的那幾句：us_life3d.js 照門的 label 找）；
//   5. 學姊的 C 棟合租戶（us_shared）不動：衛浴、衣物間照舊關著。正式模型（GLB）：衣物間的衣服、浴缸在對的房間裡。
//   6. 別的檔案寫死的公寓座標（us_life3d.js、r2y4a3d.js 的出生點、「去上課」）站得住、走得到床邊和書桌。
//   7. 舊存檔剛好站在公寓裡讀檔：落在擋住的地方（書桌、浴缸、吊衣桿…）會被 E.unstick 移出來，站得住、走得到床邊。
// 修改前（配置 v2）FAIL。用法：node tests/us_apt_closet_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const R=0.32, stand=(x,z)=>E.canStand(x,z,R,0);
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r.ok?{ok:true}:Object.assign({run:true},r); };
const fmt=(r)=>JSON.stringify(r).slice(0,200);
function spotsOf(it){ const r=(it.radius||1.2)-0.05, out=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; if(stand(it.x+dx,it.z+dz)) out.push([d,it.x+dx,it.z+dz]); } return out.sort((a,b)=>a[0]-b[0]).map(q=>[q[1],q[2]]); }
/* GAME.seatApproach（game3d.js）的候選：指定的 ap 先，再來座位前面、後面、兩側……（第一個站得住、走得到的）*/
function apsOf(s){ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0); const c=[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz]); return s.ap?[s.ap].concat(c):c; }
function firstReach(from,pts){ let last=null; for(const p of pts.slice(0,12)){ const r=both(from,p); if(r.ok) return {ok:true,at:p}; last=r; } return last||{ok:false,reason:'沒有站得住的位置'}; }

const L=US_APARTMENT_LAYOUT, room=id=>L.rooms.find(r=>r.id===id), F=t=>L.furniture.find(f=>f.type===t), D=id=>L.doors.find(d=>d.id===id);
loadZone('us_apartment'); const spawn=[L.spawns.bedroom.x,L.spawns.bedroom.z];
const cl=room('closet'), bt=room('bath'), bed=F('bed'), desk=F('desk'), tub=F('tub');
// 1. walk-in closet
const cc=[(Math.max(cl.x0,1.4)+cl.x1)/2,(cl.z0+cl.z1)/2-0.4];
check('1. 衣物間走得進去：裡面站得住（'+cc.map(v=>v.toFixed(1))+'）',stand(cc[0],cc[1]));
{ const r=both(spawn,cc); check('1. 從床尾走得進衣物間',r.ok,fmt(r)); }
check('1. 衣物間的門開著（不是關著的門＝衣櫃）',!!D('closet')&&!!D('closet').openDoor);
check('1. 裡面有吊衣桿區（配置 closetRods 的 west／south）',!!L.furniture.find(f=>f.type==='closetRods'&&f.west&&f.south));
// 2. 床—書桌—洗手間
const bedZ=[bed.z-bed.w/2,bed.z+bed.w/2], deskZ=[desk.z-desk.w/2,desk.z+desk.w/2], bedHead=bed.x+bed.d/2, deskX=[desk.x-desk.d/2,desk.x+desk.d/2];
check('2. 床頭、書桌都靠東牆（同一側）',Math.abs(bedHead-(bt.x1-0.1))<0.15&&Math.abs(deskX[1]-(bt.x1-0.1))<0.15,'床頭 x '+bedHead.toFixed(2)+'、書桌東緣 '+deskX[1].toFixed(2));
check('2. 書桌貼在床邊（中間不到 10 cm）',Math.abs(deskZ[0]-bedZ[1])<0.1,'床 z '+bedZ.map(v=>v.toFixed(2))+'、書桌 z '+deskZ.map(v=>v.toFixed(2)));
const bd=D('bath'); check('2. 洗手間的門在書桌旁邊（門和書桌另一端相距不到 1 m，門開在書桌那一側）',!!bd&&Math.hypot(Math.max(0,Math.max(deskX[0]-(bd.x+bd.w/2),(bd.x-bd.w/2)-deskX[1])),bd.z-deskZ[1])<1.0&&bd.z>deskZ[1],'門 x '+(bd&&bd.x)+' z '+(bd&&bd.z)+'、書桌南端 z '+deskZ[1].toFixed(2));
// 3. 浴缸、門口看得到
check('3. 洗手間有浴缸（在衛浴裡）',!!tub&&tub.x0>=bt.x0-0.01&&tub.x1<=bt.x1+0.01&&tub.z0>=bt.z0&&tub.z1<=bt.z1+0.01);
check('3. 洗手間的門開著',!!bd&&!!bd.openDoor);
const door=[bd.x,bd.z+0.25]; check('3. 洗手間門口（剛進門）站得住',stand(door[0],door[1]),door.map(v=>v.toFixed(2)).join());
{ const r=both(spawn,door); check('3. 從床尾走得到洗手間門口',r.ok,fmt(r)); }
{ const tc=[(tub.x0+tub.x1)/2,(tub.z0+tub.z1)/2]; let blocked=null; const W=L.walls[0].list;
  for(const w of W){ if(w.id==='tub_e') continue; const a=w.axis==='x'?[door[1],tc[1]]:[door[0],tc[0]]; if((a[0]-w.at)*(a[1]-w.at)>=0) continue; const t=(w.at-a[0])/(a[1]-a[0]), u=w.axis==='x'?door[0]+(tc[0]-door[0])*t:door[1]+(tc[1]-door[1])*t; if(u<Math.min(w.from,w.to)||u>Math.max(w.from,w.to)) continue;
    if(!(w.open||[]).some(o=>u>=o[0]&&u<=o[1])) blocked=w.id; }
  check('3. 站在洗手間門口看得到浴缸（中間沒有牆）',!blocked,blocked||''); }
// 4. 互動點
const IT=E.interactables, find=l=>IT.find(i=>i.label===l);
for(const [lab,extra] of [['坐在書桌前',null],['睡覺',null],['衣物間','look'],['衛浴','look']]){ const it=find(lab); const sp=it&&spotsOf(it); const r=sp&&sp.length?firstReach(spawn,sp):null;
  check('4. 「'+lab+'」的互動點走得到'+(extra?'（還是「看」，字照舊）':''),!!it&&!!r&&r.ok&&(!extra||!!it.look),it?fmt(r):'沒有這個互動點'); }
// 5. 合租戶不動、GLB
loadZone('us_shared'); const SL=US_SHARED_LAYOUT, sb=SL.rooms.find(r=>r.id==='bath'), sc=SL.rooms.find(r=>r.id==='closet');
check('5. 合租戶的衛浴、衣物間照舊關著（站不進去）',!!sb&&!!sc&&!stand((sb.x0+sb.x1)/2,(sb.z0+sb.z1)/2)&&!stand((sc.x0+sc.x1)/2,(sc.z0+sc.z1)/2));
{ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/us_apartment.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i]; return {min:a.min,max:a.max}; };
  const box=nm=>{ let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const nd of J.nodes){ if(nd.mesh==null||!(nd.name||'').startsWith(nm)) continue; for(const p of J.meshes[nd.mesh].primitives){ const a=acc(p.attributes.POSITION); for(let k=0;k<3;k++){ mn[k]=Math.min(mn[k],a.min[k]); mx[k]=Math.max(mx[k],a.max[k]); } } } return mn[0]<1e8?{mn,mx}:null; };
  const cb=box('usa_closet_clothes');
  check('5. 正式模型：衣物間的衣服（usa_closet_clothes）在衣物間裡',!!cb&&cb.mn[0]>=cl.x0-0.01&&cb.mx[0]<=cl.x1+0.01&&cb.mn[2]>=cl.z0-0.01&&cb.mx[2]<=cl.z1+0.01,cb?JSON.stringify(cb):'沒有'); }
/* 6. 別的檔案寫死的公寓座標（從原始碼讀出來）：us_life3d.js、r2y4a3d.js 的 SPAWN0.us_apartment，us_life3d.js「去上課」的互動點——站得住、走得到床邊和書桌 */
loadZone('us_apartment');
{ const bedIt=find('睡覺'), deskIt=find('坐在書桌前'); const hard=[];
  for(const f of ['src/us_life3d.js','src/r2y4a3d.js']){ const s=fs.readFileSync(path.join(ROOT,f),'utf8'); const m=s.match(/SPAWN0=\{[^;]*?us_apartment:\{x:([-\d.]+),z:([-\d.]+)/); if(m) hard.push([f+' SPAWN0',+m[1],+m[2]]); }
  { const s=fs.readFileSync(path.join(ROOT,'src/us_life3d.js'),'utf8'); const m=s.match(/zoneId==='us_apartment'\) IT\.push\(\{x:([-\d.]+),z:([-\d.]+)/); if(m) hard.push(['us_life3d.js 去上課',+m[1],+m[2]]); }
  check('6. 找到別的檔案寫死的公寓座標（3 個）',hard.length===3,hard.map(h=>h[0]+' '+h[1]+','+h[2]).join('；'));
  for(const [nm,x,z] of hard){ const p=stand(x,z)?[x,z]:(spotsOf({x,z,radius:0.8})[0]||null);
    const a=p&&bedIt?firstReach(p,spotsOf(bedIt)):null, b=p&&deskIt?firstReach(p,apsOf(deskIt.seat).filter(q=>stand(q[0],q[1]))):null;
    check('6. '+nm+'（'+x+','+z+'）站得住，走得到床邊、書桌',!!p&&stand(p[0],p[1])&&!!a&&a.ok&&!!b&&b.ok,fmt([p,a&&a.ok,b&&b.ok])); } }
/* 7. 舊存檔剛好站在公寓裡讀檔（v2 的存檔位置現在可能是書桌、浴缸、吊衣桿）：E.loadZone 對讀檔的出生點也做 E.unstick（engine3d.js），
      臥室、衣物間、衛浴每 0.2 m 放一個位置，移出來以後要站得住、走得到床邊 */
loadZone('us_apartment');
{ const bedIt=find('睡覺'), bedSp=bedIt?spotsOf(bedIt):[]; let n=0, moved=0; const bad=[];
  for(let x=1.5;x<=4.9;x+=0.2) for(let z=-2.9;z<=2.9;z+=0.2){ const ent={lv:0,obj:{position:new THREE.Vector3(x,0,z)}}; n++; if(!E.canStand(x,z,0.3,0)){ E.unstick(ent,16); moved++; }   /* 和 engine3d.js 一樣用 0.3 */
    const p=[ent.obj.position.x,ent.obj.position.z]; if(!E.canStand(p[0],p[1],0.3,0)){ bad.push(x.toFixed(1)+','+z.toFixed(1)+'→站不住'); continue; }
    if(!(n%3)){ const r=firstReach(p,bedSp); if(!r.ok) bad.push(x.toFixed(1)+','+z.toFixed(1)+'→'+p.map(v=>v.toFixed(2))+' 走不到床邊'); } }
  check('7. 舊存檔站在公寓裡（臥室、衣物間、衛浴每 0.2 m）：讀檔移出來以後站得住、走得到床邊',!bad.length,n+' 個位置、'+moved+' 個要移；'+bad.slice(0,6).join('；')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
