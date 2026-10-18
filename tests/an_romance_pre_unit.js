// 以安的戀愛前置 STORY.anRomancePre（交換志願表 V4-E10；AA-B 2026-10-16 20:33，AA_113 第 6 節）——不需要瀏覽器。
// a 公法讀書會加入＋聽完 ≥3 次；b 辯過 ≥2（AN_APPEAL rule/case/ask、AN9_ARGUED、AN11_ARGUED；listen 不算）；c 以安 FRIEND 以上；d 沒有任何 dating_*（可昕也算）、分手 ≥28 天。
// 分手的天數：romance3d 的 S.end 記 day（新）；舊紀錄只有 at（學期週次）→ 當作那一週最後一天。
// 用法：node tests/an_romance_pre_unit.js
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
  const day=D('2027-11-17'); const base=()=>{ fresh(day,15.5,'cafe',{PUBLIC_LAW_GROUP:true,AN_APPEAL:'rule',AN9_ARGUED:true}); G.stage='law'; G.acts={att:{}};
    for(const k of ['2026-03-12','2026-03-19','2026-03-26']) G.acts.att['public_law_group@'+D(k)]={end:'full'}; R('heroine_01',...LV.FRI); };
  base(); let w=STORY.anRomancePre(G,true);
  check('1. 四項都成立＝成立',w.ok&&w.group&&w.attend===3&&w.argued===2&&w.friend&&w.single,JSON.stringify(w));
  base(); delete G.acts.att['public_law_group@'+D('2026-03-26')]; G.acts.att['public_law_group@'+D('2026-04-02')]={end:'partial'}; w=STORY.anRomancePre(G,true);
  check('2. a 項拿掉（AA-C 07:50、BB_191 §8-6：讀書會不是門檻）：公法讀書會只聽完 2 次也成立',w.ok===true&&!w.group&&w.attend===2,JSON.stringify(w));
  base(); delete G.flags.PUBLIC_LAW_GROUP; w=STORY.anRomancePre(G,true); check('2. 沒加入讀書會也成立（a 項拿掉）',w.ok===true&&!w.group);
  base(); G.flags.AN_APPEAL='listen'; w=STORY.anRomancePre(G,true); check('3. 申訴選 listen 不算辯過：只剩 1 次，不成立',!w.ok&&w.argued===1);
  base(); G.flags.AN_APPEAL='ask'; delete G.flags.AN9_ARGUED; G.flags.AN11_ARGUED=true; w=STORY.anRomancePre(G,true); check('3. ask＋新 11：2 次，成立',w.ok&&w.argued===2);
  base(); R('heroine_01',...LV.FAM); w=STORY.anRomancePre(G,true); check('4. 以安只到 FAMILIAR：不成立',!w.ok&&!w.friend,w.stage);
  base(); G.flags.dating_kexin=true; w=STORY.anRomancePre(G,true); check('5. 和可昕交往中：不成立',!w.ok&&!w.single&&w.dating.includes('dating_kexin'));
  base(); G.flags.dating_heroine_04=true; w=STORY.anRomancePre(G,true); check('5. 和別人交往中：不成立',!w.ok&&!w.single);
  base(); G.flags.romance={heroine_04:{status:'ex',history:[{ev:'end',at:'Y3S1W10',day:day-20,how:'apart_talk'}]}}; w=STORY.anRomancePre(G,true);
  check('6. 20 天前分手：不成立（要 28 天）',!w.ok&&!w.single&&w.since===20,JSON.stringify(w));
  base(); G.flags.romance={heroine_04:{status:'ex',history:[{ev:'end',at:'Y3S1W5',day:day-40}]}}; w=STORY.anRomancePre(G,true); check('6. 40 天前分手：成立',w.ok&&w.since===40);
  base(); G.flags.romance={heroine_04:{status:'ex',history:[{ev:'end',at:'Y3S1W10'}]}}; w=STORY.anRomancePre(G,true);
  check('6. 舊紀錄只有 at（Y3S1 第 10 週）：當作那一週最後一天，到 11/17（第 11 週週三）不到 28 天，不成立',!w.ok&&w.since>0&&w.since<28,JSON.stringify(w));
  { fresh(day,15.5,'cafe',{}); global.ROMANCE&&ROMANCE.get; const src=require('fs').readFileSync(require('path').join(ROOT,'src/romance3d.js'),'utf8');
    check('7. romance3d 的 S.end 記分手那一天（day）',/ev:'end',at:S\.when\(G\),day:G\.day/.test(src)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
