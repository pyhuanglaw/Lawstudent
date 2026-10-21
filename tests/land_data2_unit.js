// 1A-07 主線 9「親戚的土地資料（二）」（AA_317；台詞照 AA_317 第 2 節）——不需要瀏覽器。照 AA_317 第 7 節給 BB 的驗收情境 L1～L4 寫：
//   1. 2028-01-26 大年初一白天在家（寒假的選單，trigger 'home'）；三條路線都是這一天（L2 日本路線不延到大四）；白天都不在家＝睡著時演（_bed）；
//   2. L1 主線 2 演過＝「又從公事包裡拿出」、陽台「大一那年，你翻得到、看不懂」；沒演＝「又」拿掉、大伯多「你阿公留下來的那塊地。」、陽台第二版；
//   3. L4 三個選項都一定出現、沒有推薦或分數；FAMILY_LAND_Y3 lawyer／list／meal＋各自的反應；
//   4. L3 和可昕交往中：當晚 22:00 可昕（除夕選「一起看」＝三則；「妳聽就好」＝一則；沒有 KX_FAMILY_LAND 或沒交往＝沒有）。
// 修改前全部 FAIL。用法：node tests/land_data2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let bgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(b){ bgs.push(b); },hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW'},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
(async()=>{
  const d=D('2028-01-26');
  check('0. 2028-01-26 是春節（大年初一）、週三，在大三寒假裡', CALENDAR.holiday(d)==='春節'&&CALENDAR.dateOf(d).wd===3&&!!HOME.lawBreak({day:d,stage:'law'})&&HOME.lawBreak({day:d,stage:'law'}).kind==='winter');
  const EV=ev('ev_family_land_y3'), BED=ev('ev_family_land_y3_bed');
  check('0. 兩個事件：在家（home）、睡著（sleep）；台詞同一份', !!EV&&!!BED&&EV.trigger==='home'&&BED.trigger==='sleep'&&EV.dialogue===BED.dialogue);
  // 1. 什麼時候演
  fresh(d,8.5,'dorm'); G.home={at:true}; check('1. 大年初一 08:30 在家：寒假選單第一輪就是主線 9', HOME.breakEvent(G)===EV);
  G.hour=19; check('1. 19:00 才到家：白天已經過了，不在家裡的選單演', HOME.breakEvent(G)!==EV);
  G.hour=10; G.day=d-1; check('1. 除夕那天不是', HOME.breakEvent(G)!==EV);
  for(const r of ['JP','US']){ fresh(d,9,'dorm',{EXCHANGE_ROUTE:r}); G.home={at:true}; check('1. L2 '+r+' 路線：一樣是 1/26 這一場', HOME.breakEvent(G)===EV); }
  fresh(d,9,'dorm'); G.home={at:false}; check('1. 白天人不在家（宿舍）：不在 3D 裡自動演（trigger home，只有家裡的選單會叫）', EV.trigger==='home'&&!STORY_EVENTS.some(e=>e.trigger==='auto'&&e.dialogue===EV.dialogue));
  G.hour=23; check('1. 那天白天都不在家：睡著時演（_bed）', EVENTS.sleepEvent()===BED);
  G.flags.FAMILY_LAND_Y3='meal'; check('1. 演過了：睡著不再演', EVENTS.sleepEvent()!==BED);
  fresh(d,9,'dorm'); G.stage='econ'; G.home={at:true}; check('1. 經濟系那年不算', HOME.breakEvent(G)!==EV);
  // 2. 台詞
  const play=async(flags,pick)=>{ fresh(d,9,'dorm',flags); G.home={at:true}; picks=[pick==null?0:pick]; await EVENTS.run(EV); return lines(); };
  let T=await play({FAMILY_LAND_Y1:'ask'},0);
  check('2. L1 主線 2 演過：「又從公事包裡拿出」、大伯第一句、沒有「你阿公留下來的那塊地。」', T[0]==='（大年初一。客廳的桌上擺著年糕和瓜子。大伯又從公事包裡拿出一疊影印的謄本。）'&&T[1]==='大伯：祐廷，那塊地，十四個人變十六個了。'&&!T.includes('大伯：你阿公留下來的那塊地。'), JSON.stringify(T.slice(0,3)));
  check('2. 謄本四句旁白（祐廷「翻謄本，這次看得懂」寫成旁白）', ['（你翻開謄本。這次看得懂了。）','（你看得懂了。共有、分割、找不到的繼承人。）','（可是你也看得懂，卡住的不是法律。）','（是十六個人，十年沒有坐在同一張桌子上。）'].every((x,i)=>T[2+i]===x), JSON.stringify(T.slice(2,6)));
  check('2. L1 陽台：「（下午，姊姊在陽台剝橘子。）」「大一那年，你翻得到、看不懂。」「現在看得懂了。……看得懂，比較累吧。」', T.slice(-3).join('|')==='（下午，姊姊在陽台剝橘子。）|姊姊：大一那年，你翻得到、看不懂。|姊姊：現在看得懂了。……看得懂，比較累吧。', JSON.stringify(T.slice(-3)));
  check('2. 背景：客廳（home_living_cny）→ 陽台（home_balcony）', bgs.length===2&&JSON.stringify(bgs[0]).includes('home_dining_cny')&&JSON.stringify(bgs[1]).includes('home_balcony'), JSON.stringify(bgs));
  T=await play({},0);
  check('2. 主線 2 沒演：「又」拿掉、大伯多一句「你阿公留下來的那塊地。」', T[0]==='（大年初一。客廳的桌上擺著年糕和瓜子。大伯從公事包裡拿出一疊影印的謄本。）'&&T[1]==='大伯：祐廷，那塊地，十四個人變十六個了。'&&T[2]==='大伯：你阿公留下來的那塊地。', JSON.stringify(T.slice(0,3)));
  check('2. 主線 2 沒演的陽台：「你現在看得懂那種東西了喔。」「……看得懂，比較累吧。」', T.slice(-2).join('|')==='姊姊：你現在看得懂那種東西了喔。|姊姊：……看得懂，比較累吧。');
  // 3. 選項
  check('3. L4 三個選項都在、照順序、沒有推薦或分數', JSON.stringify(opts[0])===JSON.stringify(['「大伯，我幫你們找一個律師，先把大家約出來。」','「這個要先把繼承人找齊。我先列一張，再請代書確認。」','「大伯，你們要不要先吃一頓飯？」'])&&!JSON.stringify(EV.dialogue).match(/hint|rel:|career/), JSON.stringify(opts[0]));
  T=await play({},0); check('3. ①：lawyer、「……約得出來的話，十年前就約了。」「（他停了一下。）」「好。你找。」', G.flags.FAMILY_LAND_Y3==='lawyer'&&T.join('|').includes('大伯：……約得出來的話，十年前就約了。|（他停了一下。）|大伯：好。你找。'));
  T=await play({},1); check('3. ②：list、「列一張？」「（他把謄本推過來。）」「好。你列。電話我給你。」', G.flags.FAMILY_LAND_Y3==='list'&&T.join('|').includes('大伯：列一張？|（他把謄本推過來。）|大伯：好。你列。電話我給你。'));
  T=await play({},2); check('3. ③：meal、「（全桌笑。）」「這孩子念法律念到變哲學家。」「（媽媽在旁邊說：「他說得對啊。」）」', G.flags.FAMILY_LAND_Y3==='meal'&&T.join('|').includes('（全桌笑。）|大伯：這孩子念法律念到變哲學家。|（媽媽在旁邊說：「他說得對啊。」）'));
  check('3. 演完時間往後（advance 2）、記成演過', G.hour===11&&!!G.events.done.ev_family_land_y3);
  // 4. 可昕
  const kx=async(kfl,dating)=>{ fresh(d,9,'dorm',{FAMILY_LAND_Y1:'ask'}); if(kfl) G.flags.KX_FAMILY_LAND=kfl; if(dating) date('kexin'); else { G.flags.dating_kexin=false; }
    G.home={at:true}; picks=[0]; await EVENTS.run(EV); run(d,21.5,23.5); return TH('p:kexin').map(m=>(m.from||'')+':'+m.text); };
  let K=await kx('look',true);
  check('4. L3 交往中、除夕選「一起看」：22:00「大伯那塊地，今天有進度嗎？」＋旁白＋「……那要先讓他們坐下來。這不是法律先做的事。」', JSON.stringify(K.slice(-3))===JSON.stringify(['kexin:大伯那塊地，今天有進度嗎？',':（你跟她說了十六個人十年沒坐在同一張桌子。）','kexin:……那要先讓他們坐下來。這不是法律先做的事。'])&&TH('p:kexin').slice(-3).every(m=>Math.abs(m.h-22)<0.05), JSON.stringify(K.slice(-3)));
  K=await kx('listen',true); check('4. 選「妳聽就好」：只有「今天家裡還好嗎？」', K.slice(-1)[0]==='kexin:今天家裡還好嗎？'&&!K.some(t=>/大伯那塊地/.test(t)));
  K=await kx(null,true); check('4. 沒有 KX_FAMILY_LAND：不提', !PHONE.sent(G,'y3_kx_land'));
  K=await kx('look',false); check('4. 沒有交往：不傳', !PHONE.sent(G,'y3_kx_land'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
