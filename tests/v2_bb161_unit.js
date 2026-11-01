// BB_161（BB-B 大一下 BB 人物事件實作核對）要改程式的 17 件（⑱ 等 AA-B）——不需要瀏覽器。用法：node tests/v2_bb161_unit.js
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
  const evs=STORY_EVENTS.concat(typeof STORY_EVENTS_V11!=='undefined'?STORY_EVENTS_V11:[]), EV=id=>evs.find(e=>e.id===id);
  // ① W2b：週五 15:00 才回「請飲料」→ 21:00 的邀約裡有學姊那三句
  { const dJ=termDay('Y1S2',3,2), dI=termDay('Y1S2',3,5); fresh(dI,9,'campus',{}); G.stage='law'; PHONE.join(G,'family_law','法律系直屬家族');
    G.day=dJ; G.hour=21.2; STORY.phoneRules(GM); PHONE.tick(G); const j=(G.msgs||[]).find(m=>m.tag==='fam_joke_y1s2'&&m.ask);
    G.day=dI; G.hour=9; STORY.phoneRules(GM); PHONE.tick(G); const early=PHONE.sent(G,'fam_dinner_inv');
    G.hour=15; PHONE.answer(G,j.ask.id,0); STORY.phoneRules(GM); G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G);
    const T=(G.msgs||[]).filter(m=>m.tag==='fam_dinner_inv').map(m=>m.text);
    check('① 週五 09:00 還不排邀約；15:00 回「請飲料」→ 21:00 的邀約有學姊三句',!early&&T.includes('……學弟，你是認真的？')&&T.includes('我以為那是客套話。'),JSON.stringify(T)); }
  // ② Z5：Z4 之後第 12～15 週的週五；午場超過第 17 週排第 17 週週六
  { const e=EV('ev_zhiruo_film_night'); check('② Z5 邀約：第 12～15 週的週五',JSON.stringify(e.weeks)==='[12,13,14,15]'&&JSON.stringify(e.weekday)==='[5]');
    const f15=termDay('Y1S2',15,5); fresh(f15,22,'campus',{zrDeclineDay:f15}); G.stage='law'; SOCIAL.meet('heroine_02','cafe'); R('heroine_02',30,0,0);
    const s17=termDay('Y1S2',15,6); G.day=s17;   /* 上限改第 15 週週六 6/6（AA_198 第 5 節；變數名照舊）*/ G.hour=9.6; STORY.phoneRules(GM); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='zr_matinee_ask');
    check('② 第 15 週拒絕早場 → 午場排上限 6/6（第 15 週週六）09:30',!!m&&m.day===s17&&m.h>=9.5&&m.h<=9.65,m&&JSON.stringify([m.day-s17,m.h]));
    const f12=termDay('Y1S2',12,5); fresh(f12+1,9,'campus',{zrDeclineDay:f12}); G.stage='law'; SOCIAL.meet('heroine_02','cafe'); G.day=f12+22; G.hour=9.6; STORY.phoneRules(GM); PHONE.tick(G);
    check('② 第 12 週拒絕 → 照舊第 15 週週六（拒絕後第 3 週）',(G.msgs||[]).some(x=>x.tag==='zr_matinee_ask'&&x.day===f12+22)); }
  // ⑤⑥⑦ 表情、旁白
  { const q6=EV('ev_ziqing_secret_game').dialogue, i=q6.findIndex(l=>l.text==='（她說得很認真，然後自己笑到趴在桌上。）');
    check('⑤ Q6「笑到趴在桌上」那一拍換 laugh',i>0&&q6[i-1].speaker==='heroine_04'&&q6[i-1].expression==='laugh'&&q6[i-1].text===undefined);
    const q5=EV('ev_ziqing_show').dialogue, a=q5.find(l=>l.text==='欸不是，我手在抖。'), k=q5.findIndex(l=>/她按錯一個和弦/.test(l.text||'')), mic=q5.find(l=>l.text==='（對著麥克風）這個 bug 我下次修。');
    check('⑥ Q5：後台那句 serious；按錯和弦那一拍 embarrassed；對麥克風 laugh',a.expression==='serious'&&q5[k-1].expression==='embarrassed'&&q5[k-1].text===undefined&&mic.expression==='laugh');
    const w3=EV('ev_grad_debate').dialogue.find(l=>l.text==='（你講了十分鐘。她中間打斷你三次。）'); check('⑦ W3「（你講了十分鐘。……）」是旁白',!!w3&&w3.speaker===null); }
  // ⑧ W3b：沒有立場＝照舊開頭（AA_398 第 16 列改「這篇。我畫線的是這一句。」）
  { fresh(30,20,'campus',{}); G.stage='law'; const dd=termDay('Y1S2',5,3); G.events.last.ev_grad_debate=dd; PHONE.join(G,'lawclub_study','法服讀書會'); G.day=dd+14; G.hour=20.6; STORY.phoneRules(GM); PHONE.tick(G);
    const T=(G.msgs||[]).filter(m=>m.tag==='w3b_0').map(m=>m.text); check('⑧ 沒有 W3_STANCE＝第一則照舊開頭「這篇。我畫線的是這一句。」',T[0]==='這篇。我畫線的是這一句。',JSON.stringify(T.slice(0,2))); }
  // ⑨ 方奕廷：訊息後面接一句旁白
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('⑨ 方奕廷水耕那則：AA_209 附錄B §2 換成兩則（旁白「（實際講了二十分鐘。）」一起拿掉）',/seq\('npc_fangyt',\['黃金葛可以剪一段下來水耕','週末我拿瓶子過去 隔壁而已'\]\)/.test(src)&&!/text:'（實際講了二十分鐘。）'/.test(src)); }
  // ⑩ 家教「我先想想」：月底前三天才說的玩家，答覆後第 3 天問、名額留 7 天
  { const d0=D('2026-03-28'); fresh(d0,16,'campus',{tutorThinkDay:d0}); G.stage='law'; G.day=d0+3; G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G);
    const ask=(G.msgs||[]).find(m=>m.tag==='mx_tutor_ask2'); check('⑩ 3/28 說「我先想想」→ 3/31 21:00「家教的事，想好了嗎？」',!!ask&&ask.day===d0+3&&ask.text==='家教的事，想好了嗎？');
    G.day=D('2026-04-01'); G.hour=13; STORY.phoneRules(GM); PHONE.tick(G); check('⑩ 4/1（月底過了、答覆後 4 天）名額還在',!PHONE.sent(G,'mx_tutor_gone'));
    G.day=d0+8; G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G); check('⑩ 答覆後第 8 天：名額給別人了',PHONE.sent(G,'mx_tutor_gone')&&!!G.flags.TUTOR_GONE); }
  // ⑫ KN：交往中三個 KX_CAR 都先接電話「新年快樂。」再收 KN（AA_224 1-6 e6c064a3；AA_295 不是假設題了；原本只給 E25 選③、說「今年不開玩笑了」）
  { const ny=STORY.lunarNewYear(); fresh(ny-1,14,'campus',{dating_kexin:true,KX_CAR:'camp',FAMILY_LAND_Y1:'teacher'}); G.stage='law'; STORY.phoneRules(GM); G.hour=22.1; PHONE.tick(G);
    const M=(G.msgs||[]).filter(m=>m.th==='p:kexin'), K=M.map(m=>m.text); const ic=M.findIndex(m=>m.tag==='kx_kn_call'), ik=M.findIndex(m=>m.tag==='kx_kn_y1');
    check('⑫ 交往中（KX_CAR camp 也一樣）：22:00 以前先接電話「新年快樂。」，再收 KN；沒有「今年不開玩笑了」',ic>=0&&ik>ic&&K[ic+1]==='新年快樂。'&&!K.includes('今年不開玩笑了。新年快樂。'),JSON.stringify(K)); }
  // ⑬ K6 之後第一次換一天＝照 K6_RESPONSE；再下一次＝「好，這週換一天。」
  { const wk=EV('ev_kexin_our_day_wk'); fresh(termDay('Y1S2',10,5),19.5,'campus',{dating_kexin:true,K6_RESPONSE:'understand'}); G.stage='law';
    const mk=(day,id)=>{ OUT.plan(G,{id,ev:'ev_kexin_our_day_wk',day,h:19,place:'公館',title:'x'}); OUT.plan(G,{id:'other_'+day,ev:'ev_x',day,h:18,place:'公館',title:'y'}); OUT.get(G,'other_'+day).state='done'; const q=OUT.get(G,id); q.state='missed'; G.day=day; G.hour=20; wk.outingMissed(G,GM,q); PHONE.tick(G); };
    mk(termDay('Y1S2',10,5),'kx_od_a'); mk(termDay('Y1S2',11,5),'kx_od_b'); const K=(G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text);
    check('⑬ 理解→「上次是我改期，這次換你。好，改天。」（AA_209；只一次）→ 下一次「好，這週換一天。」',K[0]==='上次是我改期，這次換你。好，改天。'&&K[1]==='好，這週換一天。',JSON.stringify(K)); }
  // ⑭ 她自己的事件那一週不排固定格
  { const d2=termDay('Y1S2',2,5); fresh(d2,22,'campus',{dating_kexin:true,KX_OUR_DAY:{day:'fri',mode:'ntu'}}); G.stage='law'; OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:d2,h:19,place:'x',title:'x'}); OUT.get(G,'kx_our_day1').state='done';
    OUT.plan(G,{id:'kx_trip_y1s2',ev:'ev_kexin_trip_spring_y1',day:D('2026-04-03'),h:8,place:'x',title:'x'});
    const weeks=[]; for(let w=3;w<=12;w++){ G.day=termDay('Y1S2',w,1); G.hour=9; STORY.phoneRules(GM); for(const q of OUT.rec(G)) if(/^kx_od_/.test(q.id)&&q.state==='planned'){ weeks.push(CALENDAR.termOf(q.day).week); q.state='done'; } }
    check('⑭ 選週五：第 6（春假旅行）、8（K6）、9（生日）週不排；其他照排（K7 週年改到 10/17，第 4 週照排）',JSON.stringify(weeks)==='[3,4,5,7,10,11,12]',JSON.stringify(weeks)); }
  // ⑮⑯ 生日：豆花那兩句在山下那一家；老闆那句數實際吃過的次數
  { const b=EV('ev_kexin_birthday_y1s2').dialogue, is=b.findIndex(l=>l.bg==='nccu_food'), id=b.findIndex(l=>l.text==='你第一次跟我單獨吃的，是豆花。');
    check('⑮ 豆花那兩句在換到山下那一家的背景以後',is>0&&id>is);
    const boss=b.find(l=>l.speaker==='老闆'); fresh(30,19,'campus',{K1_ORDER:'let_her',NCCU_FOOD_N:3}); check('⑯ 老闆那句：K1 讓她點＋實際吃過 3 次以上（含今天）',EVENTS.cond(boss.if));
    G.flags.NCCU_FOOD_N=2; check('⑯ 2 次＝沒有',!EVENTS.cond(boss.if));
    fresh(30,19,'campus',{}); G.events.done.ev_kexin_yule_pass=1; G.events.done.ev_kexin_birthday_y1=1; await EVENTS.runLines([{scene:'木柵大學・山下的小吃街',bg:'nccu_food'},{scene:'木柵大學・山下的小吃街',bg:'nccu_food'}],{id:'t'});
    check('⑯ 舊存檔：照完成的事件補算，同一個事件只算一次（予樂、12/3＋這次＝3）',G.flags.NCCU_FOOD_N===3,String(G.flags.NCCU_FOOD_N)); }
  // ⑱ SK03：P4d 沒發生的玩家，第 8 週以後第一次去重修的週五＝走廊直接遇到阿勳（完整自我介紹 → 小福邀約）
  { const e=EV('ev_sk03_lunch'), f9=termDay('Y1S2',9,5); fresh(f9,12,'putong',{}); G.stage='law'; const ok9=EVENTS.check(e); G.day=termDay('Y1S2',5,5); G.weekday=5; const ok5=EVENTS.check(e);
    G.day=f9; G.events.done.ev_econ_hallway=1; const okDone=EVENTS.check(e); delete G.events.done.ev_econ_hallway;
    check('⑱ 第 9 週週五、沒有 P4d＝開 SK03；第 5 週（P4d 的窗口內）不開；演過 P4d 的照舊',ok9&&!ok5&&!okDone,JSON.stringify([ok9,ok5,okDone]));
    picks=['今天不行']; said=[]; await EVENTS.run(e); const L=lines(); check('⑱ 開頭＝「盧正勳。你經濟系那年的室友。……你該不會連我都忘了。」→「週五中午，我們在學活。你要來就來。」；記 MET_XUN',L[0]==='阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'&&L[1]==='阿勳：週五中午，我們在學活。你要來就來。'&&!!G.flags.MET_XUN,JSON.stringify(L.slice(0,2)));
    G.day=f9+7; G.flags.SK03_ASKED=null; said=[]; picks=['今天不行']; await EVENTS.run(e); check('⑱ 下一週：「學活。走不走？」（不再自我介紹）',lines()[0]==='阿勳：學活。走不走？',JSON.stringify(lines().slice(0,1))); }
  // 第 3 節：法律審查標記
  { const src=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); check('第 3 節：B4、B5、以安和 Alison 吵架的 LEGAL_REVIEW_REQUIRED 拿掉（BB_115 L482、L483）',!/比例原則的方向，不給結論（BB_105 4-3）——LEGAL_REVIEW_REQUIRED/.test(src)&&!/法律同 B4：LEGAL_REVIEW_REQUIRED/.test(src)&&!EV('ev_an_yu_argument').legal_review); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
