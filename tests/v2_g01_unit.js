// 可昕大一下的生日 4/24（CANON-NO-ECON-1112 第四批：照 AA_874 兩版——交往中映月湖、還沒交往系館請一杯；原本 AA_140 G01 的外校那一版整場換掉）。
// 修改前：只有舊的那一版（第 4 項以後失敗）。用法：node tests/v2_g01_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const keepOn=(day,h)=>{ G.day=day; G.hour=h; G.weekday=wdOf(day); };
const has=t=>said.some(x=>x.t===t);
(async()=>{
  /* CANON-NO-ECON-1112 第四批：照 AA_874（定稿，BB_417）換成兩版——B 版交往中 20:00 映月湖、A 版還沒交往 4/24 下午系館遇到她請一杯。
     舊期望（AA_140 G01）：18:45 開車去外校、流蘇、「我帶了另一個。」、BCG-45、隔天「我等了一天。」——整場換掉 */
  const e=ev('ev_kexin_birthday_y1s2'); check('1. 事件在、id ev_kexin_birthday_y1s2（B 版）；A 版 ev_kexin_birthday_y1s2_drink',!!e&&!!ev('ev_kexin_birthday_y1s2_drink')); if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const BD=termDay('Y1S2',9,5); let toasts=[]; GM.toast=t=>toasts.push(t);
  check('2. 4/24 是大一下第 9 週週五',CALENDAR.dateOf(BD).key.endsWith('04-24'));
  fresh(BD,5.5,'dorm',{dating_kexin:true}); toasts=[]; run(5.5,6.2); const d=G.msgs.find(m=>m.tag==='kx_bday_draft');
  check('3. 早上行事曆「可昕生日」、草稿「生日快樂。」（照舊）',toasts.includes('行事曆：可昕生日')&&!!d&&JSON.stringify(d.ask.opts.map(o=>o.t))==='["生日快樂。"]',JSON.stringify(toasts));
  check('3. 12:00 以前還沒約',!G.msgs.some(m=>m.tag==='kx_bday_y1s2_ask'));
  run(11.9,12.2); { const q=OUT.get(G,'kx_bday_y1s2'); check('4. 白天她私訊「晚上八點，映月湖。不要吃太飽。」→ 20:00 映月湖、走路',txt('p:kexin').includes('kexin:晚上八點，映月湖。不要吃太飽。')&&!!q&&q.h===20&&q.place==='映月湖'&&q.ev==='ev_kexin_birthday_y1s2'&&q.travelH<0.5); }
  fresh(BD,6,'dorm',{dating_kexin:true}); run(6,23.95); keepOn(BD+1,7); run(7,8.2);
  check('5. 沒赴約：KX_BDAY {1:"none"}、不再傳「我等了一天。」、記 KX_BDAY_Y1_NOSHOW',G.flags.KX_BDAY[1]==='none'&&!G.msgs.some(m=>m.tag==='kx_bday_none')&&G.flags.KX_BDAY_Y1_NOSHOW===BD);
  { const n=ev('ev_kexin_birthday_y1s2_next'); check('5. 隔天第一次和她說話：「昨天那塊蛋糕我自己吃掉了，最大那塊。我有一點不高興。講完了。」',!!n&&n.trigger==='interact'&&EVENTS.cond(n.prereq)&&n.dialogue[0].text==='昨天那塊蛋糕我自己吃掉了，最大那塊。我有一點不高興。講完了。'); }
  const go=async(flags,pick)=>{ fresh(BD,12,'dorm',Object.assign({dating_kexin:true},flags||{})); run(12,12.1); const q3=OUT.get(G,'kx_bday_y1s2'); G.hour=19.9; picks=[pick]; said=[]; opts=[]; await OUT.go(GM,q3); return {L:said.map(x=>x.t),O:opts[0]||[]}; };
  let r=await go({},0);
  check('6. 映月湖：照 AA_874 B 版逐字（選蠟燭）',JSON.stringify(r.L)===JSON.stringify(['（晚上的映月湖邊。她提著一個小紙盒。）','室友下午幫我過了。蛋糕我留了一塊，最大的那塊。','我跟她們說要留給一個人。她們叫了很久。','（她把紙盒打開。裡面的蛋糕有一點歪了。）','你有帶蠟燭？……只有一根喔。好，一根就一根。','（火點著了。她的臉被照得很亮。）','我許好了。不能問。','（她把蛋糕切成兩半。只有一支叉子，她吃一口，遞給你。）','以前生日都在高雄，我媽會煮一桌。今年第一次不在家。','有人陪我吃這一塊，就沒有那麼像在外地。','（湖面上有風。她把外套的領子拉高一點。）','明天八點有課。再坐十分鐘。'])&&JSON.stringify(r.O)===JSON.stringify(['（拿出準備好的蠟燭）','「沒有蠟燭怎麼辦？」'])&&G.flags.KX_BDAY_Y1==='night'&&G.flags.KX_BDAY_VISIT===true,JSON.stringify(r.L));
  r=await go({},1); check('7. 「沒有蠟燭怎麼辦？」→ 手機的燈那三拍',r.L.includes('用手機的燈。')&&r.L.includes('（她把手機的手電筒打開，立在蛋糕旁邊。）')&&r.L.includes('好醜。可是可以。我許好了。'));
  check('8. 12/3 那個選項和讀它的條件拿掉（AA_900 第 5 節）',!JSON.stringify(e.dialogue).includes('KX_DEC3')&&!JSON.stringify(e.dialogue).includes('我帶了另一個'));
  keepOn(BD+1,7.5); run(7.5,8.2); check('10. 去了＝KX_BDAY {1:"visit"}、沒有隔天那一句',G.flags.KX_BDAY[1]==='visit'&&G.flags.KX_BDAY_Y1_NOSHOW==null);
  /* A 版 */
  const A=ev('ev_kexin_birthday_y1s2_drink');
  fresh(BD,14,'linze',{KX_MET:true}); R('kexin',25,10,10); check('11. A 版：4/24 下午、系館、熟悉、沒在交往＝條件成立',EVENTS.cond(A.prereq)&&A.location==='linze'&&A.trigger==='enter');
  fresh(BD,14,'linze',{KX_MET:true,dating_kexin:true}); R('kexin',25,10,10); check('11. 交往中：不演 A 版',!EVENTS.cond(A.prereq));
  fresh(BD+1,14,'linze',{KX_MET:true}); R('kexin',25,10,10); check('11. 不是 4/24：沒有',!EVENTS.cond(A.prereq));
  fresh(BD,14,'linze',{KX_MET:true}); R('kexin',25,10,10); G.money=5000; picks=[0]; said=[]; opts=[]; await EVENTS.run(A);
  check('12. A 版沒聽過她講生日：照稿逐字；付 60、記 drink',JSON.stringify(said.map(x=>x.t))===JSON.stringify(['（系館門口。她今天兩邊都戴了耳環。）','今天我生日。你不知道很正常，我沒講過。','現在你知道了。請我喝一杯。','（飲料攤前面。她看菜單看了很久。）','我要最貴的那杯。','……算了。紅茶拿鐵，半糖。','（她接過去，喝了一口。）','今天我收到我媽的訊息、室友的卡片，還有這杯。','在臺北的第一個生日。我本來以為會很無聊。','生日才戴一對。平常一邊就夠了。你有發現，加分。','（她喝到剩一半，把杯子舉起來看了一下。）','這杯我會記得。走了，我還有課。'])&&G.flags.KX_BDAY_Y1==='drink',JSON.stringify(said.map(x=>x.t)));
  fresh(BD,14,'linze',{KX_MET:true}); R('kexin',25,10,10); SOCIAL.remember('kexin','KX2_BDAY_TOLD',''); G.money=10; picks=[1,1]; said=[]; opts=[]; await EVENTS.run(A);
  check('13. A 版聽過 KX2_BDAY_TOLD：「今天幾號？」→「……幾號？」那一句；錢不夠她自己付、記 self；「許願了嗎？」',has('今天幾號？')&&JSON.stringify(opts[0])===JSON.stringify(['「二十四。生日快樂。」','「……幾號？」'])&&has('二十四。我講過，記不記得住是你的事。現在是你的事了。走，去買。')&&has('你沒錢喔？……好，這杯我請我自己。')&&G.flags.KX_BDAY_Y1==='self'&&G.money===10&&has('還沒。晚上室友說要幫我點蠟燭，到時候再許。現在先喝。')&&!has('今天我生日。你不知道很正常，我沒講過。'),JSON.stringify(said.map(x=>x.t)));
  { const L=ev('ev_kexin_birthday_y1s2_late'); fresh(BD+1,10,'linze',{KX_MET:true}); R('kexin',25,10,10); check('14. A 版沒遇到她：隔天第一次說話只有「昨天我生日。沒事，只是講一下。」',!!L&&EVENTS.cond(L.prereq)&&L.dialogue.length===1&&L.dialogue[0].text==='昨天我生日。沒事，只是講一下。'); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
