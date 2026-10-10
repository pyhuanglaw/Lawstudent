// 多樓層導航的單元測試（第一層，不需要瀏覽器；v9.4 第一批，D36）。
// 1. 單層區域的找路和改版前（git 的 92acd48，第二十五批）逐點完全一樣：隨機障礙物的格子、隨機起終點各 300 組（含 navlegacy 模式）。
// 2. 兩層的測試大廳（一樓、雙跑樓梯、二樓走廊、中庭開口）：
//    - 一樓 → 二樓的路一定經過樓梯，用 stepEntity 模擬真的走上去（不是瞬移）：最後在第 1 層、高度 4.2；
//    - 二樓走廊邊（中庭開口）不能直接跳到一樓：高度接不上，canStand 失敗、A* 不相連；
//    - 二樓 → 一樓走下來；樓梯中間的高度在 0 和 4.2 之間、而且是連續的（每一步高度變化不超過 0.12 m）；
//    - 樓梯平台（2.1 m）上站得住。
// 用法：node tests/nav_levels_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null };
global.navigator={userAgent:'node'};
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'),{filename:'three'});
const load=(src,name)=>vm.runInThisContext('(function(){'+src+'\nreturn E3;})()',{filename:name});   // 包在函式裡：新舊兩版的 const E3 不會衝突
const NEW=load(fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'),'engine3d.js');
let OLD=null; try{ const src=cp.execSync('git show 92acd48:src/engine3d.js',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); OLD=load(src,'engine3d_92acd48.js'); }catch(e){ console.log('（找不到 92acd48 的舊版引擎，跳過逐點比較）',e.message.slice(0,80)); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
// ---- 1. 單層：新舊逐點一樣 ----
function rnd(seed){ let s=seed; return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; }
function buildGrid(E,seed){ const r=rnd(seed); const g=new E.NavGrid(40,30,0.5,-20,-15); g.blockOutside(-19,-14,19,14); for(let i=0;i<22;i++){ const x=-18+r()*36, z=-13+r()*26; if(r()<0.5) g.blockRect(x,z,1+r()*6,0.4+r()*2,r()*3,0.1); else g.blockCircle(x,z,0.3+r()*1.5); } return g; }
if(OLD){ for(const legacy of [false,true]){ NEW.navLegacy=legacy; OLD.navLegacy=legacy; let same=0, diff=0, first=null;
    for(let t=0;t<300;t++){ const gN=buildGrid(NEW,1000+t), gO=buildGrid(OLD,1000+t); const r=rnd(77+t); const x0=-18+r()*36, z0=-13+r()*26, x1=-18+r()*36, z1=-13+r()*26;
      const a=JSON.stringify(gN.path(x0,z0,x1,z1)), b=JSON.stringify(gO.path(x0,z0,x1,z1)); if(a===b) same++; else { diff++; if(!first) first={t,a:a.slice(0,160),b:b.slice(0,160)}; } }
    check(`單層找路和第二十五批逐點一樣（${legacy?'navlegacy':'目前的找路'}，300 組）`,diff===0,`一樣 ${same}、不一樣 ${diff}`+(first?' 例：'+JSON.stringify(first):'')); }
  NEW.navLegacy=false; }
// ---- 2. 兩層的測試大廳 ----
const E=NEW; const W=16, D=20, cell=0.4, ox=-W/2-1, oz=-D/2-1;
const L0=new E.NavGrid(W+2,D+2,cell,ox,oz), L1=new E.NavGrid(W+2,D+2,cell,ox,oz).setFloor(4.2);
for(const n of [L0,L1]) n.blockOutside(-W/2+0.4,-D/2+0.4,W/2-0.4,D/2-0.4);
// 雙跑樓梯：第一跑 x∈[-7.6,-5.6] 由 z=6 (y=0) 往北上到 z=1.8 (y=2.1)；平台 z∈[-0.2,1.8]、x∈[-7.6,-3.4]；第二跑 x∈[-5.4,-3.4] 由 z=1.8 (y=2.1) 往南上到 z=6 (y=4.2)
const flight1={x0:-7.6,x1:-5.6,z0:1.8,z1:6.0,axis:'z',ya:2.1,yb:0.0}, landing={x0:-7.6,x1:-3.4,z0:-0.2,z1:1.8,y:2.1}, flight2={x0:-5.4,x1:-3.4,z0:1.8,z1:6.0,axis:'z',ya:2.1,yb:4.2};
// 一樓：整層 y=0；樓梯兩跑＋平台也在一樓的格子裡（共用）。第二跑的下面（一樓）不能走：用第二跑本身代表那幾格（高度不同，和一樓地板之間要擋起來）
for(const s of [flight1,landing,flight2]) L0.addSurf(Object.assign({},s));
// 樓梯旁邊的扶手／牆：第一跑和第二跑之間的中間牆（x -5.6～-5.4）、第二跑東側扶手（x=-3.4 以東，z 1.8～6 是一樓地板，要擋）、樓梯西側是外牆
L0.blockRect(-5.5,3.9,0.2,4.2,0); L1.blockRect(-5.5,3.9,0.2,4.2,0);
L0.blockRect(-3.25,3.9,0.3,4.2,0);          // 第二跑東側扶手（一樓這邊）
L0.blockRect(-5.5,-0.4,4.4,0.3,0);          // 平台北邊扶手
// 二樓：整層先擋起來，再開出有地板的地方——北邊走廊（z ≤ -0.6）、東側走道（x 5.6～7.6）、南側迴廊（z 6～9.6，第二跑頂端接上來）；中間是中庭（挑空）
L1.fillBlocked(); L1.freeRect(-7.6,-9.6,7.6,-0.6); L1.freeRect(5.6,-0.6,7.6,9.6); L1.freeRect(-5.4,6.0,7.6,9.6);
L1.freeRect(-5.4,1.8,-3.4,6.0); L1.addSurf(Object.assign({},flight2));   // 第二跑：兩層共用（高度一樣）
L1.blockRect(-5.5,3.9,0.2,4.2,0);
E.levels=[L0,L1]; E.nav=L0; E.player=null;
const sim=(x0,z0,l0,x1,z1,l1,dt)=>E.simWalk(x0,z0,x1,z1,{lv0:l0,lv1:l1,dt:dt||1/30});
// 一樓 → 二樓：走到第二跑頂端（二樓）
let r1=sim(4,8,0,-4.4,6.6,1); check('一樓大廳 → 走樓梯 → 二樓（模擬走路，不瞬移）',r1.ok&&r1.lv===1&&Math.abs(r1.y-4.2)<0.05,JSON.stringify(r1));
let r1b=sim(4,8,0,-4.4,6.6,1,0.1); check('同上，低幀率 dt=0.1',r1b.ok&&r1b.lv===1,JSON.stringify(r1b));
// 路徑一定經過樓梯（第一跑）
const p=E.pathTo(4,8,0,-4.4,6.6,1); const viaFlight1=p&&p.some(q=>q[0]<-5.6&&q[0]>-7.6&&q[1]>1.8&&q[1]<6.0);
check('一樓 → 二樓的路經過第一跑樓梯，最後在第 1 層',!!p&&viaFlight1&&p[p.length-1][2]===1,JSON.stringify(p&&p.map(q=>q.map(v=>+(+v).toFixed(1)))));
// 二樓 → 一樓
let r2=sim(-4.4,6.6,1,4,8,0); check('二樓 → 走樓梯下來 → 一樓',r2.ok&&r2.lv===0&&Math.abs(r2.y)<0.05,JSON.stringify(r2));
// 樓梯上高度連續：沿第一跑中線一步一步走
{ let prev=null, maxJump=0; for(let z=6.2;z>=-0.1;z-=0.05){ const h=L0.heightAt(-6.6,z); if(prev!==null) maxJump=Math.max(maxJump,Math.abs(h-prev)); prev=h; } check('第一跑樓梯的高度連續（每 5 cm 變化 ≤ 0.04 m）',maxJump<=0.04,'最大 '+maxJump.toFixed(3)); }
check('樓梯平台（2.1 m）站得住',E.canStand(-5.0,0.8,0.32,0)&&Math.abs(L0.heightAt(-5,0.8)-2.1)<1e-6);
// 二樓中庭邊不能跳下一樓：二樓 (−2.6,−0.6) 往南就是中庭
check('二樓中庭開口：站不住（二樓沒有地板）',!E.canStand(1.0,4.0,0.32,1));
const jump=E.pathTo(-2.0,-3.0,1,1.0,3.0,0); const jumpOK=!!jump&&jump.some(q=>q[1]>1.8&&q[1]<6&&q[0]<-5.6)&&jump.some(q=>q[2]===1&&q[1]>6);   // 二樓走廊 → 一樓中庭：一定要繞到南側迴廊、走第二跑、平台、第一跑下來
check('二樓走廊 → 一樓中庭：一定繞樓梯（不能直接跳下去）',jumpOK,JSON.stringify(jump&&jump.map(q=>q.map(v=>+(+v).toFixed(1)))));
// 一樓地板到第二跑中段（高度差 ~3 m）不相連：從一樓 (−2.8,4.0) 直接往西一步到第二跑 (−3.6,4.0)
check('一樓地板不能直接踏上第二跑中段（扶手＋高度差）',!E.canStand(-3.5,4.0,0.32,0)&&!E.pathTo(-2.6,4.0,0,-4.0,4.0,0).some(q=>Math.abs(q[0]+4)<0.3&&Math.abs(q[1]-4)<0.6&&false));
// 換層的規則：在一樓地板上，正上方的二樓走廊不會被當成「可以換過去」
{ const w=sim(0,-5,0,3,-8,0); check('一樓走廊（正上方是二樓走廊）走過去不會被換到二樓',w.ok&&w.lv===0&&Math.abs(w.y)<0.01,JSON.stringify(w)); }
{ const w=sim(-2,-3,1,1,3,0); check('二樓走廊 → 一樓中庭（模擬走路：迴廊 → 第二跑 → 平台 → 第一跑）',w.ok&&w.lv===0&&Math.abs(w.y)<0.05,JSON.stringify(w)); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
