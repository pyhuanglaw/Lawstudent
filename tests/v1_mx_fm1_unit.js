// 明軒 F-M1「公館一百元以內」（BB_70 5-6，BB-B 2026-10-16）：M1 公車站（SAW_HIM_STUDY）那晚 23:00 私訊、清單進筆記本（七家店、價錢、註解逐字）——不需要瀏覽器。
// 修改前沒有這則私訊和筆記（全部失敗）。用法：node tests/v1_mx_fm1_unit.js
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
const notes=[]; GM.addNote=(id,title,body)=>{ if(notes.find(n=>n.id===id)) return false; notes.push({id,title,body}); return true; }; GM.hasNote=id=>!!notes.find(n=>n.id===id);
(async()=>{
  const tue=termDay('Y1S1',7,2);
  fresh(tue,21.5,'gongguan',{}); G.stage='law'; R('classmate_mingxuan',...LV.ACQ); meet('classmate_mingxuan');
  run(21.5,23.9); check('0. 還沒有 M1：沒有私訊',!txt('p:classmate_mingxuan').length);
  picks=['我什麼都沒看到']; await EVENTS.run(ev('ev_mingxuan_notes')); check('1. M1 記 SAW_HIM_STUDY、MX_M1_DAY',SOCIAL.has('classmate_mingxuan','SAW_HIM_STUDY')&&G.flags.MX_M1_DAY===tue);
  G.hour=21.8; run(21.8,22.95); check('1. 23:00 以前還沒傳',!txt('p:classmate_mingxuan').some(t=>/外流/.test(t))&&!notes.length);
  run(23,23.2); const T=txt('p:classmate_mingxuan');
  check('2. 23:00 私訊「給你 公館一百塊以內的」「不要外流 哈哈」（AA_207 附錄 §2：原本「給你。不要外流。外流的話阿哲會把第一名吃到漲價。」）＋筆記',T.some(t=>t.endsWith('給你 公館一百塊以內的'))&&T.some(t=>t.endsWith('不要外流 哈哈'))&&T.some(t=>t.endsWith('📝 公館一百元以內（明軒版）。按 CP 值排。不接受申訴。')),JSON.stringify(T));
  const N=notes.find(n=>n.id==='mx_fm1');
  check('3. 筆記本：「公館一百元以內（明軒版）」',!!N&&N.title==='公館一百元以內（明軒版）');
  const want=['按 CP 值排。不接受申訴。','1. 林家乾麵（溫州街）｜小碗乾麵＋貢丸湯　70','　飽足感除以價錢，第一名。沒有之一。','2. 阿鳳麵店｜乾麵＋餛飩湯　85','　豆干另外算。阿姨有時候多給一塊，這個不能算進排名。','3. 日日定食｜今日定食（只有午餐）　95','　剛好卡在一百以內。晚餐一百二，不算。','4. 滷味・鹹酥雞｜自己夾　80 以內','　技巧：豆干多夾，肉少夾。','5. 早午餐｜蛋餅＋奶茶　65','　十點半以前。過了十點半，一樣的東西貴二十。','6. 豆花・甜湯（溫州街）｜豆花　40','　這是甜點，不是正餐。可是讀到十一點，它就是正餐。','7. 日日便利｜飯糰＋豆漿　55','　最後一名。可是它二十四小時開。最後一名是留給半夜的。','價錢是十月的。漲價我會改。……大概。'];
  /* 2026-10-28 再改：AA_497 第 8 節後補（企劃線 b70bed855）量詞「一顆」改「一塊」。
     2026-10-28 改：AA_497 第 8 節第 4 點（企劃線 60fc3b9a3）明軒的滷蛋只留 M1、M2、德文三處——公館一百元清單是明軒說的，第 2 家的「滷蛋另外算。」改「豆干另外算。」，其餘照 BB_70 5-6 逐字（tests/aa497_supporting_unit.js 第 8 節）*/
  check('3. 七家店、價錢、註解逐字（BB_70 5-6；第 2 家「豆干另外算。」照 AA_497 第 8 節第 4 點）',!!N&&JSON.stringify(N.body.split('<br>'))===JSON.stringify(want),N&&JSON.stringify(N.body.split('<br>')));
  const n0=(G.msgs||[]).length; run(23.2,23.9); G.day++; run(0,23.9); check('4. 只傳一次、筆記不重複（三則：AA_207 附錄 §2 把第一則拆成兩則）',(G.msgs||[]).filter(m=>m.tag==='mx_fm1').length===3&&notes.filter(n=>n.id==='mx_fm1').length===1);
  // 舊存檔：已經有 SAW_HIM_STUDY、沒有 MX_M1_DAY
  fresh(termDay('Y1S1',10,3),15,'campus',{}); G.stage='law'; notes.length=0; SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY','');
  run(15,22.9); check('5. 舊存檔（M1 以前就玩過）：今晚 23:00 以前沒有',!txt('p:classmate_mingxuan').some(t=>/外流/.test(t)));
  run(23,23.2); check('5. 舊存檔：今晚 23:00 收到、進筆記本',txt('p:classmate_mingxuan').some(t=>/外流/.test(t))&&notes.some(n=>n.id==='mx_fm1'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
