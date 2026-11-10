// 普通 101 北窗白天整片深藍黑（PUTONG101-WINDOW-1102；BB-B n28；LAWWW2-B 10-31 判斷：窗景沒缺，黑的是窗外博思一樓的玻璃大廳）——不需要瀏覽器（D131）。
// 博思（campus_boya.glb，tools/blender/env_second/campus_teach.py --set boya）一樓南面的玻璃大廳往內退 0.6 m、上面有樓板，遊戲裡照不到光；
// 玻璃照 archkit 的顏色（頂點色，線性：上 0.26、下 0.06）幾乎是黑的，普通北面教室的窗景照片拍到的就是一整片黑。
// 修法：這一片帷幕換亮一點、偏灰藍的漸層（上 0.48／0.55／0.62、下 0.20／0.24／0.28：像反射對面普通的白牆和天空）；其他樓層、其他棟的 ck_glass 不動。
// 檢查（讀 GLB 的 by_glass 頂點色；GLB 是校園座標）：
//   1 一樓南面帷幕（y < 4.3、z > −76，面向普通）的玻璃最亮的頂點 ≥ 0.45
//   2 其他玻璃（二樓以上、其他面）照舊（最亮 ≤ 0.27）
// 第 2 版（BB 11-10 PARTIAL：白天 RGB 只從 [35,31,22] 到 [42,38,28]，肉眼還是黑洞）：遊戲的 ck_glass 白天不發光、這片又照不到光，頂點色調亮看不出來 →
//   玻璃外 5 mm 加一片「反射天空」by_skyref（材質 ck_glass_skyref；zones3d.js：加法混合、灰藍色自發光，白天 1、晚上幾乎 0）：
//   3 GLB 有 by_skyref，蓋住一樓南面的帷幕、在玻璃外面
//   4 遊戲（Node 建出校園、接上 campus_boya.glb）：那一片材質是加法混合、底色黑、自發光灰藍、不寫深度；白天亮度 ≥ 0.9、晚上 ≤ 0.01（TK.setNight）；ck_glass 照舊
// 修改前：第 1 版（開發分支 9d4c54c16）1 FAIL；第 2 版之前（開發分支 6e00d9103）3、4 FAIL。窗景照片 assets/models/env/views/putong_north_{day,night}.webp 要在遊戲裡重拍（D131：CC 跑 tools/blender/env_second/shots/teach_views.py <網址> putong_north）。
// 用法：node tests/putong101_window_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_boya.glb')), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0); const T={5126:Float32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType];
  const arr=new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); const k=a.normalized?(a.componentType===5123?65535:255):1; return {n,get:(i,j)=>arr[i*n+j]/k,count:a.count}; };
const nd=J.nodes.find(q=>q.name==='by_glass'); const t=(nd&&nd.translation)||[0,0,0];
let lowMax=0, lowN=0, highMax=0;
if(nd) for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION), C=acc(pr.attributes.COLOR_0);
  for(let i=0;i<P.count;i++){ const y=P.get(i,1)+t[1], z=P.get(i,2)+t[2], r=C.get(i,0); if(y<4.3&&z>-76){ lowN++; lowMax=Math.max(lowMax,r); } else highMax=Math.max(highMax,r); } }
check('0 讀得到博思的玻璃（by_glass）', !!nd&&lowN>0, `一樓南面帷幕的頂點 ${lowN}`);
check('1 一樓南面玻璃大廳（面向普通）亮一點：最亮的頂點 ≥ 0.45', lowMax>=0.45, `最亮 ${lowMax.toFixed(3)}`);
check('2 其他玻璃照舊：最亮 ≤ 0.27', highMax<=0.27, `最亮 ${highMax.toFixed(3)}`);
/* 3 by_skyref 的範圍 */
{ const sk=J.nodes.find(q=>q.name==='by_skyref'); let mn=null, mx=null; if(sk){ const t2=sk.translation||[0,0,0]; for(const pr of J.meshes[sk.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION]; mn=a.min.map((v,i)=>v+t2[i]); mx=a.max.map((v,i)=>v+t2[i]); } }
  /* 一樓南面帷幕＝y<4.3、最南（z 最大）的那一個面；z -75.25 那幾點是東端另一片窗，不算 */
  let gz=-1e9, gx0=1e9, gx1=-1e9; const V=[]; if(nd) for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION); for(let i=0;i<P.count;i++){ const y=P.get(i,1)+t[1], z=P.get(i,2)+t[2], x=P.get(i,0)+t[0]; if(y<4.3&&z>-76){ V.push([x,z]); gz=Math.max(gz,z); } } }
  for(const [x,z] of V) if(Math.abs(z-gz)<0.01){ gx0=Math.min(gx0,x); gx1=Math.max(gx1,x); }
  const ok=!!mn&&mn[0]<=gx0+0.2&&mx[0]>=gx1-0.2&&mn[2]>gz-0.001&&mx[2]-mn[2]<0.02;
  check('3 GLB 有「反射天空」by_skyref：蓋住一樓南面帷幕（x '+gx0.toFixed(2)+'～'+gx1.toFixed(2)+'）、在玻璃外面', ok, mn?`by_skyref x ${mn[0].toFixed(2)}～${mx[0].toFixed(2)}、z ${mn[2].toFixed(3)}（玻璃最外 ${gz.toFixed(3)}）`:'沒有 by_skyref'); }
/* 4 遊戲端 */
(async()=>{ const vm=require('vm'); global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); const _W=[]; console.warn=(...a)=>_W.push(a.map(String).join(" ").slice(0,200));
  const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
  for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
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
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.renderer=E.renderer||{capabilities:{getMaxAnisotropy:()=>8}};
  ASSETS.loadOne=k=>k==='bldg.campus_boya'?Promise.resolve({scene:glbScene(path.join(ROOT,ASSETS.manifest[k].url))}):new Promise(()=>{});
  global.GAME=global.GAME||{}; GAME.G={hour:14,weather:'clear',flags:{},zone:'campus',day:30};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.campus.build(E); E.zone=z; for(let i=0;i<200;i++) await new Promise(r=>setTimeout(r,0)); let nSky=0; E.scene.traverse(o=>{ if(o.name==='by_skyref') nSky++; }); z.group.traverse(o=>{ if(o.name==='by_skyref') nSky++; }); if(process.env.DBG) console.log('by_skyref nodes',nSky,_W.filter(w=>/博雅|博思|boya/.test(w))); z.group.updateMatrixWorld(true);
  let sky=null, gl=null; E.scene.add(z.group); E.scene.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name==='ck_glass_skyref') sky=o.material; if(o.isMesh&&o.material&&o.material.name==='ck_glass') gl=gl||o.material; });
  let dayI=null, nightI=null; if(sky){ TK.setNight(0); dayI=sky.emissiveIntensity; TK.setNight(1); nightI=sky.emissiveIntensity; TK.setNight(0); }
  const ok=!!sky&&sky.blending===THREE.AdditiveBlending&&sky.color.getHex()===0&&sky.emissive.getHex()===0x4f5f73&&sky.depthWrite===false&&dayI>=0.9&&nightI<=0.01&&!!gl&&gl.blending!==THREE.AdditiveBlending;
  check('4 遊戲裡「反射天空」那一片：加法混合、底色黑、灰藍自發光、不寫深度；白天亮、晚上幾乎 0；ck_glass 照舊', ok, sky?`混合 ${sky.blending===THREE.AdditiveBlending?'加法':sky.blending}、底色 #${sky.color.getHexString()}、自發光 #${sky.emissive.getHexString()}、白天 ${dayI}、晚上 ${nightI}`:'遊戲裡找不到 ck_glass_skyref');
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
