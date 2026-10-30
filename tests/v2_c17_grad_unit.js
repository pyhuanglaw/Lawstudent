// 交接包 v2 C17：法四學長姊畢業（AA_71 2-12，寫成慶祝）——不需要瀏覽器。修改前沒有 ev_grad_seniors_y1、群組沒有這兩則（第 1 項失敗）。
// 檢查：大一下第 15 週週六 10～15 在校園演（學士帽、學長請你拍照）；法服群組 12:30 合照＋「恭喜學長姊！法服永遠歡迎回來值班！」（只給加入法服的玩家）；
//   家族群組 13:00 Kevin 傳畢業照、學姊「恭喜。」；不在群組沒有；別週沒有
// 用法：node tests/v2_c17_grad_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const txt=(th)=>TH(th).map(m=>(m.name||m.from||'')+':'+m.text);
(async()=>{
  const e=ev('ev_grad_seniors_y1'); check('C17：事件在',!!e);
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const gd=termDay('Y1S2',15,6);
  { const at=(day,h,zone)=>{ fresh(day,h,zone||'campus'); return EVENTS.check(e); };
    const r={ok:at(gd,10.5),late:at(gd,15.5),fri:at(gd-1,11),w14:at(termDay('Y1S2',14,6),11),lib:at(gd,11,'library')};
    check('C17：大一下第 15 週週六 10～15、在校園（15:30、週五、第 14 週、總圖都沒有）',r.ok&&!r.late&&!r.fri&&!r.w14&&!r.lib,JSON.stringify(r));
    fresh(gd,11,'campus'); await EVENTS.run(e); const L=lines();
    check('C17：（椰林大道。學士帽丟上天。）（一位學長把手機塞給你。）學長「學弟，幫我們拍一張！」（拍完。）學長「謝啦！三年後換你。」',JSON.stringify(L)===JSON.stringify(['（椰林大道。學士帽丟上天。）','（一位學長把手機塞給你。）','學長：學弟，幫我們拍一張！','（拍完。）','學長：謝啦！三年後換你。']),JSON.stringify(L));
    check('C17：只一次',!EVENTS.check(e)); }
  { fresh(gd,8,'dorm'); PHONE.join(G,'lawclub_study','法服讀書會'); PHONE.join(G,'family_law','法律系直屬家族'); run(8,14);
    const A=txt('g:lawclub_study').slice(-2), B=txt('g:family_law').slice(-3);
    check('C17 法服群組（12:30）：法服社長（AA：法三的學長姊、不具名）傳合照＋「恭喜學長姊！法服永遠歡迎回來值班！」',JSON.stringify(A)===JSON.stringify(['法服的社長:📷（學長姊穿學士服、抱著花的合照）','法服的社長:恭喜學長姊！法服永遠歡迎回來值班！'])&&TH('g:lawclub_study').slice(-2).every(m=>m.day===gd&&Math.abs(m.h-12.5)<0.05),JSON.stringify(A));   /* 標籤寫全名「法服的社長」（AA_496 第 9 節第 6 點，2026-10-28；原本「法服社長」，和同一個群組的「社長」統一）*/
    check('C17 家族群組（13:00）：Kevin 傳書瑀學姊和法四學長姊的畢業照、「學姊畢業快樂！！」、學姊「謝謝。」（她自己也畢業：AA_284 1-4）',JSON.stringify(B)===JSON.stringify(['Kevin:📷（書瑀學姊和法四學長姊的畢業照）','Kevin:學姊畢業快樂！！','溫學姊:謝謝。']),JSON.stringify(B));
    run(14,23.9); check('C17：只送一次',TH('g:family_law').filter(m=>m.text==='謝謝。').length===1);
    fresh(gd,8,'dorm'); run(8,14); check('C17：不在群組（沒加入法服、沒有直屬家族）就沒有',!TH('g:lawclub_study').length&&!TH('g:family_law').length);
    fresh(termDay('Y1S2',14,6),8,'dorm'); PHONE.join(G,'family_law','法律系直屬家族'); run(8,14); check('C17：第 14 週沒有',!txt('g:family_law').some(t=>/畢業照/.test(t))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
