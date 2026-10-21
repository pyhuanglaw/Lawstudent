// BUG-0830-EMPTYSTOP-1018（BB-C 10-18，舊版 adb309db）：經濟系轉法律系 8/29 晚上快轉／睡覺，多一個 8/29 26:30（8/30 凌晨 2:30）的空停點，之後很久才到 8/30 07:30。
// 現在的流程（d91ebf4a 起 8/29 05:00 就轉法律系）：經濟系在家快轉的上限是 8/29 05:00；8/29 晚上在法律系宿舍不是放假（床邊沒有「快轉」），睡覺直接到 8/30 07:30。
// 這支把這幾件事鎖住，不需要瀏覽器。用法：node tests/bug0830_emptystop_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/holff3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], picks=[], G=null, cards=[], phoneCalls=[], onPhone=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; },
  phoneThread:async(th,o)=>{ phoneCalls.push({th,skip:!!(o&&o.skip),day:G.day,hour:G.hour,pend:PHONE.pending(G).map(m=>m.ask.id)}); if(onPhone) await onPhone(); }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h, now=()=>Tm(G.day,G.hour);
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; cards=[]; phoneCalls=[]; onPhone=null; GM.npc={}; if(STORY._fy) STORY._fy.reset(); };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const FAM=id=>{ meet(id); R(id,30,10,10); };
const noodle=()=>{ PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','classmate_bohan','classmate_xinci']) meet(id); };
const atHome=()=>{ const H=HOME.rec(G); H.at=true; H.day=G.day; const B=HOME.lawBreak(G); H.lbreak=B.key; H.brk=B.key; H.bskip={key:B.key,n:0,last:-1}; };
/* 照時間跑手機規則（每 step 小時一次，跨日）*/
const runTo=(key,h,step)=>{ step=step||0.25; const t1=Tm(D(key),h); let t=now(); while(t<t1-1e-9){ t=Math.min(t1,t+step); G.day=Math.floor(t/24); G.weekday=wdOf(G.day); G.hour=t-G.day*24; STORY.phoneRules(GM); PHONE.tick(G); } };
const msg=tag=>(G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.th+'|'+(m.from||'')+':'+m.text);
const at=tag=>{ const m=(G.msgs||[]).find(x=>x.tag===tag); return m?CALENDAR.dateOf(m.day).key.slice(5)+' '+m.h:null; };
const lbl=t=>{ const d=Math.floor(t/24), x=CALENDAR.dateOf(d), hh=t-d*24, m=Math.round(hh*60); return x.m+'/'+x.d+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const ptsOf=(key)=>HOME.breakPts(Object.assign({},G,{day:D(key)})).map(p=>CALENDAR.dateOf(p.day).key.slice(5)+'@'+p.h+':'+p.k);
(async()=>{
  const T29=Tm(D('2025-08-29'),5), T30=Tm(D('2025-08-30'),7.5);
  // 1. 經濟系休學在家（8/28 晚上）：快轉三個選項都不超過 8/29 05:00
  fresh('2025-08-28',21,'home',{PLAYED_Y0:false,dating_kexin:true,KX_FIRST_MSG:true,Y0_MOVED_OUT:true,LEAVE_WEEK:6}); G.stage='econ';
  const O=HOME.y0ffOpts(G)||[];
  check('1. 經濟系在家 8/28 21:00：快轉的終點都不超過 8/29 05:00（轉法律系那一刻）',O.length===4&&O.filter(o=>o.to!=null).every(o=>o.to<=T29+1e-6),JSON.stringify(O.map(o=>o.t+' '+(o.to!=null?lbl(o.to):'-'))));
  // 2. 一路快轉：停在 8/29 05:00 以前（有事先停）；不會停在 8/29 凌晨 2:30 這種沒有事的時間；到了 05:00 toLawDue 成立
  const stops=[]; for(let k=0;k<20&&now()<T29-1e-6;k++){ const why=await HOME.y0Jump(GM,HOME.y0FfEnd()); stops.push(lbl(now())+' '+why); }   /* 中途收到訊息會停（遊戲裡打開手機、按「跳過」接著跳）：這裡直接再跳 */
  check('2. 從 8/28 21:00 一路快轉：停點都不超過 8/29 05:00、沒有停在凌晨 2:30，最後停在 8/29 05:00',now()===T29&&!stops.some(x=>x.startsWith('8/29 02:30')),JSON.stringify(stops));
  check('2b. 停在 05:00：toLawDue 成立（下一格就轉法律系）',STORY.toLawDue(G),lbl(now()));
  // 3～5. 8/29 晚上在法律系宿舍（經濟系轉過來的）
  for(const [name,h] of [['22:30',22.5],['凌晨 02:00（還算 8/29：hour 26）',26]]){
    fresh('2025-08-29',15.5,'dorm',{PLAYED_Y0:true,dating_kexin:true,KX_FIRST_MSG:true,Y0_MOVED_OUT:true,LEAVE_WEEK:6});
    G.outings=[]; OUT.plan(G,{id:'y0_e37',ev:'ev_y0_e37',day:D('2025-08-30'),h:14,late:0.25,place:'臺北的家',title:'臺北的家（載可昕上山）14:00'});
    runTo('2025-08-29',22.5,0.25); G.day=D('2025-08-29'); G.weekday=wdOf(G.day); G.hour=h;
    if(h===22.5) check('3. 8/29 晚上在法律系宿舍：不是放假，床邊沒有「快轉」（不會有快轉的停點）',HOME.lawBreak(G)==null&&!HOME.ffOpts(G),JSON.stringify(HOME.ffOpts(G)));
    cards=[]; await STORY.sleepNow(GM);
    check((h===22.5?'4':'5')+'. 8/29 '+name+' 睡覺：直接到 8/30 07:30、只有一張日期卡',now()===T30&&cards.length===1&&cards[0][0]==='8 月 30 日',lbl(now())+' '+JSON.stringify(cards));
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
