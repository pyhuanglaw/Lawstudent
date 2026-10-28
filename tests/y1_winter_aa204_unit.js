// AA_204 大一寒假（27711a39）：12/26 阿哲揪跨年、海邊；12/29 海邊一日遊；跨年四段（麵店、管制線、頂樓、群組）＋交往中（以安跑步、語彤電話）；返鄉回臺北訊息；ZHE_SNACK_Y1——不需要瀏覽器。用法：node tests/y1_winter_aa204_unit.js
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
  const nye=D('2025-12-31'), d26=D('2025-12-26'), d29=D('2025-12-29');
  // 1. 12/26 阿哲揪跨年＋海邊（麵店團群組）
  fresh(d26,20.9,'dorm',{}); G.stage='law'; meet('zhe'); meet('yu'); meet('classmate_bohan'); meet('classmate_xinci'); meet('heroine_01'); R('heroine_01',25,0,0); PHONE.join(G,'noodle_team','麵店團');
  run(20.9,21.8);
  const T=txt('g:noodle_team');
  check('1. 12/26 21:00 阿哲「跨年有人要一起嗎」「先吃飯，再去看煙火」＋選項 我去／我直接到頂樓／再看看',T.includes('zhe:跨年有人要一起嗎')&&T.includes('zhe:宿委會說頂樓會開 訪客一樓登記，十二點半前要走')/* 大一的字 AA_456 1-1 換 */&&T.includes('zhe:先吃飯，再去看煙火')&&JSON.stringify(((G.msgs||[]).find(m=>m.ask&&m.ask.id==='nye_y1_ask')||{ask:{opts:[]}}).ask.opts.map(o=>o.t))===JSON.stringify(['我去','我直接到頂樓','再看看']),JSON.stringify(T));
  check('1. 21:05 起海邊六則（以安 FAMILIAR 以上回「我可以。幾點集合？」）',['zhe:29 號去海邊？我 2 號就回高雄了','yu:冬天去海邊？？','yu:好啊','classmate_bohan:火車九點十分有一班。','classmate_xinci:我怕冷，我不去了。你們拍照。','heroine_01:我可以。幾點集合？'].every(x=>T.includes(x)),JSON.stringify(T));
  PHONE.answer(G,'nye_y1_ask',0); PHONE.answer(G,'va03_ask',0); STORY.phoneRules(GM);
  check('1. 海邊選「我去」＝12/29 08:50 臺北車站（出遊）',!!OUT.get(G,'va03')&&OUT.get(G,'va03').day===d29&&Math.abs(OUT.get(G,'va03').h-(8+50/60))<1e-6);
  // 2. 海邊當天
  G.day=d29; G.hour=8.5; said=[]; picks=[0]; await EVENTS.run(ev('ev_va03_beach')); let L=lines();
  check('2. 海邊：以安在場「你的鞋子。被浪捲走一隻了。」、撿鞋子「謝啦！」、合照、回程；VA03_BEACH went、VA03_SHOE',L.some(t=>t.includes('你的鞋子。被浪捲走一隻了。'))&&L.some(t=>t.includes('謝啦！'))&&L.some(t=>t.includes('拍了五張'))&&G.flags.VA03_BEACH==='went'&&G.flags.VA03_SHOE===true,JSON.stringify(L.slice(0,8)));
  G.hour=20.5; STORY.phoneRules(GM); PHONE.tick(G);
  check('2. 當晚群組：Alison「五張裡最好的一張」、阿哲「鞋子回來了」',txt('g:noodle_team').includes('yu:五張裡最好的一張')&&txt('g:noodle_team').includes('zhe:鞋子回來了'));
  // 3. 跨年：我去＝19:00 麵店 → 一起去 → 管制線（不認識明軒）→ 頂樓
  G.day=nye; G.hour=12; STORY.phoneRules(GM); const q=OUT.get(G,'nye');
  check('3. 「我去」＝19:00 麵店（ev_nye_dinner）',!!q&&q.ev==='ev_nye_dinner'&&q.h===19);
  G.hour=19; said=[]; picks=[0,0]; await EVENTS.run(ev('ev_nye_dinner')); L=lines();
  check('3. 麵店→「（九點半，芯慈先站起來。）」→ 一起去 → 以安（不到 FRIEND）先回宿舍 → 管制線旁白（不認識明軒）→ 頂樓 →「……我們就說有看到」',L.some(t=>t.includes('老闆娘把門口那張桌子也搬了進來'))&&L.includes('（九點半，芯慈先站起來。）')&&L.some(t=>t.includes('我先回宿舍了。新年快樂。'))&&L.includes('（前面的人說，再過去要排一個小時。）')&&!L.some(t=>t.includes('明軒'))&&L.some(t=>t.includes('……我們就說有看到'))&&G.flags.NYE_Y1==='roof',JSON.stringify(L));
  check('3. 頂樓：以安不在（不到 FRIEND）＝沒有她的「新年快樂。」',!L.some(t=>/沈以安：新年快樂/.test(t)));
  G.hour=24.3; STORY.phoneRules(GM); PHONE.tick(G);
  check('3. 00:12 群組：Alison「上半截的煙火🎆」；00:05 芯慈「新年快樂。我在家看電視倒數。」；以安沒上頂樓＝私訊「新年快樂。」',txt('g:noodle_team').includes('yu:上半截的煙火🎆')&&txt('g:noodle_team').includes('classmate_xinci:新年快樂。我在家看電視倒數。')&&txt('p:heroine_01').includes('heroine_01:新年快樂。'));
  // 4. 認識明軒＋和以安交往中：管制線兩句、頂樓跑步那句
  fresh(nye,19,'campus',{dating_heroine_01:true}); G.stage='law'; meet('zhe'); meet('yu'); meet('classmate_bohan'); meet('heroine_01'); meet('classmate_mingxuan'); R('classmate_mingxuan',10,0,0);
  said=[]; picks=[0,0,0]; await EVENTS.run(ev('ev_nye_dinner')); L=lines();
  check('4. 認識明軒：「（管制線那邊，明軒穿著工作背心，手上拿著擴音器。）」「欸？你們也來喔。」「前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。」（AA_432 4-4：BB_171 3-1 定稿；原本 AA_204「欸！你們也來喔！」「這邊真的過不去了啦。……」；AA_313 5-7：當面不說「哈哈」）',L.includes('（管制線那邊，明軒穿著工作背心，手上拿著擴音器。）')&&L.some(t=>t.endsWith('欸？你們也來喔。'))&&L.some(t=>t.endsWith('前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。'))&&!L.some(t=>/哈哈/.test(t))&&!L.includes('（前面的人說，再過去要排一個小時。）'),JSON.stringify(L.filter(t=>/明軒|管制/.test(t))));
  check('4. 和以安交往中：她上頂樓、00:10「明天早上我要去跑步。你要不要一起？」→「六點？」→「七點。元旦，晚一點。」',L.some(t=>t.includes('明天早上我要去跑步。你要不要一起？'))&&L.some(t=>t.includes('七點。元旦，晚一點。'))&&!L.some(t=>t.includes('我也回去了。'))&&G.flags.AN_RUN_NY_Y1===true,JSON.stringify(L.slice(-6)));
  // 5. 和語彤交往中、只吃飯就回去：00:01 她打電話（出遊系統）；在頂樓的在事件裡
  fresh(nye,21,'campus',{dating_heroine_03:true,NYE_Y1:'dinner'}); G.stage='law'; meet('heroine_03'); R('heroine_03',30,0,0); G.hour=23.6; STORY.phoneRules(GM);
  check('5. 語彤交往中、不在頂樓：00:01 電話（接起來）；沒有「新年快樂。」＋電視照片那則',!!OUT.get(G,'yt_nye_call_y1')&&OUT.get(G,'yt_nye_call_y1').verb==='接起來');
  G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); check('5. 交往中＝沒有私訊那則',!txt('p:heroine_03').length);
  fresh(nye,23.7,'campus',{dating_heroine_03:true}); G.stage='law'; meet('heroine_03'); said=[]; picks=[1,0]; await EVENTS.run(ev('ev_nye_roof')); L=lines();
  check('5. 在頂樓：零點過一分語彤的電話「你們在頂樓喔？好吵。」→「妳們在看什麼？」→「跨年晚會。我媽在跟著唱。」',L.some(t=>t.includes('你們在頂樓喔？好吵。'))&&L.some(t=>t.includes('跨年晚會。我媽在跟著唱。')));
  // 6. 返鄉、回臺北
  fresh(D('2026-01-09'),16.9,'dorm',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',25,0,0); PHONE.join(G,'noodle_team','麵店團'); run(16.9,17.2);
  check('6. 1/9 17:00 柏翰「我今天回新竹。2/19 回來。」',txt('g:noodle_team').includes('classmate_bohan:我今天回新竹。2/19 回來。'));
  G.day=D('2026-01-20'); run(14.9,15.2); check('6. 1/20 15:00 以安（FAMILIAR 以上）私訊「回台中了。」＋照片',txt('p:heroine_01').includes('heroine_01:回台中了。')&&txt('p:heroine_01').includes('heroine_01:📷（車窗外的田）'));
  G.day=D('2026-02-20'); run(18.9,19.2); check('6. 2/20 19:00 阿哲「我回來了！高雄帶了吃的，開學那天拿去給你們」',txt('g:noodle_team').includes('zhe:我回來了！高雄帶了吃的，開學那天拿去給你們'));
  G.day=D('2026-02-23'); G.weekday=wdOf(G.day); G.zone='classroom'; check('6. 2/23 起遇到阿哲：ZHE_SNACK_Y1 的事件條件成立；「拿去，我媽買太多了」',ev('ev_zhe_snack_y1').prereq.custom(G)&&ev('ev_zhe_snack_y1').dialogue[0].text==='拿去，我媽買太多了');
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
