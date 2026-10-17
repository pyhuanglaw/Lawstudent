// 芷若 Z7「23:59」最終版＋Z7b 學校這一關（BB_97 3-4、3-4b，BB-B cc244c4a＋2c38f7bf；使用者 18:2x「台詞不能沒有上下文」；截止日 12/10 AA-B b95cea49；任務 V3-B18）——不需要瀏覽器。
// 檢查：12/10 23:59 三則（要 Z4、有聯絡方式、她不知道祐廷有伴侶）；Café 窗口到大二上結束、22:00 以前；兩種開頭；選項、交往中（她知道）的回應；媽媽那句 22:15；寒假第一天那則；Z7b 1/28 21:00 三則或兩則、三個回覆、ZR_NOMINATED；bell 不再問。用法：node tests/v3_z7_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/romance3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const NM={'林芷若':'芷若'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const Z7=ev('ev_zhiruo_applied'), BELL=STORY_EVENTS.find(e=>e.dialogue&&e.dialogue.some(l=>l.choice&&l.choice.some(c=>/交換申請交了嗎/.test(c.text))));
  check('0. Z7 打開、大二上、Café、ROM 有載入',!!Z7&&!Z7.off&&Z7.term.includes('Y2S1')&&Z7.location==='cafe'&&typeof ROM!=='undefined');
  const d=D('2026-12-10'); let bk=null; for(let x=d+1;x<d+80;x++){ if(!CALENDAR.termOf(x)){ bk=x; break; } }
  check('0. 12/10 週四、大二上第 14 週；寒假第一天在第 16 週之後（16 週制：12/28）',wdOf(d)===4&&termDay('Y2S1',14,4)===d&&bk>termDay('Y2S1',16,7)&&CALENDAR.dateOf(bk).key==='2026-12-28',bk);
  const base=(day,hour,zone,o)=>{ o=o||{}; fresh(day,hour,zone,o.flags); meet('heroine_02'); R('heroine_02',...LV.FAM); if(o.z4!==false){ G.events.done.ev_zhiruo_secret=1; SOCIAL.remember('heroine_02','SHARED_SECRET',''); } if(o.contact!==false){ G.contacts=G.contacts||{}; G.contacts.heroine_02=day-30; } if(o.dating){ G.flags['dating_'+o.dating]=true; if(o.knows) ROM.learn(G,'heroine_02',o.dating); } };
  const ZTH='p:heroine_02', N3='heroine_02:交換申請，剛剛按了送出。英國那一間。｜heroine_02:截止是十二點。我在十一點五十九分按的。｜heroine_02:……手還在抖。下次你來店裡，再跟你說。';
  base(d,23.5,'dorm'); run(23.5,23.95);
  check('1. 12/10 23:57 還沒有',!PHONE.sent(G,'zr_z7_msg'));
  run(23.98,23.99); run(23.99,23.995,0.004);
  check('1. 23:59 三則（英國那一間／十一點五十九分／下次你來店裡）',txt(ZTH).join('｜')===N3,JSON.stringify(txt(ZTH)));
  base(d,23.5,'dorm',{dating:'kexin',knows:true}); run(23.5,23.995,0.01);
  check('2. 祐廷有伴侶、她知道：沒有深夜訊息',!PHONE.sent(G,'zr_z7_msg'));
  base(d,23.5,'dorm',{dating:'kexin'}); run(23.5,23.995,0.01);
  check('2. 祐廷有伴侶、她不知道：照樣有',PHONE.sent(G,'zr_z7_msg'));
  base(d,23.5,'dorm',{z4:false}); run(23.5,23.995,0.01);
  check('2. 沒演過 Z4：沒有',!PHONE.sent(G,'zr_z7_msg'));
  base(d,23.5,'dorm',{contact:false}); run(23.5,23.995,0.01);
  check('2. 沒有她的聯絡方式：沒有',!PHONE.sent(G,'zr_z7_msg'));
  base(termDay('Y2S1',16,3),10,'dorm'); run(10,10.1);
  check('2. 舊存檔第 16 週（期末週）才讀：補在 12/10 23:59（不再限七天）',PHONE.sent(G,'zr_z7_msg'));
  const at=(day,hh,o)=>{ base(day,hh,'cafe',o); return EVENTS.check(Z7); };
  const w18=termDay('Y2S1',16,5);   /* 16 週制：學期最後一週＝第 16 週 */
  check('3. 12/10 當天不演；12/11、12/18（第 15 週）、第 16 週週五都演；寒假第一天不演',!at(d,15)&&at(d+1,15)&&at(d+8,15)&&at(w18,15)&&!at(bk,15));
  check('3. 22:00 以後不演；11:00 可以',!at(d+1,22.5)&&at(d+1,11.2));
  check('3. 沒演過 Z4 不演；在溫州街不演',!at(d+1,15,{z4:false})&&(()=>{ base(d+1,15,'wenzhou'); return !EVENTS.check(Z7); })());
  const play=async(pick,o,withMsg)=>{ base(d+1,15,'cafe',o); if(withMsg){ PHONE.at(G,d,23.98,[{th:ZTH,from:'heroine_02',text:'x'}],'zr_z7_msg'); PHONE.tick(G); } said=[]; opts=[]; picks=[pick]; await EVENTS.run(Z7); return {L:L0(),O:opts[0]||[]}; };
  let r=await play(0,{},true);
  check('4. 收到深夜訊息：「那天晚上那則，你看到了吧。」「十一點五十九分。我差一分鐘，就不交了。」',r.L.slice(0,2).join('｜')==='芷若：（看到你，放下手上的杯子）那天晚上那則，你看到了吧。｜芷若：十一點五十九分。我差一分鐘，就不交了。',JSON.stringify(r.L.slice(0,2)));
  check('4. 接著「交完手在抖，抖到十二點半。」「如果沒錄取，就永遠不用跟我媽說。……很膽小吧。」',r.L[2]==='芷若：交完手在抖，抖到十二點半。'&&r.L[3]==='芷若：如果沒錄取，就永遠不用跟我媽說。……很膽小吧。');
  check('4. 兩個選項；「不會。」→「……你這樣講，我會當真。」；結尾「今天的咖啡我請。」',JSON.stringify(r.O)==='["「不會。」","「妳跟妳媽說了嗎？」"]'&&r.L.includes('芷若：……你這樣講，我會當真。')&&r.L.slice(-1)[0]==='芷若：今天的咖啡我請。');
  r=await play(0,{dating:'kexin',knows:true},false);
  check('5. 沒收到（祐廷有伴侶、她知道）：「交換申請，我交了。截止那天晚上，英國那一間。」；「不會。」→「……好。那我先不要怕。」',r.L[0]==='芷若：（看到你，放下手上的杯子）交換申請，我交了。截止那天晚上，英國那一間。'&&r.L[1]==='芷若：十一點五十九分。我差一分鐘，就不交了。'&&r.L.includes('芷若：……好。那我先不要怕。')&&!r.L.includes('芷若：……你這樣講，我會當真。'),JSON.stringify(r.L));
  r=await play(1,{},true); const day1=G.day;
  check('6. 「妳跟妳媽說了嗎？」→「還沒。今天十點，她會打來。」',r.L.includes('芷若：還沒。今天十點，她會打來。')&&G.flags.ZR_Z7_MOM===true&&G.flags.zrAppliedDay===day1);
  run(15.2,22.2); check('6. 22:14 還沒有',!PHONE.sent(G,'zr_z7_mom'));
  run(22.25,22.4); check('6. 當晚 22:15「我說了。她說『那妳要穿暖一點』。」',txt(ZTH).slice(-1)[0]==='heroine_02:我說了。她說『那妳要穿暖一點』。');
  r=await play(2,{flags:{Z4_PICK:'family'}},true);
  check('7. Z4 選家裡：第三個選項和兩句',r.O.length===3&&r.O[2]==='「妳那時候說的家裡……」'&&r.L.includes('芷若：後來我發現，我就是家裡的一部分。我去，家也跟著我去。'));
  // 寒假第一天
  base(d,23.9,'dorm'); run(23.9,23.995,0.01); G.day=bk; G.weekday=wdOf(bk); run(20.5,20.95);
  check('8. 都沒去 Café：寒假第一天 20:57 還沒有',!PHONE.sent(G,'zr_z7_break'));
  run(21,21.2);
  check('8. 寒假第一天 21:00「交換的事，還沒跟你說完。……一月底學校會公布。」',txt(ZTH).slice(-1)[0]==='heroine_02:交換的事，還沒跟你說完。……一月底學校會公布。');
  base(bk,20.9,'dorm'); G.events.done.ev_zhiruo_applied=1; PHONE.at(G,d,23.98,[{th:ZTH,from:'heroine_02',text:'x'}],'zr_z7_msg'); run(20.9,21.3);
  check('8. 有去過 Café：寒假沒有那則',!PHONE.sent(G,'zr_z7_break'));
  // Z7b
  const nb=D('2027-01-28');
  const z7b=(o)=>{ o=o||{}; base(nb,20.5,'home',o); if(o.went) G.events.done.ev_zhiruo_applied=1; if(o.brk) PHONE.at(G,bk,21,[{th:ZTH,from:'heroine_02',text:'y'}],'zr_z7_break'); run(20.5,20.95); const a=PHONE.sent(G,'zr_z7b'); run(21,21.2); return a; };
  let early=z7b({went:true});
  check('9. Z7b：1/28 20:57 還沒有；21:00 三則、ZR_NOMINATED',!early&&TH(ZTH).slice(-3).map(m=>m.text).join('｜')==='學校那一關過了。｜還要等英國那邊。他們說五月。｜……所以先不哭。五月再說。'&&G.flags.ZR_NOMINATED===true,JSON.stringify(txt(ZTH)));
  let m=TH(ZTH).find(x=>x.ask&&x.ask.id==='zr_z7b');
  check('9. 沒問過媽媽：兩個回覆（一起等／貼圖）',m.ask.opts.length===2&&m.ask.opts[0].t==='恭喜。五月我陪妳一起等。'&&m.ask.opts[1].t==='（貼圖：一隻舉著咖啡杯的貓）');
  PHONE.answer(G,'zr_z7b',0);
  check('9. 「恭喜。五月我陪妳一起等。」→「你又不能幫我等。……好。謝謝。」',txt(ZTH).slice(-1)[0]==='heroine_02:你又不能幫我等。……好。謝謝。');
  z7b({went:true,flags:{ZR_Z7_MOM:true}}); m=TH(ZTH).find(x=>x.ask&&x.ask.id==='zr_z7b');
  check('9. 問過媽媽：三個回覆，第二個「妳媽有說『穿暖一點』嗎？」→「有。她說了兩次。」',m.ask.opts.length===3&&m.ask.opts[1].t==='妳媽有說『穿暖一點』嗎？'&&(PHONE.answer(G,'zr_z7b',1),txt(ZTH).slice(-1)[0]==='heroine_02:有。她說了兩次。'));
  z7b({went:true}); PHONE.answer(G,'zr_z7b',1);
  check('9. 貼圖 →「……這隻貓的杯子拿反了。」',txt(ZTH).slice(-1)[0]==='heroine_02:……這隻貓的杯子拿反了。');
  z7b({went:true,dating:'kexin',knows:true}); m=TH(ZTH).find(x=>x.ask&&x.ask.id==='zr_z7b');
  check('9. 祐廷有伴侶、她知道：只有前兩句；「恭喜。五月見分曉。」→「嗯。五月。」',TH(ZTH).length===2&&m.text==='還要等英國那邊。他們說五月。'&&m.ask.opts[0].t==='恭喜。五月見分曉。'&&(PHONE.answer(G,'zr_z7b',0),txt(ZTH).slice(-1)[0]==='heroine_02:嗯。五月。'));
  z7b({brk:true});
  check('9. 沒演 Z7、收到寒假那則：也有 Z7b',PHONE.sent(G,'zr_z7b'));
  z7b({});
  check('9. Z7 沒演、也沒收到寒假那則：沒有',!PHONE.sent(G,'zr_z7b')&&!G.flags.ZR_NOMINATED);
  const bellOpt=BELL&&BELL.dialogue.find(l=>l.choice).choice.find(c=>/交換申請交了嗎/.test(c.text));
  check('10. ev_zhiruo_bell 的「妳的交換申請交了嗎？」Z7 之後不出現',!!bellOpt&&bellOpt.unless&&JSON.stringify(bellOpt.unless.events)==='["ev_zhiruo_applied"]');
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
