// BB_161（BB-B 大一下 BB 人物事件實作核對）要改程式的 17 件（⑱ 等 AA-B）——不需要瀏覽器。用法：node tests/v2_bb161_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
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
  { check('⑬ 「我們的日子」換一天（CANON-NO-ECON-1112 第三批：這一項拿掉）',!EV('ev_kexin_our_day_wk')); }
  // ⑭ 她自己的事件那一週不排固定格
  { check('⑭ 大一下每週的「我們的日子」（CANON-NO-ECON-1112 第三批：這一項拿掉）',!EV('ev_kexin_our_day')&&!EV('ev_kexin_our_day_wk')); }
  // ⑮⑯ 生日：豆花那兩句在山下那一家；老闆那句數實際吃過的次數
  { const b=EV('ev_kexin_birthday_y1s2').dialogue; check('⑮⑯ 生日那一場換成映月湖（CANON-NO-ECON-1112 第四批：照 AA_874 B 版換字；山下那一家、豆花、老闆那句拿掉）',!b.some(l=>l.bg==='nccu_food'||l.speaker==='老闆'||/豆花/.test(l.text||'')));
    fresh(30,19,'campus',{}); check('⑯ 舊存檔照完成的事件補算的那幾場（CANON-NO-ECON-1112 第三批：這一項拿掉）',STORY.nccuFoodLegacy(G)===0); }
  /* ⑱ SK03（CANON-NO-ECON-1112 第三批：這一項拿掉）*/
  // 第 3 節：法律審查標記
  { const src=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); check('第 3 節：B4、B5、以安和 Alison 吵架的 LEGAL_REVIEW_REQUIRED 拿掉（BB_115 L482、L483）',!/比例原則的方向，不給結論（BB_105 4-3）——LEGAL_REVIEW_REQUIRED/.test(src)&&!/法律同 B4：LEGAL_REVIEW_REQUIRED/.test(src)&&!EV('ev_an_yu_argument').legal_review); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
