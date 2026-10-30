// 假期活動第二批：出國的 C08 首爾交流、C09 柬埔寨志工、C10 加州暑期課、C11 東京冬季課、C12 京都語言課（AA_242 18fe1b6a）——不需要瀏覽器。用法：node tests/vac_abroad_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA|DATE|ROM|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };
(async()=>{
  const I8=VAC.inst('C08','Y1'), I9=VAC.inst('C09','Y1'), I10=VAC.inst('C10','Y2'), I11=VAC.inst('C11','Y2'), I12=VAC.inst('C12','Y2');
  check('1. 日期：首爾 2026-07-13～24、柬埔寨 7/27～8/5、加州 2027-06-21～07-31、東京 2027-01-17～30、京都 2027-08-09～27',I8.from===D('2026-07-13')&&I8.to===D('2026-07-24')&&I9.from===D('2026-07-27')&&I9.to===D('2026-08-05')&&I10.from===D('2027-06-21')&&I10.to===D('2027-07-31')&&I11.from===D('2027-01-17')&&I11.to===D('2027-01-30')&&I12.from===D('2027-08-09')&&I12.to===D('2027-08-27'));
  check('1. 每年重開（AA_264）：暑假最多三次（大一～大三）、加州最多兩次（大二、大三）、東京寒假大二起；第一次開放的那一年才有第一次的公告與台詞',!!VAC.inst('C08','Y2')&&!!VAC.inst('C08','Y3')&&!VAC.inst('C08','Y4')&&!VAC.inst('C10','Y1')&&!!VAC.inst('C10','Y3')&&!VAC.inst('C10','Y4')&&!!VAC.inst('C02','Y2')&&!!VAC.inst('C11','Y4')&&VAC.inst('C02','Y1').first&&!VAC.inst('C02','Y2').first);
  // 2. C08：大一下第 6 週週一 12:00 全班群組系辦公告 → 交申請書 → 第 12 週週一 12:00 錄取通知＋媽媽兩句（行前說明會第 14 週週三 12:20）
  const w6=termDay('Y1S2',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; PHONE.join(G,'law_class','法律系 大一（全班）'); PHONE.join(G,'noodle_team','麵店團'); run(11.9,12.2);
  const T8=txt('g:law_class'); check('2. 系辦公告【交流計畫】…第 9 週週五前交申請書',T8.some(t=>t==='sysoffice:【交流計畫】姊妹校暑期交流（首爾），7/13～7/24，對方學校負擔食宿。名額 10 名，需系上推薦，第 9 週週五前交申請書。'),JSON.stringify(T8));
  PHONE.answer(G,'vac_ask_C08@Y1',0); STORY.phoneRules(GM); check('2. 交了：報名、出發的出遊排在 7/13 08:00',VAC.state(G,'C08@Y1')==='yes'&&!!OUT.get(G,'vac_C08@Y1')&&OUT.get(G,'vac_C08@Y1').day===D('2026-07-13')&&OUT.get(G,'vac_C08@Y1').h===8);
  { const q=OUT.get(G,'vac_C08@Y1_pre0'); check('2. 報名隔天 20:00 宿舍書桌「寫申請資料」（BB-C 13:03：沒寫就沒上）',!!q&&q.day===w6+1&&q.h===20); const s0=JSON.stringify(G);
    const w12a=termDay('Y1S2',12,1); G.day=w12a; run(11.9,12.2); check('2. 沒寫申請資料：第 12 週「【通知】很遺憾，姊妹校暑期交流（首爾）本次未能錄取。」＋阿哲私訊「沒差啦 暑假還很長」（AA_459 第 3 節：帶名字、私訊）；出發取消',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='【通知】很遺憾，姊妹校暑期交流（首爾）本次未能錄取。')&&txt('p:zhe').includes('zhe:沒差啦 暑假還很長')&&!txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長')&&VAC.state(G,'C08@Y1')==='rejected'&&OUT.get(G,'vac_C08@Y1').state==='cancelled');
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=w6+1; G.hour=20; await VAC.outing(GM,q); check('2. 寫了：VAC_C08_APP',G.flags.VAC_C08_APP===true); }
  const w12=termDay('Y1S2',12,1), w14=termDay('Y1S2',14,3); G.day=w12; G.weekday=wdOf(w12); run(11.9,12.2); const x14=CALENDAR.dateOf(w14);
  const sys=(G.msgs||[]).filter(m=>m.th==='sys').map(m=>m.text), mom=txt('g:home');
  check('2. 第 12 週週一 12:00：【通知】恭喜錄取…行前說明會；媽媽「機票多少？我轉給你」「護照記得看效期」',sys.includes('【通知】恭喜錄取姊妹校暑期交流（首爾）。行前說明會：'+x14.m+'/'+x14.d+'（三）12:20。')&&mom.includes('mom:機票多少？我轉給你')&&mom.includes('mom:護照記得看效期'),JSON.stringify([sys,mom]));
  // 3. 出發 → 整段（歡迎晚會、市場、報告、最後一晚選炸雞）→ 回來；出發那天麵店團、回來阿哲「伴手禮咧」、智恩 7/31
  G.day=D('2026-07-13'); G.weekday=wdOf(G.day); G.hour=7.9; run(7.9,8.1); check('3. 出發那天麵店團：阿哲「記得吃炸雞」、Alison「幫我看有沒有好看的筆」',txt('g:noodle_team').includes('zhe:記得吃炸雞')&&txt('g:noodle_team').includes('yu:幫我看有沒有好看的筆'));
  said=[]; cards=[]; picks=[1,0,0,1]; await VAC.outing(GM,OUT.get(G,'vac_C08@Y1')); let L=lines();
  check('3. 首爾整段：報到櫃台、智恩「這個，不辣。我試過。」→「妳中文好好。」、市場、分組報告、最後一晚「寫你們的炸雞。」；7/24 18:00、參加過',L.some(t=>t.includes('每個人的行李都比你小'))&&L.includes('智恩：這個，不辣。我試過。')&&L.includes('智恩：我學三年了。……可是你們說話太快。')&&L.some(t=>t.includes('賣了四十年'))&&L.includes('智恩：（笑）老師會生氣。')&&G.flags.C08_CHICKEN&&G.day===D('2026-07-24')&&G.hour===18&&VAC.state(G,'C08@Y1')==='done',JSON.stringify(L.slice(-4)));
  check('3. 字卡「首爾」',cards.some(c=>c[1]==='首爾'&&c[0].startsWith('7/18')),JSON.stringify(cards));
  run(18,20.2); check('3. 回來 20:00 阿哲「伴手禮咧」（第一次）',txt('g:noodle_team').includes('zhe:伴手禮咧'));
  G.day=D('2026-07-31'); G.hour=19.9; run(19.9,20.2); const J=txt('p:npc_jieun');
  check('3. 7/31 智恩「祐廷，你好。我是智恩。」「…因為我寫了炸雞。」（選了炸雞）',J.includes('npc_jieun:祐廷，你好。我是智恩。')&&J.includes('npc_jieun:我的中文報告，老師給我 A。……因為我寫了炸雞。'),JSON.stringify(J));
  // 4. C09：行事曆報名（第 3～5 週）→ 說明會、面試、行前訓練排好 → 第 10 週錄取（行前說明會 6/13）→ 整段 → 軟木板；回來是第二次＝「這次伴手禮咧」
  const w3=termDay('Y1S2',3,1); fresh(w3,9.1,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團');
  let toasts=[]; GM.toast=t=>toasts.push(t); STORY.phoneRules(GM); GM.toast=()=>{};
  check('4. 第 3 週週一：提醒行事曆可以報名；手機活動頁有「海外志工（暖陽服務隊）」的報名鈕',toasts.some(t=>t.includes('海外志工（暖陽服務隊）'))&&VAC.html(G).includes('data-vac="C09@Y1"'),JSON.stringify(toasts));
  VAC.signup(G,'C09@Y1','yes'); check('4. 報名：說明會（第 5 週週三 19:00）、面試（第 7 週週三）、行前訓練（6/13 10:00）、出發 7/27 都排了',OUT.get(G,'vac_C09@Y1_pre0').day===termDay('Y1S2',5,3)&&OUT.get(G,'vac_C09@Y1_pre1').day===termDay('Y1S2',7,3)&&OUT.get(G,'vac_C09@Y1_pre2').day===D('2026-06-13')&&OUT.get(G,'vac_C09@Y1').day===D('2026-07-27'));
  said=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C09@Y1_pre1')); L=lines(); check('4. 面試：家睿「為什麼想去？」→「想看看不一樣的地方。」→「…你可以嗎？」→ 祐廷「可以。」',L.includes('家睿：為什麼想去？')&&L.some(t=>t.includes('沒有冷氣。你可以嗎？'))&&L[L.length-1]==='祐廷：可以。',JSON.stringify(L));
  G.day=termDay('Y1S2',10,1); G.weekday=1; run(11.9,12.2); check('4. 第 10 週錄取通知：行前說明會 6/13（六）10:00',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='【通知】恭喜錄取海外志工（暖陽服務隊）。行前說明會：6/13（六）10:00。'));
  G.vac.reg['C05@Y1']='done'; PHONE.rec(G).sent=PHONE.rec(G).sent||{};
  G.day=D('2026-07-27'); G.hour=7; said=[]; picks=[1,1]; await VAC.outing(GM,OUT.get(G,'vac_C09@Y1')); L=lines();
  check('4. 柬埔寨整段：紅土路、Dara、停電「洗手歌不用電。」、火柴人的畫；回來第一個晚上「你把那張畫夾進書桌前的軟木板。」',L.some(t=>t.includes('最後一段是紅土路'))&&L.includes('小男孩：Dara。')&&L.includes('家睿：唱啊。洗手歌不用電。')&&L.some(t=>t.includes('拼錯了一個字母'))&&L[L.length-1]==='（你把那張畫夾進書桌前的軟木板。）'&&G.flags.C09_DARA,JSON.stringify(L.slice(-3)));
  run(18,20.2); check('4. 回來：阿哲沒有重複「伴手禮咧」的時候是第一次；這個存檔沒出過國＝「伴手禮咧」',txt('g:noodle_team').includes('zhe:伴手禮咧'));
  G.day=D('2026-08-20'); G.hour=20.9; run(20.9,21.2); check('4. 8/20 家睿「村長傳來的。他們還在唱。」',txt('p:npc_jiarui').includes('npc_jiarui:村長傳來的。他們還在唱。'));
  // 5. 第二、三次出國：「這次伴手禮咧」、貼圖
  { fresh(D('2026-07-24'),19.9,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); VAC.rec(G).reg['C08@Y1']='done'; run(19.9,20.2); VAC.rec(G).reg['C09@Y1']='done'; G.day=D('2026-08-05'); run(19.9,20.2); VAC.rec(G).reg['C05@Y1']='done'; G.day=D('2026-08-28'); run(19.9,20.2);
    const Z=txt('g:noodle_team').filter(t=>/伴手禮|貼圖：伸出手/.test(t)); check('5. 出國回來：第一次「伴手禮咧」、第二次「這次伴手禮咧」、第三次「（貼圖：伸出手）」',JSON.stringify(Z)===JSON.stringify(['zhe:伴手禮咧','zhe:這次伴手禮咧','zhe:（貼圖：伸出手）']),JSON.stringify(Z)); }
  // 6. C10：系辦（報名隔天）＝送了課程大綱；整段；大三上第 2 週學分採計
  { const w10=termDay('Y2S2',10,2); fresh(w10,10,'dorm',{}); G.stage='law'; VAC.signup(G,'C10@Y2','yes'); const q=OUT.get(G,'vac_C10@Y2_pre0');
    check('6. 加州：報名隔天 14:00 系辦（AA 10-24 9a033f397：避開系辦午休，原本 12:20）',!!q&&q.day===w10+1&&Math.abs(q.h-14)<0.01,JSON.stringify(q));
    said=[]; await VAC.outing(GM,q); check('6. 系辦「要採計的話，先把課程大綱給我…」→ C10_CREDIT_FILED',lines().includes('系辦助理：要採計的話，先把課程大綱給我，系上審過才算。出國前送，回來帶成績單。')&&G.flags.C10_CREDIT_FILED);
    G.day=w10+1; G.hour=12.1; run(12.1,12.3); check('6. 報名隔天 12:00 錄取通知（沒有說明會那一句）',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='【通知】恭喜錄取海外大學暑期課（加州）。'));
    G.day=D('2027-06-21'); G.hour=7; said=[]; picks=[1,0]; await VAC.outing(GM,OUT.get(G,'vac_C10@Y2')); const L2=lines();
    check('6. 加州整段：時間往回跳一天、Priya「Why did you switch?」、Take your time、海邊、期末考；7/31',L2.some(t=>t.includes('手機的時間往回跳了一天'))&&L2.includes('Priya：Really? Why did you switch?')&&L2.includes('教授：Take your time.')&&L2.some(t=>t.includes('太平洋的另一邊'))&&L2.some(t=>t.includes('考卷四題'))&&G.day===D('2027-07-31'),JSON.stringify(L2.slice(-3)));
    const p=OUT.get(G,'vac_C10@Y2_post'); check('6. 送過課程大綱：大三上第 2 週週一系辦學分採計',!!p&&p.day===termDay('Y3S1',2,1));
    said=[]; await VAC.outing(GM,p); check('6. 學分採計「…只能抵一半。」「還是不錯啦。」',lines().includes('系辦助理：還是不錯啦。')); }
  // 7. C11、C12：以安版
  { fresh(D('2027-01-17'),7,'dorm',{}); G.stage='law'; meet('heroine_01'); VAC.signup(G,'C11@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C11@Y2'));
    check('7. 東京：第一堂（好像通識課）＋以安「回頭用嘴型說：好冷。」、參訪五十年前的照片；1/30',lines().some(t=>t.includes('好像通識課'))&&lines().includes('（休息時間，以安坐在你斜前方，回頭用嘴型說：好冷。）')&&lines().some(t=>t.includes('五十年前的照片'))&&G.day===D('2027-01-30'));
    fresh(D('2027-08-09'),7,'dorm',{}); G.stage='law'; meet('heroine_01'); R('heroine_01',25,0,0); VAC.signup(G,'C12@Y2','yes'); said=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C12@Y2')); let L3=lines();
    check('7. 京都（以安 FAMILIAR）：「你也來了？」→「下課一起吃飯？」→「…我查過了。」、茶道轉了三次、結業「我幫你念一次。」',L3.includes('沈以安：你也來了？')&&L3.includes('沈以安：好。我知道一間便宜的，我查過了。')&&L3.some(t=>t.includes('你轉了三次'))&&L3.includes('沈以安：……我幫你念一次。'),JSON.stringify(L3));
    fresh(D('2027-08-09'),7,'dorm',{}); G.stage='law'; VAC.signup(G,'C12@Y2','yes'); said=[]; opts=[]; await VAC.outing(GM,OUT.get(G,'vac_C12@Y2')); L3=lines();
    check('7. 京都（不熟以安）：一般的第一堂（十二個人、八個國家），沒有以安、沒有選項',L3.some(t=>t.includes('來自八個國家'))&&!L3.some(t=>t.startsWith('沈以安'))&&!opts.length,JSON.stringify(L3)); }
  // 8. 衝突：首爾 7/13～24 撞日語課（7/14、7/16、7/21、7/23）
  { fresh(D('2026-06-01'),10,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C03@Y1']='yes'; const c=VAC.conflicts(G,VAC.inst('C08','Y1')); check('8. 首爾撞日語課 4 堂',c.length===4&&c.every(x=>x.key==='C03@Y1'),JSON.stringify(c)); }
  // 10. 出國期間的訊息（AA_242 第 6、8 節；BB_200）
  { fresh(D('2026-07-27'),7,'dorm',{dating_heroine_01:true,VAC_C09_INT:true}); G.stage='law'; meet('heroine_01'); meet('heroine_03'); R('heroine_03',25,0,0); VAC.signup(G,'C09@Y1','yes');
    said=[]; picks=[0,0]; await VAC.outing(GM,OUT.get(G,'vac_C09@Y1')); PHONE.tick(G);
    const A1=(G.msgs||[]).filter(m=>m.th==='p:heroine_01');
    check('10. 柬埔寨＋和以安交往：出發那天「到了傳一張照片。一張就好。」、輪播池、中間那則；回來那天（8/5）她在台中＝沒有「明天見。……」（AA_369 第 7 節第 7 題：限臺北；重逢走 AA_350 S5 那兩則）',A1.some(m=>m.text==='到了傳一張照片。一張就好。')&&A1.some(m=>m.text==='今天讀了四十頁。你那邊天氣好嗎？')&&A1.some(m=>m.text==='你那邊現在幾點？……吃飯了沒？')&&!A1.some(m=>m.text==='明天有空的話，一起吃飯。'),JSON.stringify(A1.map(m=>m.text)));   /* AA_369 第 7 節第 6 題：中間那則整句換 */
    const pool=A1.filter(m=>m.text==='今天讀了四十頁。你那邊天氣好嗎？')[0]; check('10. 柬埔寨只有晚上有訊號：她臺灣 21:30 傳的，臺灣 22:00 才收到＝手機上當地 21:00（出國途中遊戲時鐘是當地時間，柬埔寨比臺灣慢 1 小時；AA_478 第 7 節，2026-10-27 改：原本手機照臺灣時間 22:00）；兩個回覆「好。」「我也想妳。」',!!pool&&Math.abs(pool.h-21)<0.01&&JSON.stringify(pool.ask.opts.map(o=>o.t))===JSON.stringify(['好。','我也想妳。']),JSON.stringify(pool));
    const dk=A1.find(m=>m.text==='今天沒有回。……你那邊還好嗎？'); check('10. 停電那晚（8/2）她「今天沒有回。……」隔天 8/3 早上臺灣 8:00 才收到＝手機上當地 7:00（AA_478 第 7 節）；回「昨天停電，整晚沒電。」→「好。……下次停電，也先跟我說。」',!!dk&&dk.day===D('2026-08-03')&&Math.abs(dk.h-7)<0.01&&dk.ask.opts[0].t==='昨天停電，整晚沒電。'&&dk.ask.opts[0].say[0].text==='好。……下次停電，也先跟我說。',JSON.stringify(dk));
    check('10. 7/30 VA-11「我媽在後面」人在柬埔寨不傳；停電那晚其他訊息也是隔天早上才到（8/2 沒有收到任何一則）',!A1.some(m=>m.text.includes('我媽在後面'))&&!(G.msgs||[]).some(m=>m.day===D('2026-08-02')&&m.h>=21));
    const Y=(G.msgs||[]).filter(m=>m.th==='p:heroine_03').map(m=>m.text); check('10. 語彤（朋友、FAMILIAR）整趟一則「📷（麵店今天的長桌）」',JSON.stringify(Y)===JSON.stringify(['📷（麵店今天的長桌）']),JSON.stringify(Y)); }
  { fresh(D('2027-06-21'),7,'dorm',{dating_kexin:true,dating_classmate_peishan:true}); G.stage='law'; VAC.signup(G,'C10@Y2','yes'); said=[]; picks=[0,0]; await VAC.outing(GM,OUT.get(G,'vac_C10@Y2')); PHONE.tick(G); const L=lines();
    check('10. 加州＋可昕：第一個週日 10:00 視訊三句（「你那邊亮亮的。」…「下禮拜同一個時間。」）',L.includes('杜可昕：你那邊亮亮的。')&&L.includes('杜可昕：好，我要去睡了。下禮拜同一個時間。'),JSON.stringify(L.filter(t=>t.startsWith('杜可昕'))));
    const K=(G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text); check('10. 加州第 3 週可昕「我算了一下 還有二十一天」「不是在算 是剛好看到」（一次）',K.filter(t=>t==='我算了一下 還有二十一天').length===1&&K.includes('不是在算 是剛好看到'));
    check('10. 加州六週：池子用完第二圈只用前半（第 9 天起只會出現前四則）',K.filter(t=>t==='晚安 我先睡').length===1&&K.filter(t=>t==='你那邊現在幾點').length>=3,JSON.stringify([K.filter(t=>t==='晚安 我先睡').length,K.filter(t=>t==='你那邊現在幾點').length]));   /* AA_369 L3 改字；第 7 節第 6 題整句換「你那邊現在幾點」*/
    check('10. 沛珊重考消失期（2027-06）：出國的訊息池不傳；交往中只有她每晚那一則（AA_276 第 4 節，使用者 23:5x 取代原本的「交往中也不傳」）',(G.msgs||[]).filter(m=>m.th==='p:classmate_peishan').every(m=>STORY.PS_KEEP_NIGHT.includes(m.text)),JSON.stringify((G.msgs||[]).filter(m=>m.th==='p:classmate_peishan').map(m=>m.text).slice(0,4))); }
  { fresh(D('2026-07-13'),8,'dorm',{dating_heroine_05:true}); G.stage='law'; VAC.signup(G,'C08@Y1','yes'); said=[]; picks=[0,0,0,0]; await VAC.outing(GM,OUT.get(G,'vac_C08@Y1')); PHONE.tick(G);
    const S5=(G.msgs||[]).filter(m=>m.th==='p:heroine_05'&&m.ask); check('10. 學姊兩天一則（首爾 12 天：池子 4～5 則）',S5.length>=4&&S5.length<=5,String(S5.length));
    check('10. 回來記 BACK_FROM_C08（3D 第一次遇到的招呼用）',G.flags.BACK_FROM_C08===D('2026-07-24')); }
  // 11a. 寒暑假可昕、沛珊在老家：回國當天 21:00 只傳私訊、不排臺北見面（AA_278 第 2 節第 1 點，6bcb154b）
  { fresh(D('2026-07-24'),17.9,'dorm',{dating_kexin:true,dating_classmate_peishan:true}); G.stage='law'; meet('kexin'); meet('classmate_peishan'); VAC.rec(G).reg['C08@Y1']='done'; run(17.9,21.2);
    const K=txt('p:kexin'), P=txt('p:classmate_peishan');
    check('11a. 可昕在高雄：「回來了？……我在高雄。要來的話，先跟我說幾點的車。」、沒有臺北的重逢',K.includes('kexin:回來了？……我在高雄。要來的話，先跟我說幾點的車。')&&!OUT.get(G,'vac_C08@Y1_re_kexin'),JSON.stringify(K));
    check('11a. 沛珊在台中：「歡迎回來！我在台中，開學前才上去。……好想聽你講那邊的事。」、沒有臺北的重逢',P.includes('classmate_peishan:歡迎回來！我在台中，開學前才上去。……好想聽你講那邊的事。')&&!OUT.get(G,'vac_C08@Y1_re_classmate_peishan'),JSON.stringify(P)); }
  // 11a. AA_349 K7：沛珊放榜以後（大三起）開學是回台南、不是「上去」
  { const I=VAC.inst('T03','Y3'); fresh(I.to,17.9,'dorm',{dating_classmate_peishan:true,PS_BACK_FIRST:1}); G.stage='law'; meet('classmate_peishan'); VAC.rec(G).reg['T03@Y3']='done'; run(17.9,21.2);
    const P=txt('p:classmate_peishan');
    check('11a. K7 大三暑假（曼谷回來，沛珊在台中）：「歡迎回來！我在台中，開學前才回台南。……好想聽你講那邊的事。」（不是「開學前才上去」）',P.includes('classmate_peishan:歡迎回來！我在台中，開學前才回台南。……好想聽你講那邊的事。')&&!P.some(t=>/開學前才上去/.test(t)),JSON.stringify([CALENDAR.dateOf(I.to),P])); }
  // 11. 重逢（AA_242 8-6 79adc9f2）、子晴第二則、C10 成績、Priya
  { fresh(D('2026-07-24'),17.9,'dorm',{dating_heroine_01:true,dating_heroine_02:true}); G.stage='law'; meet('heroine_01'); meet('heroine_02'); VAC.rec(G).reg['C08@Y1']='done'; run(17.9,21.2);
    const A=txt('p:heroine_01'), Z=txt('p:heroine_02'), q0=OUT.get(G,'vac_C08@Y1_re_heroine_01');
    check('11. AA_369 M3：以安 7/25 起回台中（重逢那天人在老家）＝不約總圖、不排重逢（7/24 當天不傳；第 7 節第 2 題那句 7/25 她回台中那天才傳，見 tests/aa369_hol_unit.js）',!A.includes('heroine_01:明天下午三點，總圖門口。')&&!q0,JSON.stringify([A,q0]));
    check('11. 芷若大一暑假在台中：回國當天「回來了？……我 26 號回臺北。」，還沒約',Z.includes('heroine_02:回來了？……我 26 號回臺北。')&&!OUT.get(G,'vac_C08@Y1_re_heroine_02'),JSON.stringify(Z));
    G.day=D('2026-08-25'); run(20.9,21.2); const q2=OUT.get(G,'vac_C08@Y1_re_heroine_02'); check('11. 芷若 8/25 21:00「明天我十點下班。」→ 8/26 22:00 Café 重逢（AA_373 第 6 節第 9 題：她晚班到 22:00）',txt('p:heroine_02').includes('heroine_02:明天我十點下班。')&&!!q2&&q2.day===D('2026-08-26')&&q2.h===22);
    VAC.missed(GM,q2); G.day=D('2026-08-27'); run(11.9,12.2); check('11. 重逢沒到：隔天 12:00 芷若「昨天的那杯，我自己喝了。」',txt('p:heroine_02').includes('heroine_02:昨天的那杯，我自己喝了。'));
    /* 以安在臺北的那一趟（日本五天 8/28 回來，她 8/8 就回臺北了）：回國當天約、隔天 15:00 總圖門口 */
    fresh(D('2026-08-28'),17.9,'dorm',{dating_heroine_01:true}); G.stage='law'; meet('heroine_01'); VAC.rec(G).reg['C05@Y1']='done'; run(17.9,21.2);
    const A2=txt('p:heroine_01'), q=OUT.get(G,'vac_C05@Y1_re_heroine_01');
    check('11. 回國當天 21:00 以安「明天下午三點，總圖門口。」「時差調不過來的話，四點也可以。」→ 隔天 15:00 排重逢',A2.includes('heroine_01:明天下午三點，總圖門口。')&&A2.includes('heroine_01:時差調不過來的話，四點也可以。')&&!!q&&q.day===D('2026-08-29')&&q.h===15,JSON.stringify([A2,q]));
    G.day=D('2026-08-29'); G.hour=15; said=[]; await VAC.outing(GM,q); check('11. 以安重逢：「你回來了。」「……行程表上寫你今天會到。我沒有算錯。」；REUNION_C05',lines().includes('沈以安：你回來了。')&&lines().includes('沈以安：……行程表上寫你今天會到。我沒有算錯。')&&G.flags.REUNION_C05===true); }
  { fresh(D('2027-08-09'),7,'dorm',{dating_heroine_04:true}); G.stage='law'; VAC.signup(G,'C12@Y2','yes'); said=[]; picks=[0]; const Q=OUT.get(G,'vac_C12@Y2');
    // 只跑到第二天：回第一則 → 23:10 第二則；第三天不回 → 沒有第二則
    VAC.tripMsgs(G,VAC.inst('C12','Y2')); G.day=D('2027-08-11'); G.hour=0.5; PHONE.tick(G); G.hour=0.7; PHONE.tick(G); const m1=(G.msgs||[]).find(m=>m.th==='p:heroine_04'&&m.ask&&m.day===D('2027-08-11'));
    PHONE.answer(G,m1.ask.id,0); G.hour=9; STORY.phoneRules(GM); G.hour=23.2; STORY.phoneRules(GM); PHONE.tick(G);
    const two=(G.msgs||[]).filter(m=>m.th==='p:heroine_04'&&m.day===D('2027-08-11')&&m.h>23);
    G.day=D('2027-08-12'); G.hour=0.7; PHONE.tick(G); G.hour=18.5; STORY.phoneRules(GM); G.hour=23.3; STORY.phoneRules(GM); PHONE.tick(G); const none=(G.msgs||[]).filter(m=>m.th==='p:heroine_04'&&m.day===D('2027-08-12')&&m.h>23);
    check('11. 子晴：00:40 那則 18:00 以前回了＝23:10 第二則；沒回＝只有一則',!!m1&&two.length>=1&&none.length===0,JSON.stringify([two.map(m=>m.text),none.map(m=>m.text)])); }
  { fresh(D('2027-08-10'),8.9,'dorm',{C10_STUDY:true}); G.stage='law'; VAC.rec(G).reg['C10@Y2']='done'; run(8.9,9.2); G.hour=21.9; run(21.9,22.2);
    const sys=(G.msgs||[]).filter(m=>m.th==='sys').map(m=>m.text), P=(G.msgs||[]).filter(m=>m.th==='p:npc_priya');
    check('11. C10 成績 8/10：學校的信「Final grades are now available.」、A 版旁白、截圖傳家人群組、媽媽「好棒！」「那邊吃得飽嗎」',sys.includes('（學校的信）Final grades are now available.')&&sys.includes('（兩門課都是 A。你截了圖，傳到家人群組。）')&&txt('g:home').includes('mom:好棒！')&&txt('g:home').includes('mom:那邊吃得飽嗎'),JSON.stringify(sys));
    check('11. Priya 8/10 22:00「Did you get your grades?」回覆只有「A.」',P.some(m=>m.text==='Did you get your grades?'&&m.ask&&m.ask.opts.length===1&&m.ask.opts[0].t==='A.'));
    G.day=D('2027-09-14'); run(20.9,21.2); check('11. Priya 2027-09-14 21:00「Did your school count the credits?」「One of them.」／「Both.」',(G.msgs||[]).some(m=>m.th==='p:npc_priya'&&m.text==='Did your school count the credits?'&&m.ask.opts.map(o=>o.t).join()==='One of them.,Both.'));
    fresh(D('2027-08-10'),8.9,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C10@Y2']='done'; run(8.9,9.2); check('11. B＋版：旁白一門 A−、一門 B＋，不傳群組',(G.msgs||[]).some(m=>m.th==='sys'&&m.text.startsWith('（一門 A−，一門 B＋。'))&&!txt('g:home').length); }
  // 12. 回來後第一次在 3D 遇到朋友（AA_242 8-7）
  { fresh(D('2026-07-26'),12,'campus',{BACK_FROM_C08:D('2026-07-24')}); G.stage='law'; meet('yu'); R('yu',30,10,5); meet('heroine_01'); R('heroine_01',30,10,5); G.flags.dating_heroine_01=true;
    said=[]; const a=await VAC.backGreet(GM,{name:'Alison',charId:'yu'},'yu'); const b=await VAC.backGreet(GM,{name:'Alison',charId:'yu'},'yu'); const c=await VAC.backGreet(GM,{name:'以安',charId:'heroine_01'},'heroine_01');
    check('12. Alison（FAMILIAR）第一次遇到「你回來了！伴手禮咧！」、只一次；交往中的以安沒有（她有重逢）',a&&!b&&!c&&lines().join('|')==='Alison：你回來了！伴手禮咧！',JSON.stringify(lines()));
    G.day=D('2026-08-30'); delete VAC.rec(G).backSeen; check('12. 超過 30 天不說',!(await VAC.backGreet(GM,{name:'Alison',charId:'yu'},'yu')));
    check('12. talkCharacter 在閒聊前呼叫 VAC.backGreet',/VAC\.backGreet\(GM,who,id\)/.test(require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8'))); }
  // 13. 朋友揪團（AA_244 3-2、BB_200 第 8 節）：大二方奕廷日本的山、大三子晴曼谷
  { fresh(D('2027-07-10'),20.9,'dorm',{}); G.stage='law'; meet('npc_fangyt'); R('npc_fangyt',30,10,5); PHONE.join(G,'noodle_team','麵店團'); run(20.9,21.2);
    const F=txt('p:npc_fangyt'); check('13. 7/10 21:00 方奕廷「八月一號到四號，去日本爬山。」…「機票我查過了，下禮拜會漲。」、三個回覆',F.includes('npc_fangyt:八月一號到四號，去日本爬山。')&&F.includes('npc_fangyt:機票我查過了，下禮拜會漲。')&&(G.msgs||[]).find(m=>m.ask&&m.ask.id==='vac_ask_T02@Y2').ask.opts.length===3,JSON.stringify(F));
    PHONE.answer(G,'vac_ask_T02@Y2',0); STORY.phoneRules(GM); check('13. 去。→「好。鞋子要能走八個小時的。」、媽媽「機票多少？我轉給你。」、8/1 05:00 出發',txt('p:npc_fangyt').includes('npc_fangyt:好。鞋子要能走八個小時的。')&&!!OUT.get(G,'vac_T02@Y2')&&OUT.get(G,'vac_T02@Y2').day===D('2027-08-01'));
    G.day=D('2027-08-01'); G.hour=5; said=[]; await VAC.outing(GM,OUT.get(G,'vac_T02@Y2')); const L=lines();
    check('13. 日本的山：機場水壺、「這棵，台灣沒有。」、山屋「明天四點起來，看日出。」、溫泉街「這座山還有一條路沒走。」；8/4',L.some(t=>t.includes('已經裝滿了'))&&L.some(t=>t.endsWith('這棵，台灣沒有。'))&&L.some(t=>t.endsWith('明天四點起來，看日出。'))&&L.some(t=>t.endsWith('這座山還有一條路沒走。'))&&G.day===D('2027-08-04'),JSON.stringify(L)); }
  { fresh(D('2027-07-10'),20.9,'dorm',{}); G.stage='law'; meet('npc_fangyt'); R('npc_fangyt',10,0,0); run(20.9,21.2); check('13. 和方奕廷不到 FAMILIAR：沒有邀約',!txt('p:npc_fangyt').length); }
  { fresh(D('2028-06-10'),20.9,'dorm',{EXCHANGE_ROUTE:'US'}); G.stage='law'; meet('heroine_04'); R('heroine_04',30,10,5); run(20.9,21.2); const Z=txt('p:heroine_04');
    check('13. 大三 6/10 子晴「欸 七月三號到七號 曼谷」「有個獨立遊戲展 我想去看」「阿凱也去」（美國路線 7 月初還在臺灣）',Z.includes('heroine_04:欸 七月三號到七號 曼谷')&&Z.includes('heroine_04:阿凱也去'),JSON.stringify(Z));
    fresh(D('2028-06-10'),20.9,'dorm',{EXCHANGE_ROUTE:'JP'}); G.stage='law'; meet('heroine_04'); R('heroine_04',30,10,5); run(20.9,21.2); const noAsk=!txt('p:heroine_04').length; G.day=D('2028-07-05'); run(20.9,21.2); G.day=D('2028-07-07'); run(20.9,21.2);
    const J=txt('p:heroine_04'); check('13. 日本路線（人在日本）：沒有邀約；7/5 子晴「📷（遊戲展的入口）」「你不在 好可惜」；沒有「沒去」那則',noAsk&&J.includes('heroine_04:你不在 好可惜')&&!J.includes('heroine_04:阿凱吃了三份'),JSON.stringify(J)); }
  // 14. 出國旅遊（C13，自己排；AA_244 第 2 節、3-1）
  { fresh(D('2026-07-01'),10,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); check('14. 暑假：手機活動頁有「安排」出國旅遊',VAC.html(G).includes('data-vac13="1"'));
    picks=['韓國','自己去','5 天',0]; said=[]; opts=[]; const ok=await VAC.plan13(GM); PHONE.tick(G); const r=VAC.rec(G).t13[0], q=OUT.get(G,'vac_t13_1');
    check('14. 自己排：首爾 5 天、媽媽「要去哪？」「機票我買給你，到那邊自己顧好」、排好出遊',ok&&r.dest==='kr'&&r.to-r.from===4&&!!q&&q.day===r.from&&txt('g:home').includes('mom:機票我買給你，到那邊自己顧好'),JSON.stringify([r,opts[0]]));
    G.day=r.from; G.hour=8; said=[]; await VAC.outing(GM,q); const L=lines(); run(18,20.2);
    check('14. 首爾三場：機場快線的阿姨、炸物攤、漢江邊的炸雞；回來阿哲「伴手禮咧」',L.some(t=>t.includes('機場快線上'))&&L.some(t=>t.includes('用手比了一個「吃」'))&&L.some(t=>t.includes('漢江邊'))&&txt('g:noodle_team').includes('zhe:伴手禮咧'),JSON.stringify(L)); }
  { fresh(D('2026-07-01'),10,'dorm',{dating_heroine_01:true}); G.stage='law'; meet('heroine_01'); G.flags.romance={heroine_01:{status:'dating',history:[{ev:'start',day:D('2026-07-01')-10}]}};
    picks=['泰國','和沈以安','3 天',0]; said=[]; await VAC.plan13(GM); check('14. 交往未滿 28 天：「出國……我們先在臺北多走幾個地方。好不好？」、沒有排',lines().some(t=>t.endsWith('出國……我們先在臺北多走幾個地方。好不好？'))&&!(VAC.rec(G).t13||[]).length,JSON.stringify(lines()));
    G.flags.romance.heroine_01.history[0].day=D('2026-07-01')-40; DATE.log(G,'heroine_01').count=2; picks=['歐洲','和沈以安','7 天',0]; said=[]; await VAC.plan13(GM);
    check('14. 歐洲、未滿 90 天：「歐洲……我想去。可是要排十天以上，我們下次。」',lines().some(t=>t.endsWith('我們下次。'))&&!(VAC.rec(G).t13||[]).length,JSON.stringify(lines()));
    picks=['泰國','和沈以安','3 天',0]; said=[]; await VAC.plan13(GM); const r=VAC.rec(G).t13[0];
    check('14. 滿 28 天、2 次約會：「要不要一起出國？」→「哪裡？……給我三天，我排一份行程給你看。」、排好',lines().some(t=>t.endsWith('要不要一起出國？'))&&lines().some(t=>t.endsWith('給我三天，我排一份行程給你看。'))&&!!r&&r.with==='heroine_01');
    const c0=DATE.log(G,'heroine_01').count, n0=SOCIAL.rel('heroine_01').npcRom||0; G.day=r.from; G.hour=8; said=[]; await VAC.outing(GM,OUT.get(G,'vac_t13_1')); const L=lines();
    check('14. 和以安：最後一晚夜市果汁＋「行程表上的都走完了。……」、雙床房「（燈關了。）」；算一次正式約會、她的戀愛 +5',L.some(t=>t.includes('顏色最奇怪的那杯'))&&L.some(t=>t.endsWith('多出來的那一個小時，我沒寫。'))&&L.includes('（燈關了。）')&&DATE.log(G,'heroine_01').count===c0+1&&(SOCIAL.rel('heroine_01').npcRom||0)===n0+5,JSON.stringify(L));
    check('14. 一起去的以安不傳出國期間的訊息',!(G.msgs||[]).some(m=>m.th==='p:heroine_01'&&/^vac_tm_/.test(m.tag||''))); }
  { fresh(D('2026-03-01'),10,'dorm',{}); G.stage='law'; check('14. 學期中第 10 週以前沒有「安排」',!VAC.html(G).includes('data-vac13')); }
  // 15. 每年重開（AA_264 77c7f3db）
  { const w12=termDay('Y2S2',12,1); fresh(w12,20.9,'dorm',{}); G.stage='law'; PHONE.join(G,'law_class','法律系（全班）'); VAC.rec(G).reg['C02@Y1']='done'; run(20.9,21.2); const T2=txt('g:law_class');
    check('15. C02 第二年：同一則系學會公告＋「去年當過隊輔的，可以直接報小隊長。」，沒有芯慈、沛珊的回覆、沒有選項；行事曆可以報名',T2.some(t=>t.includes('【法律生活營 隊輔招募】'))&&T2.includes('sysclub:去年當過隊輔的，可以直接報小隊長。')&&!T2.some(t=>t.startsWith('classmate_xinci'))&&VAC.html(G).includes('data-vac="C02@Y2"'),JSON.stringify(T2));
    VAC.signup(G,'C02@Y2','yes'); check('15. 第二次參加：nth＝2',VAC.nth(G,VAC.inst('C02','Y2'))===2);
    said=[]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y2_prep')); check('15. 籌備會：日誌「籌備會。流程表上的紅色比去年少一點。」',lines().join('|')==='籌備會。流程表上的紅色比去年少一點。',JSON.stringify(lines()));
    G.day=D('2027-07-01'); G.hour=8.5; said=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y2')); const L=lines();
    check('15. 小隊長：第一天「名牌這次多了一行字：「小隊長」」→「第一場我帶，你在旁邊看。」、CAMP_LEADER；晚會、最後一天是日誌',L.some(t=>t.includes('「小隊長」'))&&L.includes('隊輔學弟：好。')&&G.flags.CAMP_LEADER===true&&L.includes('晚會。這次換你站在旁邊數人頭。')&&L.includes('最後一天。卡片比去年多兩張。')&&!L.some(t=>t.startsWith('沛珊')),JSON.stringify(L)); }
  { fresh(D('2027-07-01'),8.5,'dorm',{}); G.stage='law'; VAC.signup(G,'C02@Y2','yes'); said=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y2')); const L=lines();
    check('15. 大二才第一次參加（換人版）：報到是日誌、晚會照演（選項二「……學長你也還在想喔？」）、最後一天只有卡片那句；沒有芯慈、沛珊',L[0]==='報到。有個學員拖著兩個行李箱，你幫她搬上樓。'&&L.includes('學員：……學長你也還在想喔？')&&L.some(t=>t.includes('謝謝學長第二天下午沒有放棄我們這組'))&&!L.some(t=>/^(沛珊|吳芯慈|芯慈)/.test(t)),JSON.stringify(L)); }
  { fresh(D('2028-07-01'),8.5,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C02@Y1']='done'; VAC.rec(G).reg['C02@Y2']='done'; VAC.signup(G,'C02@Y3','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C02@Y3')); const L=lines();
    check('15. 第三次：三天都是「第三次以後」的日誌',JSON.stringify(L)===JSON.stringify(['報到。你知道充電線要多帶三條。','晚會。學員問法律系難不難，你這次回答得比較快。','最後一天。你把卡片收進放去年那疊卡片的信封。']),JSON.stringify(L)); }
  { const w5=termDay('Y2S2',5,1); fresh(w5,11.9,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C09@Y1']='done'; run(11.9,12.2); const J=txt('p:npc_jiarui');
    check('15. 家睿隔年第 5 週週一 12:00「今年服務隊還缺兩個人。」「你要不要再來一次？不勉強。」',J.includes('npc_jiarui:今年服務隊還缺兩個人。')&&J.includes('npc_jiarui:你要不要再來一次？不勉強。'),JSON.stringify(J));
    VAC.signup(G,'C09@Y2','yes'); check('15. C09 第二次：不排說明會、面試（家睿直接邀）；行前訓練照排',!OUT.get(G,'vac_C09@Y2_pre0')&&!OUT.get(G,'vac_C09@Y2_pre1')&&!!OUT.get(G,'vac_C09@Y2_pre2'));
    G.day=termDay('Y2S2',10,1); run(11.9,12.2); check('15. 第二次不用面試也錄取',(G.msgs||[]).some(m=>m.th==='sys'&&m.text.startsWith('【通知】恭喜錄取海外志工'))&&VAC.state(G,'C09@Y2')==='yes');
    said=[]; await VAC.outing(GM,OUT.get(G,'vac_C09@Y2_pre2')); check('15. 行前訓練：日誌「行前訓練。家睿讓你帶新隊員折紙。」',lines().join('|')==='行前訓練。家睿讓你帶新隊員折紙。'); }
  { fresh(D('2028-06-01'),10,'dorm',{EXCHANGE_ROUTE:'JP'}); G.stage='law'; check('15. 日本路線大三暑假（在日本到 8/5）：首爾 7/13 不能報；京都 8/9 可以',VAC.blocked(G,VAC.inst('C08','Y3'))&&!VAC.blocked(G,VAC.inst('C12','Y3')));
    G.flags.EXCHANGE_ROUTE='US'; check('15. 美國路線（7/25 退宿、8/2 出發）：京都 8/9 不能報',VAC.blocked(G,VAC.inst('C12','Y3'))); }
  // 16. 同一個目的地第二次（AA_264 C05／C13；阿凱的日本團算一次）
  { fresh(D('2027-07-01'),10,'dorm',{}); G.stage='law'; VAC.rec(G).reg['C05@Y1']='done'; picks=['日本','自己去','3 天',0]; await VAC.plan13(GM); const r=VAC.rec(G).t13[0]; G.day=r.from; G.hour=8; said=[]; await VAC.outing(GM,OUT.get(G,'vac_t13_1')); const L=lines();
    check('16. 日本第二次：機場「這次你記得先把行動電源拿出來。」、「第二次來。你沒看地圖就找到了住的地方。」、最後一晚伴手禮那句',L.includes('機場。這次你記得先把行動電源拿出來。')&&L.includes('第二次來。你沒看地圖就找到了住的地方。')&&L.includes('最後一晚。伴手禮買得比上次少，因為知道誰會吃。')&&!L.some(t=>t.includes('電路板')),JSON.stringify(L)); }
  // 17. C01 麵店團海邊每年寒假（AA_264）：大一去過＝大二「今年還去海邊嗎」「一樣禮拜一」→ 日誌；大三「海邊」「照舊」
  { const d=VAC.c01Day('Y2'), da=VAC.c01Ask(d), K=x=>{ const t=CALENDAR.dateOf(x); return t.m+'/'+t.d; };
    check('17. 揪人的日子（AA_264 第 5 節第 2 點）：前一個週五，週五是 12/31、1/1 改前一個週三——大二 12/30、大三 12/29、大四 12/29（週五）',K(da)==='12/30'&&CALENDAR.dateOf(da).wd%7===3&&K(VAC.c01Ask(VAC.c01Day('Y3')))==='12/29'&&K(VAC.c01Ask(VAC.c01Day('Y4')))==='12/29'&&CALENDAR.dateOf(VAC.c01Ask(VAC.c01Day('Y4'))).wd%7===5,[K(da),K(VAC.c01Ask(VAC.c01Day('Y3'))),K(VAC.c01Ask(VAC.c01Day('Y4')))].join(','));
    fresh(da,21,'dorm',{VA03_BEACH:'went'}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21,21.2); const Z=txt('g:noodle_team');
    check('17. 大二寒假第二週週一（1/4）前的週三 21:05：阿哲「今年還去海邊嗎」「一樣禮拜一」',Z.includes('zhe:今年還去海邊嗎')&&Z.includes('zhe:一樣禮拜一')&&CALENDAR.dateOf(d).wd%7===1&&K(d)==='1/4',JSON.stringify(Z));
    PHONE.answer(G,'vac_c01ask_Y2',0); STORY.phoneRules(GM); const q=OUT.get(G,'vac_c01_Y2'); check('17. 我去＝那個週一 08:50 臺北車站，標題「禮拜一 08:50 臺北車站集合」',!!q&&q.day===d&&q.title==='海邊一日遊（禮拜一 08:50 臺北車站集合）',q&&q.title);
    G.day=d; G.hour=8.9; said=[]; await VAC.outing(GM,q); G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G);
    check('17. 阿哲海邊那天 21:00 群組「明天回高雄 回來帶烏魚子」（AA_264 第 5 節第 1 點；不在 1/1；大二的字 AA_456 1-4 換）',txt('g:noodle_team').includes('zhe:明天回高雄 回來帶烏魚子')&&PHONE.sent(G,'nye_y2_zhe'));
    check('17. 第二次的日誌三行（AA_533 4-5：第一句後面阿哲一句）',JSON.stringify(lines())===JSON.stringify(['第二次去海邊。阿哲說他記得帶防曬，結果帶的是乳液。','阿哲：防曬跟乳液，差很多嗎？','浪比去年大。柏翰坐在離海最遠的地方看書。','回程的車上，一半的人睡著了。']),JSON.stringify(lines()));
    const d3=VAC.c01Day('Y3'); G.day=VAC.c01Ask(d3); G.hour=21; run(21,21.2); check('17. 大三：「海邊」「照舊」',txt('g:noodle_team').includes('zhe:海邊')&&txt('g:noodle_team').includes('zhe:照舊'));
    { const d4=VAC.c01Day('Y4'); G.day=VAC.c01Ask(d4); G.hour=21; run(21,21.2); const Z4=txt('g:noodle_team');
      check('17. 大四是週二（1/2）：第三次以後「海邊」「照舊 禮拜二」',CALENDAR.dateOf(d4).wd%7===2&&Z4.includes('zhe:照舊 禮拜二'),JSON.stringify(Z4.slice(-3)));
      PHONE.answer(G,'vac_c01ask_Y4',0); STORY.phoneRules(GM); const q4=OUT.get(G,'vac_c01_Y4'); check('17. 大四集合的標題「禮拜二 08:50 臺北車站集合」',!!q4&&q4.day===d4&&q4.title==='海邊一日遊（禮拜二 08:50 臺北車站集合）',q4&&q4.title); }
    { const d4=VAC.c01Day('Y4'); fresh(VAC.c01Ask(d4),21,'dorm',{VA03_BEACH:'went'}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21,21.2);
      check('17. 大四第二次：「今年還去海邊嗎」「禮拜一元旦 改禮拜二」',txt('g:noodle_team').includes('zhe:禮拜一元旦 改禮拜二')); }
    // 17c. AA_446 第 3 節：沒去海邊的那一則照年份換（大二 Alison 兩句＋芯慈一句）
    { const d2=VAC.c01Day('Y2'); fresh(VAC.c01Ask(d2),21.2,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); STORY.phoneRules(GM); PHONE.tick(G); G.day=d2; G.hour=18.2; STORY.phoneRules(GM); PHONE.tick(G); const N=txt('g:noodle_team');
      check('17c. 大二沒去：「📷（大家站在防波堤上，頭髮都被吹歪）」「今年的風比去年大！！」、芯慈「我在家看照片就好。」（AA_446 第 3 節）',N.includes('yu:📷（大家站在防波堤上，頭髮都被吹歪）')&&N.includes('yu:今年的風比去年大！！')&&N.includes('classmate_xinci:我在家看照片就好。')&&!N.includes('yu:好冷但好好玩'),JSON.stringify(N.slice(-4))); }
    // 17b. 大二以後才第一次去（AA_264 第 4 節 e01ee2a8）：照 AA_204 第 3 節演整段，換三句
    fresh(da,21,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); SOCIAL.remember('heroine_01','FIRST_MET',''); Object.assign(SOCIAL.rel('heroine_01'),{fam:25}); run(21,21.8); const Z1=txt('g:noodle_team').filter(t=>!/人擠人|人超多|明天回高雄/.test(t));   /* 大二 1/1 也有跨年的群組訊息（AA_210）*/
    check('17b. 大一沒去過：大二揪人那天 21:05 照 AA_204 3-1 揪，阿哲那句換「禮拜一去海邊？過幾天我就回高雄了」；以安 FAMILIAR 在臺北才回（大二的回覆 AA_456 1-3 照年份換：柏翰「一樣九點十分那班。」、以安「去年那家熱豆漿還在嗎？」）',Z1[0]==='zhe:禮拜一去海邊？過幾天我就回高雄了'&&Z1.includes('classmate_bohan:一樣九點十分那班。')&&Z1.includes('heroine_01:去年那家熱豆漿還在嗎？')&&!Z1.includes('zhe:今年還去海邊嗎')&&G.flags.VA03_AN===true,JSON.stringify(Z1));
    PHONE.answer(G,'vac_c01first_Y2',0); STORY.phoneRules(GM); const q1=OUT.get(G,'vac_c01_Y2');
    check('17b. 我去＝那個禮拜一 08:50 臺北車站，演第一次的整段（ev_va03_beach）',!!q1&&q1.day===d&&q1.ev==='ev_va03_beach'&&Math.abs(q1.h-(8+50/60))<0.01,JSON.stringify(q1));
    { G.day=d; const E1=STORY_EVENTS.find(e=>e.id==='ev_va03_beach'), first=E1.dialogue.filter(l=>l.text&&/風很大/.test(l.text)&&(!l.if||EVENTS.cond(l.if))&&(!l.unless||!EVENTS.cond(l.unless))).map(l=>l.text);
      check('17b. 第一句旁白每年都是「（放寒假的第二個禮拜。……）」（AA_264 第 5 節第 4 點）',JSON.stringify(first)==='["（放寒假的第二個禮拜。下火車的時候，天陰陰的，風很大。）"]',JSON.stringify(first)); }
    G.flags.VA03_BEACH='went'; G.hour=20.1; STORY.phoneRules(GM); PHONE.tick(G);
    check('17b. 去了：當晚 Alison「📷（海邊的合照）」「五張裡最好的一張」',txt('g:noodle_team').includes('yu:五張裡最好的一張'));
    { const d3=VAC.c01Day('Y3'); G.day=VAC.c01Ask(d3); G.hour=21; run(21,21.2); check('17b. 隔年算第二次：「今年還去海邊嗎」',txt('g:noodle_team').includes('zhe:今年還去海邊嗎')); }
    { const d4=VAC.c01Day('Y4'); fresh(VAC.c01Ask(d4),21,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21,21.8);
      check('17b. 大四才第一次去：阿哲「禮拜二去海邊？過幾天我就回高雄了」',txt('g:noodle_team').includes('zhe:禮拜二去海邊？過幾天我就回高雄了')); }
    fresh(da,21,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21,21.8);
    check('17b. 和以安不熟：她不回、VA03_AN false',!txt('g:noodle_team').some(t=>t.startsWith('heroine_01:'))&&G.flags.VA03_AN===false); }
  // 9. 存讀檔
  { VAC.rec(G).reg['C03@Y1']='yes'; const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('9. 存讀檔：報名狀態留著',VAC.state(G,'C03@Y1')==='yes'); }
  { const C0=global.CLS; const mk=L=>({dayItems:()=>L}); const p={h:14,afterClass:true};
    global.CLS=mk([]); const a=VAC.freeAfterClass(G,G.day,p); global.CLS=mk([{t0:13+20/60,t1:15+10/60}]); const b=VAC.freeAfterClass(G,G.day,p); global.CLS=mk([{t0:15.5,t1:17.2}]); const c=VAC.freeAfterClass(G,G.day,p); global.CLS=mk([{t0:13+20/60,t1:15+10/60},{t0:15+20/60,t1:17+10/60}]); const d=VAC.freeAfterClass(G,G.day,{h:14}); global.CLS=C0;
    check('10. C10 下學期第 2 週週一 14:00：沒課照 14:00、那時有課排到下課（15:10）、14:00 以後才有的課不管；沒有 afterClass 照原本',a===14&&Math.abs(b-(15+10/60))<1e-6&&c===14&&d===14,JSON.stringify([a,b,c,d])); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
