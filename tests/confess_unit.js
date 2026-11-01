// 告白的共同流程（ROM-1017-L／SYS-02；AA_215 第 1 節、AA_128 3-1～3-3、AA_126 4-2）——不需要瀏覽器。用測試用的假台詞（不是遊戲內容）：沒有台詞不出現、四次以前不出現、「告訴她／今天先不說」、答應＝ROM.start、還沒＝不鎖線＋兩週＋再一次正式約會、學姊筆試前婉拒、快速約會不問。用法：node tests/confess_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM|CONFESS_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, atConfess=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); if(atConfess&&o.some(q=>(q.t||q.text)==='（告訴她）')) SOCIAL.rel(atConfess.id).npcRom=atConfess.v;   /* 告白那一刻她的戀愛（約會本身會加一點）*/ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ picks.unshift(want); return 0; } return k; } return want||0; }};   /* 這個測試：找不到的選項留給下一個選單（中間多出來的回覆選擇點第一個）*/
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  check('0. 正式資料表 CONFESS_LINES：以安、語彤（AA_187 第 9 節）＋學姊、芷若、子晴、沛珊（AA_223 @32424049）＋芯慈（AA_537 第 4 節，2026-10-30 XINCI-ROMANCE-1030）',JSON.stringify(Object.keys(CONFESS_LINES).sort())==='["classmate_peishan","classmate_xinci","heroine_01","heroine_02","heroine_03","heroine_04","heroine_05"]',JSON.stringify(Object.keys(CONFESS_LINES)));
  const REAL=Object.assign({},CONFESS_LINES);
  const day=termDay('Y1S2',5,6); OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
  const ready=(id,o)=>{ o=o||{}; SOCIAL.meet(id,'campus'); const r=SOCIAL.rel(id); Object.assign(r,{fam:70,trust:55,comf:50,npcRom:o.npcRom==null?75:o.npcRom,rom:35});   /* npcRom 75：在每個人的答應線（BB_191 10-2，最高 72）以上 */ const L=DATE.log(G,id); L.count=o.count==null?3:o.count; L.wish=true; G.contacts=G.contacts||{}; G.contacts[id]=1; };
  const go=async(who,picks0)=>{ const b=DATE.book(G,{who,locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; opts=[]; picks=['出發'].concat(picks0); await OUT.prompt(GM,q); return {t:DATE.trip(G,b.trip),L:lines(),O:opts}; };
  // 1 條件到齊、但沒有台詞：不出現選項（拿掉子晴的台詞來測）
  delete CONFESS_LINES.heroine_04; fresh(day,9,'dorm',{}); ready('heroine_04'); let r=await go('heroine_04',['河邊欄杆','差不多了']); CONFESS_LINES.heroine_04=REAL.heroine_04;
  check('1. 沒有台詞的人：第四次約會、條件到齊（canConfess ok）也不出現「（告訴她）」',DATE.canConfess(G,'heroine_04').ok&&!r.O.some(o=>o.includes('（告訴她）'))&&!G.flags.dating_heroine_04,JSON.stringify(r.O));
  // 測試用的台詞（不是遊戲內容）
  CONFESS_LINES.heroine_03={src:'測試',say:[{who:'player',text:'P'}],yes:['Y1'],notYet:['N1'],notYetFlag:'T_NOT_YET',decide:G=>G.flags.T_SAY_NOT?'notYet':'yes'};
  CONFESS_LINES.heroine_05={src:'測試',say:[{who:'player',text:'P5'}],yes:['Y5'],notYet:['N5'],preexam:['PRE'],preexamFlag:'T_PRE'};
  fresh(day,9,'dorm',{}); ready('heroine_03',{count:2}); r=await go('heroine_03',['河邊欄杆','差不多了','差不多了']);
  check('2. 第三次約會（結算後 3 次）：還不到四次，不出現',!r.O.some(o=>o.includes('（告訴她）')));
  fresh(day,9,'dorm',{}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','今天先不說']);
  check('3. 第四次約會結尾：出現「（告訴她）／（今天先不說）」；不說＝什麼都不變',r.O.some(o=>o[0]==='（告訴她）'&&o[1]==='（今天先不說）')&&!G.flags.dating_heroine_03&&!DATE.log(G,'heroine_03').notYet,JSON.stringify(r.O.slice(-2)));
  fresh(day,9,'dorm',{}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  const iS=r.L.indexOf('祐廷：P'), iY=r.L.findIndex(x=>/Y1$/.test(x)), iEnd=r.L.findIndex(x=>/^（今天去了/.test(x));
  check('4. 告訴她 → 答應：祐廷那句、她的答應，dating_heroine_03、ROM 交往紀錄；結算在最後',G.flags.dating_heroine_03===true&&ROM.partners(G).includes('heroine_03')&&iS>=0&&iY>iS&&iEnd>iY,JSON.stringify(r.L.slice(-4)));
  // 還沒：不鎖線、冷卻
  fresh(day,9,'dorm',{T_SAY_NOT:true}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  const ny=DATE.log(G,'heroine_03').notYet;
  check('5. 還沒（照她的 decide）：她的那句、記 T_NOT_YET（第幾次、那天）、沒有交往、記下那天和次數',r.L.some(x=>/N1$/.test(x))&&G.flags.T_NOT_YET.day===G.day&&G.flags.T_NOT_YET.n===1&&!G.flags.dating_heroine_03&&ny&&ny.day===G.day&&ny.count===4,JSON.stringify(ny));
  G.day+=3; G.weekday=wdOf(G.day); check('5. 三天後（再約一次也一樣）：兩週內不再出現',DATE.confessReady(G,'heroine_03').why==='notYet');
  G.day+=12; G.weekday=wdOf(G.day); check('5. 兩週後、但中間沒有再約：還不行',DATE.confessReady(G,'heroine_03').why==='notYet');
  delete G.flags.T_SAY_NOT; r=await go('heroine_03',['河邊欄杆','差不多了','告訴她']);
  check('5. 兩週後、這一趟又是一次正式約會（第五次）：再出現，這次答應',r.O.some(o=>o[0]==='（告訴她）')&&G.flags.dating_heroine_03===true);
  // 學姊：筆試以前婉拒
  const pre=STORY.dayOfKey('2026-01-10'); fresh(pre,9,'dorm',{}); ready('heroine_05'); DATE.log(G,'heroine_05').wish=true; r=await go('heroine_05',['河邊欄杆','差不多了','告訴她']);
  check('6. 學姊筆試前：選項照樣出現、她婉拒（preexam 那句）、記 T_PRE、不鎖線（兩週後再試）',r.O.some(o=>o[0]==='（告訴她）')&&r.L.some(x=>/PRE$/.test(x))&&G.flags.T_PRE===G.day&&!G.flags.dating_heroine_05&&DATE.log(G,'heroine_05').notYet.day===G.day,JSON.stringify(r.L.slice(-3)));
  // 快速約會不問
  fresh(day,9,'dorm',{}); ready('heroine_03'); DATE.log(G,'heroine_03').byLoc.D13=2; r=await go('heroine_03',['快速約會']);
  check('7. 快速約會（直接結算）：不出現「（告訴她）」',!r.O.some(o=>o.includes('（告訴她）')),JSON.stringify(r.O));
  delete CONFESS_LINES.heroine_05; Object.assign(CONFESS_LINES,REAL);
  // 9 正式台詞：語彤（AA_187 9-2）
  fresh(day,9,'dorm',{}); ready('heroine_03'); r=await go('heroine_03',['河邊欄杆','差不多了','告訴她','我們要不要在一起']);
  check('9. 語彤淡水收尾：「河邊風好大。……你今天一直在想事情。」→ 三選一 → 答應四句、交往中',G.flags.dating_heroine_03===true&&r.L.includes('陳語彤：河邊風好大。……你今天一直在想事情。')&&r.O.some(o=>JSON.stringify(o)==='["「我喜歡妳。」","「我們要不要在一起？」","「我喜歡妳。妳不用急著回答。」"]')&&r.L.includes('陳語彤：……你先說了。')&&r.L.includes('（她低頭，把書包拉鍊拉上又拉開。）')&&r.L.includes('陳語彤：……好。'),JSON.stringify(r.L.slice(-7)));
  fresh(day,9,'dorm',{}); ready('heroine_03',{count:4}); { const t={who:'heroine_03',locs:['D12'],day:G.day}; check('9. 語彤在別的地點（大稻埕）收尾：不出現（只在淡水）',DATE.confessReady(G,'heroine_03',t).why==='place',JSON.stringify(DATE.confessReady(G,'heroine_03',t))); }
  // 以安（AA_187 9-1）
  fresh(day,9,'dorm',{}); ready('heroine_01'); r=await go('heroine_01',['河邊欄杆','差不多了','告訴她','妳不用現在回答']);
  const iA=r.L.indexOf('沈以安：好。我們在一起。');
  check('9. 以安（玩家約的）：「今天是你約的。……」→ 選「我喜歡妳。妳不用現在回答。」→ 手帳旁白…「我現在就可以回答。」「好。我們在一起。」、交往中、沒有「十七次」',G.flags.dating_heroine_01===true&&r.L.includes('沈以安：今天是你約的。……你是不是有話要說？')&&r.L.includes('（她翻開手帳，翻到後面某一頁，又闔起來。）')&&iA>0&&r.L[iA-1]==='沈以安：我現在就可以回答。'&&!r.L.some(x=>/十七次/.test(x)),JSON.stringify(r.L.slice(-7)));
  fresh(day,9,'dorm',{}); ready('heroine_01'); r=await go('heroine_01',['河邊欄杆','差不多了','告訴她','不只是朋友']);
  check('9. 以安選第二個（沒去過讀書會＝「我們可以不只是朋友嗎？」）：沒有「我現在就可以回答。」',G.flags.dating_heroine_01===true&&r.O.some(o=>o.includes('「我們可以不只是朋友嗎？」'))&&!r.L.includes('沈以安：我現在就可以回答。'));
  // 10 AA_223：學姊（筆試前婉拒兩次、筆試後答應多一句）
  { const pre=STORY.dayOfKey('2026-01-10'); fresh(pre,9,'dorm',{}); ready('heroine_05'); r=await go('heroine_05',['河邊欄杆','差不多了','告訴她','直屬','好。']);
    check('10. 學姊筆試前：三選一（「我們可以不只是直屬嗎？」）→ 婉拒三句 →「好。」→「嗯。明天八點，法圖。」、記 SIS_DECLINED_PREEXAM、沒有交往',r.O.some(o=>o.includes('「我們可以不只是直屬嗎？」'))&&r.L.includes('溫書瑀：可是我現在不想交往。考完試以前，我只想把書讀完。')&&r.L.includes('溫書瑀：嗯。明天八點，法圖。')&&!!G.flags.SIS_DECLINED_PREEXAM&&!G.flags.dating_heroine_05,JSON.stringify(r.L.slice(-6)));
    G.day+=15; G.weekday=wdOf(G.day); r=await go('heroine_05',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
    check('10. 筆試前再說一次：「我上次說的，現在還是一樣。」「不是你不好。……」',r.L.includes('溫書瑀：我上次說的，現在還是一樣。')&&!G.flags.dating_heroine_05,JSON.stringify(r.L.slice(-4)));
    G.day=STORY.dayOfKey('2026-03-02'); G.weekday=wdOf(G.day); DATE.log(G,'heroine_05').notYet=null; { const rp=await go('heroine_05',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']); check('10. 筆試後、放榜前（3/2）：她也婉拒「考完了，可是還沒放榜。……」「等放榜好不好？……」、記 SIS_DECLINED_PRERANK、沒有交往（AA_223 @8dac7e49）',rp.L.includes('溫書瑀：考完了，可是還沒放榜。我現在每天都在想那個數字。')&&rp.L.includes('溫書瑀：等放榜好不好？放榜以後，你再跟我說一次。')&&G.flags.SIS_DECLINED_PRERANK===G.day&&!G.flags.dating_heroine_05,JSON.stringify(rp.L.slice(-4)));
      G.day+=15; G.weekday=wdOf(G.day); const rp2=await go('heroine_05',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']); check('10. 放榜前再說一次：「還沒放榜啦。……我說過的，等放榜。」',rp2.L.includes('溫書瑀：還沒放榜啦。……我說過的，等放榜。')&&!G.flags.dating_heroine_05,JSON.stringify(rp2.L.slice(-3))); }
    G.day=STORY.dayOfKey('2026-03-24'); G.weekday=wdOf(G.day); DATE.log(G,'heroine_05').notYet=null; r=await go('heroine_05',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']); const iH=r.L.indexOf('溫書瑀：好。');
    check('10. 放榜後（3/24）：「時間差不多了。……」→ 答應，婉拒過的人「好。」前多「你上次說的，我有記得。」、交往中',G.flags.dating_heroine_05===true&&r.L.includes('溫書瑀：時間差不多了。……你剛剛好像一直想講什麼。')&&iH>0&&r.L[iH-1]==='溫書瑀：你上次說的，我有記得。',JSON.stringify(r.L.slice(-6))); }
  // 芷若：第一句不綁約會內容（AA_223 第 2 節 @32424049）；有看電影的約會換「今天的電影」
  fresh(day,9,'dorm',{}); ready('heroine_02',{count:4}); { const Z=CONFESS_LINES.heroine_02;
    check('10. 芷若：淡水也出現、第一句「今天很開心。……」；西門町電影院（D04）＝「今天的電影還不錯。……」',DATE.confessReady(G,'heroine_02',{who:'heroine_02',locs:['D13']}).ok&&DATE.confessReady(G,'heroine_02',{who:'heroine_02',locs:['D04']}).ok&&Z.say(G,{locs:['D13']})[0]==='今天很開心。……你要說什麼？'&&Z.say(G,{locs:['D04']})[0]==='今天的電影還不錯。……你要說什麼？'); }
  // 子晴（AA_223 第 3 節 @32424049）：這一趟有吃東西的互動點＝「好飽。」
  fresh(day,9,'dorm',{}); ready('heroine_04'); r=await go('heroine_04',['飲料攤','差不多了','告訴她','我喜歡妳。」']);
  check('10. 子晴：淡水買了飲料（吃東西的互動點）＝「好飽。……你今天怎麼都不太講話？」→ 答應四句、交往中',G.flags.dating_heroine_04===true&&r.L.includes('高子晴：好飽。……你今天怎麼都不太講話？')&&r.L.includes('高子晴：好啦。好。你不准反悔喔。'),JSON.stringify(r.L.slice(-7)));
  fresh(day,9,'dorm',{}); ready('heroine_04'); r=await go('heroine_04',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
  check('10. 子晴：只逛（河邊欄杆）＝「今天很好玩欸。……」',r.L.includes('高子晴：今天很好玩欸。……你今天怎麼都不太講話？'),JSON.stringify(r.L.slice(-7)));
  check('10. 扭蛋不算吃東西；芋圓、飲料攤算',!DATE.ate({spots:['D03.gacha','D03.arcade']})&&DATE.ate({spots:['D18.snack']})&&DATE.ate({spots:['D13.drink']}));
  // 沛珊：重考期間不願意
  { fresh(termDay('Y2S1',8,6),9,'dorm',{PEISHAN_RETAKE:true}); ready('classmate_peishan'); r=await go('classmate_peishan',['河邊欄杆','差不多了','告訴她','朋友']);
    check('10. 沛珊重考期（大二上第 8 週、PEISHAN_RETAKE）：不出現一般告白選項（改用特別場面，AA_223 @52702c92）、沒有交往',!r.O.some(o=>o[0]==='（告訴她）')&&!G.flags.dating_classmate_peishan&&DATE.confessReady(G,'classmate_peishan',{who:'classmate_peishan',locs:['D13']}).why==='hidden',JSON.stringify(r.O.slice(-2)));
    fresh(termDay('Y1S2',8,6),9,'dorm',{}); ready('classmate_peishan',{count:4}); check('10. 沛珊大一下第 8 週（和柏翰交往的期間，AA_223 第 4 節；AA_373 #3：4/6 第 7 週起）：不出現（她自己有伴侶）',DATE.confessReady(G,'classmate_peishan',{who:'classmate_peishan',locs:['D13']}).why==='partner');
    fresh(termDay('Y1S1',12,6),9,'dorm',{}); ready('classmate_peishan'); r=await go('classmate_peishan',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
    check('10. 沛珊大一上：「今天謝謝你約我。……」→ 答應四句、交往中',G.flags.dating_classmate_peishan===true&&r.L.includes('郭沛珊：今天謝謝你約我。……你要講什麼嗎？')&&r.L.includes('郭沛珊：好啦。好。以後我會一直問你問題喔。'),JSON.stringify(r.L.slice(-6))); }
  // 11 答應還是還沒（BB_191 第 10 節 @f3ae0e82）：答應線、第三次一定答應、兩週＋再一次正式約會
  check('11. 答應線（10-2）：子晴 62、沛珊 65、語彤 68、芷若 68、學姊 70、以安 72（＋芯慈 75，AA_537 第 4 節）',JSON.stringify(DATE.YES_LINE)===JSON.stringify({heroine_04:62,classmate_peishan:65,heroine_03:68,heroine_02:68,heroine_05:70,heroine_01:72,classmate_xinci:75}));
  fresh(day,9,'dorm',{}); ready('heroine_03'); atConfess={id:'heroine_03',v:67}; r=await go('heroine_03',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
  check('11. 語彤 npcRom 67（答應線 −1）：沒有「還沒」（YT_NOT_YET 作廢，AA-C 16:44）＝答應、交往中、沒有 YT_NOT_YET',G.flags.dating_heroine_03===true&&!G.flags.YT_NOT_YET&&!r.L.some(x=>x.startsWith('陳語彤：現在不行')),JSON.stringify(r.L.slice(-3)));
  fresh(day,9,'dorm',{}); ready('heroine_03'); atConfess={id:'heroine_03',v:69}; r=await go('heroine_03',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
  check('11. 語彤 npcRom 69（答應線 +1）：答應、交往中',G.flags.dating_heroine_03===true);
  fresh(day,9,'dorm',{}); ready('heroine_01'); atConfess={id:'heroine_01',v:60}; r=await go('heroine_01',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']); const n1=DATE.log(G,'heroine_01').notYetN;
  G.day+=10; G.weekday=wdOf(G.day); r=await go('heroine_01',['河邊欄杆','差不多了']); const o10=r.O.some(o=>o[0]==='（告訴她）');
  G.day+=5; G.weekday=wdOf(G.day); r=await go('heroine_01',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']); const n2=DATE.log(G,'heroine_01').notYetN, still=!G.flags.dating_heroine_01;
  G.day+=15; G.weekday=wdOf(G.day); r=await go('heroine_01',['河邊欄杆','差不多了','告訴她','我喜歡妳。」']);
  check('11. 以安 npcRom 60（答應線 72 以下）：第一次還沒；10 天後再約沒有選項；15 天（中間又約過）第二次還沒；第三次一定答應',n1===1&&!o10&&n2===2&&still&&G.flags.dating_heroine_01===true&&G.flags.AN_REASON_PENDING.n===2,JSON.stringify({n1,o10,n2,still,flag:G.flags.AN_REASON_PENDING}));
  { fresh(termDay('Y2S1',8,6),9,'dorm',{PEISHAN_RETAKE:true}); ready('classmate_peishan'); atConfess={id:'classmate_peishan',v:60}; const L=DATE.log(G,'classmate_peishan'); L.notYetN=2;
    r=await go('classmate_peishan',['河邊欄杆','差不多了','告訴她','朋友']);
    atConfess=null;
    check('11. 第三次也要她當時願意：沛珊重考期（還沒過兩次）＝照樣不出現選項、不算進「還沒」的次數',!G.flags.dating_classmate_peishan&&!r.O.some(o=>o[0]==='（告訴她）')&&L.notYetN===2); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
