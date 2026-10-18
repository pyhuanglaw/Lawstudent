// v0 P2b 門口有人在揪（AA_154 2-5a；BB_105 P2b，BB-B 6d59df01）：週四會計下課 40%（只到 10/17 以前，AA_218 第 11 節）、跟去的五種去處與結束時間、L5b；E13 三種散場已刪（AA-C Q1）——不需要瀏覽器。
// 修改前沒有 ev_y0_p2b（全部失敗）。用法：node tests/v0_p2b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], rels=[], opts=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k), W6=K('2024-10-09'), T7=K('2024-10-17'), T8=K('2024-10-24'), T9=K('2024-10-31'), T11=K('2024-11-14'), T12=K('2024-11-21'), T13=K('2024-11-28'), T14=K('2024-12-05'), T15=K('2024-12-12'), T17=K('2024-12-26'), S5=K('2025-03-20'), S6=K('2025-03-27');
  const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_p2b'); check('0. P2b 在、放在事件表最後（同一堂會計課的固定事件先演）',!!ev&&STORY_EVENTS.indexOf(ev)>STORY_EVENTS.findIndex(e=>e.id==='ev_y0_p1b2')); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  STORY.P2B_P=1; GM.money=d=>{ G.money+=d; };
  const M6=K('2024-10-07'), M7=K('2024-10-14'), M8=K('2024-10-21');
  check('0. AA_272 第 13 節：P2b 改成經濟學原理（週一上午）下課',ev.afterClass==='econ_principles_y0'&&CALENDAR.dateOf(M6).wd===1&&CALENDAR.dateOf(M7).wd===1);
  fresh(M6,12.2,'boya'); check('1. P2 還沒演過：不揪',!EVENTS.check(ev));
  fresh(M6,12.2,'boya',{P2_PICK:'river'}); check('1. 10/7（第 6 週週一）：一定揪（不擲機率）',EVENTS.check(ev));
  fresh(M7,12.2,'boya',{P2_PICK:'home'}); check('1. 10/14（第 7 週週一）：P2 都選「今天先回去」的玩家也揪',EVENTS.check(ev));
  fresh(W6,15.2,'putong',{P2_PICK:'river'}); check('1. 10/9 不是週一：不揪（weekday 由下課的那堂課決定；這裡看 p2bDue 的週次以外，afterClass 只在經濟學原理下課叫）',ev.afterClass!=='acct_y0');
  fresh(T7,15.2,'putong',{P2_PICK:'river'}); check('1. 10/17（休學那天）起不揪',!EVENTS.check(ev));
  const due=d=>{ fresh(d,12.2,'boya',{P2_PICK:'home'}); return EVENTS.check(ev); };
  check('2. 10/17 以後都不揪：10/21、W9、W11、W17、Y0S2',!due(M8)&&!due(T9)&&!due(T11)&&!due(T17)&&!due(S5)&&!due(S6));
  fresh(M6,12.2,'boya',{P2_PICK:'river'}); OUT.plan(G,{id:'x_other',day:M6,h:19,place:'公館',title:'別的約',travelH:0.25}); check('3. 那天已經約了別的出遊：不揪',!EVENTS.check(ev));
  { fresh(M6,12.2,'boya',{P2_PICK:'home'}); SOCIAL.meet('kexin','x'); picks=['跟去']; await EVENTS.run(ev); G.flags.P2B_COUNT=G.flags.P2B_COUNT||0; run();
    check('3. P2 都選「今天先回去」、P2b 跟去：照第一次聚會進「走啦」（系統訊息）',PHONE.inGroup(G,'econ_friends')&&TH('g:econ_friends').includes('韋綸建立了群組「走啦」，把你加了進來。'),JSON.stringify(TH('g:econ_friends')));
    check('3. 沒有「會計終於上完了。」（改成「經原終於下課了。誰要出去？」，AA-C 2beb591f）',!STORY_EVENTS.find(e=>e.id==='ev_y0_p2b').dialogue.some(l=>l.text==='會計終於上完了。誰要出去？')&&STORY_EVENTS.find(e=>e.id==='ev_y0_p2b').dialogue.some(l=>l.text==='經原終於下課了。誰要出去？')); }
  // 下面 4～12 直接跑事件內容（EVENTS.run 不看觸發條件）：新時間線 10/17 以後不會再觸發，內容留著（AA 還沒定要不要搬）
  // 跟去（第一次＝滷味攤 food）
  fresh(T7,15.2,'putong',{P2_PICK:'river'}); SOCIAL.meet('kexin','x'); SOCIAL.meet('econ_pinyu','x'); SOCIAL.meet('econ_zhengxun','x'); const f0=SOCIAL.rel('econ_pinyu').fam, m0=G.money;
  picks=['跟去']; await EVENTS.run(ev); const L=said.map(x=>x.t);
  check('4. 韋綸一句（4 句之一，BB_179 段 B #61～64：不再說「走啦」）→ 跟去：滷味攤（品妤吃到一半先去打工）、19:30 結束、−80 元、經濟系朋友熟悉度 +1、P2B_COUNT＝1',['下課了！今天不要直接回宿舍啦。','經原終於下課了。誰要出去？','我問過了，大家都有空。……好啦，我還沒問。','我今天什麼都不想讀了。誰要跟？'].includes(L[0])&&L.includes('公館的滷味攤。可昕每一樣都夾一點，阿勳只夾豆干。品妤吃到一半先走了，要去打工。')&&Math.abs(G.hour-19.5)<1e-6&&G.money===m0-80&&SOCIAL.rel('econ_pinyu').fam===f0+1&&G.flags.P2B_COUNT===1,JSON.stringify(L));
  check('4. W7 是期中前：沒有 E13 的選擇',!L.some(t=>/紅燈九十秒/.test(t)));
  check('4. 同一週不再揪',!EVENTS.check(ev));
  const last=G.flags.P2B_LAST;
  // 第二次（river）：Y0S1 第一次 river 接 L5b
  const snapF=()=>Object.assign({},G.flags); let FL=snapF();
  fresh(T11,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去','拍什麼']; await EVENTS.run(ev); let L2=said.map(x=>x.t);
  check('5. 韋綸的句子不連續重複',G.flags.P2B_LAST!==last);
  check('5. 第二次＝河濱 river：17:00 結束、接 L5b（溫州街牽車、韋綸／品妤兩句，選「拍什麼？」韋綸接「騎腳踏車去淡水的那種！」）、L5B_DONE',L2.some(t=>/^騎腳踏車到河濱/.test(t))&&L2.includes('這條巷子很適合拍電影。')&&!L2.includes('機率上，總有人在這裡拍過。')&&L2.includes('騎腳踏車去淡水的那種！……結局我還沒想好。')&&Math.abs(G.hour-17)<1e-6&&G.flags.L5B_DONE===true&&G.flags.P2B_COUNT===2,JSON.stringify(L2));
  check('5. river 沒有花錢、沒有 E13③（韋綸的腳踏車還沒演）',G.money===5000&&!L2.some(t=>/河會記得/.test(t)));
  // 第三次（night：總圖讀到九點）W12：E13 已刪（AA-C 2026-10-17 Q1：10/17 就交往了，retired）——散場沒有「陪大家走到最後」
  FL=snapF(); fresh(T12,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  opts=[]; picks=['跟去']; await EVENTS.run(ev); let L3=said.map(x=>x.t);
  check('6. 第三次＝總圖讀到九點（21:00）、回宿舍；E13 已刪：沒有「先回去了／陪大家走到最後」、沒有女舍門口那段、不記 E13_NIGHT',L3.some(t=>/^大家去總圖讀到九點/.test(t))&&!L3.includes('我到了。')&&!opts.some(o=>o.some(x=>/陪大家走到最後/.test(x)))&&!G.flags.E13_NIGHT&&G.zone==='dorm'&&Math.abs(G.hour-21)<1e-6,JSON.stringify(L3));
  // 第四次（夜市，night）：② 已經演過，不再問
  FL=snapF(); fresh(T13,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  picks=['跟去']; await EVENTS.run(ev); let L4=said.map(x=>x.t);
  check('7. 第四次＝夜市（21:30、−80）；沒有 E13',L4.some(t=>/^先各自去讀書/.test(t))&&Math.abs(G.hour-21.5)<1e-6&&G.money===5000-80&&!L4.includes('我到了。'),JSON.stringify(L4));
  // 第六次（food，W15）：E13 已刪
  FL=snapF(); FL.P2B_COUNT=5; fresh(T15,15.2,'putong',Object.assign(FL,{P2B_SEEN:false}));
  opts=[]; picks=['跟去']; await EVENTS.run(ev); let L6=said.map(x=>x.t);
  check('8. food（W15）：沒有 E13 ①（「紅燈九十秒。」）、不記 E13_FOOD、沒有散場的選擇',!L6.includes('紅燈九十秒。')&&!G.flags.E13_FOOD&&!opts.some(o=>o.some(x=>/陪大家走到最後/.test(x))),JSON.stringify(L6));
  // 今天先回去
  FL=snapF(); fresh(T14,15.2,'putong',Object.assign(FL,{P2B_SEEN:false,P2B_WK:null})); const c0=G.flags.P2B_COUNT|0;
  picks=['今天先回去']; await EVENTS.run(ev); check('9. 「今天先回去。」→ 韋綸「那下次！」、次數不變、時間不跳',said.some(x=>x.t==='那下次！')&&(G.flags.P2B_COUNT|0)===c0&&Math.abs(G.hour-15.2)<1e-6&&!EVENTS.check(ev));
  // 存讀檔
  const snap=JSON.parse(JSON.stringify(G)); check('10. 存讀檔：P2B_COUNT、E13_* 都是一般旗標',snap.flags.P2B_COUNT===G.flags.P2B_COUNT&&snap.flags.P2B_SEEN===true);
  // 韋綸的腳踏車（AA_154 2-5b）：11/7 固定
  const BD=K('2024-11-07'); STORY.P2B_P=0;
  fresh(BD,15.2,'putong',{P2_PICK:'river',Y0_CLUB:'badminton'}); OUT.plan(G,{id:'y0_c2',day:BD,h:19,place:'羽球社',title:'新體 19:00',travelH:1/6});
  check('11. 11/7：不再一定揪（10/17 以後沒有 P2b；腳踏車只剩 17:30 群組版）',!EVENTS.check(ev));
  SOCIAL.meet('kexin','x'); SOCIAL.meet('econ_pinyu','x'); SOCIAL.meet('econ_zhengxun','x'); const fb=SOCIAL.rel('econ_zhengxun').fam;
  picks=['跟去','所有權']; await EVENTS.run(ev); const LB=said.map(x=>x.t);
  check('11. 跟去＝腳踏車：陌生人「這台是我的。上個月被偷的。」…韋綸「……祐廷，你不是在看法律的書嗎？」',LB.includes('這台是我的。上個月被偷的。')&&LB.includes('……祐廷，你不是在看法律的書嗎？')&&!LB.some(t=>/^騎腳踏車到河濱/.test(t)),JSON.stringify(LB));
  check('11. 總圖三選一（所有權＝十五分鐘）→「你第一次知道，翻法律要先知道翻哪裡。」→ 時間前進一小時',LB.includes('（十五分鐘就找到）')&&LB.includes('你第一次知道，翻法律要先知道翻哪裡。')&&Math.abs(G.hour-16.2)<1e-6);
  check('11. 「你把查到的，用自己的話說了三件事。」＋祐廷三句（AA_154 2-5b 原文）→ 韋綸「……所以我要還。」… 旁白「答案不是韋綸想聽的。……」',LB.includes('你把查到的，用自己的話說了三件事。')&&LB.includes('被偷的東西，就算你是花錢買的，原主在被偷以後兩年內都可以要回去。')&&LB.includes('可是你可以去找賣你的人。他賣的不是自己的東西，要負責。對話和交易紀錄都留著。')&&LB.includes('先不要吵。跟他說清楚，大家留聯絡方式。要的話，一起去派出所。')&&LB.includes('……所以我要還。')&&LB.includes('……謝謝你們。很少人會這樣。')&&LB[LB.length-1]==='答案不是韋綸想聽的。可是他知道下一步要做什麼了。');
  check('11. 記 WL_BIKE、BIKE_LOOKED_UP；經濟系朋友 +1；沒有 L5b、沒有 E13',G.flags.WL_BIKE===true&&G.flags.BIKE_LOOKED_UP===true&&SOCIAL.rel('econ_zhengxun').fam===fb+1&&!LB.includes('這條巷子很適合拍電影。')&&!LB.some(t=>/河會記得/.test(t))&&!G.flags.L5B_DONE);
  run(); G.hour=17.6; run(); check('11. 去了的玩家 17:30 沒有群組求救',!PHONE.sent(G,'y0_bike_ask'));
  // 之後的 river：L5b（11/7 之前沒演到，留到下一次）→ 再之後 E13③
  let FB=Object.assign({},G.flags); FB.P2B_COUNT=1; STORY.P2B_P=1; fresh(T11,15.2,'putong',Object.assign(FB,{P2B_SEEN:false}));
  picks=['跟去','先找路出去']; await EVENTS.run(ev); check('12. 腳踏車之後第一次 river：L5b（還沒演過）',said.some(x=>x.t==='這條巷子很適合拍電影。')&&G.flags.L5B_DONE===true);
  FB=Object.assign({},G.flags); FB.P2B_COUNT=1; fresh(T13,15.2,'putong',Object.assign(FB,{P2B_SEEN:false}));
  opts=[]; picks=['跟去']; await EVENTS.run(ev); check('12. 再下一次 river：E13③ 已刪（沒有「你第一次在這裡騎車，是什麼時候？」（AA_295 前是「假設河會記得……」）、不記 E13_RIVER）',!said.some(x=>x.t==='你第一次在這裡騎車，是什麼時候？')&&!G.flags.E13_RIVER&&!opts.some(o=>o.some(x=>/陪大家走到最後/.test(x))));
  // 沒去版
  const bikeAsk=()=>PHONE.thread(G,'g:econ_friends').find(m=>m.text==='我的車被認走了。有沒有人懂法律？');
  fresh(BD,17.4,'dorm',{P2_PICK:'river'}); PHONE.join(G,'econ_friends','走啦'); run(); check('13. 沒去：17:30 以前沒有',!bikeAsk());
  at(BD,17.6); const qa=bikeAsk(); check('13. 17:30「走啦」韋綸「我的車被認走了。有沒有人懂法律？」、選項「（查完再回）」「（不回）」到 18:00',!!qa&&qa.ask.opts.map(o=>o.t).join('/')==='（查完再回）/（不回）'&&qa.ask.until===BD*24+18);
  const snapA=JSON.stringify(G); PHONE.answer(G,'y0_bike',0); run(); const TA=TH('g:econ_friends');
  check('13. 去總圖查：時間前進一小時 → 祐廷傳查到的 → 韋綸「……好。我去派出所。」、記 BIKE_LOOKED_UP、WL_BIKE',Math.abs(G.hour-18.6)<1e-6&&TA.includes('被偷的東西，原主兩年內可以要回去。車要還，可是你可以去找賣你的人。紀錄都留著。')&&TA.includes('……好。我去派出所。')&&!TA.includes('（查完再回）')&&G.flags.BIKE_LOOKED_UP===true&&G.flags.WL_BIKE===true,JSON.stringify(TA));
  at(BD,19); check('13. 去查的玩家：阿勳那句不出現',!TH('g:econ_friends').includes('去派出所。留著對話紀錄。'));
  G=JSON.parse(snapA); SOCIAL.bind(G); EVENTS.bind(GM); PHONE.answer(G,'y0_bike',1); at(BD,17.9); check('14. 不回：18:00 以前阿勳還沒說',!TH('g:econ_friends').includes('去派出所。留著對話紀錄。'));
  at(BD,18.05); check('14. 不回：18:00 阿勳「去派出所。留著對話紀錄。」、沒有記號',TH('g:econ_friends').includes('去派出所。留著對話紀錄。')&&!G.flags.BIKE_LOOKED_UP&&!G.flags.WL_BIKE);
  G=JSON.parse(snapA); SOCIAL.bind(G); EVENTS.bind(GM); at(BD,18.2); check('14. 沒回：18:00 阿勳一樣說；選項過期',TH('g:econ_friends').includes('去派出所。留著對話紀錄。')&&!PHONE.answer(G,'y0_bike',0));
  at(BD+14,20.9); check('15. 兩週後 21:00 以前沒有',!TH('g:econ_friends').includes('賣車的人找到了。錢拿回一半。另一半當學費。'));
  at(BD+14,21.1); check('15. 11/21 21:00 韋綸「賣車的人找到了。……」可昕「拿回一半很好了啦。」（BB_179 段 B #71）',TH('g:econ_friends').includes('賣車的人找到了。錢拿回一半。另一半當學費。')&&TH('g:econ_friends').includes('拿回一半很好了啦。')&&!TH('g:econ_friends').includes('學費的邊際效用很高。'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
