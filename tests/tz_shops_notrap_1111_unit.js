// 六間店＋禮貌生財的室內：站得到的每一個地方都走得回門口、出得了店（BUG-XIANGUO-TRAP-1111，LAWWW 2026-11-11）
// 起因：BB／CC 11-11 在使用者電腦重現——汀州鮮果第 2 版多了三處箱子堆，中間兩堆之間留了 0.7 m 的縫：導航格是空的、人（半徑 0.32）站不進去，
//   找路選這條縫、人卡在縫口（0.35,−1.61），點地板、搖桿 121 秒出不去。原本的 tz_shops_unit 只測「座位、互動點走得到」，沒有測「任何站得到的地方都出得來」。
// 做法：在 Node 建出遊戲真正的區域，從進門的位置用 E.canStand（玩家半徑）每 0.25 m 掃出所有走得到的點，
//   每一個點都用引擎真正的找路＋移動碰撞（E.simWalk，走路、兩種幀率）走到「離開」的互動點：停下來的地方要在互動半徑裡。
// 這是模擬，不是真實玩家流程（D131）。用法：node tests/tz_shops_notrap_1111_unit.js
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
const SHOPS=Object.values(TZ_SHOPS_LAYOUT).map(s=>s&&(s.zone||s.id)).filter(id=>id&&Z3.ZONES[id]);
check('0. 配置裡的室內都有區域（至少七間）',SHOPS.length>=7,SHOPS.join());
const STEP=0.25, R=0.32;
for(const id of SHOPS){ const z=loadZone(id), nav=z.nav, sp=z.spawn, ex=E.interactables.find(i=>i.exit);
  const X0=nav.ox, Z0=nav.oz, W=nav.cols*nav.cell, D=nav.rows*nav.cell, key=(i,j)=>i+','+j;
  const ok=(i,j)=>{ const x=X0+i*STEP, zz=Z0+j*STEP; return x>X0&&zz>Z0&&x<X0+W&&zz<Z0+D&&E.canStand(x,zz,R,0); };
  const si=Math.round((sp.x-X0)/STEP), sj=Math.round((sp.z-Z0)/STEP); let start=null;
  for(let d=0;d<4&&!start;d++) for(let a=-d;a<=d&&!start;a++) for(let b=-d;b<=d&&!start;b++) if(ok(si+a,sj+b)) start=[si+a,sj+b];
  if(!start||!ex){ check(id+'：進門的位置站得住、有「離開」',false,JSON.stringify([sp,ex&&ex.label])); continue; }
  const seen=new Set([key(...start)]), q=[start]; while(q.length){ const [i,j]=q.pop(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=key(i+a,j+b); if(!seen.has(k)&&ok(i+a,j+b)){ seen.add(k); q.push([i+a,j+b]); } } }
  const pts=[...seen].map(k=>k.split(',').map(Number)).map(([i,j])=>[+(X0+i*STEP).toFixed(2),+(Z0+j*STEP).toFixed(2)]);
  const bad=[]; for(const p of pts) for(const dt of [0.1,0.033]){ const r=E.simWalk(p[0],p[1],ex.x,ex.z,{lv0:0,lv1:0,dt,speed:1.45}); const end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?[ex.x,ex.z]:null);
    if(!end||Math.hypot(end[0]-ex.x,end[1]-ex.z)>ex.radius+1e-6){ bad.push([p[0],p[1],dt,end&&end.map(v=>+v.toFixed(2)),r&&r.reason]); break; } }
  check(id+'：站得到的 '+pts.length+' 個點（每 '+STEP+' m）都走得回「'+ex.label+'」的半徑裡（走路、30 fps 和 10 fps）',pts.length>40&&!bad.length,bad.length+' 個出不來：'+JSON.stringify(bad.slice(0,6))); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
