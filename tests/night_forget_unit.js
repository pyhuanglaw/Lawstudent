// 換區域時夜間材質、光暈清單要拿掉舊區域的（BUG-MAPBLACK：TK.nightMats／nightSprites 只進不出，舊區域的材質連同 canvas 字牌 atlas 一直留著；
// 瀏覽器量到每進一次校園多一套 2048×512 的 atlas）。engine3d.js 的 disposeGroup → TK.forget；套件快取的材質（matCache）不拿掉。
// 修改前：第 2、3 項失敗。用法：node tests/night_forget_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const zone=()=>{ const g=new THREE.Group(); const cv=document.createElement('canvas'); const tex=new THREE.CanvasTexture(cv);
  const m=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex}); TK.addNight(m,0.95,0); g.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),m));   /* 字牌 atlas 那種：每一區自己的材質 */
  const sp=TK.glowSprite('#ffd9a0',1.4,0,1); g.add(sp);
  const cm=TK.glowMat('unit_shared',tex,{nightI:1}); g.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),cm));   /* 套件快取的材質：下一區還會用到 */
  return {g,m,sp,cm}; };
const n0=TK.nightMats.length, s0=TK.nightSprites.length;
const a=zone(); check('1. 建區域：自己的材質、光暈、快取材質都在夜間清單裡',TK.nightMats.includes(a.m)&&TK.nightSprites.includes(a.sp)&&TK.nightMats.includes(a.cm));
E3.disposeGroup(a.g);
check('2. 換區域（disposeGroup）：這一區自己的材質拿掉（不再留著它的 canvas）',!TK.nightMats.includes(a.m),TK.nightMats.length);
check('3. 光暈也拿掉',!TK.nightSprites.includes(a.sp),TK.nightSprites.length);
check('4. 套件快取的材質留著（下一區還會用到，入夜照樣變亮）',TK.nightMats.includes(a.cm));
for(let i=0;i<5;i++){ const z=zone(); E3.disposeGroup(z.g); }
check('5. 來回 5 次：清單不會越來越長',TK.nightMats.length===n0+1&&TK.nightSprites.length===s0,JSON.stringify([TK.nightMats.length,n0,TK.nightSprites.length,s0]));
const b=zone(); TK.setNight(1); check('6. 新區域入夜照樣變亮（自己的材質、快取材質）',Math.abs(b.m.emissiveIntensity-0.95)<1e-6&&Math.abs(b.cm.emissiveIntensity-1)<1e-6&&b.sp.material.opacity===1,JSON.stringify([b.m.emissiveIntensity,b.cm.emissiveIntensity,b.sp.material.opacity]));
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
