// BB_214（BB-C 1c43434e）經濟系事件窗口＋BB_216 B（b83a8636）已經有的背景接上：E05 那天演完以前不能回家、E06 22:30 以前睡著隔天收到、L5a 從家出發也趕得上。改版前會失敗。用法：node tests/v0_bb214_unit.js
// （以下載入照 LIFE-LINE 第 6 組（AA_224 6-1～6-7 @31708531；機制 BB_188 A9-3）——不需要瀏覽器。
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
(async()=>{
  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const econ=(day,hour,zone,flags)=>{ fresh(day,hour,zone,Object.assign({LEAVE_WEEK:6},flags||{})); G.stage='econ'; };
  const d20=DK('2024-09-20');
  check('0. 9/20 是 Y0S1 第 3 週的週五',STORY.termDay('Y0S1',3,5)===d20&&CALENDAR.dateOf(d20).wd===5);
  econ(d20,16.5,'campus',{}); check('1. 9/20 16:30：本來就不能回家',!HOME.canGo(G));
  G.hour=17.5; check('1. 9/20 17:30 E05 還沒演：不能回家（homeHold e05）',!HOME.canGo(G)&&STORY.homeHold(G)==='e05');
  G.hour=19.6; check('1. 19:30 以後：可以回家',HOME.canGo(G));
  G.hour=17.5; G.events.done.ev_y0_e05=1; G.flags.E05_DAY=d20; check('1. E05 演過：17:30 就可以回家',HOME.canGo(G)&&!STORY.homeHold(G));
  econ(d20+7,17.5,'campus',{}); check('1. 下一個週五照舊 17:00 就能回家',HOME.canGo(G));
  // E06：22:30 以前睡著
  econ(d20,21,'dorm',{E05_OPEN:'fix',E05_DAY:d20,E05_END:19}); run(21,21.2); check('2. 21:00 還沒有 E06',!PHONE.sent(G,'y0_e06'));
  G.day=d20+1; G.hour=8.5; run(8.5,8.6); const m=(G.msgs||[]).filter(x=>x.tag==='y0_e06');
  check('2. 22:30 以前睡著：隔天醒來收到 E06（時間戳記是 9/20 22:30；AA_307 第 9 列「今天謝謝你。」「我洗了三次手……」）',m.length>=2&&m[0].text==='今天謝謝你。'&&m[1].text==='我洗了三次手，還是有鏈條油的味道。……你的呢？'&&G.flags.E06_DONE==='e06',J(m.map(x=>[x.text,x.day,x.h])));
  econ(d20+2,8.5,'dorm',{E05_OPEN:'fix',E05_DAY:d20,E05_END:19}); run(8.5,8.6); check('2. 過兩天就不補',!PHONE.sent(G,'y0_e06'));
  // L5a
  const e=STORY_EVENTS.find(x=>x.id==='ev_y0_l5a'); check('3. L5a 的時間窗涵蓋從家裡出發的最晚到店時間（14:15 出發＋30 分鐘）',e.time[0]<=13.75&&e.time[1]>=14.25+0.5,J(e.time));
  // BB_216 B：圖已經有的場景接上
  { const sc=id=>(STORY_EVENTS.find(x=>x.id===id).dialogue||[]).filter(l=>l.scene!==undefined).map(l=>l.scene+'|'+l.bg);
    check('4. BB_216：衝刺班 cram_class、豆花店 gongguan_douhua、在家看榜 home_room、E20b 公館捷運出口不換背景（bg:false）',sc('ev_y0_cram_class').includes('衝刺班|cram_class')&&sc('ev_y0_e18b').includes('公館・豆花店|gongguan_douhua')&&sc('ev_y0_e36rh')[0]==='臺北的家|home_room'&&sc('ev_y0_e20b').includes('公館・捷運出口|false'),J([sc('ev_y0_cram_class'),sc('ev_y0_e18b'),sc('ev_y0_e36rh'),sc('ev_y0_e20b')]));
    const p=sc('ev_y0_p2b'); check('4. BB_216：P2b 椰影大道 ntu_avenue、女舍門口 girls_dorm_gate、河濱 riverside',p.filter(x=>x==='椰影大道|ntu_avenue').length===2&&p.includes('女舍門口|girls_dorm_gate')&&p.includes('河濱|riverside'),J(p)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
