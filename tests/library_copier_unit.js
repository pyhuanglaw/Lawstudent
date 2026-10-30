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
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
// 跑步（點的地方超過 16 m 時玩家用跑的，4.1 m/s）＋低幀率（dt 0.1，手機或模擬器卡的時候）：一步 0.41 m。2026-10-11 萬才館大樓梯真實流程：走下樓梯停在最下面一兩階
//（轉折點前後來回跳、換層時拿畫面上一階一階的高度比，跨一大步就換不回地面那一層）。走路速度、30 fps 都抓不到
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:4.1}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const fmt=(r)=>JSON.stringify(r).slice(0,220);

function islands(n,lv){ const a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1); const minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]);
  const h=0.1, W=Math.floor((maxx-minx)/h)+1, H=Math.floor((maxz-minz)/h)+1; const S=new Uint8Array(W*H);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++) S[j*W+i]=E.canStand(minx+i*h,minz+j*h,0.3,lv)?1:0;
  const lab=new Int32Array(W*H).fill(-1), q=new Int32Array(W*H), comps=[];
  for(let s=0;s<W*H;s++){ if(!S[s]||lab[s]>=0) continue; let qh=0,qt=0; q[qt++]=s; lab[s]=comps.length; let cnt=0,sx=0,sz=0;
    while(qh<qt){ const c=q[qh++]; cnt++; const ci=c%W, cj=(c/W)|0; sx+=ci; sz+=cj; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di,nj=cj+dj; if(ni<0||nj<0||ni>=W||nj>=H) continue; const t=nj*W+ni; if(S[t]&&lab[t]<0){ lab[t]=comps.length; q[qt++]=t; } } }
    comps.push({n:cnt,x:+(minx+sx/cnt*h).toFixed(2),z:+(minz+sz/cnt*h).toFixed(2)}); }
  comps.sort((p,q)=>q.n-p.n); return comps; }
{ const z=loadZone('library_hall'); const sp=z.spawn||{x:0,z:6.6};
  const F=LIBRARY_LAYOUT.furniture.find(f=>f.type==='copier'); check('配置有影印機', !!F, JSON.stringify(F&&[F.x,F.z,F.ry,F.nav]));
  check('影印機的位置擋住（中心）', !E.canStand(F.x,F.z,0.05,0));
  for(const p of [[10.35,2.35],[10.35,1.75]]) check('影印機前的站位站得住 '+JSON.stringify(p), E.canStand(p[0],p[1],0.32,0));
  for(const p of [[10.35,2.35],[10.35,1.75]]){ const r=both([sp.x,sp.z,0],[p[0],p[1],0]); check('從入口走到影印機前 '+JSON.stringify(p), r.ok, fmt(r)); }
  const desk=E.interactables.find(i=>i.label==='服務台'); const r2=both([sp.x,sp.z,0],[desk.x,desk.z,0]); check('服務台的點照樣走得到', r2.ok, fmt(r2));
  const ev=E.interactables.find(i=>i.elevator&&(i.lv|0)===0); const r3=both([sp.x,sp.z,0],[ev.x,ev.z,0]); check('一樓電梯的點照樣走得到', r3.ok, fmt(r3));
  const c=islands(E.levels?E.levels[0]:E.nav,0); check('一樓沒有小孤島（只有一塊可站的地方，或其他塊都很大）', c.slice(1).every(q=>q.n>200), '區塊 '+c.length+'：'+JSON.stringify(c.slice(0,4)));
}
console.log(fails?('FAILED '+fails):'ALL PASS');