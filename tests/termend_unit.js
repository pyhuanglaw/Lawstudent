// 學期末的飯：告白只在學期末（BB_203，使用者 2026-10-17；BB203-CONFESS-1017）——不需要瀏覽器。
// 檢查：時段；這學期常接觸的分數；保底阿凱；心意的邀約（答應線）、朋友的邀約、只能接一個；飯（開場、話題池、飯桌一句、收尾）；回家的路上（說出來、她說、讓我想想、下學期第二次）；學姊筆試前那一句；語彤 6/18 以後；女朋友的學期末約會；約會收尾不再告白；存讀檔。用法：node tests/termend_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|DATE|ROM|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
    check('3. 阿凱「宵夜？」→ 好 → 公館宵夜（「我點不辣的。…」、話題池、「這次我請。…」）',L[0]==='阿凱：宵夜？'&&L.some(t=>t.includes('我點不辣的。你上次吃辣的那家，吃到一半去買水。'))&&L.some(t=>t.includes('寒假我留在臺北，接了一個修電腦的打工。'))&&L.some(t=>t.includes('這次我請。下次你請，不要太快。'))&&R.picked&&R.picked.who==='kai',JSON.stringify(L));
    check('3. 一學期只問一次',!TERMEND.kaiDue(G)); }
  // 4. 朋友的邀約＋心意的邀約；只能接一個
  fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('classmate_xinci'); meet('heroine_01'); R('classmate_xinci',25,0,0); R('heroine_01',70,50,45);
  G.termend={contact:{Y1S1:{classmate_xinci:{pts:7,k:{}},heroine_01:{pts:9,k:{}}}},think:{}};
  const cc0=DATE.canConfess; DATE.canConfess=(g,id)=>id==='heroine_01'?{ok:true}:{ok:false,why:'stage'};
  SOCIAL.rel('heroine_01').npcRom=49; SOCIAL.rel('heroine_01').rom=31; DATE.log(G,'heroine_01').count=2;   /* 大一上的答應線 50（BB bb863739）*/
  { const w=TERMEND.window(G); delete (G.termend.Y1S1||{}).plan; const P=TERMEND.plan(G,w); check('4. 以安的戀愛 49（大一上答應線 50 減 1）＝沒有心意的邀約；她當朋友約',!P.heart.includes('heroine_01')&&P.friend.includes('heroine_01'),JSON.stringify(P)); }
  SOCIAL.rel('heroine_01').npcRom=50; G.termend.Y1S1={};
  { const w=TERMEND.window(G), P=TERMEND.plan(G,w); check('4. 大一上答應線 50＝心意的邀約；芯慈（contact 7、FAMILIAR）朋友的邀約',P.heart.includes('heroine_01')&&P.friend.includes('classmate_xinci')&&!P.friend.includes('heroine_01'),JSON.stringify(P)); }
  run(20,21);
  { const a=(G.msgs||[]).find(m=>m.tag==='te_Y1S1_heroine_01'), b=(G.msgs||[]).find(m=>m.tag==='te_Y1S1_classmate_xinci');
    check('4. 20:30 以安「考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。」（AA_254）＋芯慈大一上那句（AA_250 10-2）',!!a&&a.text==='考完了。……這次只有我們兩個，可以嗎？我訂了位子，七點。'&&!!b&&b.text==='期末考完那天晚上有空嗎？我想吃一頓不用看筆記的飯。'&&JSON.stringify(a.ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天有約了。']),JSON.stringify([a&&a.text,b&&b.text]));
    PHONE.answer(G,'te_Y1S1_heroine_01',0); STORY.phoneRules(GM); PHONE.tick(G);
    const q=OUT.get(G,'te_Y1S1'); check('4. 接以安＝排出遊（12/20 19:00、學期末的飯）；芯慈自動婉拒（「好。那開學見。」）',!!q&&q.te.who==='heroine_01'&&q.te.kind==='heart'&&q.day===D('2025-12-20')&&q.h===19&&b.ans===1&&(G.msgs||[]).some(m=>m.from==='classmate_xinci'&&m.text==='好。那開學見。'),JSON.stringify(q)); }
  // 5. 飯 → 回家的路上：說出來＝交往
  { said=[]; picks=[0]; const q=OUT.get(G,'te_Y1S1'); await TERMEND.dinner(GM,q); const L=lines();
    check('5. 一對一的開場（簡餐，AA_250 10-1）、話題池兩句、飯桌一句、收尾',L.includes('（簡餐店的電視在播新聞。靠窗的兩人座。）')&&L.some(t=>t.includes('民總最後一題，我寫到時間到。'))&&L.some(t=>t.includes('我這學期的手帳寫了一百二十頁。……有一頁不給你看。'))&&L.includes('（餐盤疊好，拿去回收。外面的路燈已經亮了。）'),JSON.stringify(L));
    check('5. 語彤：三選一照 AA_187 9-2、麵店打烊後的開場',TERMEND_LINES.HEART.heroine_03.optsFrom==='confess'&&TERMEND_LINES.HEART.heroine_03.place==='noodle_closed'&&TERMEND_LINES.PLACE.noodle_closed.open==='（鐵門拉下一半。店裡只開了長桌上那一盞燈。）');
    check('5. 回家的路上：研討室「我的手帳放在這裡。……白板還沒擦。」；選項＝以安的三句＋（先不說）',L.some(t=>t.includes('我的手帳放在這裡。……白板還沒擦。'))&&opts[opts.length-1].length===4&&opts[opts.length-1][3]==='（先不說）',JSON.stringify(opts[opts.length-1]));
    check('5. 說出來＝她答應（confess_lines；旁白是旁白）＋交往（dating_heroine_01）',L.some(t=>t.includes('好。我們在一起。'))&&L.includes('（她翻開手帳，翻到後面某一頁，又闔起來。）')&&G.flags.dating_heroine_01===true,JSON.stringify(L.slice(-4))); }
  // 6. 先不說＝她說 → 讓我想想 → 下學期第二次
  fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('heroine_04'); R('heroine_04',70,50,45); SOCIAL.rel('heroine_04').npcRom=62; SOCIAL.rel('heroine_04').rom=31; DATE.log(G,'heroine_04').count=2;
  DATE.canConfess=(g,id)=>id==='heroine_04'?{ok:true}:{ok:false,why:'stage'};
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
  // 7. 學姊：筆試前不發心意邀約，傳那一句；語彤大一下 6/19 以後的週四
  fresh(D('2025-12-18'),19.9,'campus',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',45,30,20); SOCIAL.rel('heroine_05').npcRom=40; SOCIAL.rel('heroine_05').rom=31; DATE.log(G,'heroine_05').count=2; DATE.canConfess=(g,id)=>id==='heroine_05'?{ok:true,decline:'preexam'}:{ok:false,why:'stage'};
  { run(19.9,20.2); const m=(G.msgs||[]).find(x=>x.tag==='te_nope_Y1S1_heroine_05'); check('7. 學姊筆試前：20:00「這學期的期末，我在讀書。……謝謝你這學期陪我讀。」，沒有心意的邀約',!!m&&m.text==='這學期的期末，我在讀書。……謝謝你這學期陪我讀。'&&!(G.msgs||[]).some(x=>x.tag==='te_Y1S1_heroine_05')); }
  fresh(D('2026-06-11'),12,'campus',{}); G.stage='law';
  { const d=TERMEND.dinnerDay(G,TERMEND.windowOf('Y1S2'),TERMEND_LINES.HEART.heroine_03,'heroine_03'); check('7. 語彤大一下：6/18 筆試以後的週四（6/25 超出時段＝那就 6/19 以後的第一天）',d!=null&&d>=D('2026-06-19')&&d<=D('2026-06-21'),String(d-D('2026-06-19'))); }
  // 8. 交往中的女朋友：另外的學期末約會，不佔名額
  fresh(D('2025-12-18'),20,'campus',{dating_heroine_02:true}); G.stage='law'; DATE.canConfess=()=>({ok:false,why:'stage'});
  { run(20,21); const m=(G.msgs||[]).find(x=>x.tag==='te_gf_Y1S1_heroine_02'); check('8. 芷若（交往中）：「禮拜五九點，等我下班。」',!!m&&m.text==='禮拜五九點，等我下班。');
    PHONE.answer(G,'te_gf_Y1S1_heroine_02',0); STORY.phoneRules(GM); const q=OUT.get(G,'te_gf_Y1S1_heroine_02'); check('8. 接了＝排在週五 21:00（不佔只能接一個）',!!q&&q.te.kind==='gf'&&CALENDAR.dateOf(q.day).wd%7===5&&q.h===21&&!G.termend.Y1S1.picked,JSON.stringify(q)); }
  // 9. 約會收尾不再有告白
  { fresh(D('2025-11-01'),18,'campus',{}); const r=await DATE.confessOffer(GM,{who:'heroine_01'}); check('9. 正式約會的收尾不再有告白（DATE.confessOffer＝false）',r===false&&!opts.length); }
  DATE.canConfess=cc0;
  // 9b. 使用者選 B：大一上的學期末只要 2 次正式約會、不看心願地點（大一下起回到 4 次含心願地點）
  { fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('heroine_04'); const r=SOCIAL.rel('heroine_04'); Object.assign(r,{fam:62,trust:46,comf:41,npcRom:62,rom:31});
    const L=DATE.log(G,'heroine_04'); L.count=2; L.wish=false;
    const P1=TERMEND.plan(G,TERMEND.windowOf('Y1S1')); L.count=1; G.termend.Y1S1={}; const P0=TERMEND.plan(G,TERMEND.windowOf('Y1S1'));
    G.day=D('2026-06-11'); L.count=3; const P2=TERMEND.plan(G,TERMEND.windowOf('Y1S2'));
    check('9b. 大一上：第 6 階＋答應線＋2 次正式約會（沒有心願地點）＝心意的邀約；1 次＝沒有；大一下 3 次沒心願地點＝沒有',P1.heart.includes('heroine_04')&&!P0.heart.includes('heroine_04')&&!P2.heart.includes('heroine_04'),JSON.stringify([P1.heart,P0.heart,P2.heart])); }
  { fresh(D('2025-12-18'),9,'campus',{}); G.stage='law'; meet('heroine_01'); const r=SOCIAL.rel('heroine_01'); Object.assign(r,{fam:45,trust:30,comf:20,npcRom:50,rom:30}); const L=DATE.log(G,'heroine_01'); L.count=2;
    const P5=TERMEND.plan(G,TERMEND.windowOf('Y1S1')); G.termend.Y1S1={}; r.npcRom=49; const P4=TERMEND.plan(G,TERMEND.windowOf('Y1S1')); G.termend.Y1S1={}; r.npcRom=50; r.rom=29; const Pr=TERMEND.plan(G,TERMEND.windowOf('Y1S1'));
    check('9b. 大一上的門檻（BB bb863739）：以安第 5 階＋戀愛 50＋祐廷 30＋2 次＝心意的邀約；戀愛 49、祐廷 29＝沒有',DATE.stageNum('heroine_01')===5&&P5.heart.includes('heroine_01')&&!P4.heart.includes('heroine_01')&&!Pr.heart.includes('heroine_01'),JSON.stringify([DATE.stageNum('heroine_01'),P5.heart,P4.heart,Pr.heart])); }
  check('9c. 校園單獨約出來：第 3 階起她的戀愛 +1、祐廷的戀愛 +1（一天一次，AA_243 第 1 節）',/DATE\.stageNum\(iv\.who\)>=3&&iv\.who!=='kexin'\)\{ const DY=G\.daily\|\|\(G\.daily=\{\}\), k='romAlone_'\+iv\.who; if\(DY\[k\]!==G\.day\)\{ DY\[k\]=G\.day; SOCIAL\.adjust\(iv\.who,\{npcRom:1,rom:1\}\)/.test(fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8')));
  // 10. 存讀檔
  { fresh(D('2025-12-20'),10,'campus',{}); G.termend={think:{heroine_04:'Y1S1'},Y1S1:{plan:{heart:[],friend:['classmate_xinci'],fallback:null,gf:[],nope:{}},picked:{who:'classmate_xinci',kind:'friend',day:1}},contact:{Y1S1:{zhe:{pts:3,k:{chat:1}}}}};
    const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('10. 存讀檔：邀約、接了誰、讓我想想、分數都留著',G.termend.think.heroine_04==='Y1S1'&&G.termend.Y1S1.picked.who==='classmate_xinci'&&TERMEND.score(G,'Y1S1','zhe')===3); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
