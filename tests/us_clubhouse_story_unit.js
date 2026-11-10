// 美國社區的會所在 3D（US-CLUBHOUSE-3D-1110 劇情接線，AA_741 企劃線 bd4f5df43；src/us_life3d.js 的 USL）——不需要瀏覽器。
// 兩個行程：
//   --zones：three.js＋引擎＋真正的 us_clubhouse_in 區域（src/us_clubhouse3d.js、layout，LAWWW2 212f42660），把座位、互動點、z.npc、z.events、出生點印成 JSON；
//   主行程：pg_harness（劇情、系統）＋美國篇的檔案，Z3.ZONES.us_clubhouse_in 換成「照真正區域的資料建的」假區域，假的 GM／E 記錄進出區域、誰坐哪、說了什麼。
// 檢查（AA_741）：
//   A 門口：開著＝走進 3D 門廳（不再跳「讀書／離開」選單、不開 2D 背景）；關著照舊那一句；9/4 烤肉、9/1 起的公告照舊；沒有 3D 會所＝照舊 2D 選單；10/12 也是走進 3D
//   B 自習室的 16 個座位坐下＝讀書（seatMenu 的 it.study）；交誼廳的座位不是；「看櫃台」＝AA_287 那一句
//   C 何俊朗：平日 19～22（有 MET_LONG）坐自習室靠窗那張的老位子、看書、不能聊；走到 3 m 內才說招呼（S.longGreet）、一天一次、隔天再一次；
//     週末、秋假、感恩節、沒見過他＝不在；12/9（六）在、說 long1209；時間過了、玩家走遠＝拿掉
//   D 學姊：10 月起週二、四 19～21 在最裡面角落、看書；按她＝「她在讀書。」；走進自習室旁白一天一次——
//     交往中 sisStudyDating（之前她旁邊那張放外套、之後空出來、提示「坐她旁邊」；何俊朗在＝他接 longSisThere，3 m 的招呼不再重複那一句）；
//     挽回中 sisStudyRepair（外套一直在、那張不能坐）；九月、18:00 不在
//   E 住戶：交誼廳 2～4、自習室 0～2、辦公室的人平日 09～17；都不能聊；關門時間沒有人
//   F 劇情在 3D：10/4 long3（公布欄的單子、他在老位子、你坐旁邊）、10/12 fb_study（走到她桌子旁邊、自習室沒有別人、不另外出「抬頭看了你一眼」）、
//     10/18 sis_plan_us（並排、讀書計畫）、11/23 thanks_long（販賣機前 → 淡出淡入坐到自習室窗邊何俊朗那張桌子，AA 11-10 17:14；會所沒有別人）、12/14 晚餐（併桌 10 人、學姊主位、室友兩邊、何俊朗對面、聖誕樹、CG 照舊）；
//     背景 freeze、scene 不換 2D 背景、台詞一字不差；演完回到原本的地方；原本的事件資料沒改；沒有 3D 會所＝照舊 2D
//   G 存檔：舊存檔（沒有 usLife）照常；在會所裡的存檔讀回來：人照時間在；讀檔的鎖；會所算在美國、手機地點有名字
// 這是 Node 模擬（資料、流程），畫面要 CC 在使用者電腦拍（D131）。用法：node tests/us_clubhouse_story_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const CZ='us_clubhouse_in';

/* ============ 真正的區域（另一個行程）============ */
if(process.argv[2]==='--zones'){
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_clubhouse_layout.js','src/us_clubhouse3d.js']){
    let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES[CZ].build(E); const sid=s=>s&&s.id?s.id:null, P=o=>o?{x:o.x,z:o.z,yaw:o.yaw||0}:null;
  const lay=US_CLUBHOUSE_LAYOUT;
  const its=E.interactables.map(i=>({x:i.x,z:i.z,radius:i.radius,label:i.label,seat:sid(i.seat),usClubStudy:!!i.usClubStudy,usClubLook:i.usClubLook||null,exit:i.exit?i.exit.to:null}));
  const api=['setDinner','setSisCoat','setNotice','setPlan','seatById','refreshState'].filter(k=>typeof z[k]==='function');
  z.setSisCoat(true); const coatHidden=E.interactables.find(i=>i.seat&&i.seat.id===lay.npc.sisNext).hidden; z.setSisCoat(false);
  process.stdout.write(JSON.stringify({seats:z.seats.map(s=>({id:s.id,x:s.x,z:s.z,yaw:s.yaw,room:s.room,study:!!s.study,ap:s.ap||null,set:(lay.seats.find(q=>q.id===s.id)||{}).set||null})),its,api,coatHidden,
    npc:{long:sid(z.npc.long),longNext:sid(z.npc.longNext),sis:sid(z.npc.sis),sisNext:sid(z.npc.sisNext),sisStand:P(z.npc.sisStand),office:P(z.npc.office),lounge:lay.npc.lounge,study:lay.npc.study},
    events:lay.events,spawn:z.spawn,SPAWN:US_CLUBHOUSE.SPAWN}));
  process.exit(0);
}

let ZD=null; try{ ZD=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--zones'],{cwd:ROOT,maxBuffer:1<<24}).toString()); }catch(e){ console.log('FAIL 0. 建不出真正的 us_clubhouse_in 區域  '+String(e.message).slice(0,300)); console.log('FAILED: 1'); process.exit(1); }

/* ============ 劇情、系統（pg_harness＋美國篇）============ */
const H=require('./pg_harness.js'); const USL_SRC=require('fs').readFileSync(require('path').join(__dirname,'..','src','us_life3d.js'),'utf8');
const {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{}; CG_REGISTRY.cg_last_dinner_heroine05=CG_REGISTRY.cg_last_dinner_heroine05||{image:'x'};   /* 晚餐的 CG 有登錄（遊戲裡有圖）*/
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY|R3_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_clubhouse_layout.js','src/us_clubhouse3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r3_events.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const X=US_LIFE_EVENTS.DATA;
/* 假的會所：座位、互動點、z.npc、z.events、切換都照真正區域的資料（ZD）；每次進區域重建（座位是新的物件，和遊戲一樣）*/
const mkZone=()=>{ const seats=ZD.seats.map(s=>Object.assign({lv:0},s)), byId={}; for(const s of seats) byId[s.id]=s;
  const pick=v=>v==null?null:(typeof v==='string'?byId[v]||null:Object.assign({},v));
  const z={id:CZ,seats,spawn:Object.assign({},ZD.spawn),roomAt:()=>null,dinnerOn:false,sisCoatOn:false,noticeOn:false,planOn:false,seatById:id=>byId[id]||null,
    npc:{long:pick(ZD.npc.long),longNext:pick(ZD.npc.longNext),sis:pick(ZD.npc.sis),sisNext:pick(ZD.npc.sisNext),sisStand:pick(ZD.npc.sisStand),office:pick(ZD.npc.office),
      lounge:ZD.npc.lounge.map(q=>q.seat?Object.assign({kind:q.kind},byId[q.seat]):Object.assign({},q)),study:ZD.npc.study.map(pick)},events:{}};
  for(const k in ZD.events){ const e=ZD.events[k], o={}; for(const f in e){ const v=e[f]; if(f==='note') continue; o[f]=Array.isArray(v)?v.map(pick):(v&&typeof v==='object'&&!('x' in v)?Object.fromEntries(Object.entries(v).map(([a,b])=>[a,pick(b)])):(typeof v==='string'?pick(v):v)); } z.events[k]=o; }
  z.setDinner=on=>{ z.dinnerOn=!!on; }; z.setSisCoat=on=>{ z.sisCoatOn=!!on; }; z.setNotice=on=>{ z.noticeOn=!!on; }; z.setPlan=on=>{ z.planOn=!!on; };
  E.interactables=ZD.its.map(i=>{ const it=Object.assign({lv:0},i); if(i.seat){ const s=byId[i.seat]; it.seat=s; Object.defineProperty(it,'hidden',{get:()=>(s.set==='apart'&&z.dinnerOn)||(s.set==='merged'&&!z.dinnerOn)||(s.id===ZD.npc.sisNext&&z.sisCoatOn),enumerable:true,configurable:true}); } else delete it.seat;
    if(i.exit) it.exit={to:i.exit}; else delete it.exit; if(!i.usClubLook) delete it.usClubLook; if(!i.usClubStudy) delete it.usClubStudy; return it; });
  return z; };
const ZDEF={id:CZ,build:()=>mkZone()};
const other=id=>({id,build:()=>({id,roomAt:()=>null,seats:[]})});
Z3.ZONES[CZ]=ZDEF; for(const k of ['us_outside','us_apartment','us_campus']) Z3.ZONES[k]=other(k);
/* 假的引擎、人物：記錄誰在哪 */
let built=[];
global.CHAR={setExpr(){},build:spec=>{ built.push(spec); return {spec,position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}}; }};
E.q={level:'medium'}; E.npcs=[];
E.addNPC=n=>{ n.pose=n.pose||'idle'; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
E.placeAt=(n,x,z)=>{ n.obj.position.x=x; n.obj.position.z=z; };
E.player.obj.position={x:0,y:0,z:0}; E.player.obj.rotation={y:0};
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; ent.idlePose='sit'; ent.frozen=true; if(ent.obj&&ent.obj.position){ ent.obj.position.x=seat.x; ent.obj.position.z=seat.z; } };
GM.standUp=ent=>{ const s=ent.seat; ent.seat=null; ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; };
GM.walkTo=async(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; return true; };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.studySession=async()=>{};
GM.enter=async(zid,sp,o)=>{ H.entered.push(zid); H.G.zone=zid; E.npcs=[]; GM.npc={}; E.player.seat=null; E.player.pose='idle'; E.zone=Z3.ZONES[zid]?Z3.ZONES[zid].build():{roomAt:()=>null,seats:[]}; if(zid!==CZ) E.interactables=[];
  if(sp){ E.player.obj.position.x=sp.x; E.player.obj.position.z=sp.z; } H.enterOpts=(H.enterOpts||[]).concat([{zid,sp,o:o||{}}]); if(STORY.populate) STORY.populate(zid,GM); };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle',talk:o&&o.talk,greet:o&&o.greet}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G);
  SOCIAL.remember(S5,'FIRST_MET',''); capt.length=0; toasts.length=0; built=[]; H.enterOpts=[]; E.player.busy=false; E.paused=false; E.player.seat=null; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0;
  E.zone=zone===CZ?ZDEF.build():{roomAt:()=>null,seats:[]}; if(zone!==CZ) E.interactables=[]; return G; };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); if(r) r.status='dating'; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const eq=(a,b)=>J(a)===J(b);
const DOOR={x:0,z:0,radius:1,lv:0,usClub:'door',label:'會所',look:'社區的會所'};
const enterClub=async()=>{ await STORY.interact(Object.assign({},DOOR),GM); return H.G.zone===CZ; };
const walk=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; };
const settle=async()=>{ for(let i=0;i<200&&USL.isBusy&&USL.isBusy();i++) await new Promise(r=>setTimeout(r,0)); };
const tick=async()=>{ const r=USL.tick(GM,0.5); await settle(); return r; };
const said=()=>H.said.map(s=>s.t), saidBy=w=>H.said.filter(s=>s.who===w).map(s=>s.t);
const npcClub=w=>E.npcs.find(n=>n&&n.usClub===w)||null;
const res=room=>E.npcs.filter(n=>n&&typeof n.usClub==='string'&&new RegExp('^res:'+(room==='lounge'?'l':'s')).test(n.usClub));
const seatId=n=>n&&n.seat?n.seat.id:null;
const evTexts=id=>{ const out=[]; for(const l of ev(id).dialogue){ if(l.text!==undefined) out.push(l.text); } return out; };
const looksClub=X.aa287.us_outside.club;
const IN_STUDY=[5,1], NEAR_LONG=[8.0,1.2], FAR_LONG=[4.6,-1.2];
const go=async id=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.entered=[]; H.bgs=[]; H.cgs=[]; await OUT.go(GM,q); return q; };
const planOut=o=>OUT.plan(H.G,Object.assign({travel:'',travelH:0,late:1,back:'回到社區。'},o));

(async()=>{
await sec(0,()=>{ check('0. 美國篇的檔案載得到、USL 有 3D 會所的接線（club3d、clubSync、clubTick、clubStage、clubEv3d）',!loadErr.length&&typeof USL.club3d==='function'&&typeof USL.clubSync==='function'&&typeof USL.clubStage==='function'&&USL.club3d(),loadErr.join('；'));
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), p=f=>h.indexOf('src="'+f);
  check('0. index.html：us_clubhouse3d.js 在 us_life3d.js 前面（區域先註冊）',p('src/us_clubhouse3d.js')>0&&p('src/us_life3d.js')>p('src/us_clubhouse3d.js'));
  check('0. 真正的區域有劇情要用的接口（setDinner、setSisCoat、setNotice、setPlan、seatById）；外套蓋住她旁邊那張（hidden）',['setDinner','setSisCoat','setNotice','setPlan','seatById'].every(k=>ZD.api.includes(k))&&ZD.coatHidden===true,J(ZD.api));
  check('0. 真正的區域：何俊朗 st_SE_s1、學姊 st_NE_n1、她旁邊 st_NE_n0；自習室 16 個座位帶 usClubStudy',ZD.npc.long==='st_SE_s1'&&ZD.npc.sis==='st_NE_n1'&&ZD.npc.sisNext==='st_NE_n0'&&ZD.its.filter(i=>i.usClubStudy).length===16,J(ZD.npc)); });
if(!USL.club3d||!USL.club3d()){ H.done(); return; }

/* ======================= A 門口 ======================= */
await sec('A',async()=>{
  fresh('2028-09-12',10,'us_outside');   // 週二 10:00
  const r=await STORY.interact(Object.assign({},DOOR),GM); const eo=H.enterOpts[0];
  check('A. 開著（9/12 10:00）：「會所」走進 3D 門廳（US_CLUBHOUSE.SPAWN），不跳「讀書／離開」選單、不開 2D 背景',r===true&&H.G.zone===CZ&&!!eo&&eq([eo.sp.x,eo.sp.z],[ZD.SPAWN.x,ZD.SPAWN.z])&&!H.opts.length&&!H.bgs.length&&!H.said.length,J({r,zone:H.G.zone,opts:H.opts,bgs:H.bgs}));
  fresh('2028-09-12',23.5,'us_outside'); await STORY.interact(Object.assign({},DOOR),GM);
  check('A. 關著（23:30）：照舊那一句、不進去',capt.includes(looksClub)&&!H.entered.length,J(capt));
  fresh('2028-09-02',12,'us_outside'); await STORY.interact(Object.assign({},DOOR),GM);
  check('A. 9/1 起門口的烤肉公告照舊（不進去）',capt.includes(X.looks.bbqPoster)&&!H.entered.length);
  fresh('2028-09-04',18,'us_outside'); await STORY.interact(Object.assign({},DOOR),GM);
  check('A. 9/4 18:00 勞動節烤肉照舊 2D（ev_usl_bbq，不進 3D 會所）',!!H.G.events.done.ev_usl_bbq&&!H.entered.includes(CZ)&&H.bgs.some(b=>b&&b.image&&/us_club_lawn/.test(b.image)),J(H.bgs));
  fresh('2028-10-12',19.5,'us_outside'); await STORY.interact(Object.assign({},DOOR),GM);
  check('A. 10/12 19:30（挽回中、她在）：也是走進 3D（不是 2D 選單）',H.G.zone===CZ&&!H.opts.length&&!H.G.events.done.ev_usb_fb_study);
  delete Z3.ZONES[CZ]; fresh('2028-09-12',10,'us_outside'); H.picks=[1]; await STORY.interact(Object.assign({},DOOR),GM);
  check('A. 沒有 3D 會所（Z3.ZONES 沒有）：照舊 2D 選單（讀書／離開、us_club_study 背景）',!H.entered.length&&!!H.opts[0]&&H.opts[0].includes('讀書')&&H.bgs.some(b=>b&&b.image&&/us_club_study/.test(b.image)),J({opts:H.opts,bgs:H.bgs}));
  Z3.ZONES[CZ]=ZDEF; });

/* ======================= B 座位、看 ======================= */
await sec('B',async()=>{
  fresh('2028-09-12',10,'us_outside'); await enterClub();
  const st=E.interactables.filter(i=>i.usClubStudy), lounge=E.interactables.filter(i=>i.seat&&i.seat.room==='lounge');
  check('B. 自習室 16 個座位坐下＝讀書（it.study：seatMenu 的「讀書」→ CLS.chooseStudy → studySession）',st.length===16&&st.every(i=>i.study===true),J(st.length));
  check('B. 交誼廳的座位（長桌、沙發、併桌）不是讀書的座位',lounge.length>0&&lounge.every(i=>!i.study));
  const ct=E.interactables.find(i=>i.usClubLook==='counter'); capt.length=0; const r=await STORY.interact(ct,GM);
  check('B. 「看櫃台」＝AA_287 那一句（社區的會所：辦公室、交誼廳，還有一間小自習室。）',r===true&&eq(capt,[looksClub]),J(capt));
  const ex=E.interactables.find(i=>i.exit); check('B. 出口「離開會所」回社區',!!ex&&ex.exit.to==='us_outside'); });

/* ======================= C 何俊朗 ======================= */
await sec('C',async()=>{
  fresh('2028-09-12',19.5,'us_outside',{MET_LONG:true}); await enterClub();
  const L=npcClub('long');
  check('C. 平日 19:30（有 MET_LONG）：何俊朗坐自習室靠窗那張的老位子（st_SE_s1）、看書、不能聊（沒有 talk、沒有名字）',!!L&&seatId(L)==='st_SE_s1'&&L.pose==='read'&&!L.talk&&L.name==='',J(L&&{seat:seatId(L),pose:L.pose}));
  check('C. 他旁邊那張（st_SE_s0）空著、能坐',!E.npcs.some(n=>seatId(n)==='st_SE_s0')&&!E.interactables.find(i=>i.seat&&i.seat.id==='st_SE_s0').hidden);
  H.said=[]; await tick(); walk(...FAR_LONG); await tick();
  check('C. 在門廳、在自習室但離他 3 m 以外：還沒招呼',!H.said.length,J(said()));
  walk(...NEAR_LONG); await tick(); const g1=saidBy('何俊朗');
  check('C. 走到 3 m 內：何俊朗說招呼（S.longGreet 那一句，GM.say 何俊朗）',g1.length>=1&&X.longGreet.some(q=>g1[0]===q.t||q.t.startsWith(g1[0]))&&!g1.includes(X.longSisThere),J(H.said));
  H.said=[]; walk(...FAR_LONG); await tick(); walk(...NEAR_LONG); await tick();
  check('C. 同一天再走近：不再說（一天一次）',!H.said.length,J(said()));
  fresh('2028-09-13',19.5,'us_outside',{MET_LONG:true}); H.G.usLife={greet:{day:D('2028-09-12'),n:0,t:g1[0]},club:{g:D('2028-09-12')}}; await enterClub(); walk(...NEAR_LONG); await tick();
  const g2=saidBy('何俊朗'); check('C. 隔天（9/13）：再說一次、換下一句（輪流）',g2.length>=1&&g2[0]!==g1[0],J([g1[0],g2[0]]));
  for(const [k,h,f,why] of [['2028-09-12',19.5,{},'沒見過他（沒有 MET_LONG）'],['2028-09-16',19.5,{MET_LONG:true},'週六'],['2028-10-10',19.5,{MET_LONG:true},'秋假'],['2028-11-23',19.5,{MET_LONG:true},'感恩節'],['2028-09-12',18.5,{MET_LONG:true},'18:30（還沒來）']]){
    fresh(k,h,'us_outside',f); await enterClub(); check(`C. ${why}：何俊朗不在`,!npcClub('long')); }
  fresh('2028-12-09',19.5,'us_outside',{MET_LONG:true}); await enterClub(); walk(...NEAR_LONG); await tick();
  check('C. 12/9（六）19:30：他在、招呼是 long1209（下禮拜考完，我就要回香港了。）',!!npcClub('long')&&eq(saidBy('何俊朗'),[X.long1209]),J(said()));
  fresh('2028-09-12',21.9,'us_outside',{MET_LONG:true}); await enterClub(); walk(...FAR_LONG); H.G.hour=22.2; USL.clubSync(GM);
  check('C. 22:00 以後（玩家離他 4 m 以上）：何俊朗走了',!npcClub('long')); });

/* ======================= D 學姊 ======================= */
await sec('D',async()=>{
  fresh('2028-10-03',19.5,'us_outside'); dateSis(); await enterClub();   // 10/3 週二 19:30，交往中，沒見過何俊朗
  const n=GM.npc[S5], nx=()=>E.interactables.find(i=>i.seat&&i.seat.id===ZD.npc.sisNext);
  check('D. 10 月起週二 19:30：學姊坐最裡面角落（st_NE_n1）、看書',!!n&&n.uslClub&&seatId(n)==='st_NE_n1'&&n.pose==='read',J(n&&{seat:seatId(n),pose:n.pose}));
  check('D. 交往中、還沒走進自習室：她旁邊那張放著外套（不能坐）',E.zone.sisCoatOn===true&&nx().hidden===true);
  capt.length=0; await n.talk(n); check('D. 按她：「她在讀書。」（不能聊；不打招呼）',eq(capt,['她在讀書。'])&&n.greet===false,J(capt));
  H.said=[]; walk(...IN_STUDY); await tick();
  check('D. 交往中走進自習室：旁白 sisStudyDating（她把外套拿起來），沒有何俊朗的那一句',eq(H.said,[{who:null,t:X.sisStudyDating}]),J(H.said));
  check('D. 旁白以後：外套拿走、那張空出來、上方提示「坐她旁邊」',E.zone.sisCoatOn===false&&nx().hidden===false&&nx().label==='坐她旁邊',J({coat:E.zone.sisCoatOn,label:nx().label}));
  H.said=[]; walk(0,2); await tick(); walk(...IN_STUDY); await tick();
  check('D. 同一天再走進來：旁白不再出（一天一次）',!H.said.length,J(said()));
  // 交往中＋何俊朗在
  fresh('2028-10-03',19.5,'us_outside',{MET_LONG:true}); dateSis(); await enterClub(); walk(...IN_STUDY); await tick();
  check('D. 交往中、何俊朗也在：旁白之後他接 longSisThere（你們台灣人讀書都不說話的嗎）',eq(H.said,[{who:null,t:X.sisStudyDating},{who:'何俊朗',t:X.longSisThere}]),J(H.said));
  H.said=[]; walk(...NEAR_LONG); await tick();
  check('D. 再走到他 3 m 內：招呼（不再重複 longSisThere）',saidBy('何俊朗').length>=1&&!said().includes(X.longSisThere),J(said()));
  // 挽回中
  fresh('2028-10-03',19.5,'us_outside'); await enterClub(); walk(...IN_STUDY); await tick();
  check('D. 挽回中：旁白 sisStudyRepair（她抬頭看了你一眼）',eq(H.said,[{who:null,t:X.sisStudyRepair}]),J(H.said));
  check('D. 挽回中：外套一直在、她旁邊那張不能坐、沒有「坐她旁邊」',E.zone.sisCoatOn===true&&nx().hidden===true&&nx().label!=='坐她旁邊');
  for(const [k,h,why] of [['2028-09-12',19.5,'九月'],['2028-10-03',18,'18:00'],['2028-10-04',19.5,'週三']]){ fresh(k,h,'us_outside'); dateSis(); await enterClub(); check(`D. ${why}：學姊不在、外套不在`,!GM.npc[S5]&&!E.zone.sisCoatOn); }
  fresh('2028-10-03',20.9,'us_outside'); dateSis(); await enterClub(); walk(-6,0); H.G.hour=21.2; USL.clubSync(GM);
  check('D. 21:00 以後（玩家在交誼廳）：她走了、外套也不在',!GM.npc[S5]&&!E.zone.sisCoatOn); });

/* ======================= E 住戶 ======================= */
await sec('E',async()=>{
  const bad=[]; let seenL=new Set(), seenS=new Set();
  for(let d=0;d<14;d++) for(const h of [8.5,10,12.5,15,18,20.5,22.5]){ const day=D('2028-09-11')+d; const G=fresh('2028-09-11',h,'us_outside'); G.day=day; G.weekday=wdOf(day); await enterClub();
    const l=res('lounge').length, s=res('study').length; seenL.add(l); seenS.add(s); if(l<2||l>4||s<0||s>2) bad.push(day+'@'+h+':'+l+'/'+s);
    if(E.npcs.some(n=>n.talk||n.name)) bad.push(day+'@'+h+' 可以聊');
    const kinds=res('lounge').map(n=>n.usClub); if(!kinds.includes('res:l0')||!kinds.includes('res:l1')) bad.push(day+'@'+h+' 沒有沙發／長桌'); }
  check('E. 開放時間：交誼廳 2～4 人（一定有沙發、長桌那兩個）、自習室 0～2 人；都不能聊；兩週裡人數有變化',!bad.length&&seenL.size>=2&&seenS.size>=2,bad.slice(0,5).join('、')+' '+J([...seenL,...seenS]));
  fresh('2028-09-12',10,'us_outside'); await enterClub(); const sofa=res('lounge').find(n=>n.usClub==='res:l0');
  check('E. 沙發那位坐在沙發上（sofa_2）、長桌那位坐 lt_A_n0',!!sofa&&seatId(sofa)==='sofa_2'&&seatId(res('lounge').find(n=>n.usClub==='res:l1'))==='lt_A_n0');
  const of=npcClub('office'); check('E. 平日 10:00：辦公室的人在櫃台後面（z.npc.office）、不能聊',!!of&&eq([of.obj.position.x,of.obj.position.z],[ZD.npc.office.x,ZD.npc.office.z])&&!of.talk&&of.frozen);
  fresh('2028-09-16',10,'us_outside'); await enterClub(); check('E. 週六：辦公室沒有人',!npcClub('office'));
  fresh('2028-09-12',18,'us_outside'); await enterClub(); check('E. 平日 18:00：辦公室沒有人',!npcClub('office'));
  fresh('2028-09-12',10,'us_outside'); await enterClub(); H.G.hour=17.2; USL.clubSync(GM); check('E. 待到 17:00 以後：辦公室的人走了',!npcClub('office'));
  fresh('2028-09-12',7.5,CZ); await GM.enter(CZ,{x:1,z:3},{fromLoad:true}); check('E. 07:30（會所還沒開，讀檔進來的）：沒有住戶',!res('lounge').length&&!res('study').length); });

/* ======================= F 劇情在 3D ======================= */
await sec('F',async()=>{
  const snapAt=(n,fn)=>{ const s0=GM.say; let k=0, out=null; GM.say=async(w,t)=>{ k++; if(k===n&&!out) out=fn(); return s0(w,t); }; return ()=>{ GM.say=s0; return out; }; };
  // 10/4 long3
  fresh('2028-10-04',19.9,'us_outside',{MET_LONG:true}); planOut({id:'usl_long3',ev:'ev_usl_long3',day:D('2028-10-04'),h:20,place:'會所',title:'會所自習室'});
  let fin=snapAt(1,()=>({zone:H.G.zone,notice:E.zone.noticeOn,long:seatId(npcClub('long')),me:seatId(E.player),staged:USL.clubStaged()})); await go('usl_long3'); let sn=fin();
  check('F. 10/4 long3 在 3D 自習室：公布欄的單子（setNotice）、何俊朗老位子 st_SE_s1、玩家坐他旁邊 st_SE_s0',!!sn&&sn.zone===CZ&&sn.notice&&sn.long==='st_SE_s1'&&sn.me==='st_SE_s0',J(sn));
  check('F. long3：背景 freeze、沒有 2D 自習室背景；台詞一字不差；演完回到社區、記 done',H.bgs.includes('freeze')&&!H.bgs.some(b=>b&&b.image&&/us_club_study/.test(b.image))&&eq(said(),evTexts('ev_usl_long3').filter(t=>said().includes(t)))&&said().length>=10&&H.G.zone==='us_outside'&&!!H.G.events.done.ev_usl_long3&&eq(H.entered,[CZ,'us_outside']),J({bgs:H.bgs,entered:H.entered}));
  { const eo=H.enterOpts.find(o=>o.zid===CZ); check('F. long3：進會所黑著進（noFade）、不先存檔；出生在玩家座位前（不從門口飄過去）',!!eo&&eo.o.noFade&&eo.o.noAutosave&&Math.hypot(eo.sp.x-8.45,eo.sp.z-2.82)<0.6,J(eo&&eo.sp)); }
  // 10/12 fb_study
  fresh('2028-10-12',19.5,'us_outside'); await enterClub(); const resS=res('study').length;
  check('F. 10/12 19:30（挽回中）：她在角落、何俊朗不在（秋假）、自習室沒有住戶',!!GM.npc[S5]&&!npcClub('long')&&resS===0,J({resS}));
  H.said=[]; H.bgs=[]; walk(...IN_STUDY); await tick();
  const fbTexts=evTexts('ev_usb_fb_study');
  check('F. 走進自習室：演 ev_usb_fb_study（台詞一字不差、背景 freeze）；不另外出「她抬頭看了你一眼，又低下頭」',!!H.G.events.done.ev_usb_fb_study&&eq(said(),fbTexts)&&!said().includes(X.sisStudyRepair)&&H.bgs.includes('freeze')&&!H.bgs.some(b=>b&&b.image),J({said:said(),bgs:H.bgs}));
  check('F. fb_study：玩家走到她桌子旁邊（z.events 的站位）開始；還在會所（之後自己找位子讀書）',Math.abs(E.player.obj.position.x-ZD.events.ev_usb_fb_study.player.x)<1e-6&&Math.abs(E.player.obj.position.z-ZD.events.ev_usb_fb_study.player.z)<1e-6&&H.G.zone===CZ);
  H.said=[]; await tick(); check('F. fb_study 演過：同一天不再出旁白',!H.said.length,J(said()));
  // 10/18 sis_plan_us
  fresh('2028-10-18',19.9,'us_apartment'); dateSis(); planOut({id:'r3_sis_plan_us',ev:'ev_sis_plan_us',day:D('2028-10-18'),h:20,place:'會所',title:'會所・自習室',back:'回到公寓。'});
  fin=snapAt(1,()=>({zone:H.G.zone,plan:E.zone.planOn,coat:E.zone.sisCoatOn,sis:seatId(GM.npc[S5]),me:seatId(E.player)})); await go('r3_sis_plan_us'); sn=fin();
  check('F. 10/18 讀書計畫在 3D：學姊 st_NE_n1、玩家並排 st_NE_n0、桌上讀書計畫（setPlan）、沒有外套',!!sn&&sn.zone===CZ&&sn.plan&&!sn.coat&&sn.sis==='st_NE_n1'&&sn.me==='st_NE_n0',J(sn));
  check('F. 讀書計畫：台詞一字不差、freeze；演完回到公寓',said().every(t=>evTexts('ev_sis_plan_us').includes(t))&&said().length>=3&&H.bgs.includes('freeze')&&!H.bgs.some(b=>b&&b.image)&&H.G.zone==='us_apartment'&&H.G.flags.SIS_PLAN_SEEN==='us',J({said:said(),bgs:H.bgs}));
  // 11/23 thanks_long
  fresh('2028-11-23',18.9,'us_outside',{MET_LONG:true}); planOut({id:'usl_thanks_long',ev:'ev_usl_thanks_long',day:D('2028-11-23'),h:19,place:'會所',title:'感恩節'});
  const st=ZD.events.ev_usl_thanks_long.start;
  const pos=o=>o&&o.obj?[+o.obj.position.x.toFixed(2),+o.obj.position.z.toFixed(2)]:null;
  { const s0=GM.say; const snaps=[]; GM.say=async(w,t)=>{ snaps.push({zone:H.G.zone,me:pos(E.player),meSeat:seatId(E.player),long:pos(npcClub('long')),longSeat:seatId(npcClub('long')),res:res('lounge').length+res('study').length,others:E.npcs.filter(n=>n.usClub&&n.usClub!=='long').length}); return s0(w,t); };
    await go('usl_thanks_long'); GM.say=s0;
    check('F. 11/23 熱可可：販賣機前開始（玩家、何俊朗照 start 的站位）、會所沒有別人',!!snaps[0]&&snaps[0].zone===CZ&&eq(snaps[0].me,[st.player.x,st.player.z])&&eq(snaps[0].long,[st.long.x,st.long.z])&&snaps[0].others===0,J(snaps[0]));
    check('F. 熱可可推過來以後（第二句以前淡出淡入）：兩個人坐到自習室窗邊何俊朗那張桌子（玩家 npc.longNext、何俊朗 npc.long；AA 11-10 17:14 改演法：第二句寫「你們坐在自習室的窗邊喝完」）',!!snaps[1]&&snaps[1].meSeat===US_CLUBHOUSE_LAYOUT.npc.longNext&&snaps[1].longSeat===US_CLUBHOUSE_LAYOUT.npc.long,J(snaps[1]));
    check('F. 熱可可：台詞一字不差、freeze；演完回到社區、USL_THANKS＝long',eq(said(),evTexts('ev_usl_thanks_long'))&&H.bgs.includes('freeze')&&!H.bgs.some(b=>b&&b.image)&&H.G.zone==='us_outside'&&H.G.flags.USL_THANKS==='long',J(said())); }
  // 12/14 晚餐
  for(const met of [true,false]){ fresh('2028-12-14',18.9,'us_outside',met?{MET_LONG:true,US_CLUB_DISH:'egg'}:{US_CLUB_DISH:'egg'}); planOut({id:'us_club',ev:'ev_us_club_dinner',day:D('2028-12-14'),h:19,place:'會所',title:'會所晚餐'});
    fin=snapAt(1,()=>({zone:H.G.zone,dinner:E.zone.dinnerOn,sis:seatId(GM.npc[S5]),me:seatId(E.player),long:seatId(npcClub('long')),
      at:E.npcs.filter(n=>n.seat).map(n=>seatId(n)).sort(),mates:E.npcs.filter(n=>/^mate/.test(n.usClub==='stage'?(n.obj.spec.id.split('_')[1]):'')).map(n=>({seat:seatId(n),spec:n.obj.spec.id})),res:res('lounge').length}));
    await go('us_club'); sn=fin();
    const all=sn?sn.at.concat([sn.sis,sn.me]).filter(Boolean):[];
    check(`F. 12/14 晚餐（${met?'見過':'沒見過'}何俊朗）在 3D 交誼廳：兩張長桌併起來（setDinner）、約 10 人（學姊主位 ld_w、玩家 ld_s3、其他人都坐併桌的位子）、沒有一般住戶`,!!sn&&sn.zone===CZ&&sn.dinner&&sn.sis==='ld_w'&&sn.me==='ld_s3'&&all.length===10&&all.every(s=>/^ld_/.test(s))&&new Set(all).size===10&&sn.res===0,J(sn));
    check(`F. 晚餐：室友坐她兩邊（ld_n0、ld_s0）${met?'、何俊朗坐玩家對面（ld_n3）':'、ld_n3 是別的交換生（不是何俊朗）'}`,!!sn&&sn.at.includes('ld_n0')&&sn.at.includes('ld_s0')&&(met?sn.long==='ld_n3':(!sn.long&&sn.at.includes('ld_n3'))),J(sn&&{long:sn.long}));
    check('F. 晚餐：CG 照舊（cg_last_dinner_heroine05）、台詞照原本、freeze；演完回到社區、記 US_CLUB_DINNER＝went',H.cgs.includes('cg_last_dinner_heroine05')&&said().every(t=>evTexts('ev_us_club_dinner').includes(t))&&said().includes('……謝謝你們這一學期。')&&H.bgs.includes('freeze')&&!H.bgs.some(b=>b&&b.image&&/us_club_lounge/.test(b.image))&&H.G.zone==='us_outside'&&H.G.flags.US_CLUB_DINNER==='went',J({cgs:H.cgs,bgs:H.bgs})); }
  check('F. 晚餐那天（12/14）晚上聖誕樹在、亮著（US_CLUBHOUSE.xmasOn；17:30 以後亮燈由區域自己切）',US_CLUBHOUSE.xmasOn(CALENDAR.dateOf(D('2028-12-14')))&&!US_CLUBHOUSE.xmasOn(CALENDAR.dateOf(D('2028-11-30'))));
  // 12/14 從會所門口進去（r2y4a3d.js 的 usClub:'door'＝OUT.go）
  fresh('2028-12-14',19.05,'us_outside',{MET_LONG:true}); planOut({id:'us_club',ev:'ev_us_club_dinner',day:D('2028-12-14'),h:19,place:'會所',title:'會所晚餐'}); H.entered=[]; await STORY.interact(Object.assign({},DOOR),GM);
  check('F. 12/14 19:00 按會所門口：晚餐在 3D 演（換到會所、演完回社區）',!!H.G.events.done.ev_us_club_dinner&&eq(H.entered,[CZ,'us_outside']),J(H.entered));
  check('F. 原本的事件資料沒有被改（還是 2D 的 bg、background dark）——3D 是演的時候複製一份',[['ev_usl_long3','us_club_study'],['ev_usb_fb_study','us_club_study'],['ev_sis_plan_us','us_club_study'],['ev_usl_thanks_long','us_club_lounge'],['ev_us_club_dinner','us_club_lounge']].every(([id,bg])=>ev(id).background==='dark'&&ev(id).dialogue[0].bg===bg));
  // 沒有 3D 會所＝照舊 2D
  delete Z3.ZONES[CZ]; fresh('2028-10-04',19.9,'us_outside',{MET_LONG:true}); planOut({id:'usl_long3',ev:'ev_usl_long3',day:D('2028-10-04'),h:20,place:'會所',title:'會所自習室'}); await go('usl_long3');
  check('F. 沒有 3D 會所：long3 照舊 2D（us_club_study 背景、不換區域）',!H.entered.length&&H.bgs.some(b=>b&&b.image&&/us_club_study/.test(b.image))&&!!H.G.events.done.ev_usl_long3,J(H.bgs));
  Z3.ZONES[CZ]=ZDEF; });

/* ======================= G 存檔 ======================= */
await sec('G',async()=>{
  fresh('2028-10-03',19.5,'us_outside',{MET_LONG:true}); dateSis(); delete H.G.usLife; await enterClub(); walk(...IN_STUDY); await tick();
  check('G. 舊存檔（沒有 usLife）：照常進會所、旁白、記在 usLife.club',H.G.zone===CZ&&!!H.G.usLife&&H.G.usLife.club&&H.G.usLife.club.s===H.G.day&&said().includes(X.sisStudyDating));
  fresh('2028-10-05',19.6,CZ,{MET_LONG:true}); dateSis(); await GM.enter(CZ,{x:8,z:1},{fromLoad:true});
  check('G. 在會所裡的存檔（10/5 週四 19:36）讀回來：何俊朗、學姊照時間在自己的位子、住戶在',seatId(npcClub('long'))==='st_SE_s1'&&!!GM.npc[S5]&&seatId(GM.npc[S5])==='st_NE_n1'&&res('lounge').length>=2,J({long:seatId(npcClub('long'))}));
  check('G. 讀檔的鎖：LOADLOCKS 有 us_life3d:club（演到一半讀檔放開）',typeof globalThis.LOADLOCKS['us_life3d:club']==='function');
  fresh('2028-10-05',19.6,CZ,{});
  check('G. 人在會所＝人在美國（exchange3d.js 的 US_ZONES：時差、手機、摘要日照美國）',EXCH.inUS(H.G)&&EXCH.US_ZONES.includes(CZ));
  check('G. 手機「現在大概在」有會所的名字（us_life3d.js 的 PLACES.names 清單有 us_clubhouse_in）',/for\(const k of \[[^\]]*'us_clubhouse_in'[^\]]*\]\) if\(!PLACES\.names\[k\]/.test(fs.readFileSync(path.join(ROOT,'src/us_life3d.js'),'utf8')));
  fresh('2027-10-05',19.6,'campus',{}); const r=await STORY.interact(Object.assign({},DOOR),GM);
  check('G. 不在美國：會所門口的接線不作用',!H.entered.includes(CZ),J({r,entered:H.entered})); });


  /* 12/14 晚餐那晚（AA 11-10 17:14）：沒排晚餐 18:30～21:30——學姊、何俊朗不在自習室、交誼廳沒有住戶、走到交誼廳一句「今晚交誼廳有聚餐。」；19:00 以前、別天照舊 */
  { const G=H.G; const d0=G.day, h0=G.hour; G.day=D('2028-12-14'); G.hour=19.2; const dn=USL.dinnerNight(G); G.hour=18; const before=USL.dinnerNight(G); G.day=D('2028-12-15'); G.hour=19.2; const other=USL.dinnerNight(G); G.day=d0; G.hour=h0;
    check('G. 12/14 18:30～21:30 沒排晚餐＝dinnerNight；18:00、12/15 不是',dn===true&&before===false&&other===false,J({dn,before,other}));
    check('G. dinnerNight 那晚交誼廳的門關起來（clubSync 呼叫 z.setLoungeClosed(dinnerNight)，LAWWW2 575ef8ae3）',/z\.setLoungeClosed\(dn\)/.test(USL_SRC));
    check('G. dinnerNight 那晚：學姊、何俊朗不在、交誼廳沒有住戶、交誼廳一句「今晚交誼廳有聚餐。」（原始碼）',/S\.longHere\(G\)&&!S\.dinnerNight\(G\)/.test(USL_SRC)&&/S\.sisClub\(G\)&&!S\.dinnerNight\(G\)/.test(USL_SRC)&&/if\(!dn\) for/.test(USL_SRC)&&USL.DINNER_NOTE==='今晚交誼廳有聚餐。'); }
H.done();
})();
