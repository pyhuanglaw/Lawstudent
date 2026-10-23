// AA_178（AA-B cc40f441）大一下 AA 事件的五件修正：①阿姨的說話人、只在大一下 ②圖書館三樓 20:30～22:00 ③吵架在場版要以安、Alison 都認識 ④重訪日「每個禮拜二、四都來」＝這一年麵店 ≥ 10 天 ⑤博雅小桌的常客——不需要瀏覽器。
// 修改前 ②～⑤ 失敗。用法：node tests/v2_aa178_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const wk=(term,w,wd)=>termDay(term,w,wd);
  // ①
  { const e=ev('ev_yutong_absent'); check('① ev_yutong_absent：term 只有 Y1S2；阿姨兩句的說話人＝阿姨',JSON.stringify(e.term)==='["Y1S2"]'&&e.dialogue.filter(l=>l.speaker==='阿姨'&&!l.if).length===2); }
  /* 交往中的版本（AA_11 事件 4、5；AA-C e2bdcece，AA_215／AA_216 大一下 #3、#4）*/
  { const e4=ev('ev_yutong_absent'), e5=ev('ev_yutong_thanks'), d=wk('Y1S2',8,2), T=()=>said.map(x=>x.t);
    fresh(d,18,'noodle'); await EVENTS.run(e4); const L0=T(), m0=(G.social.mem.heroine_03||[]).map(m=>m.note).join('|');
    fresh(d,18,'noodle'); G.flags.dating_heroine_03=true; await EVENTS.run(e4); const L1=T(), m1=(G.social.mem.heroine_03||[]).map(m=>m.note).join('|');
    check('③ 事件 4 交往中：阿姨第二句換成「你是語彤那個喔。」「她沒跟你講齁……」「你吃你的……」；記憶多「阿姨說她怕你來幫忙」；沒交往照舊',L1.includes('（看了你一下）你是語彤那個喔。')&&L1.includes('你吃你的。不要跟她說是我講的。')&&!L1.includes('你是她同學喔？她喔，累了也不會講。')&&L0.includes('你是她同學喔？她喔，累了也不會講。')&&!L0.some(t=>/語彤那個/.test(t))&&/怕你來幫忙/.test(m1)&&!/怕你來幫忙/.test(m0),JSON.stringify([L1,m1]));
    fresh(d,21.2,'library'); G.flags.yutong_hospital=true; G.flags.dating_heroine_03=true; picks=['回去睡']; await EVENTS.run(e5); const L2=T();
    fresh(d,21.2,'library'); G.flags.yutong_hospital=true; picks=['回去睡']; await EVENTS.run(e5); const L3=T();
    check('③ 事件 5 交往中：第一句後「我叫她不要講的。」、結尾「（她把書推到一邊，趴在桌上。）」「閉館的時候叫我。」；沒交往沒有',L2[1]==='我叫她不要講的。'&&L2.slice(-2).join('|')==='（她把書推到一邊，趴在桌上。）|閉館的時候叫我。'&&!L3.includes('我叫她不要講的。')&&!L3.includes('閉館的時候叫我。'),JSON.stringify([L2,L3])); }
  // ②
  { const e=ev('ev_yutong_thanks'); const d=wk('Y1S2',10,2); const ck=h=>{ fresh(d,h,'library'); SOCIAL.meet('heroine_03','campus'); G.flags.yutong_hospital=true; return EVENTS.check(e); };
    check('② ev_yutong_thanks：21:00～22:00 才有（麵店 21:00 打烊；20:45、22:30 沒有）',ck(21.2)&&!ck(20.75)&&!ck(22.5)); }
  // ③
  { const e=ev('ev_an_yu_argument'), d=wk('Y1S2',12,4); const ck=(an,yu)=>{ fresh(d,20,'wancai'); SOCIAL.meet('heroine_01','campus'); R('heroine_01',an); SOCIAL.meet('yu','noodle'); R('yu',yu); return EVENTS.check(e,{chain:true}); };   /* 2026-10-17 改到第 12 週週四公法讀書會（AA_238 5-3）*/
    check('③ 吵架在場版：以安、Alison 都 ACQUAINTANCE 以上才演（Alison 還不熟＝不演）',ck(10,10)&&!ck(10,0)&&!ck(0,10)); }
  // ④
  { const e=ev('ev_revisit_y1_noodle'), line='我最意外的是，你真的每個禮拜二、四都來。', L=e.dialogue.find(l=>l.text===line);
    const ok=(days,old)=>{ fresh(wk('Y1S2',18,3),19,'cafe'); if(old){ G.flags.ndlDays=[5]; } else { G.habits={'meal:noodle':{n:days,first:1,last:days,days:Array.from({length:days},(_,i)=>i+2)}}; } return EVENTS.cond(L.if); };
    check('④ 重訪日 1 改成麵店群戲（AA_209 第 3 節，拿掉「這一年最意外」）：阿哲「每個禮拜二、四都來」那句已經不在',!L); }
  // ⑤
  { const e=ev('ev_y1_boya_regular'); const a=wk('Y1S2',11,1); const sat=n=>{ fresh(a+n,14,'boya'); G.habits={'seat:boya:study':{n:3,days:[a,a+2,a+n].slice(0,3)}}; return EVENTS.check(e); };
    check('⑤ 博雅小桌的常客：第 11～12 週內第三天坐下＝「你又在這裡。」；只坐兩天不演',!!e&&e.trigger==='seat'&&e.seatRoom==='study'&&e.dialogue[0].text==='你又在這裡。'&&sat(5)&&(()=>{ fresh(a+5,14,'boya'); G.habits={'seat:boya:study':{n:2,days:[a,a+5]}}; return !EVENTS.check(e); })());
    check('⑤ 第 10 週坐的不算',(()=>{ fresh(a+5,14,'boya'); G.habits={'seat:boya:study':{n:3,days:[a-3,a-1,a+5]}}; return !EVENTS.check(e); })()); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
