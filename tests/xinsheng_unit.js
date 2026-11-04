/* 新生南路（ART-XINSHENG-GATE-1103，LAWWW2 11-03）：區域建得起來；從側門進來走得到溫州街巷口、七間店的門口、兩條斑馬線的對面；斑馬線以外的車道走不到；
   互動點：側門回校園、往溫州街。用法：node tests/xinsheng_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_LAYOUT;
check('0. Z3.ZONES.xinsheng 有登記',!!(Z3.ZONES&&Z3.ZONES.xinsheng));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.xinsheng.build(E); const nav=z.nav;
const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)];
const freeAt=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
function reach(a,b){ const [sx,sz]=cellOf(...a), [tx,tz]=cellOf(...b); const seen=new Uint8Array(nav.cols*nav.rows), q=[[sx,sz]]; seen[nav.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=nav.cols||ny>=nav.rows) continue; const i=nav.idx(nx,ny); if(seen[i]||nav.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
const sp=[z.spawn.x,z.spawn.z];
check('1. 側門進來的出生點站得住',freeAt(...sp),sp.join(','));
check('2. 出生點走得到溫州街巷口',reach(sp,[L.wenzhouLane.exit.x,L.wenzhouLane.exit.z]));
const bad=L.shops.filter(q=>!reach(sp,[L.facade.x+0.9,q.door.z])).map(q=>q.id);
check('3. 出生點走得到七間店的門口',!bad.length,bad.join(' ')||(L.shops.length+' 間'));
let road=0; for(let x=L.road.x0+0.5;x<L.road.x1-0.5;x+=0.5) for(let zz=L.road.z0+1;zz<L.road.z1-1;zz+=0.5){ if(L.crossings.some(c=>Math.abs(zz-c.z)<=c.w/2+0.5)) continue; if(freeAt(x,zz)) road++; }
check('4. 斑馬線以外的車道一格都走不到',road===0,road+' 格');
const cr=L.crossings.filter(c=>!reach([L.walkEast.x0+1.5,c.z],[L.walkWest.x0+1.0,c.z])).map(c=>c.id);
check('5. 兩條斑馬線從校園那一側走得到店面那一側',!cr.length,cr.join(' '));
const g=E.interactables.find(q=>q.exit&&q.exit.to==='campus'), w=E.interactables.find(q=>q.exit&&q.exit.to==='wenzhou');
check('6. 側門「回到首都帝大」→ campus（校園西側圍牆北段那一側）',!!g&&g.exit.spawn.x===L.sideGate.campusSpawn.x&&g.exit.spawn.z===L.sideGate.campusSpawn.z&&reach(sp,[g.x,g.z]));
check('7. 「往溫州街」→ wenzhou',!!w&&reach(sp,[w.x,w.z]));
check('8. 每間店門口有互動點（室內還沒做的是「看」）',L.shops.every(q=>E.interactables.some(it=>Math.abs(it.z-q.door.z)<0.01&&(it.look||it.exit))));
// 校園那一端（西側圍牆北段的側門）
{ const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const more=eval(T.match(/const files=(\[[^\]]+\])/)[1]).filter(f=>!files.includes(f));
  process.on('unhandledRejection',()=>{});   // 校園的正式模型在 node 裡載不到（fetch 相對網址），不影響導航
  for(const f of more){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const cz=Z3.ZONES.campus.build(E); const cn=cz.nav;
  const cOf=(x,zz)=>[Math.floor((x-cn.ox)/cn.cell),Math.floor((zz-cn.oz)/cn.cell)];
  const cFree=(x,zz)=>{ const [c,r]=cOf(x,zz); return c>=0&&r>=0&&c<cn.cols&&r<cn.rows&&!cn.b[cn.idx(c,r)]; };
  function cReach(a,b){ const [sx,sz]=cOf(...a), [tx,tz]=cOf(...b); const seen=new Uint8Array(cn.cols*cn.rows), q=[[sx,sz]]; seen[cn.idx(sx,sz)]=1;
    while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=cn.cols||ny>=cn.rows) continue; const i=cn.idx(nx,ny); if(seen[i]||cn.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
  const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng'), cs=L.sideGate.campusSpawn;
  check('9. 校園有「往新生南路（側門）」出口，進去落在新生南路側門內',!!ex&&ex.exit.spawn.x===L.sideGate.spawn.x&&ex.exit.spawn.z===L.sideGate.spawn.z);
  check('10. 從新生南路回來的校園出生點站得住、走得到側門出口',cFree(cs.x,cs.z)&&!!ex&&cReach([cs.x,cs.z],[ex.x,ex.z]),cs.x+','+cs.z);
  check('11. 校園出生點走得到校門口（校門內側 (−110, 0)）',cReach([cs.x,cs.z],[-110,0]));
  check('12. 圍牆在側門以外照舊擋住（z −100、−70 圍牆外走不到）',!cFree(-125.5,-100)&&!cFree(-125.5,-70)); }
// 溫州街那一端（西側橫巷的北口）
{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const wz=Z3.ZONES.wenzhou.build(E); const wn=wz.nav;
  const wOf=(x,zz)=>[Math.floor((x-wn.ox)/wn.cell),Math.floor((zz-wn.oz)/wn.cell)];
  const wFree=(x,zz)=>{ const [c,r]=wOf(x,zz); return c>=0&&r>=0&&c<wn.cols&&r<wn.rows&&!wn.b[wn.idx(c,r)]; };
  function wReach(a,b){ const [sx,sz]=wOf(...a), [tx,tz]=wOf(...b); const seen=new Uint8Array(wn.cols*wn.rows), q=[[sx,sz]]; seen[wn.idx(sx,sz)]=1;
    while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=wn.cols||ny>=wn.rows) continue; const i=wn.idx(nx,ny); if(seen[i]||wn.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
  const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng'), ws=L.wenzhouLane.exit.spawn;
  check('13. 溫州街有「往新生南路」出口（西側橫巷北口），進去落在新生南路那一側巷口',!!ex&&reach([ex.exit.spawn.x,ex.exit.spawn.z],[L.wenzhouLane.exit.x,L.wenzhouLane.exit.z])&&freeAt(ex.exit.spawn.x,ex.exit.spawn.z));
  check('14. 從新生南路來的溫州街出生點站得住、走得到出口',wFree(ws.x,ws.z)&&!!ex&&wReach([ws.x,ws.z],[ex.x,ex.z]),ws.x+','+ws.z);
  check('15. 溫州街出生點走得到兩點半門口、公館巷口（主巷整條接得起來）',wReach([ws.x,ws.z],[51.7,0])&&wReach([ws.x,ws.z],[51.3,-9.8]));
  check('16. 巷底 W0 照舊擋住（W0 的導航阻擋 (−43.7, −1) 走不到）',!wFree(-43.7,-1)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
