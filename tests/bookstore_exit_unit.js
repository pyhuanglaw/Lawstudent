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

{ const z=loadZone('bookstore'); const sp=z.spawn||{x:0,z:4};
  const pick=(x,zz)=>{ E.player={obj:{position:new THREE.Vector3(x,0,zz)},lv:0,radius:0.32}; E.npcs=[]; const it=E.nearestInteractable(); return it?it.label:'（沒有）'; };
  const exitIt=E.interactables.find(i=>i.exit||/離開/.test(i.label||'')), shop=E.interactables.find(i=>i.shop==='book');
  check('出口、櫃台都在', !!exitIt&&!!shop, JSON.stringify({exit:exitIt&&[exitIt.x,exitIt.z,exitIt.radius], shop:shop&&[shop.x,shop.z,shop.radius]}));
  check('落腳點站得住', E.canStand(sp.x,sp.z,0.32,0), JSON.stringify(sp));
  // 門口一整條（站得住的點）：都是「離開書店」
  let bad=[], n=0; for(let x=-2.2;x<=2.2+1e-9;x+=0.1) for(let zz=3.6;zz<=4.2;zz+=0.05){ if(!E.canStand(x,zz,0.32,0)) continue; if(Math.hypot(x-exitIt.x,zz-exitIt.z)>=exitIt.radius) continue; n++; const l=pick(x,zz); if(l!==exitIt.label) bad.push([+x.toFixed(2),+zz.toFixed(2),l]); }
  check('出口範圍裡站得住的點（門口那一條）都是「'+exitIt.label+'」', bad.length===0&&n>0, n+' 點；不是的：'+JSON.stringify(bad.slice(0,6)));
  check('落腳點 (0,4) 是「'+exitIt.label+'」', pick(sp.x,sp.z)===exitIt.label, pick(sp.x,sp.z));
  // 櫃台：桌子東端站得住、走得到、按鈕是買書
  check('櫃台的點站得住', E.canStand(shop.x,shop.z,0.32,0));
  const r=both([sp.x,sp.z],[shop.x,shop.z]); check('從門口走到櫃台（模擬走路，30 fps＋低幀率）', r.ok, fmt(r));
  check('站在櫃台的點：「'+shop.label+'」', pick(shop.x,shop.z)===shop.label, pick(shop.x,shop.z));
  let m=0, good=0; for(let x=1.4;x<=2.4;x+=0.05) for(let zz=2.6;zz<=3.9;zz+=0.05){ if(!E.canStand(x,zz,0.32,0)) continue; if(Math.hypot(x-shop.x,zz-shop.z)>=shop.radius) continue; m++; if(pick(x,zz)===shop.label) good++; }
  check('櫃台範圍裡站得住的點都是買書', m>0&&good===m, good+'／'+m);
}
console.log(fails?('FAILED '+fails):'ALL PASS');