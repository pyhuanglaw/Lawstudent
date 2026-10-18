// v0 颱風假：T0b 照常上課的喜劇（手機）、T0a 泡麵之夜、XL-1 阿勳一句已刪除（AA_218 第 11 節）（BB_110 第 2 節；AA_154 第 92、93、107 行）——不需要瀏覽器。
// 修改前：沒有 ev_y0_t0a（第 0 項失敗）。用法：node tests/v0_t0_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const D29=STORY.dayOfKey('2024-09-29'), D30=STORY.dayOfKey('2024-09-30');
  const t0a=STORY_EVENTS.find(e=>e.id==='ev_y0_t0a'), xl1=STORY_EVENTS.find(e=>e.id==='ev_y0_xl1');
  check('0. ev_y0_t0a、ev_y0_xl1 在；9/30 是颱風假',!!t0a&&!!xl1&&CALENDAR.typhoon(D30));
  if(!t0a||!xl1){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(e,day,h,zone,fl)=>{ fresh(day,h,zone||'dorm',fl); return EVENTS.check(e); };
  check('1. T0a：9/30 白天到晚上在宿舍房間；9/29、9/30 在校園、法律系不行',ck(t0a,D30,11)&&ck(t0a,D30,22)&&!ck(t0a,D29,11)&&!ck(t0a,D30,11,'campus')&&!(()=>{ fresh(D30,11,'dorm',{},'law'); return EVENTS.check(t0a); })());
  { fresh(D30,14,'dorm'); picks=['肉燥']; await EVENTS.run(t0a); const L=said.map(x=>x.t);
    check('1. T0a（BB_179 段 B 改稿、四人房）：泡麵六包、韋綸「外面風超大！要不要去看？」、唐睿從上舖爬下來、「唐睿，坐下。」、「六包，四個人。……一人一包半。」',L[0]==='泡麵六包，我們三個。一人兩包，撐到明天應該夠。'&&L[1]==='（推門進來，全身濕）外面風超大！要不要去看？'&&L[2]==='你和阿勳同時說：「不要。」唐睿已經從上舖爬下來在找外套了。'&&L[3]==='唐睿，坐下。'&&L[5]==='（看了一下桌上）六包，四個人。……一人一包半。',JSON.stringify(L.slice(0,6)));
    check('1. 肉燥：「肉燥？你怎麼不早講。」、Y0_SAUCE',L[L.length-1]==='肉燥？你怎麼不早講。'&&G.flags.Y0_SAUCE===true);
    const W8=(()=>{ for(let d=D30;d<D30+40;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y0S1'&&t.week===8) return d; } })();
    G.day=W8; G.hour=20; G.weekday=wdOf(W8); check('2. XL-1 刪除（AA_218 第 11 節：10/17 休學）：事件標 retired，第 8 週晚上在宿舍、有 Y0_SAUCE 也不觸發',!!xl1.retired&&!EVENTS.check(xl1));
    G.flags.Y0_SAUCE=false; check('2. 沒有 Y0_SAUCE 就沒有',!EVENTS.check(xl1)); }
  { fresh(D30,14,'dorm'); picks=['猜拳']; await EVENTS.run(t0a); const L=said.map(x=>x.t);
    check('1. 猜拳：「阿勳連輸三把，說要改成五戰三勝。」、不記 Y0_SAUCE',L[L.length-1]==='阿勳連輸三把，說要改成五戰三勝。'&&!G.flags.Y0_SAUCE); }
  // T0b
  { fresh(D29,21.9,'dorm'); G.flags.P2_PICK='river'; run(); check('3. T0b：21:58 以前還沒收到信（排著）',!(G.msgs||[]).some(m=>m.text==='若明日停課，作業照常繳交。'));
    at(D29,22.2); const sys=(G.msgs||[]).filter(m=>(m.th||'sys')==='sys').map(m=>m.text);
    check('3. 21:58 經原老師的信、22:00 新聞、22:01 第二封信（照順序）',JSON.stringify(sys.slice(-3))===JSON.stringify(['若明日停課，作業照常繳交。','明天停止上班上課。','若明日未停課，作業也照常繳交。']),JSON.stringify(sys));
    const g=TH('g:econ_friends'); check('3. 「走啦」群組（BB_179 段 E 3-2）：品妤「所以作業還是要交。」、唐睿貼圖、可昕「明天放假，你們要幹嘛？」',g.includes('所以作業還是要交。')&&g.includes('（貼圖：一個人在風雨裡撐傘）')&&g.includes('明天放假，你們要幹嘛？'),JSON.stringify(g));
    const k=PHONE.thread(G,'g:econ_friends').find(m=>m.text==='明天放假，你們要幹嘛？');
    check('3. 可昕那則三個回答（AA_200 7-2）、各自的回覆',k&&k.ask&&k.ask.opts.map(o=>o.t).join('/')==='「睡到中午。」/「寫經原作業。」/「出去看颱風。」'&&k.ask.opts[2].say[0].text==='不要啦，很危險。'); }
  { fresh(D29,22.2,'dorm'); G.events.done.ev_y0_e02=1; run(); check('3. 還沒有「走啦」：在全班群組',TH('g:econ_class').includes('明天放假，你們要幹嘛？')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
