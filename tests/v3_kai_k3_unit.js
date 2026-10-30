// 阿凱 K3 週日宵夜（BB_97 4-1）：搬完房間以後大二上每週日、大二下每月第一個週日 23:00；去＝滷味攤（第一次三選一、之後輪流一句、快轉到 00:00）；這週不行；連續三週沒回多一句；3 次＝SUNDAY_SUPPER——不需要瀏覽器。
// 修改前沒有 ev_kai_sunday_supper（全部失敗）。用法：node tests/v3_kai_k3_unit.js
// （2026-10-28 AA_519 5-4（企劃線 d75cd0228，NPC-STORY2-1028）：第一則第二句「我這棟樓下的滷味比較好吃」改「宿舍旁邊那攤滷味比較好吃」，後半照舊——第 2 項照新字查）
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
  if(!ev('ev_kai_sunday_supper')){ console.log('FAIL 0'); console.log('FAILED 1'); process.exit(1); }
  const dk=k=>STORY.dayOfKey(k), d6=dk('2026-09-06'), s1=dk('2026-09-13'), K=()=>txt('p:kai');
  const ask=d=>(G.msgs||[]).find(m=>m.ask&&m.ask.id==='kai_sup_'+d);
  fresh(s1,22,'dorm',{}); G.stage='law'; run(22,23.5); check('1. 還沒搬房間（沒有 ROOM_Y2）＝週日不問',!K().some(t=>/宵夜/.test(t)));
  fresh(s1,22,'dorm',{ROOM_Y2:d6}); G.stage='law'; run(22,22.95); check('1. 23:00 以前不問',!K().some(t=>/宵夜/.test(t)));
  run(23,23.1); let T=K(); check('2. 第一個週日 23:00：「宵夜」＋「宿舍旁邊那攤滷味比較好吃 老闆會多給豆干」（AA_519 5-4；AA_428 §2 第 8 點：SC4 #13，阿凱的訊息不打標點；原本 AA_335 T2 有標點）＋兩個回覆',T[T.length-2]==='kai:宵夜'&&T[T.length-1]==='kai:宿舍旁邊那攤滷味比較好吃 老闆會多給豆干'&&!!ask(s1)&&ask(s1).ask.opts.length===2,JSON.stringify(T));
  PHONE.answer(G,'kai_sup_'+s1,0); run(23.1,23.2); check('2. 回「去。」＝出發選單（宿舍旁的滷味攤）',G.flags.KAI_SUP_GO===s1&&!!OUT.get(G,'kai_sup_'+s1)&&OUT.get(G,'kai_sup_'+s1).place==='宿舍旁的滷味攤');
  picks=['新室友']; said=[]; await EVENTS.run(ev('ev_kai_sunday_supper')); let L=lines();
  const want=['（週日晚上十一點，宿舍旁的滷味攤。阿凱已經夾好兩籃。）','你的我幫你夾了。豆干、海帶、王子麵。','你大一每次都點這三樣，對吧？'/* AB65-3：AA_211 附錄 B E8（原本「…我記得。」）*/,'十點就睡。','……我還不習慣有人那麼早關燈。','下週日一樣喔。'];   /* 收尾 AA_428 §2 第 8 點：照 SC4 #13（原本 AA_335 T3「下週日，同一時間。我先去排。」）*/
  check('3. 第一次：逐字＋「你新室友怎麼樣？」',JSON.stringify(L.map(t=>t.replace(/^[^：（]*：/,'')))===JSON.stringify(want),JSON.stringify(L));
  check('3. 快轉到 00:00（測試的 GM.advance 不換日：24 點）；去過 1 次',((G.day===s1+1&&Math.abs(G.hour)<1e-6)||(G.day===s1&&Math.abs(G.hour-24)<1e-6))&&G.flags.KAI_SUP_N===1,JSON.stringify([G.day-s1,G.hour]));
  // 第二週
  G.day=s1+7; G.weekday=wdOf(G.day); G.hour=22.9; run(22.9,23.1); T=K(); check('4. 第二週只有「宵夜」（AA_428 §2 第 8 點：不打標點）',T[T.length-1]==='kai:宵夜'&&!!ask(s1+7),JSON.stringify(T.slice(-2)));
  PHONE.answer(G,'kai_sup_'+(s1+7),0); run(23.1,23.2); said=[]; await EVENTS.run(ev('ev_kai_sunday_supper')); L=lines();
  check('4. 第二次以後：旁白＋輪流一句（第一句「今天我多夾了一顆貢丸。」）',L[0]==='（週日晚上，滷味攤。阿凱的籃子永遠比你的滿。）'&&/今天我多夾了一顆貢丸。$/.test(L[1])&&L.length===2,JSON.stringify(L));
  // 第三週：這週不行
  G.day=s1+14; G.weekday=wdOf(G.day); G.hour=22.9; run(22.9,23.1); PHONE.answer(G,'kai_sup_'+(s1+14),1); run(23.1,23.2); T=K();
  check('5. 「這週不行。」→「好。下週日。」、沒有出發選單',T[T.length-1]==='kai:好。下週日。'&&!OUT.get(G,'kai_sup_'+(s1+14)),JSON.stringify(T.slice(-3)));
  // 第四次去＝3 次以上 → SUNDAY_SUPPER
  G.day=s1+21; G.weekday=wdOf(G.day); G.hour=22.9; run(22.9,23.1); PHONE.answer(G,'kai_sup_'+(s1+21),0); run(23.1,23.2); said=[]; await EVENTS.run(ev('ev_kai_sunday_supper')); L=lines();
  check('6. 去了 3 次＝阿凱 SUNDAY_SUPPER（輪替第二句照 BB_167 SC4 #13「新室友說我話很多。……真的很多嗎？」，AB65-3）',SOCIAL.has('kai','SUNDAY_SUPPER')&&G.flags.KAI_SUP_N===3&&/新室友說我話很多。……真的很多嗎？$/.test(L[1]),JSON.stringify(L));
  // 連續三週沒回
  fresh(s1,22,'dorm',{ROOM_Y2:d6}); G.stage='law'; for(const w of [0,1,2]){ G.day=s1+7*w; G.weekday=wdOf(G.day); run(22.9,23.1); }
  G.day=s1+14+1; G.weekday=wdOf(G.day); run(17,17.9); check('7. 第三週的回覆期限（週一 18:00）以前沒有',!K().some(t=>/還活著/.test(t)));
  run(18.1,18.3); check('7. 連續三週沒回：「你還活著吧？……活著就好。下週日。」',K().some(t=>t==='kai:你還活著吧？……活著就好。下週日。'));
  G.day=s1+21; G.weekday=wdOf(G.day); run(22.9,23.1); G.day++; run(18.1,18.3); check('7. 只說一次',K().filter(t=>/還活著/.test(t)).length===1);
  // 大二下：每個月第一個週日
  const m7=dk('2027-03-07'), m14=dk('2027-03-14'); fresh(m14,22.9,'dorm',{ROOM_Y2:d6}); G.stage='law'; run(22.9,23.2); check('8. 大二下 3/14（不是第一個週日）不問',!K().some(t=>/宵夜/.test(t)));
  G.day=m7; G.weekday=wdOf(m7); run(22.9,23.2); check('8. 大二下 3/7（三月第一個週日）問（「宵夜」，AA_428 §2 第 8 點）',K().some(t=>t==='kai:宵夜')&&CALENDAR.termOf(m7).id==='Y2S2');
  const sp=dk('2027-07-04'); fresh(sp,22.9,'dorm',{ROOM_Y2:d6}); G.stage='law'; run(22.9,23.2); check('8. 暑假不問',!K().some(t=>/宵夜/.test(t)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
