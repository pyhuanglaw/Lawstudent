// 1A-08「大四要怎麼過？」（AA_317；台詞照 AA_317 第 2 節）——不需要瀏覽器。照 AA_317 第 7 節給 BB 的驗收情境 P1～P4 寫：
//   1. 台灣、美國路線：大三下最後一科期末考考完那天 21:00 以後，人在宿舍房間（坐到書桌前）演宿舍版；四選一一定要選；Y4_PATH、Y4_PATH_DAY；
//      日曆：大三下 2/21 開學，第 16 週是 6/5～6/11（AA_317 寫的 5/29～6/4 是舊的 2/14 開學）；照 CLS.lastExamEnd；沒有考試＝第 16 週週五；
//   2. P2 日本路線：8/5 20:00 以後（還沒有日本返台的流程：哪裡都演）在家版；②的旁白是推甄趕不上；
//   3. 台灣、美國路線那晚人在家：只有「（大四，要怎麼過？）」（宿舍兩句不合）；
//   4. P3 有 SISTER_TALK：隔天 09:00 姊姊一則（照 Y4_PATH；④＋search＝「上次說了」）；沒有 SISTER_TALK＝沒有；
//   5. P4 選④：大四上 10/16 21:00 再問一次（宿舍；美國＝公寓、當地時間）；
//   6. 接線：S.tick（S.y4Tick，在 coldWeekTick 之前）、home3d.js 的 loop（S.y4HomeDue 'stay'）。
// 修改前全部 FAIL。用法：node tests/y4_path_unit.js
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
let said=[], opts=[], picks=[], G=null, sat=0;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){ sat++; },standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW'},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; bgs=[]; sat=0; GM.npc={}; E.interactables=[{deskStudy:true,seat:{x:0,z:0}}]; E.npcs=[]; ADV.active=false; return G; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const OPTS=['「準備國考。律師，可以的話司法官也考。」','「準備研究所。」','「先不考。去實習，或做別的事。」','「還沒決定。」'];
(async()=>{
  // 0. 日期
  const w16=STORY.termDay('Y3S2',16,1), fri16=STORY.termDay('Y3S2',16,5);
  check('0. 大三下第 16 週 2028-06-05～06-11（calendar.js：2/21 開學）', CALENDAR.dateOf(w16).key==='2028-06-05'&&CALENDAR.termOf(w16).week===16&&CALENDAR.dateOf(fri16).key==='2028-06-09');
  fresh(w16,8,'dorm'); const fe=STORY.y3s2FinalEnd(G), at=STORY.y4PathAt(G);
  check('0. 台灣路線：最後一科考完那天（照課表的考程）21:00', !!fe&&CALENDAR.termOf(fe.day).id==='Y3S2'&&CALENDAR.termOf(fe.day).week===16&&at.day===fe.day&&at.h===21, JSON.stringify({fe,day:fe&&CALENDAR.dateOf(fe.day).key}));
  const dX=fe.day;
  // 1. 宿舍版
  fresh(dX,20.9,'dorm'); check('1. P1 21:00 以前還不到', !STORY.y4PathDue(G)); G.hour=21; check('1. P1 21:00 到了', STORY.y4PathDue(G));
  G.zone='campus'; check('1. 人在校園：等回到宿舍房間（S.y4Tick 只在宿舍房間演台灣、美國路線）', STORY.y4Tick(GM)===false&&said.length===0);
  G.zone='dorm'; picks=[0]; await STORY.y4Path(GM); let T=lines();
  check('1. P1 宿舍版旁白三句、坐到書桌前', JSON.stringify(T.slice(0,3))===JSON.stringify(['（最後一科考完。宿舍很安靜，隔壁在收行李。）','（你在書桌前坐了很久。）','（大四，要怎麼過？）'])&&sat===1, JSON.stringify(T));
  check('1. 四選一（照 AA_97 2-1 的順序）', JSON.stringify(opts[0])===JSON.stringify(OPTS), JSON.stringify(opts[0]));
  check('1. 選①：Y4_PATH bar、Y4_PATH_DAY、旁白「（你在桌曆上，把每個禮拜二、四的晚上圈起來。）」', G.flags.Y4_PATH==='bar'&&G.flags.Y4_PATH_DAY===dX&&T[T.length-1]==='（你在桌曆上，把每個禮拜二、四的晚上圈起來。）');
  check('1. 選完不能馬上改：不再到期', !STORY.y4PathDue(G));
  const pick=async(route,k,zone,flags)=>{ const R=route==='JP'?D('2028-08-05'):dX; fresh(R,route==='JP'?20:21,zone||'dorm',Object.assign({EXCHANGE_ROUTE:route},flags||{})); picks=[k]; await STORY.y4Path(GM); return lines(); };
  T=await pick('TW',1); check('1. 選②（台灣）：grad、「（你打開系上的網頁，找推甄的簡章。十月報名。）」', G.flags.Y4_PATH==='grad'&&T[T.length-1]==='（你打開系上的網頁，找推甄的簡章。十月報名。）');
  T=await pick('TW',2); check('1. 選③：other、「（你把國考的簡章收進抽屜最下面，沒有丟。）」', G.flags.Y4_PATH==='other'&&T[T.length-1]==='（你把國考的簡章收進抽屜最下面，沒有丟。）');
  T=await pick('TW',3); check('1. 選④：undecided、「（你把四個選項寫在便利貼上，貼在檯燈旁邊。）」', G.flags.Y4_PATH==='undecided'&&T[T.length-1]==='（你把四個選項寫在便利貼上，貼在檯燈旁邊。）');
  T=await pick('US',1); check('1. 美國路線（大三下在臺灣）：宿舍版、②是推甄那句', T[0]==='（最後一科考完。宿舍很安靜，隔壁在收行李。）'&&T[T.length-1]==='（你打開系上的網頁，找推甄的簡章。十月報名。）');
  // 2. 日本路線
  const d85=D('2028-08-05'); fresh(d85,19.5,'dorm',{EXCHANGE_ROUTE:'JP'}); check('2. P2 日本：8/5 20:00 以前還不到', !STORY.y4PathDue(G)&&CALENDAR.dateOf(d85).wd===6); G.hour=20; check('2. P2 日本：8/5 20:00 到了（3/25～8/5 在日本，大三下的期末考不算）', STORY.y4PathDue(G));
  T=await pick('JP',1,'campus');
  check('2. P2 在家版旁白、2D 家裡的房間', JSON.stringify(T.slice(0,3))===JSON.stringify(['（日本的行李還沒拆完。客廳傳來電視的聲音。）','（一個月以後就大四了。）','（大四，要怎麼過？）'])&&JSON.stringify(bgs[0]||'').includes('home_room_night'), JSON.stringify(T.slice(0,3)));
  check('2. P2 選②：推甄趕不上那句', T[T.length-1]==='（你查了一下。交換回來要多念一學期，推甄趕不上。筆試在後年二月。）');
  // 3. 那晚在家
  fresh(dX,21.5,'dorm'); G.home={at:true}; check('3. 台灣路線那晚人在家：home3d.js 的選單在家演（stay）', STORY.y4HomeDue(G)==='stay');
  picks=[0]; await STORY.y4Path(GM); T=lines(); check('3. 在家：只有「（大四，要怎麼過？）」、不坐書桌、背景家裡的房間', T[0]==='（大四，要怎麼過？）'&&!T.some(t=>/宿舍很安靜/.test(t))&&sat===0&&JSON.stringify(bgs[0]||'').includes('home_room_night'), JSON.stringify(T));
  // 4. 姊姊
  const sis=async(k,talk)=>{ fresh(dX,21,'dorm',talk?{SISTER_TALK:talk}:{}); picks=[k]; await STORY.y4Path(GM); run(dX,21.25,23.5); run(dX+1,7,8.75); const a=TH('p:sister').length; run(dX+1,9,10); return {before:a,L:TH('p:sister').map(m=>m.text)}; };
  let S=await sis(0,'regret'); check('4. P3 選①、有 SISTER_TALK：隔天 09:00 旁白＋「好。你自己選的，你就念得下去。」', S.before===0&&JSON.stringify(S.L)===JSON.stringify(['（昨晚你在家人群組打了一行字，又刪掉。最後只傳給姊姊。）','好。你自己選的，你就念得下去。'])&&TH('p:sister').every(m=>m.day===dX+1&&Math.abs(m.h-9)<0.05), JSON.stringify(S));
  S=await sis(1,'other'); check('4. P3 選②：「好。要念，就念你想問的那一題。」', S.L[1]==='好。要念，就念你想問的那一題。');
  S=await sis(2,'regret'); check('4. 選③：「好。換方向不會怎樣。你知道的。」', S.L[1]==='好。換方向不會怎樣。你知道的。');
  S=await sis(3,'search'); check('4. 選④、主線 7 選了③（search）：「上次說了，我二十六歲也還在找。你急什麼。」', S.L[1]==='上次說了，我二十六歲也還在找。你急什麼。');
  S=await sis(3,'regret'); check('4. 選④、其他：「慢慢來。我到現在也還在找。」', S.L[1]==='慢慢來。我到現在也還在找。');
  S=await sis(0,null); check('4. 沒有 SISTER_TALK（沒去火鍋）：沒有姊姊那則', S.L.length===0);
  // 5. 10/16 再問
  const d16=D('2028-10-16'); fresh(d16,20.9,'dorm',{Y4_PATH:'undecided',Y4_PATH_DAY:dX}); check('5. P4 10/16 21:00 以前還不到', !STORY.y4Path2Due(G)&&CALENDAR.dateOf(d16).wd===1);
  G.hour=21; check('5. P4 10/16 21:00 再問一次（選④的人）', STORY.y4Path2Due(G)); picks=[1]; await STORY.y4Path(GM); T=lines();
  check('5. 再問：只有「（大四，要怎麼過？）」＋四選一；選了改 Y4_PATH、Y4_PATH_DAY 不變、不再問', T[0]==='（大四，要怎麼過？）'&&JSON.stringify(opts[0])===JSON.stringify(OPTS)&&G.flags.Y4_PATH==='grad'&&G.flags.Y4_PATH_DAY===dX&&G.flags.Y4_PATH_ASK2===d16&&!STORY.y4Path2Due(G), JSON.stringify(T.slice(0,2)));
  fresh(d16,21,'dorm',{Y4_PATH:'bar',Y4_PATH_DAY:dX}); check('5. 選①～③的人：10/16 不問', !STORY.y4Path2Due(G));
  fresh(d16,21.2,'us_apartment',{EXCHANGE_ROUTE:'US',Y4_PATH:'undecided',Y4_PATH_DAY:dX,US_ARRIVED:true}); check('5. 美國路線：人在美國（公寓、當地時間 21:00）也問', STORY.y4Path2Due(G)&&STORY.abroad(G));
  // 6. 接線
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), hm=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8'), ev=STORY_EVENTS.find(e=>e.id==='ev_y4_path');
    check('6. S.tick：S.y4Tick 在 coldWeekTick 之前（HOME 那一段之前）', /if\(S\.y4Tick\(GM\)\) return;[^\n]*\n\s*if\(S\.coldWeekTick\(GM\)\) return;/.test(s));
    check('6. home3d.js：loop 每一輪問 STORY.y4HomeDue（stay＝在家演；其他＝離開家以後 STORY.y4FromHome）', /STORY\.y4HomeDue\(G\):null; if\(y4==='stay'\)\{ await STORY\.y4HomeScene\(GM\);/.test(hm)&&/if\(y4Go\)\{ const k=y4Go; y4Go=null; await STORY\.y4FromHome\(GM,k\); \}/.test(hm));
    check('6. 事件不是 auto（不會在別的地方自己跳出來）、記 Y4_PATH_DAY', !!ev&&ev.trigger==='manual'&&JSON.stringify(ev.consequences)==='{"stamp":["Y4_PATH_DAY"]}'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
