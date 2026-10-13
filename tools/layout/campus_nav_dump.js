// 校園的導航格與路線（開發用；給 tools/layout/plan_a_map.py 畫俯視圖）：用遊戲自己的程式在 Node 裡蓋出校園，輸出第 0 層的導航格、地名、
// 以及指定路線（遊戲的找路 NavGrid.path：人站得住的格子）的折線與長度。舊版（例如 v9.5 的 worktree）也可以跑，兩份拿來比較改了哪裡。
// 用法：node tools/layout/campus_nav_dump.js <repo 根目錄> <輸出.json> [路線.json：[{name,from:[x,z],to:[x,z]}]]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]), OUT=process.argv[3], ROUTES=process.argv[4]?JSON.parse(fs.readFileSync(process.argv[4],'utf8')):[];
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
// index.html 的載入順序，只載入蓋場景需要的（到 audio3d 之前，不含 VRM），加上地名資料
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const all=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const stop=all.indexOf('src/audio3d.js');
const files=all.slice(0,stop<0?all.length:stop).filter(f=>!/three-vrm|character3d/.test(f)).concat(['src/data/calendar.js','src/data/places.js'].filter(f=>fs.existsSync(path.join(ROOT,f))));
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const N=(E.levels&&E.levels[0])||z.nav;
const w00=N.toWorld(0,0), w11=N.toWorld(1,1), cell=+(w11[0]-w00[0]).toFixed(3);
const blocked=[]; for(let i=0;i<N.cols*N.rows;i++) blocked.push(N.b[i]?1:0);
const cm=N.clearMask?N.clearMask():null;
const routes=[];
for(const r of ROUTES){ const a=N.nearestFree?N.nearestFree(r.from[0],r.from[1],3):r.from, b=N.nearestFree?N.nearestFree(r.to[0],r.to[1],3):r.to;
  const p=a&&b?N.path(a[0],a[1],b[0],b[1]):null; let len=0, pts=null;
  if(p&&p.length){ pts=[[a[0],a[1]]].concat(p.map(q=>[q[0],q[1]])); for(let i=1;i<pts.length;i++) len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]); }
  routes.push({name:r.name,from:r.from,to:r.to,ok:!!pts,len:+len.toFixed(1),pts}); }
const lm=(typeof PLACES!=='undefined'&&PLACES.landmarks&&PLACES.landmarks.campus)||[];
fs.writeFileSync(OUT,JSON.stringify({repo:ROOT,cols:N.cols,rows:N.rows,cell,x0:w00[0],z0:w00[1],blocked,clear:cm?Array.from(cm,v=>v?1:0):null,landmarks:lm,routes,speeds:E.SPD||null}));
console.log('wrote',OUT,N.cols+'×'+N.rows,'cell',cell,'origin',w00.map(v=>+v.toFixed(2)).join(','),'routes',routes.map(r=>r.name+':'+(r.ok?r.len+' m':'走不到')).join(' | '));
