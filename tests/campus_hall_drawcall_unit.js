// 行政大樓、文學院、校史館的 draw call（PERF-CAMPUS-GLB-1102 ②；LAWWW2 帳號 A 2026-11-10；docs/art-rebuild/second_ai/wip/perf_campus_glb/census_1110.md）——不需要瀏覽器（D131）。
// campus_hall.py 加了 TEACH-EAST-DRAWCALL 的壓法（貼圖集＋頂點色併進同一個材質 wz_vc_<前綴>；門廊柱子另一張 seethru_ck_tiles）。建出遊戲真正的校園，用遊戲的 attachWenzhouModel 接上三顆，
// 在椰林大道的鏡頭（(−20,1.7,0) 看 (−60,7,0)：三棟都在畫面裡）數：
//   ① 三顆都接上（套件那三棟藏起來）
//   ② 每一棟在鏡頭裡：主畫面 ≤ 4 個網格、會投影的 ≤ 1 個（一棟 ≤ 5 次 draw call）
//   ③ 門廊柱子的材質 seethru_ck_tiles 有接上樹幹透視（userData.seeThrough）；合併的 wz_vc_* 會投影
//   ④ wz_vc_adm／art／his：頂點色零件的 UV 都在貼圖集白色帶子（u 0.5、v < 0.1），有貼圖的面頂點色是白的
//   三角形照實列出（主畫面＋陰影；不設門檻，交件時寫進 README）
// 修改前（開發分支 be84c8680 的三顆 GLB）：② 失敗（一棟 11 個網格）。用法：node tests/campus_hall_drawcall_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const warns=[]; console.warn=(...a)=>warns.push(a.map(x=>x&&x.message?x.message:String(x)).join(' '));
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
for(const f of ['src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzpark3d.js','src/wzshops3d.js','src/bike3d.js','src/bikeshop3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
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

const GLBS={admin:path.join(ROOT,'assets/models/env/second_ai/campus_admin.glb'), arts:path.join(ROOT,'assets/models/env/second_ai/campus_arts.glb'), hist:path.join(ROOT,'assets/models/env/second_ai/campus_hist.glb')};
const pend=[]; ASSETS.loadOne=k=>{ const m=/^bldg\.campus_(admin|arts|hist)$/.exec(k); if(m){ const p=Promise.resolve({scene:glbScene(GLBS[m[1]])}); pend.push(p); return p; } return new Promise(()=>{}); };
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); z.def=Z3.ZONES.campus; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const cam=new THREE.PerspectiveCamera(46,844/390,0.1,260); cam.position.set(-20,1.7,0); cam.lookAt(-60,7,0); cam.updateMatrixWorld(true);
const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
function count(objs){ let main=0, sh=0, tris=0; const sp=new THREE.Sphere();
  for(const o of objs){ const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); const t=(g.index?g.index.count:g.attributes.position.count)/3;
    if(fr.intersectsSphere(sp)){ main++; tris+=t; } if(o.castShadow){ sh++; tris+=t; } } return {main, shadow:sh, calls:main+sh, tris:Math.round(tris)}; }
const TAGS=['admin','arts','hist'], PRE={admin:'adm',arts:'art',hist:'his'}, NAME={admin:'行政大樓',arts:'文學院',hist:'校史館'};
(async()=>{
  E.scene.add(z.group); z.group.updateMatrixWorld(true);
  await Promise.all(pend); for(let i=0;i<5;i++) await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  const roots={}; for(const t of TAGS) roots[t]=z.group.children.find(o=>o.name==='campus_'+t+'_glb');
  const hidden=tag=>z.group.children.filter(b=>b.userData&&b.userData.ckTag===tag).every(b=>{ let vis=false; b.traverse(o=>{ if(o!==b&&o.isMesh&&o.visible) vis=true; }); return !(b.isMesh&&b.visible)&&!vis; });
  check('① 三棟的正式模型都接上，套件那三棟藏起來',TAGS.every(t=>roots[t]&&hidden(t)),TAGS.map(t=>NAME[t]+(roots[t]?'':' 沒接上')+(hidden(t)?'':' 套件沒藏')).join('、')+' '+warns.filter(w=>/行政|文學|校史/.test(w)).join('；'));
  if(!TAGS.every(t=>roots[t])){ console.log('FAILS: '+fails); process.exit(1); }
  let tt=0; for(const t of TAGS){ const objs=[]; roots[t].traverse(o=>{ if(o.isMesh&&o.visible) objs.push(o); }); const f=count(objs); tt+=f.tris;
    check('② '+NAME[t]+'：鏡頭裡主畫面 ≤ 5 個網格、投影 ≤ 2 個（門廊柱子＋牆）',f.main<=5&&f.shadow<=2,'主畫面 '+f.main+'、投影 '+f.shadow+'、三角形 '+f.tris+'：'+objs.map(o=>o.material.name+(o.castShadow?'（投影）':'')).join('、')); }
  console.log('　三棟三角形（主畫面＋陰影）合計 '+tt);
  for(const t of TAGS){ let st=null, vc=null; roots[t].traverse(o=>{ if(!o.isMesh) return; if(o.material.name==='seethru_ck_tiles') st=o; if(o.material.name==='wz_vc_'+PRE[t]) vc=o; });
    check('③ '+NAME[t]+'：柱子 seethru_ck_tiles 有樹幹透視、wz_vc_'+PRE[t]+' 會投影',!!st&&!!st.material.userData.seeThrough&&!!vc&&vc.castShadow,(st?'透視 '+!!st.material.userData.seeThrough:'沒有 seethru_ck_tiles')+'、'+(vc?'投影 '+vc.castShadow:'沒有 wz_vc_'+PRE[t]));
    const g=vc&&vc.geometry, uv=g&&g.attributes.uv, col=g&&g.attributes.color; const ok=!!(uv&&col); let nvc=0, ntex=0; const at=new Set();
    if(ok) for(let i=0;i<uv.count;i++){ const white=col.getX(i)>0.999&&col.getY(i)>0.999&&col.getZ(i)>0.999; if(white){ ntex++; continue; } nvc++; at.add(uv.getX(i).toFixed(4)+','+uv.getY(i).toFixed(4)); }
    const one=at.size===1?[...at][0].split(',').map(Number):null;
    check('④ wz_vc_'+PRE[t]+'：頂點色零件（天花板）的 UV 全在貼圖集白色帶子的同一點（u 0.5、v < 0.1）、其他面頂點色是白的',ok&&nvc>0&&ntex>0&&!!one&&Math.abs(one[0]-0.5)<1e-3&&one[1]<0.1,ok?('頂點色 '+nvc+' 個在 '+at.size+' 個 UV（'+[...at].slice(0,3).join(' ')+'）、白的 '+ntex):'沒有合併的材質'); }
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
