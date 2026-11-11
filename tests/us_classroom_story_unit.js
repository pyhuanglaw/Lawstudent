// 美國的課在 3D Room 120 上（US-CLASSROOM-3D-1110 劇情接線，AA_740 企劃線 961025d4c；src/us_life3d.js 的 USL）——不需要瀏覽器。
// 兩個行程：
//   --zones：three.js＋引擎＋真正的 us_classroom 區域（src/us_classroom3d.js、layout），把座位、站位、出口、出生點印成 JSON；
//   主行程：pg_harness（劇情、系統）＋美國篇的檔案，Z3.ZONES.us_classroom 換成「照真正區域的資料建的」假區域，假的 GM／E 記錄進出區域、淡入淡出、誰坐哪。
// 檢查（AA_740）：
//   A 門口：有課＝走進 Room 120（門口出生點）、還沒上課；沒課、放假＝不能進（回到「看」）
//   B 一鍵上課：淡入的時候已經坐在自己那門課的座位（intro [2,7]、comp [0,4]、lw [1,4]）、大家都到了；旁白是字幕（GM.caption）蓋在 3D 上、不開 2D 背景；下課回到台階下
//   C 誰坐哪：韓國同學玩家正後方；德國同學第 4 次以前第 2 排最右邊、att.us_comp>=4 那一堂起坐玩家左邊；巴西、日本；何俊朗見過＝右邊、沒見過＝正前方；
//     路人照 others、不撞位；手機（low）路人減到 8 個以下、有名字的人照樣在；教授在講桌和白板之間來回、不能聊天；三位教授不是同一個人；沒有學姊
//   D 走進來上：坐下的選單有「上課：課名」（坐別的位子也算）、自己的座位「坐下（你常坐的位置）」；坐著上完，大家往門口走、玩家留在教室
//   E 特別的課在 3D：10/26 期中、12/7 期末報告（玩家、德國同學站講桌兩邊，教授坐第 1 排最右邊；選 b 教授走到門口）、12/6 期末考（教授在講桌後面）、
//     12/8 最後一堂（何俊朗念句子那一拍站起來）；台詞、選項和原本的事件一字不差；背景 freeze（看得到 3D）、沒有 2D 教室背景
//   F 2D 照舊：8/4 國際學生辦公室、8/14 迎新、9/8 走廊的事件還是 2D us_classroom 背景；沒有 3D 教室（Z3.ZONES 沒有）＝整個照舊 2D
//   G 存檔：舊存檔（沒有 usLife）照常上課；在 us_classroom 裡的存檔讀回來：有課＝人都在、沒課＝空教室；待到下課時間過了＝大家走掉；臺灣的座位上課照舊
// 這是 Node 模擬（資料、流程），畫面要 CC 在使用者電腦拍（D131）。用法：node tests/us_classroom_story_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');

/* ============ 真正的區域（另一個行程）============ */
if(process.argv[2]==='--zones'){
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/us_layouts.js','src/us3d.js','src/data/us_classroom_layout.js','src/us_classroom3d.js']){
    let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.us_classroom.build(E); const rc=s=>s?[s.row,s.col]:null, P=o=>o?{x:o.x,z:o.z,yaw:o.yaw||0}:null;
  const plan={}; for(const ck of Object.keys(US_CLASSROOM_LAYOUT.seatPlan)){ plan[ck]={}; for(const k of Object.keys(US_CLASSROOM_LAYOUT.seatPlan[ck])) plan[ck][k]=k==='others'?z.others(ck).map(rc):rc(z.seatOf(ck,k)); }
  const ex=E.interactables.find(i=>i.exit);
  process.stdout.write(JSON.stringify({seats:z.seats.map(s=>({row:s.row,col:s.col,x:s.x,y:s.y,z:s.z,yaw:s.yaw})),plan,spawn:z.spawn,SPAWN:US_CLASSROOM.SPAWN,present:{player:z.present.player,partner:z.present.partner,professorSeat:rc(z.present.professorSeat)},
    examProf:P(z.examProf),teacherSpot:P(z.teacherSpot),teacherWalk:z.teacherWalk,exit:ex&&{x:ex.x,z:ex.z,to:ex.exit.to},lectern:US_CLASSROOM_LAYOUT.lectern}));
  process.exit(0);
}

let ZD=null; try{ ZD=JSON.parse(cp.execFileSync(process.execPath,[__filename,'--zones'],{cwd:ROOT,maxBuffer:1<<24}).toString()); }catch(e){ console.log('FAIL 0. 建不出真正的 us_classroom 區域  '+String(e.message).slice(0,300)); console.log('FAILED: 1'); process.exit(1); }

/* ============ 劇情、系統（pg_harness＋美國篇）============ */
const H=require('./pg_harness.js');
const {check,GM,E}=H, J=JSON.stringify;
/* 假的 Room 120：座位、seatOf、others、站位都照真正區域的資料（ZD）；每次進區域重建（座位是新的物件，和遊戲一樣）*/
const mkZone=()=>{ const seats=ZD.seats.map(s=>Object.assign({},s)); const at=rc=>rc?seats.find(s=>s.row===rc[0]&&s.col===rc[1])||null:null;
  const z={id:'us_classroom',seats,spawn:Object.assign({},ZD.spawn),roomAt:()=>null,present:{player:Object.assign({},ZD.present.player),partner:Object.assign({},ZD.present.partner),professorSeat:at(ZD.present.professorSeat)},
    examProf:Object.assign({},ZD.examProf),teacherSpot:Object.assign({},ZD.teacherSpot),teacherWalk:ZD.teacherWalk.map(p=>Object.assign({},p)),
    seatOf:(c,k)=>at(ZD.plan[c]&&ZD.plan[c][k]),others:c=>((ZD.plan[c]&&ZD.plan[c].others)||[]).map(at).filter(Boolean),
    examOn:false,examLog:[],setExam(on){ this.examOn=!!on; this.examLog.push(!!on); }};   /* US-EXAM-PROPS-1110：桌上的答案本只在期末考那一場 */
  E.interactables=seats.map(s=>({x:s.x,z:s.z+0.35,y:s.y,radius:0.62,label:'坐下',seat:s})).concat([{x:ZD.exit.x,z:ZD.exit.z,radius:1.2,label:'離開教室',exit:{to:'us_campus'}}]); return z; };
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|ROM|PORTRAIT_ONLY|US_CLASSROOM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_classroom_layout.js','src/y34b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const ZDEF={id:'us_classroom',build:()=>mkZone()}; Z3.ZONES.us_classroom=ZDEF; global.US_CLASSROOM={SPAWN:Object.assign({},ZD.SPAWN)};
/* 假的引擎、人物：記錄誰在哪 */
let built=[], log=[], fades=[];
global.CHAR={setExpr(){},build:spec=>{ built.push(spec); return {spec,position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}}; }};
E.q={level:'medium'}; E.npcs=[];
E.addNPC=n=>{ n.pose=n.pose||'idle'; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
E.moveTo=(n,x,z,cb)=>{ n.moveTo=(n.moveTo||[]).concat([{x,z}]); n.onArriveCb=cb; return true; };
E.placeAt=(n,x,z)=>{ n.obj.position.x=x; n.obj.position.z=z; };
E.player.obj.position={x:0,y:0,z:0}; E.player.obj.rotation={y:0};
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; ent.idlePose='sit'; ent.frozen=true; if(ent.obj&&ent.obj.position){ ent.obj.position.x=seat.x; ent.obj.position.z=seat.z; } };
GM.standUp=ent=>{ const s=ent.seat; ent.seat=null; ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; if(s&&ent.obj&&ent.obj.position){ ent.obj.position.x=s.x; ent.obj.position.z=s.z+0.6; } };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); log.push('caption:'+b); };
const rcOf=s=>s?[s.row,s.col]:null;
GM.fade=async on=>{ fades.push({on,zone:H.G.zone,seat:rcOf(E.player.seat),npcs:E.npcs.filter(n=>n.usCls).length}); };
GM.enter=async(zid,sp,o)=>{ H.entered.push(zid); H.G.zone=zid; E.npcs=[]; GM.npc={}; E.player.seat=null; E.player.pose='idle'; E.zone=zid==='us_classroom'?ZDEF.build():{roomAt:()=>null,seats:[]}; if(zid!=='us_classroom') E.interactables=[];
  if(sp){ E.player.obj.position.x=sp.x; E.player.obj.position.z=sp.z; } H.enterOpts=(H.enterOpts||[]).concat([{zid,sp,o:o||{}}]); if(STORY.populate) STORY.populate(zid,GM); };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,flags); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; G.stats.study=0; ROM.rec(G);
  capt.length=0; built=[]; log=[]; fades=[]; H.enterOpts=[]; E.player.busy=false; E.paused=false; E.player.seat=null; E.npcs=[]; E.q={level:'medium'}; E.zone=zone==='us_classroom'?ZDEF.build():{roomAt:()=>null,seats:[]}; if(zone!=='us_classroom') E.interactables=[]; return G; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const cast=()=>E.npcs.filter(n=>n.usCls||n.leaving);
const who=w=>E.npcs.find(n=>n.usWho===w);
const seatRC=w=>{ const n=who(w); return n?rcOf(n.seat):null; };
const eq=(a,b)=>J(a)===J(b);
const item=id=>USL.items(H.G).find(x=>x.c.id===id);
/* 事件的字（text、choice）照原本的資料，不讀 3D 版本：拿來比對「一字不差」*/
const evTexts=id=>{ const out=[]; for(const l of ev(id).dialogue){ if(l.text!==undefined) out.push(l.text); if(l.choice) out.push(l.choice.map(c=>c.text).join('｜')); } return out; };
const mention=s=>/heroine_05|sis|學姊|書瑀/.test(J(s));

(async()=>{
await sec(0,()=>{ check('0. 美國篇的檔案載得到、USL 有 3D 教室的接線（room3d、castPlan、cast3d、attend3d、ev3d）',!loadErr.length&&typeof USL.castPlan==='function'&&typeof USL.attend3d==='function'&&USL.room3d(),loadErr.join('；'));
  const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('0. index.html 載入 us_classroom_layout.js、us_classroom3d.js、us_life3d.js',/src\/data\/us_classroom_layout\.js/.test(h)&&/src\/us_classroom3d\.js/.test(h)&&/src\/us_life3d\.js/.test(h));
  check('0. 真正的區域：玩家座位 intro [2,7]、comp [0,4]、lw [1,4]（AA_740 第 2 節）',eq(ZD.plan.intro.player,[2,7])&&eq(ZD.plan.comp.player,[0,4])&&eq(ZD.plan.lw.player,[1,4]),J([ZD.plan.intro.player,ZD.plan.comp.player,ZD.plan.lw.player])); });
if(!USL.room3d||!USL.room3d()){ H.done(); return; }

/* ======================= A 門口 ======================= */
await sec('A',async()=>{
  fresh('2028-08-21',9.5,'us_campus',US());   // 週一 Introduction 10:00
  let r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',label:'進教室',look:'看'},GM);
  const eo=H.enterOpts[0];
  check('A. 有課（週一 09:30，Introduction 10:00）：「進教室」走進 Room 120、站在門口（US_CLASSROOM.SPAWN）、還沒開始上課',r===true&&H.G.zone==='us_classroom'&&eo&&eo.zid==='us_classroom'&&eq([eo.sp.x,eo.sp.z],[ZD.SPAWN.x,ZD.SPAWN.z])&&!(H.G.usLife&&H.G.usLife.att&&H.G.usLife.att.us_intro)&&Math.abs(H.G.hour-9.5)<1e-6,J({r,zone:H.G.zone,eo}));
  check('A. 進來的時候其他人已經坐好（韓國同學、路人、教授），玩家自己的座位「坐下（你常坐的位置）」',!!who('korean')&&!!who('prof')&&cast().filter(n=>n.usWho==='student').length>0&&E.interactables.filter(i=>i.label==='坐下（你常坐的位置）').length===1&&eq(rcOf(E.interactables.find(i=>i.label==='坐下（你常坐的位置）').seat),[2,7]));
  fresh('2028-08-21',14,'us_campus',US());
  r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',label:'進教室',look:'看'},GM);
  check('A. 沒課（週一 14:00）：進不去（不換區域、交回「看」那一句）',r===false&&H.G.zone==='us_campus'&&!H.entered.length,J({r,entered:H.entered}));
  fresh('2028-09-04',9.5,'us_campus',US());   // 勞動節
  r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',label:'進教室',look:'看'},GM);
  check('A. 放假（9/4 勞動節）：進不去',r===false&&!H.entered.length);
  fresh('2028-12-12',9.5,'us_campus',US());   // 期末週
  r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',label:'進教室',look:'看'},GM);
  check('A. 期末週（12/12）：進不去',r===false&&!H.entered.length);
  fresh('2028-08-21',11.05,'us_campus',US());   // 下課前 15 分鐘以後
  r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',label:'進教室',look:'看'},GM);
  check('A. 快下課了（11:00 以後＝來不及）：進不去',r===false&&!H.entered.length); });

/* ======================= B 一鍵上課 ======================= */
await sec('B',async()=>{
  for(const [key,h,id,ck,seat] of [['2028-08-21',9.5,'us_intro','intro',[2,7]],['2028-08-22',12.5,'us_comp','comp',[0,4]],['2028-08-25',8.5,'us_writing','lw',[1,4]]]){
    fresh(key,h,'us_apartment',US()); const it=item(id); H.said=[]; H.bgs=[];
    let seen=null; const f0=GM.fade; GM.fade=async on=>{ await f0(on); if(!on&&H.G.zone==='us_classroom'&&!seen) seen={seat:rcOf(E.player.seat),pose:E.player.pose,named:E.npcs.filter(n=>n.usCls&&n.usWho!=='student'&&n.usWho!=='prof').map(n=>n.usWho),students:E.npcs.filter(n=>n.usWho==='student').length,prof:!!who('prof')}; };
    await USL.attend(GM,it); GM.fade=f0;
    const line=USL.classLine(id,0,H.G);
    check(`B. 一鍵上課 ${ck}：淡入的時候已經坐在自己的座位 ${J(seat)}、讀書的姿勢、其他人都到了（教授、路人${ck==='intro'?'、韓國同學':ck==='comp'?'、德國／巴西／日本同學':'、何俊朗'}）`,!!seen&&eq(seen.seat,seat)&&seen.pose==='read'&&seen.prof&&seen.students>0&&seen.named.length===(ck==='comp'?3:1),J(seen));
    check(`B. ${ck}：旁白是字幕（GM.caption）、不是 2D 對話；沒有開 2D 背景（us_classroom）；課名字卡照舊`,capt.includes(line)&&capt.includes(it.c.name)&&!H.said.some(s=>s.t===line)&&!H.bgs.length&&H.cards.some(c=>c[0]===it.c.name),J({capt,bgs:H.bgs}));
    check(`B. ${ck}：下課時間、出席記一次、回到法學院台階下（us_campus）`,Math.abs(H.G.hour-it.t1)<1e-6&&H.G.usLife.att[id]===1&&H.G.zone==='us_campus'&&eq(H.entered,['us_classroom','us_campus']),J({h:H.G.hour,entered:H.entered}));
    { const eo=H.enterOpts[0], s=ZD.seats.find(q=>q.row===seat[0]&&q.col===seat[1]);
      check(`B. ${ck}：進教室的出生點＝自己座位後面 0.6 m（鏡頭一進來就在座位，不從門口飄過來）；畫面黑著進（noFade）、不先存檔`,!!eo&&Math.abs(eo.sp.x-s.x)<1e-6&&Math.abs(eo.sp.z-(s.z+0.6))<1e-6&&eo.o.noFade&&eo.o.noAutosave,J(eo&&eo.sp)); } }
  // 起床選單、公寓「去上課」、社區「搭公車」三個入口都走同一個 USL.attend
  fresh('2028-08-28',7.5,'us_apartment',US()); H.picks=[0]; await CLS.wakeMenu(GM);
  check('B. 起床選單「直接去上課」→ 3D 教室上課 → 台階下',eq(H.entered,['us_classroom','us_campus'])&&H.G.usLife.att.us_intro===1,J(H.entered));
  fresh('2028-08-22',12.5,'us_apartment',US()); await STORY.interact({x:0,z:0,radius:1,lv:0,uslClass:true},GM);
  check('B. 公寓「去上課」→ 3D 教室上課',eq(H.entered,['us_classroom','us_campus'])&&H.G.usLife.att.us_comp===1);
  fresh('2028-08-22',12.5,'us_outside',US()); H.picks=[0]; await STORY.interact({x:0,z:0,radius:1,lv:0,usBus:'campus',label:'搭公車（去學校）',exit:{to:'us_campus'}},GM);
  check('B. 社區「搭公車」→「直接去上課」→ 3D 教室上課',eq(H.entered,['us_classroom','us_campus'])&&H.G.usLife.att.us_comp===1); });

/* ======================= C 誰坐哪 ======================= */
await sec('C',async()=>{
  const castAt=async(key,h,id,flags,att)=>{ fresh(key,h,'us_campus',US(flags)); if(att) H.G.usLife={cls:{},att:Object.assign({},att)}; await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM); return USL.items(H.G).find(x=>x.c.id===id); };
  await castAt('2028-08-21',9.5,'us_intro');
  check('C. Introduction：韓國同學第 4 排、玩家正後方 [3,7]；路人坐 others 的位子、不撞位',eq(seatRC('korean'),[3,7])&&cast().filter(n=>n.usWho==='student').every(n=>ZD.plan.intro.others.some(rc=>eq(rc,rcOf(n.seat))))&&new Set(cast().filter(n=>n.seat).map(n=>J(rcOf(n.seat)))).size===cast().filter(n=>n.seat).length,J(seatRC('korean')));
  const pf=who('prof');
  check('C. 教授在講桌和白板之間來回（wander，兩端＝z.teacherWalk）、不能聊天（沒有 talk）；路人、同學也不能聊天',!!pf&&pf.beh==='wander'&&eq(pf.waypoints,ZD.teacherWalk.map(p=>[p.x,p.z]))&&cast().every(n=>!n.talk&&!n.talkLabel&&n.name===''),J(pf&&{beh:pf.beh,wp:pf.waypoints}));
  for(const [n,want] of [[0,[1,7]],[2,[1,7]],[3,[0,3]],[5,[0,3]]]){
    await castAt('2028-08-22',12.5,'us_comp',{},{us_comp:n});
    check(`C. Comparative 已經上過 ${n} 次（這一堂＝第 ${n+1} 次）：德國同學 ${J(want)}${n+1>=4?'（att.us_comp>=4：坐玩家左邊）':'（第 2 排最右邊）'}`,eq(seatRC('german'),want),J(seatRC('german'))); }
  check('C. Comparative：巴西同學 [0,0]、日本同學 [1,3]、只坐前 2 排；[0,7] 一般課沒人坐（留給報告時的教授）',eq(seatRC('brazil'),[0,0])&&eq(seatRC('japan'),[1,3])&&cast().filter(n=>n.seat).every(n=>n.seat.row<=1)&&!cast().some(n=>n.seat&&eq(rcOf(n.seat),[0,7])));
  // 上課開始 att 才加 1：第 4 次那一堂，走進來時（att 3）德國同學已經在玩家左邊；上完那堂（att 4）之後一直在左邊
  { await castAt('2028-08-22',12.5,'us_comp',{},{us_comp:3}); const s=E.zone.seatOf('comp','player'); GM.sitAt(E.player,s); const cls=CLS.seatClass(H.G,s); await CLS.attend(GM,cls,{inScene:true});
    check('C. 第 4 堂上完：att.us_comp＝4（之後都坐左邊）',H.G.usLife.att.us_comp===4); }
  await castAt('2028-08-25',8.5,'us_writing',{});
  check('C. Legal Writing、沒見過何俊朗：他坐玩家正前方 [0,4]',eq(seatRC('long'),[0,4])&&!who('korean')&&!who('german'),J(seatRC('long')));
  await castAt('2028-08-25',8.5,'us_writing',{MET_LONG:true});
  check('C. Legal Writing、見過他（MET_LONG）：坐玩家右邊 [1,5]；Introduction、Comparative 沒有他',eq(seatRC('long'),[1,5]),J(seatRC('long')));
  { const profs=[]; for(const [k,h,id] of [['2028-08-21',9.5,'us_intro'],['2028-08-22',12.5,'us_comp'],['2028-08-25',8.5,'us_writing']]){ built=[]; await castAt(k,h,id); const p=built.find(s=>/^usc_prof_/.test(s.id)); profs.push(p&&J({sex:p.sex,hair:p.hair,top:p.outfit&&p.outfit.top,id:p.id})); }
    check('C. 三位教授是不同的人（Introduction 男、Comparative 女、Legal Writing 男，外型不一樣）',profs.every(Boolean)&&new Set(profs).size===3&&/"sex":"m"/.test(profs[0])&&/"sex":"f"/.test(profs[1])&&/"sex":"m"/.test(profs[2]),profs.join(' | ')); }
  { let bad=[]; for(const [k,h,id] of [['2028-08-21',9.5,'us_intro'],['2028-08-22',12.5,'us_comp'],['2028-08-23',9.5,'us_intro'],['2028-08-25',8.5,'us_writing']]){ for(const dating of [false,true]){ fresh(k,h,'us_campus',US(dating?{dating_heroine_05:true}:{})); await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM); if(mention(cast().map(n=>n.usWho))||mention(built.map(s=>s.id))||GM.npc.heroine_05||GM.npc.sis) bad.push(k+(dating?' 交往中':'')); } }
    check('C. 教室裡沒有學姊（交往中、沒交往；三門課）',!bad.length,bad.join('、')); }
  { fresh('2028-08-23',14.5,'us_campus',US({dating_heroine_05:true})); const a=USL.sisAt(H.G); check('C. 週三 14:30 研討課：學姊的作息是「away 研討課」、沒有區域（不在 Room 120）',!!a&&a.away==='研討課'&&!a.zone,J(a)); }
  { await castAt('2028-08-21',9.5,'us_intro'); const nMed=cast().filter(n=>n.usWho==='student').length;
    fresh('2028-08-21',9.5,'us_campus',US()); E.q={level:'low'}; await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM); const nLow=cast().filter(n=>n.usWho==='student').length, rows=new Set(cast().filter(n=>n.usWho==='student').map(n=>n.seat.row));
    check('C. 手機（畫質 low）路人減到 8 個以下、前 5 排都還有人；韓國同學、教授照樣在（medium 16 個）',nLow<=8&&nLow>0&&nMed<=16&&nMed>nLow&&!!who('korean')&&!!who('prof')&&rows.size>=4,J({nMed,nLow,rows:[...rows]})); E.q={level:'medium'}; } });

/* ======================= D 走進來上（座位選單）======================= */
await sec('D',async()=>{
  fresh('2028-08-21',9.5,'us_campus',US()); await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM);
  const mine=E.zone.seatOf('intro','player'), other=E.zone.seats.find(s=>s.row===5&&s.col===3);
  const c1=CLS.seatClass(H.G,mine), c2=CLS.seatClass(H.G,other);
  check('D. 在 Room 120 坐下：自己的座位、別的空位（第 6 排）都有「上課：Introduction…」（坐哪裡都算）',!!c1&&!!c2&&c1.c.id==='us_intro'&&c2.key===c1.key);
  GM.sitAt(E.player,other); E.player.obj.position.x=other.x; E.player.obj.position.z=other.z; capt.length=0; fades=[];
  let inCls=null; { const f0=GM.fade; GM.fade=async on=>{ await f0(on); if(!on&&!inCls) inCls={me:rcOf(E.player.seat),korean:seatRC('korean')}; }; await CLS.attend(GM,c2,{inScene:true}); GM.fade=f0; }
  const left=E.npcs.filter(n=>n.leaving);
  check('D. 坐著上：旁白是字幕、出席記一次、時間到下課 11:15、玩家還在 Room 120（沒有被送出去）',capt.includes(USL.classLine('us_intro',0,H.G))&&H.G.usLife.att.us_intro===1&&Math.abs(H.G.hour-11.25)<1e-6&&H.G.zone==='us_classroom'&&eq(H.entered,['us_classroom']),J({h:H.G.hour,entered:H.entered}));
  check('D. 坐別的位子（第 6 排）上課：玩家坐在自己選的位子、有名字的人不跟著換（韓國同學照樣 [3,7]）',!!inCls&&eq(inCls.me,[5,3])&&eq(inCls.korean,[3,7]),J(inCls));
  check('D. 下課：大家起身往門口走（leaving、往出生點的門口）、「你常坐的位置」換回「坐下」',left.length>0&&left.every(n=>!n.seat&&n.moveTo&&eq([n.moveTo.slice(-1)[0].x,n.moveTo.slice(-1)[0].z],[ZD.spawn.x,ZD.spawn.z]))&&!E.interactables.some(i=>i.label==='坐下（你常坐的位置）'),J({left:left.length}));
  check('D. 下課以後：同一堂不能再上（座位選單沒有「上課」）',!CLS.seatClass(H.G,mine));
  // 玩家坐在德國同學「之後」的位子（[0,3]）、第 4 次：她換到另一個位子，不和玩家疊在一起
  fresh('2028-08-22',12.5,'us_campus',US()); H.G.usLife={cls:{},att:{us_comp:3}}; await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM);
  const ga=E.zone.seatOf('comp','german_after'); GM.sitAt(E.player,ga); let gs=null; { const f0=GM.fade; GM.fade=async on=>{ await f0(on); if(!on&&!gs) gs={me:rcOf(E.player.seat),german:seatRC('german')}; }; await CLS.attend(GM,CLS.seatClass(H.G,ga),{inScene:true}); GM.fade=f0; }
  check('D. 玩家坐了德國同學（第 4 次起）的位子 [0,3]：上課時她坐另一個（第 2 排最右邊 [1,7]），不疊在玩家身上',!!gs&&eq(gs.me,[0,3])&&eq(gs.german,[1,7]),J(gs));
  { fresh('2028-08-22',12.5,'us_campus',US()); H.G.usLife={cls:{},att:{us_comp:3}}; await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM); GM.sitAt(E.player,ga); USL.cast3d(GM,USL.roomItem(H.G),'class');
    check('D. （同上）重排時：德國同學 [1,7]、不在玩家的 [0,3]',eq(seatRC('german'),[1,7]),J(seatRC('german'))); }
  // 臺灣：座位上課照舊（不是美國的課＝交給原本的 CLS.attend）
  { fresh('2027-03-01',9,'classroom',{}); const orig=[]; const it={c:{id:'tw_x',name:'民法'},key:'k'}; const s0=CLS.seatClass(H.G,{x:0,z:0});
    check('D. 臺灣的教室：CLS.seatClass 照原本的（不回美國的課）',!(s0&&USL.COURSES.includes(s0.c))); } });

/* ======================= E 特別的課 ======================= */
await sec('E',async()=>{
  // 10/26 期中報告
  fresh('2028-10-26',12.5,'us_apartment',US()); H.said=[]; H.opts=[]; H.bgs=[]; H.picks=[2]; let snap=null;
  { const r0=EVENTS.run; EVENTS.run=async function(e,o){ if(e&&e.id==='ev_usl_midterm'&&!snap){ const P=E.player.obj.position, g=who('german'), pf=who('prof'); snap={zone:H.G.zone,bg:e.background,scene:e.dialogue.filter(l=>l.scene!==undefined).map(l=>l.bg),player:[P.x,P.z,E.player.seat],german:g&&[g.obj.position.x,g.obj.position.z,!!g.seat],prof:pf&&rcOf(pf.seat),students:E.npcs.filter(n=>n.usWho==='student'&&n.seat).length}; } return r0.apply(this,arguments); };
    await USL.attend(GM,item('us_comp')); EVENTS.run=r0; }
  const pp=ZD.present.player, pq=ZD.present.partner;
  check('E. 10/26 期中報告在 Room 120：玩家站 z.present.player、德國同學站 z.present.partner（講桌兩邊，左右照 layout）、教授坐第 1 排最右邊 [0,7]、其他人坐著',!!snap&&snap.zone==='us_classroom'&&eq(snap.player,[pp.x,pp.z,null])&&eq(snap.german,[pq.x,pq.z,false])&&eq(snap.prof,[0,7])&&snap.students>0,J(snap));
  check('E. 期中報告：玩家站在講桌台下看的右邊（+x，AA 11-10 1f0e891f1）、德國同學在另一邊',pp.x>ZD.lectern.x&&pq.x<ZD.lectern.x);
  check('E. 期中報告：背景 freeze（看得到 3D）、地點字幕不換 2D 背景（bg:false）、沒有 2D 教室',!!snap&&snap.bg==='freeze'&&snap.scene.every(b=>b===false)&&!H.bgs.some(b=>b&&b.image&&/us_classroom/.test(b.image))&&!H.bgs.includes('dark'),J({snap:snap&&snap.scene,bgs:H.bgs}));
  check('E. 期中報告：台詞、三個回答和原本的事件一字不差；演完出席記、回台階下',eq(H.said.map(s=>s.t),evTexts('ev_usl_midterm').filter(t=>!t.includes('｜')))&&eq(H.opts[0].slice(),ev('ev_usl_midterm').dialogue.find(l=>l.choice).choice.map(c=>c.text))&&!!(H.G.events.done.ev_usl_midterm)&&H.G.zone==='us_campus',J(H.said.map(s=>s.t)));
  // 12/7 期末報告，選 b
  fresh('2028-12-07',12.5,'us_apartment',US()); H.said=[]; H.opts=[]; H.picks=['只講']; let pfWalk=null;
  { const r0=EVENTS.run; let ev3=null; EVENTS.run=async function(e,o){ if(e&&e.id==='ev_usl_comp_final'){ ev3=e; globalThis.__ev3=e; } const r=await r0.apply(this,arguments); if(e&&e.id==='ev_usl_comp_final'){ const pf=E.npcs.find(n=>n.usWho==='prof'||n.usWalk); pfWalk=pf&&{seat:!!pf.seat,walk:!!pf.usWalk,to:pf.moveTo}; } return r; };
    await USL.attend(GM,item('us_comp')); EVENTS.run=r0; }
  check('E. 12/7 期末報告：「Five minutes.」教授說、選 b；台詞一字不差、記 USL_COMP_FINAL＝one',H.said.some(s=>s.who==='教授'&&s.t==='Five minutes.')&&H.G.flags.USL_COMP_FINAL==='one'&&H.said.map(s=>s.t).every(t=>evTexts('ev_usl_comp_final').includes(t)),J(H.said.map(s=>s.t)));
  check('E. 12/7 選 b：「教授經過你旁邊」＝她從第 1 排起身、經過講台（玩家旁邊）走到門口',!!pfWalk&&!pfWalk.seat&&pfWalk.walk&&pfWalk.to&&pfWalk.to.length>=1&&Math.abs(pfWalk.to[0].x-pp.x)<1e-6,J(pfWalk));
  // 12/6 期末考
  fresh('2028-12-06',9.5,'us_apartment',US()); H.said=[]; let ex=null;
  { const r0=EVENTS.run; EVENTS.run=async function(e,o){ if(e&&e.id==='ev_usl_intro_final'&&!ex){ const pf=who('prof'); ex={player:rcOf(E.player.seat),prof:pf&&[pf.obj.position.x,pf.obj.position.z,!!pf.seat,pf.beh],korean:seatRC('korean'),bg:e.background,examOn:!!(E.zone&&E.zone.examOn),zone:E.zone}; } return r0.apply(this,arguments); }; await USL.attend(GM,item('us_intro')); EVENTS.run=r0; }
  check('E. 12/6 期末考：大家坐自己的位子（玩家 [2,7]、韓國同學 [3,7]），教授站講桌後面（z.examProf、不走動）、背景 freeze',!!ex&&eq(ex.player,[2,7])&&eq(ex.korean,[3,7])&&eq(ex.prof,[ZD.examProf.x,ZD.examProf.z,false,'idle'])&&ex.bg==='freeze',J(ex));
  check('E. 12/6 期末考：桌上的答案本、筆、書演的時候開（z.setExam(true)）、演完關（US-EXAM-PROPS-1110）',!!ex&&ex.examOn===true&&!!ex.zone&&ex.zone.examOn===false&&J(ex.zone.examLog)==='[true,false]',J(ex&&ex.zone&&ex.zone.examLog));
  check('E. 12/6 期末考：台詞一字不差',eq(H.said.map(s=>s.t),evTexts('ev_usl_intro_final')),J(H.said.map(s=>s.t)));
  // 12/8 最後一堂
  for(const met of [true,false]){ fresh('2028-12-08',8.5,'us_apartment',US(met?{MET_LONG:true}:{})); H.said=[]; let st=null;
    { const s0=GM.say; GM.say=async(w,t)=>{ if(/念的那一句/.test(String(t))&&!st){ const l=who('long'); st={seat:l&&rcOf(l.seat),stood:!!(l&&l.usStood),before:l&&l.standFrom}; } return s0(w,t); }; await USL.attend(GM,item('us_writing')); GM.say=s0; }
    check(`E. 12/8 最後一堂（${met?'見過':'沒見過'}何俊朗）：念句子那一拍他站起來；台詞一字不差`,!!st&&st.stood&&st.seat===null&&eq(H.said.map(s=>s.t),evTexts('ev_usl_lastclass').filter(t=>met?!/香港/.test(t):!/何俊朗念/.test(t))),J({st,said:H.said.map(s=>s.t)})); }
  /* US-FINAL-PROF-PASS-1110：選 b 的旁白「教授經過你旁邊…」前面有一步等她走到旁邊（call），上限 S.PASS_WAIT 秒 */
  { const ev3=globalThis.__ev3, d=ev3&&ev3.dialogue||[], kb=d.findIndex(l=>l&&l.label==='b'), kn=d.findIndex((l,i)=>i>kb&&l&&/教授經過你旁邊/.test(l.text||'')), kc=d.findIndex((l,i)=>i>kb&&l&&typeof l.call==='function');
    check('E. 期末報告選 b：「教授經過你旁邊」那一句前面先等她走過來（call 在旁白前；上限 '+USL.PASS_WAIT+' 秒）',kb>=0&&kc>kb&&kn>kc&&USL.PASS_WAIT>0&&USL.PASS_WAIT<=10,JSON.stringify({kb,kc,kn})); }
  check('E. 原本的事件資料沒有被改（還是 2D 的 bg:us_classroom、background dark）——3D 是演的時候複製一份',['ev_usl_midterm','ev_usl_comp_final','ev_usl_intro_final','ev_usl_lastclass'].every(id=>ev(id).background==='dark'&&ev(id).dialogue[0].bg==='us_classroom')); });

/* ======================= F 2D 照舊 ======================= */
await sec('F',async()=>{
  for(const id of ['ev_usl_office','ev_usl_long1','ev_usl_long2a']){ const e=ev(id), sc=e&&e.dialogue.find(l=>l.scene!==undefined);
    fresh('2028-09-08',12,'us_campus',US()); H.bgs=[]; await EVENTS.run(e);
    check(`F. ${id}（${sc&&sc.scene}）照舊 2D us_classroom 背景、不進 3D 教室`,!!sc&&sc.bg==='us_classroom'&&H.bgs.some(b=>b&&b.image&&/us_classroom/.test(b.image))&&!H.entered.length,J(H.bgs)); }
  // 沒有 3D 教室＝照舊 2D
  delete Z3.ZONES.us_classroom; fresh('2028-08-21',9.5,'us_campus',US()); H.said=[]; H.bgs=[];
  await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM);
  check('F. 沒有 3D 教室（Z3.ZONES.us_classroom 不在）：「進教室」照舊直接 2D 上課（2D 背景、對話框那一句、回台階下）',H.bgs.some(b=>b&&b.image&&/us_classroom/.test(b.image))&&H.said.some(s=>s.t===USL.classLine('us_intro',0,H.G))&&eq(H.entered,['us_campus']),J({bgs:H.bgs,entered:H.entered}));
  Z3.ZONES.us_classroom=ZDEF; });

/* ======================= G 存檔 ======================= */
await sec('G',async()=>{
  fresh('2028-08-22',12.5,'us_apartment',US()); delete H.G.usLife; await USL.attend(GM,item('us_comp'));
  check('G. 舊存檔（沒有 usLife）：照常一鍵上課、記出席',H.G.usLife&&H.G.usLife.att.us_comp===1&&H.G.zone==='us_campus');
  // 存在 us_classroom 裡、有課的時候讀回來
  fresh('2028-08-22',12.6,'us_campus',US()); await GM.enter('us_classroom',{x:0,z:5},{fromLoad:true});
  check('G. 在 Room 120 裡的存檔（有課的時候）讀回來：其他人都在、自己的座位有提示',!!who('german')&&!!who('prof')&&E.interactables.some(i=>i.label==='坐下（你常坐的位置）'));
  // 待到上課時間過了（沒坐下、沒上）：大家走掉
  H.G.hour=14.3; const k=USL.roomSync(GM);
  check('G. 待在教室、時間過了下課：大家往門口走（roomSync）',k===-1&&E.npcs.filter(n=>n.leaving).length>0&&!E.npcs.some(n=>n.usCls));
  fresh('2028-08-22',20,'us_campus',US()); await GM.enter('us_classroom',{x:0,z:5},{fromLoad:true});
  check('G. 在 Room 120 裡的存檔（沒課，20:00）讀回來：空教室、出口照常（「離開教室」）',!cast().length&&E.interactables.some(i=>i.label==='離開教室'));
  // 不在美國（臺灣的學期）：us_classroom 的接線不動
  fresh('2027-10-04',9.5,'campus',{}); const r=await STORY.interact({x:0,z:0,radius:1,lv:0,usClass:'law',look:'看'},GM);
  check('G. 臺灣（不在美國）：「進教室」的美國接線不作用、不進 Room 120',!H.entered.includes('us_classroom'),J({r,entered:H.entered}));
  fresh('2028-08-22',12.6,'us_classroom',US());
  check('G. 人在 Room 120＝人在美國（exchange3d.js 的 US_ZONES：時差、手機、摘要日照美國）',EXCH.inUS(H.G)&&EXCH.US_ZONES.includes('us_classroom'));
  check('G. 手機「現在大概在」有 Room 120 的名字（us_life3d.js 的 PLACES.names 清單有 us_classroom）',/'us_bed_c','us_classroom'\]\) if\(!PLACES\.names\[k\]/.test(fs.readFileSync(path.join(ROOT,'src/us_life3d.js'),'utf8'))); });

H.done();
})();
