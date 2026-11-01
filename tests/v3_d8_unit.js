// 交接包 v3 D8：校慶法服問答攤大二版（AA_71 2-5）＋哲 2 三種幫法（AA_40、AA_177 第 5 節）——不需要瀏覽器。
// 檢查：日期（11/12 週四、11/14 週六是大二上第 10 週）；法服成員 11/13 21:00 語彤的群組訊息；攤位只有法服成員、阿嬤第一句兩版、三選一、學姊那句看熟度、GRANDMA_TREE_Y2；哲 2 的手機（朋友以上）→ 出發選單 → 三種幫法（記憶）；不回＝下週二起麵店「上次沒事啦。」；阿哲那天晚上不在麵店。用法：node tests/v3_d8_unit.js
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
  const NM={'阿哲':'阿哲','溫書瑀':'學姊','溫學姊':'學姊'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const d12=D('2026-11-12'), d13=D('2026-11-13'), d14=D('2026-11-14'), d17=D('2026-11-17');
  check('0. 11/12 週四、11/14 週六是大二上第 10 週；11/17 週二是第 11 週',CALENDAR.termOf(d12).id==='Y2S1'&&CALENDAR.termOf(d12).week===10&&wdOf(d12)===4&&CALENDAR.termOf(d14).week===10&&wdOf(d14)===6&&wdOf(d17)===2,JSON.stringify([CALENDAR.termOf(d12),CALENDAR.termOf(d14)]));
  // 1. 11/13 群組
  fresh(d13,20,'campus',{lawclub:true}); PHONE.join(G,'lawclub_study','法服讀書會'); run(20,21.2);
  check('1. 法服成員：11/13 21:00 柏翰在法服群組「明天九點半，攤位集合。」（AA_369 第 4 節：語彤不在法服，句子不改；第 7 節第 10 題：說話的人是柏翰）',txt('g:lawclub_study').includes('classmate_bohan:明天九點半，攤位集合。')&&!txt('g:lawclub_study').some(t=>/^heroine_03:/.test(t)),JSON.stringify(txt('g:lawclub_study')));
  fresh(d13,20,'campus',{}); PHONE.join(G,'lawclub_study','法服讀書會'); run(20,21.2); check('1. 不是法服成員：沒有',!txt('g:lawclub_study').some(t=>/攤位集合/.test(t)));
  // 2. 攤位
  const B=ev('ev_fair_booth_y2');
  fresh(d14,11,'campus',{lawclub:true}); check('2. 攤位：11/14 11:00 法服成員會演、不是成員不演',EVENTS.check(B,{skipNear:true})||(()=>{ const n=B.near; B.near=null; const r=EVENTS.check(B); B.near=n; return r; })());
  { fresh(d14,11,'campus',{}); const n=B.near; B.near=null; const r=EVENTS.check(B); B.near=n; check('2. 沒加入法服：攤位裡那一場不演',!r); }
  { const P=ev('ev_fair_booth_y2_pass'); fresh(d14,11,'campus',{}); const n=P.near; P.near=null; const r1=EVENTS.check(P); fresh(d14,11,'campus',{lawclub:true}); const r2=EVENTS.check(P); P.near=n;
    fresh(d14,11,'campus',{}); meet('heroine_03'); meet('heroine_05'); R('heroine_03',...LV.FAM); R('heroine_05',...LV.FAM); said=[]; await EVENTS.run(P); const L=L0().map(t=>t.replace(/^[^：]*柏翰：/,'柏翰：'));
    check('2. 沒加入法服＝路過版（AA-B 682d911f；AA-C 2026-10-18 改顧攤的是柏翰、學姊不出現）：旁白、阿嬤三句、柏翰「阿嬤，這三件要分開問，我先記下來。」（AB65-3（AA_211 附錄 A 語彤一列）；原本語彤「……三件。答案不一樣。我寫下來。」）「下週六早上，B館一樓，有學長姊值班。」（AA_428 §2 第 4 點：原本「隔週週六早上」）、阿嬤；沒有語彤、學姊；沒有選項；GRANDMA_TREE_Y2:heard；法服成員不演',r1&&!r2&&L[0]==='（法服的攤位前，一個阿嬤在說話。顧攤的是柏翰。）'&&L.includes('柏翰：阿嬤，這三件要分開問，我先記下來。')&&!L.some(t=>/……三件。答案不一樣/.test(t))&&L.includes('柏翰：下週六早上，B館一樓，有學長姊值班。')&&!L.some(t=>/語彤|學姊：/.test(t))&&L[L.length-1]==='阿嬤：好啦。這顆給你們。'&&!P.dialogue.some(l=>l.choice)&&!P.spawn&&G.flags.GRANDMA_TREE_Y2==='heard',JSON.stringify(L)); }
  const booth=async(met,fam,pick)=>{ fresh(d14,11,'campus',{lawclub:true}); if(met) G.events.done.ev_sis_festival_booth=1; R('heroine_05',...(fam?LV.FAM:LV.ACQ)); meet('heroine_05'); said=[]; opts=[]; picks=[pick||0]; await EVENTS.run(B); return {L:L0(),O:opts[0]||[]}; };
  let r=await booth(true,true,1);
  check('2. 大一遇過阿嬤：「少年欸，去年那棵樹，你記得嗎？」；三選一；阿嬤自己的三句（AA-B 682d911f）；祐廷兩句（「下週六早上…」AA_428 §2 第 4 點）；學姊不在攤位（AA-C 2026-10-18：大二以後不回法服）；芭樂',r.L[0]==='阿嬤：少年欸，去年那棵樹，你記得嗎？'&&r.O.length===3&&r.L.includes('阿嬤：掉下來的有，樹上的也有。')&&r.L.includes('阿嬤：樹枝擋到我曬衣服。')&&r.L.includes('阿嬤：這次……還沒跟隔壁講。')&&r.L.includes('祐廷：這幾件，答案不一樣。我寫下來。')&&r.L.includes('祐廷：下週六早上，值班的學長姊會在B館一樓。')&&!r.L.some(t=>/^學姊：/.test(t))&&!B.spawn&&r.L.slice(-2).join('｜')==='阿嬤：好啦。這顆給你們。｜（一顆掉下來的芭樂）'&&G.flags.GRANDMA_TREE_Y2==='asked'&&G.flags.GRANDMA_Y2_ASK==='block',JSON.stringify(r));
  r=await booth(false,false,0);
  check('2. 沒遇過：「少年欸，去年你們這攤有個學姊，幫我看過樹的事。」；和學姊不熟＝她不說話',r.L[0]==='阿嬤：少年欸，去年你們這攤有個學姊，幫我看過樹的事。'&&!r.L.some(t=>/^學姊：/.test(t)),JSON.stringify(r.L));
  check('2. 台詞裡沒有人直接說出法律答案（不出現「可以剪」「是妳的」「條文」以外的結論字）',!r.L.some(t=>/可以剪|是妳的|可以吃/.test(t.replace('我可以吃嗎？',''))));
  // 3. 哲 2 手機
  fresh(d12,19,'campus',{}); R('zhe',...LV.FRI); run(19,20.6); const zm=TH('p:zhe').filter(m=>m.tag==='zhe2_msg');
  check('3. 11/12 20:15 祐廷的訊息自動送出「你最近下課都跑好快，在忙什麼？」（AA-B 682d911f）',TH('p:zhe').some(m=>m.from==='player'&&m.text==='你最近下課都跑好快，在忙什麼？'&&Math.abs(m.h-20.25)<0.06));
  check('3. 11/12 20:30 阿哲（朋友）私訊「沒事啦，在練球」，可以回「我去找你。」',zm.length===1&&zm[0].text==='沒事啦，在練球'&&zm[0].ask&&zm[0].ask.opts[0].t==='我去找你。'&&Math.abs(zm[0].h-20.5)<0.06,JSON.stringify(zm));
  PHONE.answer(G,'zhe2_go',0); run(20.65,20.75); const o=OUT.get(G,'zhe2_court');
  check('3. 回「我去找你。」＝出發選單「籃球場 21:00」（2D ev_zhe_court_y2）',!!o&&o.h===21&&o.ev==='ev_zhe_court_y2',JSON.stringify(o));
  fresh(d12,19,'campus',{}); R('zhe',...LV.FAM); run(19,20.6); check('3. 只是有點熟：沒有這則私訊',!TH('p:zhe').some(m=>m.tag==='zhe2_msg'));
  { fresh(d12,19.5,'noodle',{}); const e=STORY.schedEnt(CHARACTERS.zhe,G); check('3. 那天晚上阿哲不在麵店（在籃球場練球）',e&&e.zone==null&&e.away==='在籃球場練球',JSON.stringify(e)); }
  // 4. 三種幫法
  const Z=ev('ev_zhe_court_y2'); const court=async(pick)=>{ fresh(d12,21,'campus',{}); R('zhe',...LV.FRI); said=[]; opts=[]; picks=[pick]; await EVENTS.run(Z); return L0(); };
  let c=await court(0); check('4. 「我筆記借你。」→「你的筆記？……字好醜。」「他還是收下了。」；記 LENT_NOTES_Y2',c.slice(0,3).join('｜')==='阿哲：（籃球場，一個人投籃）教授說，期末再沒過，我就要重修。｜阿哲：重修的時間跟練球撞。｜阿哲：（投進）……沒事啦。'&&c.includes('阿哲：你的筆記？……字好醜。')&&c.includes('他還是收下了。')&&G.flags.LENT_NOTES_Y2===true&&SOCIAL.has('zhe','LENT_NOTES_Y2'),JSON.stringify(c));
  c=await court(1); check('4. 「我陪你念。念完再去吃麵。」→「你要陪我念？」「他停了一下。」「……好。我請。」；記 STUDIED_WITH_ZHE',c.includes('阿哲：你要陪我念？')&&c.includes('他停了一下。')&&c.includes('阿哲：……好。我請。')&&SOCIAL.has('zhe','STUDIED_WITH_ZHE')&&G.flags.ZHE2==='study');
  c=await court(2); check('4. 「這個你要自己來。」→「嗯。我知道。」「他又投了一球。」「……你講話跟我爸一樣。」；沒有記憶、不扣分',c.includes('阿哲：嗯。我知道。')&&c.includes('他又投了一球。')&&c.includes('阿哲：……你講話跟我爸一樣。')&&G.flags.ZHE2==='self'&&!G.flags.LENT_NOTES_Y2);
  // 5. 不回
  const K=ev('ev_zhe_court_skip'); const sk=(day,flags)=>{ fresh(day,18,'noodle',flags); GM.npc.zhe={obj:{position:{x:0,y:0,z:0}},lv:0}; E.npcs=[GM.npc.zhe]; return EVENTS.check(K); };
  check('5. 沒回、沒去：11/17 起第一次在麵店，阿哲只說「上次沒事啦。」；去了的、沒收到私訊的不演；11/16 以前不演',sk(d17,{ZHE2_ASKED:d12})&&!sk(d17,{ZHE2_ASKED:d12,ZHE2:'notes'})&&!sk(d17,{})&&!sk(d17-1,{ZHE2_ASKED:d12}));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
