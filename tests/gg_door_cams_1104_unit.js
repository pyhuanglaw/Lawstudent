// 公館店門口鏡頭被擋（GG-DOOR-CAMS-1104；BB-C 11-04 13:07 CC 探針 GG_int_art 的 art_aoki_door、art_yejian_door：「門前 6 m 面向店門」）——不需要瀏覽器（D131）。
//   青木茶室門口 (−54.05, 21)：站在門前 6 m（z 15）往店門看，跟隨鏡頭在背後 (−54.05, 3.2, 8.7)，正好在行道樹 (−53, 9.4) 的樹冠裡＝整個畫面都是葉子。
//     原因：樹幹有「樹幹透視」（userData.seeThrough），葉子沒有；葉子也不擋鏡頭（不是碰撞盒）。
//     修法（townkit3d.js 正式樹 street_trees 的葉片材質）：離鏡頭 4 m 內的葉片網點透空、1.4 m 內全部不畫；另外接 E3.patchSeeThrough（擋在鏡頭和玩家之間的葉子在玩家周圍透空）。
//   頁間書屋門口 (−36.4, 21)：門前 6 m 往店門看，鏡頭在捷運出口亭（gongguan_mrt_exit.glb）東端後面＝整個畫面是亭子的牆。
//     原因：出口亭的鏡頭碰撞盒 x 只到 −36.6、z 9.3～12.7，正式模型地面以上是 x −43～−35.78、z 8.73～13.27（東端 0.8 m 沒有碰撞）。修法：碰撞盒照模型的外框。
// 檢查（在 Node 建出遊戲真正的公館區域；正式樹照遊戲從 street_trees.glb 建，碰撞照 E.colliders、鏡頭照 E.followCam）：
//   1 正式行道樹的葉片材質：shader 有離鏡頭近的網點透空（TL_NEAR）、接了樹幹透視（userData.seeThrough、uSeeP）
//   2 青木門前 6 m 的鏡頭（往店門看、左右 ±0.5）：鏡頭在行道樹樹冠 4 m 內（證明葉片會被透空處理到）
//   3 頁間門前 6 m 的鏡頭（往店門看、左右 ±0.5）：頭 → 鏡頭這一條線不穿過出口亭（正式模型地面以上的外框）
//   4 出口亭的碰撞盒蓋住正式模型地面以上的外框
// 修改前（開發分支 6355ec91b 之後的 4d7f556a6）：1、3、4 FAIL。用法：node tests/gg_door_cams_1104_unit.js
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
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
function glb(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8); return {J,bin}; }
function glbScene(file){ const {J,bin}=glb(file);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o; if(nd.mesh!=null){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.attributes.TEXCOORD_0!=null) g.setAttribute('uv',new THREE.BufferAttribute(acc(pr.attributes.TEXCOORD_0),2)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1)); return new THREE.Mesh(g,mats[pr.material]); }); if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } } else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); }); const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster(); ASSETS.loadOne=()=>new Promise(()=>{});
/* 正式行道樹：照遊戲，ASSETS 快取裡有 prop.trees＝street_trees.glb（townkit3d.js treeAsset） */
if(!E.camera) E.camera=new THREE.PerspectiveCamera(46,1,0.1,200); E.extras=E.extras||[]; E.addExtra=x=>{ E.extras.push(x); };   /* Node 沒有跑 E.init：照遊戲的介面補鏡頭、addExtra（行道樹正式模型要用）*/
const TREES=glbScene(path.join(ROOT,ASSETS.manifest['prop.trees'].url)); ASSETS.cache['prop.trees']={scene:TREES};
global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'gongguan',day:1};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=E.extras||[]; const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.nav=z.nav; z.group.updateMatrixWorld(true);
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
for(const x of E.extras) if(x&&x.init&&!x.ready) x.init();   /* 行道樹的正式模型（TreeField）：遊戲在第一格畫面時建，這裡直接建 */
const DIST=Z3.ZONES.gongguan.camDist||6.5, PITCH=0.22;
/* 1 葉片材質 */
{ const leaves=[]; TREES.traverse(o=>{ if(o.isMesh&&/_leaf$/.test(o.name)) leaves.push(o.material); });
  let ok=leaves.length>0, info=[]; for(const m of leaves){ const sh={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader}; if(m.onBeforeCompile) m.onBeforeCompile(sh,null);
    const near=/TL_NEAR/.test(sh.fragmentShader)&&/length\( vViewPosition \)/.test(sh.fragmentShader)&&/discard/.test(sh.fragmentShader), see=!!(m.userData&&m.userData.seeThrough)&&/uSeeP/.test(sh.fragmentShader), wind=/uTreeT/.test(sh.vertexShader);
    if(!(near&&see&&wind)) ok=false; info.push(m.name+(near?'':' 沒有近距透空')+(see?'':' 沒有樹幹透視')+(wind?'':' 風不見了')); }
  check('1 正式行道樹的葉片：離鏡頭近的網點透空＋接樹幹透視（風照舊）', ok, `${leaves.length} 種葉片：`+info.join('、')); }
/* 行道樹的位置（套件階段的樹：gg_street_tree）*/
const trees=[]; z.group.traverse(o=>{ if(o.name==='gg_street_tree') trees.push(o.getWorldPosition(new THREE.Vector3())); });
/* 出口亭正式模型地面以上的外框（模型座標 → 公館：放在 (−36.6, 0, 11)、轉 90°）*/
const MRT=(()=>{ const {J}=glb(path.join(ROOT,'assets/models/env/second_ai/gongguan_mrt_exit.glb')); let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for(const nd of J.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0]; for(const pr of J.meshes[nd.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION]; for(let i=0;i<3;i++){ mn[i]=Math.min(mn[i],a.min[i]+t[i]); mx[i]=Math.max(mx[i],a.max[i]+t[i]); } } }
  return new THREE.Box3(new THREE.Vector3(Math.max(-43.0,-36.6+mn[2]),0.05,11-mx[0]),new THREE.Vector3(-36.6+mx[2],mx[1],11-mn[0])); })();
const segHits=(a,b,box)=>{ const r=new THREE.Ray(a,b.clone().sub(a).normalize()), p=new THREE.Vector3(); const h=r.intersectBox(box,p); return !!h&&a.distanceTo(p)<a.distanceTo(b)-0.05; };
/* 2 青木門前 */
{ const res=[]; let ok=true; for(const dy of [0,-0.5,0.5]){ const tgt=new THREE.Vector3(-54.05,1.55,15), cam=new THREE.Vector3(); E.followCam(tgt,Math.PI+dy,PITCH,DIST,0,cam); let d=1e9; for(const t of trees) d=Math.min(d,Math.hypot(cam.x-t.x,cam.z-t.z)); res.push(`yaw π${dy?(dy>0?'+':'')+dy:''}：鏡頭 (${cam.toArray().map(v=>+v.toFixed(1)).join(',')})、離行道樹 ${d.toFixed(1)} m`); if(dy===0&&!(d<4)) ok=false; }
  check('2 青木門前 6 m 往店門看：鏡頭貼著行道樹（葉片的近距透空處理得到）', ok&&trees.length>0, res.join('；')); }
/* 3、4 頁間門前、出口亭 */
{ const res=[]; let bad=0; for(const dy of [0,-0.5,0.5]){ const tgt=new THREE.Vector3(-36.4,1.55,15), cam=new THREE.Vector3(); E.followCam(tgt,Math.PI+dy,PITCH,DIST,0,cam); const hit=segHits(tgt,cam,MRT); if(hit) bad++; res.push(`yaw π${dy?(dy>0?'+':'')+dy:''}：鏡頭 (${cam.toArray().map(v=>+v.toFixed(2)).join(',')})${hit?' 穿過出口亭':''}`); }
  check('3 頁間門前 6 m 往店門看：頭 → 鏡頭不穿過捷運出口亭', bad===0, res.join('；')); }
{ const col=z.group.getObjectByName('gg_mrt_camcol')||E.colliders.find(c=>{ const b=new THREE.Box3().setFromObject(c), m=b.getCenter(new THREE.Vector3()); return Math.abs(m.x+39.6)<1&&Math.abs(m.z-11)<0.5&&b.max.y<4; });
  const b=col?new THREE.Box3().setFromObject(col):null; const ok=!!b&&b.min.x<=MRT.min.x+0.02&&b.max.x>=MRT.max.x-0.02&&b.min.z<=MRT.min.z+0.02&&b.max.z>=MRT.max.z-0.02;
  check('4 出口亭的鏡頭碰撞盒蓋住正式模型地面以上的外框', ok, `模型 x ${MRT.min.x.toFixed(2)}～${MRT.max.x.toFixed(2)}、z ${MRT.min.z.toFixed(2)}～${MRT.max.z.toFixed(2)}；碰撞盒 `+(b?`x ${b.min.x.toFixed(2)}～${b.max.x.toFixed(2)}、z ${b.min.z.toFixed(2)}～${b.max.z.toFixed(2)}`:'找不到')); }
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
