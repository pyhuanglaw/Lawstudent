// 交接包 v1（大一上）第 6 批：AA 的新事件 A9～A12——不需要瀏覽器。
// 檢查（修改前都會失敗：事件、迎新活動、下課後的事件、麵店團群組都不存在）：
//   A9 哲 1（AA_40）：第 4 週週四起、週二週四 17:30–20:30 在麵店、阿哲在旁邊才觸發（第 4 週週二、週一、16:00、宿舍都不會）；錯過週四的順延到下一次；只一次；
//     台詞照原文（「（對祐廷）」改成「（對你）」）；之後加入「麵店團」群組（一則系統訊息）；上一個麵店日沒來，下一個麵店日 17:30 阿哲在群組揪（四句輪流，AA 2026-10-14；
//     哲 1 那天、週一三五、放假不揪；一天一次；一直有來＝安靜，第 9 批 v1_batch9_unit 有更多情況）；這個例行訊息不擋每天的手機小事。
//   A10 語 1（AA_40）：第 3～5 週早上在校園、認識 Alison 之後的另一天（自我介紹那天不會、第 6 週不會、下午不會）；三個選項的反應照原文；
//     「坐下來一起吃」記憶 BREAKFAST_YU；只一次；第一次說話（talkYu）記下 metYuDay。
//   A11 迎新（AA_71 2-1＋BB_95 3-3）：活動在第 4 週週六 14–17 傅鐘前；參加就演、演完到 17:00；自我介紹三個選項（只有「念過一年經濟」設 ECON_PAST_SHARED='full'，
//     以安見過才記 KNOWS_ECON_YEAR；'half'、'full' 不會被蓋掉）；只放認識的人（Alison、柏翰沒見過就跳過）；沛珊 P0 原文、FIRST_MET、聯絡方式；只一次。
//   A12 以安的報告分工（交接包_v1 第 3 節）：第 4 週週四民總上完就演（翹課、沒有第二天下午、第 6 週、以安不在、已經演過「報告的結論」的舊存檔都沒有）；
//     第 4 週沒上的第 5 週那堂；「好，一起寫。」照 cafeView 分工＋REPORT_PARTNER；「我已經有組了。」→「好。那我自己寫，寫完給你看。」；
//     「報告的結論」只給說了有組的玩家、在分工之後；「報告發回來了」第 6 週起，一起寫過的選項是「下次也一起寫。」（AA）——2026-10-30 AA_524 A5 兩種玩家都改「這份我學到很多。」。
// 用法：node tests/v1_batch6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const W4THU=termDay(4,4), W4TUE=termDay(4,2), W5TUE=termDay(5,2), W5THU=termDay(5,4), W4SAT=termDay(4,6), W6MON=termDay(6,1), W6THU=termDay(6,4);
  check('日曆：第 4 週週四＝第 '+W4THU+' 天、週六＝第 '+W4SAT+' 天（2025-09-27）、第 6 週週一＝第 '+W6MON+' 天',W4THU===9&&W4SAT===11&&CALENDAR.dateOf(W4SAT).key==='2025-09-27'&&W6MON===20,JSON.stringify({W4THU,W4SAT,W6MON}));
  /* ---------- A9 哲 1 ---------- */
  { const e=ev('ev_zhe_long_table'); check('A9 事件存在（ev_zhe_long_table，麵店、阿哲在旁邊才觸發）',!!e&&e.trigger==='auto'&&e.location==='noodle'&&e.near&&e.near.npc==='zhe');
    const at=(day,hour,zone)=>{ fresh(day,hour,zone||'noodle'); return EVENTS.check(e); };
    const r={thu4:at(W4THU,18),tue4:at(W4TUE,18),mon:at(termDay(5,1),18),early:at(W4THU,16),dorm:at(W4THU,18,'dorm'),late:at(W4THU,20.6),day2:at(2,18)};
    check('A9 第 4 週週四 18:00 在麵店：有；第 4 週週二（還沒到第二個週四）、週一、16:00、20:36、宿舍、第一二天：沒有',r.thu4&&!r.tue4&&!r.mon&&!r.early&&!r.dorm&&!r.late&&!r.day2,JSON.stringify(r));
    fresh(W5TUE,18,'noodle'); check('A9 第 4 週週四沒去的玩家：第 5 週週二在麵店順延（不能永久錯過）',EVENTS.check(e));
    fresh(W4THU,18,'noodle'); npc('zhe',8,0); const far=tickEv(); GM.npc.zhe.obj.position.x=1.5; const near=tickEv();
    check('A9 阿哲在旁邊（6 m 內）才演；離太遠不演',!far&&!!near,JSON.stringify({far,near}));
    await new Promise(r=>setTimeout(r,0));
    const L=lines();
    check('A9 台詞（AA_542 1-2「第一次併桌」；原本 AA_40 哲 1「規矩很簡單：週二週四，麵店。不用約，來就有人。」收回）',JSON.stringify(L)===JSON.stringify(['（阿哲把兩張桌子併起來。）','你們？法律系的？','一年級。阿姨，我們之後會常來。','常來是多常？','（想了一下）想吃麵的時候。','那就是常來。','（對你）這家便宜，又近。之後想吃麵就來，遇到就一起坐。']),JSON.stringify(L));
    check('A9 阿姨的台詞名字是「阿姨」',said[1]&&said[1].who==='阿姨',JSON.stringify(said[1]));
    check('A9 記下哪一天（noodleTableDay）、只一次',G.flags.noodleTableDay===W4THU&&!EVENTS.check(e));
    /* 麵店團群組 */
    run(18.2,20); const gm=G.msgs.filter(m=>m.th==='g:noodle_team');
    check('A9 之後：加入「法一吃飯」群組（AA_542 2-1），一則系統訊息（阿哲建立了群組）＋阿哲兩則「吃飯用」「誰要吃什麼就喊」（AA_542 2-2），沒有揪',PHONE.inGroup(G,'noodle_team')&&PHONE.rec(G).groups.noodle_team.name==='法一吃飯'&&gm.length===3&&gm[0].text==='阿哲建立了群組「法一吃飯」，把你加了進來。'&&!gm[0].from&&gm[1].from==='zhe'&&gm[1].text==='吃飯用'&&gm[2].from==='zhe'&&gm[2].text==='誰要吃什麼就喊'&&!gm.some(m=>m.tag&&m.tag.startsWith('rt_zhe_ndl_')),JSON.stringify(gm.map(m=>m.text)));
    const pings=[]; let day=W4THU+1;
    for(;day<=W4THU+14;day++){ keepOn(day,7.5,'campus'); run(7.5,23.5,0.1); }
    const ps=G.msgs.filter(m=>m.th==='g:noodle_team'&&m.from==='zhe'&&m.tag&&m.tag.startsWith('rt_zhe_ndl_'));   /* 例行的揪（群組裡阿哲的其他訊息，例如第 5 週的中秋烤肉，不算）*/
    const wds=ps.map(m=>CALENDAR.dateOf(m.day).wd), days=ps.map(m=>m.day);
    const firstNdl=(()=>{ for(let d=W4THU+1;;d++) if(STORY.noodleDay(d)) return d; })();
    check('A9 之後兩週都沒去：阿哲不在群組定時揪人（AA_542 2-3 拿掉 17:30 揪人；原本每個週二、週四 17:30 四句輪流）',ps.length===0&&!G.msgs.some(m=>m.th==='g:noodle_team'&&/你最近都沒來/.test(m.text||'')),JSON.stringify(ps.map(m=>[m.day,m.h,m.text])));
    const holTT=[]; for(let d=W4THU+1;d<=W4THU+14;d++){ const w=CALENDAR.dateOf(d).wd; if((w===2||w===4)&&CALENDAR.holiday(d)) holTT.push(d); }
    void holTT;   /* 放假的週二四不揪：AA_542 起整個不揪，這一項併進上一項 */
    /* 每天的手機小事不被例行訊息擋住 */
    { const D=termDay(10,2); keepOn(D,7.5,'campus');   /* 前面兩週已經跑過的日子不再排（tag 一天一次）；第 7 週週二有以安新 3 的群組訊息（劇情訊息，那天本來就不加小事）：用第 10 週週二 */ const d0=G.flags.dpDay; G.flags.dpDay=null; G.flags.dpPick=null; G.flags.dpN={}; G.flags.dpLast=null; PHONE.join(G,'public_law','公法讀書會');   /* 讓沛珊的講義照片（公法讀書會群組）條件成立；法服讀書會已停用（AA_218 17-4）*/
      run(7.5,8); const pick=G.flags.dpPick; check('A9 週二早上每天的手機小事照樣挑（AA_542 起沒有阿哲的例行揪人訊息）',!!pick&&!PHONE.rec(G).q.some(q=>q.tag==='rt_zhe_ndl_'+D),JSON.stringify(pick)); } }
  /* ---------- A10 語 1 ---------- */
  { const e=ev('ev_yu_breakfast'); check('A10 事件存在（ev_yu_breakfast，找 Alison 說話）',!!e&&e.trigger==='interact'&&e.participants[0]==='yu');
    fresh(W4TUE,10,'campus'); npc('yu',0,1); await STORY._v1.talkYu(GM,GM.npc.yu);
    check('A10 第一次和 Alison 說話：自我介紹（不是語 1），記下 metYuDay',G.flags.met_yu===true&&G.flags.metYuDay===W4TUE&&lines()[0]==='你是周老師點的那個！我是 Alison，坐你前面右邊。',JSON.stringify(lines()));
    check('A10 自我介紹那天不演語 1（她剛講過三個社團）',!EVENTS.check(e));
    const at=(day,hour,flags,zone)=>{ fresh(day,hour,zone||'campus',Object.assign({met_yu:true,metYuDay:W4TUE},flags||{})); return EVENTS.check(e); };
    const r={next:at(W4TUE+1,8.6),w3:at(3,8.6,{metYuDay:2}),w5:at(W5THU,9),w6:at(W6MON,8.6),pm:at(W4TUE+1,9.3),notmet:at(W4TUE+1,8.6,{met_yu:false}),oldsave:at(W4TUE+1,8.6,{metYuDay:undefined}),lib:at(W4TUE+1,8.6,{},'library')};   /* AA_156 第 4 節：平日上課前 08:20～09:05（原本 9:30～12:00）*/
    check('A10 第 3～5 週上課前（08:20～09:05）在校園：有（隔天、第 3 週、第 5 週 09:00；舊存檔沒有 metYuDay 也算）；第 6 週、09:18（去上課了）、沒認識、在總圖：沒有',r.next&&r.w3&&r.w5&&r.oldsave&&!r.w6&&!r.pm&&!r.notmet&&!r.lib,JSON.stringify(r));
    const intro=['欸，你要不要坐？','我一個人吃很怪。……太安靜了。我不喜歡安靜。','對了，你都這麼早經過喔？我是板橋的車太早到。'];   /* AA_313 5-4：第三句不再推社團 */
    for(const [pick,after,mem] of [['坐下來',['她講了十五分鐘，關於三個社團。','欸你有沒有群組？沒有？我拉你。','明天你也會經過嗎？'],true],['要遲到',['喔，好！','她揮手。等你走遠，她把耳機戴上。'],false],['不會累',['累啊。','可是累就不會想東想西。'],false]]){
      fresh(W4TUE+1,10,'campus',{met_yu:true,metYuDay:W4TUE}); npc('yu',0,1); const h0=G.hour; picks=[pick]; await EVENTS.run(e); const L=lines();
      check('A10 選「'+pick+'」：開場三句＋'+JSON.stringify(after)+(mem?'、記憶 BREAKFAST_YU、過了 15 分鐘':'、沒有 BREAKFAST_YU'),JSON.stringify(L)===JSON.stringify(intro.concat(after))&&SOCIAL.has('yu','BREAKFAST_YU')===mem&&(mem?Math.abs(G.hour-h0-0.25)<0.01:G.hour===h0),JSON.stringify({L,h:G.hour})); }
    /* 2026-10-28 改：AA_497 3-8（企劃線 7a38216ca）「三個社團」只留五處，這個選項換成具體的社團「辯論社」（tests/aa497_supporting_unit.js 3-8）*/
    check('A10 三個選項（AA_40 原文；第二個 AA 2026-10-14 改成「我上課要遲到了。」；第三個 AA_497 3-8 改成「辯論社不會累嗎？」）',JSON.stringify(opts[0])===JSON.stringify(['（坐下來一起吃）','「我上課要遲到了。」','「辯論社不會累嗎？」']),JSON.stringify(opts[0]));
    check('A10 只一次',!EVENTS.check(e));
    /* AA_156（V1-A10）：吉他社入口、BREAKFAST_YU 的回聲、Alison 的社團 */
    { const notes=[]; const na=GM.addNote; GM.addNote=(id,t,b)=>notes.push([id,t,b]);
      const inv={}; for(const pick of ['坐下來','要遲到','不會累']){ fresh(W4TUE+1,10,'campus',{met_yu:true,metYuDay:W4TUE}); npc('yu',0,1); notes.length=0; picks=[pick]; await EVENTS.run(e); inv[pick]=[!!G.flags.YU_CLUB_INVITE,notes.length,!!G.flags.guitar_invite]; }
      GM.addNote=na;
      check('A10b 只有「坐下來一起吃」記 YU_CLUB_INVITE＋筆記（吉他社的時間地點）、不設 guitar_invite',JSON.stringify(inv)==='{"坐下來":[true,1,false],"要遲到":[false,0,false],"不會累":[false,0,false]}',JSON.stringify(inv));
      fresh(W4TUE,10,'campus'); npc('yu',0,1); await STORY._v1.talkYu(GM,GM.npc.yu);
      check('A10b 第一次見面：「我參加了三個社團，吉他社、辯論社，還有系學會。…」（AA_156 1-3）',lines()[1]==='我參加了三個社團，吉他社、辯論社，還有系學會。你要不要來吉他社？不用會彈。',JSON.stringify(lines()));
      const bell=async(day,hour,mem)=>{ fresh(day,hour,'campus',{met_yu:true,metYuDay:2,yuSmallTalkDay:day}); if(mem) SOCIAL.remember('yu','BREAKFAST_YU','x'); npc('yu',0,1); await STORY._v1.talkYu(GM,GM.npc.yu); return lines(); };
      const b1=await bell(W6MON,8.6,true); const again=(await (async()=>{ said=[]; await STORY._v1.talkYu(GM,GM.npc.yu); return lines(); })());
      const b2=await bell(W6MON,9.2,true), b3=await bell(W6MON,8.6,false);
      check('A10b BREAKFAST_YU 大一平日 08:36 找她：第一次「欸，今天也經過！」、同一天第二次不說；09:05 以後、沒有記憶不說（AA_156 第 4 節）',b1.includes('欸，今天也經過！')&&!again.includes('欸，今天也經過！')&&!b2.includes('欸，今天也經過！')&&!b3.includes('欸，今天也經過！'),JSON.stringify([b1,again,b2,b3]));
      const zc=ev('ev_ziqing_club'), club=async(flags,yuHere)=>{ fresh(W6MON,19.2,'wancai',flags); if(yuHere) npc('yu',0,1); npc('heroine_04',1,1); picks=[]; await EVENTS.run(zc); return lines(); };
      const z1=await club({YU_CLUB_INVITE:true},true), z2=await club({guitar_invite:true},true), z3=await club({YU_CLUB_INVITE:true,guitar_invite:true},true), z4=await club({YU_CLUB_INVITE:true},false);
      check('A10b 吉他社第一次：只有 Alison 的入口＝Alison 兩句再「新人？……法律系的？…」；只有阿凱＝「你就是阿凱的室友？」沒有 Alison；兩個都有＝照阿凱；Alison 不在場＝沒有那兩句',z1[0]==='欸！你真的來了！'&&z1[1]==='學姊，他是我拉來的。'&&/新人？/.test(z1[2])&&!z2.includes('欸！你真的來了！')&&/阿凱的室友/.test(z2[0])&&!z3.includes('欸！你真的來了！')&&!z4.includes('欸！你真的來了！'),JSON.stringify([z1.slice(0,3),z2[0],z3[0],z4[0]]));
      const Y=CHARACTERS.yu, ca=ACTIVITIES.list.find(x=>x.id==='club_guitar'); let CM=null; for(let d=termDay(5,1);d<termDay(12,1);d++){ if([1,3].includes(CALENDAR.dateOf(d).wd)&&ACTIVITIES.on(ca,d)){ CM=d; break; } } fresh(CM,19.5,'campus',{}); const ys=STORY.schedEnt(Y,G); fresh(CM,18.5,'campus',{}); const ys2=STORY.schedEnt(Y,G);
      check('A10b Alison 作息：第一個有社課的週一或週三（第 5～7 週的週一都放假）19:30 在萬才館吉他社、18:30 在校園（社課前散步）',ys&&ys.zone==='wancai'&&ys.act==='club'&&ys2&&ys2.zone==='campus',JSON.stringify([ys&&ys.zone,ys2&&ys2.zone])); } }
  /* ---------- A11 迎新 ---------- */
  { const a=ACTIVITIES.list.find(x=>x.id==='welcome_y1s1'), e=ev('ev_welcome_y1s1'), D831=STORY.dayOfKey('2025-08-31');   /* AA_310（使用者 10-20「迎新在9/27不合理阿 應該在開學前」）：8/31（日）09:30～12:00，下午開學典禮 */
    check('A11 活動：法律系迎新，開學前 8/31（日）09:30–12:00，校園晨思鐘前的集合點，參加就演 ev_welcome_y1s1、去一次就好；9/27 沒有',!!a&&!!e&&a.zone==='campus'&&a.spot&&ACTIVITIES.on(a,D831)&&!ACTIVITIES.on(a,D831+1)&&!ACTIVITIES.on(a,W4SAT)&&a.t0===9.5&&a.t1===12&&a.once&&a.event==='ev_welcome_y1s1'&&e.trigger==='activity');
    const attend=async(flags,setup,pk)=>{ fresh(D831,9.5,'campus',flags||{}); if(setup) setup(); picks=pk||[]; const ok=await CLS.attendActivity(GM,a); return ok; };
    const ok=await attend({},()=>{ meet('heroine_01'); },['大一歲','還在找']); const L=lines();
    check('A11 參加：演迎新（開場「星期天上午……下午就是開學典禮」→輪到你→阿哲「那我們叫你哥？」→你「不要。」→大地遊戲→沛珊→「好。那我們兩個都還在找。」）、演完到 12:00',ok&&L[0]==='星期天上午，晨思鐘前面，法律系的迎新。下午就是開學典禮。學長姊帶隊，大家先輪流自我介紹。'&&L.includes('輪到你。')&&L.includes('那我們叫你哥？')&&L.includes('不要。')&&L.includes('我可以問一個奇怪的問題嗎。……如果答不出來，可以算過關嗎？')&&L.includes('好。那我們兩個都還在找。')&&Math.abs(G.hour-12)<0.01,JSON.stringify({L,h:G.hour}));
    check('A11 自我介紹三個選項（AA_71 2-1）＋沛珊兩個選項（BB_95 3-3）',JSON.stringify(opts[0])===JSON.stringify(['「我叫祐廷，臺北人。」','「我比大家大一歲。」','「我二十歲。念過經濟系，一個多月。」'])&&JSON.stringify(opts[1])===JSON.stringify(['（替她答）「她想知道法律外面還有什麼。」','「我也還在找。」']),JSON.stringify(opts));
    check('A11 「大一歲」不設 ECON_PAST_SHARED、以安不記 KNOWS_ECON_YEAR',G.flags.ECON_PAST_SHARED===undefined&&!SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'));
    check('A11 沛珊：FIRST_MET、拿到她的聯絡方式；只一次（活動去過、事件演過）',SOCIAL.has('classmate_peishan','FIRST_MET')&&INV.hasContact(G,'classmate_peishan')&&!EVENTS.check(e,{chain:true})&&ACTIVITIES.onceDone(G,a));
    check('A11 沒見過 Alison、柏翰：兩句都跳過（只有認識的人在場）',!L.some(t=>/Alison 自我介紹|她剛剛講了四個/.test(t)));
    await attend({},()=>{ meet('heroine_01'); },['念過經濟系','替她答']); const L2=lines();
    check('A11 「念過一年經濟」：全場「喔——」、阿哲「哥！」、ECON_PAST_SHARED=full、以安（見過）記 KNOWS_ECON_YEAR',L2.includes('全場「喔——」。')&&L2.includes('哥！')&&G.flags.ECON_PAST_SHARED==='full'&&SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'),JSON.stringify(L2));
    check('A11 替她答：「她看了你一眼。」「……你怎麼知道。」「關主讓你們過了。」',L2.includes('她看了你一眼。')&&L2.includes('……你怎麼知道。')&&L2.includes('關主讓你們過了。'));
    await attend({},null,['念過經濟系']); check('A11 以安沒見過（不在場）：不記 KNOWS_ECON_YEAR，但同學知道（full）',G.flags.ECON_PAST_SHARED==='full'&&!SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'));
    await attend({ECON_PAST_SHARED:'half'},null,['臺北人']); const h1=G.flags.ECON_PAST_SHARED; await attend({ECON_PAST_SHARED:'full'},null,['大一歲']); const f1=G.flags.ECON_PAST_SHARED;
    check('A11 說過的事不會變成沒說過：重修經原說過 half 的照舊 half、full 照舊 full',h1==='half'&&f1==='full',JSON.stringify({h1,f1}));
    await attend({met_yu:true},null,['臺北人']); const L3=lines(); await attend({met_yu:true},()=>meet('classmate_bohan'),['臺北人']); const L4=lines();
    check('A11 見過 Alison：「Alison 自我介紹講了三分鐘她的三個社團。」；也見過柏翰才有「（小聲）她剛剛講了四個。」',L3.includes('Alison 自我介紹講了三分鐘她的三個社團。')&&!L3.includes('（小聲）她剛剛講了四個。')&&L4.includes('（小聲）她剛剛講了四個。'),JSON.stringify({L3:L3.slice(0,3),L4:L4.slice(0,3)}));
    fresh(D831,9.5,'campus'); check('A11 活動前 15 分鐘起可以參加、過了一半（10:45）以後不行',(G.hour=9.25,ACTIVITIES.canJoin(G,a))&&(G.hour=10.85,!ACTIVITIES.canJoin(G,a))); }
  /* ---------- A12 以安的報告分工 ---------- */
  { const e=ev('ev_an_report_split'); check('A12 事件存在（ev_an_report_split，民總下課後）',!!e&&e.afterClass==='civ_general'&&e.trigger==='class');
    const item=day=>CLS.dayItems(G,day).find(it=>it.c.id==='civ_general');
    const cls=async(day,flags,setup,pk,withAn)=>{ fresh(day,13.2,'classroom',Object.assign({afternoonDone:true},flags||{})); G.choices.cafeView=(flags&&flags._view)||'A'; if(withAn!==false) npc('an',1,1); if(setup) setup(); picks=pk||[]; const it=item(day); if(!it) return null; await CLS.attend(GM,it); return lines(); };
    const L=await cls(W4THU,{},null,['一起寫']);
    check('A12 第 4 週週四上完民總：以安「（把講義收好）民總的報告，兩人一組。我還沒找人。」「你那天講的，我想放進去。」',!!L&&L.includes('（把講義收好）民總的報告，兩人一組。我還沒找人。')&&L.includes('你那天講的，我想放進去。')&&L.indexOf('你那天講的，我想放進去。')>L.findIndex(t=>/./.test(t)),JSON.stringify(L));
    check('A12 「好，一起寫。」＋cafeView A：「那結論你寫。」、記憶 REPORT_PARTNER',L.includes('那結論你寫。')&&SOCIAL.has('heroine_01','REPORT_PARTNER')&&caps.some(t=>/^下課了/.test(t)));
    for(const [v,t] of [['B','那反方你寫。'],['C','那判斷標準你寫，你比我會講。']]){ const Lv=await cls(W4THU,{_view:v},null,['一起寫']); check('A12 cafeView '+v+'：「'+t+'」',Lv.includes(t)&&!Lv.includes('那結論你寫。'),JSON.stringify(Lv.slice(-2))); }
    const Ln=await cls(W4THU,{},null,['有組了']);
    check('A12 「我已經有組了。」→「好。那我自己寫，寫完給你看。」、不記 REPORT_PARTNER（不扣分）',Ln.includes('好。那我自己寫，寫完給你看。')&&!SOCIAL.has('heroine_01','REPORT_PARTNER')&&JSON.stringify(opts.find(o=>JSON.stringify(o).indexOf('一起寫')>=0))==='["「好，一起寫。」","「我已經有組了。」"]',JSON.stringify(opts[opts.length-1]));
    const noAfternoon=await cls(W4THU,{afternoonDone:false}), noAn=await cls(W4THU,{},null,[],false), w6=await cls(W6THU), old=await cls(W4THU,{},()=>{ G.events.done.ev_an_report_followup=1; });
    check('A12 沒有第二天下午、以安不在教室、第 6 週、舊存檔已經演過「報告的結論」：都沒有',[noAfternoon,noAn,w6,old].every(L=>L&&!L.includes('你那天講的，我想放進去。')),JSON.stringify([noAfternoon,noAn,w6,old].map(L=>L&&L.length)));
    const w5=await cls(W5THU,{},null,['一起寫']); check('A12 第 4 週沒去上課：第 5 週那堂課之後',w5.includes('你那天講的，我想放進去。'));
    /* 翹課（沒上那堂課）不會演 */
    fresh(W4THU,15.3,'classroom',{afternoonDone:true}); G.choices.cafeView='A'; npc('an',1,1); EVENTS.onEnter('classroom'); EVENTS.tick(0.1); EVENTS.onInteract('heroine_01'); await new Promise(r=>setTimeout(r,0));
    check('A12 只在上完課時接著演（trigger class：進教室、走近、找她說話都不會觸發——翹課的玩家沒有）',!G.events.done.ev_an_report_split,JSON.stringify(Object.keys(G.events.done)));
    /* 報告的結論、報告發回來了 */
    const fu=ev('ev_an_report_followup'), fb=ev('ev_an_report_feedback');
    const chk=(e2,day,setup)=>{ fresh(day,10,'library',{afternoonDone:true}); G.choices.cafeView='C'; SOCIAL.remember('heroine_01','CAFE_AFTERNOON',''); if(setup) setup(); return EVENTS.check(e2); };
    const r={before:chk(fu,5),declined:chk(fu,W4THU+1,()=>{ G.events.done.ev_an_report_split=1; }),partner:chk(fu,W4THU+1,()=>{ G.events.done.ev_an_report_split=1; SOCIAL.remember('heroine_01','REPORT_PARTNER',''); })};
    check('A12 「報告的結論」（她寫完給你看）：分工之前沒有、說有組的有、一起寫的沒有',!r.before&&r.declined&&!r.partner,JSON.stringify(r));
    const f={w5:chk(fb,termDay(5,5)),w6:chk(fb,W6MON)};
    check('A4／A12 「報告發回來了」第 6 週起（第 5 週沒有）',!f.w5&&f.w6,JSON.stringify(f));
    for(const [partner,want] of [[true,'「這份我學到很多。」'],[false,'「這份我學到很多。」']]){   /* AA_524 A5（企劃線 8fd10848d）：模擬法庭刪掉以後沒有合寫報告的場合，兩種玩家都改「這份我學到很多。」（原本「下次也一起寫。」／「下次一起寫。」）*/ fresh(W6MON,10,'library',{afternoonDone:true}); G.choices.cafeView='C'; SOCIAL.remember('heroine_01','CAFE_AFTERNOON',''); if(partner) SOCIAL.remember('heroine_01','REPORT_PARTNER',''); npc('an',1,1); picks=[0]; await EVENTS.run(fb);
      check('A12 報告發回來：'+(partner?'一起寫過':'沒有一起寫')+'的第一個選項是'+want+'（數值照舊）',opts[0][0]===want&&opts[0].length===2&&SOCIAL.rel('heroine_01').fam>=5,JSON.stringify(opts[0])); }
    /* AA_358 2-4（AA-C 2026-10-21 659d9d81）：「謝謝你那天陪我」有 cafeView（A、B）照原句和原選項；沒有 cafeView（拒絕咖啡廳）的換「（小聲）……寫完了，先給你看。」、
       選項「妳寫得出來的。」「改天請妳喝咖啡。」（記憶的 note 改「你說改天請她喝咖啡」）。修改前 FAIL：沒有 cafeView 也說「謝謝你那天陪我」*/
    { fresh(W4THU+1,10,'library',{afternoonDone:true}); G.choices.cafeView='A'; npc('an',1,1); picks=[1]; await EVENTS.run(fu); const LA=lines(), oA=opts[0];
      fresh(W4THU+1,10,'library',{afternoonDone:true}); G.choices.cafeView='B'; npc('an',1,1); picks=[0]; await EVENTS.run(fu); const LB=lines();
      fresh(W4THU+1,10,'library',{afternoonDone:true,anSkipped:true}); npc('an',1,1); picks=[1]; await EVENTS.run(fu); const LN=lines(), oN=opts[0], mem=SOCIAL.memories('heroine_01').find(m=>m.tag==='IMPORTANT_CONVERSATION');
      fresh(W4THU+1,10,'library',{afternoonDone:true,anSkipped:true}); npc('an',1,1); const c0=SOCIAL.rel('heroine_01').comf; picks=[0]; await EVENTS.run(fu); const L0=lines(), helped=SOCIAL.has('heroine_01','HELPED_WITH_REPORT');
      check('AA_358 2-4 報告的結論：cafeView A、B 照原句「（小聲）……謝謝你那天陪我。」和原選項（「妳寫得出來，我只是坐在旁邊。」「下次換我請。」）',LA.includes('（小聲）……謝謝你那天陪我。')&&LB.includes('（小聲）……謝謝你那天陪我。')&&JSON.stringify(oA)===JSON.stringify(['「妳寫得出來，我只是坐在旁邊。」','「下次換我請。」']),JSON.stringify([LA,oA]));
      check('AA_358 2-4 沒有 cafeView（拒絕咖啡廳）：不說「謝謝你那天陪我」，換「（小聲）……寫完了，先給你看。」；選項「妳寫得出來的。」「改天請妳喝咖啡。」→ 記憶「你說改天請她喝咖啡」',
        !LN.includes('（小聲）……謝謝你那天陪我。')&&LN.includes('（小聲）……寫完了，先給你看。')&&JSON.stringify(oN)===JSON.stringify(['「妳寫得出來的。」','「改天請妳喝咖啡。」'])&&!!mem&&mem.note==='你說改天請她喝咖啡'&&LN[LN.length-1]==='（小聲）好。',JSON.stringify([LN,oN,mem]));
      check('AA_358 2-4 沒有 cafeView 選「妳寫得出來的。」：自在、好感照原本第一個選項加；不記「幫她寫報告」（沒有一起寫）',L0.includes('（小聲）……寫完了，先給你看。')&&SOCIAL.rel('heroine_01').comf===c0+4&&!helped,JSON.stringify([L0,SOCIAL.rel('heroine_01').comf,c0,helped])); } }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
