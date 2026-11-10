// 美國教室 Room 120 的期末考道具（US-EXAM-PROPS-1110，LAWWW 11-10 15:45；LAWWW2 帳號 A）：不需要瀏覽器。
// 12/6 Introduction 期末考（開書考；AA_531：「你帶去的書，有一半的頁數貼了便利貼」）。在 Node 照 index.html 的順序載入程式，建出 us_classroom、接上真的正式模型（GLB 的貼圖拿掉）：
//   1. GLB 有 EXAM_PROPS 群組（底下有網格）
//   2. 開關：平常藏著；z.setExam(true) 看得到、false 藏起來；模型載入以前先叫 setExam(true)，載入後照這個開關
//   3. 位置：Introduction 有人坐的 30 個位子（seatPlan.intro：玩家、韓國同學、其他 28 人）每個前面的桌上都有東西（答案本、筆、書）；
//      沒人坐的位子（例：最後一排）前面沒有；玩家那一份比別人多（書側面貼滿便利貼）；講桌上有一疊空白答案本
// 這是資料的檢查，不是畫面；畫面請 CC 拍（D131）。用法：node tests/us_exam_props_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_classroom_layout.js','src/us_classroom3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
function parseGLB(file){ const b=fs.readFileSync(file); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const binLen=b.readUInt32LE(20+n); const bin=b.slice(20+n+8,20+n+8+binLen);
  for(const m of J.materials||[]){ const p=m.pbrMetallicRoughness||{}; for(const k of ['baseColorTexture','metallicRoughnessTexture']) delete p[k]; for(const k of ['normalTexture','occlusionTexture','emissiveTexture']) delete m[k]; if(m.extensions) for(const e in m.extensions) for(const k in m.extensions[e]) if(/Texture$/.test(k)) delete m.extensions[e][k]; }
  delete J.textures; delete J.images; delete J.samplers; delete J.extensionsRequired; if(J.extensionsUsed) J.extensionsUsed=J.extensionsUsed.filter(e=>!/texture|KTX|webp/i.test(e));
  const js=Buffer.from(JSON.stringify(J)); const jb=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]); const bb=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
  const h=Buffer.alloc(12); h.write('glTF',0); h.writeUInt32LE(2,4); h.writeUInt32LE(12+8+jb.length+8+bb.length,8); const c1=Buffer.alloc(8); c1.writeUInt32LE(jb.length,0); c1.write('JSON',4); const c2=Buffer.alloc(8); c2.writeUInt32LE(bb.length,0); c2.writeUInt32LE(0x004E4942,4);
  const out=Buffer.concat([h,c1,jb,c2,bb]); return new Promise((res,rej)=>new THREE_JSM.GLTFLoader.GLTFLoader().parse(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'',g=>res(g),rej)); }
const M=ASSETS.manifest['bldg.us_classroom']; const GLBF=path.join(ROOT,M.url); let gltf=null;
ASSETS.loadOne=k=>k==='bldg.us_classroom'?parseGLB(GLBF).then(g=>{ gltf=g; return {scene:g.scene}; }):new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function build(){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.us_classroom.build(E); E.zone=z; E.nav=z.nav; return z; }
const wait=async z=>{ for(let i=0;i<300&&!z.formal;i++) await new Promise(r=>setTimeout(r,20)); };
(async()=>{
  { const b=fs.readFileSync(GLBF); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const g=J.nodes.find(x=>x.name==='EXAM_PROPS');
    check('1. GLB 有 EXAM_PROPS 群組、底下有網格',!!g&&(g.children||[]).some(i=>J.nodes[i].mesh!=null)); }
  const z=build(); check('2. 區域有 z.setExam',typeof z.setExam==='function'); if(typeof z.setExam!=='function'){ console.log(`FAILED: ${fails}`); process.exit(1); }
  await wait(z); check('2. 正式模型接上',!!z.formal);
  const node=()=>{ let n=null; z.group.traverse(o=>{ if(o.name==='EXAM_PROPS') n=o; }); return n; }; const ex=node();
  check('2. 平常藏著',!!ex&&ex.visible===false); z.setExam(true); check('2. z.setExam(true) 看得到',ex.visible===true); z.setExam(false); check('2. z.setExam(false) 藏起來',ex.visible===false);
  const z2=build(); z2.setExam(true); await wait(z2); let ex2=null; z2.group.traverse(o=>{ if(o.name==='EXAM_PROPS') ex2=o; }); check('2. 模型載入以前先 setExam(true)，載入後看得到',!!ex2&&ex2.visible===true);
  // 3. 位置
  E.zone=z; z.group.updateMatrixWorld(true); const P=[]; ex.traverse(o=>{ if(!o.isMesh) return; const a=o.geometry.attributes.position, v=new THREE.Vector3(); for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld); P.push([v.x,v.y,v.z]); } });
  const C=US_CLASSROOM_LAYOUT, S=z.seats, SPI=C.seatPlan.intro, at=rc=>S.find(s=>s.row===rc[0]&&s.col===rc[1]);
  const occ=[SPI.player,SPI.korean].concat(SPI.others).map(at); const top=s=>s.y+C.desk.top, dz0=s=>s.z-C.seat.dz;   // 桌面高度、那一排的前緣（seat.z − seat.dz）
  const near=(s,x0,x1)=>P.filter(p=>p[0]>=s.x+x0&&p[0]<=s.x+x1&&p[1]>=top(s)-0.005&&p[1]<=top(s)+0.06&&p[2]>=dz0(s)&&p[2]<=dz0(s)+0.55).length;
  const miss=occ.filter(s=>near(s,-0.4,0.1)<20).map(s=>`第${s.row+1}排第${s.col+1}個`);
  check(`3. Introduction 有人坐的 ${occ.length} 個位子前面的桌上都有答案本、筆、書`,occ.length===30&&!miss.length,miss.slice(0,4).join(' '));
  const empty=S.filter(s=>!occ.includes(s)); const extra=empty.filter(s=>near(s,-0.1,0.1)>0).map(s=>`第${s.row+1}排第${s.col+1}個`);
  check(`3. 沒人坐的 ${empty.length} 個位子前面沒有（最後一排整排空著）`,!extra.length&&S.filter(s=>s.row===5).every(s=>!occ.includes(s)),extra.slice(0,4).join(' '));
  const ps=at(SPI.player), cnt=s=>near(s,0.04,0.6); const others=occ.filter(s=>s!==ps).map(cnt);
  check('3. 玩家那本書比別人多東西（側面貼滿便利貼）',cnt(ps)>Math.max(...others),`玩家 ${cnt(ps)}、別人最多 ${Math.max(...others)}`);
  const Lc=C.lectern, onL=P.filter(p=>Math.abs(p[0]-Lc.x)<Lc.w/2&&Math.abs(p[2]-Lc.z)<Lc.d/2&&p[1]>=Lc.h-0.005&&p[1]<=Lc.h+0.06).length;
  check('3. 講桌上有一疊空白答案本、題目卷',onL>40,`${onL} 個頂點`);
  console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
