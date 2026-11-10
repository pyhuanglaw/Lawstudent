// 新生南路側門的正式門柱、鐵門、圍牆（X246，XS-GATE-FORMAL-1110；LAWWW2 帳號 A 11-10；LAWWW 13:39 派；sideGate.note：門柱寫「首都帝大」、鐵柵門開著、門柱上一盞燈）——不需要瀏覽器（D131）。
// tools/blender/env_second/xs_gate.py → bldg.xs_gate。檢查：
//   1 GLB：兩根門柱在 gateGap（z 6.8、13.2）、各有一盞燈籠（wz_lamp_lens）和 GLOW_；北邊門柱面向馬路（−x）有「首都帝大」石牌（PLATE_FACE_）；欄杆貼圖卡 xg_rail 是 MASK
//   2 GLB：圍牆蓋住近景 z −68～68、遠景北到 −178、南端轉角往東；街那一面不超過 x 18.15（人行道花台靠牆，xs_planters.py WALL_IN−0.05）；門洞（導航開的那一格 x 17.7～19.3、z 7.4～12.6）裡沒有東西
//   3 遊戲（Node 建出新生南路、接上真的 GLB）：接上了；標 xsGate 的套件（近景牆、壓頂、門柱、遠景的牆）都藏起來；欄杆 alphaTest ≥ 0.5、兩面、不投影；燈籠晚上會亮（登記 WZ_NIGHT）；石牌畫了字
//   4 導航不動：門洞站得住、門柱擋住、人行道中間（x 12）站得住；看得到的網格數不比套件多（draw call 不增加）
//   5 側門兩邊的腳踏車停車架不疊進花台（BB_255 P3；架子的外框和 xs_planters.json 的每一段花台不重疊），停車架照舊站得到旁邊
// 修改前（開發分支 48aa47a5b）：第 5 項也 FAIL（兩台都疊進花台）。
// 修改前（開發分支 48aa47a5b）：1、2、3 FAIL（沒有模型）；4 是不能壞掉的項目，修改前後都要 PASS。用法：node tests/xs_gate_formal_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); console.warn=()=>{}; global.fetch=()=>Promise.reject(new Error('no fetch'));
const L=XINSHENG_LAYOUT, CW=L.campusWall, GF=path.join(ROOT,'assets/models/env/second_ai/xs_gate.glb'), HAS=fs.existsSync(GF);
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
  const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
const objs=J.nodes.map(nd=>{ let o;
  if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.attributes.TEXCOORD_0!=null) g.setAttribute('uv',new THREE.BufferAttribute(acc(pr.attributes.TEXCOORD_0),2)); if(pr.attributes.NORMAL!=null) g.setAttribute('normal',new THREE.BufferAttribute(acc(pr.attributes.NORMAL),3)); if(pr.attributes.COLOR_0!=null) g.setAttribute('color',new THREE.BufferAttribute(acc(pr.attributes.COLOR_0),J.accessors[pr.attributes.COLOR_0].type==='VEC3'?3:4)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
      return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
    if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
  else o=new THREE.Object3D();
  o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
/* 1、2 GLB */
let J=null; if(HAS){ const b=fs.readFileSync(GF); J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString('utf8')); }
const sc=HAS?glbScene(GF):null; if(sc) sc.updateMatrixWorld(true);
const meshes=[]; if(sc) sc.traverse(o=>{ if(o.isMesh) meshes.push(o); });
const byMat=n=>meshes.filter(o=>o.material&&o.material.name===n), V=new THREE.Vector3();
const verts=(ms,f)=>{ for(const o of ms){ const p=o.geometry.attributes.position; for(let i=0;i<p.count;i++){ V.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); f(V); } } };
{ const lamps=byMat('wz_lamp_lens'); let nearPost=[0,0]; verts(lamps,v=>{ CW.gateGap.forEach((z,k)=>{ if(Math.abs(v.z-z)<0.3&&Math.abs(v.x-CW.x)<0.3&&v.y>3) nearPost[k]++; }); });
  const glows=[]; if(sc) sc.traverse(o=>{ if(/^GLOW_/.test(o.name)&&o.userData&&o.userData.glow) glows.push(o); });
  const plate=sc&&sc.getObjectByName('PLATE_FACE_XSGATE'); let pOK=false, pInfo='沒有';
  if(plate){ const bb=new THREE.Box3().setFromObject(plate), c=bb.getCenter(new THREE.Vector3()); pOK=plate.userData.text==='首都帝大'&&c.x<CW.x-0.4&&Math.abs(c.z-CW.gateGap[0])<0.3&&bb.max.y-bb.min.y>bb.max.z-bb.min.z; pInfo=`「${plate.userData.text}」中心 (${c.x.toFixed(2)}, ${c.y.toFixed(2)}, ${c.z.toFixed(2)})`; }
  const rm=J&&(J.materials||[]).find(m=>/^xg_rail/.test(m.name||''));
  check('1 兩根門柱各一盞燈籠＋光暈；北邊門柱面向馬路有「首都帝大」直式石牌；欄杆卡是 MASK', nearPost[0]>0&&nearPost[1]>0&&glows.length===2&&pOK&&!!rm&&rm.alphaMode==='MASK', `燈籠頂點 ${JSON.stringify(nearPost)}、光暈 ${glows.length}；石牌 ${pInfo}；欄杆 ${rm?rm.alphaMode:'沒有'}`); }
{ const wallMs=meshes.filter(o=>/^xg_(brick|stone|base)$/.test(o.material.name)); let zmin=1e9, zmax=-1e9, xmin=1e9, xE=-1e9, inGate=0;
  verts(wallMs,v=>{ const inPost=CW.gateGap.some(z=>Math.abs(v.z-z)<0.65); if(Math.abs(v.x-CW.x)<0.5){ zmin=Math.min(zmin,v.z); zmax=Math.max(zmax,v.z); if(!inPost&&v.y<2.3) xmin=Math.min(xmin,v.x); } if(v.z>70) xE=Math.max(xE,v.x); });
  verts(meshes,v=>{ if(v.x>17.7&&v.x<19.3&&v.z>7.4&&v.z<12.6&&v.y<2.5) inGate++; });
  check('2 圍牆：近景＋遠景（北到 −178、南端轉角往東 ≥ 140）；街那一面 ≥ 18.15（花台靠牆）；門洞裡沒有東西', zmin<=-177&&zmax>=72&&xE>=140&&xmin>=18.15-1e-3&&inGate===0, `z ${zmin.toFixed(1)}～${zmax.toFixed(1)}、往東到 x ${xE.toFixed(1)}；街那一面最西 x ${xmin.toFixed(3)}；門洞裡的頂點 ${inGate}`); }
/* 3、4 遊戲 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.renderer={capabilities:{getMaxAnisotropy:()=>8}};
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'xinsheng',day:30}};
const pend=[]; ASSETS.loadOne=k=>{ if(k==='bldg.xs_gate'&&HAS){ const p=Promise.resolve({scene:glbScene(GF)}); pend.push(p); return p; } return new Promise(()=>{}); };
const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
const z=Z3.ZONES.xinsheng.build(E); E.zone=z; const nav=z.nav;
const countVis=()=>{ let n=0; z.group.traverse(o=>{ if(o.isMesh&&vis(o)) n++; }); return n; };
const before=countVis(); const kit=[]; z.group.children.forEach(o=>{ if(o.userData&&o.userData.xsGate) kit.push(o); });
(async()=>{ await Promise.all(pend); for(let i=0;i<5;i++) await new Promise(r=>setTimeout(r,0));
  const root=z.group.children.find(o=>o.name==='xs_gate_glb'); const after=countVis();
  const kitHidden=kit.length>0&&kit.every(o=>{ let h=true; o.traverse(q=>{ if(q.isMesh&&vis(q)) h=false; }); return h; });
  let rail=null, lamp=null, plate=null; if(root) root.traverse(o=>{ if(!o.isMesh) return; const n=o.material&&o.material.name; if(/^xg_rail/.test(n)) rail=o; if(n==='wz_lamp_lens') lamp=o; if(o.name==='PLATE_FACE_XSGATE'||/plates_atlas/.test((o.name||'')+'|'+(n||''))) plate=o; });   /* attachWenzhouModel 畫完字會把 PLATE_FACE_ 合成 wz_plates_atlas */
  const railOK=!!rail&&rail.material.alphaTest>=0.5&&rail.material.side===THREE.DoubleSide&&!rail.castShadow;
  const lampOK=!!lamp&&!!lamp.material.emissive&&lamp.material.emissive.getHex()>0, plateOK=!!plate;   /* 走 attachWenzhouModel 的 PLATE_FACE_ 畫字（cafeFacePaint：換成畫了字的材質、白底色、不發光）；Node 的 canvas 是假的，貼圖本身沒有內容 */
  check('3 遊戲：接上了、標 xsGate 的套件都藏起來（近景牆、壓頂、門柱、遠景的牆）；欄杆裁切、兩面、不投影；燈籠晚上會亮；石牌畫了字', !!root&&kitHidden&&kit.length>=7&&railOK&&lampOK&&plateOK,
    `模型 ${root?'有':'沒有'}；套件 ${kit.length} 件、${kitHidden?'都藏了':'還看得到'}；欄杆 ${rail?`alphaTest ${rail.material.alphaTest}、兩面 ${rail.material.side===THREE.DoubleSide}、投影 ${rail.castShadow}`:'沒有'}；燈籠 ${lampOK?'有登記':'沒有'}；石牌 ${plateOK?'有字':'沒有'}`);
  const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)], free=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
  const navOK=free(CW.x,10)&&free(17.2,10)&&!free(CW.x,CW.gateGap[0])&&!free(CW.x,CW.gateGap[1])&&free(12,0)&&!free(CW.x,-30);
  check('4 導航不動（門洞、門口站得住；門柱、圍牆擋住；人行道中間站得住）；看得到的網格不比套件多（draw call 不增加）', navOK&&after<=before, `導航 ${navOK?'對':'不對'}；看得到的網格 套件 ${before} → 接上 ${after}`);
  { const PL=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/xs_planters.json'),'utf8')).planters||[]; const over=[];
    z.group.children.filter(o=>o.name==='xs_bike_rack').forEach(o=>{ const b=new THREE.Box3().setFromObject(o); for(const [x0,z0,x1,z1] of PL) if(b.max.x>x0&&b.min.x<x1&&b.max.z>z0&&b.min.z<z1) over.push(`架子 (${o.position.x}, ${o.position.z}) x ${b.min.x.toFixed(2)}～${b.max.x.toFixed(2)} 疊到花台 ${JSON.stringify([x0,z0,x1,z1])}`); });
    const racks=z.group.children.filter(o=>o.name==='xs_bike_rack').length;
    check('5 側門兩邊的腳踏車停車架不疊進花台', PL.length>0&&racks>=2&&over.length===0, over.length?over.join('；'):`停車架 ${racks} 個、花台 ${PL.length} 段，沒有重疊`); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
