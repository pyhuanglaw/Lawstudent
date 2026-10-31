// 階梯教室、教室的座位：「坐下前站的位置」（GAME.seatApproach）一定在那張椅子「坐下」按鈕的範圍裡（BUG-SEAT-AISLE-REACH-1031，BB-B 10-31 n28_seatreach）——不需要瀏覽器。
//   原本走道邊的座位挑側邊 0.55 m 那一點（走道上），離互動點（椅子後面 0.35 m）0.65 m、範圍 0.62 m：玩家點椅子走過去以後沒有「坐下」。共同 101 七個、博思 101／102 四個。
//   用 nav_teach_unit 同一套 Node 建區域（共同、博思、普通；建好以後照遊戲跑 fitSeatRadius），按鈕範圍和 nearestInteractable 一樣用「小於」；把 game3d.js 的 seatApproach 原文拿出來、接上這裡的引擎；玩家站在大門出生點。修改前 FAIL。
// 用法：node tests/seat_approach_reach_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|LL3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), i0=g.indexOf('function seatApproach('), i1=g.indexOf("return best||[seat.x+fx*0.5,seat.z+fz*0.5]; }",i0);
check('0. game3d.js 有 seatApproach',i0>0&&i1>i0);
const seatApproach=new Function('E',g.slice(i0,i1)+"return best||[seat.x+fx*0.5,seat.z+fz*0.5]; }\nreturn seatApproach;")(E);
for(const [id,L] of [['gongtong',GONGTONG_LAYOUT],['boya',BOYA_LAYOUT],['putong',PUTONG_LAYOUT]]){ const z=loadZone(id), SP=L.entrance.spawn; E.fitSeatRadius();   /* 和遊戲一樣：區域建好以後放大碰不到的座位範圍（engine3d.js fitSeatRadius）*/ E.player.obj.position.set(SP.x,0,SP.z); E.player.lv=0;
  const its=E.interactables.filter(it=>it.seat&&!it.hidden), bad=[];
  for(const it of its){ const ap=seatApproach(it.seat); const d=Math.hypot(ap[0]-it.x,ap[1]-it.z); if(!(d<(it.radius||1.8))) bad.push({seat:[+it.seat.x.toFixed(2),+it.seat.z.toFixed(2)],ap:[+ap[0].toFixed(2),+ap[1].toFixed(2)],d:+d.toFixed(2),r:it.radius}); }
  check('['+L.name+'] '+its.length+' 個座位：坐下前站的位置都在「坐下」按鈕範圍裡',its.length>0&&bad.length===0,bad.length+' 個超出：'+JSON.stringify(bad.slice(0,4))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
