// V2-B9 可昕的大一下（BB_96 第 9 節，BB 2026-10-14）——不需要瀏覽器。
// 9-1 情人節：2/14 20:00 視訊（出遊「接起來」）；三種天氣、三種回答；KX_VDAY、KX_VDAY_WX、選「我想見妳」記 KX_VDAY_SEE；沒接＝窗戶的照片＋一句，KX_VDAY missed。
// 9-3 K5、9-4 K7、9-6 K6、9-7 K6b、9-8 手機小事（時間、地點是 AA-B 確認前的提案值）。修改前沒有 ev_kexin_valentine_y1（第 1 項失敗）。
// 用法：node tests/v2_b9_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
let caps=[]; GM.caption=(w,t)=>caps.push(t);
const after=async(day)=>{ G.day=day; G.weekday=wdOf(day); G.hour=12.17; G.zone='putong'; const it={c:{id:'econ_principles_2'}}; said=[]; opts=[]; caps=[]; return await CLS.afterClassEvent(GM,it); };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
(async()=>{
  const e=ev('ev_kexin_valentine_y1'); check('1. ev_kexin_valentine_y1 存在（出遊、只一次）',!!e&&e.trigger==='outing'&&e.once===true);
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const VD=STORY.dayOfKey('2026-02-14');
  fresh(VD-3,10,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(10,10.2);
  const q=OUT.get(G,'kx_vday1'); check('2. 交往中：排好 2/14 20:00 的視訊（接起來）',!!q&&q.day===VD&&q.h===20&&q.verb==='接起來',JSON.stringify(q));
  fresh(VD-3,10,'dorm',{introDone:true,dating_kexin:false}); run(10,10.2); check('2. 沒有交往：不排',!OUT.get(G,'kx_vday1'));
  const play=async(pk)=>{ fresh(VD,19.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(19.9,19.95); picks=pk.slice(); said=[]; opts=[]; await OUT.go(GM,OUT.get(G,'kx_vday1')); return lines(); };
  let L=await play(['晴天','讀民總']);
  check('3. 她先問天氣、天氣三個選項、「情人節我們不在同一個地方。……你今天做了什麼？」三個選項（AA_295）',L[0]==='杜可昕：你那邊的天氣？'&&JSON.stringify(opts[0])==='["「晴天。很冷。」","「下雨。」","（把鏡頭轉向窗外）"]'&&L.includes('杜可昕：情人節我們不在同一個地方。……你今天做了什麼？')&&JSON.stringify(opts[1])==='["「讀民總。」","「傳訊息給妳。」","「我不知道。我想見妳。」"]',JSON.stringify({L0:L[0],o:opts}));
  check('3. 晴天＋讀民總：「臺北的冷是濕的……」「……寒假還在讀民總的人，都這樣回答。」「她笑。」，最後「情人節快樂。臺北冷，穿厚一點。」',L.includes('杜可昕：臺北的冷是濕的，我這邊是乾的。……加起來剛好。')&&L.includes('杜可昕：……寒假還在讀民總的人，都這樣回答。')&&L.includes('她笑。')&&L[L.length-1]==='杜可昕：情人節快樂。臺北冷，穿厚一點。',JSON.stringify(L));
  check('3. 記 KX_VDAY {1:video}、KX_VDAY_WX {1:sunny}；沒有 KX_VDAY_SEE',G.flags.KX_VDAY[1]==='video'&&G.flags.KX_VDAY_WX[1]==='sunny'&&!G.flags.KX_VDAY_SEE&&G.flags._kxVwx===undefined,JSON.stringify([G.flags.KX_VDAY,G.flags.KX_VDAY_WX]));
  L=await play(['鏡頭','我想見妳']);
  check('4. 鏡頭轉向窗外：「她也把手機轉向她的窗戶。」「交換。」；我想見妳：「嘴角先動了。」「開學第二個週末。我寫進行事曆了。」（AA_373 #10）、KX_VDAY_SEE、WX window',L.includes('她也把手機轉向她的窗戶。')&&L.includes('杜可昕：交換。')&&L.includes('嘴角先動了。')&&L.includes('杜可昕：開學第二個週末。我寫進行事曆了。')&&G.flags.KX_VDAY_SEE===true&&G.flags.KX_VDAY_WX[1]==='window',JSON.stringify(L));
  L=await play(['下雨','傳訊息給妳']); check('4. 下雨＋傳訊息給妳（AA_295）',L.includes('杜可昕：我這邊也是。那是同一片雨。……氣象不是這樣講的。算了。')&&L.includes('杜可昕：那開學以後，我們補過一次。')&&G.flags.KX_VDAY_WX[1]==='rain');
  fresh(VD,19.9,'dorm',{introDone:true,dating_kexin:true}); run(19.9,19.95); G.hour=20.9; const ex=OUT.expire(G); for(const x of ex) OUT.onMissed(GM,x); run(21,21.1);
  const P=TH('p:kexin').map(m=>m.text);
  check('5. 沒接：窗戶的照片＋「你那邊的天氣，我自己查了。情人節快樂。」、KX_VDAY {1:missed}',P.includes('📷（她的窗戶）')&&P.includes('你那邊的天氣，我自己查了。情人節快樂。')&&G.flags.KX_VDAY[1]==='missed',JSON.stringify(P));
  // ---- 9-3 K5「我們的日子」----
  { const M2=termDay('Y1S2',2,1); fresh(M2,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,KX_VDAY_SEE:true}); run(20.9,21.1);
    let P=TH('p:kexin').filter(m=>m.tag==='kx_our_day'); const msg=P.map(m=>m.text);
    check('6. K5 第 2 週週一 21:00：「我們選一天。……」（「名字很重要。」刪掉，AA_389 第 4 點）、情人節說過想見她的多一句接在後面（BB_161 ⑰）、最後一則帶三個日子',msg.join('｜')==='我們選一天。不是約會日，是「我們的日子」。｜你情人節說想見我。這個週末我已經空下來了。'/* AA_373 #10 */&&JSON.stringify(P[P.length-1].ask.opts.map(o=>o.t))==='["週五晚上。","週六。","週日下午。"]',msg.join('｜'));
    PHONE.answer(G,P[P.length-1].ask.id,2); run(21.1,21.2); P=TH('p:kexin'); const m2=P.find(m=>m.text==='週日下午很好。隔天要上課，我們不會玩太晚。');
    check('6. 選「週日下午。」：她的回覆帶四種方式',!!m2&&JSON.stringify(m2.ask.opts.map(o=>o.t))==='["我開車去政大。","妳來台大。","約在外面。","視訊也算。"]',JSON.stringify(P.map(m=>m.text)));
    PHONE.answer(G,m2.ask.id,0); run(21.2,21.3); const q=OUT.get(G,'kx_our_day1');
    check('6. 選「我開車去政大。」：「好。我負責選宵夜。」、KX_OUR_DAY {sun, nccu}、排同一週週日 14:00（提案值）',TH('p:kexin').some(m=>m.text==='好。我負責選宵夜。')&&JSON.stringify(G.flags.KX_OUR_DAY)==='{"day":"sun","mode":"nccu"}'&&!!q&&q.day===termDay('Y1S2',2,7)&&q.h===14,JSON.stringify({od:G.flags.KX_OUR_DAY,q}));
    picks=[]; said=[]; G.day=q.day; G.hour=13.5; await OUT.go(GM,q); const L=lines();
    check('6. 第一次的那一天（AA_313 第 21 列）：「她把手機上的行事曆對著你。」「那一格我寫了『我們』。……『約會』兩個字太噁心了。」',JSON.stringify(L)===JSON.stringify(['她把手機上的行事曆對著你。','杜可昕：那一格我寫了『我們』。……『約會』兩個字太噁心了。']),JSON.stringify(L));
    fresh(M2,21.2,'dorm',{introDone:true,dating_kexin:true,KX_OUR_DAY:{day:'fri',mode:'video'}}); run(21.2,21.3); const q2=OUT.get(G,'kx_our_day1');
    check('6. 視訊也算＋週五晚上：週五 19:00、接起來',!!q2&&q2.day===termDay('Y1S2',2,5)&&q2.h===19&&q2.verb==='接起來');
    G.day=q2.day; G.hour=20; const ex=OUT.expire(G); for(const x of ex) OUT.onMissed(GM,x); run(20,20.1); G.day+=7; OUT.onMissed(GM,q2); run(20,20.1);
    check('6. 第一次那天沒到：「我等了二十分鐘。……下週同一天。這次不要讓我等。」只一次（AA_313 第 2 節第 22 列）',TH('p:kexin').filter(m=>m.text==='我等了二十分鐘。……下週同一天。這次不要讓我等。').length===1&&!TH('p:kexin').some(m=>m.text==='我等了一下。沒關係，下週同一天。')); }
  // ---- K5 之後每週的「我們的日子」（AA-B 2026-10-16 裁定）----
  { const wk=(mode,day)=>{ fresh(termDay('Y1S2',2,1),9,'dorm',{introDone:true,dating_kexin:true,KX_OUR_DAY:{day:day||'sat',mode}}); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:termDay('Y1S2',2,6),h:14,place:'x',title:'x'}); OUT.get(G,'kx_our_day1').state='done';
      const out=[]; for(let w=3;w<=12;w++){ G.day=termDay('Y1S2',w,1); G.hour=9; STORY.phoneRules(GM); } return OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)).sort((a,b)=>a.day-b.day); };
    const m=wk('mid'), wks=m.map(q=>CALENDAR.termOf(q.day).week);
    check('7a. 約在中間：第 3 週起每週六 14:00 排一次（K7 週年改到 10/17，第 4 週照排）；地點照公館（第一次）之後「溫州街、河濱、公館…」輪流',wks.includes(4)&&wks[0]===3&&m.every(q=>q.h===14&&CALENDAR.dateOf(q.day).wd===6)&&JSON.stringify(m.slice(0,4).map(q=>q.place))==='["溫州街","河濱","公館","溫州街"]',JSON.stringify(m.map(q=>[CALENDAR.termOf(q.day).week,q.place])));
    const v=wk('video'), firsts=v.filter(q=>q.place!=='視訊').map(q=>CALENDAR.dateOf(q.day).key);
    check('7a. 視訊：每個月第一個「我們的日子」改成見面（地點照約在中間那一輪），其他是視訊、「接起來」',firsts.length>=2&&firsts.every((k,i)=>{ const mo=k.slice(0,7); return v.find(q=>CALENDAR.dateOf(q.day).key.slice(0,7)===mo).place!=='視訊'; })&&v.filter(q=>q.place==='視訊').every(q=>q.verb==='接起來'),JSON.stringify(v.map(q=>[CALENDAR.dateOf(q.day).key,q.place])));
    fresh(termDay('Y1S2',5,1),9,'dorm',{introDone:true,dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'nccu'},K7_GIFT:'planner',KX_ANNIV:{1:'wheel'}}); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:termDay('Y1S2',2,6),h:14,place:'x',title:'x'}); OUT.get(G,'kx_our_day1').state='done'; STORY.phoneRules(GM);
    const q5=OUT.rec(G).find(q=>/^kx_od_/.test(q.id)); said=[]; G.day=q5.day; G.hour=13.5; await OUT.go(GM,q5); const L5=lines();
    q5.state='done'; G.day+=7; G.hour=9; STORY.phoneRules(GM); const q6=OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)).sort((a,b)=>b.day-a.day)[0]; said=[]; G.day=q6.day; G.hour=13.5; await OUT.go(GM,q6); const L6=lines();
    check('7a. 第 5 週起第一次（K7 有準備東西）：字幕之後「你送的那個，我放在書桌上。」，只一次',L5.includes('杜可昕：你送的那個，我放在書桌上。')&&!L6.includes('杜可昕：你送的那個，我放在書桌上。'),JSON.stringify([L5,L6]));
    { fresh(termDay('Y1S2',5,1),9,'dorm',{introDone:true,dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'nccu'},K7_GIFT:'dumpling',KX_ANNIV:{1:'river'}}); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:termDay('Y1S2',2,6),h:14,place:'x',title:'x'}); OUT.get(G,'kx_our_day1').state='done'; STORY.phoneRules(GM);
      const qd=OUT.rec(G).find(q=>/^kx_od_/.test(q.id)); said=[]; G.day=qd.day; G.hour=13.5; await OUT.go(GM,qd); const Ld=lines();
      check('7a. K7 送的是湯餃：沒有「你送的那個，我放在書桌上。」（AA_313 第 2 節第 22 列：只給票根、行事曆）',!Ld.includes('杜可昕：你送的那個，我放在書桌上。')&&!G.flags.KX_GIFT_DESK,JSON.stringify(Ld)); }
    const q7=OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)).sort((a,b)=>b.day-a.day)[0]; OUT.plan(G,{id:'other_x',ev:'ev_kexin_our_day',day:q7.day,h:12,place:'x',title:'x'}); OUT.get(G,'other_x').state='done'; G.day=q7.day; G.hour=15; q7.state='missed'; OUT.onMissed(GM,q7); run(15,15.1);
    check('7a. 撞到別的出遊、選了別的：「好，這週換一天。」；單純略過沒有台詞',TH('p:kexin').some(m=>m.text==='好，這週換一天。'));
    const SW=()=>TH('p:kexin').filter(m=>m.text==='好，這週換一天。'||m.text==='我等了二十分鐘。……下週同一天。這次不要讓我等。').length, before=SW(); G.day+=7; G.hour=9; STORY.phoneRules(GM); const q8=OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)).sort((a,b)=>b.day-a.day)[0]; G.day=q8.day; G.hour=16; q8.state='missed'; OUT.onMissed(GM,q8); run(16,16.1);
    check('7a. 單純略過：沒有「這週換一天」「我等了一下」、不扣分',SW()===before); }
  // ---- 9-4 K7 週年 ----
  { const A1=STORY.dayOfKey('2025-10-17'), A0=A1-7;   /* AA_224 第 2 組：每年 10/17；邀約前一週 10/10 21:00 */ fresh(A0,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1);
    let P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask'); check('7. K7 一週前 10/10 21:00：「下禮拜五是我們的週年。」「地點你選。……」三個地點',P.map(m=>m.text).join('｜')==='下禮拜五是我們的週年。｜地點你選。我準備一樣東西，你也準備一樣。'&&JSON.stringify(P[1].ask.opts.map(o=>o.t))==='["摩天輪。","政大山下，我們的店。","河堤。"]');
    PHONE.answer(G,P[1].ask.id,0); run(21.1,21.2); const q=OUT.get(G,'kx_anniv1');
    check('7. 選摩天輪：「……回到最高點。好。」、排 10/17 18:30',TH('p:kexin').some(m=>m.text==='……回到最高點。好。')&&!!q&&q.day===A1&&q.h===18.5,JSON.stringify(q));
    const play=async(pk)=>{ said=[]; opts=[]; picks=pk.slice(); delete G.flags.K7_GIFT; G.events.done.ev_k7_gift_prep=0; G.day=A1-1; G.hour=21.05; const gp=STORY_EVENTS.find(e=>e.id==='ev_k7_gift_prep'); if(EVENTS.check(gp)) await EVENTS.run(gp); G.day=A1; G.hour=17.5; const qq=OUT.get(G,'kx_anniv1'); qq.state='planned'; G.events.done.ev_kexin_anniversary_y1=0; await OUT.go(GM,qq); return lines(); };
    let L=await play(['票根','第三百六十五圈']);
    check('7. 10/16 21:00 選準備的東西（四樣，AA-B 裁定）；票根：「（她把票根翻到背面，看了那個日期很久。）」「……原本那張呢？」「夾在我書桌的桌墊下面。」（AA_313 第 2 節第 10 列，原本「在我皮夾裡。」）「（笑了）好。那這張我收。」（AA_306 附）；第幾圈三選一；「……你算過？」「猜的。」「猜得很準。」；最後旁白；KX_ANNIV {1:wheel}',opts[0].length===4&&L[0]==='明天是週年。你準備的東西：'&&L.includes('（她把票根翻到背面，看了那個日期很久。）')&&L.includes('杜可昕：……原本那張呢？')&&L.includes('祐廷：夾在我書桌的桌墊下面。')&&!L.includes('祐廷：在我皮夾裡。')&&L.includes('杜可昕：（笑了）好。那這張我收。')&&!L.includes('杜可昕：你學我。')&&JSON.stringify(opts[1])==='["「第一圈。」","「第三百六十五圈。」","「不用算。」"]'&&L.includes('杜可昕：……你算過？')&&L.includes('祐廷：猜的。')&&L[L.length-1]==='後面幾頁，她說：『回去再看。』'&&G.flags.K7_GIFT==='ticket'&&G.flags.KX_ANNIV[1]==='wheel',JSON.stringify(L));
    L=await play(['什麼都沒','不用算']); check('7. 什麼都沒準備：「你人來了就好。」（她把卡片推過來）（AA_209）；不用算：「好。那就一直轉。」',L.includes('杜可昕：你人來了就好。')&&L.includes('（她把卡片推過來）')&&L.includes('杜可昕：好。那就一直轉。'));
    { const gp=STORY_EVENTS.find(e=>e.id==='ev_k7_gift_prep'); delete G.flags.K7_GIFT; G.events.done.ev_k7_gift_prep=0; G.day=A1-1; G.hour=20.9; const c0=EVENTS.check(gp); G.hour=21.1; const c1=EVENTS.check(gp); G.day=A1; G.hour=8; const c2=EVENTS.check(gp); G.hour=18.6; const c3=EVENTS.check(gp);
      said=[]; picks=['行事曆']; G.hour=8; await EVENTS.run(gp); const g8=lines()[0];
      delete G.flags.K7_GIFT; said=[]; G.day=A1; G.hour=17.5; const qq=OUT.get(G,'kx_anniv1'); qq.state='planned'; G.events.done.ev_kexin_anniversary_y1=0; picks=['第一圈']; await OUT.go(GM,qq); const Ln=lines();
      check('7. 準備的東西：10/16 21:00 才問、10/17 起床再問（「今天是週年。…」）、18:30 以後不問；都沒選＝什麼都沒準備（不再出門前問）',!c0&&c1&&c2&&!c3&&g8==='今天是週年。你準備的東西：'&&G.flags.K7_GIFT==='none'&&Ln.includes('杜可昕：你人來了就好。')&&!Ln.includes('出門前，你準備的東西：'),JSON.stringify([c0,c1,c2,c3,g8,Ln.slice(0,2)]));
      const RI=STORY.roomItemList(G).find(r=>r[0]==='她的週年卡片'); check('7. 去了週年：房間物件「她的週年卡片」＝「那天在最高的地方，你說在一起吧。我說好。」（AA_303 第 2 節 9）',!!RI&&RI[1]==='那天在最高的地方，你說在一起吧。我說好。'); }
    { const gp=STORY_EVENTS.find(e=>e.id==='ev_k7_gift_prep'); G.flags.KX_ANNIV_PLACE='shop'; delete G.flags.K7_GIFT; G.events.done.ev_k7_gift_prep=0; G.day=A1-1; G.hour=21.1; said=[]; opts=[]; picks=['行事曆']; await EVENTS.run(gp);
      check('7. 地點選政大山下：準備的東西只剩三樣，沒有「山下那家的酸辣湯餃（外帶）」（AA_313 第 2 節第 10 列）',JSON.stringify(opts[0])==='["摩天輪票根的影本，背面寫那天的日期","一本空白的行事曆，第一頁寫今天的日期","什麼都沒準備"]',JSON.stringify(opts[0])); }
    fresh(A0,20.9,'dorm',{introDone:true,dating_kexin:true}); run(20.9,21.1); G.day=A1; run(19.4,19.7);
    const qc=OUT.get(G,'kx_anniv_call1');
    check('7. 沒選地點：KX_ANNIV {1:missed}；當晚不再傳卡片的照片，改排 21:00 她打來（演出來的電話，AA_313 2-3 A）',G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]==='missed'&&!TH('p:kexin').some(m=>m.text==='週年快樂。下次你準備。')&&!!qc&&qc.day===A1&&qc.h===21&&qc.ev==='ev_kexin_anniv_missed_call'&&qc.verb==='接起來',JSON.stringify(qc));
    said=[]; opts=[]; picks=['我忘了']; G.hour=20.95; await OUT.go(GM,qc); let Lc=lines();
    check('7. 21:00 的電話（照稿）：「今天幾號。」「……十七號。」「嗯。」「卡片我寫好了。我自己帶回去。」兩個選項；「我忘了。」→「……你忘了。」（她掛掉了。）',JSON.stringify(Lc.slice(0,5))===JSON.stringify(['（電話。她那邊很安靜。）','杜可昕：今天幾號。','祐廷：……十七號。','杜可昕：嗯。','杜可昕：卡片我寫好了。我自己帶回去。'])&&JSON.stringify(opts[0])==='["「對不起。我明天去找妳。」","「我忘了。」"]'&&Lc.slice(-2).join('｜')==='杜可昕：……你忘了。｜（她掛掉了。）',JSON.stringify(Lc));
    { const ec=STORY_EVENTS.find(e=>e.id==='ev_kexin_anniv_missed_call'), i=ec.dialogue.findIndex(l=>l.label==='a'); check('7. 「對不起。我明天去找妳。」→「……明天我有課。」（她掛掉了。）',ec.dialogue[i+1].text==='……明天我有課。'&&ec.dialogue[i+2].text==='（她掛掉了。）'); }
    G.day=A1+1; run(11.9,12.1); const ph=TH('p:kexin').filter(m=>m.tag==='kx_anniv_photo');
    check('7. 卡片的照片「週年快樂。下次你準備。」改到隔天中午（AA_313 2-3 A）',ph.map(m=>m.text).join('｜')==='📷（一張卡片）｜週年快樂。下次你準備。'&&ph.every(m=>m.day===A1+1&&Math.abs(m.h-12)<0.06),JSON.stringify(ph.map(m=>[m.day,m.h,m.text]))); }
  // ---- 9-6 K6 改期＋兩校互考 ----
  { const W7=termDay('Y1S2',7,3), W8=termDay('Y1S2',8,4), SUN=termDay('Y1S2',8,7); fresh(W7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1);
    let P=TH('p:kexin').filter(m=>m.tag==='kx_quiz_ask'); check('8. K6 第 7 週週三 21:00：互考三句（第三句 AA_209）、回「好。」／「視訊可以嗎？」',P.map(m=>m.text).join('｜')==='期中前，兩校互考。｜只能出老師上課講過的。冷門學說算犯規。｜考完去吃山下那攤，我請。下週六下午可以嗎？'/* AA_373 #25、#26 */&&JSON.stringify(P[2].ask.opts.map(o=>o.t))==='["好。","視訊可以嗎？"]');
    PHONE.answer(G,P[2].ask.id,1); G.day=W8; run(20.9,21.1); P=TH('p:kexin').filter(m=>m.tag==='kx_k6');
    check('8. 第 8 週週四 21:00 改期：兩句、三種回應',P.map(m=>m.text).join('｜')==='對不起，週六可以改週日嗎？｜我們讀書會的報告被退回來，週六要重做。'&&P[1].ask.opts.length===3);
    PHONE.answer(G,P[1].ask.id,2); run(21.1,21.2); const q=OUT.get(G,'kx_quiz1');
    check('8. 選「我週六都空下來了。」：「……我知道。對不起。週日你多出一題。」、K6_RESPONSE sulk；選了視訊＝週日 14:00 視訊（接起來）',TH('p:kexin').some(m=>m.text==='……我知道。對不起。週日你多出一題。')&&G.flags.K6_RESPONSE==='sulk'&&!!q&&q.day===SUN&&q.verb==='接起來',JSON.stringify(q));
    const play=async(pk)=>{ said=[]; opts=[]; picks=pk.slice(); G.day=SUN; G.hour=13.9; q.state='planned'; G.events.done.ev_kexin_reschedule=0; await OUT.go(GM,q); return lines(); };
    let L=await play(['中等']); check('8. 出中等的題：「她想了很久，答對一半。」「……一半。回去我再讀一次。」（AA_373 #25；這一場是視訊＝不說「走，山下那攤。」，改「……下次見面，山下那攤。」AA_373 第 6-2 節第 8 題）、KX_QUIZ win 1',L.includes('她想了很久，答對一半。')&&L.includes('杜可昕：……一半。回去我再讀一次。')&&!L.includes('杜可昕：走，山下那攤。')&&L.includes('杜可昕：……下次見面，山下那攤。')&&G.flags.KX_QUIZ.win===1&&JSON.stringify(opts[0])==='["簡單的（上課講過的定義）","中等的（課本後面的例題）","冷門的（某一說的少數見解）"]',JSON.stringify(L));
    L=await play(['冷門']); check('8. 冷門的：「犯規。冷門學說是犯規。」「（她把那一題劃掉。）」「……下一題。」（AA_373 #25）、lose 1（累計，win 還是 1）',L.includes('杜可昕：犯規。冷門學說是犯規。')&&L.includes('（她把那一題劃掉。）')&&L.includes('杜可昕：……下一題。')&&G.flags.KX_QUIZ.lose===1&&G.flags.KX_QUIZ.win===1);
    L=await play(['簡單']); check('8. 簡單的（視訊）：「兩個都對。……下次見面，山下那攤。」（AA_373 第 6-1 節「平手。各付各的。」改「兩個都對。……走，山下那攤。」，視訊照第 6-2 節第 8 題）、draw 1',L.includes('杜可昕：兩個都對。……下次見面，山下那攤。')&&!L.includes('杜可昕：平手。各付各的。')&&G.flags.KX_QUIZ.draw===1);
    { const rv=STORY_EVENTS.find(e=>e.id==='ev_revisit_y1_kexin'), last=rv.dialogue.filter(l=>l.text&&/^結果都在吵/.test(l.text)), pickK=()=>(last.find(l=>(l.if?EVENTS.cond(l.if):true)&&!(l.unless&&EVENTS.cond(l.unless)))||{}).text, k6=pickK(); const F0=G.flags.KX_K6_EXAM, Q0=G.flags.KX_QUIZ; delete G.flags.KX_K6_EXAM; delete G.flags.KX_QUIZ; const no=pickK(); G.flags.KX_QUIZ={win:1,lose:0,draw:0}; const old=pickK(); G.flags.KX_K6_EXAM=F0; G.flags.KX_QUIZ=Q0;
      check('8. V2-K6：做過 K6 互考（KX_K6_EXAM）＝重訪日 1「結果都在吵考古題。」；沒做＝「結果都在吵要吃哪一家。」（AA_313 第 2 節第 30 列，原本「結果都在吵我出的考題。」）；舊存檔只有 KX_QUIZ 也算做過（BB_167 4-3 句子＋BB_96 9-10 分支，AA-C 10-17 確認）',F0===true&&k6==='結果都在吵考古題。'&&no==='結果都在吵要吃哪一家。'&&old==='結果都在吵考古題。'&&rv.dialogue.some(l=>l.text==='我喔？我本來以為我們會一直吵架。'),JSON.stringify([F0,k6,no,old])); }
    { const rv=STORY_EVENTS.find(e=>e.id==='ev_revisit_y1_kexin'), i=rv.dialogue.findIndex(l=>l.label==='k_bbq'), seg=rv.dialogue.slice(i+1,rv.dialogue.findIndex((l,k)=>k>i&&l.goto==='mine')), say=()=>seg.filter(l=>l.text&&(!l.if||EVENTS.cond(l.if))&&!(l.unless&&EVENTS.cond(l.unless))).map(l=>l.text);
      const K0=G.flags.KX_JOKE, M0=G.flags.KX_MET_NOODLE_TEAM; G.flags.KX_MET_NOODLE_TEAM=true; G.flags.KX_JOKE='kexin'; const a=say(); G.flags.KX_JOKE='zhe'; const b=say(); G.flags.KX_JOKE=K0; G.flags.KX_MET_NOODLE_TEAM=M0;
      check('8. 重訪日 1 選中秋烤肉：可昕贏（KX_JOKE kexin）＝「那天阿哲輸給我三個冷笑話。」；阿哲贏＝「那天我輸給阿哲。我回去練了。」（AA_313 第 2 節第 30 列）',JSON.stringify(a)==='["那天阿哲輸給我三個冷笑話。"]'&&JSON.stringify(b)==='["那天我輸給阿哲。我回去練了。"]',JSON.stringify([a,b])); }
    q.state='planned'; G.day=SUN; G.hour=15; const ex=OUT.expire(G); for(const x of ex) OUT.onMissed(GM,x); run(15,15.1);
    check('8. 沒去週日的互考：考古題的照片「下次你逃不掉。」',TH('p:kexin').some(m=>m.text==='下次你逃不掉。')); }
  // ---- 9-7 K6b ----
  { const W9=termDay('Y1S2',9,3); fresh(W9,20.9,'dorm',{introDone:true,dating_kexin:true}); run(20.9,21.1); const P=TH('p:kexin').filter(m=>m.tag==='kx_essay');
    check('9. K6b 第 9 週週三 21:00：「剛考完。四頁。手好痛。」「申論題，就是把理由說給一個不認識你的人聽。」（AA_335 T1）三個回覆；記 KX_DIR {Y1:reasons}',P.map(m=>m.text).join('｜')==='剛考完。四頁。手好痛。｜申論題，就是把理由說給一個不認識你的人聽。'&&JSON.stringify(P[1].ask.opts.map(o=>o.t))==='["那妳說給誰聽？","我也是這學期才發現。","四頁？"]'&&G.flags.KX_DIR.Y1==='reasons',JSON.stringify(P.map(m=>m.text)));
    check('9. 「我也是這學期才發現。」→「那我們發現得一樣晚。」（AA_335 T1b：拿掉「很好，沒有人贏。」）',JSON.stringify((P[1].ask.opts[1].say||[]).map(m=>m.text))==='["那我們發現得一樣晚。"]',JSON.stringify(P[1].ask.opts[1].say));
    PHONE.answer(G,P[1].ask.id,2); run(21.1,21.2); check('9. 「四頁？」→「老師說兩頁就夠。我停不下來。」',TH('p:kexin').some(m=>m.text==='老師說兩頁就夠。我停不下來。')); }
  // ---- 9-8 手機小事 ----
  { const D=STORY.DAILY_PHONE, ids=['kx2_steps','kx2_yule_hand','kx2_example','kx2_apology','kx2_dumpling','kx2_coffee'];
    check('10. 9-8 六則在每天的手機小事裡（交往中、照週次）',ids.every(id=>D.some(d=>d.id===id)),ids.filter(id=>!D.some(d=>d.id===id)).join(','));
    /* AA_504 第 0 節第 1 點：kx2_late（第 1～2 週）、kx2_azalea（第 3 週）在手機小事永遠不出（第 4 週才開始），改成可昕的動態第 1、2 則（src/data/feed_y1s2.js kx1b、kx2b，原句照用；tests/aa504_505_feed_unit.js）*/
    const FS=fs.readFileSync(path.join(ROOT,'src/data/feed_y1s2.js'),'utf8');
    check('10. kx2_late、kx2_azalea 不在手機小事，原句搬到可昕大一下的動態第 1、2 則（AA_504 第 0 節）',!D.some(d=>d.id==='kx2_late'||d.id==='kx2_azalea')&&FS.includes("id:'kx1b',who:'kexin',t:'W1三 08:40',st:'認識',pic:'政大宿舍的走廊，予樂的房門關著',say:'開學了。予樂說這學期要每天早到。今天她遲到。'")&&FS.includes("id:'kx2b',who:'kexin',t:'W3六 10:30',st:'認識',pic:'政大山上的杜鵑花，霧很重',say:'政大也有杜鵑花。可是開在山上，要爬上去才看得到。'"));
    const ex=D.find(d=>d.id==='kx2_example'); fresh(termDay('Y1S2',10,2),10,'dorm',{dating_kexin:true}); const T=CALENDAR.termOf(G.day);
    check('10. 「答案被拿去當範例」：K6b 之後才成立',ex.term(T)&&!ex.ok(G,G.day)&&(G.flags.KX_DIR={Y1:'reasons'},ex.ok(G,G.day))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
