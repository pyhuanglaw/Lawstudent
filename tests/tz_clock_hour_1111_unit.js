// 汀州路夜市、公館三攤、禮貌生財：營業／收攤照「時鐘」，不照引擎傳進來的光線時間（LAWWW 2026-11-11）
// 起因：BB／CC 11-10 看到「攤子的模型是開著的、按下去是收攤那一句」。
//   引擎 E.applyTime(hour) 呼叫 zone.applyTimeOutdoor(h,E) 的 h 是 lightHour（照日落時間拉過的光線時間）：
//   冬天（日落 17:05）時鐘 17:30 的 h≈19.2，原本拿 h 判營業＝玉米（18:00 開）、套圈圈、禮貌生財（19:00 開）的模型提早一個多小時開，
//   可是買東西（night_market3d.js）照時鐘＝還沒開。改成 TZ3.clockHour(h,E)：有引擎就用 E.hour（時鐘），沒有（測試、NM3.openNow 傳 null）h 就是時鐘。
// 另外：攤位模型載入完重新套時間要帶鐘點（原本 E.applyTime() 不帶參數＝E.hour 變 undefined）。
// 用法：node tests/tz_clock_hour_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const L=TINGZHOU_LAYOUT;
const mk=()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; return E; };

check('1. TZ3.clockHour：有引擎用 E.hour（時鐘，超過 24 折回來）、沒有引擎或 E.hour 不是數字就用 h',
  TZ3.clockHour(19.2,{hour:17.5})===17.5&&TZ3.clockHour(19.2,{hour:41.5})===17.5&&TZ3.clockHour(19.2,null)===19.2&&TZ3.clockHour(19.2,{})===19.2&&TZ3.clockHour(19.2,{hour:NaN})===19.2);

/* 冬天的光線時間：時鐘 17:30（日落 17:05）→ lightHour≈19.2 */
const lh=E3.lightHour(17.5,17.08);
check('2. 前提：冬天時鐘 17:30 的光線時間超過 19（引擎真的會傳比時鐘晚的 h）',lh>19&&lh<19.5,lh.toFixed(2));

{ const E=mk(), z=Z3.ZONES.tingzhou.build(E), ST=z.tzStalls;
  const late=ST.filter(q=>!TZ3.stallOpen(17.5,q,L)&&TZ3.stallOpen(lh,q,L));   /* 17:30 還沒開、可是照光線時間會開的攤 */
  z.applyTimeOutdoor(lh,{hour:17.5,hemi:{intensity:1}});
  const wrong=late.filter(q=>q.isOpen).map(q=>q.kind), all=ST.filter(q=>q.isOpen!==TZ3.stallOpen(17.5,q,L)).map(q=>q.kind);
  check('3. 汀州路：引擎傳光線時間 '+lh.toFixed(2)+'、時鐘 17:30 → 每一攤的 isOpen 照時鐘（這個時段有 '+late.length+' 攤兩種算法不一樣，都沒有提早開）',late.length>0&&!wrong.length&&!all.length,'提早開：'+wrong.join()+'｜不一致：'+all.join());
  const lm=z.tzLimao;
  if(lm&&L.limao){ const before=lm.open; z.applyTimeOutdoor(E3.lightHour(18.5,17.08),{hour:18.5,hemi:{intensity:1}}); const at1830=lm.open; z.applyTimeOutdoor(E3.lightHour(19.5,17.08),{hour:19.5,hemi:{intensity:1}}); const at1930=lm.open;
    check('4. 禮貌生財（'+L.limao.from+' 點開）：冬天時鐘 17:30、18:30 都還關著（原本照光線時間 17:11 就開）、19:30 開',before===false&&at1830===false&&at1930===true,[before,at1830,at1930].join(' / ')); }
  else check('4. 禮貌生財有 zone.tzLimao',false);
  z.applyTimeOutdoor(20,null); const n20=ST.filter(q=>q.isOpen).length;
  check('5. 沒傳引擎（測試、NM3.openNow）：h 就是時鐘，20:00 有攤開著',n20>0,String(n20)); }

{ const E=mk(), g=Z3.ZONES.gongguan.build(E), gs=g.ggStalls||[];
  const late=gs.filter(q=>!TZ3.stallOpen(14.5,q,L)&&TZ3.stallOpen(16.5,q,L));
  g.applyTimeOutdoor(16.5,{hour:14.5,hemi:{intensity:1},roadMats:[]}); const bad=gs.filter(q=>q.isOpen!==TZ3.stallOpen(14.5,q,L)).map(q=>q.kind);
  check('6. 公館三攤也照時鐘（引擎傳 16.5、時鐘 14:30 → 照 14:30 算；這個時段有 '+late.length+' 攤兩種算法不一樣）',gs.length===3&&!bad.length,bad.join()); }

{ const src=fs.readFileSync(path.join(ROOT,'src/tingzhou3d.js'),'utf8');
  check('7. 模型載入完重新套時間都帶鐘點：沒有不帶參數的 E.applyTime()',!/E\.applyTime\(\s*\)/.test(src)&&(src.match(/E\.applyTime\(E\.hour\)/g)||[]).length>=2); }

console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
