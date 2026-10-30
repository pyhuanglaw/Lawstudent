// V3-D14 杜鵑花第二張＋交換說明會（AA_177 第 6 節、4-2；AA_143 2-2、2-3；AA_30 大二下；BB_105 B9）——不需要瀏覽器。
// 檢查：3/11 12:40 以安的照片；3/15 09:00 學校信箱＋以安「我會去。坐第一排。」；EXPO_Y2 活動 3/18（四）12:20～13:10 博雅 101；事件三個區、EXPO_COUNTRY、柏翰和以安三句（兩個都認識才有）；沒去＝20:00 簡報照片。用法：node tests/v3_d14_unit.js
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
  const NG='g:noodle_team'; const NM={'沈以安':'以安','許柏翰':'柏翰'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const az=D('2027-03-11'), mail=D('2027-03-15'), ex=D('2027-03-18');
  check('0. 3/11 週四在大二下第 3 週；3/15 週一、3/18 週四在第 4 週',termDay('Y2S2',3,4)===az&&termDay('Y2S2',4,1)===mail&&termDay('Y2S2',4,4)===ex);
  const grp=(day,h)=>{ fresh(day,h,'dorm'); meet('heroine_01'); PHONE.join(G,'noodle_team','麵店團'); };
  grp(az,12); run(12,12.6);
  check('1. 3/11 12:36 還沒有杜鵑花',!PHONE.sent(G,'y2_azalea'));
  run(12.67,12.8);
  check('1. 12:40 以安在麵店團傳照片',txt(NG).slice(-1)[0]==='heroine_01:📷（杜鵑花。和去年同一個位置。）',JSON.stringify(txt(NG)));
  fresh(az,13,'dorm'); meet('heroine_01'); run(13,13.2);
  check('1. 不在麵店團：沒有',!PHONE.sent(G,'y2_azalea'));
  grp(mail,8.5); run(8.5,8.95);
  check('2. 3/15 08:57 還沒有信',!PHONE.sent(G,'y2_expo_mail'));
  run(9,9.5); const sys=(G.msgs||[]).filter(m=>m.th==='sys').map(m=>(m.name||'')+':'+m.text);
  check('2. 09:00 學校信箱「國際事務處：交換學生甄選說明會，3/18 中午，博思教學館大教室。」',sys.includes('學校信箱:國際事務處：交換學生甄選說明會，3/18 中午，博思教學館大教室。'),JSON.stringify(sys));
  check('2. 以安在麵店團「我會去。坐第一排。」',txt(NG).includes('heroine_01:我會去。坐第一排。'));
  fresh(mail,10,'dorm'); run(10,10.2);
  check('2. 不在麵店團：只有信、沒有以安那句',PHONE.sent(G,'y2_expo_mail')&&!PHONE.sent(G,'y2_expo_an'));
  const A=ACTIVITIES.list.find(a=>a.id==='EXPO_Y2');
  check('3. EXPO_Y2：博思 101、3/18 才有（3/11、3/25 沒有）、12:20～13:10、聽說明會、事件 ev_exchange_expo_y2',!!A&&A.zone==='boya'&&A.room==='101'&&ACTIVITIES.on(A,ex)&&!ACTIVITIES.on(A,az)&&!ACTIVITIES.on(A,ex+7)&&Math.abs(A.t0-12.333)<0.01&&Math.abs(A.t1-13.167)<0.01&&A.verb==='聽說明會'&&A.event==='ev_exchange_expo_y2');
  fresh(ex,12.25,'boya'); G.weekday=4;
  check('3. 12:15 可以參加（開始前 15 分鐘）；12:50 過一半就不行',ACTIVITIES.canJoin(G,A)&&(()=>{ G.hour=12.8; return !ACTIVITIES.canJoin(G,A); })());
  const EV=ev('ev_exchange_expo_y2');
  const play=async(pick,who)=>{ fresh(ex,12.4,'boya'); for(const w of who) meet(w); said=[]; opts=[]; picks=[pick]; await EVENTS.run(EV); return {L:L0(),O:opts[0]||[]}; };
  let r=await play(0,['heroine_01','classmate_bohan']);
  check('4. 認識以安：「（以安坐在第一排。）」「日本。我國中就決定了。」',r.L[0]==='（以安坐在第一排。）'&&r.L[1]==='以安：日本。我國中就決定了。',JSON.stringify(r.L.slice(0,2)));
  check('4. 三個區：日本、美國、台灣；選日本＝EXPO_COUNTRY 日本',JSON.stringify(r.O)==='["（坐到日本那一區）","（坐到美國那一區）","（坐到台灣那一區）"]'&&G.flags.EXPO_COUNTRY==='日本');
  check('4. 兩個都認識：散場三句（AA_255 第 4 節第 7 點的改稿）',r.L.slice(-3).join('｜')==='柏翰：交換要成績多少？｜以安：簡章第三頁有寫，我等一下傳給你。｜柏翰：好。',JSON.stringify(r.L.slice(-3)));
  r=await play(1,['heroine_01']);
  check('5. 不認識柏翰：沒有那三句；美國',!r.L.some(t=>/交換要成績/.test(t))&&G.flags.EXPO_COUNTRY==='美國');
  r=await play(2,[]);
  check('5. 都不認識：只有選區；台灣',r.L.length===0&&G.flags.EXPO_COUNTRY==='台灣',JSON.stringify(r.L));
  grp(ex,19.5); run(19.5,19.95);
  check('6. 沒去：19:57 還沒有照片',!PHONE.sent(G,'y2_expo_missed'));
  run(20,20.2);
  check('6. 沒去：20:00 以安「📷（說明會的簡報）」「重點在第七頁。」',txt(NG).slice(-2).join('｜')==='heroine_01:📷（說明會的簡報）｜heroine_01:重點在第七頁。');
  grp(ex,19.5); ACTIVITIES.rec(G).att['EXPO_Y2@'+ex]={h:12.33,end:'full'}; run(19.5,20.5);
  check('6. 有去（聽完）：沒有照片',!PHONE.sent(G,'y2_expo_missed'));
  grp(ex,19.5); ACTIVITIES.rec(G).att['EXPO_Y2@'+ex]={h:12.33,end:'left',lh:12.6}; run(19.5,20.5);
  check('6. 中途離開也算去了：沒有照片',!PHONE.sent(G,'y2_expo_missed'));
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
