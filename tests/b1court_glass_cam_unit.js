// 總圖 B1 下沉中庭：鏡頭在背後時畫面下半一片白霧（X307，BB 11-10 PC 跑 10df264ed 判 GAME_BUG：「從 B1 門口往樓梯走、鏡頭在背後，畫面下半整片白霧，白天晚上都有」）——不需要瀏覽器（D131）。
// 原因：站在 B1 門口（南牆前約 0.9 m），鏡頭在玩家南側。engine3d.js 的 followCam 碰到南牆的碰撞盒會拉近，但最近 0.7 m，
// 所以鏡頭會跑到 B1 的玻璃帷幕（lib_b1_court.glb 的 lbc_glass，z −30.94，朝中庭 −z）後面。
// 舊模型的玻璃是雙面的（doubleSided），從背後看就是一整片半透明的面蓋住畫面下半（玻璃上緣 Y+2.92 以上是清楚的）。
// 檢查（在 Node 建出遊戲真正的校園：E.colliders、followCam；玻璃直接讀 GLB）：
//   1 B1 門口一帶（中庭南半部、每 0.5 m 一點）鏡頭朝南的幾個方向：會有鏡頭跑到玻璃後面的情況（證明這個測試量得到這個情況）
//   2 那些鏡頭位置看得到玻璃的「畫的那一面」的次數＝0：玻璃只畫朝中庭那一面（背面不畫），從背後看出去就是中庭
//   3 從中庭（玻璃前面）看玻璃照常畫得到（玻璃沒有消失）
//   4 第三輪（BB 11-10 09:46 退回：站在中庭 (98,−37)、鏡頭朝南，畫面下半整片白霧、平均亮度和修之前一樣）：中庭裡每 0.5 m 一點、鏡頭朝南五個方向，
//     用遊戲的鏡頭（followCam、視角 50°）往畫面下半打 15 條視線，第一個畫得到的面是半透明、又離鏡頭 2 m 以內＝蓋住畫面的霧（雨遮在 Y+2.75，鏡頭常在它上方 0.3 m）——次數＝0
//   5 從中庭地上（眼睛 Y+1.6）往上看雨遮照常畫得到
// 修改前：第二輪（1c767edf8 的 GLB）2、4 FAIL；第二輪以後（57d555786 的 GLB）4 FAIL。用法：node tests/b1court_glass_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
/* 玻璃：直接讀 GLB（材質 lbc_glass 的三角形、doubleSided）*/
function glassOf(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC3:3}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array}[a.componentType];
    return Array.from(new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT))); };
  const mi=J.materials.findIndex(m=>m.name==='lbc_glass'); const ds=!!J.materials[mi].doubleSided, tris=[];
  J.nodes.forEach(nd=>{ if(nd.mesh==null) return; const t=nd.translation||[0,0,0]; for(const pr of J.meshes[nd.mesh].primitives){ if(pr.material!==mi) continue; const P=acc(pr.attributes.POSITION), I=pr.indices!=null?acc(pr.indices):P.map((_,k)=>k).slice(0,P.length/3);
    for(let k=0;k<I.length;k+=3){ const v=[0,1,2].map(j=>new THREE.Vector3(P[I[k+j]*3]+t[0],P[I[k+j]*3+1]+t[1],P[I[k+j]*3+2]+t[2])); tris.push(v); } } });
  return {ds,tris}; }
const G=glassOf(path.join(ROOT,'assets/models/env/second_ai/lib_b1_court.glb'));
check('0 GLB 讀得到玻璃（lbc_glass）', G.tris.length>0, `${G.tris.length} 個三角形、doubleSided ${G.ds}`);
/* 從 eye 看玻璃：視線（頭 → 往前）穿過哪一個三角形；回傳畫不畫（雙面＝畫；單面＝那一面朝著 eye 才畫）*/
const tri=new THREE.Triangle(), nrm=new THREE.Vector3(), ray=new THREE.Ray(), hitP=new THREE.Vector3();
function seen(eye,look){ ray.set(eye,look.clone().sub(eye).normalize()); for(const v of G.tris){ if(!ray.intersectTriangle(v[0],v[1],v[2],false,hitP)) continue; tri.set(v[0],v[1],v[2]); tri.getNormal(nrm); const front=nrm.dot(eye.clone().sub(hitP))>0; return {hit:true,drawn:G.ds||front}; } return {hit:false,drawn:false}; }
/* 遊戲真正的校園：碰撞盒（南牆、玻璃門）照 zones3d.js 的 B1C */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster(); ASSETS.loadOne=()=>new Promise(()=>{});
global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'campus',day:1};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.campus.build(E); E.zone=z; E.nav=z.nav; E.levels=z.levels||null; z.group.updateMatrixWorld(true);
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const C=Z3.B1C, Y=-C.dep, DIST=Z3.ZONES.campus.camDist||6.0, PITCH=0.22;
let behind=0, bad=0, ex=null, front=0, frontSeen=0;
for(let x=C.x0+0.6;x<=C.x1-0.6;x+=0.5) for(let zz=C.z1-2.5;zz<=C.z1-0.5;zz+=0.5){ if(!z.nav.walkable||true){ const tgt=new THREE.Vector3(x,Y+1.55,zz);
    for(const yaw of [-0.9,-0.45,0,0.45,0.9]){ const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,DIST,0,cam);
      /* 鏡頭往頭的方向看（跟隨鏡頭看著頭）：往下 30° 的那條線（畫面下半）*/
      const look=tgt.clone().add(new THREE.Vector3(0,-0.8,0)), s=seen(cam,look);
      if(cam.z>C.z1+0.06-1e-3&&s.hit){ behind++; if(s.drawn){ bad++; if(!ex) ex={head:[x,zz],yaw,cam:cam.toArray().map(v=>+v.toFixed(2))}; } } } } }
check('1 B1 門口一帶、鏡頭朝南：量得到鏡頭跑到玻璃後面的情況（followCam 最近 0.7 m）', behind>0, `${behind} 次`);
check('2 鏡頭在玻璃後面時看不到玻璃（背面不畫）', behind>0&&bad===0, bad?`${bad} 次看得到、例：${JSON.stringify(ex)}`:'');
for(const x of [94,97,100,103]){ const eye=new THREE.Vector3(x,Y+1.6,C.z1-3), s=seen(eye,new THREE.Vector3(x,Y+1.4,C.z1+1)); front++; if(s.hit&&s.drawn) frontSeen++; }
check('3 從中庭看玻璃照常畫得到', frontSeen===front, `${frontSeen}/${front}`);
/* ---- 4、5：整顆 GLB 放進校園，照遊戲鏡頭打視線（材質照 GLB 的 doubleSided、alphaMode）---- */
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial({side:m.doubleSided?THREE.DoubleSide:THREE.FrontSide}); t.name=m.name||''; t.transparent=m.alphaMode==='BLEND'; return t; });
  const objs=J.nodes.map(nd=>{ let o; if(nd.mesh!=null){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1)); return new THREE.Mesh(g,mats[pr.material]); }); if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } } else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); }); const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
{ const glb=glbScene(path.join(ROOT,'assets/models/env/second_ai/lib_b1_court.glb')); z.group.add(glb); const fb=z.group.getObjectByName('b1c_fallback'); if(fb) fb.visible=false; z.group.updateMatrixWorld(true);
  const vis=[], near=new THREE.Box3(new THREE.Vector3(C.x0-14,-10,C.z0-14),new THREE.Vector3(C.x1+14,40,C.z1+14)), bb=new THREE.Box3();   /* 只看中庭附近 14 m 的網格（鏡頭最遠 6 m；整個校園打視線太慢）*/
  z.group.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent) if(!p.visible) return; const m=[].concat(o.material)[0]; if(m&&m.visible===false) return; if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); if(!bb.intersectsBox(near)) return; vis.push(o); });
  const rc=new THREE.Raycaster(), pc=new THREE.PerspectiveCamera(50,844/390,0.1,500), wn=new THREE.Vector3();
  const firstDrawn=(hits,dir)=>hits.find(q=>{ const m=[].concat(q.object.material)[0]; if(m.side!==THREE.FrontSide||!q.face) return true; wn.copy(q.face.normal).transformDirection(q.object.matrixWorld); return wn.dot(dir)<0; });
  let shots=0, haze=0, hx=null;
  for(let x=C.x0+0.6;x<=C.x1-0.6;x+=0.5) for(let zz=C.st1+0.6;zz<=C.z1-0.5;zz+=0.5){ const tgt=new THREE.Vector3(x,Y+1.55,zz);
    for(const yaw of [-0.9,-0.45,0,0.45,0.9]){ const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,DIST,0,cam); pc.position.copy(cam); pc.lookAt(tgt); pc.updateMatrixWorld(true); shots++; let n=0;
      for(const sy of [-0.2,-0.5,-0.8]) for(const sx of [-0.8,-0.4,0,0.4,0.8]){ rc.setFromCamera(new THREE.Vector2(sx,sy),pc); const f=firstDrawn(rc.intersectObjects(vis,false),rc.ray.direction); if(f&&[].concat(f.object.material)[0].transparent&&f.distance<2) n++; }
      if(n>=3){ haze++; if(!hx) hx={head:[+x.toFixed(1),+zz.toFixed(1)],yaw,cam:cam.toArray().map(v=>+v.toFixed(2)),n}; } } }
  check('4 中庭裡鏡頭朝南：畫面下半沒有被 2 m 內的半透明面蓋住', shots>0&&haze===0, `${shots} 個鏡頭、${haze} 個有霧`+(hx?'，例：'+JSON.stringify(hx):''));
  let up=0, upN=0; for(const x of [96.8,98,99.2]){ const eye=new THREE.Vector3(x,Y+1.6,C.z1-2.6); rc.set(eye,new THREE.Vector3(x,Y+2.75,C.z1-0.65).sub(eye).normalize()); const f=firstDrawn(rc.intersectObjects(vis,false),rc.ray.direction); upN++; if(f&&/canopy/.test([].concat(f.object.material)[0].name)) up++; }
  check('5 從中庭地上往上看雨遮照常畫得到', up===upN, `${up}/${upN}`); }
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
