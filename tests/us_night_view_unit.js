// 美國篇窗外的日夜（US-NIGHTVIEW-1110，LAWWW2 帳號 A 2026-11-10；BB 15:21 US_ART 第一批 ①②③）：不需要瀏覽器。
// 在 Node 照 index.html 的順序載入程式，建出公寓、C 棟 208、草原超市、法學院圖書館，接上真的正式模型（GLB 的貼圖拿掉：只看材質的顏色、節點），設成 14:00、20:00 檢查：
//   ① 公寓、208：窗玻璃（usa_glass，半透明、會被室內的燈照亮）晚上跟著窗景變暗——原本晚上燈開大，玻璃自己的亮度蓋過已經變暗的窗景，臥室看出去還像白天；白天顏色不變
//   ② 草原超市：門外的停車場（usm_outside_view，材質 GLOW_usm_outside）晚上變暗、不再當成整天全亮的燈；正面玻璃也跟著變暗
//   ③ 法學院圖書館：服務台背後的南牆、西牆都在（BB「背後是天空」＝拍照的鏡頭在屋裡、遊戲鏡頭在南牆外，南牆照遊戲鏡頭淡出；不是少了牆）
// 這是材質數值的檢查，不是畫面；畫面請 CC 拍（D131）。用法：node tests/us_night_view_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
/* GLB 拿掉貼圖再給 GLTFLoader 解析（Node 沒有影像解碼）：網格、節點名、材質的顏色都照原檔 */
function parseGLB(file){ const b=fs.readFileSync(file); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const binLen=b.readUInt32LE(20+n); const bin=b.slice(20+n+8,20+n+8+binLen);
  for(const m of J.materials||[]){ const p=m.pbrMetallicRoughness||{}; for(const k of ['baseColorTexture','metallicRoughnessTexture']) delete p[k]; for(const k of ['normalTexture','occlusionTexture','emissiveTexture']) delete m[k]; if(m.extensions) for(const e in m.extensions) for(const k in m.extensions[e]) if(/Texture$/.test(k)) delete m.extensions[e][k]; }
  delete J.textures; delete J.images; delete J.samplers; delete J.extensionsRequired; if(J.extensionsUsed) J.extensionsUsed=J.extensionsUsed.filter(e=>!/texture|KTX|webp/i.test(e));
  const js=Buffer.from(JSON.stringify(J)); const jb=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]); const bb=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
  const h=Buffer.alloc(12); h.write('glTF',0); h.writeUInt32LE(2,4); h.writeUInt32LE(12+8+jb.length+8+bb.length,8); const c1=Buffer.alloc(8); c1.writeUInt32LE(jb.length,0); c1.write('JSON',4); const c2=Buffer.alloc(8); c2.writeUInt32LE(bb.length,0); c2.writeUInt32LE(0x004E4942,4);
  const out=Buffer.concat([h,c1,jb,c2,bb]); return new Promise((res,rej)=>new THREE_JSM.GLTFLoader.GLTFLoader().parse(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'',g=>res(g),rej)); }
const cache={}; ASSETS.loadOne=k=>{ const m=ASSETS.manifest[k]; if(!m||m.type!=='building') return new Promise(()=>{}); if(!cache[k]) cache[k]=parseGLB(path.join(ROOT,m.url)).then(g=>({scene:g.scene})); return cache[k]; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
global.GAME={G:{day:40,hour:14,weather:'clear',flags:{},weekday:3}};
async function load(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.nav=z.nav;
  for(let i=0;i<200&&!z.formal;i++) await new Promise(r=>setTimeout(r,20)); return z; }
const mats=(z,re)=>{ const out=new Set(); z.group.traverse(o=>{ if(o.isMesh&&re.test(o.name)) for(const m of [].concat(o.material)) out.add(m); }); return [...out]; };
const lum=c=>0.2126*c.r+0.7152*c.g+0.0722*c.b;
(async()=>{
  for(const id of ['us_apartment','us_shared']){ const z=await load(id); check(`${id}：正式模型接上`,!!z.formal); if(!z.formal) continue;
    const gl=mats(z,/^usa_glass$/), vw=mats(z,/^usa_view/); check(`${id}：有窗玻璃、窗景`,gl.length>0&&vw.length>0);
    z.applyTime(14,'clear'); const d=gl.map(m=>lum(m.color)), dv=vw.map(m=>lum(m.color)); z.applyTime(20,'clear'); const n=gl.map(m=>lum(m.color)), nv=vw.map(m=>lum(m.color));
    check(`${id}：20:00 窗景變暗（窗景本來就有，確認）`,nv.every((v,i)=>v<dv[i]*0.5),`${dv.map(v=>v.toFixed(2))}→${nv.map(v=>v.toFixed(2))}`);
    check(`${id}：20:00 窗玻璃跟著變暗（不到白天的一半）——①臥室窗外晚上還像白天`,n.every((v,i)=>v<d[i]*0.5),`${d.map(v=>v.toFixed(3))}→${n.map(v=>v.toFixed(3))}`);
    z.applyTime(14,'clear'); check(`${id}：回到 14:00 玻璃的顏色和原本一樣`,gl.every((m,i)=>Math.abs(lum(m.color)-d[i])<1e-6)); }
  { const z=await load('us_market'); check('us_market：正式模型接上',!!z.formal);
    if(z.formal){ const vw=mats(z,/^usm_outside_view$/), gl=mats(z,/^ck_glass$/); check('us_market：有門外的景（usm_outside_view）、正面玻璃（ck_glass）',vw.length>0&&gl.length>0);
      z.applyTime(14,'clear'); const d=vw.map(m=>lum(m.emissive)*(m.emissiveIntensity==null?1:m.emissiveIntensity)), dg=gl.map(m=>lum(m.color));
      z.applyTime(20,'clear'); const n=vw.map(m=>lum(m.emissive)*(m.emissiveIntensity==null?1:m.emissiveIntensity)), ng=gl.map(m=>lum(m.color));
      check('us_market：20:00 門外的停車場變暗（自發光不到白天的一半）——②結帳區玻璃外還是白天',n.every((v,i)=>v<d[i]*0.5),`${d.map(v=>v.toFixed(2))}→${n.map(v=>v.toFixed(2))}`);
      check('us_market：20:00 正面玻璃跟著變暗',ng.every((v,i)=>v<dg[i]*0.5),`${dg.map(v=>v.toFixed(3))}→${ng.map(v=>v.toFixed(3))}`);
      const lamp=mats(z,/./).filter(m=>/^GLOW_/.test(m.name||'')&&!vw.includes(m)); z.applyTime(14,'clear'); const l14=lamp.map(m=>m.emissiveIntensity); z.applyTime(20,'clear');
      check('us_market：冷藏櫃、收銀台這些燈照舊整天都亮（20:00 和 14:00 一樣）',lamp.length>0&&lamp.every((m,i)=>m.emissiveIntensity===l14[i]),`${lamp.length} 個`); } }
  { const z=await load('us_lawlib'); check('us_lawlib：正式模型接上',!!z.formal);
    if(z.formal){ const L=US_LAWLIB_LAYOUT, D=L.desk, B=L.bounds; z.group.updateMatrixWorld(true); const bx=re=>{ const b=new THREE.Box3(); z.group.traverse(o=>{ if(o.isMesh&&re.test(o.name)) b.expandByObject(o); }); return b; };
      const S=bx(/^WALL_S_wall$/), W=bx(/^WALL_W_wall$/);
      check('us_lawlib：③服務台背後的南牆在（z '+B.z1+'，蓋住服務台的 x 範圍、高過 2.5 m）',!S.isEmpty()&&Math.abs(S.max.z-B.z1)<0.3&&S.min.x<=D.x0&&S.max.x>=D.x1&&S.max.y>=2.5,JSON.stringify([S.min,S.max].map(v=>v.toArray().map(x=>+x.toFixed(1)))));
      check('us_lawlib：③西牆在（x '+B.x0+'）',!W.isEmpty()&&Math.abs(W.min.x-B.x0)<0.3);
      const sw=z.walls.filter(w=>/^WALL_S_wall/.test(w.name)); const cam=new THREE.PerspectiveCamera(); const P=new THREE.Vector3(-4.9,0,6.0);
      cam.position.set(-1,1.6,3); z.fadeWalls(cam,P); const inOK=sw.length&&sw.every(w=>w.material.opacity===1);
      cam.position.set(0,4,12.8); z.fadeWalls(cam,P); const outFade=sw.every(w=>w.material.opacity<0.5);
      check('us_lawlib：③鏡頭在屋裡（CC 的 desk 角度）南牆不淡出；鏡頭在南牆外（玩家在門口、遊戲鏡頭在後面）才淡出——CC 拍照前要用拍照的鏡頭重算淡出',inOK&&outFade,`${sw.length} 片`); } }
  console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
