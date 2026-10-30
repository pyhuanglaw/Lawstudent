// V1-F 法服週六值班：大一在旁邊看（AA_163 第 1 節、BB_145）——不需要瀏覽器。用法：node tests/v1f_fafu_sat_unit.js
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
let said=[], picks=[], rels=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,d){ rels.push([id,d]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags,stage)=>{ G={v:3,day,hour,zone,stage:stage||'econ',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; picks=[]; rels=[]; };
const run=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const at=(day,hour)=>{ G.day=day; G.hour=hour; G.weekday=wdOf(day); run(); };
const TH=th=>PHONE.thread(G,th).map(m=>m.text);
(async()=>{
  const K=k=>STORY.dayOfKey(k);
  const satOf=(term,week)=>{ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd===6) return d; } };
  const s3=satOf('Y1S1',3), s4=satOf('Y1S1',4), s1=satOf('Y1S1',1), s5=satOf('Y1S1',5), y2=satOf('Y2S1',3);
  const mk=(day,h,stage)=>{ fresh(day,h,'wancai',{},stage||'law'); return G; };
  check('1. 值班的週六：第 3、5 週（單週、第 3 週起）；第 1、4 週不是；經濟系那一年不是',STORY.fafuDuty(mk(s3,10))&&STORY.fafuDuty(mk(s5,10))&&!STORY.fafuDuty(mk(s1,10))&&!STORY.fafuDuty(mk(s4,10))&&!STORY.fafuDuty(mk(STORY.dayOfKey('2024-09-21'),10,'econ')));
  check('1. 大一可以旁觀；大二上：沒加入法服的照樣可以旁觀（AA_184：四年都可以），加入法服的社員改做紀錄、不旁觀',STORY.fafuWatchable(mk(s3,10))&&STORY.fafuWatchable(mk(y2,10))&&(()=>{ const g=mk(y2,10); g.flags.lawclub=true; return !STORY.fafuWatchable(g); })());
  const d5=CALENDAR.dateOf(s5);
  check('2. 告示：值班的上午只寫「法律服務　隔週週六 9:00～12:00　萬才館一樓」；第 4 週寫下一次（第 5 週週六）',STORY.fafuNotice(mk(s3,10))==='法律服務　隔週週六 9:00～12:00　萬才館一樓'&&STORY.fafuNotice(mk(s4,10))==='法律服務　隔週週六 9:00～12:00　萬才館一樓　下一次：'+d5.m+'/'+d5.d+'（六）',STORY.fafuNotice(mk(s4,10)));
  mk(s3,9.5); said=[]; await STORY.fafuWatch(GM); let L=said.map(x=>x.t);
  check('3. 第一次（AA_238 2-1：學姊換社長）：阿伯押金、社長先問三件事、阿伯「我是不是很麻煩？」、研究所學長、社長「第一次來？站這邊聽就好。」「不要插話，也先不要給意見。……」；沒有學姊',L[0]==='圓桌旁坐著一位阿伯，手上一疊影印的紙。他說房東不還押金。'&&L.includes('社長沒有馬上回答。他先問：「租約還在嗎？什麼時候搬走的？當初押金付了多少？」研究所的學長在旁邊一項一項寫下來。')&&L.includes('不會。您慢慢說，我們先把事情弄清楚。')&&L.includes('第一次來？站這邊聽就好。')&&L[L.length-1]==='不要插話，也先不要給意見。看我們怎麼問。……問題問對了，事情就清楚一半。'&&!said.some(x=>x.who==='溫學姊'||/學姊/.test(x.t)),JSON.stringify(L.slice(-3)));
  check('3. 記 LAWCLUB_SAT_FIRST、LAWCLUB_SAT_VISITS＝1；時間 +30 分鐘',G.flags.LAWCLUB_SAT_FIRST===true&&G.flags.LAWCLUB_SAT_VISITS===1&&Math.abs(G.hour-10)<0.01);
  said=[]; await STORY.fafuWatch(GM); L=said.map(x=>x.t); check('4. 同一個週六再看：池的第一句（媽媽、打工扣薪水）＋社長點頭；次數不加',L[0].startsWith('今天來的是一位媽媽')&&L[1]==='（社長點頭，回到圓桌。）'&&G.flags.LAWCLUB_SAT_VISITS===1,JSON.stringify(L));
  said=[]; await STORY.fafuWatch(GM); check('4. 下一次是社長的第一句（輪流；AA_238 2-3）',said[0].t==='又來了？站那邊，看得比較清楚。'&&said[0].who==='法服的社長',JSON.stringify(said[0]));   /* 說話人標籤寫全名「法服的社長」（AA_496 第 9 節第 6 點，2026-10-28；原本「社長」）*/
  G.hour=12; check('4. 12:00 以後不能看',!(await STORY.fafuWatch(GM)));
  // 七句用完再重來、五次那句
  const duty=[]; for(let d=s5;d<s5+400&&duty.length<8;d++){ G.day=d; G.hour=10; if(STORY.fafuWatchable(G)) duty.push(d); } const seen=new Set(); for(let i=0;i<7;i++){ G.day=duty[i]; G.hour=9.5; G.weekday=6; said=[]; await STORY.fafuWatch(GM); if(said[0]) seen.add(said[0].t); }
  check('5. 第 5 次去（不同的週六）：第一句是社長「你來五次了。明年可以報名當志工，來坐圓桌。」（AA_238 2-2；只一次）',[...seen].includes('你來五次了。明年可以報名當志工，來坐圓桌。'));
  check('5. 池的七句都出現過（不重複到用完）',seen.size>=7,seen.size);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
