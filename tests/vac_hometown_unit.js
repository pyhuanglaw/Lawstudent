// AA_276 第 1 節（AA-C a5d17b91；使用者 23:4x）：寒暑假可昕回高雄、沛珊回台中——放假第一天起到開學前 2 天在老家；偶遇、作息、當面約都不在臺北，手機照常、「在老家」標籤；出國、外縣市旅行照樣約得到；經濟系那年不算。改版前會失敗。用法：node tests/vac_hometown_unit.js
// （載入照 LIFE-LINE 第 6 組）
// 2/15 起在祐廷家的餐桌讀書（kxFreeAt 拿掉、她 10:00 到；R1 開頭「她第一次來你家」；S1、S2 改字）、RP 從 2/15；6/8 衝刺班的私訊＋6/9～7/9 一三五 19～22 點（「這次不去」、第一次三句旁白、
// 那幾晚可昕的訊息改到 22:10）；E35 在他家樓下（睡著 21:00 醒來）；E36 早上三句旁白（0.1）、晚上「只高 0.1。」「上了就是上了。」。改版前會失敗。用法：node tests/lifeline_g6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/vac_activities.js','src/vac3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const law=(k,h,flags)=>{ fresh(DK(k),h||12,'campus',Object.assign({},flags||{})); G.stage='law'; return G; };
  const pr=(id,k,stage)=>{ const g=law(k); if(stage) g.stage=stage; return STORY.presence(id,g); };
  // 1. 期間：法律系大一寒假 2025-12-22（放假第一天＝期末考最後一天 12/19 的第 3 天）～2026-02-20；開學 2/23 前 2 天（2/21）回臺北
  check('1. 12/21（放假前一天）可昕在臺北',pr('kexin','2025-12-21').here===true);
  const a=pr('kexin','2025-12-22'); check('1. 12/22 放假第一天：可昕在高雄（kind home）',a.here===false&&a.kind==='home'&&a.home==='高雄',J(a));
  check('1. 2/20 還在高雄、2/21（開學前 2 天）回臺北',pr('kexin','2026-02-20').kind==='home'&&pr('kexin','2026-02-21').here===true);
  check('1. 暑假 2026-07-10：可昕在高雄；沛珊在台中',pr('kexin','2026-07-10').home==='高雄'&&pr('classmate_peishan','2026-07-10').home==='台中');
  // 1 例外（AA_276 第 1 節、13c583c9）：已經排在臺北的活動照常，結束隔天才回老家——沛珊大一暑假 C02 營隊隊輔 7/1～7/5，7/6 才回台中；可昕照舊放假第一天就回高雄
  { const b=pr('classmate_peishan','2026-06-20'), c=pr('classmate_peishan','2026-07-05'), d=pr('classmate_peishan','2026-07-06');
    check('1 例外. 沛珊 6/20、7/5 還在臺北（C02 營隊），7/6 回台中',b.kind!=='home'&&c.kind!=='home'&&d.kind==='home'&&d.home==='台中',J([b.kind,c.kind,d.kind]));
    check('1 例外. 只限那個暑假：寒假 2025-12-22 沛珊照舊在台中；可昕 6/20 在高雄',pr('classmate_peishan','2025-12-22').kind==='home'&&pr('kexin','2026-06-20').kind==='home'); }
  check('1. 學期中 2026-03-10：都在臺北',pr('kexin','2026-03-10').here===true&&pr('classmate_peishan','2026-03-10').here===true);
  check('1. 經濟系那年的寒假（2025-01-20）不算（照 AA_272）',pr('kexin','2025-01-20','econ').here===true&&STORY.homeAway({day:DK('2025-01-20')})===false);
  check('1. 其他人不受影響：以安 2026-07-10 照舊',pr('heroine_01','2026-07-10').kind!=='home');
  // 2. 作息：放假在臺北不會出現
  { const g=law('2026-07-10',15); const e=STORY.schedEnt?STORY.schedEnt(CHARACTERS.kexin,g):null; check('2. 暑假的作息：可昕不在臺北的任何區域（schedEnt 沒有 zone）',!e||!e.zone,J(e)); }
  // 3. 手機：「在老家」標籤
  { const g=law('2026-07-10',21); check('3. 手機標籤「在老家」：放假中成立、學期中不成立',MSG.tok(g,'kexin','在老家')===true&&(law('2026-03-10',21),MSG.tok(G,'kexin','在老家')===false)); }
  // 4. 當面約臺北的地點：不答應，原因寫回高雄
  { const g=law('2026-07-10',12); const why=INV.why?INV.why(g,'kexin',{why:'away'}):null; const pid=(INVITE_DATA.places||[]).map(p=>p.id||p)[0]; const d=INV.decide(g,'kexin',pid,g.day+1,15), m=INV.declineText?null:null;
    check('4. 暑假約可昕在臺北：不答應，原因是不在（away）；學期中不是因為 away',d.res==='decline'&&d.why==='away'&&(law('2026-03-10',12),INV.decide(G,'kexin',pid,G.day+1,15).why!=='away'),J([pid,d])); }
  // 5. 出國：女朋友在老家照樣約得出國（VAC.gfCan 不因為在老家說不行）
  { const g=law('2026-07-01',12,{dating_kexin:true}); const r=VAC.gfCan?VAC.gfCan(g,'kexin','jp',g.day+10,g.day+14):'skip';
    check('5. 暑假約在高雄的女朋友出國：不會因為「不在臺北」直接說不行',r!=='no',J(r)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
