// AA_313 第 4 節（以安、語彤，AA313-S4-1020）——不需要瀏覽器。
//   清單照 docs/handoff/audit_1022/AA313_REMAINING_1022.md §4；句子照 AA_313 4-1 裁定、4-3／4-4 逐場表（企劃線）。寫死的舊句在各自的測試改了，這裡測行為和沒有測試的句子。
//   以安：寒暑假 talkAn 的備用句、日語課 C03 要認識她、C05 日本五天同一天兩則、an_admin（另見 aa374_y2s1_unit）、貓空 D09 大四下、career_goal、告白白板 {name}；
//   語彤：總圖門口（旁白、點頭就走不算認識）、雨天最後一句、ev_yutong_thanks 的選項、雙主修筆試 6/18 18:00＋期末飯、邀約選單、大三跨年 00:01 的電話。
//   聖誕交換 12/17、大二頂樓「還在捷運上」的條件見 v3_d12_unit。
// 修改前（開發分支 8f9b305c）：每一項都會失敗。用法：node tests/aa313_s4s5_unit.js
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
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
