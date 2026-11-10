// 新生南路校園那一側的紅磚人行道磚紋（X246，XS-BRICK-WALK-1110；LAWWW2 帳號 A 11-10；LAWWW 派：PBR 磚紋、draw call 不增加，D38 第 6 點）——不需要瀏覽器（D131）。
// 原本是純色 #b77a62 的平面 → Poly Haven CC0 brick_pavement_04 的丁字砌紅磚（tools/blender/env_second/textures/xs_brick_tex.py → assets/textures/campus/brick_red_{diff,nor}.webp）。
// 在 Node 建出新生南路區域，檢查：
//   1 紅磚的地面（近景人行道、遠景兩頭、南端沿圍牆、側門洞裡那一小段）都用同一個 PBR 材質 xs_brick_walk（載到貼圖之前是 #b77a62 純色），沒有剩下純色 #b77a62 的地面
//   2 UV 照世界座標（一張 1.8 m）：每一個紅磚網格的頂點 uv＝(世界 z, 世界 x)／1.8，段與段接得上
//   3 draw call 不增加：遠景的地面照舊照材質合成一個網格——紅磚在遠景只有 1 個網格；整個區域的網格數和修改前一樣（README 記修改前的數字）
//   4 貼圖檔在：程式讀的兩個檔案存在、不是空的
// 修改前（開發分支 48aa47a5b）：1、2、3、4 FAIL。用法：node tests/xs_brick_walk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); console.warn=()=>{};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載（只看程式畫的地面）*/
const z=Z3.ZONES.xinsheng.build(E); z.group.updateMatrixWorld(true);
const OLD=0xb77a62, bricks=[], oldFlat=[]; let meshes=0;
z.group.traverse(o=>{ if(!o.isMesh) return; meshes++; const m=o.material; if(!m) return;
  if(m.name==='xs_brick_walk') bricks.push(o); else if(m.color&&m.color.getHex()===OLD&&!m.map&&o.geometry&&o.geometry.type!=='BoxGeometry') oldFlat.push(o); });
const mats=new Set(bricks.map(o=>o.material));
check('1 紅磚地面都用同一個 PBR 材質 xs_brick_walk，沒有剩下純色 #b77a62 的地面', bricks.length>=3&&mats.size===1&&oldFlat.length===0, `紅磚網格 ${bricks.length}、材質 ${mats.size} 個；剩下的純色 ${oldFlat.length}`);
let bad=0, n=0; const v=new THREE.Vector3();
for(const o of bricks){ const p=o.geometry.attributes.position, uv=o.geometry.attributes.uv; for(let i=0;i<p.count;i+=Math.max(1,Math.floor(p.count/40))){ v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld); n++; if(Math.abs(uv.getX(i)-v.z/1.8)>1e-3||Math.abs(uv.getY(i)-v.x/1.8)>1e-3) bad++; } }
check('2 UV 照世界座標（uv＝(z, x)／1.8，段與段接得上）', bricks.length>0&&n>0&&bad===0, `查了 ${n} 個頂點、不對的 ${bad}`);
const far=[]; z.group.traverse(o=>{ if(o.name==='xs_far_ground') o.traverse(q=>{ if(q.isMesh&&q.material&&q.material.name==='xs_brick_walk') far.push(q); }); });
check('3 draw call 不增加：遠景的紅磚合成 1 個網格；整個區域的網格數照舊（修改前的數字記在 README）', far.length===1, `遠景紅磚網格 ${far.length}；整個區域的網格 ${meshes}`);
const src=fs.readFileSync(path.join(ROOT,'src/xinsheng3d.js'),'utf8'), urls=[...src.matchAll(/'(assets\/textures\/campus\/brick_red_[a-z]+\.webp)'/g)].map(m=>m[1]);
const ok4=urls.length===2&&urls.every(u=>fs.existsSync(path.join(ROOT,u))&&fs.statSync(path.join(ROOT,u)).size>1000);
check('4 程式讀的紅磚貼圖（diff、nor）都在、不是空的', ok4, JSON.stringify(urls));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
