// 洋洋鹹酥雞：站在椅子旁邊，按鈕是「坐下吃」，不是旁邊的「看炸物櫃／看菜單／看廚房」（BB 2026-11-12 在使用者電腦判 FAIL：
//   店內 (0.92, 2.3) 那張椅子點了走不過去、旁邊互動鍵是「看炸物櫃」，同一排只有 (0.92, 1.2) 坐得下）。不需要瀏覽器。
// 原因：沿著店內炸物櫃那一條走道（x 0.2）的三個「看」（炸物櫃 z 2.5、菜單 z 1.6、廚房 z −0.5）離四人桌一、二西側三張椅子 0.75 m；
//   坐下前走到的那一點（x 0.37）離「看」0.26～0.53 m、離椅子 0.55 m——推搖桿走到椅子旁邊，最近的互動永遠是「看…」。
// 改法（src/zones3d.js GG2_PRIO）：這三個「看」讓 0.4 m（nearestInteractable 的 prio）；位置、範圍、椅子、桌子都沒動。
// 這裡建出遊戲真正的區域（zones3d.js、engine3d.js 的找路和 nearestInteractable），檢查：
//   1 玩家坐得到的 20 張，每一張「坐下前走到的那一點」（照 game3d.js seatApproach 的候選）站得住、從進門的地方走得到（30 fps、10 fps），
//     站在那裡不靠 tapPref（＝推搖桿走過去）最近的互動就是這一張——修改前：(0.92, 2.3)、(0.92, 1.2)、(0.92, 0) 三張 FAIL；
//   2 三個「看」、點餐、自助區、冷飲櫃都還按得到（有站得住、走得到、最近就是它的點）；貼著那一點站是它；
//   3 只有那三個有 prio −0.4，其他互動點、座位沒有。
// 雲端瀏覽器（沒有顯示卡）照 CC 的 sit_all 走過 (0.92, 2.3)：18:00、19:00、20:30 三次修改前就坐得下——「點了走不過去」在雲端重現不出來，要 CC 在使用者電腦再跑。
// 用法：node tests/yangyang_seat_prio_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..'); const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js'), LAY='src/data/yangyang_layout.js';
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/data/afar_layout.js','src/data/daybreak_layout.js',LAY,'src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js','src/data/pool_story.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, r2=v=>+v.toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
global.GAME={G:{zone:'yangyang',day:30,hour:19,flags:{},money:5000,weather:'clear'}};
check('0 區域 yangyang 存在（配置有載入）',!!Z3.ZONES.yangyang); if(!Z3.ZONES.yangyang){ console.log('FAILED'); process.exit(1); }
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; const z=Z3.ZONES.yangyang.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.nav._cm=null;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius();
const sp=z.spawn, its=E.interactables.slice(), seats=its.filter(q=>q.seat), others=its.filter(q=>!q.seat&&!q.exit);
/* game3d.js seatApproach 的候選（照同一個順序、同一套條件：站得住 0.3、找得到路、在「坐下」的範圍裡、這一張最近）*/
function seatApproach(seat,P){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); let best=null, bd=1e9; const sit=its.find(q=>q.seat===seat), reach=(sit.radius||1.8)-0.05;
  const ownNearest=(x,zz)=>{ const d0=Math.hypot(x-sit.x,zz-sit.z); return !its.some(q=>q!==sit&&q.seat&&!q.hidden&&Math.hypot(x-q.x,zz-q.z)<d0-1e-6); };
  for(const mode of [2,1,0]){ if(best) break; for(const [dx,dz,pen] of [[fx*0.5,fz*0.5,0],[-fx*0.6,-fz*0.6,0],[fz*0.55,-fx*0.55,0],[-fz*0.55,fx*0.55,0],[-fx*0.7,-fz*0.7,0.1],[-fx*0.75,-fz*0.75,0.2],[fx*0.8,fz*0.8,0.5],[-fx*0.9,-fz*0.9,0.5]]){ const x=seat.x+dx, zz=seat.z+dz;
      if(!E.canStand(x,zz,0.3,0)) continue; const pth=E.pathTo(P.x,P.z,0,x,zz,0); if(!pth||!pth.length) continue; let L=0, px=P.x, pz=P.z; for(const q of pth){ L+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; } if(Math.hypot(px-x,pz-zz)>0.6) continue;
      if(mode>0&&Math.hypot(x-sit.x,zz-sit.z)>reach) continue; if(mode===2&&!ownNearest(x,zz)) continue; L+=pen; if(L<bd){ bd=L; best=[x,zz]; } } }
  return best; }
const walk=(a,b)=>[1/30,0.1].every(dt=>E.simWalk(a[0],a[1],b[0],b[1],{dt}).ok);
const nearAt=(x,zz,tp)=>{ E.player.obj.position.set(x,0,zz); E.player.tapPref=tp?{x:tp.x,z:tp.z,lv:0,zone:z.id}:null; const n=E.nearestInteractable(); E.player.tapPref=null; return n; };
/* 1 每一張椅子 */
{ check('1 玩家坐得到的座位 20 張（配置 22 張，四人桌四南側兩張只給路人）',seats.length===20,String(seats.length));
  const noAp=[], noWalk=[], wrong=[], wrongTap=[];
  for(const it of seats){ const s=it.seat, ap=seatApproach(s,{x:sp.x,z:sp.z}); if(!ap){ noAp.push([s.x,s.z]); continue; }
    if(!walk([sp.x,sp.z],ap)) noWalk.push([s.x,s.z,ap.map(r2)]);
    const n0=nearAt(ap[0],ap[1],null), n1=nearAt(ap[0],ap[1],s); if(n0!==it) wrong.push([s.x,s.z,n0&&n0.label]); if(n1!==it) wrongTap.push([s.x,s.z,n1&&n1.label]); }
  check('1 每一張都有坐下前走到的那一點（站得住、在「坐下吃」的範圍裡）',!noAp.length,J(noAp));
  check('1 那一點從進門的地方走得到（30 fps、10 fps）',!noWalk.length,J(noWalk));
  check('1 站在那一點（推搖桿走過去，沒有 tapPref）最近的互動就是這一張「坐下吃」——修改前：(0.92,2.3)「看炸物櫃」、(0.92,1.2)「看菜單」、(0.92,0)「看廚房」',!wrong.length,J(wrong));
  check('1 點椅子走過去的（tapPref）也是這一張',!wrongTap.length,J(wrongTap));
  const W=seats.find(q=>q.seat.x===0.92&&q.seat.z===2.3);
  check('1 BB 點名的那一張 (0.92, 2.3)：站在椅子旁邊 (0.37, 2.3)、(0.45, 2.2)、椅子後面 (0.9, 1.9) 都是「坐下吃」',!!W&&[[0.37,2.3],[0.45,2.2],[0.9,1.9]].every(p=>E.canStand(p[0],p[1],0.3,0)&&nearAt(p[0],p[1],null)===W),J([[0.37,2.3],[0.45,2.2],[0.9,1.9]].map(p=>(nearAt(p[0],p[1],null)||{}).label))); }
/* 2 其他互動點都還按得到 */
function touchable(it){ const r=(it.radius||1.5)-0.05, c=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, zz=it.z+dz; if(E.canStand(x,zz,0.32,0)) c.push([d,x,zz]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,zz] of c){ if(nearAt(x,zz,null)!==it) continue; if(!walk([sp.x,sp.z],[x,zz])) continue; return [r2(x),r2(zz)]; } return null; }
{ const lab=others.map(q=>q.label), bad=others.filter(q=>!touchable(q)).map(q=>q.label);
  check('2 店裡的互動點六個：點炸物（店內）、看菜單、看冷飲櫃、自助區、看炸物櫃、看廚房',lab.length===6&&['點炸物（店內）','看菜單','看冷飲櫃','看炸物櫃','看廚房'].every(t=>lab.includes(t)),J(lab));
  check('2 六個都還按得到（有站得住、從進門走得到、最近就是它的點）',!bad.length,J(bad));
  const byK=k=>others.find(q=>q.kind===k), at=q=>{ for(const dx of [0,0.05,-0.05,0.1]){ if(E.canStand(q.x+dx,q.z,0.3,0)) return nearAt(q.x+dx,q.z,null); } return null; };
  check('2 貼著那一點站：炸物櫃、菜單、廚房各自是「看…」（不會變成旁邊的椅子）',['case','menu','kitchen'].every(k=>byK(k)&&at(byK(k))===byK(k)),J(['case','menu','kitchen'].map(k=>byK(k)&&(at(byK(k))||{}).label)));
  check('2 站在點餐那一點是「點炸物（店內）」',!!byK('order')&&at(byK('order'))===byK('order')); }
/* 3 只動了那三個 */
{ const pr=its.filter(q=>q.prio!=null).map(q=>[q.kind||q.label,q.prio]);
  check('3 只有炸物櫃、菜單、廚房三個「看」讓 0.4 m（prio −0.4）；位置、範圍沒有動',J(pr.sort())===J([['case',-0.4],['kitchen',-0.4],['menu',-0.4]])&&others.every(q=>q.radius===0.9)&&J(['case','menu','kitchen'].map(k=>{ const q=others.find(o=>o.kind===k); return [q.x,q.z]; }))===J([[0.2,2.5],[0.2,1.6],[0.2,-0.5]]),J(pr)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
