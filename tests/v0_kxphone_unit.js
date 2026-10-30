// V0-KXPHONE 經濟系那一年的手機小事（BB_113 第 2 節；AA-B 10-16 確認）：每天最多一則、條件、可昕大一上（E06 以後 E19 以前、雨天那則）、大一下（交往中、3/26～7/10，暑假接著算）——不需要瀏覽器。
// 修改前沒有 y0_ 的手機小事（全部失敗）。用法：node tests/v0_kxphone_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/econff3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const days=(d0,n,weather)=>{ const out=[]; for(let d=d0;d<d0+n;d++){ G.day=d; G.weekday=wdOf(d); G.weather=weather||'clear'; for(const h of [8,12,18,23.9]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } } return (G.msgs||[]).filter(m=>m.from!=='player'); };
(async()=>{
  const D=STORY.DAILY_PHONE.filter(d=>/^y0_/.test(d.id)); check('0. 經濟系的手機小事 21 則（AA_348 B6 拿掉可昕大一下四則、B5 加品妤 y0_py_notes2）',D.length===21,String(D.length));
  // 大一上：E06 以後
  fresh(termDay('Y0S1',5,1),8,'dorm',{E06_DONE:'e06'}); G.stage='econ'; let M=days(G.day,40).map(m=>m.text);
  check('1. Y0S1：可昕三則（不是雨天那則）、阿勳、品妤、唐睿、韋綸的都會出現；一天最多一則',['品妤說小松的滷肉飯是全校效用最高的。她算的時候沒有算排隊。','微積分老師今天說了九次『顯然』。我一次都沒有顯然。','上課老師講了一個冷笑話。全班只有我笑。……笑了很久。','你的鬧鐘第二次響的時候，我已經在刷牙了。我們的作息差八分鐘。這很好。'].every(t=>M.includes(t))&&!M.includes('下雨了。你今天走去總圖還是騎車？……沒事，我在決定要不要帶傘。'),JSON.stringify(M.slice(0,12)));
  check('1. 沒有法律系的手機小事混進來（Kevin、溫學姊、芷若）',!(G.msgs||[]).some(m=>['kevin','heroine_05','heroine_02'].includes(m.from)));
  fresh(termDay('Y0S1',5,1),8,'dorm',{E06_DONE:'e06'}); G.stage='econ'; M=days(G.day,40,'rain').map(m=>m.text); check('1. 下雨的日子：雨天那則會出現',M.includes('下雨了。你今天走去總圖還是騎車？……沒事，我在決定要不要帶傘。'));
  fresh(termDay('Y0S1',5,1),8,'dorm',{}); G.stage='econ'; M=days(G.day,30).map(m=>m.text); check('1. E06 以前：可昕的不出現',!M.some(t=>/顯然|滷肉飯|冷笑話/.test(t)));
  // 大一下：交往中、3/26 以後
  const d26=STORY.dayOfKey('2025-03-26');
  fresh(d26-10,8,'dorm',{Y0_DATING:true,LEAVE_WEEK:6,Y0_LEFT:true}); G.stage='econ'; let K=days(d26-10,8).filter(m=>m.from==='kexin').map(m=>m.text); check('2. 大一下第 6 週（3/24）以前：可昕大一下那四則不出現（kx2 從 2/15 起算，AA_224 6-1；四則排在第 4～6 週）',!K.some(t=>/同一張桌子|她說那是我的鬧鐘|新的語言|你買飲料/.test(t)),JSON.stringify(K));
  fresh(d26,8,'dorm',{Y0_DATING:true,LEAVE_WEEK:6,Y0_LEFT:true}); G.stage='econ'; K=days(d26,60).filter(m=>m.from==='kexin').map(m=>m.text);
  check('2. 3/26 以後：四則也不出現（AA_348 B6：她 2/15 起住在你家，AA_301「直接去講」；博思門口和 AA_298 衝突——四則拿掉）',!K.some(t=>/同一張桌子|她說那是我的鬧鐘|新的語言|你買飲料/.test(t)),JSON.stringify(K));
  // 暑假（重考期）接著跑；7/11 以後不跑
  const s0=STORY.dayOfKey('2025-06-25'), s1=STORY.dayOfKey('2025-07-12');
  check('3. 6/25（暑假）：學期週次接著第 18 週往下算；7/12 沒有',(()=>{ G.day=s0; const t=STORY.dpTerm(G); G.day=s1; const t2=STORY.dpTerm(G); return t&&t.id==='Y0S2'&&t.week===19&&!t2; })());
  fresh(s0,8,'dorm',{Y0_DATING:true,LEAVE_WEEK:6,Y0_LEFT:true,Y0_MOVED_OUT:true}); G.stage='econ'; M=days(s0,15).map(m=>m.text); check('3. 暑假 6/25～7/9 還會有手機小事',M.length>0,String(M.length));
  // AA_269 第 8 節（1fb2e4cf）：照新時間線重排的五則
  { const E=id=>STORY.DAILY_PHONE.find(d=>d.id===id), T=(k)=>CALENDAR.termOf(STORY.dayOfKey(k)), g=f=>({stage:'econ',flags:f});
    check('5. 微積分第五題＝第 6 週；阿勳「宿舍變暗了」＝第 11 週（11/11～17）＋Y0_MOVED_OUT（AA_348 B4：退宿 10/31 以後原本的第 7～8 週永遠不成立）；老師問那個人呢＝第 8 週；韋綸、品妤＝第 9 週，品妤改讀 LEAVE_WEEK',
      E('y0_xu_calc').term(T('2024-10-08'))&&!E('y0_xu_calc').term(T('2024-10-15'))&&E('y0_xu_lamp').term(T('2024-11-12'))&&!E('y0_xu_lamp').term(T('2024-10-20'))&&!E('y0_xu_lamp').term(T('2024-11-19'))&&E('y0_xu_lamp').ok(g({Y0_MOVED_OUT:true}),STORY.dayOfKey('2024-11-12'))&&!E('y0_xu_lamp').ok(g({}),STORY.dayOfKey('2024-11-12'))
      &&E('y0_xu_seat').term(T('2024-10-22'))&&E('y0_wl_wait').term(T('2024-10-29'))&&E('y0_py_notes').term(T('2024-10-29'))&&E('y0_py_notes').ok(g({LEAVE_WEEK:7}),STORY.dayOfKey('2024-10-29'))&&!E('y0_py_notes').term(T('2025-03-24'))); }
  { const E=id=>STORY.DAILY_PHONE.find(d=>d.id===id), g=f=>({stage:'econ',flags:f}), dk=STORY.dayOfKey;
    check('AA_449 1-3：阿勳「你的鬧鐘第二次響的時候……」只在還住宿舍（Y0_MOVED_OUT 以後不發）', E('y0_xu_alarm').ok(g({}),dk('2024-10-21'))&&!E('y0_xu_alarm').ok(g({Y0_MOVED_OUT:true}),dk('2024-11-04')));
    check('AA_449 1-4：韋綸新車那則自己讀得懂「以前那台一個禮拜掉兩次。……我有點想念它。」', (()=>{ const m=E('y0_wl_newbike').items(g({WL_BIKE:true})); return m.length===1&&m[0].text==='新車騎了三個月，鏈子一次都沒掉。以前那台一個禮拜掉兩次。……我有點想念它。'; })()); }
  { const E=id=>STORY.DAILY_PHONE.find(d=>d.id===id), T=(k)=>CALENDAR.termOf(STORY.dayOfKey(k));
    check('5b. AA_348 B5：品妤「我高中的筆記還在……」搬到大一下；AA_368 附：第 2 週永遠不會出現（手機小事除了法律系大一上都要第 4 週起），改第 4 週（3/10～3/16）、句子不改',!!E('y0_py_notes2')&&!E('y0_py_notes2').term(T('2025-02-25'))&&E('y0_py_notes2').term(T('2025-03-10'))&&E('y0_py_notes2').term(T('2025-03-16'))&&!E('y0_py_notes2').term(T('2025-03-17'))&&E('y0_py_notes2').items({})[0].text==='我高中的筆記還在，掃描放雲端了。你要的話自己拿。放著也是放著。'); }
  { const E=id=>STORY.DAILY_PHONE.find(d=>d.id===id), T=(k)=>CALENDAR.termOf(STORY.dayOfKey(k)), g=f=>({stage:'econ',flags:f}), dk=STORY.dayOfKey;
    const it=E('y0_xu_seat').items({})[0].text;
    check('5c. AA_368 M6：阿勳「星期三的微積分，老師看了一眼我旁邊的空位……」；第 8 週、10/23（三）起才發（原本 10/21 一就會發，微積分是星期三）',it==='星期三的微積分，老師看了一眼我旁邊的空位，又看了一眼可昕旁邊。什麼都沒問。我覺得他懂了。'&&E('y0_xu_seat').term(T('2024-10-21'))&&!E('y0_xu_seat').ok(g({LEAVE_WEEK:7}),dk('2024-10-21'))&&!E('y0_xu_seat').ok(g({LEAVE_WEEK:7}),dk('2024-10-22'))&&E('y0_xu_seat').ok(g({LEAVE_WEEK:7}),dk('2024-10-23'))&&E('y0_xu_seat').ok(g({LEAVE_WEEK:7}),dk('2024-10-27'))&&!E('y0_xu_seat').ok(g({}),dk('2024-10-23'))&&CALENDAR.dateOf(dk('2024-10-23')).wd===3,it);
    const pr=E('y0_py_rain').items({})[0].text;
    check('5d. AA_368 L9b＋AA_371 第 5 題：品妤「今天在社科院門口等公車，等了半小時。……最後是用走的。」（原本「我室友今天問我：如果雨可以退貨……」＝可昕出假設題；AA_368 的「今天下大雨。……」改字、不限天氣）',pr==='今天在社科院門口等公車，等了半小時。……最後是用走的。'&&!/室友|退貨/.test(pr),pr); }
  { const d0=STORY.dayOfKey('2025-02-17'), NT='我高中的筆記還在，掃描放雲端了。你要的話自己拿。放著也是放著。', got=[];
    for(const fl of [{},{E01_MORNING:true}]){ fresh(d0,8,'home',Object.assign({Y0_DATING:true,LEAVE_WEEK:6,Y0_LEFT:true,Y0_MOVED_OUT:true},fl)); G.stage='econ'; days(d0,35); const m=(G.msgs||[]).find(x=>x.text===NT); got.push(m?CALENDAR.termOf(m.day).week:null); }
    check('5e. AA_368 附：實際跑大一下 2/17～3/23，品妤那則真的收到、在第 4 週（完整版、30 分鐘版都是；修改前第 2 週永遠輪不到）',got.every(w=>w===4),JSON.stringify(got)); }
  { const d0=STORY.dayOfKey('2024-10-21'), got=[];
    for(const fl of [{},{E01_MORNING:true}]){ fresh(d0,8,'dorm',Object.assign({LEAVE_WEEK:7,E06_DONE:'e06',KX_CAR:true},fl)); G.stage='econ'; const N=G.flags.dpN={}; for(const d of STORY.DAILY_PHONE) if(d.id!=='y0_xu_seat') N[d.id]=9;   /* 其他手機小事都已經收過（第 4～7 週），第 8 週只剩這一則 */
      days(d0,7); const m=(G.msgs||[]).find(x=>/看了一眼我旁邊的空位/.test(x.text)); got.push(m?CALENDAR.dateOf(m.day).key:null); }
    check('5f. AA_368 M6：實際跑 10/21（一）～10/27，阿勳那則 10/23（三）才收到（修改前 10/21 就收到）；完整版、30 分鐘版都是',got.every(k=>k==='2024-10-23'),JSON.stringify(got)); }
  { const d0=STORY.dayOfKey('2024-10-21'); fresh(d0,8,'dorm',{LEAVE_WEEK:7,E06_DONE:'e06',KX_CAR:true,E01_MORNING:true}); G.stage='econ'; const N=G.flags.dpN={}; for(const d of STORY.DAILY_PHONE) if(d.id!=='y0_xu_seat'&&d.id!=='y0_xu_alarm') N[d.id]=9;
    PHONE.postAt(G,{th:'p:kai',from:'kai',text:'（測試：10/19 別的訊息）',tag:'test_1019'},STORY.dayOfKey('2024-10-19'),21); PHONE.postAt(G,{th:'p:kai',from:'kai',text:'（測試：10/22 別的訊息）',tag:'test_1022'},STORY.dayOfKey('2024-10-22'),21); days(d0,7);   /* 10/19、10/22 有別的訊息：隔 3 天，這一週只剩 10/25 一個位置（BB 那兩輪的情形）*/
    const seat=(G.msgs||[]).find(x=>/看了一眼我旁邊的空位/.test(x.text)), alarm=(G.msgs||[]).find(x=>/鬧鐘第二次響/.test(x.text));
    check('5g. AA_368 M6（BB 10-21：兩輪都看不到）：30 分鐘版 10/19、10/22 有別的訊息、隔 3 天這一週只剩 10/25 一個位置——快過期的阿勳「星期三的微積分」（第 8 週）先排，第 4 週起都能排的「鬧鐘」那則讓位',!!seat&&CALENDAR.dateOf(seat.day).key==='2024-10-25'&&!alarm,JSON.stringify({seat:seat&&CALENDAR.dateOf(seat.day).key,alarm:alarm&&CALENDAR.dateOf(alarm.day).key})); }
  { const d0=STORY.dayOfKey('2024-09-23'); const span=fl=>{ fresh(d0,8,'dorm',fl); G.stage='econ'; days(d0,12); return Object.values(G.flags.dpDayOf||{}).sort((a,b)=>a-b); }, gaps=a=>a.slice(1).map((x,i)=>x-a[i]);
    const S1=span({E01_MORNING:true}), S0=span({});
    check('6. AA_348 B8：經濟系 30 分鐘版（E01_MORNING）9/23～10/4 的手機小事至少隔 3 天一則；完整版（舊流程）照舊',S1.length>=2&&gaps(S1).every(g=>g>=3)&&S0.length>S1.length,JSON.stringify({short:S1,full:S0})); }
  { const d0=STORY.dayOfKey('2024-09-23'); fresh(d0,8,'dorm',{E01_MORNING:true}); G.stage='econ'; days(d0,30);
    const M=(G.msgs||[]).filter(m=>m.from!=='player'&&!(m.tag&&/^rt_/.test(m.tag))), dp=[...new Set(M.filter(m=>/^dp_/.test(m.tag||'')).map(m=>m.day))], ot=[...new Set(M.filter(m=>!/^dp_/.test(m.tag||'')).map(m=>m.day))];
    const bad=dp.filter(D=>ot.some(X=>X<=D&&D-X<3)).map(D=>CALENDAR.dateOf(D).key);
    check('6b. BB218-P3-1021 ③：經濟系 30 分鐘版跳日期時任何新訊息都會停——手機小事和前面別的訊息（9/29 颱風假群組、10/11 邀約…）也隔 3 天、不在同一天（原本 9/30、10/12 隔 1 天）',dp.length>=4&&!bad.length,JSON.stringify({bad,dp:dp.map(d=>CALENDAR.dateOf(d).key)})); }
  // 法律系的存檔不受影響
  fresh(termDay('Y1S1',6,2),8,'dorm',{}); G.stage='law'; M=days(G.day,10); check('4. 法律系：沒有經濟系的手機小事',!M.some(m=>/^econ_/.test(m.from||'')&&/dp_y0_/.test(m.tag||''))&&!(G.flags.dpN&&Object.keys(G.flags.dpN).some(k=>/^y0_/.test(k))));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
