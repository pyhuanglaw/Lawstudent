// 法律系的寒暑假（AA_197 1-1～1-3，16 週制；原 AA_183 在家模式，任務 HOLIDAY-SYS／SYS-LBREAK）——不需要瀏覽器。
// 檢查：放假的範圍；要演的日子；不再強制回家（寒假第一天系統字、暑假最後一天問續住）；回家＝住家裡；快轉（家裡、宿舍的床：到下一個有事的日子／過三天／過一週）；
// 中間的手機訊息照時間戳記收進來；出遊、當面約、成績公布日先停；除夕 15:00 媽媽問、17:00 還在宿舍回家、主線 2 在家演；7/9 語彤生日、7/15 宿舍抽籤；暑假 9/6 主線 3；存讀檔。用法：node tests/law_break_unit.js
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
  check('1. 16 週制（AA_197 1-6）：大一寒假 12/22～2/22、大一暑假 6/15～9/6、大二寒假 12/28～2/21、大二暑假 6/14～9/5',W1.key==='Y1W'&&W1.from===D('2025-12-22')&&W1.to===D('2026-02-22')&&S1.key==='Y1S'&&S1.from===D('2026-06-15')&&S1.to===D('2026-09-06')&&W2.key==='Y2W'&&W2.from===D('2026-12-28')&&W2.to===D('2027-02-21')&&S2.key==='Y2S'&&S2.from===D('2027-06-14')&&S2.to===D('2027-09-05'),JSON.stringify([W1,S1,W2,S2]));
  check('1. 學期中、經濟系那一年的暑假、大四畢業以後＝不是',HOME.breakOf(D('2025-12-21'))===null&&HOME.breakOf(D('2026-02-23'))===null&&HOME.breakOf(D('2025-07-20'))===null&&HOME.breakOf(D('2029-08-01'))===null);
  // 2. 要演的日子
  fresh(D('2026-01-12'),10,'dorm',{}); G.stage='law';
  const P=HOME.breakPts(G).map(p=>CALENDAR.dateOf(p.day).key.slice(5)+'@'+p.h+':'+p.k);
  check('2. 大一寒假：1/20、2/5 摘要日；2/16 12:00 除夕；2/17 11:00 初一；2/22 17:00 開學前一天',JSON.stringify(P)===JSON.stringify(['01-20@18.5:sum','02-05@18.5:sum','02-16@12:eve','02-17@11:cny','02-22@17:back']),JSON.stringify(P));
  check('2. 放假結束（AA_197 1-3：不再強制回宿舍）＝寒假最後一天 21:30；暑假 9/6 08:30（主線 3）；大三寒假＝開學前一天 21:30',HOME.breakEnd(G)===Tm(D('2026-02-22'),21.5)&&HOME.breakEnd(G,HOME.breakOf(D('2026-08-01')))===Tm(D('2026-09-06'),8.5)&&HOME.breakEnd(G,HOME.breakOf(D('2028-01-20')))===Tm(HOME.breakOf(D('2028-01-20')).to,21.5));
  // 3. 不再強制回家
  fresh(D('2025-12-22'),7.5,'dorm',{}); G.stage='law';
  check('3. 寒假第一天早上：不回家（AA_197 1-3）',HOME.breakStartDue(G)===false);
  { let toasts=[]; const t0=GM.toast; GM.toast=t=>toasts.push(t); const a=HOME.breakNote(GM), b=HOME.breakNote(GM); GM.toast=t0;
    check('3. 寒假第一天在宿舍醒來：系統字「寒假宿舍照常開放。要回家的話，從選單選『回家』。」只一次',a&&!b&&toasts.length===1&&toasts[0]==='寒假宿舍照常開放。要回家的話，從選單選『回家』。',JSON.stringify(toasts)); }
  check('3. 放假中：平日也回得了家；學期中的平日不行',HOME.canGo(Object.assign({},G,{weekday:2}))&&!HOME.canGo(Object.assign({},G,{day:D('2025-12-16'),weekday:2,hour:10})));
  check('3. 起床的掛勾在 sleepNow 最後（暑假選回家＝breakStart；寒假＝breakNote）',/HOME\.breakStartDue\(G\)\)\{ GM\.autosave\(\); HOME\.breakStart\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'))&&/HOME\.breakNote\) HOME\.breakNote\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  // 4. 暑住：學期最後一天 12:00 問；選「暑假回家住」＝隔天早上回家
  { const r=CALENDAR.termDays('Y1S2'); fresh(r.to,11.9,'dorm',{}); G.stage='law'; run(11.9,12.2);
    const q=(G.msgs||[]).find(m=>m.tag==='summer_stay_Y1S');
    check('4. 大一下最後一天 12:00 宿舍系統「暑假住宿：可以續住到開學前。要續住嗎？」選項 續住／暑假回家住',!!q&&q.th==='g:dorm'&&q.text==='暑假住宿：可以續住到開學前。要續住嗎？'&&JSON.stringify(q.ask.opts.map(o=>o.t))===JSON.stringify(['續住','暑假回家住'])&&q.day===r.to&&Math.abs(q.h-12)<0.02,q&&JSON.stringify([q.text,q.day,q.h]));
    PHONE.answer(G,'summer_stay_Y1S',1); STORY.phoneRules(GM);
    check('4. 選「暑假回家住」：記在 home.stay',G.home&&G.home.stay&&G.home.stay.Y1S==='home',JSON.stringify(G.home&&G.home.stay));
    G.day=r.to+1; G.weekday=wdOf(G.day); G.hour=7.5; check('4. 暑假第一天早上：要回家',HOME.breakStartDue(G)===true);
    G.stage='econ'; check('4. 經濟系＝不算',!HOME.breakStartDue(G)); G.stage='law'; G.hour=3; check('4. 凌晨＝還沒',!HOME.breakStartDue(G)); G.hour=7.5;
    said=[]; cards=[]; const ok=await HOME.breakStart(GM); const L=lines();
    check('4. 「暑假回家住。你把一年的東西裝進四個紙箱。」→ 字卡「回臺北的家」→ 住家裡',ok&&L[0]==='暑假回家住。你把一年的東西裝進四個紙箱。'&&JSON.stringify(cards[0])===JSON.stringify(['回臺北的家','捷運＋公車 約 40 分鐘'])&&HOME.at(G)&&G.home.lbreak==='Y1S'&&HOME.breakMode(G),JSON.stringify([L,cards]));
    check('4. 同一個暑假不再回一次',!HOME.breakStartDue(G)&&!(await HOME.breakStart(GM)));
    fresh(r.to,11.9,'dorm',{}); G.stage='law'; run(11.9,12.2); PHONE.answer(G,'summer_stay_Y1S',0); STORY.phoneRules(GM); G.day=r.to+1; G.hour=7.5;
    check('4. 選「續住」：不回家',G.home.stay.Y1S==='stay'&&!HOME.breakStartDue(G)); }
  // 5. 要停的時間：表上的日子、成績公布日、出遊、當面約
  fresh(D('2025-12-23'),10,'dorm',{}); G.stage='law';
  check('5. 寒假中：成績公布日 1/5 08:30 是要停的（AA_197 1-2）',(()=>{ let t=Tm(D('2026-01-01'),0); return HOME.breakNext(G,t)===Tm(D('2026-01-05'),8.5); })());
  fresh(D('2026-01-12'),10,'dorm',{}); G.stage='law';
  PHONE.at(G,D('2026-01-14'),22.5,[{th:'p:kexin',from:'kexin',text:'測試：1/14 22:30 的訊息'}],'t_lb_msg');
  check('5. 下一個要停的：1/20 18:30',HOME.breakNext(G)===Tm(D('2026-01-20'),18.5));
  OUT.plan(G,{id:'t_lb_out',ev:'ev_none',day:D('2026-01-15'),h:15,place:'公館',title:'測試的出遊'});
  check('5. 1/15 15:00 的出遊：停在出發前',HOME.breakNext(G)<Tm(D('2026-01-15'),15)&&HOME.breakNext(G)>=Tm(D('2026-01-15'),13.5),String(HOME.breakNext(G)-Tm(D('2026-01-15'),0)));
  // 6. 宿舍的床：快轉
  { const bo=STORY.bedOptions(G); check('6. 寒假的床：有「快轉」',bo.some(o=>o.kind==='ff'&&o.t==='快轉'),JSON.stringify(bo.map(o=>o.t)));
    const g2=JSON.parse(JSON.stringify(G)); g2.day=D('2025-12-16'); g2.weekday=wdOf(g2.day); g2.hour=22; check('6. 學期中的床：沒有「快轉」',!STORY.bedOptions(g2).some(o=>o.kind==='ff'));
    const O=HOME.ffOpts(G); check('6. 快轉四個選項：到下一個有事的日子／過三天／過一週／不用了',JSON.stringify(O.map(o=>o.t))===JSON.stringify(['到下一個有事的日子','過三天','過一週','不用了']),JSON.stringify(O.map(o=>[o.t,o.hint])));
    picks=['過三天']; cards=[]; said=[]; const ADVb=ADV.begin; let advN=0; ADV.begin=()=>{ advN++; }; await HOME.ffMenu(GM,'dorm'); ADV.begin=ADVb;
    const m14=(G.msgs||[]).find(m=>m.text==='測試：1/14 22:30 的訊息');
    check('6. 過三天：中間的 1/14 22:30 訊息照時間收進來；1/15 的出遊先停（字卡寫「宿舍」、沒有 2D 背景、宿舍版旁白 AA_183 4-b「年前，宿舍的公告欄…」）',!!m14&&m14.day===D('2026-01-14')&&G.day===D('2026-01-15')&&G.hour<15&&cards.length===1&&cards[0][1]==='宿舍'&&advN===0&&!lines().some(t=>/家裡|媽媽/.test(t))&&lines().includes('年前，宿舍的公告欄貼了一張紅紙：除夕到初三，餐廳不開。'),JSON.stringify([cards,G.day-D('2026-01-15'),G.hour,lines()]));
    OUT.get(G,'t_lb_out').state='missed'; picks=['過一週']; cards=[]; await HOME.ffMenu(GM,'dorm');
    check('6. 過一週：1/15（四）20 點多先停在家人群組（要回的；AA_532 第 4 節：留宿舍的寒假也有）',G.day===D('2026-01-15')&&G.hour>=20&&G.hour<21.01&&(G.msgs||[]).some(m=>m.ask&&m.ask.id==='home_ask_'+D('2026-01-15')),JSON.stringify([G.day-D('2026-01-15'),G.hour]));
    picks=['過一週']; cards=[]; await HOME.ffMenu(GM,'dorm');
    check('6. 過一週：1/20 18:30（摘要日）先停',G.day===D('2026-01-20')&&Math.abs(G.hour-18.5)<1e-6,JSON.stringify([G.day-D('2026-01-20'),G.hour]));
    picks=['不用了']; const d0=G.day; await HOME.ffMenu(GM,'dorm'); check('6. 不用了：時間不動',G.day===d0&&Math.abs(G.hour-18.5)<1e-6); }
  // 7. 住家裡：回家 → 家裡的選單 → 快轉一路到放假最後一天 → 回宿舍住
  fresh(D('2025-12-22'),9,'campus',{}); G.stage='law'; meet('heroine_01'); meet('zhe'); PHONE.join(G,'noodle_team','麵店團');
  { const pol=o=>{ const T=o.map(q=>q.t||q.text); for(const w of ['快轉','到下一個有事的日子','回宿舍住']){ const k=T.indexOf(w); if(k>=0) return k; } return 0; };
    const ch0=GM.choose; GM.choose=async o=>{ opts.push(o.map(q=>q.t||q.text)); return pol(o); }; said=[]; cards=[]; entered=[]; opts=[];
    await HOME.go(GM); GM.choose=ch0; const L=lines();
    check('7. 放假中回家＝住家裡；家裡的選單有「快轉」「睡覺」「回宿舍住」，沒有「過幾天」',JSON.stringify(cards[0])===JSON.stringify(['回臺北的家','捷運＋公車 約 40 分鐘'])&&opts[0].includes('快轉')&&opts[0].includes('睡覺')&&opts[0].includes('回宿舍住')&&!opts.some(x=>x.some(t=>/^過幾天/.test(t))),JSON.stringify(opts[0]));
    const cs=cards.slice(1).map(c=>c[0]);
    check('7. 字卡依序：12/24 聖誕（麵店，出遊前停）→ 12/26 21:45 麵店團揪海邊（要回的訊息，AA_340 6-1 H2：原本一路跳到 12/31，邀約 12/29 08:30 過期）→ 12/31 跨年 → 1/5 成績公布 → 1/20 → 2/5 → 2/16 除夕 → 2/17 初一 → 2/22 12:00（快轉的上限）',JSON.stringify(cs.slice(0,9))===JSON.stringify(['12/24（三）17:45','12/26（五）21:45','12/31（三）22:55','1/5（一）08:30','1/20（二）18:30','2/5（四）18:30','2/16（一）12:00','2/17（二）11:00','2/22（日）12:00']),JSON.stringify(cs));
    check('7. 家裡的旁白（AA_183 第 4 節）照放假的時候挑、每句最多一次',L.includes('寒假的早上，家裡比宿舍安靜。')&&L.includes('過年的幾天，親戚來來去去。每個人都問你，法律系是不是都在背條文。')&&L.includes('寒假的最後一週，你把下學期的課表抄進手帳。')&&['寒假的早上，家裡比宿舍安靜。','年前，媽媽把你的房間也算進大掃除。','過年的幾天，親戚來來去去。每個人都問你，法律系是不是都在背條文。','寒假的最後一週，你把下學期的課表抄進手帳。'].every(t=>L.filter(x=>x===t).length<=1),JSON.stringify(L.filter(t=>/寒假|年前|過年/.test(t))));
    check('7. 除夕：主線 2 在家演（FAMILY_LAND_Y1）；人在家＝沒有「幾點回來？」',!!G.flags.FAMILY_LAND_Y1&&!!G.events.done.ev_chiayi_land_y1&&!PHONE.sent(G,'eve_ask_'+D('2026-02-16')));
    check('7. 初一：麵店團的拜年收進來（11:00）',PHONE.sent(G,'cny_noodle'));
    check('7. 2/22 12:00 以後沒有快轉；選「回宿舍住」→ 宿舍；沒有「明天開學。你回宿舍。」字卡',!L.includes('明天開學。你回宿舍。')&&entered[entered.length-1]==='dorm'&&!HOME.at(G)&&!G.home.lbreak&&G.day===D('2026-02-22'),JSON.stringify([G.day-D('2026-02-22'),G.hour,entered.slice(-2)])); }
  // 8. 除夕人在宿舍：15:00 媽媽「幾點回來？」；17:00 以後在宿舍＝「飯快好了。」→ 回家 → 主線 2
  { const e=D('2026-02-16'); fresh(e,14.5,'dorm',{}); G.stage='law';
    check('8. 除夕 14:30 在宿舍：主線 2 不在宿舍演（要在家）',!EVENTS.check(ev('ev_chiayi_land_y1')));
    run(14.5,15.1); const a=(G.msgs||[]).find(m=>m.tag==='eve_ask_'+e);
    check('8. 15:00 家人群組媽媽「幾點回來？」',!!a&&a.th==='g:home'&&a.from==='mom'&&a.text==='幾點回來？'&&Math.abs(a.h-15)<0.02);
    G.hour=16.9; check('8. 16:54 還不回',!HOME.eveDue(G)); G.hour=17.1; G.zone='campus'; check('8. 17:00 以後在校園（不在宿舍）＝不拉',!HOME.eveDue(G)); G.zone='dorm_hall'; check('8. 17:00 以後在宿舍走廊＝回家',HOME.eveDue(G));
    const pol=o=>{ const T=o.map(q=>q.t||q.text); const k=T.indexOf('回宿舍住'); return k>=0?k:0; }; const ch0=GM.choose; GM.choose=async o=>pol(o); cards=[]; said=[];
    await HOME.eveGo(GM); GM.choose=ch0; const f=(G.msgs||[]).find(m=>m.tag==='eve_food_'+e);
    check('8. 「飯快好了。」→ 字卡「回臺北的家」→ 主線 2 在家演',!!f&&f.from==='mom'&&f.text==='飯快好了。'&&cards[0][0]==='回臺北的家'&&!!G.flags.FAMILY_LAND_Y1,JSON.stringify([cards,f&&f.text])); }
  // 9. 暑假住家裡：6/29 成績 → 7/9 語彤生日 → 7/15 抽籤 → 7/20（打工多一句）→ 8/25 → 9/6 主線 3
  fresh(D('2026-06-15'),7.5,'dorm',{JOB_TUTOR:true}); G.stage='law'; meet('heroine_03'); meet('zhe'); meet('yu'); PHONE.join(G,'noodle_team','麵店團'); HOME.rec(G).stay={Y1S:'home'};
  { said=[]; cards=[]; await HOME.breakStart(GM);
    const pol=o=>{ const T=o.map(q=>q.t||q.text); for(const w of ['快轉','到下一個有事的日子']){ const k=T.indexOf(w); if(k>=0) return k; } return 0; }; const ch0=GM.choose; GM.choose=async o=>pol(o); cards=[]; entered=[]; said=[];
    await HOME.loop(GM); GM.choose=ch0; const L=lines();
    const bd=(G.msgs||[]).find(m=>m.tag==='yt_bday_y1'&&m.th==='g:noodle_team'), lot=(G.msgs||[]).find(m=>m.tag==='dorm_lottery_y2'), zl=(G.msgs||[]).filter(m=>m.tag==='dorm_lottery_y2_zhe').map(m=>m.from+':'+m.text).join('|');
    check('9. 7/9 12:00 麵店團：Alison「今天語彤生日！」＋按鈕「傳一句生日快樂」',!!bd&&bd.from==='yu'&&bd.text==='今天語彤生日！'&&bd.ask&&bd.ask.opts[0].t==='傳一句生日快樂'&&bd.day===D('2026-07-09')&&Math.abs(bd.h-12)<0.02);
    check('9. 7/15 10:00 宿舍系統抽籤＋旁白「換一層樓，換一個房間。」＋10:05 阿哲「又同一間」、柏翰 312（AA_208 第 9 節）',!!lot&&lot.text==='大二宿舍抽籤結果：已分配。請於 9/6 前完成入住。'&&L.includes('換一層樓，換一個房間。')&&zl==='zhe:抽到了！|zhe:欸我們又同一間！！|classmate_bohan:我也是。312。',zl);
    check('9. 7/20：大一下有打工＝「暑假的班照排。你從家裡搭捷運去上班。」',L.includes('暑假的班照排。你從家裡搭捷運去上班。'));
    check('9. 字卡：6/29 成績 → 7/9 → 7/15 → 7/20 → 8/25 → 9/6 → 主線 3 的「回宿舍」',JSON.stringify(cards.map(c=>c[0]).slice(0,7))===JSON.stringify(['6/29（一）08:30','7/9（四）12:00','7/15（三）10:00','7/20（一）18:30','8/25（二）18:30','9/6（日）08:30','回宿舍']),JSON.stringify(cards.map(c=>c[0])));
    check('9. 9/6：主線 3（「明天開學。今天搬進新的房間。」→ 拆箱）；住家裡結束、ROOM_Y2',L.includes('明天開學。今天搬進新的房間。')&&!!G.flags.ROOM_Y2&&!HOME.at(G)&&!G.home.lbreak&&entered[entered.length-1]==='dorm'); }
  // 10. 沒在麵店團、和語彤有點熟以上＝私訊；不熟＝沒有
  fresh(D('2026-07-09'),12.5,'dorm',{}); G.stage='law'; meet('heroine_03'); R('heroine_03',30,0,0); HOME.breakPhone(GM); PHONE.tick(G);
  const dm=(G.msgs||[]).find(m=>m.tag==='yt_bday_y1'); check('10. 不在群組、和語彤有點熟＝她的私訊放同一個按鈕',!!dm&&dm.th==='p:heroine_03'&&dm.ask.opts[0].t==='傳一句生日快樂');
  { const r=PHONE.answer(G,'yt_bday_y1',0); check('10. 傳了＝語彤「……謝謝。阿姨說要請你吃滷蛋。下次來。」',!!r&&r.out.some(m=>m.from==='heroine_03'&&m.text==='……謝謝。阿姨說要請你吃滷蛋。下次來。')); }
  fresh(D('2026-07-09'),12.5,'dorm',{}); G.stage='law'; HOME.breakPhone(GM); PHONE.tick(G); check('10. 不熟、不在群組＝沒有',!(G.msgs||[]).some(m=>m.tag==='yt_bday_y1'));
  // 10b. 每年 7/15 抽籤（AA_208 第 9 節）：大三阿哲二樓、大四「我又二樓」；ZHE_CALLS_GE＝「哥我們又同一間！！」；不在群組、和阿哲有點熟＝私訊（沒有柏翰那句）
  { const zt=tag=>(G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.th+'|'+m.from+':'+m.text);
    fresh(D('2027-07-15'),10.2,'dorm',{}); G.stage='law'; meet('zhe'); PHONE.join(G,'noodle_team','麵店團'); HOME.breakPhone(GM); PHONE.tick(G);
    check('10b. 大三 7/15：「抽到了」「我二樓」「你們兩個五樓 同一棟啦 一樣找得到我」、柏翰「507。」',JSON.stringify(zt('dorm_lottery_y3_zhe'))===JSON.stringify(['g:noodle_team|zhe:抽到了','g:noodle_team|zhe:我二樓','g:noodle_team|zhe:你們兩個五樓 同一棟啦 一樣找得到我','g:noodle_team|classmate_bohan:507。']),JSON.stringify(zt('dorm_lottery_y3_zhe')));
    fresh(D('2028-07-15'),10.2,'dorm',{}); G.stage='law'; meet('zhe'); R('zhe',30,0,0); HOME.breakPhone(GM); PHONE.tick(G);
    check('10b. 大四、不在群組、和阿哲有點熟：私訊「抽到了」「我又二樓」「你們兩個又同一間喔 好啦」',JSON.stringify(zt('dorm_lottery_y4_zhe'))===JSON.stringify(['p:zhe|zhe:抽到了','p:zhe|zhe:我又二樓','p:zhe|zhe:你們兩個又同一間喔 好啦']),JSON.stringify(zt('dorm_lottery_y4_zhe')));
    fresh(D('2026-07-15'),10.2,'dorm',{ZHE_CALLS_GE:true}); G.stage='law'; meet('zhe'); PHONE.join(G,'noodle_team','麵店團'); HOME.breakPhone(GM); PHONE.tick(G);
    check('10b. 大二、阿哲叫哥：「哥我們又同一間！！」',zt('dorm_lottery_y2_zhe').includes('g:noodle_team|zhe:哥我們又同一間！！')); }
  // 11. 週末回家住到放假：人在家＝住家裡（沒有回家的字卡）
  fresh(D('2026-01-05'),8.5,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.day=D('2026-01-04'); H.wakeAsk=G.day; }
  picks=['回宿舍住']; said=[]; cards=[]; entered=[]; opts=[];
  await HOME.loop(GM);
  check('11. 放假中人在家：住家裡、選單有快轉；沒有「回臺北的家」字卡',G.home.brk==='Y1W'&&!cards.some(c=>c[0]==='回臺北的家')&&opts[0]&&opts[0].includes('快轉'),JSON.stringify([opts[0],cards]));
  // 12. 學期中的週末回家照舊（有「回宿舍」，沒有快轉）
  fresh(D('2025-10-03'),18,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.day=G.day; } picks=['回宿舍']; opts=[];
  await HOME.loop(GM); check('12. 學期中的週末回家：選單照舊有「回宿舍」，沒有「快轉」',opts[0].includes('回宿舍')&&!opts[0].some(t=>/^快轉|^過幾天/.test(t)),JSON.stringify(opts[0]));
  // 13. 存讀檔
  fresh(D('2026-01-12'),10,'campus',{}); G.stage='law'; { const H=HOME.rec(G); H.at=true; H.lbreak='Y1W'; H.brk='Y1W'; H.bskip={key:'Y1W',n:1,last:0}; H.stay={Y1S:'stay'}; H.bnote='Y1W'; }
  const s0=JSON.stringify(G); G=JSON.parse(s0); SOCIAL.bind(G); check('13. 存讀檔：住家裡、旁白輪到哪裡、暑住的選擇、系統字看過都留著',HOME.at(G)&&HOME.breakMode(G)&&G.home.bskip.last===0&&G.home.stay.Y1S==='stay'&&G.home.bnote==='Y1W');
  // 14. 校園的宿舍入口不再藏；住家裡走回宿舍房間＝回宿舍住；宿舍走廊放假路人少一半
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('14. 校園的宿舍入口不藏（AA_183 的藏法拿掉）；走進宿舍房間＝不再住家裡',!/Object\.defineProperty\(it,'hidden',\{configurable:true,get\(\)\{ return !!\(typeof HOME!=='undefined'&&HOME\.breakMode/.test(src)&&/zoneId==='dorm'&&typeof HOME!=='undefined'&&HOME\.breakMode&&HOME\.breakMode\(G\)&&!HOME\.at\(G\)\)\{ const H=HOME\.rec\(G\); H\.lbreak=null;/.test(src));
    check('14. 宿舍走廊：放假時一樓走廊的路人、交誼廳讀書的人不生成',/if\(!brk\) GM\.spawnExtra\(boy\(\),\[\[-12\.4,0,0\],\[12\.4,0,0\]\]/.test(src)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
