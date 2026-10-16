// 大二過年（V3-D13；AA_143 2-1 新的字，AA-B 9035ede0）——不需要瀏覽器。
// 檢查：初一 2027-02-06 11:00 麵店團群組：阿哲三則、以安三則、小語兩則、阿哲、小語；三個回覆；不在麵店團沒有；大一的原句不重用；大一的拜年照舊只在大一。用法：node tests/v3_d13_unit.js
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

(async()=>{
  const NG='g:noodle_team', ny=D('2027-02-06');
  const setup=(day,h)=>{ fresh(day,h,'home'); meet('heroine_01'); meet('yu'); PHONE.join(G,'noodle_team','麵店團'); };
  setup(ny,10.5); run(10.5,10.95);
  check('1. 初一 10:57 還沒有',!PHONE.sent(G,'cny_noodle_y2'));
  run(11,11.2); const t=txt(NG);
  const want=['zhe:📷（高雄老家的廚房，媽媽在包水餃）','zhe:我媽說今年要包一百個。','zhe:我包到第四十個就被趕出廚房。……你們在幹嘛？','heroine_01:📷（台中阿嬤家門口的春聯，字有一點歪）','heroine_01:新年快樂。今年的春聯是我寫的。','heroine_01:理由：阿嬤說我的字最工整。……歪是照片的角度。','yu:📷（和阿哲視訊的截圖，兩個人各舉著一顆水餃）','yu:我們隔著三百公里吃年夜飯。','zhe:她包的比較醜。','yu:你閉嘴。'];
  check('1. 11:00 十則照 AA_143 2-1',JSON.stringify(t)===JSON.stringify(want),JSON.stringify(t));
  check('1. 大一的原句沒有出現（高雄沒有冬天、第三個路口）',!t.some(x=>/高雄沒有冬天|第三個路口/.test(x)));
  const m=TH(NG).find(x=>x.ask&&x.ask.id==='cny_noodle_y2_reply');
  check('2. 三個回覆',!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["（傳家裡的年夜飯照片）","新年快樂。小語，醜的水餃比較好吃。","（傳一張貼圖）"]');
  PHONE.answer(G,'cny_noodle_y2_reply',0);
  check('2. 年夜飯照片 → 阿哲「哥，你家也太多菜！」以安「左下角那盤是什麼？……記下來了。」',txt(NG).slice(-3).join('｜')==='player:📷（家裡的年夜飯，滿桌的菜）｜zhe:哥，你家也太多菜！｜heroine_01:左下角那盤是什麼？……記下來了。',JSON.stringify(txt(NG).slice(-3)));
  setup(ny,10.9); run(10.9,11.2); PHONE.answer(G,'cny_noodle_y2_reply',1);
  check('2. 醜的水餃 → 小語「連你也！」阿哲「哥懂我。」',txt(NG).slice(-2).join('｜')==='yu:連你也！｜zhe:哥懂我。');
  setup(ny,10.9); run(10.9,11.2); PHONE.answer(G,'cny_noodle_y2_reply',2);
  check('2. 貼圖 → 阿哲回一樣的貼圖',txt(NG).slice(-2).join('｜')==='player:（貼圖：新年快樂）｜zhe:（貼圖：新年快樂）');
  fresh(ny,10.9,'home'); run(10.9,11.5);
  check('3. 不在麵店團：沒有',!PHONE.sent(G,'cny_noodle_y2'));
  setup(ny+2,10); run(10,10.2);
  check('3. 初三才讀檔：補在初一 11:00',PHONE.sent(G,'cny_noodle_y2'));
  setup(ny,10.9); run(10.9,11.5);
  check('3. 大一的拜年（cny_noodle）在大二不會再出現',!PHONE.sent(G,'cny_noodle'));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
