// 寒暑假第二批：C16 法扶實習、C17 律所暑期實習、C18／C18W 海外見習團（AA_199 7-7 7915ac9d；台詞 AA_242 第 9～11 節 ede67b34；任務 VAC-C16-C18-1021）——不需要瀏覽器。
// 用法：node tests/vac_c16_c18_unit.js（VAC_TEST_ROOT＝別的目錄：拿那裡的 src 跑，驗證改之前的程式會失敗）
// 修改前：沒有 C16／C17／C18／C18W 的卡、沒有上班日、沒有門檻（幾乎全部失敗）
// AA_242 第 12 節（AA-C 2026-10-21 56a36a4d；任務 AA-VAC-C16-C18-Q-1021）加的（第 1、3、9、10、12、14 項跟著改，第 15～20 項新加；修改前都 FAIL，見各段）：
//   15 七項裁定（語彤那一版大三＋第二次「……你又來了。」、C18W 大一寒假不開、C16 上學期被當＝沒錄取、C17 第二次「寄信給馮律師」免面試、C16 午餐每天 −100）
//   16 沒有關鍵事件的上班日的日誌（C16 六句、C17 十二句）；17 第二次以後的日誌（C16、C17、C18 第二次、C18 第三次）；18 阿哲寒假版（C18W、C11）；19 C18 行前說明會；20 思穎回國後的訊息
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
  check('1. C18 暑假團大一～大三（大四下以後沒有）、寒假團 C18W 大二～大四（AA_242 12-1 第 2 點：大一寒假不開）',['Y1','Y2','Y3'].every(y=>!!inst('C18',y))&&!inst('C18','Y4')&&!inst('C18W','Y1')&&['Y2','Y3','Y4'].every(y=>!!inst('C18W',y)));
  await sec(async()=>{ const R=(id,yk,a,b)=>{ const I=inst(id,yk); return !!I&&I.from===D(a)&&I.to===D(b); };
    check('1. 日子：C16 暑假第 2 週起兩週（2027-06-21～07-02、2028-06-19～06-30）；C17 暑假第 2 週起 8 週（2027-06-21～08-13、2028-06-19～08-11）',R('C16','Y2','2027-06-21','2027-07-02')&&R('C16','Y3','2028-06-19','2028-06-30')&&R('C17','Y2','2027-06-21','2027-08-13')&&R('C17','Y3','2028-06-19','2028-08-11'));
    check('1. 日子：C18 暑假第 6 週起 9 天（2026-07-20～28、2027-07-19～27、2028-07-17～25）；寒假團寒假第 2 週起 7 天（2027-01-04～10、2028-01-03～09、2029-01-01～07）',R('C18','Y1','2026-07-20','2026-07-28')&&R('C18','Y2','2027-07-19','2027-07-27')&&R('C18','Y3','2028-07-17','2028-07-25')&&R('C18W','Y2','2027-01-04','2027-01-10')&&R('C18W','Y3','2028-01-03','2028-01-09')&&R('C18W','Y4','2029-01-01','2029-01-07')); });
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
    check('3. 快轉：第一次參加、有關鍵事件的上班日要停（repSkip null）；沒有的平日不停、旁白是那一天的日誌（AA_242 12-2 a 第 1 句）',!!q0&&safe(()=>VAC.repSkip(G,q0))===null&&safe(()=>VAC.repSkip(G,onDay('C16@Y2','2027-06-22')))==='（影印、分類、再影印。中午在樓下的便當店吃。）');
    G.day=D('2027-06-21'); G.weekday=1; G.hour=9; said=[]; opts=[]; picks=[1]; await VAC.outing(GM,q0); let L=lines();
    check('3. 第一天：「（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）」韓律師「先簽這個。保密約定。」「在這裡聽到的事，就留在這裡。」',L[0]==='（櫃台後面一整排檔案櫃。帶實習的韓律師三十出頭，桌上三個馬克杯，兩個是空的。）'&&L[1]==='韓律師：先簽這個。保密約定。'&&L[2]==='韓律師：在這裡聽到的事，就留在這裡。',JSON.stringify(L));
    check('3. 選項「好。」「連家人也不能講？」→「不能。你可以跟他們說，今天很累。」',JSON.stringify(opts[0])===JSON.stringify(['「好。」','「連家人也不能講？」'])&&L.includes('韓律師：不能。你可以跟他們說，今天很累。'));
    check('3. 平日白天：演完過到 18:00 下班（同一天），晚上照常',G.day===D('2027-06-21')&&G.hour===18&&VAC.rec(G).work&&(VAC.rec(G).work['C16@Y2']||[]).length===1);
    check('3. 大二暑假那一版沒有語彤',!L.some(t=>t.includes('你認識的名字')||t.includes('語彤')));
    G.day=D('2027-06-22'); G.weekday=2; G.hour=9; said=[]; await VAC.outing(GM,onDay('C16@Y2','2027-06-22'));
    check('3. 沒有關鍵事件的平日：日誌一行（第 1 句「（影印、分類、再影印。中午在樓下的便當店吃。）」），過到 18:00',JSON.stringify(lines())===JSON.stringify(['（影印、分類、再影印。中午在樓下的便當店吃。）'])&&G.hour===18,JSON.stringify(lines()));
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
    check('6. 可昕的視訊：「你們那邊也是週五交東西喔？」「我們律師一直說，結論放第一段。」→「妳寫幾份了？」「六份。你呢？……多寫的那幾份，借我看。」',L.some(t=>/：你們那邊也是週五交東西喔？$/.test(t))&&L.some(t=>/：我們律師一直說，結論放第一段。$/.test(t))&&JSON.stringify(opts[0])===JSON.stringify(['「我們律師也這樣講。」','「妳寫幾份了？」'])&&L.some(t=>/：六份。你呢？……多寫的那幾份，借我看。$/.test(t)),JSON.stringify(L)); });
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
    check('8. 沒去面試：第 13 週週一 12:00「【通知】很遺憾，法律與社會海外見習團（新加坡）本次未能錄取。」＋阿哲私訊「名單出來了 我看到了」「沒差啦 暑假還很長」（AA_459 第 3 節：通知帶名字、阿哲改私訊）＋（沒上。）；出發取消',R1.some(x=>x.th==='sys'&&x.text==='【通知】很遺憾，法律與社會海外見習團（新加坡）本次未能錄取。')&&JSON.stringify(R1.filter(x=>x.th==='p:zhe').map(x=>x.text))===JSON.stringify(['名單出來了 我看到了','沒差啦 暑假還很長'])&&!R1.some(x=>x.th==='g:noodle_team')&&toasts.includes('（沒上。）')&&VAC.state(G,'C18@Y1')==='rejected'&&OUT.get(G,'vac_C18@Y1').state==='cancelled',JSON.stringify(R1.map(x=>x.text)));
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=iv.day; G.hour=19; said=[]; opts=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1_pre0')); let L=lines();
    check('8. 面試：帶隊老師「英文不用很好。去了敢問就好。」「你會問嗎？」→「會。」「好。到時候我會看。」',JSON.stringify(L)===JSON.stringify(['帶隊老師：英文不用很好。去了敢問就好。','帶隊老師：你會問嗎？','帶隊老師：好。到時候我會看。'])&&JSON.stringify(opts[0])===JSON.stringify(['「會。」','「我會試試看。」']),JSON.stringify(L));
    G.day=termDay('Y1S2',13,1); G.weekday=1; run(11.9,12.2); const R2=tagged('vac_sel_C18@Y1');
    check('8. 錄取：「【通知】恭喜錄取法律與社會海外見習團（新加坡）。行前說明會：6/3（三）12:20。」＋媽媽「機票多少？我轉給你」「護照記得看效期」',R2.length===3&&R2[0].text==='【通知】恭喜錄取法律與社會海外見習團（新加坡）。行前說明會：6/3（三）12:20。'&&R2[1].text==='機票多少？我轉給你'&&R2[2].text==='護照記得看效期',JSON.stringify(R2.map(x=>x.text)));
    G.day=D('2026-07-20'); G.weekday=1; G.hour=7.9; run(7.9,8.1);
    check('8. 出發那天麵店團（0-2）：阿哲「新加坡很熱喔」、Alison「聽說口香糖不能帶」',txt('g:noodle_team').includes('zhe:新加坡很熱喔')&&txt('g:noodle_team').includes('yu:聽說口香糖不能帶'));
    said=[]; opts=[]; cards=[]; picks=[0,1,0]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); L=lines();
    check('8. 參訪法院（第二天）：「（法庭比你想的小。…）」「（團長姚思穎在你旁邊小聲翻了兩句，後來也跟不上了。）」思穎「……我只聽懂 adjourned。」→「休庭。」「對，休庭。我就聽懂這個。」',L[0]==='（法庭比你想的小。法官、律師都講英文，講得很快。）'&&L[1]==='（團長姚思穎在你旁邊小聲翻了兩句，後來也跟不上了。）'&&L[2]==='思穎：……我只聽懂 adjourned。'&&L[3]==='思穎：對，休庭。我就聽懂這個。'&&cards.some(c=>c[0].startsWith('7/21')&&c[1]==='新加坡'),JSON.stringify(L));
    check('8. 座談（第四天）：「（當地法律系的學生問你們：上課要不要點名？）」→「看老師。」當地學生「我們也是。」',L.includes('（當地法律系的學生問你們：上課要不要點名？）')&&L.includes('當地學生：我們也是。')&&cards.some(c=>c[0].startsWith('7/23')));
    check('8. 最後一晚：小吃中心、思穎「回去以後，報告誰寫？」→「我寫法院那一段。」「好。那我寫吃的。」；STUDYTOUR_SG',L.includes('（旅館樓下的小吃中心，桌上一堆盤子。）')&&L.includes('思穎：回去以後，報告誰寫？')&&L[L.length-1]==='思穎：好。那我寫吃的。'&&G.flags.STUDYTOUR_SG===true&&cards.some(c=>c[0].startsWith('7/27')));
    check('8. 9 天：7/28 18:00 回來、參加過；回來記 BACK_FROM_C18',G.day===D('2026-07-28')&&G.hour===18&&VAC.state(G,'C18@Y1')==='done'&&G.flags.BACK_FROM_C18===D('2026-07-28'));
    run(18,20.2); check('8. 回來（0-3）：阿哲「伴手禮咧」',txt('g:noodle_team').includes('zhe:伴手禮咧')); });
  await sec(async()=>{ fresh(D('2026-07-20'),8,'dorm',{dating_heroine_01:true}); G.stage='law'; meet('heroine_01'); reg('C18@Y1'); said=[]; picks=[1,0,1]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); PHONE.tick(G); const L=lines();
    check('8. 「我也是。」→ 長椅上對單字；「要，而且要坐前面。」→ 對面三個人一起笑了；「抽籤。」→（抽到你。）',L.includes('（出來以後，兩個人坐在法院外面的長椅上，把剛剛記下來的單字對了一遍。）')&&L.includes('（對面三個人一起笑了。）')&&L[L.length-1]==='（抽到你。）',JSON.stringify(L));
    const A1=(G.msgs||[]).filter(m=>m.th==='p:heroine_01'); check('8. 出國期間的訊息照第 8 節（交往中的以安：出發那天、輪播）；回來那天（7/28）她在台中（7/25～8/7）＝沒有「明天見。……」（AA_369 第 7 節第 7 題：限臺北）',A1.some(m=>m.text==='到了傳一張照片。一張就好。')&&A1.some(m=>m.text==='今天讀了四十頁。你那邊天氣好嗎？')&&!A1.some(m=>m.text==='明天有空的話，一起吃飯。'),JSON.stringify(A1.map(m=>m.text)));
    G.day=D('2026-07-30'); G.zone='campus'; meet('yu'); Object.assign(SOCIAL.rel('yu'),{fam:30,trust:10,comf:5}); said=[]; const g=await VAC.backGreet(GM,{name:'Alison',charId:'yu'},'yu');
    check('8. 回來後第一次在 3D 遇到 Alison：「你回來了！伴手禮咧！」',g===true&&lines().join('|')==='Alison：你回來了！伴手禮咧！'); });

  // ===== 9. C18W 寒假團 =====
  await sec(async()=>{ const w6=termDay('Y1S1',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2);
    check('9. 寒假團大一不開（AA_242 12-1 第 2 點）：大一上第 6 週週一沒有見習團的公告、沒有報名的選項，行事曆也沒有',!txt('g:law_class').some(t=>t.includes('【見習團】'))&&!(G.msgs||[]).some(x=>x.ask&&/^vac_ask_C18W/.test(x.ask.id))&&!VAC.html(G).includes('C18W'),JSON.stringify(txt('g:law_class').slice(-1))); });
  await sec(async()=>{ const w6=termDay('Y2S1',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; LAWC(); run(11.9,12.2); const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C18W@Y2');
    check('9. 大二上（寒假團第一次開）：第 6 週週一 12:00 同一則公告、選項「（報名）」到第 9 週週五；行事曆也報得到',txt('g:law_class').filter(t=>t.includes('【見習團】法律與社會海外見習團（新加坡），暑假 9 天（寒假團 7 天），有獎學金名額。需面試，第 10 週（寒假團第 9 週）截止。')).length===1&&!!m&&m.ask.opts[0].t==='（報名）'&&m.ask.until===Tm(termDay('Y2S1',9,5),24)&&VAC.html(G).includes('data-vac="C18W@Y2"'));
    VAC.signup(G,'C18W@Y2','yes'); const iv=OUT.get(G,'vac_C18W@Y2_pre0');   // 行事曆報名（沒去面試＝下面測沒錄取）
    check('9. 面試：大二上第 10 週週三 19:00；出發 2027-01-04 08:00',!!iv&&iv.day===termDay('Y2S1',10,3)&&iv.h===19&&OUT.get(G,'vac_C18W@Y2').day===D('2027-01-04'));
    G.day=termDay('Y2S1',12,1); G.weekday=1; run(11.9,12.2); const R=tagged('vac_sel_C18W@Y2');
    check('9. 寒假團沒錄取：「【通知】很遺憾，法律與社會海外見習團（新加坡）本次未能錄取。」＋阿哲私訊「名單出來了 我看到了」＋寒假版「沒差啦 過年比較重要」（AA_242 12-4；AA_459 第 3 節），不是「暑假還很長」',R.length===3&&R[0].text==='【通知】很遺憾，法律與社會海外見習團（新加坡）本次未能錄取。'&&R[1].th==='p:zhe'&&R[1].text==='名單出來了 我看到了'&&R[2].th==='p:zhe'&&R[2].from==='zhe'&&R[2].text==='沒差啦 過年比較重要'&&!txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長'),JSON.stringify(R.map(x=>x.text)));
    check('9. 沒錄取：不排行前說明會',!OUT.get(G,'vac_C18W@Y2_brief')); });
  await sec(async()=>{ fresh(D('2027-01-04'),8,'dorm',{}); G.stage='law'; reg('C18W@Y2'); said=[]; cards=[]; await VAC.outing(GM,OUT.get(G,'vac_C18W@Y2'));
    check('9. 寒假團 7 天：1/5 法院、1/7 座談、1/9 最後一晚；1/10 18:00 回來、BACK_FROM_C18W',cards.some(c=>c[0].startsWith('1/5'))&&cards.some(c=>c[0].startsWith('1/7'))&&cards.some(c=>c[0].startsWith('1/9'))&&G.day===D('2027-01-10')&&G.hour===18&&G.flags.STUDYTOUR_SG===true&&G.flags.BACK_FROM_C18W===D('2027-01-10'));
    G.day=D('2027-01-12'); meet('yu'); Object.assign(SOCIAL.rel('yu'),{fam:30,trust:10,comf:5}); said=[]; const g=await VAC.backGreet(GM,{name:'Alison',charId:'yu'},'yu');
    check('9. 寒假團回來也有 3D 的招呼（BACK_FROM_C18W）',g===true&&lines().join('|')==='Alison：你回來了！伴手禮咧！'); });

  // ===== 10. 第二次參加（AA_264 第 0 節第 1 點：不重演，關鍵事件那幾天換成日誌一句；第二次的日誌句 AA_242 12-3）=====
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C16@Y2']='done'; reg('C16@Y3'); const q=onDay('C16@Y3','2028-06-19');
    check('10. C16 第二次：nth＝2、標題不寫「第一天」、快轉不停（旁白換成第二次的日誌一句）',VAC.nth(G,inst('C16','Y3'))===2&&!!q&&q.title==='法扶實習（台北分會）'&&safe(()=>VAC.repSkip(G,q))==='（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）');
    G.day=D('2028-06-19'); G.hour=9; said=[]; opts=[]; await VAC.outing(GM,q); check('10. 第二次的第一天：不重演（沒有保密約定那段、沒有選項），只有那一句日誌，過到 18:00',JSON.stringify(lines())===JSON.stringify(['（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）'])&&!opts.length&&G.hour===18,JSON.stringify(lines()));
    fresh(D('2027-07-19'),8,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C18@Y1']='done'; reg('C18@Y2'); said=[]; cards=[]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y2'));
    check('10. C18 第二次：三場換成日誌一句（字卡照日期 7/20、7/22、7/26）、思穎不在；照樣 7/27 回來',JSON.stringify(lines())===JSON.stringify(['（法院裡還是講得很快。這次你多聽懂了幾個字。）','（當地學生又問要不要點名。這次你先問他們。）','（小吃中心。報告這次你先說要寫法院那段。）'])&&['7/20','7/22','7/26'].every(x=>cards.some(c=>c[0].startsWith(x)))&&G.day===D('2027-07-27')&&VAC.state(G,'C18@Y2')==='done',JSON.stringify(lines())); });

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
    check('12. 快轉跳過 6/22、6/23：記成去過（上班 3 天）；跳過一次只放一句旁白＝最後跳過的那一天的日誌（6/23 第 2 句，AA_275 第 1 節）',ok&&onDay('C16@Y2','2027-06-22').state==='done'&&onDay('C16@Y2','2027-06-23').state==='done'&&(VAC.rec(G).work['C16@Y2']||[]).length===3&&G.flags._repSkipLine==='（電話一直響。櫃台的姐姐把聽筒夾在肩膀上，繼續寫字。）'&&onDay('C16@Y2','2027-06-24').state==='planned',JSON.stringify([VAC.rec(G).work,G.flags._repSkipLine])); });

  // ===== 14. 真的走出遊的流程（OUT.tick 的出發提示 → OUT.go → ev_vac_key → VAC.outing），不是直接叫 VAC.outing =====
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); G.day=D('2027-06-21'); G.weekday=1; G.hour=8.45; said=[]; opts=[]; picks=[0,0]; cards=[];
    const r=await OUT.tick(GM), q=onDay('C16@Y2','2027-06-21');
    check('14. 6/21 早上的出發提示「出發：法扶實習（台北分會）：第一天」→ 出發 → 第一天演完；18:00 下班＋0.5 小時回來、這一趟記成 done',r==='go'&&!!opts[0]&&opts[0][0]==='出發：法扶實習（台北分會）：第一天'&&lines().includes('韓律師：先簽這個。保密約定。')&&q.state==='done'&&G.day===D('2027-06-21')&&Math.abs(G.hour-18.5)<1e-6,JSON.stringify([r,opts[0],G.hour]));
    G.day=D('2027-06-22'); G.weekday=2; G.hour=8.45; said=[]; opts=[]; picks=[0]; const r2=await OUT.tick(GM), q2=onDay('C16@Y2','2027-06-22');
    check('14. 6/22（沒有關鍵事件）：出發提示「出發：法扶實習（台北分會）」→ 日誌一行（第 1 句）、18:30 回來',r2==='go'&&opts[0][0]==='出發：法扶實習（台北分會）'&&JSON.stringify(lines())===JSON.stringify(['（影印、分類、再影印。中午在樓下的便當店吃。）'])&&q2.state==='done'&&Math.abs(G.hour-18.5)<1e-6&&(VAC.rec(G).work['C16@Y2']||[]).length===2,JSON.stringify([r2,opts[0],G.hour,lines()]));
    G.day=D('2027-06-23'); G.weekday=3; G.hour=8.45; opts=[]; picks=[2]; const r3=await OUT.tick(GM), q3=onDay('C16@Y2','2027-06-23');
    check('14. 「不去了」：這一天沒去（missed），報名照舊',r3==='no'&&q3.state==='missed'&&VAC.state(G,'C16@Y2')==='yes'&&(VAC.rec(G).work['C16@Y2']||[]).length===2); });

  // ===== 15. AA_242 12-1 七項裁定（AA-C 2026-10-21 56a36a4d）=====
  // 15-1 語彤那一版在大三暑假；大二去過的，大三語彤那兩段照演，第一句換「……你又來了。」，9-6「我明年還要來。」照舊
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; meet('heroine_03'); VAC.rec(G).reg['C16@Y2']='done'; reg('C16@Y3');
    const q1=onDay('C16@Y3','2028-06-19'), q4=onDay('C16@Y3','2028-06-30'), sk=k=>safe(()=>VAC.repSkip(G,onDay('C16@Y3',k)));
    check('15-1. 大二去過、大三第二次、認識語彤：第一天、最後一天快轉要停（語彤那兩段照演）；陪同晤談、整理卷宗不停（旁白＝第二次的日誌）；其他平日不停、沒有旁白',
      sk('2028-06-19')===null&&sk('2028-06-30')===null&&sk('2028-06-22')==='（陪同晤談。她講到一半停下來的時候，你沒有抬頭。）'&&sk('2028-06-27')==='（影印機還是會卡紙。你先拍兩下。）'&&sk('2028-06-20')==='',JSON.stringify(['2028-06-19','2028-06-22','2028-06-27','2028-06-30','2028-06-20'].map(sk)));
    G.day=D('2028-06-19'); G.weekday=1; G.hour=9; said=[]; opts=[]; if(q1) await VAC.outing(GM,q1); let L=lines();
    check('15-1. 第一天：「（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）」→「（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）」→ 語彤「……你又來了。」（不是「……你也來了。」）；沒有選項',
      L.length===3&&L[0]==='（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）'&&L[1]==='（同期的名單上有一個你認識的名字。她坐在你斜對面，抬頭看了你一眼。）'&&/語彤：……你又來了。$/.test(L[2])&&!opts.length&&G.hour===18,JSON.stringify(L));
    for(const k of ['2028-06-20','2028-06-21','2028-06-22','2028-06-23','2028-06-26','2028-06-27','2028-06-28','2028-06-29']) VAC.repDone(G,onDay('C16@Y3',k));
    G.day=D('2028-06-30'); G.weekday=5; G.hour=9; said=[]; opts=[]; if(q4) await VAC.outing(GM,q4); L=lines();
    check('15-1. 最後一天：「（最後一天。韓律師把筆記還給你，這次鉛筆補的字比較少。）」→「（走出大樓，語彤停下來。）」→ 語彤「我明年還要來。」（照舊）；參加過',
      L.length===3&&L[0]==='（最後一天。韓律師把筆記還給你，這次鉛筆補的字比較少。）'&&L[1]==='（走出大樓，語彤停下來。）'&&/語彤：我明年還要來。$/.test(L[2])&&!opts.length&&VAC.state(G,'C16@Y3')==='done',JSON.stringify(L)); });
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C16@Y2']='done'; reg('C16@Y3'); const sk=['2028-06-19','2028-06-22','2028-06-27','2028-06-30'].map(k=>safe(()=>VAC.repSkip(G,onDay('C16@Y3',k))));
    check('15-1. 不認識語彤的第二次：四個關鍵日都是第二次的日誌一句（快轉不停、旁白換成那一句；AA_242 12-3）',JSON.stringify(sk)===JSON.stringify(['（韓律師看到你：「又來了。」保密約定，這次你自己找到簽名的地方。）','（陪同晤談。她講到一半停下來的時候，你沒有抬頭。）','（影印機還是會卡紙。你先拍兩下。）','（最後一天。韓律師把筆記還給你，這次鉛筆補的字比較少。）']),JSON.stringify(sk)); });
  // 15-4 C16 照暫排＋上學期有被當的科目＝沒錄取（用「看成績」的字面意思，不另設分數門檻）；沒錄取照 9-2 的 email
  await sec(async()=>{ const mk=ex=>{ fresh(termDay('Y2S2',12,1),12.5,'dorm',{}); G.stage='law'; LAWC(); if(ex) G.courses={exam:ex}; reg('C16@Y2'); G.day=termDay('Y2S2',14,1); G.weekday=1; toasts=[]; run(11.9,12.2); return tagged('vac_sel_C16@Y2'); };
    const R0=mk({'Y2S1:crim_spec:final':{qs:[],ans:[],correct:0,score:0,status:'done'},'Y2S1:property:final':{qs:[],ans:[],correct:4,score:90,status:'done'}});
    check('15-4. C16：上學期（大二上）有一科期末考 0 分（被當）＝沒錄取：系辦的信「名額已滿，明年可以再報。」、（沒上。）、上班日取消（AA_242 12-1 第 4 點）',R0.length===1&&R0[0].name==='系辦（信）'&&R0[0].text==='名額已滿，明年可以再報。'&&VAC.state(G,'C16@Y2')==='rejected'&&toasts.includes('（沒上。）')&&workQ('C16@Y2').every(q=>q.state==='cancelled'),JSON.stringify(R0.map(m=>m.text)));
    const R1=mk({'Y2S1:crim_spec:final':{qs:[],ans:[],correct:1,score:60,status:'done'},'Y1S2:crim_general_2:final':{qs:[],ans:[],correct:0,score:0,status:'done'}});
    check('15-4. 大二上都過了（最低 60 分；被當的是大一下＝不是上學期）：照常錄取',R1.length===2&&R1[0].text==='【通知】恭喜錄取法律扶助基金會台北分會暑期實習。'&&VAC.state(G,'C16@Y2')==='yes',JSON.stringify(R1.map(m=>m.text)));
    const R2=mk({'Y2S1:crim_spec:final':{status:'insufficient',n:3}});
    check('15-4. 未開考（題庫不足）不算被當：照常錄取',R2.length===2&&VAC.state(G,'C16@Y2')==='yes',JSON.stringify(R2.map(m=>m.text))); });
  // 15-5 C17 第二次免面試：大二去過的，大三第 4 週公告時多一個選項「寄信給馮律師」；選了不用交履歷、不面試，第 14 週直接錄取
  await sec(async()=>{ const w4=termDay('Y3S2',4,1), setup=done=>{ fresh(w4,11.9,'dorm',{EXCHANGE_ROUTE:'TW'}); G.stage='law'; LAWC(); const V=VAC.rec(G); if(done) V.reg['C17@Y2']='done'; V.score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; run(11.9,12.2); return (G.msgs||[]).find(x=>x.ask&&x.ask.id==='vac_ask_C17@Y3'); };
    let m=setup(true);
    check('15-5. 大二去過 C17：大三下第 4 週週一 12:00 同一則公告，多一個選項「寄信給馮律師」（到第 9 週週五）；行事曆照樣有報名鈕（交履歷）',txt('g:law_class').includes('sysoffice:【暑期實習】青嶺法律事務所，暑假 8 週，有實習津貼。需附英文檢定成績。第 9 週週五前交履歷。')&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['寄信給馮律師'])&&m.ask.until===Tm(termDay('Y3S2',9,5),24)&&VAC.html(G).includes('data-vac="C17@Y3"'),JSON.stringify(m&&m.ask));
    if(m) PHONE.answer(G,'vac_ask_C17@Y3',0); STORY.phoneRules(GM); const I3=inst('C17','Y3');
    check('15-5. 選「寄信給馮律師」：報名了、不用交履歷、不排面試；群組裡不會多出玩家的一句（不是對全班說的）',VAC.state(G,'C17@Y3')==='yes'&&!OUT.get(G,'vac_C17@Y3_pre0')&&!!safe(()=>VAC.okI(G,I3,'INT'))&&workQ('C17@Y3').length===40&&!TH('g:law_class').some(x=>x.from==='player'));
    G.day=termDay('Y3S2',14,1); G.weekday=1; run(11.9,12.2); const R=tagged('vac_sel_C17@Y3');
    check('15-5. 第 14 週週一 12:00 直接錄取：「【通知】恭喜錄取青嶺法律事務所暑期實習。」＋媽媽「有錢可以領喔？」',R.length===2&&R[0].text==='【通知】恭喜錄取青嶺法律事務所暑期實習。'&&R[1].text==='有錢可以領喔？'&&VAC.state(G,'C17@Y3')==='yes',JSON.stringify(R.map(x=>x.text)));
    m=setup(true); VAC.signup(G,'C17@Y3','yes'); const iv=OUT.get(G,'vac_C17@Y3_pre0'); if(m) PHONE.answer(G,'vac_ask_C17@Y3',0); STORY.phoneRules(GM);
    check('15-5. 先在行事曆報名（交履歷、排了第 12 週的面試）以後才選「寄信給馮律師」：那一場面試取消、直接算數',!!m&&!!iv&&iv.state==='cancelled'&&!!safe(()=>VAC.okI(G,inst('C17','Y3'),'INT'))&&VAC.state(G,'C17@Y3')==='yes');
    m=setup(false); check('15-5. 大二沒去過：大三的公告沒有「寄信給馮律師」（照舊在行事曆報名）',!m); });
  // 15-6 C16 午餐每天 −100（兩週 −1,000），上班日扣
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); const m0=G.money; G.day=D('2027-06-22'); G.weekday=2; G.hour=9; await VAC.outing(GM,onDay('C16@Y2','2027-06-22'));
    check('15-6. C16 午餐：走去上班的那一天扣 100（AA_242 12-1）',G.money===m0-100,String(G.money-m0));
    for(const q of workQ('C16@Y2')) if(q.state==='planned') VAC.repDone(G,q);
    check('15-6. 兩週十天＝−1,000（快轉記成去過的也扣）',G.money===m0-1000,String(G.money-m0));
    VAC.repDone(G,onDay('C16@Y2','2027-06-22')); check('15-6. 同一天不重扣',G.money===m0-1000,String(G.money-m0));
    fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; VAC.rec(G).score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y2'); const m1=G.money; for(const q of workQ('C17@Y2').slice(0,5)) VAC.repDone(G,q);
    check('15-6. C17 不扣午餐（只有 C16）',G.money===m1,String(G.money-m1)); });

  // ===== 16. AA_242 12-2 (a)：沒有關鍵事件的上班日，一天一行照順序用，用完以後只有日期卡；C17 第 12 句固定在最後一週的第一個上班日 =====
  const C16D=['（影印、分類、再影印。中午在樓下的便當店吃。）','（電話一直響。櫃台的姐姐把聽筒夾在肩膀上，繼續寫字。）','（下午有人來問能不能申請。韓律師請他先填表，表格比他想的長。）','（你學會怎麼用那台影印機。它只是需要先拍兩下。）','（整理卷宗，把收據照日期排好。有幾張日期寫錯了。）','（下班的時候，等候區還有兩個人在等。）'];
  const C17D=['（門禁卡要刷兩次，第一次總是紅燈。）','（中午大家一起訂便當。你還不知道每個人愛吃什麼。）','（你查了一整天的資料，寫了半頁。查不到的地方寫「查不到」。）','（馮律師經過你的位子，把一本書放在你桌上：「這本找得到。」）','（晚上九點，辦公室還有一半的燈亮著。）','（影印室的紙用完了。你知道要去哪裡拿了。）','（這週的備忘錄，結論寫在第一段。）','（另一個實習生問你期末考考得怎樣。你們都不太想講。）','（下雨。你在捷運站等到雨小一點才出來。）','（週五下午，有人帶了一盒蛋糕。沒有人說是誰生日。）','（你的位子旁邊多了一小盆植物。不知道是誰放的。）','（最後一週。你把桌上的東西收進一個紙箱，比來的時候多。）'];
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); const seq=[];
    for(const q of workQ('C16@Y2')){ const l=safe(()=>VAC.repSkip(G,q)); if(l) seq.push([CALENDAR.dateOf(q.day).key,l]); VAC.repDone(G,q); }
    check('16. C16 第一次：沒有關鍵事件的六天（6/22、6/23、6/25、6/28、6/30、7/1）快轉的旁白照順序是六句日誌',JSON.stringify(seq)===JSON.stringify([['2027-06-22',C16D[0]],['2027-06-23',C16D[1]],['2027-06-25',C16D[2]],['2027-06-28',C16D[3]],['2027-06-30',C16D[4]],['2027-07-01',C16D[5]]]),JSON.stringify(seq)); });
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; reg('C16@Y2'); VAC.repDone(G,onDay('C16@Y2','2027-06-21')); onDay('C16@Y2','2027-06-22').state='missed';
    G.day=D('2027-06-23'); G.weekday=3; G.hour=9; said=[]; await VAC.outing(GM,onDay('C16@Y2','2027-06-23'));
    check('16. 6/22 沒去：6/23 走去上班的日誌是第 1 句（沒去的那天不用掉句子）',JSON.stringify(lines())===JSON.stringify([C16D[0]])&&G.hour===18,JSON.stringify(lines())); });
  await sec(async()=>{ fresh(D('2027-06-20'),20,'dorm',{}); G.stage='law'; VAC.rec(G).score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y2'); const got={};
    for(const q of workQ('C17@Y2')){ got[CALENDAR.dateOf(q.day).key]=safe(()=>VAC.repSkip(G,q)); VAC.repDone(G,q); }
    const key4=['2027-06-21','2027-06-25','2027-07-14','2027-08-13'], seq=Object.keys(got).filter(k=>!key4.includes(k)).map(k=>got[k]).filter(Boolean);
    check('16. C17 第一次：前 11 個沒有關鍵事件的上班日照順序第 1～11 句（6/22～7/7），之後只有日期卡；第 12 句固定在最後一週的第一個上班日（8/9 週一）；關鍵日要停',
      JSON.stringify(seq)===JSON.stringify(C17D)&&got['2027-06-22']===C17D[0]&&got['2027-07-07']===C17D[10]&&got['2027-07-08']===''&&got['2027-08-06']===''&&got['2027-08-09']===C17D[11]&&got['2027-08-10']===''&&key4.every(k=>got[k]===null),JSON.stringify([seq.length,got['2027-07-07'],got['2027-08-09']])); });

  // ===== 17. AA_242 12-3 (b)：第二次以後的日誌（C16、C17 只有大二、大三兩次；C18 第二次、第三次以後）=====
  await sec(async()=>{ fresh(D('2028-06-18'),20,'dorm',{EXCHANGE_ROUTE:'TW'}); G.stage='law'; const V=VAC.rec(G); V.reg['C17@Y2']='done'; V.score={'C04W@Y2':{test:'toefl',n:80,day:D('2027-02-02')}}; reg('C17@Y3');
    const sk=['2028-06-19','2028-06-23','2028-07-12','2028-08-11','2028-06-20'].map(k=>safe(()=>VAC.repSkip(G,onDay('C17@Y3',k))));
    check('17. C17 第二次（大三）：第一天、第一次被改、跟開庭＝日誌一句（快轉不停）；最後一天是馮律師說話＝要停；其他平日沒有旁白',JSON.stringify(sk)===JSON.stringify(['（門禁卡還是同一張。位子換到靠窗了。）','（第一份備忘錄發回來。紅字比去年少，結論在第一段。）','（跟開庭。法官停下來的時候，你在心裡數到五。）',null,'']),JSON.stringify(sk));
    for(const q of workQ('C17@Y3')) if(q.day<D('2028-08-11')) VAC.repDone(G,q);
    G.day=D('2028-08-11'); G.weekday=5; G.hour=9; said=[]; await VAC.outing(GM,onDay('C17@Y3','2028-08-11'));
    check('17. C17 第二次的最後一天：馮律師「畢業以後，履歷寄給我。」；參加過',JSON.stringify(lines())===JSON.stringify(['馮律師：畢業以後，履歷寄給我。'])&&VAC.state(G,'C17@Y3')==='done',JSON.stringify(lines())); });
  await sec(async()=>{ fresh(D('2028-07-17'),8,'dorm',{EXCHANGE_ROUTE:'TW'}); G.stage='law'; VAC.rec(G).reg['C18@Y1']='done'; VAC.rec(G).reg['C18W@Y2']='done'; reg('C18@Y3'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C18@Y3'));
    check('17. C18 第三次（暑假團、寒假團合計）：「（旁聽席，你坐到第一排。）」「（座談。對面有一個人，你上次就見過。）」「（小吃中心。你點菜的時候，團員說你很熟。）」',VAC.nth(G,inst('C18','Y3'))===3&&JSON.stringify(lines())===JSON.stringify(['（旁聽席，你坐到第一排。）','（座談。對面有一個人，你上次就見過。）','（小吃中心。你點菜的時候，團員說你很熟。）']),JSON.stringify(lines())); });

  // ===== 18. AA_242 12-4 (c)：沒錄取時阿哲那一句寒假版（C18W 在第 9 項；C11 東京一起用）=====
  await sec(async()=>{ fresh(termDay('Y2S1',5,1),9.5,'dorm',{}); G.stage='law'; LAWC(); VAC.signup(G,'C11@Y2','yes'); G.day=termDay('Y2S1',8,1); G.weekday=1; toasts=[]; run(11.9,12.2); const R=tagged('vac_sel_C11@Y2');
    check('18. C11 東京（寒假）沒錄取：「【通知】很遺憾，姊妹校冬季短期課程（東京）本次未能錄取。」＋阿哲私訊「沒差啦 過年比較重要」（不是「暑假還很長」；AA_459 第 3 節）',R.some(x=>x.th==='sys'&&x.text==='【通知】很遺憾，姊妹校冬季短期課程（東京）本次未能錄取。')&&R.some(x=>x.th==='p:zhe'&&x.from==='zhe'&&x.text==='沒差啦 過年比較重要')&&!R.some(x=>x.text==='沒差啦 暑假還很長'),JSON.stringify(R.map(x=>x.text))); });

  // ===== 19. AA_242 12-5 (d)：C18 行前說明會（暑假團第 15 週週三 12:20、寒假團第 14 週週三 12:20；系館的小教室，2D）=====
  const BR=['（系館的小教室。桌上一疊行程表，第一頁是新加坡的地圖。）','帶隊老師：護照、轉接頭、一件薄外套。法院裡冷氣很強。','帶隊老師：每個人選一天寫紀錄。不用寫得很好，寫你看到的。'], BR1=['（坐你旁邊的人把名牌轉過來給你看：姚思穎，地理系。）','思穎：我是團長。','思穎：……其實是因為沒人要當。'];
  await sec(async()=>{ fresh(termDay('Y1S2',12,1),12,'dorm',{}); G.stage='law'; LAWC(); reg('C18@Y1'); G.day=termDay('Y1S2',13,1); G.weekday=1; run(11.9,12.2); const b=OUT.get(G,'vac_C18@Y1_brief');
    check('19. 錄取以後排行前說明會：暑假團第 15 週週三 12:20（6/3）、系館的小教室',!!b&&b.state==='planned'&&b.day===termDay('Y1S2',15,3)&&Math.abs(b.h-(12+20/60))<1e-6&&b.place==='系館的小教室'&&b.title==='海外見習團（新加坡）・暑假團：行前說明會',JSON.stringify(b));
    G.day=b?b.day:G.day; G.hour=12.4; said=[]; opts=[]; if(b) await VAC.outing(GM,b);
    check('19. 第一次參加：三行＋思穎第一次出現的三行，沒有選項',JSON.stringify(lines())===JSON.stringify(BR.concat(BR1))&&!opts.length,JSON.stringify(lines())); });
  await sec(async()=>{ fresh(termDay('Y2S2',12,1),12,'dorm',{}); G.stage='law'; LAWC(); VAC.rec(G).reg['C18@Y1']='done'; reg('C18@Y2'); G.day=termDay('Y2S2',13,1); G.weekday=1; run(11.9,12.2); const b=OUT.get(G,'vac_C18@Y2_brief');
    G.day=b?b.day:G.day; G.hour=12.4; said=[]; if(b) await VAC.outing(GM,b);
    check('19. 第二次以後：只有前三行（思穎只在第一次的那一團）',!!b&&JSON.stringify(lines())===JSON.stringify(BR),JSON.stringify(lines())); });
  await sec(async()=>{ fresh(termDay('Y2S1',11,1),12,'dorm',{}); G.stage='law'; LAWC(); reg('C18W@Y2'); G.day=termDay('Y2S1',12,1); G.weekday=1; run(11.9,12.2); const b=OUT.get(G,'vac_C18W@Y2_brief');
    check('19. 寒假團：第 14 週週三 12:20',!!b&&b.day===termDay('Y2S1',14,3)&&Math.abs(b.h-(12+20/60))<1e-6,JSON.stringify(b));
    if(b){ VAC.missed(GM,b); b.state='missed'; }
    check('19. 沒去說明會：照樣出發（報名狀態、出發的那一趟都還在）',!!b&&VAC.state(G,'C18W@Y2')==='yes'&&OUT.get(G,'vac_C18W@Y2').state==='planned'); });

  // ===== 20. AA_242 12-6 (e)：思穎回國後的訊息（第一次參加的那一團才有；回國一週後 20:00）=====
  await sec(async()=>{ fresh(D('2026-07-20'),8,'dorm',{}); G.stage='law'; reg('C18@Y1'); await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); G.day=D('2026-08-03'); G.weekday=1; run(19.5,23.9); const n0=TH('p:npc_siying').length;
    G.day=D('2026-08-04'); G.weekday=2; run(19.8,20.2); const M=TH('p:npc_siying');
    check('20. 回國一週後（7/28 回來 → 8/4）20:00 思穎一則「報告我那段寫完了。三頁，都是吃的。」，選項「我的也寫完了。」「還沒。」（8/3 還沒有）',n0===0&&M.length===1&&M[0].text==='報告我那段寫完了。三頁，都是吃的。'&&M[0].name==='思穎'&&!!M[0].ask&&JSON.stringify(M[0].ask.opts.map(o=>o.t))===JSON.stringify(['我的也寫完了。','還沒。'])&&M[0].day===D('2026-08-04')&&M[0].h===20,JSON.stringify(M.map(m=>[m.text,m.day,m.h])));
    if(M[0]&&M[0].ask) PHONE.answer(G,M[0].ask.id,1); const M2=TH('p:npc_siying').map(m=>m.text);
    check('20. 回「還沒。」→「禮拜五以前喔。團長會催你。」「……我就是團長。」',JSON.stringify(M2.slice(-2))===JSON.stringify(['禮拜五以前喔。團長會催你。','……我就是團長。']),JSON.stringify(M2));
    fresh(D('2026-07-20'),8,'dorm',{}); G.stage='law'; reg('C18@Y1'); await VAC.outing(GM,OUT.get(G,'vac_C18@Y1')); G.day=D('2026-08-04'); G.weekday=2; run(19.8,20.2); const M3=TH('p:npc_siying'); if(M3[0]&&M3[0].ask) PHONE.answer(G,M3[0].ask.id,0);
    check('20. 回「我的也寫完了。」→「好。那我交出去了。」',TH('p:npc_siying').map(m=>m.text).slice(-1)[0]==='好。那我交出去了。');
    fresh(D('2027-07-19'),8,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C18@Y1']='done'; reg('C18@Y2'); await VAC.outing(GM,OUT.get(G,'vac_C18@Y2')); G.day=D('2027-08-03'); G.weekday=2; run(19.8,20.2);
    check('20. 第二次參加的那一團沒有思穎的訊息',!TH('p:npc_siying').length); });

  // ===== 13. 舊存檔 =====
  await sec(async()=>{ fresh(termDay('Y2S2',14,1),11.9,'dorm',{}); G.stage='law'; LAWC(); G.vac={reg:{'C08@Y1':'done','C04@Y1':'done'},seen:{C08:true},log:[]}; let ok=true;
    try{ run(11.9,12.2); VAC.html(G); const s=JSON.stringify(G); G=JSON.parse(s); SOCIAL.bind(G); STORY.phoneRules(GM); }catch(e){ ok=false; console.log(e); }
    check('13. 舊存檔（G.vac 沒有 ok、work、paid）：手機、行事曆照常、不報錯；新欄位用到才建',ok&&!G.vac.ok&&!G.vac.paid&&!G.vac.work);
    VAC.rec(G).reg['C16@Y2']='yes'; const s=JSON.stringify(G); G=JSON.parse(s); SOCIAL.bind(G); check('13. 存讀檔：報名狀態留著',VAC.state(G,'C16@Y2')==='yes'); });
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
