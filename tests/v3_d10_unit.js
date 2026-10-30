// 交接包 v3 D10：慈 3「第二名」（AA_40、AA_177 第 5 節）——不需要瀏覽器。
// 檢查：芯慈的作息（大二上第 14～18 週，週一到週四的深夜 00:15～00:45，溫州街的便利商店）；事件只在那個時段、認識她、第一次遇到就演；三個選項；XINCI_SECOND；之後主線 4 的「那部劇大結局了」才會出現。用法：node tests/v3_d10_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
if(typeof XCROM!=='undefined') XCROM.OLD=true; else globalThis.XCROM={OLD:true};   /* 芯慈舊的「第二名」那幾場遊戲預設關著（D116，src/xcrom3d.js S.OLD；預設值在 tests/xinci_romance_unit.js 第 00 項測）：這支測留著的程式本身 */
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
  const NM={'吳芯慈':'芯慈','芯慈':'芯慈'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const X=ev('ev_xinci_second'), mon=termDay('Y2S1',14,1), fri=termDay('Y2S1',14,5);
  const night=(day,hh)=>{ fresh(day,hh,'cvs'); G.weekday=wdOf(day); return STORY.schedEnt(CHARACTERS.classmate_xinci,G); };
  let e=night(mon,24.5); check('1. 第 14 週週一晚上過了 12 點（00:30）：芯慈在便利商店',e&&e.zone==='cvs',JSON.stringify(e));
  e=night(fri,24.5); const e2=night(termDay('Y2S1',11,1),24.5), e3=night(mon,23.5);
  check('1. 週五晚上、第 11 週（AA_243 #20：第 12～15 週）、23:30：不在便利商店',(!e||e.zone!=='cvs')&&(!e2||e2.zone!=='cvs')&&(!e3||e3.zone!=='cvs'));
  const at=(day,hh,know)=>{ fresh(day,hh,'cvs'); G.weekday=wdOf(day); const k0=STORY.knows; STORY.knows=id=>know; try{ return EVENTS.check(X); } finally { STORY.knows=k0; } };
  check('2. 事件：第 14 週週一 00:30 便利商店、認識芯慈＝會演；不認識、23:30、第 19 週以後不演',at(mon,24.5,true)&&!at(mon,24.5,false)&&!at(mon,23.5,true)&&!at(termDay('Y2S2',1,1),24.5,true));
  const play=async(pick)=>{ fresh(mon,24.5,'cvs'); meet('classmate_xinci'); SOCIAL.remember('classmate_xinci','LENT_NOTES',''); said=[]; opts=[]; picks=[pick]; await EVENTS.run(X); return L0(); };   /* AA_374 第 10 項：借過她筆記的玩家照原句（沒借過的另外在 tests/aa374_y2s1_unit.js）*/
  let L=await play(0);
  check('3. 開場、她說三年的第二名、「你的比我想的好。」；「妳有跟她說過嗎？」→「說什麼？『妳好，我是三年的第二名』？」「她笑，很短。」「不要。」；XINCI_SECOND',L.includes('芯慈：聯合模考的排名貼在牆上。她第一，我第二。三年。')&&L.includes('芯慈：（很平靜）我借你的筆記，是想知道第一名以外的人，筆記怎麼寫。……你的比我想的好。')&&L.slice(-3).join('｜')==='芯慈：說什麼？『妳好，我是三年的第二名』？｜她笑，很短。｜芯慈：不要。'&&SOCIAL.has('classmate_xinci','XINCI_SECOND'),JSON.stringify(L));
  L=await play(1); check('3. 「這部劇在演什麼？」→ 十分鐘的劇情、「十二點四十了，我要回去了，明天早八。」（AB65-3（AA_211 附錄 A 芯慈一列）；原本「十二點四十。我今天比了十八個小時，…」）',L.includes('芯慈：啊。我講太多了。')&&L.includes('芯慈：十二點四十了，我要回去了，明天早八。')&&!L.some(t=>/十八個小時/.test(t)));
  L=await play(2); check('3. 「第二名也很厲害。」→「她把咖啡蓋子蓋好。」「……我知道啦。」「（她拿起咖啡，揮了一下手就走了。）」（AA_428 §2 第 5 點：拿掉第一句「我知道。」和「……好啦，我知道。」；AB65-3（AA_211 附錄 A 芯慈一列）原本「可是第二名是用來跟第一名比的。」）',L.slice(-3).join('｜')==='她把咖啡蓋子蓋好。｜芯慈：……我知道啦。｜（她拿起咖啡，揮了一下手就走了。）'&&!L.includes('芯慈：我知道。'),JSON.stringify(L.slice(-4)));
  const xd=NEEDED_MSGS.list.find(x=>x.id==='xc_drama'); check('4. 主線 4「那部劇大結局了」：慈 3 以後才有',!xd.cond({events:{done:{}}})&&xd.cond({events:{done:{ev_xinci_second:1}}}));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
