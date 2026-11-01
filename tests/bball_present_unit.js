// BBALL-PRESENT-1030（使用者 2026-10-30：「系藍練團時間到 根本球場空的」，存檔 2025-10-16 週四 17:45 站在球場邊）——不需要瀏覽器。
// 在 Node 建出遊戲真正的校園（籃球場在醉月湖東側，zones3d.js 的 bballCourt），照 GAME.enter 進校園（CROWD.enter），用引擎真正的導航檢查：
//   1. 系籃練球（activities.js 的 dept_basketball）成立的那一段（2025-10-17 週五 17:45）：球場上 6～8 個人在籃框那半場跑（路線、跑一段停一下、停下來面向籃框）、
//      場邊 2～3 個人（記分、送水）；路人沒有名字；每個人站得住、路線每一段走得到（移動模擬）、不經過阿哲明軒站的地方和活動點；同一天同一時段進出看到同一批人。
//   2. 時段：17:30 以前、19:00 以後沒有人；19:00 一到（時間沒有跳）大家走開（不再跑、走向南邊的路）；時段開始時玩家看得到＝從南邊的路走進來。
//   3. 非練球日（10/16 週四）：球場沒有人、沒有「系籃練球」的參加點；集合點有只看不參加的提示「系籃練球（星期五 17:30）」，按了寫時間地點和下一次（10/17）。
//      練球日：提示藏起來、參加點照舊。大一下（沒有系籃練球）：沒有提示。第 16 週（練球結束以後）：提示寫「這學期的系籃練球結束了」。
//   4. 國定假日（2025-10-10 週五國慶，第 6 週）：照 ACTIVITIES 的規則停練——沒有人、沒有參加點、阿哲明軒不在球場；提示寫「今天國慶日，系籃練球停一次」、下一次 10/17。
//   5. 打球的人點了聽一句（體育館籃球場那一組裡沒有指定說話的人的句子），不擋活動點（yieldIt）；場邊的人不說話。
//   6. 阿哲（zhe）、明軒（classmate_mingxuan）練球那一段在球場（作息 STORY.schedEnt：阿哲站在場邊、明軒在場上）；蓋掉的是一般作息（校園走走）；
//      非練球日、國定假日、19:00 以後、大一下不在；不被 pairUp 帶走（noPair）。（另一個 node 行程跑：要真的 story3d.js）
// 修改前：練球時間球場沒有人、沒有提示、阿哲明軒不在（第 1、3、4、6 項 FAIL）。用法：node tests/bball_present_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const FRI='2025-10-17', THU='2025-10-16', HOL='2025-10-10', W4='2025-09-26', W16='2025-12-19', Y1S2FRI='2026-03-06';

if(process.argv[2]==='--sched'){
  // ---------- 6. 阿哲、明軒的作息（真的 story3d.js：schedEnt 的優先順序 pri → SCHED_WITH → 有 terms → 沒 terms）----------
  global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
  global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''}; console.warn=()=>{};
  const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js']) load(f);
  const mkG=(key,h,flags)=>{ const d=dayOf(key), G={day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus',flags:Object.assign({introDone:true,afternoonDone:true,classDone:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},social:null,rel:{}}; SOCIAL.bind(G); EVENTS.bind({get G(){ return G; },E:{player:{obj:{position:{x:0,z:0}}},npcs:[]},npc:{}}); return G; };
  const ROW=id=>(CHARACTERS[id].daily_schedule||[]).find(e=>e.activity==='dept_basketball');
  const court=e=>!!e&&e.zone==='campus'&&e.act==='linger'&&Array.isArray(e.at)&&e.at[0]>-11.5&&e.at[0]<3.5&&e.at[1]>-120&&e.at[1]<-106;
  const ids=['zhe','classmate_mingxuan'];
  check('6. 阿哲、明軒的作息有系籃練球那一筆（activity:dept_basketball、在球場上、noPair）',ids.every(id=>court(ROW(id))&&ROW(id).noPair===true),ids.map(id=>JSON.stringify(ROW(id)&&ROW(id).at)).join(' '));
  const at=(id,key,h)=>STORY.schedEnt(CHARACTERS[id],mkG(key,h));
  /* 大一上每一個練球日（ACTIVITIES.on）的開頭、中間、結尾：作息就是這一筆 */
  const A=ACTIVITIES.list.find(a=>a.id==='dept_basketball'), bad=[], days=[];
  for(let d=dayOf('2025-09-01');d<=dayOf('2026-01-20');d++){ if(!ACTIVITIES.on(A,d,{flags:{}})) continue; const key=CALENDAR.dateOf(d).key; days.push(key);
    for(const h of [17.55,18.2,18.95]) for(const id of ids){ const e=at(id,key,h); if(e!==ROW(id)) bad.push(id+' '+key+' '+h+' → '+(e?e.act+'@'+(e.zone||e.away):'null')); } }
  check('6. 大一上每一個練球日 17:33、18:12、18:57：阿哲、明軒的作息是球場那一筆（'+days.length+' 天）',days.length>=7&&!bad.length,bad.slice(0,4).join('｜')||days.join(','));
  const zp=ROW('zhe').at, mp=ROW('classmate_mingxuan').at;
  check('6. 阿哲站在場邊（東邊、活動點旁 1.5～3 m）面向活動點；明軒在場上（籃框那半場的罰球線外）面向籃框',Math.hypot(zp[0]-3.3,zp[1]+112.7)>1.5&&Math.hypot(zp[0]-3.3,zp[1]+112.7)<3&&Math.cos(zp[2]-Math.atan2(3.3-zp[0],-112.7-zp[1]))>0.95&&mp[1]<-108&&mp[1]>-113&&Math.cos(mp[2])<-0.95,zp.join(',')+' / '+mp.join(','));
  /* 蓋掉的是一般作息（不是上課、家教、顧店、社課、讀書會）*/
  const bad2=[]; for(const id of ids){ const c=CHARACTERS[id], keep=c.daily_schedule; c.daily_schedule=keep.filter(e=>e!==ROW(id)); for(const h of [17.55,18.5]){ const e=STORY.schedEnt(c,mkG(FRI,h)); if(e&&(e.act==='class'||['club','barista','help','ta'].includes(e.act)||/家教|顧店|社課|讀書會|打工/.test(e.note||e.label||''))) bad2.push(id+' '+h+' 原本 '+e.act+'@'+e.zone); } c.daily_schedule=keep; }
  check('6. 蓋掉的原本那一筆是一般作息（校園走走、公館），不是上課、家教、顧店、社課',!bad2.length,bad2.join('｜'));
  const off=[[THU,17.75,'週四（10/16，使用者的存檔）'],[HOL,17.75,'國慶日（10/10）'],[W4,17.75,'第 4 週（還沒開始練）'],[FRI,19.05,'19:00 以後'],[FRI,17.4,'17:30 以前'],[Y1S2FRI,17.75,'大一下的週五']].map(([k,h,why])=>{ const bad=ids.filter(id=>court(at(id,k,h))); return bad.length?why+' '+bad.join(','):null; }).filter(Boolean);
  check('6. 非練球日、國定假日、第 4 週、時段外、大一下：阿哲、明軒都不在球場',!off.length,off.join('｜'));
  { const ND=(()=>{ for(let d=STORY.dayOfKey('2025-10-13');d<STORY.dayOfKey('2025-10-31');d++){ const w=CALENDAR.dateOf(d).wd; if(w!==5&&STORY.noodleDay(d)) return CALENDAR.dateOf(d).key; } return THU; })();   /* AA_542 第 5 節：麵店日每週不固定兩天 */
    const e=at('zhe',ND,18); check('6. 阿哲麵店日（不是週五：'+ND+'）照舊在麵店（17:30～20:30）',!!e&&e.zone==='noodle',e&&e.zone); }
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('6. 作息寫 noPair 的 linger：生出來的人不被 pairUp 帶走（n.noPair）',/act==='linger'&&ent\.at\)\{[^\n]*if\(n&&ent\.noPair\) n\.noPair=true/.test(src)); }
  process.exit(fails?1:0);
}

// ---------- 1～5：校園、人流、提示 ----------
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|TB3|[A-Z_]*LAYOUTS?|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
const said=[]; const mkGM=G=>({G,E,hourRate:1/150,enterN:1,sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push([w&&w.name,t]); },face(){},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; }});
const mkG=(key,h)=>{ const d=dayOf(key); return {day:d,hour:h,flags:{},weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus'}; };
function enter(G,px,pz){ E.npcs=[]; E.camera=null; E.player={obj:{position:new THREE.Vector3(px==null?3.3:px,0,pz==null?-108:pz),rotation:{y:0}},radius:0.32,lv:0,seat:null}; const GM=mkGM(G); CROWD.enter(GM,'campus'); return GM; }
const court=()=>E.npcs.filter(n=>n.crowd==='bball_practice'||n.crowdSpot==='bball_practice');
const role=r=>court().filter(n=>n.crowdRole===r);
const ZHE=(CHARACTERS.zhe.daily_schedule||[]).find(e=>e.activity==='dept_basketball'), MX=(CHARACTERS.classmate_mingxuan.daily_schedule||[]).find(e=>e.activity==='dept_basketball');
const KEEP=[[3.3,-112.7,1.5,'活動點']].concat(ZHE?[[ZHE.at[0],ZHE.at[1],1.4,'阿哲']]:[]).concat(MX?[[MX.at[0],MX.at[1],1.4,'明軒']]:[]);
// ---------- 1. 練球的時候球場有人 ----------
{ enter(mkG(FRI,17.75)); const all=court(), run=role('bball_run'), side=all.filter(n=>n.crowdRole!=='bball_run');
  check('1. 練球日（10/17 週五 17:45）：球場上 6～8 個人在打球、場邊 2～3 個人（記分、送水）',run.length>=6&&run.length<=8&&side.length>=2&&side.length<=3&&side.every(n=>['scorer','water'].includes(n.crowdRole)),'打球 '+run.length+'、場邊 '+side.length+'：'+side.map(n=>n.crowdRole).join('、'));
  check('1. 打球的人會跑（run）、跑一段停一下、停下來面向籃框；路線在籃框那半場',run.length>0&&run.every(n=>n.beh==='route'&&n.run&&n.pauseAt&&n.faceYaw!=null&&n.waypoints.every(q=>q[0]>-11&&q[0]<3&&q[1]>-119.6&&q[1]<-106.5)),run.map(n=>n.beh+(n.run?'/run':'')).join(' '));
  check('1. 路人沒有名字',all.every(n=>!n.name),all.map(n=>n.name).filter(Boolean).join(','));
  const bad=[]; for(const n of all){ const P=n.obj.position; if(!E.canStand(P.x,P.z,0.3,0)) bad.push(n.crowdRole+' 站不住 '+P.x.toFixed(1)+','+P.z.toFixed(1));
    const pts=n.waypoints||[[P.x,P.z]]; for(const q of pts) for(const [x,zz,r,why] of KEEP) if(Math.hypot(q[0]-x,q[1]-zz)<r) bad.push(n.crowdRole+' 在'+why+'旁邊 '+q[0]+','+q[1]);
    if(n.waypoints){ const w=n.waypoints; for(let i=0;i<w.length;i++){ const a=w[i], b=w[(i+1)%w.length]; const r=E.simWalk(a[0],a[1],b[0],b[1],{dt:1/30,speed:2.8}); if(!r.ok) bad.push('走不到 '+a.join(',')+'→'+b.join(',')); } } }
  check('1. 每個人站得住、路線每一段走得到（移動模擬）、不經過活動點、阿哲、明軒站的地方',KEEP.length===3&&!bad.length,bad.slice(0,5).join('｜')||KEEP.map(k=>k[3]).join('、'));
  const s1=all.map(n=>n.crowdKey+'@'+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).sort().join('|'); enter(mkG(FRI,17.75)); const s2=court().map(n=>n.crowdKey+'@'+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)).sort().join('|');
  check('1. 同一天同一時段出去再進來：同一批人、同一些位置（D55）',s1.length>0&&s1===s2);
  check('1. 一場最多 11 個完整人物（手機效能）',all.length<=11,String(all.length)); }
// ---------- 2. 時段 ----------
{ const c=[[17.4,'17:24'],[19.05,'19:03'],[16,'16:00']].map(([h,t])=>{ enter(mkG(FRI,h)); return t+'＝'+court().length; });
  check('2. 練球日 17:30 以前、19:00 以後：球場沒有人',c.every(s=>/＝0$/.test(s)),c.join(' / ')); }
{ const G=mkG(FRI,18.95), GM=enter(G); const n0=court().length; for(let i=0;i<8;i++){ G.hour+=0.02; CROWD.tick(GM,1.5); } const L=court();
  check('2. 19:00 一到（時間沒有跳）：大家不再跑、走向南邊的路（走開，不是原地消失）',n0>=8&&L.length===n0&&L.every(n=>n.leaving&&n.beh!=='route'&&!n.run),n0+' → '+L.filter(n=>n.leaving).length+' 個走開');
  G.hour+=1; CROWD.tick(GM,1.5); check('2. 之後時間跳了：直接拿掉',court().length===0,String(court().length)); }
{ const G=mkG(FRI,17.45), GM=enter(G); const n0=court().length; for(let i=0;i<4;i++){ G.hour+=0.02; CROWD.tick(GM,1.5); } const L=court();
  check('2. 17:30 開始、玩家在球場邊看得到：從南邊的路走進來（不是憑空出現在場上）',n0===0&&L.length>=8&&L.every(n=>n.obj.position.z>-102),n0+' → '+L.length+' 人，'+L.slice(0,3).map(n=>n.obj.position.x.toFixed(1)+','+n.obj.position.z.toFixed(1)).join(' ')); }
// ---------- 3、4. 非練球日、國定假日：沒有人、有提示 ----------
const spots=(key,h)=>{ const G=mkG(key,h), its=[]; CLS.addActSpots({E:{interactables:its},G},'campus'); const hs=[]; if(CLS.addActHints) CLS.addActHints({E:{interactables:hs},G},'campus'); return {G,act:its.filter(i=>i.actSpot==='dept_basketball'),hint:hs.filter(i=>i.actHint==='dept_basketball')}; };
{ enter(mkG(THU,17.75)); const n=court().length; const s=spots(THU,17.75), h=s.hint[0];
  check('3. 非練球日（10/16 週四 17:45，使用者的存檔）：球場沒有人、沒有「系籃練球」的參加點',n===0&&s.act.length===0,n+' 人、參加點 '+s.act.length);
  check('3. 集合點有提示「系籃練球（星期五 17:30）」（遠遠看得到：mark）、在活動點、只看不參加',!!h&&h.label==='系籃練球（星期五 17:30）'&&h.mark===true&&Math.hypot(h.x-3.3,h.z+112.7)<0.01&&!h.onInteract&&!h.exit,h&&h.label);
  const t=h?h.look:''; check('3. 按了寫時間地點、今天沒有、下一次是 10/17（五）',/每週五 17:30–19:00/.test(t)&&/籃球場/.test(t)&&/今天沒有系籃練球/.test(t)&&/下一次：10\/17（五）17:30/.test(t),t); }
{ enter(mkG(FRI,17.75)); const s=spots(FRI,17.75); const h=s.hint[0];
  check('3. 練球日：參加點照舊（「系籃練球」），提示藏起來（hidden）或沒有',s.act.length===1&&s.act[0].label==='系籃練球'&&(!h||h.hidden===true),'參加點 '+s.act.length+'、提示 '+(h?'hidden='+h.hidden:'沒有')); }
{ const s=spots(Y1S2FRI,17.75), w16=spots(W16,17.75);
  check('3. 大一下（沒有系籃練球）：沒有提示；第 16 週：提示寫「這學期的系籃練球結束了」',s.hint.length===0&&w16.hint.length===1&&/這學期的系籃練球結束了/.test(w16.hint[0].look),w16.hint[0]&&w16.hint[0].look); }
{ const A=ACTIVITIES.list.find(a=>a.id==='dept_basketball'), d=dayOf(HOL); enter(mkG(HOL,17.75)); const n=court().length, s=spots(HOL,17.75), h=s.hint[0];
  check('4. 國定假日（10/10 週五國慶，第 6 週）：ACTIVITIES.on 照規則不算練球 → 球場沒有人、沒有參加點',CALENDAR.holiday(d)&&!ACTIVITIES.on(A,d,{flags:{}})&&n===0&&s.act.length===0,'holiday='+CALENDAR.holiday(d)+'、'+n+' 人、參加點 '+s.act.length);
  check('4. 國定假日的提示：「今天國慶日，系籃練球停一次」、下一次 10/17',!!h&&/今天國慶日，系籃練球停一次/.test(h.look)&&/下一次：10\/17（五）/.test(h.look),h&&h.look); }
// ---------- 5. 聽一句 ----------
{ said.length=0; const G=mkG(FRI,17.75), GM=enter(G); const run=role('bball_run'), side=court().filter(n=>n.crowdRole!=='bball_run');
  const H=CROWD.GYM_HEAR.basketball, ok=H.L.filter((t,i)=>!(H.W&&H.W[i]));
  check('5. 打球的人可以點（聽一句）、不擋活動點和阿哲明軒（yieldIt）；場邊的人不能點',run.length>0&&run.every(n=>n.talkLabel==='聽一句'&&typeof n.talk==='function'&&n.yieldIt===true)&&side.every(n=>!n.talk));
  (async()=>{ for(const n of run.slice(0,ok.length+1)) await n.talk(); const got=said.map(s=>s[1]);
    check('5. 句子是體育館籃球場那一組沒有指定說話的人的（不說「明天系盃」那句化學系的）、同一次進來不重複、用完了就不說',got.length===ok.length&&new Set(got).size===got.length&&got.every(t=>ok.includes(t))&&said.every(s=>s[0]==='打球的人'),JSON.stringify(said));
    const r=cp.spawnSync(process.execPath,[__filename,'--sched'],{encoding:'utf8'}); process.stdout.write(r.stdout||''); if(r.status!==0){ fails++; if(r.stderr) console.log('FAIL 6. 作息的行程出錯　'+String(r.stderr).split('\n').slice(0,3).join(' ')); }
    console.log(fails?('\n'+fails+' 項 FAIL'):'\nALL PASS'); process.exit(fails?1:0); })(); }
