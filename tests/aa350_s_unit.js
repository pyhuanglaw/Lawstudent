// AA_350 第 8 節 S1～S8（企劃線 cae5cc76；回老家的所在地第二批）——不需要瀏覽器。用法：node tests/aa350_s_unit.js
//   S1 柏翰大二暑假 6/28～8/24 新竹、大三暑假 6/28～7/2 新竹（7/3 起臺北）；S2 大二寒假整段新竹、週四不上來，大三寒假只回去過年 1/25～1/28；
//   S3 芷若大一暑假 8/26 回臺北（防回歸）；S4 芷若、阿凱、明軒照 BB_198（明軒 AA_350 N8 的寒假作廢，只留 2029 暑假；首爾 C08 沒有報名、錄取的狀態＝不算）；
//   S5 和以安交往中、回國那天她在台中＝那天晚上兩則、不約見面；S6 校外約會撞到以安、芷若回台中的日子要擋（D26 臺中不擋）；
//   S7 D29 偶遇阿哲的日子（回高雄的隔天～回臺北的前一天）；S8 以安東京 C11、京都 C12、小語營隊進 presence（短期出門有訊號：kind trip＋signal，回覆不延到回來那天）。
// 柏翰的群組訊息（大三寒假 1/24、1/28；大三暑假 6/27、7/2）在 tests/holiday_ff_unit.js 的 H3-4、H3-5。
// 修改前（開發分支 10dc79b1）33 項 FAIL 27；修改前就 PASS 的 6 項是防回歸／前提：日子在日曆裡、presence 不帶 exceptWd、S3 芷若 8/26、C08 大一那一次照原本的重逢、
//   沒交往沒有那兩則、D26／回來那天照常約（不是被 S6 那一句擋）。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js',
  'src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, Tm=(d,h)=>d*24+h;
const P=(id,key)=>STORY.presence(id,{day:D(key),flags:{},stage:'law'});
const isHome=(p,city)=>p.here===false&&p.kind==='home'&&p.home===city;
const isTrip=(p,away)=>p.here===false&&p.kind==='trip'&&p.away===away&&p.signal===true;
const isUK=(p,kind)=>p.here===false&&p.away==='英國'&&(!kind||p.kind===kind);
const sh=p=>p.here?'here':(p.kind+':'+(p.home||p.away||''));
const row=(id,list)=>list.map(([k,f])=>{ const p=P(id,k), ok=f(p); return {k,ok,s:sh(p)}; });
const rowCheck=(name,id,list)=>{ const r=row(id,list); check(name,r.every(x=>x.ok),JSON.stringify(r.filter(x=>!x.ok).map(x=>x.k+'='+x.s))); };
const here=p=>p.here===true;
let G=null, said=[], picks=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone:zone||'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; GM.npc={}; if(STORY._fy) STORY._fy.reset(); return G; };
const know=(id,fam)=>{ SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); r.fam=fam||30; r.trust=fam?Math.round(fam*0.8):10; r.comf=fam?Math.round(fam*0.8):10; G.contacts[id]=1; };
const runPh=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||'')+':'+m.text);
(async()=>{
  check('0. 日子都在日曆裡；2027-07-01、2027-01-14、2028-01-13、2028-02-10 是週四；2027-01-02、2027-01-09、2029-02-17 是週六',
    ['2027-07-01','2027-01-14','2028-01-13','2028-02-10'].every(k=>wdOf(D(k))===4)&&['2027-01-02','2027-01-09','2029-02-17'].every(k=>wdOf(D(k))===6));

  /* ===== S1 柏翰暑假 ===== */
  rowCheck('S1. 柏翰大二暑假（2027）：6/27 還在臺北、6/28～8/24 新竹（週四 7/1 也在新竹：大二以後沒有週四總圖）、8/25 起臺北（香港「我 24 號晚上上來」）','classmate_bohan',
    [['2027-06-27',here],['2027-06-28',p=>isHome(p,'新竹')],['2027-07-01',p=>isHome(p,'新竹')],['2027-08-24',p=>isHome(p,'新竹')],['2027-08-25',here]]);
  rowCheck('S1. 柏翰大三暑假（2028）：6/27 在臺北、6/28～7/2 新竹、7/3 起臺北（7/08 公館補習班照舊）','classmate_bohan',
    [['2028-06-27',here],['2028-06-28',p=>isHome(p,'新竹')],['2028-07-02',p=>isHome(p,'新竹')],['2028-07-03',here],['2028-07-08',here]]);
  /* ===== S2 柏翰寒假 ===== */
  rowCheck('S2. 柏翰大二寒假：整段新竹、週四（1/14）不上來；2/18 新竹、2/19 回來那天照舊在臺北','classmate_bohan',
    [['2027-01-09',p=>isHome(p,'新竹')],['2027-01-14',p=>isHome(p,'新竹')],['2027-02-11',p=>isHome(p,'新竹')],['2027-02-18',p=>isHome(p,'新竹')],['2027-02-19',here]]);
  rowCheck('S2. 柏翰大三寒假只回去過年：1/13、1/24 在臺北，1/25～1/28 新竹，1/29、2/10 在臺北','classmate_bohan',
    [['2028-01-13',here],['2028-01-24',here],['2028-01-25',p=>isHome(p,'新竹')],['2028-01-28',p=>isHome(p,'新竹')],['2028-01-29',here],['2028-02-10',here]]);
  check('S2. presence 的結果不帶 exceptWd',!('exceptWd' in P('classmate_bohan','2027-01-14'))&&!('exceptWd' in P('classmate_bohan','2028-01-26')));
  /* ===== S3 芷若大一暑假 ===== */
  rowCheck('S3. 芷若大一暑假 8/25 還在台中、8/26 回臺北（防回歸）','heroine_02',[['2026-08-25',p=>isHome(p,'台中')],['2026-08-26',here]]);
  /* ===== S4 芷若（BB_198 5-2、7-1）===== */
  rowCheck('S4. 芷若大二寒假（BB_198 5-2；AA_369 M1：1/16 晚上 C15 放映她還在臺北）：1/16 在臺北、1/17～2/17 台中、2/18 回臺北','heroine_02',
    [['2027-01-15',here],['2027-01-16',here],['2027-01-17',p=>isHome(p,'台中')],['2027-02-17',p=>isHome(p,'台中')],['2027-02-18',here]]);
  rowCheck('S4. 芷若大二暑假：8/20 在臺北、8/21 起台中、9/2 從台中出發（遊戲裡她說「九月二號」；出發那天還算台中）、9/3 起英國（BB_198 7-1）；英國那一學期照舊 kind absent；2/12 回臺灣先回台中、2/19 回臺北（2/19、2/20 不再算英國）','heroine_02',
    [['2027-08-20',here],['2027-08-21',p=>isHome(p,'台中')],['2027-09-02',p=>isHome(p,'台中')],['2027-09-03',p=>isUK(p)],['2027-10-15',p=>isUK(p,'absent')],['2028-01-10',p=>isUK(p,'absent')],['2028-02-11',p=>isUK(p)],
     ['2028-02-12',p=>isHome(p,'台中')],['2028-02-18',p=>isHome(p,'台中')],['2028-02-19',here],['2028-02-20',here]]);
  rowCheck('S4. 芷若大三暑假：7/1～7/31 台中、8/1 回臺北；9/2 出發去英國（出發那天在臺北）、9/3 起英國（大四上照舊 absent）','heroine_02',
    [['2028-06-30',here],['2028-07-01',p=>isHome(p,'台中')],['2028-07-31',p=>isHome(p,'台中')],['2028-08-01',here],['2028-09-02',here],['2028-09-03',p=>isUK(p)],['2028-10-15',p=>isUK(p,'absent')]]);
  { const ukd=k=>{ fresh(D(k),7.5,'dorm',{dating_heroine_02:true}); know('heroine_02',60); MSG.ukDaily(G); return PHONE.sent(G,'zr_uk_daily_'+G.day); }, a=ukd('2027-09-02'), b=ukd('2027-09-03'), c=ukd('2028-09-02'), d=ukd('2028-09-03');
    check('S4. 交往中「每天一則」（台灣 06:00）：出發那天（2027-09-02、2028-09-02）不傳、隔天起才傳',!a&&b&&!c&&d,JSON.stringify([a,b,c,d])); }
  { const at=k=>{ fresh(D(k),20,'campus'); know('heroine_02'); return MSG.open(G,'heroine_02'); }, a=at('2027-01-20'), b=at('2028-02-15'), c=at('2027-10-15');
    check('S4. 芷若在台中（2027-01-20、2028-02-15）手機照常；在英國（2027-10-15）有點熟＝只寄明信片（防回歸）',a.ok&&b.ok&&!c.ok&&c.why==='她在英國，只寄明信片',JSON.stringify([a,b,c])); }
  /* 阿凱（AA_350 S4 列的日子，含頭尾）*/
  rowCheck('S4. 阿凱：日本 2026-08-24～28、宜蘭 2027-02-02～09、2028-01-22～29、曼谷 2028-07-03～07、宜蘭 2029-02-09～16（前一天、後一天在臺北）','kai',
    [['2026-08-23',here],['2026-08-24',p=>isTrip(p,'在日本')],['2026-08-28',p=>isTrip(p,'在日本')],['2026-08-29',here],
     ['2027-02-01',here],['2027-02-02',p=>isHome(p,'宜蘭')],['2027-02-09',p=>isHome(p,'宜蘭')],['2027-02-10',here],
     ['2028-01-21',here],['2028-01-22',p=>isHome(p,'宜蘭')],['2028-01-29',p=>isHome(p,'宜蘭')],['2028-01-30',here],
     ['2028-07-02',here],['2028-07-03',p=>isTrip(p,'在曼谷')],['2028-07-07',p=>isTrip(p,'在曼谷')],['2028-07-08',here],
     ['2029-02-08',here],['2029-02-09',p=>isHome(p,'宜蘭')],['2029-02-16',p=>isHome(p,'宜蘭')],['2029-02-17',here]]);
  { fresh(D('2026-08-25'),14,'campus'); know('kai'); const w=INV.whyNot(G,'kai'); G.hour=20; const ra=MSG.replyAt(G,'kai');
    check('S4. 阿凱在日本：朋友頁「在日本，不在臺北。」；有訊號，回訊息不會延到回來那天（方奕廷上山那種才延）',w==='在日本，不在臺北。'&&ra&&ra.day<D('2026-08-29'),JSON.stringify([w,ra&&K(ra.day)])); }
  /* 明軒（BB_198 1-2；N8 只留 2029 暑假；首爾 C08 不算）*/
  rowCheck('S4. 明軒照 BB_198：2027 寒假 2/3～2/9、2027 暑假 8/16～8/22、2028 暑假 8/7～8/13、2029 寒假 2/10～2/16（N8 的 2/2、8/10、2/9 那幾天改回在臺北）；2029 暑假 8/10～8/16 照 N8；首爾 C08 那兩週在臺北','classmate_mingxuan',
    [['2027-02-02',here],['2027-02-03',p=>isHome(p,'彰化')],['2027-02-09',p=>isHome(p,'彰化')],['2027-02-10',here],
     ['2027-08-10',here],['2027-08-15',here],['2027-08-16',p=>isHome(p,'彰化')],['2027-08-22',p=>isHome(p,'彰化')],['2027-08-23',here],
     ['2028-01-22',p=>isHome(p,'彰化')],['2028-01-28',p=>isHome(p,'彰化')],['2028-01-29',here],
     ['2028-08-06',here],['2028-08-07',p=>isHome(p,'彰化')],['2028-08-13',p=>isHome(p,'彰化')],['2028-08-14',here],['2028-08-16',here],
     ['2029-02-09',here],['2029-02-10',p=>isHome(p,'彰化')],['2029-02-16',p=>isHome(p,'彰化')],['2029-02-17',here],
     ['2029-08-14',p=>isHome(p,'彰化')],['2029-08-17',here],['2027-07-15',here]]);

  /* ===== S5 和以安交往中、回國那天她在台中 ===== */
  const reTwo=['heroine_01:到了嗎？','heroine_01:……好。我在台中，沒辦法去接你。行李先放著，先睡。'];
  for(const key of ['C09@Y1','C08@Y2','C09@Y2','C10@Y2','T02@Y2']){ const [id,yk]=key.split('@'), I=VAC.inst(id,yk), rd=I&&I.to;
    fresh(rd,17.9,'dorm',{dating_heroine_01:true}); know('heroine_01',60); VAC.rec(G).reg[key]='done'; runPh(17.9,21.2);
    const A=txt('p:heroine_01'), q=OUT.get(G,'vac_'+key+'_re_heroine_01'), pr=STORY.presence('heroine_01',G);
    check('S5. '+key+'（回國 '+(rd!=null?K(rd):'?')+'，以安在台中）：21:00 兩則「到了嗎？」「……好。我在台中，沒辦法去接你。行李先放著，先睡。」；不約見面、不排出遊',
      isHome(pr,'台中')&&JSON.stringify(A)===JSON.stringify(reTwo)&&!q&&(G.msgs||[]).filter(m=>m.th==='p:heroine_01').every(m=>m.h===21),JSON.stringify([sh(pr),A,!!q])); }
  { fresh(D('2026-07-24'),17.9,'dorm',{dating_heroine_01:true}); know('heroine_01',60); VAC.rec(G).reg['C08@Y1']='done'; runPh(17.9,21.2); const A=txt('p:heroine_01'), q=OUT.get(G,'vac_C08@Y1_re_heroine_01');
    /* AA_369 M3（取代原本的防回歸「照原本的重逢」）：重逢那天（7/25）她回台中＝一律走 reunionHome，以安沒有那一句＝不約總圖、不排出遊；回國那天她還在臺北＝也不是 S5 那兩則 */
    check('S5. C08 大一（2026-07-24 回國，那天以安還在臺北、7/25 回台中）：AA_369 M3 不約「明天下午三點，總圖門口。」、不排出遊；也不是 S5 那兩則',!A.includes('heroine_01:明天下午三點，總圖門口。')&&!q&&!A.includes(reTwo[0]),JSON.stringify(A)); }
  { fresh(D('2026-08-05'),17.9,'dorm',{}); know('heroine_01',60); VAC.rec(G).reg['C09@Y1']='done'; runPh(17.9,21.2);
    check('S5. 沒有和以安交往：沒有那兩則',!txt('p:heroine_01').some(t=>t===reTwo[0]||t===reTwo[1]),JSON.stringify(txt('p:heroine_01'))); }

  /* ===== S6 校外約會撞到以安、芷若回台中的日子 ===== */
  const ask=(id,todayK,dayK,loc,dep,flags)=>{ fresh(D(todayK),9,'dorm',flags); know(id,60); return DATE.check(G,{who:id,locs:[loc],day:D(dayK),depart:dep}); };
  { const AN='「那幾天我在台中。……換一天。」', a=ask('heroine_01','2026-07-23','2026-07-28','D13',10,{dating_heroine_01:true}), b=ask('heroine_01','2026-07-23','2026-07-28','D26',8,{dating_heroine_01:true}), c=ask('heroine_01','2026-08-08','2026-08-09','D13',10,{dating_heroine_01:true}), d=ask('heroine_01','2026-07-23','2026-07-24','D13',10,{dating_heroine_01:true});
    check('S6. 以安：7/23 約 7/28（她在台中）淡水＝擋，「那幾天我在台中。……換一天。」',!a.ok&&a.why===AN,JSON.stringify(a.why));
    check('S6. 以安：約 D26 臺中不擋（她人在臺中）；8/9（回來了）、7/24（還沒走）照常',b.why!==AN&&c.why!==AN&&d.why!==AN,JSON.stringify([b.ok,b.why,c.ok,c.why,d.ok,d.why])); }
  { const ZR='「那個禮拜我回台中了。換一天好不好？」', a=ask('heroine_02','2026-06-29','2026-07-02','D13',10,{dating_heroine_02:true}), b=ask('heroine_02','2026-06-29','2026-07-04','D26',8,{dating_heroine_02:true}), c=ask('heroine_02','2026-06-29','2026-06-30','D13',10,{dating_heroine_02:true});
    check('S6. 芷若：6/29 約 7/2（她回台中了）淡水＝擋，「那個禮拜我回台中了。換一天好不好？」；D26 臺中不擋；6/30 照常',!a.ok&&a.why===ZR&&b.why!==ZR&&c.why!==ZR,JSON.stringify([a.why,b.why,c.why])); }
  { fresh(D('2026-07-23'),9,'dorm',{dating_heroine_01:true}); know('heroine_01',60); const t=DATE.book(G,{who:'heroine_01',locs:['D13'],day:D('2026-07-24'),depart:10,by:'player'}); const q=OUT.rec(G).find(x=>x.dateTrip===t.trip);
    const keep=GM.toast; let toasts=[]; GM.toast=m=>toasts.push(m); picks=[1,0]; G.day=D('2026-07-24'); G.weekday=wdOf(G.day); G.hour=10; const r=await DATE.move(GM,q,t); GM.toast=keep;
    check('S6. 改時間「改到明天同一個時間」撞到她回台中（7/25）：說那一句、不改',toasts.includes('「那幾天我在台中。……換一天。」')&&t.day===D('2026-07-24'),JSON.stringify([toasts,K(t.day),r])); }

  /* ===== S7 D29 偶遇阿哲 ===== */
  const encAt=(key,h,spot,ids)=>{ fresh(D(key),h,'gongguan'); for(const id of ids) know(id); return ENC.candidates(G,spot).map(c=>c.row.who); };
  { const a=encAt('2027-01-02',15,'D29',['zhe']), b=encAt('2027-01-09',15,'D29',['zhe']), c=encAt('2029-02-17',15,'D29',['zhe']), d=encAt('2028-01-08',15,'D29',['zhe']);
    check('S7. D29：2027-01-02（他 1/5 才回高雄）、2029-02-17（他回臺北了）不會遇到；2027-01-09、2028-01-08 照常',!a.includes('zhe')&&b.includes('zhe')&&!c.includes('zhe')&&d.includes('zhe'),JSON.stringify([a,b,c,d])); }
  { const at=k=>STORY.schedEnt(CHARACTERS.zhe,{day:D(k),hour:15,weekday:wdOf(D(k)),flags:{},noInvite:true}), e1=at('2027-01-02'), e2=at('2029-02-17'), e3=at('2027-01-09');
    check('S7. 作息（朋友頁的位置）：2027-01-02、2029-02-17 不是「在高雄」；2027-01-09 是',!(e1&&e1.enc==='D29')&&!(e2&&e2.enc==='D29')&&!!e3&&e3.enc==='D29',JSON.stringify([e1&&e1.away,e2&&e2.away,e3&&e3.away])); }
  { const z=(ENCOUNTERS.rows||[]).find(x=>x.spot==='D29'&&x.who==='zhe'), s=(CHARACTERS.zhe.daily_schedule||[]).find(x=>x.enc==='D29');
    check('S7. encounters.js 和 characters.js 的 D29 日子一樣（三個寒假照 S7、除夕～初三照 AA_271 不排）',!!z&&!!s&&JSON.stringify(z.dates)===JSON.stringify(s.dates)&&JSON.stringify(z.dates.filter(x=>x[0]>='2027')).includes('["2027-01-06","2027-02-04"]')&&JSON.stringify(z.dates).includes('["2028-01-05","2028-01-24"]')&&JSON.stringify(z.dates).includes('["2029-01-04","2029-02-11"]'),JSON.stringify(z&&z.dates)); }

  /* ===== S8 以安東京、京都；小語營隊 ===== */
  rowCheck('S8. 以安東京 C11 2027-01-17～01-30、京都 C12 2027-08-09～08-27（kind trip、有訊號）；1/31、8/28 在臺北；2/1 起照舊回台中','heroine_01',
    [['2027-01-16',here],['2027-01-17',p=>isTrip(p,'在東京')],['2027-01-30',p=>isTrip(p,'在東京')],['2027-01-31',here],['2027-02-01',p=>isHome(p,'台中')],
     ['2027-08-08',here],['2027-08-09',p=>isTrip(p,'在京都')],['2027-08-27',p=>isTrip(p,'在京都')],['2027-08-28',here]]);
  rowCheck('S8. 小語營隊 2026-07-06～07-18（va05：7/6「隊輔第一天」、7/18「回來了」）','yu',[['2026-07-05',here],['2026-07-06',p=>isTrip(p,'在營隊當隊輔')],['2026-07-18',p=>isTrip(p,'在營隊當隊輔')],['2026-07-19',here]]);
  { fresh(D('2026-07-08'),20,'campus'); know('yu'); know('npc_fangyt'); const w=INV.whyNot(G,'yu'), r1=MSG.replyAt(G,'yu'), r2=MSG.replyAt(G,'npc_fangyt');
    check('S8. 小語在營隊：朋友頁「在營隊當隊輔，不在臺北。」；她有訊號（群組天天發），回訊息不延到 7/19；方奕廷上山沒訊號照舊延到下山那天（防回歸）',w==='在營隊當隊輔，不在臺北。'&&!!r1&&r1.day<D('2026-07-19')&&!!r2&&r2.day===D('2026-07-20'),JSON.stringify([w,r1&&K(r1.day),r2&&K(r2.day)])); }
  { fresh(D('2027-01-20'),14,'campus'); know('heroine_01'); const w=INV.whyNot(G,'heroine_01'); check('S8. 以安在東京：朋友頁「在東京，不在臺北。」',w==='在東京，不在臺北。',w); }

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
