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

const WANT={gg_antai:{points:{cabinet:'看藥品櫃'}},gg_xianguo:{points:{boxes:'看紙箱'}},tz_xile:{points:{guide:'看使用說明'},seats:{c1:'坐著等',c2:'坐著等',c3:'坐著等'}},
  tz_yindehao:{seats:{pc1:'用電腦',pc2:'用電腦'}},gg_rongendian:{points:{easel:'看畫架'}}};
const ALL=Object.values(TZ_SHOPS_LAYOUT).filter(s=>s&&s.zone), byZone={}; for(const s of ALL) byZone[s.zone]=s;
const at=(x,z)=>{ E.player={obj:{position:new THREE.Vector3(x,0,z),rotation:{y:0}},lv:0,radius:0.32}; E.npcs=[]; return E.nearestInteractable(); };
for(const [zid,w] of Object.entries(WANT)){ const L=byZone[zid]; if(!L){ check(zid+'：配置裡有這一間',false); continue; } loadZone(zid); const N=L.name, bad=[];
  for(const [pid,lab] of Object.entries(w.points||{})){ const p=(L.points||[]).find(q=>q.id===pid); if(!p){ bad.push('沒有點 '+pid); continue; } if(p.label!==lab) bad.push(pid+' 字是 '+p.label);
    const it=at(p.x,p.z); if(!it||it.tzPoint!==pid) bad.push('站在 '+pid+' 上按鈕是 '+(it&&(it.label||'?'))); }
  for(const [sid,lab] of Object.entries(w.seats||{})){ const q=(L.seats||[]).find(s=>s.id===sid); if(!q){ bad.push('沒有座位 '+sid); continue; } const ip=q.ap||q;
    const it=at(ip.x,ip.z); if(!it||it.tzSeat!==sid||it.label!==lab) bad.push('站在 '+sid+' 的走近點按鈕是 '+(it&&(it.label+'／'+(it.tzSeat||it.tzPoint)))); }
  for(const p of L.points||[]){ if(w.points&&w.points[p.id]) continue; const it=at(p.x,p.z); if(!it||it.tzPoint!==p.id) bad.push('原本的 '+p.id+' 被搶走（'+(it&&it.label)+'）'); }
  check(N+'：新的點和座位都在、按鈕是它、字對；原本的點沒有被搶走',!bad.length,bad.join('；')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
