// 普通、博雅教學館的 draw call（TEACH-EAST-DRAWCALL，BB-C P3；LAWWW2-C 2026-11-04）——不需要瀏覽器。
// campus_glb_integration.py 的 teach_east 鏡頭（(−15,1.7,−69) 看 (−38,8,−70)）draw call 218 → 243（×1.115 > 1.1）。這裡建出遊戲真正的校園（zones3d.js），
// 用遊戲自己的 attachWenzhouModel 接上兩顆正式模型（投影照遊戲的 wzCastsShadow；匾額照遊戲合成 wz_plates_atlas），在 teach_east 鏡頭裡數：
//   ① 兩顆都接上（套件那兩棟藏起來）
//   ② 每一棟在鏡頭裡畫幾次：主畫面 ≤ 4 個網格、會投影的 ≤ 1 個（陰影那一輪），一棟合計 ≤ 5 次
//   ③ 三角形：兩棟（主畫面＋陰影）≤ 48,000。CC PARK_glb_r3（兩棟是 TEACH-PTBOYA v2／v2b，這裡量 27,848）teach_east 三角形 370,861 → 342,166，餘裕 28,695；
//      最緊的鏡頭 bell_avenue 餘裕 24,585。48,000＝27,848＋20,000：比那時候多 20,000 以內，每個鏡頭都還有 4,500 以上的餘裕
//   ④ 合併的材質（wz_vc_pt／wz_vc_by）：頂點色零件的 UV 全部是同一點（貼圖集最上面白色帶子的中間：u 0.5、v < 0.1）；其他（有貼圖的面）頂點色是白的、UV 在帶子下面
// 修改前（開發分支 effb5d9b3 的兩顆 GLB）：② 失敗（普通 6＋3、博雅 8＋5）。修改後：普通、博雅都是 4＋1。
// 陰影那一輪假設兩棟都在陰影的範圍裡（遊戲白天 shadowMap.autoUpdate；影子的範圍跟著玩家，量測時不一定包到）。
// 用法：node tests/teach_east_drawcall_unit.js
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

const GLBS={putong:path.join(ROOT,'assets/models/env/second_ai/campus_putong.glb'), boya:path.join(ROOT,'assets/models/env/second_ai/campus_boya.glb')};
const pend=[]; ASSETS.loadOne=k=>{ const m=/^bldg\.campus_(putong|boya)$/.exec(k); if(m){ const p=Promise.resolve({scene:glbScene(GLBS[m[1]])}); pend.push(p); return p; } return new Promise(()=>{}); };
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
const z=Z3.ZONES.campus.build(E); z.def=Z3.ZONES.campus; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const cam=new THREE.PerspectiveCamera(46,844/390,0.1,260); cam.position.set(-15,1.7,-69); cam.lookAt(-38,8,-70); cam.updateMatrixWorld(true);
const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));
function count(objs){ let main=0, sh=0, tris=0; const sp=new THREE.Sphere();
  for(const o of objs){ const g=o.geometry; if(!g.boundingSphere) g.computeBoundingSphere(); sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); const t=(g.index?g.index.count:g.attributes.position.count)/3;
    if(fr.intersectsSphere(sp)){ main++; tris+=t; } if(o.castShadow){ sh++; tris+=t; } } return {main, shadow:sh, calls:main+sh, tris:Math.round(tris)}; }
(async()=>{
  E.scene.add(z.group); z.group.updateMatrixWorld(true);
  const kit={}; for(const tag of ['putong','boya']){ const objs=[]; for(const b of z.group.children) if(b.userData&&b.userData.ckTag===tag) b.traverse(o=>{ if(o.isMesh) objs.push(o); }); kit[tag]=count(objs); }
  await Promise.all(pend); await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  const roots={putong:z.group.children.find(o=>o.name==='campus_putong_glb'), boya:z.group.children.find(o=>o.name==='campus_boya_glb')};
  const hidden=tag=>z.group.children.filter(b=>b.userData&&b.userData.ckTag===tag).every(b=>{ let vis=false; b.traverse(o=>{ if(o!==b&&o.isMesh&&o.visible) vis=true; }); return !(b.isMesh&&b.visible)&&!vis; });
  check('① 普通、博雅的正式模型都接上，套件那兩棟藏起來',!!roots.putong&&!!roots.boya&&hidden('putong')&&hidden('boya'),(roots.putong?'':'普通沒接上 ')+(roots.boya?'':'博雅沒接上 ')+warns.filter(w=>/普通|博雅/.test(w)).join('；'));
  if(!roots.putong||!roots.boya){ console.log('FAILS: '+(fails)); process.exit(1); }
  const f={}, mats={}; for(const tag of ['putong','boya']){ const objs=[]; roots[tag].traverse(o=>{ if(o.isMesh&&o.visible) objs.push(o); }); f[tag]=count(objs); mats[tag]=objs.map(o=>o.material.name+(o.castShadow?'（投影）':'')).join('、'); }
  for(const tag of ['putong','boya']) check('② '+(tag==='putong'?'普通':'博雅')+'：teach_east 鏡頭裡主畫面 ≤ 4 個網格、投影 ≤ 1 個（一棟 ≤ 5 次 draw call）',f[tag].main<=4&&f[tag].shadow<=1,
    '主畫面 '+f[tag].main+'、投影 '+f[tag].shadow+'（套件 '+kit[tag].main+'＋'+kit[tag].shadow+'）：'+mats[tag]);
  const dt=f.putong.tris+f.boya.tris-kit.putong.tris-kit.boya.tris;
  const tt=f.putong.tris+f.boya.tris;
  check('③ 三角形（主畫面＋陰影）：兩棟 ≤ 48,000（TEACH-PTBOYA v2／v2b 是 27,848；鏡頭的餘裕 28,695）',tt<=48000,'普通 '+f.putong.tris+'、博雅 '+f.boya.tris+'＝'+tt+'；套件 '+(kit.putong.tris+kit.boya.tris)+'（比套件多 '+dt+'）');
  for(const tag of ['putong','boya']){ const nm='wz_vc_'+(tag==='putong'?'pt':'by'); let o=null; roots[tag].traverse(m=>{ if(m.isMesh&&m.material.name===nm) o=m; });
    const g=o&&o.geometry, uv=g&&g.attributes.uv, col=g&&g.attributes.color; const ok=!!(uv&&col); let strip=0, tex=0, bad=0, su=null, sv=null;
    if(ok){ const cnt=new Map(); for(let i=0;i<uv.count;i++){ const k=uv.getX(i).toFixed(4)+','+uv.getY(i).toFixed(4); cnt.set(k,(cnt.get(k)||0)+1); }
      const top=[...cnt.entries()].sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number); su=top[0]; sv=top[1];
      for(let i=0;i<uv.count;i++){ const atS=Math.abs(uv.getX(i)-su)<1e-4&&Math.abs(uv.getY(i)-sv)<1e-4; if(atS){ strip++; continue; } tex++; const white=col.getX(i)>0.999&&col.getY(i)>0.999&&col.getZ(i)>0.999; if(!white||uv.getY(i)<2*sv-1e-4) bad++; } }
    check('④ '+nm+'：頂點色零件的 UV 都在最上面的白色帶子（u 0.5、v < 0.1）；有貼圖的面頂點色是白的、UV 在帶子下面',ok&&strip>0&&tex>0&&bad===0&&Math.abs(su-0.5)<1e-3&&sv<0.1,
      ok?('帶子 ('+su+', '+sv+') '+strip+' 個頂點、有貼圖的 '+tex+' 個（不對的 '+bad+'）'):'沒有合併的材質（'+(o?'沒有頂點色或 UV':'找不到 '+nm)+'；還是舊的 GLB？）'); }
  console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
