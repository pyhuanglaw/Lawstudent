// 交接包 v2（BB_96 2-3、2-6）：學姊 W3 調到大一下第 5 週以後＋W3_STANCE；W5「她改的便條」已刪除（使用者 2026-10-17，AA_218 17-1）——不需要瀏覽器。
// 檢查：W3 的觸發時間；三個選項記 W3_STANCE；檢討會活動（第 17 週週三研討室 A）；去了檢討會＝會後接著演；沒去＝那晚 21:00 以後走進萬才館、第一句旁白不同；
//   W5：retired、檢討會後與晚上走進萬才館都不演、舊存檔的記憶說明照留
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
  check('檢討會停用（法服沒有社課，AA_218 17-4、BB_191 §7）：大一下第 15 週週三不辦；定義留著（舊存檔出席紀錄照讀）',!!RV&&!ACTIVITIES.on(RV,W17)&&RV.room==='seminarA'&&RV.t0===19);
  const setup=(o)=>{ o=o||{}; fresh(W17,19.05,'wancai',Object.assign({lawclub:o.lawclub!==false},o.flags||{})); const A=(G.acts=G.acts||{}).att=(G.acts.att||{}); for(let k=0;k<(o.n==null?3:o.n);k++) A['lawclub_study@'+(W17-70+k*7)]={h:19}; };
  const nm=CHARACTERS.heroine_05.name;
  /* W5「她改的便條」刪除（使用者 2026-10-17，AA_218 17-1）：標 retired、檢討會後不演、晚上走進萬才館也不演；舊存檔看過的旗標、記憶的說明照留 */
  check('W5 刪除：兩個版本都標 retired（理由寫使用者的裁定）',/AA_218 17-1/.test(String(w5.retired))&&/AA_218 17-1/.test(String(w5b.retired)));
  { setup(); check('去了檢討會（讀書會 3 次以上、法服）：會後不演',CLS.afterActEvent(G,RV)===null);
    setup(); picks=['有沒有人給妳便條']; await CLS.attendActivity(GM,RV,{door:true}); const L=lines();
    check('照玩家流程參加檢討會：社課照常，沒有便條那段、沒有三個選項、不記 NOTICED_HER',!L.some(t=>/貼便條/.test(t))&&!opts.some(o=>o.some(x=>/便條/.test(x)))&&!SOCIAL.has('heroine_05','NOTICED_HER'),JSON.stringify(L.slice(-3)));
    setup(); G.hour=21.2; G.zone='wancai'; check('沒去檢討會的社員：那晚走進萬才館也不演',!EVENTS.check(w5b));
    const atD=(day,h)=>{ setup(); G.day=day; G.weekday=CALENDAR.dateOf(day).wd%7; G.hour=h; G.zone='wancai'; return EVENTS.check(w5b); };
    check('第 15～16 週晚上走進萬才館：都不演',!atD(termDay('Y1S2',15,5),20)&&!atD(termDay('Y1S2',16,1),19)); }
  check('舊存檔看過的：記憶的中文說明照留（GAVE_HER_NOTE、NOTICED_HER）',!!SOCIAL.MEMORY_LABEL.GAVE_HER_NOTE&&!!SOCIAL.MEMORY_LABEL.NOTICED_HER);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
