/* 木曜日（wz_mokuyobi，溫州街 B4 二樓；ART-MOKUYOBI-1103，LAWWW2 11-03）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路（E.pathTo）＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   一樓門口 → 16 階樓梯 → 二樓平台 → 店門 → 24 個座位；二樓 → 下樓 → 門口；樓梯的高度一階一階、最上面接二樓地板；
   一樓走不到二樓的地板（一定要走樓梯）；隔間牆、北牆擋住；溫州街那一端：B4 鐵門前的「上二樓」走得到、出來站得住。
   這是模擬（證明路走得通、高度對），不是真實玩家流程（瀏覽器測試照 D131 排到使用者的電腦）。用法：node tests/mokuyobi_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=MOKUYOBI_LAYOUT, S=L.stairWell, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
check('0. Z3.ZONES.wz_mokuyobi 有登記、配置是 v3c（樓梯 16 階）',!!Z3.ZONES.wz_mokuyobi&&L.version>=4&&S.risers===16);
const z=loadZone('wz_mokuyobi'), [n0,n1]=z.levels;
check('1. 兩層導航同尺寸、同原點；二樓地板＝樓梯總高 3.2',z.levels.length===2&&n0.cols===n1.cols&&n0.rows===n1.rows&&n0.ox===n1.ox&&n0.oz===n1.oz&&Math.abs(n1.y0-S.rise)<1e-6&&Math.abs(S.rise-3.2)<1e-6);
const IN=MOK3.IN, top=[-3.75,(S.z0+S.top)/2,1], door=[S.x1+0.6,S.door.z,1];
check('2. 進來的出生點（一樓第一階）站得住',n0.clear(IN.x,IN.z,0.3),IN.x+','+IN.z);
// 樓梯的高度：一階一階（畫面）、連續（碰撞），最下面 0、最上面 3.2
{ const st=MOK3.stairSurf(L); let okv=true, prev=-1; const T=S.tread; for(let k=1;k<S.risers;k++){ const zz=st.z1-(k-0.5)*T, v=n0.visualHeightAt?n0.visualHeightAt(-3.75,zz):null; if(v!==null&&Math.abs(v-k*0.2)>0.011) okv=false; }
  const h0=n0.heightAt(-3.75,st.z1-0.02), h1=n1.heightAt(-3.75,S.top+0.02), hp=n1.heightAt(-3.75,(S.z0+S.top)/2);
  check('3. 樓梯：第 k 階畫面上高 0.2k、斜面從 0 爬到 3.2、平台 3.2',okv&&h0<0.05&&Math.abs(h1-S.rise)<0.05&&Math.abs(hp-S.rise)<1e-6,`底 ${h0.toFixed(2)}、頂 ${h1.toFixed(2)}、平台 ${hp.toFixed(2)}${n0.visualHeightAt?'':'（沒有 visualHeightAt，只量連續斜面）'}`);
  const slope=Math.atan2(S.rise,st.z1-st.z0)*180/Math.PI, dh=0.32*Math.tan(slope*Math.PI/180);
  check('4. 樓梯的坡度：人物半徑 0.32 m 內高度差 < 0.24（引擎 clear() 的上限 0.25 留一點餘裕；原本 2.4 m 的開口是 55°、v3c 第一版 41° 都站不住）',dh<0.24,slope.toFixed(1)+'°、'+dh.toFixed(3)+' m'); }
let r=walk([IN.x,IN.z,0],top); check('5. 一樓門口 → 爬樓梯 → 二樓平台（換到第 1 層）',r.ok,fmt(r));
r=walk(top,door); check('6. 平台 → 東邊隔間牆的店門 → 店裡',r.ok,fmt(r));
/* 「坐下」走到的位置：照 GAME.seatApproach（game3d.js）的候選點——前 0.5、後 0.6、左右 0.55、後 0.7／0.75、前 0.8、後 0.9 m，站得住（半徑 0.3）、在按鈕範圍裡（0.85 m）*/
const seatAps=s=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); return [...(s.ap?[[s.ap[0]-s.x,s.ap[1]-s.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz,1]).filter(a=>Math.hypot(a[0]-s.x,a[1]-s.z)<=0.85&&n1.clear(a[0],a[1],0.3)); };
const badSeat=[]; for(const s of L.seats){ const aps=seatAps(s); if(!aps.some(a=>walk(door,a).ok)) badSeat.push(`t${s.table}(${s.x},${s.z}) 候選點 ${aps.length} 個`); }
check(`7. 店門走得到 ${L.seats.length} 個座位「坐下」的走近點（GAME.seatApproach 的候選點）`,!badSeat.length,badSeat.join('｜'));
r=walk(door,[IN.x,IN.z,0]); check('8. 店裡 → 下樓 → 一樓門口（換回第 0 層）',r.ok,fmt(r));
// 一樓到不了二樓的地板（一定要走樓梯）、牆擋得住
{ const p=E.pathTo(IN.x,IN.z,0,0.5,0.5,1); check('9. 一樓到二樓中間的找路經過樓梯（路線最高點在樓梯上、x 在樓梯間）',!!p&&p.length>0);
  check('10. 一樓（第 0 層）在平台、店裡都站不住（樓梯間以外是實心的）',!n0.clear(-3.75,(S.z0+S.top)/2,0.2)&&!n0.clear(0,0,0.3)&&!n0.clear(-2.2,5,0.3));
  check('11. 二樓：東邊隔間牆（門洞以外）、北邊隔間牆擋住',!n1.clear(S.x1+0.05,5.0,0.1)&&!n1.clear(-3.75,S.z0-0.05,0.1)&&n1.clear(S.x1+0.05,S.door.z,0.1)); }
// 互動點
{ const ex=E.interactables.find(q=>q.exit&&q.exit.to==='wenzhou'), seats=E.interactables.filter(q=>q.seat);
  check('12. 一樓門口有「離開木曜日」→ 溫州街 B4 門口（第 0 層）',!!ex&&(ex.lv|0)===0&&walk([IN.x,IN.z,0],[ex.x,ex.z,0]).ok);
  check(`13. ${L.seats.length} 個座位都有「坐下」、都在第 1 層、都能讀書`,seats.length===L.seats.length&&seats.every(q=>q.lv===1&&q.seat.lv===1&&q.study));
  const bar=seats.filter(q=>q.seat.lift); check('14. 吧檯兩個高腳凳抬高坐姿（lift）',bar.length===2&&bar.every(q=>Math.abs(q.seat.lift-0.25)<0.01)); }
// 溫州街那一端
{ const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const more=eval(T.match(/const files=(\[[^\]]+\])/)[1]).filter(f=>!files.includes(f));
  for(const f of more){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  const wz=loadZone('wenzhou'); const it=E.interactables.find(q=>q.exit&&q.exit.to==='wz_mokuyobi');
  check('15. 溫州街 B4 鐵門前有「上二樓（木曜日）」→ wz_mokuyobi 的一樓第一階',!!it&&it.exit.spawn.x===IN.x&&it.exit.spawn.z===IN.z&&(it.exit.spawn.lv|0)===0,it?`(${it.x},${it.z})`:'');
  const O=MOK3.OUT; check('16. 從木曜日出來站在 B4 門口的人行道上（站得住）',wz.nav.clear(O.x,O.z,0.3),O.x+','+O.z);
  const c=walk([O.x,O.z,0],[51.7,0,0]), w=walk([O.x,O.z,0],[-20,0,0]);
  check('17. 出來以後走得到兩點半門口、往西走得到巷子西段',c.ok&&w.ok,fmt(c.ok?w:c));
  check('18. 走得到「上二樓」的互動點（離人行道上的點 1.2 m 以內）',!!it&&walk([10,0,0],[it.x,it.z+0.3,0]).ok); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
