// 寒暑假快轉（AA_340 第 6 節，企劃線 171b62fb；D99 第二優先；任務 HOL-FF-AA340-1020）——不需要瀏覽器。用法：node tests/holiday_ff_unit.js
// H2：快轉途中收到要回的訊息（邀約、問句）就停、打開手機，關掉以後接著跳（真的跑 HOME.ffMenu／breakJump 一週）；H1：大四寒假的停點、每個寒假的除夕初一、
// 除夕人在宿舍 17:00、事件包登記的日子（主線 9 大年初一、STORY.WAKE_AT、HOME.STOPS）；H3：大二以後的返鄉、回臺北訊息；6-3：摘要日的旁白（日期卡下面）與群組訊息。
// 修改前（1475d312）FAIL 的：H2 全部（一路跳過邀約、不打開手機）；H1 的大四寒假表、大三大四的除夕初一、除夕在宿舍 17:00、主線 9、WAKE_AT、2/3 筆試；H3、6-3 全部（沒有 src/holff3d.js）。
// AA_345 H1～H7（2026-10-21）：大三寒假那一頓改 2/20（2/18 21:00 揪、2/20 17:30 回來）、大四寒假柏翰兩則和阿哲回來、大三暑假 8/12 兩版、大四寒假 1/17 推甄上了／實習／交換延畢、
//   大二以後柏翰暑假只說「我回新竹了。」——H3-3、H3-4、H3-5、H3-6、6-3-5、6-3-6 的期待照改；6-3-9（8/12）新加。修改前這幾項 FAIL。
// X58（2026-10-27，使用者 10-18 15:4x「跳過途中收到訊息就跳出來、按了繼續跳；不要跳完才說「收到 N 則」」）：不用回的訊息也停、打開手機，「跳過」接著跳——
//   H2-1、H2-3、6-3-2 改成找「看得到那則邀約的那一次」打開手機（之前會先停在別的訊息）；H2-5 改成不用回的那則也停；6-3-1、6-3-4、6-3-7 看最後一張日期卡（中間停在訊息的卡在前面）。修改前（7dacc9463）H2-5 FAIL。
// AA_350 S1、S2（2026-10-21）：柏翰大三寒假只回去過年（1/24 17:00、1/28 20:00，蓋掉 AA 170a150d 的「民訴」兩句）、大三暑假七月補習（6/27、7/2 兩則）——H3-4 柏翰那一項、H3-5 照改，修改前（10dc79b1）這兩項 FAIL。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/holff3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], G=null, cards=[], phoneCalls=[], onPhone=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; },
  phoneThread:async(th,o)=>{ phoneCalls.push({th,skip:!!(o&&o.skip),day:G.day,hour:G.hour,pend:PHONE.pending(G).map(m=>m.ask.id)}); if(onPhone) await onPhone(); }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h, now=()=>Tm(G.day,G.hour);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; cards=[]; phoneCalls=[]; onPhone=null; GM.npc={}; if(STORY._fy) STORY._fy.reset(); };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const FAM=id=>{ meet(id); R(id,30,10,10); };
const noodle=()=>{ PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','classmate_bohan','classmate_xinci']) meet(id); };
const atHome=()=>{ const H=HOME.rec(G); H.at=true; H.day=G.day; const B=HOME.lawBreak(G); H.lbreak=B.key; H.brk=B.key; H.bskip={key:B.key,n:0,last:-1}; };
/* 照時間跑手機規則（每 step 小時一次，跨日）*/
const runTo=(key,h,step)=>{ step=step||0.25; const t1=Tm(D(key),h); let t=now(); while(t<t1-1e-9){ t=Math.min(t1,t+step); G.day=Math.floor(t/24); G.weekday=wdOf(G.day); G.hour=t-G.day*24; STORY.phoneRules(GM); PHONE.tick(G); } };
const msg=tag=>(G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.th+'|'+(m.from||'')+':'+m.text);
const at=tag=>{ const m=(G.msgs||[]).find(x=>x.tag===tag); return m?CALENDAR.dateOf(m.day).key.slice(5)+' '+m.h:null; };
const lbl=t=>{ const d=Math.floor(t/24), x=CALENDAR.dateOf(d), hh=t-d*24, m=Math.round(hh*60); return x.m+'/'+x.d+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const ptsOf=(key)=>HOME.breakPts(Object.assign({},G,{day:D(key)})).map(p=>CALENDAR.dateOf(p.day).key.slice(5)+'@'+p.h+':'+p.k);
(async()=>{
  check('0. 有 src/holff3d.js（HOLFF）、index.html 在 story3d.js 之後、GAME.boot() 之前',typeof HOLFF!=='undefined'&&(()=>{ const s=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=s.indexOf('src="src/holff3d.js'), b=s.indexOf('src="src/story3d.js'), c=s.indexOf('GAME.boot()'); return a>b&&b>0&&a<c; })());
  check('0. home3d.js 有快轉途中停下來的掛勾（S.waitNew、S.ffPhone、S.CARD_LINES）',!!(HOME.waitNew&&HOME.ffPhone&&Array.isArray(HOME.CARD_LINES)&&HOME.mustEvs));
  if(typeof HOLFF==='undefined'||!HOME.waitNew){ console.log('FAILED '+(fails||1)); process.exit(1); }

  /* ================= H2：要回的訊息停下來、打開手機 ================= */
  // H2-1 C05 阿凱（大一暑假 7/15 21:00 私訊、回到 7/19）：7/15 12:00 在宿舍的床快轉「過一週」
  fresh('2026-07-15',12,'dorm'); meet('kai');
  { picks=['過一週']; await HOME.ffMenu(GM,'dorm'); const c=phoneCalls.find(x=>x.pend.includes('vac_ask_C05@Y1'));   /* X58：不用回的訊息也會先停一次——找第一次看得到邀約的那一次 */
    check('H2-1. C05：快轉一週，7/15 21 點多停下來打開手機（對話列表、「跳過」），那時看得到阿凱的邀約',!!c&&phoneCalls.every(x=>x.skip)&&c.day===D('2026-07-15')&&c.hour>=21&&c.hour<22.01,JSON.stringify(phoneCalls));
    check('H2-1. 關掉手機（不回）以後接著跳：停在原本會停的 7/20 18:30（摘要日）',G.day===D('2026-07-20')&&Math.abs(G.hour-18.5)<1e-6,lbl(now()));
    check('H2-1. 開過的記在 _autoAsk（3D 的 STORY.phoneAuto 不再開同一則）',(G.flags._autoAsk||[]).includes(PHONE.byAsk(G,'vac_ask_C05@Y1').text));
    check('H2-1. 字卡：7/15 21 點多停一次（宿舍）、最後停在 7/20 18:30',cards.some(x=>/^7\/15（三）21:/.test(x[0])&&x[1]==='宿舍')&&cards[cards.length-1][0]==='7/20（一）18:30',JSON.stringify(cards)); }
  // H2-2 在手機裡回「去。」：報名、排日本五天；接著跳照樣到 7/20 18:30
  fresh('2026-07-15',12,'dorm'); meet('kai');
  { onPhone=async()=>{ PHONE.answer(G,'vac_ask_C05@Y1',0); }; picks=['過一週']; await HOME.ffMenu(GM,'dorm');
    check('H2-2. 停下來回了「去。」＝報名（VAC reg yes）、阿凱「好 我拉你進群」、排了 8/24 出發；之後接著跳到 7/20 18:30',VAC.state(G,'C05@Y1')==='yes'&&msg('vac_ask_C05@Y1').length>0&&(G.msgs||[]).some(m=>m.from==='kai'&&m.text==='好 我拉你進群')&&!!OUT.rec(G).find(q=>q.vac&&q.vac.key==='C05@Y1'&&q.day===D('2026-08-24'))&&G.day===D('2026-07-20')&&Math.abs(G.hour-18.5)<1e-6,lbl(now())); }
  // H2-3 VA10 香港（大二暑假 7/20 21:00 麵店團群組）：7/20 18:30 摘要日之後「過三天」
  fresh('2027-07-20',18.5,'dorm'); noodle(); meet('heroine_01'); meet('heroine_03');
  { picks=['過三天']; await HOME.ffMenu(GM,'dorm'); const c=phoneCalls.find(x=>x.pend.includes('va10_ask'));   /* X58：找第一次看得到邀約的那一次 */
    check('H2-3. VA10：7/20 21 點多停下來打開手機，看得到「我也去。」的邀約',!!c&&c.day===D('2027-07-20')&&c.hour>=21&&c.hour<22.01,JSON.stringify(phoneCalls)); }
  // H2-4 C01 海邊（大二寒假第一次去：揪人那天 21:05 起麵店團群組，問到海邊那天早上）
  { const d=VAC.c01Day('Y2'), da=VAC.c01Ask(d); fresh('2026-12-28',10,'dorm'); noodle(); G.day=da-1; G.weekday=wdOf(G.day); G.hour=10;
    picks=['過三天']; await HOME.ffMenu(GM,'dorm'); const c=phoneCalls[0];
    check('H2-4. C01：揪人那天 21 點多停下來（海邊在 '+CALENDAR.dateOf(d).key.slice(5)+'），看得到「我去／我那天不行」',!!c&&c.day===da&&c.hour>=21&&c.hour<22.75&&c.pend.includes('vac_c01first_Y2'),JSON.stringify(phoneCalls)); }
  // H2-5 沒有選項的訊息也停（X58，使用者 10-18 15:4x；原本不停、跳完才說「收到 N 則」）；跳之前就在的要回訊息不再停
  fresh('2026-01-07',10,'dorm');
  { PHONE.at(G,D('2026-01-08'),20,[{th:'p:zhe',from:'zhe',text:'測試：沒有選項的一則'}],'t_plain'); PHONE.post(G,{th:'p:zhe',from:'zhe',text:'測試：跳之前就在的問句',ask:{id:'t_old',opts:[{t:'好'}]}});
    picks=['過三天']; await HOME.ffMenu(GM,'dorm'); const pc=phoneCalls.filter(x=>!(x.day===D('2026-01-08')&&Math.abs(x.hour-22)<1e-6));   /* AA_532 第 4 節：留宿舍的寒假週四（1/8）也有家人群組——20:00 和這一則同時到（同一次停），22:00 爸爸「？」多停一次，那一次不算 */
    check('H2-5. 沒有選項的訊息（X58）：1/8 20:00 停下來打開手機（對話列表、「跳過」）；跳之前就在的問句不另外停；關掉以後照樣跳到 1/10 08:30',pc.length===1&&pc[0].skip&&pc[0].day===D('2026-01-08')&&Math.abs(pc[0].hour-20)<1e-6&&G.day===D('2026-01-10')&&Math.abs(G.hour-8.5)<1e-6&&msg('t_plain').length===1,lbl(now())+' '+JSON.stringify(phoneCalls)); }
  // H2-6 當面約的邀請（INV.offer）也算要回的
  fresh('2026-01-07',10,'dorm'); meet('zhe');
  { HOME.STOPS.push(function tStop(Gx,n){ if(Gx.day===D('2026-01-08')&&Gx.hour>=14&&!Gx.flags.T_OFFER){ Gx.flags.T_OFFER=1; INV.offer(Gx,'zhe','noodle',D('2026-01-09'),19); } return null; });
    picks=['過三天']; await HOME.ffMenu(GM,'dorm'); HOME.STOPS.pop(); const pc=phoneCalls.filter(x=>x.th!=='g:home');   /* AA_532 第 4 節：週四家人群組那兩次不算 */
    check('H2-6. 當面約的邀請（offered）：1/8 14 點多停下來打開手機',pc.length===1&&pc[0].day===D('2026-01-08')&&pc[0].hour>=14&&pc[0].hour<15.01,JSON.stringify(phoneCalls)); }
  // H2-7 住家裡：家裡的選單前自動打開沒開過的要回訊息（一次）
  fresh('2026-01-12',9,'dorm'); atHome(); PHONE.post(G,{th:'p:zhe',from:'zhe',text:'測試：在家收到的問句',ask:{id:'t_home',opts:[{t:'好'}]}});
  { let menus=0; const ch=GM.choose; GM.choose=async o=>{ menus++; return o.findIndex(q=>(q.t||q.text)==='回宿舍住'); }; await HOME.loop(GM); GM.choose=ch;
    check('H2-7. 放假住家裡：選單之前先打開手機一次（對話列表、不是「跳過」）；之後才出選單',phoneCalls.length===1&&!phoneCalls[0].skip&&phoneCalls[0].th==null&&menus>=1,JSON.stringify(phoneCalls)); }

  /* ================= H1：停點 ================= */
  fresh('2029-01-10',10,'dorm');
  check('H1-1. 大四寒假的表（AA_327 2-Y4-23～29）：2/12 12:00 除夕、2/13 11:00 初一、2/18 17:00 開學前一天',JSON.stringify(ptsOf('2029-01-10'))===JSON.stringify(['02-12@12:eve','02-13@11:cny','02-18@17:back']),JSON.stringify(ptsOf('2029-01-10')));
  { const out=[]; for(const [k,e,eve] of [['Y1W','2026-02-16'],['Y2W','2027-02-05',1],['Y3W','2028-01-25'],['Y4W','2029-02-12',1]]){ const de=D(e); fresh(e,8,'dorm'); atHome(); const a=HOME.breakNext(G); G.hour=12; const b=HOME.breakNext(G); G.hour=18.5; const c=HOME.breakNext(G); out.push([k,lbl(a),lbl(b),a===Tm(de,12)&&(eve?b===Tm(de,18.5)&&c===Tm(de+1,11):b===Tm(de+1,11))]); }   /* AA_532 2-1：2027、2029 除夕 18:30 年夜飯也停 */
    check('H1-2. 每個寒假：除夕 12:00、初一 11:00 一定停（大一～大四都查一次；人在家；2027、2029 中間多停除夕 18:30 年夜飯）',out.every(x=>x[3]),JSON.stringify(out)); }
  { const out=[]; for(const e of ['2026-02-16','2027-02-05','2028-01-25','2029-02-12']){ fresh(e,12,'dorm'); out.push([e,lbl(HOME.breakNext(G)),HOME.breakNext(G)===Tm(D(e),17)]); }
    check('H1-3. 除夕 12:00 人在宿舍：下一個停在 17:00（媽媽「飯快好了。」回家吃年夜飯），不會直接跳到初一',out.every(x=>x[2]),JSON.stringify(out)); }
  fresh('2028-01-25',12,'dorm'); G.hour=17.25; check('H1-3. 17:15 在宿舍＝HOME.eveDue（回家）',HOME.eveDue(G));
  // H1-4 主線 9（大年初一 ev_family_land_y3，在家演）：大三寒假除夕晚上在家快轉，停在初一 07 點多，那一刻事件成立
  fresh('2028-01-25',20.5,'dorm'); atHome(); G.flags.FAMILY_LAND_Y1='lawyer';
  { const jo={ff:true}; await HOME.breakJump(GM,Tm(D('2028-02-20'),12),jo);
    check('H1-4. 主線 9：除夕 20:30 在家快轉，停在初一 07:30（事件到了，why＝event），家裡那一輪就演 ev_family_land_y3',jo.why==='event'&&G.day===D('2028-01-26')&&Math.abs(G.hour-7.5)<1e-6&&!!HOME.breakEvent(G)&&HOME.breakEvent(G).id==='ev_family_land_y3',jo.why+' '+lbl(now())); }
  fresh('2028-01-26',11.5,'dorm'); G.flags.FAMILY_LAND_Y1='lawyer'; STORY.phoneRules(GM); PHONE.tick(G);   /* 初一 11:30 以前該收的先收（AA_532 2-2 初一 08:00 家人群組；不收的話跳的第一個小時補進來會停，X58）*/
  { const ok0=HOME.mustEvs(G).includes('ev_family_land_y3'), jo={ff:true}; await HOME.breakJump(GM,Tm(D('2028-01-26'),20),jo);
    check('H1-4. 跳之前已經成立、還沒演的事件不再停（不然每跳一次停一次）：初一 11:30 在宿舍跳到 20:00',ok0&&jo.why==null&&Math.abs(G.hour-20)<1e-6,jo.why+' '+lbl(now())); }
  // H1-5 事件包登記的 STORY.WAKE_AT（睡著也會醒來）＝快轉也停；HOME.STOPS 照舊
  fresh('2027-01-11',10,'dorm');
  { const f=Gx=>Gx.day===D('2027-01-12')&&Gx.hour<15?15:null; STORY.WAKE_AT.push(f); const nx=HOME.breakNext(G), jo={ff:true}; await HOME.breakJump(GM,Tm(D('2027-01-14'),8.5),jo); STORY.WAKE_AT.splice(STORY.WAKE_AT.indexOf(f),1);
    check('H1-5. 事件包登記 STORY.WAKE_AT（1/12 15:00）：快轉停在 1/12 15:00',G.day===D('2027-01-12')&&Math.abs(G.hour-15)<1e-6,lbl(now())+' / 原本下一個 '+lbl(nx)); }
  fresh('2027-01-11',10,'dorm');
  { const f=(Gx,n)=>{ const x=Tm(D('2027-01-13'),9); return x>n?x:null; }; HOME.STOPS.push(f); const jo={ff:true}; await HOME.breakJump(GM,Tm(D('2027-01-15'),8.5),jo); HOME.STOPS.splice(HOME.STOPS.indexOf(f),1);
    check('H1-6. 事件包登記 HOME.STOPS（1/13 09:00）：快轉停在那裡',G.day===D('2027-01-13')&&Math.abs(G.hour-9)<1e-6,lbl(now())); }
  // H1-7 大四寒假 2/3 研究所筆試（台灣路線、選研究所、推甄沒上）
  fresh('2029-02-01',10,'dorm',{EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail'}); const st7=HOLFF.stops(G,now());
  fresh('2029-02-01',10,'dorm',{EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'pass'}); const st7b=HOLFF.stops(G,now());
  fresh('2029-02-01',10,'dorm',{EXCHANGE_ROUTE:'US',Y4_PATH:'grad',Y4_PUSH:'fail'}); const st7c=HOLFF.stops(G,now());
  check('H1-7. 2/3 08:00 筆試：台灣路線、選研究所、推甄沒上才停（推甄上了、美國路線不停）',st7.includes(Tm(D('2029-02-03'),8))&&!st7b.includes(Tm(D('2029-02-03'),8))&&!st7c.includes(Tm(D('2029-02-03'),8)));
  // H1-9 主線 7（大三寒假 1/10 21:00 姊姊約 1/12 19:00 火鍋，回到 1/12 18:30）：快轉「過三天」停在那則、回「好。」以後停在火鍋出發前
  fresh('2028-01-10',9,'dorm');
  { onPhone=async()=>{ PHONE.answer(G,'y3_sis_hotpot',0); }; picks=['過三天']; await HOME.ffMenu(GM,'dorm'); const c=phoneCalls[0];
    check('H1-9. 主線 7：1/10 9:00「過三天」，21 點多停下來打開手機（姊姊「禮拜三我來臺北出差。」…）；回「好。」以後接著跳，停在 1/12 火鍋出發前（18:15）',!!c&&c.day===D('2028-01-10')&&c.hour>=21&&c.hour<22.01&&c.pend.includes('y3_sis_hotpot')&&!!OUT.get(G,'y3_sis_hotpot')&&G.day===D('2028-01-12')&&Math.abs(G.hour-18.25)<1e-6,JSON.stringify([phoneCalls,lbl(now())])); }
  // H1-8 大四寒假從成績那天一路快轉（住家裡）：成績 → 1/17 → 1/24 → 除夕 → 初一 → 2/18 12:00
  fresh('2029-01-08',8.5,'dorm',{Y4_PATH:'bar'}); atHome();
  { const seq=[]; for(let i=0;i<12&&HOME.ffOpts(G);i++){ picks=['到下一個有事的日子']; cards=[]; await HOME.ffMenu(GM,'home'); seq.push(lbl(now())); }
    check('H1-8. 大四寒假住家裡一路「到下一個有事的日子」：1/17 18:30 → 1/24 18:30 → 2/12 12:00 → 2/12 18:30（年夜飯）→ 2/13 11:00 → 2/18 12:00（快轉的上限）',JSON.stringify(seq)===JSON.stringify(['1/17 18:30','1/24 18:30','2/12 12:00','2/12 18:30','2/13 11:00','2/18 12:00']),JSON.stringify(seq)); }   /* AA_532 2-1：除夕 18:30 年夜飯也停 */

  /* ================= H3：朋友回老家、回臺北 ================= */
  // 大二寒假：柏翰 1/9 17:00、以安 2/1 15:00（FAMILIAR＝私訊）、柏翰 2/19 20:00、阿哲 2/20 19:00、以安 2/21 18:00
  fresh('2027-01-08',10,'dorm'); noodle(); FAM('heroine_01'); runTo('2027-02-21',23,1);
  check('H3-1. 大二寒假（AA_446 第 1 節換字）：柏翰 1/9 17:00「我今天回新竹。債總帶回去了，2/19 回來。」、2/19 20:00「回來了。開學前我先去總圖占位子。」（麵店團）',JSON.stringify(msg('hol_y2w_bh_home'))===JSON.stringify(['g:noodle_team|classmate_bohan:我今天回新竹。債總帶回去了，2/19 回來。'])&&at('hol_y2w_bh_home')==='01-09 17'&&JSON.stringify(msg('hol_y2w_bh_back'))===JSON.stringify(['g:noodle_team|classmate_bohan:回來了。開學前我先去總圖占位子。'])&&at('hol_y2w_bh_back')==='02-19 20',at('hol_y2w_bh_home')+' / '+at('hol_y2w_bh_back'));
  check('H3-1. 大二寒假：阿哲 2/20 19:00「我回來了！這次帶了烏魚子 我阿嬤做的」「開學那天拿去麵店」',JSON.stringify(msg('hol_y2w_zhe_back'))===JSON.stringify(['g:noodle_team|zhe:我回來了！這次帶了烏魚子 我阿嬤做的','g:noodle_team|zhe:開學那天拿去麵店'])&&at('hol_y2w_zhe_back')==='02-20 19');
  check('H3-1. 大二寒假：以安（FAMILIAR）私訊 2/1 15:00「回台中了。」「我媽來車站接我。她說我瘦了。……沒有。」、2/21 18:00「回臺北了。我媽在行李箱塞了一袋橘子。」',JSON.stringify(msg('hol_y2w_an_home'))===JSON.stringify(['p:heroine_01|heroine_01:回台中了。','p:heroine_01|heroine_01:我媽來車站接我。她說我瘦了。……沒有。'])&&at('hol_y2w_an_home')==='02-01 15'&&JSON.stringify(msg('hol_y2w_an_back'))===JSON.stringify(['p:heroine_01|heroine_01:回臺北了。我媽在行李箱塞了一袋橘子。'])&&at('hol_y2w_an_back')==='02-21 18',JSON.stringify([msg('hol_y2w_an_home'),at('hol_y2w_an_home')]));
  fresh('2027-01-31',10,'dorm'); noodle(); meet('heroine_01'); runTo('2027-02-02',10,1);
  check('H3-2. 以安只是認識、在麵店團：群組只有第一句「回台中了。」（大一寒假的寫法）',JSON.stringify(msg('hol_y2w_an_home'))===JSON.stringify(['g:noodle_team|heroine_01:回台中了。']));
  fresh('2027-01-08',10,'dorm'); runTo('2027-01-10',10,1); check('H3-2. 不在麵店團：群組的那幾則不收',msg('hol_y2w_bh_home').length===0);
  // 大二暑假
  fresh('2027-06-26',10,'dorm'); noodle(); FAM('heroine_01'); runTo('2027-08-22',10,1);
  check('H3-3. 大二暑假：柏翰 6/27 20:00「我回新竹了。」（AA_345 H7：大二以後沒有「週四在總圖三樓」）、阿哲 6/30 22:00 兩則、8/21 19:00 兩則；以安 7/24 15:00「📷（高鐵窗外的田）」「回台中了。8 號回去。」、8/8 21:00「回臺北了。六本讀完四本。」（AA_446 第 2 節換字）',
    at('hol_y2s_bh_home')==='06-27 20'&&JSON.stringify(msg('hol_y2s_bh_home'))===JSON.stringify(['g:noodle_team|classmate_bohan:我回新竹了。家裡的冷氣比宿舍的好。'])&&JSON.stringify(msg('hol_y2s_zhe_home'))===JSON.stringify(['g:noodle_team|zhe:明天回高雄','g:noodle_team|zhe:你們吃麵 我遠端參加'])&&at('hol_y2s_zhe_home')==='06-30 22'&&JSON.stringify(msg('hol_y2s_zhe_back'))===JSON.stringify(['g:noodle_team|zhe:我回來了','g:noodle_team|zhe:遠端吃麵 一次都沒成功','g:noodle_team|zhe:誰要吃麵'])&&at('hol_y2s_zhe_back')==='08-21 19'
    &&JSON.stringify(msg('hol_y2s_an_home'))===JSON.stringify(['p:heroine_01|heroine_01:📷（台中家裡的書桌，疊著一疊書）','p:heroine_01|heroine_01:回台中了。這次帶了六本。8 號回去。'])&&at('hol_y2s_an_home')==='07-24 15'&&at('hol_y2s_an_back')==='08-08 21',JSON.stringify([at('hol_y2s_an_home'),at('hol_y2s_an_back')]));
  fresh('2027-07-23',10,'dorm',{dating_heroine_01:true}); FAM('heroine_01'); runTo('2027-07-25',10,1); check('H3-3. 和以安交往中：暑假那兩則不傳（大一 va02 的規則）',msg('hol_y2s_an_home').length===0);
  // 大三寒假
  { const d=VAC.c01Day('Y3'); fresh('2027-12-28',10,'dorm'); noodle(); FAM('heroine_01'); runTo('2028-02-20',23,1);
    check('H3-4. 大三寒假：阿哲在海邊那天（'+CALENDAR.dateOf(d).key.slice(5)+'）21:00「明天回高雄 我阿嬤問你們今年要不要來」（AA_456 1-4 換字）',JSON.stringify(msg('hol_y3w_zhe_home'))===JSON.stringify(['g:noodle_team|zhe:明天回高雄 我阿嬤問你們今年要不要來'])&&at('hol_y3w_zhe_home')===CALENDAR.dateOf(d).key.slice(5)+' 21',at('hol_y3w_zhe_home'));
    check('H3-4. 大三寒假：以安 1/24 15:00 回台中、1/29 18:00 回臺北（AA_275 第 12 節）；柏翰只回去過年（AA_350 S2）：1/24 17:00「我明天回新竹過年。初三回來。」、1/28 20:00「回來了。民法讀到物權了。」（麵店團）',at('hol_y3w_an_home')==='01-24 15'&&at('hol_y3w_an_back')==='01-29 18'&&at('hol_y3w_bh_home')==='01-24 17'&&at('hol_y3w_bh_back')==='01-28 20'
      &&JSON.stringify(msg('hol_y3w_bh_home'))===JSON.stringify(['g:noodle_team|classmate_bohan:我明天回新竹過年。初三回來。'])&&JSON.stringify(msg('hol_y3w_bh_back'))===JSON.stringify(['g:noodle_team|classmate_bohan:回來了。民法讀到物權了。']),JSON.stringify([at('hol_y3w_bh_home'),msg('hol_y3w_bh_home'),at('hol_y3w_bh_back'),msg('hol_y3w_bh_back')]));
    check('H3-4. 大三寒假：阿哲 2/18 21:00「禮拜天回台北」「開學前最後一頓 禮拜天六點 麵店」、2/20 17:30「我回來了 高雄帶了吃的 等一下拿去麵店」（AA_345 H1、H2；沒有大一那句「開學那天拿去給你們」）',JSON.stringify(msg('hol63_y3w_zhe'))===JSON.stringify(['g:noodle_team|zhe:禮拜天回台北','g:noodle_team|zhe:開學前最後一頓 禮拜天六點 麵店'])&&at('hol63_y3w_zhe')==='02-18 21'&&JSON.stringify(msg('hol_y3w_zhe_back'))===JSON.stringify(['g:noodle_team|zhe:我回來了 高雄帶了吃的 等一下拿去麵店'])&&at('hol_y3w_zhe_back')==='02-20 17.5'&&!(G.msgs||[]).some(m=>m.day>=D('2028-01-20')&&m.from==='zhe'&&/開學那天拿去給你們/.test(m.text)),JSON.stringify([msg('hol63_y3w_zhe'),at('hol63_y3w_zhe'),msg('hol_y3w_zhe_back'),at('hol_y3w_zhe_back')])); }
  // 大三暑假：以安在日本
  fresh('2028-06-26',10,'dorm'); noodle(); FAM('heroine_01'); runTo('2028-08-22',10,1);
  check('H3-5. 大三暑假：柏翰七月要補習（AA_350 S1）6/27 20:00「我回新竹幾天。七月三號補習班開課就回來。」、7/2 20:00「回來了。明天開課。」；阿哲 6/30、8/21；以安在日本＝沒有',at('hol_y3s_bh_home')==='06-27 20'&&JSON.stringify(msg('hol_y3s_bh_home'))===JSON.stringify(['g:noodle_team|classmate_bohan:我回新竹幾天。七月三號補習班開課就回來。'])&&at('hol_y3s_bh_back')==='07-02 20'&&JSON.stringify(msg('hol_y3s_bh_back'))===JSON.stringify(['g:noodle_team|classmate_bohan:回來了。明天開課。'])
    &&at('hol_y3s_zhe_home')==='06-30 22'&&at('hol_y3s_zhe_back')==='08-21 19'&&!(G.msgs||[]).some(m=>m.from==='heroine_01'&&/回台中|回臺北/.test(m.text)),JSON.stringify([msg('hol_y3s_bh_home'),at('hol_y3s_bh_back'),msg('hol_y3s_bh_back')]));
  // 大四寒假
  { const d=VAC.c01Day('Y4'); fresh('2028-12-26',10,'dorm'); noodle(); FAM('heroine_01'); runTo('2029-02-18',23,1);
    check('H3-6. 大四寒假：阿哲海邊那天（'+CALENDAR.dateOf(d).key.slice(5)+'）21:00「我明天回高雄」；以安 2/9 15:00、2/18 18:00',at('hol_y4w_zhe_home')===CALENDAR.dateOf(d).key.slice(5)+' 21'&&at('hol_y4w_an_home')==='02-09 15'&&at('hol_y4w_an_back')==='02-18 18',JSON.stringify([at('hol_y4w_zhe_home'),at('hol_y4w_an_home'),at('hol_y4w_an_back')]));
    check('H3-6. 大四寒假（AA_345 H2）：柏翰 2/11 17:00「我明天回新竹。初三回來。」、2/15 20:00「回來了。總圖見。」；阿哲 2/17 19:00「我回來了！高雄帶了吃的」「禮拜一開學 拿去給你們」（麵店團）',JSON.stringify(msg('hol_y4w_bh_home'))===JSON.stringify(['g:noodle_team|classmate_bohan:我明天回新竹。初三回來。'])&&at('hol_y4w_bh_home')==='02-11 17'&&JSON.stringify(msg('hol_y4w_bh_back'))===JSON.stringify(['g:noodle_team|classmate_bohan:回來了。總圖見。'])&&at('hol_y4w_bh_back')==='02-15 20'&&JSON.stringify(msg('hol_y4w_zhe_back'))===JSON.stringify(['g:noodle_team|zhe:我回來了！高雄帶了吃的','g:noodle_team|zhe:禮拜一開學 拿去給你們'])&&at('hol_y4w_zhe_back')==='02-17 19',JSON.stringify([at('hol_y4w_bh_home'),at('hol_y4w_bh_back'),at('hol_y4w_zhe_back')])); }

  /* ================= 6-3：摘要日的旁白、群組訊息 ================= */
  // 大一寒假：1/12 在宿舍「到下一個有事的日子」＝1/14 18:30，日期卡下面那一行是旁白；1/15 21:00 阿哲（要回的＝H2 停）
  fresh('2026-01-12',10,'dorm'); noodle();
  { picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm');
    check('6-3-1. 大一寒假：1/12 快轉停在 1/14 18:30，日期卡下面「（寒假第四週。你把上學期的筆記重新整理了一次。民總那本比刑總厚。）」（X58：中間停在訊息的卡在前面，看最後一張；這一句只出一次）',G.day===D('2026-01-14')&&Math.abs(G.hour-18.5)<1e-6&&cards[cards.length-1][1]==='（寒假第四週。你把上學期的筆記重新整理了一次。民總那本比刑總厚。）'&&cards.filter(x=>x[1]==='（寒假第四週。你把上學期的筆記重新整理了一次。民總那本比刑總厚。）').length===1,JSON.stringify(cards));
    let r1=null; onPhone=async()=>{ r1=r1||PHONE.answer(G,'hol63_y1w_zhe',0); };   /* AA_532 第 4 節：1/15（四）20:00 家人群組、22:00 爸爸「？」也會停——回到的那一次留著 */ picks=['到下一個有事的日子']; cards=[]; await HOME.ffMenu(GM,'dorm'); const c=phoneCalls.find(x=>x.pend.includes('hol63_y1w_zhe')), m=PHONE.byAsk(G,'hol63_y1w_zhe');   /* X58：找看得到阿哲那則的那一次 */
    check('6-3-2. 1/15 21:00 麵店團，阿哲「高雄今天二十六度」「台北的人在幹嘛」＋「讀書。」「睡覺。」；快轉停在那一刻打開手機',JSON.stringify(msg('hol63_y1w_zhe'))===JSON.stringify(['g:noodle_team|zhe:高雄今天二十六度','g:noodle_team|zhe:台北的人在幹嘛'])&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['讀書。','睡覺。'])&&!!c&&c.day===D('2026-01-15')&&c.hour>=21,JSON.stringify([msg('hol63_y1w_zhe'),phoneCalls]));
    check('6-3-2. 停下來的時候回「讀書。」→ 阿哲「騙人」',!!r1&&r1.out.map(x=>x.from+':'+x.text).join('|')==='player:讀書。|zhe:騙人',JSON.stringify(r1&&r1.out.map(x=>x.text))); }
  fresh('2026-01-15',21.5,'dorm'); noodle(); runTo('2026-01-15',21.75); { const r=PHONE.answer(G,'hol63_y1w_zhe',1); check('6-3-2. 回「睡覺。」→ 阿哲「這才對」',!!r&&r.out.map(x=>x.text).join('|')==='睡覺。|這才對'); }
  // 大二寒假開學前一週：2/16 摘要日；2/19 21:00 讀書會群組
  fresh('2027-02-14',10,'dorm'); PHONE.join(G,'public_law','公法讀書會'); FAM('heroine_01'); meet('classmate_bohan');
  { picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm');
    check('6-3-3. 大二寒假：2/16 18:30「（開學前一週。你先把下學期的一本課本買了。）」',G.day===D('2027-02-16')&&cards[0][1]==='（開學前一週。你先把下學期的一本課本買了。）',JSON.stringify(cards));
    runTo('2027-02-19',21.25); check('6-3-3. 2/19 21:00 讀書會群組：以安「下禮拜開學。讀書會第二週開始。」→ 柏翰「收到。」',JSON.stringify(msg('hol63_y2w_pl'))===JSON.stringify(['g:public_law|heroine_01:下禮拜開學。讀書會第二週開始。','g:public_law|classmate_bohan:收到。'])); }
  fresh('2027-02-19',20,'dorm'); PHONE.join(G,'public_law','公法讀書會'); meet('heroine_01'); runTo('2027-02-19',21.25); check('6-3-3. 和以安不到 FAMILIAR：沒有',msg('hol63_y2w_pl').length===0);
  // 大三寒假：1/19、2/2 摘要日；2/9 阿哲揪 2/12 麵店（去＝出遊）
  fresh('2028-01-17',10,'dorm'); noodle();
  { picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); const c1=cards[cards.length-1];   /* X58：最後一張（停在訊息的卡在前面）*/
    fresh('2028-01-31',10,'dorm'); noodle(); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); const c2=cards[cards.length-1];
    check('6-3-4. 大三寒假：1/19 18:30「（寒假第四週。你回國中的學校走了一圈。圍牆換了顏色。）」、2/2 18:30「（初八。公館的店一間一間開了。）」',c1[0]==='1/19（三）18:30'&&c1[1]==='（寒假第四週。你回國中的學校走了一圈。圍牆換了顏色。）'&&c2[0]==='2/2（三）18:30'&&c2[1]==='（初八。公館的店一間一間開了。）',JSON.stringify([c1,c2])); }
  fresh('2028-02-09',20,'dorm'); noodle(); runTo('2028-02-09',21.25); const none9=!msg('hol63_y3w_zhe').length;
  fresh('2028-02-18',20,'dorm'); noodle(); runTo('2028-02-18',21.25);
  { const m=PHONE.byAsk(G,'hol63_y3w_zhe'); check('6-3-5. AA_345 H1：2/9 沒有；2/18（五）21:00 阿哲「禮拜天回台北」「開學前最後一頓 禮拜天六點 麵店」＋「去。」「不去。」',none9&&JSON.stringify(msg('hol63_y3w_zhe'))===JSON.stringify(['g:noodle_team|zhe:禮拜天回台北','g:noodle_team|zhe:開學前最後一頓 禮拜天六點 麵店'])&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['去。','不去。']),JSON.stringify(msg('hol63_y3w_zhe')));
    PHONE.answer(G,'hol63_y3w_zhe',0); STORY.phoneRules(GM); const q=OUT.get(G,'hol63_y3w_noodle'), ev=STORY_EVENTS.find(e=>e.id==='ev_hol63_y3w_noodle');
    check('6-3-5. 回「去。」＝排出遊 2/20（日）18:00 麵店（開學前一晚）；旁白「（開學前一晚。長桌坐了一半，阿哲的行李箱還靠在牆邊。…）」＋阿哲那句照舊（AA_345 H1、H4）',!!q&&q.day===D('2028-02-20')&&q.h===18&&q.ev==='ev_hol63_y3w_noodle'&&!!ev&&ev.trigger==='outing'&&JSON.stringify(ev.dialogue.slice(1).map(l=>(l.speaker||'')+':'+l.text))===JSON.stringify([':（開學前一晚。長桌坐了一半，阿哲的行李箱還靠在牆邊。大家都在講下學期要修什麼。）','zhe:大三下了。……時間過得好快，我先講，你們不要笑。']),JSON.stringify(q&&[CALENDAR.dateOf(q.day).key,q.h]));
    { const nx=HOME.breakNext(G); check('6-3-5. 快轉在那一趟出遊以前停下來（2/20 18:00 以前）',nx>Tm(D('2028-02-19'),23)&&nx<Tm(D('2028-02-20'),18),lbl(nx)); }
    runTo('2028-02-20',17.75); check('6-3-5. 2/20 17:30 群組：阿哲「我回來了 高雄帶了吃的 等一下拿去麵店」',JSON.stringify(msg('hol_y3w_zhe_back'))===JSON.stringify(['g:noodle_team|zhe:我回來了 高雄帶了吃的 等一下拿去麵店'])); }
  fresh('2028-02-18',20,'dorm'); noodle(); runTo('2028-02-18',21.25); { const r=PHONE.answer(G,'hol63_y3w_zhe',1); STORY.phoneRules(GM); check('6-3-5. 回「不去。」→ 阿哲「好喔」，不排出遊',!!r&&r.out.map(x=>x.text).join('|')==='不去。|好喔'&&!OUT.get(G,'hol63_y3w_noodle')); }
  fresh('2028-02-20',13,'dorm',{EXCHANGE_ROUTE:'JP',X1_JP:D('2028-02-20'),HOL_Y3W_NOODLE:'go'}); STORY.phoneRules(GM); { const q=OUT.get(G,'hol63_y3w_noodle');
    check('6-3-5. 日本路線 2/20 14:00 退宿、人還在臺北：一樣排得到 2/20 18:00 那一頓（AA_345 H1）',!!q&&q.day===D('2028-02-20')&&q.h===18); }
  // 大四寒假：1/17 照 Y4_PATH 三版、1/24、1/31 Alison
  { const v={}; for(const [p,push] of [['bar'],['grad','fail'],['undecided'],['other'],['grad','pass']]){ fresh('2029-01-16',10,'dorm',{Y4_PATH:p,Y4_PUSH:push,EXCHANGE_ROUTE:'TW'}); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); v[p+(push?'/'+push:'')]=lbl(now())+' '+cards[0][1]; }
    for(const r of ['JP','US']){ fresh('2029-01-16',10,'dorm',{Y4_PATH:'bar',EXCHANGE_ROUTE:r}); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); v[r]=lbl(now())+' '+cards[0][1]; }
    check('6-3-6. 大四寒假 1/17 18:30：國考「（寒假。你每天八點到總圖，坐同一個位子。）」／研究所要考筆試「（筆試前兩週。你把考古題做到第五年。）」／還沒決定「（寒假。你還沒決定，每天還是去總圖坐一下。）」',
      v.bar==='1/17 18:30 （寒假。你每天八點到總圖，坐同一個位子。）'&&v['grad/fail']==='1/17 18:30 （筆試前兩週。你把考古題做到第五年。）'&&v.undecided==='1/17 18:30 （寒假。你還沒決定，每天還是去總圖坐一下。）',JSON.stringify(v));
    check('6-3-6. AA_345 H5：推甄上了「（寒假。推甄上了，你還是每天去總圖，先讀研究所要修的書。）」／實習（先不考）「（寒假。你不用考試。事務所寄來一份實習前要先讀的資料。）」／日本、美國路線（交換延畢）「（寒假。你的考試還要再一年。每天還是到總圖坐一下。）」蓋過上面',
      v['grad/pass']==='1/17 18:30 （寒假。推甄上了，你還是每天去總圖，先讀研究所要修的書。）'&&v.other==='1/17 18:30 （寒假。你不用考試。事務所寄來一份實習前要先讀的資料。）'&&v.JP==='1/17 18:30 （寒假。你的考試還要再一年。每天還是到總圖坐一下。）'&&v.US==='1/17 18:30 （寒假。你的考試還要再一年。每天還是到總圖坐一下。）',JSON.stringify(v)); }
  fresh('2029-01-22',10,'dorm',{Y4_PATH:'bar',EXCHANGE_ROUTE:'JP'}); { picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); check('6-3-6. 1/24 18:30「（寒假第五週。總圖的人比期末考的時候還多。）」（交換延畢的日本路線也一樣）',cards[0][0]==='1/24（三）18:30'&&cards[0][1]==='（寒假第五週。總圖的人比期末考的時候還多。）',JSON.stringify(cards)); }
  fresh('2029-01-31',20,'dorm'); noodle(); runTo('2029-01-31',21.25); check('6-3-6. 1/31 21:00 麵店團，Alison「考試的人 加油」「沒考試的人 不要吵他們」',JSON.stringify(msg('hol63_y4w_yu'))===JSON.stringify(['g:noodle_team|yu:考試的人 加油','g:noodle_team|yu:沒考試的人 不要吵他們']));
  // 暑假：大一 8/12、大二 8/15、大三 7/18（宿舍／家裡兩版；日本路線在國外不停）
  { const r=[]; for(const [k,h0,want] of [['2026-08-10',10,'（暑假過了一半。你把大二上的課表排了三次。）'],['2027-08-12',10,'（八月中。你把大三的課表印出來，貼在書桌前面。）'],['2028-07-16',10,'（暑假的宿舍很安靜。走廊只聽得到冷氣的聲音。）']]){ fresh(k,h0,'dorm'); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); const cz=cards[cards.length-1]; r.push([lbl(now()),cz[1],cz[1]===want]); }   /* X58：最後一張（停在訊息的卡在前面）*/
    fresh('2028-07-16',10,'dorm'); atHome(); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'home'); { const cz=cards[cards.length-1]; r.push([lbl(now()),cz[1],cz[1]==='（你在家裡的書桌讀書。媽媽每兩個小時進來問一次要不要吃水果。）']); }
    check('6-3-7. 暑假的摘要日：大一 8/12、大二 8/15、大三 7/18（續住在宿舍／回家住在家裡兩版）',r.every(x=>x[2])&&r[0][0]==='8/12 18:30'&&r[1][0]==='8/15 18:30'&&r[2][0]==='7/18 18:30'&&r[3][0]==='7/18 18:30',JSON.stringify(r)); }
  fresh('2028-07-16',10,'dorm',{EXCHANGE_ROUTE:'JP'}); check('6-3-7. 日本路線 7/18 人在日本：大三暑假那一天不停',!HOLFF.stops(G,now()).includes(Tm(D('2028-07-18'),18.5)));
  // 6-3-9 大三暑假 8/12（AA_345 H3）：台灣路線照 Y4_PATH 兩版；日本路線（8/5 回來住家裡）是 jp3d.js 的 s_0812（用同一個 HOLFF.y3sPath），這裡不排；美國路線 8/2 起在國外
  { const r=[]; for(const [p,want] of [['bar','（八月。你把大四要走的那條路寫在紙上，下面列了要讀的書。列到第三頁。）'],['other','（八月。你把大四要走的那條路寫在紙上，下面列了要讀的書。列到第三頁。）'],['undecided','（八月。你把大四可以走的路寫在紙上：國考、研究所。兩個都畫了問號。）']]){
      fresh('2028-08-10',10,'dorm',{Y4_PATH:p,EXCHANGE_ROUTE:'TW'}); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); const cz=cards[cards.length-1]; r.push([p,lbl(now()),cz&&cz[1],lbl(now())==='8/12 18:30'&&!!cz&&cz[1]===want]); }   /* 最後一張（AA_532 第 4 節：8/10（四）家人群組那一次停的卡在前面）*/
    check('6-3-9. 台灣路線 8/12 18:30：選好了（國考、實習…）「（八月。你把大四要走的那條路寫在紙上，下面列了要讀的書。列到第三頁。）」／還沒決定「（八月。…兩個都畫了問號。）」',r.every(x=>x[3]),JSON.stringify(r));
    fresh('2028-08-10',10,'dorm',{EXCHANGE_ROUTE:'JP',Y4_PATH:'bar'}); const jp=HOLFF.stops(G,now()).includes(Tm(D('2028-08-12'),18.5));
    fresh('2028-08-10',10,'dorm',{EXCHANGE_ROUTE:'US',Y4_PATH:'bar'}); const us=HOLFF.stops(G,now()).includes(Tm(D('2028-08-12'),18.5));
    check('6-3-9. 日本路線（jp3d.js 那邊演同一句）、美國路線（在國外）：holff 不排 8/12；兩句只寫在 HOLFF.y3sPath 一個地方',!jp&&!us&&typeof HOLFF.y3sPath==='function'&&!/列到第三頁|兩個都畫了問號/.test(fs.readFileSync(path.join(ROOT,'src/jp3d.js'),'utf8')),JSON.stringify([jp,us])); }
  fresh('2026-01-13',10,'dorm'); OUT.plan(G,{id:'t_vac_day',ev:'ev_vac_key',day:D('2026-01-14'),h:10,place:'公館',title:'測試的假期活動',vac:{key:'T@Y1',k:0}}); check('6-3-8. 那天有報名的假期活動＝不停、不出旁白（同 HOME.sumSkip）',!HOLFF.stops(G,now()).includes(Tm(D('2026-01-14'),18.5))&&HOLFF.cardLine(G,Tm(D('2026-01-14'),18.5))==null);
    { // BB 退件 HOLFF-EVE-NARR（2026-10-21）：除夕 17:00 停站的宿舍旁白不能是「初二。……」；初二停的照舊
    fresh('2026-02-16',12,'dorm',{}); const B=HOME.lawBreak(G), e=HOME.eveDay(B); HOME.rec(G).bskipD={key:B.key,n:0,last:-1};
    const l1=HOME.breakSkipLine(G,Tm(e,12),Tm(e,17),{dorm:true});
    HOME.rec(G).bskipD={key:B.key,n:0,last:-1}; const l2=HOME.breakSkipLine(G,Tm(e-1,20),Tm(e+2,11),{dorm:true});
    check('HOLFF-EVE-NARR：除夕 12:00→17:00（停在除夕）宿舍旁白是「年前」那句、不是「初二」；跳到初二才是初二那句',e===D('2026-02-16')&&!!l1&&!/^初二/.test(l1)&&/年前/.test(l1)&&/^初二/.test(l2||''),JSON.stringify([l1,l2])); }
  { // BB HOLFF-EVE-SKIP：除夕 17:00 以後還在宿舍，點床的快轉先回家吃年夜飯（不跳到初一）
    fresh('2026-02-16',17.1,'dorm',{}); let went=0; const g0=HOME.eveGo; HOME.eveGo=async()=>{ went++; G.zone='home'; return true; };
    const before=now(); const r=await HOME.ffMenu(GM,'dorm'); HOME.eveGo=g0;
    check('HOLFF-EVE-SKIP：除夕 17:00 以後在宿舍點「快轉」＝先回家（eveGo），時間不往前跳',r===true&&went===1&&now()===before,JSON.stringify({r,went,dt:now()-before})); }
  { // AA_350 O1：停的那一站日期卡有專用句（摘要日）＝一張卡一句，不接輪替旁白
    fresh('2026-01-10',8.5,'dorm',{}); const H=HOME.rec(G); const B=HOME.lawBreak(G); H.bskipD={key:B.key,n:0,last:-1};
    picks=['到下一個有事的日子']; said=[]; cards=[]; await HOME.ffMenu(GM,'dorm');
    const at=Tm(G.day,G.hour), sp=cards.find(c=>/寒假第四週。你把上學期的筆記重新整理了一次/.test(c[1]||'')), extra=said.filter(x=>!x.who).map(x=>x.t);
    check('AA_350 O1：快轉停在 1/14 18:30 摘要日：日期卡是專用句，後面不再接宿舍的輪替旁白',G.day===D('2026-01-14')&&Math.abs(G.hour-18.5)<1e-6&&!!sp&&!extra.some(t=>/寒假的宿舍|年前|棉被/.test(t)),JSON.stringify({day:G.day,h:G.hour,cards,extra})); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
