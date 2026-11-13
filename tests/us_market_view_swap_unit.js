// 美國兩間超市的窗景白天／晚上換照片（SHOP-INTERIOR-VIEW-1112，LAWWW-C 11-13；店面標準 §12 第 2 點）：不需要瀏覽器。
// 在 Node 載入程式、接上真的正式模型（GLB 貼圖拿掉），檢查草原超市（usm_outside_view）、竹葉亞洲超市（usam_view）的窗景卡：
//   中午是 views/<區>_day.webp、晚上（<6 或 ≥18.8）是 _night.webp；夜版不被 viewTint 調暗兩次；竹葉的 alphaTest 留著；照片載入失敗退回模型原本那張＋調暗。
// 用法：node tests/us_market_view_swap_unit.js
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
const VIEWS={us_market:/^usm_outside_view$/, us_asian_market:/^usam_view/};
(async()=>{
  check('US3.US_VIEW 有兩間超市',!!(US3.US_VIEW&&US3.US_VIEW.us_market&&US3.US_VIEW.us_asian_market));
  for(const id of ['us_market','us_asian_market']){ const e=US3.US_VIEW[id][0];
    check(`${id}：照片在 views/（${id}_day／_night.webp）`,e.day===`assets/models/env/views/${id}_day.webp`&&e.night===`assets/models/env/views/${id}_night.webp`&&fs.existsSync(path.join(ROOT,e.day))&&fs.existsSync(path.join(ROOT,e.night)));
    const z=await load(id); check(`${id}：正式模型接上`,!!z.formal); if(!z.formal) continue;
    const vw=mats(z,VIEWS[id]), sw=vw.filter(m=>m.userData.wvOwn); check(`${id}：窗景卡換成自己的材質（wvOwn）`,vw.length>0&&sw.length===vw.length,`${sw.length}/${vw.length}`);
    const url=m=>(m.map&&m.map.userData&&m.map.userData.url)||'';
    z.applyTime(12,'clear'); const noon=sw.every(m=>url(m)===e.day), c12=sw.map(m=>lum(m.color));
    check(`${id}：12:00 白天的照片`,noon,sw.map(url).join(','));
    for(const h of [21,3,18.9]){ z.applyTime(h,'clear'); check(`${id}：${h}:00 夜版照片`,sw.every(m=>url(m)===e.night),sw.map(url).join(',')); }
    z.applyTime(18.5,'clear'); check(`${id}：18:30 還是白天的照片（18.8 才換）`,sw.every(m=>url(m)===e.day));
    z.applyTime(21,'clear'); check(`${id}：21:00 夜版照片不再被 viewTint 調暗（顏色、自發光強度和中午一樣）`,sw.every((m,i)=>Math.abs(lum(m.color)-c12[i])<1e-6&&lum(m.color)>0.99&&m.emissiveIntensity===m.userData.ei0));
    if(id==='us_asian_market'){ check(`${id}：窗景卡照舊 alphaTest 0.5（照片不透明全通過；照片載入失敗退回原圖時天空照舊挖空）`,sw.every(m=>m.alphaTest===0.5&&m.transparent===false));
      const gl=mats(z,/./).filter(m=>/^(ck_glass|usam_door_glass)$/.test(m.name||"")); z.applyTime(14,'clear'); const d=gl.map(m=>lum(m.color)); z.applyTime(21,'clear'); const n=gl.map(m=>lum(m.color));
      check(`${id}：正式模型接上以後的設定有跑完（原本 glass 沒宣告＝ReferenceError）：玻璃晚上跟著變暗`,gl.length>0&&n.every((v,i)=>v<d[i]*0.5),`${d.map(v=>v.toFixed(2))}→${n.map(v=>v.toFixed(2))}`); }
    /* 照片載入失敗：退回模型原本那張（這裡 GLB 拿掉了貼圖＝null）、晚上照舊調暗 */
    const keep=sw.map(m=>[m.map,m.userData.wvMap0]); for(const m of sw){ m.map.userData.failed=true; }
    z.applyTime(21,'clear'); check(`${id}：照片載入失敗→換回模型原本的貼圖、晚上調暗`,sw.every(m=>m.map===m.userData.wvMap0&&lum(m.color)<0.5));
    for(const [t] of keep) if(t&&t.userData) t.userData.failed=false; }
  console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
