// 社博的人和互動點對齊 LAWWW2 的 36 頂（CLUBFAIR-REAL-1027；LAWWW-C 2026-10-27）——不需要瀏覽器。
//   ① 服務台（activities.js club_expo_y1s1.spot）＝info 的 front；② 學姊的作息（characters.js 社博那一筆的 at）在法服帳篷前、站得住、從大道走得到；
//   ③ 停在攤位前的人（club_fair.js FILL）站得住；④ 拿傳單的新生（ROUTES）整條路站得住；⑤ 舞台前面（STAGE）包含舞台的 front、站得住；
//   ⑥ 大二的社博（events.js ev_y2_club_expo）：走到每一攤前面都算「走到攤位那一排」。
// 修改前（5b227d3aa＋套 LAWWW2 patch）：①②⑥ FAIL（還是九頂那一排的位置）。用法：node tests/club_fair_align_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/club_fair_expo_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};

function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:4.1}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const DATES={}; let dd=0; const day=k=>{ if(DATES[k]==null) DATES[k]=++dd; return DATES[k]; };
global.CALENDAR={dateOf:d=>({key:Object.keys(DATES).find(k=>DATES[k]===d)||'2025-01-01'})};
global.ACTIVITIES={list:[{id:'club_expo_y1s1',dates:['2025-09-06']}],on:(a,d)=>(a.dates||[]).includes(CALENDAR.dateOf(d).key)};   /* on：zones3d.js 的 isFairDay、isExpoDay 照 ACTIVITIES.on 判斷（舊局 9/30～10/1 的 datesOld，y1fb-1027）*/
const setDay=(k,econ)=>{ global.GAME={G:{day:day(k),flags:{}}}; global.STORY={isEcon:()=>!!econ}; };
const R=0.3, stand=(x,z)=>E.canStand(x,z,R,0), rect=(x,z,w,d,f)=>{ const bad=[]; for(let u=-w/2+0.25;u<=w/2-0.25+1e-6;u+=0.5) for(let v=-d/2+0.25;v<=d/2-0.25+1e-6;v+=0.5) if(!f(x+u,z+v)) bad.push([+(x+u).toFixed(2),+(z+v).toFixed(2)]); return bad; };
{ let src=fs.readFileSync(path.join(ROOT,'src/data/club_fair.js'),'utf8'); src=src.replace(/^const CLUB_FAIR\s*=/m,'globalThis.CLUB_FAIR='); vm.runInThisContext(src,{filename:'club_fair.js'}); }
const fmt=(r)=>JSON.stringify(r).slice(0,220);
const F=CLUB_FAIR, J=JSON.stringify, near=(a,b,d)=>Math.hypot(a[0]-b[0],a[1]-b[1])<=d;
const ACT=fs.readFileSync(path.join(ROOT,'src/data/activities.js'),'utf8'), CH=fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8'), EV=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
setDay('2025-09-06'); loadZone('campus');
const front=id=>Z3.fairExpoFront(id), mid=f=>[Math.max(-88,Math.min(10,f[0])),0];
// ①
{ const m=ACT.match(/id:'club_expo_y1s1'[^\n]*?spot:\{x:(-?[\d.]+),z:(-?[\d.]+)/); const sp=m?[+m[1],+m[2]]:null;
  check('① 服務台的互動點（activities.js spot）＝服務台帳篷的 front、站得住',!!sp&&near(sp,front('info'),0.05)&&stand(sp[0],sp[1]),J(sp)+' '+J(front('info'))); }
// ②
{ const m=CH.match(/at:\[(-?[\d.]+),(-?[\d.]+),Math\.PI,0\],activity:'club_expo_y1s1'/); const at=m?[+m[1],+m[2]]:null; const r=at?both(mid(front('lawclub')),at):{ok:false};
  check('② 學姊在法服帳篷前（離玩家站的點 2 m 以內）、站得住、從大道中間走得到',!!at&&near(at,front('lawclub'),2)&&stand(at[0],at[1])&&r.ok,J(at)+' '+fmt(r)); }
// ③
{ const bad=(F.FILL||[]).filter(p=>!stand(p[0],p[1])); check('③ 停在攤位前的人站得住（三個）',(F.FILL||[]).length===3&&!bad.length,J(bad)); }
// ④
{ const bad=[]; for(const r of F.ROUTES||[]){ const [a,b]=r; for(let u=0;u<=1.0001;u+=0.02){ const x=a[0]+(b[0]-a[0])*u, z=a[1]+(b[1]-a[1])*u; if(!stand(x,z)){ bad.push([+x.toFixed(1),+z.toFixed(1)]); break; } } }
  check('④ 拿傳單的新生的路（大道中間）整條站得住',(F.ROUTES||[]).length>=2&&!bad.length,J(bad)); }
// ⑤
check('⑤ 舞台前面的圈包含舞台的 front、圈心站得住',!!F.STAGE&&near([F.STAGE.x,F.STAGE.z],front('stage'),F.STAGE.r-0.5)&&stand(F.STAGE.x,F.STAGE.z),J(F.STAGE)+' '+J(front('stage')));
// ⑥
{ const m=EV.match(/id:'ev_y2_club_expo'[^\n]*near:\{x:(-?[\d.]+),z:(-?[\d.]+),r:([\d.]+)\}[^\n]*\n[^\n]*Math\.abs\(P\.z\)<=([\d.]+)&&P\.x>=(-?[\d.]+)&&P\.x<=(-?[\d.]+)/);
  const ok=!!m&&CLUB_FAIR_EXPO.tents.every(t=>{ const f=front(t.id); return Math.hypot(f[0]-(+m[1]),f[1]-(+m[2]))<=+m[3]&&Math.abs(f[1])<=+m[4]&&f[0]>=+m[5]&&f[0]<=+m[6]; });
  check('⑥ 大二的社博：走到 36 攤任何一攤前面都算走到攤位那一排（near 圈＋大道範圍）',ok,m?m.slice(1).join(','):'找不到'); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
