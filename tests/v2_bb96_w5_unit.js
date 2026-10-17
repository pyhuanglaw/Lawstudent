// 交接包 v2（BB_96 2-3、2-6）：學姊 W3 調到大一下第 5 週以後＋W3_STANCE；W5「她改的便條」（法服學期檢討會之後）——不需要瀏覽器。修改前沒有 W5（第 1 項失敗）。
// 檢查：W3 的觸發時間；三個選項記 W3_STANCE；檢討會活動（第 17 週週三研討室 A）；去了檢討會＝會後接著演；沒去＝那晚 21:00 以後走進萬才館、第一句旁白不同；
//   讀書會 3 次以上、lawclub 才有；三個選項（第二個再選寫什麼）、NOTICED_HER／GAVE_HER_NOTE；只演一次
// 用法：node tests/v2_bb96_w5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const w5=ev('ev_sis_sticky_notes'), w5b=ev('ev_sis_sticky_notes_late'), rd=ev('ev_grad_reading'), db=ev('ev_grad_debate'), RV=ACTIVITIES.list.find(a=>a.id==='lawclub_review_y1s2');
  check('W5：兩個版本、檢討會活動都在',!!w5&&!!w5b&&!!RV);
  if(!w5||!w5b||!RV){ console.log('FAILED '+fails); process.exit(1); }
  /* W3 */
  { const at=(term,w)=>{ fresh(termDay(term,w,2),15,'library'); G.social=G.social||{}; if(!SOCIAL.setGrad&&G.grad==null) G.grad={state:'CONSIDERING'}; return rd.prereq.custom(G); };
    check('W3（學姊給的文章）：落在大一下第 5 週以後（大一上、大一下第 4 週都還沒有）',at('Y1S2',5)&&at('Y1S2',10)&&!at('Y1S2',4)&&!at('Y1S1',12));
    const opts3=db.dialogue.find(l=>l.choice).choice.map(o=>o.set&&o.set.W3_STANCE);
    check('W3 和學姊吵一次：三個選項記 W3_STANCE（no／diff／unsure），台詞和數字照舊',JSON.stringify(opts3)==='["no","diff","unsure"]'&&db.dialogue.find(l=>l.choice).choice[0].rel.heroine_05.resp===6,JSON.stringify(opts3)); }
  const W17=termDay('Y1S2',15,3);   /* 檢討會改第 15 週週三 6/3（AA_198 第 5 節；變數名照舊）*/
  check('檢討會：大一下第 15 週週三（6/3）19:00–21:00、萬才館研討室 A（門口參加）',ACTIVITIES.on(RV,W17)&&!ACTIVITIES.on(RV,W17-7)&&RV.room==='seminarA'&&RV.door===true&&RV.t0===19);
  const setup=(o)=>{ o=o||{}; fresh(W17,19.05,'wancai',Object.assign({lawclub:o.lawclub!==false},o.flags||{})); const A=(G.acts=G.acts||{}).att=(G.acts.att||{}); for(let k=0;k<(o.n==null?3:o.n);k++) A['lawclub_study@'+(W17-70+k*7)]={h:19}; };
  const nm=CHARACTERS.heroine_05.name;
  { setup(); check('去了檢討會：會後接著演（CLS.afterActEvent）',CLS.afterActEvent(G,RV)===w5);
    setup({n:2}); check('讀書會只去過 2 次：沒有',CLS.afterActEvent(G,RV)===null);
    setup({lawclub:false}); check('不是法服的：沒有',CLS.afterActEvent(G,RV)===null);
    setup(); picks=['有沒有人給妳便條']; await CLS.attendActivity(GM,RV,{door:true}); const L=lines(), i=L.indexOf('檢討會上，學姊對一年級的書狀列了十二條缺點，大家臉都很僵。');
    const rest=['會後你回萬才館拿忘記的東西，看到她一個人坐著，在每份書狀上貼便條。','（你的書狀上：「第三段的事實整理很好。我剛剛沒說。」）',nm+'：（沒有抬頭）檢討會上講缺點，便條上講優點。',nm+'：缺點要在大家面前講，大家才會改。',nm+'：優點要私下講，才不會被當成客套。',nm+'：……我以前的學姊也是這樣對我。'];
    check('照玩家流程參加檢討會（attendActivity）：社課結束以後接著演；旁白、台詞照原文',i>=0&&JSON.stringify(L.slice(i+1,i+7))===JSON.stringify(rest),JSON.stringify(L.slice(i,i+7)));
    check('三個選項',JSON.stringify(opts[opts.length-1])==='["「學姊，有沒有人給妳便條？」","（撕一張她的便條紙，寫了貼在她的筆記本上）","「謝謝學姊。」（拿了書狀就走）"]',JSON.stringify(opts[opts.length-1]));
    check('「有沒有人給妳便條？」：（她停下筆。）「……社長沒有人改。」（她笑了一下。）「重點是，這樣比較快。」；NOTICED_HER',JSON.stringify(L.slice(i+7))===JSON.stringify(['她停下筆。',nm+'：……社長沒有人改。','她笑了一下。',nm+'：重點是，這樣比較快。'])&&SOCIAL.has('heroine_05','NOTICED_HER'),JSON.stringify(L.slice(i+7)));
    check('只演一次',CLS.afterActEvent(G,RV)===null&&!EVENTS.check(w5b)); }
  { setup(); picks=['撕一張','笑臉']; await EVENTS.run(w5); const L=lines();
    check('寫便條：再選寫什麼（三個）→ 選畫笑臉：（她看了很久。）「……你學得很快。」；GAVE_HER_NOTE（備註寫了什麼）',JSON.stringify(opts[1])==='["「今天的檢討很清楚。我剛剛沒說。」","「學姊辛苦了。」","（畫一個笑臉）"]'&&JSON.stringify(L.slice(-2))===JSON.stringify(['她看了很久。',nm+'：……你學得很快。'])&&SOCIAL.has('heroine_05','GAVE_HER_NOTE')&&G.flags.W5_NOTE==='smile',JSON.stringify(L.slice(-2)));
    setup(); picks=['謝謝學姊']; await EVENTS.run(w5); check('「謝謝學姊。」：「嗯。下學期見。」',lines().slice(-1)[0]===nm+'：嗯。下學期見。'); }
  /* 沒去檢討會 */
  { const at=(h,o)=>{ setup(o); G.hour=h; G.zone='wancai'; return EVENTS.check(w5b); };
    check('沒去檢討會的社員：那天 21:00 以後走進萬才館＝演（20:30、去了檢討會的、讀書會不到 3 次都沒有）',at(21.2)&&!at(20.5)&&!at(21.2,{n:2})&&(()=>{ setup(); G.hour=21.2; G.acts.att['lawclub_review_y1s2@'+W17]={h:19}; return !EVENTS.check(w5b); })());
    { const atD=(day,h)=>{ setup(); G.day=day; G.weekday=CALENDAR.dateOf(day).wd%7; G.hour=h; G.zone='wancai'; return EVENTS.check(w5b); };
      check('BB_161 ③：第 15～16 週第一次在晚上走進萬才館（第 15 週週五 20:00、第 16 週週一 19:00 可以；第 16 週下午、第 14 週、第 17 週沒有）',atD(termDay('Y1S2',15,5),20)&&atD(termDay('Y1S2',16,1),19)&&!atD(termDay('Y1S2',16,1),15)&&!atD(termDay('Y1S2',14,4),20)&&!atD(termDay('Y1S2',17,1),20)); }
    setup(); G.hour=21.2; picks=['謝謝學姊']; await EVENTS.run(w5b); const L=lines();
    check('沒去的版本（BB_161 ③）：開頭兩句「（聽說這週的檢討會很安靜。）」「（你經過萬才館的研討室。學姊一個人坐在裡面，在每份書狀上貼便條。）」，接著「你的書狀上：……」照原文',L[0]==='（聽說這週的檢討會很安靜。）'&&L[1]==='（你經過萬才館的研討室。學姊一個人坐在裡面，在每份書狀上貼便條。）'&&/^（你的書狀上：/.test(L[2])&&!L.includes('會後你回萬才館拿忘記的東西，看到她一個人坐著，在每份書狀上貼便條。'),JSON.stringify(L.slice(0,3)));
    check('記憶的中文說明：GAVE_HER_NOTE、NOTICED_HER',!!SOCIAL.MEMORY_LABEL.GAVE_HER_NOTE&&!!SOCIAL.MEMORY_LABEL.NOTICED_HER); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
