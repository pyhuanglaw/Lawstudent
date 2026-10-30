// 沛珊 P4 交接讀書會＋柏翰 翰 3 分數表（BB_97 4-3；AA_40、AA_177 第 5 節；任務 V3-B15）——不需要瀏覽器。
// 2026-10-17 起在以安的公法讀書會（週四 20:00，BB_191 §8-7、AA_222；法服沒有讀書會）。
// 檢查：大二下第 1 週週四讀書會的 clubEvent＝P4（她在場）；「我接。」要大一公法讀書會 5 次以上（舊存檔的法服讀書會也算）；沒去 21:30 公法讀書會群組最後一則；翰 3 第 2 週週四（柏翰接）、選項、她走了；一個月後的旁白；祐廷接＝3/4 21:00 全班群組分布圖。用法：node tests/v3_p4_han3_unit.js
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
  const NM={'郭沛珊':'沛珊','陳沛珊':'沛珊','許柏翰':'柏翰'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const A=ACTIVITIES.list.find(a=>a.id==='public_law_group');
  const w1=termDay('Y2S1',15,4), w2=termDay('Y2S2',2,4), w6=termDay('Y2S2',6,4);   /* P4 搬到大二上第 15 週週四 12/17（BB_205 第 2 節 64aaaa82）*/
  check('0. P4＝大二上第 15 週週四 2026-12-17；大二下第 2 週週四＝3/4',D('2026-12-17')===w1&&D('2027-03-04')===w2);
  const y1att=(n)=>{ const att=ACTIVITIES.rec(G).att; const d0=termDay('Y1S1',10,4); for(let i=0;i<n;i++) att['public_law_group@'+(d0+7*i)]={h:20,end:'full'}; };
  const base=(day,o)=>{ o=o||{}; fresh(day,20,'wancai',o.flags); meet('classmate_peishan'); meet('classmate_bohan'); meet('heroine_05'); if(o.att) y1att(o.att); };
  base(w1);
  check('1. 12/17（四）20:00 沛珊在萬才館（公法讀書會；大二上還在學校）',STORY.reachable('classmate_peishan',G)&&STORY.present('classmate_peishan',G)&&(()=>{ const s=STORY.schedFor&&STORY.schedFor('classmate_peishan',G); return !s||s.zone==='wancai'; })());
  let e=CLS.clubEvent(G,A);
  check('1. 讀書會的 clubEvent＝ev_peishan_handover',!!e&&e.id==='ev_peishan_handover',e&&e.id);
  base(w1+7); e=CLS.clubEvent(G,A);
  check('1. 下一週（第 16 週）不是 P4',!e||e.id!=='ev_peishan_handover');
  const play=async(id,pick,o)=>{ base(o.day,o); said=[]; opts=[]; picks=[pick]; await EVENTS.run(ev(id)); return {L:L0(),O:opts[0]||[]}; };
  let r=await play('ev_peishan_handover',0,{day:w1,att:5});
  check('2. 三句：下學期的題目……（AA_281 改字：她什麼都不說）／誰要接？／不要變成比分數的地方',r.L.slice(0,3).join('｜')==='沛珊：下學期的題目，我想換人整理。我一個人出的都太簡單。｜沛珊：每週的題目整理……（看柏翰，又看你）誰要接？｜沛珊：只有一個條件：要好玩。',JSON.stringify(r.L));
  check('2. 大一去過 5 次：「我接。」／（不說話）；選「我接。」＝STUDYGROUP_LEADER',JSON.stringify(r.O)==='["「我接。」","（不說話）"]'&&G.flags.STUDYGROUP_LEADER===true&&STORY.plgY1Count(G)===5);
  r=await play('ev_peishan_handover',0,{day:w1,att:4});
  check('2. 只去過 4 次：只有（不說話）、不設 STUDYGROUP_LEADER',JSON.stringify(r.O)==='["（不說話）"]'&&!G.flags.STUDYGROUP_LEADER);
  base(w1); y1att(3); ACTIVITIES.rec(G).att['public_law_group@'+(termDay('Y2S1',3,4))]={h:20,end:'full'}; ACTIVITIES.rec(G).att['public_law_group@'+(termDay('Y2S1',4,4))]={h:20,end:'left'};
  check('2. 大二上去的不算（大一只有 3 次）',STORY.plgY1Count(G)===3);
  base(w1); y1att(3); ACTIVITIES.rec(G).att['lawclub_study@'+(termDay('Y1S1',5,3))]={h:19,end:'full'}; ACTIVITIES.rec(G).att['lawclub_study@'+(termDay('Y1S1',6,3))]={h:19,end:'full'};
  check('2. 舊存檔大一去過的法服讀書會也算（3＋2＝5）',STORY.plgY1Count(G)===5);
  base(w1); PHONE.join(G,'public_law','公法讀書會'); G.hour=21; run(21,21.4);
  check('3. 沒去：21:24 還沒有',!PHONE.sent(G,'ps_p4_missed'));
  run(21.5,21.7);
  check('3. 沒去：21:30 公法讀書會群組「題目整理交給柏翰了。要好玩喔。」',txt('g:public_law').slice(-1)[0]==='classmate_peishan:題目整理交給柏翰了。要好玩喔。');
  base(w1); PHONE.join(G,'public_law','公法讀書會'); G.events.done.ev_peishan_handover=1; run(21.5,21.7);
  check('3. 有去：沒有那一則',!PHONE.sent(G,'ps_p4_missed'));
  base(w1); PHONE.join(G,'public_law','公法讀書會'); G.events.done.ev_peishan_handover=1; G.flags.STUDYGROUP_LEADER=true; run(21.8,22.2);
  check('3. 接了（STUDYGROUP_LEADER）：12/17 22:00 沛珊「這學期的題目和筆記，我放在B館櫃子的第二格。」→「收到。」（BB_205 第 2 節；AA_281 改字）',txt('p:classmate_peishan').includes('classmate_peishan:這學期的題目和筆記，我放在B館櫃子的第二格。'));
  base(w2); e=CLS.clubEvent(G,A);
  check('4. 柏翰接：第 2 週週四讀書會＝翰 3',!!e&&e.id==='ev_bohan_scores',e&&e.id);
  base(w2,{flags:{STUDYGROUP_LEADER:true}}); e=CLS.clubEvent(G,A);
  check('4. 祐廷接：第 2 週沒有翰 3',!e||e.id!=='ev_bohan_scores');
  r=await play('ev_bohan_scores',0,{day:w2});
  check('4. 白板的表（AA_375 第 23 項：第 1 週沒有小考，讀了幾頁）、「這樣比較有效率。」；兩個選項',r.L.slice(0,2).join('｜')==='（白板上多了一張表：每個人上週讀了幾頁。）｜柏翰：這樣比較有效率。'&&r.O.length===2);
  check('4. 「讀書會不是比分數的地方吧。」（AA_358 2-6：原本「沛珊說…」，沒參加交接那場的玩家不能引用她的話）→「她不來了。這樣大家比較知道自己差多少。」（AA_255／AA_281）',r.O[0]==='「讀書會不是比分數的地方吧。」'&&r.L.slice(-1)[0]==='柏翰：她不來了。這樣大家比較知道自己差多少。'&&G.flags.HAN3_TALKED===true,JSON.stringify(r.O));
  r=await play('ev_bohan_scores',1,{day:w2});
  check('4. 什麼都不做：沒有柏翰那句',!r.L.includes('柏翰：她不來了。這樣大家比較知道自己差多少。'));
  base(w6); e=CLS.clubEvent(G,A);
  check('5. 一個月後（第 6 週）：「來對題目的人從八個變四個。」（AA_313 5-5：讀書會改三條以後是八個人）',!!e&&e.id==='ev_bohan_scores_month'&&ev('ev_bohan_scores_month').dialogue[0].text==='（來對題目的人從八個變四個。）');
  base(termDay('Y2S2',5,4)); e=CLS.clubEvent(G,A);
  check('5. 第 5 週還沒有',!e||e.id!=='ev_bohan_scores_month');
  base(w6,{flags:{STUDYGROUP_LEADER:true}}); e=CLS.clubEvent(G,A);
  check('5. 祐廷接：沒有',!e||e.id!=='ev_bohan_scores_month');
  base(w2,{flags:{STUDYGROUP_LEADER:true}}); PHONE.join(G,'law_class','法律系（全班）'); run(20.5,20.95);
  check('6. 祐廷接：20:57 還沒有',!PHONE.sent(G,'han3_chart'));
  run(21,21.2);
  check('6. 祐廷接：3/4 21:00 柏翰在全班群組貼照片（沒有字；AA_375 第 23 項：讀的頁數）',txt('g:law_class').slice(-1)[0]==='classmate_bohan:（照片：白板上每個人這週要讀到哪裡）');
  base(w2); PHONE.join(G,'law_class','法律系（全班）'); run(20.5,21.5);
  check('6. 柏翰接：沒有分布圖',!PHONE.sent(G,'han3_chart'));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
