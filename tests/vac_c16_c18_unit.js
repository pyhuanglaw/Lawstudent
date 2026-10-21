// 寒暑假第二批：C16 法扶實習、C17 律所暑期實習、C18／C18W 海外見習團（AA_199 7-7 7915ac9d；台詞 AA_242 第 9～11 節 ede67b34；任務 VAC-C16-C18-1021）——不需要瀏覽器。
// 用法：node tests/vac_c16_c18_unit.js（VAC_TEST_ROOT＝別的目錄：拿那裡的 src 跑，驗證改之前的程式會失敗）
// 修改前：沒有 C16／C17／C18／C18W 的卡、沒有上班日、沒有門檻（幾乎全部失敗）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.env.VAC_TEST_ROOT?path.resolve(process.env.VAC_TEST_ROOT):path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA|DATE|ROM|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const safe=f=>{ try{ return f(); }catch(e){ return undefined; } };   // 改之前的程式沒有這些函式：當作失敗，不中斷
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const tagged=tg=>(G.msgs||[]).filter(m=>m.tag===tg);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
const inst=(id,yk)=>safe(()=>VAC.inst(id,yk))||null;
const workQ=key=>(typeof OUT!=='undefined'?OUT.rec(G):[]).filter(q=>q.vac&&q.vac.key===key&&q.vac.k==='w').sort((a,b)=>a.day-b.day);
const onDay=(key,k)=>workQ(key).find(q=>q.day===D(k));
let cards=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.money=function(n){ G.money+=n; };
const LAWC=()=>{ PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'noodle_team','麵店團'); };
const sec=async f=>{ try{ await f(); }catch(e){ check('（這一段中途出錯：'+String(e&&e.message||e).slice(0,120)+'）',false); } };   // 一段出錯不中斷（改之前的程式沒有這些函式）
const reg=key=>{ const ok=VAC.signup(G,key,'yes'); const [id,yk]=key.split('@'), I=inst(id,yk), need=I&&I.A.select&&I.A.select.needI; if(need) safe(()=>VAC.markI(G,I,need)); return ok; };   // 直接報名（情境從暑假開始）：這一次的申請表、面試當作已經做了，錄取照常
(async()=>{
  // ===== 1. 開哪幾年、日子（AA_199 7-7、7-5；AA-C 10-21：C16 大二暑假起、C17 只有大二大三暑假、C18 寒暑假團、大四下以後沒有）=====
  check('1. C16：大二暑假起（大一不能報）、大四下以後沒有＝Y2、Y3 有，Y1、Y4 沒有',!inst('C16','Y1')&&!!inst('C16','Y2')&&!!inst('C16','Y3')&&!inst('C16','Y4'));
  check('1. C17：只有大二、大三暑假',!inst('C17','Y1')&&!!inst('C17','Y2')&&!!inst('C17','Y3')&&!inst('C17','Y4'));
  check('1. C18 暑假團大一～大三（大四下以後沒有）、寒假團 C18W 大一～大四',['Y1','Y2','Y3'].every(y=>!!inst('C18',y))&&!inst('C18','Y4')&&['Y1','Y2','Y3','Y4'].every(y=>!!inst('C18W',y)));
  await sec(async()=>{ const R=(id,yk,a,b)=>{ const I=inst(id,yk); return !!I&&I.from===D(a)&&I.to===D(b); };
    check('1. 日子：C16 暑假第 2 週起兩週（2027-06-21～07-02、2028-06-19～06-30）；C17 暑假第 2 週起 8 週（2027-06-21～08-13、2028-06-19～08-11）',R('C16','Y2','2027-06-21','2027-07-02')&&R('C16','Y3','2028-06-19','2028-06-30')&&R('C17','Y2','2027-06-21','2027-08-13')&&R('C17','Y3','2028-06-19','2028-08-11'));
    check('1. 日子：C18 暑假第 6 週起 9 天（2026-07-20～28、2027-07-19～27、2028-07-17～25）；寒假團寒假第 2 週起 7 天（2025-12-29～2026-01-04、2027-01-04～10、2028-01-03～09、2029-01-01～07）',R('C18','Y1','2026-07-20','2026-07-28')&&R('C18','Y2','2027-07-19','2027-07-27')&&R('C18','Y3','2028-07-17','2028-07-25')&&R('C18W','Y1','2025-12-29','2026-01-04')&&R('C18W','Y2','2027-01-04','2027-01-10')&&R('C18W','Y3','2028-01-03','2028-01-09')&&R('C18W','Y4','2029-01-01','2029-01-07')); });
  await sec(async()=>{ const W16=safe(()=>VAC.workDays(inst('C16','Y2')))||[], W17=safe(()=>VAC.workDays(inst('C17','Y2')))||[];
    check('1. 上班日（平日白天）：C16 10 天、C17 40 天，都是週一～五；C17 跨過的 8/6（五）上班、8/7、8/8（週末）不上班',W16.length===10&&W17.length===40&&W16.concat(W17).every(d=>[1,2,3,4,5].includes(wdOf(d)))&&W17.includes(D('2027-08-06'))&&!W17.includes(D('2027-08-07'))&&!W17.includes(D('2027-08-08')),W16.length+'／'+W17.length); });

  // ===== 2. C16 公告、報名、沒錄取、錄取（AA_242 9-1、9-2）=====
  await sec(async()=>{ const w9=termDay('Y2S2',9,1), w10=termDay('Y2S2',10,1); fresh(w9,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2);
    check('2. C16 公告不會提早：大二下第 9 週沒有',!txt('g:law_class').some(t=>t.includes('法律扶助基金會')));
    G.day=w10; G.weekday=1; run(11.9,12.2); const T=txt('g:law_class'), m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C16@Y2');
    check('2. 大二下第 10 週週一 12:00 全班群組，系辦「【暑期實習】法律扶助基金會台北分會，暑假兩週（80 小時），名額有限。第 12 週週五前交申請表。」',T.includes('sysoffice:【暑期實習】法律扶助基金會台北分會，暑假兩週（80 小時），名額有限。第 12 週週五前交申請表。')&&!!m&&m.day===w10&&m.h===12,JSON.stringify(T.slice(-2)));
    check('2. 選項「（交申請表）」，期限到第 12 週週五',!!m&&m.ask.opts.length===1&&m.ask.opts[0].t==='（交申請表）'&&m.ask.until===Tm(termDay('Y2S2',12,5),24));
    safe(()=>PHONE.answer(G,'vac_ask_C16@Y2',0)); STORY.phoneRules(GM); const W=workQ('C16@Y2'), pre=OUT.get(G,'vac_C16@Y2_pre0');
    check('2. 交了：報名；隔天 20:00「寫申請表」（宿舍書桌，兩小時）',VAC.state(G,'C16@Y2')==='yes'&&!!pre&&pre.day===w10+1&&pre.h===20&&pre.place==='宿舍書桌');
    check('2. 行事曆：十個上班日（週一～五 9:00 出發、捷運約 20 分鐘），第一天的標題寫「第一天」、週四寫「陪同晤談」',W.length===10&&W[0].day===D('2027-06-21')&&W[0].h===9&&W[0].title==='法扶實習（台北分會）：第一天'&&!!onDay('C16@Y2','2027-06-24')&&onDay('C16@Y2','2027-06-24').title==='法扶實習（台北分會）：陪同晤談'&&onDay('C16@Y2','2027-06-22').title==='法扶實習（台北分會）'&&W[0].travel==='捷運約 20 分鐘',JSON.stringify(W.slice(0,2).map(q=>[q.day,q.h,q.title])));
    const s0=JSON.stringify(G); G.day=termDay('Y2S2',14,1); G.weekday=1; run(11.9,12.2); const R1=tagged('vac_sel_C16@Y2');
    check('2. 沒寫申請表：第 14 週週一 12:00 系辦的信「名額已滿，明年可以再報。」，不用 0-1 的群組那句（阿哲沒有回）；上班日取消',R1.length===1&&R1[0].th==='sys'&&R1[0].name==='系辦（信）'&&R1[0].text==='名額已滿，明年可以再報。'&&!txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長')&&VAC.state(G,'C16@Y2')==='rejected'&&workQ('C16@Y2').every(q=>q.state==='cancelled'),JSON.stringify(R1.map(m=>[m.name,m.text])));
    check('2. 沒錄取：旁白「（沒上。）」',toasts.includes('（沒上。）'));
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=w10+1; G.hour=20; toasts=[]; await VAC.outing(GM,OUT.get(G,'vac_C16@Y2_pre0'));
    check('2. 寫了申請表：記在這一次（C16@Y2）',!!safe(()=>VAC.okI(G,inst('C16','Y2'),'APP'))&&toasts.includes('寫申請表（2 小時）'));
    G.day=termDay('Y2S2',14,1); G.weekday=1; run(11.9,12.2); const R2=tagged('vac_sel_C16@Y2');
    check('2. 錄取：「【通知】恭喜錄取法律扶助基金會台北分會暑期實習。」＋家人群組只換成媽媽一句「兩個禮拜都要穿正式一點嗎」',R2.length===2&&R2[0].th==='sys'&&R2[0].text==='【通知】恭喜錄取法律扶助基金會台北分會暑期實習。'&&R2[1].th==='g:home'&&R2[1].text==='兩個禮拜都要穿正式一點嗎'&&VAC.state(G,'C16@Y2')==='yes',JSON.stringify(R2.map(m=>m.text)));
    check('2. 大一不能報：大一下第 10 週沒有 C16 的公告',(()=>{ const s=JSON.stringify(G); fresh(termDay('Y1S2',10,1),11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2); const ok=!txt('g:law_class').some(t=>t.includes('法律扶助基金會')); G=JSON.parse(s); SOCIAL.bind(G); return ok; })()); });

  // ===== 3. C16 四場（AA_242 9-3～9-6）、平日白天、快轉、旗標 =====
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); const q0=onDay('C16@Y2','2027-06-21');
    check('3. 快轉：第一次參加、有關鍵事件的上班日要停（repSkip null）；沒有的平日不停（\'\'）',!!q0&&safe(()=>VAC.repSkip(G,q0))===null&&safe(()=>VAC.repSkip(G,onDay('C16@Y2','2027-06-22')))==='');
    G.day=D('2027-06-21'); G.weekday=1; G.hour=9; said=[]; opts=[]; picks=[1]; await VAC.outing(GM,q0); let L=lines();
    check('3. 第一天：「（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）」韓律師「先簽這個。保密約定。」「在這裡聽到的事，就留在這裡。」',L[0]==='（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）'&&L[1]==='韓律師：先簽這個。保密約定。'&&L[2]==='韓律師：在這裡聽到的事，就留在這裡。',JSON.stringify(L));
    check('3. 選項「好。」「連家人也不能講？」→「不能。你可以跟他們說，今天很累。」',JSON.stringify(opts[0])===JSON.stringify(['「好。」','「連家人也不能講？」'])&&L.includes('韓律師：不能。你可以跟他們說，今天很累。'));
    check('3. 平日白天：演完過到 18:00 下班（同一天），晚上照常',G.day===D('2027-06-21')&&G.hour===18&&VAC.rec(G).work&&(VAC.rec(G).work['C16@Y2']||[]).length===1);
    check('3. 大二暑假那一版沒有語彤',!L.some(t=>t.includes('你認識的名字')||t.includes('語彤')));
    G.day=D('2027-06-22'); G.weekday=2; G.hour=9; said=[]; await VAC.outing(GM,onDay('C16@Y2','2027-06-22'));
    check('3. 沒有關鍵事件的平日：不演、不寫字，過到 18:00',said.length===0&&G.hour===18);
    VAC.repDone(G,onDay('C16@Y2','2027-06-23'));
    G.day=D('2027-06-24'); G.weekday=4; G.hour=9; said=[]; opts=[]; cards=[]; await VAC.outing(GM,onDay('C16@Y2','2027-06-24')); L=lines();
    check('3. 陪同晤談（第一週週四 14:00）：收據、「韓律師：他是實習生，在做筆記。妳慢慢講。」「韓律師：日期寫得很好。她講到一半停下來的時候，你不用抬頭。」，沒有選項',L[0]==='（會議室很小。當事人是一位中年的女士，手上一直捏著一張收據。）'&&L.includes('韓律師：他是實習生，在做筆記。妳慢慢講。')&&L.includes('（你把她說的每一個日期都寫下來。走出會議室，筆記寫了四頁。）')&&L[L.length-1]==='韓律師：日期寫得很好。她講到一半停下來的時候，你不用抬頭。'&&!opts.length&&cards.some(c=>c[0].startsWith('6/24')&&c[1]==='法律扶助基金會台北分會'),JSON.stringify(L));
    for(const k of ['2027-06-25','2027-06-28']) VAC.repDone(G,onDay('C16@Y2',k));
    G.day=D('2027-06-29'); G.weekday=2; G.hour=9; said=[]; await VAC.outing(GM,onDay('C16@Y2','2027-06-29')); L=lines();
    check('3. 整理卷宗（第二週）：影印機卡紙、實習生「這台每年都這樣吧。」、便利貼「OK」',L[0]==='（影印機第三次卡紙。同期的實習生把手伸進去，拉出一張皺掉的紙。）'&&L.includes('實習生：這台每年都這樣吧。')&&L[L.length-1]==='（隔天早上，那疊最上面貼了一張便利貼：「OK」。）',JSON.stringify(L));
    for(const k of ['2027-06-30','2027-07-01']) VAC.repDone(G,onDay('C16@Y2',k));
    const a0=safe(()=>STORY.careerLean(G).A); G.day=D('2027-07-02'); G.weekday=5; G.hour=9; said=[]; opts=[]; picks=[0]; await VAC.outing(GM,onDay('C16@Y2','2027-07-02')); L=lines();
    check('3. 最後一天：「韓律師：兩個禮拜，你最常看到的是什麼？」→「收據。」「對。大家都把收據留得很好。……常常留錯張。」→ 鉛筆補的字',L[0]==='韓律師：兩個禮拜，你最常看到的是什麼？'&&JSON.stringify(opts[0])===JSON.stringify(['「收據。」','「不太確定。」'])&&L.includes('韓律師：對。大家都把收據留得很好。……常常留錯張。')&&L[L.length-1]==='（她把你的筆記還給你，旁邊有幾行她用鉛筆補的字。）',JSON.stringify(L));
    check('3. 旗標 INTERN_LEGALAID、參加過（十天都算）；職涯傾向 A＋5（BB_202，只記錄）',G.flags.INTERN_LEGALAID===true&&VAC.state(G,'C16@Y2')==='done'&&(VAC.rec(G).work['C16@Y2']||[]).length===10&&safe(()=>STORY.careerLean(G).A)===a0+5,JSON.stringify([VAC.rec(G).work,a0,safe(()=>STORY.careerLean(G).A)])); });

  // ===== 4. 語彤也報了的那一版（AA_242 9-3、9-6；她那年報了才有：LAWWW 暫排大三暑假）=====
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; meet('heroine_03'); reg('C16@Y3');
    G.day=D('2028-06-19'); G.weekday=1; G.hour=9; said=[]; picks=[0]; await VAC.outing(GM,onDay('C16@Y3','2028-06-19')); let L=lines();
    check('4. 大三暑假、認識語彤：第一天「（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）」語彤「……你也來了。」',L.includes('（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）')&&L.some(t=>/語彤：……你也來了。$/.test(t))&&L.includes('韓律師：卷宗在那邊，從最上面那疊開始。'),JSON.stringify(L.slice(-3)));
    G.day=D('2028-06-30'); G.weekday=5; G.hour=9; said=[]; picks=[1]; await VAC.outing(GM,onDay('C16@Y3','2028-06-30')); L=lines();
    check('4. 最後一天：「不太確定。」→「那就明年再來看一次。」；語彤也在的「（走出大樓，語彤停下來。）」「我明年還要來。」',L.includes('韓律師：那就明年再來看一次。')&&L.includes('（走出大樓，語彤停下來。）')&&L.some(t=>/語彤：我明年還要來。$/.test(t))&&L.indexOf('（她把你的筆記還給你，旁邊有幾行她用鉛筆補的字。）')<L.indexOf('（走出大樓，語彤停下來。）'),JSON.stringify(L));
    fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; reg('C16@Y3'); G.day=D('2028-06-19'); G.hour=9; said=[]; await VAC.outing(GM,onDay('C16@Y3','2028-06-19'));
    check('4. 不認識語彤：沒有她那兩句（「你認識的名字」不成立）',said.length>0&&!lines().some(t=>t.includes('你認識的名字')||/語彤/.test(t))); });

  // ===== 5. C17：門檻（英文檢定）、面試、沒錄取、錄取（AA_242 10-1、10-2）=====
  await sec(async()=>{ const w4=termDay('Y2S2',4,1); fresh(w4,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2); const T=txt('g:law_class');
    check('5. C17：大二下第 4 週週一 12:00 系辦「【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。」',T.includes('sysoffice:【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。'),JSON.stringify(T.slice(-2)));
    check('5. 沒有托福、多益的成績：公告後一句旁白「（你翻了一下，你還沒有英文檢定的成績。）」、沒有報名的選項',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='（你翻了一下，你還沒有英文檢定的成績。）'&&m.day===w4)&&!(G.msgs||[]).some(m=>m.ask&&m.ask.id==='vac_ask_C17@Y2'));
    const H=VAC.html(G); check('5. 行事曆：這一列寫那句旁白、沒有報名鈕；直接報名也不成',H.includes('律所暑期實習（青嶺）')&&H.includes('你還沒有英文檢定的成績')&&!H.includes('data-vac="C17@Y2"')&&VAC.signup(G,'C17@Y2','yes')===false&&VAC.state(G,'C17@Y2')===null);
    fresh(w4,11.9,'dorm',{}); G.stage='law'; LAWC(); VAC.rec(G).score={'C04@Y1':{test:'toefl',n:84,day:D('2026-09-01')}}; run(11.9,12.2); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C17@Y2');
    check('5. 考過托福（C04 成績出來了）：選項「（交履歷）」、沒有那句旁白；行事曆有報名鈕',!!m&&m.ask.opts[0].t==='（交履歷）'&&!(G.msgs||[]).some(x=>x.text==='（你翻了一下，你還沒有英文檢定的成績。）')&&VAC.html(G).includes('data-vac="C17@Y2"'));
    PHONE.answer(G,'vac_ask_C17@Y2',0); STORY.phoneRules(GM); const iv=OUT.get(G,'vac_C17@Y2_pre0');
    check('5. 交了履歷：第 12 週週三 19:00 面試，在青嶺法律事務所（捷運約 30 分鐘）；40 個上班日排好',VAC.state(G,'C17@Y2')==='yes'&&!!iv&&iv.day===termDay('Y2S2',12,3)&&iv.h===19&&iv.place==='青嶺法律事務所'&&iv.travel==='捷運約 30 分鐘'&&workQ('C17@Y2').length===40);
    const s0=JSON.stringify(G); G.day=termDay('Y2S2',14,1); G.weekday=1; run(11.9,12.2); const R1=tagged('vac_sel_C17@Y2');
    check('5. 沒去面試：第 14 週週一 12:00 事務所的信「謝謝您的申請」（9-2 的 email 寫法，沒有群組那句）',R1.length===1&&R1[0].th==='sys'&&R1[0].name==='青嶺法律事務所（信）'&&R1[0].text==='謝謝您的申請'&&!txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長')&&VAC.state(G,'C17@Y2')==='rejected',JSON.stringify(R1.map(m=>[m.name,m.text])));
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=iv.day; G.hour=19; said=[]; opts=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C17@Y2_pre0')); const L=lines();
    check('5. 面試：「（會議室的窗戶看得到整條忠孝東路。對面坐著兩位律師。）」「律師：你為什麼想來事務所？」→「想知道自己適不適合。」「這個很誠實。……我們也想知道。」',L[0]==='（會議室的窗戶看得到整條忠孝東路。對面坐著兩位律師。）'&&L[1]==='律師：你為什麼想來事務所？'&&JSON.stringify(opts[0])===JSON.stringify(['「想看真的案子怎麼做。」','「想知道自己適不適合。」'])&&L[2]==='律師：這個很誠實。……我們也想知道。'&&!!safe(()=>VAC.okI(G,inst('C17','Y2'),'INT')),JSON.stringify(L));
    G.day=termDay('Y2S2',14,1); G.weekday=1; run(11.9,12.2); const R2=tagged('vac_sel_C17@Y2');
    check('5. 錄取：「【通知】恭喜錄取青嶺法律事務所暑期實習。」＋媽媽「有錢可以領喔？」',R2.length===2&&R2[0].text==='【通知】恭喜錄取青嶺法律事務所暑期實習。'&&R2[1].th==='g:home'&&R2[1].text==='有錢可以領喔？',JSON.stringify(R2.map(m=>m.text)));
    check('5. 面試是這一次的：大三再報，大二去過的面試不算數',!safe(()=>VAC.okI(G,inst('C17','Y3'),'INT'))); });
  await sec(async()=>{ const w4=termDay('Y3S2',4,1); fresh(w4,11.9,'dorm',{EXCHANGE_ROUTE:'TW'}); G.stage='law'; LAWC(); run(11.9,12.2);
    check('5. 大三（第二年起，行事曆報名）：同一則公告；沒有英文檢定成績＝一樣多那句旁白、行事曆沒有報名鈕',txt('g:law_class').filter(t=>t.includes('【暑期實習】青嶺法律事務所')).length===1&&(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='（你翻了一下，你還沒有英文檢定的成績。）')&&!VAC.html(G).includes('data-vac="C17@Y3"'));
    fresh(w4,11.9,'dorm',{EXCHANGE_ROUTE:'TW'}); G.stage='law'; LAWC(); VAC.rec(G).score={'C04W@Y3':{test:'toeic',n:720,day:D('2028-01-26')}}; run(11.9,12.2);
    check('5. 大三、考過多益：公告沒有那句旁白、行事曆有報名鈕',!(G.msgs||[]).some(m=>m.text==='（你翻了一下，你還沒有英文檢定的成績。）')&&VAC.html(G).includes('data-vac="C17@Y3"')); });

  // ===== 6. C17 四場（AA_242 10-3～10-6）、跨過 8/6～8/8、實習津貼、可昕的視訊 =====
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{dating_kexin:true}); G.stage='law'; VAC.rec(G).score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y2'); const W=workQ('C17@Y2');
    check('6. 40 個上班日；8/6（五）有、8/7、8/8 沒有（沛珊放榜、可昕 KH、七夕是晚上或週末，照演）',W.length===40&&!!onDay('C17@Y2','2027-08-06')&&!onDay('C17@Y2','2027-08-07')&&!onDay('C17@Y2','2027-08-08'));
    G.day=D('2027-06-21'); G.weekday=1; G.hour=9; said=[]; await VAC.outing(GM,W[0]); let L=lines();
    check('6. 第一天：門禁卡、研究備忘錄週五交；馮律師「題目不難，你先查。」「查不到的地方寫「查不到」，不要猜。」',L[0]==='（一張門禁卡、一個靠走道的位子、一台筆電，還有一份資料夾：研究備忘錄，週五交。）'&&L[1]==='馮律師：題目不難，你先查。'&&L[2]==='馮律師：查不到的地方寫「查不到」，不要猜。'&&G.hour===18,JSON.stringify(L));
    G.day=D('2027-06-25'); G.weekday=5; G.hour=9; said=[]; opts=[]; picks=[1]; await VAC.outing(GM,onDay('C17@Y2','2027-06-25')); L=lines();
    check('6. 第一次被改（第一週週五）：紅字比黑字多、「結論放第一段。」→「每一頁都要改嗎？」「第三頁不用。第三頁是對的。」',L[0]==='（備忘錄發回來，紅字比黑字多。第一頁最上面寫著：「結論放第一段。」）'&&JSON.stringify(opts[0])===JSON.stringify(['「好，我重寫。」','「每一頁都要改嗎？」'])&&L.includes('馮律師：第三頁不用。第三頁是對的。'),JSON.stringify(L));
    G.day=D('2027-07-14'); G.weekday=3; G.hour=9; said=[]; cards=[]; picks=[0]; await VAC.outing(GM,onDay('C17@Y2','2027-07-14')); L=lines();
    check('6. 跟開庭（第四週）：旁聽席第二排、電梯裡「剛剛法官問到一半，停了五秒。你有注意到嗎？」→「有。你那時候沒講話。」「對。那五秒不要講話。」；日期卡寫法院',L[0]==='（旁聽席第二排。馮律師在前面講話，比在辦公室慢很多。）'&&L.includes('（散庭以後，電梯裡。）')&&L.includes('馮律師：剛剛法官問到一半，停了五秒。你有注意到嗎？')&&L.includes('馮律師：對。那五秒不要講話。')&&cards.some(c=>c[0].startsWith('7/14')&&c[1]==='法院（旁聽席）'),JSON.stringify([L,cards]));
    for(const q of workQ('C17@Y2')) if(q.state==='planned'&&q.day<D('2027-08-13')) VAC.repDone(G,q);   // 其他上班日：快轉記成去過
    G.day=D('2027-08-13'); G.weekday=5; G.hour=9; said=[]; await VAC.outing(GM,onDay('C17@Y2','2027-08-13')); L=lines();
    check('6. 最後一天：「馮律師：後來那幾份備忘錄，結論都放第一段了。」「馮律師：明年想再來，直接寄信給我。」；INTERN_FIRM、參加過',JSON.stringify(L)===JSON.stringify(['馮律師：後來那幾份備忘錄，結論都放第一段了。','馮律師：明年想再來，直接寄信給我。'])&&G.flags.INTERN_FIRM===true&&VAC.state(G,'C17@Y2')==='done',JSON.stringify(L));
    const kq=OUT.get(G,'vac_C17@Y2_kx'); check('6. 交往中的可昕（大二暑假）：最後一天 22:00 視訊排好',!!kq&&kq.day===D('2027-08-13')&&kq.h===22&&kq.verb==='接起來');
    G.hour=18.4; const m0=G.money; toasts=[]; run(18.5,18.6); const pay=G.money-m0;
    check('6. 實習津貼記進生活費：8 週結束那天 18:00 以後一次入帳＝196 元 × 8 小時 × 40 天＝62,720 元（只入一次）',pay===62720&&(VAC.rec(G).paid||{})['C17@Y2']===62720&&toasts.some(t=>t.includes('62720')),String(pay));
    run(18.6,18.8); check('6. 只入一次',G.money-m0===62720);
    G.hour=22; said=[]; opts=[]; picks=[1]; await VAC.outing(GM,kq); L=lines();
    check('6. 可昕的視訊：「你們那邊也是週五交東西喔？」「我們律師一直說，結論放第一段。」→「妳寫幾份了？」「六份。你呢？……不要說比我多。」',L.some(t=>/：你們那邊也是週五交東西喔？$/.test(t))&&L.some(t=>/：我們律師一直說，結論放第一段。$/.test(t))&&JSON.stringify(opts[0])===JSON.stringify(['「我們律師也這樣講。」','「妳寫幾份了？」'])&&L.some(t=>/：六份。你呢？……不要說比我多。$/.test(t)),JSON.stringify(L)); });
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; VAC.rec(G).score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y2'); for(const q of workQ('C17@Y2')) VAC.repDone(G,q);
    check('6. 沒有交往：最後一天以後沒有可昕的視訊',!OUT.get(G,'vac_C17@Y2_kx'));
    G.day=D('2027-08-13'); const m0=G.money; run(18.5,18.6); check('6. 快轉跳過的上班日也算天數（40 天都算）',G.money-m0===62720,String(G.money-m0)); });
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; VAC.rec(G).score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y2'); for(const q of workQ('C17@Y2').slice(0,10)) VAC.repDone(G,q);
    G.day=D('2027-08-13'); const m0=G.money; run(18.5,18.6); check('6. 只去了十天：津貼照天數＝15,680 元',G.money-m0===15680,String(G.money-m0)); });

  // ===== 7. 交換重疊不能報（AA_199 7-7）：日本路線大三暑假 8/5 才回台、美國路線排不下 C17；美國路線大四上的寒假團面試 =====
  await sec(async()=>{ fresh(D('2028-03-01'),10,'dorm',{EXCHANGE_ROUTE:'JP'}); G.stage='law'; const B=(id,yk)=>!!safe(()=>VAC.blocked(G,inst(id,yk)));
    check('7. 日本路線（大三下 2/20～8/5 在日本）：大三暑假 C16、C17 撞日子不能報；暑假團 C18（7/17～25）也不能',B('C16','Y3')&&B('C17','Y3')&&B('C18','Y3')&&!!inst('C16','Y3'));
    G.flags.EXCHANGE_ROUTE='US'; check('7. 美國路線（7/25 退宿、8/2 出發）：大三暑假 C17（到 8/11）排不下＝不能報；C16（6/19～6/30）可以',B('C17','Y3')&&!B('C16','Y3')&&!!inst('C17','Y3'));
    check('7. 美國路線大四上人在美國（8/2～12/23）：寒假團 C18W 大四（面試在大四上第 10 週）不能報',B('C18W','Y4')&&!!inst('C18W','Y4'));
    G.flags.EXCHANGE_ROUTE='JP'; check('7. 日本路線大四上已經回台：寒假團大四可以',!B('C18W','Y4')&&!!inst('C18W','Y4'));
    G.flags.EXCHANGE_ROUTE='TW'; check('7. 台灣路線：大三暑假 C16、C17 都可以',!B('C16','Y3')&&!B('C17','Y3')&&!!inst('C16','Y3'));
    fresh(termDay('Y3S2',10,1),11.9,'dorm',{EXCHANGE_ROUTE:'JP'}); G.stage='law'; LAWC(); run(11.9,12.2);
    check('7. 日本路線大三下第 10 週：收不到 C16 的公告、行事曆也沒有',!!inst('C16','Y3')&&!txt('g:law_class').some(t=>t.includes('法律扶助基金會'))&&!VAC.html(G).includes('C16@Y3')); });

  // ===== 8. C18 暑假團（AA_242 11-1～11-6、0-1～0-3）=====
  await sec(async()=>{ const w6=termDay('Y1S2',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2); const T=txt('g:law_class'), m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C18@Y1');
    check('8. 大一下第 6 週週一 12:00 系辦「【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。」、選項「（報名）」到第 10 週週五',T.includes('sysoffice:【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。')&&!!m&&m.ask.opts[0].t==='（報名）'&&m.ask.until===Tm(termDay('Y1S2',10,5),24),JSON.stringify(T.slice(-2)));
    check('8. 行事曆：家裡出・獎學金補一部分',VAC.html(G).includes('海外見習團（新加坡）・暑假團')&&VAC.html(G).includes('・家裡出・獎學金補一部分'));
    PHONE.answer(G,'vac_ask_C18@Y1',0); STORY.phoneRules(GM); const iv=OUT.get(G,'vac_C18@Y1_pre0'), tq=OUT.get(G,'vac_C18@Y1');
    check('8. 報名：第 11 週週三 19:00 面試；7/20 08:00 出發（去機場）',VAC.state(G,'C18@Y1')==='yes'&&!!iv&&iv.day===termDay('Y1S2',11,3)&&iv.h===19&&!!tq&&tq.day===D('2026-07-20')&&tq.h===8);
    const s0=JSON.stringify(G); G.day=termDay('Y1S2',13,1); G.weekday=1; toasts=[]; run(11.9,12.2); const R1=tagged('vac_sel_C18@Y1');
    check('8. 沒去面試：第 13 週週一 12:00「【通知】很遺憾，本次未能錄取。」＋阿哲「沒差啦 暑假還很長」＋（沒上。）；出發取消',R1.some(x=>x.th==='sys'&&x.text==='【通知】很遺憾，本次未能錄取。')&&R1.some(x=>x.th==='g:noodle_team'&&x.text==='沒差啦 暑假還很長')&&toasts.includes('（沒上。）')&&VAC.state(G,'C18@Y1')==='rejected'&&OUT.get(G,'vac_C18@Y1').state==='cancelled',JSON.stringify(R1.map(x=>x.text)));
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=iv.day; G.hour=19; said=[]; opts=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1_pre0')); let L=lines();
    check('8. 面試：帶隊老師「英文不用很好。去了敢問就好。」「你會問嗎？」→「會。」「好。到時候我會看。」',JSON.stringify(L)===JSON.stringify(['帶隊老師：英文不用很好。去了敢問就好。','帶隊老師：你會問嗎？','帶隊老師：好。到時候我會看。'])&&JSON.stringify(opts[0])===JSON.stringify(['「會。」','「我會試試看。」']),JSON.stringify(L));
    G.day=termDay('Y1S2',13,1); G.weekday=1; run(11.9,12.2); const R2=tagged('vac_sel_C18@Y1');
    check('8. 錄取：「【通知】恭喜錄取法律與社會海外見習團（新加坡）。行前說明會：6/3（三）12:20。」＋媽媽「機票多少？我轉給你」「護照記得看效期」',R2.length===3&&R2[0].text==='【通知】恭喜錄取法律與社會海外見習團（新加坡）。行前說明會：6/3（三）12:20。'&&R2[1].text==='機票多少？我轉給你'&&R2[2].text==='護照記得看效期',JSON.stringify(R2.map(x=>x.text)));
    G.day=D('2026-07-20'); G.weekday=1; G.hour=7.9; run(7.9,8.1);
    check('8. 出發那天麵店團（0-2）：阿哲「新加坡很熱喔」、小語「聽說口香糖不能帶」',txt('g:noodle_team').includes('zhe:新加坡很熱喔')&&txt('g:noodle_team').includes('yu:聽說口香糖不能帶'));
    said=[]; opts=[]; cards=[]; picks=[0,1,0]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); L=lines();
    check('8. 參訪法院（第二天）：「（法庭比你想的小。…）」「（團長姚思穎在你旁邊小聲翻了兩句，後來也跟不上了。）」思穎「……我只聽懂 adjourned。」→「休庭。」「對，休庭。我就聽懂這個。」',L[0]==='（法庭比你想的小。法官、律師都講英文，講得很快。）'&&L[1]==='（團長姚思穎在你旁邊小聲翻了兩句，後來也跟不上了。）'&&L[2]==='思穎：……我只聽懂 adjourned。'&&L[3]==='思穎：對，休庭。我就聽懂這個。'&&cards.some(c=>c[0].startsWith('7/21')&&c[1]==='新加坡'),JSON.stringify(L));
    check('8. 座談（第四天）：「（當地法律系的學生問你們：上課要不要點名？）」→「看老師。」當地學生「我們也是。」',L.includes('（當地法律系的學生問你們：上課要不要點名？）')&&L.includes('當地學生：我們也是。')&&cards.some(c=>c[0].startsWith('7/23')));
    check('8. 最後一晚：小吃中心、思穎「回去以後，報告誰寫？」→「我寫法院那一段。」「好。那我寫吃的。」；STUDYTOUR_SG',L.includes('（旅館樓下的小吃中心，桌上一堆盤子。）')&&L.includes('思穎：回去以後，報告誰寫？')&&L[L.length-1]==='思穎：好。那我寫吃的。'&&G.flags.STUDYTOUR_SG===true&&cards.some(c=>c[0].startsWith('7/27')));
    check('8. 9 天：7/28 18:00 回來、參加過；回來記 BACK_FROM_C18',G.day===D('2026-07-28')&&G.hour===18&&VAC.state(G,'C18@Y1')==='done'&&G.flags.BACK_FROM_C18===D('2026-07-28'));
    run(18,20.2); check('8. 回來（0-3）：阿哲「伴手禮咧」',txt('g:noodle_team').includes('zhe:伴手禮咧')); });
  await sec(async()=>{ fresh(D('2026-07-20'),8,'dorm',{dating_heroine_01:true}); G.stage='law'; meet('heroine_01'); reg('C18@Y1'); said=[]; picks=[1,0,1]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); PHONE.tick(G); const L=lines();
    check('8. 「我也是。」→ 長椅上對單字；「要，而且要坐前面。」→ 對面三個人一起笑了；「抽籤。」→（抽到你。）',L.includes('（出來以後，兩個人坐在法院外面的長椅上，把剛剛記下來的單字對了一遍。）')&&L.includes('（對面三個人一起笑了。）')&&L[L.length-1]==='（抽到你。）',JSON.stringify(L));
    const A1=(G.msgs||[]).filter(m=>m.th==='p:heroine_01'); check('8. 出國期間的訊息照第 8 節（交往中的以安：出發那天、輪播、回來那天）',A1.some(m=>m.text==='到了傳一張照片。一張就好。')&&A1.some(m=>m.text==='明天見。……我是說，明天有空的話。'),JSON.stringify(A1.map(m=>m.text).slice(0,3)));
    G.day=D('2026-07-30'); G.zone='campus'; meet('yu'); Object.assign(SOCIAL.rel('yu'),{fam:30,trust:10,comf:5}); said=[]; const g=await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu');
    check('8. 回來後第一次在 3D 遇到小語：「你回來了！伴手禮咧！」',g===true&&lines().join('|')==='小語：你回來了！伴手禮咧！'); });

  // ===== 9. C18W 寒假團 =====
  await sec(async()=>{ const w6=termDay('Y1S1',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C18W@Y1');
    check('9. 寒假團：大一上第 6 週週一 12:00 同一則公告、選項「（報名）」到第 9 週週五',txt('g:law_class').includes('sysoffice:【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。')&&!!m&&m.ask.until===Tm(termDay('Y1S1',9,5),24)); });
  await sec(async()=>{ const w6=termDay('Y2S1',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2);
    check('9. 大二上（第二年起）：同一則公告、行事曆報名（AA_264 第 3 節）',txt('g:law_class').filter(t=>t.includes('【見習團】')).length===1&&VAC.html(G).includes('data-vac="C18W@Y2"'));
    VAC.signup(G,'C18W@Y2','yes'); const iv=OUT.get(G,'vac_C18W@Y2_pre0');   // 行事曆報名（沒去面試＝下面測沒錄取） check('9. 面試：大二上第 10 週週三 19:00；出發 2027-01-04 08:00',!!iv&&iv.day===termDay('Y2S1',10,3)&&iv.h===19&&OUT.get(G,'vac_C18W@Y2').day===D('2027-01-04'));
    G.day=termDay('Y2S1',12,1); G.weekday=1; run(11.9,12.2); const R=tagged('vac_sel_C18W@Y2');
    check('9. 寒假團沒錄取：「【通知】很遺憾，本次未能錄取。」，不傳「沒差啦 暑假還很長」（季節不對）',R.length===1&&R[0].text==='【通知】很遺憾，本次未能錄取。'&&!txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長'),JSON.stringify(R.map(x=>x.text))); });
  await sec(async()=>{ fresh(D('2027-01-04'),8,'dorm',{}); G.stage='law'; reg('C18W@Y2'); said=[]; cards=[]; await VAC.outing(GM,OUT.get(G,'vac_C18W@Y2'));
    check('9. 寒假團 7 天：1/5 法院、1/7 座談、1/9 最後一晚；1/10 18:00 回來、BACK_FROM_C18W',cards.some(c=>c[0].startsWith('1/5'))&&cards.some(c=>c[0].startsWith('1/7'))&&cards.some(c=>c[0].startsWith('1/9'))&&G.day===D('2027-01-10')&&G.hour===18&&G.flags.STUDYTOUR_SG===true&&G.flags.BACK_FROM_C18W===D('2027-01-10'));
    G.day=D('2027-01-12'); meet('yu'); Object.assign(SOCIAL.rel('yu'),{fam:30,trust:10,comf:5}); said=[]; const g=await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu');
    check('9. 寒假團回來也有 3D 的招呼（BACK_FROM_C18W）',g===true&&lines().join('|')==='小語：你回來了！伴手禮咧！'); });

  // ===== 10. 第二次參加（AA_264 第 0 節第 1 點：不重演；第二次的日誌句還沒有）=====
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; meet('heroine_03'); VAC.rec(G).reg['C16@Y2']='done'; reg('C16@Y3'); const q=onDay('C16@Y3','2028-06-19');
    check('10. C16 第二次：nth＝2、標題不寫「第一天」、快轉不停（\'\'）',VAC.nth(G,inst('C16','Y3'))===2&&!!q&&q.title==='法扶實習（台北分會）'&&safe(()=>VAC.repSkip(G,q))==='');
    G.day=D('2028-06-19'); G.hour=9; said=[]; await VAC.outing(GM,q); check('10. 第二次的第一天：不演（連語彤那版也不演）、過到 18:00',said.length===0&&G.hour===18);
    fresh(D('2027-07-19'),8,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C18@Y1']='done'; reg('C18@Y2'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y2'));
    check('10. C18 第二次：三場不重演、照樣 7/27 回來',said.length===0&&G.day===D('2027-07-27')&&VAC.state(G,'C18@Y2')==='done'); });

  // ===== 11. 行事曆（平日白天、會撞到、費用）=====
  await sec(async()=>{ const w10=termDay('Y2S2',10,1); fresh(w10,12.5,'dorm',{}); G.stage='law'; VAC.rec(G).score={'C04@Y1':{test:'toefl',n:84,day:D('2026-09-01')}}; VAC.rec(G).reg['C04@Y2']='yes'; reg('C17@Y2');
    const H=VAC.html(G), c=safe(()=>VAC.conflicts(G,inst('C16','Y2')))||[];
    check('11. C16 的列：「（每週一、二、三、四、五）」「沒有薪水」；C17 的列「有實習津貼」',H.includes('（每週一、二、三、四、五）')&&H.includes('・沒有薪水')&&H.includes('・有實習津貼'));
    check('11. 會撞到：報了 C17（平日白天）＝C16 十天都撞；晚上的補習（C04）不撞',c.length===10&&c.every(x=>x.key==='C17@Y2'),JSON.stringify(c.map(x=>x.key)));
    const c2=safe(()=>VAC.conflicts(G,inst('C18','Y2')))||[]; check('11. 出國（C18 暑假團 7/19～27）撞到 C17 的平日（7/19～23、7/26、7/27）',c2.filter(x=>x.key==='C17@Y2').length===7,String(c2.length)); });

  // ===== 12. 快轉（home3d.js）：沒有關鍵事件的上班日不停、記成去過 =====
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); G.day=D('2027-06-22'); G.weekday=2; G.hour=7;
    VAC.repDone(G,onDay('C16@Y2','2027-06-21')); const nx=HOME.breakNext(G);
    check('12. 快轉的下一站：6/22、6/23 不停，停在 6/24 陪同晤談出發前',nx!=null&&Math.floor(nx/24)===D('2027-06-24'),nx!=null?CALENDAR.dateOf(Math.floor(nx/24)).key+' '+(nx%24).toFixed(2):'null');
    let ok=true; try{ await HOME.breakJump(GM,Tm(D('2027-06-24'),7),{}); }catch(e){ ok=false; console.log(e); }
    check('12. 快轉跳過 6/22、6/23：記成去過（上班 3 天），沒有旁白',ok&&onDay('C16@Y2','2027-06-22').state==='done'&&onDay('C16@Y2','2027-06-23').state==='done'&&(VAC.rec(G).work['C16@Y2']||[]).length===3&&!G.flags._repSkipLine&&onDay('C16@Y2','2027-06-24').state==='planned',JSON.stringify(VAC.rec(G).work)); });

  // ===== 14. 真的走出遊的流程（OUT.tick 的出發提示 → OUT.go → ev_vac_key → VAC.outing），不是直接叫 VAC.outing =====
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); G.day=D('2027-06-21'); G.weekday=1; G.hour=8.45; said=[]; opts=[]; picks=[0,0]; cards=[];
    const r=await OUT.tick(GM), q=onDay('C16@Y2','2027-06-21');
    check('14. 6/21 早上的出發提示「出發：法扶實習（台北分會）：第一天」→ 出發 → 第一天演完；18:00 下班＋0.5 小時回來、這一趟記成 done',r==='go'&&!!opts[0]&&opts[0][0]==='出發：法扶實習（台北分會）：第一天'&&lines().includes('韓律師：先簽這個。保密約定。')&&q.state==='done'&&G.day===D('2027-06-21')&&Math.abs(G.hour-18.5)<1e-6,JSON.stringify([r,opts[0],G.hour]));
    G.day=D('2027-06-22'); G.weekday=2; G.hour=8.45; said=[]; opts=[]; picks=[0]; const r2=await OUT.tick(GM), q2=onDay('C16@Y2','2027-06-22');
    check('14. 6/22（沒有關鍵事件）：出發提示「出發：法扶實習（台北分會）」→ 沒有台詞、18:30 回來',r2==='go'&&opts[0][0]==='出發：法扶實習（台北分會）'&&said.length===0&&q2.state==='done'&&Math.abs(G.hour-18.5)<1e-6&&(VAC.rec(G).work['C16@Y2']||[]).length===2,JSON.stringify([r2,opts[0],G.hour]));
    G.day=D('2027-06-23'); G.weekday=3; G.hour=8.45; opts=[]; picks=[2]; const r3=await OUT.tick(GM), q3=onDay('C16@Y2','2027-06-23');
    check('14. 「不去了」：這一天沒去（missed），報名照舊',r3==='no'&&q3.state==='missed'&&VAC.state(G,'C16@Y2')==='yes'&&(VAC.rec(G).work['C16@Y2']||[]).length===2); });

  // ===== 13. 舊存檔 =====
  await sec(async()=>{ fresh(termDay('Y2S2',14,1),11.9,'dorm',{}); G.stage='law'; LAWC(); G.vac={reg:{'C08@Y1':'done','C04@Y1':'done'},seen:{C08:true},log:[]}; let ok=true;
    try{ run(11.9,12.2); VAC.html(G); const s=JSON.stringify(G); G=JSON.parse(s); SOCIAL.bind(G); STORY.phoneRules(GM); }catch(e){ ok=false; console.log(e); }
    check('13. 舊存檔（G.vac 沒有 ok、work、paid）：手機、行事曆照常、不報錯；新欄位用到才建',ok&&!G.vac.ok&&!G.vac.paid&&!G.vac.work);
    VAC.rec(G).reg['C16@Y2']='yes'; const s=JSON.stringify(G); G=JSON.parse(s); SOCIAL.bind(G); check('13. 存讀檔：報名狀態留著',VAC.state(G,'C16@Y2')==='yes'); });
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
