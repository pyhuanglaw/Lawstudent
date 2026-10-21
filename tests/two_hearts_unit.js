// 1A-02 第 3 節：同時和以安、學姊交往（AA_315 第 3 節；台詞照 AA_253 第 3、4 節）——不需要瀏覽器。
//   1. 11/10 那晚睡著以後：法圖相遇（trigger 'sleep'，祐廷不在場）；兩人都還不知道才演；演完兩邊都知道、TWO_HEARTS_MET；
//   2. 已經知道了、只和一位交往、不是 11/10：不演；
//   3. 11/11 22:00 兩則私訊（逐字）＋22:30 兩點半 Café（出遊 must，只有「出發」）；11/10 那晚沒睡著過也一樣排；
//   4. 進 Café 就演：只有「學姊。」／「以安。」，沒被選的那位分手（ex、by her），逐字；
//   5. 選學姊：11/18 12:00 路線＝US；選以安＝JP；
//   6. 被選的那位之後第一次說話記得一次（逐字），第二次不說。
// 修改前 1～6 FAIL。用法：node tests/two_hearts_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const d10=D('2027-11-10'), d11=D('2027-11-11');
  const setup=(day,h)=>{ fresh(day,h,'dorm',{}); G.stage='law'; G.flags.dating_heroine_01=true; G.flags.dating_heroine_05=true; ROM.rec(G); for(const id of ['heroine_01','heroine_05']){ meet(id); INV.addContact(G,id); } return G; };
  const evr=id=>STORY_EVENTS.find(e=>e.id===id);
  setup(d10,23); const sev=EVENTS.sleepEvent();
  check('1. 11/10 23:00 睡著：演的是法圖相遇（ev_an_sis_meet_lawlib）', !!sev&&sev.id==='ev_an_sis_meet_lawlib', sev&&sev.id);
  if(sev){ await EVENTS.run(sev); const L=lines();
    check('1. 逐字：第一句「（週三晚上的法學院圖書館……）」到最後「我們明天一起找他。」，祐廷不說話', L[0]==='（週三晚上的法學院圖書館。長桌只剩一個位子，以安坐下，對面的人在看一本很厚的書。）'&&/我們明天一起找他。$/.test(L[L.length-1])&&!said.some(x=>x.who===G.name), JSON.stringify([L[0],L[L.length-1]]));
    check('1. 演完：以安知道學姊、學姊知道以安（ROM.knowsOf）、TWO_HEARTS_MET', ROM.knowsOf(G,'heroine_01','heroine_05')&&ROM.knowsOf(G,'heroine_05','heroine_01')&&G.flags.TWO_HEARTS_MET===d10); }
  setup(d10,23); ROM.learn(G,'heroine_01','heroine_05','rumor'); check('2. 以安已經知道了：不演', !STORY.twoHeartsDue(G));
  setup(d10,23); G.flags.dating_heroine_01=false; check('2. 只和學姊交往：不演', !STORY.twoHeartsDue(G));
  setup(d10-1,23); check('2. 不是 11/10：不演', !STORY.twoHeartsDue(G));
  // 3
  setup(d11,8); STORY.twoHeartsMet(G); G.hour=21.9; STORY.phoneRules(GM); PHONE.tick(G); const q=OUT.get(G,'y3_two_hearts');
  G.hour=22.01; PHONE.tick(G); const m5=txt('p:heroine_05'), m1=txt('p:heroine_01');
  check('3. 22:00 兩則私訊（逐字）：學姊「今天十點半，兩點半 Café。」、以安「十點半，兩點半。我也會去。」', m5.includes('heroine_05:今天十點半，兩點半 Café。')&&m1.includes('heroine_01:十點半，兩點半。我也會去。'), JSON.stringify([m5,m1]));
  check('3. 22:30 兩點半 Café 的出遊：must（只有「出發」）、帶到 3D 的 Café', !!q&&q.must===true&&q.h===22.5&&q.goto&&q.goto.zone==='cafe'&&q.day===d11, JSON.stringify(q));
  setup(d11,9); STORY.phoneRules(GM); check('3. 11/10 那晚沒睡著過（法圖那段沒演）：11/11 照樣排（TWO_HEARTS_MET 補上）', G.flags.TWO_HEARTS_MET!=null&&!!OUT.get(G,'y3_two_hearts'));
  // 4、5
  for(const [pick,lose,route] of [['學姊','heroine_01','US'],['以安','heroine_05','JP']]){
    setup(d11,22.6); G.zone='cafe'; STORY.twoHeartsMet(G); const e=evr('ev_two_hearts_cafe'); const ok=EVENTS.check(e); picks=[pick]; await EVENTS.run(e); const L=lines();
    const R=ROM.get(G,lose); const two=opts.find(o=>o.length===2);
    check('4. 選「'+pick+'」：進 Café 就演、選項只有「學姊。」「以安。」', ok!==false&&!!two&&two.join('|')==='「學姊。」|「以安。」', JSON.stringify(opts));
    check('4. 選「'+pick+'」：沒被選的那位分手（ex、by her）、被選的還在交往', G.flags['dating_'+lose]===false&&R.status==='ex'&&R.by==='her'&&G.flags['dating_'+(lose==='heroine_01'?'heroine_05':'heroine_01')]===true, JSON.stringify({st:R.status,by:R.by}));
    check('4. 選「'+pick+'」：逐字（'+(pick==='學姊'?'以安「理由我不用聽了。」':'學姊「志願表的事，你自己決定。不要因為今天。」')+'）', pick==='學姊'?L.includes('以安：（站起來，把椅子推回去）理由我不用聽了。')||L.some(x=>/理由我不用聽了。$/.test(x)):L.some(x=>/志願表的事，你自己決定。不要因為今天。$/.test(x)), JSON.stringify(L.slice(-5)));
    G.day=D('2027-11-18'); G.hour=12; STORY.routeDecide(G); check('5. 選「'+pick+'」：11/18 12:00 路線＝'+route, G.flags.EXCHANGE_ROUTE===route);
    // 6
    const who={name:pick==='學姊'?'溫學姊':'以安'}; G.day=d11+1; said=[]; const e1=await STORY.twoHeartsEcho(GM,pick==='學姊'?'heroine_05':'heroine_01',who); const e2=await STORY.twoHeartsEcho(GM,pick==='學姊'?'heroine_05':'heroine_01',who);
    check('6. 選「'+pick+'」：之後第一次說話「'+(pick==='學姊'?'那天的事，我不會再提。可是我記得。':'那天的事，我不會再問了。')+'」，第二次不說', e1&&!e2&&said.length===1&&said[0].t===(pick==='學姊'?'那天的事，我不會再提。可是我記得。':'那天的事，我不會再問了。'), JSON.stringify(said)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
