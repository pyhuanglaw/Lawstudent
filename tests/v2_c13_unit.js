// 交接包 v2 C13（AA_115 第 1、2 節；BB_105 4-5）：可玩切片的 B4 博雅演講、B5 小桌子——不需要瀏覽器。
// 修改前沒有活動 B4（第 1 項失敗）。檢查：活動的時間地點；以安、小語、阿哲第 11 週週四在博雅 101、散場後以安和小語在圓桌（阿哲不在）；週二群組揪人（回不回都一樣）；
//   演講的台詞與時間往前跳（晚到的不跳）；散場：聽完才問、中途離開與沒去不問、20 分鐘以後不問；「好。」記 B5_GO、「先走」兩句與 LEFT_AFTER_B4；
//   B5：走到以安旁邊才開始、三種便利貼、不認識小語的版本；中途離開：之後以安一句（兩週內）；沒去：21:30 小語在群組轉述；法律審查標記
// 用法：node tests/v2_c13_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const A=ACTIVITIES.list.find(a=>a.id==='B4');
  check('1. 活動 B4 在：博雅 101、大一下第 11 週週四 19:00～20:30、選「聽演講」＝ev_b4_lecture',!!A&&A.zone==='boya'&&A.room==='101'&&JSON.stringify(A.term)==='["Y1S2"]'&&JSON.stringify(A.weeks)==='[11]'&&A.weekday===4&&A.t0===19&&A.t1===20.5&&A.event==='ev_b4_lecture'&&A.story===true,JSON.stringify(A));
  if(!A){ console.log('FAILED '+fails); process.exit(1); }
  const tue=termDay('Y1S2',11,2), thu=termDay('Y1S2',11,4);
  check('1. 第 11 週週四是 2026-05-07',CALENDAR.dateOf(thu).m===5&&CALENDAR.dateOf(thu).d===7,JSON.stringify(CALENDAR.dateOf(thu)));
  /* 作息 */
  const at=(id,day,h)=>{ fresh(day,h,'campus'); const e=STORY.schedEnt(CHARACTERS[id],G); return e?[e.zone,e.room||null].join('/'):'-'; };
  check('2. 第 11 週週四 19:30：以安、小語、阿哲都在博雅 101',['heroine_01','yu','zhe'].every(id=>at(id,thu,19.5)==='boya/101'),JSON.stringify(['heroine_01','yu','zhe'].map(id=>at(id,thu,19.5))));
  check('2. 20:45：以安、小語在博雅的圓桌；阿哲不在',at('heroine_01',thu,20.75)==='boya/round'&&at('yu',thu,20.75)==='boya/round'&&!at('zhe',thu,20.75).startsWith('boya'),JSON.stringify(['heroine_01','yu','zhe'].map(id=>at(id,thu,20.75))));
  check('2. 第 10 週、第 12 週的週四晚上不在博雅（只有這一週）',[termDay('Y1S2',10,4),termDay('Y1S2',12,4)].every(d=>d==null||['heroine_01','yu','zhe'].every(id=>!at(id,d,19.5).startsWith('boya'))));
  /* 週二揪人 */
  fresh(tue,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(8,13);
  const inv=G.msgs.filter(m=>m.tag==='b4_invite');
  check('3. 週二 12:30 麵店團：以安兩句、小語、阿哲（原文）',JSON.stringify(inv.map(m=>m.from+':'+m.text))===JSON.stringify(['heroine_01:週四晚上七點，博雅 101 有演講。','heroine_01:「政府可以為了大家，限制一個人嗎？」誰要去？','yu:我！我是憲法迷。','zhe:……我跟。散場有宵夜嗎？'])&&inv.every(m=>m.h===12.5&&m.th==='g:noodle_team'),JSON.stringify(inv.map(m=>[m.h,m.from,m.text])));
  const q=inv.find(m=>m.ask); check('3. 可以回「我去。」／「我看看。」（不回也可以，到週四 19:00）',!!q&&JSON.stringify(q.ask.opts.map(o=>o.t))==='["我去。","我看看。"]'&&q.ask.until===thu*24+19,JSON.stringify(q&&q.ask));
  PHONE.answer(G,q.ask.id,0); check('3. 回「我去。」只記 B4_REPLY（不影響週四能不能去）',G.flags.B4_REPLY==='go'&&TH('g:noodle_team').some(m=>m.from==='player'&&m.text==='我去。'));
  fresh(tue,8,'campus'); run(8,13); check('3. 不在麵店團：沒有這幾則',!G.msgs.some(m=>m.tag==='b4_invite'));
  /* 演講 */
  const ev1=ev('ev_b4_lecture'), ev2=ev('ev_b4_after'), ev3=ev('ev_b5_table'), ev4=ev('ev_b4_partial_an');
  check('4. 演講、散場、小桌子、中途離開四個事件都在',!!ev1&&!!ev2&&!!ev3&&!!ev4);
  const lecture=async(h,knowAn)=>{ fresh(thu,h,'boya'); if(knowAn) meet('heroine_01'); await EVENTS.run(ev1); return lines(); };
  let L=await lecture(19,true);
  check('4. 演講：旁白＋講者兩句 →（時間往前跳）→ 講者兩句 → 「掌聲。以安把最後那一句抄了兩次。」',JSON.stringify(L)===JSON.stringify(['講者是一位頭髮花白的老師，說話很慢。','講者：政府要限制一個人，要有理由，而且要用最小的手段。','講者：可是「最小」，是誰來量的？','講者：最後一個問題，我留給你們。','講者：被限制的那個人，最後可以去哪裡？','掌聲。以安把最後那一句抄了兩次。']),JSON.stringify(L));
  check('4. 19:00 坐下：時間往前跳 45 分鐘（之後活動快轉到 20:30）',Math.abs(G.hour-19.75)<1e-6,String(G.hour));
  L=await lecture(19.6,false); check('4. 19:36 才坐下：不跳；不認識以安＝只有「掌聲。」',Math.abs(G.hour-19.6)<1e-6&&L[L.length-1]==='掌聲。',JSON.stringify({h:G.hour,last:L[L.length-1]}));
  check('4. 法律審查標記（比例原則的方向；BB 確認前不發布）',ev1.legal_review==='REQUIRED'&&ev3.legal_review==='REQUIRED');
  /* 散場 */
  const mark=(st)=>{ const att=ACTIVITIES.rec(G).att; if(st==='full') att['B4@'+G.day]={h:19,end:'full'}; else if(st==='left') att['B4@'+G.day]={h:19,end:'left',lh:19.6}; };
  const afterOK=(st,h,know)=>{ fresh(thu,h,'boya'); if(know!==false) meet('heroine_01'); mark(st); return EVENTS.check(ev2); };
  check('5. 散場 20:35：聽完（認識以安）＝以安問；中途離開、沒去＝不問',afterOK('full',20.6)&&!afterOK('left',20.6)&&!afterOK(null,20.6),JSON.stringify([afterOK('full',20.6),afterOK('left',20.6),afterOK(null,20.6)]));
  check('5. 演講還沒結束（20:20）、結束 20 分鐘以後（20:55）、不在博雅：都不問',!afterOK('full',20.33)&&!afterOK('full',20.92)&&(()=>{ afterOK('full',20.6); G.zone='campus'; return !EVENTS.check(ev2); })());
  afterOK('full',20.6); meet('yu'); picks=[0]; await EVENTS.run(ev2);
  check('5. 「好。」：以安「要不要去小桌子整理一下？」→ 記 B5_GO＝今天',JSON.stringify(lines())==='["沈以安：要不要去小桌子整理一下？"]'&&G.flags.B5_GO===thu&&!G.flags.LEFT_AFTER_B4,JSON.stringify({L:lines(),f:G.flags}));
  afterOK('full',20.6); meet('yu'); picks=[1]; await EVENTS.run(ev2);
  check('5. 「我約了人，先走。」：以安「好。」小語「明天群組見。」；記 LEFT_AFTER_B4、沒有 B5_GO',JSON.stringify(lines())==='["沈以安：要不要去小桌子整理一下？","沈以安：好。","小語：明天群組見。"]'&&G.flags.LEFT_AFTER_B4===true&&!G.flags.B5_GO,JSON.stringify({L:lines(),f:G.flags}));
  /* B5 */
  const near=(d)=>{ const n={id:'heroine_01',obj:{position:{x:0,y:0,z:d}},lv:0}; GM.npc.heroine_01=n; E.npcs=[n]; };
  const b5=(h,d,go)=>{ fresh(thu,h,'boya'); meet('heroine_01'); if(go!==false) G.flags.B5_GO=thu; near(d); return EVENTS.check(ev3); };
  check('6. B5：說了「好。」、走到以安旁邊（2.5 m 內）才開始；離太遠、沒說好、21:30 以後都不開始',b5(20.7,1.5)&&!b5(20.7,6)&&!b5(20.7,1.5,false)&&!b5(21.6,1.5),JSON.stringify([b5(20.7,1.5),b5(20.7,6),b5(20.7,1.5,false),b5(21.6,1.5)]));
  check('6. 隔天不開始（B5_GO 只算當天）',(()=>{ b5(20.7,1.5); G.day=thu+1; G.weekday=wdOf(thu+1); return !EVENTS.check(ev3); })());
  const playB5=async(k,knowYu)=>{ b5(20.7,1.5); if(knowYu!==false) meet('yu'); picks=[k]; await EVENTS.run(ev3); return lines(); };
  L=await playB5(0);
  check('6. 開頭四句（以安、小語、以安）＋「（把便利貼推過來）你呢？寫一句。不用對。」',JSON.stringify(L.slice(0,5))===JSON.stringify(['沈以安：他說，限制自由要用最小的手段。','沈以安：可是「最小」，是對誰來說最小？','小語：對整個社會吧？','沈以安：……對那個被限制的人呢？','沈以安：（把便利貼推過來）你呢？寫一句。不用對。']),JSON.stringify(L.slice(0,5)));
  check('6. 三個想法',JSON.stringify(opts[opts.length-1])==='["「最小，要問被限制的人。」","「最小，要看大家換到了什麼。」","「我還不知道。我想知道他最後去了哪裡。」"]',JSON.stringify(opts));
  check('6. 「最小，要問被限制的人。」：以安「那他說『全部都太多』呢？」小語「那就……再問一次？」→ 三張便利貼 → 「九點半了。我回宿舍讀刑總。」；B5_THOUGHT＝ask_them',JSON.stringify(L.slice(5))===JSON.stringify(['沈以安：那他說『全部都太多』呢？','小語：那就……再問一次？','她把三張便利貼並排貼在筆記本上：她的、小語的、你的。','沈以安：九點半了。我回宿舍讀刑總。'])&&G.flags.B5_THOUGHT==='ask_them',JSON.stringify(L.slice(5)));
  check('6. 記 B4_DISCUSSED、以安記得便利貼（B5_STICKY）',G.flags.B4_DISCUSSED===true&&SOCIAL.has('heroine_01','B5_STICKY'));
  L=await playB5(1); check('6. 「最小，要看大家換到了什麼。」：以安「好。那換到的東西，要誰來證明？」；trade',L.includes('沈以安：好。那換到的東西，要誰來證明？')&&!L.includes('小語：那就……再問一次？')&&G.flags.B5_THOUGHT==='trade',JSON.stringify(L));
  L=await playB5(2); check('6. 「我還不知道。……」：以安「……那就是講者最後那一題。」；where',L.includes('沈以安：……那就是講者最後那一題。')&&G.flags.B5_THOUGHT==='where',JSON.stringify(L));
  L=await playB5(0,false); check('6. 不認識小語：小語的兩句不演、便利貼是兩張',!L.some(l=>l.startsWith('小語：'))&&L.includes('她把兩張便利貼並排貼在筆記本上：她的、你的。'),JSON.stringify(L));
  /* 中途離開 */
  const partial=(st,dd)=>{ fresh(thu,20.6,'boya'); meet('heroine_01'); mark(st); G.day=thu+dd; G.weekday=wdOf(G.day); G.hour=12; G.zone='campus'; return EVENTS.check(ev4); };
  check('7. 中途離開：之後（兩週內）找以安說話＝「你後半場不在。最精彩的你錯過了。」；聽完、沒去、超過兩週都沒有',partial('left',2)&&!partial('full',2)&&!partial(null,2)&&!partial('left',15),JSON.stringify([partial('left',2),partial('full',2),partial(null,2),partial('left',15)]));
  { partial('left',2); await EVENTS.run(ev4); check('7. 台詞',JSON.stringify(lines())==='["沈以安：你後半場不在。最精彩的你錯過了。"]',JSON.stringify(lines())); }
  /* 沒去 */
  const missedRun=(st)=>{ fresh(thu,18,'campus'); PHONE.join(G,'noodle_team','麵店團'); mark(st); run(18,22); return G.msgs.filter(m=>m.tag==='b4_missed'); };
  let M=missedRun(null); check('8. 沒去：21:30 小語在麵店團「講者最後問：被限制的人可以去哪裡。我想了一路。」',M.length===1&&M[0].from==='yu'&&M[0].text==='講者最後問：被限制的人可以去哪裡。我想了一路。'&&M[0].h===21.5,JSON.stringify(M.map(m=>[m.h,m.from,m.text])));
  check('8. 聽完、中途離開：沒有這一則',missedRun('full').length===0&&missedRun('left').length===0);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
