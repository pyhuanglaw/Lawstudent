// 普通 101 北窗白天整片深藍黑（PUTONG101-WINDOW-1102；BB-B n28；LAWWW2-B 10-31 判斷：窗景沒缺，黑的是窗外博思一樓的玻璃大廳）——不需要瀏覽器（D131）。
// 博思（campus_boya.glb，tools/blender/env_second/campus_teach.py --set boya）一樓南面的玻璃大廳往內退 0.6 m、上面有樓板，遊戲裡照不到光；
// 玻璃照 archkit 的顏色（頂點色，線性：上 0.26、下 0.06）幾乎是黑的，普通北面教室的窗景照片拍到的就是一整片黑。
// 修法：這一片帷幕換亮一點、偏灰藍的漸層（上 0.48／0.55／0.62、下 0.20／0.24／0.28：像反射對面普通的白牆和天空）；其他樓層、其他棟的 ck_glass 不動。
// 檢查（讀 GLB 的 by_glass 頂點色；GLB 是校園座標）：
//   1 一樓南面帷幕（y < 4.3、z > −76，面向普通）的玻璃最亮的頂點 ≥ 0.45
//   2 其他玻璃（二樓以上、其他面）照舊（最亮 ≤ 0.27）
// 第 2 版（BB 11-10 PARTIAL：白天 RGB 只從 [35,31,22] 到 [42,38,28]，肉眼還是黑洞）：遊戲的 ck_glass 白天不發光、這片又照不到光，頂點色調亮看不出來 →
//   LAWWW 選 B（不多網格：teach_east_drawcall 博雅一棟 ≤ 4 個網格）：by_glass 的 extras.skyBox＝這片帷幕的範圍；zones3d.js glassSky 給 ck_glass 加一段 shader，範圍內白天加一層灰藍、晚上 0：
//   3 GLB：by_glass 有 skyBox，框住一樓南面帷幕所有的頂點、其他玻璃的頂點都在外面；沒有另外的網格（沒有 by_skyref、ck_glass_skyref）
//   4 遊戲（Node 建出校園、接上 campus_boya.glb）：博思的 ck_glass 有 glassSky（three.js 真的 MeshStandard shader 套得上：頂點傳 position、片段在範圍內加灰藍 #4f5f73、霧裡淡掉；
//     程式快取的鍵不同）；白天的比例（onBeforeRender）白天 1、晚上 0（TK.setNight）；同一棟其他材質、別棟的 ck_glass 沒有
// 修改前：第 1 版（開發分支 9d4c54c16）1 FAIL；第 2 版之前（開發分支 0ec32e6f6）3、4 FAIL。窗景照片 assets/models/env/views/putong_north_{day,night}.webp 要在遊戲裡重拍（CC：teach_views.py putong_north）。
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
/* 3 by_glass 的 skyBox */
{ const bx=nd&&nd.extras&&nd.extras.skyBox; let inN=0, outIn=0, curN=0; const V=[]; let gz=-1e9;
  if(nd) for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION); for(let i=0;i<P.count;i++){ const p=[P.get(i,0)+t[0],P.get(i,1)+t[1],P.get(i,2)+t[2]]; V.push(p); if(p[1]<4.3&&p[2]>-76) gz=Math.max(gz,p[2]); } }
  const inside=p=>!!bx&&p[0]>=bx[0]&&p[1]>=bx[1]&&p[2]>=bx[2]&&p[0]<=bx[3]&&p[1]<=bx[4]&&p[2]<=bx[5];
  for(const p of V){ const cur=p[1]<4.3&&Math.abs(p[2]-gz)<0.01; if(cur){ curN++; if(inside(p)) inN++; } else if(inside(p)) outIn++; }
  const extra=J.nodes.some(q=>/skyref/.test(q.name||''))||(J.materials||[]).some(m=>/skyref/.test(m.name||''));
  check('3 GLB：by_glass 的 skyBox 框住一樓南面帷幕（全部頂點）、其他玻璃在外面；沒有另外的網格', !!bx&&curN>0&&inN===curN&&outIn===0&&!extra, bx?`skyBox [${bx.join(', ')}]；帷幕頂點 ${inN}／${curN} 在裡面、其他玻璃在裡面 ${outIn}；另外的網格 ${extra?'有':'沒有'}`:'by_glass 沒有 skyBox'); }
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
  let gm=null, gmesh=null, others=0; z.group.traverse(o=>{ if(!o.isMesh||!o.material) return; const m=o.material; if(m.name==='ck_glass'&&o.userData&&o.userData.skyBox){ gm=m; gmesh=o; } else if(m.userData&&m.userData.skyPatch) others++; });
  let shOK=false, keyOK=false, dayV=null, nightV=null, info='';
  if(gm&&gm.userData.skyPatch){ const sh={uniforms:{},vertexShader:THREE.ShaderLib.standard.vertexShader,fragmentShader:THREE.ShaderLib.standard.fragmentShader}; gm.onBeforeCompile(sh,{});
    shOK=/vSkyP=position;/.test(sh.vertexShader)&&/gl_FragColor\.rgb\+=uSkyCol\*skyF/.test(sh.fragmentShader)&&/fogFactor/.test(sh.fragmentShader)&&!!sh.uniforms.uSkyDay&&!!sh.uniforms.uSkyDivA&&!!sh.uniforms.uSkyMin&&sh.uniforms.uSkyCol.value.getHex()===0x4f5f73;
    keyOK=/glassSky/.test(gm.customProgramCacheKey());
    TK.setNight(0); gmesh.onBeforeRender(); dayV=gm.userData.skyPatch.uDay.value; TK.setNight(1); gmesh.onBeforeRender(); nightV=gm.userData.skyPatch.uDay.value; TK.setNight(0);
    info=`玻璃 ${gm.transparent?'半透明':'不透明'}（除以 alpha ${gm.userData.skyPatch.uDivA.value}）、shader ${shOK?'套得上':'沒套上'}、快取鍵 ${keyOK?'不同':'一樣'}、白天 ${dayV}、晚上 ${nightV}`; }
  check('4 遊戲：博思的 ck_glass 加了反射天空的 shader（範圍內白天灰藍、晚上 0、霧裡淡掉），別的材質沒有', !!gm&&shOK&&keyOK&&dayV>=0.99&&nightV<=0.01&&others===0, gm?info+`；別的材質有 ${others} 個`:'遊戲裡找不到帶 skyBox 的 ck_glass');
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0); })();
