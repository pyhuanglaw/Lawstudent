// 大二（交接包 v3）第一批：D24 社團博覽會大二版（AA_170）、D3 開學第一頓、中秋烤肉（AA_143 1-1、1-2；日期、邀約、沒去照 AA_177）——不需要瀏覽器。
// 加上 D4 語彤事件 7（AA_11、AA_177 4-6）。修改前沒有 ev_y2_*（全部失敗）。用法：node tests/v3_batch1_unit.js
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
  const ids=['ev_y2_club_expo','ev_y2_first_meal','ev_y2_midautumn']; check('0. 三個事件在',ids.every(i=>ev(i))); if(!ids.every(i=>ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  const dk=k=>STORY.dayOfKey(k), at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=0; }, tick=()=>{ said=[]; return EVENTS.tick(0.1); };
  const wait=async()=>{ for(let i=0;i<50&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); };
  const d16=dk('2026-09-12'); check('0. 社博 9/12 是大二上第 1 週週六（CLUBFAIR-REAL-1027，AA_485 3-2：照實際搬到開學第一週的週六；原本 9/16 週三）',CALENDAR.termOf(d16).id==='Y2S1'&&CALENDAR.termOf(d16).week===1&&CALENDAR.dateOf(d16).wd===6);   /* 變數名照舊 d16（下面每一段都用它）*/
  // 1. 博覽會：吉他社＋法服都加入過 → 選吉他社
  fresh(d16,12,'campus',{CLUB_club_guitar:true,CLUB_lawclub_study:true,met_yu:true}); G.stage='law'; meet('heroine_04'); meet('heroine_05'); meet('heroine_03');
  R('yu',...LV.ACQ); R('heroine_04',...LV.ACQ); const f0=SOCIAL.rel('yu').fam, f4=SOCIAL.rel('heroine_04').fam;
  at(30,0); check('1. 不在攤位那一排＝不觸發',!tick());
  at(-13.5,13.6); picks=['吉他社']; tick(); await wait(); let L=lines();
  check('1. 開場兩句',L[0]==='去年，你站在這一排攤位前面填表。'&&L[1]==='今年，你站在攤位後面。',JSON.stringify(L.slice(0,2)));
  check('1. 選單只列加入過的兩攤',JSON.stringify(opts[0])===JSON.stringify(['（在法服的攤位站一個小時）','（在吉他社的攤位站一個小時）']),JSON.stringify(opts));
  const gt=['yu：欸祐廷你負責發傳單！對了你會彈哪首？……三個和弦也行啦。',   /* AA_313 5-4：{name}＋不用「……好啦我知道」（玩家叫祐廷）*/'新生：學長，完全沒碰過可以嗎？','祐廷：可以。我去年也是。',/* AB65-3（AA_211） 附錄 B 第 5 節 SC3 #21：子晴「欸不是…新手村」改兩句 */'heroine_04：可以啊，我們社一半的人進來都不會。','heroine_04：先填表，第一次社課教 C 和弦。','一個小時，有人叫了你四次「學長」。','第一次，你回頭找是誰在叫別人。'];
  const norm=a=>a.map(t=>t.replace(/^Alison：/,'yu：').replace(/^高子晴：|^子晴：/,'heroine_04：'));
  check('1. 吉他社的台詞（逐字；Alison、子晴認識才說）',JSON.stringify(norm(L.slice(2)))===JSON.stringify(gt),JSON.stringify(L.slice(2)));
  check('1. 站一個小時、Y2_EXPO_BOOTH、Y2_EXPO_SENIOR、Alison 和子晴熟悉 +1',Math.abs(G.hour-13)<1e-6&&G.flags.Y2_EXPO_BOOTH==='club_guitar'&&G.flags.Y2_EXPO_SENIOR===true&&SOCIAL.rel('yu').fam===f0+1&&SOCIAL.rel('heroine_04').fam===f4+1,JSON.stringify([G.hour,SOCIAL.rel('yu').fam,f0]));
  check('1. 只有一次',!tick());
  // 法服＋「先問事實，再找條文。」
  /* AA_358 2-5（AA-C 2026-10-21 659d9d81）：語彤不進法服（AA_255），博覽會法服攤位的三處換成柏翰（法服社員、同一學期接社長）——修改前 FAIL */
  fresh(d16,15,'campus',{CLUB_lawclub_study:true}); G.stage='law'; meet('heroine_05'); meet('heroine_03'); meet('classmate_bohan'); R('classmate_bohan',...LV.ACQ); R('heroine_03',...LV.ACQ); const fb0=SOCIAL.rel('classmate_bohan').fam, fy0=SOCIAL.rel('heroine_03').fam;
  at(-13.5,13.6); picks=['法服','先聽他']; tick(); await wait(); L=lines();   /* AB65-3（AA_211） 附錄 A 祐廷的選項：「先問事實，再找條文。」→「有人來問問題，我們先聽他把事情講完，再找條文。」 */
  check('2. 法服：只加入一個也有選單（一項）；新生問、柏翰「……順序對了。」（AA_374 第 6 項）；「……這句，是學姊的。」刪掉（AB65-3（AA_211） 附錄 A、AA_193 第 5 節）；在場的熟悉 +1 是柏翰、不是語彤',L.includes('新生：學長，法服是做什麼的？')&&L.some(t=>t.endsWith('……順序對了。'))&&!L.some(t=>/這句，是學姊的/.test(t))&&!L.some(t=>/語彤：/.test(t))&&G.flags.Y2_EXPO_BOOTH==='lawclub_study'&&SOCIAL.rel('classmate_bohan').fam===fb0+1&&SOCIAL.rel('heroine_03').fam===fy0,JSON.stringify(L));
  fresh(d16,15,'campus',{CLUB_lawclub_study:true}); G.stage='law'; meet('heroine_03'); at(-13.5,13.6); picks=['法服','先聽他']; tick(); await wait(); L=lines();
  check('2. 法服選第二項（AB65-3（AA_211）：「有人來問問題，我們先聽他把事情講完，再找條文。」）、只認識語彤（不認識柏翰）：沒有「……這句，是學姊的。」、沒有「……順序對了。」',L.includes('新生：學長，法服是做什麼的？')&&!L.some(t=>t.endsWith('……這句，是學姊的。'))&&!L.some(t=>/順序對了/.test(t)),JSON.stringify(L));
  fresh(d16,15,'campus',{CLUB_lawclub_study:true}); G.stage='law'; at(-13.5,13.6); picks=['法服','幫人看']; tick(); await wait(); L=lines();
  check('2. 法服「幫人看法律問題。」：新生「那你很厲害耶。」＋旁白；學姊不說話',L.includes('新生：那你很厲害耶。')&&L.includes('你想說「我只是坐在旁邊做紀錄」，最後沒說。')&&!L.some(t=>/順序對了/.test(t)),JSON.stringify(L));
  fresh(d16,15,'campus',{CLUB_dept_basketball:true,ZHE_CALLS_GE:true}); G.stage='law'; at(-13.5,13.6); picks=['系籃']; tick(); await wait(); L=lines();   /* AA_374 第 7 項：有「哥」的玩家（ZHE_CALLS_GE）照原句 */
  check('3. 系籃（叫你哥的玩家）：阿哲「哥，你站這裡。…」「不用每天啦，週五晚上練一次。」、新生「那我可以先去看看嗎？」、阿哲「可以啊，球場在映月湖旁邊。」（AB65-3（AA_211） 附錄 A 阿哲一列；原本祐廷「……我們很常練。」）',L.some(t=>t.endsWith('哥，你站這裡。身高夠，看起來很會打。'))&&L.some(t=>t.endsWith('不用每天啦，週五晚上練一次。'))&&L.includes('新生：那我可以先去看看嗎？')&&L.some(t=>t.endsWith('可以啊，球場在映月湖旁邊。'))&&!L.includes('祐廷：……我們很常練。'),JSON.stringify(L));
  fresh(d16,15,'campus',{CLUB_club_debate:true}); G.stage='law'; at(-13.5,13.6); tick(); await wait(); L=lines(); check('3. 辯論社（AB65-3（AA_211） 附錄 A 祐廷的選項：「還好，我進去以前也很怕上台。」、社長那句刪掉）',L.includes('祐廷：還好，我進去以前也很怕上台。')&&!L.some(t=>/^社長：/.test(t)),JSON.stringify(L));
  fresh(d16,15,'campus',{CLUB_club_hiking:true}); G.stage='law'; at(-13.5,13.6); tick(); await wait(); L=lines(); check('3. 登山社（AB65-3（AA_211）：「會啊，我第一次爬完腿痠三天。」）',L.includes('祐廷：會啊，我第一次爬完腿痠三天。'),JSON.stringify(L));
  // 都沒加入
  fresh(d16,15,'campus',{}); G.stage='law'; meet('classmate_bohan'); at(-13.5,13.6); tick(); await wait(); L=lines();
  check('4. 都沒加入、認識柏翰（AA_358 2-5）：「（你只是走過。法服的攤位後面，柏翰在發傳單。）」柏翰「法服的傳單，週六有值班。」「（他遞一張給你，又想起來，你不是新生。）」柏翰「……那你幫我拿給大一的。」（AB65-3（AA_211） 附錄 A：祐廷大二沒有學弟）；沒有「學長」、不花時間、Y2_EXPO_BOOTH none',
    L[1]==='（你只是走過。法服的攤位後面，柏翰在發傳單。）'&&/柏翰：法服的傳單，週六有值班。$/.test(L[2]||'')&&L[3]==='（他遞一張給你，又想起來，你不是新生。）'&&/柏翰：……那你幫我拿給大一的。$/.test(L[4]||'')&&L.length===5&&!L.some(t=>/學長」/.test(t))&&G.flags.Y2_EXPO_BOOTH==='none'&&!G.flags.Y2_EXPO_SENIOR&&Math.abs(G.hour-15)<1e-6,JSON.stringify(L));
  fresh(d16,15,'campus',{}); G.stage='law'; meet('heroine_03'); at(-13.5,13.6); tick(); await wait(); L=lines(); check('4. 只認識語彤、不認識柏翰：只有「你只是走過。」（語彤不在法服攤位的任何一路）',JSON.stringify(L)===JSON.stringify(['去年，你站在這一排攤位前面填表。','你只是走過。']),JSON.stringify(L));
  fresh(d16,15,'campus',{}); G.stage='law'; at(-13.5,13.6); tick(); await wait(); L=lines(); check('4. 都不認識：只有「你只是走過。」',JSON.stringify(L)===JSON.stringify(['去年，你站在這一排攤位前面填表。','你只是走過。']),JSON.stringify(L));
  fresh(d16,9.5,'campus',{CLUB_club_guitar:true}); G.stage='law'; at(-13.5,13.6); check('5. 10:00 以前不觸發（AA_485 3-2：10:00～16:00）',!tick());
  fresh(d16,16.2,'campus',{CLUB_club_guitar:true}); G.stage='law'; at(-13.5,13.6); check('5. 16:00 以後不觸發',!tick());
  fresh(dk('2026-09-16'),12,'campus',{CLUB_club_guitar:true}); G.stage='law'; at(-13.5,13.6); check('5. 9/16（原本的日子）不觸發',!tick());
  check('5. 校園的帳篷在大二的博覽會那天也擺（zones3d FAIR_DAYS：2026-09-12，CLUBFAIR-REAL-1027 AA_485 3-2 從 9/16、9/17 搬過來；各年校慶的行為檢查在 nav_buildings_unit）',/FAIR_DAYS=\[[^\]]*'2026-09-12'/.test(fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8')));
  // 6. 開學第一頓
  const d17=dk('2026-09-17'); fresh(d17,16,'campus',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); meet('heroine_01'); meet('heroine_03'); G.flags.met_yu=true;
  run(16,16.95); check('6. 17:00 以前沒有邀約',!txt('g:noodle_team').some(t=>/開學第一頓/.test(t)));
  run(17,17.1); check('6. 17:00 阿哲在麵店團群組「開學第一頓 七點，長桌」＋出發選單 19:00',txt('g:noodle_team').some(t=>t==='zhe:開學第一頓 七點，長桌')&&!!OUT.get(G,'y2_first_meal')&&OUT.get(G,'y2_first_meal').h===19,JSON.stringify(txt('g:noodle_team')));
  picks=['行政法妳選']; said=[]; await EVENTS.run(ev('ev_y2_first_meal')); L=lines();   /* AB65-3（AA_211） 第 3 節 3-1 */
  check('6. 台詞（逐字；AB65-3（AA_211） 第 3 節 3-1）：開頭旁白「（暑假以後第一次，長桌又併起來了。）」（AA_428 §2 第 1 點）、阿哲兩句（「老闆娘」改「阿姨」，AA_313 5-3）、以安「我把大家的課表排在一起了，週四晚上大家都沒課。」、語彤「（端麵過來）阿姨說開學，每碗多一顆滷蛋。」（Alison 那句刪掉）；選「行政法妳選哪一班？」→ 以安「許老師那班，聽說他很愛點人。」',L[0]==='（暑假以後第一次，長桌又併起來了。）'&&/大二了，要有學長的樣子。$/.test(L[1])&&/（三秒後）阿姨，大碗。$/.test(L[2])&&/我把大家的課表排在一起了，週四晚上大家都沒課。$/.test(L[3])&&/（端麵過來）阿姨說開學，每碗多一顆滷蛋。$/.test(L[4])&&/許老師那班，聽說他很愛點人。$/.test(L[5])&&L.length===6&&G.flags.Y2_FIRST_MEAL,JSON.stringify(L));
  fresh(d17,16,'campus',{}); G.stage='law'; picks=['先吃']; said=[]; await EVENTS.run(ev('ev_y2_first_meal')); L=lines();
  check('6. 只認識阿哲：阿哲兩句、選項只有「先吃。」→ 旁白「（阿哲已經開始吃了。）」（AB65-3（AA_211） 3-1；原本「這才是學長的樣子。」；開頭旁白 AA_428 §2 第 1 點）',L.length===4&&L[0]==='（暑假以後第一次，長桌又併起來了。）'&&L[3]==='（阿哲已經開始吃了。）'&&JSON.stringify(opts[opts.length-1])===JSON.stringify(['「先吃。」']),JSON.stringify([L,opts]));
  // 沒去 → 21:30 照片；不在群組＝阿哲私訊
  fresh(d17,16,'campus',{}); G.stage='law'; run(16,17.1); check('7. 不在麵店團群組：阿哲私訊邀約',txt('p:zhe').some(t=>t==='zhe:開學第一頓 七點，長桌'));
  G.hour=19.3; OUT.expire(G); run(19.3,21.4); check('7. 沒出發＝沒去；21:30 以前沒有照片',OUT.get(G,'y2_first_meal').state==='missed'&&!txt('p:zhe').some(t=>/六碗麵/.test(t)));
  run(21.5,21.6); check('7. 21:30 照片「（長桌上六碗麵，一碗是大碗。）」',txt('p:zhe').some(t=>t==='zhe:📷（長桌上六碗麵，一碗是大碗。）'));
  // 8. 中秋烤肉
  const d25=dk('2026-09-25'); fresh(d25-1,20,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); meet('classmate_bohan'); meet('heroine_01'); meet('classmate_xinci'); meet('heroine_03'); G.flags.met_yu=true;
  run(20,20.9); check('8. 9/24 21:00 以前沒有',!txt('g:noodle_team').some(t=>/中秋/.test(t)));
  run(21,21.1); check('8. 9/24 21:00「明天中秋，河濱，晚上六點 烤肉架今年你負責」＋出發選單 9/25 18:00',txt('g:noodle_team').some(t=>t==='zhe:明天中秋，河濱，晚上六點 烤肉架今年你負責')&&OUT.get(G,'y2_midautumn').day===d25&&OUT.get(G,'y2_midautumn').h===18);
  G.day=d25; picks=['便利商店']; said=[]; await EVENTS.run(ev('ev_y2_midautumn')); L=lines();
  const want=['zhe：夾子呢？','祐廷：……兩個架子，一支夾子。','classmate_bohan：那輪流，一人夾十分鐘。','（Alison 已經拿筷子在翻肉了。）','classmate_xinci：左邊火比較大，肉先放左邊。','（語彤從袋子裡拿出一罐阿姨的醬。）','（回來時，大家已經用筷子烤完第一輪。）','zhe：你回來了喔，第一輪吃完了。'];   /* AB65-3（AA_211） 第 3 節 3-2；以安「我贊成。這樣公平。」刪掉（AA_428 §2 第 2 點：照 AA_211 3-2「以安這場不說話」）*/
  const nm=a=>a.map(t=>t.replace(/^阿哲：/,'zhe：').replace(/^(許)?柏翰：/,'classmate_bohan：').replace(/^(沈)?以安：|^小安：/,'heroine_01：').replace(/^Alison：/,'yu：').replace(/^[^：]*芯慈：/,'classmate_xinci：').replace(/^(陳)?語彤：/,'heroine_03：'));
  check('8. 台詞（逐字；認識的人都在）＋買夾子',JSON.stringify(nm(L))===JSON.stringify(want)&&G.flags.MIDAUTUMN_Y2,JSON.stringify(L));
  fresh(d25,17,'campus',{}); G.stage='law'; picks=['用筷子']; said=[]; await EVENTS.run(ev('ev_y2_midautumn')); L=lines();
  check('8. 只認識阿哲＋「用筷子就好。」：沒有其他人的台詞、Alison 不在就沒有「對嘛。」',L.length===2,JSON.stringify(L));
  fresh(d25-1,20,'dorm',{}); G.stage='law'; run(20,21.1); G.day=d25; G.hour=18.3; OUT.expire(G); run(18.3,21.6);
  check('8. 沒去：21:30 照片「（兩個烤肉架，少一支夾子。）」',txt('p:zhe').some(t=>t==='zhe:📷（兩個烤肉架，少一支夾子。）'));
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); run(21.6,23); check('9. 存讀檔後不重發',(G.msgs||[]).filter(m=>/少一支夾子/.test(m.text)).length===1);
  // 10a. 語彤不在法服（AA_255 第 4 節第 2 點、AA_259 第 4 節第 3 點；STORY.YT_FAFU 固定 'no'）：9/26 不演、不記 YT_LEGALAID_Y2；週六 9～12 在麵店
  { const dd=dk('2026-09-26'); fresh(dd,9.5,'wancai',{}); G.stage='law'; at(0.5,2.2); const t0=tick(); fresh(dd,13,'dorm',{}); G.stage='law'; run(13,13.1);
    const sn=CHARACTERS.heroine_03.daily_schedule.find(q=>q.zone==='noodle'&&q.days.includes(6)&&q.from===9), sw=CHARACTERS.heroine_03.daily_schedule.find(q=>q.zone==='wancai'&&q.days.includes(6));
    check('10a. 語彤不在法服：9/26 萬才館不演事件 7、不記 YT_LEGALAID_Y2；週六 9～12 在麵店（萬才館那一格不成立）',STORY.YT_FAFU==='no'&&!t0&&!G.flags.YT_LEGALAID_Y2&&!!sn&&sn.to===12&&sn.if.custom({day:dd,stage:'law',flags:{}})&&!sw.if.custom({day:dd,stage:'law',flags:{}})); }
  STORY.YT_FAFU='yes';   /* 下面是事件 7 原本的內容（企劃保留）：只在 YT_FAFU='yes' 時演 */
  // 10. 語彤事件 7 法服的第一次值班（9/26）
  const d26=dk('2026-09-26'); check('10. 9/26 是大二上第 3 週週六、法服值班日（單週）',CALENDAR.termOf(d26).week===3&&CALENDAR.dateOf(d26).wd===6&&!!STORY.fafuDuty({day:d26,stage:'law',flags:{}}));
  check('10. 語彤的作息：值班的週六 9～12 在萬才館一樓（國定假日不值班）',(()=>{ const sc=CHARACTERS.heroine_03.daily_schedule.find(q=>q.zone==='wancai'&&q.days.includes(6)); return !!sc&&sc.from===9&&sc.to===12&&sc.if.custom({day:d26,stage:'law',flags:{}})&&!sc.if.custom({day:d26-7,stage:'law',flags:{}})&&!sc.if.custom({day:d26+7,stage:'law',flags:{}})&&!sc.if.custom({day:d26+14,stage:'law',flags:{}})&&sc.if.custom({day:d26+28,stage:'law',flags:{}}); })());   /* 10/10 國慶日不值班（AA_184），10/24 照常 */
  // AA_325 2-Y2-01：舊的事件 7（ev_y2_yt_duty）和第 4 週的轉述（ev_y2_yt_duty_heard）退休（AA_11 舊事件 7 已刪），換成大二第一次值班之後的麵店閒聊（src/y2r2_3d.js，tests/y2_round2_unit.js）
  check('10. ev_y2_yt_duty、ev_y2_yt_duty_heard 標 retired（AA_325 2-Y2-01）',!!ev('ev_y2_yt_duty').retired&&!!ev('ev_y2_yt_duty_heard').retired);
  fresh(d26,9.5,'wancai',{}); G.stage='law'; meet('heroine_05'); at(0.5,2.2); check('10. 退休以後：就算 YT_FAFU 是 yes，9/26 萬才館也不演舊的事件 7',!tick()&&!G.flags.YT_DUTY_SEEN);
  const w4=d26+3; fresh(w4,18,'noodle',{}); G.stage='law'; R('heroine_03',...LV.FAM); meet('heroine_03');
  const yt={obj:{position:{x:1,y:0,z:0}},lv:0,charId:'heroine_03'}; GM.npc.heroine_03=yt; E.npcs=[yt]; at(1.5,0.5);
  check('11. 退休以後：第 4 週麵店不轉述（YT_DUTY_HEARD 改由 ev_yt_shift_chat 記）',!tick()&&!G.flags.YT_DUTY_HEARD);
  GM.npc={}; E.npcs=[]; STORY.YT_FAFU='no';
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
