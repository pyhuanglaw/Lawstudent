// LIFE-LINE 第 4 組（AA_224 4-1～4-3 @31708531；機制 BB_188 A9-1）——不需要瀏覽器。
// 12/12 22:00 小吵架的電話（沒有選項；在家／在外面都會接到、睡著叫醒）→ 12/13 14:00 以後以前的補習班（一定發生、CRAM_FREE_KNOWN）→ 當晚 21:00 祐廷傳給可昕；
// 可昕記錯大一國文作業 1/3、1/6、1/11（KX_THINK_LEAVE）；除夕的電話在外面也會接到（E21_CALLED，兩個只演一個）。改版前會失敗。用法：node tests/lifeline_g4_unit.js
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
  const econ=(day,hour,zone,flags)=>{ fresh(day,hour,zone,Object.assign({dating_kexin:true,Y0_DATING:true,KX_CAR:'only_me',LEAVE_WEEK:6,Y0_MOVED_OUT:true},flags||{})); G.stage='econ'; G.flags.LIFELINE_V=1; };
  /* 4-1 */
  { const d=DK('2024-12-12'); econ(d,21.9,'campus',{}); const a=EVENTS.check(ev('ev_y0_fight')); G.hour=22; const b=EVENTS.check(ev('ev_y0_fight'));
    await EVENTS.run(ev('ev_y0_fight')); const L=lines();
    check('4-1 12/12 22:00 電話（22:00 以前不會）：「我明天早上九點有小考。你剛剛傳了三則貓的影片。」…「（你沒有馬上回。）」…「我知道。……妳去讀書。」；沒有選項',!a&&b&&L[0]==='杜可昕：我明天早上九點有小考。你剛剛傳了三則貓的影片。'&&L.includes('（你沒有馬上回。）')&&L[L.length-1]==='祐廷：我知道。……妳去讀書。'&&opts.length===0,J(L));
    check('4-1 演過以後在家的那一個不會再演',!EVENTS.check(ev('ev_y0_fight_h')));
    econ(d,20,'home',{}); check('4-1 睡著：coreCallAt 停在 22:00',STORY.coreCallAt(G)===22); }
  /* 4-2 */
  { const d=DK('2024-12-13'); econ(d,13.9,'campus',{}); const a=EVENTS.check(ev('ev_y0_cram')); G.hour=14.2; const b=EVENTS.check(ev('ev_y0_cram'));
    picks=['只是來問問']; await EVENTS.run(ev('ev_y0_cram')); const L=lines();
    check('4-2 12/13 14:00 以後（以前不會）：「高三那年，分科測驗前兩天的晚上……」（AA_368 L4：原本「指考」）…工作人員「……你是{name}嗎？」（AA_368 L5：原本寫死「祐廷」）「主任走之前交代過，說你會來。」「……你這樣可以免費。」（AA_272 8-4）→「好。這是簡章。」→ 兩句動作旁白、CRAM_FREE_KNOWN',!a&&b&&L.includes('高三那年，分科測驗前兩天的晚上，你在這裡傳紙條、鬧了一整節，被主任請出去。隔天去看考場，再隔天考試。')&&!L.some(t=>/指考/.test(t))&&L.includes('工作人員：……你是'+G.name+'嗎？')&&JSON.stringify(STORY_EVENTS.find(x=>x.id==='ev_y0_cram').dialogue).includes('……你是{name}嗎？')&&L.includes('工作人員：主任走之前交代過，說你會來。')&&L.includes('工作人員：你要問重考班對吧。我看一下你上次的成績。……你這樣可以免費。')&&L.includes('工作人員：好。這是簡章。')&&L.slice(-2).join('｜')==='（回去的捷運上，你把簡章翻了兩遍。）｜（然後你查了今年首都帝大法律的錄取分數，看了很久。）'&&G.flags.CRAM_FREE_KNOWN===true,J(L.slice(-5)));
    check('4-2 沒有「你發現自己一直在想去年首都帝大法律的分數」「還沒決定」；演過以後不再演',!L.join('').includes('去年首都帝大法律')&&!L.join('').includes('還沒決定')&&!EVENTS.check(ev('ev_y0_cram'))&&!EVENTS.check(ev('ev_y0_cram_h')));
    G.hour=20.9; run(20.9,21.1); const m=txt('p:kexin');
    check('4-2 當晚 21:00：祐廷「我今天去以前的補習班。等主任走了才進去。」「然後櫃台說，主任交代過我會來。」→「哈哈哈哈哈哈」「……那你要去嗎？」→「還不知道。」→「好。」',J(m)===J(['player:我今天去以前的補習班。等主任走了才進去。','player:然後櫃台說，主任交代過我會來。','kexin:哈哈哈哈哈哈','kexin:……那你要去嗎？','player:還不知道。','kexin:好。']),J(m)); }
  { const d=DK('2024-12-13'); econ(d,15,'home',{}); check('4-2 在家：home 版的 ev_y0_cram_h 可以演（同一段）',EVENTS.check(ev('ev_y0_cram_h'))&&J(ev('ev_y0_cram_h').dialogue)===J(ev('ev_y0_cram').dialogue)); }
  /* 4-3 */
  { econ(DK('2025-01-03'),20.9,'home',{}); run(20.9,21.1); const m=(G.msgs||[]).filter(x=>x.th==='p:kexin'), q=m.find(x=>x.ask);
    check('4-3 1/3 21:00：截圖、「國文的期末報告。整科就這一份，一百分。」（AA_272 第 9 節 ae4806a9）、「我以為是下週五。」「是上週五。」＋三個選項；第三個「我在社科院一樓。」（他不能進總圖）',m.length===4&&m[1].text==='國文的期末報告。整科就這一份，一百分。'&&m[2].text==='我以為是下週五。'&&q&&J(q.ask.opts.map(o=>o.t))===J(['寄信問葉老師？','妳先不要慌。','要不要我現在過去？'])&&J(q.ask.opts[2].say).includes('我在社科院一樓。'),J(m.map(x=>x.text)));
    check('4-3 AA_368 L8：第三個選項「要不要我現在過去？」→「你又沒事。……好啦，來。我在社科院一樓。」（原本「你又沒課。」）',!!q&&q.ask.opts[2].say[0].text==='你又沒事。……好啦，來。我在社科院一樓。'&&!J(q.ask.opts).includes('你又沒課'),q&&q.ask.opts[2].say[0].text);
    G.day=DK('2025-01-06'); run(20.9,21.1); check('4-3 1/6 21:00：葉老師回了（沒有選項）',txt('p:kexin').includes('kexin:很客氣。說不能補交，對每個人都一樣。'));
    G.day=DK('2025-01-11'); run(21.9,22.1); const q3=(G.msgs||[]).find(x=>x.tag==='y0_kx_essay3'&&x.ask);
    check('4-3 1/11 22:00：「沒交就是零分。整科零分。」「這科一定會被當。」「我不想要成績單上有一個不及格。」→「我在想要不要休學。」＋三個選項、記 KX_THINK_LEAVE；沒有「可能會被當」',(()=>{ const z=(G.msgs||[]).filter(x=>x.tag==='y0_kx_essay3').map(x=>x.text); return J(z.slice(0,4))===J(['沒交就是零分。整科零分。','這科一定會被當。','我不想要成績單上有一個不及格。','我在想要不要休學。']); })()&&!txt('p:kexin').join('').includes('可能會被當')&&!!q3&&q3.text==='我在想要不要休學。'&&q3.ask.opts.length===3&&!!G.flags.KX_THINK_LEAVE);
    PHONE.answer(G,'y0_kx_essay3',1); run(22.1,22.3); const t=txt('p:kexin');
    check('4-3 選「休學的生活還可以……」：「……你是在安慰我還是在炫耀。」→ 祐廷「都有。」、KX_THINK_LEAVE＝sleep',t.includes('kexin:……你是在安慰我還是在炫耀。')&&t.includes('player:都有。')&&G.flags.KX_THINK_LEAVE==='sleep',J(t.slice(-3))); }
  /* E21 在外面 */
  { const d=DK('2025-01-28'); econ(d,22,'campus',{}); const o=EVENTS.check(ev('ev_y0_e21o')); await EVENTS.run(ev('ev_y0_e21o'));
    check('3-10 除夕 22:00 人在外面：ev_y0_e21o 接電話；演過以後在家的那一個不再演（E21_CALLED）',o&&G.flags.E21_CALLED===true&&!EVENTS.check(ev('ev_y0_e21'))&&!EVENTS.check(ev('ev_y0_e21o')));
    econ(d,21,'home',{}); check('3-10 睡著：coreCallAt 停在 22:00',STORY.coreCallAt(G)===22); }
  /* 舊存檔 */
  { const mk=(day,flags,done)=>{ const s={day,hour:12,stage:'econ',flags:Object.assign({},flags),events:{done:Object.assign({},done||{}),last:{},count:0},outings:[]}; STORY.lifeLineMigrate(s); return s; };
    const a=mk(DK('2024-12-20'),{CRAM_FREE_KNOWN:true},{ev_y0_cram_h:1}), b=mk(DK('2024-12-20'),{});
    check('A9-2 舊存檔：在家演過補習班（ev_y0_cram_h）＝不重記；沒演過、已經過了 12/13＝當作演過、CRAM_FREE_KNOWN',!a.events.done.ev_y0_cram&&b.flags.CRAM_FREE_KNOWN===true&&!!b.events.done.ev_y0_cram); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
