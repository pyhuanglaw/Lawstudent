// POOL-SWIM-LOOK-1110（LAWWW 角色驗收泳客 PARTIAL：「水太透明、沒有水面，近看像趴在水上；腿的膚色偏灰白」）——游泳池水面換材質（src/gym3d.js 的 GY3.poolWater）＋泳客趴得低一點、頭高腳低。
// 不需要瀏覽器：在 Node 載入 three.js 和遊戲真正的 gym3d.js，用假的 TextureLoader（立刻給一張空貼圖）：
//   1. 貼圖檔在：pool_ripple_nor.webp（512×512）、pool_env.webp（寬＝高×2，等距圓柱）；產生的腳本在
//   2. gym_b1.glb 裡剛好一個節點會被認成水面（b1_water，y −0.14）；其他名字有 water 的（飲水機 GYM2_WATER_*）不會
//   3. 換上的材質：透明度 0.55～0.75、藍綠色（藍＞紅）、不寫深度、有法線圖（重複鋪）、有等距圓柱的環境圖、粗糙度 ≤ 0.15；水面沒有 UV 的補上 0～1
//   4. shader：法線那一行換成兩層相加（原本的字串在 three.js 裡找得到——升級 three.js 以後字串變了這一項會抓到）
//   5. 每一格兩層波紋往不同方向捲動（offset 有變、方向不同）
//   6. 貼圖載不到、或已經離開 B1：材質照舊（不換成半成品）
//   7. 接線：gym_b1 的正式模型載好以後呼叫 poolWater；泳客的趴姿參數 water −0.14、y、tilt（頭高腳低）在 character3d.js
// 修改前（gym3d.js 沒有 poolWater）：第 3 項以後全部 FAIL。用法：node tests/pool_water_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
/* webp 的寬高（VP8 有損、VP8L 無損、VP8X）*/
function webpSize(f){ const b=fs.readFileSync(f); if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null; const t=b.toString('ascii',12,16);
  if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; }
  if(t==='VP8X') return [1+(b[24]|b[25]<<8|b[26]<<16),1+(b[27]|b[28]<<8|b[29]<<16)]; return null; }
(async()=>{
  // ---------- 1 ----------
  const D=path.join(ROOT,'assets/models/env/second_ai'), nf=path.join(D,'pool_ripple_nor.webp'), ef=path.join(D,'pool_env.webp');
  const ns=fs.existsSync(nf)&&webpSize(nf), es=fs.existsSync(ef)&&webpSize(ef);
  check('1 貼圖檔在：pool_ripple_nor.webp 512×512、pool_env.webp 寬＝高×2（等距圓柱）；產生的腳本 pool_water_tex.py、pool_env_render.py 在',!!ns&&ns[0]===512&&ns[1]===512&&!!es&&es[0]===2*es[1]&&es[0]>=512
    &&fs.existsSync(path.join(ROOT,'tools/blender/env_second/pool_water_tex.py'))&&fs.existsSync(path.join(ROOT,'tools/blender/env_second/pool_env_render.py')),J([ns,es]));
  // ---------- 2 ----------
  const gb=fs.readFileSync(path.join(D,'gym_b1.glb')), jl=gb.readUInt32LE(12), G=JSON.parse(gb.slice(20,20+jl).toString('utf8')), RE=/(^|_)water$/;
  const hit=G.nodes.filter(n=>RE.test(n.name||'')).map(n=>n.name), other=G.nodes.filter(n=>/water/i.test(n.name||'')&&!RE.test(n.name||'')).map(n=>n.name);
  const wn=G.nodes.find(n=>n.name==='b1_water'), acc=wn&&G.accessors[G.meshes[wn.mesh].primitives[0].attributes.POSITION], wy=acc&&[acc.min[1]+((wn.translation||[0,0,0])[1]),acc.max[1]+((wn.translation||[0,0,0])[1])];
  check('2 gym_b1.glb 裡剛好一個節點會被認成水面（b1_water，高度 −0.14＝泳客的 C.GYM.swim.water）；飲水機 GYM2_WATER_* 不會',hit.length===1&&hit[0]==='b1_water'&&!!wy&&Math.abs(wy[0]+0.14)<0.005&&Math.abs(wy[1]+0.14)<0.005,J({hit,other,wy}));
  // ---------- 假的場景：一片沒有 UV 的水面（和 gym_b1.glb 一樣）＋假的 TextureLoader ----------
  let fail=false; const loads=[]; THREE.TextureLoader.prototype.load=function(url,onLoad,onProg,onErr){ loads.push(url); const t=new THREE.Texture(); setTimeout(()=>fail?onErr&&onErr(new Error('x')):onLoad&&onLoad(t),0); return t; };
  const mk=()=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([-12.5,-0.14,-3.5, 12.5,-0.14,-3.5, 12.5,-0.14,-21, -12.5,-0.14,-21],3)); g.setIndex([0,1,2,0,2,3]);
    const old=new THREE.MeshStandardMaterial({color:0x3f9fc8,transparent:true,opacity:0.42}); const w=new THREE.Mesh(g,old); w.name='b1_water'; const root=new THREE.Group(); root.add(w);
    const bottle=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial()); bottle.name='GYM2_WATER_5_0'; root.add(bottle); return {root,w,old,bottle}; };
  const z={}, E={zone:z};
  if(typeof GY3==='undefined'||typeof GY3.poolWater!=='function'){ check('3 GY3.poolWater 存在',false); console.log('FAILED: '+fails); process.exit(1); }
  const A=mk(), r=await GY3.poolWater(E,z,A.root), m=A.w.material, col=m.color||new THREE.Color();
  const uv=A.w.geometry.attributes.uv, uvs=uv?Array.from(uv.array):[];
  // ---------- 3 ----------
  check('3 水面換成新材質：透明度 0.55～0.75、藍綠（藍＞綠＞紅）、不寫深度、粗糙度 ≤ 0.15、有法線圖（重複鋪 ≥ 3 格）、有等距圓柱環境圖；飲水機沒換',m!==A.old&&!!r&&m.transparent&&m.opacity>=0.55&&m.opacity<=0.75&&col.b>col.g&&col.g>col.r&&m.depthWrite===false&&m.roughness<=0.15
    &&!!m.normalMap&&m.normalMap.wrapS===THREE.RepeatWrapping&&m.normalMap.repeat.x>=3&&!!m.envMap&&m.envMap.mapping===THREE.EquirectangularReflectionMapping&&A.bottle.material.type==='MeshStandardMaterial'&&!A.bottle.material.normalMap,
    J({op:m.opacity,col:col.getHexString(),dw:m.depthWrite,ro:m.roughness,rep:m.normalMap&&[m.normalMap.repeat.x,m.normalMap.repeat.y],env:m.envMap&&m.envMap.mapping,loads}));
  check('3 水面沒有 UV 的補上：四個頂點，u、v 都在 0～1、四個角都有',!!uv&&uv.count===4&&uvs.every(v=>v>=-1e-6&&v<=1+1e-6)&&uvs.filter(v=>v<1e-6).length>=4&&uvs.filter(v=>v>1-1e-6).length>=4,J(uvs));
  // ---------- 4 ----------
  const T3=fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'), LINE='vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;';
  const sh={uniforms:{},fragmentShader:'void main(){\n'+LINE+'\n}'}; if(m.onBeforeCompile) m.onBeforeCompile(sh);
  check('4 shader：three.js 裡找得到要換的那一行；換成兩層相加（第二層用 n2Rep、n2Off），uniform 有接',T3.includes(LINE)&&!sh.fragmentShader.includes(LINE)&&/n2Rep/.test(sh.fragmentShader)&&/n2Off/.test(sh.fragmentShader)&&!!sh.uniforms.n2Off&&!!sh.uniforms.n2Rep&&sh.uniforms.n2Rep.value.x>1,sh.fragmentShader.slice(0,160));
  // ---------- 5 ----------
  const o0=m.normalMap.offset.clone(), p0=sh.uniforms.n2Off.value.clone(); for(let i=0;i<30;i++) z.update(1/30,E); const o1=m.normalMap.offset.clone(), p1=sh.uniforms.n2Off.value.clone();
  const d1=o1.clone().sub(o0), d2=p1.clone().sub(p0), ang=Math.acos(Math.max(-1,Math.min(1,d1.clone().normalize().dot(d2.clone().normalize()))));
  check('5 每一格兩層波紋都在捲動、方向不同（夾角 > 45°）、一秒移動不到一格的 5%（慢慢晃，不是在流）',d1.length()>1e-4&&d2.length()>1e-4&&ang>Math.PI/4&&d1.length()<0.05&&d2.length()<0.05,J({d1:[d1.x,d1.y].map(v=>+v.toFixed(4)),d2:[d2.x,d2.y].map(v=>+v.toFixed(4)),ang:+(ang*180/Math.PI).toFixed(1)}));
  // ---------- 6 ----------
  fail=true; const B=mk(), zb={}, rb=await GY3.poolWater({zone:zb},zb,B.root); fail=false;
  const C=mk(), zc={}, Ec={zone:zc}, pc=GY3.poolWater(Ec,zc,C.root); Ec.zone={}; const rc=await pc;
  check('6 貼圖載不到、或貼圖載好時已經離開 B1：材質照舊、沒有掛每一格的更新',rb===null&&B.w.material===B.old&&!zb.update&&rc===null&&C.w.material===C.old&&!zc.update,J([rb,rc]));
  // ---------- 7 ----------
  const GS=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), CS=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), sw=CS.match(/swim:\{([^}]*)\}/), P=sw?Object.fromEntries(sw[1].split(',').map(s=>s.split(':')).map(([k,v])=>[k,+v])):{};
  check('7 接線：gym_b1 正式模型載好以後呼叫 poolWater（和 gymMoving 同一處）；泳客的趴姿 water −0.14、臀部在水面下 ≥ 12 cm、頭高腳低 0.05～0.2 弧度',/gymMoving\(E,z,g0,root,B,cz\); poolWater\(E,z,root\);/.test(GS)&&P.water===-0.14&&P.y<=-0.12&&P.tilt>=0.05&&P.tilt<=0.2,J(P));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
