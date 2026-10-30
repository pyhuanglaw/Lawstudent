// 沛珊放榜以後在台南（AA_282 第 5 節，AA-C 2026-10-18；AA_342 C2；任務 PS-TAINAN-AA282）——不需要瀏覽器。
//   1. presence：8/6～9/3 台中老家、開學前 2 天回台南；大三、大四學期中在台南（kind 'city'、不在臺北、不在台大）；寒暑假台中（期末考最後一天的第 3 天回去）；
//      手機「現在大概在」：重新聯絡上以前「很久沒聯絡」、以後「在台中」「在台南」（第 1 節的表）
//   2. 大三起沒有臺北的作息、偶遇（溫州街課輔班、公館書店、美術館 D06、烏來 D20、動物園 D08 的大三下／大四下）；大一下的 D08 照舊；enc_walk D06.cafe 拿掉
//   3. 第 2 節的訊息：8/07 21:00 消失期傳過訊息的回一則（AA_296 2-3-1 ④ 起是她打來的電話，沒接才是那兩則；2026-10-22 改了期待值）；之後第一次傳訊息「好久不見。……我現在在台南。」「你要來的話，跟我說。」
//   4. 邀約：學期中「我去台南找妳？」（出遊 ev_hv_ps_tn）、寒暑假「我去台中找妳？」；約臺北的地點＝「郭沛珊在台南，不在臺北。」；還沒重新聯絡上的不能約；沒有視訊（沒交往的不開）
//   5. 閒聊階梯：大三上～大四下 context:'date'，3D 搭話不推進，去台南那一天演完接著聊一層（一天一層）；寒暑假去台中不推進
//   6. 學期末心意邀約、女朋友的學期末約會：大三起在台南她學校附近（地點字幕、走回她租的地方、搭最後一班高鐵回臺北、票錢 2700）；時段在她回台中以前；朋友的邀約不發；還沒重新聯絡上的不發
//   7. AA_349（2026-10-21）：K1 第一次回覆分台中／台南；K3 北部全部擋、去台南／台中算正式約會、心願地點「台南・美術館」（聊天提到、她主動約、玩家主動約、那一天）；K4 寒假去台中、台南的期末飯、公開課、視訊都推進一層（同一天最多一層）；K5 交往中的視訊；K11 字
//   8. AA_350（2026-10-21）：P1 放榜以後第一次傳訊息，寒暑假（她在台中）回台中那一句、學期中回台南那一句；P5 2030、2031 寒假 1/20～2/18、暑假 6/25～8/31 在台中（含頭尾）、其他日子在台南
// 修改前：presence 是「在臺北、不在台大」（kind taipei）、臺北作息與偶遇都在、學期中沒有「我去台南找妳？」、期末飯在舊路書房旁邊的簡餐。AA_349 那一批修改前：第 7 節全部失敗（沒有台南的美術館、去台南不計次、沒有視訊）。
// AA_350 那一批修改前（開發分支 5c471a79）：第 8 節 9 項 FAIL 7（寒暑假第一次回覆都是「我現在在台南。」、2030 寒暑假也在台南；學期中那兩項本來就對）。用法：node tests/peishan_tainan_unit.js
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
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
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
    const pg1=P(D('2029-06-20'),K), pg2=P(D('2030-03-04'),K), pg0=P(D('2029-06-08'),K), pg3=P(D('2029-07-14'),K), pg4=P(D('2029-08-31'),K), pg5=P(D('2029-09-01'),K);
    check('1. AA_349 K6 祐廷畢業以後（日曆沒有學期了，不會變回在台大）：6/8 她的期末考最後一天還在台南、6/11 起 2029 暑假在台中（6/20、7/14、8/31）、9/1（秋季開學前 2 天）回台南；2030-03-04 在台南',
      pg0.kind==='city'&&pg0.city==='台南'&&pg1.kind==='home'&&pg1.home==='台中'&&pg1.away==='在台中'&&pg3.kind==='home'&&pg4.kind==='home'&&pg5.kind==='city'&&pg5.city==='台南'&&pg2.here===false&&pg2.kind==='city'&&pg2.city==='台南', JSON.stringify([pg0,pg1,pg3,pg4,pg5,pg2]));
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
    /* AA_296 2-3-1 ④（企劃線 3f406dbc）：8/07 21:00 改成她打來；那兩則私訊是沒接的替代版（逐字對稿在 tests/aa296_phone_live_unit.js）*/
    fresh(d7,20,'dorm',{}); R(ID,'FRI'); C(ID); (G.msgs||(G.msgs=[])).push({th:TH_PS,from:'player',who:null,text:'妳還好嗎？',day:D('2027-03-01'),h:20});
    run(d7,20,20.75); { const q=OUT.get(G,'y3_ps_back_call'); said=[]; picks=[0]; if(q&&OUT.due(G)) await OUT.go(GM,q); }
    check('3. 消失期傳過訊息（沒交往）：8/07 21:00 她打來（「……喂。」…「我現在在台南。你要來的話，跟我說。」）、沒有私訊；之後不是「很久沒聯絡」', has('……喂。')&&has('我現在很好。真的。')&&!txt(TH_PS).some(t=>t.startsWith(ID))&&typeof G.flags.PS_BACK_READ==='number'&&STORY.presence(ID,G).away==='在台中', JSON.stringify([said.map(s=>s.t),txt(TH_PS)]));
    fresh(d7,20,'dorm',{}); R(ID,'FRI'); C(ID); (G.msgs||(G.msgs=[])).push({th:TH_PS,from:'player',who:null,text:'妳還好嗎？',day:D('2027-03-01'),h:20});
    run(d7,20,21.75);
    check('3. 消失期傳過訊息、那一通沒接：8/07 21:00「……這半年我都沒看手機。對不起。」「我現在很好。」（只有這兩則）；之後不是「很久沒聯絡」', JSON.stringify(txt(TH_PS).filter(t=>t.startsWith(ID)))===JSON.stringify([ID+':……這半年我都沒看手機。對不起。',ID+':我現在很好。'])&&typeof G.flags.PS_BACK_READ==='number'&&STORY.presence(ID,G).away==='在台中', JSON.stringify(txt(TH_PS)));
    fresh(d7,20,'dorm',{}); R(ID,'FRI'); C(ID); run(d7,20,21.5);
    check('3. 沒傳過：8/07 不回、她也不先傳（大二下那一則重考的問題放榜以後不傳）、還是「很久沒聯絡」、不能去找她', !txt(TH_PS).length&&STORY.presence(ID,G).lost===true&&HV.offer(G,ID)===null, JSON.stringify(txt(TH_PS)));
    G.day=D('2027-08-12'); G.hour=20; const tp=MSG.topics(G,ID); const r=tp.length?MSG.send(G,ID,tp[0].k):null; run(G.day,20,22);
    check('3. 之後第一次傳訊息（8/12，她回台南以前；AA_349 K1）：「好久不見。……我現在在台中，開學以後在台南。」「你要來的話，跟我說。」；重新聯絡上（PS_BACK_FIRST）', !!r&&r.ok&&JSON.stringify(txt(TH_PS).filter(t=>t.startsWith(ID)).slice(0,2))===JSON.stringify([ID+':好久不見。……我現在在台中，開學以後在台南。',ID+':你要來的話，跟我說。'])&&G.flags.PS_BACK_FIRST!=null&&!STORY.presence(ID,G).lost, JSON.stringify(txt(TH_PS)));
    fresh(D('2027-09-10'),20,'dorm',{}); R(ID,'FRI'); C(ID); const tp2=MSG.topics(G,ID); const r2=tp2.length?MSG.send(G,ID,tp2[0].k):null; run(G.day,20,22);
    check('3. K1 她回台南以後（9/4 起）才第一次傳：照原文「好久不見。……我現在在台南。」「你要來的話，跟我說。」', !!r2&&r2.ok&&JSON.stringify(txt(TH_PS).filter(t=>t.startsWith(ID)).slice(0,2))===JSON.stringify([ID+':好久不見。……我現在在台南。',ID+':你要來的話，跟我說。']), JSON.stringify(txt(TH_PS)));    fresh(d7,20,'dorm',{}); date(ID); C(ID); (G.msgs||(G.msgs=[])).push({th:TH_PS,from:'player',who:null,text:'晚安',day:D('2027-03-01'),h:23}); run(d7,20,21.5);
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
    check('4. 交往中：約她的清單有「我去台南找妳？」、也有「視訊？」（AA_349 K5；INVITE-MENU-1030：兩個都有＝放在「特別的…」那一類）', (opts[0].all||opts[0]).includes('我去台南找妳？')&&(opts[0].all||opts[0]).includes('視訊？'), JSON.stringify(opts[0].all||opts[0]));
    // 校外約會（DATE）：她不上來（AA_282 第 6 節第 1 點；AA_349 K3）——北部的地點全部約不到（臺北、新北、基隆、桃園、宜蘭……）；字照 K11
    fresh(d,12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID);
    const c1=DATE.check(G,{who:ID,locs:['D06'],day:d+3,depart:10}), c2=DATE.check(G,{who:ID,locs:['D13'],day:d+3,depart:10}), w0=typeof DATE.noTaipei==='function'?DATE.noTaipei(G,ID,d+3,'D06'):null;
    check('4. K3／K11 校外約會：臺北市（北美館）、新北（淡水）都約不到「她在台南。要見她，得去台南。」', !c1.ok&&c1.why==='她在台南。要見她，得去台南。'&&w0===c1.why&&!c2.ok&&c2.why===c1.why, JSON.stringify([c1.why,c2.ok,c2.why]));
    check('4. K3 北部全部擋：九份、北海岸（新北）、石門水庫（桃園）、宜蘭也擋；臺中（中部）不擋', ['D18','D16','D22','D24','D25'].every(l=>DATE.noTaipei(G,ID,d+3,l)==='她在台南。要見她，得去台南。')&&DATE.noTaipei(G,ID,d+3,'D26')==='', JSON.stringify(['D18','D16','D22','D24','D25','D26'].map(l=>DATE.noTaipei(G,ID,d+3,l))));
    fresh(D('2028-01-10'),12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); const c4=DATE.check(G,{who:ID,locs:['D06'],day:G.day+3,depart:10});
    check('4. K11 大三寒假：「她在台中。要見她，得去台中。」', !c4.ok&&c4.why==='她在台中。要見她，得去台中。', JSON.stringify(c4.why));
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
    check('AA_447 1-2 第二次去台南的送行：「（回高鐵站的公車上，她靠著窗，一路在講室友的事。）」「下次換我上去找你們！到了傳給我喔。」，不是第一次那兩句', has('（回高鐵站的公車上，她靠著窗，一路在講室友的事。）')&&has('下次換我上去找你們！到了傳給我喔。')&&!has('謝謝你跑這麼遠！到臺北傳給我喔。')&&!has('（傍晚，她陪你坐車到高鐵站。）'), JSON.stringify(said.map(s=>s.t)));
    G.day=d+1; G.weekday=wdOf(G.day); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
    check('5. 下一次（隔天）：P5-L2「我週末在學校附近的二手書店打工。……」', (so.ladder[k]|0)===2&&has(L[1].lines[0]), JSON.stringify(said.map(s=>s.t)));
    check('AA_447 1-2 第三次以後的送行：「（她陪你走到高鐵站的閘門口。這條路她已經會帶了。）」「到臺北傳給我喔！我等你的訊息才睡。」', has('（她陪你走到高鐵站的閘門口。這條路她已經會帶了。）')&&has('到臺北傳給我喔！我等你的訊息才睡。'), JSON.stringify(said.map(s=>s.t)));
    { const S=HOMETOWN_LINES[ID+'@台南'].send, g={flags:{}}; check('AA_447 1-2 交往中的三版：第一次「下次待久一點。末班車太早了。」、第二次「……有一班十點的。」、第五次照第三次以後', S.dating(g,0)[0]==='下次待久一點。末班車太早了。'&&S.dating(g,1)[0]==='下次你搭晚一點的那班。我查過了，有一班十點的。'&&S.dating(g,4)[0]==='……好啦，你走吧。不然我又要說下次待久一點。'&&S.narr(g,4)===S.narr(g,2)); }
    fresh(D('2028-01-10'),10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID}});
    check('5. K4 寒假去台中也推進一層：接剛結束那一學期（大三上）的階梯 P5-L1，週次當作最後一週', (G.social.ladder[ID+'@Y3S1']|0)===1&&has(L[0].lines[0])&&has('（台中車站。她在出口揮手，揮得很大。）')&&G.social.ladderDay[ID]===G.day, JSON.stringify([G.social.ladder,said.map(s=>s.t)]));
    said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID}}); check('5. K4 同一天再去台中：不再推進', (G.social.ladder[ID+'@Y3S1']|0)===1); }

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
    w=setup('Y4S1',{PS_BACK_FIRST:1}); date(ID); run(w.from,20,21,0.05); { const dd=(((G.termend||{}).Y4S1||{}).gfDay||{})[ID]; if(dd!=null&&dd>=0) run(dd,11.9,12.1,0.05); }   /* AA_378 #3：約會當天 12:00 才傳 */ const g=(G.msgs||[]).find(x=>x.tag==='te_gf_Y4S1_'+ID);
    PHONE.answer(G,'te_gf_Y4S1_'+ID,0); STORY.phoneRules(GM); const qg=OUT.get(G,'te_gf_Y4S1_'+ID);
    check('6. 交往中（大四上）：女朋友的學期末約會「學期結束了！你下來。……我想吃熱的，跟第一次一樣。」（AA_456 1-5 換字）在台南', !!g&&g.text==='學期結束了！你下來。……我想吃熱的，跟第一次一樣。'&&!!qg&&qg.place==='台南・她學校附近的簡餐'&&qg.back==='搭最後一班高鐵回到臺北。', JSON.stringify([g&&g.text,qg]));
    TERMEND.hookFor=hf; }

  // ===== 7. AA_349（2026-10-21 AA-C 回 K）：K3 去台南／台中算正式約會、心願地點「台南・美術館」；K4 當面見到的那一天都推進一層；K5 交往中的視訊；K11 字 =====
  const tn={hv:{id:ID,key:ID+'@台南'}};
  { const d=termDay('Y3S1',6,4); fresh(d,10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID); const c0=DATE.log(G,ID).count|0; said=[]; picks=[0,0]; await HV.play(GM,tn);
    const t=(G.trips||[]).find(x=>x.kind==='visit');
    check('7. K3 去台南那一天＝一次正式校外約會：DATE.log 次數 +1、一起去過的地方「台南」', (DATE.log(G,ID).count|0)===c0+1&&!!t&&t.counted&&JSON.stringify(DATE.history(G,ID).map(h=>h.locs))==='[["台南"]]', JSON.stringify([DATE.log(G,ID),t]));
    said=[]; picks=[0,0]; await HV.play(GM,tn); check('7. K3 同一天再去：只算一次', (DATE.log(G,ID).count|0)===c0+1);
    fresh(D('2028-01-10'),10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID}});
    check('7. K3 寒假去台中也算一次', (DATE.log(G,ID).count|0)===1&&DATE.history(G,ID)[0].locs[0]==='台中', JSON.stringify(DATE.history(G,ID)));
    fresh(D('2026-01-30'),10.5,'dorm',{}); R(ID,'FRI'); C(ID); said=[]; picks=[0]; await HV.play(GM,{hv:{id:ID}});
    check('7. K3 放榜以前（大一寒假去台中，AA_276）照舊不算', (DATE.log(G,ID).count|0)===0, JSON.stringify(DATE.log(G,ID))); }
  // K3 心願地點：聊天提到（「再去」接人以後，第 4 階以上）
  { const d=termDay('Y3S1',7,6); fresh(d,10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=35; G.flags.HV_N={[ID+'@台南']:1};   /* 第 5 階（人物頁的提示從第 5 階起）*/
    said=[]; opts=[]; picks=[0,0]; await HV.play(GM,tn); const k1=said.findIndex(s=>s.t==='你去過美術館嗎？'), kp=said.findIndex(s=>s.t==='今天我已經想好要去哪裡了。'), kb=said.findIndex(s=>s.t==='這一區是我排的。你看得出來照什麼排的嗎？');
    check('7. K3 聊天提到：第二次去台南（再去・書店），接人以後、書店以前：「你去過美術館嗎？」……「我想去一次。看畫，不用寫答案。」；選「畫也有答案吧？」→「……是嗎？那我更想去看，它的答案是什麼。」；wishKnown',
      kp>=0&&k1>kp&&kb>k1&&has('我想去一次。看畫，不用寫答案。')&&JSON.stringify(opts[0])===JSON.stringify(['「畫也有答案吧？」','「那就去啊。」','（聽她說完）'])&&has('……是嗎？那我更想去看，它的答案是什麼。')&&DATE.log(G,ID).wishKnown===true, JSON.stringify(said.map(s=>s.t)));
    { const L=DATE.log(G,ID), c=L.count; L.count=4; const h=DATE.hint(G,ID); L.count=c; check('7. K3 人物頁的提示（次數夠、還沒去）：「她提過想去台南・美術館」（不是臺北市立美術館）', h==='她提過想去台南・美術館', h); }
    G.day+=1; G.weekday=wdOf(G.day); said=[]; picks=[0,0]; await HV.play(GM,tn); check('7. K3 聊天提到只一次', !has('你去過美術館嗎？')); }
  // K3 她主動約（手機）→ 下一次去台南＝美術館（BB_128 3-4 照抄）
  { const d=termDay('Y3S1',3,3); fresh(d,20,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=60; SOCIAL.rel(ID).rom=35; run(d,20.5,21.2);
    const M=TH(TH_PS).filter(m=>m.from===ID).map(m=>m.text), m=PHONE.byAsk(G,'ps_museum_Y3S1');
    check('7. K3 她主動約（第 5 階以上、雙方單身；學期中第 3 週起的晚上 21:00）：「你下次來台南，我們去美術館。」「我想要一天，沒有標準答案。」（AA_462 第 5 節：第二句開頭的「美術館。」拿掉）「你可以說不。我只是問問看。」；選項「答應」「這週不行」',
      JSON.stringify(M)===JSON.stringify(['你下次來台南，我們去美術館。','我想要一天，沒有標準答案。','你可以說不。我只是問問看。'])&&!!m&&m.ask.opts.map(o=>o.t).join('|')==='答應|這週不行', JSON.stringify(M));
    PHONE.answer(G,'ps_museum_Y3S1',0);
    check('7. K3 答應：「好。……我會準備。不對，我什麼都不準備。」', txt(TH_PS).includes(ID+':好。……我會準備。不對，我什麼都不準備。')&&G.flags.PS_MUSEUM==='yes');
    G.day=d+3; G.weekday=wdOf(G.day); G.hour=10.5; said=[]; caps=[]; opts=[]; picks=[0,0,0,0,0,0]; const m0=G.money, c0=DATE.log(G,ID).count|0; await HV.play(GM,tn);
    const iA=said.findIndex(s=>s.t==='（白色的建築，屋頂一片一片疊起來，裡面很亮。）'), iU=said.findIndex(s=>s.t==='〈無題〉。……它連題目都沒有。'), iS=said.findIndex(s=>s.t==='謝謝你跑這麼遠！到臺北傳給我喔。');
    check('7. K3 下一次去台南＝美術館：地點字幕「台南・美術館」、抵達旁白「（白色的建築，屋頂一片一片疊起來，裡面很亮。）」「這裡好安靜。像考場。」「……可是沒有人在寫字。」；不演她的學校',
      caps.includes('台南・美術館')&&iA>=0&&has('這裡好安靜。像考場。')&&has('……可是沒有人在寫字。')&&!has('這是我們學校。很小吧？走一圈十分鐘。'), JSON.stringify(caps));
    check('7. K3 四個互動點照 D06（大展廳、只有空畫框的作品、館內的咖啡廳、館外的草地）；大展廳「說明牌寫，作者想表達城市的孤獨。」→「說明牌也不一定對。」→「……可以這樣想嗎？考試不行。這裡可以。」',
      JSON.stringify(opts[0])===JSON.stringify(['大展廳','只有空畫框的作品','館內的咖啡廳','館外的草地'])&&has('說明牌寫，作者想表達城市的孤獨。')&&has('……可以這樣想嗎？考試不行。這裡可以。'), JSON.stringify(opts.slice(0,3)));
    check('7. K3 四個都看了：咖啡廳「這杯一百六。……」（扣 160；門票照 D06 30、高鐵 2700）、空畫框、草地；收尾〈無題〉在送上車以前、「我現在學怎麼教書。以後我要跟學生說，有些題目沒有標準答案。」；第 6 階（單身）：抵達多「今天我沒帶筆記本。……」、結尾「……我想記得今天。不寫下來，用記的。」',
      has('這杯一百六。……我家早餐店的紅茶，一杯二十。')&&has('……這個我會。框。')&&has('……天空原來這麼大。')&&iU>iA&&iS>iU&&has('我現在學怎麼教書。以後我要跟學生說，有些題目沒有標準答案。')&&has('今天我沒帶筆記本。……帶了，但不拿出來。')&&has('……我想記得今天。不寫下來，用記的。')&&!has('今天，我什麼都沒寫。')&&G.money===m0-2700-30-160, JSON.stringify([m0-G.money,said.map(s=>s.t).slice(-8)]));
    check('7. K3 心願完成：wish、WISH_DONE、記憶 PS_UNTITLED「她說〈無題〉是傍晚」、相簿〈無題〉明信片；也算一次正式約會', DATE.log(G,ID).wish===true&&G.flags.WISH_DONE_classmate_peishan===true&&SOCIAL.has(ID,'PS_UNTITLED')&&SOCIAL.MEMORY_LABEL.PS_UNTITLED==='她說〈無題〉是傍晚'&&(G.album||[]).some(a=>a.title==='〈無題〉明信片')&&(DATE.log(G,ID).count|0)===c0+1&&G.flags.PS_MUSEUM==='done');
    G.day+=1; G.weekday=wdOf(G.day); said=[]; picks=[0,0]; await HV.play(GM,tn); check('7. K3 美術館那一趟不佔順位：之後去台南演第一次（她的學校）、接人用第二次以後那一句', has('這是我們學校。很小吧？走一圈十分鐘。')&&has('{name}！你又來了！'.replace('{name}','祐廷'))&&!has('（白色的建築，屋頂一片一片疊起來，裡面很亮。）'), JSON.stringify(said.map(s=>s.t))); }
  { const d=termDay('Y3S1',9,6); const go=async(dt,pk)=>{ fresh(d,10.5,'dorm',{PS_BACK_FIRST:1,PS_MUSEUM:'yes'}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=35; if(dt) date(ID); G.events.done.ev_peishan_syllogism=1; G.flags.HV_N={[ID+'@台南']:2}; said=[]; picks=pk.slice(); await HV.play(GM,tn); };
    await go(false,['館內的咖啡廳','下次去妳家喝','只有空畫框的作品','框外面呢','館外的草地','躺下來看','差不多了','跟妳一樣']);
    check('7. K3 第 5 階（單身）：咖啡廳「下次去妳家喝。」＝「早餐店五點開門。你起得來嗎？」；P2b（三段論）看過的「框外面呢？」多「你記得我說過。」；草地「躺下來看？」＝「……裙子會髒。」「……算了，髒就髒。」（她躺下來）；〈無題〉「跟妳一樣，傍晚。」；結尾「今天，我什麼都沒寫。」',
      has('早餐店五點開門。你起得來嗎？')&&!has('……台中很遠。')&&has('框外面，是看框的人。……今天是我們。')&&has('你記得我說過。')&&has('……裙子會髒。')&&has('……算了，髒就髒。')&&has('（她躺下來）')&&has('……你不用跟我一樣。')&&has('可是一樣，也很好。')&&has('今天，我什麼都沒寫。')&&!has('今天我沒帶筆記本。……帶了，但不拿出來。')&&!has('雲走得好慢。……我們也走慢一點。'), JSON.stringify(said.map(s=>s.t)));
    await go(true,['館內的咖啡廳','下次去妳家喝','差不多了','我看不出來']);
    check('7. K3 交往中：抵達多「沙漏我放在家裡。今天不翻。」、咖啡廳「……台中很遠。」「好。」、結尾「今天的答案是：跟你來。」「……這題我不用想。」；只看一個也可以「差不多了」', has('沙漏我放在家裡。今天不翻。')&&has('……台中很遠。')&&has('好。')&&has('好。看不出來，也是一個答案。')&&has('今天的答案是：跟你來。')&&has('……這題我不用想。')&&!has('說明牌寫，作者想表達城市的孤獨。'), JSON.stringify(said.map(s=>s.t))); }
  { const d=termDay('Y3S1',6,1); fresh(d,10.5,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=40; const c0=TERMEND.cond(G,ID);
    for(let i=0;i<3;i++){ G.day=d+i; G.weekday=wdOf(G.day); G.hour=10.5; said=[]; picks=[0,0,0]; await HV.play(GM,tn); }
    G.flags.PS_MUSEUM='yes'; G.day=d+3; G.weekday=wdOf(G.day); G.hour=10.5; said=[]; picks=[0,0,'差不多了',0]; await HV.play(GM,tn); const c1=TERMEND.cond(G,ID);
    check('7. K3 大三起也到得了告白的條件：去台南三次＋台南・美術館（心願）＝4 次正式校外約會＋心願地點（之前：次數不夠）', c0.ok===false&&c0.why==='count'&&(DATE.log(G,ID).count|0)===4&&DATE.log(G,ID).wish===true&&c1.ok===true, JSON.stringify([c0,c1,DATE.log(G,ID).count])); }
  { const d=termDay('Y3S1',3,3); fresh(d,21.1,'dorm',{PS_BACK_FIRST:1,dating_heroine_03:true}); R(ID,'CLO'); C(ID); run(d,21.1,21.2); check('7. K3 祐廷在和別人交往（不是雙方單身）：她不主動約', !PHONE.sent(G,'ps_museum_Y3S1'));
    fresh(d,21.1,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); DATE.log(G,ID).wish=true; run(d,21.1,21.2); check('7. K3 大二上以前在臺北去過 D06（wish）：照舊算完成、不再約', !PHONE.sent(G,'ps_museum_Y3S1')&&HV.museumOffer(G,ID)===null); }
  // K3 玩家主動約（校外約會的清單）＋ K11 灰掉的北部地點寫「她現在在台南。」
  { const d=termDay('Y3S1',8,2); fresh(d,12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=60; SOCIAL.rel(ID).rom=35; said=[]; opts=[]; picks=['臺北市立美術館','台南・美術館',0];
    const day=await DATE.menu(GM,ID,null); const L0=opts[0]||[], q=OUT.rec(G).find(x=>x.hv&&x.hv.museum);
    check('7. K11 校外約會的清單：北部的地點選了＝「她在台南。要見她，得去台南。」（INVITE-MENU-1030 分層：北部那幾類整類灰掉、選了說同一句）；清單多一個「台南・美術館」（外縣市一日那一類）', (L0.all||L0).includes('臺北市立美術館')&&(L0.all||L0).includes('台南・美術館')&&has('她在台南。要見她，得去台南。'), JSON.stringify(L0.all||L0));
    check('7. K3 玩家主動約、她還不知道：「美術館？為什麼是美術館？」「……好。我一直想去。」；排去台南（美術館）', has('美術館？為什麼是美術館？')&&has('……好。我一直想去。')&&!!q&&q.ev==='ev_hv_ps_tn'&&q.day===day&&q.hv.key===ID+'@台南', JSON.stringify(q));
    fresh(d,12,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); SOCIAL.rel(ID).npcRom=35; DATE.knowWish(G,ID); said=[]; picks=['台南・美術館',0]; await DATE.menu(GM,ID,null);
    check('7. K3 已經知道：「美術館？……你記得。」「好。這件事，我會記很久。」', has('美術館？……你記得。')&&has('好。這件事，我會記很久。'));
    const hk=[]; const ch0=GM.choose; GM.choose=async o=>{ hk.push(o.map(x=>[x.t,x.hint])); return o.length-1; }; await DATE.menu(GM,ID,null); GM.choose=ch0;
    check('7. K11 清單上灰掉的北部地點的說明：「她現在在台南。」（分層：整類灰掉的那一類小字寫這一句）', (hk[0]||[]).some(x=>x[0]==='臺北市：看展・電影…'&&x[1]==='她現在在台南。'), JSON.stringify(hk[0])); }
  // K4 台南的學期末飯、P6 公開課（OUT.AFTER）也推進一層；同一天最多一層
  { const d=termDay('Y3S1',16,5); fresh(d,21,'dorm',{PS_BACK_FIRST:1}); R(ID,'FRI'); C(ID); const k=ID+'@Y3S1'; said=[];
    await OUT.runAfter(GM,{id:'te_Y3S1',ev:'ev_termend_dinner',te:{term:'Y3S1',who:ID,kind:'heart'}},null);
    check('7. K4 台南的學期末飯：結尾接一層（P5-L1）', (G.social.ladder[k]|0)===1, JSON.stringify(G.social.ladder));
    await OUT.runAfter(GM,{id:'x2',ev:'ev_peishan_open_class'},null); check('7. K4 同一天最多一層', (G.social.ladder[k]|0)===1);
    G.day+=1; G.weekday=wdOf(G.day); await OUT.runAfter(GM,{id:'y4_ps_open',ev:'ev_peishan_open_class'},null); check('7. K4 P6 公開課那一場也推進', (G.social.ladder[k]|0)===2);
    G.day+=1; G.weekday=wdOf(G.day); await OUT.runAfter(GM,{id:'te_x',ev:'ev_termend_dinner',te:{term:'Y3S1',who:'heroine_01',kind:'heart'}},null); check('7. K4 別人的期末飯不推進沛珊', (G.social.ladder[k]|0)===2); }
  // K5 交往中的視訊
  { const d=termDay('Y3S1',6,1); fresh(d,20.5,'dorm',{PS_BACK_FIRST:1}); date(ID); R(ID,'FRI'); C(ID);
    const a=HV.videoOffer(G,ID); G.hour=21; const b=HV.videoOffer(G,ID); G.hour=22.4; const b2=HV.videoOffer(G,ID); G.hour=22.5; const c=HV.videoOffer(G,ID);
    check('7. K5 交往中、她在台南：「視訊？」晚上 21:00～22:30 才能約', !!a&&!a.ok&&!!b&&b.ok&&b2.ok&&!c.ok, JSON.stringify([a,b,c]));
    G.hour=21; said=[]; caps=[]; await HV.video(GM,ID); const L=LADDER.byTerm.Y3S1[ID].steps;
    check('7. K5 視訊：祐廷「視訊？」→「（視訊。她的書桌上堆著教案，螢光筆的蓋子散了一桌。）」「等我一下，我把這頁寫完！……好了！」→ 閒聊一層 → 「好，我要去備課了。晚安！」',
      txt(TH_PS).includes('player:視訊？')&&said[1].t==='（視訊。她的書桌上堆著教案，螢光筆的蓋子散了一桌。）'&&has('等我一下，我把這頁寫完！……好了！')&&has(L[0].lines[0])&&said[said.length-1].t==='好，我要去備課了。晚安！'&&caps.includes('視訊')&&(G.social.ladder[ID+'@Y3S1']|0)===1, JSON.stringify(said.map(s=>s.t)));
    G.day+=1; G.weekday=wdOf(G.day); G.hour=21; said=[]; await HV.video(GM,ID);
    check('7. K5 第二次：開頭換第二句「（視訊。她坐在套房的地板上，背靠著床。）」；階梯再一層', has('（視訊。她坐在套房的地板上，背靠著床。）')&&has('今天課輔班有一個孩子叫我老師。……我還沒習慣。')&&(G.social.ladder[ID+'@Y3S1']|0)===2);
    G.day+=1; G.weekday=wdOf(G.day); G.hour=21; const e=HV.videoOffer(G,ID); check('7. K5 一週最多兩次', !!e&&!e.ok&&e.why==='這週已經視訊兩次了', JSON.stringify(e));
    G.day+=5; G.weekday=wdOf(G.day); G.hour=21; said=[]; await HV.video(GM,ID); check('7. K5 下一週可以再視訊，開頭第三句「（視訊。她那邊在下雨，窗戶一直響。）」「台南很少下這麼大。你那邊呢？」', has('（視訊。她那邊在下雨，窗戶一直響。）')&&has('台南很少下這麼大。你那邊呢？'));
    fresh(d,21,'dorm',{PS_BACK_FIRST:1}); R(ID,'CLO'); C(ID); check('7. K5 沒交往的不開視訊', HV.videoOffer(G,ID)===null);
    fresh(D('2028-01-10'),21,'dorm',{PS_BACK_FIRST:1}); date(ID); C(ID); check('7. K5 寒暑假她在台中：清單沒有視訊（三句開頭都是台南的事，問 AA）', HV.videoOffer(G,ID)===null); }

  // ===== 8. AA_350（2026-10-21）P1：第一次回覆照她那時候在哪；P5：2030、2031 的寒暑假在台中 =====
  { const first=key=>{ fresh(D(key),20,'dorm',{}); R(ID,'FRI'); C(ID); const tp=MSG.topics(G,ID); const r=tp.length?MSG.send(G,ID,tp[0].k):null; run(G.day,20,22); return {r,ps:txt(TH_PS).filter(t=>t.startsWith(ID+':')).slice(0,2)}; };
    const TC=[ID+':好久不見。……我現在在台中，開學以後在台南。',ID+':你要來的話，跟我說。'], TN=[ID+':好久不見。……我現在在台南。',ID+':你要來的話，跟我說。'];
    const w=first('2028-01-10');
    check('8. P1 大三寒假（2028-01-10，她在台中）才第一次傳：回台中那一句「好久不見。……我現在在台中，開學以後在台南。」「你要來的話，跟我說。」', !!w.r&&w.r.ok&&JSON.stringify(w.ps)===JSON.stringify(TC), JSON.stringify(w.ps));
    const s=first('2028-08-10');   /* AA_508 0-2 第 5 點：7/17～7/30 她在山上的營隊（原本用 7/20），改營隊以後的 8/10 */
    check('8. P1 大三暑假（2028-08-10）才第一次傳：也是台中那一句', !!s.r&&s.r.ok&&JSON.stringify(s.ps)===JSON.stringify(TC), JSON.stringify(s.ps));
    const sc=first('2028-07-20');
    check('8. P1 營隊那幾天（2028-07-20）第一次傳：不會回「我現在在台南」（她在山上）', !sc.ps.some(t=>t.includes('我現在在台南')), JSON.stringify(sc));
    const t=first('2028-03-15');
    check('8. P1 大三下學期中（2028-03-15，她在台南）才第一次傳：照原文「好久不見。……我現在在台南。」', !!t.r&&t.r.ok&&JSON.stringify(t.ps)===JSON.stringify(TN), JSON.stringify(t.ps));
    const K={PS_BACK_FIRST:1}, at=k=>P(D(k),K), w30=at('2030-02-01'), s30=at('2030-07-15'), t30=at('2030-04-15');
    check('8. P5 2030 寒假中（2/1）：在台中（kind home、home 台中、「在台中」）', w30.here===false&&w30.kind==='home'&&w30.home==='台中'&&w30.away==='在台中', JSON.stringify(w30));
    check('8. P5 2030 暑假中（7/15）：在台中', s30.here===false&&s30.kind==='home'&&s30.home==='台中'&&s30.away==='在台中', JSON.stringify(s30));
    check('8. P5 2030 學期中（4/15）：在台南（kind city、city 台南）', t30.here===false&&t30.kind==='city'&&t30.city==='台南'&&t30.away==='在台南', JSON.stringify(t30));
    const B=['2030-01-19','2030-01-20','2030-02-18','2030-02-19','2030-06-24','2030-06-25','2030-08-31','2030-09-01','2031-01-19','2031-01-20','2031-02-18','2031-02-19','2031-06-24','2031-06-25','2031-08-31'].map(k=>{ const p=at(k); return p.home||p.city||'?'; });
    check('8. P5 邊界：寒假 1/20～2/18、暑假 6/25～8/31 在台中（含頭尾），前一天、後一天在台南；2030、2031 一樣', JSON.stringify(B)===JSON.stringify(['台南','台中','台中','台南','台南','台中','台中','台南','台南','台中','台中','台南','台南','台中','台中']), JSON.stringify(B));
    fresh(D('2030-02-01'),12,'dorm',K); R(ID,'FRI'); C(ID); const k1=HV.key(G,ID); G.day=D('2030-04-15'); const k2=HV.key(G,ID);
    check('8. P5 去找她照 presence：2030 寒假是台中那一組、學期中是台南那一組（不另外寫事件）', k1===ID&&k2===ID+'@台南', JSON.stringify([k1,k2]));
    const f=first('2030-02-01');
    check('8. P1＋P5 2030 寒假（2/1）才第一次傳：台中那一句', !!f.r&&f.r.ok&&JSON.stringify(f.ps)===JSON.stringify(TC), JSON.stringify(f.ps)); }

  { const src=fs.readFileSync(path.join(ROOT,'src/data/hometown_lines.js'),'utf8');
    check('9. 草地「（一起看）」照 AA-C 交班（AA_362）：「雲走得好慢。……我們也走慢一點。」；舊句「我第一次覺得，慢不是壞事。」不在了', src.includes("say:['雲走得好慢。……我們也走慢一點。']")&&!src.includes('慢不是壞事')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
