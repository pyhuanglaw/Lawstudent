// 各棟 GLB 重複的貼圖合併（PERF-TEX-DEDUP-1027，LAWWW2-C；src/assets3d.js 的 texDedup／bldgLoader）——不需要瀏覽器。
// 原本：同一張 Poly Haven 材質每棟 GLB 各帶一份，每一份各自解碼、各自傳上 GPU（89 個建築 GLB 的 924 份貼圖只有 554 張不同）。
// 這支測試用真的 GLTFLoader 解析手工組的小 GLB（圖片是假的位元組，EXT_texture_webp 和正式模型一樣；createImageBitmap、Image 是假的），經 ASSETS.loadOne 載入：
//   ① 第二棟和第一棟同一張圖、同樣的取樣和色彩空間：換成第一棟那一個 Texture（同一個物件）；第二棟自己那份的 ImageBitmap close、第一棟的不 close；
//   ② 圖片位元組不同、取樣不同（wrap）、色彩空間不同（同一張圖一棟當顏色、一棟當法線）：不合併；
//   ③ 同一個 GLB 裡同一張圖被兩個貼圖用（不同取樣，GLTFLoader 共用一個 ImageBitmap）：兩個都換掉才 close；只換掉一個（另一個是沒出現過的取樣）——圖片還有人在用，不 close；
//   ④ 不是建築（type:'character'）：不合併（VRM、人物、動畫、路人遠距離版本照舊）；
//   ⑤ ?nodedup 關掉；沒有 crypto.subtle（不是 https／localhost）也不合併；
//   ⑥ ASSETS.texDedup 記數字；GLTFLoader 自己放的 userData.mimeType 不算「有 userData」（否則全部都不合併——第一版就是這樣，這支測試抓到的）；
//   ⑦ 合併後再縮手機貼圖（capTextures）：共用的那張只縮一次，兩棟都拿到縮好的。
// 修改前：①③⑥⑦ FAIL（沒有合併）。用法：node tests/tex_dedup_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node',maxTouchPoints:0};
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
let drawn=0; global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,style:{},getContext:()=>({drawImage(){ drawn++; }})}), getElementById:()=>null, addEventListener(){} };
global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390;
// 假的圖片：位元組開頭 'FK'＋寬、高（uint16）；createImageBitmap 讀出來做一個 ImageBitmap
class ImageBitmap{ constructor(w,h,tag){ this.width=w; this.height=h; this.tag=tag; this.closed=false; } close(){ this.closed=true; this.width=0; this.height=0; } }
global.ImageBitmap=ImageBitmap; const made=[];
global.createImageBitmap=async b=>{ const u8=new Uint8Array(await b.arrayBuffer()); const w=u8[2]|(u8[3]<<8), h=u8[4]|(u8[5]<<8); const im=new ImageBitmap(w,h,String.fromCharCode(...u8.slice(6,14))); made.push(im); return im; };
global.Image=class{ set src(v){ setTimeout(()=>{ this.height=1; this.onload&&this.onload(); },0); } };   /* GLTFLoader 的 EXT_texture_webp 先試瀏覽器支不支援 webp */
const blobs=new Map(); let nb=0; URL.createObjectURL=b=>{ const u='blob:test/'+(++nb); blobs.set(u,b); return u; }; URL.revokeObjectURL=u=>blobs.delete(u);
const realFetch=global.fetch; global.fetch=(u,o)=>blobs.has(u)?Promise.resolve({ok:true,status:200,blob:()=>Promise.resolve(blobs.get(u))}):Promise.reject(new Error('no fetch in node: '+u));
process.on('unhandledRejection',e=>{ console.log('unhandledRejection',e&&e.message); });
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/assets3d.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
// ---- 手工組 GLB：一個三角形、每個材質一個 primitive；圖片放在 bufferView、用 EXT_texture_webp ----
const img=(tag,w,h)=>{ const u8=new Uint8Array(64); u8[0]=70; u8[1]=75; u8[2]=w&255; u8[3]=w>>8; u8[4]=h&255; u8[5]=h>>8; for(let i=0;i<8;i++) u8[6+i]=tag.charCodeAt(i)||32; for(let i=14;i<64;i++) u8[i]=(tag.charCodeAt(i%tag.length)*31+i)&255; return u8; };
function glb(spec){ const parts=[]; let off=0; const bvs=[]; const push=u8=>{ const pad=(4-(u8.length%4))%4; bvs.push({buffer:0,byteOffset:off,byteLength:u8.length}); parts.push(u8,new Uint8Array(pad)); off+=u8.length+pad; return bvs.length-1; };
  const posBV=push(new Uint8Array(new Float32Array([0,0,0,1,0,0,0,0,1]).buffer));
  const json={asset:{version:'2.0'},extensionsUsed:['EXT_texture_webp'],bufferViews:bvs,accessors:[{bufferView:posBV,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,0,1]}],
    images:spec.images.map(u8=>({bufferView:push(u8),mimeType:'image/webp'})),samplers:spec.samplers||[{}],
    textures:spec.textures.map(t=>({sampler:t.sampler||0,extensions:{EXT_texture_webp:{source:t.source}}})),
    materials:spec.materials.map(m=>{ const o={name:m.name,pbrMetallicRoughness:{}}; if(m.map!=null) o.pbrMetallicRoughness.baseColorTexture={index:m.map}; if(m.normal!=null) o.normalTexture={index:m.normal}; return o; }),
    meshes:[{primitives:spec.materials.map((m,i)=>({attributes:{POSITION:0},material:i}))}],nodes:[{mesh:0,name:'n'}],scenes:[{nodes:[0]}],scene:0};
  json.buffers=[{byteLength:off}];
  let js=Buffer.from(JSON.stringify(json)); const jpad=(4-js.length%4)%4; js=Buffer.concat([js,Buffer.alloc(jpad,0x20)]); const bin=Buffer.concat(parts.map(p=>Buffer.from(p)));
  const head=Buffer.alloc(12), jh=Buffer.alloc(8), bh=Buffer.alloc(8); head.writeUInt32LE(0x46546C67,0); head.writeUInt32LE(2,4); head.writeUInt32LE(12+8+js.length+8+bin.length,8);
  jh.writeUInt32LE(js.length,0); jh.writeUInt32LE(0x4E4F534A,4); bh.writeUInt32LE(bin.length,0); bh.writeUInt32LE(0x004E4942,4);
  return Buffer.concat([head,jh,js,bh,bin]).toString('base64'); }
const CLAMP=33071;
const BRICK=img('brick',512,512), BRICK_N=img('brickN',512,512), WOOD=img('wood',256,256), STONE=img('stone',256,256), BIG=img('big',2048,2048);
const add=(key,url,spec,type)=>{ ASSETS.manifest[key]={url,type:type||'building',lazy:true}; window.ASSET_DATA=window.ASSET_DATA||{}; window.ASSET_DATA[url]=glb(spec); };
add('bldg.tA','t/a.glb',{images:[BRICK,BRICK_N,WOOD],textures:[{source:0},{source:1},{source:2}],materials:[{name:'a_wall',map:0,normal:1},{name:'a_floor',map:2}]});
add('bldg.tB','t/b.glb',{images:[BRICK,BRICK_N,STONE,WOOD],samplers:[{},{wrapS:CLAMP,wrapT:CLAMP}],
  textures:[{source:0},{source:1},{source:2},{source:3,sampler:1}],
  materials:[{name:'b_wall',map:0,normal:1},{name:'b_stone',map:2},{name:'b_wood_clamp',map:3}]});
add('bldg.tI','t/i.glb',{images:[BRICK],textures:[{source:0}],materials:[{name:'i_brick_as_normal',normal:0}]});   /* 同一張磚，這一棟只當法線（線性）*/
add('bldg.tJ','t/j.glb',{images:[WOOD],samplers:[{},{wrapS:33648,wrapT:33648}],textures:[{source:0},{source:0,sampler:1}],materials:[{name:'j_wood',map:0},{name:'j_wood_mirror',map:1}]});   /* 同一張木紋：一個和第一棟一樣、一個是沒出現過的取樣（MIRRORED_REPEAT）*/
add('bldg.tC','t/c.glb',{images:[WOOD],samplers:[{},{wrapS:CLAMP,wrapT:CLAMP}],textures:[{source:0},{source:0,sampler:1}],materials:[{name:'c_wood',map:0},{name:'c_wood_clamp',map:1}]});
add('char.tD','t/d.glb',{images:[BRICK],textures:[{source:0}],materials:[{name:'d_char',map:0}]},'character');
const mat=(key,name)=>{ let m=null; ASSETS.cache[key].scene.traverse(o=>{ for(const x of [].concat(o.material||[])) if(x&&x.name===name) m=x; }); return m; };
(async()=>{
  check('⓪ ASSETS.texDedup 存在（貼圖合併的計數）',!!ASSETS.texDedup);
  await ASSETS.loadOne('bldg.tA'); const before=made.length; await ASSETS.loadOne('bldg.tB');
  const aW=mat('bldg.tA','a_wall'), aF=mat('bldg.tA','a_floor'), bW=mat('bldg.tB','b_wall'), bS=mat('bldg.tB','b_stone'), bC=mat('bldg.tB','b_wood_clamp');
  check('① 第二棟的牆（同一張磚、同樣取樣）：顏色、法線都換成第一棟那一個 Texture',!!aW&&!!bW&&bW.map===aW.map&&bW.normalMap===aW.normalMap);
  const bImgs=made.slice(before), bBrick=bImgs.find(i=>i.tag.startsWith('brick ')), bBrickN=bImgs.find(i=>i.tag.startsWith('brickN'));
  check('① 第二棟自己解碼的那兩張（磚、磚法線）close；第一棟的（共用的）不 close',!!bBrick&&bBrick.closed&&!!bBrickN&&bBrickN.closed&&!aW.map.image.closed&&!aW.normalMap.image.closed&&aW.map.image.width===512,JSON.stringify(bImgs.map(i=>[i.tag.trim(),i.closed])));
  check('② 圖片不同（石材）：不合併、不 close',!!bS&&bS.map!==aW.map&&bS.map!==aF.map&&!bS.map.image.closed);
  check('② 同一張木紋、取樣不同（CLAMP）：不合併、不 close',!!bC&&bC.map!==aF.map&&!bC.map.image.closed&&bC.map.wrapS===THREE.ClampToEdgeWrapping);
  const i0=made.length; await ASSETS.loadOne('bldg.tI'); const iN=mat('bldg.tI','i_brick_as_normal');
  check('② 同一張磚、第一棟當顏色（sRGB）、這一棟當法線（線性）：不合併、不 close',!!iN&&iN.normalMap!==aW.map&&iN.normalMap.colorSpace!==aW.map.colorSpace&&!made[i0].closed);
  const c0=made.length; await ASSETS.loadOne('bldg.tC'); const cW=mat('bldg.tC','c_wood'), cC=mat('bldg.tC','c_wood_clamp'), cImg=made.slice(c0)[0];
  check('③ 第三棟：同樣取樣的木紋換成第一棟那個；CLAMP 的換成第二棟那個（第一次出現的那份）',!!cW&&cW.map===aF.map&&!!cC&&cC.map===bC.map);
  check('③ 第三棟的木紋圖片：兩個貼圖都換掉了、沒有人在用——close（只 close 一次）',!!cImg&&cImg.closed);
  const j0=made.length; await ASSETS.loadOne('bldg.tJ'); const jW=mat('bldg.tJ','j_wood'), jM=mat('bldg.tJ','j_wood_mirror'), jImg=made[j0];
  check('③ 同一張木紋、一個換成第一棟的、一個是新的取樣（沒合併）：圖片還有新的那個在用——不 close',!!jW&&jW.map===aF.map&&!!jM&&jM.map!==aF.map&&jM.map.image===jImg&&!jImg.closed);
  await ASSETS.loadOne('char.tD'); const dM=mat('char.tD','d_char');
  check('④ 不是建築（type:character）：不合併',!!dM&&dM.map!==aW.map&&!dM.map.image.closed);
  const D=ASSETS.texDedup; check('⑥ ASSETS.texDedup 記數字（共用 5 個：第二棟磚、磚法線，第三棟木紋、木紋 CLAMP，第五棟木紋；close 3 張：第五棟那張還有人在用）',D.shared===5&&D.closed===3&&D.mpix>0.5&&D.textures>=11,JSON.stringify(D));
  // ⑤ ?nodedup、沒有 crypto.subtle
  global.location={search:'?nodedup'}; add('bldg.tE','t/e.glb',{images:[BRICK],textures:[{source:0}],materials:[{name:'e_wall',map:0}]}); await ASSETS.loadOne('bldg.tE');
  check('⑤ ?nodedup：不合併',mat('bldg.tE','e_wall').map!==aW.map); global.location={search:''};
  const cr=Object.getOwnPropertyDescriptor(globalThis,'crypto'); Object.defineProperty(globalThis,'crypto',{value:undefined,configurable:true,writable:true});
  add('bldg.tF','t/f.glb',{images:[BRICK],textures:[{source:0}],materials:[{name:'f_wall',map:0}]}); await ASSETS.loadOne('bldg.tF');
  check('⑤ 沒有 crypto.subtle（不是 https／localhost）：不合併、不丟例外',!!ASSETS.cache['bldg.tF']&&mat('bldg.tF','f_wall').map!==aW.map); Object.defineProperty(globalThis,'crypto',cr);
  // ⑦ 手機（texCap）：合併以後再縮，共用的那張只縮一次
  ASSETS.texCap={color:1024,data:512}; const d0=drawn;
  add('bldg.tG','t/g.glb',{images:[BIG],textures:[{source:0}],materials:[{name:'g_wall',map:0}]}); add('bldg.tH','t/h.glb',{images:[BIG],textures:[{source:0}],materials:[{name:'h_wall',map:0}]});
  const g0=made.length; await ASSETS.loadOne('bldg.tG'); await ASSETS.loadOne('bldg.tH'); const gM=mat('bldg.tG','g_wall'), hM=mat('bldg.tH','h_wall'), gh=made.slice(g0);
  check('⑦ 手機：第二棟換成第一棟那個 Texture（已經縮過）；只縮一次；兩張 2048 原圖都 close',!!gM&&gM.map===hM.map&&drawn-d0===1&&gh.length===2&&gh.every(i=>i.closed),JSON.stringify({draw:drawn-d0,closed:gh.map(i=>i.closed)}));
  ASSETS.texCap=null;
  // ⑧ assets3d.js：建築用 bldgLoader（註冊 texDedup），其他 GLB 照舊用 loader()
  const src=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8');
  check('⑧ 建築 GLB 用 bldgLoader（register(texDedup)）；VRM 的 loader 沒有註冊',/const L=m\.type==='building'\?bldgLoader\(\):loader\(\)/.test(src)&&/_bldgLoader\.register\(texDedup\)/.test(src)&&!/_vrmLoader\.register\([^)]*texDedup/.test(src));
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
