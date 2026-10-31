// 第二天下課以安追上來那段錯過了（BUG-MEET-HEROINES-1020，使用者 2026-10-20：「沈以安到法律系9/17都還沒認識……我一個女主角都沒遇到」，存檔 9/25：classDone、沒有 metAn、沒有 afternoonDone）——不需要瀏覽器。
//   追上來只在「主線第 2 天、在校園、走出霖澤館門口 6 m」觸發；那天沒在校園走出門（用手機去別的地方、睡過頭）就永遠不會發生，
//   afternoonDone 永遠不成立，以安、Alison、阿哲、學姊（LEGACY_IDS）一直不照作息出現。
//   1. 主線第 3 天以後還沒認識、也沒拒絕：開放（afternoonDone、anMissed、anAfter）——修改前這項 FAIL；
//   2. 主線第 2 天：照舊等她追上來（不提前開放）；
//   3. 拒絕過她的邀約（anSkipped）、已經認識（metAn）：不動；經濟系那一年：不動；
//   4. 開放以後第一次跟以安說話：她自我介紹「你好，我是沈以安。大家都叫我小安。」「……同班的，你不記得？」（AA_313 第 4 節第 10 點）、記 met_an 與 FIRST_MET；不說咖啡廳那段的回聲；
//   5. 第二次說話不再自我介紹。
//   6. 照作息出現的以安（heroine_01，S.talkCharacter）也一樣：第一次自我介紹、記 FIRST_MET（BB-C 10-20 重現：原本只有一句旁白）。
//   7. BUG-C5-AN-NOT-SPAWNED（BB-B 10-31）：主線第 3 天起 LEGACY_IDS 照作息，不等 S.tick 補 afternoonDone（讀檔時、認識了以安但下午沒走完）。
// 用法：node tests/an_missed_day2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g,d){ G.goal=g; G.goalDest=d; },toast(){},updateHUD(){},letterbox(){},rel(){},
  say:async(who,t)=>{ said.push(String(t)); },choose:async()=>0,enter:async()=>{}};
// 使用者的存檔（2026-10-20，9/25 週四 15:44 溫州街）：第一天晚上演過、民總那堂上過（classAnswer bold），以安沒追上來
const at=(day,flags,stage)=>{ G={day,hour:15.7,zone:'wenzhou',stage:stage||'law',weekday:CALENDAR.dateOf(day).wd%7,flags:Object.assign({introDone:true,classDone:true,classAnswer:'bold',campusIntro:true},flags||{}),
  choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,goal:''}; SOCIAL.bind(G); EVENTS.bind(GM); GM.npc={}; said=[]; };
const F=()=>G.flags;
(async()=>{
  at(9); STORY.tick(GM,0.016);
  check('1. 主線第 9 天（9/25）、還沒認識以安：開放（afternoonDone、anMissed、anAfter）', F().afternoonDone===true&&F().anMissed===true&&F().anAfter===true, JSON.stringify({a:F().afternoonDone,m:F().anMissed}));
  at(3); STORY.tick(GM,0.016); check('1. 主線第 3 天就開放', F().afternoonDone===true&&F().anMissed===true);
  at(2); G.hour=11; STORY.tick(GM,0.016); check('2. 主線第 2 天：照舊等她追上來（不提前開放）', !F().afternoonDone&&!F().anMissed);
  at(9,{anSkipped:true,afternoonDone:true}); STORY.tick(GM,0.016); check('3. 拒絕過她的邀約：不動（沒有 anMissed）', !F().anMissed);
  at(9,{metAn:true}); STORY.tick(GM,0.016); check('3. 已經認識（metAn，下午那段還沒演完）：不動', !F().afternoonDone&&!F().anMissed);
  at(-200,{},'econ'); G.flags={}; STORY.tick(GM,0.016); check('3. 經濟系那一年：不動', !F().afternoonDone&&!F().anMissed);
  // 4、5：開放以後跟以安說話
  at(9); STORY.tick(GM,0.016); const n={id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:1,z:0}},beh:'idle'}; GM.npc.an=n;
  const offer=STORY.offerInvite; STORY.offerInvite=async()=>{};   // 說完會問要不要約（不在這裡測）
  await STORY._day2.talkAn(GM,n);
  check('4. 第一次說話：她自我介紹「你好，我是沈以安。大家都叫我小安。」「……同班的，你不記得？」', said.includes('你好，我是沈以安。大家都叫我小安。')&&said.includes('……同班的，你不記得？'), JSON.stringify(said));
  check('4. 記 met_an、FIRST_MET', F().met_an===true&&SOCIAL.has('heroine_01','FIRST_MET'));
  check('4. 不說咖啡廳那段的回聲（無過失、後果自己承擔、不能賠十倍）', !said.some(t=>/無過失|後果自己承擔|不能賠十倍/.test(t)), JSON.stringify(said));
  said=[]; await STORY._day2.talkAn(GM,n);
  check('5. 第二次說話：不再自我介紹', !said.includes('你好，我是沈以安。大家都叫我小安。')&&said.length>0, JSON.stringify(said));
  STORY.offerInvite=offer;
  // 6. 照作息出現的以安（heroine_01，不是劇情的 an）：S.talkCharacter 那條路也要自我介紹（BB-C 10-20：使用者存檔 9/26 普通 101 門口只有「她低頭在忙自己的事」）
  at(10); STORY.tick(GM,0.016); G.social.reveal=G.social.reveal||{}; const h1={id:'heroine_01',charId:'heroine_01',name:'沈以安',obj:{position:{x:1,z:0}},beh:'idle',pose:'idle'}; GM.npc.heroine_01=h1;
  if(STORY._bindGM) STORY._bindGM(GM); said=[]; await STORY.talkCharacter('heroine_01',h1);
  check('6. 照作息出現的以安第一次被搭話：自我介紹「你好，我是沈以安。大家都叫我小安。」「……同班的，你不記得？」、記 FIRST_MET、met_an', said.includes('你好，我是沈以安。大家都叫我小安。')&&said.includes('……同班的，你不記得？')&&SOCIAL.has('heroine_01','FIRST_MET')&&F().met_an===true, JSON.stringify(said));
  said=[]; await STORY.talkCharacter('heroine_01',h1); check('6. 第二次不再自我介紹', !said.includes('你好，我是沈以安。大家都叫我小安。'), JSON.stringify(said.slice(0,2)));
  /* 7. BUG-C5-AN-NOT-SPAWNED（BB-B 10-31：大三上慈 5 總圖三樓只有芯慈）：進區域生人比第一次 S.tick 早——沒有 afternoonDone 的存檔一讀進來，以安照作息該在的地方也不生；
     認識了以安（metAn）、下午那段沒走完的，S.tick 也不補 afternoonDone。主線第 3 天起照作息（STORY.whereIs 和 populate 用同一個 legacyOk）——修改前兩項都 FAIL */
  at(9); G.hour=18.5; const w7=STORY.whereIs(GM,'heroine_01');
  check('7. 主線第 9 天 18:30、還沒跑過 S.tick（沒有 afternoonDone）：以安照作息有地方（不是 null）', !!w7&&!!w7.zone&&!F().afternoonDone, JSON.stringify(w7));
  at(9,{metAn:true}); G.hour=18.5; STORY.tick(GM,0.016); const w7b=STORY.whereIs(GM,'heroine_01');
  check('7. 認識了以安、下午那段沒走完（metAn、沒有 afternoonDone）：S.tick 不補旗標，以安照樣照作息出現', !F().afternoonDone&&!!w7b&&!!w7b.zone, JSON.stringify({a:F().afternoonDone,w:w7b}));
  at(2); G.hour=18.5; check('7. 主線第 2 天：照舊等她追上來（不照作息出現）', STORY.whereIs(GM,'heroine_01')===null&&!STORY.pastDay2(G));
  at(9,{},'econ'); check('7. 經濟系那一年：不動（pastDay2 false）', STORY.pastDay2(G)===false);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
