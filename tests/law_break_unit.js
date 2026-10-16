// 法律系的寒暑假：在家模式（AA_183，任務 SYS-LBREAK）——不需要瀏覽器。
// 檢查：放假的範圍；要演的日子；放假第一天起床回家（旁白、字卡）；「過幾天」跳過（中間的手機訊息照時間戳記收進來、旁白照放假的時候挑）；出遊、當面約變成要停的日子；除夕在家演主線 2；7/9 語彤生日、7/15 宿舍抽籤；寒假 2/22 17:00 回宿舍；暑假 9/6 主線 3；存讀檔。用法：node tests/law_break_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  if(!HOME.breakOf||!HOME.breakStart){ console.log('FAIL 0. 沒有 HOME.breakOf／breakStart'); console.log('FAILED 1'); process.exit(1); }
  // 1. 放假的範圍
  const W1=HOME.breakOf(D('2026-01-12')), S1=HOME.breakOf(D('2026-07-20')), W2=HOME.breakOf(D('2027-02-01')), S2=HOME.breakOf(D('2027-07-01'));
  check('1. 大一寒假 1/5～2/22、大一暑假 6/29～9/6、大二寒假 1/11～2/21、大二暑假 6/28～9/5',W1.key==='Y1W'&&W1.from===D('2026-01-05')&&W1.to===D('2026-02-22')&&S1.key==='Y1S'&&S1.from===D('2026-06-29')&&S1.to===D('2026-09-06')&&W2.key==='Y2W'&&W2.from===D('2027-01-11')&&W2.to===D('2027-02-21')&&S2.key==='Y2S'&&S2.from===D('2027-06-28')&&S2.to===D('2027-09-05'),JSON.stringify([W1,S1]));
  check('1. 學期中、經濟系那一年的暑假、大四畢業以後＝不是',HOME.breakOf(D('2026-01-04'))===null&&HOME.breakOf(D('2026-02-23'))===null&&HOME.breakOf(D('2025-07-20'))===null&&HOME.breakOf(D('2029-08-01'))===null);
  // 2. 要演的日子
  fresh(D('2026-01-12'),10,'dorm',{}); G.stage='law';
  const P=HOME.breakPts(G).map(p=>CALENDAR.dateOf(p.day).key.slice(5)+'@'+p.h+':'+p.k);
  check('2. 大一寒假：1/20、2/5 摘要日；2/16 12:00 除夕；2/17 11:00 初一；2/22 17:00 回宿舍',JSON.stringify(P)===JSON.stringify(['01-20@18.5:sum','02-05@18.5:sum','02-16@12:eve','02-17@11:cny','02-22@17:back']),JSON.stringify(P));
  check('2. 寒假結束＝2/22 17:00；暑假結束＝9/6 08:30（主線 3）；大三寒假沒有表＝開學前一天 17:00',HOME.breakEnd(G)===Tm(D('2026-02-22'),17)&&HOME.breakEnd(G,HOME.breakOf(D('2026-08-01')))===Tm(D('2026-09-06'),8.5)&&HOME.breakEnd(G,HOME.breakOf(D('2028-01-20')))===Tm(HOME.breakOf(D('2028-01-20')).to,17));
  // 3. 回家的時機
  fresh(D('2026-01-05'),7.5,'dorm',{}); G.stage='law';
  check('3. 寒假第一天早上：要回家',HOME.breakStartDue(G)===true);
  G.stage='econ'; check('3. 經濟系＝不算',!HOME.breakStartDue(G)); G.stage='law';
  G.hour=3; check('3. 凌晨（還沒起床）＝還沒',!HOME.breakStartDue(G)); G.hour=7.5;
  { const g=JSON.parse(JSON.stringify(G)); g.day=D('2026-02-22'); g.hour=18; check('3. 過了回宿舍的時間（2/22 18:00）＝不回家',!HOME.breakStartDue(g)); }
  check('3. 起床回家寫在 sleepNow 最後（不在 S.tick：舊存檔讀檔的瞬間不傳送）',/HOME\.breakStartDue\(G\)\)\{ GM\.autosave\(\); HOME\.breakStart\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'))&&!/S\.tick=function[^\n]*breakStart/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  // 4. 回家：旁白 → 字卡 → 家
  cards=[]; said=[];
  let ok=await HOME.breakStart(GM); let L=lines();
  check('4. 「宿舍的房間留著。你帶了一袋換洗衣服回家。」→ 字卡「回臺北的家」→ 在家、放假模式',ok&&L[0]==='宿舍的房間留著。你帶了一袋換洗衣服回家。'&&JSON.stringify(cards[0])===JSON.stringify(['回臺北的家','捷運＋公車 約 40 分鐘'])&&HOME.at(G)&&G.home.lbreak==='Y1W'&&HOME.breakMode(G)&&Math.abs(G.hour-8.2)<1e-6,JSON.stringify([L,cards]));
  check('4. 同一個寒假不再回一次',!HOME.breakStartDue(G)&&!(await HOME.breakStart(GM)));
  check('4. 放假模式：平日也回得了家（出門赴約以後）',HOME.canGo(Object.assign({},G,{home:Object.assign({},G.home,{at:false})})));
  // 5. 跳過的時候：中間的手機訊息照時間戳記收進來；出遊、當面約變成要停的日子
  PHONE.at(G,D('2026-01-10'),22.5,[{th:'p:kexin',from:'kexin',text:'測試：1/10 22:30 的訊息'}],'t_lb_msg');
  check('5. 下一個要停的：1/20 18:30',HOME.breakNext(G)===Tm(D('2026-01-20'),18.5));
  OUT.plan(G,{id:'t_lb_out',ev:'ev_none',day:D('2026-01-15'),h:15,place:'公館',title:'測試的出遊'});
  check('5. 1/15 15:00 的出遊：停在 14:15（從家裡 30 分鐘＋15 分鐘）',Math.abs(HOME.breakNext(G)-Tm(D('2026-01-15'),14.25))<1e-6,String(HOME.breakNext(G)-Tm(D('2026-01-15'),0)));
  OUT.get(G,'t_lb_out').state='missed';
  G.invites=[{id:'iv_t',who:'zhe',place:'cafe',day:D('2026-01-18'),h:14,state:'accepted'}];
  check('5. 1/18 14:00 的當面約：停在 13:00',HOME.breakNext(G)===Tm(D('2026-01-18'),13)); G.invites=[];
  // 6. 在家的選單：過幾天 → 1/20 → 2/5 → 2/16 除夕（主線 2 在家演）→ 2/17 初一 → 2/22 回宿舍
  meet('heroine_01'); meet('zhe'); PHONE.join(G,'noodle_team','麵店團');
  picks=[]; for(let i=0;i<40;i++) picks.push('過幾天'); said=[]; cards=[]; entered=[]; opts=[];
  await HOME.loop(GM); L=lines();
  const m10=(G.msgs||[]).find(m=>m.text==='測試：1/10 22:30 的訊息');
  check('6. 跳過的 1/10 22:30 訊息照原本的時間收進手機',!!m10&&m10.day===D('2026-01-10')&&Math.abs(m10.h-22.5)<0.02,m10&&JSON.stringify([m10.day,m10.h]));
  check('6. 第一個選單：過幾天（跳到 1/20（二）18:30）、睡覺；沒有回宿舍、去學校',opts[0].some(t=>/^過幾天/.test(t))&&opts[0].includes('睡覺')&&!opts[0].some(t=>/回宿舍|去學校/.test(t)),JSON.stringify(opts[0]));
  check('6. 字卡依序：1/20 → 2/5 → 2/16 → 2/17 → 2/22 → 回宿舍',JSON.stringify(cards.map(c=>c[0]))===JSON.stringify(['1/20（二）18:30','2/5（四）18:30','2/16（一）12:00','2/17（二）11:00','2/22（日）17:00','回宿舍']),JSON.stringify(cards));
  check('6. 跳過的旁白：1/20「寒假的早上…」、2/5「年前…」、2/16 同一句不說、2/17「過年的幾天…」、2/22「寒假的最後一週…」',L.includes('寒假的早上，家裡比宿舍安靜。')&&L.includes('年前，媽媽把你的房間也算進大掃除。')&&L.filter(t=>t==='年前，媽媽把你的房間也算進大掃除。').length===1&&L.includes('過年的幾天，親戚來來去去。每個人都問你，法律系是不是都在背條文。')&&L.includes('寒假的最後一週，你把下學期的課表抄進手帳。'),JSON.stringify(L.filter(t=>/寒假|年前|過年/.test(t))));
  check('6. 除夕：主線 2（親戚的土地資料）在家演，FAMILY_LAND_Y1 有值',!!G.flags.FAMILY_LAND_Y1&&!!G.events.done.ev_chiayi_land_y1);
  check('6. 初一：麵店團的拜年收進來（11:00）',PHONE.sent(G,'cny_noodle'));
  check('6. 2/22：「明天開學。你回宿舍。」→ 字卡「回宿舍」→ 宿舍房間；不在家、放假模式結束',L.includes('明天開學。你回宿舍。')&&entered[entered.length-1]==='dorm'&&!HOME.at(G)&&!G.home.lbreak&&G.day===D('2026-02-22')&&G.hour>=17.6,JSON.stringify([G.day,G.hour,entered]));
  check('6. 回宿舍以後：同一個寒假不再回家、平日不能回家',!HOME.breakStartDue(G)&&!HOME.breakMode(G));
  // 7. 暑假：6/29 回家 → 7/9 語彤生日 → 7/15 抽籤 → 7/20（打工多一句）→ 8/25 → 9/6 主線 3
  fresh(D('2026-06-29'),7.5,'dorm',{JOB_TUTOR:true}); G.stage='law'; meet('heroine_03'); meet('zhe'); meet('yu'); PHONE.join(G,'noodle_team','麵店團');
  said=[]; cards=[]; await HOME.breakStart(GM); L=lines();
  check('7. 暑假第一天：「宿舍到六月底。你把一年的東西裝進四個紙箱。」→ 回臺北的家',L[0]==='宿舍到六月底。你把一年的東西裝進四個紙箱。'&&cards[0][0]==='回臺北的家'&&G.home.lbreak==='Y1S');
  picks=[]; for(let i=0;i<60;i++) picks.push('過幾天'); said=[]; cards=[]; entered=[];
  await HOME.loop(GM); L=lines();
  const bd=(G.msgs||[]).find(m=>m.tag==='yt_bday_y1'&&m.th==='g:noodle_team'), lot=(G.msgs||[]).find(m=>m.tag==='dorm_lottery_y2'), zl=(G.msgs||[]).find(m=>m.tag==='dorm_lottery_y2_zhe');
  check('7. 7/9 12:00 麵店團：小語「今天語彤生日！」＋按鈕「傳一句生日快樂」',!!bd&&bd.from==='yu'&&bd.text==='今天語彤生日！'&&bd.ask&&bd.ask.opts[0].t==='傳一句生日快樂'&&bd.day===D('2026-07-09')&&Math.abs(bd.h-12)<0.02);
  check('7. 7/15 10:00 宿舍系統「大二宿舍抽籤結果：已分配。請於 9/6 前完成入住。」＋旁白「換一層樓，換一個房間。」＋10:05 阿哲',!!lot&&lot.text==='大二宿舍抽籤結果：已分配。請於 9/6 前完成入住。'&&L.includes('換一層樓，換一個房間。')&&!!zl&&zl.text==='抽到了！哥你哪一間？……我們還是不同棟。');
  check('7. 7/20：大一下有打工＝「暑假的班照排。你從家裡搭捷運去上班。」',L.includes('暑假的班照排。你從家裡搭捷運去上班。'));
  check('7. 字卡：7/9 → 7/15 → 7/20 → 8/25 → 9/6 → 主線 3 的「回宿舍」',JSON.stringify(cards.map(c=>c[0]).slice(0,6))===JSON.stringify(['7/9（四）12:00','7/15（三）10:00','7/20（一）18:30','8/25（二）18:30','9/6（日）08:30','回宿舍']),JSON.stringify(cards.map(c=>c[0])));
  check('7. 暑假的旁白：第一週、七月、八月、最後幾天各一次',['暑假的第一週。紙箱靠在牆邊，你一直沒拆。','七月。臺北熱到柏油路會反光。','八月。颱風來的那一晚，你在家把筆記從頭翻了一遍。','暑假的最後幾天，你把紙箱的膠帶重新貼好。'].every(t=>L.filter(x=>x===t).length===1),JSON.stringify(L.filter(t=>/暑假|七月|八月/.test(t))));
  check('7. 9/6：主線 3（「明天開學。今天搬進新的房間。」→ 拆箱）；放假模式結束、ROOM_Y2',L.includes('明天開學。今天搬進新的房間。')&&!!G.flags.ROOM_Y2&&!HOME.at(G)&&!G.home.lbreak&&entered[entered.length-1]==='dorm');
  // 8. 沒在麵店團、和語彤有點熟以上＝私訊；不熟＝沒有
  fresh(D('2026-07-09'),12.5,'dorm',{}); G.stage='law'; meet('heroine_03'); R('heroine_03',30,0,0); HOME.breakPhone(GM); PHONE.tick(G);
  const dm=(G.msgs||[]).find(m=>m.tag==='yt_bday_y1'); check('8. 不在群組、和語彤有點熟＝她的私訊放同一個按鈕',!!dm&&dm.th==='p:heroine_03'&&dm.ask.opts[0].t==='傳一句生日快樂');
  { const r=PHONE.answer(G,'yt_bday_y1',0); check('8. 傳了＝語彤「……謝謝。阿姨說要請你吃滷蛋。下次來。」',!!r&&r.out.some(m=>m.from==='heroine_03'&&m.text==='……謝謝。阿姨說要請你吃滷蛋。下次來。')); }
  fresh(D('2026-07-09'),12.5,'dorm',{}); G.stage='law'; HOME.breakPhone(GM); PHONE.tick(G); check('8. 不熟、不在群組＝沒有',!(G.msgs||[]).some(m=>m.tag==='yt_bday_y1'));
  // 9. 週末回家住到放假第一天：就地開始（不再出現回家的字卡）
  fresh(D('2026-01-05'),8.5,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.day=D('2026-01-04'); H.wakeAsk=G.day; }
  picks=['睡覺','睡覺']; for(let i=0;i<40;i++) picks.push('過幾天'); said=[]; cards=[]; entered=[];
  await HOME.loop(GM); L=lines();
  check('9. 在家醒來的放假第一天：旁白、沒有「回臺北的家」字卡、放假模式；最後照樣 2/22 回宿舍',L[0]==='宿舍的房間留著。你帶了一袋換洗衣服回家。'&&cards[0][0]!=='回臺北的家'&&G.home.brk==='Y1W'&&entered[entered.length-1]==='dorm',JSON.stringify([L.slice(0,2),cards.slice(0,2)]));
  // 10. 學期中的週末回家照舊（有「回宿舍」）
  fresh(D('2025-10-03'),18,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.day=G.day; } picks=['回宿舍']; opts=[];
  await HOME.loop(GM); check('10. 學期中的週末回家：選單照舊有「回宿舍」，沒有「過幾天」',opts[0].includes('回宿舍')&&!opts[0].some(t=>/^過幾天/.test(t)),JSON.stringify(opts[0]));
  // 11. 存讀檔
  fresh(D('2026-01-12'),10,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.lbreak='Y1W'; H.brk='Y1W'; H.bskip={key:'Y1W',n:1,last:0}; }
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('11. 存讀檔：在家、放假模式、旁白輪到哪裡都留著',HOME.at(G)&&HOME.breakMode(G)&&G.home.bskip.last===0);
  // 12. 校園的宿舍入口：放假模式藏起來
  check('12. 放假模式：校園的「回宿舍」藏起來（過了回宿舍的時間就看得到）',/HOME\.breakMode&&HOME\.breakMode\(G\)\) for\(const it of E\.interactables\)\{ if\(it\.exit&&\(it\.exit\.to==='dorm_hall'/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
