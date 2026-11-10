// 總圖 B1 的獨立入口：北側的露天下沉中庭（LIB-B1-OUTSIDE-1110，使用者 2026-11-10 X298「總圖地下室入口應該是獨立 總圖建築物外面左邊有個下樓到一個小中庭到地下一樓 露天的 有B1入口 不是從一樓過去」→ 選擇題「北側」）——不需要瀏覽器。
// 在 Node 建出遊戲真正的校園（Z3.ZONES.campus.build）：
//   1 地面那一大片草地在中庭（Z3.B1C）開洞（ShapeGeometry、有一個洞）
//   2 導航：中庭地面 −4.2；樓梯一階一階（畫面高度和導航同一個算法）；地面上中庭四周站不住（不會掉下去），樓梯口站得住
//   3 從總圖前面（x 80、z −38，地面）走得到 B1 的門前（走樓梯下去，simWalk）；走過去的路上最低到 −4.2
//   4 中庭有「進 B1（24 小時自習室）」→ library_b1（B1 的樓梯間落點）
//   5 B1 的出口「走出去（總圖北側的中庭）」→ campus、落在 Z3.B1C.spawn；大廳門廳那扇門不能走（只能看）
//   6 找路：校園 ↔ B1 直接連（guide3d.js），大廳不再連 B1
// 修改前全部 FAIL（沒有 Z3.B1C）。用法：node tests/lib_b1_court_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','src/data/blackforest_layout.js','src/data/library_b1_layout.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(BLACKFOREST_LAYOUT|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const TREES=[]; { const orig=TK.tree; TK.tree=(...a)=>{ const t=orig(...a); TREES.push(t); return t; }; }   /* 記下校園上每一棵闊葉樹（檢查方案 A 留下的樹）*/

process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const C=Z3.B1C; if(!C){ check('0. 有 Z3.B1C',false); console.log('FAILED 1'); process.exit(1); }
const n=z.nav;
{ const g=[]; z.group.traverse(o=>{ if(o.isMesh&&o.geometry&&o.geometry.type==='ShapeGeometry'){ const p=o.geometry.parameters||{}; const sh=[].concat(p.shapes||[]); if(sh.some(s=>s.holes&&s.holes.length)) g.push(o); } });
  check('1. 地面在中庭開洞（ShapeGeometry 有洞）',g.length>=1,g.length+' 片'); }
{ const fl=n.heightAt((C.x0+C.x1)/2,(C.z0+C.z1)/2), top=n.visualHeightAt(C.x0+0.1,(C.st0+C.st1)/2), mid=n.visualHeightAt((C.x0+C.stx)/2,(C.st0+C.st1)/2), bot=n.visualHeightAt(C.stx-0.05,(C.st0+C.st1)/2);
  check('2. 中庭地面 −4.2；樓梯頂 0、中間約 −2.1、底一階 −4.025',Math.abs(fl+C.dep)<1e-6&&Math.abs(top)<1e-6&&Math.abs(mid+2.1)<0.2&&Math.abs(bot+C.dep-0.175)<1e-6,JSON.stringify({fl,top,mid,bot}));
  const st=(x,zz)=>E.canStand(x,zz,0.3,0); const edge=[[C.x0+3,C.z0-0.4],[C.x1+0.4,(C.z0+C.z1)/2],[C.x0-0.4,(C.st1+C.z1)/2],[C.x0+3,C.z1+0.4]].filter(([x,zz])=>st(x,zz));
  check('2. 地面上中庭四周站不住（北、東、西、南），樓梯口站得住',!edge.length&&st(C.x0-0.6,(C.st0+C.st1)/2),JSON.stringify({edge,mouth:st(C.x0-0.6,(C.st0+C.st1)/2)})); }
{ E.player.lv=0; const r=E.simWalk(80,-38,C.door.x,C.z1-0.9,{lv0:0,lv1:0,dt:1/30,speed:1.6});
  check('3. 從總圖前面（地面）走樓梯下到 B1 的門前',r&&r.ok,JSON.stringify(r).slice(0,300)); }
{ const it=E.interactables.find(i=>i.label==='進 B1（24 小時自習室）');
  check('4. 中庭有「進 B1（24 小時自習室）」→ library_b1、落在 B1 的樓梯間',!!it&&it.exit&&it.exit.to==='library_b1'&&Math.abs(it.exit.spawn.x-LIBRARY_B1_LAYOUT.stairs.spawn.x)<1e-6,JSON.stringify(it)); }
{ const up=LIBRARY_B1_LAYOUT.stairs.up, b1=fs.readFileSync(path.join(ROOT,'src/library_b1_3d.js'),'utf8'), hv=fs.readFileSync(path.join(ROOT,'src/library_hall_v2.js'),'utf8');
  check('5. B1 的出口「走出去（總圖北側的中庭）」→ campus、落點 Z3.B1C.spawn；大廳那扇門只能看',up.to==='campus'&&/北側的中庭/.test(up.label)&&/Z3\.B1C\.spawn/.test(b1)&&/label:'看這扇門',look:'通往 B1 的員工樓梯/.test(hv)&&!/label:BD\.label,exit/.test(hv)); }
{ const gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
  check('6. 找路：校園連 B1、B1 連校園，大廳不連 B1',/campus:\[[^\]]*'library_b1'/.test(gd)&&/library_b1:\['campus'\]/.test(gd)&&!/library_hall:\[[^\]]*'library_b1'/.test(gd)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
