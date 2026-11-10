// 公館往溫州街那條巷子的巷口關起來（GG-LANE-CLOSE-1110，X199 配套；LAWWW2 帳號 A 11-10；LAWWW 14:21 派）——不需要瀏覽器（D131）。
// 使用者 X199：溫州街只從新生南路進出、公館往溫州街的巷口「拿掉」。遊戲已經用導航擋住＋一排盆栽，但公館正式模型還看得到巷子往南延伸 → 巷口加一道住戶的鐵門（tools/blender/env_second/gg_lane_gate.py）。
//   1 有鐵門的正式模型（ASSETS bldg.gg_lane_gate、檔案在、zone_assets 公館有它）
//   2b 告示牌的字放得進牌子（BB 11-10 P3：一行 9 個字，近看只剩「人巷道 請勿進」→ 兩行）
//   2 GLB：鐵門擋滿巷口（x −74～−68 兩邊的牆之間，寬 ≥ 5.9 m）、在騎樓店面玻璃那條線往裡（z 22.1～22.5）、高 ≥ 2.2 m；有「私人巷道」告示牌（PLATE_FACE_）
//   3 遊戲：接上了（gg_lane_gate_glb）；導航和沒有模型時一格都不差（巷口照舊走不進去、騎樓照舊走得通）
//   4 看得出來關著：站在騎樓往巷子裡看（腰的高度往 +z），先碰到鐵門（z ≈ 22.3），看不到巷子深處
// 修改前（開發分支 99294fead）：1～4 FAIL。用法：node tests/gg_lane_close_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const KEY='bldg.gg_lane_gate', man=ASSETS.manifest[KEY], url=man&&man.url, glbF=url&&path.join(ROOT,url), HAS=!!glbF&&fs.existsSync(glbF);
const ZA=fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8'), zaGG=(ZA.match(/"gongguan":\[[^\]]*\]/)||[''])[0];
check('1 有巷口鐵門的正式模型（manifest、檔案、zone_assets 公館）', !!man&&HAS&&fs.existsSync(glbF.replace(/\.glb$/,'.json'))&&zaGG.includes(KEY), url||'manifest 沒有 '+KEY);
/* 和 tests/teach_east_drawcall_unit.js 同一個讀法（要有 uv、法線：attachWenzhouModel 會用） */
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
const sc=HAS?glbScene(glbF):null; if(sc) sc.updateMatrixWorld(true);
{ let ok=false, info='沒有模型'; if(sc){ const bb=new THREE.Box3().setFromObject(sc); const plate=sc.getObjectByName('PLATE_FACE_GG_LANE');
    ok=bb.min.x>=-74.01&&bb.max.x<=-67.99&&bb.max.x-bb.min.x>=5.9&&bb.min.z>=22.1&&bb.max.z<=22.5&&bb.max.y>=2.2&&!!plate&&/私人巷道/.test(plate.userData.text||'');
    info=`x ${bb.min.x.toFixed(2)}～${bb.max.x.toFixed(2)}、z ${bb.min.z.toFixed(2)}～${bb.max.z.toFixed(2)}、高 ${bb.max.y.toFixed(2)}；告示牌 ${plate?'「'+plate.userData.text+'」':'沒有'}`; }
  check('2 GLB：鐵門擋滿巷口兩邊的牆之間、在騎樓店面線往裡、高 ≥ 2.2 m；有「私人巷道」告示牌', ok, info); }
  { /* 字放得進牌子（BB 11-10 P3：近看只剩「人巷道 請勿進」）：照 zones3d.js 的 wzPlateTex 算（橫的牌子：畫布寬＝高×板寬／板高；一行字高＝板高 0.5，有第二行 sub 時第一行 0.34、第二行 0.26；
       中文字寬約＝字高），每一行的寬 ≤ 畫布寬的 90% */
    const pl=sc&&sc.getObjectByName('PLATE_FACE_GG_LANE'); if(sc) sc.updateMatrixWorld(true); let fit=false, info2='沒有告示牌';
    if(pl){ const bb=new THREE.Box3().setFromObject(pl), sz=bb.getSize(new THREE.Vector3()), wM=Math.max(sz.x,sz.z), hM=sz.y, W=wM/hM, d=pl.userData;
      const lines=d.sub?[[d.text,0.34],[d.sub,0.26]]:[[d.text,0.5]], need=lines.map(([s_,f])=>[...(s_||'')].length*f);
      fit=need.every(n=>n<=0.9*W); info2=`牌子 ${wM.toFixed(2)}×${hM.toFixed(2)} m（寬是高的 ${W.toFixed(2)} 倍）；每一行要 ${need.map(n=>n.toFixed(2)).join('、')} 倍高`; }
    check('2b 告示牌的字放得進牌子（每一行 ≤ 寬的 90%）', fit, info2); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.renderer={capabilities:{getMaxAnisotropy:()=>8}};
global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'gongguan',day:30};
const build=withGate=>{ const pend=[]; ASSETS.loadOne=k=>{ if(withGate&&k===KEY&&HAS){ const p=Promise.resolve({scene:glbScene(glbF)}); pend.push(p); return p; } return new Promise(()=>{}); };
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.gongguan.build(E); E.zone=z; return {z,pend}; };
(async()=>{
  const A=build(false), navA=Uint8Array.from(A.z.nav.b);
  const Bz=build(true); await Promise.all(Bz.pend); for(let i=0;i<5;i++) await new Promise(r=>setTimeout(r,0)); const z=Bz.z, nav=z.nav;
  const root=z.group.children.find(o=>o.name==='gg_lane_gate_glb'); let diff=0; for(let i=0;i<nav.b.length;i++) if(!!nav.b[i]!==!!navA[i]) diff++;
  const cellOf=(x,zz)=>[Math.floor((x-nav.ox)/nav.cell),Math.floor((zz-nav.oz)/nav.cell)], free=(x,zz)=>{ const [c,r]=cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[nav.idx(c,r)]; };
  check('3 遊戲：接上了；導航和沒有模型時一格都不差（巷口走不進去、騎樓走得通）', !!root&&diff===0&&!free(-71,20.4)&&free(-66,20.5), `模型 ${root?'有':'沒有'}；導航不同的格子 ${diff}；巷口 ${free(-71,20.4)?'站得住':'擋住'}、騎樓 ${free(-66,20.5)?'走得通':'擋住'}`);
  let hz=null; if(root){ root.updateMatrixWorld(true); const ms=[]; root.traverse(o=>{ if(o.isMesh) ms.push(o); }); const rc=new THREE.Raycaster(new THREE.Vector3(-71,0.7,20),new THREE.Vector3(0,0,1),0,40); const h=rc.intersectObjects(ms,false)[0]; hz=h?h.point.z:null; }
  check('4 看得出來關著：從騎樓往巷子裡看（腰的高度），先碰到鐵門', hz!=null&&hz>22.1&&hz<22.5, hz!=null?'碰到 z '+hz.toFixed(2):'沒碰到（看得到巷子深處）');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
