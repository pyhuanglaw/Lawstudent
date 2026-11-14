// 多樓層建築的導航（第一層＋第二層，不需要瀏覽器；v9.4 第一批，D36）：在 Node 裡建出遊戲真正的區域（校園、霖澤館、201 階梯教室），
// 用引擎真正的找路（E.pathTo）＋移動碰撞（stepEntity，模擬時間 dt=1/30 與 0.1，人物半徑 0.32 m）走每一段路：
//   校園：廣場 → 前台階 → 穿堂 → 大廳門口；穿堂 → 後台階 → 後面的小廣場；穿堂裡站得住、高度 0.9
//   霖澤館：入口 → 大廳 → 樓梯 → 二樓 → 201 教室門；二樓 → 樓梯 → 入口；電梯門關著不能走進車廂、門開著可以
//   201 教室：門口（最上面）→ 每一個座位（48 個）「坐下」走到的位置（GAME.seatApproach 的規則：椅子後面 0.6 m、同一排的平台）→ 回到門口
//   萬才館室內（第三階段，D42）：一樓大廳的舊座標（劇情、社團、助教、舊存檔）站得住、走得到；入口 → 樓梯（往南爬）→ 二樓門廳；二樓 → 一樓；電梯；二樓的邊不能跳下去
//   總圖大廳（D43）：入口 → 閘門 → 帝國式大樓梯 → 二樓自習區／東側；二樓 → 一樓；跑步＋低幀率；電梯（含往閱覽室的樓層）；座位、劇情座位；閱覽室的電梯與樓梯間
// 這是模擬（證明路走得通、高度對），不是真實玩家流程；真實流程在 tests/flow_linze_floors.py。
// 用法：node tests/nav_buildings_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('nofetch'));
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }


// L118-SEAT-FIX r5（LAWWW2-C 11-14；BB_379 60408a64fd）：engine3d.js nearestInteractable——畫面上點到的那張椅子（tapPref.seat）範圍多 TAP_SEAT_PICKED（1.5 m），走到半路被擋停下也是點的那張。
// 用法：node tests/l118_seat_tap_picked_1114_unit.js
// CC L118_CAM36_b／c_r4（d8d3a61b5e）：點看得到的椅子，走過去停在這裡（at），最近的「坐下」是同桌隔壁那一張
const CASES=[['l118_korea',[0.65,-1.86],[0.549,-2.325]],['l118_korea',[0.65,0.09],[1.072,-0.328]],['l118_korea',[0.65,2.04],[1.21,1.61]],['l118_korea',[-2,0.09],[-2.425,-0.321]],
  ['l118_omu',[-2.9,0.34],[-2.174,-0.788]],['l118_omu',[2.92,-0.74],[1.57,-2.075]],['l118_omu',[2.28,-0.06],[1.578,-1.18]],['l118_omu',[2.28,1.26],[1.55,1.476]],['l118_omu',[2.28,1.94],[1.58,0.809]],
  ['l118_pasta',[-3.42,-0.82],[-3.078,-1.909]],['l118_pasta',[-2.9,-0.82],[-3.063,-1.915]]];
const near=(at,tp)=>{ E.player={obj:{position:new THREE.Vector3(at[0],0,at[1]),rotation:{y:0}},radius:0.32,lv:0,tapPref:tp}; E.npcs=[]; const it=E.nearestInteractable(); return it&&it.seat?[it.seat.x,it.seat.z]:(it?it.label:null); };
let cur=null;
for(const [zid,seat,at] of CASES){ if(cur!==zid){ loadZone(zid); cur=zid; }
  const tp={x:seat[0],z:seat[1],lv:0,zone:E.zone.id,seat:true}; const r=near(at,tp);
  check(zid+' 點 ('+seat+') 停在 ('+at+')：按鈕是點的那一張', Array.isArray(r)&&Math.abs(r[0]-seat[0])<0.01&&Math.abs(r[1]-seat[1])<0.01, JSON.stringify(r)); }
// 點地板（不是點椅子，seat:false）：和沒有這次修改（TAP_SEAT_PICKED＝0）一模一樣
for(const [zid,at,tpx,tpz] of [['l118_omu',[1.55,-1.18],1.55,0.6],['l118_korea',[1.2,-0.5],1.2,1.0],['l118_pasta',[-2.25,-0.44],-2.6,-1.4]]){ loadZone(zid);
  const tp={x:tpx,z:tpz,lv:0,zone:E.zone.id,seat:false}; const a=near(at,tp); const keep=E.TAP_SEAT_PICKED; E.TAP_SEAT_PICKED=0; const b=near(at,tp); E.TAP_SEAT_PICKED=keep;
  check(zid+' 點地板 ('+tpx+','+tpz+')、人在 ('+at+')：按鈕和改之前一樣', JSON.stringify(a)===JSON.stringify(b), JSON.stringify(a)+' / '+JSON.stringify(b)); }
// 太遠：點的椅子離人 4 m 以上，不搶
loadZone('l118_omu'); { const r=near([-2.2,2.5],{x:2.92,z:-0.74,lv:0,zone:E.zone.id,seat:true}); check('l118_omu 點 (2.92,-0.74) 但人還在門口 (−2.2,2.5)：不是那一張', !(Array.isArray(r)&&r[0]===2.92&&r[1]===-0.74), JSON.stringify(r)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
