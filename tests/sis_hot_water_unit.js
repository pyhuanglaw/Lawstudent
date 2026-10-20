// 學姊熱水鏈（BB_207 7b39f636、AA_261 16919f86）：空的保溫瓶搬到大一上第 8～9 週法圖；熱水大一上第 14～15 週一起念書那晚 21:30～21:45（法圖 21:45 閉館；AA_284 1-1）；第二次「……又空了。」；W7／W8／W9 作廢。用法：node tests/sis_hot_water_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  const HW=ev('ev_sis_hot_water'), HW2=ev('ev_sis_hot_water_again'), FL=ev('ev_sis_empty_flask');
  check('0. 事件在；W7、W8、W9 作廢',!!HW&&!!HW2&&!!FL&&['ev_sis_prof_xu_door','ev_sis_collapse','ev_sis_skip_interview'].every(i=>ev(i)&&ev(i).retired));
  const near=()=>{ const n={obj:{position:{x:0.5,y:0,z:0}},lv:0,charId:'heroine_05'}; GM.npc.heroine_05=n; E.npcs=[n]; E.player.obj.position.x=0; E.player.obj.position.z=0; E.player.lv=0; };
  /* 「一起念書」的條件（SIS_STUDY_OK）：2026-10-20 改成有 SIS_STUDY（一起念書解鎖，AA_284 2-3 最後一行；src/sis_grad3d.js），不用數值門檻 */
  const at=(term,w,wd,h,o)=>{ o=o||{}; fresh(termDay(term,w,wd),h,o.zone||'lawlib',{}); G.stage='law'; meet('heroine_05'); R('heroine_05',...(o.lv||[45,30,20])); G.flags.SIS_W1=true; if(!o.noStudy) G.flags.SIS_STUDY=true; near(); return EVENTS.check(o.e||HW); };
  const r={ok:at('Y1S1',14,2,21.6),w15:at('Y1S1',15,4,21.7),w13:at('Y1S1',13,2,21.6),fri:at('Y1S1',14,5,21.6),early:at('Y1S1',14,2,20),late:at('Y1S1',14,2,22),cafe:at('Y1S1',14,2,21.6,{zone:'cafe'}),famOnly:at('Y1S1',14,2,21.6,{lv:[30,10,5]}),noStudy:at('Y1S1',14,2,21.6,{noStudy:true,lv:[65,50,40]}),y1s2:at('Y1S2',14,2,21.6)};
  check('1. 熱水：大一上第 14～15 週週一～四 21:30～21:45（閉館前）、法圖、一起念書解鎖了（SIS_STUDY，不看數值：只到有點熟也演）；第 13 週、週五、20:00、22:00（閉館後）、Café、沒解鎖（好朋友也不演）、大一下都不演',r.ok&&r.w15&&r.famOnly&&!r.w13&&!r.fri&&!r.early&&!r.late&&!r.cafe&&!r.noStudy&&!r.y1s2,JSON.stringify(r));
  { fresh(termDay('Y1S1',14,2),21.6,'lawlib',{}); G.stage='law'; const e=STORY.schedEnt(CHARACTERS.heroine_05,G); check('1. 作息：那幾晚她在法圖念到閉館（21:45）',!!e&&e.zone==='lawlib'&&e.to===21.75,JSON.stringify(e)); }
  // 2. 裝熱水（演過空的保溫瓶、選黑咖啡＝HELPED 多一句）
  { at('Y1S1',14,2,21.6); SOCIAL.remember('heroine_05','HELPED',''); said=[]; picks=[0]; const cg=[]; const c0=ADV.cg; ADV.cg=id=>cg.push(id); await EVENTS.run(HW); ADV.cg=c0; const L=lines();
    check('2. 開場旁白、「我在算還剩幾天。」「……算完就不想算了。」',L[0]==='（九點四十分，閉館的廣播響了。自習室的燈一盞一盞關掉。她站在走廊的飲水機前面，手上是空的保溫瓶，沒有按。）'&&/我在算還剩幾天。$/.test(L[1])&&/……算完就不想算了。$/.test(L[2]),JSON.stringify(L.slice(0,3)));
    check('2. 「我去幫妳裝熱水。」→「……好燙。」笑出聲音、CG BCG-01、HELPED 多「上次是黑咖啡。……這次換熱水。」→「謝謝。明天八點，一樣的位子。」；HOT_WATER',L.some(t=>/……好燙。$/.test(t))&&cg.includes('cg_hot_water_heroine05')&&L.some(t=>/上次是黑咖啡。……這次換熱水。$/.test(t))&&/謝謝。明天八點，一樣的位子。$/.test(L[L.length-1])&&G.flags.HOT_WATER===true,JSON.stringify(L.slice(-4)));
    check('2. 只一次；裝過熱水就沒有第二次',!EVENTS.check(HW)&&(G.day++,near(),!EVENTS.check(HW2))); }
  { at('Y1S1',14,2,21.6); said=[]; picks=[0]; await EVENTS.run(HW); check('2. 沒有 HELPED：沒有「上次是黑咖啡」那句',!lines().some(t=>/上次是黑咖啡/.test(t))); }
  // 3. 請一罐 → 下一次一起念書「……又空了。」
  { at('Y1S1',14,2,21.6); said=[]; picks=[1]; await EVENTS.run(HW); let L=lines();
    check('3. 「我請妳喝一罐。」→ 最便宜的那一罐、「……不用。我自己來。」「明天八點。」；不記 HOT_WATER',L.some(t=>t.includes('按了最便宜的那一罐'))&&L.some(t=>/……不用。我自己來。$/.test(t))&&/明天八點。$/.test(L[L.length-1])&&!G.flags.HOT_WATER,JSON.stringify(L.slice(-3)));
    check('3. 同一天不會有第二次',!EVENTS.check(HW2));
    G.day++; G.weekday=wdOf(G.day); near(); check('3. 隔天晚上（還在第 14～15 週）：第二次',EVENTS.check(HW2));
    said=[]; picks=[0]; await EVENTS.run(HW2); L=lines(); check('3. 第二次她的第一句「……又空了。」，裝熱水＝HOT_WATER',/……又空了。$/.test(L[1])&&G.flags.HOT_WATER===true,JSON.stringify(L.slice(0,3))); }
  // 4. 空的保溫瓶：大一上第 8～9 週、法圖、平日 14～17；旁白「她在寫考古題」
  { fresh(termDay('Y1S1',8,2),15,'lawlib',{}); G.stage='law'; const e=STORY.schedEnt(CHARACTERS.heroine_05,G); check('4. 空的保溫瓶那兩週：她平日下午在法圖',!!e&&e.zone==='lawlib',JSON.stringify(e));
    check('4. 空的保溫瓶：Y1S1 第 8～9 週、lawlib、旁白「她在寫考古題…」',FL.term.join()==='Y1S1'&&FL.weeks.join()==='8,9'&&FL.location==='lawlib'&&FL.dialogue[0].text==='她在寫考古題，左手拿著保溫瓶，喝了一口。又喝了一口。'); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
