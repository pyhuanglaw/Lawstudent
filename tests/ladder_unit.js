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
    if(off!=null){ G.hour=off; G.social.ladderDay={}; G.zone='campus'; check('10. 芷若下班、在校園（Z-L1 不在 Café 推進：baa5c577 的 location，BB-B AA_200 第 2 節第 1 項）：可以推進',STORY.ladNext(G,ZR)===LADDER.characters[ZR].steps[0]); G.zone='cafe'; } }
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
  // AA_313 第 2 節第 54 列：K4 一起讀書的視訊（ev_kexin_video_study）那晚不接 K-L6（同一個讀書時的聲音）；別的視訊照接
  { const i6=LK.steps.findIndex(s=>s.id==='K-L6'); if(i6>=0){ const w6=(LK.steps[i6].week||[7])[0], d6=termDay('Y1S1',w6,3);
    const run=async ev=>{ fresh(d6,21,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); G.social.ladder=G.social.ladder||{}; G.social.ladder[KX]=i6; picks=[0,0,0,0,0,0]; said=[];
      await OUT.go(GM,{id:'t_k6'+ev,ev,day:d6,h:21,place:'視訊',verb:'接起來',title:'視訊',travel:'',travelH:0,state:'planned'}); return {t:lines().join('｜'),n:G.social.ladder[KX]}; };
    const a=await run('ev_kexin_video_study');
    check('12c. K4 視訊讀書那晚：不接 K-L6（階梯停在原地）',!a.t.includes(LK.steps[i6].lines[0])&&a.n===i6,a.t.slice(-80)); }
    else check('12c. 有 K-L6',false); }
  // AA_304 第 10 列：休學在家那一年（經濟系、退宿以後），出遊演完不直接接階梯（講的是家裡的事）：白天不接；傍晚以後先「（晚上，回到家。）」
  { const LB=LADDER.byTerm.Y0S2&&LADDER.byTerm.Y0S2[KX]; if(LB){ const w0=(LB.steps[0].week||[6])[0], dd=termDay('Y0S2',w0,4), f0={introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,Y0_MOVED_OUT:true};
    fresh(dd,13,'home',f0); G.stage='econ'; picks=[0,0,0,0,0,0]; const k0=((G.social.ladder||{})[KX+'@Y0S2']|0);
    await OUT.go(GM,{id:'t_b1',ev:'ev_y0_e18b',day:dd,h:13,place:'豆花店',title:'生日',travel:'',travelH:0,state:'planned'}); const t1=lines().join('｜');
    check('12b. 休學在家那一年：白天的出遊演完，不接她的階梯（不推進）',!t1.includes('（晚上，回到家。）')&&((G.social.ladder||{})[KX+'@Y0S2']|0)===k0,t1.slice(-80));
    fresh(dd,18,'home',f0); G.stage='econ'; picks=[0,0,0,0,0,0]; said=[];
    await OUT.go(GM,{id:'t_b2',ev:'ev_y0_e18b',day:dd,h:18,place:'豆花店',title:'生日',travel:'',travelH:0,state:'planned'}); const L2=lines(), i=L2.indexOf('（晚上，回到家。）');
    check('12b. 傍晚以後的出遊演完：先「（晚上，回到家。）」再接階梯一層',i>0&&i<L2.length-1&&((G.social.ladder||{})[KX+'@Y0S2']|0)===k0+1,L2.slice(-4).join('｜')); }
    else check('12b. 有 Y0S2 可昕的階梯',false); }
  // 學期外：不走階梯（交給舊的閒聊）
  fresh(termDay('Y1S2',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(PS); R(PS,12); said=[];
  { const L2=LADDER.byTerm.Y1S2[PS], y1=((G.social.ladder||{})[PS])|0; said=[];
    const ok=await STORY.ladderTalk(GM,who,PS); const st=L2.steps[0];
    check('13. 大一下（一學期一個檔）：用大一下的檔、從第 1 層開始；大一上的進度不動、大一下另外記（id@Y1S2）',
      ok===true&&(st.if||st.week||st.location||st.time?true:lines().join('').includes((STORY.ladLines(st)[0]||'').t||STORY.ladLines(st)[0]))&&(G.social.ladder[PS]|0)===y1&&(G.social.ladder[PS+'@Y1S2']|0)<=1,
      JSON.stringify({ok,y1:G.social.ladder[PS],y2:G.social.ladder[PS+'@Y1S2'],said:lines().slice(0,2)})); }
  { const ZR='heroine_02'; fresh(termDay('Y3S1',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(ZR); R(ZR,12); said=[];   /* 大三上芷若在英國（BB_113 第 0 節）：那一學期沒有她的階梯檔 */
    check('13b. 那一學期沒有這個人的階梯檔（大三上的芷若）：ladderTalk 回 false（照舊閒聊）',!(LADDER.byTerm.Y3S1||{})[ZR]&&(await STORY.ladderTalk(GM,who,ZR))===false&&said.length===0); }
  fresh(termDay('Y2S1',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true}); said=[];
  check('13c. 大二上以安有檔（AA_141）：資料讀得到、key 是 heroine_01@Y2S1',!!(STORY.ladData(G,'heroine_01')&&STORY.ladData(G,'heroine_01').key==='heroine_01@Y2S1'));
  // any：語彤 Y-L1＝雨天總圖門口或麵店那一次
  const YT='heroine_03'; fresh(D0,12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(YT); R(YT,12);
  check('14. 語彤 Y-L1：兩個事件都沒發生＝不推進',STORY.ladNext(G,YT)===null);
  G.events.done.ev_noodle_yutong=D0; check('14. 語彤 Y-L1：麵店那一次發生過（any 其中一個）＝推進',STORY.ladNext(G,YT)===LADDER.characters[YT].steps[0]);
  // linesIf／extraIf（AA 2026-10-16）
  const Y1=LADDER.characters[YT].steps[0];
  // 2026-10-17 AA_193（125f4d1a）：麵店要先 FIRST_MET（總圖門口認識過），「只在麵店認識」不會發生；linesIf 改成「不下雨那一次（ev_library_door_phone）認識的」
  G.events.done.ev_library_door_phone=D0;
  check('15. 語彤 Y-L1 在不下雨的總圖門口認識（ev_library_door_phone）：linesIf 換成「我問你幾點的那個」',JSON.stringify(STORY.ladLines(Y1))===JSON.stringify(Y1.linesIf[0].lines)&&/問你幾點/.test(Y1.linesIf[0].lines[0]),JSON.stringify(STORY.ladLines(Y1)));
  G.events.done.ev_rain_library_door=D0; check('15. 雨天總圖門口遇過：照原本的 lines',JSON.stringify(STORY.ladLines(Y1))===JSON.stringify(Y1.lines));
  check('15. 麵店的初見要先 FIRST_MET（只在麵店認識不會發生）',JSON.stringify(EVENTS.byId?EVENTS.byId('ev_noodle_yutong').prereq:STORY_EVENTS.find(e=>e.id==='ev_noodle_yutong').prereq).includes('FIRST_MET'));
  const Y5=LADDER.characters[YT].steps[4]; const n5=STORY.ladLines(Y5).length;
  SOCIAL.remember(YT,'HELPED',''); const L5=STORY.ladLines(Y5);
  check('16. 語彤 Y-L5 傘給她（HELPED）：extraIf 多說一句',Y5.extraIf&&L5.length===n5+Y5.extraIf[0].lines.length&&L5[L5.length-1]===Y5.extraIf[0].lines[0],JSON.stringify(L5));
  // skipIf：條件成立＝這一層直接算過、不播、不算今天推進（用測試資料，BB-B 的 Q-L3 改好以後也會用到）
  LADDER.characters.t_skip={steps:[{id:'T1',skipIf:{flags:['T_SKIP']},lines:['第一層']},{id:'T2',lines:['第二層']}],greet:{base:['嗨']}};
  fresh(D0,12,'campus',{T_SKIP:true}); const nx=STORY.ladNext(G,'t_skip');
  check('17. skipIf 成立：跳過 T1、這次就是 T2',nx&&nx.id==='T2'&&G.social.ladder.t_skip===1&&G.social.ladderDay.t_skip===undefined,JSON.stringify(G.social.ladder));
  fresh(D0,12,'campus',{}); check('17. skipIf 不成立：照樣是 T1',(STORY.ladNext(G,'t_skip')||{}).id==='T1');
  delete LADDER.characters.t_skip;
  // BB-B 599c8cd（企劃線 36375b69）：會永久卡住的條件改成 skipIf（在 if 之前判斷）——已經被邀過社課（INVITED_CLUB）的玩家，子晴 Q-L3 跳過、Q-L4 照常出現
  { const LQ2=LADDER.characters[QZ], i3=LQ2.steps.findIndex(s=>s.id==='Q-L3');
    fresh(D0,15,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet(QZ); R(QZ,30,10,10); (G.social.ladder||(G.social.ladder={}))[QZ]=i3;   /* Q-L4 要熟悉以上 */ SOCIAL.remember(QZ,'INVITED_CLUB','');
    const nx=STORY.ladNext(G,QZ); check('18. 已經有 INVITED_CLUB：Q-L3 跳過、這次是 Q-L4（不會永久卡在 Q-L3）',!!LQ2.steps[i3].skipIf&&nx&&nx.id==='Q-L4',nx&&nx.id);
    // S-L3／P-L3：if 不成立時才用到 skipIf（skipIf 要在 if 之前判斷）——熟悉以上、沒參加過週三讀書會＝跳過
    for(const [id,sid] of [['heroine_05','S-L3'],[PS,'P-L3']]){ const LL=LADDER.characters[id], k=LL.steps.findIndex(s=>s.id===sid); if(k<0||!LL.steps[k].skipIf){ check('18. '+sid+' 有 skipIf',false); continue; }
      fresh(D0,15,'library',{introDone:true,classDone:true,afternoonDone:true}); meet(id); R(id,30,10,10); (G.social.ladder||(G.social.ladder={}))[id]=k; G.weekday=3;
      const n2=STORY.ladNext(G,id); check('18. '+sid+'：熟悉以上、沒參加過週三讀書會＝跳過（不卡住）',(G.social.ladder[id]|0)>k||(n2&&n2.id!==sid),n2?n2.id:('ladder '+G.social.ladder[id])); } }
  { const tags=new Set(), walk=o=>{ if(Array.isArray(o)) o.forEach(walk); else if(o&&typeof o==='object'){ if(typeof o.mem==='string') tags.add(o.mem); for(const k in o) walk(o[k]); } };
    walk(LADDER.byTerm); const miss=[...tags].filter(t=>!SOCIAL.MEMORY_LABEL[t]);
    check('19. 每個學期的階梯記憶都有人物面板的中文名稱（MEMORY_LABEL）',tags.size>50&&!miss.length,tags.size+' 個；缺 '+miss.join(' ')); }
  check('20. 學期檔：大一上（和 characters 同一份）、大一下七位、大二上下以安和語彤',LADDER.byTerm.Y1S1===LADDER.characters&&Object.keys(LADDER.byTerm.Y1S2).length===7&&!!LADDER.byTerm.Y2S1.heroine_01&&!!LADDER.byTerm.Y2S2.heroine_03,Object.keys(LADDER.byTerm).join(','));
  // 2026-10-16 AA-B 驗收（企劃線 AA_140 G45）：linesIf／extraIf 裡的 week 原本沒有作用（整套丟給 EVENTS.cond，不認得 week＝永遠成立）；greet.when 的 weekParity 原本沒有處理。修改前 21、22 失敗。
  { const A3=LADDER.byTerm.Y1S2.heroine_01.steps.find(s=>s.id==='A2-L3');
    fresh(termDay('Y1S2',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true});
    check('21. 以安 A2-L3 大一下第 3 週（linesIf 只寫 week 7～18）：用原本的 lines（不說「杜鵑都謝了」）',JSON.stringify(STORY.ladLines(A3,G,'heroine_01'))===JSON.stringify(A3.lines),JSON.stringify(STORY.ladLines(A3,G,'heroine_01')));
    fresh(termDay('Y1S2',8,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true});
    check('21. 以安 A2-L3 大一下第 8 週（沒拍過杜鵑）：linesIf 換成 week 7～18 那一套（AA_209 改稿：「杜鵑都謝了」）',JSON.stringify(STORY.ladLines(A3,G,'heroine_01'))===JSON.stringify(A3.linesIf.find(x=>x.week).lines)&&/杜鵑都謝了/.test(A3.linesIf.find(x=>x.week).lines[0]),JSON.stringify(STORY.ladLines(A3,G,'heroine_01')));
    said=[]; fresh(termDay('Y1S2',3,3),12,'campus',{introDone:true,classDone:true,afternoonDone:true}); meet('heroine_01'); R('heroine_01',30,10,10);
    picks=[0]; await STORY.ladPlay(GM,{name:'沈以安',charId:'heroine_01'},'heroine_01',A3);
    check('21. ladPlay 實際播出來的也是原本的 lines',lines().join('｜').includes(A3.lines[0])&&!lines().join('｜').includes('杜鵑都謝了'),lines().slice(0,2).join('｜')); }
  { const W=LADDER.byTerm.Y1S2.heroine_05.greet.when;   // 2026-10-17 BB-C 408398d7：學姊不在法服值班（YT_FAFU／法服方案改），「今天值班」那句拿掉；第 15 週換成畢業典禮那句
    check('22. 學姊大一下的招呼沒有「今天值班」（weekParity 那一句）',!W.some(w=>w.weekParity)&&!W.some(w=>/值班/.test(w.t)),JSON.stringify(W.map(w=>w.t)));
    const J=JSON.stringify; check('22. 第 15 週「這週六畢業典禮。不要下雨就好。」、第 16 週「期末了，記得睡覺。」',W.some(w=>J(w.week)==='[15,15]'&&/畢業典禮/.test(w.t))&&W.some(w=>J(w.week)==='[16,16]'&&/記得睡覺/.test(w.t))); }
  { const src=require('fs').readFileSync(require('path').join(__dirname,'..','src/story3d.js'),'utf8'), m=src.match(/const l=\['判決要看事實，不要只背結論。'[^\n]*?\]\.filter\(\(t,i\)=>i>0\|\|!\(typeof SOCIAL!=='undefined'&&SOCIAL\.playerYear&&SOCIAL\.playerYear\(\)>=2\)\)/);
    check('23. 學姊沒有階梯時的備用句：「判決要看事實，不要只背結論。」只在大一（AA_263 (b) 第 4 點）',!!m); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
