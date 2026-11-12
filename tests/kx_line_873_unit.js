// 可昕自己的線（CANON-NO-ECON-1112 第四批；企劃線 AA_873 定稿，BB_416）：①～⑥ 的觸發條件、逐字（② 在 tests/y2b_events_unit.js、④ 在 tests/r2y3a_events_unit.js、⑤ 在 tests/r2y3b_events_unit.js）。用法：node tests/kx_line_873_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|Y2B|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{pothos:[0.7,-2.3]}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };

const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const has=t=>said.some(s=>s.t===t);
const all=()=>said.map(s=>s.t);
const run=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const J=JSON.stringify;
(async()=>{
  check('0. 六拍都在、id 不重複（①⑥ 新事件；②③④ 沿用 id；⑤ ev_kexin_k20 在 r2y3b_events.js）', ['ev_kx_s1_deposit','ev_kx_s1_heard','ev_kexin_bad_exam','ev_kexin_tutor_practice','ev_kexin_call_helper','ev_kx_s6_same'].every(id=>STORY_EVENTS.filter(e=>e.id===id).length===1));
  // ① 室友的押金
  { const e=ev('ev_kx_s1_deposit'); check('①. 大一下第 12 週起（順延到第 15 週）、宿舍樓下傍晚', J(e.term)===J(['Y1S2'])&&J(e.weeks)===J([12])&&e.carryTo===15&&e.location==='campus'&&!!e.near); }
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); check('①. 熟悉、在臺北：條件成立（沒在交往也有）', EVENTS.checkAt(ev('ev_kx_s1_deposit')));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); check('①. 還不熟：沒有', !EVENTS.checkAt(ev('ev_kx_s1_deposit')));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); await run('ev_kx_s1_deposit',[0]);
  check('①. 照 AA_873 ① 逐字（選「我看看。」）；記 KX_S1', J(all())===J(['（宿舍樓下的長椅。可昕旁邊坐著她室友，兩個人中間攤著幾張紙。室友眼睛是紅的。）','你來得剛好。你看得懂租約嗎？','她暑假要搬出去住，簽了約、付了押金。現在不想租了，房東說押金一毛都不退。','（你把那幾張紙看了一遍。有幾行字很小。）','你看這麼久，是看懂了還是沒看懂？……我也是。走，去問助教。','（她把租約拿回去，一行一行用手指著念。念到第三頁她停下來。）','這裡。「簽約後反悔，押金不退」是房東自己講的。紙上寫的是另一回事，寫的是搬進去以後的事。','她根本還沒搬進去。','（對室友）我沒有說妳一定拿得回來。我是說，他講的那句話，紙上沒有。妳明天拿這一頁去問他，叫他指給妳看是哪一行。','（室友看著那一頁，過了一會兒，把眼淚擦掉了。）','……妳這樣講我就懂了。我本來以為是我笨。','妳哪裡笨。是字太小。','（室友先上樓了。可昕把剩下的紙疊好。）','我剛剛其實很怕講錯。','可是她聽懂的時候，整個人就不抖了。你有看到嗎。'])&&J(opts[0])===J(['「我看看。」','「這個要問老師吧。」'])&&G.flags.KX_S1===true, J(all()));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); await run('ev_kx_s1_deposit',[1]); check('①. 選「這個要問老師吧。」：她那一句，接同一段', has('我知道要問。可是她現在就在哭，我不能叫她哭到禮拜一。')&&has('她根本還沒搬進去。'));
  fresh('2026-09-15',12,'linze',{KX_MET:true}); R('kexin','FAM'); check('①. 大一下沒遇到：大二上第一次遇到她有那一句', EVENTS.checkAt(ev('ev_kx_s1_heard'))); await run('ev_kx_s1_heard'); check('①. 那一句照稿；記 KX_S1 heard', J(all())===J(['（她說上學期幫室友看了一份租約，押金後來拿回一半。）'])&&G.flags.KX_S1==='heard');
  fresh('2026-09-15',12,'linze',{KX_MET:true,KX_S1:true}); R('kexin','FAM'); check('①. 看過那一場的：沒有那一句', !EVENTS.checkAt(ev('ev_kx_s1_heard')));
  // ③ 學弟妹來問
  { const e=ev('ev_kexin_tutor_practice'); check('③. 大二下第 7 週起、法律系館傍晚', J(e.term)===J(['Y2S2'])&&J(e.weeks)===J([7])&&e.location==='linze'); }
  fresh('2027-04-06',17,'linze',{KX_MET:true}); R('kexin','FAM'); check('③. 熟悉：條件成立', EVENTS.checkAt(ev('ev_kexin_tutor_practice'))); await run('ev_kexin_tutor_practice',[1]);
  check('③. 照 AA_873 ③（選「這裡我補一句。」）；學妹的名牌；記 KX_S3', has('坐。他們說有一題看不懂，來問我。我也不知道為什麼是問我。')&&said.some(s=>s.who==='大一學妹'&&s.t==='因為學姊上次在走廊跟人講話，我們聽得懂。')&&has('你。你是來問的還是來坐的？')&&has('好，你補。（你補完）……對，這個我漏了。你們記他講的那句。')&&has('課本比較對。我只是比較吵。')&&has('她那句話我會記很久。你不要笑。')&&J(opts[0])===J(['（不插話，聽她講完）','「這裡我補一句。」'])&&G.flags.KX_S3===true, J(all()));
  // ④ 人在國外的順延
  fresh('2028-10-30',20,'campus',{KX_MET:true}); R('kexin','FRI'); check('④. 大三上人在臺灣、演過了以後的學期：不再有（once）', (G.events.done.ev_kexin_call_helper=1, !EVENTS.checkAt(ev('ev_kexin_call_helper'))));
  fresh('2028-04-17',20,'campus',{KX_MET:true}); R('kexin','FRI'); check('④. 大三上在臺灣（沒出國）：大三下不再排', !EVENTS.checkAt(ev('ev_kexin_call_helper')));
  // ⑥ 同一件事
  { const e=ev('ev_kx_s6_same'); check('⑥. 大四下第 10 週起（順延到第 14 週）、法律系館', J(e.term)===J(['Y4S2'])&&J(e.weeks)===J([10])&&e.carryTo===14&&e.location==='linze'); }
  fresh('2029-04-25',14,'linze',{KX_MET:true}); R('kexin','FRI'); check('⑥. 朋友：條件成立', EVENTS.checkAt(ev('ev_kx_s6_same'))); await run('ev_kx_s6_same',[1]);
  check('⑥. 照 AA_873 ⑥ 逐字（選「妳想當哪一個？」）；記 KX_S6', J(all())===J(['（系館的布告欄前面。她在看一張國考的時程表，看完把手機收起來。）','很多人問我要考哪一個。','我本來也覺得要先選好。律師、司法官，選一個，然後照那個念。','都可以。我講真的。','不管最後坐在哪一邊，我要做的是同一件事——有人拿著一張看不懂的紙站在那裡，我過去，用他聽得懂的話講一遍。','考不考得上，都可以這樣做。','（她看了你一眼。）','這句不准跟阿哲講。他好不容易才不怕我。'])&&G.flags.KX_S6===true, J(all()));
  check('全部. 六拍不讀 dating_kexin、沒有「如果」「比你」', ['ev_kx_s1_deposit','ev_kexin_bad_exam','ev_kexin_tutor_practice','ev_kexin_call_helper','ev_kx_s6_same'].every(id=>!/dating_kexin|如果|比你/.test(J(ev(id).dialogue))));
  if(fails){ console.log('FAILED '+fails); process.exit(1); } console.log('ALL PASS');
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
