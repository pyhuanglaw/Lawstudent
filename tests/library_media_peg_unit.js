// 總圖多媒體中心：南牆的洞洞板（掛耳機、掛勾）跟著南牆淡出，不浮在半空（BB-B 11-08 01:46 PC GPU 第一批第 1 點；LAWWW2-B 修，D108）——不需要瀏覽器（D131）。
// 現象：AB3LM media 那張「鏡頭左邊那面牆上方直接看到天空，掛著牛頓擺的木板像浮在半空」（烘前烘後一樣）。
//   - 看到天空：CC 拍照工具只做 fadeWalls，沒做 hideFaded（遊戲主迴圈兩步都做：engine3d.js updateCamera），淡出的牆留著 0.12 的透明度。遊戲本身沒有這個問題。
//   - 木板浮空：模型的問題。洞洞板、耳機、掛勾做在 library_media_props／library_media_metal 裡（整間房間的小東西合成一個網格），不是 WALL_ 開頭，
//     鏡頭在南牆外面、南牆淡出的時候，它們照樣畫出來——在遊戲裡一樣會浮在半空。
// 做法：tools/blender/env_second/library_media.py 把洞洞板、耳機、掛勾放進南牆的群組（WALL_S_pegprops、WALL_S_pegmetal，dir [0,0,-1]），配置 layout.json 不變。
// 檢查（在 Node 建出遊戲真正的 library_media 區域，接上 GLB，照引擎的 fadeWalls → hideFaded）：
//   ① GLB：洞洞板那一塊（x −0.45～2.25、y 1.2～2.0、z 3.38～3.5）的頂點只在 WALL_S_* 網格裡，而且有 WALL_S_pegprops、WALL_S_pegmetal（dir [0,0,-1]）
//   ② 鏡頭在南牆外（1.0, 3.2, 7.2）看人：南牆整組藏起來，洞洞板那一塊沒有任何畫得出來的頂點（修改前：props、metal 兩個網格還在）
//   ③ 鏡頭在房間裡（CC 那一張：(2.89, 1.6, 2.05) → (0, 1.1, 3.5)）：南牆、洞洞板都在（不會因為放進牆的群組就不見）
// 用法：node tests/library_media_peg_unit.js [GLB 路徑，預設 assets/models/env/second_ai/library_media.glb]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const GLB=process.argv[2]?path.resolve(process.argv[2]):path.join(ROOT,'assets/models/env/second_ai/library_media.glb');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const _warn=console.warn; console.warn=(...a)=>{ if(/載入失敗/.test(String(a[0]))) return; _warn(...a); };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/data/library_layout.js','src/data/dorm_layout.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 讀 GLB（只要節點、位置、extras；不需要貼圖）*/
const b=fs.readFileSync(GLB), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
  const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
function glbScene(){ const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o;
    if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
const PEG={x0:-0.45,x1:2.25,y0:1.2,y1:2.0,z0:3.38,z1:3.5};
const inPeg=(x,y,z)=>x>PEG.x0&&x<PEG.x1&&y>PEG.y0&&y<PEG.y1&&z>PEG.z0&&z<PEG.z1;
/* 某個網格在洞洞板那一塊的頂點數（世界座標）*/
const pegVerts=o=>{ const p=o.geometry&&o.geometry.attributes.position; if(!p) return 0; const v=new THREE.Vector3(); let n=0; for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); if(inPeg(v.x,v.y,v.z)) n++; } return n; };
{ const SC=glbScene(); SC.updateMatrixWorld(true); const by={}; SC.traverse(o=>{ if(o.isMesh){ const n=pegVerts(o); if(n){ const k=(o.parent&&o.parent.isGroup&&o.parent!==SC&&!o.name)?o.parent.name:o.name; by[k]=(by[k]||0)+n; } } });
  const names=Object.keys(by), notWall=names.filter(k=>!/^WALL_S_/.test(k));
  const nd=k=>J.nodes.find(n=>n.name===k), dirOK=k=>{ const n=nd(k); return !!n&&!!n.extras&&JSON.stringify(n.extras.dir)==='[0,0,-1]'; };
  check('① GLB：洞洞板那一塊的頂點只在 WALL_S_* 網格裡；有 WALL_S_pegprops、WALL_S_pegmetal（dir [0,0,-1]）', names.length>0&&notWall.length===0&&dirOK('WALL_S_pegprops')&&dirOK('WALL_S_pegmetal'),
    names.map(k=>`${k} ${by[k]}`).join('、')); }
(async()=>{
  const SC=glbScene(); let pend=null;
  ASSETS.loadOne=k=>k==='bldg.library_media'?(pend=Promise.resolve({scene:SC})):new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  E.player={obj:{position:new THREE.Vector3(1.0,0,1.5),rotation:{y:Math.PI}},radius:0.32,lv:0,seat:null,pose:'idle'};
  const z=Z3.ZONES.library_media.build(E); E.zone=z; E.nav=z.nav; await pend; await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  if(!z.formal){ check('區域接上正式模型（attachRoomGLB）',false,'z.formal 不是 true'); console.log('FAILED '+fails); process.exit(1); }
  const shown=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
  const view=(eye,look)=>{ const cam=new THREE.PerspectiveCamera(); cam.position.fromArray(eye); cam.lookAt(new THREE.Vector3(...look)); cam.updateMatrixWorld();
    z.fadeWalls(cam,E.player.obj.position); E.hideFaded();   /* 遊戲主迴圈（engine3d.js updateCamera）：fadeWalls 之後 hideFaded */
    const vis={}; z.group.traverse(o=>{ if(o.isMesh&&shown(o)){ const n=pegVerts(o); if(n) vis[o.name||(o.parent&&o.parent.name)]=n; } });
    const sw=z.walls.filter(w=>/^WALL_S_/.test(w.name)); return {vis,sw}; };
  { const {vis,sw}=view([1.0,3.2,7.2],[1.0,1.0,1.5]); const left=Object.keys(vis);
    check('② 鏡頭在南牆外：南牆整組藏起來，洞洞板那一塊沒有畫得出來的頂點', sw.length>0&&sw.every(w=>!w.visible)&&left.length===0,
      `南牆 ${sw.length} 個（藏 ${sw.filter(w=>!w.visible).length}）`+(left.length?`；還畫得出來：${left.map(k=>`${k} ${vis[k]}`).join('、')}`:'')); }
  { const {vis,sw}=view([2.89,1.6,2.05],[0,1.1,3.5]); const n=Object.values(vis).reduce((a,c)=>a+c,0);
    check('③ 鏡頭在房間裡（CC 那一張）：南牆、洞洞板都在', sw.length>0&&sw.every(w=>w.visible&&w.material.opacity>0.5)&&n>0, `南牆 ${sw.length} 個都在、洞洞板頂點 ${n}`); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
