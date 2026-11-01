// 交接包 v1（大一上）第 3 批：BB 的現有事件改寫（BB_95 2-1、2-3～2-7）——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   W1 學姊第一次見面（talkSis）：六句、照群組有沒有回（回過／沒講過／舊存檔沒有群組＝不提）、民總之前／之後兩種、記 FIRST_MET、之後的隨機台詞是新的三句。
//   Q1 阿凱轉述子晴：第 4 週（第 6 天起）才觸發；台詞不動。
//   Z2 經原分組：「網拍標錯價」之後芷若的兩句；加入小組群組、她的第一則；期末（第 18 週）旁白一行、不排「第一個」。
//   W2＋P1 讀書會：「大專生研究計畫」；沛珊 P1 四句在第一題之後、PEISHAN_ASKED_WHY；散會的便條；沒認識沛珊的玩家散會時她自我介紹（FIRST_MET）、已經認識的不說；
//     收書包也走到散會；那晚 22:30 讀書會群組的四句（不是私訊）。
//   Q2 吉他社：有／沒有 guitar_invite 兩種開場（只出現一種）、「今天系上有程式比賽……」、「為什麼不去比賽？」不扣 trust、接「C 和弦再按一次。手指不要放。」、沒有「阿凱話很多」；
//     第一次去的晚上進吉他社群組、她的第一則。
//   Q3 公館的晚上：交往中「阿凱也在，他在排隊」、三個人；拍照那段（交往中阿凱多一句）只一次（ZIQING_MAKING_SOMETHING）；單身照舊「十點後半價」。
// 用法：node tests/v1_batch3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let legalAsked=0; global.LEGAL={ask:async()=>{ legalAsked++; said.push({who:'LEGAL',t:'〔題目〕'}); },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], relCalls=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},titleCard:()=>Promise.resolve(),enter:()=>Promise.resolve(),phoneBadge(){},
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(id,v){ relCalls.push([id,v]); },walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const dayOfWeek=(week,wd)=>{ for(let d=1;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===week&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; legalAsked=0; relCalls=[]; GM.npc={}; };
const lines=()=>said.filter(s=>s.who!=='LEGAL').map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||(typeof STORY_EVENTS_V11!=='undefined'&&STORY_EVENTS_V11.find(e=>e.id===id));
const sisN={id:'sis',charId:'heroine_05',name:'溫學姊',obj:{position:{x:1,y:0,z:1}},seat:null};
(async()=>{
  /* ---------- W1（AA_218 17-3 使用者批准；開頭句 2dc7f23d；機制 BB-C 798e9b14）：總圖門口的台階或 Café、9/4 以後、祐廷先開口、只一次 ---------- */
  global.GAME={E};   /* ev_sis_w1 在校園只在台階那裡：看玩家的位置 */
  const W1L=['學姊好，我是祐廷，妳的直屬學弟。','（抬頭）喔，hi。','開學還習慣嗎？','還可以。','民法你選哪個老師？','周老師。','周老師很熱門耶，要很早去佔位置喔。','真的，前一堂課就要去佔了。','（笑了一下）對，就是這樣。我要去圖書館了，有問題再私訊我。'];
  const w1=ev('ev_sis_w1'), D4=STORY.dayOfKey('2025-09-04');
  { fresh(D4+1,12.4,'campus',{}); E.player.obj.position.x=81; E.player.obj.position.z=3; const ok=EVENTS.check(w1); await EVENTS.run(w1);
    check('W1 台階（9/5 12:24）：開頭「（她坐在總圖門口的台階上看手機……）」＋九句（AA_218 17-3）',ok&&JSON.stringify(lines())===JSON.stringify(['（她坐在總圖門口的台階上看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'].concat(W1L)),JSON.stringify(lines()));
    check('W1：SIS_W1、met_sis、FIRST_MET、學姊 +3；只一次',G.flags.SIS_W1===true&&G.flags.met_sis===true&&SOCIAL.has('heroine_05','FIRST_MET')&&relCalls.some(([id,v])=>id==='sis'&&v===3)&&EVENTS.check(w1)===false);
    said=[]; await STORY._v1.talkSis(GM,sisN); const R=['判決要看事實，不要只背結論。','法圖九點四十五關門。我都待到最後。','總圖三樓的判例彙編，去年被人翻到脫頁。……不是我。'];
    check('W1 之後和她說話：照舊的隨機台詞（閒聊階梯以外）',lines().length===1&&R.includes(lines()[0]),JSON.stringify(lines())); }
  { fresh(D4+1,20,'cafe',{}); const ok=EVENTS.check(w1); await EVENTS.run(w1);
    check('W1 Café 版：開頭「（她坐在靠窗的位子看手機……）」，後面相同（「我要去圖書館了」照留）',ok&&lines()[0]==='（她坐在靠窗的位子看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'&&JSON.stringify(lines().slice(1))===JSON.stringify(W1L),JSON.stringify(lines())); }
  { fresh(D4+1,12.4,'campus',{}); E.player.obj.position.x=0; E.player.obj.position.z=0; const far=EVENTS.check(w1); G.day=D4-1; G.zone='cafe'; const early=EVENTS.check(w1); G.day=D4+1; G.zone='wancai'; const wc=EVENTS.check(w1);
    check('W1 不演：校園別的地方、9/4 以前、萬才館',far===false&&early===false&&wc===false,JSON.stringify([far,early,wc])); }
  { fresh(D4+1,15,'library',{}); const okL=EVENTS.check(w1); await EVENTS.run(w1);
    check('9/4 以後、還沒 W1，在閱覽室：找她說話就演第一次見面（AA_379：使用者 10-21 23:2x「就直接可以說話就好」；原本只有「閱覽室不能講話」那一行）',okL&&lines()[0]==='（她坐在靠窗的位子讀書，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'&&lines()[lines().length-1]==='（笑了一下）對，就是這樣。有問題再私訊我。'&&G.flags.met_sis===true&&SOCIAL.has('heroine_05','FIRST_MET'),JSON.stringify(lines()));
    fresh(D4+1,15,'wancai',{}); said=[]; await STORY._v1.talkSis(GM,sisN);
    check('還沒 W1，在萬才館：陌生人那一行旁白（W1 在台階、Café、閱覽室、大廳自習區）',JSON.stringify(lines())===JSON.stringify(['（她抬頭看了你一眼，點了一下頭，又低頭看手上的書。）'])&&!G.flags.met_sis,JSON.stringify(lines()));
    for(const z of ['library','wancai','campus']){ fresh(D4-2,15,z,{}); said=[]; await STORY._v1.talkSis(GM,sisN);
      check('9/4 以前（'+z+'）：只有「（她在看手機，沒有抬頭。）」，不算對話、不記關係（AA-C 2026-10-18 SIS-W1 第 ① 點）',JSON.stringify(lines())===JSON.stringify(['（她在看手機，沒有抬頭。）'])&&!G.flags.met_sis&&!SOCIAL.has('heroine_05','FIRST_MET')&&!((SOCIAL.rel('heroine_05').talked|0)>0),JSON.stringify(lines())); } }
  /* 社博・法服的攤位（AA_218 17-3；AA-C 09:50：做過 W1＝主版本、沒做過＝合併版）*/
  const expo=ev('ev_sis_club_expo'), COMMON=['喔，學弟，她是我們前任社長。','以前的事了啦。我現在大四，在準備研究所，已經不是社長了。','不過法服真的很不錯。每兩個禮拜會有一個禮拜六有法律服務，民眾會來問問題，學長姐會帶你。','（你直接拿起報名表寫了名字。）','這麼快？……好啊，歡迎。'];
  { fresh(STORY.dayOfKey('2025-09-30'),12,'campus',{SIS_W1:true,met_sis:true}); SOCIAL.meet('heroine_05','campus'); relCalls=[]; await EVENTS.run(expo); const L=lines();
    check('社博主版本（做過 W1）：「學弟？」（AA_313 6-4：FAMILIAR 以前不叫名字）「這我直屬學弟，我來跟他講。」→ 學長「前任社長」→ 她大四、法律服務 → 寫報名表；記 SIS_CLUB_EXPO、加入法服；不再加 +3',JSON.stringify(L)===JSON.stringify(['（椰影大道上一整排帳篷。你走到法服的攤位前。）','學弟，要不要聽一下？我們是法律服務社——','（站在帳篷前面那個綁馬尾的人轉過來，看到你。）','學弟？','這我直屬學弟，我來跟他講。'].concat(COMMON))&&G.flags.SIS_CLUB_EXPO===true&&G.flags.lawclub===true&&!relCalls.some(([id])=>id==='sis')&&EVENTS.check(expo)===false,JSON.stringify(L)); }
  { fresh(STORY.dayOfKey('2025-09-30'),12,'campus',{}); relCalls=[]; await EVENTS.run(expo); const L=lines();
    check('社博合併版（還沒 W1）：認得 家族群組大頭貼 →「學姊好，我是祐廷，妳的直屬學弟。」「喔，hi。」→ 之後同主版本；同時算 W1（SIS_W1、met_sis、FIRST_MET、+3）',JSON.stringify(L)===JSON.stringify(['（椰影大道上一整排帳篷。你走到法服的攤位前。）','學弟，要不要聽一下？我們是法律服務社——','（帳篷前面站著一個綁馬尾的人，手上拿著一疊傳單。你認得她——家族群組大頭貼上那個學姊。）','學姊好，我是祐廷，妳的直屬學弟。','喔，hi。','（對旁邊的學姐）這我直屬學弟，我來跟他講。'].concat(COMMON))&&G.flags.SIS_W1===true&&G.flags.met_sis===true&&SOCIAL.has('heroine_05','FIRST_MET')&&relCalls.some(([id,v])=>id==='sis'&&v===3)&&G.flags._EXPO_MERGED===undefined&&EVENTS.check(w1)===false,JSON.stringify(L)); }
  { const C=CHARACTERS.heroine_05.daily_schedule.find(e=>e.label==='坐在總圖門口的台階看手機');   /* 用內容找（前面插了自由出行偶遇的作息，AA_271／BB_150）*/ fresh(D4,12.3,'campus',{afternoonDone:true}); const okDay=C.if.custom(G); G.day=STORY.dayOfKey('2025-09-30'); const late=C.if.custom(G);
    check('作息：9/4～9/29 平日 12:10～12:50 坐在總圖門口的台階（[83,3]）、大一上、國定假日不在',C.zone==='campus'&&C.act==='linger'&&C.at[0]===83&&C.at[1]===3&&JSON.stringify(C.days)==='[1,2,3,4,5]'&&Math.abs(C.from-(12+10/60))<1e-9&&Math.abs(C.to-(12+50/60))<1e-9&&C.noHoliday===true&&JSON.stringify(C.terms)==='["Y1S1"]'&&okDay===true&&late===false); }
  /* ---------- Q1 ---------- */
  { const e=ev('ev_kai_mentions_ziqing'); fresh(5,20,'dorm'); const a=EVENTS.check(e); G.day=6; G.weekday=wdOf(6); const b=EVENTS.check(e);
    check('Q1 第 4 週（第 6 天起）才觸發',a===false&&b===true&&CALENDAR.termOf(6).week===4,JSON.stringify({a,b,week:CALENDAR.termOf(6).week})); }
  /* ---------- Z2 ---------- */
  { const e=ev('ev_zhiruo_ge_group'); const fri=dayOfWeek(4,5); fresh(fri,12.3,'putong',{dating_kexin:true}); picks=['網拍']; await EVENTS.run(e); const L=lines();
    check('Z2 「網拍標錯價」之後芷若的兩句，再接收尾（AA_207 §2、附錄：「標錯價喔？……原來你們上課會講這個。」、收尾「好，那我把你拉進群組，報告的事群組講。」；開場沒見過的版本「不好意思，你是法律系的嗎？剛剛點名有聽到。」）',L[0]==='不好意思，你是法律系的嗎？剛剛點名有聽到。'&&L.includes('標錯價喔？我看過那種新聞。原來你們上課會講這個。')&&L.includes('……好，這個可以拍成短片。我剪片。你負責講。')&&L[L.length-1]==='好，那我把你拉進群組，報告的事群組講。',JSON.stringify(L));
    STORY.phoneRules(GM); G.hour+=0.3; PHONE.tick(G); const T=PHONE.thread(G,'g:ge_econ');
    check('Z2 加入小組群組，她的第一則「我負責剪片。不要叫我上台。」',PHONE.inGroup(G,'ge_econ')&&T.length===1&&T[0].from==='heroine_02'&&T[0].text==='我負責剪片。不要叫我上台。',JSON.stringify(T.map(m=>m.text)));
    fresh(fri,12.3,'putong'); picks=['報告很爛']; await EVENTS.run(e); check('Z2 另一個加入的選項：沒有「網拍」那兩句、照樣加入',!lines().some(t=>/標錯價喔/.test(t))&&G.flags.ge_group_zhiruo===true&&G.flags.geGroupDay===fri);
    fresh(fri,12.3,'putong'); picks=['已經有組']; await EVENTS.run(e); STORY.phoneRules(GM); check('Z2 「我已經有組了。」：不加入群組',!G.flags.ge_group_zhiruo&&!PHONE.inGroup(G,'ge_econ'));
    const fin=ev('ev_zhiruo_ge_final'); fresh(dayOfWeek(15,3),20,'dorm',{ge_group_zhiruo:true}); const a=EVENTS.check(fin); fresh(dayOfWeek(16,3),20,'dorm',{ge_group_zhiruo:true}); const b=EVENTS.check(fin);
    await EVENTS.run(fin); check('Z2 期末（第 16 週，16 週制）旁白一行（不排「第一個」），第 15 週還沒有',a===false&&b===true&&lines()[0]==='三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'&&!/第一個/.test(lines()[0])); }
  /* ---------- W2（法服讀書會）停用；沛珊 P1／P1b 搬到公法讀書會（AA_236 A1、BB_191 §8-7、AA_222）---------- */
  { const e=ev('ev_studygroup_wed'), wed=dayOfWeek(5,3);
    fresh(wed,19.2,'wancai',{lawclub:true}); check('W2 法服讀書會停用：ev_studygroup_wed、ev_studygroup_p1b、_missed 都標 retired，不會觸發',!!e.retired&&!!ev('ev_studygroup_p1b').retired&&!!ev('ev_studygroup_p1b_missed').retired&&EVENTS.check(e)===false);
    STORY.phoneRules(GM); G.hour=22.55; PHONE.tick(G);
    check('加入法服（lawclub）＝在「法服」群組；學姊在群組的「三件事」沒有了',PHONE.inGroup(G,'lawclub_study')&&PHONE.rec(G).groups.lawclub_study.name==='法服'&&!PHONE.thread(G,'g:lawclub_study').length); }
  { const P1=ev('ev_peishan_why_plg'), P1b=ev('ev_peishan_why_answer_plg'), thu=STORY.termDay('Y1S1',11,4);
    fresh(thu,20.2,'wancai',{}); SOCIAL.meet('classmate_peishan','campus'); const ok=EVENTS.check(P1); await EVENTS.run(P1);
    check('P1（公法讀書會，大一上第 11 週起）：AA_222 五句、記 PEISHAN_ASKED_WHY、peishanAskedDay',ok&&JSON.stringify(lines())===JSON.stringify(['（大家在背基本權的審查標準。白板上寫滿了「目的」「手段」「必要」。）','（舉手，停了一下）……我們為什麼要背這個？','因為會考。','（有人笑出來。）','（想了一下）這個我下次回答妳。我想一下怎麼講比較清楚。'])&&G.flags.PEISHAN_ASKED_WHY===true&&G.flags.peishanAskedDay===thu&&EVENTS.check(P1)===false,JSON.stringify(lines()));
    const same=EVENTS.check(P1b); G.day=thu+7; const nx=EVENTS.check(P1b); await EVENTS.run(P1b);
    check('P1b：同一天不演；7 天內下一次讀書會＝以安回答（AA_222）、記 PS_WHY_ANSWERED',same===false&&nx===true&&JSON.stringify(lines().slice(-5))===JSON.stringify(['上禮拜沛珊問的，為什麼要背審查標準。','我想了一下。不背的話，討論的時候只能說「我覺得不合理」，可是講不出哪裡不合理。','背起來，至少大家吵的時候用的是同一套話。','……好，這樣我可以接受。','那今天讀比例原則。'])&&G.flags.PS_WHY_ANSWERED===true,JSON.stringify(lines().slice(-5)));
    fresh(thu,20.2,'wancai',{PEISHAN_ASKED_WHY:true,peishanAskedDay:thu-8}); check('P1b：超過 7 天就沒有（AA_222：沒來那次由 P-L3 帶一句）',EVENTS.check(P1b)===false);
    fresh(STORY.termDay('Y1S1',10,4),20.2,'wancai',{}); SOCIAL.meet('classmate_peishan','campus'); const w10=EVENTS.check(P1); G.day=STORY.termDay('Y1S2',7,4); const y7=EVENTS.check(P1); G.day=STORY.termDay('Y1S2',8,4); const y8=EVENTS.check(P1);
    fresh(thu,20.2,'wancai',{}); const unmet=EVENTS.check(P1);
    check('P1 的時間：大一上第 10 週（第一次讀書會）不演、大一下第 7 週以前可以、第 8 週以後不演；還不認識沛珊不演',w10===false&&y7===true&&y8===false&&unmet===false,JSON.stringify([w10,y7,y8,unmet])); }
  /* ---------- Q2 ---------- */
  { const e=ev('ev_ziqing_club'); const mon=dayOfWeek(5,1);
    for(const inv of [true,false]){ fresh(mon,19.2,'wancai',inv?{guitar_invite:true}:{}); await EVENTS.run(e); const L=lines();
      const want=inv?'你是阿凱的室友？法律系那個？':'新人？……法律系的？坐那邊，零食自己拿。', other=inv?'新人？……法律系的？坐那邊，零食自己拿。':'你是阿凱的室友？法律系那個？';   /* AA_207 §5（BB_167 SC3 第 21 列）：第一次見面不用「欸不是」 */
      check('Q2 '+(inv?'有':'沒有')+' guitar_invite：開場只有「'+want.slice(0,8)+'…」那一種，接自我介紹和「今天系上有程式比賽，一半的人跑去了，所以人很少。」（AA_207 附錄 §2）',L[0]===want&&!L.includes(other)&&L[1]==='我高子晴，資工系的。先講好：我們社團沒有人會彈，都是來吃東西的。'&&L[2]==='今天系上有程式比賽，一半的人跑去了，所以人很少。',JSON.stringify(L.slice(0,3))); }
    STORY.phoneRules(GM); G.hour=21.6; PHONE.tick(G); const T=PHONE.thread(G,'g:guitar');
    check('Q2 第一次去的晚上：進吉他社群組，她的第一則「新人自己報名字，不要讓我問。這不是問句。」',PHONE.inGroup(G,'guitar')&&T.length===1&&T[0].text==='新人自己報名字，不要讓我問。這不是問句。');
    fresh(mon+7,19.2,'wancai',{}); SOCIAL.meet('heroine_04','wancai'); SOCIAL.adjust('heroine_04',{fam:40,trust:20,comf:20}); const r0=Object.assign({},SOCIAL.rel('heroine_04')); picks=['程式比賽，妳怎麼沒去']; await EVENTS.run(e); const r1=SOCIAL.rel('heroine_04'), L=lines();
    check('Q2 「上次那個程式比賽，妳怎麼沒去？」（AA_207 附錄 §2；原本「為什麼不去比賽？」；沒有「阿凱說妳系上第一名」）',opts[0].includes('「上次那個程式比賽，妳怎麼沒去？」')&&!opts[0].some(t=>/第一名/.test(t)),JSON.stringify(opts[0]));
    check('Q2 不扣 trust、fam +3',r1.trust===r0.trust&&r1.fam-r0.fam===3,JSON.stringify({trust:[r0.trust,r1.trust],fam:[r0.fam,r1.fam]}));
    check('Q2 回答：「因為大家都覺得我該去。我爸最覺得。」「我週末不想再寫程式給評審看。」（AA_207 §5／BB_167 SC3 第 11 列）接「C 和弦再按一次。手指不要放。」，沒有「阿凱話很多」',L.includes('因為大家都覺得我該去。我爸最覺得。')&&L.includes('我週末不想再寫程式給評審看。')&&L.includes('C 和弦再按一次。手指不要放。')&&!L.some(t=>/阿凱話很多/.test(t)),JSON.stringify(L)); }
  /* ---------- Q3 ---------- */
  { const e=ev('ev_ziqing_gongguan_night'); const setup=f=>{ fresh(30,21.5,'gongguan',f); SOCIAL.meet('heroine_04','wancai'); SOCIAL.adjust('heroine_04',{fam:40,trust:20,comf:20}); picks=['宵夜']; };
    const PHOTO=['滷味點完，她拿手機拍了一張照片。','拍什麼？','素材。我在做一個東西。……你不要問。','（三秒後）你可以問一點點。','……不行，還是不要問。'];
    setup({dating_kexin:true}); await EVENTS.run(e); let L=lines();
    check('Q3 交往中：「滷味。走。阿凱也在，他在排隊。」（三個人；沒有「十點後半價」）',L.includes('滷味。走。阿凱也在，他在排隊。')&&!L.some(t=>/十點後半價/.test(t)),JSON.stringify(L));
    check('Q3 交往中：拍照那段（BB_95 2-7 原文）＋阿凱「她每次都拍，從來不給看。」、設 ZIQING_MAKING_SOMETHING',PHOTO.every(t=>L.includes(t))&&L.includes('她每次都拍，從來不給看。')&&G.flags.ZIQING_MAKING_SOMETHING===true);
    G.events.done[e.id]=1; G.day+=3; G.hour=21.5; check('Q3 整個事件只一次（BB-B 75c1b2b1）：之後不再觸發、也就不再有拍照',e.once===true&&!e.cooldown_days&&!EVENTS.check(e));
    setup({}); await EVENTS.run(e); L=lines(); check('Q3 單身：「滷味。走。巷子裡那家開到兩點。」（AA_207 附錄 §2：原本「十點後半價」和阿哲撞句）、拍照那段有、沒有阿凱那句',L.includes('滷味。走。巷子裡那家開到兩點。')&&PHOTO.every(t=>L.includes(t))&&!L.includes('她每次都拍，從來不給看。')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
