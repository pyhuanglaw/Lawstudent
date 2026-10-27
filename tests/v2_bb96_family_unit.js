// 交接包 v2（BB_96 2-1、2-2、BB_97 2-9）：學姊 W2b 家族聚餐、W2c 家族群組的三件事、「誰有車？」——不需要瀏覽器。修改前沒有（第 1 項失敗）。
// 檢查：大一下第 3 週週二 Kevin 的玩笑（三種回法、SAID_TREAT_SIS）；週五的邀約（有 SAID_TREAT_SIS 學姊多三句；去／這次不行）；誰有車（SAID_HAS_CAR）；
//   第 4 週週五 18:30 的出遊；咖哩店兩種版本、載人那一段、FAMILY_DINNER／TREATED_FAMILY；當晚 21:30 三件事（給所有人、TREATED_FAMILY 換第三件）
// 用法：node tests/v2_bb96_family_unit.js
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
(async()=>{
  const e=ev('ev_family_dinner');
  check('W2b：家族聚餐事件在',!!e);
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const dJ=termDay('Y1S2',3,2), dI=termDay('Y1S2',3,5), dD=termDay('Y1S2',4,5), dd=d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
  check('日子：玩笑 3/10（第 3 週週二）、邀約 3/13（週五）、聚餐 3/20（第 4 週週五）',dd(dJ)==='3/10'&&dd(dI)==='3/13'&&dd(dD)==='3/20',JSON.stringify([dd(dJ),dd(dI),dd(dD)]));
  const FT='g:family_law', fam=()=>(G.msgs||[]).filter(m=>m.th===FT), last=n=>fam().slice(-n).map(m=>(m.from||'')+':'+m.text), askOf=re=>fam().filter(m=>m.ask&&re.test(m.text)).slice(-1)[0];
  const setup=(grp)=>{ fresh(dJ,18,'dorm'); if(grp!==false) PHONE.join(G,'family_law','法律系直屬家族'); };
  /* 玩笑 */
  { setup(); run(18,21.2); const m=askOf(/罰她出來吃飯/);
    check('第 3 週週二 21:00 Kevin「學姊上學期聚餐遲到一分鐘。」「這學期罰她出來吃飯。全家族。」；兩種回法（不回也可以）',JSON.stringify(last(2))==='["kevin:學姊上學期聚餐遲到一分鐘。","kevin:這學期罰她出來吃飯。全家族。"]'&&m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["那學姊來，我請全家族一輪飲料。謝謝她的書。","（貼圖）"]',JSON.stringify(last(2)));
    PHONE.answer(G,m.ask.id,0); check('說要請飲料：Kevin「學弟好勇。」學姊「好啊。」；SAID_TREAT_SIS',JSON.stringify(last(2))==='["kevin:學弟好勇。","heroine_05:好啊。"]'&&G.flags.SAID_TREAT_SIS===true,JSON.stringify(last(2)));
    setup(); run(18,21.2); PHONE.answer(G,askOf(/罰她/).ask.id,1); check('貼圖：Kevin「至少有人回。」；沒有 SAID_TREAT_SIS',last(1)[0]==='kevin:至少有人回。'&&!G.flags.SAID_TREAT_SIS);
    setup(false); run(18,21.2); check('不在家族群組：沒有',!fam().length); }
  /* 邀約＋誰有車 */
  const toInvite=(treat)=>{ setup(); if(treat) G.flags.SAID_TREAT_SIS=true; run(18,21.2); G.day=dI; run(18,21.5); };
  { toInvite(true); const inv=askOf(/永康街/), car=askOf(/誰有車/);
    check('有 SAID_TREAT_SIS：週五 21:00 Kevin「下週五六點半，永康街那家咖哩。全家族。」（AA_459 2-1 加「下」）＋學姊三句',JSON.stringify(fam().filter(m=>Math.abs(m.h-21)<0.01&&m.day===dI).map(m=>(m.from||'')+':'+m.text))==='["kevin:下週五六點半，永康街那家咖哩。全家族。","heroine_05:……學弟，你是認真的？","heroine_05:我以為那是客套話。","heroine_05:好，六點半。我會準時，你們也不要遲到。"]'&&inv&&JSON.stringify(inv.ask.opts.map(o=>o.t))==='["去。","這次不行。"]',JSON.stringify(last(6)));
    check('接著 Kevin「家聚要搬兩箱飲料，誰有車？」（回「我有。」）',!!car&&JSON.stringify(car.ask.opts.map(o=>o.t))==='["我有。"]');
    PHONE.answer(G,car.ask.id,0); check('「我有。」：Kevin「學弟有車！」學姊「……好。之後有用。」；SAID_HAS_CAR',JSON.stringify(last(2))==='["kevin:學弟有車！","heroine_05:……好。之後有用。"]'&&G.flags.SAID_HAS_CAR===true,JSON.stringify(last(2)));
    PHONE.answer(G,inv.ask.id,0); run(21.5,21.6); const q=OUT.get(G,'fam_dinner_y1s2');
    check('「去。」：排出遊——第 4 週週五 18:30 永康街的咖哩店（ev_family_dinner）',!!q&&q.day===dD&&q.h===18.5&&q.ev==='ev_family_dinner',JSON.stringify(q));
    toInvite(false); check('沒有 SAID_TREAT_SIS：只有 Kevin 那一句',!fam().some(m=>/客套話/.test(m.text))&&!!askOf(/永康街/));
    toInvite(false); PHONE.answer(G,askOf(/永康街/).ask.id,1); run(21.5,21.6); check('「這次不行。」：不排',!OUT.get(G,'fam_dinner_y1s2')); }
  /* 聚餐 */
  { const dinner=async(flags)=>{ fresh(dD,18.5,'dorm',Object.assign({SIS_W1:true,met_sis:true},flags||{})); await EVENTS.run(e); return lines(); };   /* 已經認識她（SIS_W1）：還沒認識的開頭多兩句自我介紹（AA_470 5-1），驗在 tests/aa470_sis_b12_unit.js */
    const nm=CHARACTERS.heroine_05.name;
    let L=await dinner({SAID_TREAT_SIS:true,SAID_HAS_CAR:true});
    check('有 SAID_TREAT_SIS：「（看菜單三十秒）我要辣的。……飲料學弟請，咖哩我請。」「我不是在客氣喔。」（Kevin 遲到七分鐘。）「Kevin，下次的地方你選。」＋載人；TREATED_FAMILY',
      JSON.stringify(L)===JSON.stringify([nm+'：（看菜單三十秒）我要辣的。……飲料學弟請，咖哩我請。',nm+'：我不是在客氣喔。','Kevin 遲到七分鐘。',nm+'：Kevin，下次的地方你選。','家聚結束，你順路載三個人回學校。學姊坐後座，一路在問學弟妹下學期選什麼課。'])&&G.flags.TREATED_FAMILY===true&&SOCIAL.has('heroine_05','FAMILY_DINNER')&&SOCIAL.has('heroine_05','TREATED_FAMILY'),JSON.stringify(L));
    L=await dinner({}); check('沒有 SAID_TREAT_SIS：「二，今天我請。」「下次誰都不要遲到喔。」；沒有載人；沒有 TREATED_FAMILY',JSON.stringify(L)===JSON.stringify([nm+'：（看菜單三十秒）我要辣的。今天我請。',nm+'：下次誰都不要遲到喔。','Kevin 遲到七分鐘。',nm+'：Kevin，下次的地方你選。'])&&!G.flags.TREATED_FAMILY&&SOCIAL.has('heroine_05','FAMILY_DINNER'),JSON.stringify(L)); }
  /* 三件事 */
  { const three=(flags)=>{ fresh(dD,20,'dorm',flags||{}); PHONE.join(G,'family_law','法律系直屬家族'); run(20,21.6); return fam().filter(m=>m.day===dD&&Math.abs(m.h-21.5)<0.01).map(m=>m.text); };
    let L=three(); check('聚餐當晚學姊不在群組發「三件事」（W2c 刪、不改成私訊：AA_218 17-12）；不記 FAMILY_THREE_THINGS',L.length===0&&!SOCIAL.has('heroine_05','FAMILY_THREE_THINGS'),JSON.stringify(L));
    L=three({TREATED_FAMILY:true}); check('TREATED_FAMILY 也一樣沒有',L.length===0,JSON.stringify(L));
    check('記憶的中文說明：FAMILY_DINNER、TREATED_FAMILY、FAMILY_THREE_THINGS',['FAMILY_DINNER','TREATED_FAMILY','FAMILY_THREE_THINGS'].every(k=>!!SOCIAL.MEMORY_LABEL[k])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
