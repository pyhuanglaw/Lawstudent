// v0 寒假（AA_154 A16）：1/6 轉場回家、寒假模式的選單（過幾天／睡覺停在固定點）、F1、E21、E24、E23、回宿舍——不需要瀏覽器。
// 修改前沒有寒假模式（全部失敗）。用法：node tests/v0_winter_unit.js
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
(async()=>{
  const K=k=>STORY.dayOfKey(k), J5=K('2025-01-05'), J6=K('2025-01-06'), J27=K('2025-01-27'), J28=K('2025-01-28'), F8=K('2025-02-08'), F16=K('2025-02-16');
  fresh(J5,22,'dorm'); G.stage='econ'; check('1. 1/5 晚上：還不是寒假',!HOME.winterStartDue(G));
  G.day=J6; G.hour=5.5; check('1. 1/6 06:00 以前不轉場',!HOME.winterStartDue(G)); G.hour=8.5; check('1. 1/6 早上：寒假開始',HOME.winterStartDue(G));
  G.stage='law'; check('1. 法律系的存檔：沒有',!HOME.winterStartDue(G)); G.stage='econ';
  // 轉場 → 選單：吃晚餐／過幾天／睡覺，沒有回宿舍
  picks=[]; let menus=[]; const choose0=GM.choose; let script=[];
  GM.choose=async o=>{ const t=o.map(q=>q.t); menus.push(t); const w=script.shift(); if(w==null){ throw new Error('STOP'); } const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  script=['過幾天']; said=[]; try{ await HOME.winterStart(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('2. 轉場：在家、寒假模式、選單沒有「回宿舍」',HOME.at(G)&&G.home.winter===true&&G.flags.Y0_WINTER_START&&!menus[0].some(t=>/回宿舍/.test(t))&&menus[0].includes('過幾天')&&menus[0].includes('睡覺'),JSON.stringify(menus[0]));
  check('2. 「過幾天」跳到 1/27（一）21:00（F1），手機收到小年夜的群組',G.day===J27&&Math.abs(G.hour-21)<1e-6&&PHONE.sent(G,'y0_f1'),G.day+' '+G.hour);
  check('2. 跳過的日子：E24 照時間戳記收在可昕的私訊裡（1/10「不知道今天星期幾」不用回、1/18「今天好冷。你那邊幾度？」三選一（AA_368 L9a：原本「什麼湯」假設題）；2/2 那則還沒到）',TH('p:kexin').some(m=>m.text==='放假第三週，我已經不知道今天星期幾了'&&!m.ask)&&TH('p:kexin').some(m=>m.text==='今天好冷。你那邊幾度？'&&m.ask&&m.ask.opts.map(o=>o.t).join('/')==='十四度。/不知道，我在被窩裡。/冷到不想講話。'&&JSON.stringify(m.ask.opts.map(o=>o.say.map(x=>x.text)))===JSON.stringify([['高雄二十二度。……我不是在炫耀。'],['好好喔。我也是。'],['那你不要講。聽我講就好。']]))&&!TH('p:kexin').some(m=>/什麼湯/.test(m.text))&&!TH('p:kexin').some(m=>m.text==='我媽說我寒假胖了。'));
  check('2. 第一次「過幾天」：字卡後面「寒假。你睡到中午，下午幫媽媽跑腿。」「年前的家裡，一直有人在打掃。」（AA_154 A44）',said.map(x=>x.t).join('|')==='寒假。你睡到中午，下午幫媽媽跑腿。|年前的家裡，一直有人在打掃。',JSON.stringify(said));
  // 睡覺會停在 E21 22:00 → E21 自動演
  menus=[]; said=[]; script=['睡覺','過幾天','「好。」','過幾天']; G.home.eat={day:J27}; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  const L=said.map(x=>x.t);
  check('3. 1/27 晚上睡覺（1/28 早上醒）→「過幾天」到 1/28 22:00 → E21（AA_303 第 2 節 14）「好了。……新年快樂。」「初三你要不要來高雄？開車來。我帶你去玩。」→「好。」→「那初三早上出發。到了打給我。」、KH_TRIP；不記 E21_ANSWER',L.includes('好了。……新年快樂。')&&L.includes('初三你要不要來高雄？開車來。我帶你去玩。')&&L.includes('那初三早上出發。到了打給我。')&&G.flags.KH_TRIP===true&&G.flags.E21_ANSWER==null,JSON.stringify(L));
  check('3. E21 之後「過幾天」跳到 2/8 23:00（E24 那一晚），旁白「過年的幾天，親戚來來去去。……」；2/2「胖了是存糧」收到了',G.day===F8&&Math.abs(G.hour-23)<1e-6&&L.includes('過年的幾天，親戚來來去去。每個人都問你經濟系好不好玩。')&&(run(23,23.05),TH('p:kexin').some(m=>m.text==='我媽說我寒假胖了。')),G.day+' '+G.hour);
  run(23,23.1); { const N=TH('p:kexin').filter(m=>m.tag==='y0_e24n'); check('4. E24 那一晚（AA_368 H3）：「我把高三的講義翻出來了。」「數學那本，每一頁都畫滿了。……我那時候到底在想什麼。」兩則、沒有選項（原本「如果可以重來一次選科系」三選一：2/2 已經說好一起考法律、又是假設題）',JSON.stringify(N.map(m=>m.text))===JSON.stringify(['我把高三的講義翻出來了。','數學那本，每一頁都畫滿了。……我那時候到底在想什麼。'])&&N.every(m=>!m.ask)&&!TH('p:kexin').some(m=>/重來一次選科系/.test(m.text)),JSON.stringify(N.map(m=>m.text))); }
  { const r=PHONE.answer(G,'y0_e24n',0); run(23.1,23.6); check('4. AA_368 H3：沒有選項可以回（原本選「法律。」15 分鐘後才回）、y0_e24n_late 拿掉（23:15 以後沒有「好。」「……我是在問我自己。晚安。」）；不記錄 E24 旗標',!r&&!PHONE.sent(G,'y0_e24n_late')&&!TH('p:kexin').some(m=>m.text==='……我是在問我自己。晚安。')&&!Object.keys(G.flags).some(k=>/E24/.test(k))); }
  // 最後：E23 → 回宿舍
  menus=[]; said=[]; script=['過幾天']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  const L2=said.map(x=>x.t);
  /* 第 5 項（2/16 E23 → 回宿舍）拿掉：AA_224 5-1 E23 改到 2/12、不回宿舍；新流程 10/19 就退宿，寒假模式不會再進（tests/lifeline_g5_unit.js）*/
  // E21 三個回答
  for(const [pk,fl,line] of [['「好。」',{},'那初三早上出發。到了打給我。'],['「我媽會問我去哪。」',{KX_THINK_LEAVE:'wait'},'說去找女朋友。……初三，不准遲到。']]){ fresh(J28,22,'home',fl); G.stage='econ'; said=[]; GM.choose=async o=>{ const k=o.findIndex(q=>(q.t||q.text)===pk); return k<0?0:k; }; await EVENTS.run(ev('ev_y0_e21'));
    check('6. E21 '+pk+'→「'+line+'」（最後一句）、KH_TRIP、E21_CALLED',said[said.length-1].t===line&&G.flags.KH_TRIP===true&&G.flags.E21_CALLED===true,JSON.stringify(said.slice(-2))); }
  fresh(J28,21.9,'home'); G.stage='econ'; check('6. E21：22:00 以前不演',!EVENTS.check(ev('ev_y0_e21'))); G.hour=22; check('6. E21：22:00 演',EVENTS.check(ev('ev_y0_e21')));
  // 睡覺會經過 E21 的 22:00：停在 22:00 演 E21
  fresh(J28,21.5,'home'); G.stage='econ'; G.flags.Y0_WINTER_START=true; G.home={at:true,winter:true,eat:{day:J28}}; said=[]; script=['睡覺','我媽會問']; GM.choose=async o=>{ const t=o.map(q=>q.t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } check('7. 1/28 21:30 睡覺：停在 22:00、E21 照演（核心不會睡過）',G.day===J28&&said.some(x=>x.t==='說去找女朋友。……初三，不准遲到。'),G.day+' '+G.hour);
  GM.choose=choose0;
  { const F2=K('2025-02-02'), txt=()=>TH('p:kexin').filter(m=>m.tag==='y0_e24b').map(m=>m.text);
    fresh(F2,22,'home'); G.stage='econ'; G.flags.KH_TRIP_DONE=true; run(22,22.6); const a=txt();
    fresh(F2,22,'home'); G.stage='econ'; run(22,22.6); const b=txt();
    check('AA_449 1-5：2/2 22:30 去過高雄（KH_TRIP_DONE）＝「到家了沒。」「我媽說我這三天胖了。……都是夜市害的。」；沒去＝「我媽說我寒假胖了。」', JSON.stringify(a)===JSON.stringify(['到家了沒。','我媽說我這三天胖了。……都是夜市害的。'])&&JSON.stringify(b)===JSON.stringify(['我媽說我寒假胖了。']), JSON.stringify({a,b})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
