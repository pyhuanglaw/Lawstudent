// 事件包第 2 輪之一：大二 24 件（AA_325，AA-C 404ae976；EVPKG-R2Y2-1020）——不需要瀏覽器。照 AA_325 每一件第 7 節給 BB 的驗收情境寫：
//   1. 2-Y2-01 語彤事件 7 新版（法服第一次值班的那一行、麵店的一次性選項、7 天／14 天、舊事件退休）；2. 2-Y2-03 K9；3. 2-Y2-04 中秋可昕那段；
//   4. 2-Y2-05 互相出題；5. 2-Y2-06 電影夜；6. 2-Y2-07 聖誕（禮物待辦、期末約會避開 12/25）；7. 2-Y2-09 打賭；8. 2-Y2-10 高雄；9. 2-Y2-11 除夕；
//  10. 2-Y2-12 情人節；11. 2-Y2-13 押金；12. 2-Y2-14 G1 大二下；13. 2-Y2-15 生日；14. 2-Y2-16 回程的公車；15. 2-Y2-17 芷若；16. 2-Y2-18 明軒；
//  17. 2-Y2-19 子晴 Q9；18. 2-Y2-20 系籃；19. 2-Y2-21 K14；20. 2-Y2-22 語彤事件 11；21. 2-Y2-23 經濟系之夜；22. 2-Y2-24 以安新 13；23. 共用檔的小改動；
//  24. AA_343 E2 CG-2b 的群組（以安新 8 的週六補讀沒去、在公法讀書會群組）。
// 台詞逐字比對 AA_325（D100）。修改前（沒有 src/y2r2_3d.js）全部 FAIL。用法：node tests/y2_round2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|HOMETOWN_LINES|NEEDED_MSGS|TERMEND|TERMEND_LINES|Y2R2|HV|MSG|MSG2_POOL)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/hometown_lines.js','src/data/needed_msgs.js','src/data/termend_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/data/msg2_pool.js','src/msg3d.js','src/outings3d.js','src/hometown3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/termend3d.js','src/data/y2b_events.js','src/y2b3d.js','src/y2r2_3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);   /* msg3d.js（MSG-2 生日按鈕）、hometown3d.js（去高雄找她）：AA_338 第 3～5 題 */
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
if(typeof Y2R2==='undefined'){ check('0. src/y2r2_3d.js 載入（Y2R2）',false); console.log('FAILED '+fails); process.exit(1); }
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},hide(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; while(G.hour>=24){ G.hour-=24; G.day++; } G.weekday=wdOf(G.day); },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); if(r) r.status='dating'; meet(id); };
const has=t=>said.some(s=>s.t===t), idx=t=>said.findIndex(s=>s.t===t), any=re=>said.some(s=>re.test(s.t));
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const to=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const tick=()=>{ Y2R2.rules(G,GM); for(const q of OUT.expire(G)) OUT.onMissed(GM,q); Y2R2.rules(G,GM); PHONE.tick(G); };
const run=(key,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ to(key,+h.toFixed(3)); tick(); } };
const ans=(id,k)=>{ const r=PHONE.answer(G,id,k); Y2R2.rules(G,GM); PHONE.tick(G); return r; };
const go=async(id,h)=>{ const q=OUT.get(G,id); if(!q) return null; G.day=q.day; G.weekday=wdOf(q.day); G.hour=h!=null?h:q.h; said=[]; opts=[]; await OUT.go(GM,q); return q; };
const play=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const miss=(id)=>{ const q=OUT.get(G,id); G.day=q.day; G.weekday=wdOf(q.day); G.hour=q.h+(q.late!=null?q.late:0.75)+0.1; for(const x of OUT.expire(G)) OUT.onMissed(GM,x); return q; };
const K=t=>'kexin:'+t;
(async()=>{
  // 0. 登記
  const IDS=['ev_kexin_good_class','ev_kexin_quiz_y2','ev_kexin_quiz_y2_video','ev_kexin_film_night','ev_kexin_xmas_y2','ev_kexin_trip_winter_y2','ev_kexin_valentine_y2','ev_kexin_lunar_eve_y2_call','ev_kexin_birthday_y2','ev_kexin_birthday_y2_call','ev_kexin_bus_home',
    'ev_kexin_summer_plan','ev_kexin_summer_plan_call','ev_econ_night_y2','ev_zhe_game_y2s2','ev_mx_3on3','ev_zhiruo_admit_call','ev_zhe_deposit','ev_midterm_walkout_y2s2','ev_zhiruo_concert','ev_zhiruo_admitted','ev_mx_m2_egg','ev_mx_m2_walk','ev_ziqing_show2','ev_yt_help_dishes'];
  check('0. 25 個事件（生日分見面、電話兩個）都在 STORY_EVENTS、id 不重複',IDS.every(i=>STORY_EVENTS.filter(e=>e.id===i).length===1),IDS.filter(i=>STORY_EVENTS.filter(e=>e.id===i).length!==1).join(','));
  check('0. 掛勾：PHONE_RULES、TALK_OPTS、ROOM_EXTRA、WAKE_AT、OUT.AFTER（打賭的宵夜改到結尾，AA_338 第 3 題；OUT.BEFORE 不再有）、MSG.askOpts 包一層',STORY.PHONE_RULES.includes(Y2R2.rules)&&STORY.TALK_OPTS.includes(Y2R2.talkOpts)&&STORY.ROOM_EXTRA.includes(Y2R2.roomExtra)&&STORY.WAKE_AT.includes(Y2R2.wakeAt)&&Array.isArray(OUT.AFTER)&&OUT.AFTER.includes(Y2R2.afterOuting)&&!OUT.BEFORE.some(f=>f===Y2R2.afterOuting||f===Y2R2.beforeOuting)&&typeof OUT.runAfter==='function'&&MSG._y2r2===true);
  { const src=fs.readFileSync(path.join(ROOT,'src/y2r2_3d.js'),'utf8'); check('0. AA_338 第 9 題：押金、訴願兩句拿掉 LEGAL_REVIEW_REQUIRED，改「AA 已核方向（AA_338 第 9 題）」',!/LEGAL_REVIEW_REQUIRED/.test(src)&&(src.match(/AA 已核方向（AA_338 第 9 題）/g)||[]).length===2); }
  check('0. index.html 在 GAME.boot() 前面載入 src/y2r2_3d.js',(()=>{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const a=h.indexOf('src/y2r2_3d.js'), b=h.indexOf('GAME.boot()'), c=h.indexOf('src/story3d.js'), d=h.indexOf('src/outings3d.js'); return a>0&&a<b&&a>c&&a>d; })());
  check('0. 日子對：9/18 週五、10/21 週三、10/23 週五、12/11 週五、12/25 週五、1/14 週四、2/5 週五、4/24 週六、5/8 週六、5/12 週三、5/28 週五、5/29 週六、6/2 週三、6/4 週五、6/12 週六',
    [['2026-09-18',5],['2026-10-21',3],['2026-10-23',5],['2026-12-11',5],['2026-12-25',5],['2027-01-14',4],['2027-02-05',5],['2027-04-24',6],['2027-05-08',6],['2027-05-12',3],['2027-05-28',5],['2027-05-29',6],['2027-06-02',3],['2027-06-04',5],['2027-06-12',6]].every(([k,w])=>wdOf(D(k))===w));

  // 1. 2-Y2-01 語彤事件 7 新版
  check('1. 舊的 ev_y2_yt_duty、ev_y2_yt_duty_heard 標 retired',!!ev('ev_y2_yt_duty').retired&&!!ev('ev_y2_yt_duty_heard').retired);
  fresh('2026-09-26',9.5,'wancai',{lawclub:true}); meet('heroine_05');
  check('1. 9/26 語彤不在法服（YT_FAFU no）＝照常值班',STORY.fafuShiftable(G));
  picks=[0,0,0,0]; said=[]; await STORY.fafuShift(GM);
  { const a=idx('（隔壁桌，一個阿伯講了十分鐘，一直在講他兒子。大家都在翻六法。）'), b=said.findIndex(s=>/^（初談紀錄，一頁。/.test(s.t));
    check('1. 大二第一次值班：「隔壁桌，一個阿伯……」在「初談紀錄，一頁。」前面；記 FAFU_FIRST_SHIFT_Y2',a>=0&&b>a&&G.flags.FAFU_FIRST_SHIFT_Y2===D('2026-09-26'),JSON.stringify(said.map(s=>s.t))); }
  to('2026-10-10',9.5); G.flags.LAWCLUB_SAT_LAST=null; said=[]; picks=[0,0,0,0]; G.day=D('2026-10-24'); G.weekday=6; await STORY.fafuShift(GM);
  check('1. 第二次值班沒有那一行',!has('（隔壁桌，一個阿伯講了十分鐘，一直在講他兒子。大家都在翻六法。）')&&G.flags.FAFU_FIRST_SHIFT_Y2===D('2026-09-26'));
  const yto=(key,lv,extra)=>{ fresh(key,18,'noodle',Object.assign({lawclub:true,FAFU_FIRST_SHIFT_Y2:D('2026-09-26')},extra||{})); R('heroine_03',lv||'FAM'); return Y2R2.talkOpts(G,'heroine_03',GM).map(o=>o.t); };
  check('1. Y1 9/29 麵店：「禮拜六法服第一次值班。」',JSON.stringify(yto('2026-09-29'))===JSON.stringify(['禮拜六法服第一次值班。']),JSON.stringify(yto('2026-09-29')));
  check('1. Y2 10/6（第 10 天）：「前兩個禮拜，法服第一次值班。」',JSON.stringify(yto('2026-10-06'))===JSON.stringify(['前兩個禮拜，法服第一次值班。']));
  check('1. Y4 第 15 天（10/11）沒有；只是認識（不到 FAMILIAR）沒有；不是法服成員沒有；不在麵店沒有',yto('2026-10-11').length===0&&yto('2026-09-29','ACQ').length===0&&yto('2026-09-29','FAM',{lawclub:false}).length===0&&(()=>{ yto('2026-09-29'); G.zone='cafe'; return Y2R2.talkOpts(G,'heroine_03',GM).length===0; })());
  yto('2026-10-01'); { const fam0=SOCIAL.rel('heroine_03').fam, o=Y2R2.talkOpts(G,'heroine_03',GM)[0]; said=[]; picks=[1]; await o.run(GM,{name:'陳語彤',charId:'heroine_03'});
    const W=['來的人多嗎？','一個阿伯講了十分鐘，大家都在翻六法。','他是不是一直講他兒子？','妳怎麼知道？','來店裡的阿伯都這樣。重點通常在最後一句。','（她把你的碗收走，又走回來。）','最後一句是什麼？','那就是那個了。','（她沒有再說。）'];
    check('1. 麵店那段逐字（AA_11）、兩選一、選「他兒子不回家」',JSON.stringify(said.map(s=>s.t))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「……我沒聽到。大家都在翻書。」','「他說，他兒子不回家。」']),JSON.stringify(said.map(s=>s.t)));
    check('1. YT_DUTY_HEARD、ev_yt_shift_chat 記成演過、語彤熟悉 +1；之後沒有這個選項',G.flags.YT_DUTY_HEARD===true&&!!G.events.done.ev_yt_shift_chat&&SOCIAL.rel('heroine_03').fam===fam0+1&&Y2R2.talkOpts(G,'heroine_03',GM).length===0); }
  yto('2026-10-01'); { const o=Y2R2.talkOpts(G,'heroine_03',GM)[0]; said=[]; picks=[0]; await o.run(GM,{name:'陳語彤'}); check('1. 選「……我沒聽到。」→「下次聽完再翻。」',said[said.length-1].t==='下次聽完再翻。'); }

  // 2. 2-Y2-03 K9
  fresh('2026-09-17',20,'dorm'); run('2026-09-17',20.5,21.5); check('2. 不是交往中：沒有 9/17 那則',!PHONE.sent(G,'y2r2_k9_ask'));
  fresh('2026-09-17',20,'dorm'); date('kexin'); run('2026-09-17',20.5,21.5);
  check('2. 9/17 21:00「明天五點半，河堤。不用帶東西，帶耳朵就好。」可以回',txt('p:kexin').includes(K('明天五點半，河堤。不用帶東西，帶耳朵就好。'))&&!!PHONE.byAsk(G,'y2r2_k9_ask'));
  ans('y2r2_k9_ask',0); check('2. 「好。」→「嗯。」→ 排 9/18 17:30 公館河濱',txt('p:kexin').includes(K('嗯。'))&&(q=>q&&q.day===D('2026-09-18')&&q.h===17.5&&q.ev==='ev_kexin_good_class')(OUT.get(G,'y2r2_k9')));
  await go('y2r2_k9',17); picks=[];
  { const W=['（她坐在河堤的階梯上，手機蓋在包包上面。）','我找到一門會讓我上課不想滑手機的課。','老師講規則怎麼改變人的行為。罰款高一點，大家就真的慢下來嗎？','經濟系那半年沒有白念。我現在看得懂規則為什麼這樣訂。','一個多月。','（她看了你一眼。）','……你那一個多月，學會的是怎麼辦休學。','（六點半，她說要回山上。你陪她走到公車站。）'];
    check('2. K1 河堤逐字（「那半年」、選項「那一個多月」）',JSON.stringify(said.slice(0,8).map(s=>s.t))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「我那一個多月也沒白念。」','「罰款高一點，大家會慢下來嗎？」','「妳講到眼睛會亮。」']),JSON.stringify(said.map(s=>s.t)));
    check('2. KX_K9 met、KX_DIR.Y2 rules；沒有假設題',G.flags.KX_K9==='met'&&G.flags.KX_DIR&&G.flags.KX_DIR.Y2==='rules'&&!any(/假設/)); }
  run('2026-09-18',20.5,21.5); check('2. 見到了：21:00 沒有訊息',!PHONE.sent(G,'y2r2_k9_msg'));
  fresh('2026-09-17',20,'dorm'); date('kexin'); run('2026-09-17',20.5,21.5); ans('y2r2_k9_ask',0); miss('y2r2_k9'); run('2026-09-18',18,21.25);
  check('2. K2 答應了沒到：21:00「我等了二十分鐘。」＋三則、可以回',JSON.stringify(txt('p:kexin').slice(-4))===JSON.stringify([K('我等了二十分鐘。'),K('我找到一門上課不想滑手機的課。'),K('老師講規則怎麼改變人的行為。罰款高一點，大家就真的慢下來嗎？'),K('📷（她的筆記，畫了一條路和一張罰單）')])&&G.flags.KX_K9==='missed'&&G.flags.KX_DIR.Y2==='rules',JSON.stringify(txt('p:kexin')));
  ans('y2r2_k9_msg',0); check('2. 回「會嗎？」→「有些人會。有些人換一條路。」',txt('p:kexin').slice(-1)[0]===K('有些人會。有些人換一條路。'));
  fresh('2026-09-17',20,'dorm'); date('kexin'); run('2026-09-17',20.5,21.5); ans('y2r2_k9_ask',1); run('2026-09-18',17,21.25);
  check('2. 婉拒：「好。那我用打的。」、沒有出遊、21:00 三則（沒有「我等了」）',txt('p:kexin').includes(K('好。那我用打的。'))&&!OUT.get(G,'y2r2_k9')&&!txt('p:kexin').includes(K('我等了二十分鐘。'))&&txt('p:kexin').includes(K('📷（她的筆記，畫了一條路和一張罰單）')));

  // 3. 2-Y2-04 中秋
  fresh('2026-09-24',20,'dorm',{KX_MET_NOODLE_TEAM:true,KX_JOKE:'kexin'}); date('kexin'); run('2026-09-24',21,21.75);
  check('3. 見過麵店團：9/24 21:30 兩則（不是問句）',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('今年予樂是活動長，我先去幫她顧火。'),K('烤完我帶玉米過去。')]));
  await play('ev_y2_midautumn',['用筷子']);
  { const W=['（她到的時候，炭已經是第二輪了。她提著一袋玉米。）','冷笑話，第二回合。','好。今年我帶了新的。','月亮為什麼中秋特別圓？……因為它也吃了月餅。','……妳有練。','（看了一眼烤肉架）……你們在用筷子烤？','借烤肉架的人，只借到一支夾子。','（她看了你一眼，把玉米放上架子，用筷子翻。）'];
    const i=idx(W[0]); check('3. M1 第二輪才到；冷笑話「今年我帶了新的」；筷子三句（逐字、順序）',i>=0&&JSON.stringify(said.slice(i).map(s=>s.t))===JSON.stringify(W)&&G.flags.MA_Y2_TONGS==='chop',JSON.stringify(said.map(s=>s.t))); }
  G.events.done.ev_y2_midautumn=1; run('2026-09-25',20.5,21.25); check('3. 有去、她也來：21:00 沒有照片',!PHONE.sent(G,'y2r2_ma_photo'));
  fresh('2026-09-25',17,'dorm',{KX_MET_NOODLE_TEAM:true,KX_JOKE:'zhe'}); date('kexin'); await play('ev_y2_midautumn',['便利商店']);
  check('3. 大一阿哲贏：「去年輸你。今年我帶了新的。」；買夾子＝沒有筷子三句',has('去年輸你。今年我帶了新的。')&&!has('好。今年我帶了新的。')&&!has('（看了一眼烤肉架）……你們在用筷子烤？')&&!has('借烤肉架的人，只借到一支夾子。'),JSON.stringify(said.map(s=>s.t)));
  fresh('2026-09-25',17,'dorm',{}); await play('ev_y2_midautumn',['用筷子']); check('3. 不是交往中：群戲照舊、沒有她',!any(/玉米/)&&has('對嘛。')||!any(/玉米/));
  fresh('2026-09-24',20,'dorm',{}); date('kexin'); run('2026-09-24',21,21.75); run('2026-09-25',18,21.25);
  check('3. M2 她沒見過麵店團：9/24 沒有；9/25 21:00 三則照片',!PHONE.sent(G,'y2r2_ma_pre')&&JSON.stringify(txt('p:kexin'))===JSON.stringify([K('📷（政大的烤肉，炭火旁邊一排玉米）'),K('予樂今年是活動長。我被派去顧火。'),K('……玉米還是我們的好。')]),JSON.stringify(txt('p:kexin')));
  fresh('2026-09-24',20,'dorm',{KX_MET_NOODLE_TEAM:true}); date('kexin'); run('2026-09-24',21,21.75); run('2026-09-25',18,21.25);
  check('3. 說要來、祐廷沒去：照片前面「你不在，我就沒過去了。」',txt('p:kexin')[2]===K('你不在，我就沒過去了。')&&txt('p:kexin').length===6,JSON.stringify(txt('p:kexin')));

  // 4. 2-Y2-05 互相出題
  fresh('2026-10-09',20,'dorm',{KX_K6_EXAM:true}); date('kexin'); run('2026-10-09',20.5,21.25);
  check('4. 10/9 21:00 三則（做過 K6：「規則照舊……」；AA_343 E4：「期中前那個週五，晚上六點半」）',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('這學期起，期中、期末前都互相出題。'),K('規則照舊，只能出老師上課講過的。'),K('第一次：期中前那個週五，晚上六點半，山下那一攤。不能來就視訊，題目照出。')]),JSON.stringify(txt('p:kexin')));
  ans('y2r2_q_ask',0); { const q=OUT.get(G,'y2r2_q'); check('4. 「好。」→「好。題目不要先給我看。」→ 10/23（五）18:30 山下（不是 10/17、不是舊的 10/25 中午；AA_343 E4）',txt('p:kexin').includes(K('好。題目不要先給我看。'))&&q&&q.day===D('2026-10-23')&&q.h===18.5&&q.ev==='ev_kexin_quiz_y2'&&G.flags.KX_QUIZ_MODE_Y2==='meet');
    check('4. 出發選單 17:50（開車約 40 分鐘）',!!q&&Math.abs(q.h-q.travelH-(17+50/60))<1e-6&&q.travel==='開車約 40 分鐘',q&&JSON.stringify({h:q.h,travelH:q.travelH})); }
  { const Q0=JSON.stringify(G.flags.KX_QUIZ||null); await go('y2r2_q',17.8); picks=[];
    check('4. Q1 開頭「上次你出的那題，我回去查了兩天。」',said[0]&&said[0].t==='上次你出的那題，我回去查了兩天。');
    check('4. 選項三個（新寫）、預設第一個＝「定義？……你在暖身。」；共通、湯餃',JSON.stringify(opts[0])===JSON.stringify(['「簡單的（上課講過的定義）」','「中等的（課本後面的例題）」','「冷門的（某一說的少數見解）」'])&&has('定義？……你在暖身。')&&has('（換她出題。三題都是物權：誰的房子、誰的地、誰先登記。）')&&has('……好，吃飯。湯餃我已經點了。')&&G.flags.KX_QUIZ_Y2S1==='easy');
    check('4. Q3 不記勝負（KX_QUIZ 不變）、沒有比分',JSON.stringify(G.flags.KX_QUIZ||null)===Q0&&!any(/輸|贏|比分|戰績/)); }
  fresh('2026-10-09',20,'dorm',{}); date('kexin'); run('2026-10-09',20.5,21.25); check('4. 沒做過 K6：「只能出老師上課講過的。冷門學說算犯規。」',txt('p:kexin')[1]===K('只能出老師上課講過的。冷門學說算犯規。'));
  ans('y2r2_q_ask',1); { const q=OUT.get(G,'y2r2_q'); check('4. 視訊也是 10/23 18:30「接起來」',!!q&&q.day===D('2026-10-23')&&q.h===18.5&&q.travelH===0&&q.verb==='接起來'); } await go('y2r2_q',18.4); picks=[];
  check('4. 視訊：「可以。你自己準備晚餐。」（AA_343 E4，不是「午餐」）；開頭「先說好……」；最後「……好，吃飯。你那邊吃什麼？」',txt('p:kexin').includes(K('可以。你自己準備晚餐。'))&&!txt('p:kexin').includes(K('可以。你自己準備午餐。'))&&OUT.get(G,'y2r2_q').ev==='ev_kexin_quiz_y2_video'&&said[0].t==='先說好，題目只能出上課講過的。'&&has('……好，吃飯。你那邊吃什麼？'));
  fresh('2026-10-09',20,'dorm',{}); date('kexin'); run('2026-10-09',20.5,21.25); said=[]; picks=['冷門']; await EVENTS.run(ev('ev_kexin_quiz_y2'));
  check('4. Q2 選冷門：「冷門學說不算。」（她把題目紙翻過去。）「……出一題人真的會遇到的。」；沒有「你請」',has('冷門學說不算。')&&has('（她把題目紙翻過去。）')&&has('……出一題人真的會遇到的。')&&!any(/你請|判你輸/)&&G.flags.KX_QUIZ_Y2S1==='hard');
  fresh('2026-10-09',20,'dorm',{}); date('kexin'); run('2026-10-09',20.5,21.25); run('2026-10-21',20.75,21.25);
  { const rm=TH('p:kexin').find(m=>m.tag==='y2r2_q_remind'); check('4. 不回：10/21（三）21:00「週五晚上。你還沒回。」（AA_343 E4；不是 10/23「週日中午。」）',!!rm&&rm.day===D('2026-10-21')&&Math.abs(rm.h-21)<0.3&&rm.text==='週五晚上。你還沒回。'&&!txt('p:kexin').includes(K('週日中午。你還沒回。')),rm&&JSON.stringify(rm)); }
  run('2026-10-23',17,19.25); check('4. 不回：10/23 19:15 還沒有「沒去」那兩則',!PHONE.sent(G,'y2r2_q_missed'));
  run('2026-10-23',19.5,19.75);
  { const ms=TH('p:kexin').filter(m=>m.tag==='y2r2_q_missed'); check('4. 不回：10/23 19:30 兩則、KX_QUIZ_Y2S1 missed',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('📷（一張題目紙，三題）'),K('這三題留到期末。')])&&ms.length===2&&ms[0].day===D('2026-10-23')&&Math.abs(ms[0].h-19.5)<0.3&&G.flags.KX_QUIZ_Y2S1==='missed',JSON.stringify(ms)); }
  run('2026-12-20',20.75,21.25); check('4. 12/20 21:00 期末前三則、可以回',JSON.stringify(txt('p:kexin').slice(-3))===JSON.stringify([K('期末的題目。'),K('📷（她手寫的三題）'),K('寫完拍照傳我。我的也傳給你了。')]));
  ans('y2r2_q_final',0); check('4. 回「好。我寫完傳妳。」→「嗯。不用急。」',txt('p:kexin').slice(-1)[0]===K('嗯。不用急。'));

  // 5. 2-Y2-06 電影夜
  fresh('2026-12-04',20,'dorm',{YL_IMPRESSION:'funny'}); date('kexin'); run('2026-12-04',20.75,21.25);
  check('5. 12/4 21:00 兩則',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('下週五系上電影夜。予樂說每個人要帶一個外系的朋友。'),K('你是我的外系。')]));
  run('2026-12-09',20.75,21.25); check('5. 不回：12/9 21:00「週五。你還沒回。」',txt('p:kexin').slice(-1)[0]===K('週五。你還沒回。'));
  ans('y2r2_f_ask',0); await go('y2r2_film',18.5); picks=[];
  check('5. F1 予樂「這是很好笑的司機。」；沒去過淡水＝可昕介紹邵鈞和詹靖',has('這是很好笑的司機。')&&!has('這是我的外系。')&&has('這是邵鈞，考古題有目錄的那個。這是詹靖，什麼都拍。')&&has('破冰。每個人講一樣，你包包裡最沒用的東西。'));
  check('5. F2 破冰三個選項沒有「假設題」；收尾逐字；KX_NCCU_FRIENDS、KX_FILM_NIGHT went',JSON.stringify(opts[0])===JSON.stringify(['「一把傘。今天沒下雨。」','「去年的考古題。」','「可昕上次借我的筆。」'])&&has('誠實。司機加一分。')&&has('外系的，一個都沒少。')&&has('……回去開車小心。到了跟我說。')&&G.flags.KX_NCCU_FRIENDS===true&&G.flags.KX_FILM_NIGHT==='went'&&!any(/假設/));
  fresh('2026-12-04',20,'dorm',{}); date('kexin'); SOCIAL.remember('kexin','ENC_D13_KX',''); said=[]; picks=['筆']; await EVENTS.run(ev('ev_kexin_film_night'));
  check('5. 沒有 YL_IMPRESSION＝可昕「這是我的外系。」；見過邵鈞＝「邵鈞你見過了。……」；選筆＝「那不是沒用的。還我。」「司機扣一分。」',has('這是我的外系。')&&has('邵鈞你見過了。這是詹靖，什麼都拍。')&&has('那不是沒用的。還我。')&&has('司機扣一分。'));
  fresh('2026-12-04',20,'dorm',{}); date('kexin'); run('2026-12-04',20.75,21.25); ans('y2r2_f_ask',1); run('2026-12-11',18,21.75);
  check('5. F3 婉拒：「……好。我跟予樂說你在忙。」；12/11 21:30 照片＋「下次。」；KX_FILM_NIGHT missed',txt('p:kexin').includes(K('……好。我跟予樂說你在忙。'))&&JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('📷（電影夜的教室，一排椅子，她旁邊那張空著）'),K('下次。')])&&G.flags.KX_FILM_NIGHT==='missed');

  // 6. 2-Y2-07 聖誕
  fresh('2026-12-18',20,'dorm'); date('kexin'); run('2026-12-18',20.75,21.25);
  check('6. X1 12/18 21:00「……第一頁是吃的，第二頁才是地點。」「六點半，公館。我下山。」',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('聖誕晚上，我排了行程。第一頁是吃的，第二頁才是地點。'),K('六點半，公館。我下山。')]));
  ans('y2r2_x_ask',0); run('2026-12-23',9,10); check('6. 12/24 以前沒有禮物待辦',!PHONE.sent(G,'y2r2_x_gift'));
  run('2026-12-24',8.5,9.5); { const m=PHONE.byAsk(G,'y2r2_x_gift'); check('6. 12/24 起手機多一項「準備可昕的聖誕禮物」三選一',!!m&&m.text==='準備可昕的聖誕禮物'&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['一條圍巾','她說想看的那本書','一副手套'])); }
  ans('y2r2_x_gift',1); check('6. 選「她說想看的那本書」＝KX_XMAS_GIFT_Y2 book（不替你傳訊息）',G.flags.KX_XMAS_GIFT_Y2==='book'&&!TH('sys').some(m=>m.from==='player'));
  await go('y2r2_xmas',18.2); picks=['第二頁'];
  { const q=OUT.get(G,'y2r2_xmas'); check('6. 12/25 18:30 公館',q.day===D('2026-12-25')&&q.h===18.5); }
  check('6. 公館三選一、河濱、卡片「明年的第二頁，你排。」、「……我回去再拆。」、收尾',has('第一頁。今天要吃的。')&&JSON.stringify(opts[0])===JSON.stringify(['「三樣吃得完嗎？」','「紅豆餅我去排。」','「第二頁寫什麼？」'])&&has('（卡片上只有一行：明年的第二頁，你排。）')&&has('……我回去再拆。')&&has('（你送她到公車站。上車以前，她把行程表摺好，塞進你外套的口袋。）')&&G.flags.KX_XMAS[2]==='went');
  { const L=[]; Y2R2.roomExtra(G,L); check('6. 房間物件「她的聖誕卡片」',L.some(x=>x[0]==='她的聖誕卡片'&&x[1]==='明年的第二頁，你排。')); }
  fresh('2026-12-18',20,'dorm'); date('kexin'); run('2026-12-18',20.75,21.25); ans('y2r2_x_ask',0); await go('y2r2_xmas',18.2); check('6. 沒選禮物：出發時自動「一條圍巾」',G.flags.KX_XMAS_GIFT_Y2==='scarf');
  fresh('2026-12-18',20,'dorm'); date('kexin'); run('2026-12-18',20.75,21.25); ans('y2r2_x_ask',1); run('2026-12-25',18,21.25);
  check('6. X2 婉拒：「……好。行程表我先留著。」；12/25 21:00「第二頁，明年。」；KX_XMAS[2] missed',txt('p:kexin').includes(K('……好。行程表我先留著。'))&&JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('📷（行程表的第一頁）'),K('第二頁，明年。')])&&G.flags.KX_XMAS[2]==='missed');
  fresh('2026-12-25',9,'dorm'); date('kexin'); { const w=TERMEND.windowOf('Y2S1'), K0=TERMEND_LINES.KX.Y2S1, P=TERMEND_LINES.KX_PLACE[K0.place]; const d=TERMEND.dinnerDay(G,w,{h:P.h,wd:K0.wd},'kexin');
    check('6. X3 可昕大二上的期末約會不排在 12/25',d!=null&&d!==D('2026-12-25'),String(d!=null?CALENDAR.dateOf(d).key:d)); }

  // 7. 2-Y2-09 打賭
  fresh('2026-12-24',20,'dorm'); date('kexin'); run('2026-12-24',20.75,21.25);
  check('7. 12/24 21:00（期末最後一科那晚）兩則',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('今年換一種。打賭。'),K('成績出來，誰先問對方考得怎樣，誰請宵夜。')]));
  ans('y2r2_bet1',1); check('7. 「這個賭局對我不利。」→「所以才叫打賭。」',txt('p:kexin').slice(-1)[0]===K('所以才叫打賭。'));
  run('2027-01-11',9.5,10.25); { const m=PHONE.byAsk(G,'y2r2_bet_Y2S1'); check('7. 1/11 10:00 系統字＋兩選一',!!m&&m.th==='sys'&&m.text==='成績出來了。要先傳訊息問她嗎？'&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['問。','等她先問。'])); }
  ans('y2r2_bet_Y2S1',0); Y2R2.rules(G,GM); PHONE.tick(G);
  check('7. G1「問。」：祐廷「成績出來了。妳考得怎樣？」→「你輸了。」「……都過了吧？那你請得很開心。」；asked',JSON.stringify(txt('p:kexin').slice(-3))===JSON.stringify(['player:成績出來了。妳考得怎樣？',K('你輸了。'),K('……都過了吧？那你請得很開心。')])&&G.flags.KX_GRADES_Y2S1==='asked',JSON.stringify(txt('p:kexin').slice(-4)));
  ans('y2r2_bet_Y2S1_a',0); check('7. 回「都過了。」→「很好。」',txt('p:kexin').slice(-1)[0]===K('很好。'));
  /* AA_338 第 3 題：打賭的宵夜那句改到「那一趟出遊的結尾（分開以前）」，每一種出遊都一樣（出遊的事件、校外約會、去高雄找她）。真的走一趟 OUT.go */
  STORY_EVENTS.push({id:'ev_t_kx_meet',title:'測試：見面',participants:['kexin'],location:'any',trigger:'outing',background:'dark',hours:1,dialogue:[{speaker:null,text:'（測試：她坐在對面。）'},{speaker:'kexin',text:'（測試：最後一句。）'}]},
    {id:'ev_t_kx_away',title:'測試：她先走',participants:['kexin'],location:'any',trigger:'outing',background:'dark',hours:1,kxAway:true,dialogue:[{speaker:null,text:'（測試：她先上車了。）'}]});
  const tplan=(id,ev,o)=>OUT.plan(G,Object.assign({id,ev,day:G.day,h:Math.min(23,G.hour+1),late:0.75,place:'測試',title:'測試',travel:'',travelH:0},o||{}));
  { tplan('t_away','ev_t_kx_away'); await go('t_away'); check('7. 結尾她不在場的出遊（kxAway）不說、留到下一次',has('（測試：她先上車了。）')&&!has('（這次是你請。）')&&!G.flags.KX_BET_Y2S1_PAID,JSON.stringify(said.map(s=>s.t)));
    tplan('t_meet','ev_t_kx_meet'); await go('t_meet'); const a=idx('（測試：最後一句。）'), b=idx('（這次是你請。）');
    check('7. 下一次見面：旁白「（這次是你請。）」在那一趟出遊的結尾（事件演完以後的最後一句，不在開頭）；只一次',a>=0&&b>a&&said[said.length-1].t==='（這次是你請。）'&&said.filter(s=>s.t==='（這次是你請。）').length===1&&G.flags.KX_BET_Y2S1_PAID===true,JSON.stringify(said.map(s=>s.t)));
    tplan('t_meet2','ev_t_kx_meet'); await go('t_meet2'); check('7. 付過就不再說',has('（測試：最後一句。）')&&!has('（這次是你請。）')); }
  fresh('2026-12-24',20,'dorm'); date('kexin'); run('2026-12-24',20.75,21.25); run('2027-01-11',9.5,10.25); ans('y2r2_bet_Y2S1',1); run('2027-01-11',23.5,23.9,0.125);
  check('7. G2「等她先問。」：23:50「……我輸了。我撐到現在。你呢？」；waited',txt('p:kexin').slice(-1)[0]===K('……我輸了。我撐到現在。你呢？')&&G.flags.KX_GRADES_Y2S1==='waited');
  ans('y2r2_bet_Y2S1_w',0); check('7. 回「都過了。」→「我也是。宵夜我請。」',txt('p:kexin').slice(-1)[0]===K('我也是。宵夜我請。'));
  { said=[]; await Y2R2.afterOuting(GM,{id:'v',verb:'接起來',place:'視訊'},{participants:['kexin']}); check('7. 視訊不算見面',said.length===0&&!G.flags.KX_BET_Y2S1_PAID); }
  { const save=global.DATE; global.DATE={trip:()=>({who:'kexin',locs:['t_loc'],transport:'mrt',fare:0}),loc:()=>({id:'t_loc'}),scene:async(gm)=>{ await gm.say(null,'（測試：約會的最後一個地方。）'); },travel:()=>({minutes:30})};   /* 假的校外約會（date3d.js 沒載）*/
    try{ tplan('t_date',null,{dateTrip:'t_trip'}); await go('t_date'); } finally { if(save===undefined) delete global.DATE; else global.DATE=save; }
    const a=idx('（測試：約會的最後一個地方。）'), b=idx('（這次是她請。）');
    check('7. 校外約會也一樣：「（這次是她請。）」在約會演完以後（結尾）',a>=0&&b>a&&G.flags.KX_BET_Y2S1_PAID===true,JSON.stringify(said.map(s=>s.t))); }
  run('2027-06-11',20.75,21.25); check('7. 大二下最後一科那晚：「再賭一次。」「上次我輸了。這次我練過了。」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('再賭一次。'),K('上次我輸了。這次我練過了。')]),JSON.stringify(txt('p:kexin').slice(-3)));
  run('2027-06-28',9.5,10.25); ans('y2r2_bet_Y2S2',1); run('2027-06-28',23.5,23.9); check('7. 6/28 等：23:50 還沒',!PHONE.sent(G,'y2r2_bet_Y2S2_waited'));
  to('2027-06-29',10/60+0.001); tick(); { const m=TH('p:kexin').slice(-1)[0]; check('7. G2 6/29 00:10「……我撐過午夜了。可是還是我先問。我輸了。」',m.text==='……我撐過午夜了。可是還是我先問。我輸了。'&&m.day===D('2027-06-29')&&Math.abs(m.h-(10/60))<0.02&&G.flags.KX_GRADES_Y2S2==='waited',JSON.stringify(m)); }
  fresh('2026-12-24',20,'dorm',{KX_GRADES_Y2S1:'asked'}); date('kexin'); run('2027-06-11',20.75,21.25); check('7. 大二上 asked：多「上次你請。這次你也會請。」',txt('p:kexin').slice(-1)[0]===K('上次你請。這次你也會請。'));

  // 8. 2-Y2-10 高雄
  fresh('2026-12-28',20,'dorm'); date('kexin'); run('2026-12-28',20.75,21.25);
  check('8. 12/28 21:00（大一春假沒和她去）四則：「……你可以下來嗎？」「一天也算。」',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('寒假的行程表做好了。這次在高雄。'),K('一月十四號。第一頁是夜市，你還沒去過的那個。'),K('你可以下來嗎？'),K('一天也算。')]),JSON.stringify(txt('p:kexin')));
  G.money=1000; check('8. 高鐵票錢不夠（2980）不能選「可以。」',ans('y2r2_kh_ask',0)===null&&!G.flags.KX_KH_Y2);
  G.money=5000; ans('y2r2_kh_ask',0); { const q=OUT.get(G,'y2r2_kh'); check('8. 「可以。」→「好。幾點的車，我去接你。」→ 1/14 14:00',txt('p:kexin').slice(-1)[0]===K('好。幾點的車，我去接你。')&&q&&q.day===D('2027-01-14')&&q.h===14); }
  G.flags.KX_GRADES_Y2S1='asked'; await go('y2r2_kh',12.4); picks=[0];
  check('8. H1 左營接人（第一次 pick）、夜市三句、打賭「成績那一攤，你請。說好的。」（這次是你請。）',has('（左營站。出口外面的太陽比臺北大。她站在柱子旁邊，戴著帽子。）')&&has('你真的來了。')&&has('（一月的高雄，傍晚還有二十度。夜市的燈從巷口一路亮到底。）')&&has('一攤只能買一樣。吃不完的你吃。')&&has('成績那一攤，你請。說好的。')&&has('（這次是你請。）')&&G.flags.KX_BET_Y2S1_PAID===true,JSON.stringify(said.map(s=>s.t)));
  check('8. 三選一（新寫）、送上車 dating 兩句；高鐵 2980 照扣；KX_TRIP.Y2W kaohsiung；21:00 回到臺北',JSON.stringify(opts[0])===JSON.stringify(['「妳從小吃到大的是哪一攤？」','「六攤吃得完嗎？」','（跟在她後面走）'])&&has('這攤。……老闆以前都多給我一顆。現在不給了。')&&has('開學我就上去了。台北見。')&&has('（她站在閘門外面，等你走到看不見。）')   /* AA_525 3-8 K-10 改句（原「開學我就上去了。……到時候換你來接我。」）*/
    &&G.money===5000-2980&&G.flags.KX_TRIP.Y2W==='kaohsiung'&&G.day===D('2027-01-14')&&Math.abs(G.hour-21)<0.01,G.money+' '+G.hour);
  { const L=[]; Y2R2.roomExtra(G,L); check('8. 房間物件「旅行照片：高雄的夜市」',L.some(x=>x[0]==='旅行照片：高雄的夜市'&&x[1]==='她拿著第一攤的東西，後面的燈全糊了。你拍的。')); }
  /* AA_338 第 4 題：1/14 這一趟算進「第一次／再來」的輪替 */
  /* AA_343 A4（改了這一項的期待值）：1/14 是夜市——下一次先演港邊（first），again 第一輪跳過夜市、從下雨開始，輪完一圈夜市照常回來 */
  check('8. 1/14 算進輪替：HV_N.kexin 記 1；之後去高雄找她（hometown3d）先演港邊（first），不是又一次夜市（AA_343 A4）',(G.flags.HV_N||{}).kexin===1&&HV.pickVariant(G,'kexin',false)==='first'&&JSON.stringify(G.flags.HV_PRE)===JSON.stringify({kexin:{v:'night',at:0}}),JSON.stringify([G.flags.HV_N,G.flags.HV_PRE,HV.pickVariant(G,'kexin',false)]));
  { const F=G.flags, n0=F.HV_N.kexin, seq=[2,3,4,5,6,7].map(n=>{ F.HV_N.kexin=n; return HV.pickVariant(G,'kexin',false); }); F.HV_N.kexin=n0;
    check('8. A4 之後的輪替：港邊 → 下雨 → 河邊 → 夜市 → 下雨 → 河邊 → 夜市（第一輪跳過夜市）',JSON.stringify(seq)===JSON.stringify(['rain','river','night','rain','river','night']),JSON.stringify(seq)); }
  { const day=D('2027-01-20'); OUT.plan(G,{id:'hv_kexin_t',ev:'ev_hv_kx',day,h:10.5,late:1,place:'高雄',title:'去高雄找可昕',travel:'高鐵約一個半小時',travelH:1.5,back:'回到臺北。',hv:{id:'kexin',keep:false}}); picks=[0]; await go('hv_kexin_t');
    check('8. 1/14 去過的：之後去高雄接人用「再來」那一版（pickAgain「這次換這頂安全帽了。……上車。」，沒有第一次的「你真的來了。」）',has('這次換這頂安全帽了。……上車。')&&!has('你真的來了。')&&(G.flags.HV_N||{}).kexin===2,JSON.stringify(said.map(s=>s.t)));
    check('8. A4 那一次的中間是港邊（first）：「（你們坐在港邊的長椅上……）」，沒有夜市「這攤我從小吃到大。」；下一次是下雨',has('（你們坐在港邊的長椅上，看船慢慢進來。她買了兩支冰。）')&&has('這裡我國中常來。那時候覺得臺北好遠。')&&!has('這攤我從小吃到大。……你吃得完再說。')&&HV.pickVariant(G,'kexin',false)==='rain',JSON.stringify(said.map(s=>s.t))); }
  { const F={HV_N:{kexin:1},HV_PRE:{kexin:{v:'night',at:1}}}; const g={flags:F}, seq=[2,3,4,5].map(n=>{ F.HV_N.kexin=n; return HV.pickVariant(g,'kexin',false); });
    check('8. A4 1/14 以前已經自己去過一次（港邊演過）：之後從下雨開始、第一輪跳過夜市',JSON.stringify(seq)===JSON.stringify(['rain','river','night','rain']),JSON.stringify(seq)); }
  fresh('2026-12-28',20,'dorm',{KX_TRIP:{Y1S2:'sea'}}); date('kexin'); run('2026-12-28',20.75,21.25); check('8. 大一春假去過：三則、沒有「一天也算。」',txt('p:kexin').length===3&&txt('p:kexin')[2]===K('你可以下來嗎？'));
  ans('y2r2_kh_ask',1); check('8. H2 婉拒：「好。那春假。……行程表我會再多做一頁。」、KX_TRIP_DEFERRED spring',txt('p:kexin').slice(-1)[0]===K('好。那春假。……行程表我會再多做一頁。')&&G.flags.KX_TRIP_DEFERRED==='spring'&&!OUT.get(G,'y2r2_kh'));
  fresh('2026-12-28',20,'dorm'); date('kexin'); run('2026-12-28',20.75,21.25); ans('y2r2_kh_ask',0); to('2027-01-14',11); miss('y2r2_kh'); PHONE.tick(G);
  check('8. 答應了沒出發：「你沒上車。」「……夜市我自己去了。行程表還在。」、KX_TRIP.Y2W missed',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('你沒上車。'),K('……夜市我自己去了。行程表還在。')])&&G.flags.KX_TRIP.Y2W==='missed');
  check('8. A4 1/14 記 missed（她自己去了夜市）：不算去過，照原本的 first／again（HV_N、HV_PRE 都沒有；之後第一次＝first、第二次＝夜市）',!(G.flags.HV_N||{}).kexin&&!G.flags.HV_PRE&&HV.pickVariant(G,'kexin',false)==='first'&&(()=>{ G.flags.HV_N.kexin=1; const v=HV.pickVariant(G,'kexin',false); G.flags.HV_N.kexin=0; return v==='night'; })());

  // 9. 2-Y2-11 除夕
  fresh('2027-02-05',21,'dorm'); date('kexin'); run('2027-02-05',21.75,22.25);
  check('9. 2/5 22:00 三則',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('新年快樂。'),K('我們家在玩撲克牌。我表弟輸到哭。'),K('你們家在幹嘛？')]));
  ans('y2r2_kn',1); check('9. N1「我爸從上海帶了一箱點心。」→「你爸回來了？那你今天不要一直滑手機。」',txt('p:kexin').slice(-1)[0]===K('你爸回來了？那你今天不要一直滑手機。'));
  fresh('2027-02-05',21,'dorm'); date('kexin'); run('2027-02-05',21.75,22.25); ans('y2r2_kn',2); { const q=OUT.get(G,'y2r2_kn_call');
    check('9. 「打給妳。」＝不替你傳字、排電話（一定打、電話不用出門）',!txt('p:kexin').includes('player:打給妳。')&&!!q&&q.must&&q.call&&OUT.trip(G,q,true).travelH===0); }
  await go('y2r2_kn_call'); { const W=['（你打過去。她那邊的鞭炮聲還沒停。）','……你那邊好安靜。','（她後面有人在喊她。）','我表弟又要開一局。……你媽媽是不是也在叫你？','（客廳裡，你媽媽在叫你。）','去吧。早點睡。'];
    check('9. N2 電話逐字、沒有第二次「新年快樂」',JSON.stringify(said.slice(0,6).map(s=>s.t))===JSON.stringify(W)&&!any(/新年快樂/)&&!any(/假設/),JSON.stringify(said.map(s=>s.t))); }
  fresh('2027-02-05',21,'dorm'); date('kexin'); run('2027-02-05',21.75,22.25); run('2027-02-06',9.75,10.25);
  check('9. 不回：2/6 10:00「初一了。」「……你昨天一定被抓去打牌了。」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('初一了。'),K('……你昨天一定被抓去打牌了。')]));

  // 10. 2-Y2-12 情人節
  fresh('2027-02-08',12,'dorm',{KX_VDAY_WX:{1:'sunny'},KX_VDAY:{1:'video'}}); date('kexin'); run('2027-02-08',12,12.25);
  { const q=OUT.get(G,'y2r2_vday'); check('10. 2/14 20:00 視訊（接起來）',!!q&&q.day===D('2027-02-14')&&q.h===20&&q.verb==='接起來'); }
  await go('y2r2_vday'); picks=[];
  check('10. V1 大一晴天、今年也選晴天：「去年你說晴天，很冷。」……「跟去年一樣。」；最後「情人節快樂。開學那個週末見。」',has('你那邊的天氣？')&&has('去年你說晴天，很冷。')&&has('臺北的冬天很少晴天。……你今年運氣很好。')&&has('跟去年一樣。')&&has('情人節快樂。開學那個週末見。')&&G.flags.KX_VDAY[2]==='video'&&G.flags.KX_VDAY_WX[2]==='sunny'&&!('_y2Vwx' in G.flags));
  fresh('2027-02-08',12,'dorm',{KX_VDAY_WX:{1:'sunny'},KX_VDAY:{1:'video'}}); date('kexin'); run('2027-02-08',12,12.25); said=[]; picks=['下雨']; await EVENTS.run(ev('ev_kexin_valentine_y2'));
  check('10. 今年選不一樣：沒有「跟去年一樣。」',has('我這邊沒下，二十度。……我不是在炫耀。')&&!has('跟去年一樣。'));
  fresh('2027-02-08',12,'dorm'); date('kexin'); run('2027-02-08',12,12.25); miss('y2r2_vday'); run('2027-02-14',20.75,21);
  check('10. V2 沒接：20:30 兩則；最後「開學那個週末見。」、沒有「我們的日子」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('打了兩次。你應該在忙。'),K('你那邊的天氣，我自己查了。情人節快樂。開學那個週末見。')])&&!txt('p:kexin').some(t=>/我們的日子/.test(t))&&G.flags.KX_VDAY[2]==='missed');

  // 11. 2-Y2-13 押金
  const dep=(key,h,flags)=>{ fresh(key,h,'noodle',flags); meet('zhe'); return EVENTS.check(ev('ev_zhe_deposit')); };
  check('11. 3/23（二）18:00 麵店＝觸發；3/30 也可以；3/24、3/23 21:00、別的週二不觸發',dep('2027-03-23',18)&&dep('2027-03-30',18)&&!dep('2027-03-24',18)&&!dep('2027-03-23',21)&&!dep('2027-03-16',18)&&!dep('2027-04-06',18));
  dep('2027-03-23',18,{ZHE_CALLS_GE:true,U_LEASE:true}); G.needed={batches:[{d:1,ans:['zhe_deposit']}]}; said=[]; picks=['押金是擔保','合理'];
  await EVENTS.run(ev('ev_zhe_deposit'));
  check('11. D1 回過 zhe_deposit、哥：「哥，照片我問了。……只拍了他的球衣。」；依據三個選項；最後「週六上午去法服」',said[0].t==='哥，照片我問了。他說搬進去那天，只拍了他的球衣。'&&has('房東現在改口，說牆上有釘子洞，押金全部不退。')&&opts[0].length===3&&has('押金是擔保。房東要扣，要說得出弄壞了什麼、修要多少。正常住的痕跡不一樣。')&&has('……好啦，那個洞是他掛球衣的。')&&has('先帶租約去跟房東談。談不攏，可以申請調解。要確認的話，週六上午去法服。')&&has('好。你寫的那幾行傳給我，我轉給他。'),JSON.stringify(said.map(s=>s.t)));
  check('11. ZHE_DEPOSIT {basis lease, ask fair, day}、阿哲 ZHE_PHOTOS；押金是學長的、沒有條號',G.flags.ZHE_DEPOSIT.basis==='lease'&&G.flags.ZHE_DEPOSIT.ask==='fair'&&G.flags.ZHE_DEPOSIT.day===D('2027-03-23')&&SOCIAL.has('zhe','ZHE_PHOTOS')&&!any(/第\s*\d+\s*條|§/)&&!('_depB' in G.flags));
  run('2027-03-30',21.75,22.25); check('11. 那天之後第 7 天 22:00 阿哲三則',JSON.stringify(txt('p:zhe').slice(-3))===JSON.stringify(['zhe:學長的押金拿回來了','zhe:扣了一個洞的油漆錢','zhe:他說要請你一杯飲料 我先幫你喝了']));
  dep('2027-03-23',18,{}); said=[]; picks=[]; await EVENTS.run(ev('ev_zhe_deposit'));
  check('11. D2 沒上債各第 5 週：依據兩個選項；沒回週訊息：「我學長退租，房東本來說押金扣一半。」',opts[0].length===2&&said[0].t==='我學長退租，房東本來說押金扣一半。'&&has('他自己去問，房東改口說牆上有釘子洞，全部不退。'));

  // 12. 2-Y2-14 G1
  { const e=ev('ev_midterm_walkout_y2s2'); check('12. 考完最後一科期中（AA_375 第 8 項：法學英文 4/15；afterClass legal_english、afterExam mid、大二下）才有；翹考沒有',e.trigger==='class'&&e.afterClass==='legal_english'&&e.afterExam==='mid'&&JSON.stringify(e.term)===JSON.stringify(['Y2S2'])); }
  fresh('2027-04-20',12,'linze',{met_yu:true}); for(const id of ['heroine_03','heroine_01','classmate_xinci']) meet(id); await play('ev_midterm_walkout_y2s2');
  check('12. W1 認識全部：旁白＋五句（以安那句沒有「理由：」）',said.length===6&&has('債各的第二題，我寫了『買賣不破租賃』。……題目問的是租賃。')/* AA_375 第 8 項 */&&has('贈與那題我也寫錯了。我們一起錯。')&&has('……第二題寫完，我才發現背面還有一題。')&&has('我寫了三頁。第二題值得。')&&has('期中考完了。今天之後，我不跟你們對答案。')&&!any(/理由：/),JSON.stringify(said.map(s=>s.t)));
  fresh('2027-04-20',12,'linze',{met_yu:true}); meet('heroine_01'); await play('ev_midterm_walkout_y2s2'); check('12. W2 不認識語彤：沒有她那句',!has('……第二題寫完，我才發現背面還有一題。'));

  // 13. 2-Y2-15 生日
  fresh('2027-04-17',20,'dorm',{YL_IMPRESSION:'polite'}); date('kexin'); run('2027-04-17',20.75,21.25);
  check('13. 4/17 21:00 予樂私訊（見過予樂）；對話串名字「予樂」；四個選項',txt('p:yule')[0]==='yule:司機，可昕生日。我有一個計畫，缺一個司機。'&&PHONE.title(G,'p:yule')==='予樂'&&PHONE.byAsk(G,'y2r2_bd_ask').ask.opts.length===4);
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); check('13. 沒見過予樂：「你就是那個開車的？我是予樂。可昕生日，我們合作。」',txt('p:yule')[0]==='yule:你就是那個開車的？我是予樂。可昕生日，我們合作。');
  fresh('2027-04-17',20,'dorm',{KX_NCCU_FRIENDS:true}); date('kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',0); { const q=OUT.get(G,'y2r2_bd'); check('13. 「我載蛋糕。」→ 4/24 19:00 政大小教室',!!q&&q.day===D('2027-04-24')&&q.h===19&&q.bdV==='class'); }
  await go('y2r2_bd',18.2);
  check('13. B1 教室燈亮、「……你們。」；去過電影夜＝「邵鈞、詹靖你都見過了。今天他們是共犯。」；記 KX_BDAY2_CAKE、KX_BDAY[2] class',has('（系上小教室的燈關著。予樂、邵鈞、詹靖躲在桌子後面。可昕推門進來，燈亮。）')&&has('……你們。')&&has('邵鈞、詹靖你都見過了。今天他們是共犯。')&&!has('都躲在一起了，我還是正式介紹一次。這是邵鈞，考古題有目錄的那個。')&&SOCIAL.has('kexin','KX_BDAY2_CAKE')&&G.flags.KX_BDAY[2]==='class'&&!('_y2BdV' in G.flags));
  { fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',0); await go('y2r2_bd',18.2);
    check('13. C7 小教室生日在場（沒去過電影夜：可昕正式介紹邵鈞、詹靖）＝之後記 KX_NCCU_FRIENDS（AA_343 C7）',has('都躲在一起了，我還是正式介紹一次。這是邵鈞，考古題有目錄的那個。')&&G.flags.KX_NCCU_FRIENDS===true&&G.flags.KX_BDAY[2]==='class'); }
  fresh('2027-04-17',20,'dorm',{KX_NCCU_FRIENDS:true}); date('kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',0); await go('y2r2_bd',18.2);
  check('13. B3 最後一句「明年也這樣。你跟予樂先講好，我假裝不知道。」',(()=>{ const i=idx('明年也這樣。你跟予樂先講好，我假裝不知道。'); return i>=0&&i===said.findIndex(s=>/明年也這樣/.test(s.t)); })());
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',3); { const q=OUT.get(G,'y2r2_bd'); check('13. 「那天我只能打電話。」＝4/24 22:00 打給她（電話；電話版事件、後面不接見面的閒聊）',!!q&&q.call&&q.h===22&&q.ev==='ev_kexin_birthday_y2_call'&&!!ev(q.ev).kxAway); }
  await go('y2r2_bd'); check('13. 電話版：「予樂說你只能打電話。……電話也算。」；最後一句同；KX_BDAY[2] message',has('予樂說你只能打電話。……電話也算。')&&has('明年也這樣。你跟予樂先講好，我假裝不知道。')&&G.flags.KX_BDAY[2]==='message');
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',10); tick(); miss('y2r2_bd'); run('2027-04-25',9.75,10.25);
  check('13. B2 沒回予樂、什麼都沒做：4/25「昨天是我生日。……我等了一天。」；KX_BDAY[2] none',txt('p:kexin').slice(-1)[0]===K('昨天是我生日。……我等了一天。')&&G.flags.KX_BDAY[2]==='none',JSON.stringify(txt('p:kexin')));
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',12); G.msgChat={bday:{['kexin:2027']:D('2027-04-24')}}; tick();
  check('13. 沒回予樂、白天傳了生日快樂：先有「開車去政大」，還沒有電話',(q=>!!q&&q.bdV==='drive'&&q.h===19)(OUT.get(G,'y2r2_bd'))&&!OUT.get(G,'y2r2_bd_call'));
  await go('y2r2_bd',18.2); check('13. 自己開車去：「予樂說你沒回她。……結果你自己來了。」；KX_BDAY[2] two',has('予樂說你沒回她。……結果你自己來了。')&&G.flags.KX_BDAY[2]==='two');
  run('2027-04-24',21.5,22.5); check('13. 開車去了：不再排電話',!OUT.get(G,'y2r2_bd_call'));
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',12); G.msgChat={bday:{['kexin:2027']:D('2027-04-24')}}; tick(); miss('y2r2_bd'); tick();
  { const q=OUT.get(G,'y2r2_bd_call'); check('13. 沒開車去、傳了生日快樂：22:00 電話版',!!q&&q.ev==='ev_kexin_birthday_y2_call'&&q.h===22); }
  miss('y2r2_bd_call'); run('2027-04-25',9.75,10.25); check('13. 傳了生日快樂、沒打：4/25 不說「我等了一天」、KX_BDAY[2] message',!txt('p:kexin').includes(K('昨天是我生日。……我等了一天。'))&&G.flags.KX_BDAY[2]==='message');
  { const m=TH('p:kexin').find(x=>x.text==='電話呢。……好啦，訊息也算。'); check('13. AA_338 第 2 節：傳了訊息、電話跳過＝補一則她的私訊「電話呢。……好啦，訊息也算。」（22:30 以後才跳過的＝當下）',!!m&&m.day===D('2027-04-24')&&m.h>=22.5,JSON.stringify(m)); }
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',12); G.msgChat={bday:{['kexin:2027']:D('2027-04-24')}}; tick(); miss('y2r2_bd'); tick();
  to('2027-04-24',21.75); picks=['今天先不要']; { const q=OUT.get(G,'y2r2_bd_call'); await OUT.prompt(GM,q); } run('2027-04-24',21.8,22.6,0.05);
  { const m=TH('p:kexin').find(x=>x.text==='電話呢。……好啦，訊息也算。'); check('13. 電話那一則選「今天先不要」：22:30 她私訊「電話呢。……好啦，訊息也算。」',!!m&&m.day===D('2027-04-24')&&Math.abs(m.h-22.5)<0.02,JSON.stringify(m)); }
  /* AA_338 第 2 節：沒回予樂、當天用 MSG-2 傳生日快樂、她回問「你晚上要上山來，還是我下山」選「妳來公館」＝她回「好 九點」（這一年七點予樂她們先過）→ 21:00 公館 */
  fresh('2027-04-17',20,'dorm'); date('kexin'); INV.addContact(G,'kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',11); tick();
  { const r=MSG.send(G,'kexin','bday'); run('2027-04-24',11,12,0.05); const m=(G.msgs||[]).find(x=>x.th==='p:kexin'&&x.ask&&(x.ask.opts||[]).some(o=>o.t==='妳來公館')), o=m&&m.ask.opts.find(x=>x.t==='妳來公館');
    check('13. MSG-2 生日快樂：她回問「你晚上要上山來，還是我下山」；「妳來公館」這一年回「好 九點」',!!(r&&r.ok)&&!!m&&m.text==='你晚上要上山來，還是我下山'&&JSON.stringify((o.say||[]).map(s=>s.text))===JSON.stringify(['好 九點']),JSON.stringify(m&&m.ask));
    if(m){ PHONE.answer(G,m.ask.id,m.ask.opts.indexOf(o)); tick(); } const q=OUT.get(G,'y2r2_bd_gg'), dq=OUT.get(G,'y2r2_bd');
    check('13. 選「妳來公館」→「好 九點」；排 4/24 21:00 公館；開車去政大那一趟取消',txt('p:kexin').slice(-1)[0]===K('好 九點')&&!!q&&q.day===D('2027-04-24')&&q.h===21&&q.bdV==='gg'&&!!dq&&dq.state==='cancelled',JSON.stringify([q,dq&&dq.state,txt('p:kexin').slice(-2)])); }
  run('2027-04-24',12,20.25,0.25); check('13. 選了公館：不排電話、開車去政大那一趟不會再出來',!OUT.get(G,'y2r2_bd_call')&&OUT.get(G,'y2r2_bd').state==='cancelled'&&!OUT.due(G));
  await go('y2r2_bd_gg',20.6); { const W=['（九點，她從公車上下來，手上還拿著半塊蛋糕。）','予樂她們先幫我過了一次。……這是第二次。','明年也這樣。你跟予樂先講好，我假裝不知道。'];
    check('13. 21:00 公館：「（九點，她從公車上下來，手上還拿著半塊蛋糕。）」「予樂她們先幫我過了一次。……這是第二次。」→ 四版共用那一句；KX_BDAY[2] two',JSON.stringify(said.map(s=>s.t).filter(t=>W.includes(t)))===JSON.stringify(W)&&!has('予樂說你沒回她。……結果你自己來了。')&&G.flags.KX_BDAY[2]==='two',JSON.stringify(said.map(s=>s.t))); }
  run('2027-04-25',9.75,10.25); check('13. 公館那一版：隔天沒有「我等了一天」',!txt('p:kexin').includes(K('昨天是我生日。……我等了一天。')));
  fresh('2027-04-17',20,'dorm'); date('kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',0); miss('y2r2_bd'); run('2027-04-24',20.5,21.25); run('2027-04-25',9.75,10.25);
  check('13. 答應了沒到：21:00「你沒來。」「……予樂她們陪我過了。」；隔天不再說「等了一天」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('你沒來。'),K('……予樂她們陪我過了。')])&&!txt('p:kexin').includes(K('昨天是我生日。……我等了一天。')));
  /* AA_343 A1：MSG-2 選「妳來公館」、答應了沒到——21:30「我到了。公館。」、22:00「……我回去了。蛋糕我帶回去。」、記 'none'（不是 'message'）；沒有電話版、隔天沒有「我等了一天」 */
  const ggPick=()=>{ fresh('2027-04-17',20,'dorm'); date('kexin'); INV.addContact(G,'kexin'); run('2027-04-17',20.75,21.25); to('2027-04-24',11); tick(); MSG.send(G,'kexin','bday'); run('2027-04-24',11,12,0.05);
    const m=(G.msgs||[]).find(x=>x.th==='p:kexin'&&x.ask&&(x.ask.opts||[]).some(o=>o.t==='妳來公館')); if(m){ PHONE.answer(G,m.ask.id,m.ask.opts.findIndex(o=>o.t==='妳來公館')); tick(); } return !!OUT.get(G,'y2r2_bd_gg'); };
  { const ok=ggPick(); run('2027-04-24',12,22.5,0.25); run('2027-04-25',9.75,10.25);
    const L=TH('p:kexin'), a=L.find(x=>x.text==='我到了。公館。'), b=L.find(x=>x.text==='……我回去了。蛋糕我帶回去。');
    check('13. A1「妳來公館」答應了沒到：21:30「我到了。公館。」、22:00「……我回去了。蛋糕我帶回去。」；KX_BDAY[2] none（不是 message）',ok&&!!a&&a.day===D('2027-04-24')&&Math.abs(a.h-21.5)<0.02&&!!b&&b.day===D('2027-04-24')&&Math.abs(b.h-22)<0.02&&G.flags.KX_BDAY[2]==='none',JSON.stringify([txt('p:kexin'),G.flags.KX_BDAY]));
    check('13. A1 沒有 22:00 電話版、隔天沒有「我等了一天」、也沒有「你沒來。」',!OUT.get(G,'y2r2_bd_call')&&!txt('p:kexin').includes(K('昨天是我生日。……我等了一天。'))&&!txt('p:kexin').includes(K('你沒來。'))); }
  { const ok=ggPick(); run('2027-04-24',12,21.5,0.25); await go('y2r2_bd_gg',21.6); run('2027-04-24',22,22.5,0.25);
    check('13. A1 22:00 以前到了（21:30 那則已經傳了）：照演「予樂她們先幫我過了一次。……這是第二次。」、記 two；沒有「……我回去了。」',ok&&has('予樂她們先幫我過了一次。……這是第二次。')&&G.flags.KX_BDAY[2]==='two'&&txt('p:kexin').includes(K('我到了。公館。'))&&!txt('p:kexin').includes(K('……我回去了。蛋糕我帶回去。')),JSON.stringify([txt('p:kexin'),G.flags.KX_BDAY])); }
  /* AA_343 A2：回過予樂的玩家 4/24 傳生日快樂——不問「你晚上要上山來，還是我下山」，整個回覆換一句 */
  const bdR=(pick,h,prep)=>{ fresh('2027-04-17',20,'dorm'); date('kexin'); INV.addContact(G,'kexin'); run('2027-04-17',20.75,21.25); ans('y2r2_bd_ask',pick); to('2027-04-24',h); tick(); if(prep) prep();
    const n0=(G.msgs||[]).length, r=MSG.send(G,'kexin','bday'); run('2027-04-24',h,Math.min(h+1.5,23.75),0.05); return {ok:!!(r&&r.ok),L:(G.msgs||[]).slice(n0).filter(x=>x.th==='p:kexin'&&x.from==='kexin')}; };
  { const x=bdR(0,11); check('13. A2 回過予樂（教室版）19:00 以前傳：她只回「謝謝。……晚上見。」，沒有回問、沒有按鈕',x.ok&&JSON.stringify(x.L.map(m=>m.text))===JSON.stringify(['謝謝。……晚上見。'])&&!x.L.some(m=>m.ask),JSON.stringify(x.L.map(m=>m.text))); }
  { const x=bdR(2,15); check('13. A2 兩個人版 19:00 以前傳：「謝謝。……晚上見。」',x.ok&&JSON.stringify(x.L.map(m=>m.text))===JSON.stringify(['謝謝。……晚上見。']),JSON.stringify(x.L.map(m=>m.text))); }
  { const x=bdR(3,20); check('13. A2 電話版 22:00 以前傳：「謝謝。……晚上等你電話。」',x.ok&&JSON.stringify(x.L.map(m=>m.text))===JSON.stringify(['謝謝。……晚上等你電話。']),JSON.stringify(x.L.map(m=>m.text))); }
  { const x=bdR(0,21,()=>{ G.events.done.ev_kexin_birthday_y2=1; }); check('13. A2 那一場已經演過之後才傳：「謝謝。」',x.ok&&JSON.stringify(x.L.map(m=>m.text))===JSON.stringify(['謝謝。']),JSON.stringify(x.L.map(m=>m.text))); }
  { const x=bdR(1,18.5,()=>{ OUT.get(G,'y2r2_bd').state='missed'; }); check('13. A2 那一場已經錯過（18:30 出發選單選了不去）之後才傳：「謝謝。」',x.ok&&JSON.stringify(x.L.map(m=>m.text))===JSON.stringify(['謝謝。']),JSON.stringify(x.L.map(m=>m.text))); }

  // 14. 2-Y2-16 回程的公車
  fresh('2027-04-28',20,'dorm',{met_yu:true}); date('kexin'); run('2027-04-28',20.75,21.25); check('14. 沒有 K12（KX_CIRCLES_MET、麵店分店群組）：沒有',!PHONE.sent(G,'y2r2_u_ask'));
  const bus=(flags)=>{ fresh('2027-04-28',20,'dorm',Object.assign({met_yu:true,KX_CIRCLES_MET:true},flags||{})); date('kexin'); PHONE.join(G,'noodle_branch','麵店分店'); run('2027-04-28',20.75,21.25); };
  bus({KX_NCCU_FRIENDS:true});
  check('14. 4/28 21:00 麵店分店：予樂、阿哲「+1」、Alison「我也要！！」；最後一則可以回（去／不行）',JSON.stringify(txt('g:noodle_branch'))===JSON.stringify(['yule:下週六下午一點，老街。搭公車去。司機這次放假。','zhe:+1','yu:我也要！！'])&&JSON.stringify(PHONE.byAsk(G,'y2r2_u_ask').ask.opts.map(o=>o.t))===JSON.stringify(['去。','那天不行。']),JSON.stringify(txt('g:noodle_branch')));
  ans('y2r2_u_ask',0); { const q=OUT.get(G,'y2r2_u'); check('14. 「去。」＝5/8 13:00 老街',!!q&&q.day===D('2027-05-08')&&q.h===13); }
  to('2027-05-08',13.2); tick(); check('14. 5/8 群組名稱改成「老街限定」',PHONE.rec(G).groups.noodle_branch.name==='老街限定');
  await go('y2r2_u',12); picks=['留下來'];
  check('14. U1 老街逐字：「這家寫百年老店。」「……隔壁那家也寫。」；綽號（{name}）、Alison「書記」、邵鈞詹靖',has('（山邊的老街。一條上坡的窄路，兩邊都是賣吃的。）')&&has('（在第一家店門口）這家寫百年老店。')&&has('……隔壁那家也寫。')&&has('祐廷，你是「放假的司機」。')&&has('Alison 是『書記』。')&&has('邵鈞是『拍照的那個』，詹靖是『找廁所的那個』。')&&has('……這個不能改嗎？')&&has('我是「命名官」。這個不能投票。')&&!any(/假設/),JSON.stringify(said.map(s=>s.t)));
  check('14. 17:00 二選一 → 公車上「車開過一個彎。你不記得自己什麼時候睡著的。」；KX_BUS_HOME kissed；回到臺北 22:30',JSON.stringify(opts[0])===JSON.stringify(['「留下來吃晚餐。」','「我先回去。」'])&&has('車開過一個彎。你不記得自己什麼時候睡著的。')&&G.flags.KX_BUS_HOME==='kissed'&&Math.abs(G.hour-22.5)<0.01,String(G.hour));
  run('2027-05-08',22.75,23.25); { const L=TH('p:kexin').slice(-3); check('14. 23:00 三則（置頂、可以回）',JSON.stringify(L.map(m=>m.text))===JSON.stringify(['你剛剛在公車上睡著了。靠在我肩上。','我親了你一下。你沒醒。','先跟你說一聲。'])&&L.every(m=>m.pin)&&!!PHONE.byAsk(G,'y2r2_u_kiss')); }
  ans('y2r2_u_kiss',2); check('14. 回長頸鹿貼圖 →（她回一隻長頸鹿）「你就是這隻。睡著的那隻。」',JSON.stringify(txt('p:kexin').slice(-3))===JSON.stringify(['player:（貼圖：長頸鹿）',K('（她回一隻長頸鹿）'),K('你就是這隻。睡著的那隻。')]));
  run('2027-05-08',21.5,21.75); check('14. 留下來的沒有照片',!PHONE.sent(G,'y2r2_u_photo'));
  to('2027-05-09',9); tick(); check('14. 隔天群組名稱改回「麵店分店」',PHONE.rec(G).groups.noodle_branch.name==='麵店分店');
  bus(); ans('y2r2_u_ask',0); said=[]; picks=['先回去']; await go('y2r2_u',12);
  check('14. U2 先走：「好。到家傳一隻長頸鹿貼圖給我。」；沒有公車；沒有 Alison（不認識）以外的人',has('好。到家傳一隻長頸鹿貼圖給我。')&&!any(/睡著/)&&G.flags.KX_BUS_HOME==='left'&&!has('邵鈞是『拍照的那個』，詹靖是『找廁所的那個』。'));
  run('2027-05-08',21.25,23.25); check('14. 先走：21:30 群組兩張照片；沒有 23:00',JSON.stringify(txt('g:noodle_branch').slice(-2))===JSON.stringify(['yule:📷（老街的階梯，一排人的背影）','zhe:📷（一桌試吃的小碟子）'])&&!PHONE.sent(G,'y2r2_u_kiss'));
  { const k12=ev('ev_kexin_two_circles'); if(k12&&typeof k12.after==='function'){ fresh('2027-03-25',20.5,'noodle',{met_yu:true}); date('kexin'); meet('classmate_bohan'); G.flags.KX_CIRCLES_MET=true; k12.after(G); run('2027-04-28',20.75,21.25);
    check('14. 接 1B-07 的 K12（ev_kexin_two_circles 結束建的「麵店分店」和成員）：4/28 邀約在那個群組；AA_375 第 15 項：Alison、柏翰 19:40 先去讀書會，群組不算他們——只有阿哲',PHONE.inGroup(G,'noodle_branch')&&JSON.stringify(txt('g:noodle_branch'))===JSON.stringify(['yule:下週六下午一點，老街。搭公車去。司機這次放假。','zhe:+1']),JSON.stringify(txt('g:noodle_branch'))); }
    else check('14. 1B-07 的 ev_kexin_two_circles 還沒進來（這個檢查跳過）',true); }
  bus({NOODLE_BRANCH_MEMBERS:['kexin','yule','zhe','classmate_bohan']});
  check('14. 1B-07 記的成員（Alison 那天不在、柏翰在）：邀約是阿哲「+1」、柏翰「那天我在總圖。」，沒有 Alison',JSON.stringify(txt('g:noodle_branch'))===JSON.stringify(['yule:下週六下午一點，老街。搭公車去。司機這次放假。','zhe:+1','classmate_bohan:那天我在總圖。']),JSON.stringify(txt('g:noodle_branch')));
  ans('y2r2_u_ask',0); said=[]; picks=['先回去']; await go('y2r2_u',12); check('14. Alison 不在群組：老街沒有「書記」',!has('Alison 是『書記』。'));
  bus(); ans('y2r2_u_ask',1); run('2027-05-08',12,21.75); check('14. U3 沒參加：群組兩張照片、沒有提公車；KX_BUS_HOME no',JSON.stringify(txt('g:noodle_branch').slice(-2))===JSON.stringify(['yule:📷（老街的階梯，一排人的背影）','zhe:📷（一桌試吃的小碟子）'])&&G.flags.KX_BUS_HOME==='no'&&!txt('g:noodle_branch').some(t=>/公車上/.test(t)));

  // 15. 2-Y2-17 芷若
  fresh('2027-05-11',22,'dorm'); R('heroine_02','FRI'); date('heroine_02'); run('2027-05-11',22.5,22.75);
  check('15. 交往中：5/11 22:40 三則',JSON.stringify(txt('p:heroine_02'))===JSON.stringify(['heroine_02:信來了。','heroine_02:……錄取了。','heroine_02:我現在不想打字。你可以打給我嗎。']));
  ans('y2r2_zr_admit',0); await go('y2r2_zr_call'); check('15. Z2 打過去：「我在哭。開心的啦。」；ZR_ADMIT_CALL stayed',has('我在哭。開心的啦。')&&has('（你們沒有再說什麼。電話一直沒掛。）')&&G.flags.ZR_ADMIT_CALL==='stayed');
  to('2027-05-12',19.5); G.zone='cafe'; await play('ev_zhiruo_admitted',['五個多月很快']); check('15. Z2 Café 5/12：「昨天那通電話，我後來睡著了。你掛了嗎？」「……你好笨。電話費。」（AA_375 第 2 項：「九月我就走了。五個多月。」）',has('昨天那通電話，我後來睡著了。你掛了嗎？')&&has('……你好笨。電話費。')&&has('九月我就走了。五個多月。')&&G.flags.ZR_ADMITTED===true);
  to('2027-05-17',19.5); G.zone='wancai'; R('heroine_04','FAM'); ROM.learn(G,'heroine_04','heroine_02','test'); check('15. 5/17（一）19:30 萬才館：子晴的演唱會那件可以觸發（AA_375 第 13 項：演唱會 5/15（六）晚上，5/17 以後才說）',EVENTS.check(ev('ev_zhiruo_concert')));
  await play('ev_zhiruo_concert'); check('15. Z2 交往版：「……她是不是已經跟你說了。」「上禮拜。」（5/11 那通電話是上禮拜）「可惡。我以為我是第一個。……好啦，你是男朋友，你先。」',has('……她是不是已經跟你說了。')&&has('上禮拜。')&&has('可惡。我以為我是第一個。……好啦，你是男朋友，你先。')&&!has('安可那首。哭到隔壁的人遞面紙給她。'));
  fresh('2027-05-17',19.5,'wancai',{ZR_NOMINATED:true}); R('heroine_04','FAM'); R('heroine_02','FAM');
  check('15. 5/12、5/13 不觸發（AA_375 第 13 項：5/17 起）；只認識子晴（不到 FAMILIAR）不觸發',EVENTS.check(ev('ev_zhiruo_concert'))&&(()=>{ to('2027-05-13',19.5); return !EVENTS.check(ev('ev_zhiruo_concert')); })()&&(()=>{ to('2027-05-12',19.5); return !EVENTS.check(ev('ev_zhiruo_concert')); })()&&(()=>{ to('2027-05-17',19.5); R('heroine_04','ACQ'); const r=!EVENTS.check(ev('ev_zhiruo_concert')); R('heroine_04','FAM'); return r; })());
  await play('ev_zhiruo_concert'); check('15. Z1 一般版：子晴四句（她等了五個月）；芷若記 HEARD_FROM_ZIQING',has('欸，你知道芷若在演唱會哭嗎？')&&has('安可那首。哭到隔壁的人遞面紙給她。')&&has('她說是因為英國那邊的錄取信來了。她等了五個月。')&&has('……她還沒跟你說吧。她要自己說。你裝不知道。')&&SOCIAL.has('heroine_02','HEARD_FROM_ZIQING'));
  G.zone='cafe'; await play('ev_zhiruo_admitted',['裝不知道']); check('15. Z1 Café 裝不知道：「子晴跟你說了吧。你裝得很爛。」',has('子晴跟你說了吧。你裝得很爛。')&&has('一月那則的下文。……你等到了。'));
  fresh('2027-05-19',19.5,'wancai',{}); R('heroine_04','FAM'); R('heroine_02','FAM'); await play('ev_zhiruo_concert'); check('15. Z3 沒演過 Z7：子晴「她申請交換，等了五個月」',has('她說是因為英國那邊的錄取信來了。她申請交換，等了五個月。'));
  fresh('2027-05-20',15,'cafe',{}); R('heroine_02','FAM'); await play('ev_zhiruo_admitted',['九月走']); check('15. Z3 Café：「下學期我要去英國交換。那邊的信，前幾天來了。」；沒聽子晴說＝「這幾天一直想跟每個客人說。……結果都沒說。」（AA_338 第 6 節：禁用模板句「你是第三個」改掉）',has('下學期我要去英國交換。那邊的信，前幾天來了。')&&has('這幾天一直想跟每個客人說。……結果都沒說。')&&!any(/你是第三個/)&&has('嗯。九月初。……還有三個多月。'));
  fresh('2027-05-11',22,'dorm'); R('heroine_02','FRI'); date('heroine_02'); run('2027-05-11',22.5,23.75); check('15. 交往中沒打：23:30「……沒事。明天再說。」、ZR_ADMIT_CALL none',txt('p:heroine_02').slice(-1)[0]==='heroine_02:……沒事。明天再說。'&&G.flags.ZR_ADMIT_CALL==='none');
  G.zone='cafe'; to('2027-05-13',15); await play('ev_zhiruo_admitted',['五個多月很快']); check('15. 沒打的 Café：「錄取了。……那天你沒打來。」（她把吧檯擦了一遍，沒有看你。）',has('錄取了。……那天你沒打來。')&&has('（她把吧檯擦了一遍，沒有看你。）'));

  // 16. 2-Y2-18 明軒
  fresh('2027-05-25',18,'noodle'); R('classmate_mingxuan','FRI'); check('16. X1 5/25（二）18:00 麵店、明軒 FRIEND：滷蛋那件觸發；5/26 不觸發',EVENTS.check(ev('ev_mx_m2_egg'))&&(()=>{ to('2027-05-26',18); const r=!EVENTS.check(ev('ev_mx_m2_egg')); to('2027-05-25',18); return r; })());
  await play('ev_mx_m2_egg'); check('16. 「（明軒把自己碗裡的滷蛋，推到你碗裡。）」「請你的。不要問。」',has('（明軒把自己碗裡的滷蛋，推到你碗裡。）')&&has('請你的。不要問。')&&G.flags.MX_EGG===true);
  to('2027-05-31',21.5); G.zone='dorm_hall'; check('16. 5/31（一）21:30 宿舍：回宿舍的路上觸發',EVENTS.check(ev('ev_mx_m2_walk')));
  await play('ev_mx_m2_walk',['你還好嗎']); check('16. 「我跟以安說了。」三選一；選「你還好嗎？」有「（他上週才把滷蛋給你。）」',has('我跟以安說了。')&&has('她說她想了三天。答案是沒有，理由是她對我沒有那種感覺。')&&opts[0].length===3&&has('（他上週才把滷蛋給你。）')&&has('……好啦，我明天再吃。')&&G.flags.MX_HEARD===true&&SOCIAL.has('classmate_mingxuan','MX_TOLD'));
  { R('heroine_01','FAM'); const r0=JSON.stringify(SOCIAL.rel('heroine_01')); G.zone='cafe'; const o=Y2R2.talkOpts(G,'heroine_01',GM); check('16. 以安的對話選單多「明軒的事……」',o.length===1&&o[0].t==='明軒的事……');
    said=[]; await o[0].run(GM,{name:'沈以安'}); check('16. X2「他問了，我答了。我們還是朋友。」；關係值不變；只有一次',JSON.stringify(said.map(s=>s.t))===JSON.stringify(['他問了，我答了。我們還是朋友。'])&&JSON.stringify(SOCIAL.rel('heroine_01'))===r0&&Y2R2.talkOpts(G,'heroine_01',GM).length===0); }
  fresh('2027-05-31',21.5,'dorm_hall'); R('classmate_mingxuan','FRI'); await play('ev_mx_m2_walk',['你還好嗎']); check('16. X4 沒看到滷蛋那段：沒有「他上週才把滷蛋給你」',!has('（他上週才把滷蛋給你。）')&&has('還好。你看，我還吃得下滷蛋。'));
  fresh('2027-05-31',21.5,'dorm_hall'); R('classmate_mingxuan','FRI'); date('heroine_01'); ROM.learn(G,'classmate_mingxuan','heroine_01','test'); await play('ev_mx_m2_walk',['三對三幾點']);
  check('16. X3 和以安交往、明軒知道：沒有「我跟以安說了」；「期末考完，系籃要打一場三對三。你來。」；MX_3ON3_ASKED、沒有 MX_HEARD',!has('我跟以安說了。')&&has('期末考完，系籃要打一場三對三。你來。')&&has('週六早上九點。……我知道你起不來，所以約九點。')&&G.flags.MX_3ON3_ASKED===true&&!G.flags.MX_HEARD&&Y2R2.talkOpts(G,'heroine_01',GM).length===0);
  run('2027-06-11',20.75,21.25); check('16. 6/11 21:00 阿哲「明天九點 三對三 起得來嗎」→ 排 6/12 09:00（鬧鐘）',txt('p:zhe').slice(-1)[0]==='zhe:明天九點 三對三 起得來嗎'&&(q=>!!q&&q.day===D('2027-06-12')&&q.h===9&&q.alarm)(OUT.get(G,'y2r2_3on3')));
  ans('y2r2_3on3_ask',1); check('16. 「不一定。」→「那我八點半打給你」',txt('p:zhe').slice(-1)[0]==='zhe:那我八點半打給你');
  await go('y2r2_3on3',8.5); check('16. 三對三逐字；MX_3ON3 went',has('（早上九點。三對三：阿哲、明軒、你一隊。）')&&has('你真的起來了。')&&has('八月我回彰化一週。其他時間都在家教。有球就叫我。')&&G.flags.MX_3ON3==='went');
  fresh('2027-05-31',21.5,'dorm_hall'); R('classmate_mingxuan','FRI'); date('heroine_01'); ROM.learn(G,'classmate_mingxuan','heroine_01','test'); await play('ev_mx_m2_walk'); run('2027-06-11',20.75,21.25); miss('y2r2_3on3'); run('2027-06-12',11.75,12.25);
  check('16. 三對三沒去：6/12 12:00 阿哲三則',JSON.stringify(txt('p:zhe').slice(-3))===JSON.stringify(['zhe:三對三我們兩個打對面三個','zhe:輸了','zhe:你欠我們一次'])&&G.flags.MX_3ON3==='missed',JSON.stringify(txt('p:zhe')));
  fresh('2027-05-26',21,'dorm'); R('zhe','FRI'); R('classmate_mingxuan','FAM'); run('2027-05-26',21.75,22.25); check('16. 和明軒不熟、阿哲朋友以上：5/26 22:00 阿哲「明軒最近怪怪的。……」、MX_HEARD',txt('p:zhe').slice(-1)[0]==='zhe:明軒最近怪怪的 你不要問，問了他會請你吃東西'&&G.flags.MX_HEARD===true);

  // 17. 2-Y2-19 子晴 Q9
  { const a=ACTIVITIES.list.find(x=>x.id==='guitar_show_y2s2'); check('17. 活動 guitar_show_y2s2：5/28（五）19:00 萬才館、事件 ev_ziqing_show2',!!a&&a.event==='ev_ziqing_show2'&&a.zone==='wancai'&&ACTIVITIES.on(a,D('2027-05-28'),{flags:{}})&&!ACTIVITIES.on(a,D('2027-05-26'),{flags:{}})); }
  fresh('2027-05-24',20,'dorm'); meet('heroine_04'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); run('2027-05-24',20.75,21.25);
  check('17. 5/24 21:00 子晴三則（沒有「好啦這是問句」）',JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:我自己寫的歌要在成發彈','heroine_04:四句歌詞','heroine_04:……你要來'])&&!txt('p:heroine_04').some(t=>/這是問句/.test(t)));
  G.flags.ZQ_SHOW='clap'; await play('ev_ziqing_show2'); check('17. S1 Q5 拍手、這次去：「去年那個 bug 修好了。」＋拍手手勢；ZQ_SHOW2 came',has('去年那個 bug 修好了。')&&has('（她看向觀眾席，找到你，比了一個拍手的手勢。）')&&!has('（發到你的時候）去年的份。')&&G.flags.ZQ_SHOW2==='came');
  fresh('2027-05-28',19,'wancai'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); check('17. 認識、被邀過：活動事件可以觸發',EVENTS.check(ev('ev_ziqing_show2'),{chain:true}));
  await play('ev_ziqing_show2'); check('17. S2 Q5 沒去、雙方單身、FRIEND：「去年的份。」、貼紙直接貼在手機殼上；CLAPPED',has('（發到你的時候）去年的份。')&&has('（她不是遞給你，是直接貼在你的手機殼上，什麼都沒說。）')&&SOCIAL.has('heroine_04','CLAPPED'));
  fresh('2027-05-28',19,'wancai'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); date('kexin'); await play('ev_ziqing_show2'); check('17. 祐廷有交往對象：貼紙用遞的',has('（她把貼紙遞給你。）')&&!has('（她不是遞給你，是直接貼在你的手機殼上，什麼都沒說。）'));
  fresh('2027-05-28',19,'wancai',{ZQ_SHOW:'came'}); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); date('heroine_04'); G.needed={batches:[{d:1,ans:['zq_song']}]}; await play('ev_ziqing_show2');
  { const N='（下台後，她沒有發貼紙給你。她走過來，把一張插座貓貼紙直接貼在你的手機殼上。）';
    check('17. 交往中、看過 Q5、回過 zq_song：「重來」那句；AA_338 第 3 節的旁白「（下台後，她沒有發貼紙給你。……直接貼在你的手機殼上。）」→「第二張。明年還有第三張。」',has('（第四句唱到「重來」兩個字的時候，她看了觀眾席一眼。）')&&idx(N)>=0&&idx('第二張。明年還有第三張。')===idx(N)+1&&!any(/^（下台後她不發貼紙給你/),JSON.stringify(said.map(s=>s.t))); }
  fresh('2027-05-28',19,'wancai'); R('heroine_04','FRI'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); date('heroine_04'); await play('ev_ziqing_show2');
  { const N='（下台後，她走過來，把一張插座貓貼紙直接貼在你的手機殼上。）', L='……今年你有來。我看到了。不要換位子。', S0='（你坐在第一排。她上台看到你，愣了一下。這次沒有按錯和弦。）';
    /* AA_343 A3（改了這一項的期待值）：取代「下台後，她走到第一排……」，但 BB_189 1-3 的「去年的份。」要留 */
    check('17. 交往中、沒看過 Q5（AA_338 第 3 節＋AA_343 A3）：第一排 →「（下台後，她走過來，把一張插座貓貼紙直接貼在你的手機殼上。）」→「去年的份。」→「……今年你有來。我看到了。不要換位子。」；不發給第一排',idx(S0)>=0&&idx(N)>idx(S0)&&idx('去年的份。')===idx(N)+1&&said[idx(N)+1].who!==null&&idx(L)===idx(N)+2&&!has('（下台後，她走到第一排，來的人一人一張插座貓貼紙。）')&&!has('（發到你的時候）去年的份。')&&!has('（她把一張插座貓貼紙，直接貼在你的手機殼上。）')&&SOCIAL.has('heroine_04','CLAPPED'),JSON.stringify(said.map(s=>s.t))); }
  fresh('2027-05-24',20,'dorm',{ZQ_SHOW:'clap'}); meet('heroine_04'); SOCIAL.remember('heroine_04','INVITED_CLUB',''); run('2027-05-24',20.75,21.25); run('2027-05-28',21.25,21.75);
  check('17. 沒去：21:30 謝幕照片（Q5 去過：「今年沒有人拍太大聲」）',JSON.stringify(txt('p:heroine_04').slice(-3))===JSON.stringify(['heroine_04:📷（謝幕，台上六個人鞠躬）','heroine_04:今年沒有人拍太大聲','heroine_04:……拍給你看'])&&G.flags.ZQ_SHOW2==='absent');

  // 18. 2-Y2-20 系籃
  fresh('2027-05-28',20,'dorm',{met_yu:true,Y2_BALL_SEEN:true}); PHONE.join(G,'noodle_team','麵店團'); run('2027-05-28',20.75,21.25);
  check('18. 5/28 21:00 麵店團群組：阿哲邀約 → 5/29 14:00 新體育館',txt('g:noodle_team').slice(-1)[0]==='zhe:明天下午兩點，系籃，新體育館 這學期最後一場'&&(q=>!!q&&q.day===D('2027-05-29')&&q.h===14)(OUT.get(G,'y2r2_ball')));
  await go('y2r2_ball',13.5); picks=[];
  check('18. B1 看過大二上、認識 Alison：「17 號，可以犯規一次。」；結尾阿哲和 Alison 兩句；WATCHED_GAME_Y2B、Y2B_BALL_SEEN',has('（Alison 的加油板換了一面：「17 號，可以犯規一次。」）')&&has('妳的板子寫錯字了。')&&has('那是故意的。')&&SOCIAL.has('zhe','WATCHED_GAME_Y2B')&&G.flags.Y2B_BALL_SEEN===true);
  fresh('2027-05-28',20,'dorm'); run('2027-05-28',20.75,21.25); miss('y2r2_ball'); run('2027-05-29',21.25,21.75);
  check('18. B2 沒去：21:30 照片「贏了 分數不重要」（私訊）',JSON.stringify(txt('p:zhe').slice(-2))===JSON.stringify(['zhe:📷（記分板前面，阿哲和明軒蹲著比 YA。分數被阿哲的頭擋住了。）','zhe:贏了 分數不重要']));
  check('18. B3 成發（5/28 週五晚上）和系籃（5/29 週六下午）不同天',wdOf(D('2027-05-28'))===5&&wdOf(D('2027-05-29'))===6);

  // 19. 2-Y2-21 K14
  fresh('2027-06-01',20,'dorm'); date('kexin'); run('2027-06-01',20.75,21.25); ans('y2r2_k14_ask',0);
  check('19. 6/1 21:00「明天傍晚，你來政大。暑假的事，我想先跟你說。」→「五點半，校門口。」→ 6/2 17:30',txt('p:kexin').includes(K('明天傍晚，你來政大。暑假的事，我想先跟你說。'))&&txt('p:kexin').slice(-1)[0]===K('五點半，校門口。')&&(q=>!!q&&q.day===D('2027-06-02')&&q.h===17.5)(OUT.get(G,'y2r2_k14')));
  await go('y2r2_k14',16.5); picks=[];
  check('19. R1「高雄的事務所。暑假我本來就在家。」；三選一沒有「開車載妳去」',has('我決定了。暑假我要去事務所實習。')&&has('高雄的事務所。暑假我本來就在家。')&&JSON.stringify(opts[0])===JSON.stringify(['「妳想做哪一種案子？」','「會不會很累？」','「第一天下班，我打給妳。」'])&&G.flags.KX_SUMMER==='kind');
  fresh('2027-06-01',20,'dorm'); date('kexin'); run('2027-06-01',20.75,21.25); ans('y2r2_k14_ask',1); to('2027-06-02',15);
  check('19. 婉拒：「……好。那我明天打給你。」；6/2 睡著也會在 21:00 醒來接電話',txt('p:kexin').slice(-1)[0]===K('……好。那我明天打給你。')&&STORY.lawWakeAt(G)===21);
  run('2027-06-02',20.75,21.25); { const q=OUT.get(G,'y2r2_k14_call'); check('19. R2 21:00 是電話（她打來、一定接）',!!q&&q.call&&q.must&&q.verb==='接起來'&&q.h===21); }
  await go('y2r2_k14_call'); check('19. 電話一句一句演；KX_SUMMER message',has('……暑假的事，我決定了。去高雄的事務所實習。')&&has('自己找的，昨天錄取。')&&has('本來想當面說。……那你下次要當面恭喜我。')&&G.flags.KX_SUMMER==='message'&&!has('你今天沒來。'));
  fresh('2027-06-01',20,'dorm'); date('kexin'); run('2027-06-01',20.75,21.25); ans('y2r2_k14_ask',0); miss('y2r2_k14'); run('2027-06-02',20.75,21.25); await go('y2r2_k14_call');
  check('19. 答應了沒到：電話第一句「你今天沒來。」',said.findIndex(s=>s.t==='你今天沒來。')>=0);

  // 20. 2-Y2-22 語彤事件 11
  const yth=(key,flags)=>{ fresh(key,18,'noodle',flags); R('heroine_03','FAM'); return Y2R2.talkOpts(G,'heroine_03',GM).map(o=>o.t); };
  check('20. H3 沒有 RENT_CONSULTATION：沒有「幫她」選項',yth('2027-05-25').length===0);
  SOCIAL.remember('heroine_03','RENT_CONSULTATION',''); check('20. 有 RENT_CONSULTATION：三個「幫她」選項（麵店）',JSON.stringify(Y2R2.talkOpts(G,'heroine_03',GM).map(o=>o.t))===JSON.stringify(['要不要我問問看有沒有打工？','需要的話，我可以先借妳。','我找了一些資料。']));
  { const o=Y2R2.talkOpts(G,'heroine_03',GM)[2]; said=[]; await o.run(GM,{name:'陳語彤'});
    check('20. 選「我找了一些資料。」→「……嗯。我想一下。」；YT_HELP_OFFERED、HELP_OFFERED、ev_yt_help_offer；剩兩個',has('……嗯。我想一下。')&&G.flags.YT_HELP_OFFERED===true&&SOCIAL.has('heroine_03','HELP_OFFERED')&&!!G.events.done.ev_yt_help_offer&&Y2R2.talkOpts(G,'heroine_03',GM).length===2); }
  to('2027-06-03',18); check('20. 6/3（四）18:00 麵店：事件 11 觸發；6/4 不觸發；6/3 20:00 不觸發',EVENTS.check(ev('ev_yt_help_dishes'))&&(()=>{ to('2027-06-04',18); const a=!EVENTS.check(ev('ev_yt_help_dishes')); to('2027-06-03',20); const b=!EVENTS.check(ev('ev_yt_help_dishes')); to('2027-06-03',18); return a&&b; })());
  await play('ev_yt_help_dishes',['捲起袖子']);
  check('20. H1 門口兩句、洗碗、「……你洗得很爛。」「下次不用幫我。陪我吃麵就好。」；21:00 以後；APOLOGIZED',has('（她把你叫到門口。）')&&has('你不用這樣。')&&has('我不想當你的個案。')&&has('（時間快轉到打烊。你洗了兩個小時的碗。）')&&has('……你洗得很爛。')&&has('下次不用幫我。陪我吃麵就好。')&&G.hour>=21&&SOCIAL.has('heroine_03','APOLOGIZED')&&G.flags.YT_EV11==='dishes');
  check('20. 之後不再觸發（6/17 也沒有）',(()=>{ to('2027-06-17',18); return !EVENTS.check(ev('ev_yt_help_dishes')); })());
  { const e=NEEDED_MSGS.list.find(x=>x.id==='yt_dish'); check('20. 6/6 週訊息「阿姨說你上次洗的碗還有油。」要有 APOLOGIZED',!!e&&e.cond(G)===true&&(()=>{ fresh('2027-06-06',12,'dorm'); return e.cond(G)===false; })()); }
  fresh('2027-06-03',18,'noodle',{YT_HELP_OFFERED:true}); R('heroine_03','FAM'); date('heroine_03'); await play('ev_yt_help_dishes',['我先走']);
  check('20. H2 交往中：第二句「你是我男朋友。不用每件事都幫我想辦法。」；選「我先走」＝left',has('你是我男朋友。不用每件事都幫我想辦法。')&&!has('我不想當你的個案。')&&G.flags.YT_EV11==='left');
  to('2027-06-17',18); check('20. 先走的：6/17 再一次',EVENTS.check(ev('ev_yt_help_dishes')));
  await play('ev_yt_help_dishes',['捲起袖子']); check('20. 6/17：不再問門口那兩句、直接兩選一',!has('你不用這樣。')&&JSON.stringify(opts[0])===JSON.stringify(['（捲起袖子，去後面洗碗）','（坐下來吃麵）'])&&G.flags.YT_EV11==='dishes');

  // 21. 2-Y2-23 經濟系之夜
  fresh('2027-05-31',20,'dorm',{MET_PINYU:true}); date('kexin'); run('2027-05-31',20.75,21.25);
  check('21. 5/31 21:00 品妤（交往中）：「經濟系之夜。你們兩個都可以來。你們又不是叛徒。」「禮拜五七點，社科院一樓。」',JSON.stringify(txt('p:econ_pinyu'))===JSON.stringify(['econ_pinyu:經濟系之夜。你們兩個都可以來。你們又不是叛徒。','econ_pinyu:禮拜五七點，社科院一樓。']));
  ans('y2r2_en_ask',0); picks=['揮手']; await go('y2r2_en',18.5);
  check('21. E1 交往中、去：唐睿「前系友席，今年兩位！而且是一對！」；品妤「前系友席兩張椅子，我只要搬一次。」；KX_ECON_NIGHT together',has('前系友席，今年兩位！而且是一對！')&&has('前系友行使緘默權！')&&has('前系友席兩張椅子，我只要搬一次。')&&!has('謝謝你來。我們這屆的人，少一個就看得出來。')&&G.flags.KX_ECON_NIGHT==='together'&&SOCIAL.has('econ_pinyu','ECON_NIGHT')&&!('Y2R2_EN_KX' in G.flags));
  fresh('2027-05-31',20,'dorm',{MET_PINYU:true,MET_XUN:true}); date('kexin'); run('2027-05-31',20.75,21.25); ans('y2r2_en_ask',1); run('2027-06-04',21.25,21.75); run('2027-06-05',11.75,12.25);
  check('21. E2 沒去、認識阿勳：6/5「經濟系之夜，阿勳問你怎麼沒來。」；KX_ECON_NIGHT alone',txt('p:kexin').slice(-1)[0]===K('經濟系之夜，阿勳問你怎麼沒來。')&&G.flags.KX_ECON_NIGHT==='alone');
  check('21. E3 6/4 沒有 K14（K14 在 6/2）',D('2027-06-02')!==D('2027-06-04')&&!OUT.rec(G).some(q=>q.day===D('2027-06-04')&&/k14/.test(q.id)));
  fresh('2027-05-31',20,'dorm',{MET_PINYU:true}); run('2027-05-31',20.75,21.25); check('21. 單身：「經濟系之夜。你可以來。你又不是叛徒。」',txt('p:econ_pinyu')[0]==='econ_pinyu:經濟系之夜。你可以來。你又不是叛徒。');
  ans('y2r2_en_ask',0); await go('y2r2_en',18.5); check('21. 單身去：品妤「謝謝你來。我們這屆的人，少一個就看得出來。」',has('謝謝你來。我們這屆的人，少一個就看得出來。')&&!any(/一對/));

  // 22. 2-Y2-24 以安新 13
  fresh('2027-06-04',20,'dorm',{met_yu:true,AN_TUTOR_FAMILY:1}); meet('heroine_01'); PHONE.join(G,'public_law','公法讀書會'); run('2027-06-04',20.75,21.25);
  check('22. A1 讀書會群組、有新 10：三則＋Alison 兩則；沒有「她說那張圖」',JSON.stringify(txt('g:public_law'))===JSON.stringify(['heroine_01:那個家的訴願，原本的決定被撤銷了，要重新審。','heroine_01:不是全贏。可是有人要重新看他們的資料了。','heroine_01:📷（一張手寫的卡片，字看不清楚，只看得到最後一行：老師，謝謝妳畫的那張圖。）','yu:！！','yu:恭喜那個家！！'])&&G.flags.AN_TUTOR_FAMILY===2&&!txt('g:public_law').some(t=>/她說那張圖/.test(t)),JSON.stringify(txt('g:public_law')));
  fresh('2027-06-04',20,'dorm'); meet('heroine_01'); PHONE.join(G,'noodle_team','麵店團'); run('2027-06-04',20.75,21.25);
  check('22. A2 只在麵店團、沒有新 10：先「之前在幫家教學生的家裡看一份駁回的公文。」；阿哲「讚」',txt('g:noodle_team')[0]==='heroine_01:之前在幫家教學生的家裡看一份駁回的公文。'&&txt('g:noodle_team').slice(-1)[0]==='zhe:讚');
  fresh('2027-06-04',20,'dorm'); date('heroine_01'); PHONE.join(G,'public_law','公法讀書會'); run('2027-06-04',20.75,21.25); check('22. 交往中：私訊「卡片上的字，是那個學生自己寫的。」',txt('p:heroine_01').slice(-1)[0]==='heroine_01:卡片上的字，是那個學生自己寫的。');

  // 23. 共用檔
  check('23. 子晴的閒聊「期末成發你要來。」大二下也有（Q9 做了）',SMALLTALK.heroine_04.some(x=>x&&x.t==='「期末成發你要來。」'&&x.term.includes('Y2S2')));
  check('23. 電話（q.call）在家也不用出門；一般的出遊從家裡照舊 30 分鐘',OUT.trip({},{call:true,travelH:0},true).travelH===0&&OUT.trip({},{travelH:0.25},true).travelH===0.5);
  { fresh('2027-01-20',12,'dorm',{KX_GRADES_Y2S2:'waited'}); date('kexin'); to('2027-06-27',9); said=[]; await Y2R2.afterOuting(GM,{id:'hv_kexin_x',hv:{id:'kexin'}},{participants:[]}); check('23. 成績出來以前不說宵夜那句',said.length===0);
    to('2027-07-20',10); await Y2R2.afterOuting(GM,{id:'hv_kexin_x',hv:{id:'kexin'}},{participants:[]}); check('23. 暑假去高雄找她（hometown3d 的 q.hv）也算下一次見面：「（這次是她請。）」',has('（這次是她請。）')&&G.flags.KX_BET_Y2S2_PAID===true); }
  { fresh('2027-07-19',9,'dorm',{KX_GRADES_Y2S2:'waited',HV_N:{kexin:1}}); date('kexin'); const day=D('2027-07-20'), C=HOMETOWN_LINES.kexin;   /* AA_338 第 3 題：真的走一趟 hometown3d 的「去高雄找她」 */
    OUT.plan(G,{id:'hv_kexin_'+day,ev:'ev_hv_kx',day,h:10.5,late:1,place:'高雄',title:'去高雄找可昕',travel:C.travel,travelH:C.travelH,back:'回到臺北。',hv:{id:'kexin',keep:false}}); picks=[0]; await go('hv_kexin_'+day);
    const p=idx('這次換這頂安全帽了。……上車。'), b=idx('（這次是她請。）'), s=idx(C.send.narr), s2=idx(C.send.dating[0]);
    check('23. 去高雄找她：「（這次是她請。）」在結尾、送上車以前（接人和那個地方之後、「（傍晚，她騎車送你回車站。）」之前），只一次',p>=0&&b>p&&s>b&&s2>s&&said.filter(x=>x.t==='（這次是她請。）').length===1&&G.flags.KX_BET_Y2S2_PAID===true,JSON.stringify(said.map(x=>x.t))); }
  { fresh('2026-09-17',20,'dorm'); G.stage='econ'; date('kexin'); run('2026-09-17',20.5,21.5); check('23. 經濟系那一年（stage econ）不跑',(G.msgs||[]).length===0); }
  // 24. AA_343 E2：CG-2b 的群組（以安新 8 的後半：大二上第 7 週週六 14:00 萬才館研討室的補讀；那天沒去、在公法讀書會群組的玩家）
  { const sat=STORY.termDay('Y2S1',7,6), PL=()=>TH('g:public_law').map(m=>m.from+':'+m.text), EXP=['yu:📷','yu:規則剩三條 另外一半是我撕的','heroine_01:Alison，刪掉。','yu:不要 這是歷史'];
    const PLAN=()=>OUT.plan(G,{id:'plg_sat',ev:'ev_plg_rules_after',day:sat,h:14,late:0.25,place:'萬才館研討室',title:'公法讀書會的補讀',travel:'走過去約 10 分鐘',travelH:1/6});   /* 同 story3d.js 週四 22:00 以安在麵店團約的那一個 */
    const setup=o=>{ o=o||{}; fresh('2026-10-24',13.5,'dorm',{}); meet('heroine_01'); if(!o.noYu) meet('yu'); if(!o.noGroup) PHONE.join(G,'public_law','公法讀書會'); PHONE.join(G,'noodle_team','麵店團'); G.events.done.ev_plg_rules=1; };
    check('24. 補讀那天＝2026-10-24（六）（story3d.js 的 plg_sat 同一天）',sat===D('2026-10-24')&&wdOf(sat)===6);
    setup(); run('2026-10-24',13.5,14.25);
    check('24. 14:15 以前還沒有（去的人還可以出發）',!PHONE.sent(G,'y2r2_plg_photo')&&TH('g:public_law').length===0);
    run('2026-10-24',14.5,15); { const L=TH('g:public_law');
      check('24. 沒被約（週四沒去）的群組成員：14:30 公法讀書會群組四則，字照 AA_343 E2（Alison 不打句號、以安標點完整）',JSON.stringify(PL())===JSON.stringify(EXP),JSON.stringify(PL()));
      check('24. 第一則的照片是 CG-2b（cg_study_group_rules_photo）、送出就收進相簿；其他三則沒有圖；10/24 14:30',!!L[0]&&L[0].cg==='cg_study_group_rules_photo'&&L.slice(1).every(m=>!m.cg)&&((G.cg||{}).unlocked||[]).includes('cg_study_group_rules_photo')&&L[0].day===sat&&Math.abs(L[0].h-14.5)<0.05,L[0]&&JSON.stringify(L[0])); }
    setup(); PLAN(); miss('plg_sat'); run('2026-10-24',14.5,15);
    check('24. 約了沒去（出發選單過期）：一樣四則',OUT.get(G,'plg_sat').state==='missed'&&JSON.stringify(PL())===JSON.stringify(EXP),JSON.stringify(PL()));
    setup(); PLAN(); await go('plg_sat',14.1); run('2026-10-24',14.5,16.5);
    check('24. 去了（CG-2 在場版）：群組照片不傳、不收進相簿',!!G.events.done.ev_plg_rules_after&&!PHONE.sent(G,'y2r2_plg_photo')&&TH('g:public_law').length===0&&!((G.cg||{}).unlocked||[]).includes('cg_study_group_rules_photo'));
    setup({noGroup:true}); run('2026-10-24',14.5,15); check('24. 不在公法讀書會群組：沒有（麵店團也沒有）',!PHONE.sent(G,'y2r2_plg_photo')&&(G.msgs||[]).every(m=>m.tag!=='y2r2_plg_photo'));
    setup({noYu:true}); run('2026-10-24',14.5,15); check('24. 還不認識 Alison：沒有（同 2-Y2-24 群組裡 Alison 那兩句的做法）',!PHONE.sent(G,'y2r2_plg_photo'));
    { const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('24. 手機對話裡在那一則下面顯示照片（game3d.js threadHTML 的 msgPhoto：CG_REGISTRY[m.cg].file）',/const msgPhoto=m=>[^\n]*CG_REGISTRY\[m\.cg\]\.file/.test(src)&&/escH\((?:sysT\(m\)|m\.text)\)\)\+msgPhoto\(m\)/.test(src)); } }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
