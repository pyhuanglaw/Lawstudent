// 教學館室內的網格數（≈ 每個畫面的 draw call）——不需要瀏覽器。2026-10-13 LAWWW2 審查：博雅室內空著每個畫面 572–811 次 draw call，
// 每張椅子、桌子各自是網格。做法（src/teach3d.js 的 mergeFurniture）：一層的桌椅合成每種材質一個網格（位置、樣子不變）。
// 檢查：照引擎載入區域的方式（zone.build＋P3.mergeStatic）建出三棟，數看得到的網格；合併沒有丟掉任何三角形（W3.mergeGroup 輸入＝輸出）；
// 座位、互動點數量不變。修改前：博雅 623、普通 556、共同 373 個看得到的網格；修改後：176、144、131。
// 用法：node tests/teach_perf_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; let tag=''; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+tag+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3;
/* 合併前後的三角形數：W3.mergeGroup 包一層，數輸入、輸出 */
const MG=W3.mergeGroup; let mgIn=0, mgOut=0; W3.mergeGroup=function(src){ src.traverse(o=>{ if(o.isMesh) mgIn+=tri(o.geometry); }); const out=MG(src); out.traverse(o=>{ if(o.isMesh) mgOut+=tri(o.geometry); }); return out; };
const LIMIT={boya:260,putong:260,gongtong:220};
for(const id of ['boya','putong','gongtong']){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; mgIn=0; mgOut=0;
  const z=Z3.ZONES[id].build(E); tag='['+z.layout.name+'] '; if(P3.mergeStatic&&!Z3.ZONES[id].noMerge) P3.mergeStatic(z.group);
  let vis=0, tris=0; z.group.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent) if(p.visible===false) return; if(o.material&&o.material.visible===false) return; vis++; tris+=tri(o.geometry); });
  const furn=[]; z.group.traverse(o=>{ if(o.name==='furniture') furn.push(o); });
  check('看得到的網格 ≤ '+LIMIT[id]+'（≈ 每個畫面的 draw call；修改前博雅 623、普通 556、共同 373）',vis<=LIMIT[id],vis+' 個、'+Math.round(tris)+' 個三角形');
  check('桌椅合併成每層幾個網格（「furniture」）',furn.length>=1&&furn.every(g=>g.children.length>=1&&g.children.length<=20),furn.map(g=>g.children.length).join('/'));
  check('合併沒有丟掉任何三角形（輸入＝輸出）',mgIn>0&&Math.abs(mgIn-mgOut)<0.5,`輸入 ${mgIn}、輸出 ${mgOut}`);
  check('座位、互動點照舊',(z.seats||[]).length>0&&E.interactables.filter(i=>i.seat).length===z.seats.length,`座位 ${(z.seats||[]).length}、坐下的互動點 ${E.interactables.filter(i=>i.seat).length}`); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
