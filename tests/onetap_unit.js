// 一鍵（ONE-TAP-GO-1103，USER_WANTS X189）——不需要瀏覽器。
// 使用者 2026-11-03：「下一個版本新增一個 回宿舍睡覺 按了 直接回宿舍直接睡覺 要有防誤觸的確認」「一鍵睡覺 一鍵到下一堂課教室 一鍵下一個約會地點」。
// 用遊戲真正的 story3d.js（床：bedScene → goToBed → sleepNow）、classes3d.js（CLS.goClass → skipTo → 進教室 → seatPick）＋ src/onetap3d.js；GM 是假的（同 tests/dorm_sleep_scene_unit.js）。
// 出遊／當面約／校外約會（OUT、INV、DATE）是假的：只看一鍵有沒有走它們原本的出發函式（OUT.go、INV.goNow、DATE 的 departed）。
// 檢查：
//   A 不能按：劇情中、有人跟著、在家的選單裡＝三項都不能按（寫原因）；白天不能睡（寫原因）；今天沒課／課上完了；今天沒有約（有下一個就寫下一個）
//   B 確認框內容：要去哪、現在幾點、路程、睡到幾點／會跳到幾點出門、會錯過什麼
//   C 取消＝什麼都不做（不換區域、不換日子、不出發）
//   D 回去睡覺：人在校園＝進宿舍房間（dorm）、爬上床、睡到明天（G.day+1、醒來時間＝床的第一個選項）；已經在房間＝不換區域直接睡；
//      劇情優先（除夕要回家 HOME.eveDue）＝先演那一段不睡；住家裡＝HOME.go，家裡的選單直接選「睡覺」（有該出發的約不代選）；美國＝回公寓睡；日本＝JP.bedFromRoom
//   E 到下一堂課：CLS.goClass（時間還早先跳到出門時間）→ 進教室 → 直接坐老位子／中間的位子（不問座位選單）→ 上課（seatMenu autoClass）
//   F 到下一個約會地點：還早＝先跳過時間（CLS.skipTo）到出發時間再出發（OUT.go）；時間到了＝直接 OUT.go；當面約＝INV.goNow；校外約會＝trip 標 going
// 修改前（33e25bdcb）：沒有 src/onetap3d.js（第 1 項就失敗）。用法：node tests/onetap_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=process.env.SRC_ROOT?path.resolve(process.env.SRC_ROOT):path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,remember(){},meet(){}};
let GM=null;
global.EVENTS={npcOf:id=>GM&&GM.npc[id]||null,onEnter(){},tick(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true,introDone:true};
function mkGM(o){ o=o||{}; const G={day:o.day||6,weekday:(3+(o.day||6)-1)%7,hour:o.hour!=null?o.hour:22,flags:Object.assign({},F0,o.flags||{}),social:{},zone:o.zone||'campus',goal:'',stage:'law',money:20000,stats:{steps:0,classes:0,study:0},visited:{},daily:{},events:{done:{}},weather:'clear',invites:[]};
  const P={obj:mkObj(),pose:'idle',idlePose:'idle',busy:false,lv:0,radius:0.32}; P.obj.position.set(30,0,-90);
  const E={zone:{id:G.zone},player:P,npcs:[],interactables:[],toneK:1,hour:G.hour,cam:{mode:'follow'},q:{level:'high'},levels:null,indoor:true,
    placeAt(ent,x,z){ ent.obj.position.x=x; ent.obj.position.z=z; ent.obj.position.y=0; },prePose(){},applyTime(){},endCinematic(){ this.cam.mode='follow'; },setWeather(){},addNPC(n){ this.npcs.push(n); return n; },canStand:()=>true};
  const gm={G,E,npc:{},extras:[],D:{active:false,busyDepth:0},loadGen:0,turbo:false,frames:[],enters:[],log:[],depth:0,chooses:[],seatMenus:[]};
  const frame=tag=>gm.frames.push({tag,pose:P.pose,zone:G.zone,day:G.day,hour:G.hour});
  gm.sleep=async()=>{ frame('sleep'); }; gm.fade=async on=>{ frame(on?'fade1':'fade0'); if(on&&gm.onBlack){ const cb=gm.onBlack; gm.onBlack=null; cb(); } };
  gm.walkTo=async(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; return true; }; gm.cine=()=>{ E.cam.mode='cinematic'; };
  gm.sceneBegin=()=>{ gm.depth++; P.busy=true; }; gm.sceneEnd=()=>{ gm.depth=Math.max(0,gm.depth-1); if(!gm.depth){ P.busy=false; E.endCinematic(); } };
  gm.choose=async(opts,opt)=>{ gm.chooses.push({opts,opt}); return o.pick?o.pick(opts):0; };
  gm.titleCard=async(a,b)=>{ gm.log.push('title:'+a+' '+(b||'')); };
  gm.enter=async(zone,spawn,opts)=>{ opts=opts||{}; gm.enters.push({zone,spawn}); G.zone=zone; E.zone={id:zone}; P.obj.position.set(spawn?spawn.x:0,0,spawn?spawn.z:0); P.pose='idle'; P.seat=null;
    try{ STORY.populate(zone,gm); }catch(e){} if(gm.onEnterZone) gm.onEnterZone(zone); if(opts.onLoaded) opts.onLoaded(E.zone); frame('entered'); };
  gm.advance=h=>{ G.hour+=h; E.hour=G.hour; }; gm.setGoal=()=>{}; gm.autosave=()=>{}; gm.money=()=>{}; gm.toast=t=>gm.log.push('toast:'+t); gm.caption=(a,t)=>gm.log.push('cap:'+t);
  gm.memo=()=>{}; gm.updateHUD=()=>{}; gm.standUp=ent=>{ ent.pose='idle'; ent.seat=null; }; gm.say=async()=>{}; gm.isEntering=()=>false;
  gm.seatMenu=async(it,so)=>{ gm.seatMenus.push({it,so}); P.seat=it.seat; };
  gm.spawnNPC=(id)=>{ const n=E.addNPC({obj:mkObj(),id}); gm.npc[id]=n; return n; }; gm.spawnCharacter=()=>null; gm.removeNPC=id=>{ delete gm.npc[id]; }; gm.knownIds=()=>[];
  GM=gm; return gm; }
let loadErr=null;
try{ for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|DORM_ROOM)\s*=/mg,'global.$1='),{filename:f});
  global.GAME=mkGM({});   /* onetap3d.js 載入時包 GAME.choose（住家裡：回到家的選單直接選睡覺）*/
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/onetap3d.js'),'utf8').replace(/^const ONETAP\s*=/m,'global.ONETAP='),{filename:'src/onetap3d.js'}); }catch(e){ loadErr=e; }
check('1 有 src/onetap3d.js（ONETAP.plan／run，三項：回去睡覺、到下一堂課、到下一個約會地點）',!loadErr&&typeof ONETAP!=='undefined'&&typeof ONETAP.run==='function'&&ONETAP.ITEMS.map(i=>i.k).join(',')==='sleep,cls,date',loadErr?String(loadErr).slice(0,160):'');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const realOnEnter=STORY.onEnter; STORY.onEnter=async function(){};
const yes=async()=>true, no=async()=>false;
const T=(G)=>G.day*24+G.hour;
(async()=>{
  /* ===== A 不能按 ===== */
  { const gm=mkGM({day:6,hour:22}); gm.E.player.busy=true; const P=ONETAP.plans(gm);
    check('A1 劇情進行中（player.busy）：三項都不能按、寫「劇情進行中」',!P.sleep.ok&&!P.cls.ok&&!P.date.ok&&[P.sleep,P.cls,P.date].every(p=>p.why==='劇情進行中'),JSON.stringify([P.sleep.why,P.cls.why,P.date.why])); }
  { const gm=mkGM({day:6,hour:22}); gm.D.active=true; check('A2 對話中（D.active）：不能按',!ONETAP.plan(gm,'sleep').ok&&!ONETAP.plan(gm,'cls').ok); }
  { const gm=mkGM({day:6,hour:22,flags:{companion:'an'}}); const P=ONETAP.plans(gm); check('A3 有人跟著（G.flags.companion）：三項都不能按、寫原因',!P.sleep.ok&&!P.cls.ok&&!P.date.ok&&/一起/.test(P.sleep.why),P.sleep.why); }
  { const gm=mkGM({day:6,hour:10}); const p=ONETAP.plan(gm,'sleep'); check('A4 白天 10:00：不能直接睡、寫「晚上（17:30 以後）才能直接睡；白天可以回去用床小睡」',!p.ok&&/晚上/.test(p.why)&&/小睡/.test(p.why),p.why); }
  { const gm=mkGM({day:6,hour:20.5}); const p=ONETAP.plan(gm,'cls'); check('A5 9/22 週一 20:30（09:10 憲法、15:30 體育都過了）：到下一堂課不能按、寫「今天的課已經上完了」',!p.ok&&/上完/.test(p.why),p.why); }
  { const gm=mkGM({day:5,hour:10}); const p=ONETAP.plan(gm,'cls'); const its=CLS.dayItems(gm.G).length; check('A6 9/21 週日：今天沒有課',its===0&&!p.ok&&p.why==='今天沒有課',its+' '+p.why); }
  { const gm=mkGM({day:6,hour:18}); global.OUT={rec:G=>[],trip:(G,q)=>({travelH:0.5,travel:'捷運'}),go:async()=>true,tt:t=>t}; const p=ONETAP.plan(gm,'date'); check('A7 沒有任何約：到下一個約會地點不能按、寫「今天沒有約」',!p.ok&&p.why==='今天沒有約',p.why);
    const L=[{id:'o1',state:'planned',day:8,h:15,title:'和以安去貓空',place:'貓空'}]; OUT.rec=()=>L; const p2=ONETAP.plan(gm,'date'); check('A8 只有後天的約：不能按、寫「今天沒有約（下一個：9/24 15:00 和以安去貓空）」',!p2.ok&&/下一個：9\/24 15:00 和以安去貓空/.test(p2.why),p2.why); delete global.OUT; }
  /* ===== B／C／D 回去睡覺 ===== */
  { const gm=mkGM({day:6,hour:22,zone:'campus'}); const p=ONETAP.plan(gm,'sleep'); const want=STORY.bedOptions(Object.assign({},gm.G,{hour:22+p.mins/60})).find(q=>q.kind==='sleep');
    check('B1 22:00 在校園：可以按；確認框寫去宿舍 203、現在週一 22:00、路程幾分鐘、睡到幾點（床的第一個睡覺選項）',p.ok&&/宿舍 203/.test(p.lines[0])&&p.lines.includes('現在：週一 22:00')&&p.lines.some(l=>/^路程：約 \d+ 分鐘/.test(l))&&p.lines.some(l=>l.startsWith('睡：'+want.t)),JSON.stringify(p.lines));
    const d0=gm.G.day, h0=gm.G.hour; ONETAP.confirmUI=no; const r=await ONETAP.run(gm,'sleep');
    check('C1 回去睡覺按「取消」：什麼都不做（不換區域、不換日子、時間不動）',r===false&&gm.enters.length===0&&gm.G.day===d0&&gm.G.hour===h0&&gm.G.zone==='campus',JSON.stringify({r,enters:gm.enters.length,day:gm.G.day-d0}));
    ONETAP.confirmUI=yes; const r2=await ONETAP.run(gm,'sleep'); const lie=gm.frames.some(f=>f.pose==='lie'&&f.zone==='dorm');
    check('D1 按「確定」：先進宿舍房間（dorm，落點 0,2.4）→ 爬上床（躺下）→ 睡到明天（第二天、醒來時間＝'+want.t+'）',r2===true&&gm.enters[0]&&gm.enters[0].zone==='dorm'&&gm.enters[0].spawn&&gm.enters[0].spawn.z===2.4&&lie&&gm.G.day===d0+1&&Math.abs(gm.G.hour-want.wake)<1e-6,JSON.stringify({enters:gm.enters.map(e=>e.zone),lie,day:gm.G.day-d0,hour:gm.G.hour,want:want.wake}));
    check('D1b 床的選單沒有跳出來（不問「睡到明天早上／中午…」）',!gm.chooses.some(c=>c.opts.some(o=>/睡到明天/.test(o.t))),JSON.stringify(gm.chooses.map(c=>c.opts.map(o=>o.t)))); }
  { const gm=mkGM({day:6,hour:23,zone:'dorm'}); gm.E.player.obj.position.set(-0.5,0,2); const d0=gm.G.day; ONETAP.confirmUI=yes; const p=ONETAP.plan(gm,'sleep'); await ONETAP.run(gm,'sleep');
    check('D2 已經在房間（23:00）：路程寫「你就在這裡」、不先換區域、直接上床睡到明天',p.lines.includes('你就在這裡')&&gm.G.day===d0+1&&gm.frames.findIndex(f=>f.pose==='lie')>=0&&gm.frames.findIndex(f=>f.pose==='lie')<gm.frames.findIndex(f=>f.tag==='entered'),JSON.stringify({lines:p.lines,day:gm.G.day-d0})); }
  { const gm=mkGM({day:6,hour:22,zone:'campus'}); let eve=0; global.HOME={eveDue:()=>true,eveGo:async()=>{ eve++; },at:()=>false}; ONETAP.confirmUI=yes; const d0=gm.G.day; await ONETAP.run(gm,'sleep');
    check('D3 劇情優先：除夕要回家（HOME.eveDue）＝到了床邊先演回家那一段（HOME.eveGo），不睡',eve===1&&gm.G.day===d0,JSON.stringify({eve,day:gm.G.day-d0})); delete global.HOME; }
  { const gm=mkGM({day:6,hour:22,zone:'campus'}); let picked=null, picked2=null; ONETAP.confirmUI=yes;
    global.HOME={at:()=>false,baseMode:()=>true,canGo:()=>true,livesHome:()=>true,go:async GM=>{ const O=[{t:'吃晚餐',k:'eat'},{t:'存檔',k:'save'},{t:'睡覺',k:'sleep'},{t:'回宿舍',k:'back'}]; picked=O[await GAME.choose(O,{menu:true})]; return true; }};
    const pg=GAME; GAME.G=gm.G; GAME.E=gm.E; const p=ONETAP.plan(GAME,'sleep');
    check('D4a 住家裡（HOME.baseMode）：確認框寫回家、路程 30 分鐘、回到家直接選「睡覺」',p.ok&&/家/.test(p.lines[0])&&p.lines.includes('路程：約 30 分鐘')&&p.lines.some(l=>/直接選「睡覺」/.test(l)),JSON.stringify(p.lines));
    await ONETAP.run(GAME,'sleep'); check('D4b 按確定：HOME.go，家裡的選單直接選「睡覺」（不問）',picked&&picked.k==='sleep'&&ONETAP._autoSleep===false,JSON.stringify(picked));
    HOME.go=async()=>{ const O=[{t:'出發：和以安看電影',k:'out'},{t:'睡覺',k:'sleep'}]; picked2=O[await GAME.choose(O,{menu:true})]; return true; }; GAME.chooses=[]; await ONETAP.run(GAME,'sleep');
    check('D4c 家裡的選單有該出發的約（out）：不代選、讓玩家看選單（假選單回第一個）',picked2&&picked2.k==='out'&&GAME.chooses.length===1,JSON.stringify(picked2)); delete global.HOME; }
  { const gm=mkGM({day:6,hour:22,zone:'us_outside'}); global.EXCH={inUS:G=>/^us_/.test(G.zone),SPAWN:{us_apartment:{x:0,z:2,yaw:Math.PI}}}; ONETAP.confirmUI=yes; const d0=gm.G.day; const p=ONETAP.plan(gm,'sleep'); await ONETAP.run(gm,'sleep');
    check('D5 在美國（社區）：回公寓（us_apartment）睡到明天',/公寓/.test(p.lines[0])&&gm.enters[0]&&gm.enters[0].zone==='us_apartment'&&gm.G.day===d0+1,JSON.stringify({line:p.lines[0],enters:gm.enters.map(e=>e.zone),day:gm.G.day-d0})); delete global.EXCH; }
  { const gm=mkGM({day:6,hour:22,zone:'jp_town'}); let bf=0; global.JP={inJapan:()=>true,bedFromRoom:async()=>{ bf++; return true; }}; ONETAP.confirmUI=yes; const p=ONETAP.plan(gm,'sleep'); await ONETAP.run(gm,'sleep');
    check('D6 在日本：JP.bedFromRoom（回據點，據點的選單照舊睡）',p.ok&&/日本/.test(p.lines[0])&&bf===1,JSON.stringify({line:p.lines[0],bf})); delete global.JP; }
  /* ===== E 到下一堂課 ===== */
  { const gm=mkGM({day:6,hour:8,zone:'dorm'}); gm.E.player.obj.position.set(0,0,2.4); const p=ONETAP.plan(gm,'cls');
    check('E1 9/22 週一 08:00 在宿舍：下一堂是 09:10 的課；確認框寫教室、時間、路程、先跳到幾點出門、到教室幾點、直接坐位子',p.ok&&p.it&&Math.abs(p.it.t0-(9+1/6))<1e-6&&p.lines.includes('現在：週一 08:00')&&p.lines.some(l=>/^路程：走路 \d+ 分鐘/.test(l))&&p.lines.some(l=>/會先跳過時間到 \d\d:\d\d 出門/.test(l))&&p.lines.some(l=>/^到教室：09:00，直接坐/.test(l)),JSON.stringify(p.lines));
    const rm=p.it.room; gm.onEnterZone=z=>{ if(z===rm.zone){ for(let i=0;i<4;i++) gm.E.interactables.push({seat:{x:i,z:1,yaw:0,room:rm.room,lv:0}}); } };
    ONETAP.confirmUI=no; await ONETAP.run(gm,'cls'); check('C2 到下一堂課按「取消」：不跳時間、不進教室',gm.G.hour===8&&gm.enters.length===0);
    ONETAP.confirmUI=yes; await ONETAP.run(gm,'cls');
    const seatAsk=gm.chooses.some(c=>c.opts.some(o=>o.t==='自己找位子'));
    check('E2 按「確定」：先跳到出門時間、走到那一棟（進 '+rm.zone+'）、直接坐下上課（seatMenu autoClass）、不問座位選單',gm.enters.some(e=>e.zone===rm.zone)&&gm.seatMenus.length===1&&gm.seatMenus[0].so&&gm.seatMenus[0].so.autoClass===true&&!seatAsk&&Math.abs((gm.G.hour%24)-9)<0.02,JSON.stringify({enters:gm.enters.map(e=>e.zone),seat:gm.seatMenus.length,hour:gm.G.hour,seatAsk})); }
  { const gm=mkGM({day:6,hour:8,zone:'dorm'}); const rm=CLS.goList(gm.G)[0].room; gm.onEnterZone=z=>{ if(z===rm.zone) for(let i=0;i<4;i++) gm.E.interactables.push({seat:{x:i,z:1,yaw:0,room:rm.room,lv:0}}); };
    const R=CLS.rec(gm.G); R.seat=R.seat||{}; const cid=CLS.goList(gm.G)[0].c.id; R.seat[cid]={zone:rm.zone,room:rm.room||null,x:2,z:1,lv:0}; const p=ONETAP.plan(gm,'cls'); ONETAP.confirmUI=yes; await ONETAP.run(gm,'cls');
    check('E3 有老位子：確認框寫「直接坐老位子」、坐的就是老位子',p.lines.some(l=>/直接坐老位子/.test(l))&&gm.seatMenus[0]&&gm.seatMenus[0].it.seat.x===2,JSON.stringify({line:p.lines.find(l=>/坐/.test(l)),seat:gm.seatMenus[0]&&gm.seatMenus[0].it.seat})); }
  /* ===== F 到下一個約會地點 ===== */
  { const mkOut=()=>{ const L=[], gone=[]; global.OUT={rec:G=>L,trip:(G,q)=>({travelH:0.5,travel:'捷運＋公車 約 30 分鐘'}),go:async(GM,q)=>{ gone.push({q,at:T(GM.G)}); q.state='done'; return true; },tt:t=>t}; return {L,gone}; };
    { const gm=mkGM({day:6,hour:17,zone:'campus'}); const {L,gone}=mkOut(); L.push({id:'o1',state:'planned',day:6,h:19,title:'和以安去看電影',place:'西門町'});
      const p=ONETAP.plan(gm,'date'); check('F1 17:00、19:00 約在西門町（車程 30 分鐘）：確認框寫去哪、現在、路程、先跳到 18:15 出發（等 1 小時 15 分）、到了直接到 19:00',p.ok&&/和以安去看電影（19:00），西門町/.test(p.lines[0])&&p.lines.includes('現在：週一 17:00')&&p.lines.includes('路程：捷運＋公車 約 30 分鐘')&&p.lines.some(l=>/先跳過時間到 18:15 出發（等 1 小時 15 分/.test(l))&&p.lines.some(l=>/直接到 19:00/.test(l)),JSON.stringify(p.lines));
      ONETAP.confirmUI=no; await ONETAP.run(gm,'date'); check('C3 約會按「取消」：不跳時間、不出發',gone.length===0&&gm.G.hour===17);
      ONETAP.confirmUI=yes; await ONETAP.run(gm,'date'); check('F2 按「確定」：先照跳過時間的規則跳到 18:15（CLS.skipTo）、再走出遊原本的出發（OUT.go）',gone.length===1&&gone[0].q.id==='o1'&&Math.abs(gone[0].at-(6*24+18.25))<0.02,JSON.stringify(gone.map(g=>g.at-6*24))); }
    { const gm=mkGM({day:6,hour:18.3,zone:'campus'}); const {L,gone}=mkOut(); L.push({id:'o2',state:'planned',day:6,h:19,title:'和以安去看電影',place:'西門町'}); ONETAP.confirmUI=yes; const p=ONETAP.plan(gm,'date'); await ONETAP.run(gm,'date');
      check('F3 18:18（已經是出發的時候）：確認框不寫「先跳過時間」、直接 OUT.go',!p.lines.some(l=>/先跳過/.test(l))&&gone.length===1&&Math.abs(gone[0].at-(6*24+18.3))<1e-6,JSON.stringify(p.lines)); }
    { const gm=mkGM({day:6,hour:18.3,zone:'campus'}); const {L,gone}=mkOut(); L.push({id:'v',state:'planned',day:6,h:19,title:'和可昕視訊',place:'視訊',verb:'接起來'}); const p=ONETAP.plan(gm,'date');
      check('F4 視訊、電話（不用出門）不算約會地點',!p.ok&&p.why==='今天沒有約',p.why); }
    { const gm=mkGM({day:6,hour:18.3,zone:'campus'}); const {L,gone}=mkOut(); const tp={trip:'t1',status:'booked',kind:'day'}; global.DATE={trip:()=>tp,stillOn:()=>({ok:true}),prompt:async()=>'go'};
      L.push({id:'date_t1',state:'planned',day:6,h:19,title:'和芷若去淡水',place:'淡水',dateTrip:'t1'}); ONETAP.confirmUI=yes; await ONETAP.run(gm,'date');
      check('F5 校外約會：照 DATE.early 的「現在出發」（trip 標 departed、going）再 OUT.go',gone.length===1&&tp.departed===true&&tp.status==='going',JSON.stringify(tp)); delete global.DATE; }
    delete global.OUT; }
  { const gm=mkGM({day:6,hour:11.8,zone:'campus'}); const iv={id:'i1',state:'accepted',day:6,h:12,who:'heroine_01',place:'cafe1'}; gm.G.invites=[iv]; let went=0;
    global.INV={WAIT_H:0.5,place:()=>({zone:'cafe',name:'兩點半 Café'}),goTarget:()=>({zone:'cafe',name:'兩點半 Café',spawn:null}),goNow:async()=>{ went++; return true; }};
    const p=ONETAP.plan(gm,'date'); ONETAP.confirmUI=yes; await ONETAP.run(gm,'date');
    check('F6 當面約（12:00 兩點半 Café）：確認框寫和誰約在哪；按確定走 INV.goNow（手機「前往」同一個）',p.ok&&/約在兩點半 Café（12:00）/.test(p.lines[0])&&went===1,JSON.stringify({lines:p.lines,went}));
    gm.G.zone='cafe'; const p2=ONETAP.plan(gm,'date'); check('F7 已經在約好的地方：不能按、寫原因',!p2.ok&&/已經在約好的地方/.test(p2.why),p2.why); delete global.INV; }
  /* ===== 防誤觸（畫面那一層：只看邏輯）===== */
  { const gm=mkGM({day:6,hour:22}); let asked=0; ONETAP.confirmUI=async()=>{ asked++; return false; }; await ONETAP.run(gm,'sleep'); await ONETAP.run(gm,'cls');
    check('G1 每一項都一定先問確認（不能一點就走）；不能按的那一項不跳確認框、只寫原因',asked===1&&gm.log.some(t=>/toast:今天的課已經上完了/.test(t)),JSON.stringify({asked,log:gm.log})); }
  { const src=fs.readFileSync(path.join(ROOT,'src/onetap3d.js'),'utf8'), html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('G2 畫面：index.html 有 #btnGo（HUD 右上）、#goPop、#goConfirm（取消在前、確定在後）、載入 onetap3d.js；預設焦點在取消、剛跳出來 0.45 秒內按確定不算',/id="btnGo"/.test(html)&&/id="goPop"/.test(html)&&/id="goCfNo">取消<\/button><button class="btn pri" id="goCfYes">確定/.test(html)&&/src="src\/onetap3d\.js/.test(html)&&/no\.focus/.test(src)&&/Date\.now\(\)-shownAt<450/.test(src)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(fails+1)); process.exit(1); });
