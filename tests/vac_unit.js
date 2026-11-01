// 假期活動（VAC；AA_199、AA_241）第一批：大一暑假的營隊隊輔、日語課、日本五天；招募／邀約、報名、籌備會、整段出遊、沒去的訊息、大一暑假的訊息、衝突、存讀檔——不需要瀏覽器。用法：node tests/vac_unit.js
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
  if(typeof VAC==='undefined'){ console.log('FAIL 0. 沒有 VAC'); console.log('FAILED 1'); process.exit(1); }
  const I2=VAC.inst('C02','Y1'), I3=VAC.inst('C03','Y1'), I5=VAC.inst('C05','Y1');
  check('1. 大一暑假：營隊 7/1～7/5、日語課 7/7～7/23（週二四）、日本 8/24～8/28',I2.from===D('2026-07-01')&&I2.to===D('2026-07-05')&&I3.from===D('2026-07-07')&&VAC.daysOf(I3).length===6&&I5.from===D('2026-08-24')&&I5.to===D('2026-08-28'),JSON.stringify(VAC.daysOf(I3).map(d=>CALENDAR.dateOf(d).key)));
  check('1. 日本那一團只有大一（之後是 C13 出國旅遊）',VAC.inst('C05','Y2')===null);
  // 2. 營隊：大一下第 12 週週一 21:00 全班群組招募 → 我也報 → 籌備會（第 14 週週三 19:00）、7/1 出發
  const w12=termDay('Y1S2',12,1); fresh(w12,20.9,'dorm',{}); G.stage='law'; meet('classmate_xinci'); meet('classmate_peishan'); PHONE.join(G,'law_class','法律系 大一（全班）'); run(20.9,21.2);
  const T2=txt('g:law_class');
  check('2. 招募：系學會【法律生活營 隊輔招募】＋芯慈「我報了」「有人要一起嗎」＋沛珊「我也報了」，選項「我也報。」',T2.some(t=>t.includes('【法律生活營 隊輔招募】7/1～7/5'))&&T2.includes('classmate_xinci:有人要一起嗎')&&T2.includes('classmate_peishan:我也報了')&&((G.msgs||[]).find(m=>m.ask&&m.ask.id==='vac_ask_C02@Y1')||{ask:{opts:[]}}).ask.opts[0].t==='我也報。',JSON.stringify(T2));
  PHONE.answer(G,'vac_ask_C02@Y1',0); STORY.phoneRules(GM);
  check('2. 報了：CAMP_Y1_STAFF、籌備會（第 14 週週三 19:00）、7/1 08:30 出發都排了',G.flags.CAMP_Y1_STAFF===true&&VAC.state(G,'C02@Y1')==='yes'&&!!OUT.get(G,'vac_C02@Y1_prep')&&OUT.get(G,'vac_C02@Y1_prep').day===termDay('Y1S2',14,3)&&!!OUT.get(G,'vac_C02@Y1')&&OUT.get(G,'vac_C02@Y1').day===D('2026-07-01'));
  said=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y1_prep')); let L=lines();
  check('2. 籌備會：流程表、「因為是高中生。」→「紅色那幾格我可以幫忙。」→「寫上去了，不能改。」',L.some(t=>t.includes('因為是高中生。'))&&L.some(t=>t.includes('寫上去了，不能改。')),JSON.stringify(L));
  G.day=D('2026-07-01'); G.hour=8.5; said=[]; cards=[]; picks=[0,0]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y1')); L=lines();
  check('2. 營隊整段：報到（沛珊蹲在行李箱旁邊）→ 7/3 晚會（學員「學長，法律系很難嗎？」）→ 7/5 最後一天（卡片、沛珊的問題）→ 7/5 17:00；參加過',L.some(t=>t.includes('她走過去，蹲在那個女生的行李箱旁邊。'))&&L.some(t=>t.includes('學長，法律系很難嗎？'))&&L.some(t=>t.includes('謝謝學長第二天下午沒有放棄我們這組。'))&&L.some(t=>t.includes('問你一件事。'))&&G.day===D('2026-07-05')&&G.hour>=17-1e-6&&VAC.state(G,'C02@Y1')==='done'&&G.flags.PS_CAMP_REMEMBER===true,JSON.stringify([G.day-D('2026-07-05'),G.hour,cards]));
  check('2. 字卡寫日期和「營隊（校內）」',cards.some(c=>c[0].startsWith('7/3')&&c[1]==='營隊（校內）'),JSON.stringify(cards));
  // 3. 沒報名：7/5 21:00 芯慈私訊（ACQUAINTANCE 以上）
  fresh(D('2026-07-05'),20.9,'dorm',{}); G.stage='law'; meet('classmate_xinci'); R('classmate_xinci',10,0,0); run(20.9,21.2);
  check('3. 沒去營隊：7/5 21:00 芯慈「營隊結束了」＋照片＋「少一個人排班。下次來喔」',txt('p:classmate_xinci').includes('classmate_xinci:營隊結束了')&&txt('p:classmate_xinci').includes('classmate_xinci:少一個人排班。下次來喔'));
  // 4. 日語課：以安 FAMILIAR 以上 6/20 21:00 私訊；報名後三堂（7/7、7/16、7/23）
  fresh(D('2026-06-20'),20.9,'dorm',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',25,0,0); run(20.9,21.2);
  check('4. 6/20 以安「我暑假要上日語課，公館那間，週二四晚上」…「你如果也想學，報名到這個禮拜五」',txt('p:heroine_01').includes('heroine_01:你如果也想學，報名到這個禮拜五'));
  PHONE.answer(G,'vac_ask_C03@Y1',0); STORY.phoneRules(GM);
  check('4. 報了：三個關鍵事件排在 7/7、7/16、7/23 19:00；家裡出（家人群組沒有另外一句＝卡片沒寫）',['vac_C03@Y1_0','vac_C03@Y1_1','vac_C03@Y1_2'].every(k=>!!OUT.get(G,k))&&OUT.get(G,'vac_C03@Y1_1').day===D('2026-07-16'));
  G.day=D('2026-07-16'); said=[]; picks=[1]; const r0=SOCIAL.rel('heroine_01').fam; await VAC.outing(GM,OUT.get(G,'vac_C03@Y1_1')); L=lines();
  check('4. 小考：「九十二。片假名寫錯一個。」→「我錯了五個。」→「……那下課一起練。十分鐘。」（熟悉 +2）',L.some(t=>t.includes('九十二。片假名寫錯一個。'))&&L.some(t=>t.includes('那下課一起練。十分鐘。'))&&SOCIAL.rel('heroine_01').fam===r0+2);
  fresh(D('2026-06-20'),20.9,'dorm',{}); G.stage='law'; run(20.9,21.2); check('4. 不熟以安：沒有那則私訊',!txt('p:heroine_01').length);
  check('4. 不熟的也可以在手機「活動」的假期行事曆報名（有「報名」）',/data-vac="C03@Y1"/.test(VAC.html(G)));
  // 5. 日本：7/15 阿凱私訊 → 去 → 家人群組「機票多少？我轉給你。」→ 8/24～8/28 整段
  fresh(D('2026-07-15'),20.9,'dorm',{}); G.stage='law'; meet('kai'); run(20.9,21.2);
  const K=(G.msgs||[]).find(m=>m.ask&&m.ask.id==='vac_ask_C05@Y1');
  check('5. 7/15 阿凱「8/24 要不要去日本」…；選項 去。／我問一下家裡。／這次不行。',txt('p:kai').includes('kai:8/24 要不要去日本')&&!!K&&JSON.stringify(K.ask.opts.map(o=>o.t))===JSON.stringify(['去。','我問一下家裡。','這次不行。']));
  PHONE.answer(G,'vac_ask_C05@Y1',0); STORY.phoneRules(GM); PHONE.tick(G);
  check('5. 去：「好 我拉你進群」、家人群組媽媽「機票多少？我轉給你。」、8/24 06:00 出發',txt('p:kai').includes('kai:好 我拉你進群')&&txt('g:home').includes('mom:機票多少？我轉給你。')&&!!OUT.get(G,'vac_C05@Y1')&&OUT.get(G,'vac_C05@Y1').h===6);
  G.day=D('2026-08-24'); G.hour=6; meet('heroine_01'); G.flags.dating_heroine_01=true; said=[]; cards=[]; picks=[0,1]; await VAC.outing(GM,OUT.get(G,'vac_C05@Y1')); L=lines();
  check('5. 日本整段：機場「裡面是空的。回來會滿。」→ 秋葉原（玻璃櫃）→ 飯糰「……喔，你就是我室友。」→ 最後一晚「不要排博物館。」以外的那句 → 8/28 18:00',L.some(t=>t.includes('裡面是空的。回來會滿。'))&&L.some(t=>t.includes('我存到一半，拿去買了一台二手鍵盤。'))&&L.some(t=>t.includes('……喔，你就是我室友。'))&&L.some(t=>t.includes('他會一直問哪裡可以吃。'))&&G.day===D('2026-08-28')&&VAC.state(G,'C05@Y1')==='done',JSON.stringify(L.slice(-4)));
  check('5. 交往中（以安）：8/24 08:00「到了傳一張照片。一張就好。」',txt('p:heroine_01').includes('heroine_01:到了傳一張照片。一張就好。'));
  check('5. 字卡寫「日本」',cards.some(c=>c[1]==='日本'));
  fresh(D('2026-08-28'),20.9,'dorm',{}); G.stage='law'; meet('kai'); run(20.9,21.2); check('5. 沒去：8/28 21:00 阿凱「📷（秋葉原的街…）」「買到了」',txt('p:kai').includes('kai:買到了'));
  // 6. 大一暑假的訊息
  fresh(D('2026-07-06'),21.4,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21.4,21.6); check('6. 7/6 21:30 Alison「隊輔第一天 我已經沒聲音了」',txt('g:noodle_team').includes('yu:隊輔第一天 我已經沒聲音了'));
  fresh(D('2026-07-31'),20.9,'dorm',{dating_heroine_03:true}); G.stage='law'; run(20.9,21.2); check('6. 交往中、整個暑假沒排事：7/31 語彤「你暑假是不是很閒」「那明天下午陪我去進貨」',txt('p:heroine_03').includes('heroine_03:那明天下午陪我去進貨'));
  fresh(D('2026-07-31'),20.9,'dorm',{dating_heroine_03:true}); G.stage='law'; G.vac={reg:{'C03@Y1':'yes'},seen:{},log:[]}; run(20.9,21.2); check('6. 有排事＝不傳',!txt('p:heroine_03').length);
  // 7. 衝突、存讀檔
  fresh(D('2026-06-01'),12,'dorm',{}); G.stage='law'; G.vac={reg:{'C02@Y1':'yes'},seen:{},log:[]}; check('7. 營隊和日語課不撞（7/1～5 vs 7/7 起）',!VAC.conflicts(G,I3).length);
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('7. 存讀檔：報名狀態留著',VAC.state(G,'C02@Y1')==='yes');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
