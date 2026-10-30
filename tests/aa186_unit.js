// AA_186 第 6 節裡「不改字」的修正（AA-B 19:1x：使用者要求新寫的台詞先暫停，等口語準則確認；條件、一次性、旁白人稱、小福照做）——不需要瀏覽器。
// 檢查：A ev_noodle_yutong once、ev_an_library_study max_times 2（開場不改）；C「妳們和好了？」要看過那一場、ev_an_study_group 改讀公法讀書會、語彤 Y5-L6 等續約；D E25 旁白用「你」、大一下的小福改活大；主線 4 模擬法庭與 Z7 的訊息接上條件。用法：node tests/aa186_unit.js
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
  const ev2=id=>STORY_EVENTS.find(e=>e.id===id), J=x=>JSON.stringify(x), txt1=id=>J(ev2(id).dialogue);
  check('A1. ev_noodle_yutong 只演一次',ev2('ev_noodle_yutong').once===true);
  check('A2. ev_an_library_study 最多兩次；開場句沒有改（等新準則）',ev2('ev_an_library_study').max_times===2&&/這裡有位子。你要讀什麼/.test(txt1('ev_an_library_study'))&&!/位子還在/.test(txt1('ev_an_library_study')));
  check('B. 暫停的改寫沒有進來（B4 後半場、值班那一句照舊）',/你後半場不在。最精彩的你錯過了/.test(txt1('ev_b4_partial_an'))&&/……我只問了一句。/.test(txt1('ev_y2_yt_duty_heard')));
  const A2=LADDER.byTerm.Y1S2.heroine_01.steps.find(s=>s.id==='A2-L6');
  fresh(D('2026-05-11'),12,'campus');
  // 2026-10-17 AA_238 5-5（25e89f6e）：讀書會改到大一上，A2-L6 改成大一下的讀書會；「妳們和好了？」只給看過吵架（ev_an_yu_argument）的玩家；「我可以去嗎？」搬到大一上 A-L11（去過公法讀書會的不出現）
  check('C1. 新版 A2-L6 沒看過吵架：只有「Alison 還是每次都帶宵夜？」',J(STORY.ladChoices(A2).map(c=>c.t))==='["「Alison 還是每次都帶宵夜？」"]',J(STORY.ladChoices(A2).map(c=>c.t)));
  G.events.done.ev_an_yu_argument=1;
  check('C1. 看過吵架：「妳們和好了？」也出現',J(STORY.ladChoices(A2).map(c=>c.t))==='["「妳們和好了？」","「Alison 還是每次都帶宵夜？」"]',J(STORY.ladChoices(A2).map(c=>c.t)));
  { const L11=LADDER.byTerm.Y1S1.heroine_01.steps.find(s=>s.id==='A-L11'); delete G.events.done.ev_public_law_group;
    check('C2. 大一上 A-L11 沒去過公法讀書會：兩個選項都有（含「我可以去嗎？」）',J(STORY.ladChoices(L11).map(c=>c.t))==='["「Alison 也會去？」","「我可以去嗎？」"]',J(STORY.ladChoices(L11).map(c=>c.t)));
    G.events.done.ev_public_law_group=1;
    check('C2. 去過公法讀書會：「我可以去嗎？」不出現；linesIf 換成讀書會那一套',J(STORY.ladChoices(L11).map(c=>c.t))==='["「Alison 也會去？」"]'&&J(STORY.ladLines(L11,G,'heroine_01'))===J(L11.linesIf[0].lines)&&L11.linesIf[0].if.events[0]==='ev_public_law_group'); }
  check('C2. 舊資料的 ev_an_study_group 照舊讀成公法讀書會（LADDER_EVENT_ALIAS）',J(STORY.ladLines({id:'X',lines:['舊'],linesIf:[{if:{events:['ev_an_study_group']},lines:['新']}]},G,'heroine_01'))==='["新"]');
  check('C3. 語彤 Y5-L6 等續約（RENT_RENEWED）',!STORY.LADDER_HOLD['Y5-L6']({flags:{}})&&STORY.LADDER_HOLD['Y5-L6']({flags:{RENT_RENEWED:true}}));
  check('D1. E25 旁白用「你」',/她笑著打你的手臂/.test(txt1('ev_y0_e25'))&&/她拉住你的袖子/.test(txt1('ev_y0_e25'))&&!/打他的手臂|拉住他的袖子/.test(txt1('ev_y0_e25')));
  check('D2. SK03（大一下）是學活',ev2('ev_sk03_lunch').title==='週五的學活'&&!/小松/.test(txt1('ev_sk03_lunch')));
  const cls=require('fs').readFileSync(require('path').join(ROOT,'src/classes3d.js'),'utf8');
  check('D3. 午餐選單：大一下起學活的自助餐',/學活的自助餐，夾了三樣菜/.test(cls));
  const NL=NEEDED_MSGS.list;
  check('E. 主線 4：Z7 的訊息接上條件（不再是 NOT_YET）；模擬法庭三則換掉（AA_179 516ba348）',(()=>{ const e=NL.find(x=>x.id==='zr_beans'); return !!e&&e.cond&&e.cond.toString().indexOf('NOT_YET')<0&&e.cond.toString()!=='()=>false'; })()&&['an_moot','bh_moot','xc_moot'].every(id=>!NL.find(x=>x.id===id))&&['an_topics','bh_scores','xc_notes'].every(id=>!!NL.find(x=>x.id===id)));   /* AA_179（516ba348）：模擬法庭三則換成讀書會題目、分數表、筆記 */
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
