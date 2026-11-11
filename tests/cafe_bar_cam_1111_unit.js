// 兩點半 Café（2:30 AM，cafe）吧檯高腳椅坐下以後鏡頭整片是牆（CAFE-BAR-CAM-1111；BB 11-11 11:2x，線上 779 就有：「坐吧檯」中間那張、鏡頭在 (−1.3,3.46,0.6)，看不到自己和吧台）——不需要瀏覽器（D131）。
// 原因：高腳椅（lift 0.27）人比較高，鏡頭俯角調到 0.38 左右就在 3.4 m 以上，天花板的水泥大梁（a23_vc，底在 3.2 m 左右）離鏡頭 0.2～0.6 m，整個畫面被梁擋住；其他方向還有風管、亮面小東西、黃金葛。
// 修法（src/zones3d.js）：①天花板下面那一層（梁、風管 2.78～3.4 m）當 z.slabs，跟隨鏡頭穿進去時 slabClip 沿視線拉近、停在梁下面；
//   ②剩下擋住的（吊燈、層架…）照 SUNNY SIDE、小路（WZ-SEAT-CAMS-1104）讓材質網點透空（attachCafe230 的 CAFE230_SEETHRU）。
// 檢查（在 Node 建出遊戲真正的 cafe，正式模型 cafe230.glb 從檔案讀；鏡頭照遊戲：E.followCam → E.slabClip(看的點, 鏡頭, 1.15)，跟隨點＝人＋1.45 m（高腳椅的人站高 lift））：
//   吧檯 10～13 號 × 鏡頭 16 個方向 × 俯角 0.22（預設）／0.38（BB 那時候）／0.6／0.9：鏡頭 → 頭這一條線上（頭前 0.35 m 以內不算），
//   第一個「畫得到、不透明、不會網點透空、不是會淡出的牆（WALL_）」的網格＝鏡頭被擋。要 0；另外全店其他座位（17 張＋卡座）用預設俯角也要 0。
// 修改前（開發分支 32d35ec2d）：吧檯 FAIL（BB 那一格：12 號 0° 俯角 0.38 被 a23_vc 擋）。用法：node tests/cafe_bar_cam_1111_unit.js
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
const GLB={}; ASSETS.loadOne=k=>{ const m=ASSETS.manifest[k]; if(m&&/building/.test(m.type)&&fs.existsSync(path.join(ROOT,m.url))){ if(!GLB[k]) GLB[k]=glbScene(path.join(ROOT,m.url)); return Promise.resolve({scene:GLB[k]}); } return new Promise(()=>{}); };
(async()=>{ global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'cafe',day:1};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const zd=Z3.ZONES.cafe; const z=zd.build(E); E.zone=z; E.nav=z.nav; E.indoor=true; for(let i=0;i<60&&!z.formal;i++) await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  check('0. 正式模型（cafe230.glb）接上了',!!z.formal);
  const vis=[]; z.group.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent) if(!p.visible) return; const m=[].concat(o.material)[0]; if(!m||m.visible===false||m.colorWrite===false) return; vis.push(o); });
  const DIST=zd.camDist||3.8;
  E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0};
  const camOf=(st,yaw,pitch)=>{ const tgt=new THREE.Vector3(st.x,(st.lift||0)+1.45,st.z), cam=new THREE.Vector3(); E.followCam(tgt,yaw,pitch,DIST,0,cam); E.slabClip(tgt,cam,1.15); return {tgt,cam}; };
  const shoot=(st,yaw,pitch)=>{ const {tgt,cam}=camOf(st,yaw,pitch);
    if(z.fadeWalls){ z.fadeWalls({position:cam},tgt); for(const w of z.walls||[]) w.visible=w.material.opacity>0.5; }
    const dir=tgt.clone().sub(cam), len=dir.length(); dir.normalize(); const rc=new THREE.Raycaster(cam,dir,0.05,len-0.35);
    const hs=rc.intersectObjects(vis,false).filter(h=>{ for(let p=h.object;p;p=p.parent) if(!p.visible) return false; const m=[].concat(h.object.material)[0]; if(m.side===THREE.FrontSide&&h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).dot(dir)>0) return false;
      return !(m.userData&&m.userData.seeThrough)&&!m.transparent&&!/WALL_/.test(h.object.name||'')&&!(h.object.parent&&/WALL_/.test(h.object.parent.name||'')); });
    return hs.length?`(${st.x},${st.z}) ${Math.round(yaw*180/Math.PI)}° 俯角 ${pitch}：${[].concat(hs[0].object.material)[0].name}@${hs[0].distance.toFixed(2)} 鏡頭[${cam.toArray().map(v=>v.toFixed(2))}]`:null; };
  const bar=(E.interactables||[]).filter(i=>i.cafeSeat>=10&&i.cafeSeat<=13).map(i=>i.seat);
  let shots=0; const bad=[]; for(const st of bar) for(const pitch of [0.22,0.38,0.6,0.9]) for(let k=0;k<16;k++){ shots++; const b=shoot(st,k*Math.PI/8,pitch); if(b) bad.push(b); }
  const st12=bar.find(s=>s.x===-1.3)||{x:-1.3,z:-3.3,lift:0.27}, bb=shoot(st12,0,0.38), bbCam=camOf(st12,0,0.38).cam;
  check('1. 吧檯 10～13 號（'+bar.length+' 張）坐下以後，鏡頭 16 個方向 × 俯角 0.22／0.38／0.6／0.9 都沒有被擋',bar.length===4&&bad.length===0,shots+' 個鏡頭、擋住 '+bad.length+' 個；透空材質 '+(z.seeThru?'開':'關')+(bad.length?'；例：'+bad.slice(0,4).join('、'):''));
  check('2. BB 那一格（中間那張 (−1.3,−3.3)、鏡頭在人背後 +z、俯角 0.38；原本鏡頭 (−1.3,3.48,0.6) 在梁旁邊）：鏡頭停在梁、風管下面（2.78 m 以下）、沒有被擋',!bb&&bbCam.y<2.78,(bb||'')+' 鏡頭['+bbCam.toArray().map(v=>v.toFixed(2))+']');
  /* 站著、預設俯角：鏡頭照舊（slabClip 不動） */ { const sd=[[0,0],[-3,2],[3,-2]].map(([x,zz])=>{ const t=new THREE.Vector3(x,1.45,zz), c=new THREE.Vector3(); E.followCam(t,Math.PI*0.3,0.22,DIST,0,c); const c0=c.clone(); E.slabClip(t,c,1.15); return c.distanceTo(c0); });
    check('4. 站著（看的點 1.45 m）、預設俯角 0.22：鏡頭照舊、不被拉近',sd.every(d=>d<1e-9),sd.map(d=>d.toFixed(3)).join('、')); }
  const others=(E.interactables||[]).filter(i=>i.seat&&!(i.cafeSeat>=10&&i.cafeSeat<=13)).map(i=>i.seat).concat(z.seats||[]); const seen=new Set(), bad2=[]; let n2=0;
  for(const st of others){ const key=st.x+','+st.z; if(seen.has(key)) continue; seen.add(key); n2++; for(let k=0;k<16;k++){ const b=shoot(st,k*Math.PI/8,0.22); if(b) bad2.push(b); } }
  check('3. 全店其他座位（'+n2+' 張）用預設俯角 0.22，鏡頭 16 個方向都沒有被擋',n2>0&&bad2.length===0,bad2.length?'擋住 '+bad2.length+' 個；例：'+bad2.slice(0,4).join('、'):'');
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
