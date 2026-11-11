// 118 巷的路人（X68，LANE118-ENC-1020；使用者 2026-10-20：「118 巷也要遇得到人」、15:4x「118 巷常客之外的一般偶遇」）——不需要瀏覽器。
//   原本 118 巷只有常客（AA_280），沒有路人：story3d.js 沒有 walkRoutes.lane118、S.populate 不生路人。
//   1. 在 Node 裡建出遊戲真正的 118 巷（zones3d.js）：walkRoutes.lane118 每一點站得住、每一段用引擎真正的移動走得到（走路、低幀率）；
//   2. S.populate：118 巷 7:00～23:00 有路人，吃飯時間（11:30～13:30、17:30～20:00）比較多。
// 修改前 1、2 FAIL。用法：node tests/lane118_walkers_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/places.js','src/data/lane118_layout.js','src/data/lane118_shops.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|CALENDAR|PLACES|LANE118_LAYOUT|LANE118_SHOPS|L118_SHOP_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.lane118.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=src.match(/const walkRoutes=\{[\s\S]*?lane118:(\[\[\[[\s\S]*?\]\]\]),gongguan/); const R=m?JSON.parse(m[1]):null;
check('1. story3d.js 有 walkRoutes.lane118（兩條）', !!R&&R.length>=2, m?m[1].slice(0,80):'沒有');
if(R){ const bad=[]; for(const [i,rt] of R.entries()) for(let k=0;k<rt.length;k++){ const a=rt[k], b=rt[(k+1)%rt.length]; if(!E.canStand(a[0],a[1],0.32,0)) bad.push(`第 ${i+1} 條 (${a}) 站不住`); for(const [dt,sp] of [[1/30,1.45],[0.1,1.45]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r.ok){ bad.push(`第 ${i+1} 條 ${k}→${(k+1)%rt.length} 走不到`); break; } } }
  check('1. 每一點站得住、每一段走得到（引擎的移動模擬，走路、低幀率）', !bad.length, bad.slice(0,4).join(' | ')); }
{ const pm=src.match(/if\(zoneId==='lane118'\)\{ const meal=\(hr>=11\.5&&hr<13\.5\)\|\|\(hr>=17\.5&&hr<20\); if\(hr>=7&&hr<23\) extras\(meal\?(\d+):(\d+),true\); \}/);
  check('2. S.populate：118 巷 7:00～23:00 有路人、吃飯時間比較多', !!pm&&+pm[1]>+pm[2]&&+pm[2]>0, pm?pm.slice(1).join('/'):'沒有'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
