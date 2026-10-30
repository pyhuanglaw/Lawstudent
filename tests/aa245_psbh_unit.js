// AA_245（企劃線 2af03a63；任務 AA245-PSBH）沛珊×柏翰沒在一起的版本（玩家和沛珊交往中＝AA_374 第 11 項同一個條件）——不需要瀏覽器。
//   0 讀稿：第 1 節柏翰自己的三句逐字在 AA_245
//   1 大一下期中晚餐（ev_midterm_supper_y1s2）：和沛珊交往中＝AA_409 第 1 節（滷蛋夾一半給你；麵店團已經知道＝一行旁白），接著 AA_245 第 1 節柏翰算麵錢三句（c42a0dd3 更正：並存；認識柏翰才有）；沒交往＝照舊公開
//   2 大一下第 4 週「走出萬才館」（ev_peishan_bohan_w4）：和沛珊交往中＝AA_409 第 2 節她等你收白板（原本 AA_245 第 3 節不演）；沒交往照舊
//   AA_409（企劃線 86016b84；使用者 10-23 選擇題：沛珊大一上期末可以交往）逐字對稿
//   3 大二上第 6 週的分手：ev_peishan_split 交往中不演（AA_374 已做，對照）、ev_peishan_bohan_split 不會演（只留一件）
// 修改前（開發分支 b947f4eb）：第 0 節照樣過，第 1 節「交往中」、第 2 節 FAIL。用法：node tests/aa245_psbh_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES|DORM_ROOM|SYLLABUS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/data/dorm_room_layout.js','src/data/syllabus.js','src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){},build:()=>mkObj()};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  spawnCharacter(id,x,z,o){ const n=Object.assign({id,charId:id,name:(CHARACTERS[id]||{}).name||id,obj:mkObj()},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key, termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; E.npcs=[]; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=ev(id); return e?(e.dialogue||[]).map(l=>l&&l.text).filter(t=>typeof t==='string'):[]; };
const NM=id=>SOCIAL.displayName?SOCIAL.displayName(id):(CHARACTERS[id]||{}).name;

const {execSync}=require('child_process');
let DOC=''; try{ DOC=execSync('git -c core.quotepath=false show 2af03a63:"docs/story_planning/AA_245_沛珊柏翰_沒交往的版本.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
const s1=(DOC.split('## 1.')[1]||'').split('\n## ')[0], bq=s1.split('\n').filter(l=>l.startsWith('> ')).map(l=>l.slice(2).replace(/^(柏翰|阿哲)：/,''));
let D409=''; try{ D409=execSync('git -c core.quotepath=false show 86016b84:"docs/story_planning/AA_409_沛珊大一上期末可以交往_交往中的大一下.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
const NEW=['（沛珊坐在你旁邊。她把碗裡的滷蛋夾了一半，放到你碗裡。）','……喔。','全桌安靜三秒。','對。你們吃你們的。','（Alison 在桌子底下踢了阿哲一腳。）'], OLD=['（柏翰把每個人的麵錢算好，寫在餐巾紙上。）','一個人一百一十五。阿哲你多一顆蛋，一百二十五。','……你連這個都算。'];
const W4=['（讀書會結束。你收白板的時候，沛珊站在門口等。）','今天那一題，你講得很好。……我想多聽你講。',   /* AA_525 2-4 P-6：原「下週那一題，你報。……我想聽你講。」（2026-10-30 AA_525 改稿，企劃線 6081f725f：tests/aa525_promises_unit.js） */
  '（你們一起走出萬才館。柏翰走在前面，一個人。）'], TOLD='（沛珊把碗裡的滷蛋夾了一半，放到你碗裡。沒有人說話。）';
const W4_409=W4.map(t=>t==='今天那一題，你講得很好。……我想多聽你講。'?'下週那一題，你報。……我想聽你講。':t);   /* AA_409 的稿還是原句（AA_525 2-4 改的那一句對 AA_525：tests/aa525_promises_unit.js）*/
check('0. 讀稿：AA_409 第 1、2 節交往中的句子都在稿裡（一字不差；AA_525 改掉的那一句對原句）',!!D409&&[...NEW,...W4_409,TOLD].every(t=>D409.includes(t.replace(/^（|）$/g,''))),J([...NEW,...W4_409,TOLD].filter(t=>!D409.includes(t.replace(/^（|）$/g,'')))));
(async()=>{
  const sup=async(dating,knowBohan)=>{ fresh(termDay('Y1S2',8,3),19,'noodle',Object.assign({DORM_FOUR:true},dating?{dating_classmate_peishan:true}:{})); R('classmate_peishan','FRI'); R('yu','FAM'); if(knowBohan) R('classmate_bohan','FAM'); said=[]; picks=[0,0]; await EVENTS.run(ev('ev_midterm_supper_y1s2')); return said.map(s=>s.t); };
  const a=await sup(true,true), b=await sup(false,true), c=await sup(true,false);
  check('1. 和沛珊交往中：滷蛋夾一半給你、「對。你們吃你們的。」、Alison 踢阿哲（AA_409 第 1 節，照稿順序）；沒有柏翰×沛珊公開那一段',J(a.filter(t=>NEW.includes(t)))===J(NEW)&&!a.some(t=>/對，我們在一起了|滷蛋切成兩半|上禮拜的事/.test(t)),J(a.slice(-6)));
  check('1. 接著柏翰算麵錢三句（AA_245 第 1 節；AA_409 c42a0dd3 更正：兩個並存，滷蛋在前、柏翰在後）',J(a.filter(t=>OLD.includes(t)))===J(OLD)&&a.lastIndexOf(NEW[4])<a.indexOf(OLD[0]),J(a.slice(-4)));
  check('1. 這一場以後，這一桌的人知道了（ROM）：下一次＝一行旁白「沒有人說話」',ROM.knowsOf(G,'zhe','classmate_peishan')&&await (async()=>{ fresh(termDay('Y1S2',8,3),19,'noodle',{dating_classmate_peishan:true}); R('classmate_peishan','FRI'); R('yu','FAM'); R('classmate_bohan','FAM'); ROM.learn(G,'yu','classmate_peishan','present'); said=[]; picks=[0,0]; await EVENTS.run(ev('ev_midterm_supper_y1s2')); const L=said.map(x=>x.t); return L.includes(TOLD)&&!L.includes('全桌安靜三秒。')&&L.indexOf(OLD[0])>L.indexOf(TOLD); })());
  check('1. 沒交往（對照）：照舊公開「對，我們在一起了。你們吃你們的。」，沒有算麵錢',b.some(t=>/對，我們在一起了/.test(t))&&!b.includes(NEW[0])&&!b.includes(NEW[4])&&!b.some(t=>OLD.includes(t)),J(b.slice(-5)));
  check('1. 交往中、還不認識柏翰：照樣是滷蛋那一版（不提柏翰）；沒有公開柏翰那一段、沒有算麵錢',J(c.filter(t=>NEW.includes(t)))===J(NEW)&&!c.some(t=>/對，我們在一起了/.test(t))&&!c.some(t=>OLD.includes(t)),J(c.slice(-4)));
  const w4=ev('ev_peishan_bohan_w4'), pre=dating=>{ fresh(termDay('Y1S2',4,4),18,'wancai',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); return EVENTS.cond(w4.prereq); };
  check('2. 「走出萬才館」：交往中也演（prereq 成立）；沒交往照舊',!!w4&&pre(false)===true&&pre(true)===true,J([pre(false),pre(true)]));
  { pre(true); said=[]; await EVENTS.run(w4); const L=said.map(x=>x.t); pre(false); said=[]; await EVENTS.run(w4); const L0=said.map(x=>x.t);
    check('2. 交往中＝她等你收白板、「今天那一題，你講得很好。……我想多聽你講。」（AA_525 2-4）、柏翰走在前面（AA_409 第 2 節）；沒交往＝沛珊和柏翰一起走出萬才館',J(L)===J(W4)&&L0[0]==='（讀書會結束。沛珊和柏翰一起走出萬才館，一路在爭下週誰報告哪一題。）',J([L,L0])); }
  const sp=dating=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',dating?{dating_classmate_peishan:true}:{}); R('classmate_peishan','FRI'); return EVENTS.check(ev('ev_peishan_split')); };
  const bs=()=>{ fresh(termDay('Y2S1',6,1),12.3,'linze',{}); R('classmate_peishan','FRI'); return EVENTS.cond(ev('ev_peishan_bohan_split').prereq); };
  check('3. 大二上第 6 週的分手只演一件：ev_peishan_split 沒交往照演、交往中不演（AA_374，對照）；ev_peishan_bohan_split 不演',sp(false)===true&&sp(true)===false&&bs()===false,J([sp(false),sp(true),bs()]));
  { const e=SMALLTALK.classmate_bohan.find(x=>typeof x==='object'&&/週三晚上空出來/.test(x.t)); fresh(termDay('Y2S1',8,2),12,'linze',{}); const no=!EVENTS.cond(e.unless); fresh(termDay('Y2S1',8,2),12,'linze',{dating_classmate_peishan:true}); const yes1=EVENTS.cond(e.unless);
    fresh(termDay('Y2S1',8,2),12,'linze',{}); ROM.get(G,'classmate_peishan').sinceDay=termDay('Y1S1',16,5); const yes2=EVENTS.cond(e.unless);
    check('4. 柏翰「這學期我週三晚上空出來了。」只給他和沛珊真的交往過的玩家：和沛珊交往中、或大一下以前就和她交往過＝不說（AA_409 第 3 節）',!!e&&no&&yes1&&yes2,J([no,yes1,yes2])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
