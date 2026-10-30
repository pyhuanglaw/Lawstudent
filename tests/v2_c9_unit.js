// 交接包 v2 C9：春假三選一（草稿第 3 節「春假」、BB_96 9-5 可昕 K8）——不需要瀏覽器。修改前沒有這些（第 1 項失敗）。
// 檢查：第 5 週的兩個邀約（麵店團群組、交往中的可昕）；收到以後的選擇（有哪些選項、晚一點再決定、4/2 過了算留在宿舍）；三種選擇各自的後果
//   （可昕的回覆與照片、可昕那一趟的出遊、麵店團的照片、宿舍的旁白、KX_TRIP_DEFERRED）；可昕 K8 那一趟：目的地（山上看星星只給天文課第 6 週有去的）、三題假設題、回程、KX_TRIP
// 用法：node tests/v2_c9_unit.js
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
(async()=>{
  const eK=ev('ev_kexin_trip_spring_y1'), eD=ev('ev_spring_dorm_empty_y1');
  check('C9：可昕 K8 事件、宿舍旁白、STORY.springDays／springPending／springPrompt 都在',!!eK&&!!eD&&!!STORY.springDays&&!!STORY.springPending&&!!STORY.springPrompt);
  if(!eK||!eD||!STORY.springDays){ console.log('FAILED '+fails); process.exit(1); }
  const D=STORY.springDays(), dd=d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
  check('日子：以安 3/24（第 5 週週二）、可昕 3/25（週三）、最後可以選 4/2、出發 4/3',dd(D.inv1)==='3/24'&&dd(D.inv2)==='3/25'&&dd(D.dl)==='4/2'&&dd(D.d0)==='4/3',JSON.stringify([dd(D.inv1),dd(D.inv2),dd(D.dl),dd(D.d0)]));
  const setup=(o)=>{ o=o||{}; fresh(D.inv1,18,'dorm',o.dating?{dating_kexin:true}:{}); if(o.grp!==false) PHONE.join(G,'noodle_team','麵店團'); };
  /* 邀約 */
  { setup({dating:true}); run(18,23.9); G.day=D.inv2; run(0,23.9);
    check('麵店團群組 3/24 21:00 以安「春假要不要一起出去？我做行程表。」',JSON.stringify(txt('g:noodle_team').filter(t=>!/建立了/.test(t)))==='["heroine_01:春假要不要一起出去？我做行程表。"]',JSON.stringify(txt('g:noodle_team')));
    check('交往中：3/25 21:30 可昕「春假我們開車去哪裡？」「我做了行程表。第二頁是我想吃的，第三頁才是行程。」',JSON.stringify(txt('p:kexin').filter(t=>/春假|行程表/.test(t)))==='["kexin:春假我們開車去哪裡？","kexin:我做了行程表。第二頁是我想吃的，第三頁才是行程。"]',JSON.stringify(txt('p:kexin')));
    setup({grp:false}); run(18,23.9); G.day=D.inv2; run(0,23.9); check('不在麵店團、單身：沒有邀約，也不會問',!TH('g:noodle_team').length&&!txt('p:kexin').some(t=>/春假/.test(t))&&!STORY.springPending(G)); }
  /* 什麼時候問、有哪些選項 */
  const optsOf=async(o)=>{ setup(o); run(18,23.9); G.day=D.inv2; run(0,23.9); const pend=STORY.springPending(G); picks=['晚一點']; opts=[]; if(pend) await STORY.springPrompt(GM); return {pend,opts:opts[0]||[]}; };
  { setup({dating:true}); run(18,22); check('可昕的訊息還沒到（3/24 22:00）：還不問',!STORY.springPending(G));
    let r=await optsOf({dating:true}); check('兩個邀約都到了：問；選項＝跟麵店團出去／和可昕開車旅行／留在宿舍／晚一點再決定',r.pend&&JSON.stringify(r.opts)==='["春假：跟阿哲他們出去","春假：和可昕開車旅行","春假：留在宿舍","晚一點再決定"]',JSON.stringify(r));
    check('晚一點再決定：今天不再問，明天同一時間再問',!STORY.springPending(G)&&(G.day++,STORY.springPending(G)));
    r=await optsOf({}); check('單身、麵店團：沒有可昕那一項',r.pend&&JSON.stringify(r.opts)==='["春假：跟阿哲他們出去","春假：留在宿舍","晚一點再決定"]',JSON.stringify(r));
    r=await optsOf({dating:true,grp:false}); check('交往中、不在麵店團：沒有麵店團那一項',r.pend&&JSON.stringify(r.opts)==='["春假：和可昕開車旅行","春假：留在宿舍","晚一點再決定"]',JSON.stringify(r)); }
  /* 三種選擇 */
  const choose=async(o,pick)=>{ setup(o); run(18,23.9); G.day=D.inv2; run(0,23.9); picks=[pick]; await STORY.springPrompt(GM); const h0=G.hour; run(h0,h0+0.3); return G; };
  { await choose({dating:true},'和可昕');
    const q=OUT.get(G,'kx_trip_y1s2');
    check('選可昕：SPRING_Y1＝kexin；4/3 07:40 木柵大學校門接她（祐廷開車：先回家取車 40 分鐘，AA_147 #1）（ev_kexin_trip_spring_y1）；沒有延到暑假',G.flags.SPRING_Y1==='kexin'&&q&&q.day===D.d0&&Math.abs(q.h-(7+40/60))<0.01&&Math.abs(q.travelH-40/60)<0.01&&/木柵大學校門/.test(q.place)&&/送她回木柵大學/.test(q.back)&&q.ev==='ev_kexin_trip_spring_y1'&&!G.flags.KX_TRIP_DEFERRED,JSON.stringify(q));
    G.day=D.d0; run(0,23); check('選可昕：麵店團照樣去，4/3 20:30 群組：以安「📷（行程表第二版）」「好，明天下午改去室內的地方，我再排一下。」（AA_209 第 8 節；AA_459 第 5 節加「明天」）、阿哲「下次你要來」',JSON.stringify(txt('g:noodle_team').filter(t=>/行程表第二版|室內的地方|下次你要來/.test(t)))==='["heroine_01:📷（行程表第二版）","heroine_01:好，明天下午改去室內的地方，我再排一下。","zhe:下次你要來"]',JSON.stringify(txt('g:noodle_team')));
    await choose({dating:true},'跟麵店團');
    check('選麵店團（交往中）：可昕回「好。那我們暑假再去，我先選地方。」「你們去哪裡，照片要傳給我。」；KX_TRIP_DEFERRED＝summer',G.flags.SPRING_Y1==='noodle'&&JSON.stringify(txt('p:kexin').slice(-2))==='["kexin:好。那我們暑假再去，我先選地方。","kexin:你們去哪裡，照片要傳給我。"]'&&G.flags.KX_TRIP_DEFERRED==='summer',JSON.stringify(txt('p:kexin').slice(-2)));
    G.day=D.d0; run(0,23.9); check('選麵店團：4/3 21:30 可昕傳和予樂的宵夜照片＋「予樂說她今天代替你。她吃得比你多。」；群組沒有「下次你要來」（你在）；可昕那一趟沒有排',JSON.stringify(txt('p:kexin').slice(-2))==='["kexin:📷（她和予樂的宵夜）","kexin:予樂說她今天代替你。她吃得比你多。"]'&&!txt('g:noodle_team').some(t=>/下次你要來/.test(t))&&!OUT.get(G,'kx_trip_y1s2'),JSON.stringify(txt('p:kexin').slice(-2)));
    await choose({dating:true},'留在宿舍');
    check('留在宿舍（交往中）：可昕回「留在宿舍？……好。那暑假我們去遠一點。」；KX_TRIP_DEFERRED＝summer',G.flags.SPRING_Y1==='dorm'&&JSON.stringify(txt('p:kexin').slice(-1))==='["kexin:留在宿舍？……好。那暑假我們去遠一點。"]'&&G.flags.KX_TRIP_DEFERRED==='summer',JSON.stringify(txt('p:kexin').slice(-1)));
    G.day=D.d0; run(0,23.9); G.day=D.d0+1; run(0,23.9);
    check('留在宿舍：4/4 16:00 可昕傳木柵大學山上的照片＋「山上都沒人，我自己爬上去了。」（AA_209）；麵店團的照片也來了',JSON.stringify(txt('p:kexin').slice(-2))==='["kexin:📷（木柵大學山上的階梯）","kexin:山上都沒人，我自己爬上去了。"]'&&txt('g:noodle_team').some(t=>/下次你要來/.test(t)),JSON.stringify(txt('p:kexin').slice(-2)));
    G.day=D.d0; G.hour=10; G.zone='dorm'; check('留在宿舍：4/3 白天走進宿舍，旁白「宿舍變得很空。」（AA 71186c7 改成只在 4/3 白天；選別的、春假以外都沒有）',EVENTS.check(eD)&&(G.flags.SPRING_Y1='noodle',!EVENTS.check(eD))&&(G.flags.SPRING_Y1='dorm',G.day=D.d0+5,!EVENTS.check(eD)));
    G.day=D.d0; G.hour=10; G.flags.SPRING_Y1='dorm'; await EVENTS.run(eD); check('宿舍的旁白一句',JSON.stringify(lines().slice(-1))==='["宿舍變得很空。"]'); }
  /* 4/2 過了還沒選 */
  { setup({dating:true}); run(18,23.9); G.day=D.inv2; run(0,23.9); G.day=D.d0; run(7,8);
    check('一直沒選、到了 4/3：算留在宿舍；可昕不回（玩家沒有回她），照片照常',G.flags.SPRING_Y1==='dorm'&&!txt('p:kexin').some(t=>/留在宿舍？/.test(t))&&G.flags.KX_TRIP_DEFERRED==='summer'&&!STORY.springPending(G),JSON.stringify(txt('p:kexin').slice(-2))); }
  /* 可昕 K8 那一趟 */
  { const trip=async(picksL,flags,extra)=>{ fresh(D.d0,8,'dorm',Object.assign({dating_kexin:true},flags||{})); if(extra) extra(); picks=picksL.slice(); await EVENTS.run(eK); return {L:lines(),O:opts}; };
    let r=await trip(['海邊','看就好']); const nm=(CHARACTERS.kexin&&CHARACTERS.kexin.name)||'杜可昕';
    check('出發：「規則。我管音樂，你管方向。」「誰都不能管對方的。……第三頁寫的，今天不算。目的地，現在決定。」（AA_373 #11）；天文課沒去：目的地只有海邊、老街',r.L[0]===nm+'：規則。我管音樂，你管方向。'&&r.L[1]===nm+'：誰都不能管對方的。……第三頁寫的，今天不算。目的地，現在決定。'&&JSON.stringify(r.O[0])==='["海邊","別的城市的老街"]',JSON.stringify(r.O[0]));
    check('海邊：「好。我要把腳弄濕。」→「水好冰。你要不要下來？」→「我在這裡看就好。」→「好，那你幫我拿鞋子。」（她又往海走了兩步。）（AA_295）→ 回程「我不睡。我要陪你開車。」（過了收費站，她睡著了。音樂還是她選的。）；KX_TRIP.Y1S2＝sea',
      JSON.stringify(r.L.slice(2))===JSON.stringify([nm+'：好。我要把腳弄濕。',nm+'：水好冰。你要不要下來？',nm+'：好，那你幫我拿鞋子。','她又往海走了兩步。',nm+'：我不睡。我要陪你開車。','過了收費站，她睡著了。音樂還是她選的。'])&&G.flags.KX_TRIP&&G.flags.KX_TRIP.Y1S2==='sea',JSON.stringify(r.L.slice(2)));
    r=await trip(['老街','都吃']); check('老街：「每一家都說自己是老店。我們去查證。」→「你想先吃哪一家？」→「都吃。」→「好。那我們要多吃幾家。」（AA_295）；oldtown',r.L.includes(nm+'：每一家都說自己是老店。我們去查證。')&&r.L.includes(nm+'：你想先吃哪一家？')&&r.L.includes(nm+'：好。那我們要多吃幾家。')&&G.flags.KX_TRIP.Y1S2==='oldtown',JSON.stringify(r.L.slice(2,5)));
    const astro=()=>{ const d=termDay('Y1S2',6,1); G.courses={done:{[d+':ge_y1s2:pm1']:1},attend:{ge_y1s2:1}}; };
    r=await trip(['山上','跟妳一起看'],{},astro);
    check('天文課第 6 週有去：多一個「山上看星星」→「看星星？……你們這禮拜上了什麼課？好，我們去驗證。」（AA_373 #11）→ 月亮那一題 →「跟妳一起看的時候。」→「好。那每天晚上都要一起看。」（AA_295）；stars',JSON.stringify(r.O[0])==='["海邊","別的城市的老街","山上看星星"]'&&r.L.includes(nm+'：看星星？……你們這禮拜上了什麼課？好，我們去驗證。')&&r.L.includes(nm+'：今天的月亮好亮。……你上次認真看月亮，是什麼時候？')&&r.L.includes(nm+'：好。那每天晚上都要一起看。')&&G.flags.KX_TRIP.Y1S2==='stars',JSON.stringify(r.O[0])+' '+JSON.stringify(CLS.attendedWeek(G,'Y1S2:ge_y1s2:w6')));
    check('一天來回、不演住宿：出遊 13.5 小時（07:40 木柵大學接她、08:00 出發，晚上送她回木柵大學、車開回家，約 21:10 回到台北）；先木柵大學校門再上車（AA_147 #1）',eK.hours===13.5&&eK.trigger==='outing'&&eK.dialogue[0].bg==='nccu_gate'&&eK.dialogue[1].bg==='car'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
