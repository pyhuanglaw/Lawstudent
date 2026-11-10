// 社團博覽會的帳篷擋跟隨鏡頭（FAIR-TENT-CAM-1102；BB_218 最後兩節：在攤位之間走、站在攤位後面，人被帳篷頂蓋住）——不需要瀏覽器（D131）。
// 正式模型 club_fair.glb（大一 9 攤）、club_fair_expo.glb（大二 36 頂＋舞台）每一攤／整片是一個合併網格、一個材質，帳篷頂和桌子分不開：
// 修法（zones3d.js fairSeeThru）＝整個接樹幹透視（userData.seeThrough＋E3.patchSeeThrough：擋在鏡頭和玩家之間的部分在玩家周圍網點透空，其他時候照常畫）。
// 檢查（在 Node 建出遊戲真正的校園：社博那一天，正式模型從檔案讀；鏡頭照 E.followCam）：
//   1 兩天（大一 2025-11-15、大二 2026-09-12）：社博的正式模型接上了，每一個網格的材質都有 seeThrough
//   2 帳篷附近每 1 m 一點（人站得住）、鏡頭 8 個方向：頭 → 鏡頭這一條線穿過帳篷模型的次數（證明這個情況常常發生）；其中被「不會透空」的帳篷擋住的次數＝0
// 修改前（開發分支 9d4c54c16）：1、2 FAIL。用法：node tests/fair_tent_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,"..");
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); console.warn=()=>{};
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial({side:m.doubleSided?THREE.DoubleSide:THREE.FrontSide}); t.name=m.name||''; t.transparent=m.alphaMode==='BLEND'; return t; });
  const objs=J.nodes.map(nd=>{ let o; if(nd.mesh!=null){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1)); return new THREE.Mesh(g,mats[pr.material]); }); if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } } else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); }); const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
const WANT=['bldg.club_fair','bldg.club_fair_expo']; const GLB={}; ASSETS.loadOne=k=>{ if(WANT.includes(k)){ if(!GLB[k]) GLB[k]=glbScene(path.join(ROOT,ASSETS.manifest[k].url)); return Promise.resolve({scene:GLB[k]}); } return new Promise(()=>{}); };
const dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
(async()=>{
  for(const [key,nm] of [['2025-11-15','大一（club_fair，9 攤）'],['2026-09-12','大二（club_fair_expo，36 頂＋舞台）']]){
    global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'campus',day:dayOf(key),stage:'law'};
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.campus.build(E); E.zone=z; E.nav=z.nav; E.levels=z.levels||null; for(let i=0;i<40;i++) await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
    E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
    const fair=[]; z.group.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent){ if(p===GLB['bldg.club_fair']||p===GLB['bldg.club_fair_expo']||/^booth_|^club_fair/.test(p.name||'')){ fair.push(o); break; } } });
    const vis=fair.filter(o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; });
    const st=vis.filter(o=>[].concat(o.material).every(m=>m&&m.userData&&m.userData.seeThrough));
    check(`1 ${nm}：社博正式模型接上了、每一個網格都會透空`, vis.length>0&&st.length===vis.length, `網格 ${vis.length}、會透空 ${st.length}`);
    const bb=new THREE.Box3(); for(const o of vis) bb.expandByObject(o);
    let cross=0, bad=0, ex=null; const DIST=Z3.ZONES.campus.camDist||6.0;
    if(!bb.isEmpty()) for(let x=Math.ceil(bb.min.x);x<=bb.max.x;x+=1) for(let zz=Math.ceil(bb.min.z)-2;zz<=bb.max.z+2;zz+=1){ if(!z.nav.clear(x,zz,0.33)) continue; const head=new THREE.Vector3(x,1.55,zz);
      for(let k=0;k<8;k++){ const cam=new THREE.Vector3(); E.followCam(head,k*Math.PI/4,0.22,DIST,0,cam); const dir=cam.clone().sub(head), len=dir.length(); dir.normalize(); const h=new THREE.Raycaster(head,dir,0.35,len).intersectObjects(vis,false)[0]; if(!h) continue; cross++;
        if(!([].concat(h.object.material).every(m=>m&&m.userData&&m.userData.seeThrough))){ bad++; if(!ex) ex={head:[x,zz],yaw:k*45}; } } }
    check(`2 ${nm}：帳篷附近的鏡頭被帳篷擋住時，帳篷都會透空`, cross>0&&bad===0, `頭 → 鏡頭穿過帳篷 ${cross} 次、擋住又不會透空 ${bad} 次`+(ex?'，例 '+JSON.stringify(ex):'')); }
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
