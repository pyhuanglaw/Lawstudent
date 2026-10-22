// v0 ★E35 考試的前一晚（BB_104 8b-18；AA_154 A41）：18:00 私訊、從家裡出發到女舍門口、3D 版三個回答、沒到＝21:30 電話版（在家、睡著被叫醒、人在外面）——不需要瀏覽器。
// 修改前沒有 ev_y0_e35（全部失敗）。用法：node tests/v0_e35_unit.js
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
let spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ spawned.push([id,x,z]); return null; };
const atHome=()=>{ G.stage='econ'; G.flags.Y0_MOVED_OUT=true; G.flags.LEAVE_WEEK=6; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
(async()=>{
  const D=STORY.dayOfKey('2025-07-10'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e35'), evh=STORY_EVENTS.find(e=>e.id==='ev_y0_e35h');
  check('0. E35 兩個事件都在、7/10 是週四',!!ev&&!!evh&&CALENDAR.dateOf(D).wd===4); if(!ev||!evh){ console.log('FAILED '+fails); process.exit(1); }
  { const T=evh.dialogue.filter(l=>l.text).map(l=>l.text); check('0. 見面版收尾（AA_303 第 2 節 24：在家裡、不下樓）：最後「好。去睡。明天要早起。」、背景 home_living；沒有「五分鐘到了」「上樓」、沒有「明天考場見」、沒有電話版',T[T.length-1]==='好。去睡。明天要早起。'&&evh.dialogue[0].bg==='home_living'&&!T.some(t=>/五分鐘到了|上樓|家樓下/.test(t))&&!evh.dialogue.some(l=>/明天考場見/.test(l.text||''))&&!JSON.stringify(evh.dialogue).includes('E35_PHONE'),JSON.stringify(T.slice(-2))); }
  { const L=evh.dialogue, i=L.findIndex(l=>l.label==='c'), c=L[i+1]&&L[i+1].text; check('0. AA_368 H4：選「妳選一家。」→「我選？……那我家巷子裡那家。我從國中吃到現在，每次都在排隊。」（7/12 起她在高雄；原本「公館巷子裡那家」）',c==='我選？……那我家巷子裡那家。我從國中吃到現在，每次都在排隊。'&&!JSON.stringify(L).includes('公館巷子裡'),c); }
  let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
  /* 第 1～7 項（18:00「今晚九點，我宿舍樓下」、女舍門口、21:30 電話版、coreCallAt 21:30）拿掉：AA_224 6-5 改成他家樓下 21:00，新的測試在 tests/lifeline_g6_unit.js */
  // 9. 考完以後（AA_154 A47）：7/14 20:00 兩則私訊、7/19 摘要日
  for(const [plan,m1,m2,narr] of [['sea','你說考完要去海邊。我查好了。','星期六，客運早上八點。西瓜我負責。','那天的海很藍。她真的帶了一顆西瓜，可是兩個人都沒有帶刀。'],
      ['sleep','你說考完要睡一整天。我查好了。','星期六整天下雨。很適合。……我說過，我也要睡。','雨下了一整天。你睡到下午三點，醒來的時候，她剛好傳來一張窗外下雨的照片。'],
      ['shop','巷子那家我問過了。','星期六中午有開。我訂位了，兩個人。','巷子裡那家店很小。她點了兩份一樣的，說這樣才公平。']]){   /* AA_368 H4：shop 第一則原本「巷子那家我查好了。」（店在她高雄家的巷子裡）*/
    const d14=STORY.dayOfKey('2025-07-14'), d19=STORY.dayOfKey('2025-07-19');
    fresh(d14,19.5,'campus',{E35_PLAN:plan,E35_DONE:true}); atHome(); run(19.5,19.9); const before=!PHONE.sent(G,'y0_e35_after'); run(20,20.1); const K2=TH('p:kexin').map(m=>m.text);
    check('9. '+plan+'：7/14 20:00 可昕「'+m1+'」「'+m2+'」（20:00 以前沒有）',before&&K2.includes(m1)&&K2.includes(m2),JSON.stringify(K2));
    G.day=d19; G.weekday=wdOf(d19); G.hour=8.5; const evS=STORY_EVENTS.find(e=>e.id==='ev_y0_e35sh'); said=[]; menus=[]; script=[]; await loop(); const L9=said.map(x=>x.t);
    check('9. '+plan+'：7/19 在家醒來＝摘要日：旁白「'+narr.slice(0,12)+'……」，演完到 20:00、只演一次',L9.includes(narr)&&G.hour>=20&&G.flags.E35_SUM&&!EVENTS.check(evS),JSON.stringify(L9)+' '+G.hour); }
  fresh(STORY.dayOfKey('2025-07-14'),20.5,'campus',{E35_DONE:true}); atHome(); run(20.5,20.6); check('9. 沒有 E35_PLAN（沒演到 E35）：不傳、不演',!PHONE.sent(G,'y0_e35_after')&&(()=>{ G.day=STORY.dayOfKey('2025-07-19'); return !EVENTS.check(STORY_EVENTS.find(e=>e.id==='ev_y0_e35sh')); })());
  // 8. 法律系不受影響
  fresh(termDay('Y1S1',4,3),18.5,'dorm'); G.stage='law'; run(18,19); check('8. 法律系的存檔：沒有 E35 的訊息',!PHONE.sent(G,'y0_e35_ask')&&!G.flags.E35_ASKED);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
