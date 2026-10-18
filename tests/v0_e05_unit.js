// v0 P2 下課後的一群人 → ★E05「要我載妳嗎？」→ ★E06 第一則私訊／D2（BB_104 8-2、8-3；BB_105 P2、D2；AA_154 第 101～103 行）——不需要瀏覽器。
// 檢查：P2 在 Y0S1 第 3～5 週會計課下課後；選公館接 E05（同一天、最後是吃到飽那句）；其他選項有自己的旁白、E05 改在 9/20 17:00～19:30；E05 三種開口記 E05_OPEN；
//       當晚經過女舍門口 30 m 內＝D2，沒有就 22:30 E06（第一句照開口）；只會有一個版本。修改前：沒有 ev_y0_p2（第 1 項就失敗）。用法：node tests/v0_e05_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let legalAsked=0, toasts=[]; global.LEGAL={ask:async()=>{ legalAsked++; },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?' '+b:'')); },enter:async(z)=>{ G.zone=z; },
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; titles=[]; legalAsked=0; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const T=()=>PHONE.thread(G,'p:kexin').map(m=>m.text);
const settle=async()=>{ for(let i=0;i<50;i++){ await new Promise(r=>setTimeout(r,5)); if(!EVENTS.running) return; } };
(async()=>{
  const p2=ev('ev_y0_p2'), e5=ev('ev_y0_e05'); check('1. P2（會計課下課後 trigger class）、E05（auto 9/20 備用）都在、stage econ',!!p2&&!!e5&&p2.trigger==='class'&&p2.afterClass==='acct_y0'&&p2.stage==='econ'&&e5.stage==='econ'&&e5.once);
  if(!p2||!e5){ console.log('FAILED '+fails); process.exit(1); }
  const D19=STORY.dayOfKey('2024-09-19'), D20=STORY.dayOfKey('2024-09-20');
  const ck=(e,day,h,o)=>{ fresh(day,h,'campus',o||{}); G.stage='econ'; return EVENTS.check(e); };
  check('2. P2：9/19（四，Y0S1 第 3 週）會計課下課後可以；第 6 週不行；法律系不行',ck(p2,D19,15.2)&&!ck(p2,D19+21,15.2)&&!(()=>{ fresh(D19,15.2,'campus'); G.stage='law'; return EVENTS.check(p2); })());
  check('2. E05 自己的觸發：9/20（五）17:00～19:30；9/19、9/20 16:30 不行',ck(e5,D20,17.5)&&!ck(e5,D19,17.5)&&!ck(e5,D20,16.5));
  { fresh(D19,15.2,'campus'); G.stage='econ'; picks=['公館','妳真的洗了']; await EVENTS.run(p2); await settle(); const L=lines();
    check('3. P2 原文四句（韋綸、品妤、唐睿、可昕）→ 選公館 → 接 E05（AA_303 第 2 節 4 整段換）：鏈子掉了、車籃裡洗好的制服 →「……你會修嗎？」→ 你裝回鏈子 →「妳真的洗了。」→「當然。我又不是那種人。」→ 最後「走。我請你喝飲料。公館。」；沒有吃到飽那句；E05_OPEN fix、E05_DAY',JSON.stringify(L.slice(0,4))===JSON.stringify(['走啦！','去哪？先說好，我只有一百五。','（唐睿在旁邊講電話，朝你們比了一個 OK。）','（牽著腳踏車）你決定。'])&&L[4]==='（可昕的腳踏車鏈子掉了，她蹲在路邊研究。車籃裡放著一件折好的制服。你的。）'&&L[5]==='（抬頭）……你會修嗎？'&&L[6]==='（你蹲下來，把鏈子一節一節掛回齒輪上。手都是油。）'&&L.includes('（從車籃拿出制服）洗好了。')&&L.includes('當然。我又不是那種人。')&&L[L.length-1]==='走。我請你喝飲料。公館。'&&!L.some(t=>/吃到飽/.test(t))&&G.flags.E05_OPEN==='fix'&&G.flags.E05_DAY===D19,JSON.stringify(L.slice(4)));
    check('3. E05 做過了：9/20 不會再演',(()=>{ G.day=D20; G.hour=17.5; G.weekday=5; return !EVENTS.check(e5); })()); }
  { fresh(D19,15.2,'campus'); G.stage='econ'; picks=['河濱']; await EVENTS.run(p2); await settle(); const L=lines();
    check('4. 選河濱騎腳踏車：「韋綸的鏈子掉了兩次。」＋可昕「你那台要不要拿去修？我的也怪怪的，一起去。」、沒有接 E05；9/20 傍晚 E05 照自己的觸發',L.includes('韋綸的鏈子掉了兩次。')&&L.includes('你那台要不要拿去修？我的也怪怪的，一起去。')&&!G.flags.E05_OPEN&&(()=>{ G.day=D20; G.hour=17.5; G.weekday=5; return EVENTS.check(e5); })());
    picks=['下次再借妳穿']; said=[]; await EVENTS.run(e5); const L2=lines(); check('4. E05「下次再借妳穿。」：「……誰要穿你的。」→「（她把制服塞給你。）」→「走。我請你喝飲料。公館。」；沒有吃到飽那句；E05_OPEN fix',JSON.stringify(L2.slice(-3))===JSON.stringify(['……誰要穿你的。','（她把制服塞給你。）','走。我請你喝飲料。公館。'])&&!L2.some(t=>/吃到飽/.test(t))&&G.flags.E05_OPEN==='fix'&&G.flags.E05_DAY===D20,JSON.stringify(L2)); }
  { fresh(D19,15.2,'campus'); G.stage='econ'; picks=['總圖']; await EVENTS.run(p2); await settle(); const a=lines(); fresh(D19,15.2,'campus'); G.stage='econ'; picks=['今天先回去']; await EVENTS.run(p2); await settle(); const b=lines();
    check('4. 總圖念書：「唐睿講了四十分鐘的話。」品妤「今天一頁都沒讀。」；今天先回去：韋綸「那下次！」',a.includes('唐睿講了四十分鐘的話。')&&a.includes('今天一頁都沒讀。')&&b[b.length-1]==='那下次！'); }
  for(const [open,first] of [['carry','你今天說要載我，'],['fix','你今天說要幫我修車，'],['steady','你今天說你車很穩，']]){
    fresh(D19,22.6,'dorm',{E05_OPEN:open,E05_DAY:D19,E05_END:19}); G.stage='econ'; STORY.phoneRules(GM); PHONE.tick(G); const L=T();
    check('5. E06（'+open+'）22:30（AA_307 第 9 列，不分 E05_OPEN）：「今天謝謝你。」「我洗了三次手，還是有鏈條油的味道。……你的呢？」（三個回覆）；沒有「廉價訊號」',L.includes('今天謝謝你。')&&L.includes('我洗了三次手，還是有鏈條油的味道。……你的呢？')&&!L.some(t=>/廉價訊號|是真心的/.test(t))&&G.flags.E06_DONE==='e06',JSON.stringify(L)); }
  { fresh(D19,20.5,'campus',{E05_OPEN:'carry',E05_DAY:D19,E05_END:19}); G.stage='econ'; E.player.obj.position={x:-95,y:0,z:50}; STORY.phoneRules(GM); PHONE.tick(G); const L=T(); G.hour=22.6; STORY.phoneRules(GM); PHONE.tick(G); const L2=T();
    check('6. D2：E05 那晚 20:30 經過女舍門口 30 m 內：「我剛剛在三樓，看到一個很像你的人經過我們宿舍。」…「是你嗎？」（三個回覆）；22:30 不再有 E06',L.includes('我剛剛在三樓，看到一個很像你的人經過我們宿舍。')&&L.includes('是你嗎？')&&G.flags.E06_DONE==='d2'&&!L2.includes('今天謝謝你。'),JSON.stringify(L2)); }
  { fresh(D19,20.5,'campus',{E05_OPEN:'carry',E05_DAY:D19,E05_END:19}); G.stage='econ'; E.player.obj.position={x:-40,y:0,z:0}; STORY.phoneRules(GM); PHONE.tick(G); check('6. 離女舍遠（> 30 m）：沒有 D2',!T().includes('我剛剛在三樓，看到一個很像你的人經過我們宿舍。')&&!G.flags.E06_DONE); E.player.obj.position={x:0,y:0,z:0}; }
  { fresh(D19+1,22.6,'dorm',{E05_OPEN:'carry',E05_DAY:D19,E05_END:19}); G.stage='econ'; STORY.phoneRules(GM); PHONE.tick(G); check('6. 22:30 以前睡著：隔天收到 E05 那晚 22:30 的 E06（BB_214 第 2 節；只一次）',T().filter(t=>t==='今天謝謝你。').length===1&&G.flags.E06_DONE==='e06'); }
  { fresh(D19+2,22.6,'dorm',{E05_OPEN:'carry',E05_DAY:D19,E05_END:19}); G.stage='econ'; STORY.phoneRules(GM); PHONE.tick(G); check('6. 過兩天就不補',!T().includes('今天謝謝你。')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
