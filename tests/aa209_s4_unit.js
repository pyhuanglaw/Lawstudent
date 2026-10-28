// AA_209 第 4 節（大一下改稿）剩下的程式點：期中宵夜四人房旁白、阿哲叫「哥」看 ZHE_CALLS_GE、SMALLTALK 方奕廷條件、阿凱半夜 bug 只播一次。用法：node tests/aa209_s4_unit.js
// （2026-10-28 AA_519 第 6 節：方奕廷的閒聊前面換成照學年的三句，「芷若跟你講過我嗎？」那一句從第 2 筆變第 4 筆——第 3 項改成照字找那一筆，條件照舊查）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|ENC|ENCOUNTERS|ENC_WALK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  // 阿哲叫「哥」
  fresh(termDay('Y1S2',5,6),20,'campus',{});
  const Z={name:'阿哲',charId:'zhe'}, A={name:'沈以安',charId:'heroine_01'};
  check('1. 沒有 ZHE_CALLS_GE：「哥！來得好，…」→「來得好，…」',ENC.zheGe(G,Z,'哥！來得好，幫我們排一下。')==='來得好，幫我們排一下。');
  check('1. 沒有 ZHE_CALLS_GE：「哥，上次西門那家…」→ 拿掉「哥，」',ENC.zheGe(G,Z,'哥，上次西門那家，下次麵店團一起去。')==='上次西門那家，下次麵店團一起去。');
  check('1. 沒有：句中「。哥，」也拿掉',ENC.zheGe(G,Z,'系籃的在叫我了。哥，下週練球，你來。')==='系籃的在叫我了。下週練球，你來。');
  check('1. 沒有：「哥你看…」→「你看…」',ENC.zheGe(G,Z,'哥你看，那個人在噴火。')==='你看，那個人在噴火。');
  check('1. 別人說的話不動',ENC.zheGe(G,A,'哥，你好。')==='哥，你好。');
  G.flags.ZHE_CALLS_GE=true;
  check('1. 有 ZHE_CALLS_GE：照原句叫「哥」',ENC.zheGe(G,Z,'哥，上次西門那家，下次麵店團一起去。')==='哥，上次西門那家，下次麵店團一起去。');
  // 期中宵夜：四人房旁白
  const sup=ev('ev_midterm_supper_y1s2'); const nar=sup.dialogue.find(l=>l.text==='（你想起柏翰這幾週都比較晚回 203。）');
  check('2. 期中宵夜有四人房旁白、條件 DORM_FOUR、在 ps 段開頭（柏翰幫沛珊切滷蛋之前）',!!nar&&nar.if&&nar.if.flags[0]==='DORM_FOUR'&&sup.dialogue.indexOf(nar)===sup.dialogue.findIndex(l=>l.label==='ps')+1&&sup.dialogue.indexOf(nar)<sup.dialogue.findIndex(l=>l.text==='柏翰幫沛珊把滷蛋切成兩半。'));
  // SMALLTALK 方奕廷
  const ft=SMALLTALK.npc_fangyt, fh=ft.find(e=>e&&e.t==='「芷若跟你講過我嗎？她高中就這樣，什麼都不講。」')||{}; check('3. 方奕廷「芷若跟你講過我嗎？」那一句的條件改成 ev_fangyt_hint（事件存在）',!!fh.if&&!!fh.if.events&&fh.if.events[0]==='ev_fangyt_hint'&&!!ev('ev_fangyt_hint')&&!JSON.stringify(ft).includes('ev_fangyt_z6'),JSON.stringify(fh.if));
  // 阿凱半夜：bug 只播一次
  const lk=ev('ev_dorm_late_kai'); fresh(termDay('Y1S2',5,2),23.5,'dorm',{introDone:true}); picks=['什麼 bug']; await EVENTS.run(lk);
  check('4. 第一次可以選「什麼 bug？」、聽到 undefined',opts[0].some(t=>t.includes('什麼 bug'))&&said.some(s=>/undefined/.test(s.t))&&G.flags.KAI_BUG_TOLD===true,JSON.stringify(opts[0]));
  said=[]; opts=[]; picks=[0]; await EVENTS.run(lk);
  check('4. 第二次起沒有「什麼 bug？」（只剩兩個選項）、不再講 undefined',!opts[0].some(t=>t.includes('什麼 bug'))&&opts[0].length===2&&!said.some(s=>/undefined/.test(s.t)),JSON.stringify(opts[0]));
  console.log(fails?`\nFAILED ${fails}`:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
