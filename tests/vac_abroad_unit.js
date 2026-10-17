// 假期活動第二批：出國的 C08 首爾交流、C09 柬埔寨志工、C10 加州暑期課、C11 東京冬季課、C12 京都語言課（AA_242 18fe1b6a）——不需要瀏覽器。用法：node tests/vac_abroad_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  check('1. 這一版只開第一次（C08、C09 大一；C10～C12 大二）；營隊、日語課還是只有大一',!VAC.inst('C08','Y2')&&!VAC.inst('C10','Y1')&&!VAC.inst('C02','Y2')&&!!VAC.inst('C02','Y1'));
  // 2. C08：大一下第 6 週週一 12:00 全班群組系辦公告 → 交申請書 → 第 12 週週一 12:00 錄取通知＋媽媽兩句（行前說明會第 14 週週三 12:20）
  const w6=termDay('Y1S2',6,1); fresh(w6,11.9,'dorm',{}); G.stage='law'; PHONE.join(G,'law_class','法律系 大一（全班）'); PHONE.join(G,'noodle_team','麵店團'); run(11.9,12.2);
  const T8=txt('g:law_class'); check('2. 系辦公告【交流計畫】…第 9 週週五前交申請書',T8.some(t=>t==='sysoffice:【交流計畫】姊妹校暑期交流（首爾），7/13～7/24，對方學校負擔食宿。名額 10 名，需系上推薦，第 9 週週五前交申請書。'),JSON.stringify(T8));
  PHONE.answer(G,'vac_ask_C08@Y1',0); STORY.phoneRules(GM); check('2. 交了：報名、出發的出遊排在 7/13 08:00',VAC.state(G,'C08@Y1')==='yes'&&!!OUT.get(G,'vac_C08@Y1')&&OUT.get(G,'vac_C08@Y1').day===D('2026-07-13')&&OUT.get(G,'vac_C08@Y1').h===8);
  { const q=OUT.get(G,'vac_C08@Y1_pre0'); check('2. 報名隔天 20:00 宿舍書桌「寫申請資料」（BB-C 13:03：沒寫就沒上）',!!q&&q.day===w6+1&&q.h===20); const s0=JSON.stringify(G);
    const w12a=termDay('Y1S2',12,1); G.day=w12a; run(11.9,12.2); check('2. 沒寫申請資料：第 12 週「【通知】很遺憾，本次未能錄取。」＋阿哲「沒差啦 暑假還很長」；出發取消',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='【通知】很遺憾，本次未能錄取。')&&txt('g:noodle_team').includes('zhe:沒差啦 暑假還很長')&&VAC.state(G,'C08@Y1')==='rejected'&&OUT.get(G,'vac_C08@Y1').state==='cancelled');
    G=JSON.parse(s0); SOCIAL.bind(G); EVENTS.bind(GM); G.day=w6+1; G.hour=20; await VAC.outing(GM,q); check('2. 寫了：VAC_C08_APP',G.flags.VAC_C08_APP===true); }
  const w12=termDay('Y1S2',12,1), w14=termDay('Y1S2',14,3); G.day=w12; G.weekday=wdOf(w12); run(11.9,12.2); const x14=CALENDAR.dateOf(w14);
  const sys=(G.msgs||[]).filter(m=>m.th==='sys').map(m=>m.text), mom=txt('g:home');
  check('2. 第 12 週週一 12:00：【通知】恭喜錄取…行前說明會；媽媽「機票多少？我轉給你」「護照記得看效期」',sys.includes('【通知】恭喜錄取姊妹校暑期交流（首爾）。行前說明會：'+x14.m+'/'+x14.d+'（三）12:20。')&&mom.includes('mom:機票多少？我轉給你')&&mom.includes('mom:護照記得看效期'),JSON.stringify([sys,mom]));
  // 3. 出發 → 整段（歡迎晚會、市場、報告、最後一晚選炸雞）→ 回來；出發那天麵店團、回來阿哲「伴手禮咧」、智恩 7/31
  G.day=D('2026-07-13'); G.weekday=wdOf(G.day); G.hour=7.9; run(7.9,8.1); check('3. 出發那天麵店團：阿哲「記得吃炸雞」、小語「幫我看有沒有好看的筆」',txt('g:noodle_team').includes('zhe:記得吃炸雞')&&txt('g:noodle_team').includes('yu:幫我看有沒有好看的筆'));
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
    check('6. 加州：報名隔天 12:20 系辦',!!q&&q.day===w10+1&&Math.abs(q.h-12.333)<0.01,JSON.stringify(q));
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
    check('10. 柬埔寨＋和以安交往：出發那天「到了傳一張照片。一張就好。」、輪播池、中間那則、回來那天「明天見。……」',A1.some(m=>m.text==='到了傳一張照片。一張就好。')&&A1.some(m=>m.text==='今天讀了四十頁。你那邊天氣好嗎？')&&A1.some(m=>m.text==='你那邊幾點？我算了一下，你應該在吃午餐。')&&A1.some(m=>m.text==='明天見。……我是說，明天有空的話。'),JSON.stringify(A1.map(m=>m.text)));
    const pool=A1.filter(m=>m.text==='今天讀了四十頁。你那邊天氣好嗎？')[0]; check('10. 柬埔寨只有晚上有訊號：她 21:30 傳的，22:00 才收到；兩個回覆「好。」「我也想妳。」',!!pool&&Math.abs(pool.h-22)<0.01&&JSON.stringify(pool.ask.opts.map(o=>o.t))===JSON.stringify(['好。','我也想妳。']),JSON.stringify(pool));
    const dk=A1.find(m=>m.text==='今天沒有回。……你那邊還好嗎？'); check('10. 停電那晚（8/2）她「今天沒有回。……」隔天 8/3 早上 8:00 才收到；回「昨天停電，整晚沒電。」→「好。……下次停電，也先跟我說。」',!!dk&&dk.day===D('2026-08-03')&&dk.h===8&&dk.ask.opts[0].t==='昨天停電，整晚沒電。'&&dk.ask.opts[0].say[0].text==='好。……下次停電，也先跟我說。',JSON.stringify(dk));
    check('10. 7/30 VA-11「我媽在後面」人在柬埔寨不傳；停電那晚其他訊息也是隔天早上才到（8/2 沒有收到任何一則）',!A1.some(m=>m.text.includes('我媽在後面'))&&!(G.msgs||[]).some(m=>m.day===D('2026-08-02')&&m.h>=21));
    const Y=(G.msgs||[]).filter(m=>m.th==='p:heroine_03').map(m=>m.text); check('10. 語彤（朋友、FAMILIAR）整趟一則「📷（麵店今天的長桌）」',JSON.stringify(Y)===JSON.stringify(['📷（麵店今天的長桌）']),JSON.stringify(Y)); }
  { fresh(D('2027-06-21'),7,'dorm',{dating_kexin:true,dating_classmate_peishan:true}); G.stage='law'; VAC.signup(G,'C10@Y2','yes'); said=[]; picks=[0,0]; await VAC.outing(GM,OUT.get(G,'vac_C10@Y2')); PHONE.tick(G); const L=lines();
    check('10. 加州＋可昕：第一個週日 10:00 視訊三句（「你那邊亮亮的。」…「下禮拜同一個時間。」）',L.includes('杜可昕：你那邊亮亮的。')&&L.includes('杜可昕：好，我要去睡了。下禮拜同一個時間。'),JSON.stringify(L.filter(t=>t.startsWith('杜可昕'))));
    const K=(G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text); check('10. 加州第 3 週可昕「我算了一下 還有二十一天」「不是在算 是剛好看到」（一次）',K.filter(t=>t==='我算了一下 還有二十一天').length===1&&K.includes('不是在算 是剛好看到'));
    check('10. 加州六週：池子用完第二圈只用前半（第 9 天起只會出現前四則）',K.filter(t=>t==='晚安 我先睡').length===1&&K.filter(t=>t==='我算了一下 你那邊現在晚上九點').length>=3,JSON.stringify([K.filter(t=>t==='晚安 我先睡').length,K.filter(t=>t==='我算了一下 你那邊現在晚上九點').length]));
    check('10. 沛珊重考消失期（2027-06）：交往中也不傳',!(G.msgs||[]).some(m=>m.th==='p:classmate_peishan')); }
  { fresh(D('2026-07-13'),8,'dorm',{dating_heroine_05:true}); G.stage='law'; VAC.signup(G,'C08@Y1','yes'); said=[]; picks=[0,0,0,0]; await VAC.outing(GM,OUT.get(G,'vac_C08@Y1')); PHONE.tick(G);
    const S5=(G.msgs||[]).filter(m=>m.th==='p:heroine_05'&&m.ask); check('10. 學姊兩天一則（首爾 12 天：池子 4～5 則）',S5.length>=4&&S5.length<=5,String(S5.length));
    check('10. 回來記 BACK_FROM_C08（3D 第一次遇到的招呼用）',G.flags.BACK_FROM_C08===D('2026-07-24')); }
  // 11. 重逢（AA_242 8-6 79adc9f2）、子晴第二則、C10 成績、Priya
  { fresh(D('2026-07-24'),17.9,'dorm',{dating_heroine_01:true,dating_heroine_02:true}); G.stage='law'; meet('heroine_01'); meet('heroine_02'); VAC.rec(G).reg['C08@Y1']='done'; run(17.9,21.2);
    const A=txt('p:heroine_01'), Z=txt('p:heroine_02'), q=OUT.get(G,'vac_C08@Y1_re_heroine_01');
    check('11. 回國當天 21:00 以安「明天下午三點，總圖門口。」「時差調不過來的話，四點也可以。」→ 隔天 15:00 排重逢',A.includes('heroine_01:明天下午三點，總圖門口。')&&!!q&&q.day===D('2026-07-25')&&q.h===15,JSON.stringify([A,q]));
    check('11. 芷若大一暑假在台中：回國當天「回來了？……我 26 號回臺北。」，還沒約',Z.includes('heroine_02:回來了？……我 26 號回臺北。')&&!OUT.get(G,'vac_C08@Y1_re_heroine_02'),JSON.stringify(Z));
    G.day=D('2026-08-25'); run(20.9,21.2); const q2=OUT.get(G,'vac_C08@Y1_re_heroine_02'); check('11. 芷若 8/25 21:00「明天我九點下班。」→ 8/26 21:00 Café 重逢',txt('p:heroine_02').includes('heroine_02:明天我九點下班。')&&!!q2&&q2.day===D('2026-08-26')&&q2.h===21);
    G.day=D('2026-07-25'); G.hour=15; said=[]; await VAC.outing(GM,q); check('11. 以安重逢：「你回來了。」「……行程表上寫你今天會到。我沒有算錯。」；REUNION_C08',lines().includes('沈以安：你回來了。')&&lines().includes('沈以安：……行程表上寫你今天會到。我沒有算錯。')&&G.flags.REUNION_C08===true);
    VAC.missed(GM,q2); G.day=D('2026-08-27'); run(11.9,12.2); check('11. 重逢沒到：隔天 12:00 芷若「昨天的那杯，我自己喝了。」',txt('p:heroine_02').includes('heroine_02:昨天的那杯，我自己喝了。')); }
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
    said=[]; const a=await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu'); const b=await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu'); const c=await VAC.backGreet(GM,{name:'以安',charId:'heroine_01'},'heroine_01');
    check('12. 小語（FAMILIAR）第一次遇到「你回來了！伴手禮咧！」、只一次；交往中的以安沒有（她有重逢）',a&&!b&&!c&&lines().join('|')==='小語：你回來了！伴手禮咧！',JSON.stringify(lines()));
    G.day=D('2026-08-30'); delete VAC.rec(G).backSeen; check('12. 超過 30 天不說',!(await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu')));
    check('12. talkCharacter 在閒聊前呼叫 VAC.backGreet',/VAC\.backGreet\(GM,who,id\)/.test(require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8'))); }
  // 9. 存讀檔
  { VAC.rec(G).reg['C03@Y1']='yes'; const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('9. 存讀檔：報名狀態留著',VAC.state(G,'C03@Y1')==='yes'); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
