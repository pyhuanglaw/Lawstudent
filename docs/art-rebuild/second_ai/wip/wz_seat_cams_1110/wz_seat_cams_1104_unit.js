// 溫州街兩間店坐下後的鏡頭被擋（WZ-SEAT-CAMS-1104；BB-C 11-04 BB_255：SUNNY SIDE 吧台 F12／F13 被吊架擋、小路座位鏡頭卡在樑和酒瓶層架之間）——不需要瀏覽器（D131）。
// AA 12ae10d3e（11-04 13:19）加過透空材質和小路三面鏡頭牆，後來 SUNNY SIDE v1e、小路 v4 配置（dc21c5949）把它蓋掉了，而且有幾個材質名和現在的 GLB 對不上。
// 這次照 sunnyside.glb、komichi.glb 現在的材質名重加（src/data/sunnyside_layout.js、komichi_layout.js → tools/layout/sync_wz_aa_layouts.js → wz_shops_layout.js）。
// 檢查（在 Node 建出遊戲真正的 wz_brunch、wz_teishoku，正式模型從檔案讀；鏡頭照 E.followCam：室內 camDist、俯角 0.38、zone.camCols）：
//   每一個座位（店裡所有 E.seats；頭在 lift＋1.2 m）× 鏡頭 16 個方向：鏡頭 → 頭這一條線上（頭前 0.35 m 以內不算），第一個「畫得到、不透明、不會網點透空（userData.seeThrough）、
//   不是會淡出的牆（WALL_）」的網格＝鏡頭被擋。兩間各算擋住的次數，要 0。
// 修改前（開發分支 fe4d893ac）：SUNNY SIDE、小路都 FAIL。用法：node tests/wz_seat_cams_1104_unit.js
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
async function shop(ZID){ global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:ZID,day:1};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const zd=Z3.ZONES[ZID]; const z=zd.build(E); E.zone=z; E.nav=z.nav; E.indoor=true; for(let i=0;i<40;i++) await new Promise(r=>setTimeout(r,0)); z.group.updateMatrixWorld(true);
  const vis=[]; z.group.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent) if(!p.visible) return; const m=[].concat(o.material)[0]; if(!m||m.visible===false||m.colorWrite===false) return; vis.push(o); });
  const DIST=zd.camDist||3.8, PITCH=0.38, seats=z.seats||[]; let shots=0, bad=[];
  for(const st of seats){ const head=new THREE.Vector3(st.x,(st.lift||0)+1.2,st.z);
    for(let k=0;k<16;k++){ const yaw=k*Math.PI/8, cam=new THREE.Vector3(); E.followCam(head,yaw,PITCH,DIST,0,cam); shots++; const dir=head.clone().sub(cam), len=dir.length(); dir.normalize(); const rc=new THREE.Raycaster(cam,dir,0.05,len-0.35);
      const hs=rc.intersectObjects(vis,false).filter(h=>{ const m=[].concat(h.object.material)[0]; if(m.side===THREE.FrontSide&&h.face&&h.face.normal.clone().transformDirection(h.object.matrixWorld).dot(dir)>0) return false;
        return !(m.userData&&m.userData.seeThrough)&&!m.transparent&&!/WALL_/.test(h.object.name||'')&&!(h.object.parent&&/WALL_/.test(h.object.parent.name||'')); });
      if(hs.length) bad.push(`(${st.x},${st.z}) ${Math.round(yaw*180/Math.PI)}°：${[].concat(hs[0].object.material)[0].name}@${hs[0].distance.toFixed(2)}`); } }
  return {z,seats,shots,bad}; }
(async()=>{
  for(const [ZID,nm] of [['wz_brunch','SUNNY SIDE'],['wz_teishoku','小路']]){ const r=await shop(ZID);
    check(`${nm}（${ZID}）：坐下以後鏡頭 16 個方向都沒有被擋`, r.seats.length>0&&r.bad.length===0, `${r.seats.length} 個座位、${r.shots} 個鏡頭、擋住 ${r.bad.length} 個；透空材質 ${(r.z.seeThru?'開':'關')}、鏡頭牆 ${((r.z.camCols&&r.z.camCols[0])||[]).length} 面`+(r.bad.length?'；例：'+r.bad.slice(0,4).join('、'):'')); }
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
