// 交接包 v3 D9：以安新 10「家教學生的家（一）」（交接包 v3 第 3b 節、AA_177 4-8）——不需要瀏覽器。
// 檢查：只在 12/1（二）17:30～20:30 的麵店、認識以安；認識語彤＝社工那一句＋選項多「法服週六有值班。」；不認識語彤＝Alison 說法服；三個選項的回應；AN_TUTOR_FAMILY:1；沒到＝沒有。用法：node tests/v3_d9_unit.js
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };

(async()=>{
  const NM={'沈以安':'以安','陳語彤':'語彤','Alison':'Alison','不認識的女生':'?'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const A=ev('ev_an_tutor_family_1'), d=D('2026-12-01');
  check('0. 12/1 是大二上第 13 週週二',CALENDAR.termOf(d).id==='Y2S1'&&CALENDAR.termOf(d).week===13&&wdOf(d)===2);
  const at=(day,hh,know)=>{ fresh(day,hh,'noodle'); const k0=STORY.knows; STORY.knows=(id)=>know.includes(id); try{ return EVENTS.check(A); } finally { STORY.knows=k0; } };
  check('1. 12/1 18:00 麵店、認識以安：會演；12/3、17:00、不認識以安：不演',at(d,18,['heroine_01'])&&!at(d+2,18,['heroine_01'])&&!at(d,17,['heroine_01'])&&!at(d,18,[]));
  const play=async(know,pick)=>{ fresh(d,18,'noodle'); for(const id of know) meet(id); const k0=STORY.knows; STORY.knows=(id)=>id==='zhe'||know.includes(id); said=[]; opts=[]; picks=[pick]; try{ await EVENTS.run(A); } finally { STORY.knows=k0; } return {L:L0(),O:opts[0]||[]}; };
  let r=await play(['heroine_01','heroine_03','yu'],'理由');
  check('2. 認識語彤：語彤「通常先找社工吧，我們課上是這樣講的。」、手帳那句旁白刪掉；三個選項；「看理由。……」＋「（她拿出手機記下來。）」（AB65-3（AA_211 附錄 A 語彤一列）、以安一列）；AN_TUTOR_FAMILY:1',r.L.includes('以安：社會系的人，申請被駁回的家庭，通常第一個找誰？')&&r.L.includes('語彤：通常先找社工吧，我們課上是這樣講的。')&&!r.L.some(t=>/手帳|然後才是你們/.test(t))&&r.O.length===3&&r.L.includes('以安：看理由。……對，先看理由。還有寫期限的那一段。')&&r.L.includes('（她拿出手機記下來。）')&&!r.L.some(t=>/理由欄/.test(t))&&G.flags.AN_TUTOR_FAMILY===1&&!r.L.some(t=>/^Alison：/.test(t)),JSON.stringify(r));
  r=await play(['heroine_01','yu'],'已經在幫');
  check('3. 不認識語彤：Alison「法服週六有值班啊。」以安「我知道。我想先知道我不該說什麼。」；兩個選項；「這不算。」「她停了一下。」「……好，算一點。」',r.L.includes('Alison：法服週六有值班啊。')&&r.L.includes('以安：我知道。我想先知道我不該說什麼。')&&r.O.length===2&&r.L.slice(-3).join('｜')==='以安：這不算。｜她停了一下。｜以安：……好，算一點。',JSON.stringify(r));
  check('4. 法律：不說哪一種補助、救濟程序（沒有「訴願」「行政法院」「期限是」）',!A.dialogue.some(l=>/訴願|行政法院|期限是|天內/.test(l.text||'')));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
