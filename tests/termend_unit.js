// 學期末的飯：告白只在學期末（BB_203，使用者 2026-10-17；BB203-CONFESS-1017）——不需要瀏覽器。
// AA_363 S1（2026-10-21）：學姊大四上的邀約「期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。」（9f 兩項、16）——在開發分支 6a47ff46 上 3 項 FAIL，改完 PASS。
// 2026-10-28 AA_518 第 6 節改的（企劃線 0e21cccde，LAWWW-C）：第 16 項 FRIEND genByTerm 的值可以是函式（學姊大二上、大二下照 SIS15_YOUPAY 換句），比對時用沒有 YOUPAY 的玩家（{flags:{}}）解開；送邀約那一行多 resolve(…,G)。
// 2026-10-28 AA_518 第 4-10 改的（企劃線 973dd1b74，SIS-B15-1028）：第 16 項學姊大三上那一句「我在等美國那邊的結果。」換成「明年夏天，我申請了美國的交換。下個月面試。」（12 月還沒面試）。
// 檢查：時段；這學期常接觸的分數；保底阿凱；心意的邀約（答應線）、朋友的邀約、只能接一個；飯（開場、話題池、飯桌一句、收尾）；回家的路上（說出來、她說、讓我想想、下學期第二次）；學姊筆試前那一句；語彤 6/18 以後；女朋友的學期末約會；約會收尾不再告白；存讀檔。用法：node tests/termend_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|DATE|ROM|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|INVITE_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(id){ cgs.push(id); }}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
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
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  if(typeof TERMEND==='undefined'||typeof TERMEND_LINES==='undefined'){ console.log('FAIL 0. 沒有 TERMEND'); console.log('FAILED 1'); process.exit(1); }
  const W1=TERMEND.windowOf('Y1S1'), W2=TERMEND.windowOf('Y1S2');
  check('1. 期末飯時段：大一上 12/18～12/28、大一下 6/11～6/21（AA_250）',W1.from===D('2025-12-18')&&W1.to===D('2025-12-28')&&W2.from===D('2026-06-11')&&W2.to===D('2026-06-21'));
  fresh(D('2025-12-17'),12,'campus',{}); G.stage='law'; check('1. 12/17 不在時段；12/18 在',!TERMEND.window(G)&&(G.day=D('2025-12-18'),TERMEND.window(G)&&TERMEND.window(G).id==='Y1S1'));
  // 2. 這學期常接觸的分數
  fresh(D('2025-12-01'),12,'campus',{}); G.stage='law'; meet('classmate_xinci');
  SOCIAL.activity('classmate_xinci','chat'); SOCIAL.activity('classmate_xinci','chatNew'); SOCIAL.activity('classmate_xinci','meal');
  check('2. 閒聊 +1（同一天同一種只算一次）、一起吃飯 +2',TERMEND.score(G,'Y1S1','classmate_xinci')===3,String(TERMEND.score(G,'Y1S1','classmate_xinci')));
  G.day++; SOCIAL.activity('classmate_xinci','chat'); TERMEND.contact(G,'classmate_xinci','together'); check('2. 隔天又聊 +1、劇情事件一起在場 +2',TERMEND.score(G,'Y1S1','classmate_xinci')===6);
  // 3. 沒有人：保底阿凱
  fresh(D('2025-12-18'),9,'dorm',{}); G.stage='law';
  { const w=TERMEND.window(G), P=TERMEND.plan(G,w); check('3. 沒有心意、沒有朋友到門檻＝保底阿凱',P.fallback==='kai'&&!P.heart.length&&!P.friend.length,JSON.stringify(P)); }
  G.hour=19; check('3. 阿凱：20:00 以前不問',!TERMEND.kaiDue(G)); G.hour=20.5; check('3. 20:30 在房間＝問',TERMEND.kaiDue(G));
  { said=[]; picks=[0]; await TERMEND.kaiAsk(GM); const L=lines(); const R=G.termend.Y1S1;
    check('3. 阿凱「宵夜？」→ 好 → 公館宵夜（「我點不辣的。…」、話題池、收尾「這次我請。」AA_250 10-4 01029de1）',L[0]==='阿凱：宵夜？'&&L.some(t=>t.includes('我點不辣的。你要辣的自己加。'))&&L.some(t=>t.includes('寒假我留在臺北，接了一個修電腦的打工。'))&&L[L.length-1]==='阿凱：這次我請。'&&R.picked&&R.picked.who==='kai',JSON.stringify(L));
    check('3. 一學期只問一次',!TERMEND.kaiDue(G)); }
  { fresh(D('2025-12-20'),20.5,'dorm',{}); G.stage='law'; const w=TERMEND.window(G); TERMEND.plan(G,w);
    OUT.plan(G,{id:'y4_sis_pickup',ev:'ev_sis_pickup',day:G.day,h:20.75,late:0.25,place:'桃園機場入境大廳',title:'接機（學姊）',travel:'開車 約 50 分鐘',travelH:5/6,alarm:true});
    const a=TERMEND.kaiDue(G); G.day++; G.hour=20.5; const b=TERMEND.kaiDue(G);
    check('3. BUG-KAI-PICKUP-1022：那天晚上有別的出遊（20:45 接機）＝阿凱那晚不問（讓「出發」先問）；隔天晚上照問',!a&&b,JSON.stringify({a,b})); }
  // 4. 朋友的邀約＋心意的邀約；只能接一個
  fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('classmate_xinci'); meet('heroine_01'); R('classmate_xinci',25,0,0); R('heroine_01',70,50,45);
  G.termend={contact:{Y1S1:{classmate_xinci:{pts:7,k:{}},heroine_01:{pts:9,k:{}}}},think:{}};
  SOCIAL.rel('heroine_01').npcRom=29; DATE.log(G,'heroine_01').count=4; DATE.log(G,'heroine_01').wish=true;   /* 每個學期都一樣：她的戀愛 ≥ 30＋4 次含心願地點（使用者 2026-10-17，BB_203 303fe766）*/
  { const w=TERMEND.window(G); delete (G.termend.Y1S1||{}).plan; const P=TERMEND.plan(G,w); check('4. 以安的戀愛 29（30 減 1）＝沒有心意的邀約；她當朋友約',!P.heart.includes('heroine_01')&&P.friend.includes('heroine_01'),JSON.stringify(P)); }
  SOCIAL.rel('heroine_01').npcRom=30; G.termend.Y1S1={};
  { const w=TERMEND.window(G), P=TERMEND.plan(G,w); check('4. 她的戀愛 30＋4 次含心願地點＝心意的邀約（大一上也一樣）；芯慈（contact 7、FAMILIAR）朋友的邀約',P.heart.includes('heroine_01')&&P.friend.includes('classmate_xinci')&&!P.friend.includes('heroine_01'),JSON.stringify(P)); }
  run(20,21);
  { const a=(G.msgs||[]).find(m=>m.tag==='te_Y1S1_heroine_01'), b=(G.msgs||[]).find(m=>m.tag==='te_Y1S1_classmate_xinci');
    check('4. 20:30 以安「考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。」（AA_254）＋芯慈大一上那句（AA_250 10-2）',!!a&&a.text==='考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。'&&!!b&&b.text==='期末考完那天晚上有空嗎？我想吃一頓不用看筆記的飯。'&&JSON.stringify(a.ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天有約了。']),JSON.stringify([a&&a.text,b&&b.text]));
    PHONE.answer(G,'te_Y1S1_heroine_01',0); STORY.phoneRules(GM); PHONE.tick(G);
    const q=OUT.get(G,'te_Y1S1'); check('4. 接以安＝排出遊（12/20 19:00、學期末的飯）；芯慈自動婉拒（「好。那開學見。」）',!!q&&q.te.who==='heroine_01'&&q.te.kind==='heart'&&q.day===D('2025-12-20')&&q.h===19&&b.ans===1&&(G.msgs||[]).some(m=>m.from==='classmate_xinci'&&m.text==='好。那開學見。'),JSON.stringify(q)); }
  // 5. 飯 → 回家的路上：說出來＝交往
  { said=[]; picks=[0]; const q=OUT.get(G,'te_Y1S1'); await TERMEND.dinner(GM,q); const L=lines();
    check('5. 一對一的開場（簡餐，AA_250 10-1）、話題池兩句、飯桌一句、收尾',L.includes('（簡餐店的電視在播新聞。靠窗的兩人座。）')&&L.some(t=>t.includes('民總最後一題，我寫到時間到。'))&&L.some(t=>t.includes('我這學期很少出來吃飯。……今天是特地訂的。'))&&L.includes('（餐盤疊好，拿去回收。外面的路燈已經亮了。）'),JSON.stringify(L));
    check('5. 語彤：三選一照 AA_187 9-2、麵店打烊後的開場',TERMEND_LINES.HEART.heroine_03.optsFrom==='confess'&&TERMEND_LINES.HEART.heroine_03.place==='noodle_closed'&&TERMEND_LINES.PLACE.noodle_closed.open==='（鐵門拉下一半。店裡只開了長桌上那一盞燈。）');
    check('5. 回家的路上：研討室「我的手帳放在這裡。……白板還沒擦。」；選項＝以安的三句＋（先不說）',L.some(t=>t.includes('我的手帳放在這裡。……白板還沒擦。'))&&opts[opts.length-1].length===4&&opts[opts.length-1][3]==='（先不說）',JSON.stringify(opts[opts.length-1]));
    check('5. 說出來＝她答應（confess_lines；旁白是旁白）＋交往（dating_heroine_01）',L.some(t=>t.includes('好。我們在一起。'))&&L.includes('（她翻開手帳，翻到後面某一頁，又闔起來。）')&&G.flags.dating_heroine_01===true,JSON.stringify(L.slice(-4))); }
  // 6. 先不說＝她說 → 讓我想想 → 下學期第二次
  fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',70,50,45); SOCIAL.rel('heroine_04').npcRom=35; DATE.log(G,'heroine_04').count=4; DATE.log(G,'heroine_04').wish=true;
  { const w=TERMEND.window(G), P=TERMEND.plan(G,w); run(20,21); const a=(G.msgs||[]).filter(m=>m.th==='p:heroine_04').map(m=>m.text);
    check('6. 子晴的心意邀約兩則「欸 考完了 宵夜」「只有我們兩個 不要找阿凱」',JSON.stringify(a)===JSON.stringify(['欸 考完了 宵夜','只有我們兩個 不要找阿凱']),JSON.stringify(a));
    PHONE.answer(G,'te_Y1S1_heroine_04',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S1');
    said=[]; picks=[3,1]; await TERMEND.dinner(GM,q); const L=lines();
    check('6. 飯桌一句：沒看過 Q6＝「我這學期寫了很多東西。……」',L.some(t=>t.includes('我這學期寫了很多東西。……還沒給任何人看。'))&&!L.some(t=>t.includes('關卡')));
    check('6. 先不說＝她說（「我喜歡你。講完了。」）→ 讓我想想（「想太久我會跑掉喔。」）；沒有交往、記讓我想想',L.some(t=>t.includes('我喜歡你。講完了。'))&&L.some(t=>t.includes('……好啦。那你想。想太久我會跑掉喔。'))&&!G.flags.dating_heroine_04&&G.termend.think.heroine_04==='Y1S1'); }
  G.day=D('2026-06-11'); G.weekday=wdOf(G.day); G.hour=20; G.msgs=(G.msgs||[]).filter(m=>!/^te_/.test(m.tag||''));
  { run(20,21); const a=(G.msgs||[]).filter(m=>m.tag==='te_Y1S2_heroine_04'||(m.th==='p:heroine_04'&&m.day===D('2026-06-11'))).map(m=>m.text);
    check('6. 下學期：第二次的邀約「考完了吧 宵夜」「上次那個 你想好沒」',a.includes('考完了吧 宵夜')&&a.includes('上次那個 你想好沒'),JSON.stringify(a));
    PHONE.answer(G,'te_Y1S2_heroine_04',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S2'); said=[]; picks=[3,0]; await TERMEND.dinner(GM,q); const L=lines();
    check('6. 第二次她說的後半「我上次講的，沒有收回。……換你。」→ 好＝交往',L.some(t=>t.includes('我上次講的，沒有收回。……換你。'))&&G.flags.dating_heroine_04===true&&G.termend.think.heroine_04==null); }
  const hookFor0=TERMEND.hookFor; TERMEND.hookFor=()=>null;   /* 6b：不讓假期鉤子吃掉選項 */
  // 6b. 第二次玩家先說＝yes2（AA_254 第 0 節第 7 點）；第一次先說的以安有 CG-11 的位置
  fresh(D('2026-06-11'),20,'campus',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',70,50,45); SOCIAL.rel('heroine_04').npcRom=35; DATE.log(G,'heroine_04').count=4; DATE.log(G,'heroine_04').wish=true; G.termend={think:{heroine_04:'Y1S1'}};
  { run(20,21); PHONE.answer(G,'te_Y1S2_heroine_04',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S2'); said=[]; picks=[0]; await TERMEND.dinner(GM,q); const L=lines();
    check('6b. 第二次、玩家選說出來：子晴「欸……你先講了喔」「好啦。」→ 交往',L.some(t=>t.endsWith('欸……你先講了喔'))&&L.some(t=>t.endsWith('好啦。'))&&G.flags.dating_heroine_04===true&&G.termend.think.heroine_04==null,JSON.stringify(L.slice(-4))); }
  fresh(D('2025-12-18'),20,'campus',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',70,50,45); SOCIAL.rel('heroine_01').npcRom=40; DATE.log(G,'heroine_01').count=4; DATE.log(G,'heroine_01').wish=true;
  { run(20,21); PHONE.answer(G,'te_Y1S1_heroine_01',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S1'); cgs=[]; said=[]; picks=[3,0]; await TERMEND.dinner(GM,q); const L=lines();
    check('6b. 以安她說：坐回來、手帳舉到下巴前面；CG-11 在那一刻（cg_reason_column_heroine01）',L.includes('（她坐回你對面，翻開手帳，舉到下巴前面。只露出眼睛。）')&&JSON.stringify(cgs)===JSON.stringify(['cg_reason_column_heroine01'])&&L.some(t=>t.endsWith('理由我會補完。……你先回答。')),JSON.stringify(L.slice(-8))); }
  fresh(D('2025-12-18'),20,'campus',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',70,50,45); SOCIAL.rel('heroine_01').npcRom=40; DATE.log(G,'heroine_01').count=4; DATE.log(G,'heroine_01').wish=true;
  { run(20,21); PHONE.answer(G,'te_Y1S1_heroine_01',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S1'); cgs=[]; said=[]; picks=[0]; await TERMEND.dinner(GM,q);
    check('6b. 以安玩家先說：CG-11 放在她答應那一句（AA-C 16:5x）',JSON.stringify(cgs)===JSON.stringify(['cg_reason_column_heroine01'])&&G.flags.dating_heroine_01===true); }
  fresh(D('2026-06-11'),20,'campus',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',70,50,45); SOCIAL.rel('heroine_01').npcRom=40; DATE.log(G,'heroine_01').count=4; DATE.log(G,'heroine_01').wish=true; G.termend={think:{heroine_01:'Y1S1'}};
  { run(20,21); PHONE.answer(G,'te_Y1S2_heroine_01',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y1S2'); cgs=[]; said=[]; picks=[3,0]; await TERMEND.dinner(GM,q); const L=lines();
    check('6b. 以安第二次：她說的後半「上次寫的那一行還在。我把後面寫完了。……你要看嗎？」、不放 CG',L.some(t=>t.endsWith('上次寫的那一行還在。我把後面寫完了。……你要看嗎？'))&&!cgs.length,JSON.stringify(L.slice(-6))); }
  TERMEND.hookFor=hookFor0;
  // 7b. 不發心意邀約的手機一句：時段最後一天 20:00（BB_203 5-4）；C5 她自己有交往對象（沛珊大一下和柏翰）；玩家已經約她吃過＝不傳
  fresh(D('2026-06-11'),12,'campus',{}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',70,50,45); SOCIAL.rel('classmate_peishan').npcRom=40; DATE.log(G,'classmate_peishan').count=4; DATE.log(G,'classmate_peishan').wish=true;
  { const w=TERMEND.windowOf('Y1S2'); G.day=w.from; G.weekday=wdOf(G.day); run(0.1,23.5,0.25); check('7b. 沛珊大一下（和柏翰交往中＝C5）：時段第一天不傳、不發心意邀約',!(G.msgs||[]).some(x=>/^te_(nope_)?Y1S2_classmate_peishan/.test(x.tag||'')));
    G.day=w.to; G.weekday=wdOf(G.day); run(19.8,20.2); const m=(G.msgs||[]).find(x=>x.tag==='te_nope_Y1S2_classmate_peishan');
    check('7b. 最後一天 20:00 傳 C5 那一句「期末考完了！這次我有約了……下次再問你問題喔。」',!!m&&m.text==='期末考完了！這次我有約了……下次再問你問題喔。'&&m.h===20,JSON.stringify(m)); }
  fresh(D('2026-06-11'),12,'campus',{}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',70,50,45); SOCIAL.rel('classmate_peishan').npcRom=40; DATE.log(G,'classmate_peishan').count=4; DATE.log(G,'classmate_peishan').wish=true;
  { const w=TERMEND.windowOf('Y1S2'); G.day=w.from; G.weekday=wdOf(G.day); run(0.1,1); TERMEND.rec(G,'Y1S2').picked={who:'classmate_peishan',kind:'friend',day:G.day,by:'player'}; G.day=w.to; G.weekday=wdOf(G.day); run(19.8,20.2);
    check('7b. 這學期玩家已經自己約她吃過期末飯：不傳',!(G.msgs||[]).some(x=>x.tag==='te_nope_Y1S2_classmate_peishan')); }
  // 7. 學姊：筆試前不發心意邀約，傳那一句；語彤大一下 6/19 以後的週四
  fresh(D('2025-12-18'),19.9,'campus',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',45,30,20); SOCIAL.rel('heroine_05').npcRom=40; DATE.log(G,'heroine_05').count=4; DATE.log(G,'heroine_05').wish=true;
  { run(19.9,20.2); const w=TERMEND.window(G); G.day=w.to; G.weekday=wdOf(G.day); run(19.9,20.2); check('7. 學姊筆試前：不發心意邀約，也不傳手機一句（5-3 第一欄，AA_254 第 9 節 8c76052b 刪了那一句）',!(G.msgs||[]).some(x=>/^te_(nope_)?Y1S1_heroine_05/.test(x.tag||''))); }
  fresh(D('2026-06-11'),12,'campus',{}); G.stage='law';
  { const d=TERMEND.dinnerDay(G,TERMEND.windowOf('Y1S2'),TERMEND_LINES.HEART.heroine_03,'heroine_03'); check('7. 語彤大一下：6/18 筆試以後的週四（6/25 超出時段＝那就 6/19 以後的第一天）',d!=null&&d>=D('2026-06-19')&&d<=D('2026-06-21'),String(d-D('2026-06-19'))); }
  // 8. 交往中的女朋友：另外的學期末約會，不佔名額
  fresh(D('2025-12-18'),20,'campus',{dating_heroine_02:true}); G.stage='law';
  { run(20,21); const m0=(G.msgs||[]).find(x=>x.tag==='te_gf_Y1S1_heroine_02'), dd=((G.termend.Y1S1||{}).gfDay||{}).heroine_02;
    if(dd!=null&&dd>=0){ G.day=dd; G.weekday=wdOf(dd); run(11.8,12.1); } const m=(G.msgs||[]).find(x=>x.tag==='te_gf_Y1S1_heroine_02');
    check('8. 芷若（交往中）：先排好那一天（週五），當天 12:00 才傳「禮拜五十點，等我下班。」、回覆期限當天 17:30（AA_378 #3；AA_373 第 6 節第 9 題：大一上～大二上她晚班到 22:00，「九點」改「十點」）',!m0&&dd!=null&&dd>=0&&CALENDAR.dateOf(dd).wd%7===5&&!!m&&m.day===dd&&Math.abs(m.h-12)<1e-6&&m.text==='禮拜五十點，等我下班。'&&!!m.ask&&m.ask.until===dd*24+17.5,JSON.stringify([!!m0,dd,m&&[m.day,m.h,m.ask&&m.ask.until]]));
    PHONE.answer(G,'te_gf_Y1S1_heroine_02',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_gf_Y1S1_heroine_02'); check('8. 接了＝排在那一天（週五）22:00（她下班以後；不佔只能接一個）',!!q&&q.te.kind==='gf'&&q.day===dd&&q.h===22&&!G.termend.Y1S1.picked,JSON.stringify(q)); }
  // 9. 約會收尾不再有告白
  { fresh(D('2025-11-01'),18,'campus',{}); const r=await DATE.confessOffer(GM,{who:'heroine_01'}); check('9. 正式約會的收尾不再有告白（DATE.confessOffer＝false）',r===false&&!opts.length); }
  // 9b. 使用者 2026-10-17 改（BB_203 303fe766）：每個學期都一樣＝她的戀愛 ≥ 30＋4 次正式約會含心願地點＋她當時願意；第 6 階、答應線、祐廷的戀愛、大一上的例外都不用了
  { fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('heroine_01'); const r=SOCIAL.rel('heroine_01'); Object.assign(r,{fam:45,trust:30,comf:20,npcRom:30,rom:0}); const L=DATE.log(G,'heroine_01'); L.count=4; L.wish=true;
    const W=TERMEND.windowOf('Y1S1'), P=()=>{ TERMEND.rec(G).Y1S1={}; return TERMEND.plan(G,W).heart.includes('heroine_01'); };
    const ok=P(); r.npcRom=29; const lo=P(); r.npcRom=30; L.count=2; L.wish=false; const two=P(); L.count=4; const nw=P(); L.wish=true; L.count=3; const c3=P(); L.count=4;
    check('9b. 大一上：以安第 5 階、戀愛 30、祐廷 0、4 次含心願地點＝心意的邀約；戀愛 29＝沒有；2 次沒心願地點（舊的大一上例外）＝沒有；4 次沒心願地點、3 次含心願地點＝沒有',DATE.stageNum('heroine_01')===5&&ok&&!lo&&!two&&!nw&&!c3,JSON.stringify([ok,lo,two,nw,c3]));
    G.day=D('2026-06-11'); const P2=TERMEND.plan(G,TERMEND.windowOf('Y1S2')); check('9b. 大一下同一套（戀愛 30、4 次含心願地點）',P2.heart.includes('heroine_01'),JSON.stringify(P2.heart)); }
  check('9c. 校園單獨約出來：第 3 階起她的戀愛 +1、祐廷的戀愛 +1（一天一次，AA_243 第 1 節）',/DATE\.stageNum\(iv\.who\)>=3&&iv\.who!=='kexin'\)\{ const DY=G\.daily\|\|\(G\.daily=\{\}\), k='romAlone_'\+iv\.who; if\(DY\[k\]!==G\.day\)\{ DY\[k\]=G\.day; SOCIAL\.adjust\(iv\.who,\{npcRom:1,rom:1\}\)/.test(fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8')));
  // 9d. 大二以後的話題池、這段期間不在的人
  { check('9d. 大二上～大四上的話題池都在（AA_250 第 3～7 節）；大二下阿哲改「Alison 七月在營隊，我回高雄也沒事做。」（01029de1）',['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'].every(k=>TERMEND_LINES.POOL[k]&&Object.keys(TERMEND_LINES.POOL[k]).length>=6)&&TERMEND_LINES.POOL.Y2S2.zhe.includes('Alison 七月在營隊，我回高雄也沒事做。'));
    fresh(D('2026-12-24'),9,'campus',{}); G.stage='law'; meet('classmate_peishan'); R('classmate_peishan',30,0,0); G.termend={contact:{Y2S1:{classmate_peishan:{pts:9,k:{}}}},think:{}};
    const P=TERMEND.plan(G,TERMEND.windowOf('Y2S1')); check('9d. 大二上：沛珊（說要重考以後）不當朋友的邀約人',!P.friend.includes('classmate_peishan'),JSON.stringify(P)); }
  // 9e. 可昕的學期末約會（BB_202 第 6 節、AA_250 9-2 ae841bba）
  { fresh(D('2026-06-11'),20.5,'dorm',{dating_kexin:true}); G.stage='law'; run(20.5,21);
    const m=txt('p:kexin'), q=OUT.get(G,'te_kx_Y1S2');
    check('9e. 大一下：20:45 可昕「期末考完了吧」「禮拜五 河堤 五點半」「我帶你去吃那家」→ 6/12（五）17:30 河堤（不佔名額）',m.join('|').includes('kexin:禮拜五 河堤 五點半')&&!!q&&q.day===D('2026-06-12')&&q.h===17.5&&q.te.kind==='kexin'&&!G.termend.Y1S2.picked,JSON.stringify([m,q]));
    said=[]; picks=[0]; await TERMEND.dinner(GM,q); const L=lines();
    check('9e. 河堤開場 → BB_167 4-3「（坐下）一年了欸。」→ 收尾「（她站在你的車門邊。『到家傳訊息。』）」；記 KX_TERMEND',L.includes('（河堤的步道，她走在靠水的那一邊。）')&&L.some(t=>t.includes('一年了欸。'))&&L.includes('（她站在你的車門邊。『到家傳訊息。』）')&&G.flags.KX_TERMEND&&G.flags.KX_TERMEND.Y1S2,JSON.stringify(L.slice(0,4)));
    fresh(D('2026-12-24'),20.9,'dorm',{dating_kexin:true}); G.stage='law'; run(20.9,21); const q2=OUT.get(G,'te_kx_Y2S1');
    check('9e. 大二上：政大正門 18:00、時段第三天（12/26）',!!q2&&q2.h===18&&q2.day===D('2026-12-26')&&q2.place==='政大正門',JSON.stringify(q2));
    said=[]; await TERMEND.dinner(GM,q2); const L2=lines(); check('9e. 大二上飯桌「我們期末考完，你寒假來高雄。」（AA_313 第 38 列、AA_325 2-Y2-10）',L2.some(t=>t.includes('我們期末考完，你寒假來高雄。'))&&L2.some(t=>t.includes('我家附近那個夜市，你還沒去過。'))&&L2.includes('（她送你到停車場，站著等你倒車出去。）'));
    TERMEND.missed(GM,q2); PHONE.tick(G); G.hour=23; PHONE.tick(G); check('9e. 沒去：「我在正門等了一下」「你還好嗎」',txt('p:kexin').includes('kexin:我在正門等了一下')&&txt('p:kexin').includes('kexin:你還好嗎'));
    fresh(D('2026-06-11'),20.9,'dorm',{dating_kexin:true}); G.stage='law'; G.events.done.ev_revisit_y1_kexin=1; run(20.9,21); check('9e. 舊存檔演過重訪日＝大一下不再約',!OUT.get(G,'te_kx_Y1S2')); }
  // 9g. BUG-SIS-Y4S1-DATEINV-1021：交往中的學姊，大四上女朋友的學期末約會也是 12/24 起才約（原本 12/21 20:15 她還在美國就約）
  { fresh(D('2028-12-21'),20,'campus',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',70,60,50); G.flags.dating_heroine_05=true; G.termend={contact:{Y4S1:{}},think:{}};
    run(20,21); const a=PHONE.sent(G,'te_gf_Y4S1_heroine_05'); G.day=D('2028-12-24'); run(11.8,12.1); const m=(G.msgs||[]).find(x=>x.tag==='te_gf_Y4S1_heroine_05');
    check('9g. 交往中的學姊大四上：12/21 不約；12/24 起才排（她 12/23 回國；修改前 12/21 就約）——當天 12:00 傳（AA_378 #3）',!a&&!!m&&m.day===D('2028-12-24')&&Math.abs(m.h-12)<1e-6,JSON.stringify([a,m&&[m.day,m.h]])); }
  // 9f. 學姊大四上 12/24 起才約（美國 8/2～12/23）
  { fresh(D('2028-12-21'),20,'campus',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',30,0,0); G.termend={contact:{Y4S1:{heroine_05:{pts:9,k:{}}}},think:{}};
    run(20,21); const a=PHONE.sent(G,'te_Y4S1_heroine_05'); G.day=D('2028-12-24'); run(20,21);
    check('9f. 學姊大四上：12/21 不約、12/24 20:30 起約；句子是 AA_363 S1「期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。」（她 12/23 回來；修改前是 gen「……我請你。」）',!a&&PHONE.sent(G,'te_Y4S1_heroine_05')&&txt('p:heroine_05').includes('heroine_05:期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。')&&!txt('p:heroine_05').includes('heroine_05:期末考完了嗎？法圖旁邊那家，我請你。'),JSON.stringify(txt('p:heroine_05')));
    { const m=(G.msgs||[]).find(x=>x.tag==='te_Y4S1_heroine_05'); fresh(D('2028-12-26'),20,'campus',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',30,0,0); G.termend={contact:{Y4S1:{heroine_05:{pts:9,k:{}}}},think:{}}; run(20,21); const m2=(G.msgs||[]).find(x=>x.tag==='te_Y4S1_heroine_05');
      check('9f. 「我昨天回來的」的那一則一定記在 12/24（她回來的隔天）：12/26 才跑到也照 12/24 20:30 補進手機',!!m&&m.day===D('2028-12-24')&&!!m2&&m2.day===D('2028-12-24')&&m2.text==='期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。',JSON.stringify([m&&[m.day,m.h],m2&&[m2.day,m2.h,m2.text]])); } }
  // 9g. 不在台灣的人不約（AA_259 第 4 節第 5 點）：芷若大三上、大四上（英國）、以安大三下（日本）；交往中的芷若在英國也不發女朋友的期末約會
  { const W3=TERMEND.windowOf('Y3S1'), W4=TERMEND.windowOf('Y4S1'), W32=TERMEND.windowOf('Y3S2');
    fresh(W3.from,9,'campus',{}); G.stage='law';
    check('9g. 芷若大三上、大四上不在；以安大三下不在；以安大三上、芷若大三下在',TERMEND.away(G,W3,'heroine_02')&&TERMEND.away(G,W4,'heroine_02')&&TERMEND.away(G,W32,'heroine_01')&&!TERMEND.away(G,W3,'heroine_01')&&!TERMEND.away(G,W32,'heroine_02'));
    meet('heroine_02'); const r=SOCIAL.rel('heroine_02'); Object.assign(r,{fam:60,trust:45,comf:40,npcRom:60}); const L=DATE.log(G,'heroine_02'); L.count=4; L.wish=true; G.termend={contact:{Y3S1:{heroine_02:{pts:12,k:{}}}},think:{}};
    const P=TERMEND.plan(G,W3); G.flags.dating_heroine_02=true; G.termend.Y3S1={}; const Pg=TERMEND.plan(G,W3);
    check('9g. 芷若大三上：條件到齊也沒有心意、朋友的邀約；交往中也沒有女朋友的期末約會',!P.heart.includes('heroine_02')&&!P.friend.includes('heroine_02')&&!Pg.gf.includes('heroine_02'),JSON.stringify([P,Pg])); }
  // 9h. 她知道祐廷在和別人交往（BB_203 5-3 第三欄、BB_194 §6；BB-C 12:43）：一般條件＋表；有 OPEN_OK 的不算知情
  { const W=TERMEND.windowOf('Y1S2'); fresh(W.from,9,'campus',{}); G.stage='law'; meet('heroine_04'); meet('heroine_01');
    if(ROM.start) ROM.start(G,'heroine_02'); else G.flags.dating_heroine_02=true; ROM.learn(G,'heroine_04','heroine_02','test'); ROM.learn(G,'heroine_01','heroine_02','test');
    for(const id of ['heroine_04','heroine_01']){ Object.assign(SOCIAL.rel(id),{fam:50,trust:30,comf:20,npcRom:40}); const L=DATE.log(G,id); L.count=4; L.wish=true; }
    const P=()=>{ TERMEND.rec(G).Y1S2={}; return TERMEND.plan(G,W); };
    const a=P(); G.flags.YT_HONEST={heroine_04:true,heroine_01:true}; const b=P(); G.flags.YT_DODGED={heroine_04:true}; const c=P(); delete G.flags.YT_DODGED;
    SOCIAL.rel('heroine_01').npcRom=76; const d=P(); SOCIAL.rel('heroine_01').npcRom=77; const e=P();
    G.flags.YT_HONEST={}; G.flags.OPEN_OK={heroine_04:{heroine_02:true}}; const f=P();
    check('9h. 子晴知情：沒照實說＝不發（只傳那一句）；照實說＝發；閃躲過＝不發',!a.heart.includes('heroine_04')&&a.nope.heroine_04==='knows'&&b.heart.includes('heroine_04')&&!c.heart.includes('heroine_04'),JSON.stringify([a,b,c].map(x=>[x.heart,x.nope])));
    check('9h. 以安知情：照實說＋戀愛 76＝不發、77＝發',!d.heart.includes('heroine_01')&&e.heart.includes('heroine_01'),JSON.stringify([d.heart,e.heart]));
    check('9h. 子晴有 OPEN_OK（同意過）＝不算知情、照一般條件發',f.heart.includes('heroine_04'),JSON.stringify(f.heart)); }
  // 9i. 玩家人在國外（AA_250 第 6、7 節、AA_260 第 4 節第 6 點）：日本路線大三下整段在日本＝臺灣什麼都不發；美國路線大四上 12/23 回來＝那天起才發
  { const W=TERMEND.windowOf('Y3S2'); fresh(W.from,9,'campus',{EXCHANGE_ROUTE:'JP'}); G.stage='law'; meet('classmate_xinci'); R('classmate_xinci',30,10,5); G.termend={contact:{Y3S2:{classmate_xinci:{pts:9,k:{}}}},think:{}};
    const P=TERMEND.plan(G,W); run(20,21); G.hour=20.5;
    check('9i. 日本路線大三下：plan.abroad、沒有任何邀約、阿凱也不問',P.abroad&&!P.friend.length&&!P.fallback&&!(G.msgs||[]).some(m=>/^te_/.test(m.tag||''))&&(G.zone='dorm',!TERMEND.kaiDue(G)),JSON.stringify(P));
    const W4=TERMEND.windowOf('Y4S1'); fresh(W4.from,9,'campus',{EXCHANGE_ROUTE:'US'}); G.stage='law'; meet('classmate_xinci'); R('classmate_xinci',30,10,5); G.termend={contact:{Y4S1:{classmate_xinci:{pts:9,k:{}}}},think:{}};
    const P4=TERMEND.plan(G,W4), back=D('2028-12-24'); run(20,21);
    const early=(G.msgs||[]).some(m=>m.tag==='te_Y4S1_classmate_xinci'); G.day=back-1; run(20,21); const e23=(G.msgs||[]).some(m=>m.tag==='te_Y4S1_classmate_xinci'); G.day=back; run(20,21); const m=(G.msgs||[]).find(x=>x.tag==='te_Y4S1_classmate_xinci');
    check('9i. 美國路線大四上：回國的隔天（12/24）20:30 起才約（AA_378 #12：12/23 回國那晚只有阿凱的私訊）；時段第一天、12/23 都沒有',!P4.abroad&&P4.back===back&&!early&&!e23&&!!m&&m.day===back,JSON.stringify([P4.back,back,early,e23,m&&m.day])); }
  // 11. 邀約鉤子（AA_250 x-2、10-1）＋C14／C15（AA_251）；不接、傳日子、沒去的照片照 AA_270（caeaf97f、bb21282f）
  { const TL=TERMEND_LINES; fresh(D('2025-12-19'),19,'campus',{}); G.stage='law'; meet('classmate_xinci'); meet('heroine_01');
    check('11. 不接＝「（笑了一下，沒有接話。）」（AA_270 第 1 節）；芯慈大一上有鉤子',TL.HOOK_NO==='（笑了一下，沒有接話。）'&&!!TERMEND.hookFor(G,'Y1S1','classmate_xinci'));
    {
      said=[]; opts=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'classmate_xinci',kind:'friend',term:'Y1S1'}}); const L=lines();
      const ci=L.findIndex(t=>t.includes('寒假我爸那邊……要不要一起去事務所看看？只是看。')), cl=L.findIndex(t=>t.includes('（餐盤疊好，拿去回收。外面的路燈已經亮了。）'));
      check('11. 芯慈的期末飯：話題之後、收尾之前說鉤子；選項「「好。」」／不接',ci>0&&cl>ci&&JSON.stringify(opts[opts.length-1])===JSON.stringify(['「好。」','（笑了一下，沒有接話。）']),JSON.stringify([L,opts]));
      const q=OUT.get(G,'c14_Y1S1'), d=TERMEND.c14Day('Y1S1'), x=CALENDAR.dateOf(d);
      { const d0=G.day, h0=G.hour; G.day=d0+1; G.hour=21.1; PHONE.tick(G); const mm=(G.msgs||[]).filter(m=>m.from==='classmate_xinci'&&m.day===d0+1).map(m=>m.text); G.day=d0; G.hour=h0;
      check('11. 接了＝C14 事務所參觀：寒假第三週的週三 10:00；隔天 21:00 芯慈傳日子（{日期}換成 1/7（三）那種）',!!q&&q.day===d&&q.h===10&&x.wd%7===3&&!CALENDAR.termOf(d)&&JSON.stringify(mm)===JSON.stringify([x.m+'/'+x.d+'（三）早上十點，我爸說可以。','穿平常的衣服就好，他們不看。']),JSON.stringify([q,x,mm]));}
      said=[]; picks=[0]; await TERMEND.dayOuting(GM,q); const L2=lines();
      check('11. C14 那天：電梯門打開、芯慈「這是我爸。」、芯慈爸爸問「你們法律系現在都教什麼？」（還沒旁聽過開庭＝只有一個回答）、白板、「我以前來這裡，都只坐櫃台。」；記 C14_VISITED',L2.includes('（事務所在一棟舊大樓的七樓。電梯門打開，正對著一排深色的檔案櫃。）')&&L2.some(t=>t==='芯慈爸爸：你們法律系現在都教什麼？')&&L2.some(t=>t.endsWith('考試沒變。'))&&L2.some(t=>t.includes('都只坐櫃台'))&&G.flags.C14_VISITED===G.day,JSON.stringify(L2));
      { const find=(o,out=[])=>{ if(Array.isArray(o)) o.forEach(x=>find(x,out)); else if(o&&typeof o==='object'){ if(o.t==='「我去法院旁聽過一場開庭。」') out.push(o); for(const k in o) find(o[k],out); } return out; }, op=find(TERMEND_LINES)[0];
        check('11. C14 第二個回答（AA_344 ①）：演過大三上刑訴的法院旁聽（ev_crimpro_court_visit）才出現「我去法院旁聽過一場開庭。」；原本讀的 COURT_VISITED 沒有地方設', !!op&&typeof op.if==='function'&&op.if({flags:{},events:{done:{ev_crimpro_court_visit:1}}})===true&&op.if({flags:{COURT_VISITED:true},events:{done:{}}})===false); }
      TERMEND.dayMissed(GM,q); said=[]; const a1=await TERMEND.meetLine(GM,{name:'芯慈'},'classmate_xinci'), a2=await TERMEND.meetLine(GM,{name:'芯慈'},'classmate_xinci');
      check('11. 沒去：芯慈下次見面一句「我自己去了。我爸問你怎麼沒來。」（只一次）',a1&&!a2&&lines().some(t=>t.includes('我自己去了。我爸問你怎麼沒來。')),JSON.stringify(lines()));
      fresh(D('2026-06-11'),19,'campus',{}); G.stage='law'; meet('heroine_01'); said=[]; opts=[]; picks=[1]; await TERMEND.dinner(GM,{te:{who:'heroine_01',kind:'friend',term:'Y1S2'}});
      check('11. 不接：不報名、記 hook ok:false',!VAC.enrolled(G,'C03','Y1')&&G.termend.Y1S2.hook&&G.termend.Y1S2.hook.ok===false,JSON.stringify(G.termend.Y1S2.hook));
      fresh(D('2026-06-11'),19,'campus',{}); G.stage='law'; meet('heroine_01'); said=[]; opts=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'heroine_01',kind:'friend',term:'Y1S2'}});
      check('11. 以安大一下「暑假我要上日語課。」→「我也想報。」＝直接報名 C03（大一暑假日語課）',lines().some(t=>t.includes('暑假我要上日語課。'))&&VAC.enrolled(G,'C03','Y1'));
      fresh(D('2026-06-12'),19,'campus',{}); G.stage='law'; meet('yu'); said=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'yu',kind:'friend',term:'Y1S2'}});
      const q5=OUT.get(G,'c15_yu_camp'); check('11. Alison「你要不要來探班？」→「我去。」＝C15 營隊探班（7/11 12:00 營地；她傳「{日期}中午來！！」）',lines().some(t=>t.includes('你要不要來探班？'))&&!!q5&&q5.day===D('2026-07-11')&&q5.h===12,JSON.stringify(q5));
      said=[]; await TERMEND.dayOuting(GM,q5); check('11. 探班那天：操場上一群小朋友在追 Alison、雞塊；記 C15_DONE',lines().some(t=>t.includes('我先救我自己'))&&G.flags.C15_DONE.yu_camp===G.day);
      TERMEND.dayMissed(GM,q5); G.day=q5.day; G.hour=21.1; PHONE.tick(G); check('11. C15 沒去：那天晚上 21:00 Alison 私訊照片「我還活著！」',(G.msgs||[]).some(m=>m.from==='yu'&&m.text==='我還活著！'));
      { const d2=D('2027-06-11'); fresh(d2,19,'campus',{}); G.stage='law'; meet('yu'); said=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'yu',kind:'friend',term:'Y2S2'}});
        const q6=OUT.get(G,'c15_yu_camp2'); check('11. Alison 大二下「暑假營隊我當小隊長。」→「我去探班。」＝C15 探班 7/17 12:00 營地，不報名系學會的高中營 C02（AA_408 第 5 節）',lines().some(t=>t.includes('暑假營隊我當小隊長。'))&&!!q6&&q6.day===D('2027-07-17')&&q6.h===12&&!VAC.enrolled(G,'C02','Y2'),JSON.stringify(q6));
        said=[]; await TERMEND.dayOuting(GM,q6); const L6=lines(); check('11. 大二探班：哨子、「我是小隊長了！……他們都不聽我的。」、雞塊藏在碗底；沒去過大一探班＝「他們最會偷雞塊。要先藏好。」',L6.some(t=>t.includes('她脖子上掛著一個哨子'))&&L6.some(t=>t.includes('我是小隊長了！……他們都不聽我的。'))&&L6.some(t=>t.includes('他們最會偷雞塊。要先藏好。'))&&!L6.some(t=>t.includes('去年被偷過')),JSON.stringify(L6));
        fresh(d2,19,'campus',{C15_DONE:{yu_camp:D('2026-07-11')}}); G.stage='law'; meet('yu'); said=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'yu',kind:'friend',term:'Y2S2'}}); const q7=OUT.get(G,'c15_yu_camp2'); said=[]; await TERMEND.dayOuting(GM,q7);
        check('11. 大一去過探班：最後一句「去年被偷過，今年學乖了。」',lines().some(t=>t.includes('去年被偷過，今年學乖了。')));
        TERMEND.dayMissed(GM,q7); G.day=q7.day; G.hour=21.1; PHONE.tick(G); check('11. 大二探班沒去：21:00 Alison「小隊長還活著！」',(G.msgs||[]).some(m=>m.from==='yu'&&m.text==='小隊長還活著！')); }
      fresh(D('2026-06-12'),19,'campus',{}); G.stage='law'; meet('heroine_04');
      check('11. 子晴「要不要玩？」要看過 Q6（PLAYTESTED）',TERMEND.hookFor(G,'Y1S2','heroine_04')===null&&(SOCIAL.remember('heroine_04','PLAYTESTED',''),!!TERMEND.hookFor(G,'Y1S2','heroine_04')));
      check('11. 每一個 C15 都有傳日子的訊息；Alison 多益不傳照片、其他都有',Object.entries(TL.C15).every(([k,c])=>Array.isArray(c.msg)&&c.msg.length&&(k==='yu_toeic'?c.photo===null:Array.isArray(c.photo))));
    } }
  // 12. 玩家自己約（BB_203 第 1 節第 13 點、AA_268）：期末時段裡用 invites 的「吃飯」約＝期末的飯
  { const P=INVITE_DATA.places, nIdx=P.findIndex(p=>p.id==='noodle'), cIdx=P.findIndex(p=>p.id==='cafe');
    fresh(D('2025-12-18'),19.9,'campus',{}); G.stage='law'; meet('classmate_xinci'); meet('heroine_01'); Object.assign(SOCIAL.rel('classmate_xinci'),{fam:30,trust:20,comf:15}); Object.assign(SOCIAL.rel('heroine_01'),{fam:45,trust:30,comf:20,npcRom:30}); const Lg=DATE.log(G,'heroine_01'); Lg.count=4; Lg.wish=true;
    INV.rec(G); G.contacts.classmate_xinci=G.day-30; G.contacts.heroine_01=G.day-30; run(19.9,21);
    const askX=(G.msgs||[]).find(m=>m.ask&&m.ask.id==='te_Y1S1_heroine_01');
    check('12. 前置：20:30 以安的心意邀約還沒回',!!askX&&PHONE.askOpen(G,askX));
    G.day=D('2025-12-19'); G.weekday=5; G.hour=10; const W={day:G.day,h:18.5};
    check('12. 判斷：時段裡吃飯＝期末飯（芯慈＝朋友、以安＝心意）；咖啡、時段外＝不是',(TERMEND.playerInvite(G,'classmate_xinci',P[nIdx],W)||{}).kind==='friend'&&(TERMEND.playerInvite(G,'heroine_01',P[nIdx],W)||{}).kind==='heart'&&TERMEND.playerInvite(G,'classmate_xinci',P[cIdx],W)===null&&TERMEND.playerInvite(G,'classmate_xinci',P[nIdx],{day:D('2025-12-01'),h:18.5})===null);
    let toasts=[]; const t0=GM.toast; GM.toast=t=>toasts.push(t); said=[]; picks=[P[nIdx].verb,0]; const iv=await INV.flow(GM,'classmate_xinci',null,false); GM.toast=t0;
    const R=G.termend.Y1S1, xm=(G.msgs||[]).filter(m=>m.th==='p:heroine_01').map(m=>(m.from||'')+':'+m.text);
    check('12. 約芯慈吃麵＝期末的飯：系統字「這是這學期的期末飯。」、R.picked by player',!!iv&&iv.te&&iv.te.kind==='friend'&&toasts.includes('這是這學期的期末飯。')&&R.picked&&R.picked.who==='classmate_xinci'&&R.picked.by==='player',JSON.stringify([iv,toasts,R.picked]));
    check('12. 以安還沒回的心意邀約自動婉拒：祐廷「這次我有約了，開學見。」＋她 AA_254 的婉拒句',xm.includes('player:這次我有約了，開學見。')&&askX.ans!=null&&xm[xm.length-1]==='heroine_01:'+TERMEND_LINES.HEART.heroine_01.decline,JSON.stringify(xm.slice(-3)));
    check('12. 這學期接過了：再約吃飯照一般吃飯',TERMEND.playerInvite(G,'heroine_01',P[nIdx],W)===null);
    said=[]; picks=[]; await INV.meet(GM,iv,null); check('12. 見面＝整場期末飯（一對一的開場、收尾）',lines().some(t=>t.includes('靠牆的兩人桌'))||lines().some(t=>t.includes('靠窗的兩人座')),JSON.stringify(lines().slice(0,3)));
    fresh(D('2025-12-19'),10,'campus',{}); G.stage='law'; meet('heroine_01'); Object.assign(SOCIAL.rel('heroine_01'),{fam:45,trust:30,comf:20}); INV.rec(G); G.contacts.heroine_01=G.day-30; ROM.get(G,'heroine_01').status='ended'; G.flags.CLEANUP_DONE=false; G.flags.cleanupDue=G.day+3;   /* 分開以後一週內（ROM.end 會設 cleanupDue；V6-S4：過了一週就算收拾過，tests/cleanup_unit.js）*/
    said=[]; picks=[P[nIdx].verb,0]; const iv2=await INV.flow(GM,'heroine_01',null,false);
    check('12. 分手、還不能重新開始：她婉拒「這學期不了。謝謝你約我。」',iv2===null&&lines().some(t=>t.includes('這學期不了。謝謝你約我。')),JSON.stringify(lines()));
    fresh(D('2025-12-19'),10,'campus',{dating_heroine_01:true}); G.stage='law'; meet('heroine_01'); Object.assign(SOCIAL.rel('heroine_01'),{fam:45,trust:30,comf:20}); INV.rec(G); G.contacts.heroine_01=G.day-30;
    toasts=[]; GM.toast=t=>toasts.push(t); said=[]; picks=[P[nIdx].verb,0]; const iv3=await INV.flow(GM,'heroine_01',null,false); GM.toast=t0;
    check('12. 女朋友：期末約會「這是這學期的期末約會。」、不佔名額',!!iv3&&iv3.te&&iv3.te.kind==='gf'&&toasts.includes('這是這學期的期末約會。')&&!((G.termend||{}).Y1S1||{}).picked,JSON.stringify([iv3,toasts])); }
  // 10. 存讀檔
  { fresh(D('2025-12-20'),10,'campus',{}); G.termend={think:{heroine_04:'Y1S1'},Y1S1:{plan:{heart:[],friend:['classmate_xinci'],fallback:null,gf:[],nope:{}},picked:{who:'classmate_xinci',kind:'friend',day:1}},contact:{Y1S1:{zhe:{pts:3,k:{chat:1}}}}};
    const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('10. 存讀檔：邀約、接了誰、讓我想想、分數都留著',G.termend.think.heroine_04==='Y1S1'&&G.termend.Y1S1.picked.who==='classmate_xinci'&&TERMEND.score(G,'Y1S1','zhe')===3); }
  // 13. 每學期不同的版本（over）＋玩家選的店不是她那一家（AA_254 8c76052b、AA_268 第 1 節）
  { const hf=TERMEND.hookFor; TERMEND.hookFor=()=>null;
    const setup=(term,id,fl)=>{ const w=TERMEND.windowOf(term); fresh(w.from,12,'campus',fl||{}); G.stage='law'; meet(id); R(id,70,50,45); SOCIAL.rel(id).npcRom=40; DATE.log(G,id).count=4; DATE.log(G,id).wish=true; return w; };
    const PSK={PS_BACK_FIRST:1};   /* 沛珊放榜後重新聯絡上（AA_282 第 2 節：沒聯絡上的她不先找人、不發邀約）*/
    let w=setup('Y3S1','classmate_peishan',PSK); run(20,21); const m=(G.msgs||[]).find(x=>x.tag==='te_Y3S1_classmate_peishan'); check('13. 沛珊大三上（放榜後重新聯絡上）：心意邀約照發',!!m,JSON.stringify((G.msgs||[]).filter(x=>/^te_/.test(x.tag||'')).map(x=>x.tag)));
    PHONE.answer(G,'te_Y3S1_classmate_peishan',0); STORY.phoneRules(GM); let q=OUT.get(G,'te_Y3S1');
    check('13. 沛珊大三起：地點＝台南・她學校附近的簡餐（AA_282 第 5 節第 5 點；原本的舊路書房旁邊的簡餐作廢）',!!q&&q.place==='台南・她學校附近的簡餐',JSON.stringify(q&&q.place));
    check('13. 沛珊大三起：回家走回她在台南租的地方；大一還是新生南路',TERMEND.heart('classmate_peishan','Y3S1').walkPlace==='台南・往她租的地方'&&TERMEND.heart('classmate_peishan','Y1S2').walkPlace==='新生南路・往捷運站');
    w=setup('Y4S1','classmate_peishan',PSK); run(20,21); PHONE.answer(G,'te_Y4S1_classmate_peishan',0); STORY.phoneRules(GM); q=OUT.get(G,'te_Y4S1'); said=[]; opts=[]; picks=[3,0]; await TERMEND.dinner(GM,q); let L=lines();
    check('13. 沛珊大四上先不說：BB_119 3-1「我可以問一個奇怪的問題嗎？」「如果我們兩個都不是當年的樣子了，還可以重新認識嗎？」→「從今天開始認識。」＝交往',L.some(x=>x.endsWith('我可以問一個奇怪的問題嗎？'))&&L.some(x=>x.endsWith('如果我們兩個都不是當年的樣子了，還可以重新認識嗎？'))&&JSON.stringify(opts[opts.length-1])===JSON.stringify(['「從今天開始認識。」','「……讓我想一下。」'])&&G.flags.dating_classmate_peishan===true,JSON.stringify(opts[opts.length-1]));
    w=setup('Y4S1','heroine_04'); run(20,21); let a=(G.msgs||[]).filter(x=>x.th==='p:heroine_04').map(x=>x.text);
    check('13. 子晴大四上（已經畢業）：「欸 你考完了吧 宵夜」「只有我們兩個 不要找阿凱」',JSON.stringify(a)===JSON.stringify(['欸 你考完了吧 宵夜','只有我們兩個 不要找阿凱']),JSON.stringify(a));
    w=setup('Y4S1','heroine_04',{EXCHANGE_ROUTE:'US'}); G.day=w.to-2; run(20,21); a=(G.msgs||[]).filter(x=>x.th==='p:heroine_04').map(x=>x.text);
    check('13. 子晴大四上美國路線：「欸 你回來了齁 宵夜」',a[0]==='欸 你回來了齁 宵夜',JSON.stringify(a));
    w=setup('Y4S1','heroine_03'); run(20,22); PHONE.answer(G,'te_Y4S1_heroine_03',0); STORY.phoneRules(GM); q=OUT.get(G,'te_Y4S1'); cgs=[]; said=[]; picks=[3,0]; await TERMEND.dinner(GM,q); L=lines();
    const i3=L.findIndex(x=>x.endsWith('……你要不要試試看，被我分一點時間？'));
    check('13. 語彤大四上她說＝事件 16 三句＋理由一句（沒有 NOTICED_EMPTY_SEAT＝碗拿到櫃台），CG-12 在最後一句',L.some(x=>x.endsWith('我以前覺得，喜歡一個人要有時間。'))&&L.some(x=>x.endsWith('你每次吃完，都自己把碗拿到櫃台。'))&&i3>0&&JSON.stringify(cgs)===JSON.stringify(['cg_share_time_heroine03'])&&G.flags.dating_heroine_03===true,JSON.stringify(cgs));
    w=setup('Y4S1','heroine_03'); SOCIAL.remember('heroine_03','NOTICED_EMPTY_SEAT',''); run(20,22); PHONE.answer(G,'te_Y4S1_heroine_03',0); STORY.phoneRules(GM); q=OUT.get(G,'te_Y4S1'); cgs=[]; said=[]; picks=[0]; await TERMEND.dinner(GM,q);
    check('13. 語彤大四上玩家先說：CG-12 放在她答應那一句',JSON.stringify(cgs)===JSON.stringify(['cg_share_time_heroine03']));
    w=setup('Y3S1','heroine_03'); run(20,22); PHONE.answer(G,'te_Y3S1_heroine_03',0); STORY.phoneRules(GM); q=OUT.get(G,'te_Y3S1'); cgs=[]; said=[]; picks=[0]; await TERMEND.dinner(GM,q);
    check('13. 語彤大三上：不放 CG-12（只有大四上）',!cgs.length&&G.flags.dating_heroine_03===true);
    // 玩家自己約、選的店
    w=setup('Y1S2','heroine_01'); TERMEND.plan(G,w); said=[]; await TERMEND.dinner(GM,{te:{who:'heroine_01',kind:'heart',term:'Y1S2',place:'brunch',placeName:'半熟'}}); L=lines();
    check('13. 玩家約以安去半熟（不是她那一家）：開場照半熟、不說飯桌一句、照樣走回研究室',L[0]==='（半熟。）'&&!L.some(x=>x.includes('今天是特地訂的'))&&L.some(x=>x.includes('我的手帳放在這裡')),JSON.stringify(L.slice(0,4)));
    w=setup('Y1S2','heroine_03'); TERMEND.plan(G,w); said=[]; picks=[0]; await TERMEND.dinner(GM,{te:{who:'heroine_03',kind:'heart',term:'Y1S2',place:'noodle',placeName:'阿鳳麵店'}}); L=lines();
    check('13. 玩家約語彤去麵店（剛好是她那一家）：說飯桌一句',L.some(x=>x.includes('這碗沒放蔥')),JSON.stringify(L.slice(0,5)));
    TERMEND.hookFor=hf; }
  // 14. AA_250 全檔口語審（01029de1、BB_212 6f6e9c7e）的條件
  { const P=TERMEND_LINES.POOL, res=(x,G)=>typeof x==='function'?x(G):x;
    check('14. Alison 大一上「聖誕節交換禮物，你買好了嗎？」12/24 以前才說；大二上跨年那句 12/31 以前才說',res(P.Y1S1.yu[1],{day:D('2025-12-24')})==='聖誕節交換禮物，你買好了嗎？'&&res(P.Y1S1.yu[1],{day:D('2025-12-25')})==null&&res(P.Y2S1.yu[1],{day:D('2026-12-31')})!=null&&res(P.Y2S1.yu[1],{day:D('2027-01-01')})==null);
    check('14. 以安在期末飯不說「理由」',Object.values(P).every(T=>!(T.heroine_01||[]).some(x=>typeof x==='string'&&x.includes('理由'))));
    check('14. 子晴大三上：看過 Q6＝發表會那個遊戲；沒看過＝「發表會在五月。……」；阿凱大四上在遊戲公司實習',res(P.Y3S1.heroine_04[0],{events:{done:{ev_ziqing_secret_game:1}}}).startsWith('發表會那個遊戲')&&res(P.Y3S1.heroine_04[0],{events:{done:{}}})==='發表會在五月。做完我就要開始找工作了。'&&P.Y4S1.kai[0].startsWith('實習的公司'));
    check('14. 學姊女朋友版的收尾「（她看了一下錶，沒有要起身的意思。）」；朋友版照舊收計畫本',TERMEND_LINES.PLACE.eatery_lib.closeGf==='（她看了一下錶，沒有要起身的意思。）'&&TERMEND_LINES.PLACE.eatery_lib.close==='（她看了一下錶，把計畫本收進包包。）');
    check('14. 沛珊女朋友的學期末約會：大三起在台南她學校附近（AA_282 第 5 節第 5 點）',TERMEND.gf('classmate_peishan','Y3S1').place==='eatery_tn'&&TERMEND.gf('classmate_peishan','Y2S2').place==='eatery');
    fresh(D('2028-12-20'),9,'campus',{}); G.stage='law'; meet('npc_fangyt'); R('npc_fangyt',60,40,30); G.termend={contact:{Y4S1:{npc_fangyt:{pts:20,k:{}}}},think:{}};
    check('14. 方奕廷大四上（在嘉義）不發期末飯邀約',!TERMEND.friendOk(G,'npc_fangyt',TERMEND.windowOf('Y4S1'))); }
  // 15. AA_352：女朋友的學期末約會，飯桌一句每學期不一樣（tableByTerm）；沒寫的學期照 table
  { const gfDin=async(who,term,_d,flags)=>{ fresh(TERMEND.windowOf(term).from+2,19,'campus',flags||{}); G.stage='law'; meet(who); R(who,70,60,50); G.flags['dating_'+who]=true; said=[]; picks=[0,0,0]; await TERMEND.dinner(GM,{id:'te_gf_'+term+'_'+who,te:{term,who,kind:'gf'}}); return said.map(x=>x.t); };
    const has=(L,a)=>a.every(t=>L.includes(t)), T=k=>D(k);
    const a=await gfDin('heroine_01','Y2S1',T('2027-01-14')), a0=await gfDin('heroine_01','Y1S2',T('2026-06-15'));
    check('15. AA_352 以安大二上「寒假東京那兩個禮拜，時差一個小時。……」（AA_524 A3 改原句）；大一下照原本「這學期的手帳……」',has(a,['寒假東京那兩個禮拜，時差一個小時。……你那邊比較早，我知道。'])&&!a.includes('這學期的手帳，很多頁都寫到你。……你不准翻。')&&a0.includes('這學期的手帳，很多頁都寫到你。……你不准翻。'),JSON.stringify(a));
    const y=await gfDin('heroine_03','Y2S2',T('2027-06-17')), y1=await gfDin('heroine_03','Y2S1',T('2027-01-14'));
    check('15. 語彤大二下「（她把兩碗麵推過來。她那碗多了一把蔥。）」（旁白）「……今天想吃蔥。」；大二上照寒假那句（AA_524 Y1：大二上換「我媽又問年菜了。……我說再等等。」）',has(y,['（她把兩碗麵推過來。她那碗多了一把蔥。）','……今天想吃蔥。'])&&y1.includes('我媽又問年菜了。……我說再等等。'),JSON.stringify(y));
    const s5=await gfDin('heroine_05','Y4S1',T('2029-01-12'));
    check('15. 學姊大四上（12/23 才回國）「時差還沒調好。我現在很想睡。」「……可是這頓我不想錯過。」（AA_363 第 4 節，原本「回來三個禮拜……」）；沒有「今天我沒帶計畫本出門。」',has(s5,['時差還沒調好。我現在很想睡。','……可是這頓我不想錯過。'])&&!s5.includes('回來三個禮拜，時差還沒調好。')&&!s5.includes('今天我沒帶計畫本出門。'),JSON.stringify(s5));
    const z=await gfDin('heroine_02','Y3S2',T('2028-06-15'));
    check('15. 芷若大三下「九月又要走，這次一年。」「……六月的週五，你先全部給我。」（AA_377 第 11 項：她 7/1～8/1 在台中）',has(z,['九月又要走，這次一年。','……六月的週五，你先全部給我。'])&&!z.includes('店長最近都讓我早一點下班。她什麼都沒問。'),JSON.stringify(z));
    const c=await gfDin('heroine_04','Y3S1',T('2028-01-13'));
    check('15. 子晴大三上「期末專題，我挑了一個可能做不完的題目。」「……做不完也沒關係吧。」',has(c,['期末專題，我挑了一個可能做不完的題目。','……做不完也沒關係吧。']),JSON.stringify(c));
    const ps=await gfDin('classmate_peishan','Y3S2',T('2028-06-15')), ps0=await gfDin('classmate_peishan','Y1S2',T('2026-06-15'));
    check('15. 沛珊大三下（台南）「你每次下來，都搭最後一班高鐵。」「……下次早一點來，我帶你去運河邊。」；大一下照原本',has(ps,['你每次下來，都搭最後一班高鐵。','……下次早一點來，我帶你去運河邊。'])&&ps0.includes('這學期有幾次我想打給你，後來沒打。怕你在讀書。'),JSON.stringify(ps));
    const GF=TERMEND_LINES.GF, all=[];
    for(const id in GF) for(const t in (GF[id].tableByTerm||{})){ const v=[].concat(GF[id].tableByTerm[t]).map(x=>typeof x==='string'?x:x.narr); const pool=((TERMEND_LINES.POOL[t]||{})[id]||[]).filter(x=>typeof x==='string'); all.push(...v.filter(x=>pool.includes(x)).map(x=>id+' '+t+' '+x)); }
    check('15. 飯桌一句不和同一學期的話題池重複（AA_352 寫法）',!all.length,all.join(' ')); }
  // 16. AA_361（企劃線 c7af5599；芷若大三下那句照 AA_377 第 8 項「禮拜四我下班以後」）：朋友的學期末邀約每學期一句（FRIEND[id].genByTerm；沒寫的學期照 gen）——修改前沒有 genByTerm（阿哲六次「我請你一顆滷蛋」）
  { const EXP={"zhe": {"Y2S1": "考完了 吃飯 這次滷蛋兩顆", "Y2S2": "考完了 暑假前最後一頓 麵店", "Y3S1": "隊長請客 考完了 麵店", "Y3S2": "考完了 我騎車載你 有一家新開的", "Y4S1": "考完了 吃飯 下學期就畢業了欸"}, "heroine_01": {"Y2S1": "考完了。……寒假我要去東京兩個禮拜，走之前吃個飯？", "Y2S2": "考完了。吃個飯？八月我就去京都了。", "Y3S1": "考完了。三月我就出發了。……吃個飯。", "Y4S1": "考完了。二月還有一場筆試。……吃完飯再讀。"}, "classmate_bohan": {"Y2S1": "考完了。吃飯嗎。法服下學期的排班我還沒排完。", "Y2S2": "考完了。吃飯嗎。七點到九點，跟上次一樣。", "Y3S1": "考完了。吃飯嗎。八點以前我要回總圖。", "Y3S2": "考完了。吃飯嗎。下個月補習班開課，之後就沒空了。", "Y4S1": "考完了。吃飯嗎。只有一個小時。"}, "heroine_04": {"Y2S1": "欸 考完了沒 宵夜 我要吃炸的", "Y2S2": "欸 我最後一科交了 宵夜", "Y3S1": "欸 我畢業專題交了 你呢 宵夜", "Y3S2": "欸 我畢業了欸 宵夜 我請", "Y4S1": "欸 工作室今天沒加班 宵夜"}, "classmate_mingxuan": {"Y2S1": "考完喔？吃飯，家教九點下課，老地方", "Y2S2": "考完喔？吃飯，家教學生也考完了，我們都解放", "Y3S1": "考完喔？吃飯，家教那邊今天早下課", "Y3S2": "考完喔？吃飯，九點，路邊攤就好", "Y4S1": "考完喔？吃飯，一樣九點以後"}, "yu": {"Y2S1": "考完了！！吃飯！這次我挑！", "Y2S2": "考完了！吃冰！不吃飯了！", "Y3S1": "考完了！吃飯好不好 吉他社的人都回家了", "Y3S2": "考完了！吃飯！我要開始讀國考了 吃完再說", "Y4S1": "考完了！你挑！最後一個上學期了！"}, "heroine_03": {"Y2S1": "考完了。禮拜四，阿姨說要煮火鍋。", "Y2S2": "考完了。禮拜四……田野出發前，吃一頓。", "Y3S1": "考完了。禮拜四。阿姨續約了，她說要請。", "Y3S2": "考完了。禮拜四，要吃飯嗎。……我煮。", "Y4S1": "考完了。禮拜四。……法律的必修，我還剩三科。"}, "heroine_02": {"Y2S1": "考完了嗎？我寒假班排很多。下班以後先吃一次。", "Y2S2": "考完了嗎？九月我就走了。……出來吃個東西？", "Y3S2": "考完了嗎？禮拜四我下班以後，吃個東西？"},   /* Y2S2：AA_369 M2 改字（6/3 是她最後一個班）*/ "heroine_05": {"Y2S1": "期末考完了嗎？我研究室今天沒人。法圖旁邊那家，我請你。", "Y2S2": "期末考完了嗎？法圖旁邊那家，這次你請。", "Y3S1": "期末考完了嗎？明年夏天，我申請了美國的交換。下個月面試。……吃飯的時候不要問。", "Y3S2": "期末考完了嗎？八月我就出發了。法圖旁邊那家？", "Y4S1": "期末考完了嗎？我昨天回來的。法圖旁邊那家，還在。"}}, F=TERMEND_LINES.FRIEND, bad=[];
    const rs=v=>typeof v==='function'?v({flags:{}}):v;   /* AA_518 第 6 節：學姊大二上、大二下是函式（有 YOUPAY 的換句），沒有 YOUPAY＝原文 */
    for(const id in EXP) for(const t in EXP[id]) if(!(F[id]&&F[id].genByTerm&&rs(F[id].genByTerm[t])===EXP[id][t])) bad.push(id+'/'+t);
    check('16. AA_361 九位 × 大二上～大四上的句子照原文（42 句；在國外的學期不寫；學姊大四上那句照 AA_363 S1「我昨天回來的」，見 9f）',!bad.length&&!(F.heroine_02.genByTerm||{}).Y3S1&&!(F.heroine_01.genByTerm||{}).Y3S2&&!F.classmate_xinci.genByTerm&&JSON.stringify(F.npc_fangyt.genByTerm)===JSON.stringify({Y1S2:'考完了嗎？吃個飯。七月我就要上山了。'})/* 方奕廷只有 AA_373 #12 的大一下那句 */&&!F.classmate_peishan.genByTerm,bad.join('、'));
    const src=fs.readFileSync(path.join(ROOT,'src/termend3d.js'),'utf8');
    check('16. 送朋友邀約先讀 genByTerm[學期]，再讀 genBySem（上／下學期末，AA_369 L1），沒有才用 gen；大一上照 y1s1；婉拒先讀 noByTerm[學期]（AA_260 (b-1) 第 14 項，S.friendNo）、再讀 noBySem',/send\(id,'friend',resolve\(w\.id==='Y1S1'\?f\.y1s1:\(\(f\.genByTerm&&f\.genByTerm\[w\.id\]\)\|\|\(f\.genBySem&&f\.genBySem\[sem\]\)\|\|f\.gen\),G\),S\.friendNo\(f,w\.id\)\)/.test(src)&&/\(f\.noByTerm&&f\.noByTerm\[term\]\)\|\|\(f\.noBySem&&f\.noBySem\[sem\]\)\|\|f\.no/.test(src)); }
  // 12. AA_389 第 2 點（企劃線 345234b3）：HOOK_ZQ_GAME 補場做好以前不出選項；HOOK_T03 不出選項——她照樣說自己的計畫，玩家沒有「我去」那個選項、不記旗標
  //     HOOK_ZR_SENDOFF：AA_390 的 9/2 送機（src/zr_sendoff3d.js）做好了，選項打開：選「出發那天我去送妳」記旗標（＝那天）
  { fresh(D('2027-06-10'),19,'campus',{}); G.stage='law'; meet('heroine_02'); said=[]; opts=[]; picks=[0];
    const r=await TERMEND.hook(GM,'Y2S2','heroine_02'); const L=lines();
    check('12. Y2S2 芷若「九月二號出發。」：有「出發那天我去送妳」，選了記 HOOK_ZR_SENDOFF',r===true&&L.some(t=>t.endsWith('九月二號出發。'))&&opts.length===1&&opts[0].some(t=>/出發那天我去送妳/.test(t))&&G.flags.HOOK_ZR_SENDOFF===G.day,JSON.stringify({r,L,opts,f:G.flags.HOOK_ZR_SENDOFF})); }
  /* AA_400：子晴的測試版（src/zq_testbuild3d.js）做好了，「做出來給我玩。」打開 */
  { fresh(D('2028-01-10'),19,'campus',{}); G.stage='law'; meet('heroine_04'); G.events.done.ev_ziqing_secret_game=1; said=[]; opts=[]; picks=[0];
    const r=await TERMEND.hook(GM,'Y3S1','heroine_04'); const L=lines();
    check('12. Y3S1 子晴「發表會那個遊戲，我想做到可以上架。」：有「做出來給我玩。」，選了記 HOOK_ZQ_GAME（AA_400 做好了）',r===true&&L.some(t=>t.endsWith('發表會那個遊戲，我想做到可以上架。'))&&opts.length===1&&opts[0].some(t=>/做出來給我玩/.test(t))&&G.flags.HOOK_ZQ_GAME!=null,JSON.stringify({r,L,opts,f:G.flags.HOOK_ZQ_GAME})); }
  for(const [term,who,say,flag,day] of [['Y3S2','heroine_04','七月三號到七號 曼谷','HOOK_T03','2028-06-10']]){
    fresh(D(day),19,'campus',{}); G.stage='law'; meet(who); G.events.done.ev_ziqing_secret_game=1; said=[]; opts=[]; picks=[0];
    const r=await TERMEND.hook(GM,term,who); const L=lines();
    check('12. '+term+' '+who+'：照樣說「'+say+'」、不出選項、不記 '+flag,L.some(t=>t.endsWith(say))&&!opts.length&&G.flags[flag]==null,JSON.stringify({r,L,opts,f:G.flags[flag]})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
