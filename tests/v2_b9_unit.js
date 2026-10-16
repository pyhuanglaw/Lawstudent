// V2-B9 可昕的大一下（BB_96 第 9 節，BB 2026-10-14）——不需要瀏覽器。
// 9-1 情人節：2/14 20:00 視訊（出遊「接起來」）；三種天氣、三種回答；KX_VDAY、KX_VDAY_WX、選「我想見妳」記 KX_VDAY_SEE；沒接＝窗戶的照片＋一句，KX_VDAY missed。
// 9-3 K5、9-4 K7（時間、地點是 AA-B 確認前的提案值）。修改前沒有 ev_kexin_valentine_y1（第 1 項失敗）。
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
  let L=await play(['晴天','有效']);
  check('3. 她先問天氣、天氣三個選項、假設題三個選項（BB_96 9-1 原文）',L[0]==='杜可昕：你那邊的天氣？'&&JSON.stringify(opts[0])==='["「晴天。很冷。」","「下雨。」","（把鏡頭轉向窗外）"]'&&JSON.stringify(opts[1])==='["「有效。我們用行動同意了。」","「無效。我們沒簽。」","「我不知道。我想見妳。」"]',JSON.stringify({L0:L[0],o:opts}));
  check('3. 晴天＋有效：「臺北的冷是濕的……」「……寒假還在讀民總的人，回答都這樣。」「她笑。」，最後「情人節快樂。臺北冷，穿厚一點。」',L.includes('杜可昕：臺北的冷是濕的，我這邊是乾的。……加起來剛好。')&&L.includes('杜可昕：……寒假還在讀民總的人，回答都這樣。')&&L.includes('她笑。')&&L[L.length-1]==='杜可昕：情人節快樂。臺北冷，穿厚一點。',JSON.stringify(L));
  check('3. 記 KX_VDAY {1:video}、KX_VDAY_WX {1:sunny}；沒有 KX_VDAY_SEE',G.flags.KX_VDAY[1]==='video'&&G.flags.KX_VDAY_WX[1]==='sunny'&&!G.flags.KX_VDAY_SEE&&G.flags._kxVwx===undefined,JSON.stringify([G.flags.KX_VDAY,G.flags.KX_VDAY_WX]));
  L=await play(['鏡頭','我想見妳']);
  check('4. 鏡頭轉向窗外：「她也把手機轉向她的窗戶。」「交換。」；我想見妳：「嘴角先動了。」「開學第一個週末。我寫進行事曆了。」、KX_VDAY_SEE、WX window',L.includes('她也把手機轉向她的窗戶。')&&L.includes('杜可昕：交換。')&&L.includes('嘴角先動了。')&&L.includes('杜可昕：開學第一個週末。我寫進行事曆了。')&&G.flags.KX_VDAY_SEE===true&&G.flags.KX_VDAY_WX[1]==='window',JSON.stringify(L));
  L=await play(['下雨','無效']); check('4. 下雨＋無效（原文）',L.includes('杜可昕：我這邊也是。那是同一片雨。……氣象不是這樣講的。算了。')&&L.includes('杜可昕：好。那開學以後，我們簽一份。')&&G.flags.KX_VDAY_WX[1]==='rain');
  fresh(VD,19.9,'dorm',{introDone:true,dating_kexin:true}); run(19.9,19.95); G.hour=20.9; const ex=OUT.expire(G); for(const x of ex) OUT.onMissed(GM,x); run(21,21.1);
  const P=TH('p:kexin').map(m=>m.text);
  check('5. 沒接：窗戶的照片＋「你那邊的天氣，我自己查了。情人節快樂。」、KX_VDAY {1:missed}',P.includes('📷（她的窗戶）')&&P.includes('你那邊的天氣，我自己查了。情人節快樂。')&&G.flags.KX_VDAY[1]==='missed',JSON.stringify(P));
  // ---- 9-3 K5「我們的日子」----
  { const M2=termDay('Y1S2',2,1); fresh(M2,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,KX_VDAY_SEE:true}); run(20.9,21.1);
    let P=TH('p:kexin').filter(m=>m.tag==='kx_our_day'); const msg=P.map(m=>m.text);
    check('6. K5 第 2 週週一 21:00：「我們選一天。……」、情人節說過想見她的多一句、「名字很重要。」帶三個日子',msg.join('｜')==='我們選一天。不是約會日，是「我們的日子」。｜開學第一個週末我寫了。現在要決定的是以後。｜名字很重要。'&&JSON.stringify(P[P.length-1].ask.opts.map(o=>o.t))==='["週五晚上。","週六。","週日下午。"]',msg.join('｜'));
    PHONE.answer(G,P[P.length-1].ask.id,2); run(21.1,21.2); P=TH('p:kexin'); const m2=P.find(m=>m.text==='週日下午很好。隔天要上課，我們不會玩太晚。');
    check('6. 選「週日下午。」：她的回覆帶四種方式',!!m2&&JSON.stringify(m2.ask.opts.map(o=>o.t))==='["我開車去政大。","妳來台大。","約在中間。","視訊也算。"]',JSON.stringify(P.map(m=>m.text)));
    PHONE.answer(G,m2.ask.id,0); run(21.2,21.3); const q=OUT.get(G,'kx_our_day1');
    check('6. 選「我開車去政大。」：「好。我負責選宵夜。」、KX_OUR_DAY {sun, nccu}、排同一週週日 14:00（提案值）',TH('p:kexin').some(m=>m.text==='好。我負責選宵夜。')&&JSON.stringify(G.flags.KX_OUR_DAY)==='{"day":"sun","mode":"nccu"}'&&!!q&&q.day===termDay('Y1S2',2,7)&&q.h===14,JSON.stringify({od:G.flags.KX_OUR_DAY,q}));
    picks=[]; said=[]; G.day=q.day; G.hour=13.5; await OUT.go(GM,q); const L=lines();
    check('6. 第一次的那一天：「她把手機給你看。」「我們的行事曆，那一格我寫了字。」「不是「約會」。是「我們」。」',JSON.stringify(L)===JSON.stringify(['她把手機給你看。','杜可昕：我們的行事曆，那一格我寫了字。','杜可昕：不是「約會」。是「我們」。']),JSON.stringify(L));
    fresh(M2,21.2,'dorm',{introDone:true,dating_kexin:true,KX_OUR_DAY:{day:'fri',mode:'video'}}); run(21.2,21.3); const q2=OUT.get(G,'kx_our_day1');
    check('6. 視訊也算＋週五晚上：週五 19:00、接起來',!!q2&&q2.day===termDay('Y1S2',2,5)&&q2.h===19&&q2.verb==='接起來');
    G.day=q2.day; G.hour=20; const ex=OUT.expire(G); for(const x of ex) OUT.onMissed(GM,x); run(20,20.1); G.day+=7; OUT.onMissed(GM,q2); run(20,20.1);
    check('6. 第一次那天沒到：「我等了一下。沒關係，下週同一天。」只一次',TH('p:kexin').filter(m=>m.text==='我等了一下。沒關係，下週同一天。').length===1); }
  // ---- 9-4 K7 週年 ----
  { const A0=STORY.dayOfKey('2026-03-15'), A1=STORY.dayOfKey('2026-03-22'); fresh(A0,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1);
    let P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask'); check('7. K7 一週前 3/15 21:00：「下週日是我們的週年。」「地點你選。……」三個地點',P.map(m=>m.text).join('｜')==='下週日是我們的週年。｜地點你選。我準備一樣東西，你也準備一樣。'&&JSON.stringify(P[1].ask.opts.map(o=>o.t))==='["摩天輪。","政大山下，我們的店。","河堤。"]');
    PHONE.answer(G,P[1].ask.id,0); run(21.1,21.2); const q=OUT.get(G,'kx_anniv1');
    check('7. 選摩天輪：「……回到最高點。好。」、排 3/22 18:00',TH('p:kexin').some(m=>m.text==='……回到最高點。好。')&&!!q&&q.day===A1&&q.h===18,JSON.stringify(q));
    const play=async(pk)=>{ said=[]; opts=[]; picks=pk.slice(); G.day=A1; G.hour=17.5; const qq=OUT.get(G,'kx_anniv1'); qq.state='planned'; G.events.done.ev_kexin_anniversary_y1=0; await OUT.go(GM,qq); return lines(); };
    let L=await play(['票根','第三百六十五圈']);
    check('7. 出門前選準備的東西（四樣）；票根：「她念背面那題，笑出來。」「你學我。」；第幾圈三選一；「……你算過？」「猜的。」「猜得很準。」；最後旁白；KX_ANNIV {1:wheel}',opts[0].length===4&&L.includes('她念背面那題，笑出來。')&&L.includes('杜可昕：你學我。')&&JSON.stringify(opts[1])==='["「第一圈。」","「第三百六十五圈。」","「不用算。」"]'&&L.includes('杜可昕：……你算過？')&&L.includes('祐廷：猜的。')&&L[L.length-1]==='後面幾頁，她說：『回去再看。』'&&G.flags.K7_GIFT==='ticket'&&G.flags.KX_ANNIV[1]==='wheel',JSON.stringify(L));
    L=await play(['什麼都沒','不用算']); check('7. 什麼都沒準備：「你人來了。……這題我放水一次。」；不用算：「好。那就一直轉。」',L.includes('杜可昕：你人來了。……這題我放水一次。')&&L.includes('杜可昕：好。那就一直轉。'));
    fresh(A0,20.9,'dorm',{introDone:true,dating_kexin:true}); run(20.9,21.1); G.day=A1; run(18.9,19.2);
    check('7. 沒選地點：3/22 晚上卡片的照片「週年快樂。下次你準備。」、KX_ANNIV {1:missed}',TH('p:kexin').some(m=>m.text==='週年快樂。下次你準備。')&&G.flags.KX_ANNIV&&G.flags.KX_ANNIV[1]==='missed'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
