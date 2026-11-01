// X81（使用者 10-20「幫可昕搬進宿舍的功能也沒有」＝那一局從法律系開始）：法律系開局的 8/30 載可昕上山（AA_303「法律系開局的 8/30」，AA-C bcb678e0）——不需要瀏覽器。
//   1. 法律系開局（沒有 PLAYED_Y0、和可昕交往）：8/29 21:30 以前沒有；21:30 先旁白「休學到重考的那幾個月，你不是一個人過的。」（AA-C 17:53 選 ①：從 sleepNow 搬過來）再可昕兩則（字照 AA）＋回覆按鈕「好。兩點。」→「嗯。不要遲到。」；
//      記 KX_FIRST_MSG（8/30 早上不再演舊的「第一則訊息」）；回不回都排 8/30「臺北的家（載可昕上山）14:00」（捷運約 30 分鐘）
//   2. 經濟系轉過來的（PLAYED_Y0）、沒交往、舊開局（9/17）都不會收到這一版
//   3. 鬧鐘：8/29 晚上睡覺，「睡到明天下午、晚上」被 13:00 的鬧鐘叫醒；8/30 白天小睡、跳過時間在 13:20 停（出發前 10 分鐘）
//   4. 出發 → 到家直接演 ev_y0_e37（字一字不改）→ 最後多一句「（你把車開回家，再搭捷運回宿舍。）」→ 回到宿舍 19:00 左右；AA_368 M8：經濟系路線 8/29 也搬進宿舍了，8/30 住宿舍的一樣有這一句、多 1 小時；8/30 還住在家裡（舊開局 8/31 才轉）的沒有
//   5. 14:15 還沒出發：可昕打電話（S.E37_CALL）→ 直接出遊
// 修改前：第 1 項 FAIL（法律系開局沒有 E37）。用法：node tests/x81_law_e37_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start0'};   /* 舊開局（9/17）；新遊戲預設是宿營（CAMP-L1），新開局的轉場在 start_b_unit 第 14、15 項 */
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
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const D29=STORY.dayOfKey('2025-08-29'), D30=D29+1;
const tick=()=>new Promise(r=>setTimeout(r,10));
const lawStart=(day,hour,flags)=>{ fresh(day,hour,'dorm',Object.assign({KX_FIRST_MSG:false,dating_kexin:true,LAW_START_DAY:D29,MAIN_D1:STORY.MAIN_D1_NEW},flags||{})); G.stage='law'; };
(async()=>{
  // 1
  lawStart(D29,21); check('0. 法律系開局：S.e37LawOn、新開局（week1Start）',STORY.e37LawOn&&STORY.e37LawOn(G)&&STORY.week1Start(G));
  run(21,21.4); check('1a. 8/29 21:30 以前沒有；sleepNow 的舊「第一則訊息」先不演（e37LawPending）',!PHONE.sent(G,'y0_e37_law_ask')&&!OUT.get(G,'y0_e37')&&STORY.e37LawPending(G));
  said=[]; run(21.5,21.6); await tick(); run(21.6,21.6); const K=TH('p:kexin'), q=OUT.get(G,'y0_e37');
  check('1a2. 21:30 先旁白「休學到重考的那幾個月，你不是一個人過的。」（一次）、記 KX_FIRST_MSG、之後不再是 pending',said.filter(x=>x.t==='休學到重考的那幾個月，你不是一個人過的。').length===1&&G.flags.KX_FIRST_MSG===true&&!STORY.e37LawPending(G),JSON.stringify(said.map(x=>x.t)));
  check('1b. 21:30 可昕兩則（字照 AA_303「法律系開局的 8/30」）',K.map(m=>m.text).join('｜')==='我到你家了。阿姨留我住一晚，還煮了麵。｜明天下午兩點，你回家開車，載我上山。行李兩箱。',K.map(m=>m.text).join('｜'));
  const ask=(K[1]&&K[1].ask)||{}; check('1c. 回覆按鈕只有「好。兩點。」→「嗯。不要遲到。」（沒有拒絕）',(ask.opts||[]).length===1&&ask.opts[0].t==='好。兩點。'&&ask.opts[0].say.map(x=>x.text).join()==='嗯。不要遲到。',JSON.stringify(ask));
  check('1d. 不用回也排了出遊：8/30 14:00「臺北的家（載可昕上山）14:00」、捷運約 30 分鐘、從宿舍出發、鬧鐘；記 E37_LAW',!!G.flags.E37_LAW&&!!q&&q.day===D30&&q.h===14&&q.title==='臺北的家（載可昕上山）14:00'&&q.travel==='捷運 約 30 分鐘'&&q.travelH===0.5&&q.alarm===true&&q.ev==='ev_y0_e37',JSON.stringify(q));
  const snap=JSON.stringify(G); const back=()=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); };
  { lawStart(D29,22.7,{KX_FIRST_MSG:true}); said=[]; run(22.7,22.75); await tick(); check('1e. 已經有 KX_FIRST_MSG 的（v9.10.2 的法律系開局存檔）：直接收到兩則、沒有旁白',PHONE.sent(G,'y0_e37_law_ask')&&TH('p:kexin').length===2&&!said.length,JSON.stringify(said)); }
  // 2
  { const no=[['經濟系轉過來的（PLAYED_Y0）',{PLAYED_Y0:true}],['沒交往',{dating_kexin:false}]]; for(const [n,f] of no){ lawStart(D29,21,f); run(21.5,21.6); check('2. '+n+'：沒有法律系開局這一版',!PHONE.sent(G,'y0_e37_law_ask')); }
    lawStart(D29,21,{MAIN_D1:undefined,LAW_START_DAY:undefined}); delete G.flags.MAIN_D1; delete G.flags.LAW_START_DAY; run(21.5,21.6); check('2. 舊開局（9/17，不是 week1Start）：沒有',!PHONE.sent(G,'y0_e37_law_ask')); }
  // 3
  back(); G.hour=22; const A=STORY.wakeAlarms(G,D30); check('3a. 8/29 晚上：明天的鬧鐘有 13:00「約好的時間：臺北的家（載可昕上山）14:00」',A.some(a=>Math.abs(a.h-13)<0.01&&a.why==='約好的時間：臺北的家（載可昕上山）14:00'),JSON.stringify(A));
  const bo=STORY.bedOptions(G).filter(o=>o.kind==='sleep'); check('3b. 睡到明天下午、晚上都改成 13:00 叫醒（只列一次）',bo.length>=1&&bo.every(o=>o.wake<=13+1e-6)&&bo.some(o=>/鬧鐘 13:00/.test(o.hint||'')),bo.map(o=>o.t+'@'+o.wake+'｜'+o.hint).join(' / '));
  back(); G.day=D30; G.weekday=CALENDAR.dateOf(D30).wd%7; G.hour=10; const ss=CLS.skipStops(GM,18); check('3c. 8/30 10:00 小睡、跳過時間到 18:00：13:20 停（約好的出發時間）',ss.length&&Math.abs(ss[0].h-(13+20/60))<0.01&&/約好的出發時間：臺北的家（載可昕上山）/.test(ss[0].why),JSON.stringify(ss.slice(0,2)));
  // 4
  back(); G.day=D30; G.weekday=CALENDAR.dateOf(D30).wd%7; G.hour=13.5; said=[]; picks=['我也以為']; const qq=OUT.get(G,'y0_e37'); await OUT.go(GM,qq); const L=said.map(x=>x.t);
  check('4a. 演 E37（字照 AA_303「法律系 8/30」）：開家裡的車、搬三趟、「這是我的床」、湯餃、「我也以為我會在經濟系。」那一支、一個人開車下山',L.includes('（八月三十日。你開家裡的車，載她和兩個行李箱上山。）')&&L.includes('（擦汗）……好。這是我的床。')&&L.includes('結果兩個人都繞了一圈。')&&L.includes('（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）'),JSON.stringify(L.slice(-4)));
  check('4a. AA_368 L7：小吃街「（山下的小吃街。她點了兩碗酸辣湯餃，說放榜那天晚上查木柵大學附近的店，就想吃這家了。）」（原本「說上次來看宿舍的時候就想吃了」）',L.includes('（山下的小吃街。她點了兩碗酸辣湯餃，說放榜那天晚上查木柵大學附近的店，就想吃這家了。）')&&!L.some(t=>/上次來看宿舍/.test(t)),JSON.stringify(L.filter(t=>/湯餃/.test(t))));
  check('4b. 最後多一句「（你把車開回家，再搭捷運回宿舍。）」',L[L.length-1]==='（你把車開回家，再搭捷運回宿舍。）',L[L.length-1]);
  check('4c. 回到宿舍 19:00 左右（14:00 到、演完開車回家、捷運回宿舍）、人還在宿舍、E37 演過',Math.abs(G.hour-19)<0.01&&G.zone==='dorm'&&!!G.events.done.ev_y0_e37&&qq.state==='done',G.hour+' '+G.zone);
  // AA_368 M8：經濟系路線（8/29 已經轉法律系、搬進宿舍）8/30 住在宿舍＝一樣有這一句、多 1 小時；出發地點照舊（臺北的家樓下、開車）
  { fresh(D30,13.5,'dorm',{dating_kexin:true,PLAYED_Y0:true}); G.stage='law'; OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:D30,h:14,late:0.25,place:'臺北的家樓下',title:'臺北的家樓下 14:00',travel:'開車',travelH:2/3,alarm:true}); said=[]; picks=['我也以為']; await OUT.go(GM,OUT.get(G,'y0_e37')); const L2=said.map(x=>x.t);
    check('4d. AA_368 M8：經濟系那一版住在宿舍：最後一樣是「（你把車開回家，再搭捷運回宿舍。）」、多 1 小時（13:30 出發開車 40 分鐘＝14:10 到，演 4 小時＋開車回家、捷運回宿舍 1 小時＝19:10；原本沒有這一句、18:10）',L2[L2.length-1]==='（你把車開回家，再搭捷運回宿舍。）'&&Math.abs(G.hour-(13.5+2/3+4+1))<0.01&&!G.flags.E37_LAW,G.hour+' '+L2[L2.length-1]); }
  { fresh(D30,13.5,'home',{dating_kexin:true,Y0_MOVED_OUT:true,E01_MORNING:true}); G.stage='econ'; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day;
    OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:D30,h:14,late:0.25,place:'臺北的家樓下',title:'臺北的家樓下 14:00',travel:'開車',travelH:2/3,alarm:true}); said=[]; picks=['我也以為']; await OUT.go(GM,OUT.get(G,'y0_e37'),{fromHome:true}); const L4=said.map(x=>x.t);
    check('4e. AA_368 M8：8/30 還住在家裡的（舊開局經濟系 8/31 才轉法律系）：沒有這一句、不多 1 小時',!L4.includes('（你把車開回家，再搭捷運回宿舍。）')&&L4.includes('（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）')&&G.hour<19-1e-6,G.hour+' '+L4[L4.length-1]); }
  { const g=(st,f,home)=>({stage:st,flags:f,day:D30,hour:15,home}); check('4f. STORY.e37Dorm：法律系開局（E37_LAW）、經濟系轉過來住宿舍（law）＝是；經濟系還住在家裡（econ＋Y0_MOVED_OUT）＝不是',STORY.e37Dorm(g('law',{E37_LAW:true}))&&STORY.e37Dorm(g('law',{PLAYED_Y0:true}))&&!STORY.e37Dorm(g('econ',{PLAYED_Y0:false,Y0_MOVED_OUT:true},{at:true,base:true}))); }
  // 5
  back(); G.day=D30; G.weekday=CALENDAR.dateOf(D30).wd%7; G.hour=14.3; said=[]; picks=['現在呢']; check('5a. 14:15 以後還沒出發：S.e37CallDue',STORY.e37CallDue(G));
  run(14.3,14.3); await new Promise(r=>setTimeout(r,50)); const L3=said.map(x=>x.t);
  check('5b. 可昕打電話「你在哪？行李我都搬到樓下了。」→ 直接出遊 → 演完回宿舍',L3[0]==='你在哪？行李我都搬到樓下了。'&&L3.includes('（擦汗）……好。這是我的床。')&&L3[L3.length-1]==='（你把車開回家，再搭捷運回宿舍。）'&&!!G.events.done.ev_y0_e37,JSON.stringify(L3.slice(0,2)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
