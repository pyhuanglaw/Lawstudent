// 閒聊階梯（AA_135、AA_136、BB_130；src/data/ladder.js；使用者 2026-10-15「要一層一層聊天認識彼此……可以限制每天只能多認識多少，但不要一直講一樣的話」）——不需要瀏覽器。
// 照 docs/story_planning/ladder/README.md 的測試清單：一天只推進一層；同一層不重播；條件不到給短招呼；短招呼情境句；存讀檔後層數不變；舊存檔從第 1 層開始；芷若上班中不推進；可昕只在見面／視訊推進。
// 沒有涵蓋：直向、橫向的對話框（要瀏覽器）；阿凱吵架後第 4 天和好（kaiDorm 事件還沒做）。修改前 STORY.ladNext 不存在（第 1 項失敗）。
// 用法：node tests/ladder_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  check('1. LADDER 與 STORY.ladNext 存在',typeof LADDER!=='undefined'&&typeof STORY.ladNext==='function');
  if(typeof STORY.ladNext!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  check('1. 七位：以安、語彤、芷若、子晴、學姊、沛珊、可昕',['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'].every(id=>LADDER.characters[id]&&LADDER.characters[id].steps.length>=8));
  const D0=termDay('Y1S1',4,3);   // 大一上第 4 週週三
  const PS='classmate_peishan', who={name:'沛珊',charId:PS};
  const S0=LADDER.characters[PS].steps;
  fresh(D0,12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(PS); R(PS,12);
  picks=[0]; await STORY.ladderTalk(GM,who,PS); const t1=lines().join('｜');
  check('2. 第一次聊：播 P-L1（她的第一句）',t1.includes(S0[0].lines[0]),t1.slice(0,80));
  check('2. 推進一層：ladder＝1、ladderDay＝今天',G.social.ladder[PS]===1&&G.social.ladderDay[PS]===G.day);
  const fam1=SOCIAL.rel(PS).fam; check('2. P-L1 的 rel 加上去（fam +2 以上）',fam1>=14,'fam '+fam1);
  said=[]; await STORY.ladderTalk(GM,who,PS); const t2=lines().join('｜');
  check('3. 同一天再聊：不推進（ladder 還是 1）',G.social.ladder[PS]===1);
  check('3. 同一天再聊：不播 P-L2、給短招呼',!t2.includes(S0[1].lines[0])&&said.length===1,t2);
  check('3. 短招呼是 greet 的句子',LADDER.characters[PS].greet.base.concat(LADDER.characters[PS].greet.when.map(w=>w.t)).includes(said[0].t),said[0].t);
  G.day=D0+1; G.weekday=wdOf(G.day); said=[]; picks=[0]; await STORY.ladderTalk(GM,who,PS); const t3=lines().join('｜');
  check('4. 隔天：播 P-L2（不重播 P-L1）',t3.includes(S0[1].lines[0])&&!t3.includes(S0[0].lines[0]),t3.slice(0,80));
  check('4. ladder＝2',G.social.ladder[PS]===2);
  // 條件不到：子晴 Q-L1 只在 14:00 以後
  const QZ='heroine_04', whoQ={name:'子晴',charId:QZ}; meet(QZ); R(QZ,12); G.hour=10; said=[];
  await STORY.ladderTalk(GM,whoQ,QZ);
  check('5. 子晴 10:00（Q-L1 要 14:00 以後）：不推進、給短招呼',(G.social.ladder[QZ]|0)===0&&said.length===1,lines().join('｜'));
  G.hour=15; said=[]; picks=[0]; await STORY.ladderTalk(GM,whoQ,QZ);
  check('5. 子晴 15:00：推進 Q-L1',G.social.ladder[QZ]===1&&lines().join('').includes(LADDER.characters[QZ].steps[0].lines[0]));
  // 基本短招呼輪替、不連續重複
  let prev=null, rep=0; const seen=new Set(); for(let d=0;d<30;d++){ G.day=D0+2+d; G.weekday=wdOf(G.day); G.hour=10; G.zone='wenzhou'; for(let k=0;k<3;k++){ const g=STORY.ladGreet(G,QZ); if(g===prev) rep++; prev=g; seen.add(g); } }
  check('6. 短招呼不連續重複（30 天×3 次）',rep===0,'重複 '+rep);
  check('6. 短招呼會輪到不同的句子',seen.size>=4,'用到 '+seen.size+' 句');
  // 情境句：同一天同一句只說一次
  const LQ=LADDER.characters[QZ].greet.when; const w0=LQ.find(w=>!w.working&&(w.location||w.time||w.weekday));
  if(w0){ fresh(D0+3,12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(QZ); R(QZ,12);
    let found=null; for(let dd=0;dd<14&&!found;dd++){ G.day=D0+3+dd; G.weekday=wdOf(G.day); for(const z of (w0.location?[].concat(w0.location):['campus'])){ G.zone=z; for(let h=(w0.time?w0.time[0]:9);h<(w0.time?w0.time[1]:22);h+=0.5){ G.hour=h; if(w0.weekday&&!w0.weekday.includes(G.weekday)) continue; found={d:G.day,z,h}; break; } if(found) break; } }
    if(found){ G.social.greetUsed={}; const a=STORY.ladGreet(G,QZ), b=STORY.ladGreet(G,QZ);
      check('7. 情境句優先（符合地點／時段）',a===w0.t||LQ.some(w=>w.t===a),a);
      check('7. 同一天同一句情境句只說一次',a!==b,a+' / '+b); }
    else check('7. 找得到情境句的時段',false); }
  // 存讀檔
  fresh(D0,12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(PS); R(PS,12); picks=[0]; await STORY.ladderTalk(GM,who,PS);
  const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); EVENTS.bind(GM); G.day=D0+1; G.weekday=wdOf(G.day);
  check('8. 存讀檔後層數不變（ladder＝1，下一層是 P-L2）',G.social.ladder[PS]===1&&STORY.ladNext(G,PS)===S0[1]);
  delete G.social.ladder; delete G.social.ladderDay; delete G.social.greetUsed;
  check('9. 舊存檔（沒有 ladder 欄位）：從第 1 層開始、不出錯',STORY.ladNext(G,PS)===S0[0]);
  // 芷若上班中不推進
  const ZR='heroine_02', whoZ={name:'芷若',charId:ZR}; let work=null;
  for(let dd=0;dd<7&&!work;dd++){ fresh(D0+dd,8,'cafe',{introDone:true,classDone:true,afternoonDone:true}); meet(ZR); R(ZR,12); for(let h=8;h<23;h+=0.5){ G.hour=h; if(STORY.ladWorking(G,ZR)){ work={d:G.day,h}; break; } } }
  check('10. 找得到芷若在吧檯上班的時段',!!work,JSON.stringify(work));
  if(work){ said=[]; await STORY.ladderTalk(GM,whoZ,ZR);
    check('10. 芷若上班中：不推進',(G.social.ladder[ZR]|0)===0);
    const wl=LADDER.characters[ZR].greet.when.filter(w=>w.working).map(w=>w.t);
    check('10. 芷若上班中：說上班的短招呼',said.length===1&&(wl.length===0||wl.includes(said[0].t)),said[0]&&said[0].t);
    let off=null; for(let h=8;h<23;h+=0.5){ G.hour=h; if(!STORY.ladWorking(G,ZR)){ off=h; break; } }
    if(off!=null){ G.hour=off; G.social.ladderDay={}; check('10. 芷若下班：可以推進',STORY.ladNext(G,ZR)===LADDER.characters[ZR].steps[0]); } }
  // 可昕只在見面／視訊推進
  const KX='kexin', LK=LADDER.characters[KX];
  fresh(D0,20,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true});
  check('11. 可昕：路上（沒有 mode）不推進',STORY.ladNext(G,KX)===null);
  check('11. 可昕：見面時推進 K-L1',STORY.ladNext(G,KX,'meet')===LK.steps[0]);
  const vi=LK.steps.findIndex(s=>s.dateOnly==='video'), mi=LK.steps.findIndex(s=>s.dateOnly==='meet');
  if(vi>=0){ G.social.ladder[KX]=vi; const vw=LK.steps[vi].week; if(vw){ G.day=termDay('Y1S1',vw[0],3); G.weekday=wdOf(G.day); }   /* K-L6 只在第 7～9 週 */
    check('11. dateOnly:video 那一層：見面不推進、視訊推進',STORY.ladNext(G,KX,'meet')===null&&STORY.ladNext(G,KX,'video')===LK.steps[vi]); }
  if(mi>=0){ G.social.ladder[KX]=mi; check('11. dateOnly:meet 那一層：視訊不推進、見面推進',STORY.ladNext(G,KX,'video')===null&&STORY.ladNext(G,KX,'meet')===LK.steps[mi]); }
  G.flags.dating_kexin=false; G.social.ladder[KX]=0; check('11. 沒有 dating_kexin：不推進',STORY.ladNext(G,KX,'meet')===null);
  // 出遊之後接一層（outings3d.js）
  fresh(D0,13,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); picks=[0,0,0,0,0,0];
  const q={id:'t_k1',ev:'ev_kexin_tour_nccu',day:D0,h:14,place:'政大',title:'導遊',travel:'',travelH:0.5,state:'planned'};
  await OUT.go(GM,q); const tk=lines().join('｜');
  check('12. 和可昕出遊（見面）演完：接著聊 K-L1',tk.includes(LK.steps[0].lines[0])&&G.social.ladder[KX]===1,tk.slice(-120));
  // 學期外：不走階梯（交給舊的閒聊）
  fresh(termDay('Y1S2',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(PS); R(PS,12); said=[];
  check('13. 大一下（沒有階梯資料）：ladderTalk 回 false（照舊閒聊）',(await STORY.ladderTalk(GM,who,PS))===false&&said.length===0);
  // any：語彤 Y-L1＝雨天總圖門口或麵店那一次
  const YT='heroine_03'; fresh(D0,12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(YT); R(YT,12);
  check('14. 語彤 Y-L1：兩個事件都沒發生＝不推進',STORY.ladNext(G,YT)===null);
  G.events.done.ev_noodle_yutong=D0; check('14. 語彤 Y-L1：麵店那一次發生過（any 其中一個）＝推進',STORY.ladNext(G,YT)===LADDER.characters[YT].steps[0]);
  // linesIf／extraIf（AA 2026-10-16）
  const Y1=LADDER.characters[YT].steps[0];
  check('15. 語彤 Y-L1 只在麵店認識（沒有雨天總圖門口）：linesIf 換成麵店版的台詞',JSON.stringify(STORY.ladLines(Y1))===JSON.stringify(Y1.linesIf[0].lines),JSON.stringify(STORY.ladLines(Y1)));
  G.events.done.ev_rain_library_door=D0; check('15. 雨天總圖門口遇過：照原本的 lines',JSON.stringify(STORY.ladLines(Y1))===JSON.stringify(Y1.lines));
  const Y5=LADDER.characters[YT].steps[4]; const n5=STORY.ladLines(Y5).length;
  SOCIAL.remember(YT,'HELPED',''); const L5=STORY.ladLines(Y5);
  check('16. 語彤 Y-L5 傘給她（HELPED）：extraIf 多說一句',Y5.extraIf&&L5.length===n5+Y5.extraIf[0].lines.length&&L5[L5.length-1]===Y5.extraIf[0].lines[0],JSON.stringify(L5));
  // skipIf：條件成立＝這一層直接算過、不播、不算今天推進（用測試資料，BB-B 的 Q-L3 改好以後也會用到）
  LADDER.characters.t_skip={steps:[{id:'T1',skipIf:{flags:['T_SKIP']},lines:['第一層']},{id:'T2',lines:['第二層']}],greet:{base:['嗨']}};
  fresh(D0,12,'campus',{T_SKIP:true}); const nx=STORY.ladNext(G,'t_skip');
  check('17. skipIf 成立：跳過 T1、這次就是 T2',nx&&nx.id==='T2'&&G.social.ladder.t_skip===1&&G.social.ladderDay.t_skip===undefined,JSON.stringify(G.social.ladder));
  fresh(D0,12,'campus',{}); check('17. skipIf 不成立：照樣是 T1',(STORY.ladNext(G,'t_skip')||{}).id==='T1');
  delete LADDER.characters.t_skip;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
