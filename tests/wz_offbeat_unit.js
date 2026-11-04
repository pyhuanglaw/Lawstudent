/* 日常失速（wz_offbeat，溫州街 W2 一樓；WZ-OFFBEAT-1104，LAWWW2 11-04；AA_617、AA_618）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   店裡：出生點 → 32 個座位「坐下」的走近點、→ 門口「離開日常失速」；吧檯四張高腳凳抬高坐姿；座位不能讀書（使用者 11-03「吃飯打屁桌遊」）；
   溫州街：主巷、新生南路那一頭 → 店門「進去日常失速」；出來站得住、不在店門的範圍裡；門口 A 字立牌（正式模型的雜物）擋住、不擋店門。
   這是模擬（路走得通），不是真實玩家流程（瀏覽器測試照 D131 排到使用者的電腦）。用法：node tests/wz_offbeat_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js'];   /* 新生南路：溫州街西側橫巷的北口要打開（index.html 的順序）*/
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=DAILY_OFFBEAT_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
check('0. Z3.ZONES.wz_offbeat 有登記；配置的 exit、enterAt 填好了；正式模型登錄 bldg.wz_offbeat_interior',!!Z3.ZONES.wz_offbeat&&!!L.exit&&!!L.enterAt&&!!(ASSETS.manifest['bldg.wz_offbeat_interior']&&fs.existsSync(path.join(ROOT,ASSETS.manifest['bldg.wz_offbeat_interior'].url))));
const z=loadZone('wz_offbeat'), nav=z.nav; E.fitSeatRadius(); const its=E.interactables.slice();   /* 進區域時引擎會把站不到的座位按鈕範圍放大（engine3d.js fitSeatRadius，最大 1.3）：照遊戲做 */
const SP=z.spawn||L.spawn, ex=its.find(q=>q.exit&&q.exit.to==='wenzhou');
check('1. 出生點站得住、不在「離開日常失速」的範圍裡（半徑＋0.2）',nav.clear(SP.x,SP.z,0.3)&&!!ex&&Math.hypot(ex.x-SP.x,ex.z-SP.z)>(ex.radius||1.8)+0.2,`(${SP.x},${SP.z})，離出口 ${ex?Math.hypot(ex.x-SP.x,ex.z-SP.z).toFixed(2):'?'} m`);
check('2. 出生點 → 門口的「離開日常失速」走得到',!!ex&&walk([SP.x,SP.z],[ex.x,ex.z-0.3]).ok);
/* 「坐下」走到的位置：照 GAME.seatApproach（game3d.js）的候選點，而且要在那張椅子「坐下」按鈕的範圍裡（範圍 − 0.05；BUG-SEAT-AISLE-REACH-1031）*/
const seatAps=(s,reach)=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); return [...(s.ap?[[s.ap[0]-s.x,s.ap[1]-s.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz]).filter(a=>Math.hypot(a[0]-s.x,a[1]-s.z)<=reach&&nav.clear(a[0],a[1],0.3)); };
const seats=its.filter(q=>q.seat), bad=[];
for(const q of seats){ const aps=seatAps(q.seat,(q.radius||1.8)-0.05); if(!aps.some(a=>walk([SP.x,SP.z],a).ok)) bad.push(`(${q.seat.x},${q.seat.z}) 範圍 ${q.radius.toFixed(2)}、候選點 ${aps.length} 個`); }
check(`3. ${L.seats.length} 個座位都有「坐下」，出生點都走得到「坐下」的走近點`,seats.length===L.seats.length&&!bad.length,bad.join('｜'));
const bar=seats.filter(q=>q.seat.lift);
check('4. 吧檯四張高腳凳抬高坐姿（lift 0.27，座面 0.72）；座位都不能讀書',bar.length===4&&bar.every(q=>Math.abs(q.seat.lift-0.27)<0.01)&&seats.every(q=>!q.study));
// 溫州街那一端
const wz=loadZone('wenzhou'), wnav=wz.nav, wits=E.interactables.slice();
const en=wits.find(q=>q.exit&&q.exit.to==='wz_offbeat');
check('5. 溫州街 W2 店門前有「進去日常失速」→ 出生點',!!en&&en.exit.spawn.x===SP.x&&en.exit.spawn.z===SP.z,en?`(${en.x},${en.z})`:'');
const O=L.exit.spawn;
check('6. 出來站得住（半徑 0.3）、不在「進去日常失速」的範圍裡',wnav.clear(O.x,O.z,0.3)&&!!en&&Math.hypot(en.x-O.x,en.z-O.z)>(en.radius||1.8)+0.2,`(${O.x},${O.z})`);
Z3.propBlocks(wnav,Z3.PROP_BLOCKS.wenzhou);   // 正式模型載入以後才擋的雜物（門口的 A 字立牌）
const near=p=>[[0,0],[0.4,0],[0,0.4],[0,-0.4],[0.6,0.3],[0.6,-0.3]].map(([dx,dz])=>[p[0]+dx,p[1]+dz]).find(q=>wnav.clear(q[0],q[1],0.3));
const ep=near([en.x+0.2,en.z]);
check('7. 正式模型的雜物擋上以後：A 字立牌那一格站不住、店門的互動點旁邊站得住',!wnav.clear(-36.78,-8.5,0.2)&&!!ep&&Math.hypot(ep[0]-en.x,ep[1]-en.z)<en.radius,ep?ep.join(','):'');
const r1=walk([-20,0],ep), r2=walk([-33.4,-27.0],ep), r3=walk([O.x,O.z],[-20,0]);
check('8. 主巷 (−20, 0)、新生南路那一頭的橫巷 (−33.4, −27) → 店門走得到；出來走得回主巷',r1.ok&&r2.ok&&r3.ok,fmt(!r1.ok?r1:(!r2.ok?r2:r3)));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
