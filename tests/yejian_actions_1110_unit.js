// 頁間書屋的人物動作（BUG-YEJIAN-NO-VISUAL-1110、USER_WANTS X269）——不需要瀏覽器（D131）。
// 使用者 11-10 00:3x：「在頁間書屋點任何東西都只有對話?沒有畫面?」；選擇題答「人物沒有動作」：點書架、新書＝祐廷走過去、面向它、拿一本翻；點咖啡＝走到咖啡吧、點完坐下喝。
// 建出遊戲真正的頁間書屋（zones3d.js 的 bookstore：導航格、座位、互動點），跑真正的 src/ggshops_sys3d.js（GGS.interact、STORY.onSeat 那一層），假的 GM 記下走到哪、面向哪、坐哪：
//   1 看看書牆：走到書牆前一個站得住、從進門走得到、按鈕範圍裡的點；面向書牆（北）；那一句照舊是稿上的一句（台詞不改）
//   2 拿書：不是「一本也沒拿」那一句＝走到閱讀桌／沙發的空位坐下（GM.seatMenu：一般座位選單，可以起身），坐下那一刻 pose read（手上捧書）；「一本也沒拿」＝不坐
//   3 看新書：走到斜面書架前、面向書架（南）；一樣拿書去坐
//   4 點咖啡：走到咖啡吧前、面向吧檯（東）；點完那幾句照舊（逐字）；點了飲料＝坐到空位、坐著喝（CHAR.setSitTask Drink）；起身（座位選單結束）＝喝的片段拿掉；蛋糕＝坐下不喝；錢不夠、不用了＝不走
//   5 沒有空位（閱讀桌、沙發都有人）＝只站在書架前看，不拿書、不卡住；起身以後走得到出口
//   6 別的店（便利店、青木）照舊：不走、不坐
// 修改前（06e779533）：1、3、4 沒有走路、沒有面向；2、4 沒有坐下 → FAIL。
// 用法：node tests/yejian_actions_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) run(f); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,500):'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
const G={zone:'bookstore',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{},name:'祐廷'}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0},userData:{}},radius:0.32,lv:0,seat:null,pose:'idle',idlePose:'idle'}; if(E.fitSeatRadius) E.fitSeatRadius(); G.zone=id; return z; }
const walkOk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return false; } return true; };
/* 假的 STORY、CHAR、SEATACT（GGS 接在 STORY.interact／onSeat 上；喝的片段只看有沒有叫 setSitTask）*/
global.STORY={TICKS:[],interact:async()=>'orig',onSeat:async()=>false};
global.EAT={ordered:async()=>true}; global.SOCIAL={MEMORY_LABEL:{}};
const taskCalls=[];
global.CHAR={sitTaskFit:(o,kind,desk)=>kind==='drink'&&desk&&desk.h>0.5?{kind,clip:'Sit_Drink_M_Loop',prop:'hand_cup'}:null,setSitTask:(o,f)=>{ taskCalls.push(f?f.kind:null); o.userData.task=f||null; return !!f; },setReadItem(){}};
global.SEATACT={probe:()=>({h:0.75,edge:0.3,depth:0.3,y:0.75})};
run('src/ggshops_sys3d.js');
/* 假的 GM：走路用引擎真正的找路檢查走不走得到；座位選單＝坐下（sitAt）→ STORY.onSeat → 記下姿勢 → 起身 */
let walks=[], faces=[], said=[], menus=[], picks=[], toasts=[];
const occ=st=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.4);
const GM={G,E,
  say:async(w,t)=>{ said.push([w&&w.name||null,t]); }, choose:async opts=>{ const p=picks.length?picks.shift():opts.length-1; return typeof p==='function'?p(opts):p; },
  money:d=>{ G.money+=d; }, toast:t=>{ toasts.push(t); }, sceneBegin(){}, sceneEnd(){}, advance(h){ G.hour+=h; }, autosave(){},
  walkTo:async(P,x,z)=>{ const p=P.obj.position, from=[p.x,p.z]; walks.push({from,to:[x,z],ok:walkOk(from,[x,z]),stand:E.canStand(x,z,0.32,0)}); p.set(x,0,z); return true; },
  face(P,x,z){ const o=P.obj; o.rotation.y=Math.atan2(x-o.position.x,z-o.position.z); faces.push([x,z]); },
  freeSeat:st=>occ(st)?null:st,
  standUp(P){ const s=P.seat; P.seat=null; P.pose='idle'; P.idlePose='idle'; if(s){ const yaw=s.yaw||0; for(const d of [0.75,1.0,1.3]) for(const [dx,dz] of [[Math.cos(yaw),-Math.sin(yaw)],[-Math.cos(yaw),Math.sin(yaw)],[Math.sin(yaw),Math.cos(yaw)],[-Math.sin(yaw),-Math.cos(yaw)]]){ const x=s.x+dx*d, z=s.z+dz*d; if(E.canStand(x,z,0.32,0)){ P.obj.position.set(x,0,z); return; } } } },
  seatMenu:async it=>{ const P=E.player; const rec={seat:it.seat,label:it.label}; menus.push(rec); P.seat=it.seat; P.pose='sit'; P.idlePose='sit'; await STORY.onSeat(GM,it.seat); rec.pose=P.pose; rec.task=P.obj.userData.task?P.obj.userData.task.kind:null; GM.standUp(P); rec.after=[r2(P.obj.position.x),r2(P.obj.position.z)]; }};
const L=YEJIAN_LAYOUT, LK=GGS.LOOK.bookstore, its=()=>E.interactables;
const reset=()=>{ walks=[]; faces=[]; said=[]; menus=[]; picks=[]; toasts=[]; taskCalls.length=0; };
const ggIt=k=>its().find(q=>q.ggs===k);
const tableOf=s=>{ const q=L.seats.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05); return q?q.table:null; };
const atDoor=()=>{ E.player.obj.position.set(L.spawn.x,0,L.spawn.z); E.player.seat=null; E.player.pose='idle'; E.npcs=[]; };
/* 面向（rotation.y）：人面向 (sin y, cos y) */
const facing=()=>{ const y=E.player.obj.rotation.y; return [Math.sin(y),Math.cos(y)]; };
const exitIt=()=>its().find(q=>q.exit&&q.exit.to==='gongguan');
const lineIdx=(k,t)=>LK[k].day.indexOf(t);
(async()=>{ try{
  loadZone('bookstore');
  // ---- 1、2 看看書牆 ----
  { const it=ggIt('shelf_browse'); const res=[];
    for(const r of [0,0.5,0.99]){ atDoor(); reset(); GGS.rand=()=>r; await GGS.interact(it,GM); res.push({line:said[0]&&said[0][1],n:said.length,walks:walks.slice(),face:facing(),menus:menus.slice(),pos:[r2(E.player.obj.position.x),r2(E.player.obj.position.z)]}); }
    GGS.rand=Math.random;
    const w=res.map(x=>x.walks[0]);
    check('1 看看書牆：祐廷從進門的地方走過去（GM.walkTo；引擎找路走得到、終點站得住）',w.every(q=>q&&q.ok&&q.stand),J(w));
    check('1 看看書牆：走到書牆前（按鈕範圍 0.9 m 內、離書牆 1.2 m 內）',w.every(q=>q&&Math.hypot(q.to[0]-it.x,q.to[1]-it.z)<=0.9&&Math.abs(q.to[1]-(-4.78))<1.2),J(w.map(q=>q&&q.to)));
    check('1 看看書牆：面向書牆（北，−z）',res.every(x=>x.face[1]<-0.95),J(res.map(x=>x.face.map(r2))));
    check('1 看看書牆：一句旁白、是稿上的那幾句（台詞不改）',res.every(x=>x.n===1&&LK.shelf_browse.day.includes(x.line)),J(res.map(x=>[x.n,lineIdx('shelf_browse',x.line)])));
    const take=res.filter(x=>!/一本也沒拿/.test(x.line)), none=res.filter(x=>/一本也沒拿/.test(x.line));
    check('2 拿書：不是「一本也沒拿」那一句＝走到閱讀桌／沙發的空位坐下（一般座位選單）',take.length>=2&&take.every(x=>x.menus.length===1&&[1,2,4].includes(tableOf(x.menus[0].seat))),J(take.map(x=>x.menus.map(m=>[tableOf(m.seat),m.seat.x,m.seat.z]))));
    check('2 拿書：坐下那一刻手上捧著書（pose read）',take.every(x=>x.menus[0]&&x.menus[0].pose==='read'),J(take.map(x=>x.menus[0]&&x.menus[0].pose)));
    check('2 「一本也沒拿」那一句：只站著看，不坐',none.length===1&&!none[0].menus.length,J(none.map(x=>[x.line,x.menus.length])));
    const ex=exitIt(); check('2 起身以後站得住、走得到出口（不會卡在位子上）',take.length>0&&take.every(x=>{ if(!x.menus[0]) return false; const a=x.menus[0].after; return E.canStand(a[0],a[1],0.32,0)&&walkOk(a,[ex.x,ex.z]); }),J(take.map(x=>x.menus[0]&&x.menus[0].after))); }
  // ---- 3 看新書 ----
  { const it=ggIt('new_books'); atDoor(); reset(); GGS.rand=()=>0; await GGS.interact(it,GM); GGS.rand=Math.random; const w=walks[0];
    check('3 看新書：走到斜面書架前（走得到、站得住、按鈕範圍內）',!!w&&w.ok&&w.stand&&Math.hypot(w.to[0]-it.x,w.to[1]-it.z)<=0.9,J(w));
    const f=faces[0]; check('3 看新書：面向斜面書架（新書推薦那一座 (2.4, 2.3)）',!!f&&Math.hypot(f[0]-2.4,f[1]-2.3)<0.05&&facing()[1]>0.9,J([f,facing().map(r2)]));
    check('3 看新書：一句、稿上的；拿一本去坐（閱讀桌／沙發），pose read',said.length===1&&LK.new_books.day.includes(said[0][1])&&menus.length===1&&[1,2,4].includes(tableOf(menus[0].seat))&&menus[0].pose==='read',J([said,menus.map(m=>[tableOf(m.seat),m.pose])])); }
  // ---- 4 點咖啡 ----
  /* 2026-11-12（GG-YEJIAN-SHOP-1112）：這支只載 src/ggshops_sys3d.js、沒載 src/yejian_buy3d.js——頁間咖啡吧在這裡是 AA_653 的備用菜單（美式 90、拿鐵 110、紅茶 80、今日蛋糕 100）。遊戲裡開起來的是 AA_853 的（美式 90、拿鐵 120、當日蛋糕 110），在 tests/yejian_buy_1112_unit.js 查；這裡的期望沒有動；看看書牆、看新書在這裡也是沒有選單的舊樣子（新稿沒載入＝照舊只有看）*/
  { const it=ggIt('cafe_order'); const byName=n=>opts=>opts.findIndex(o=>o.t.startsWith(n+'　'));
    atDoor(); reset(); G.money=5000; G.flags.YJ_CAFE_DAY=null; picks=[byName('拿鐵')]; await GGS.interact(it,GM); const w=walks[0];
    check('4 點咖啡：走到咖啡吧前（走得到、站得住、按鈕範圍內）',!!w&&w.ok&&w.stand&&Math.hypot(w.to[0]-it.x,w.to[1]-it.z)<=0.9,J(w));
    check('4 點咖啡：面向吧檯（東，+x）',facing()[0]>0.95||(menus[0]&&faces[0]&&faces[0][0]>it.x),J([faces,facing().map(r2)]));
    check('4 點咖啡：點完那幾句照舊（店員第一次那句＋磨豆機那句，逐字）、扣 110',J(said)===J([['店員','書可以帶到位子上看喔。……沒買的看完放回去就好。'],[null,'（咖啡吧的磨豆機響了一下。店員把杯子放在一個小木盤上。）']])&&G.money===4890,J([said,G.money]));
    check('4 點咖啡：點完走到空位坐下（不是高腳椅）、坐著喝（Drink 片段）',menus.length===1&&!(+menus[0].seat.lift>0)&&menus[0].task==='drink'&&menus[0].pose==='sit',J(menus.map(m=>[tableOf(m.seat),m.seat.lift,m.pose,m.task])));
    check('4 點咖啡：起身（座位選單結束）＝喝的片段拿掉',E.player.obj.userData.task===null&&taskCalls[taskCalls.length-1]===null&&!E.player.seat,J(taskCalls));
    atDoor(); reset(); picks=[byName('今日蛋糕')]; await GGS.interact(it,GM);
    check('4 今日蛋糕：坐下、不喝',menus.length===1&&menus[0].task===null&&menus[0].pose==='sit',J(menus.map(m=>[m.pose,m.task])));
    atDoor(); reset(); picks=[]; await GGS.interact(it,GM); check('4「不用了」：走到吧檯、不坐',walks.length===1&&!menus.length,J([walks.length,menus.length]));
    atDoor(); reset(); G.money=10; picks=[byName('拿鐵')]; await GGS.interact(it,GM); check('4 錢不夠：「錢不夠」、不坐',toasts[0]==='錢不夠'&&!menus.length,J([toasts,menus.length])); G.money=5000;
    /* 別的坐下：上一次喝的片段沒拿掉（讀檔打斷）＝坐下時拿掉 */
    E.player.obj.userData.task={kind:'drink'}; E.player.obj.userData.ggsDrink=true; reset(); await STORY.onSeat(GM,{x:-2.6,z:-2.7,yaw:0}); check('4 讀檔打斷留下的喝的片段：下一次坐下拿掉',E.player.obj.userData.task===null,J(taskCalls)); }
  // ---- 5 沒有空位 ----
  { const it=ggIt('shelf_browse'); atDoor(); for(const s of L.seats) if([1,2,4].includes(s.table)) E.npcs.push({seat:{x:s.x,z:s.z,lv:0}});
    reset(); GGS.rand=()=>0; await GGS.interact(it,GM); GGS.rand=Math.random;
    check('5 閱讀桌、沙發都有人：只站在書架前看（一句、不坐、不卡住）',said.length===1&&!menus.length&&walks.length===1&&walks[0].ok,J([said.length,menus.length,walks]));
    const p=E.player.obj.position, ex=exitIt(); check('5 站的地方走得到出口',walkOk([p.x,p.z],[ex.x,ex.z])); E.npcs=[]; }
  // ---- 6 別的店照舊 ----
  { loadZone('cvs'); reset(); E.player.obj.position.set(0,0,0); await GGS.interact({ggs:'cooler',x:0,z:0},GM); check('6 便利店看冷藏櫃：照舊（不走、不坐）',!walks.length&&!menus.length&&said.length===1,J([walks,menus]));
    loadZone('aoki'); reset(); await GGS.interact({ggs:'bookcase',x:0,z:0},GM); check('6 青木看書櫃：照舊（不走、不坐）',!walks.length&&!menus.length&&said.length===1,J([walks,menus])); }
  }catch(e){ check('跑到一半出錯（例外）',false,e&&e.stack||e); }
  console.log(fails?('FAILED '+fails):'ALL PASS');
  process.exit(fails?1:0);
})();
