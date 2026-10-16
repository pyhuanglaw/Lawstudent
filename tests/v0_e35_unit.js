// v0 ★E35 考試的前一晚（BB_104 8b-18；AA_154 A41）：18:00 私訊、從家裡出發到女舍門口、3D 版三個回答、沒到＝21:30 電話版（在家、睡著被叫醒、人在外面）——不需要瀏覽器。
// 修改前沒有 ev_y0_e35（全部失敗）。用法：node tests/v0_e35_unit.js
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
let spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ spawned.push([id,x,z]); return null; };
const atHome=()=>{ G.stage='econ'; G.flags.Y0_MOVED_OUT=true; G.flags.LEAVE_WEEK=6; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
(async()=>{
  const D=STORY.dayOfKey('2025-07-10'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_e35'), evh=STORY_EVENTS.find(e=>e.id==='ev_y0_e35h');
  check('0. E35 兩個事件都在、7/10 是週四',!!ev&&!!evh&&CALENDAR.dateOf(D).wd===4); if(!ev||!evh){ console.log('FAILED '+fails); process.exit(1); }
  let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
  // 1. 18:00 私訊＋出發選單
  fresh(D,17.5,'campus'); atHome(); run(17.5,17.9); check('1. 18:00 以前沒有',!PHONE.sent(G,'y0_e35_ask'));
  run(18,18.1); const K=TH('p:kexin').map(m=>m.text); const q=OUT.get(G,'y0_e35');
  check('1. 18:00 可昕「今晚九點，我宿舍樓下。」「五分鐘就好。明天要早睡。」；出發選單「女舍門口 21:00」（goto 校園）',K.includes('今晚九點，我宿舍樓下。')&&K.includes('五分鐘就好。明天要早睡。')&&G.flags.E35_ASKED&&q&&q.goto&&q.goto.zone==='campus'&&q.h===21,JSON.stringify(K));
  const snap=JSON.stringify(G);
  // 2. 從家裡出發 → 20:45 到女舍門口 → 走到她旁邊就演
  G.hour=20.3; menus=[]; script=['女舍門口']; await loop();
  check('2. 20:15 起家裡的選單有「出發：女舍門口 21:00」；出發＝捷運＋公車 30 分鐘（20:18 出發＝20:48 到）、在校園、不在家',menus[0]&&menus[0].some(t=>t.includes('女舍門口 21:00'))&&G.zone==='campus'&&!HOME.at(G)&&Math.abs(G.hour-20.8)<1e-6,JSON.stringify(menus[0])+' '+G.hour);
  spawned=[]; GM.npc={}; run(G.hour,G.hour); check('2. 20:45～21:15 可昕站在女舍門口（長椅東邊）',spawned.some(s=>s[0]==='kexin'&&s[1]===STORY.E35_AT.x&&s[2]===STORY.E35_AT.z));
  check('2. 在女舍門口：演；電話版的家裡事件不演',EVENTS.check(ev)&&!EVENTS.check(evh));
  G.zone='gongguan'; check('2. 不在校園：不演',!EVENTS.check(ev)); G.zone='campus'; G.hour=21.3; check('2. 21:15 以後：3D 版不演（等 21:30 電話）',!EVENTS.check(ev)); G.hour=20.8;
  said=[]; script=['海邊']; await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20)); let L=said.map(x=>x.t);
  check('3. 3D 版：「（她暑假住的宿舍樓下。路燈。……）」→「今天的假設題很簡單。」「考完，要去哪裡？」→ 海邊「好。那我帶一顆西瓜。……不要問為什麼。」→「明天考場見。……不對。考完見。」',
    L[0]==='（她暑假住的宿舍樓下。路燈。她手上拿著准考證，翻過來又翻回去。）'&&L[1]==='今天的假設題很簡單。'&&L[2]==='考完，要去哪裡？'&&L.includes('好。那我帶一顆西瓜。……不要問為什麼。')&&L.includes('明天考場見。……不對。考完見。')&&!L.some(t=>/電話裡/.test(t)),JSON.stringify(L));
  check('3. E35_PLAN＝sea、E35_MET＝true、E35_DONE；演完回臺北的家（30 分鐘，22:00 以前）',G.flags.E35_PLAN==='sea'&&G.flags.E35_MET===true&&G.flags.E35_DONE===true&&HOME.at(G)&&G.hour<22,G.hour);
  check('3. 一次：兩個事件都不再演',!EVENTS.check(ev)&&!EVENTS.check(evh));
  // 4. 沒出門、在家：21:30 電話版（在家的選單那一輪）
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.hour=20; said=[]; menus=[]; script=['在家讀書','照樣','睡一整天']; await loop();
  L=said.map(x=>x.t); const i0=L.indexOf('（電話裡，她那邊有翻紙的聲音。）');
  check('4. 在家讀書到 22:00（會錯過女舍門口）→ 21:30 以後的那一輪：電話版（第一句換成「（電話裡，她那邊有翻紙的聲音。）」），沒有樓下那句',i0>=0&&L[i0+1]==='今天的假設題很簡單。'&&!L.some(t=>/宿舍樓下。路燈/.test(t))&&L.includes('你睡，我在旁邊看書。……開玩笑的，我也要睡。'),JSON.stringify(L));
  check('4. E35_PLAN＝sleep、E35_MET＝false、E35_DONE；還在家',G.flags.E35_PLAN==='sleep'&&G.flags.E35_MET===false&&G.flags.E35_DONE===true&&HOME.at(G));
  // 5. 在家先睡：21:30 手機響（叫醒）→ 電話版；第三家
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.hour=19.5; said=[]; menus=[]; script=['睡覺','照樣','吃妳說的那家']; await loop();
  L=said.map(x=>x.t);
  check('5. 19:30 在家睡覺 → 21:30 被電話叫醒（同一天）→ 電話版；「你記得？我說過的店有十家。」「第三家。」「……對。」',G.day===D&&L.includes('（電話裡，她那邊有翻紙的聲音。）')&&L.includes('你記得？我說過的店有十家。')&&L.includes('第三家。')&&L.includes('……對。')&&G.flags.E35_PLAN==='shop'&&G.flags.E35_MET===false,JSON.stringify(L)+' day '+G.day+' h '+G.hour);
  // 6. 人在外面（不是女舍門口）：21:30 電話版在外面演
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); HOME.rec(G).at=false; G.zone='gongguan'; G.hour=21.2; run(21.2,21.2); check('6. 21:15～21:30 在公館：還不演',!EVENTS.check(ev));
  run(21.5,21.5); check('6. 21:30 在公館：電話版（E35_PHONE）在外面演、家裡那個不演',G.flags.E35_PHONE&&EVENTS.check(ev));
  said=[]; script=['海邊']; await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20)); L=said.map(x=>x.t);
  check('6. 電話版演完：不帶回家（E35_MET＝false）',L[0]==='（電話裡，她那邊有翻紙的聲音。）'&&G.flags.E35_MET===false&&!HOME.at(G)&&G.zone==='gongguan');
  // 7. 睡著叫醒的時間：coreCallAt
  G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.hour=20; check('7. coreCallAt：7/10 20:00＝21:30；演完以後沒有',STORY.coreCallAt(G)===21.5&&(()=>{ G.flags.E35_DONE=true; return STORY.coreCallAt(G)==null; })());
  // 8. 法律系不受影響
  fresh(termDay('Y1S1',4,3),18.5,'dorm'); G.stage='law'; run(18,19); check('8. 法律系的存檔：沒有 E35 的訊息',!PHONE.sent(G,'y0_e35_ask')&&!G.flags.E35_ASKED);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
