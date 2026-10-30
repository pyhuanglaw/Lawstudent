// AA_313 第 4 節（以安、語彤，AA313-S4-1020）——不需要瀏覽器。
//   清單照 docs/handoff/audit_1022/AA313_REMAINING_1022.md §4；句子照 AA_313 4-1 裁定、4-3／4-4 逐場表（企劃線）。寫死的舊句在各自的測試改了，這裡測行為和沒有測試的句子。
//   以安：寒暑假 talkAn 的備用句、日語課 C03 要認識她、C05 日本五天同一天兩則、an_admin（另見 aa374_y2s1_unit）、貓空 D09 大四下、career_goal、告白白板 {name}；
//   語彤：總圖門口（旁白、點頭就走不算認識）、雨天最後一句、ev_yutong_thanks 的選項、雙主修筆試 6/18 18:00＋期末飯、邀約選單、大三跨年 00:01 的電話。
//   聖誕交換 12/17、大二頂樓「還在捷運上」的條件見 v3_d12_unit。
// AA_313 第 5 節（麵店團，AA313-S5-1020）：兩版的字不一樣照逐場表（AA_389 第 6 點），「小語」寫 Alison。
//   阿哲叫「哥」照 ZHE_CALLS_GE（大二初一、迎新）、迎新還不認識的說話人；大一的晚餐、練球、宵夜只在大一（練球每學期一次、宵夜「來了。」補旁白）；
//   語 3 改 Alison 打來的電話；聖誕「阿哲先到」、抽到阿哲的保溫杯；升階的問句接回答、阿哲 FAMILIAR 分學期；312 颱風夜的室友；zhe_notes、xc_contract 的週次；
//   阿哲、Alison 舊的閒聊句照學期；柏翰值班分大二、大三起，大二第一次值班開場一句；柏翰聽到分開以後第一次說話；大三跨年以安、芯慈要認識；芯慈松菸的旁白；
//   沒有測試寫死的句子（海邊、拆箱、慈 3 旁白、美術館後續、烤肉群組）。寫死的舊句在各自的測試改了（v3_batch1、v3_d13、v3_d11、v2_c18、v1_batch6、v1_batch9、jp_semester、v3_welcome、bb_batch_1016、v3_d7、v3_p4_han3、y1_winter_aa204、vac_hometown、sis_no_three）。
// 修改前（開發分支 8f9b305c）：第 4 節每一項都會失敗；第 5 節的在 4d2d3d40（第 4 節的 commit）上會失敗。用法：node tests/aa313_s4s5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){},narrate(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t:String(t).replace(/\{name\}/g,G.name)}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
if(STORY._bindGM) STORY._bindGM(GM);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key;
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const allTxt=th=>txt(th).concat(...PHONE.rec(G).q.map(q=>(q.items||[]).filter(x=>x.th===th).map(x=>x.text)));
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evTexts=id=>{ const e=ev(id); return e?(e.dialogue||[]).map(l=>l&&l.text).filter(Boolean):[]; };
const choiceTexts=id=>{ const e=ev(id); const out=[]; for(const l of (e&&e.dialogue)||[]) if(l&&l.choice) for(const c of l.choice) out.push(c.text); return out; };
const SRC=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
(async()=>{
  // ===================== 第 4 節：以安 =====================
  // talkAn 的備用三句（4-3「主線之後，寒暑假跟她說話」）
  { const talk=async(key,seed)=>{ fresh(D(key),15,'campus',{met_an:true,anAfter:true,companion:'x'}); R('heroine_01','FAM'); SOCIAL.markUp&&SOCIAL.markUp('heroine_01',SOCIAL.friendLevel('heroine_01'));
      const n={id:'an',charId:'heroine_01',name:'沈以安',obj:{position:{x:1,y:0,z:1}},seat:null,lv:0}; GM.npc.an=n; const r0=Math.random; Math.random=()=>seed; said=[]; try{ await STORY._day2.talkAn(GM,n); } finally { Math.random=r0; } return said.map(s=>s.t); };
    const vac=[], y1=[]; for(const s of [0.01,0.4,0.8]){ vac.push(...await talk('2026-07-20',s)); y1.push(...await talk('2025-12-24',s)); }
    check('4-3. 寒暑假跟以安說話（沒有階梯資料）：不說「周老師說錯誤和撤銷…」（只在大一上），換「放假總圖人少。我都坐二樓靠窗。」',!vac.some(t=>/周老師說錯誤和撤銷/.test(t))&&vac.includes('放假總圖人少。我都坐二樓靠窗。')&&vac.includes('明天要不要一起去總圖？早上人少。'),J(vac));
    check('4-3. 大一寒假（12/24，也沒有學期）同樣不說周老師那句',!y1.some(t=>/周老師說錯誤和撤銷/.test(t)),J(y1)); }
  // 日語課 C03：還不認識以安（公告欄報名）＝照其他年份的旁白、沒有她的選項（4-1 第 6 點）
  { fresh(D('2026-07-07'),18,'dorm',{}); VAC.signup(G,'C03@Y1','yes'); said=[]; opts=[]; const q=OUT.get(G,'vac_C03@Y1_0'); G.day=q.day; G.hour=19; await VAC.outing(GM,q);
    const L=lines(); check('4-1 第 6 點. C03 大一、不認識以安：「（教室裡都是不認識的人。）」、沒有「你也來了。」、沒有她的選項',L.includes('（教室裡都是不認識的人。）')&&!L.some(t=>/你也來了|以安/.test(t))&&!opts.length,J([L,opts]));
    fresh(D('2026-07-07'),18,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C03@Y1','yes'); said=[]; const q2=OUT.get(G,'vac_C03@Y1_0'); G.day=q2.day; G.hour=19; await VAC.outing(GM,q2);
    check('4-1 第 6 點. C03 大一、認識以安：照稿「你也來了。」',lines().includes('沈以安：你也來了。'),J(lines())); }
  // C05 日本五天：以安、語彤同一天不再收到兩次（拿掉 va11_jp_*；出國輪播照舊）
  { fresh(D('2026-08-24'),6,'dorm',{dating_heroine_01:true,dating_heroine_03:true}); R('heroine_01','CLO'); R('heroine_03','CLO'); R('kai','FAM'); VAC.signup(G,'C05@Y1','yes'); said=[]; picks=[0,0,0,0];
    await VAC.outing(GM,OUT.get(G,'vac_C05@Y1')); G.day=D('2026-08-29'); G.hour=12; run(12,12.2);
    const A=allTxt('p:heroine_01'), Y=allTxt('p:heroine_03'), n=(L,t)=>L.filter(x=>x===t).length;
    check('4-3. C05：以安「到了傳一張照片。一張就好。」只收到一次',n(A,'到了傳一張照片。一張就好。')===1,J(A));
    check('4-4. C05：語彤「回來了嗎」只收到一次；va11_jp_* 拿掉了',n(Y,'回來了嗎')===1&&!VAC_DATA.MSGS.some(m=>/^va11_jpb?_/.test(m.tag)),J(Y)); }
  // 貓空 D09：大四下她已經交棒（4-3）
  { const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_01'&&r.spot==='D09'), sch=CHARACTERS.heroine_01.daily_schedule.find(q=>q.enc==='D09');
    check('4-3. 偶遇 D09 以安：terms 拿掉 Y4S2（encounters.js、characters.js 作息兩邊）',!!row&&!row.terms.includes('Y4S2')&&row.terms.includes('Y4S1')&&!!sch&&!sch.terms.includes('Y4S2'),J([row&&row.terms,sch&&sch.terms])); }
  check('4-3. 以安 career_goal 照 AA_285 第 5 節',CHARACTERS.heroine_01.career_goal==='一定考台大法研所；司法官或大事務所律師還沒決定',CHARACTERS.heroine_01.career_goal);
  { const H=TERMEND_LINES.HEART.heroine_01, all=J(H); check('4-1 第 12 點. 告白白板不寫死「祐廷」：「沈以安喜歡{name}。理由：還在寫。」（GM.say 會代換 {name}）',all.includes('沈以安喜歡{name}。理由：還在寫。')&&!all.includes('沈以安喜歡祐廷')&&/function subst\(t\)\{ return t\.replace\(\/\\\{name\\\}\/g,G\.name\)/.test(SRC('src/game3d.js'))); }
  check('4-1 第 7 點. ev_an_report_split_late 不說「理由：」',evTexts('ev_an_report_split_late').some(t=>t==='我把你寫在我這組了。……不用謝。剩下的人裡，你最不會遲交。'));
  // ===================== 第 4 節：語彤 =====================
  // 總圖門口（4-4）：那一行是旁白；選「點個頭就走」直接結束、不記 FIRST_MET；另外兩個選項才自我介紹
  { const X=ev('ev_library_door_phone'), go=async k=>{ fresh(10,18,'campus',{}); said=[]; picks=[k]; await EVENTS.run(X); return lines(); };
    let L=await go(2);
    check('4-4. 語彤總圖門口：「你看了一下手機，告訴她時間。」是旁白（不是祐廷說）',L.includes('你看了一下手機，告訴她時間。')&&!L.some(t=>/^祐廷：/.test(t)),J(L));
    check('4-4. 選「（點個頭就走）」：直接結束、沒有自我介紹、不記 FIRST_MET（之後還能在別的地方第一次認識她）',!L.some(t=>/陳語彤。……你是法律系的吧/.test(t))&&!SOCIAL.has('heroine_03','FIRST_MET'),J(L));
    L=await go(0); check('4-4. 選「要不要先進去等？」：她自我介紹、記 FIRST_MET',L.some(t=>/陳語彤。……你是法律系的吧。你們系的人走路都很快。/.test(t))&&SOCIAL.has('heroine_03','FIRST_MET'),J(L)); }
  check('4-4. 雨天總圖門口：最後一行旁白「（她會記得今天。）」刪掉',!evTexts('ev_rain_library_door').includes('（她會記得今天。）'));
  check('4-4. ev_yutong_thanks 的選項「妳可以講。講完就算了。」（不是「我不會跟別人說」）',choiceTexts('ev_yutong_thanks').includes('「妳可以講。講完就算了。」')&&!choiceTexts('ev_yutong_thanks').some(t=>/我不會跟別人說/.test(t)),J(choiceTexts('ev_yutong_thanks')));
  // 雙主修筆試（4-4）：va11_exam_yt 改 6/18 18:00；收過的人期末飯她只說成績單那句
  { const m=VAC_DATA.MSGS.find(x=>x.tag==='va11_exam_yt'); check('4-4. va11_exam_yt：6/18 18:00（筆試考完那天傍晚）',!!m&&m.day==='2026-06-18'&&m.h===18,J(m&&[m.day,m.h]));
    fresh(D('2026-06-18'),17,'dorm',{dating_heroine_03:true}); R('heroine_03','CLO'); run(17,18.2); const got=PHONE.sent(G,'va11_exam_yt');
    const pool=x=>TERMEND_LINES.POOL.Y1S2.heroine_03.map(f=>typeof f==='function'?f(x):f).filter(v=>v!=null);
    check('4-4. 交往中 6/18 18:00 收到「考完了」那幾則；期末飯她只說「成績單七月三號才寄。」',got&&txt('p:heroine_03')[0]==='考完了'&&J(pool(G))===J(['成績單七月三號才寄。']),J([txt('p:heroine_03'),pool(G)]));
    fresh(D('2026-06-20'),17,'dorm',{}); check('4-4. 沒收過那則（沒交往）：期末飯照舊兩句',J(pool(G))===J(['考完了。……憲法最後一題寫不完。','成績單七月三號才寄。']),J(pool(G))); }
  check('4-4. 邀約選單「去阿鳳麵店吃飯」（台大就在公館，不說「去公館」）',INVITE_DATA.places.find(p=>p.id==='noodle').verb==='去阿鳳麵店吃飯',INVITE_DATA.places.find(p=>p.id==='noodle').verb);
  // 語彤大三跨年（4-1 第 13 點）：交往中 00:01 她打電話來
  { const nye=D('2027-12-31'); fresh(nye,22.8,'dorm',{dating_heroine_03:true}); R('heroine_03','CLO'); run(22.8,23.2); const c=OUT.get(G,'yt_nye_call_y3');
    check('4-1 第 13 點. 大三跨年和語彤交往中：00:01 她打電話來（接起來／先不接）',!!c&&c.ev==='ev_yt_nye_call_y3'&&c.day===nye+1&&Math.abs(c.h-1/60)<1e-6&&c.verb==='接起來',J(c));
    said=[]; await EVENTS.run(ev('ev_yt_nye_call_y3')); const L=lines();
    check('4-1 第 13 點. 電話照稿：「（電話。她那邊很安靜。）」「……新年快樂。」「店裡今天提早收。阿姨說跨年沒有人吃麵。」「你那邊好吵。……好，你去看。我掛了。」',J(L)===J(['（電話。她那邊很安靜。）','陳語彤：……新年快樂。','陳語彤：店裡今天提早收。阿姨說跨年沒有人吃麵。','陳語彤：你那邊好吵。……好，你去看。我掛了。'])&&G.flags.YT_NYE_CALL_Y3===true,J(L));
    fresh(nye,22.8,'dorm',{}); R('heroine_03','FAM'); run(22.8,23.2); check('4-1 第 13 點. 沒交往：不打電話（照舊 00:07 私訊）',!OUT.get(G,'yt_nye_call_y3')); }
  // ===================== 第 5 節：麵店團 =====================
  const K0=STORY.knows, onlyKnow=ids=>{ STORY.knows=id=>ids.includes(id); }, knowReset=()=>{ STORY.knows=K0; };
  { const gt=(ev('ev_y2_club_expo').dialogue||[]).find(l=>l&&l.speaker==='yu');
    check('5-4. 社團博覽會吉他社 Alison：「欸{name}你負責發傳單！對了你會彈哪首？……三個和弦也行啦。」（不寫死「祐廷」、沒有「……好啦我知道」）',!!gt&&gt.text==='欸{name}你負責發傳單！對了你會彈哪首？……三個和弦也行啦。',gt&&gt.text); }
  // 大二初一：阿哲的「哥」照 ZHE_CALLS_GE（5-1 第 2 點）
  { const ny=D('2027-02-06'), NG='g:noodle_team', cny=(flags,k)=>{ fresh(ny,10.9,'home',flags); R('heroine_01','FAM'); R('yu','FAM'); PHONE.join(G,'noodle_team','麵店團'); run(10.9,11.2); PHONE.answer(G,'cny_noodle_y2_reply',k); return txt(NG).filter(t=>/太多菜|懂我/.test(t)); };
    check('5-1 第 2 點. 大二初一：有 ZHE_CALLS_GE「哥，你家也太多菜！」「哥懂我」；沒有的「你家也太多菜！」「懂我」',J(cny({ZHE_CALLS_GE:true},0))===J(['哥，你家也太多菜！'])&&J(cny({ZHE_CALLS_GE:true},1))===J(['哥懂我'])&&J(cny({},0))===J(['你家也太多菜！'])&&J(cny({},1))===J(['懂我']),J([cny({ZHE_CALLS_GE:true},0),cny({},1)])); }
  // 大一的晚餐、練球、宵夜（5-1 第 3 點、5-3）
  { const zd=ev('ev_zhe_dinner'), zb=ev('ev_zhe_ball'), ms=ev('ev_midnight_snack');
    check('5-3. ev_zhe_dinner：只在大一上、只一次（原本四年天天同一句）',J(zd.term)===J(['Y1S1'])&&zd.once===true,J([zd.term,zd.once]));
    fresh(STORY.termDay('Y1S2',3,5),17,'campus',{ball_invite:true}); G.events.last.ev_zhe_ball=STORY.termDay('Y1S2',1,5); const sameT=EVENTS.cond(zb.prereq); G.events.last.ev_zhe_ball=STORY.termDay('Y1S1',8,5); const otherT=EVENTS.cond(zb.prereq);
    check('5-1 第 3 點. ev_zhe_ball：只在大一、每學期一次（同一學期練過就不再演，換學期可以）',J(zb.term)===J(['Y1S1','Y1S2'])&&!sameT&&otherT,J([zb.term,sameT,otherT]));
    check('5-1 第 3 點. ev_midnight_snack：只在大一',J(ms.term)===J(['Y1S1','Y1S2']),J(ms.term));
    fresh(STORY.termDay('Y1S1',7,2),22.5,'dorm'); said=[]; picks=[0]; await EVENTS.run(ms); const La=lines(); fresh(STORY.termDay('Y1S1',7,2),22.5,'dorm'); said=[]; picks=[1]; await EVENTS.run(ms); const Lb=lines();
    check('5-1 第 3 點. 宵夜選「來了。」補一句旁白「（你們在夜市口站著吃完鹹酥雞，十二點才回宿舍。）」；選「下次」沒有',La.includes('（你們在夜市口站著吃完鹹酥雞，十二點才回宿舍。）')&&!Lb.includes('（你們在夜市口站著吃完鹹酥雞，十二點才回宿舍。）'),J([La,Lb])); }
  // 語 3（5-1 第 4 點）：排了電話又去了麵店＝不打；沒接＝阿哲的照片
  { const d19=D('2026-12-19'); fresh(d19,21.4,'dorm',{met_yu:true}); PHONE.join(G,'noodle_team','麵店團'); run(21.4,21.6); const q=OUT.get(G,'y2_yu_call'); G.events.done.ev_yu_together=1; run(21.65,21.7);
    check('5-1 第 4 點. 語 3 的電話排好以後又在麵店聽她當面講了：電話取消',!!q&&q.state==='cancelled',J(q));
    fresh(d19,21.4,'dorm',{met_yu:true}); PHONE.join(G,'noodle_team','麵店團'); run(21.4,21.6); const q2=OUT.get(G,'y2_yu_call'); if(q2){ q2.state='missed'; OUT.onMissed(GM,q2); } G.hour=22.3; PHONE.tick(G);
    check('5-1 第 4 點. 電話沒接：麵店團群組阿哲的照片（YU_ZHE_TOLD＝photo；之後聖誕禮物那則照常）',txt('g:noodle_team').includes('📷（麵店的長桌。Alison 比了一個 YA。）')&&G.flags.YU_ZHE_TOLD==='photo'&&!txt('p:yu').length,J([txt('g:noodle_team'),G.flags.YU_ZHE_TOLD])); }
  // 聖誕交換（5-3；12/17 他們還沒在一起）
  { const X=ev('ev_y2_xmas'); fresh(D('2026-12-17'),12.4,'campus'); onlyKnow(['zhe','yu']); G.flags.Y2_XMAS_FROM=null; said=[]; try{ await EVENTS.run(X); } finally { knowReset(); } const L=lines();
    check('5-3. 聖誕交換：「（阿哲先到。五分鐘後 Alison 也到了。）」；抽到阿哲的「你抽到阿哲的：一個保溫杯。Alison 送的那個，一模一樣。」',L.includes('（阿哲先到。五分鐘後 Alison 也到了。）')&&!L.includes('（阿哲和 Alison 一起來。）')&&L.includes('你抽到阿哲的：一個保溫杯。Alison 送的那個，一模一樣。'),J(L)); }
  // 升階的問句（5-1 第 11 點、5-3、5-4、5-6）
  { const pickUp=(id,lv,key)=>{ fresh(D(key),12,'campus'); const U=REL_LINES[id].up[lv]; const A=Array.isArray(U)?U:[U]; const u=A.find(x=>!x.if||x.if(G)); return u&&u.l; };
    check('5-3. 阿哲升 FAMILIAR：大一上「民總的報告」、其他學期「欸，這學期的報告你分好組了沒？」',J(pickUp('zhe','FAMILIAR','2025-10-01'))===J(['「欸，民總的報告你分好組了沒？」'])&&J(pickUp('zhe','FAMILIAR','2026-10-01'))===J(['「欸，這學期的報告你分好組了沒？」']));
    const yc=REL_LINES.yu.up.CLOSE_FRIEND.ch, xc=REL_LINES.classmate_xinci.up.CLOSE_FRIEND.ch;
    check('5-4、5-6. Alison、芯慈升 CLOSE 的問句接回答（「好啊。」／「那天不行。」）',J(yc)===J([{t:'好啊。',r:['「那我跟阿哲說多一個。」']},{t:'那天不行。',r:['「好啦，下次。」']}])&&J(xc)===J([{t:'好啊。',r:['「那週三下午，我先查好地方。」']},{t:'那天不行。',r:['「好。那我再問你。」']}]),J([yc,xc])); }
  check('5-3. 大二颱風夜（312）：開頭旁白「（柏翰在讀許教授的講義。阿哲已經在煮第二包了。）」',(ev('ev_y2_typhoon_kai').dialogue[0]||{}).text==='（柏翰在讀許教授的講義。阿哲已經在煮第二包了。）');
  // 主線 4 的週次（5-3、5-6）
  { const pk=(key,ids)=>{ fresh(D(key),21.5,'dorm',{}); for(const id of ids) R(id,'FAM'); return STORY.neededPick(G,D(key)).map(e=>e.id); };
    const w9=pk('2026-11-08',['zhe']), w10=pk('2026-11-15',['zhe']);
    check('5-3. zhe_notes 只在第 9 週（11/8 週日）；第 10 週（11/15，哲 2 之後）不發',w9.includes('zhe_notes')&&!w10.includes('zhe_notes'),J([w9,w10]));
    const x1=pk('2026-11-22',['classmate_xinci']), xs=NEEDED_MSGS.list.find(e=>e.id==='xc_contract'), yo=NEEDED_MSGS.list.find(e=>e.id==='yu_overtime');
    check('5-6. xc_contract 和 Alison 的 yu_overtime 不同學期：xc_contract 搬到大二下第 8～10 週（大二上第 11 週不發）',!x1.includes('xc_contract')&&xs.term==='Y2S2'&&J(xs.w)===J([8,10])&&yo.term==='Y2S1',J([x1,xs.term,xs.w])); }
  // 阿哲、Alison 舊的閒聊三句（5-3、5-4）
  if(!STORY._talkOld) check('5-3、5-4. 阿哲、Alison 舊的閒聊三句（STORY._talkOld）',false); else { const say=async(who,key,seed,flags)=>{ fresh(D(key),15,'campus',Object.assign({met_yu:true,companion:'x'},flags||{})); R(who,'FAM'); if(SOCIAL.markUp) SOCIAL.markUp(who,SOCIAL.friendLevel(who)); const n={id:who,charId:who,name:who,obj:{position:{x:1,y:0,z:1}},seat:null,lv:0}; const r0=Math.random; Math.random=()=>seed; said=[]; try{ await STORY._talkOld[who](GM,n); } finally { Math.random=r0; } return said.map(s=>s.t); };
    const NDL={noodleTableDay:STORY.termDay('Y1S1',4,4)};   /* 已經在麵店團（做過哲 1）：沒有的話＝錯過長桌，找阿哲說話先演麵店團的補救（AA_496 第 9 節第 3 點，ev_zhe_group_late_talk），這裡要看的是平常的閒聊 */
    const z2=await say('zhe','2027-04-14',0.01,NDL), z3=await say('zhe','2027-10-13',0.01,NDL);
    check('5-3. 阿哲的閒聊：系籃那句到大二下為止；大三起「這季我是隊長。週五你來記分。」',z2.includes('系籃週五練球，要來就來，不會打也可以來坐。')&&z3.includes('這季我是隊長。週五你來記分。')&&!z3.some(t=>/系籃週五練球/.test(t)),J([z2,z3]));
    const y21=await say('yu','2026-10-14',0.4), y22=await say('yu','2027-03-17',0.4);
    /* 2026-10-28 改：AA_497 3-8「三個社團」只留人物頁、第一次自我介紹、迎新旁白、語 1、聖誕禮物——大二上這一句換成「辯論社」（tests/aa497_supporting_unit.js 3-8）*/
    check('5-4. Alison 的閒聊：大二上「我這禮拜辯論社都要開會，快死了。」（AA_497 3-8）、大二下退了辯論社以後「我這禮拜兩個社團都要開會，快死了。」',y21.includes('我這禮拜辯論社都要開會，快死了。')&&!y21.includes('我這禮拜三個社團都要開會，快死了。')&&y22.includes('我這禮拜兩個社團都要開會，快死了。'),J([y21,y22]));
    const st=SMALLTALK.zhe.filter(e=>typeof e==='object'&&/系籃|隊長/.test(e.t));
    check('5-3. SMALLTALK 阿哲：系籃那句大一、大二；大三起「這季我是隊長。週五你來記分。」',st.length===2&&J(st[0].term)===J(['Y1S1','Y1S2','Y2S1','Y2S2'])&&st[1].t==='「這季我是隊長。週五你來記分。」'&&J(st[1].term)===J(['Y3S1','Y3S2','Y4S1','Y4S2']),J(st)); }
  // 迎新（5-3、5-4）：說了「哥」記 ZHE_CALLS_GE；還不認識阿哲、Alison 的說話人
  { const W=ev('ev_welcome_y1s1'), go=async(k,known)=>{ fresh(D('2025-08-31'),9,'campus',{}); onlyKnow(known); said=[]; picks=[k,0]; try{ await EVENTS.run(W); } finally { knowReset(); } return lines(); };
    let L=await go(1,[]); const g1=!!G.flags.ZHE_CALLS_GE;
    check('5-3. 迎新選「我比大家大一歲。」：記 ZHE_CALLS_GE；還不認識阿哲＝「旁邊一個男生：那我們叫你哥？」',g1&&L.includes('旁邊一個男生：那我們叫你哥？')&&!L.some(t=>/^阿哲：/.test(t)),J(L));
    L=await go(2,[]); const g2=!!G.flags.ZHE_CALLS_GE&&G.flags.ECON_PAST_SHARED==='full';
    check('5-3、5-4. 迎新選「念過經濟系」：記 ZHE_CALLS_GE、ECON_PAST_SHARED；不認識的「旁邊一個男生：哥！」「前面一個女生：欸，為什麼重考？」',g2&&L.includes('旁邊一個男生：哥！')&&L.includes('前面一個女生：欸，為什麼重考？')&&!L.some(t=>/^(阿哲|Alison)：/.test(t)),J(L));
    L=await go(2,['zhe','yu']); check('5-3、5-4. 都認識：照舊是阿哲、Alison',L.includes('阿哲：哥！')&&L.includes('Alison：欸，為什麼重考？'),J(L)); }
  // 柏翰（5-1 第 13 點、5-5）：值班分大二、大三起；大二第一次值班的開場；聽到分開以後第一次說話
  { const MEM={lawclub:true,CLUB_lawclub_study:true}, shift=async(term,w,flags)=>{ fresh(STORY.termDay(term,w,6),9,'wancai',Object.assign({},MEM,flags||{})); G.stage='law'; R('classmate_bohan','FAM'); R('heroine_05','FAM'); picks=['從頭講','先走']; said=[]; await STORY.fafuShift(GM); return lines().filter(t=>/柏翰：/.test(t)); };
    const a=await shift('Y2S1',7), b=await shift('Y2S1',11,{FAFU_BH_HELLO:1}), c=await shift('Y3S1',3,{FAFU_BH_HELLO:1});
    check('5-5. 大二第一次值班（他當社長以後）：柏翰開場「這學期起我排班。有事找我。」，那一次不再說班表那句',a.length===1&&a[0].endsWith('：這學期起我排班。有事找我。'),J(a));
    check('5-1 第 13 點. 之後的大二值班：照舊班表那兩句；大三起「我交接了。現在只排我自己的班。」「學弟排錯一格。我沒說。」（不說「我以為社長只要排班」）',b.length===1&&STORY.FAFU_BH.some(t=>b[0].endsWith('：'+t))&&c.length===1&&(STORY.FAFU_BH_Y3||[]).some(t=>c[0].endsWith('：'+t))&&!c.some(t=>/社長只要排班/.test(t)),J([b,c]));
    const f6=STORY.termDay('Y2S1',6,5); fresh(f6,20.9,'dorm',{}); PHONE.join(G,'noodle_team','麵店團'); R('classmate_bohan','FRI'); R('classmate_peishan','FAM'); run(20.9,21.1); const sent=PHONE.sent(G,'ps_split_group');
    G.day=f6+1; G.weekday=wdOf(G.day); G.hour=15; G.zone='campus'; if(SOCIAL.markUp) SOCIAL.markUp('classmate_bohan',SOCIAL.friendLevel('classmate_bohan')); const n={id:'classmate_bohan',name:'柏翰',obj:{position:{x:1,y:0,z:1}},seat:null,lv:0};
    said=[]; picks=[]; await STORY.talkCharacter('classmate_bohan',n); const t1=said.map(s=>s.t); said=[]; await STORY.talkCharacter('classmate_bohan',n); const t2=said.map(s=>s.t);
    check('5-5. 沛珊在群組說分開、沒當面聽過：下一次和柏翰說話他先說「沛珊在群組說了。」「……嗯。這週我想多念一點。」，只一次',sent&&t1[0]==='「沛珊在群組說了。」'&&t1[1]==='「……嗯。這週我想多念一點。」'&&!t2.some(t=>/沛珊在群組說了/.test(t)),J([sent,t1,t2])); }
  // 大三跨年（5-6）：以安、芯慈要認識
  { const E3=ev('ev_y3_newyear'); fresh(D('2027-12-31'),23.5,'dorm',{}); onlyKnow(['zhe','yu','classmate_bohan']); said=[]; try{ await EVENTS.run(E3); } finally { knowReset(); } const L=lines();
    check('5-6. 大三頂樓：不認識以安、芯慈＝沒有她們的句子（也沒有 Alison 問以安行李那段）',!L.some(t=>/以安|芯慈/.test(t))&&L.includes('阿哲：下禮拜吃飯喔。'),J(L)); }
  // 芯慈松菸（5-6）：旁白拆出來
  { const row=ENCOUNTERS.rows.find(r=>r.who==='classmate_xinci'&&r.spot==='D02'); fresh(D('2026-10-04'),14,'d02',{}); R('classmate_xinci','FRI'); said=[]; picks=[0]; await ENC.meet(GM,row,{t:'friend',st:'FRIEND'}); const L=lines();
    check('5-6. 松菸芯慈（朋友）：「（你看了一下。沒算錯。）」是旁白、她只說「……是我買太多。」',L.includes('（你看了一下。沒算錯。）')&&L.some(t=>/^吳芯慈：……是我買太多。$/.test(t))&&!L.some(t=>/吳芯慈：（你看了一下）/.test(t)),J(L)); }
  // 沒有測試寫死的句子
  { const S=SRC('src/story3d.js'), xs=ev('ev_xinci_second').dialogue, beach=evTexts('ev_va03_beach'), m=STORY_EVENTS.find(e=>e.id==='ev_va03_beach');
    check('5-5. 海邊：柏翰那句改旁白「（柏翰站在離浪最遠的地方，鞋子拿在手上。）」',beach.includes('（柏翰站在離浪最遠的地方，鞋子拿在手上。）')&&!beach.includes('冬天的海大概十八度。')&&m.dialogue.find(l=>l.text==='（柏翰站在離浪最遠的地方，鞋子拿在手上。）').speaker===null);
    check('5-6. 大二拆箱的便利貼：刪「……她改得對。」（旁白不替玩家下結論）',S.includes("'她改了你的筆記。'")&&!S.includes('她改得對'));
    check('5-6. 慈 3（溫州街便利商店）開頭旁白加「（她背包還背著，手機上是叫車的畫面。）」',xs[1]&&xs[1].text==='（她背包還背著，手機上是叫車的畫面。）'&&xs[1].speaker===null);
    check('5-5. 美術館之後柏翰的一句：暫代「美術館那張長椅，我下個月還會去坐。」（不說「阿哲問的話，就說我在總圖」）',J(ENCOUNTERS.school.ENC_D06_BH.lines)===J(['美術館那張長椅，我下個月還會去坐。']));
    { const ops=['ev_zhe_w1_dorm','ev_zhe_w1_meet'].map(id=>choiceTexts(id).filter(t=>/麵店/.test(t)));
      check('5-3. 開學第一週阿哲問吃什麼：選項「校門對面那排有一間麵店，便宜，份量也夠。」（阿鳳麵店在公館那排店面；AA_389 第 6 點照逐場表）',ops.every(o=>J(o)===J(['「校門對面那排有一間麵店，便宜，份量也夠。」'])),J(ops)); }
    fresh(D('2025-09-01'),9,'dorm',{}); STORY.phoneRules(GM); const q=PHONE.rec(G).q.find(x=>x.tag==='bbq_ask');
    check('5-3. 中秋烤肉的群組訊息不加句號「週六中秋烤肉 河濱 下午三點」',!!q&&q.items[0].text==='週六中秋烤肉 河濱 下午三點',q&&q.items[0].text); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
