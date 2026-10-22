// 交接包 v3 D11：大二系籃（AA_143 1-5、AA_177 4-4）＋語 3「在一起」（AA_40）——不需要瀏覽器。
// 檢查：12/18 21:00 阿哲揪＋出發選單 12/19 14:00；系籃三選一、WATCHED_GAME；賽後麵店語 3 的四句、小語和阿哲的伴侶期間從語 3 開始；都沒去＝22:00 小語私訊三則／不認識小語＝阿哲的照片；主線 4 小語「聖誕禮物」在語 3 以後。用法：node tests/v3_d11_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const NM={'小語':'小語','阿哲':'阿哲'}; const L0=()=>lines();
  const d18=D('2026-12-18'), d19=D('2026-12-19');
  check('0. 12/19 是大二上第 15 週週六',CALENDAR.termOf(d19).week===15&&wdOf(d19)===6);
  fresh(d18,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); const o=OUT.get(G,'y2_ball');
  check('1. 12/18 21:00 麵店團群組阿哲「明天下午兩點，系籃，新體育館。來喊。」＋出發選單 12/19 14:00',txt('g:noodle_team').includes('zhe:明天下午兩點，系籃，新體育館。來喊。')&&!!o&&o.day===d19&&o.h===14&&o.ev==='ev_zhe_game_y2',JSON.stringify([txt('g:noodle_team'),o]));
  const Gm=ev('ev_zhe_game_y2'); fresh(d19,14,'campus'); meet('heroine_01'); const k0=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01'].includes(id); said=[]; picks=[1]; await EVENTS.run(Gm); STORY.knows=k0; let L=L0();
  check('2. 系籃大二版（AA-B c2f1c5aa）：以安、小語在觀眾席、加油板「17 號，不要犯規。」；記分＝「今年一次都沒翻錯。」以安「翻分的規則在第十二頁。我標起來了。」；WATCHED_GAME_Y2',L.includes('（以安在觀眾席看規則手冊。）')&&L.includes('（小語的加油板上寫著：『17 號，不要犯規。』）')&&L.includes('你坐到記分台，今年一次都沒翻錯。')&&L.some(t=>/翻分的規則在第十二頁。我標起來了。/.test(t))&&SOCIAL.has('zhe','WATCHED_GAME_Y2'),JSON.stringify(L));
  const Y=ev('ev_yu_together'); { fresh(d19,19,'noodle'); G.flags.met_yu=true; const a=EVENTS.check(Y); fresh(d19,17,'noodle'); G.flags.met_yu=true; const b=EVENTS.check(Y); fresh(d19+7,19,'noodle'); G.flags.met_yu=true; const c=EVENTS.check(Y);
    check('3. 語 3：12/19 19:00 麵店、認識小語＝會演；17:00、下週六不演',a&&!b&&!c); }
  fresh(d19,19,'noodle'); G.flags.met_yu=true; meet('yu'); said=[]; await EVENTS.run(Y); L=L0();
  check('3. 小語四句照 AA_40；之後她和阿哲的伴侶期間開始（startEvent）',L.length===4&&L[1]==='小語：我跟阿哲在一起了。'&&L[3]==='小語：……可是我覺得很好。以後週二週四，我都有人一起回家了。'&&CHARACTERS.yu.partner.startEvent==='ev_yu_together'&&STORY.partnerOn(G,CHARACTERS.yu.partner),JSON.stringify(L));
  fresh(d19,21,'dorm'); G.flags.met_yu=true; run(21,22.2); const dm=txt('p:yu');
  check('4. 都沒去、認識小語：22:00 小語私訊三則',JSON.stringify(dm)===JSON.stringify(['yu:欸，跟你說一件事。你不要叫。','yu:我跟阿哲在一起了。','yu:他說『沒事啦，就在一起啊』。哪有人這樣告白的。'])&&G.flags.YU_ZHE_TOLD==='msg',JSON.stringify(dm));
  fresh(d19,21,'dorm'); PHONE.join(G,'noodle_team','麵店團'); const k1=STORY.knows; STORY.knows=id=>id==='zhe'; run(21,22.2); STORY.knows=k1;
  check('4. 都沒去、不認識小語、在麵店團：22:00 阿哲的照片',txt('g:noodle_team').includes('zhe:📷（麵店的長桌。小語比了一個 YA。）'),JSON.stringify(txt('g:noodle_team')));
  fresh(d19,21,'dorm'); G.flags.met_yu=true; G.events.done.ev_yu_together=1; run(21,22.2); check('4. 去了麵店：沒有私訊',!txt('p:yu').length);
  const g=NEEDED_MSGS.list.find(x=>x.id==='yu_gift'); check('5. 主線 4 小語「聖誕禮物」在語 3 以後（演過或收到訊息）',!g.cond({flags:{},events:{done:{}}})&&g.cond({flags:{},events:{done:{ev_yu_together:1}}})&&g.cond({flags:{YU_ZHE_TOLD:'msg'},events:{done:{}}}));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
