// GG-SHOPS3 資料補五項（LAWWW 11-11 12:07 決定②；AA_743 對照表 docs/art-rebuild/second_ai/wip/gg_shops6_int_1110/AA_743_對照_1111.md）——只加配置、不改模型：
//   安泰藥局 cabinet「看藥品櫃」、汀州鮮果 boxes「看紙箱」、洗樂洗衣坊 guide「看使用說明」＋塑膠椅「坐著等」、印得好電腦桌兩張圓凳「用電腦」、榮恩典 window（櫥窗畫架）改成現在的畫架「看畫架」。
// 檢查（Node 建出遊戲真正的區域）：配置有這幾個點和座位；站在新的點上，按鈕（E.nearestInteractable）是它；站在座位的走近點，按鈕是那張座位、字是配置寫的；
//   原本的點站在它自己的位置上按鈕照舊是它（新的點沒有搶走）。「走得到」由 tests/tz_shops_unit.js 第 3 項（每一個座位、互動點都走得到）管。
// 修改前（開發分支 f2515c2077）：FAIL。用法：node tests/gg_shops3_points_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
// LAUNDRY-SEAT-PRIO-1114（LAWWW2-C 11-14；BB_379）：洗樂長椅 #1、#2 走到旁邊，按鈕被「兌幣機・洗衣精」「看使用說明」搶走（兩個點離長椅走近點 0.66～0.70 m）。
// 修法：這兩個點 prio −0.3（tz_shops3d.js 把配置的 prio 傳給互動點）。檢查：①長椅走近點和往這兩個點偏 0.15～0.3 m 的地方，按鈕是「坐著等」②站在兌幣機、說明前面，按鈕照樣是它們。
// 用法：node tests/laundry_seat_prio_1114_unit.js
let fails2=0; const ck=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails2++; };
const L=TZ_SHOPS_LAYOUT.xile; loadZone(L.zone);
const near=(x,z)=>{ E.player.obj.position.set(x,0,z); E.player.tapPref=null; const it=E.nearestInteractable(); return it||{}; };
const P=id=>L.points.find(p=>p.id===id);
for(const [sid,pid] of [['c1','change'],['c2','guide'],['c2','change'],['c1','guide']]){ const q=L.seats.find(s=>s.id===sid), ap=q.ap, p=P(pid); const dx=p.x-ap.x, dz=p.z-ap.z, L2=Math.hypot(dx,dz);
  for(const t of [0,0.15,0.3,0.4]){ const x=ap.x+dx/L2*t, z=ap.z+dz/L2*t, it=near(x,z); ck(`長椅 ${sid} 走近點往「${p.label}」偏 ${t} m：按鈕是坐著等`, it.tzSeat===sid||(t>0&&it.tzSeat), JSON.stringify({label:it.label,seat:it.tzSeat,at:[+x.toFixed(2),+z.toFixed(2)]})); } }
for(const pid of ['change','guide']){ const p=P(pid); const it=near(p.x,p.z); ck(`站在「${p.label}」前面：按鈕是它`, it.tzPoint===pid, it.label); }
console.log(fails2?('FAILED '+fails2):'ALL PASS'); process.exit(fails2?1:0);
