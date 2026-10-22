// 誰知道祐廷在和可昕交往（knowsGF；BB_191 第 9 節 @08429294、9-4 程式要改的地方；使用者 2026-10-17「大家一開始都不知道祐廷有女友」）——不需要瀏覽器。
// 台大角色的台詞、選項、條件讀「她知道」（ROM.gfNow／ROM.knows），不讀 dating_kexin：
// A K3 選①在場的人才知道（阿哲一定在、其他人要認識）；選②③誰都不知道。B 芷若 Z5：她不知道＝兩個人的版本；知道＝方奕廷也去。
// C 沛珊三段論：她不知道＝「去 Café？我請你。」。D 沛珊 P4b：她知道才開「陪重考生念書」小組。E 芷若早場：她不知道＝WATCHED_FILM（兩個人）。F 芷若午場的訊息：她知道才多「方奕廷也去。」
// 改版前（KEXIN_KNOWN／讀 dating_kexin）：A 的語彤／沛珊、B、C、D、E、F 都會失敗。用法：node tests/knows_gf_unit.js
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
  /* ---------- A K3 中秋烤肉 ---------- */
  const k3=ev('ev_mid_autumn_bbq'), d5=termDay('Y1S1',5,6);
  { fresh(d5,15,'campus',{dating_kexin:true,KX_BBQ_COME:true,ECON_PAST_SHARED:'full'}); meet('zhe'); meet('heroine_01'); meet('classmate_bohan'); picks=['我大一歲','這是可昕']; await EVENTS.run(k3);
    const K=G.flags.knowsRel||{};
    check('A. K3 選①「這是可昕，我女朋友。」：阿哲、在場的以安、柏翰知道（source ev_mid_autumn_bbq、他也知道他們知道）',G.flags.KX_INTRO==='gf'&&['zhe','heroine_01','classmate_bohan'].every(x=>ROM.knowsGF(G,x)&&K[x].kexin.source==='ev_mid_autumn_bbq'&&ROM.ytKnows(G,x,'kexin')),JSON.stringify(K));
    check('A. 不認識的語彤、Alison、方奕廷，不在 K3 的沛珊、芷若、子晴、學姊：不知道',['heroine_03','yu','npc_fangyt','classmate_peishan','heroine_02','heroine_04','heroine_05'].every(x=>!ROM.knowsGF(G,x)));
    check('A. KX_MET_NOODLE_TEAM 照設（可昕那邊的台詞用）',G.flags.KX_MET_NOODLE_TEAM===true); }
  { fresh(d5,15,'campus',{dating_kexin:true,KX_BBQ_COME:true,ECON_PAST_SHARED:'full'}); meet('zhe'); meet('heroine_01'); meet('heroine_03'); picks=['我大一歲','她會出題']; await EVENTS.run(k3);
    check('A. K3 選②「她會出題考你們。」：誰都不知道（阿凱除外）',G.flags.KX_INTRO==='quiz'&&['zhe','heroine_01','heroine_03'].every(x=>!ROM.knowsGF(G,x))&&ROM.knowsGF(G,'kai')); }
  /* ---------- B 芷若 Z5 週末看片 ---------- */
  const z5=ev('ev_zhiruo_film_night'), fri12=termDay('Y1S2',12,5);
  { fresh(fri12,20,'cafe',{dating_kexin:true}); meet('heroine_02'); picks=['幾點']; await EVENTS.run(z5); const L=lines().join('｜');
    check('B. 和可昕交往中、芷若不知道：兩個人的版本（「你要不要一起？」，沒有方奕廷）',L.includes('你要不要一起？')&&!L.includes('方奕廷也去'),L.slice(0,160)); }
  { fresh(fri12,20,'cafe',{dating_kexin:true}); meet('heroine_02'); ROM.learn(G,'heroine_02','kexin','yt_told'); picks=['幾點']; await EVENTS.run(z5); const L=lines().join('｜');
    check('B. 芷若知道：三個人的版本（「方奕廷也去。」）',L.includes('方奕廷也去'),L.slice(0,160)); }
  { fresh(fri12,20,'cafe',{}); meet('heroine_02'); picks=['幾點']; await EVENTS.run(z5);
    check('B. 單身：兩個人的版本',lines().join('｜').includes('你要不要一起？')); }
  /* ---------- C 沛珊三段論 ---------- */
  const sy=ev('ev_peishan_syllogism'), w6=termDay('Y1S1',6,2);
  { fresh(w6,17,'library',{dating_kexin:true}); meet('classmate_peishan'); await EVENTS.run(sy); const L=lines().join('｜');
    check('C. 大一上第 6 週、和可昕交往中：沛珊不可能知道＝「去 Café？我請你。」（9-4 #3）',L.includes('去 Café？我請你。')&&!L.includes('去外面講'),L.slice(0,120)); }
  { fresh(w6,17,'library',{dating_kexin:true}); meet('classmate_peishan'); ROM.learn(G,'classmate_peishan','kexin','told_by:heroine_01'); await EVENTS.run(sy);
    check('C. 她知道（聽以安說）：「去外面講。」',lines().join('｜').includes('去外面講')); }
  /* ---------- D 沛珊 P4b ---------- */
  const fri2=termDay('Y2S2',2,5);
  const p4b=async(know)=>{ fresh(fri2,20.5,'dorm',{dating_kexin:true}); meet('classmate_peishan'); SOCIAL.remember('classmate_peishan','MIRROR_PEISHAN',''); if(know) ROM.learn(G,'classmate_peishan','kexin','yt_told'); run(20.5,22); return {group:!!G.flags.PS_P4B_GROUP,ask:PHONE.sent(G,'ps_p4b')}; };
  { const a=await p4b(false), b=await p4b(true);
    check('D. 大二下 P4b：沛珊的消失期（BB_205 第 3 節），知不知道都不發、不開小組',!a.ask&&!a.group&&!b.ask&&!b.group,JSON.stringify([a,b])); }
  /* ---------- E 芷若早場 ---------- */
  const es=ev('ev_zhiruo_early_show');
  { fresh(fri12+1,9.7,'gongguan',{dating_kexin:true,zhiruo_film_date:true}); meet('heroine_02'); await EVENTS.run(es);
    check('E. 早場、她不知道：兩個人（WATCHED_FILM，不是 GROUP）',SOCIAL.has('heroine_02','WATCHED_FILM')&&!SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')); }
  { fresh(fri12+1,9.7,'gongguan',{dating_kexin:true,zhiruo_film_date:true}); meet('heroine_02'); ROM.learn(G,'heroine_02','kexin','yt_told'); await EVENTS.run(es);
    check('E. 早場、她知道：三個人（WATCHED_FILM_GROUP）',SOCIAL.has('heroine_02','WATCHED_FILM_GROUP')&&!SOCIAL.has('heroine_02','WATCHED_FILM')); }
  /* ---------- F 芷若午場的訊息 ---------- */
  const fri9=termDay('Y1S2',9,5), ms=fri9+22;
  const mat=(know)=>{ fresh(ms,9,'dorm',{dating_kexin:true,zrDeclineDay:fri9}); meet('heroine_02'); if(know) ROM.learn(G,'heroine_02','kexin','yt_told'); run(9,10); return txt('p:heroine_02').join('｜'); };
  { const a=mat(false), b=mat(true);
    check('F. 午場的訊息：她不知道＝兩則（沒有「方奕廷也去。」）；知道＝多一句',a.includes('今天有午場')&&!a.includes('方奕廷也去')&&b.includes('方奕廷也去'),a+' ‖ '+b); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
