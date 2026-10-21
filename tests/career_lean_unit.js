// 1A-01 職涯傾向 STORY.careerLean(G)（AA_315；BB_202 4-1、4-2）——不需要瀏覽器。
//   1. 只讀現有紀錄：A（法服週六、C02 隊輔、C09、C16、YT_LEASE_HELP）、B（讀書會、法律系起的自習、GRAD_SCHOOL_DISCUSSION、grad_read_done、C10）、
//      C（子晴 PLAYTESTED／CONTEST_DAY、C08／C11／C12、交換回來、法律系那幾年的通識）各自堆高，top 就是那一項；
//   2. 平手：先比大四那一年（總分 − CAREER_Y4_BASE）；再平手 B → A → C；三項都是 0＝B；
//   3. 起點：STUDY_AT_LAW＝第一次在法律系那一刻的自習時數（經濟系讀的不算）；CAREER_Y4_BASE 只在大四上第 1 週記，之後讀檔的舊存檔不補；
//   4. 不上畫面：只有 ?dev 看得到（game3d.js devCareer）；careerLean 不改任何旗標、關係；畢業以後（postgrad3d.js）讀它決定第一份工作、尾聲的路（AA_319）。
// 修改前全部 FAIL。用法：node tests/career_lean_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const mk=(day)=>{ fresh(day!=null?day:D('2027-10-01'),15,'campus',{}); G.stage='law'; G.stats=G.stats||{}; G.stats.study=0; G.vac={reg:{}}; G.acts={att:{}}; G.courses={grades:{}}; return G; };
  const L=()=>STORY.careerLean(G);
  check('0. 有 STORY.careerLean、careerTick', typeof STORY.careerLean==='function'&&typeof STORY.careerTick==='function');
  if(typeof STORY.careerLean!=='function'){ console.log('FAILED'); process.exit(1); }
  mk(); G.flags.LAWCLUB_SAT_VISITS=6; G.vac.reg['C02@Y1']='done'; G.stats.study=12;
  let r=L(); check('1. A：常去法服週六、大一暑假隊輔、很少自習＝A', r.top==='A'&&r.A===9&&r.B===1, JSON.stringify(r));
  mk(); for(const d of [10,17,24,31,38]) G.acts.att['public_law_group@'+d]={end:'full'}; G.acts.att['public_law_group@45']={end:'left'}; G.stats.study=55; G.flags.grad_read_done=true; SOCIAL.remember('heroine_05','GRAD_SCHOOL_DISCUSSION','研究所');
  r=L(); check('1. B：讀書會 5 次（中途離開不算）、自習 55 小時、讀完學姊的文章、聊過研究所＝B（5＋5＋2＋2）', r.top==='B'&&r.B===14, JSON.stringify(r));
  mk(D('2028-09-10')); G.flags.EXCHANGE_ROUTE='JP'; SOCIAL.remember('heroine_04','PLAYTESTED','測遊戲'); G.courses.grades.Y2S1={}; G.courses.grades.Y0S1={chinese_y0:'很好',ge_y0s1:'過了'};
  const ge=COURSES.list.find(c=>c.kind==='general'&&!/^Y0/.test(c.term||'')); if(ge) G.courses.grades.Y2S1[ge.id]='不錯';
  r=L(); check('1. C：常幫子晴測遊戲、日本交換回來（8/5 以後）、法律系的通識＝C（經濟系那年的國文不算）', r.top==='C'&&r.C===2+6+(ge?1:0), JSON.stringify(r));
  mk(D('2028-07-01')); G.flags.EXCHANGE_ROUTE='JP'; check('1. 交換還沒回來（7/1）：不算', L().C===0);
  // 2
  mk(); check('2. 三項都是 0（舊存檔）＝B', L().top==='B');
  mk(); G.flags.LAWCLUB_SAT_VISITS=3; G.vac.reg['C08@Y2']='done'; check('2. A、C 平手（3、3）、沒有大四起點：B → A → C＝A', L().top==='A', JSON.stringify(L()));
  mk(); G.flags.LAWCLUB_SAT_VISITS=3; G.vac.reg['C08@Y2']='done'; G.flags.CAREER_Y4_BASE={A:3,B:0,C:0};
  check('2. A、C 平手、大四那一年 C 比較多（A 大四 +0、C 大四 +3）＝C', L().top==='C', JSON.stringify(L()));
  // 3
  mk(); G.stage='econ'; G.stats.study=40; G.flags.STUDY_AT_LAW=undefined; delete G.flags.STUDY_AT_LAW; STORY.careerTick(G); const e0=G.flags.STUDY_AT_LAW;
  G.stage='law'; STORY.careerTick(G); G.stats.study=60;
  check('3. 經濟系那一年不記；第一次在法律系記 STUDY_AT_LAW＝40；之後自習 20 小時＝B 2', e0===undefined&&G.flags.STUDY_AT_LAW===40&&L().B===2, JSON.stringify({e0,s:G.flags.STUDY_AT_LAW,B:L().B}));
  const y4=CALENDAR.dateOf(STORY.termDay('Y4S1',1,2)).key, y4w3=CALENDAR.dateOf(STORY.termDay('Y4S1',3,2)).key;
  mk(D(y4)); G.flags.STUDY_AT_LAW=0; G.flags.LAWCLUB_SAT_VISITS=4; STORY.careerTick(G);
  check('3. 大四上第 1 週：記 CAREER_Y4_BASE＝當下的三個總分', JSON.stringify(G.flags.CAREER_Y4_BASE)===JSON.stringify({A:4,B:0,C:0}), JSON.stringify(G.flags.CAREER_Y4_BASE));
  mk(D(y4w3)); G.flags.STUDY_AT_LAW=0; STORY.careerTick(G); check('3. 大四上第 3 週才讀檔、沒有起點：不補', G.flags.CAREER_Y4_BASE==null);
  // 4
  mk(); G.flags.LAWCLUB_SAT_VISITS=2; const snap=JSON.stringify(G.flags), relSnap=JSON.stringify(SOCIAL.rel('heroine_05')); L(); L();
  check('4. careerLean 只讀：不改旗標、不改關係', JSON.stringify(G.flags)===snap&&JSON.stringify(SOCIAL.rel('heroine_05'))===relSnap);
  { const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const used=[]; for(const f of fs.readdirSync(path.join(ROOT,'src'))){ if(!/\.js$/.test(f)) continue; const t=fs.readFileSync(path.join(ROOT,'src',f),'utf8'); if(/careerLean/.test(t)) used.push(f); }
    check('4. 畫面上只有 ?dev 看得到（game3d.js devCareer 只在網址有 dev 時建立）；讀它的只有畢業以後（postgrad3d.js：第一份工作、尾聲祐廷的路，AA_319），其他檔案還沒有（主線 7 接進來時才加）', /const DEV_Q=typeof location!=='undefined'&&\/\[\?&\]dev\\b\/\.test/.test(g3)&&/function devCareer\(\)\{ if\(!DEV_Q/.test(g3)&&used.sort().join()==='game3d.js,postgrad3d.js,story3d.js', used.join()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
