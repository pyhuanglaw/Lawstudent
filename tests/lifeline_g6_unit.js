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
    check('6-2 R1 開頭「（她第一次來你家。你媽端了一盤水果出來，放下就回廚房了。）」、場景「祐廷家・餐桌」、台詞照用',L[0]==='（她第一次來你家。你媽端了一盤水果出來，放下就回廚房了。）'&&L.includes('杜可昕：如果憲法是一間餐廳，第七條是什麼菜？')&&J(ev('ev_y0_r1').dialogue).includes('祐廷家・餐桌')&&!J(ev('ev_y0_r1').dialogue).includes('博雅'),J(L.slice(0,3))); }
  check('6-2 S1、S2 改字：「你又比我早起。……說好不可以的。」「你讀到哪了？……三章？我才讀到第二章。」；不再有「我是去上課」「剛上完會計」',J(STORY.RS[0].t)===J(['「你又比我早起。……說好不可以的。」'])&&STORY.RS[1].t[1]==='「你讀到哪了？……三章？我才讀到第二章。」'&&!J(ev('ev_y0_rs').dialogue).includes('去上課')&&!J(ev('ev_y0_rs').dialogue).includes('會計'));
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
    check('6-5 21:00 在家：他家樓下「（你家樓下。她要回家了。路燈。她手上拿著准考證，翻過來又翻回去。）」、E35_MET、沒有回家的移動（他已經在家）',!a&&b&&L[0]==='（你家樓下。她要回家了。路燈。她手上拿著准考證，翻過來又翻回去。）'&&G.flags.E35_MET===true&&!ev('ev_y0_e35h').after,J([a,b,L[0]])); }
  { const d=DK('2025-07-10'); econ(d,21.6,'campus',{E35_ASKED:true},false); G.home={at:false}; run(21.6,21.7);
    check('6-5 21:30 以後人在外面：電話版（E35_PHONE、在外面自動演）',G.flags.E35_PHONE===true&&EVENTS.check(ev('ev_y0_e35'))); }
  /* E36 */
  { const d=DK('2025-08-13'); econ(d,10,'home',{}); await EVENTS.run(ev('ev_y0_e36rh')); const L=lines();
    check('6-6 E36 早上三句：「（臺大法律學系，財經法學組。你的名字在上面。）」「（分數只比那一組的錄取分數高 0.1。）」',J(L)===J(['（八月十三日，早上十點。榜單公布了。）','（臺大法律學系，財經法學組。你的名字在上面。）','（分數只比那一組的錄取分數高 0.1。）']),J(L));
    const D=ev('ev_y0_e36').dialogue.map(x=>x.text); const i=D.indexOf('台大法律。恭喜你。真的。');
    check('6-6 E36 晚上：「台大法律。恭喜你。真的。」→ 祐廷「只高 0.1。」→「上了就是上了。」→「我是政大法律。」',D[i+1]==='只高 0.1。'&&D[i+2]==='上了就是上了。'&&D[i+3]==='我是政大法律。'); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
