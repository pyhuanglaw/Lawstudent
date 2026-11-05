/* 新生南路（ART-XINSHENG-GATE-1103，LAWWW2 11-03）：區域建得起來；從側門進來走得到溫州街巷口、七間店的門口、兩條斑馬線的對面；斑馬線以外的車道走不到；
   互動點：側門回校園、往溫州街。
   17、18（XS-ARCADE-NAV-1105，LAWWW2-C 11-05）：騎樓的導航照正式模型 xinsheng_street.glb——
     17 柱子：模型的每一根騎樓柱子（wz_pillar 材質，騎樓靠街那一邊）導航都擋住；導航在柱子那一欄擋住的格子，每一格都對得到模型的一根柱子（沒有看不到的柱子）
     18 沒有騎樓的公寓（南北兩段）：模型那幾段沒有騎樓天花板、一樓的牆在立面往裡 0.2 m；牆裡面站不住、牆外面的人行道站得住；騎樓兩端走不進公寓
   用法：node tests/xinsheng_unit.js */
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
check('6. 側門「回到首都帝大」→ campus（映月湖和博思中間的側門，XS-GATE-MOVE-1105）',!!g&&g.exit.spawn.x===L.sideGate.campusSpawn.x&&g.exit.spawn.z===L.sideGate.campusSpawn.z&&reach(sp,[g.x,g.z]));
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
// 17、18：騎樓的導航照正式模型（XS-ARCADE-NAV-1105）——讀 GLB 的頂點（世界座標＝區域座標；模型沒有位移）
{ const G=path.join(ROOT,'assets/models/env/second_ai/xinsheng_street.glb'), b=fs.readFileSync(G), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString()), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), st=v.byteStride||12, out=[]; for(let k=0;k<a.count;k++) out.push([bin.readFloatLE(o+k*st),bin.readFloatLE(o+k*st+4),bin.readFloatLE(o+k*st+8)]); return out; };
  const mul=(A,B)=>{ const C=new Array(16).fill(0); for(let r=0;r<4;r++) for(let c=0;c<4;c++) for(let k=0;k<4;k++) C[c*4+r]+=A[k*4+r]*B[c*4+k]; return C; };
  const TRS=n=>{ if(n.matrix) return n.matrix; const t=n.translation||[0,0,0], q=n.rotation||[0,0,0,1], s=n.scale||[1,1,1], [x,y,zq,w]=q;
    return [(1-2*(y*y+zq*zq))*s[0],2*(x*y+zq*w)*s[0],2*(x*zq-y*w)*s[0],0,2*(x*y-zq*w)*s[1],(1-2*(x*x+zq*zq))*s[1],2*(y*zq+x*w)*s[1],0,2*(x*zq+y*w)*s[2],2*(y*zq-x*w)*s[2],(1-2*(x*x+y*y))*s[2],0,t[0],t[1],t[2],1]; };
  const V=[]; const walkN=(i,M)=>{ const n=J.nodes[i], W=mul(M,TRS(n)); if(n.mesh!=null) for(const p of J.meshes[n.mesh].primitives){ const mn=(J.materials[p.material]||{}).name||''; for(const v of acc(p.attributes.POSITION)) V.push([W[0]*v[0]+W[4]*v[1]+W[8]*v[2]+W[12],W[1]*v[0]+W[5]*v[1]+W[9]*v[2]+W[13],W[2]*v[0]+W[6]*v[1]+W[10]*v[2]+W[14],mn]); } (n.children||[]).forEach(c=>walkN(c,W)); };
  for(const r of J.scenes[J.scene||0].nodes) walkN(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  const F=L.facade, AR=L.arcade, colX=AR.x1-0.3;
  // 模型的柱子：wz_pillar 材質、騎樓靠街那一條（x 立面往裡 0.8 m 以內）、地面附近的頂點，照 z 分群（相鄰 < 0.5 m 是同一根）
  const pz=V.filter(v=>/pillar/i.test(v[3])&&v[0]>AR.x1-0.8&&v[0]<AR.x1+0.05&&v[1]<0.5).map(v=>v[2]).sort((a,b)=>a-b), cols=[];
  for(const zz of pz){ const c=cols[cols.length-1]; if(c&&zz-c.z1<0.5) c.z1=zz; else cols.push({z0:zz,z1:zz}); }
  const missing=cols.filter(c=>!(!freeAt(colX,(c.z0+c.z1)/2)||!nav.clear(colX,(c.z0+c.z1)/2,0.3))).map(c=>((c.z0+c.z1)/2).toFixed(1));
  const ghost=[]; for(let zz=L.road.z0+0.75;zz<L.road.z1-0.5;zz+=nav.cell){ if(freeAt(colX,zz)) continue; if(zz>L.wenzhouLane.z0-0.3&&zz<L.wenzhouLane.z1+0.3) continue;
    const near=cols.some(c=>zz>c.z0-0.5&&zz<c.z1+0.5); const fill=!freeAt(colX-0.6,zz)&&!freeAt(colX-1.5,zz); if(!near&&!fill) ghost.push(zz.toFixed(2)); }
  check('17. 騎樓柱子和正式模型一樣：模型的 '+cols.length+' 根都擋住、導航沒有模型裡沒有的柱子',cols.length>=5&&!missing.length&&!ghost.length,
    '模型 z '+cols.map(c=>((c.z0+c.z1)/2).toFixed(1)).join(' ')+(missing.length?'｜沒擋：'+missing.join(' '):'')+(ghost.length?'｜看不到的柱子 '+ghost.length+' 格：'+ghost.slice(0,8).join(' ')+(ghost.length>8?' …':''):''));
  // 沒有騎樓的那幾段：照模型的規則（店面加寬補滿 < 1.5 m 的縫）算出來，再用模型驗證——沒有騎樓天花板、一樓牆在立面往裡 0.2 m
  const WL=L.wenzhouLane, sh=L.shops.map(q=>({z0:q.z0,z1:q.z1})).sort((a,b)=>a.z0-b.z0);
  for(let i=0;i+1<sh.length;i++){ const gp=sh[i+1].z0-sh[i].z1; if(gp>0&&gp<1.5) sh[i].z1=sh[i+1].z0; }
  for(const q of sh){ const a=WL.z0-q.z1, bb=q.z0-WL.z1; if(a>0&&a<1.5) q.z1=WL.z0; if(bb>0&&bb<1.5) q.z0=WL.z1; }
  const tk=sh.map(q=>[q.z0,q.z1]).concat([[WL.z0,WL.z1]]).sort((a,b)=>a[0]-b[0]), NA=[]; let cur=L.road.z0;
  for(const [a,bb] of tk){ if(a>cur+0.05) NA.push([cur,a]); cur=Math.max(cur,bb); } if(L.road.z1>cur+0.05) NA.push([cur,L.road.z1]);
  const bad=[];
  for(const [a,bb] of NA){ const m0=Math.max(a+0.6,L.road.z0+1.5), m1=Math.min(bb-0.6,L.road.z1-1.5);   // 街的兩頭是導航的邊（區域的盡頭），不算
    const ceil=V.filter(v=>/arcade_ceiling/.test(v[3])&&v[2]>m0&&v[2]<m1).length, wall=V.filter(v=>v[2]>m0&&v[2]<m1&&v[1]>0.3&&v[1]<2.5&&v[0]>F.upper-0.3&&v[0]<F.upper-0.1).length;
    const deep=V.filter(v=>v[2]>m0&&v[2]<m1&&v[1]>0.3&&v[1]<2.5&&v[0]>AR.x0+0.1&&v[0]<F.upper-0.35).length;
    if(ceil||!wall||deep) bad.push(`模型 z ${a}～${bb}：騎樓天花板 ${ceil}、牆 ${wall}、騎樓深處 ${deep} 個頂點`);
    for(let zz=m0;zz<=m1;zz+=1.0){ if(freeAt(F.upper-0.6,zz)||freeAt(AR.x0+1.0,zz)) bad.push(`(${(F.upper-0.6).toFixed(1)}或${(AR.x0+1).toFixed(1)}, ${zz.toFixed(1)}) 在牆裡面卻走得到`); if(!nav.clear(F.upper+0.6,zz,0.3)) bad.push(`人行道 (${(F.upper+0.6).toFixed(1)}, ${zz.toFixed(1)}) 站不住`); } }
  const ends=sh.length?[[(AR.x0+F.upper)/2,sh[0].z0+0.6,sh[0].z0-3],[(AR.x0+F.upper)/2,sh[sh.length-1].z1-0.6,sh[sh.length-1].z1+3]]:[];
  for(const [x,za,zb] of ends) if(reach([x,za],[x,zb])) bad.push(`騎樓 (${x.toFixed(1)}, ${za.toFixed(1)}) 走得進 (${x.toFixed(1)}, ${zb.toFixed(1)}) 的公寓`);
  check('18. 沒有騎樓的公寓（'+NA.map(([a,bb])=>'z '+a+'～'+bb).join('、')+'）：模型沒有騎樓、牆裡面走不到、人行道站得住、騎樓兩端走不進公寓',NA.length>0&&!bad.length,bad.slice(0,4).join('｜')+(bad.length>4?' …（共 '+bad.length+' 項）':'')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
