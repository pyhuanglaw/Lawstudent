// V3-D3 迎新（大二，小隊輔；AA_143 1-3、AA_177 第 6、9 節）＋「法律系（全班）」群組 law_class——不需要瀏覽器。用法：node tests/v3_welcome_unit.js
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
let notes=[]; GM.addNote=(id,t,b)=>{ notes.push({id,t,b}); return true; };
(async()=>{
  const e=ev('ev_y2_welcome'); if(!e){ console.log('FAIL 0. 沒有 ev_y2_welcome'); console.log('FAILED 1'); process.exit(1); }
  // 1. 群組
  fresh(1,15,'campus',{}); G.stage='law'; STORY.phoneRules(GM); check('1. 新遊戲第 1 天 21:00 以前還沒有群組',!PHONE.inGroup(G,'law_class'));
  G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G); const sys=(G.msgs||[]).find(m=>m.tag==='law_class_join');
  check('1. 第 1 天 21:00：加入「法律系（全班）」＋系統字「你被加進「法律系（全班）」。」',PHONE.inGroup(G,'law_class')&&G.phone.groups.law_class.name==='法律系（全班）'&&!!sys&&sys.text==='你被加進「法律系（全班）」。'&&!sys.from);
  fresh(40,10,'campus',{}); G.stage='law'; STORY.phoneRules(GM); PHONE.tick(G);
  check('1. 舊存檔（第 40 天）：補加入、day 記第 1 天、不跳系統字',PHONE.inGroup(G,'law_class')&&G.phone.groups.law_class.day===1&&!(G.msgs||[]).some(m=>m.tag==='law_class_join'));
  fresh(-300,10,'campus',{}); G.stage='econ'; STORY.phoneRules(GM); check('1. 經濟系那一年沒有',!PHONE.inGroup(G,'law_class'));
  // 2. 邀約、出發選單、沒去的照片
  const d=D('2026-09-06'), di=D('2026-09-04');   /* AA_310 第 2 節：迎新改到開學前（原本 10/1 公告、10/3 出遊）*/
  fresh(di,20,'campus',{}); G.stage='law'; STORY.phoneRules(GM); check('2. 9/4 21:00 以前沒有',!PHONE.sent(G,'y2_welcome_ask'));
  G.hour=21.05; STORY.phoneRules(GM); PHONE.tick(G); const inv=(G.msgs||[]).find(m=>m.tag==='y2_welcome_ask'); const q=OUT.get(G,'y2_welcome');
  check('2. 9/4（五）21:00 系學會在 law_class：「禮拜天迎新，小隊輔兩點在社科院旁的草地集合。」；9/6（日）14:00 出發選單（晚 15 分鐘）',!!inv&&inv.th==='g:law_class'&&inv.name==='系學會'&&inv.text==='禮拜天迎新，小隊輔兩點在社科院旁的草地集合。'&&!!q&&q.day===d&&q.h===14&&q.late===0.25&&q.ev==='ev_y2_welcome');
  q.state='missed'; G.day=d; G.hour=21.6; STORY.phoneRules(GM); PHONE.tick(G); const ph=(G.msgs||[]).find(m=>m.tag==='y2_welcome_photo');
  check('2. 沒去：21:30 群組照片「📷（一群新生圍成一圈，手上拿著名牌。）」',!!ph&&ph.text==='📷（一群新生圍成一圈，手上拿著名牌。）'&&ph.th==='g:law_class');
  // 3. 事件
  const play=async(whyLaw,pk)=>{ fresh(d,14,'campus',whyLaw?{whyLaw}:{}); G.stage='law'; meet('zhe'); R('zhe',30,0,0); notes=[]; picks=pk.slice(); await EVENTS.run(e); return lines(); };
  let L=await play('help',['先認識人','你看我','念了一個多月經濟','也是大碗']);
  check('3. 開頭旁白「（一群新生圍成一圈，手上拿著名牌。）」→ 三題 → 新生「……學長，那我還有四年可以想。」→ 阿哲「我們這隊的口號是：大碗！」→ 新生「……學長，我們的口號是什麼？」',L[0]==='（一群新生圍成一圈，手上拿著名牌。）'&&L.includes('新生：學長，大一要先念什麼？')&&L.includes('新生：法律系會很難交朋友嗎？')&&L.includes('新生：為什麼念法律？')&&L.includes('新生：……學長，那我還有四年可以想。')&&L.some(t=>/我們這隊的口號是：大碗！$/.test(t))&&L[L.length-1]==='新生：……學長，我們的口號是什麼？',JSON.stringify(L));
  check('3. 前兩題各兩個選項；第 3 題四個、第二天選的（help）排第一',JSON.stringify(opts[0])==='["「民總。」","「先認識人。」"]'&&JSON.stringify(opts[1])==='["「去麵店就好。」","「不會，你看我。」"]'&&opts[2].length===4&&opts[2][0]==='「想幫身邊的人把事情弄清楚。」'&&opts[2].includes('「我先念了一個多月經濟。還是想念這個。」'),JSON.stringify(opts.slice(0,3)));
  check('3. 記 MENTOR_STYLE {q1:people,q2:me}、MENTOR_WHY＝econ（玩家這次選的）、MENTOR_SLOGAN、Y2_WELCOME；筆記「我認識的人：迎新的學弟妹」',JSON.stringify(G.flags.MENTOR_STYLE)==='{"q1":"people","q2":"me"}'&&G.flags.MENTOR_WHY==='econ'&&G.flags.MENTOR_SLOGAN==='bowl'&&G.flags.Y2_WELCOME===true&&notes.length===1&&notes[0].t==='我認識的人：迎新的學弟妹'&&notes[0].b==='學弟問我為什麼念法律。我說：『我先念了一個多月經濟。還是想念這個。』',JSON.stringify(notes));
  await play('hero',[]); check('3. 舊存檔的 hero＝help 排第一',opts[2][0]==='「想幫身邊的人把事情弄清楚。」');
  await play(null,[]); check('3. 沒有 whyLaw＝照固定順序（curious 第一）',opts[2][0]==='「小時候遇到事情就去翻民法。翻得到，看不懂。」'&&opts[2].length===4);
  { const k=STORY.knows; STORY.knows=(id,g)=>id==='zhe'?false:k(id,g); fresh(d,14,'campus',{whyLaw:'own'}); G.stage='law'; picks=[]; said=[]; opts=[]; await EVENTS.run(e); STORY.knows=k; const L2=lines(); check('3. 不認識阿哲（STORY.knows 現在一律認識，保險）＝沒有口號那一段',!L2.some(t=>/口號/.test(t))&&L2[L2.length-1]==='新生：……學長，那我還有四年可以想。',JSON.stringify(L2.slice(-2))); }
  check('3. 背景：社科院門口 → 椰林大道 → 霖澤館前（2D）',JSON.stringify(e.dialogue.filter(l=>l.bg).map(l=>l.bg))==='["ntu_soc","ntu_avenue","ntu_linze","ntu_avenue"]');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
