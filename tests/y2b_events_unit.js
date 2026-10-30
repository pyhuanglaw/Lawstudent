// 1B 大二～大三上的人物事件（AA_316 1B-01～07、AA_321 1B-08～11；src/data/y2b_events.js、src/y2b3d.js）——不需要瀏覽器。照 AA 給 BB 的驗收情境寫：
//   K1～K4 可昕考壞一科；Y1～Y3 語彤買賣不破租賃；A1～A4 陪阿姨來；M1～M3 以安媽媽的晚餐；Q1～Q4 子晴爸爸來了；Z1～Z4 芷若最後一個班；
//   T1～T4 可昕兩邊的朋友；13b、U1～U5 語彤助教與那把傘；Q10-1～4 子晴畢業專題；C1～C5 芷若明信片；R1 沛珊放榜後。台詞不寫死全文的地方用「有沒有出現」查。
//   AA_336 第 B 節（AA-C 回 LAWWW 實作問題）：B1 週四 19:30（M3）、B2 交往中＝和任何人（Z3）、B3 可昕看了你一眼＝旁白、B4 12/5 那則 21:10、B5 六個面板名稱、
//   B6 芷若英國的生日（9/24 背面一行、9/28 21:55 打給她／不打、22:00 視訊三句、ZR_BDAY_CALL）。
//   最後：接線（index.html、classes3d.js 的 IN_CLASS／clubEvent、events.js 的 YT_AUNT_KNOWS）。
//   2026-10-22 AA_296 2-3-1 ④（企劃線 3f406dbc）改了 R1 的期待值：8/7 21:00 她打來，那兩則私訊是沒接的替代版。
// 修改前：沒有這些事件（第 0 項 FAIL）。用法：node tests/y2b_events_unit.js
// 2026-10-28 AA_519 第 6 節（企劃線 d75cd0228，NPC-STORY2-1028）改了 T1 的期待值：予樂「這是很好笑／老實／客氣的司機。」和電影夜重複，第二場（兩邊的朋友）改「司機你們都認識了。……今天換他當客人。」
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|Y2B|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/y2b_events.js','src/y2b3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{pothos:[0.7,-2.3]}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const ct=id=>{ G.contacts[id]=1; };
const has=t=>said.some(s=>s.t===t), lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||'')+':'+m.text);
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async id=>{ said=[]; opts=[]; await EVENTS.run(ev(id)); };
const answer=(id,k)=>PHONE.answer(G,id,k);
(async()=>{
  check('0. 事件都在、程式掛上去了', ['ev_kexin_bad_exam','ev_yt_lease_text','ev_yt_aunt_retell','ev_an_mother_map','ev_ziqing_dad_visit','ev_ziqing_dad_sorry','ev_zhiruo_last_shift','ev_kexin_two_circles','ev_yt_ta_news','ev_yt_ta_news_lib','ev_yt_umbrella_y3','ev_ziqing_capstone','ev_zhiruo_xmas_video'].every(id=>!!ev(id))&&typeof Y2B!=='undefined'&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0&&CLS.IN_CLASS.length>0&&!!MSG._y2b&&!!STORY._y2bFafu);
  if(fails){ console.log('FAILED '+fails); process.exit(1); }

  // ---------- 1B-01 可昕 K10c ----------
  const mine=(th,first)=>{ const L=txt(th), i=L.indexOf(first); return i<0?[]:L.slice(i); };   /* 只看這一批的訊息（同一天別的規則也會傳）*/
  fresh('2026-11-18',20.9,'dorm'); date('kexin'); rules(); check('K0. 11/18 20:54 還沒傳', !PHONE.sent(G,'y2_kx_bad_exam'));
  at('2026-11-18',21.05); rules(); check('K1. 11/18 21:00 三則（物權。我考壞了。……不要安慰我。）、有兩個回覆', JSON.stringify(mine('p:kexin','kexin:物權。').slice(0,3))===JSON.stringify(['kexin:物權。','kexin:我考壞了。','kexin:……不要安慰我。'])&&PHONE.byAsk(G,'y2_kx_bad_exam').ask.opts.length===2, JSON.stringify(txt('p:kexin')));
  answer('y2_kx_bad_exam',0); rules(); const q1=OUT.get(G,'y2_kx_bad_exam');
  check('K1. 「明天晚上我過去。不安慰。」→「……好。八點半，樓下。」、排出遊 11/19 20:30（開車 40 分鐘＝19:50 出發）', txt('p:kexin').includes('kexin:……好。八點半，樓下。')&&!!q1&&q1.day===D('2026-11-19')&&q1.h===20.5&&Math.abs(q1.travelH-2/3)<1e-6&&q1.ev==='ev_kexin_bad_exam');
  picks=[2]; await run('ev_kexin_bad_exam');
  check('K1. 長椅：三選一；選不動產那句 →「……好。我收下。」；收尾三句；HELPED', opts[0].length===3&&/不動產/.test(opts[0][2])&&has('……好。我收下。')&&has('……今天這樣剛好。')&&G.flags.KX_BAD_EXAM==='joke'&&SOCIAL.has('kexin','HELPED'), JSON.stringify(opts[0]));
  at('2026-12-02',21.1); rules(); check('K1. 12/2 21:00 讀書會那則（不動產那句）', txt('p:kexin').includes('kexin:你那句不動產，我在讀書會講了。')&&txt('p:kexin').includes('kexin:只有予樂笑。'));
  at('2026-12-05',21.1); rules(); check('B4. 12/5 21:06 還沒有那則（AA_336 B4：21:10）', !txt('p:kexin').includes('kexin:物權考壞的那一章，我講給予樂聽，講到她懂。'));
  at('2026-12-05',21.2); rules(); check('K1. 12/5 21:10 那則（三種都有）', txt('p:kexin').includes('kexin:物權考壞的那一章，我講給予樂聽，講到她懂。'));
  fresh('2026-11-18',21.1,'dorm'); date('kexin'); rules(); at('2026-11-19',20); rules();
  check('K2. 不回：19:50 以後記 self、沒有出遊', G.flags.KX_BAD_EXAM==='self'&&!OUT.get(G,'y2_kx_bad_exam'));
  at('2026-11-22',22.1); rules(); at('2026-12-05',21.2); rules();
  check('K2. 11/22「解決了。不用安慰我。」；12/5 那則照樣有；沒有 12/2 那則', txt('p:kexin').includes('kexin:解決了。不用安慰我。')&&txt('p:kexin').includes('kexin:物權考壞的那一章，我講給予樂聽，講到她懂。')&&!PHONE.sent(G,'y2_kx_bad_1202'));
  fresh('2026-11-18',21.1,'dorm'); date('kexin'); rules(); answer('y2_kx_bad_exam',0); rules(); at('2026-11-19',21); OUT.onMissed(GM,OUT.get(G,'y2_kx_bad_exam')); PHONE.tick(G);
  check('K3. 答應了但沒到：20:50「……你沒來。」「沒關係。我自己讀。」；記 self；沒有長椅', txt('p:kexin').includes('kexin:……你沒來。')&&txt('p:kexin').includes('kexin:沒關係。我自己讀。')&&G.flags.KX_BAD_EXAM==='self'&&!G.events.done.ev_kexin_bad_exam);
  fresh('2026-11-18',21.1,'dorm'); rules(); check('K. 沒交往：不發生', txt('p:kexin').length===0);
  { const L=JSON.stringify(ev('ev_kexin_bad_exam').dialogue); check('K4. 她沒有出假設題、沒有拿祐廷比較（沒有「如果」「比你」）', !/如果|比你/.test(L)); }

  // ---------- 1B-02 語彤事件 8 ----------
  const it={c:COURSES.list.find(c=>c.id==='oblig_spec'),exam:null,key:'k'};
  fresh('2027-03-29',9.5,'linze'); R('heroine_03','FRI'); SOCIAL.remember('heroine_03','RENT_RUMOR','量店面'); ct('heroine_03');
  await Y2B.leaseClass(GM,it,null,{prof:'葉教授'});
  check('Y1. 課堂段：葉教授兩句（時間）、看過事件 6＝想起捲尺', has('葉教授：房子賣了，房客怎麼辦？法律說：住進去了，租約就跟著房子走。新屋主要接著當房東。')&&has('葉教授：換句話說，法律給了房客一樣東西：時間。')&&has('（你想起去年在麵店，那個拿捲尺量店面的人。）')&&!!G.events.done.ev_yt_lease_class, JSON.stringify(lines()));
  picks=[0]; said=[]; await CLS.afterClassEvent(GM,it);
  check('Y1. 下課後：傳／不傳；「阿姨的租約還有多久？」→「兩年」「你也在想剛剛那一條？」→ 照片；記 LAW_MEETS_LIFE、YT_LEASE_HELP', opts[0]&&opts[0][0]==='（傳訊息給語彤）'&&txt('p:heroine_03').join('|')==='player:阿姨的租約還有多久？|heroine_03:兩年|heroine_03:你也在想剛剛那一條？'&&has('（你傳了一張課本那一頁的照片。）')&&SOCIAL.has('heroine_03','LAW_MEETS_LIFE')&&G.flags.YT_LEASE_HELP===true, JSON.stringify(txt('p:heroine_03')));
  at('2027-03-29',21.6); rules(); check('Y1. 當天 21:30「我拿給阿姨看了」「她叫我把那一頁影印給她」（一句一則、沒有句號）', txt('p:heroine_03').slice(-2).join('|')==='heroine_03:我拿給阿姨看了|heroine_03:她叫我把那一頁影印給她');
  { const s=fs.readFileSync(path.join(ROOT,'src/data/syllabus.js'),'utf8'); check('Y1. 行政救濟第 13 週的回想讀 LAW_MEETS_LIFE（syllabus.js 已有）', /LAW_MEETS_LIFE/.test(s)); }
  fresh('2027-03-29',9.5,'linze'); R('heroine_03','FRI'); ct('heroine_03'); date('heroine_03'); await Y2B.leaseClass(GM,it,null,{prof:'葉教授'}); picks=[0]; said=[]; await CLS.afterClassEvent(GM,it);
  check('Y2. 沒有 RENT_RUMOR：語彤低頭寫筆記；問句換「妳剛剛一直在寫筆記……」；她說房東想賣；補記 RENT_RUMOR', txt('p:heroine_03').join('|')==='player:妳剛剛一直在寫筆記。阿姨的店，是不是也有這種事？|heroine_03:兩年|heroine_03:……房東想把整棟賣掉。還沒確定。'&&SOCIAL.has('heroine_03','RENT_RUMOR'), JSON.stringify(txt('p:heroine_03')));
  at('2027-03-29',21.6); rules(); check('Y2. 交往中：21:30 兩則後面多「謝謝你」', txt('p:heroine_03').slice(-1)[0]==='heroine_03:謝謝你');
  fresh('2027-03-29',9.5,'linze'); R('heroine_03','FRI'); ct('heroine_03'); said=[]; await CLS.afterClassEvent(GM,it);
  check('Y3. 翹這堂課（沒有課堂段）：下課後什麼都沒有、LAW_MEETS_LIFE 沒有值', said.length===0&&!SOCIAL.has('heroine_03','LAW_MEETS_LIFE'));
  fresh('2027-04-05',9.5,'linze'); R('heroine_03','FRI'); said=[]; const r7=await Y2B.leaseClass(GM,it,null,{prof:'葉教授'}); check('Y. 第 7 週那一堂：沒有課堂段', r7===false&&said.length===0);

  // ---------- 1B-03 語彤事件 9 ----------
  fresh('2027-05-22',9.2,'wancai',{lawclub:true}); R('heroine_03','FRI'); R('classmate_bohan','FRI'); picks=[0];
  check('A0. 5/22 法服值班到期（成員、單週）', STORY.fafuShiftable(G)&&Y2B.auntDue(G));
  said=[]; await STORY.fafuShift(GM);
  check('A1. 法服成員 5/22：阿姨和語彤進來；柏翰「那紀錄你照做，意見我來講」；門口三選一；記 RENT_CONSULTATION、IMPORTANT_CONVERSATION；值班算一次', has('（法律系館B的諮詢室。門開了，進來的是阿鳳阿姨，後面跟著語彤。）')&&has('好。那紀錄你照做，意見我來講。')&&has('好啦，聽妳們的。')&&opts[0].length===3&&SOCIAL.has('heroine_03','RENT_CONSULTATION')&&SOCIAL.has('heroine_03','IMPORTANT_CONVERSATION')&&G.flags.LAWCLUB_SAT_VISITS===1&&!!G.events.done.ev_yt_aunt_consult&&!has('（初談紀錄，一頁。學長在最下面簽名。）'), JSON.stringify(lines().slice(0,4)));
  fresh('2027-05-22',9.2,'wancai',{lawclub:true,YT_AUNT_KNOWS:true}); R('heroine_03','FRI'); date('heroine_03'); picks=[2]; said=[]; await STORY.fafuShift(GM);
  check('A2. 交往中、阿姨知道：「認識啊，我們語彤的男朋友。」；柏翰叫他不要做紀錄；柏翰知道；門口第三個多一句手背', has('認識啊，我們語彤的男朋友。')&&has('……喔。那這件你不要做紀錄，坐旁邊聽就好。紀錄我自己來。')&&!has('我常去她們店裡吃麵。')&&ROM.knowsOf(G,'classmate_bohan','heroine_03')&&has('（她的手碰了一下你的手背，又收回去。）'));
  fresh('2027-05-22',9.2,'wancai',{lawclub:true}); R('heroine_03','FRI'); date('heroine_03'); SOCIAL.remember('heroine_03','IMPORTANT_CONVERSATION','阿姨扭到手腕，那週她顧店到打烊；阿姨說她怕你來幫忙'); picks=[1]; said=[]; await STORY.fafuShift(GM);
  check('A2. 舊存檔（沒有 YT_AUNT_KNOWS）照那條記憶的備註判斷；第二個多一句', has('認識啊，我們語彤的男朋友。')&&has('……你陪我送她回店裡。'));
  { const s=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); check('A2. 大一下事件 4 交往版記 YT_AUNT_KNOWS', /\{if:\{flags:\['dating_heroine_03'\]\},set:\{YT_AUNT_KNOWS:true\}\}/.test(s)); }
  fresh('2027-05-22',9.2,'wancai'); R('heroine_03','FRI'); said=[]; check('A3. 不是法服成員：5/22 沒有在場版', !Y2B.auntDue(G));
  at('2027-05-25',18); G.zone='noodle'; SOCIAL.remember('heroine_03','LAW_MEETS_LIFE',''); said=[]; const hit=EVENTS.onInteract('heroine_03'); await new Promise(r=>setTimeout(r,5));
  check('A3. 之後在麵店和語彤說話：三句（AA_375 第 9 項：「上次我陪阿姨去法服。」）＋「就是你那天傳的那一頁」；記 RENT_CONSULTATION', hit&&has('上次我陪阿姨去法服。')&&has('阿姨出來的時候在笑。')&&has('就是你那天傳的那一頁。')&&SOCIAL.has('heroine_03','RENT_CONSULTATION'), JSON.stringify(lines()));
  fresh('2027-06-12',21.2,'dorm'); R('heroine_03','FRI'); ct('heroine_03'); rules();
  check('A3. 都沒遇到：6/12 21:00 三句（第一句「前陣子」）', txt('p:heroine_03').join('|')==='heroine_03:前陣子我陪阿姨去法服。|heroine_03:裡面的人說，租約到期以前，他不能趕我們。|heroine_03:阿姨出來的時候在笑。');
  fresh('2027-05-25',18,'noodle'); said=[]; const hit4=EVENTS.onInteract('heroine_03'); fresh('2027-06-12',21.2,'dorm'); ct('heroine_03'); rules();
  check('A4. 不認識語彤：沒有轉述、沒有 6/12 那則', !hit4&&txt('p:heroine_03').length===0);

  // ---------- 1B-04 以安新 12 ----------
  fresh('2027-04-27',18,'noodle',{AN_TUTOR_FAMILY:1}); R('heroine_01','FAM'); const mm=ev('ev_an_mother_map');
  check('M1. 有新 10、第 10 週週二 18:00 在麵店：可以演', EVENTS.check(mm));
  picks=[1]; await run('ev_an_mother_map');
  check('M1. 從「我寫了一頁流程……」開始；三選一；「她常常對。很煩。」；記 TALKED_FAMILY、AN_MAP', said[0].t==='我寫了一頁流程，用白話寫的。拿給我媽看。'&&opts[0].length===3&&has('她常常對。很煩。')&&G.flags.AN_MAP==='right'&&SOCIAL.has('heroine_01','TALKED_FAMILY'));
  fresh('2027-04-27',18,'noodle'); R('heroine_01','FAM'); date('heroine_01'); picks=[0]; await run('ev_an_mother_map');
  check('M2. 沒有新 10：先「家教的學生……被駁回了」、補記 AN_TUTOR_FAMILY；交往中最後多一句', said[0].t==='我家教的學生，家裡申請的補助被駁回了。我在幫他們看那份公文。'&&G.flags.AN_TUTOR_FAMILY===1&&said[said.length-1].t==='你不要跟我媽說我說她很煩。');
  fresh('2027-04-29',19.5,'noodle'); R('heroine_01','FAM'); check('M3. 週四 19:30 才去：不演', !EVENTS.check(mm));
  at('2027-04-29',19); check('M3. 週四 19:00：演', EVENTS.check(mm));
  at('2027-06-01',18); check('M. 第 15 週以後：不演', !EVENTS.check(mm));

  // ---------- 1B-05 子晴 Q8 ----------
  fresh('2027-05-18',22.5,'gongguan'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','PLAYTESTED','Q6'); const dv=ev('ev_ziqing_dad_visit');
  check('Q1. FRIEND 以上、看過 Q6，5/18 22:30 在公館：可以演', EVENTS.check(dv));
  picks=[2]; await run('ev_ziqing_dad_visit');
  check('Q1. 騎樓、爸爸搭計程車、「陪我走一下。河堤。」；三選一；「他一定會懂」＝ARGUED', has('（男人說了一句話，有點笨拙地攔了一台計程車，走了。）')&&has('陪我走一下。河堤。')&&opts[0].length===3&&has('……『一定會』。')&&SOCIAL.has('heroine_04','ARGUED')&&G.flags.ZQ_DAD_HEARD===true&&G.flags.ZQ_DAD_ARGUED_DAY===G.day);
  CG_REGISTRY.cg_riverbank_heroine04={file:'x'}; fresh('2027-05-18',22.5,'gongguan'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','PLAYTESTED','Q6'); picks=[1]; await run('ev_ziqing_dad_visit'); delete CG_REGISTRY.cg_riverbank_heroine04;
  check('Q1. CG 登錄了才放（BCG-02，在河堤第一句）；「我想玩玩看」＝TESTER', cgs.join()==='cg_riverbank_heroine04'&&G.flags.TESTER===true);
  fresh('2027-05-26',19.5,'wancai'); R('heroine_04','FRI'); G.flags.ZQ_DAD_ARGUED_DAY=D('2027-05-18'); const ce=CLS.clubEvent(G,{id:'club_guitar'});
  check('Q2. 選「他一定會懂」、兩週內週三吉他社：她先說「我那天很兇。……」', ce&&ce.id==='ev_ziqing_dad_sorry');
  await run('ev_ziqing_dad_sorry'); check('Q2. 那一句', has('我那天很兇。……但你不要再說『一定』。'));
  at('2027-06-09',19.5); check('Q2. 兩週以後：不說', !EVENTS.check(ev('ev_ziqing_dad_sorry'),{chain:true}));
  fresh('2027-05-18',22.5,'gongguan'); R('heroine_04','FRI'); check('Q3. 沒看過 Q6：沒有騎樓那一場', !EVENTS.check(dv));
  ct('heroine_04'); at('2027-06-04',22.2); rules();
  check('Q3. 6/4 22:00 四則（AA_255 第 7 節的版本，AA_375 第 4 節提醒）、沒有提到遊戲；兩個回覆', txt('p:heroine_04').join('|')==='heroine_04:我爸上禮拜來過|heroine_04:搭計程車來 搭計程車回去|heroine_04:他問我最近在忙什麼 我說寫程式|heroine_04:……我跟芷若去河堤走了一圈 沒事'&&PHONE.byAsk(G,'y2_zq_dad_msg').ask.opts.length===2&&G.flags.ZQ_DAD_HEARD===true);
  check('Q4. 6/4 那則不是「我爸剛走」的寫法', !txt('p:heroine_04').some(t=>/剛走|爸.*走了/.test(t)));

  // ---------- 1B-06 芷若 Z9 ----------
  const ls=ev('ev_zhiruo_last_shift');
  fresh('2027-06-03',21.2,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); G.events.done.ev_zhiruo_applied=1; check('Z1. 6/3 21:00 在 Café：可以演', EVENTS.check(ls));
  picks=[0]; await run('ev_zhiruo_last_shift');
  check('Z1. 常客、知道她要出國：「老樣子」「我教她了」；票根；收尾「九月二號。……我會寫。」；TICKET_STUB、seen', has('（對新店員）這位是法律系的。老樣子。')&&has('（對祐廷）我教她了。你的點法。')&&has('（從包包拿出一張電影票根）幫我做一件事。')&&has('九月二號。……我會寫。')&&!has('我下學期要去英國。……現在你知道了。')&&SOCIAL.has('heroine_02','TICKET_STUB')&&G.flags.ZR_LAST_SHIFT==='seen'&&G.hour>=22&&G.hour<22.01, JSON.stringify([lines(),G.hour,SOCIAL.has('heroine_02','TICKET_STUB'),G.flags.ZR_LAST_SHIFT]));
  fresh('2027-06-03',21.2,'cafe',{CAFE_VISITS:1}); R('heroine_02','FAM'); await run('ev_zhiruo_last_shift');
  check('Z2. 不常來：「他點什麼，問他。」、沒有「我教她了」；不知道她要出國＝先說英國', has('（對新店員）這位是法律系的。他點什麼，問他。')&&!has('（對祐廷）我教她了。你的點法。')&&said[0].t==='我下學期要去英國。……現在你知道了。');
  CG_REGISTRY.cg_last_shift_heroine02={file:'x'}; fresh('2027-06-03',21.2,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); date('kexin'); await run('ev_zhiruo_last_shift');
  check('Z3. 交往中（和可昕）：一疊票根、沒有 CG、沒有「我的那杯」', has('常客一人一張。我不在的時候，去看一部電影。看完寫一句話，寄到店裡。我會回。')&&cgs.length===0&&!has('……我的那杯，我沒有教她。'));
  fresh('2027-06-03',21.2,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); date('heroine_02'); SOCIAL.remember('heroine_02','ASKED_HER_DRINK',''); await run('ev_zhiruo_last_shift');
  check('Z5. 和芷若交往中（AA_338 第 0 節更正 AA_336 B2）：照主版——只給他一張、有 ASKED_HER_DRINK 的「……我的那杯，我沒有教她。」；不是一疊票根', has('（從包包拿出一張電影票根）幫我做一件事。')&&has('……我的那杯，我沒有教她。')&&!has('常客一人一張。我不在的時候，去看一部電影。看完寫一句話，寄到店裡。我會回。')&&cgs.join()==='cg_last_shift_heroine02', JSON.stringify(lines()));
  fresh('2027-06-03',21.2,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); await run('ev_zhiruo_last_shift'); delete CG_REGISTRY.cg_last_shift_heroine02;
  check('Z1. CG 登錄了才放（BCG-15）', cgs.join()==='cg_last_shift_heroine02');
  fresh('2027-09-02',10.5,'dorm'); R('heroine_02','FAM'); ct('heroine_02'); rules();
  check('Z4. 沒去：9/2 三則，第一則說清楚去英國；TICKET_STUB、missed', txt('p:heroine_02').join('|')==='heroine_02:今天出發去英國了。|heroine_02:櫃台有一張電影票根，給你的，跟老闆拿。|heroine_02:我不在的時候，去看一部電影。看完寫一句話給我。'&&SOCIAL.has('heroine_02','TICKET_STUB')&&G.flags.ZR_LAST_SHIFT==='missed');
  fresh('2027-09-02',10.5,'dorm'); R('heroine_02','FAM'); ct('heroine_02'); date('heroine_02'); rules();
  check('Z4b. 沒去、和芷若交往中：9/2 照主版（給你的那一張）', txt('p:heroine_02').join('|')==='heroine_02:今天出發去英國了。|heroine_02:櫃台有一張電影票根，給你的，跟老闆拿。|heroine_02:我不在的時候，去看一部電影。看完寫一句話給我。', JSON.stringify(txt('p:heroine_02')));
  fresh('2027-09-02',10.5,'dorm'); R('heroine_02','FAM'); ct('heroine_02'); date('kexin'); rules();
  check('Z4c. 沒去、和別人（可昕）交往中：9/2 一疊票根那一版', txt('p:heroine_02').join('|')==='heroine_02:今天出發去英國了。|heroine_02:櫃台有一疊電影票根，常客一人一張，跟老闆拿。|heroine_02:看完寫一句話，寄到店裡。我會回。', JSON.stringify(txt('p:heroine_02')));

  // ---------- 1B-07 可昕 K12 ----------
  fresh('2027-03-21',21.1,'dorm',{KX_INTRO:'gf',KX_MET_NOODLE_TEAM:true,YL_IMPRESSION:'funny'}); date('kexin'); SOCIAL.remember('yu','FIRST_MET',''); rules();
  check('T1. 3/21 21:00 三則、兩個回覆', mine('p:kexin','kexin:兩邊的朋友該見面了。').slice(0,3).join('|')==='kexin:兩邊的朋友該見面了。|kexin:週四晚上六點，你們的麵店。|kexin:我負責予樂，你負責阿哲。'&&PHONE.byAsk(G,'y2_kx_circles').ask.opts.length===2, JSON.stringify(txt('p:kexin')));
  answer('y2_kx_circles',0); rules(); const q7=OUT.get(G,'y2_kx_circles');
  check('T1. 「好。」→ 予樂要穿得像面試；排出遊 3/25 18:00 麵店', txt('p:kexin').includes('kexin:好。我先跟予樂說，她會穿得很像要去面試。')&&q7&&q7.day===D('2027-03-25')&&q7.h===18&&q7.ev==='ev_kexin_two_circles');
  at('2027-03-25',18); picks=[2]; await run('ev_kexin_two_circles');
  check('T1. 見過麵店團、K3 說了女朋友：「上次是烤肉，這次是麵。」、沒有介紹選項；予樂「司機你們都認識了。……今天換他當客人。」（AA_519 第 6 節，不再說「這是很好笑的司機。」）；綽號三選一；「麵店分店」群組', has('上次是烤肉，這次是麵。')&&opts.length===1&&opts[0].length===3&&has('司機你們都認識了。……今天換他當客人。')&&!has('這是很好笑的司機。')&&has('「麵店分店」。不准改。')&&PHONE.inGroup(G,'noodle_branch')&&G.flags.KX_CIRCLES_MET===true, JSON.stringify(opts));
  fresh('2027-03-21',21.1,'dorm'); date('kexin'); rules(); answer('y2_kx_circles',0); rules(); at('2027-03-25',18); picks=[1,0]; await run('ev_kexin_two_circles');
  check('T2. K3 沒去、介紹「木柵大學法律」：「你們就是麵店團？」；阿哲、Alison 不知道她是女友；記 KX_MET_NOODLE_TEAM；沒有 YL_IMPRESSION＝可昕「這是我的司機。」', has('你們就是他一直講的那群人？我聽了一年半。')&&!ROM.knowsGF(G,'zhe')&&!ROM.knowsGF(G,'yu')&&G.flags.KX_MET_NOODLE_TEAM===true&&has('這是我的司機。'));
  check('B3. 介紹「木柵大學法律」：旁白「（可昕看了你一眼，沒說什麼。）」（不是可昕說話）', said.some(s=>s.who===null&&s.t==='（可昕看了你一眼，沒說什麼。）'));
  fresh('2027-03-21',21.1,'dorm'); date('kexin'); rules(); answer('y2_kx_circles',0); rules(); at('2027-03-25',18); picks=[0,0]; await run('ev_kexin_two_circles');
  check('T2b. 介紹「我女朋友」：阿哲「……喔。」、在場的人知道', has('……喔。')&&ROM.knowsGF(G,'zhe')&&!has('你都不講！'));
  fresh('2027-03-21',21.1,'dorm'); date('kexin'); rules(); answer('y2_kx_circles',1); rules();
  check('T3. 婉拒：「……好。那下次。」、不排出遊、KX_MET_NOODLE_TEAM 不記', txt('p:kexin').includes('kexin:……好。那下次。')&&!OUT.get(G,'y2_kx_circles')&&!G.flags.KX_MET_NOODLE_TEAM);
  fresh('2027-03-21',21.1,'dorm'); date('kexin'); rules(); at('2027-03-23',21.1); rules();
  check('T3b. 不回：3/23 21:00「週四。六點。你還沒回。」', txt('p:kexin').includes('kexin:週四。六點。你還沒回。'));
  fresh('2027-03-25',18,'dorm'); date('kexin'); SOCIAL.remember('heroine_01','FIRST_MET',''); picks=[1,2]; await run('ev_kexin_two_circles');
  check('T4. 認識以安：19:40「我們八點讀書會。……很高興認識妳。」（AA_375 第 15 項）→ 可昕「嗯。下次見。」；八點半結尾', has('我們八點讀書會。……很高興認識妳。')&&has('嗯。下次見。')&&has('（八點半。予樂說要開一個群組，名字她來取。）'));

  // ---------- 1B-08 語彤 13b、事件 12 ----------
  fresh('2027-09-07',18,'noodle'); R('heroine_03','FRI'); check('13b. 大三上第 1 週週二 18:00 麵店：可以演', EVENTS.check(ev('ev_yt_ta_news')));
  picks=[0]; await run('ev_yt_ta_news'); check('13b. 兩句＋二選一＋「下週二第一次上台。我要講二十分鐘。」；YT_TA', has('系上老師叫我當助教。質性研究方法。')&&has('下週二第一次上台。我要講二十分鐘。')&&G.flags.YT_TA===true&&!EVENTS.check(ev('ev_yt_ta_news_lib')));
  const um=ev('ev_yt_umbrella_y3');
  fresh('2027-09-14',12.3,'campus',{rain_umbrella:'give'}); R('heroine_03','FRI'); ct('heroine_03'); rules();
  check('U0. 12:10 她私訊兩則（加油、講完跟我說）', txt('p:heroine_03').join('|')==='heroine_03:今天下午第一次上台|heroine_03:氣象說傍晚會下雨'&&PHONE.byAsk(G,'y3_yt_umb_noon').ask.opts.length===2);
  at('2027-09-14',17); Y2B.tick(GM,0.6); check('U0. 那天傍晚一定下雨', G.weather==='rain'&&E.w==='rain');
  CG_REGISTRY.cg_umbrella_heroine03={file:'x'}; at('2027-09-14',17.6); E.player.obj.position.x=80; E.player.obj.position.z=1; check('U1. 17:30 在總圖門口：可以演', EVENTS.check(um));
  picks=[0]; await run('ev_yt_umbrella_y3');
  check('U1. 給傘、兩人單身：她撐著那把傘；「……可以再說一次嗎。」（AA_338 第 6 節）；CG；記 HELPED', has('（她撐著你兩年前那把傘。）')&&has('……可以再說一次嗎。')&&!said.some(s=>/你是第一個/.test(s.t))&&cgs.join()==='cg_umbrella_heroine03'&&SOCIAL.has('heroine_03','HELPED')&&G.flags.YT_UMBRELLA_Y3==='seen');
  fresh('2027-09-14',17.6,'campus',{rain_umbrella:'none'}); R('heroine_03','FRI'); picks=[0]; await run('ev_yt_umbrella_y3');
  check('U2. 我也沒帶：沒有 CG；「你有帶嗎？……我也沒有。」「我們兩個還是很慘。」；記 SHARED_UMBRELLA', cgs.length===0&&has('你有帶嗎？……我也沒有。')&&has('我們兩個還是很慘。')&&SOCIAL.has('heroine_03','SHARED_UMBRELLA'));
  fresh('2027-09-14',17.6,'campus'); R('heroine_03','FRI'); picks=[1]; await run('ev_yt_umbrella_y3'); delete CG_REGISTRY.cg_umbrella_heroine03;
  check('U3. 大一沒碰到雨天：「我今天有帶傘。氣象說會下。」', has('我今天有帶傘。氣象說會下。')&&has('……可是今天我不切蔥。我坐著吃。'));
  fresh('2027-09-14',12.3,'campus',{rain_umbrella:'share'}); R('heroine_03','FRI'); ct('heroine_03'); date('heroine_03'); rules(); answer('y3_yt_umb_noon',0); at('2027-09-14',17.6); picks=[0]; await run('ev_yt_umbrella_y3');
  check('U4. 交往中、中午回了「加油！！！」：「中午你傳的那三個驚嘆號……」；恭喜＝「中午說加油，現在說恭喜。」', G.flags.YT12_CHEER===true&&has('中午你傳的那三個驚嘆號，我上台前看了一下。')&&has('嗯。……中午說加油，現在說恭喜。')&&has('我後來買了一把跟你那天一樣的。很蠢吧。'));
  fresh('2027-09-14',17.6,'campus',{rain_umbrella:'give'}); R('heroine_03','FRI'); date('kexin'); ROM.learn(G,'heroine_03','kexin','test'); picks=[0]; await run('ev_yt_umbrella_y3');
  check('U. 和別人交往、她知道：只用友情版（「我今天有帶傘。」、沒有「你的傘」、沒有「可以再說一次嗎」）', has('我今天有帶傘。')&&!has('（她撐著你兩年前那把傘。）')&&has('謝謝。阿姨等一下一定會說第二次。')&&!has('……可以再說一次嗎。'));
  fresh('2027-09-14',18.6,'dorm'); R('heroine_03','FRI'); ct('heroine_03'); rules(); PHONE.tick(G); at('2027-09-14',20.1); rules();
  check('U5. 沒去：20:00「今天講完了」「……傘我自己有帶」', txt('p:heroine_03').join('|')==='heroine_03:今天講完了|heroine_03:……傘我自己有帶'&&G.flags.YT_UMBRELLA_Y3==='missed');

  // ---------- 1B-09 子晴 Q10 ----------
  const cp=ev('ev_ziqing_capstone');
  fresh('2027-11-08',21.1,'dorm'); R('heroine_04','FRI'); ct('heroine_04'); rules(); const q10=OUT.get(G,'y3_zq_q10');
  check('Q10-0. 11/8 21:00 兩則＋出發提醒（11/9 19:30 兩點半）', txt('p:heroine_04').join('|')==='heroine_04:我有兩個專題，只能交一個。|heroine_04:明天晚上七點半，兩點半。你來幫我看一下。'&&q10&&q10.goto&&q10.goto.zone==='cafe'&&q10.h===19.5);
  at('2027-11-09',19.4); G.zone='cafe'; check('Q10-1. 19:15～20:00 在 Café：可以演', EVENTS.check(cp));
  picks=[3]; await run('ev_ziqing_capstone');
  check('Q10-1. 沒看過 Q6：開頭「……你應該不知道。我在做遊戲」；選④第一次：「我念過一個多月經濟」、記 TOLD_HER_CHANGE、nameless', said[0].t==='……你應該不知道。我在做遊戲，大一就開始了。上個月丟到網路上。'&&opts[0].length===4&&/一個多月經濟/.test(opts[0][3])&&SOCIAL.has('heroine_04','TOLD_HER_CHANGE')&&G.flags.ZQ_Q10==='nameless'&&has('（她把沒有名字的那個資料夾拖到桌面正中間。）'));
  check('Q10-4. 配樂那段：「把說好的事寫下來」，沒有法律結論（沒有「條」「違法」「合法」）', has('那妳們先把說好的事寫下來。誰做什麼、做完歸誰、可不可以放在別的地方。')&&!said.some(s=>/第.+條|違法|合法|著作權法/.test(s.t))&&G.flags.ZQ_MUSIC_CREDIT===true);
  fresh('2027-11-09',19.4,'cafe'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','PLAYTESTED','Q6'); SOCIAL.remember('heroine_04','TOLD_HER_CHANGE',''); picks=[3]; await run('ev_ziqing_capstone');
  check('Q10-2. 看過 Q6：沒有開頭那句；已經說過換方向＝選④換「我上次說換跑道的事」', said[0].t==='畢業專題。我要交那隻貓。'&&/換跑道/.test(opts[0][3])&&has('……你這樣講，我比較不怕了。'));
  fresh('2027-11-08',21.1,'dorm'); R('heroine_04','FRI'); ct('heroine_04'); rules(); at('2027-11-09',20.05); rules(); at('2027-11-09',21.05); PHONE.tick(G);
  check('Q10-3. 沒去：21:00「我自己選了。……」；ZQ_Q10 self、配樂照樣有', txt('p:heroine_04').includes('heroine_04:我自己選了。……其實本來就差不多決定了。')&&G.flags.ZQ_Q10==='self'&&G.flags.ZQ_MUSIC_CREDIT===true);

  // ---------- 1B-10 芷若明信片 ----------
  fresh('2027-09-24',13,'dorm',{ZR_LAST_SHIFT:'seen'}); R('heroine_02','FAM'); SOCIAL.remember('heroine_02','TICKET_STUB',''); E.interactables=[{x:0.5,z:-2,deskStudy:true}]; Y2B.tick(GM,0.6); const pc=E.interactables.find(i=>i.zrPostcard);
  check('C1. 9/24 中午以後：宿舍書桌上一張「明信片」', !!pc&&pc.label==='明信片');
  picks=['慢車']; said=[]; await Y2B.pcScene(GM);
  check('C1. 讀到「倫敦一直下雨……」；可以回寄（四個選項＋先不回；沒看過早場＝沒有落差那個）；記 ZR_CARDS_SENT', said[0].t.indexOf('「倫敦一直下雨。')===0&&opts[0].length===4&&!opts[0].some(t=>/落差/.test(t))&&JSON.stringify(G.flags.ZR_CARDS_SENT)==='["slow"]'&&!E.interactables.some(i=>i.zrPostcard), JSON.stringify(opts[0]));
  fresh('2027-09-24',13,'dorm',{ZR_LAST_SHIFT:'missed'}); R('heroine_02','FAM'); said=[]; picks=[4]; await Y2B.pcScene(GM);
  check('C2. 沒去 Z9：9/24 那張最前面多「到倫敦了」兩行', said[0].t==='「到倫敦了。這學期在這裡交換。」'&&said[1].t==='「櫃台那張票根，是要你去看一部電影，看完寫一句話給我。」');
  fresh('2027-09-24',13,'cafe'); R('heroine_02','FAM'); date('kexin'); E.interactables=[{x:3,z:1,counter:'cafe'}]; Y2B.tick(GM,0.6);
  check('C3. 和可昕交往：明信片在 Café 的牆上', E.interactables.some(i=>i.zrPostcard&&i.label==='牆上的明信片'));
  G.zone='dorm'; E.interactables=[]; Y2B.tick(GM,0.6); check('C3. 不在宿舍', !E.interactables.some(i=>i.zrPostcard));
  fresh('2027-12-17',13,'dorm'); R('heroine_02','FAM'); date('heroine_02'); for(let i=0;i<4;i++){ said=[]; picks=['先不回']; await Y2B.pcScene(GM); } const xv=OUT.get(G,'y3_zr_xmas_video');   /* 四張依序讀（9/24 起），最後一張是 12/17 */
  check('C4. 和芷若交往：12/17 那張背面「12/25，台灣晚上八點。打給我。」；12/25 20:00 視訊', said.some(s=>s.t==='「12/25，台灣晚上八點。打給我。」')&&xv&&xv.day===D('2027-12-25')&&xv.h===20&&xv.verb==='接起來');
  await run('ev_zhiruo_xmas_video'); check('C4. 視訊兩句（BB_124 聖誕「她在國外」）', has('這裡的聖誕節，店都關了。')&&has('我很想做一杯給你。'));
  { const s=fs.readFileSync(path.join(ROOT,'src/y2b3d.js'),'utf8')+fs.readFileSync(path.join(ROOT,'src/data/y2b_events.js'),'utf8'); check('C5. 沒有真實片名', !/戀戀風塵|東京物語|晚春/.test(s)); }
  fresh('2027-12-17',13,'dorm'); R('heroine_02','FAM'); G.flags.ZR_CARDS_SENT=['slow']; Y2B.tick(GM,0.6);
  check('C. 一般版：回寄過的玩家沒有 12/17 那張', !Y2B.pcCards(G).some(c=>c.key==='2027-12-17'));

  // ---------- AA_336 B5 面板名稱、B6 芷若英國的生日 ----------
  { const L=SOCIAL.MEMORY_LABEL; check('B5. 六個回憶面板的名稱照 AA_336 B5', L.LAW_MEETS_LIFE==='把買賣不破租賃那一頁傳給她'&&L.RENT_CONSULTATION==='聽她說陪阿姨去法服諮詢'&&L.TICKET_STUB==='她出國前給的電影票根'&&L.TOLD_HER_CHANGE==='跟她說過自己從經濟換到法律'&&L.POSTCARDS==='回寄過她從英國寄來的明信片'&&L.POSTCARDS_GROUP==='在寄給她的大明信片上寫了一句', JSON.stringify(['LAW_MEETS_LIFE','RENT_CONSULTATION','TICKET_STUB','TOLD_HER_CHANGE','POSTCARDS','POSTCARDS_GROUP'].map(k=>L[k]))); }
  const BACK='「9/28，台灣晚上十點。打給我。」', V3=['今天我一個人看了一部電影。','……你打來了，所以不算一個人。','好了。去睡。你那邊很晚了。'];
  const card924=async(zone,fl,dt)=>{ fresh('2027-09-24',13,zone,Object.assign({ZR_LAST_SHIFT:'seen'},fl||{})); R('heroine_02','FAM'); SOCIAL.remember('heroine_02','TICKET_STUB',''); if(dt) date(dt); picks=['先不回']; said=[]; await Y2B.pcScene(GM); };
  const tickWait=async()=>{ const r=Y2B.tick(GM,0.6); await new Promise(z=>setTimeout(z,30)); return r; };
  await card924('dorm');
  check('B6. 9/24 那張（寄到宿舍）：她寫的那段後面，背面多「9/28，台灣晚上十點。打給我。」', said.length>=2&&said[0].t.indexOf('「倫敦一直下雨。')===0&&said[said.length-1].t===BACK, JSON.stringify(said.map(s=>s.t)));
  at('2027-09-28',21.8); check('B6. 9/28 21:48 還不問', !Y2B.bdayDue(G));
  { at('2027-09-28',21+56/60); said=[]; opts=[]; picks=[0]; let h0=null; const s0=GM.say; GM.say=async(w,t)=>{ if(t===V3[0]) h0=G.hour; return s0(w,t); }; const r=await tickWait(); GM.say=s0;
    const ix=t=>said.findIndex(s=>s.t===t);
    check('B6. 21:55 系統字「（明信片背面寫著：台灣晚上十點。）」→「打給她。」「不打。」；打給她＝22:00 視訊三句（照順序、芷若說）、記 ZR_BDAY_CALL {2027:true}', r===true&&!!said[0]&&said[0].who===null&&said[0].t==='（明信片背面寫著：台灣晚上十點。）'&&JSON.stringify(opts[0])==='["打給她。","不打。"]'&&V3.every(t=>said.some(s=>s.who===SOCIAL.displayName('heroine_02')&&s.t===t))&&ix(V3[0])<ix(V3[1])&&ix(V3[1])<ix(V3[2])&&h0!=null&&Math.abs(h0-22)<1e-6&&JSON.stringify(G.flags.ZR_BDAY_CALL)==='{"2027":true}'&&OUT.get(G,'y3_zr_bday_call').state==='done', JSON.stringify([r,said.map(s=>(s.who||'')+':'+s.t),opts[0],h0,G.flags.ZR_BDAY_CALL]));
    check('B6. 打過了：不再問', !Y2B.bdayDue(G)&&Y2B.tick(GM,0.6)===false); }
  await card924('dorm'); at('2027-09-28',22); said=[]; opts=[]; picks=[1]; await tickWait();
  check('B6. 選「不打。」：沒有視訊、記 {2027:false}、不再問', !V3.some(t=>has(t))&&!!G.flags.ZR_BDAY_CALL&&G.flags.ZR_BDAY_CALL[2027]===false&&!Y2B.bdayDue(G)&&!OUT.get(G,'y3_zr_bday_call'));
  await card924('dorm'); at('2027-09-28',22.6); check('B6. 22:30 以後才有空：不問（這一通沒有）', !Y2B.bdayDue(G));
  await card924('dorm'); at('2027-09-28',22); G.home={at:true}; check('B6. 人在臺北的家：不問', Y2B.tick(GM,0.6)===false); delete G.home;
  fresh('2027-09-28',22,'dorm'); R('heroine_02','FAM'); Y2B.tick(GM,0.6); check('B6. 沒讀 9/24 那張（沒收到明信片）：不問', !Y2B.bdayDue(G)&&Y2B.tick(GM,0.6)===false&&!G.flags.ZR_BDAY_CALL);
  await card924('cafe',{},'kexin');
  check('B6. 寄到 Café 的常客版（和可昕交往）：背面沒有那一行；9/28 不問', said.length>0&&!has(BACK)&&(at('2027-09-28',22),!Y2B.bdayDue(G)), JSON.stringify(said.map(s=>s.t)));

  // ---------- 1B-11 沛珊 ----------
  /* AA_296 2-3-1 ④（企劃線 3f406dbc）：8/7 21:00 改成她打來；那兩則私訊是沒接的替代版（逐字對稿在 tests/aa296_phone_live_unit.js）*/
  fresh('2027-08-07',21.2,'dorm'); R('classmate_peishan','FRI'); ct('classmate_peishan'); PHONE.postAt(G,{th:'p:classmate_peishan',from:'player',text:'生日快樂'},D('2027-03-15'),20); rules();
  { const q=OUT.get(G,'y3_ps_back_call'), due=OUT.due(G); said=[]; opts=[]; picks=[0]; if(q&&due) await OUT.go(GM,q);
    check('R1. 消失期傳過訊息：8/7 21:00 她打來（AA_296 ④）「……喂。」…「對不起。」、選「妳還好嗎？」＝「我現在很好。真的。」；不傳私訊；PS_BACK_READ 照樣記那一天', !!due&&due.id==='y3_ps_back_call'&&has('……喂。')&&has('對不起。')&&has('我現在很好。真的。')&&!txt('p:classmate_peishan').some(t=>t.startsWith('classmate_peishan:'))&&G.flags.PS_BACK_READ===D('2027-08-07'), JSON.stringify(said.map(s=>s.t))); }
  fresh('2027-08-07',21.2,'dorm'); R('classmate_peishan','FRI'); ct('classmate_peishan'); PHONE.postAt(G,{th:'p:classmate_peishan',from:'player',text:'生日快樂'},D('2027-03-15'),20); rules(); G.hour=21.6; rules();
  check('R1. 消失期傳過訊息、那一通沒接（過了 30 分鐘）：8/7 21:00「……這半年我都沒看手機。對不起。」「我現在很好。」', mine('p:classmate_peishan','classmate_peishan:……這半年我都沒看手機。對不起。').slice(0,2).join('|')==='classmate_peishan:……這半年我都沒看手機。對不起。|classmate_peishan:我現在很好。'&&G.flags.PS_BACK_READ===D('2027-08-07'));
  fresh('2027-08-07',21.2,'dorm'); R('classmate_peishan','FRI'); ct('classmate_peishan'); rules(); check('R1. 沒傳過：8/7 沒有那則', !txt('p:classmate_peishan').includes('classmate_peishan:……這半年我都沒看手機。對不起。')&&G.flags.PS_BACK_READ===false);
  at('2027-08-20',20); const tp=MSG.topics(G,'classmate_peishan'); const r=tp.length?MSG.send(G,'classmate_peishan',tp[0].k):null; PHONE.tick(G); at('2027-08-21',12); PHONE.tick(G);
  check('R2. 放榜以後第一次傳訊息（8/20，她回台南以前；AA_349 K1）：「好久不見。……我現在在台中，開學以後在台南。」「你要來的話，跟我說。」', !!r&&r.ok&&txt('p:classmate_peishan').includes('classmate_peishan:好久不見。……我現在在台中，開學以後在台南。')&&!txt('p:classmate_peishan').includes('classmate_peishan:好久不見。……我現在在台南。')&&txt('p:classmate_peishan').includes('classmate_peishan:你要來的話，跟我說。')&&G.flags.PS_BACK_FIRST===D('2027-08-20'), JSON.stringify(txt('p:classmate_peishan')));
  // AA_349 K9：大三上第 6 週 10/15（五）21:00「我在學校附近的二手書店打工了。週末都在。」「……你不用特地來，我只是說一聲。」（已經重新聯絡上的玩家）
  at('2027-10-15',20.9); rules(); const k9a=txt('p:classmate_peishan').includes('classmate_peishan:我在學校附近的二手書店打工了。週末都在。'); at('2027-10-15',21.1); rules();
  check('R3. K9 重新聯絡上：10/15 21:00 兩則（20:54 還沒有）', !k9a&&mine('p:classmate_peishan','classmate_peishan:我在學校附近的二手書店打工了。週末都在。').slice(0,2).join('|')==='classmate_peishan:我在學校附近的二手書店打工了。週末都在。|classmate_peishan:……你不用特地來，我只是說一聲。', JSON.stringify(txt('p:classmate_peishan')));
  fresh('2027-10-15',21.1,'dorm'); R('classmate_peishan','FRI'); ct('classmate_peishan'); rules(); check('R3. K9 還沒重新聯絡上：沒有', !txt('p:classmate_peishan').some(t=>/二手書店打工了/.test(t)));
  fresh('2027-10-15',21.1,'dorm',{dating_classmate_peishan:true}); R('classmate_peishan','FRI'); ct('classmate_peishan'); rules(); check('R3. K9 交往中也有', txt('p:classmate_peishan').includes('classmate_peishan:我在學校附近的二手書店打工了。週末都在。'));

  // ---------- 接線 ----------
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), c=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
    check('接線：index.html 載入 y2b_events.js、y2b3d.js（在 GAME.boot 之前）', (()=>{ const a=h.indexOf('src/data/y2b_events.js'), b=h.indexOf('src/y2b3d.js'), z=h.indexOf('GAME.boot()'); return a>0&&b>a&&z>b&&/src\/data\/y2b_events\.js[^\n]*\n<script src="src\/y2b3d\.js/.test(h); })());   /* 後面還可以接別的事件包（1C group3d.js…），只要在 GAME.boot 之前 */
    check('接線：classes3d.js 課堂那一句之後問 IN_CLASS、社課先問 clubEvent', /for\(const f of S\.IN_CLASS\)\{ try\{ await f\(GM,it,prof,ct\);/.test(c)&&/e\.clubEvent===a\.id&&EVENTS\.check\(e,\{chain:true\}\)/.test(c)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
