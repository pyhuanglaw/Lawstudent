// v0 經濟系 → 法律系（AA_154 2-4b 第 4～6 點）：8/31 早上在家醒來 → 3b② → 備份 → 字卡 → 3b③ → stage law、9/17 21:12 宿舍；帶過去的旗標；可昕第一則多「第二次的大一」——不需要瀏覽器。
// 修改前沒有 STORY.toLaw（全部失敗）。用法：node tests/v0_tolaw_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start0'};   /* 舊開局（9/17）；新遊戲預設是宿營（CAMP-L1），新開局的轉場在 start_b_unit 第 14、15 項 */
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
let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
let cards=[], backups=[], entered=[]; GM.titleCard=async(a,b)=>{ cards.push(a+'｜'+(b||'')); }; GM.backupNow=(label,key)=>{ backups.push({label,key,saidAt:said.length,day:G.day,stage:G.stage}); return true; }; GM.enter=async(z,sp)=>{ entered.push(z); G.zone=z; };
(async()=>{
  check('0. STORY.toLaw、toLawDue 在',typeof STORY.toLaw==='function'&&typeof STORY.toLawDue==='function'); if(typeof STORY.toLaw!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const D31=STORY.dayOfKey('2025-08-31');
  fresh(D31-1,22,'campus',{Y0_MOVED_OUT:true,LEAVE_WEEK:6,Y0_LEFT:true,E36_PACT:'weekly',E25_ANSWER:'only_me',E35_PLAN:'sea',Y0_STICKY:true,dating_kexin:false,KX_FIRST_MSG:true}); G.stage='econ'; G.money=31234;
  G.events.done.ev_y0_e37=1; { const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; }
  G.outings=[{id:'y0_e37',ev:'ev_y0_e37',day:D31-1,h:14,state:'planned'},{id:'z_other',day:D31+3,h:14,state:'planned'}];   /* BUG-E37-TOLAW（BB-C 10-18）：轉法律系時 E37 的約不能被清掉 */
  check('1. 8/30 晚上還不換',!STORY.toLawDue(G));
  let fadeOn=false; const fade0=GM.fade, say0=GM.say, sayFade=[]; GM.fade=async on=>{ fadeOn=!!on; }; GM.say=async(w,t)=>{ sayFade.push([t,fadeOn]); return say0(w,t); };
  said=[]; cards=[]; backups=[]; entered=[]; script=['睡覺']; await loop(); const L=said.map(x=>x.t); GM.fade=fade0; GM.say=say0;
  const a=L.indexOf('暑假剩下的日子，過得很快。'), b=L.indexOf('書桌上，經濟學原理還沒收起來。'), c=L.indexOf('開學第一週，你走進法律系館A。沒有人知道你來過這個校園。'), d=L.indexOf('重修的經濟學原理排在週五早上，普通教學館。你閉著眼睛也找得到。');
  check('2. 8/31 早上在家醒來：先 3b② 四句（暑假剩下的日子…經濟學原理還沒收起來）',a>=0&&b===a+3,JSON.stringify(L.slice(0,8)));
  check('2. 3b② 之後、換階段之前先備份（「經濟系那一年的最後一天」，fatiao3d_backup_y0end；備份時還是經濟系 8/31）',backups.length===1&&backups[0].label==='經濟系那一年的最後一天'&&backups[0].key==='y0end'&&backups[0].saidAt===b+1&&backups[0].stage==='econ'&&backups[0].day===D31,JSON.stringify(backups));
  check('2. 黑幕字卡「2025 年 9 月　首都帝大法律系　大一」→ 3b③ 四句',cards.includes('2025 年 9 月　首都帝大法律系　大一｜')&&c>b&&d===c+3,JSON.stringify(cards));
  check('2. 3b③ 播的時候黑幕已經拿掉（2026-10-16 瀏覽器抓到：黑幕 #fade 蓋住對話框、攔住點擊，玩家停在一片黑）；換到宿舍以後黑幕也拿掉',sayFade.filter(x=>STORY.LAW_WEEK12.includes(x[0])).length===4&&sayFade.filter(x=>STORY.LAW_WEEK12.includes(x[0])).every(x=>!x[1])&&!fadeOn,JSON.stringify(sayFade.filter(x=>STORY.LAW_WEEK12.includes(x[0]))));
  check('3. 換成法律系：stage law、第 1 天（9/17 週三）21:12、宿舍、不在家',G.stage==='law'&&G.day===1&&G.weekday===3&&Math.abs(G.hour-21.2)<1e-6&&G.zone==='dorm'&&entered[entered.length-1]==='dorm'&&!HOME.at(G),JSON.stringify({st:G.stage,d:G.day,h:G.hour,z:G.zone}));
  check('3. 可昕：dating_kexin＝true、KX_FIRST_MSG＝false；認識的人：MET_XUN、MET_PINYU、KNOWS_TANG；PLAYED_Y0',G.flags.dating_kexin===true&&G.flags.KX_FIRST_MSG===false&&G.flags.MET_XUN&&G.flags.MET_PINYU&&G.flags.KNOWS_TANG&&G.flags.PLAYED_Y0);
  check('3. 帶過去：E36_PACT、E25_ANSWER、E35_PLAN、Y0_STICKY、錢都還在',G.flags.E36_PACT==='weekly'&&G.flags.E25_ANSWER==='only_me'&&G.flags.E35_PLAN==='sea'&&G.flags.Y0_STICKY&&G.money===31234);
  check('3b. 轉法律系時其他還沒去的約清掉，E37（8/30 木柵大學校門）的約留著（BB-C 10-18：8/29 轉過去以後 8/30 不演、電話也不打）',Array.isArray(G.outings)&&G.outings.some(q=>q.id==='y0_e37')&&!G.outings.some(q=>q.id==='z_other'),JSON.stringify((G.outings||[]).map(q=>q.id)));
  check('3. 經濟系的事件不再觸發（stage law）',!EVENTS.check(STORY_EVENTS.find(e=>e.id==='ev_y0_e36'))&&!STORY.toLawDue(G));
  // 4. 可昕的第一則（法律系第一天）：玩過經濟系的多一句
  said=[]; script=[0]; GM.choose=async o=>0; await STORY._v1.kexinFirstMsg(GM,'night'); const K=said.map(x=>x.t);
  check('4. 法律系第一天可昕的第一則：先「第二次的大一。我們都是重考上來的。」再「今天讀到哪了？」（AA_295）',K[0]==='第二次的大一。我們都是重考上來的。'&&K[1]==='今天讀到哪了？',JSON.stringify(K.slice(0,3)));
  fresh(5,21,'dorm',{KX_FIRST_MSG:false}); G.stage='law'; said=[]; await STORY._v1.kexinFirstMsg(GM,'night'); check('4. 從法律系開始的玩家：沒有那一句',said[0]&&said[0].t==='今天讀到哪了？');
  // 5. 不在家（例：8/31 早上人在校園）：toLawDue 也成立（S.tick 那一條）；法律系存檔永遠不成立
  fresh(D31,7,'campus',{LEAVE_WEEK:6}); G.stage='econ'; check('5. 05:00 以後人在校園：toLawDue 成立；04:30 不成立（05:00＝休學在家快轉的終點，BUG-E37-LATE-0830）',STORY.toLawDue(G)&&(()=>{ G.hour=5; const a=STORY.toLawDue(G); G.hour=4.5; return a&&!STORY.toLawDue(G); })());
  fresh(D31,7,'campus'); G.stage='law'; check('5. 法律系的存檔：不成立',!STORY.toLawDue(G));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
