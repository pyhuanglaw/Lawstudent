// 新生南路人行道花台（X246，XS-PLANTERS-1110；LAWWW2 帳號 A 11-10；使用者 11-05「新生南路側門改成我的照片的樣子」：人行道花台、紅磚、廣場）——不需要瀏覽器（D131）。
// tools/blender/env_second/xs_planters.py → bldg.xs_planters：沿校園圍牆內側一段一段的花崗石矮花台＋杜鵑。在 Node 建出新生南路區域、接上真的 GLB：
//   1 GLB：花台 ≥ 10 段（extras.planters），都在校園那一側的人行道上、靠牆（x ≥ 15、不超過牆面）、避開側門洞前後 1 m；有 SEASON_AZALEA_on／off
//   2 遊戲：接上了；每一段花台的中間導航擋住；人行道中間（x 12）照舊站得住
//   3 原本的路都還走得通：出生點 → 溫州街巷口、七間店門口、側門、候車亭；兩條斑馬線過得去；沿人行道從北走到南
//   4 季節：不是 3 月＝只有葉（SEASON_AZALEA_off 看得到、_on 藏起來）
// 修改前（開發分支 327f64bfe）：1、2 FAIL（沒有花台）。用法：node tests/xs_planters_unit.js
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
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0), T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o; if(nd.mesh!=null){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1)); return new THREE.Mesh(g,mats[pr.material]); }); o=prs.length===1?prs[0]:(()=>{ const gg=new THREE.Group(); for(const q of prs) gg.add(q); return gg; })(); } else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); }); const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
const GF=path.join(ROOT,'assets/models/env/second_ai/xs_planters.glb'), HAS=fs.existsSync(GF);
const pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.xs_planters'&&HAS){ const p=Promise.resolve({scene:glbScene(GF)}); pend.push(p); return p; } return new Promise(()=>{}); };
const z=Z3.ZONES.xinsheng.build(E); const nav=z.nav; E.zone=z;
const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)];
const freeAt=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
function reach(a,b){ const [sx,sz]=cellOf(...a), [tx,tz]=cellOf(...b); const seen=new Uint8Array(nav.cols*nav.rows), q=[[sx,sz]]; seen[nav.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=nav.cols||ny>=nav.rows) continue; const i=nav.idx(nx,ny); if(seen[i]||nav.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
(async()=>{ await Promise.all(pend); for(let i=0;i<3;i++) await new Promise(r=>setTimeout(r,0));
  const L=XINSHENG_LAYOUT, CW=L.campusWall, root=z.group.children.find(o=>o.name==='xs_planters_glb');
  let pl=null, sOn=null, sOff=null; if(HAS){ const J=JSON.parse(fs.readFileSync(GF).slice(20,20+fs.readFileSync(GF).readUInt32LE(12)).toString('utf8')); for(const n of J.nodes){ if(n.extras&&n.extras.planters) pl=n.extras.planters; } }
  if(root) root.traverse(o=>{ if(o.name==='SEASON_AZALEA_on') sOn=o; if(o.name==='SEASON_AZALEA_off') sOff=o; });
  const G0=CW.gateGap[0]-1, G1=CW.gateGap[1]+1, badPos=(pl||[]).filter(r=>r[0]<15||r[2]>CW.x-0.15||(r[3]>G0&&r[1]<G1));
  check('1 GLB：花台 ≥ 10 段、都靠校園圍牆（x ≥ 15、不超過牆面）、避開側門洞前後 1 m；有季節節點', !!pl&&pl.length>=10&&badPos.length===0&&!!sOn&&!!sOff, pl?`${pl.length} 段；位置不對 ${badPos.length}`:(HAS?'沒有 extras.planters':'沒有 xs_planters.glb'));
  const blocked=(pl||[]).filter(r=>!freeAt((r[0]+r[2])/2,(r[1]+r[3])/2)).length, mid=[]; for(let zz=L.road.z0+3;zz<L.road.z1-3;zz+=4) if(!freeAt(12,zz)) mid.push(zz);
  check('2 遊戲：花台接上、每一段中間導航擋住；人行道中間 x 12 照舊站得住', !!root&&!!pl&&blocked===pl.length&&mid.length===0, `接上 ${!!root}、擋住 ${blocked}／${pl?pl.length:0}、x 12 站不住的 z：${mid.join(',')||'無'}`);
  const sp=[z.spawn.x,z.spawn.z], bad=[];
  if(!reach(sp,[L.wenzhouLane.exit.x,L.wenzhouLane.exit.z])) bad.push('溫州街巷口');
  for(const q of L.shops) if(!reach(sp,[L.facade.x+0.9,q.door.z])) bad.push(q.id);
  const gt=E.interactables.find(q=>q.exit&&q.exit.to==='campus'); if(!gt||!reach(sp,[gt.x,gt.z])) bad.push('側門');
  if(L.busStop&&!reach(sp,[L.busStop.x-1.2,L.busStop.z])) bad.push('候車亭');
  for(const c of L.crossings) if(!reach([L.walkEast.x0+1.5,c.z],[L.walkWest.x0+1.0,c.z])) bad.push('斑馬線 '+c.id);
  if(!reach([12,L.road.z0+3],[12,L.road.z1-3])) bad.push('人行道北到南');
  check('3 原本的路都還走得通（巷口、七間店、側門、候車亭、斑馬線、人行道北到南）', bad.length===0, bad.join('、')||'全部');
  check('4 季節：不是 3 月＝只有葉（_off 看得到、_on 藏起來）', !!sOn&&!!sOff&&sOff.visible&&!sOn.visible, sOn?`off ${sOff.visible}、on ${sOn.visible}`:'沒有季節節點');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
