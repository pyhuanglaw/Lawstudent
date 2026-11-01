// 1A-04 主線 6　感冒的那一週（AA_315；台詞照 AA_315 第 3 節）——不需要瀏覽器。照 AA_315 第 8 節給 BB 的驗收情境 C1～C10 寫：
//   0. 第 2 節：一般版／很少交會版的判斷；
//   1. C1 單身、在群組、阿哲 Alison 柏翰好朋友以上、選「在群組說」：群組三則回覆；10/24 交誼廳 語彤＋三人、CG、最熟的人問「那一句」；旗標與記憶；
//   2. C2 和可昕交往、跟她說：21:30 外送粥＋「我考完就過去。你先活著。」；沒人來＝3-5、睡到隔天中午；10/26 她來、由她問；
//   3. C3 和可昕交往、誰都不說：21:00 電話三句；10/26 只說「下次要說。我想在。」、不問；
//   4. C4 和學姊交往、跟她說：學姊在交誼廳、沒有 CG、她分兩句問、回答後「……好。先吃，要冷了。」；
//   5. C5 單身、語彤好朋友以上、學姊 FRIEND：語彤帶粥＋學姊的湯（手機兩則）；
//   6. C6 和以安交往、誰都不說、語彤也知道：以安先說「……你為什麼不說？」、語彤也來（不是一個人放下就走）；
//   7. C7 和可昕交往、只有語彤：東西在舍監那裡、傳訊息就走、那晚沒人問；之後麵店版；
//   8. C8 沒有好朋友、沒有交往：沒有打噴嚏；期中最後一科考完 19:00 麵店（出遊）、最熟的人問；沒去＝22:00 私訊（第 4 個＝30 分鐘後再問、沒有第 4 個）；沒有人到 FAMILIAR＝不演；
//   9. C9 子晴：沒看過 Q6＝「期末的作業」、看過＝「測試版」；10. C10 不扣錢、不扣體力，沒有客套話；
//  11. 第 4 個選項（吃完再問一次）、第 1 個選項的房東版、最近 14 天有裂縫＝改成最熟的朋友問；第 5 點只包括非交往對象；3b 阿哲的兩種說法；
//  12. 接線：S.tick、sleepNow（10/24 21:00、21:30 醒來）、home3d.js（在家打噴嚏、18:00 回宿舍）、CG 登記與檔案、BEING_HEARD 記憶名稱。
// 修改前全部 FAIL。用法：node tests/cold_week_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ cgs.push(id); return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], entered=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ entered.push(z); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; cards=[]; entered=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv,extra)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f+(extra||0); r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const has=(t)=>said.some(s=>s.t===t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const d23=D('2027-10-23'), d24=D('2027-10-24'), d25=D('2027-10-25'), d26=D('2027-10-26');
const night=async()=>{ G.day=d24; G.hour=21.5; G.zone='dorm'; said=[]; cgs=[]; return STORY.coldWeekNight(GM); };
(async()=>{
  // 0. 第 2 節
  fresh(d23,8,'dorm'); check('0. 沒有交往、沒有好朋友：很少交會版', STORY.coldWeekGeneral(G)===false);
  fresh(d23,8,'dorm'); date('kexin'); check('0. 和可昕交往：一般版（可昕也算）', STORY.coldWeekGeneral(G)===true);
  fresh(d23,8,'dorm'); R('kai','CLO'); check('0. 阿凱好朋友以上、沒有 SUNDAY_SUPPER：不算', STORY.coldWeekGeneral(G)===false);
  SOCIAL.remember('kai','SUNDAY_SUPPER',''); check('0. 阿凱好朋友以上＋SUNDAY_SUPPER：一般版', STORY.coldWeekGeneral(G)===true);
  fresh(d23,8,'dorm'); R('yu','CLO'); check('0. Alison 好朋友以上、不在麵店團：不算', STORY.coldWeekGeneral(G)===false);
  PHONE.join(G,'noodle_team','麵店團'); check('0. Alison 好朋友以上＋在麵店團：一般版', STORY.coldWeekGeneral(G)===true);
  fresh(d23,8,'dorm'); R('heroine_03','FRI'); check('0. 語彤只是朋友（FRIEND）：不算', STORY.coldWeekGeneral(G)===false);

  // 1. C1
  fresh(d23,8,'dorm'); PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','classmate_bohan']) R(id,'CLO'); R('zhe','CLO',20); R('heroine_03','CLO');
  check('1. C1 10/23 早上在房間：打噴嚏到期（起床選單之前，S.tick）', STORY.coldSneezeDue(G)===true);
  picks=['在麵店團群組']; await STORY.coldWeekSneeze(GM);
  check('1. C1 打噴嚏兩句（逐字）、選項（群組、誰都不說）', said[0]&&said[0].t==='（起床的時候，你打了三個噴嚏。）'&&said[1]&&said[1].t==='（頭有點重。）'&&opts[0].join('|')==='（在群組說一聲。）|（誰都不說。睡一下就好了。）', JSON.stringify(opts[0]));
  check('1. C1 群組：你傳「我好像感冒了。」、阿哲「收到」Alison「多喝水。」柏翰「刑訴筆記我有。」', JSON.stringify(txt('g:noodle_team'))===JSON.stringify(['player:我好像感冒了。','zhe:收到','yu:多喝水。','classmate_bohan:刑訴筆記我有。'])&&G.flags.COLD_WEEK==='night'&&G.flags.COLD_WEEK_TOLD==='group', JSON.stringify(txt('g:noodle_team')));
  { const C=STORY.coldWeekCast(G); check('1. C1 名單：語彤、阿哲、Alison、柏翰（3-2 的順序）；CG；最熟的人問（阿哲）', JSON.stringify(C.visitors)===JSON.stringify(['heroine_03','zhe','yu','classmate_bohan'])&&C.cg===true&&C.asker==='zhe'&&!C.partner, JSON.stringify(C)); }
  G.money=5000; G.energy=70; picks=[1]; await night(); const L1=lines();
  check('1. C1 21:30 房間一句 → 手機響了 → 下樓到交誼廳（3D dorm_hall）', said[0].t==='（晚上九點半。你躺在床上，額頭燙得不像自己的。）'&&said[1].t==='（手機響了。你披了一件外套，下樓到交誼廳。）'&&entered.includes('dorm_hall'), JSON.stringify(entered));
  check('1. C1 出場順序與台詞（逐字）', L1.includes('陳語彤：嗯。阿姨煮的粥。不要問我怎麼知道的。')&&L1.indexOf('阿哲：滷味。我跟老闆說是病人吃的，他多給一顆蛋。')>L1.indexOf('陳語彤：嗯。阿姨煮的粥。不要問我怎麼知道的。')&&L1.indexOf('Alison：面紙。你鼻子好紅。')>L1.indexOf('阿哲：滷味。我跟老闆說是病人吃的，他多給一顆蛋。')&&L1.indexOf('許柏翰：刑訴的筆記。我多印了一份。')>L1.indexOf('Alison：面紙。你鼻子好紅。'), JSON.stringify(L1.slice(2,7)));
  check('1. C1 CG cg_cold_week_friends 在「那一句」之前', cgs[0]==='cg_cold_week_friends');
  check('1. C1 阿哲問（通用一句）、選第 2 個、回答後「好。考完再跟我講一次。」、結尾（逐字）', L1.includes('阿哲：你每次都在幫別人查。你自己呢？你想用法律做什麼？')&&L1.includes('阿哲：好。考完再跟我講一次。')&&L1[L1.length-1]==='（十點半。交誼廳的燈關了一半。你上樓的時候，手上還提著一個塑膠袋。）', JSON.stringify(L1.slice(-3)));
  check('1. C1 旗標：COLD_WEEK_PRESENT、COLD_WEEK_ANSWER why、BEING_HEARD（阿哲）、HELPED（四位）', JSON.stringify(G.flags.COLD_WEEK_PRESENT)===JSON.stringify(['heroine_03','zhe','yu','classmate_bohan'])&&G.flags.COLD_WEEK_ANSWER==='why'&&SOCIAL.has('zhe','BEING_HEARD')&&['heroine_03','zhe','yu','classmate_bohan'].every(id=>SOCIAL.has(id,'HELPED'))&&!SOCIAL.has('yu','BEING_HEARD'));
  check('1. C1 演完上樓：回到房間、22:30；不扣錢、不扣體力（C10）', G.zone==='dorm'&&Math.abs(G.hour-22.5)<0.01&&G.money===5000&&G.energy===70&&!said.some(s=>/好好照顧自己/.test(s.t)), G.zone+' '+G.hour);
  check('1. 事件 id 記成演過（ev_cold_week_sneeze、ev_cold_week_night）', !!G.events.done.ev_cold_week_sneeze&&!!G.events.done.ev_cold_week_night);
  G.day=d25; G.hour=8; G.zone='dorm'; check('1. 10/25 起床：燒退（3-7）', STORY.coldMorningDue(G)); said=[]; await STORY.coldWeekMorning(GM); check('1. 10/25 逐字「（燒退了。喉嚨還有一點痛。）」、只一次', said[0]&&said[0].t==='（燒退了。喉嚨還有一點痛。）'&&!STORY.coldMorningDue(G));

  // 2. C2
  fresh(d23,8,'dorm'); date('kexin'); picks=['跟可昕']; await STORY.coldWeekSneeze(GM);
  check('2. C2 選項有「（傳訊息跟可昕說：我好像感冒了。）」、可昕三則回覆（逐字；第三則照 AA_376 第 14 項「下週」）', opts[0][0]==='（傳訊息跟可昕說：我好像感冒了。）'&&JSON.stringify(txt('p:kexin').slice(-4))===JSON.stringify(['player:我好像感冒了。','kexin:幾度？','kexin:量了再跟我說。','kexin:……我下週也期中，二十六號考第一科。'])&&G.flags.KX_COLD_WEEK==='told', JSON.stringify(txt('p:kexin')));
  check('2. C2 10/24 21:00 沒有要打電話的人（被告知的可昕不打）', STORY.coldCallList(Object.assign({},G,{day:d24}))&&STORY.coldCallList(G).length===0);
  await night(); const L2=lines();
  check('2. C2 21:30 外送粥＋「我考完就過去。你先活著。」（手機）', L2.includes('（外送的粥送到宿舍門口。）')&&L2.includes('可昕（手機）：我考完就過去。你先活著。'), JSON.stringify(L2.slice(0,4)));
  check('2. C2 沒有人來：3-5「（沒有人敲門。你吃了一顆退燒藥，睡到隔天中午。）」→ 睡到 10/25 12:00', L2.includes('（沒有人敲門。你吃了一顆退燒藥，睡到隔天中午。）')&&G.day===d25&&Math.abs(G.hour-12)<0.01&&!entered.includes('dorm_hall'), G.day+' '+G.hour);
  G.day=d26; G.hour=18.5; G.zone='dorm'; check('2. C2 10/26 18:30 在宿舍：可昕來（直接演）', STORY.coldKexinDue(G)); said=[]; opts=[]; picks=[0]; await STORY.coldWeekKexin(GM); const L2b=lines();
  check('2. C2 10/26 逐字、10/24 沒人問＝她問（3-4 的兩句）、回答後「好。那你先把粥吃完。」', L2b[0]==='杜可昕：我考完了。你還活著，很好。'&&L2b[1]==='杜可昕：（把一袋橘子放在交誼廳的矮桌上）予樂說感冒要吃橘子。我不知道有沒有根據。'&&L2b[2]==='杜可昕：你每次都在幫別人查。'&&L2b[3]==='杜可昕：你自己呢？你想用法律做什麼？'&&L2b.includes('杜可昕：好。那你先把粥吃完。')&&G.flags.COLD_WEEK_ASKER==='kexin'&&G.zone==='dorm_hall', JSON.stringify(L2b));
  check('2. C2 可昕問過了：麵店版不演', !STORY.coldNoodleOn(G));
  // 在外面：出遊 must 帶回宿舍
  fresh(d26,18,'campus',{COLD_WEEK:'night',COLD_WEEK_TOLD:'kexin',KX_COLD_WEEK:'told',COLD_WEEK_NIGHT:d24}); date('kexin'); STORY.coldWeekTick(GM); const qk=OUT.get(G,'y3_cold_kexin');
  check('2. C2 10/26 18:00 在外面：排「宿舍門口」出遊（must，帶到交誼廳）', !!qk&&qk.must===true&&qk.goto&&qk.goto.zone==='dorm_hall'&&qk.h===18.5, JSON.stringify(qk));

  // 3. C3
  fresh(d23,8,'dorm'); date('kexin'); picks=['誰都不說']; await STORY.coldWeekSneeze(GM);
  check('3. C3 誰都不說：TOLD none、沒有傳訊息', G.flags.COLD_WEEK_TOLD==='none'&&txt('p:kexin').length===0);
  G.day=d24; G.hour=21; check('3. C3 10/24 21:00：可昕的電話到期', STORY.coldCallDue(G)&&JSON.stringify(STORY.coldCallList(G))==='["kexin"]'); said=[]; await STORY.coldWeekCalls(GM);
  check('3. C3 電話三句（逐字）、記 found_out', JSON.stringify(lines())===JSON.stringify(['可昕（電話）：……你聲音怎麼了？','可昕（電話）：你為什麼不說？','可昕（電話）：……我後天考完過去。'])&&G.flags.KX_COLD_WEEK==='found_out', JSON.stringify(lines()));
  await night(); G.day=d26; G.hour=18.6; G.zone='dorm_hall'; said=[]; opts=[]; await STORY.coldWeekKexin(GM);
  check('3. C3 10/26：只說「下次要說。我想在。」，不問那一句', JSON.stringify(lines())===JSON.stringify(['杜可昕：（把一袋橘子放在交誼廳的矮桌上）','杜可昕：下次要說。我想在。'])&&opts.length===0, JSON.stringify(lines()));

  // 4. C4
  fresh(d23,8,'dorm'); date('heroine_05'); picks=['跟學姊']; await STORY.coldWeekSneeze(GM);
  check('4. C4 學姊回覆「……知道了。今天先睡。」', txt('p:heroine_05').includes('heroine_05:……知道了。今天先睡。'));
  { const C=STORY.coldWeekCast(G); check('4. C4 學姊親自來、沒有 CG、她問', C.partner==='heroine_05'&&!C.cg&&C.asker==='heroine_05'&&!C.drop, JSON.stringify(C)); }
  picks=[0]; await night(); const L4=lines();
  check('4. C4 學姊交往版（被告知）逐字（名字框照交往中的叫法「書瑀」，CALLED_SHUYU）、她分兩句問、回答後「……好。先吃，要冷了。」', L4.includes('書瑀：粥。還是熱的。你先吃，我坐一下就走。')&&L4.includes('（你吃粥的時候，她把你帶下來的講義疊好，沒有翻開。）')&&L4.includes('書瑀：明天早上我傳訊息給你。有回就好。')&&!L4.includes('書瑀：語彤說你兩天沒出門。')&&L4.includes('書瑀：你每次都在幫別人查。你自己呢？')&&L4.includes('書瑀：你想用法律做什麼？')&&L4.includes('書瑀：……好。先吃，要冷了。')&&cgs.length===0, JSON.stringify(L4));
  check('4. C4 選第 1 個：COLD_WEEK_ANSWER help', G.flags.COLD_WEEK_ANSWER==='help');

  // 5. C5
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); R('heroine_03','CLO'); R('heroine_05','FRI'); picks=[2]; await night(); const L5=lines();
  check('5. C5 語彤帶粥＋學姊的湯：「學姊叫我拿來的。她說她不上來。」＋學姊手機兩則（逐字）', L5.includes('陳語彤：嗯。阿姨煮的粥。不要問我怎麼知道的。')&&L5.includes('陳語彤：學姊叫我拿來的。她說她不上來。')&&L5.some(x=>/^[^：]*（手機）：語彤說你病了。$/.test(x))&&L5.some(x=>/^[^：]*（手機）：湯喝完。然後睡覺。$/.test(x))&&L5.includes('陳語彤：嗯。……那你要先好起來。'), JSON.stringify(L5));
  check('5. C5 學姊沒有來（不在 COLD_WEEK_PRESENT）', JSON.stringify(G.flags.COLD_WEEK_PRESENT)==='["heroine_03"]');

  // 6. C6
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); date('heroine_01'); R('heroine_03','CLO'); picks=[0]; await night(); const L6=lines();
  check('6. C6 以安（沒被告知）先「……你為什麼不說？」再「我幫你排好了。」；語彤也來（不是放下就走）；以安問', L6.indexOf('沈以安：……你為什麼不說？')>=0&&L6.indexOf('沈以安：我幫你排好了。')>L6.indexOf('沈以安：……你為什麼不說？')&&L6.includes('陳語彤：嗯。阿姨煮的粥。不要問我怎麼知道的。')&&!L6.some(x=>/東西在舍監那裡/.test(x))&&L6.includes('沈以安：好。這句我會記得。'), JSON.stringify(L6));

  // 7. C7
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); date('kexin'); R('heroine_03','CLO');
  { const C=STORY.coldWeekCast(G); check('7. C7 只有語彤、祐廷和可昕交往：她不坐下（drop）、沒有人問', C.drop==='heroine_03'&&C.visitors.length===0&&!C.asker, JSON.stringify(C)); }
  await night(); const L7=lines();
  check('7. C7 舍監窗口＋她那句的手機版（逐字）；接 3-5', L7.some(x=>/^[^：]*（手機）：東西在舍監那裡。我先走了。$/.test(x))&&L7.some(x=>/^[^：]*（手機）：嗯。阿姨煮的粥。不要問我怎麼知道的。$/.test(x))&&TH('p:heroine_03').map(m=>m.text).join('|')==='東西在舍監那裡。我先走了。|嗯。阿姨煮的粥。不要問我怎麼知道的。'&&L7.includes('（沒有人敲門。你吃了一顆退燒藥，睡到隔天中午。）')&&!G.flags.COLD_WEEK_ASKER, JSON.stringify(L7));
  check('7. C7 可昕沒被告知、10/24 沒人問：之後麵店版', STORY.coldNoodleOn(G)===true);
  { const G2=fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); R('heroine_03','CLO'); const C=STORY.coldWeekCast(G); check('7. 雙方單身、只有語彤：她照樣坐下（第 5 點只在有伴侶時）', !C.drop&&C.visitors[0]==='heroine_03'); }

  // 8. C8
  fresh(d23,8,'dorm'); R('heroine_01','FAM'); R('zhe','FAM',5);
  check('8. C8 很少交會：10/23 打噴嚏不演、COLD_WEEK noodle', (await STORY.coldWeekSneeze(GM))===false&&said.length===0&&G.flags.COLD_WEEK==='noodle');
  const dN=STORY.coldNoodleDay(G); check('8. C8 麵店那天＝期中最後一科考完那天（CLS.lastExamEnd，大三上期中考週）', dN!=null&&dN>=d25&&CALENDAR.termOf(dN).id==='Y3S1'&&CALENDAR.termOf(dN).exam==='mid'&&dN===((CLS.lastExamEnd(G,'Y3S1','mid')||{}).day), dN+' '+(dN!=null?CALENDAR.dateOf(dN).key:''));
  check('8. C8 問的人＝FAMILIAR 以上最熟的一位（阿哲）', STORY.coldNoodleAsker(G)==='zhe');
  G.day=dN; G.hour=18.2; G.zone='campus'; STORY.coldWeekTick(GM); const qn=OUT.get(G,'y3_cold_noodle'); check('8. C8 18:00 排 19:00 阿鳳麵店的出遊（可以不去）', !!qn&&!qn.must&&qn.goto&&qn.goto.zone==='noodle'&&qn.h===19, JSON.stringify(qn));
  G.hour=19.1; G.zone='noodle'; said=[]; picks=[2]; await STORY.coldWeekNoodle(GM,'zhe'); const L8=lines();
  check('8. C8 麵店版（逐字）：「（期中考完的晚上，麵店的長桌只剩你們兩個。他把筷子放下。）」→ 通用那一句 → 「好。考完再跟我講一次。」', L8[0]==='（期中考完的晚上，麵店的長桌只剩你們兩個。他把筷子放下。）'&&L8.includes('阿哲：你每次都在幫別人查。你自己呢？你想用法律做什麼？')&&L8.includes('阿哲：好。考完再跟我講一次。')&&G.flags.COLD_WEEK_ANSWER==='life'&&SOCIAL.has('zhe','BEING_HEARD'), JSON.stringify(L8));
  // 私訊版
  fresh(dN,22.1,'dorm',{COLD_WEEK:'noodle',COLD_NOODLE_DAY:dN}); R('heroine_01','FAM'); STORY.coldWeekTick(GM); PHONE.tick(G); const dm=TH('p:heroine_01');
  check('8. C8 沒去：22:00 同一個人私訊兩則（逐字）、四個選項', dm.length===2&&dm[0].text==='你每次都在幫別人查。'&&dm[1].text==='你自己呢？你想用法律做什麼？'&&dm[1].ask&&dm[1].ask.opts.length===4&&G.flags.COLD_WEEK_NOODLE==='dm', JSON.stringify(dm.map(m=>m.text)));
  { const r=PHONE.answer(G,dm[1].ask.id,3); check('8. C8 第 4 個：「好，那你吃完飯再回我。」', !!r&&TH('p:heroine_01').some(m=>m.text==='好，那你吃完飯再回我。')&&G.flags.COLD_WEEK_DM_LATER===1);
    STORY.coldWeekTick(GM); G.hour+=0.51; PHONE.tick(G); const dm2=TH('p:heroine_01').filter(m=>m.ask&&m.ans==null);
    check('8. C8 30 分鐘後再問一次、沒有第 4 個', dm2.length===1&&dm2[0].ask.opts.length===3, JSON.stringify(dm2.map(m=>m.ask.opts.map(o=>o.t))));
    const r2=dm2[0]?PHONE.answer(G,dm2[0].ask.id,0):null; check('8. C8 回答：回答後那一句（以安「好。這句我會記得。」）、BEING_HEARD、ANSWER help', !!r2&&TH('p:heroine_01').some(m=>m.text==='好。這句我會記得。')&&G.flags.COLD_WEEK_ANSWER==='help'&&SOCIAL.has('heroine_01','BEING_HEARD')); }
  fresh(dN,19.2,'noodle',{COLD_WEEK:'noodle',COLD_NOODLE_DAY:dN}); STORY.coldWeekTick(GM); check('8. C8 沒有任何人到 FAMILIAR：不演、COLD_WEEK none、BEING_HEARD 不記', G.flags.COLD_WEEK==='none'&&G.flags.COLD_WEEK_NOODLE==='none');
  fresh(dN,19.2,'noodle',{COLD_WEEK:'night',COLD_WEEK_NIGHT:d24,COLD_NOODLE_DAY:dN}); R('heroine_03','FAM'); said=[]; picks=[0]; await STORY.coldWeekNoodle(GM,'heroine_03');
  check('8. 3-5 接麵店版：開頭多一句「（感冒好了以後，第一次來麵店。）」、她', said[0]&&said[0].t==='（感冒好了以後，第一次來麵店。）'&&said[1]&&/她把筷子放下/.test(said[1].t));

  // 9. C9
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); R('heroine_04','CLO'); R('zhe','CLO');
  check('9. C9 子晴沒看過 Q6：「先看這個。期末的作業。」', JSON.stringify(STORY.coldWeekLines(G,'heroine_04'))===JSON.stringify([['heroine_04','你兩天沒回我訊息。我還以為你被當了。'],[null,'（她打開筆電）'],['heroine_04','先看這個。期末的作業。']]));
  SOCIAL.remember('heroine_04','PLAYTESTED',''); check('9. C9 看過 Q6（PLAYTESTED）：「先看這個。測試版。」', STORY.coldWeekLines(G,'heroine_04')[2][1]==='先看這個。測試版。');
  check('11. 3b 阿哲：認識以安＝「小安的筆記」、不認識＝「刑訴的筆記我幫你印了。」', (()=>{ const a=STORY.coldWeekLines(G,'zhe')[0][1]; SOCIAL.remember('heroine_01','FIRST_MET',''); const b=STORY.coldWeekLines(G,'zhe')[0][1]; return a==='刑訴的筆記我幫你印了。後天才考，不要慌。'&&b==='你的筆記我幫你借了。小安的，她叫我跟你說不准還。'; })());

  // 11. 選項、裂縫
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night'}); check('11. 第 1 個選項：一般', STORY.coldWeekOpts(G)[0].t==='「我想讓遇到事情的人，旁邊有一個看得懂的人。」'&&STORY.coldWeekOpts(G).length===4&&STORY.coldWeekOpts(G,true).length===3);
  SOCIAL.remember('heroine_03','RENT_RUMOR',''); check('11. 第 1 個選項：看過語彤家房東的事＝「我想讓麵店那種事，每次都有人幫得上忙。」', STORY.coldWeekOpts(G)[0].t==='「我想讓麵店那種事，每次都有人幫得上忙。」');
  fresh(d24,21.5,'dorm_hall',{COLD_WEEK:'night'}); said=[]; picks=[3,1]; await STORY._cwAsk(GM,'zhe','night');
  check('11. 第 4 個：「好，那吃完再說。」「（你吃完了。）」再問一次通用那一句、沒有第 4 個', said.map(s=>s.t).join('|')==='你每次都在幫別人查。你自己呢？你想用法律做什麼？|好，那吃完再說。|（你吃完了。）|你每次都在幫別人查。你自己呢？你想用法律做什麼？|好。考完再跟我講一次。'&&opts[1].length===3&&G.flags.COLD_WEEK_ANSWER==='why', JSON.stringify(said.map(s=>s.t)));
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'heroine_01'}); date('heroine_01'); R('zhe','CLO'); ROM.crack(G,'heroine_01');
  { const C=STORY.coldWeekCast(G); check('11. 交往對象最近 14 天有裂縫：改成在場最熟的朋友問（阿哲）', G.flags.AN_CRACK_DAY===G.day&&C.partner==='heroine_01'&&C.asker==='zhe', JSON.stringify(C)); }
  G.flags.AN_CRACK_DAY=G.day-20; check('11. 裂縫是 20 天前：她問', STORY.coldWeekCast(G).asker==='heroine_01');
  fresh(d24,21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'heroine_01'}); date('heroine_01'); date('heroine_03');
  { const C=STORY.coldWeekCast(G); check('11. 兩位交往對象：被告知的那位來、另一位只打電話；第 5 點不包括交往對象本人', C.partner==='heroine_01'&&JSON.stringify(C.calls)==='["heroine_03"]'&&!C.drop, JSON.stringify(C)); }
  fresh(d24,10,'campus'); R('heroine_03','CLO'); STORY.coldWeekTick(GM); check('11. 錯過 10/23 起床（讀檔在 10/24）：照第 2 節補判斷、誰都沒說', G.flags.COLD_WEEK==='night'&&G.flags.COLD_WEEK_TOLD==='none');

  // 12. 接線
  fresh(d24,19,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); date('heroine_01'); date('heroine_03');
  check('12. 10/24 19:00 睡著：21:00 醒來（只打電話的人）', STORY.lawWakeAt(G)===21);
  G.flags.COLD_WEEK_CALLS=['heroine_03']; check('12. 打過電話：21:30 醒來', STORY.lawWakeAt(G)===21.5); G.flags.COLD_WEEK_NIGHT=d24; check('12. 那一晚演過：不再叫醒', STORY.lawWakeAt(G)==null);
  fresh(d26,15,'dorm',{COLD_WEEK:'night',KX_COLD_WEEK:'told',COLD_WEEK_NIGHT:d24}); date('kexin'); check('12. 10/26 下午睡著：18:30 醒來（可昕考完過來）', STORY.lawWakeAt(G)===18.5); G.flags.KX_COLD_WEEK_SEEN=d26; check('12. 可昕來過：不再叫醒', STORY.lawWakeAt(G)==null);
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), hm=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8');
    check('12. S.tick：HOME 那一段之前先問 coldWeekTick', /if\(S\.coldWeekTick\(GM\)\) return;[^\n]*\n(\s*if\(S\.exchFormTick\(GM\)\) return;[^\n]*\n)?(\s*for\(const f of S\.TICKS\)[^\n]*\n)?(\s*if\(typeof JP!=='undefined'[^\n]*\n)?\s*if\(typeof HOME!=='undefined'&&HOME\.at\(G\)\)\{ HOME\.tick\(GM\); return; \}/.test(s));
    check('12. sleepNow：法律系的醒來時間 S.lawWakeAt', /const cw=S\.coreCallAt\(G\), lw=cw==null\?S\.lawWakeAt\(G\):null;/.test(s));
    { const lp=hm.slice(hm.indexOf('S.loop=async function')); check('12. home3d.js：在家醒來打噴嚏（起床選單之前）、10/24 18:00 回宿舍', /STORY\.coldHomeBackDue\(G\)\)\{ coldBack=true; break; \}/.test(lp)&&/STORY\.coldSneezeDue\(G,true\)\)\{ await STORY\.coldWeekSneeze\(GM\); continue; \}/.test(lp)&&/if\(coldBack\) await S\.coldBack\(GM\);/.test(lp)&&lp.indexOf('coldSneezeDue(G,true)')>0&&lp.indexOf('coldSneezeDue(G,true)')<lp.indexOf('if(H.wakeAsk===G.day)')); } }
  fresh(d24,18.2,'dorm',{COLD_WEEK:'night'}); G.home={at:true}; check('12. 10/24 18:00 人在家：回宿舍到期', STORY.coldHomeBackDue(G)===true);
  said=[]; cards=[]; entered=[]; await HOME.coldBack(GM); check('12. 回宿舍：旁白「（後天要考試。你提早回宿舍。）」→ 字卡「回宿舍」→ 房間', said[0]&&said[0].t==='（後天要考試。你提早回宿舍。）'&&cards[0]&&cards[0][0]==='回宿舍'&&entered[0]==='dorm'&&!HOME.at(G), JSON.stringify(cards));
  fresh(d23,8,'dorm'); G.home={at:true}; check('12. 10/23 在家醒來：打噴嚏到期（home3d.js 的選單問）', STORY.coldSneezeDue(G,true)===true&&STORY.coldSneezeDue(G)===false);
  { const src=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=src.match(/cg_cold_week_friends:\{file:'([^']+)',title:'([^']+)'\}/);
    check('12. CG 登記（adv3d.js）、檔案在 repo（和企劃線 cg_approved 那張一樣大小）', !!m&&fs.existsSync(path.join(ROOT,m[1]))&&fs.statSync(path.join(ROOT,m[1])).size===283384&&/cg_cold_week_friends/.test(fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8')), m&&m[1]); }
  check('12. 記憶名稱 BEING_HEARD「他說了自己想做的事」', SOCIAL.MEMORY_LABEL.BEING_HEARD==='他說了自己想做的事');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
