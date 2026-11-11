// DRIVE-PICKUP-1105 第二步（AA_704 第 2 節 @55a1c5a53；使用者 11-05 08:0x「走去新月台停車場取車」、11:1x「走去開車不是真的要花時間」、11:1x 寒暑假住家裡）：
// 開車、從宿舍出發＝選了出發先走到望月台停車場，在車旁邊按「開車出發」才出發；一起去的人在停車場入口等；回程停回停車場；從家出發、沒有停車場配置照舊直接出發。
//   A  邏輯（Node、不用瀏覽器）：按鈕只在開車的出發時間窗出現、按下去出發、別的交通照舊、沒有停車場照舊、寒暑假照舊、錯過照舊、回程的位置、她在入口等／走過來
//   B  幾何（真的建校園區域，子程序）：車旁邊、她的位置、停車場入口、她走過來的起點都站得住、走得到
// 修改前（開發分支 6e83736ea）：A、B 全部 FAIL（沒有 CARLOT）。用法：node tests/drive_pickup2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

if(process.argv[2]==='geo'){   // ---------- B：幾何（照 tests/xs_gate_north_unit.js 的做法建校園）----------
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  process.on('unhandledRejection',()=>{});
  const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const files=eval(T.match(/const files=(\[[^\]]+\])/)[1]);
  for(const f of ['src/townkit3d.js','src/campuskit3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/carlot3d.js']) if(!files.includes(f)) files.push(f);
  let loadErr=''; for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))){ loadErr+=f+' 不存在 '; continue; } let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  console.warn=()=>{};
  check('B0. carlot3d.js 載得到（CARLOT）',typeof CARLOT!=='undefined',loadErr);
  if(typeof CARLOT==='undefined'){ console.log('FAILED '+fails); process.exit(1); }
  const before=CARLOT.spot();   // 校園還沒建：照 zones3d.js 同一個算法
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
  const cz=Z3.ZONES.campus.build(E), cn=cz.nav, sp=CARLOT.spot(), cs=Z3.XSG.carSpot;
  check('B1. 校園還沒建的時候算出來的車位、站的地方＝zones3d.js 的 XSG.carSpot',!!before&&!!cs&&Math.abs(before.x-cs.x)<1e-6&&Math.abs(before.z-cs.z)<1e-6&&Math.abs(before.stand.x-cs.stand.x)<1e-6&&Math.abs(before.stand.z-cs.stand.z)<1e-6,JSON.stringify([before&&before.stand,cs&&cs.stand]));
  const cOf=(x,zz)=>[Math.floor((x-cn.ox)/cn.cell),Math.floor((zz-cn.oz)/cn.cell)];
  const free=(x,zz)=>{ const [c,r]=cOf(x,zz); return c>=0&&r>=0&&c<cn.cols&&r<cn.rows&&!cn.b[cn.idx(c,r)]; };
  const stand=(x,zz)=>[[0,0],[0.3,0],[-0.3,0],[0,0.3],[0,-0.3]].every(([a,b])=>free(x+a,zz+b));   // 半徑 0.3 m 站得住
  function reach(a,b){ const [sx,sz]=cOf(...a), [tx,tz]=cOf(...b); const seen=new Uint8Array(cn.cols*cn.rows), q=[[sx,sz]]; seen[cn.idx(sx,sz)]=1;
    while(q.length){ const [x,y]=q.shift(); if(x===tx&&y===tz) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=cn.cols||ny>=cn.rows) continue; const i=cn.idx(nx,ny); if(seen[i]||cn.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
  const P={'車旁邊（按鈕）':sp.stand,'她在車另一邊':sp.her,'停車場入口':sp.gate,'她走過來的起點':sp.walkIn}, bad=Object.entries(P).filter(([k,p])=>!stand(p.x,p.z)).map(([k,p])=>k+'('+p.x.toFixed(1)+','+p.z.toFixed(1)+')');
  check('B2. 車旁邊、她的位置、停車場入口、她走過來的起點都站得住（半徑 0.3 m）',!bad.length,bad.join(' ')||'4 處');
  const far=Object.entries(P).filter(([k,p])=>!reach([cz.spawn.x,cz.spawn.z],[p.x,p.z])).map(([k])=>k);
  check('B3. 從校園出生點走得到這四個地方',!far.length,far.join(' ')||'4 處');
  const P2=Z3.XSG.park, inPark=p=>p.x>=P2[0]&&p.x<=P2[2]&&p.z>=P2[1]&&p.z<=P2[3];
  check('B4. 停車場入口在停車場裡、她走過來的起點在停車場外（小廣場那一側）',inPark(sp.gate)&&!inPark(sp.walkIn),JSON.stringify([sp.gate,sp.walkIn]));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

// ---------- A：邏輯（照 tests/drive_pickup_unit.js 的環境）----------
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM|CARLOT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const PARK=[-123.2,-122.6,-103,-104];   // zones3d.js 的 XSG.park（校園還沒建：沒有 carSpot）
global.Z3={XSG:{park:PARK.slice()}};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js','src/carlot3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:async(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(t,d){ G.goal=t; G.goalDest=d===undefined?null:d; },toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
global.GAME=GM;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},goal:'去上課',goalDest:{zone:'classroom'}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={CLO:[65,50,45]};
/* OUT.go 換成記錄（出發本身是原本的流程，tests/date_book_unit.js 等測）：記下呼叫、標 done；回來的時候人在別的地方（模擬回程的轉場），看停回停車場 */
const go0=typeof OUT!=='undefined'?OUT.go:null; let goes=[];
const spyGo=()=>{ goes=[]; OUT.go=async function(GM2,q,o){ goes.push({id:q.id,o:o||null,hour:G.hour}); q.state='done'; const t=q.dateTrip&&DATE.trip(G,q.dateTrip); if(t) t.status='done'; E.player.obj.position.x=5; E.player.obj.position.z=5; return true; }; };
const realGo=()=>{ OUT.go=go0; };
(async()=>{
  check('0. carlot3d.js 載得到（CARLOT）；index.html 在 outings3d、date3d、story3d 之後載入',typeof CARLOT!=='undefined'&&(()=>{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), i=h.indexOf('src/carlot3d.js?'); return i>h.indexOf('src/story3d.js?')&&i>h.indexOf('src/date3d.js?')&&i>h.indexOf('src/outings3d.js?')&&i<h.indexOf('GAME.boot'); })());
  if(typeof CARLOT==='undefined'){ console.log('FAILED '+fails); process.exit(1); }
  const Dd=8*7+2; fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO);
  const carLoc=Object.keys(DATE_DATA.locations||DATE_DATA.locs||{}).find(k=>{ const L=DATE.loc(k); return L&&(L.transport||[]).some(x=>x.mode==='car')&&(L.transport||[]).some(x=>x.mode!=='car')&&(L.kinds||[]).some(q=>q!=='overnight')&&(L.kinds||[])[0]!=='overnight'; });
  const L=DATE.loc(carLoc), other=L.transport.find(x=>x.mode!=='car');
  const book=(day,mode,dep)=>{ const r=DATE.book(G,{who:'heroine_03',locs:[carLoc],transport:mode,day,depart:dep}); return r&&r.ok?{t:DATE.trip(G,r.trip),q:OUT.get(G,'date_'+r.trip)}:{t:null,q:null,why:r&&r.why}; };
  const btn=()=>{ E.interactables=[]; CARLOT.populate('campus',GM); return E.interactables.find(i=>i.carLot)||null; };   /* STORY.populate 接在後面（STORY._carLotPop）；這裡直接叫，不生作息的人 */
  // 1. 學期中、開車：按鈕只在出發時間窗
  spyGo();
  let B=book(Dd+1,'car',10); check('1a. 學期中約開車（'+carLoc+'）：排進行程、q.car；要走去停車場（CARLOT.need）',!!B.q&&B.q.car===true&&CARLOT.need(G,B.q),B.why||'');
  G.day=Dd+1; G.hour=8; let it=btn();
  check('1b. 校園有「開車出發」（AA_704 原字），出發時間前 1 小時還看不到',!!it&&it.label==='開車出發'&&it.hidden===true,it&&it.label);
  G.hour=9.8; check('1c. 出發時間前 15 分鐘起看得到（和 OUT.due 同一個時間窗）；位置在車旁邊（XSG.carSpot.stand）',!!it&&it.hidden===false&&Math.abs(it.x-(PARK[0]+2.5+2*2.6+1.6))<1e-6&&Math.abs(it.z-(PARK[1]+5.8))<1e-6,it&&(it.x+','+it.z));
  G.weather='rain'; check('1d. 下雨照樣看得到（不擋出發）',it.hidden===false); G.weather='clear';
  E.interactables=[]; CARLOT.populate('gongguan',GM); check('1e. 別的區域沒有這個按鈕；STORY.populate 換區域時會放（掛勾）',!E.interactables.some(i=>i.carLot)&&STORY._carLotPop===true);
  // 2. 出發選單選「出發」＝走去停車場，不直接出發、不花時間
  G.hour=10; const h0=G.hour; picks=['出發']; let r=await DATE.prompt(GM,B.q);
  check('2a. DATE.prompt 選「出發」＝不直接出發（回 lot；OUT.go 沒叫）；行程照舊 booked、還沒 departed',r==='lot'&&!goes.length&&B.t.status==='booked'&&!B.t.departed&&B.q.state==='planned',JSON.stringify([r,goes.length,B.t.status]));
  check('2b. 目標改成走到望月台停車場（帶目的地：校園、車旁邊）；不另外花時間',G.goal===CARLOT.GOAL&&!!G.goalDest&&G.goalDest.zone==='campus'&&Math.abs(G.goalDest.x-it.x)<1e-6&&G.hour===h0,G.goal+' '+JSON.stringify(G.goalDest));
  check('2c. 走去停車場的途中不再跳出發選單（OUT.due）；按鈕看得到',OUT.due(G)===null&&it.hidden===false);
  // 3. 按「開車出發」＝出發；回來停回停車場
  E.player.obj.position.x=it.x; E.player.obj.position.z=it.z; G.zone='campus';
  await it.onInteract(it);
  check('3a. 按「開車出發」＝照原本出發（OUT.go 叫一次、這一趟）；行程 departed／going 以後才出發',goes.length===1&&goes[0].id===B.q.id&&B.t.departed===true,JSON.stringify(goes));
  check('3b. 回程停回停車場：人在車旁邊（回程的轉場把人放到別處也放回來）',Math.abs(E.player.obj.position.x-it.x)<1e-6&&Math.abs(E.player.obj.position.z-it.z)<1e-6,E.player.obj.position.x+','+E.player.obj.position.z);
  check('3c. 目標放回選出發以前的（去上課）、按鈕收起來',G.goal==='去上課'&&!!G.goalDest&&G.goalDest.zone==='classroom'&&it.hidden===true,G.goal);
  // 3d. 人不在校園（例：公館）時回來：不搬人
  fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=10; picks=['出發']; await DATE.prompt(GM,B.q); G.zone='gongguan'; E.player.obj.position.x=1; E.player.obj.position.z=1; spyGo(); OUT.go=(f=>async function(){ const x=await f.apply(this,arguments); G.zone='gongguan'; E.player.obj.position.x=1; E.player.obj.position.z=1; return x; })(OUT.go);
  await CARLOT.press(GM); check('3d. 回來的時候人不在校園（別的區域）：不搬人、照樣出發過',goes.length===1&&E.player.obj.position.x===1,JSON.stringify(goes));
  // 4. 別的交通：照舊直接出發
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,other.mode,10); G.day=Dd+1; G.hour=10; it=btn();
  check('4a. 搭'+other.mode+'：不用走去停車場、沒有按鈕',!!B.q&&!B.q.car&&!CARLOT.need(G,B.q)&&it.hidden===true);
  picks=['出發']; r=await DATE.prompt(GM,B.q); check('4b. 搭別的：選「出發」直接出發（照舊）',r==='go'&&goes.length===1&&!G.flags.CARLOT_GOAL,JSON.stringify([r,goes.length]));
  // 5. 沒有停車場的配置（Z3.XSG 沒有）：照第一步直接出發
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=10; const XS=Z3.XSG; Z3.XSG=undefined; it=btn();
  check('5a. 沒有 Z3.XSG：不用走去停車場、沒有按鈕',!CARLOT.need(G,B.q)&&!it&&CARLOT.due(G)===null);
  picks=['出發']; r=await DATE.prompt(GM,B.q); check('5b. 沒有 Z3.XSG：選「出發」直接出發',r==='go'&&goes.length===1,JSON.stringify([r,goes.length])); Z3.XSG=XS;
  // 6. 寒暑假（住家裡、從家出發）：不走去停車場、不演取車旁白（使用者 11:1x）
  spyGo(); const vac=(()=>{ for(let d=200;d<420;d++){ if(!CALENDAR.termOf(d)&&CALENDAR.termOf(d-20)) return d+5; } return null; })();
  global.HOME={breakOf:d=>!CALENDAR.termOf(d)?{}:null,at:()=>false,baseMode:()=>false,pgHome:()=>false};   /* 只給 DATE.fromHomeOn 用（home3d.js 的 breakOf：不在學期裡＝寒暑假）*/
  fresh(vac-1,9,'campus',{}); R('heroine_03',...LV.CLO); B=book(vac,'car',10);
  check('6a. 寒暑假那天（DATE.fromHomeOn）約開車：從家出發＝不用走去停車場、OUT.carHome',!!B.q&&DATE.fromHomeOn(G,vac)&&OUT.carHome(G,B.q)&&!CARLOT.need(G,B.q),B.why||String(vac));
  G.day=vac; G.hour=10; it=btn(); check('6b. 寒暑假：校園沒有「開車出發」可以按',it.hidden===true);
  picks=['出發']; r=await DATE.prompt(GM,B.q); check('6c. 寒暑假：選「出發」照原本直接出發',r==='go'&&goes.length===1&&G.goal!==CARLOT.GOAL,JSON.stringify([r,goes.length]));
  realGo(); fresh(vac,10,'campus',{}); { const ev={id:'ev_t_carlot',trigger:'outing',participants:[],hours:1,lines:[]}; STORY_EVENTS.push(ev); const EV0=EVENTS.run; EVENTS.run=async()=>{};
    const q={id:'t_car_home',ev:ev.id,day:vac,h:11,travelH:1,travel:'',car:true,state:'planned',late:1}; G.outings=[q]; await OUT.go(GM,q);
    const q2={id:'t_car_term',ev:ev.id,day:Dd+1,h:11,travelH:1,travel:'',car:true,state:'planned',late:1}; fresh(Dd+1,10,'campus'); G.outings=[q2]; await OUT.go(GM,q2); const c2=caps.slice();
    EVENTS.run=EV0; STORY_EVENTS.pop();
    check('6d. 取車旁白：寒暑假從家開車出去不演；學期中從宿舍第一次開車照演（第一步）',!c2.length?false:c2.includes(OUT.CAR_PICKUP_LINE)&&G.flags.DRIVE_PICKUP_SEEN===Dd+1,JSON.stringify(c2)); }
  { fresh(vac,10,'campus'); const ev={id:'ev_t_carlot2',trigger:'outing',participants:[],hours:1,lines:[]}; STORY_EVENTS.push(ev); const EV0=EVENTS.run; EVENTS.run=async()=>{};
    const q={id:'t_car_home2',ev:ev.id,day:vac,h:11,travelH:1,travel:'',car:true,state:'planned',late:1}; G.outings=[q]; await OUT.go(GM,q); EVENTS.run=EV0; STORY_EVENTS.pop();
    check('6e. 寒暑假從家開車：沒有取車旁白、DRIVE_PICKUP_SEEN 不記',!caps.includes(OUT.CAR_PICKUP_LINE)&&!G.flags.DRIVE_PICKUP_SEEN,JSON.stringify(caps)); }
  delete global.HOME;
  // 7. 出遊（不是校外約會）的開車：OUT.prompt 一樣先走去停車場
  spyGo(); fresh(Dd+1,9.5,'campus'); { const q={id:'fest_t_car',ev:null,day:Dd+1,h:11,travelH:1,travel:'開車約 1 小時',car:true,title:'測試',place:'臺中',late:0.5}; OUT.plan(G,q); const qq=OUT.get(G,q.id); G.hour=9.8;
    picks=['出發']; r=await OUT.prompt(GM,qq); it=btn();
    check('7a. 出遊（q.car，例：她的節日開車去她的城市）：OUT.prompt 選「出發」＝走去停車場（lot）、按鈕看得到',r==='lot'&&!goes.length&&it.hidden===false&&OUT.due(G)===null,r);
    await it.onInteract(it); check('7b. 按「開車出發」＝出發（OUT.go）',goes.length===1&&goes[0].id===qq.id); }
  spyGo(); fresh(Dd+1,9.5,'campus'); { const q={id:'walk_t',ev:null,day:Dd+1,h:11,travelH:0.25,travel:'走路約 15 分鐘',title:'測試2',place:'公館',late:0.5}; OUT.plan(G,q); const qq=OUT.get(G,q.id); G.hour=10.6;
    picks=['出發']; r=await OUT.prompt(GM,qq); check('7c. 不是開車的出遊：照舊直接出發',r==='go'&&goes.length===1&&btn().hidden===true,r); }
  // 8. 錯過：選了出發卻沒走到車旁邊
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=10; picks=['出發']; await DATE.prompt(GM,B.q);
  G.hour=10.5; check('8a. 出發時間過了 30 分鐘還走得到、按得到',CARLOT.due(G)===B.q&&OUT.due(G)===null);
  G.hour=11.2; check('8b. 晚了 60 分鐘以上（校外約會）：不給按，跳回原本的出發選單（改時間／今天不去了）',CARLOT.due(G)===null&&OUT.due(G)===B.q);
  G.hour=B.q.h+1.1; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); DATE.tick(GM); CARLOT.tick(GM);
  check('8c. 過了最晚能出發的時間＝照原本錯過（出遊 missed、校外約會 missed）；目標放回去',B.q.state==='missed'&&B.t.status==='missed'&&G.goal==='去上課'&&!goes.length,JSON.stringify([B.q.state,B.t.status,G.goal]));
  // 9. 改時間：選出發記的那一筆作廢
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=10; picks=['出發']; await DATE.prompt(GM,B.q); B.q.h+=1; B.t.depart+=1;
  check('9. 改了時間（q.h 變了）：之前選的出發作廢（回到出發選單）',!CARLOT.walking(G,B.q)&&CARLOT.due(G)===null);
  // 10. 一起去的人：入口等、走過來、走到車旁邊
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=9.5; picks=[0]; await DATE.early(GM,B.q,B.t,'提醒');
  const sp=CARLOT.spot(); const spawned=[], moved=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,z},rotation:{y:0}},lv:0}; GM.npc[id]=n; spawned.push({id,x,z}); return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
  E.moveTo=(n,x,z,cb)=>{ moved.push({id:n.id,x,z}); n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; };
  E.player.obj.position.x=0; E.player.obj.position.z=0; CARLOT.tick(GM);
  check('10a. 提早出發（提醒時「現在出發」）也是先走去停車場；出發前 15 分鐘以前她還沒到',B.q.lot&&!spawned.length&&!goes.length);
  G.hour=9.8; CARLOT.tick(GM); check('10b. 她先到：出發前 15 分鐘起在停車場入口等（你不在附近）',spawned.length===1&&spawned[0].id==='heroine_03'&&Math.abs(spawned[0].x-sp.gate.x)<1e-6&&Math.abs(spawned[0].z-sp.gate.z)<1e-6&&!moved.length,JSON.stringify(spawned));
  E.player.obj.position.x=sp.stand.x; E.player.obj.position.z=sp.stand.z; CARLOT.tick(GM); check('10c. 你走到車旁邊：她走到車的另一邊',moved.length===1&&Math.abs(moved[0].x-sp.her.x)<1e-6,JSON.stringify(moved));
  await CARLOT.press(GM); check('10d. 按「開車出發」出發；回來她不留在停車場',goes.length===1&&!GM.npc.heroine_03);
  spyGo(); fresh(Dd,9,'campus'); R('heroine_03',...LV.CLO); B=book(Dd+1,'car',10); G.day=Dd+1; G.hour=9.6; picks=[0]; await DATE.early(GM,B.q,B.t,'提醒'); spawned.length=0; moved.length=0;
  E.player.obj.position.x=sp.gate.x+3; E.player.obj.position.z=sp.gate.z; G.hour=9.8; CARLOT.tick(GM);
  check('10e. 你先到（在入口附近）：她從小廣場那邊走過來、走到入口',spawned.length===1&&Math.abs(spawned[0].x-sp.walkIn.x)<1e-6&&moved.length===1&&Math.abs(moved[0].x-sp.gate.x)<1e-6,JSON.stringify([spawned,moved]));
  spawned.length=0; moved.length=0; G.hour=9.6; GM.npc={}; await CARLOT.press(GM); check('10f. 她還沒到就按（出發前 15 分鐘以前）：她走到車旁邊再出發，不卡住',goes.length===1&&spawned.length===1&&moved.length===1,JSON.stringify([goes.length,spawned,moved]));
  // 11. 程式：出發的入口都先問 CARLOT
  const S1=fs.readFileSync(path.join(ROOT,'src/date3d.js'),'utf8'), S2=fs.readFileSync(path.join(ROOT,'src/onetap3d.js'),'utf8'), S3=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8');
  check('11. 出發的入口（DATE.prompt、DATE.early、手機的到下一個約會、OUT.prompt）都先問 CARLOT.need',(S1.match(/S\.toCar\(GM,q\)/g)||[]).length>=2&&/CARLOT\.need\(G,q\)/.test(S2)&&/CARLOT\.need\(G,q\)\)\{ await CARLOT\.toLot/.test(S3));
  console.log(fails?('FAILED '+fails):'ALL PASS');
  const g=cp.spawnSync(process.execPath,[__filename,'geo'],{encoding:'utf8',timeout:300000}); process.stdout.write(g.stdout||''); if(g.status!==0){ fails++; if(g.stderr) console.log(g.stderr.slice(-600)); }
  process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
