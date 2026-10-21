// 沛珊放榜以後在台南（AA_282 第 5 節，AA-C 2026-10-18；AA_342 C2；任務 PS-TAINAN-AA282）——不需要瀏覽器。
//   1. presence：8/6～9/3 台中老家、開學前 2 天回台南；大三、大四學期中在台南（kind 'city'、不在臺北、不在台大）；寒暑假台中（期末考最後一天的第 3 天回去）；
//      手機「現在大概在」：重新聯絡上以前「很久沒聯絡」、以後「在台中」「在台南」（第 1 節的表）
//   2. 大三起沒有臺北的作息、偶遇（溫州街課輔班、公館書店、美術館 D06、烏來 D20、動物園 D08 的大三下／大四下）；大一下的 D08 照舊；enc_walk D06.cafe 拿掉
//   3. 第 2 節的訊息：8/07 21:00 消失期傳過訊息的回一則；之後第一次傳訊息「好久不見。……我現在在台南。」「你要來的話，跟我說。」
//   4. 邀約：學期中「我去台南找妳？」（出遊 ev_hv_ps_tn）、寒暑假「我去台中找妳？」；約臺北的地點＝「郭沛珊在台南，不在臺北。」；還沒重新聯絡上的不能約；沒有視訊（沒交往的不開）
//   5. 閒聊階梯：大三上～大四下 context:'date'，3D 搭話不推進，去台南那一天演完接著聊一層（一天一層）；寒暑假去台中不推進
//   6. 學期末心意邀約、女朋友的學期末約會：大三起在台南她學校附近（地點字幕、走回她租的地方、搭最後一班高鐵回臺北、票錢 2700）；時段在她回台中以前；朋友的邀約不發；還沒重新聯絡上的不發
// 修改前：presence 是「在臺北、不在台大」（kind taipei）、臺北作息與偶遇都在、學期中沒有「我去台南找妳？」、期末飯在舊路書房旁邊的簡餐。用法：node tests/peishan_tainan_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|Y2B|Y2B_EVENTS|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js',
  'src/story3d.js','src/classes3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(a,b){ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  spawnCharacter(id,x,z){ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},lv:0}; GM.npc[id]=n; return n; },removeNPC(id){ delete GM.npc[id]; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const C=id=>{ G.contacts[id]=0; };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const has=t=>said.some(s=>s.t===t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ID='classmate_peishan', TH_PS='p:'+ID;
const P=(day,flags)=>STORY.presence(ID,{day,flags:flags||{},stage:'law'});
const termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
(async()=>{
  // ===== 1. presence（AA_282 第 1 節）=====
  { const K={PS_BACK_FIRST:1};
    const a=P(D('2027-08-07')), b=P(D('2027-08-10'),K), c=P(D('2027-09-03'),K), d=P(D('2027-09-04'),K), e=P(termDay('Y3S1',5,3),K), f=P(termDay('Y4S2',5,3),K), g=P(D('2027-05-01'));
    check('1. 8/7（還沒重新聯絡上）：不在、台中老家、手機「很久沒聯絡」', a.here===false&&a.kind==='home'&&a.home==='台中'&&a.away==='很久沒聯絡'&&a.lost===true, JSON.stringify(a));
    check('1. 2027-08-10（重新聯絡上）：台中老家「在台中」；9/3 還在台中', b.kind==='home'&&b.home==='台中'&&b.away==='在台中'&&!b.lost&&c.kind==='home'&&c.home==='台中', JSON.stringify([b,c]));
    check('1. 開學前 2 天（9/4）回台南：kind city、city 台南、「在台南」', d.here===false&&d.kind==='city'&&d.city==='台南'&&d.away==='在台南', JSON.stringify(d));
    check('1. 大三上、大四下的學期中：台南（不是 taipei、不在台大、約不到臺北）', e.here===false&&e.kind==='city'&&e.city==='台南'&&e.away==='在台南'&&f.kind==='city'&&f.city==='台南'
      &&!STORY.present(ID,{day:termDay('Y3S1',5,3),flags:K})&&!STORY.reachable(ID,{day:termDay('Y3S1',5,3),flags:K}), JSON.stringify([e,f]));
    check('1. 消失期（2027-05-01）照舊聯絡不到', g.kind==='unreachable', JSON.stringify(g));
    const pg1=P(D('2029-06-20'),K), pg2=P(D('2030-03-04'),K);
    check('1. 祐廷畢業以後（2029-06-20、2030-03-04：日曆沒有學期了）照樣在台南、不會變回在台大', pg1.kind==='city'&&pg1.city==='台南'&&pg2.here===false&&pg2.kind==='city'&&pg2.city==='台南', JSON.stringify([pg1,pg2]));
    // 寒暑假：期末考最後一天（第 16 週週五）的第 3 天回台中、開學前 2 天回台南
    const r=CALENDAR.termDays('Y3S1'), sun=P(r.to,K), mon=P(r.to+1,K), mid=P(D('2028-01-10'),K), pre=P(D('2028-02-19'),K), pre1=P(D('2028-02-18'),K);
    check('1. 大三寒假：12/26（第 16 週週日）還在台南、12/27 回台中「在台中」、2/18 還在台中、2/19（開學前 2 天）回台南', sun.kind==='city'&&mon.kind==='home'&&mon.home==='台中'&&mon.away==='在台中'&&mid.kind==='home'&&pre1.kind==='home'&&pre.kind==='city', JSON.stringify([sun.kind,mon,mid.kind,pre1.kind,pre.kind]));
    check('1. 交往中（沒有其他旗標）也不是「很久沒聯絡」', P(termDay('Y3S1',5,3),{dating_classmate_peishan:true}).away==='在台南');
    check('1. 大一的寒假照舊「寒暑假在台中的家」（homeText 只從 2027-08-06 起）', P(D('2026-01-30')).away==='寒暑假在台中的家', JSON.stringify(P(D('2026-01-30'))));
    fresh(termDay('Y3S1',5,2),17,'campus',K); R(ID,'FRI'); const w=STORY.whereIs(GM,ID);
    check('1. 手機「現在大概在」：大三週二 17:00「在台南」（不是溫州街）', !!w&&w.zone===null&&w.away==='在台南', JSON.stringify(w));
    fresh(termDay('Y3S1',5,2),17,'campus',{}); R(ID,'FRI'); const w2=STORY.whereIs(GM,ID);
    check('1. 還沒重新聯絡上：「很久沒聯絡」', !!w2&&w2.away==='很久沒聯絡', JSON.stringify(w2)); }

  // ===== 2. 大三起沒有臺北的作息、偶遇（AA_282 第 5 節第 1 點、AA_342 C2）=====
  { const S=CHARACTERS[ID].daily_schedule, Y34=['Y3S1','Y3S2','Y4S1','Y4S2'];
    const bad=S.filter(r=>(r.terms||[]).some(t=>Y34.includes(t))||['wenzhou','bookstore'].includes(r.zone)&&!(r.terms||[]).every(t=>/^Y[12]/.test(t))||['D06','D20'].includes(r.enc));
    check('2. 作息：大三起的溫州街課輔班、公館書店（週六、週日）、美術館 D06、烏來 D20 都拿掉', !bad.length, JSON.stringify(bad.map(r=>r.note||r.zone)));
    const d08=S.find(r=>r.enc==='D08');
    check('2. 動物園 D08：只留大一下（大三下、大四下拿掉）', !!d08&&JSON.stringify(d08.terms)==='["Y1S2"]', JSON.stringify(d08&&d08.terms));
    const rows=ENCOUNTERS.rows.filter(r=>r.who===ID);
    check('2. 偶遇：沛珊沒有大三起的列（D06 美術館、D20 烏來拿掉；D08 只有大一下）', rows.every(r=>!(r.terms||[]).some(t=>Y34.includes(t)))&&!rows.some(r=>r.spot==='D06'||r.spot==='D20')&&JSON.stringify((rows.find(r=>r.spot==='D08')||{}).terms)==='["Y1S2"]', rows.map(r=>r.spot+JSON.stringify(r.terms)).join(' '));
    check('2. enc_walk 沛珊 D06.cafe（「十一點半以前，我得去書店顧童書區。」）拿掉（AA_263 C22）', !ENC_WALK.walk.some(q=>q.who===ID&&q.act==='D06.cafe'));
    // 動物園：大一下第 9 週週六 10:00 照舊遇得到；大三下同一週沒有
    const atD08=(day,flags)=>{ fresh(day,10,'gongguan',flags); R(ID,'FRI'); return ENC.candidates(G,'D08').map(c=>c.row.who); };
    check('2. 大一下第 9 週週六 10:00：動物園遇得到沛珊（照舊）', atD08(termDay('Y1S2',9,6)).includes(ID));
    check('2. 大三下、大四下第 9 週週六 10:00：動物園沒有沛珊', !atD08(termDay('Y3S2',9,6),{PS_BACK_FIRST:1}).includes(ID)&&!atD08(termDay('Y4S2',9,6),{PS_BACK_FIRST:1}).includes(ID));
    fresh(termDay('Y3S1',11,6),11,'gongguan',{PS_BACK_FIRST:1}); R(ID,'FRI'); check('2. 大三上第 11 週週六：烏來沒有沛珊', !ENC.candidates(G,'D20').some(c=>c.row.who===ID));
    fresh(termDay('Y3S1',5,7),10,'gongguan',{PS_BACK_FIRST:1,WISH_DONE_classmate_peishan:true}); R(ID,'FRI'); check('2. 大三起週日 10:00（心願事件以後）：美術館沒有沛珊', !ENC.candidates(G,'D06').some(c=>c.row.who===ID));
    const WH=[]; for(const [t,w,wd,h] of [['Y3S1',5,2,17],['Y3S1',5,6,15],['Y4S1',5,7,15],['Y4S2',5,3,17]]){ fresh(termDay(t,w,wd),h,'campus',{PS_BACK_FIRST:1}); R(ID,'FRI'); const x=STORY.whereIs(GM,ID); WH.push((STORY.reachable(ID,G)?'reachable':'')+(x&&x.zone||'')+'|'+(x&&x.away)); }
    check('2. 大三、大四（週二 17:00 課輔班、週六 15:00 書店、週日 15:00、大四下週三）：不在臺北的場景（作息不生人：reachable false）、人物線索都是「在台南」', WH.every(s=>s==='|在台南'), JSON.stringify(WH)); }

  // ===== 3. 第 2 節的訊息 =====
  { const d7=D('2027-08-07');
    fresh(d7,20,'dorm',{}); R(ID,'FRI'); C(ID); (G.msgs||(G.msgs=[])).push({th:TH_PS,from:'player',who:null,text:'妳還好嗎？',day:D('2027-03-01'),h:20});
    run(d7,20,21.5);
    check('3. 消失期傳過訊息（沒交往）：8/07 21:00「……這半年我都沒看手機。對不起。」「我現在很好。」（只有這兩則）；之後不是「很久沒聯絡」', JSON.stringify(txt(TH_PS).filter(t=>t.startsWith(ID)))===JSON.stringify([ID+':……這半年我都沒看手機。對不起。',ID+':我現在很好。'])&&typeof G.flags.PS_BACK_READ==='number'&&STORY.presence(ID,G).away==='在台中', JSON.stringify(txt(TH_PS)));
    fresh(d7,20,'dorm',{}); R(ID,'FRI'); C(ID); run(d7,20,21.5);
    check('3. 沒傳過：8/07 不回、她也不先傳（大二下那一則重考的問題放榜以後不傳）、還是「很久沒聯絡」、不能去找她', !txt(TH_PS).length&&STORY.presence(ID,G).lost===true&&HV.offer(G,ID)===null, JSON.stringify(txt(TH_PS)));
    G.day=D('2027-08-12'); G.hour=20; const tp=MSG.topics(G,ID); const r=tp.length?MSG.send(G,ID,tp[0].k):null; run(G.day,20,22);
    check('3. 之後第一次傳訊息：「好久不見。……我現在在台南。」「你要來的話，跟我說。」；重新聯絡上（PS_BACK_FIRST）', !!r&&r.ok&&JSON.stringify(txt(TH_PS).filter(t=>t.startsWith(ID)).slice(0,2))===JSON.stringify([ID+':好久不見。……我現在在台南。',ID+':你要來的話，跟我說。'])&&G.flags.PS_BACK_FIRST!=null&&!STORY.presence(ID,G).lost, JSON.stringify(txt(TH_PS)));
    fresh(d7,20,'dorm',{}); date(ID); C(ID); (G.msgs||(G.msgs=[])).push({th:TH_PS,from:'player',who:null,text:'晚安',day:D('2027-03-01'),h:23}); run(d7,20,21.5);
    check('3. 交往中：8/07 不是那一則（照 PS_KEEP_BACK）', !txt(TH_PS).includes(ID+':我現在很好。')); }

  // ===== 4. 邀約（AA_282 第 3 節、第 5 節第 3 點）=====
  { const d=termDay('Y3S1',6,3);
    fresh(d,12,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID);
    const o=HV.offer(G,ID);
    check('4. 大三學期中（重新聯絡上、沒交往）：手機約她＝「我去台南找妳？」（台南那一組，高鐵約一小時四十分鐘）', HV.key(G,ID)===ID+'@台南'&&!!o&&o.ok===true&&HOMETOWN_LINES[HV.key(G,ID)].ask==='我去台南找妳？'&&INV.canInvite(G,ID)&&INV.whyNot(G,ID)==='', JSON.stringify([o,INV.whyNot(G,ID)]));
    picks=['算了']; opts=[]; await INV.flow(GM,ID,null,false); const O=opts[0]||[];
    check('4. 手機約她的清單：有「我去台南找妳？」、沒有視訊（沒交往的不開視訊）', O.includes('我去台南找妳？')&&!O.some(t=>/視訊/.test(t)), JSON.stringify(O));
    const r=INV.decide(G,ID,'cafe',d+1,15);
    check('4. 約臺北的地點（Café）：不行，「郭沛珊在台南，不在臺北。」', r.res==='decline'&&r.why==='away'&&INV.reply(G,ID,'cafe',r)==='郭沛珊在台南，不在臺北。', JSON.stringify([r,INV.reply(G,ID,'cafe',r)]));
    picks=[0]; said=[]; const day=await HV.ask(GM,ID); const q=OUT.rec(G).find(x=>x.hv&&x.hv.id===ID);
    check('4. 約好：出遊「去台南找郭沛珊」（ev_hv_ps_tn，回程一小時四十五分）', day===d+1&&!!q&&q.ev==='ev_hv_ps_tn'&&q.place==='台南'&&q.travelH===1.75&&q.hv.key===ID+'@台南'&&!!STORY_EVENTS.find(e=>e.id==='ev_hv_ps_tn'&&e.hours===1.75), JSON.stringify(q));
    fresh(d,12,'dorm',{}); R(ID,'FRI'); C(ID);
    check('4. 還沒重新聯絡上：沒有「我去台南找妳？」、不能約、寫「很久沒聯絡」', HV.offer(G,ID)===null&&!INV.canInvite(G,ID)&&INV.whyNot(G,ID)==='很久沒聯絡', INV.whyNot(G,ID));
    fresh(D('2028-01-10'),12,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID);
    check('4. 大三寒假：「我去台中找妳？」（台中那一組）', HV.key(G,ID)===ID&&!!HV.offer(G,ID)&&HOMETOWN_LINES[HV.key(G,ID)].ask==='我去台中找妳？');
    fresh(d,12,'dorm',{}); date(ID); C(ID); picks=['算了']; opts=[]; await INV.flow(GM,ID,null,false);
    check('4. 交往中：約她的清單也沒有視訊（AA_282 只說交往中的可以視訊，遊戲還沒有沛珊的視訊）', (opts[0]||[]).includes('我去台南找妳？')&&!(opts[0]||[]).some(t=>/視訊/.test(t)), JSON.stringify(opts[0]));
    // 校外約會（DATE）：她不來臺北（AA_282 第 6 節第 1 點）——臺北市的地點約不到，外縣市不擋
    fresh(d,12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID);
    const c1=DATE.check(G,{who:ID,locs:['D06'],day:d+3,depart:10}), c2=DATE.check(G,{who:ID,locs:['D13'],day:d+3,depart:10}), w0=typeof DATE.noTaipei==='function'?DATE.noTaipei(G,ID,d+3,'D06'):null;
    check('4. 校外約會：臺北市的地點（北美館）約不到「她那時候在台南，不來臺北」；新北（淡水）不擋', !c1.ok&&c1.why==='她那時候在台南，不來臺北'&&w0===c1.why&&c2.why!==c1.why, JSON.stringify([c1.why,c2.ok,c2.why]));
    fresh(D('2028-01-10'),12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); const c4=DATE.check(G,{who:ID,locs:['D06'],day:G.day+3,depart:10});
    check('4. 大三寒假：臺北市的地點也約不到「她那時候在台中，不來臺北」', !c4.ok&&c4.why==='她那時候在台中，不來臺北', JSON.stringify(c4.why));
    fresh(termDay('Y1S2',5,3),12,'dorm',{}); R(ID,'CLO'); C(ID); const c3=DATE.check(G,{who:ID,locs:['D06'],day:G.day+3,depart:10});
    check('4. 大一（放榜以前）照舊：北美館不擋', !/不來臺北/.test(c3.why||''), JSON.stringify(c3.why)); }

  // ===== 5. 閒聊階梯（AA_282 第 3 節；context:'date'）=====
  { check('5. 階梯資料：大三上～大四下的沛珊是 context:date（白名單 49ed7e6a，AA_282 第 4 節已改）', ['Y3S1','Y3S2','Y4S1','Y4S2'].every(t=>LADDER.byTerm[t]&&LADDER.byTerm[t][ID]&&LADDER.byTerm[t][ID].context==='date'));
    check('5. 大四上兩個記憶的名稱照 AA_262 第 6 點：「沛珊說她晚兩年」「沛珊選了國小」', SOCIAL.MEMORY_LABEL.PS7_SPECIAL_ED==='沛珊說她晚兩年'&&SOCIAL.MEMORY_LABEL.PS7_DECIDE==='沛珊選了國小', JSON.stringify([SOCIAL.MEMORY_LABEL.PS7_SPECIAL_ED,SOCIAL.MEMORY_LABEL.PS7_DECIDE]));
    const L=LADDER.byTerm.Y3S1[ID].steps, d=termDay('Y3S1',6,4);
    fresh(d,10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID);
    check('5. 3D 搭話（沒有 mode）不推進', STORY.ladNext(G,ID)===null);
    said=[]; picks=[0,0]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
    const so=G.social, k=ID+'@Y3S1', i1=said.findIndex(s=>s.t===L[0].lines[0]), iSend=said.findIndex(s=>s.t==='謝謝你跑這麼遠！到臺北傳給我喔。');
    check('5. 去台南那一天：演完地方那一段接著聊一層（P5-L1），在送上車以前', (so.ladder[k]|0)===1&&i1>0&&iSend>i1&&has(L[0].lines[1]), JSON.stringify(said.map(s=>s.t)));
    said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
    check('5. 同一天再去：不再推進（一天一層）', (so.ladder[k]|0)===1&&!has(L[1].lines[0]));
    G.day=d+1; G.weekday=wdOf(G.day); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
    check('5. 下一次（隔天）：P5-L2「我週末在學校附近的二手書店打工。……」', (so.ladder[k]|0)===2&&has(L[1].lines[0]), JSON.stringify(said.map(s=>s.t)));
    fresh(D('2028-01-10'),10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID}});
    check('5. 寒假去台中：不推進（寒暑假沒有學期）', !Object.keys(G.social.ladder||{}).some(x=>x.startsWith(ID))&&has('（台中車站。她在出口揮手，揮得很大。）')); }

  // ===== 6. 學期末的飯（AA_282 第 5 節第 5 點；AA_254 第 6 節）=====
  { const hf=TERMEND.hookFor; TERMEND.hookFor=()=>null;
    const setup=(term,fl)=>{ const w=TERMEND.windowOf(term); fresh(w.from,12,'campus',fl||{}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=40; DATE.log(G,ID).count=4; DATE.log(G,ID).wish=true; return w; };
    let w=setup('Y3S1',{PS_BACK_FIRST:1}); run(w.from,20,21,0.05);
    const m=(G.msgs||[]).find(x=>x.tag==='te_Y3S1_'+ID);
    check('6. 大三上（重新聯絡上）：心意的邀約照發「期末考完了！吃飯好不好？就我們兩個。我有問題想問你。」', !!m&&m.text==='期末考完了！吃飯好不好？就我們兩個。我有問題想問你。', JSON.stringify((G.msgs||[]).filter(x=>/^te_/.test(x.tag||'')).map(x=>x.tag+':'+x.text)));
    PHONE.answer(G,'te_Y3S1_'+ID,0); STORY.phoneRules(GM); const q=OUT.get(G,'te_Y3S1');
    check('6. 地點＝台南・她學校附近的簡餐、高鐵（去台南）約兩小時、回程「搭最後一班高鐵回到臺北。」', !!q&&q.place==='台南・她學校附近的簡餐'&&q.travel==='高鐵（去台南）約兩小時'&&q.travelH===2&&q.back==='搭最後一班高鐵回到臺北。', JSON.stringify(q));
    check('6. 日子：期末考最後一天（週五）起、她回台中以前（第 16 週週日以前）', !!q&&q.day>=w.from+1&&q.day<=w.termTo&&STORY.presence(ID,Object.assign({},G,{day:q.day})).kind==='city', JSON.stringify(q&&[q.day,w.from,w.termTo]));
    G.day=q.day; G.hour=18.5; said=[]; caps=[]; picks=[3,0]; const m0=G.money; await TERMEND.dinner(GM,q);
    check('6. 飯：深色底＋地點字幕「台南・她學校附近的簡餐」、開場收尾照一對一的簡餐、飯桌一句不變；高鐵 2700', caps.includes('台南・她學校附近的簡餐')&&has('（簡餐店的電視在播新聞。靠窗的兩人座。）')&&has('我這學期問了你幾個問題？……我有數，你猜。')&&G.money===m0-2700, JSON.stringify(caps));
    check('6. 回家的路：字幕「台南・往她租的地方」（AA_262 第 5 點、AA_260 第 17 項）、第一句「今天謝謝你來。……你要講什麼嗎？」、先不說→她說→「好。」交往', caps.includes('台南・往她租的地方')&&has('今天謝謝你來。……你要講什麼嗎？')&&has('你喜歡我嗎？……因為我喜歡你。')&&G.flags.dating_classmate_peishan===true, JSON.stringify(caps));
    check('6. 舊的地點不再出現（舊路書房旁邊的簡餐、溫州街・小公園）', !JSON.stringify(TERMEND.heart(ID,'Y3S1')).includes('舊路書房')&&!JSON.stringify(TERMEND.gf(ID,'Y4S1')).includes('舊路書房')&&TERMEND.heart(ID,'Y4S1').placeName==='台南・她學校附近的簡餐'&&TERMEND.heart(ID,'Y1S2').placeName==='系館附近的簡餐');
    w=setup('Y3S1',{}); run(w.from,20,21,0.05);
    check('6. 還沒重新聯絡上：不發心意邀約（她不先找人）', !(G.msgs||[]).some(x=>(x.tag||'').indexOf(ID)>=0&&/^te_/.test(x.tag||'')));
    w=setup('Y3S2',{PS_BACK_FIRST:1}); SOCIAL.rel(ID).npcRom=10; G.termend={contact:{Y3S2:{[ID]:{pts:20,k:{}}}},think:{}}; const PL=TERMEND.plan(G,w);
    check('6. 大三起：朋友的邀約不發（AA_250 第 5 節：她不來這一桌）', !PL.friend.includes(ID)&&!PL.heart.includes(ID), JSON.stringify(PL));
    w=setup('Y4S1',{PS_BACK_FIRST:1}); date(ID); run(w.from,20,21,0.05); const g=(G.msgs||[]).find(x=>x.tag==='te_gf_Y4S1_'+ID);
    PHONE.answer(G,'te_gf_Y4S1_'+ID,0); STORY.phoneRules(GM); const qg=OUT.get(G,'te_gf_Y4S1_'+ID);
    check('6. 交往中（大四上）：女朋友的學期末約會「期末考完了！今天吃飯，我想吃熱的。」在台南', !!g&&g.text==='期末考完了！今天吃飯，我想吃熱的。'&&!!qg&&qg.place==='台南・她學校附近的簡餐'&&qg.back==='搭最後一班高鐵回到臺北。', JSON.stringify([g&&g.text,qg]));
    TERMEND.hookFor=hf; }

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
