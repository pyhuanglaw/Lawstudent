// DL-04B 劇情保護的施工（AA_160 3-4，AA-B 2026-10-16）——不需要瀏覽器。
// 檢查：民總報告分組的補救（第 6 週起、分組沒演過、記 REPORT_PARTNER＋_LATE；分組演過就不出）；聖誕交換禮物的窗口 12:10～13:40、當天 12:00 提醒；
//       颱風假：Café、麵店、書店不開（便利商店照開）、不能回臺北的家、家教那天不排；事件條件 typhoon。
// 修改前：沒有 ev_an_report_split_late、聖誕窗口是 12:20～13:10、颱風假店家照開（第 1 項就失敗）。用法：node tests/dl04b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/data/home_lines.js','src/home3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
let caps=[]; GM.caption=(w,t)=>caps.push(t);
(async()=>{
  /* 1. 民總報告分組的補救 */
  { const e=ev('ev_an_report_split_late'); check('1. ev_an_report_split_late：大一上第 6～16 週、教室或總圖、以安在旁邊、一次、keep must',!!e&&e.once&&e.keep==='must'&&e.weeks[0]===6&&e.near&&e.near.npc==='heroine_01'&&e.location.includes('classroom')&&e.location.includes('library'));
    if(!e){ console.log('FAILED '+fails); process.exit(1); }
    const W5=termDay('Y1S1',5,2), W6=termDay('Y1S1',6,2);
    fresh(W6,15,'library',{introDone:true,classDone:true,afternoonDone:true}); check('1. 第 6 週、分組沒演過、沒有 REPORT_PARTNER：條件成立',EVENTS.check(e));
    G.day=W5; G.weekday=wdOf(W5); check('1. 第 5 週（分組的週次還沒過）：不出',!EVENTS.check(e)); G.day=W6; G.weekday=wdOf(W6);
    G.events.done.ev_an_report_split=1; check('1. 分組演過（不管答應或拒絕）：不出',!EVENTS.check(e)); delete G.events.done.ev_an_report_split;
    said=[]; await EVENTS.run(e); const L=lines();
    check('1. 台詞照 AA-B：「民總的報告，老師分組那天你沒來。」「我把你寫在我這組了。……不用謝。剩下的人裡，你最不會遲交。」（AA_313 4-3：說出口的「理由：」拿掉）',L.some(t=>t.endsWith('民總的報告，老師分組那天你沒來。'))&&L.some(t=>t.endsWith('我把你寫在我這組了。……不用謝。剩下的人裡，你最不會遲交。'))&&!L.some(t=>/理由：/.test(t)),L.join(' / '));
    check('1. 記 REPORT_PARTNER（同一個記憶，後面的事件照常接）＋REPORT_PARTNER_LATE',SOCIAL.has('heroine_01','REPORT_PARTNER')&&G.flags.REPORT_PARTNER_LATE==='assigned_absent');
    check('1. 演過以後不再出',!EVENTS.check(e)); }
  /* 2. 聖誕交換禮物 */
  { const e=ev('ev_xmas_exchange'); check('2. 聖誕交換禮物改成 12/24 18:30 麵店的出遊（16 週制，AA_204 1-1）',e.trigger==='outing'&&!e.time,JSON.stringify(e.time));
    const wed=termDay('Y1S1',17,3); fresh(wed,12.05,'campus',{introDone:true,classDone:true,afternoonDone:true}); PHONE.join(G,'noodle_team','麵店團'); const toasts=[]; GM.toast=t=>toasts.push(t);
    STORY.phoneRules(GM); check('2. 當天 12:00 以後一則提醒（只有一次）',toasts.filter(t=>/聖誕交換禮物/.test(t)).length===1,toasts.join(' / ')); STORY.phoneRules(GM); check('2. 同一天不重複提醒',toasts.filter(t=>/聖誕交換禮物/.test(t)).length===1);
    G.hour=11.9; G.daily={}; toasts.length=0; STORY.phoneRules(GM); check('2. 12:00 以前不提醒',!toasts.some(t=>/聖誕交換禮物/.test(t))); GM.toast=()=>{}; }
  /* 2b. 週二晚上的第二則提醒（AA-B 10-16）*/
  { const tue=termDay('Y1S1',17,2); fresh(tue,21.9,'dorm',{introDone:true,classDone:true,afternoonDone:true}); PHONE.join(G,'noodle_team','麵店團'); STORY.phoneRules(GM); check('2b. 週二 21:54：還沒傳',!PHONE.sent(G,'xmas_eve1'));
    G.hour=22.01; STORY.phoneRules(GM); G.hour=22.06; PHONE.tick(G); const m=G.msgs.filter(x=>x.th==='g:noodle_team'&&/明天晚上六點半|還沒買|十點半/.test(x.text)).map(x=>x.from+'：'+x.text);
    check('2b. 22:00 Alison「明天晚上六點半麵店！禮物記得包起來。」（AA_204 1-2）→ 22:02 阿哲「我還沒買」→ 22:03 Alison「……書店開到十點半。」',m.length===3&&m[0]==='yu：明天晚上六點半麵店！禮物記得包起來。'&&m[1]==='zhe：我還沒買'&&m[2]==='yu：……書店開到十點半。',JSON.stringify(m));
    const fresh2=()=>{ fresh(tue+1,9,'dorm',{introDone:true,classDone:true,afternoonDone:true}); PHONE.join(G,'noodle_team','麵店團'); STORY.phoneRules(GM); }; fresh2(); check('2b. 週三早上才加入群組（或才讀到）：照樣看到',PHONE.sent(G,'xmas_eve1'));
    fresh(tue+1,13,'dorm',{introDone:true,classDone:true,afternoonDone:true}); PHONE.join(G,'noodle_team','麵店團'); G.events.done.ev_xmas_exchange=1; STORY.phoneRules(GM); check('2b. 交換禮物演過以後不傳',!PHONE.sent(G,'xmas_eve1')); }
  /* 3. 颱風假 */
  { const ty=termDay('Y1S1',7,1); check('3. 前提：大一上第 7 週週一是颱風假',CALENDAR.typhoon(ty));
    check('3. 颱風假：Café、麵店、書店不開；便利商店照開',!PLACES.isOpen('cafe',15,ty)&&!PLACES.isOpen('noodle',15,ty)&&!PLACES.isOpen('bookstore',15,ty)&&PLACES.isOpen('cvs',15,ty));
    check('3. 平常日：Café、麵店照開',PLACES.isOpen('cafe',15,ty+1)&&PLACES.isOpen('noodle',15,ty+1));
    check('3. 關門的說明寫「颱風假，今天沒開。」',/颱風假，今天沒開/.test(PLACES.closedText('noodle',15,ty)),PLACES.closedText('noodle',15,ty));
    fresh(ty,15,'dorm',{}); G.weekday=6; check('3. 颱風假不能回臺北的家（就算是週末的時間）',!HOME.canGo(G)); G.weekday=wdOf(ty);
    check('3. 事件條件 typhoon：颱風假成立、隔天不成立',EVENTS.cond({typhoon:true})&&(G.day=ty+1,!EVENTS.cond({typhoon:true}))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
