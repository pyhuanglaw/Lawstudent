// 1A-12 主線 12「畢業典禮的家人」（AA_318；台詞照 AA_318 第 2 節）——不需要瀏覽器。照 AA_318 第 7 節 G1～G4 寫：
//   1. 2029-06-02（六）：鬧鐘 08:00「畢業典禮」；08:00 宿舍旁白＋字卡 → 體育館（2D ntu_gym_ceremony）→ 撥穗（2D linze_auditorium，GRADUATED）→ 11:55 霖澤館大廳（3D）；
//   2. G2 交換延畢（日本、美國）撥穗後多「（還差一門實習，證書下學期才拿得到。）」；
//   3. 大廳：媽媽、姊姊的句子（AA_12 原文）、兩個選項都一定出現；G3「媽，今天先拍照。」＝姊姊比讚、信封晚上給（GRAD_ENVELOPE later）；
//   4. 13:30 公館的餐廳（3D 公館＋字卡）；G4 家人沒有人缺席、爸爸沒有台詞（只在旁白裡）；
//   5. 22:00 以後第一次在宿舍房間：大伯的信封照 FAMILY_LAND_Y3（G1 meal＝十六個人的訂位單）；睡著＝_bed；
//   6. 在家醒來：先回宿舍（home3d.js 的選單）。
// 修改前全部 FAIL。用法：node tests/grad_family_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let bgs=[]; global.ADV={active:false,preload(){},begin(o){ this.active=true; bgs.push(o&&o.background); },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(b){ bgs.push(b); },hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], entered=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push(a+'／'+(b||'')); },enter:async(z,s)=>{ entered.push(z); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW',ROOM_Y4:D('2028-09-03'),Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08'),PACKED_Y4:D('2029-06-01')},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; cards=[]; entered=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  const dg=D('2029-06-02');
  check('0. 2029-06-02 是週六、大四下第 15 週', CALENDAR.dateOf(dg).wd===6&&CALENDAR.termOf(dg).id==='Y4S2'&&CALENDAR.termOf(dg).week===15);
  // 1. 鬧鐘、早上
  fresh(dg-1,23,'dorm'); { const A=STORY.wakeAlarms(G,dg).find(a=>a.why==='畢業典禮'), o=STORY.bedOptions(G).find(x=>x.kind==='sleep'&&/中午/.test(x.t));
    check('1. 6/1 晚上睡覺：明天 08:00 鬧鐘「畢業典禮」（睡到中午也會被叫醒）', !!A&&A.h===8&&!!o&&o.wake===8&&o.alarm==='畢業典禮', JSON.stringify({A,o})); }
  fresh(dg,7.4,'dorm'); check('1. 07:30 以前還不到', !STORY.gradMorningDue(G)); G.hour=7.5; check('1. 起床就到（宿舍）', STORY.gradMorningDue(G));
  picks=[0]; await STORY.gradFamily(GM); let T=lines();
  check('1. 08:00「（學士服掛在門後面，已經燙過了。）」→ 字卡「2029 年 6 月 2 日／畢業典禮｜新體育館」', T[0]==='（學士服掛在門後面，已經燙過了。）'&&cards[0]==='2029 年 6 月 2 日／畢業典禮｜新體育館', JSON.stringify(cards));
  check('1. 校級典禮（2D ntu_gym_ceremony）：「（看台上，媽媽一直在揮手。爸爸舉著手機，沒有放下來過。）」', T[1]==='（看台上，媽媽一直在揮手。爸爸舉著手機，沒有放下來過。）'&&JSON.stringify(bgs).includes('ntu_gym_ceremony'));
  check('1. 法律學院（2D linze_auditorium）：「（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）」、GRADUATED＝那天；台灣路線沒有「還差一門實習」', T[2]==='（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）'&&JSON.stringify(bgs).includes('linze_auditorium')&&G.flags.GRADUATED===dg&&!T.some(t=>/還差一門實習/.test(t)));
  check('1. 撥穗以後 GRAD_DONE（閒聊階梯 A8-L6「畢業典禮，我媽要來。」等 skipIf GRAD_DONE 的不再播；BB210-Y4S2，修改前沒有人設）',G.flags.GRAD_DONE===true&&!!LADDER.byTerm.Y4S2.heroine_01.steps.find(x=>x.id==='A8-L6'&&x.skipIf&&(x.skipIf.flags||[]).includes('GRAD_DONE')));
  check('1. 11:55 霖澤館大廳（3D linze）：媽媽、姊姊（AA_12 原文）', entered.includes('linze')&&JSON.stringify(T.slice(3,9))===JSON.stringify(['媽媽：我們家第一個首都帝大畢業的。','（媽媽哭了。）','（爸爸沒有說話，拍照拍了五十張。）','姊姊：媽，不要哭了，妝。','媽媽：（從包包裡拿出一個信封）對了，大伯叫我拿給你——','姊姊：媽！今天！今天不要！']), JSON.stringify(T.slice(3,9)));
  check('1. 兩個選項都在（不讀傾向）', JSON.stringify(opts[0])===JSON.stringify(['「好。我回去看。」','「媽，今天先拍照。」']));
  check('1. 選①：GRAD_ENVELOPE took、「祐廷接過信封，放進學士服的口袋。」「（媽媽擦了一下眼睛。）」；12:00', G.flags.GRAD_ENVELOPE==='took'&&T.slice(-2).join('|')==='祐廷接過信封，放進學士服的口袋。|（媽媽擦了一下眼睛。）'&&Math.abs(G.hour-12)<0.01);
  check('1. 演過了不再演', !STORY.gradMorningDue(G));
  // 2. 交換延畢
  for(const [r,want] of [['JP','（還差一門實習，證書下學期才拿得到。）'],['US','（還差一門實習和兩門課，證書下學期才拿得到。）']]){ fresh(dg,7.5,'dorm',{EXCHANGE_ROUTE:r}); picks=[0]; await STORY.gradFamily(GM); T=lines(); check('2. G2 '+r+' 路線：撥穗後「'+want+'」（美國路線還要補修兩門課：AA_382 第 1 節第 1 項）', T[3]===want, T[3]); }
  // 3. G3
  fresh(dg,7.5,'dorm'); picks=[1]; await STORY.gradFamily(GM); T=lines();
  check('3. G3「媽，今天先拍照。」：「（姊姊比了一個讚。）」「媽媽把信封收回包包：「那晚上給你。」」、later', G.flags.GRAD_ENVELOPE==='later'&&T.slice(-2).join('|')==='（姊姊比了一個讚。）|媽媽把信封收回包包：「那晚上給你。」');
  // 4. 午餐
  G.hour=13.4; check('4. 13:30 以前還不到', !STORY.gradLunchDue(G)); G.hour=13.5; check('4. 13:30 到了（1A-13 拍照在 AA_319）', STORY.gradLunchDue(G));
  said=[]; cards=[]; entered=[]; await STORY.gradLunch(GM); T=lines();
  check('4. 3D 公館＋字卡「公館的餐廳」：兩句旁白＋姊姊一句；15:00', entered[0]==='gongguan'&&cards[0]==='公館的餐廳／'&&JSON.stringify(T)===JSON.stringify(['（公館的餐廳。爸爸點了一桌，說是慶祝。）','（媽媽把每一道菜都拍了一張。）','姊姊：媽，妳拍菜比拍他多。'])&&Math.abs(G.hour-15)<0.01, JSON.stringify(T));
  fresh(dg,17.5,'dorm'); G.events.done.ev_grad_family=1; check('4. 17:00 以後才回來：午餐不補（17:30 是 1A-14）', !STORY.gradLunchDue(G));
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), a=src.indexOf('S.gradFamily=async'), b=src.indexOf('S.gradEnvelopeDue='), seg=src.slice(a,b);
    check('4. G4 家人沒有人缺席、爸爸沒有台詞（說話的只有媽媽、姊姊；爸爸在旁白裡）', !/name:'爸爸'/.test(seg)&&/MOM_W/.test(seg)&&/SIS_W/.test(seg)&&/爸爸舉著手機/.test(seg)&&/爸爸點了一桌/.test(seg)); }
  // 5. 信封
  const env=async(land,h,zone)=>{ fresh(dg,h||22,zone||'dorm',land?{FAMILY_LAND_Y3:land}:{}); G.events.done.ev_grad_family=1; G.flags.GRAD_ENVELOPE='later'; const ok=STORY.gradEnvelopeDue(G); if(ok) await STORY.gradEnvelope(GM); return {ok,T:lines()}; };
  let R=await env('meal',21.9); check('5. 22:00 以前不開', !R.ok);
  R=await env('meal'); check('5. G1 主線 9 選③（meal）：「（一張餐廳的訂位單。十六個人。日期是下個月。）」', R.ok&&JSON.stringify(R.T)===JSON.stringify(['（晚上，你打開大伯的信封。）','（一張餐廳的訂位單。十六個人。日期是下個月。）','（你把它放回信封裡，夾進舊《民法》。）']), JSON.stringify(R.T));
  R=await env('lawyer'); check('5. lawyer：名片', R.T[1]==='（一張名片。背面是大伯的字：「律師找到了。他說你介紹的，所以算便宜一點。」）');
  R=await env('list'); check('5. list：繼承人名單', R.T[1]==='（你大三寒假列的那張繼承人名單。大伯在上面打了十六個勾，最下面寫：「都找到了。」）');
  R=await env(null); check('5. 沒有主線 9：最新的謄本「十六個。慢慢來。」', R.T[1]==='（那塊地最新的謄本。大伯在上面寫了一句：「十六個。慢慢來。」）'&&R.T.length===3);
  R=await env('meal'); check('5. 開過了不再開', !STORY.gradEnvelopeDue(G));
  fresh(dg,23.5,'campus',{FAMILY_LAND_Y3:'list'}); G.events.done.ev_grad_family=1; check('5. 那晚沒回房間就睡著：睡著時演（_bed）', EVENTS.sleepEvent()&&EVENTS.sleepEvent().id==='ev_grad_envelope_bed');
  fresh(dg,23,'campus'); check('5. 早上那一段沒演（舊存檔）：沒有信封', !STORY.gradEnvelopeDue(G));
  // 6. 在家
  fresh(dg,8.5,'dorm'); G.home={at:true}; check('6. 在家醒來：home3d.js 的選單（grad）', STORY.y4HomeDue(G)==='grad');
  picks=[0]; await STORY.y4FromHome(GM,'grad'); T=lines(); check('6. 字卡「回宿舍」→ 宿舍 → 畢業典禮', cards[0]==='回宿舍／捷運＋公車 約 40 分鐘'&&entered[0]==='dorm'&&!HOME.at(G)&&T[0]==='（學士服掛在門後面，已經燙過了。）', JSON.stringify(cards));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
