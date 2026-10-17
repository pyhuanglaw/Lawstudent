// v0 E34＝R8 經原最後一堂的最後一句（BB_153 E34 完整稿）：6/1 私訊、6/2 11:50～12:15 在博雅、三個選項、沒去版——不需要瀏覽器。
// 修改前沒有 ev_y0_e34（全部失敗）。用法：node tests/v0_e34_unit.js
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
  const D=STORY.dayOfKey('2025-05-26'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e34'); check('0. E34 在、6/2 是週一',!!ev&&CALENDAR.dateOf(D).wd===1); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D-1,20.9,'home'); run(); check('1. 6/1 21:00 以前沒有',!PHONE.sent(G,'y0_e34_ask')); at(D-1,21.1); check('1. 6/1 21:00 阿勳「明天經原最後一堂。十二點十分下課。」',TH('p:econ_zhengxun').includes('明天經原最後一堂。十二點十分下課。'));
  const ck=(h,z)=>{ fresh(D,h,z); return EVENTS.check(ev); }; check('2. 11:50～12:15 在博雅演；11:40、12:20、在校園不演',ck(11.9,'boya')&&ck(12.2,'boya')&&!ck(11.6,'boya')&&!ck(12.3,'boya')&&!ck(12,'campus'));
  fresh(D,11.9,'boya'); SOCIAL.meet('econ_zhengxun','x'); const t0=SOCIAL.rel('econ_zhengxun').trust|0; picks=['點頭']; await EVENTS.run(ev); const L=said.map(x=>x.t);
  check('3. 「星期一中午，你站在博雅一〇一的後門外。……」→ 魏老師「經濟學不會告訴你該選什麼。它告訴你，選了要付什麼。」→ 阿勳「你聽到了？……」→（點頭）「嗯。點頭也算回答。」→「一路上，他沒有問你下學期要做什麼。」',L[0]==='星期一中午，你站在博雅一〇一的後門外。門沒有關緊。'&&L.includes('經濟學不會告訴你該選什麼。它告訴你，選了要付什麼。')&&L.includes('嗯。')&&L[L.length-1]==='一路上，他沒有問你下學期要做什麼。'&&(SOCIAL.rel('econ_zhengxun').trust|0)===t0+1&&Math.abs(G.hour-12.5)<1e-6,JSON.stringify(L));
  fresh(D,12.1,'home'); run(); at(D,12.3); check('4. 12:15 還沒到：阿勳「老師最後說：選了要付什麼。我覺得你付得起。」',TH('p:econ_zhengxun').includes('經原上完了。老師最後一句說：選了要付什麼。'));
  fresh(D,12.3,'home'); G.events.done.ev_y0_e34=1; run(); check('4. 去了：沒有沒去那句',!PHONE.sent(G,'y0_e34_miss'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
