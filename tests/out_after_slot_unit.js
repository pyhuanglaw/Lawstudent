// 出遊演完、時段用完＝排「時段用完」（BGN-AFTER-HOME-1110；使用者 11-10「桌遊日桌遊完回到前往之前的系館 ?都晚上這麼晚了 而且行動次數用完不是應該回去睡覺嗎」）——不需要瀏覽器。
// 檢查：晚上 21:00 出發的出遊（2.5 小時）演完＝CLS._jump 排了晚上（之後空下來 CLS.afterSlot → eveSleep 回宿舍睡）；從家裡出發的不排；白天的出遊照時段規則。
// 修改前：OUT.go 只填時段、不排，演完留在出發前的地方（1 FAIL）。用法：node tests/out_after_slot_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},say:async()=>{},choose:async()=>0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:{KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,campusIntro:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); if(CLS.clearPending) CLS.clearPending(); CLS._jump=null; };
STORY_EVENTS.push({id:'ev_t_outslot',title:'測試的出遊',participants:[],location:'any',trigger:'outing',once:false,background:'dark',hours:2.5,dialogue:[{text:'（測試。）'}]});
(async()=>{
  const day=STORY.termDay('Y1S1',5,5);   /* 一般週（第 8～9 週考試週每個時段多一次自習，不會用完）*/
  fresh(day,20.9,'putong'); OUT.plan(G,{id:'t_bgn',ev:'ev_t_outslot',day,h:21,place:'日常失速',title:'桌遊夜',travel:'',travelH:0});
  const q=OUT.get(G,'t_bgn'); await OUT.go(GM,q); const J=CLS._jump;
  check('1. 21:00 的出遊演完（23:30）：晚上時段用完、排了「時段用完」（之後回宿舍睡）',G.hour>=23.4&&!!J&&J.p==='ev'&&J.day===G.day,JSON.stringify({h:G.hour,J}));
  fresh(day,20.9,'putong'); OUT.plan(G,{id:'t_bgn2',ev:'ev_t_outslot',day,h:21,place:'日常失速',title:'桌遊夜',travel:'',travelH:0});
  await OUT.go(GM,OUT.get(G,'t_bgn2'),{fromHome:true}); check('2. 從家裡出發的不排（home3d.js 的選單接著）',!CLS._jump,JSON.stringify(CLS._jump));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
