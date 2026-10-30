// AA_140 G01（2026-10-16）：可昕的生日 4/24（BB_96 9-7b）——大一下第 9 週週五；做法同 12/3：行事曆「可昕生日」、草稿「生日快樂。」、18:00 出遊、都沒做＝隔天「我等了一天。」（一次）；
// 「我帶了另一個。」只給 12/3 去過政大的玩家；BCG-45 三個選項都會到；記 KX_BDAY:{1:…}。修改前沒有這個事件（第 1 項失敗）。用法：node tests/v2_g01_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const keepOn=(day,h)=>{ G.day=day; G.hour=h; G.weekday=wdOf(day); };
(async()=>{
  const e=ev('ev_kexin_birthday_y1s2'); check('1. 事件在、id ev_kexin_birthday_y1s2',!!e); if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const BD=termDay('Y1S2',9,5); let toasts=[]; GM.toast=t=>toasts.push(t);
  check('2. 4/24 是大一下第 9 週週五',CALENDAR.dateOf(BD).key.endsWith('04-24'));
  fresh(BD,5.5,'dorm',{dating_kexin:true}); toasts=[]; run(5.5,6.2); const d=G.msgs.find(m=>m.tag==='kx_bday_draft');
  check('3. 早上行事曆「可昕生日」、草稿「生日快樂。」',toasts.includes('行事曆：可昕生日')&&!!d&&JSON.stringify(d.ask.opts.map(o=>o.t))==='["生日快樂。"]',JSON.stringify(toasts));
  const q=OUT.get(G,'kx_bday_y1s2'); check('4. 18:45 出遊提示「可昕的生日：開車去木柵大學」',!!q&&q.title==='可昕的生日：開車去木柵大學'&&q.ev==='ev_kexin_birthday_y1s2');
  fresh(BD,6,'dorm',{dating_kexin:true}); run(6,23.95); keepOn(BD+1,7); run(7,8.2); keepOn(BD+2,8); run(8,9);
  check('5. 都沒做＝隔天早上「我等了一天。」只一次、KX_BDAY {1:"none"}',G.msgs.filter(m=>m.tag==='kx_bday_none').length===1&&G.flags.KX_BDAY[1]==='none');
  const go=async(flags,pick)=>{ fresh(BD,18.2,'dorm',Object.assign({dating_kexin:true},flags||{})); run(18.2,18.3); const q3=OUT.get(G,'kx_bday_y1s2'); picks=[pick]; said=[]; opts=[]; let cgs=[]; global.ADV.cg=id=>{ cgs.push(id); return true; }; await OUT.go(GM,q3); return {L:lines(),O:opts[0]||[],cgs}; };
  let r=await go({},'（點蠟燭');
  check('6. 去木柵大學：旁白流蘇（AA_209 改字）、她「風很大。你點，我擋。」；12/3 沒去過＝沒有「我帶了另一個。」',r.L[0]==='四月底的木柵大學，校門口那排流蘇開成白色的。風一吹，白色的花掉了一地。'&&r.L.some(t=>t.endsWith('風很大。你點，我擋。'))&&!r.O.includes('「我帶了另一個。」'),JSON.stringify(r.O));
  check('7. 點蠟燭：BCG-45 → 「火點著了。她的手被照得很亮。」「……好。現在許願。」→「願望許好了。說出來就不準了。……走，下山。」（AA_209；AA_313 第 2 節第 26 列）',r.cgs.includes('cg_birthday_tassel_kexin')&&r.L.includes('火點著了。她的手被照得很亮。')&&r.L.some(t=>t.endsWith('願望許好了。說出來就不準了。……走，下山。'))&&!r.L.some(t=>t.endsWith('今天你點餐。')));
  r=await go({KX_DEC3:{1:'visit'}},'「我帶了另一個。」');
  check('8. 12/3 去過木柵大學＝有「我帶了另一個。」；也到 BCG-45 那一拍',r.O.includes('「我帶了另一個。」')&&r.cgs.includes('cg_birthday_tassel_kexin')&&r.L.some(t=>t.endsWith('兩個蛋糕？……好，我都會吃完。')));
  r=await go({},'「先上車');
  check('9. 「先上車，車裡沒風。」→「不行。在外面點。……車裡會有蠟燭的味道。」（AA_313 第 2 節第 26 列，原本「規定」那句）以後還是到 BCG-45',r.cgs.includes('cg_birthday_tassel_kexin')&&r.L.some(t=>t.endsWith('不行。在外面點。……車裡會有蠟燭的味道。'))&&!r.L.some(t=>/規定/.test(t)));
  keepOn(BD+1,7.5); run(7.5,8.2); check('10. 去了＝KX_BDAY {1:"visit"}、沒有「我等了一天。」',G.flags.KX_BDAY[1]==='visit'&&!G.msgs.some(m=>m.tag==='kx_bday_none'));
  r=await go({E18B_GIFT:'notebook'},'（點蠟燭'); check('11. 經濟系那年送過筆記本：多一句「那本筆記本，寫到第十二頁了。」',r.L.some(t=>t.endsWith('那本筆記本，寫到第十二頁了。')));
  r=await go({E18A_DOUHUA:true},'（點蠟燭'); { const i=r.L.findIndex(t=>t.endsWith('說出來就不準了。……走，下山。'));
    check('11. 經濟系那年吃過豆花（E18A_DOUHUA）：「……走，下山。」（AA_209 合成一句、AA_313 第 2 節第 26 列）之後「你第一次跟我單獨吃的，是豆花。」「……今天不准點豆花。」（BB-B a48d7f8a）',i>=0&&r.L[i+1].endsWith('你第一次跟我單獨吃的，是豆花。')&&r.L[i+2].endsWith('……今天不准點豆花。'),JSON.stringify(r.L.slice(i,i+3))); }
  r=await go({},'（點蠟燭'); check('11. 沒有 E18A_DOUHUA：沒有這兩句',!r.L.some(t=>/豆花/.test(t)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
