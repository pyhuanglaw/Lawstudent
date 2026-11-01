// SK01 對面的舊系館、SK02 系外套（BB_106 定稿 d5224961；AA_154 A52 ①②）、P4d 已經聯絡過的開頭（BB_96 10-1 2c67d4d7）——不需要瀏覽器。
// 修改前沒有 ev_sk01_soc／ev_sk02_jacket、P4d 一律重新介紹（全部失敗）。用法：node tests/v1_sk01_unit.js
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
  const ids=['ev_sk01_soc','ev_sk01_wave','ev_sk02_jacket','ev_sk02_spy']; check('0. 四個事件在',ids.every(i=>ev(i))); if(!ids.every(i=>ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  const D2=2, at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=0; };
  const tick=()=>{ said=[]; return EVENTS.tick(0.1); };
  const wait=async()=>{ for(let i=0;i<50&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); };
  // 1. 條件
  fresh(D2,15.4,'campus',{classDone:true,metAn:true}); G.stage='law'; at(33,-97);
  check('1. 第 2 天：第二天的劇情還沒結束（afternoonDone 沒有）＝不觸發',!STORY.sk01Ready(G)&&!tick());
  G.flags.afternoonDone=true; G.flags.companion='an'; check('1. 和小安走在一起＝不觸發',!STORY.sk01Ready(G));
  G.flags.companion=null; G.hour=17.8; check('1. 劇情結束、17:48 在霖澤館前、社科圖開著＝可以',STORY.sk01Ready(G));
  G.hour=21.5; check('1. 21:30（社科圖 22:00 關，坐不滿一小時）＝不觸發',!STORY.sk01Ready(G));
  { let d=3, n=null; for(;d<20;d++){ G.day=d; G.weekday=wdOf(d); G.hour=7; n=CLS.next(G); if(n) break; }
    G.hour=n.t0-1; const a=STORY.sk01Ready(G); G.hour=Math.max(8.5,n.t0-2); const b=STORY.sk01Ready(G)||n.t0-2<8.5;
    check('1. 一小時後有課（'+n.c.id+' '+n.t0+'）＝不觸發；兩小時前可以',!a&&b,'day '+d); }
  // 2. 去社科圖（沒玩經濟系那一年）
  fresh(D2,17.8,'campus',{classDone:true,metAn:true,afternoonDone:true}); G.stage='law'; at(60,-60);
  check('2. 不在霖澤館前＝不觸發',!tick());
  at(33,-97); picks=['去社科圖']; tick(); await wait();
  let L=lines(); const h0=17.8;
  check('2. 私訊：先「是我，阿勳。你經濟系那年的室友。」再兩則',L[0]&&L[0].endsWith('是我，阿勳。你經濟系那年的室友。')&&L[1].endsWith('你在對面喔？我在二樓看到你了。')&&L[2].endsWith('下課來圖書館。我幫你佔位。你以前那一罐，我也買了。'),JSON.stringify(L.slice(0,3)));
  check('2. 兩個按鈕「（去社科圖）」「（先回宿舍）」',JSON.stringify(opts[0])===JSON.stringify(['（去社科圖）','（先回宿舍）']),JSON.stringify(opts));
  const want=['社科圖二樓，靠窗那一排。阿勳旁邊的位子上，壓著一本統計課本。','桌上有一罐飲料。是你以前常喝的那一種。','阿勳：坐。課本是佔位用的，我沒在讀。','祐廷：……你還記得。','阿勳：兩個月。看也看會了。','阿勳：讀不下去就過來。這裡的位子，我很會佔。'];
  check('2. 社科圖六句（逐字；沒玩經濟系＝沒有保齡球）',JSON.stringify(L.slice(3))===JSON.stringify(want),JSON.stringify(L.slice(3)));
  check('2. 坐一小時；MET_XUN、SK01_CHOICE go、SK01_DAY',Math.abs(G.hour-h0-1)<1e-6&&G.flags.MET_XUN&&G.flags.SK01_CHOICE==='go'&&G.flags.SK01_DAY===D2,G.hour);
  check('2. 私訊進了阿勳的對話',txt('p:econ_zhengxun').length===3);
  check('2. 只有一次',!tick());
  // 玩過經濟系
  fresh(D2,17.8,'campus',{classDone:true,metAn:true,afternoonDone:true,PLAYED_Y0:true,MET_XUN:true}); G.stage='law'; at(33,-97); picks=['去社科圖']; tick(); await wait(); L=lines();
  check('3. 玩過經濟系：沒有重新介紹；「兩個月。看也看會了。」（AA_372 第 9 項，原本「一年。」）後面多保齡球那句',L[0].endsWith('你在對面喔？我在二樓看到你了。')&&L[L.indexOf('阿勳：兩個月。看也看會了。')+1]==='阿勳：保齡球館，我還是每個週末去。……你來的話，就是兩個人。',JSON.stringify(L));
  // 4. 先回宿舍 → 第 4 天以後經過法學院廣場揮手
  fresh(D2,17.8,'campus',{classDone:true,metAn:true,afternoonDone:true}); G.stage='law'; at(33,-97); picks=['先回宿舍']; tick(); await wait(); L=lines();
  check('4. 先回宿舍：阿勳回一個貼圖、時間不動、MET_XUN 照記',L[L.length-1].endsWith('（貼圖）')&&Math.abs(G.hour-17.8)<1e-6&&G.flags.MET_XUN&&G.flags.SK01_CHOICE==='home',JSON.stringify(L));
  G.hour=18.5; at(61,-94); check('4. SK01 那一天經過廣場＝還沒有（AA_195 4-7 C：SK01 的隔天以後；原本寫死第 4 天以後）',!tick());
  G.day=4; G.weekday=wdOf(4); G.hour=10; at(80,-90); tick(); await wait(); L=lines();
  check('4. 第 4 天經過法學院廣場：揮手那句',L[0]==='社科院二樓的窗口，有人在對你揮手。是阿勳。……他揮完就轉身進去了。',JSON.stringify(L));
  check('4. 只有一次',!tick());
  // 5. SK02 私訊與系辦
  fresh(D2,17.8,'campus',{classDone:true,metAn:true,afternoonDone:true}); G.stage='law'; at(33,-97); picks=['去社科圖']; tick(); await wait();
  run(G.hour,23.9); const mon4=termDay('Y1S1',4,1);
  check('5. SK01 之後：私訊排在第 4 週週一（'+mon4+'）15:00',G.flags.SK02_DM_DAY===mon4,G.flags.SK02_DM_DAY);
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); run(0,1); check('5. 存讀檔後不重排',G.flags.SK02_DM_DAY===mon4&&(G.msgs||[]).filter(m=>/系外套到了/.test(m.text)).length<=1);
  G.day=mon4; G.weekday=wdOf(mon4); run(0,14.9); check('5. 週一 15:00 以前：還沒收到、系辦還不開',!txt('p:econ_zhengxun').some(t=>/系外套/.test(t))&&!STORY.sk02Open(G));
  run(15,15.1); check('5. 15:00 收到「系辦說你去年開學訂的系外套到了。你休學以後才到的。」',txt('p:econ_zhengxun').some(t=>t.endsWith('系辦說你去年開學訂的系外套到了。你休學以後才到的。')));
  check('5. 阿勳在聯絡人裡',G.contacts&&G.contacts.econ_zhengxun!=null);
  G.zone='campus'; G.hour=15.5; at(33,-97); check('5. 不在社科院門口＝不觸發',!tick());
  const s1=JSON.stringify(G);
  at(15.4,-85); picks=['穿去法律系館A']; tick(); await wait(); L=lines();
  const w2=['你還記得哪一台電梯比較快。只是公告欄上，已經沒有一張是寫給你的。','系辦助理：學號給我。……這個學號，不在我們系的名單上了耶。','祐廷：我重考了。現在念法律系。','系辦助理：……喔，重考的那個。外套在這裡，等你快一年了。'];
  check('5. 社科院大樓正門（東面，X75 搬到霖澤館西南）→ 系辦四句（逐字；阿勳不在旁邊＝沒有他那句）',JSON.stringify(L)===JSON.stringify(w2),JSON.stringify(L));
  check('5. 三個按鈕',JSON.stringify(opts[opts.length-1])===JSON.stringify(['（穿去法律系館A上課）','（送給阿勳）','（收進衣櫃）']),JSON.stringify(opts));
  check('5. ①穿去上課：ECON_JACKET wear、SOC_WRONG_BUILDING、SK02_DAY、15 分鐘',G.flags.ECON_JACKET==='wear'&&G.flags.SOC_WRONG_BUILDING&&G.flags.SK02_DAY===mon4&&Math.abs(G.hour-15.75)<1e-6);
  const room=it=>({c:{id:'civ_general'},room:{zone:'classroom'}});
  said=[]; await CLS.beforeClassEvent(GM,room()); check('5. 同一天霖澤館的課：阿哲還沒說',!said.length);
  G.day=mon4+1; G.weekday=wdOf(G.day); said=[]; await CLS.beforeClassEvent(GM,{c:{id:'english_y1'},room:{zone:'gongtong'}}); check('5. 隔天共同的課：沒有',!said.some(s=>/臥底/.test(s.t)));
  said=[]; await CLS.beforeClassEvent(GM,room()); check('5. 隔天霖澤館的課：阿哲「你是經濟系派來的臥底嗎？」',lines()[0]==='阿哲：你是經濟系派來的臥底嗎？',JSON.stringify(lines()));
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); G.day=mon4; G.hour=15.5; G.flags.ECON_JACKET=null; delete G.flags.ECON_JACKET; at(15.4,-85); picks=['穿去法律系館A']; tick(); await wait();
  G.day=mon4+8; G.weekday=wdOf(G.day); said=[]; await CLS.beforeClassEvent(GM,room()); check('5. 第 8 天才去霖澤館上課＝阿哲不說了',!said.some(s=>/臥底/.test(s.t)));
  // ②送給阿勳（他不在旁邊）
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); at(15.4,-85); picks=['送給阿勳']; tick(); await wait(); L=lines();
  check('6. ②送給阿勳、他不在：旁白「你請系辦助理轉交給阿勳。」',L[L.length-1]==='你請系辦助理轉交給阿勳。'&&G.flags.ECON_JACKET==='xun'&&G.flags.SOC_WRONG_BUILDING,JSON.stringify(L));
  run(G.hour,20.9); check('6. 21:00 以前沒有私訊',!txt('p:econ_zhengxun').some(t=>/兩件/.test(t)));
  run(21,21.2); const T=txt('p:econ_zhengxun'); check('6. 21:00「系辦說你把外套給我了。」「我現在有兩件，輪流穿。」',T.some(t=>t.endsWith('系辦說你把外套給我了。'))&&T.some(t=>t.endsWith('我現在有兩件，輪流穿。')),JSON.stringify(T.slice(-2)));
  // ②阿勳在旁邊
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); at(15.4,-85); const xn={obj:{position:{x:15.8,z:-83,y:0}},lv:0}; global.GAME=GM; GM.npc.econ_zhengxun=xn; E.npcs=[xn]; picks=['送給阿勳']; tick(); await wait(); L=lines();
  check('7. 阿勳在旁邊：「……法律系的書，真的比較重。」、當面「我現在有兩件，輪流穿。」、沒有轉交旁白和私訊',L.includes('阿勳：……法律系的書，真的比較重。')&&L[L.length-1]==='阿勳：我現在有兩件，輪流穿。'&&!G.flags.SK02_GIFT_DM,JSON.stringify(L));
  GM.npc={}; E.npcs=[];
  // ③收進衣櫃
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); at(15.4,-85); picks=['收進衣櫃']; tick(); await wait(); check('8. ③收進衣櫃',G.flags.ECON_JACKET==='closet'&&G.flags.SOC_WRONG_BUILDING);
  // 時間
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); at(15.4,-85); G.hour=17.2; check('9. 17:00 以後系辦關了＝不觸發',!tick());
  G.hour=14; G.day=mon4+5; G.weekday=wdOf(G.day); check('9. 週六＝不觸發',!tick());
  // 10. SK01 比較晚（第 5 週週三）→ 隔天以後第一個平日
  fresh(termDay('Y1S1',5,3),17.8,'campus',{classDone:true,metAn:true,afternoonDone:true}); G.stage='law'; at(33,-97); picks=['先回宿舍']; tick(); await wait(); run(G.hour,18);
  check('10. SK01 在第 5 週週三：私訊排在週四',G.flags.SK02_DM_DAY===termDay('Y1S1',5,4),G.flags.SK02_DM_DAY);
  fresh(termDay('Y1S1',6,5),17.8,'campus',{}); G.stage='law'; G.flags.SK01_DAY=termDay('Y1S1',7,5); run(17.8,18); check('10. 第 7 週週五以後才有 SK01＝不發私訊',G.flags.SK02_DM_DAY==null);
  fresh(mon4,14,'campus',{}); G.stage='law'; run(14,16); check('10. 沒有 SK01＝沒有系外套',G.flags.SK02_DM_DAY==null);
  // 11. 第 8 週：阿勳的紙條
  fresh(termDay('Y1S1',7,5),18,'dorm_hall',{SK01_DAY:2,SK02_DM_DAY:mon4,MET_XUN:true}); G.stage='law';
  check('11. 第 7 週：還沒有',!STORY.sk02W8Due(G));
  G.day=termDay('Y1S1',8,1); G.weekday=1; G.zone='dorm'; check('11. 第 8 週、在房間＝還沒有',!STORY.sk02W8Due(G));
  G.zone='dorm_hall'; check('11. 第 8 週回到男生宿舍門廳＝有',STORY.sk02W8Due(G));
  said=[]; await STORY.sk02W8(GM); L=lines(); check('11. 紙條「你的過去，我幫你領了。」；外套收進衣櫃、沒有「走錯棟」',L[L.length-1]==='阿勳的紙條：你的過去，我幫你領了。'&&G.flags.ECON_JACKET==='closet'&&!G.flags.SOC_WRONG_BUILDING&&!STORY.sk02W8Due(G),JSON.stringify(L));
  check('11. 先櫃台的旁白（BB-B 66cf3ed4）',L[0]==='宿舍櫃台叫住你：『有你的東西。一個經濟系的學生放的。』'&&L.length===2,JSON.stringify(L));
  const jk=()=>STORY.roomItemList(G).filter(r=>r[0]==='經濟系的系外套').map(r=>[].concat(r[1]));
  check('13. 房間：第 8 週阿勳代領＝「口袋裡還夾著阿勳那張紙條。」',JSON.stringify(jk())===JSON.stringify([['經濟系的系外套。口袋裡還夾著阿勳那張紙條。']]),JSON.stringify(jk()));
  G.flags.SK02_W8=null; G.flags.ECON_JACKET='closet'; check('13. 房間：③收進衣櫃',JSON.stringify(jk())===JSON.stringify([['經濟系的系外套。摺好的，還沒穿過。','領的時候，系辦助理說它等你快一年了。']]),JSON.stringify(jk()));
  G.flags.ECON_JACKET='wear'; G.flags.ROOM_Y2=null; check('13. 房間：①穿去上課（大一，AA-B 10-30 07:19）',JSON.stringify(jk())===JSON.stringify([['經濟系的系外套。天冷的時候，你還是會穿去上課。']]),JSON.stringify(jk()));
  G.flags.ROOM_Y2=1; check('13. 房間：①穿去上課（大二起）',JSON.stringify(jk())===JSON.stringify([['經濟系的系外套。大一冷的時候常穿，現在一直掛在椅背上。']]),JSON.stringify(jk())); G.flags.ROOM_Y2=null;
  G.flags.ECON_JACKET='xun'; check('13. 房間：②送給阿勳＝沒有',!jk().length);
  delete G.flags.ECON_JACKET; check('13. 房間：沒有系外套的劇情＝沒有',!jk().length);
  // 12. P4d 第二句
  const p4d=async f=>{ fresh(termDay('Y1S2',2,5),12.1,'putong',f); G.stage='law'; picks=['重修']; await EVENTS.run(ev('ev_econ_hallway')); return lines(); };
  L=await p4d({MET_XUN:true,SOC_WRONG_BUILDING:true}); check('12. P4d：聯絡過＋領過系外套＝「法律系不是在對面嗎。……又走錯棟了？」',L[0]==='阿勳：……你怎麼又在這裡？'&&L[1]==='阿勳：法律系不是在對面嗎。……又走錯棟了？'&&!L.some(t=>/盧正勳/.test(t)),JSON.stringify(L.slice(0,3)));
  L=await p4d({MET_XUN:true}); check('12. P4d：聯絡過＝「法律系不是在對面嗎。你跑來這裡做什麼？」',L[1]==='阿勳：法律系不是在對面嗎。你跑來這裡做什麼？'&&!L.some(t=>/走錯棟|盧正勳/.test(t)),JSON.stringify(L.slice(0,3)));
  L=await p4d({}); check('12. P4d：沒聯絡過（舊存檔）＝原本的重新介紹',L[1]==='阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'&&!L.some(t=>/對面/.test(t)),JSON.stringify(L.slice(0,3)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
