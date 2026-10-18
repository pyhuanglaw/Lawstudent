// LIFE-LINE 第 6 組（AA_224 6-1～6-7 @31708531；機制 BB_188 A9-3）——不需要瀏覽器。
// 2/15 起在祐廷家的餐桌讀書（kxFreeAt 拿掉、她 10:00 到；R1 開頭「她第一次來你家」；S1、S2 改字）、RP 從 2/15；6/8 衝刺班的私訊＋6/9～7/9 一三五 19～22 點（「這次不去」、第一次三句旁白、
// 那幾晚可昕的訊息改到 22:10）；E35 在他家樓下（睡著 21:00 醒來）；E36 早上三句旁白（0.1）、晚上「只高 0.1。」「上了就是上了。」。改版前會失敗。用法：node tests/lifeline_g6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
(async()=>{
  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const econ=(day,hour,zone,flags,home)=>{ fresh(day,hour,zone,Object.assign({dating_kexin:true,Y0_DATING:true,KX_CAR:'only_me',LEAVE_WEEK:6,Y0_MOVED_OUT:true,CRAM_FREE_KNOWN:true,RETAKE_TOGETHER:true},flags||{})); G.stage='econ'; G.flags.LIFELINE_V=1; if(home!==false) G.home={at:true}; };
  const d15=DK('2025-02-15');
  check('6-1 重考期從 2/15 開始（2/14 還不是）；kxFreeAt 拿掉',(econ(d15,8,'home',{}),STORY.retakeOn(G))&&(econ(d15-1,8,'home',{}),!STORY.retakeOn(G))&&typeof STORY.kxFreeAt==='undefined');
  { econ(d15,7.5,'home',{}); picks=['在家讀書']; const r=await STORY.retakeWake(GM);
    check('6-2 起床選單：「在家讀書（可昕會來）」（不去博雅）、選了就留在家（RT_DAY study）',opts[0][0]==='在家讀書（可昕會來）'&&r==='study'&&G.flags.RT_DAY.type==='study'&&G.zone==='home',J([opts[0],r,G.zone]));
    G.hour=9.9; const a=EVENTS.check(ev('ev_y0_r1')); G.hour=10; const b=EVENTS.check(ev('ev_y0_r1'));
    check('6-2 R1 在家的選單那一輪（trigger home）、10:00 她到（9:59 還沒）',ev('ev_y0_r1').trigger==='home'&&!a&&b,J([a,b]));
    await EVENTS.run(ev('ev_y0_r1')); const L=lines();
    check('6-2 R1 開頭「（她搬來的第一天。你媽端了一盤水果出來，放下就回廚房了。）」、場景「祐廷家・餐桌」、台詞照用',L[0]==='（她搬來的第一天。你媽端了一盤水果出來，放下就回廚房了。）'&&L.includes('杜可昕：如果憲法是一間餐廳，第七條是什麼菜？')&&J(ev('ev_y0_r1').dialogue).includes('祐廷家・餐桌')&&!J(ev('ev_y0_r1').dialogue).includes('博雅'),J(L.slice(0,3))); }
  check('6-2 S1、S2 改字：「你又比我早起。……今天早餐我請。」「你讀到哪了？……三章？我才讀到第二章。」；不再有「我是去上課」「剛上完會計」',J(STORY.RS[0].t)===J(['「你又比我早起。……今天早餐我請。」'])&&STORY.RS[1].t[1]==='「你讀到哪了？……三章？我才讀到第二章。」'&&!J(ev('ev_y0_rs').dialogue).includes('去上課')&&!J(ev('ev_y0_rs').dialogue).includes('會計'));
  check('6-3 RP 最早 2/15',STORY.RP[0][0]==='2025-02-15');
  { econ(d15,7.5,'campus',{},false); G.home={at:false}; check('6-2 不在家的時候，讀書日的 R 不會在外面演',!EVENTS.check(ev('ev_y0_rs'))); }
  /* 衝刺班 */
  { const d8=DK('2025-06-08'); econ(d8,20.9,'home',{}); run(20.9,21.1);
    check('6-4 6/8 21:00（AA_272 第 7 節：兩個人一起去）：「衝刺班你報了沒。」「報了。兩個。明天七點。」「好。這次我付我自己的。」「不准幫我付。」',J(txt('p:kexin'))===J(['kexin:衝刺班你報了沒。','player:報了。兩個。明天七點。','kexin:好。這次我付我自己的。','kexin:不准幫我付。']),J(txt('p:kexin')));
    G.day=d8+1; G.weekday=wdOf(G.day); G.hour=9; run(9,9.1); const q=OUT.get(G,'y0_crm_'+G.day); G.day=d8+2; G.hour=9; run(9,9.1); const q2=OUT.get(G,'y0_crm_'+G.day);
    check('6-4 6/9（一）衝刺班 19:00～22:00 的出發選單、可以「這次不去」；6/10（二）沒有',q&&q.h===19&&q.no==='這次不去'&&q.ev==='ev_y0_cram_class'&&!q2,J([q,q2]));
    G.day=d8+1; await EVENTS.run(ev('ev_y0_cram_class')); const L=lines(); said=[]; await EVENTS.run(ev('ev_y0_cram_class')); const L2=lines();
    check('6-4 第一次：兩句旁白（你們、最後一排兩個位子；「半價」刪，AA_272 第 7 節）；之後不演',L.join('｜')==='（另一間補習班。一間坐滿的教室，沒有人認識你們。）｜（你們挑了最後一排，兩個位子。）'&&L2.length===0,J([L,L2]));
    check('6-4 衝刺班的晚上（一三五）＝cramNight；7/10 不是',STORY.cramNight(G,d8+1)&&STORY.cramNight(G,d8+3)&&!STORY.cramNight(G,d8+2)&&!STORY.cramNight(G,DK('2025-07-10'))); }
  /* E35 */
  { const d=DK('2025-07-10'); econ(d,17.9,'home',{}); run(17.9,18.2);
    check('6-5 7/10 18:00：沒有「今晚九點，我宿舍樓下。」、沒有女舍門口的出發選單',!txt('p:kexin').some(t=>t.includes('宿舍樓下'))&&!OUT.get(G,'y0_e35')&&G.flags.E35_ASKED===true);
    G.hour=20; check('6-5 睡著：coreCallAt 停在 21:00',STORY.coreCallAt(G)===21);
    G.hour=20.9; const a=EVENTS.check(ev('ev_y0_e35h')); G.hour=21; const b=EVENTS.check(ev('ev_y0_e35h')); picks=['海邊']; await EVENTS.run(ev('ev_y0_e35h')); const L=lines();
    check('6-5 21:00 在家：他家樓下「（你家樓下。她說想下來走一下。路燈。她手上拿著准考證，翻過來又翻回去。）」、E35_MET、沒有回家的移動（他已經在家）',!a&&b&&L[0]==='（你家樓下。她說想下來走一下。路燈。她手上拿著准考證，翻過來又翻回去。）'&&G.flags.E35_MET===true&&!ev('ev_y0_e35h').after,J([a,b,L[0]]));
    check('6-5 收尾（AA_272 第 10 節）：「五分鐘到了。上去吧。明天要早起。」＋「（她先轉身上樓。走到二樓，回頭等你。）」；沒有「我回去了」「巷口」',L.includes('杜可昕：五分鐘到了。上去吧。明天要早起。')&&L[L.length-1]==='（她先轉身上樓。走到二樓，回頭等你。）'&&!L.join('').includes('我回去了')&&!L.join('').includes('巷口'),J(L.slice(-2))); }
  /* AA_272 第 10 節（7975ffdf）：住在一起——收尾一起上樓；電話版拿掉；21:00 不在家＝「你在哪。我在樓下等你。」，24:00 以前回家就演，都沒回家＝不演 */
  { const d=DK('2025-07-10'); econ(d,20.9,'campus',{E35_ASKED:true},false); G.home={at:false}; run(20.9,21.1);
    const m=txt('p:kexin'); check('6-5 21:00 人在外面：她傳「你在哪。我在樓下等你。」；沒有電話版（E35_PHONE）、外面不演',m.includes('kexin:你在哪。我在樓下等你。')&&!G.flags.E35_PHONE&&!EVENTS.check(ev('ev_y0_e35')),J(m.slice(-2)));
    econ(d,23.5,'home',{E35_ASKED:true}); check('6-5 23:30 回到家：在家演（ev_y0_e35h）',EVENTS.check(ev('ev_y0_e35h')));
    econ(d+1,0.2,'home',{E35_ASKED:true}); check('6-5 24:00 以前都沒回家：隔天不演、E35_PLAN 不記',!EVENTS.check(ev('ev_y0_e35h'))&&!G.flags.E35_PLAN); }
  /* AA_272 第 11 節：考試的兩天（7/11 考場、7/12 晚上對答案），都不能快轉 */
  { const d11=DK('2025-07-11'), d12=DK('2025-07-12'); econ(d11,4.9,'home',{E35_DONE:true});
    const a=EVENTS.check(ev('ev_y0_exam1h')); G.hour=7; const b=EVENTS.check(ev('ev_y0_exam1h')), o=EVENTS.check(ev('ev_y0_exam1'));
    said=[]; await EVENTS.run(ev('ev_y0_exam1h')); const L=lines();
    check('11-1 7/11 早上在家：考場「（考場在一間高中……）」「（她坐在你前面。）」→「（回頭，小聲）……我手好冰。」「我也是。」「加油。」「加油。」→ 鐘響；在家不演外面那一個；沒有偷看、後腦勺',!a&&b&&!o&&L[0]==='（考場在一間高中。教室門口貼著座位表。）'&&L.includes('（她坐在你前面。）')&&L.includes('杜可昕：（回頭，小聲）……我手好冰。')&&L.includes('祐廷：我也是。')&&L.filter(x=>/：加油。$/.test(x)).length===2&&L[L.length-1]==='（鐘響。她轉回去，把筆放在准考證旁邊，排得很整齊。）'&&!L.join('').includes('偷看')&&!L.join('').includes('後腦勺'),J(L));
    check('11-1 演完跳到 7/12（六）19:00（字卡帶過兩天）、EXAM1_DONE',G.day===d12&&G.hour===19&&G.flags.EXAM1_DONE===true,J([G.day-d12,G.hour]));
    const c=EVENTS.check(ev('ev_y0_exam2')); said=[]; await EVENTS.run(ev('ev_y0_exam2')); const L2=lines();
    check('11-2 7/12 19:00 在家：對答案「（全對。）」「……你數學一百？」「好像是。」「我錯一題。」「……就一題。」「其他科明天再對。今天先這樣。」、MATH_100；沒有錯三題',c&&L2.includes('（全對。）')&&L2.includes('杜可昕：……你數學一百？')&&L2.includes('祐廷：好像是。')&&L2.includes('杜可昕：我錯一題。')&&L2[L2.length-1]==='杜可昕：其他科明天再對。今天先這樣。'&&G.flags.MATH_100===true&&!L2.join('').includes('三題'),J(L2));
    check('11 演過以後都不再演',!EVENTS.check(ev('ev_y0_exam1h'))&&!EVENTS.check(ev('ev_y0_exam1'))&&!EVENTS.check(ev('ev_y0_exam2')));
    econ(d11,9,'campus',{E35_DONE:true},false); G.home={at:false}; check('11-1 7/11 人不在家：外面那一個演（ev_y0_exam1）',EVENTS.check(ev('ev_y0_exam1'))&&!EVENTS.check(ev('ev_y0_exam2')));
    econ(DK('2025-07-10'),22,'home',{E35_DONE:true}); const fx=HOME.y0FixedNext(G,Tm(G.day,G.hour)); check('11 快轉不能跳過 7/11：從 7/10 22:00 快轉停在 7/11 06:30；行事曆有「分科測驗」',fx===Tm(d11,6.5)&&HOME.y0Cal(G,3).some(q=>q.t==='分科測驗'),J([fx-Tm(d11,0)]));
    econ(DK('2025-01-02'),10,'home',{}); const f3=HOME.y0FixedNext(G,Tm(G.day,G.hour)); econ(DK('2025-01-05'),10,'home',{}); const f6=HOME.y0FixedNext(G,Tm(G.day,G.hour));
    check('第 9 節 1/3、1/6 不能快轉：快轉停在 1/3 21:15、1/6 21:15（訊息收到以後）；行事曆不寫',f3===Tm(DK('2025-01-03'),21.25)&&f6===Tm(DK('2025-01-06'),21.25)&&!HOME.y0Cal(G,3).some(q=>!q.t),J([f3,f6])); }
  /* E36 */
  { const d=DK('2025-08-13'); econ(d,10,'home',{}); await EVENTS.run(ev('ev_y0_e36rh')); const L=lines();
    check('6-6 E36 早上三句：「（臺大法律學系，財經法學組。你的名字在上面。）」「（分數只比那一組的錄取分數高 0.1。）」',J(L)===J(['（八月十三日，早上十點。榜單公布了。）','（臺大法律學系，財經法學組。你的名字在上面。）','（分數只比那一組的錄取分數高 0.1。）']),J(L));
    const D=ev('ev_y0_e36').dialogue.map(x=>x.text); const i=D.indexOf('台大法律。恭喜你。真的。');
    check('6-6 E36 晚上的電話（AA_272 4-4）：「台大法律。恭喜你。真的。」→ 祐廷「只高 0.1。」→「上了就是上了。」→ KX_CAR；最後「月底我就上去了。……」',D[i+1]==='只高 0.1。'&&D[i+2]==='上了就是上了。'&&D[i+3]==='你那天說，你以為只有你。……我現在懂那個感覺了。'&&D.filter(Boolean).pop()==='月底我就上去了。到時候你帶我去政大，我還不知道怎麼走。'); }
  /* AA_272 4-1～4-3：7/24 21:00 邀約 → 7/25 客運版（一整天）／在家版（10:00 手機） */
  { const d24=DK('2025-07-24'), d25=DK('2025-07-25'); econ(d24,20.9,'home',{E35_DONE:true,EXAM2_DONE:true}); run(20.9,21.1);
    const q=(G.msgs||[]).find(x=>x.tag==='y0_kh_ask'&&x.ask); const K=txt('p:kexin');
    check('4-1 7/24 21:00：「明天公布成績。」「你要不要來高雄？我不想一個人查。」＋「好。我搭早上的客運。」／「我在家查就好。」',K.includes('kexin:明天公布成績。')&&!!q&&q.text==='你要不要來高雄？我不想一個人查。'&&J(q.ask.opts.map(o=>o.t))===J(['好。我搭早上的客運。','我在家查就好。']),J(K.slice(-2)));
    check('4-1 快轉停在 7/24 21:15',HOME.y0FixedNext(G,Tm(d24,20))===Tm(d24,21.25));
    const snap=JSON.stringify(G);
    PHONE.answer(G,'y0_kh_ask',0); check('4-1 選客運：KH_GO bus',G.flags.KH_GO==='bus');
    G.day=d25; G.hour=8.5; const bh=EVENTS.check(ev('ev_y0_kh_bus_h')), hh=EVENTS.check(ev('ev_y0_kh_home_h'));
    said=[]; picks=['先不要講分數','以後我們不在同一個學校']; await EVENTS.run(ev('ev_y0_kh_bus_h')); const L=lines();
    const iB=L.indexOf('（國道上。你已經坐了一個多小時。）'), iS=L.indexOf('杜可昕：你從下車到現在，都沒有看我。'), iM=L.indexOf('（她把一袋東西塞給你。是她家巷口的肉粽，還是熱的。）');
    check('4-2 7/25 早上在家：客運版（在家版不演）；「（國道上。……）」「（十點。成績公布了。）」…「（差了一大截。）」「（還有兩個小時。）」',bh&&!hh&&iB===0&&L.includes('（十點。成績公布了。）')&&L.includes('（差了一大截。）')&&L.includes('（還有兩個小時。）')&&G.flags.SCORE_REPLY==='later',J(L.slice(0,3)));
    check('4-3 客運站：「恭喜你。」…「你從下車到現在，都沒有看我。」→ 三選一（KH_FIGHT）→「……我知道我考不好。我不用你幫我難過。」「我先回家。你自己逛一下。」',iS>iB&&G.flags.KH_FIGHT==='school'&&L.includes('杜可昕：我先回家。你自己逛一下。')&&L.includes('（她走了。你在客運站外面站了很久。）'));
    const P=TH('p:kexin').map(m=>m.from+':'+m.text);
    check('4-3 18:30 的私訊收進手機：「你回臺北的車幾點。」→「九點。」→「我八點去車站。」；手機也有 10:00 那三則',P.includes('kexin:你回臺北的車幾點。')&&P.includes('player:九點。')&&P.includes('kexin:我八點去車站。')&&P.includes('kexin:查到了。'),J(P.slice(-4)));
    check('4-3 20:00 和好：「下午那樣，對不起。」…肉粽 →「車上吃。不要在車上難過。」→「（九點的客運開了。你在車上把肉粽吃完。）」、KH_MADEUP；演完 00:10 到家',iM>iS&&L.includes('杜可昕：車上吃。不要在車上難過。')&&L[L.length-1]==='（九點的客運開了。你在車上把肉粽吃完。）'&&G.flags.KH_MADEUP===true&&Math.abs(G.hour-(24+10/60))<1e-6,J([L.slice(-1),G.hour]));
    check('4 演過以後不再演（兩個版本都不演）',!EVENTS.check(ev('ev_y0_kh_bus_h'))&&!EVENTS.check(ev('ev_y0_kh_home_h')));
    G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); PHONE.answer(G,'y0_kh_ask',1); const K2=txt('p:kexin');
    check('4-1 選在家：她回「好。」、KH_GO home',K2[K2.length-1]==='kexin:好。'&&G.flags.KH_GO==='home');
    G.day=d25; G.hour=9.9; const h0=EVENTS.check(ev('ev_y0_kh_home_h')); G.hour=10; const h1=EVENTS.check(ev('ev_y0_kh_home_h'));
    said=[]; picks=['我的還好']; await EVENTS.run(ev('ev_y0_kh_home_h')); const L2=lines();
    check('4-2 在家版：10:00 才演；手機三則＋三選一＋「（差了一大截。）」；沒有客運的三句旁白；沒有客運站、和好',!h0&&h1&&L2.includes('（十點。成績公布了。）')&&L2.includes('（差了一大截。）')&&G.flags.SCORE_REPLY==='fine'&&!L2.some(t=>/國道|窗外是一片一片的田|還有兩個小時|客運站|肉粽/.test(t))&&!G.flags.KH_MADEUP,J(L2));
    check('4-2 在家版第三個選項「先不要講分數。晚上打給妳。」（AA-C 0cc64ec7）',J(opts[opts.length-1])===J(['「（傳截圖給她。）」','「我的還好。」','「先不要講分數。晚上打給妳。」']),J(opts[opts.length-1]));
    G.hour=20.9; const c0=EVENTS.check(ev('ev_y0_kh_call_h')); check('12 睡著：coreCallAt 停在 21:00',STORY.coreCallAt(G)===21); G.hour=21; const c1=EVENTS.check(ev('ev_y0_kh_call_h'));
    said=[]; picks=['沒有說話']; await EVENTS.run(ev('ev_y0_kh_call_h')); const L3=lines();
    check('12 在家版 21:00 電話：「（電話接通。她那邊很安靜。）」「……恭喜你。」…「你從接起來到現在，都只說「嗯」。」→ 三選一 →「我先掛了。」「（電話斷了。你看著手機很久。）」；沒有肉粽、客運',!c0&&c1&&L3[0]==='（電話接通。她那邊很安靜。）'&&L3.includes('杜可昕：你從接起來到現在，都只說「嗯」。')&&G.flags.KH_FIGHT==='silent'&&L3[L3.length-1]==='（電話斷了。你看著手機很久。）'&&!L3.some(t=>/肉粽|客運/.test(t)),J(L3));
    run(22.3,22.45); check('12 22:30 以前沒有私訊',!G.flags.KH_MADEUP); run(22.5,22.6); const K3=txt('p:kexin');
    check('12 22:30 私訊（沒有選項）：「剛剛那樣，對不起。」→「我也是。我不知道要講什麼。」…「早點睡。不要躺在床上難過。」、KH_MADEUP',J(K3.slice(-6))===J(['kexin:剛剛那樣，對不起。','player:我也是。我不知道要講什麼。','kexin:政大也是法律。四年以後，我們考同一個考試。','kexin:而且政大到臺大，捷運不用一個小時。比高雄近多了。','player:嗯。','kexin:早點睡。不要躺在床上難過。'])&&G.flags.KH_MADEUP===true,J(K3.slice(-6)));
    check('12 電話演過不再演',!EVENTS.check(ev('ev_y0_kh_call_h'))&&!EVENTS.check(ev('ev_y0_kh_call')));
    G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=d25; G.hour=10; check('4-1 7/24 沒回：在家版',EVENTS.check(ev('ev_y0_kh_home_h'))&&!EVENTS.check(ev('ev_y0_kh_bus_h'))); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
