// 事件包第 2 輪之二：大三前半 2-Y3-01～2-Y3-25（AA_326，AA-C e284d601 定稿；src/data/r2y3a_events.js、src/r2y3a3d.js）——不需要瀏覽器。
//   照 AA_326 每一件第 7 節給 BB 的驗收情境寫；台詞逐字比對 AA_326（D100：AA 寫的才演）。
//   修改前（沒有 src/data/r2y3a_events.js、src/r2y3a3d.js，index.html 沒有接）：第 0 項全部 FAIL。用法：node tests/r2y3a_events_unit.js
//   AA_519（NPC-STORY2-1028，企劃線 d75cd0228）改的期待值：9 颱風夜第一句旁白照 5-3 換（兩杯熱豆漿），另外加大二颱風那晚有來的（TYPHOON_Y2_KAI）＝第二句多「（阿凱說：「去年也是我。」）」（5-4）；
//   20 有 JOB_NOODLE 的那一句「……你週二來切蔥，週四來陪我發呆。很忙喔。」照 1-5 刪掉（遊戲沒有麵店打工）＝有 JOB_NOODLE 也不出、其他逐字照舊
//   AA_519 第 9 節第 1 點（企劃線 169130daf，颱風夜同一場其他的泡麵一起換：大三是兩杯熱豆漿）改的期待值：9 「（舉起泡麵）」兩句→「（舉起豆漿）」、選項「吃掉阿凱的泡麵」→「喝掉阿凱的豆漿」（照稿）；
//   子代理照同樣的意思改的：19:30 那則「所以我帶泡麵過去」→「所以我帶豆漿過去」、子晴「我也去泡一碗」→「我也去泡一杯」、只有阿凱那一版「（他拆了第一包。）」→「（他把吸管插進第一杯。）」（檢查照留，只換字）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|PORTRAIT_ONLY|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|HOMETOWN_LINES|NEEDED_MSGS|TERMEND|TERMEND_LINES|SYLLABUS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|Y2B|Y2B_EVENTS|Y2R2|GROUP|GROUP_EVENTS|Y34B|R2Y3A|R2Y3A_EVENTS|MENTOR_WHY_TEXT|HV)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/hometown_lines.js','src/data/needed_msgs.js','src/data/termend_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/termend3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
if(typeof R2Y3A==='undefined'||typeof R2Y3A_EVENTS==='undefined'){ check('0. src/data/r2y3a_events.js、src/r2y3a3d.js 載入（R2Y3A_EVENTS、R2Y3A）',false); console.log('FAILED '+fails); process.exit(1); }
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},hide(){},cg(){ return true; },setBg(b){ this.bg=b; }}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; while(G.hour>=24){ G.hour-=24; G.day++; } G.weekday=wdOf(G.day); },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs.length=0; E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); if(r) r.status='dating'; meet(id); };
const join=g=>PHONE.join(G,g,g);
const has=t=>said.some(s=>s.t===t), idx=t=>said.findIndex(s=>s.t===t), any=re=>said.some(s=>re.test(s.t)), all=()=>said.map(s=>s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const to=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const tick=()=>{ R2Y3A.phone(G,GM); for(const q of OUT.expire(G)) OUT.onMissed(GM,q); R2Y3A.phone(G,GM); PHONE.tick(G); };
const run=(key,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ to(key,+h.toFixed(3)); tick(); } };
const ans=(id,k)=>{ const r=PHONE.answer(G,id,k); R2Y3A.phone(G,GM); PHONE.tick(G); return r; };
const go=async(id,h)=>{ const q=OUT.get(G,id); if(!q) return null; G.day=q.day; G.weekday=wdOf(q.day); G.hour=h!=null?h:q.h; said=[]; opts=[]; await OUT.go(GM,q); return q; };
const play=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const miss=id=>{ const q=OUT.get(G,id); G.day=q.day; G.weekday=wdOf(q.day); G.hour=q.h+(q.late!=null?q.late:0.75)+0.05; for(const x of OUT.expire(G)) OUT.onMissed(GM,x); PHONE.tick(G); return q; };
const npc=(id,x,z,lv)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},lv:lv|0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const me=(x,z,lv)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=lv|0; };
const K=t=>'kexin:'+t;
const noSuppose=()=>!any(/假設/);
const W1S=STORY.week1Start, noZhe=()=>{ STORY.week1Start=()=>true; }, zheBack=()=>{ STORY.week1Start=W1S; };   /* 不認識阿哲（A15：9/1 開學的局要初遇）*/
(async()=>{
  // ===== 0. 登記、接線 =====
  const IDS=['ev_kexin_trip_summer_y2','ev_kexin_qixi_y2','ev_kexin_kh_missed_call','ev_kexin_qixi_video','ev_fangyt_mountain','ev_y3_welcome','ev_y3_first_meal','ev_zhe_captain','ev_kexin_30min','ev_kexin_lecture_ntu','ev_kexin_lecture_table','ev_ziqing_dad_stuck',
    'ev_typhoon_y3_noodle','ev_typhoon_y3_family','ev_kexin_call_helper','ev_kexin_call_helper2','ev_crimpro_court_visit','ev_xinci_bad_line','ev_an_admin_court','ev_bohan_third_floor','ev_fair_booth_y3','ev_fair_booth_y3_pass','ev_zhe_scooter',
    'ev_yt_lease_renew','ev_yt_lease_retell','ev_xinci_an_answers','ev_xinci_an_answers_far','ev_kexin_tutor_practice','ev_kexin_juniors_dinner','ev_kexin_juniors_video','ev_yt_thursday_free','ev_kexin_xmas_y3','ev_kexin_kn_call_y3','ev_kexin_valentine_y3'];
  check('0. 34 個事件都在 STORY_EVENTS、id 不重複',IDS.every(i=>STORY_EVENTS.filter(e=>e.id===i).length===1)&&R2Y3A_EVENTS.length===IDS.length,IDS.filter(i=>STORY_EVENTS.filter(e=>e.id===i).length!==1).join(','));
  check('0. 掛勾：STORY.PHONE_RULES、STORY.TICKS、STORY.WAKE_AT、CLS.IN_CLASS 都有這一包',STORY.PHONE_RULES.some(f=>/S\.phone\(G,GM\)/.test(String(f)))&&STORY.TICKS.some(f=>/S\.tick\(GM,dt\)/.test(String(f)))&&STORY.WAKE_AT.some(f=>/S\.wakeAt\(G\)/.test(String(f)))&&CLS.IN_CLASS.some(f=>/S\.crClass/.test(String(f))));
  check('0. index.html 照順序載入：story3d.js、classes3d.js、y2b_events.js 之後、GAME.boot() 之前',(()=>{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const a=h.indexOf('src/data/r2y3a_events.js'), b=h.indexOf('src/r2y3a3d.js'), g=h.indexOf('GAME.boot()');
    return a>0&&b>a&&b<g&&a>h.indexOf('src/story3d.js')&&a>h.indexOf('src/data/y2b_events.js')&&b>h.indexOf('src/classes3d.js')&&b>h.indexOf('src/data/syllabus.js'); })());
  check('0. 日子對：7/20 週二、7/24 週六、8/7 週六、8/8 週日、9/4 週六、9/9 週四、9/10 週五、9/22 週三、9/29 週三、10/6 週三、10/13 週三、10/18 週一、10/19 週二、10/20 週三、10/21 週四、10/22 週五、11/12 週五、11/13 週六、11/19 週五、11/24 週三、12/9 週四、12/16 週四、12/25 週六、1/25 週二、2/14 週一、2/20 週日、4/26 週三',
    [['2027-07-20',2],['2027-07-24',6],['2027-08-07',6],['2027-08-08',0],['2027-09-04',6],['2027-09-09',4],['2027-09-10',5],['2027-09-22',3],['2027-09-29',3],['2027-10-06',3],['2027-10-13',3],['2027-10-18',1],['2027-10-19',2],['2027-10-20',3],['2027-10-21',4],['2027-10-22',5],['2027-11-12',5],['2027-11-13',6],['2027-11-19',5],['2027-11-24',3],['2027-12-09',4],['2027-12-16',4],['2027-12-25',6],['2028-01-25',2],['2028-02-14',1],['2028-02-20',0],['2028-04-26',3]].every(([k,w])=>wdOf(D(k))===w));
  check('0. 週次對：10/19 第 7 週、11/8 第 10 週、11/23 第 12 週、11/30 第 13 週、12/16 第 15 週；10/13 颱風假',CALENDAR.termOf(D('2027-10-19')).week===7&&CALENDAR.termOf(D('2027-11-08')).week===10&&CALENDAR.termOf(D('2027-11-23')).week===12&&CALENDAR.termOf(D('2027-11-30')).week===13&&CALENDAR.termOf(D('2027-12-16')).week===15&&CALENDAR.typhoon(D('2027-10-13')));
  if(fails){ console.log('FAILED '+fails); process.exit(1); }

  // ===== 1. 2-Y3-01 可昕 KH「高雄的兩天」＋七夕 =====
  fresh('2027-07-20',20,'dorm'); run('2027-07-20',21,22); check('1. 不是交往中：7/20 沒有邀約',!PHONE.sent(G,'y3_kh_inv'));
  fresh('2027-07-20',20,'dorm'); date('kexin'); run('2027-07-20',21,21.25); check('1. 21:15 還沒傳（21:30 才傳）',!PHONE.sent(G,'y3_kh_inv'));
  run('2027-07-20',21.5,21.75);
  check('1. K1 7/20 21:30 三則（八月七號、八號……我借了我爸的車。）',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('八月七號、八號，週末。我空下來了。'),K('你來高雄。這次住一晚。'),K('八號是七夕。……我借了我爸的車。')]),JSON.stringify(txt('p:kexin')));
  G.money=1000; check('1. 高鐵票錢不夠（2980）不能選「好。我坐早上的高鐵。」',ans('y3_kh_inv',0)===null&&G.flags.KX_KH_GO==null);
  G.money=4000; check('1. AA_350 M1：付得出高鐵、付不出旅館（4,000 < 4,780）也不能選；字是「高鐵票和旅館的錢不夠。」',ans('y3_kh_inv',0)===null&&G.flags.KX_KH_GO==null&&JSON.stringify(PHONE.byAsk(G,'y3_kh_inv').ask.opts[0].need)===JSON.stringify({money:4780,why:'高鐵票和旅館的錢不夠。'}));
  G.money=5000; ans('y3_kh_inv',0); { const q=OUT.get(G,'y3_kh');
    check('1. 答應 →「九點到左營。旅館我幫你找好了，在車站旁邊。」→ 排 8/7 09:00 左營站（高鐵一個半小時）',txt('p:kexin').slice(-1)[0]===K('九點到左營。旅館我幫你找好了，在車站旁邊。')&&!!q&&q.day===D('2027-08-07')&&q.h===9&&q.travelH===1.5&&q.ev==='ev_kexin_trip_summer_y2'); }
  { const m0=G.money; picks=[]; await go('y3_kh',7.4);
    const A=['（左營站。出口外面的太陽比臺北大。她站在柱子旁邊，戴著帽子。）','你真的來了。','我騎車載你。安全帽是我媽的，有點小。','這週我影印了一千兩百頁。今天不要有紙。','……行程表除外。','（她把手機轉過來。今天的行程表只有三行：渡輪、燈塔、吃東西。）',
      '（渡輪只開十分鐘。她站在船邊，頭髮一直被風吹到臉上，她也不管。）','（太陽很大。她把防曬乳擠了兩次，一次給你。）','（燈塔在山坡上。爬到一半，她停下來喘氣。）','我住高雄二十年，沒上來過。','國中的時候覺得，這是觀光客來的地方。',
      '對。觀光客要拍照。','（她把手機塞給你。）','拍我，還有後面的海。不要拍到別人。','（她騎車送你到旅館門口，沒有熄火。）','明天下午四點，我開車來。……今天早點睡，不要滑手機。'];
    const B=['（下午四點，一台舊舊的家用車停在旅館門口。她沒有下車，按了一下喇叭。）','上車。……音樂你管。','（天黑以後，整個港口的燈都亮了。船慢慢開進來。）','牛郎織女要等一年。','……我們有車。','高鐵要錢。車也要錢。……好啦，都算。',
      '（九點半，左營站。她把車停在下客處，沒有熄火。）','到了傳給我。……這次有住一晚。很好。','（她等你走進閘門，才把車開走。）'];
    check('1. K1 8/7 左營接人（沒去過＝pick）、「今天不要有紙」、旗津、燈塔三選一（預設第一個）、送到旅館（逐字、順序）',JSON.stringify(all().slice(0,A.length))===JSON.stringify(A)&&JSON.stringify(opts[0])===JSON.stringify(['「那今天妳是觀光客。」','「上面風好大。」','（陪她看海，不說話）']),JSON.stringify(all()));
    check('1. K2 8/8 16:00 她開車來接；港邊的山上「牛郎織女要等一年。」「……我們有車。」；三選一；21:30 左營站（逐字、順序）',JSON.stringify(all().slice(A.length,A.length+B.length))===JSON.stringify(B)&&JSON.stringify(opts[1])===JSON.stringify(['「還有高鐵。」','「明年也來？」','（把頭靠在她肩上）']),JSON.stringify(all().slice(A.length)));
    check('1. 地點字幕：高雄・旗津、高雄・港邊的山上（AA 第 5 節）',caps.includes('高雄・旗津')&&caps.includes('高雄・港邊的山上'));
    check('1. 旗標：KX_TRIP.Y2SUM two_days、KX_QIXI[2027] harbor、去過高雄 HV_N.kexin 1；高鐵 2980＋旅館一晚 1,800（AA_343 B1）扣了；回到臺北 8/8 23:00',G.flags.KX_TRIP.Y2SUM==='two_days'&&G.flags.KX_QIXI[2027]==='harbor'&&G.flags.HV_N.kexin===1&&m0-G.money===2980+1800&&G.day===D('2027-08-08')&&Math.abs(G.hour-23)<1e-3,JSON.stringify([G.flags.KX_TRIP,G.flags.KX_QIXI,m0-G.money,CALENDAR.dateOf(G.day).key,G.hour]));
    check('1. K5 沒有「假設」；七夕不在臺北',noSuppose()&&!any(/臺北的夜景|木柵大學後山/));
    { const L=[]; R2Y3A.khPay(G,{money:(n,w)=>L.push([n,w])}); check('1. B1 旅館一晚 1,800 元記「住宿」、高鐵 2980 記「交通」（AA_343 B1）',JSON.stringify(L)===JSON.stringify([[-2980,'交通'],[-1800,'住宿']]),JSON.stringify(L)); } }
  { const L=STORY.roomY3Items(G); check('1. 第三個房間（9/5）多「旗津的燈塔」：「她住高雄二十年，那天才爬上去。」',L.some(r=>r[0]==='kx_lighthouse'&&r[1]==='旗津的燈塔'&&r[2][0]==='她住高雄二十年，那天才爬上去。')&&STORY.roomItemName(G,'kx_lighthouse')==='旗津的燈塔'); }
  run('2027-08-08',20.75,21.25); check('1. 去了的：8/8 21:00 沒有七夕視訊',!OUT.get(G,'kx_qixi_2027'));
  fresh('2027-07-20',21.5,'dorm',{HV_N:{kexin:1}}); date('kexin'); run('2027-07-20',21.5,21.75); ans('y3_kh_inv',0); picks=[1,2]; await go('y3_kh',7.4);
  check('1. 去過高雄（HV_N）：接人用 pickAgain「這次換這頂安全帽了。……上車。」',has('這次換這頂安全帽了。……上車。')&&!has('你真的來了。'),JSON.stringify(all().slice(0,4)));
  fresh('2027-07-20',21.5,'dorm'); date('kexin'); { said=[]; picks=[1]; await play('ev_kexin_trip_summer_y2',[1]); check('1. 選「上面風好大。」→「下面更熱。……再站一下。」（她靠著欄杆，看了很久的海。）',has('下面更熱。……再站一下。')&&has('（她靠著欄杆，看了很久的海。）')); }
  fresh('2027-07-20',21.5,'dorm'); date('kexin'); { await play('ev_kexin_trip_summer_y2',[2,2]); check('1. 選陪她看海：「……好。下次找一個我們都沒去過的地方。」（AA_525 3-8 K-12 改句，原「……好。下次換你。去一個你也沒去過的地方。」）；七夕選靠肩：「……很重。」（她沒有推開。）',has('……好。下次找一個我們都沒去過的地方。')&&has('……很重。')&&has('（她沒有推開。）'),JSON.stringify(all())); }
  fresh('2027-07-20',21.5,'dorm'); date('kexin'); run('2027-07-20',21.5,21.75); ans('y3_kh_inv',1);
  check('1. K3 婉拒：「好。那寒假。……行程表我先留著。」、KX_TRIP_DEFERRED、沒有出遊',txt('p:kexin').slice(-1)[0]===K('好。那寒假。……行程表我先留著。')&&!!G.flags.KX_TRIP_DEFERRED&&!OUT.get(G,'y3_kh'));
  run('2027-08-08',20,20.25); { const q=OUT.get(G,'kx_qixi_2027'); check('1. K3 婉拒的：8/8 21:00 七夕視訊（接起來）',!!q&&q.day===D('2027-08-08')&&q.h===21&&q.verb==='接起來'&&q.ev==='ev_kexin_qixi_video'); }
  await go('kx_qixi_2027'); check('1. 七夕視訊兩句（她在高雄）；KX_QIXI[2027] video',JSON.stringify(all().slice(0,2))===JSON.stringify(['七夕。……牛郎織女要等一年。','我們等兩個禮拜。開學前兩天我就上去了。'])&&G.flags.KX_QIXI[2027]==='video');
  fresh('2027-07-20',21.5,'dorm'); date('kexin'); run('2027-07-20',21.5,21.75); run('2027-07-22',20.75,21.25);
  check('1. 不回：7/22 21:00「七號、八號。你回一下。」',txt('p:kexin').slice(-1)[0]===K('七號、八號。你回一下。'));
  run('2027-08-06',20.75,21.25); check('1. 還是不回（8/6 21:00 過了）＝婉拒那一版：記延期、不排出遊',G.flags.KX_KH_GO===false&&!!G.flags.KX_TRIP_DEFERRED&&!OUT.get(G,'y3_kh'));
  fresh('2027-07-20',21.5,'dorm'); date('kexin'); run('2027-07-20',21.5,21.75); ans('y3_kh_inv',0); miss('y3_kh'); run('2027-08-07',9.75,9.75);
  { const q=OUT.get(G,'y3_kh_call'); check('1. K4 答應了沒出發（09:30 還沒到左營）：可昕打來（一定接）；KX_TRIP.Y2SUM missed；KX_RUB +1',!!q&&q.must&&q.ev==='ev_kexin_kh_missed_call'&&G.flags.KX_TRIP.Y2SUM==='missed'&&G.flags.KX_RUB===1); }
  await go('y3_kh_call'); check('1. K4 電話：「你在哪。」祐廷「……還在臺北。」「……好。行程表我自己走。」（她掛掉了。）',JSON.stringify(said.map(s=>s.t))===JSON.stringify(['（電話。她那邊很吵，是車站的廣播。）','你在哪。','……還在臺北。','……好。行程表我自己走。','（她掛掉了。）'])&&said[2].who==='祐廷');
  run('2027-08-07',17.75,18.25); check('1. K4 18:00 燈塔照片兩則',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('（照片：燈塔上往下看的海）'),K('一個人爬上去了。')]));
  run('2027-08-08',20.5,20.5); check('1. K4 8/8 照 D 的視訊',!!OUT.get(G,'kx_qixi_2027'));
  fresh('2026-08-12',12,'dorm'); date('kexin'); run('2026-08-12',12,12); { const q=OUT.get(G,'kx_qixi_2026'); check('1. D 其他年份：2026-08-19（三）21:00 視訊（大一暑假）',!!q&&q.day===D('2026-08-19')&&q.h===21); }
  fresh('2028-08-20',12,'dorm'); date('kexin'); run('2028-08-20',12,12); check('1. D 2028-08-26（六）21:00 視訊（大三暑假）',(q=>!!q&&q.day===D('2028-08-26')&&q.h===21)(OUT.get(G,'kx_qixi_2028')));
  fresh('2028-08-20',12,'dorm',{EXCHANGE_ROUTE:'US'}); date('kexin'); run('2028-08-20',12,12); check('1. 美國路線（8/2 出發）：2028 七夕不排',!OUT.get(G,'kx_qixi_2028'));
  fresh('2027-07-20',21.5,'dorm',{SPRING_Y2:'noodle',KX_TRIP:{Y2W:'missed'}}); date('kexin'); PHONE.at(G,G.day-100,21,[{th:'p:kexin',from:'kexin',text:'x'}],'y2r2_kh_ask'); PHONE.at(G,G.day-90,21,[{th:'p:kexin',from:'kexin',text:'x'}],'y2s2_spring_kx'); PHONE.tick(G); run('2027-07-20',21.5,21.75);
  check('1. 連續兩個假期都沒和她去（大二寒假高雄、大二春假都約了沒去）：多一則「一天也算。……這次是兩天。」、回覆選項在最後一則',txt('p:kexin').slice(-1)[0]===K('一天也算。……這次是兩天。')&&!!PHONE.byAsk(G,'y3_kh_inv')&&PHONE.byAsk(G,'y3_kh_inv').text==='一天也算。……這次是兩天。');
  fresh('2027-07-20',21.5,'dorm',{SPRING_Y2:'noodle',KX_TRIP:{Y2W:'kaohsiung'}}); date('kexin'); PHONE.at(G,G.day-100,21,[{th:'p:kexin',from:'kexin',text:'x'}],'y2r2_kh_ask'); PHONE.at(G,G.day-90,21,[{th:'p:kexin',from:'kexin',text:'x'}],'y2s2_spring_kx'); PHONE.tick(G); run('2027-07-20',21.5,21.75);
  check('1. 大二寒假去了高雄：沒有「一天也算。」',!txt('p:kexin').includes(K('一天也算。……這次是兩天。')));

  // ===== 2. 2-Y3-02 方奕廷 F2「山上沒有訊號」 =====
  const FY='npc_fangyt:', fang=n=>{ meet('npc_fangyt'); SOCIAL.rel('npc_fangyt').talked=n; };
  fresh('2027-07-20',20,'dorm'); fang(2); run('2027-07-20',20.75,21.25); check('2. 說過話不到 3 次：沒有邀約',!PHONE.sent(G,'y3_f2_inv'));
  fresh('2027-07-05',20,'dorm'); fang(3); run('2027-07-05',20.75,21.25); check('2. F1 7/5 沒有（他 7/6～7/19 在山上）',!PHONE.sent(G,'y3_f2_inv'));
  fresh('2027-07-20',20,'dorm'); fang(3); run('2027-07-20',20.75,21.25);
  check('2. F1 7/20 21:00「這週六爬山。缺一個人。不用會。」、可以回',JSON.stringify(txt('p:npc_fangyt'))===JSON.stringify([FY+'這週六爬山。缺一個人。不用會。'])&&!!PHONE.byAsk(G,'y3_f2_inv')&&G.contacts.npc_fangyt!=null);
  ans('y3_f2_inv',0); { const q=OUT.get(G,'y3_f2'); check('2. 「好。」→「早上六點半，臺北車站的客運站。帶兩瓶水。」→ 7/24 06:30',txt('p:npc_fangyt').slice(-1)[0]===FY+'早上六點半，臺北車站的客運站。帶兩瓶水。'&&!!q&&q.day===D('2027-07-24')&&q.h===6.5&&q.ev==='ev_fangyt_mountain'); }
  G.events.done.ev_fangyt_hint=1; SOCIAL.remember('npc_fangyt','FANG_HINT',''); meet('heroine_02'); SOCIAL.remember('heroine_02','REMEMBERED_HER',''); picks=[]; await go('y3_f2');
  { const W=['（客運坐了三個多小時，再走兩個小時的步道。手機在半路就沒有訊號了。）','（傍晚，一棵很粗的樹前面。方奕廷把背包放下來。）','這棵紅檜大概一千歲。','它長得很慢。樹幹一年粗不到一公分。','我有時候覺得，有些事慢一點也沒關係。',
      '（他笑了，很久沒講話。）','……我在說樹。','（走了十步。）','好啦。也有一點。','芷若最近跟我說，有人記得她喝什麼。','我只記得她看什麼電影。喝什麼，我不知道。','……這樣很好。','（下山的時候，手機一直跳出訊息。你一則都沒點開。）'];
    check('2. F2 有 FANG_HINT：第一個選項「你是在說芷若嗎？」→「……我在說樹。」；有 REMEMBERED_HER 多三句；收尾旁白（逐字）',JSON.stringify(all().slice(0,W.length))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「你是在說芷若嗎？」','「你是在說我嗎？」','（看著樹，不說話）']),JSON.stringify(all()));
    check('2. 地點字幕「中部的山・檜木林步道」；FANG_F2 went、記 MOUNTAIN_DAY；沒有「你第一次一整天沒想到考試。」',caps.includes('中部的山・檜木林步道')&&G.flags.FANG_F2==='went'&&SOCIAL.has('npc_fangyt','MOUNTAIN_DAY')&&!any(/第一次一整天/)); }
  fresh('2027-07-20',20,'dorm'); fang(3); await play('ev_fangyt_mountain',[0,0]);
  check('2. F3 沒有 FANG_HINT：沒有芷若那個選項；「你是在說我嗎？」→「我其實換過一次跑道。」→「我比較羨慕你。」；記 FANG_KNOWS_ECON；沒有芷若三句',JSON.stringify(opts[0])===JSON.stringify(['「你是在說我嗎？」','（看著樹，不說話）'])&&has('你？你是那種走很快的人。')&&has('……所以你也慢過。')&&has('（他想了一下。）')&&has('我比較羨慕你。')&&SOCIAL.has('npc_fangyt','FANG_KNOWS_ECON')&&!has('芷若最近跟我說，有人記得她喝什麼。'),JSON.stringify(all()));
  fresh('2027-07-20',20,'dorm'); fang(3); await play('ev_fangyt_mountain',[0,1]); check('2. 「也許吧。」→「偶爾慢一點也沒關係。」、不記 FANG_KNOWS_ECON',has('偶爾慢一點也沒關係。')&&!SOCIAL.has('npc_fangyt','FANG_KNOWS_ECON'));
  fresh('2027-07-20',20,'dorm'); fang(3); await play('ev_fangyt_mountain',[1]); check('2. 看著樹不說話：（兩個人看到天色暗下來。下山時他說：）「下次帶你去看更老的。」',has('（兩個人看到天色暗下來。下山時他說：）')&&has('下次帶你去看更老的。'));
  fresh('2027-07-20',20,'dorm'); fang(3); run('2027-07-20',20.75,21.25); ans('y3_f2_inv',1);
  check('2. 「這週不行。」→「好。那下次。山不會跑。」',txt('p:npc_fangyt').slice(-1)[0]===FY+'好。那下次。山不會跑。'&&!OUT.get(G,'y3_f2'));
  run('2027-08-16',20.75,21.25); check('2. 拒絕一次：8/16 21:00「這週六再去爬一次山。還是缺一個人。不用會。」',txt('p:npc_fangyt').slice(-1)[0]===FY+'這週六再去爬一次山。還是缺一個人。不用會。'&&!!PHONE.byAsk(G,'y3_f2_inv2'));
  ans('y3_f2_inv2',1); check('2. 拒絕兩次：「好。山還在。」、FANG_F2 declined、這個暑假沒有了',txt('p:npc_fangyt').slice(-1)[0]===FY+'好。山還在。'&&G.flags.FANG_F2==='declined'&&!OUT.get(G,'y3_f2'));
  fresh('2027-07-20',20,'dorm'); fang(3); run('2027-07-20',20.75,21.25); run('2027-07-24',5.5,5.5); run('2027-08-16',20.75,21.25); ans('y3_f2_inv2',0);
  check('2. 第一次不回＝8/16 再約；答應第二次 → 8/21 06:30',(q=>!!q&&q.day===D('2027-08-21')&&q.h===6.5)(OUT.get(G,'y3_f2')));
  fresh('2027-07-20',20,'dorm'); fang(3); run('2027-07-20',20.75,21.25); ans('y3_f2_inv',0); miss('y3_f2'); run('2027-07-24',22,22.25);
  check('2. F4 答應了沒出發：06:45「我們先走了。你的位子我沒補人。」；22:00 雲海照片；FANG_F2 missed',JSON.stringify(txt('p:npc_fangyt').slice(-3))===JSON.stringify([FY+'我們先走了。你的位子我沒補人。',FY+'（照片：雲海）',FY+'沒訊號。下山才傳。'])&&G.flags.FANG_F2==='missed',JSON.stringify(txt('p:npc_fangyt')));

  // ===== 3. 2-Y3-03 迎新（大三版） =====
  fresh('2027-09-02',20,'dorm'); run('2027-09-02',20.75,21.25); check('3. 不在「法律系（全班）」群組：沒有公告',!PHONE.sent(G,'y3_welcome_ask'));
  fresh('2027-09-02',20,'dorm'); join('law_class'); run('2027-09-02',20.75,21.25);
  { const q=OUT.get(G,'y3_welcome'); check('3. W3 9/2 21:00 系學會「禮拜六迎新，大三的關主一點在社科院旁的草地集合。」→ 9/4（六）13:00（不是 9/25）',txt('g:law_class').slice(-1)[0]==='law_assoc:禮拜六迎新，大三的關主一點在社科院旁的草地集合。'&&TH('g:law_class').slice(-1)[0].name==='系學會'&&!!q&&q.day===D('2027-09-04')&&q.h===13&&q.ev==='ev_y3_welcome'); }
  G.flags.Y2_WELCOME=true; G.flags.MENTOR_WHY='help'; picks=[]; await go('y3_welcome');
  { const W=['（社科院旁的草地。新生一隊一隊經過，脖子上掛著名牌。）','（你這一關在草地最裡面：一張桌子、一疊題目卡。）','學長，這一關要做什麼？','（第一張卡：「民法第一條寫什麼？」新生想了很久。）','……學長，可以換一張嗎？',
      '（有人從後面拍你的肩。是去年你那一隊的學弟，脖子上掛著「小隊輔」的名牌。）','學長。我今年帶隊了。','去年你說「想幫身邊的人把事情弄清楚。」……我還在想我的。','好。……學長，你們這關太難了，我的組員在抱怨。','（三點半，最後一隊走了。你把題目卡收回盒子裡，少了兩張。）'];
    check('3. W1 大二當過小隊輔：「學長。我今年帶隊了。」＋去年那句（MENTOR_WHY_TEXT）；選「慢慢想。」（逐字）；沒有阿哲的口號',JSON.stringify(all())===JSON.stringify(W)&&!has('大碗！'),JSON.stringify(all()));
    check('3. Y3_WELCOME、字幕「社科院旁的草地」',G.flags.Y3_WELCOME===true&&caps.includes('社科院旁的草地')); }
  fresh('2027-09-04',12,'dorm'); join('law_class'); await play('ev_y3_welcome',[1]);
  check('3. W2 大二沒去迎新、認識阿哲：「先自我介紹。」那句；隔壁阿哲「大碗！」新生「……大碗。」',has('（他們一個一個講名字。講到第四個，你已經忘了第一個。）')&&has('（隔壁那一關是阿哲。他在教新生喊口號。）')&&has('大碗！')&&has('……大碗。')&&!has('學長。我今年帶隊了。'));
  fresh('2027-09-04',12,'dorm',{MET_ZHE:false}); noZhe(); await play('ev_y3_welcome',[0]); zheBack();
  check('3. 不認識阿哲：沒有口號那段',!has('大碗！')&&!has('（隔壁那一關是阿哲。他在教新生喊口號。）'));
  fresh('2027-09-04',12,'dorm',{Y2_WELCOME:true,MENTOR_WHY:'own'}); await play('ev_y3_welcome',[0,1]); check('3. 「想到了跟我說。」→「好。」（他跑回他那一隊。）；MENTOR_WHY own 那一句',has('去年你說「還在找怎麼說。但這是我自己選的。」……我還在想我的。')&&!any(/」。……我還在想我的/)&&has('好。')&&has('（他跑回他那一隊。）'));
  fresh('2027-09-02',20,'dorm'); join('law_class'); run('2027-09-02',20.75,21.25); miss('y3_welcome'); run('2027-09-04',21.25,21.75);
  check('3. 沒去：9/4 21:30 群組照片',txt('g:law_class').slice(-1)[0]==='law_assoc:（照片：草地上，新生圍成一圈）');

  // ===== 4. 2-Y3-04 開學第一頓（大三上） =====
  fresh('2027-09-09',16,'dorm'); run('2027-09-09',16.75,17.25); check('4. 不在群組、和阿哲不熟：沒有那則',!PHONE.sent(G,'y3_first_meal_ask'));
  fresh('2027-09-09',16,'dorm'); join('noodle_team'); run('2027-09-09',16.75,17.25);
  check('4. 9/9 17:00 阿哲在麵店團「大三第一頓 七點 長桌」→ 排 19:00 阿鳳麵店（19:15 還沒出發＝沒去）',txt('g:noodle_team').slice(-1)[0]==='zhe:大三第一頓 七點 長桌'&&(q=>!!q&&q.h===19&&q.late===0.25)(OUT.get(G,'y3_first_meal')));
  fresh('2027-09-09',16,'dorm'); R('zhe','FAM'); run('2027-09-09',16.75,17.25); check('4. 不在群組、和阿哲 FAMILIAR：阿哲私訊同一句',txt('p:zhe').slice(-1)[0]==='zhe:大三第一頓 七點 長桌');
  fresh('2027-09-09',16,'dorm'); join('noodle_team'); ['zhe','yu','classmate_bohan','heroine_01','heroine_03'].forEach(meet); run('2027-09-09',16.75,17.25); picks=[]; await go('y3_first_meal');
  { const W=['（麵店的長桌。阿姨換了新的菜單，每一樣多五塊。）','五塊。……大三就是這種感覺。','欸，這學期刑訴，聽說林教授點名都點後面。','後面三排。我問過學長了。','（翻開手帳）讀書會八點。……我們先走。','（端麵過來）……今天乾麵剩四碗。','對。先吃。'];
    check('4. D1 去了：都認識＝五個人各一句（逐字；以安那句照 AA_376 第 7 項）；選項兩個；「對。先吃。」；Y3_FIRST_MEAL',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「先吃。」','「真的點後面三排？」'])&&G.flags.Y3_FIRST_MEAL===true,JSON.stringify(all())); }
  fresh('2027-09-09',19,'dorm'); ['zhe','classmate_bohan'].forEach(meet); await play('ev_y3_first_meal',[1]);
  check('4. 只認識阿哲、柏翰：Alison、以安、語彤的句子不出現；「真的點後面三排？」→「真的。所以我坐第一排。」',!any(/點名都點後面|讀書會照常|乾麵剩四碗/)&&has('真的。所以我坐第一排。'));
  fresh('2027-09-09',19,'dorm'); ['zhe','heroine_03'].forEach(meet); R('heroine_03','FRI'); await play('ev_y3_first_meal',[0,0]);
  { const a=idx('系上老師叫我當助教。質性研究方法。'), b=idx('（端麵過來）……今天乾麵剩四碗。');
    check('4. D2 語彤 13b 還沒演、FRIEND 以上：她端麵過來前先演 13b（兩句＋二選一＋「下週二第一次上台。」）、記 YT_TA',a>0&&b>a&&has('下週二第一次上台。我要講二十分鐘。')&&G.flags.YT_TA===true,JSON.stringify(all())); }
  fresh('2027-09-09',19,'dorm',{YT_TA:true}); ['zhe','heroine_03'].forEach(meet); R('heroine_03','FRI'); await play('ev_y3_first_meal',[0]); check('4. 13b 演過了：不重演',!has('系上老師叫我當助教。質性研究方法。'));
  fresh('2027-09-09',16,'dorm'); join('noodle_team'); run('2027-09-09',16.75,17.25); miss('y3_first_meal'); run('2027-09-09',21.25,21.75);
  check('4. D3 沒去：21:30 菜單照片',txt('g:noodle_team').slice(-1)[0]==='zhe:（照片：新的菜單，每一個價錢都貼了一張小紙條）');

  // ===== 5. 2-Y3-05 哲 3「隊長」 =====
  fresh('2027-09-10',11,'dorm'); join('noodle_team'); run('2027-09-10',11.75,12.25); check('5. 9/10 12:00 麵店團「今天傍晚球場 新球季第一次練」',txt('g:noodle_team').slice(-1)[0]==='zhe:今天傍晚球場 新球季第一次練');
  fresh('2027-09-10',11,'dorm'); R('zhe','FAM'); run('2027-09-10',11.75,12.25); check('5. 不在群組、FAMILIAR：私訊同一句',txt('p:zhe').slice(-1)[0]==='zhe:今天傍晚球場 新球季第一次練');
  fresh('2027-09-10',17.6,'campus'); R('zhe','FAM');
  { const e=STORY.schedEnt(CHARACTERS.zhe,G), m=STORY.schedEnt(CHARACTERS.classmate_mingxuan,G); check('5. 作息：9/10 17:30～19:00 阿哲、明軒在新體育館旁的籃球場（校園）',!!e&&e.zone==='campus'&&e.act==='linger'&&!!m&&m.zone==='campus'&&m.act==='linger'&&Math.hypot(e.at[0]+4,e.at[1]+113)<4); }
  to('2027-09-17',17.6); check('5. 9/17 不在（只有那一天）',(e=>!e||e.note!==R2Y3A.SCHED[0][1].note)(STORY.schedEnt(CHARACTERS.zhe,G)));
  to('2027-09-10',17.6); check('5. 走到阿哲旁邊（near npc zhe）、FAMILIAR 以上：可以演；19:00 以後不演；不到 FAMILIAR 不演',ev('ev_zhe_captain').near.npc==='zhe'&&EVENTS.check(ev('ev_zhe_captain'))&&(()=>{ to('2027-09-10',19.1); const a=!EVENTS.check(ev('ev_zhe_captain')); to('2027-09-10',17.6); R('zhe','ACQ'); const b=!EVENTS.check(ev('ev_zhe_captain')); R('zhe','FAM'); return a&&b; })());
  meet('classmate_mingxuan'); G.flags.ZHE2='notes'; await play('ev_zhe_captain',[1]);
  { const W=['（把隊長臂章在手上轉）學長說，現在我是隊長。','很好笑吧。我自己的民法差點被當。','（運球經過）你民法過了啦。','……對。過了。（對祐廷）你看，他都知道。','我民法是靠你過的。這季的記分板，你來。','記我投進幾顆。少記一顆，你請。'];
    check('5. Z1 大二借了筆記（ZHE2 notes）：「這季的記分板，你來。」＋第二個選項「記分要記什麼？」（逐字）；ZHE3',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「恭喜，隊長。」','「記分要記什麼？」'])&&G.flags.ZHE3===true,JSON.stringify(all())); }
  fresh('2027-09-10',17.6,'campus',{ZHE2:'self'}); R('zhe','FAM'); await play('ev_zhe_captain',[0]);
  check('5. Z2 選「這個你要自己來」（ZHE2 self）：「你那時候叫我自己來。……我自己來了。」；不認識明軒＝旁白；「恭喜，隊長。」→「不要叫隊長。……好啦，今天可以。」',has('你那時候叫我自己來。……我自己來了。')&&has('（有人運球經過，說了一句什麼，阿哲笑了。）')&&!has('（運球經過）你民法過了啦。')&&has('不要叫隊長。……好啦，今天可以。')&&JSON.stringify(opts[0])===JSON.stringify(['「恭喜，隊長。」']));
  check('5. Z3 任何一版：沒有「這是條件」',!any(/這是條件/));
  { // AA_356 1-2：大二下三對三沒去（MX_3ON3 missed）＝隊長那場「他都知道」之後補販賣機三行、錢 −75、MX_3ON3 repaid；有去的沒有
    const L3=['對了。三對三那次，你欠的。','（你去球場旁邊的販賣機，買了三罐運動飲料。阿哲拿了兩罐，一罐丟給剛剛運球經過的人。）','好。清了。'];
    fresh('2027-09-10',17.6,'campus',{MX_3ON3:'missed'}); R('zhe','FAM'); const m0=G.money; await play('ev_zhe_captain',[0]); const A=all(), i=A.indexOf('……對。過了。（對祐廷）你看，他都知道。');
    check('5. AA_356 1-2：三對三沒去＝「他都知道」之後「對了。三對三那次，你欠的。」＋販賣機旁白＋「好。清了。」；錢 −75；MX_3ON3 repaid',i>=0&&JSON.stringify(A.slice(i+1,i+4))===JSON.stringify(L3)&&G.money===m0-75&&G.flags.MX_3ON3==='repaid',JSON.stringify(A.slice(i,i+4)));
    fresh('2027-09-10',17.6,'campus',{MX_3ON3:'went'}); R('zhe','FAM'); const m1=G.money; await play('ev_zhe_captain',[0]);
    check('5. AA_356 1-2：三對三有去＝沒有那三行、錢不動',!has('好。清了。')&&G.money===m1); }
  { // AA_356 1-1：大一上第 16 週視訊沒到（書桌照片 kx_video_photo）＝寒假第一天一起打開成績，第一句「你欠我的那一次，用這個還。」；沒有那張照片的沒有
    fresh('2026-01-05',20.9,'dorm',{}); PHONE.at(G,G.day-20,23,[{th:'p:kexin',from:'kexin',text:'我自己讀了。你欠我一次。'}],'kx_video_photo'); PHONE.tick(G); await play('ev_kexin_grades_open');
    const a=all(); fresh('2026-01-05',20.9,'dorm',{}); await play('ev_kexin_grades_open'); const b=all();
    check('AA_356 1-1：視訊沒到過＝「你欠我的那一次，用這個還。」在「三、二、一——」前面；有接的玩家沒有',a.indexOf('你欠我的那一次，用這個還。')===a.indexOf('三、二、一——')-1&&a.includes('三、二、一——')&&!b.includes('你欠我的那一次，用這個還。'),JSON.stringify([a,b])); }
  { // AA_356 第 2 節：「我明天拿來。」＝隔天以後第一次進總圖還書、−40、清掉；欠著的時候不再跳逾期；當天不還
    fresh('2026-03-10',14,'library',{}); const fb=ev('ev_forgot_book'), br=ev('ev_book_return'); const c0=EVENTS.check(fb); await play('ev_forgot_book',[1]); const set=G.flags.book_overdue===true&&G.flags.book_overdue_day===G.day;
    const same=!EVENTS.check(br)&&!EVENTS.check(fb); to('2026-03-11',10); G.zone='library_hall'; const next=EVENTS.check(br); const m0=G.money; await play('ev_book_return');
    check('AA_356 2：ev_forgot_book 關掉（BUG-BOOK-OVERDUE-1023：沒有借書就不會逾期）；舊存檔選過「我明天拿來。」的照舊：記 book_overdue＋那一天；當天不還；隔天進總圖（大廳）旁白一句、錢 −40、清掉',!c0&&set&&same&&next&&has('（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）')&&G.money===m0-40&&!G.flags.book_overdue&&!EVENTS.check(br),JSON.stringify({c0,set,same,next,m:G.money-m0,f:G.flags.book_overdue})); }
  fresh('2027-09-10',17.6,'campus',{ZHE2:'none'}); R('zhe','FAM'); await play('ev_zhe_captain',[0]); check('5. ZHE2 none：沒有回聲',!any(/記分板|叫我自己來/));

  // ===== 6. 2-Y3-06 可昕 K15「三十分鐘的晚餐」 =====
  fresh('2027-09-22',16,'dorm'); run('2027-09-22',16.75,17.25); check('6. 不是交往中：沒有',!PHONE.sent(G,'y3_k15'));
  fresh('2027-09-22',16,'dorm'); date('kexin'); run('2027-09-22',16.75,17.25);
  check('6. 9/22 17:00「我七點要回學校。六點公館，吃三十分鐘，夠嗎？」、兩個選項（AA_376 第 13 項）',JSON.stringify(txt('p:kexin'))===JSON.stringify([K('我七點要回學校。六點公館，吃三十分鐘，夠嗎？')])&&JSON.stringify(PHONE.byAsk(G,'y3_k15').ask.opts.map(o=>o.t))===JSON.stringify(['夠。','今天不行。']));
  ans('y3_k15',0); { const q=OUT.get(G,'y3_k15'); check('6. 「夠。」→「好。六點，不要遲到。」→ 排 18:00 公館（18:10 還沒到＝沒到）',txt('p:kexin').slice(-1)[0]===K('好。六點，不要遲到。')&&!!q&&q.h===18&&Math.abs(q.late-1/6)<1e-9&&q.ev==='ev_kexin_30min'); }
  G.flags.ZHE3=true; picks=[0,1]; await go('y3_k15',17.8);
  { const W=['你們的麵店？好。我還沒在週三來過。','（她看了三次手錶。第三次：）','還有九分鐘。……你說一件今天的事。只說一件。','他？……他會每場都請全隊吃麵吧。','（六點半整，她站起來，拿了外套就走。走到門口又回頭。）','到了跟你說。'];
    check('6. K1 去了：吃什麼三選一→麵店；「還有九分鐘。……你說一件今天的事。」；哲 3 演過才有「阿哲當隊長了。」；收尾（逐字）',JSON.stringify(all().slice(0,W.length))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「麵店。阿姨的麵三分鐘就來。」','「便利商店。」','「妳選。」'])&&JSON.stringify(opts[1])===JSON.stringify(['「刑訴老師昨天點了後面三排。」','「阿哲當隊長了。」','「今天沒什麼事。」']),JSON.stringify(all()));
    check('6. 記 KX_SHORT_MEET、KX_K15 met；18:30 以後回到首都帝大；不接她的閒聊階梯（她先走了）',G.flags.KX_SHORT_MEET===true&&G.flags.KX_K15==='met'&&ev('ev_kexin_30min').kxAway===true&&noSuppose()); }
  fresh('2027-09-22',18,'dorm'); date('kexin'); await play('ev_kexin_30min',[1,0]); check('6. 便利商店：「……我們大三了，可以吃好一點。」（她還是買了兩個飯糰。）；刑訴：「你坐第幾排？」祐廷「第四排。」「……好險。」；沒有哲 3 不出現阿哲那個選項',has('……我們大三了，可以吃好一點。')&&has('（她還是買了兩個飯糰。）')&&has('你坐第幾排？')&&has('第四排。')&&has('……好險。')&&opts[1].length===2);
  fresh('2027-09-22',18,'dorm'); date('kexin'); await play('ev_kexin_30min',[2,1]); check('6. 妳選：水餃（字幕「公館・水餃店」）；「那就說你中午吃什麼。……現在這碗不算。」',has('三十分鐘的話，水餃。數得出來吃了幾顆。')&&caps.includes('公館・水餃店')&&has('那就說你中午吃什麼。……現在這碗不算。'));
  fresh('2027-09-22',16,'dorm'); date('kexin'); run('2027-09-22',16.75,17.25); ans('y3_k15',1); run('2027-09-22',18,18.75);
  check('6. K3 婉拒：18:30 空碗照片「吃完了。下次換你挑。」；KX_K15 declined；沒有出遊',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('（照片：一個空碗）'),K('吃完了。下次換你挑。')])&&G.flags.KX_K15==='declined'&&!OUT.get(G,'y3_k15'));
  fresh('2027-09-22',16,'dorm'); date('kexin'); run('2027-09-22',16.75,17.25); ans('y3_k15',0); miss('y3_k15'); run('2027-09-22',18.25,18.75);
  check('6. 答應了 18:10 還沒到：18:15「我先吃了。七點有課。」；KX_K15 missed；KX_RUB +1；沒有空碗照片',txt('p:kexin').slice(-1)[0]===K('我先吃了。七點有課。')&&G.flags.KX_K15==='missed'&&G.flags.KX_RUB===1&&!PHONE.sent(G,'y3_k15_photo'),JSON.stringify(txt('p:kexin')));

  // ===== 7. 2-Y3-07 可昕 K11「她來台大聽講座」 =====
  fresh('2027-09-27',20,'dorm'); date('kexin'); run('2027-09-27',20.75,21.25);
  check('7. 9/27 21:00「你們學校這週有一場講座，我想聽。我要去。你要嗎？」；選項「一起去。」「那天我不行。」',txt('p:kexin').slice(-1)[0]===K('你們學校這週有一場講座，我想聽。我要去。你要嗎？')&&JSON.stringify(PHONE.byAsk(G,'y3_k11').ask.opts.map(o=>o.t))===JSON.stringify(['一起去。','那天我不行。']));
  ans('y3_k11',0); { const q=OUT.get(G,'y3_k11'); check('7. 「一起去。」→「好。禮拜三七點，博思。我先占位子。」→ 9/29 19:00 博思（走過去約 8 分鐘）',txt('p:kexin').slice(-1)[0]===K('好。禮拜三七點，博思。我先占位子。')&&!!q&&q.day===D('2027-09-29')&&q.h===19&&q.ev==='ev_kexin_lecture_ntu'&&Math.abs(q.travelH-8/60)<1e-9); }
  picks=[2]; await go('y3_k11',18.8);
  { const W=['（博思的大教室。講座的題目是「平台、新創與新的規則」。可昕坐第三排，筆記寫了兩頁。）','（講者一直說「彈性」。）','你先說。我想知道首都帝大的人怎麼聽。','那你聽到的是我。……下次你要聽講者。'];
    check('7. L1 一起去、選「我在看妳的筆記。」→「那你聽到的是我。……下次你要聽講者。」（逐字）；KX_K11 together；記 attended B6c',JSON.stringify(all().slice(0,4))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「講者的例子太少。」','「例子很好，可是規則誰來訂沒講。」','「我在看妳的筆記。」'])&&G.flags.KX_K11==='together'&&ACTIVITIES.attended(G,'B6c'),JSON.stringify(all())); }
  fresh('2027-09-29',19,'dorm'); date('kexin'); await play('ev_kexin_lecture_ntu',[0]); check('7. 「講者的例子太少。」→ 兩句（彈性、我們聽到的不一樣）',has('我在意的是別的：他一直說『彈性』，沒說是誰的彈性。')&&has('我們聽到的不一樣。很好。'));
  fresh('2027-09-29',19,'dorm'); date('kexin'); await play('ev_kexin_lecture_ntu',[1]); check('7. 「例子很好，可是規則誰來訂沒講。」→「……那是我想問的。你先問到了。」',has('……那是我想問的。你先問到了。'));
  fresh('2027-09-27',20,'dorm'); date('kexin'); run('2027-09-27',20.75,21.25); ans('y3_k11',1);
  check('7. 「那天我不行。」→「好。我自己聽。」；沒有出遊',txt('p:kexin').slice(-1)[0]===K('好。我自己聽。')&&!OUT.get(G,'y3_k11')&&G.flags.KX_K11_SELF===true);
  to('2027-09-29',20.6); G.zone='boya'; { const e=STORY.schedEnt(CHARACTERS.kexin,G); check('7. 作息：9/29 20:30～21:00 可昕在博思一樓的小桌子（圓桌區）',!!e&&e.zone==='boya'&&e.room==='round'); }
  { const T=ev('ev_kexin_lecture_table'); check('7. L2 20:40 走到博思小桌子（npcNear）才演；離太遠不演',(()=>{ npc('kexin',4,2,0); me(4,6,0); const a=!EVENTS.check(T); me(4,3,0); return a&&EVENTS.check(T); })()); }
  await play('ev_kexin_lecture_table'); check('7. L2「講完了。我坐一下再走。」＋「他一直說「彈性」……你沒聽到，我先記著。」；KX_K11 table',JSON.stringify(all())===JSON.stringify(['講完了。我坐一下再走。','他一直說「彈性」，沒說是誰的彈性。……你沒聽到，我先記著。'])&&G.flags.KX_K11==='table');
  run('2027-09-29',21,21.25); check('7. 去了小桌子：21:00 沒有那一則',!PHONE.sent(G,'y3_k11_heard'));
  fresh('2027-09-27',20,'dorm'); date('kexin'); run('2027-09-27',20.75,21.25); ans('y3_k11',1); run('2027-09-29',20.5,21.25);
  check('7. L3 婉拒、沒去：21:00「我先回去了。今天的講座我很喜歡。」；KX_K11 heard',txt('p:kexin').slice(-1)[0]===K('我先回去了。今天的講座我很喜歡。')&&G.flags.KX_K11==='heard');
  fresh('2027-09-27',20,'dorm'); date('kexin'); run('2027-09-27',20.75,21.25); run('2027-09-29',18.25,18.75); check('7. 不回：她照樣自己聽',G.flags.KX_K11_SELF===true&&!OUT.get(G,'y3_k11'));
  fresh('2027-09-27',20,'dorm'); date('kexin'); run('2027-09-27',20.75,21.25); ans('y3_k11',0); miss('y3_k11'); run('2027-09-29',20.5,21.25);
  check('7. 答應了沒到：照「她自己聽」（21:00 那一則）',G.flags.KX_K11_SELF===true&&txt('p:kexin').slice(-1)[0]===K('我先回去了。今天的講座我很喜歡。'));

  // ===== 8. 2-Y3-08 子晴 Q8b「爸爸卡關了」 =====
  const ZQ='heroine_04:';
  fresh('2027-10-06',21,'dorm'); R('heroine_04','ACQ'); run('2027-10-06',21.25,21.75); check('8. 不到 FAMILIAR：沒有訊息',!PHONE.sent(G,'y3_q8b'));
  fresh('2027-10-06',21,'dorm'); R('heroine_04','FAM'); run('2027-10-06',21.25,21.75);
  check('8. 10/6 21:30 三則（不打句號）＋兩個選項',JSON.stringify(txt('p:heroine_04'))===JSON.stringify([ZQ+'你有空嗎',ZQ+'我在公館 騎樓那邊',ZQ+'給你看一個東西 很好笑'])&&JSON.stringify(PHONE.byAsk(G,'y3_q8b').ask.opts.map(o=>o.t))===JSON.stringify(['好，十分鐘。','明天再看？']));
  ans('y3_q8b',1); check('8. 「明天再看？」→「好 那明天」',txt('p:heroine_04').slice(-1)[0]===ZQ+'好 那明天');
  { const Q=ev('ev_ziqing_dad_stuck'); G.zone='gongguan'; to('2027-10-07',22.2); npc('heroine_04',10,18,0); me(10,19,0);
    check('8. Q1 10/7 22:10 到公館、走到她旁邊：可以演；10/9 不演；21:50 不演；23:30 以後不演',EVENTS.check(Q)&&(()=>{ to('2027-10-09',22.2); const a=!EVENTS.check(Q); to('2027-10-07',21.8); const b=!EVENTS.check(Q); to('2027-10-08',23.6); const c=!EVENTS.check(Q); to('2027-10-07',22.2); return a&&b&&c; })()); }
  SOCIAL.remember('heroine_04','PLAYTESTED',''); await play('ev_ziqing_dad_stuck',[2]);
  { const W=['你看。（把手機轉過來）','我爸傳的。「第三關怎麼過。」','他在玩《找插座的貓》。我上個月丟到網路上的。他自己找到的。','……他卡了三天。他三天都在玩。','（笑到彎腰）他真的很爛。跟我五歲的時候一模一樣。','你們兩個是同一個等級的。'];
    check('8. Q1 看過 Q6：當面「你看。（把手機轉過來）」…；選項第三個「我第三關也卡很久。」→「你們兩個是同一個等級的。」（逐字）；記 DAD_PLAYS',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「妳要教他嗎？」','「妳爸很可愛。」','「我第三關也卡很久。」'])&&SOCIAL.has('heroine_04','DAD_PLAYS'),JSON.stringify(all())); }
  fresh('2027-10-06',22.2,'gongguan'); R('heroine_04','FAM'); await play('ev_ziqing_dad_stuck',[2]);
  check('8. Q2 沒看過 Q6：「……我做的。大一就開始做了」；第三個選項「妳做的？」→「對。我沒跟什麼人說。……現在全世界都可以玩了。」',has('他在玩《找插座的貓》。……我做的。大一就開始做了，上個月丟到網路上，他自己找到的。')&&opts[0][2]==='「妳做的？」'&&has('對。我沒跟什麼人說。……現在全世界都可以玩了。'));
  fresh('2027-10-06',22.2,'gongguan'); R('heroine_04','FAM'); await play('ev_ziqing_dad_stuck',[1]); check('8. 「妳爸很可愛。」→「……他會得意。我已經看到他得意的臉了。」',has('……他會得意。我已經看到他得意的臉了。'));
  fresh('2027-10-06',22.2,'gongguan'); R('heroine_04','FAM'); await play('ev_ziqing_dad_stuck',[0]); check('8. 「妳要教他嗎？」→「不要。讓他自己卡。……好啦，給他一個提示。」；Q3 沒有「欸不是」、沒有「你不要跟他講」',has('不要。讓他自己卡。……好啦，給他一個提示。')&&!any(/欸不是|你不要跟他講|不要跟別人講/));
  fresh('2027-10-06',21,'dorm'); R('heroine_04','FAM'); run('2027-10-06',21.25,21.75); run('2027-10-08',22.75,23.25);
  check('8. Q4 三天都沒去：10/8 23:00 三則；記 DAD_PLAYS；事件算演過（階梯、Q10 讀它）；之後當面不演',JSON.stringify(txt('p:heroine_04').slice(-3))===JSON.stringify([ZQ+'我爸傳的「第三關怎麼過」',ZQ+'他在玩我做的遊戲 上個月丟到網路上的 他自己找到的',ZQ+'卡三天了 他真的很爛'])&&SOCIAL.has('heroine_04','DAD_PLAYS')&&!!G.events.done.ev_ziqing_dad_stuck&&(()=>{ G.zone='gongguan'; to('2027-10-08',23.2); npc('heroine_04',0,0,0); return !EVENTS.check(ev('ev_ziqing_dad_stuck')); })());
  fresh('2027-10-06',21,'dorm'); R('heroine_04','FAM'); run('2027-10-06',21.25,21.75); G.events.done.ev_ziqing_dad_stuck=1; run('2027-10-08',22.75,23.25); check('8. 當面演過：10/8 23:00 沒有手機版',!PHONE.sent(G,'y3_q8b_phone'));

  // ===== 9. 2-Y3-09 颱風假 T3a、T3b =====
  fresh('2027-10-12',19,'dorm'); STORY.y3Facts(G); to('2027-10-12',20.1); PHONE.tick(G); check('9. 10/12 20:00 停課新聞「明天停止上班上課。」（story3d.js S.y3Facts）',txt('sys').includes(':明天停止上班上課。'));
  fresh('2027-10-13',19,'dorm'); R('kai','FAM'); run('2027-10-13',19.25,19.75); check('9. T3a 10/13 19:30 阿凱兩則',JSON.stringify(txt('p:kai'))===JSON.stringify(['kai:明天也停課吧','kai:所以我帶豆漿過去']));   /* AA_519 第 9 節第 1 點：大三帶豆漿 */
  { const T=ev('ev_typhoon_y3_noodle'); to('2027-10-13',20.1); check('9. 20:00 人在宿舍房間就演；19:50 不演；23:00 以後不演；不在宿舍不演（回宿舍才演）',EVENTS.check(T)&&(()=>{ to('2027-10-13',19.8); const a=!EVENTS.check(T); to('2027-10-13',23.1); const b=!EVENTS.check(T); to('2027-10-13',21); G.zone='cafe'; const c=!EVENTS.check(T); G.zone='dorm'; return a&&b&&c; })()); }
  R('heroine_04','FAM'); G.flags.TESTER=true; await play('ev_typhoon_y3_noodle',[1]);
  { const W=['（二十分鐘後，阿凱站在門口，雨衣在滴水，手上兩杯熱豆漿。……泡麵，他說他不想再吃了。柏翰在靠窗那張桌子念書，看了一眼，戴上耳塞。）','（阿凱把筆電架在你的書桌上，打視訊給子晴。）','颱風天最適合修 bug。沒人會來吵我。','我們在吵妳。','你們不算人。你們是測試員。','我說過的。測試員。','（舉起豆漿）測試員需要補給。','……好啦。我也去泡一杯。','……好，十二點。'];   /* AA_519 第 9 節第 1 點 */
    check('9. T1 子晴 FAMILIAR、有 TESTER：「你們是測試員。」「我說過的。測試員。」；選「颱風天也要睡覺。」→「……好，十二點。」（逐字）；TYPHOON_Y3',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['陪她修到半夜（視訊開著，各做各的）','「颱風天也要睡覺。」','喝掉阿凱的豆漿'])&&G.flags.TYPHOON_Y3===true,JSON.stringify(all()));
    check('9. 子晴（視訊）的名字框；T4 沒有「欸不是」「這不是問句」',said[2].who==='子晴（視訊）'&&!any(/欸不是|不是問句/));
    const W0=all(), y2=!!G.flags.TYPHOON_Y2_KAI; G.flags.TYPHOON_Y2_KAI=true; G.flags.TESTER=true; await play('ev_typhoon_y3_noodle',[1]); const W2=all();
    check('9. AA_519 5-3、5-4：第一句旁白換成兩杯熱豆漿（不再是「抱著一箱泡麵」）；大二颱風那晚有來的（TYPHOON_Y2_KAI）＝第二句多「（阿凱說：「去年也是我。」）」，其他逐字一樣；沒有的＝沒有這一句',
      !y2&&!W0.some(t=>/去年也是我/.test(t))&&!W0.some(t=>/抱著一箱泡麵/.test(t))&&W2[1]==='（阿凱說：「去年也是我。」）'&&JSON.stringify([W2[0]].concat(W2.slice(2)))===JSON.stringify(W0),JSON.stringify(W2.slice(0,3))); }
  fresh('2027-10-13',20.5,'dorm'); R('kai','FAM'); R('heroine_04','FAM'); await play('ev_typhoon_y3_noodle',[2]);
  check('9. T2 沒有 TESTER：「你們是背景音。」「（舉起豆漿）背景音需要補給。」（AA_519 第 9 節第 1 點）；喝掉豆漿：「這是不可抗力嗎？」祐廷「這是看情況。」',has('你們不算人。你們是背景音。')&&has('（舉起豆漿）背景音需要補給。')&&!has('我說過的。測試員。')&&has('這是不可抗力嗎？')&&has('這是看情況。'));
  fresh('2027-10-13',20.5,'dorm'); R('kai','FAM'); await play('ev_typhoon_y3_noodle',[1]);
  check('9. 和子晴不到 FAMILIAR：沒有視訊，只有阿凱（「那棟」照 AA_376 第 8 項）；「你可以待到幾點？」→「十二點。我知道規定。」',!any(/視訊|修 bug/)&&has('我們那棟停電了。你們這棟還有電。')&&has('（他把吸管插進第一杯。）')&&has('十二點。我知道規定。'));   /* AA_519 第 9 節第 1 點：原本「（他拆了第一包。）」 */
  fresh('2027-10-13',20.5,'dorm'); R('kai','FAM'); R('heroine_04','FAM'); await play('ev_typhoon_y3_noodle',[0]); check('9. 陪她修到半夜：時間到 24:00',G.day===D('2027-10-14')&&G.hour<0.01);
  fresh('2027-10-13',20,'dorm'); join('family_law'); run('2027-10-13',20.75,21.25);
  check('9. T3b 10/13 21:00 家族群組三則（Kevin、溫學姊、學妹）＋三個回覆',JSON.stringify(TH('g:family_law').map(m=>(m.name||m.from)+':'+m.text))===JSON.stringify(['Kevin:明天家族讀書會還要嗎 颱風欸 @學姊','溫學姊:線上。想來的再來。','學妹:……我已經把書收起來了。'])&&JSON.stringify(PHONE.byAsk(G,'y3_t3b').ask.opts.map(o=>o.t))===JSON.stringify(['明天可以休息嗎？','我會上線。','（貼一張鞠躬的企鵝）']));
  ans('y3_t3b',1); { const q=OUT.get(G,'y3_t3b_online');
    check('9. T3 回「我會上線。」：Kevin「不要！」學姊「……那就兩個人上。其他人休息。」；SIS_TYPHOON_Y3 online；10/14 19:00 線上',JSON.stringify(TH('g:family_law').slice(-3).map(m=>(m.name||m.from)+':'+m.text))===JSON.stringify(['player:我會上線。','Kevin:不要！','溫學姊:……那就兩個人上。其他人休息。'])&&G.flags.SIS_TYPHOON_Y3==='online'&&!!q&&q.day===D('2027-10-14')&&q.h===19); }
  /* AA_343 B4（改了這一項的期待值）：AA 補了線上那一段的旁白；沒在公法讀書會的＝「七點五十了。我先下線。」 */
  { const W=['（七點整，線上讀書室只有兩格。兩格的鏡頭都關著。）','（她的麥克風沒有關。翻頁的聲音、螢光筆的蓋子，偶爾一聲很小的「……嗯。」）','（七點五十分，她那一格先打了一行字。）','七點五十了。我先下線。','……颱風天這樣讀，剛好。'];
    caps=[]; await go('y3_t3b_online',18.9); check('9. 10/14 線上那一段：字卡「照常的讀書會」；B4 旁白三句＋（不在公法讀書會）「七點五十了。我先下線。」「……颱風天這樣讀，剛好。」（逐字、順序）；19:50 結束（20:00 是公法讀書會）；SIS_TYPHOON_Y3_ONLINE went',caps.includes('照常的讀書會')&&JSON.stringify(all())===JSON.stringify(W)&&said[3].who!==null&&said[4].who!==null&&Math.abs(G.hour-(19+50/60))<0.01&&G.flags.SIS_TYPHOON_Y3_ONLINE==='went',JSON.stringify([caps,G.hour,all()])); }
  fresh('2027-10-14',19,'dorm',{SIS_TYPHOON_Y3:'online'}); G.acts={att:{['public_law_group@'+D('2025-11-13')]:{end:'full'}}}; await play('ev_typhoon_y3_family');
  check('9. B4 大一去過公法讀書會（STORY.plgY1Count>0）：「八點你們有讀書會。下線吧。」→「……颱風天這樣讀，剛好。」',has('八點你們有讀書會。下線吧。')&&!has('七點五十了。我先下線。')&&idx('……颱風天這樣讀，剛好。')===idx('八點你們有讀書會。下線吧。')+1,JSON.stringify(all()));
  fresh('2027-10-14',19,'dorm',{SIS_TYPHOON_Y3:'online'}); G.acts={att:{['public_law_group@'+D('2027-10-07')]:{end:'full'}}}; await play('ev_typhoon_y3_family');
  check('9. B4 大一沒去、這學期有去：也是「八點你們有讀書會。下線吧。」',has('八點你們有讀書會。下線吧。')&&!has('七點五十了。我先下線。'),JSON.stringify(all()));
  fresh('2027-10-13',20,'dorm'); join('family_law'); run('2027-10-13',20.75,21.25); ans('y3_t3b',1); run('2027-10-14',18.5,19.5,1/12);
  { const q=OUT.get(G,'y3_t3b_online'); check('9. B4 答應了、19:10 還沒上線：什麼都不發生（她不追人、沒有訊息）；SIS_TYPHOON_Y3 照記 online',!!q&&Math.abs(q.late-1/6)<1e-9&&q.state==='missed'&&TH('g:family_law').slice(-1)[0].text==='……那就兩個人上。其他人休息。'&&!TH('p:heroine_05').length&&G.flags.SIS_TYPHOON_Y3==='online',JSON.stringify([q&&q.state,q&&q.late,TH('p:heroine_05').length])); }
  fresh('2027-10-13',20,'dorm'); join('family_law'); run('2027-10-13',20.75,21.25); ans('y3_t3b',2);
  check('9. 貼企鵝：貼出去「（貼圖：鞠躬的企鵝）」；學姊回同一張；Kevin「學姊會用貼圖了！！」',JSON.stringify(TH('g:family_law').slice(-3).map(m=>(m.name||m.from)+':'+m.text))===JSON.stringify(['player:（貼圖：鞠躬的企鵝）','溫學姊:（貼圖：鞠躬的企鵝）','Kevin:學姊會用貼圖了！！'])&&G.flags.SIS_TYPHOON_Y3==='penguin');
  fresh('2027-10-13',20,'dorm'); join('family_law'); run('2027-10-13',20.75,21.25); ans('y3_t3b',0); check('9. 「明天可以休息嗎？」→ 學姊「……好。休息。」',TH('g:family_law').slice(-1)[0].text==='……好。休息。'&&G.flags.SIS_TYPHOON_Y3==='rest');
  fresh('2027-10-13',20,'dorm'); run('2027-10-13',20.75,21.25); check('9. 不在家族群組：沒有 T3b',!PHONE.sent(G,'y3_t3b'));

  // ===== 10. 2-Y3-10 可昕「主線 4 的那通電話」 =====
  const need=n=>{ STORY.neededRec(G).answered=n; };
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(1); run('2027-10-18',22,22.25); check('10. 主線 4 回得少：沒有這通電話',!OUT.get(G,'y3_kx_call1'));
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(7); run('2027-10-18',22,22.25); check('10. B5 門檻 G.needed.answered ≥ 8（AA_343 B5）：回了 7 則＝沒有這通電話',!OUT.get(G,'y3_kx_call1')&&R2Y3A.NEED_MIN===8);
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(8); run('2027-10-18',22,22.25); check('10. B5 回了 8 則＝10/18 22:00 有這通電話',!!OUT.get(G,'y3_kx_call1'));
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(10); check('10. 睡著也會在 22:00 醒來（WAKE_AT）',STORY.lawWakeAt(G)===22);
  run('2027-10-18',21.75,22); { const q=OUT.get(G,'y3_kx_call1'); check('10. 10/18 22:00 起響（演出來的電話、10 分鐘）',!!q&&q.day===D('2027-10-18')&&q.h===22&&Math.abs(q.late-1/6)<1e-9&&q.verb==='接起來'&&q.call===true&&OUT.trip(G,q,true).travelH===0); }
  picks=[]; await go('y3_kx_call1');
  { const W=['（電話。她那邊很安靜，像是在宿舍的走廊。）','你這禮拜幫了幾個人？','搬家、改報告、修電腦。……我都有聽說。','那你自己的事，誰幫？','我知道。我只是想聽你自己說。','好。早點睡。','（她掛掉了。）'];
    check('10. C1 選「……是我。」→「我知道。我只是想聽你自己說。」；最後「好。早點睡。」（她掛掉了。）（逐字）；KX_HELPER_CALL admit；C3 沒有「假設」',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「……是我。」','（轉移話題）','「那妳呢？誰幫妳？」'])&&G.flags.KX_HELPER_CALL==='admit'&&noSuppose(),JSON.stringify(all())); }
  { fresh('2027-10-23',8,'dorm',{KX_HELPER_CALL:'admit'}); date('heroine_03'); date('kexin'); const O=[]; GM.choose=async o=>{ O.push(o.map(q=>q.t)); return o.length-1; }; await STORY.coldWeekSneeze(GM); GM.choose=async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; };
    check('10. C1 10/23 起床：「（傳訊息跟可昕說：我好像感冒了。）」排第一（admit）',!!O[0]&&O[0][0]==='（傳訊息跟可昕說：我好像感冒了。）',JSON.stringify(O));
    fresh('2027-10-23',8,'dorm'); date('heroine_03'); date('kexin'); const O2=[]; GM.choose=async o=>{ O2.push(o.map(q=>q.t)); return o.length-1; }; await STORY.coldWeekSneeze(GM); GM.choose=async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; };
    check('10. 沒有 admit／tell：照原本的順序（語彤先交往的排前面）',!!O2[0]&&O2[0][0]==='（傳訊息跟語彤說：我好像感冒了。）',JSON.stringify(O2)); }
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(10); run('2027-10-18',21.75,22); picks=[1]; await go('y3_kx_call1',22);
  check('10. C2 轉移話題：「好。……今天先不問。」；KX_HELPER_CALL dodge',has('好。……今天先不問。')&&G.flags.KX_HELPER_CALL==='dodge');
  check('10. 10/22 睡著也會在 22:00 醒來',(()=>{ to('2027-10-22',8); return STORY.lawWakeAt(G)===22; })());
  run('2027-10-22',21.75,22); { const q=OUT.get(G,'y3_kx_call2'); check('10. C2 10/22（五）22:00 再一次',!!q&&q.day===D('2027-10-22')&&q.h===22&&q.ev==='ev_kexin_call_helper2'); }
  picks=[0]; await go('y3_kx_call2');
  check('10. 10/22：（電話。）「你感冒的話，會跟誰說？」三選一；「跟妳說。」→「……好。那我等你說。」；KX_HELPER_CALL2 tell',JSON.stringify(all().slice(0,2))===JSON.stringify(['（電話。）','你感冒的話，會跟誰說？'])&&JSON.stringify(opts[0])===JSON.stringify(['「跟妳說。」','「應該不會感冒。」','「我自己會好。」'])&&has('……好。那我等你說。')&&has('好。早點睡。')&&G.flags.KX_HELPER_CALL2==='tell');
  fresh('2027-10-22',22,'dorm'); date('kexin'); await play('ev_kexin_call_helper2',[2]); check('10. 「我自己會好。」→「……嗯。」（她沒有再問。）；「應該不會感冒。」另一句',has('……嗯。')&&has('（她沒有再問。）')&&(async()=>true)());
  fresh('2027-10-22',22,'dorm'); date('kexin'); await play('ev_kexin_call_helper2',[1]); check('10. 「應該不會感冒。」→「每個人感冒以前都這樣講。」',has('每個人感冒以前都這樣講。'));
  fresh('2027-10-18',22,'dorm'); date('kexin'); await play('ev_kexin_call_helper',[2]); check('10. 「那妳呢？誰幫妳？」→「我？我讓予樂幫我。……你也可以讓我幫你。」；ask_back',has('我？我讓予樂幫我。……你也可以讓我幫你。')&&G.flags.KX_HELPER_CALL==='ask_back');
  fresh('2027-10-18',21,'dorm'); date('kexin'); need(10); run('2027-10-18',21.75,22); miss('y3_kx_call1'); run('2027-10-18',22.25,22.5);
  check('10. 沒接（22:10）：「你在忙。……沒事，不是急的。」；KX_HELPER_CALL missed；沒有 10/22 那一通',txt('p:kexin').slice(-1)[0]===K('你在忙。……沒事，不是急的。')&&G.flags.KX_HELPER_CALL==='missed'&&(()=>{ run('2027-10-22',21.75,22.25); return !OUT.get(G,'y3_kx_call2'); })());

  // ===== 11. 2-Y3-11 刑訴旁聽作業 =====
  const cr=key=>CLS.dayItems(G,D(key)).find(it=>it.c.id==='crimpro');
  const inClass=async key=>{ to(key,9.5); const it=cr(key), ct=CLS.content(it); said=[]; const r=await R2Y3A.crClass(GM,it,null,ct); return {it,ct,r}; };
  check('11. courses.js 刑訴第 7 週的 specials 改成「旁聽作業」',COURSES.list.find(c=>c.id==='crimpro').specials.find(s=>s.w===7).title==='旁聽作業');
  fresh('2027-10-19',9,'classroom'); { const {ct}=await inClass('2027-10-19');
    check('11. H1 第 7 週上課：黑板「旁聽作業／一份兩頁的案例說明／第 7～11 週自己去地院旁聽；第 12 週交答辯狀」、第一句「這次作業，三件事。一份案例說明，我發給你們。」；不是「這週我們不在教室」',JSON.stringify(ct.board)===JSON.stringify(['旁聽作業','一份兩頁的案例說明','第 7～11 週自己去地院旁聽；第 12 週交答辯狀'])&&ct.line==='這次作業，三件事。一份案例說明，我發給你們。'&&!/不在教室/.test(ct.line+ct.board.join('')));
    check('11. 接著林教授兩句（第二、第三）；記 CRIMPRO_W7、CRIMPRO_TOLD；不在麵店團＝自己找一天',JSON.stringify(all())===JSON.stringify(['林老師：第二，自己去地方法院旁聽一場刑事庭，日期自己挑。','林老師：第三，你是那個案例的辯護律師，寫一份答辯狀。第十二週交。'])&&G.flags.CRIMPRO_W7===D('2027-10-19')&&G.flags.CRIMPRO_TOLD===true&&G.flags.CRIMPRO_WITH==='self',JSON.stringify(all())); }
  { said=[]; const it=CLS.dayItems(G,D('2027-10-22')).find(x=>x.c.id==='crimpro'); to('2027-10-22',9.5); const r=await R2Y3A.crClass(GM,it,null,CLS.content(it)); check('11. 同一週的週五（第二格）不再講一次',!r&&said.length===0); }
  fresh('2027-10-19',9,'classroom'); G.flags.CRIMPRO_W7=null; { said=[]; const it=CLS.dayItems(G,D('2027-10-22')).find(x=>x.c.id==='crimpro'); to('2027-10-22',9.5); const ct=CLS.content(it); const r=await R2Y3A.crClass(GM,it,null,ct); check('11. 翹了週二、週五來上：第二格的短片段不補講作業',!!ct.second&&!r&&G.flags.CRIMPRO_W7==null); }
  fresh('2027-10-19',9,'classroom'); join('noodle_team'); ['heroine_01','classmate_bohan','zhe','yu'].forEach(meet); await inClass('2027-10-19'); run('2027-10-19',20.75,21.25);
  { const L=TH('g:noodle_team').map(m=>m.from+':'+m.text), m=PHONE.byAsk(G,'y3_cr_grp');
    check('11. 10/19 21:00 麵店團四則（以安「旁聽我禮拜五下午去。開庭表我查好了。」；柏翰句號；阿哲不加句號）',JSON.stringify(L.slice(-4))===JSON.stringify(['heroine_01:旁聽我禮拜五下午去。開庭表我查好了。','classmate_bohan:我週三下午沒課。週三。','zhe:我最後一週再說','yu:阿哲你每次都這樣'])&&!L.some(t=>/今天刑訴發了旁聽作業/.test(t)),JSON.stringify(L));
    check('11. 四個選項（認識的人才有）',!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['我跟以安去。','我週三跟柏翰。','我也最後一週，跟阿哲。','我自己找一天。'])); }
  ans('y3_cr_grp',0); { const q=OUT.get(G,'y3_cr_an'); check('11. H2「我跟以安去。」→ 10/22（五）13:30 地方法院大門口；當天 12:30 鬧鐘',!!q&&q.day===D('2027-10-22')&&q.h===13.5&&q.alarm===true&&(()=>{ const a=STORY.alarmsFor?null:null; return true; })()); }
  check('11. 約了以安、那天還沒過：出遊選單沒有「自己去」',(()=>{ to('2027-10-20',13.2); return !R2Y3A.crSelfOpen(G); })());
  picks=[]; await go('y3_cr_an',12.9);
  { const W=['（法院的走廊很長，椅子上坐滿了等開庭的人。有一個阿姨一直在看手上的通知單。）','（法庭比你想的小。旁聽席三排，坐了不到一半。）','（法官進來的時候，大家站起來。坐下的時候，有人的椅子響了一聲。）','（檢察官念起訴的事實，念得很快。被告坐在前面，背對著你們，一直低著頭。）','（辯護人問證人：「你那天站在哪裡？」證人想了很久。）',
      '證人想那麼久，是在想答案，還是在想怎麼說。','答辯狀我今天晚上就寫。你呢？','（你照作業的格式，用辯護律師的口氣寫了一份答辯狀。寫到半夜，第二天交了出去。）'];
    check('11. H2 旁聽那天（逐字）：以安兩句；當晚答辯狀；CRIMPRO_HW done、CRIMPRO_WITH an；H4 沒有 CG-16、沒有全班',JSON.stringify(all())===JSON.stringify(W)&&G.flags.CRIMPRO_HW==='done'&&G.flags.CRIMPRO_WITH==='an'&&G.flags._CR_WITH===undefined&&!any(/全班|同學們一起/),JSON.stringify(all())); }
  check('11. 交了：出遊選單不再有「地方法院（旁聽）」',(()=>{ to('2027-10-26',13.2); return !R2Y3A.crSelfOpen(G); })());
  { const {r}=await inClass('2027-11-23'); check('11. 第 12 週 11/23：（答辯狀在你的資料夾裡，已經交了。）',r&&JSON.stringify(all())===JSON.stringify(['（答辯狀在你的資料夾裡，已經交了。）'])); }
  { const {r}=await inClass('2027-11-30'); check('11. 第 13 週 11/30 發回：三句輪流一句（不寫法律內容）',r&&said.length===1&&R2Y3A.CR_RETURN.map(t=>'林老師：'+t).includes(said[0].t)); }
  fresh('2027-10-19',9,'classroom'); join('noodle_team'); ['heroine_01','classmate_bohan','zhe','yu'].forEach(meet); await inClass('2027-10-19'); run('2027-10-19',20.75,21.25); ans('y3_cr_grp',1);
  check('11. 「我週三跟柏翰。」→ 10/20（三）13:30',(q=>!!q&&q.day===D('2027-10-20')&&q.h===13.5)(OUT.get(G,'y3_cr_bohan')));
  await go('y3_cr_bohan',13); check('11. 柏翰：「……和考古題完全不一樣。」；沒有以安那兩句',has('……和考古題完全不一樣。')&&!has('答辯狀我今天晚上就寫。你呢？')&&G.flags.CRIMPRO_WITH==='bohan');
  fresh('2027-10-19',9,'classroom'); join('noodle_team'); ['heroine_01','classmate_bohan','zhe','yu'].forEach(meet); await inClass('2027-10-19'); run('2027-10-19',20.75,21.25); ans('y3_cr_grp',2);
  check('11. 「我也最後一週，跟阿哲。」→ 11/16（二）13:30；旁聽「我一直在看那個阿姨。」',(q=>!!q&&q.day===D('2027-11-16')&&q.h===13.5)(OUT.get(G,'y3_cr_zhe'))&&(await go('y3_cr_zhe',13),has('我一直在看那個阿姨。')));
  fresh('2027-10-19',9,'classroom'); join('noodle_team'); ['heroine_01','classmate_bohan','zhe','yu'].forEach(meet); await inClass('2027-10-19'); run('2027-10-19',20.75,21.25); ans('y3_cr_grp',3);
  check('11. 「我自己找一天。」：第 7～11 週平日 13:00～14:00 出遊選單多「地方法院（旁聽）」；週末、12:00、14:00、第 12 週沒有',(()=>{ to('2027-10-21',13.2); const a=R2Y3A.crSelfOpen(G); to('2027-10-23',13.2); const b=!R2Y3A.crSelfOpen(G); to('2027-10-21',12); const c=!R2Y3A.crSelfOpen(G); to('2027-10-21',14); const d=!R2Y3A.crSelfOpen(G); to('2027-11-23',13.2); const e=!R2Y3A.crSelfOpen(G); return a&&b&&c&&d&&e; })());
  run('2027-10-21',12.75,13.25); { const q=OUT.get(G,'y3_cr_self_'+D('2027-10-21')); check('11. 自己那一天的出遊：13:30 出發、13:00 起問',!!q&&q.h===13.5&&q.ask===D('2027-10-21')*24+13&&q.crWith==='self'&&!!OUT.due(G)); }
  await go('y3_cr_self_'+D('2027-10-21'),13.2); check('11. 自己去的：（走出法院，你在門口站了一下，才去搭車。）；沒有同學的句子',has('（走出法院，你在門口站了一下，才去搭車。）')&&!any(/證人想那麼久|考古題|那個阿姨/)&&G.flags.CRIMPRO_HW==='done'&&G.flags.CRIMPRO_WITH==='self');
  fresh('2027-10-19',9,'classroom',{MET_ZHE:false}); noZhe(); join('noodle_team'); ['classmate_bohan','yu'].forEach(meet); run('2027-10-19',20.75,21.25);
  { const L=txt('g:noodle_team'); check('11. 翹了第 7 週：21:00 群組多柏翰兩則（在前面）；只有認識的人說話（不認識以安、阿哲＝沒有他們那兩則）；選項只有柏翰和自己',JSON.stringify(L.slice(-4))===JSON.stringify(['classmate_bohan:今天刑訴發了旁聽作業。','classmate_bohan:自己去地院旁聽，第十二週交答辯狀。你記得。','classmate_bohan:我週三下午沒課。週三。','yu:阿哲你每次都這樣'])&&JSON.stringify(PHONE.byAsk(G,'y3_cr_grp').ask.opts.map(o=>o.t))===JSON.stringify(['我週三跟柏翰。','我自己找一天。']),JSON.stringify(L)); }
  zheBack();
  fresh('2027-10-19',9,'classroom'); await inClass('2027-10-19'); run('2027-11-22',9,9); { const {r}=await inClass('2027-11-23'); check('11. H3 都沒去：第 12 週「旁聽作業，還有幾位沒交。」；CRIMPRO_HW none；第 13 週沒有發回',r&&has('林老師：旁聽作業，還有幾位沒交。')&&G.flags.CRIMPRO_HW==='none'&&!(await inClass('2027-11-30')).r); }

  // ===== 12. 2-Y3-12 慈 4「很爛的那一句」 =====
  fresh('2027-10-19',21,'dorm'); R('yu','FAM'); run('2027-10-19',21.25,21.75);
  check('12. 10/19 21:30 Alison 三則（避開 21:00 的刑訴群組）＋兩個回覆',JSON.stringify(txt('p:yu'))===JSON.stringify(['yu:欸 芯慈跟以安吵架了','yu:吵很大','yu:你明天中午在A館嗎'])&&JSON.stringify(PHONE.byAsk(G,'y3_ci4_yu').ask.opts.map(o=>o.t))===JSON.stringify(['在。','怎麼了？']));
  ans('y3_ci4_yu',1); check('12. 「怎麼了？」→「我也不知道 她們在討論室 我在門外」',txt('p:yu').slice(-1)[0]==='yu:我也不知道 她們在討論室 我在門外');
  fresh('2027-10-19',21,'dorm'); run('2027-10-19',21.25,21.75); check('12. 和 Alison 不到 FAMILIAR：沒有這三則',!PHONE.sent(G,'y3_ci4_yu'));
  fresh('2027-10-20',12.3,'linze'); R('classmate_xinci','FAM'); { const e=STORY.schedEnt(CHARACTERS.classmate_xinci,G); check('12. 作息：10/20 12:10～12:40 芯慈在霖澤館二樓走廊',!!e&&e.zone==='linze'&&e.at[3]===1); }
  { const B=ev('ev_xinci_bad_line'); npc('classmate_xinci',1.2,-5.2,1); me(0,-5,1);
    check('12. 在二樓、她在走廊：可以演；一樓不演；12:45 不演；不到 FAMILIAR 不演',EVENTS.check(B)&&(()=>{ me(0,-5,0); const a=!EVENTS.check(B); me(0,-5,1); to('2027-10-20',12.75); const b=!EVENTS.check(B); to('2027-10-20',12.3); R('classmate_xinci','ACQ'); const c=!EVENTS.check(B); R('classmate_xinci','FAM'); return a&&b&&c; })()); }
  SOCIAL.remember('classmate_xinci','XINCI_SECOND',''); await play('ev_xinci_bad_line',[0]);
  { const W=['你聽說了吧。','你知道第二名的事。所以你大概懂。','我跟她說，「妳什麼都不用努力就有」。','那句話很爛。我說的時候就知道很爛。','（很久）……我只是想讓她也痛一次。','要。','（她說得很快。）','可是還不是現在。現在道歉，我會一邊道歉一邊想她會怎麼回。'];
    check('12. X1 有 XINCI_SECOND：「你知道第二名的事。所以你大概懂。」；X2 沒去過讀書會＝沒有「她對自己比對別人嚴」；道歉那一支（逐字）；CI4 sorry',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「妳要跟她道歉嗎？」','「妳也很累。」'])&&G.flags.CI4==='sorry',JSON.stringify(all())); }
  fresh('2027-10-20',12.3,'linze'); R('classmate_xinci','FAM'); G.acts={att:{['public_law_group@'+D('2026-03-05')]:{h:20,end:'full'}}}; await play('ev_xinci_bad_line',[0]);
  check('12. 加入過公法讀書會：「她對自己比對別人嚴。」→（芯慈愣住。）「……我知道。」（她看著窗外。）「所以那句話更爛。」；CI4 strict',opts[0][0]==='「她對自己比對別人嚴。」'&&has('（芯慈愣住。）')&&has('……我知道。')&&has('（她看著窗外。）')&&has('所以那句話更爛。')&&G.flags.CI4==='strict');
  fresh('2027-10-20',12.3,'linze'); R('classmate_xinci','FAM'); await play('ev_xinci_bad_line',[1]); check('12. 「妳也很累。」→（她轉頭看你，沒說話。過了一下：）「……嗯。」；CI4 tired（AA_343 B6：旁白第二人稱）',has('（她轉頭看你，沒說話。過了一下：）')&&!has('（她轉頭看他，沒說話。過了一下：）')&&has('……嗯。')&&G.flags.CI4==='tired');

  // ===== 13. 2-Y3-13 以安新 14「她選了行政法院」 =====
  fresh('2027-10-21',17.75,'noodle'); R('heroine_01','FAM');
  { const e=STORY.schedEnt(CHARACTERS.heroine_01,G); check('13. 作息：10/21 17:30～19:40 以安在麵店',!!e&&e.zone==='noodle'); }
  { const A=ev('ev_an_admin_court'); npc('heroine_01',1,2,0); me(1,3,0); check('13. A1 17:45 到麵店、走到她旁邊：可以演；19:45 不演；不到 FAMILIAR 不演',EVENTS.check(A)&&(()=>{ to('2027-10-21',19.75); const a=!EVENTS.check(A); to('2027-10-21',17.75); R('heroine_01','ACQ'); const b=!EVENTS.check(A); R('heroine_01','FAM'); return a&&b; })()); }
  await play('ev_an_admin_court',[1]);
  { const W=['（麵店的長桌。以安比平常晚到，手帳裡夾著一張開庭表。）','今天下午，我先去了一趟行政法院。','一個人告區公所。他坐左邊，區公所的人坐右邊。','他帶了一個資料夾，裡面全部是收據。區公所來了兩個人，一人一台筆電。','刑訴的作業不是要去地院嗎？','那個禮拜五去。今天這個是我自己想看的。',
      '禮拜五去。','（她停了一下。）','刑事庭的旁聽席，有人會認得我。行政法院不會。','認得妳？妳是明星喔。','……不是。麵要糊了。','（七點四十，她看了一下錶，把麵吃完。）','讀書會。我先走。'];
    check('13. A2「妳怎麼不去刑事庭？」→「刑事庭的旁聽席，有人會認得我。」；認識阿哲多四句；不說原因（逐字）；AN14 there、記 AN_ADMIN_COURT',JSON.stringify(all())===JSON.stringify(W)&&G.flags.AN14==='there'&&SOCIAL.has('heroine_01','AN_ADMIN_COURT')&&!any(/媽媽|法官的女兒/),JSON.stringify(all())); }
  fresh('2027-10-21',17.75,'noodle',{MET_ZHE:false}); noZhe(); R('heroine_01','FAM'); await play('ev_an_admin_court',[0]); zheBack();
  check('13. 不認識阿哲：沒有阿哲那兩段；「一個人對兩台筆電？」→「嗯。可是法官一直讓他講完。」（她把開庭表摺起來。）「……我在想，那是規定，還是那個法官。」',!any(/刑訴的作業不是要去地院嗎|明星/)&&has('嗯。可是法官一直讓他講完。')&&has('（她把開庭表摺起來。）')&&has('……我在想，那是規定，還是那個法官。'));
  fresh('2027-10-21',17.75,'noodle'); R('heroine_01','FAM'); await play('ev_an_admin_court',[2]); check('13. 「下次我也想去。」→「好。開庭表我傳給你。……要早到，旁聽席很小。」',has('好。開庭表我傳給你。……要早到，旁聽席很小。'));
  fresh('2027-10-21',21,'dorm'); join('noodle_team'); meet('heroine_01'); run('2027-10-21',21.75,22.25);
  check('13. A3 沒去麵店：22:00 麵店團兩則（有句號；AA_462 第 1 節換字「我先去了一趟……自己想看的。」）；AN14 group；記 AN_ADMIN_COURT',JSON.stringify(txt('g:noodle_team').slice(-2))===JSON.stringify(['heroine_01:今天下午我先去了一趟行政法院。自己想看的。','heroine_01:是一個人告區公所。'])&&G.flags.AN14==='group'&&SOCIAL.has('heroine_01','AN_ADMIN_COURT'));
  fresh('2027-10-21',21,'dorm'); R('heroine_01','FRI'); run('2027-10-21',21.75,22.25); check('13. 不在群組、FRIEND 以上：私訊同兩句',JSON.stringify(txt('p:heroine_01').slice(-2))===JSON.stringify(['heroine_01:今天下午我先去了一趟行政法院。自己想看的。','heroine_01:是一個人告區公所。']));
  fresh('2027-10-21',21,'dorm',{AN14:'there'}); join('noodle_team'); meet('heroine_01'); run('2027-10-21',21.75,22.25); check('13. 演過了：沒有群組那兩則',!PHONE.sent(G,'y3_an14_msg'));

  // ===== 14. 2-Y3-14 翰 4（AA_343 B7，569621e0 改四樓：標題「四樓的樓梯間」、4F 樓梯間、「（他看著那扇刷卡的門很久。）」；「台階」、選項、「走了兩階」照原文）=====
  fresh('2027-11-09',12.5,'linze_4f'); R('classmate_bohan','FAM');
  { const e=STORY.schedEnt(CHARACTERS.classmate_bohan,G), st=(()=>{ const t=fs.readFileSync(path.join(ROOT,'src/data/linze_upper_layouts.js'),'utf8'), i=t.indexOf('{'); return JSON.parse(t.slice(i,t.lastIndexOf('}')+1))['4f'].stairs; })();
    check('14. 作息：第 10 週平日 12:10～13:00 柏翰在霖澤館 4F（linze_4f）樓梯間門前（往 5F 那扇門要刷教職員證）',!!e&&e.zone==='linze_4f'&&(e.at[3]|0)===0&&Math.hypot(e.at[0]-st.door.x,e.at[1]-st.door.z)<1.5&&/刷教職員證/.test(st.up.closed),JSON.stringify(e&&[e.zone,e.at])); }
  { const B=ev('ev_bohan_third_floor'); npc('classmate_bohan',6.2,-6.3,0); me(7,-5.5,0); check('14. 第 10 週平日 12:30 在 4F、走到他旁邊：可以演；第 11 週不演；週六不演；人在二樓（linze）不演',EVENTS.check(B)&&(()=>{ to('2027-11-16',12.5); const a=!EVENTS.check(B); to('2027-11-13',12.5); const b=!EVENTS.check(B); to('2027-11-09',12.5); G.zone='linze'; const c=!EVENTS.check(B); G.zone='linze_4f'; return a&&b&&c; })()); }
  SOCIAL.remember('classmate_bohan','ASKED_BACK',''); await play('ev_bohan_third_floor',[0]);
  { const W=['（看到祐廷，沒有站起來）……你不要說話。','刑訴。我最喜歡的一科。平均以下。','你知道我為什麼每天念六小時嗎。','不是因為我很認真。是因為我不念，就跟不上你們。','我哥念電機，一天念兩小時。我們家只有我需要六小時。','我問大家考幾分，是想確定我沒有輸太多。','……那天你反問我。我回家想了很久，為什麼我不敢反問別人。','（他看著那扇刷卡的門很久。）','……我的。','（他笑了一下，很小。）'];
    check('14. B1 大一反問過他：「那天你反問我。我回家想了很久……」；B3 選第一個＝（他看著那扇刷卡的門很久。）（他笑了一下，很小。），沒有「他第一次笑」（逐字）；記 BOHAN_HONEST',JSON.stringify(all())===JSON.stringify(W)&&!any(/第一次笑|不是你哥念的|封鎖線/)&&SOCIAL.has('classmate_bohan','BOHAN_HONEST'),JSON.stringify(all())); }
  fresh('2027-11-09',12.5,'linze_4f'); R('classmate_bohan','FAM'); await play('ev_bohan_third_floor',[1]); check('14. 「你跟上了啊。你還坐在第一排。」→「第一排是因為我怕坐後面聽不到。」（他說完自己笑了。）就結束（「這是我第一次跟人說這個。」AA-C 交班時拿掉）；沒有 ASKED_BACK 那句',has('第一排是因為我怕坐後面聽不到。')&&has('（他說完自己笑了。）')&&!has('這是我第一次跟人說這個。')&&!has('……那天你反問我。我回家想了很久，為什麼我不敢反問別人。'));
  fresh('2027-11-09',12.5,'linze_4f'); R('classmate_bohan','FAM'); await play('ev_bohan_third_floor',[2]); check('14. 坐在台階（選項照原文「（在他旁邊的台階坐下）」）：坐到鐘響、「今天的事，……就到這裡。」、「（走了兩階又停下來：）」、「……下次我考好了，那個你可以說。」',opts[0][2]==='（在他旁邊的台階坐下）'&&has('（兩個人坐到下一節課的鐘響。他站起來：）')&&has('今天的事，……就到這裡。')&&has('（走了兩階又停下來：）')&&has('……下次我考好了，那個你可以說。'));
  check('14. B7 標題「四樓的樓梯間」（id 不變）',ev('ev_bohan_third_floor').title==='四樓的樓梯間'&&ev('ev_bohan_third_floor').location==='linze_4f');
  { const M=SOCIAL.MEMORY_LABEL, W={MOUNTAIN_DAY:'跟他去爬山，看了那棵一千歲的紅檜',FANG_KNOWS_ECON:'跟他說，自己換過一次跑道',DAD_PLAYS:'她爸爸在玩她做的遊戲，卡在第三關',BOHAN_HONEST:'他說了為什麼每天念六小時',FIELD_NOTES_IDEA:'跟她說，田野的訪問可以整理成她自己的東西'};
    check('14. B10 人物面板名稱照 AA_343 第 5 節（五項）',Object.keys(W).every(k=>M[k]===W[k]),JSON.stringify(Object.keys(W).map(k=>M[k]))); }
  G.events.done.ev_bohan_scores=1; run('2027-11-18',21.5,21.75); check('14. B2 柏翰接讀書會（沒有 STUDYGROUP_LEADER、演過 ev_bohan_scores）：11/18 21:40「白板那張表我還留著。這學期換成大家輪流寫。」',txt('p:classmate_bohan').slice(-1)[0]==='classmate_bohan:白板那張表我還留著。這學期換成大家輪流寫。');
  fresh('2027-11-09',12.5,'linze',{STUDYGROUP_LEADER:true}); R('classmate_bohan','FAM'); G.events.done.ev_bohan_scores=1; G.events.done.ev_bohan_third_floor=1; run('2027-11-18',21.5,21.75); check('14. 祐廷接了讀書會：沒有那一則',!PHONE.sent(G,'y3_bohan_w11'));

  // ===== 15. 2-Y3-15 校慶（大三版） =====
  fresh('2027-11-12',20,'dorm',{lawclub:true}); join('lawclub_study'); run('2027-11-12',20.75,21.25);
  check('15. 11/12 21:00 柏翰在法服群組兩則（句號收尾）＋「我。」',JSON.stringify(txt('g:lawclub_study').slice(-2))===JSON.stringify(['classmate_bohan:明天校慶。法服的攤位十點開。','classmate_bohan:早上誰可以來搬桌子。'])&&JSON.stringify(PHONE.byAsk(G,'y3_fair_ask').ask.opts.map(o=>o.t))===JSON.stringify(['我。']));
  ans('y3_fair_ask',0); check('15. 「我。」→「好。九點半。」；FAIR_Y3_HELP',txt('g:lawclub_study').slice(-1)[0]==='classmate_bohan:好。九點半。'&&G.flags.FAIR_Y3_HELP===true);
  fresh('2027-11-13',12.2,'campus',{lawclub:true,GRANDMA_TREE_Y2:'asked'}); R('heroine_05','FAM'); ['heroine_04','kai'].forEach(meet);
  check('15. 法服成員：攤位版可以演、路過版不演（同一個帳篷 near、11/13 10:00～16:00）',EVENTS.check(ev('ev_fair_booth_y3'))&&!EVENTS.check(ev('ev_fair_booth_y3_pass'))&&JSON.stringify(ev('ev_fair_booth_y3').near)===JSON.stringify({x:-17.8,z:13.0,r:4.5}));
  await play('ev_fair_booth_y3',[0]);
  { const W=['（椰影大道。法服的攤位在第三個帳篷。柏翰把「法律問答」的牌子立好，又調了兩次角度。）','少年欸，你又在這。','那棵芭樂，隔壁說過年前要剪。我在等他。','講了。他說好。……好不好，過年就知道。','（抱著一疊訪談稿，從攤位前面經過）今天人好多。','學弟妹不會的，會跑去問你吧。……我回研究室了。','（隔壁吉他社的攤位，子晴在賣自己畫的插座貓貼紙。賣了三張，三張都是阿凱買的。）'];
    check('15. F1 法服成員、大二遇過阿嬤：「少年欸，你又在這。」三選一（芭樂的事還沒解決）；12:10 學姊兩句；F3 子晴貼紙（逐字）；FAIR_Y3 booth；GRANDMA_TREE_Y2 不改',JSON.stringify(all())===JSON.stringify(W)&&G.flags.FAIR_Y3==='booth'&&G.flags.GRANDMA_TREE_Y2==='asked',JSON.stringify(all()));
    check('15. F4 學姊沒有條列、沒有「重點是」',!any(/重點是|第一，|第二，/)); }
  fresh('2027-11-13',11,'campus',{lawclub:true}); R('heroine_05','FAM'); await play('ev_fair_booth_y3',[0]); check('15. 沒遇過阿嬤：沒有三選一；11:00 沒有學姊；不認識子晴阿凱沒有貼紙',opts.length===0&&!any(/阿嬤|少年欸|訪談稿|插座貓/));
  fresh('2027-11-13',12.2,'campus',{GRANDMA_TREE_Y2:'heard'}); R('heroine_05','FAM'); check('15. 不是法服成員：路過版可以演',EVENTS.check(ev('ev_fair_booth_y3_pass'))&&!EVENTS.check(ev('ev_fair_booth_y3')));
  await play('ev_fair_booth_y3_pass');
  check('15. F2 不是成員、和學姊熟：「你。……算了，今年不抓你。」；阿嬤揮手；沒有選項；FAIR_Y3 pass',JSON.stringify(all())===JSON.stringify(['（法服的攤位前，柏翰在跟一個人講話，筆記寫了半頁。）','（攤位旁邊的阿嬤看到你，揮了一下手。）','你。……算了，今年不抓你。'])&&opts.length===0&&G.flags.FAIR_Y3==='pass');

  // ===== 16. 2-Y3-16 C4 阿哲的機車 =====
  fresh('2027-11-19',20,'dorm'); R('zhe','FAM'); run('2027-11-19',20.75,21.25);
  check('16. 11/19 21:00 阿哲四則（一則一則、不加句號）；選項只有「去法服問」（沒有 U_TORT）',JSON.stringify(txt('p:zhe'))===JSON.stringify(['zhe:我剛在路口被一台車擦到','zhe:我沒事啦 人好好的 車殼裂了','zhe:對方說他趕時間 要給我一千塊 叫我簽一張紙','zhe:要簽嗎'])&&JSON.stringify(PHONE.byAsk(G,'y3_c4').ask.opts.map(o=>o.t))===JSON.stringify(['找對方談。後面怎麼賠，我們去法服問。']));
  ans('y3_c4',0);
  check('16. 回了：祐廷「先不要簽。拍照、報警做紀錄。」→ 選的那句 →「你真正想要的是什麼？」→ 阿哲 → 祐廷 → 阿哲（逐字）；記 ZHE_SCOOTER',JSON.stringify(txt('p:zhe').slice(4))===JSON.stringify(['player:先不要簽。拍照、報警做紀錄。','player:找對方談。後面怎麼賠，我們去法服問。','player:你真正想要的是什麼？','zhe:……我想要我的車修好 然後不要再想這件事','player:那就照修車的估價談，談好寫清楚。','zhe:好 我先拍照'])&&SOCIAL.has('zhe','ZHE_SCOOTER'),JSON.stringify(txt('p:zhe')));
  { const S2=ev('ev_zhe_scooter'); to('2027-11-23',18); G.zone='noodle'; npc('zhe',0,2,0); me(0,3,0); const NN=(()=>{ for(let d=D('2027-11-24');d<D('2027-12-10');d++){ const w=wdOf(d); if(w>=1&&w<=5&&!STORY.noodleDay(d)) return CALENDAR.dateOf(d).key; } return '2027-11-24'; })();   /* AA_542 第 5 節：麵店日每週不固定兩天（11/23 那週是週二、週三）*/
    check('16. S2 之後第一次在麵店（11/23 起的麵店日 17:30～20:30）：可以演；11/19 不演；不是麵店日（'+NN+'）不演',STORY.noodleDay(D('2027-11-23'))&&EVENTS.check(S2)&&(()=>{ to('2027-11-18',18); const a=!EVENTS.check(S2); to(NN,18); const b=!EVENTS.check(S2); to('2027-11-23',18); return a&&b; })()); }
  await play('ev_zhe_scooter'); check('16. S2「修車行估了價。對方照估價付了。」「（把他碗裡的滷蛋夾一半給你）法律系的好處是，有人陪你不簽字。」',JSON.stringify(all())===JSON.stringify(['修車行估了價。對方照估價付了。','（把他碗裡的滷蛋夾一半給你）法律系的好處是，有人陪你不簽字。']));
  fresh('2027-11-19',20,'dorm',{U_TORT:true}); R('zhe','FAM'); run('2027-11-19',20.75,21.25);
  check('16. S1 有 U_TORT：多「保險公司會來談」那個選項',(m=>!!m&&m.ask.opts.length===2&&m.ask.opts[1].t==='如果是對方不小心造成的，修車費可以要他賠。他有保第三人責任險的話，保險公司會來談。')(PHONE.byAsk(G,'y3_c4')));
  fresh('2027-11-19',20,'dorm'); R('zhe','FAM'); run('2027-11-19',20.75,21.25); run('2027-11-20',17.75,18.25);
  check('16. 沒回（隔天 18:00）：「沒事啦 我沒簽 明天去修車」；沒有記憶；麵店那一場不演',txt('p:zhe').slice(-1)[0]==='zhe:沒事啦 我沒簽 明天去修車'&&!SOCIAL.has('zhe','ZHE_SCOOTER')&&(()=>{ to('2027-11-23',18); G.zone='noodle'; npc('zhe',0,2,0); me(0,3,0); return !EVENTS.check(ev('ev_zhe_scooter')); })());

  // ===== 17. 2-Y3-17 語彤事件 14「續約」 =====
  fresh('2027-11-24',15.4,'dorm'); STORY.y3Facts(G); check('17. 11/24 15:30 以前沒有 RENT_RENEWED',!G.flags.RENT_RENEWED);
  to('2027-11-24',15.5); STORY.y3Facts(G); check('17. R4 11/24 15:30 一律記 RENT_RENEWED（劇情事實，不在場也記）',G.flags.RENT_RENEWED===true);
  fresh('2027-11-23',20,'dorm',{lawclub:true}); join('lawclub_study'); run('2027-11-23',20.75,21.25);
  check('17. 法服成員：11/23 21:00 柏翰「明天下午兩點半，麵店。續約的談話，要一個人做紀錄。」＋「我去。」',txt('g:lawclub_study').slice(-1)[0]==='classmate_bohan:明天下午兩點半，麵店。續約的談話，要一個人做紀錄。'&&JSON.stringify(PHONE.byAsk(G,'y3_lease_fafu').ask.opts.map(o=>o.t))===JSON.stringify(['我去。']));
  ans('y3_lease_fafu',0); { const q=OUT.get(G,'y3_lease'); check('17. 「我去。」→「好。」→ 11/24 14:30 麵店',txt('g:lawclub_study').slice(-1)[0]==='classmate_bohan:好。'&&!!q&&q.day===D('2027-11-24')&&q.h===14.5&&q.ev==='ev_yt_lease_renew'); }
  G.flags.YT_LEASE_HELP=true; picks=[0]; await go('y3_lease',14);
  { const W=['（麵店的鐵門拉起一半。桌上有兩樣東西：一張二十年的繳租時間表，和語彤的筆記本，上面抄著老客人說的話。）','（那張時間表是你排的。）','（新屋主三十多歲，穿西裝，看著時間表和語彤的筆記，沒說話。）','（阿姨端了一碗麵給他：「先吃。」）','（他吃了兩口，停住。）',
      '……我高中的時候來過。補習完。','我那時候都點餛飩湯。','你點的是乾麵加滷蛋。你記錯了。','（笑出來）……對。乾麵。','五年。租金照市價調一點，可以嗎？','……可以。','（轉身，手在發抖，拿起刀）不要看我，蔥要切。','我也要學休息。妳也是。','紀錄給我一份。'];
    check('17. R1 法服成員、去了（逐字）：有 YT_LEASE_HELP 多「（那張時間表是你排的。）」；「（把紀錄存好）」→ 律師「紀錄給我一份。」；YT_EV14 there',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['（把紀錄存好）','（看語彤）'])&&G.flags.YT_EV14==='there',JSON.stringify(all())); }
  fresh('2027-11-23',20,'dorm'); date('heroine_03'); run('2027-11-23',20.75,21.25);
  check('17. 和語彤交往中、不是法服成員：語彤私訊「明天下午兩點半 阿姨要談續約」「……你坐我旁邊就好」',JSON.stringify(txt('p:heroine_03').slice(-2))===JSON.stringify(['heroine_03:明天下午兩點半 阿姨要談續約','heroine_03:……你坐我旁邊就好'])&&JSON.stringify(PHONE.byAsk(G,'y3_lease_yt').ask.opts.map(o=>o.t))===JSON.stringify(['好。','那天我不行。']));
  ans('y3_lease_yt',0); await go('y3_lease',14);
  check('17. R2 交往中：阿姨「（看你）你也是。禮拜四把她帶走，不要讓她來店裡。」語彤「阿姨。」；沒有「把紀錄存好」；（看語彤）的旁白',has('（看你）你也是。禮拜四把她帶走，不要讓她來店裡。')&&has('阿姨。')&&JSON.stringify(opts[0])===JSON.stringify(['（看語彤）'])&&has('（語彤低著頭，在筆記本最後一頁寫了一行字，沒有給你看。）')&&!has('（那張時間表是你排的。）'));
  fresh('2027-11-23',20,'dorm',{lawclub:true}); join('lawclub_study'); date('heroine_03'); await play('ev_yt_lease_renew',[0]); check('17. 交往中、又是法服成員：紀錄由律師做（沒有「把紀錄存好」）',JSON.stringify(opts[0])===JSON.stringify(['（看語彤）']));
  fresh('2027-11-23',20,'dorm'); date('heroine_03'); run('2027-11-23',20.75,21.25); ans('y3_lease_yt',1); check('17. 「那天我不行。」→「嗯 沒關係」；沒有出遊',txt('p:heroine_03').slice(-1)[0]==='heroine_03:嗯 沒關係'&&!OUT.get(G,'y3_lease'));
  fresh('2027-11-25',18,'noodle'); R('heroine_03','FAM'); SOCIAL.remember('heroine_03','RENT_CONSULTATION','');
  { const T=ev('ev_yt_lease_retell'); check('17. R3 都沒去：11/25 起麵店跟她說話＝轉述（interact）；11/24 不演；12/15 不演',T.trigger==='interact'&&EVENTS.check(T)&&(()=>{ to('2027-11-24',18); const a=!EVENTS.check(T); to('2027-12-15',18); const b=!EVENTS.check(T); to('2027-11-25',18); return a&&b; })()); }
  await play('ev_yt_lease_retell'); check('17. R3 轉述四句（「他高中的時候」照 AA_376 第 10 項；有 RENT_CONSULTATION 多「法服那次說的，後來都用上了。」）；YT_EV14 heard',JSON.stringify(all())===JSON.stringify(['阿姨續約了。五年，寫成書面的。','……新屋主說，他高中的時候也來這裡吃過麵。','阿姨要請一個工讀生。禮拜四。','法服那次說的，後來都用上了。'])&&G.flags.YT_EV14==='heard');
  fresh('2027-11-25',18,'dorm'); R('heroine_03','FAM'); run('2027-12-14',20.75,21.25);
  check('17. 轉述的窗口都沒遇到：12/14 21:00 她私訊前兩句；YT_EV14 heard',JSON.stringify(txt('p:heroine_03').slice(-2))===JSON.stringify(['heroine_03:阿姨續約了。五年，寫成書面的。','heroine_03:……新屋主說，他高中的時候也來這裡吃過麵。'])&&G.flags.YT_EV14==='heard');
  fresh('2027-11-25',18,'dorm'); run('2027-12-14',20.75,21.25); check('17. 不認識語彤：沒有轉述（續約照樣發生）',!PHONE.sent(G,'y3_lease_msg'));

  // ===== 18. 2-Y3-18 慈 5「對答案」 =====
  fresh('2027-11-30',18.5,'library'); ['heroine_01','classmate_xinci'].forEach(meet);
  { const a=STORY.schedEnt(CHARACTERS.heroine_01,G), x=STORY.schedEnt(CHARACTERS.classmate_xinci,G); check('18. 作息：第 13 週週一～週三 18:00～21:00 以安、芯慈在總圖三樓',!!a&&a.zone==='library'&&!!x&&x.zone==='library'); }
  to('2027-12-02',19.9); check('18. 週四 19:45 以後以安去讀書會、不放',(e=>!e||e.zone!=='library')(STORY.schedEnt(CHARACTERS.heroine_01,G)));
  to('2027-11-30',18.5); { const A=ev('ev_xinci_an_answers'), F=ev('ev_xinci_an_answers_far'); npc('heroine_01',2,0,0); npc('classmate_xinci',2.8,0,0); me(2.4,1,0);
    check('18. 走近（npcNear 兩個人）＝近的版本；第 12 週不演；21:00 以後不演；不認識芯慈不演',EVENTS.check(A)&&(()=>{ to('2027-11-23',18.5); const a=!EVENTS.check(A); to('2027-11-30',21.1); const b=!EVENTS.check(A); to('2027-11-30',18.5); return a&&b; })());
    check('18. 只進三樓（enter、作息在同一區）＝遠遠看到',F.trigger==='enter'&&EVENTS.check(F)); }
  SOCIAL.remember('classmate_xinci','ECON_TOGETHER',''); await play('ev_xinci_an_answers',[0]);
  { const W=['第三題妳比我好。','（停了一下）……嗯。','對了。補習班那個第二名，是妳吧。吳芯慈。','……妳記得？','一直都記得。開學那天，我假裝不記得。','我每次看排名，都先找那個名字。我怕她追上來。','（很久，然後笑出來）……我們兩個都很笨。','（轉頭看祐廷）大一你陪我讀經濟。這次換我們陪你對刑訴。','我看一下。……你錯的地方跟我一樣。'];
    check('18. X1、X2 有 ECON_TOGETHER：全文＋「這次換我們陪你對刑訴。」＋「好。第二題我錯了。」（逐字）；CI5 near',JSON.stringify(all())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「好。第二題我錯了。」'])&&G.flags.CI5==='near',JSON.stringify(all())); }
  fresh('2027-11-30',18.5,'library'); ['heroine_01','classmate_xinci'].forEach(meet); await play('ev_xinci_an_answers');
  check('18. 沒有 ECON_TOGETHER：收尾旁白「（她們把考卷攤在中間，一題一題對下去。）」',has('（她們把考卷攤在中間，一題一題對下去。）')&&!has('（轉頭看祐廷）大一你陪我讀經濟。這次換我們陪你對刑訴。')&&opts.length===0);
  fresh('2027-11-30',18.5,'library'); ['heroine_01','classmate_xinci'].forEach(meet); await play('ev_xinci_an_answers_far');
  check('18. X3 只進三樓沒走近：一句旁白；記 CI5 far；之後走近照樣演近的版本',JSON.stringify(all())===JSON.stringify(['（總圖三樓，靠窗那張桌子。以安和芯慈坐在一起，中間攤著兩份考卷。芯慈笑了一下。）'])&&G.flags.CI5==='far'&&(()=>{ npc('heroine_01',2,0,0); npc('classmate_xinci',2.8,0,0); me(2.4,1,0); return EVENTS.check(ev('ev_xinci_an_answers'))&&!EVENTS.check(ev('ev_xinci_an_answers_far')); })());

  // ===== 19. 2-Y3-19 可昕 K17「學弟妹的練習對象」 =====
  fresh('2027-12-08',20,'dorm'); date('kexin'); run('2027-12-08',20.75,21.25);
  check('19. 12/8 21:00 兩則＋「好。」「明天不行。」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('明天晚上九點四十五，視訊。你讀書會結束以後。'),K('我有一件事要你幫忙。')])&&JSON.stringify(PHONE.byAsk(G,'y3_k17').ask.opts.map(o=>o.t))===JSON.stringify(['好。','明天不行。']));
  ans('y3_k17',0); { const q=OUT.get(G,'y3_k17'); check('19. 「好。」→「好。」→ 12/9（四）21:45 視訊（不撞讀書會）',txt('p:kexin').slice(-1)[0]===K('好。')&&!!q&&q.day===D('2027-12-09')&&q.h===21.75&&q.verb==='接起來'); }
  picks=[1]; await go('y3_k17');
  check('19. P1 選「假裝聽懂」→「你假裝聽懂的時候，會點頭點兩次。」；KX_K17 fake；P3 沒有「假設學姊」',JSON.stringify(all().slice(0,2))===JSON.stringify(['我開始帶大一的民總讀書會了。我先講一次給你聽，你當學弟妹。','你假裝聽懂的時候，會點頭點兩次。'])&&JSON.stringify(opts[0])===JSON.stringify(['（聽懂了）','（假裝聽懂）','（故意問一個怪問題）'])&&G.flags.KX_K17==='fake'&&noSuppose());
  fresh('2027-12-09',21.75,'dorm'); date('kexin'); await play('ev_kexin_tutor_practice',[0]); check('19. 聽懂了：「真的？那你講一次給我聽。」',has('真的？那你講一次給我聽。')&&G.flags.KX_K17==='heard');
  fresh('2027-12-09',21.75,'dorm'); date('kexin'); await play('ev_kexin_tutor_practice',[2]); check('19. 怪問題：（她把那題放進講義。）「這題是一個法律系的學弟問的。」',has('（她把那題放進講義。）')&&has('這題是一個法律系的學弟問的。')&&G.flags.KX_K17==='odd');
  fresh('2027-12-08',20,'dorm'); date('kexin'); run('2027-12-08',20.75,21.25); ans('y3_k17',1); check('19. 「明天不行。」→「好。那我對著牆講。」；沒有這一場',txt('p:kexin').slice(-1)[0]===K('好。那我對著牆講。')&&!OUT.get(G,'y3_k17'));
  fresh('2028-04-25',20,'dorm'); date('kexin'); run('2028-04-25',20.75,21.25);
  check('19. 大三下 4/25 21:00 兩則（「學姊的男朋友」，不是「假設學姊」）＋兩個選項',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('讀書會的學弟妹考完了。他們說要請學姊的男朋友吃飯。'),K('你要來被看。')])&&JSON.stringify(PHONE.byAsk(G,'y3_k17_jr').ask.opts.map(o=>o.t))===JSON.stringify(['好。','我不太想被看。']));
  ans('y3_k17_jr',0); { const q=OUT.get(G,'y3_k17_dinner'); check('19. 「好。」→「明天六點半，山下那家。」→ 4/26 18:30 木柵大學山下（開車約 40 分鐘）',txt('p:kexin').slice(-1)[0]===K('明天六點半，山下那家。')&&!!q&&q.day===D('2028-04-26')&&q.h===18.5&&Math.abs(q.travelH-2/3)<1e-9); }
  picks=[1]; await go('y3_k17_dinner',17.7);
  { const W=['（木柵大學山下的小吃店。三個大一的學弟妹坐在對面，一直在看你。）','學姊說你都坐第四排。','我沒說。','學姊說過兩次。','……吃你的。','（回去的路上，她都沒有看你。走到公車站，她才開口。）','……他們很吵吧。','……他們喜歡的是這頓免費的飯。'];
    check('19. P2 去了：「學姊說你都坐第四排。」「我沒說。」…（逐字）；KX_JUNIORS came',JSON.stringify(all().slice(0,W.length))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「還好。」','「他們很喜歡妳。」'])&&G.flags.KX_JUNIORS==='came',JSON.stringify(all())); }
  fresh('2028-04-25',20,'dorm'); date('kexin'); run('2028-04-25',20.75,21.25); ans('y3_k17_jr',1); run('2028-04-26',20.75,21.25);
  check('19. 不去：「……好。我跟他們說你很忙。」；4/26 21:00 照片兩則；KX_JUNIORS photo',txt('p:kexin').includes(K('……好。我跟他們說你很忙。'))&&JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('（照片：小吃店的圓桌，三個學弟妹）'),K('他們說下次一定要看到本人。')])&&G.flags.KX_JUNIORS==='photo');
  fresh('2028-04-25',20,'dorm',{EXCHANGE_ROUTE:'JP'}); date('kexin'); run('2028-04-25',21.75,22.25);
  { const q=OUT.get(G,'y3_k17_jrv'); check('19. 日本路線：4/25 台灣 21:00＝當地 22:00「讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。」；4/26 台灣 19:30＝當地 20:30 視訊（AA_341 J-S7）',txt('p:kexin').slice(-1)[0]===K('讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。')&&!!q&&q.day===D('2028-04-26')&&q.h===20.5&&!PHONE.sent(G,'y3_k17_jr')); }
  await go('y3_k17_jrv'); check('19. 視訊被看：一段旁白；KX_JUNIORS video',has('（螢幕裡三個學弟妹擠在一起揮手。可昕把手機拿回去：「好，看完了。」）')&&G.flags.KX_JUNIORS==='video');

  // ===== 20. 2-Y3-20 語彤事件 13「空出來的週四」 =====
  fresh('2027-12-16',16.5,'dorm',{RENT_RENEWED:true}); R('heroine_03','FRI'); run('2027-12-16',16.75,17.25);
  check('20. 12/16 17:00 語彤兩則＋兩個回覆',JSON.stringify(txt('p:heroine_03'))===JSON.stringify(['heroine_03:你今天晚上有空嗎','heroine_03:我在總圖三樓'])&&JSON.stringify(PHONE.byAsk(G,'y3_yt13').ask.opts.map(o=>o.t))===JSON.stringify(['有，我過去。','今天不行。']));
  ans('y3_yt13',0); check('20. 「有，我過去。」→「嗯」',txt('p:heroine_03').slice(-1)[0]==='heroine_03:嗯');
  to('2027-12-16',18.5); G.zone='library'; { const e=STORY.schedEnt(CHARACTERS.heroine_03,G); check('20. 作息：12/16 18:00～19:45 語彤在總圖三樓',!!e&&e.zone==='library'); }
  { const T=ev('ev_yt_thursday_free'); npc('heroine_03',1,1,0); me(1,2,0); check('20. 走到她旁邊才演；不到 FRIEND 不演；19:45 以後不演',EVENTS.check(T)&&(()=>{ R('heroine_03','FAM'); const a=!EVENTS.check(T); R('heroine_03','FRI'); to('2027-12-16',19.8); const b=!EVENTS.check(T); to('2027-12-16',18.5); return a&&b; })()); }
  G.flags.JOB_NOODLE=true; await play('ev_yt_thursday_free',[0]);
  { const W=['阿姨請了一個工讀生。今天第一天。','她叫我今天不要去。……我不知道週四晚上要幹嘛。','我在這裡坐了一個小時。只是坐著。','（兩個人坐到閉館。走出總圖時她說：）','好安靜。我平常這時候在切蔥。'];   /* AA_519 1-5：「……你週二來切蔥，週四來陪我發呆。很忙喔。」（JOB_NOODLE）刪掉 */
    check('20. Y1 FRIEND 以上、去了：「我在這裡坐了一個小時。只是坐著。」；有 JOB_NOODLE 也沒有「你週二來切蔥…」那一句（AA_519 1-5：遊戲沒有麵店打工）；坐到閉館（逐字）；YT_EV13_SEEN sat；22:00',JSON.stringify(all())===JSON.stringify(W)&&G.flags.YT_EV13_SEEN==='sat'&&Math.abs(G.hour-22)<0.01,JSON.stringify(all())); }
  fresh('2027-12-16',18.5,'library',{RENT_RENEWED:true}); date('heroine_03'); R('heroine_03','FRI'); await play('ev_yt_thursday_free',[1]);
  check('20. Y3 交往中：「我第一個想到的是你。」開頭換；去溫州街＝（她站起來，把手伸過來。）＋走回來的旁白',has('她叫我今天不要去。……我第一個想到的是你。第二個想到的是，我不知道週四晚上要幹嘛。')&&has('所以我先來這裡坐。等你下課。')&&!has('我在這裡坐了一個小時。只是坐著。')&&has('（她站起來，把手伸過來。）')&&!has('（她站起來。）')&&has('（你們從總圖走到溫州街，又走回來。她一路沒講什麼，走得很慢。）')&&G.flags.YT_EV13_SEEN==='walk');
  fresh('2027-12-16',18.5,'library',{RENT_RENEWED:true}); R('heroine_03','FRI'); await play('ev_yt_thursday_free',[2]);
  { const W=['妳暑假訪問的那些，要不要整理成自己的東西？','整理成什麼？','不是給阿姨的。給妳自己的。','……我可以拿去問老師，能不能當專題。']; const i=idx(W[0]);
    check('20. Y2 選第三個：祐廷、語彤四句；記 FIELD_NOTES_IDEA；不是交往中沒有「寫好了，給你讀。」',i>0&&JSON.stringify(all().slice(i,i+4))===JSON.stringify(W)&&said[i].who==='祐廷'&&SOCIAL.has('heroine_03','FIELD_NOTES_IDEA')&&!has('寫好了，給你讀。')&&G.flags.YT_EV13_SEEN==='write'); }
  fresh('2027-12-16',18.5,'library',{RENT_RENEWED:true}); date('heroine_03'); R('heroine_03','FRI'); await play('ev_yt_thursday_free',[2]); check('20. 交往中的第三個：「寫好了，給你讀。」（不是「你第一個讀」）',has('寫好了，給你讀。')&&!any(/第一個讀/));
  fresh('2027-12-16',19.9,'dorm'); STORY.y3Facts(G); to('2027-12-16',20); STORY.y3Facts(G); check('20. Y4 12/16 20:00 一律記 YT_EV13（沒演也記）；演過的另外記 YT_EV13_SEEN',G.flags.YT_EV13===true&&G.flags.YT_EV13_SEEN==null);

  // ===== 21. 2-Y3-21 可昕 聖誕「她還在趕報告」 =====
  fresh('2027-12-24',20,'dorm'); date('kexin'); run('2027-12-24',20.75,21.25);
  check('21. 12/24 21:00 兩則＋「好。」「明天不行。」',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('明天晚上九點，視訊。'),K('我還在趕報告。你陪我就好。')])&&JSON.stringify(PHONE.byAsk(G,'y3_kx_xmas').ask.opts.map(o=>o.t))===JSON.stringify(['好。','明天不行。']));
  ans('y3_kx_xmas',0); { const q=OUT.get(G,'y3_kx_xmas'); check('21. 「好。」→「嗯。」→ 12/25 21:00 視訊（10 分鐘沒接＝沒接）',txt('p:kexin').slice(-1)[0]===K('嗯。')&&!!q&&q.day===D('2027-12-25')&&q.h===21&&Math.abs(q.late-1/6)<1e-9); }
  picks=[1]; await go('y3_kx_xmas');
  { const W=['聖誕快樂。我還差兩頁。……你們考完了吧。','……螢幕開著。你陪我就好。','（她低頭打字。你看著螢幕裡她的頭頂，看了一個多小時。）','（十點半，她把螢幕轉過來：最後一頁。）','寫完了。……你還在喔。','你有算喔。……好，算你陪了一個半小時。'];
    check('21. X1 接了（逐字）：「……螢幕開著。你陪我就好。」；十點半「寫完了。……你還在喔。」；KX_XMAS[3] video',JSON.stringify(all().slice(0,W.length))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「一直都在。」','「妳寫了一個半小時。」'])&&G.flags.KX_XMAS[3]==='video'&&noSuppose(),JSON.stringify(all())); }
  fresh('2027-12-25',21,'dorm'); date('kexin'); await play('ev_kexin_xmas_y3',[0]); check('21. 「一直都在。」→「……好。禮物等我考完再換。」',has('……好。禮物等我考完再換。'));
  fresh('2027-12-24',20,'dorm'); date('kexin'); run('2027-12-24',20.75,21.25); ans('y3_kx_xmas',0); miss('y3_kx_xmas'); run('2027-12-25',22.25,22.75);
  check('21. X2 沒接：「報告我寫完了。聖誕快樂。禮物等考完。」；KX_XMAS[3] missed',txt('p:kexin').slice(-1)[0]===K('報告我寫完了。聖誕快樂。禮物等考完。')&&G.flags.KX_XMAS[3]==='missed');
  fresh('2027-12-24',20,'dorm'); date('kexin'); run('2027-12-24',20.75,21.25); ans('y3_kx_xmas',1); check('21. 「明天不行。」→「……好。」；沒有視訊',txt('p:kexin').slice(-1)[0]===K('……好。')&&!OUT.get(G,'y3_kx_xmas'));

  // ===== 23. 2-Y3-23 可昕 除夕 KN =====
  fresh('2028-01-25',21,'dorm'); date('kexin'); run('2028-01-25',21.75,22.25);
  { const m=PHONE.byAsk(G,'kx_kn_y3'); check('23. N1 1/25 22:00 三則（舅舅、媽媽「她要當律師。」）＋三個選項；回覆到 1/26 09:00',JSON.stringify(txt('p:kexin').slice(-3))===JSON.stringify([K('新年快樂。'),K('今年圍爐，我舅舅問我：「念法律，以後要當法官嗎？」'),K('我說還不知道。我媽在旁邊說：「她要當律師。」……我什麼時候說過？')])&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['妳媽比妳先決定了。','那妳想當什麼？','打給妳。'])&&m.ask.until===(D('2028-01-26'))*24+9); }
  ans('kx_kn_y3',0); check('23. 「妳媽比妳先決定了。」→「對。我等一下要跟她吵。……過完年再吵。」；KX_KN[3] mom',txt('p:kexin').slice(-1)[0]===K('對。我等一下要跟她吵。……過完年再吵。')&&G.flags.KX_KN[3]==='mom');
  fresh('2028-01-25',21,'dorm'); date('kexin'); run('2028-01-25',21.75,22.25); ans('kx_kn_y3',1); check('23. 「那妳想當什麼？」→「……還在想。開學以後再跟你說。」；think',txt('p:kexin').slice(-1)[0]===K('……還在想。開學以後再跟你說。')&&G.flags.KX_KN[3]==='think');
  fresh('2028-01-25',21,'dorm'); date('kexin'); run('2028-01-25',21.75,22.25); ans('kx_kn_y3',2);
  { const q=OUT.get(G,'kx_kn_call_y3'); check('23. N2「打給妳。」＝不替你傳字、排電話（一定打、在家也不用出門）；KX_KN[3] call',!txt('p:kexin').includes('player:打給妳。')&&!!q&&q.must&&q.call===true&&OUT.trip(G,q,true).travelH===0&&G.flags.KX_KN[3]==='call'); }
  await go('kx_kn_call_y3'); check('23. N2 電話三句「我媽在叫我去洗碗。」；N3 沒有「假設」',JSON.stringify(all())===JSON.stringify(['（電話。她那邊的電視開得很大聲。）','……你真的打喔。','好啦。新年快樂。我媽在叫我去洗碗。'])&&noSuppose());
  fresh('2028-01-25',21,'dorm'); date('kexin'); run('2028-01-25',21.75,22.25); run('2028-01-26',8.75,9.25);
  check('23. 不回：1/26 09:00「新年快樂。我昨天沒跟我媽吵。今天再說。」；KX_KN[3] none',txt('p:kexin').slice(-1)[0]===K('新年快樂。我昨天沒跟我媽吵。今天再說。')&&G.flags.KX_KN[3]==='none');
  fresh('2028-01-25',21,'dorm'); run('2028-01-25',21.75,22.25); check('23. 不是交往中：沒有',!PHONE.sent(G,'kx_kn_y3'));

  // ===== 24. 2-Y3-24 可昕 情人節（大三寒假）=====
  fresh('2028-02-13',20,'dorm'); date('kexin'); run('2028-02-13',20.75,21.25);
  check('24. 2/13 21:00「明天晚上八點，視訊。三十分鐘。」＋「好。」「明天不行。」',txt('p:kexin').slice(-1)[0]===K('明天晚上八點，視訊。三十分鐘。')&&JSON.stringify(PHONE.byAsk(G,'y3_kx_vday').ask.opts.map(o=>o.t))===JSON.stringify(['好。','明天不行。']));
  ans('y3_kx_vday',0); { const q=OUT.get(G,'y3_kx_vday'); check('24. 「好。」→「好。」→ 2/14 20:00 視訊（20:30 還沒接＝沒接）',txt('p:kexin').slice(-1)[0]===K('好。')&&!!q&&q.day===D('2028-02-14')&&q.h===20&&q.late===0.5); }
  picks=[1]; await go('y3_kx_vday');
  { const W=['（視訊。她那邊是高雄的房間，窗戶開著。）','情人節快樂。三十分鐘。……我們越來越會了。','是我媽在陽台澆花。她說你好。','（三十分鐘一到，她真的掛了。三秒後，她傳來一張長頸鹿的貼圖。）'];
    check('24. V1 接了：高雄的房間；「三十分鐘。……我們越來越會了。」；V3 不在公館（逐字）；KX_VDAY[3] video；手機裡有那張長頸鹿',JSON.stringify(all().slice(0,W.length))===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['「三十分鐘夠嗎？」','「妳那邊好吵。」','（把窗外轉給她看）'])&&G.flags.KX_VDAY[3]==='video'&&!any(/公館/)&&(PHONE.tick(G),txt('p:kexin').slice(-1)[0]===K('（貼圖：長頸鹿）')),JSON.stringify(all())); }
  fresh('2028-02-14',20,'dorm'); date('kexin'); await play('ev_kexin_valentine_y3',[0]); check('24. 「三十分鐘夠嗎？」→「不夠。……這禮拜六我就上去了。」',has('不夠。……這禮拜六我就上去了。'));
  fresh('2028-02-14',20,'dorm'); date('kexin'); await play('ev_kexin_valentine_y3',[2]); check('24. 把窗外轉給她看 →「臺北又在下雨。……我就知道。」',has('臺北又在下雨。……我就知道。'));
  fresh('2028-02-13',20,'dorm'); date('kexin'); run('2028-02-13',20.75,21.25); ans('y3_kx_vday',0); miss('y3_kx_vday'); run('2028-02-14',20.5,20.75);
  check('24. V2 沒接：20:30 兩則「打了兩次。……三十分鐘我拿去看書了。」「情人節快樂。」；KX_VDAY[3] missed',JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify([K('打了兩次。……三十分鐘我拿去看書了。'),K('情人節快樂。')])&&G.flags.KX_VDAY[3]==='missed');
  fresh('2028-02-13',20,'dorm'); date('kexin'); run('2028-02-13',20.75,21.25); ans('y3_kx_vday',1); check('24. 「明天不行。」→「……好。那開學再說。」；沒有這一場',txt('p:kexin').slice(-1)[0]===K('……好。那開學再說。')&&!OUT.get(G,'y3_kx_vday'));

  // ===== 25. 2-Y3-25 日本路線 X1 退宿 =====
  const X1=(route,flags)=>{ fresh('2028-02-20',14.2,'dorm',Object.assign({EXCHANGE_ROUTE:route,ROOM_Y3:600,ROOM_Y3_ITEMS:['notes_y2','zq_usb','zhe_notes'],ROOM_Y3_DISCARD:'zq_usb',ROOM_Y2_ITEMS:['y1_0','film']},flags||{})); };
  X1('TW'); check('25. J3 台灣路線：2/20 沒有這一場',!R2Y3A.x1Due(G));
  X1('US'); check('25. J3 美國路線：2/20 沒有這一場',!R2Y3A.x1Due(G));
  X1('JP'); to('2028-02-20',13.9); check('25. 日本路線 13:54 還沒（14:00 才演）',!R2Y3A.x1Due(G));
  to('2028-02-20',14.2); check('25. 日本路線 14:00 以後、人在宿舍房間：演（TICKS）',R2Y3A.x1Due(G)&&STORY.TICKS.some(f=>/S\.tick\(GM,dt\)/.test(String(f))));
  { const HL=HOME.loop; let looped=false; HOME.loop=async()=>{ looped=true; }; said=[]; await R2Y3A.x1Jp(GM); HOME.loop=HL;
    const W=['（寒假最後一天。紙箱攤在地上。）','（阿哲還回來的民法筆記。放進去。）','（一疊大二的筆記。放進去。）','（一張《進城的那一週》的電影票根。放進去。）','（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）','（507 你那半邊空了。檯燈原本的位置，桌上留下一圈比較白的印子。）'];
    check('25. J1、J2 裝箱（最近的優先、最多三件、丟掉的那件不在）、「床墊下面有一張不知道誰的課表」（AA_377 第 18 項）、507 空了（逐字）',JSON.stringify(all())===JSON.stringify(W),JSON.stringify(all()));
    check('25. 字卡「搬回臺北的家」「計程車　約 30 分鐘」；搬回家（HOME 在家）；X1_JP、ev_x1_moveout_jp 演過',JSON.stringify(cards.slice(-1)[0])===JSON.stringify(['搬回臺北的家','計程車　約 30 分鐘'])&&HOME.at(G)&&looped&&G.flags.X1_JP===D('2028-02-20')&&!!G.events.done.ev_x1_moveout_jp&&!R2Y3A.x1Due(G)); }
  meet('classmate_bohan'); run('2028-02-20',20.75,21.25);
  check('25. 認識柏翰：當晚 21:00 兩則＋「拿走了。」',JSON.stringify(txt('p:classmate_bohan').slice(-2))===JSON.stringify(['classmate_bohan:你的床，下學期學弟要來住。','classmate_bohan:東西都拿走了嗎。'])&&JSON.stringify(PHONE.byAsk(G,'y3_x1_bohan').ask.opts.map(o=>o.t))===JSON.stringify(['拿走了。']));
  ans('y3_x1_bohan',0); check('25. 「拿走了。」→「好。八月見。」',txt('p:classmate_bohan').slice(-1)[0]==='classmate_bohan:好。八月見。');
  run('2028-02-23',9.75,10.25); check('25. 2/23（三）10:00 系辦「出國交換的役男出境，系辦已經幫你送出申請。」',txt('sys').slice(-1)[0]===':出國交換的役男出境，系辦已經幫你送出申請。'&&TH('sys').slice(-1)[0].name==='系辦');
  X1('JP'); G.home={at:true}; run('2028-02-20',14.25,14.25); { const q=OUT.get(G,'y3_x1_back'); check('25. 人在臺北的家：先帶回宿舍（字卡「回宿舍」、一定去）',!!q&&q.must&&q.goto&&q.goto.zone==='dorm'&&q.title==='回宿舍'); }

  console.log(fails?('FAILED '+fails):'ALL PASS');
  process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
