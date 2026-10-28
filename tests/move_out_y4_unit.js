// 1A-15 宿舍期滿搬走＋麵店工讀二選一（AA_318；台詞照 AA_318 第 2 節）——不需要瀏覽器。照 AA_318 第 7 節 M1～M3 寫：
//   1. 2029-06-28（四）10:00（鬧鐘「宿舍期滿」）宿舍一樓門口收鑰匙；不在宿舍＝字卡「回宿舍」；在家＝home3d.js 的選單離開家；沒收拾的舊存檔多「（你連夜把東西裝好。）」；
//   2. M1 Y4_PATH bar、有麵店工讀（JOB_NOODLE）：阿姨「暑假你還要來的話，週二一樣。」二選一；公館的套房（2D home_room_night＋字卡）；「兵役的時間，你排在考試之後」；
//   3. M2 日本路線（交換延畢）：一律回臺北的家；M3 沒有麵店工讀＝沒有阿姨那段；
//   4. 旗標：HOME_AFTER gongguan／home、JOB_NOODLE_SUMMER true／false、MOVED_OUT＝那天；之後在公館（3D）或家裡（home3d.js 的選單）。
// 修改前全部 FAIL。
// AA_519 1-5（NPC-STORY2-1028，企劃線 d75cd0228：「JOB_NOODLE：遊戲沒有麵店打工。story3d.js:4186-4188、r2y3a_events.js:510 那幾句刪掉，不做打工。」）改的期待值：
//   第 2 點的麵店那一段（阿姨「暑假你還要來的話，週二一樣。」二選一、JOB_NOODLE_SUMMER）刪掉——有 JOB_NOODLE 的舊存檔也不去麵店、沒有阿姨、沒有二選一、不寫 JOB_NOODLE_SUMMER，
//   兩個選法（好。／暑假我要讀書。）和沒有 JOB_NOODLE 的一字不差；公館的套房那一句往前兩句（T[3]）。
// 用法：node tests/move_out_y4_unit.js
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW',ROOM_Y4:D('2028-09-03'),Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08'),PACKED_Y4:D('2029-06-01'),GRADUATED:D('2029-06-02')},flags||{}),choices:{},events:{done:{ev_grad_family:1,ev_grad_lunch:1,ev_grad_envelope:1},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; cards=[]; entered=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const KEY=['（宿舍期滿。舍監在門口收鑰匙。）','（409 的鑰匙交出去的時候，舍監看了一下名單：「四年，四個房間。」）','「冬天的衣服」那一箱，最後一個搬上車。'];
(async()=>{
  const dm=D('2029-06-28');
  check('0. 2029-06-28 是週四、大四下已經結束（沒有學期）', CALENDAR.dateOf(dm).wd===4&&!CALENDAR.termOf(dm));
  fresh(dm-1,23,'dorm'); { const A=STORY.wakeAlarms(G,dm).find(a=>a.why==='宿舍期滿'); check('1. 6/27 晚上睡覺：明天 10:00 鬧鐘「宿舍期滿」', !!A&&A.h===10); }
  fresh(dm,9.9,'dorm'); check('1. 09:54 還不到；10:00 到了', !STORY.moveOutDue(G)&&(G.hour=10,STORY.moveOutDue(G)));
  // 2. M1
  fresh(dm,10,'dorm',{JOB_NOODLE:true}); picks=['好。']; await STORY.moveOutY4(GM); let T=lines();
  check('2. M1 宿舍一樓門口（3D dorm_hall）：收鑰匙兩句＋「冬天的衣服」那一箱', entered[0]==='dorm_hall'&&JSON.stringify(T.slice(0,3))===JSON.stringify(KEY)&&!cards.some(c=>/^回宿舍/.test(c)), JSON.stringify(T.slice(0,3)));
  check('2. M1 有 JOB_NOODLE 的舊存檔（AA_519 1-5：遊戲沒有麵店打工，那一段刪掉）：不去麵店（3D noodle）、沒有阿姨「暑假你還要來的話，週二一樣。」、沒有二選一、不寫 JOB_NOODLE_SUMMER', !entered.includes('noodle')&&!T.some(t=>/阿姨|週二一樣/.test(t))&&!opts.length&&!('JOB_NOODLE_SUMMER' in G.flags)&&T[3]==='（你租的套房在公館，走路到總圖十分鐘。）', JSON.stringify({T:T.slice(3,5),opts}));
  check('2. M1 bar：「（你租的套房在公館，走路到總圖十分鐘。）」→ 字卡「公館的套房」（2D home_room_night）→「（兵役的時間，你排在考試之後。）」', T[3]==='（你租的套房在公館，走路到總圖十分鐘。）'&&cards.includes('公館的套房／')&&JSON.stringify(bgs).includes('home_room_night')&&T[T.length-1]==='（兵役的時間，你排在考試之後。）', JSON.stringify({T,cards}));
  check('2. 旗標 HOME_AFTER gongguan、MOVED_OUT＝那天；之後在公館', G.flags.HOME_AFTER==='gongguan'&&G.flags.MOVED_OUT===dm&&G.zone==='gongguan');
  check('2. 搬過了：不再演', !STORY.moveOutDue(G));
  { const T1=T; fresh(dm,10,'dorm',{JOB_NOODLE:true}); picks=['讀書']; await STORY.moveOutY4(GM); T=lines(); const T2=T; fresh(dm,10,'dorm'); await STORY.moveOutY4(GM); const T0=lines();
    check('2. 有 JOB_NOODLE 選「暑假我要讀書。」那一邊（AA_519 1-5）：一樣沒有阿姨「好。讀完再來吃。」、不寫 JOB_NOODLE_SUMMER；兩個選法都和沒有 JOB_NOODLE 的一字不差', !T2.some(t=>/阿姨/.test(t))&&!('JOB_NOODLE_SUMMER' in G.flags)&&JSON.stringify(T1)===JSON.stringify(T0)&&JSON.stringify(T2)===JSON.stringify(T0), JSON.stringify({T0,T2})); }
  // 3. M2、M3
  fresh(dm,10,'dorm',{EXCHANGE_ROUTE:'JP'}); await STORY.moveOutY4(GM); T=lines();
  check('3. M2 日本路線（Y4_PATH bar，交換延畢）：回臺北的家「（車開回臺北的家。你的房間，媽媽又打掃過了。）」、HOME_AFTER home、之後在家', T.includes('（車開回臺北的家。你的房間，媽媽又打掃過了。）')&&!T.some(t=>/套房/.test(t))&&G.flags.HOME_AFTER==='home'&&HOME.at(G)&&T[T.length-1]==='（兵役的時間，你排在考試之後。）');
  check('3. M3 沒有麵店工讀：沒有阿姨那段、不寫 JOB_NOODLE_SUMMER（AA_519 1-5：原本寫 false，這個旗標整個不用了）', !T.some(t=>/阿姨/.test(t))&&!('JOB_NOODLE_SUMMER' in G.flags)&&!entered.includes('noodle'));
  for(const [p,line] of [['grad','（兵役的時間，你排在考試之後。）'],['other','（兵役的時間，你排好了。）'],['undecided','（兵役的時間，你排好了。）']]){ fresh(dm,10,'dorm',{Y4_PATH:p}); await STORY.moveOutY4(GM); T=lines();
    check('3. Y4_PATH '+p+'：回家、兵役「'+line+'」', G.flags.HOME_AFTER==='home'&&T[T.length-1]===line&&T.includes('（車開回臺北的家。你的房間，媽媽又打掃過了。）')); }
  // 1. 其他
  fresh(dm,10,'dorm',{PACKED_Y4:undefined}); await STORY.moveOutY4(GM); T=lines(); check('1. 沒收拾的舊存檔：先「（你連夜把東西裝好。）」', T[0]==='（你連夜把東西裝好。）'&&T[1]===KEY[0]);
  fresh(dm,11,'campus'); await STORY.moveOutY4(GM); check('1. 人在校園：字卡「回宿舍」→ 宿舍一樓', cards[0]==='回宿舍／'&&entered[0]==='dorm_hall');
  fresh(dm,10.5,'dorm'); G.home={at:true}; check('1. 在家：home3d.js 的選單（out）', STORY.y4HomeDue(G)==='out');
  await STORY.y4FromHome(GM,'out'); check('1. 在家：字卡「回宿舍／捷運＋公車 約 40 分鐘」→ 宿舍一樓 → 收鑰匙', cards[0]==='回宿舍／捷運＋公車 約 40 分鐘'&&entered[0]==='dorm_hall'&&lines()[0]===KEY[0]);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
